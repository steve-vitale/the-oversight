# sim-searsupply-a — NO-GO (SUPPLY) — full 8-seed pilot judged

**Arm:** sim-searsupply-a · **Loop A run:** fleshout-20261120T0515Z (resume)
**Type:** BUILD + measure — the searcaster-supply lever for finding #2599
**Status: NO-GO, kind SUPPLY — the lever is REVERTED (game code leaves no
trace).** The pilot was HALTED at 3/16 seeds by the 0215Z run and resumed
by this run from §7: both legs completed to 8/8 seeds (ctl 107052–107058,
arm 107053–107058 — the driver STOPS on a finished seed instead of
skipping it, so the resume ran missing-seeds-only SEEDS lists; see §7).
The analyzer judges the four frozen bars on the full band: bars 1 and 3
miss, bar 2 passes, bar 4 passes. Per the frozen ladder, a NO-GO reverts
the game code before commit; instrument + evidence commit only.
**Prereg:** `evidence/2026-11-19/sim-searsupply-a-prereg.md` (commit
`5142585fc`, frozen 2026-11-20 ~03:25 UTC, before any judged sim).
**Resume run branch:** `sim-searsupply-resume-a`, base master 8cd4c0181
(lever merged 55770a359).

## 1. The lever (frozen design, built as preregistered)

**SEARSUPPLY=1** (default OFF). Three parts, all draw-neutral BY
CONSTRUCTION — zero new `Math.random()` draws on either leg (the proof
test asserts the exact draw count on every live call: `rollAlienLoot` 2
draws, `_cxItemPrize` 3 draws, both legs):

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

- `scripts/test-searsupply-a.js` **32/32 GREEN** on base c75503d6f
  and re-proven **32/32 GREEN on the resume base 8cd4c0181** before
  the judged legs: defs + 15-item tier-4 contest pool; cell reweight
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

## 3. Pilot status (16 of 16 seeds — COMPLETE)

- **Band:** fresh 107051–107058. Horizon 150d, death-aware.
  Competent verbatim policy. Substrate SENSEEXPED=1 +
  PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1.
  BOWOPEN, BOWCRAFT, SPEARGATE, FUSIONCELL unset on both legs.
- **Done:** ctl 8/8, arm 8/8. All 16 corpora valid, 0 instrument
  errors, census coverage 97–98% of lived days on every seed.
- **Resume notes (this run):** the §7 driver commands as written
  pass the FULL seed list including finished seeds, and the driver
  exits 3 refusing to overwrite the first finished seed instead of
  skipping it — the resume ran `SEEDS=107052,…,107058` (ctl) and
  `SEEDS=107053,…,107058` (arm), the missing seeds only, which is
  the resume §7 intends. The panel builder
  `scripts/build-searsupply-panels-a.js` defaults to the DIAG band
  107021–107028 (a clone leftover) and throws "missing per-seed
  file" until given `--seeds 107051,…,107058`; the builder's
  default should be fixed by the next arm that clones it.
- **Analysis:** `evidence/2026-11-19/searsupply-a-analysis.json`
  (analyzer verdict NO-GO / SUPPLY). Panel:
  `evidence/2026-11-19/searsupply-a-panel-before.json.gz` /
  `-after.json.gz` + `searsupply-a-panel.md` (compare decision
  `review_required` — see §4, it does not overturn the prereg
  judge).

## 4. Verdict — NO-GO (SUPPLY)

| Frozen bar | Ctl (8 seeds) | Arm (8 seeds) | Bar | Result |
|---|---|---|---|---|
| 1. Searcaster-holder-days ≥ 40 | **23** | **22** | 40 | **FAIL** |
| 2. Armed-holder entries ≥ 3 | 0 | **4** | 3 | PASS |
| 3. Armed volleys fired ≥ 1 | 0 | **0** | 1 | **FAIL** |
| 4. Guardrail (exposure-normalized) | deaths/engaged 6.72; median 150d | deaths/engaged **4.56** (bar ≤ 7.40); median **150d** (bar ≥ 120) | — | PASS |

**Why it is SUPPLY, not participation:** the lever fixed the cells
and not the gun. Cell supply rose sharply on the arm leg
(appearances 13 vs 2; grants 9 vs 3, all contest-prize;
cell-holder-days 316 vs 0; max cells ever held 2), but the
searcaster itself did not: **1 searcaster grant per leg, 1
appearance per leg** — the gun is still 1/15 per tier-4 contest
prize, and tier-4 prizes are rare (162 contest prizes on the arm
leg, 186 on control, only a handful reaching tier 4). The one gun
that did arrive was delivered exactly as designed (see §6), but
one lucky village in eight is not a supply line, and holder-days
cannot clear a 40-day floor off a single grant. Bar 2 passes on
that single holder's four entries; bar 3 fails because she never
leads (0 armed leads) — the participation shape from fix-a
repeats, but it is NOT the verdict kind, because bar 1 already
fails on supply: there is no second holder to lead with.

**The panel's `review_required` does not change the verdict.**
The balanced-panel compare flags "Village deaths per 100 calendar
days" as `regression_signal` (+7.39, interval 0.06–15.82) and
"Village deaths per run" as `regression_watch` (+5.5: 108.9 vs
103.4). That is the RAW deaths metric — the exact bar the prereg
retired for this arm, because it punishes exposure, not game
effects. The arm leg simply met more monsters (231 wave-4+
meetings, 191 engaged, vs ctl 172 / 123); deaths PER ENGAGED
MEETING — the frozen guardrail — actually FELL (4.56 vs 6.72),
and median survival is identical (150d vs 150d). Per §14 metric
binding, the panel is the instrument and the pre-registered
threshold is the judge; the panel's raw-deaths flag is recorded
here as a watch item, not a re-score. (Also note the arm leg lost
3 villages at 104–121d vs ctl 3 at 111–147d, and starvation deaths
6 vs 2 — small numbers, worth watching on the next band, not a
verdict on this one.)

**What the lever did prove:** the redirect + bundle + reweight
machinery works end to end when the gun appears (grant →
redirect → bundle → gear-up → armed entries). The failure is
upstream: the gun's grant rate. The next lever for finding #2599
must raise the GUN rate, not the cells — e.g. a searcaster-weighted
tier-4 contest prize, or more tier-4 prizes reaching villagers —
and, once a second holder exists, weight the recipient toward
expedition holders, who are the leads (bar 3's real gate).

## 5. Wall numbers (full 16-seed band)

- National **0/16**, table not instrumented (null, never faked),
  wins **0/16**. Wave 4 reached 16/16, wave 5 reached 7/16
  (ctl 4/8, arm 3/8). Median survival 150d on both legs.
  Community lost 3/8 per leg. Scale rank regional on all 16.
- Standing: ctl 199–635 (four seeds pinned at the 199 wave-4
  floor), arm 199–695 (five at 199). The wall is unmoved — the
  pilot band carries the wall numbers, as expected; the lever
  was never a scale lever.

Per-seed (days / end / max wave / standing / holder-days /
wave-4+ meetings / engaged):

| Seed | Ctl | Arm |
|---|---|---|
| 107051 | 150d survived w5 st590 hd0 m10 e6 | 150d survived w4 st199 hd22 m27 e23 |
| 107052 | 130d lost w5 st470 hd0 m29 e24 | 150d survived w5 st580 hd0 m44 e35 |
| 107053 | 150d survived w4 st199 hd0 m37 e31 | 150d survived w4 st199 hd0 m37 e31 |
| 107054 | 111d lost w4 st199 hd0 m10 e7 | 121d lost w4 st199 hd0 m15 e12 |
| 107055 | 147d lost w4 st199 hd0 m12 e7 | 116d lost w5 st360 hd0 m13 e13 |
| 107056 | 150d survived w4 st199 hd0 m16 e11 | 104d lost w4 st199 hd0 m9 e6 |
| 107057 | 150d survived w5 st635 hd0 m32 e15 | 150d survived w5 st695 hd0 m65 e50 |
| 107058 | 150d survived w5 st425 hd23 m26 e22 | 150d survived w4 st199 hd0 m21 e21 |

## 6. Sense testing (transcripts read, not just counted)

- The redirect reads as the System arming a fighter — when the
  gun finally arrives. On arm 107051, day 128, a contest prize
  goes to **ella_johnson** (the redirect, not the scholar's pack)
  with **+2 cells bundled the same day**; the census shows her
  carrying the searcaster with 2 cells from day 129 to day 150
  (22 holder-days, 0 zero-days). She carries it into four wave-4
  fights (days 130, 141, 142, 150) — the weapon is present,
  loaded, and carried, which is new (the diag's holder carried an
  empty gun for 97 days and never met a monster; the control leg
  repeats it: gen_6bclqr9 holds a cell-less searcaster 23 days on
  107058 and walks into 4 engaged wave-4+ meetings with an empty
  gun).
- What she never does is LEAD — the gun stays in the second row
  while the party runs. On day 150, the lead fires a crude-bow
  volley (2 shots, 29 damage) while ella's searcaster — 64–68
  damage per hit in the proof test — sits unfired beside her.
  The story the numbers tell is coherent and frustrating: the
  System finally hands the village a loaded gun, and the village
  still sends someone else in front. The deed heuristic picks a
  proven fighter, not a leader; expedition holders are the leads,
  and the redirect does not select for them.
- The earlier fights she joined as an ally before the gun
  arrived (days 99, 117, 120, 126–128) show the same shape: she
  is in the thick of it — the day-99 fight kills the lead
  (app_mgpspk5c393), the day-120 fight kills visjoin_116 — a
  fighter who keeps watching her leaders die. Arming her was the
  right instinct; the village just never lets her lead.
- The analyzer's diag counter `volleyFiredFromSearcaster: 1` on
  the arm leg is NOT a searcaster volley — it counts the day-150
  crude-bow volley fired while an armed holder participated (the
  counter fires on `rangedId === 'searcaster' OR hasArmed`). The
  participation counter (bar 3's judge, strict
  `rangedId === 'searcaster'`) is 0. No volley ever left a
  searcaster in this band.

## 7. How it finished (resume, this run)

The pilot was HALTED at 3/16 seeds by the 0215Z run; this run
resumed it with the §7 commands, adjusted only for the driver's
refusal to overwrite finished seeds (it exits 3 on the first
finished seed rather than skipping it):

```
cd ~/workspace/worktrees/sim-searsupply-resume-a
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 MODE=ctl OUTDIR=perseed-searsupply-a-ctl SEEDS=107052,107053,107054,107055,107056,107057,107058 RUN=searsupply-a node scripts/searsupply-driver-a.js > evidence/2026-11-19/searsupply-a-sweep-ctl.log 2> evidence/2026-11-19/searsupply-a-sweep-ctl.err
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 SEARSUPPLY=1 MODE=arm OUTDIR=perseed-searsupply-a-arm SEEDS=107053,107054,107055,107056,107057,107058 RUN=searsupply-a node scripts/searsupply-driver-a.js > evidence/2026-11-19/searsupply-a-sweep-arm.log 2> evidence/2026-11-19/searsupply-a-sweep-arm.err
```

Then:

```
cd ~/workspace/worktrees/sim-searsupply-resume-a
node scripts/analyze-searsupply-a.js --ctl evidence/2026-11-19/perseed-searsupply-a-ctl --arm evidence/2026-11-19/perseed-searsupply-a-arm --out evidence/2026-11-19/searsupply-a-analysis.json
node scripts/build-searsupply-panels-a.js --seeds 107051,107052,107053,107054,107055,107056,107057,107058
node scripts/balance-panel.js compare --before evidence/2026-11-19/searsupply-a-panel-before.json.gz --after evidence/2026-11-19/searsupply-a-panel-after.json.gz --out evidence/2026-11-19/searsupply-a-panel
```

**Revert (NO-GO per the frozen ladder):** the game code was
reverted before commit — the lever leaves no trace in `src/`.
`src/js/contests.js` was restored from the pre-lever commit
(`git checkout 6c4b75925^ -- src/js/contests.js`: 65 deletions,
exactly the lever's footprint; no later commit had touched the
file). `src/js/game.js` was reverted surgically (the 12-line
cell-weight block removed by edit) because a later master commit
(eb12c1471, journey-crisis r253 antler-thrash fix) touched the
same file — that fix is preserved; the working-tree diff vs HEAD
is exactly the two lever hunks, nothing else. Verified: 0
`SEARSUPPLY` refs in `src/js/`, `node --check` clean on both
files. The proof test now reads 23/32 (the 9 lever assertions
fail against reverted code, the 23 control/off-leg assertions
still pass; analyzer selftest still 45/45) — the same record the
fix-a NO-GO arm left (its test reads 20/26 today). The test is
NOT on the green list. `node scripts/check.js --quick` after the
revert: **338 passed, 6 failed** — all 6 are 120s timeouts on slow
godpath deed-attainment / occupation-panel tests
(living-garden, one-person-army, occupation-panels, …), none in
contest, loot, or prize areas. The revert cannot have caused them:
the removed code is reachable only under `SEARSUPPLY=1`, which
check.js never sets, so pre- and post-revert behavior under the
green list is identical by construction.

## 8. Metric review (§14)

- No bar was re-scored; the verdict is the analyzer's frozen-bar
  judge on the full band. Bar 4's exposure-normalized guardrail
  held (4.56 vs 6.72 deaths/engaged; medians equal), and the
  panel's raw-deaths flag (§4) is the retired metric resurfacing
  in the panel instrument — it must not be re-introduced as a
  guardrail at judging time.
- The metric that proved wrong is bar 1's floor as a measure of
  THIS lever: holder-days measures the gun's grant rate, which
  the lever never touched (only cells were reweighted; the
  searcaster stayed 1/15 per tier-4 prize). A supply lever that
  cannot move its own floor is mis-sized, not mis-measured — the
  revision for the next run is a lever that moves the gun rate
  itself, and a bar that counts grants as well as holder-days,
  so a delivery failure shows up before the 40-day floor does.
- The redirect heuristic (deed-based recipient) is also
  mis-aimed for bar 3: it picks a proven fighter, not a lead.
  The revision for the next run is a lead-weighted recipient
  (expedition holders first), not a friendlier volley bar.
- The searcaster source label `unexplained` on both legs is the
  known window-edge artifact (grant and last clean census share a
  day; the grant trail + prize log prove the contest prize). Same
  artifact as the diag; recorded, not re-scored.

## 9. Village assessment (plain words)

Ten of the sixteen villages lived to day 150; six died out
(three per leg, at 104–147 days). Every village reached wave 4;
seven reached wave 5; none reached national, none won. Most
villages sit pinned at standing 199 — the wave-4 floor — for
the whole back half of the run: they survive, they fight, they
do not climb. The two strongest villages (ctl 107057 at 635,
arm 107057 at 695) are the ones that kept a full 150 days and
met the most monsters — survival and standing travel together.

People die out in the wild and in fights, not at home: 871
deaths on the arm leg, 827 on control, and the biggest shares are
expedition deaths (326 arm / 279 ctl) and villager combat
(331 / 325). Six arm villagers starved (2 on control) — a small
number, but the only death cause that moved against the arm leg
in a way the guardrail does not cover, so it goes in the watch
column for the next band rather than into this verdict.

Ella Johnson's village (arm 107051) is the one village where the
lever was visible at all: the System hands its best fighter a
loaded alien gun on day 128, she carries it into four wave-4
fights, and it never fires once — because the village never puts
her in front. The other fifteen villages never saw the gun at
all. That is the whole pilot in one sentence: the supply line
works, the gun is still a lottery ticket, and the lottery winner
never leads.

## 10. Files

- Prereg: `evidence/2026-11-19/sim-searsupply-a-prereg.md`
  (commit `5142585fc`)
- Lever (REVERTED — no trace in `src/`):
  `src/js/contests.js`, `src/js/game.js` restored to pre-lever
  state (see §7)
- Instrument (committed, this run): `scripts/searsupply-driver-a.js`,
  `scripts/analyze-searsupply-a.js`,
  `scripts/test-searsupply-a.js` (32/32 pre-revert on 8cd4c0181;
  23/32 post-revert, lever assertions only),
  `scripts/build-searsupply-panels-a.js`
- Sweeps (complete corpora):
  `evidence/2026-11-19/searsupply-a-sweep-ctl.log` / `.err`,
  `evidence/2026-11-19/searsupply-a-sweep-arm.log` / `.err`,
  `evidence/2026-11-19/perseed-searsupply-a-ctl/` (8 files),
  `evidence/2026-11-19/perseed-searsupply-a-arm/` (8 files)
- Analysis + panel: `evidence/2026-11-19/searsupply-a-analysis.json`,
  `evidence/2026-11-19/searsupply-a-panel-before.json.gz`,
  `evidence/2026-11-19/searsupply-a-panel-after.json.gz`,
  `evidence/2026-11-19/searsupply-a-panel.json`,
  `evidence/2026-11-19/searsupply-a-panel.md`
- Superseded partials (kept for the record):
  `evidence/2026-11-19/searsupply-a-analysis-ctl-partial.json`,
  `evidence/2026-11-19/searsupply-a-analysis-arm-partial.json`
- This evidence file (INTERIM → NO-GO verdict)
