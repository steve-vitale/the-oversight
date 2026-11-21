# Journey — Crisis r262

**Run:** `playtest-loop-2-20261121T1555Z`, scheduled 10:00 CST Nov 21, 2026.
**Seeds:** 14591–14595. **Base:** master `237ad3c53` at prereg.
**Adoption:** the run timed out at gate closeout; closed out by adoption
(rebase + fresh gate + merge), see Gate and Base movement below.

**Lock discrepancy (recorded, not papered over):** the timeout handoff
claimed the lock run_id was `playtest-20261121T1000Z`, but the lock FILE
reads `playtest-loop-2-20261121T1555Z` (created 15:55:17Z), and the frozen
prereg (committed `1b34e15c7`, written at run start) records the run's own
lock as created 15:55:17Z with run_id `playtest-loop-2-20261121T1555Z`.
Two sources agree on T1555Z; only the known-unreliable handoff says
T1000Z. The closeout deletes the lock only if the file matches T1555Z,
read in the same call as the delete (per-line `grep -qx`).

## Leg question (prereg)

Do r253/r257/r261's verdicts hold on the new base, do the new live
landings read honestly (downedtwice once-per-fall, M12 circles cap,
raise-opener variety), do this run's three fixes hold in the wild, and
does the PARTYSIZE4 substrate still reach the crisis band?

**Short answer:** downedtwice GO, M12 GO, fixes 2/3/4 hold, fix 1 does
NOT hold (stalls survive), PARTYSIZE4 reaches (trios 2 + a quad fired
on 14591), and C3b REGRESSES — the first false settlement on the 7th
wild panel.

## Panel numbers (main, seeds 14591–14595)

| Seed | End | Raids | Gorge nights | Sorties | Alive | Pantry (kcal) |
|------|-----|-------|--------------|---------|-------|---------------|
| 14591 | 150d horizon | 12 | 72 | 8 | 6 | 16,379 |
| 14592 | 150d horizon | 10 | 36 | 5 | 5 | 11,619 |
| 14593 | 81d GAME-OVER | 6 | 35 | 3 | 1 | 0 |
| 14594 | 150d horizon | 10 | 46 | 7 | 3 | 1,400 |
| 14595 | 150d horizon | 11 | 77 | 8 | 7 | 0 |

4/5 reached the 150-day horizon. 14593 died to hunger and thirst with
the cause named in the record (Caitlin starved d63, Jesse dehydrated
d67, Nicole dehydrated d79) — a fair death, C1 GO, not a wall.

- Attempts 31, ok 25, refused 6, cleared 8, deltaExact 25, deltaBad [].
- Gorge nights 266, gorge kcal 313,562, convos 40, fabricHits 0,
  sortie fights 50.
- D1: 31/31 snapshots delayed ≥3 days. D2 clear rate 8/25.
- D3 drift: sortie-clear 32, moved-on-valve 40, player-drawn-off 13,
  melts-line 1, unknown 0.
- R59 TRUE early count 0 (legacy 5 is the old corpse-counting artifact).
- R57: D2 early-resolution census [], D2 missing lingeringAtResolution 0,
  D3 death mismatches [].
- R70: phoenix burns 0 everywhere. R70 C2b: all 5 seeds judged on
  gorge+sorties → GO.
- R82 F1: no-longer entries all empty. R88 tick-part sampler 0
  instrument errors. R88 missed-window total 6, corrected 6
  (valve-expiry 5, drawn-off 1), per-day 4.
- R126 boundary-sortie cross-check: all ok=true.
- R122 gorge attribution: single 216, ambiguous 35, none 0,
  single-unbooked 15; name-matched after clear 74, id-matched 0,
  returned 0.
- R128 WRAP: 40/40 marked, 0 unmarked → GO (markers: "(conversation
  ended by the engine)" 39, "(driver cap break:" 1 — the cap break is
  14595 d61, 16 turns).
- R181 BENCH: refused 6, all gateOneShort (musterAvailable 1);
  NODEAWAY total 7, worst 2 (14592 d146) — vs r261's 20/worst-6, much
  lower. Re-musters after refusal happened; 0 full clears after refusal.
- R181 muster-size: okSorties 25, brokeAfterFight1 9, cleared 16,
  multiMonsterCleared 13/19; fight-1 vTaken on a clear max 43 (spool,
  14591 d122) — the Q4 live-play trigger (cleared fight-1 vTaken ≥70)
  did NOT fire.
- R181 SUPPLY: ruinSearches 0, medAcquisitions 0, pharmacy 0
  everywhere (cumulative 2/321 stands).
- R181 medic-duty: blocked 71/71/16/138/118; cures by ability
  30/14/5/12/22 = 83, by medicine 0.
- R182 STRANGER: 0 alien kills on all seeds → VACUOUS (prereg: 0 kills
  on a pilot is a finding about the channel's rate, not a pass).
- R182 RUINROAD: armRan false.
- R186 ELIGIBILITY: encounterEligibleDays 0 on all seeds; apEligible
  143–145; firstWave2 d8–10; firstSystemArrived d8–9;
  readinessDaysReady 0–5, maxScore 80–125.
- R192 DRY CENSUS: dryLines 1 (14595 d61 sheltered, pick
  `alive:want:seek_taken`), deflectQ 0 → deflect_q GO.
- R262 C3b-TRANSCRIPT: settledLines 13, negation 6, vote 3, closer 2,
  true 2 → **NO-GO** (adjudicated below).
- R261 LINK-ACCEPT: 2 accepts, 0 parrots → GO.
- R261 DODGE-ARTICLE: dodgeLines 12, thrashLines 0, doubled 0 → GO.
- R238 DEATHCLEANUP: deadHolderEntries 0, unseeded 0,
  ignitionAfterDeath 0 → GO; deathCleanups 11.
- R240 TITAN-OUTCOME: outcomes 47, refused 44, gateRefusalLines 10,
  gateRepeatLines 0, linkRefusalLines 0, slain-field 3 (14591 d138
  James, 14592 d106 Elijah, 14594 d120 Uchenna); all gate lines say
  "you have 0" (strict per-line count check still wants muster
  composition persisted — future driver item).
- R240 HOMEBODY: 45 picks, 0 qualifying → vacuous.
- R240 NOTICKDEFER: 0 deferred → vacuous.
- R240 POCKET: 583 no-path lines (14591: 329, 14595: 243) — travel-noise
  baseline, no bar.
- R262 FIGHT-STALL: 6 stall-days → **NO-GO** (bar 0).
- R262 DOWNEDTWICE: goesDownLines 0 → GO (vacuous — the line never
  fired panel-wide).
- R262 M12: circlesLines 9 across 9 sittings, 0 same-reason repeats
  → GO.
- C7b: buried dead — 14592 [Oualid, Lena], 14593 [Nicole], 14594
  [Ernesto Dixon]; corpse-cause counts famine 0/0/1/1/2, disease 0,
  wound 0/2/0/1/0, thirst 0/1/2/0/1 (feed-vs-corpse: feed 0
  everywhere — standing instrument shape).
- R58 refused-sortie book check: all retOk false (same instrument
  shape as main, carried from r261).

## The three fixes in the wild

**Fix 1 (unreachable-flee) — DOES NOT HOLD.** The flee never even
attempts. `fled_unreachable` occurs 0 times in all 5 per-seed JSONs;
'unreachable' 0 times in sayLines. The fix exists in
`scripts/policies/oracleV2.js:374` (`if (ctx._closeStuck >= 3) return
flee('unreachable');`) and `oracleV2.fight` calls `v2Fight`, which the
driver wires as the fight hook — so the stall fights DO run through the
fixed code. The proof test passes 9/9 in its staged fixture. The wild
panel defeats the counter a different way; see FIGHT-STALL below.

**Fix 2 (deflect-promise) — HOLDS.** 0 "won't ask twice / won't raise
it again / stop asking" decline lines across all 48 transcripts
(grep-verified). Regression watch CLEAN.

**Fix 3 (resume-quote-kind) — HOLDS.** 0 resume openers quoting a
snippet from a favor whose kind differs from the label. Resumes quote
dialogue lines (e.g. 14591 d20 quotes "Right — go on, I'm listening,
anyway."; 14594 d48 quotes "There's an ease between you now — the kind
that takes weeks to build.").

**Fix 4 (witness-line return) — LANDED, but GAME-side, not
driver-side as the prereg planned.** `src/js/betrayal.js` now returns
the witness line from `nameWitnesses` and the `betrayalTurn
'witnesses'` branch passes it to `finish()` instead of the fixed label
'Names, named.' (commit `0d42b6812` hunk verified). Transcripts
confirm: "No one saw Dmitri leave. Just trees." / "No one saw
Katarina leave. Just trees." / "No one saw Carlos leave. Just trees."
— 0 "Names, named." anywhere. The plan deviation is recorded here
honestly; the outcome is what the prereg wanted (the real line is
spoken), reached from the game side instead of the driver side.

**M12-cap fix proven in the wild:** 9 circles lines across 9 sittings,
0 same-reason repeats → M12 GO. The r260 Ines shape (3× same sitting)
does not recur; max 1 per sitting.

## FIGHT-STALL — NO-GO (6 stall-days)

Stall-days (≥10 "No path there." in a day): 14591 d100 (43), d125
(43), d141 (117), d151 (119); 14595 d81 (120), d149 (120).

"No path there." is emitted at `src/js/game.js:15073`
(`beginPathWalk`, travel) and `game.js:38165` (`tbPlayerMove`, fight —
the stall source; both are scholar-only).

Stall-day fight context (from sayLines): 14591 d100, fight with The
Strike (43 no-path; allies fight while the scholar cannot close);
14591 d141, THE SPOOL (117; "the spool's lens-eye", "REPLAY 1/3:
WAIT", "Too far — 3 squares left" then "No path there"); 14595 d81,
THE INFLUENCER (120; "The Influencer is flagging", "ring light
BRIGHTENS — a new follower crawls out"); 14595 d149, Influencer again
(120).

Per-turn pattern on the pure-stall days: "Too far — 3 squares left."
(from `game.js:38173`: a path exists but costs more than the 3
movement left) alternating with "No path there.", repeating all day.
Real strikes: 0 on 14591 d141 (117 no-path, 119 too-far, 0 strikes),
0 on 14595 d81 (120/116), 0 on 14595 d149 (120/116); 14591 d151
(119/120) has 3 "strike" lines that are Codex/eye flavor text, not
strikes.

Deduction: `_closeStuck` resets only on a new fight object, a strike,
an ability, or a successful move — with no strikes, abilities, or
moves on the pure-stall days, the only reset path is the fight-start
block (`if (ctx._fightObj !== f) { ctx._closeStuck = 0; ... }`);
therefore the fight object is re-created between turns in these fights
(spool replay cycles / influencer rounds), zeroing the counter before
it can reach 3. The flee never even attempts, so this is NOT the
prereg's "pocketed flee" case.

Next round's item: make the stuck counter survive fight-object churn
(key it to the monster/day, not the fight object), and log
fight-object identity per v2Fight call on a spool stall to confirm the
mechanism. Stall fights are field/encounter fights, not raid defenses
(`defendedFights` has no entries on the stall days). Note the d141
sortie still resolved (influencer vFlee, party took 88 damage) — the
stall-day bar counts failed closes, not unresolved fights.

## C3b — NO-GO (REGRESSION of the r240 fix)

TRUE hits are ONE event, 14594 d30 defender, Fiona Wen: favor
`heal_help`, state BROKEN, vid `gen_sflb1e3`.

- Opener: "You said you'd help with this wound. It's still open — but
  that promise is dead."
- Player picks [dlg:react] → "We're square." NPC: "Well." A breath.
  "That's where things stand."
- [dlg:cant] "Don't worry about it." → NPC: "Right. Forget it. They
  won't forget. Debts unpaid just sit there."
- Recap: "Still on that debt." / "Like I said — we're still on that
  debt."
- Closer: "Good — that debt, settled. Feels better said out loud."

PantryPer 14594 (from the per-seed JSON `pantryDaily`, 150 entries):
d28 2725.2, d29 2288.8, d30 2256.3, d31 2497.0, d32 7505.8
kcal/person — the village is well fed, so hunger is not the live
need; the favor's need is the open wound, which the NPC states is
still open.

The bar (prereg C3b): a broken favor whose need is still live is never
called done/square/settled — the closer calls the debt settled,
contradicting the NPC's own mid-sitting line and the favor's broken
state. The player's "We're square." is a design question, not a false
claim by the game (prereg metric review 21); the false claim is the
game's closer line. This is the first false settlement on the 7th wild
panel — a REGRESSION of the r240 fix.

The other two closers are benign (they settle conversation topics, not
favors): 14591 d40 "Good — what's been happening, settled" and 14594
d48 "Good — what they confided, settled."

Fix item for the next round: the settled-closer must not fire on a
sitting whose favor is broken with the need still live (gate the closer
on favor state).

## People check — GO

All 48 transcripts read in full (8 orphans included); fabricHits 0.
48 files on disk vs 40 in the analyzer's convosDriven; the 8 orphans
(14591 d53, d71 [103 bytes — the driver-cap-break file, "(conversation
refused/ended)"]; 14592 d46, d47; 14593 d43-sheltered, d53, d59, d60)
were read by hand and are coherent.

What reads well:

- Callbacks work (shock→14594 d55, singing in the creek→14595 d49,
  walks→14595 d24, "You said..."→14591 d21/d55).
- Secrets hold under doubt-pressing (Lena 14592 d14 refuses to
  re-confess: "That again? I confessed that already. I'm not
  confessing it twice for dramatic effect.").
- Favors have real arcs (forage promise 14592 d21 → broken by d28/d37,
  "We missed the promise."; wound promised 14593 d21 → still open d22
  → handled/moot by d53; water haul with real numbers "Do the math
  with me: 0 liters, 7 people.").
- Betrayal cases run full arcs (14593 d9–d10 Dmitri: site → witnesses
  → investigate → moot → expose; 14594 d12 Katarina with VOTE: GUILTY
  "Counted."; 14595 d13–d14 Carlos).
- The mime conversation works (14593 d30, Nicole, Spanish-only,
  nod/smile exchanges, "You good?" — the one English they know).
- Party naming + roles work ("The Company" 14591 d20, "APEX SNACKS"
  14592 d28, "The Kept Promise" 14593 d43, "MEAT AND FRIENDS" 14595
  d61; Carlos made Scout d61).

Observations to name (not verdicts):

1. Closing-line duplication — "This was good." in 21/48 files, "Good
   talk. I feel like I know you a little better now." in 13/48,
   verbatim across sittings (deepening r248 graduated defect, owned by
   the conversation build arm, watched only).
2. favor_requirements lines read as mechanics instructions, repeated up
   to 5× in one sitting when the driver re-picks the blocked choice
   (14593 d31: 5× Haven-door lines; 14592 d28/d37: 3× "You carry 0
   kcal..." each; 14591 d69: door line for the food-share favor).
3. The d30 C3b closer (above).
4. Plant-teaching lines formulaic (same sentence, plant name swapped,
   4 in a row on 14593 d31/d43).
5. Two betrayal cases against the same victim in one sitting (14595
   d13: case_4 + case_6, identical witness text).
6. The 1 dry line (14595 d61, pick `alive:want:seek_taken`, NPC
   "...Sorry, lost my train of thought." — on a non-binding surface →
   next fix item).
7. "Solitude isn't loneliness" near-repeat in 14593 d53.
8. 14594 d48 opener "You're wearing Carol's shoes now — want to pick
   it up?" — odd but interpretable.
9. No witness line served in the crisis transcripts (REL-WIT stays
   insufficient-data on this leg; the staged sitting was on the
   succession leg).
10. Double confession 0; no "Nothing important" recap with live
    business seen.

MARCH-REFUSAL / ANTLER "The The" / TRAIL 3-PRESS: no dedicated
analyzer section for march-refusal or trail 3-press on this leg; no
violations seen in the 48 transcripts. The Commercial Break was never
announced (0 occurrences in the analysis), so march-refusal is vacuous
on this panel. The antler-thrash surface IS covered by DODGE-ARTICLE
(thrashLines 0, doubledArticleHits 0).

## PS4 side-arm (seeds 14591–14593, VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1)

| Seed | End | Raids | Gorge | Sorties | Alive | Pantry |
|------|-----|-------|-------|---------|-------|--------|
| 14591 | 150d horizon | 11 | 85 | 9 | 8 | 0 |
| 14592 | 150d horizon | 9 | 52 | 6 | 3 | 800 |
| 14593 | 146d GAME-OVER | 11 | 73 | 19 | 0 | 0 |

Attempts 34, ok 14, refused 20, cleared 3. D2 clear 3/14. D3:
sortie-clear 19, moved-on-valve 35, player-drawn-off 5, unknown 0.
R57 D3 death mismatches: 1 (14591 d115 Abdulrahman — explained,
muster/Dina class, closed: died in a sortie at the treeline, Codex +
fight lines name him). R59 TRUE early 0 (legacy 3). R70 burns 0.
R88 missed-window 7 (all valve-expiry), per-day 4. R122 name-matched
36, id-matched 0. R181 BENCH: refused 20 (15 gateOneShort alive + 5
supplyEmpty dead-village), nodeAway 37 (worst 6, 14591 d114).
Re-musters after refusal happened (14591 d115, d152; 14592 d108,
d140), 0 full clears after refusal. Muster-size: okSorties 14,
cleared 11, brokeAfterFight1 3; fight-1 vTaken cleared max 26.
Medic-duty blocked 96/111/21; cures ability 26/16/11, medicine 0.
STRANGER 0 kills VACUOUS; RUINROAD armRan false; ELIGIBILITY
encounterEligible 0. DRY 0. C3b 0 settled lines. LINK-ACCEPT 0/0.
DODGE-ARTICLE 7 dodge, 0 doubled → GO. DEATHCLEANUP:
deadHolderEntries 1 (14593 Mia) — a dead-holder winPlan entry
lingering at census on the PS4 arm (main panel: 0). partyTrios 2,
partyQuads 1 on 14591 — trios AND a quad fired on the PS4 arm (r261:
trios all 3, quads 1); the PARTYSIZE4 substrate reaches the crisis
band. TITAN: gateRepeatLines 0, slain-field 3 (August d137, Sanne
d141, Yesset d114). HOMEBODY 233 picks, 3 qualifying holder, 4 holder
voice lines, 0 unvoiced. NOTICKDEFER 1 deferred (14591 d149), 0
leaks. FIGHT-STALL: 5 stall-days — NO-GO (14591 d131 10; 14592 d108
29, d109 16; 14593 d62 119, d66 238). DOWNEDTWICE 0 → GO (vacuous).
M12 0 circles lines → GO (vacuous).

**PS4 WRAP is an instrument artifact, not a game verdict:** it reports
transcripts 24, marked 0, unmarked 24 — but `ps4/` contains no r262
transcripts (34 files total: 3 r261 JSONs, 24 r261 transcripts, 3 r261
`.err`, 3 r262 JSONs, 1 analysis file; verified by `ls | wc -l` = 34,
`grep r262-seed` empty). The 24 expected r262 transcript files were
never written there; the analyzer lists them as unmarked because they
are absent. JSON-based PS4 verdicts stand; transcript-dependent PS4
reads (WRAP, LINK-ACCEPT) are not judged. Dir-hygiene item: `ps4/`
should be cleaned between runs (r261 leftovers).

## Telemetry

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/crisis.json --current
'.../journey-crisis-r262-delayed-seed*.json' --metrics defendedFights`
— **quiet** (6 files, 1 metric, no large deviations). Baseline
`defendedFights` 95; panel total 109 (15+29+15+27+23) — inside the
historical range. Baseline NOT rolled on a single panel's variance.
Per the prereg's adopted metric review, only `defendedFights` is
compared (`playerFights` / `latelyDefenseCount` keys are absent from
the per-seed JSONs).

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-crisis-r262`
in the worktree, serially with the telemetry check — never two
check.js concurrently.

- First run: **336 passed, 8 failed** in 1520s.
- Full re-run (fresh cache, to name every failure): **338 passed, 6
  failed** in 1119s.
- **0 attributable.** Failure set across both runs, all standing:
  measurement-proof staleness pair
  (`test-measurement-proof-update.js`, `test-measurement-workflow.js`),
  phone-frame stale receipt (`test-phone-frame-proof.js`), deed-
  attainment 120s timeouts (`test-living-garden-deed-attainment.js`,
  `test-one-person-army-deed-attainment.js`), load timeouts
  (`test-occupation-panels.js`, `test-trust-observer-neutrality.js`,
  `test-capable-bot-20261014.js`). Membership fluctuates between runs
  (8 vs 6) — the load-timeout signature, not a src break. None is an
  assertion failure in a test exercising this run's changed files
  (`betrayal.js`, `conversation.js`, `convo-wants.js`, oracleV2
  policy). Proof re-sign round 22 stays owed (the staleness pair);
  phone receipt staleness is from master-side `index.html` changes —
  this branch never touched `index.html`.
- Proof tests on this tip: **36/36 GREEN** (9/9 unreachable-flee,
  11/11 deflect-promise, 7/7 resume-quote-kind, 9/9 witness-line).
  Re-run on the rebased tip before merge (see Base movement).

## Verdicts

| Bar | Verdict |
|-----|---------|
| DRY deflect_q | GO (1 dry line, non-binding surface; deflectQ 0) |
| C1 (game-over cause named) | GO |
| C2 | GO |
| C2b (linger-conditional) | GO |
| C3 | GO |
| C3b (false settlement) | **NO-GO — regression of the r240 fix** |
| C3c | CLOSED, holds |
| C3d | GO |
| WRAP (unmarked endings) | GO (40/40 marked) |
| C7b (buried dead) | GO (say-line record; corpse list shape carried) |
| TITAN-REFUSAL | GO (0 repeats) |
| MARCH-REFUSAL | Vacuous (Commercial Break never announced) |
| ANTLER "The The" | GO (0 doubled, 0 thrash) |
| DODGE-ARTICLE | GO |
| TRAIL 3-PRESS | No violations seen (no dedicated analyzer section) |
| FIGHT-STALL | **NO-GO (6 stall-days)** |
| DOWNEDTWICE | GO (vacuous) |
| M12 (circles cap) | GO |
| ENV-GATE | GO (no LEND/GUNRATE/CELLGATE/BOWKNOW/'new trail'/reseed/planReseeds/PROFILEGATE4 line) |
| LINK-ACCEPT | GO (2 accepts, 0 parrots) |
| DEATHCLEANUP | GO (main panel) |
| STRANGER | VACUOUS (0 alien kills) |
| HOMEBODY / NOTICKDEFER | Vacuous (0 qualifying / 0 deferred) |
| People check | GO |
| Telemetry | Quiet |
| Gate | 336/8 then 338/6 on re-run, 0 attributable |

## Metric review (§14)

1. **Wren-note "5x+" bar miscalibrated** (r257, carried).
2. **C3b instrument searches wrong corpus** (r257, carried) — the
   C3b-TRANSCRIPT section reads transcripts; the TRUE hits needed
   run-note adjudication with pantryPer from the per-seed JSONs.
3. **Link-accept ECHO is instrument gap** (r257, carried).
4. **Telemetry units still open:** `playerFights` and
   `latelyDefenseCount` keys are absent from the per-seed JSONs, so
   the telemetry verdict rests on `defendedFights` only (quiet this
   panel). The keys need adding to the driver census or dropping from
   the metric list (r261 review 5, carried).
5. **Census corpses omit scholar deaths:** the C7b corpse list and the
   deathCleanup firstDeathDay disagree with the say-line death record
   on buried dead (r257 review noted the same). The run note's
   buried-dead names come from the say-line record, not the corpse
   list (r261 review 6, carried).
6. **NEW — PS4 arm wrote no transcripts:** transcript-dependent PS4
   sections (WRAP, DRY, C3b, LINK-ACCEPT) are vacuous artifacts. The
   driver must verify transcript writing on the PS4 arm before those
   sections are judged again.
7. **NEW — FIGHT-STALL's bar counts failed closes, not unresolved
   fights:** d141's sortie resolved (influencer vFlee) while the
   scholar spent the day unable to close. The bar is a stall bar, not
   a resolution bar.
8. **NEW — R58 refused-sortie book check:** all retOk false, same
   instrument shape as main, carried from r261 (the book check reads
   a field the driver never populates).
9. **NEW — the d30 C3b closer:** the settled-closer fires on a broken
   favor with a live need — the closer needs a favor-state gate. The
   player's "We're square." pick is a design question (prereg metric
   review 21), not a false claim by the game.
10. **NEW — MARCH-REFUSAL and TRAIL 3-PRESS have no dedicated
    analyzer section** on this leg — judged by the people check only.
11. **NEW — the unreachable-flee proof passes in the staged fixture
    (same fight object) but the wild panel shows the counter is
    defeated by fight-object churn** — the proof fixture needs a
    churn case (re-created fight object between turns) to catch this
    class.

## Village assessment in plain words

Five villages went into a hard winter and four came out the other side.
14591 held (6 alive, pantry 16,379); 14592 held (5 alive, 11,619);
14594 survived thin (3 alive, 1,400); 14595 survived crowded (7
alive) but on empty shelves (pantry 0). 14593 starved and thirsted out
by day 81 with the cause named in the record — a hard death, not a
mystery.

The people read like people: promises are made and broken and
remembered, secrets hold when pressed, betrayals get investigated and
voted on, parties get named ("The Company", "APEX SNACKS", "The Kept
Promise", "MEAT AND FRIENDS"). The two things that don't read right
are the two NO-GOs: a whole day of "No path there" while a monster
stands across the field is not a fight, it's a wait — and a wound
promise that is still open must not be called settled out loud.

This leg doesn't reach the seat (crisis leg, no table road on this
panel). The binding wall carried from r261: the muster never grew and
the titan gate always answered "you have 0" — the launch decision on
the default panel. The PS4 arm on the same seeds seeded plans and
fielded trios and a quad, so the people can do it when the substrate
lets them.

## Reachable / fun / winnable

- **Reachable:** 4/5 villages reached the 150-day horizon; the one
  loss (14593) died to a named hunger/thirst cause. The crisis band is
  reachable.
- **Fun:** the conversation layer reads well (callbacks, secrets,
  betrayal arcs, mime, party naming). The fun-killer is the stall day:
  a day spent alternating "Too far — 3 squares left" and "No path
  there" with zero strikes is dead time, not drama.
- **Winnable:** not decided on this leg — no table road on this panel,
  and the launch wall (muster never grows, titan gate always "you have
  0") stands. The PS4 arm shows the substrate can reach the band;
  the default panel's launch decision is the wall.

## Base movement

- Prereg base: master `237ad3c53`.
- Master moved during the run; adoption rebases onto the current local
  master, re-runs the four proof tests on the rebased tip, then merges
  ff-only. No push, no version bump, no live verification — the ship
  loop owns that.
- Rotation-b: crisis is leg 6 → 7 (read immediately before writing).
- Lock: `playtest-loop-2.lock` deleted only if the file matches
  `playtest-loop-2-20261121T1555Z`, read in the same call as the
  delete (see the discrepancy note at the top).
