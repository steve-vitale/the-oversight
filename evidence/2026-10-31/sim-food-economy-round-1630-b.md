> RECOVERY NOTE (added by run fleshout-loop-b-20261031T1830Z):
>
> The 1630Z run wrote this evidence itself as commit e8b7ba109 on
> branch sim-food1630b-closeout at 18:20Z but died before merging it.
> The 1830Z run first committed a thin recovery draft (980be597d, now
> superseded by this file) and then restored the run's own draft
> verbatim below, so the round record keeps its landing, telemetry,
> and infrastructure detail. The only addition is this note.
>

# sim-food-economy-round-1630-b — coordinator evidence (Loop B run fleshout-loop-b-20261031T1630Z)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1630Z,
axis food-economy (converging, NOT converged). Second axis: Loop A
live on scale-onramp for the whole run (1535Z claim at takeover,
retired mid-run; 1702Z claim live at landing — NOT touched).
B 1430Z closeout was already recovered before this run's takeover
(evidence db8e94b55 + correction 798df8849 on master, tracker
entry written, stale lock/claim remnants deleted by the
main-session closeout during this run's wait — verified, not
assumed). This run took food-economy as the second axis per the
loop-B role, not by grabbing scale-onramp when A's 1535Z claim
retired (A's program continues there next run).

## Pre-registration (coordinator-level)

Three DIAG arms, all measurement-only (zero src/js, zero
policy-default flips, zero gate/demand numbers moved), each with
its own prereg committed before its judged legs (see each arm's
evidence). Bases: all three pinned f536e3ad3 (Loop A round-1535
evidence), rebased onto master at landing (see Landing). §15
balanced panel: NOT APPLICABLE to any arm — all three are
single-base diag censuses with no before/after lever comparison;
none fabricated. Wall numbers below are per-arm, never pooled:
all three are pre-seat censuses on which national/table/wins
are NOT observable (reported, never fabricated).

## Arm 1 — sim-strandbank-b: SUBSTRATE-MISSING STANDS (merged c0f96fb86, proof 111/111)

Question (1430Z headline order): re-derive the strand set on
current master FIRST, sweeping wider than the 8-seed band,
before any strand judging. Answer: there is no strand set on
this base at this width. 18 seeds x 2 legs = 36 legs, 1,080
evenings, 0 still-creek evenings, 0 genuine creek evenings.
Stage 1: 10-seed bank (15003, 15009, 15091, 15211, 15215, 15220,
15221, 15337, 15376, 15439), 30d nighttravel+woodcarry+woodwarm
stack — 0. Stage 2 (prereg-triggered): fresh seeds 16501–16508
— 0. Basecheck (verbatim morningcarry driver, 15215) confirms
no further drift on f536e3ad3. Slept-away evenings exist
(15376 days 10–13, 16502 days 16–18/21–23) but with wood ≥ 4 —
not still-creek. The looser "slept away, any cause, wood < 4"
metric is also 0 on all 36 legs. The old set (15215 guard
[7,8,9] / ON [7..16]) stays void. The fedevening branch-fire
design and the axefirst joint proof stay PARKED — neither
blank reopens. No lever was judged; none is claimed failed.
Commits: d1ba7fdf9 (prereg, by the first worker before its
harness death), bc2323086 (corpora + instruments), 51b4822e4
(evidence). Proof scripts/test-strandbank2-b.js: pure 15/15,
full corpus 111/111 (re-run on the rebased tip).
Findings carried to the backlog (coordinator appends): (a) a
haven-bucket artifact — seed 16506 evening 25 reads bucket
creek + rescued true while the vessel sits at haven
(travel-refused classification); the analyzer reports both
counts and still is 0 under both readings, so nothing was
re-scored — future preregs should state which count is
primary; (b) the looser-metric-0 result above.

## Arm 2 — sim-departdiag-b: DIAG-GO (merged 49868352e, proof 162/162)

Question (fedevening metric review doubt #3): why does the
competent policy never depart on 8/8 seeds in 30 days?
Answer, reframing the question: the departure gate is the
RETURN leg, not the road out. Under the prereg's definition
(departure = ending the day away from Haven), overnight
departures are 0 on all 16 judged legs (8 seeds x guard + ON,
480 loop-days, 480 stays, 0 creek evenings). But the vessel is
NOT stay-home: it leaves Haven on 210 of 240 days per leg on
day trips and comes home every night. Gate, traced: needTrip
(scripts/policies/competent.js:949-964) — false on 30 stay
days, all three false-conditions verified on every false day,
0 decomposition violations; and the forage trip's trailing
walkHome (competent.js:1487) — 210/210 narrate "You walk back
into Haven". Trip driver is contribution, not hunger:
give-rule present on 207/210 trip days, pantry-only on 3 (all
15009), vessel hunger on 0/210. On 15215, loop-day 7 — the old
"day-7 departure" — is now needTrip true (pantry 23950, no
give recorded), forage delta 3, home by evening. 0 unknowns
on the gate itself. Residue (explicit unknown, appended to the
backlog): 15221 loop-days 27–28 show multi-hop out-and-back
travel (creek, forest floor, back to Haven) with no forage
delta on needTrip-false days — prime suspect stoneRun's
frontier pushes, but records carry no fogSteps/stoneRuns
counter to distinguish it from workTrapline/counterPlay/flee
legs. It does not overturn the gate: both days ended at
haven. Consequence for strand arms (stated in the arm
evidence): a strand arm must first produce an OVERNIGHT
ABSENCE, not just a departure — day trips are not strand
substrate. Sense PASS on Haven-bound days. Commits:
60158f3b (prereg), 11df366b (instruments), 7009daa8
(evidence + corpora). Proof scripts/test-departdiag-b.js:
162/162 — pure 47/47 verified before merge, full corpus
162/162 verified on the merged tip (same blobs, ff merge;
ordering disclosed here, not hidden).

## Arm 3 — sim-corpsehome-b: DIAG-GO (merged 0c123fdc8, proof 22/22 at worker HEAD)

Question (corpsemove prereg gap): re-prove the corpse-home
mechanism on a FRESH bearer on current master, not the
diverged 15215 trajectory. Answer: RE-PROVED. Bracket (seed
15001): bearer Lucia Shin (gen_yg04sz4) dies away from
Haven; successor Tomas Reynolds (gen_7qjv8xz) holds the
mantle on both sides of the move segment. PendingBurials day
8 → recovery on endDay 9 (first endDay with scholar.day 9 >
8) → Haven morning 10. Uniform rule now stated across all 46
deaths: pending day P → recovery night P+1, visible morning
P+2 (corpsemove's 15215: P=17, night 18, morning 19 — same
rule, no extra night). Evening 9: node (3,0), mx 0, my 8,
recovered false, looted false, 8 item stacks. Morning 10:
node (4,4), mx 4, my 4, recovered true, looted false, items
identical, pending cleared. Say line verbatim in the
morning-10 gap lines: "That night, they bring Lucia home.
Nobody asks you to help carry; nobody has to. By morning the
grave is dug by the fire, and the body is laid out beside it.
The filling of it is yours." Search leg and full-capture
bracket leg agree exactly on morning 9 / evening 9 /
morning 10. Candidates discriminated on this bracket:
daytime carrying excluded (day-9 transcript zero
corpse/grave/Lucia/body lines); succession relocation
excluded (succession morning 9, move night 9→10); other
writers excluded (only c.node assignment in src/js is
corpses.js:937, inside recoverBearer; only caller is
game.js endDay; pendingBurials touched only by corpses.js +
ledger.js). Two honest limits stated in the evidence:
deathKnown was already true at succession (only recovered
flips + pending clears on the segment), and Lucia was the
only corpse on the move segment, so same-segment
other-corpse stability is vacuous here — recentering
exclusion rests on the sole-writer grep plus the wider
census (no non-bearer corpse ever moves node). Census (full
prereg band, 60-day ON legs): 65 seeds, 46 bearer deaths,
13 away-deaths all ending at Haven (4,4)/fire cell, 43
position changes; every dead-bearer corpse ends recovered
at the fire, including at-Haven deaths whose mx/my snap to
the fire cell on their due night. No non-bearer corpse
moved. Sense-test: the death beat followed a day later by
the bring-home line reads as the village acting overnight,
not a teleport; the carrier stays anonymous ("they"),
matching the code — a texture note, not a bug claim.
Commits: 8d327af87 (prereg), 465a7b1a0 (instruments),
24dfa28e6 (evidence + table + proof + corpora, 84 files).
Proof scripts/test-corpsehome-b.js: 22/22 at the worker's
HEAD. On the rebased tip it reads 21/22: the single FAIL is
the tracked-diff guard flagging src/js/build.js — which was
changed ONLY by the batch-ship version bump dc66b4136
between the worker's prereg base and master, not by this
arm (verified: corpsehome-only diff vs the merge point
shows zero src/ or scripts/policies/ changes). The guard's
baseline is stale after rebase; the branch-only check is
the correct one and it is clean. The coordinator flips the
sim-findings corpse item from open to fixed on this
evidence (the worker did not edit the backlog itself, per
its brief).

## Wall numbers — UNCHANGED

Full seat 0, wave 5 reached 0 stands. National / table /
wins NOT observable on any arm's pre-seat census (strandbank
30d, departdiag 30d, corpsehome 60d death census) — reported,
never fabricated. No game change in this round (zero src/js;
only game-content data edit held by the earlier datahold;
sim prototypes env-gated default-OFF or new-file instruments).

## Telemetry deviation check (step 10 — investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
<arm-census-json> --metrics national,table,wins,exiled`
prints LOUD "national/table/wins disappeared: baseline 12/16/16
-> current 0 (n=1 files)" for both the strandbank census and
the corpsehome table. Investigated as a missing-field
artifact, same class as prior rounds' refusals: neither file
carries national/table/wins/exiled fields at all (strandbank
census keys: seeds, perSeed, totalStill, totalCreek,
seedsWithStrand, legs, verdict; corpsehome table keys: arm,
base, bracket, perChunk, prereg, searchCensus, stack) — the
check ingests a single census file where the baseline expects
per-seed sweep rows on a reachability stack, so 0 means
"field absent", not "wall moved". No genuine LOUD signal.
Baseline NOT rolled.

## Landing

Master moved mid-run (batch ship bump dc66b4136 at 17:24Z,
then journey-endgame r76 b9f0177be), so each branch was
rebased onto b9f0177be, its proof re-run green on the
rebased tip (strandbank 111/111, departdiag pure 47/47 then
corpus 162/162 on the merged tip as disclosed above,
corpsehome 21/22 with the single explained guard fail),
then merged --ff-only in arm order: strandbank c0f96fb86,
departdiag 49868352e, corpsehome 0c123fdc8. Worktrees
released as merged, branches deleted, worktree removed,
reap sweep clean (other loops' dirty trees untouched).
Main tree clean at landing. No bump, no push, no live
verification — the ship loop owns those. Merged locally,
pending ship.

## Infrastructure (for the next coordinator — NOT game findings)

1. EPERM flap hit worktree registration twice in this run:
first batch failed all three slugs (ref-lock writes +
index-reset failures, 63k-file checkout storm); retry in a
good window registered strandbank, then departdiag failed
again on index-reset while corpsehome succeeded; orphan
branches left by failed registers (tip == master HEAD, no
unique commits) were deleted before each retry, per the
2026-10-31 register lesson. Never forced ref surgery.
2. Safe-commit index clobber hit every worker commit in
this round (all three arms) plus the predecessor's
prereg commit; repaired each time via `git update-index
--add --cacheinfo` from HEAD blobs, verified status +
diff HEAD empty before continuing. Commits themselves
were never in doubt (blob hashes match).
3. Two workers died on harness transport errors (sqlx pool
timeout), not on their work, and were re-dispatched:
strandbank's predecessor had committed its binding prereg
(d1ba7fdf9) — the replacement repaired the clobbered
index, verified the prereg intact, and continued from it
without rewriting it; departdiag's predecessor died before
committing anything (clean tree), so its replacement
started fresh. Corpsehome ran straight through.
4. stdout-runner + idle-splitter transport worked first-try
on all arms; no judged corpus staged in /tmp.

## Metric review

- Strandbank: the census decision rule held (0 strands on
36 legs → SUBSTRATE-MISSING, no set published, no lever
re-scored). New doubt for the next run: the haven-bucket
artifact (16506) means future strand preregs must state
whether the primary still count is raw or haven-checked.
- Departdiag: the prereg's departure definition (ending the
day away from Haven) proved to be the right one — it is
what separates strand substrate from day trips. No revision
proposed; the 15221 residue stays an explicit unknown.
- Corpsehome: the prereg's alternative clause (bracket +
excluded mechanisms + residue) was not needed — the full
DIAG-GO bar was met on the fresh bracket. No revision.
- No metric was re-scored mid-run in any arm.

## Convergence

food-economy stays converging (NOT converged): the strand
set is now measured empty on current master at 36-leg
width, the departure gate is identified as the return leg,
and the corpse-home mechanism is re-proved on a fresh
bearer — but no strand fix has landed and no
food-economy default flipped. Next blanks, in order: (1)
a strand arm may only be planned once an overnight
absence is producible (departdiag's sharpening: day trips
are not substrate) — until then strand designs stay
parked; (2) the 15221 multi-hop travel identification
(stoneRun counter or equivalent); (3) the lacking-line
wording decision and the warmth-fuel decision, both still
awaiting a design owner; (4) the two Steve-call items
(competent courtship drive; generation-dealt vs earnable
vests) and the warmth default still await rulings.
scale-onramp untouched (sibling Loop A lane).
