# sim-w5twokey-a — wave-5 two-key-lock census: DIAG-GO (two-key lock confirmed)

Run: fleshout loop, run fleshout-20261027T1816Z. Axis: scale-onramp.
Worker: sim-w5twokey-a. Worktree: `~/workspace/worktrees/sim-w5twokey-a`
(branch sim-w5twokey-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: the
wave-5 gate framed as a two-key lock, with deedGateReady bars
instrumented for the first time.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-w5twokey-a-prereg.md (commit c7c214c6e).
Corpus: evidence/2026-10-27/perseed-w5twokey-a/ (8 rows + summary.json
+ sense-74312.txt). Instruments: scripts/test-w5twokey-a-sweep.js
(census), scripts/test-w5twokey-a.js (proof validator, ALL PROOFS PASS),
scripts/test-w5twokey-a-sense.js (non-measured sense replay).

## Plain words

Wave 5 is still closed on every village — 0 out of 8 — and this run
confirms, on a fresh band, that the door has two keys and this band
held neither on six of the eight villages. Key one is standing:
enough earned standing to knock. Key two is veterans: fighters left
alive who have killed the draft before this one. On six villages
both keys were missing at the villages' best moment — standing never
reached 200, and no fighter ever counted as a veteran. The two
villages that break the pattern break it in opposite, instructive
ways. One village finally killed a wave-4 monster — the first such
kill across this census and its parent — but the killer died before
the village ended, so the veteran bar rose to one out of two and
then emptied again. Another village earned standing past 200 and
still sat parked at 99, because the game will not even let standing
count until the village has blooded a fighter — the veteran key
turns first, and without it the standing key does not even fit the
lock. The full seat stays unreached for the same reason: no wave 5,
no full seat, on a fourth band running.

## Verdict: DIAG-GO (binding prereg, no re-score)

DIAG-GO required BOTH keys absent at peak on >= 6/8 seeds: peak rd5
veterans = 0/2 AND peak capped standing < 200, on the same seed.
Count: 6/8 — exactly at threshold, not above it. Both-absent seeds:
74311, 74312, 74314, 74315, 74317, 74318. The two misses are
74313 (veterans peaked at 1/2 — a real wave-4 kill, killer dead by
end) and 74316 (capped standing peaked at 202 — the standing key
present, veterans absent). The verdict is GO, but it is a
threshold GO: one more seed holding either key and it would have
been NO-GO. That fragility is part of the finding, not a footnote.
The inconclusive branch does not trigger: 5/8 seeds reached wave 4,
so the band does test the wave-5 gate.

## The band (binding design, as pre-registered)

- Seeds 74311-74318, fresh band (verified zero hits in committed
  2026-10-27 evidence before sweeping; 74401-74408 held as clean
  alternates, unused). Single arm: scripts/policies/tableseat-
  nowait.js VERBATIM (LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
  TABLEDEFIANT unset) — the w5block substrate, so wall numbers
  compare in shape. No armed leg: no lever under test.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max). Sweep wall time ~5 min for 8 seeds.
- Read discipline: the daily series uses ONLY pure reads
  (villageStanding, standingPlentyCappedTotal, waveCombatReadiness,
  waveEngaged, waveLedgerPoints, deedGateReady, state reads). It
  never calls villageStandingTotal() or unlockedWave() daily — the
  daily gated total and daily unlocked wave are computed from the
  pure reads by the replication in the sweep script, so the census
  cannot push the gate it measures. The engine's own numbers are
  called once at end and checked by the validator (V3/V4): computed
  == engine on all 8 seeds. deedGateReady() is a pure read for
  census purposes (it computes from progState/deedState/scaleRank/
  integrationStage and writes nothing except idempotent deedState
  defaults); the wave-5 unlock gate does not consult it at all.
- No re-scoring of 74301-74308 or any prior band: the verdict above
  is judged ONLY on 74311-74318. Prior bands appear below only as
  comparison columns.

## Wall numbers (every run needs these)

| field | this band (74311-74318) | w5block (74301-74308) |
|---|---|---|
| national ever / final | 7/8 / 4/8 | 6/8 / 6/8 |
| table invited / entered | 5/8 / 3/8 | 2/8 / 2/8 |
| wins | 3/8 (all feared lesser) | 2/8 (both feared lesser) |
| full seat | 0/8 | 0/8 |
| lesser seat | 3/8 | 2/8 |
| wave-4 unlock | 5/8 | 4/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival | 156d | 159d |
| deaths | 238 | 259 |
| starvation deaths | 2 (0.8%) | 3 (1.2%) |

National is NOT the wall on this band either: 7/8 villages reach
national at some point, and all three wins come through the lesser
feared seat without wave 4 at all (74314/74315/74316 won at wave 3,
gated 99). The wall is wave 5 -> full seat, exactly as in the three
prior bands.

## Per-seed gate table (end-of-run, with peak in brackets)

Demand (live code, V5-checked): wave 5 = armored 4 @ P>=15, armed 6,
tricks 3, veterans 2. Wave 4 = armored 3 @ P>=10, armed 5, tricks 3,
veterans 1. Standing bar t5 = 200 (plenty capped at 100 toward it).

| seed | end | wave | rank | raw [peak] / capped [peak] / gated | rd5 end [peak] (a/arm/t/v) | w4faced | w4kills (living) |
|---|---|---|---|---|---|---|---|
| 74311 | 180d survived | 4 | regional | 110 [110] / 110 [110] / 110 | 3/8/24/0 [5/11/24/0] | 0 | 0 (0) |
| 74312 | 171d village-lost | 4 | global | 127 [127] / 127 [127] / 127 | 0/0/20/0 [5/11/20/0] | 1 | 0 (0) |
| 74313 | 116d village-lost | 4 | regional | 70 [172] / 70 [172] / 100* | 0/0/20/0 [5/11/20/1] | 5 | 1 (0) |
| 74314 | 90d won lesser feared | 3 | national | 122 [122] / 122 [122] / 99 | 6/8/22/0 [6/11/22/0] | 0 | 0 (0) |
| 74315 | 115d won lesser feared | 3 | national | 167 [167] / 167 [167] / 99 | 0/10/25/0 [1/12/25/0] | 0 | 0 (0) |
| 74316 | 156d won lesser feared | 3 | global | 242 [242] / 202 [202] / 99 | 3/8/20/0 [4/11/20/0] | 0 | 0 (0) |
| 74317 | 138d village-lost | 4 | regional | 45 [147] / 45 [147] / 100* | 0/0/22/0 [6/10/22/0] | 2 | 0 (0) |
| 74318 | 180d survived | 4 | regional | 25 [127] / 25 [127] / 100* | 4/4/20/0 [7/11/20/0] | 3 | 0 (0) |

\* 74313/74317/74318's gated 100 at end despite low raw is the peak
ratchet working as designed: wave 4 released floors the total at
100 forever. The ratchet holds old ground; it does not open new
ground. 74314/74315/74316's gated 99 at end despite raw 122-242 is
the rd4 deferral: raw >= 100 but rd4 not ready (veterans 0) and
peak standing-wave < 4, so the tighter 99 hold wins.

Two-key count per seed (peak): both-absent on 74311 (110, 0),
74312 (127, 0), 74314 (122, 0), 74315 (167, 0), 74317 (147, 0),
74318 (127, 0) = 6. Misses: 74313 (172, 1), 74316 (202, 0).

## Census findings (each number traceable to the corpus)

1. THE LOCK CONFIRMED, AT THRESHOLD. 6/8 seeds hold neither key at
   peak. The shape is not "one key missing": on the six, standing
   peaks at 110-167 (short of 200 by 33-90) AND veterans never leave
   0. The two misses show the keys are INDEPENDENT — a band can
   hold one without the other — and that neither alone opens
   anything: 74316 holds standing (202) and still sits at gated 99
   because veterans gate wave 4 first (finding 3); 74313 holds half
   a veteran bar (1/2) and still sits short on standing (172).
2. THE FIRST WAVE-4 KILL — AND THE REVOLVING DOOR, FIFTH INSTANCE.
   74313 kills a wave-4 monster on day 94 (a 'strike', killer
   gen_k4v456v) — the first wave-4 kill in this census family
   (w5block: 0). Peak veterans rise to 1/2, still short of the 2
   demanded, and by end the killer is dead, so end veterans fall
   back to 0. Wave-4 kills on the band: 1 kill, 0 living killers.
   Wave-3 kills total 7 on the band (74311: 2, one living;
   74312/74313/74315/74317/74318: 1 each; living at end 2/7).
   The veteran bar does not just fail for lack of kills: kills
   happen, killers die, the bar empties — now true for wave-4
   kills too, not only wave-3.
3. THE KEYS ARE SEQUENTIAL, NOT PARALLEL (74316, the standing-met
   case). 74316 peaks at raw 242 / capped 202 — the standing key
   held — but its gated total never leaves 99, because the rd4
   deferral (veterans 0, rd4 not ready, peak standing-wave < 4)
   holds it there for the whole run, and wave 4 never releases
   (waveReach 3, w4faced 0). A village that earns standing without
   blooding a fighter does not get to spend that standing on wave
   5: the veteran key turns first, at the wave-4 door, and the
   standing key is not even tried until then. Any future arm that
   attacks "standing" alone will run into this wall: on this band
   the standing-met village is still gated by veterans.
4. PEAK READINESS: ONLY VETERANS SHORT. At peak, armored met demand
   (4) on 7/8 seeds (only 74315 short, peak armor 1), armed met on
   8/8 (10-12 vs 6), tricks met on 8/8 (20-25 vs 3). Veterans met on
   0/8 (peak 1/2 on 74313, 0 elsewhere). Same shape as w5block's
   peak picture, one band further: everything except veterans is
   earnable; veterans are the readiness bar that never fills.
5. DEED BARS, FIRST INSTRUMENTATION (end-of-run; peak identical on
   every seed for the faced counts, since faced counts never fall).
   Bars 5/5/4/3/2 + contests 3 + crises 3 + stage 2 + food deeds +
   scale national+:
   - w1 (>= 5): 8/8 (14-19). w2 (>= 5): 8/8 (5-11). w3 (>= 4): 3/8
     (74311: 5, 74316: 5, 74318: 4; rest 3). w4 (>= 3): 2/8 (74313:
     5, 74318: 3; rest 0-2). w5 (>= 2): 0/8, structurally (wave 5
     closed, so no wave-5 type can be faced).
   - contests (>= 3): 8/8 (6-23). crises (>= 3): 6/8 (74314/74315
     at 2). stage (>= 2): 8/8 (all stage 3). food deeds: 5/8
     (74312/74313/74318 lack them). scale national+ at end: 4/8
     (74312 global, 74314/74315 national, 74316 global); at peak:
     7/8 (all but 74311, which never left regional).
   - deedGateReady().ok: 0/8 at end and at peak — structurally
     forced by w5 = 0, as pre-registered, not a finding about
     effort.
6. AGREEMENT: DEED w4 == WAVE-ENGAGED(4) ON ALL 8 SEEDS (validator
   G4). The deed bars and the unlock gate count the same faced
   types; there is no counting disagreement to hide behind.
   DISAGREEMENT, THE FACED-vs-KILLED GAP: deed w4 bar met on 2
   seeds (74313: 5 faced, 74318: 3 faced) while readiness veterans
   sit at 0 at end on both (74313 peaked at 1). Facing a draft and
   blooding a fighter on it are different deeds, and the game
   counts them on different bars: the deed bar rewards meeting,
   the readiness bar rewards killing-and-surviving. A village can
   satisfy the deed side and still hold no veteran key.
7. THE 'WAVE-4 KILLS AT ZERO WHILE DEED BARS MET' FORMULATION,
   BOTH PRE-REGISTERED READINGS: (a) STRICT (deedGateReady().ok
   true while w4kills = 0): 0/8 — structurally impossible
   pre-wave-5, as pre-registered (the w5 bar needs wave-5 faced).
   (b) LOOSE (all pre-wave-5 deed components met while w4kills =
   0): 0/8 at end AND at peak. Closest: 74316 fails ONLY the w4
   faced bar (0 faced; every other pre-w5 component met,
   including standing-scale and food deeds) — a village one deed
   bar from the loose formulation, with zero wave-4 meetings at
   all. The formulation does NOT hold on this band in either
   reading; what holds instead is the two-key lock (finding 1).
   The looser one-component rule (S1: veterans 0 at end AND peak):
   7/8 — all but 74313, whose peak veteran 1 breaks it.
8. DEATH CAUSES (238 deaths): villager combat 77 (32.4%),
   villager-vs-villager combat 66 (27.7%), player arena 56 (23.5%),
   villager monster 13 (5.5%), villager expedition 9, player
   contest 3, starvation 2 (0.8%: both player), ambush 2,
   dehydration 1, sickness 1, remainder singles. Combat dominates
   (83.6% across the three combat causes); starvation does not —
   the scale wall here is not food collapse, same as w5block.
9. END-STATE BLOCKER SUPPORT, REPEATED: 0/8 for every component
   (w3rung, standingNum, capOnly, w4faced, all four rd5 sub-bars)
   — the w5block end-state result reproduces exactly on the fresh
   band. The end-state sole-shortfall frame keeps finding nothing
   because several components are short at end on every seed; the
   peak two-key frame is what sees the structure.

## Village assessment (plain words)

Seven of these eight villages reach national standing at some
point and five are invited to the table — they are not failing
villages. Two survive the full 180 days, three win through the
lesser feared seat, three are lost (all three lost villages had
reached wave 4). The shape of the run is: villages climb on links
and feasts, meet wave 4 in a few of its faces, kill almost nothing
in it, and either win small (lesser seat, no wave 4 needed) or die
with the fifth draft still in the wings. The village that goes
furthest on standing, 74316, reaches global standing, wins the
lesser seat, and never meets a wave-4 monster at all — its 202
standing buys nothing at the wave-5 door because no fighter ever
blooded. The village that goes furthest on fighting, 74313, faces
five kinds of wave-4 monster, kills one, and loses the killer —
the bar it raised falls back to zero before the village ends. If
wave 5 is supposed to be earned by proving you can fight the last
draft and live to carry the proof, on this band the proof either
never arrives or does not survive its bearer.

## Sense-testing read (seed 74312, non-measured replay, last 30 days)

Sense seed by the pre-registered rule: highest gated standing at end
(127, no tie). Replay: scripts/test-w5twokey-a-sense.js, seed 74312,
171 days, output saved alongside the corpus
(perseed-w5twokey-a/sense-74312.txt, 321 lines, 297 life/gate hits
from d141, 13 fight starts d157-171). The replay trajectory SHIFTED
from the census (as with all narration replays, the text below
proves wording and presence only, never entity identity or counts).

What the villagers actually do, in the replay's last month, reads as
people living, not counters ticking:

- Nino waters and weeds the beds, checks the pantry before heading
  out and leaves the harvest standing when the shelves are full
  ("The pantry can't take more; the wild will keep"), turning to
  the water, wood, or stone run instead.
- Ingrid and Mateo turn the foraging party back at full shelves
  ("Plenty for days. Teaching the kids snares instead — they'll
  need to know").
- Wei cooks for the haven, tastes off the spoon, frowns, adds a
  pinch; Elena blows on a spoonful before it goes back in.
- Brian tells the fire about Ingrid ("Ingrid taught Brian the Wild
  Ramps. The story's already growing"); Wei teaches the whole
  village about Kapok Seeds ("The Codex grows without you lifting
  a finger").
- A triage choice is put honestly: "Triage tents and broth for the
  sick, or half rations till it passes, or the healthy hunt hard
  to keep everyone fed. Pick — everything costs."
- WORD TRAVELS: "riders from Emberhold bring talk of Haven. Out
  there they call you the Beloved. Strangers ask for your blessing.
  You don't know what to do with that." The standings beat agrees:
  "Haven sits 1st of 4. Haven leads."
- The game names the block honestly, in fiction, twice over: d144
  and d151, "The next act is still waiting — blood your fighters
  (0 of 1 veterans)" — the wave-4 veteran beat, not the wave-5 one,
  which fits this seed (wave 4 reached, veterans 0).
- The end reads as a village dying, not a counter stopping: d170-171,
  "Nobody's talking much. The fire feels smaller tonight" (twice
  each day), packs too heavy, gear left where it lies, fights
  starting daily d167-171 with no victory beat in the replay text.

Sense judgment: the late run reads as a village of people with
routines, teaching, and reactions that fit their situation — pantry
discipline, teaching the kids, envoy talk, a quiet end — and a
System that tells the truth about the gate. What it does NOT read
is a village preparing to fight wave 5: nobody musters, nobody is
blooded, the hold beat is the only place veterans are mentioned.
The people pass the sense test; the veteran pipeline does not exist
for them to pass through. Same judgment as w5block, one band
further, with one new datum: the one wave-4 kill in the census left
no survivor to teach about it.

## Blanks filled or documented

- FILLED (answered, with numbers): the two-key lock on a fresh band
  — DIAG-GO at exactly 6/8, with the two misses named and shaped
  (74313 half-veteran, 74316 standing-met); deedGateReady bars
  per seed at end and peak (first instrumentation); the
  faced-vs-killed gap quantified (deed w4 met 2/8, veterans 0/8
  at end); the strict and loose 'kills at zero while deed bars
  met' formulations tested and both at 0/8; the sequential-keys
  case (74316: standing 202, gated 99, wave 4 never released);
  the first wave-4 kill in this census family and its revolving
  door (74313: kill d94, killer dead by end).
- FILLED (gate re-derivation, verified against code): validator V5
  confirms live demand (w5: 4/15/6/3/2; w4: 3/10/5/3/1); G4
  confirms deed w4 == waveEngaged(4) on all seeds and deed ok
  recomputes from components.
- DOCUMENTED, NOT FIXED (for the coordinator, not chased here):
  (1) The threshold fragility: DIAG-GO at exactly 6/8 — the lock
  is confirmed, but one seed the other way would have flipped it;
  a confirm band for the lock is a next-run decision, not this
  run's. (2) The wave-4 meeting question itself (why faced types
  are almost never killed) belongs to the funnel/melt arms, not to
  this gate census — this census proves the kill count is 1 with
  0 living killers, not why fights are lost or fled. (3) 74316's
  standing route (0 war, 102 diplomacy, 140 plenty, capped 202)
  shows a diplomacy+feast village can clear the standing number
  while never meeting wave 4 — the standing key and the meeting
  key are earned on different tracks. (4) Replay narration repeats
  ambient daily lines heavily (Nino's pantry beat, Reading Glasses
  beat daily) — same noise class as prior runs, not a game bug.
- CARRIED (not chased here): the melt stage (proposed sim-w4melt-a);
  the empty nonat x w4 class (w5chain-a); the live rule-(3) firing
  band (needs defiance NOT offered — fallbackfeared's open item).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly against
its prereg: DIAG-GO iff both keys absent at peak on >= 6/8 seeds
(6/8 — DIAG-GO). Three method notes, each a proposal for the NEXT
run, never a revision of this one:

1. THRESHOLD HONESTY. GO at exactly 6/8 on a fresh band is a
   confirmation, not a rout. The two misses are informative, not
   noise: one shows the veteran bar can move (1/2) without filling,
   the other shows the standing bar can fill without unlocking
   anything. A next run that wants a stronger claim should
   pre-register a confirm band (same substrate, new seeds) and a
   higher bar — or accept 6/8 as the lock's measured shape and move
   to arms against it (veteran survivorship first, per finding 3:
   veterans gate wave 4 before standing matters).
2. PEAK vs END, SETTLED FOR THIS QUESTION. The peak frame was the
   right one: end-state frames (w5block, and this run's repeated
   0/8 blocker support) cannot see bars that decay as villages
   die, and cannot see a killer who died. Any future gate census
   should keep peaks primary and ends secondary, not the reverse.
3. DEED BARS ARE NOW INSTRUMENTED — USE THEM. The deed series
   (daily, per seed) is in the corpus for the next run to build on:
   first-crossing days for each deed bar, and the deed-vs-readiness
   gap per seed, are already computable from perseed-w5twokey-a
   without a new sweep. The strict-ok formulation is dead on
   arrival pre-wave-5 (structural) and should not be re-proposed;
   the loose formulation's nearest miss (74316, w4-bar only) is
   the shape to watch.
4. PANEL. scripts/balance-panel.js has NO corpus-ingest mode for a
   single-arm census corpus (grep for ingest/corpus: 0 hits; it
   builds before/after panels from two roots). No panel artifact
   was faked; the sweep table + validator output are the
   comparison of record (same standing exception as the w5block
   corpus).

## Telemetry deviation check (loop body step 10)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/
scale-wall.json --current 'evidence/2026-10-27/perseed-w5twokey-a/*.json'
--metrics national,table,wins,exiled` -> 3 LOUD lines (national
12->0, table -69% 16->5, wins 16->0, n=9 files). Verdict: KNOWN
ARTIFACT, no investigation, baseline NOT rolled. Two independent
reasons, both documented (same as w5block): (a) the baseline's own
_regime note forbids this comparison (a ~100%-win winseat suite vs a
tableseat-nowait census substrate — wins are structurally lower
here); (b) the field-shape artifact repeats (per-seed rows carry
nationalEver/entered/won, not top-level national/table/wins paths;
summary.json is the 9th file). The corpus's real wall numbers are
nationalEver 7/8, table entered 3/8, wins 3/8. No exiled LOUD line.

## Infrastructure notes

- Sweep: scripts/test-w5twokey-a-sweep.js, 8 seeds, ~5 min wall.
  Corpus: evidence/2026-10-27/perseed-w5twokey-a/ (8 rows +
  summary.json + sense-74312.txt). Validator:
  scripts/test-w5twokey-a.js — ALL PROOFS PASS (V1-V7 + G4 + G5).
- First sweep attempt crashed on a log-line scope bug (deedEnd
  referenced in sweepMode instead of row.gate.deedEnd) after
  writing only s74311; the fix was a logging-scope one-liner, the
  verdict computation untouched, and the full sweep was re-run
  from scratch (the partial row overwritten by the identical
  deterministic re-run). A validator bug found the same way
  (G4 first compared deed counts against the mid->wave map, but
  gate.wavesFaced is already counts-per-wave) was fixed in the
  validator only; no corpus field changed, and G4 then passed.
- Safe-commit index clobber hit the prereg commit (c7c214c6e) —
  the known class: commit correct, main index showing bogus staged
  deletions + untracked twins. Repaired via HEAD-blob cacheinfo,
  verified with git status --short empty + git diff HEAD empty,
  before any sweep ran.
- No EPERM flap blocked this run's writes; all rows wrote first
  try (the writer subprocess retry loop was not needed beyond its
  first attempt).
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the 1016Z/1121Z/1215Z/1315Z/1631Z/
  w5block precedent for DIAG-only runs). No [needs-eyes] flag
  applies (measurement only, no narration or behavior added — the
  sense script only READS beats on a replay).
- Commit: sim-w5twokey-a, DIAG-GO (two-key lock, 6/8 at threshold),
  zero src/js diff. Ready for coordinator merge; NOT pushed, NOT
  bumped, live NOT verified (coordinator/ship-loop line, not this
  arm's).
