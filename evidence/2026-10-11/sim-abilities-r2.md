# Long-run sim — LEVER 9 ROUND 2: contest prize lanes (abilities, synergies, knowledge) (2026-10-11)

Canon read first: docs/CANON.md, docs/CONTESTS.md, docs/SYSTEMS.md, docs/PROGRESSION.md.
Builds on sim-abilities.md (this morning: use-log hygiene + hint honesty landed;
synergies reachable but acquisition-starved, 6 slots decorative) and
sim-contests-r4.md (prize census: ability/synergy/knowledge prizes NEVER
existed; documented as "lever-9 territory").

## The blank (confirmed real, not invented)

CONTESTS.md "Prizes — every lane" promises: "Item evolution assists, ability
unlocks, synergy hints, knowledge dumps, supplies, fan care packages...
Social prizes: reputation, fan growth, audience boons." The contests-r4
census measured the actual prize table and found: player wins roll alien
loot (60–95% by risk) or "the vault was feeling shy"; shows grant a
never-dinner curio; villager wins grant pantry rations ("winner's share").
Supplies, care packages, reputation, fans, and audience boons all exist.
**Ability unlocks, synergy hints, and knowledge dumps had no code path at
all.** The canon promise is real — the contests-r4 worker was not inventing
— and the blank sat in lever-9 territory. This run fills it.

## Lever played — the System prize lane (all numbers exact)

`src/js/contests.js`: the contest prize table now has two lanes. The
existing alien-loot roll is the ITEM lane. New: the SYSTEM lane, rolled
independently on a player win (a shy vault can still bring a System gift):

- **Ability offer** (weight 0.45): the System offers 1-of-3 abilities into
  the 6 slots via the real `abilityChoices`/`chooseAbility` path. Pool =
  `system_offer` abilities in tiers utility/wacky/underpowered/uncommon/
  rare/combat/social. **Excluded: vile, body_horror, overpowered** — the
  Static's dark deals and pact-tier power keep their own gates. Human
  skills are NEVER granted (pool is `system_offer` only = alien abilities;
  canon CANON.md lane rule). Category-biased lead pick: blood→combat tier,
  moot→social tier. Never tramples a pending offer; refused honestly when
  slots are full (falls through to the next lane).
- **Synergy hint** (weight 0.30): +1 real discovery attempt on an
  undiscovered synergy whose legs are all held (same prefix/path-aware
  leg-held grammar as `recomputeActiveSynergies`), through the real
  tease/unlock path — attempt 1 whisper, 2 shimmer+hint, 3 hero card
  (`unlockSynergy`). Prefers pairings already warming up (attempts 1–2).
- **Knowledge dump** (weight 0.25): identifies one random unidentified
  plant through the real `identifyPlant` path (celebration, audio, village
  learning, provenance "prize"). Facts only — no earthly SKILL is granted
  (herbal_remedy stays taught, never gifted).

**Numbers:** base 0.60, +0.10 high, +0.20 extreme, +0.10 hardened, cap 0.90
— the same risk-scaling grammar as the loot roll's fear-honesty move. Each
lane falls through to the next when impossible (slots full, no held pairing,
everything named). Tuning call (Steve 2026-10-07: make the call, document
it): 0.60 not 0.50, because canon says "Prizes must be worth the fear. A
contest you survive should change your game" — wins are rare (~1.2/run),
so wins are the throttle, not this roll.

**Villager prize deed** (both win paths — watch verdict and multi-take
co-winners): a televised villager win is a DEED — +3 XP on the deed-XP
track the contest belongs to (`_cxContestDeedTrack`: blood→combat,
endurance/forage→field, else→social). +3 is a full first rung for a nobody,
a nudge for a veteran. The existing grant path narrates its own
"◈ THE SYSTEM has been watching… Earned, not given." when a threshold fires.

New tele events: `prize_ability_offer`, `prize_synergy_hint`,
`prize_knowledge_dump`. Ontology rules added: `prize_lanes`,
`villager_prize_deed` (+5 provides entries). Validator: 74/74 green.

**Documented, not built (lever boundary):** item-evolution assists — the
fourth missing canon lane — live in the relic/item system, not lever 9.
Villager synergy discovery stays player-only (sim-abilities.md's documented
blank; not a small change).

## Proof

`scripts/test-contest-prize-lanes-20261011.js`: **52/52 green.** Deed-track
mapping (9/9 cats); offer fires 1-of-3, all unheld `system_offer`, no
vile/body_horror/overpowered, blood→combat lead bias, "PICK A TRICK"
narration, pending-offer and full-slots guards; synergy hint credits
attempts 1→2→3 through the real path ending in `SYNERGY DISCOVERED`
(peacemakers_voice); knowledge dump identifies via `identifyPlant` with
"prize" provenance and exhausts to false; roller fall-through (full slots
→ synergy hint, no dangling offer); pre-System-arrival gate; villager deed
feeds the combat track and lights patient_aim at threshold 3 with
"Earned, not given"; wiring proven against the source (metaProgression
`wrapHook`s `_contestEnd`, so the check reads the file, not the wrapper);
sense read: all three copy lines are System-voice, no template leakage.

**Regressions:** contests-clubs 18/18, contests-freshface 24/24,
synergy-hygiene 9/9, ontology 74/74 — all green.

## Before/after (identical seeds, god policy, 200d, 6 seeds)

Methodology: `scripts/sweep-abilities-lanes.js` (new harness: god policy +
lane telemetry). Baseline ran on PRISTINE code — `git stash push` of
src/js/contests.js, same instrument, same seeds; then popped and ran after.
The only difference between the two columns is the prize-lane code.

| Metric (god policy, 6 seeds) | Before | After |
|---|---|---|
| Lane prizes fired | 0 | **4** (ability 1, synergy 0, knowledge 3) |
| Player wins | 9 | 7 |
| Villager wins | 25 | 27 |
| Mean abilities held | 2.50 | 2.50 |
| Mean slots | 5.83 | 5.67 |
| Runs with synergy discovered | 2/6 | 2/6 |
| Mean synergy attempts | 1.50 | 1.50 |
| Mean resonance | 25.17 | 24.83 |
| Mean codex plants | 18.33 | **19.67** |
| Mean villager abilities | 36.17 | 34.67 |
| Median days survived | 55 | 60 |

Per-seed notes: seed 1337's ability offer fired and the policy took
**open_book** — a synergy leg (tells = lie_detector+open_book) now held in
the wild, i.e. the lane feeds the synergy ecosystem, not just the slot
count. Seed 7: 9 villager wins fed deed XP (villager abilities 45→47).
The synergy lane never fired in sims — no held pairing coincided with a
lane roll at 30% weight in 4 fires; the proof test proves the mechanic.

**Honest read:** the blank is FILLED (all three lanes exist, fire, and are
narrated) but the acquisition needle barely moves at 6 seeds: mean abilities
2.50→2.50. The throttle is wins (~1.2 player wins/run in ~55-day survival
runs), not the lane roll — win frequency is a lever-6 (contests) concern,
not lever 9. The lanes are reachable and honest; acquisition pace itself
still has no canon doc, and I did not invent one.

## Reachability verdict (updated vs sim-abilities.md)

- **Synergy mechanics: REACHABLE, still starved — but now with a second
  path.** Organic discovery unchanged (2/6, peacemakers_voice only). NEW:
  the synergy-hint lane is a real second acquisition path (proven
  mechanically; not yet observed in 6 sim runs — needs longer horizons or
  more wins).
- **6-slot economy: still decorative.** Slots reach 6, players hold 1–4.
  The prize lane adds ~0.2 abilities/run at current win rates. The slots
  are capacity waiting for content; the lanes are the first content pipe.
- **Unlock ladder: rungs still mostly empty.** Slot moments, trials,
  mentorship all fire; the ladder now has one more rung-feeder (contest
  wins) alongside the day-7 offer and trial gifts.
- **Knowledge: the dump lane works.** +1.34 codex plants/run. The earthly
  lane stays earthly — facts, not skills.

## Villagers act like people?

Villagers win contests constantly (25–27 per 6 runs — they are the show's
bread and butter). Before this run their prize was only rations; now a win
also moves their deed track and can light a first rung with the System's
"Earned, not given" announcement — the village SEES the System rewarding
their people on camera. Sense read from the narration log: "📺 The System
LIKED that. 'YOU. WINNER. PICK A TRICK — ON US. Choose.'" / "📺 SYSTEM:
'That thing you do — with the OTHER thing. The audience SAW it. Do it
again. We want the third one on camera.'" / "📺 SYSTEM: 'KNOWLEDGE DUMP. We
read the world so you don't have to. Lazy. Effective.'" — all System-voice,
all honest about what was granted. No robotic behavior introduced; no
existing villager routines touched.

## Village assessment (plain words)

Six villages, all village-lost by day 73 (median 60). The show is a real
weather system in these runs: villagers win far more often than the player
(27 vs 7), and the System's watching-grants now visibly reward televised
deeds — seed 7's village had villagers coming home from the cameras with
new abilities the whole run. The player side is thinner: only 7 wins in 6
runs, so the System lane fired just 4 times — one ability (open_book, a
synergy leg — the right kind of prize), three plant identifications. Who
thrived: televised villagers, who now get both rations and deeds. Who died:
everyone, to combat and hunger, same as the morning run. Missing: wins —
the binding constraint on every prize lane is that the player rarely wins
in a ~55-day survival run; that is lever 6's throttle to turn, not lever 9's.

## Files

- src/js/contests.js — `_cxPrizeLane`, `_cxPrizeAbilityOffer`,
  `_cxPrizeSynergyHint`, `_cxPrizeKnowledgeDump`, `_cxContestDeedTrack`;
  hooks in `_contestEnd` (player + villager win) and `_contestResolveOthers`
  (co-winners); ontology provides/rules entries
- docs/ONTOLOGY.md — regenerated by validator (74 systems)
- scripts/test-contest-prize-lanes-20261011.js — proof, 52/52
- scripts/sweep-abilities-lanes.js — god-policy sweep + lane telemetry
  (wins counted via `_cxWinnerShare`/`_contestEnd` wraps; works on pristine
  code for baselines)

Raw sweep JSON: /tmp/lanes-base-6seed-v3.json (pristine), /tmp/lanes-after-6seed-v3.json (with lanes).
