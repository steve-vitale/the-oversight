# sim-searsupply-a — HALTED (pilot 3/16 seeds, NO verdict)

**Arm:** sim-searsupply-a · **Loop A run:** fleshout-20261120T0215Z
**Type:** BUILD + measure — the searcaster-supply lever for finding #2599
**Status: HALTED by coordinator direction (03:45Z) — the run's 04:15Z
closeout cut the pilot short, and no new sweeps were allowed after
~03:45Z.** The lever is BUILT, PROVEN (proof test 32/32, analyzer
selftest 45/45), and COMMITTED (branch tip `74c464d1`, see §8). The
8-seed two-leg pilot ran to **3 of 16 seeds** (smoke arm 107051 +
paired ctl 107051 + arm 107052) before it was stopped. **No verdict
is claimed here:** the four frozen bars are unjudged on a 3-seed
partial — the numbers in §4 are a signal, not a verdict. The
coordinator (or next run) finishes the pilot from §7 — re-run only
the missing seeds; do NOT re-run finished ones.
**Prereg:** `evidence/2026-11-19/sim-searsupply-a-prereg.md` (commit
`5142585fc`, frozen 2026-11-20 ~03:25 UTC, before any judged sim).

## 1. The lever (frozen design, built as preregistered)

**SEARSUPPLY=1** (default OFF; the turn-on decision is the
coordinator's, not this arm's). Three parts, all draw-neutral BY
CONSTRUCTION — zero new `Math.random()` draws on either leg (the
proof test asserts the exact draw count on every live call:
`rollAlienLoot` 2 draws, `_cxItemPrize` 3 draws, both legs):

1. **Bundle** (`src/js/contests.js` `_cxItemPrize`): a searcaster
   contest-prize grant gives the SAME recipient +2 `fusion_cell`.
2. **Villager redirect** (`_searSupplyFighter`, new in
   `contests.js`): a searcaster or fusion_cell contest prize won by
   the player goes to the village's most fight-proven living
   villager (wave-kill deeds: wave3Kill 4, wave2Kill 2, contestWin
   1 each; roster-order tie-break; alive, member, age 15–72,
   HP > 20; no away check — the System delivers wherever the
   fighter stands) instead of the scholar's pack. Other prizes stay
   with the player. Own eligibility — NOT `contestEligible` (its
   day-14 casting gate must not decide who can carry the gun; the
   first proof-test run caught exactly this: the redirect returned
   null on day 1 and the fix is in the committed code).
3. **Cell weight** (`src/js/game.js` `rollAlienLoot`): on
   contest-prize paths at tier 4 only, 3 extra `fusion_cell`
   entries join the pool (cell probability 1/15 → 4/18). Same
   single pick draw, different mapping. Trade, kill loot, show
   gifts, and corpse takes are untouched (proven live).

**NOT built:** alien-side ruin salvage for cells (the task's
"and/or" second half) — villagers almost never search ruins, so
its yield would be unmeasurable on an 8-seed pilot; documented
as the follow-up lever. No village craft for cells, ever — cells
are alien tech.

## 2. Proof (before any sim)

- `scripts/test-searsupply-a.js` **32/32 GREEN** (commit
  `6c4b75925`): defs + 15-item tier-4 contest pool; cell reweight
  on/off (appended-cell draw → fusion_cell on-leg, ordinary pool
  item off-leg); searcaster still pickable at its own index;
  trade + kill-loot paths untouched; bundle to the same villager
  (+2 cells) and to the redirected fighter; cell prize redirected;
  ordinary tier-4 prize stays with the player; control-leg
  identity (SEARSUPPLY unset: same prize, no bundle, no redirect,
  same draw counts); gear-up equips the granted searcaster;
  0-cell volley 0 shots with the "no fusion cells" line; armed
  volley fires, spends exactly its shots in cells, hits land
  64–68 per hit.
- `scripts/analyze-searsupply-a.js --selftest` **45 passed, 0
  failed** (incl. the GO / NO-GO-per-bar judge shapes).
- Draw-neutrality: the implementation adds ZERO `Math.random()`
  calls — the proof test's draw-count assertions (2/3 draws,
  identical on both legs) are the live proof, stronger than a
  grep over the diff.

## 3. Pilot status (3 of 16 seeds — HALTED)

- **Band:** fresh 107051–107058 (verified in the prereg: no hits
  in any dated evidence .md). Horizon 150d, death-aware.
  Competent verbatim policy. Substrate SENSEEXPED=1 +
  PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1.
  BOWOPEN, BOWCRAFT, SPEARGATE, FUSIONCELL unset on both legs.
- **Done (valid corpora on disk, committed):** ctl 107051 (150d,
  survived, wave 5, standing 590); arm 107051 = the smoke seed
  (150d, survived, wave 4, standing 199); arm 107052 (150d,
  survived, wave 5, standing 580).
- **Missing (next run resumes these only):** ctl 107052–107058
  (7 seeds), arm 107053–107058 (6 seeds). The driver refuses to
  overwrite finished seeds, so re-running the §7 commands resumes
  exactly the missing ones.
- **Why it stopped:** the run's 04:15Z closeout cut the pilot
  short; a VM restart ~03:41Z had already killed the first
  (detached setsid) launch with 0 seeds lost, and the coordinator
  halted the relaunched sweeps at ~03:45Z with a hard commit
  deadline of ~03:55Z. No verdict can be judged on 3 seeds.

## 4. Partial signal (3 seeds — NOT a verdict)

| Frozen bar | Ctl (1 seed) | Arm (2 seeds) | Band floor |
|---|---|---|---|
| 1. Searcaster-holder-days ≥ 40 | **0** | **22** (ella_johnson, 22 holder-days, 22 cell-days, max 2 cells, 0 zero-days — all on 107051; 107052 has NO holder) | 40 band-wide |
| 2. Armed-holder entries ≥ 3 | **0** | **4** (all ella_johnson as an ally) | 3 band-wide |
| 3. Armed volleys fired ≥ 1 | **0** | **0** | 1 |
| 4. Guardrail (exposure-normalized) | deaths/engaged 19.50 (6 engaged — noise) | deaths/engaged 4.66 (58 engaged) | arm ≤ 1.10 × ctl; median ≥ 0.80 × ctl |

- Cell supply, arm leg (2 seeds): 9 appearances (contest-prize 4,
  moved 2, spawned 1, corpse-take 2), 6 cell grants + 1 searcaster
  grant, all contest-prize; cell-holder-days 73; max cells ever held
  2 (the bundle working as designed). Ctl leg (1 seed): 0 cells, 0
  grants — the participation band's shape (0 holders, cells rare)
  so far.
- **The yield is uneven, and that is itself signal:** the lever
  produced a loaded gun on 107051 and nothing on 107052. One seed
  is not a rate, but if the full band stays this lumpy, bar 1's
  floor (40 holder-days) will depend on one or two lucky villages
  rather than a steady supply — worth watching at judging time.
  The participation shape repeats on the seeds so far: the armed
  holder never leads (0 armed leads, 0 armed volleys), and the
  redirect's deed heuristic does not select for expedition
  holders, who are the leads.
- The guardrail numbers above are NOT comparable yet (ctl's 19.50
  rests on 6 engaged meetings; most deaths on that seed are not
  fight deaths). Do not read anything into the ratio until both
  legs are full.
- Searcaster source label: the analyzer marks the one searcaster
  appearance `unexplained` — the known window-edge artifact
  (grant and last clean census share a day; the grant trail +
  prize log prove it is the contest prize). Same artifact as the
  diag; recorded, not re-scored.

## 5. Wall numbers (3-seed partial — NOT a band)

- National 0/3, table not instrumented (null, never faked), wins
  0/3. Wave 4 reached 3/3, wave 5 reached 2/3 (ctl 107051, arm
  107052). Survival 150d on all three (all survived). Standing:
  ctl 107051 590, arm 107051 199, arm 107052 580. The wall is
  unmoved on a 3-seed partial, as expected — the pilot band
  carries the wall numbers.

## 6. Sense testing (transcripts read, not just counted)

- The redirect reads as the System arming a fighter: ella_johnson
  holds the gun with its cells for 22 days and carries it into
  four wave-4 fights — the weapon is present, loaded, and
  carried, which is new (the diag's holder carried an empty gun
  for 97 days and never met a monster). What she never does is
  LEAD — the gun stays in the second row while the party runs.
  The story the numbers tell is coherent: the System finally
  hands the village a loaded gun, and the village still sends
  someone else in front.

## 7. How to finish (next run — resume, do not restart)

**The pilot is HALTED at 3/16 seeds.** The next run resumes it
with the driver commands below (the driver refuses to overwrite
finished seeds, so a re-run completes exactly the missing ones:
ctl 107052–107058, arm 107053–107058). Do NOT re-run 107051 on
either leg or 107052 on the arm leg.

```
cd ~/workspace/worktrees/sim-searsupply-a
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 MODE=ctl OUTDIR=perseed-searsupply-a-ctl SEEDS=107051,107052,107053,107054,107055,107056,107057,107058 RUN=searsupply-a node scripts/searsupply-driver-a.js > evidence/2026-11-19/searsupply-a-sweep-ctl.log 2> evidence/2026-11-19/searsupply-a-sweep-ctl.err
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 SEARSUPPLY=1 MODE=arm OUTDIR=perseed-searsupply-a-arm SEEDS=107052,107053,107054,107055,107056,107057,107058 RUN=searsupply-a node scripts/searsupply-driver-a.js > evidence/2026-11-19/searsupply-a-sweep-arm.log 2> evidence/2026-11-19/searsupply-a-sweep-arm.err
```

When both legs are done:

```
cd ~/workspace/worktrees/sim-searsupply-a
node scripts/analyze-searsupply-a.js --ctl evidence/2026-11-19/perseed-searsupply-a-ctl --arm evidence/2026-11-19/perseed-searsupply-a-arm --out evidence/2026-11-19/searsupply-a-analysis.json
node scripts/build-searsupply-panels-a.js
node scripts/balance-panel.js compare --before evidence/2026-11-19/searsupply-a-panel-before.json.gz --after evidence/2026-11-19/searsupply-a-panel-after.json.gz --out evidence/2026-11-19/searsupply-a-panel
```

Then judge against the prereg's four frozen bars (analyzer prints
the verdict + kind), update THIS evidence file from INTERIM to the
verdict (GO / NO-GO + kind), and:

- **GO:** the lever stands; commit the analysis + panel +
  corpora + logs + this evidence file with the same
  `[needs-eyes]` message family (prize redirect is a feel
  change). Report "merged locally, pending ship" via the
  coordinator.
- **NO-GO:** REVERT the game code (`git checkout -- src/js/contests.js src/js/game.js`
  — the lever must leave no trace) and commit instrument +
  evidence only. Record the kind (SUPPLY / PARTICIPATION /
  GUARDRAIL) for the next lever.

## 8. Metric review (§14)

- No bar has been re-scored; no bar is judged yet — the pilot is
  1/16 seeds. The metric that may prove wrong is the redirect
  heuristic itself: bars 1–2 measure supply to villagers, but
  bar 3 (the volley) needs the holder to LEAD, and the deed-based
  recipient pick does not select for leading. If bar 3 fails with
  bars 1–2 passing, the revision for the next run is a
  lead-weighted recipient (expedition holders first), not a
  friendlier volley bar. The frozen bars stand as written for
  this pilot.
- The exposure-normalized guardrail (bar 4) is the fix-a §6
  proposal adopted verbatim; the raw deaths/run bar is retired
  for this arm and must not be re-introduced at judging time.

## 9. Files

- Prereg: `evidence/2026-11-19/sim-searsupply-a-prereg.md`
  (commit `5142585fc`)
- Lever + instrument: `evidence/2026-11-19/sim-searsupply-a.md`
  (this file, INTERIM), `src/js/contests.js`, `src/js/game.js`,
  `scripts/searsupply-driver-a.js`,
  `scripts/analyze-searsupply-a.js`,
  `scripts/test-searsupply-a.js` (32/32),
  `scripts/build-searsupply-panels-a.js` (commit `6c4b75925`)
- Smoke: `evidence/2026-11-19/searsupply-a-smoke.log` / `.err`,
  `evidence/2026-11-19/perseed-searsupply-a-arm/searsupply-a-s107051-searsupply-a-arm.json`
- Sweeps (HALTED, partial corpora committed):
  `evidence/2026-11-19/searsupply-a-sweep-ctl.log` / `.err`,
  `evidence/2026-11-19/searsupply-a-sweep-arm.log` / `.err`,
  `evidence/2026-11-19/perseed-searsupply-a-ctl/` (1 file:
  107051), `evidence/2026-11-19/perseed-searsupply-a-arm/`
  (2 files: 107051 smoke + 107052)
- Partial analysis (3 seeds, --no-judge):
  `evidence/2026-11-19/searsupply-a-analysis-ctl-partial.json`,
  `evidence/2026-11-19/searsupply-a-analysis-arm-partial.json`
- Analysis + panel: PENDING (see §7)
