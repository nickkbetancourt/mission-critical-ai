# Mission Critical AI Demo Script

Use this for investor calls, design partner calls, and product walkthroughs.

## Goal

Show that Mission Critical AI is not just a dashboard. It is a workflow that turns fragmented GPU infrastructure telemetry into business-impact incident intelligence.

## 30-Second Setup

"GPU cloud operators already have Datadog, Grafana, DCGM, Kubernetes, and Slurm. The problem is not lack of alerts. The problem is that when something happens, operators still have to manually answer: what happened, which GPUs and customers are affected, how much revenue is at risk, what should we do, and what do we tell the customer? Mission Critical AI is the intelligence layer that answers those questions."

## Demo Flow

### 1. Open The Dashboard

Open the live demo:

https://mission-critical-ai.nickkbetancourt.workers.dev/

Point out:

- AI Factory Risk score.
- Estimated revenue at risk.
- Predicted throttling window.
- Impacted GPUs.
- Recommended operator action.

Talk track:

"This is an executive/operator view of a GPU incident. Instead of showing a wall of metrics, it starts with the business risk: revenue at risk, throttling window, impacted GPUs, and what to do next."

### 2. Simulate The Rack 17 Incident

Click `Simulate Rack 17 Incident`.

Point out:

- Risk score increases.
- Revenue risk increases.
- Throttling time decreases.
- Copilot adds an escalation.

Talk track:

"When the incident escalates, the system updates the operator state and explains why this matters. This is where the product moves from observability into decision support."

### 3. Show Telemetry Intake

Scroll to the upload section.

Point out supported imports:

- Datadog monitor export.
- Grafana dashboard JSON.
- NVIDIA DCGM metrics CSV.
- Kubernetes / Slurm logs.

Talk track:

"The MVP starts with the lowest-friction integration possible: exports from the tools operators already use. We do not need the prospect to rip out Datadog or Grafana. They upload exports, and we generate an operator-ready RCA."

### 4. Show The AI Incident Report

Point out:

- Root cause.
- Revenue at risk.
- Impacted GPUs.
- Recommended fix.
- Customer message.

Talk track:

"This report is the product. It gives engineering, leadership, and customer success the same source of truth. The operator sees the fix, leadership sees the revenue exposure, and customer success gets a safe customer message."

### 5. Show The Copilot

Ask: `Which customers are impacted?`

Talk track:

"The copilot is focused on incident context, not generic chat. The operator can ask what happened, why it matters, and what action to take."

### 6. Close With The Wedge

Click `Book AI Factory Risk Audit`.

Talk track:

"The go-to-market wedge is a free AI Factory Risk Audit. Send us anonymized Datadog, Grafana, DCGM, Kubernetes, or Slurm exports. We return a report showing root cause, revenue risk, impacted GPUs, and recommended fixes. If that creates value, it converts into a paid pilot."

## 60-Second Investor Version

"Mission Critical AI is building the incident intelligence layer for GPU cloud operators. GPU infrastructure teams already have monitoring, but alerts do not explain business impact. When a thermal event, power spike, Slurm queue delay, or pod eviction happens, teams still manually figure out what broke, which customers are affected, how much revenue is at risk, and what to communicate. Our MVP imports Datadog, Grafana, NVIDIA DCGM, Kubernetes, and Slurm data, then generates a root cause report with revenue at risk, impacted GPUs, recommended fix, and customer-safe messaging. We are not replacing Datadog or Grafana. We are the decision layer above them. The wedge is a free AI Factory Risk Audit that converts GPU operators into design partners and pilots."

## Questions Investors May Ask

### Is this just Datadog?

No. Datadog collects and alerts on infrastructure telemetry. Mission Critical AI correlates GPU-specific signals and translates them into root cause, revenue risk, operator action, and customer communication.

### Why would buyers care?

Because GPU incidents are expensive. Idle GPUs, thermal throttling, failed jobs, and SLA exposure create direct revenue and customer trust risk.

### Why now?

AI infrastructure is scaling quickly, and high-density GPU operations create new power, cooling, scheduling, and customer reliability problems.

### What proof do you need next?

Qualified conversations, real anonymized telemetry exports, design partner audits, pilot commitments, and measurable time saved in incident RCA.

### What is the first paid product?

A paid pilot that continuously ingests or uploads telemetry and produces incident intelligence reports for GPU operations teams.
