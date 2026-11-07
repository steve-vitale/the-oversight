# Journey crisis r150 — run note (2026-11-06, Lane B, leg 6)

## Prereg
`goal hidden_files/evidence/2026-11-06/journey-crisis-r150-prereg.md`
(written before any scored seed; band 13401–13405 verified fresh — full-scope
check: zero hits in any dated prereg, zero in goal hidden_files preregs, zero
in standaccum preregs; the only "13401" hits anywhere are pantry-kcal values
in October JSONs). Leg 6 (crisis). Rotation-b read 6 at run start; this
closeout writes 7 (succession next). Driver
`scripts/journey-crisis-r150-delayed-20261106.js` (r132 driver verbatim EXCEPT
r150 filenames/paths/seeds, the W1 carried count 53/2/2/1, and the ORIGINS map:
13401 Austin, 13402 Seattle, 13403 Boston, 13404 Phoenix, 13405 Chicago),
PLUS (a) the no-repeat pick rule in driveConvo and (b) drift dedupe.
Analyzer `scripts/analyze-crisis-r150-delayed-20261106.js` (r132 analyzer
verbatim EXCEPT r150 filenames/paths and the W1 carried count, PLUS corrected
missed-window count, drift-duplicate census, fight-1 vTaken vs break summary).
Policy oracleV2, 120d death-aware +10d tail, pilot seeds 13401–13405,
sequential. Panel evidence (5 JSONs, 21 transcripts, analysis.txt) in goal
hidden_files `evidence/2026-11-06/`; only the run note + the r150 setup commit
(driver + analyzer + proof test, 9457ed72e, adopted from the timed-out r150
run) are committed to the repo (r129 convention). Master at run start
987766c0c; master moved twice during the run (journey-deepening r110, then
sim-winnability-round-0059); rebased onto d4fe9708b at closeout before merging.

## HEADLINE FINDING — betrayal fight softlocks the game clock (seed 13402, day 18)
Wren joins the party on day 18, then betrays the player the same day
("Nothing personal. I need what's in your pack more than you do." — betrayal
fight, turn-based). The player crosses a barrier to flee; Wren follows through
("The Wren is flagging — it won't follow much further"). Then the fight never
resolves: 270,599 "No path there." lines and 270,599 Wren stall lines
(6 variants cycling — "circles — not hunting an opening", "backs off, breathing
hard", "feints toward you, then checks themself", "paces a wide arc", "glances
over their shoulder", "keeps their distance" — plus one "Talk to me!" plea),
541,646 say lines on day 18 alone, 36MB panel JSON. The game day froze at 18
for the remaining 106 driver iterations: pantryDaily gameDay stuck at 18,
pantry frozen at 66,069 kcal, zero say lines after day 18, census frozen
(alive 10). The driver reported endReason "horizon" — a mislabel: the village
did not reach day 120, it froze on day 18. True horizon this panel: 0/5, not
1/5. On a real phone this is a frozen fight: the player taps, Wren stalls,
nothing resolves, the day never comes. FILED for a builder run (not fixed here
— root-causing the betrayal/chase stall loop is engine work, and the run's
scope is measurement). Instrument item filed alongside: the driver should
detect a frozen gameDay (same gameDay across N iterations) and stop with
endReason "softlock" instead of burning 100 iterations and reporting
"horizon". No other seed froze (13401/13403/13404/13405 advance normally,
1–3 iters at max gameDay = the death tail).

## Panel (binding)
| seed | end | days | raids | gorge | sorties | ok | refused | convos | alive | pantry |
|------|-----|------|-------|-------|---------|----|---------|--------|-------|--------|
| 13401 Austin | game-over (scattered) | 53 | 4 | 18 | 3 | 1 | 2 | 5 | 1 | 0 |
| 13402 Seattle | SOFTLOCK d18 (reported "horizon") | 120 iters / 18 game-days | 2 | 0 | 0 | 0 | 0 | 2 | 10* | 66,069* |
| 13403 Boston | game-over (scattered) | 96 | 4 | 6 | 1 | 1 | 0 | 6 | 1 | 0 |
| 13404 Phoenix | game-over (scattered) | 78 | 5 | 17 | 9 | 2 | 7 | 5 | 1 | 0 |
| 13405 Chicago | game-over (extinct) | 58 | 4 | 6 | 5 | 1 | 4 | 3 | 0 | 0 |

\* 13402 alive/pantry are the frozen day-18 state, not day-120.
attempts=18 ok=5 refused=13 cleared(remaining0)=1 deltaExact=5 deltaBad=[]
gorgeNights=47 gorgeKcal=49,037 convos=21 fabricHits=0 sortieFights=10.
D1 snapshots 18/18, missing 0; delayed>=3 attempts 18/18. D2 clear rate ok
1/5. D3 drift labels: player-drawn-off 19, moved-on-valve 7, sortie-clear 6;
unknown=[]. D5 deltaBad=[]. gorgeAfterCleared name-matched=3, idMatched=0,
return=0. R57 D3 death mismatches: 2 (Ihaka d40, Emad d59) — both
muster-explained (Dina class, closed): leaders who die mid-sortie; the
sortie-leader death capture gap (Q10) is still open. R58 bloodied lines 0.
R70 phoenix burns 0 everywhere; wrapMissing=false everywhere. R88 tick-part
sampler coverage 431–995 samples/seed; missed-window raw=2, corrected=2,
excluded-answered=0. Drift duplicates in panel JSONs=0, driverSkipped=0.
R128 WRAP: transcripts=21, marked=21, unmarked=0.

### Bars
- C1 (bend, not break) GO: all four game-overs are attrition/scatter
  (pantry 0, deaths to monsters/the wild/arena/contest/betrayal/starvation),
  none a siege-mechanic failure. Horizon descriptive: 0/5 true (13402 is a
  softlock, not a horizon).
- C2 (episodes fire + gates hold) GO: raids fire on all seeds; fought
  resolutions present; D1 snapshots all delayed >= 3 attempts (18/18);
  deltaBad empty; D3 drift unknown = 0.
- C2b (linger-conditional gorge/sortie) GO: every boundary-firable case fired
  or refused with a recorded reason; 13402 had no lingerers (PASS on
  raids+resolutions alone). Corrected missed-window (=2) is descriptive per
  the prereg and never folds into C2.
- BENCH (descriptive): whole-panel mixed, no single lever — supply-empty 7/13
  majority (gate-one-short 4, availability-drain 2, other 0). Alive-bench
  subset (primary): 3 refusals — availability-drain 2, gate-one-short 1;
  nodeAway exclusions 20 total across the 3, present in 3/3 (13401 d49: 1 of
  2 living; 13404 d45: 9 of 10; 13404 d47: 10 of 10). The r132 pattern holds in
  substance: living villagers out on node-travel business drain the bench.
- C3 (people check) NO-GO on the strict letter: all 21 transcripts read in
  full; fabricHits=0; zero unforced consecutive repeats (the no-repeat driver
  fix works — forcedRepeats=0 everywhere, noRepeatRedirects 0–3 per convo);
  but 1 of 21 fails the meaning bar — seed 13402 d9, Wren's stock loop (see
  C3 below). Engine-side finding filed for a builder run per prereg Q6.
- WRAP-CHECK GO: unmarked = 0 across all 21 driven transcripts.
- C7b (instrument) GO: corpse-cause counts match the corpse record on all 5
  seeds. The feed undercounts the corpse record (13403 wound/thirst, 13405
  famine: feed 0 vs corpse 1 each) — the known deaths-feed gap, reported
  separately, not a C7b failure.

### Leg questions
1. MULTI-MONSTER SET CLEAR — ANSWERED, first clear. 13403 d64: a 3-monster
   set (memory_projector 49 HP, alien_tick 34 HP, heckler 64 HP) all killed
   across 3 fights, remaining 0 — the first strict multi-monster clear (r132:
   0/13). 13405 d44: a 4-monster set, 2 killed, 1 monster fled, party fled
   the last — cleared-flag true with remaining 1. multiMonsterCleared 2/4 by
   the loose flag, 1 strict.
2. BENCH — see above. nodeAway predicts alive-bench refusals again (3/3
   have nodeAway as the dominant exclusion).
3. FIGHT-1 DAMAGE THRESHOLD — descriptive. Per ok sortie (fight-1 vTaken →
   outcome): 15 vKill → cleared; 17 vKill → cleared; 23 vDie (leader Ihaka
   died in fight 1) → broke; 77 vFlee → broke; 122 vDie (leader Emad died in
   fight 1) → broke. Cleared at ≤17, broke at ≥23 — but n=5, and fight-1
   OUTCOME predicts the break as much as the number: both clears opened with
   a kill, all three breaks opened with a death or a flee. A second ally in
   the fight (not just the muster) stays measurement-only here.
4. W1 carried count — refusals 66 (53+13), same-set re-musters 4 (2+2),
   ok sorties after a refusal 4 (2+2), full clears after a refusal 1 (1+0).
   The second same-set re-muster is a pattern now, not a fluke (13404 d47
   after the d45 refusal; 13404 d59 after d45/d47 refusals).
5. MISSED-WINDOW corrected = 2 (r132 corrected = 1): 13401 Congregation d51
   (lastSeen 49, waited-5 samples on d50) and 13404 Algorithm d62 (lastSeen
   60, waited-5 samples on d61). Both narrow 1–2 day windows, both
   moved-on-valve drifts. <8, no instrument look triggered.
6. C3 — see below. The loop mechanism recurred despite the driver fix
   (engine-side finding). Engine-side loop items stay FILED.
7. G-ID watch — ninth panel at zero id-matched gorge-after-clear. Watch
   stays open, not closed. (Name-matched=3 on 13405 are the r117 collision
   class: same name, different key, not a game event.)
8. Naming-stance wobble — no fourth sighting in the C3 read. Watch stays at
   three panels.
9. Nonverbal-nod wrinkle — the signing-nod PAIR (YOU nod → NPC nod-back)
   appears in 1 conversation (13405 d54, Joseph — varied responses, working
   as designed). No graduation on the pair reading. Separate repetition note:
   the stock react line "They nod slowly, not quite done, not quite
   continuing." recurs verbatim in 3 conversations (13402 d9, 13404 d43,
   13404 d57) — the filler that fills stalled conversations.
10. Sortie-leader death capture gap — sighted twice (Ihaka d40, Emad d59).
    Still open, descriptive.

### C3 people check (all 21 transcripts read in full)
Strong majority. Cross-conversation memory works twice: Amara quotes the
player's d18 closing line back on d32 ("We never did finish talking about
what's been happening — that was 14 days back"), and Ray remembers the d24
joke on d43 ("That thing you told me — the funny one... I still think about
it"). Debts pay off (Vikram d28: "You came through on the sickness I'm
fighting. I won't forget it"). Mourning names the actual dead (Saul d29:
"We lost Sam, Jorge and Ingrid. I do the headcount without thinking";
Mason d33: "Miguel owed me a favor. I keep thinking about collecting.
Stupid."). Favors have real obstacles and real follow-through (Wren's pantry
run blocked because she's miles out on the road; Amara's cut tended in 30
minutes, fulfilled; Vikram's sickness helped, thanked). The confront chain
handles repeat poking gracefully — five distinct refusals that escalate
("We went over this", "I confessed that already", "You're really going to
make me say it again?"). The French-only villager (Joseph d54) holds a whole
conversation in nods and smiles, each one varied, ending on his one English
word ("Non, non." — proud of it). Villagers state goals (Emad: "I'm not
staying here forever. The moment I can travel, I'm going looking") and
leadership ambition (Mason: "Someone has to make decisions here... it might
as well be someone who knows how").

Findings filed (engine-side, builder run):
- LOOP RECURRENCE (13402 d9, Wren): the NPC opens with a promise — "we need
  a plan, and we need it today" — and the conversation never delivers it.
  The driver cycles recap/goon/react through stock lines ("We were just
  talking. Nothing important.", "They hear the warmth in it. They're not
  ready to let it in.", "They nod slowly...") for 9 picks with no want, no
  engagement, no resolution. The no-repeat driver fix doesn't prevent it
  because the driver alternates picks. When a villager has no open thread,
  the conversation should end gracefully instead of cycling stock lines.
- ENGAGEMENT GAP (13404 d57, Emad): "I've been hiding an injury. I'm
  ashamed and I can't stop." — a confession with no help/tend path offered;
  the conversation drifts to stock lines and closes. Emad dies in a sortie
  two days later. A confession this serious should open a favor path (as
  Amara's wound did on 13403 d33).
- WRONG-SUBJECT RECAP (13403 d33, Amara): after a HEAL favor is fulfilled,
  recap answers "Still on that foraging help." — a stale subject label. One
  instance in 21 conversations; filed under the existing "recap respects a
  closed subject" item.
- The party-name menu offers the same three options in every village (System
  suggestion varies: "MEAT AND FRIENDS", "THE PROTAGONISTS"); the villager
  suggestion rotates. Mild cross-seed repetition, not a defect.

## Village assessment (plain words)
- Austin (13401): 53 days, then scattered. Twelve people became eleven
  corpses — monsters took four, the wild took three, one to the Glow Stag,
  one to the arena, one to betrayal, one to a contest. The pantry hit zero.
  The last survivor kept doing the headcount out of habit. A village that
  fought, grieved properly, and still ran out of everything.
- Seattle (13402): healthy and then frozen. Ten alive, pantry 66,069 kcal —
  the strongest village of the panel — and the game stopped on day 18 in a
  betrayal fight. The village didn't die; the clock did.
- Boston (13403): 96 days, then scattered. Eleven corpses: four to the wild,
  two to emergency hunts, and one each to a monster, a contest, thirst, a
  wound that wouldn't close, and the arena. One survivor. The longest-lived
  village of the panel, and still a slow bleed.
- Phoenix (13404): 78 days, then scattered. Sixteen corpses, the bloodiest
  panel: ten to the wild, four to monsters, one to the arena, one to an
  emergency hunt. The village kept sending people out and kept not getting
  them back.
- Chicago (13405): 58 days, extinct. Thirteen corpses, nobody left: sickness
  took Miguel, starvation took Mariam at the end, the wild took the rest.
  The only village that died out completely.

Common thread: four of five villages end scattered or extinct by day 96 with
the pantry at zero, and "the wild" is the biggest killer — unattributed field
deaths, people dying out of sight. The one village that was thriving got
stopped by a bug, not by the world.

## Reachable / fun / winnable (crisis leg)
- REACHABLE: yes. Raids fired on all 5 seeds, sorties were offered and
  sometimes taken, betrayal/murder threads fired with working investigation
  picks, and the conversations are reachable and responsive. The crisis
  content is all reachable by a competent player.
- FUN: mostly. The conversations carry the leg — memory across days, debts
  paid, grief with names on it, a French-only villager you talk to in nods.
  Sorties are tense but usually break in fight 1 (3 of 5 ok sorties broke
  after one fight), and the first multi-monster clear shows they CAN pay off
  now. The anti-fun is the stock-loop conversation (d9) and the softlock —
  a betrayal fight that freezes the run is the opposite of fun.
- WINNABLE: the crisis leg isn't a win path itself, and this panel doesn't
  measure the winnability chain — but two things bear on it. First, villages
  still collapse to attrition (4/5 scattered or extinct by day 96, pantry
  zero). Second, the softlock is a hard blocker in the win's way: a competent
  player who gets betrayed can lose the whole run to a frozen clock, through
  no fault of their own. That defect outranks the panel's other findings.

## Instruments
- Determinism proof: seed 13401 re-run with the r150 driver — panel JSON
  byte-identical, all 5 transcripts identical. PASS.
- Proof test `scripts/test-crisis-r150-instruments.js`: ALL PROOF CHECKS PASS
  (driver transcript fix, analyzer killer-subject filter + C7b, synthetic
  panel). Re-run on the rebased tip at closeout.
- Smoke: SEED=13401 DAYS=5, 13s, exit 0, no instrumentErrors.
- Telemetry: `telemetry-check.js` vs `telemetry-baselines/crisis.json`
  (defendedFights, playerFights, latelyDefenseCount) — quiet, 5 files,
  3 metrics, no large deviations. No LOUD lines. Baseline NOT rolled (a
  single 5-seed panel's variance doesn't reseed it).

## Metric review (§14)
- C3's bar ("conversations meet the meaning bar") was missed by 1 of 21
  transcripts (d9 Wren stock loop). The miss is recorded as a C3 NO-GO on
  the strict letter, not re-scored against a friendlier metric. Proposed
  revision for the NEXT run: the bar should distinguish the loop mechanism
  (engine-side, already filed) from the conversation sample — e.g. C3 GO if
  fabricHits=0 AND at most one loop-recurrence conversation AND the recurrence
  is filed engine-side. This run judges by the prereg as written.
- The panel's "horizon" row for 13402 was a driver mislabel (softlock, not
  horizon). Proposed instrument change for the next run: frozen-gameDay
  detection in the driver (same gameDay across N iterations → endReason
  "softlock"). The C1 horizon line is descriptive, so this reclassification
  does not re-score any binding bar.
- The fight-1 vTaken signal (cleared ≤17, broke ≥23, n=5) is descriptive
  only; the next run should keep it descriptive until n grows.

## Gate
Landing gate `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-playtest2` on the worktree tip: 283 passed,
7 failed in 366s — STANDING PROFILE, ZERO NEW FAILURES. The 7 are the
documented standing failures (godpath/test-measurement-proof-update,
test-measurement-workflow, test-mobile-combat-cadence, test-occupation-panels,
test-phone-frame-proof, test-capable-bot-20261014,
test-establishment-r20-fixes-20261020), a strict subset of the documented
8-failure profile (the sibling winnability-0130 gate failed the same 7 plus
test-measurement-cache-flags, which passed here). Proof test re-run on the
rebased tip 76b2fddf9 (rebased from base 987766c0c onto master d4fe9708b):
ALL PROOF CHECKS PASS. The rebase moved only the base — no driver, analyzer,
or proof file changed. Merged locally, pending ship. Rotation-b 6→7. Lock
deleted.
