# Release Notes

## v1.0.1

Adds dedicated standalone browser hardening.

### Included

- Local and deployed Playwright coverage for queue selection, classification, recurrence evidence, approval, return, and audit history.
- Desktop, mobile, keyboard, overflow, console, and failed-request checks.
- Correct ARIA meter semantics for the incident severity score.
- Automated axe-core verification at desktop and mobile viewports.
- Stronger repository privacy scanning for personal email, local user paths, and private development notes.
- Updated validation evidence and screenshots.

## v1.0.0

Initial standalone release of SignalOps Triage.

### Included

- Synthetic incident queue.
- Editable incident intake.
- Deterministic classification and severity scoring.
- Repeated-failure cue detection.
- Dispatch recommendation.
- Human approval and rejection actions.
- Audit trail.
- Case study, README, validation script, and GitHub Pages-ready static structure.

### Validation

- `tests/validate.ps1` passes locally.
- No real customer, banking, transaction, or credential data is included.
