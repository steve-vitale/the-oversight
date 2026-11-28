# sim-scale-onramp-round-1015 — Loop A adoption run (sitpolicy landed, merged locally pending ship)

- Run: `fleshout-20261128T1015Z`, Loop A, axis scale-onramp (the scale wall)
- Scheduled 04:15:39 CST / 10:15:39Z; lock created 10:34:22Z after stale-lock recovery
- Claim: `hidden_files/lever-claims/fleshout-20261128T1015Z.json` (deleted at closeout)
- No new lever round was planned: land the stranded work. (Precedent: the
  0515Z adoption run.)

## Stale-lock recovery (0815Z run dead)

- Lock `fleshout-20261128T0815Z`, created 2026-11-28T08:32:52Z, ~2h old at
  recovery — past the 90-minute fallback as well as the 15-minute heartbeat
  guard.
- No registry entry for run_id 0815Z; no live coordinator process (`ps`
  empty; subagent active list showed only the Loop B 0930Z agent); all
  three 0815Z workers done (linkdrive landed; sitpolicy + onelink stopped
  on cron timeout ~10:31Z).
- Deleted the lock, retired the 0815Z claim to `.DEAD`, created my own
  lock. Loop B live on winnability-chain (0930Z claim: seatfail-b +
  cousinevade2-b) — NOT touched.
- Pre-flight: main tree clean (0 files), disk 55%, master tip 176797392.

## What the 0815Z run left (verified at run start)

- **sim-linkdrive-a: LANDED on master** (commits 793310bbf … 176797392).
  GO — LEAD realm 6/8, beat staged 6/8, national 0/8. Nothing to adopt.
- **sim-sitpolicy-a: stranded.** 3 commits on branch + uncommitted
  evidence/corpora/panels. Worker verdict NO-GO (seated 3/8, bar ≥4/8).
  Adopted this run (Arm 1 below).
- **sim-secondlink-a: NEVER STARTED.** No secondlink worker appears in
  the run's agent list; the sim-secondlink-a tree is a stale Nov-23 held
  tree (registry owner unknown, heartbeat 2026-11-23) with only Nov-10
  files. Recorded as next blank, not run this round.
- **sim-onelink-a: timed out, no sims run, no files written, clean tree
  at master tip.** Released as abandoned, worktree removed, branch
  deleted. (The `worktree remove --force` timed out at 120s after
  deleting the `.git` pointer — the dir was removed by hand after `git
  worktree prune`, then `branch -d` clean; registry active 15 → 14.)

## Arm 1 — sim-sitpolicy-a adoption (LANDED, merged locally pending ship)

Adoption worker: branch verified, evidence committed, rebased onto
master tip 176797392, proof green, reported for coordinator merge.
Coordinator merged `--ff-only`: 176797392 → **f4624424d** (5 commits,
48 files), proof re-run **90/90 green on merged master**.

- **Evidence commit:** `2cde3e23` (pre-rebase) → rebased as `f4624424d`.
  Cross-checked `git show --stat` against the evidence file's own
  §attachments list: exact match, 42 files, no extras, nothing missing
  (prereg §6 fill, evidence md, 8+8 perseed JSONs, both panel dirs incl.
  9+9 cases + panel.json.gz, panel + compare json/md).
- **Proof:** `node scripts/test-sitpolicy-a.js` — 90/90 green, exit 0, on
  the rebased branch AND on merged master. Two-phase live sit still wins
  day 96 via the feared path.
- **Verdict untouched:** NO-GO (seated 3/8, bar ≥4/8), not re-judged, no
  sims re-run. The sitting mechanism is proven: where the seat is
  reached, the policy sits and wins 3/3. First competent-band wins via
  sitting, 3/8 (d124, d135, d150, all lesser, all feared). Delivered
  8/8 (all feast_embassy). National 0/8 both legs.
- **Landing shape (coordinator decision):** the branch merged AS-IS.
  `scripts/policies/competent-sit.js` lands as an INERT sim instrument —
  called only by the sitpolicy driver; no default flip, no game-code
  caller, zero src/js. Rationale: the named next arm (bundle-deferred
  diagnostic) builds directly on it, and the fleefloor-a NO-GO adoption
  precedent (merged, zero src/js) applies. The NO-GO verdict stands in
  the evidence file and the tracker; nothing here claims the lever is a
  fix. The adoption worker agreed with this shape, no disagreement.
- **Git-state finding (real vs phantom):** the 10:33Z status (`M prereg /
  D compare-sitpolicy-panels.js / MM sweep-compare.js`) was mostly
  phantom — the compare script and sweep-compare.js are byte-identical
  to HEAD (verified by hash-object vs HEAD blob). The prereg §6
  metric-review fill was the one real uncommitted change. The safe-commit
  index clobber then struck the worker's evidence commit itself: after
  `2cde3e23` committed correctly (all 42 files verified in the commit),
  the main index reverted to the pre-commit tree — all 42 files showing
  staged-deleted while byte-identical to HEAD. Repaired with the
  documented pipe (`git ls-tree -r HEAD -- <42 paths> | git
  update-index --add --index-info`); afterwards both diffs empty and all
  42 disk files verified byte-identical to HEAD. The commit itself was
  never wrong; only the index lied.
- **Why the miss (from the evidence §5, not re-judged):** only 3/8 ever
  reach the lesser rung (d123–149 vs d39–63 before), and the day-1
  bundle buy-out reshuffles the run from day 1 (day-2 pantry 34,140 sit
  vs 41,630 verbatim on 113301). The after villages are safer, fatter,
  and climb less. Whether the buy-out causes the wave-3 stall or the
  stall is reshuffle is UNPROVEN — that is the next arm.

## Arm 2 — bundle-deferred diagnostic (NOT spawned this run)

The sitpolicy §9.1 next arm is the next run's arm, not this run's: the
adoption + closeout filled the run, and a fresh arm started now would
strand on cron timeout. Design frozen here so the next run can brief it
without re-deriving:

- Same 8 seeds 113601–113608, 150d death-aware, sit policy with the
  feast-bundle buy-out DISABLED, all other sit verbs identical.
- Primary: lesser-reached count + median lesser day + wave-4 reach vs
  the sitpolicy after-leg (3/8, d123–149, wave-4 3/8) and the competent
  before leg (8/8, d39–63, wave-4 8/8). Decides whether the buy-out
  causes the wave-3 stall.
- This is a DELIBERATE same-band reuse for a paired diagnostic — the
  band is used, not fresh; the prereg must record that, not claim
  freshness. Split the seated bar per sitpolicy §8 (lesser-reached ≥6/8
  AND seated-given-lesser ≥3/4) and set the delivery bar per-kind.
- Builds on the merged instruments (competent-sit.js, sitpolicy driver,
  analyzer, compare script) now on master.

## Wall (this run's judged corpora — sitpolicy, 16 configs)

| Metric | Before (competent) | After (competent-sit) |
| --- | --- | --- |
| National | 0/8 | 0/8 |
| Table entered / seated | 0/8 | 3/8 |
| Wins | 0/8 | 3/8 (lesser, feared) |
| Wave 5 reached | 2/8 | 1/8 |
| Wave 4+ reached | 8/8 | 3/8 |
| Median survival | 144d | 150d |
| Village-lost | 4/8 | 0/8 |

Linkdrive (landed by the dead run, already on master): LEAD realm 6/8,
beat staged 6/8, national 0/8. The scale wall stands: national 0
everywhere, full seat unreachable on every band this round.

## Telemetry deviation check (coordinator re-run on the merged corpus)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-28/perseed-sitpolicy-a-arm/s*.json' --metrics national,table,wins,exiled --sweep-rows`

- Wall: `table=3/8 entered=3/8 won=3/8` (8 seeds).
- LOUD: national disappeared: baseline 12 → current 0.
- LOUD: table swung −81%: baseline 16 → current 3.
- LOUD: wins swung −81%: baseline 16 → current 3.
- **Verdict: regime artifact, not a bug.** The baseline's own `_regime`
  note labels it "winseat — full win-side win stack" and forbids
  comparing pre-seat substrates against it. The sitting policy moved
  wins 0/8 → 3/8 on its own band, above the structural ~0 the note
  expects. Baseline NOT rolled.

## Metric review (§14)

- The frozen bars measured what they claimed (sitpolicy prereg §6 +
  evidence §8, adopted verbatim — not re-scored here). The seated bar
  conflates reaching the lesser rung with sitting once there (policy 3/3
  on sitting, band 3/8 on reaching); the next run splits it. The
  delivered bar (≥2/8) was too easy — the feast road delivers 8/8 once
  the bundle is bought on day 1.
- Confirm 12–16 seeds: NOT warranted. The pilot failed its GO bar; the
  next spend is the bundle-deferred diagnostic, not a confirm.

## Infrastructure

- **Git ops very slow under load all morning.** `git status` / `git
  diff` timed out at 120–200s more than once, returning empty output.
  Empty output from a timed-out git call is INCONCLUSIVE, never clean —
  verified twice on the sitpolicy tree; all state conclusions in this
  run come from content checks (`hash-object`, `ls-tree`, `ls-files
  --stage`, targeted diffs) and `ls`.
- **Machine restart ~11:14 UTC** SIGTERMed the adoption worker's first
  rebase attempt at ~183s. It left no rebase state and HEAD unchanged;
  the worker verified that, re-established the heartbeat first, then
  re-ran the rebase cleanly. (VM restart kills detached work silently —
  uptime is the tell.)
- **Safe-commit index clobber** struck the worker's evidence commit
  (42 files staged-deleted in the index, commits correct) — repaired
  via the ls-tree pipe; the 10:33Z phantom M/D/MM was the same class.
  No clobber on the coordinator's merge or evidence commit (verified
  below).
- **Registry lock contended** (Loop B registering in parallel); one
  heartbeat skipped on the >120s hold, cleared on retry. No EPERM flap
  this run.
- `check.js --quick` NOT re-run: zero src/js across the landing; the
  arm proof is green on merged master (90/90); the standing profile
  (280 passed / 7 failed, pre-existing parity gear assertion) was
  recorded by the 2215Z/2315Z runs and nothing here touches it.

## Closeout verification

- Master tip after merge: f4624424d; proof 90/90 on merged master.
- Tree sim-sitpolicy-a released done-merged, worktree removed, branch
  deleted. Tree sim-onelink-a released done-abandoned, worktree removed,
  branch deleted. `git worktree list` confirms neither remains.
- Main tree clean at closeout (completed `git status --short`, empty) —
  verified after the coordinator evidence commit below.
- Do NOT bump, do NOT push. Merged locally, pending ship.

## Evidence

- Arm evidence: `evidence/2026-11-28/sim-sitpolicy-a.md` (+ prereg,
  corpora, panels) — commit f4624424d.
- This file: `evidence/2026-11-28/sim-scale-onramp-round-1015.md`.
