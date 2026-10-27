# Steve-call decision pack — 2026-10-24

85 items were filtered to the 45 below: 38 resolve from standing design directives, 2 were misclassified (not steve-calls at all), and these 45 genuinely need Steve's word. Nothing here is decided. Each item states the question in plain words, why it matters, the real options, and a recommendation labeled as such — the recommendation is the pack author's, not Steve's, and nothing gets built until he rules. Mark rulings as they come; every item starts UNRULED.

How to use this pack: rule family by family, blocking families first. A ruling on a family principle settles its items unless an item is marked otherwise. The 38 resolved items and 2 misclassified items are listed in Appendix B so the filter can be spot-checked. Seven newer candidates are in Appendix A — they are not part of the 85. Six came out of Phase 2 gap closure; the seventh came out of the 1915Z scale-onramp round.

---

## BLOCKING FAMILY 1 — Panel contract (3 items)

These are contract changes to the shared measurement panel. By standing rule D8, panel-contract changes are Steve's call. They block measurement work until ruled.

### 665 — Should the panel's `table` metric count sittings instead of invitations?

- Question: The scorecard's `table` metric counts tableWaiting observations. On substrates where the seat is taken promptly, the invitation is never observed, so the metric prints a fake regression while sittings go 0 to 10 of 16. Should the metric count sittings (invitation to sitting) instead?
- Why it matters: A metric that reports a regression when the thing improved misleads every run review that touches it.
- Options:
  - Redefine `table` as invitation-to-sitting.
  - Leave it counting invitations.
- My take: Redefine it. Sitting is the real event; an invitation the game never observes is not a measurement.
- Status: [x] RULED 2026-10-24 — Redefine `table` as invitation-to-sitting (Steve: proceed as recommended).

### 753 — Should `playerDeaths` mean deaths of the player, or all combat deaths?

- Question: The panel builders compute the contract's "Player deaths per run" as total combat deaths — villagers plus scholar — not deaths of the player character. Should the metric be renamed, or recomputed from player-flagged deaths?
- Why it matters: Every review flag on `playerDeaths` is currently really about total combat deaths, under a label that says otherwise.
- Options:
  - Rename the metric to total combat deaths (keeps the data series, fixes the label).
  - Recompute it from player-flagged deaths only (keeps the label, changes the data).
- My take: Rename it, and add a true player-deaths metric alongside if the panel needs one. Renaming preserves the existing series' meaning; recomputing breaks comparability with every past panel.
- Status: [x] RULED 2026-10-24 — Track village deaths and player deaths separately (Steve's refinement: both series, separately).

### 797 — Should env-gated levers get a declared-intervention-flag exemption in the panel compare?

- Question: The automated panel compare errors "Unmatched flags" whenever before/after env flags differ. For an env-gated lever, the flag (for example DEPOSITGATE 0 vs 1) IS the intervention, so the automated compare can never be valid. Should the panel accept a declared-intervention flag that exempts the lever's own flag?
- Why it matters: Without the exemption, every env-gated arm needs manual paired-row analysis instead of the automated compare — pure overhead, since the flag is declared in the panel itself, not hidden.
- Options:
  - Add the declared-intervention-flag exemption.
  - Keep manual paired-row analysis for env-gated arms.
- My take: Add the exemption. A declared flag is not a hidden confound; forcing manual analysis for it buys nothing.
- Status: [x] RULED 2026-10-24 — Add the declared-intervention-flag exemption (Steve: trust Muse's gut on the mechanism).

---

## BLOCKING FAMILY 2 — Table protection (2 items)

One principle settles both unless Steve splits them: does the table protect you, or is exposure the price?

### 136 — Should reaching the table protect the scholar and village?

- Question: A village reached the table on day 65, held it about 95 days, lost nine scholars in fights at the table, then lost the village on day 158. Eight of 19 census rows show scholars dying at the table. Should the table protect the scholar and village?
- Why it matters: If the seat is no safer than anywhere else, reaching it changes nothing about survival — the endgame's destination feels like decoration.
- Options:
  - The table protects (arrival brings safety).
  - The table stays exposed (arrival is not safety).
- My take: No blanket protection. The table is the endgame stage, and its risks are the point — but its danger should come from table stakes (contests, deals), not ambient monster pressure, which table sanctity already suspends. The question worth auditing next is whether the nine table deaths were fair table-stakes losses, not whether the table should be safe.
- Status: [x] RULED (Steve 2026-10-27): No protection. The table does not protect the scholar or village; exposure is the price ("idk why they need protection at the endgame table").

### 311 — Should the table waiting period carry protection?

- Question: A village deferred at day 60 and died on day 85, before the day-90 re-offer. The waiting window (up to 30+ days) is a lame-duck period: the village earned the seat and can die holding it. Should the waiting period carry protection, or is the exposure the intended price of arriving early?
- Why it matters: If waiting is protected, deferring becomes free and the sit-now-vs-wait choice collapses. If it is not, players need to know the risk they are holding.
- Options:
  - The waiting period carries protection.
  - The waiting period stays exposed — exposure is the price of an early arrival.
- My take: Keep it exposed. Protection would make "defer and wait" strictly better than "sit now," which kills the decision. What the game owes the player is honesty about the risk, not safety from it.
- Status: [x] RULED (Steve 2026-10-27): No protection in the waiting period; same principle as 136 — exposure is the price of an early arrival.

---

## BLOCKING FAMILY 3 — Road viability / scale gates (11 items)

The shared principle: must every road reach wave 4 and the table, or are some roads meant to dead-end? The measurements below all point the same way — roads stall for capability reasons, not motivation reasons — but the principle ruling is Steve's.

### 46 — Villagers never kill wave-3 monsters on the courtship road. Should the kill-vs-scale coupling change?

- Question: Across 16 courtship runs, villagers killed exactly one wave-3 monster total. The wave-4 kill rung is scholar-only in practice, with a realistic courtship ceiling of about 1 point, not 4. Should the coupling between kills and scale change?
- Why it matters: If villagers can never contribute kills, the wave-4 rung is a scholar-only gate wearing a village-shaped costume.
- Options:
  - Decouple — let scale progress without villager wave-3 kills.
  - Keep the coupling and fund villager capability (gear, builds).
  - Lower the rung.
- My take: Keep the coupling, fund capability. The measurement shows villagers die entering fights at median 22 HP against 240–420 HP monsters — that is a capability gap, not a coupling error. The coupling is the design; the villagers are just too weak to honor it.
- Status: [ ] UNRULED

### 47 — Court-kill hunting is dead. Should the wave-4 rung accept another currency?

- Question: Deliberate wave-3 hunting on the courtship road converted almost nothing — 3 ledger points across 16 armed runs against 1 baseline. The courtship scholar loses wave-3 fights. Should wave-3 kills come from courtship play, or should the wave-4 rung accept an alternate currency?
- Why it matters: A hunting lever cannot fix this; the rung as designed is unreachable on this road.
- Options:
  - Accept an alternate currency for the rung (faced diversity, deeds).
  - Keep kills-only and fix conversion elsewhere (builds, gear).
  - Drop the rung.
- My take: Add an alternate currency alongside kills, not instead of them. The faced-3 deferral already acts as the de facto gatekeeper in practice (see 305), so formalizing an alternate path ratifies what the game already does.
- Status: [ ] UNRULED

### 69 — Should the courtship economy ever put a spear or hide armor in the scholar's hands?

- Question: The gear recipe chain is honest and complete, but 8 of 8 courtship seeds over 180 days never put a hunting spear or hide armor in the scholar's hands — no loot, gift, or find — so spear and hide crafts were zero tries out of zero. Should courtship ever route gear to the scholar?
- Why it matters: A recipe chain that can never fire on a whole road is decoration, and the build-funding lever starved upstream of its own mechanism.
- Options:
  - Route gear to the scholar (trade, tribute, a hunter villager's gift).
  - Keep the mid build off-road for courtship by design.
- My take: Route it, preferably as a hunter villager's gift. That is the most village-shaped route — division of knowledge, social economy — and it gives the chain a first link on this road.
- Status: [ ] UNRULED

### 210 — Diplomacy unlocks wave 4 without military readiness, then diplomats die. Gate it, slow it, or make it survivable?

- Question: A propose layer closed the verb gap (24 of 24 proposals adjudicated), but 3 seasoned links put diplomacy at 102 — past the 100 wave-4 bar — so wave 4 unlocked on days 57–62 via diplomacy, not war, and wave-4 monsters killed the diplomats (median survival fell from 149 to 109 days).
- Why it matters: The bar measures diplomacy; the wave measures military readiness. Letting one unlock the other without a readiness check is the mismatch.
- Options:
  - Readiness-gate diplomacy-unlocked wave 4.
  - Slow the diplomacy bar.
  - Make wave-4-versus-diplomat villages survivable.
- My take: Readiness-gate it. Slowing the bar only delays the same deaths; the unlock and the threat need to match.
- Status: [ ] UNRULED

### 212 — The war lane cannot reach standing 100 by hunting. Tune the numbers or change the path?

- Question: A dedicated war-road hunting drive banked at most 3 wave-3 ledger points on its best seed; the 4-point rung (per-type cap 2) never cleared on any of 8 seeds over 150 days, so wave 4 unlocked 0 of 8. The standing code itself marks warPerKill 25 as a "sim starting point, not canon."
- Why it matters: A bar that the best dedicated play cannot clear is miscalibrated, not undertuned.
- Options:
  - Raise warPerKill.
  - Lower the 4-point bar.
  - Count hybrid paths more generously.
  - Make wave-3 kills more convertible.
- My take: Lower the rung (or lift the per-type cap) before touching rates. The binding constraint is the kill count itself — even dedicated hunting banks about 3 — so the bar, not the rate, is what fails.
- Status: [ ] UNRULED

### 305 — Is pure war (blood) supposed to be a live path, or is the faced bar its replacement?

- Question: At 15 wave-4 unlocks, wave-3+ kill points were median 1; all unlocks were diplomacy, plenty, or hybrid. The faced-3 deferral (13 of 15 unlocks at exactly 3 faced types) replaced the kill rung as the war-side gatekeeper, but nothing selects for kills anymore.
- Why it matters: The Standing spec still describes "4 kills = 100: the pure war path," but that path does not occur in sims.
- Options:
  - Make pure war reachable (counter-kills, villager kills counting double).
  - Bless the faced bar as the war-side gate.
- My take: Bless the faced bar. It is already doing the job in practice, and pure-war reachability would need a combat economy the game does not have. Keep kills as a bonus path, not the gate.
- Status: [ ] UNRULED

### 351 — Should the belong road earn standing from bonds, or is bread-plus-blood its intended economy?

- Question: The belong road earned 0 diplomacy on 6 of 7 wave-4 unlocks (mean 2%) because lone seasoned bonds score 0 under the regional-plus filter. Its only standing sources are bread (86% mean share) and a blood trickle (12%).
- Why it matters: A road that can never earn from its own namesake — bonds — is a road with no identity. Note this revisits a deliberate 2026-10-14 call ("courtship, not regional power"); the census shows the consequence is starker than the call assumed.
- Options:
  - Give belong a bonds economy (change the regional-plus filter).
  - Accept bread-plus-blood as belong's intended economy.
- My take: Give belong a bonds economy. A one-source road is not a road design, it is a road missing. This is a genuine reversal of a prior deliberate call, so it needs Steve's explicit word either way.
- Status: [ ] UNRULED

### 368 — Is there any route to deep_reserves (bank times 5) for the courtship scholar?

- Question: The designed bank-expansion path — deep_reserves, food bank multiplier times 5 — is structurally unreachable on the courtship road. Across 4 full lifetimes, 33 distinct sheets, zero contained deep_reserves; the craft track sat at 0 levels against an 18 XP threshold.
- Why it matters: A times-5 bank expansion that no courtship scholar can ever reach is a dead branch on a whole road.
- Options:
  - Open a route (a Furnace door on courtship, another ability writer).
  - Accept deep_reserves as off-road for courtship.
- My take: Open a route, and the cleanest door is a Furnace-adjacent writer (contest prize pool or safety-net reward), not reworking the craft track. A preference layer cannot fire on an offer that never comes.
- Status: [ ] UNRULED

### 435 — Can the table be reached by base courtship alone, or is the seat the intended on-ramp?

- Question: On base courtship with seat-drive off, national reached 15 of 16 runs, but table 0 of 16, wins 0 of 16, wave-4 0 of 16. The food economy is not the wall — villages live the whole horizon with healthy pantries. The wall sits between national and the table: courtship reaches national and stops.
- Why it matters: If base courtship is not supposed to reach the table, players need a signal saying so; right now they stall with no indication of what they are missing.
- Options:
  - Base courtship reaches the table (add the missing staging).
  - The seat is the intended on-ramp (courtship alone is not supposed to reach it).
- My take: The seat is the on-ramp — but the missing piece is the signal, not the gate. Bless the seat as the on-ramp and add the staging signal that tells a national village what comes next.
- Status: [ ] UNRULED

### 569 — Should the seat require fight diversity when standing does not?

- Question: A village reached global rank, stage 3, 10 contests, 4 crises, and wave 4 — but tableSeat() read "none" on wave-3-faced 1 of 3 (wave-1 19 types, wave-2 11 types). The standing ladder is flexible; the seat gate demands 3 distinct wave-3 types.
- Why it matters: A village can out-scale its fight record, then find the seat closed for a reason its standing never mentioned.
- Options:
  - Align the seat bar with standing (drop fight-diversity).
  - Keep fight-diversity as the seat's own requirement.
- My take: Keep the requirement. The seat makes a different claim from standing — "we fought our way here" — and a global-rank village that never faced 3 wave-3 types has not demonstrated that particular claim.
- Status: [ ] UNRULED

### 862 — Should a pacifist national village unlock wave 4, or is never unlocking it a valid outcome?

- Question: A village survived 181 days at national (dip 170, 10 armored, 11 armed, 20 tricks) and never unlocked wave 4 — zero wave-3+ kills all run, so the defer4 readiness bar (1 living wave-3+ killer) never met and the draft never came. Only 4 combat-ish deaths in 181 days.
- Why it matters: If a peaceful national village never draws the draft, pacifist play has no wave-4 content at all. If it does draw the draft, pacifism is not a viable stance.
- Options:
  - A pacifist national path unlocks wave 4 (alternate unlock).
  - Never unlocking is valid — a village that never fights simply does not draw the draft.
- My take: Never unlocking is valid. A village that never fights should not be drafted into wave 4 by a timer. The trap here is the silence, not the stall — the game should say that peace has this consequence, rather than leaving the village quietly undrafted.
- Status: [ ] UNRULED

---

## Bear canon (2 items, one question)

Both items ask the same thing from two measurements. One ruling settles both.

### 556 / 674 — Bear stalk-kill vs BEAR.md canon: refusal, or maul-fight route?

- Question: The hunt code resolves a drawn black bear as a stalk "clean kill" — 13 of 15 engagements under one route, and a live case on day 33 worth 25,200 kcal with no fight, no maul. But BEAR.md canon says the bear is a fight (maul 8–17 at close range). Should the duty refuse to stalk bear, or should villagers fight the bear?
- Why it matters: A "clean kill" on a bear is free food that canon says should cost a fight. The conflict was theoretical until the wiring fix made it live; the next butchering arm will hit it again the first time a bear is drawn.
- Options:
  - Bear refusal — the duty will not stalk bear.
  - Maul-fight route — villagers fight the bear, maul and all.
  - Exclude bears from the duty's draw pool entirely.
- My take: Maul-fight route. Refusal leaves the bear as a special case the fiction has to explain forever; a fight is what canon already promises, and the maul is the price that makes bear meat earned. Excluding bears from the pool just hides the question.
- Status: [ ] UNRULED

---

## Verb set / combat (10 items)

These are all "which verb exists" questions. 163 and 256 are the same siege question; the rest are singles.

### 163 — Wave-4/5 lingerers cannot be driven off. Siege answer, call-for-help, or a third verb?

- Question: Waves 1–3 lingerers can be driven off (37 drive-off kills in 71 engagements). Waves 4–5 cannot — 0 drive-off kills in 17 attempts. The beat's "Drive it off, or call for help" is unreachable by combat for exactly the monsters the wave-5 fiction is about. Measured exits are only the 6-day crisis drift (after 6–9k kcal gorged) or village death.
- Why it matters: The apex siege has no played answer. Villages either bleed out or die; the fiction promises a verb the engine does not provide.
- Options:
  - A siege answer (a way to fight or drive apex lingerers).
  - Call-for-help as the answer (aid chain scaled to apex lingerers — currently unmeasured, 0 of 24 runs).
  - A third verb (not yet named).
- My take: A siege answer first, with call-for-help as backup, not the answer. "Call for help" measured zero arrivals on these policies; making it the only answer bets the apex siege on an unmeasured chain. The played answer is the design's own rule (every challenge is played, not rolled).
- Status: [ ] UNRULED

### 256 — Roster protection: shelter/evacuate verb, or should wave-4/5 monsters not camp Haven?

- Question: A shelter-roster policy moved nothing — post-unlock villager combat deaths 2.40 to 2.40, byte-identical. The policy has no verb to move villagers off a threatened tile, and villagers die in 1–2 rounds before any withdrawal fires. Should villagers get a shelter or evacuate verb, or should wave-4/5 monsters simply not camp Haven?
- Why it matters: Same siege question as 163, from the roster side. Without a verb, the village cannot protect its people from a camping apex monster.
- Options:
  - A shelter/evacuate verb for villagers.
  - Wave-4/5 monsters do not camp Haven.
- My take: A shelter/evacuate verb. Barring apex monsters from Haven by fiat shrinks the siege to a scheduling trick; a verb keeps the threat real and gives the village an answer. Rule this with 163 — one siege-answer principle covers both.
- Status: [ ] UNRULED

### 284 — Carcass-haul bind: witness memory, or a wider walk-by radius?

- Question: Villager hauls of monster carcasses fired once in 32 runs. The drive works and the knowledge gate is not the bind — the bind is upstream: remembered sites are structurally rare (only the killer remembers, or walkers-by), the scholar's kills and villagers' remembered corpses are disjoint populations, and the 2–3 day spoil clock purges before selection.
- Why it matters: Monster meat never reaches the village economy through villagers, so the whole carcass-haul channel is decorative.
- Options:
  - Witness memory — villagers remember the scholar's kills.
  - More villager expedition kills (more killers remembering).
  - A wider walk-by radius for remembering corpses.
- My take: Witness memory. It is the smallest change that joins the two disjoint populations — the scholar's kills become village knowledge — without reworking expedition rates or spoil clocks.
- Status: [ ] UNRULED

### (new) — Monster-meat testing and cooking: villagers should test and cook monster meat

- Question: Unknown flesh never reaches a meal — it arrives at zero food value, the pantry draw filters it out, the once-a-day experiment beat never picks it, and with no spoil day it piles up as clutter. Why aren't villagers testing and cooking it?
- Why it matters: The whole monster-meat channel (haul, reveal, test, cook) is decorative if nothing ever reaches a meal, and quirk meats are a designed min-max building block.
- Status: [x] RULED (Steve 2026-10-27, direction): Villagers should test and cook monster meat — the channel is to be made working end to end. Mechanism per the existing candidates (away-from-home experiments, spoil day on hauled unknown flesh, competent-policy test drive), measured before landing. Item 284 (which haul fix) stays open.

### 292 — Should a dehydration death trigger water-duty assignment?

- Question: Across 40 days on one trajectory, zero villagers were assigned to water duty despite a 16-day empty cistern and a day-12 scholar dehydration death. Rain, not duty, refilled the cistern. The village mourns but does not change water behavior.
- Why it matters: A village that cannot learn from a dehydration death will repeat it. This is the adaptive-behavior question: do villagers react to how people died?
- Options:
  - Yes — a dehydration death (or a dry cistern) triggers water-duty assignment, possibly with a village meeting beat.
  - No — water duty stays player-assigned; the village does not self-adapt.
- My take: Yes, trigger it. A death that changes nothing is a story the game refuses to tell. The trigger should be the death, not just the dry cistern — deaths are the village's loudest signal.
- Status: [ ] UNRULED

### 354 — Disengage: hold, or take the party with you?

- Question: A disengage walked the scholar out of a fight a villager was still fighting — "no deliberate engagement" for the scholar read as deliberate abandonment for the party left behind. Should a future avoidance or flee rule hold when villagers are committed, or take the whole party?
- Why it matters: Any flee lever that trades bearer safety for villager deaths is a betrayal machine, not an escape.
- Options:
  - Hold when villagers are committed (no leaving them).
  - Party-wide disengage (take them with you).
  - Abandoning the party is allowed play (sometimes the intended choice).
- My take: Party-wide disengage as the rule, with hold as the fallback when the party cannot move. Abandonment should never be the silent default — if it is ever intended play, it must be a loud, chosen betrayal, not a side effect of fleeing.
- Status: [ ] UNRULED

### 648 — Should bedroll placement matter during raids?

- Question: The engine lets the scholar sleep rough in the wild during a live raid — exposed in a cold snap while lingerers gorge at the treeline, taking a healing penalty. A player-facing raid posture would make the bedroll's location a real decision during raids.
- Why it matters: Right now where you sleep during a raid is not a decision, so a whole axis of raid preparation does not exist for the player.
- Options:
  - Bedroll placement matters during raids (a real decision with consequences).
  - Leave it — sleeping rough stays free of raid consequences.
- My take: Make it matter. It is a small, legible decision — sleep at Haven or risk the wild — and it costs nothing to teach. Deferrable: this one can wait; it blocks nothing.
- Status: [ ] UNRULED

### 695 — Is a no-exit sealed wave-4 fight fair?

- Question: A monster sealed the barrier ("no escape that way — the fight continues here," four times) and then killed the withdrawing scholar. Is a no-exit wave-4 fight fair when the policy's only answer is the barrier?
- Why it matters: A fight with no exit and no counterplay is a death trap, not a challenge. It pairs with the empty-draft finding (scholars dying alone).
- Options:
  - Yes, sealed fights are fair (the barrier is the answer).
  - No — sealed fights need an exit or a counterplay.
- My take: No, not as measured. A sealed fight needs at least one played counter — breaking the seal, a cost to open it, or a non-barrier exit — or the seal should not fire on a withdrawing scholar. Fairness here means an answer exists, not that the answer is easy.
- Status: [ ] UNRULED

### 705 — Empty-draft muster discipline: draft-aware muster, or a raid-ripe departure gate?

- Question: 21.4% of raid-nights had zero defenders. The mechanism is pinned: the engine's daily muster shelters everyone when a wave-4+ threat is within radius 2 of Haven, and sheltered villagers "do not come out" by design — two working-as-designed systems compose into an empty draft. Away rhythms (water runs, visits, forage) account for the rest.
- Why it matters: The village's own safety system leaves it undefended one night in five. The muster discipline ("outlast it, not feed it") is the design question.
- Options:
  - Draft-aware muster (the muster leaves defenders out).
  - A raid-ripe departure gate (hold departures when a raid is ripe).
  - Leave it — the empty draft is the intended cost of sheltering.
- My take: Draft-aware muster. Sheltering everyone including the defenders defeats the purpose of having defenders; the muster should shelter the vulnerable and leave a draft, not shelter the draft too. A departure gate alone still leaves the muster problem untouched.
- Status: [ ] UNRULED

### 831 — Scholar's haven defense lever shape: muster shelters the village but excludes the scholar?

- Question: 93 of 93 wave-4 fights happened at the haven — the exposure is haven-centric, not patrol. The restraint window as specified ("forced fights are fought normally") is unbuildable against this exposure, because any effective restraint must touch haven defense. The measured shape: the muster shelters the village but excludes the scholar.
- Why it matters: If the scholar is always the one left out in haven defense, every haven fight is a scholar fight — the lever shape decides who bleeds.
- Options:
  - Keep the shape (muster shelters villagers, scholar defends).
  - Change the shape (scholar shelters too, or villagers share defense).
- My take: Change it, but narrowly — the scholar should not be the automatic exclusion. The haven defense lever should let the village share the fight (a draft that includes villagers) rather than defaulting the scholar to solo defense. This pairs with 705: one muster principle, two symptoms.
- Status: [ ] UNRULED

### 835 — Armor-craft conjunction: knowledge-by-having-worn, wearing, crafter designation, or scholar-timed haul?

- Question: The NPC armor-craft beat needs a villager currently wearing bark or hide armor AND a communal pile with bark and vine on the same day. Measured on the only qualifying seed, knowledge-gate days and material days were disjoint — zero attempts. Villagers upgrade out of the demonstrating low-tier armor before the pile fills.
- Why it matters: The craft beat is precondition-starved. The supply half (pile filling) works; the conjunction never forms, so NPC armor crafting never happens.
- Options:
  - Knowledge-by-having-worn (past wearing counts, not just current wearing).
  - Crafter designation (name a crafter; their knowledge counts).
  - Scholar-timed haul (the scholar times the pile fill to the demonstration).
- My take: Knowledge-by-having-worn. It is the smallest change that breaks the disjoint-days trap — a villager who once wore the armor knows the craft — without adding a designation system or a timing minigame. This is the same family as the deepening finding that villagers equip armor but never craft it.
- Status: [ ] UNRULED

---

## Win state (2 items)

One principle: does the win end the run, or does play continue past it?

### 412 — Must tricks survive the win, or is win-truncation acceptable?

- Question: On the genuine win-side stack, trick resolutions dropped to 9 across an 8-seed pilot (against 14 on the no-win control), because 6 of 8 armed runs won around day 89 while trick discoveries land day 81 and later. The wins eat the late game where the counter game lives. Is "tricks must survive the win" a design requirement, or is win-truncation acceptable?
- Why it matters: If winning ends the trick game, the deepest counterplay content is unreachable on winning runs — the better you play, the less of the game you see.
- Options:
  - Tricks must survive the win (the win does not end the run, or the trick game moves earlier).
  - Win-truncation is acceptable (winning ends the run; the trick game is pre-win content).
- My take: Tricks must survive the win, or the trick game must move earlier — winning should not delete content. The cheaper fix is moving trick discoveries earlier, not keeping the run going forever; but if neither moves, the win is a content cliff and players will feel it.
- Status: [ ] UNRULED

### 714 — Seat win truncates the veteran channel: bar counts, non-seat substrate, or win doesn't end run?

- Question: The only proven veteran channel (villager wave-4 kills) composed onto the only winning substrate moved nothing — 0 of 8 armed seeds reached wave-5, villager wave-4 kills 0 of 8 both arms. The table win lands around days 90–134 and the run ends, while the veterans bar needs wave-4 kills by villagers — by the time villagers could blood themselves, the village has already won.
- Why it matters: The veteran endgame and the win endgame cannot coexist on the same run. One of them has to give.
- Options:
  - Change bar counts (lower the veterans bar so it completes before the win).
  - Use a non-seat substrate (veterans measured where wins do not end runs).
  - The win does not end the run (play continues past the seat).
- My take: The win should not end the run — or at minimum, the run should continue to a natural horizon after the seat. Lowering bars to race the win just compresses both systems; the structural fix is letting the village live past its victory. Rule this with 412: one win-continuation principle settles both.
- Status: [ ] UNRULED

---

## Canon singles (6 items)

Each its own question. None blocks other work except as noted.

### 85 — Can Haven belong to multiple primaries at once?

- Question: The belong road is single-link by design: belongseek breaks its bond before re-courting, so Haven never holds 2 subordinate links at once (max 1 seasoned belong link at a time). The pure-diplomacy road to the top tier needs 6 seasoned links; the uncapped lead road reached 4–6. Is Haven belonging to multiple primaries at once even fictionally coherent?
- Why it matters: This gates any multi-link belong design. If multi-primary belonging is incoherent fiction, the belong road's ceiling is 1 link by design; if it is coherent, the road needs rework.
- Options:
  - Yes, multi-primary belonging is coherent (belong road can hold several links).
  - No, Haven belongs to one primary at a time (single-link is the design).
- My take: No — one primary at a time. Belonging is a loyalty claim, and divided loyalty is a different story (rivalry, defection) than parallel membership. The belong road's design should deepen its one link, not multiply it.
- Status: [ ] UNRULED

### 88 — Monster re-engages the successor inside Haven. Is Haven sanctuary?

- Question: The same monster that killed the scholar at the haven node started a new fight with the successor while insideHaven was true on succession day — and the successor died in it. Should monsters be able to start combat with someone inside the hall?
- Why it matters: Haven is the village's home. If monsters can fight you inside it, there is no safe ground at all — and succession day becomes a death trap.
- Options:
  - Haven is sanctuary (no monster-initiated combat inside).
  - Haven is not sanctuary (monsters can re-engage inside).
- My take: Haven is sanctuary for monster-initiated combat. The village's home must be the one place the fight does not follow you — otherwise "go home" is never an answer, and succession becomes a coin flip on the day the mantle passes. Note this interacts with 163/256: sanctuary inside does not mean safety outside, and the siege answer still needs its verb.
- Status: [ ] UNRULED

### 255 — Which trap for each of 12 trap-promised animals?

- Question: Twelve animals — javelina, roosevelt elk, american alligator, bison, pronghorn, burmese python, american mink, big brown bat, great horned owl, green heron, eastern chipmunk, eastern coyote — carry a hunt method including "trap," but no recipe's catch list includes them. A player who traps for them gets nothing forever: a false promise in the hunting layer.
- Why it matters: Every one of these is a trap the player can set and a hunt that can never pay. It is pure content debt, but it is also a lie the game tells the player.
- Options:
  - Assign each animal a trap recipe (design call per animal, before data edits).
  - Remove "trap" from their hunt methods (stop promising it).
- My take: Assign the recipes — but this is authorship work, not a principle. The fastest honest pass: map each animal to the closest existing trap by size and habit, and only invent new traps where no existing one fits. Deferrable: it blocks nothing, but it is a lie worth fixing.
- Status: [ ] UNRULED

### 411 — Wave-6 canon before trick wiring?

- Question: Wave-6 monsters (network tower, limb, heart) have no trick definitions, and the canon doc is silent on wave 6 entirely. The doc also drifts from the data (56 defs claimed, 72 present; 14 versus 17 counter kinds; wave-4/5 roster drift).
- Why it matters: Nobody can wire wave-6 tricks until canon says what wave 6 is. Wiring first would invent canon by accident.
- Options:
  - Write wave-6 canon first, then wire tricks.
  - Leave wave 6 unwired (a documented blank).
- My take: Write the canon first — but keep it short. Wave 6 needs a one-paragraph identity (what the network monsters are and what counters them), not a full bestiary, before any wiring. Deferrable: wave 6 is beyond the current wall.
- Status: [ ] UNRULED

### 590 — Hall-as-shelter canon, or scholar-meets-it-alone fiction?

- Question: The hall door blocks veteran production: 75 of 90 same-node companion dispositions were door-blocked (scholar outside the hall, companions inside), and the scholar was inside for only 19 of 624 wave-3 fight starts. Is the door working as designed (hall as shelter is canon), or is scholar-meets-it-alone the intended fiction?
- Why it matters: The door decides whether companions can fight alongside the scholar at all. If the hall is shelter, the door is doing its job and veteran production needs another route; if the fiction is scholar-alone, the door is the design.
- Options:
  - Hall-as-shelter is canon (the door works as designed; find another veteran route).
  - Scholar-meets-it-alone is the intended fiction (the door is the design).
- My take: Hall-as-shelter is canon — a hall that is not shelter is just a room — but the door should not delete companions' positions. The fix is a door-side-aware join rule (companions stay present through the door), not abandoning shelter. That keeps canon and unblocks veterans.
- Status: [ ] UNRULED

### 784 — Dangerous-work trust gate: 40, or 20?

- Question: A killed staffing arm used a trust-at-40 gate for dangerous work, stricter than the game's own dangerous-work line (trust 20 via the engine's obedience check), and blocked engagement for weeks. If any future staffing arm ships, which gate is canon?
- Why it matters: This is just a number, but it decides whether villagers will do dangerous work at all in the trust band where most of the game happens.
- Options:
  - 20 (the engine's own line).
  - 40 (the stricter policy gate).
- My take: 20. The engine's line is the canon until a reason exists to override it, and a stricter policy gate that blocks engagement for weeks is a policy bug, not a safety rule. Quick ruling; no design work rides on it beyond the number.
- Status: [ ] UNRULED

---

## True singles (9 items)

Each stands alone. 415 is flagged: it revises Steve's own prior ruling.

### 94 — Should sleep deprivation exist at all?

- Question: There is no sleep-deprivation mechanic. Energy drains only on actions, never passively; there is no days-awake tracker and no dawn penalty for skipping sleep. Rest can be looped indefinitely, so sleep is optimal but never mandatory.
- Why it matters: A survival game where sleep is optional is missing a pressure. But adding a whole fatigue system is new machinery, not a tune.
- Options:
  - Yes — add sleep deprivation (fatigue debuffs, forced rest, microsleep events).
  - No — the opportunity cost (night actions foregone) is sufficient pressure.
- My take: No, not as a new system. The opportunity cost plus the healing buff already make sleep the rational choice; a fatigue system would be a new survival model, and the standing rule is new systems last. If skipping sleep ever proves degenerate in sims, revisit with evidence.
- Status: [ ] UNRULED

### 153 — What is a "pantry-spiral posture"?

- Question: Combat spirals want the scholar home; pantry spirals want the scholar ranging for food (haul and forage priority, tribute runs). But the posture verbs are threat-agnostic — one posture for all spirals — so a trigger can read a true pantry spiral and still lose 44 days. What does a pantry-spiral posture even look like?
- Why it matters: Until the concept has a name and a shape, no posture system can key verbs to marker types — the spiral response stays wrong for pantry threats.
- Options:
  - Scholar-led haul caravans.
  - Tribute acceleration.
  - Raid defense.
  - Some other named shape (Steve's call).
- My take: Scholar-led haul caravans. A pantry spiral is a food emergency, and the legible answer is the scholar leading food into the village — it is visible, playable, and distinct from combat postures. Name it first; the verbs follow the name.
- Status: [ ] UNRULED

### 199 — Link-trust vs villager-trust: name the currency, or build a bridge?

- Question: Link-trust (tribute and tend-link, +2,867 over one census) and villager-trust never convert, and the game never says which a verb feeds. Trust telemetry and design should name the currency.
- Why it matters: Two trusts with no bridge and no names mean every trust verb is ambiguous — players and builders cannot tell what they are earning.
- Options:
  - Name the currency (say which trust each verb feeds).
  - Build a bridge (let the trusts convert).
  - Both (name first, bridge later).
- My take: Name first. Naming is free and it exposes whether a bridge is even needed — most of the confusion may be labeling, not mechanics. A bridge is a new economy; do not build it until naming shows a real gap.
- Status: [ ] UNRULED

### 415 — Guarded crumb-take vs Steve's 2026-10-14 whole-piece ruling — FLAG: THIS REVISES STEVE'S OWN PRIOR RULING

- Question: Steve ruled on 2026-10-14 that hungry villagers take the full piece, no fractionating. A guarded crumb-take (fractionating takes on marginal pantries) was proven working — it eliminated the only control crumbs-left case — but was killed on the empty-pantry-share guardrail: on a 5,626-kcal pantry, two whole-piece takes drained it to zero in one day, and 4 empty-pantry starvations followed. The question is whether the guarded crumb-take refines the whole-piece ruling.
- Why it matters: Only Steve can revise his own ruling. Nobody else can move this, and the mechanism evidence cuts both ways: fractionating fixes crumbs-left starvation but can drain a marginal pantry faster than whole-piece takes.
- Options:
  - Revise the ruling: allow guarded fractionating on marginal pantries.
  - Hold the ruling: whole-piece stands, no fractionating.
- My take: Hold the ruling, narrowly. The killed mechanism's own autopsy shows fractionating converting one villager's crumbs-left starvation into pantry depletion that starves others — on marginal pantries the "fix" is the lethal move. The whole-piece rule stands until a fractionating design proves it does not drain the pantry it is trying to save. This one needs Steve's explicit word either way.
- Status: [ ] UNRULED

### 417 — Intended scholar lifespan: weeks, or months?

- Question: Scholar mortality runs about 7 deaths per run on the pre-seat substrate — 232 deaths across 32 runs, roughly a 16-day life expectancy at 116-day median survival. Succession continuity holds (villages outlive their scholars), but the scholar rarely lives long enough to compound knowledge.
- Why it matters: Lifespan sets the whole game's pacing. A scholar who lives weeks cannot compound knowledge; one who lives months changes what a "life" means.
- Options:
  - Weeks (high turnover is the design; the village compounds, not the scholar).
  - Months (the scholar should live long enough to compound knowledge).
- My take: Months — but months of village time, not safety. The village-not-villager frame means turnover is fine, yet a 16-day expectancy makes knowledge compounding nearly impossible, which starves the codex game. The fix is not immortality; it is enough lifespan for a scholar's knowledge to matter before the mantle passes.
- Status: [ ] UNRULED

### 495 — NPC seat competition: what mechanism?

- Question: Steve's direction is that NPCs compete for the top spot and the player can be outshone — but whether NPCs determine seat-taking is undecided. The tension: NPC-taken seats complicate the long-survival challenge and the boss encounter, which assume the player's persistence.
- Why it matters: This is the "player can be outshone" promise. Without a mechanism, it is a direction, not a game system.
- Options:
  - Design a mechanism (to be explored, not built yet).
  - Leave it as direction only for now.
- My take: Explore, do not build yet — the item itself says so. The mechanism question worth answering first is narrow: when an NPC takes a seat, does the player's run continue, and what does the player do then? Answer that before designing the competition.
- Status: [x] RULED (Steve 2026-10-26, two parts): (1) path choice is player-only — NPCs never choose the path. (2) seat-taker choice: the player chooses who takes the seat, their own player character OR another villager, and plays out the scenario as that villager (normal seat, trial-by-combat, etc.). Champion + god-raising are philosophy labels (village-as-protagonist; villagers can achieve like the player), not new systems.

### 512 — Witness exposure sources beyond truth-practice?

- Question: Across 32 runs, exposure sources beyond truth-practice stayed quiet — the kept list grows from lies and confessions only (61 lie-namings, 20 confessions). The witness door's earnability currently rests on the fireside beat.
- Why it matters: If the witness path has one source, it is a single-beat grind, not an endgame axis.
- Options:
  - Add exposure sources (moot corruption, plots).
  - Keep truth-practice as the sole source.
- My take: Add moot corruption first. It is the most endgame-shaped source — public, political, and already adjacent to the witness fiction — and it gives the door a second leg without inventing a new system.
- Status: [ ] UNRULED

### 568 — Is the 3-day famine clock the intended terminal pressure?

- Question: 3 of 3 village-lost runs ended via the scattering: pantry zero, then 3 hungry days, scholar alive, population 2–8. The death cascades (starvation, combat, disease) are the erosion; the pantry-zero to 3-hungry-days pipeline is the terminal mechanism.
- Why it matters: This decides what "losing" means. If the clock is the design, a fed-but-unlucky village gets no more rope; if it is not, the terminal pressure needs rethinking.
- Options:
  - Yes, the 3-day famine clock is the intended terminal pressure.
  - No — a fed-but-unlucky village should get more rope (a different terminal mechanism).
- My take: Yes, it is the design — but the clock should be legible. Three hungry days with an empty pantry is a fair, readable end; what the game owes the player is warning at day 1, not surprise at day 3. The pressure is right; the telegraphing is the work.
- Status: [ ] UNRULED

### 751 — Belong-road realm unholdable via primary foreign-polity collapse: how decisive should it be?

- Question: On the measured substrate, 0 of 16 control and 0 of 16 armed belong runs hold the realm end-state; 7 of 9 classified belong losses are primary-realm-collapse — Haven's own sub-link sits in good standing (trust 68–94, zero arrears) while the primary's foreign polity falls apart. The belong road's endgame is gated on foreign-polity dynamics the player cannot touch.
- Why it matters: If collapse is this decisive, the belong endgame is a lottery on someone else's politics. If it is working as designed ("their realm, their chaos"), then belong players need to know the risk is exogenous.
- Options:
  - Collapse stays this decisive (working as designed; the risk is exogenous).
  - Collapse is softened (the player gets a lever on it, or it gates less).
- My take: Soften it, but by giving the player information, not control — a warning that the primary is unstable, and a chance to hedge (a second link, a fallback). The player cannot touch foreign politics, but they should be able to see the storm coming. This pairs with 85: if multi-primary belonging were coherent, hedging would be the natural answer.
- Status: [ ] UNRULED

---

## Appendix A — 7 newer candidates (NOT part of the 85)

The first six came out of Phase 2 gap closure as (d)-to-(c) candidates. The seventh came out of the 1915Z scale-onramp round. They await the same decision pass but were not adjudicated with the 85. Same format.

### 58 (new) — Unlock-lane gate: wire it, or drop the dead keys?

- Question: The `unlock` lane in knowledge data is dormant: the engine's unlock check has zero callers, and 6 of 17 unlock ids (boil water, solar purify, fire wet, make cordage, forage read, make snare) have zero consumers anywhere. Every skill's first-level unlock promises something the engine never checks.
- Why it matters: Skills promise unlocks that do not exist. Either the lane gets wired or the promises get removed.
- Options:
  - Wire the lane (for example, the craft recipe gate honoring unlocks).
  - Drop the dead keys.
- My take: Wire it, starting with the craft gate. Dropping 6 unlock ids deletes content the skills already advertise; wiring one gate (craft) makes the whole lane real.
- Status: [ ] UNRULED

### 340 (new) — Lifetime vs trailing ledger: which ledger does a lever move?

- Question: The trust-tax bar is lifetime-cumulative (median end-life net −26k), while the freeloader clock judges the trailing-7-day net rate. A lever must name which ledger it moves — managing the trailing week does not lift the lifetime tax that sustains the trust-under-30 half-ration.
- Why it matters: Without naming the ledger, every trust lever is ambiguous about what it actually fixes.
- Options:
  - Name the lifetime ledger as the lever's target.
  - Name the trailing ledger as the lever's target.
  - Name both, per lever.
- My take: Name both, per lever. The two ledgers measure different things (a life vs a week), and pretending one covers the other is how trust levers misfire. This is a naming ruling, not a build.
- Status: [ ] UNRULED

### 494 (new) — Food-deed gate opened; what should the deed metric measure now?

- Question: Steve decided on 2026-10-17 to open the food-deed gate (villagers' blows bank food deeds), but questioned the measurement: "are we measuring the right thing there? Other people in the village might get luckier or play more optimally than the player." The deed metric was built on scholar-only attribution; once NPCs compete, it needs rethinking.
- Why it matters: The gate is open but the metric still measures a scholar-only world. Every deed comparison after this is suspect until the metric catches up.
- Options:
  - Per-villager deed shares.
  - Luck-vs-skill decomposition.
  - Keep scholar-only attribution.
- My take: Per-villager deed shares. Once NPCs compete, scholar-only attribution is not just incomplete — it is misleading, because it credits or blames the scholar for village work. Shares are the honest unit.
- Status: [ ] UNRULED

### 678 (new) — LABEL MISMATCH, needs clarification before ruling

- Question: Phase 2 labeled this candidate "sanctity gate," but the sim-findings line behind it is a control-rot drift data point (pilot control pooled 2,307.3k fresh-rot kcal, 208,806 per 100 days — another control-drift observation).
- Why it matters: The label and the evidence do not match, so there is no clean question to rule on yet.
- Options:
  - Clarify first (which sanctity gate? or is this a rot-drift item?).
- My take: Do not rule this one yet. The pack author flags it rather than inventing a question: Phase 2's label and the underlying line disagree, and ruling on a mismatched item would bless the wrong thing. Evidence thin by mismatch, not by absence.
- Status: [ ] UNRULED (pending clarification)

### 816 (new) — Trail-starvation recall: re-run the census, or build the recall?

- Question: 6 of 13 starvation deaths on the census are away-villagers whose expedition production cliffed 80–95% overnight while they stayed on the trail; pack draws of 700–1,000 a day against about 2,000 need, while the village pantry sat ample (8.6k–33k). No mechanism recalls a villager when trail production collapses — the pack is the only buffer.
- Why it matters: Villagers starve on the trail next to a full pantry because nobody calls them home. The named next step is a census re-run with an extended taxonomy; the design question is whether a recall mechanism should exist.
- Options:
  - Re-run the census with the extended taxonomy first (classify, then decide).
  - Build a trail-production-collapse recall now.
- My take: Re-run the census first. The extended taxonomy (trail-starvation vs wound-compounded vs net-based inflow failure) is cheap classifier work on an existing corpus, and it tells us whether recall fixes a real channel or a rare one. Do not build the recall on 6 deaths.
- Status: [ ] UNRULED

### 393 (new) — Patrol-domain contender takeover (2.3x amplification): intended, or emergent?

- Question: Assigning villagers to patrol provokes contender challenges for the patrol domain, and the taker patrols 3 times a day as a task lead (measured 101 assigns to 224 fires over 60 days; sweep-wide 2,224 assigns to 3,655 fires). The competent policy never answers challenges, so the takeover is emergent, not designed — and the taker is a lead-goal contender, not necessarily a fighter.
- Why it matters: Any future patrol arm must decide what to do about the challenge: answer it, design for the takeover, or suppress it. Right now patrol assignment silently amplifies into a leadership takeover.
- Options:
  - Answer the challenge (patrol defends its domain).
  - Design for the takeover (the takeover is a feature).
  - Suppress it (patrol assignment does not provoke challenges).
- My take: Design for the takeover, with an answer available. The amplification is emergent but legible — a contender taking a domain and working it is village politics, not a bug. The missing piece is the player's ability to answer the challenge, not the takeover itself.
- Status: [ ] UNRULED

### (new) — Residual wound mill: should defenders finish a crippled beast they meet?

- Question: When a villager out on defense MEETS a crippled beast — wounded, not dead, still circling the haven months later — should they finish it? The 1915Z round measured 105 defender events and 351 re-meets on the armed band: the same wounded animals keep being met and never resolved. The defender-finish rule from the same round was proven mechanically but killed on cost (deaths 234 to 316, wins 4 to 3), so this is a separate, narrower rule with its own loot and ledger scale — and the round flagged it as needing Steve's ruling before any arm touches it.
- Why it matters: Crippled beasts echo for months ("it's still out there, somewhere" dozens of times for the same animal) while the village lives next to them. Whether meeting means finishing changes the kill economy — veteran formation is the binding leg of wave-5 eligibility — and it needs its own loot scale, since a finished beast is a kill with a ledger entry.
- Options:
  - Defenders finish a crippled beast they meet, with its own loot and ledger scale.
  - Defenders leave them; only real fights resolve crippled beasts, and the echoes continue.
  - Finish only under conditions (for example, only beasts below a wound line, or only when the defender can afford the fight).
- My take: Leave them for now. The Stage 2 finish rule just showed finishing costs lives, and the meet path is unmeasured — a meet-finish rule is a new kill source feeding the binding leg without a cost guard. If it goes ahead, it needs its own pre-registered cost guard and its own loot scale, proven on the meet path, and it should wait until the wave-4 funnel question (carried item 1 from the same round) is answered, since both feed the same kill economy.
- Status: [x] RULED (Steve 2026-10-27): Defenders weigh scenario risk and finish a crippled beast they meet if they can — a risk-weighted, conditional finish, not an unconditional one. This supersedes the "leave for now" take; it is the narrower meet-path rule, distinct from the Stage-2 finish rule killed on cost (deaths 234 to 316). Any implementation needs its own pre-registered cost guard on the meet path.

---

## Appendix B — The filter, for spot-checking (38 resolved + 2 misclassified)

These were filtered OUT of the pack. One line each, no re-argument. Directive codes refer to the 18 standing architecture directives the adjudicator tested against.

### Resolved by directive (38)

- 25 → D4: kicker must match trigger timing; retitle to dusk, do not move the trigger.
- 38 → D1: successor is just a villager; no mantle-granted repositioning.
- 45 → D1: same-day chains are succession jeopardy, not a repositioning grant.
- 50 → D12: unlabeled meat is not known-edible; preserveFood must not accept it.
- 77 → D12: cook identity is ordinary village knowledge; visible when known.
- 108 → D1: no successor-specific pharmacy; successor uses ordinary villager access.
- 131 → D5: food is the economy; links past 4 cost pantry weight — a warning alone leaves formation as decoration.
- 194 → D4: beat must describe what the engine does (bigger raids, not more raids).
- 241 → D4: verb must charge what it states; cap take at stated 1,500 kcal.
- 252 → D5: rot must cost value; spoiled stacks excluded from tribute spends.
- 268 → D12: parts are known-safe, so the knowledge gate is passed; the body-id gate is a bug.
- 279 → D12: reveal passes the knowledge gate; carcasses edible at raw penalties, clean step is optional processing, not a forced gate.
- 317 → D5: feast road is a feared road by construction; saturation is the economy working, not a formula bug.
- 318 → D5: same as 317.
- 324 → D1: no succession-specific 1.5x grief leverage or special beat; ordinary village rules.
- 341 → D4: bars must display the true voluntary ledger, not meal-inflated cumulative.
- 396 → D10: craft is a human skill; it can never grant System magic.
- 458 → D5: same as 317/318.
- 486 → D12: knowledge-open must mean action-open; run wave-2 signatures in the field model.
- 516 → D7: transfer resolves through a played gift verb, ownership preserved, not by ban or flat rule.
- 524 → D8: accept the honest ~1.034 pool; curating the baseline to flatter the metric is re-scoring.
- 532 → D8: same as 524.
- 593 → D4+D3: beat must stop promising a watch that never comes; do not build a watch system to satisfy copy.
- 599 → D4: beat names the actual roster when one exists, invents none when it does not.
- 608 → D7: same as 516.
- 629 → D3: root cause identified (enterBuilding never calls ensureVillagerPositions); fix the call site.
- 634 → D12: the gate is the search; place books on searchable surfaces, surface choice is not a design question.
- 639 → D12: knowledge-gating applies to every surface; wire the snare unlock, do not leave dead keys.
- 643 → D5: one food economy means one portion law; villagers portion like the player.
- 646 → D7: provide the played channel (craft/gift); do not move the door bar by flat rule.
- 659 → D4: materials the player put in must be visibly retrievable; a one-way counter is silent retention.
- 668 → D1: no succession-specific cost stack; ordinary grief rules apply to the successor. (Note: the coordinator's "once-per-primary" variant was rejected — it is itself succession special-casing.)
- 683 → D1: resolved by 668; third-bar variants moot.
- 761 → D14: silent homecoming governor is the banned post-hoc-trim class; remove it.
- 804 → D12: apex armor must be earned visibly; the factory must not grant it to newcomers.
- 822 → D3: recall as 1–2 day emergency response stands; pack/HP sensors are a new system, last resort.
- 867 → D1: scholar armored (or not) by the same village channels as any villager; no scholar-specific rule.
- 876 → D3: accept the measured once-a-day gate; intra-day trigger is a new engine system, last resort.

### Misclassified — not steve-calls at all (2)

- 604 → Already resolved: kill record documents pit_overhear as vestigial-by-design; the remaining doc note is bookkeeping, not a decision.
- 759 → RULED (Steve 2026-10-27): National standing IS required for the full seat. deedGateReady must enforce scale in ok — currently scale is computed and reported but NOT in ok ("Scale is NOT added here (open design question)" in progression.js). This is a code fix, superseding the earlier "doc sync" framing.
