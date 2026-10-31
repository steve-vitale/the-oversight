# sim-windowcarry-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1230Z,
arm sim-windowcarry-b, axis food-economy. Worktree sim-windowcarry-b.
POLICY PROTOTYPE ONLY: one new policy file
(scripts/policies/windowcarry-diag.js), zero edits to any existing
policy file, zero src/js changes, zero policy-default flips. Sibling
trees never touched; main tree never touched. The coordinator merges;
this worker does NOT push, bump, or verify live.

## Canon read before designing

docs/CANON.md first, then docs/PRESERVATION.md (the ladder; rot can't
be smoked back; spoilDay-366 staples survive every dawn sweep) and
docs/TIME-ECONOMY.md (ticks/day-parts, metabolic burn ~2200 kcal/day,
bridge 96 ticks + 60 kcal). No canon doc covers the morning-carry
blank itself — stated here instead of inventing canon. Standing
rules that bear on it: "no silent actions" (every act narrated),
perception law (Steve 2026-10-28: decisions from what the villager
senses — its own tile, its own pack, the haven pantry it stands in,
its own clock; the probe reads only those, plus the previous
evening's woodcarry record, which is its own lived evening), and
"if you don't know, it doesn't show" (unknown food is not food
until identified — eat() refuses edible===false items, and unknown
lumps carry kcalEach 0).

## The design decision (worker call, justified)

Candidate picked: (b) — haven-departure pack carry ONLY pre-strand
(bank before the strand, nothing during/after). NO wake-eat half at
all: the routine's own upkeep eat (competentEat) already consumes
carried staples at wake, so a second wake-eat would double-meter
the same bite and muddy the chain. Candidate (a) (wake pack-eat
only inside the strand window) was rejected on the trace evidence:
strand-morning packs hold NO known food (morningcarry trace
finding 3), so a wake-eat with no carry half could never fire on
a strand morning — it would be a vacuous arm. Candidate (c)
(wake-eat only, no carry) fails for the same reason. The bank
window is defined in census units (loop-days, the unit of every
strand list): loop-days 1–7 AND before the first still-creek
evening on that leg. Loop-day 7 is the last pre-strand morning:
on 15215 the first still evening is loop-day 7 on both legs, so
the loop-day-7 morning departure is the arming departure, and the
loop-day-8 morning (after the first still evening) is already
closed by BOTH gates. After the window closes the lever never
acts again on that leg — no re-arming after a return home, no
daily re-feeding.

The say line is deliberately neutral ("You pack N portions from
the pantry for the road — K kcal carried."): the vessel cannot
know a strand is coming, so prescient narration ("before the
strand") would be a sense failure.

## The chain under test (replaces morningcarry's broken chain)

Morningcarry's hypothesized chain (day-7 departure -> day-8
wake-eat -> day-8 rescue) failed because its carry fired on
nearly every haven morning from loop 1, re-routing the whole
trajectory, and its only ON firing inside the control range was
loop 5. Windowcarry's chain is: pre-strand departures (loop-days
1–7, at most 7 acts) stock spoilDay-366 staples in the pack ->
staples survive the night(s) at the creek (the dawn sweep cannot
take them) -> the strand day is fed by the routine's own upkeep
eat -> the evening bridge kcal gate (wood 4, kcal >= 60, ticks
>= 96) is reachable on evenings where food was the binding
constraint. The causal-link evidence is physical, not
narrative: a rescued evening D inside the control strand range
whose PRECEDING evening's pack held known kcal > 0 (carried
staples present at the creek the night before the rescue).
Morning-pack known-kcal and scholar kcal on strand mornings are
reported as supporting evidence, but the link does not depend
on them (upkeep eat timing could zero the morning pack before
the driver's daily snap).

## Substrate (asserted FATAL in the driver)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON),
WINDOWCARRY=0 (control/OFF) / 1 (variant), DAYS=30, PRESSB unset/0
and STRANDFIX unset/0 (both FATAL if 1: neither is in this stack).
Seeds: the 8-seed pilot band 15003, 15009, 15091, 15211, 15215,
15220, 15221, 15337 (the bank's first 8, including the sole strand
seed 15215). Control legs run through the existing trace driver
(unmodified, WINDOWCARRY unset); variant and OFF legs run through
the new windowcarry driver (same warmed stack, probe wrapper
gate 0 = OFF). OFF legs must reproduce the trace control legs
exactly on per-seed creek/still/rescued counts (det-gate, as in
morningcarry). RNG-stream note: variant legs take pantry food on
pre-strand mornings, which changes routine decisions downstream;
post-first-take trajectory divergence from control is EXPECTED
but BOUNDED (at most 7 acts, all before loop-day 8) and is
reported as divergence, never hidden and never mistaken for a
lever effect on its own — only the prereg's strand-count bars
judge the arm.

## Horizon + why (death-aware, never a fixed 200d by default)

DAYS=30, death-aware: the harness stops at Game.over (dead
villages stop simulating; the +10d tail is the harness's own end
handling). 30 days covers the whole strand (control guard nights
7-9, ON nights 7-16, plus the day-17/18 tail) and 12 post-strand
guardrail days, and matches every prior strand arm's census
window, so counts compare exactly. A 150-day panel would measure
a different question on a different substrate and cannot express
this stack (see §15 below). Wall numbers (national/table/wins)
are NOT observable on a 30d pre-seat census and will be reported
as such, not fabricated.

## Primary metric + GO threshold (judged exactly as written)

Primary metric: the stranded-evening census on seed 15215, guard
+ ON legs, extracted exactly as in morningcarry (still =
woodcarry bucket creek + rescued false; rescued = bucket creek
+ rescued true; strand = maximal run of still evenings on
consecutive loop-days).

GO iff ALL of:
  (a) still-count FALL >= 2 on the 15215 ON variant leg vs its
      same-WOODWARM control leg, AND the fall is causally linked
      to recorded windowcarry actions on that leg: at least one
      LINKED RESCUE — a variant evening D inside the control ON
      still range (7-16) with woodcarry bucket creek + rescued
      true, whose PRECEDING variant evening's pack known-kcal
      > 0. (Prevention alone does not pass: if the variant leg
      never enters the control range at all, there is no linked
      rescue, and the clause fails — the fall would be
      re-route prevention, not the fed-bridge chain.)
  (b) strand length does NOT increase on EITHER variant leg vs
      its control (total still count AND maximal still-run, both
      non-increasing);
  (c) GUARDRAILS (all must hold):
      - no earlier death: no seed's vessel death / game-over day
        moves earlier on a variant leg vs its control;
      - no new death mode: no death cause on a variant leg absent
        from that seed's control leg;
      - no newly ticks-short evening on any seed (per-leg
        ticks-short still-evening count <= control);
      - no increase in creek still counts on any non-strand seed;
      - median survival on the pilot band not worse than control
        (both legs pooled: variant median daysAlive >= control
        median daysAlive);
  (d) WINDOW INTEGRITY: zero window violations on any variant leg
      (no acted depart with loopDay > 7, and no acted depart
      after the leg's first still evening — verified from the
      depart records and the policy's daily-count cross-check
      against the driver's callIdx stamp; any violation is an
      instrument failure and the arm is KILLED, not judged).
Otherwise NO-GO. A pilot with zero acted departs on 15215 is NOT
a pass: it is a substrate finding, and the confirm legs are still
run ONLY if the pilot sniff below passes (records complete on
every still evening, errs 0, mechanism evaluated on real haven
and strand mornings); if the pilot records are incomplete or the
driver crashes, the lever is KILLED-AT-PILOT and no confirm
spend follows.

## Staging

- PILOT (sniff only, never judged): 8 seeds, ON variant leg only.
  Pass iff 8/8 files present, errs 0, every 15215 ON still evening
  carries a complete record, the window gate is evaluated on
  15215 haven mornings (act or honest skip with reason), and at
  least one acted depart occurs on 15215 inside the window.
  Pilot files are NEVER mixed into judged corpora.
- CONFIRM (judged): 8 seeds x 6 legs (guard/ON x
  control/variant/OFF) + determinism re-run of the ON variant leg
  (byte-identical corpus required, as in morningcarry). ALL legs
  re-run fresh on the current base: morningcarry's corpora
  (adoption base 6856df77f) are reference only and are NOT reused
  as judged data.
- SENSE TEST (law): read the say lines of every acted departure
  on 15215 and the rescued evening's narration end to end. The
  fix must be NARRATED (departure-carry line, bridge line where
  applicable), never silent. A conversion with no narration in
  the transcript is reported as a sense failure even if the
  census passes. The departure line must NOT mention the strand
  (the vessel cannot know it is coming).

## §15 panel (applicability, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract
(registry policies, community-exposure rows, 150d win/vest
scorecard). It cannot express the nighttravel+woodcarry+woodwarm
strand stack, the 30-day creek-evening census, or an env-gated
single-mechanism probe — the same declaration every prior strand
arm made and every coordinator accepted. The comparison here is
control-vs-variant legs on identical seeds through the census
analyzer, and is never labeled a panel comparison. The paired
compare is evidence/2026-10-31/sim-windowcarry-b-compare.md,
generated from the census JSON. If the panel tool is invoked on
this corpus it will be recorded with its output verbatim; no
panel result is fabricated.

## Metric review (carried in the evidence file; revisions apply to the
NEXT run, never mid-run)

Open questions noted before any judged leg, not resolved by re-scoring:
- Whether the bounded pre-strand bank is enough: at most 7
  carries, and the routine eats pack first, so carried staples
  may be eaten before the strand even starts (days 1-7 routine
  consumption). The judged legs measure evening pack known-kcal
  across the strand directly; a bank eaten early is a finding
  about routine appetite, not a reason to re-bar.
- Whether the vessel-death guardrail is fair to a lever that
  changes routine decisions from day 1: morningcarry's metric
  review judged it near-unpassable for trajectory-wide levers.
  Windowcarry's divergence is bounded to 7 pre-strand acts, so
  the guardrail is fairer here — but if it fails on succession
  death-day drift alone (same cause, different day), the
  evidence file will say so rather than re-barring mid-run.
- Whether the linked-rescue clause is too strict if the bank
  prevents the strand entirely (variant never strands): under
  this prereg that is NO-GO on clause (a), and the evidence
  file will say so rather than re-barring mid-run. Prevention
  by a bounded pre-strand bank is a different claim from the
  fed-bridge chain and needs its own prereg.
