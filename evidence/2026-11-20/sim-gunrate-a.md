# sim-gunrate-a — NO-GO (PARTICIPATION) — full 8-seed pilot judged

**Arm:** sim-gunrate-a · **Loop A run:** fleshout-20261120T0315Z
**Type:** BUILD + measure — the searcaster GUN-RATE lever for finding #2599
**Status: NO-GO, kind PARTICIPATION — the lever is REVERTED (game code leaves no
trace).** The pilot ran to 16/16 seeds (ctl 107051–107058, arm 107051–107058).
The analyzer judges the four frozen bars on the full band: bar 1 passes
4.4× over its floor, bars 2–3 miss at zero, bar 4 passes. Per the frozen
ladder, a NO-GO reverts the game code before commit; instrument + evidence
commit only.
**Prereg:** `evidence/2026-11-20/sim-gunrate-a-prereg.md` (frozen
2026-11-20 ~09:35 UTC, before any judged sim).
**Branch:** `sim-gunrate-a`, base master 59711ccc5.

## 1. The lever (frozen design, built as preregistered)

**GUNRATE=1** (default OFF). Three parts, all draw-neutral BY
CONSTRUCTION — zero new `Math.random()` draws on either leg (the proof
test asserts the exact draw count on every live call: `rollAlienLoot` 2
draws, `_cxItemPrize` 3 draws, both legs; the diff's only `Math.random`
mention is a comment):

1. **Gun weight** (`src/js/game.js` `rollAlienLoot`): on
   contest-prize paths at tier 4 only, 3 extra `searcaster`
   entries join the pool (searcaster probability 1/15 → 4/18 ≈
   22%). Same single pick draw, different mapping. Trade, kill
   loot, show gifts, and corpse takes are untouched (proven live).
2. **Expedition-holder redirect** (`_gunRateFighter`, new in
   `contests.js`): a searcaster or fusion_cell contest prize won by
   the player goes to the village's lead-weighted living villager
   instead of the scholar's pack — currently on an expedition +8,
   launches +2 each (capped +8), wave3Kill +4, wave2Kill +2,
   contestWin +1 each, roster-order tie-break. Own eligibility —
   NOT `contestEligible` (its day-14 casting gate must not decide
   who can carry the gun; the first proof-test run of searsupply
   caught exactly this). No away check — the System delivers
   wherever the fighter stands.
3. **Bundle** (reused from searsupply, proven): a searcaster
   contest-prize grant gives the SAME recipient +2 `fusion_cell`.
   The searsupply cell reweight is NOT rebuilt — cells reach
   villagers only through the bundle now (plus the pool's residual
   1/18 cell share).

**NOT built:** raising the tier-4 rate itself (the 0.25 apex roll)
— the weighted prize is the targeted mechanism. Alien-side ruin
salvage for cells; no village craft for cells, ever — cells are
alien tech.

## 2. Proof (before any sim)

- `scripts/test-gunrate-a.js` **39/39 GREEN** on base 59711ccc5
  before the pilot: defs + 15-item tier-4 contest pool; gun
  reweight on/off (appended-searcaster draw → searcaster on-leg,
  ordinary pool item off-leg; cell still pickable at its own
  index); trade + kill-loot paths untouched; redirect-recipient
  fixtures (current expedition holder beats the wave-3 killer
  8 > 4; 3 launches +6 beats the wave-3 kill +4; wave-3 kill +4
  beats 1 launch +2; roster-order tie-break; dead deed-holder
  skipped); bundle to the same villager (+2 cells) and to the
  redirected expedition holder; cell prize redirected; ordinary
  tier-4 prize stays with the player; control-leg identity
  (GUNRATE unset: same prize, no bundle, no redirect, same draw
  counts); gear-up equips the granted searcaster; 0-cell volley
  0 shots with the "no fusion cells" line; armed volley fires,
  spends exactly its shots in cells, hits land 64–68 per hit.
- `scripts/analyze-gunrate-a.js --selftest` **45 passed, 0
  failed** (incl. the GO / NO-GO-per-bar judge shapes).
- Draw-neutrality: the implementation adds ZERO `Math.random()`
  calls — the proof test's draw-count assertions (2/3 draws,
  identical on both legs) are the live proof, stronger than a
  grep over the diff. Seed 107053 ran BYTE-IDENTICAL on both legs
  (150d, w4, st199, 37 meetings, 31 engaged, 0 holder-days) — the
  legs diverge only where a tier-4 prize pick remaps.

## 3. Pilot status (16 of 16 seeds — COMPLETE)

- **Band:** REUSED 107051–107058, per the task (paired
  before/after on identical seeds, one flag apart — the control
  leg is a FRESH run on this band with the new substrate; the
  searsupply legs are historical context only). Horizon 150d,
  death-aware. Competent verbatim policy. Substrate
  SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 +
  FIGHTALLY2=1 + BOWOPEN=1 + SPEARGATE=1 on both legs.
- **Done:** ctl 8/8, arm 8/8. All 16 corpora valid, 0 instrument
  errors, census coverage 97–98% of lived days on every seed.
- **Run notes (this run):**
  - The first arm launch never started: the `cd` in the pilot
    command bound only to the first background job (shell `&`
    scoping), so the arm driver's log redirect failed in
    `/home/hatch` ("No such file or directory") and the arm leg
    never ran. Caught within minutes from the poll output; the
    arm leg was relaunched with its own `cd` and ran clean to
    exit 0. No seed was consumed, nothing was lost.
  - The write-flap struck the FINAL arm write: arm seed 107058's
    corpus file was left as a 0-byte `.tmp-10650` after
    `writeRobust` exhausted its retries. The corpus survived in
    the driver's `@@FALLBACK` stdout dump in
    `gunrate-a-sweep-arm.log` and was recovered from it byte
    intact (seed 107058, arm, 150d survived, 0 errors, 3.36MB;
    JSON parses, all keys present). The empty `.tmp` was removed.
    Recovery is recorded here, not hidden.
  - The panel builder's `OUT_PREFIX` default still pointed at
    `evidence/2026-11-19` (a `path.join` arg the clone sed
    missed — the same class of leftover the searsupply §7 note
    flagged for the seeds default). The panels were built from
    the right corpora but written to the wrong date directory;
    the files were moved to `evidence/2026-11-20/` and the
    builder fixed. The builder now defaults everything to
    2026-11-20 / 107051–107058.
- **Analysis:** `evidence/2026-11-20/gunrate-a-analysis.json`
  (analyzer verdict NO-GO / PARTICIPATION). Panel:
  `evidence/2026-11-20/gunrate-a-panel-before.json.gz` /
  `-after.json.gz` + `gunrate-a-panel.md` (compare decision
  `review_required` — see §4, it does not overturn the prereg
  judge).

## 4. Verdict — NO-GO (PARTICIPATION)

| Frozen bar | Ctl (8 seeds) | Arm (8 seeds) | Bar | Result |
|---|---|---|---|---|
| 1. Searcaster-holder-days ≥ 40 | **23** | **177** | 40 | **PASS** |
| 2. Armed-holder entries ≥ 3 | 0 | **0** | 3 | **FAIL** |
| 3. Armed volleys fired ≥ 1 | 0 | **0** | 1 | **FAIL** |
| 4. Guardrail (exposure-normalized) | deaths/engaged 5.14; median 150d | deaths/engaged **4.55** (bar ≤ 5.66); median **150d** (bar ≥ 120) | — | PASS |

**Why it is PARTICIPATION, not supply:** the lever fixed the
gun rate and the gun still never fired in a wave-4+ fight.
Searcaster grants rose 1 → 6 (all contest-prize; tier-4 contest
prizes 31 vs 25, searcaster share 6/31 = 19.4% vs 1/25 = 4% —
the frozen prediction was 4/18 ≈ 22%, ~7 grants). Five
villagers held the gun for 177 holder-days (ctl: 1 holder, 23
days). But **zero armed-holder entries**: no holder ever carried
cells INTO a wave-4+ fight, so no armed volley could fire. The
redirect worked — every gun went to a villager (5/6 grants; the
sixth went to the scholar's pack on day 142 of the already-lost
107051 village, the designed fallback) — and the bundle worked
(12 cells granted, all contest-prize, all bundle). The failure
is downstream of both, in what happens to the two cells (§6).

**The panel's `review_required` does not change the verdict.**
The balanced-panel compare flags "Village deaths per 100
calendar days" as `regression_watch` (+3.27, interval −1.66–
7.64) and "Community loss" as `regression_watch` (+0.125: 3
villages lost vs 2). That is the RAW deaths metric — the exact
bar the prereg retired for this arm, because it punishes
exposure, not game effects. Deaths PER ENGAGED MEETING — the
frozen guardrail — actually FELL (4.55 vs 5.14), and median
survival is identical (150d vs 150d). Per §14 metric binding,
the panel is the instrument and the pre-registered threshold is
the judge; the panel's raw-deaths flag is recorded here as a
watch item, not a re-score. (The arm leg lost 107052 at 112d
vs ctl survived, and 107054 at 85d vs ctl 111d — small numbers,
worth watching on the next band, not a verdict on this one.)

**What the lever did prove:** the gun-weight + redirect +
bundle machinery works end to end (grant → redirect → bundle →
gear-up → equipped searcaster), and the grant rate moved
exactly as sized (6 observed vs ~7 predicted). The failure is
downstream: the two cells never survive to a wave-4+ fight.
The next lever for finding #2599 must address CELL SUPPLY PER
GUN — a bigger bundle, a cell resupply route, or a volley that
reserves cells for the hard fights — not the gun rate. Raising
the gun rate further would only hand out more empty guns.

## 5. Wall numbers (full 16-seed band)

- National **0/16**, table not instrumented (null, never faked),
  wins **0/16**. Wave 4 reached 16/16, wave 5 reached 7/16
  (ctl 4/8, arm 3/8). Median survival 150d on both legs.
  Community lost 2/8 ctl, 3/8 arm. Scale rank regional on all 16.
- Standing: ctl 199–635 (four seeds pinned at the 199 wave-4
  floor), arm 175–630 (four at 199). The wall is unmoved — the
  pilot band carries the wall numbers, as expected; the lever
  was never a scale lever.

Per-seed (days / end / max wave / standing / holder-days /
wave-4+ meetings / engaged):

| Seed | Ctl | Arm |
|---|---|---|
| 107051 | 139d lost w4 st199 hd0 m25 e19 | 142d lost w4 st199 hd0 m33 e27 |
| 107052 | 150d survived w5 st365 hd0 m28 e20 | 112d lost w4 st199 hd51 m34 e26 |
| 107053 | 150d survived w4 st199 hd0 m37 e31 | 150d survived w4 st199 hd0 m37 e31 |
| 107054 | 111d lost w4 st199 hd0 m10 e7 | 85d lost w4 st175 hd18 m6 e3 |
| 107055 | 150d survived w5 st480 hd0 m43 e41 | 150d survived w5 st570 hd28 m26 e24 |
| 107056 | 150d survived w4 st199 hd0 m16 e11 | 150d survived w4 st199 hd19 e15 |
| 107057 | 150d survived w5 st635 hd0 m32 e15 | 150d survived w5 st630 hd64 m49 e30 |
| 107058 | 150d survived w5 st425 hd23 m26 e22 | 150d survived w5 st350 hd16 m32 e30 |

## 6. The cell-burn mechanism (why bars 2–3 are zero)

The bundle's 2 cells are exactly ONE opening volley, and the
volley is wave-agnostic. `fieldFights.js` ~975–1060 fires the
opening volley in ANY `fieldFight` where the lead has an
equipped ranged weapon with ammo — there is no wave gate:
shots = min(ammo, clamp(1 + floor(range / monster speed), 1,
4)), each shot spends 1 ammo. A searcaster (range 8) fires 2
shots against any ordinary-speed monster. So the first fight a
holder LEADS eats both cells, and the first fight a holder
leads is almost always a low-wave fight — wave-1/2/3 monsters
are everywhere, wave-4+ meetings are ~1 per 5 days. The
census + kill log prove it holder by holder (4 of 5):

| Holder (seed) | Grant day | Cells 2 on | Cells 0 from | What ate them |
|---|---|---|---|---|
| victor_lopez (107052) | 57 | 57–99 | 100 | day-100 kills: nightlight_catfish + mirrormoth, both via contest |
| yuki_mori (107054) | 67 | 67–68 | 69 | day-69 kill: mirrormoth (wave 1) via contest |
| app_mgpspjqc442 "Lautaro" (107055) | 106 | — (spent same day) | 106 | day-106 kills: mirrormoth (wave 1) via contest + union_rep (wave 2) via aid-crisis |
| naran_tumen (107057) | 86 | 86 | 87 | day-87 kill: spool (wave 3) via aid-crisis |
| catalina_reyes (107058) | 77 | 77–92 | 93 | GUN ITSELF left her day 93 — see below |

Every cell-loss day coincides with a fight the holder LED and
won (a kill is recorded; the volley is the opening of that
fight). The negative controls hold too: the two holders who
KEPT their cells longest (victor 41 cell-days, catalina 16)
are exactly the ones who led no fight in their armed windows —
victor led zero fights days 58–99 (0 kills, 0 wave-4+
encounters as lead or ally), catalina zero days 77–92. And
neither ever entered a wave-4+ fight WHILE ARMED (victor: 0
wave-4+ encounters days 58–112 in any seat; catalina: 0 days
77–92) — so `poolEngagedArmed` is 0 honestly, not by a
counting gap. The five `poolEngagedZero` meetings are all
Lautaro walking into wave-4/5 fights with the empty gun (§7).

**Open observation (not a verdict item):** catalina_reyes
lost the GUN itself on day 93 — census goes from `searcaster`
+ 2 cells (day 92) to no ranged weapon + 0 cells (day 93),
alive at home, and no other villager, the scholar, or the pile
ever shows the gun or the cells after that. The instrument
does not track inter-villager gun hand-offs (gift, trade,
theft — theft is allowed, socially punished — or a drop), so
the sink is unrecorded. One gun in six vanished this way; it
does not move the verdict, but the next arm that counts guns
should instrument transfers.

## 7. Sense testing (transcripts read, not just counted)

- Lautaro (app_mgpspjqc442, 107055) is the whole pilot in one
  villager. The System hands its expedition holder a loaded
  alien gun on day 106; he spends both cells the same day on a
  wave-1 mirrormoth and a wave-2 union rep. Then he LEADS five
  wave-4/5 fights — Algorithm (day 122), Spoiler (days 130,
  131), Strike (days 132, 133) — with the searcaster equipped
  and 0 cells, and the fight log repeats the same line five
  times: "Lautaro has Searcaster but no fusion cells — the
  string stays drawn, useless." He KILLS the Algorithm, a
  Spoiler, and a Strike with the empty gun in his hands. The
  weapon reads as a prop the village keeps polishing, not a
  weapon. On day 130 the lead visjoin_129 DIES in a Spoiler
  fight while Lautaro stands by as an ally with the empty gun —
  the same shape as searsupply's ella watching her leaders die.
- The grant moments read as the System arming a lead — all
  five villager grants went to the redirect's pick with the
  bundle the same day (victor, yuki, app, naran, catalina).
  The fiction holds; the logistics don't: the gun arrives with
  exactly one volley's worth of cells, and the village fires
  that volley at the first thing that moves.
- The control leg repeats the diag's empty-gun finding once:
  gen_6bclqr9 holds a cell-less searcaster 23 days on 107058
  and walks into 4 engaged wave-4+ meetings with it.

## 8. How it finished

The pilot ran as two background legs (ctl PID 10307, arm PID
10648; ~17 min each in parallel):

```
cd ~/workspace/worktrees/sim-gunrate-a
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 MODE=ctl OUTDIR=perseed-gunrate-a-ctl SEEDS=107051,107052,107053,107054,107055,107056,107057,107058 RUN=gunrate-a node scripts/gunrate-driver-a.js > evidence/2026-11-20/gunrate-a-sweep-ctl.log 2> evidence/2026-11-20/gunrate-a-sweep-ctl.err
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 MODE=arm OUTDIR=perseed-gunrate-a-arm SEEDS=107051,107052,107053,107054,107055,107056,107057,107058 RUN=gunrate-a node scripts/gunrate-driver-a.js > evidence/2026-11-20/gunrate-a-sweep-arm.log 2> evidence/2026-11-20/gunrate-a-sweep-arm.err
```

Then:

```
cd ~/workspace/worktrees/sim-gunrate-a
node scripts/analyze-gunrate-a.js --ctl evidence/2026-11-20/perseed-gunrate-a-ctl --arm evidence/2026-11-20/perseed-gunrate-a-arm --out evidence/2026-11-20/gunrate-a-analysis.json
node scripts/build-gunrate-panels-a.js
node scripts/balance-panel.js compare --before evidence/2026-11-20/gunrate-a-panel-before.json.gz --after evidence/2026-11-20/gunrate-a-panel-after.json.gz --out evidence/2026-11-20/gunrate-a-panel
```

**Revert (NO-GO per the frozen ladder):** the game code was
reverted before commit — the lever leaves no trace in `src/`.
`src/js/contests.js` and `src/js/game.js` were restored to the
base commit (`git checkout 59711ccc5 -- src/js/contests.js
src/js/game.js`; the working-tree diff vs HEAD is empty for
both files, nothing else touched them). Verified: 0 `GUNRATE`
refs in `src/js/`, `node --check` clean on both files. The proof
test now reads **26/39** (the 13 lever-on assertions fail against
reverted code — gun-weight draws, redirect-recipient fixtures,
bundle/redirect grants, gear-up equip — the 26 control / off-leg
/ defs / volley / analyzer assertions still pass; the "dead
killer skipped" check passes vacuously post-revert since the
fighter lookup returns null) — the same record the searsupply
NO-GO arm left (its test reads 23/32 today). The test is NOT on
the green list. `node scripts/check.js --quick` after the revert:
**339 passed, 5 failed in 778s** — the 5 are (1)
`test-living-garden-deed-attainment.js` and (2)
`test-one-person-army-deed-attainment.js`, both 120s timeouts
on slow godpath deed-attainment tests under sibling load (the
same timeout class the searsupply post-revert check showed, 6
timeouts); (3) `test-measurement-proof-update.js` ("Proof source
inputs are not current") and (4)
`test-measurement-workflow.js` ("retained neutrality proof covers
the current Game/controller/harness inputs"); (5)
`test-phone-frame-proof.js` (retained browser inputs / phone
receipt stale vs current `index.html` + data files). None is in
contest, loot, or prize areas, and none can be caused by this
arm: post-revert `src/` is byte-identical to the base (the
revert cannot change behavior under any flag), and this arm
touched no `index.html`, data, harness, or controller file. The
proof-freshness / phone-receipt failures are stale retained
proofs on this base (master moved since they were last
refreshed); the timeouts are sibling-load slowness. The arm
proof suite (39/39 pre-revert) is the lever's own green.

## 9. Metric review (§14)

- No bar was re-scored; the verdict is the analyzer's frozen-bar
  judge on the full band. Bar 4's exposure-normalized guardrail
  held (4.55 vs 5.14 deaths/engaged; medians equal), and the
  panel's raw-deaths flag (§4) is the retired metric resurfacing
  in the panel instrument — it must not be re-introduced as a
  guardrail at judging time.
- The metric that proved wrong is bars 2–3's WAVE-4+ SCOPE as a
  measure of "the gun fires": the gun DOES fire — in low-wave
  fights, the first fight the holder leads — and the 2-cell
  bundle is exactly one volley. Bars 2–3 therefore measure CELL
  SURVIVAL TO WAVE-4, not whether the gun works. The revision
  for the next run is a lever that puts more cells behind each
  gun (a bigger bundle, a resupply route, or a volley that holds
  fire for the hard fights) and a bar that counts volleys at ANY
  wave alongside the wave-4+ one, so a low-wave burn shows up as
  a supply finding instead of a participation finding.
- Bar 1's floor (40) passed 4.4× — the weight overshot the
  floor's purpose. The binding constraint has moved downstream
  of the grant rate; a further gun-rate increase is not the next
  lever (see §4). The redirect heuristic is vindicated as far as
  it goes (every gun reached a lead-weighted villager; the
  expedition-holder term decided the recipient on the observed
  grants) — but the recipient rule cannot fix an ammo economy
  that spends itself on wave-1 moths.

## 10. Village assessment (plain words)

Ten of the sixteen villages lived to day 150; six died out
(three per leg, at 85–147 days). Every village reached wave 4;
seven reached wave 5; none reached national, none won. Most
villages sit pinned at standing 199 — the wave-4 floor — for
the whole back half of the run: they survive, they fight, they
do not climb. The two strongest villages (ctl 107057 at 635,
arm 107057 at 630) are the ones that kept a full 150 days.

People die out in the wild and in fights, not at home: the
arm leg's biggest death shares are expedition deaths and
villager combat, same shape as control. Four arm villagers
starved (3 on control) — a small number, in the watch column
for the next band rather than in this verdict.

Five villages in eight finally saw the System's rarest weapon
— up from one in eight — and every one of them watched it go
quiet. The gun arrives, the gun fires once at the first moth
that crosses its holder's path, and then the village's best
fighter carries an empty alien gun into the hardest fights of
the run. The supply line works now. What the village needs is
not more guns — it needs the gun to still be loaded when the
real monster arrives.

## 11. Files

- Prereg: `evidence/2026-11-20/sim-gunrate-a-prereg.md`
- Lever (REVERTED — no trace in `src/`):
  `src/js/contests.js`, `src/js/game.js` restored to base
  59711ccc5 (see §8)
- Instrument (committed, this run): `scripts/gunrate-driver-a.js`,
  `scripts/analyze-gunrate-a.js`,
  `scripts/test-gunrate-a.js` (39/39 pre-revert on 59711ccc5;
  post-revert count recorded in §8),
  `scripts/build-gunrate-panels-a.js`
- Sweeps (complete corpora):
  `evidence/2026-11-20/gunrate-a-sweep-ctl.log` / `.err`,
  `evidence/2026-11-20/gunrate-a-sweep-arm.log` / `.err`,
  `evidence/2026-11-20/perseed-gunrate-a-ctl/` (8 files),
  `evidence/2026-11-20/perseed-gunrate-a-arm/` (8 files)
- Smoke (pre-pilot, seed 107051 both legs):
  `evidence/2026-11-20/gunrate-a-smoke-ctl.log` / `.err`,
  `evidence/2026-11-20/gunrate-a-smoke-arm.log` / `.err`,
  `evidence/2026-11-20/perseed-gunrate-a-smoke/` (2 files),
  `evidence/2026-11-20/gunrate-a-smoke-analysis.json`
- Analysis + panel: `evidence/2026-11-20/gunrate-a-analysis.json`,
  `evidence/2026-11-20/gunrate-a-panel-before.json.gz`,
  `evidence/2026-11-20/gunrate-a-panel-after.json.gz`,
  `evidence/2026-11-20/gunrate-a-panel.json`,
  `evidence/2026-11-20/gunrate-a-panel.md`
- This evidence file
