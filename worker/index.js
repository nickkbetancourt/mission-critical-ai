const sampleTelemetry = {
  datadog: {
    fileName: "datadog-monitors.json",
    content: JSON.stringify([
      {
        name: "Rack 17 inlet temperature above threshold",
        overall_state: "Alert",
        tags: ["site:miami", "rack:17", "customer:enterprise-priority"],
        query: "avg(last_5m):avg:gpu.inlet_temp{rack:17} > 84",
      },
      {
        name: "Cooling Loop A flow degradation",
        overall_state: "Alert",
        tags: ["site:miami", "cooling_loop:a"],
        query: "avg(last_5m):avg:cooling.flow_pct{loop:a} < 88",
      },
    ], null, 2),
  },
  grafana: {
    fileName: "grafana-gpu-dashboard.json",
    content: JSON.stringify({
      title: "GPU Factory Operations",
      panels: [
        { title: "Rack 17 GPU Temperature", datasource: { type: "prometheus", uid: "dcgm" } },
        { title: "GPU Power Draw", datasource: { type: "prometheus", uid: "dcgm" } },
        { title: "Kubernetes Pod Evictions", datasource: { type: "loki", uid: "k8s" } },
      ],
    }, null, 2),
  },
  dcgm: {
    fileName: "dcgm-rack-17.csv",
    content: [
      "timestamp,node,gpu_uuid,temperature_c,utilization_gpu,power_w,memory_used_mb",
      "2026-06-25T17:00:00Z,17A,GPU-1,86,94,682,72192",
      "2026-06-25T17:00:00Z,17B,GPU-2,88,97,701,73812",
      "2026-06-25T17:00:00Z,17C,GPU-3,84,92,664,69988",
      "2026-06-25T17:00:00Z,17D,GPU-4,87,95,690,72420",
      "2026-06-25T17:05:00Z,17A,GPU-1,89,96,708,73192",
      "2026-06-25T17:05:00Z,17B,GPU-2,91,98,716,74400",
    ].join("\n"),
  },
  logs: {
    fileName: "k8s-slurm-incident.log",
    content: [
      "2026-06-25T17:03:11Z kubelet node=17A warning thermal-pressure pod=train-enterprise-priority",
      "2026-06-25T17:04:28Z slurm node=17B job=88421 warning requeue requested due to node temperature",
      "2026-06-25T17:06:02Z cluster-autoscaler node=17C drain recommended cooling-loop-a",
      "2026-06-25T17:07:45Z kubelet node=17D eviction threshold crossed memory-pressure=false thermal=true",
    ].join("\n"),
  },
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function createId(prefix) {
  const id = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return prefix + "_" + id;
}

function normalizeSourceType(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("datadog")) return "datadog";
  if (value.includes("grafana")) return "grafana";
  if (value.includes("dcgm") || value.includes("csv")) return "dcgm";
  if (value.includes("kubernetes") || value.includes("slurm") || value.includes("log")) return "logs";
  return value || "unknown";
}

function parseCsv(text) {
  const lines = String(text || "").trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ? values[index].trim() : "";
      return row;
    }, {});
  });
}

function splitCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (const character of String(line || "")) {
    if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  values.push(current);
  return values;
}

function numeric(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function collectGrafanaPanels(value, panels = []) {
  if (!value || typeof value !== "object") return panels;
  if (Array.isArray(value.panels)) {
    for (const panel of value.panels) {
      panels.push(panel);
      collectGrafanaPanels(panel, panels);
    }
  }
  if (Array.isArray(value.rows)) {
    for (const row of value.rows) collectGrafanaPanels(row, panels);
  }
  return panels;
}

function analyzeDatadog(content, fileName) {
  const parsed = JSON.parse(content);
  const monitors = Array.isArray(parsed) ? parsed : Array.isArray(parsed.monitors) ? parsed.monitors : [parsed];
  const alerting = monitors.filter((monitor) => /alert|warn/i.test(String(monitor.overall_state || monitor.state || "")));
  const tags = unique(monitors.flatMap((monitor) => Array.isArray(monitor.tags) ? monitor.tags : []));
  return {
    type: "datadog",
    fileName,
    sourceName: "Datadog",
    status: "processed",
    monitorCount: monitors.length,
    alertCount: alerting.length,
    tags,
    signals: alerting.map((monitor) => monitor.name || monitor.query || "Unnamed Datadog monitor"),
    severity: alerting.length ? "high" : "low",
    summary: alerting.length
      ? alerting.length + " active Datadog monitor(s) indicate service-impacting infrastructure risk."
      : "Datadog monitors imported with no active alert state.",
  };
}

function analyzeGrafana(content, fileName) {
  const dashboard = JSON.parse(content);
  const panels = collectGrafanaPanels(dashboard);
  const titles = panels.map((panel) => panel.title).filter(Boolean);
  const datasources = unique(panels.map((panel) => {
    if (!panel.datasource) return "";
    return typeof panel.datasource === "string" ? panel.datasource : panel.datasource.uid || panel.datasource.type || "";
  }));
  return {
    type: "grafana",
    fileName,
    sourceName: "Grafana",
    status: "processed",
    dashboardTitle: dashboard.title || "Untitled dashboard",
    panelCount: panels.length,
    datasources,
    signals: titles,
    severity: titles.some((title) => /temp|thermal|power|eviction|error/i.test(title)) ? "medium" : "low",
    summary: panels.length + " Grafana panel(s) mapped into the incident context.",
  };
}

function analyzeDcgm(content, fileName) {
  const rows = parseCsv(content);
  const temperatureKey = Object.keys(rows[0] || {}).find((key) => /temp/i.test(key));
  const utilizationKey = Object.keys(rows[0] || {}).find((key) => /util/i.test(key));
  const powerKey = Object.keys(rows[0] || {}).find((key) => /power/i.test(key));
  const gpuKey = Object.keys(rows[0] || {}).find((key) => /gpu|uuid/i.test(key));
  const nodeKey = Object.keys(rows[0] || {}).find((key) => /node|host/i.test(key));
  const temperatures = rows.map((row) => numeric(row[temperatureKey]));
  const utilizations = rows.map((row) => numeric(row[utilizationKey]));
  const powers = rows.map((row) => numeric(row[powerKey]));
  const gpus = unique(rows.map((row) => row[gpuKey]));
  const nodes = unique(rows.map((row) => row[nodeKey]));
  const maxTemperatureC = Math.max(0, ...temperatures);
  const averageUtilization = utilizations.length
    ? Math.round(utilizations.reduce((sum, value) => sum + value, 0) / utilizations.length)
    : 0;
  return {
    type: "dcgm",
    fileName,
    sourceName: "NVIDIA DCGM",
    status: "processed",
    rowCount: rows.length,
    gpuCount: gpus.length,
    nodes,
    maxTemperatureC,
    averageUtilization,
    maxPowerW: Math.max(0, ...powers),
    severity: maxTemperatureC >= 85 ? "high" : maxTemperatureC >= 78 ? "medium" : "low",
    summary: "DCGM parsed " + rows.length + " metric row(s), " + gpus.length + " GPU(s), max temperature " + maxTemperatureC + "C.",
  };
}

function analyzeLogs(content, fileName) {
  const lines = String(content || "").split(/\r?\n/).filter(Boolean);
  const lower = lines.map((line) => line.toLowerCase());
  const thermalEvents = lower.filter((line) => /thermal|temperature|cooling|overheat/.test(line)).length;
  const workloadEvents = lower.filter((line) => /evict|drain|requeue|failed|timeout|oom/.test(line)).length;
  const nodes = unique(lines.flatMap((line) => line.match(/\b(?:node=)?(?:rack-)?17[A-F]\b|\bnode-[\w-]+\b/gi) || []));
  return {
    type: "logs",
    fileName,
    sourceName: "Kubernetes / Slurm",
    status: "processed",
    lineCount: lines.length,
    thermalEvents,
    workloadEvents,
    nodes,
    severity: thermalEvents || workloadEvents ? "high" : "low",
    summary: thermalEvents + " thermal event(s) and " + workloadEvents + " workload impact event(s) detected in logs.",
  };
}

function analyzeUpload(input) {
  const type = normalizeSourceType(input.type);
  const sample = sampleTelemetry[type];
  const content = String(input.content || sample?.content || "");
  const fileName = input.fileName || sample?.fileName || "upload.txt";
  if (!content.trim()) {
    throw new Error("Upload content is required.");
  }
  if (type === "datadog") return analyzeDatadog(content, fileName);
  if (type === "grafana") return analyzeGrafana(content, fileName);
  if (type === "dcgm") return analyzeDcgm(content, fileName);
  if (type === "logs") return analyzeLogs(content, fileName);
  throw new Error("Unsupported upload type: " + type);
}

function generateIncidentReport(summaries = []) {
  const dcgm = summaries.find((summary) => summary.type === "dcgm");
  const datadog = summaries.find((summary) => summary.type === "datadog");
  const logs = summaries.find((summary) => summary.type === "logs");
  const grafana = summaries.find((summary) => summary.type === "grafana");
  const sourceCount = summaries.length;
  const gpuCount = Math.max(dcgm?.gpuCount || 0, 8);
  const highRiskGpus = Math.max(gpuCount, logs?.nodes?.length || 0, 8);
  const revenue = highRiskGpus * 160;
  const temperature = dcgm?.maxTemperatureC || 88;
  const rootCause = temperature >= 85 || logs?.thermalEvents
    ? "Cooling degradation is driving elevated GPU inlet temperatures while production workloads remain highly utilized."
    : datadog?.alertCount
      ? "Datadog alerts indicate infrastructure risk that needs telemetry correlation before customer impact expands."
      : "Telemetry indicates a latent AI Factory risk pattern that should be validated against GPU and scheduler data.";
  const recommendedFix = temperature >= 85
    ? "Drain priority jobs from affected Rack 17 nodes, rebalance workloads to healthy racks, and inspect Cooling Loop A flow and pump efficiency."
    : "Correlate monitor state with DCGM and scheduler logs, then rebalance workloads away from any node showing thermal or scheduler pressure.";
  return {
    rootCause,
    revenueAtRisk: "$" + revenue.toLocaleString("en-US") + "/hr",
    impactedGpus: highRiskGpus + " H100s",
    recommendedFix,
    customerMessage: "We detected an infrastructure risk before confirmed service degradation and are proactively shifting workloads to preserve SLA commitments.",
    confidence: sourceCount >= 3 ? "High" : sourceCount >= 1 ? "Medium" : "Demo baseline",
    sourceCount,
    generatedAt: new Date().toISOString(),
    evidence: summaries.map((summary) => summary.summary).filter(Boolean),
    grafanaPanels: grafana?.panelCount || 0,
  };
}

async function maybeStore(env, prefix, record) {
  if (env?.MCA_EVENTS && typeof env.MCA_EVENTS.put === "function") {
    await env.MCA_EVENTS.put(prefix + ":" + record.id, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 90,
    });
    return true;
  }
  return false;
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (url.pathname === "/api/health" && request.method === "GET") {
    return jsonResponse({ ok: true, service: "mission-critical-ai", version: "real-intake-v1" });
  }
  if (url.pathname === "/api/audit-requests" && request.method === "POST") {
    const body = await readJson(request);
    if (!body) return jsonResponse({ error: "Invalid JSON request body." }, 400);
    const record = {
      id: createId("audit"),
      createdAt: new Date().toISOString(),
      status: "received",
      contact: body.contact || {},
      riskContext: body.riskContext || {},
      source: "web",
    };
    record.persisted = await maybeStore(env, "audit", record);
    return jsonResponse(record, 202);
  }
  if (url.pathname === "/api/uploads" && request.method === "POST") {
    const body = await readJson(request);
    if (!body) return jsonResponse({ error: "Invalid JSON request body." }, 400);
    try {
      const summary = analyzeUpload(body);
      const record = {
        id: createId("upload"),
        createdAt: new Date().toISOString(),
        ...summary,
      };
      record.persisted = await maybeStore(env, "upload", record);
      return jsonResponse(record, 202);
    } catch (error) {
      return jsonResponse({ error: error.message || "Unable to parse upload." }, 400);
    }
  }
  if (url.pathname === "/api/incident-report" && request.method === "POST") {
    const body = await readJson(request);
    if (!body) return jsonResponse({ error: "Invalid JSON request body." }, 400);
    const summaries = Array.isArray(body.summaries) ? body.summaries : [];
    const report = {
      id: createId("report"),
      ...generateIncidentReport(summaries),
    };
    report.persisted = await maybeStore(env, "report", report);
    return jsonResponse(report);
  }
  return jsonResponse({ error: "Not found" }, 404);
}

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mission Critical AI</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #070d14;
        --panel: #0c1622;
        --panel-2: #101d2b;
        --line: #1f3345;
        --text: #e8f2fa;
        --muted: #8da1b3;
        --cyan: #22d3ee;
        --blue: #3b82f6;
        --green: #22c55e;
        --yellow: #facc15;
        --red: #fb7185;
        --orange: #fb923c;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * { box-sizing: border-box; }

      body {
        min-height: 100vh;
        margin: 0;
        background:
          radial-gradient(circle at 10% 0%, rgba(34, 211, 238, 0.16), transparent 32rem),
          radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.12), transparent 30rem),
          linear-gradient(180deg, #07111b 0%, var(--bg) 44%, #05090e 100%);
        color: var(--text);
      }

      button, input { font: inherit; }

      .shell {
        width: min(1500px, 100%);
        margin: 0 auto;
        padding: 20px;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        padding: 14px 0 22px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .mark {
        display: grid;
        width: 38px;
        height: 38px;
        place-items: center;
        border: 1px solid rgba(34, 211, 238, 0.5);
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.22), rgba(59, 130, 246, 0.14));
        color: var(--cyan);
        font-weight: 900;
      }

      .brand h1 {
        margin: 0;
        font-size: clamp(20px, 2.5vw, 30px);
        line-height: 1.05;
      }

      .brand p {
        margin: 3px 0 0;
        color: var(--muted);
        font-size: 13px;
      }

      .nav {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .pill, .nav button, .nav-cta {
        border: 1px solid var(--line);
        border-radius: 999px;
        background: rgba(12, 22, 34, 0.8);
        color: var(--text);
        padding: 9px 13px;
        font-size: 13px;
      }

      .nav button {
        cursor: pointer;
      }

      .nav-cta {
        border-color: rgba(34, 211, 238, 0.72);
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.24), rgba(59, 130, 246, 0.2));
        color: #d9fbff;
        cursor: pointer;
        font-weight: 900;
      }

      .nav button.active {
        border-color: rgba(34, 211, 238, 0.75);
        background: rgba(34, 211, 238, 0.13);
        color: #c9fbff;
      }

      .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 7px;
        border-radius: 999px;
        background: var(--green);
        box-shadow: 0 0 14px rgba(34, 197, 94, 0.8);
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
        gap: 18px;
        align-items: stretch;
      }

      .panel {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: rgba(12, 22, 34, 0.88);
        box-shadow: 0 20px 80px rgba(0, 0, 0, 0.28);
      }

      .hero-main {
        padding: clamp(22px, 4vw, 40px);
        overflow: hidden;
        position: relative;
      }

      .hero-main::after {
        content: "";
        position: absolute;
        inset: auto -12% -42% 40%;
        height: 260px;
        background: radial-gradient(circle, rgba(34, 211, 238, 0.16), transparent 62%);
        pointer-events: none;
      }

      .eyebrow {
        color: var(--cyan);
        font-size: 12px;
        font-weight: 800;
        margin: 0 0 12px;
        text-transform: uppercase;
      }

      .hero h2 {
        max-width: 760px;
        margin: 0;
        font-size: clamp(34px, 5vw, 72px);
        line-height: 0.96;
      }

      .hero-copy {
        max-width: 710px;
        margin: 18px 0 0;
        color: #b7c7d5;
        font-size: clamp(15px, 1.6vw, 18px);
        line-height: 1.65;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 26px;
      }

      .primary, .secondary {
        border: 0;
        border-radius: 8px;
        cursor: pointer;
        padding: 12px 16px;
        font-weight: 800;
      }

      .primary {
        background: linear-gradient(135deg, var(--cyan), var(--blue));
        color: #03111a;
      }

      .audit-cta {
        box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.28), 0 12px 34px rgba(34, 211, 238, 0.22);
        font-size: 15px;
      }

      .secondary {
        border: 1px solid var(--line);
        background: #0b1420;
        color: var(--text);
      }

      .hero-side {
        display: grid;
        align-content: stretch;
        padding: 18px;
      }

      .risk-card {
        display: grid;
        min-height: 100%;
        gap: 16px;
        align-content: space-between;
      }

      .risk-header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
      }

      .risk-header h3, .section-title h3 {
        margin: 0;
        font-size: 18px;
      }

      .risk-header p, .section-title p {
        margin: 4px 0 0;
        color: var(--muted);
        font-size: 13px;
      }

      .risk-score {
        display: grid;
        place-items: center;
        width: 92px;
        height: 92px;
        border: 1px solid rgba(250, 204, 21, 0.42);
        border-radius: 999px;
        background: conic-gradient(from 0deg, var(--yellow) 0 71%, rgba(31, 51, 69, 0.9) 71% 100%);
      }

      .risk-score strong {
        display: grid;
        width: 68px;
        height: 68px;
        place-items: center;
        border-radius: 999px;
        background: var(--panel);
        font-size: 22px;
      }

      .incident-line {
        display: grid;
        gap: 10px;
      }

      .incident-line div {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        border-bottom: 1px solid var(--line);
        padding-bottom: 10px;
        color: #c8d8e4;
        font-size: 14px;
      }

      .incident-line div:last-child { border-bottom: 0; }
      .incident-line b { color: var(--text); }

      .grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-top: 18px;
      }

      .metric {
        padding: 16px;
      }

      .metric span {
        display: block;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .metric strong {
        display: block;
        margin-top: 9px;
        font-size: clamp(25px, 3vw, 38px);
        line-height: 1;
      }

      .metric small {
        display: block;
        margin-top: 8px;
        color: var(--muted);
      }

      .up { color: var(--green); }
      .warn { color: var(--yellow); }
      .bad { color: var(--red); }
      .info { color: var(--cyan); }

      .main-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
        gap: 18px;
        margin-top: 18px;
      }

      .mvp-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(340px, 0.78fr);
        gap: 18px;
        margin-top: 18px;
      }

      .section {
        padding: 18px;
      }

      .section-title {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
        margin-bottom: 16px;
      }

      .mini-controls {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .mini-controls button {
        border: 1px solid var(--line);
        border-radius: 999px;
        background: #0b1420;
        color: #b8c8d6;
        cursor: pointer;
        padding: 7px 10px;
        font-size: 12px;
      }

      .mini-controls button.active {
        border-color: rgba(34, 211, 238, 0.72);
        color: var(--cyan);
      }

      .rack-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .rack {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #0a1320;
        padding: 12px;
      }

      .rack-head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        color: #d4e2ed;
        font-weight: 800;
        font-size: 13px;
      }

      .heat {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }

      .cell {
        aspect-ratio: 1;
        border-radius: 5px;
        border: 1px solid rgba(255, 255, 255, 0.07);
        background: var(--green);
      }

      .cell.cool { background: #13b981; }
      .cell.warm { background: #eab308; }
      .cell.hot { background: #f97316; }
      .cell.critical { background: #ef4444; box-shadow: 0 0 18px rgba(239, 68, 68, 0.45); }

      .chart {
        width: 100%;
        height: 250px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(34, 211, 238, 0.08), rgba(7, 13, 20, 0.08));
      }

      .gpu-table {
        display: grid;
        gap: 9px;
      }

      .gpu-row {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr 0.7fr 0.8fr;
        gap: 10px;
        align-items: center;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #0a1320;
        padding: 10px 12px;
        font-size: 13px;
      }

      .gpu-row.header {
        color: var(--muted);
        background: transparent;
        border-color: transparent;
        padding-top: 0;
        font-weight: 800;
        text-transform: uppercase;
        font-size: 11px;
      }

      .bar {
        height: 8px;
        overflow: hidden;
        border-radius: 999px;
        background: #1b2b3a;
      }

      .bar i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--cyan), var(--blue));
      }

      .severity {
        display: inline-flex;
        justify-content: center;
        min-width: 72px;
        border-radius: 999px;
        padding: 5px 8px;
        font-size: 11px;
        font-weight: 900;
      }

      .sev-high { background: rgba(251, 113, 133, 0.14); color: #ff9aac; }
      .sev-med { background: rgba(250, 204, 21, 0.14); color: #fde68a; }
      .sev-low { background: rgba(34, 197, 94, 0.14); color: #86efac; }

      .upload-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .upload-card {
        display: grid;
        gap: 12px;
        min-height: 150px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #0a1320;
        padding: 14px;
      }

      .upload-card h4 {
        margin: 0;
        font-size: 15px;
      }

      .upload-card p {
        margin: 0;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.45;
      }

      .mock-upload {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        border: 1px dashed rgba(141, 161, 179, 0.5);
        border-radius: 8px;
        padding: 10px;
        color: #c6d8e6;
        font-size: 12px;
      }

      .mock-upload button {
        border: 0;
        border-radius: 8px;
        background: rgba(34, 211, 238, 0.14);
        color: var(--cyan);
        cursor: pointer;
        font-weight: 900;
        padding: 7px 10px;
      }

      .mock-upload button:disabled {
        cursor: default;
        opacity: 0.75;
      }

      .file-input {
        inline-size: 1px;
        block-size: 1px;
        opacity: 0;
        overflow: hidden;
        position: absolute;
        pointer-events: none;
      }

      .report-list {
        display: grid;
        gap: 11px;
      }

      .report-item {
        border-bottom: 1px solid var(--line);
        padding-bottom: 11px;
      }

      .report-item:last-child { border-bottom: 0; padding-bottom: 0; }

      .report-item span {
        display: block;
        color: var(--muted);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.04em;
        margin-bottom: 5px;
        text-transform: uppercase;
      }

      .report-item p {
        margin: 0;
        color: #d6e6f2;
        font-size: 14px;
        line-height: 1.5;
      }

      .copilot {
        display: grid;
        gap: 12px;
      }

      .message {
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 12px;
        background: #0a1320;
      }

      .message.user {
        border-color: rgba(34, 211, 238, 0.34);
        background: rgba(34, 211, 238, 0.08);
      }

      .message small {
        display: block;
        color: var(--muted);
        margin-bottom: 6px;
        font-weight: 800;
      }

      .message p {
        margin: 0;
        color: #d6e6f2;
        line-height: 1.55;
        font-size: 14px;
      }

      .recommendations {
        display: grid;
        gap: 8px;
        margin-top: 8px;
      }

      .recommendations div {
        border-left: 3px solid var(--cyan);
        padding-left: 10px;
        color: #c7d7e4;
        font-size: 13px;
      }

      .input-row {
        display: flex;
        gap: 8px;
      }

      .input-row input {
        min-width: 0;
        flex: 1;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #08111c;
        color: var(--text);
        padding: 11px 12px;
      }

      .input-row button {
        border: 0;
        border-radius: 8px;
        cursor: pointer;
        background: var(--cyan);
        color: #041018;
        font-weight: 900;
        padding: 0 14px;
      }

      .footer-note {
        margin: 16px 0 4px;
        color: var(--muted);
        font-size: 12px;
        text-align: center;
      }

      @media (max-width: 1050px) {
        .hero, .main-grid, .mvp-grid { grid-template-columns: 1fr; }
        .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (max-width: 720px) {
        .shell { padding: 14px; }
        .topbar { align-items: flex-start; flex-direction: column; }
        .nav { justify-content: flex-start; }
        .grid, .rack-grid, .upload-grid { grid-template-columns: 1fr; }
        .gpu-row { grid-template-columns: 1fr; }
        .gpu-row.header { display: none; }
        .risk-header, .section-title { flex-direction: column; }
        .input-row { flex-direction: column; }
        .input-row button { min-height: 42px; }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <div class="mark">M</div>
          <div>
            <h1>Mission Critical AI</h1>
            <p>Protect the AI Factory</p>
          </div>
        </div>
        <nav class="nav" aria-label="Dashboard sections">
          <span class="pill"><span class="status-dot"></span>Live demo data</span>
          <button class="active" type="button">Command</button>
          <button type="button">Racks</button>
          <button type="button">Incidents</button>
          <button type="button">Revenue</button>
          <button class="nav-cta" id="bookAuditNav" type="button">Book AI Factory Risk Audit</button>
        </nav>
      </header>

      <section class="hero">
        <div class="panel hero-main">
          <p class="eyebrow">AI Factory Intelligence Layer</p>
          <h2>Revenue-risk monitoring for GPU cloud operators.</h2>
          <p class="hero-copy">
            Mission Critical AI turns GPU, cooling, power, Kubernetes, Slurm, and alert data into plain-English
            root cause analysis for operators and owners. It does not replace Datadog or Grafana. It explains what
            their signals mean for uptime, capacity, and revenue.
          </p>
          <div class="hero-actions">
            <button class="primary audit-cta" id="bookAuditHero" type="button">Book AI Factory Risk Audit</button>
            <button class="primary" id="simulateIncident" type="button">Simulate Rack 17 Incident</button>
            <button class="secondary" id="resolveIncident" type="button">Resolve Cooling Risk</button>
          </div>
        </div>

        <aside class="panel hero-side">
          <div class="risk-card">
            <div class="risk-header">
              <div>
                <h3>AI Factory Risk</h3>
                <p>Rack 17 thermal anomaly with customer impact.</p>
              </div>
              <div class="risk-score"><strong id="riskScore">71</strong></div>
            </div>
            <div class="incident-line">
              <div><span>Estimated revenue at risk</span><b id="riskRevenue">$1,280/hr</b></div>
              <div><span>Predicted throttling</span><b id="throttleEta">47 min</b></div>
              <div><span>Impacted GPUs</span><b id="impactedGpu">8 H100s</b></div>
              <div><span>Recommended action</span><b>Shift workloads + inspect Loop A</b></div>
            </div>
          </div>
        </aside>
      </section>

      <section class="grid" aria-label="Executive summary">
        <div class="panel metric">
          <span>GPUs Online</span>
          <strong>1,248</strong>
          <small class="up">+36 added this week</small>
        </div>
        <div class="panel metric">
          <span>Idle GPU Leakage</span>
          <strong id="idleLeakage">$18.4k</strong>
          <small>Estimated daily waste</small>
        </div>
        <div class="panel metric">
          <span>SLA Risk</span>
          <strong id="slaRisk" class="warn">Medium</strong>
          <small>2 customer clusters exposed</small>
        </div>
        <div class="panel metric">
          <span>Incidents Prevented</span>
          <strong class="info">14</strong>
          <small>This week</small>
        </div>
      </section>

      <section class="mvp-grid" aria-label="MVP intake and incident report">
        <section class="panel section">
          <div class="section-title">
            <div>
              <h3>Upload Datadog / Grafana / DCGM Export</h3>
              <p>Mock intake for telemetry exports used to generate operator-ready RCA.</p>
            </div>
            <span class="pill">API intake</span>
          </div>
          <div class="upload-grid">
            <div class="upload-card" data-upload-type="datadog">
              <div>
                <h4>Datadog monitor export</h4>
                <p>Import alert history, monitor thresholds, tags, and customer-facing service ownership.</p>
              </div>
              <div class="mock-upload"><span class="upload-file">datadog-monitors.json</span><input class="file-input" type="file" accept=".json,application/json"><button type="button">Upload</button></div>
            </div>
            <div class="upload-card" data-upload-type="grafana">
              <div>
                <h4>Grafana dashboard JSON</h4>
                <p>Parse panels for GPU temperature, power draw, memory pressure, and utilization windows.</p>
              </div>
              <div class="mock-upload"><span class="upload-file">grafana-gpu-dashboard.json</span><input class="file-input" type="file" accept=".json,application/json"><button type="button">Upload</button></div>
            </div>
            <div class="upload-card" data-upload-type="dcgm">
              <div>
                <h4>NVIDIA DCGM metrics CSV</h4>
                <p>Attach device-level thermals, ECC errors, clocks, power caps, and throttling indicators.</p>
              </div>
              <div class="mock-upload"><span class="upload-file">dcgm-rack-17.csv</span><input class="file-input" type="file" accept=".csv,text/csv"><button type="button">Upload</button></div>
            </div>
            <div class="upload-card" data-upload-type="logs">
              <div>
                <h4>Kubernetes / Slurm incident logs</h4>
                <p>Correlate pod evictions, failed jobs, queue delays, node drains, and workload migrations.</p>
              </div>
              <div class="mock-upload"><span class="upload-file">k8s-slurm-incident.log</span><input class="file-input" type="file" accept=".log,.txt,text/plain"><button type="button">Upload</button></div>
            </div>
          </div>
        </section>

        <section class="panel section">
          <div class="section-title">
            <div>
              <h3>AI Incident Report</h3>
              <p>Generated draft for operators, leadership, and customer success.</p>
            </div>
            <span class="severity sev-high">Draft</span>
          </div>
          <div class="report-list">
            <div class="report-item">
              <span>Root cause</span>
              <p id="reportRootCause">Cooling Loop A degradation caused Rack 17 inlet temperature to rise while H100 utilization stayed above 90%.</p>
            </div>
            <div class="report-item">
              <span>Revenue at risk</span>
              <p id="reportRevenue">$1,280/hr from exposed training and inference workloads, escalating to $1,920/hr if throttling begins.</p>
            </div>
            <div class="report-item">
              <span>Impacted GPUs</span>
              <p id="reportGpus">8 H100s currently exposed across nodes 17A-17D; 12 H100s in the high-risk radius.</p>
            </div>
            <div class="report-item">
              <span>Recommended fix</span>
              <p id="reportFix">Drain priority jobs from Rack 17, rebalance to Rack 12 or Rack 21, and inspect CRAC Loop A pump efficiency.</p>
            </div>
            <div class="report-item">
              <span>Customer message</span>
              <p id="reportCustomer">We detected a cooling anomaly before service degradation and are proactively shifting workloads to preserve SLA commitments.</p>
            </div>
          </div>
        </section>
      </section>

      <main class="main-grid">
        <section class="panel section">
          <div class="section-title">
            <div>
              <h3>Multi-Rack Thermal Map</h3>
              <p>Heat signatures across cooling zones, rack groups, and GPU density.</p>
            </div>
            <div class="mini-controls">
              <button class="active" type="button">Thermal</button>
              <button type="button">Power</button>
              <button type="button">Workload</button>
            </div>
          </div>
          <div class="rack-grid" id="rackGrid"></div>
        </section>

        <section class="panel section">
          <div class="section-title">
            <div>
              <h3>AI Copilot</h3>
              <p>Ask what happened, why it matters, and what to do next.</p>
            </div>
            <span class="severity sev-high" id="copilotStatus">Active RCA</span>
          </div>
          <div class="copilot" id="copilot">
            <div class="message user">
              <small>Operator</small>
              <p>Why is Rack 17 overheating?</p>
            </div>
            <div class="message">
              <small>Mission Critical AI</small>
              <p>
                Cooling flow is down 12% on Loop A while GPU utilization remains above 90%.
                Rack inlet temperature is rising faster than adjacent racks. Thermal throttling is expected in 47 minutes.
              </p>
              <div class="recommendations">
                <div>Shift jobs from nodes 17A-17D to Rack 12 or Rack 21.</div>
                <div>Inspect CRAC Loop A and verify pump efficiency.</div>
                <div>Notify affected customer: 8 H100s, estimated $1,280/hr revenue at risk.</div>
              </div>
            </div>
          </div>
          <form class="input-row" id="askForm">
            <input id="askInput" aria-label="Ask the AI copilot" value="Which customers are impacted?">
            <button type="submit">Ask</button>
          </form>
        </section>

        <section class="panel section">
          <div class="section-title">
            <div>
              <h3>Historical Telemetry</h3>
              <p>GPU temperature, memory pressure, and power draw over the last 24 hours.</p>
            </div>
            <span class="pill">24h window</span>
          </div>
          <svg class="chart" viewBox="0 0 900 260" role="img" aria-label="Historical GPU telemetry line chart">
            <defs>
              <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <g stroke="#1f3345" stroke-width="1">
              <line x1="50" y1="40" x2="860" y2="40"/>
              <line x1="50" y1="90" x2="860" y2="90"/>
              <line x1="50" y1="140" x2="860" y2="140"/>
              <line x1="50" y1="190" x2="860" y2="190"/>
              <line x1="50" y1="225" x2="860" y2="225"/>
            </g>
            <path d="M50 215 C120 210 140 180 205 176 C260 173 290 154 342 157 C390 160 410 112 465 116 C520 120 536 88 590 92 C645 96 690 64 735 70 C780 76 818 54 860 58 L860 225 L50 225 Z" fill="url(#fillA)"/>
            <path d="M50 215 C120 210 140 180 205 176 C260 173 290 154 342 157 C390 160 410 112 465 116 C520 120 536 88 590 92 C645 96 690 64 735 70 C780 76 818 54 860 58" fill="none" stroke="#22d3ee" stroke-width="4"/>
            <path d="M50 178 C122 170 160 182 220 166 C302 144 372 154 430 132 C502 106 564 124 618 98 C682 68 748 88 860 74" fill="none" stroke="#facc15" stroke-width="3"/>
            <path d="M50 130 C160 136 252 122 340 126 C430 114 520 118 602 104 C690 92 765 96 860 88" fill="none" stroke="#fb7185" stroke-width="3"/>
            <g fill="#8da1b3" font-size="12">
              <text x="50" y="245">00:00</text>
              <text x="282" y="245">06:00</text>
              <text x="515" y="245">12:00</text>
              <text x="740" y="245">18:00</text>
              <text x="795" y="34">Temp</text>
              <text x="795" y="54" fill="#facc15">Memory</text>
              <text x="795" y="74" fill="#fb7185">Power</text>
            </g>
          </svg>
        </section>

        <section class="panel section">
          <div class="section-title">
            <div>
              <h3>GPU Fleet Detail</h3>
              <p>Top clusters by utilization, memory, and incident exposure.</p>
            </div>
          </div>
          <div class="gpu-table">
            <div class="gpu-row header">
              <span>Cluster</span><span>Utilization</span><span>Memory</span><span>Status</span>
            </div>
            <div class="gpu-row">
              <b>miami-h100-prod</b>
              <div><div class="bar"><i style="width:93%"></i></div></div>
              <span>71GB / 80GB</span>
              <span class="severity sev-high">Thermal</span>
            </div>
            <div class="gpu-row">
              <b>nyc-b200-infer</b>
              <div><div class="bar"><i style="width:78%"></i></div></div>
              <span>132GB / 180GB</span>
              <span class="severity sev-low">Healthy</span>
            </div>
            <div class="gpu-row">
              <b>dfw-a100-train</b>
              <div><div class="bar"><i style="width:41%"></i></div></div>
              <span>28GB / 80GB</span>
              <span class="severity sev-med">Idle leak</span>
            </div>
            <div class="gpu-row">
              <b>phoenix-l40s-dev</b>
              <div><div class="bar"><i style="width:19%"></i></div></div>
              <span>14GB / 48GB</span>
              <span class="severity sev-med">Overreserved</span>
            </div>
          </div>
        </section>
      </main>

      <p class="footer-note">
        Prototype data for customer discovery. Next build: import Datadog/Grafana/DCGM exports and generate real incident reports.
      </p>
    </div>

    <script>
      const rackGrid = document.querySelector("#rackGrid");
      const copilot = document.querySelector("#copilot");
      const riskScore = document.querySelector("#riskScore");
      const riskRevenue = document.querySelector("#riskRevenue");
      const throttleEta = document.querySelector("#throttleEta");
      const impactedGpu = document.querySelector("#impactedGpu");
      const idleLeakage = document.querySelector("#idleLeakage");
      const slaRisk = document.querySelector("#slaRisk");
      const copilotStatus = document.querySelector("#copilotStatus");
      const reportRootCause = document.querySelector("#reportRootCause");
      const reportRevenue = document.querySelector("#reportRevenue");
      const reportGpus = document.querySelector("#reportGpus");
      const reportFix = document.querySelector("#reportFix");
      const reportCustomer = document.querySelector("#reportCustomer");
      const uploadedSummaries = [];

      const racks = [
        { name: "Rack 12", temp: "68°F", cells: ["cool","cool","cool","warm","cool","cool","warm","warm","cool","cool","cool","warm"] },
        { name: "Rack 17", temp: "88°F", cells: ["warm","hot","hot","critical","warm","hot","critical","critical","warm","hot","hot","critical"] },
        { name: "Rack 21", temp: "71°F", cells: ["cool","cool","warm","warm","cool","cool","cool","warm","cool","warm","warm","warm"] },
      ];

      function renderRacks(resolved = false) {
        rackGrid.innerHTML = racks.map((rack) => {
          const cells = resolved && rack.name === "Rack 17"
            ? ["cool","warm","warm","hot","cool","warm","warm","hot","cool","warm","warm","hot"]
            : rack.cells;
          const temp = resolved && rack.name === "Rack 17" ? "76°F" : rack.temp;
          return '<div class="rack"><div class="rack-head"><span>' + rack.name + '</span><span>' + temp + '</span></div><div class="heat">' +
            cells.map((level) => '<span class="cell ' + level + '"></span>').join("") +
            '</div></div>';
        }).join("");
      }

      function addMessage(role, text, user = false) {
        const node = document.createElement("div");
        node.className = "message" + (user ? " user" : "");
        node.innerHTML = "<small>" + role + "</small><p>" + text + "</p>";
        copilot.appendChild(node);
        node.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      async function apiPost(path, payload) {
        const response = await fetch(path, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Request failed");
        }
        return data;
      }

      function updateReport(report) {
        reportRootCause.textContent = report.rootCause;
        reportRevenue.textContent = report.revenueAtRisk + " from currently correlated telemetry.";
        reportGpus.textContent = report.impactedGpus + " in the current risk model. Confidence: " + report.confidence + ".";
        reportFix.textContent = report.recommendedFix;
        reportCustomer.textContent = report.customerMessage;
      }

      async function refreshReport() {
        const report = await apiPost("/api/incident-report", { summaries: uploadedSummaries });
        updateReport(report);
        return report;
      }

      document.querySelector("#simulateIncident").addEventListener("click", () => {
        renderRacks(false);
        riskScore.textContent = "84";
        riskRevenue.textContent = "$1,920/hr";
        throttleEta.textContent = "31 min";
        impactedGpu.textContent = "12 H100s";
        idleLeakage.textContent = "$22.1k";
        slaRisk.textContent = "High";
        slaRisk.className = "bad";
        copilotStatus.textContent = "Escalated";
        copilotStatus.className = "severity sev-high";
        addMessage("Mission Critical AI", "Rack 17 risk escalated. Cooling flow is now down 18%, power draw is elevated, and customer workloads should be drained from 17A-17F within 15 minutes.");
      });

      document.querySelector("#resolveIncident").addEventListener("click", () => {
        renderRacks(true);
        riskScore.textContent = "32";
        riskRevenue.textContent = "$240/hr";
        throttleEta.textContent = "Stable";
        impactedGpu.textContent = "2 H100s";
        idleLeakage.textContent = "$14.7k";
        slaRisk.textContent = "Low";
        slaRisk.className = "up";
        copilotStatus.textContent = "Monitoring";
        copilotStatus.className = "severity sev-low";
        addMessage("Mission Critical AI", "Cooling stabilized after workload shift. Keep Rack 17 under observation for 30 minutes and attach this summary to the incident report.");
      });

      document.querySelector("#askForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const input = document.querySelector("#askInput");
        const question = input.value.trim();
        if (!question) return;
        addMessage("Operator", question, true);
        addMessage("Mission Critical AI", "Two customer workloads are exposed: a training job on miami-h100-prod and a batch inference queue tagged enterprise-priority. Estimated customer-facing SLA risk is medium unless workloads are shifted within the next 30 minutes.");
        input.value = "";
      });

      document.querySelectorAll(".mock-upload button").forEach((button) => {
        const card = button.closest(".upload-card");
        const input = card.querySelector(".file-input");
        const fileLabel = card.querySelector(".upload-file");
        button.addEventListener("click", () => {
          input.click();
        });
        input.addEventListener("change", async () => {
          const file = input.files[0];
          if (!file) return;
          const originalText = button.textContent;
          button.textContent = "Parsing";
          button.disabled = true;
          fileLabel.textContent = file.name;
          try {
            const content = await file.text();
            const summary = await apiPost("/api/uploads", {
              type: card.dataset.uploadType,
              fileName: file.name,
              content,
            });
            uploadedSummaries.push(summary);
            button.textContent = "Processed";
            addMessage("Mission Critical AI", summary.summary);
            const report = await refreshReport();
            riskRevenue.textContent = report.revenueAtRisk;
            impactedGpu.textContent = report.impactedGpus;
          } catch (error) {
            button.textContent = originalText;
            button.disabled = false;
            addMessage("Mission Critical AI", "Upload failed: " + error.message);
          }
        });
      });

      document.querySelectorAll("#bookAuditHero, #bookAuditNav").forEach((button) => {
        button.addEventListener("click", async () => {
          const originalText = button.textContent;
          button.textContent = "Booking";
          button.disabled = true;
          try {
            const request = await apiPost("/api/audit-requests", {
              contact: { source: "dashboard-cta" },
              riskContext: {
                riskScore: riskScore.textContent,
                revenueAtRisk: riskRevenue.textContent,
                impactedGpus: impactedGpu.textContent,
                uploadedSources: uploadedSummaries.map((summary) => summary.type),
              },
            });
            addMessage("Mission Critical AI", "Risk audit request " + request.id + " captured. We have the current telemetry context and can route this to an operator workflow.");
            button.textContent = "Audit Requested";
          } catch (error) {
            button.textContent = originalText;
            button.disabled = false;
            addMessage("Mission Critical AI", "Audit request failed: " + error.message);
          }
        });
      });

      document.querySelectorAll(".nav button, .mini-controls button").forEach((button) => {
        button.addEventListener("click", () => {
          [...button.parentElement.querySelectorAll("button")].forEach((item) => item.classList.remove("active"));
          button.classList.add("active");
        });
      });

      renderRacks(false);
    </script>
  </body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    void ctx;

    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    if (url.pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }

    return new Response(page, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};
