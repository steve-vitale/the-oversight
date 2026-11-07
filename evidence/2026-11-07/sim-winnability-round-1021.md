# sim-winnability-round-1021 — adoption round, axis food-economy (run fleshout-2026-11-07T1021Z)

## Pre-registration (adoption run)

- **Run:** fleshout-2026-11-07T1021Z, Loop A. Axis **food-economy** (topmost axis
  not `converged` and not named in any live claim — Loop B 0930Z held
  scale-onramp at run start; it has since landed, and a new Loop B run 1049Z
  holds scale-onramp now; neither touched).
- **Nature:** ADOPTION of the dead 0715Z run, not a fresh lever round. No new
  lever was played. Each arm is judged on its OWN pre-registered bar (from its
  own prereg, committed on its branch), not on a fresh threshold set here.
  - Arm 1 sim-lingergorge-a — prereg d27008afd: regression-verification of the
    landed gorge gate 6aeba1c88 on current master, revised metric, BEFORE any
    judged sim. Verdict rule: both proof tests green + census bar met.
  - Arm 2 sim-mootsummon-a — prereg 32fddd1c0 (re-pin): diagnosis+fix already
    landed (2026-11-06 mootsummon-a DIAG-GO + mootgate-a fix e53e86531),
    verify fixed shape on current master; pilot 48001–48008, deliberate reuse.
- **Explicitly NOT claimed:** sim-finishersize-a — the main session is landing
  it (r3 gate running at run start; tree re-registered as sim-finishersize-r3
  after the 04:28Z reaper removed sim-finishersize-a mid-gate — see
  Infrastructure). sim-capabledeed-a already landed 32d79b713 (#1834 fixed).

## Stale-lock recovery (run start)

- Lock read before delete: `fleshout-2026-11-07T0715Z`, created 07:24:22Z,
  ~3h old at recovery (>90-min fallback). Claim retired to `.DEAD` with
  disposition note.
- Why dead, not live: coordinator timed out ~03:20 CST (main-session log);
  arm-tree heartbeats 85+ min stale (lingergorge/mootsummon 09:00:22Z,
  finishersize 06:28:47Z); no live coordinator/worker procs in its trees.
  The only live proc in a 0715Z tree was the main session's finishersize r3
  gate check — not the 0715Z run. The 0915Z run had correctly stood down at
  09:21Z when heartbeats were only 17–21 min stale; by 10:21Z the picture
  had changed. Disposition: capabledeed LANDED, mootsummon + lingergorge
  ADOPTED by this run, finishersize left to the main session.
- Pre-flight: main tree clean, disk 28%, reaper ran (7/16 active, LOUD dirty
  trees left untouched). Claim written before any sims
  (`lever-claims/fleshout-2026-11-07T1021Z.json`).

## Arm 1 — sim-lingergorge-a (LANDED 2cf4d19f0)

Finding: the lingerer-gorge nightly line fires in stranded windows (findings
line 1792, claimed by the dead 0715Z run). Verification-only arm: the fix
(the gorge gate) was already landed as 6aeba1c88.

- Corpus: found 39/40 after-legs uncommitted (s49001–49039, all parsing
  clean); only s49040 missing. Worker ran it with the unchanged reused
  driver (0 away / 4 haven, 1 haven linger-endDay). Completed legs NOT
  re-run. Corpus now 40/40, committed.
- Numbers (revised metric, firing-time position, 40 seeds 49001–49040,
  60 loop-days): total gorge lines 83 → **212**; away-delivered 3 → **0**;
  at-Haven delivered 80 → **212**; away/haven linger-endDays 2/39 → **0/89**;
  drift-off lines 0 → 0; disagreements/ungrouped 0/0. Power bar passed
  (212 ≥ 20); guardrail (i) passed (212 ≥ 40 — the gorge fires *more* at
  Haven than before, no silencing). Det-gate holds; median daysAlive 60 both
  legs. Before corpus re-pooled exactly (83/3/80/41). Harness-phase lines —
  the exact channel of the 3 before-leg away deliveries — now all read
  atHaven:true. Zero-gorge seeds (12/40) mean no lingerer ever formed, not
  silencing. Empty-pantry variant: 0 lines in the corpus; covered by unit
  B10 instead.
- Verdict at worker handoff: **CENSUS-GO, PROOF-NOT-GREEN** — the only
  failures in test-lingergorge-a (31/33) + test-gorgeharness-a (40/42) were
  the two checks on the shared 15003 loop-day-7 gossip anchor. The worker
  probed the anchor live (seed 15003, 60d): the fact still holds, only the
  pinned day moved (word lines on loop-days 16 ×2 and 39, inside Haven).
  It made no test edits — the same anchor blocks the sibling arm — and
  reported the branch ready to merge with the re-pin as a coordinator
  decision. Merged ff-only as 2cf4d19f0 (prereg + verification commit,
  42 files, evidence + 40-leg corpus, zero src/js).
- **Coordinator closeout of the anchor (this run):** re-pinned the 15003
  anchor ld7 → ld16 in test-lingergorge-a.js + test-gorgeharness-a.js
  (commit 5198d1056, day-only change, no assertion loosened, reason
  documented in the test headers). Re-ran both suites on merged master:
  **test-lingergorge-a 33/33, test-gorgeharness-a 42/42 — GREEN.** The
  prereg's verdict rule is now met in full: CENSUS-GO + proof green.
  Finding #1792 marked [fixed] in sim-findings.md.
- Sense test: every gorge line reads true at the fire; a gated gorge never
  invites a sortie from the wild. One observation (not a finding): the same
  display name can gorge twice in one night with different kcal (distinct
  lingerers sharing a name).
- Secondary deliverable: `state.lastLingererOffer` is **DEAD STATE in the
  shipped game** — writer only in `src/js/havenGrowth.js:275`; readers only
  in sim-bot policies (`sortieretry.js`, `sortietarget.js`) and tests; no
  docs mention it. Appended to sim-findings.md as [open] (not claimed).

## Arm 2 — sim-mootsummon-a (LANDED 674a4140f)

Finding: moot-turns-to-you summons still reach stranded scholars (findings
line 1793, claimed by the dead 0715Z run). Re-pin verification: the
diagnosis+fix already landed; verify the fixed shape on current master.

- Census: **CENSUS-GO** — 0 moot-turns-to-you summons in 4 stranded sleep
  windows on pilot 48001–48008; held case convenes on return. Corpus
  8/8, committed as evidence/2026-11-07/sim-mootsummon-a-repin-corpus/.
- Proof at adoption: **PROOF-NOT-GREEN** — test-mootsummon-a 31/33 +
  test-mootgate-a 58/60, only failures the shared 15003 loop-day-7 gossip
  anchor. Rebase changed nothing (31/33 + 58/60 on base 6a59ed7f).
- **Anchor decision — STALE (day only), re-pinned, NOT a regression.**
  New probe scripts/probe-gossip-anchor-a.js scans every sleep window of a
  live transcript using the proof's own code path. On the current tip,
  6 seeds × 60 loop-days (15003, 48001, 48005, 48006, 48008, 17021):
  21–38 "Word gets around" lines per seed, **26 in-sleep-window word hits
  total, every one inside Haven**. Seed 15003 itself holds 3 — loop-day 16
  (two lines in one window) and loop-day 39. Only the *day* went stale; the
  anchor's form is intact, gossip still fires inside sleep windows
  everywhere, and the moot census never reads gossip. Both proofs re-pinned
  15003 ld7 → ld16 (same seed, ld16 chosen for its two-line redundancy);
  no assertion loosened.
- **Correction to the 0715Z record:** "no re-pin available on 15003" came
  from inspecting the driver's *trimmed* corpus — `trimTranscript` discards
  gossip lines in non-stranded sleep windows by design, so it cannot show
  one. The full transcript the proof reads does hold them.
- After the re-pin, verified green on **three** bases (6a59ed7f, 2cf4d19f,
  38aa62dc): test-mootsummon-a **33/33**, test-mootgate-a **60/60**. The
  judged census corpus was not re-run — the rebase invalidated nothing.
- Verdict: **RE-PIN-GO.** CENSUS-GO stands and the proof is green, so the
  prereg's verdict rule is met in full. Merged ff-only as 674a4140f
  (4 commits: prereg, evidence, re-pin + addendum, adoption note;
  13 files, +732/−15, zero src/js). Finding #1793 marked [fixed].
- Note for the record: the lingergorge arm landed first as PROOF-NOT-GREEN
  on the same shared anchor; the mootsummon re-pin + this run's coordinator
  re-pin (5198d1056) close that anchor consistently across all 4 test
  files. All four suites are green on merged master.

## Wall (this run)

No new win-seeking wall numbers: this was an adoption/verification round,
not a lever round. The judged corpora are measurement instruments, not win
panels — mootsummon pilot (competent-only, SEATDRIVE=0, pre-seat regime):
national/table/wins 0/8, as expected; lingergorge 40-seed harness corpus:
not a win corpus (no national/table/win fields). No village reached
national/table/wins in this run's corpora, and none was expected to.
scale-onramp stays converging (NOT converged); food-economy stays converging
(NOT converged). Next blanks on food-economy, in order: (1) the leg-2
preserver deciding corpus under the governing verdict system (still owed
from 2026-10-24); (2) the away-ration fix (size packs to dayWant, floor/drop
the hunger penalty on pack draws, voice away hunger for low-health
travelers) — needs the case-count-sized confirm first; (3) `lastLingererOffer`
dead-state cleanup (new open finding this run).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-07/sim-mootsummon-a-repin-corpus/*.json' --metrics national,table,wins,exiled` — 3 LOUD lines:
national 12→0, table 16→0, wins 16→0 (n=8). All **REGIME artifacts** of a
competent-only pre-seat measurement corpus vs the WINSEAT baseline — the
known field-shape/regime artifact class recorded by the 1955Z/2115Z/2215Z/
2315Z/0420Z runs. Baseline **NOT rolled**, no investigation item. The
lingergorge corpus is a recorder corpus (gorge-harness JSONs) and was not
fed to the check.

## Metric review

- Adoption runs inherit their arms' prereg bars; no fresh threshold was set
  here and none was needed. Both arms' verdict rules were met in full by
  closeout — but note the sequencing honestly: lingergorge merged as
  CENSUS-GO / PROOF-NOT-GREEN and only became fully green after the
  coordinator's anchor re-pin (5198d1056). The merge order (evidence first,
  anchor fix second) is recorded, not hidden: the evidence file as merged
  says PROOF-NOT-GREEN, and the re-pin commit + the green re-runs close it.
- The shared-anchor shape deserves a standing note: FOUR proof files pin
  the same 15003 loop-day anchor. A substrate drift in that one day fails
  four suites across two arms. The next anchor re-pin should sweep all four
  files in one commit (as this run did, across two commits) — the
  lingergorge worker's "land once, consistently, by coordinator decision"
  call was the right one.
- The 0715Z "no re-pin available" misread is a method lesson: a trimmed
  corpus cannot answer a question about the lines the trim discards. Anchor
  probes must read the full transcript.

## Infrastructure

- Master moved 5 times under the run (Loop B 0930Z landing 68228cd67,
  journey-deepening r113 38aa62dc, journey-scale r107 6c399e307, plus
  sibling landings during the workers' rebases). Both branches rebased onto
  explicitly-read master SHAs each time; proofs re-ran green after every
  rebase. Zero file overlap with any arm.
- First lingergorge merge attempt failed on a transient `.git/index.lock`
  (Loop B's sim-linkdrive-b registration holding it); verified no stale
  lock (file gone, registration in flight), retried, merged clean.
- Safe-commit index clobber hit the coordinator re-pin commit (2 files
  staged-as-modified after commit); repaired index-only via
  `update-index --add --index-info` from `ls-tree HEAD`, hashes verified
  worktree == HEAD blob; commit correct throughout. Same clobber hit both
  workers' adoption commits; both repaired the same way.
- Registry flock queueing: the lingergorge release waited ~13 min behind
  Loop B's registration + a reaper (all 0-CPU flock waits); released clean
  once the queue cleared. No action taken; the queue is serialization, not
  a deadlock.
- Reaper incident (not mine, recorded): the 04:28Z reaper removed
  sim-finishersize-a mid-gate on a 4.0h-stale heartbeat; branch kept
  (9 commits, tip 86453af3e), zero work lost, gate crashed. Main session
  re-registered it as sim-finishersize-r3 and is landing it. I did not
  touch it. Lesson now in ~/AGENTS.md: closeout trees must heartbeat
  hourly.
- `check.js --quick` NOT run this run: the finishersize gate owned the
  gate slot throughout; targeted proof suites only (33/33, 42/42, 33/33,
  60/60 — all green on merged master). No push, no bump, no live verify.
  Merged locally, pending ship.

## Findings

- #1792 [fixed] — lingerer-gorge stranded-window line; gate 6aeba1c88 holds.
- #1793 [fixed] — moot-turns-to-you stranded summons; fix holds.
- New [open] appended: `state.lastLingererOffer` dead state in the shipped
  game (writer only havenGrowth.js:275; readers only sim-bot policies +
  tests; no docs).
- No other new findings. The `lastLingererOffer` cleanup and the
  same-name-double-gorge observation are the only sense items; both are
  recorded above.

## Closeout

- Both arms merged locally, pending ship. Lock + claim deleted at closeout.
  Main tree clean. food-economy stays converging; scale-onramp stays
  converging (Loop B's 1049Z run live on it — not touched).
