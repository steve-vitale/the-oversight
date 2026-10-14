# God-Path Build Plan

> **⚠ ON HOLD (2026-10-14), pending Steve's answers in
> `evidence/2026-10-14/opus-assumption-review.md` §5.** That review found:
> - the brief this plan rests on is a paraphrase, not Steve's words
> - Phase 1's gear makers don't exist (no shield item, no block action)
> - sim bots never use abilities, so the sim targets can't measure anything
> - the Table doesn't read the build at all
>
> **Safe to do now:** the codex bug fix (Phase 0). Everything else waits.

**For:** the coding agent (Muse) building the god-path system.
**Design source:** `evidence/2026-10-14/opus-godpath-proposal.md` (v2). Read §0–§9 once before starting.
**Brief:** `evidence/2026-10-14/opus-brief-ability-system.md`.
**Current phase:** `scripts/godpath/phase.json`.

This file is the single source of truth for *what to build next* and *how to
know it's done*. Keep it current: tick boxes as you go, and add a line to
the Decision log when you make a call the plan didn't.

---

## 1. The loop (every task)

```
1. Pick the next unchecked task in the current phase.
2. Write or extend a proof test: scripts/godpath/test-<topic>.js
   (use scripts/godpath/lib.js — never copy harness boilerplate).
3. Implement.
4. node scripts/check.js --quick        # god-path checks, ~seconds
5. Commit (small, one task). Tick the box here.
```

**End of a phase:**

```
1. GODPATH_PHASE=<next> node scripts/godpath/ladder.js   → all green for that phase
2. GODPATH_PHASE=<next> node scripts/godpath/validate.js → all green
3. node scripts/check.js                                 → full run green
4. LABEL=p<n> node scripts/godpath/sim.js                → numbers into evidence
5. Write evidence/<date>/godpath-p<n>.md (template §8)
6. Bump scripts/godpath/phase.json; commit everything together
```

### Speed over polish

Steve's rule: *a bug is not the end of the world unless it's critical.*

**Critical**, so fix before committing:
- the game fails to boot
- save/load corruption
- a softlock, i.e. a fight or contest that can't end
- every sim run dying early
- anything that breaks a green-list test you can't explain

**Not critical**, so note it and move on:
- numbers that feel off
- a copy or text glitch
- an edge case in one path
- UI misalignment
- a sim metric that misses its target band

Log these in the phase evidence under "Known issues". Don't hold a phase for them.

**Don't gold-plate.** Do one path end-to-end first (Hunter), look at it, then
do the other nine. A rough version of all ten beats a perfect version of
three.

---

## 2. Tools

| Command | What it does | Time |
|---|---|---|
| `node scripts/check.js --quick` | Data contract + ladder + your `scripts/godpath/test-*.js` | seconds |
| `node scripts/check.js` | The above + every test in `scripts/green-list.txt` (regression net) | minutes |
| `node scripts/check.js --only <text>` | Just the scripts whose path contains `<text>` | — |
| `node scripts/godpath/validate.js` | JSON contract (§4), no game load | <1 s |
| `node scripts/godpath/ladder.js` | Runtime contract (§5) against the real game | ~1 s |
| `GODPATH_PHASE=N …` | Preview a later phase's checks | — |
| `node scripts/godpath/sim.js` | 8 seeds × 150 days; ascension rate, path spread, god-fight length, errors | minutes |
| `node scripts/check-wired.js src/js/godpath.js` | Functions nobody in `src/` calls | <1 s |
| `node scripts/validate-ontology.js` | The release gate for `@ontology` headers | seconds |

**Test kit** (`scripts/godpath/lib.js`): `load({seed})`, `newRun(Game)`,
`openSlots(Game, n)`, `giveAbility(Game, id, {level, force})`,
`fight(Game, monsterId, {hp, px, py, mx, my, party})`, `captureSays(Game)`,
`teleEvents(Game, type)`, `reporter(name)` with `ok(label, cond, extra, atPhase)`.
Fighters are addressed by `key` (`'p'` = player, monsters `'m_0'`…), never `id`.

---

## 3. Rules that are not up for negotiation

From the brief. The validator and ladder enforce the ones that can be checked.

- **No new currencies or meters**, visible or hidden. Conditions are yes/no
  fight facts. `godpathStats` is diagnostics only: never shown, never read by
  game logic.
- **No points or use-count ascension.** Ascension is the Trial.
- **No fusion.** **No gear rewriting abilities** (no `abilityHooks`). Gear
  takes part only through its own action making a condition.
- **The Table never reads god-path state** (`table.js` must not mention it).
- **kcal is the only cost currency.** God abilities cost kcal. Nothing
  removes the need to eat.
- **Day-80 floor for Trials. One god per life.** The god ability replaces the
  payoff *in its slot*; the ability count never grows.
- **No contest auto-wins.** Contests stay deadly.
- **Titan coalition gate stays.** A god counts as `titanBlades` (5) toward it.
- **Rework, don't delete** abilities. Re-tag, re-role, rewrite text: fine.
  Removing one from `abilities.json` isn't.
- **New code: no empty `catch (e) {}`.** Use `GP.warn(e, 'where')` (§5) so
  sims can count swallowed errors. Existing code: leave it alone unless you're
  already editing that function.

---

## 4. Data contract (`validate.js` enforces)

**`src/data/godpaths.json`**

```jsonc
{
  "conditions": {
    "marked": { "name": "Marked", "plain": "you've studied this target", "scope": "fight" }
    // scope: "fight" = set/cleared during a fight; "fightStart" = computed when a fight starts
  },
  "paths": {
    "hunter": {
      "name": "Hunter",
      "condition": "marked",          // P1
      "payoff": "dead_aim",           // P2: ability id, role "payoff"
      "trial": "trial_hunter",        // P3: contest id in contests.json
      "godAbility": "deadeye",        // P3: ability id in abilities.json
      "godDescription": "…",          // P0: rewritten per proposal §4 (no banned promises)
      "partyEffect": "…", "contestBeat": "…", "armyEffect": "…",   // P4
      "titanBlades": 5                 // P4
    }
  }
}
```

**Condition ids** (use these exactly):

| Path | Condition id |
|---|---|
| Brawler | `bloodied` |
| Shieldbearer | `guarding` |
| Hunter | `marked` |
| Caregiver | `tended` |
| Drifter | `moving` |
| Explorer | `read` |
| Socialite | `watched` |
| Survivalist | `well_fed` |
| Miser | `stocked` |
| Forager | `on_streak` |

Scope: `well_fed`, `stocked` and `on_streak` are `fightStart`; the rest are `fight`.

**`src/data/abilities.json`**

| Field | On | Phase |
|---|---|---|
| `makes: ["marked"]` | Every `role: "enabler"`. Other roles may carry it too | P1 |
| `spends: "marked"` | Each path's payoff | P2 |
| `actions[0].cost.kcal > 0` | Each payoff | P2 |
| God ability entry: `unlock: {type: "trial"}`, `godOf: "<path>"`, `weakness: "…"`, an action with `cost.kcal` | 10 god abilities | P3 |

**`src/data/items.json`:** `makes: ["guarding"]` plus `makesVia: "<gear action id>"`,
on at most 12 items, and only where the object's physical function obviously
does it (P1).

**`src/data/contests.json`:** 10 Trial contests, ids `trial_<path>` (P3).

**`src/data/synergies.json`** (P5):
- `kind: "signature"` with `path`: one per path, action-level.
- `kind: "duo"` with `duoPaths: [a, b]`: 3–7 total.

---

## 5. Runtime contract (`ladder.js` enforces)

All new runtime code lives in **`src/js/godpath.js`**. Mirror the module
pattern of `buildarounds.js` / `foodPower.js`:
- an IIFE that mixes methods onto `Scattering.Game`
- an `@ontology` header (see the top of `foodPower.js`) plus a matching
  section in `docs/ONTOLOGY.md`
- a script tag in `index.html` right after `buildarounds.js`, using the same
  `?v=` stamp as its neighbours

The service worker caches at runtime; no `sw.js` edit is needed.

| API | Phase | Notes |
|---|---|---|
| `Game.setCondition(key, cond, on)` / `Game.hasCondition(key, cond)` | P1 | `key` is a fighter key (`'p'`, `'m_0'`, villager keys). Stored on `this.tbfight`, so it resets with every fight. `fightStart` conditions are computed in `startCombat` |
| telemetry `godpath_payoff` `{path, ability, cashed: bool}` | P2 | Emitted on every payoff use via `this.tele(...)` |
| `Game.godpathTrialEligible(pid)` | P3 | Day ≥ 80 && payoff held at L3 && `scholar.godpath.cashedAtL3[pid]` && no god yet |
| `Game.godpathStartTrial(pid)` | P3 | Casts into contest `trial_<pid>` through the existing contest engine |
| `Game.godpathAscend(pid)` | P3 | In-slot transform. Ceremony (`godhood.js` `recognitionCeremony`), pantheon `registerAscension`, telemetry `godpath_ascended {who, path, day}` |
| `Game.godpathBladeValue(key)` | P4 | `titanBlades` for a god, else 1. `titans.js` gate sums it |
| `Game.state.godpathStats` | P2+ | `{cashed: {pid: n}, trialsOffered, trialsWon, trialsLost, ascended: [{who, path, day}], godFights: {n, rounds}, errors}`. `sim.js` reads it |
| `GP.warn(e, where)` | P0 | Increments `godpathStats.errors`, `console.warn` in node, `tele('godpath_error')`. Use instead of empty catches |
| `scholar.godpath` | P2+ | `{cashedAtL3: {pid: true}, god: pid \| null, trialCooldownUntil: day}` |

---

## 6. Phases

Sizes: S = under half a day of agent work, M = about a day, L = several.

### Phase 0 — Foundations (S)

Clear out what the brief rejected, and make the god-path data reachable.

- [ ] Add `'godpaths.json'` to **both** arrays of the data load in `game.js`
  init (grep `'godhood.json'].map(get)`), and `godpaths` to `this.data`.
- [ ] Create `src/js/godpath.js` (header, IIFE, `GP.warn`, empty
  `godpathStats` init) and register it in `index.html`, `docs/ONTOLOGY.md`.
- [ ] Delete fusion code from `buildarounds.js` (`availableFusions`, `fuse`).
- [ ] Delete use-count ascension from `buildarounds.js` (`pathBehavior`,
  `onPathLived`, `pathVerb`). If the `pathVerb` lines are good, move them
  into `godpaths.json` as `systemLine`.
- [ ] Move the unwired god helpers from `buildarounds.js` (`crimsonGodMult`,
  `crimsonGodParty`, `deadeyeMark`, `deadeyeAllyMult`, `lifebringerRevive`,
  `redHarvestHeal`) into `godpath.js` as a starting library. Mark them
  `// wired-exempt: P3` until wired.
- [ ] Fix the codex bug, in **two places** in `game.js` (grep
  `(sch.codex || {}).techniques`): techniques are only ever written to
  `this.state.codex.techniques`, so technique-leg synergies (e.g.
  `tidecaller`) can be discovered but never activate. Read
  `this.state.codex` instead, the same as discovery does.
- [ ] Rewrite `godDescription` in `godpaths.json` per proposal §4 and §8.
  The validator lists the six that break constraints.
- [ ] **Done when:** `validate` and `ladder` are green at P0, and `check.js`
  (full) is green.

### Phase 1 — Conditions (M)

- [ ] `conditions` block plus `path.condition` in `godpaths.json` (§4 table).
- [ ] `setCondition` / `hasCondition` on `tbfight`. Compute the `fightStart`
  conditions in `startCombat` (`well_fed` = kcal ≥ 75% of `kcalCap()`, the
  same line as Overcharge in `foodPower.js`; `stocked` = 2+ consumables in
  pack; `on_streak` = every forage today succeeded).
- [ ] Wire the *natural* makers, where the game already does the thing:
  - player takes damage → `bloodied`
  - adjacent to a hurt ally → `guarding`
  - any heal on an ally → `tended`
  - moved ≥3 tiles this turn → `moving`
  - monster telegraph known (`tbPatternKnown`) → `read`
  - ally within 3 tiles → `watched`
  - existing `deadeyeMarks` / `patient_aim` → `marked`
- [ ] Tag every enabler with `makes`. Make sure each condition has ≥1
  **off-path** maker; this is the cross-path seam (proposal §7.1).
- [ ] Gear makers (≤12): shield block → `guarding`, bow aimed shot →
  `marked`, spyglass scout → `read`, bandage → `tended`. Only where the
  gear action already exists or is a one-liner.
- [ ] Show active conditions as chips on the fighter, using the existing
  status-chip UI. Check at 390×844 that nothing scrolls.
- [ ] Proof: `scripts/godpath/test-conditions.js`, one assertion per maker.

### Phase 2 — Payoffs (M)

- [ ] Each path's payoff: `spends`, an active verb, and a kcal cost. With the
  condition: the big effect. Without: a weak effect, still useful.
- [ ] Telemetry `godpath_payoff`, and `godpathStats.cashed`, and
  `scholar.godpath.cashedAtL3` when the payoff is L3.
- [ ] Villagers: `tbVillagerAbility` prefers the payoff when the condition
  holds.
- [ ] **Build-around check** (research test 2): a scripted fight sim gives
  rounds-to-win with the payoff alone vs. the payoff + 2 makers. The payoff
  should be clearly better with makers.
  Script: `scripts/godpath/test-buildaround-delta.js`.

### Phase 3 — Trials and gods (L) — *Hunter first, then the rest*

- [ ] **Hunter end-to-end:** add `trial_hunter` to `contests.json`;
  `deadeye` to `abilities.json`; eligibility, start and ascend; the Deadeye
  rule. Add debug scenarios `trial_hunter` and `god_hunter` in
  `debug-scenarios.js`. Play it in the browser at 390×844. **Stop and write
  a short note** in the phase evidence: does it feel transformative?
- [ ] The other nine paths, same shape.
- [ ] Villager Trials (abstracted): a villager with the payoff at L3 on day
  ≥80 gets a resolved Trial (roll weighted by their kit), and on a win, the
  same ascension path.
- [ ] Retire the old `godhood.js` *requirement* checks (4-of-pool) so two
  systems don't both ascend people. Keep its ceremony, pantheon, Market God
  plumbing (used by the Miser god) and capstone code as the library.
- [ ] **Sim:** ascension in 5–15% of runs, mean god-fight rounds 2–8.

### Phase 4 — Scale (M)

- [ ] `partyEffect`, `contestBeat`, `armyEffect` and `titanBlades` in data,
  plus their code hooks:
  - party: the god shares their condition with allies
  - contest: one decisive beat in a matching category, never an auto-win
  - titans: `godpathBladeValue` counts toward the gate in `titans.js`
  - army / field fights: one modifier in `fieldFights.js`
- [ ] A god may attempt a titan below the ally minimum. That's recorded as a
  deed, never a win (proposal §8).

### Phase 5 — Signature combos and duos (M)

- [ ] Rework one existing stat synergy per path into an action-level
  signature combo, using the Shattering Blow model.
- [ ] 3–7 cross-path duos.
- [ ] Discovery uses the existing sequential/simultaneous system.

### Phase 6 — Legibility pass (S)

- [ ] Ability cards show `makes` / `spends` chips once the codex knows the
  ability ("if you don't know, it doesn't show").
- [ ] Trial broadcast copy and the ascension line.
- [ ] One full sim + one phone playthrough per god via the debug scenarios.

---

## 7. Decision log

Defaults for the proposal's open questions. Steve can overturn any of them;
when he does, update the row and the code.

| # | Question | Default used | Status |
|---|---|---|---|
| 1 | Trial vs. 50-use recognition | Trial | awaiting Steve |
| 2 | God counts as N titan blades; solo attempt allowed | 5; allowed, recorded as an achievement deed | awaiting Steve |
| 3 | Survivalist god | "Digest anything + eat mid-fight", not "never need food" | awaiting Steve |
| 4 | Old `godhood.json` builds | Requirements retired; mechanics kept as a library | awaiting Steve |
| 5 | Mechanics-first vs. fiction-first | Mechanics first (the brief is newer) | awaiting Steve |

---

## 8. Phase evidence template

`evidence/<date>/godpath-p<n>.md`:

```
# God-path P<n> — <title>
## What changed (files)
## Ladder / validate / check results (paste summary lines)
## Sim (paste target check from sim.js)
## Played it? (debug scenario, 390×844 — 3 sentences on feel)
## Known issues (non-critical, deferred)
## Decisions made (also added to PLAN.md §7)
```
