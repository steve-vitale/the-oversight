# sim-searsupply-a — INTERIM (pilot running, NO verdict yet)

**Arm:** sim-searsupply-a · **Loop A run:** fleshout-20261120T0215Z
**Type:** BUILD + measure — the searcaster-supply lever for finding #2599
**Status: INTERIM — the run's 04:15Z closeout cut the pilot short.**
The lever is BUILT, PROVEN (proof test 32/32, analyzer selftest
45/45), and COMMITTED (branch tip `6c4b75925`, see §8). The 8-seed
two-leg pilot is LAUNCHED and RUNNING DETACHED (see §7) — 1 of 16
seeds is done (smoke, arm leg, seed 107051). **No verdict is
claimed here:** the four frozen bars are unjudged until both legs
finish. The coordinator (or adoption) finishes the pilot from §7 —
do NOT re-run the smoke seed, do NOT release the worktree until the
sweeps finish.
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

## 3. Pilot status (1 of 16 seeds done)

- **Band:** fresh 107051–107058 (verified in the prereg: no hits
  in any dated evidence .md). Horizon 150d, death-aware.
  Competent verbatim policy. Substrate SENSEEXPED=1 +
  PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1.
  BOWOPEN, BOWCRAFT, SPEARGATE, FUSIONCELL unset on both legs.
- **Smoke (arm leg, seed 107051):** exit 0, 0 instrument errors,
  150d, survived, 27 wave-4+ meetings (23 engaged),
  `searsupplyOn: true`, `searsupplyPresent: true`, anchor
  `6c4b75925`. Corpus:
  `evidence/2026-11-19/perseed-searsupply-a-arm/searsupply-a-s107051-searsupply-a-arm.json`.
- **Running as runtime-tracked background execs** (relaunched
  ~03:44Z — see §7): ctl leg 8 seeds (107051–107058), arm leg
  the remaining 7 (107052–107058; 107051 is the smoke seed and
  must NOT be re-run — the driver refuses to overwrite).
  **RESTART KILL (recorded 03:43Z):** the first pilot launch
  (detached setsid, PIDs 44655/44656, ~03:38Z) died silently at a
  VM restart at ~03:41Z — `uptime` read 2 min at 03:43Z, the
  classic tell. Zero seeds were lost (nothing had been written
  yet; the smoke corpus was already committed). The relaunch uses
  runtime-tracked background execs instead of setsid, so a
  failure is reported rather than silent — but a further restart
  would still kill them, in which case re-run the §7 commands
  (the driver refuses to overwrite finished seeds, so a re-run
  resumes the missing seeds only).

## 4. Smoke-seed signal (ONE seed — a signal, not a verdict)

| Frozen bar | Smoke seed (arm) | Band floor |
|---|---|---|
| 1. Searcaster-holder-days ≥ 40 | **22** (ella_johnson, 22 holder-days, 22 cell-days, max 2 cells, 0 zero-days) | 40 band-wide — on pace: one seed already holds half the floor, WITH cells from day one of holding |
| 2. Armed-holder entries ≥ 3 | **4** (all ella_johnson as an ally) | 3 band-wide — already met on one seed |
| 3. Armed volleys fired ≥ 1 | **0** | 1 — NOT YET: the armed holder never leads (see below) |
| 4. Guardrail (exposure-normalized) | deaths/engaged 5.17 (ctl leg not yet run — unjudgeable) | arm ≤ 1.10 × ctl; median ≥ 0.80 × ctl |

- Cell supply on this seed: 3 appearances (2 contest-prize, 1
  moved), 3 cell grants + 1 searcaster grant, all contest-prize;
  cell-holder-days 73; max cells ever held 2 (the bundle working
  as designed). Compare the participation band: 0 searcaster
  holders, 5 single-cell appearances, max 1 cell. The supply half
  of the lever is visibly working on seed one.
- **The participation shape repeats on this seed:** ella_johnson
  carries the gun + 2 cells into 4 wave-4+ fights (d130 reunion
  aid, d141/d142/d150 eater expedition + world-tick) and is an
  ALLY in all four — leads are tom_baker and visjoin_134 — and all
  four end vFlee. The d150 volley (2 shots, 29 dmg) is the LEAD's
  bow, not her searcaster. The redirect picks by wave-kill deeds;
  deeds do not pick expedition holders, and expedition holders
  are the leads. If the full band repeats this shape (bars 1–2
  pass, bar 3 fails), the verdict is NO-GO kind PARTICIPATION and
  the next lever is lead-side (who the System arms: expedition
  holders, not deed-holders) — NOT more supply. That call belongs
  to the judge, not to this interim note.
- Searcaster source label: the analyzer marks the one searcaster
  appearance `unexplained` — the known window-edge artifact
  (grant and last clean census share a day; the grant trail +
  prize log prove it is the contest prize). Same artifact as the
  diag; recorded, not re-scored.

## 5. Wall numbers (smoke seed only — NOT a band)

- National 0/1, table not instrumented (null, never faked), wins
  0/1. Wave 4 reached 1/1, wave 5 0/1. Survival 150d (survived).
  Standing 199. Deaths 119 (5.17 per engaged wave-4+ meeting).
  The wall is unmoved on one seed, as expected — the pilot band
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

## 7. How to finish (coordinator / adoption)

**Hold worktree `sim-searsupply-a` until both sweeps exit.**
Progress: count JSON lines in `evidence/2026-11-19/searsupply-a-sweep-ctl.log`
(target 8) and `searsupply-a-sweep-arm.log` (target 7); both
`.err` files must stay empty of driver errors. The sweeps are
runtime-tracked background execs (relaunched ~03:44Z after the
~03:41Z restart killed the first detached launch — see §3); if
they die, re-run the driver commands below (the driver refuses to
overwrite finished seeds, so a re-run resumes the missing seeds
only):

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
- Sweeps (in progress, uncommitted until they finish):
  `evidence/2026-11-19/searsupply-a-sweep-ctl.log` / `.err`,
  `evidence/2026-11-19/searsupply-a-sweep-arm.log` / `.err`,
  `evidence/2026-11-19/perseed-searsupply-a-ctl/` (8 files),
  `evidence/2026-11-19/perseed-searsupply-a-arm/` (7 more files)
- Analysis + panel: PENDING (see §7)
