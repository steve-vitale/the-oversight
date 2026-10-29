# sim-recallpolicy-b — cliff-triggered expedition recall POLICY: KILLED AT PILOT

Run: fleshout-loop-b, arm sim-recallpolicy-b, axis food-economy.
Worker tree: ~/workspace/worktrees/sim-recallpolicy-b. Base: master
c3c8a2718 (ship bump; the tree's HEAD at instrument build was
9d96bb738, and the prereg + instrument commits below are on top of
it — the coordinator merges; nothing here was pushed or bumped).

## Verdict: NO-GO at pilot → KILLED WITH TEETH (prereg binding)

Pilot gate (prereg: evidence/2026-10-29/sim-recallpolicy-b-prereg.md,
committed BEFORE any judged leg) requires ALL of: (a) ≥2 ON
triggers, (b) 0 illegal moves, (c) all three guards pass, (d) 0
instrument errors. Result: (a) PASS (8 ON triggers), (b) PASS (0
illegal moves), (c) FAIL — G1 median survival ON 101d vs control
133.5d (bar: ON ≥ control − 2, i.e. ≥131.5d; missed by 30.5d),
(d) PASS (0 errors). **Pilot gate = FALSE → NO-GO at pilot → no
confirm spend, kill with teeth.** The primary rescue bar would also
have missed (0/8 strict rescues vs bar ≥0.50, min-n 8 met exactly),
but the binding kill reason is the pilot gate: the guard failed
before any rescue judgment was reached.

This is NOT a re-score of sim-recalldiag-b's DIAG-NO-GO (lead times
1–2d, judged on the offline corpus). That verdict stands untouched.
This arm judged a different question — rescue effect on fresh seeds
— and answered it: the recall as built rescues nobody in the pilot
and the treated villages die earlier. Both verdicts stand.

## What was built (and then deleted — see Kill section)

- scripts/recallpolicy-instrument-b.js: cliff-triggered recall
  policy instrument, default-OFF (gate RECALLPOLICY_B=1), zero
  src/js. Trigger = RECALL-TRIGGER v1 Rule A ONLY, reused verbatim
  from scripts/taxonomy-recalldiag-b.js (never a copy): away +
  away-majority ≥4/7d + production cliff ≤0.40× trailing-7-away-day
  mean (baseline ≥800, ≥3 days) + pack draws ≥0.30× need. Rule B's
  pantry condition EXCLUDED by design — the instrument's code never
  mentions the pantry (proof A9), because the away villager cannot
  see it. Recall walk: npcSetNode wrap reroutes each leg step to
  the next step of a BFS path to haven (orthogonal, 0..8, each edge
  checked with the engine's own travelBlockage — eveningdetour
  mechanics mirrored as policy mechanics); no path → hold; at
  haven → hold walk-outs; Chebyshev>1 moves pass through as base
  snaps; arrival completes by clearing the away flag at the sleep
  boundary so the engine's own expeditionReturn finishes the return.
  No new narration (the instrument never calls say()).
- scripts/sweep-recallpolicy-b.js: OFF (observe-only) vs ON legs on
  identical seeds, base policy belongfeast, substrate
  FEASTSCALE_R13=1/SEATDRIVE=0, 180d death-aware horizon, death
  attribution via the proven deathcensus instrument.
- scripts/analyze-recallpolicy-b.js: judged analysis (step-legality
  verification, guards, pilot gate, primary).
- scripts/test-recallpolicy-b.js: proof, 36/36 GREEN before the
  judged legs (trigger reuse, BFS legality, reroute/hold/snap/
  engaged/OFF-passthrough, completion, scope-exclusion, one-episode-
  per-away-episode, zero RNG, gate exactly RECALLPOLICY_B=1, OFF
  DET vs pristine byte-identical on 2 seeds × 40d, zero src/js
  touched). The proof is RETIRED with the instrument, not faked:
  the file is deleted in the kill commit below, and this paragraph
  is the record of what it showed.

## Pilot results (8 fresh seeds 68101–68108 × {OFF, ON} = 16 runs, 180d)

Analyzer output: evidence/2026-10-29/sim-recallpolicy-b-pilot-analysis.json.
Corpus: evidence/2026-10-29/sim-recallpolicy-b-corpus-off/ and
...-corpus-on/ (16 per-seed JSONs + _summary.json each).

| metric | OFF (control) | ON (treatment) | bar / note |
|---|---|---|---|
| triggered episodes (hasExped-filtered) | 15 would-fire | 8 | pilot gate (a): ≥2 PASS |
| strict rescues | — | 0 | rate 0.000, bar ≥0.50 |
| total starvation deaths | 8 | 8 | G2 (≤ control+2) PASS |
| triggered-starved | 0 | 0 | no starvation signal either way |
| median survival (gameDays) | 133.5 | 101 | G1 (≥131.5) FAIL by 30.5d |
| illegal moves | — | 0 | G3 PASS |
| instrument errors | 0 | 0 | gate (d) PASS |
| wall: national / everNational / table / won / wave4 / wave5 | 2 / 3 / 5 / 0 / 4 / 0 | 1 / 4 / 6 / 0 / 6 / 0 | observed-not-claimed; wins 0, wave5 0 both legs — the wall is unmoved |

Per-seed survival (gameDays, OFF → ON): 68101: 181 → 139;
68102: 42 → 42 (identical, no trigger); 68103: 144 → 118;
68104: 123 → 84; 68105: 72 → 72 (identical); 68106: 81 → 81
(identical); 68107: 181 → 165; 68108: 154 → 154 (identical).
Every seed whose trajectory diverged (the four with ON triggers
that changed the world) went WORSE under treatment, and none went
better. With n=8 that is suggestive, not conclusive, of systematic
harm — but the prereg's guard binds as written, and a guard miss is
a NO-GO, never an invitation to confirm away the miss.

Why 0 rescues (the mechanism, read off the episodes):
- 2 arrivals happened but AFTER schedule (Misky s68103: walked
  home, parts 19 vs scheduled 15; Michael s68104: parts 15 vs
  scheduled 10) — the walk is slower than the natural return clock,
  because legs only move a villager who is NOT already sitting on
  their expedition target; a recalled villager parked on-target
  waits for the base return to move them, and the recall adds at
  most a step or two.
- 3 natural-duration completions (Evelyn s68104, Hugo s68105,
  Natalia s68106): the base return fired on schedule while the
  villager was still walking — the recall never beat the clock.
- 2 natural-duration-node-wild completions (Mainul s68101, Sam
  s68107): the base-return snap from a diagonally-adjacent node
  (Chebyshev 1) was rerouted to a single orthogonal step, leaving
  the node one tile short of haven while the engine cleared the
  away flag. Node-position lag only — the villager IS home by every
  state that matters (meals, return) — but it is a real flaw in the
  snap detector (see Metric review #2), and it is counted here
  against rescue, never for it.
- 1 died-en-route (Mateo s68107: fired d154, dead d155 in combat
  before any walk could matter — the 1–2d window recalldiag
  measured, playing out exactly as predicted).
- Scope-excluded fires (no agency expedition record: Thabo s68101,
  Hannah s68103, the d4 fires on s68104/s68106, Wanda s68107,
  Sayri/Sari s68108) were counted, not recalled — the walk
  machinery this instrument steers is the agency expedition leg,
  and objective-departure away records are a different system.
  (In the OFF leg these same fires appear as would-fire episodes;
  the analyzer filters them out of both denominators via the
  recorded hasExped flag — see Metric review #3.)

## Sense-testing (SENSE-TESTING LAW — transcripts read, not counted)

Read the recall-event-day say lines for Misky s68103 (d39–42),
Mateo s68107 (d154–156), Mainul s68101 (d34/37/38). The village
reads as alive and coherent — fireside gossip, garden work, water
runs, a red moon over the treeline — and the deaths read as
tragedy, not engine output. Two findings:

1. THE RECALL IS UNVOICED. No line anywhere says a villager turned
   home because their patch died, or that anyone noticed. The
   recalled villager silently walks home and the engine's ordinary
   return beat fires (if the player is at haven) exactly as for any
   return. The recalldiag blank ("the game never voices the recall
   decision") is NOT filled by this instrument — it cannot be,
   since the instrument adds no narration by design. Any future
   recall needs a voice, and that voice is a design question
   (steve-call-sized), not a line this arm could quietly add.
2. No robotic repetition attributable to this arm. The repeated
   "You wait. The light changes. Nothing asks anything of you." is
   the scholar policy's pre-existing idle beat, present in both
   legs, not recall speech.

## Village assessment

Eight belongfeast villages, 180d horizon. OFF: 2 survived, 6 lost
(scattering and succession mixed, median 133.5d). ON: 0 survived
in the diverging seeds, 8 lost or survived identically elsewhere.
Nobody starved because of (or in spite of) the recall —
starvation totals are identical (8 = 8), and zero triggered
villagers starved in either leg: on this band, the cliff-triggered
collapses that the corpus made famous mostly did NOT end in
starvation (they ended in combat, sickness, or survival), and the
villages that died died of succession and scattering, not of the
trail. The blank this arm filled is negative but load-bearing:
a cliff-triggered walk-home policy, built exactly to the
recalldiag trigger, does not rescue villagers on fresh seeds —
it arrives late, and the treated villages die earlier. The food-
economy axis keeps its finding: the trail-starvation channel is
real but rare on this band, and recall is the wrong instrument
for it at this trigger's speed.

## Metric review (§14 — doubts for the NEXT run, never a re-score)

1. STRICT-RESCUE TIMING BIAS (conservative — understates rescues):
   partsAway is measured at the SLEEP-boundary clearance, but the
   natural return's due part is a day-part boundary, and sleep
   clearance always lags node arrival by up to a day (up to 4
   parts). A villager whose NODE arrives before schedule can still
   count as arrived-after-schedule if sleep lands late (Misky:
   node at haven d41, schedule due d41p1, counted parts 19 > 15).
   The 0/8 therefore means "no rescue DEMONSTRATED under a strict
   clock", not "no villager ever beat the clock". A future arm
   must record day/part at first node==haven observation in the
   npcSetNode wrap and judge the schedule test on THAT, not on
   sleep clearance. This does not change this run's verdict: the
   pilot gate already failed on G1, independent of the rescue
   metric, and no re-scoring is permitted.
2. BASE-SNAP DETECTOR FLAW (node lag, rescue-neutral): a base-
   return snap from a diagonally-adjacent node (Chebyshev 1,
   Manhattan 2) is indistinguishable from a leg step by distance
   alone, so it gets rerouted to one orthogonal step and the node
   ends one tile short of haven while away clears. It never steals
   a strict rescue (when the snap is due, the schedule test already
   fails), and it creates no illegal move — but a future arm must
   distinguish the snap by schedule state (partsAway ≥ duration at
   the move → pass the snap through untouched) instead of by
   distance.
3. ANALYZER FIX, DISCLOSED (not a re-score): the instrument's raw
   OFF triggered count includes no-expedition episodes (scope is
   only evaluated when ON). The analyzer computes triggered from
   episodes filtered on the recorded hasExped flag, per the
   prereg's definition (triggered = recallable episodes). This
   changed OFF 22 → 15 and ON 8 → 8 (ON was already correct). The
   corpora are untouched; only the judging tool was aligned to the
   prereg, before the pilot verdict was written.
4. RESCUE-RATE DENOMINATOR CAVEAT: the denominator counts every
   recallable cliff-trigger, including survivable collapses (the
   recalldiag FP finding: most collapses are survived by coming
   home organically). The rescue rate therefore measures "the
   mechanism works" more than "lives saved"; the lives-saved check
   is the triggered-starved comparison (0 vs 0 here — no signal).
   A future arm should pre-register a lives-saved primary (e.g.
   starvation among triggered, ON vs OFF) alongside any mechanism
   rate, or it will keep passing mechanisms that save nobody.

## Balanced panel (§15)

No balance-panel compare .md is produced, as pre-registered before
judging: this leg is a policy-side trace measurement — zero src/js
changes, so there is no game-root delta for a panel to compare,
and the panel's registry policies do not include this instrument.
The before/after instrument is the custom driver on identical
seeds, and the pre-registered thresholds above are the judge.

## Kill (with teeth, per the clearhabit pattern)

Deleted in the kill commit (this evidence file's commit):
scripts/recallpolicy-instrument-b.js, scripts/sweep-recallpolicy-b.js,
scripts/analyze-recallpolicy-b.js, scripts/test-recallpolicy-b.js.
Zero-trace checks (run after deletion, before commit): grep for
RECALLPOLICY_B across scripts/ → no hits; grep for
recallpolicy-instrument / sweep-recallpolicy / analyze-recallpolicy /
test-recallpolicy across scripts/ → no hits. (taxonomy-recalldiag-b
is a different, pre-existing arm and is untouched — its name
contains neither "recallpolicy" nor the gate env.)
What REMAINS, deliberately, as the audit trail: this file, the
prereg (sim-recallpolicy-b-prereg.md), the pilot corpus
(sim-recallpolicy-b-corpus-off/ + ...-corpus-on/), and the pilot
analysis JSON (sim-recallpolicy-b-pilot-analysis.json). "Evidence-
only landing" means the landing commit contains no code — it does
not mean the run's evidence is deleted; deleting the corpus would
destroy the audit trail for a kill verdict. If the coordinator
rules the corpus should also go, that is a one-command follow-up.
No game change lands. No default flips. No driver adopts anything.
The coordinator merges; nothing is pushed, bumped, or verified
live by this worker.

## Convergence state

NO-GO at pilot (G1 guard fail + 0/8 strict rescues). food-economy
stays converging; the wall is unmoved (wins 0/8, wave-5 0/8 both
legs on this band). Named nexts: (1) NOT a recall re-run on this
trigger — the mechanism is measured and killed; (2) the metric-
review items above belong to any future recall design, which
remains steve-call-sized (it needs a voice and an earlier signal
or a faster walk, and a lives-saved primary); (3) the
scope-excluded away records (objective departures firing the
trigger without an expedition) are a standing measurement gap
for any future away-policy work.
