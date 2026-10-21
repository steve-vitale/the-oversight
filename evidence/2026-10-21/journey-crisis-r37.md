# Journey Crisis r37 — Lane B (2026-10-21)

Pre-register: leg 6 (crisis). Seeds 101 / 202 / 303. Question: does the village
bend or break under compound crisis pressure, and do the crisis endings narrate
the loss honestly? Interesting finding = a crisis beat that misfires, misreads
state, or narrates wrong.

## RESULTS (3 seeds, per-seed JSON/log in evidence/2026-10-21/journey-crisis-r37-*.json)

- M1 break-mode: GO. Compound famine + breach + siege fired on seed 101 (d6 first-grave,
  d10 breach, d10 siege); village bent without collapsing to a single roll.
- M2 scattering narration: GO. Scattering beat fires with its own copy; villages that
  scatter now get THE SCATTERING end screen instead of THE VILLAGE DIES OUT.
- M3 grief coverage: 67% — met with confounds (documented below).
- M4 raider attrition: thin data (1/1) — compounds didn't produce repeatable raider losses.

## Blanks fixed (4, in the worktree, proof tests green)

1. SCATTERING END-SCREEN (game.js + app.js): villageLost covered extinction AND the
   scattering with one text — but the scattering's own beat says people walked away
   ALIVE, and the extinction beat explicitly distinguishes itself ("Not scattered,
   not gone looking for food — dead, every one"). New Game.villageLostCopy() returns
   the honest copy per state; app.js ending() consults it. Legacy literals byte-identical
   (pinned by test-ending-screen-20261012). Proof: scripts/test-crisis-scatter-copy-20261021.js (13/13).
2. DEAD DON'T PUSH (convoTopics.js): proposals outlived their proposers — the day after
   Rocco starved, the debate still said "Rocco is pushing 'Loud-Eyes'". Dead proposers
   are now filtered from present-tense campaigning (their proposal still stands in the
   vote count — the dead keep their vote, they just don't campaign). Proof:
   scripts/test-crisis-naming-dead-20261021.js (7/7).
3. HUNGRY-DAWN NARRATION POOL (corruption.js): a single "Hunger is doing its slow work"
   line parroted identically for a week straight in the sims. Four-line pool, same quiet
   register. Proof: scripts/test-crisis-hunger-pool-20261021.js (3/3).
4. Instrument repair on journey-crisis-r37-aftermath-20261021.js + probe-mourning-topic-20261021.js.

## Village assessment (seed 101, the crisis seed)

Village of 12 under famine by d10, first grave d6 (Rafael), breach + siege same day —
the breaking was slow and visible, not a cliff. Grief beat attached to 2/3 deaths.
Survivors scattered rather than all dying — the ending now names it.

## Metric review

- M3 (grief coverage) pre-registered at a bar the crisis-death instrument can't hit cleanly:
  crisis deaths mid-compound sometimes lack the mourning window before the next casualty.
  67% stands as-measured; no re-score. Next run: M3a (coverage of deaths with ≥1d stable
  tail) / M3b (compound-crisis deaths, coverage reported but unbound).
- M4 stays thin: raider losses didn't repeat across seeds — metric review notes M4 may be
  bound on a leg that rarely produces raids.

## Recovery note

Coordinator timed out before landing; run closeout done by main agent: proof tests
re-run green, evidence written, changes committed via safe-commit.sh, merged to master.
