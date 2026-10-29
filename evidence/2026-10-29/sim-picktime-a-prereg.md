# sim-picktime-a — PICK-TIME JOIN: PREREGISTRATION (binding, committed BEFORE any judged sweep)

Run: flesh-out loop, run fleshout-20261029T1530Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-picktime-a.
Assignment: PICK-TIME DIAGNOSIS — measurement ONLY, zero src/js
changes, zero default flips, zero policy defaults changed, zero
lever. This arm neither re-judges nor rebuilds the build lane's
hunthold pilot (its P1/G1/G2 NO-GO stands), does not touch Loop B
food-economy work, the build lanes, or Steve-call #1409.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4 bands).
CANON GAP, stated not invented (same gap departlag-a recorded):
no CANON-registered doc covers the daily pick lottery,
departure gates, travel-to-known-monsters, or field-fight
returns. The mechanism below is derived from code and
predecessor evidence, stated exactly so it can be checked:
objPick chooses the errand (state 'ready'); objMaybeDepart
later departs it through danger/heal gates (objDepart);
departure never re-checks memory age. Nothing here invents
canon for those mechanisms.

## What is missing (determined BEFORE building anything)

The task order was: determine precisely what is missing for a
pick→departure join before building anything; do not rebuild
what already exists. Finding, from predecessor corpora and
code read on 2026-10-29 before this prereg:

- scripts/policies/funnel-diag.js ALREADY records pick events
  with day, part-counter, AND dayPart stamps, plus pre-pick
  memories, chosen objective, recomputed candidate, and gate
  flags. It is reused VERBATIM. No new pick recorder is built.
- scripts/policies/returns-diag.js ALREADY records departures
  and drops with day, part-counter, AND dayPart stamps. Reused
  VERBATIM. No new departure recorder is built.
- scripts/policies/departhold-diag.js ALREADY records doorway
  evaluations (departed / overwritten / held-ready) with the
  same three stamps. Reused VERBATIM. No new verdict recorder
  is built.
- What does NOT exist is (a) a corpus on the PLAIN funnel
  substrate (no HUNTHOLD lever policy anywhere in the tree
  for the sweep) carrying ALL FOUR channels at once on the
  funnel band, and (b) a joint analyzer over such a corpus.
  Predecessor corpora each lack one piece: funnel-a and
  departlag-a carry fieldparty+returns+funnel but NO
  departhold; hunthold-off/on carry all channels but under
  a lever policy (HUNTHOLD loaded, on vs off); pickband-a
  carries all channels but on fresh seeds 75117-75124 with
  primary n=0. No predecessor corpus lets one analyzer join
  pick time + verdict terminal + departure time on the
  funnel band's own wave-4 picks.
- The join RULE also has a known defect to correct, not to
  copy: holdsjoin-a flagged (post-hoc, not re-scored) that
  the departhold linked-departure rule matches on huntMid
  alone and over-linked a GUARD departure to a HUNT pick
  (hunthold-on seed 75107, visjoin_171). This analyzer's
  linked-departure rule therefore REQUIRES objective kind
  HUNT and matching huntDay, exactly as the departlag lag
  class already does. A fixture with a GUARD departure
  carrying the same huntMid/huntDay proves the rule
  rejects it; the corpus count of such over-link
  candidates is reported, not assumed.
- The lag SCALE gap: departlag-a reports lag in days and
  part-counter parts only. All three recorders also stamp
  dayPart (Game.dayPart at event time), so this analyzer
  additionally reports pick (day, dayPart) and departure
  (day, dayPart) verbatim and the dayPart pair — it does
  NOT convert dayParts into days, because the observed
  dayPart range (0-4, returns-a metric review) is not a
  documented parts-per-day constant. Lag is judged in
  days + counter-parts (the departlag scale, comparable);
  dayPart stamps are reported alongside, never converted.

So this arm builds: a thin sweep wrapper (seed band + corpus
dir only, adapted from scripts/test-pickband-a-sweep.js),
a joint analyzer (departlag classifyPick imported verbatim,
NOT copied; verdict join + dayPart stamps + departure-only
comparison added), fixtures, a sense script, and a
neutrality script (adapted from test-pickband-a-
neutrality.js). Zero recorder files are added or edited.
Zero src/js. Zero policy files added or changed.

## Fresh band (this arm's own corpus, base code)

- Seeds 75101-75108 (8, the funnel band's first half, so
  picks and departures join to the same trajectories as
  funnel-a/departlag-a on those seeds).
  scripts/policies/tableseat-nowait.js VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  RETURNS=1, FUNNEL=1, DEPARTHOLD=1. 180d death-aware
  (runDays stops on death/win, as in the predecessor
  sweeps), competent policy (tableseat-nowait).
- SUBSTRATE (named, never switched mid-run):
  tableseat-nowait. No other policy, no policy edit, no
  game-code edit, no lever of any kind. Nothing is
  committed mid-sweep (the lottery contamination lesson).
- CORPUS LAYOUT (new arm dir — predecessor corpora are
  never overwritten): evidence/2026-10-29/
  perseed-picktime-a/s<seed>-fresh.json, produced by
  scripts/test-picktime-a-sweep.js (thin wrapper pinning
  SEEDS + EVID only). Each row carries fieldparty +
  returns + funnel + departhold channels verbatim, plus
  a deaths list. Never write sweep outputs to /tmp
  (sibling-cleanup wipe class); determinism scratch dirs
  live inside this worktree and are removed after
  byte-comparison.

## Universe and join rule (fixed before any judged run)

PRIMARY UNIVERSE: every pick record in the picktime corpus
whose chosen.kind == 'HUNT' and whose chosen.huntMid maps
to a wave-4 monster in src/data/monsters.json (wave field).
The funnel recorder captures every such pick: it records
any pick where the villager held a wave-4 memory OR chose
a wave-4 HUNT, so no wave-4 HUNT pick can hide from it.
EXPECTATION FROM THE PREDECESSOR CORPUS (read before this
prereg, not a claim about this corpus): the funnel-a
corpus holds, on seeds 75101-75108, exactly 2 such picks,
both seed 75106, both eulogy huntDay 132, both d135 part
536 (visjoin_113, visjoin_115). If this corpus holds a
different count, that is a neutrality failure to
investigate first, not a redefinition — the analyzer
must reproduce the predecessor count before any lag
number is judged.
SECONDARY UNIVERSE (reported, NOT judged): all HUNT picks
in the funnel picks list (i.e. HUNT picks by wave-4 memory
holders, any wave). Predecessor expectation on
75101-75108: n=8, all on seed 75106 (the eight HUNT picks
in the funnel-a 75106 row; the departlag secondary
n=9 adds one 75115 pick outside this band).

JOIN RULE (fixed): for each primary/secondary pick P
(seed, vid, mid = chosen.huntMid, huntDay = chosen.huntDay,
pick day/part/dayPart), in part order after P:

- DEPARTLAG CLASS: classifyPick imported verbatim from
  scripts/test-departlag-a.js (earliest of matching
  departure, next recorded pick, villager death; a
  departure on the death day itself is UNKNOWN). The
  matching departure there already requires kind HUNT
  + huntMid + huntDay + part >= pick part.
- VERDICT TERMINAL: departhold evaluations in the same
  seed row with vid == P.vid, part in [P.part,
  first-later-pick part) (or to row end if no later
  pick), and (pre or post) huntMid == P.mid and huntDay
  == P.huntDay. Terminal = OVERWRITTEN-BY-VERDICT if
  any evaluation in window has action 'overwritten'
  (first such evaluation's verdict/score/day/dayPart/
  part reported); else DEPARTED-PICK-LINKED if the
  departlag class is DEPARTED; else the departlag class
  carried through (SUPERSEDED / DIED-HOLDING /
  HELD-TO-HORIZON / UNKNOWN), with neverChecked flagged
  when the window holds zero evaluations. A pick-only
  SUPERSEDED reading with a verdict overwrite in its
  window is a RECLASSIFICATION (misread), counted
  separately — the holdsjoin caveat, now measured on
  the plain substrate.
- CORRECTED LINK CHECK (diagnostic, not a class):
  count picks where a huntMid-only rule (no kind, no
  huntDay check) would link a NON-HUNT departure
  (kind != HUNT) at part >= P.part before the first
  later pick, while the corrected rule links none or a
  different departure. Expectation on this corpus: the
  hunthold-on GUARD case lives on a diverged trajectory
  (plain-substrate seed 75107 holds ZERO funnel picks
  in funnel-a), so the expected corpus count is 0 —
  reported as a count with its n, and the rule itself
  is proven by fixture, not by the corpus count.
- DAYPART STAMPS: every classified pick reports
  pickDayPart (funnel pick dayPart) and, when departed,
  depDayPart (returns departure dayPart) verbatim. No
  dayPart-to-day conversion is computed or judged.
- DEPARTURE-ONLY COMPARISON (the "how it differs"
  question, fixed here): for each DEPARTED primary
  pick, report BOTH readings side by side — (i) the
  departure-only reading a returns-departures census
  could give: departure day, departure dayPart, memory
  age at departure (dep.day - huntDay), and NOTHING
  about the pick (no pick day, no pick age, no lag);
  (ii) the pick-joined reading: pick day, pick dayPart,
  pick age (pick.day - huntDay), lag days, lag
  counter-parts, departure age. The difference is
  stated as: departure-only age minus pick age (= lag
  days), and the count of primary picks INVISIBLE to
  departure-only (non-departed picks: no departure
  record exists for them at all). No causal claim is
  made from either reading.

## Primary metric and GO thresholds (judged, never re-scored)

PRIMARY METRIC: pick→departure join completeness + lag
distribution on the primary universe, with pick time AND
departure time per pick.

- LEG 1 — CORPUS VALIDITY: 8/8 rows present, days > 0,
  all four recorder channels present with errs 0,
  overflow 0, installed true.
- LEG 2 — JOIN COMPLETENESS: 100% of primary picks
  receive a joined class (departlag class + verdict
  terminal), UNKNOWN <= 1. Secondary universe
  completeness reported, not judged.
- LEG 3 — DETERMINISM: seed 75106 re-run into a scratch
  dir inside this worktree; row JSON byte-identical to
  the corpus row (cmp clean; scratch removed after).
- LEG 4 — RECORDER-NEUTRALITY, two parts: (a) seed
  75106 recorders-OFF run vs corpus row on the 19
  comparable fields (pickband pattern: days, endReason,
  won, waveReach, maxArc, finalRank, maxRank,
  nationalEver, nationalFinal, table, entered,
  deathTotal, starvationDeaths, deaths summary,
  finalPop, finalPantry, finalKnown, tableState);
  19/19 exact, 0 diffs. (b) channel equality vs
  funnel-a rows on seeds 75101-75108 for fieldparty
  meetings, returns meetings/departures/drops, funnel
  picks/notes, plus wall fields (won, waveReach,
  nationalEver, nationalFinal, table, entered, days,
  deathTotal, starvationDeaths); 0 diffs. (Departhold
  is the extra channel; it has no funnel-a counterpart
  and is excluded from (b) by construction.)
- LEG 5 — SENSE: one verbatim pick→departure chain
  (tier 1: a DEPARTED primary pick if one exists, else
  tier 2: a SUPERSEDED primary pick) quoted with pick
  stamps, verdict window, departure stamps, and drop,
  and judged in plain words for meaning. Tier used is
  named in the evidence; a tier-2 sense bar on an
  empty primary is NOT a tier-1 pass.
- DIAG-GO requires ALL FIVE legs. Any leg failing is
  DIAG-NO-GO (or INSUFFICIENT-DATA if the primary
  universe is empty for a reason other than a
  neutrality failure — stated with its n, never
  generalized). No metric is changed mid-run; doubts
  go under "metric review" in the evidence file, for
  the NEXT run.
- SMALL-n DISCIPLINE: with expected primary n=2, no
  distribution is smoothed and no share is quoted
  without its n. Lag "distribution" at n=1 departed is
  the single value, stated as such. Secondary n=8
  carries the shape, labeled secondary everywhere.

## Horizon + why

180d death-aware: the funnel band's own horizon (funnel-a,
departlag-a, returns-a all 180d death-aware), so picks
and departures join to identical trajectories and the
wall numbers stay comparable. A fixed 200d horizon is
forbidden by the loop body (death-aware horizons); the
median will be horizon-capped on surviving seeds and is
reported as such, never as a survival gain.

## Seeds and policies (fixed)

Seeds 75101-75108 (8, pilot scale = confirm scale here:
the band is small by design and the predecessor count is
exact, so no separate confirm band is spent; if the
primary count reproduces at n=2, that IS the judged
corpus). Policy: tableseat-nowait verbatim. Recorders:
fieldparty-form-diag + returns-diag + funnel-diag +
departhold-diag, all verbatim, all ON for the judged
sweep; all OFF for the neutrality run only.
