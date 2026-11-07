# Loop B winnability round — 2030Z (2026-11-07)

Run `fleshout-loop-b-20261107T2030Z`, axis scale-onramp / winnability chain
(converging, NOT converged). Loop A live on food-economy the whole run
(1928Z claim: sim-sickfloor-a + sim-feveranat-a + sim-tendsick-a); NOT touched.
Master at run start a2e005cbe; master at closeout 1d1dbb467.

## Stale-lock recovery (1830Z run died)

The 1830Z B lock (18:33:11Z, 116 min old) was deleted: both its workers were
cancelled at 19:30:27/28Z, its trees' heartbeats were 66–68 min stale, newest
tree files 19:29–19:30Z. Its feareddoor re-judge had LANDED before death
(1a8ead6bb, GO under the revised metric — feared wins 5 vs 0, margin +5,
guard 12/12, cost bar clean). The 1830Z claim was retired to .DEAD with a
note; its two stranded arms were adopted in their existing trees by this run.
The 1830Z run died before writing its tracker review — that review is folded
into this file and the tracker entry below.

## Arm 1 — sim-witnessdoor-b (ADOPTION, GO; merged 34ee42f0c)

Predecessor left prereg + tooling committed and pilot corpora untracked. The
worker rebased onto a2e005cbe (r112 specialist-ladder fix is survival-relevant)
and RE-SWEPT the pilot on the rebased tip; the stale c88 corpus was discarded,
never judged.

Pilot 8 (53201–53208): witness 3/8, margin +3, guard 8/8, cost clean → GO.
Confirm 12 (53201–53212):

| Bar | Result |
|---|---|
| Witness entered armed ≥ 4/12 | **5/12** |
| Margin over baseline witness-entered ≥ 3 | **+5** (baseline 0/12) |
| Witness wins (expectation ≥ 3) | **5/5** |
| Substrate sanity: baseline lesser ≥ 4 AND sat ≥ 4 | 8 lesser, 5 sat |
| Substrate guard | **12/12** exact pre-first-entry |
| Cost: starvation ≤ baseline+2 | 7 vs 7 (cap 9) |
| Cost: arm-only starvation ≤ 1 | 0 |
| Cost: median ≥ 0.8× baseline | 92d vs 92d |
| Per-seed non-inferiority | 12/12 |
| Witness offered-but-unwalked, armed | 0 |

Every sat seed was offered all six doors; the armed leg took witness-first on
all 5. Entry lag 0, 0 downgrades, 0 conscripts (no dark walk fired), 0
trial-only skips, 5 answers per walk, 0 instrument errors. **All seven doors
have now been walked on this band.**

Sense test: 4 witness transcripts read end to end (53201, 53205, 53206 pilot;
53212 confirm). The walk reads coherently — honest audit, Docket grant,
light-road line matching the ledger, voiced public-defense beat, charges
final, earned win. **Blank found and documented:** beats 1–2 (`beat:cold`,
`beat:let`) produce no narrative lines, and the defense witnesses never
testify in their own words despite TABLE.md canon — logged to sim-findings.md.
Dark-branch witness and trial-by-combat stay unmeasured.

Proof 33/33 + 38/38 with LIVE SMOKE (53201 walks witness@d90/light), green on
the rebased tip and after the closeout rebase. Panel review_required, all
observed deltas 0 (expected — policy-side door pick, identical pre-entry
trajectories). Evidence: evidence/2026-11-07/sim-witnessdoor-b.md.

## Arm 2 — sim-feaststopspend-b (ADOPTION, NO-GO, killed at pilot; merged 823291451)

Predecessor left prereg + tooling committed (proof 25/25) and panel +
analysis + corpora untracked. The worker rebased onto a2e005cbe and RE-SWEPT
both legs (r112 survival-relevant; the re-sweep moved 5/8 re-baseline
trajectories). The panel/analysis were verified by re-running the analyzer
over the corpora, not trusted.

| Bar | Armed | Bar | Pass |
|---|---|---|---|
| **Pair days (PRIMARY)** | **5** | ≥ 35 | **NO** |
| foodDeeds | 5/8 | ≥ 4/8 | yes |
| Donations | 30,230 kcal | ≤ 55,235 | yes |
| Starvation deaths | 3 | ≤ 2+2 | yes |
| Median survival | 123.5d | ≥ 110d | yes |

Before / after (re-baseline vs armed, identical seeds 53001–53008):

| Metric | Baseline | Armed |
|---|---|---|
| Pair days | 52 | **5** |
| foodDeeds / surge spent | 5/8 / 5/8 | 5/8 / 5/8 |
| Donated kcal | 55,235 | 30,230 |
| Feasts / draws / faced | 20 / 14 / 10 | 11 / 9 / 9 |
| Wave-4 kills | 31 | 21 |
| Wave-5 kills / unlocks | 3 / 2 seeds | 0 / 1 seed |
| Median survival | 137.5d | 123.5d |
| Survived | 2/8 | 2/8 |
| Starvation deaths | 2 | 3 |
| Standing (total) | 1,894 | 1,559 |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 |

The stop bound exactly as designed (0 post-spend feasts/donate-downs on all 5
bound seeds; donations cut as intended; deed kept) — but pair days went to
zero on every seed where it engaged (53004: 29→0, 53005: 18→0); all 5
remaining pair days sit on 53007, where the stop never bound. **Third feast
throttle in a row to fail the same pair-days bar for the same reason: feast
draws are the pair factory.** The feast road is closed; the next arm is a
pair-overlap lever, not a fourth throttle. Findings #1869 updated.

Proof 25/25 green on the rebased tip and after the closeout rebase. Zero
src/js; the wrapper policy lands as a measured instrument (default-off), not a
default. Evidence: evidence/2026-11-07/sim-feaststopspend-b.md.

## Arm 3 — sim-frozenband-bisect-b (NEW DIAG, GO; merged 1d1dbb467)

Bisect of the frozen band 53001–53008 collapse in 62ca38845..cf22937b8
(findings #1885, tracker blank 3). Prereg committed before any judged sweep
(3 game-code candidates, frozen doorwalk baseline instrument, flip bars).

Journey-deepening r114 (`16369893c`, bond/link gating) is HEALTHY (median
150d, sits 5/8); **xp-gear (`50881fbf2`, synergy bonus + healing deed
coverage + gear protection retune) is COLLAPSED (median 70.5d, sits 0/8)**;
the tip `cf22937b8` is identical to xp-gear on all 8 seeds. Linkraise is ruled
out (the replay instrument never loads it) and the flip predates it.

Per-seed flip table (C1 = 62ca38845, C2 = 50881fbf2, doorwalk baseline leg, 150d):

| Seed | C1 days | C2 days | Δ | C1 seat | C2 seat | C1 stand | C2 stand | C1 w4 | C2 w4 |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 150 | 88 | -62 | — | — | 175 | 199 | 0 | 3 |
| 53002 | 79 | 84 | +5 | — | — | 125 | 100 | 0 | 0 |
| 53003 | 150 | 68 | -82 | lesser d90 | — | 344 | 120 | 3 | 0 |
| 53004 | 150 | 73 | -77 | lesser d94 | — | 260 | 199 | 2 | 2 |
| 53005 | 97 | 54 | -43 | lesser d90 | — | 230 | 199 | 3 | 1 |
| 53006 | 150 | 66 | -84 | lesser d90 | — | 849 | 190 | 8 | 1 |
| 53007 | 86 | 63 | -23 | — | — | 99 | 125 | 0 | 0 |
| 53008 | 150 | 92 | -58 | lesser d90 | — | 199 | 199 | 0 | 3 |

Endpoints reproduced exactly per the prereg bars (L0: median 150d, sits 5/8;
L1: median 70.5d, sits 0/8, deaths 54–92d, 53008 d92 / earned d55 / 2
preview-ready days with 8× "not-ready" skips). 0 instrument errors on all 40
seed-runs.

Mechanism: trajectories diverge in week 1 (first fights identical, then split
d7–15); early violent deaths thin the roster 2–3 by d25 (ambush d9/d14, Living
Wire d15); villages die village-lost d54–92 with end-stage mass starvation
(11 vs 1) while their fighters keep winning on camera (53003's Mateo kills
Gavel, Chorus Line, and The Callback while three villagers starve the same
week); standing caps ~199, wave 5 never unlocks, seats earned but never sat.
The collapse is not "fighters lose fights" — it is "the village loses people
early, then cannot feed itself."

Within-landing partition (post-prereg probes, disclosed in evidence): the gear
retune alone (P2) carries most of the median collapse (150→76d, sits 2/8);
the XP/synergy half alone (P1) restores the median (150d, sits 4/8) but leaves
3/8 seeds dying d45–62; neither half alone reproduces the full collapse.
Leading hypothesis for the retune's harm is the loadout shift (armor kept over
weapons/tools in the opening keep-5); the fix-shape prereg sketch (loadout
census, then a scoring-vs-combat partition) is in the evidence. No fix built —
DIAG only. Findings #1885 updated.

Proof 14/14 green on the rebased tip and after the closeout rebase (includes
an analyzer bug fix found mid-run: it first read the SIT day from daily seat
rows, which show the EARNED day, not the taken day). One non-barred
discrepancy recorded: the 1430Z doorwalk table lists 53006 base maxWave 4,
but this run reads 5 — the table's own w5-kill count (1) and the daily
snapshots (wave 5 from d102) agree with 5.
Evidence: evidence/2026-11-07/sim-frozenband-bisect-b.md.

## Master movement during the run (journey-crisis r154)

Master moved once under the run: journey-crisis r154 landed
(d6b3c6d0b + c8bfe6ea6 — betrayal softlock fix: whiff guard extended to
hostile humans, round wrap calls tbRoundWrap in the async fight path).
All three branches were rebased onto explicitly re-read SHAs (c8bfe6ea6, then
823291451, then 34ee42f0c), proofs re-run green after every rebase and on
merged master (feaststopspend 25/25, witnessdoor 33/33 + 38/38 smoke, bisect
14/14). **No re-sweep was needed for r154:** its behavioral delta is confined
to fights with a living hostile human (betrayal/uprising/justice), and the
judged corpora contain 0 betrayal/hostile/uprising markers and 0 whiff-guard
firings (the 4 "comes apart" hits are one succession narrative line on 53207).
The corpora therefore stand on the rebased tip; this check is recorded here,
not assumed.

## Telemetry deviation check

`telemetry-check.js` refused recorder-corpus input by design on both judged
corpora (as the witnessdoor prereg predicted); no LOUD line, nothing to
investigate. Recorder corpora are compared with sweep-compare tables, which
both arms' panels already do.

## Scale-wall numbers (this run's judged corpora)

- Witnessdoor confirm (12 seeds 53201–53212): national 0/12, table sat 5/12,
  wins 5/12, wave-4 unlock 11/12, wave-5 unlock 2/12, wave-5 kills 0, lesser
  8/12, full seat 0/12, median survival 92d (identical both legs).
- Feaststopspend pilot (8 seeds 53001–53008): national/table/wins 0/8 both
  legs; wave-5 unlocks 2 seeds baseline → 1 armed; wave-5 kills 3 → 0;
  median 137.5d baseline → 123.5d armed.

## Village assessment (plain words)

The table's door menu is now fully measured — all seven doors walked, witness
the last one, and it wins every time it is offered. But the wall has not
moved: no village reaches national, no full seat, no wave-5 kills on the
judged bands. The feast-surge road is now closed three times over — every
attempt to tame the feast's cost kills the very thing that makes pairs,
because the feast's draws are where pairs are made. And the frozen band's
collapse has a name now: the xp-gear landing made villages lose people in the
first two weeks, and a village that loses people early starves even while its
fighters win fights on camera. The next work is the gear retune's loadout
question and a pair-overlap lever — not another feast throttle.

## Metric review

- Witnessdoor: the median-survival bar is near-vacuous on this design
  (median identical both legs by construction — a policy-side door pick);
  the next prereg should consider a sat-rate sanity bar. No re-score; the
  verdict stands on the entry/margin/guard/cost bars.
- Feaststopspend: the prereg's EAT FIRST dry-up prediction failed on 53004
  (staged feasts kept lighting post-deed); the pair-days primary held as the
  judge. The cost bar passed on every line except the one that matters.
- Bisect: endpoints reproduced exactly; the P1/P2 partition was a post-prereg
  probe, disclosed as such — the prereg's GO bars were endpoint
  identification, which passed.

## Infrastructure

- Safe-commit index clobber hit the evidence commit on all three workers;
  each repaired via HEAD-blob cacheinfo (witnessdoor's first repair attempt
  mangled paths; its mixed-reset repair was verified — commit intact, 45
  files) and verified by the coordinator (`git status` empty, `git diff HEAD`
  empty, proofs re-run on the rebased tips).
- Registry flock / worktree operations remain slow (~2–4.5 min per
  register/reap/release); `git status` times out on the bisect tree's
  filesystem (cleanliness verified via `git diff HEAD` + `ls-files`).
- Worktree cap never pressured (7/16 at start, 3/16 at closeout).
- `check.js --quick` NOT re-run by the coordinator: zero net src/js in all
  three arms (feaststopspend + witnessdoor are policy-side; bisect is DIAG).

## Convergence

scale-onramp stays converging (NOT converged): the door menu is fully
measured and the frozen-band collapse is bisected to a named landing, but no
fix has landed from either finding, and the wall (national 0/12, full seat
0/12, wave-5 kills 0) is unchanged. food-economy untouched by this run.
Next blanks, in order: (1) gear-retune loadout census + scoring-vs-combat
partition (bisect's fix-shape sketch); (2) pair-overlap lever (feaststopspend's
next-arm pointer); (3) dark-branch witness + trial-by-combat (unmeasured
doors); (4) national Binding (LEAD realm formation) behind the full seat;
(5) witness beats 1–2 silent + defense witnesses never testify (new findings
item from the witnessdoor sense test); (6) lean-seed giving per-village
(#1870); (7) sitter-dies-mid-sitting, feast draws under sanctity, pre-day-90
table-talk, flee-repair port, pellet-bearer — all Steve calls.

Merged locally, pending ship. Evidence files: sim-witnessdoor-b.md,
sim-feaststopspend-b.md, sim-frozenband-bisect-b.md (+ preregs). Merges:
feaststopspend 823291451, witnessdoor 34ee42f0c, bisect 1d1dbb467.
