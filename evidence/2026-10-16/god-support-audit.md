# NPC support reaches the player under its existing terms

Decision: retain this narrow repair, with natural access and active commands
still open. Baseline is `3ed704895a0e9883977e86e46718d5ff4a7276d0` on
`codex/resume-claude`. Only `src/js/game.js` and `src/js/godverbs.js` change
campaign runtime. Policy, observer, contract, costs and magnitudes are fixed.

An NPC One-Person Army holder's actual below-half-health wound could rally
nearby NPCs but explicitly skipped the player. Player damage also ignored the
rally flag, and player turn entry never expired it. The repair includes a
distinct living player within the existing Chebyshev radius3, keeps the
once-per-fight guard and3-turn flags, and consumes the existing raw +4 damage
convention on sourced foe damage. Both explicit `p` abilities and actual
Strike's `('you', null)` source work. Addition precedes existing food
multiplication. Environmental damage, zero damage, dead/fled sources and
friendly backlash get no new benefit. Own-turn entry expires both flags,
including a turn lost to stun, matching the existing NPC convention.

An NPC Voice's actual fatal hit also explicitly skipped the player. It now
stuns the distinct living player and clears rally like other allies. The
existing player `stunFull` flag makes that one lost action rather than only
lost movement. Canonical self aliases cannot grant either ally effect to
their current bearer. No attack or other player choice is automated.

## Proof and limits

- Shared-kit runtime:27/27 candidate,19/27 frozen baseline. Real wound/death
  calls, real player Strike, turn entry, and the real scheduler's skipped turn
  distinguish the repair. Prepared holders and positions do not prove access.
  Reconstructed candidate also passes27/27.
- Phone390x844: authored fixture grants a late NPC holder and calls the real
  hit path. Native Strike lands, native Wait reduces rally3→2. A separate
  fallen Voice scene starts with stunned1/full1; native Wait advances through
  lost round2 and returns player choice in round3 with both flags0. Retained
  JPEGs show Strike/HP9986 and the restored round3 choice. They are separate
  randomly generated prepared scenes, not seeded campaigns or damage deltas.
- Standard64 seeds each for capable, maker, merchant and caregiver:256 matched
  campaigns,260 jobs/arm including four seed7 observer-off controls. Exact
  outcome rows, final full-state hashes and all23 scalar metrics are equal in
  every pair. Comparator: `no_material_signal`; all controls pass, no observer
  errors or runtime warnings. Baseline's existing corrected-observer cache is
  reused only after exact source/observer/contract and result-key validation.
  Its original panel HEAD is the earlier `dc95de12` source-equivalent commit;
  that provenance is retained. The before runtime manifest equals3ed's
  archived source; no historical HEAD or job identity is rewritten.
  This is one standard cohort; its first16 seeds are contained in64, and no
  independent holdout was run.
- Corrected resident exposure contains zero sampled eligible NPC Voice or
  One-Person Army holders in all four policies. This is daily/terminal sampling,
  not proof of never holding either build between samples. These unchanged
  campaigns cannot establish naturally useful support or a balanced affected
  population. Do not call zero exposure broken content or a win-rate verdict.
- Full suite first945/946, then946/946 with the26-assertion test. A final
  source fallback guard also rejects explicit empty source keys; the final
  27-assertion proof,174/174 quick and946/946 full results are retained
  separately. The first
  failure is the unchanged hunter-ecology test's dry-land minnow assertion:
  crafting can consume its finite materials before a trap exists, while its
  test helper discards crafting messages and ignores its own failure result.
  Its setup RNG is outside its per-operation stubs. Seeded original-script
  controls0–159 match stdout/stderr/exit on both roots;75,116,142,144 reproduce
  the exact19/20 minnow failure. No assertion, legacy source or game ecology
  rule is changed. Keep this test-isolation debt visible; a clean rerun alone
  would not explain it. Raw full-suite logs and all320 control executions stay.
  Source diagnosis: `fresh()` supplies6 branches; minnow_trap costs3 per
  attempt, consumed before the85% base success roll. Two failed paid attempts
  can leave no trap and no branches for the helper's remaining eight tries.
  Future isolation must establish an actual crafted trap before testing its
  placement gate; it must preserve the dry-land assertion and crafting costs.

## Tradeoff and remaining work

Receiving ally help is a real survival advantage; receiving the fallen Voice
penalty is a real risk. Correcting both contracts preserves the authored
support tradeoff without a win target or compensating enemy tuning. Prepared
proof is necessary because this standard cohort lacks sampled holders, but is
insufficient for natural viability. Future work must deliberately reach these
builds through fitting deeds and measure useful effects, costs and failures.

Voice's active command/Rally Cry still skips player-kind allies. So do class
broadcast/aura and the daily Voice support hook. A correct extra turn needs a
player-controlled scheduler/UI path; do not call `tbVillagerTurn(player)` or
substitute an automatic NPC attack. Player Voice death/mantle timing, broader
forty-context promises, natural titan/Network exposure and formal companion
body parity remain separate audits. Regional/nomad work and the shared tooling
branch are unchanged. This is not completion of the god support roadmap.

## Repeat and maintain

From this checkout, run:

```text
node scripts/godpath/test-god-support-player.js
node evidence/2026-10-16/god-support-verify.cjs
node evidence/2026-10-16/god-support-reconstruct.cjs after <fresh-directory>
node <fresh-directory>/scripts/godpath/test-god-support-player.js
node scripts/balance-panel.js --root <fresh-directory> --n 64 --out <fresh-panel-directory> --par 8
```

Use `before` to reconstruct the baseline with the same current proof script;
its eight failures are expected. The reconstruction requires the pinned base
commit in the local repo. Source overrides retain exact bytes and digests;
reconstructed roots have no own Git HEAD. Panels,520 hashed jobs, both runtime
logs, comparison, feature census, source bundle, legacy controls and phone
fixture remain beside this note. Receipt hashes cover all retained artifacts.
Keep source, policies, observer and contract identities distinct on reruns.
Do not overwrite this evidence after a gameplay/policy change. Update this
note, SCALE-AUDIT and SURVIVAL-LEVERS together when closing the remaining paths.
