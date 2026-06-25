import assert from "node:assert/strict";
import app from "../worker/index.js";

class MemoryKv {
  constructor() {
    this.records = new Map();
  }

  async put(key, value, options = {}) {
    this.records.set(key, { value, metadata: options.metadata || null });
  }

  async get(key, type) {
    const record = this.records.get(key);
    if (!record) return null;
    return type === "json" ? JSON.parse(record.value) : record.value;
  }

  async list(options = {}) {
    const prefix = options.prefix || "";
    const limit = options.limit || 1000;
    const keys = [...this.records.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .slice(0, limit)
      .map(([name, record]) => ({ name, metadata: record.metadata }));
    return { keys, list_complete: true, cursor: "" };
  }
}

const env = { MCA_EVENTS: new MemoryKv() };
const workspaceId = "smoke-factory";

async function call(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("x-mca-workspace", workspaceId);
  const response = await app.fetch(new Request("https://example.com" + path, { ...options, headers }), env, {});
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

const health = await call("/api/health");
assert.equal(health.response.status, 200);
assert.equal(health.body.ok, true);
assert.equal(health.body.persistence, true);

const workspace = await call("/api/workspace");
assert.equal(workspace.response.status, 200);
assert.equal(workspace.body.workspaceId, workspaceId);

const upload = await call("/api/uploads", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    workspaceId,
    type: "dcgm",
    fileName: "dcgm-smoke.csv",
    content: [
      "timestamp,node,gpu_uuid,temperature_c,utilization_gpu,power_w",
      "2026-06-25T17:00:00Z,17A,GPU-1,89,96,708",
      "2026-06-25T17:00:00Z,17B,GPU-2,91,98,716",
    ].join("\n"),
  }),
});
assert.equal(upload.response.status, 202);
assert.equal(upload.body.status, "processed");
assert.equal(upload.body.type, "dcgm");
assert.equal(upload.body.persisted, true);

const report = await call("/api/incident-report", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ workspaceId, summaries: [upload.body] }),
});
assert.equal(report.response.status, 200);
assert.match(report.body.revenueAtRisk, /^\$/);
assert.ok(report.body.rootCause);
assert.equal(report.body.persisted, true);

const audit = await call("/api/audit-requests", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    workspaceId,
    contact: { source: "smoke-test" },
    riskContext: { revenueAtRisk: report.body.revenueAtRisk },
  }),
});
assert.equal(audit.response.status, 202);
assert.equal(audit.body.status, "received");
assert.equal(audit.body.persisted, true);

const events = await call("/api/events?limit=10");
assert.equal(events.response.status, 200);
assert.equal(events.body.workspaceId, workspaceId);
assert.equal(events.body.persisted, true);
assert.equal(events.body.records.length, 3);

const form = new FormData();
form.set("workspaceId", workspaceId);
form.set("type", "datadog");
form.set("file", new File([JSON.stringify([
  {
    name: "Smoke Datadog alert",
    overall_state: "Alert",
    tags: ["service:training", "customer:smoke"],
    query: "avg(last_5m):avg:gpu.temperature{rack:17} > 85",
  },
])], "datadog-smoke.json", { type: "application/json" }));

const multipart = await call("/api/uploads", {
  method: "POST",
  body: form,
});
assert.equal(multipart.response.status, 202);
assert.equal(multipart.body.type, "datadog");
assert.equal(multipart.body.alertCount, 1);
assert.equal(multipart.body.persisted, true);

const batch = await call("/api/imports", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    workspaceId,
    uploads: [
      {
        fileName: "grafana-dashboard.json",
        content: JSON.stringify({
          title: "Smoke dashboard",
          panels: [{ title: "GPU Temperature", targets: [{ expr: "DCGM_FI_DEV_GPU_TEMP" }] }],
        }),
      },
      {
        fileName: "k8s-slurm.log",
        content: "2026-06-25T17:00:00Z kubelet node=17A warning thermal-pressure pod=train-enterprise-priority",
      },
    ],
  }),
});
assert.equal(batch.response.status, 202);
assert.equal(batch.body.records.length, 2);
assert.equal(batch.body.report.persisted, true);

console.log("API smoke test passed");
