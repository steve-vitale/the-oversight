# sim-tileentry-a — tile-entry wave-targeting ceiling for wave-3+ at raid time (axis scale-onramp)

Run: fleshout-loop-A, Sun 2026-10-25 ~12:22 CDT onwards.
Worktree: ~/workspace/worktrees/sim-tileentry-a (coordinator-registered).
LEVER ARM — one game-code change, tested against a control band on
identical seeds. Main tree untouched; sibling loop-B trees untouched.

## PRE-REGISTRATION (binding, written BEFORE any sweep — control band first, lever sweep second; judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  wave 3 = day 25+ and wave-2 ledger >= 4 points, kills only, per-type
  cap 2; wave 4 = standing >= 100; wave 5 = standing >= 200 and wave-4
  faced; readiness gates hold waves 4-5). No haven/raid canon doc
  exists (carried) — spawn-path design lives in src/js/game.js
  comments (maintainWorldMonsters, worldTick, checkEncounter,
  castMonster, spawnWaveTarget).
- Question (from evidence/2026-10-25/sim-spawnsrc-a.md, blank #1,
  promoted): raid-time pools sit at median 17 vs the maintain cap 8,
  wave-3+ share only 7.16% (107/1,494), drafted wave-3+ only 0.400
  per raid. Tile-entry (checkEncounter, uncapped) is 62.4% of the
  pool and 87% of the above-cap excess, and the ONLY escalating
  source (65.4% wave-3+ births after day 120, but only 26 births
  late). The maintain-weight lever at its 100% ceiling was
  byte-identical (dead) because the maintain tap closes by day 16.
  Can tile-entry wave targeting move the pool to the bar?
- MECHANISM (read from code, never invented):
  - src/js/game.js checkEncounter(): on a non-safe player tile with
    no monster there, rolls a spawn chance — base 0.08, thicket
    0.15, meadow 0.05, ruin 0.12, night x1.5, pity-amplified
    (effChance = min(chance * (1 + 0.25 * spawnMisses), 0.6)) — NO
    cap check. On success it takes mdefs = monsterWavePool()
    (all monsters with wave <= unlockedWave()), picks
    tw = spawnWaveTarget(mdefs), and spawns one monster of wave tw
    on the player tile via spawnWorldMonster.
  - spawnWaveTarget(pool) (single source of truth, also used by
    castMonster and maintainWorldMonsters): at top unlocked wave 3:
    60% wave 3 / 25% wave 2 / 15% wave 1; at top 4: 60/20/15/5;
    at top 5: 55/20/12/8/5.
  - This arm touches ONLY the checkEncounter tile-entry call site.
    spawnWaveTarget itself, maintainWorldMonsters, and castMonster
    are untouched — every other spawn path keeps its ratios.
- EXACT LEVER (tile-entry path ONLY; ceiling, mirroring lever-b's
  maintain-ceiling logic): in checkEncounter, once unlockedWave()
  >= 3, the tile-entry target wave becomes the highest wave in
  mdefs (i.e. the unlocked wave — 100% newest-wave, 100% wave-3+),
  replacing the 60/25/15-style ratios FOR THIS PATH ONLY. Below
  wave 3, spawnWaveTarget is used exactly as before. Spawn CHANCE
  is unchanged (base/thicket/meadow/ruin, night, pity all as
  above) — this arm tests targeting alone, not volume. WHY THE
  MAXIMUM: this tests the CEILING of the targeting mechanism. If
  even 100%-newest-wave tile-entry spawns cannot reach the bar, no
  weaker targeting weight can either (monotone in expectation,
  modulo RNG noise across 8 seeds — stated, not hidden). A failed
  ceiling kills tile-entry targeting as a candidate; it does not
  license a lower bar or a mid-run rescue (a chance/volume arm is a
  follow-up run, not a rescue).
- FROZEN-CORPUS MOTIVATION (not a result, computed from the
  spawnsrc census before this run): converting every day>=25
  tile-entry wave-1/2 birth to wave-3+ on the frozen corpus would
  move pool wave-3+ appearances from 107 to 617 of 1,494 (41.3%
  share), because day-25..59 births each stand at many later raids
  (~5 appearances each). The ceiling therefore has headroom over
  the 23% bar on paper — unlike maintain, whose ceiling moved
  nothing because its tap was already closed. The live sweep may
  differ (stronger monsters die more, kill more, change
  trajectories); the sweep, not this arithmetic, is the verdict.
- Substrate (shared, landed pattern): tableseat-nowait
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + spawnsrc recorder reused
  VERBATIM (SPAWNSRC=1) + raftdraft recorder (RAFTDRAFT=1), via
  scripts/test-spawnsrc-diag-sweep.js --one armed, with EVID
  pointing at evidence/2026-10-25/perseed-sim-tileentry-a/control/
  (control band) and .../armed/ (lever band). Seeds 73671-73678,
  180d death-aware horizon (runDays stops on death/win; 180 is
  the cap, not a fixed horizon — MEASUREMENT §10). Pilot = this
  8-seed band; NO confirm spend (none pre-registered — a confirm
  is a follow-up run's pre-registration, not a mid-run extension).
- CONTROL GATE (run FIRST, on pristine code, before any lever
  code exists): the control band must reproduce the published
  poolpres/spawnsrc control headlines — deaths 234, national-ever
  7/8, wins 4/8, raids 85, raiders 361, pool total 1,494,
  pool wave-3+ 107. If the control does not replicate, STOP and
  report — do not judge against a moved baseline. The verified
  control death total is inserted in the CONTROL VERIFICATION
  section below BEFORE the lever sweep; guards are judged against
  that verified number.
- PRIMARY (GO requires BOTH, same pooled per-raid denominator and
  drafted definition as poolpres-a, via
  scripts/test-poolpres-diag.js --summary on the armed corpus):
  band pool wave-3+ share >= 23% AND drafted wave-3+ per raid
  >= 0.9 (drafted wave-3+ raiders / raids; control = 0.400).
  MEAN-COUNT bar, stated exactly: 23-24% buys ~one wave-3+
  raider per raid ON AVERAGE — NOT one in every raid. Do not
  re-describe it as an every-raid bar.
- GUARDS (vs the verified control band): wins >= 3/8,
  national-ever >= 6/8, death total within ±20% of the verified
  control total. A presence lever that buys big monsters by
  killing villages is NO-GO.
- Secondary (reported, NOT gated): tile-entry wave-3+ births per
  band (spawnsrc census); wave-5 pool presence (any nonzero count
  is a finding, not a bar — wave-5 births are a separate
  standing/readiness-gates question; do NOT judge this lever on
  it); raids with >=1 wave-3+ drafted raider; per-seed table;
  source shares via scripts/test-spawnsrc-diag.js --summary.
- SENSE: one transcript read — does a wave-3+ raider arriving at
  the palisade read as an escalation, or pass unremarked? Quote
  one line. Do NOT bundle the palisade-escalation narration beat
  into this numbers arm (separate open blank); report the
  observation only.
- VERDICTS: GO = PRIMARY passes AND guards pass -> keep the
  lever, commit (own commit, [needs-eyes] — bigger monsters in
  the world change fight feel). NO-GO = PRIMARY missed (guards or
  not) -> revert the game code, commit the measurement record +
  corpus only, report KILLED/NO-GO with the exact failing legs.
  If the 100% ceiling misses the PRIMARY, tile-entry targeting
  is additionally KILLED as a candidate for follow-ups.
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md
  §14): pre-registered metrics bind the run — a miss is NO-GO,
  never re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (carried sighting) — the
  sweep-compare table + analyzer outputs are attached instead,
  and telemetry-check is NOT run on recorder rows (standing
  instruction: its counts are wrong on recorder rows).

## CONTROL VERIFICATION (written after the control band, BEFORE the lever sweep)

Control band run Sun 2026-10-25 ~12:30–12:45 CDT, pristine worktree
code (no lever), recorder rows only, seeds 73671–73678, 180d
death-aware. Corpus:
evidence/2026-10-25/perseed-sim-tileentry-a/control/ (8 rows +
summary.json + spawnsrc-summary.json). Spawnsrc sweep --summary:
NEUTRALITY EXACT, CORPUS PASS.

- Per-seed: 73671 survived 180d 16 raids/74 raiders; 73672 won lesser
  d97 7/28; 73673 won lesser d124 7/30; 73674 survived 180d 14/65;
  73675 won lesser d135 13/56; 73676 village-lost d70 7/28 starv 4;
  73677 village-lost d143 12/45; 73678 won lesser d116 9/35 starv 1.
- Band: raids 85, raiders 361, pool total 1,494, pool wave-3+ share
  7.16% (107), drafted wave-3+ per raid 0.400 (34 drafted; raids
  with >=1 wave-3+ drafted 26/85), wave-5 pool 0, tile-entry births
  236 of which wave-3+ 45 (19.1%).
- Wall: wins 4/8 (all lesser), national-ever 7/8, national-final
  6/8, table invited 4/8, entered 4/8, median survival 135d,
  wave-3 8/8, wave-4 6/8, wave-5 0/8, starvation total 5,
  VERIFIED CONTROL DEATH TOTAL = 234.
- VERDICT ON THE SUBSTRATE: the control reproduces the published
  poolpres/spawnsrc control band EXACTLY on every headline
  (85/361, 7.16%, 0.400, 234, 4/8, 7/8, 135d). Guards are judged
  against the verified 234: death band [187.2, 280.8], wins >= 3/8,
  national-ever >= 6/8. The lever sweep starts only after this
  section was written.
- Tooling note (stated, not hidden): scripts/test-poolpres-diag.js
  --summary cannot run on spawnsrc rows — its census gate requires
  a top-level row.diag that spawnsrc rows do not carry (they carry
  raftdraft.diag / spawnsrc.diag). That is a row-shape gate
  mismatch, not a data problem: the primary metrics are computed
  from the same raftdraft fields by the new
  scripts/test-tileentry-measure-20261025.js (validated above:
  control-vs-control reproduces 7.16% / 0.400 / 234 exactly).
  The poolpres analyzer's gate failure is recorded here so no
  later reader mistakes it for a corpus failure.

## RESULTS (written after the lever sweep)

Lever band run Sun 2026-10-25 ~12:50–13:10 CDT, lever code live,
seeds 73671–73678, 180d death-aware. Corpus:
evidence/2026-10-25/perseed-sim-tileentry-a/armed/ (8 rows +
summary.json + spawnsrc-summary.json). Spawnsrc sweep --summary:
CORPUS PASS (classification 1,256/1,256, unknown 0).

## VERDICT: NO-GO — tile-entry targeting mechanism KILLED

- PRIMARY leg 1 — pool wave-3+ share: armed 9.71% (122/1,256)
  vs bar >= 23% — FAIL by 13.29pp. Control 7.16% (107/1,494).
  The ceiling bought only +2.55pp.
- PRIMARY leg 2 — drafted wave-3+ per raid: armed 0.649
  (50 drafted / 77 raids) vs bar >= 0.9 — FAIL by 0.251.
  Control 0.400 (34/85). Raids with >=1 wave-3+ drafted:
  29/77 armed vs 26/85 control.
- GUARD wins: armed 2/8 vs >= 3/8 — FAIL. Control 4/8.
- GUARD national-ever: armed 5/8 vs >= 6/8 — FAIL. Control 7/8.
- GUARD deaths: armed 272 vs control 234, within [187.2, 280.8]
  — PASS (but +38 deaths, +16%, directionally worse).
- GO requires PRIMARY (both legs) AND all guards. Four of five
  legs fail. The verdict is NO-GO, and because the tested change
  was the 100% CEILING of tile-entry targeting, the mechanism is
  KILLED as a candidate for follow-ups (per the pre-registration:
  no weaker targeting weight can beat a failed ceiling in
  expectation, and a chance/volume arm is a follow-up run, not a
  mid-run rescue). The game code is REVERTED (zero src/js diff,
  verified); this commit carries the measurement record + corpus
  only.

## THE CEILING TEST — why the lever is live yet the pool barely moved

1. THE LEVER CODE WAS LIVE (direct proof, run BEFORE revert):
   scripts/test-tileentry-wave100-20261025.js drove a real game
   through the real checkEncounter path (proof output preserved
   here; the script itself was deleted before commit because it
   asserts lever behavior that was reverted with the NO-GO —
   keeping it would leave a failing test on current code, the
   lever-b precedent). Pre-unlock (day 10, unlockedWave 1):
   73 tile-entry spawns, ALL wave 1, 0 wave-3+. Post-unlock
   (day 30 + 4 wave-2 ledger kills via real recordWaveKill calls,
   unlockedWave 3): 117 tile-entry spawns, ALL wave 3 (117/117).
   And the shared spawnWaveTarget() itself was UNCHANGED (200
   draws at top wave 3: 55% wave 3 — a mix, not 100%), so the
   lever lived only at the checkEncounter call site, exactly as
   pre-registered.
2. THE SWEEP MOVED LITTLE: tile-entry wave-3+ births rose
   45 -> 79 (19.1% -> 32.8% of tile-entry births; wave-4 births
   9 -> 48 as armed runs reached wave 4 and then spawned 100%
   wave-4), yet pool wave-3+ share rose only 7.16% -> 9.71%.
   Three compounding reasons, all measured:
   (a) TRAJECTORY TRUNCATION: armed villages die or lose earlier
   (raids 85 -> 77, pool appearances 1,494 -> 1,256, median
   survival 135d -> 140d but with 6 village-losses vs 2 in
   control). The frozen-corpus estimate (41% share) assumed
   control trajectories; the live lever shortens the runs, cutting
   exactly the late raids where wave-3+ share is highest.
   (b) FASTER TURNOVER OF THE NEW STOCK: armed tile-entry
   wave-3+ births stand at only 116 pool appearances (1.47 per
   birth) vs control 105 appearances from 45 births (2.33 per
   birth). The bigger monsters do not linger at the palisade the
   way the old wave-1 stock does — they fight, die, or their
   village dies first. (Wave-3 pool appearances actually FELL,
   102 -> 62, while wave-4 rose 5 -> 60: once wave 4 unlocks,
   100%-newest means no more wave-3 births at all.)
   (c) THE OLD CORE NEVER LEAVES: maintain (345 appearances)
   + hushwolf (135) are still 38% of the armed pool, all
   wave-1/2, and pre-unlock tile-entry wave-1/2 births (162 of
   241) still dominate the early pool. Targeting changes only
   post-unlock births; it cannot dilute stock that never dies.
3. Per-seed armed pool shares (control in brackets): 73671
   6.1% [9.6%], 73672 6.9% [7.1%], 73673 8.8% [3.8%], 73674
   5.4% [5.7%], 73675 16.7% [2.7%], 73676 0.0% [0.0%], 73677
   14.7% [9.6%], 73678 14.3% [11.1%]. NO seed reaches even 17%,
   let alone 23% — this is not one bad seed, it is the mechanism.
4. Per-seed armed band (control in brackets): 73671 village-lost
   d144 [survived 180d] 13 raids/58 raiders, deaths 37 [31];
   73672 village-lost d67 [won d97] 6/22, deaths 25 [25];
   73673 won lesser d104 [won d124] 6/28, deaths 27 [28];
   73674 won lesser d128 [survived 180d] 10/44, deaths 23 [18];
   73675 village-lost d173 [won d135] 14/57, deaths 35 [24];
   73676 village-lost d67 [lost d70] 7/28, deaths 29 [31];
   73677 village-lost d140 [lost d143] 11/42, deaths 44 [43];
   73678 village-lost d148 [won d116] 10/39, deaths 52 [34].
   Death-cause shift (armed vs control): player arena deaths
   50 vs 28, villager:monster 14 vs 5 — the stronger world kills
   in the arena and in monster fights, which is the guard story
   in numbers. Starvation 6 vs 5 (not the driver).
5. Wave-5 pool presence: 0 in both bands (finding, not a bar —
   carried blank #2 stands: wave-5 births remain a
   standing/readiness question, untouched by spawn targeting).

## WALL NUMBERS (armed band; control in brackets)

- national-ever 5/8 [7/8], national-final 3/8 [6/8], table
  invited 2/8 [4/8], entered 2/8 [4/8], wins 2/8 [4/8] — all
  lesser seat. Full seat 0/8 [0/8].
- wave reach: wave-3 8/8 [8/8], wave-4 6/8 [6/8], wave-5 0/8
  [0/8]. Median survival 140d [135d]; max 173d [180d].
  Deaths 272 [234], starvation 6 [5].
- The scale wall above national/table moved the WRONG way on
  this lever: fewer villages reach national, fewer win. A pool
  that is 9.71% wave-3+ instead of 7.16% cost two wins and two
  national reaches. Targeting alone cannot buy the bar without
  breaking the villages it is meant to escalate for.

## SENSE-TESTING READ (transcript, not just counts)

Sense replay: seed 73671, 60d horizon, lever code live (the
replay is NON-MEASURED — narration shifts trajectories, never
enters the census). File:
evidence/2026-10-25/sim-tileentry-a-sense.txt. The day-60 raid
line is, verbatim, the same line lever-b quoted — a wave-2 apex
gets no special billing, and nothing in it marks wave or
escalation:

> [d60] 🐗 RAID — 5 raiders (Ugly-Eyes, The Moderator, Loud-Eyes,
> Inspiration, Flashbulb Moth) hit Haven in the night, drawn by the
> smell of the pantry! The palisade's stakes take their toll as they
> come over the wall.

Villagers read as people in the same transcript — Landon hauling
water and wood and cooking for the haven, Daniela standing down
the Moderator and walking home bloodied ("⚔️ Daniela stood down
the Moderator and kept walking — 6 rounds, bloodied but
breathing. It's still out there, somewhere."), fire-side gossip
fragments ("You catch fragments by the fire — Grace telling Theo
about Daniela. Half of it's true anymore."). Judgment, fourth
confirmation: the palisade-escalation narration beat does not
exist — a wave-3+ raider at the wall would read exactly like
this list of names. Carried blank, not bundled here. The sense
replay's raids (6, first day 8) differ from the census seed-73671
raids (13 armed / 16 control) because narration shifts the
trajectory; the judgment is about the transcript surface, which
the replay does show.

## VILLAGE ASSESSMENT (plain words)

The lever worked exactly as designed and the villages still got
worse. Making every new monster after wave 3 a big one did put
more big monsters into the woods — births of wave-3+ monsters
nearly doubled — but the woods are still mostly the same old
small animals from the first weeks, because those never die, and
the big newcomers do not stick around: they fight and die, or
their village falls apart before they ever stand at the wall
again. Worse, the villages that met the bigger woods died
sooner: two villages that won in the control run lost outright
with the lever, and the two that still won are the only wins
left. The wall numbers tell the same story in the other
direction — fewer villages reach national, fewer sit at the
table. The lesson is not "bigger monsters are bad"; it is that
the pool's share is set by what survives, not by what is born.
Any future arm that wants a fifth of the wall to be big monsters
has to deal with the immortal old core first — whether old
monsters eventually leave, die, or stop being drafted — or it
has to accept that the bar itself may be asking the wrong
question: the drafted rate did climb (0.400 -> 0.649 per raid),
and the villages paid for it with wins. The next question is
whether the 23% bar is the right price for escalation, or
whether the old core is the real blank.

## METRIC REVIEW (required, §14)

- No metric was re-scored mid-run. NO-GO is judged exactly as
  pre-registered: pool share >= 23% (achieved 9.71%), drafted
  wave-3+ per raid >= 0.9 (achieved 0.649), wins >= 3/8
  (achieved 2/8), national-ever >= 6/8 (achieved 5/8), deaths
  within ±20% of 234 (achieved 272, pass). Four of five legs fail;
  the death-guard pass does not rescue the verdict.
- Frozen-corpus estimate (41% share) vs live result (9.71%):
  the estimate was stated before the run as motivation, not as a
  metric, and it failed for stated, measurable reasons
  (trajectory truncation, faster wave-3+ turnover, immortality
  of the old core). It is NOT used to re-score anything; it is
  recorded here as the reason the ceiling was worth testing and
  as a warning that frozen-corpus counterfactuals overstate
  targeting levers whenever the lever itself moves trajectories.
- Pool-share pooling choice (carried): per-raid pool counts are
  summed across raids, so long-lived entities contribute
  repeatedly. Right for "what does a raid draft from"; the birth
  census (328 fresh spawns armed, 323 control) is reported
  alongside it so stock-vs-flow is never hidden.
- Sense divergence (stated, not hidden): the narration replay
  trajectory differs from the census trajectories (its raids: 6;
  the census armed seed-73671 raids: 13), so the day-60 raid line
  is from the replay's own run, not from any census raid. The
  judgment (no escalation beat exists in the raid line format)
  is about the transcript surface, which the replay does show.
- Poolpres-analyzer gate mismatch (stated, not hidden): the
  poolpres analyzer's census gate requires a top-level row.diag
  that spawnsrc rows do not carry, so it cannot run on this
  corpus. Primary metrics were computed from the same raftdraft
  fields by scripts/test-tileentry-measure-20261025.js, validated
  by exact reproduction of the control band (7.16% / 0.400 /
  234). No number in this file comes from the incompatible gate.
- No revision is proposed to the pre-registered metrics for this
  run; the bar stands for the next run. A question for the NEXT
  run's pre-registration (not a re-score here): whether the 23%
  pool-share bar, derived from a random-drafting mean-raidN
  argument, is the right price when the draft is nearest-first
  and wave-3+ stock turns over faster than wave-1 stock.

## CONVERGENCE + NEXT BLANKS

scale-onramp stays converging (NOT converged): this run kills a
mechanism (tile-entry targeting) on measured evidence, but the
full seat is still unreached, wave 5 is still 0/8, and wins fell
to 2/8 on the lever band. The standing directive stands until
the tracker records this axis converged on measured evidence.

Next blanks, in order:
1. Tile-entry targeting is KILLED (this run). Do not re-run a
   weaker targeting weight — the ceiling result bounds it.
2. The old-core question (NEW, sharpened by this run): the pool
   share is set by survival, not births — maintain + hushwolf
   wave-1/2 stock (38% of the armed pool) never dies, and
   wave-3+ stock turns over ~1.5x faster. A future arm must name
   a mechanism that moves the old core (departure, mortality,
   draft weighting) or re-derive the bar — not another birth
   weight. (Candidate for the next run's pre-registration, not
   tested here.)
3. Wave-5 births are zero across all sources (0 births, 0 pool,
   both bands) — separate standing/readiness question, not a
   spawn-weight question. (Carried.)
4. Palisade-escalation narration beat for wave-3+ raids —
   confirmed a fourth time by the day-60 raid line. (Carried.)
5. Why tile-entry births decelerate late (82 -> 26 across day
   buckets in the control census) — player-tile occupancy vs
   travel volume; needs a travel census diag, not a lever guess.
   (Carried.)
6. Defender-fight wound manufacture (carried).
7. Field-kill narration/gossip beat (carried).
8. Wait-narration repetition (carried minor observation).

## INFRASTRUCTURE + CORPUS

- No EPERM flap blocked this run; all rows wrote first try.
  Control band took ~9 min, armed band ~11 min (8 seeds each).
- No sibling tree, branch, claim file, tracker, or lock touched.
  Telemetry-check NOT run, per the standing instruction
  (recorder rows are not panels). Balanced panel NOT run:
  balance-panel.js cannot ingest per-seed recorder corpora
  (carried sighting) — the sweep-compare table + analyzer
  outputs are attached instead.
- Corpus (committed with this run): control rows + summary.json
  + spawnsrc-summary.json in
  evidence/2026-10-25/perseed-sim-tileentry-a/control/ (8 rows);
  armed rows + summary.json + spawnsrc-summary.json in
  evidence/2026-10-25/perseed-sim-tileentry-a/armed/ (8 rows);
  sense transcript evidence/2026-10-25/sim-tileentry-a-sense.txt
  (generated under lever code, labeled non-measured); this file;
  measurement script scripts/test-tileentry-measure-20261025.js
  (validated by exact control reproduction). The driven-game
  proof script was deleted before commit (it asserts reverted
  lever behavior; its full output is preserved in the ceiling
  section above, lever-b precedent).
- Game code: ZERO src/js changes in the committed state (lever
  reverted after the NO-GO, verified with git diff empty).
  Worktree contains only committed work after the commit below.
