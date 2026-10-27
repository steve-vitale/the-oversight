# sim-w5block-a — wave-5 unlock blocker census: DIAG-NO-GO (no single blocker)

Run: fleshout loop, run fleshout-20261027T1715Z. Axis: scale-onramp.
Worker: sim-w5block-a. Worktree: `~/workspace/worktrees/sim-w5block-a`
(branch sim-w5block-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: the
wave-5 gate decomposed, component by component, on a fresh band.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-w5block-a-prereg.md (commit cfd6c1dc9).
Corpus: evidence/2026-10-27/perseed-w5block-a/ (8 rows + summary.json
+ sense-74305.txt). Instruments: scripts/test-w5block-a-sweep.js
(census), scripts/test-w5block-a.js (proof validator, ALL PROOFS PASS),
scripts/test-w5block-a-sense.js (non-measured sense replay).

## Plain words

Wave 5 is still closed on every village in this census — 0 out of 8 —
and this run says why it is NOT one simple block. No single gate piece
is the lone holdout: on most villages several pieces are short at once.
But two facts stand out on every seed. First, no village ever produced
a living veteran: the "blood your fighters" bar reads 0 out of 2 on all
eight villages, at the end and at every point along the way, because no
village killed a wave-4 monster at all, and the four wave-3 kills that
did happen were all made by fighters who were dead by the end. Second,
only one village ever earned enough standing to even knock on the
wave-5 door — the rest peaked between 80 and 147 against a bar of 200.
So the door has two keys, and this band held neither: not enough
standing, and nobody left alive who has killed the thing the door
asks you to have killed. The village that came closest sat parked at
199 — one point short — for sixty days, while the game told it honestly
what it lacked. The full seat stays unreached for the same reason: no
wave 5, no full seat, on a third band running.

## Verdict: DIAG-NO-GO (binding prereg, no re-score)

DIAG-GO required ONE named blocker short at end-of-run on >= 6/8 seeds
while every other wave-5 gate component was met at end-of-run.
Blocker support counts (recomputed independently by the validator,
V6): w3rung 0, standingNum 0, capOnly 0, w4faced 0, rd5-armored 0,
rd5-armed 0, rd5-tricks 0, rd5-veterans 0. No component meets the bar,
so the verdict is DIAG-NO-GO — NOT a kill of any system, NOT a GO, and
NOT re-scored on the peak picture below. The peak picture is reported
as secondary analysis (it was not the bound metric), and the metric
review proposes how the NEXT run should frame the question.
The inconclusive branch does not trigger either: 4/8 seeds reached
wave 4, so the band does test the wave-5 gate (the prereg's
inconclusive case was never reaching wave 4 on >= 6/8 seeds).

## The band (binding design, as pre-registered)

- Seeds 74301-74308, fresh band (verified unused as seeds in committed
  2026-10-27 evidence; the one 74308 hit in the tree is a pantry kcal
  count, not a seed). Single arm: scripts/policies/tableseat-nowait.js
  VERBATIM (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset)
  — the 1631Z band's baseline substrate, so wall numbers compare in
  shape. No armed leg: no lever under test.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d tail max).
  Sweep wall time ~4 min for 8 seeds.
- Read discipline: the daily series uses ONLY pure reads
  (villageStanding, standingPlentyCappedTotal, waveCombatReadiness,
  waveEngaged, waveLedgerPoints, state reads). It never calls
  villageStandingTotal() or unlockedWave() daily — the daily gated
  total and daily unlocked wave are computed from the pure reads by
  the replication in the sweep script, so the census cannot push the
  gate it measures. The engine's own numbers are called once at end
  and checked by the validator (V3/V4): computed == engine on all 8
  seeds (peak allowance never needed beyond the recorded peaks).

## Wall numbers (every run needs these)

| field | this band (74301-74308) | 1631Z band (74201-74208, both legs) | w4funnel-repin (73671-73678) |
|---|---|---|---|
| national ever / final | 6/8 / 6/8 | 8/8 / 8/8 | 7/8 / 5/8 |
| table invited / entered | 2/8 / 2/8 | 6/8 / 6/8 | 5/8 / 4/8 |
| wins | 2/8 (both feared lesser) | 6/8 (both legs) | 4/8 |
| full seat | 0/8 | 0/16 | 0/8 |
| lesser seat | 2/8 | 6/8 (1631Z legs) | 4/8 |
| wave-4 unlock | 4/8 | 4/8 | 5/8 |
| wave-5 unlock | 0/8 | 0/16 | 0/8 |
| median survival | 159d | 132d | 130d |
| deaths | 259 | 236 (per leg) | 284 |
| starvation deaths | 3 (1.2%) | 0 | 2 |

National is NOT the wall on this band: 6/8 villages reach national
and stay there, and both wins come through the lesser feared seat.
The wall is wave 5 -> full seat, exactly as in the two prior bands.

## Per-seed gate table (end-of-run, with peak in brackets)

Demand (live code, V5-checked): wave 5 = armored 4 @ P>=15, armed 6,
tricks 3, veterans 2. Wave 4 = armored 3 @ P>=10, armed 5, tricks 3,
veterans 1. Standing bar t5 = 200 (plenty capped at 100 toward it).

| seed | end | wave | rank | raw [peak] / capped / gated | rd5 end [peak] (a/arm/t/v) | rd5 short @ end | w4faced | w4kills |
|---|---|---|---|---|---|---|---|---|
| 74301 | 126d won lesser feared | 3 | national | 122 [122] / 122 / 99 | 1/8/23/0 [3/11/23/0] | armor, veterans | 0 | 0 |
| 74302 | 114d village-lost | 4 | national | 127 [127] / 127 / 127 | 0/0/16/0 [4/10/16/0] | armor, weapons, veterans | 1 | 0 |
| 74303 | 180d survived | 3 | national | 102 [102] / 102 / 99 | 6/8/26/0 [4/11/25/0] | veterans | 0 | 0 |
| 74304 | 180d survived | 3 | regional | 80 [80] / 80 / 80 | 3/8/27/0 [4/11/27/0] | armor, veterans | 0 | 0 |
| 74305 | 159d won lesser feared | 4 | global | 307 [307] / 227 / 199 | 2/6/23/0 [4/11/23/0] | armor, veterans | 4 | 0 |
| 74306 | 108d village-lost | 4 | regional | 25 [127] / 25 / 100* | 0/0/21/0 [5/11/21/0] | armor, weapons, veterans | 2 | 0 |
| 74307 | 180d survived | 3 | national | 102 [102] / 102 / 99 | 5/8/21/0 [5/11/21/0] | veterans | 0 | 0 |
| 74308 | 110d village-lost | 4 | global | 147 [147] / 147 / 147 | 3/5/18/0 [5/10/18/0] | armor, weapons, veterans | 1 | 0 |

\* 74306's gated 100 at end despite raw 25 is the peak ratchet working
as designed: wave 4 released (peak 4) floors the total at 100 forever.
The ratchet holds old ground; it does not open new ground.

Wave-3 rung met on 8/8 seeds (day >= 25 + wave-2 ledger points >= 5).
Wave-4 faced totals: 8 distinct wave-4 types faced across the band
(74302: 1, 74305: 4, 74306: 2, 74308: 1), 0 killed — faced-but-never-
killed 8/8 types.

## Census findings (each number traceable to the corpus)

1. VETERANS: 0 EVERYWHERE, ALWAYS. rd5 veterans = 0/2 at end on 8/8
   seeds AND 0 at peak on 8/8 seeds (daily series maxima all 0).
   rd4 veterans = 0/1 at end on 8/8 seeds. Wave-4 kills = 0 on all 8
   seeds (0 kills, 0 killers, 0 living killers). This is the only
   component that is never met on any seed at any point — but under
   the binding end-state rule it cannot be GO, because the other
   components are also short on those seeds (see finding 2).
2. STANDING NUMBER: only 74305 ever reached it. Peak raw: 122, 127,
   102, 80, 307, 127, 102, 147 — 1/8 at >= 200. Peak capped likewise
   (74305: 227; rest <= 147). Standing splits at peak show the routes
   tried: diplomacy-heavy (102 from 3 seasoned links on six seeds),
   bread-only (74304: 80 from 4 feasts, 0 links, 0 war), and 74305's
   hybrid (war 25 + diplomacy 102 + plenty 180, capped at 100).
   The plenty cap binds only 74305's middle stretch (see finding 4);
   on the other seven seeds the number itself is short, not the cap.
3. THE REVOLVING DOOR, FOUR MORE INSTANCES. Wave-3 kills total 4 on
   the band — exactly one each on 74302, 74305, 74306, 74308 — and
   ALL FOUR killers are dead by end (living wave-3 killers 0/4,
   rd4 veterans 0/4). Same class as w4funnel-repin's 73671
   divergence (killer counted d121-137, dead by end). The veteran
   bar does not just fail for lack of kills: kills happen, killers
   die, the bar empties. (Scope limit, stated plainly: the corpus
   dates the kills only via the wave-3 war-points jump — 74305's
   kill lands d99 — and records the killers dead at end; the killer
   death days themselves are not dated in this corpus.)
4. THE NEAREST SEED, PARKED AT 199 FOR SIXTY DAYS (74305). Daily
   series: d88-98 gated 99 — the rd4 deferral MASKING everything
   above it (raw 182-202, capped 182-202, but rd4 not ready because
   veterans 0, so the tighter 99 hold wins over the 199 hold). d99:
   a wave-3 kill lands (war 0 -> 25), wave 4 releases (peak 0 -> 4),
   gated jumps to 199. d107: first wave-4 type faced. d99-159: gated
   199 continuously — first by the rd5 deferral (capped 227, rd5
   short on armor+veterans), then through a capped dip (d154-158:
   raw 205, capped 125, gated 199 by the plenty-cap hold), then at
   end by the rd5 deferral again (raw 307, capped 227, gated 199,
   rd5 2/6/23/0). rd5 armor met demand (4/4) at d99-106 and decayed
   below it by end; veterans never left 0. Final-day jump noted
   without a mechanism claim: raw 205 -> 307 and capped 125 -> 227
   between the d158 and d159 daily points (the win day) — what posts
   standing on the win day is a question for a future arm, not
   chased here.
5. ARMOR AND WEAPONS DECAY; TRICKS DO NOT. At peak, all four wave-4
   seeds met rd5 armor (4-5 vs 4), armed (10-11 vs 6), and tricks
   (16-23 vs 3) — at peak their ONLY short rd5 bar was veterans.
   At end, armor/weapons fell below demand on the three lost
   villages (rosters 0/0 at end on 74302/74306 — nobody left to wear
   anything) and on 74305 (armor 4 -> 2). Tricks, by contrast, are
   met at end on 8/8 seeds (16-27 vs 3): knowledge is not the block.
   This end-vs-peak decay is exactly why the end-state sole-
   shortfall rule finds nothing: the bars that were met mid-run are
   gone by the time the village ends.
6. DEFERRAL MASKING (general). On 74301/74303/74307 gated sits at 99
   despite raw 102-122: the rd4 hold (bound 99) is tighter than any
   higher hold, so a village that never kills wave-3+ never even
   sees the wave-5 question — its standing line stops at the wave-4
   hold. On 74303/74307 the rd4 hold is veterans-only (rd4 6/8/26/0
   and 6/8/21/0); on 74301 it is armor+veterans (2/8/23/0).
7. DEATH CAUSES (259 deaths): villager combat 94 (36.3%),
   villager-vs-villager combat 68 (26.3%), player arena 57 (22.0%),
   villager expedition 12 (4.6%), villager monster 11 (4.2%), ambush
   4, starvation 3 (1.2%: 74307 villager 1, 74308 player 1 +
   villager 1), remainder singles (wound that wouldn't close 2,
   contest 2, sickness 1, bad belly 1, Grief Counselor 1,
   Inspiration 1, Gavel 1, player expedition 1). Combat dominates;
   starvation does not — the scale wall here is not food collapse.

## Village assessment (plain words)

Six of these eight villages reach national standing and hold it —
they are not failing villages. Three survive the full 180 days, two
win through the lesser feared seat, three are lost (all three lost
villages had reached wave 4 — they met the Mirror Draft and then
fell). The shape of the run is: villages climb to national on links
and feasts, meet wave 4 in a few of its faces, never kill one, and
either win small (lesser seat) or die with the fifth draft still in
the wings. The village that goes furthest, 74305, reaches global
standing, faces four kinds of Mirror Draft monster, and still kills
none of them — its one wave-3 kill, the kill that opened wave 4 on
day 99, is made by a fighter who does not survive to the win. If wave
5 is supposed to be earned by proving you can fight the last draft,
on this band the proof never arrives: the fights are faced, not won,
and the winners do not live.

## Sense-testing read (seed 74305, non-measured replay, last 30 days)

Sense seed by the pre-registered rule: highest gated standing at end
(199), tie-break not needed. Replay: scripts/test-w5block-a-sense.js,
seed 74305, 159 days, output saved alongside the corpus
(perseed-w5block-a/sense-74305.txt, 515 lines). The replay trajectory
SHIFTED from the census (its d134 hold beat reads armor 3/4; the
census end reads 2/4) — as with all narration replays, the text below
proves wording and presence only, never entity identity or counts.

What the villagers actually do, in the replay's last month, reads as
people living, not counters ticking:

- Santiago cooks for the haven, works the smoke racks, checks the
  pantry before heading out and leaves the harvest standing when the
  shelves are full ("The pantry can't take more; the wild will
  keep"), waters and weeds the beds, teaches Ginkgo Nut and Ginger
  to the whole village ("The Codex grows without you lifting a
  finger").
- Dinara turns the foraging party back at full shelves ("Plenty for
  days. Teaching the kids snares instead — they'll need to know")
  and waves off shares ("we eat at the fire, and the shelves keep").
- Sanne unshoulders the pack at full shelves and hauls water instead.
- A language barrier is a real moment: "Abdullah speaks only Arabic.
  No shared words at all — just eyes, hands, and patience."
- The Dad's Thermos beat recurs ("Dad tapped it twice before the
  first sip, every morning") — a lived-in ritual, but also the
  replay's most repeated line: ambient daily lines repeat, the same
  noise class as w4funnel-repin's Reading Glasses beat, not a game
  bug but a limit of reading replays by hit count.
- WORD TRAVELS: "riders from Thornfield bring talk of Haven. Out
  there they call you the Indispensable. Other villages send envoys
  now."
- The game names the block honestly, in fiction, twice over: d134,
  "The fifth draft stays in the wings — armor the village (3 of 4
  fighters armored); blood your fighters (0 of 2 veterans)"; and the
  Herald muster beat, repeated d136-137: "THE HERALD does not notice
  you the way prey notices a hunter. It notices you the way weather
  notices a field. You cannot face this alone — sound the call,
  muster 10 allied blades (you have 0). This is not courage. This
  is arithmetic." The repetition is identical-line repetition, not
  conversation — the warning is honest, but it does not develop.
- d129: a Herald counter learned ("Santiago lived to tell it,
  twice"); d135: ARC IV — THE INEFFICIENCY ("the thing they laughed
  at — needing to EAT — is the engine").

Sense judgment: the late run reads as a village of people with
routines, teaching, and reactions that fit their situation — pantry
discipline, teaching the kids, envoy talk — and a System that tells
the truth about the gate. What it does NOT read is a village
preparing to fight wave 5: nobody musters, nobody is blooded, the
hold beat is the only place veterans are mentioned. The people
pass the sense test; the veteran pipeline does not exist for them
to pass through.

## Blanks filled or documented

- FILLED (answered, with numbers): the wave-5 gate decomposed on a
  fresh band — every component at end and at peak, per seed (table
  above); the end-state sole-shortfall verdict (none, 0/8 support
  everywhere); the peak picture (veterans never met anywhere;
  standing met only by 74305; armor/armed/tricks met at peak on all
  wave-4 seeds); the 74305 sixty-day 199 park with its hold
  alternation (defer4 mask -> defer5 -> cap -> defer5); the
  revolving door's four new instances (wave-3 killers dead by end);
  faced-but-never-killed 8/8 wave-4 types.
- FILLED (gate re-derivation, verified against code): wave 5 = w3
  rung AND gated standing >= 200 AND waveEngaged(4) > 0, where the
  gated total folds in the plenty cap and the rd5 deferral, and the
  rd4 deferral (bound 99) can mask both. Validator V5 confirms the
  live demand values (w5: 4/15/6/3/2; w4: 3/10/5/3/1).
- DOCUMENTED, NOT FIXED (for the coordinator, not chased here):
  (1) game.js unlockedWave()'s comment still says readiness v3 may
  hold wave 4 "until 3 distinct wave-3 kinds are faced blow-by-blow"
  — STALE vs the live waveCombatReadiness gate (design call #4);
  the census reads the live gate. A comment fix is a future arm's
  one-liner, not this DIAG run's. (2) The Herald muster beat repeats
  identically (d136-137, 6+ hits) — narration repetition, same
  class as ambient daily lines. (3) 74305's final-day standing jump
  (raw 205 -> 307, capped 125 -> 227 on the win day) — mechanism
  unexamined. (4) The wave-4 meeting question itself (why faced
  types are never killed) belongs to the funnel/melt arms, not to
  this gate census — this census proves the kill count is 0, not
  why fights are lost or fled.
- CARRIED (not chased here): the melt stage (proposed sim-w4melt-a);
  the empty nonat x w4 class (w5chain-a); the live rule-(3) firing
  band (needs defiance NOT offered — fallbackfeared's open item).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly against
its prereg: DIAG-GO = one blocker short at end on >= 6/8 seeds with
every other component met at end (0/8 everywhere — DIAG-NO-GO).
Three method notes, each a proposal for the NEXT run, never a
revision of this one:

1. END-STATE vs PEAK-STATE. The sole-shortfall rule as written
   cannot see a bar that was met mid-run and lost by end (armor and
   weapons decay as villages die; the ratchet aside, nothing else
   is sticky). A peak-state variant — C short at PEAK on >= 6/8
   while the other components are met at peak — would still NOT
   have given GO here (standing is met at peak on only 74305, so
   veterans-at-peak-sole-shortfall counts 1/8), but it would have
   separated "never had it" (veterans: 8/8 at peak and end) from
   "had it and lost it" (armor/weapons: met at peak on all wave-4
   seeds, short at end). The next run's question is better framed
   as a TWO-KEY lock (standing AND veterans) than as a single
   blocker hunt — or with a looser GO ("one component at zero on
   >= 6/8 seeds", which veterans meets 8/8 at end and peak).
2. ALTERNATIVE FORMULATION, NOTED NOT ADOPTED. The task brief's
   example shape — "wave-4 kills at zero while deed bars are met" —
   is visible here in loose form (kills 0/8 while national reached
   6/8 and the table entered 2/8), but deed bars (deedGateReady's
   5/5/4/3/2 bars) were not instrumented in this census, so no such
   claim is made. A next run that wants that formulation must
   instrument deedGateReady per seed first.
3. PANEL. scripts/balance-panel.js has NO corpus-ingest mode for a
   single-arm census corpus (grep for ingest/corpus: 0 hits; it
   builds before/after panels from two roots). No panel artifact
   was faked; the sweep table + validator output are the comparison
   of record (same standing exception as the recorder corpora).

## Telemetry deviation check (loop body step 10)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/
scale-wall.json --current 'evidence/2026-10-27/perseed-w5block-a/*.json'
--metrics national,table,wins,exiled` -> 3 LOUD lines (national
12->0, table -87% 16->2, wins 16->0, n=9 files). Verdict: KNOWN
ARTIFACT, no investigation, baseline NOT rolled. Two independent
reasons, both documented: (a) the baseline's own _regime note
forbids this comparison (a ~100%-win winseat suite vs a
tableseat-nowait census substrate — wins are structurally lower
here); (b) the field-shape artifact from 1631Z repeats (per-seed
rows carry nationalEver/entered/won, not top-level
national/table/wins paths; summary.json is the 9th file). The
corpus's real wall numbers are nationalEver 6/8, table entered
2/8, wins 2/8. No exiled LOUD line.

## Infrastructure notes

- Sweep: scripts/test-w5block-a-sweep.js, 8 seeds, ~4 min wall.
  Corpus: evidence/2026-10-27/perseed-w5block-a/ (8 rows +
  summary.json + sense-74305.txt). Validator:
  scripts/test-w5block-a.js — ALL PROOFS PASS (V1-V7).
- Safe-commit index clobber hit the prereg commit (cfd6c1dc9) —
  the known class: commit correct, main index showing a bogus
  staged deletion + untracked twin. Repaired via HEAD-blob
  cacheinfo, verified with git status --short empty + git diff
  HEAD empty + hash-object match, before any further work.
- No EPERM flap blocked this run's writes; all rows wrote first
  try (the writer subprocess retry loop was not needed beyond its
  first attempt).
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the 1016Z/1121Z/1215Z/1315Z/1631Z
  precedent for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added — the sense
  script only READS beats on a replay).
- Commit: sim-w5block-a, DIAG-NO-GO, zero src/js diff. Ready for
  coordinator merge; NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
