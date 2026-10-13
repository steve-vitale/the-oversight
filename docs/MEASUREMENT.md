# MEASUREMENT.md — the house standard (Steve 2026-10-11)

How the loops test, measure, and prove. Short and enforceable, not
aspirational. If your run doesn't meet this, say so in the evidence file —
don't silently lower the bar.

## 1. Identical seeds, always

Every before/after claim runs the SAME seeds on both sides. Seeds are fixed
literals in the script or env (`SEEDS="7,42,99"`), never "a few random ones".
The standard runner is `scripts/sweep-compare.js`:

```
LEVER="my lever" SEEDS="7,42,99" POLICIES="competent,risk-aware" DAYS=60 \
  OUT=/tmp/out.json node scripts/sweep-compare.js
```

Minimum: 3 seeds × 60 days for a smoke claim; 6+ seeds × 200 days for a
reachability claim. Fewer than that is a probe, not a result — label it.

## 2. Multi-policy, always

One policy can't see strategy-dependence. Every lever runs at least TWO
policies on identical seeds: `competent` (the default baseline — its behavior
is pinned; don't "improve" it inside a lever run) plus the policy that
isolates your lever's question (`risk-aware` for fear, `larceny-leaning` vs
`kind` for justice, `deed-seeking` for deed curves, `winseek` for the ceiling).
The policy library lives in `scripts/policies/` with a README. If no existing
policy isolates your question, add one (one file, documented, deterministic)
instead of hand-rolling behavior into the sweep.

## 3. Seeded PRNG in proofs — no exceptions

A proof test asserting aggregate behavior over unseeded Math.random is flaky
by construction. Seed before eval (the harness does this: mulberry32 installed
as Math.random BEFORE modules load, because several capture it at load time),
expose a SEED env override, and re-run green on ≥3 seeds before calling it
done. Sample-gate share assertions (skip when n is tiny); day-normalize rate
comparisons.

## 4. Sense-reads are the bar, not the garnish

Buttons working is not the bar (Steve 2026-10-11: "not just that things work
but that they are sensical"). Every proof test that touches player-facing copy
prints the lines and the author reads them for meaning, coherence, and
relevance. Transcripts over counts: a conversation proof shows the exchange,
not just the exchange count.

## 5. What "green" means

- Proof test: all assertions pass on ≥3 seeds (state the seeds).
- Closest regression suites: green on the same tree (name them).
- Ontology: `scripts/validate-ontology.js` passes (headers valid).
- Determinism spot-check for new harness code: same seeds twice →
  identical tables (see sweep-compare self-test pattern).
- No bare `git commit`; `scripts/safe-commit.sh` only; merge `--ff-only`;
  never push/bump (ship loop owns it).

## 6. When a lever needs [needs-eyes]

Anything that changes feel, combat, or UI — damage numbers, new on-screen
copy, new beats, pacing changes — gets `[needs-eyes]` in the commit message.
The ship loop fast-tracks flagged batches to Steve's phone. When in doubt,
flag it: a false positive costs a tag, a false negative costs his trust.

## 7. Pacing is measured, not estimated

- Sims: `runDays` always records `result.pacing` — mean verbs/day,
  policy-calls/day, ticks/day, plus per-day rows. Quote these in lever
  evidence instead of guessing day length.
- Live: `endDay()` records real minutes-per-day into `state.pacing`
  (ring buffer, local only, never a network call); `Game.pacingStats()`
  reads it; the 🐞 debug panel shows median min/day. This is the data
  behind the 40-hour question — cite it, don't estimate.

## 8. Tooling changes nothing about balance

Measurement workers don't pull levers. If the harness spots a balance issue,
document it in the evidence file for the loops — don't fix it in the tooling
commit.

## 9. Staged seeds: the pilot gate (Steve 2026-10-12)

Never spend 12–20 seeds before knowing the lever does anything visible.
Every lever runs in stages, cheapest first:

- **Stage 0 — smoke (2–3 seeds, short horizon).** Does the lever's code path
  even fire? Does the primary metric move at all? If nothing fires, fix the
  wiring, not the tuning.
- **Stage 1 — pilot (4 seeds, question-appropriate horizon, before/after on
  identical seeds).** The GO/NO-GO gate. GO only if the effect is *obvious*
  in 4 seeds — visible in the raw numbers without statistics.
- **Stage 2 — confirm (12–20 seeds).** Only on a pilot GO. This is the
  publishable measurement.

**Kill rule:** pilot delta below the pre-registered threshold → document it,
kill the lever, move on. No confirm spend on invisible effects.

The gate is a sniff test, not a significance test. If you need 20 seeds and
a p-value to see the lever's effect, the lever isn't pulling hard enough —
redesign it or park it.

Wall-clock budget (hourly loops): the pilot must fit in ~15 minutes. The
confirm gets the rest of the run. If the pilot can't fit, shrink the horizon
first (section 10), then the seed count — never skip the gate.

## 10. Death-aware horizons (Steve 2026-10-12)

A fixed 200-day horizon is waste when villages die at day 63. Set the horizon
from the lever's question and the measured survival distribution:

- **Early-game levers** (landing, food basics, wave 1): 60 days.
- **Mid-game levers** (waves 2–3, knowledge, regional): 100 days.
- **Reachability levers** (waves 4–5, national, table, wins): 150–200 days.
- **Adaptive rule:** horizon = min(cap, p95 village-death day from the
  baseline sweep + 15 days tail). The baseline sweep gives you the survival
  distribution for free — use it.
- **Stop rule:** a seed whose village is dead or scattered stops simulating.
  Succession/epilogue behavior gets at most a 10-day tail, then the seed is
  done. Never tick a dead village to fill a horizon.

Quote the horizon choice and its reason in the evidence header (section 11).

## 11. Pre-register the run (Steve 2026-10-12)

The evidence file header states, BEFORE running:

- primary metric (one — the thing this run is trying to move),
- minimum meaningful effect (the GO threshold for the pilot gate),
- horizon + why (section 10),
- seeds (exact literals), policies.

Judge the run against its header. If the data makes you move the goalposts,
record the change in the evidence file as a correction — never a quiet edit.
A run that pre-registered honestly and killed its lever is a good run.

## 12. Convergence and lever budgets (Steve 2026-10-12)

Tuning converges; it doesn't just continue.

- A lever is **converged** when two consecutive tuning steps move the primary
  metric less than the meaningful-effect threshold, or the metric hits its
  design target. Say so in the evidence file and move to the next lever.
- **Budget:** 3 rounds without passing the pilot gate → park the lever,
  document why, move on. Sunk cost is not a strategy.
- Every run reports convergence state in one line:
  `converging | converged | parked | killed-at-pilot`.

---

## 13. Endgame distribution metrics (Steve 2026-10-12)

Once villages reach national in sims, measure the SHAPE of the endgame, not
just its reachability: are builds and strategies evenly distributed, or is
one overrepresented? And per Steve's design law, every villager must have a
potential path to godhood — the player is an advantage, not the only route.

Recorded per run (sweep-winstats-deep.js extended 2026-10-12), for each
national-reacher and winner:

- **endgame path**: the 7 paths (feared, indispensable, beloved, witness,
  defiant, assimilated, relay) x light/dark branch (14 endings).
- **ability-build composition**: full 6-slot ability IDs, synergy IDs +
  count, integration stage, codex breadth.
- **strategy**: policy name, scale road (LEAD / BELONG / COVENANT / TRADE /
  CONQUEST / none — see hierarchy.js:88), tribute vs primacy counts,
  seasoned-link count.
- **villager ascension**: Game.tableAscended() — which non-player villagers
  cleared the ascension bar, what distinguished them (abilities, teaching,
  notability, boldness, trust standing, relay held, facilitated acts), plus
  maxAscScore (highest non-player score — the blank-detector).

Analyzed by scripts/analyze-endgame-diversity.js. Verdict vocabulary:

- **even** — no path/build/strategy above ~40% share at current confidence.
- **skewed** — concentration on at least one axis (top category >=50%, or
  top two >=80%) — worth a lever look, not yet a verdict.
- **degenerate** — a single build/path/strategy owns the endgame (>=75%
  share, or >=60% at n>=30, with the runner-up at most half) — fix the
  balance; the endgame must admit many shapes.
- **insufficient-data** — fewer than 10 national-reachers/winners: no
  distribution claim possible. Never claim a pattern from n=3.

Confidence labels: n<10 insufficient-data | 10-29 suggestive | 30+ measured.
A **degenerate** verdict is a convergence blocker for the win-path axis.

Steve's ascension law is checked separately: if villagers effectively never
ascend across >=10 table-firing runs (0 ascensions, median maxAscScore far
below the 45 bar), NPC ascension is decoration — a blank to fill, not a
tuning problem.

---
