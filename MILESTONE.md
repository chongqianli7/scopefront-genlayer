# ScopeFront v1.1 — Buyer decision workspace

## Change from v1.0

Baseline: `ccae7cb6213a8cc4e9f29d2f4dfbf9f752c9d8ec`.

The original desk displayed the protocol's Pareto frontier and allowed buyer selection. It did not evaluate which of those trade-offs met a buyer's budget and essential scope, or produce a preference-based decision report.

This release adds an interactive buyer decision workspace:

- Optional maximum fixed total in the request currency, with exact-budget inclusion and visible budget headroom.
- Required-scope checkboxes evaluated against the existing consensus labels.
- A complete result table explaining budget, missing requirements, ambiguity, unassessed records and dominance exclusions.
- Cheapest qualifying alternatives with equal-price ties preserved.
- JSON decision reports containing the underlying public record, provenance, preferences, reasons and limitations; CSV comparison exports with explicit minor-unit headings.
- Desktop and mobile layouts and scenario/request preference resets.

## Reproduce

1. Open https://chongqianli7.github.io/scopefront-genlayer/ and scroll to Buyer decision workspace.
2. In Price vs scope, set budget to 1000 and require original editable design source files. Apply preferences. Only Quote B qualifies; A lacks required scope, C is over budget and dominated. Budget headroom for B is zero.
3. Require thirty days of bug fixes. No quote qualifies. Switch to More scope earns a place, require bug fixes again, and apply: Quote C qualifies when budget is unlimited.
4. Switch to Ambiguity stays out. Require source files: B remains excluded for unclear coverage; C qualifies. Preferences reset on scenario changes.
5. Download both report formats. JSON identifies illustrative provenance for examples.
6. Choose Live on GenLayer, then Read published example. Apply preferences to its finalized record and export: provenance is FINALIZED_CHAIN_READBACK with the deployed address.

## Scope and evidence

The feature is an application-level integration with the existing signed quotes and GenLayer consensus matrix. Deployed contract source and address remain unchanged. This release does not claim a new deployment, new on-chain transactions, independent users or traction. Existing network evidence documents the original deployment only.

Required items narrow buyer preferences locally; they do not introduce protocol-level mandatory items, remove valid frontier choices from the original selection controls, or override the two-party confirmation flow.

Validation: 11 JavaScript tests, including five new decision-workspace tests; 11 existing mocked-host contract tests; production Vite build. The build retains the existing large-bundle advisory. DOM interaction checks also passed for applying preferences, exclusion reasons, scenario reset, ambiguity, JSON/CSV download actions and published-record loading with mocked network responses. The updated GitHub Pages deployment and GitHub Check workflow passed for feature commit `687c33088f8692e0efac0ace1e2b8d395a6b92b1`. Live browser validation passed for budget/required-scope filtering, desktop rendering, both downloaded report contents, and reading the existing finalized chain example. A decision report exported from that live readback is included at [evidence/milestone-1/decision-report.json](evidence/milestone-1/decision-report.json). With a USD 1000 budget and source files required, only Quote B qualifies at zero budget headroom. This verification reads existing finalized state; no new on-chain transaction is claimed. Mobile layout is implemented but has not been visually verified in a mobile browser.

## Submission description

ScopeFront now turns the GenLayer-agreed quote coverage matrix into an actionable buyer decision workspace. Buyers can set a budget and essential scope, see exactly why each signed quote qualifies or fails, retain equal cheapest alternatives, and export auditable JSON decision reports or CSV comparison tables. The earlier release stopped at the Pareto frontier; this release adds buyer-specific feasibility analysis and portable decision evidence while preserving the on-chain selection and vendor-confirmation rules.
