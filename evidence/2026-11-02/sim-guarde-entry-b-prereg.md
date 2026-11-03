# sim-guarde-entry-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-guarde-entry-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261103T0230Z, axis food-economy).
Worktree sim-guarde-entry-b, branch sim-guarde-entry-b.
Base commit (pinned before any judged leg): 130566445
(coordinator merge: sensor PILOT-GO + lateralclose GO +
creekhop DIAG). This worker does NOT push, bump,
verify live, merge, or rebase; the coordinator lands
the branch. Status to coordinator: committed in
worktree, pending coordinator merge.

## Canon note

docs/CANON.md read first; docs/MAP.md states the way
home as travel through the same travelTo pipeline.
No canon doc covers the pocket guard itself: it is
a policy-side sim instrument (a competent variant),
not a game system, so there is no canon to invent
from — the guard's E(D) model is inherited verbatim
from scripts/policies/competent-homewardstep-b.js
(installGuard/escapeCheck/checkHop, zero changes to
that file). This run is INSTRUMENT + JUDGED PILOT:
zero src/js changes, zero edits to
scripts/policies/competent.js, zero policy-default
flips, zero bundled fix, zero live default change.
The variant below is a JUDGED INSTRUMENT ONLY: any
deploy of the fix shape belongs to a later arm's
decision, not this run.

## Predecessors (read, never re-litigated, never re-judged)

- evidence/2026-11-02/sim-guarde-creekhop-b.md
  (creekhop DIAG): on the 69501-69508 A band,
  E-pass fidelity was 24/28 = 85.71% (4 refusals:
  3 creek needsBridge-unbridged, 1 washed_out),
  while the guard's own checkHop with explicit
  origin predicted the engine exactly on 34/34
  hops. Mechanism named: guard-E is ENTRY-BLIND —
  installGuard evaluates ONLY escapeCheck(D),
  escape FROM the destination, and never checks
  entry INTO it, so it allows hops the engine
  refuses. Fix shape named (NOT landed): an allow
  should additionally require the hop itself to be
  engine-crossable, reusing the guard's own
  checkHop. This run JUDGES that fix shape.
- evidence/2026-11-02/sim-guarde-creekhop-b-prereg.md
  (instrument + control-gate design, reused here):
  the creekhop recorder leg (competent days 1-4,
  day-5 shape-A forced walk-out through the
  engine's own travelTo, stopping at the first
  refusal, no guard installed, guard numbers
  computed directly per hop via verbatim
  escapeCheck + checkHop imports).
- evidence/2026-11-02/sim-homewardac-b.md (C band
  ledger): north-route creek blocks on 69606
  ((4,5)->(4,6) creek, walk-out stopped (4,5))
  and 69607 ((4,4)->(4,5) creek, refused at the
  first hop). Prior C shadow day-5 construct
  steps: 69606 [moved, refused], 69607 [refused].

## Question

Does the entry-checked allow fix the guard-E
fidelity gap without changing any veto? I.e. if
allow' = E pass AND the hop itself is
engine-crossable (via the guard's own checkHop),
does allow' predict engine movement at >= 95%
on the creek-hop band, with every E-fail hop
still vetoed exactly as before?

## Variant definition (fixed now, no other change)

allow'(origin -> dest) = escapeCheck(dest).ok
AND checkHop(origin, dest).blockers is empty.

- escapeCheck and checkHop are imported VERBATIM
  from scripts/policies/competent-homewardstep-b.js
  (new module scripts/policies/competent-guarde-entry-b.js
  exports allowPrime; it adds NO other logic to
  the allow path — no credit, no veto-memory, no
  narration change).
- "checkHop crossable" means blockers.length === 0
  exactly as checkHop computes it (destination
  blockage from the hop origin + intermediate
  scan for multi-tile hops; recorder hops are
  adjacent, so this is the destination-entry
  check). The roadwork credit is NOT consulted
  by the entry check: the prereg deliberately
  keeps the variant to E + raw checkHop, so a
  rubble-only blocked hop that E's sim passes on
  credit would NOT pass allow'. No such hop
  occurs on the judged band's refused set (all 4
  prior refusals are creek/washed_out, never
  rubble); if one appears, it is reported as a
  counted allow' refusal, not re-scoped.
- Veto rule under the variant: vetoed IFF NOT
  allow'. Since allow' is a SUBSET of E-pass
  (allow' => E pass), every E-fail hop is vetoed
  under both rules identically — veto invariance
  is structural, and the judged legs verify it
  by count (see GO legs below).

## Instrument (recorder only, decided now)

scripts/creekhop-b-recorder.js reused VERBATIM
(zero edits): competent days 1-4, day-5 forced
walk-out through the engine's OWN travelTo,
stopping at the first refusal, no guard
installed, per-hop E / entry (checkHop, explicit
origin) / engineBlock (travelBlockage, explicit
origin) / destination tile / swimmer / moved /
say lines, exactly as the creekhop prereg.
allow' is computed from the recorded per-hop
E + entry AFTER the leg (new analyzer
scripts/analyze-guarde-entry-b.js) — the leg
trajectory is therefore identical to the
creekhop pilot leg by construction, and the
control gate below proves it.

## Control gate: base equality (STOP condition, before any judged number)

BEFORE any judged number is read, the fresh
recorder legs must reproduce the creekhop pilot
moved-patterns (evidence/2026-11-02/sim-guarde-creekhop-b-pilot.jsonl)
hop for hop:

- Day-5 start == (4,4) on all 8 A seeds.
- Forced moved-pattern identical to the pilot
  jsonl on all 8 A seeds (69501 TTTTT T,
  69502 TTTTTF, 69503 F, 69504 TTTTTT,
  69505 TTTTTT, 69506 TTTTTT, 69507 TF,
  69508 F — in the analyzer's T/F notation).
- 69502 hop (7,2)->(7,1): E pass AND moved
  false, as in the pilot corpus.

If ANY of these fail: STOP, report substrate
drift with the diverging seed/field, verdict
INSUFFICIENT-DATA, do NOT judge allow'.

C-route inclusion gate (separate from the STOP
gate): the C legs (seeds 69606, 69607, route
'4,5;4,6;4,7;4,8;3,8;2,8' via the recorder's
CONSTRUCT_ROUTE_A env var — a one-command
change, no new instrument) must reproduce the
homewardac pilotC-shadow day-5 construct steps
(69606 [moved, refused], 69607 [refused]) with
day-5 start (4,4). If the C gate fails, the C
legs are EXCLUDED, the A band is still judged,
and the evidence file states the C-route limit
explicitly. If the C gate passes, C hops join
the judged band (their allow' numbers are
reported separately AND pooled).

## Judged band (freshness: RE-RUN here, never re-used)

- A band: seeds 69501-69508, shape-A route
  (5,4;6,4;7,4;7,3;7,2;7,1), fresh recorder legs
  on base 130566445. Every number below comes
  from these fresh legs, not from the pilot
  corpus (the pilot corpus serves ONLY as the
  control-gate comparison).
- C legs (IF the C inclusion gate passes):
  seeds 69606, 69607, route C1
  (4,5;4,6;4,7;4,8;3,8;2,8), fresh recorder legs
  on the same base. Same env otherwise.
- Legs that never reach a day-5 haven start
  (dead scholar, Game.over) are EXCLUDED from
  all denominators and reported as leg failures.
  (Prior bands: 8/8 A and 2/2 named C legs
  reached haven.)

## Primary metric, GO thresholds, verdicts (decided now)

Unit: one forced hop on a recorder leg.

Primary metric: allow'-pass fidelity = moved /
allow'-pass forced hops across the judged band
(A alone, or A+C pooled when the C gate
passes — both the pooled and the per-band
figures are reported; GO is judged on the
pooled figure when C is included, on A alone
when it is not).

Judged legs — GO requires ALL of:

1. allow'-pass fidelity >= 95% (moved /
   allow'-pass hops).
2. VETOES UNCHANGED: every E-fail hop is still
   vetoed identically — operationalized as:
   (a) the E-fail hop set is identical under the
   old rule (veto IFF E fail) and the new rule
   (veto IFF NOT allow'), i.e. 0 veto changes
   on E-fail hops; (b) 0 E-fail outcome changes
   (every E-fail hop's moved value is the same
   number the old rule would have predicted —
   on recorder legs this is the recorded moved
   value itself, reported per hop). The hops
   that CHANGE status under allow' are exactly
   the E-pass + entry-blocked hops (the intended
   fix, previously allowed, now vetoed) — those
   are counted separately as allow-to-veto
   conversions, NOT as veto changes.
3. ENTRY MODEL AGREEMENT: the entry model
   (checkHop blockers empty => engine allows)
   agrees with the engine outcome on EVERY
   attempted hop in the judged band (report the
   count as N/N). A hop where entry says
   crossable but the engine refuses (or vice
   versa) is a model failure, counted here even
   if fidelity still passes.

- GO (fix shape validated): all three legs hold.
  Means the entry-checked allow predicts engine
  movement at the bar, changes no veto, and
  rests on a hop model that matches the engine
  on every hop. GO is a validation of the fix
  SHAPE as a judged instrument — NOT a landing,
  NOT a default change; deploy belongs to a
  later arm's decision.
- NO-GO: ANY leg fails. A miss is NO-GO, never
  re-scored against a friendlier metric mid-run
  (MEASUREMENT.md §14). The failing leg and its
  numbers are reported exactly; metric doubts go
  under "metric review" for the NEXT run.
- INSUFFICIENT-DATA: the A control gate fails
  (STOP condition above), or < 4 A legs reach
  day-5 haven start, or allow'-pass hops = 0.

Secondary (reported, never the verdict):
- allow-to-veto conversions: count + seeds +
  blockTypes (expected: the 4 prior E-pass
  refusals, 3 creek + 1 washed_out, on A).
- Per-hop table for every judged hop: E,
  entry blockers, allow', engineBlock, moved,
  tile, swimmer, say lines on refusals.
- E-fail + moved hops (pocket entries the guard
  would fence): count + seeds (expected on A:
  6, on 69501/69504).
- E-fail + refused hops: count (expected: 0).

## Horizon + wall numbers (death-aware, §10)

The recorder stops on day 5 by design (same
substrate as creekhop). Horizon = 5 days, chosen
because the question is hop-level fidelity on
the day-5 walk-out, not survival. NO national /
table / win claims are made from this run:
wall numbers are reported as day-5 survival
only (legs reaching the walk-out / total legs),
with the day-5 limit stated in the evidence
file. A 30d window is NOT run here.

## Balanced panel (§15)

INAPPLICABLE, declared here (not fabricated):
the panel expresses guard policies on natural
campaigns; this run's before/after IS the
recorder leg vs the prior shadow/pilot leg on
identical seeds (the control gate), with allow'
computed from the same recorded hops. No panel
is built and no compare file is fabricated.
The same declaration appears in the evidence
file with the creekhop reasoning.

## Sense-testing law

Read the day-5 say transcript around the 4
previously-refused hops (69502 (7,2)->(7,1),
69503/69508 (4,4)->(5,4), 69507 (5,4)->(6,4))
and judge in plain words whether the
entry-checked allow changes any spoken line
(expected: none — silence plus the engine's
refusal line, since the guard in shadow mode
never speaks and the variant adds no narration).
Carry the narration question — should the guard
speak when an allowed hop is engine-refused? —
as an OPEN QUESTION, not an answer. Quote the
transcript lines in the evidence file. The
evidence file carries a village assessment in
plain words, wall numbers with the day-5 limit
stated, a "metric review" section, and findings
for the coordinator in sim-findings format
(NOT written to hidden_files/sim-findings.md
by this worker — the coordinator appends).

## Census (proof, not judged evidence)

BEFORE any judged leg is run, the proof test
scripts/test-guarde-entry-b.js must show:
(a) the variant allow' definition on synthetic
hops, including the 69502 creek shape (E pass
+ creek entry block => allow' FALSE) and a
pocket-entry shape (E fail + entry clear =>
allow' FALSE — veto invariance at the unit
level);
(b) veto invariance on the predecessor pilot
corpus as a fixture (every E-fail hop in
sim-guarde-creekhop-b-pilot.jsonl maps to
allow' FALSE; allow' is a subset of E-pass);
(c) reused-files-unmodified: git check that
scripts/policies/competent-homewardstep-b.js,
scripts/creekhop-b-recorder.js,
scripts/policies/competent.js, and src/js are
unmodified in this worktree;
(d) the analyzer reproduces the creekhop pilot
fidelity (24/28 E-pass) from the pilot jsonl
as a fixture, and computes allow' fidelity
24/24 on that same fixture (the expected
direction — the fixture is NOT judged evidence,
the fresh band is);
(e) the judged band seeds/routes are exactly
A 69501-69508 + C 69606/69607 with the routes
above.
Any proof failure is a proof failure: fix the
instrument, do not judge legs against a failing
one. The proof test runs NO new sims (fixture
+ synthetic stub Game only); the control gate
is the instrument check on the fresh legs.

## Deliverable

Evidence file evidence/2026-11-02/sim-guarde-entry-b.md
(prereg header, control-gate result, per-hop
table for the judged band, verdict against the
header above, sense-test transcript sample +
judgement, village assessment in plain words,
wall numbers with the day-5 limit stated,
metric review section, findings for the
coordinator in sim-findings format), plus the
variant module + analyzer + proof test + fresh
recorder jsonl/logs, all committed on branch
sim-guarde-entry-b. Report to coordinator:
verdict (GO / NO-GO / INSUFFICIENT-DATA with
the pre-registered legs), fidelity numbers,
veto-invariance count, entry-agreement count,
control-gate result, C-route inclusion result,
sense-test finding, commit hashes, proof-test
result, anything left uncommitted or failed.

## Explicitly excluded

No src/js changes; no edits to competent.js,
the guard policy, or the creekhop recorder; no
default flip; no bundled fix; no guard-allow
rule change in any live-loaded policy (the
variant module is a judged instrument, loaded
only by the proof test and the analyzer's
definition, never by a campaign driver); no
seeds outside 69501-69508 + 69606/69607 judged;
no push, bump, live verification, merge, or
rebase; no edit to hidden_files/sim-findings.md.
