# sim-scale-onramp-round-2315 — COORDINATOR EVIDENCE (run fleshout-20261117T2315Z)

**Run:** fleshout-20261117T2315Z · **Axis:** scale-onramp · **Type:** MULTI-ARM
(1 DIAG GO + 1 BUILD GO, both merged locally pending ship).
**Master at closeout:** b7236b65f (both arms merged; journey-social-life r235
landed on top after, fe6c5f5ce — both arm commits are ancestors of HEAD).

## Run-start state

No Loop A lock existed; Loop B live on the winnability chain the whole run
(2230Z claim: fleerepair2-b + packhunt-rec-b) — NOT touched. Loop B closed
during this run (claim deleted by its coordinator; its evidence
91931f7f1 landed on master before the arm merges; its fleerepair2-b tree
stays held, heartbeated, not mine). Pre-flight: main tree clean, disk 46%,
reap ran (11/16 active, no removals). Claim written before any sims:
`hidden_files/lever-claims/fleshout-20261117T2315Z.json` (axis
scale-onramp; arms sim-selblock-a, sim-homebodyvoice-a). Tracker next
blanks at run start, in order: (1) selected-blocked classification
(finding #2498); (2) launched-party damage wall — Loop B live, NOT
duplicated; (3) picked-homebody fiction line (#2499). Both arms map to
blanks (1) and (3).

## Arm 1 sim-selblock-a — DIAG GO (finding #2498 classified, 12/12 named)

The corpus already carried the depart-gate state, so no re-run and no lever
re-application were needed — a pure re-read of the profilegate-b ON corpus
(frozen band 103411–103418), verified instance by instance against the
backing depart/skip rows. Full record: evidence/2026-11-17/sim-selblock-a.md
(+ prereg alongside it); proof test scripts/test-selblock-a.js.

**First-block tally (frozen metric):** inviter-range-0 **6**,
no-tick-after-commit **3**, inviter-sick **1**, inviter-hurt **1**,
companion-not-started:sick **1** — 12/12 named, unknown 0 (bar ≥10 named,
≤2 unknown). **All 113 blocked selections:** range-0 79 (70%),
danger-gate 12, companion-not-started:range-0 6, no-tick 4, night 3,
not-at-haven 3, sick 2, companion-sick 2, hurt 1, selected-not-executed 1.

**What it means, in plain words:** the pool filled with people who cannot
walk. Holders are homebody in 8/12 instances (travel range 0); they hold a
wave-4 plan, bid at dawn, a companion is picked — and the depart gate
refuses the holder themselves. Giulia Bianchi bids 35 times over 46 days,
28 of them range-0. The companion side is two-sided too (homebody
companions picked by walking holders, 6 selections), understated because
the holder's hold usually fires first. The other blocks are scheduling (3
part-3 commits with no tick left) and honest gates (sick holder, health-7
hurt holder, sick companion). Zero instances unexplained; zero `hold` rows
with an unknown block across the whole ON corpus (399 rows). The fix is a
design call — stop range-0 holders from bidding/holding, or hand their plan
to a walker — not a recorder gap or depart bug.

**Instrument:** D1 repeatability (seed 103411, 60d, run twice, identical
except the `run` label); D2 wrap neutrality (OFF vs ON deep-equal; note: at
60d the funnel hasn't started on 103411, so D1/D2 prove trajectory identity
— recorded under Metric review); OFF-leg replication EXACT (funnel, subs,
pool shape, wall, deaths 517/786, starvation 5/3, medians 147.5/116.5).
Proof test 26/26 green — re-run by the coordinator on the rebased tip,
26/26.

**Disposition:** DIAG only, no game change. Net `src/` diff vs master:
zero (verified). Commits: prereg 98e4b16af, evidence + proof c0a1919f0
(rebased; was 3c10f03b8/d1d2f8905). Merged ff-only onto 91931f7f1.

## Arm 2 sim-homebodyvoice-a — BUILD GO, adopted with two declared letter-failures (finding #2499 fixed)

Fiction line in `writeCommit` (src/js/villager-brain.js, +36 lines, the only
src change): a dawn-bid `party_launch` pick whose companion has max range 0
fires once per (holder, companion) pair ever:

> "Zihao asked Jesse to walk out with the party — but Jesse never leaves
> Haven, so Jesse stays behind." — seed 103414, day 34

Fiction only: no range, gate, profile, or depart-logic change. The
measurement lever (PROFILEGATE=1) was reverted before commit. Full record:
evidence/2026-11-17/sim-homebodyvoice-a.md (+ prereg); proof test
scripts/test-homebodyvoice-a.js; corpora perseed-homebodyvoice-a-{on,noline,ctrl}/.

**Live band** (103411–103418, 150d, PROFILEGATE=1 + VETREENGAGE=1):
**54 lines = 54 blocked pairs, 0 fires for walkable picks** (145 walkable
pairs). Same-base no-line control byte-identical on all 24 structural
fields on all 8 seeds — the line moves no outcome. Wall numbers unchanged:
national 1/8, wave-4 8/8, wave-5 1/8, 0 wins.

**Coordinator adoption decision (the two letter-failures).** Proof test
34/36 on the rebased tip (re-run by the coordinator, identical result).
Both failures are frozen letter-checks, declared by the worker, not hidden:
- **B1-letter:** the prereg's exact d78 Giulia+Jesse instance does not
  exist on this base (77a37fe91) — 0 Giulia+Jesse picks on 103414 in either
  leg. Base drift, proven by the same-base control (the pairing is absent
  with AND without the line). Jesse is still voiced on 103414 by six other
  holders (first lines days 34/37/37/41/45/76); Daniyar's day-78 re-pick
  is silent by design (already told day 76). The B1-control check (every
  Jesse blocked pick voiced exactly once on its first day, 6 pairs) is
  green and measures the substance.
- **B4-letter:** trajectories vs the profilegate-b ON corpus diverge —
  but that corpus was measured on base eb2d3714f while this arm ran on
  77a37fe91, and the plan system itself drifted between those bases
  (profilegate-b's own evidence documents seed 103413 planting no plans
  on the new base). The cross-base first-divergence-day rule is causally
  naive for this comparison. The B4-control (line-on vs no-line
  byte-identical 8/8; sayCount diff = 54 = line firings) is green and
  measures the substance.

I adopt GO on the substance controls. The frozen prereg was NOT re-scored:
the letter-failures stand in the proof test as failures, and this adoption
is recorded here, not in the arm's bars. Next arm that reuses a
cross-base trajectory rule should use the same-base on/off control
instead.

**check.js --quick:** 328 passed, 12 failed in 1561s (exit 1), all 12
triaged by the worker, none from the line — verified by stash-and-re-run:
7× 120s timeouts under extreme box load (load ~17, three concurrent
sweeps); 4× retained-proof freshness gates (measurement-proof-update,
measurement-workflow, phone-frame-proof reproduce identically with the
line stashed; cache-flags 0/4 is the documented box-load artifact); 1×
ladder-bundle ambient-raid control (pre-existing on base). Neighboring
test-profilegate-b.js with the line in the tree: 48/50, all live /
determinism legs green; its 2 failures are stale-frozen-base assertions
(tree moved on since eb2d3714f). The coordinator did NOT re-run the full
quick check (~26 min); the arm proof test + byte-identical same-base
control is the green signal for a fiction-only change. The stale retained
proofs are ship-loop maintenance, not this arm.

**Disposition:** LANDED. Commit b7236b65f `[needs-eyes]` (rebased; was
863da464f), 22 files, 1,234,244 insertions (corpora dominate). Merged
ff-only onto c0a1919f0. `src/` diff vs master is the line site only
(verified).

## Wall numbers (this run's judged corpora)

| | profilegate-b OFF | profilegate-b ON | homebodyvoice ON* |
| --- | --- | --- | --- |
| National standing (≥200) | 1/8 | 1/8 | 1/8 |
| National rank | 0/8 | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 | 0 / 0 |
| Wave 4 unlocked | 8/8 | 8/8 | 8/8 |
| Wave 5 unlocked | 1/8 | 1/8 | 1/8 |
| Median survival | 147.5d | 116.5d | — (not re-judged) |

\* homebodyvoice ON leg also carries VETREENGAGE=1 (measurement lever,
same as the profilegate-b ON leg's seed context). The wall did not move:
no village reaches national rank, the table, or a win on any leg.

## Coordinator decisions

1. **Homebodyvoice GO adopted** with the two declared letter-failures
   (see Arm 2 above). The line lands; the prereg's B1 instance and B4
   cross-base rule are recorded as base-fragile, not re-scored.
2. **No back-to-back round.** Both arms landed; the run is past 100 min
   elapsed. The next blanks are design calls (range-0 holder bidding) or
   Loop B's damage-wall territory — not a second round for this run.
3. **Telemetry deviation check: REFUSED by design** (same documented
   refusal as recent rounds). The per-seed files carry top-level
   `anchorCommit`, so they are sweep recorder rows, not runs; the script
   refuses recorder-corpus input against a run baseline. Baseline NOT
   rolled.

## Infrastructure

- **Write flap:** EPERM window 23:26–23:31Z (~5 min) killed the first
  homebodyvoice-a registration (`git worktree add` checkout died with
  thousands of "unable to write file" errors; branch left dangling, no
  tree, no registry entry). Flap-watch probe caught it at write() (A/B/E/G/H/I
  FAIL EPERM). Waited for two consecutive ALL-OK probe lines (23:31/23:32Z),
  retried the registration — succeeded clean. No data lost; the flap is
  the known host issue, reported as ongoing, never solved.
- **Master moved three times under the run:** ship-loop version bump
  5168f824d; Loop B coordinator evidence 91931f7f1; journey-social-life
  r235 (9d5a45fcc + fe6c5f5ce, landed on top of my merged tip after
  closeout — both arm commits verified ancestors of HEAD, no
  divergence). First rebase attempt used the wrong form (`git rebase
  master <branch>` from the main tree refuses a branch checked out in a
  worktree — "already used by worktree"); rebased inside each worktree
  instead, both clean (selblock 2/2, homebodyvoice 1/1, no conflicts, no
  stop-at-pick quirk).
- **Safe-commit index clobber** struck both workers (selblock both
  commits; homebodyvoice all 22 files staged-deleted after commit) —
  repaired via the ls-tree -r pipe, commits verified correct, trees clean
  after repair. Homebodyvoice worker notes safe-commit.sh needed a `bash`
  prefix in its worktree (permission denied on direct exec).
- **Service restart** killed selblock's first D1a driver run mid-sim
  (empty dir, no file); re-run clean. Selblock worker's 4 failed exec
  events are accounted for: the SIGTERM restart + clobber repairs; nothing
  in coordinator verification contradicts the reported state.
- **Closing reap SKIPPED:** registry lock held by another reaper run
  (consecutive skips: 1) — a sibling loop's reaper was running. My trees
  were already released/removed by hand; nothing left behind.
- No EPERM flap after 23:31Z. Both trees released done-merged, branches
  deleted, main tree clean at closeout (tip fe6c5f5ce — see master-moves
  note; my merged tip b7236b65f is its ancestor).

## Findings filed

- #2498 (selected-blocked): CLASSIFIED by this run (DIAG GO) — claimed in
  sim-findings.md; stays open as the record, the fix is a design call.
- #2499 (picked-homebody fiction line): FIXED by this run (line landed
  b7236b65f).
- NEW finding filed (holder-half silence): a range-0 HOLDER staying home
  still gets no line — only the companion half is voiced. Next fiction
  arm, or fold into the range-0-holder design call.

## Next blanks, in order

1. **Range-0 holders bidding/holding wave-4 plans** — design call (Steve):
   stop range-0 holders from bidding/holding, or hand their plan to a
   walker. The classification says the jam is the holder, not the
   companion (79/113 blocked selections are inviter-range-0; 8/12
   instances are homebody holders). Judge a fix on first-block share AND
   all-selection share — danger-gate (12) and companion-range-0 (6) are
   invisible in the first-block tally.
2. **Launched-party damage wall** — Loop B's territory (fight-ally-cap +
   recorder work live there); do NOT duplicate.
3. **Holder-half fiction line** (new finding) — voice the range-0 holder
   staying home, extending #2499 to all block reasons; or fold into (1).
4. **no-tick-after-commit edge** (part-3 commits with no tick left, 3
   instances) — separate small fix candidate.

scale-onramp stays converging (NOT converged): the binding stage is now
named (range-0 holders), the companion-half silence is voiced, but wins
still come only through default-OFF courtship + seat instruments, only
through the lesser seat, wave 5 still 0 faced by a launched party, and no
launched party has ever killed a wave-4 beast on any band. The directive
stands until the tracker records this axis converged on measured evidence.
food-economy stays converging (parked); winnability chain stays converging
(Loop B closed its 2230Z run this window: packhunt-rec-b LANDED GO,
fleerepair2-b NO-GO HELD). Claim deleted; lock deleted. Evidence: this
file. Arms merged locally, pending ship.
