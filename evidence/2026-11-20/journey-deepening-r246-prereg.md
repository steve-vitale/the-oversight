# Journey leg DEEPENING — r246 pre-registration (2026-11-20, Lane A)

## Leg
Deepening, days 40–80 window, DAYCAP 100 (r213/r218/r222/r226/r227/r232/
r235/r236/r237/r238/r243/r244/r245 precedent). Death-aware: stop after 10
consecutive all-dead daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261120T1745Z` (scheduled Fri 2026-11-20 11:45 CST).
**Rotation read `2` (deepening); write `2→3` at closeout with read-back.**
Run number r246 (r245 is the last deepening run, 2026-11-19/20; the
establishment leg also numbers r245 — numbering is per-leg).
**Base:** local master `cf3b5732e` at registration (sim-winnability-round-
1530 adoption closeout). Pre-flight: main tree CLEAN, disk 48%. `git pull`
"Already up to date". Lock created 17:43:50Z (run_id above) before any
work; no lock existed. Heartbeat loop running (9-min cadence, detached).
Write flap: none seen this run so far; registration was slow (~19 min)
on host load ~9, not a flap — the `git reset --hard` inside `git worktree
add` ran the whole time (file count 90k→93k→complete).
No push (ship loop owns pushes).

## Base delta vs r245's panel base `904545499` (src/js, +208/−9, 9 files)
`git diff --stat 904545499..cf3b5732e -- src/js/`:
- `titans.js` +60 — **r245 growth-line cooled-call fix** (`e086cffcb`):
  re-validate at the act, reword the dawn line ("enough, if the morning
  holds"). **The fix under regression watch this run (Q1).**
- `villager-build.js` +60 — **BOWKNOW mentoring** (`eaf530d6a`):
  a bow-knower at home teaches spear-holders (finding #2590 serve half;
  proof 19/19). **Flag-gated: `BOWKNOW=1`; default OFF in live play.**
  Q3 checks it stays dormant (weapon_teach = 0) in the shipped build.
- `convo-wants.js` +16 — **scale r246 react wind-down fix**
  (`db6f4d7ce`): `dlg:react` retires from want menus at
  `reactDryCount >= 2`. Live-play re-read belongs to the establishment
  leg (r245: CLEAN, max consecutive react 1) and the scale r246 panel;
  the deepening driver carries no sitting-picks array to scan, so this
  run does NOT re-measure it — noted, not silently dropped.
- `convoTopics.js` +21 — **succession r254 mourning witness variant**
  (`aea63f6b5`): the mourning pool serves witness lines when the speaker
  saw the latest fresh dead fall.
- `conversation.js` +23, `convo-beats.js` +15 — **social r256 gossip-ask
  dry-line fix + M4-split + TRAIL 3-press** (`ed19c3d57`).
- `game.js` +6 — **crisis r253 'The The' fix** (`eb12c1471`): antler-
  thrash line composes via articlePhrase for village-named monsters.
- `finale-campaign.js` +14, `build.js` version — **landing r149**
  (`0d38a74d1`): dodge/close no-path fixes + goal-bridge pool
  [needs-eyes].
- sim-evade-a (`57f38c03b`) and sim-searsupply-a (`6c4b75925`) lever code
  is flag-gated default-off or reverted per their round records
  (`85115230d`, `0fd416c5d`); the net game.js delta above is the r253
  fix only — no live behavior change from the sim arms is claimed.

## Policy
Competent + MUSTER POLICY (r227 verbatim + r236 growth amendment +
r237 F1/F2 + r238 stand-down) + MARCH STEP (r228 verbatim, driver-only).
**The driver is deliberately NOT gated on the fresh projection** (r245
decision stands): a competent player who hears the dawn line sounds the
call, and the cooled path is the instrument — gating the driver would
hide the very behavior the game fix exists to narrate.

## Seeds
Panel 105041–105048 (8 seeds); probe seed 105049 (dedicated, NOT scored
in panel metrics — Q1-probe only). Seed-band freshness check
(local_seed_band_freshness): `git grep 10504[1-9] -- evidence/*-prereg.md`
— 0 hits; evidence filenames 2026-11-19/20 — 0 hits for 10504x;
`git log --grep 10504` — 0 hits. Nearest named bands 105031–105039
(r245), 105101. Band 105041–105049 is fresh.

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

### Q1 (PRIMARY, regression bar — unchanged from r244/r245): growth-line honesty
**Bar: GROWTH-LINE-GO = 0 bad lines; every growth call harvests exactly
or cools honestly** (analyzer `summarizeGrowth` verdict). A silent empty
call after a growth line is still NO-GO (analyzer case 95). Descriptive:
does the "enough, if the morning holds" clause fire in the wild this run
(r245: never fired — all 5 wild lines named only Haven growth)? Does the
cooled path fire (r245: 0 cooled days/calls — needs a contest death
between dawn and the call)? The cooled path stands on its 28/28 unit
proof; the wild verdict rests on honest harvests.

### Q2 (descriptive, second measurement — NO bar): the wave-5 kill wall
r245: wave-5 unlocked 3/8, faced 2/3, **0 kills**; the one village that
fought wave-5 monsters did so in parties of 1–2 and survived all 3
without a kill. Report `summarizeWave5` classes + party sizes on this
fresh band: unlocked / never-faced / faced-not-killed / killed, kills,
deaths, party sizes per fight. The wall is the deed gate opening + a
wave-5 kill; this run re-measures it on the new base, it does not judge it.

### Q3 (NEW, descriptive — NO bar): the bow watch
BOWCRAFT is TURNED ON in live play (villager-build.js); BOWKNOW is
flag-gated OFF; BOWOPEN (opening volley) is flag-gated OFF. The
establishment r245 watch was blind to bow crafting (crafting emits
generic `weapon_craft`/`ammo_craft`/`craft` keys). New driver end
snapshot `bowWatch`: telemetry type counts for `weapon_teach`,
`weapon_craft`, `ammo_craft`, `craft`; equipped bows at end (ranged slot
id matching /bow|crossbow/i, roster + scholar); bow items held; villagers
with `weaponCraft.bow >= 1`. Report per-seed + panel totals. Expected:
`weapon_teach` = 0 (flag off — a non-zero count would be a defect);
`weapon_craft` totals + equipped bows are the first live-play read on
whether the turn-on does anything observable on this leg.

### Q4: people check
Read 1–2 full transcripts from convo days 45/60/80; judge sense, not
counts (SENSE-TESTING LAW). r245's small blank (Modhi's closing line
rendering twice verbatim) is carried, not re-probed.

### Q5: census + reachable / fun / winnable
Survival, scholar deaths, ladder stage at d80, wave-4 kills, trick
pipeline, trust-paid-to-stranger watch, coalition-reach watch
(reached10 / stuck-at-9 — descriptive since r245), F8 wild watch
(UNMEASURED unless the confide line fires), stand-down probe (Q1-PROBE,
dedicated seed 105049).

## Driver / analyzer forks
- Driver `scripts/journey-deepening-r246-20261120.js` (r245 fork: seed
  band, tag r246, EVIDIR 2026-11-20, + `bowWatch` end snapshot). Policy,
  instruments, probe staging unchanged.
- Analyzer `scripts/analyze-journey-deepening-r246-20261120.js` (r245
  fork: EVIDIR 2026-11-20, + `summarizeBow` + BOW-WATCH panel print).
- Proof tests forked from r245: analyzer (95 carried + new bow cases),
  muster 41/41, march 11/11. All must be GREEN before the panel is
  judged; a fork failure is a tooling failure, not a game verdict.

## Metric review (standing)
- Q1 bar stands as written (r244/r245 precedent). A miss is NO-GO,
  never re-scored mid-run.
- Q2/Q3 descriptive as pre-registered; no verdicts taken on them.
- Q2 coalition-reach has NO bar since r245 (design call already with
  the build arm on two panels: r243 1/8, r244 4/8; r245 descriptive 4
  reached / 6 stuck-at-9 at some point).
