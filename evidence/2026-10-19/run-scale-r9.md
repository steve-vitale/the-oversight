# Journey SCALE R9 (2026-10-19) — the REFUSE road pilot

**Run id:** 2026-10-19T00:45Z (oversight-playtest-loop). Worktree: `journey-scale`.
**Base:** master (R9 worker; coordinator records exact base at merge).

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** Does the REFUSE road stage, play, and hold as a lived path
in days 80–140? A competent player courts a national beat and refuses the
scale itself — do the offer and refusal play aloud, does the refusal hold
permanently (no re-offer), do bilateral relationships survive, and does the
village survive/thrive as a free fire at regional?

**Context:** the scale ladder's six roads — LEAD (r1/r2/r8 measured),
COVENANT (r3), BELONG (r4), TRADE (r5), CONQUEST (r6/r7 measured + the
MERCY-trap fix 58179595e). This run (R9) verdicts the SIXTH road: REFUSE.
It has mechanics (`src/js/hierarchy.js` `refuseTheScale`, ~line 3417; the
offer on every national beat, ~line 2211) and a unit proof
(`scripts/test-national-shapes-20261010.js` section D) but NO journey
verdict — no full run, no census, no people check. This is the PILOT:
3 seeds, coordinator decides the full 8-seed run on the pilot.

**Binding metrics (a miss is NO-GO, never re-scored mid-run; metric doubts
go under "metric review"):**
- M1 staging — ≥2/8 seeds stage a national beat (pendingNational) inside
  game-day 140.
- M2 refuse mechanics — on every seed staging a national beat,
  answerNationalChoice('refuse') returns 'refused', scaleRefused=true with
  day+shape recorded, no second national offer afterward, scaleRank stays
  regional through run end.
- M3 bilateral survival — refusal does not break the beat's bilateral
  links (active at d140 or ended only by normal causes).
- M4 people — ≥8 transcripts sense-read (coordinator), 0 senseless flags.
- M5 survival — ≥4/8 seeds reach d100+ (death-aware).

**Interesting-finding bar:** the refuse beat's exact copy per shape (does
it name the shape refused?); a refused village's pantry economy (no polity
drains — verified); foreign polities climbing off-screen while Haven stays
regional; wave-4 arrival at regional post-refusal; any post-refusal scale
nagging; how the table reads to a refused village (arc4_deed_gate needs
national+ — verify no crash/softlock on a permanently refused run).

**Horizon:** DAYCAP=185 loop-days targeting ~140 game-days, death-aware
stop (+10d tail max). The leg window (80–140) is read in game-days.
**Seeds:** 9701–9708 (fresh; pilot 9701–9703). **Policy:** refusecourt
(competent + lead-identical courtship + refuse-on-national).

**Substrate checklist (§14b):**
1. Contact: the unit proof (section D) staged the lead beat and refused it
   — `stageNationalBeat` and `refuseTheScale` both fire. PASS.
2. Pool sizing: the offer needs 3 seasoned primary-of-Haven links; r1/r2
   showed the courtship can reach this. Conditional PASS (re-measured live).
3. Verb existence: `answerNationalChoice('refuse')` returns 'refused' in
   the unit proof; `_checkNational` skips a refused scale. PASS.
4. Horizon fit: lead beats staged ~d94+ in r8; the 80–140 leg window is the
   same bar the lead road met. Conditional PASS (re-measured live).

**Kill verdict taxonomy:** an M1/M2 miss is METRIC-BROKEN unless the autopsy
finds a mechanism (the substrate fired in the unit proof — a journey miss
points at the tip or the courtship, not the refuse mechanic), in which case
CONCEPT-DEAD for "the road stages in journey play."

## PILOT (3 seeds: 9701, 9702, 9703; DAYCAP=185; ~5.5 min wall)

All three completed, exit 0. Verdict: **interesting — full 8-seed run
justified.** The REFUSE road stages, plays, and holds.

| seed | staged (day) | answer | refuse (day/shape) | game-days | end | wave | scale end | re-offers | links post-refusal | pool end |
|------|--------------|--------|--------------------|-----------|-----|------|-----------|-----------|--------------------|----------|
| 9701 | d76 lead | refuse→'refused' | d77 lead | 155 | village-lost | 4 | regional | 0 | 3/3 active (trust 53–83) | 0 |
| 9702 | d76 lead | refuse→'refused' | d77 lead | 152 | village-lost | 3 | regional | 0 | 3/3 active (trust 92–100) | 0 |
| 9703 | d76 lead | refuse→'refused' | d77 lead | 172 | survived (6/7) | 3 | regional | 0 | 3/3 active (trust 82–92) | 0 |

**Against the binding metrics (pilot read, 3/3 seeds):**
- M1 staging: 3/3 staged a national beat inside d140 (all lead, d76) — on
  pace for ≥2/8.
- M2 refuse mechanics: 3/3 `answerNationalChoice('refuse')` → 'refused';
  scaleRefused=true with day+shape recorded; 0 second offers; scaleRank
  regional at run end on all three — on pace.
- M3 bilateral survival: 0/9 beat links broken post-refusal (all still
  active 75–96 days after the refusal) — on pace.
- M4 people: 12 transcripts captured
  (journey-scale-r9-transcript-<seed>-day{80,100,120,140}.txt), 0 verbatim
  repeats across all 12. Coordinator sense-read all 12 post-pilot
  (Ricardo's Taking thread, Nino's prickly comfort boundary, Daniyar's
  breathing exercise, Njeri's anger question + named grief, Michelle's
  wanderlust continuity, Nikolai's trade question, Lucas's trust
  politics, Meryem's Arabic-only arc) — 0 senseless flags.
- M5 survival: 3/3 reached d100+ (155/152/172, death-aware) — on pace.

**The interesting-finding bar:**
- Beat copy per shape: only the lead shape staged (the policy courts
  lead-shaped links). Staging appends the generic refuseLine: "Or REFUSE
  the scale itself — stay a free fire at regional, whatever that costs.
  The System will not offer twice." The two spoken refusal lines —
  "Noted. The offer is withdrawn — permanently. No court. No oath. No
  tithe. The audience is... divided. Half of them just subscribed." and
  "Haven refuses the scale. Every kcal stays in Haven's pantry..." — do
  NOT name the shape refused. The shape is recorded in
  state.scaleRefusedShape and named in the staging beat ("the first
  court"), but the refusal itself is shape-generic. Soft note, not a bug.
- Pantry economy: leaguePoolKcalEnd=0 on all three — no polity drains leak
  post-refusal. Subordinates that can't pay the bilateral tribute accrue
  arrears (the designed their_fields_pay mechanic), e.g. 9703's hyw287 at
  8088 with trust still 82. Tribute "comes in whole, never ×1.25" is the
  lived post-refusal term.
- Foreign polities climbing off-screen while Haven stays regional: yes on
  all three — 4-sub polity from a splinter village by d47 (9702), a
  village_2 polity growing 3→4 subs across the checkpoints (9703), and on
  9701 a polity whose primary is village_1 — Haven's own subordinate is
  itself primary of 3, the designed "hedging is politics."
- Wave-4 at regional: 9701 unlocked wave 4 at d60 (pre-refusal, while
  courting) and kept it post-refusal through d155; the refusal revokes
  nothing already earned, and the unit proof's "wave-5 stays locked at
  regional" holds by design.
- Post-refusal scale nagging: none. 0 re-offers ('national' marker count 1
  = the staging line only).
- The table read on a refused run: deedGateEnd = {ok:false, scale:false,
  rank:'regional'} on all three — no crash, no softlock, tableTele empty.
  "The table stays distant" reads honestly.

**Deaths:** 9701/9702 bled out d106–d155 (combat/monster kills, two contest
deaths, one starvation) — the refusal's advertised cost, "no league to
call when the late waves come," reads true in the census. The road's
honest price, not a bug. 9703 survived with 6/7 alive and pantry 5108.

**Blank / scope notes:**
1. (soft, design) The spoken refusal doesn't name the shape refused.
2. (scope) All three seeds refused the LEAD beat at d76–77 — the policy
   only courts lead-shape links, so refuse-on-belong/covenant/trade is
   unmeasured in journey play (unit-proofed only). A full 8-seed run
   verdicts refuse-on-lead; the other shapes stay a coordinator decision.
3. (instrument noise) scaleLog carries a 'national-off' entry at day 2 —
   the initial-state watch firing at seed start, not an event. Ignore.

## METRIC REVIEW

- None yet — the pilot is on pace on all five metrics; no revision proposed.
- The staging day (d76) lands BEFORE the leg window (80–140) but inside
  M1's "game-day 140" bar as written; keep as-is for the full run.

## Files

- This note: `evidence/2026-10-19/run-scale-r9.md`
- Harness: `scripts/journey-scale-r9-20261019.js` (r8 fork: SEEDS 9701–9708
  default, EVIDIR 2026-10-19, POLICY refusecourt, DAYCAP=185 env-overridable,
  + R9 instruments: nationalStagings/nationalAnswers wraps, refuseDay/
  refuseShape/refuseLinksAtRefusal, reOfferCount+reOfferLog (distinct
  post-refusal stagings, must stay empty), refuseBeatText, leaguePoolKcalEnd,
  deedGateEnd, linksDissolvedPostRefusal, tributeInEnd, foreign-polity
  snapshots at the d100/120/140 checkpoints, pantryEnd)
- Policy: `scripts/policies/refusecourt.js` (leadcourt-identical courtship;
  the pendingNational branch always answers 'refuse')
- Evidence: `evidence/2026-10-19/journey-scale-r9-refusecourt-{9701,9702,9703}.json`
- Transcripts: `evidence/2026-10-19/journey-scale-r9-transcript-<seed>-day{80,100,120,140}.txt` (12)
- Console: `evidence/2026-10-19/r9-pilot-console.log`
- Smoke test (DAYCAP=8, seed 9701) written the pilot JSON then overwritten
  by the pilot run — no stray files.

## EXPANSION (5 seeds: 9704–9708; DAYCAP=185; ~2.4 min wall, exit 0)

All five completed cleanly, no crashes, no contest softlocks (contestStuck 0
all), no death mislabels. Interesting-finding autopsy on 9708 (refuse-on-belong,
links broken by arrears — not by the refusal).

| seed | staged (day) | answer | refuse (day/shape) | game-days | end | wave | scale end | re-offers | links post-refusal | pool end |
|------|--------------|--------|--------------------|-----------|-----|------|-----------|-----------|--------------------|----------|
| 9704 | d76 lead | refuse→'refused' | d77 lead | 187 | survived (8/8) | 4 | regional | 0 | 3/3 active (trust 32–83) | 0 |
| 9705 | d76 lead | refuse→'refused' | d77 lead | 172 | survived (6/6) | 4 | regional | 0 | 3/3 active (trust 92–100) | 0 |
| 9706 | d76 lead | refuse→'refused' | d77 lead | 180 | survived (9/9) | 2 | regional | 0 | 3/3 active (trust 53–83) | 0 |
| 9707 | d76 lead | refuse→'refused' | d77 lead | 171 | survived (5/5) | 3 | regional | 0 | 3/3 active (trust 82–92) | 0 |
| 9708 | d91 belong | refuse→'refused' | d92 belong | 151 | village-lost | 3 | regional | 0 | 1/4 active (arrears-dissolve) | 0 |

**Against the binding metrics (FULL 8 seeds: 9701–9708):**
- M1 staging ≥2/8: 8/8 staged a national beat inside d140 (7 lead d76,
  1 belong d91) — PASS.
- M2 refuse mechanics: 8/8 `answerNationalChoice('refuse')` → 'refused';
  scaleRefused=true with day+shape recorded; 0 second offers on all eight;
  scaleRank regional at run end on all eight — PASS.
- M3 bilateral survival: 9701–9707: 0/21 beat links broken post-refusal
  (all active 75–110 days after refusal). 9708: 3 of 4 links dissolved —
  autopsy below; the refusal did NOT break them. PASS (verdict: normal
  causes, per the metric's own carve-out).
- M4 people: 32 transcripts captured (12 pilot + 20 expansion:
  journey-scale-r9-transcript-<seed>-day{80,100,120,140}.txt), 0 verbatim
  repeats on the pilot read; coordinator sense-reads all 32. PASS
  (captured; reading is the coordinator's lane — candidates flagged below).
- M5 survival ≥4/8 reach d100+: 8/8 (d151–d187, death-aware) — PASS.

**The interesting-finding bar (expansion):**
- Refuse-on-belong measured for the first time (9708, d92): the belong
  staging copy names three doors — SWEAR the oath (a gift seals it), SERVE
  at court (seven days of the speaker's life), or WALK — break the link and
  stay a free fire, refusing the scale with it (the offer does not return).
  The policy answered the final REFUSE (not WALK); the two spoken refusal
  lines are the same shape-generic ones as lead — they do not name the
  shape refused (pilot soft-note stands, now confirmed on two shapes).
- Pantry economy: leaguePoolKcalEnd=0 on all five — no polity drains leak
  post-refusal. Bilateral tribute keeps flowing post-refusal on the healthy
  villages (9704: 3×2250 kcal, 9706: 3×3000, 9707: ~6×1400–1688 from
  Emberhold/Stonebridge/Thornfield) — "comes in whole, never ×1.25" holds.
- Wave-4 at regional post-refusal: 9704 and 9705 both reached wave 4 and
  held it (9705 fought 4 wave-4 deed fights); nothing earned is revoked.
- Post-refusal scale nagging: none — 'national' marker count 1 on all
  five (the staging line only), reOfferLog empty, reOfferCount 0.
- The table on a refused run: deedGateEnd = {ok:false, scale:false,
  rank:'regional'} on all five, tableTele empty — no crash, no softlock,
  "the table stays distant" reads honestly.
- Foreign polities climbing off-screen: not captured in the expansion
  (traderDeepSnaps empty on all five; snapshots fire only at deed
  checkpoints with traderDeep involvement, and traderDeep was 0 on
  9705/9707/9708) — the finding still rests on the pilot seeds only
  (instrument gap, not a metric issue).

**9708 autopsy (linksDissolvedPostRefusal=3, village-lost):** the three
broken links are Haven's SUBORDINATES (village_1, village_2,
village_spl_19_80016), all with trust 0 and arrears 67,500–132,500; the
fourth (hqy831, village_0) stayed active through d141, paying tribute as
late as d131 and honoring demands at d127. Haven's pantry hit 0, the
village bled from 15 named villagers down to Petra alone, and demands at
d127–d141 were answered "refuse" — the designed their_fields_pay arrears
mechanic dissolved the links, exactly as on a lost run on any road. The
refusal did not touch them: no dissolve event follows the d92 refusal
(first missed demands land at d127, two months later). M3's normal-causes
carve-out applies. CORRECTION (coordinator, post-run): the dissolves DO
leave a trace — the break is said aloud by `breakLink` (player-facing)
and `link.history` carries `{day, kind:'broken', note:'Link broken
(<how>)'}`; the harness's finalSnap projection just omitted `history`.
See blank #1 — the instrument now projects day+cause.

**Deaths:** 9704 bled 11 villagers (d9–d185, mostly monster/combat, two
show deaths: "The Callback", "The Congregation") but survived whole at
8/8 — its end-roster is the most intact of the run. 9705 lost 15 (player
starved on d6, then recovered to 6/6 survivors, incl. a d137 "the night"
death). 9706 lost only 3 named villagers across 180 days — the gentlest
road of the eight seeds. 9707 lost 11 to combat attrition, stabilized at
5/5. 9708 collapsed d124–d148: 8 villager deaths in 24 days
(combat/monster/starvation/contest) on top of 7 earlier — the refusal's
advertised price ("no league to call when the late waves come") reads true.

**VILLAGE ASSESSMENT — the REFUSE road census in plain words:**

Across 8 seeds the refused village is a recognizable creature: it courts
three-plus seasoning links, reaches the national beat around d76 (once
d91), hears the offer, and says no — aloud, permanently. After that it
lives as a free fire at regional: bilateral tribute flows in whole,
subordinates that can't pay drift into arrears (and on lost runs, walk),
the pool takes nothing, the table stays distant, wave 4 arrives on two of
the eight without a league to call. The refusal is felt in the death roll
more than in the pantry.

- 9701 (village-lost, d155): bled out d100–d151 after the refusal — 17
  villager deaths, pantry 0. Daniyar (paramedic, trust 10, 53 plants)
  last alive, steady. The price of the road.
- 9702 (village-lost, d152): 12 deaths d116–d145 (monster/combat/contest),
  pantry 0. Nathan (HVAC tech, lonely, 43 plants) last. A splinter polity
  of 4 subs from Haven's own village by d47 — "hedging is politics."
- 9703 (survived 6/7, d172): the survivor's story — disease-heavy mid
  game (5 sickness deaths d59–d84), pantry 5108, links alive at trust
  82–92. Daniel the farmer (trust 90, 25 plants) the anchor; Julieta the
  barber knows 0 plants — the division of knowledge is real, not everyone
  is a forager.
- 9704 (survived 8/8, d187): the strongest refused village — pantry
  37,144, all three links active, wave 4 held, 29 contests weathered.
  Maureen the mortician (trust 91, 74 plants) leads in knowledge; Rosa the
  line cook (trust 1, 69 plants) knows plenty but trusts no one — the
  refusal didn't heal the social fractures, it just kept everyone fed.
- 9705 (survived 6/6, d172): recovered from a d6 player starvation;
  wave 4 with 4 deed fights; 6 alive incl. Vasyl (infantry soldier,
  trust 90) and Hannah (chef, trust 90). Pantry leaner at 5,618.
- 9706 (survived 9/9, d180): the quiet run — 3 villager deaths total,
  pantry 82,537, Autumn's infantry-led roster (trust 90 across the board)
  at wave 2. The refused road CAN be prosperous: with the panic out of
  the death roll, regional-without-league looks like a working village.
- 9707 (survived 5/5, d171): attrition war — 11 combat deaths, roster down
  to Luis (mason, trust 64), Benoit (baker, trust 86), Fatima (paramedic,
  trust 72). Pantry 38,691. Benoit at trust 86 is the de-facto anchor the
  census expects.
- 9708 (village-lost, d151): the belong refusal. Starvation at d14 and
  d138, dehydration at d9, the village never built a surplus — it refused
  Emberhold's court at d92 and then couldn't keep its own subordinates.
  Petra (glazier, scared, 46 plants) last alive. The refusal didn't kill
  Haven; the missing pantry did — the road demands a food engine, and this
  village never built one.

What they knew: knowledge is uneven per Steve's design — 9704's roster
carries 23–74 plants each, 9708's 2–46. moot counts 114–175 per seed;
experiment counts 3–9; the knowledge economy kept running on every seed
post-refusal. What was missing: on lost runs (9701/9702/9708) the village
died of attrition, not of any refused-road mechanic — there is no
"refused content" the run can point at and say a player couldn't reach;
the missing thing on every lost run is the same thing missing on lost
lead/covenant runs: survivors.

**REFUSE arcs in plain words:** the competent-player story the road tells.
Court for two months, earn three seasoned links, get summoned, and say
no — once, aloud, forever. The System withdraws the offer and half the
audience subscribes. Then the village walks it alone: tribute comes in
whole from neighbors who still owe it, the pantry is yours and only
yours, and when wave 4 comes there is no league to call — coalition or
death, and on 5 of 8 seeds it was coalition. The road has one real shape
in journey play (lead, 7/8) and now one measured variant (belong, 1/8:
the WALK door, an even sharper no — break the link with the refusal).
The road is reachable (every policy run staged it), it is fun (the
post-refusal pantry freedom reads in the tribute rows), and it is
winnable-adjacent: 5/8 villages survived the leg outright, and the 3 lost
runs died of ordinary attrition, never of a refusal-caused softlock.
REFUSE road verdict: GO — stages, plays, holds, survives.

**Blanks:**
1. (instrument — FIXED this run, harness) Link dissolves were reported
   as leaving "no event trace" — reclassified on evidence. The GAME
   records day+cause on the link itself: `breakLink` says the break aloud
   (`say`, player-facing — no silent action) and `_linkNote(link,
   'broken', 'Link broken (<how>)')` stamps `{day, kind:'broken',
   note}` into `link.history`. The gap was the harness: finalSnap's link
   projection omits `history`, and `linksDissolvedPostRefusal` projected
   ids only. Fix: the instrument now reads each broken link's history and
   emits `{id, day, cause}` (scripts/journey-scale-r9-20261019.js). Proof:
   seed-9708 re-run with the fixed instrument (EVIDIR override, scratch
   dir, run evidence untouched; game outcome identical to the run —
   d151 village-lost, RNG-neutral) yields the three dissolves as
   `{id, day:148, cause:'Link broken (succession)'}` — the neglect snap
   during the final collapse. No game-code change needed — the mechanic
   was already honest; the census just wasn't reading the ledger.
2. (scope — RESOLVED this run) Pilot blank #2: refuse-on-belong was
   unmeasured in journey play. Now measured (9708): fires, answers,
   holds — 0 re-offers, regional at end, no crash. The road verdict now
   covers refuse-on-lead AND refuse-on-belong.
3. (RESOLVED — worker misread, no fix needed) The expansion note claimed
   traderDeepSnaps/foreign-polity snapshots "fired on 0/5 expansion
   seeds." Re-checked against the JSONs: all five seeds carry 3
   traderDeepSnaps each (d100/120/140) and deedLog.foreignPolities shows
   foreign polities forming off-screen on every seed (9704: village_2 ×3;
   9705: village_1 ×3; 9706/9707: village_2 ×2; 9708: village_0 ×2). The
   "region climbs without you" finding is confirmed in the expansion, not
   pilot-only. The snapshot hook fires unconditionally at the d100/120/140
   checkpoints as written.
4. (soft, design — stands) The spoken refusal lines do not name the shape
   refused (lead or belong); the shape lives in the staging beat and in
   state.scaleRefusedShape only. Copy note, not a bug.
5. (sense-read — DONE by coordinator post-expansion): 9706-d100
   (honest walk-away from Autumn's ask_favor opener — want staged and
   stated, no truncation); 9708-d120 (Luis, seek_taken in the dying
   village — pod dreams, committed promise, human); 9708-d140 (Novita,
   Indonesian-only, fully non-verbal — the mime-walking invitation is
   coherent); 9704-d120 (Maureen the withdrawn mortician — temperament
   in the lines, human). 16/16 transcripts sense-read across the run
   (12 pilot + 4 expansion), 0 senseless flags.

## METRIC REVIEW (expansion)

- No metric revision proposed. M5's ≥4/8 bar was conservative — 8/8
  reached d100+; the refused road survives at least as well as the roads
  already measured (r1/r2 lead, r3 covenant, r5 trade). If the coordinator
  wants, the NEXT run may tighten M5 to ≥6/8 — not this run.
- The staging day (d76 lead ×7, d91 belong ×1) pre-dates the leg window
  80–140 on 7/8 seeds, as in the pilot — M1's bar as written is
  "inside game-day 140"; keep as-is. Not re-scored.
- M3's normal-causes carve-out did real work on 9708 — the autopsy is
  above; the metric held without revision.
- (instrument note — resolved) The blank-#1/#3 instrument notes are
  resolved post-run (see Blanks): the link-history projection is fixed in
  the harness, and the snapshot gap was a misread — no changes pending.

## Files

- This note: `evidence/2026-10-19/run-scale-r9.md`
- Harness: `scripts/journey-scale-r9-20261019.js`; policy:
  `scripts/policies/refusecourt.js`
- Evidence: `evidence/2026-10-19/journey-scale-r9-refusecourt-{9701..9708}.json`
- Transcripts: `evidence/2026-10-19/journey-scale-r9-transcript-<seed>-day{80,100,120,140}.txt` (32)
- Console logs: `evidence/2026-10-19/r9-pilot-console.log`,
  `evidence/2026-10-19/r9-expansion-console.log`
