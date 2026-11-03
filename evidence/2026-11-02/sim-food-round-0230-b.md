# sim-food-round-0230-b — Loop B coordinator evidence: sensor (e*) confirm INSUFFICIENT-DATA + guard-E entry-checked allow GO

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T0230Z,
axis food-economy (second non-converged axis; Loop A live on
scale-onramp throughout — claim fleshout-20261103T0203Z, arms
sim-sortie-a / sim-w5faced-a — NOT touched). Claim written before
any sims; lock created at run start. Pre-flight: main tree clean
at 130566445, disk 22%, reaper removed nothing sibling-owned.
Master did NOT move under this run (Loop A landed nothing during
it); the only merge sequencing was internal: sensor merged
--ff-only first, guard rebased clean onto the sensor tip (zero
file overlap), proofs re-run green on the rebased tip, then merged
--ff-only. No merge conflict, no force, no sibling branch touched.

## Arm sim-sensorconfirm-b — INSUFFICIENT-DATA, MERGED

Worker commits e31088407 (prereg, before any judged sim) +
e45eec702 (analyzer + proof 15/15) + 2bfdec253 (evidence + corpus
+ summary + logs), merged --ff-only as 2bfdec253 (base 130566445).

Question: does sensor rule (e*) (stand-down + envelope + hunger
corroboration, from sim-sensorredesign-b) survive a FRESH band?
Fresh band 80001-80024, 30d competent, verbatim gatecover tracer,
one node process per seed, judged in full, no cherry-picking.

Verdict INSUFFICIENT-DATA, judged exactly against the prereg:
only 2 collapsing seeds against the bar of >= 4 (survivors 22
cleared their >= 12 bar). Bars were NOT lowered and no extra
seeds were screened to fill the count. All checkable legs passed
on n = 2, but n = 2 is not a confirm: (e*) fires 2/2 collapsing,
lead_e >= lead_c 2/2, lead_e > lead_c 2/2, lead_e >= 1 2/2
(leads 2 and 3 — no lead-0 death-knell on this band), cost
4/22 = 18.2% of survivors (within the <= 25% bar), cross-check
0 mismatches on 24/24, tracer rows == daysAlive 24/24 first try,
determinism spot-check 3/3 byte-identical.

Collapsing seeds: 80008 (lost day 20, ref day 18, (c) day 17
lead 1, (e*) day 16 E2-cliff lead 2); 80016 (lost day 29, ref day
28, (c) day 26 lead 2, (e*) day 25 E1-envelope lead 3). Cost
detail: (e*) and (c) fire on the IDENTICAL 4 survivors (80001,
80017, 80020, 80021) — the looser 2-fall trigger cost nothing
extra here, vs the pilot's 790-screen context (15-17% vs 8.3%).
Whether cost parity is a band fluke or a fresh-band property is
unmeasured (carried as a finding). Sense test: both firing
evenings carry the village's own thin-pack voice ("You keep a
day's food (360 kcal) — nothing extra for the pantry this
time." / 130 kcal variant), so both warnings read as noticing
in time — no silent-cliff voice gap on this band, unlike the
pilot's 79006 cliff silence.

This does NOT overturn the pilot GO and does NOT deploy (e*).
The lesson is screening arithmetic, not the rule: at this base's
collapse rate (2/24 starvation collapses in 30d competent), a
24-seed band is too small a bet for a >= 4 collapsing bar. The
next (e*) confirm prereg must fix the screening rule (larger
fixed band, e.g. 48-64 seeds, or a pre-screening rule fixed
before judging), not the verdict bars. Seeds 80001-80024 are now
consumed (no longer fresh). Deploy wording note carried, not
acted on: any future deploy wording must be peak-anchored
("fallen from its recent high"), never stand-down-anchored.

Wall (30d limit stated, no national/table/win claims): 22/24
survived 30d (median 30, max 30); wave 3 reached by 16/24, wave 2
by 24/24; waves 4-5, Arc II/III/IV, regional -> national, table,
win flag: NOT REACHED IN WINDOW (0, as expected). 518 deaths,
5 starvation, all on the 2 collapsing seeds; no survivor starved.

## Arm sim-guarde-entry-b — GO, MERGED

Worker commits 87f5d8d87 (prereg, before any judged sim) +
2057dad3b (variant module + analyzer + proof 30/30) +
4f6d5d7fe (evidence + fresh corpora), rebased onto the sensor
tip as 58e9d5406 / af4d07242 / c0926ece5, proofs re-run green
on the rebased tip (test-guarde-entry-b 30/30,
test-guarde-creekhop-b 17/17), merged --ff-only as c0926ece5.

Question: does the entry-checked allow' (allow = E pass AND
checkHop clear, reusing the guard's own checkHop verbatim)
fix guard-E's entry-blindness without changing any veto?
Judged instrument only — NO live default changed, zero src/js,
guard policy / creekhop recorder / competent.js verified
unmodified.

Verdict GO on all three prereg legs, fresh legs on base
130566445: control gate PASSED (A band 8/8 moved-patterns
reproduce the creekhop pilot; C legs 2/2 reproduce the
homewardac C-shadow day-5 steps — the C route worked via the
one-command CONSTRUCT_ROUTE_A change, so no C-route limit
applies). Leg 1 allow'-pass fidelity: A 24/24, C 1/1, pooled
25/25 = 100% (bar >= 95%); old E-pass fidelity on the same
fresh legs is unchanged (A 24/28, C 1/3). Leg 2 vetoes
unchanged: 6 E-fail pocket-entry hops still vetoed
identically, 0 veto changes. Leg 3 entry-model agreement:
37/37 hops (checkHop blockers empty iff engine moved).
Conversions: 6 hops move from allowed to vetoed, all
engine-refused (5 creek, 1 washed_out: 69502, 69503, 69507,
69508 on A; 69606, 69607 on C). No engine-allowed hop is newly
vetoed; no formerly vetoed hop is newly allowed.

Sense test: the entry-checked allow changes no spoken line —
zero guard veto lines in either judged jsonl; refusals speak
only the engine's lines ("The creek runs fast here — no
crossing without a bridge or a swim." / "The path is washed
out."). Two open questions carried for the deploy arm, NOT
answered here: (1) should the guard speak when an allowed hop
is engine-refused, and (2) the existing veto line ("you
couldn't get home from there") names the wrong reason for an
entry veto — a deploy arm should decide whether veto lines
distinguish entry from escape vetoes. Also untested: no
rubble-only refused hop occurred, so whether allow' should
consult E's roadwork credit pool is still undecided; the
deploy arm must decide it explicitly before landing.

Wall (day-5 limit stated): 10/10 legs reached the day-5
walk-out; no national/table/win claims — the recorder stops
day 5 by design.

## Telemetry deviation check

Prescribed invocation on the sensor confirm jsonl returned one
LOUD line, a parse refusal (multi-line jsonl fails at line 2)
— the known input-format limitation, NOT a deviation; baseline
NOT rolled. No LOUD deviation lines. The guard corpora are the
same recorder-corpus class the check refuses by design.

## Infrastructure

Safe-commit index clobber hit both workers' commits (reported
by both, repaired via HEAD-blob cacheinfo each time, commits
verified correct). Coordinator commit: watch for the same
clobber and repair before closeout. check.js --quick NOT
re-run: zero src/js, zero default flips, standing 280/7
profile (both arms are policy/instrument files only).

## Village assessment (plain words)

Twenty-four fresh villages lived a month each, and only two
fell — both to hunger, both warned by the new rule two and
three evenings before anyone starved, in the villages' own
thin-pack words. The other twenty-two heard the rule only
four times between them, and the old rule spoke on exactly
the same four villages — so on fresh ground the new rule
cost nothing extra. But two fallen villages cannot confirm a
rule: the pilot's promise still waits on a bigger fresh band
before anyone may claim it safe to deploy. Separately, ten
short walks proved the guard's fix: every step the guard
now allows is a step the land actually allows, every step it
fences is still fenced, and no voice on the page changes —
the guard simply stops calling fine the steps the creek
refuses. The blank the guard arm filled is the fix shape
itself, validated; the deploy decision is the next arm's,
with two wording questions and one credit-pool question
named for it.

## food-economy status

food-economy stays converging (NOT converged): the sensor
program now has a PILOT-GO shape plus an INSUFFICIENT-DATA
fresh-band confirm (the confirm question is open, the rule
is not overturned, no deploy); the guard-E entry fix shape is
VALIDATED (GO) but NOT deployed (variant instrument only).
scale-onramp untouched (sibling Loop A lane). Next blanks, in
order: (1) sensor (e*) fresh-band CONFIRM, retry with a fixed
larger screening band (48-64 seeds) or a pre-screening rule
fixed before judging — verdict bars unchanged; (2) C prereg
metric call: does "fences shape C" include outward attempt
vetoes (coordinator decision, carried); (3) guard-E entry
fix DEPLOY decision (variant -> live guard): veto-line
wording (entry vs escape) + roadwork credit-pool carve-out,
own prereg before landing; (4) pocket persistence mechanism
(69501 day-12 opening); (5) guard -> succession cascade
(69604); then (7)-(25) as listed in the 1730Z entry, unchanged.

Claim retired to .DEAD; lock deleted.
Merged locally, pending ship (sensorconfirm 2bfdec253 +
guarde-entry c0926ece5 + coordinator evidence this file).
