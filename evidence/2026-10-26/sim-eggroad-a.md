# sim-eggroad-a — the egg road, driven in sims (2026-10-26)

Steve's order 2026-10-26: the Network → THE HOSTS chain IS the egg road's
prize. Pull levers and get it played in sims. Also: audit the rigidity of
the wave/transition rules, and analyze his proposal that only the player
character chooses the path for the village.

## PRE-REGISTRATION (binding, MEASUREMENT §14)

- **Substrate:** r53 endgame stack exactly — capable + deedhunt + vetcommit
  + armorydrive + vetguard + fullseat-diag — with ONE deliberate change:
  CAPABLE_GREEDY is OFF and a probe-local sit-gate replaces it: the bot
  NEVER sits until `pg.networkFallen` (the eggroad deferral). Greedy's
  defaults (sit by tier 4 / day 145) would kill the road before tier 3 +
  three titan kills can complete, so greedy is the wrong deferral here.
  The sit-gate is probe-local and reversible (proof test pins env-off =
  pure capable).
- **Titan drive:** r42's daily driver, adapted — omen stage ≥ 2 →
  war council → sound the call → commit Haven's own (up to 3) → march
  and fight when muster-ready → stand down on stall (20 days no growth
  below half the gate, or 45 days held unanswered). The Network joins
  the drive list once summoned (current node monster).
- **Seeds:** 88101–88108 (fresh endgame block; r53 used 88081–88087,
  r54 the 88091–88097 block — verified no 8810x use in repo evidence or
  scripts). Pilot 8 seeds, 180d, death-aware. No confirm spend before
  the pilot verdict.
- **PRIMARY (binding):** Network summoned on ≥ 1/8 seeds → GO (the road
  reaches its prize machinery). 0/8 → NO-GO, and the binding gate
  below IS the deliverable — never re-scored.
- **GUARD:** ≥ 5/8 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest death / withdrawal).
  Below that, the pilot is about the earlier road, not the Network.
- **Per-seed chain census (every seed):** seat (lesser/full/none +
  missing bars), announce day, overtime tier max, per-titan omen stage /
  called / ready / fought / slain, wave-4 opened?, wave-5 opened?,
  readiness bars at end, standing breakdown (war/bonds/bread),
  living veterans, coalition blades at march, network summoned?,
  nodes cleared, HOSTS offered?
- **Metric review:** the pilot measures the road, not the sit. If a
  seed reaches networkFallen, the sit + HOSTS offer is recorded
  (capable's own path-walking picks; the measurement is whether
  `final:hosts` was OFFERED, not which final the bot picks).

## THE CHAIN (code-verified, each link with its gate)

The road to the Network, in order. Note what the trigger does NOT
require: the Network trigger itself (`networkKeyReady`, overtime.js)
asks only overtime tier ≥ 3 AND herald + nielsen + finale slain. But
slaying the apocalypse titan requires its OMEN, and the omen requires
wave 5 + national — so wave 5 IS on the road, one link back.

- **L0 — a seat.** Lesser: w1≥4, w2≥4, w3≥3 faced blow-by-blow,
  contests ≥ 2, crises ≥ 2, scale ≥ regional, integration stage ≥ 2,
  sentimentTaught + feastSurgeUsed (tableSeat, table.js). Full:
  deedGateReady — waves 5/5/4/3/2, contests ≥ 3, crises ≥ 3, stage ≥ 2,
  food deeds (progression.js). DOC/CODE DIVERGENCE (see R7): the code's
  full seat does NOT require national scale, though TABLE.md says it
  does.
- **L1 — announcement.** Arc 4 + seat + day 90 (win-day floor):
  tableWaiting set (progression.js), tableAnnounced, the Haven seat
  becomes takable. Before day 90 the table does not exist (no spoilers).
- **L2 — overtime.** Announced + unseated + seat held: tier =
  floor(unseated days / 7), cap 6 (overtime.js). Tier 2 (14 days) opens
  the third titan's omens. Tier 3 (21 days) + three titans slain
  summons the Network (automatic, in overtimeTick). While waiting:
  wave-4/5 fights become RERUNS (+25% HP, +12% damage per tier, +pack),
  raids come sooner, the seat price drops (−4/tier, −3 per Haven loss,
  cap −40). A lost seat PAUSES the clock (tier never falls, never
  resets).
- **L3 — titan omens (the hidden gate).** Omens are chance + scale
  gated in titanDawnTick (titans.js): herald omen only if wave ≥ 4 AND
  scale ≥ regional, 10%/day; apocalypse omen only if wave ≥ 5 AND
  scale ≥ national/global, 8%/day; third-titan omen only at overtime
  tier ≥ 2, 25%/day. Omen advance: stage 0→1 needs ≥ 4 days + 35%/day;
  stage 1→2 (located, placed on the map) needs ≥ 9 days + 40%/day.
  Expected time from eligibility to located: herald ~10 + ~7 + ~11 ≈
  28 days; apocalypse ~12 + ~7 + ~11 ≈ 30 days; third ~4 + ~7 + ~11 ≈
  22 days after tier 2. These are EXPECTATIONS over dice, not timers.
- **L4 — titan musters.** Cast: herald always + apocalypse (nielsen
  if showmanship ≥ 20, else finale). Muster gates (titanMusterReady):
  herald 10, nielsen 12, finale 20 allied blades; finale is a 3-node
  campaign, the others single fights. Allies answer the call from
  LINKS (Haven's own commitment caps at 3 — "the coalition is still
  mostly the many"). Muster upkeep is 1000 kcal/blade/day (allies +
  Haven's committed); a shortfall erodes trust −2 per allied village
  (titanMusterUpkeep). The driver stands down on stall. A lost titan
  fight does not end the road (re-muster allowed for herald/nielsen;
  the finale's heart allows re-muster at trust cost — the Network's
  heart does NOT: below its floor the key is lost).
- **L5 — wave doors on the way.** Wave 4: standing ≥ 100 AND readiness
  {3 armored @P≥10, 5 armed, 3 tricks, 1 veteran (wave-3+ kill)}.
  Wave 5: standing ≥ 200 AND wave-4 faced AND readiness {4 @P≥15,
  6 armed, 3 tricks, 2 veterans (wave-4+ kills)} AND bread counts at
  most 100 toward the 200 (standing.js). While any bar is short, the
  gated total HOLDS at t4−1/t5−1 and the hold beat names the short
  bars aloud (never silent). Standing sources: war +25 per wave-3+
  ledger kill point, bonds +34 per seasoned regional+ link, bread +20
  per major feast (quality ≥ 1).
- **L6 — the Network march.** 9 nodes in order (4 masts, 4 limbs,
  heart), one coalition, 20 blades to start, upkeep 1000
  kcal/blade/day, dead stay dead, camp between nodes (+50%/+25%),
  no new blades once the march begins, ≥ 5 survivors to face a node,
  ≥ 10 for the heart. A loss below the floor ends it: the key is
  lost for the run. Sitting ends the run (the table resolves to a
  win), so the march must finish before sitting — the summon text
  says it plainly ("Sit at the Table and the march is over").
- **L7 — sit + HOSTS.** With `pg.networkFallen`, every path's finals
  gain `final:hosts` (table.js). The path's own challenge and fail
  rules still run first — HOSTS is still losable.

## RIGIDITY AUDIT (each rule judged: what it buys vs what it blocks)

- **R1 — Omen chance + scale gates (L3): UNNECESSARY RIGIDITY, the
  prime suspect.** The Network trigger needs no wave-5 check, but the
  apocalypse omen smuggles one in: wave 5 + national, at 8%/day, then
  two more dice-gated advances. Three stacked dice rolls (≈30 expected
  days, unbounded tail) gate a link the design never names as a gate.
  The fiction (titans are noticed, not scheduled) is served by the
  stage-advance dice alone; the ADDITIONAL scale + wave gates on the
  omen's FIRST appearance buy nothing the wave doors don't already
  buy — a village that reached wave 5 + national has already proven
  itself. The third titan's 25%/day at tier ≥ 2 is the same shape:
  the tier-2 requirement is the gate; the daily die is pure tail
  risk. Recommendation: omen appearance should follow the wave/scale
  doors deterministically (or at worst one roll), not three.
- **R2 — Standing thresholds t4=100/t5=200: TUNABLE NUMBERS, keep the
  shape.** standing.js says so itself: "sim starting points per the
  2026-10-13 spec, not canon; tune on measured evidence." The shape
  (war/bonds/bread, three sources, hybrid paths) is Steve's
  flexible-route call — it replaced a two-rung gate that 0/16 measured
  runs ever met. Keep the shape; the numbers are sims' business.
- **R3 — Readiness bars (L5): KEEP THE SHAPE, the veteran bar is the
  known binder.** Design call #4 (2026-10-16): standing opens the
  door, readiness decides entry; fleeing is not readiness. The 2026-10-18
  recalibration note records the veteran bar binding 98.5–100% of
  deferral days (median village maxes at 1 living wave-3 killer vs
  demand 2 for wave 4). Wave 5 demands 2 living wave-4 killers — strictly
  harder, on top of a kill chain sims have never completed (wave-4
  kills are the scarcest event in the game: endgame r46–r50 ran five
  straight runs at zero living veterans). The bar measures capability,
  which is the intent — but a bar whose top rung has never been
  reached in sims is a wall, not a bar. Watch the pilot's end-state
  bars before proposing a number change.
- **R4 — Overtime pacing (7 days/tier, cap 6): KEEP.** The 21-day
  clock to tier 3 is the eggroad's honest price (Steve: "waiting
  should have a cost"), and the RERUN scaling + seat-price decay make
  the wait bite. The tier never falling (pause, not reset, on a lost
  seat) is correctly forgiving — a lost seat delays the road, it does
  not end it.
- **R5 — Muster gates (10/12/20 allies from links): KEEP THE SHAPE.**
  "The coalition is still mostly the many" is the village-as-
  protagonist thesis in mechanics: titans are fought by a polity, not
  a hero. The numbers couple titan-slaying to the scale system, which
  is intent, not accident. The risk is compounding: links need
  seasoning (30+ days, trust 40+) AND the regional+ polity filter
  (R6) — a village can have bonds but no muster.
- **R6 — Regional+ polity filter on diplomacy standing: CANDIDATE
  UNNECESSARY RIGIDITY.** A seasoned bond with a splinter village
  scores 0 toward diplomacy standing (2026-10-14 design call, Steve
  can overrule). The filter keeps "3 links = 102" honest for the
  pure-diplomacy path — but for the eggroad it means courtship
  without a polity buys no titan muster and no standing. A village
  that did the social work but never formed a realm is locked out of
  both. The filter's benefit (preventing cheap standing) is already
  covered by the seasoning requirement (30+ days, trust 40+).
  Recommend: count seasoned links toward standing regardless of
  polity, or count them at a discount — the polity requirement can
  stay for the SCALE ladder without gating the STANDING ladder.
- **R7 — Full-seat scale: DOC/CODE DIVERGENCE, needs a ruling, not a
  lever.** TABLE.md says the full seat needs national/global scale.
  The code's deedGateReady() computes `scale` but does NOT include it
  in `ok` (comment: "Scale is NOT added here (open design question)",
  2026-10-13 standing call). So in code, the full seat is reachable
  without national. Either the doc is stale or the code dropped a
  rung it shouldn't have. For the eggroad this matters because the
  apocalypse OMEN (not the seat) is what actually requires national.
  Do not "fix" this silently — it changes what a full seat means.
- **R8 — Scale ladder day floors (regional 31–60, national 61–90,
  global 91+; one rung per season; Regional Dawn waits for a 21+ day
  bond): KEEP.** These are Steve's 2026-10-11 ladder, deed-backed,
  and the lesser seat needs only regional — reachable in the first
  season. The ladder is not what blocks the eggroad; the omen dice
  (R1) and the veteran bar (R3) are.
- **R9 — Network march rules (L6): KEEP — this is the difficulty,
  not rigidity.** 20 blades, dead stay dead, no reinforcements,
  floor 5/10: the march is MEANT to be nearly impossible (Steve's
  rarity target: well under 1% of strong runs). Removing any of it
  would make the prize cheap. The march has never been attempted in
  sims; judge it after a village reaches it, not before.
- **R10 — Lesser-seat food deeds (sentimentTaught + feastSurgeUsed):
  KNOWN FRICTION, already measured.** The feast-surge deed is
  forfeited under driveoff-clean (1146Z: 31 forfeitures, price silent
  on all 8 surfaces). The deed is load-bearing for the lesser seat
  and its price is unvoiced — a Steve-call candidate (voice it at the
  draw or make it spendable in-window), already queued. It is not
  eggroad-specific, but it gates L0 for every road.

## PLAYER-ONLY PATH CHOICE (Steve's 2026-10-26 proposal) — analysis

Proposal: only the player character chooses the path for the village.

- **What it preserves:** everything that currently works. In code
  today, ONLY the player sits (tableTakeSeat/tableScene are player
  actions; no code path lets a villager sit). NPC ascension's live
  effects — +10 path strength per ascended villager (cap 100,
  tableEarnedPaths) and the architect/outshone/pantheon epilogue
  beats — all function with player-only sitting. Facilitation
  (teach / hand the relay / shield) keeps its payoff. The "honestly
  outshone" ending (a villager outscores the Bearer in the epilogue)
  survives unchanged: it is about credit, not about who sat.
- **What it kills:** only a FUTURE system — NPC-taken seats
  (decision-pack item 495; DECISIONS #448: NPC seats complicate the
  long-survival challenge and the egg boss). If an NPC could sit
  before the player finishes the Network march, the egg road would
  need rules for who holds the key, whether the march survives a
  sitting, and whose ending HOSTS attaches to. Player-only choice
  removes that entire branch from verification: the road has exactly
  one decision-maker, and the march's "sitting ends the march" rule
  has exactly one actor.
- **What it does NOT simplify:** the road to the Network itself.
  Omen dice (R1), the veteran bar (R3), muster assembly (R5), and
  the march (R9) are untouched by who chooses the path. Player-only
  choice makes the END of the road verifiable; it does not make the
  road shorter. Do not sell it as a reachability fix — it is a
  verification-scope fix.
- **Recommendation (proposal, NOT implemented):** adopt it. It
  ratifies current mechanics, costs nothing built, and deletes the
  #448 complication class from the egg road. The cost is real but
  bounded: the game gives up NPC-sits-an-ending as a future story
  shape (the outshone epilogue keeps the feeling without the
  mechanics).

## PILOT RESULTS (8 seeds, 180d, complete)

- **PRIMARY: NO-GO.** Network summoned 0/8. Network fallen 0/8. HOSTS
  offered 0/8. The road does not reach its prize on this substrate.
- **GUARD: MET.** Window reached 5/8 (announce days 90, 90, 123, 90,
  90). The 3 misses: 88103 (wave 1, village scale, died out), 88104
  (wave 4 + regional but no seat — see below), 88108 (wave 2, village
  scale, no food deeds, died out).
- **Seats:** lesser 5/8, full 0/8. Every seated village reached wave 4
  with 4–6 distinct wave-4 types faced, 9–17 contests, 3–4 crises,
  stage 3, food deeds true. Full seat fails everywhere on wave 5
  (w5 = 0 on all 8) — the deed gate's 5/5/4/3/2 bar stops at 5/5/4/3/0.
- **Overtime:** tier ≥ 3 on 4/8 (tiers 6, 6, 6, 5 on the seated seeds
  that survived the wait; 88106 died at tier 2). The sit-gate held:
  16–66 refused sits per seated seed, tableDone false everywhere.
  The seat SURVIVED tier 6 on 88101/88102/88105 (still lesser at
  end) — the −4/tier price decay did not withdraw these seats.
- **Waves:** wave 4 on 6/8, wave 5 on 0/8. The wave-5 readiness bar's
  VETERANS leg is short on ALL 8 seeds (0 living wave-4 killers),
  even where armor (7) and weapons (8) clear their bars. Armor and
  weapons bind on 4/8 additionally, but veterans binds everywhere.
  Living killers of ANY wave exist (1–8 per seed) — the gap is
  specifically wave-4+ kills, i.e. the kill-conversion wall the
  endgame lane has measured all month (wave-4 fights end in
  talk-downs, flights, retreats — never kills).
- **Standing:** diplomacy 0 on 7/8 (only 88102 has seasoned links:
  3 links, 102 diplomacy, global scale). War 25–100, bread 0–100
  (capped). Standing is NOT the binding gate on this pilot — 88107
  reached standing 200 with diplomacy 0 (war 100 + bread 100).
- **Titan omens:** herald stage 2 on 6/8 (all six that reached wave 4
  + regional); nielsen (third titan, via overtime tier 2) stage 2 on
  4/8; finale stage 0 on ALL 8 — the cast apocalypse's omen never
  fires, because it requires wave 5 + national and wave 5 never
  opens. This is the pilot's sharpest structural finding: the
  Network trigger's "three titans slain" leg is uncompletable on
  this substrate, because one of the three cannot even be NOTICED
  without wave 5.
- **Titan musters (called herald 6/8, nielsen 4/8):** max blades vs
  gate — herald 3, 0, 3, 2, 8, 4 (gate 10); nielsen 6, 1, 11, 2
  (gate 12). Two near-misses: 88105 nielsen 11/12, 88106 herald 8/10.
  Allies answer ONCE, at call time — the blade history is flat
  after the call, so a muster below the gate never grows into it.
  Stand-downs fired on 5 musters (20-day stall below half, or
  45-day hold); 3 musters were still standing when the village died.
  Haven's own commitment is unreliable in practice: 0–1 blades at
  last snapshot on 5 of 8 musters despite 7–8 commit calls (no free
  volunteers, or committed blades dead/left).
- **Titan fights:** 3 started (88101 herald, 88102 herald, 88102
  nielsen), 0 slain. A muster CAN assemble enough to start a fight
  (at least transiently — blade histories show fights starting
  before the recorded stall), but no fight converts to a kill.
  Fight outcomes were not captured by the pilot probe (gap — see
  the call diagnostic below).
- **Non-window seeds:** 88104 is the interesting one — wave 4 +
  regional + herald stage 2 + a called muster (3 blades, stood down
  day 157), but NO seat and NO announcement: it never earned the
  lesser seat (seatDetail at end shows the run survived to horizon
  without sitting). The seat bars (contests/crises/stage/food deeds
  at end) need a per-day read to say which bar held it — the
  end-state detail alone doesn't name it. Named as a follow-up, not
  a verdict.

### BINDING GATE (in order — each blocks the next)

1. **Wave-4+ kill conversion (veterans = 0 on 8/8).** Without a
   living wave-4 killer, wave 5 cannot open (readiness bar), and
   without wave 5, the finale's omen cannot fire. This is the root
   gate: everything downstream waits on it.
2. **The finale's omen gate (wave 5 + national).** Even with perfect
   musters, the cast apocalypse cannot be slain before wave 5
   opens, because its omen never appears. R1's dice add tail risk
   on top, but the gate itself is the wall here, not the dice.
3. **Muster assembly (gates 10/12 vs supply 0–11).** Herald and
   third-titan musters assemble at 0–11 blades and stall flat;
   near-misses (11/12, 8/10) show the gates sit just above what
   these villages' link networks supply. Haven's own 0–3 blades
   do not close the gap.
4. **Titan fight conversion (3 fights, 0 kills).** Unmeasured
   mechanism (outcomes not captured) — the call diagnostic below
   takes this up on fresh seeds.
5. **The Network march itself: UNMEASURED.** No seed reached it;
   its rules (R9) are unjudged by this pilot. Do not claim the
   march is too hard or too easy — no village has ever marched it.

### CALL DIAGNOSTIC (fresh seeds 88111–88112, complete)

Same substrate + say-capture for call/refusal lines + link snapshot
at each call + titan fight outcomes. It answers the pilot's open
mechanism questions. 88112 died day 65 (wave 3, village scale, no
titans, no seat) — pre-window death, no muster data. 88111 is the
whole story: lesser seat, tier 6, wave 4, regional, died day 172.

**THE HERALD FELL (day 98).** Call day 96, three active links, ALL
answered: village_0 trust 38 → 2 blades (base quota); village_1
trust 71 → 6 blades (trusted quota, trust ≥ 70 + opinion ≥ 10);
village_2 trust 35 → 2 blades. Total exactly 10 = the gate. Fight
day 98 with allies 10, Haven 0 — WON, herald slain. Haven's own
contributed NOTHING on either call ("No one is free to march").
**The pilot's 0/8 is not "titans can't be killed" — a herald CAN
fall on this substrate, with 3 links including one trusted.** The
formula is now known: herald needs 3 answering links with ≥ 1
trusted (2+6+2 = 10); with 0 trusted, 3 links give only 6.

**THE NIELSEN STARVED (call day 116, stood down day 136).** Same
three links, but trust had DECAYED between the calls: village_1
71 → 58 (trusted quota LOST — now base 2); village_2 35 → 24
(below the 25 refusal line — REFUSED, trust −8 more). Total 4
blades + 1 Haven blade = 5 < 12. Stood down day 136 (stalled
below half the gate). **Sequential musters get WEAKER: the first
muster's hunger erodes the trust the second muster needs.**
The herald's muster was fed 5,020/10,000 kcal day 97 and 560/10,000
day 98 — the village could not feed 10 blades × 1,000 kcal/day
while feeding itself in overtime. Upkeep shortfall costs trust
−2 per allied village per day, and that trust IS the next
muster's quota. A compounding loop: hungry muster → lost trust
→ smaller next muster → longer stand → more decay.

**THE FINALE NEVER APPEARED (again).** 88111's ready5 at end:
armor 1, weapons 1, tricks 24, veterans 0 — wave 5 never opened, so
the finale's omen (wave 5 + national) never fired. Same wall as
the pilot, on the seed that DID slay a titan.

**REPEATED REFUSED OUTCOMES (days 124–127, 152, 159) are engine
encounter attempts, not driver attempts:** the nielsen piece sits
on the map, and the village keeps meeting it unready — each
meeting records a refused outcome (have 4, need 12; later have 0
after the stand-down dissolved the muster). Do NOT read the ~25
refused rows as 25 driver tries; the driver tried once (day 116)
and stood down once (day 136).

**SENSE NOTES (transcripts read, not just counted).**
- The village talks its way out of everything: "Walk In: the fight
  ends" appears on 15 separate days (74, 81, 101, 110, 115, 144,
  150, 152, 155, 157, 159, 164, 166, 169, 170). The talk-down wall
  is visible in the transcript, not just the census.
- Day 150: the SHUTDOWN picket-line line repeats ~60 times in one
  day — a voice-repetition wart (same class as defnarr's 3,442×
  wait line). Flagged for the narration lane, not a verdict.
- The call lines themselves are voiced and legible: who answers,
  who refuses and why ("they do not trust this coalition with
  their people"), the hunger warnings ("Bellies remember who
  feeds them"). The muster system READS as people, not numbers.

**DIAGNOSTIC REFINES THE BINDING GATE (pilot §1–§4 stand, with
one correction):** gate 3 is now MECHANISM-NAMED — muster
assembly = link count × trust quota, and trust decays between
musters via hunger erosion. Gate 4 (fight conversion) is
PARTIALLY ANSWERED: a full-gate muster WINS (10/10 herald won);
the pilot's 3 fights with 0 kills were musters that never
reached their gates in the first place (or fought under-gated
via engine encounters — the refused rows). The remaining
unanswered piece: does a full-gate NIELSEN (12) or FINALE (20)
also win? No seed has assembled one.

## PROPOSALS FOR STEVE'S RULING (pilot-backed)

- **P1 (player-only path choice): RULED (Steve 2026-10-26).** Only
  the player character chooses the path for the village. This ratifies
  current mechanics (only the player sits in code today) and
  supersedes NPC seat competition (pack item 495) for path choice.
  Outshining SURVIVES the ruling: the village's story can still
  eclipse the player, and ascension-as-support stands. No longer a
  proposal — recorded here as the ruling it now is.
- **P2 (finale omen's national gate): RELAX TO REGIONAL, or drop the
  scale leg.** Pilot evidence: the cast apocalypse's omen never fired
  on 8/8 because it requires wave 5 + national, while the lesser
  seat that starts the overtime clock requires only regional. A
  regional village can wait to tier 6 and still never be NOTICED by
  the finale — the omen's scale leg is a second scale gate stacked
  on the seat's. The wave-5 leg stays (wave 5 is the real proof);
  the national leg duplicates the seat's own scale story. Game-code
  change (titans.js titanDawnTick), needs his yes + a pre-registered
  confirm sweep. NOTE: this alone does not open the road — wave 5
  itself still needs kill conversion (gate 1).
- **P3 (regional+ filter on diplomacy standing): NO CHANGE NEEDED
  FOR THE EGGROAD.** Pilot evidence downgrades this: muster assembly
  reads ALL active links (titanAlliedLinks has no seasoning filter),
  so the filter never blocked a muster — 88106 assembled 8/10 herald
  blades with diplomacy 0. And standing was not the binding gate
  (88107 reached 200 with diplomacy 0). The filter's standing effect
  is moot here; leave it for the scale lane, not the eggroad.
- **P4 (full-seat scale divergence R7): RULE FOR DOC/CODE HONESTY,
  not for the eggroad.** Pilot evidence: full seat 0/8 even on the
  global seed (88102) — because w5 = 0, not because of scale. The
  divergence did not bind this pilot. Still needs a ruling (does
  national belong in deedGateReady's `ok`, or is TABLE.md stale?),
  but it is not eggroad-blocking.
- **P5 (root gate — kill conversion): SEQUENCE, don't lever yet.**
  The eggroad needs the endgame lane's kill-conversion work to land
  first (veterans 0/8 is the root). This pilot proposes no new kill
  lever — it measured the wall. Any kill lever needs its own
  pre-registered panel run, not a pilot appendage.
- **P6 (snapshot-gated re-call — DRIVER change, testable, REFINED
  BY THE DIAGNOSTIC):** the game ALLOWS re-calling (stand-down
  dissolves the muster; soundTitanCall re-runs answering). But the
  diagnostic shows a naive re-call would NOT help: trust DECAYS
  between calls (71→58, 35→24 on 88111), so a second call on the
  same snapshot assembles the same or fewer blades. The re-call
  must be gated on an IMPROVED snapshot — a new link formed, a
  link's trust recovered above 25 (answer) or 70 (trusted quota).
  Proposal: test a snapshot-gated re-call driver (re-call only
  when the link snapshot improves vs the stood-down call) on a
  confirm sweep with a pre-registered bar (muster-ready rate vs
  this pilot's 0/10 muster-ready). Driver-level only — no game
  change.
- **P7 (muster gates 10/12): NUMBERS ONLY IF P6 FAILS.** Near-misses
  (11/12, 8/10) suggest the gates sit just above typical supply —
  but lowering them before testing P6 would spend design capital on
  a number that re-calling might fix. Sequence: P6 first, then
  re-measure, then judge the gates.
- **P8 (CHAMPION MECHANIC — Steve direction, PROPOSAL ONLY, not
  implemented):** the player (as the village) chooses a champion
  for the table — seat challenges need not all be solo.
  - What exists: solo seat challenges (the sitting player plays
    every beat in table-*.js); ascended villagers add +10 path
    strength each (cap 100) and are voiced via Architect/Pantheon
    lines, but play nothing; facilitation with architect's credit;
    the outshone epilogue. "Champion" in current code means
    something else — the table's champion (the Finale, fought in
    trial-by-combat) or the System as Earth's champion — NOT a
    villager champion.
  - What is new: a villager who PLAYS beats (choices, meters,
    consequences) in the player's place for some or all beats; a
    selection mechanic (who qualifies, how chosen); consequence
    mapping (the champion's stats/traits/skills shape beat
    outcomes); failure consequences for the champion. And a NAME:
    the villager champion needs a distinct term to avoid colliding
    with the Finale-as-champion.
  - What it preserves: player-only path CHOICE (the player still
    chooses the path; the champion executes it — choice vs
    execution split); village-as-protagonist (the village's story
    told through its champion); ascension-as-support (ascended
    villagers are natural champion candidates — synergy, not
    conflict).
  - What it kills/changes: the solo-challenge identity (the
    player IS the hero in every beat — the current design's
    emotional core; champion play dilutes "you sat, you played");
    every beat currently assumes player stats/traits, so beats
    need champion-stat hooks; winnability calibration shifts
    wherever a champion can fail (or succeed) where the player
    would not. This is a new system across 7 paths × beats, not
    a lever — scope needs Steve's direction (all beats? some
    beats? one path as pilot?) before any build.
- **P9 (GOD-RAISING PLAYSTYLE — Steve direction, PROPOSAL ONLY,
  not implemented):** playstyles where the player deliberately
  raises favorite villagers into gods as backup successors.
  - What exists: ascension (multiple villagers can ascend and
    stack power, +10 path strength each, cap 100, voiced);
    succession (death → another villager); godpath/subclass/track
    build codas (endingKey); facilitation with architect's credit;
    NPC heroes who can ascend.
  - What is new: the DELIBERATE investment path (the player
    chooses a favorite and invests food/knowledge/time to raise
    them); the god-as-backup-successor ROLE (when the player
    falls, the god-villager carries the village — what a
    god-successor does differently from a normal successor, in
    mechanics); visibility of progress toward godhood; possibly
    god-powers in village play, not just table strength.
  - What it preserves: village-as-protagonist; ascension-as-
    support (builds on it, does not replace it); outshining (a
    raised god outshining the player is the honest version of
    the story); player-only path choice (the god is support and
    successor, not decider — and under village-as-protagonist,
    a god-villager who succeeds the player BECOMES the player
    character, so the ruling holds cleanly).
  - What it kills/changes: nothing existing is killed — this is
    additive. The risks are grind (ascension becomes an
    optimize-the-favorite target instead of emergent) and stakes
    (death stops mattering if a god always catches the village).
    Needs a price: what raising a god costs, and what a
    god-successor does NOT do. Eggroad connection worth noting:
    a raised god would be a natural Network-march blade (the
    march needs 20 blades who stay dead) — thematically strong,
    mechanically untested.
  - Needs Steve's direction on scope (investment verbs?
    successor mechanics? table-only vs village play?) before
    any build.
- **P10 (muster-feeding driver — DRIVER change, testable):** the
  diagnostic's compounding loop (hungry muster → lost trust →
  smaller next muster) is partly a DRIVER failure: this pilot's
  driver calls the moment an omen reaches stage 2, regardless of
  pantry. Proposal: test a call-gated driver — call only when
  the pantry covers gate × 1,000 kcal × expected muster days,
  and prioritize muster upkeep over other spending while a
  muster stands — on a confirm sweep with a pre-registered bar
  (trust-at-second-call vs 88111's 58/24 decay). Driver-level
  only — no game change. If P10 holds trust, P6's snapshot gate
  becomes reachable more often; the two compose.
