# sim-gaps-ghost-prereg — THIRD-FIGHTER GHOST NARRATION (preregistration, binding)

Arm: gaps-ghost (branch gaps-ghost, worktree
`~/workspace/worktrees/gaps-ghost`). Coordinator merges; this worker does
NOT merge, push, bump, or verify live. NARRATION ONLY, ZERO BEHAVIOR
CHANGE. Committed BEFORE any build, per the task.

## The blank (read from evidence, not assumed)

From evidence/2026-10-28/sim-sortiedpr-a.md, sense section (seed 75105
replay, d89): the SORTIE line names THREE fighters ("Caleb, Vasyl,
Miguel take up arms..."), but the engine fields the leader plus at most
ONE joined ally (joined-ally rate 13%, 8/60 fights; the ally joins only
via the hopeless shout, fieldFights.js ~L1559, or allyFromStart). The
third mustered fighter (Miguel on d89) NEVER appears in the fight log.
Party credit for kills is already honest (partyfinish summary fix:
"with their party"); the third fighter is a ghost in the fiction.

Mechanism, verified in code before this prereg (not taken on trust):
- lingererSortie (havenGrowth.js ~L763-788) musters 3 via
  `_musterAway(3, 'defense')` and passes
  `{ allies: allyVids.length, allyVids: allyVids.slice(), cornered: true }`
  to fieldFight. Cornered is set by NO other caller (grep-verified).
- fieldFight slices `allyVids` to 2 (~L843) and shifts AT MOST ONE into
  the fight (allyFromStart ~L899, hopeless shout ~L1559). The leftover
  entries are never named anywhere in rec.log. Nothing in the engine
  reads rec.log contents to decide anything (only pushes; trickLog is
  separate), so a log-only addition cannot move an outcome.
- The player-visible say stream already credits the party generically
  ("with their party", "the party falls back", "The party carries the
  body home"). What is missing is the NAMED third fighter in the
  blow-by-blow record — the exact surface the sense verdict names
  ("never appears in the fight log").

## The choice (with reasons) — LOG PRESENCE, not a two-fighter muster

CHOSEN: a log presence for the mustered-but-never-joined fighter(s):
one closing line in the sortie fight's log naming exactly the fighters
who marched but never joined the blows, standing the rear.

REJECTED: a muster line that says two, not three. Reasons:
1. Three fighters GENUINELY march and GENUINELY eat 3 x 2000 kcal of
   rations — the muster line is the one honest line in the story
   (named fighters, priced rations, sober last line, per the sense
   verdict). Naming two would hide a real marcher and a real price:
   dishonest in the other direction.
2. Actually fielding only two would change muster size, holdBonus,
   rations, and outcomes — a behavior change, out of scope for a
   narration arm.
3. The fix belongs where the blank is: the fight log, not the muster.

## The exact fix (pre-registered)

In src/js/fieldFights.js only, at the end of fieldFight, just before
the damage seal (after all rounds, after all RNG draws), in a
try/catch, gated on `opts.cornered` AND leftover `allyVids` non-empty
(after the join shifts — i.e. exactly the mustered fighters who never
joined the blows):

- Set `rec.rearGuard` to the leftover vid list (machine-checkable,
  same spirit as partyfinish's rec.partySize).
- Push ONE line to rec.log naming them via the fight's own refName:
  single: "`<Name>` stood the rear through it, watching the treeline
  behind them."; two: "`<Name>` and `<Name>` stood the rear through
  it, watching the treeline behind them."
- Names resolving to 'Someone'/falsy are skipped; if none resolve, no
  line and no field (never invent a presence you cannot name).

Deliberate scope limits (all pre-registered):
- Cornered-gated ONLY (sortie caller only): aid, wild, alien, and
  arena fights keep their exact current narration. Other arms own
  those surfaces.
- Outcome-neutral wording, one line, no outcome-specific variants:
  true for vKill, mFlee, vFlee, and vDie alike (the vDie say line
  already says "The party carries the body home" — consistent).
- No say-line change: a per-fight say line would repeat the same
  rear-guard three times across a three-fight sortie (noise), and an
  end-of-sortie say line would need sortie-loop surgery with
  break/vDie early-exit care (bigger, not smaller). The say stream
  already credits the party generically; the log is where the named
  fighter was missing.
- No RNG draw, no stat, no HP, no outcome variable, no gate, no
  decision input touched. PERCEPTION LAW kept: only fighters who
  actually marched (the passed allyVids) are ever named; no roster
  or list is fed into any decision (this arm makes no decisions).

## Sense bar (binding — the quoted transcript test)

BEFORE (pristine code, seed 75105, 180d sortiedpr sense replay,
captured before any edit):
the d89 multi-round fight log names Caleb (leader) and Vasyl (shout-
joined) and never Miguel; the d89 1-HP kill logs name only the
leader in the blows.
AFTER (same seed, same driver, same code except this fix):
- the same d89 multi-round fight log ends with a line naming Miguel
  (the leftover) and NOT Vasyl (the joined ally — he already has
  his "charges in!" line);
- the d89 1-HP kill logs end with a line naming BOTH non-joined
  fighters (no shout fires in a round-1 kill);
- every numeric field of the replay (attempts, clears, outcomes,
  rounds, damage, kills) is IDENTICAL before/after: the diff between
  the two replay outputs contains log lines only.
A narration fix that moves ANY measured number (DPR, kills, joins,
outcomes) is OUT OF SCOPE — if the diff shows one, stop and
re-scope, do not land it.

## Proof of record

1. scripts/test-gaps-ghost.js (new, node-direct, shared sim-harness
   pattern from test-partyfinish-proof.js):
   - 1-HP cornered kill, 3-muster, no join: rearGuard = both allies,
     log names both.
   - cornered fight with one ally joined from the start (deterministic
     stand-in for the shout path): rearGuard = the other ally only,
     log names only the other.
   - cornered fight where the single ally joins: no rear line, empty
     rearGuard (no ghost, no line).
   - non-cornered fight with leftover allies: no rear line (scope
     gate — other callers untouched).
   - summary honesty unchanged (partyfinish cases keep passing
     through check.js; this arm does not touch the summary).
2. BEFORE/AFTER sense replays, seed 75105, 180d, same driver:
   evidence/2026-10-29/gaps-ghost/sense-before-75105.txt and
   sense-after-75105.txt, plus a numeric diff in the final note.
3. `node scripts/check.js --quick` with
   `--cacheDirectory=/tmp/jest-cache-gaps-ghost` after the change.
   Never loosen an assertion to go green.

## Files (exact)

- evidence/2026-10-29/sim-gaps-ghost-prereg.md (this file)
- evidence/2026-10-29/sim-gaps-ghost.md (final note, after proof)
- evidence/2026-10-29/gaps-ghost/sense-before-75105.txt,
  sense-after-75105.txt (replay transcripts)
- scripts/test-gaps-ghost.js (proof test)
- src/js/fieldFights.js (the fix ONLY — no other src file)
- docs/ONTOLOGY.md: left alone (no module added/renamed, no
  provides: header changed).
- FORBIDDEN, untouched: src/js/storage.js, src/js/villager-build.js,
  src/js/villager-objectives.js, docs/MAP.md; no armor/map/succession
  work; no gates; no merges, pushes, bumps, or live claims.
