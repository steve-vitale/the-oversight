# sim-food-round-0535-b — stale-lock recovery: sensorconfirm2 landed (INSUFFICIENT-DATA again) + pocketpersist landed (MECHANISM-NAMED M6 succession)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T0535Z,
axis food-economy (second non-converged axis; sibling Loop A live on
scale-onramp throughout, 0518Z claim, NOT touched). Claim written
before any sims; retired to .DEAD at closeout; lock deleted.
Pre-flight: main tree clean at 1f170e60c (batch-ship version bump),
disk 31%, reaper removed nothing sibling-owned (dirty trees
protected, as designed). Worktree cap was 16/16 at run start, so this
run registered NO new tree — it adopted the dead run's two trees.

## STALE-LOCK RECOVERY (dead by the guard rule, not by lock age)

Lock fleshout-loop-b-20261103T0330Z (03:30Z) present, but its trees'
heartbeats (03:30Z sensorconfirm2, 04:43Z pocketpersist) were 51+ min
stale at 05:35Z and no worker processes existed — dead per the 15-min
rule; the lock itself was 2h old, past the 90-min fallback. The 0330Z
coordinator had died mid-landing: its sensorconfirm2 arm was complete
except a corpus commit blocked by the container git-write EPERM flap,
and its pocketpersist arm had prereg + tools written but uncommitted
and no judged leg run. Recovery, in order: (1) sensorconfirm2 corpus
committed via the worker's own recovery command (f6eff7c30, index
clobber repaired, proofs 15/15 + 21/21 + 11/11), rebased onto
1f170e60c, merged --ff-only (db98d8e1f), tree released, branch
deleted; (2) pocketpersist tool bugs fixed (see below), proof 24/24,
prereg + tools committed (e15851ee4) before any judged leg, judged
legs run, evidence committed (f525c4be6, clobber repaired), rebased
onto db98d8e1f, merged --ff-only (a76ac5a44), tree released, branch
deleted. Loop A merged after (curiousw4 KILLED, 08cd8ab54) — zero
file overlap with either arm. The dead run's 0330Z claim is retired
to .DEAD at this closeout alongside this run's claim.

## Arm sim-sensorconfirm2-b (INSUFFICIENT-DATA, merged db98d8e1f)

Prereg e31088407-class bars verbatim from sensorconfirm (fixed
56-seed fresh band 81001-81056, 30d competent, gatecover tracer).
Judged in full by the dead run's worker; this run verified the
corpus, committed it, and landed it — no number re-judged here.
Count gate fails for the second run in a row: only 1 collapsing seed
(81053) against a bar of >= 4, survivors 54 >= 12. All other legs
pass on n = 1: fire 1/1, tie 1/1, strict 1/1, lead-one 1/1 (lead 2, no
death-knell), cost 6/54 = 11.1% (<= 25% bar), cross-check 0
mismatches on 56/56, tracer 56/56, determinism 3/3. Bars NOT lowered,
no extra seeds screened. Per the prereg this is INSUFFICIENT-DATA:
the shape neither advances nor fails. The single collapsing seed is
consistent with the pilot and first confirm (fires, beats (c), lead
2), but one seed cannot carry a confirm. Lesson carried (worker's
metric review, endorsed here): two fresh confirms in a row failed
the count gate (2/24, then 1/56) — the lesson is no longer "the band
was too small" but "starvation collapse in 30d competent is rare on
fresh bands at this base." A third confirm on the same recipe would
re-prove the same scarcity; what the shape needs is a different
collapsing supply (new prereg, not a re-run). The prior band's cost
parity was a fluke, not a property. (e*) does NOT deploy. Seeds
81001-81056 consumed, no longer fresh.

## Arm sim-pocketpersist-b (MECHANISM-NAMED M6, merged a76ac5a44)

Question (tracker blank 4): on the fresh 69501 shadow leg, what ends
the (7,1) pocket story between day-5 end and day-12 end? Answer: M6
SUCCESSION — the pocket never opened. G1 PASS (fresh homeconstruct
shadow leg reproduces the homewardac shape exactly: day-5 walk-out
to (7,1), days 5-11 end stranded with dayEnd ok false, day-12 end at
home). G2 PASS (probe leg matches control exactly on days 1-12
start/end pos+kcal). Trace: scholar Francisco Jordan
(gen_q3vdldd) walks out day 5 (1059 -> 989 kcal), starves to 0 kcal
by day 7, hp bleeding 44.9 -> 39 -> 33 -> 25 -> 0 across days 7-11
while foraging unidentified plants daily, dies day 11 (player:true,
"the wild"); day-12 start is a new person at home, Niamh Ruiz
(gen_7yvzi60, 2355 kcal, fresh pack). E from (7,1) never passes at
any probe (lateral-cap throughout); revealed set flat at 42;
(6,1) washed-out blocker persists; no lateral pass, no swimmer
flip, no crossing item, no real walk from (7,1). CORRECTION to the
homewardac reading: "day 12 it walks home (kcal 2085)" misread the
day-12 person — the 2085-kcal person at home is Niamh, not
Francisco. The transcript marks the handover explicitly ("The
Codex turns a page: Francisco Jordan, 11 days. The mantle passes
to Niamh Ruiz." / "You wake up somebody else."). Sense note: the
stranded days' narration voices hunger ("The pantry is in the hall.
Your hands are not.") but mostly reads as haven life, without
consistently placing the viewpoint character at the pocket — a
narration gap, not a mechanism gap.

Tool fixes before the prereg commit (dead run's proof failed 22/24;
no judged leg before either fix; prereg gates/bars/mapping
untouched): (1) UPKEEP PARITY — the probe driver built a bare
{daily} policy, but runDays calls policy.setup + policy.upkeep
(3x/day, before daily); without competent.upkeep the probe leg ran
a different game (69599 day-1 start 2200 vs 2190, day-7 home-healthy
vs stranded-0). Fix: probe policy is the full constructShadow
policy with only daily replaced. After the fix the 69599 live
validation leg matches exactly. (2) FIXTURE BUG — both proof
fixtures omitted days 2-4, so the g2-pass fixture failed on
missing-day; days 2-4 added with identical values. Proof after
fixes: 24/24. Lesson for future probe drivers: name the FULL
policy object (setup + upkeep + daily) in the prereg, not just the
daily calls.

## Wall numbers (in-window only — NOT wall movement)

Sensorconfirm2: 30d competent instrument band, not a campaign —
national / table / wins 0 in-window, expected, NOT wall movement.
Pocketpersist: 30d construction leg (single seed, survived) —
maxWave 3, wave kills 1:20, 2:4; national/table/wins not applicable
to a constructed trip. Wall numbers as last measured stand (full
seat 0 / wave 5 reached 0, Loop A lane).

## Telemetry deviation check

Prescribed invocation on the pocketpersist probe jsonl returned
three LOUD lines (national/table/wins "disappeared", baseline ->
0, n=1). Investigated same-run: NOT a deviation. The input is a
single constructed-trip trace, not a campaign corpus — it carries
no national/table/wins fields, so the check reads them as 0
against the scale-wall campaign baseline. Input-shape artifact, not
wall movement. Baseline NOT rolled.

## Infrastructure

- Git-write EPERM flap struck TWICE this run: it blocked the dead
  run's corpus commit (~04:33Z), passed at ~05:37Z long enough for
  both recovery commits, then closed again ~05:57Z (safe-commit
  private-index lock write refused, hash-object refused in main and
  worktree, registry heartbeat write refused, plain writes fine),
  and passed again ~06:13Z. No hand-rolled object surgery was
  attempted at any point; the run waited it out and re-proved
  (proof 24/24) before landing. Pocketpersist evidence carries its
  own COMMIT PENDING recovery note, now superseded by the landing.
- Safe-commit index clobber hit all four commits this run
  (sensorconfirm2 corpus, pocketpersist prereg+tools, pocketpersist
  evidence, coordinator evidence — see below) — repaired via
  HEAD-blob cacheinfo each time, commits verified correct, main
  tree clean at closeout.
- check.js --quick NOT re-run: zero src/js, zero default flips,
  standing 280/7 profile (same standing call as prior runs).
- Gap lane note (not touched): gap-beastpool2 tree appeared during
  this run (gap-batch) — consistent with the 2026-11-02 23:32 CST
  beastmaster pool-exclusion decision being built in the gap
  round, not here.

## Coordinator evidence + findings

Coordinator evidence: this file (commit below). Findings appended
to hidden_files/sim-findings.md: pocket M6 answer [fixed], upkeep
trap [method], stranded-narration gap [open] (counts verified at
append time).

food-economy stays converging (NOT converged): the sensor program
now has a PILOT-GO shape plus TWO INSUFFICIENT-DATA fresh-band
confirms (confirm question open, rule not overturned, no deploy);
the pocket persistence question is ANSWERED (M6 succession, landed
with a homewardac correction); the guard-E entry fix shape is
VALIDATED (GO) but NOT deployed. scale-onramp untouched (sibling
Loop A lane). Next blanks, in order: (1) sensor (e*) with a
DIFFERENT collapsing supply (new prereg — never a third same-recipe
confirm); (2) C prereg metric call: does "fences shape C" include
outward attempt vetoes (coordinator decision, still carried, not
decided here); (3) guard-E entry fix DEPLOY decision (veto-line
wording + credit-pool carve-out, own prereg before landing);
(5) guard->succession cascade (69604); then (7)-(25) as listed in
the 1730Z entry, unchanged. (Blank (4) pocket persistence is DONE.)

Claims retired to .DEAD (0330Z recovered run + this run); lock
deleted.
Merged locally, pending ship (sensorconfirm2 db98d8e1f +
pocketpersist a76ac5a44 + coordinator evidence below).
