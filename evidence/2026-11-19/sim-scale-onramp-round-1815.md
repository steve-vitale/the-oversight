# Scale-onramp round 1815Z — adoption closeout (Loop A, axis scale-onramp)

**Run:** fleshout-20261119T1815Z · **Adoption agent:** 1b6f57c2 · **Master at closeout:** `2ea70f298`
**Status: merged locally, pending ship.** All three arms verified from files/corpora (never from
the timed-out run's word), merged ff-only, gated, findings updated, worktrees released,
claim retired, lock deleted. No push, no version bump.

## What happened to the run

The run timed out at its 2-hour limit with workers 1 and 2 still active and arm 3 never spawned.
A host write flap ran 19:34:48–~20:22Z (~46 min) and SURVIVED a VM replacement (~19:51Z, new boot
6af3eca9) — writes still failing on the new boot at 20:18Z. The flap cleared ~20:20–20:22Z
(watcher alive again, `ALL-OK` 20:22:27Z). Both arm workers were DONE/cancelled at timeout with
no result of their own; all work was recovered from the files. The flap cost arm 2 its proof test
(written 19:55Z, 0 bytes — the classic flap signature) and arm 1 five arm-leg corpora (recovered
from log dumps). Master moved four times during the adoption (r148 `eb811cb07`, Loop B 1830Z
`acbcb24af`, social r239 evidence `68b1f6370`, then this round's own merges); every branch was
rebased onto the moving tip before merging. The rebase stop-at-pick quirk struck twice
(bowcraft at `555faab12`, slingstone on its second rebase) — verified unapplied via
`git diff <pick>` and continued cleanly both times. The safe-commit index clobber struck on all
three arm commits — repaired each time via `git ls-tree -r HEAD | git update-index --add
--index-info`; every commit verified correct.

## Arm 1 — sim-bowcraft-confirm-a: CONFIRM GO, BOWCRAFT TURNED ON

The pilot (1415Z, BUILD-GO, env-gated OFF) replicates on a fresh band. Identical-seed
before/after is not the shape here — the confirm is a fresh-band two-leg panel, band
107011–107018, 8 seeds × 150d, base `7e0810eea`, anchor `555faab12`.

- Craft attempts: arm 54 (ok 15) vs ctl 0 (bar ≥ 3). Bows crafted: 15 (crude_bow 13, bow 2)
  vs 0 (bar ≥ 3). Bowless departure share: ctl 0.584 (160/274) → arm 0.490 (118/241),
  delta **0.094** (bar ≥ 0.05 — stronger than the pilot's 0.063, not carried by one seed).
- No regression: median survival 150 vs 150, starvation 3 vs 5, deaths/seed 79.4 vs 80.8.
  All 16 corpora verified (seed/mode/bowcraftOn/anchor, 0 errors).
- Panel compare `review_required` on 2 regression_watch rows (deaths/100d +1.55, interval
  −2.48 to +6.75; community loss 0.25 → 0.375, interval −0.25 to +0.5) — both intervals
  straddle zero, frozen guardrails pass; verdict stands GO.
- Secondary: knows-bow days 1,764 → 8,513 (seeing-seeding works); attribution completeness
  arm 0.892 (the ≥ 0.90 bar missed — metric-review note); ranged-at-entry 6/11 ctl vs 4/8
  arm (no improvement); wave-5 ctl 3/8 vs arm 2/8 — the pilot's 0 → 4 wall movement does
  NOT replicate (recorded as band noise).
- **Turn-on decided and landed:** BOWCRAFT on in live play (`src/js/villager-build.js`:
  env gate → `let bowcraftOn = true`; both drivers `BOWCRAFT_ON = true`, ctl leg retired;
  both tests updated). Proofs 59/59 + 58/58, re-run green after the rebase onto the moving
  master. Finding #2597 FIXED. Merged ff-only: evidence `4b5503fab`, turn-on `0381d4332`,
  rebased tip `d56fbe819`. Evidence: `evidence/2026-11-19/sim-bowcraft-confirm-a.md`.

## Arm 2 — sim-fusioncell-fix-a: NO-GO, fix REVERTED

The fix for finding #2599 (searcaster contest-prize grants bundle 2 fusion cells; tier-4
contest roll returns a cell with p=0.25). Same band as the diag (107021–107028), 8 seeds ×
150d, two legs differing only by FUSIONCELL.

- Bar 1 PASS: armed holder at entry 7 (ctl 0). Bar 2 **FAIL**: armed volley fired 0
  (ctl 0). Bar 3 PASS: cell supply 14 vs 3 (bar ≥ 6); 3 holders with cells (bar ≥ 2
  alternate). Bar 4 **FAIL**: median survival 147.5 vs 143.5 (pass); deaths/run 91.0 vs
  76.6 (bar ≤ 84.29). Panel compare `review_required`, regression_signal on village
  deaths per run (+14.375, 95% interval 4.75 to 23.625 — does not straddle zero).
- **The participation finding:** all 7 armed entries are ONE holder — nora_wilson, seed
  107028, 2 cells, days 131–143 — never the lead fighter (leads: app_mgpsphru785 ×5,
  visjoin_136, visjoin_140); the volley is lead-only, so her searcaster never fires, and
  all 7 fights end vFlee. The prereg's risk note called this shape exactly: a NO-GO on
  bars 1–2 with bar 3 passing is a PARTICIPATION finding, not a supply finding. The
  follow-up belongs to a participation arm (who leads a wave-4+ fight — and why a party
  with an armed searcaster flees seven times running), not a bigger bundle.
- **Metric review (§14, recorded, NOT a re-score):** the deaths gap tracks an exposure
  confound. Wave-4+ meetings: arm 192 vs ctl 85; engaged 171 vs 63. The gap concentrates
  in two seeds (107024: ctl 0 → arm 73 meetings; 107028: ctl 4 → arm 39) — the fix's
  extra RNG draw per tier-4 contest roll shifts the whole stream downstream, so the legs'
  worlds diverge. Deaths per engaged meeting favor the arm leg (4.26 vs 9.73). Proposal
  for the next run: judge the guardrail exposure-normalized (deaths per engaged wave-4+
  meeting) and/or use a draw-neutral design. The raw deaths/run bar punishes any flag
  that consumes RNG draws, however harmless.
- **Reverted per the frozen ladder:** `src/js/contests.js` + `src/js/game.js` restored to
  master before commit; 0 src files in commit `f482b0706`; FUSIONCELL absent from both
  files on master (verified). Instrument + evidence only. Proof test rewritten by the
  adoption (worker's file lost as 0 bytes to the flap), 26/26; diag test still 40/40;
  analyzer selftest 34/34. Finding #2599 stays OPEN.
  Evidence: `evidence/2026-11-19/sim-fusioncell-fix-a.md`.

## Arm 3 — sim-slingstone-b: DIAG-NO-GO (drain pool only), instrument repaired

DIAG re-run of slingstone-a on the SAME band 107021–107028 with the census-epoch instrument
(finding #2608) + #2609 window fix. Same frozen bars as slingstone-a. Judged sims ran on base
`16975bb01` (rebased pre-sim from `7e0810eea`); the BOWCRAFT turn-on (`d56fbe819`) post-dates
them — recorded, not hidden. No game-code fix (DIAG arm).

- Completeness **1.000** (bar ≥ 0.90 — PASS; was 0.783). Departure pool **22** stone-carrying
  sling departures, 55 stones pocketed (bar ≥ 15 — PASS). Drain pool **18** intervals with a
  positive net drain (bar ≥ 25 — **FAIL**). Split quantified (PASS): volley 0.959, craft
  0.000, gear 0.000, death 0.041, residual 0.000; duty wraps live (1,065 calls each);
  majority cause volley 96%. Volley cross-check: 0 violations in 120 sling fights.
- The instrument closed the books exactly: residual 13 → 0, unexplained gains 11 → 0,
  vanished 2 → 0, deaths found 0 → 3, epoch-less rows 0. The a-sensitivity prediction
  (D=49, volley 47, death 2) reproduced exactly. Craft takes 0 in 1,065 duty-days on the
  second band running. The NO-GO is carried by the drain pool alone; the question #2600 is
  answered on a fully attributed ledger. **No 12-seed confirm** — gated off by the NO-GO.
- Drain-pool floor mis-sizing confirmed on a second band (18 intervals on both — it scales
  with departures, 22, not carrier-days). Proposal for the next run: size on departures
  (~30+ stone-carrying departures) or count departure-to-empty cycles. Not applied here;
  frozen bars judged as written.
- Proof 49/49 (incl. epoch unit cases + live smoke); analyzer selftest 58/58. Judged sweep
  exit 0, 0 instrument errors, 8 seeds, anchor `16975bb01`, `senseexpedOn` true /
  `bowopenOn` false on all 8 corpora. Panel compare `review_required`, all deltas 0.
  Merged ff-only by the worker (verified by the adoption from git: branch is an ancestor
  of master): arm `9c410a182`, rebase notes `d07ab4312` + `2ea70f298`. Finding #2600
  CLOSED; #2608 CLOSED (proven); #2609 APPLIED. Evidence:
  `evidence/2026-11-19/sim-slingstone-b.md`.

## Gate (adoption-run, on the merged tip 2ea70f298)

`node scripts/check.js --quick`, full log `evidence/2026-11-19/check-quick-round-1815.log`:
**339 passed, 5 failed in 759s, 0 attributable.** The 5 failures are the exact standing set
seen on the 1415Z, 1530Z and 1830Z gates and the sibling r239 gate minutes earlier:
measurement-proof staleness pair (`test-measurement-proof-update.js`,
`test-measurement-workflow.js`), phone-frame stale receipt
(`test-phone-frame-proof.js`), and two 120s deed-attainment timeouts
(`test-living-garden-deed-attainment.js`, `test-one-person-army-deed-attainment.js` —
both solo-verified green on prior rounds). No new failures; no solo re-runs owed. This round
changed one src/js file (villager-build.js — the BOWCRAFT turn-on, on-path).

## Telemetry

`telemetry-baselines/` does not exist in the main tree (no `scale-wall.json` anywhere);
the baseline was never rolled, so no telemetry check could run against it. No LOUD lines.
The worker's note stands: baseline not rolled (anchorCommit mismatch still uninvestigated).

## Walls (this round's bands)

- Bowcraft confirm: wins 0/8, national 0/8, table 0/8, wave-5 ctl 3/8 vs arm 2/8.
- Fusioncell: wins 0/8, national 0/8, table 0/8, wave-5 arm 4/8 vs ctl 2/8.
- Slingstone: wins 0/8, national 0/8, table 0/8 (diag band; wave-5 not a judged metric).
- Scale-onramp stays converging (NOT converged): the bowcraft turn-on is the first lever in
  this program to replicate on two fresh bands and land on, but no arm demonstrated national
  reached, and the seat is still nowhere in sight.

## Findings filed / updated

- #2597 FIXED (bowcraft confirm GO + turn-on, this run).
- #2599 updated (fusioncell fix NO-GO — participation finding; supply proven fixable,
  volley is a lead/flee question; exposure-normalized guardrail proposed).
- #2600 CLOSED (slingstone-b: volley 95.9%, death 4.1%, craft 0, residual 0).
- #2608 CLOSED (proven — census-epoch instrument closes the books exactly).
- #2609 APPLIED (window [prevRowDay, rowDay], epoch-first; fallback never fired).

Next blanks, in order: (1) fusioncell participation arm — who leads a wave-4+ fight and why
an armed party flees (with the exposure-normalized guardrail from the §14 proposal);
(2) slingstone drain-pool floor re-sized on departures for the next diag, if the question
needs re-asking (it is closed as answered); (3) the standing walls — launch decision +
damage, deed gate after national, standing-199 stall — unchanged by this round.
Claim retired; lock deleted. Round evidence: `evidence/2026-11-19/sim-scale-onramp-round-1815.md`
(master 2ea70f298 + closeout commit below).
