# sim-vetsurvive-a — wave-4 killer-fate census: CENSUS-GO (the killer lived — scarcity, not death, is the wall)

Run: fleshout loop, run fleshout-20261027T2036Z. Axis: scale-onramp.
Worker: sim-vetsurvive-a. Worktree: `~/workspace/worktrees/sim-vetsurvive-a`
(branch sim-vetsurvive-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
per-kill survivorship census of every wave-4 kill on one band.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-vetsurvive-a-prereg.md (commit 14af18e56).
Corpus: evidence/2026-10-27/perseed-vetsurvive-a/ (8 rows + summary.json
+ sense-74806.txt). Instruments: scripts/test-vetsurvive-a-sweep.js
(kill census + fate tracker), scripts/test-vetsurvive-a.js (proof
validator, ALL PROOFS PASS), scripts/test-vetsurvive-a-sense.js
(non-measured sense replay).

## Plain words

This run was assigned to find out why wave-4 killers die — because the
two bands before it each had exactly one wave-4 kill, and both killers
died before their village ended. This band breaks that story. It also
has exactly one wave-4 kill — three bands running, three kills total —
but this killer is alive at the end of the village, still standing 39
days after the kill, and the veteran bar still sits at one of two. The
killer did not die. There just isn't a second killer.

The kill itself is the player's own: on day 141, the village's own
hero-figure put down a wave-4 Congregation in person, and lived. The
village went on to the full 180 days, reached global standing, earned
standing past 200 — and still sits parked at 199, because the door
needs two living fighters with a wave-4 kill, and only one exists. The
System says so out loud in the village's own story: "blood your
fighters (1 of 2 veterans)." The problem was never that killers die.
The problem is that almost nobody kills a wave-4 monster at all — one
kill in eight villages — and one living killer is only half a key.

## Verdict: CENSUS-GO (binding prereg, no re-score)

GO required: census completes on 8/8 seeds AND every wave-4 kill on
the band gets a complete killer-fate record. COUNT: 8/8 rows, 1 kill,
1 complete fate record (identity, kill day, alive at end, censored
survival). fateComplete = true. VERDICT: CENSUS-GO.

The prereg's verdict sentence also asked for "the dominant
killer-death cause and median post-kill survival." Both are honestly
empty on this band, and that emptiness IS the finding:
- Dead killers: 0. Dominant killer-death cause: NONE (no killer died).
- Median post-kill survival (dead killers only): undefined (no dead
  killers). The one killer's censored survival is 39 days (kill day
  141 → village end day 180, still counting) — reported separately,
  never pooled into a dead-killer median.
- The zero-kill branch does not trigger (1 kill occurred). The
  no-deaths branch is reported here as measured; see Metric review
  for the prereg-wording note (the GO rule itself needed only
  completeness, so no re-score was involved).

## The band (binding design, as pre-registered)

- Seeds 74801-74808, as assigned. Single arm:
  scripts/policies/tableseat-nowait.js VERBATIM (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, TABLEDEFIANT unset) — the w5block/w5twokey/w5seq
  substrate, so wall numbers compare in shape. No armed leg: no lever
  under test.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max). Sweep wall time ~13 min for 8 seeds.
- Freshness, as disclosed in the prereg (not assumed): these seeds
  were never censused for wave-4 kills or killer fate — the quantities
  measured here did not exist for this band anywhere in committed
  evidence. The same seeds WERE screened under the same tableseat-
  nowait baseline leg by sim-defnoffer-screen-a (Band B, 1715Z) for a
  different question (defiance offered at seating); that corpus
  records no waveKillLog, no kill counts, no killer identity, and is
  not re-scored here. It is used for ONE reported cross-check only
  (proof gate G6): per-seed days/gameDays/won match 8/8 — the two
  instruments reproduce the same trajectories exactly, which also
  confirms this band's baseline leg is a true replication.
- Read discipline: the daily series uses ONLY pure reads
  (villageStanding, standingPlentyCappedTotal, waveCombatReadiness,
  waveEngaged, waveLedgerPoints, deedGateReady, state reads). It
  never calls villageStandingTotal() or unlockedWave() daily — the
  daily gated total and daily unlocked wave are computed from the
  pure reads by the w5seq replication. The engine's own numbers are
  called once at end and checked by the validator (computed ==
  engine on the gate quantities the validator covers).
- Substrate-activation gate (rule3trial lesson, binding): band
  courtship combined = 134 (courtCounters 3, courtAccords 23,
  courtNational 8, courtGlobal 4, tended 72, defenseCalls 0,
  proposedLead 24), seeds active 7/8 — GATE PASSES (combined > 0
  and >= 6/8 active). The one inactive seed is 74805, dead day 22
  before courtship can start (lead proposals begin day 25) — a
  timing fact, not a missing substrate. Per-seed courtship:
  74801: 19, 74802: 11, 74803: 9, 74804: 19, 74805: 0, 74806: 22,
  74807: 18, 74808: 36.
- No re-scoring of 74401-74408, 74311-74318, 74301-74308, or any prior
  band: the verdict above is judged ONLY on 74801-74808. Prior bands
  appear below only as comparison columns.

## Wall numbers (every run needs these)

| field | this band (74801-74808) | w5seq (74401-74408) | w5twokey (74311-74318) |
|---|---|---|---|
| national ever / final | 7/8 / 5/8 | 8/8 / 6/8 | 7/8 / 4/8 |
| table invited / entered | 3/8 / 1/8 | 5/8 / 3/8 | 5/8 / 3/8 |
| wins | 1/8 (lesser feared) | 3/8 (all feared lesser) | 3/8 (all feared lesser) |
| full seat | 0/8 | 0/8 | 0/8 |
| lesser seat | 1/8 | 3/8 | 3/8 |
| wave-4 unlock | 3/8 | 7/8 | 5/8 |
| wave-5 unlock | 0/8 | 0/8 | 0/8 |
| median survival | 180d (days: 22, 105, 149, 180×5) | 153d | 156d |
| deaths | 284 | 273 | 238 |
| starvation deaths | 6 (3 player + 3 villager) | 1 | 2 |

National is NOT the wall on this band either (7/8 reach it), but the
funnel to wave 4 narrowed sharply: only 3/8 villages reach wave 4 at
all, against 7/8 on w5seq. The wave-5 door still does not move
(0/8, third band running). Wins fell to 1/8 — the only win is 74801's
lesser feared seat, taken at wave 3 with the gate held at 99 and zero
veterans (see finding 6): the lesser seat does not need the veterans
key at all.

## Per-seed gate table (end-of-run, with peak in brackets)

Demand (live code, V5-checked): wave 5 = armored 4 @ P>=15, armed 6,
tricks 3, veterans 2. Wave 4 = armored 3 @ P>=10, armed 5, tricks 3,
veterans 1. Standing bar t5 = 200 (plenty capped at 100 toward it).

| seed | end | wave | rank | raw [peak] / capped [peak] / gated | rd5 end [peak] (a/arm/t/v) | w4faced | w4kills (living) |
|---|---|---|---|---|---|---|---|
| 74801 | 105d won lesser feared | 3 | global | 227 [227] / 227 [227] / 99 | 4/8/24/0 [4/8/24/0] | 0 | 0 (0) |
| 74802 | 149d village-lost | 4 | regional (peak national) | 110 [110] / 110 [110] / 110 | 0/0/22/0 [0/0/22/0] | 3 | 0 (0) |
| 74803 | 180d survived | 3 | national | 102 [102] / 102 [102] / 99 | 2/8/21/0 [2/8/21/0] | 0 | 0 (0) |
| 74804 | 180d survived | 3 | national | 142 [142] / 142 [142] / 99 | 2/8/24/0 [2/8/24/0] | 0 | 0 (0) |
| 74805 | 22d village-lost | 2 | village | 0 [0] / 0 [0] / 0 | 1/4/6/0 [1/4/6/0] | 0 | 0 (0) |
| 74806 | 180d survived | 4 | global | 272 [272] / 252 [252] / 199 | 7/8/18/1 [7/8/18/1] | 1 | 1 (1) |
| 74807 | 180d survived | 4 | regional (peak global) | 85 [85] / 85 [85] / 100* | 2/7/23/0 [2/7/23/0] | 3 | 0 (0) |
| 74808 | 180d survived | 3 | global | 127 [127] / 127 [127] / 99 | 2/3/23/0 [2/3/23/0] | 0 | 0 (0) |

\* 74807's gated 100 at end despite raw 85 is the peak ratchet working
as designed: wave 4 released floors the total at 100 forever. 74806's
gated 199 at end despite capped 252 is the rd5 deferral: capped >= 200
but rd5 not ready (veterans 1 < 2), so the 199 hold wins. 74801's gated
99 at end despite capped 227 is the rd4 deferral (rd4 veterans 0 at
end — the rd4 key never turned on the winning seed, and the lesser
seat did not care).

## The per-kill table (the whole census is one row)

| seed | killer (vid) | monster | via | kill day | alive at end? | death day / cause | post-kill survival |
|---|---|---|---|---|---|---|---|
| 74806 | the player, Xavier Dubois (xavier_dubois; shown as "you") | The Congregation (congregation) | player | d141 | YES (alive d180) | — (no death) | 39d, CENSORED (still counting) |

Fate detail: the killer is the village's own scholar — the player
character, not a villager. The kill channel is 'player': the player
fought the Congregation personally. The same day the scholar also
killed a cliffhanger (wave 1). The rd4 veteran bar had already turned
on d92, when the same scholar killed a wave-3 terms_of_service — so
this village's veteran pipeline is, start to finish, one person: the
player. No villager on this band killed a wave-4 monster; no villager
on this band holds a wave-4+ kill at end. (Prior bands did not record
killer identity per kill, so no identity comparison is claimed — see
findings-for-backlog.)

On the kill day itself (d141, from the daily series): raw 252, capped
252, gated 199, rd5 [3, 8, 18, 1] with short bars [armor, veterans],
rd4 [5, 8, 18, 1], w4faced 1. By end of run rd5 is [7, 8, 18, 1] with
short bar [veterans] ONLY — the armor bar filled in after the kill,
leaving veterans as the single short bar. The gate's binding bar is
isolated again, this time with the killer alive: the bar needs one
more living killer, and there is no second candidate anywhere on the
band (total wave-4 kills: 1; total living wave-4 killers: 1).

## Census findings (each number traceable to the corpus)

1. THREE BANDS, THREE SINGLE KILLS — AND THE SURVIVORSHIP STORY
   FLIPS. Wave-4 kills per band: w5twokey 1 (killer dead), w5seq 1
   (killer dead), vetsurvive 1 (killer ALIVE). Across 24 seeds: 3
   kills, 2 dead killers, 1 living killer, 0 bands with 2 living
   killers. "Killers die" explains 2 of 3 cases and fails the third;
   kill SCARCITY explains all three: the bar needs 2 living killers
   and the band produces at most 1 kill. The next question is not
   survivorship — it is why wave-4 kills happen once per band at
   all (see findings-for-backlog).
2. THE KILLER IS THE PLAYER. The only wave-4 kill with a recorded
   identity in this census family is the scholar's own kill. Every
   villager-side path to a wave-4 kill on this band produced zero:
   74802 and 74807 each faced 3 kinds of wave-4 monster and killed
   none; 74806 faced 1 kind and the player killed it. Whether
   villagers ever blood a wave-4 monster is now an open question
   with a zero on this band — not a claim about prior bands, whose
   instruments did not record killer identity.
3. THE BAR EMPTIES BY ABSENCE, NOT BY DEATH, ON THIS BAND. rd5
   veterans at peak AND end: 74806 holds 1/2 at both (the killer
   never leaves the bar); every other seed is 0/2 at peak and end.
   rd4 veterans: 74806 peaks and ends at 1 (d92 wave-3 kill, same
   scholar); 74801/74802/74807/74808 peak at 1 and end at 0 (their
   rd4 veteran was a wave-3 killer who died or was succeeded out —
   the daily rd4[3] peak exists but the end bar is 0); 74803/74804/
   74805 never reach 1. The rd4 bar's peak-vs-end emptying on four
   seeds is the death/succession shape the parent bands saw at rd5;
   at rd5 on this band there is nothing to empty — the bar never
   gets past 1.
4. THE WAVE-4 FUNNEL NARROWED. Wave-4 unlock 3/8 (w5seq 7/8, twokey
   5/8). w4faced: 74802: 3, 74807: 3, 74806: 1, rest 0. Two villages
   meet the draft repeatedly and kill nothing; five never meet it.
   Deed w4 (>= 3 types faced): 74802 and 74807 meet it (3 each) with
   zero kills — facing without blooding, again. The meeting key and
   the killing key are earned on different tracks, and only the
   killing key opens anything.
5. STANDING-ONLY, AGAIN — WITH A TWIST. 74806 is the standing-met
   case with veterans HALF met (capped 252, veterans 1/2, gated 199):
   the 74316 shape (standing met, veterans 0) now has a sibling
   (standing met, veterans 1). The seq frame still holds on this
   band (s1ok true, s2seeds 7, s3ok true, rep74316seeds 1 — the one
   replication is 74801: capped 227, veterans 0, gated <= 199 at
   peak... precisely, 74801 peaks capped 227 with peak veterans 0).
   Both-absent at peak: 6/8 (74802, 74803, 74804, 74805, 74807,
   74808); misses: 74801 (standing-only) and 74806 (standing +
   half-veterans).
6. THE LESSER SEAT BYPASSES THE VETERAN GATE ENTIRELY. 74801 wins
   lesser feared at day 105, wave 3, gated 99, rd4 veterans 0 at
   end, rd5 veterans 0, w4faced 0 — a village that never turned
   either veterans key and still took a seat. The full-seat/veteran
   wall and the lesser-seat path are different games; the wall
   numbers (wins 1/8) must not be read as "villages fail" without
   that split.
7. DEATH CAUSES (284 deaths): villager combat 124 (43.7%),
   villager-vs-villager combat 66 (23.2%), player arena 46 (16.2%)
   — combat across those three: 236/284 = 83.1%, the same share as
   w5seq's 83.1% on 273 deaths. Remainder: villager expedition 8,
   villager sickness 7, player dehydration 5, villager monster 5,
   villager wounds-that-wouldn't-close 4, player starvation 3,
   villager starvation 3, player night 3, villager ambush 3,
   player contest 2, singles (villager Influencer, villager
   Congregation, villager alien, villager bad belly, player
   sickness). Starvation total 6 (2.1%) — 74805's day-22 collapse
   accounts for 3 of them (its only story: dead before courtship
   starts). Combat dominates; starvation does not explain the
   scale wall here either.
8. DEED BARS (end-of-run, from gate.deedEnd in each corpus row).
   Bars 5/5/4/3/2 + contests 3 + crises 3 + stage 2 + food deeds +
   scale national+:
   - w1 (>= 5): 8/8 (9-21). w2 (>= 5): 7/8 (74805 at 0 — dead day
     22). w3 (>= 4): 3/8 (74801: 6, 74807: 4, 74808: 4; rest 0-3).
     w4 (>= 3): 2/8 (74802: 3, 74807: 3 — both with ZERO kills;
     74806, the killing village, at 1). w5 (>= 2): 0/8, structurally
     (wave 5 closed).
   - contests (>= 3): 7/8 (74805 at 1). crises (>= 3): 7/8 (74806
     at 2 — the killing village is one crisis short). stage (>= 2):
     8/8 (all stage 3). food deeds: 5/8 (74803/74805/74808 lack
     them). scale national+ at end: 5/8 (74801/74803/74804/74806/
     74808).
   - deedGateReady().ok: 0/8 at end — structurally forced by w5 = 0,
     as pre-registered, not a finding about effort. But note the
     nearest miss on the pre-wave-5 components: 74806 fails three
     (w3 2 < 4, w4 1 < 3, crises 2 < 3) despite being closest on the
     gate itself — the deed bars and the readiness bars measure
     different things, and the village nearest the wave-5 door is
     not nearest the deed door.
9. END-STATE BLOCKER SUPPORT: rd5-veterans 1/8 (74806 alone: every
   other component met at end except veterans — standing 252,
   w3 rung met, w4faced 1 — so 74806 is the band's sole
   end-state sole-shortfall seed, and its shortfall is veterans).
   All other components: 0/8. The peak + sequential frame, not the
   end-state frame, is what sees the structure — same as w5seq.

## Village assessment (plain words)

Five of these eight villages live to the full 180 days — the
longest-lived band in this census family — and seven reach national
standing at some point. But only three ever reach wave 4, only one
village ever kills a wave-4 monster, and only one village sits at
the table at all (74801, winning small through the lesser seat
before day 105). The shape of the run is: villages that endure,
climb on links and feasts, and mostly never meet the last draft —
and the one village that does meet it and kills it is held at 199
anyway, because one killer is half a key. The village that goes
furthest, 74806, is a global village with a full pantry story, a
player who personally killed a Congregation on day 141, and a gate
that still says "one more." If wave 5 is supposed to be earned by
proving you can fight the last draft and live to carry the proof,
on this band the proof arrives once, survives its bearer, and still
isn't enough — because the proof was always supposed to come in
pairs, and pairs never arrive.

## Sense-testing read (seed 74806, non-measured replay, last 30 days)

Sense seed by the pre-registered rule: no dead killer exists, so the
fallback applies — highest gated standing at end (199, seed 74806;
it also holds the band's only kill). Replay:
scripts/test-vetsurvive-a-sense.js, seed 74806, 180 days, output
saved alongside the corpus (perseed-vetsurvive-a/sense-74806.txt, 246
lines, 235 life/gate hits from d150, 4 fight starts). The replay
trajectory SHIFTED from the census (as with all narration replays,
the text below proves wording and presence only, never entity
identity or counts).

What the replay actually shows, in the last month, reads as people
living with a known, named gap:

- The System itself names the gap, four times, in exactly the
  census's terms: d155, d162, d169, d176 — "📡 The fifth draft stays
  in the wings — blood your fighters (1 of 2 veterans)." (Early
  instances add "armor the village (3 of 4 fighters armored)"; by
  d169 armor is met and only veterans remains.) The gate is not
  hidden from the player in fiction — it is announced. What never
  appears is any beat about the Congregation kill itself, or about
  Xavier as a veteran: the village is told it needs veterans, but
  nothing marks the one veteran it has. The count is System-voiced;
  the person is not storied.
- The people pass the sense test around that gap: gardens coaxed
  forward daily, Giulia at the cookpot tasting off the spoon,
  Diana's line-cook story corrected mid-sentence ("the correction
  is worse than the slip"), Laura asking for something to do
  ("Anything. Please."), Sanne sitting down "just... talk. Like
  people used to," Lucas turning the foraging party back because
  "Plenty for days. Teaching the kids snares instead." Word
  travels (Emberhold riders: "Out there they call you the
  Indispensable"), heralds strike allied villages in the night
  ("they notice who wasn't there"), and the HERALD itself warns
  it cannot be faced alone ("sound the call, muster 10 allied
  blades (you have 0). This is not courage. This is arithmetic.").
- What the replay does NOT show: any muster, any second veteran
  pipeline, any villager blooding. Same judgment as w5seq, one band
  further, with one new datum: the fiction now names the 1-of-2
  gap out loud while the village still has no visible path to the
  second veteran.
- Noise class (not a game bug, same as prior runs): the Wedding
  Ring keepsake beat repeats 35 times in 30 days, and the garden
  beds beat repeats daily. Ambient narration is heavy; the signal
  beats (the 1-of-2 announcements) still cut through it.

Sense judgment: the late run reads as a village of people with
routines, teaching, reactions, and a System that tells the truth
about the locked door — and a village that has no visible path
from "we need one more veteran" to "here is how a second fighter
gets blooded." The sense gap and the census gap are the same gap.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly against
its prereg: CENSUS-GO iff 8/8 rows AND every wave-4 kill has a
complete fate record. Result: 8/8 rows, 1 kill, 1 complete record.
Verdict CENSUS-GO. Four method notes, each a proposal for the NEXT
run, never a revision of this one:

1. THE VERDICT SENTENCE ASSUMED DEAD KILLERS EXIST. The prereg's
   "dominant cause + median survival" sentence presupposes at
   least one dead killer; with zero dead killers both are null and
   the honest report is "no killer deaths" + the censored survival
   (39d). The GO rule itself needed only completeness, so this did
   not change the verdict — but future survivorship preregs should
   pre-register the no-deaths branch explicitly (dominant cause =
   none; median = undefined; censored survivals listed).
2. INSTRUMENT BUG FOUND IN JUDGING, FIXED, CORPUS RECOMPUTED (not
   re-scored). The sweep's firstKillDay used
   Math.min(...days.concat([0])) — seeding the minimum with 0 —
   so the 74806 fate record first read firstKillDay 0 and censored
   survival 180. The error was caught while reading the corpus
   against the waveKillLog (kill day 141, not 0). Fix: the sweep
   script now takes the plain min over kill days, and the validator
   gained a firstKillDay-vs-log check (G3). The corpus derived
   fields were recomputed from each row's own waveKillLog by script
   (no hand-typed numbers): 74806 firstKillDay 0 → 141,
   postKillSurvival 180 → 39; summary.fate rebuilt from the
   corrected rows. No measured fact changed (log entry, alive flag,
   and verdict were already correct); the validator now passes
   with the new check included. Lesson, carried forward: every
   derived field needs a validator recompute, not just the headline
   counts.
3. G8 STRICTNESS CORRECTED, SAME CLASS. The validator's as-written
   "strictly increasing daily days" check failed on 74808: the game
   day stalled for one loop-day (day 112 sampled twice, byte-
   identical tuples — the harness's own time-freeze watchdog exists
   because loop-day != game-day). Corrected to non-decreasing with
   duplicate reporting; corpus untouched; no counted quantity
   changes (peaks are maxima, 74808 has zero kills, fate tracking
   is idempotent per day). The check still fails on decreasing days,
   empty series, or a missing kill day. Lesson: a proof check that
   assumes loop-day == game-day is wrong on its face — the harness
   documentation says otherwise.
4. PANEL. scripts/balance-panel.js has NO corpus-ingest mode for a
   single-arm census corpus (grep: 0 hits for ingest/corpus; --out
   required). A panel compare was ATTEMPTED this run
   (`node scripts/balance-panel.js --out /tmp/panel-vetsurvive-a`,
   stopped at a 45s timeout after it began building cases/ from live
   roots, dir removed after): it is the wrong instrument for this
   census, not a failed comparison. No panel artifact was faked;
   the sweep table + validator output are the comparison of record.
   Same standing exception as the w5seq/w5twokey corpora.
5. DAILY SAMPLING EDGE, NOTED NOT HIDDEN. 74808's daily series ends
   at game-day 179 for a 180-day run (the horizon edge: the final
   day's events land after the last sample), and its day-112 stall
   is covered in note 3. No verdict input uses the missing day-180
   sample (all end-state quantities come from the end snapshot +
   the log, not the daily series).

## Telemetry deviation check (loop body step 10)

`node scripts/telemetry-check.js --baseline ~/workspace/goals/
the-scattering-roguelite-survival-game/hidden_files/
telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/perseed-vetsurvive-a/*.json' --metrics
national,table,wins,exiled` -> 3 LOUD lines (national 12->0, table
-81% 16->3, wins 16->0, n=9 files). Verdict: KNOWN ARTIFACT, no
investigation, baseline NOT rolled. Two independent reasons, both
documented (same as w5seq/w5twokey): (a) the baseline's own _regime
note forbids this comparison (a ~100%-win winseat suite vs a
tableseat-nowait census substrate — wins are structurally lower
here); (b) the field-shape artifact repeats (per-seed rows carry
nationalEver/entered/won, not top-level national/table/wins paths;
summary.json is the 9th file). The corpus's real wall numbers are
nationalEver 7/8, table entered 1/8, wins 1/8. No exiled LOUD line.

## Findings for backlog (coordinator appends; not chased here)

- [candidate] WAVE-4 KILL SCARCITY, NOT KILLER SURVIVORSHIP: 1 kill
  per 8-seed band across three bands (3 kills / 24 seeds, 0 bands
  with 2 living killers). The mechanism question moves upstream:
  why do villages meet wave 4 and kill nothing (74802/74807: 3
  faced kinds each, 0 kills) or never meet it (5/8 this band)?
  Suggested next arm: a wave-4 encounter→kill conversion census
  (faced → engaged → killed, by channel), not another survivorship
  census.
- [candidate] SCHOLAR-AS-KILLER: the only wave-4 kill with recorded
  identity in this census family is the player character's. Do
  villagers ever blood a wave-4 monster? Prior bands' instruments
  did not record killer identity, so this is an open question with
  a zero on this band, not a claim about prior bands. A future
  census should record killer identity (scholar vs villager) as a
  first-class field.
- [candidate] THE VETERAN IS COUNTED BUT NOT STORIED: the System's
  "blood your fighters (1 of 2 veterans)" beat names the gap, but
  no beat marks the one veteran the village has (the d141
  Congregation kill earns no villager-facing story in the replay's
  last month; the companionKillBeat fires only for companion kills,
  and this kill was via 'player'). Fiction gap, not a gate gap.
- [candidate] LESSER-SEAT BYPASS CONFIRMED: 74801 wins lesser at
  gated 99 with zero veterans and zero wave-4 faces. Any wall
  narrative that counts wins without the seat split overstates
  failure — and any full-seat narrative must reckon with the
  lesser seat as a live alternative, not a consolation.

## Blanks filled or documented

- FILLED (answered, with numbers): the survivorship question on a
  fresh band — the killer LIVED (d141 kill, alive d180, 39d
  censored survival), so killer death is not the mechanism; kill
  scarcity is (1 kill / 8 seeds, third band running; 3 kills / 24
  seeds, 0 bands with 2 living killers). The full fate record for
  the band's only kill (identity, monster, channel, day, alive
  status, censored survival). rd4/rd5 peak-vs-end per seed (rd4
  empties on 4 seeds by death/succession; rd5 never passes 1).
  The 74806 isolation (veterans the ONLY short rd5 bar at end,
  killer alive). Wall numbers + death-cause shares + courtship
  activation + the 8/8 defnoffer trajectory replication.
- FILLED (gate re-derivation, verified against code): validator G5
  confirms live demand (w5: 4/15/6/3/2; w4: 3/10/5/3/1); G2/G3/G4
  confirm veterans, fate, and peak recomputes from the corpus.
- DOCUMENTED, NOT FIXED (for the coordinator, not chased here):
  (1) the findings-for-backlog items above; (2) the two validator
  corrections (firstKillDay, G8 stalled-day) — instrument fixes,
  not game fixes.
- CARRIED (not chased here): the melt stage (proposed sim-w4melt-a);
  the empty nonat x w4 class (w5chain-a); the live rule-(3) firing
  band (needs defiance NOT offered — fallbackfeared's open item).

## Infrastructure notes

- Sweep: scripts/test-vetsurvive-a-sweep.js, 8 seeds, ~13 min wall
  (slower than w5seq's ~5 min: the daily killer tracker calls
  dispName/vpOf per killer per day; acceptable for a census).
  Corpus: evidence/2026-10-27/perseed-vetsurvive-a/ (8 rows +
  summary.json + sense-74806.txt). Validator:
  scripts/test-vetsurvive-a.js — ALL PROOFS PASS (G1-G5, G7, G8 +
  summary agreement; G6 reported 8/8 trajectory-identical).
- Safe-commit index clobber hit BOTH pre-sweep commits (prereg
  14af18e56, instruments 599faf98) — the known class: commit
  correct, main index showing bogus staged deletions + untracked
  twins. Repaired via HEAD-blob cacheinfo both times, verified with
  git status --short empty + git diff HEAD empty, before any sweep
  ran. The corpus/evidence commit below must be checked the same
  way before this run is called done.
- No EPERM flap blocked this run's writes; all rows wrote first
  try (the writer subprocess retry loop was not needed beyond its
  first attempt).
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the w5seq/w5twokey precedent for
  DIAG-only runs). No [needs-eyes] flag applies (measurement only,
  no narration or behavior added — the sense script only READS
  beats on a replay).
- Panel attempt stopped at 45s (see Metric review §4): the panel
  tool builds from live roots, not from a census corpus.
- Commit: sim-vetsurvive-a, CENSUS-GO (1 kill, killer alive, 39d
  censored survival), zero src/js diff. Branch ready, pending
  coordinator merge; NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
