# sim-standing199-a — PREREGISTRATION (written BEFORE any judged sim)

- Run: `fleshout-20261111T0215Z`, Loop A, arm `sim-standing199-a`,
  worktree `~/workspace/worktrees/sim-standing199-a`, branch `sim-standing199-a`.
- Base: master `cb7cd6695` (Loop A 0115Z coordinator evidence).
- Question (backlog #2098, Loop A 0115Z next-blank #3): what holds villages
  at standing 199 — a stage gate, a cap, or a points-source exhaustion?
  The #2098 observation (sim-knowledge-b, band 170217–170224, 100d):
  standing at day 100 is **199 on five seeds, 325 and 500 on the two
  wave-5 seeds**. Knowfood-a (band 170225–170232) reproduced the plateau
  stronger. This arm reads it on CURRENT master on a fresh band.
- Canon read first: docs/CANON.md, docs/SCALE.md, docs/SCALE-DISCOVERY.md.
  Prior reads: evidence/2026-11-10/sim-knowledge-b.md (§ Wall numbers),
  evidence/2026-10-23/sim-defer5gate.md, evidence/2026-11-09/sim-standaccum-b.md
  (superseding note: links DO form but trust decays, none counts),
  evidence/2026-10-29/sim-fullseat-a.md (#1448 ranked next: standing-199
  dynamics, what decays it — 76003: 197→100).
- Zero src/js. No default flip, no lever, no build. DIAG only.
  Steve-call #2067 (near-miss path) is NOT decided here — report only.

## Accumulation-code question, stated before the pilot (to be answered with citations)

`src/js/standing.js` `villageStandingTotal()` (lines 173–201) gates the
unlock number in three layers, all of which can hold the gated total at
t5−1 = **199** (t5 = 200, t4 = 100):

1. **PLENTY CAP** (line 182): raw >= t5 but capped < t5 → hold `{bound:
   t5-1, kind: 'cap'}`. Plenty counts at most `plentyCapT5` (100) toward
   the T5 bar; bread alone cannot buy wave 5.
2. **COMBAT-READINESS DEFERRAL** (lines 183–184): capped >= t5 but
   `waveCombatReadiness(5)` not ready → hold `{bound: t5-1, kind:
   'defer5'}`. Four bars from LIVE village state, demand
   `readyDemand[5]` = armored 4 @ P>=15, armed 6, tricks 3, veterans 2
   living wave-4+ killers (lines 209–313). The defer4 twin (line 183)
   holds at t4−1 = **99**.
3. **MONOTONIC PEAK RATCHET** (lines 190–198): once the gated total
   releases a wave, `_standingPeakWave` floors the total at that wave's
   threshold forever — a released wave never re-locks.

So "199" is, in code, a **gate hold**, not a cap on the raw number:
`villageStanding()` (raw) can sit at 210–405 while the gated total pins
at 199 (standaccum-b: 99102 raw 210, 99103 raw 405, 99107 raw 320, all
gated 199). The third candidate — **points-source exhaustion** — is raw
standing never reaching 200 at all (war + diplomacy + capped plenty <
200: no more ledger points to earn, no counting links, no more feasts).
The pilot must separate the three per seed, from the daily trajectory,
not from the end snapshot: end snapshots mislead on decay bars
(defer5gate metric review).

## Primary metric

Per-seed pin classification, computed from the daily snapshot trace
(raw, gated, capped, war/diplomacy/plenty split, readiness-4/5 bars,
peak wave), with the classification rule below. The GO bar is on the
classification, never on a preferred outcome.

## DIAG-GO bar (binding, §14)

DIAG-GO iff ALL of:

1. **8/8 seeds classified** into exactly one trajectory class
   (rule below), with the binding cause named per seed — or the seed
   passed 199 with the release mechanism named.
2. **The accumulation-code question answered with citations**:
   for each class, the code path (standing.js line refs) that produces
   the observed pin, and which of gate / cap / exhaustion it is.
3. **0 instrument errors** on all 8 seeds.
4. **Wall numbers reported**: national / table / wins, wave 4–5
   unlocks, median survival, death-cause shares.

A miss is DIAG-NO-GO, never re-scored against a friendlier metric
mid-run. If the metric proves wrong, it goes under "metric review"
for the NEXT run.

## Trajectory classes (precedence-ordered, mechanical)

Computed by the analyzer over the daily trace. `pinned199` = a day with
gated == 199 and raw >= 200 (raw >= t5). `pinned99` = a day with gated
== 99 and raw >= 100. `released` = peak wave reaches 5 (gated >= 200
with rd5 ready on some day).

1. **released** — peak wave 5 reached; report first-release day, gated
   at release, and the readiness bars on that day.
2. **defer5** — >= 1 pinned199 day AND on the first pinned199 day the
   hold is defer5 (capped >= 200 and rd5 not ready). Report: days
   pinned at 199, first-pin day, the short bars at first pin (with
   counts vs demand), and the near-miss structure (closest approach:
   max bars simultaneously met; days with 3/4 bars met; days with
   veterans 1/2, i.e. one living veteran away).
3. **plenty-cap** — >= 1 pinned199 day AND on the first pinned199 day
   the hold is cap (raw >= 200, capped < 200). Report days pinned,
   first-pin day, raw vs capped gap.
4. **mixed-199** — pinned199 days exist with BOTH hold kinds on
   different days (cap on some, defer5 on others). Report the day
   split (cap-days vs defer5-days) and the first-pin kind. (Not a
   failure of classification — the split IS the classification.)
5. **standing-short** — never pinned199, never released, peak raw <
   200. Points-source exhaustion. Report peak raw, the source split
   at peak (war / diplomacy / plenty), and which source is closest
   to moving (e.g. ledger points 1 short, links 0 counting).
6. **defer4-pin** — pinned99 days exist and no pinned199 day and no
   release. Report days pinned at 99 and the short rd4 bars.
7. **unclassified** — anything else. Counts as a classification
   failure against bar 1 (must be 0).

Precedence: released > defer5 / plenty-cap / mixed-199 (by first-pin
kind; mixed only when both kinds occur) > defer4-pin (only when no
199 pin) > standing-short (only when no pin at all). A seed that pins
at 199 AND later releases is **released** (report the pin days too).

## Per-seed capture (what the instrument records daily)

- raw, gated, capped (`standingPlentyCappedTotal`), war / diplomacy /
  plenty split, ledger points per wave (3/4/5), feast log (qualifying
  count), link roll (seasoned / regional+ / reason per link).
- `waveCombatReadiness(4)` and `(5)`: per-bar counts vs demand,
  short list, ready flag. Living veteran vids (wave-4+ killers alive
  that day) + veteran deaths (a living veteran vid disappearing
  between snapshots, with the day).
- `standingLine()` daily (the sense-test source — the engine's own
  honest readout; the say sample is secondary, see metric review).
- A tight say sample: lines matching `/^Standing \d|HELD at wave|draft
  (stays|waits)|blood your fighters/` (cap 150/seed), only around pin
  days in the analyzer's sense read.
- End state: scaleRank, unlockedWave, won, endReason, days, memorial
  roll (`memorialRoll()`) for death-cause shares.

## Horizon + why

**150d max, death-aware** (runDays ends on village death / win; dead
villages stop simulating, +10d tail max by harness convention).
Why 150: knowledge-b's 100d horizon already shows the plateau at day
100 (5/8 at 199), but a 100d window cannot show whether the pin
resolves (release) or decays (76003: 197→100). Standaccum-b's 150d
showed a release at d106 and pin days into the 130s. 150d gives the
pin time to form AND resolve while staying inside the death-aware
convention; median survival on recent competent bands is 116–132d,
so most seeds are death- or horizon-capped inside the window, not
truncated by it.

## Seeds + policy

- **Band 170233–170240 (8 seeds).** Fresh — see seed-freshness record
  below. Policy: `scripts/policies/competent` VERBATIM. Default env
  (no VETSHAPE, no overrides). No game-code change.
- Pilot = the full 8 seeds (no separate confirm; this is a DIAG, the
  pilot IS the corpus, per §9 — 8 seeds before any confirm spend, and
  there is no lever to confirm).

## Instrument + proof

- Instrument: `scripts/standing199-instrument-20261110.js` (daily
  snapshots per the capture list above; wraps nothing in the engine
  except a read-only `Game.say` tap for the tight say sample).
- Driver: `scripts/standing199-driver-20261110.js`
  (`DAYS=150 SEEDS=170233,...,170240 RUN=standing199-pilot`).
  Per-seed JSON to `evidence/2026-11-10/perseed-standing199-a/`.
  Refuses to overwrite an existing per-seed file.
- Analyzer: `scripts/standing199-analyze-20261110.js` (pure,
  deterministic — two runs byte-identical on the same corpus).
- Proof: `scripts/test-standing199-a.js` — fixture tests for every
  trajectory class (incl. mixed-199, cap-vs-defer5 first-pin
  precedence, decay derivation, veteran-death derivation), a live
  harness smoke leg (1 seed, 30d, breakdown reconciles exactly:
  raw == war + diplomacy + plenty; capped == war + diplomacy +
  min(plenty, 100); gated == 199 ⟺ a hold recomputes from the
  snapshot fields), and a determinism leg. Proof runs BEFORE the
  pilot is judged; the pilot runs only after the proof is green.

## Seed-freshness record (local_seed_band_freshness skill — full search)

- Chosen band **170233–170240**, checked 2026-11-10 before this prereg:
  - `grep -rn -E '170233|170234|170235|170236|170237|170238|170239|170240'
    evidence/*/sim-*-prereg.md` (728 prereg files) — **NO hits**.
  - `grep -rn -E '170233|...|170240' evidence/ --include='*.md'` (all
    dated evidence markdown) — **NO hits**.
  - `grep -rn -E '170233|...|170240'` over
    `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/`
    `convergence-tracker.md`, `sim-findings.md`, `lever-claims/` —
    **NO hits** except this run's own claim file
    (`lever-claims/fleshout-20261111T0215Z.json`), which names
    170233–170240 as THIS arm's assigned band — the assignment, not
    a prior use.
  - Forbidden / already-used bands avoided (named in the
    knowledge-b and knowfood-a preregs and the task brief):
    160209–160216 (medcure), 170201–170208 (spawncensus/diplo),
    99101–99108 (secondlink/standaccum), 96301–96308
    (medicdiag/medicduty), 58201–58208 (sicknessdiag),
    95205–95208 (medchannel), 99201–99208 (standacc), 170209–170216
    (diplo confirm, named-not-spent), 170217–170224 (knowledge-b
    pilot), 170225–170232 (knowfood-a pilot). None is 170233–170240.
  - Near-miss names checked and cleared: the "17001–17024" screen
    range named in 2026-11-04/05 preregs (bankadded-a,
    awaynaming-rereg-a, enddaybeats-a, etc.) is a FIVE-digit range
    (seeds 17001–17024), not 170233–170240; the "17020 / 17023"
    loop-day citations in sim-gossipcensus-a / sim-findings.md are
    loop-day numbers on seeds 17020/17023, not seed bands. The
    knowfood-a prereg's 10 false-positive files (decimal substrings
    inside long floats in old panel JSONs) were re-checked by the
    exact-number grep above — none contains 170233–170240.
- Conclusion: **170233–170240 is fresh.**

## Decay cases (the #1448 question, in scope)

For every seed, the analyzer reports: peak raw and its day, end raw,
and the raw delta decomposed by source (war / diplomacy / plenty)
between peak-raw day and end (or death). A decay case is a seed whose
raw falls >= 50 below its peak (the 76003 shape: 197→100). For each
decay case: which source fell, by how much, and on which days
(ledger-point loss = killer deaths? diplomacy loss = link
trust/seasoning loss? plenty loss = feast-log cap? — the feast log
only grows, so a plenty fall is impossible by construction; say so
if the numbers agree). Veteran deaths are named by day from the
living-veteran-vid trace.

## Sense-testing (SENSE-TESTING LAW)

Read the `standingLine()` rows on pin days and the tight say sample
around first-pin days. Judge: does the pin read sensibly in-world
(the System naming the short bars, the village knowing it is not
ready), or does the fiction promise a road the numbers never open
(the standaccum-b tension: "season your alliances" while bonds read
0)? Quote verbatim. The standingLine rows are the sense-test source;
the say sample is secondary (standaccum-b lesson: loose filters
fill the cap with fight/storm noise).

## Findings outside the arm

List under "Findings for the backlog" in the evidence file. Do NOT
edit sim-findings.md (the coordinator appends).

## Metric review (to be filled after the pilot — §14)

- (filled in the evidence file; no metric moved mid-run.)
