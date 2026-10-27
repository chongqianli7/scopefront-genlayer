# Validation

Six frontend tests cover price/scope trade-offs, uncertainty, broader offers, equal-offer ties, price parsing and finalized execution guards. Eleven mocked-host contract tests cover permission gates, immutable offers, full lifecycle, incomplete matrices, validator disagreement, forged quotations, uncertainty, invalid addresses/prices and exhaustive small dominance combinations. They simulate GenLayer host/model behavior and are not network evidence.

The production build succeeds. Browser extension wallet signing and mobile wallet deep links require separate testing. Network evidence is recorded separately after actual finalized transactions; no local example is claimed as real consensus.

## Real Stable Studionet workflow

`studionet.json` records ten actual finalized transactions on chain 61999 with full consensus and zero transfer value. Eight succeeded. Two intentionally failed with leader execution errors: NOT_FRONTIER for selecting the dominated offer, and NOT_SELECTED_VENDOR for confirmation from another address. The consensus matrix was INCLUDED/EXCLUDED/EXCLUDED for quote A and INCLUDED/INCLUDED/EXCLUDED for B and C. A and B remained candidates; C was dominated by B. Final readback is CONFIRMED with B selected. Exact deployed source bytes matched the bundled contract.

All four signing test wallets belong to one operator; these are synthetic service offers, not independent firms or a real procurement. This is a permission and semantic-workflow fixture, not a general accuracy benchmark or a prompt-injection robustness test. Browser extension signing and mobile deep-link signing remain unverified.

Browser QA verified the three authored scenario transitions, source-verified live readback, and a 390-pixel iframe layout without horizontal overflow. These are browser interface checks, separate from extension-wallet signing.
