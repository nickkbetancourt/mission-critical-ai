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

      .pill, .nav button {
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

      .landing-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(320px, 0.72fr);
        gap: 18px;
        margin-top: 18px;
      }

      .proof-grid, .workflow-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .proof-card, .workflow-card, .upload-card, .report-card, .lead-card {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #0a1320;
        padding: 14px;
      }

      .proof-card strong, .workflow-card strong { display: block; font-size: 20px; margin-bottom: 6px; }
      .proof-card span, .workflow-card span, .upload-card p, .report-card p, .lead-card p { color: var(--muted); font-size: 13px; line-height: 1.5; }

      .view { display: none; }
      .view.active { display: block; }

      .dashboard-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
        margin-bottom: 18px;
      }

      .upload-zone {
        display: grid;
        place-items: center;
        min-height: 138px;
        border: 1px dashed rgba(34, 211, 238, 0.52);
        border-radius: 8px;
        background: rgba(34, 211, 238, 0.07);
        text-align: center;
        padding: 18px;
      }

      .upload-zone b { display: block; margin-bottom: 6px; }
      .progress { height: 8px; border-radius: 999px; background: #172638; overflow: hidden; margin-top: 12px; }
      .progress i { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, var(--cyan), var(--green)); transition: width .45s ease; }

      .report-output {
        margin-top: 12px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #07111b;
        padding: 14px;
        color: #dbeaf5;
        font-size: 13px;
        line-height: 1.55;
        white-space: pre-line;
      }

      .lead-form { display: grid; gap: 10px; margin-top: 12px; }
      .lead-form input {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #08111c;
        color: var(--text);
        padding: 11px 12px;
      }
      .lead-success { display: none; color: #86efac; font-size: 13px; margin-top: 10px; }

      .footer-note {
        margin: 16px 0 4px;
        color: var(--muted);
        font-size: 12px;
        text-align: center;
      }

      @media (max-width: 1050px) {
        .hero, .main-grid, .landing-grid { grid-template-columns: 1fr; }
        .grid, .proof-grid, .workflow-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (max-width: 720px) {
        .shell { padding: 14px; }
        .topbar { align-items: flex-start; flex-direction: column; }
        .nav { justify-content: flex-start; }
        .grid, .rack-grid, .proof-grid, .workflow-grid { grid-template-columns: 1fr; }
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
        <nav class="nav" aria-label="Primary navigation">
          <span class="pill"><span class="status-dot"></span>Live telemetry mock</span>
          <button class="active" data-view="landing" type="button">Landing</button>
          <button data-view="dashboard" type="button">Dashboard</button>
          <button id="navAudit" type="button">Book Risk Audit</button>
        </nav>
      </header>

      <div class="view active" id="landingView">
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
            <button class="primary" id="openDashboard" type="button">Open Operations Dashboard</button>
            <button class="secondary" id="heroAudit" type="button">Book AI Factory Risk Audit</button>
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

      <section class="landing-grid">
        <div class="panel section">
          <div class="section-title"><div><h3>Built for infrastructure operators</h3><p>Connect observability exports, quantify business impact, and produce executive-ready incident narratives.</p></div></div>
          <div class="proof-grid">
            <div class="proof-card"><strong>Datadog</strong><span>Parse monitor exports, logs, and service tags into correlated GPU fleet events.</span></div>
            <div class="proof-card"><strong>Grafana</strong><span>Turn dashboard snapshots and panel JSON into capacity and thermal risk findings.</span></div>
            <div class="proof-card"><strong>DCGM / K8s</strong><span>Map GPU health, pods, tenants, and jobs to revenue exposure and SLA risk.</span></div>
          </div>
        </div>
        <aside class="panel section lead-card" id="auditCard">
          <div class="section-title"><div><h3>Book AI Factory Risk Audit</h3><p>Share your fleet size and biggest reliability concern. We will prepare a mock risk readout.</p></div></div>
          <form class="lead-form" id="leadForm">
            <input id="leadEmail" type="email" placeholder="Work email" aria-label="Work email" required>
            <input id="leadCompany" placeholder="Company / GPU fleet size" aria-label="Company and GPU fleet size" required>
            <button class="primary" type="submit">Request audit</button>
          </form>
          <div class="lead-success" id="leadSuccess">Audit request captured. We will follow up with an AI Factory risk brief.</div>
        </aside>
      </section>
      </div>

      <div class="view" id="dashboardView">
        <div class="dashboard-head">
          <div>
            <p class="eyebrow">Operations dashboard</p>
            <h2 style="margin:0;font-size:clamp(28px,4vw,46px)">AI Factory command center</h2>
          </div>
          <div class="hero-actions" style="margin-top:0">
            <button class="primary" id="simulateIncident" type="button">Simulate Rack 17 Incident</button>
            <button class="secondary" id="resolveIncident" type="button">Resolve Cooling Risk</button>
          </div>
        </div>

        <section class="grid" aria-label="Data ingestion and incident workflow">
          <div class="panel upload-card">
            <h3>Upload Datadog/Grafana export</h3>
            <div class="upload-zone" id="uploadZone"><div><b>Drop export JSON / CSV</b><span>Mock import: datadog_monitors.json + grafana_panels.json</span><div class="progress"><i id="uploadProgress"></i></div></div></div>
            <button class="secondary" id="mockUpload" type="button" style="margin-top:12px">Run mock upload</button>
          </div>
          <div class="panel report-card">
            <h3>Incident report generator</h3>
            <p>Generate an operator, customer success, and executive incident narrative from the current risk state.</p>
            <button class="primary" id="generateReport" type="button">Generate report</button>
            <div class="report-output" id="reportOutput">No report generated yet.</div>
          </div>
          <div class="panel workflow-card"><strong>Workflow</strong><span id="workflowStatus">Awaiting telemetry export. Upload to enrich RCA and quantify revenue at risk.</span></div>
          <div class="panel workflow-card"><strong>Governance</strong><span>Every generated recommendation is tied to source telemetry, tenant impact, and an approval step.</span></div>
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
      </div>

      <p class="footer-note">
        Mock SaaS experience for customer discovery: landing page, operations dashboard, telemetry import, incident reports, and risk-audit lead capture.
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
      const landingView = document.querySelector("#landingView");
      const dashboardView = document.querySelector("#dashboardView");
      const workflowStatus = document.querySelector("#workflowStatus");
      const uploadProgress = document.querySelector("#uploadProgress");
      const reportOutput = document.querySelector("#reportOutput");

      function showView(name) {
        const landing = name === "landing";
        landingView.classList.toggle("active", landing);
        dashboardView.classList.toggle("active", !landing);
        document.querySelectorAll(".nav button[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
      }

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

      document.querySelectorAll(".nav button[data-view]").forEach((button) => {
        button.addEventListener("click", () => showView(button.dataset.view));
      });

      document.querySelector("#openDashboard").addEventListener("click", () => showView("dashboard"));
      document.querySelector("#heroAudit").addEventListener("click", () => document.querySelector("#auditCard").scrollIntoView({ behavior: "smooth" }));
      document.querySelector("#navAudit").addEventListener("click", () => { showView("landing"); document.querySelector("#auditCard").scrollIntoView({ behavior: "smooth" }); });

      document.querySelector("#mockUpload").addEventListener("click", () => {
        uploadProgress.style.width = "100%";
        workflowStatus.textContent = "Telemetry imported: 42 monitors, 18 Grafana panels, 6 DCGM anomalies, and 2 tenant-impact mappings correlated.";
        addMessage("Mission Critical AI", "Datadog and Grafana export imported. Rack 17 thermal alert correlates with CRAC Loop A pressure degradation and elevated H100 power draw.");
      });

      document.querySelector("#generateReport").addEventListener("click", () => {
        reportOutput.textContent = "INC-2026-0617 / Rack 17 Thermal Risk\nSummary: Cooling Loop A degradation is increasing inlet temperature for miami-h100-prod.\nImpact: " + impactedGpu.textContent + " exposed, " + riskRevenue.textContent + " revenue at risk, SLA risk " + slaRisk.textContent + ".\nActions: drain workloads from 17A-17F, inspect CRAC Loop A, notify enterprise-priority tenants, and review idle GPU leakage after stabilization.";
      });

      document.querySelector("#leadForm").addEventListener("submit", (event) => {
        event.preventDefault();
        document.querySelector("#leadSuccess").style.display = "block";
        event.currentTarget.reset();
      });

      document.querySelectorAll(".mini-controls button").forEach((button) => {
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
    void env;
    void ctx;

    if (new URL(request.url).pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }

    return new Response(page, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};
