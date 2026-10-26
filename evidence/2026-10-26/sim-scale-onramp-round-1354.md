# sim-scale-onramp-round-1354 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261026T1354Z (Mon 2026-10-26). Axis: scale-onramp
(converging, NOT converged). Sibling loop B live on food-economy for
the whole run (1345Z claim, sim-inflow-b + sim-rotsucc-b) — NOT
touched. Loop B landed mid-run as 86deaa04e (inflow DIAG-NO-GO +
rotsucc PILOT NO-GO + coordinator evidence); zero file overlap with
this run's arms, no src/js or policy delta in its merge, so the
rebaseline table measured on e8f2ccad7 stands for the new master
too (drift proof re-run green on the landed files).

This run worked scale-onramp's next blanks in order from the 1230Z
run, skipping the steve-call blanks (1) choice-price ruling, (2)
met-below-line finishing ruling, (3) melt ruling — not re-measured:
(4) 1815-control re-baseline (backlog 1108) as arm 1;
(7) same-instance display-name changes (backlog 1109) as arm 2.
Blank (5) narration variety stays deferred behind the re-baseline
and behind a ruling (defnarr proposals need a ruling before any
narration arm implements them).

Pre-registration (both arms, binding — judged only against these):
- Shared substrate: tableseat-nowait (LEANLINKRESCUE=1 +
  TABLESEATNOWAIT=1, seat legs only, no wait leg), seeds
  73671–73678, 180d death-aware horizon.
- Arm 1 DIAG-GO iff: det-gate passes (or neutrality proof),
  corpus complete 8/8, published baseline table with per-seed
  rows + base commit + competent.js digest, drift quantified vs
  the 1815 control AND the 1230Z ac98043a band with a
  plain-words verdict (continued / stabilized / reversed), and
  a metric review section. DIAG-only, zero src/js.
- Arm 2 DIAG-GO iff: both instance chains traced
  meeting-by-meeting with dates/names/reporters, mechanism named
  with code citations and the specific intervening event(s)
  identified (or a proven-negative), a plain-words verdict
  (bug vs legitimate knowledge-gated evolution vs reporter-side
  state) plus exactly what defnarr proposal 3 would need to pin,
  quoted transcript/codex reads, and a metric review section.
  DIAG-only, zero src/js, no proposal-3 implementation (ruling
  pending).

## Arm 1 — sim-rebaseline-a-1354: DIAG-GO (STABILIZED)

Landed as coordinator commit ef57bac0f (see landing note below
for why the names are -1354, not the worker's in-place
supersession). Evidence: evidence/2026-10-26/sim-rebaseline-a-1354.md
+ corpus evidence/2026-10-26/perseed-sim-rebaseline-a-1354/
(8 rebaseline rows + 8 plain rows + summary.json) + proof
scripts/test-rebaseline-drift.js (PROOF: PASS on the worker tree
and on the landed -1354 files; exit 0 both times).

New authoritative control table (base e8f2ccad7, n = 8):
wins 2/8, national-ever 7/8, national-final 3/8, table
(waiting) 3/8, entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8,
median survival 174d (days 97/106/116/160/174/175/177/180),
mixed deaths 327, starvation 1, raids 101, raiders 423,
pool 1,640, pool wave-3+ 202. Substrate digests:
competent.js b0adaacc (same "true-current" digest the raidpool
arm recorded — the substrate did not drift under this run),
leanlinkrescue.js 53f310ab, tableseat-nowait.js a11a1abc,
test-rebaseline-sweep.js d0651d5c.

Drift verdict: STABILIZED, with exactly one seed's exception.
Seven of eight seeds reproduce their ac98043a rows exactly on
every compared field (trajectory AND raid/pool census). The
entire band movement since ac98043a is seed 73676 alone:
156d village-lost (64 deaths) -> 160d won through the table
(55 deaths); every band delta is exactly that seed's delta
(wins +1, deaths -9, table +1, entered +1, raids +3,
raiders +16, pool +88, poolW3 -23). Wall numbers did not move
at all (national-ever 7/8, wave-4 6/8, wave-5 0/8, median
174d — same on ac98043a and here). Against 1815: wins -2,
deaths +93, median +39d. Against the 0126Z table (deaths 260,
wins 4/8, median 143d): wins -2, deaths +67, median +31d.
One moved seed is now the measured noise floor: a future arm
that re-runs this band on a later base and finds more than one
seed moved should treat that as fresh drift, not noise.

Proofs: det-gate PASS (73671: 177/177/ts86, recorders-OFF
identical); all 8 plain (recorder-free) rows reproduce their
rebaseline rows EXACTLY on every trajectory field — proof
290/290. The harvest does not perturb trajectories.

Corrections and deviations (stated, not hidden):
- The brief's ac98043a figure "deaths 332" does not match the
  in-tree corpora. Both 1230Z corpora (woundprice and defnarr,
  identical rows) sum to 336 deaths. This evidence uses the
  corpus value 336 throughout; the drift arithmetic reconciles
  exactly against it.
- Instrument deviation: the worker used
  scripts/test-rebaseline-sweep.js verbatim (the rebaseline
  instrument) instead of the brief's test-defwound-diag-sweep.js,
  because the defwound sweep would have written a summary.json
  in an incompatible format that breaks the committed proof
  test scripts/test-rebaseline-a.js; a defwound-sweep detgate
  run in the session also printed PASS (177/177/ts86),
  corroborating that the two instruments agree on this base.
- Balanced panel (§15): ATTEMPTED AND NOT APPLICABLE (same
  recorder-corpus limitation as prior arms — balance-panel.js
  has no corpus-ingest mode; it generates panels by re-running
  sims under its own observer). No panel file produced or
  faked; the paired identical-seed table is the comparison of
  record.

Coordinator landing note (arm 1): the worker's evidence was
written as an in-place supersession of the 0126Z run's file
(evidence/2026-10-26/sim-rebaseline-a.md, commit de4bd3fbe),
against two coordinator corrections directing -1354 names
(first correction sent before the worker's sweep finished;
second, interrupt-flagged, after its sweep wrote into the old
directory). The worker's supersession rationale — the 0126Z
file's own "table is re-stated, not silently carried" note —
is recorded in its evidence, but the coordinator direction
stands: per-run evidence files are the audit trail and are not
overwritten. The worker then stalled ~45 minutes at the commit
step with no commit and no reply to a coordinator status
query, so the coordinator closed the worker and landed from
its worktree content: the worker's text + corpus + drift
script, copied verbatim except the mechanical corpus-directory
rename (perseed-sim-rebaseline-a -> perseed-sim-rebaseline-a-1354)
plus a coordinator landing note at the top of the -1354 file.
The landed drift script carries the same single path rename
and passes (PROOF: PASS) on the landed files. The 0126Z file
and corpus are untouched on master (verified: git status
after the landing commit shows no modification to them).
The worker's branch (sim-rebaseline-a, uncommitted) was NOT
merged; its content lives on master only under the -1354
names. The worker's tree is left registered for release and
removal below.

## Arm 2 — sim-displayname-a: DIAG-GO

Merged aa15d2e1e (rebased cleanly onto ef57bac0f, trace proof
re-run ALL CHECKS PASS post-rebase and on merged master).
Evidence: evidence/2026-10-26/sim-displayname-a.md + probe
evidence/2026-10-26/perseed-sim-displayname-a/s73675-probe.json
+ scripts/test-displayname-probe.js + scripts/test-displayname-trace.js.
Zero src/js diff, no [needs-eyes].

Verdict: the name changes are LEGITIMATE KNOWLEDGE-GATED
EVOLUTION, not a bug and not reporter-side state. Each monster
type changes its news name exactly once per run: from the
System's true name to the name the village voted for. The two
73675 changes are two separate village votes concluding on
consecutive nights — day 79 for the voice-mimic radio
("The Loud Beast", tally 6/1/1), day 80 for the hushwolf
("Big-Eyes", tally 6) — which is why both chains first show
their new name on day 81. Mechanism, exhausted by code
citation: monsterNoun's inputs are exactly three — codex
villageName, systemArrived, static monster data. Data never
changes mid-run; systemArrived flips false->true once (day
7+, before both chains start); villageName is set once, in
exactly one place (game.js:22205, monsterNamingCheck, which
returns early once set). So a mid-run name change can ONLY be
the villageName assignment. Same-reporter confirmed (Nina:
Static d74 -> Loud Beast d81; Meera: Hushpuppy d22 ->
Big-Eyes d81), and the switch is type-level, not
instance-level (every hushwolf on 73675 reads Hushpuppy
before d81 and Big-Eyes from d81; switch day varies across
seeds: 25, 17, 81, 22, 103, already-switched, never — a
per-type debate, not a fixed global day). A nuance: villagers
had fought hushwolves since d17, but the codex entry — and
therefore the debate — only appears on d76; defender fights
by villagers do not themselves register the type in the
codex. Which registration action fired on d75/d76 is unpinned
(entry creation is not itself logged) but is not needed for
the verdict. Consequence for defnarr proposal 3 (pin the
first name per instance in awayNews): the pin target is now
exactly specifiable — the name in force at the instance's
first news appearance — but the proposal still needs its
ruling before any narration arm implements it, so this arm
changed no code.

## Wall numbers (this run's judged corpora)

national-ever 7/8 (final 3/8), table entered 2/8 (waiting
3/8), wins 2/8, wave-4 6/8, wave-5 0/8, median survival 174d.
The wall stands on the fresh baseline exactly where it stood
on ac98043a. scale-onramp stays converging (NOT converged):
wins still come only through default-OFF courtship + seat
instruments, only through the lesser seat, the full seat is
still unreached, and wave 5 still has zero births. The
standing directive stands until the tracker records this axis
converged on measured evidence. Next blanks, in order:
(1) Steve's ruling on the choice-price gap (carried);
(2) Steve's ruling on met-below-line finishing (carried);
(3) melt ruling for Steve (carried); (4) bisection of the
73676 flip — why one village's collapse became a table win
(new, from this run's STABILIZED verdict; the drift cause is
unbissected by design here); (5) defnarr proposal 3 now
specifiable from the displayname mechanism, still needs its
ruling before implementation; (6) defender/wait narration
variety design from the defnarr proposal (carried, ruling
pending); (7) 1815/0126Z tables superseded — future arms
judge against the -1354 table (base e8f2ccad7) or re-baseline
first. food-economy stays converging (untouched; sibling
loop B). Rotation left at 3 (convergence work does not
cycle it).

## Telemetry deviation check

Ran node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-26/perseed-sim-rebaseline-a-1354/*.json'
--metrics national,table,wins,exiled. 3 LOUD lines:
national 12 -> 0, table 16 -> 6 (-62%), wins 16 -> 0
(n = 17 files). All three are the known ingestion-shape
artifact class: the checker reads top-level national/wins
keys that recorder rows do not carry (rows carry
nationalEver/won/table), and the glob counts 17 files (8
plain + 8 rebaseline + summary), double-counting the band.
Actuals on the landed corpus (drift proof): national-ever
7/8, wins 2/8, table waiting 3/8. Baseline NOT rolled; no
new investigation. (The rebaseline worker's note that it did
not run telemetry-check on recorder rows is noted; the
coordinator ran it per the run body's step 10 and reached
the same artifact verdict as prior runs.)

## Metric review (§14 — binding, no mid-run re-scores)

No pre-registered leg was re-scored mid-run for either arm.
Arm 1 was judged against its five DIAG-GO legs (all pass);
the 332 -> 336 figure is a corpus-against-prose correction,
not a re-score (the corpus is the authority). Arm 2 was
judged against its five DIAG-GO legs (all pass). The
coordinator's -1354 rename is a landing decision about file
identity, not a metric change: the numbers, tables, and
proofs are the worker's, byte-identical apart from the
corpus-directory path. The worker's in-place supersession
choice is recorded above as a process disagreement, not
hidden and not ratified by silence.

## Infrastructure

- Master moved once under the run (loop B 86deaa04e, zero
  overlap, no src/js or policy delta); both branches rebased
  or landed cleanly onto it, proofs re-run after every
  rebase and on merged master.
- Safe-commit index clobber hit the coordinator's rebaseline
  landing commit (all 19 files showed staged-as-deleted
  post-commit, worktree files byte-identical to HEAD) —
  repaired via HEAD-blob cacheinfo, commit verified correct,
  index verified clean after repair (git status empty apart
  from the stray file below, git diff HEAD empty, hash
  matches).
- No EPERM flap blocked this run's commits (the rebaseline
  worker's commit stall is unattributed — it never replied
  to the status query — and is recorded as a stall, not
  attributed to the flap without evidence).
- Stray file (NOT this run's, left alone, reported loudly):
  evidence/probe-eperm.txt (0 bytes, created 14:49Z) sits
  untracked in the main tree. It is not from this run's
  arms (neither worker touches the main tree; neither
  coordinator step wrote it). It was present before this
  run's landings and is still present at closeout, so the
  main tree is NOT clean at closeout for that one file.
  Next run or the owning lane should identify and remove
  it; this run does not delete another lane's probe.
- check.js --quick NOT re-run: zero src/js in either arm,
  arm proofs green on merged master, and sibling loops were
  live for most of the run (a --quick result would have
  been unattributable).

Merged locally, pending ship. Do NOT push, do NOT bump —
the batch ship job (oversight-ship-loop, every 6h) owns
version bumps, pushes, and live verification.
