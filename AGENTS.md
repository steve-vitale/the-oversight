# AGENTS.md — working in The Oversight

Orientation for coding agents (Muse, Claude, others). Read this first, every
session. It's short on purpose.

## What this is

A mobile-first PWA survival roguelite: plain browser JavaScript, **no build
step, no package.json, no bundler**. `index.html` loads ~95 scripts from
`src/js/` in order; they share globals via `globalThis.Scattering`. Data
lives in `src/data/*.json`. Tests and sims are plain `node` scripts in
`scripts/`. The designer is Steve; his calls are recorded in `docs/` and
dated `evidence/` notes.

## Current project

**God-path system.** Plan: `docs/godpath/PLAN.md` (the task list, contracts
and phase gates). Design: `evidence/2026-10-14/opus-godpath-proposal.md`.
Start every session by reading `docs/godpath/STEVE-ANSWERS.md` (outranks everything), then `docs/COHERENCE-SPINE.md` (how every progression feature fits), then PLAN.md.

## Commands

| Run | When |
|---|---|
| `node scripts/check.js --quick` | After every change (seconds) |
| `node scripts/check.js` | Before every push (minutes; runs the green list) |
| `node scripts/check.js --only <text>` | One area |
| Sims (bots, sweeps, sim-audit) | Read `docs/SIMULATING.md` first |
| `node scripts/validate-ontology.js` | After adding or renaming a `src/js` module or its `provides:` |
| `bash scripts/bump-sw-version.sh` | Only when shipping a player-facing build (Steve's call) |

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
