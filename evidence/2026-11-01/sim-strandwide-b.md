# sim-strandwide-b — GO via the POLICY half: creekseek creates a second strand episode on 17523; the wider P1 band adds only one new seed

Run: oversight-flesh-out-loop-b, arm sim-strandwide-b, run
fleshout-loop-b-20261101T0119Z, axis food-economy (strand substrate).
Worktree sim-strandwide-b, branch sim-strandwide-b. Base commit
ee159dbc35d1af896638bbe851b5bd61e47d93c5 (worktree HEAD at prereg
writing time). DIAG + POLICY-SIDE measurement: zero src/js changes,
zero policy-default flips, zero edits to any existing policy file
or existing script. New files only: prereg, creekseek policy +
driver + pure proof test, evidence, compare, corpora, censuses.
This worker does NOT push, bump, verify live, or merge into master;
the coordinator merges. Status to coordinator: committed on branch,
pending coordinator merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/sim-strandwide-b-prereg.md,
commit 6c0b469f, written BEFORE any judged leg) set four bars.
Bar 3 is an either-half bar; the POLICY half passes, the BAND
half fails, and the prereg says either half suffices:

1. INSTRUMENT GATE: every judged leg errs 0, decisions ==
   evenings, loop-days complete or game-over with day recorded
   — PASSED, 56/56 judged legs (pilot 24 + confirm 32; the 2
   base-check legs are also clean, 58/58 including them). The
   only death-aware horizons are seed 17542, village-lost day
   22 on BOTH policies (22/22 decisions == evenings each).
2. CLASSIFICATION COMPLETENESS: >= 95% of confirmed nights
   across the judged P1 + creekseek cells carry a FAILED-RETURN
   or NO-ATTEMPT story — PASSED at 100% (20/20: 18
   FAILED-RETURN, 2 NO-ATTEMPT — the shared 17533
   blocked-combat night on both policies; 0 unclassified).
3. POPULATION BAR (either half suffices):
   3a. BAND: >= 2 seeds outside {17513, 17511} with >= 1
       failed-return strand episode on P1 G1+G2 (24 legs) —
       FAILED: exactly 1 such seed (17523).
   3b. POLICY: creekseek creek-tile evenings STRICTLY GREATER
       than matched P1 baseline on identical seeds (pooled
       G1+G2), AND >= 1 creekseek failed-return episode on a
       seed outside {17513, 17511} — PASSED: 14 vs 9 creek
       evenings, and 2 creekseek episodes, both on 17523
       (outside the named set).
   Bar 3 therefore PASSES via half 3b, with half 3a's miss
   reported, not hidden — and with the per-band caveat below:
   the whole policy delta comes from G1; G2's delta is zero.
4. SENSE PASS: the sense-read episode reads as a person away
   from home — PASSED (see sense test; the 17523 episodes read
   as a person stuck working a creek line, with the standing
   succession-narration caveat stated, not hidden).

GO is therefore the verdict, on bars 1, 2, 3b, and 4. GO here is
still DIAG + POLICY-SIDE: it authorizes NO src/js fix and NO
criterion merge, and the creekseek policy file is a measurement
policy, not a landed default change — no default flips were made
anywhere in this arm. What the arm delivers is the first
policy-created strand population: a second, causally clean
episode on a seed that already had one, plus proof that the
policy's creek VISIT (go home after the creek stop) is
genuinely distinct from a creek NIGHT.

## Definitions (prereg, reused verbatim from strandtile)

Creek-tile evening = evening tile 'creek', NOT atHaven, NOT
onRoad. Confirmed night = creek-tile evening + following
morning exists and is away. FAILED-RETURN = eveningOutcome
'out-of-reach' (or another attempted-travel outcome) or
tripHomeDetours > 0 on that day. NO-ATTEMPT = none of those
fires. Blocked-crossing flag = the day's dayLines contain
"no crossing without a bridge or a swim" (reported alongside,
never promoted to FAILED-RETURN). Strand episode = a maximal
run of consecutive loop-days, each a confirmed FAILED-RETURN
night, for ONE vessel; a haven morning always breaks it; a
vessel change breaks it; singletons are episodes of length 1.
Episode ends classified by the strandtile exit-day rule.
Death-aware caveat, stated on every citation: a horizon end is
not a return, a village-death end is not a return, a succession
end is a death, not a return.

## THE CENSUS (judged) — 56 judged legs + 2 base-check legs, 30d

Instrument gate: every leg errs 0, decisions == evenings in
count (30/30, or 22/22 village-lost on 17542), loop-days
complete or a game-over with its day recorded. Gate passed on
all six cells. Horizons death-aware (harness stops at Game.over).

Per-seed table — P1 G1 30d (pilot):

genAbs = genuine overnight absences; crTile = creek-tile
evenings; conf = confirmed nights; FR = failed-return nights;
NA = no-attempt nights; eps = strand episodes (days, end story).

| seed | genAbs | crTile | conf | FR | NA | eps |
|------|--------|--------|------|----|----|-----|
| 17519-17522, 17524, 17526 | 0 each | 0 | 0 | 0 | 0 | — |
| 17523 | 2 | 8 | 7 | 7 | 0 | [7-13] SUCCESSION |
| 17525 | 1 | 0 | 0 | 0 | 0 | — |
| TOTAL | 3 | 8 | 7 | 7 | 0 | 1 episode, length 7 |

Per-seed table — P1 G2 30d (confirm):

| seed | genAbs | crTile | conf | FR | NA | eps |
|------|--------|--------|------|----|----|-----|
| 17527-17532, 17534, 17535, 17537-17539, 17541 | 0 each | 0 | 0 | 0 | 0 | — |
| 17533 | 1 | 1 | 1 | 0 | 1 | — (blocked-combat night, day 27) |
| 17536, 17540 | 1 each | 0 | 0 | 0 | 0 | — |
| 17542 | 0 | 0 | 0 | 0 | 0 | — (village-lost day 22) |
| TOTAL | 3 | 1 | 1 | 0 | 1 | 0 episodes |

P1 pooled G1+G2: 9 creek evenings, 8 confirmed nights
(7 FAILED-RETURN, 1 NO-ATTEMPT), 1 episode, on 1 seed
outside the named set (17523). The wider P1 band is
creek-empty except for 17523 and 17533's single blocked-combat
creek night: 22 of 24 fresh P1 seeds never sleep at a creek in
30 days.

Per-seed table — creekseek G1 30d (pilot, matched to P1 G1):

| seed | crTile | conf | FR | NA | eps |
|------|--------|------|----|----|-----|
| 17519-17522, 17524, 17526 | 0 | 0 | 0 | 0 | — |
| 17523 | 13 | 11 | 11 | 0 | [7-13] SUCCESSION, [18-21] SUCCESSION |
| 17525 | 0 | 0 | 0 | 0 | — |
| TOTAL | 13 | 11 | 11 | 0 | 2 episodes (lengths 7, 4) |

Per-seed table — creekseek G2 30d (confirm, matched to P1 G2):

| seed | crTile | conf | FR | NA | eps |
|------|--------|------|----|----|-----|
| all except 17533 | 0 | 0 | 0 | 0 | — |
| 17533 | 1 | 1 | 0 | 1 | — (same blocked-combat night, day 27) |
| 17542 | 0 | 0 | 0 | 0 | — (village-lost day 22) |
| TOTAL | 1 | 1 | 0 | 1 | 0 episodes |

Creekseek pooled G1+G2: 14 creek evenings, 12 confirmed
nights (11 FAILED-RETURN, 1 NO-ATTEMPT), 2 episodes, both on
17523. Pooled delta vs P1 on identical seeds: creek evenings
+5, confirmed +4, failed-return nights +4, episodes +1 —
all of it from G1; G2's delta is zero on every strand number.

Per-seed table — P3 G1 30d (census only, deed-seeking):

| seed | genAbs | crTile | conf | NA | camps |
|------|--------|--------|------|----|-------|
| 17519, 17523, 17524, 17526 | 4-7 each | 0 | 0 | 0 | — |
| 17520 | 4 | 21 | 17 | 17 | 4 camps (succession x3, moved-elsewhere x1) |
| 17521 | 6 | 5 | 5 | 5 | 2 camps (moved-elsewhere x2) |
| 17522 | 4 | 10 | 8 | 8 | 4 camps (moved-elsewhere x3, succession x1) |
| 17525 | 5 | 2 | 1 | 1 | 1 camp (succession) |
| TOTAL | 43 | 38 | 31 | 31 | 11 camps, 0 failed-return (by construction) |

P3's creek richness on identical G1 seeds (38 vs P1's 8
creek evenings) is substrate, never strands: with no return
mechanism every P3 night is NO-ATTEMPT, and P3 numbers are
never pooled into any strand number.

Base check — P1 17513/17511 30d: reproduced EXACTLY.
17513 episode days 5-9 SUCCESSION (6 creek evenings, 5
confirmed, 5 FAILED-RETURN); 17511 singleton day 10
MOVED-ELSEWHERE (1 creek evening, 1 confirmed, 1
FAILED-RETURN). Zero drift across the base move 5aa816b4e
-> ee159dbc3 on the shared named seeds. No substitution, no
retirement, no new named strands from the base check itself.

### Strand-rate baseline (updated — TILE criterion, P1 only)

- Strandtile (bands F1+F2, 16 seeds): 2/16 seeds with >= 1
  episode (17513, 17511).
- This arm, fresh bands G1+G2 (24 seeds): 1/24 seeds with
  >= 1 episode (17523, length-7 episode days 7-13).
- Combined P1 distinct seeds with >= 1 episode: 3/40
  (17513, 17511, 17523). Episode lengths now observed: 1, 4
  (creekseek only), 5, 7. Ends: SUCCESSION x3 (counting
  creekseek's second episode), MOVED-ELSEWHERE x1.
- Creekseek-created population: 1 additional episode on an
  existing episode seed (17523's second episode, days 18-21)
  — a population of episodes, not yet a population of seeds.
  No episode ends by WALK-HOME, ATTEMPT-STOPS, SLEEP-RETURN,
  HORIZON, or VILLAGE-DEATH anywhere in this arm.

### 60d extension: NOT run (prereg condition not met)

The prereg allowed a 60d extension only if the pilot showed
an episode whose last confirmed night is day 29-30 or a
creekseek creek night on day 30. The latest episode night
anywhere is day 21 (creekseek 17523 episode 2), exit day 22
— well inside 30d. No truncation risk, no extension spent.

## The causal read (why the POLICY half passes and what it proves)

Creekseek move records, pooled across all 24 creekseek legs
(712 evenings = 24 x 30 minus 8 for the day-22 village loss
on 17542): at-haven skip 682, already-creek 13,
moved-to-creek 2, no-creek-offered 11, combat skip 4.

- 17523 day 18 — the episode-creating move. Baseline day 18:
  the villager ends competent.daily on trail_edge,
  out-of-reach, sleeps there day 19, home day 20. Creekseek
  day 18: the same away ending, then one honest hop to the
  creek ("You make for the creek to drink before night."),
  nightStep out-of-reach, creek night; days 19-22
  already-creek; episode days 18-21, camp-final day 22,
  succession morning day 23. The move CAUSED the episode:
  same seed, same days, different evening tile, and the only
  policy action that day was the creek step. Episode 1 on the
  same seed (days 7-13) is byte-identical across policies —
  competent.daily itself puts the villager at the creek and
  creekseek skips (already-creek) every evening — so the
  policy preserved one episode exactly and created one new one.
- 17540 day 16 — a creek VISIT, correctly NOT a creek night.
  Baseline: meadow morning, haven evening (walk-no-path).
  Creekseek: meadow -> creek (distance 2, moved-to-creek),
  then nightStep travels home; evening at haven, same
  walk-no-path outcome. The visit counts nowhere in the
  strand numbers (the evening snap is at haven), and the pair
  proves the visit/night distinction is real, not definitional.
- Episode 2's failed-return signal is pure out-of-reach: its
  nights carry NO blocked-crossing flag (creekseek G1 blocked
  nights = 7, all episode-1 nights), because the villager is
  already AT the creek — no crossing is attempted during the
  day. The flag is corroboration, never a requirement, and
  episode 2 confirms an out-of-reach-only episode is real
  under the prereg's signal set.
- The policy's limit, stated plainly: it fired only twice in
  712 evenings. On 682 evenings the villager was already home
  (the policy never drags a home villager out, by design); on
  11 away evenings no creek was offered within a hop; on 13
  the villager was already at a creek. The policy converts
  away evenings that happen to end near a creek — it does not
  manufacture away evenings, and on G2 it manufactured nothing
  at all. A strand population built on creekseek alone would
  still be thin; the binding scarcity is away evenings, not
  creek proximity.

## SENSE TEST (law) — PASS, with the standing caveat stated

Read end to end from THIS arm's creekseek G1 corpus, seed 17523:

- Episode 1, days 7-13 (+ camp-final day 14) — reads as a
  person stuck working a creek line. Day 7 leaves haven in the
  morning, reaches the creek ("A kingfisher works the far bank,
  patient as a tax collector"), sees Stonebridge smoke — then
  the unbridged creek refuses, three times in one day ("The
  creek runs fast here — no crossing without a bridge or a
  swim"), and the evening outcome is out-of-reach. Days 8-13
  repeat the shape with the same vessel: creek mornings, three
  refusals a day, gaining Green Thumb, learning the Living Wire
  counter ("Get OUT of the water... On land it is just a long
  blind fish: slow, harmless, dinner"). Day 14 repeats the
  refusal a final time; day 15 dawns at haven with a different
  vessel — the episode ends by succession, not by return.
- Episode 2, days 18-21 (+ camp-final day 22) — reads as a
  person who went for a drink and could not get home. Day 18:
  "You make for the creek to drink before night." — the
  policy's own line, narrating the move it made — then
  out-of-reach. Days 19-22: creek mornings, creek travel lines
  ("Cold, clear, moving. The best thing you've seen all day."),
  crawdads in the gravel bars. Day 23 dawns at haven with a
  different vessel — succession again, not a return.
- The caveat, stated plainly (same as strandtile's): the
  succession mornings are NARRATED as returns ("You walk back
  into Haven — 9 days gone. The fire's still going... Back is
  back." day 15; "You walk back into Haven. 28 Codex entries.
  The village is glad to see you." day 23). The transcript does
  NOT say the camper died; succession is inferred from the
  vessel change, and the homecoming line belongs to the
  successor. The sense pass rests on the stuck-at-creek days
  (refusals + repetition + learning + the drink line), not on
  the homecoming narration — and the succession end is
  reported as a death, never as a return, everywhere it is cited.
- The ambient "fragments by the fire" texture note #1660 was
  NOT re-checked here (no fire-gossip lines surfaced in the
  filtered sense read) and is not re-filed.

Judgement: both episodes read as a person away from home,
stuck by a refused way home — SENSE PASS. The failing half
is the band half, not the sense half, and the two must not be
conflated: the episodes are real, the fresh-seed population
is just still thin.

## Reachability verdict

TILE-criterion strand episodes ARE reached on current master
— on 3 of 40 distinct P1 seeds cumulatively, and now also via
a policy-created episode on an existing episode seed. Waves
1-5, Arc II/III/IV, regional → national, the table, and the
win flag are not in scope of this census and none is claimed
either way.

## Village assessment, in plain words

Picture twenty-four fresh nighttravel villages, and only two
of them ever sleep at a creek. In the first village, the scholar
walks out on day 7, finds the creek, and cannot get back
across it: seven evenings in a row the way home is refused,
three blocked crossings a day, and she makes a life of it
anyway — learning how the monsters work, gaining a green
thumb — until she dies out there and someone else wakes up
in the hall. Then, eleven days later, the same village does
it again on purpose: the scholar ends the day out on the
trail, stops at the creek for a drink before night, and the
way home will not open — four more nights at the creek,
crawdads and cold clear water, until once again someone else
wakes up at home. In the other twenty-three villages, only
one ever sleeps at a creek — a single night where a fight
blocks the way home — one village dies on day 22, and the
other twenty-one sleep at home every night. Meanwhile, on the same seeds, the deed-seeking
villages sleep at creeks constantly — thirty-eight creek
evenings, eleven camps — because their days end out in the
world instead of at home. So the strand program now has a
tool that works when the chance arises — put a villager who
is already out at the nearest creek, and if home will not
open, a strand follows — but the chance itself is the scarce
thing: villagers who end their days at home never strand, and
a policy that only converts away evenings cannot fix that.
The next question is not creek proximity. It is why so few
villages ever end a day away from home at all.

## Named strands (unchanged + one new episode, no substitution)

- 17513, P1 F2: episode days 5-9 (length 5), end SUCCESSION.
  Reproduced on this base (base check). Unchanged.
- 17511, P1 F2: episode day 10 (length 1), end
  MOVED-ELSEWHERE. Reproduced on this base. Unchanged.
- 17523, P1 G1: episode days 7-13 (length 7), end SUCCESSION
  (exit day 14 creek evening, following morning
  vessel-changed at haven). NEW named seed from the wider band.
- 17523, creekseek G1: episode days 18-21 (length 4), end
  SUCCESSION (exit day 22 creek evening, following morning
  vessel-changed at haven). NEW policy-created episode, same
  seed. The day-18 move (moved-to-creek) is its cause.
- Retired: none. The combined P1 strand population is now
  3 seeds of 40 (17513, 17511, 17523).

## Wall numbers

NOT RE-MEASURED BY THIS CENSUS — reported as last measured,
never fabricated. This pre-seat census does not re-measure
the wall and its numbers must not be presented as wall
numbers. Observed survival on judged legs: 54 of 56 legs
survived their window; the two village-lost legs are the
same seed (17542, day 22) on both policies. Median survival
is window-censored (most legs survive the full window).

## Blanks filled or documented

- Filled (this arm, measured): the first policy-created
  strand episode with a clean causal read — creekseek's
  day-18 moved-to-creek evening on 17523 creates episode
  days 18-21, while episode days 7-13 on the same seed are
  byte-identical across policies. The policy mechanism is
  proven; its yield is 1 new episode from 2 moves in 712
  evenings.
- Filled (this arm, measured): the wider-band P1 strand
  rate — 1/24 fresh seeds (17523), 9 creek evenings, 8
  confirmed nights, 1 episode. Combined with strandtile:
  3/40 distinct P1 seeds carry an episode.
- Filled (this arm, measured): ZERO DRIFT between 5aa816b4e
  and ee159dbc3 on the named seeds (17513 days 5-9,
  17511 day 10, all counts identical). The named strands
  remain current.
- Filled (this arm, measured): the visit/night distinction
  — 17540 day 16 is a creek visit (moved-to-creek, then home;
  evening at haven), not a creek night, and counts nowhere
  in the strand numbers.
- Filled (this arm, measured): P3 substrate on identical G1
  seeds — 38 creek evenings, 31 confirmed NO-ATTEMPT nights,
  11 camps. Deed-seeking ends days out in the world; P1 ends
  days at home. The gap is now a number, not an impression.
- Documented (this arm, NOT a fix): the BAND half's miss is
  a population finding, not an instrument failure — the
  instrument is clean (gate 56/56 judged, completeness 100%),
  the named strands reproduce exactly, and 22 of 24 fresh P1
  seeds never sleep at a creek (17533's single blocked-combat
  creek night aside). The binding
  scarcity is away evenings, and creekseek converts only the
  away evenings it is offered.
- Documented (this arm, sense nuance, recurring): succession
  mornings are narrated as returns ("walk back into Haven"),
  while the census classifies them as deaths (vessel change).
  The sense pass rests on the stuck days, not on the
  homecoming lines.
- Documented (this arm, NOT re-filed): #1660 (creek-night
  narration residue) did not surface in this arm's filtered
  sense read and is not re-filed.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars (gate + >= 95% classification + population
  either-half + sense pass): FOUR OF FOUR MET (gate 56/56
  judged, completeness 100%, population via POLICY half,
  sense pass). The BAND half MISSED (1 seed vs the 2-seed
  bar) and was NOT rescued by pooling creekseek episodes
  into the band count (the band bar is a P1 bar; creekseek
  episodes count toward the POLICY half only) or by any
  other re-score — the verdict is GO via the POLICY half,
  with the BAND miss named exactly.
- Whether the POLICY bar should have demanded a delta on
  the confirm band alone: the pooled bar as written is met
  (14 vs 9), but G2's delta is zero, so the pooled bar
  overstates the policy's generality. The NEXT prereg
  should either demand a per-band delta or pre-state that
  the pooled delta is the bar and report the per-band
  split as a caveat — this run is judged on the bar it
  pre-registered, pooled, with the split reported.
- Whether a singleton failed-return night should count as
  a strand episode: moot this arm — no singleton episodes
  occurred (lengths 7, 7, 4 across P1 + creekseek + base
  check, counting the base-check singleton 17511 day 10
  separately: lengths observed overall are 1, 4, 5, 7).
- Whether out-of-reach-only episodes (no blocked-crossing
  flag) should count: YES under this prereg (out-of-reach
  is a firing signal), and episode 2 is the live proof —
  its nights carry no flag and are still FAILED-RETURN.
- Whether creek VISITS should count toward any strand
  number: NO under this prereg, and 17540 day 16 is the
  live proof that the distinction is enforced (visit evening
  at haven, counted nowhere).
- Carried doubt for the NEXT run: if away evenings are the
  binding scarcity, the next prereg should measure the away
  evening itself (what ends days away, on which policies)
  rather than only its creek subset — but that revision is
  for the NEXT run; this run is judged on the bar it
  pre-registered.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the nighttravel+woodcarry+woodwarm
stack, a 30-day per-day creek census, creek-tile evenings, or
a policy that is not in the registry — the same declaration
every prior strand arm made, stated in the prereg. The
comparison here is a matched-seed census across bands and
across policies on identical seeds through the strandtile
analyzer, attached as
evidence/2026-11-01/sim-strandwide-b-compare.md, never labeled
a panel comparison. No panel result is fabricated; the panel
tool was not invoked on this corpus.

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-strandwide-b-census-p1-g1-30d.json --metrics
national,table,wins,exiled` (and the same on the creekseek
G1 census) prints LOUD "national/table/wins disappeared:
baseline 12/16/16 -> current 0 (n=1 files)". Investigated as
a missing-field artifact, same class as strandtile's round:
this census carries no national/table/wins/exiled fields at
all — the check ingests a census file where the baseline
expects per-seed sweep rows, so 0 means "field absent", not
"wall moved". No genuine LOUD signal. Baseline NOT rolled.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber hit BOTH pre-leg commits
   (prereg file, then the three instrument files: committed
   files showing staged-as-deleted while byte-identical in
   the worktree). Repaired each time via
   `git update-index --add --cacheinfo` from HEAD blobs;
   `git status --short` empty + `git diff HEAD` empty
   verified after each repair. The commits themselves were
   never in doubt (blob hashes match). The coordinator
   should verify the same way after the final commit below.
2. EPERM flap: NOT observed on file writes in this window
   (all corpus splits and census writes landed first-try).
3. One pilot-chain shell quirk, no data impact: the pilot
   chain's trailing multi-file `tail -2` failed with
   "option used in invalid context" AFTER all sims, splits,
   and jsonl deletions had completed — all corpora were
   verified present (8+8+8+2 files) before analysis. The
   confirm chain avoided the trailing tail and exited 0.
4. Judged corpora were never staged in /tmp (jsonl lived in
   evidence/ until split, then deleted, per the rule — no
   .jsonl leftovers of this arm's at evidence time).
5. Diff guard at evidence time: `git diff --name-only
   ee159dbc3 -- src/ scripts/policies/` must show ONLY the
   new creekseek policy file — no game code, no existing
   policy file moved under measurement (verified below
   before the final commit; the creekseek driver and test
   are new files under scripts/, not under scripts/policies/).

## Proof

scripts/test-creekseek-b.js: pure 9/9 (decision guards incl.
at-haven / already-creek / no-creek-offered / nearest +
tie-break with no RNG; fake-Game move incl. successful move
with one say line, at-haven no-drag, refused hop, gate-off).
scripts/test-strandtile-b.js re-run: 9/9 (reused analyzer
unchanged). Corpus checks: every judged leg errs 0,
decisions == evenings (30/30, or 22/22 village-lost on
17542), 56/56 judged legs gateOk (58/58 incl. base check).
Pooled consistency: P1 crTile 9 = G1 8 + G2 1; CS crTile 14
= G1 13 + G2 1; CS move records sum to 712 evenings
(682 + 13 + 2 + 11 + 4), matching 24 x 30 minus the 8
unlived evenings on 17542. Causal pair: 17523 day 18
moved-to-creek -> episode days 18-21 on CS vs trail_edge
sleep-out on P1; 17540 day 16 moved-to-creek -> haven
evening on CS vs haven evening on P1. Diff guard:
`git diff --name-only ee159dbc3 -- src/` EMPTY at evidence
time (see infrastructure note 5 for the policies diff).

## Files

- Prereg (binding, before judged legs):
  evidence/2026-11-01/sim-strandwide-b-prereg.md
  (commit 6c0b469f)
- Evidence (this file): evidence/2026-11-01/sim-strandwide-b.md
- Compare (matched-seed census, not a panel comparison):
  evidence/2026-11-01/sim-strandwide-b-compare.md
- Instruments: scripts/policies/creekseek-b.js,
  scripts/creekseek-trace-b.js, scripts/test-creekseek-b.js
  (instruments commit 8e584fa2; absencehunt driver/analyzer/
  splitter and strandtile analyzer reused verbatim from the
  base)
- Judged corpora (per-seed files + stderr/split logs):
  evidence/2026-11-01/sim-strandwide-b-corpus-p1-g1-30d,
  sim-strandwide-b-corpus-p3-g1-30d,
  sim-strandwide-b-corpus-creekseek-g1-30d,
  sim-strandwide-b-corpus-p1-g2-30d,
  sim-strandwide-b-corpus-creekseek-g2-30d,
  sim-strandwide-b-corpus-basecheck-p1-30d
- Censuses (analyzer output, one per corpus):
  evidence/2026-11-01/sim-strandwide-b-census-p1-g1-30d.json,
  sim-strandwide-b-census-p3-g1-30d.json,
  sim-strandwide-b-census-creekseek-g1-30d.json,
  sim-strandwide-b-census-p1-g2-30d.json,
  sim-strandwide-b-census-creekseek-g2-30d.json,
  sim-strandwide-b-census-basecheck-p1-30d.json
- No sim-findings.md append by this worker (coordinator owns
  the backlog): out-of-scope gaps are noted in the "Blanks"
  section and in the coordinator notes below for the
  coordinator to file.

## Coordinator notes (out-of-scope gaps, for the backlog — NOT filed by this worker)

- P1-vs-P3 creek substrate gap: deed-seeking ends days at
  creeks (38 creek evenings on G1) while nighttravel-stack
  competent.daily ends days at haven (8). Next blank
  candidate: what ends days away, on which policies.
- Succession mornings narrated as returns ("walk back into
  Haven") — recurring narration gap, same class as #1660.
- Seed 17542 village-lost day 22 on both policies: death
  cause not investigated (out of scope for this census).
