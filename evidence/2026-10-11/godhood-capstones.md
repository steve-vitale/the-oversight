# Godhood Capstones — evidence (2026-10-11)

Steve 2026-10-11: god paths "should be one of the biggest needle moves in the game" — plus the visual evolution ceremony and permanent mythic transformation.

## What was built (staged, pending worktree slot for landing)

- `godhood.json` — 10 godhood definitions: kit (real ability IDs — two doc abilities didn't exist: `forage_identification`→`animal_ken`, `pattern_recognition`→`eagle_eye`, both documented), key synergies (real IDs — `sun_garden`, `rain_catcher` used where doc names didn't match), tier-4 capstone items (`lootTier: 4` field), capstone verb + cost + weakness, recognition System line, knowledge-gated hint, mythic identity.
- `godhood.js` — engine module: detection (`checkGodhood`, `godhoodCloseness`), 5-beat played ceremony (`recognitionCeremony`), 10 capstone verbs, 10 mythic SVG sprites, table bargaining hook (`godhoodBargaining` +3/leverage per godhood).
- `test-godhood-capstones.js` — RED (1/1: not in repo) → GREEN (219/219).

## Proof

- RED: `node test-godhood-capstones.js` → 1 pass (godhood absent from repo, as expected).
- GREEN: `node test-godhood-capstones.js --green` → **219 pass, 0 fail**.
  - (a) All 10 completions detected from real state (abilities + synergy + item); every required ID verified against abilities.json / synergies.json / items.json.
  - (b) Recognition: 5 beats in order stillness→witnesses→system→change→price; System speaks once; broadcast cuts in (`ascension` kind); fires exactly once.
  - (c) Verbs measured: shepherd echo 3 rounds/final; apex first-strike; garden 50+ mouths for 200 kcal; army 450 dmg uncapped retaliation; seer lies fail; market summon + audit tax; farstrider 3 nodes/150 kcal; between 1 hit negated; ward 100 dmg → 1 HP, 3 strains = collapse.
  - (d) Every capstone has cost + weakness; table +3 bargaining per godhood.
  - (e) Knowledge-gated: 1/6 kit = silent; 4/6 = System hint (capstone unnamed); hint fires once.
  - (f) All 10 mythic SVGs valid 32×32, no background rect; ontology header present.

## Ascension moments (sense-read)

### 1. The Shepherd of the Dead
> Everything stops. Not all at once — conversations trail off, a dropped spoon rings too loud. The dusk light does something it has never done. Every face turns toward you.
> Mara: "What... what are you now?"
> SYSTEM: "LADIES AND GENTLEMEN AND THINGS THAT AREN'T! The audience has a NEW WORD and it's SHEPHERD! Not of sheep! OF THE DEAD! They fall! They GET UP! Somebody tell the gamblers the roster just got LONGER!"
> The fallen stir. Not all the way. Just enough. Look at your hands. Look at what the light does around you now. You are The Shepherd of the Dead — Wreathed in Echoes. A robed figure in deep indigo, three pale spirit-wisps orbiting — the fallen, visible, still marching.
> Godhood demands its price, and the price is not hidden: Once per fight. Each echo raised is a final death — the village remembers who you spent. Alone, you're just a talker. No allies, no echoes, no godhood.

Reads: the stillness lands (dropped spoon), Mara's line is human-scale fear, the System is unhinged Claptrap, the price is stated aloud. The weakness ("alone, just a talker") keeps it from being a solo power fantasy.

### 2. The One-Person Army
> SYSTEM: "THEY'RE BLEEDING! THEY'RE LOSING! THE GAMBLERS ARE CASHING OUT! ...Why is it SMILING?! OH NO. OH NO NO NO. FOLKS, THE DAMAGE ISN'T A COST ANYMORE — IT'S A WEAPON! WE HAVE A ONE-PERSON ARMY!"
> Your blood hits the ground and the ground flinches. ... You are The One-Person Army — Blood-Forged. A massive crimson silhouette, weapon fused to the arm, veins of darker red. Bigger than a person. The rage, given a body.
> Godhood demands its price: Once per fight. You have to SURVIVE to deliver it — die first and the pain dies with you. Anything that doesn't bleed — beams, politics, starvation — ignores your whole build.

Reads: the System's mid-call reversal (cashing out → OH NO) is the show. The cost is real (survive first). The weakness is total in the wrong fight — beams ignore you.

### 3. The Undying Ward
> Someone else's blood is on your hands. It was never yours. It is now.
> SYSTEM: "THEY'RE DOWN! THE MEDIC'S DOWN! ...Why are they STANDING? THAT WOUND WAS ON THE OTHER ONE! FOLKS, THE WOUNDS ARE MOVING! THEY'RE — THEY'RE TAKING THEM! We have an UNDYING WARD!"
> You are The Undying Ward — Radiant Guardian. A figure in white-gold light, shielding wings half-unfurled, a soft halo. Others' wounds visible as light on the skin — carried, not hidden.
> Godhood demands its price: You take the damage — really. And every wound you carry makes you the priority target, which you already were. You're the priority target, and you can't heal yourself mid-fight as easily. Everyone aims at the light.

Reads: the opening line (blood on hands) is horror before the System explains it. The mythic form wears the cost visibly (wounds as light). The weakness compounds the cost — the more you save, the more you're targeted.

## Landing instructions (for parent — needs a worktree slot)

1. `bash scripts/worktree-register.sh godhood-capstones <run-id> "godhood capstones"`
2. Copy into the worktree:
   - `~/workspace/godhood-staging/godhood.json` → `src/data/godhood.json`
   - `~/workspace/godhood-staging/godhood.js` → `src/js/godhood.js`
   - `~/workspace/godhood-staging/test-godhood-capstones.js` → `scripts/test-godhood-capstones.js`
3. Wire-in (small edits in worktree):
   - `index.html`: add `<script src="src/js/godhood.js">` in load order (after game.js deps — it only needs `globalThis.Scattering`; safe near table.js).
   - `Game.init` (or data load): fetch `src/data/godhood.json` into `Scattering.GODHOODS`.
   - `src/js/app.js` `villagerSpriteHtml`: if the villager is the player and `Godhood.playerMythicId(scholar)` returns an id, render `Godhood.mythicSprite(id)` instead of the person sprite.
   - Per-fight: call `Godhood.resetFightVerbs(scholar)` at fight start; per-day: `Godhood.resetDayVerbs(scholar)` at dawn.
   - After build completion check (e.g., in the ability/synergy recompute path): `const newGods = Godhood.checkGodhood(scholar)` → for each, gather 2-3 witness villagers (personality-driven lines) and call `Godhood.recognitionCeremony(Game, id, witnesses, dayPartName)`.
   - Hint path: when `godhoodCloseness(sch, gh).close && !complete`, call `Godhood.hintBeat(Game, gh.id)` (once per godhood).
   - Table: add `Godhood.godhoodBargaining(scholar)` to bargaining strength.
   - Capstone verb call sites: raiseEcho (ally death in player-present fight), chooseTerms (pre-fight UI), feedMultitude (action), turnPain (player action in fight), noLiesCheck (deception/gossip/monster-ambush gates), summonMarket (action), walkHorizon (travel), phaseOut (on hit), takeWound (ally damage redirect).
4. `bash scripts/safe-commit.sh` (positional message), ontology regen, merge --ff-only (unpiped exit), release.

## Caveats

- Capstone verb CALL SITES are not yet wired (module exposes the verbs; the game must call them). The proof test exercises the verbs directly against state — the wiring is listed above.
- The ceremony's witness lines need the caller's villager personalities (module takes `witnesses` param — the game supplies real faces).
- Fan reactions per FANS.md: fans aren't implemented yet (noted in prior summary) — the ceremony fires the broadcast frame; fan personas hook in when built.
- Death/respawn reset: `scholar.godhood` lives on the scholar — a new villager gets a fresh scholar object, so the mythic form resets naturally. Worth a playtest-loop verification.
