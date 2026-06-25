# Mission Critical AI

Mission Critical AI is a lightweight Cloudflare Worker for an AI Factory risk dashboard. It presents a serious infrastructure SaaS experience for GPU cloud operators who need to understand revenue risk, incident impact, and operational fixes across Datadog, Grafana, NVIDIA DCGM, Kubernetes, and Slurm signals.

The current app is intentionally dependency-free: a single ESM Worker serves the dashboard and API routes from `worker/index.js`. It includes:

- A prominent `Book AI Factory Risk Audit` CTA.
- File-backed intake for Datadog monitor exports, Grafana dashboard JSON, NVIDIA DCGM metrics CSV, and Kubernetes / Slurm incident logs.
- API-generated incident reports covering root cause, revenue at risk, impacted GPUs, recommended fix, and customer message.
- GPU fleet, thermal map, telemetry, and copilot dashboard sections using demo data.
- Optional persistence through an `MCA_EVENTS` KV binding when one is configured.

## API Routes

- `GET /api/health`
- `POST /api/audit-requests`
- `POST /api/uploads`
- `POST /api/incident-report`

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
