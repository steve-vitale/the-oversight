# sim-trajfrag-b — pre-registration: trajectory fragility of seed-matched verdicts (DIAG)

**Arm:** sim-trajfrag-b (run fleshout-loop-b-20261107T0230Z, Loop B, axis
scale-onramp / winnability chain) · **DIAG only, zero src/js, no
gate/price/deed change.** Policy `scripts/policies/competent-stageally-a.js`
(staged) used verbatim on both legs; the only difference between legs is
the instrument (see below).
**Base:** master 5a4e3e4b5 · **Driver:**
`scripts/trajfrag-driver-20261107.js` (stageally-driver shape, staged
policy only) · **Instrument:**
`scripts/trajfrag-instrument-20261107.js` (one extra `Math.random()`
draw at day 0, after `setupGame`, before `runDays`) · **Analyzer:**
`scripts/trajfrag-analyze-20261107.js` · **Proof:**
`scripts/test-trajfrag-20261107.js` (GREEN before the evidence file is
written).

## Question

Seed 53004 re-run on anchor 2298a6069 DIVERGED from its corpus on anchor
2ff11cbf: Eulogy kill d78 → d79, killer died d90 in a TB Reunion → d82
in a TB Eulogy, village survived 150d → died d84. Staged 53006 and
baseline 53006 reproduced EXACTLY. Candidates for the mover: moot-gate
convening timing and/or the journey r132 crisis change (both sit between
2ff11cbf and 2298a6069). The question: how fragile are seed-matched
before/after verdicts to a one-day RNG shift — is 53004 an outlier or
typical? This arm answers with a CONTROLLED displacement (one extra RNG
draw at day 0) instead of an anchor diff, then bisects the anchor diff
to name the mover.

## Pre-registered primary metric

**Flip rate** = fraction of perturbed runs whose CLASS outcome differs
from the unperturbed run on the same seed. CLASS (three components,
all read off the per-seed JSON, never narration):
1. survival: `endReason` survived (incl. won) vs village-lost;
2. wave-4 kills: `waveKillLog` wave ≥ 4 count 0 vs ≥ 1;
3. living veterans at end: last daily row `readiness5.veterans` 0 vs ≥ 1.

A seed is **fragile** if ANY of the three components differs between
its unperturbed and perturbed runs; **stable** if none differs. The
flip rate is reported per seed and pooled (n = 4).

## DIAG-GO bar (binding)

DIAG-GO iff **≥ 3 of the 4 studied seeds are classified fragile/stable
WITH the FIRST diverging event named per flip** (death day, succession,
fight outcome, convening day — whichever the daily-row / kill-ledger /
death-ledger diff names first), **AND the anchor-diff candidate (moot
convening vs journey r132) is confirmed or excluded** by bisecting the
commits between 2ff11cbf and 2298a6069 (read-only staged re-runs of
53004; never commit on those anchors).

Per-seed record (judged): survival days, standing, wave-4 kills
(days + monsters), living veterans at end, wave-5 unlock; first
divergence day + field for every seed (even stable ones, where the
class holds but details may drift); instrument errors must be 0.

## Horizon, seeds, policy

- **Horizon: 150d, death-aware** (runDays ends on village death / win;
  §10 reachability horizon — waves 4–5, national, table, wins). The
  53004 divergence played out at d78–d90 in the corpus and d79–d84 on
  the verify leg; a shorter horizon would cut the phenomenon off.
- **Pilot: 53004 + 53006 first** (2 seeds × unperturbed/perturbed,
  staged policy) — the two seeds the killersurvive-a verification
  already ran on 2298a6069, so the unperturbed legs have a known
  expectation (53004 diverged vs corpus, 53006 exact).
- **Extend to 4 seeds** (add 53002 + 53008): both have wave-4 kills in
  the corpus (baseline leg: 53002 d143 Influencer wild, 53008 d92
  Strike + d109 Algorithm; staged leg 0 kills on both — the flip test
  still applies, 0 vs ≥ 1 can flip either way). Corpus check, staged
  leg: kills only on 53004 (d78 Eulogy) and 53006 (d89 Strike, d149
  Congregation). No other seed in 53001–53008 has a staged-leg kill.
- **Policy:** staged (`competent-stageally-a.js`) verbatim on ALL legs.
  The perturbation is the ONLY difference between the two legs of a
  seed: the perturbed leg draws `Math.random()` exactly once after
  `setupGame`, before `runDays`. The unperturbed leg draws nothing
  extra. The policy RNG stream (`__policyRandom`, derived from the seed
  in the harness) is untouched by the displacement — the shift is a
  game-RNG displacement only, and the prereg records that scope.
- **Legs:** 8 judged runs total (4 seeds × 2). Corpus:
  `evidence/2026-11-07/perseed-trajfrag-b/` (8 files).

## Anchor-diff bisect (pre-registered method)

Staged 53004, 150d, stageally driver at each anchor, OUTDIR to /tmp
(never into the repo). Classify each anchor leg CORPUS-LIKE (Eulogy
d78, survive 150d) or VERIFY-LIKE (Eulogy d79, die ~d84) or OTHER
(neither — report the ledger). File evidence already narrows the
candidates before any bisect run: in 2ff11cbf..2298a6069 the only
loaded-code changes are 3e82c17d1 (`game.js` pocket_sand flee-order
fix + `hierarchy.js` raid-cooldown + `policies/competent.js`),
01d072575 + 2a33c6afc (`src/data/characterGen.json` convo dedupe),
e53e86531 (`betrayal.js` moot convening gate), 6aeba1c88
(`havenGrowth.js` narration gate only), 30fe8dc00 (`build.js` version
stamp only). The journey r132 commits (f1a070306 evidence-only;
b13016733 scripts + evidence only, a separate driver never loaded by
the stageally driver) touch NO code the stageally driver loads — the
r132 candidate is EXCLUDED on file evidence unless the bisect says
otherwise. Test order: 2ff11cbf (setup validation — must reproduce the
corpus exactly), then binary search over the loaded-code commits.
A bisect leg that reproduces NEITHER side is reported as OTHER, not
forced into a side.

## Seed-freshness record (band 53001–53008 — DELIBERATE REUSE)

- This is a **determinism study on the known band**. REUSE is
  deliberate: the question is only answerable on seeds whose corpus
  trajectories are already known. **No fresh band is claimed; no
  fresh-band verdict is drawn.**
- What was checked (2026-11-07, before writing this prereg): every
  `evidence/*/sim-*-prereg.md` naming 53001–53008 is a reference to the
  stageally-confirm band or a deliberate reuse of it (confirm prereg
  2ff11cbf; killersurvive-a, congtrace-a, baseline9-a, routstall-b,
  wanderspawn-a reuses; fightinterior-b / gorgeharness-a / mootgate-a /
  partydamage-b / proposefirst-b / tbend-a / entrycensus-a mention it
  only as the confirm band or a neighbouring arm's band). No
  forbidden-band list in the goal `hidden_files` names 53001–53008 as
  forbidden — the hits there are the convergence tracker and findings
  backlog recording the band's reservation/history. The congtrace-a
  prereg's reuse check (same conclusion) was re-verified, not copied
  blind: the grep was re-run for this arm.
- The 4 studied seeds are the pilot pair (53004, 53006) plus 53002 and
  53008, all inside the band. No new band is consumed.

## Wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, median survival — for the
unperturbed and perturbed corpora separately, from the instrument's
own per-seed JSONs.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js` runs its own full panel (16 seeds × 4
  policies × 150d) and takes no corpus input; there is no game-code
  change in this arm (DIAG, zero src/js) and no armed-vs-baseline
  policy pair to compare — the comparison is unperturbed vs perturbed
  on the SAME policy. No compare `.md` is fabricated; the matched-seed
  paired comparison is the analyzer output. Same outcome as the
  stageally confirm, killersurvive-a, and congtrace-a arms.
- Telemetry: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-07/perseed-trajfrag-b/*.json' --metrics
  national,table,wins,exiled` will be attempted and the result
  reported honestly (prior arms: refused on recorder corpora carrying
  top-level anchorCommit).

## Sense test

Read the transcripts of any flipped seed (deathSays / fightLines
around the first divergence): judge whether the divergence reads as
the same village with one day shifted or as a different village —
meaning and coherence, never just counts.

## What this arm does NOT claim

- Not a lever verdict: nothing is tuned, no GO/NO-GO on any game
  change. The verdict is DIAG-GO / DIAG-NO-GO on the fragility
  classification + bisect answer.
- Not a fresh-band result: all verdicts are about determinism on the
  known band.
- Not a win: 0 wins expected on either leg; no wave-5 anything
  expected on this band (confirm: 0/8 both legs).
- The perturbation is a one-draw displacement of the GAME RNG stream
  only; the policy stream is untouched. A "stable" classification
  means stable under THIS displacement, not under all RNG shifts.

## Metric review (to be filled in the evidence file)

Pre-registered metrics bind this run (§14). A miss is a miss; if the
CLASS taxonomy proves wrong (e.g. a flip that changes nothing a
player would notice, or a stable class hiding a total trajectory
rewrite), it is written up under "metric review" and a revised metric
proposed for the NEXT run — never re-scored here.
