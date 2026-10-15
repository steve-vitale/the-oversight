# Simulator & Telemetry Audit — 2026-10-14

**Steve:** "Audit our simulator and its telemetry. This is the best tool we
have for measuring the impact our levers have, and answering how the game
actually goes, if any features are hiding behind a bug or dead code etc."

## Verdict

The **harness is faithful**:
- It runs the same code as the phone, in the same order.
- Silencing narration has no side effects.
- The display-only files it skips hold no game logic, with two small exceptions (§4).

The **measurements had real bugs**, now fixed (§3):
- Some numbers were truncated.
- One column was always zero.
- One damage instrument recorded deaths as survivals.

The **biggest problem is the bots, not the harness** (§2). They can't flee,
never use abilities, never hold a conversation, and most never answer the
Table. So every sim so far has measured a player who does about a third of
what the game offers.

---

## 1. New instruments (use them)

| Tool | What it answers |
|---|---|
| `SIM_CATCH=1` (any sim) | Every one of the ~4,500 empty `catch (e) {}` blocks reports what it swallowed. **Features silently throwing.** |
| `scripts/sim-audit.js` | Seeds × policies in separate processes → `evidence/<date>/sim-audit-<label>.md`: swallowed errors ranked by runs affected, plus **every named function that never ran** in any run |
| `src/js/telemetry-hooks.js` | New events: `table_entered`, `table_path`, `table_failed`, `table_won`, `ability_used`, `arc`, `scale_rank`, `synergy_active`, `ascension`, `village_lost` |
| sim default | Full telemetry (the 300-event cap is a phone-memory guard, not a sim need) |

Runtime: 32 runs × 150 days ≈ 1 minute on 4 cores.

---

## 2. What the bots can't see

Almost every policy is a copy of `competent` with additions, so anything
`competent` never does, almost no bot does.

**First coverage pass:** 8 policies × 4 seeds × 150 days. Only **59% of named
game functions ever ran**.

| Feature | In sims | Why |
|---|---|---|
| **Fleeing a fight** | Never actually exits | Real flee is switched off by default (`COMPETENT_DPS_RACE`); "flee" walks toward an edge, which doesn't exit |
| **Ability use** | 2 of 94 ability-engine functions ran | `competent` family never calls `useAbility` |
| **Conversation** | Opened, then left with zero exchanges | Held talks need `COMPETENT_TALK=1` |
| **The Table** | `tableScene` never ran in 32 runs | The main bots never reach regional rank or the food deeds; most never answer the Table prompt anyway |
| **Wave 3–5 counter verbs** (22) | Never | No policy uses them |
| **Relay / switchboard** | 0 of 27 dialogue functions | Never claimed |
| **Hunting, fishing, butchering** | Never | Meat only from traps and looting |
| **Camp, tent, storage, gardens, caches** | Never | — |
| **Titans / finale campaign** | 13/40 and 6/41 functions | The main bots never get far enough to fight titans |
| **Contest choices** | Always option 0 | Biases contest outcomes |
| **Table choice** | Always option 0 | This is why "Feared dominates" |
| **Ability offers** | Always the first card | Builds lean toward whatever is offered first |

Also: `kind` and `competent` produced **identical** results on the same seed.
In default settings the "kind" bot doesn't behave differently.

---

## 3. Measurement bugs (all fixed)

| Bug | Effect | Fix |
|---|---|---|
| Deaths read from the telemetry ring **after** the run | Long runs lost **55–67% of deaths**, including player deaths | Deaths captured live in `runDays` |
| `TELEMETRY_FULL` leaked between loads | Inconsistent truncation | Set per load; full by default |
| `verbs/d` read a renamed field | Always printed 0 | Now `delib/d` (`meanDeliberatePerDay`) |
| Death causes merged player and villager deaths | Couldn't attribute player deaths | Keyed `player:<cause>` / `<kind>:<cause>` |
| `tab%` meant "invited", not "reached" | Overstated Table reach | Renamed `inv%`, added `sat%` (entered) |
| Bots drew from the game's `Math.random` | A policy change shifted the game's luck, which confounded lever A/B | Bots get their own seeded stream |
| **`dmg-audit` read HP after `tbEnd`** | **Deaths recorded as full-HP survivals; player damage always 0** | Snapshot before `tbEnd`; player strikes counted |

### Retraction: the r16 damage-math verdict

`sim-scale-wall-r16-dmgmath.md` said "103/104 scholars survive" and "the wall
is not player damage math". Re-run with the corrected instrument (same
command, belongseek + leadcourt, seeds 11/22/33/44, 150 days):

| | Old instrument | Corrected |
|---|---|---|
| Fights | 104 | 91 |
| Bearer died | 1 | **25 (27%)**, 24 of them successions |
| Player damage dealt | 0 (always) | 9,491 |

`sim-courtkill-b.md` used "103/104 survive" to lower the flee threshold from
35% to 12%. **That rationale is void.** Because bots can't actually flee in
default runs, the threshold change also had little measurable effect either
way.

---

## 4. Hidden bugs the instruments found (fixed)

Each threw in every run that reached it, and was silently swallowed:

| Bug | Feature that never worked |
|---|---|
| `game.js` "villagers wrong about plants": `R is not defined` (354× in 32/32 runs) | Villagers teaching you wrong plants, sometimes deliberately |
| `villager-agency.js` rescue: `_j is not defined` | Rescue gossip spreading |
| `alienPlayers.js` beam kill: `this.tbKill` never existed | People killed by alien beams never fell properly or got a death record |
| `game.js` study: `this.spendDayPart` never existed | Studying cost no time |

**After the fixes:** 4 swallowed-error sites remain.
- Two are display-only (`.px` on a null map in node).
- One is `localStorage` (absent in node).
- One is rare and still open: keepsake flashback text, `progression.js:1033`, 2 of 32 runs.

**Fidelity notes:**
- `app.js` charges the 20 kcal swim cost in the UI, so bots crossing water skip it.
- The treat button grants ability XP in the UI, so bots' treatments don't level abilities.

---

## 5. What's next: the bot (Steve: "Build a bot")

A **capable** policy, built on `competent`, in this order (most invisible game first):

1. **Real fleeing** on by default, so death rates mean something.
2. **Abilities in combat:** set up, then cash in, using the existing `actions` data.
3. **Answer the Table:** take the seat at day 90+, and pick a path by fit, not `options[0]`.
4. **Varied choices:** contests, ability offers and Table paths picked by a simple scoring rule, so outcomes aren't biased to option 0.
5. **Hold conversations** (the engine already exists behind `COMPETENT_TALK`).
6. **Climb the scale ladder and throw feasts** (`leadcourt` / `feastscale` already do parts), so the Table is reachable.

Then a standing **multi-seed baseline** (≥8 seeds × ≥3 bots) that every lever
change is compared against, with the new milestone events as the outcome
columns.
