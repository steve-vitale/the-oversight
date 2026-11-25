# sim-winnability-round-0130 — Loop B 0130Z round record (axis winnability-chain)

Run fleshout-loop-b-20261125T0130Z, Loop B, axis winnability-chain.
Loop A live on scale-onramp the whole run (2315Z claim: homecraft-gate,
spearlead, leadworst; then the 0215Z run) — NOT touched. Master moved
14 commits under the run (9 sibling-lane: journey-crisis r287 ×4,
Loop A homecraft-gate adoption ×5; 5 this run's). No overlap, no
interference either way.

## Stale-queue correction (checked against master + evidence before spawning)

The body's re-point queue items (1) arm-2 toggle and (2) flee-repair are
DISPOSED — arm-2 toggle CLOSED 2026-11-06 (togglepin-b, MORALE CREDITED);
flee-repair LANDED as fleerepair3-b in the 1030Z round (d84d63ba0). The
2130Z round's "next blanks" re-listed both from stale body text; the
2230Z tracker entry already recorded this. This run took the 2230Z
next blanks in order: (1) adopt fleeguard, (2) the fight itself,
(3) Reunion in the wild.

## Arm 1 — sim-fleeguard-b (ADOPTION, GO, LANDED)

Adopted from the 2230Z partial closeout (GO-judged, in-flight, claim
narrowed + left live). Worker confirmed done; corpus + analysis + §15
panel verified on disk, evidence written by the adopting coordinator
from the frozen prereg + analyzer (nothing re-judged).

- Branch sim-fleeguard-b: prereg 519dbc69b + correction 63c2c6bb6,
  build 6742a0d8e [needs-eyes], adoption commit e7f657b18 (rebased as
  149a59984). Proof scripts/test-fleeguard-b.js 50/50 green twice
  (pre-rebase + on rebased tip). Merged --ff-only to master 149a59984.
  Tree released done-merged, branch deleted.
- Verdict GO on all 9 frozen bars, band 109501–109508, 150d,
  competent: hopeless flees 11 → 9, guard fires 6 (2 meetings),
  floor 9 = 9, vDie 7 → 5, starvation 1/0 both, median 142.5d →
  146d, zero drift on ctl. Kills 0/27 → 0/23 (secondary, as
  pre-registered). Panel review_required, no material signal.
- Evidence: evidence/2026-11-24/sim-fleeguard-b.md.

## Arm 2 — sim-partyassemble-b (DUPLICATE, evidence-only LANDED)

Spawned for the 2230Z next blank (2), the fight itself — party
assembly at fight start, the basedmg "cheapest half". The worker
stopped at the §14b pre-pilot substrate checklist: the arm is an
EXACT DUPLICATE of sim-allystart-b (commit 15ff9f030, ALLYSTART=1 →
allyStartAtDoor() → allyFromStart:true, same band 109501–109508,
same finding #2600), judged NO-GO in the 2130Z adoption closeout
(ebc163fe8, kill share 0.040 vs 0.15, concept-dead as a kill lever;
mechanism proven, dpr 25.7 → 80). No lever code written, no prereg
frozen, no sims run.

- Dup-check note committed d1c6db7f3 (rebased as 8e8948146), merged
  --ff-only, tree released, branch deleted. The queue item is
  STRUCK: the 2230Z queue entry predated/missed the 2130Z adoption
  closeout. The binding constraint per allystart's metric review is
  staying power / damage-per-survived-round, not assembly.
- Evidence: evidence/2026-11-24/sim-partyassemble-b-dupcheck.md.

## Arm 3 — sim-reunionwild-b (DIAG-GO, ELEVATED-BUT-UNPROVEN, LANDED)

Wilddeath blank #2 / 2230Z next blank (3): is the wild Reunion pack
over-lethal relative to its spawn share? No new sims — a band-level
join of the wilddeath death numerator to the bloodcluster contact
denominator.

- Prereg 99f2b00e0 (frozen before any judged join) + correction
  frozen in the prereg: the fieldFight denominator is the wrong
  channel (all 95 wild deaths are TB fights; field fights never kill
  the scholar — 0 scholar-vid vDie in 2346 rows), so the judged
  denominator is genuine TB starts. No seed/day matching is possible
  (disjoint seed bands); the join is pooled band-level, judged by
  rate ratio with a 95% CI.
- Analyzer 1ad5a787d + proof test 13/13; evidence e4a9f1a63
  (rebased as 49ed4c38f / 43db15a2e / 555201c63). Proof re-run green
  by the coordinator on the rebased tip (13/13). Merged --ff-only to
  master 555201c63. Tree released done-merged, branch deleted.
- Join complete, no classification failures: numerator 95 wild
  deaths, 95/95 attributed to exactly one kind, 0 unclassified,
  0 multi-kind (regDeaths cross-check 95 = 95). Denominator: 89
  genuine TB contacts + 92 refused = 181 w4+ starts; field 211;
  pooled 300 — reproduces bloodcluster exactly.

Joined table (kills per TB contact, wave-4+):

| kind | deaths | TB contacts | kills/contact |
|---|---|---|---|
| reunion | 29 | 23 | 1.26 |
| eulogy | 16 | 16 | 1.00 |
| suburb | 8 | 7 | 1.14 |
| algorithm | 8 | 9 | 0.89 |
| eater | 6 | 7 | 0.86 |
| audit | 4 | 3 | 1.33 (LOW-N) |
| editor | 3 | 3 | 1.00 (LOW-N) |
| spoiler | 3 | 1 | 3.00 (LOW-N) |
| rerun | 2 | 2 | 1.00 (LOW-N) |
| influencer | 2 | 9 | 0.22 |
| strike | 0 | 6 | 0.00 |
| congregation | 0 | 3 | 0.00 (LOW-N) |
| timeslot | 1 | 0 | — (DENOM-ZERO) |
| herald | 0 | 0 | — (structural zero: never enters TB) |

Pooled other wave-4 kinds (≥5 contacts): 40/54 = 0.74. **Rate
ratio RR = 1.70, 95% CI [0.86, 3.37] → ELEVATED-BUT-UNPROVEN.**
Per monster present the rates are nearly even (0.81 vs 0.68) —
the elevation is the **pack** (36 mirrors / 23 fights vs 59 / 54),
not the mirror. Sense-test: three Reunion deaths read as mirror
deaths; the returned move ("Your Move") is the killer in each
(Rosa 109450 d79, Saengduean 109460 d144, Amina 109456 d116).

- Four findings filed in sim-findings.md: bloodcluster per-seed
  table mismatch (pooled totals reproduce, 10/16 per-seed rows do
  not); herald never enters TB (84/84 startCombat calls refused,
  0 genuine TB starts); Eulogy doom prints "Armor absorbs 9735";
  same-day succession deaths on 109460 d144.
- Evidence: evidence/2026-11-24/sim-reunionwild-b.md.

## Wall (this run's judged corpora)

- Fleeguard band 109501–109508 (8+8): wins 0/16, national 0/16,
  table 0/16, wave-5 unlocks ctl 4/8 → arm 2/8 (diagnostic dip, see
  fleeguard metric review), median survival 142.5d → 146d.
- Wilddeath band 109447–109462 (reunionwild join source, no new
  sims): wins 0/16, national 0/16, table 0/16, wave-5 unlocks 9/16,
  faced 7/16, kills 6, median survival 150d (censored).

## Telemetry deviation check

telemetry-check.js on the fleeguard ctl corpus REFUSED recorder
input ("all 8 --current rows carry top-level anchorCommit, so they
are sweep recorder rows, not runs") — the tool working as designed;
recorder corpora compare via sweep-compare tables, never against a
run baseline. No LOUD lines, nothing to investigate. Baseline NOT
rolled.

## Infrastructure

- Worktree cap hit at registration (16/16 active). Freed one slot
  by releasing the previous B run's sim-allystart-b tree (branch
  content already on master as rebased 55c776319; tree clean,
  heartbeat 23:18Z stale; branch left in place, not force-deleted).
  No other run's tree touched; the six held Nov-23 trees (unknown
  owners) were left alone.
- Registry lock jams + `git worktree add` reset slowness: both
  registrations took ~10–18 min (load average 16.5 at 02:15Z,
  journey-scale check.js --quick running concurrently). No
  registry surgery; waited it out. Tree removals likewise slow
  (~18 min for the partyassemble tree's 127k files; the
  reunionwild removal finished in ~1 min).
- Safe-commit index clobber struck the fleeguard adoption commit
  (26 files staged-deleted, byte-identical on disk), the
  partyassemble dup-check commit, and all 3 reunionwild commits —
  repaired each time with the documented `git ls-tree -r HEAD |
  git update-index --add --index-info` pipe, verified status empty
  + diff HEAD empty. Commits always correct.
- check.js --quick on merged master: RUNNING in background at
  closeout (pid 79845, log /tmp/check-quick-b-0130.log) to capture
  the 3 failing scripts' identities left uncaptured by the
  fleeguard worker's report (344 scripts, 3 failures). Result NOT
  yet known at this commit — carried as an open gap; see the
  tracker entry for the outcome.
- No write-flap windows observed during this run's own writes
  (the 2230Z run's flap had cleared); the probe passed at each
  worker's start.

winnability-chain stays converging (NOT converged): the flee guard
is landed and judged GO, the Reunion question is answered
(elevated but unproven, pack-size mechanism), and the party-assembly
queue item is struck as a duplicate — but villages still reach wave
5, survive, and never reach national or win. scale-onramp stays
converging (untouched; sibling loop A). Next blanks, in order:
(1) call-sounding muster instrument (2230Z blank #4); (2)
launch-fitness fresh band (blank #5); (3) same-fight different
labels (wilddeath blank #3); (4) the reunionwild findings —
herald TB entry, bloodcluster per-seed table, Eulogy doom absorb
line, same-day succession deaths.

Merged locally, pending ship: fleeguard-b 149a59984 +
partyassemble dup-check 8e8948146 + reunionwild-b 555201c63.
