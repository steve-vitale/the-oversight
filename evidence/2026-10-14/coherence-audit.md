# Coherence Audit — every system, 2026-10-14

**Steve's ask:** "Look for evidence of a coherent system in each feature and
correct where necessary as it contributes to the whole."

**Method.** The 96 systems were reviewed in 7 areas by read-only reviewers
against five tests:
1. Purpose: it has a job in the whole game.
2. Claims true: its stated rules are true in code.
3. Data ↔ code: its data and its code agree.
4. Wired: what it provides is actually called.
5. Contributes: something else uses what it produces.

Every finding cites file:line. Clear-cut fixes (bugs, dead paths, false
text) are being applied with proof tests; everything that depends on
design intent is listed in §3 as a question.

Mechanical pre-pass, all `src/js`:
- 77 functions with no caller (`scripts/check-wired.js`)
- 18 data files with fields no code reads (heuristic, each one verified by a reviewer before being reported)

---

## 1. Verdicts by area

| Area | Coherent | Minor | Broken | Headline |
|---|---|---|---|---|
| Combat & monsters | 6 | 4 | 2 | Monster weaknesses never shown; bleed/burn/slow never applied; titans "no solo" has an exception |
| Abilities & builds | 3 | 4 | 3 | Three separate definitions of a "build" that don't share data; evolving an ability breaks godhood counts; 6/10 build-arounds dead, lying or bugged |
| Items, food, gear | 6 | 5 | 4 | **Forage-yield bonuses never apply in live play**; 27/51 relic enhancements do nothing; weapon rules read a deleted slot |
| Aliens, contests, relay | 4 | 4 | 4 | Help you call never fights; relay abilities can't be used; the galactic cast never reaches stage 3 |
| Social & conversation | 9 | 5 | 3 | Strangers' crimes go on *your* record; your trial ignores the trust you earned; being convicted earns ending points |
| Village & people | 6 | 6 | 1 | Villagers' strikes skip party roles and War Cry; raid news lost; two housing caps |
| Progression & endgame | 1 | 3 | 4 | **51 ledger writes silently dropped** (diplomacy, conquest, titan kills never reach the Table); "full" seat easier than "lesser"; wave 4 can come before wave 3 |

**The whole-game pattern.** Systems are individually rich, but the *wires
between them* are where coherence breaks. A typical failure is a system
that produces state nobody reads (social → Table, titans → Table, keepsake
reveals), or that reads a field another system stopped writing (the
weapon slot, codex techniques, trust-in-player).

---

## 2. Fixed (with proof tests), all on `master`

43 commits; each behavior fix has a test that fails before and passes after.
Full check: 817/821 green list passing; the 4 left are the 2 known god-path
checks plus 2 flaky tests.

**Your direct answers, implemented**
- **Table inputs count.** 51 dropped ledger writes now translate into real
  dimensions:
  - conquest → might
  - defense sent → protected
  - titan slain → might + protected
  - links → brokerage
  - beggars refused → food hoarded

  Kind/cruel conversation moves protected/might (real movement only, no
  farming). Exposed lies and thefts → exposed.
- **Trial gifts are pick 1 of 3**, led by the System's build-aware pick.
- **The Table stays live until you sit.** Qualifying sends an invitation
  showing your seat and doors *as they stand today*; taking the seat locks it
  (from day 90). The early-finish soft-lock can no longer happen.
- **Keepsake "beam vest" rule removed.**

**Things that were silently off and are now on** (these make the game easier, still to be measured)
- Forage-yield bonuses: relics, synergies, knowledge and luck now affect real foraging.
- 23 relic enhancements.
- Weapon bonus for hunting and scavenging.
- Crowbar flip, phase blade vs. armor, beam weapons charring meat.
- Villager allies: flank ×1.5, Point +3, War Cry +4.
- Help you call for now fights.
- Hoarder's Interest, Cartographer's Eye, Trophy Room.
- 7 technique synergies.
- Tripwire bleed.
- Full-body armor blocking slots.

**Things that were wrong and are now right**
- Evolving an ability no longer drops it from godhood and path counts.
- Blood Frenzy crits every 3rd hit as written. It had been ×2 on every hit after the first, so this is a **nerf**.
- Retribution no longer spends its charge when there's no one adjacent.
- Wave 4 can't come before wave 3.
- The full seat now requires the lesser seat's bars (except scale).
- Strangers' crimes no longer go on your record.
- Your trial uses the trust you earned.
- Being convicted no longer earns ending points.
- Betrayal and hoarding now register, so the dark branch can trigger.
- Contest rigging is deterministic.
- The galactic cast reaches stages 3–4 when you meet or fight a persona.
- Shelters count for housing.
- Raid news is no longer lost while you're away.
- Bonded starting gear stays on your body.
- Every slot unlock is announced.
- 94/203 System voice lines now play (was 22).

**Dead code and false text removed**
- Dead monster fields, dead functions, the reverted drama renderer, fusion and use-count god code.
- About 20 header and comment lies corrected.

**Couldn't do**
- `engine/day.js` is dead, but 834 test scripts load it by name.
- Starting-item filter: it offers alien and tier-3/4 gear at spawn. Fixing it reshuffles seeded rosters and breaks about 20 seed-dependent tests. That's a question below.

**Must measure next**
- With this many effects switched on, the game is easier. And two single-seed tests that used to reach the Table now don't.
- A multi-seed sweep of Table reach and death rates is owed before any balance call.

## 3. Questions for Steve (ranked by how much of the game they unblock)

**Answered 2026-10-14:**
- Q1 (Table inputs): yes.
- Q2 (what is a build): redesign.
- Q3 (choice vs gift): pick 1 of 3. Done for trial gifts; the pact stays random.
- Q4 (day 90): the Table stays relative until you sit. Done.

### New from the fixes
- **forest_scent** ("monster detection −8%") would *hurt* if wired as written. Should it mean fewer encounters while travelling?
- **Battlefield Grace:** what is its "free action", and should heals on allies count?
- **Starting items:** should the "no high-tier gear at spawn" rule cover tools and clothing too? (Fixing it reshuffles seeds.)
- **Static Edge's arc** fires on any damage to a monster, including villagers' hits. Should it be player-only?
- **Deep Listen / Omnipresence** relay abilities: what should they do when used? (They now have buttons, but no effect yet.)

### Top tier: these decide how the pieces connect

1. **What reaches the Table?** Diplomacy, conquest, titan kills, comms and pod conscription all write to ledger dimensions that don't exist, so they're dropped (51 writes). Disposition (kind ↔ cruel), confessions and detective work never reach it either.
   - Should these count?
   - If so, roughly: diplomacy → brokerage, conquest → might, defense → protected, titan slain → might + protected, detective exposures → exposed, cruel/kind → Feared/Beloved?
2. **What is "a build"?** There are three separate definitions:
   - ability `paths` tags (used by build-arounds and contest prizes)
   - godhood pools (used by capstones and trial gifts)
   - the shieldbearer 4-list in party-bond

   They pull the player in different directions, and no build-around is in any godhood pool. Merge them into one, and if so which wins?
3. **Choice vs. gift.** After day 7, most abilities arrive with no choice, and there's no way to drop one, though the game says "Make room."
   - Should trial gifts be a pick-1-of-3 like contest prizes?
   - Should players be able to release an ability?
4. **Day 90.** Finishing the Table early plays the full ending, spends the run's legend record, then soft-locks. Options:
   - (a) the Table doesn't convene before day 90
   - (b) it convenes, then reopens at day 90
   - (c) drop the floor
5. **Seat bars.** The lesser seat demands regional rank; the full seat demands none. Should scale be required for both seats or neither? Also, should national/global rank shape the Table at all? Today it feeds almost nothing.
6. **Titans and solo.** The Table's trial-by-combat is a solo fight against a titan whose world gate is 20 allies; the Brawler god text promises "can solo titans". Options:
   - (a) never solo (the trial gets allies)
   - (b) solo only at the Table
   - (c) solo as a god-path reward

### Second tier: features that exist but go nowhere

7. **Galactic cast at the Table.** Should known personas appear as named producers or judges, as a fight, or as callbacks (spared vs. killed)? And should the TV name them openly, or hide their alien identity until the reveal?
8. **Keepsakes.** 30 keepsakes reveal "+resolve when carried", but no resolve stat exists. Reveals of places, names and "deep grief" lead nowhere. Should these be made real (e.g. a trauma floor, map markers, a seek-the-sibling quest) or reworded?
9. **Monster weaknesses.** All 59 monsters have authored weaknesses, never shown. For waves 3–5 that's the only counterplay text. Show them in the codex once earned (e.g. after a kill)?
10. **Long losing fights.** Lost fights median 8 rounds, up to 37 (belltoad 37, heckler 28). Should losing fights escalate or offer a forced exit after N rounds, or is the long grind intended? (Sim bots don't use abilities, so some of this is the bot.)
11. **Party roles.** Talker and Scout do nothing; manual orders and the party split have no buttons. Should they get real effects, have their text trimmed, or be removed?
12. **Confided secrets** are random inventions ("can't read", "stole medicine") that go nowhere. Should they be grounded in real run events and made usable, kept as flavor, or cut?

### Third tier: smaller calls

13. Should villagers also suffer "win rate must drop for repeat winners"? Should the repeat gates count per category, not per contest (they almost never fire across 44 contests)?
14. Relay abilities: what should **Deep Listen** and **Omnipresence** actually do?
15. Pods **Jackpot**: what stages it? A dangle intrusion, a ratings summons, or a Table beat?
16. Corruption's "ratings SPIKING" changes nothing. Should it feed viewership, a fan lane, or the Feared branch?
17. At integration 40, villagers permanently stop giving you quests ("Quest protocol integrated"). Intended?
18. Housing: is the cap a hard wall or soft (with overcrowding costs)? Today it depends on how a newcomer arrives.
19. Companions never leave the party on their own (fear, anger, lost trust). Wire it?
20. Standing (the score that summons waves 4–5) is invisible to the player. Show it?
21. Gear in the world: should items be scavengeable (131 have an unused `findable` flag) or start-only?
22. Plants: should `idDifficulty` set how hard a plant is to learn, and `waterContent` hydrate?
23. Damage types: psychic, sonic, electric, fire and cold resistances can never apply (all weapons are physical or energy). Add typed attacks, or drop the types?
24. Waves 3–5 have no counter data, so wave mastery bonuses can't apply. Intended?
25. Ability evolution: can two abilities evolve into the same form and stack (×1.8 twice)?
26. Build-arounds: should all be weak alone (path-gated)? Should cards show the solo number?
27. Food power: overcharge (+25% when well-fed) also boosts plain weapon strikes, and passives burn no kcal. Intended?
28. `regions.json` (8 regions, harsh winters, hurricanes) is loaded and never read. Wire it, or mark it as a scaffold?
29. Records' secret achievements are never tracked. Which secrets, and where shown?
30. The pantheon asks for "an offering at the treeline", but there's no way to give one. Wire the response verbs, or cut the omens?

---

## 4. Fix batches in progress

Five isolated workers are applying the clear-cut fixes, one area each, with
a red→green proof test per behavior fix. Results are merged after review.
Fixes that turn on effects which were silently off (forage yield, relic
enhancements, Point/War Cry for villagers) **will make the game easier**.
They'll be measured, not hand-tuned.
