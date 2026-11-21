# Journey leg DEEPENING — r247 pre-registration (2026-11-21, Lane A)

## Leg
Deepening, days 40–80 window, DAYCAP 100 (r213/r218/r222/r226/r227/r232/
r235/r236/r237/r238/r243/r244/r245/r246 precedent). Death-aware: stop after 10
consecutive all-dead daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261121T0043Z` (scheduled Fri 2026-11-20 18:45 CST).
**Rotation read `2` (deepening); write `2→3` at closeout with read-back.**
Run number r247 (r246 is the last deepening run, 2026-11-20).
**Base:** local master `faa5d65a9` at registration (Loop B lever round
fleshout-loop-b-20261120T2130Z adoption closeout). Pre-flight: main tree
CLEAN, disk 49%. `git pull` "Already up to date". No lock existed; lock
created 00:43Z (run_id above) before any work. Heartbeat loop running
(9-min cadence, detached, setsid). Write flap: none seen this run so far;
registration slow (~3.4 min) on host load, not a flap.
No push (ship loop owns pushes).

## Base delta vs r246's panel base `cf3b5732e` (src/js, +419/−15, 6 files)
`git diff --stat cf3b5732e..faa5d65a9 -- src/js/`:
- `game.js` +303, `contests.js` +56, `fieldFights.js` +13 —
  **sim-lendfix-a** (`13a0c5ed2`): GUNRATE + CELLGATE + LEND rebuilt,
  env-gated OFF by default (`process.env.GUNRATE === '1'`,
  `process.env.LEND === '1'`); dead-borrower return fix (finding #2629
  FIXED) lands behind the gate. **No live behavior change on this leg**
  unless the env flags are on — the driver does not set them. Verified
  by grep, not assumed.
- `game.js` +77/−77 net 0 — **sim-ammo-a** lever added (`a06e640bd`)
  then reverted (`8ca5da828`); instrument + evidence only. No live
  change.
- `convo-dialogue.js` +30 — **landing r150** (`a11df1fac`): first heed
  of a warn_you want speaks the warning [needs-eyes]. LIVE dialogue
  change; Q4 watches for it in the wild.
- `convo-dialogue.js` +16 — **scale r247** (`b6a551691`): settled-help
  names the favor [needs-eyes]. LIVE dialogue change; Q4 watches.
- `betrayal.js` +6 — **succession r258** (`ef5e65cb1`): self-witness
  fix in the ambush path. LIVE; ambush-path witness lines may surface
  in transcripts.
- `build.js` +2 — version bump only.

## Policy
Competent + MUSTER POLICY (r227 verbatim + r236 growth amendment +
r237 F1/F2 + r238 stand-down) + MARCH STEP (r228 verbatim, driver-only).
**The driver is deliberately NOT gated on the fresh projection** (r245
decision stands): a competent player who hears the dawn line sounds the
call, and the cooled path is the instrument — gating the driver would
hide the very behavior the game fix exists to narrate.

## Seeds
Panel 105051–105058 (8 seeds); probe seed 105059 (dedicated, NOT scored
in panel metrics — Q1-probe only). Seed-band freshness check
(local_seed_band_freshness): `git grep 10505[1-9] -- evidence/*-prereg.md`
— 0 hits; evidence filenames 2026-11-19/20 — 0 hits for 10505x;
`git log --grep 10505` — 0 hits. Nearest named bands 105041–105049
(r246), 105101. Band 105051–105059 is fresh.

## Canon read
docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing >= 100 +
readiness bars; wave-5 gate: standing >= 200 AND wave-4 faced; wave-5
readiness bars 4 armored P>=15 / 6 armed / 3 tricks / 2 veterans with
wave-4+ kills; waves 3–5 deliberately counter-less — signature
counterplay is engine-real, learnable via `noteVillagerTrickObservation`)
+ docs/CONVERSATIONS.md. NO canon doc covers titans/muster — mechanism
grounded in src/js/titans.js + src/data/titans.json (Herald: wave 4,
minAllies 10; quota 6 iff trust >= 70 and opinion >= 10 else 2; refusal
bars trust < 25 / opinion < -10 / arrears > 0; Haven commit cap 3).

## Questions

### Q1 (PRIMARY, regression bar — unchanged from r244/r245/r246): growth-line honesty
**Bar: GROWTH-LINE-GO = 0 bad lines; every growth call harvests exactly
or cools honestly** (analyzer `summarizeGrowth` verdict). A silent empty
call after a growth line is still NO-GO (analyzer case 95). Descriptive:
does the "enough, if the morning holds" clause fire in the wild again
(r246: fired 2×, both honest)? Does the cooled path fire (r245/r246: 0
cooled days/calls — needs a contest death between dawn and the call)?
The cooled path stands on its 28/28 unit proof; the wild verdict rests
on honest harvests.

### Q2 (descriptive, third measurement — NO bar): the wave-5 kill wall
r245: wave-5 unlocked 3/8, faced 2/3, **0 kills**. r246: unlocked 2/8,
faced 0/2, **0 kills** — the wall moved shape (unlock without encounter).
Report `summarizeWave5` classes + party sizes on this fresh band:
unlocked / never-faced / faced-not-killed / killed, kills, deaths,
party sizes per fight. Descriptive sub-watch: **march-flee recurrence**
— r246 seed 105048 marched 7 days running and fled all 7 coalition
fights at full HP while a field fight dealt 358 damage. Does a
multi-day flee loop recur on this band (count consecutive fled march
fights per seed)? The wall is the deed gate opening + a wave-5 kill;
this run re-measures it on the new base, it does not judge it.

### Q3 (descriptive — NO bar): the bow watch, FIXED instrument
BOWCRAFT is TURNED ON in live play; BOWKNOW/BOWOPEN are flag-gated OFF.
r246 instrument gap (recorded, owed to this run): `bowKnowers` counted
the `bow` key only, but the BOWCRAFT seeing code seeds the EQUIPPED
rung's recipe id (`BOW_RUNGS = ['bow', 'crude_bow']`,
villager-build.js:1314) — `crude_bow`-only knowers were invisible.
**r247 fix:** the driver counts a knower when `weaponCraft.bow >= 1`
OR `weaponCraft.crude_bow >= 1`, and reports the split
(`bowKnowersByKey: {bow, crude_bow}`). The analyzer carries the split
through `summarizeBow` and the Q3 panel print. Report per-seed + panel
totals. Expected: `weapon_teach` = 0 (flag off — a non-zero count
would be a defect); equipped bows + the corrected knower count are the
live-play read on whether the turn-on reaches villages. The
`weapon_craft` telemetry key still counts ALL weapon crafts (not bow
crafts) — reported with that caveat, as in r246.

### Q4: people check
Read 1–2 full transcripts from convo days 45/60/80; judge sense, not
counts (SENSE-TESTING LAW). Watch for the two new live dialogue
behaviors in the wild: (a) a warn_you heed speaking the warning
(landing r150), (b) settled-help naming the favor (scale r247). Watch
for a third sighting of the closing-line duplication (Modhi r245,
Noah r246 — closing line + first winddown line identical verbatim).

### Q5: census + reachable / fun / winnable
Survival, scholar deaths, ladder stage at d80, wave-4 kills, trick
pipeline, trust-paid-to-stranger watch, coalition-reach watch
(reached10 / stuck-at-9 — descriptive since r245), F8 wild watch
(UNMEASURED unless the confide line fires), stand-down probe (Q1-PROBE,
dedicated seed 105059).

## Driver / analyzer forks
- Driver `scripts/journey-deepening-r247-20261121.js` (r246 fork: seed
  band, tag r247, EVIDIR 2026-11-21, + bowWatch knower fix + split).
  Policy, instruments, probe staging unchanged.
- Analyzer `scripts/analyze-journey-deepening-r247-20261121.js` (r246
  fork: EVIDIR 2026-11-21, + `summarizeBow` split carry-through +
  panel print).
- Proof tests forked from r246: analyzer (101 carried + 2 new bow
  cases 102–103: crude_bow-only knower counted; split totals),
  muster 41/41, march 11/11. All must be GREEN before the panel is
  judged; a fork failure is a tooling failure, not a game verdict.

## Metric review (standing)
- Q1 bar stands as written (r244/r245/r246 precedent). A miss is NO-GO,
  never re-scored mid-run.
- Q2/Q3 descriptive as pre-registered; no verdicts taken on them.
- Q2 coalition-reach has NO bar since r245 (design call already with
  the build arm on three panels: r243 1/8, r244 4/8, r245 4 reached /
  6 stuck-at-9 at some point; r246 3 reached / 5 stuck).
- Q3 bow-watch metric caveat (instrument, not game): `weapon_craft`
  counts all weapon crafts, not bow crafts. The r246 `bowKnowers`
  key-coverage gap is FIXED this run (bow OR crude_bow + split).
