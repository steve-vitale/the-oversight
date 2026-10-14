# Entropy hunt — scale-onramp wall run r26 (loop A, tooling arm)

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)

- **Primary metric:** bit-identical trajectory hashes on leadfeast s44, twice in-process.
- **GO threshold:** determinism gate + seeded harness delivering byte-identical 180d runs, OR: source irreducible → documented + noise-budget gate shipped.
- **Horizon/seeds:** s44 + s88 (the two named divergent seeds); confirm on the standard 8-seed set.
- **Policies:** leadfeast (FEASTSCALE_R13=1).
- **Verdict:** **DIAGNOSTIC-GO** — source found and proven (game-code), gate shipped. Fix requires game-code change → coordinator call, per tooling-only constraint.

## What was wrong

Identical seed+policy+days+code DIVERGED within a single process on fight-heavy seeds (r25: leadfeast s44 d161 vs d180; s88 d76 vs d80). The bisect pinned onset to ~day 107-112, on/just-after wave-5 unlock.

## The hunt (in order)

1. **Reproduced** with local harness (scripts/diag-entropy-repro-20261014.js): s44 diverged day 107 (120d vs 114d). The committed det-test hardcoded a dead sibling worktree path; rewrote against this tree.
2. **Ruled out:** silent eval failures (loadFails empty both runs); require-time Math.random capture (spy: zero native hits); Game object reuse (fresh per eval — identity probe); policy module state (none); wall-clock time (frozentime with *incrementing* Date.now: 3/5 pairs still diverged).
3. **RNG stream proven clean:** per-day seeded-RNG call counts identical through day 110 in divergent pairs; caller-order identical through day 106 (tracing probe). The main RNG is NOT the problem.
4. **State diff:** full Game.state differs from day 0 — but ONLY in wall-clock timestamps (runKey, startedAt, telemetry[].t, pacing.lastTs) and timestamp-derived IDs (villager `app_<ts>_<rand>`, link `link_<ts>_<rand>`). The random parts are identical (698=698); only timestamps differ.
5. **Decisive experiment:** CONSTANT Date.now (same value every call, both runs) → 0/5 pairs diverged (was ~3/5). **Timestamps are the root cause.**
6. **Mechanism (game code):** `src/js/contestEngine.js`:
   - `_cxSeed` (line ~108): `pids.slice().sort().join('+')` hashed into the contest RNG seed. Villager IDs contain `Date.now().toString(36)` → different sort order → different seed → different contest outcomes. The comment claims "Same state in, same fate out" — false across runs because IDs differ.
   - `cands.sort()` (line ~255): "stable order before the seeded pick" — not stable across runs for the same reason; the seeded index picks a different candidate.
   
   Contests resolve on ~day 110 (the deaths show `110:P:contest`), matching the divergence onset. The main RNG stream is untouched (contest uses its own `_cxSeed`-derived stream), which is why per-day main-stream counts stay identical until the contest outcome perturbs the trajectory.

## What I shipped (tooling-only)

- **scripts/det-gate.js** — `checkDeterminism(seed, policy, opts)`: runs seed+policy twice in-process, compares per-day trajectory hashes. Returns `{identical, summary, ...}`. Sweep scripts call this before trusting a before/after comparison; if `!identical`, the comparison is unresolvable — do not spend confirm seeds.
- **scripts/test-determinism-gate-20261014.js** — proof test. RED on current master (exits 1, prints divergence) — the gate correctly detects the bug. Goes GREEN when the game-code fix lands, no test changes needed.
- **Diagnostic probes** (scripts/diag-entropy-*-20261014.js): repro, spy, rngcount, rngtrace, frozentime, consttime, statediff{,2,3}, vitals{,2}, roster, deaths, events, disease, encounter, talkround, identity. Kept for the record; the gate + test are the durable artifacts.

## Noise-budget convention (for arms, until the game-code fix)

Per sim-findings #113: identical-seed before/after is not a controlled comparison on fight-heavy seeds until the contest-ID fix lands. Arms must:
1. Run the determinism gate on their seed set BEFORE the before/after comparison. If the gate fails on a seed, that seed's delta is unresolvable — exclude it or widen the budget.
2. Pre-register the baseline's own invocation-to-invocation spread (≥2 invocations) as the minimum resolvable effect. Effect < spread → NO-GO, never re-scored.
3. Prefer seeds/policies that pass the gate; report gate status per arm in the evidence file.

## What stays open (coordinator/Steve call)

- **Game-code fix (NOT done — tooling-only constraint):** make villager IDs deterministic (e.g. counter-based, or strip the timestamp before hashing/sorting in contestEngine.js). The `_cxSeed` "same state in, same fate out" contract is currently broken by design. Two candidate fixes: (a) sort pids by roster index instead of ID string; (b) hash a timestamp-stripped ID. Both need Steve's eye if they touch contest feel — likely not, it's seeding, but the fix changes contest outcomes vs current master.
- **Other timestamp-ID consumers:** `_hashStr(vid)` for pronouns/looks/voice (cosmetic, verified benign), `conversation.js:574` roster sort (voice assignment, cosmetic), `game.js:19683` tale-listener stream (cosmetic prose). The contest path is the only logic-affecting one found, but a full audit of `.sort()` on ID arrays is warranted.
- **s88:** named as divergent in r25; not re-probed here (s44 sufficed to isolate the mechanism). The gate should be run on s88 before trusting s88 comparisons.

## Metric review (§14)

Pre-registered GO was "byte-identical 180d runs OR source irreducible → documented + gate shipped." The source is reducible but requires a game-code change, which is out of this arm's scope (tooling-only). Delivered: diagnosed source + proven mechanism + shipped gate + noise-budget convention. Verdict DIAGNOSTIC-GO per the task's explicit acceptance criterion. The metric itself was sound; no revision proposed. Next run: re-run the gate after the game-code fix to confirm GREEN.

## Village assessment

s44/leadfeast: a wave-5 village under siege. The scholar's contest death on ~day 110 (and the ensuing succession cascade — three scholar deaths in two days in one trajectory) is the hinge. Villagers die on patrol vs world monsters; the pantry holds but the roster bleeds out (village-lost day 114-120). The divergence doesn't change the village's *story* — it changes *which* villagers die on *which* day, via contest RNG. The village always falls; the noise is in the details of the fall.
