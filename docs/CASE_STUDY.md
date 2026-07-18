# SignalOps Triage Case Study

## Problem

Field-service incident notes are often inconsistent. Coordinators have to infer urgency, compare recent history, identify recurrence, and decide whether to dispatch a technician.

## User

Operations coordinators, field-service leads, and equipment-maintenance teams working with ATMs, kiosks, lockers, or similar devices.

## Existing Workflow

1. A site sends an incident note.
2. A coordinator manually reads the note and recent history.
3. The coordinator decides severity and dispatch priority.
4. A technician is assigned if the issue appears urgent enough.
5. The reasoning is often scattered across notes, chat, or ticket history.

## Pain Points

- Unstructured notes lead to inconsistent priority decisions.
- Repeated failure patterns can be missed.
- Dispatch decisions need clearer audit trails.
- Customer-impact language can be mixed with irrelevant details.

## Product Hypothesis

An AI-assisted triage tool can help coordinators classify incidents, score severity, identify repeated-failure cues, and draft a dispatch recommendation while keeping human approval as the final gate.

## Proposed Workflow

Incident intake, classification, severity scoring, repeated-failure check, business context summary, dispatch recommendation, human approval or rejection, and audit history.

## Role of AI

The demo simulates AI-style classification and recommendation logic with deterministic browser rules. A future live AI integration could improve extraction and summarization, but the demo is intentionally usable without a paid API key.

## Human-Control Model

SignalOps does not automatically dispatch technicians. The coordinator must approve the recommendation or send it back for more context.

## Primary User Journey

1. Select a synthetic incident.
2. Review or edit the incident note.
3. Run classification.
4. Inspect severity, recurrence, and business impact.
5. Approve or reject the dispatch plan.

## Technical Approach

The product is a static HTML/CSS/JavaScript application. It uses deterministic scoring logic and fictional fixtures stored in `data/synthetic-incidents.json`.

## Data and Privacy

All incidents are fictional. No banking records, ATM transaction records, payment-card data, real customer information, employee data, credentials, private communications, or production logs are included.

## Validation

`tests/validate.ps1` checks required files, synthetic fixture parsing, privacy language, core UI markers, and common secret patterns.

## Design Decisions

- Static architecture keeps the demo easy to run and deploy on GitHub Pages.
- Deterministic mode keeps claims honest and avoids paid API requirements.
- The interface emphasizes operational review rather than autonomous control.

## Scope Decisions

Release-critical scope focuses on the primary coordinator workflow. Live ticketing integrations, authentication, persistence, and real model calls are future work.

## Limitations

- The scoring model is heuristic and illustrative.
- There is no live service ticket integration.
- There is no persistent database.
- The product should not be used for real ATM, banking, or customer-impact decisions without proper data governance and operational validation.

## Future Work

- Optional bring-your-own-key AI summarization.
- CSV or ticket import for approved synthetic datasets.
- Exportable dispatch summary.
- More detailed repeated-failure trend visualization.
- Accessibility audit with browser automation.

## Product Decisions

The product combines prompt-shaped triage logic, visible severity evidence, human oversight, responsive interaction design, and repeatable validation.
