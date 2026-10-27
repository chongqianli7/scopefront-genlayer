# Validation

Six frontend tests cover price/scope trade-offs, uncertainty, broader offers, equal-offer ties, price parsing and finalized execution guards. Eleven mocked-host contract tests cover permission gates, immutable offers, full lifecycle, incomplete matrices, validator disagreement, forged quotations, uncertainty, invalid addresses/prices and exhaustive small dominance combinations. They simulate GenLayer host/model behavior and are not network evidence.

The production build succeeds. Browser extension wallet signing and mobile wallet deep links require separate testing. Network evidence is recorded separately after actual finalized transactions; no local example is claimed as real consensus.
