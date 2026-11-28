# Loop B run fleshout-loop-b-20261128T0830Z — ADOPTION + NEW ARM (axis winnability-chain)

**Run:** fleshout-loop-b-20261128T0830Z · **Axis:** winnability-chain (converging, NOT converged) ·
**Master at run start:** `fbaa308fe` (Loop A 0615Z seatvoice GO) · **Master at closeout:** `9b7393772`
(sim-cousinevade-b merge; journey-endgame r296 `d84d0ba74` landed in between) · **Type:** adoption run
(dead 0530Z run) + one fresh DIAG arm.

## Stale-lock recovery at start

The 0530Z B lock was 2h33m old (created 05:55:36Z) with tree heartbeats 42 min stale
(`sim-rejudge-b` / `sim-rejudge-b-baseline`, last heartbeat 07:46:53Z), no live coordinator
process in `ps`, and all three of its workers done (winflee DIAG-NO-GO complete 08:12:41Z;
rejudge worker 1 blocked at step 1 on a cherry-pick conflict; rejudge worker 2 cancelled
mid-baseline). Per the 15-minute guard the run was DEAD: lock deleted in the same call as
its read (run_id matched), dead claim retired to `.DEAD`. Loop A 0615Z had finished live
just before run start (its lock deleted ~08:29Z, seatvoice GO merged `fbaa308fe`) — NOT
touched. Loop A 0815Z started mid-run (live claim `fleshout-20261128T0815Z.json`, sitting
policy + national road) — NOT touched. Pre-flight: main tree clean, disk 54%, reap clean
(the 0430Z reaper jam had cleared). Registry active 14/16 at run start; 16/16 at the
cousinevade registration (Loop A took linkdrive + sitpolicy first).

No coordinator record or tracker entry had existed for 0530Z — this entry + this file
close that gap (same pattern as the 0615Z adoption of dead 0015Z).

## Arm 1 — sim-rejudge-b adoption (stranded arm of the dead 0530Z run)

**Verdict: NO-GO. Branch `sim-rejudge-b` HELD unmerged at `cdf5aa3fe`; fixes stay HELD.**
The 0530Z worker 2 (cancelled) had already resolved the cherry-pick conflict by rebasing
onto `bcf06e019` — the policy fixes sit on the branch as rebased commits `1392597d2`
(fleerepair TB wasted-turn fix, = held `0ed0bf12d`) and `d3a62a6a8` (emptybow ammo check,
= held `40f04fe1c`). This run's worker verified policy equivalence, rebased onto
`aa3860792` (9/9 picks clean; diff check passed — only `src/js/table.js` + new
seatvoice/winflee/journey scripts files), re-ran proofs green
(test-fleerepair-b 45/45, test-emptybow-b 33/33, test-rejudge-instrument-b 27/27,
test-fleerepair-20261104 ALL PASS), completed the baseline TB leg (seed s112412 after a
byte-identical determinism re-run of s112402), ran the armed legs, and judged against the
frozen prereg (`evidence/2026-11-28/sim-rejudge-b-prereg.md`).

| Bar | Rule | Measured | Result |
|---|---|---|---|
| P PRIMARY | kills/exposure ≥ 1.5× baseline AND kills ≥ 12 | 0.4066 vs 0.3093 baseline (**1.315×**); kills 37 ≥ 12 | **MISS** |
| G1 | failed-strike turns ≤ 5 | **12** — all one dry-bow Influencer fight (s112402 seq 11 d137) | **BREACH** |
| G2 | flee-attempts/exposure ≤ 1.15 | pass | PASS |
| G3 | zeroTile ≤ 1 / rageInstead ≤ 1 / noAction ≤ 5 | 0 / 0 / **124** — 119 in one 120-round Influencer standoff (s112402 seq 10 d135) | **BREACH (no-action only)** |
| G4 | median ≥ 145d, wave 5 ≥ 1/8 | 150d, 8/12 | PASS |
| G5 | 0 instrument errors; D3 byte-identical | 0 errors across all 48 files; D3 identical | PASS |
| G6 | emptyBowSwitches + emptyBowUnequips ≥ 1 | 6 switches fired (30 weaponChanges) | PASS |

Baseline (plain master `bcf06e019`, band 112401–112412, 150d): TB 97 exposures, kills 30,
kills/exposure 0.3093. Armed (policy `395ce5ab…`, anchor `ef10fa39d`): 91 exposures,
kills 37, 0.4066. Kills rose +23%, fighter deaths per exposure fell 0.629 → 0.516 — but
the needle did not move 1.5×, and under metric binding a miss is NO-GO, never re-scored.
Panel: review_required. Evidence: `evidence/2026-11-28/sim-rejudge-b.md` (on branch
`sim-rejudge-b`, judged commit `f278659d7` + amendment `cdf5aa3fe`), with full corpora
(24 baseline + 24 armed per-seed files + D3), panel files, and §6 metric review.
Baseline corpus committed in the baseline tree (`sim-rejudge-b-baseline`, `6db9babdc`,
clean, heartbeat fresh; tree left registered — its corpus is also copied on the rejudge
branch).

**The two breaches are single-fight shapes, not the fix failing broadly.** G1: the switch
path FIRED every round (two `Game.equip` attempts, `dryBefore: true`) but both were no-ops
— `ensureStrikeWeapon` returns without reaching the unequip fallback when a packed weapon
won't seat (that branch runs only when the candidate list is EMPTY, `competent.js:2577`).
The proof test covered dry-bow + empty pack, not dry-bow + a packed weapon that refuses
to seat. Filed as finding (sim-findings.md line 2788). G3: the 119-round standoff is a
monster-imposed turn denial (Influencer RATIO; the fighter starts each turn already
acted, `moveLeft: 0`) — the policy is never given a turn to waste. The baseline itself
measures 101 no-action turns, so the ≤5 bar's premise ("both prior armed legs all 0")
does not survive this band. §6 proposals for the next arm: re-base G3 (exclude
already-acted turns, or bar per-exposure medians; treat a >50-round standoff as its own
instrument signal), and require the switch path to fall through to unequip when seating
fails — then re-judge vs the SAME frozen bars. Do NOT lower the bar to 1.3× to claim
this run; the next arm brings a stronger lever (seat-failure fix + damage, per the
winflee DIAG-NO-GO) and re-judges.

**Coordinator decision — the newer-master flag (RESOLVED, no re-judgment):** the worker
flagged that master tip `9b7393772` (the cousinevade merge) modifies
`scripts/analyze-fleerepair-b.js` (+217 lines), one of this arm's analyzer files, and
rebased only onto `aa3860792` as directed. The coordinator verified:
`scripts/analyze-fleerepair-b.js` at `9b7393772` is BYTE-IDENTICAL to the branch's copy
at `cdf5aa3fe` — the cousinevade merge only ADDED the file to master (it did not exist
on master before); the instrument itself is unchanged. The `aa3860792` base is accepted;
no re-analysis, no re-judgment. The judged numbers stand on the instrument as it was.

## Arm 2 — sim-winflee-b verification (coordinator; already on master)

The 0530Z run's arm 2 landed before its coordinator died: commits `80ef3f45b` (prereg),
`0e0a6272e` (pilot judged), `6dc7304ae` (post-rebase note) are all ancestors of master;
no branch remains. Verified on master: **DIAG-NO-GO on the wall claim** — the flee call
is NOT the binding wall; damage is. W1: winnable share 1/9 = 0.111 (bar ≥25% + ≥3 cases);
W0/W2/W3/W4/W5 all PASS. Wall (§7): national 0/8, table 0/8, wins 0/8, wave 4 8/8,
wave 5 5/8, median survival 150d. Evidence `evidence/2026-11-28/sim-winflee-b.md` +
prereg + corpus + instruments on master. Nothing further to merge.

## Arm 3 — sim-cousinevade-b (fresh DIAG; 0430Z next blank 3, finding #2504)

**Verdict: DIAG-GO on classification. MERGED locally, pending ship (`9b7393772`).**
Prereg frozen 08:58 UTC before any classification (`054f024b0`); classification committed
`d9c3fd206`, rebased onto `d84d0ba74` clean (2/2 picks, no overlap with the journey r296
landing), proof 14/14 green on the rebased branch AND on merged master. Frozen bars
C0–C6 all PASS. Classification of the 42 launched evades on band 112301–112308:
**WISE 15 (35.7%) / WASTED 0 (0%) / UNDECIDED 27 (64.3%)**; frozen decision rule names
**NO-LEVER** (wise 35.7% < 60% X, wasted 0% < 25% Y). Scope-sensitive, flagged honestly:
under per-leg scope the split would read WISE 27/42 (64.3%) and name DAMAGE — the next
classification must freeze scope + D_BEST form up front; this run does not re-score.
Wall carried: build national 0/8, table 0/8, wins 0/8, wave 4 8/8, wave 5 3/8, median
149d; armed same except median 150d. Evidence `evidence/2026-11-28/sim-cousinevade-b.md`
+ prereg + analysis JSON + classifier + proof, on master. Tree released done-merged,
branch deleted, main tree clean.
Finding #2504: classification program complete on this band; the finding itself stays
OPEN — the evade is neither exonerated nor condemned corpus-wide (27/42 undecided).
Three new findings appended (sim-findings.md): parties meet strangers not targets
(2/42 targetMatch); evades teach nothing (trick known 0/42); party HP beyond the lead
is unrecorded.

## Wall (this run's judged corpora)

| Corpus | National | Table | Wins | Wave 4 | Wave 5 | Median |
|---|---|---|---|---|---|---|
| rejudge baseline (12) | 0/12 | 0/12 | 0/12 | 12/12 | 8/12 | 150d |
| rejudge armed (12) | 0/12 | 0/12 | 0/12 | 12/12 | 8/12 | 150d |
| winflee pilot (8) | 0/8 | 0/8 | 0/8 | 8/8 | 5/8 | 150d |
| cousinevade build/armed (8+8, carried) | 0/8 | 0/8 | 0/8 | 8/8 | 3/8 | 149d/150d |

The scale wall stands exactly where the fleerepair band left it: villages reach wave 5
and survive, none reaches national, none enters the table, none wins.

## Telemetry deviation check (coordinator re-run)

`telemetry-check.js --allow-recorder-corpus` against
`telemetry-baselines/scale-wall.json`, once per leg dir (rejudge TB/field ×
baseline/armed): identical 3 LOUD lines on all four (national 12 → 0, table 16 → 0,
wins 16 → 0) — the documented regime artifact (WINSEAT baseline vs pre-seat
competent-verbatim substrate; this run's own baseline is 0/12 on every wall metric and
the armed leg matches it exactly). Baseline NOT rolled, no new investigation. (The tool
refuses recorder-corpus input without `--allow-recorder-corpus`; the worker's run used
the same flag.)

## Infrastructure

- Registry lock heavily contended all morning (Loop A registering three trees in
  parallel; load 9–14): coordinator heartbeats failed twice on the held lock (retried,
  landed); first cousinevade registration hit its 280s timeout and died mid-way
  (orphan python survived briefly, dir reaped); retry at 600s succeeded in 441s.
  Registry hit 16/16 at the cousinevade registration (Loop A linkdrive + sitpolicy
  landed first); back to 15/16 after the cousinevade release.
- VM restart ~09:15Z killed the cousinevade `check.js --quick` run and swept `/tmp`:
  corpora re-extracted from the held branches via `git archive`, classifier re-run
  byte-identical, proof re-run green. `check.js --quick` is recorded as INCOMPLETE on
  that arm (first attempt timed out at 110s, 28/344 scripts, no failures shown), not
  claimed. The rejudge worker survived the restart (still running, active throughout).
- Safe-commit index clobber: cousinevade ×2, rejudge amendment ×1 — repaired each time
  with the `ls-tree | update-index --index-info` pipe, commits verified hash-identical
  to HEAD. No work lost.
- Worker failed execs on record (final states verified clean, proofs green): rejudge —
  1 exec exit 1 + 1 process.poll unknown; cousinevade — 2 exec exit 1 (VM-restart
  related). No action outstanding.
- Master moved three times under the run (journey-deepening r293 ×2, journey-endgame
  r296, cousinevade merge). Rejudge branch NOT re-based past `aa3860792` (see the
  instrument decision above); cousinevade re-based once, clean.

## Next blanks, in order

1. Seat-failure fix + damage, re-judged vs the SAME frozen rejudge bars (do NOT lower to
   1.3×): `ensureStrikeWeapon` must fall through to unequip when seating fails
   (sim-findings.md line 2788); G3 re-based per §6 (exclude already-acted turns, or bar
   per-exposure medians; >50-round standoff as its own signal).
2. #2504 follow-up classification with scope + D_BEST form frozen up front (per-leg
   scope would name DAMAGE — settle the scope question before any lever is judged).
3. The three new findings (strangers-not-targets; evades-teach-nothing; party-HP
   recorder gap) + the standing-199 stall on the fleerepair band (#2773) + arena
   pre-turn flee #2292 (still undiagnosed, now 2+5+3 occurrences).

## Axis state

winnability-chain stays converging (NOT converged): the combined wasted-turn fix lifts
kills/exposure 1.315× but misses its frozen bar, the flee call is exonerated as the
wall (damage is), and the cousin evades classify 15 wise / 0 wasted / 27 undecided
with no lever named. The damage race, not turn economy or the flee call, is the
binding wall — and the next levers are the seat-failure fix + damage. scale-onramp
stays converging (untouched; sibling loop A). Claim deleted; lock deleted.
Evidence: `evidence/2026-11-28/sim-winnability-round-0830.md` (this file).
