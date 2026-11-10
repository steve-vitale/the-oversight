# Loop B 0330Z — adoption run: dead 0122Z run's three arms landed (trustgrowth + wave5face + approachretest)

- Run: fleshout-loop-b-20261110T0330Z, axis scale-onramp (winnability chain), converging, NOT converged.
- Master at run start: 465802a90. Master at closeout: 709c525ed. All three arms merged locally, pending ship. No push, no version bump, no live verification by this run.

## STALE-LOCK RECOVERY at start

Lock fleshout-loop-b-20261110T0122Z was 127 min old at 03:29Z (created 01:22Z).
Its three trees' heartbeats were all stale past the 15-min guard: sim-trustgrowth-b
02:24Z (65 min), sim-wave5face-b 01:54Z (95 min), sim-approachretest-b 01:42Z
(107 min). Zero live processes in any tree; no writes since ~02:24Z. Per the
guard the run is DEAD no matter how fresh the lock looks; the lock was deleted,
the 0122Z claim retired to .DEAD with a note, and this run adopted all three
arms. Loop A live on food-economy the whole run (claim fleshout-20261110T0216Z,
arms medheadcount-confirm-a + wallbase-a + pair-b98e3ef-a + metricfix-a) — NOT
touched. sim-ctraj-b unregistered + dirty + locked — NOT touched. Pre-flight:
main tree clean, disk 32%, worktree-reap ran (8/16 active, no removals).

## Arm 1 — sim-trustgrowth-b (DIAG-GO, LANDED 4de07449c)

Trust-growth + polity probe on the standaccum band 99101–99108 (competent,
150d, re-use recorded in prereg). 5 commits + 1 coordinator SHA-refresh
commit (4de07449c, "evidence: rebased SHAs (post-rebase 465802a90)").
Proof `scripts/test-trustgrowth-b.js` 10/10 PASS post-rebase AND on merged
master (re-run by coordinator after the SHA-refresh commit). Corpus 18 files
(8 v1 shakedown + 8 v2 judged + 2 summaries), 138/138 link-days reconciled,
0 residue, instrument errors 0. Evidence:
evidence/2026-11-09/sim-trustgrowth-b.md.

Finding, in plain words: nothing the village does on purpose moves link
trust up under competent play, because competent play never does any of it.
The only growers that fire are the two automatic ones — weekly tribute (+1)
and the neighbor's unannounced aid (+4 per accept, 34 accepts, +136 total).
Everything built for growing trust — tending the bond (+8/week), answering
the first-gesture accord (+4..10, pending from formation day to death on all
8 seeds), answering renegotiations (7 silences × −6) — goes unanswered. While
trust creeps up by ones and fours, it falls by eights and fives: succession
haircuts −195 (27 × −8), titan night-strikes −127 (28 strikes). Net −159
across 8 links. One link seasoned (99104, 28 days, trust 42–45) and scored
nothing — a polity needs 3 seasoned subordinates and the band never forms a
second link. 0 polities on every road on every day. The diplomacy road isn't
broken. It's unanswered mail.

Wall (this pilot, reproduces standaccum-b exactly — the non-perturbation
proof): wins 0/8, national 0/8, table 0/8, wave-4 unlocks 7/8, wave-5
unlocks 1/8, median run-days 132. The wall did not move on this run.

Named next blanks (from the arm, not built here): (1) answer the mail — a
build arm that answers pending beats and tends weekly (leadcourt already does
both, under its own pantry gates), measured for seasoning rate, polity
formation, survival cost; (2) second-link road — a link-raise staging
recorder first, to learn whether second raises are never staged or staged
and lost; (3) succession + titan as decay drivers is a STEVE-CALL (the −8
funeral haircut and −5 night-strike are the price of a bond), not a lever to
quietly soften.

## Arm 2 — sim-wave5face-b (DIAG-GO, LANDED 709c525ed)

Wave-5 facing instrument on the vetfinish band 99641–99648 (competent, 150d,
re-use recorded in prereg). 4 commits (prereg, instrument + proof 63/63,
Correction 2 + corpus + evidence, landing section). Proof
`scripts/test-wave5face-b.js` 69/69 PASS post-rebase AND on merged master
(63/63 at instrument commit, +6 from Correction 2 fixture E3). Corpus 16
files (8 on + 8 off neutrality legs), instrument errors 0; neutrality
identical on all 8 seeds under the corrected bar. Evidence:
evidence/2026-11-09/sim-wave5face-b.md.

The dead worker left the tree dirty (prereg + test + analyzer modified,
corpus untracked). The adoption worker read every hunk and re-ran BOTH
analyzers on the identical corpus before judging: Correction 2 (TB join rule
— startCombat removes the world monster at the first TB fight, so later
fights are re-engagements to +3 days) moves attribution only — unmatched TB
traces 15 → 0, ambiguous 0 → 7, every spawn outcome, meeting outcome, wall
number, and DIAG-GO bar identical under both analyzers. No deciding bar
moved after the judged run; the sweep was NOT re-run. The births filter
(133 → 13 wave-5 births) is a counting bug fix; the corpus-reader exclusion
of off legs is correct per the prereg.

Finding, in plain words: four of eight villages earned the release and held
it 29–55 days each. The fifth wave walked through the door: 25 Producers
spawned, villagers met them 75 times, and nobody killed one. Veterans met
wave 5 sixteen times — 0 kills, 11 deaths, 5 flees. The beasts hit for 20–50
damage a round through armor while a villager's strike takes 13–23 off a
beast with 1000–1600 health; a kill would take fifty to eighty good rounds
and the fighter dies in one to three. One village ground a Cancellation to
8 health across three fights in one day — and the scholar died all three
times. The chain binds at the wave-5 kill — past release, veterans, and
meeting.

Wall (judged corpus, 8 on-legs): wins 0/8, national 0/8 (regional 8/8),
table 0/8, wave-4 unlock 8/8, wave-5 unlock 4/8, wave-4 kills 27 (field 9),
wave-5 kills 0, scholar deaths 86, median survival 116.5d. Same-band
comparison (vetfinish before-leg): identical wall numbers — a finer
instrument re-measuring the same villages, nothing moved.

## Arm 3 — sim-approachretest-b (NOT RUN — verified instead, LANDED 1f1d3dabb)

The #1709 guardrail re-test brief was stale: the re-test was already run
twice on the exact band, horizon, variant, and cost bar (approachguard-b
NO-GO, approachlive-b NO-GO replicated), and #1708 live firing was already
proven by direct counter (marks 5, repicks 3). This arm verified instead of
running a third replication: gated code still exists verbatim on current
master; both prior panels' guardrail numbers re-derived exactly from their
per-seed corpora; direct-counter totals re-derived exactly; live firing
fight read from the corpus for its own sense-test. 1 commit (evidence +
proof). Proof `scripts/test-approachretest-20261109.js` 28/28 ALL PASS
post-rebase, sibling `scripts/test-approachlive-20261105.js` 10 checks ALL
PASS. Evidence: evidence/2026-11-09/sim-approachretest-b.md.

Verdict stands: combined variant NO-GO (guardrail breach, replicated twice);
the fallback mechanism is not killed. Findings #1709 closed, #1708 reframed
(see Findings below). No third re-test of this band without a new lever.

## Scale-wall numbers (this run)

| metric | trustgrowth band 99101–99108 | wave5face band 99641–99648 |
|---|---|---|
| wins | 0/8 | 0/8 |
| national reached | 0/8 | 0/8 |
| table reached | 0/8 | 0/8 |
| wave-4 unlocks | 7/8 | 8/8 |
| wave-5 unlocks | 1/8 | 4/8 |
| wave-4 kills | — (not instrumented here) | 27 |
| wave-5 kills | 0/8 | 0/8 |
| median survival | 132d | 116.5d |

Full seat 0 everywhere. The winnability chain on the measured bands now
reads: wild ally-join → wave-4 kills (live, 9 field) → veterans (up to 3
living, live) → readiness-5 release (4/8, 29–55 days, live) → wave-5
facing (25 spawns, 75 meetings, live) → **wave-5 kills (0 — the binding
link)** → national/table (0/8) → full seat (0/8).

## Village assessment (plain words)

Eight villages held one friendship each and never answered its mail; eight
villages opened the wave-5 door and could not dent what came through it.
The two pictures are the same village from two sides: the bonds are real —
tribute arrives every week without fail, neighbors walk in with grain, the
release is earned and held for a month — but nothing in Haven tends the
bond, and nothing in Haven can hurt a Producer. A link is born at trust 30,
climbs to the high thirties on aid and tribute, and funerals take it back
down. A veteran kills a wave-4 beast, banks, releases the village — and
then meets a 1600-health Cancellation that hits for 40 a round and dies in
one to three rounds. The villages aren't hostile to diplomacy or cowardly
in front of wave 5. They just never answer the mail, and they cannot close
the kill.

## Metric review (§14 — for the NEXT run, no in-run re-scoring)

- Wave5face Correction 2 is a measurement fix, not a re-score: both
  analyzers agree on every outcome and bar. The prereg's metric-review
  question is answered: the mid-day join produced 7 ambiguous matches, all
  on 99641, all honestly counted separately. The `wavesFaced[5]` prereg
  read was a shape error (keyed by monster id, not wave) — future preregs
  should name the mid-keyed read. Median convention: wave5face prints 117
  (upper median), vetfinish 116.5 (mean of middle two) — same days; this
  file reports 116.5 for comparability.
- Trustgrowth: the DIAG-GO bars held up (trajectory classes 6/1/1,
  138/138 reconciliation, polity-blocking 7/1 split). Instrument v2 (setter
  + seq intervals) is the story: the v1 premise ("every gain routes through
  _trustGain") was false, caught by the pilot before any verdict. Day-matched
  reconciliation is wrong whenever settlement-phase moves exist.
- Approachretest: the non-run is itself a metric-review datum — the queue
  carried a stale item drafted from the 2026-11-04 state. The starvation-
  totals bar's noise is now a three-panel fact (baseline 6 → 1 → 1; armed
  7, 7, 6; armed median 83d every time). Any future guardrail
  pre-registration on this band should report absolutes alongside the
  relative bar; any floor needs coordinator/Steve approval in advance.
- No balance panel (§15) on any arm: the panel takes no corpus input
  (same precedent as grind-a / finishersize-a / adopt-a / vetfinish-b);
  the pre-registered classifications ARE the comparisons (identical seeds,
  same bands as the before-legs).
- TELEMETRY DEVIATION CHECK (run-book step 10): attempted on the wave5face
  corpus — REFUSED ("refusing recorder-corpus input: all 16 --current rows
  carry top-level anchorCommit"). Same precedent as vetfinish/grind-a; the
  baseline was NOT reseeded, no investigation item. Wall numbers above are
  reported directly from the measured per-seed fields.

## Infrastructure

- Master moved twice under this run from sibling lanes (Loop A pair-b98e3ef-a
  was already at tip 465802a90 at run start; no further moves during the
  landings — each branch rebased onto the explicit SHA read immediately
  before, proofs re-run green after every rebase and on merged master:
  trustgrowth 10/10, approachretest 28/28 + sibling 10/10, wave5face 69/69).
- Safe-commit index clobber hit the trustgrowth coordinator SHA-refresh
  commit (MM variant — repaired via HEAD-blob `ls-tree | update-index
  --add --index-info`, blobs hash-verified) and twice on the wave5face
  adoption commits (same repair). Commits always correct; main tree clean
  at closeout.
- No EPERM flap this run. `check.js --quick` NOT re-run: zero src/js in
  all three arms; the standing profile was just recorded by sibling runs
  (296/4, pre-existing).
- Minor warts recorded, not fixed: (1) wave5face per-seed table prints
  99645 release days as "d56–111" but the village died d110 — should read
  d56–110 (count 55 is correct); (2) the trustgrowth tip commit message
  still reads "(post-rebase 6823cf106)" — it refers to the dead run's
  rebase, not the final 465802a90 rebase; the evidence file's SHAs were
  refreshed in 4de07449c, the message was left (rewriting it would need a
  history rewrite for a label).

## Findings for the coordinator (filed in sim-findings.md at closeout)

- #1709 CLOSED (re-test done twice, NO-GO replicated — approachretest-b).
- #1708 REFRAMED (live firing proven; the open item is now the COMPARATIVE
  kill claim, needing a baseline-screened band — approachretest-b).
- #2032 ANSWERED (trustgrowth-b: trust grows only on aid + tribute under
  competent play; decay is funerals + night-strikes; 1 seasoned, 0
  polities). Next blanks appended: answer-the-mail build; second-link road
  recorder.
- Wave-5 damage mismatch (binding link, measured); repeated failed Walk-In
  vs wave 5; ranged weapons without ammunition; 2 unmatched network_note
  field meetings (spawn path bypasses spawnWorldMonster or tag lost);
  wanderer-pipeline leak (10/13 births never spawn); one-point-short 199
  standing (Steve-call, not a lever claim). Say-line "trust" is two numbers
  (link trust vs village opinion).

## Landing

- 4de07449c sim-trustgrowth-b (6 commits: prereg, instruments, amendment,
  pilot v2 + evidence, rebased-SHAs ×2) — DIAG-GO.
- 1f1d3dabb sim-approachretest-b (1 commit: evidence + proof) — NOT RUN,
  verified instead; NO-GO stands.
- 709c525ed sim-wave5face-b (4 commits: prereg, instrument, Correction 2 +
  corpus + evidence, landing section) — DIAG-GO.
- All merged --ff-only, ancestor-verified, trees released done-merged,
  branches deleted, main tree clean at closeout. Merged locally, pending
  ship. No push, no bump, no live verification.
