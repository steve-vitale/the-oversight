# Wave 5 Signature Mechanics — sigW5.js

**Date:** 2026-10-11
**Module:** `src/js/sigW5.js` (~1500 lines)
**Proof:** `scripts/test-sigW5.js` — 144 assertions, green across SEED=1,2,3. RED-first: MECHANIC=off gates (0 passed, 1 failed, exit non-zero).
**Pattern:** Follows `src/js/sigW3b.js` exactly (IIFE, ontology header, MonsterBehaviorHooks, PROOF SWITCH, Game.tb* verbs, sigW5CombatButtons(), sigW5FieldMonster()).

## The 8 Mechanics

### 1. Cancellation (`cxStamp`) — fights your existence in the show
Descends over 3 turns (telegraphed: "STAMP DESCENDS — 3"), then FALLS: un-teaches your 2 highest-level **System abilities** (never human skills — the HUMAN SKILLS ≠ ALIEN ABILITIES law), silences favor for 2 rounds, and treats feast buffs as "buffs" (cleared). Counter: **GO OFF-SCRIPT** (`tbCxOffScript` — do an unscripted action; it can't cancel what's not in the script) or **SPEND FAVOR** (`tbCxSpendFavor` — audience votes override the stamp). Cancelled abilities return at fight end via the `tbEndCheck` wrapper.

### 2. Editor (`edCut`) — cuts your last turn, your position, or an ally
Every 3rd turn, rotating: **turn** (your last turn's effects undone), **position** (reset to fight-start), **ally** (removed to the cutting-room floor for 3 rounds, then auto-returns). The target is shown a round ahead via film strips; the floor is a marked tile; retrieve with `tbEdRetrieve`. Counter: **CONTRADICT** (`tbEdContradict` — jam one cut by asserting continuity). One cut at a time, always telegraphed.

### 3. Rerun (`rrTake`) — every 5 rounds the fight RESETS
Positions + HP to fight-start (both sides), take number increments, adaptation +10% (both dealt and taken). **Messages persist**: `tbRrMessage` ("rigging" / "left" / "big") writes margin notes that survive resets — "rigging" exposes it (×1.5, ×2 on the exposed turn), "left"/"big" are mechanical (dodge / damage). Counter: leave messages, or win within 5 rounds (DPS race).

### 4. Spoiler (`spAnnounce`) — announces true future events
"IN THREE ROUNDS, YOU WILL BLEED." The spoiler is a passive narrator; its attack IS the announcement coming true. At zero, the **Leaked Ending MANIFESTS** through the hook: [75,105]×(1+0.12×weight), undodgeable (you can't dodge a prophecy). Weight grows on each fulfillment. Counter: **FULFILL CHEAPLY** (`tbSpCheapFulfill` — 5 damage on your terms vs 75+, sates it for 5 rounds) or **BINDING QUESTION** (`tbSpAsk` — forces a harmless "YOU WILL BLINK" announcement, 5-turn cooldown, no weight). Defiance does not make it a liar — announced things happen.

### 5. Timeslot (`tsReschedule`) — reschedules the venue
3-turn venues, strictly worsening: green room (0.75×, safe) → soundstage (1.0×) → backlot (1.25×, falling lights) → live audience (1.5×, hecklers) → sweeps week (2.0×, pyro). The TV guide highlights the next venue a full round ahead. Rescheduling consumes the turn. Counter: **OWN THE VENUE** (`tbTsOwnVenue` — claim tiles; hazards skip you until the next reschedule) or **be boring** (2 consecutive passive turns = bumped to daytime TV, 0.5×, but the show hates you).

### 6. Nielsen (`niWatch`) — ratings 0-100
Starts at 40. Flashy moves (strikes, abilities) raise ratings; boring moves (wait, basic actions) lower them. The **gaze** deals [50,80]×(0.5+r/100), undodgeable — at 100 ratings that's [75,120]; at 0 the show **signs off** for 2 rounds (no gaze, then reopens at 20). Counter: **FIGHT BORING** (wait it out — slow but starves the gaze) or **PLAY TO CAMERA** (`tbNiCamera` — +15 ratings but sates the next gaze; a trap for the greedy).

### 7. Finale (`fiFinale`) — 3-round countdown to [150,200]
Declares once per fight at 50% HP or round 4: "THE FINALE. THREE ROUNDS." Each round it **grows** (+5% to all its hits, visible). At zero, the **TITLE CARD FALLS**: exactly [150,200], undodgeable, via the shared `tbDamage` with `sigW5NoMult` (telegraph honesty — the card says [150,200] and deals [150,200]). Deaths flow through `maybeCheatDeath` (doom ruling). Counter: **SACRIFICE** (`tbFiSacrifice` — feed it an item, really consumed, or a food-memory, −250 kcal) or kill it before zero.

### 8. Network Note (`nnNote`) — issues notes each round
Announces the memo text a full round ahead ("THE HERO SHOULD BE MORE VULNERABLE"), then applies: vuln (+25% taken), lasers (+25% monster damage), tired (−25% your damage), drama (+25% your damage taken...). **Fragile** by design (lowest wave-5 HP band). Counter: **kill it first**, or **FEED BAD NOTES** (`tbNnBadNote` — "smaller", "more ad breaks", "quieter": the memo writes it down, applies it next turn, then **REVERTS** it the turn after — "REVERT THAT." The trick gets a one-turn window).

## Fight Transcript 1: Finale (sacrifice counter)

```
M: 🌌 "PREVIOUSLY ON..." The sky replays your life. It has been watching.
   "THE FINALE. THREE ROUNDS." The title card rises, enormous.
   (Unavoidable [150,200] at zero. FEED IT something real — or FINISH IT.)
--- player sacrifices a memory ---
P: 🎁 You feed it a memory — birthdays, probably. It tastes like cake.
   (−250 kcal of carried food. "...SATISFIED." The finale passes.)
M: 🌌 It GROWS — visibly. (x2 — its hits land +10% harder.
   You can SEE the finale coming.)
```

**Sense-read:** The declaration is clear (3 rounds, [150,200], two counters named). The sacrifice is specific (a memory, birthdays, cake — not generic "you lose 250 kcal"). The growth is visible and quantified. The player knows exactly what's happening and what to do. ✓

## Fight Transcript 2: Spoiler (cheap fulfill + binding question)

```
M: 📢 "IN THREE ROUNDS, YOU WILL BLEED." The poster changes — it is
   showing the ending. (Fulfill it CHEAPLY on your terms, or ask a
   BINDING QUESTION. Announced things happen.)
--- player fulfills cheaply ---
P: 🤏 You prick your thumb — five drops, deliberate. "...AND THEN THEY
   BLED," says the voiceover, quietly thrilled. Fulfilled — on your terms.
   (−5, not −75. Sated: it will not announce for a while.)
--- player asks a binding question ---
P: ❓ "WHAT HAPPENS IF I ASK NOTHING?" The voiceover falters. "...UNLESS—"
   It must answer true, and the answer binds it: "IN TWO ROUNDS, YOU WILL
   BLINK." (It must announce it. A wasted cycle — blinking feeds nothing.)
P: (Its current weight: 1 — +12% damage. It told you because you asked right.)
M: 📢 "...AND THEN THEY BLINKED." The voiceover tries to sound ominous about
   blinking. It cannot. (Too trivial to feed on — no weight.)
```

**Sense-read:** The announcement names the counterplay inline. The cheap fulfill is visceral (thumb-prick, five drops) and the math is explicit (−5 not −75). The binding question is a genuine lateral-thinking reward — the voiceover "falters", the blink is "too trivial to feed on". The weight is transparent. The horror (announced things happen) is stated, not implied. ✓

## Titan Nominations

**1. Finale (obvious inaugural titan).** The countdown-to-doom is a raid-scale mechanic by nature: 3 rounds of visible escalation, a party-wide [150,200] title card, sacrifice-or-kill counterplay that scales with group coordination (who feeds it? who DPS-races?). The "previously on" recaps and growth are already theatrical enough for a titan arena.

**2. Nielsen.** Ratings as a raid mechanic: the whole raid's flashiness feeds a 0-100 meter that empowers the boss's gaze. Coordinating "everyone fight boring" vs "burst during sign-off" is a genuine raid-level decision. The sign-off (2 rounds of no gaze at 0 ratings) is a natural burn phase.

**3. Editor.** Cut mechanics at raid scale: cutting a player's last turn (undoing their burst), cutting positions (resetting the tank), cutting an ally (removing a healer for 3 rounds). The cutting-room floor as a marked tile the raid must play around. Contradiction as a raid-wide interrupt rotation.

**Not nominated:** Cancellation (single-target un-teaching doesn't scale), Rerun (reset is anti-raid), Spoiler (prophecies are personal), Timeslot (venue is already raid-wide by default), Network Note (fragile by design — it's the add, not the boss).
