# sim-w5seq-a — wave-5 SEQUENTIAL two-key-lock confirm: DIAG-NO-GO (lock count fails, sequence holds)

Run: fleshout loop, run fleshout-20261027T1940Z. Axis: scale-onramp.
Worker: sim-w5seq-a. Worktree: `~/workspace/worktrees/sim-w5seq-a`
(branch sim-w5seq-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
confirm of the sequential two-key formulation from sim-w5twokey-a on
a FRESH band.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-w5seq-a-prereg.md (commit d5f72c4cf).
Corpus: evidence/2026-10-27/perseed-w5seq-a/ (8 rows + summary.json
+ sense-74401.txt). Instruments: scripts/test-w5seq-a-sweep.js
(census + SEQ computation), scripts/test-w5seq-a.js (proof validator,
ALL PROOFS PASS incl. G10 SEQ recount), scripts/test-w5seq-a-sense.js
(non-measured sense replay).

## Plain words

Wave 5 is still closed on every village — 0 out of 8, a fifth band
running — but the confirm did NOT go the way the parent run's
wording predicted, and that is the finding. The parent run said the
door has two keys and six villages held neither. On this fresh band
only four villages hold neither — because the standing key is no
longer rare. Three villages earn standing past 200 (227, 227, 252)
and still sit parked at 199, held there because no fighter ever
counts as a veteran: the standing key turns, the veterans key
does not, and the door stays shut. That is the 74316 case from the
parent run, now three times over instead of once. A fourth village
kills a wave-4 monster — the second band in a row with exactly one
such kill — and again the killer dies before the village ends, so
the veteran bar rises to one of two and empties again. What the
confirm actually proves is sharper than the wording it was testing:
the sequence is real and it is total — on all eight villages,
standing never counts past the hold while veterans are missing,
and no village reaches wave 5 on one key — but "both keys absent"
is the wrong way to count the lock, because standing is becoming
the common key and veterans are the one that never fills. The
formulation is revised, not re-scored: per the binding
confirm-band rule there is no second judged band on the same
wording in this run.

## Verdict: DIAG-NO-GO (binding prereg, no re-score)

DIAG-GO required BOTH legs:
- LEG 1 (the lock): both keys absent at peak on >= 6/8 seeds.
  COUNT: 4/8 — FAILS. Both-absent seeds: 74402, 74403, 74404,
  74407. Misses: 74401 (standing-only, peak capped 227), 74405
  (veterans-only, peak veterans 1/2), 74406 (standing-only, 227),
  74408 (standing-only, 252).
- LEG 2 (the sequence): S1 8/8 (no daily gated >= 200 point lacks
  both keys; engine-end form holds), S2 8/8 seeds exhibit the
  wave-4-door deferral (a day with raw >= 100, rd4 veterans 0,
  gated <= 99), S3 8/8 (no wave 5 on one key). seqOk = TRUE.
  The sequence holds completely; it is the lock count that fails.

Per the prereg: LEG 1 failing means DIAG-NO-GO regardless of
LEG 2. The verdict is NO-GO on the formulation as worded, NOT
on the sequential structure — the structure passed every check
put to it. The inconclusive branch does not trigger: 7/8 seeds
reached wave 4, so the band tests the wave-5 gate.

## The band (binding design, as pre-registered)

- Seeds 74401-74408, fresh band (verified zero swept hits in
  committed 2026-10-27 evidence before sweeping; the only
  mentions were the w5twokey docs naming this band as held
  alternates). Single arm: scripts/policies/tableseat-nowait.js
  VERBATIM (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT
  unset) — the w5block/w5twokey substrate, so wall numbers
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
  called once at end and checked by the validator (V3/V4):
  computed == engine on all 8 seeds. deedGateReady() is a pure read
  for census purposes (it computes from progState/deedState/
  scaleRank/integrationStage and writes nothing except idempotent
  deedState defaults); the wave-5 unlock gate does not consult it
  at all.
- No re-scoring of 74311-74318, 74301-74308, or any prior band:
  the verdict above is judged ONLY on 74401-74408. Prior bands
  appear below only as comparison columns.
- Confirm-band rule honored: this replicate failed LEG 1, so the
  formulation goes back for revision (see "Revision proposal" and
  "Metric review"). No second judged band was run on the same
  wording.

## Wall numbers (every run needs these)

| field | this band (74401-74408) | w5twokey (74311-74318) | w5block (74301-74308) |
|---|---|---|---|
| national ever / final | 8/8 / 6/8 | 7/8 / 4/8 | 6/8 / 6/8 |
| table invited / entered | 5/8 / 3/8 | 5/8 / 3/8 | 2/8 / 2/8 |
| wins | 3/8 (all feared lesser) | 3/8 (all feared lesser) | 2/8 (both feared lesser) |
| full seat | 0/8 | 0/8 | 0/8 |
| lesser seat | 3/8 | 3/8 | 2/8 |
| wave-4 unlock | 7/8 | 5/8 | 4/8 |
| wave-5 unlock | 0/8 | 0/8 | 0/8 |
| median survival | 153d | 156d | 159d |
| deaths | 273 | 238 | 259 |
| starvation deaths | 1 (0.4%, villager, d152) | 2 (0.8%) | 3 (1.2%) |

National is NOT the wall on this band either — it is less of a
wall than ever: 8/8 villages reach national at some point, 6/8
still hold it at end, and all three wins come through the lesser
feared seat without wave 5 (74402/74403 at wave 3-4, 74406 at
wave 4, all gated below 200). The wall is wave 5 -> full seat,
exactly as in the four prior bands. Wave-4 reach climbed to 7/8
— the funnel to the wave-5 door is widening while the door itself
does not move.

## Per-seed gate table (end-of-run, with peak in brackets)

Demand (live code, V5-checked): wave 5 = armored 4 @ P>=15, armed 6,
tricks 3, veterans 2. Wave 4 = armored 3 @ P>=10, armed 5, tricks 3,
veterans 1. Standing bar t5 = 200 (plenty capped at 100 toward it).

| seed | end | wave | rank | raw [peak] / capped [peak] / gated | rd5 end [peak] (a/arm/t/v) | w4faced | w4kills (living) |
|---|---|---|---|---|---|---|---|
| 74401 | 160d village-lost | 4 | regional (peak global) | 265 [347] / 125 [227] / 199 | 0/0/20/0 [3/10/20/0] | 3 | 0 (0) |
| 74402 | 89d won lesser feared | 3 | national | 122 [122] / 122 [122] / 99 | 4/8/21/0 [5/11/21/0] | 0 | 0 (0) |
| 74403 | 101d won lesser feared | 4 | national | 167 [167] / 167 [167] / 167 | 3/9/19/0 [3/11/19/0] | 1 | 0 (0) |
| 74404 | 153d village-lost | 4 | global | 127 [127] / 127 [127] / 127 | 2/5/20/0 [4/11/20/0] | 3 | 0 (0) |
| 74405 | 151d village-lost | 4 | regional (peak global) | 50 [127] / 50 [127] / 100* | 0/0/22/0 [7/11/22/1] | 3 | 1 (0) |
| 74406 | 120d won lesser feared | 4 | global | 347 [347] / 227 [227] / 199 | 5/9/19/0 [6/12/19/0] | 0 | 0 (0) |
| 74407 | 180d survived | 4 | national | 152 [152] / 152 [152] / 152 | 4/8/24/0 [5/11/24/0] | 3 | 0 (0) |
| 74408 | 161d village-lost | 4 | global | 292 [292] / 252 [252] / 199 | 0/0/21/0 [3/11/21/0] | 4 | 0 (0) |

\* 74405's gated 100 at end despite raw 50 is the peak ratchet
working as designed: wave 4 released floors the total at 100
forever. 74401/74406/74408's gated 199 at end despite capped
227-252 is the rd5 deferral: capped >= 200 but rd5 not ready
(veterans 0), so the 199 hold wins. 74402's gated 99 despite raw
122 is the rd4 deferral (rd4 never ready: rd4 veterans peak 0).

Two-key count per seed (peak): both-absent on 74402 (122, 0),
74403 (167, 0), 74404 (127, 0), 74407 (152, 0) = 4. Misses:
74401 (227, 0), 74406 (227, 0), 74408 (252, 0) — standing-only;
74405 (127, 1) — veterans-only.

## Census findings (each number traceable to the corpus)

1. THE LOCK COUNT FAILS BECAUSE STANDING STOPPED BEING RARE.
   Standing-met seeds: 1/8 on the twokey band (202), 3/8 here
   (227, 227, 252). Across the two bands combined, standing
   reaches >= 200 on 4/16 seeds and climbs (202 -> 227 -> 252),
   while veterans peak at 2/2 on 0/16 seeds and at 1/2 on only
   2/16 (74313, 74405 — both dead by end). A "both keys absent"
   count mixes a key that is becoming common with a key that
   never fills, so it drifts with the standing distribution
   instead of measuring the gate. That is a framing failure,
   not a gate movement: wave 5 stayed closed on all 16.
2. THE SEQUENCE HOLDS ON ALL THREE SUB-LEGS (LEG 2 = TRUE).
   S1: zero daily points violate the gated-200 rule (every
   gated >= 200 point with peak < 5 has capped >= 200 AND rd5
   veterans >= 2; engine-end form holds on all 8). S3: no seed
   reaches wave 5 on one key (wave 5 reached on 0/8 anyway).
   S2: all 8 seeds exhibit the wave-4-door deferral — a day
   with raw >= 100, rd4 veterans 0, gated <= 99 — and on all 8
   seeds veterans is the SOLE short rd4 bar on at least one
   such day (soleShortSeeds 8/8; deferral points per seed 1-69).
   The "standing does not count until veterans turn" behavior
   is not a single-seed anecdote anymore: it is the band's
   normal weather.
3. THREE FRESH 74316 REPLICATIONS (rep74316seeds = 3).
   74401, 74406, 74408 each peak capped >= 200 with peak
   veterans 0 and peak gated <= 199. The sharpest is 74406:
   raw 347, capped 227, gated 199, wave 4 reached, w4faced 0 —
   a village that earned the standing number twice over while
   never meeting a wave-4 monster at all, and the gate held it
   at 199 anyway. 74401 and 74408 add the meeting without the
   kill (w4faced 3 and 4, w4kills 0): meeting the draft does not
   turn the key; only a living killer does.
4. THE VETERANS KEY TURNS ONE NOTCH FURTHER — THEN EMPTIES
   AGAIN (74405, the veterans-only miss). First-veteran day
   F5 = d125: rd5 tuple [4, 8, 22, 1] — armor, armed, tricks
   ALL met, only veterans short of 2 — gated 100 (the wave-4
   ratchet floor). The wave-4 kill is the band's only one (1
   kill, 0 living killers at end, same as twokey's 1/0). Two
   bands running, two wave-4 kills, zero living wave-4 killers:
   the revolving door is now a two-band pattern, not a seed
   story. Note the level-up in precision: on 74405 the ONLY
   short rd5 bar at F5 is veterans — the gate's binding bar is
   isolated, not confounded.
5. THE FIRST-VETERAN TABLE SHOWS THE TURN ORDER (descriptive).
   F4 (first day rd4 veterans >= 1) exists on 7/8 seeds
   (74401 d110, 74403 d74, 74404 d103, 74405 d72, 74406 d119,
   74407 d98, 74408 d119; 74402 never). On every
   F4 day rd4 is fully ready (all bars met) — the rd4 key turns
   cleanly when it turns — yet on 74401/74406/74408 gated stays
   199 on F4 day, because the rd5 key (veterans 2) is still
   unturned: the sequence has two turns, and turning the first
   does not open the second. On 74403/74404/74405/74407, F4 day
   gated equals the standing actually earned (147/127/127/127),
   the 99-hold released exactly at the turn. F5 exists only on
   74405 (d125, above). 74402 never turns either key: rd4
   veterans peak 0, rd5 veterans peak 0, gated 99 at end — the
   pure both-absent shape, and it still wins the lesser seat.
6. PEAK READINESS: ONLY VETERANS SHORT, AGAIN — BUT THE
   STANDING SHAPE MOVED. At peak, armored met demand (4) on
   7/8 seeds (only 74401's rd5 peak armor 3 short; 74401's rd4
   peak armor 5 met the rd4 bar), armed met on 8/8 (10-12 vs
   6), tricks met on 8/8 (19-24 vs 3). Veterans met on 0/8
   (peak 1/2 on 74405, 0 elsewhere). Same readiness shape as
   both parent bands; the new information is all in the
   standing column, not the readiness columns.
7. DEED BARS (end-of-run; daily peak understates end by one
   type on 74401 only — see Infrastructure notes).
   Bars 5/5/4/3/2 + contests 3 + crises 3 + stage 2 + food deeds
   + scale national+:
   - w1 (>= 5): 8/8 (11-19). w2 (>= 5): 8/8 (7-10). w3 (>= 4):
     3/8 (74401: 5, 74402: 4, 74407: 6; rest 3). w4 (>= 3): 5/8
     (74401: 3, 74404: 3, 74405: 3, 74407: 3, 74408: 4; rest 0-1).
     w5 (>= 2): 0/8, structurally (wave 5 closed).
   - contests (>= 3): 8/8 (7-22). crises (>= 3): 7/8 (74403 at
     2). stage (>= 2): 8/8 (all stage 3). food deeds: 5/8
     (74404/74405/74407 lack them). scale national+ at end: 6/8
     (74402/74403/74404/74406/74407/74408); at peak: 8/8 (all
     reach national+ at some point — the first 8/8 nationalEver
     band in this census family).
   - deedGateReady().ok: 0/8 at end and at peak — structurally
     forced by w5 = 0, as pre-registered, not a finding about
     effort.
8. AGREEMENT: DEED w4 == WAVE-ENGAGED(4) ON ALL 8 SEEDS AT END
   (validator G4). The faced-vs-killed gap widens with the deed
   bars: deed w4 met on 5/8 seeds (up from 2/8 on twokey) while
   readiness veterans sit at 0 at end on all 8 (peak 1 on
   74405). Facing the draft is now common; blooding a fighter
   on it and keeping them alive is still the rare deed.
9. THE 'WAVE-4 KILLS AT ZERO WHILE DEED BARS MET' FORMULATION,
   BOTH PRE-REGISTERED READINGS: (a) STRICT (deedGateReady().ok
   true while w4kills = 0): 0/8 — structurally impossible
   pre-wave-5, as pre-registered. (b) LOOSE (all pre-wave-5 deed
   components met while w4kills = 0): 0/8 at end AND at peak.
   Nearest misses, one component each: 74401 fails ONLY
   scale-at-end (w1 16, w2 9, w3 5, w4 3, contests 17, crises 3,
   stage 3, food deeds true — scale false at end), and 74408
   fails ONLY the w3 bar (w3 3 < 4; every other pre-w5 component
   met, w4 4, food deeds true, scale true). The loose
   formulation does NOT hold on this band in either reading;
   what holds instead is the sequential deferral (finding 2).
10. DEATH CAUSES (273 deaths): villager combat 104 (38.1%),
    villager-vs-villager combat 68 (24.9%), player arena 55
    (20.1%), villager expedition 24 (8.8%), villager monster 10
    (3.7%), wounds that would not close 2, ambush 2, dehydration
    2, remainder singles (thirst, expedition, starvation,
    contest, Algorithm, Moderator 1 each). Combat dominates
    (83.1% across the three combat causes); starvation does not
    — the scale wall here is not food collapse, same as both
    parent bands. The single starvation death (74404, d152,
    villager meera_reddy) is the band's only one.
11. END-STATE BLOCKER SUPPORT, REPEATED: 0/8 for every component
    (w3rung, standingNum, capOnly, w4faced, all four rd5
    sub-bars) — the w5block/w5twokey end-state result reproduces
    exactly on the third fresh band. The end-state sole-shortfall
    frame keeps finding nothing because several components are
    short at end on every seed; the peak + sequential frame is
    what sees the structure.

## Village assessment (plain words)

All eight of these villages reach national standing at some
point — the first band in this census family where every village
does — and five are invited to the table. One survives the full
180 days, three win through the lesser feared seat, four are
lost (three of the four lost villages had reached wave 4). The
shape of the run is: villages climb on links and feasts further
than before, meet wave 4 in more of its faces (deed w4 met on
five villages, up from two), kill almost nothing in it, and
either win small (lesser seat, no wave 5 needed) or die with the
fifth draft still in the wings. The village that goes furthest
on standing, 74408, reaches global standing, peaks at 252 capped,
faces four kinds of wave-4 monster, kills none of them, and is
held at 199 — its 252 buys nothing at the wave-5 door because no
fighter ever blooded. The village that goes furthest on fighting,
74405, faces three kinds, kills one, and loses the killer — the
bar it raised falls back to zero before the village ends, for
the second band running. If wave 5 is supposed to be earned by
proving you can fight the last draft and live to carry the proof,
on this band the proof either never arrives, arrives once and
does not survive its bearer, or arrives as standing that the
gate refuses to count until the proof exists.

## Sense-testing read (seed 74401, non-measured replay, last 30 days)

Sense seed by the pre-registered rule: highest gated standing at
end (199, three-way tie 74401/74406/74408, all w4kills 0, so
lowest seed 74401). Replay: scripts/test-w5seq-a-sense.js, seed
74401, 160 days, output saved alongside the corpus
(perseed-w5seq-a/sense-74401.txt, 179 lines, 168 life/gate hits
from d130, 8 fight starts). The replay trajectory SHIFTED from
the census (as with all narration replays, the text below
proves wording and presence only, never entity identity or
counts).

What the villagers actually do, in the replay's last month, reads
as people living, not counters ticking:

- Raj is at the cookpot, tasting off the spoon, frowning, adding
  a pinch; the garden is tended daily (Purslane, Burdock sown,
  beds coaxed forward), and the haven argues about monster names
  ("Vera is calling it 'Big-Eyes.' The name's up for grabs").
- WORD TRAVELS twice: riders from Emberhold and from The Red
  Table bring talk of Haven — "Out there they call you the
  Indispensable. Other villages send envoys now. They need what
  you know." The standings beat agrees: "Haven sits 1st of 6.
  Haven leads."
- A succession lands mid-month and reads as a person, not a
  swap: d140, "You wake up somebody else. DeShawn Becker, 61 —
  a Dentist. Their hands know different work now: Green Whisper,
  Beard Moss, Pyrokinesis, Harvest Table, Berserker Rage."
- ARC IV arrives in fiction: d139, "ROUNDING ERROR RECLASSIFIED:
  ANOMALY. Organic consumption yields impossible output.
  Recalculating." — the food-as-engine thesis spoken aloud by
  the System, which fits this seed's feast-driven standing.
- The end reads as a village thinning, not a counter stopping:
  "Nobody's talking much. The fire feels smaller tonight"
  (repeated d140-143), fights starting d141+, and the OVERTIME
  clock firing twice (d147 x1, d154 x2: "wave 4-5 monsters
  return as RERUNS... The table docks your standing -16/-26.
  Take your seat from Haven to stop the clock"). The overtime
  dock is a real late-run standing drain in fiction; the census
  numbers cannot be attributed to it (replay trajectory
  shifted), but it is the mechanism that would explain a
  standing peak decaying before the end on a seed like this
  one (census 74401: peak raw 347, end raw 265).
- What the replay does NOT show: any muster, any veteran
  pipeline, any beat about blooding a fighter for wave 5. The
  people pass the sense test; the veteran pipeline does not
  exist for them to pass through. Same judgment as w5twokey,
  one band further, with one new datum: the replay's late run
  is full of standing (envoys, standings, indispensable) and
  empty of veterans.

Sense judgment: the late run reads as a village of people with
routines, teaching, reactions, succession, and a System that
tells the truth about the table clock — and a village that has
no visible path from "we are indispensable" to "we have fighters
who survived the last draft." The sense gap and the census gap
are the same gap.

## Revision proposal (for the NEXT run's prereg, NOT a re-score)

The failed wording was: DIAG-GO iff both keys absent at peak on
>= 6/8. The evidence across twokey + seq (16 seeds) supports
replacing it with a veteran-binding formulation, to be
pre-registered fresh by the next run (not applied retroactively
to this band):

- REVISED PRIMARY (proposal): wave 5 is VETERAN-GATED iff (a)
  peak rd5 veterans < 2 on >= 7/8 seeds, AND (b) every
  standing-met seed (peak capped >= 200) has peak gated < 200
  unless peak veterans = 2 — the sequential deferral, which
  held 8/8 here and 8/8 on twokey (S1 form). On the two bands
  combined, (a) holds 16/16 and (b) holds 16/16; the old
  both-absent count holds only 10/16 and falls as standing
  rises, which is exactly why it is the wrong instrument.
- The next run should also pre-register the veteran-survivorship
  question (why the only wave-4 killers die) as its own arm
  rather than re-running this census: the census family has now
  measured the kill count (1 per band, 0 living) twice, and a
  third census would measure the same zero a third time.
- No arm is proposed from this run itself: measurement only,
  per the assignment.

## Blanks filled or documented

- FILLED (answered, with numbers): the sequential formulation on
  a fresh band — LEG 2 holds completely (S1 8/8, S2 8/8 seeds,
  S3 8/8, sole-short 8/8, three 74316 replications); the
  both-absent lock count fails (4/8) because standing is now
  commonly earned; the veteran bar's two-band shape (2 kills,
  0 living killers across 16 seeds); the first-veteran-day
  table (F4/F5 per seed, including the clean 74405 case where
  veterans is the ONLY short rd5 bar); deed bars per seed at
  end (w4 met 5/8, up from 2/8); the strict and loose
  'kills at zero while deed bars met' formulations tested and
  both at 0/8 again.
- FILLED (gate re-derivation, verified against code): validator
  V5 confirms live demand (w5: 4/15/6/3/2; w4: 3/10/5/3/1); G4
  confirms deed w4 == waveEngaged(4) at end on all seeds and
  deed ok recomputes from components; G10 confirms the SEQ
  recount from the daily series.
- DOCUMENTED, NOT FIXED (for the coordinator, not chased here):
  (1) The formulation revision above — the next run's prereg
  decision, not this run's. (2) The veteran-survivorship
  question (why wave-4 killers die) belongs to a funnel/arm
  run, not to this gate census. (3) 74406's standing route
  (raw 347 via plenty 220 + diplomacy 102, w4faced 0) shows a
  feast/diplomacy village can clear the standing number twice
  over while never meeting wave 4 — the standing key and the
  meeting key are earned on different tracks, and the gate
  refuses to convert one into the other. (4) Replay narration
  repeats ambient daily lines heavily (Mixtape/keepsake beat,
  sowing beat daily) — same noise class as prior runs, not a
  game bug.
- CARRIED (not chased here): the melt stage (proposed
  sim-w4melt-a); the empty nonat x w4 class (w5chain-a); the
  live rule-(3) firing band (needs defiance NOT offered —
  fallbackfeared's open item).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its prereg: DIAG-GO iff LEG 1 (>= 6/8 both-absent) AND
LEG 2 (S1 8/8, S2 >= 1 seed, S3 8/8). Result: LEG 1 4/8 (FAIL),
LEG 2 TRUE. Verdict DIAG-NO-GO, with the failing leg named.
Three method notes, each a proposal for the NEXT run, never a
revision of this one:

1. THE BOTH-ABSENT COUNT IS THE WRONG INSTRUMENT. It passed
   at exactly threshold on twokey (6/8) and failed here (4/8)
   while the gate itself did not move (wave 5 closed 0/16
   across both bands) and the sequential structure held 16/16
   in S1 form. A metric that fails while the phenomenon holds
   is measuring the wrong thing: standing's rising distribution,
   not the gate. The revision proposal above replaces it with
   a veteran-binding primary. This note does NOT change this
   run's verdict — the verdict stands as NO-GO on the worded
   formulation, and the revision is a proposal for the next
   prereg.
2. PEAK vs END, SETTLED AGAIN FOR THIS QUESTION. The peak
   frame was the right one: 74405's veteran 1 exists only at
   peak (end 0), and 74401/74406/74408's standing 227-252
   exists at peak with gated held at 199. End-state frames
   cannot see either. Any future gate census should keep peaks
   primary and ends secondary.
3. DAILY SAMPLING GAP, ONE TYPE, ONE SEED. 74401's daily deed
   w4 peaks at 2 while its end deed w4 is 3: the village died
   on day 160 and the final day's wave-4 meeting landed after
   the last daily sample (daily last day 159, run days 160).
   No verdict input uses daily deed peaks (both-absent uses
   capped/veterans peaks; loosePeak uses daily deed tuples
   and is false on all seeds under either reading), and the
   end-state agreement (G4) is unaffected. Future censuses
   should still note death-day events as a known one-day
   sampling edge, not a gate disagreement.
4. PANEL. scripts/balance-panel.js has NO corpus-ingest mode
   for a single-arm census corpus (w5twokey grep: 0 hits for
   ingest/corpus). A panel compare was ATTEMPTED this run
   (`node scripts/balance-panel.js --out /tmp/panel-w5seq-a`):
   it began building panels from live roots (a long sim run),
   not from the corpus, so it was stopped — it is the wrong
   instrument for this census, not a failed comparison. No
   panel artifact was faked; the sweep table + validator output
   are the comparison of record. Same standing exception as
   the w5twokey corpus.

## Telemetry deviation check (loop body step 10)

`node scripts/telemetry-check.js --baseline ~/workspace/goals/
the-scattering-roguelite-survival-game/hidden_files/
telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/perseed-w5seq-a/*.json' --metrics
national,table,wins,exiled` -> 3 LOUD lines (national
12->0, table -69% 16->5, wins 16->0, n=9 files). Verdict: KNOWN
ARTIFACT, no investigation, baseline NOT rolled. Two independent
reasons, both documented (same as w5twokey): (a) the baseline's own
_regime note forbids this comparison (a ~100%-win winseat suite vs a
tableseat-nowait census substrate — wins are structurally lower
here); (b) the field-shape artifact repeats (per-seed rows carry
nationalEver/entered/won, not top-level national/table/wins paths;
summary.json is the 9th file). The corpus's real wall numbers are
nationalEver 8/8, table entered 3/8, wins 3/8. No exiled LOUD line.

## Infrastructure notes

- Sweep: scripts/test-w5seq-a-sweep.js, 8 seeds, ~5 min wall.
  Corpus: evidence/2026-10-27/perseed-w5seq-a/ (8 rows +
  summary.json + sense-74401.txt). Validator:
  scripts/test-w5seq-a.js — ALL PROOFS PASS (V1-V7 + G4 + G5 +
  G10).
- Safe-commit index clobber hit BOTH pre-sweep commits
  (prereg d5f72c4cf, instruments ae7876e7b) — the known class:
  commit correct, main index showing bogus staged deletions +
  untracked twins. Repaired via HEAD-blob cacheinfo both times,
  verified with git status --short empty + git diff HEAD empty,
  before any sweep ran.
- No EPERM flap blocked this run's writes; all rows wrote first
  try (the writer subprocess retry loop was not needed beyond
  its first attempt).
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the w5twokey/w5block precedent
  for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added — the
  sense script only READS beats on a replay).
- Panel attempt stopped (see Metric review §4): the panel tool
  builds from live roots, not from a census corpus.
- Commit: sim-w5seq-a, DIAG-NO-GO (lock count 4/8, sequence
  holds), zero src/js diff. Ready for coordinator merge; NOT
  pushed, NOT bumped, live NOT verified (coordinator/ship-loop
  line, not this arm's).
