# sim-winnability-round-0430 — Loop B (aidgate adoption PILOT NO-GO + courtship-reconfirm CONFIRM GO, both LANDED, merged locally pending ship)

**Run:** fleshout-loop-b-20261116T0430Z. **Axis:** winnability chain (re-pointed 2026-11-03; food-economy parked, no new food arm).
**Master at closeout:** bbb3a9fac (arm 2) + this coordinator evidence commit. **Coordinator evidence commit:** (this file).

## Stale-lock recovery

Lock 0130Z was 2h52m old at 04:29Z (created 01:37:00Z). Its tree
sim-aidgate-b's heartbeat was 03:29:53Z — 59 minutes stale, past the
15-minute guard — and its aidgate worker subagent showed done/cancelled
with no result of its own, with no file writes in the tree in the last
15 minutes. The previous run is DEAD by the guard (and past the
90-minute fallback). Dead claim `fleshout-loop-b-20261116T0130Z.json`
retired to `.DEAD` with a note; new lock + claim written for this run.
Of the 0130Z run's three arms, gatereach (126382932) and covenantsmoke
(6ca37144b) were already on master — only the aidgate pilot evidence
was orphaned, uncommitted in its worktree. Loop A live on scale-onramp
throughout (0315Z claim: sim-dawnbid-a + sim-ammocensus-a) — NOT
touched; Loop A landed mid-run (d39ce6e8c) with zero file overlap.

## Arm 1 — sim-aidgate-b adoption (PILOT NO-GO, landed as 655949b97)

Adoption of the stranded 0130Z pilot. Verified before landing, not
taken on the dead worker's word: proof `test-aidgate-b.js` 4/4 green
in the worktree; `git diff HEAD -- src/` empty (lever reverted, game
code byte-identical to the prereg base); analysis JSON re-pooled
independently — control = lever on every pooled number (unlocked 3/8,
field kills 2, TB kills 7, starvation 3, national 6/8, wave-5 3/8,
per-seed lines identical except seed 100825's door-consult counts);
judge verdict NO-GO (field kills per unlocked 0.67 < 1.00); panel
`review_required`, no material signal. Worker's evidence:
`evidence/2026-11-15/sim-aidgate-b.md` (prereg
`sim-aidgate-b-prereg.md`, commit ee45b3b40).

- The lever (door version of the win-plan gate routed through
  `aidFight`, trick opener on SEEK) fired correctly and changed zero
  fight outcomes across the band (100821–100828, 150d,
  competent-answercourt-b). All 7 door consults happened on seed
  100825; 6 returned null on trick-hold (party ready, trick unknown);
  the 1 SEEK (day 111, Ivy vs timeslot) hit a species with no round-1
  opener branch — the fight opened with a strike and ended in a flee,
  while the door line claimed a trick opening. The two field kills
  the band produced were both consulted, both trick-unknown, both won
  without any trick, exactly as in control.
- Mechanism: the binding constraint is **trick knowledge at the
  door**, not gate routing. Villagers learn counters by surviving
  fights, so the door fights that need the trick are the same fights
  that would teach it — a cold-start loop the consult cannot break.
  Next lever, if any: teaching, scouting, or the deferred
  lingerer-hunt plan — not another consult route. Narrower defect
  worth fixing if the line is ever reused: gate the door line on
  species with an opener.
- Landing: 2 commits (ee45b3b40 prereg + 89645cebe evidence/instrument,
  rebased as ec4fb1823 + 655949b97); zero `src/js`; proof re-run 4/4
  on the rebased tip; merged ff-only, exit 0. Safe-commit index
  clobber hit the evidence commit (all 26 files staged-deleted,
  worktree copies byte-identical) — repaired via the ls-tree pipe,
  commit verified correct.

## Arm 2 — sim-courtship-reconfirm-b (CONFIRM GO, landed as bbb3a9fac)

Re-confirm of the courtship-rework2 PILOT GO on the reserved band
100621–100636 (16 seeds x 2 policies, 200d, death-aware, identical
seeds; policies competent-covenant-b vs competent-courtship-b).
The 2330Z confirm was NO-GO on G3 drift only (test-covenant-b 32/33),
no judged sim ran, band unspent; the 0130Z covenantsmoke arm revised
the smoke to the new opinion timing and re-checked the substrate,
unblocking this re-confirm. Worker's evidence:
`evidence/2026-11-16/sim-courtship-reconfirm-b.md` (prereg
`sim-courtship-reconfirm-b-prereg.md`, inheriting the frozen gates
verbatim + recording the revised G3 baselines).

- G1 GO (32/32 complete, 0 errors, UNCLASSIFIED 0, pilgrim rollup on
  every armed record). G2 GO (covenant staged **14/16** armed vs 6/16
  control; 16/16 beats answered 'pact' + sat; zero-move pilgrim-days
  **0** band-wide; stale drops **0**; lead 0/16, isolation held).
  G3 GO (0 `src/js`; rework2 59/59, rework 58/58, courtship 57/57,
  covenant **40/40** revised, onlylead 29/29, onlylead2 **26/26**
  revised — baselines updated by covenantsmoke 6ca37144b, documented
  explicitly in the prereg; no test edited to go green). Cost bar
  PASS (starvation **5 vs 8**; median survival **187.5d vs 179.0d**).
- The control leg now stages 6/16 on its own (was 1/8 in the pilot)
  — the lever accelerates an already-opening road (opinion-10 median
  d8.5 vs d52), it no longer opens a closed gate. The G2 bar still
  judges the armed leg and passes with margin; the framing, not the
  verdict, changed. Two armed non-stages (100630, 100636) are
  seasoning-bound (2-of-3 seasoned), not walk-bound — the seasoning
  gate is the next binding constraint on this road.
- §14c guardrail trips on **100633** (+74% villager combat deaths, a
  real rate increase); 100628 sits exactly at +50%. Starvation split:
  all 5 armed starvation deaths had the full aid spend paid 34–140
  days before the death, last pilgrimage ending 34–140 days prior —
  neither spend nor absence explains them.
- Sense-testing: the Founding Council reads like a played ceremony;
  deeds arrive as played lines with named bearers and villages. Two
  engine-text blemishes persist: LINK_LINES_CAP=900 cuts council
  lines on 4/14 staged seeds, and the engine homecoming line repeats
  daily (up to 26x — same item already [open] in the backlog).
  walkRefusals BFS/greedy split is unmeasured — the landed policy
  carries a single counter with no per-site log; splitting it needs
  a policy-side change, out of scope for this sweep-only arm
  (16 refusals total, all on 0-zero-move seeds).
- Coordinator verification (independent of the worker's report):
  re-pooled the analysis JSON — staged 6/16 control / 14/16 armed,
  answers 7/7 control / 16/16 armed, starvation 8 → 5, total deaths
  1560 → 1412, wave-4 kills 73 → 71, wave-5 kills 23 → 14, wave-5
  ever 11/16 → 12/16, zero-move 0 both legs, medians 179.0d / 187.5d.
  Two slips corrected by coordinator commit bbb3a9fac (evidence-only,
  no gate affected): the wall table's "National ever 3/16 → 9/16"
  was the FINAL count mislabeled — true ever is **6/16 → 14/16**;
  control "Median survival 179.5d" is **179.0d**. The worker's commit
  message (24ea390c5) still carries the old numbers in its title;
  the correction commit documents them.
- Landing: 3 commits (04b45a930 prereg + instrument, 69c468cb2
  corpora/analysis/panel/evidence, bbb3a9fac coordinator correction;
  rebased as 205a4c531 + 24ea390c5 + bbb3a9fac onto ee15880b0);
  zero `src/js`; six proofs re-run green on the rebased tip
  (59/59, 58/58, 57/57, 40/40, 29/29, 26/26); merged ff-only,
  exit 0. Band 100621–100636 is now SPENT. Findings item "THE
  PILGRIMAGE STALLS ON FAR VILLAGES" marked [fixed].

## Wall (this run's judged corpora)

| | aidgate control | aidgate lever | reconfirm control | reconfirm armed |
|---|---|---|---|---|
| National ever | 6/8 | 6/8 | 6/16 | **14/16** |
| National final | 6/8 | 6/8 | 3/16 | **9/16** |
| Table / wins | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Wave 5 ever | 3/8 | 3/8 | 11/16 | **12/16** |
| Wave-5 kills | 9 (2 field + 7 TB) | 9 | 23 | 14 |
| Median survival | 150d | 150d | 179.0d | **187.5d** |
| Starvation | 3 | 3 | 8 | **5** |

## Telemetry deviation check

REFUSED on both corpora (anchorCommit recorder guard, by design —
recorder corpora are compared with sweep-compare tables, never
against a run baseline), same as the 2230Z/1630Z/1810Z/2015Z runs
and Loop A's 0315Z run. Baseline NOT rolled, no LOUD lines.

## Infrastructure

- Master moved twice under the run (ship-loop bump ee15880b0, Loop A
  0315Z round d39ce6e8c) — zero file overlap with either arm.
- Safe-commit index clobber struck three times: the aidgate evidence
  commit (26 files staged-deleted), the reconfirm worker's two
  commits, and the coordinator correction commit (MM form on the
  single file) — all repaired via the ls-tree pipe, commits verified
  correct with empty status/diffs and matching blobs.
- Runtime restart interrupted the reconfirm sweep at 20/32; resumed
  from verified checkpoints (20 files validated as complete JSON
  with 0 errors; remaining 12 ran fresh; nothing re-run or
  overwritten).
- Registry-lock contention severe at registration (~2.5 min for the
  reconfirm tree). No write-flap strike this run. No rebase-stop
  quirk this run (both rebases clean first time). check.js --quick
  NOT re-run (zero `src/js` on either landed branch; loop precedent).

## Findings backlog

- "THE PILGRIMAGE STALLS ON FAR VILLAGES" marked [fixed] (confirm
  GO holds the pilot GO on fresh seeds; band spent).
- Two new [open] items appended: walkRefusals BFS/greedy split
  unmeasured (policy-side log needed); LINK_LINES_CAP=900 cuts
  council lines on 4/14 staged seeds.
- Homecoming-line daily repeat persists in the re-confirm corpora —
  already [open] in the backlog; not re-filed.

## Next blanks, in order

1. **Second-companion pool** — widen beyond villagers idle at Haven,
   or make waiting plans do useful work; Loop A's dawnbid DIAG names
   the same gate from the other side (plans sit at party stage for
   weeks with no eligible companion).
2. **Gate-reachability instrument follow-up** — why `winPlanFightGate`
   is consulted ~2–3 times per 8-seed leg; route launched parties
   through the gate on arrival, or move the party-of-3 + trick-known
   treatment onto the world-tick path where the wave-5 field fights
   actually happen.
3. **Seasoning gate** — the two armed non-stages are 2-of-3 seasoned;
   the next binding constraint on the covenant road.
4. **§14c watch on seed 100633** — real +74% villager combat-death
   rate increase under courtship; confirm whether it reproduces.
5. **Trick knowledge at the door** — teaching, scouting, or the
   deferred lingerer-hunt plan (aidgate mechanism); not another
   consult route.
6. Answercourt lever landing decision (Steve / main session).
7. Competent seat-taking BUILD (Steve-call).
8. Family-7 program decision (still open).

## Convergence

winnability chain stays **converging** (NOT converged): the covenant
road is now proven open on a 16-seed confirm (14/16 staged, national
final 3→9, ever 6→14, survival up, starvation down), but wins are
still 0 everywhere, wave-5 kills fell while facing rose, and the gate
SEEK — the designed meeting point for wave-5 killing — has still
never fired in any leg. scale-onramp stays converging (untouched;
sibling Loop A). food-economy stays converging (untouched; parked).
Claim deleted; lock deleted. Evidence: evidence/2026-11-16/sim-winnability-round-0430.md
(this file).
