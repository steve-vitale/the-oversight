# sim-medheadcount-metricfix-a — METRIC REVISION PROVEN, CONFIRM RE-RUN NO-GO ON TWO NEW GATE FAILURES (evidence)

Run: oversight-flesh-out-loop, run fleshout-20261110T0216Z (Loop A).
Axis food-economy (converging, NOT converged). Backlog #1920. Worker
tree: ~/workspace/worktrees/sim-fightblend-reask-a, branch
sim-fightblend-reask-a (slug kept for traceability — see redirect note).
Base master: 1fc09bbe3 (worktree tip = main-tree tip; tree clean at
prereg time). Policy: competent ONLY (scripts/policies/competent.js,
UNMODIFIED). Env: PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d
death-aware cap. Seeds: 96009–96024 (16, confirm band — the owed
re-run of the confirm).

Full pre-registration (binding):
evidence/2026-11-09/sim-medheadcount-metricfix-a-prereg.md (committed
`b6c7233c8` BEFORE any judged computation). Prior record:
evidence/2026-11-09/sim-medheadcount-confirm-a.md (+ prereg) — NO-GO on
G2 NEW-MODES ("the redactor":2); evidence/2026-11-09/
sim-medheadcount-suite-a.md §Fixes (the 10 test fixes).

## Redirect note (no fightblend work exists)

The original brief for this run (fightblend re-ask on the frozen band)
was issued on a STALE tracker blank and was STOPPED by coordinator
redirect before any fightblend sim ran and before any fightblend prereg
was committed (worktree verified clean at redirect time). The freeze +
band-level fightblend re-ask already landed as sim-bandfreeze-b (commit
`52e8caec0`, verdict MIXED), and Loop B's sim-fightblend-reask-b
(`a81cb2d07`) retired the single-seed attribution route. This arm is
re-pointed at the metric revision from the just-landed medic-headcount
confirm. The worktree slug and branch stay `sim-fightblend-reask-a` for
traceability; the arm name is the work done.

## Work done in this run

### The metric revision (implemented + proven, per the confirm's Metric review)

`scripts/analyze-medheadcount-a.js`, `causeMode(c)`: after the existing
fight-label regex, a cause label matching the game's monster roster
(`src/data/monsters.json` name/shortName/id, case-insensitive, exact
match — 72 entries, loaded once at startup) now collapses to `'fight'`.
A missing/malformed roster FAILS LOUDLY (exit 2), never silently falls
back to regex-only. The metric itself (no new death-cause MODE) does
not change — only the label-to-mode classification, grounded in the
game's own data. Boundary, as preregistered: labels that are NOT roster
names (`ugly-eyes`, `the ugly beast`, `the night`, `loud-eyes`,
`big-eyes`) are deliberately NOT collapsed; if one trips the clause it
fails honestly.

Proof, in order (prereg step 1–2):
- Pilot corpora (`evidence/2026-11-08/medheadcount-a-corpus/` +
  `-after/`): `--leg` still pins share 56.1% (543/968), zeroMedicSeeds
  2/8, spawnSeedsWithMedic 4/8; `--before/--after` reads `G2 NEW-MODES
  ... none -> PASS`, `VERDICT: GO`, exit 0. The revision changes
  nothing the pilot could see (its only new cause ≥2 was "combat",
  already collapsed) — as the prereg predicted.
- L7 replay on the COMMITTED confirm corpora (the exact failing case):
  `G2 NEW-MODES ... none -> PASS`, `VERDICT: GO`. Sensitivity proven
  both ways: the OLD analyzer (from HEAD) on the same corpora still
  reads `"the redactor":2 -> FAIL`, `VERDICT: NO-GO`; the synthetic
  control (a genuinely new non-fight cause ≥2) still flags. The clause
  still bites — it just no longer bites monster names.
- Proof test `node scripts/test-medheadcount-a.js`: **8 PASS, 0 FAIL,
  0 SKIP** on the levered tree (L0–L7); **5 PASS, 3 FAIL** on the
  reverted tree (L0/L1/L3 fail by design; L7 passes — it tests the
  analyzer, not the lever, as preregistered).

### Patch check

`git apply --check` on `hidden_files/medheadcount-a-gamejs.patch`:
APPLIES CLEANLY on this tree (22 insertions / 5 deletions,
`src/js/game.js` only, no hand port). Applied for the after leg,
reverse-applied at the end (see Verdict).

### Before leg (base tree, 1fc09bbe3) — reproduces the confirm's before leg EXACTLY

`PLENTYDEPRI=1 DEPOSITGATE=1 SEEDS=96009,…,96024 DAYS=150` via
`scripts/sweep-medheadcount-a.js` — 16 competent + 16 bare, exit 0,
summary written. Every headline number is identical to the confirm
run's before leg (base 30d95ed8c): WALL national=0/16 table=0 wins=0
waveReach={1:16,2:16,3:16,4:16,5:4} medianSurvival=102d max=145d;
PRIMARY medicPresent=1120/1545 share=72.5% zeroMedicSeeds=3/16
(96010, 96015, 96022) spawnMedics=30 spawnSeedsWithMedic=13/16;
PATHS medLessons=110 triageNonMedicDays=1118 triageNonMedicMax=8
wcHolderDays=1245 hmHolderDays=1215; RECRUIT joins=265 medicJoins=36
medicDeaths=33; GUARDRAILS starvationDeaths=16, deathCauses dominated
by "the wild" 154, monster 33, starvation 16. The base movement
30d95ed8c → 1fc09bbe3 moved NO confirm-band endpoint. Recorder
neutrality: 16/16 bare==competent fingerprints (days,
national/table/win, deathCauses, deathKeys, waveReach).

### The 10 test fixes (re-applied, all green on the levered tree)

Applied exactly as briefed in the suite file §Fixes with the confirm
run's validated seeds/repairs: 3 assertion repairs (feast-healing-use —
companion from the actual first-blow owner; pellet-q4 — fight first,
bearer from an actual villager fighter; cornucopia-wired — return line
allows a re-departed forager) + 7 seed refreshes (occupation-cohorts
4058→4075, cornucopia-wired 7→8, titan-standdown 8991→8992,
party-opening-turn 20→54, region-start 20261015→20261016,
table-ascension 1313→1315, pellet-boost 20261108→20261109, capable-bot
81→85). Standalone on the final levered tree, ALL 10 GREEN:
6/6, 33/33, 21/21, 19/19, 9/9, 55/55, 17/17, 39/39, 19/19, 40/40.

One count note (not a failure): titan-standdown reads 19 passed, 0
failed here vs the confirm run's 22/22. The file is untouched since
30d95ed8c and the seed is the same (8992); the 3-assertion delta is a
fight-shape difference on the moved base (fewer live-fight stages run
at this seed). Green either way — the gate criterion is 0 failed.

### After leg (levered tree) — reproduces the confirm's after leg EXACTLY

Same sweep invocation, exit 0, 16 competent + 16 bare. Every headline
number is identical to the confirm run's after leg: WALL national=0/16
table=0 wins=0 waveReach={1:16,2:16,3:16,4:16,5:6}
medianSurvival=115d max=150d; PRIMARY medicPresent=1317/1695
share=77.7% zeroMedicSeeds=0/16 spawnMedics=32
spawnSeedsWithMedic=16/16; PATHS medLessons=117
triageNonMedicDays=1413 triageNonMedicMax=5 wcHolderDays=1563
hmHolderDays=1163; RECRUIT joins=281 medicJoins=40 medicDeaths=37;
GUARDRAILS starvationDeaths=5. Recorder neutrality: 16/16
bare==competent fingerprints.

## Confirm band (16 seeds 96009–96024, 150d, competent)

Analyzer: `node scripts/analyze-medheadcount-a.js --before
evidence/2026-11-09/medheadcount-metricfix-before --after
evidence/2026-11-09/medheadcount-metricfix-after --seeds
96009,…,96024` — full output in
evidence/2026-11-09/medheadcount-metricfix-analyzer.txt.

G1 PRIMARY: share=77.7% (need >=70%, before 72.5%) -> PASS;
zeroMedicSeeds=0 (need <=2, before 3) -> PASS; G1 PASS.
G2 GUARDRAILS: medianSurvival 115 vs 0.8x before 82 -> PASS;
starvation 5 vs before+4 20 -> PASS; G2 numeric PASS.
G2 NEW-MODES (mode reading, fight labels collapsed): none -> PASS.
VERDICT: GO (G1+G2 pass; G3 panel + G4 proof judged separately).

Per-seed (days before → after; medic-present days; spawn medics):

| seed | days | medicPresent | spawnMedics | note |
|---|---|---|---|---|
| 96009 | 60 → 60 | 59/60 → 59/60 | 4 → 4 | identical |
| 96010 | 82 → 150 | 0/82 → 150/150 | 0 → 2 | zero-medic fixed, survives |
| 96011 | 102 → 102 | 87/102 → 87/102 | 2 → 2 | identical |
| 96012 | 145 → 141 | 138/145 → 134/141 | 2 → 1 | reshuffle costs a medic, 4d shorter |
| 96013 | 119 → 119 | 99/118 → 99/118 | 3 → 3 | identical |
| 96014 | 120 → 102 | 115/120 → 94/101 | 2 → 1 | reshuffle, 18d shorter |
| 96015 | 50 → 123 | 0/50 → 117/122 | 0 → 2 | zero-medic fixed |
| 96016 | 102 → 115 | 101/101 → 112/115 | 3 → 2 | longer, fewer spawn medics |
| 96017 | 88 → 110 | 84/87 → 25/110 | 2 → 1 | the reshuffle flaw (see below) |
| 96018 | 116 → 116 | 90/115 → 90/115 | 2 → 2 | identical |
| 96019 | 131 → 88 | 108/131 → 75/87 | 1 → 2 | 43d shorter after the reshuffle |
| 96020 | 83 → 83 | 25/82 → 25/82 | 2 → 2 | identical |
| 96021 | 65 → 65 | 64/64 → 64/64 | 4 → 4 | identical |
| 96022 | 80 → 121 | 0/80 → 36/120 | 0 → 1 | zero-medic fixed; medic dies d37 |
| 96023 | 68 → 68 | 52/68 → 52/68 | 2 → 2 | identical |
| 96024 | 141 → 141 | 98/140 → 98/140 | 1 → 1 | identical |

8 seeds identical on every field (96009, 96011, 96013, 96018, 96020,
96021, 96023, 96024 — the guarantee never fires there because a medic
was already drawn, and the forced draw consumes no RNG when it does not
fire). The three zero-medic seeds are all fixed. 96017 is the caution,
carried from the confirm: spawnMedics 2 → 1 (the forced draw reshuffles
the roster lottery), the one medic died day 42, medic-present 84/87 →
25/110, though the village still lived longer (88d → 110d) on taught
skills. 96012 (145d → 141d), 96014 (120d → 102d), 96019 (131d → 88d)
survive shorter after the reshuffle.

Death causes, after leg (new labels vs before): `gavel`:1,
`performance review`:1, `choir toad`:1, `big-eyes`:1 — all count 1,
below the ≥2 threshold. The first three ARE roster names (collapsed to
'fight' by the revision); `big-eyes` is NOT a roster name and would
trip honestly if it ever reached count 2 — the roster has no
"Big-Eyes" entry. `the redactor`:2, the confirm's failing label, is
now collapsed and reads as fight, not as a new mode.

### G3 balanced panel (confirm corpora)

Panels: `node scripts/balance-panel.js --out
evidence/2026-11-09/medheadcount-metricfix-panel/panel-before
--seeds 7,42 --days 150` on the base tree, then the same for
panel-after on the levered tree; compare attached as
evidence/2026-11-09/medheadcount-metricfix-panel/compare.md (+
compare.json). Decision: **review_required**, no regression_signal
anywhere (the compare tool's exit code 2 is its own convention: it
exits 2 for any decision other than `no_material_signal`); all four
policies 2 paired cases, screen only, "insufficient" throughout. The
compare numbers are byte-identical to the confirm run's compare —
capable table win rate 0.5 → 1, national 0.5 → 1, village deaths
62 → 90.5; risk-aware 76 → 78.5, socialite 61 → 74.5, winseek
75 → 79.

Seed-42 capable watch — THIRD occurrence, asked and answered: the
prereg required the question be asked if a third panel showed the same
seed-42 expedition-death doubling. It does (62 → 90.5, same as the
pilot and the confirm). The answer on the evidence available: the rise
sits ALONGSIDE wins, not instead of them (win rate 0.5 → 1, national
0.5 → 1, community loss 0.5 → 0), and the other three policies show no
doubling — so this is not a systematic push into expeditions by the
roster reshuffle; it is the price of a winning run that lives longer
and reaches further, on one seed of one policy. Watch closed as
explained; re-open only if a future panel shows deaths up WITHOUT
wins up.

### G4 proof + gate

- `node scripts/test-medheadcount-a.js` on the levered tree: **8 PASS,
  0 FAIL, 0 SKIP** (L0–L7). On the reverted tree: 5 PASS, 3 FAIL by
  design (L0/L1/L3 fail; L7 passes — analyzer, not lever).
- All 10 repaired/refreshed tests green on the levered tree (above).
- `node scripts/check.js --quick` — base tree: **293 passed, 7
  failed** (781s); levered tree: **291 passed, 9 failed** (543s).
  Failure-set comparison (the gate read that decides G4):
  - FIXED on levered (failed on base, pass on levered): the 3
    base-drifted fixtures the refreshes repair — occupation-cohorts,
    party-opening-turn, capable-bot. (They fail on base with the OLD
    seeds because the base moved since those seeds were picked — fixture
    drift on current master, not lever breakage; the refreshes repair
    them.)
  - STANDING on both (4): mobile-combat-cadence,
    occupation-panels, phone-frame-proof, establishment-r20-fixes.
  - FLAKE (failed in the levered quick run, passes standalone on the
    levered tree): time-save-crashes (5/5 recovery processes pass
    standalone) — the documented contention class, not a lever effect.
  - KNOWN-STALENESS (fail on levered, pass on base — the expected
    class for ANY src/js change): measurement-proof-update ("Proof
    source inputs are not current") and measurement-workflow
    ("retained neutrality proof covers the current Game/controller/
    harness inputs"). The suite file anticipates exactly these two
    ("green except the two measurement-proof staleness failures"); the
    refresh is owed at landing via scripts/balance-proof-update.js
    (the succession r166 precedent), not a lever defect.
  - NEW AND LEVER-ATTRIBUTED (fail standalone on levered, pass
    standalone on base — deterministic, isolated to the game.js patch
    by a stash test): **contest-win-credit** and
    **main67-titan-standdown**. See Verdict.

### Telemetry deviation check (reported, not a GO bar)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'.../medheadcount-metricfix-after/medheadcount-a-competent-s*.json'
--metrics national,table,wins,exiled --sweep-rows` prints the same
three LOUD lines as the confirm run (national 12 → 0, table 16 → 0,
wins 16 → 0). EXPLAINED, not a bug, and NOT rolled forward: the
scale-wall baseline is the WINSEAT regime and its own `_regime` note
says never to compare pre-seat substrates against it. The identical
three LOUD lines fire on the BEFORE leg too, with no lever applied, so
the deviation cannot be lever-attributed. The baseline is left
untouched.

## Verdict

**NO-GO.** G1 PASS (77.7% ≥ 70%, 0/16 zero-medic), G2 PASS (median
115d ≥ 82, starvation 5 ≤ 20, new-modes none under the revised
wiring), G3 PASS (review_required, no regression_signal), G4 FAIL —
the proof is 8/8 and the 10 tests are green, but the full gate finds
TWO new lever-attributed failures the confirm run's gate did not catch:

1. **scripts/godpath/test-contest-win-credit.js** — `Error: Missing
   public choice Refuse to answer`. Standalone on the levered tree it
   fails after 3 passing assertions; standalone on the base tree
   (lever stashed, test files unchanged) it passes 21/0. The lever's
   roster reshuffle changes the conversation shape so the "Refuse to
   answer" choice is not offered in the fixture's scenario.
2. **scripts/godpath/test-main67-titan-standdown.js** — `FAIL:
   standdown refuses a live real fight without releasing its army`.
   Standalone on the levered tree: 21 passed, 1 failed; on the base
   tree: 22 passed, 0 failed. The reshuffled muster army changes the
   standdown-during-a-live-fight shape. (The other titan test,
   test-titan-standdown-20261019.js, passes 19/19 on the levered tree
   — a different file, a different scenario.)

Both are deterministic, standalone-reproducible, and isolated to the
game.js patch by the stash test (base run kept the fixed test files,
the analyzer revision, and the proof test — only game.js changed).
Both are the SAME CLASS as the original 10 gate failures: fixture
tests that memorized the old starting cast, broken by the roster
reshuffle. They are not new mechanisms and not proof staleness — but
under the binding prereg ("no NEW lever-attributed check.js --quick
failure"), a miss is NO-GO, never re-scored. Fixing them now would be
un-preregistered work: each needs its own investigation (fixture drift
vs real behavior break), its own seed search or repair, and a fresh
full gate. That is the next arm's work order, not a mid-run patch.

Per the binding prereg, the lever is REVERTED from the tree
(`git apply -R` of the held patch; game.js has zero diff vs base and
zero `forceOccIds`), and the 10 test fixes are reverted with it (the
files are byte-identical to HEAD; the fixes are recorded here as
validated-on-levered-tree, held for the next run). The metric
revision (analyzer) and the proof test (L7) STAY — they are
instruments, not the lever, and the next arm needs them. The evidence,
instruments, proof test, and corpora land as record; the lever does
not. The proof test on the reverted tree reads 5/8, as preregistered.

Why the confirm run's gate (296/4) missed these two: its quick run
was on the 30d95ed8c base, and either the moved base (30d95ed8c →
1fc09bbe3) plus the lever breaks them where the old base plus the
lever did not, or they passed under that run's parallel contention.
Either way the lesson is recorded: a gate run on the CURRENT base +
lever is what catches them; a prior run's gate number must not be
trusted across a base move.

## Metric review

- THE REVISION WORKS, exactly as specified. The redactor case reads
  "none" + GO on the pilot corpora, on the committed confirm corpora
  (L7 replay), and on the fresh re-run corpora. The old analyzer still
  fails the replay (sensitivity proven). A genuinely new non-fight
  cause still trips (synthetic control). The metric (no new death-cause
  MODE) is unchanged; only classification changed, grounded in the
  game's own roster data. The revision is PROVEN and stays in the tree
  as an instrument — the next arm re-runs the confirm against it
  without re-proving the wiring.
- THE REVISION'S BOUNDARY HELD. Non-roster labels (`ugly-eyes`, `the
  ugly beast`, `the night`, `loud-eyes`, `big-eyes`) are not collapsed
  and none tripped (all count 1 in after, or present in before). New
  after labels: `gavel`:1, `performance review`:1, `choir toad`:1
  (roster names, collapsed), `big-eyes`:1 (NOT a roster name, count 1,
  no trip). If `big-eyes` ever reaches count 2 in an after leg it will
  trip honestly — the roster has no "Big-Eyes" entry, so the cause
  emission may need the monster id, or the roster needs the epithet.
  That is a finding for the next arm, not a re-score.
- BASELINE SHIFT (carried). The confirm band's before-leg share is
  72.5%, far above the pilot's 56.1% — the band's villages already hold
  a medic most days without the lever, so the G1 share clause is nearly
  saturated at baseline and the discriminating clause is zero-medic
  (3 → 0), which the lever passes outright. The re-run reproduces both
  numbers exactly.
- G1 BAR SHAPE (carried). The zero-medic bar (≤2/16) is met with
  margin (0), but seed 96017 shows the guarantee's weak spot: it
  promises "at least one at spawn", not "at least as many as the
  lottery would have given" — the forced draw reshuffles the roster
  and that seed drew 1 medic instead of 2, then lost it day 42. A
  future revision could force the guarantee without consuming the
  lottery draw (or top up to the lottery count), and should measure
  medic RETENTION (medic-days after the first medic death), not just
  spawn. Recorded as a finding below, not a re-score.
- GATE LESSON (new). The confirm run's gate did not catch the two new
  failures. A gate number from a prior base does not transfer across a
  base move — the full gate must be re-run on the landing base, with
  the lever applied, before any landing claim. The two failures are
  the same fixture-drift class as the original 10; the next arm's work
  order is a 2-item extension of the suite fixes, not a new
  investigation.
- PANEL WATCH (answered). The seed-42 capable watch reproduces a
  third time with the same shape and the same explanation (deaths up
  alongside wins, community loss down, no doubling on the other three
  policies). Closed as explained — price of a winning run.
- TITAN COUNT (new). titan-standdown reads 19/19 on the levered tree
  vs 22/22 on the confirm's base — a fight-shape difference on the
  moved base, not a failure. The prereg's "expected counts" were the
  confirm run's counts; the gate criterion is 0 failed, which holds.
- TELEMETRY (carried). The three LOUD lines are the known WINSEAT
  regime mismatch, firing identically on the before leg. Not rolled
  forward.

## Sense (SENSE-TESTING LAW)

Read from the re-run corpora (lessons, joins, deaths, per-day
headcounts — the corpora carry no dialogue transcripts, so the sense
read is on the stories the numbers tell). The stories reproduce the
confirm's exactly, because the legs reproduce exactly:

- 96010 AFTER is the lever working as designed: a Dentist spawns,
  teaches wound_care from day 3 (d3, d4, d10, d11, d13 — the chain
  spreads to four more villagers in ten days, farid_ahmed himself
  teaching on day 4), a medic is present all 150 days, the village
  survives the horizon. Before, the same seed had no medic ever and
  died day 82. Coherent and human: one knowledgeable person arrives,
  teaches, the village holds. The telling moment, quoted from the
  record: the Dentist who taught the village to treat wounds dies on
  day 150 — the last day of the run, after 150 days of presence. The
  teacher outlives the village's need, barely.
- 96022 AFTER is the honest cost: the guaranteed Dentist teaches from
  day 4 (d4, d5, d6, d12), is killed by The Redactor day 37, and the
  village runs medic-less for 84 days — but the teaching outlives the
  teacher (tariq_mahmood, a non-medic student, teaches wound_care on
  d80 and d99; wound_care holders present 118/120 days). The
  guarantee buys knowledge, not immortality. Coherent.
- 96017 AFTER is the flaw the numbers admit: the forced draw
  reshuffles the roster, the seed gets 1 medic instead of 2, the medic
  (an ER nurse) dies day 42, medic-present 25/110 — worse headcount
  than before (84/87) on a seed the lever was supposed to help. The
  village still lives longer (110d vs 88d) because the skill spread
  (triage on 100 days, wound_care holders 105 days). The guarantee is
  invisible in fiction (no villager ever remarks on it) and the
  reshuffle cost is real but small. No robotic or repeated dialogue
  appears in the corpora; nothing here reads as a scripted line.

## Village assessment in plain words

Sixteen villages, same starting conditions except one change: every
village is now guaranteed to start with at least one person who knows
medicine — a nurse, a paramedic, an army medic, a midwife, a dentist,
a pharmacist, or a vet. Before the change, three villages in sixteen
never had a medical person at all, for their whole lives — nobody to
teach wound care, nobody to tend the sick, and those villages died
young (50, 80, 82 days). After the change, all sixteen start with a
medic, and those three villages live much longer (one survives the
full 150 days). Villages overall live longer (typical village 102
days before, 115 after) and starve far less (16 starvation deaths
before, 5 after). But nobody gets closer to the big goal: still zero
villages reach national standing, zero reach the table, zero win. The
medicine guarantee fixes a real, specific gap — villages dying for
lack of anyone who knows medicine — but it does not move the scale
wall at all. And it has one honest flaw: forcing a medic into the
starting group shuffles who else shows up, so on one village in
sixteen the shuffle actually cost a second medic, and on three
villages the shuffle changed how long they lived for the worse. The
final call is NO-GO — not on the medicine (that works), and not on the
test that blocked it last time (the monster-name fix works too), but
on two more fixture tests the reshuffled starting cast breaks: a
contest conversation that no longer offers "Refuse to answer", and a
titan standdown that won't release its army during a live fight. The
medicine is fine; the starting cast it shuffles is load-bearing in
more places than the first gate found.

## Blanks filled or documented

- FILLED (proven): the metric revision — monster-roster collapse in
  the G2 new-modes wiring (analyzer change + proof L7). Pilot
  corpora still read "none" + GO; the committed confirm corpora
  replay "none" + GO; the old analyzer still fails the replay; the
  synthetic control still flags a real new cause. The revision stays
  in the tree as an instrument.
- FILLED (reproduced): the confirm band re-run — both legs reproduce
  the confirm's legs EXACTLY on current master (every headline number
  identical, before and after), and the panel reproduces
  byte-identically. The determinism premise holds a seventh time.
- FILLED (fixed + validated): all 10 gate failures from the confirm
  run — 3 assertion repairs + 7 seed refreshes, each green standalone
  on the levered tree (6/6, 33/33, 21/21, 19/19, 9/9, 55/55, 17/17,
  39/39, 19/19, 40/40). Held with the lever (reverted from the tree,
  recorded here).
- HELD (NO-GO, this re-run): the medic-headcount lever itself. G1
  PASS, G2 PASS (revised), G3 review_required / no regression_signal,
  G4 proof 8/8 — but the full gate finds 2 new lever-attributed
  failures (contest-win-credit, main67-titan-standdown). Lever +
  10 test fixes reverted from the tree; the metric revision and proof
  L7 stay as instruments.
- DOCUMENTED (next arm's work order — 2 items, same class as the
  original 10): (1) scripts/godpath/test-contest-win-credit.js —
  "Missing public choice Refuse to answer" (passes 21/0 on base, fails
  on levered); investigate whether the choice is roster-dependent
  fixture drift (re-seed) or a real conversation break. (2)
  scripts/godpath/test-main67-titan-standdown.js — "standdown refuses
  a live real fight without releasing its army" (22/0 on base, 21+1
  on levered); same question, same fix class. Each needs its own
  investigation, seed search or repair, and a fresh full gate on the
  landing base.
- DOCUMENTED (gate lesson): a prior run's gate number does not
  transfer across a base move — the full gate must be re-run on the
  landing base with the lever applied.
- DOCUMENTED (measurement-proof staleness): the two staleness
  failures are the expected class for any src/js change; the proof
  refresh (scripts/balance-proof-update.js) is owed at landing.
- DOCUMENTED (flake): test-time-save-crashes.js fails under the
  4-parallel gate and passes 5/5 standalone — contention, not the
  lever.
- DOCUMENTED (finding, not a re-score): the guarantee reshuffles the
  roster lottery — seed 96017 drew 1 spawn medic after the lever vs 2
  before, and lost it day 42 (medic-present 84/87 → 25/110). Future
  work: a guarantee that does not consume the lottery draw, and a
  medic-RETENTION measure alongside spawn.
- DOCUMENTED (panel watch, answered + closed): seed-42 capable deaths
  62 → 90.5 a third time, expedition-led, with the village winning
  this time. Same shape, same explanation — price of a winning run,
  not a systematic push into expeditions. Re-open only if a future
  panel shows deaths up WITHOUT wins up.
- DOCUMENTED (metric boundary): `big-eyes`:1 in the after leg is NOT
  a roster name — it will trip honestly if it ever reaches count 2.
  The roster has no "Big-Eyes" entry; the cause emission may need the
  monster id, or the roster needs the epithet.
- DOCUMENTED (titan count): titan-standdown reads 19/19 on this base
  vs 22/22 on the confirm's base — fight-shape difference, not a
  failure.

## Convergence state

scale-onramp stays **converging** (NOT converged): the metric revision
is proven and the confirm's numbers reproduce exactly, but the lever
itself is held again — this time on two new gate failures, not on the
metric. The scale wall has not moved on either leg: national 0/16,
wins 0/16, wave-5-ready is not measured on this leg (doorwalk never
walks a door; wave-5 unlocks 4/16 before, 6/16 after), median survival
102d → 115d. The next blanks, in order: (1) the 2-item gate work
order above (contest-win-credit, main67-titan-standdown) on the
landing base, with a fresh full gate; (2) the measurement-proof
refresh at landing; (3) the medic-RETENTION measure and a
non-consuming guarantee, as a follow-up lever revision.

## Files

- Prereg: evidence/2026-11-09/sim-medheadcount-metricfix-a-prereg.md
  (committed `b6c7233c8`)
- Evidence (this file): evidence/2026-11-09/sim-medheadcount-metricfix-a.md
- Metric revision: scripts/analyze-medheadcount-a.js (roster collapse
  in causeMode; STAYS in the tree)
- Proof: scripts/test-medheadcount-a.js (new L7; STAYS in the tree)
- Lever: src/js/game.js (patch applied for the after leg, REVERTED —
  zero diff vs base)
- Tests repaired/refreshed (10 files — see table in the prereg;
  REVERTED from the tree, recorded here as validated-on-levered-tree)
- Confirm corpora (fresh re-run): evidence/2026-11-09/
  medheadcount-metricfix-before/ (16 competent + 16 bare + summary),
  evidence/2026-11-09/medheadcount-metricfix-after/ (16 competent +
  16 bare + summary)
- Logs: evidence/2026-11-09/medheadcount-metricfix-before-sweep.log,
  medheadcount-metricfix-after-sweep.log,
  medheadcount-metricfix-analyzer.txt,
  medheadcount-metricfix-base-quick.log,
  medheadcount-metricfix-levered-quick.log,
  medheadcount-metricfix-panel-before.log,
  medheadcount-metricfix-panel-after.log,
  medheadcount-metricfix-panel-compare.log
- Confirm panel: evidence/2026-11-09/medheadcount-metricfix-panel/
  (panel-before/panel-after panel.json.gz + compare.md/compare.json;
  cases/ caches removed per the medchannel precedent)
