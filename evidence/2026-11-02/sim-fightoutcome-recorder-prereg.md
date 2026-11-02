# sim-fightoutcome-recorder — PREREG (Loop A 20261102, run fleshout-20261102T1715Z)

Arm: fight-outcome recorder, axis scale-onramp, blank #2 from
sim-laircontact-a (carried as #2 in sim-heralddepart-a's next
blanks: "a standing recorder, not per-arm driver code, so future
arms get outcomes without re-instrumenting"). TOOLING ONLY.
Zero src/js game-code changes expected; if a game-code hook
proves unavoidable it will be minimal, proof-tested, and
documented, with [needs-eyes] only if it changes feel/combat/UI
(a pure recording hook should not).

This prereg is written AND committed BEFORE any judged sim in
this arm. Judge against this header; a miss is NO-GO, never
re-scored mid-run. Metric doubts go under "metric review" in
the final evidence and apply to the NEXT run.

## What is being built (not re-proved)

- `scripts/fightoutcome-recorder.js` — a standing recorder
  module: install(Game, t) with read-only, zero-RNG-draw,
  call-through wrappers adapting the tbOutcomes pattern from
  scripts/killdisc-instrument-20261021.js and
  scripts/herald-instrument-20261030.js (fightId -> result at
  tbEnd, plus 'dissolved' handling via tbBarrierExit):
  startCombat census (every mid, FOUGHT vs REFUSED, fightId
  join key), tbEnd outcomes (raw engine result string +
  fighter snapshot at end: who fought, who died, monster
  hp/alive), tbBarrierExit dissolved detection, fieldFight
  records (engine outcome taxonomy), recordWaveKill records,
  and the game-side state.titans.outcomes records (read, never
  written) joined to fight rows.
- `scripts/fightoutcome-driver-20261102.js` — a thin driver
  running the closecommit policy stack (titanroute +
  musterclose + mustergap over lead-fullseat, the same stack
  laircontact/heralddepart used) and writing per-seed JSON
  under evidence/2026-11-02/perseed-fightoutcome-a/ carrying
  the outcome rows: one row per fight, with day, seed,
  monster/titan id, engine result (slain / fled / dissolved /
  party-death / other — see normalization below), fighter
  deaths, and the linked titan outcome record when one exists.
- `scripts/fightoutcome-analyze-20261102.js` — a join/audit
  analyzer over the per-seed JSON only (no re-simulation):
  every FOUGHT attempt must carry exactly one outcome row;
  every outcome row must map to a fight start; every titan
  'slain'/'fled' record must join to exactly one TB fight row
  same day, same titan; unresolved fights are listed, never
  hidden.
- `scripts/test-fightoutcome-a.js` — proof test (recorder
  unit/audit cases + determinism gate).

## Result vocabulary (engine reports it; recorder normalizes, never invents)

- engineResult: the raw tbEnd argument ('won', 'lost',
  'fled', 'routed', 'calmed', 'betrayal_*') or 'dissolved'
  (tbfight.result without tbEnd) or 'unresolved' (a started
  fight with no end captured — a recorder failure, counted
  against GO, never silently dropped).
- normalized: slain (titan outcome resolves 'slain', or TB
  result 'won' with the monster fighter dead, or fieldFight
  'vKill'); fled (titan outcome 'fled', or TB 'fled'/'routed',
  or fieldFight 'mFlee'/'vFlee'); dissolved; party-death
  (TB 'lost' with the bearer dead, or fieldFight 'vDie');
  other (everything else, raw string carried alongside).
  Normalization is presentation: GO is judged on the raw
  capture, and any normalized row whose raw source does not
  support it is a false outcome.

## Primary metric

Capture coverage over transcript-verified fights in the pilot
corpus, where a transcript-verified fight is any of: (a) a
FOUGHT startCombat row (a new tbfight id appears), (b) a
fieldFight engine record, (c) a state.titans.outcomes record
with outcome 'fought'/'slain'/'fled'. The analyzer counts
these independently from the recorder's own outcome rows
(attempt rows, fieldFight rows, and the raw outcomes array
are separate fields in the per-seed JSON, so the join is a
real check, not the recorder grading itself).

## GO threshold (binding, both legs)

- GO leg 1 — completeness: 100% of FOUGHT TB fights carry
  exactly one outcome row with a non-'unresolved'
  engineResult, AND 100% of fieldFight records carry an
  outcome row, AND 100% of titan 'slain'/'fled' records join
  to exactly one TB fight row (same day, same titan).
- GO leg 2 — no false outcomes: zero outcome rows without a
  matching fight start (TB or field), zero duplicate outcome
  rows for one fight, and the transcript audit (below) passes.
- GO leg 3 — sense (SENSE-TESTING LAW): at least one full
  titan-fight transcript read end-to-end, with the recorder's
  row matching what actually happened — who fought, who
  died, what the titan record says. A recorder that counts
  fights but mislabels a slay is NO-GO even if legs 1–2 pass.
- Corpus floor (inconclusive, NOT a pass, if unmet): the
  pilot corpus must contain at least one titan TB fight and
  at least one field fight. If the floor is unmet, the pilot
  is re-screened on further seeds, not judged GO on an empty
  corpus.
- Determinism gate: seed 97418 closecommit r1 == r2
  (minus run label) on the outcome rows — the recorder is
  read-only and must not perturb trajectories.

Verdict labels: RECORDER GO (all legs pass) / RECORDER
NO-GO (any leg fails) / DIAG-* (a mechanism finding about
fights themselves, recorded alongside, never substituted
for the verdict).

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 180d, death-aware (dead villages stop simulating;
  runDays end conditions apply, +10d tail max). Why: the
  herald call lands ~d60–150 on the prior arms' seeds and
  fights follow the call; 180d covers call + fight on the
  known seeds while dead villages stop early. This matches
  laircontact/heralddepart so outcomes are comparable.
- Pilot seeds (8, closecommit only): 97418, 97426, 97420,
  97433, 97435, 97400, 97338, 97330. Rationale, re-based on
  current master (NOT carried from old-code claims):
  97418 is the prior arms' verified titan-fight seed (gate
  15, FIGHT-START d60, titan record 'slain' on heralddepart
  code); 97420 had villager field fights against the
  wandering herald (d77/d84/d90, heralddepart note);
  97426/97433/97435/97400/97338/97330 are the prior arms'
  calling/known seeds giving refusal, departure, and
  no-call coverage. Band re-basing warning (laircontact /
  heralddepart lesson): seeds that called on older code may
  not call on current code — the GO legs are coverage rates
  over whatever fights the corpus contains, plus the corpus
  floor above, so a non-calling seed costs coverage floor,
  not a re-score.
- Policies: closecommit stack only (titanroute +
  musterclose + mustergap over lead-fullseat: tribfloor +
  windefer + seatdrive + fullseat-diag). No treatment arms:
  this run judges the recorder, not a lever.
- Confirm (optional within this run): if the pilot passes,
  a 12–16 seed confirm on the same recorder is welcome but
  optional; the final evidence will say clearly which ran.

## Panel note (standing warning, preserved)

scripts/balance-panel.js runs its own policy registry over
its own seeds with its own observer — it cannot ingest
fightoutcome driver records, and its policies do not include
the closecommit stack. The judged evidence is the driver
corpus; a panel compare is attached only if it agrees, and
if it diverges it is reported as an instrument finding,
never re-scored against. Same position as laircontact-a and
heralddepart-a. This arm changes no game code, so the panel
does not apply to a before/after comparison here in any
case.

## Wall numbers (reported, not judged)

National / table / wins, wave 4–5 unlocks, median survival
for the pilot corpus, even though this corpus is a tooling
substrate, not a reach claim. The recorder alone does NOT
make the herald chain reachable end-to-end — it enables
that claim for a later run. The final evidence will state
what that later run still needs.

## Metric review (carried into the final evidence file)

- Section reserved in the final evidence; metric doubts
  recorded there apply to the NEXT run, not this verdict.
