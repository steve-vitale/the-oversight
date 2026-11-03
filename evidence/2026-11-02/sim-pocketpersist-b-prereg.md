# sim-pocketpersist-b — PREREG (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-pocketpersist-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261103T0330Z, axis food-economy).
Worktree sim-pocketpersist-b, branch sim-pocketpersist-b.
Base commit at prereg writing:
29d3366adfb8f9585d5dd7025e0e3caac995e1e5 (recorded
here; the prereg commit itself is the next commit on
this branch). This worker does NOT push, bump, verify
live, merge, or rebase; the coordinator lands the
branch. Status to coordinator: committed in worktree,
pending coordinator merge.

## Predecessors (read in full, never re-litigated, never re-judged)

- evidence/2026-11-02/sim-homewardac-b.md (especially
  the stranded-scholar sense section and its findings
  list): on seed 69501's SHADOW leg, the scholar
  strands at (7,1) days 5-11 (kcal 989 -> 207 -> 0 for
  five days, day-end sims failing), the village's work
  goes on around the pocket (travel, creek visits,
  stone-piling, water-hauling), and day 12 it walks
  home (kcal 2085). The pocket OPENS after a week;
  the mechanism is UNISOLATED — a clearing during
  days 6-11? a newly revealed route? Something else?
  Pockets are not necessarily permanent, and a pocket
  that ends on its own matters to the reopen question:
  abandonment is not the only way a pocket story ends.
  The open finding is taken VERBATIM in shape; this
  run judges its mechanism, it does not re-judge the
  homewardac verdicts (A SUBSTRATE-FAIL, C NO-GO).
- evidence/2026-11-02/sim-cband-b.md and its prereg:
  constructed-trip pair method, shadow/armed legs on
  identical seeds, §15 vacuity reasoning for
  constructed trips (adopted here, see below).
- evidence/2026-11-02/sim-guarde-creekhop-b.md:
  recorder-leg method (compute the guard's numbers
  directly per hop from live state, never install the
  guard where it would change a trajectory), tile
  snaps, explicit-origin engine checks.
- docs/MEASUREMENT.md sections 9-12, 14-15: staged
  pilot gate, death-aware horizons, pre-registration,
  metric binding (§14: a miss is NO-GO territory,
  never re-scored against a friendlier pattern
  mid-run; doubts go under "metric review" for the
  NEXT run), balanced panels (§15).

## Canon note

docs/CANON.md read first; docs/MAP.md §6 (the way
home: travel through the same travelTo pipeline,
orthogonal steps, blocked step tries the other
homeward axis then sidesteps, stops honestly with
the block named) is the relevant canon for any
walk-home reading. NO canon doc covers the pocket
guard itself — it is a policy-side sim instrument
(a competent variant), not a game system — so there
is no canon to invent from, and none is invented
here. The guard's E(D) model is inherited verbatim
from the predecessors (escapeCheck / checkHop /
offersFrom / lateralCandidates from
scripts/policies/competent-homewardstep-b.js,
unchanged).

## Question (DIAG ONLY — no game change, no default change, no deploy)

On the fresh 69501 shadow leg, WHAT ends the
(7,1) pocket story between day-5 end and day-12
end: does the pocket itself open (ground clears,
a route is revealed, stock regrows into a lateral
escape, the scholar gains a crossing ability), does
the scholar walk home through a route the E model
understates, or does the person change (the
stranded scholar dies overnight and a successor
starts at haven, so no pocket ever opened)?

## Substrate (confirmed from the homewardac evidence/prereg, not guessed)

Construct-shadow leg only (guard in shadow mode on
construction day 5, never vetoing; pure
competent.daily on all other days — exactly the
homewardac shadow leg). Seed 69501, shape A
construction (loopDay 5 walk-out 5,4 -> 6,4 -> 7,4
-> 7,3 -> 7,2 -> 7,1 through the engine's own
travelTo, via scripts/policies/
competent-homewardconstruct-b.js, unchanged).
Env, driver-enforced FATAL otherwise:
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=0, packcomp *=1 flags NOT 1 (the
homeconstruct list: COMPETENT_STANDING_HOME,
COMPETENT_ROUTE_AROUND,
COMPETENT_TRIPHOME_ROUTE_AROUND, WOODCARRY,
WOODWARM, MORNINGCARRY, WINDOWCARRY, STRANDFIX,
PRESSB, FEDEVENING). Horizon 30d (the homeconstruct
driver's fixed horizon, kept so the leg is the
homewardac leg); the JUDGED window is loopDays
5-12 only, and wall numbers are reported with that
window limit stated — construction legs, not
natural play, no wall movement claimed.

## Instruments (new files only, all named *-pocketpersist-b.*)

- scripts/pocketpersist-b-driver.js — probe leg:
  loopDays 1-4 competent.daily; loopDay 5
  constructShadow.daily (the homewardac walk-out,
  verbatim policy import); loopDays 6-30
  competent.daily. Probes are READ-ONLY (escapeCheck,
  simulateReturnJump, checkHop, travelBlockage,
  tileAt, travelTargets, inventory/ability reads —
  no travelTo, no say, no state writes, no RNG use
  beyond what the game itself does during daily
  play); probe reads must not change the trajectory
  (proved by Gate G2 below). Per loopDay 5-12, a
  START probe (before daily) and an END probe
  (after daily) — the start/end pair separates
  overnight change (end-of-day-N to start-of-day-
  N+1) from intraday change (start to end of one
  day). Days 1-4 and 13-30 carry no probes (the
  probe leg must still match the homeconstruct leg
  on days 1-12 start/end pos+kcal — Gate G2).
- scripts/analyze-pocketpersist-b.js — reporter,
  never a judge: reads a probe jsonl, prints the
  day-by-day trace table (days 5-12), the control-
  gate check, the probe-identity check, and the
  per-candidate signature table. The caller applies
  this prereg's mapping.
- scripts/test-pocketpersist-b.js — proof (synthetic
  + fixture legs ONLY, NO judged legs; the one live
  instrument-validation leg pair uses throwaway
  seed 69599, the homewardac smoke seed, never
  judged, never screened — it validates that probe
  reads do not move a trajectory, it is not
  evidence about the pocket).
- Reused VERBATIM, read-only, never edited:
  scripts/homeconstruct-b-driver.js,
  scripts/policies/competent-homewardconstruct-b.js,
  scripts/policies/competent-homewardstep-b.js,
  scripts/policies/competent.js,
  scripts/creekhop-b-recorder.js (method only),
  scripts/analyze-homeconstruct-b.js,
  scripts/analyze-homeward-shapes-b.js. Zero src/js
  changes, zero edits to any existing script or
  policy file, zero policy-default flips.

## Candidate mechanisms and their observable signatures

Each candidate is judged ONLY on the probe trace
fields in the next section, recorded for loopDays
5-12 (start + end probes). A candidate's signature
must hold IN FULL; a partial match is not a naming.

- M1 GROUND-CLEARING on the home route: a blocker
  present on the day-5-end probe (checkHop blockers
  or engine travelBlockage on a hop of the E direct
  path, or on an orthogonal neighbour step from
  (7,1) toward haven) is ABSENT on the day-12
  probe at which E first passes, AND the tile snap
  for that tile changes in the same interval (type /
  needsBridge / bridged / blockFrom change), while
  scholar identity is unchanged and day-12 start
  pos is still (7,1) (the same person walks out of
  opened ground).
- M2 NEWLY-REVEALED ROUTE / map-knowledge change:
  revealedCount rises during days 6-11 or between
  day-11 end and day-12 start, AND at least one
  tile on the first passing E path flips revealed
  false -> true in that interval, while tile
  blockers on the old failing path are unchanged,
  identity unchanged, day-12 start pos (7,1).
- M3 STOCK REGROWTH / lateral escape: E fails
  direct at every probe through day-11 end, then E
  passes VIA LATERAL (legs > 0) at a day-12 probe,
  AND a lateral-candidate tile's stock rises 0 ->
  >0 in that interval (endDay regrowLand or
  intraday regrowth — the start/end pair says
  which), while blockers and revealed set on the
  direct path are unchanged, identity unchanged,
  day-12 start pos (7,1).
- M4 SCHOLAR-STATE THRESHOLD / crossing ability:
  identity unchanged, day-12 start pos (7,1), and
  a scholar field crosses before the first passing
  E or the day-12 walk: swimmer false -> true, or
  inventory gains a bridge/crossing item, or kcal
  rises from 0 to a fed level BEFORE any walk-home
  travel line (not as its result) — with blockers,
  revealed set, and lateral stock unchanged.
- M5 REAL-WALK / E-MODEL DIVERGENCE: identity
  unchanged, day-12 start pos (7,1), day-12 say
  lines show real travel steps from (7,1) toward
  haven ending at haven, WHILE probe E from (7,1)
  still fails at day-12 start AND blockers /
  revealed / stock / scholar fields are unchanged
  from day-11 end — the scholar walks a route E
  cannot see (walkHome sidesteps / walkTo paths
  outside E's sim), so the pocket did not open and
  E understates the real walk.
- M6 SUCCESSION (the person changes): scholar
  identity (Game.villagerId, recorded every probe)
  CHANGES between day-11 end and day-12 start, AND
  a player:true death record falls on day 11 (or
  the day-11/12 boundary), AND day-12 start pos is
  haven (4,4) (the successor starts at home), AND
  probe E from (7,1) NEVER passes at any probe
  through day-11 end. If M6 holds, the verdict
  also corrects the homewardac reading: the pocket
  did NOT open — the stranded scholar died and the
  story continued with a different person at home.
- M7 OVERNIGHT-ONLY TIMING (a timing axis, not a
  rival mechanism): whichever of M1-M4 holds, the
  start/end pair must say whether its change fell
  between day-11 end and day-12 start (overnight:
  endDay regrowLand / dawn settlement) or inside
  day 12's play. M7 alone, with no M1-M6 signature,
  is not a naming.

## Deciding observations (trace fields, loopDays 5-12, start + end)

Per probe: loopDay, phase (start/end), pos, haven,
villagerId (scholar identity), kcal, health,
hydration, inventory sig, swimmer, E (ok, via,
directOk, legs, lateralPath, creditUsed, hops,
beyondUngenerated, reason), direct path
(simulateReturnJump, credit 1) with per-hop
checkHop blockers + engine travelBlockage,
lateral candidates (tile, d, blocked, blockType),
offersFrom count + coords (travelTargets),
revealedCount + per-tile revealed flags for the
probe box (x 4..8, y 0..4), tile snaps for the
probe box (type, needsBridge, bridged, blockFrom,
stock, revealed), orthogonal neighbour hops from
pos (checkHop blockers, engine block, tile snap,
revealed, stock), forages that day (pos, ok,
additions), say lines that day (day-tagged),
deaths list (runDays samples, player flag + day).
The analyzer prints all of these for days 5-12;
the evidence file carries the full trace table.

## Control gate G1 (STOP condition — judged FIRST, before any mechanism)

The fresh homeconstruct shadow leg (verbatim
driver, shape A, seed 69501, substrate above)
must reproduce the homewardac REPORTED SHAPE:
(a) day-5 start pos haven (4,4) on the leg, forced
walk-out completes to (7,1); (b) day-5 end pos
(7,1) with dayEndReturnSim.ok === false;
(c) days 6-11 end pos (7,1) AND dayEndReturnSim.ok
=== false on each; (d) day-12 end pos haven (4,4).
If ANY clause fails, STOP with verdict
DIAG-INSTRUMENT (substrate drift, reported loudly
with the diverging field: the clause, the expected
value, the observed value), do NOT judge a
mechanism on a non-reproducing leg, do NOT run
the probe leg as judged evidence. (Prior-corpus
comparison is context only: the prior corpus file
evidence/2026-11-02/sim-homewardac-b-pilotA-
shadow.jsonl already shows day-11 player:true
death gen_q3vdldd 'the wild' and day-12 start at
haven — that reading is a HYPOTHESIS for M6, not
a substitute for the fresh gate; the fresh leg is
the gate.)

## Probe-identity gate G2 (STOP condition for the probe trace)

The probe leg (same seed, same substrate, same
construction) must match the fresh homeconstruct
shadow leg on loopDays 1-12 day start/end pos AND
kcal exactly (day records compared field by
field). If ANY day differs, the probe reads are
not trajectory-neutral: STOP judging from the
probe trace, report DIAG-INSTRUMENT (probe drift,
diverging day + field), and judge nothing from
probe-only fields. The homeconstruct leg's own
fields (dayEnd sims, forages, say lines) remain
reportable as context, never as a mechanism naming.

## Verdict words (exactly these, judged against this header)

- MECHANISM-NAMED (M1..M6 named): G1 passes AND
  G2 passes AND exactly one candidate's FULL
  signature is observed on the recorded fields AND
  the other candidates are excluded on those
  fields (for M6: E-from-(7,1) never passes through
  day-11 end, so M1-M5 are excluded by the
  unchanged-identity / still-(7,1) clauses they
  require; for M1-M5: identity unchanged through
  day 12, so M6 is excluded).
- UNISOLATED: G1 and G2 pass but no candidate's
  full signature holds, or two candidates' signatures
  both hold on the recorded fields — with the
  SINGLE discriminating observation that would
  settle it, named for the next run.
- DIAG-INSTRUMENT: G1 fails (substrate drift) or
  G2 fails (probe drift), with the diverging field
  named. No mechanism is judged in this case.
A miss is NO-GO territory, never re-scored against
a friendlier pattern mid-run (MEASUREMENT.md §14).
Metric doubts go under "metric review" for the
NEXT run.

## Sense-testing law

Read the transcript around the day-12 release
(and at least one stranded day), quote >= 3 lines,
judge in plain words whether the release reads as
a person finding a way home or as an unexplained
teleport of fate. If M6 holds, the sense question
becomes sharper: does the transcript mark the
death and the succession, or does a new person
simply appear at home with the old person's story
unclosed?

## Balanced panel (§15)

INAPPLICABLE as verdict, same constructed-trip
reasoning as cband: the panel expresses the guard
policies on natural campaigns; this run's
before/after IS the fresh shadow leg vs the probe
leg on one identical seed (Gate G2), and the
mechanism question is answered from one
constructed trip's trace, not a campaign compare.
No compare file is fabricated. Wall numbers are
reported for the 30d construction leg with the
window limit stated (construction legs, not
natural play, no wall movement claimed).

## Deliverable

Evidence file evidence/2026-11-02/
sim-pocketpersist-b.md (prereg header, control-
gate result, probe-identity result, day-by-day
trace table for days 5-12, verdict against the
header, sense-test quotes + judgement, village
assessment in plain words, wall numbers with the
window limit stated, §15 inapplicability as above,
a "metric review" section, and findings for the
coordinator in sim-findings format — do NOT edit
hidden_files/sim-findings.md; the coordinator
appends). Plus the probe driver + analyzer +
proof test, all committed on branch
sim-pocketpersist-b. Report to coordinator:
verdict with the control-gate result and the
day-by-day evidence for it, commit hashes,
proof-test result, base commit, anything left
uncommitted or failed.

## Explicitly excluded

No judged leg before the prereg commit; no edit
to any existing script/policy/src file; no game
change, no default flip, no deploy; no touching
the sibling gap-guardedeploy lane's guard-E deploy
work; no push, bump, live verification, merge, or
rebase; no other worktree touched.
