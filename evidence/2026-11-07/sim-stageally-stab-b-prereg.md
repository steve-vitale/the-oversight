# sim-stageally-stab-b — pre-registration: staged-trajectory stability, mechanism half (DIAG)

**Arm:** sim-stageally-stab-b (run fleshout-loop-b-20261107T0530Z, Loop B,
axis scale-onramp / winnability chain) · **DIAG only, zero src/js, no
gate/price/deed change.** Staged policy
`scripts/policies/competent-stageally-a.js` used verbatim on its legs;
the bisection variants are policy-side toggles only, each its own file.
**Base:** master b690777cc · **Driver:**
`scripts/stab-driver-20261107.js` (stageally-driver shape, all policies)
· **Draw census:** `scripts/stab-instrument-20261107.js` (counting
`Math.random` wrapper + per-hook draw accounting) · **Analyzer:**
`scripts/stab-analyze-20261107.js` (trajfrag CLASS + first divergence +
`scripts/stageally-trajdist-20261107.js` D metric, reused not
re-derived) · **Proof:** `scripts/test-stageally-stab-20261107.js`
(GREEN before any judged sim).

## Question

The confirm2 re-run (sim-stageally-confirm2-b) went GO on the same band
where the confirm went NO-GO, with no change to the lever. Its
trajectory-distance section showed the flip is master movement amplified
through a fragile staged trajectory: 53006 staged moved D=13.65 between
masters while its baseline moved D=0.133; 53007 staged 8.74 vs baseline
4.42. trajfrag-b proved the fragility shape on the staged leg alone
(one extra day-0 draw flips 3 of 4 seeds). Master has NOT moved since
0420Z except the proofrefresh evidence commit (b690777cc, no src/js),
so a "re-check the GO on the next master" is impossible this run. This
arm does the mechanism half instead (tracker 0420Z blank 2, second
half): (a) count and locate the staged leg's extra RNG draws vs the
baseline — which staged subsystems draw, how many per day; (b) inject
one extra draw at day 0 on the staged leg AND on the baseline leg and
measure the flip rate on each; (c) bisect by neutralizing one staged
subsystem at a time (policy-side toggles only) and re-measuring the
staged flip rate.

## Pre-registered primary metric

**Flip rate** = fraction of seeds whose CLASS outcome differs between
the unperturbed and perturbed legs of the same policy on the same seed.
CLASS is trajfrag-b's, read off the per-seed JSON, never narration:
(1) survival: `endReason` survived (incl. won) vs village-lost;
(2) wave-4 kills: `waveKillLog` wave ≥ 4 count 0 vs ≥ 1;
(3) living veterans at end: last daily row `readiness5.veterans` 0 vs
≥ 1. Pair-formed flip (pair days > 0 on exactly one leg) is a
secondary, reported alongside, never the verdict. The D metric
(`stageally-trajdist-20261107.js`, reused verbatim) is reported for
every injected pair.

## DIAG-GO bar (binding)

DIAG-GO iff **BOTH** hold:
1. **The injection reproduces a staged-vs-baseline flip gap:** staged
   flip rate ≥ 3/8 AND staged exceeds baseline by ≥ 2 seeds on band
   53001–53008. (trajfrag's staged-only flip rate was 3/4 on 4 seeds;
   the gap bar is set so a one-seed wiggle cannot pass it.)
2. **The bisection names a subsystem:** neutralizing one staged
   subsystem (rally, invites, or pending) cuts the staged flip rate
   by ≥ 50% (e.g. staged 4/8 → variant ≤ 2/8), with the other
   variants reported alongside.

If (1) holds but no subsystem dominates, the verdict is **DIAG-NO-GO
with the measured gap table** (the gap is real, the mechanism is not
isolated — not re-scored). If (1) fails, **DIAG-NO-GO** and the
bisection is not run. Instrument errors must be 0 on every judged leg.

## Horizon, seeds, policies

- **Horizon: 150d, death-aware** (runDays ends on village death / win;
  §10 reachability horizon — waves 4–5, national, table, wins). The
  confirm2 pair formed on days 52–149; a shorter horizon would cut the
  phenomenon off.
- **Seeds: 53001–53008, DELIBERATE REUSE** (same band as trajfrag-b
  and confirm2-b; see freshness record below). No fresh band is
  claimed; no fresh-band verdict is drawn.
- **Stage 0 — smoke (proof live legs, /tmp, unjudged):** wrapped 53006
  staged 150d must reproduce the confirm2 corpus headlines exactly
  (150d, standing 440, 11 wave-4+ kills, maxWave 5, 2 end veterans);
  wrapped 53006 staged perturbed 150d must reproduce the trajfrag
  perturbed leg (73d lost, standing 195, 1 wave-4 kill, 0 veterans,
  maxWave 4). The smoke also proves the counting wrapper changes
  nothing (same values, same order) and counts > 0 draws.
- **Pilot = part (b), 8 seeds × 4 legs (32 runs):** baseline
  unperturbed, baseline perturbed, staged unperturbed, staged
  perturbed. The pilot IS the 8-seed gate: the bisection (confirm
  spend) runs only if the pilot gap bar (1) holds.
- **Bisection = part (c), 3 variants × 8 seeds × 2 legs (48 runs):**
  `competent-stageally-norally-b` (staged daily + pending, base
  competent fight — rally removed), `competent-stageally-noinvites-b`
  (rally kept, stageParty removed — daily is base competent only),
  `competent-stageally-nopending-b` (staged verbatim except pending
  returns false — NULL CONTROL: pending is record-only, so this
  variant must measure the same flip rate as staged; a different
  rate falsifies the method, not the game).
- **Policies frozen:** baseline = `scripts/policies/competent.js`
  verbatim; staged = `scripts/policies/competent-stageally-a.js`
  verbatim. No env gates, no tuning, no src/js. The displacement is
  the ONLY difference between the two legs of a seed-policy pair: the
  perturbed leg draws `Math.random()` exactly once after `setupGame`,
  before `runDays` (trajfrag instrument, reused). The policy stream
  (`__policyRandom`, derived from the seed in the harness) is
  untouched — the shift is a game-RNG displacement only.
- **Corpus:** `evidence/2026-11-07/perseed-stageally-stab-b/` (32 pilot
  files + up to 48 bisection files; each carries `rngDraws` from the
  census instrument).

## Part (a) — draw census (method, pre-registered)

After each `loadGame`, the driver installs a counting wrapper on
global `Math.random` that delegates to the seeded mulberry32 closure
installed by the harness (same function object the game captured, same
values in the same order — the wrapper cannot change a trajectory,
only count). Per seed the driver records: total draws, setup draws
(`setupGame`), per-day draw totals (counter sampled at each daily
snapshot), and per-hook draw deltas — counter reads bracket each
policy-hook invocation, split as daily-base (`competent.daily`),
daily-stage (`stageParty`), fight (rally + base fight), pending.
Stack sampling (every 100th draw, bucketed by first `src/js/` frame)
locates the biggest draw sites. **Coverage caveat, stated up front:**
a few modules capture `Math.random` into a top-level local at load
(`betrayal.js`, `comms.js` — IIFE-scope `const R = Math.random`, plus
any others the census names), and draws through those locals bypass
the wrapper. The staged-vs-baseline DELTA is the estimand and both
legs share the same bypass, so the delta stays valid for the staged
subsystems' draws; the ABSOLUTE total is a lower bound and is
reported as such, with the bypass census attached. If the proof live
leg counts 0 draws, (a) reports per-hook stats + static census only
and the gap is recorded, not fudged — the DIAG verdict never rests
on (a) alone.

## Seed-freshness record (band 53001–53008 — DELIBERATE REUSE)

- This is a **determinism study on the known band**. REUSE is
  deliberate: the question is only answerable on seeds whose corpus
  trajectories are already known (confirm2-b, trajfrag-b). **No fresh
  band is claimed; no fresh-band verdict is drawn.**
- What was checked (2026-11-07, before writing this prereg): the band
  is named in the confirm2 and trajfrag preregs as the stageally band
  and its deliberate reuse; no forbidden-band list names 53001–53008
  as forbidden (the hits in the goal `hidden_files` are the
  convergence tracker and findings backlog recording the band's
  reservation/history). This arm consumes no new band.
- The reuse is the SAME band the task brief orders (53001–53008);
  the brief's "if you need any fresh band, run the freshness check
  first" does not arise — no fresh band is used.

## Wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, median survival — for the
unperturbed and perturbed corpora separately, from the instrument's
own per-seed JSONs, per policy leg.

## Balanced panel (§15) and telemetry

- DIAG arms take no panel: no game-code change (zero src/js) and no
  armed-vs-baseline policy pair is the comparison — the comparison is
  unperturbed vs perturbed on the SAME policy, plus flip-rate gaps
  across policies. `scripts/balance-panel.js` runs its own full panel
  and takes no corpus input. No compare `.md` is fabricated. Same
  outcome as trajfrag-b, confirm2-b, killersurvive-a.
- Telemetry: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-07/perseed-stageally-stab-b/*.json' --metrics
  national,table,wins,exiled` will be attempted and the result
  reported honestly (prior arms: refused on recorder corpora carrying
  top-level anchorCommit).

## Sense test

Read the transcripts of any flipped seed (deathSays / fightLines
around the first divergence): judge whether the divergence reads as
the same village with one day shifted or as a different village —
meaning and coherence, never just counts. Read the staged invite /
rally lines on a flipped seed for the same check.

## What this arm does NOT claim

- Not a lever verdict: nothing is tuned; the displacement is an
  instrument, not a change to the game. There is no GO/NO-GO on any
  game change here.
- Not a fresh-band result: all verdicts are about determinism on the
  known band 53001–53008, deliberately reused.
- Not a win: 0 wins expected on either leg; no national, no table.
- Not a claim that a "stable" seed is robust: stable means stable
  under ONE extra draw at day 0. A different displacement could flip
  it (trajfrag-b's scope note, unchanged).
- Not a claim that the named subsystem is wrong: the bisection names
  the amplifier; whether the subsystem's behavior is good is the
  owning arm's question, not this one's.
- The draw census total is a lower bound (see coverage caveat); only
  the staged-vs-baseline delta and the per-hook splits are claimed
  as measured.

## Metric review (to be filled in the evidence file)

Pre-registered metrics bind this run (§14). A miss is a miss; if the
CLASS taxonomy or the flip-gap bar proves wrong (e.g. a flip that
changes nothing a player would notice, or a stable class hiding a
total trajectory rewrite — the trajfrag 53004 shape), it is written
up under "metric review" and a revised metric proposed for the NEXT
run — never re-scored here.
