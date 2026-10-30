# sim-hatchequip-b — why a stashed hatchet is never equipped

Run: oversight-flesh-out-loop-b, arm sim-hatchequip-b, axis food-economy
(daytime-wood). Worktree sim-hatchequip-b. DIAG ONLY: zero src/js changes,
zero policy-default flips, zero game-code arms. Main tree never touched.
Sibling trees never touched. Nothing appended to sim-findings.md
(coordinator owns the backlog).

## Prereg (binding, committed BEFORE any judged leg)

evidence/2026-10-30/sim-hatchequip-b-prereg.md (commit e696685c).
Primary metric: per vessel case, the complete equip-choice trace —
every Game.villagerGearUp call targeting the vessel (acquire flag,
pre/post weapon bonus, pre/post stash), every Game.craft('stone_knife')
call, every Game.equip call on the vessel, and a morning snapshot of
vessel stash / scholar inventory / scholar equipped, spawn through day 60.
DIAG-GO bar: a named mechanism explaining the 0/5, reproduced on at
least 3 independent vessel cases, with the exact code path / condition
that loses the hatchet identified. Horizon 60d (axeacq's latest first-axe
day was 50; the stone_knife control fires day 5). Seeds: the axeacq fresh
band 16101–16116, re-run under the recorder on the identical substrate
(nighttravel + woodcarry, WOODWARM=0 guard leg, COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1). No balanced-panel compare:
single-state DIAG census, same standing as axeacq.

## Verdict — DIAG-GO

The mechanism is named, exact, and reproduced on all 4 fresh hatchet
cases (plus the axeacq bank case by the same code path):

**The vessel is never the target of Game.villagerGearUp with acquire=true
— the only flag value that reaches the stash block — and the sim bot's
own equip path never looks at the stash at all. A stashed hatchet has no
code path to the vessel's hands.**

The exact conditions, in order:

1. `villagerGearUp(vid, acquire)` (src/js/game.js) runs autoEquip first,
   then returns early at `if (wb > 0 || !acquire) return;` — BEFORE the
   own-stash weapon block ("They grab the best weapon they own"). The
   stash block executes only when the target is unarmed (wb == 0) AND
   acquire == true.
2. The only acquire=true call sites in all of src/js are two NPC
   departure sites: `villager-agency.js` startExpedition and `game.js`
   resolvePatrol (patrol departure). Both pass NPC vids. Every other
   gearUp call passes acquire=false (fight entry, hunt, haven leader) and
   therefore returns before the stash block by construction.
3. The vessel's equip path in sims is the policy's own gearUp
   (scripts/policies/competent.js), whose weapons() scan is
   scholar.equipped + scholar.inventory only — the word "stashed" never
   appears in that function, and the policy never calls
   Game.villagerGearUp at all. Loot enters scholar.inventory directly
   and is then equipped by that same inventory-only scan, which is why
   a looted hatchet IS equipped the next morning while a stashed one
   never is: the two hatchets live in different containers, and only
   one container is ever scanned for the vessel.
4. So gearUp's "own carried -> own stashed" order (game.js:7415 comment)
   is real code that runs — for NPCs. In 16 seeds x 60 days it fired
   1,373 times for NPCs, 121 of them with acquire=true, and 0 times for
   the vessel. The hatchet does not "lose" the equip choice; the choice
   is never offered to the vessel.

Why the hatchet is stashed in the first place (context, not the
mechanism): choosePersonalFive scores sentimental items at 1000 vs the
hatchet at 200 (bonus 15 x 10 + tool 50), so a 5-keepsake pool outranks
the hatchet into the 3-item stash. The stash is where the hatchet is
born, and — for the vessel — where it stays.

## Case counts (16 seeds, 60d, recorder corpus)

| seed | spawn stash has hatchet | vessel gearUp calls | stash hatchet ever left | vessel ever held a hatchet | how the held hatchet arrived |
|------|------------------------|---------------------|------------------------|---------------------------|------------------------------|
| 16103 | YES | 0 | NO (49/49 mornings present) | NO (0 kit-hatchet mornings) | — (village lost d50) |
| 16105 | YES | 0 | NO (59/59 mornings present) | YES, day 42 | LOOT (Nina's body, day 41 lines; looted hatchet in inventory day 42, own stashed hatchet still in stash day 43+) |
| 16106 | YES | 0 | NO (59/59 mornings present) | NO (0 kit-hatchet mornings) | — |
| 16110 | YES | 0 | NO (59/59 mornings present) | NO (0 kit-hatchet mornings) | — |

Totals: gearUp targeting the vessel 0 calls across all 16 seeds (0
acquire=true, 0 acquire=false); gearUp targeting NPCs 1,373 calls (121
acquire=true, 1,252 acquire=false). The wrapper is proven live by the
NPC volume — the vessel zero is a real zero, not a dead instrument.
Recorder wrap errors: 0. Fifth case for the record: axeacq bank seed
15337 (stashed hatchet, never held, 30d) — same code path, not re-run
here; the prereg bar (≥3 cases) is met by the 4 fresh cases alone.

## The stone_knife control — axeacq's inference REFUTED

Axeacq reported stash-equip firing for a stone_knife (16101, morning 5,
empty weapon slot). The recorder shows that reading was wrong:

- Day 4: Game.craft('stone_knife') returns true (policy keepKnife/armUp
  knapping — stone + vine on hand).
- Day 5: Game.equip(melee, stone_knife) returns true (policy gearUp over
  inventory).
- Morning 5: the vessel's stash STILL contains the stone_knife
  (['snare_wire', 'stone_knife', 'bark_armor']). The equipped knife is
  the newly knapped one; the stashed one never moved.

So there is no "stone_knife wins, hatchet loses" asymmetry to explain.
Uniform rule, now measured: the vessel's stash feeds NOTHING — no weapon
has ever moved from vessel stash to vessel kit in this corpus. The two
other stone_knife kit arrivals with a craft event (16102 day 9, knap day
8; 16114 day 10, knap day 9) are likewise knap-driven. Two kit arrivals
with no craft/equip event at all (16106 day 18, 16110 day 35) are
whole-kit changes that also leave the stash untouched — their cause is
not named by this recorder (succession-style vessel change is consistent
for 16106, whose axeacq vessel lived days 2–17), and it does not matter
for the verdict: in no case did the stashed hatchet move.

## Corroborating contrasts (same corpus)

- 16111 (no spawn hatchet): loot day 30 ("You take hatchet, chef's
  knife, ... from Theo"), Game.equip(melee, hatchet) day 31, tier 'fell'
  / canFell true from day 31, 30 kit-hatchet mornings. Inventory → equip
  works the next morning, exactly as axeacq reported.
- 16108 (no spawn hatchet): successor arrives hatchet-equipped day 50
  (morning-50 eq holds hatchet), matching axeacq's succession arrival.
  A hatchet that starts in a kit is wielded; a hatchet that starts in a
  stash is not.
- 16105 nuance: the looted hatchet sits in inventory while the hunting
  spear (bonus 30) stays melee — but woodcutTier reads inventory +
  equipped, so tier is 'fell' / canFell true from day 42 anyway. Carrying
  unlocks felling even when the spear wins the melee slot. The stashed
  hatchet, by contrast, counts for nothing: it is not inventory.

## Named next fix (DIAG arm — documented, NOT landed)

Give the vessel a stash-aware equip path. The minimal honest options,
in the order this evidence supports:

1. Policy-side (smallest, sim-visible): competent gearUp gains a
   stash-fetch step — move the vessel's own best stashed weapon into
   inventory (or equip it directly) when the vessel is unarmed or holds
   a weaker melee weapon, mirroring Game.villagerGearUp's own-stash
   block (best bonus wins; hatchet 15 beats stone_knife 12, loses to
   spear 30 / machete 35, so no power creep beyond what loot already
   delivers).
2. Game-side (player-visible): the same fetch for the human player —
   the pack UI / wake routine must surface the vessel's own stashed
   weapons, since today a human player faces the same wall: their stash
   is not in the inventory the equip UI scans. (Not verified for the
   human UI in this arm; the sim path is proven, the UI path is the
   design question for the coordinator/Steve.)
3. Do NOT "fix" this by tuning the wb gate or the acquire flag on NPC
   paths — neither touches the vessel, and the gate is load-bearing for
   NPC fight-time behavior (no mid-fight crafting/fetching).

Whichever lane is chosen, the acceptance test writes itself: re-run this
recorder on 16103/16106/16110 and require the stashed hatchet to leave
the stash and enter the kit while the vessel lives — the exact event
this corpus shows never happening.

## Sense-test (law — read, judged for meaning)

Sample: 16105, days 41–43, around the looted-hatchet arrival. Day 41 the
vessel strips Nina's body and the narration charges for it ("Your hands
know what they did. (+4 trauma)"); day 42 the looted hatchet is in the
pack and the woodcut tier reads 'fell' — the vessel can now fell big
trees, while the spear stays the fighting weapon and the denim jacket
goes on over clothes. That reads as a person using what the world gave
them: the better fighter stays in hand, the new tool opens new work.
The absurdity sits one layer down and is the finding itself: the same
vessel has owned an identical hatchet since spawn, sitting at its space
in the haven, and never once reaches for it — not because it chose the
spear (a real choice, made for the looted one), but because no moment in
its life ever presents the stashed one as an option. A person who
forgets they own an axe for 60 days is not making a choice; the game
never asks. PASS as narrative, with that gap as the verdict.

## Wall numbers

This corpus (16 seeds, 60d): wins 0/16, village-lost 1/16 (16103 d50),
15/16 survived the cap. National / table reach were not re-read in this
driver (endState records won/villageLost only); the same band's axeacq
census read national 0/16, table 0/16, max wave 2–3, never 4+. The wall
is untouched by this DIAG arm, as expected: no lever was played.

## Proof

- scripts/test-hatchequip-b.js: 21/21 GREEN (Part A static code-path
  assertions: gate-before-stash order, exactly two acquire=true call
  sites both NPC departures, competent gearUp stash-free and
  inventory-only, policy never calls villagerGearUp; Part B corpus
  assertions: 16 seeds, 0 wrap errors, 0 vessel gearUp calls vs 1,373
  NPC calls, 4 hatchet cases with 0 stash losses and 4/4 stash-intact
  at end, 16101 knap-day-4 / equip-day-5 / stash-intact-day-5, and
  axeacq trajectory equivalence on all four checkable events — 16103
  village-lost d50, 16105 first hatchet-kit day 42, 16111 day 31,
  16108 day 50 — proving the recorder is behavior-neutral).
- Instruments: scripts/hatchequip-trace-b.js (recorder driver),
  scripts/analyze-hatchequip-b.js (analyzer),
  scripts/test-hatchequip-b.js (proof). Corpus:
  evidence/2026-10-30/sim-hatchequip-b-corpus/ (16 seeds).
- No src/js or scripts/policies diff: `git diff` of src/ and
  scripts/policies/ between the worktree base and this branch is EMPTY
  (verified at commit time — recorder + analyzer + proof + evidence
  only). Note: the analyzer reads corpus files but the recorder's
  morning snapshots track the spawn vessel id; after a vessel change
  (e.g. 16106 day 18) later "person stash" rows follow the original
  vessel's record, not the successor's. That does not affect the
  verdict: every hatchet case's owner-window readings (spawn through
  owner death / kit change) show the stash intact and the kit
  hatchet-free, and the end-stash readings are the owner's own stash.

## Metric review

- Primary metric bound the run and was met: 16/16 seeds traced, 0
  recorder errors, 4 hatchet cases (≥3 bar) with the exact losing
  condition identified (no acquire=true call ever targets the vessel;
  policy equip scans inventory only). No re-scoring occurred: the
  hatchet did NOT surface on fresh seeds, so no refutation verdict was
  needed.
- One metric doubt, recorded for the NEXT run, not applied to this one:
  the prereg's "first hatchet-kit day" counts inventory + equipped
  together, which is correct for woodcut (inventory counts) but blurs
  "wielded" vs "carried" — 16105's looted hatchet is carried, never
  melee-equipped (spear wins). A future census that asks "wielded"
  should split kit into inventory vs equipped explicitly. The stash
  verdict is unaffected either way: the stashed hatchet is in neither.
- One recorder limitation for the next run: morning person-snaps follow
  the spawn vessel id, so post-succession stash rows describe the
  predecessor. Future recorders should snapshot getPerson(current
  villagerId) each morning alongside the spawn vessel, so successor
  stashes are tracked too.
