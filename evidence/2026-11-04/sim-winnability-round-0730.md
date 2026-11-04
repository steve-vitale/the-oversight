# Loop B 0730Z — winnability-chain round: stale-lock recovery + standacc adoption + diplomacy pilot (merged locally, pending ship)

Run: fleshout-loop-b-20261104T0730Z. Axis: scale-onramp (winnability-chain
re-point, Steve 2026-11-03 21:13). Coordinator evidence; arm evidence files
are cited, not duplicated.

## Run-start state (stale-lock recovery, not a fresh start)

- Previous Loop B run 0550Z was DEAD by every check: its worktree heartbeat
  (sim-standacc-b) 06:15:27Z (~80 min stale at run start), no standacc/tog
  processes alive, no standacc worktree files newer than 06:15Z. Its lock
  (created 05:45Z) and claim were retired (claim -> .DEAD with a note).
  Its tog-rescreen arm had already landed on master (d9f8678a8, merged
  ~07:06Z: GEAR CREDITED 3/8, SIGDMG 0/8, TRICKHOLD 1/8, fresh seeds
  89801-89808). Its standacc arm was stranded at pilot (branch
  sim-standacc-b, tip c710a3eaa, 3 commits, clean worktree) and is adopted
  by this run. Its veteran-narration backlog item was already appended to
  sim-findings.md by the dead run itself (line 1674); not re-appended.
- Loop A 0545Z (vfrac/hurthome, food-economy) was ALIVE at run start — a
  live vfrac sweep process was running in sim-vfrac-a despite stale
  registry heartbeats — and was NOT touched. Loop A landed hurthome
  (62a54edf9) and vfrac (33900dfaa, INSUFFICIENT-DATA) under this run;
  both arms rebased clean over those landings. Fleerepair confirm stays
  Loop A's next job; not duplicated here.
- Pre-flight: main tree clean at run start, disk 32%. Worktree
  registration was slow (~10 min for two trees, matching the known
  ~6.5-min precedent); no failure.

## Arm 1 — sim-standacc-adopt-b (adoption landing, no new sims)

Stranded 0550Z arm, landed unchanged in substance: branch
sim-standacc-adopt-b created from stranded tip c710a3eaa, rebased onto
current master (twice by the worker as master moved; final base
62a54edf9), proof `scripts/test-standacc-20261104.js` 11/11 PASS
post-rebase and again on merged master. Zero src/js diff vs master.
Merged ff-only as 6beb070d5 (prereg) + b45628625 (instruments) +
43b9830fb (pilot + evidence + analyzer/test fix). Arm files verified
byte-identical to the stranded branch before the old tree/branch were
released (done-merged) and deleted. No pilot re-run (already judged;
re-running is forbidden). No check.js --quick re-run: zero src/js, and a
concurrent jest run would violate the no-concurrent-jest rule while the
diplo worker ran.

Pilot verdict preserved (not re-judged): named missing income is
DIPLOMACY (funnel 0/0/0 on all 8 seeds); release blocker on the closest
seeds is VETERANS, not standing (3 seeds clear capped 200 — 99101: 210,
99104: 270, 99105: 215 — yet never release, 53 ready-but-unreleased days
held on veterans 100% of the time; no seed ever holds 2 living veterans).
Plenty cap never binds (shave 0/8); war headroom vast (48-57 points); no
sink (zero negative component deltas). Verdict per prereg bar:
DIAG-NO-CANDIDATE (traced 5/8 < 6/8, with the recorded denominator flaw:
no-gap seeds untraceable by construction). NO gate/price/deed change
follows from this evidence.

Wall (standacc pilot corpus, 8 seeds, 140d, competent): wins 0/8,
national 0/8, table 0/8, wave-5 unlocks 0/8, wave-5 faced 0/8, wave-4
faced 6/8, wave-4 unlocks 6/8, readiness-5-ready days 0, median survival
107d (max 140, censored), 7/8 villages lost.

## Arm 2 — sim-diplo-b (diplomacy-pipeline pilot diag, zero src/js)

The standacc evidence's named next blank. Prereg committed before any
judged sim (7ead15880 after rebase); instruments + proof 23/23
(918d6da9b); pilot + context legs + evidence (b5bb17ddd). Rebased onto
current master 33900dfaa clean, proof 23/23 post-rebase and on merged
master, merged ff-only. Zero src/js diff. Worktree clean at handoff;
tree released done-merged, branch deleted.

Verdict: DIAG-NO-CANDIDATE per the prereg bar as written (furthest-stage
majority 4/8 S2 + 4/8 S1, below the 6/8 bar) — but the named cause is
unambiguous and uniform: S4, the proposal verb never fires under
competent play. Competent contains zero propose/knowsVillage/
otherVillages references (leadcourt's header states competent "contains
zero scale code by design"), and no engine or villager path proposes in
its place. Upstream stages all move: villages exist (3-4 at day 1, up to
8 with splinters), become known days 4-45, opinion climbs from 2 via
broadcast deeds to 10+ on 4/8 seeds (best 40). Trust, seasoning, and the
polity filter are unreached, not failed. The evidence file's metric
review proposes the corrected bar (first all-zero stage, which would
read DIAG-GO at S4, 8/8) — NOT applied in-run, per metric binding.

Travel exonerated as the binding cause: the judged leg has 0
village-tile days despite 57-433 travelTo calls/seed, but context legs
prove travel is off the critical path — leadcourt forms links with 0
village-tile days and 0 codex studies, while long-horizon seed 99405
stands on village tiles days 50-52 and still proposes nothing.

Context legs (diagnostic only, not pooled): (c1) leadcourt 99401-99404:
12 proposals -> 12 links (11 direct accepts + 1 counter-accept that
flips Haven into subordinate, a BELONG link). Links season on schedule
(30 days, trust 30 -> 40+ via tending). Regional+ diplomacy is
all-or-nothing at 3 seasoned links at once: 102 while all three hold,
0 the day one drops (99402 d89, 99403 d117). 99402 is the only wave-5
unlock in all 16 seeds (peak 5, capped 200 via war alone, diplomacy 0
at end). (c2) competent 99405-99408, 180d cap: all lost before cap
(37-84d), 0 proposals, 0 links. Time does not supply the missing verb.

Wall (diplo judged leg, 8 seeds, 140d, competent): wins 0/8, national
0/8, table 0/8, wave-5 unlock 0/8, wave-5 faced 0/8, wave-4 faced 4/8,
wave-4 unlock 4/8, ready days 0, median survival 59d (max 123d), 8/8
villages lost. Deaths 343, 62% combat. 0 instrument errors on all 16
seeds. Instrument note (recorded, not a game finding): the say-line
sample over-catches COUNTER LEARNED / keepsake-bond lines; sense
numbers use a strict recount.

Precise next blank (no fix in this run): a competent-plus-ask arm (or
panel-scale proposing policies) judging whether diplomacy standing then
flows and holds — plus two named sub-questions: (a) polity fragility
(does tending keep 3 links seasoned simultaneously over a full season,
or is the all-or-nothing threshold the next stall?); (b) LEAD-vs-BELONG
shape reporting (1/12 context proposals flipped via counter-accept).
NO gate/price/deed arm follows from this evidence.

## Reachability verdict (both arms, plain words)

The village can reach the wave-5 door's standing number — three
standacc seeds clear 200 — but the door still never opens, twice over:
nobody ever holds two living wave-4 killers at once, and under the
baseline competent way of playing, nobody ever even asks another
village to link. The wall is not a number to lower. It is a missing
verb (proposing) and missing living veterans. When a policy does
propose, the whole pipeline works end to end, which is what makes the
missing verb the finding rather than a broken pipe downstream.

## Village assessment (plain words)

Standacc villages lived a median 107 days and mostly got far enough to
see wave 4 (6/8) but banked no veterans; diplo villages died younger
(median 59 days, all 8 lost) and never met the scale game at all — no
proposals, no links, no diplomacy income, wave 4 faced on only half.
What is missing is not food or gear or standing points. It is villagers
who go and ask, and killers who live long enough to count twice.

## Telemetry deviation check

Refused on both corpora by the tool itself: all 8 standacc rows and all
16 diplo rows carry top-level anchorCommit, so they are sweep recorder
rows, not runs, and the tool will not compare a recorder corpus against
the WINSEAT run baseline. Classified as a field-shape artifact (same
class as past runs' regime artifacts); baseline NOT rolled, no
investigation item. Forcing it with --allow-recorder-corpus or reseeding
the baseline from a diag corpus would corrupt the baseline; neither
was done.

## Findings backlog

4 diplo items appended to hidden_files/sim-findings.md (competent never
proposes/travels/studies; all-or-nothing 3-link diplomacy; counter-accept
LEAD->BELONG flip; say-line over-catch). The standacc narration item
was already present from the dead run; not duplicated.

## Infrastructure

- Registry-lock contention (not a failure): the diplo heartbeat loop's
  first beat queued behind Loop A's hurthome release holding the lock;
  it landed once the lock cleared. The adopt release queued behind
  long-running reaps (~11 min); completed clean. No other lane's
  process was touched.
- Safe-commit index clobber hit all three commits on both workers
  (bogus staged deletions); repaired each time via HEAD-blob
  update-index --cacheinfo, commits verified correct. Coordinator
  commit below checked the same way.
- Master moved 4+ times under this run (journey landings, hurthome,
  vfrac, succession r123); both arms rebased clean, zero file overlap,
  proofs re-ran green after every rebase and on merged master.
- Scale-onramp stays converging (NOT converged): the full seat is still
  unwon, wave-5 kills still 0, and the two binding blockers are now both
  named (missing proposal verb, missing living veterans). Food-economy
  untouched (sibling Loop A). Claim deleted; lock deleted.

Merged locally, pending ship (standacc adoption 6beb070d5, b45628625,
43b9830fb; diplo 7ead15880, 918d6da9b, b5bb17ddd; coordinator evidence
this file).
