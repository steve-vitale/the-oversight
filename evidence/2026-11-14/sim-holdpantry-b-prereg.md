# sim-holdpantry-b — PREREG (BUILD arm: pantry-first HOLD on the LEAD road)

Run: fleshout-loop-b-20261114T1557Z (Loop B), arm sim-holdpantry-b
Axis: winnability chain. BUILD arm — teaches the scaleclimb policy to
BANK the pantry before tending, and to answer national beats, and
measures whether polities HOLD before/after on identical seeds.
Policy-side only: one new policy file + the baseline policy file
restored verbatim (see below), zero src/js changes.
Branch: sim-holdpantry-b — worktree ~/workspace/worktrees/sim-holdpantry-b
Base: master f524932d6 (tree rebased onto it before the first commit)
Date: 2026-11-14

## Canon note (read first)

docs/CANON.md was read. There is NO canon doc covering hierarchy,
diplomacy, the tend gate, or the pantry gate — no HIERARCHY.md,
DIPLOMACY.md, or equivalent exists in docs/. The mechanics below are
taken from code (src/js/hierarchy.js, src/js/standing.js) and from
measured preregs (sim-diplo-verb-b, sim-scaleclimb-b), NOT invented.
If a doc covers the tend gate, it was not found; this is stated here
instead of inventing canon.

## The finding (measured, not guessed)

sim-scaleclimb-b (evidence/2026-11-14/sim-scaleclimb-b.md, band
98801–98808, 150d): the scaleclimb lever CLIMBS — regional day median
70 → 32, polity bar (≥3 Haven-primary seasoned subs at once) 5/8 —
but does NOT HOLD: 3 of 5 polities dissolve by day 76–124. Root cause
PINNED: the PANTRY, not the tend predicate. 194 blocked tends on seed
98803; pantry reads 4–12k kcal most days against the 20k tend gate;
the tend predicate already fires on any below-bar link, so retuning
the predicate alone changes nothing. Also: pending national beats
blocked proposing on 327 days band-wide (the scaleclimb policy answers
no national beats by design); the polity needs THREE seasoned links AT
ONCE (stagger kills it — 98805 seasons 4 links, scores 0); mourning
chokes 24% of tend attempts. Scaleclimb armed leg, for the record:
ever-counted 5/8, held-days 83/0/78/79/0/0/23/6 (median 14.5),
end-state diplomacy > 0 on 2/8.

## The lever (frozen — do not tune mid-run)

New policy `scripts/policies/competent-holdpantry-b.js`: the recovered
scaleclimb policy VERBATIM as its courtship core, plus TWO additions
only — a pantry-first banking step and national/global beat answers.

BASELINE POLICY (the comparator): `scripts/policies/competent-scaleclimb-b.js`
recovered VERBATIM from commit 29a794df6 (`git show
29a794df6:scripts/policies/competent-scaleclimb-b.js`, 265 lines;
prereg commit 7113f11ec). Scaleclimb was killed and its branch deleted,
so the file is restored in this tree as the baseline instrument, not as
a new lever. The armed policy composes onto it (require + wrap), the
way scaleclimb composed onto competent. Any byte difference from the
29a794df6 file is an instrument error, not a lever change — the proof
test hashes the comparison (see §1).

THE ADDITIONS (frozen):

1. BANKING STEP — runs each day after `competent.daily` and BEFORE the
   courtship step, when day ≥ 10 (courtship season) AND pantry < 20,000
   kcal (the tend gate). In order, using only competent's exported
   helpers + Game verbs:
   a. sort the haul (`sortHaul` — lumps become real food);
   b. cook raw pack food (≤6 items, the cookPack rule: foodState raw,
      kcalEach > 0, near fire) so it becomes donatable;
   c. ONE extra forage trip (`forageTripSeedFirst`) — the scholar
      spends the evening gathering instead of idling;
   d. cook again after the trip;
   e. donate the surplus (`donateSurplus` with keepKcal = 1× kcalCap,
      not competent's default 3× cap) — the haul goes to the pantry
      instead of sitting in the pack.
   Counters: bankDays, bankTrips, bankTripsOk, bankCooked,
   bankDonatedKcal, bankPantryBefore/After per banking day.
   The banking step NEVER touches diplomacy verbs and never spends
   pantry kcal — it only adds to it.
2. NATIONAL/GLOBAL ANSWERS — copy leadcourt's pick map exactly
   (`scripts/policies/leadcourt.js`): pendingNational answered by
   shape — lead→'feast', conquest→'mercy', belong→'swear',
   covenant→'pact', trade→'sign'; pendingGlobal answered 'feast'.
   Counted (nationalAnswers, globalAnswers). This unblocks late
   proposing (327 blocked-propose days on the scaleclimb band).
3. COURTSHIP UNCHANGED — propose day 10, detJudge ≥ 45, SUB_CAP 3,
   propose pantry gate 12k, tend predicate age < 30 OR trust < 40,
   tend pantry gate 20k, accord gift 2,000 kcal, counter accept.
   The ONLY differences between the two pilot legs are (1) and (2).

WHAT IT DOES NOT DO:
- No seat-taking (`tableTakeSeat`) — OUT OF SCOPE, a Steve-call.
- No tend-predicate retune, no tend-gate change (20k stands), no
  tribute change. No src/js changes. No feast/devotion changes.
- No proposeCovenant / proposeTrade / raidVillage. No defense-call
  answers (leadcourt's, not this arm's).

## Seed-band freshness (verified BEFORE any judged sim)

- ASSIGNED BAND 93201–93208: COLLIDED — 93201–93204 are named in
  evidence/2026-11-03/journey-deepening-r89-prereg.md (also r90, r91,
  r110 preregs name the band). The coordinator's "verified fresh" was
  wrong; the band is NOT used. Recorded so the next worker does not
  repeat it.
- CHOSEN BAND 91101–91108: FRESH. Check run 2026-11-14: 0 hits per
  seed (91101…91108 individually) in `evidence/*/*prereg*.md`
  (all dates, all prereg files), 0 hits in `evidence/2026-11-1*/*.md`,
  0 hits in `scripts/*.js`. Scope: every dated prereg under
  evidence/ + the Nov 13–14 evidence files + the scripts tree.
  No forbidden/contaminated list names 9110x.

## Primary metric + GO bars (binding, §14)

- G1 INSTRUMENT VALIDITY (revised for flickering legs — scaleclimb
  metric review §2) — GO iff the driver captures a full per-day link
  roll on all 16 configs (8 seeds × scaleclimb-baseline /
  holdpantry-armed), 0 instrument errors, EVERY diplomacy step — UP
  and DOWN — is attributed to a named link counting EPISODE
  (0 unattributed net: endDip == sum(up-steps) − sum(down-steps),
  every step names ≥1 link), and EVERY link on both legs is classified
  (seasoned-and-counted / seasoned-but-no-polity / broke-<reason> /
  never-seasoned-<bar> / still-young-at-end) — zero UNCLASSIFIED links.
  Counting is per EPISODE: a link that un-seasons and re-counts gets a
  new counted-day per episode, not just its first. Any instrument
  error, unattributed diplomacy point, or unclassified link = NO-GO.
- G2 THE LEVER — GO iff on the armed leg, EVER-COUNTED (polity ever
  stood: ≥3 Haven-primary seasoned subs at once) on ≥6/8 pilot seeds
  AND median HELD-DAYS (days with diplomacy > 0) ≥ 45. Baseline
  expectation (scaleclimb band, different seeds — the pilot's own
  BEFORE leg is the control, not the 9880x numbers): ever 5/8,
  held-days median 14.5, end-positive 2/8. End-state diplomacy is
  reported alongside, NEVER as the judge (scaleclimb metric review §1).
  A miss on either half = NO-GO, never re-scored mid-run.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch diff
  and the proof test (`scripts/test-holdpantry-b-20261114.js`) is
  green. Any src/js change = NO-GO.

Cost bar (from sim-scalemetric): starvation deaths pooled armed ≤
baseline + 2 AND median survival armed ≥ 0.8× baseline median.
Starvation = deaths whose recorded cause names starvation/hunger.
Guardrail (§14c): villager (non-scholar) combat deaths are a
co-primary read on every seed — the evidence reports deaths per seed
and the pilot verdict names any seed where armed deaths exceed the
before leg by >50%.

## Method (staged, §§9–12, 14–15)

- STAGE 0 SMOKE (1 seed × 2 policies, 60d): does the policy load, do
  banking/proposes/accords/tends fire, does the driver capture the link
  roll? Fix wiring, not thresholds. (The proof test also carries a
  live 60d smoke leg on seed 91101.)
- STAGE 1 PILOT (8 seeds × 2 policies = 16 configs, 150d
  death-aware, identical seeds): the judged run. Horizon 150d because
  the finding's band is 150d and links need 30 days to season after a
  day-10 start. Seeds (exact literals): 91101, 91102, 91103, 91104,
  91105, 91106, 91107, 91108 (fresh band, verified above).
  Policies: competent-scaleclimb-b (baseline, recovered verbatim from
  29a794df6) vs competent-holdpantry-b (armed), identical seeds, same
  process shape as scripts/scaleclimb-driver-20261114.js (adapted:
  policies + per-seed filenames + say-filter + episode analyzer only).
- ENV: defaults, matching scaleclimb — COUNTER_ANSWER unset,
  COMPETENT_FLEE_REPAIR unset. No other env.
- CONFIRM (12–16 seeds) ONLY if the pilot is a clear GO. A borderline
  pilot is reported as-is and the coordinator decides; do NOT spend a
  confirm to rescue it.
- DRIVER (scripts/holdpantry-driver-20261114.js, adapted from the
  scaleclimb driver recovered from 29a794df6): daily link roll, verb
  wrappers, `Game.say` capture FILTERED to link/polity lines only
  (meal/tribute chatter excluded — the old 150-line cap filled by day
  ~28; cap raised to 600), raw standing split read daily,
  `villageStandingTotal()` read ONCE at end-of-run. Per-seed JSON to
  evidence/2026-11-14/perseed-holdpantry-b/. Zero src/js.
- ANALYZER (scripts/analyze-holdpantry-b.js, adapted from the
  scaleclimb analyzer): per-link trajectories + classification, verb
  table, per-seed diplomacy + polity days + HELD-DAYS + EVER-COUNTED,
  dip DECREMENTS named to the un-counting link, counted-day per
  counting EPISODE. Writes evidence/2026-11-14/holdpantry-b-analysis.json.
- BALANCED PANEL (§15, methodology note — READ): the real
  `scripts/balance-panel.js` compare cannot judge a policy contrast:
  both panels must carry identical options.policies and identical
  policy/harness sources, and a modified or added policy file used by
  a panel invalidates the compare (scorecard comparePanels;
  scaleclimb prereg records the same refusal). So per the linkdrive /
  scaleclimb precedent (scripts/build-scaleclimb-panels-20261114.js),
  the §15 compare runs on PSEUDO-panels built from the driver's
  per-seed JSONs (pseudo-policy 'holdpantry' in both panels; case
  identity is the seed; contract metrics mappable from the JSONs
  only — won, national, survival30/60, communityLost,
  villageDeaths; all others null, never faked). The pseudo-panel
  compare is the instrument; the pre-registered G2 bar is the judge.
  The driver's identical-seed numbers decide the verdict, not the
  panel.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures — the
  driver observes the policies' own play; nothing is staged.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the propose / accord-gift / tend / seasoning / polity lines the
driver captures and judge whether the courtship reads like a played
relationship or a silent meter — AND whether the polity's HOLDING or
DISSOLUTION now has a played line (the scaleclimb gap: dissolution
had no line at all). Read villager dialogue in the captured lines
where present; judge meaning and coherence, never just counts.

## Evidence

- Prereg: this file.
- Baseline policy: scripts/policies/competent-scaleclimb-b.js
  (restored verbatim from 29a794df6 — instrument, not a lever).
- Policy: scripts/policies/competent-holdpantry-b.js (new).
- Driver: scripts/holdpantry-driver-20261114.js (new, adapted).
- Analyzer: scripts/analyze-holdpantry-b.js (new, adapted).
- Panel builder: scripts/build-holdpantry-panels-20261114.js (new,
  scaleclimb pattern).
- Proof: scripts/test-holdpantry-b-20261114.js (new; static + game).
- Per-seed JSON: evidence/2026-11-14/perseed-holdpantry-b/ (16 files).
- Panel: evidence/2026-11-14/holdpantry-panel.{json,md}
  (+ -before/-after .json.gz pair).
- Evidence: evidence/2026-11-14/sim-holdpantry-b.md (per-seed
  tables, verb table, wall numbers, sense-testing, metric review).
- Reproduction check: the BEFORE leg's end-state columns (days,
  endReason, won, maxWave, standing, waveKills) checked against the
  scaleclimb armed-leg corpus (evidence/2026-11-14/perseed-scaleclimb-b/)
  on DIFFERENT seeds — no exact match is expected or required; the
  check is evidence only (different band, same lever family).

## Convergence state

BUILD — the verdict is GO/NO-GO against G2 above. A GO licenses a
12–16 seed confirm (coordinator's call); a NO-GO parks the lever
with the numbers that killed it. Either way the axis line updates
from this run's numbers only.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did G1/G2/G3 measure the lever, or
did the metric prove wrong (bad proxy, blind channel)?
