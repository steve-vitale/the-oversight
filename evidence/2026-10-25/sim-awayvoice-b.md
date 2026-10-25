# sim-awayvoice-b — AWAY-HUNGER VOICE BEAT (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261025T0730Z.
Axis: food-economy. Backlog item: away-hunger invisibility, sightings 3–5
(pantrystarve, fullpantry-diag-b Stan, fullpantry-confirm-b David, plus
awayration-size-b name-borrowing sightings), claimed by this run.
Sibling arms sim-packtail-b (pack sizing) and sim-causebase-b NOT touched.
This arm owns WORDS ONLY — zero mechanics (see constraint 1).

## Canon read before designing

- docs/CANON.md: "No silent actions. Every action narrates honestly,
  including failures." + "If you don't know, it doesn't show" (knowledge
  gates every surface).
- docs/PRESERVATION.md: "Pack food (2 ticks) moves only what fits in the
  actual pack" — the beat reports the actual pack, never an invented one.
- SENSE sources (read before designing): evidence/2026-10-25/
  sim-food-awayration-round-0630.md SENSE (Miguel s94801: ate adequately
  3 days while health fell 10 -> 3, died away at 3 HP d111, haven eating
  "Village meal: +2200 kcal", NO line ever naming his pack);
  evidence/2026-10-24/sim-fullpantry-diag-b.md SENSE (Stan d120: decline
  exists only in the meal log; Misky d143: haven beat borrows his name
  while the engine records him away); sim-fullpantry-confirm-b.md SENSE
  (David d139: collapse between two meals, off-screen); sim-awayration-
  size-b.md (operative death shape: low health 3–7 HP + short away meal
  600–832 kcal, 4/4, trailing inadequate-away streak 1 in every case).

## PRE-REGISTRATION (written BEFORE any sims; MEASUREMENT.md §14 — a miss is NO-GO, never re-scored mid-run)

- Substrate: competent policy ONLY, unmodified (scripts/policies/
  competent.js as shipped). Env: PLENTYDEPRI=1, DEPOSITGATE=1 — shipped
  defaults (game engages each unless explicitly '0'; the sweep FATAL-
  asserts both set explicitly, same as the fullpantry sweeps).
- Horizon: 150d death-aware (dead villages stop; no fixed-200d run).
- Qualifying days (defined from the evidence BEFORE sims): a
  packMeal-call day (the sweep's read-only packMeal wrapper records the
  call) for a villager whose village health at meal time is <= 7 HP.
  The 7 threshold is the UPPER bound of the 3–7 HP death shape from
  sim-awayration-size-b (4/4 deaths); it is NOT tuned after seeing
  armed output. A low-health away day with NO packMeal call (dayWant
  <= 50, own production covered need) is NOT a qualifying day — it is
  reported separately as uncovered, never folded into the rate.
- Primary metric: beat fire rate on qualifying days, baseline-observed
  (qualifying days taken from the BASELINE run's packCall records on
  identical seeds) — bar >= 0.80.
- Sense bar (second leg, BOTH legs must pass to land): a read-through
  of sampled beats must name the traveler + pack/hunger state
  coherently, with ZERO name-borrowing instances (the named person
  must be the traveler whose packMeal call the beat rode on, verified
  by the sweep's call-attributed capture, not by substring hope).
  A beat that fires but reads wrong (borrowed name, incoherent, wrong
  traveler) is NO-GO, not a landing.
- Seeds: PILOT 8, ALL REPLAYS (no fresh seeds in pilot): 94801, 94407,
  94408, 94411, 94416, 94425, 94629, 94616. Replay rationale: these
  seeds carry corpus-verified away deaths (Antwi s94407 d14, Stan
  s94408 d120, Somchai+Desmond s94411, Entong+Misky s94416, David
  s94425 d139, Rafael+Somchai s94629, Michel s94616) — EXCEPT 94801
  (Miguel), whose away death is attested ONLY in the 0630Z coordinator
  evidence text: the fix pilot's corpus did not survive the kill-branch
  deletion, so 94801 is evidence-attested, NOT corpus-verified, and
  the pilot itself establishes what current master reproduces on it.
  Baseline vs armed run on IDENTICAL seeds; qualifying days are read
  off the baseline run, so old-corpus drift cannot flatter the rate.
- Confirm band 12–16 runs ONLY if pilot GO passes (fresh seeds then,
  collision-checked against all corpora + dated .md files).
- Narration-only constraint (binding): the beat MUST NOT change pack
  sizing, meal mechanics, hunger penalties, death causes, or any
  number. Proof: per-(vid,day) meal-row identity baseline vs armed
  (ate, drawn, hungerBefore/After, healthBefore/After) AND death-row
  identity (day, who, cause) must be EXACT — any diff is a FAIL of the
  constraint, reported loudly, not averaged away.

## Design decision (pre-registered, before sims)

- ONE hook, in packMeal: packMeal is called ONLY for away villagers
  (villageEats skips the player; the haven branch calls pantryDraw,
  never packMeal), so a packMeal beat CANNOT fire on a haven meal day
  by construction, and CANNOT borrow a haven speaker's name — the name
  comes from getPerson(vid) for the SAME vid whose meal it is.
- Trigger: health[vid] <= 7 at meal time, any packMeal call (take
  < want = short meal, take >= want = adequate meal while hurt,
  take = 0 = empty pack). Wording branches on what the engine knows
  (take, want, pack pool, health); it invents no history, reason, or
  fate. Rationale for the broad trigger over short-meal-only: Miguel
  ate ~need while collapsing — a short-only trigger would stay silent
  on exactly the death day that motivated this arm. A hurt traveler
  eating from a pack away from the haven IS the hunger story, whether
  or not that one meal covered want.
- NO separate away-death beat (deliberate): an away-death line would
  fire for arena/monster deaths where the pack is not the story and
  would misattribute the death. The meal beat fires on the death day
  whenever the operative shape holds (hurt traveler eating from a
  pack away); a death day with no low-health pack meal is honestly
  NOT a hunger story and gets no beat. Reported as such in sense.
- Dedupe: packMeal can run twice for one (vid,day) (the second
  villagerMealDay caller found by pantrystarve/fullpantry). A bounded
  day-marker (village _awayVoice {day, seen}) suppresses the second
  print. It writes narration bookkeeping ONLY — no amount, draw, or
  outcome passes through it, and the meal-row identity proof covers it.
- RNG: the hook consumes no Math.random, so armed trajectories must
  match baseline exactly (the identity proof above is the check).

## Instruments (derived, deltas declared)

- scripts/sweep-awayvoice-b.js: DERIVED from scripts/sweep-
  fullpantry-diag-b.js. Deltas: (1) names/paths awayvoice-b, corpus
  evidence/2026-10-25/sim-awayvoice-b-corpus/, per-seed files
  awayvoice-b-<baseline|armed>-s<seed>.json; (2) seeds exactly PILOT
  [94801,94407,94408,94411,94416,94425,94629,94616], DAYS exactly 150;
  (3) NEW read-only packMeal wrapper (call-through): records vid,
  day, awayBefore, healthBefore, want, take, traveler firstName, and
  beatLines = say lines emitted during that call (sayLog-length
  delta attribution — the name check therefore rides on the call,
  not on substring matching); (4) FULL say log per seed (day-stamped,
  capped 50000 lines with a truncated flag) for sense excerpts;
  (5) CELL env (baseline|armed) required; (6) everything else
  identical: competent FIXED, env FATAL asserts, registerDeath
  CALLS THROUGH, meal wrapper reads only + dedupe last-wins,
  writeRobust, stdout to pipe.
- scripts/analyze-awayvoice-b.js: reads baseline + armed per-seed
  JSONs; reports pack-call identity, qualifying days + fire rate,
  name-borrowing check (beat line must contain the call traveler's
  firstName AND must not contain any OTHER roster firstName from
  that seed's packCall set as a standalone word), meal-row identity,
  death-row identity, uncovered low-health away days, and sense
  excerpts. Prints the pilot table; writes no files.
- scripts/test-awayvoice-b.js: proof — live harness legs (low-health
  away packMeal fires with the traveler's own name; healthy away
  packMeal silent; haven pantryDraw path silent for the beat) +
  analyzer legs on synthetic corpora (fire-rate math, borrowing
  detection both directions, meal-identity diff detection).

## Balanced panel (§15)

Attempted per §15; EXPECTED to throw TypeError reading 'days' on
per-seed sweep corpora (third/fourth sighting incl. cover-b and the
0630Z run: the panel ingests panel.json.gz outputs, not sweep
corpora, and measures no pack/voice metric). If it fails, the
before/after sense + identity tables in this file are the comparison,
and the failure is a tool finding, never a verdict input.

## Metric review (pre-sims)

- Qualifying days are packMeal-call days, so the rate measures the
  beat's reliability given its trigger, not its coverage of all
  low-health away days: the uncovered count (low-health away meal
  days with no packMeal call) is reported alongside, so a high rate
  on a narrow denominator cannot hide.
- The fire-rate denominator comes from the BASELINE run on current
  master, not from old corpora: if current master no longer
  reproduces an old-corpus death, that seed contributes whatever
  qualifying days it actually produces now — no credit for history.
- A beat firing on an adequate meal (take >= want) while hurt is
  counted as a fire, by design (see design decision): the sense
  read-through, not the rate alone, judges whether those lines read
  as hunger or as noise.

## Results — PILOT (filled after pilot; verdict judged against the pre-registration above)

- BASELINE pilot: 8/8 seeds complete (per-seed files in
  evidence/2026-10-25/sim-awayvoice-b-corpus/awayvoice-b-baseline-
  s<seed>.json). Days: 94801:113, 94407:150, 94408:150, 94411:150,
  94416:150, 94425:150, 94629:150, 94616:131 (median 150, horizon-
  capped). Deaths total 79. Qualifying days (baseline packCalls,
  health <= 7): 35 — 94801:0, 94407:3, 94408:2, 94411:5, 94416:11,
  94425:6, 94629:4, 94616:4. Starvation-away deaths reproduced on
  current master: Antwi d14, Stan d120, Somchai d39, Desmond d70,
  Entong d103, Misky d143, David d139, Rafael d37, Somchai d99,
  Michel d94 (10). NOT reproduced: Miguel d111 (see Sense).
- ARMED pilot: 8/8 seeds complete (awayvoice-b-armed-s<seed>.json +
  sweep-armed.json). Days match baseline EXACTLY per seed
  (113/150/150/150/150/150/150/131). Meal rows 9,170; packCalls 858.
- PILOT TABLE (analyzer scripts/analyze-awayvoice-b.js):

| seed | daysB/A | qual | fired | rate | borrow | mealDiff | deathDiff | packIdDiff | uncovered |
| 94801 | 113/113 | 0 | 0 | n/a | 0 | 0 | 0 | 0 | 0 |
| 94407 | 150/150 | 3 | 3 | 1.000 | 0 | 0 | 0 | 0 | 0 |
| 94408 | 150/150 | 2 | 2 | 1.000 | 0 | 0 | 0 | 0 | 0 |
| 94411 | 150/150 | 5 | 5 | 1.000 | 0 | 0 | 0 | 0 | 0 |
| 94416 | 150/150 | 11 | 11 | 1.000 | 0 | 0 | 0 | 0 | 0 |
| 94425 | 150/150 | 6 | 6 | 1.000 | 0 | 0 | 0 | 0 | 0 |
| 94629 | 150/150 | 4 | 4 | 1.000 | 0 | 0 | 0 | 0 | 0 |
| 94616 | 131/131 | 4 | 4 | 1.000 | 0 | 0 | 0 | 0 | 0 |
| TOTAL | — | 35 | 35 | 1.000 | 0 | 0 | 0 | 0 | 0 |

- Narration-only proof (stronger than the row checks): the armed
  sayLog is EXACTLY the baseline sayLog with the 35 beat lines
  inserted in order — verified by subsequence check per seed
  (inserted counts 0/3/2/5/11/6/4/4, zero non-beat insertions).
  Nothing else in the transcript moved.
- Wall numbers (pilot, competent-only, not win-seeking): national
  0/8, table 0/8, wins 0/8, wave-4 2/8 (94801, 94407), wave-5 0/8,
  median survival 150d (horizon-capped; early losses d113, d131).
- SENSE (read-through, SENSE-TESTING LAW — baseline silence vs
  armed line, judged as a player would read them):
  - ANTWI d14 (s94407, starvation): baseline — death exists only
    in the meal log + a generic death line. Armed — "d14 Antwi
    eats away from the haven on a short pack meal — 800 kcal
    from the pack, 1402 wanted — while hurt (health 5/100).
    The haven's shelves can't reach them out here." Names the
    traveler, the pack, the shortfall, the hurt. Coherent and
    consequential. PASS.
  - STAN d120 (s94408, starvation): armed — "d120 Stan eats away
    from the haven on a short pack meal — 600 kcal from the
    pack, 1447 wanted — while hurt (health 3/100)…" The exact
    600-kcal shape from size-b, now voiced on the death day.
    PASS.
  - MISKY d143 (s94416, starvation): the borrowed haven line
    STILL appears ("Misky paces the hall, restless, then sits.
    Then paces.") — that line is a conversation-lane backlog
    item, not removed by this arm. But the same day now also
    carries "d143 Misky eats away from the haven on a short
    pack meal — 800 kcal from the pack, 1622 wanted — while
    hurt (health 2/100)…" A player can now tell which line is
    the traveler's real state. The beat out-informs the
    borrowing; it does not pretend the borrowing is gone. PASS
    (with the backlog item explicitly still open).
  - QUINN d105–108 (s94411, sickness death d108): three beats
    as health fell 5 -> 3 -> 1 HP — a decline arc, not a
    one-off line. GRACE d100–104 (s94416, sickness death
    d104): same arc shape. Both read as a traveler failing
    away, day by day. PASS.
  - GIULIA d117 (s94416, adequate-meal variant): "d117 Giulia
    eats away from the haven — 1163 kcal from the pack —
    while hurt (health 5/100), far from the haven's shelves."
    The adequate variant does not claim a shortfall it does
    not have; it reports hurt + away + pack. PASS.
  - DAVID d139 (s94425, starvation) — THRESHOLD-EDGE MISS,
    documented not hidden: David's death-day packCall reads
    healthBefore 8 HP (want 1540, take 800) — one HP above
    the pre-registered <= 7 line — so NO beat fires on his
    death day, and his armed d139 transcript is identical to
    baseline (only the generic "David starved. Slowly." death
    line). The <= 7 bar was set from the 3–7 HP shape BEFORE
    sims and is NOT re-tuned mid-run (§14): this miss goes
    under Metric review as a next-run revision proposal
    (re-derive the death-day health range from a pooled
    sample — David suggests it may extend to 8), never as a
    reason to move the line now.
  - MIGUEL (s94801) — NOT REPRODUCED on current master: the
    0630Z fix pilot's Miguel (died away d111 at 3 HP) does not
    recur; s94801's village is lost by d113 with a different
    Miguel dying d5 to a monster, 0 qualifying days, 0 beats.
    His fix corpus did not survive the kill-branch deletion,
    so the non-reproduction cannot be debugged against the
    original run — recorded here as a corpus-survival note,
    not as a beat failure (there was no qualifying day for
    the beat to miss).
  - Sense verdict: every FIRED beat names its traveler + pack/
    hunger state coherently; zero name-borrowing instances
    (analyzer check + read-through). The sense leg PASSES on
    its pre-registered terms; the David edge and the Miguel
    non-reproduction are coverage limitations, stated above,
    not silent passes.
- VERDICT: PILOT-GO — rate 1.000 >= 0.80, sense leg passes with
  zero borrowing, meal/death/pack-call identity exact, say-log
  identity exact. The beat lands on its pre-registered bars.
  [needs-eyes] — the beat's wording is player-facing; Steve's
  feel check on one line ("The haven's shelves can't reach
  them out here.") is welcome, not required for landing.

## Balanced panel (§15) — pilot attempt

`balance-panel.js compare` on the sweep corpora throws
`TypeError: Cannot read properties of undefined (reading 'days')`
at scripts/lib/balance-scorecard.js (comparePanels) — fourth
sighting (cover-b, 0630Z, now). The panel ingests panel.json.gz
outputs, not per-seed sweep corpora, and measures no pack/voice
metric. Tool finding, never a verdict input; the before/after
sense + identity tables above are the comparison. No panel output
files were written (it throws before writing).

## Infrastructure notes (pilot)

- The baseline sweep process DIED after writing 7/8 seeds (94629
  done, 94616 missing, no summary file, terminal output lost with
  the session): transient, not a code crash — a oneRun(94616)
  retry completed clean (131d, village-lost, 15 deaths, 87
  packCalls) and its per-seed file was verified by parse +
  readback. The analyzer reads per-seed files, so the missing
  baseline summary is not a verdict gap. The armed sweep wrote
  its summary (sweep-armed.json, 8 rows) normally.
- Wall-clock slowness is sibling CPU contention (load average
  ~14 during the armed run; per-seed sim time is ~2.3s), not sim
  cost. No EPERM flap blocked this run.
- CONFIRM METHOD NOTE (read before the confirm section): the
  confirm "baseline" cell must run on code WITHOUT the beat, but
  the beat is already committed in this worktree by the time the
  confirm runs. A confirm-baseline run started against beaten
  code was KILLED before its first seed completed and its (empty)
  output discarded. The clean route used instead: commit the beat
  (commit A), check out the parent commit's game.js for the
  confirm-baseline run only, restore the beat from HEAD for the
  confirm-armed run. The game.js file is the ONLY file that
  differs between the two confirm cells; scripts, analyzer, and
  evidence are identical. If the restore step ever fails, the
  beat is recoverable from commit A — never from memory.

## CONFIRM PRE-REGISTRATION (written BEFORE any confirm sims; pilot GO passed, so the confirm band runs)

- Seeds: FRESH 16, 94901–94916. Freshness verified 2026-10-25 before
  this section was written: no s949* per-seed file in any corpus dir
  (2026-10-24 + 2026-10-25), and the only 949xx string in dated .md
  files is a git-hash fragment (c94951675, journey-crisis-r46.md),
  not a seed. No overlap with pantrystarve 94301–94308, diag/confirm
  94401–94436, size 94501–94508, casecount 94601–94664, cover
  94701–94732, or fix-pilot 94801–94808.
- Same bars as pilot, judged identically: fire rate on baseline-
  observed qualifying days (health <= 7 packMeal-call days) >= 0.80,
  zero name-borrowing, meal/death/pack-call identity exact. A
  confirm miss does NOT retroactively fail the pilot — it is
  reported as its own verdict (pilot GO stands on its own seeds;
  confirm tests generality on fresh seeds).
- Instruments: scripts/sweep-awayvoice-confirm-b.js (DERIVED from
  sweep-awayvoice-b.js; delta: seeds exactly CONFIRM 94901–94916,
  per-seed files awayvoice-b-confirm-<cell>-s<seed>.json in the same
  corpus dir) + analyzer with AWAYVOICE_SEEDS env override.
- CONFIRM Results: PENDING
- CONFIRM VERDICT: PENDING
