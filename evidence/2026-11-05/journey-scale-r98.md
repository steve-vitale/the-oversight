# journey-scale r98 — Lane A, leg 3 SCALE (2026-11-05 morning)

**Run id:** laneA-scale-2026-11-05T00:45CST (scheduled 00:45 CST 2026-11-05).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@b79821db8 at branch creation.
**Pre-register:** evidence/2026-11-05/journey-scale-r98-prereg.md
(committed as a76a06949 before any scored seed ran).
**Change set at closeout:** ZERO src/js. Tooling (morntrace2 policy clone,
driver/analyzer clones, labels + logging only, diffs verified) + evidence +
run note. Gating freeze honored; perception law honored (all instruments
read-only; pickers press offered menu items only).
**Fix-gate verdict: no src/ change.** The trace identifies a mechanism (the
morning drink — see Q1) but the fix is a policy/behavior question (should
competent carry/fill water before a pilgrimage?), not a proven mechanic
change. Per clause (a) discipline, a trace alone does not meet the gate.

## Infrastructure notes (loud, first)
- **EPERM flap blocked registration ~06:44–07:48 UTC** (~64 min of
  refusals; earliest artifact a sibling `flap-mimic.lock` 06:36). Git ref
  writes fail (`couldn't write .../refs/heads/journey-scale.lock`),
  registry atomic writes fail, O_EXCL file creation refused
  filesystem-wide (/tmp, ~/workspace, .git) while plain writes flap on/off
  minute to minute. ~13 failed register attempts across direct tries and
  retry loops. One isolated window 07:08:24 (the two Lane A sibling loops
  heartbeated; my O_EXCL probe succeeded the same second) — the only
  window in ~70 min. The flap cleared ~07:48:30 (O_EXCL 3/3); the tree
  registered 07:54:59; heartbeat 07:55:07Z verified by registry read-back.
  No evidence file anywhere in the repo was written 06:30–07:48 UTC — the
  flap stranded every loop, and the two Lane A siblings' heartbeats went
  36+ min stale through no fault of their own (a live run looking dead —
  the 2026-10-17 hazard, now observed in the wild).
- **Probe-design bug, own goal (not a game finding):** an O_EXCL probe
  that creates its file but fails the write leaves a 0-byte file behind,
  so every later probe fails EEXIST and the loop goes blind — the v2
  retry loop probed a stale `/tmp/probe-oexcl-gate` for 24 min and never
  saw the clearing window. Probe files must be unlinked on every outcome
  or use unique names. The window was caught by manual probes after the
  stale file was found and removed. Lane B (journey2-social r136) was
  retrying the same flap in parallel with its own tight loop.
- **Safe-commit index clobber struck on the prereg commit**, same class
  as r90/r94/r95/r96/r97: after the correct private-index commit
  (a76a06949, 4 files), the worktree's main index lied (4 files
  staged-as-deleted + untracked). Repaired via HEAD-blob cacheinfo,
  verified: `git status` clean, `git diff HEAD` empty, `git show --stat`
  correct (4 files, 1223 insertions). The commit itself was correct.
- Heartbeat loop verified by registry read-back (07:55:57, 08:05:58),
  10-minute loop, alive for the whole run.
- Lock discipline held throughout; lock deleted at closeout.
- A reaper artifact (`__reap_probe__.tmp`, 0 bytes, untracked in the main
  tree root) was removed by hand and the main tree re-verified clean —
  the reaper leaves it behind when its write is flap-refused.

## Q1 — OVERNIGHT HYDRATION DRAIN (binding; r97's carried micro-question)
**FINDING clause: INCONCLUSIVE on count — mechanism identified
descriptively.** Clause (i) required first-attempt vs retry nights to
separate on one candidate with ≥3 nights on each side; the band has only
2 retry nights (85503 d56, 85504 d50), so (i) does not fire. Clause (ii)
(burn-only prediction within ±10) fails: retry drains are 14 against
predicted burns of ~51–57. Neither clause was re-scored; the verdict is
INCONCLUSIVE by the pre-registered gate — and the mechanism is
identified anyway, at a finer grain than the clause specified.

The drain separates cleanly on **pack water carried into the night OR
fillable tile water at dawn**, across all 48 pilgrimage nights on the
band (analyzer: journey-scale-r98-analysis.txt, Q1c):

- **Loop nights, 28 total (85503 d37–d50 + 85504 d35–d48):** packW 0 at
  bedtime, dry forest_floor tile, drankNight 0 → drain 50–64, matching
  the predicted sleep burn (52–63, floored at 0 hydration). No drink,
  full burn, every night.
- **Retry nights, 2 total:** 85503 d56 drain 14 (92→78, packW 3→2,
  drankNight 1, burn~51); 85504 d50 drain 14 (86→72, packW 2→1,
  drankNight 1, burn~57). Same forest_floor tile as the loop nights —
  tile does not differ; pack water does.
- **Haven / creek nights (the contrast):** drankNight 1–2 even with
  packW 0 at bedtime, because the scholar fills at dawn — packW 0→3 at
  Haven (85503 d33), 3→6 at a creek (85501 d28) — drain −36..14.
- **Tent: 0 on all 900 morntrace2 rows.** The shelter candidate is
  ruled out: the scholar never pitches a tent on pilgrimage nights, so
  there is no variation to test.
- **Burn model holds for no-drink nights** (drain ≈ burn ±10, modulo
  the 0-floor when bedtime hydration is below the burn). One drink-night
  arithmetic outlier: 85503 d56 implied burn 64 vs predicted 51
  (diff 13) — burn-input timing noise (dayTicks grow during the sleep
  loop; the midnight weather roll), not a mechanism gap; the structural
  finding (drink vs no-drink) does not depend on it.

In plain words: a pilgrim who sleeps at a neighbour's fire with no
water in the pack and no water in the ground wakes parched, because
the night drinks a full day's metabolism (~50–64) and nothing replaces
it. A pilgrim who carries bottles — or sleeps where water can be
filled at dawn — drinks in the morning waits and wakes with water in
the body. The retry holds because the scholar arrives with bottles;
the loop starves because the scholar arrives with none.

**Carried, still open — why 0 bottles at first walk-out vs 2–3 at
retry walk-out:** 85503 leaves Haven with packW 0 on the first
walk-out day (d36 postCourt) but packW 3 on the retry walk-out day
(d55 postCourt); 85504 leaves with 0 (d34) vs 2 (d49). Same tile,
same scholar, same road. The next instrument needs pack weight
(canCarry) + cistern clean liters at postCourt on walk-out days.
One unexplained instance: 85501 d28 packW 3→5 on a dry tile in rain —
possibly rain-water addWater; noted, not chased.

## Q1b — MORNING TRACE (carried; r97 mover reproduces exactly)
Resets 14+14 COMPETENT on 85503/85504 (same segments, same days, same
counters as r97), 0 on 85501/85502. Held nights 25/19. The thirst-walk
mover stands; this run's question was the drain underneath it, not the
mover.

## Q2 — CENSUS CONTINUITY (report-only; r93–r98 metric unchanged)

| seed | end | day | pop | pantry | rank | seat | arc | seasoned peers (final) | shape |
|---|---|---|---|---|---|---|---|---|---|
| 85501 | over (pantry 0) | 38 | 3/3 | 0 | village | none | 3 | 0 (lead 38/13d) | early hunger |
| 85502 | over (pantry 0) | 29 | 6/6 | 0 | village | none | 3 | 0 (lead 20/4d) | early hunger |
| 85503 | over (pantry 0) | 121 | 1/1 | 0 | regional | lesser waiting | 4 | 1 (lead 70/96d; covenants 29/25/30, trade 29/28) | trust-blocked |
| 85504 | over (pantry 0) | 113 | 0/0 | 0 | regional | lesser waiting | 4 | 1 (covenant 60/60d; lead 30/87d) | trust-blocked |

National staged 0/4, courtNational answers 0/4 — same as r96/r97. The
two long-lived villages again die with a lesser seat waiting (arc 4),
and again each holds exactly one seasoned bond while the rest sit 2–15
trust short of the 40 bar. No dissolution timeline exists on this band
either.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96/r97)
Corpus: d90 on 85503 and 85504 only (85501/85502 died before day 90;
no day substitution, per prereg). 2 of 2 fully real — and both
reproduce r97's sittings trip-for-trip (same seeds, same villagers),
which is also a determinism check on the instrument.

- **85503 d90 Yoleida (florist, fidgety, trust 24, Spanish-only,
  nonverbal):** the r97 fix is visible in the wild transcript — the
  Mario-moment fragment now reads "They nod back, a little quicker
  this time. "Fuck you." — they grin, proud of the one English they
  know." Pride, not hostility. The mimed walking invitation, the
  nodding exchange with cycling narrations, and the gentle close are
  all as r97 found them. REAL, fix confirmed live.
- **85504 d90 Randa (tattoo artist, stoic, trust 91, ask_favor
  stage 1):** fully real and short, as r97: a real want ("The pantry
  run — I haven't stopped thinking about it."), a real commitment
  ("I'll come back to help."), and a concrete plan ("The far
  treeline, past the rocks, first light. Pack and knife. We travel
  light."). REAL.

## Village assessment (plain words)
Four villages, same shape as this morning and yesterday. Two never get
out of the first month: pantries run to zero and the flag falls while
people are still standing. The two that live past day 90 both reach the
region, both court their neighbours properly — pilgrimages walked and
studied, covenants sworn — and both die with a lesser seat still
waiting for them. Neither reaches a nation: each holds one seasoned
bond and a set of neighbours whose trust sits just short of the line.
The pilgrims, for their part, are thirsty in a way this run can now
name: a scholar who sleeps at a neighbour's fire with empty bottles
wakes parched and walks home to drink, fourteen mornings in a row,
while the same scholar with bottles in the pack drinks at dawn and
walks on. The water is the difference, not the walk and not the tile.

## Reachable / Fun / Winnable (leg verdict)
- **REACHABLE — PARTLY, unchanged from r96/r97.** Regional on 2/4
  seeds; national staged 0/4. The covenant road opens in play, but the
  season to hold a third seasoned peer is not reached on these seeds —
  trust-blocked, not unreachable.
- **FUN — YES, with the same honest caveat.** Conversations are
  genuinely good (Randa's pantry-run commitment; Yoleida's mimed
  invitation, now with its punchline framed as pride instead of a
  slur). The dull spot is the early-death band: two villages end
  before the leg's window (day 80) even opens.
- **WINNABLE — NOT YET.** No national, no global, no full seat on any
  seed; the lesser seat waits on 2/4 while the villages die. Behind
  this wall still sits the wave-4 kill wall from the November 3
  picture; this run faced no wave-5 content and claims no kill.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale.json --current
'evidence/2026-11-05/journey-scale-r98/journey-scale-r98-trust-*.json'
--metrics nationalLive,scaleRank` → "quiet (4 files, 2 metrics, no
large deviations)". Same caveat as r93–r97: that baseline is an old
aggregate shape, so "quiet" means "no large deviation on these two
metrics", not a clean bill. Baseline NOT rolled forward.

## Tests
- Pilot gate (pre-registered): seed 85503 ran first; pilgrimage trips
  present (363 morntrace2 rows) and all six new fields populate on
  every row (packW/tile/tent/wx/ticks/drank). Gate PASSED — full quad
  ran.
- Quad determinism: seeds 85501–85504 end days 38/29/121/113 reproduce
  r97 exactly; the morntrace2 instrument is behavior-identical (same
  trajectories as r97 on the same band).
- `node scripts/check.js --quick` (on the branch code,
  `--cacheDirectory=/tmp/jest-cache-playtest`): **284 passed, 6 failed
  in 697s.** The 6 are r97's same pre-existing failures (same files:
  godpath/test-measurement-proof-update, test-measurement-workflow,
  test-mobile-combat-cadence, test-occupation-panels,
  test-phone-frame-proof, test-establishment-r20-fixes-20261020).
  No trust-observer-neutrality timeout this time (103s, under the
  120s cap — passed). No failure touches this run's files: zero src/js
  touched, and the new driver/analyzer/policy-clone are never executed
  by check.js. Full log:
  evidence/2026-11-05/journey-scale-r98-checkquick.log.

## Metric review
- **Q1's FINDING clause failed on count, and the failure is
  instructive:** the first-vs-retry framing was the wrong cut. The
  band has 2 retry nights (need 3), but the drain separates on
  pack-water-or-tile-water across all 48 nights — a separator the
  clause named as a candidate but did not test. Proposed revision for
  r99: gate on the packW/tile-water separator directly (≥3 dry-tile
  packW-0 nights vs ≥3 packW≥1-or-fillable nights, both with a drink
  count attached) — this band already exceeds both counts (28 vs 20),
  so the revised gate is testable on the same band. No re-scoring was
  done in this run: the verdict stands as INCONCLUSIVE on the
  pre-registered gate, with the mechanism reported descriptively.
- **Burn-prediction tolerance:** the ±10 band is tight against
  burn-input timing (dayTicks at burn-time vs the postCourt snapshot;
  the midnight weather roll). r99 should snapshot dayTicks/weather
  after the sleep loop as well, or widen the tolerance for drink
  nights. The one outside-±10 case (85503 d56, diff 13) is timing
  noise, not a mechanism gap — stated, not hidden.
- Q1b's metric is unchanged from r97 (segment agreement) and behaves
  as designed; Q2's metric is unchanged from r93–r97; Q3's corpus
  rule held (d90 exists for 2 seeds; no day substitution).
- No pre-registered metric was re-scored mid-run.

## Harness
scripts/journey-scale-r98-20261105.js (r97 lineage: only labels/seeds/
EVIDIR + the morntrace2 output line changed; diff vs r97 verified:
labels + require path + one output line). Analyzer:
scripts/analyze-journey-scale-r98-20261105.js (r97 scans carried +
Q1c drain classifier; regex verified against fabricated postCourt and
entry rows before the pilot). Policy clone:
scripts/policies/scalecourt-nogate-morntrace2.js (r97 clone + six
logging-only fields + dDrank delta; diff vs r97 verified: comments +
fields only, no behavior line). Pilot seed 85503 x DAYCAP=180 ran
12s; full quad ran 51s. Per-seed evidence: goal hidden_files
evidence 2026-11-05 (journey-scale-r98/ per-seed files, transcripts,
analysis). Prereg + this note in repo evidence/2026-11-05/.

## Blanks: filled or documented
- FILLED (documented, mechanism traced — no game change, fix gate not
  met): the overnight hydration drain — the morning drink, gated on
  carried bottles or fillable tile water; tent ruled out (0/900 rows);
  burn model confirmed for no-drink nights.
- DOCUMENTED (no instance this run): national staging — 0/4, with the
  trust-short shape named per seed.
- CARRIED (next micro-question for r99): why 0 bottles at first
  walk-out vs 2–3 at retry walk-out (pack weight / cistern instrument);
  the d28 packW +2 on a dry tile in rain (possible rain-water addWater).
