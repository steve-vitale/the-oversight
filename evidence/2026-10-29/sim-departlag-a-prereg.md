# sim-departlag-a — PICK-TO-DEPARTURE LAG CENSUS: PREREGISTRATION (binding, committed BEFORE any judged run)

Run: flesh-out loop, run fleshout-20261029T1215Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-departlag-a.
Assignment: PICK-TO-DEPARTURE LAG CENSUS — measurement ONLY, zero
game change. This is funnel-a ranked blank 3, lag half only: how
long does a picked wave-4 HUNT wait before it departs, gets
superseded, or dies holding — and how stale is the memory by the
time it departs?

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4 bands)
and docs/PARTY.md (context only — this arm touches no party
behavior). CANON GAP, stated not invented: no CANON-registered
doc covers the daily pick lottery, departure gates,
travel-to-known-monsters, or field-fight returns. The mechanism
below is derived from code and predecessor evidence, stated
exactly so it can be checked:

- PICK vs DEPARTURE (funnel-a / pickdepart-a / departhold-a):
  objPick chooses the errand (state 'ready'); objMaybeDepart
  later departs it through danger/heal gates (objDepart).
  Departure never re-checks memory age — a pick made age 3
  departed age 5 on record (funnel-a: visjoin_115, picked
  d135 huntDay 132, departed d137). Departure gates are
  inventoried in pickdepart-a (objMaybeDepart ->
  objDanger -> objTightenOrDefer -> objHealGate ->
  objDepart); departure-gate verdicts are NOT recorded by
  the returns/funnel recorders, so this census classifies
  outcomes (departed / superseded / died / held), never
  verdicts. Do NOT claim a danger verdict for any pick
  here — departhold-a owns the verdict recorder.
- SCOPE BOUNDARIES (from the assignment, binding): do NOT
  build the HUNT-holds lever (build-pickdepart owns it).
  Do NOT build any arrival mechanism — no trail-follow,
  no tracks, no following (build-returns owns arrival).
  This arm is the lag measurement; the arrival question
  itself stays with build-returns. Do NOT rebuild the
  lottery lever (sim-lottery-a KILLED it today).

## Fresh band (this arm's own corpus, base code)

- Seeds 75101-75116 (16, the funnel-a band verbatim, so
  picks and departures join to the same trajectories).
  scripts/policies/tableseat-nowait.js VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  RETURNS=1, FUNNEL=1 (funnel-diag + returns recorders
  reused VERBATIM, never edited). 180d death-aware
  (runDays stops on death/win, as in the predecessor
  sweeps), competent policy (tableseat-nowait).
- SUBSTRATE (named, never switched mid-run):
  tableseat-nowait. No other policy, no policy edit,
  no game-code edit, no lever of any kind. This arm
  has no lever; nothing is committed mid-sweep (the
  lottery contamination lesson: a lever committed
  mid-sweep mislabeled later base seeds).
- CORPUS LAYOUT (new arm dir — predecessor corpora are
  never overwritten): evidence/2026-10-29/
  perseed-departlag-a/s<seed>-fresh.json, produced by
  running scripts/test-funnel-a-sweep.js VERBATIM with
  EVID pointed at the new dir and SEEDS=75101..75116
  (a thin wrapper, scripts/test-departlag-a-sweep.js,
  pins exactly those two overrides so the sweep cannot
  drift). Each row carries the returns channels verbatim
  (returns.meetings/departures/drops) PLUS funnel.picks
  and funnel.notes PLUS a deaths list, exactly as the
  funnel corpus does. Never write sweep outputs to /tmp
  (a sibling cleanup wipes /tmp mid-run — prior runs
  lost whole sweeps there); determinism scratch dirs
  live inside this worktree and are removed after
  byte-comparison.

## Universe and join rule (fixed before any judged run)

PRIMARY UNIVERSE: every pick record in the departlag
corpus whose chosen.kind == 'HUNT' and whose
chosen.huntMid maps to a wave-4 monster in
src/data/monsters.json (wave field). The funnel
recorder captures every such pick: it records any
pick where the villager held a wave-4 memory OR chose
a wave-4 HUNT, so no wave-4 HUNT pick can hide from
it. EXPECTATION FROM THE PREDECESSOR CORPUS (read
before this prereg, not a claim about this corpus):
the funnel-a corpus holds exactly 2 such picks, both
seed 75106, both eulogy huntDay 132, both d135 part
536 (visjoin_113, visjoin_115). If this corpus holds
a different count, that is a neutrality failure to
investigate first, not a redefinition — the analyzer
must reproduce the predecessor count before any lag
number is judged.

JOIN RULE (fixed): for each primary pick P (seed,
vid, mid = chosen.huntMid, huntDay = chosen.huntDay,
pick day/part), consider, in part order after P:

- DEPARTURE CANDIDATES: returns departures in the
  same seed row with vid == P.vid, objective.kind ==
  'HUNT', objective.huntMid == P.mid, and
  objective.huntDay == P.huntDay, at part >= P.part.
  (huntDay is part of the key: a re-pick on a fresh
  memory for the same beast is a different decision.)
- NEXT PICK: the first funnel pick record in the same
  seed row with vid == P.vid at part > P.part (any
  chosen kind; the funnel recorder's coverage caveat
  from pickdepart-a applies — a "first later pick"
  is the first later RECORDED pick, and a pick
  unrecorded because the wave-4 memory was dropped
  between picks would misread; any pick hitting
  that caveat is reported, and counts toward UNKNOWN
  if its class cannot be fixed).
- DEATH: the first deathsList record in the same seed
  row with who == P.vid at day >= P.day.

CLASSIFICATION, by the earliest of these events
(part order; a death is day-granular, so a death on
the pick's own day is flagged SAME-DAY-AMBIGUOUS and
still classifies, because the pick record proves the
villager lived to the pick part):

- DEPARTED: a departure candidate exists with part <
  next-pick part (or no next pick). Lag = dep.day -
  P.day (days) and dep.part - P.part (parts). Memory
  age at departure = dep.day - P.huntDay. Age at pick
  = P.day - P.huntDay. Report both. A departure in
  the SAME part as the pick (dep.part == P.part)
  counts as departed with lag 0 — objMaybeDepart can
  depart in the pick's own part.
- SUPERSEDED: a next pick exists with part < any
  departure candidate's part (or no departure
  candidate). Lag-to-supersession = next.day - P.day
  (days) and next.part - P.part (parts). Sub-kind by
  the next pick's chosen kind: NEEDS (EAT/WATER),
  RE-PICK (HUNT, same mid), OTHER-HUNT (HUNT,
  different mid), OTHER (any other kind). A later
  death is noted in the sub-string only (supersession
  outranks a later death, per funnel-a's sense-review
  correction).
- DIED-HOLDING: a death exists, and no departure
  candidate and no next pick precedes it (a death
  with day < next-pick day, or no next pick; a
  departure candidate, if any, has part after the
  death's day window — day-granular, so a departure
  on the death day itself is flagged and counts
  toward UNKNOWN unless part order resolves it).
- HELD-TO-HORIZON: no departure candidate, no next
  pick, no death record for the vid in the row
  (alive at horizon end). Hold length = row.days -
  P.day (days, horizon-capped, flagged as such).
- UNKNOWN: anything else (including the caveats
  above). UNKNOWN counts against the GO bar.

DROPS (descriptive, for departed picks only): the
first returns drop in the same seed row with vid ==
P.vid, mid == P.mid, part >= dep.part, dropped ==
true counts as an empty-tile arrival for that
departure; dropped == false calls after it are
lingering re-fires, never separate arrivals. A
departed pick with no true drop is reported as
DEPARTED-NO-DROP (arrived and lingered, or the
row ended before the drop fired) — never merged
into the empty-tile count.

## Census questions (all on the primary universe)

(a) Lag distribution for departed picks: median,
    quartiles, share departing same-day (lag 0 days)
    vs 2+ days. With the expected n, quartiles are
    reported as the sorted values themselves, never
    as a smoothed distribution — small-n honesty.
(b) Supersession rate and lag-to-supersession
    (median + range, split by sub-kind).
(c) Staleness at departure: share of departures
    leaving with memory age > 3 days (the fresh
    window), and the age distribution itself
    (age at pick vs age at departure, per pick).
    Departure never re-checks age, so this quantifies
    how often it leaves stale.
(d) Empty-tile outcome by lag bucket (returns true
    drops among departed, DESCRIPTIVE ONLY — do NOT
    claim lag causes empty tiles; the beast wanders
    independently and the bucket is a cross-tab,
    not a causal claim).
(e) The picked-never-departed population size on
    this band, split by sub-cause (superseded by
    sub-kind, died-holding, held-to-horizon).

SECONDARY CENSUS (reported, NOT judged, NOT a
re-score path): the same join applied to ALL HUNT
picks among funnel-recorded picks (i.e. picks by
wave-4 memory holders only — labeled as a subset
everywhere it appears, exactly as pickdepart-a's
secondary census). Purpose: the primary universe
is expected to be n=2, which cannot support a lag
shape; the secondary census gives the departure
work a lag distribution with a usable n, without
pretending wave-4 picks are plentiful. No GO leg
reads the secondary census.

## Pre-registered DIAG-GO bar (binding — a miss is NO-GO, never re-scored)

GO requires ALL of:
  (1) JOIN COMPLETENESS: every wave-4 HUNT pick
      classified departed / superseded / died /
      held, UNKNOWN <= 1.
  (2) DETERMINISM: seed 75106 re-run into a scratch
      dir inside this worktree produces a row JSON
      byte-identical to the corpus row (scratch dir
      removed after the comparison).
  (3) NEUTRALITY: this sweep reproduces the funnel-a
      corpus wall numbers on identical seeds —
      wins 4/16 all lesser, full 0/16, nationalEver
      13/16, nationalFinal 9/16, table 10/16,
      entered 4/16, wave-4 11/16, wave-5 0/16,
      median 180 capped, deaths 600, starvation 4,
      judgedA 42, judgedB 31, classes ACCIDENTAL 39 /
      MEMORY-ONLY 3 / DELIBERATE 0, chains 13 (all
      STILL-ALIVE), HUNT departures 326 (wave-4 1),
      HUNT true drops 297 (wave-4 1), per-seed
      judgedA identical, recorder errs 0 (all three
      recorders), overflow 0, join errors 0. Any
      divergence is explained, never redefined away;
      an unexplained divergence fails this leg.
SENSE LEG (part of GO, not a guard): quote one
picked-never-departed chain and one departed chain
verbatim from the corpus and judge in plain words
whether each reads as a person waiting, forgetting,
or being interrupted. If the corpus holds no
picked-never-departed pick, the sense leg quotes
the superseded chain that exists (or states the
absence plainly and quotes the departed chain plus
the nearest non-departed HUNT chain from the
secondary census, labeled as secondary) — the leg
is about reading, not about forcing a class to
exist.

## Guards (reported, NOT judged)

- RECORDER-NEUTRALITY REPRODUCTION (must be exact
  before any lag number is judged): returns +
  fieldparty channels of the departlag corpus
  deep-equal the funnel-a corpus per seed
  (meetings, departures, drops, picks, notes).
  Any mismatch: STOP, report, do not judge lag
  against a perturbed corpus.
- DEATH/STARVATION SHARES: reported from the
  departlag corpus for comparison with funnel-a.
- SMALL-N DISCIPLINE: no rate is quoted without
  its n. No lag claim is generalized beyond this
  band without naming the band and the n.

## Metric review (for the NEXT run — never a mid-run re-score)

Doubts go in the evidence file, for the next run's
prereg. In particular: (a) whether the primary
universe should stay wave-4-only when it yields
n=2, or whether a matched-triple design (same
anchor stories across arms) would give the
departure work a stabler lag population; (b)
whether lag should be weighted by parts as well as
days (a same-day supersession in 3 parts and a
next-dawn supersession are different waits, and
this census reports both but judges neither);
(c) whether a departure-gate verdict channel
(departhold-a recorder, adopted) should be joined
to the lag census so held picks split into
danger-held vs heal-held vs never-checked — this
census deliberately does NOT join it, so that
this arm's numbers rest on the funnel/returns
channels alone.
