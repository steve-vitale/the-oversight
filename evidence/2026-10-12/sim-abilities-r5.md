# Long-run sim — LEVER 9 ROUND 5: practice deed grants (2026-10-12)

Canon read first: docs/CANON.md (Human skills ≠ alien abilities lane rule —
practice ≠ human skill; these are System-granted alien abilities into the 6
slots), docs/SYSTEMS.md (stale 2026-10-05, verified against code). Continues
evidence/2026-10-12/sim-abilities-r4.md (r4 wired the 9 `trial`-type
abilities via src/js/trial-deeds.js; the 5 `practice`-type + `discovery`
soft_step were explicitly left unwired as "ambiguous triggers, bigger design
call"). This run makes that call.

## The blank (confirmed real, not invented)

`src/data/abilities.json` declares 5 abilities with `unlock.type ===
'practice'` (stalk, blood_trail, ambush, war_cry, haymaker) and soft_step
with `unlock.type === 'discovery'`, detail "Traverse 20 tiles undetected".
**No code path ever granted any of them to the player.** Their ability
ACTIONS exist and work once held (abilityActions.js: stalk_prey,
follow_blood, set_ambush/lay_wait, bellow/challenge, throw_haymaker), and the
villager deed-XP path grants stalk/haymaker to VILLAGERS
(NPC_ABILITY_KITS field/combat tracks) — but the System never granted one to
the player. Same dead-rung class as r4's trial findings.

## The lever: practice deed grants (exact numbers)

New module `src/js/practice-deeds.js` (self-attaching mixin, @ontology
header, 85/85 systems validated — sibling of trial-deeds.js, same grant
rules: deeds accrue from day one, grants wait for systemArrived (day 7),
`checkPendingPracticeDeeds()` fires crossed thresholds on arrival,
idempotent, six-slot law holds with honest refusal copy naming the slots,
priced gifts pay `abilityOnAcquire`, synergies recomputed, tele
`ability_granted` with `via: 'practice_deed'`, human skills never granted —
the pool is practice/discovery-type, alien-only).

Deed → ability, with thresholds (my design calls — Steve 2026-10-07: make
the call, document it, he can overrule):
- **stalk** ×10 — quiet `stalkAnimal()` steps that left the animal unalerted
  (aware < 0.5 after the step; the step IS the practice) + silent kills
  (aware < 0.5 at the kill). First design (3 silent kills) was unreachable:
  prey notice you at dist 1–2 (rabbit awareRate 0.70 → aware 0.55 by
  adjacency), so "3 silent kills" was decoration. The step-ledger is honest:
  twitchy rabbits notice in 2 steps, calm deer bank several, the tracker
  ability stretches it further.
- **blood_trail** ×3 — kills of an animal that had already bolted this
  encounter (`boltedOnce` flag set at all 9 bolt sites in encounters.js +
  food.js preyReaction, or chase pstate, or 3+ encounter beats). "It doesn't
  get away."
- **ambush** ×2 — fights won/routed in round 1 with ≥1 monster kill
  (`f.round <= 1` at tbEnd). "Strike when it's too late for them."
- **war_cry** ×3 — `tbPlayerShout` shouts that actually moved a monster
  (n>0). Wasted breath teaches nothing.
- **haymaker** ×3 — single landed blows for ≥50% of a real opponent's max HP
  (maxHp ≥ 30, so hummice taps don't count). Kill or not — the big swing
  landing where it hurts.
- **soft_step** ×20 — the data's literal "Traverse 20 tiles undetected":
  consecutive tile entries with no monster spawn and no wanderer contact
  (checkEncounter spawn branch + wanderer contact + moveWanderer contact
  reset; quiet entries extend). Proven reachable: seed 11 hit streak 19 and
  fired the deed in a 180-tile travel probe; god-policy runs never travel
  enough (policy blind spot, not a broken rung).

Hook sites: game.js tbEnd (ambush), tbPlayerStrike (haymaker), tbPlayerShout
(war_cry), checkEncounter ×4 + moveWanderer (soft_step), checkSystemArrival
(pending pass); encounters.js huntAnimal kill site (stalk silent-kill +
blood_trail), encStrikeDeadPossum (stalk), stalkAnimal (stalk steps),
9 boltedOnce flags; food.js preyReaction (boltedOnce). index.html load order
updated. Ontology validator auto-regenerated docs/ONTOLOGY.md (84→85).

## Proof

`scripts/test-practice-deeds-20261012.js`: **70/70 green.** Mapping for all
6; thresholds fire (9≠10, 2≠3, 1≠2, 19≠20); pre-arrival counting with no
grant, pending pass fires on arrival (incl. the banked soft_step streak —
a pre-arrival 20-streak is banked in `softStepPending`, never lost);
idempotent; full-slots refusal names the slots (6/6 stays 6/6); background-
held never duplicates; all hook sites asserted against source; boltedOnce in
both files; recomputeActiveSynergies runs; grant narration sense-read
(System voice, names the deed, no "undefined", no raw ids); 6 deeds fill
exactly 6 slots, the 7th refused honestly; human-skill lane untouched.
**RED on pristine HEAD** (mixin checks fail — verified via read-only
`git archive HEAD` extraction, not the main tree).

Regressions: test-trial-deeds-20261012 62/62, test-synergy-hygiene-20261011
9/9, test-ability-evolution 26/26, test-trial-cadence-20261011 23/23,
ontology 85/85.

## Before/after (identical seeds, god policy, 200-day horizon, 12 seeds)

| Metric | Before (master) | After | Δ |
|---|---|---|---|
| Mean abilities held | 5.25 | 5.33 | noise |
| Max abilities | 6 | 6 | — |
| Unique synergies discovered | 6 | 6 | — |
| Total synergy discoveries | 14 | 14 | — |
| Runs with ≥1 synergy | 8/12 | 8/12 | — |
| Mean synergy attempts | 3.75 | 3.75 | — |
| Mean resonance | 112.9 | 112.9 | — |
| Max resonance | 289 | 289 | — |
| Median days survived | 52 | 52 | — |
| Wave reach | 1:2 2:5 3:5 | 1:2 2:5 3:5 | — |
| Villager abilities | 459 | 459 | — |

Per-deed evidence (after): **haymaker deeds 8/12 runs, ambush 3/12,
war_cry 1/12** — all through real sim play. stalk/blood_trail/soft_step
0/12 under the god policy (it never hunts, never travels far — policy blind
spots, same class as r4's peacemaker/evidence_board finding). Probed
directly through the real engine instead: hunter probe (stalkAnimal +
huntAnimal, seeds 11/42) → stalk deeds 24, blood_trail 8, kills 12/12;
travel probe (real travelTo, seed 11) → streak 19, soft_step deed fired and
granted. Practice grants held at end: haymaker 1/12 — the rest were
**honestly refused: 4 slot-refusals counted across 3 seeds** (sysSay "slots
are full" path). The 6-slot economy is now the binding constraint: trial
deeds + trial gifts fill slots first, practice grants queue behind them.
Working as designed — deeds compete for the same slots.

Synergies seen: apex_sense, blood_tracker, clean_kill, iron_gut,
sees_the_weave, sun_garden (6/51 — unchanged; the practice legs didn't open
new ones in competent sims this run).

## Reachability verdict (updated vs r4)

- **Practice/discovery abilities: 6/6 now reachable** (was 0/6). Every
  unlock.type in abilities.json now has a live player grant path:
  granted → trial deeds (r4) → practice deeds (r5) → audience trials →
  contest lanes → reactive offers → evolution → godhood.
- **Synergies: 6/51** — the practice legs (the_long_con's ambush gate etc.)
  are reachable but didn't surface new synergies in these sims; slots fill
  from trial deeds first.
- **6-slot economy: binding.** Mean 5.33 held, refusals honest and counted.
  Slots are now genuinely scarce — the economy r4 predicted is real.

## Villagers act like people? (practice-adjacent, sense read)

Transcript read (25-day run, seed 11): practice grants weren't reached by
the god policy, but the trial-grant beats land in-fiction ("You came back
bloody. Nobody asks. Someone saves you the good seat by the fire." →
TRIAL RECOGNIZED). Forced stalk grant via the real verb reads clean:
"◈ PRACTICE RECOGNIZED — the System has been watching. Ten quiet steps, and
nothing knew you were there. You close distance like weather. We took
notes." + flavor line. No robotic leakage. Villager kit grants read human
as before ("THE SYSTEM has been watching Marcus — 8 fights. It offers
Haymaker. Earned, not given.").

Same documented blank as r4: **no villager reaction beat to the player's
deed grants** (lever 3/5 territory).

## Village assessment (plain words)

Twelve villages, all village-lost (median 52 days — the food wall, same as
r4). The practice rungs are now live but quiet in competent play: the god
policy fights (haymaker deeds in 8/12 — big swings happen), occasionally
ambushes (3/12 round-1 wins), rarely bellows (1/12). It never hunts and never
travels far, so stalk/blood_trail/soft_step stay theoretical for it — but a
real hunting player hits them in a handful of hunts (probe: 12 quiet steps
across 6 deer approaches; blood_trail from every real chase). Who thrived:
unchanged from r4 — foragers with iron stomachs, scholars with gossip
networks. The practice abilities are utility/combat spice, not power —
survival within noise of baseline, honest for this lever (it fills the
ladder, it doesn't retune combat).

## Blanks filled / documented

FILLED: 6 practice/discovery abilities wired to real deed sites (new module
+ 15 hook sites + pending pass + boltedOnce flags); stalk threshold
reworked after proving the first design unreachable (traced aware
0.00→0.61 across 3 stalk steps vs a deer); soft_step reachability proven
(streak 19, deed fired, seed 11).
DOCUMENTED: god policy never hunts/travels far (stalk/blood_trail/soft_step
blind spots — needs a hunting/traveling policy or a real player);
peacemaker/evidence_board/intimidating_presence still untested (r4);
occupation background grants blur the human≠alien lane (r4, pre-existing);
villager reaction beat to player deed grants missing (lever 3/5);
practice grants mostly slot-refused behind trial deeds in competent sims
(by design — the refusal copy is the pressure valve).
