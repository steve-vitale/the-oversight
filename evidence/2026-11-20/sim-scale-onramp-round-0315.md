# sim-scale-onramp-round-0315 — Loop A run fleshout-20261120T0315Z

**Run:** fleshout-20261120T0315Z · **Axis:** scale-onramp (CONVERGING, NOT converged)
**Base:** master 59711ccc5 at run start; master 5e82171ee at closeout.
**Arms (2):** sim-gunrate-a (#2599) + sim-depmat-a (#2590), band 107051–107058 reused,
8 seeds × 2 legs, 150d, competent verbatim, substrate
VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1.

## Verdicts — both NO-GO, both landed (instrument + evidence only, game code reverted)

### sim-gunrate-a — NO-GO kind PARTICIPATION (merged 5e82171ee)
Evidence: `evidence/2026-11-20/sim-gunrate-a.md`; prereg `evidence/2026-11-20/sim-gunrate-a-prereg.md`.
Lever: searcaster-weighted tier-4 contest prize + recipient weighted toward expedition holders.
Frozen bars: holder-days 23 → **177** (≥40 PASS); armed-holder entries **0** (≥3 FAIL);
armed volleys **0** (≥1 FAIL); guardrail deaths/engaged 4.55 vs 5.14 ctl (PASS), median 150d both.
Root cause, proven: the 2-cell bundle is exactly one opening volley and the volley is
wave-agnostic — holders burn both cells in the first low-wave fight they lead (4/4 cell-loss
days coincide with a led kill); Lautaro then leads five wave-4/5 fights with the empty gun.
Next lever: **cell supply per gun, not gun rate**. Open observation: catalina's gun left all
visible inventory day 93 with no recorded sink (no transfer instrumentation).
Proof test 39/39 pre-pilot; analyzer selftest 45/45; check.js --quick 339/5 (5 pre-existing,
unrelated). Panel `review_required` (retired raw-deaths metric; frozen guardrail passes).

### sim-depmat-a — NO-GO (merged 8d0871f58)
Evidence: `evidence/2026-11-20/sim-depmat-a.md`; prereg `evidence/2026-11-20/sim-depmat-a-prereg.md`.
Lever: DEPMAT trailhead bundle — a crude_bow-knowing crafter gathers the missing branch/vine
at the departure site (pile reservation rejected: pile vine is 0 on 32/34 spear departures).
Frozen bars: pool floor 28 ✓; gate 28/28 and 108/108 ✓; **attributable-SERVED 5** (≥3 PASS);
**served-bow volley join 0** (≥1 FAIL); consistency rate-based FAIL (departures 321 vs 458,
spearSeen 28 vs 108 — lever fires day 2, cascades villages apart); guardrail FAIL
(deaths/engaged 48.44 vs 40.67 ctl). All 5 served spear-holders who lead wave-4+ meetings
**evade** (5 meetings, 5 evades); the 35% roll eats 10/15 spear picks. Vine wall confirmed
band-wide (95 knowing spear-holders went without on ctl, pile vine empty 101/108).
Proof test 43/43 pre-revert; analyzer selftest 59/59; check.js --quick timed out at 240s
under sibling load (76/344, no failures) — N/A with zero src/ diff. Panel `review_required`,
no material signal.

## Wall numbers (both bands)
- Gunrate: national 0/16, wins 0/16, wave 4 16/16, wave 5 7/16, median survival 150d both legs.
- Depmat: national 0/8, wins 0/8, wave 4 8/8 both, wave 5 4/8 both, median 150d ctl / 148.5d arm.
- The scale wall stands: nothing reached national or the table on either band.

## Infrastructure (this run)
- Write flap active from ~08:31Z; VM restarted ~09:21Z (uptime 0 min), clearing the flap.
  Earlier probes failed 2×; post-restart fresh writes + appends pass.
- REGISTRY.json was 0 bytes (flap truncation ~08:50Z); the 0815Z run had stood down on the
  same loss and deferred the rebuild. This run rebuilt it 09:25Z from `git worktree list`
  (14 trees, cap 16, all active, Oct-30 precedent) and validated with a dry-run reaper.
  A sibling rebuild at ~09:32Z overwrote it (owners degraded to unknown, depmat entry
  dropped); the registry was NOT re-rewritten in response — it parses, the reaper works,
  and the depmat landing was completed at the git level after verifying the branch fully
  merged and the worktree clean.
- Master moved twice under the run: journey-scale r246 adoption landed 6b8051ec2 (the
  depmat merge guard correctly refused the stale base; rebased clean, selftest re-run
  green before the ff-only merge), then depmat 8d0871f58, then gunrate 5e82171ee.
- The 0815Z Loop A run (6 min before this one) had stood down flap-blocked on the same
  registry loss; the Loop B 0530Z adoption (claim live all run) was not touched.
- Telemetry check: `telemetry-check.js` run on both arms, both legs (logs
  `evidence/2026-11-20/telemetry-round-0315-gunrate.log` / `-depmat.log`): the tool
  **refuses recorder-corpus input** — all 8 rows per leg carry top-level `anchorCommit`,
  so they are sweep recorder rows, not runs; exit=2 on all four invocations, no LOUD
  deviations, no baseline rolled. Same refusal as the 0515Z adoption; the tool is working
  as designed. No push, no version bump, no live verification (ship loop owns).

## Next blanks (unchanged in order, levers renamed by the verdicts)
1. #2599: cell supply PER GUN (bigger bundle / wave-gated volley / cells that survive the
   first low-wave fight) — gun rate is proven sufficient (177 holder-days).
2. #2590: the evade wall (why served leads evade every wave-4+ meeting); the 35% roll;
   spear-holder-only scoping so the next paired comparison survives past day 2.
3. The standing walls — launch decision + damage, deed gate after national, standing-199 stall.

## Metric review (round level)
- Both arms judged on frozen bars; both NO-GOs stand on their failing bars, not re-scored.
  Depmat's raw staged delta (17) is recorded beside attributable-SERVED (5) and does not bind.
- Gunrate's panel `review_required` is the retired raw-deaths metric; the frozen
  exposure-normalized guardrail is the judge (passes). Depmat's panel shows no material signal.
- The day-2 cascade class (a lever that fires from day 2 and diverges the villages) needs a
  prereg-level guardrail for the next arm: a departure-count or spear-pool drift bound, so a
  paired comparison that collapses on day 2 fails fast instead of running the full band.
