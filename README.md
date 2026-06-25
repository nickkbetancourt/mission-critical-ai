# Mission Critical AI

**Mission Critical AI is an AI incident intelligence layer for GPU cloud operators.**

It sits above the tools GPU infrastructure teams already use — Datadog, Grafana, NVIDIA DCGM, Kubernetes, and Slurm — and turns noisy telemetry into revenue-aware root cause analysis, operator fixes, and customer-ready incident communication.

Live demo: https://mission-critical-ai.nickkbetancourt.workers.dev/

## Investor Thesis

AI infrastructure is becoming one of the most capital-intensive operating environments in the world. GPU clouds, AI factories, and high-density data centers cannot afford to treat incidents as generic alerts. A thermal event, pod eviction, Slurm queue delay, power spike, or idle GPU leak directly affects revenue, SLA exposure, and customer trust.

Mission Critical AI is not trying to replace Datadog, Grafana, or infrastructure observability. It is the **decision and business-impact layer** on top of them.

### One-Line Pitch

> Mission Critical AI helps GPU cloud operators detect infrastructure risk, explain root cause, estimate revenue exposure, and generate customer-ready incident reports before SLA impact expands.

## Current Product

The current app is intentionally dependency-free: a single ESM Cloudflare Worker serves the dashboard and API routes from `worker/index.js`.

What works today:

- Live dashboard for GPU fleet risk, thermal anomalies, SLA exposure, idle leakage, and incident state.
- File-backed intake for Datadog monitor exports, Grafana dashboard JSON, NVIDIA DCGM metrics CSV, and Kubernetes / Slurm incident logs.
- API-generated incident reports covering root cause, revenue at risk, impacted GPUs, recommended fix, confidence, evidence, and customer message.
- Workspace-scoped audit requests, telemetry uploads, and incident reports.
- Cloudflare KV persistence through the `MCA_EVENTS` binding.
- Optional API protection through `MCA_API_TOKEN`.

## Target Buyer

Primary buyers and design partners:

- GPU cloud / neo-cloud operators.
- AI infrastructure startups.
- Data center operators running high-density GPU clusters.
- Platform engineering teams responsible for Kubernetes, Slurm, and GPU reliability.
- Customer success and incident response teams responsible for SLA communication.

## Wedge

Start with a free **AI Factory Risk Audit**:

1. Prospect uploads or sends anonymized Datadog, Grafana, DCGM, Kubernetes, or Slurm exports.
2. Mission Critical AI returns a concise risk report with root cause, revenue at risk, impacted GPUs, recommended fix, and customer message.
3. Strong audit results convert into a paid pilot.

## API Routes

- `GET /api/health`
- `GET /api/workspace`
- `GET /api/events?type=all&limit=25`
- `POST /api/audit-requests`
- `POST /api/uploads` with JSON or `multipart/form-data`
- `POST /api/imports` for batch Datadog, Grafana, DCGM, Kubernetes, and Slurm imports
- `POST /api/incident-report`

## Supported Imports

- Datadog monitor exports as JSON arrays, `monitors` objects, or API-style `data` / `results` payloads.
- Grafana dashboard JSON, including exported dashboard wrappers and nested panel rows.
- NVIDIA DCGM CSV metrics with temperature, utilization, power, memory, node, and GPU UUID columns.
- Kubernetes and Slurm incident logs with thermal, eviction, drain, requeue, failed job, customer, and priority signals.

## Investor-Ready Roadmap

Near-term proof points:

- Add a stronger investor-facing landing narrative: problem, buyer, why now, wedge, and what works today.
- Add a real audit intake form with name, email, company, GPU count, telemetry stack, and pain point.
- Add demo metrics: audit requests captured, uploaded sources processed, reports generated, and estimated revenue risk identified.
- Add exportable PDF / Markdown incident report output.
- Add sample anonymized data packs so prospects and investors can test the workflow without private telemetry.

Product roadmap:

- Native Datadog API integration.
- Grafana dashboard import and panel mapping.
- DCGM metric trend analysis and anomaly detection.
- Kubernetes / Slurm incident correlation.
- Revenue-risk model configurable by GPU type, hourly utilization, customer tier, and SLA exposure.
- Customer-safe incident message generator.
- Workspace history, saved audits, and pilot dashboards.

## Market Evidence Notes

Recent infrastructure signals supporting the thesis:

- Reuters reported rapid U.S. grid growth pressure tied partly to data centers, with major generation and upgrade requirements projected by 2030: https://www.reuters.com/business/energy/rapid-us-grid-growth-could-rival-nations-largest-system-report-says-2026-06-25/
- Reuters has also covered investor debate around the scale and returns of AI infrastructure spending: https://www.reuters.com/technology/artificial-intelligence/artificial-intelligencer-wall-street-cant-decide-what-think-about-ai-2026-06-24/
- Recent research on AI data center power profiles using NVIDIA H100 workloads highlights why whole-facility planning and operational visibility matter: https://arxiv.org/abs/2604.07345
- Recent research on next-generation AI data centers highlights power demand, transients, and thermal stress as core design challenges: https://arxiv.org/abs/2606.25095

## Persistence And Auth

`wrangler.toml` binds `MCA_EVENTS` to Cloudflare KV. Audit requests, telemetry upload summaries, and generated reports are stored under workspace-scoped keys for 90 days.

Mutating API routes can be protected by setting a Cloudflare Worker secret named `MCA_API_TOKEN`. When that secret exists, clients must send `Authorization: Bearer <token>` or `x-mca-token: <token>`.

## Build And Validate

Run the same lightweight Worker checks used before deployment:

```sh
bash scripts/build.sh
node scripts/validate-artifact.mjs
node scripts/smoke-api.mjs
```

The build copies the Worker and hosting manifest into the deployment artifact:

```text
dist/
├── .openai/
│   └── hosting.json
└── server/
    └── index.js
```

`dist/server/index.js` must export `default.fetch`. Edit `worker/index.js`, then rebuild instead of changing generated files under `dist/`.
