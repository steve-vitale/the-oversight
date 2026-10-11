# Break-it: abilities & godhood, round 4 (2026-10-11)

Target index 11 (the file said 12; the brief assigned 11 — abilities & godhood).
Hostile-player attacks against the ability/synergy/slot/revive engine, going
deeper than rounds 1–3 (evidence/2026-10-10/break-abilities*.md; commits
e4cc8170, b384ed52, 8ca3a4ce — not redone).

Canon read first: docs/CANON.md, docs/ENDGAME-BUILDS.md (six godhood builds),
docs/PROGRESSION.md (XP/levels, wave ledger, "unkillable means unkillable"),
docs/SYSTEMS.md (ability/modifier tables). No abilities-specific canon doc
exists beyond these — noted, nothing invented.

## Verdict: BROKE + FIXED (6 catches, one with a sub-catch), rest held

Commit: b8c406d0 [needs-eyes] (src/js/game.js +99/-12, new proof test).
Proof: `scripts/test-abilities-breakit-r4-20261011.js` — 38/38 × 6 seeds
(20261011, 7, 99, 42, 1234, 777). Ontology gate green (63/63 systems).
Adjacent suites: phoenix-rework 64/64 (2 pre-existing fails, identical on
pristine), phoenix-gear crash pre-existing, combat break/break2/break3 +
r2-doubleko + r2-hp-routing all green, abilities-breakit-r3 23/23 green,
abilities-knowledge 36/36 (3 pre-existing tidecaller fails, identical on
pristine), combat-break-honesty 1/1 (pre-existing feastBurn-retired fail).

## CATCHES (all fixed, proven)

### 1. Pending phoenix link held EVERY death — the hold was a lie (game.js)
`maybeCheatDeath()` opened with an unconditional
`if (this.state.phoenixLink) return true`. A VILLAGER's pending link therefore
"held" the PLAYER's death: the player's own molt/second_wind never fired
(uses preserved, death "held"), `phoenixPlayerTrigger()` silently swallowed
their clause (`return true`, no narration, no burn), and then `tbEndCheck`
saw p.hp=0 and ran `tbEnd('lost')` → `playerDeath('combat')` anyway. Worst of
all worlds: the held promise was broken AND the cheats were skipped.
Fix: the hold covers only the link's own bearer
(`_pl.bearerIsPlayer !== false`). A villager's link no longer holds your
death — your cheats fire normally, per the codebase's own "busy fire" rule
(phoenixVillagerTrigger: "the clause is spent against a busy fire, the death
proceeds normally, honestly").

### 1b. Busy fire now honest (game.js)
`phoenixPlayerTrigger()`'s silent `return true` became a narrated refusal:
"Your phoenix clause stirs — but the fire is already holding [X]'s death.
It lets this one through. (The clause is not spent — the fire was busy.)"
Returns false; the death proceeds through the normal cheat order.

### 5. tbEnd('lost') finalized a held death (game.js)
With the player's OWN link pending (struggle from an out-of-combat trigger,
then re-entering combat and dropping), `maybeCheatDeath` returned true with
p.hp=0 and `tbEnd('lost')` ran `playerDeath('combat')` — killing the player
mid-struggle and orphaning the link onto the successor (playerDeath never
clears state.phoenixLink: the new scholar inherited a pending link and was
near-immortal until the dawn fuse killed them for the old link).
Fix: `tbEnd('lost')` skips playerDeath while the player's own link is pending
("the fight is lost; the fire's to decide") — the struggle/fuse resolves it.

### 2. Expedition death bypassed all cheats (game.js)
`returnToVillage()`'s `else if (s.health <= 0)` called
`playerDeath('the expedition')` directly — the only death path with no
`maybeCheatDeath()`. The Unkillable died on the road with zero cheat
attempts, contradicting PROGRESSION.md ("Doom deaths trigger
phoenix/second_wind like any death — unkillable means unkillable").
Fix: `if (!this.maybeCheatDeath()) this.playerDeath('the expedition')`,
mirroring the pit-trap precedent (violent cause → spite-ration semantics kept).

### 3. Contest/field damage bypassed all cheats — plus a shadow health pool (game.js)
`hurtVillager()`'s player branch called `playerDeath(cause)` directly (the
arena path already checked via tbEndCheck). Worse, it burned damage against
a shadow `v.health[vid]` pool (default 100) disconnected from
`scholar.health` — a player at 5 HP soaked 90 contest damage, and a lethal
shadow hit ran playerDeath with s.health still 100 so the cheats (which read
s.health) could never fire. Fix: the player branch now damages the real
`s.health`, syncs the shadow pool for healer-round readers, and runs
`maybeCheatDeath()` before playerDeath. (The shadow-pool split itself is a
deeper contest-system question — flagged, not redesigned.)

### 4. Strike multipliers died after round 1; narration lied (game.js)
`combat.strike_damage` was resolved ONLY inside the `if (f.round === 1)`
block (wired 2026-10-05 for patient_aim). Adrenaline Control (×1.3^level),
Cornered Fury (×1.25), knowledge (improvise_weapon ×1.3) and relic
multipliers — none carrying a round condition in data — silently stopped
after round 1. And the `if (paMult > 1)` narration said "PATIENT AIM: first
strike, doubled." for the whole generic multiplier, even when the player
didn't hold patient_aim. Fix: the generic target resolves every round
(`_r1 ? {round:1} : {}` — patient_aim's own `condition: round:1` still gates
it via the engine); narration names Patient Aim only when held (and notes
pile-on when other multipliers contribute), otherwise "Your strikes land
harder. (×N training)". Balance note: sustained brawler ceiling rises
(adrenaline L3 ×2.197 × cornered_fury ×1.25 ≈ ×2.75 every round, +patient_aim
×2 opener) — the data always promised this; the engine wasn't delivering.
Steve can tune the numbers; the honesty is fixed.

## VERIFIED HELD (attacked, resisted)
- **blood_magic infinite engine**: wound gate holds — 2/day-part cap, body
  refuses at 50 wound, knits exactly 10/night (no accelerant anywhere),
  maxHealth wound-aware, all heals (field_medicine, items, rest, eating)
  clamp to wound-aware max. Sustainable ≈1 use/day (+500 kcal) — min-maxing,
  not infinite. No HP-restoration source touches bloodPriceWound.
- **Synergy stacking math**: `(base + add) * mul`, multiplies chained —
  documented design ("broken builds welcome"). Level scaling ×(v^level)
  capped at L3. 6-slot ceiling ≈ ×2.75 sustained (discoverable synergies
  only — ringcraft/trade_of_blows/borrowed_surge have dead legs). Bounded,
  slot-limited, not infinite.
- **6-slot economy**: chooseAbility, pact gift, trial gift all enforce
  `abilitySlots()` (20→2/35→3/50→4/65→5/80→6). No grant path exceeds 6.
- **Dead-17 tripwire**: exactly the r3 set (7 trial + 5 practice + 5 granted),
  no grant path, no UI surface, no teases. Unchanged.
- **Undiscoverable-20 tripwire**: exactly 20 (fixpoint over synergy-legs,
  skill:, tech:). Teases require all legs held → never tease. Unchanged.
- **blood_tracker**: discoverable (tracker+game_sense) but mechanically void
  (modifiers: [], zero code reads) — unchanged, still pending Steve's call.
- **Phoenix zero-villager**: death sticks honestly (maybeCheatDeath false).
- **Modules loaded**: modifiers.js, abilityActions.js, progression.js all in
  index.html (Alien Players lesson verified).
- **Godhood honesty**: Brawler kit fully assemblable (adrenaline_control via
  firefighter/police_officer/etc. occupations despite trial unlock type);
  Undying Fury (full restore only with live rageActive), Crimson Circuit
  (Blood Price 7 + healing ×1.3), Cornered Fury (×1.25) all fire as
  documented. Survivalist: Refuses Death (2×/day), Perfect Chrysalis (+25
  max HP, stacks additively with survivor +10) fire — but iron_stomach is
  dead (trial, no grant), so the canon kit is unbuildable as documented
  (known tripwire, not redesigned).
- **Gear honesty (spot-check)**: worldbreaker_maul +120 (weapon.bonus wired),
  bloodplate protection 40, worldroot_plate protection 60 — base stats
  honest. The evocative specials ("shockwave frightens", "+1 damage per 2
  HP lost", fullBody) have zero code refs — copy promises unbuilt mechanics.
  Documented as content gap, not built (out of break-it scope).

## Design calls made (Steve: figure it out yourself; overrule welcome)
- Busy-fire: player's clause NOT spent (villagers' is revoked because they're
  dying anyway; the player's is a persistent 6-slot ability).
- Held-death in tbEnd('lost'): fight lost, death undecided — the link
  resolves it, not the arena.
- hurtVillager player branch: damage the real pool (shadow pool was the lie).
- Strike multipliers every round (data has no round condition except
  patient_aim's own) — numbers now match the data's promise.

## [needs-eyes]
Combat feel: brawler strike multipliers now apply every round (sustained
damage up where the data always promised it); Patient Aim narration changed;
phoenix busy-fire has a new narration beat; contest damage now lands on real
HP (contest lethality is honest now — a low-HP player can die in a contest
where the shadow pool used to protect them).
