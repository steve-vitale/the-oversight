# sim-approachguard-b — PREREG (binding, committed BEFORE any judged sim)

Loop B run fleshout-loop-b-20261104T2235Z, arm sim-approachguard-b.
12-seed GUARDRAIL RE-TEST of the combined approachfall variant, on the
confirm band 99601–99612, 140-day death-aware horizon.

## What this arm judges — and what it does NOT

This arm judges GUARDRAILS ONLY. Firing of the approach fallback is
already replay-PROVEN by sim-approachbranch-a.md (Loop B 1326Z: mark →
re-pick → strikes, through the real armed policy) and must NOT be
re-judged or claimed from this panel. Loop/firing counts from this
panel are reported descriptively only, never judged.

Why this re-test exists: the branch arm's 8-seed pilot panel breached
the starvation-totals guardrail (armed 7 vs baseline 2 + 2 = bar 4),
while its other two guardrail halves passed (player-flagged 1 <= 2;
median survival 83d >= 0.8 × 93.5d). The combined variant is therefore
blocked pending a 12-seed guardrail re-test before any land/kill
decision on the variant. This arm is that re-test.

## Band reuse — BY DESIGN, not a freshness violation

99601–99612 is the pre-stated confirm band named in
sim-approachbranch-a.md's metric review. Reusing it is the design:
the same band lets the guardrail question be re-asked at confirm
scale (12 seeds) on the same seeds. Master has moved since the
confirm ran, so trajectories are NEW — judge ONLY against THIS run's
own baseline leg, never against the confirm's numbers. Run no other
band; if the panel cannot complete on this band, FAIL LOUDLY — no
silent substitution.

## Design (fixed before any judged sim)

- Anchor commit (single-base judging): 3f92c4d3dba1037c148ea82ca5b4f9aed691d24b
  (all 24 legs share it; do not pull/rebase mid-sweep).
- Baseline = scripts/policies/competent.js VERBATIM.
- Armed = scripts/policies/competent-approachfall-b.js VERBATIM
  (COMPETENT_DIRECTIONAL_FLEE=1, COMPETENT_EXIT_VERIFIED_FLEE=1,
  COMPETENT_FLEE_REPAIR=1, COMPETENT_APPROACH_FALLBACK=1, DPS_RACE off).
- Policy-side only: ZERO src/js changes, no gate/price/deed/standing
  change, no default flip, no policy behavior change. Verified before
  any sim: `git diff HEAD` empty for both policy files.
- Horizon: 140 days, death-aware (dead villages stop simulating).
- Seeds: 99601–99612, both legs = 24 legs.
- Driver: scripts/approachguard-driver-20261104.js — a copy of the
  approachbranch driver (itself a copy of the confirm driver) with a
  NEW corpus dir evidence/2026-11-04/perseed-approachguard-b/ and a
  NEW filename prefix `approachguard-`, so no confirm
  (perseed-approachconf-b) or branch (perseed-approachbranch-a) file
  is ever overwritten. Instrument, horizon handling, and scale
  snapshot otherwise identical.
- Summarizer: scripts/approachguard-summarize-20261104.js — a copy of
  the approachbranch summarizer with the same prefix/corpus change.
- Counting rule (matches the confirm's, verified by test, not
  re-invented): a death record counts as starvation iff its cause
  string (cause || reason || kind) lower-cased contains 'starv';
  player-flagged subset = those records with player === true.
- Scale-wall numbers (reported every run, NOT judged): wins, national
  reached, table reached, wave-4/5 unlocks and faced, wave-5 kills,
  median survival, for both legs — measured from per-seed scale
  fields, never hard-coded.
- Balanced-panel note (§15, stated up front): no balance-panel.js
  compare is run — it takes panel.json.gz files from registry-policy
  runs, and the variant is not a registry policy (same reason the
  pilot and the confirm documented). The comparison is the
  pre-registered per-seed table + summarizer aggregates, never a
  fabricated panel compare.

## Canon note

No canon doc covers turn-based flee — stated here instead of inventing
canon. What covers it is in-code law in src/js/game.js (tbBarrierExit)
and Steve's 2026-11-02 ruling that monsters do NOT flee while players
CAN. This arm changes no src/js and no flee law; it only measures a
policy-side variant's guardrails.

## GO bar (binding, §14) — GO iff ALL THREE hold

- (a) starvation totals (confirm counting rule): armed <= baseline + 2.
- (b) player-flagged starvation: armed <= baseline + 2.
- (c) median survival: armed >= 0.8 × baseline median.

A miss on any half is NO-GO (guardrail breach) — it blocks landing
the variant but does NOT kill the fallback mechanism (replay-proven).
A miss is NO-GO, never re-scored against a friendlier metric mid-run.
Loop/firing counts are descriptive only, never judged.

## Sense-test (pre-registered)

Read the armed starvation deaths — verify each is a real late-game
starvation tele record, not a counting artifact — and read at least
one armed and one baseline fight transcript. Judge meaning and
coherence, never just counts. Flag anything robotic.

## Proofs (committed before judged sims where stated)

- scripts/test-approachguard-20261104.js proves: the counting rule
  matches the confirm's; the summarizer filter matches only the 24
  new files; and gate-off control is byte-identical (the variant
  file untouched). Run before the sweep and again after it.
- The prereg itself is committed before any judged sim (this file).
