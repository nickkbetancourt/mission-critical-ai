# Landing Page Investor Refresh Spec

This is the implementation spec for making the live Mission Critical AI page investor-ready.

## Objective

Shift the page from "cool dashboard demo" to "credible venture-backed infrastructure SaaS wedge."

The page must clearly answer:

1. What painful problem exists?
2. Who has the problem?
3. Why does it matter now?
4. What does the product do today?
5. How does a buyer try it?
6. Why is this not just Datadog or Grafana?

## Current Strengths

The current page already has strong raw material:

- AI Factory / GPU cloud positioning.
- Revenue at risk.
- Rack 17 incident simulation.
- Upload support for Datadog, Grafana, DCGM, Kubernetes, and Slurm.
- AI Incident Report.
- Copilot-style operator Q&A.
- Cloudflare KV persistence.

## Required Copy Changes

### Hero Eyebrow

Current:

> AI Factory Intelligence Layer

Keep or change to:

> GPU Infrastructure Incident Intelligence

### Hero Headline

Replace:

> Revenue-risk monitoring for GPU cloud operators.

With:

> Prevent GPU incidents before they become SLA penalties.

Alternative:

> Turn GPU infrastructure alerts into revenue-aware incident reports.

### Hero Body

Replace with:

> Mission Critical AI sits above Datadog, Grafana, NVIDIA DCGM, Kubernetes, and Slurm to explain what infrastructure signals mean for uptime, customer impact, and revenue. Upload telemetry exports, generate root cause analysis, estimate exposed GPUs and revenue, and create customer-ready incident updates in minutes.

### Primary CTA

Replace:

> Book AI Factory Risk Audit

With:

> Run Free AI Factory Risk Audit

Subtext under CTA:

> Upload or send anonymized telemetry exports. We return a sample RCA with root cause, revenue at risk, impacted GPUs, and recommended fixes.

### Secondary CTA

Keep:

> Simulate Rack 17 Incident

## New Sections To Add

### 1. Problem Section

Title:

> GPU clouds do not have an alert problem. They have an incident intelligence problem.

Cards:

- Alerts are fragmented across Datadog, Grafana, DCGM, Kubernetes, Slurm, cooling, and power.
- Operators manually connect root cause to customer and revenue impact.
- Customer success needs a safe message before the customer asks what happened.

### 2. Who Buys Section

Title:

> Built for teams running expensive GPU capacity.

Buyer cards:

- GPU cloud / neo-cloud operators.
- AI infrastructure startups.
- Data center teams running high-density GPU clusters.
- Platform engineering teams managing Kubernetes and Slurm.
- Customer success teams responsible for SLA communication.

### 3. What Works Today Section

Title:

> MVP already live.

Checklist:

- Upload Datadog monitor exports.
- Upload Grafana dashboard JSON.
- Upload NVIDIA DCGM metrics CSV.
- Upload Kubernetes / Slurm logs.
- Generate RCA with root cause, revenue risk, impacted GPUs, fix, confidence, evidence, and customer message.
- Store audit requests, uploads, and reports by workspace.

### 4. Why Now Section

Title:

> AI factories are becoming power, cooling, and reliability bottlenecks.

Copy:

> GPU clusters are pushing data center operations beyond traditional cloud monitoring. High-density racks create new thermal, power, scheduling, and utilization risks. Mission Critical AI turns those risks into operator and business decisions.

Do not overclaim. Keep this section tight and cite sources in the README/investor brief instead of crowding the landing page.

### 5. Wedge Section

Title:

> Start with an AI Factory Risk Audit.

Steps:

1. Send anonymized telemetry exports.
2. Mission Critical AI parses and correlates the signals.
3. Receive a root cause report with revenue at risk and recommended action.
4. Convert into a paid pilot if the audit finds value.

## Audit Intake Form Requirements

Replace simple button-only audit capture with a visible form or modal.

Fields:

- Name.
- Work email.
- Company.
- Role.
- Approximate GPU count.
- Current tools: Datadog, Grafana, DCGM, Kubernetes, Slurm, Prometheus, other.
- Biggest pain: outages, idle GPU leakage, thermal risk, customer communication, scheduler failures, unknown.
- Optional note.

API:

Continue using `POST /api/audit-requests`, but pass the full contact and risk context.

## Demo Metrics To Add

Add a lightweight "Proof dashboard" section:

- Audit requests captured.
- Uploads processed.
- Reports generated.
- Total estimated revenue at risk identified.
- Source types parsed.

For MVP, metrics can be derived from `/api/events`.

## Trust And Credibility Rules

Do:

- Say "live MVP" because upload and report flows exist.
- Say "demo data" where data is simulated.
- Say "free AI Factory Risk Audit" as the wedge.
- Say "designed for GPU cloud operators."

Do not:

- Claim customers that do not exist.
- Claim revenue, ARR, or paid pilots until validated.
- Claim direct Datadog/Grafana replacement.
- Claim autonomous remediation until implemented.

## Acceptance Criteria

The refreshed page is investor-ready when:

- A first-time visitor understands the problem in under 10 seconds.
- The buyer persona is obvious.
- The product wedge is obvious.
- The page explains why Datadog/Grafana are complements, not competitors.
- The CTA captures usable lead information.
- The demo still shows a working Rack 17 incident, upload flow, and generated RCA.
- No fake customer or traction claims are present.
- Mobile layout remains clean.
