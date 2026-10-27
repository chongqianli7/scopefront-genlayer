# Protocol: scopefront-1

Each request is namespaced by buyer address and request ID. Signed inputs are immutable. Contract methods return JSON strings; `get_request` returns an empty string when absent.

| Method | Caller | Arguments | Effect |
| --- | --- | --- | --- |
| open_request | Buyer | id, title, currency, criteria_json, vendors_json | Fixes brief, 2–5 scope items and 2–4 distinct invited vendors. |
| quote | Invited vendor | owner, id, cents, terms | Records signing vendor's immutable offer. |
| compare | Anyone | owner, id | Requires all offers; agrees coverage and freezes frontier. |
| select | Buyer | id, vendor | Selects a frontier vendor only. |
| confirm | Selected vendor | owner, id | Records final acknowledgement. |
| get_request | Anyone | owner, id | Reads public JSON state. |
| get_protocol | Anyone | — | Returns scopefront-1. |

State: QUOTING → COMPARED → AWAITING_VENDOR → CONFIRMED. Failed assessments leave QUOTING unchanged; zero selectable quotes remain COMPARED. No override or quote revision is available.

## Consensus

The input contains the complete immutable brief and signed offers in invited vendor order. Every output cell identifies its zero-based criterion index. The contract validates complete ordered rows, allowed labels, bounded reasons and verbatim per-offer quotation evidence. An UNCLEAR cell may have an empty quote because absence cannot be quoted. INCLUDED/EXCLUDED require source excerpts.

INCLUDED means an explicit unconditional full promise at the fixed total; EXCLUDED means explicit denial, partial coverage or an additional fee; silence, ambiguity, conditional availability and contradictions are UNCLEAR. No links are fetched. Supplied text is treated as evidence, never instructions.

The custom equivalence validator independently runs the same assessment, validates its output, then requires exact agreement on all labels. Reasons and evidence wording may differ, but all quotes must pass deterministic source containment. The comparator fails closed on invalid output or disagreement. Only after consensus do deterministic code and storage run.

## Dominance

For fully classified offer i, let C(i) be the set of INCLUDED indices and P(i) its integer cents. j dominates i iff P(j) ≤ P(i), C(j) ⊇ C(i), and at least one inequality is strict. The frontier contains fully classified offers without a dominator. UNCLEAR offers are incomparable and ineligible, rather than model-ranked.

Any frontier quote can still exclude requested items. The buyer explicitly chooses among trade-offs. The selected signing vendor must acknowledge the immutable record; no admin can confirm for it. This is a bounded scope comparison and acknowledgement protocol, not procurement certification.

Bounds: request ID 1–48 alphanumeric/hyphen/underscore; title 3–120 chars; each item 10–400 chars; vendor terms 30–2400 chars; integer price 1–1,000,000,000 cents; USD/EUR/GBP/CNY fixed per request. No currency conversion, recurring fees or tax calculation. Quotes must state an all-inclusive total; the contract cannot verify that they are truthful.
