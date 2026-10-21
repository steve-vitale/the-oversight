# AGENTS.md — working in The Oversight

Orientation for coding agents (Muse, Claude, others). Read this first, every
session. It's short on purpose.

## Repository workflow scope

The Oversight is independent of ChangePilot. Use this repository's roadmap,
agent lanes, Git history, checks and simulation/playtest evidence to manage work.
Imported ChangePilot development rules, task claims, approval queues, host leases
and execution-custody procedures are not requirements of this repository. Do not
add them as prerequisites for Oversight work or repeatedly request approval for
an action Steve has already authorized. This supersedes the earlier instruction
to reuse ChangePilot's old host rules (Steve's correction, 2026-10-18).

Keep the game-specific verification, save safety and release instructions below.
This repository instruction does not change host configuration or instructions
imposed outside the repository.

## What this is

A mobile-first PWA survival roguelite: plain browser JavaScript, **no build
step, no package.json, no bundler**. `index.html` loads ~95 scripts from
`src/js/` in order; they share globals via `globalThis.Scattering`. Data
lives in `src/data/*.json`. Tests and sims are plain `node` scripts in
`scripts/`. The designer is Steve; his calls are recorded in `docs/` and
dated `evidence/` notes.

## Current project

**What to build next:** `docs/ROADMAP.md` (what's built, Muse's ordered backlog with specs and done-when, known issues).
Start every session by reading `docs/godpath/STEVE-ANSWERS.md` (outranks everything; never re-ask what it answers), then `docs/COHERENCE-SPINE.md` (how every progression feature fits), then `docs/ROADMAP.md`. Questions for Steve go in `docs/OPEN-QUESTIONS.md`.

## Balanced simulation maintenance

Read docs/MEASUREMENT-PLAN.md and docs/SIMULATING.md before balance work.
Use all23 per-policy metrics; win movement in either direction prompts
investigation. Use16 matched screening seeds and64 distinct holdout seeds
for small balance effects. Changed Game/controller/harness or collector/
contract inputs require a fresh real observer-neutral maintenance proof.
Refresh it with scripts/balance-proof-update.js; quick/full checks enforce
its current inputs. Never rewrite source identities or waive unknowns.

## Browser boundary proof

For time/save changes, read docs/TIME-SETTLEMENT.md. Keep synchronous clock,
Sleep and all before/after-dawn hooks inside the initialized transaction chain.
`deferred` is a save request, never durable success. Verify committed bytes
before unload and recovery in a fresh process; do not repair partial nights by
clamping clocks or replaying metabolism.

For UI/input/layout or save/Continue changes, read `docs/BROWSER-PLAYTESTING.md`.
Prove the changed flow with actual browser controls and inspect a rendered mobile
screenshot as well as DOM state. Node campaigns exclude app.js and CSS: they
cannot prove clickable turn controls or a readable card. Label prepared scenes,
retain failed pilots, and verify cancellation, paid action and saved state.

## Pack view maintenance

The pack needs canonical item IDs, food state, weight and bonding metadata;
the HUD's `status().inventory` is intentionally a thin summary. Keep one shallow
view copy per canonical row, in the same index order, so actions address the
right live item and UI-only fields never enter saved inventory. For pack changes,
verify actual phone Wear/effect/Continue and honest unknown-food controls, then
refresh the real observer proof. Headless possession metrics do not prove that
a player can use the reward. See evidence/2026-10-17/pack-metadata-453-audit.md.

## Incoming damage maintenance

Phase Shawl's authored 25% avoidance requires the person's own worn accessory;
carried gear does nothing. Route each real incoming human HP hit through
`Game.wornDamage` before changing HP/outcomes. Supply private combat RNG and
actual fighter body when available. Already-resolved field/duel totals use
`sealDamageResult` and `hurtVillager(..., result)` exactly once; never roll
again on settlement. Keep healing, HP synchronization and deliberate resource
payments separate. Damage avoidance does not cancel food/water/energy costs,
status duration or death causes. Preserve nonlethal floors and honest narration.

Player damage should normally use `addHealth(-amount, {rng, scene, minHealth})`:
it already rolls worn avoidance once and keeps the actual fighter and scholar
HP together. The positive `minHealth` option preserves a nonlethal floor and
never heals; a zero debit draws nothing. Do not call wornDamage first and then
addHealth on the same hit. Wrappers must forward these options (the Suburb
healing wrapper does); test supplied-RNG and floor contrasts through the full
runtime. Beam resolution uses its target's own capacity, armor and body guard.


Run `scripts/godpath/test-phase-shawl.js` with the shared seeded harness for
new damage routes, plus a failing control that removes the actual new hook.
Refresh the real observer proof after source changes. The current port is
unfinished: audit direct/compound HP writes, aliases and indirect callbacks;
a search census or green combat tests cannot prove every world route works.
See `evidence/2026-10-17/phase-shawl-d6be-r3-audit.md` for the current boundary.

## Prey content maintenance

Animal habitat, hunt-method and learned-cue changes follow
[docs/PREY-RUNTIME.md](docs/PREY-RUNTIME.md). Run the shared
`scripts/test-water-prey.js` proof with default seed,7 and42; it is also on
quick/full lists. Fish need explicit water habitat, and unknown tool methods
must never count as ready. Prose alone does not establish live behavior.

## Offline asset maintenance

Entry-page dependencies, manifest assets and live JSON changes follow
[docs/OFFLINE.md](docs/OFFLINE.md). Regenerate with
`node scripts/build-offline-assets.js`; check mode is read-only. Quick/full
checks execute the actual service-worker offline-handler proof. The release
script refreshes exact cache keys after stamping; do not run it without Steve's
shipping decision. Keep optional audio binaries runtime-cached.

## Commands

Creature audio/Audio Lab changes follow docs/AUDIO-LAB.md. Regenerate the Lab
payload after roster or voice changes; its full-suite proof enforces freshness,
real hook coverage and the shared regional renderer. Native sound judgments
remain separate from automated graph/PCM checks.

| Run | When |
|---|---|
| `node scripts/check.js --quick` | After every change (seconds) |
| `node scripts/check.js` | Before every push (minutes; runs the green list) |
| `node scripts/check.js --only <text>` | One area |
| Sims (bots, sweeps, sim-audit) | Read `docs/SIMULATING.md` first |
| World regions (new environments, flora/fauna, global stage) | Read `docs/WORLD-REGIONS.md` first; `node scripts/validate-regions.js` after content changes |
| `node scripts/validate-ontology.js` | After adding or renaming a `src/js` module or its `provides:` |
| `bash scripts/bump-sw-version.sh` | Only when shipping a player-facing build (Steve's call) |

“Before every push” includes documentation/evidence follow-ups and tooling-only
pushes. Deploy exclusion is not a test exemption. Run quick/full against the
checkout being pushed; keep the command, result and candidate identity in the
release evidence. A prior gameplay release's green result must not be presented
as a fresh check of a later follow-up. Do not disable hooks, skip verification,
or waive a failing check to publish. Existing proof freshness and unchanged
runtime identities can be verified without inventing new gameplay evidence.

## Map

| Path | What |
|---|---|
| `src/js/game.js` | Core: ~40k lines. **Grep by function name; line numbers drift daily** |
| `src/js/app.js` | UI (DOM). Not loaded in node tests |
| `src/js/godpath.js` | God-path runtime (created in phase 0) |
| `src/js/buildarounds.js`, `foodPower.js`, `abilityActions.js` | Ability engine: payoffs, kcal costs, `useAbility` |
| `src/js/godhood.js`, `pantheon.js` | Older godhood (ceremony, pantheon) — reused as a library |
| `src/js/table.js` | The endgame Table: the actual win. **Never gate it on godhood** |
| `src/data/` | All content. Prefer data changes to code changes |
| `scripts/sim-harness.js` | THE way to load the game in node (seeded RNG, frozen clock) |
| `scripts/godpath/lib.js` | Test kit on top of it (fights, abilities, phase gates) |
| `scripts/sweep-compare.js` + `scripts/policies/` | Multi-seed sims with bot "players" |
| `docs/` | Design canon. `DECISIONS.md`, `DIRECTIVES.md`, `TABLE.md` matter most |
| `evidence/<date>/` | Proof notes + sim output per change |

## How we work

1. **Proof before claim.** A feature is *done* when:
   - it's **called from game code** (`node scripts/check-wired.js <file>` shows nothing unwired)
   - a test proves it
   - `check.js` is green

   "The proof script passes" alone is not done. This repo has repeatedly
   shipped features nothing called.
2. **Small commits, one task each.** Message: what + why. Add `[needs-eyes]`
   when Steve should look at feel or design, not code.
3. **Speed over polish.** Non-critical bugs are fine: log them in the phase
   evidence and move on. Critical = no boot, save corruption, softlock, every
   sim run dying, or an unexplained green-list break.
4. **Green list** (`scripts/green-list.txt`): tests that passed on
   2026-10-14. Keep them passing.
   - If one breaks because the design changed on purpose, update the test in
     the same commit and say so.
   - If it breaks and fixing it isn't worth it now, move the line to
     `scripts/green-list-quarantine.txt` with a reason.
   - Never loosen an assertion just to go green.
   - Many *old* scripts write into `evidence/` when run (the green list
     excludes those). If a run leaves stray changes there, discard them with
     `git checkout -- evidence/` rather than committing them. New tests must
     not write into the repo; sims write once, on purpose, into
     `evidence/<date>/`.
5. **New tests use the shared kit** (`scripts/godpath/lib.js` or
   `scripts/sim-harness.js`). Never copy the eval boilerplate. Never hardcode
   absolute paths (55 old scripts point at another machine's `/home/hatch/…`).
6. **No empty `catch (e) {}` in new code.** Report the error (`GP.warn` in
   god-path code) so sims can count it.
7. **Data over code.** New abilities, conditions and contests are JSON first.
   Abilities declare `{target, op, value}` modifiers and `actions`; the
   engine does the rest.

## Sim harness rules (hard-won)

- `Math.random` is seeded **before** eval: modules capture it at load. Use
  `loadGame({seed})`.
- Never run two harnesses in one node process (shared state). Sweeps run
  seeds sequentially; parallelise with separate processes.
- `window` is stubbed then deleted, so combat runs synchronously in node.
  DOM-only files (`app.js`, `sprites.js`, `tile-scenes.js`, `move-anim.js`,
  `drama.js`) are excluded.
- Fighters are keyed by `key` (`'p'`, `'m_0'`, …), not `id`.

## Design guardrails: Steve's own words only

**Law** is what Steve said directly: `docs/godpath/STEVE-ANSWERS.md`, plus
quotes attributed to him in quotation marks. Paraphrases ("Steve's canon:
…", the 2026-10-14 brief) are **not** law. If a rule matters and you can
only find a paraphrase, ask Steve.

Verbatim, with sources:
- "Paint a path towards functional godhood. If they learn and experiment
  enough, people can get there and it's scary good. Most game wins look
  like that, but not all." (`docs/ENDGAME-BUILDS.md:3`)
- "I love the broken builds component of roguelites." (`docs/DECISIONS.md:104`)
- "the table prices the run, never gates on godhood; reachable by
  competent non-god play" (`docs/TABLE.md:62`)
- "Gear changing abilities should be one of our least frequent levers.
  Gear is more likely to grant another type of action in certain
  scenarios." (`evidence/2026-10-14/design-methodology.md:3`)
- "control must change the board, not the numbers" (`game.js`, grep it)
- "Abilities should be stronger, and they were always meant to be powered
  by food." (`evidence/2026-10-14/food-powered-abilities.md:3`)
- "does this let you skip dinner?" (power-design test, `docs/DIRECTIVES.md:25`)
- "Purify should be an ability not a skill. Thats magic. … let's not
  confuse human skills and alien abilities" (`evidence/2026-10-11/break-purify-audit.md:3`)
- "It should be a fight. A hard one." / "contests are to be played, not
  as RNG." (`fieldFights.js`, `contestEngine.js` headers)
- "Decisions, not chores." "If you don't know, it doesn't show." "I kinda
  hate changing views … One mobile screen." (`docs/DIRECTIVES.md`)
- "You shouldn't be able to beat the game without going through a
  majority of game content." (`src/js/progression.js`, grep it)

## Deploy note

Pushes to `master` deploy the PWA (Vercel). `scripts/`, `docs/` and
`evidence/` are excluded from the deploy (`.vercelignore`), so tooling
commits are safe. Changes in `src/` reach players on the next deploy.

## Balanced measurement workflow (Codex and Muse)

Combat/input/UI work also requires `docs/MOBILE-PLAYTEST.md`: phone metrics plus
trusted touch and swipes, whole fights through their endings, and interrupted
enemy-turn Continue. Desktop auto-scrolled clicks and synchronous node combat
do not establish mobile playability. Preserve failing browser traces.

Before gameplay tuning read docs/MEASUREMENT-PLAN.md, docs/SIMULATING.md and
docs/SURVIVAL-LEVERS.md. Use the same current observer against baseline and
candidate frozen roots,16 matched seeds for capable/maker/merchant/caregiver,
64 independent holdouts for small-effect claims and named job/region cohorts.
Mixed policies do not prove pacifist viability. Review survival, community,
resources, progression and earned gear for every policy; wins moving either
way prompt investigation, never an automatic verdict. More wins cannot cancel
other warnings. Update the survival lever register/decision log with every
survival-affecting lever change. Keep raw panels, censuses, configuration,
hashes and the tradeoff decision in dated evidence. Unknowns stay unknown;
zero calls require availability/opportunity inspection before a defect claim.

NPC progression requires a known living resident with canonical ID different
from the current bearer at observation. Read npcExposure unknown/exclusion
fields; old stale-map reports are historical. Holder-days are coverage, not
proof a power was used or useful. Never compare changed policy/harness
revisions as if only the Game changed. Resume/shard/cache instructions are
in SIMULATING.md; use shared tooling before treating it as a balance gate.

Quick/full automatically run scorecard, measurement-workflow and real capstone
grant observer tests. Collector/contract semantics require updated assertions/
docs, fresh neutral proof via scripts/balance-proof-update.js and BOTH roots
reobserved under one collector. Case fingerprints invalidate changed inputs.
Grant boundaries include actual maybeGrantCapstoneItem, even with a void return;
prove player/NPC/direct/nested/idempotent source accounting and observer purity.
Do not count starting inventory or borrow another person's gift. No local Git
hook installation or ChangePilot repo workflow is required.

## Actual phone play

Read docs/PHONE-FRAME.md and docs/MOBILE-PLAYTEST.md before changing field UI.
Core play must fit one phone viewport: board, current message, movement and
actions remain together. Only explicitly opened management/history lists scroll.
Use trusted touch, not desktop clicks or automatic scrolling to a control.

Quick/full run test-phone-frame-proof.js automatically. Runtime/recipe changes
require actual fresh16-stage receipts at390x736 and390x844, including a real
conversation, resource-neutral reply paging, zero-move Deer Wait and escape.
The receipt must match loaded response bytes, not a displayed build label.
Refresh with scripts/phone-frame-proof-update.js; never hand-edit proof hashes.
The repeatable browser recipe and disposable preview server are linked in
PHONE-FRAME.md. Browser emulation does not clear physical iOS/Android or the
separate installed-update/offline/rollback gate.
