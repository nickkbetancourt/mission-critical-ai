# Mission Critical AI

Mission Critical AI is a lightweight Sites Worker MVP for an AI Factory risk dashboard. It presents a serious infrastructure SaaS experience for GPU cloud operators who need to understand revenue risk, incident impact, and operational fixes across Datadog, Grafana, NVIDIA DCGM, Kubernetes, and Slurm signals.

The current app is intentionally dependency-free: a single ESM Worker serves static HTML, CSS, and browser-local mock interactions from `worker/index.js`. It includes:

- A prominent `Book AI Factory Risk Audit` CTA.
- Mock upload flow for Datadog monitor exports, Grafana dashboard JSON, NVIDIA DCGM metrics CSV, and Kubernetes / Slurm incident logs.
- AI incident report panel covering root cause, revenue at risk, impacted GPUs, recommended fix, and customer message.
- GPU fleet, thermal map, telemetry, and copilot dashboard sections using demo data.

## Build And Validate

Run the same lightweight Sites Worker checks used before deployment:

```sh
bash scripts/build.sh
node scripts/validate-artifact.mjs
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
