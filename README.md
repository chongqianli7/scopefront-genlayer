# ScopeFront

A service quotation desk where vendors sign their own fixed-price terms, GenLayer validators agree on each scope item's coverage, and deterministic code retains the price/scope trade-offs. A buyer may select only a frontier quote; only that vendor may confirm it. No payments or escrow are involved.

[Open ScopeFront](https://chongqianli7.github.io/scopefront-genlayer/) · [Deployed contract](https://explorer-studio.genlayer.com/address/0x7a25061Ef97f8f7f269988C7d4F85b029776C86B) · [Network evidence](evidence/studionet.json)

## Why this exists

A cheap website quote excluding source files is not directly equivalent to a dearer quote including them. ScopeFront preserves both as alternatives. A third quote costing more for the same covered items is dominated and cannot be selected. Ambiguous coverage is not silently treated as included: any UNCLEAR item holds that entire quote outside the selectable frontier.

## Use the desk

1. Explore **Price vs scope**, **More scope earns a place**, and **Ambiguity stays out**. These are authored illustrations, labelled separately from live chain records.
2. Choose **Live on GenLayer → Read published example** to inspect the configured finalized request without a wallet.
3. For a new request, connect a browser wallet on Stable Studionet (61999). Verify the configured contract or deploy the bundled contract once. Set the buyer address and a fresh request ID.
4. Open a request with 2–5 independent scope items and 2–4 invited vendor addresses. The brief, currency and vendor list are immutable; the buyer must be distinct from vendors.
5. Each invited vendor connects its own wallet and submits one immutable fixed total and its exact terms. All invited quotes are required before comparison.
6. Compare with GenLayer. The leader and validators independently assess the complete ordered vendor/criterion matrix. Exact labels must agree; quote evidence is checked against the corresponding signed text. Successful consensus freezes the comparison.
7. Inspect the matrix and dominators. The buyer can select only a fully assessed, non-dominated quote. Only the selected vendor can confirm. Export the public record and any loaded receipt.

A frontier is not a quality ranking or an assertion that all needs are satisfied. Every item is an independent optional coverage dimension. There is no mandatory-item setting or hidden weighted score. Explicit exclusions remain visible on candidate quotes.

## Fixed comparison rule

`A` dominates `B` only when A's fixed price is no higher, A includes every scope item B includes, and either A is strictly cheaper or includes at least one additional item. Equal offers both survive. Quotes with any UNCLEAR item neither dominate nor appear on the selectable frontier.

GenLayer is central because interpreting exclusions, extra-fee conditions and unconditional scope promises is semantic. The consensus matrix changes selectable addresses; the owner cannot override it. Code, not model prose, calculates dominance and enforces the two-party lifecycle.

## Run and test

Requires Node.js 22+ and Python 3.11+.

```sh
npm ci
npm test
python -m unittest discover -s contract-tests -v
npm run build
npm run dev
```

`dist/` is a portable static build with relative paths. The app pins GenLayerJS 1.1.8 and viem 2.57.8. It needs no server, paid AI API key, or server-held wallet key. The canonical contract is `contracts/scopefront.py`. Network configuration is Stable Studionet only: chain ID 61999, RPC https://studio.genlayer.com/api.

## Buyer decision workspace (v1.1)

The comparison desk now includes a budget and required-scope workspace. Load the published chain example or use an illustration, scroll to **Buyer decision workspace**, enter a maximum fixed total, check required scope items, and press **Apply preferences**. An exact-budget quote qualifies. Required items qualify only when consensus labels them INCLUDED. Unclear, unassessed and dominated quotes stay outside the shortlist. Equal cheapest offers remain tied.

The table explains every exclusion and shows budget headroom. Download the full decision report as JSON (record, provenance and preferences included), or the result table as CSV with amounts in minor units. Preferences reset when changing requests or illustrated scenarios. They are local buyer decision support and do not modify contract rules or automatically select a vendor.

See [release changes and reproduction steps](MILESTONE.md).

## Transaction recovery

The UI verifies complete deployed source bytes and protocol before writes. It persists a pending intent before asking for a signature and saves the returned hash immediately. A timeout or unknown wallet response keeps new writes blocked. Paste the exact existing hash from wallet activity and use **Resume tracking**; this only reads. Explicit signature rejection releases the intent.

Success requires FINALIZED, MAJORITY_AGREE, successful leader execution, receipt binding to sender, target, method and exact arguments, and matching finalized state readback. A confirmed terminal failure is shown as a failure and releases the guard. Resume after a readback failure; do not blindly repeat writes. Wallet network/account changes require reconnecting. Pending state is local to this browser; preserve hashes separately before changing browsers or clearing storage.

## Trust and scope

The structured integer total and request currency are the comparison price. Monetary wording in terms is not independently reconciled or converted; inspect conflicting price statements before relying on a quote. Signed quotes are authoritative inputs to this comparison, not independent proof of a real business, correct price basis or delivery. All test accounts may be controlled by one operator. The contract does not fetch linked evidence, verify identity, detect collusion, assess workmanship, audit hidden fees, or execute a legal agreement. Vendors can lie or withhold a quote/confirmation. Public terms and prices are immutable. A clarification requires a fresh request and fresh signatures. Avoid confidential quotation text.

The final confirmation is an application acknowledgement of the selected exact quote, not a payment, binding purchase order or guarantee. There is no deadline, cancellation, vendor replacement or administrator override in this bounded version.

## Files

- `contracts/scopefront.py`: signed request, offer, consensus matrix, frontier, selection and confirmation.
- `src/model.js`: illustrated scenarios, deterministic client frontier and decimal-price parser.
- `src/app.js`, `src/style.css`: responsive comparison desk and recovery workflow.
- `src/chain.js`, `src/receipt.js`: wallet integration, source verification, receipt guards and binding.
- `tests/`, `contract-tests/`: frontend logic and mocked-host contract tests.
- `network.html`, `scripts/network-browser.js`: local-only resumable network verification utility. Not in the production build; temporary private keys stay in the tab session and are omitted from exported evidence.
- `evidence/`: network results and verification boundaries.

MIT licensed.

## Published network example

Select **Live on GenLayer → Read published example** to read request `web-1793128145389` without a wallet. The source-verified contract is `0x7a25061Ef97f8f7f269988C7d4F85b029776C86B`. Ten finalized transactions demonstrate deployment, opening, three signed vendor quotes, independent scope consensus, rejection of a dominated selection, valid buyer selection, rejection of the wrong confirming vendor, and selected-vendor confirmation. The final record is CONFIRMED. All four test wallets are controlled by one operator; the brief and offers are synthetic, and all transfers are zero value. See [validation](evidence/VALIDATION.md).
