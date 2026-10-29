# sim-blockscreen-b — two-stage refused-evening census: INSUFFICIENT-DATA (bank yields 5 refused-prone seeds; instrument PROOF-GREEN at n = 48)

Run: oversight-flesh-out-loop-b, arm sim-blockscreen-b, axis
food-economy. Worktree sim-blockscreen-b. POLICY-SIDE DIAG
ONLY: scripts/policies/blocktype-diag.js recorder (default
OFF, UNCHANGED from the 1130Z arm) + trace/analyzer/proof
instruments. Zero src/js changes, zero default flips, no
driver adopts the recorder. This worker does NOT merge to
master — coordinator merges. Prereg (committed BEFORE any
judged leg): evidence/2026-10-29/
sim-blockscreen-b-prereg.md, commit 5778a122d.

## Verdict: INSUFFICIENT-DATA (not a census, not a kill)

The pre-registered pilot band could not be formed: the
away-prone bank of 24 seeds yielded only 5 refused-prone
seeds, against the pilot requirement of 8 refused-prone
seeds and the census bar of refused-prone seeds >= 8
with refused n >= 8 and unclassified = 0. Per the prereg,
that is INSUFFICIENT-DATA — not DIAG-GO and not a
failure of the instrument. NO pilot declaration was
written (correctly — no pilot formed) and NO recorder-OFF
legs were spent (correctly — the prereg's pilot rule
requires both legs per pilot seed, and there was no
pilot to pair). NO census verdict is claimed from the
48 refused evenings below: the per-type numbers are
instrument-validation context only, never quoted as
the census — the same discipline as the 1130Z arm's
n = 4 validation pair, now at n = 48.

What IS proven (validation, not census): the recorder
classifies live refused evenings and does not need
re-proving — scripts/test-blocktype-b.js PROOF-GREEN
on the 5 refused-prone seeds (48/48 classified, probe
agreement 48/48, route paths structurally valid 48/48,
partition sums hold, recorder errors 0; T5 OFF-vs-ON
deep-equal SKIPPED by design, since no OFF legs were
spent without a pilot — the 1130Z validation pair
already proved non-perturbation, and this run spent
nothing that needed re-proving).

## Stage 1 — away-prone bank (control legs only, fresh band)

Scan (POLICY=insideevening, DAYS=30, TAPDAYS=5,
substrate COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1): fresh band 12200+, consecutive 40-seed
blocks, qualifier = >= 2 near-home away evenings
(d <= 3 of haven (4,4)) on the control leg. The band is
fresh of the nighttravel bank (11000–11447), the detour
confirm scan (11500–11519), and the blocktype blind band
(12000–12079); staging proof
scripts/test-blockscreen-b.js S1–S5 + C1 PROOF-GREEN,
including D1 determinism (re-running scan legs for
12206, 12411, 12277 reproduced byte-identical files
and identical qualifier classifications).

| Scan block | Seeds | Qualifiers (cumulative) |
|---|---|---|
| 12200–12239 | 40 | 4 |
| 12240–12279 | 40 | 5 |
| 12280–12359 | 80 | 11 |
| 12360–12439 | 80 | 18 |
| 12440–12479 | 40 | 23 |
| 12480–12519 | 40 | 23 |
| 12520–12559 | 40 | 26 — STOP (>= 24 reached) |
| Pooled scan | 360 | 26/360 = 7.2% |

Bank = first 24 qualifiers in (nearHomeAway desc, seed
asc) order: 12206, 12356, 12411, 12434, 12403, 12464,
12473, 12351, 12474, 12344, 12526, 12412, 12459, 12520,
12284, 12328, 12367, 12204, 12209, 12214, 12364, 12420,
12277, 12350. (Qualifiers 12454 and 12524 are NOT in
the bank — the bank is the first 24 only, per prereg.)
No wedge occurred on any leg: every scan block
completed (slowest ~6 min under load, files growing
throughout, worker CPU live — never a 0-CPU park).

## Stage 2 — refused-prone search (recorder ON, banked seeds only)

ON legs (POLICY=nighttravel, BLOCKTYPE_DIAG=1, DAYS=30,
same substrate) run on banked seeds in qualifier order
until 8 refused-prone seeds or bank exhaustion:

| Search batch | Seeds | Refused-prone found (cumulative) |
|---|---|---|
| 12206, 12356, 12411, 12434, 12403, 12464, 12473, 12351 | 8 | 5 (12206, 12356, 12434, 12403, 12464) |
| 12474, 12344, 12526, 12412 | 4 | 5 |
| 12459, 12520, 12284, 12328 | 4 | 5 |
| 12367, 12204, 12209, 12214 | 4 | 5 |
| 12364, 12420, 12277, 12350 | 4 | 5 — BANK EXHAUSTED |
| Total | 24 | 5/24 = 21% |

The other 19 banked seeds had ZERO refused evenings on
their ON legs despite >= 2 near-home away evenings on
their control legs. Pooled bank partition (720 evenings):
already-inside 103, completed 531, out-of-reach 34,
blocked-combat 4, travel-refused 48. The near-home
away evenings on those 19 seeds mostly COMPLETED (the
hop home succeeded) or were out-of-reach — away-prone
does not imply refused-prone, and that is the run's
central measurement (see "Metric review").

## Validation context only (NOT the census — 5 seeds, 48 evenings)

| Type | Refused | Covered (BFS route exists) | Uncovered (no route) | Route lengths | Blocked tiles |
|---|---|---|---|---|---|
| creek | 23 | 23 | 0 | 2 (×21), 3 (×2) | (4,3) ×13, (3,4) ×10 |
| washed_out | 17 | 17 | 0 | 3 (×3), 4 (×14) | (5,4) ×14, (4,2) ×3 |
| fallen_tree | 8 | 8 | 0 | 3 (×8) | (3,4) ×8 |
| rubble | 0 | 0 | 0 | — | — |
| Total (validation only) | 48 | 48 | 0 | — | — |

Per seed: 12206 creek 13 (3 episodes, max 9 evenings);
12356 creek 10 (2 episodes); 12434 washed_out 14
(2 episodes, all at one tile (5,4)); 12403 washed_out
3 (1 episode); 12464 fallen_tree 8 (1 episode).
All 48 classified (unclassified = 0); probe type ==
hop type on 48/48; route paths structurally valid
48/48; recorder errors 0. These numbers are CONSISTENT
with the prior 115 decomposition (all route-around-able)
but prove nothing about type shares: with 5 seeds,
shares are single-seed geography (12434 alone is all
14 washed_out evenings at one tile), and rubble
simply did not occur. The genuinely-uncovered question
is still open, not answered — 0 uncovered on 48
evenings is validation context, not a census finding.

Proof: node scripts/test-blocktype-b.js --on
evidence/2026-10-29/sim-blockscreen-b-corpus-on --seeds
12206,12356,12434,12403,12464 → PROOF-GREEN (T1 gate
unit, T2 unclassified == 0, T3 records + probe
agreement, T4 route-path structure, T5 SKIPPED — no
OFF legs by design, T6 partition sums, T7 errs == 0,
T8 leg identity).

## Reachability verdict (waves 1–5, regional → national, table, win flag)

NOT OBSERVABLE in 30-day position traces — reported,
not claimed. What IS in the files: maxWaveUnlocked per
banked seed — wave 3 on 2/24 seeds, wave 2 on 18/24,
wave 1 on 4/24; wave 4–5 unlocks 0/24. No
national/table/win movement is claimed from this run;
the census is a nightly-position instrument, and a
30-day trace cannot move a scale-wall number.

## Wall numbers (every run)

- National: NOT OBSERVABLE in 30d traces (no field).
- Table: NOT OBSERVABLE in 30d traces (no field).
- Wins: NOT OBSERVABLE in 30d traces (no field); 0 win
  flags present.
- Wave 4–5 unlocks: 0/24 banked seeds, 0/5
  refused-prone seeds.
- Median survival: 30 days (24/24 banked villages
  survived 30 days; no village lost).

## Village assessment (plain words)

Twenty-four away-prone villages, thirty days in: alive
and thin in the familiar way, and mostly ending their
days inside already (531 completed evenings vs 48
refused). The refused villager is the exception even
on away-prone seeds: nineteen of the twenty-four
banked villages never refused once — their people
walked home fine or slept out past reach. The five
who did refuse refused in streaks, not singles: a
creek villager on 12206 spent nine straight evenings
camped on a forest floor one tile from home (days
4–12), and the morning of day 13 woke inside at
haven with no line saying how they got there. On
that same village the player character starved to
death on day 12, mid-stranding — observed together
with the stranding, not proven caused by it, but the
coincidence is exactly what the detour lever is for:
nine nights away from the pantry is a long time to
be one 2-step walk from home. What was missing on
those nights was, again, the walk the detour lever
already measured — and on this sliver the walk
existed (2–4 steps) every time. The blank this run
fills is the measured fact that the away-prone screen
does not produce refused-prone seeds at a usable
rate, plus a 48-evening validation that the recorder
still classifies everything it sees. The blank it
documents but does not fill is the census itself —
type shares and the uncovered set on current master —
which needs the re-screen in "Metric review".

## Sense-testing (read transcripts, judged for meaning)

- REFUSED, washed_out (12434 day 7, meadow (6,4) →
  blocked (5,4)): the day forages, learns Old World
  Caches, meets Elena by name — then "The path is
  washed out." twice, the second at the evening hop,
  position unchanged, 0 kcal hop cost. Honest about
  the block; silent about the 4-step way around via
  (6,5)–(5,5)–(4,5) and silent about bedding down
  away — the same two omissions the blockedpath diag
  named, live on a fresh seed.
- REFUSED, creek episode (12206 days 4–12, forest
  floor (3,3) → blocked (4,3)): "The creek runs fast
  here — no crossing without a bridge or a swim."
  three times on day 4 alone, amid foraging, fire
  gossip (Rosa retold three times over), and meeting
  Dwayne and Owen. Nothing robotic: the days play
  fully, and the refusal is the honest last line
  each night. The morning after the episode (day 13)
  wakes inside at haven — the episode ends, though
  the trace does not say whether the villager walked
  around in daytime or the creek eased. That
  un-narrated exit is the same small wrinkle the
  1130Z arm flagged, not a guard issue.
- REFUSED, fallen_tree (12464 day 4, forest floor
  (2,3) → blocked (3,4)): "A fallen tree blocks the
  path." twice at the tail, and the day's own tile
  text reads "Fallen trunks lie like sleeping
  animals, furred with moss" — the blockage type
  matches what the player would see on that tile.
  The 3-step route via (3,3)–(4,3) exists and is
  unnamed, as in the other two traces.
- No transcript read robotic in the sample; the
  robotic-feeling beat, where it exists, is again
  the absence — no line ever names the way around,
  and no line marks the night away.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered before judging: this leg is a 30-day
position census of a POLICY-SIDE recorder — zero
src/js changes, so there is no game-root delta for a
panel to compare, and the panel's registry policies do
not include the trace policies this arm measures.
The OFF-vs-ON legs are an instrument-perturbation
check (G-deep-equal), not a game comparison — and no
OFF legs were spent here at all, since no pilot
formed. The pre-registered census bar above is the
judge. If a future lever becomes a game change, a
panel compare is run at that point. No telemetry
deviation check is meaningful on these corpora either
(no national / table / wins / exiled fields exist in
30-day position traces), so none is faked.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- The two-stage screen was the right idea and the
  wrong enrichment: away-prone (≥ 2 near-home away
  evenings on control legs) does NOT enrich for
  refused-prone (≥ 1 refused evening on nighttravel
  legs) at a usable rate — 5/24 banked seeds (21%),
  against the 8 needed for a pilot. The binding trait
  is seed-level and clustered: refused evenings come
  in streaks on few seeds (13/10/14/3/8 here), and
  most away-prone seeds' near-home evenings simply
  complete. The NEXT run should NOT run a third
  blind/away screen hoping for a better draw. Two
  honest options, stated for the coordinator's call:
  (a) a WIDER bank — at 21%, ~40 away-prone seeds
  expect ~8 refused-prone, ~48 expect ~10; that is
  ~550–650 scan seeds (~40–60 min of scan legs at
  this run's pace) plus the search legs, and the
  seed-count bar should arguably RISE (see below);
  (b) screen DIRECTLY on refused-proneness with
  nighttravel legs (selection on the outcome) and
  quote the census explicitly as conditional on
  refused-proneness — for a TYPE census this is
  defensible, since the estimand is type shares
  among refused evenings, not a population rate;
  but it must still clear a seed-count bar, because
  of the next point.
- The seed-count bar (≥ 8) is necessary but, on this
  evidence, too LOW for type shares to mean anything:
  even at 8 seeds, shares would be dominated by
  single-seed geography (one seed = all 14 washed_out
  evenings at one tile). The next prereg should set
  the bar in SEEDS first (suggest ≥ 12 refused-prone
  seeds) with refused n ≥ 8 as a secondary floor,
  and should require the per-type table to report
  seeds-per-type alongside evenings-per-type — a
  type carried by one seed is a geography note, not
  a share.
- The minimum-n rule held as written: with 5 seeds
  the run correctly reports INSUFFICIENT-DATA rather
  than stretching 48 evenings into a census. Keep
  the rule; fix the screen and raise the seed bar.
- The recorder's BFS judge did not bite on the
  validation set (all routes orthogonal, lengths
  2–4, matching the detour lever's walked lengths).
  The diagonal-only curiosity from the diag's metric
  review remains unobserved — a re-screened census
  should keep the BFS-as-judge statement verbatim.
- No OFF legs were spent and no pilot declaration
  was written, both correctly per the prereg's
  staging: a pilot that cannot form must not leave
  a half-paired corpus behind for the next run to
  mistake for staged data. The next run starts its
  pilot from its own search, on its own declaration.

## Evidence files

- Prereg: evidence/2026-10-29/sim-blockscreen-b-prereg.md
  (commit 5778a122d, before any judged leg)
- This file: evidence/2026-10-29/sim-blockscreen-b.md
- Stage-1 scan (selection only, 360 seeds):
  evidence/2026-10-29/
  sim-blockscreen-b-scan-insideevening/ (360 files),
  sim-blockscreen-b-scan.json (commit 3d9b080bc)
- Stage-2 search (recorder ON, 24 banked seeds):
  evidence/2026-10-29/sim-blockscreen-b-corpus-on/
  (24 files), sim-blockscreen-b-search-analysis.json
  (full bank), sim-blockscreen-b-search1-analysis.json
  (first 8-seed batch, staging trail)
- Instruments: scripts/policies/blocktype-diag.js
  (UNCHANGED from 1130Z), scripts/blocktype-trace-b.js,
  scripts/analyze-blocktype-b.js,
  scripts/nighttravel-trace-b.js,
  scripts/analyze-nighttravel-scan-b.js
- Proofs: scripts/test-blocktype-b.js (T1–T8,
  PROOF-GREEN on the 5-seed validation set, T5
  skipped by design) and scripts/test-blockscreen-b.js
  (S1–S5 + C1 + D1 PROOF-GREEN on the scan)

## Landing note for the coordinator

HELD, not landed as a lever: the census is
INSUFFICIENT-DATA, so no census verdict lands and no
lever is built. What the branch holds for the next
run: the PROOF-GREEN default-OFF recorder instrument
(unchanged from 1130Z), the 360-seed away-prone scan
(selection data + bank order + measured 7.2%
qualifier rate), the 24-seed search corpus (5
refused-prone seeds, 48 classified refused evenings,
0 uncovered — validation context, not a census),
and the measured refused-prone rate among banked
seeds (21%). The next run's job is a re-screened
census under a revised prereg (see "Metric review")
— it should NOT re-run away-prone blocks hoping for
a better draw, and it should NOT quote the 48
evenings above as type shares. This worker does NOT
merge to master — coordinator merges. Worktree
contains only committed work at handoff (verified
before reporting).
