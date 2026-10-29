# sim-food-economy-round-1330-b — Loop B coordinator evidence (axis food-economy)

Run: fleshout-loop-b-20261029T1330Z. Loop A live on scale-onramp
(1315Z holdsjoin/pickband, NOT touched) -> B worked food-economy
(converging), the second axis. Claim written before any sims.
Both arms measurement-only, zero src/js, zero default flips.
Merged locally, pending ship. No push, no bump, no live verification.

## STALE-LOCK RECOVERY + ADOPTION (before any new sims)

The 1130Z Loop B run was dead at run start: lock 2h old, its
recallpolicy worktree heartbeat 12:11Z (77 min stale, >15 min rule).
Lock deleted, its claim retired to .DEAD. Its blocktype arm was
already on master (ef4e3f8be and kin); its recallpolicy arm was
committed-but-unmerged on branch sim-recallpolicy-b (3 commits,
worktree clean). Adopted: rebased clean onto master, net diff
verified evidence-only (21 files, 0 non-evidence files), merged
--ff-only as 9f81de0d1, tree released, branch deleted, main tree
clean. The adopted verdict stands: recallpolicy KILLED AT PILOT
(G1 median survival ON 101d vs control 133.5d, bar >=131.5d;
0/8 strict rescues vs bar >=0.50). Evidence:
evidence/2026-10-29/sim-recallpolicy-b.md + prereg (on master).

## ARM 1 — sim-blockscreen-b: two-stage blocktype re-screen — INSUFFICIENT-DATA

Answers the 1130Z blocktype INSUFFICIENT-DATA (blind band
12000–12079: 2 refused-prone seeds / 4 evenings, 2.5%).
Prereg committed BEFORE any judged leg (aa13feee1). Instrument
reused unchanged (scripts/policies/blocktype-diag.js, proof-green).

- Stage 1 — away-prone bank (nighttravel-scan method, fresh band
  12200–12559, 9 complete 40-seed blocks, 360 seeds): 26
  qualifiers (7.2%), bank = first 24 in order. Staging proof
  S1–S5 + C1 PROOF-GREEN post-rebase (coordinator re-ran),
  including D1 determinism (3 rerun seeds byte-identical).
- Stage 2 — refused-prone search (recorder ON on the bank):
  only 5/24 refused-prone seeds (12206, 12356, 12434, 12403,
  12464). The pilot of 8 could not form, so NO pilot
  declaration was written and NO OFF legs were spent — correct
  per the prereg's staging, leaving no half-paired corpus.
- Validation context ONLY (never quoted as a census): 48
  refused evenings on the 5 seeds, all classified, 0
  unclassified, 0 recorder errors, 0 uncovered — creek 23,
  washed_out 17, fallen_tree 8, rubble 0; route lengths 2–4,
  all BFS-covered. test-blocktype-b.js PROOF-GREEN on the 5
  seeds (T1–T4, T6–T8; T5 skipped by design — no OFF legs
  without a pilot; non-perturbation already proven by the
  1130Z pair). With 5 seeds, shares are single-seed geography
  (12434 alone is all 14 washed_out evenings at one tile) and
  must NOT be quoted as type shares.

Key measurement for the next run: away-prone does NOT enrich
for refused-prone (5/24 = 21%). The other 19 banked seeds had
zero refused evenings — their near-home evenings mostly
completed (531 completed vs 48 refused across 720 bank
evenings) or were out-of-reach (34).

Sense (3 traces read end to end): refusals read honestly
("The creek runs fast here — no crossing without a bridge or
a swim", "The path is washed out", "A fallen tree blocks the
path"; the fallen_tree tile text even matches — "Fallen trunks
lie like sleeping animals"). Same two omissions as before: no
line ever names the 2–4 step way around, and no line marks the
night away; the 9-evening creek episode on 12206 ends with an
un-narrated morning return to haven, and that village's player
starved on day 12 mid-stranding (observed together, NOT proven
caused).

## ARM 2 — sim-creekremedy-b: creek-remedy feasibility DIAG — DIAG-GO

Answers the 0830Z next blank #4 (creek remedy as precondition
for any future homeward-clearing attempt; clearhabit killed at
pilot, creek 16/22 opps, 0 rescued). Prereg committed BEFORE
any judged leg (a7479596d). Canon + code first, never wishes.

- Bridge mechanic EXISTS: Game.buildBridge(x, y) — 4 wood from
  the PLAYER's inventory, 60 kcal, 96 ticks, no knowledge /
  skill / occupation gate, permanent until a storm smashes it.
- Swim = the swimmer SKILL (learnable via background/teach);
  a non-swimmer cannot swim a hard creek at any cost.
- Ford mechanic: ABSENT. No ford verb, cost, or tile state in
  src/js/game.js or src/js/app.js (only hit is the village
  name "Stonebridge"). No ford share is reported anywhere —
  reporting one would invent it. A future lever's options are
  bridge or swimmer-teaching, not a ford, unless Steve rules a
  ford into existence.

Measured (gate-OFF nighttravel legs, 30 loop-days, seeds
11636/11707/12027, recorder OFF vs ON):

| Metric | Result |
|---|---|
| Creek evenings | 11 (min-n 8 met; fallback not needed) |
| Bridge-feasible share | 0/11 = 0.000 (Wilson 95%: 0.000–0.259) |
| Binding constraint | wood-short 11/11 — wood on hand 0 on every evening (direct woodCount() re-check: no wood item in the pack at all) |
| Village pile at refusal | 21–69 logs (median 25) — the wood exists, at haven, unreachable that evening |
| Kcal | pays the 60-kcal cost in full on 6/11; short on 5/11 but never solely binding (fix wood alone: 6/11 feasible; fix kcal alone: 0/11) |
| Time | ticks-to-day-end 107–255 on all 11 vs a 96-tick build — rollsDay 0/11, time does NOT bind |
| Swimmer / route-around (context only) | 0/11 swimmers (expected); 11/11 have a 2-step BFS route-around, which the detour lever already covers and was never pooled here |
| Instrument guards | unclassified 0, recorder errors 0, OFF-vs-ON deep-equal 0 diffs, determinism re-run (11636, ON) byte-identical, proof T1–T6 PROOF-GREEN (coordinator re-ran T1–T5 on the merged corpora; T6 skipped without a rerun dir — the worker's determinism record stands) |

Divergence, explained not hidden: prior evidence predicted 17
creek evenings (10/6/1); these legs yield 11 (6/5/0). Traced
end to end on 11636: the episode ends by SUCCESSION, not
rescue — the starving player dies in the wild on night 9
(Mountain Lord encounter during sleep) and the mantle passes
to a successor who wakes at haven. The deleted habit cannot
explain the gap (it never acts on creek evenings and its probe
draws no RNG); this is succession timing + base drift in
night-encounter RNG. Prior counts are superseded as controls
for this question.

Sense (evenings read end to end): every refused tail ends
"The creek runs fast here — no crossing without a bridge or
a swim." The player understands WHY home is unreachable but
is never told WHAT they lack (4 logs) — "Need 4 wood" only
fires when buildBridge is actually attempted, and nobody ever
attempts it from a refused evening. A narration gap for the
future lever's prereg, not a guard issue.

What the next lever must be (reported, NOT built): a
bridge-at-the-refused-evening lever is infeasible as the game
stands for exactly one reason — villagers don't carry wood.
The precondition to create is daytime wood-carrying (take up
to 4 logs from the haven pile before leaving, or
cut-and-carry); that lever needs its own prereg, and this DIAG
is its sizing input.

## VILLAGE ASSESSMENT (plain words)

The villages play normally. Players end most days inside; the
away population is small, and when a villager IS stranded by a
creek, the fix already exists in the game — a bridge — but the
villager never carries the wood to build it. The wood sits in
a pile at home while the villager sleeps out. That is the
blank: not a missing bridge, a missing habit of carrying wood.
Nothing in this run touches the scale wall: no village reached
for the table or a win on these short evening legs, and none
was expected to.

## WALL NUMBERS (reported, never claimed)

National / table / wins: NOT OBSERVABLE on 30-day pre-seat
evening legs (no field reported, never claimed). Wave 4–5
unlocks: 0 (blockscreen 0/24, creekremedy 0/3). Median
survival: 30d capped (blockscreen 24/24 survived, wave max
1:4 / 2:18 / 3:2; creekremedy 3/3 villages survived — player
deaths are succession events, not village deaths). No wall
movement claimed.

## TELEMETRY DEVIATION CHECK

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'<per-seed-evidence-glob>' --metrics national,table,wins,exiled`:
3 LOUD lines on EACH corpus (national 12->0, table 16->0,
wins 16->0) — the KNOWN field-shape + regime artifact class
(30-day pre-seat traces vs WINSEAT baseline). Exiled: no LOUD
line. Baseline NOT rolled.

## METRIC REVIEW

- Blockscreen: the two-stage prescription from the 1130Z
  finding is now itself exhausted — away-prone screening does
  not enrich for refused-prone (21%). Next run's prereg must
  EITHER bank wider (~550–650 scan seeds for ~10
  refused-prone, quoted as conditional) OR screen directly
  for refused-prone, with a higher seed-count bar (suggest
  >=12 seeds) and seeds-per-type reported alongside
  evenings-per-type. Do NOT re-run away-prone blocks hoping
  for a better draw, and do NOT quote the 48 evenings as type
  shares.
- Creekremedy: no metric change needed — DIAG-GO met its bar
  (min-n 8, feasibility share + binding constraint + guards).
  The 17->11 prior-count divergence is recorded as control
  supersession (succession timing + base drift), NOT a
  re-score of the clearhabit verdict, which stands.
- Both evidence files carry their own metric review sections;
  this section judges the round against its headers. No
  mid-run re-scoring occurred.

## CONVERGENCE

food-economy stays converging (NOT converged): no
food-economy fix landed as game code this run (creekremedy
DIAG-GO is a sizing input for a future lever; blockscreen
INSUFFICIENT-DATA; recallpolicy killed). scale-onramp stays
converging (untouched; sibling loop A lane).

## INFRASTRUCTURE

Pre-flight clean (main tree empty, disk 21%, reap done, 9/16
trees active; stale trees with uncommitted changes correctly
left alone by the reaper — not this run's to touch).
Worktree registrations slow under sibling load (creekremedy
tree ~8 min). No EPERM flap blocked this run. Two transient
exec failures appear in the blockscreen worker handoff; final
state verified by the coordinator (3 commits, proofs green
post-rebase, clean tree, clean merge) — no work lost.
Safe-commit index clobber hit the creekremedy worker commits;
repaired by the worker via HEAD-blob cacheinfo and verified
clean by the coordinator post-merge. check.js --quick NOT
re-run at coordinator level (zero src/js, zero green-list
files; arm proofs are the landing gate).

## LANDING

- Adoption: 9f81de0d1 (recallpolicy evidence-only, KILLED AT
  PILOT).
- Arm 1: aa13feee1 (prereg) / 4c5874933 (stage-1 screen) /
  923e58ee2 (INSUFFICIENT-DATA evidence + search corpus) —
  rebased onto moved master, proof re-run green, merged
  --ff-only, tree released, branch deleted.
- Arm 2: a7479596d (prereg) / d130a74a9 (instruments) /
  08921426a (DIAG-GO evidence + corpora + analysis) —
  branch current on master, proof re-run green, merged
  --ff-only, tree released, branch deleted.
- This file: coordinator evidence (this commit).
