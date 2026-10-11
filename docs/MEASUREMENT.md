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
