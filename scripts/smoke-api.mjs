import assert from "node:assert/strict";
import app from "../worker/index.js";

async function call(path, options = {}) {
  const response = await app.fetch(new Request("https://example.com" + path, options), {}, {});
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

const health = await call("/api/health");
assert.equal(health.response.status, 200);
assert.equal(health.body.ok, true);

const upload = await call("/api/uploads", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
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

const report = await call("/api/incident-report", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ summaries: [upload.body] }),
});
assert.equal(report.response.status, 200);
assert.match(report.body.revenueAtRisk, /^\$/);
assert.ok(report.body.rootCause);

const audit = await call("/api/audit-requests", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    contact: { source: "smoke-test" },
    riskContext: { revenueAtRisk: report.body.revenueAtRisk },
  }),
});
assert.equal(audit.response.status, 202);
assert.equal(audit.body.status, "received");

console.log("API smoke test passed");
