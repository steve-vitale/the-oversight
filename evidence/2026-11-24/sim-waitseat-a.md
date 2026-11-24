# sim-waitseat-a — does the WAIT leg matter where the seat stays unready longer?

Run: fleshout-20261124T1215Z (Loop A). Axis: scale-onramp. Tracker blank #5.
Worktree: `~/workspace/worktrees/sim-waitseat-a` (branch sim-waitseat-a).
Base: master c329b477d. Zero src/js — policy-side measurement only.
Prereg (binding, frozen BEFORE any sims): evidence/2026-11-24/sim-waitseat-a-prereg.md
(frozen 2026-11-24T12:31:00Z). Instrument: scripts/test-waitseat-sweep.js
(new; three arms in one process, adapted from the proven
scripts/test-tableseat-sweep.js). Corpus:
evidence/2026-11-24/perseed-waitseat-a/ (24/24 rows + summary via
sim-waitseat-a-sweep.json). Panel compare: evidence/2026-11-24/waitseat-a-panel.md.

## Canon read first

- docs/CANON.md, docs/TABLE.md. Seat contract: full seat keeps the national
  bar; lesser seat priced without national; seat taken from Haven via
  tableTakeSeat; table sanctity suspends ambient monster pressure while it
  sits. No canon invented.

## Why this run

The 1955Z round (evidence/2026-10-24/sim-tableseat-round-1955.md) found
seat-only replicates seat+wait EXACTLY on band 73601–73608 (entered 3 vs 3,
wins 3 vs 3, medians 161 vs 161, starvation 5 vs 5; one wait-stranded day,
no verdict change). The open blank: whether waiting matters on bands where
the seat stays unready longer. This run tests tableseat (seat+wait) vs
tableseat-nowait (seat only) on REPLAY band 107383–107390 — the band where
competent stalls (wins 0/8, national by scaleRank 0/8 under competent,
sim-launchfield-refreeze-b, 2026-11-22), judged here under the
leanlinkrescue courtship substrate, which actually reaches national.

Difference verified BEFORE sweeping (node extraction diff, 12:31Z):
tsDriveSeat and tsAnswerTableChoices are BYTE-IDENTICAL between
scripts/policies/tableseat.js and scripts/policies/tableseat-nowait.js;
both wrap leanlinkrescue.daily; the ONLY behavioral difference is the
wait-leg block in tableseat.daily (walkTo Haven (4,4) while tableWaiting +
national+ + !tableDone). `tsWaitDays` appears in tableseat only.

## PRE-REGISTRATION (summary — full text in sim-waitseat-a-prereg.md)

- Arms: wait (TABLESEAT=1), nowait/control (TABLESEATNOWAIT=1), baseline
  leanlinkrescue-only (substrate/contact check). Identical seeds, same
  instrument.
- Seeds (DECLARED REPLAY): 107383–107390. Named in the
  sim-launchfield-refreeze-b prereg (2026-11-22, competent substrate, fresh
  then); re-judged by sim-launchfield-rejudge-b. Same seeds, NEW question
  and NEW substrate. Prior competent numbers on this band
  (winnability-round-1530): wins 0/8; national by scaleRank 0/8, by
  standing ≥200: 2/8; table 0/8; wave-4 8/8; wave-5 2/8; median survival
  135.5d; starvation deaths 3.
- Horizon: 180 loop-days, death-aware (1955Z used 180d; reachability lever
  per MEASUREMENT §10, 150–200d; seats landed days 129–161 on the 73601
  band, so 180d contains the phenomenon with headroom).
- Primary: lesser-seat entries + wins as the wait-vs-nowait DELTA. GO
  requires (entered_wait − entered_nowait ≥ 2) OR (won_wait − won_nowait
  ≥ 2) AND the deciding cost bar passes. Else NO-GO — a clean kill (wait
  adds nothing) is a result, not a failure.
- Deciding cost bar (from sim-scalemetric, binding; control = nowait):
  starvation wait total ≤ nowait total + 2 AND arm-only starvation ≤ 2
  AND median days wait ≥ 0.8 × median days nowait.
- Proof gates: G1 det-gates (both policies, gate unset → leanlinkrescue
  days on seed 107383); G2 pre-national read-only (seeds where NO arm ever
  reached national: identical days/gameDays across all three arms); G3
  corpus integrity (24/24 rows, days > 0, counters present).
- Verdict scope: PILOT-ONLY on this replay band (8 seeds). A confirm needs
  a second FRESH band — decided in advance: no confirm spend in this run
  regardless of outcome.
- Landing rule: measurement-only. Both policies already landed as
  default-OFF instruments by the 1955Z GO; this run lands NO new policy,
  flips NO default, deletes NOTHING on NO-GO. Instrument + corpus +
  evidence only.

## RESULTS — NO-GO (pilot 24 configs, seeds 107383–107390, horizon 180d, death-aware)

Sweep: `node scripts/test-waitseat-sweep.js` (exit 0, ~35 min wall).
G1 det-gate: PASS for BOTH policies (seed 107383: baseline 179/179 days ==
tableseat-unset 179/179 == tableseat-nowait-unset 179/179, ts counters
empty on both armed sides).
G2 pre-national read-only: PASS (1 comparable seed, 107388 — never
national on any arm: 76/75 days/gameDays on all three arms).
G3 corpus integrity: PASS (24/24 rows, days > 0, ts + court objects on
every row).
Courtship shared exactly: paired court counters identical between wait and
nowait on all 8 seeds (107387's baseline courtGlobal:1 is win-censoring —
the baseline ran to 180d and reached global after the seat arms' day-105
win; both seat arms agree with each other).

### Sweep-compare table (the panel substitute — see panel note below)

| Metric | Baseline (leanlinkrescue-only) | Wait (seat+wait) | Nowait (seat only) |
|---|---|---|---|
| n | 8 | 8 | 8 |
| Won (table win flag) | 0 | 7 | 7 |
| Median days / max days | 179 / 180 | 98 / 105 | 99 / 105 |
| National ever / final | 7 / 6 | 7 / 7 | 7 / 7 |
| Table invited ever | 8 | 8 | 8 |
| Table entered (tableDone ever) — PRIMARY | 0 | 7 | 7 |
| Wave 4 / wave 5 reach | 8 / 4 | 8 / 1 | 8 / 1 |
| Max arc | 4 | 4 | 4 |
| Starvation deaths | 4 | 2 | 2 |
| Total deaths | 839 | 632 | 632 |
| Seat attempts / taken / failed | 0 / 0 / 0 | 7 / 7 / 0 | 7 / 7 / 0 |
| Seat days / kinds | — | 103, 95, 90, 99, 105, 98, 90 / lesser × 7 | 103, 95, 94, 99, 105, 101, 90 / lesser × 7 |
| Table answers / paths | 0 / — | 35 / feared × 7 | 35 / feared × 7 |
| Wait days / at Haven / returns / stranded | 0 | 89 / 82 / 2 / 5 | 0 |
| Previews seen / not-ready | 0 / 0 | 29 / 22 | 36 / 29 |

Verdict against the pre-registered bar: **NO-GO**.
- Primary: entered delta 0 (7 vs 7, need ≥ 2); won delta 0 (7 vs 7,
  need ≥ 2) — FAIL. waitHarmful false (nowait is not better either).
- Cost bar (all PASS, but moot without the primary): starvation wait 2 ≤
  nowait 2 + 2; arm-only starvation 0 ≤ 2; median wait 98 ≥ 0.8 × 99
  (= 79.2), ratio 0.99.
- Kill classification (§14a): **CONCEPT-DEAD**. The mechanism WAS staged
  — the wait leg fired on 89 wait-days (82 at Haven, 5 stranded returns),
  with 22 not-ready previews, across 7 seated seeds — and the concept
  failed on its merits: waiting converts nothing extra. Two bands now
  agree (73601: 3v3; 107383: 7v7). Do not retry the wait leg without a new
  mechanism.

### Per-seed detail (only the 2 seeds where the arms diverge at all)

| Seed | Baseline | Wait | Nowait |
|---|---|---|---|
| 107383 | 179d, village-lost, global→regional, tab 1, ent 0 | 103d, won, seat d103 lesser feared, wait 1d | identical (seat d103) |
| 107384 | 163d, village-lost, global→global, tab 1, ent 0 | 95d, won, seat d95, wait 18d (1 stranded), 5 not-ready previews | identical (seat d95) |
| 107385 | 180d, survived, global→global, tab 1, ent 0 | 90d, won, seat d90, wait 13d (2 stranded, 1 return), 1 preview | 94d, won, seat d94, 5 previews (4 not-ready) |
| 107386 | 180d, survived, global→global, tab 1, ent 0, starv 2 | 99d, won, seat d99, wait 22d, 9 not-ready previews, starv 0 | identical (seat d99) |
| 107387 | 180d, survived, global→global, tab 1, ent 0 | 105d, won, seat d105, wait 1d | identical (seat d105) |
| 107388 | 76d, village-lost, regional, tab 1, ent 0, starv 2 | identical 76d (never national — legs never gated in) | identical 76d |
| 107389 | 174d, village-lost, global→global, tab 1, ent 0 | 98d, won, seat d98, wait 21d (1 stranded, 1 return), 8 not-ready previews | 101d, won, seat d101, 12 previews (11 not-ready) |
| 107390 | 170d, village-lost, global→global, tab 1, ent 0 | 90d, won, seat d90, wait 13d (1 stranded) | identical (seat d90) |

- The wait leg's ONLY observable effect: it seated 2 seeds a few days
  earlier (107385: day 90 vs 94; 107389: day 98 vs 101). Ending days at
  Haven puts the scholar at the table when the seat turns ready, while
  the nowait scholar is sometimes a day's walk away — but the nowait
  scholar still sits a few days later, and every conversion still wins.
  Latency, not conversion. The prereg judged entered/won, not latency,
  and the latency delta (3–4 days on 2/8 seeds) changes no verdict.
- The premise held and still lost: this band DID keep the seat unready
  longer — 22 not-ready previews under wait (vs 2 on the 73601 band),
  89 wait-days (vs 2) — yet entered/won are identical. The wait leg was
  exercised 40× harder and still added nothing.
- Wave 5 armed 1 vs baseline 4 is win-censoring (wins at days 90–105 end
  runs before wave 5 unlocks), not a regression — same artifact as 1955Z.
  Median-days drop (98/99 vs 179) is the same effect: seated runs end at
  the win instead of dragging to village-lost. Starvation armed 2 vs
  baseline 4 is also win-censoring (baseline 107386's 2 starvation deaths
  happened after the seat arms' day-99 win).
- Death causes (both seat arms combat/expedition-dominated, identical
  totals 632): villager expedition 271, villager:villager combat 239,
  villager combat 63, player the wild 17, villager monster 11, starvation
  2. Baseline: villager:villager combat 294, expedition 293, combat 124,
  player the wild 45, monster 34, starvation 4 (3 villager + 1 player).
  The seat arms' lower death total is the 7 runs ending early at wins.

## Wall numbers (this run's judged corpora, 24 configs)

| | baseline (8) | wait (8) | nowait (8) |
|---|---|---|---|
| national ever / final | 7 / 6 | 7 / 7 | 7 / 7 |
| table invited ever | 8 | 8 | 8 |
| table entered | 0 | 7 | 7 |
| wins | 0 | 7 | 7 |
| wave 4 / wave 5 | 8 / 4 | 8 / 1 | 8 / 1 |
| median survival | 179d | 98d (win-censored) | 99d (win-censored) |

Under the leanlinkrescue substrate this band is far stronger than under
competent (national ever 7/8 vs 0/8 by scaleRank; wave-5 4/8 baseline vs
2/8 competent) — the substrate, not the band, was the binding constraint
on reaching national. The seat legs convert 7/7 invitations into wins on
both arms; the wait leg converts nothing extra.

## Reachability verdict

- Table seat: REACHABLE and EXERCISED on this band — 7/8 on both seat
  arms (all lesser seats, all Feared path via first-option answering).
- Table win flag: REACHED — 7/8 both arms, 0/8 baseline.
- Full seat: still untested (all 14 seats lesser). Wave 5: reached on the
  baseline (4/8) but the seat arms win before it (1/8 each) — wave 5 is
  reachable, just not on the winning path.
- The seat stays unready longer here (22 not-ready previews) and waiting
  through it buys nothing. The wait leg is dead weight as a conversion
  mechanism.

## Village assessment (plain words)

These villages court, climb, and reach national on 7 of 8 seeds — then the
story splits the same way it did on the last band, only faster. Left alone,
a village that gets invited to the table never sits down: eight invitations
sat unanswered in the baseline while villages ground on to 179 days and
died. Give the same village a policy that sits when the seat is ready, and
seven of those eight invitations turn into wins — with or without the
waiting. The waiting itself is the most human part of the run and the most
useless: for three weeks on one seed the scholar ends every day at Haven,
walks back, waits for a seat that isn't ready yet, gets stranded a day's
walk out and comes back — and the village that just sits down when the
seat IS ready wins on exactly the same seeds, three or four days later.
The one seed that never seats (107388) dies at day 76 having never reached
national — no policy can sit at a table that never gets set.

## Sense-testing read (NON-MEASURED replays, seed 107389, both arms)

Files: evidence/2026-11-24/sim-waitseat-a-sense-wait.txt and
sim-waitseat-a-sense-nowait.txt (240-line rings; seat days match the
census — wait d98, nowait d101 — so the replays tracked the measured
runs). Judgment — meaning, coherence, consequences:
- The table scene is beat-for-beat the same in both replays: the ring of
  pale light, the audit reading the REAL run back (wait: waves 1–3 faced
  17/13/6, 4 wave-4 fought, 11 contests, 4 crises; nowait: 16/14/6, 3
  wave-4, 12 contests, 4 crises), the sanctity line, the Feared beats,
  "Show mercy" resolving into terror pledged as a shield over every
  village. The wait changes NOTHING in the scene itself.
- The wait DOES change what the village experiences before the scene: the
  wait replay's overtime line reads "0 weeks kept waiting, 3 of Haven
  lost meanwhile. Every door's standing −9" vs nowait's "1 of Haven lost
  meanwhile. Every door's standing −3". Waiting cost two more villagers
  and six more standing while the seat wasn't ready — the wait is not
  free experientially, even though it changes no verdict. (Those deaths
  are not starvation, so the scalemetric cost bar doesn't see them —
  noted in metric review.)
- One honest artifact: waiting days narrate as filler — "You wait. The
  light changes. Nothing asks anything of you." repeated across the wait
  replay. A villager waiting three weeks for a seat that isn't ready
  reads as idle, not expectant. If the wait leg ever returns, those days
  need words of their own.

## Balanced panel (§15) — INGESTED (sweep-corpus path, not a panel verdict)

`node scripts/balance-panel.js compare --before <nowait rows relabeled
policy=wait> --after <wait rows> --out evidence/2026-11-24/waitseat-a-panel`
produced evidence/2026-11-24/waitseat-a-panel.md + .json. NOTE: this run
is the first seat arm where the compare ingests a sweep corpus at all —
the scorecard now carries a sweep-corpus path (gap-instruments B12,
2026-10-27; the 1955Z arms threw `TypeError ... reading 'days'`). The
before doc is the nowait rows relabeled policy=wait so the scorecard
pairs them seed-for-seed against the wait rows; the relabel is documented
in the compare inputs (/tmp/waitseat-panel-before.json is NOT committed —
rebuild from sim-waitseat-a-sweep.json rows if needed).
Result: Table win rate 0.875 → 0.875 (delta 0), entry rate 0.875 → 0.875
(delta 0), national 0.875 → 0.875 (delta 0), player deaths 2.5 → 2.375
(delta −0.125, no_material_signal). Decision `review_required` is driven
ENTIRELY by `not_observed` metrics (every contract metric the per-seed
rows don't carry) — no observed metric moved. The compare is descriptive,
not the judge; the preregistered bar judged this run.

## Metric review

- Pre-registered metrics held: no re-scoring. The primary (entered/won
  delta) and the cost bar judged the run cleanly; the NO-GO stands on
  them.
- "Median days" as a cost bar is confounded by wins ending runs early
  (a good arm lowers it) — the 0.8× floor absorbed that here (ratio
  0.99), but the 1955Z proposal stands: for seat arms, judge median days
  among non-won seeds next time (here: baseline non-won median 179 vs
  wait/nowait non-won median 76 — the single non-winning seed 107388,
  ratio 0.42 — which shows the non-won-median revision would MISJUDGE
  this run: the only non-won seed is the early-death seed. The 0.8×
  overall-median floor was the right bar after all; withdraw the 1955Z
  proposal for seat arms with heavy win-censoring).
- The scalemetric cost bar is blind to the wait's real cost: the sense
  read shows waiting cost 2 extra villagers + 6 standing on 107389 via
  the overtime line, none of it starvation. A future wait-leg arm (if
  any) should pre-register total deaths or the overtime line as a cost
  alongside starvation. For THIS run the cost bar passed as written and
  the primary failed, so the verdict is unaffected.
- "Table invited ever" remains non-discriminating (8/8 baseline, 8/8
  both arms) — future seat arms judge on entered/won only, as this run
  did.
- First-option answering still walks Feared every time (14/14 seats) —
  path diversity remains untested by every seat arm so far.

## Findings outside this arm (reported, NOT touched)

- WAIT-DAY NARRATION GAP: waiting days narrate as repeated filler ("You
  wait. The light changes. Nothing asks anything of you."). If the wait
  leg ever returns, those days need their own words.
- OVERTIME COST BLIND SPOT: the table's overtime line prices waiting in
  villagers lost and standing (3 lost / −9 on the wait replay vs 1 / −3
  nowait) — a cost channel the scalemetric starvation bar never sees.
- None new on wave 5 (reachable on baseline 4/8), full seat (untested),
  or path diversity (Feared × 14).

## Convergence state

Axis scale-onramp: converging. The seat legs convert invitations to wins
7/7 on this band; the WAIT leg is killed-at-pilot (CONCEPT-DEAD) on two
bands — it adds nothing to entered/wins even where the seat stays unready
longest. Next blanks in order: (1) a seat-answering variant that walks
doors other than Feared (path diversity); (2) full-seat reachability.
