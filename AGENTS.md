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
Start every session by reading PLAN.md §1 and the current phase.

## Commands

| Run | When |
|---|---|
| `node scripts/check.js --quick` | After every change (seconds) |
| `node scripts/check.js` | Before every push (minutes; runs the green list) |
| `node scripts/check.js --only <text>` | One area |
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

## Design guardrails (from Steve; the checkers enforce some)

- **One economy:** kcal. No new currencies or meters, visible or hidden.
  Power never removes the need to eat.
- **System abilities (alien magic) ≠ human skills.** Never mix them.
- **Gear grants actions; it doesn't rewrite abilities.** Fusion and
  points-based god meters were tried and rejected.
- **The Table decides victory.** No victory before day 90; no godhood before
  day 80.
- **Mobile:** 390×844, moment-to-moment play never scrolls; fights take
  2–8 turns.
- **"If you don't know, it doesn't show"**: UI reveals only earned knowledge.
- **Death stays the leading failure:** no auto-wins, contests stay deadly.

## Deploy note

Pushes to `master` deploy the PWA (Vercel). `scripts/`, `docs/` and
`evidence/` are excluded from the deploy (`.vercelignore`), so tooling
commits are safe. Changes in `src/` reach players on the next deploy.
