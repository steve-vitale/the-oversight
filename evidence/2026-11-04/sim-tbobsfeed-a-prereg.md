# TB-observation-feed lever — prereg (Loop A, run fleshout-20261104T0415Z, arm sim-tbobsfeed-a)

Committed BEFORE any judged sweep. Axis: scale-onramp (standing
directive). This arm is the 0215Z run's next-blank 2, from
`evidence/2026-11-04/sim-trickcensus-a.md` (the census that named
it). No gate/price/deed/standing change. The 2-observation
threshold is UNTOUCHED. No playable-verb change in this arm —
knowledge alone is measured, and a knowledge-only result is
reported honestly, never claimed as a win lever.

## Grounding (read, not assumed)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` (wave 4: The Mirror
  Draft; waves 3–5 carry NO `counter` field — their counterplay
  is signature mechanics, learnable through the observation
  channel into `state.villagerTricks`, NOT through the ledger
  convention) + `docs/KNOWLEDGE.md` (no doc covers
  counter-learning as its own canon topic; the code comments
  in `src/js/game.js` around `_trickObservation` /
  `noteScholarTrickObservation` are the operative spec, and
  this prereg cites them, not an invented canon doc).
- `evidence/2026-11-04/sim-trickcensus-a.md` + its prereg:
  48 TB fights fed 0 observations (42 lost, 6 won, 0
  fled/routed/calmed, wins excluded by code); 87 pooled
  standing-sufficient days were all veterans-bound, never
  tricks-bound; the one known-trick fight (99116 audit)
  attempted no trick verb. The feed arm measures knowledge
  alone; the verb half is a separate, later arm (see
  "What this arm does NOT claim").
- Code-verified mechanism (read before designing):
  - `Game.tbEnd(result)` (`src/js/game.js`, SCHOLAR TRICK
    OBSERVATION block): on 'fled'/'routed'/'calmed' with the
    scholar alive, calls `noteScholarTrickObservation(mid)`
    once per distinct monster kind ALIVE at fight end
    (`!_m.alive` skipped). 'won' is excluded by the result
    test, AND would feed nothing anyway under the alive
    filter, since a won fight's monsters are dead.
  - `noteScholarTrickObservation(mid)` ->
    `_trickObservation('player', mid, true)`: no-op if the
    kind has no `counter` field and no `villagerTrickDefs`
    entry, or if `villageKnowsTrick(mid)` already; else
    increments `state.villageCounterObs[mid]`, fires tele
    `counter_observed`, narrates first-person "You lived to
    tell it … (n/2 …)" below threshold, and at 2 discovers
    via `discoverMonsterCounter` (counter kinds) or sets
    `state.villagerTricks[mid]` (signature kinds) with the
    "COUNTER LEARNED" narration. Threshold 2, mechanics,
    and narration are all reused untouched.
  - `recordWaveKill` (the slain path) does NOT touch
    `villageCounterObs`: a won TB fight currently feeds the
    observation bar exactly 0, by construction.
  - Results are mutually exclusive: a fight ends once with
    one result, so the existing fled/routed/calmed branch
    and the new won branch can never fire on the same
    fight. Within a fight, kinds are deduped by a Set, so
    at most 1 fed observation per kind per fight.

## The lever (spec, fixed now)

In the same `tbEnd` SCHOLAR TRICK OBSERVATION block, add a
'won' branch with the SAME scholar-alive guard
(`tbFighter('p')` alive, hp > 0): for each distinct monster
kind in `f.fighters` WITH an `mdef` — alive OR dead (a won
fight's monsters are dead; a monster that fled mid-fight
was still fought) — call `noteScholarTrickObservation(mid)`
once. Everything downstream (threshold, discovery,
narration, tele) is the shared `_trickObservation` core,
unchanged. No monster-flee change (Steve 2026-11-02 ruling:
monsters do not flee). No new default gate: the change
itself IS the variant, judged before/after on identical
seeds. No policy change: `scripts/policies/competent.js`
`{competent}` VERBATIM.

## Policy, seeds, horizon (fixed now)

- Policy: competent VERBATIM (at THIS anchor), default env.
- Pilot seeds: 99101–99108. Confirm seeds (only if pilot
  GO): 99109–99116, same policy/horizon.
- Horizon: 140 days, death-aware (dead villages stop
  simulating; never a fixed 200d).
- Legs: baseline = current code WITHOUT the feed (run
  first, before implementing); armed = WITH the feed, on
  identical seeds. The instrument is the trickcensus
  instrument (`scripts/trickcensus-instrument-20261104.js`,
  reused verbatim) driven by this arm's own driver
  (`scripts/tbobsfeed-driver-20261104.js`), which adds only:
  per-seed JSON output under
  `evidence/2026-11-04/perseed-tbobsfeed-a/` and the
  harness's live-death list (`result.samples.deaths`) for
  the cost bar. Exposures carry trickInventoryStart/End
  (villageCounterObs for the fought kind, end captured
  post-tbEnd, i.e. post-feed), so a fed observation on a
  won fight is read as end > start for the fought kind,
  cross-checked against tele `counter_observed` events
  with vid 'player' on the fight day.
- Balanced panel (§15): NOT USED for the judged comparison,
  stated reason (not a fabrication): `scripts/balance-panel.js`
  `compare` requires before/after corpora produced by the
  panel runner itself under its own observer, and its
  metric contract carries no TB-exposure / observation-feed
  metric — it cannot judge this arm's pre-registered legs.
  The judged comparison is the paired per-seed table from
  the shared instrument on identical seeds (baseline leg
  re-run on this anchor; trickcensus totals are NEVER
  cited as this arm's baseline and never pooled with
  pilot numbers).

## Primary metric + GO threshold (pre-registered, judge the arm on this)

Pilot GO iff ALL hold on the 8-seed pilot
(99101–99108, competent, 140d):

(1) FEED RATE: >= 80% of won TB fights in the ARMED leg
    record a fed observation for the fought kind (end
    villageCounterObs > start villageCounterObs for the
    exposure's kind). Fraction computed on counts; e.g.
    3/4 = 75% FAILS. A won fight whose kind is already
    known at fight start (`villageKnowsTrick` true, so the
    shared core correctly no-ops) is EXCLUDED from both
    numerator and denominator and reported separately —
    it is not a feed failure, it is prior knowledge.
    (Design note: the denominator is small — the
    trickcensus pilot held 4 won TB fights — so leg (1)
    is a mechanism check, not a rate estimate; leg (2)
    carries the knowledge claim.)
(2) KNOWLEDGE GAIN: >= 1 wave-4 kind crosses to known
    (2/2) in the armed leg that is unknown in the baseline
    leg (same seed, end-of-run state), OR >= 3 fed
    observations total across the armed pilot leg.
(3) COST BAR CLEAN — all three:
    (a) starvation totals: sum over the 8 pilot seeds of
        deaths with cause 'starvation' or 'hunger' (from
        the harness live-death list) in the armed leg <=
        baseline total + 2;
    (b) arm-only village deaths: count of seeds where the
        armed leg ends village-lost AND the baseline leg
        ends survived == 0;
    (c) median survival (days) in the armed leg >= 0.8x
        the baseline median.
Judge strictly: a miss is NO-GO, never re-scored against
a friendlier metric mid-run; metric doubts go under
"metric review" for the NEXT run.

If pilot GO, confirm on seeds 99109–99116 (baseline +
armed) and judge the SAME three legs on the confirm
band's own baseline before any landing claim. If pilot
NO-GO, kill cleanly: revert the src/js change, keep
instruments + evidence + proof (archive the proof if it
tests deleted code, and say so — no dangling test left
in the suite).

## Sense-test clause (SENSE-TESTING LAW)

Learning narration must read as people learning, not a
counter tick: read at least one armed-leg transcript (or
tele + say record) carrying a fed observation and judge
the "lived to tell it" / "COUNTER LEARNED" lines for
meaning. A fed observation that reads only as a counter
increment, or a discovery line that misnames the beast
or its trick, fails the sense-test leg of the evidence
even if the numeric legs pass — reported as a NO-GO
with the lines quoted.

## Wall numbers (reported every leg, judged descriptively, not as GO)

Wins, national, table, wave-4 faced/kills, wave-5 faced,
median survival — baseline vs armed, per seed. This arm
does NOT expect kills/readiness to move (no verb change);
any movement is reported, never claimed as a win lever.
What this arm does NOT claim: that fed knowledge gets
PLAYED. The trickcensus audit fight proves a known trick
with no verb is decoration; this arm measures the feed
only, and its evidence must say plainly whether the
knowledge half alone moves anything, so the verb arm is
scoped honestly.

## Hard limits (binding, honored)

- NO gate/price/deed/standing change. NO threshold change
  (2 stays 2). NO monster-flee change. NO policy-file
  change. NO Loop B food-economy code. NO other run's
  worktree. NO direct edits to hidden_files/sim-findings.md
  or convergence-tracker.md (findings listed in the
  evidence file for the coordinator).
- Worktree must contain ONLY committed work at end.
- `[needs-eyes]` on the landing commit (player-visible
  learning narration changes).
