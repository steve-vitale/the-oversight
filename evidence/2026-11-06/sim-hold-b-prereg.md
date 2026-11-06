# The HOLD — PRE-REGISTRATION (arm sim-hold-b)

Run: fleshout-loop-b-20261106T0930Z (Loop B, adoption arm). Axis:
scale-onramp / winnability chain — the hold is the next blank after
sim-linkseek-b (GO/GO, merged 430fd80ac). POLICY-SIDE ONLY, zero
src/js. No gate/price/deed/readyDemand change. No game-code change.
Committed BEFORE any judged sim. Do NOT rebuild villager-initiated
bonds (separate main-session build). Do NOT touch Loop A's live arms
(sim-lingergorge-a, sim-mootsummon-a) or their trees.

## Adoption note (this run)

The first HOLD worker died at 10:28:32Z from a runtime transport
failure ("sqlx error: pool timed out") — infrastructure, not a
verdict. Its work survives uncommitted in this worktree and is
ADOPTED here, not redone: the instrument
(`scripts/hold-instrument-20261106.js`), driver, eater analyzer,
analyzer, and proof suite (`scripts/test-hold-20261106.js`, 28/28
PASS on adoption) plus three Stage-0 smoke legs (58001–58003,
linkseek leg only, run "hold-stage0", anchor 08e8a6650, zero
instrument errors). FIXED on adoption (see evidence file): the
eater analyzer over-attributed — coverage 1.26 / 2.16 on 58002 /
58003 — because coalesced grief (GRIEF COALESCES: no haircut
lands) was counted at -8 whenever mourning extended, and
_trustGain gains were counted at full nominal value while mourning
choked them to 0. After the fix, coverage is 1.000 on all three
smoke seeds, including a newly attributed titan-strike eater (-5).
BUILT here: the hold lever itself (`scripts/policies/linkseek-hold.js`)
and its proof tests (test sections 5–6). The smoke legs are UNJUDGED
smoke output: they inform the lever design, they are NOT judged
numbers and count toward no verdict. The judged pilot re-runs all
8 seeds as judged legs (run "hold-pilot") after this prereg commits.

## Canon read before this prereg

- `docs/CANON.md` (manifest). No canon doc covers link trust /
  tribute mechanics in full — stated here, not invented: the
  mechanism lives in `src/js/standing.js` (`_linkRegionalPlus`),
  `src/js/hierarchy.js` (`polityOf`, `tendLink`, `linkTick`,
  `successionCrisis`, `theirLeaderDied`, `answerRenegotiation`,
  `_trustGain`, `_linkNeglected`), and the leadcourt/linkseek
  policy (tends, tribute). There is no canon doc to cite for the
  hold; the evidence file says so.
- `evidence/2026-11-06/sim-linkseek-b.md` + its prereg (the GO/GO
  this arm continues): links form at trust 30, need 40+ at day 30
  to season; weekly tend +8 (leadcourt rule, pantry>20000); the
  moment the third subordinate seasons the realm exists and
  diplomacy jumps 0 → 102 in one step; pooled 16 seeds: seasoned
  links 11/16 armed vs 0/16 baseline, end-rank national+ 8/16
  armed vs 0/16 baseline, wins 0/16 both. What blocks it is the
  HOLD: trust bleeds faster than weekly +8 tends on ~half the seeds
  (40 → 8 over 86 days on 57007's Emberhold link; 47 → 6 in 37 days
  then dissolved on 57008; 30 → 0 on 56006).

## The instrument's answer (Stage-0 smoke, 58001–58003, linkseek leg)

Per-link-week eater attribution, coverage 1.000 on all 3 seeds
(pooled 9 links, 52 link-weeks). Positive: tend +184 (23 landed),
accord-gift +90 (9, once per link), aid-offer-accepted +48 (12),
aid-beg-gave +16 (4), tribute-paid +14, tribute-waived +21.
Negative: speaker-death -152 (19 REAL haircuts — the first
instrument run counted 52 by mistaking coalesced grief for
haircuts; corrected), renegotiation-lapse -78 (13 beats staged,
13 lapsed unanswered), tribute-shortfall -2 (1 event),
aid-beg-refused -5 (1), titan-strike -5 (1). Zero: succession
grief priced-in 38 events, tribute gains choked by mourning
8 events. Tend weeks: landed 23, missed-opportunity 0, guard-blocked
22, choked 9. Guard-blocked-day pantry medians: 15,108 / 7,500 /
10,622 kcal (58001/58002/58003) — the 20,000-kcal tend guard
starves the tend verb on exactly the poor-village seeds whose
links bleed. Demand/defense eaters are ZERO on Haven-primary
links (answerDemand is Haven-subordinate-only, answerDefenseCall
is covenant-only — verified by the proof suite).

## The lever (policy-side only)

`scripts/policies/linkseek-hold.js` = linkseek verbatim + hold layer
(two changes, each aimed at a named eater — §14b substrate check
in the evidence file):
1. ANSWER RENEGOTIATION BEATS (targets the -78 lapse eater):
   every pending beat answered the day it is seen — 'gift'
   (1,500 kcal, +8 trust, tribute leverage never lands) when
   Haven's pantry tops 4,500 kcal, else 'visit' (+5, or +2 with
   an empty bench). Swing per beat vs lapsing: +14 gift, +11/+8
   visit. Competent/leadcourt/linkseek never answer a beat, so
   every grief beat currently curdles into silence.
2. TEND GUARD 20000 → 6000, lowest-trust first (targets the 22
   guard-blocked link-weeks): the pantry is re-read before EACH
   tend, so a thin pantry self-throttles (one tend costs 1,500
   kcal; at 7,000 kcal one link is tended and the rest wait).
   Tends also feed the subordinate's pantry (+1,500 kcal), which
   props up next week's tribute.
DELIBERATELY NOT in the lever: tribute sizing (shortfall -2,
negligible — tribute is NOT the eater); arrears forgive/call-in
(arrears 3,000 kcal on one link only); demand/defense answering
(0 events on primary links); the speaker-death -8 itself (no
policy verb prevents a death — the lever answers the beats deaths
stage and tends through the weeks after). `linkseek.js` and
`competent.js` are NEVER edited; competent stays the pinned
scale-free baseline, linkseek stays the landed policy.

## GO bar (binding — judge only against this)

GO iff ALL of:
1. Armed end-rank national+ >= linkseek-baseline +2 seeds on the
   8-seed pilot (end-rank = scaleRank at end of run in national /
   global / table).
2. AND >= 1 additional seed holds all 3 links seasoned to day 150
   (end diplomacy 102) OR the realm persists >= 30 days longer
   than baseline on the seeds where both legs form it
   (realmSpanDays gain >= 30).
3. Guards hold: median survival armed >= 0.8x baseline median
   survival; total wave-4 ledger points armed >= 0.5x baseline
   total (POOLED counts per the 0730Z metric review — do not
   re-judge a single thin cell; vacuous if baseline total is 0,
   recorded as such); no new death mode.
A miss on any clause is NO-GO, never re-scored against a friendlier
metric mid-run. Metric problems go under "metric review" for the
NEXT run. If the instrument shows no policy-actionable eater, the
verdict is DIAG-NO-CANDIDATE — not applicable here: the smoke
corpus names two actionable eaters above.

## Method

- Two legs per seed, identical seeds, sequential `loadGame` calls
  (separate harness loads, same seed, so trajectories start
  identical and diverge only where the policies differ):
  BASELINE `linkseek` verbatim, ARMED `linkseek-hold`.
  Default env. No policy variants beyond these two.
- Seeds: pilot 58001–58008. Horizon: 150 days, death-aware (dead
  villages stop simulating; +10d tail max). Confirm 8 fresh seeds
  (59001–59008, reserved) ONLY on pilot GO. Pooled n=16 meets the
  standard in aggregate — cite pooled n for the headline.
- Instrument (`scripts/hold-instrument-20261106.js`, wraps the
  linkseek instrument + per-snapshot HOLD roll: trust, arrears,
  tribute terms + paid week, tendedWeek, mourningUntil,
  lastKeptDay, pendingRenegotiation / pendingDefense, speaker,
  formation day, link.history, subordinate + Haven pantry, aid
  spies). Driver (`scripts/hold-driver-20261106.js`, run
  "hold-pilot", refuses to overwrite). Eater analyzer
  (`scripts/hold-eater-analyze-20261106.js`) + judge analyzer
  (`scripts/hold-analyze-20261106.js`).
- Scale-wall numbers every run: wins / national / global / table,
  wave 4–5 unlocks and facings, wave-4 kills, wave-5 kills,
  readiness-5-ready days, median survival, per leg.
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate (this
  8-seed run), death-aware horizons, pre-registration (this file),
  metric binding (§14), balanced panel (§15 — attempted via
  `scripts/balance-panel.js`; if the tool refuses the
  policy-vs-policy shape, the matched-seed paired comparison per
  the awayeve/linkseek precedent is the instrument and the refusal
  is recorded, never fabricated).

## Seed-band freshness (mandatory, re-verified this run)

- Band 58001–58008: 0 hits in all committed preregs
  (`evidence/*/sim-*-prereg.md`), 0 hits in all evidence `.md`
  (2026-10 + 2026-11), 0 hits in the convergence tracker.
  Re-verified by this run with whole-token grep before the first
  judged sim. FRESH. (The 3 smoke seeds 58001–58003 were smoke
  only — the judged pilot re-runs all 8 seeds as judged legs.)
- Confirm band 59001–59008: 0 prereg hits; evidence `.md` hits
  are commit-hash substrings only (7ff459001, f39590043).
  Reserved for this run's confirms only.
- Forbidden band on record: 99201–99208 (99xxx range) — not used,
  not near these bands. Re-pick on any hit (report the collision
  to the coordinator first).

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether the end-rank national+
  GO bar, the realm-persistence clause, and the pooled ledger-4
  guard held up.
