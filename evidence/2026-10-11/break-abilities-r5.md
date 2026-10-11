# Break-it: abilities & godhood, round 5 (2026-10-11)

Target: abilities & godhood (target index 12 this run). Hostile-player attacks
against the ability/synergy/slot/revive engine, going deeper than rounds 1–4
(evidence/2026-10-11/break-abilities-r4.md,
evidence/2026-10-10/break-abilities.md, break-abilities-r2.md — not redone).

Canon read first: docs/CANON.md, docs/ENDGAME-BUILDS.md (ten godhood builds),
docs/PROGRESSION.md (wave ledger, "unkillable means unkillable", feast surge),
docs/SYSTEMS.md, docs/DISEASES.md. No abilities-specific canon doc exists
beyond these — noted, nothing invented.

## Verdict: BROKE + FIXED (6 catches + 1 sub-catch), rest held

Commit: (pending — see report). Files: src/js/contests.js, src/js/ledger.js,
src/js/game.js, src/js/progression.js, src/data/abilities.json (1-line copy),
new proof test scripts/test-abilities-breakit-r5-20261011.js.
Proof: 23/23 × 6 seeds (20261011, 7, 99, 42, 1234, 777); FIX=0 replays the
old behavior and goes red on exactly the 6 catch assertions. Ontology gate
green (63/63). Adjacent suites: r4 proof 38/38 green, contest r14 38/38
green, phoenix-rework 64/64 (2 pre-existing fails, identical on pristine
HEAD — verified via git stash).

## CATCHES (all fixed, proven)

### 1. Contest deaths bypassed all cheats (contests.js)
`G._contestDie`'s player branch ran `playerDeath('contest')` directly — the
arena-fight path (real damage to scholar.health) AND the narrative DIE
terminals (the Maw, a verdict) killed the Unkillable with zero cheat
attempts. Round 4 fixed the hurtVillager branch and tbEnd('lost') but never
touched the contest resolution itself. Fix: zero the pool (so narrative
deaths are answerable deaths too) and run `maybeCheatDeath()` first,
violent cause — "unkillable means unkillable" (PROGRESSION.md). Death still
sticks honestly when no cheats are held (proven: succession happens).

### 2. arenaDeath bypassed all cheats (ledger.js)
Legacy `arenaDeath()` called `playerDeath('the arena')` with no gate. No
live callers, but the invariant is that no playerDeath site bypasses the
gate — now checked.

### 3. Trial System gift skipped on-acquire costs (progression.js)
`completeTrial()` pushed the gift but never called `abilityOnAcquire` —
the only grant path that skipped it. A trial-granted chitin_skin gave +30
armor with ZERO of its documented trust cost; a trial-granted hive_mind
never revealed the map its card promises. Fix: the gift runs
`abilityOnAcquire(def.id)`, like every other grant path.

### 4. Pact's Static gift skipped on-acquire costs (game.js)
The pact give-branch pushed the gifted overpowered ability without
`abilityOnAcquire` — a gifted hive_mind arrived with no map reveal and no
trust cost. Fix: `abilityOnAcquire(gain.id)` after the gift lands.

### 5. chitin_skin copy lied about the price (abilities.json)
The card said "-20% trust"; the engine applies -5 flat (abilityOnAcquire's
trustAll). Copy now matches the engine: "-5 trust".

### 6. Successor inherited the old body's spent budgets (ledger.js)
The mantle transfer reset the blood-price budget ("new body, no old
afflictions") but NOT molt's weekly cycle, second_wind's day, or the
day-part heal/echo/time-skip/scream counters — the successor stepped up on
a fresh body with the corpse's spent counters. Fix: all body budgets reset;
the office's progression (slots, arc, integration, ledger, Codex) still
passes. Sub-catch (sibling sweep): a mid-rage death handed the successor a
live `rageActive` (undying_fury reads rageActive.rounds — a free full-restore
the new Bearer <redacted> earned); the old body's `feastBuff` (metabolic state)
also carried over. Both now die with the body.

## SIBLING SWEEP
- All 5 player grant paths audited: chooseAbility (calls on-acquire),
  trial gift (fixed), pact gift (fixed), debug-scenario war_cry grant
  (war_cry has no on-acquire effects — clean), app.js debug-panel grant
  (dev-only; its `.includes(id)` string-vs-object check always misses and
  pushes a raw string id — debug tool, noted not fixed).
- Death-gate audit: every `playerDeath(` site in src/js is now cheat-gated
  except debug-scenarios.js:1014 ("the mantle passes" — a dev tool for
  testing succession; firing cheats there would defeat its purpose.
  Documented as intentional, not a catch).
- maybeCheatDeath cause coverage: every caller passes a recognized cause
  (starvation / disease / violent default); spite-ration gating holds.

## VERIFIED HELD (attacked, resisted)
- **Save/load budget honesty**: full JSON round-trip — spent cooldowns,
  weekly/daily budgets, wound counters all persist on scholar. No
  save-scum refill. (Proven: set spent, round-trip, still spent.)
- **Learn→drop→relearn farm**: closed by design — no player-facing
  loseAbility/forgetAbility exists; the only abilities-array removal is
  pact's involuntary random take.
- **Death-gear duplication**: molt destroys equipped gear (no corpse, nothing
  to duplicate); second_wind keeps gear (no corpse); phoenix keeps the
  bearer's gear and ash-piles only the victim's; real death packs the corpse
  once (dedupe by item id). No path duplicates gear.
- **Practice/stat caps**: hard cap stat 10 (human ceiling), rising
  thresholds (8/12/16/20/24), practice only from real actions (forage,
  fight, dodge — each costs time/calories/risk); ability levels cap at 3.
- **NPC ability budgets**: fieldFights translates NPC field_medicine as
  once-per-fight (documented as the honest off-screen unit of "once per day
  part"); NPC grant kits can't award blood_magic/field_medicine/herbal_remedy
  at all, so no ungated NPC activation path exists.
- **Modules wired**: abilityActions.js, modifiers.js, progression.js,
  statusEffects.js all in index.html (Alien Players lesson re-verified).

## Design calls made (Steve: figure it out yourself; overrule welcome)
- Contest narrative deaths (Maw, verdict) are real deaths the cheats can
  answer — zeroed the pool before gating, per "unkillable means unkillable."
- Debug-scenario mantle death stays ungated (dev tool, not a game path).
- Body budgets (molt week, second_wind day, day-part counters, rage,
  feastBuff) reset on succession; office progression passes. The feast buff
  is metabolic, not office — it dies with the body.
- chitin_skin copy changed to match the engine (-5 trust), not the reverse.
- No [needs-eyes]: no feel/UI/combat changes — all fixes are engine-honesty
  and state hygiene, invisible unless you're reading the trust ledger.

## Proof test
scripts/test-abilities-breakit-r5-20261011.js — 23/23 × 6 seeds, FIX=0 red
on exactly the 6 catch assertions. Includes a sense-check that reads the
contest cheat narration back ("SECOND WIND: you should be dead. You
refuse." after the death-reel beats — reads as the cameras catching the
refusal, not a glitch).
