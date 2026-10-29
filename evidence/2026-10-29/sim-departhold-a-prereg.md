# sim-departhold-a — PREREGISTRATION (binding, committed BEFORE any judged leg)

Run: flesh-out loop, run fleshout-20261029T0915Z.
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: sim-departhold-a.
Assignment: DEPARTURE-HOLD RECORDER (diag, FIRST next step from
sim-pickdepart-a). DIAGNOSIS ONLY — zero game-behavior changes,
zero default flips, zero policy changes, zero lever. The
HUNT-holds-through-danger lever itself is a LATER run and is
NOT built here. This arm builds a recorder instrument and
judges whether it resolves the pickdepart inference.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law) and the
prior evidence in this worktree: evidence/2026-10-29/
sim-pickdepart-a.md (+ sim-pickdepart-a-prereg.md) and
sim-lottery-a.md (+ sim-lottery-a-prereg.md). CANON GAP
(restated from pickdepart, not invented): no CANON-registered
doc covers departure gates, the daily pick lottery,
travel-to-known-monsters, or field-fight returns. docs/MAP.md
covers the map/travel surface generally, not these gates.
The mechanism below is derived from code, verified by reading
src/js/villager-objectives.js (objMaybeDepart, objDanger,
objTightenOrDefer, objHealGate, objDepart, objTick) before
this prereg was written. Nothing here is invented canon.

## Mechanism as verified from code (pre-analysis)

- A wave-4 HUNT pick is an objPick outcome: chosen.kind ==
  HUNT, state 'ready'. Picking is not departing: objMaybeDepart
  later departs the 'ready' objective through objDanger
  (verdicts go / ask / tighten / defer; score <= 1 / <= 3 /
  <= 5 / > 5) and objHealGate, or replaces it.
- For HUNT, every non-'go' verdict ends in overwrite:
  'ask' cannot ask (HUNT never drags a companion — code
  comment: "a hunt also takes the no-companion fallthrough");
  'tighten' cannot tighten (objTightenOrDefer tightens ONLY
  FORAGE/WATER/TRAPS); 'defer' overwrites inline in
  objMaybeDepart. All three land in HAVEN_CHORE indoor
  (state 'indoor', partsLeft 2-3) with NO pick record, NO
  departure record, NO narration line.
- The pickdepart inference (UNPROVEN, this arm's question):
  nikos seed 75104, d173 part 690 HUNT pick, vanishing
  between part 690 and the d174 part 692 SEEK pick, inferred
  as a danger non-'go' overwrite. No recorder in the lottery
  corpora captures the danger verdict, so the inference rests
  on elimination, not on a verdict record.
- objDanger has a second caller: the gossip-retarget row in
  src/js/npc-triggers.js, which re-runs danger for 'out'
  objectives only. A danger record outside an objMaybeDepart
  call is therefore NEVER a departure verdict for a 'ready'
  HUNT; the recorder attributes danger verdicts to a
  departure evaluation only when its objMaybeDepart marker
  is active for the same villager.
- objTick agency branch (documented unknown-source): an
  expedition-owned villager's objective is rewritten to
  EXPLORE/'out' in objTick regardless of prior state. A
  'ready' HUNT stolen this way leaves NO objMaybeDepart
  record. If a pick lands 'unknown' below, agency steal is
  the first suspect investigated — it is not silently
  classified as a danger overwrite.

## The instrument (policy-side only, default OFF)

scripts/policies/departhold-diag.js — DIAG ONLY, zero src/js
changes, following the funnel-diag / returns-diag precedent
exactly (policy-side wraps, observational only):

- On-switch: DEPARTHOLD=1 is the ONLY on-switch. Unset, the
  sweep never installs it: no wraps, no ctx surface, no
  record, and the engine runs byte-identically (proven by
  the perturbation leg below, not asserted).
- Wraps (all record AFTER delegating, or around it with the
  original return value passed through untouched):
  objMaybeDepart (the evaluation: pre/post objective by
  DIRECT state read of state.village.objectives[vid] —
  NEVER objOf(), which CREATES entries, and never npcNode(),
  which CREATES entries); objDanger (score + verdict,
  attributed to the active evaluation only); objHealGate
  (fresh vs cached verdict, satOut flag); objTightenOrDefer
  (pre/post kind/state/indoor/tightened — tighten-overwrite
  vs inline-defer-overwrite subtype); objDepart (return
  value true / false / undefined, post state).
- No wrap draws RNG, writes game state, or throws into the
  engine (recording errors are counted; an engine throw is
  rethrown unchanged). No danger verdict is ever recomputed
  by the recorder: the recorded verdict IS the engine's own
  verdict, captured by wrapping objDanger. The only Game
  writes are the off-state install flags
  (_departholdDiagStore / _departholdDiagInstalled), the
  same class as the funnel precedent.
- Recorded universe: objMaybeDepart evaluations where the
  pre-objective is a 'ready' HUNT (any atHaven value), PLUS
  evaluations where the post-objective is a HUNT picked
  fresh inside the call (the maybeDepart re-pick branch:
  idle/done -> objPick -> depart-or-overwrite in the same
  call). A HUNT picked this way IS a funnel pick, so it
  must have a departure evaluation record too. Evaluations
  for non-HUNT objectives are not stored (pending sub-call
  records are discarded, not persisted).
- Per evaluation, the derived action (computed by the
  recorder from pre/post state + sub-call records, never
  by re-running engine logic): 'departed' (post state
  'out'); 'overwritten' (post kind HAVEN_CHORE + indoor;
  subtype 'tighten-overwrite' when an objTightenOrDefer
  record exists in the call, else 'defer-overwrite');
  'held-ready' (post still 'ready'; sub-reason
  'heal-sat-out' when a heal record sat the villager out,
  'no-attempt-early-return' when no danger record exists
  in the call, else 'other-held'); 'repicked' (post kind
  changed to a fresh non-chore objective — unexpected for
  a 'ready' HUNT, flagged, never hidden); 'skipped-
  not-at-haven' (atHaven false); 'other' (anything else,
  flagged).
- Part scale: the recorder's own advancePart counter, the
  same scale as the funnel/returns recorders (all increment
  once per advancePart call, so counters agree at every
  event). Joins to funnel picks and returns departures use
  this part scale on both sides.

## Fresh band (this arm's own corpora, off vs on)

- Seeds 75101-75108 (8, pilot) — the lottery/funnel band
  verbatim. scripts/policies/tableseat-nowait.js VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  RETURNS=1, FUNNEL=1, 180d death-aware, competent policy
  tableseat-nowait. Sweep script (new):
  scripts/test-departhold-a-sweep.js (adapted from
  test-funnel-a-sweep.js, same resume + flap-patient write
  + read-back verification discipline).
- TWO corpora on identical current-master code:
  evidence/2026-10-29/perseed-departhold-off/ (DEPARTHOLD
  unset — the before-leg) and evidence/2026-10-29/
  perseed-departhold-on/ (DEPARTHOLD=1 — the after-leg).
  The judged baseline is the fresh OFF sweep, NOT the
  lottery corpora: master has moved since the lottery
  prereg (journey endgame r65 etc.), so the lottery
  corpora are reported as a drift comparison only, never
  as the judged baseline, and a mismatch against them is
  regime drift, not a failure.
- WHY 8 SEEDS: staged method (MEASUREMENT.md §§9-12) —
  pilot before any confirm spend. Confirm (seeds
  75101-75116, 16) ONLY if the pilot passes its bar below
  AND time remains; a pilot verdict, GO or NO-GO, is a
  complete result for this diag arm either way.
- SUBSTRATE (named, never switched mid-run):
  tableseat-nowait. No other policy, no policy edit.
  No code change is committed mid-sweep (lottery
  contamination lesson): the recorder policy file is
  committed BEFORE either sweep runs, and nothing else
  is committed until both sweeps + analysis are done.

## Primary universe and taxonomy (binding)

PRIMARY UNIVERSE: every pick record in the ON corpus whose
chosen.kind == 'HUNT' and whose chosen.huntMid maps to a
wave-4 monster in src/data/monsters.json. Each such pick
gets EXACTLY ONE class, by the first rule that fires in
this priority order (same seed row, same vid, ordered by
part):

1. departed-pick-linked — a returns departure exists with
   same vid, same huntMid, dep.part >= pick.part, and no
   intervening funnel pick by that vid with part strictly
   between pick.part and dep.part. (Pickdepart rule,
   verbatim.)
2. died-before-departure — the row's deathsList records
   that villager's death, and no later pick by that vid
   and no linked departure exists before it (day-granular
   caveat as in pickdepart).
3. overwritten-danger — a departhold evaluation exists for
   this objective (same vid, part >= pick.part, before any
   linked departure and before the first later funnel
   pick, or with no later pick) whose action is
   'overwritten', carrying its danger verdict (ask /
   tighten / defer) and its subtype (tighten-overwrite /
   defer-overwrite). The danger verdict is NAMED per pick;
   a pick is never classified here on an unrecorded
   verdict.
4. superseded-by-needs-pick — the first later funnel pick
   by that vid (any part > pick.part, before any linked
   departure, with no overwrite evaluation before it)
   has chosen.kind in {EAT, WATER}.
5. candidate-null-after-pick — the first later funnel pick
   by that vid (before any linked departure, not a needs
   pick, no overwrite evaluation before it) shows candidate
   null for this memory (candidate == null, or
   candidate.mid != this mid), while the memory is still
   listed in that pick's preSightings (or was listed on
   the HUNT pick itself). The closed gate is named from
   the later pick's gates record + memory age (age =
   pick day - memory day; offer window age 0-3).
6. superseded-by-re-pick — the first later funnel pick by
   that vid (before any linked departure, not a needs
   pick, no overwrite evaluation before it) still shows
   candidate.mid == this mid and chose anything else
   (including a same-mid HUNT re-pick).
7. held-ready-at-end — no later pick, no linked departure,
   no overwrite evaluation, villager alive at corpus end,
   AND at least one departhold evaluation for this
   objective shows action 'held-ready' (or
   'skipped-not-at-haven'): the pick survived to the end
   of the corpus still waiting, with its holds recorded.
8. gate-blocked — no later pick, no linked departure, no
   overwrite evaluation, villager alive at corpus end, no
   held-ready evaluation, AND the HUNT pick's own gates
   record shows a blocking flag (postFleeResting true,
   sheltered true, armed false, or maxD < distance to the
   hunt tile). The analyzer names the flag.
9. horizon — no later pick, no linked departure, no
   overwrite evaluation, no held-ready evaluation,
   villager alive at corpus end, gates green at pick time:
   the run ended while the pick was still unresolved for
   a reason the records do not name. Horizon is a
   censoring class, not a mechanism claim.
10. unknown — anything not covered above. At most 0 picks
    may land here (see DIAG-GO leg 1: unknown must be 0).

SECONDARY CENSUS (reported, not judged): the same taxonomy
applied to ALL HUNT picks (all waves) in the ON corpus;
the per-pick verdict chain (pick -> every evaluation ->
terminal fate) for every primary-universe pick, quoted in
the evidence; the lottery-corpus drift comparison (primary
universe + departed counts in perseed-lottery-base vs the
fresh OFF corpus, reported, not scored).

## Pre-registered DIAG-GO threshold (binding — a miss is DIAG-NO-GO)

PRIMARY METRIC: recorder classification completeness over
the primary universe (ON corpus) + resolution of the
pickdepart danger-overwrite inference. DIAG-GO iff ALL of:
  (1) COMPLETENESS: 100% of wave-4 HUNT picks in the
      primary universe are classified into a named
      mechanism (classes 1-9), with ZERO picks left
      'unknown'.
  (2) NO UNRECORDED OVERWRITES: every departhold
      evaluation for a wave-4 HUNT objective carries its
      danger verdict or a named no-attempt reason — i.e.
      no evaluation has action 'other' or 'other-held',
      and every 'overwritten' evaluation carries a danger
      verdict (ask / tighten / defer) + subtype. The
      instrument itself must leave no silent overwrite
      unrecorded. (Standalone sub-call records outside an
      evaluation — gossip danger re-runs on 'out'
      objectives — are counted and reported separately;
      they are not departure verdicts and never feed a
      classification.)
  (3) OVERWRITE QUESTION ANSWERED: EITHER (a) at least
      one recorded HUNT danger-overwrite with its full
      verdict chain (pick -> danger verdict + score ->
      tighten/defer subtype -> indoor chore -> next
      pick), OR (b) zero overwrites AND every primary
      pick's fate explained by recorded events (legs 1
      + 2 holding) — i.e. the instrument leaves no gap
      through which an overwrite could have hidden. What
      counts as "refuted" is defined HERE, before seeing
      the band: zero overwrites under complete evaluation
      coverage. If the primary universe is empty, the
      verdict is INSUFFICIENT-DATA, not GO — an empty
      universe proves nothing about the mechanism.
      (If the current-master band does not reproduce the
      nikos d173 chain, the evidence says so plainly:
      the old trajectory is not re-tested, and the
      verdict rests on the fresh band's own chains.)
  (4) PERTURBATION: the OFF corpus and the ON corpus are
      identical on the judged channels per seed — funnel
      picks, returns meetings / departures / drops, and
      wall numbers (wins, national ever/final, table,
      entered, wave-4/5 reach, median days, starvation
      deaths, death total) deep-equal. Any diff fails the
      instrument outright: a recorder that moves the game
      cannot measure it.
DIAG-GO requires ALL legs. A miss on any leg is
DIAG-NO-GO. Departures and meetings are judged as
OUTCOMES (counts reported alongside), NEVER as take-rate
over trajectory-dependent triples as primary (lottery
metric review).

## Guards (reported, NOT re-scored into DIAG-GO)

- STARVATION: starvation deaths per corpus (OFF vs ON must
  be equal by leg 4; vs lottery base reported only).
- MEDIAN SURVIVAL: median days per corpus (OFF vs ON
  equal by leg 4; vs lottery base reported only).
- WAVE-4 REACH: wave-4 reach per corpus (OFF vs ON equal
  by leg 4; vs lottery base reported only).
- SENSE BAR: >= 1 full verdict chain quoted VERBATIM
  from the ON corpus (pick -> evaluations with verdicts
  -> terminal fate), with a judgment of whether the
  villager reads like a person making a choice or an
  errand queue overwriting a decision (SENSE-TESTING
  LAW). The chain must show the verdict, not just the
  class.
- RECORDER HYGIENE: diag errs == 0 and overflow empty in
  every ON row; the OFF rows carry no departhold section
  at all (install never ran).

## Instruments (new, scripts/ + scripts/policies/ only)

- scripts/policies/departhold-diag.js: the recorder
  (above). Zero src/js changes.
- scripts/test-departhold-a-sweep.js: the two-corpus
  sweep (OFF then ON, identical seeds, resume + flap-
  patient writes + read-back verification, as in the
  funnel sweep).
- scripts/test-departhold-a.js: analyzer (pure reads
  over both corpora + src/data/monsters.json wave
  lookup). Outputs: primary-universe pick list with
  class + verdict chain per pick; per-corpus class
  counts; secondary all-wave census; perturbation
  comparison (OFF vs ON, deep-equal legs); lottery drift
  comparison (reported, not scored); --sense prints one
  full verdict chain verbatim. Machine legs: unknown
  count asserted 0 for GO, other/other-held count
  asserted 0, perturbation diffs asserted empty,
  determinism (two runs, same output), wave-lookup
  coverage (every huntMid resolved or listed
  unknown-wave).
- scripts/test-departhold-a-fixtures.js: synthetic
  taxonomy/action fixtures (every class + every derived
  action reachable, priority order holds) + the env-gate
  proof (DEPARTHOLD unset -> withDepartholdDiag.daily
  installs nothing, Game methods identical; set -> wraps
  installed, store flagged). Exit 1 on any failure.

## Metric review (for the NEXT run — never a mid-run re-score)

Doubts go here in the evidence file, for the next run's
prereg. In particular: (a) whether 'overwritten-danger'
should stay split from supersession classes by evaluation
part (overwrite before first later pick) or merge into a
supersession family with an overwrite flag; (b) whether
the agency-steal path (objTick) needs its own recorder
before the HUNT-hold lever is judged, if any pick lands
unknown; (c) whether leg 3(b) ("refuted by zero
overwrites under complete coverage") is too weak a
refutation when the fresh band's trajectories diverge
from the nikos chain — the next prereg should decide
whether a targeted re-creation of the nikos conditions
(a seeded fixture driving objMaybeDepart on a ready
wave-4 HUNT under a non-'go' verdict) is owed as a
direct proof of the overwrite path, independent of band
luck.
