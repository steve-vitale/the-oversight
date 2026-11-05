# sim-winnability-round-2130 — Loop B adoption closeout (axis scale-onramp / winnability chain)

Run: `fleshout-loop-b-20261105T2330Z` (adoption coordinator). Axis: scale-onramp /
winnability chain (wild ally-join → wave-4 kills → veterans → readiness-5
release → wave-5 facing → full seat). This file closes out the dead run
`fleshout-loop-b-20261105T2130Z`, whose coordinator died before merging its
refind-confirm branch and before writing any coordinator evidence. No new
sims were run for the adoption itself; both arms' verdicts are the dead
run's workers' own, verified here, not re-judged.

## Stale-lock recovery

- Dead lock read before deletion: `fleshout-loop-b-20261105T2130Z`,
  created 2026-11-05T21:30:00Z (2h old at recovery, past the 90-min
  fallback as well as the 15-min heartbeat guard).
- Dead claim retired to `.DEAD` (axis scale-onramp, arms
  sim-tbretreat-refind-confirm-b + sim-bankkiller-b).
- Registry check (trees list, per the 2026-11-03 closeout rule): the dead
  run's only registered tree, `sim-tbretreat-refind-confirm-b`, last
  heartbeated 2026-11-05T22:37:14Z — 52 min stale at recovery. Its sibling
  arm `sim-bankkiller-b` had no registered tree (already merged).
- "Other hand" check (per the 2115Z lesson — a stale heartbeat proves the
  coordinator is gone, not that the work stopped): both 2130Z workers show
  `done` in the subagent listing with final reports delivered
  (refind-confirm GO, bankkiller THIN); no file writes in the refind tree
  in the 15 min before adoption; the tree was clean; the branch tip commit
  b8ae9e537 was 22:02:30Z, ~90 min before adoption. No live worker was
  disturbed.
- Loop A live on food-economy throughout (2215Z claim, arms
  sim-awaynaming-rereg-a + sim-enddaybeats-fix-a, workers running) — NOT
  touched.

## Arm 1 — sim-tbretreat-refind-confirm-b: CONFIRM GO (landed by adoption)

Policy-only confirm of the 1830Z pilot GO. 24 fresh seeds (93011–93026 +
extension 92011–92018 after a 16-seed THIN at 14 fires), 150d, competent
verbatim vs tbretreat-refind on identical seeds. Evidence:
`evidence/2026-11-05/sim-tbretreat-refind-confirm-b.md` (+ prereg,
48-file corpus `perseed-tbretreat-refind-confirm-b/`, proof
`scripts/test-tbretreat-refind-confirm-20261105.js`).

| Gate | Bar | Result | Holds |
|---|---|---|---|
| G1 retreat survival | exits / fires ≥ 25% | 14 / 27 = 51.9% | YES |
| G2 TB-fight survival | armed > baseline | 22.4% vs 7.4% | YES |
| G3 kill rate not halved | armed ≥ ½ baseline | 3.1% vs 4.6%, 0.68× | YES |
| G4 survival not harmed | armed median ≥ 0.8× baseline | 89d vs 90d, 0.99× | YES |
| Denominator guard | fires ≥ 15 | 27 fires | cleared |

The fighter who is losing a wave-4 TB fight now turns and runs for home,
and about half the time makes it out alive (70% of genuine attempts,
excluding 7 haven-holds where the fighter already stood on the haven
node). 3 first gaveup exits in either run. Zero consumed/sealed pushes
in 27 fires (42 across both runs). The lever buys lives per fight, not
victories: wave-4 kills 4 armed vs 6 baseline, 6/14 exits re-engaged
within 7 days, median survival unchanged. The remaining failure modes
are the same as the pilot's: 6 died on the walk to the edge, 7 died
where they stood at home — engine work (faster breakaway, home-ground
advantage), not policy work. The policy half of the retreat blank is
closed: the retreat happens, and it saves lives per fight.

Landing verification (adoption coordinator, not the worker):
- Branch rebased onto master tip e39227114 clean (no conflicts; pure
  additions, 51 files). Rebased tip b7f34fbbb, prereg ec1a67026.
- Patch identity verified: `git show --format=` of the original prereg
  912c1a20d vs rebased ec1a67026 — byte-identical; same for the evidence
  commit b8ae9e537 vs b7f34fbbb. The rebase changed hashes and parents
  only. The original anchor object 912c1a20d still exists with the same
  message.
- Proof re-run on the rebased tip: **25/26 PASS**. The one failure is
  `corpus-anchor-is-prereg-commit` (anchor 912c1a20dc92 vs prereg
  ec1a67026521) — a rebase artifact, root-caused, not a content failure:
  the corpus records the prereg commit as it existed at sweep time, and
  the rebase rewrote that hash; the anchor object is the same prereg
  (identical patch, identical message). All gate legs pass (G1/G2/G3/G4),
  corpus-single-anchor passes, 48 rows, zero instrument errors. The
  proof test itself was NOT edited to go green (repo rule: never loosen
  an assertion). Metric note for the next run: anchor checks should
  compare prereg content (tree/message), not the hash, when a rebase is
  expected between sweep and landing.
- Merged `--ff-only` as b7f34fbbb; verified ancestor of HEAD; main tree
  clean. Tree released done-merged, branch deleted, worktree removed.
  Local master is 55 commits ahead of origin/master at merge time
  (unshipped work; ship loop owns pushes).

## Arm 2 — sim-bankkiller-b: THIN (already on master, summarized here)

Policy-only pilot: on the scholar's first turn of a TB fight with a live
wave-4+ monster and ≥1 living ally fighter, call `Game.tbPlayerRally()`
once, then fight normally. Seeds 98811–98818, 150d. Evidence:
`evidence/2026-11-05/sim-bankkiller-b.md` (+ prereg, 16-file corpus).
Commits 8c810d7d1 (prereg + policy probe, proof 25/25) and 555f59160
(pilot THIN) were already ancestors of master at adoption — the dead
coordinator had merged this arm before dying. Nothing to land.

Verdict: **THIN — mechanism unmeasured, NOT a NO-GO.** Rally fires
7 < 8 across the armed leg, so the prereg's THIN rule fired before the
GO/NO-GO bar; guards were not evaluated. The rally works when it gets a
chance (7/7 applied, 0 mismatches, 0 instrument errors), but the chance
is rare — allies were beside the scholar in only 7 of 25 wave-4+ TB
fights (28%). The bottleneck is ally presence, not the rally. Two
fiction findings filed in sim-findings.md (lines 1788–1789): "Rally"
means three things at once (TB verb, relief-beats option, learned
ability), and the rally line doubles the foe name ("BIG BIG —
TOGETHER!"). Metric review (in the arm evidence): the TB-survival
secondary is INVALID as defined (day-granularity join overcounts —
armed 26 deaths / 25 fights); the next run must track TB fight ends at
fight level before any guard is judged on it. The lever is NOT dead; it
is unmeasured. Next run re-designs the trigger around the actual
bottleneck (allies beside the scholar in wave-4+ TB fights), e.g. widen
to field fights or attack ally presence itself.

## Wall numbers (this round's judged corpora, 64 rows)

| Measure | Refind confirm (48 rows) | Bankkiller (16 rows) | Combined |
|---|---:|---:|---:|
| Wins | 0 | 0 | 0 |
| National / global | 0 | 0 | 0 |
| Table | 0 | 0 | 0 |
| Wave-4 unlocks / faced | 30 / 30 | 10 / 10 | 40 / 40 |
| Wave-4 kills | 10 | 6 | 16 |
| Wave-5 unlocks / faced / kills | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Readiness-5-ready days | 0 | 0 | 0 |
| Median survival | 89d | 77d | — |

One seed (92012, both legs) ends with a single LIVING wave-4 killer —
the veterans bar's first half exists, the pair never forms. Standing 199
(the t5-1 readiness hold) shows on 5 baseline seeds and 2 armed seeds
in the refind corpus — the same 99107 pattern the standing-accumulation
arm is queued to attack. The wall past wave 4 — veterans, the ready
force, wave 5, the full seat — did not move in either arm.

## Village assessment (plain words)

Two villages' worth of fighting, two different lessons. The retreat
lever works: a hurt fighter against a wave-4 beast now runs for home
about half the time and lives to fight again — before, that fighter
simply died. But running away doesn't win fights, and it doesn't get
the village any closer to the fifth wave: nobody banked a second
killer, nobody released a ready force, nobody opened the wave-5 door.
The rally lever never got a fair test — the scholar fought the big
fights alone most of the time, so the call to rally the line almost
never had a line to rally. One village, 98815, produced a living
killer, Emma, who killed a Strike on the last day with two people
left — without the rally's help. The binding link is still getting a
second living killer, and the rally can't reach it because allies are
almost never beside the scholar when the big fight starts.

## Telemetry deviation check

Attempted on the refind corpus:
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-05/perseed-tbretreat-refind-confirm-b/*.json' --metrics national,table,wins,exiled`
→ refused, same recorder-corpus class as prior killer-chain arms
("all 48 --current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs"). Baseline NOT rolled; no LOUD lines. The
bankkiller arm's evidence records the same refusal on its corpus.

## §15

Not run as a panel (same standing position as the arm evidence files):
`scripts/balance-panel.js` installs its own observer into fresh live
sims under registered policies and takes no corpus input;
`tbretreat-refind` / rally are not in its policy set. The analyzers'
two-leg compares on identical seeds are the before/after instruments.
No compare `.md` fabricated.

## Infrastructure

- No EPERM flap blocked this adoption. Registration slow in prior runs
  did not apply (no new tree registered for the adoption itself).
- Safe-commit index clobber: to be recorded at commit time below (the
  adoption landing itself used plain merges only).
- Reaper at run start: active 6/16, removed nothing sibling-owned.
  LOUD notes left alone: build-smallfixes, sim-enddaybeats-fix-a (Loop
  A live), journey-scale, journey2-endgame all carry uncommitted changes
  in other loops' trees — not touched.
- check.js --quick NOT re-run: zero src/js in either arm (policy-side
  refind confirm + policy-side rally pilot); standing 284/6 profile
  recorded by the 1830Z run the same day.

## Next blanks, in order

1. Re-screen sigoff/gearoff/trickoff on a fresh seed set (0445Z
   togglepin blank (a) — pilot non-attribution covers only
   89702/89704/89705 classes; gearoff/trickoff already move
   trajectories heavily). A re-screen worker is spawned by this run
   after this closeout; see its own evidence file.
2. Bankkiller trigger re-design around ally presence in wave-4+ TB
   fights (7/25) — widen to field fights, or attack ally presence
   itself; fix the TB-survival join to fight-level end tracking first.
3. Standing accumulation on gear-ready seeds — the 99107 pattern
   (standing 199, veterans 0) reproduced on 7 refind-corpus seeds.
4. Flee-repair game-code port — STEVE CALL on scope (not claimed).
5. The haven-hold / walk-to-edge failure modes are engine work
   (faster breakaway, home-ground advantage) — a design question for
   the STAYING second half, not a policy arm.

scale-onramp stays converging (NOT converged): the retreat policy half
is confirmed GO and landed, the rally is unmeasured rather than dead,
but wins are still 0, wave-5 kills still 0, readiness-5-ready days
still 0. food-economy stays converging (untouched; sibling Loop A).
This file is the adoption closeout; the run continues with the
re-screen arm (queue item 1 above) under the same claim, updated to
name it, and the claim + lock are deleted when the run ends.
Evidence: this file (coordinator commit, see below) + the two arm
evidence files on master.
