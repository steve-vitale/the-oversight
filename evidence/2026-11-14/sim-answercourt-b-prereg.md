# sim-answercourt-b — PREREG (BUILD arm: isolate the First Court answer)

Run: fleshout-loop-b-20261114T1945Z (Loop B), arm sim-answercourt-b
Axis: winnability chain. BUILD arm — scaleclimb + answerNationalChoice
on EVERY staged national beat, NOTHING else. Isolates the court answer
from holdpantry's banking+answers bundle.
Policy-side only: one baseline policy file restored verbatim + one new
armed policy file, zero src/js changes.
Branch: sim-answercourt-b — worktree ~/workspace/worktrees/sim-answercourt-b
Base: master at worktree creation (62dd6d36f, Loop B coordinator
evidence 1808Z)
Date: 2026-11-14

## Canon note (read first)

docs/CANON.md was read, then docs/SCALE.md (the scale-ladder canon —
the only canon doc covering hierarchy/diplomacy). There is NO
HIERARCHY.md / DIPLOMACY.md; the mechanics below are taken from
docs/SCALE.md + src/js/hierarchy.js `answerNationalChoice` (~line
2625) + the existing answering policies leadcourt.js / leanlink.js,
NOT invented.

- National is a polity: LEAD = primary of ≥3 SEASONED subordinates
  (seasoned = link 30+ days old AND trust 40+); national cannot stage
  until Haven has been regional a full season (networkLiveDay + 30);
  one rung per season (national ~day 61–90 at the earliest).
- The beats are staged the morning after the deed that earned them
  (`state.pendingNational = {led, shape, primary, villages[], day}`),
  and answered by `Game.answerNationalChoice(how)`. Every beat also
  offers REFUSE (permanent, `state.scaleRefused`) — never chosen here.
- The First Court (LEAD shape): FEAST — 5,000 kcal, trust +10 each
  sub (proportional if the pantry is thin); HOST — speaker loaned 7
  days, trust +6 each (or +3 with no speaker); COLD — tribute +10%,
  trust −12 each, opinion −5.
- The other shapes: BELONG → The Binding (SWEAR 3,000 kcal +12 trust;
  SERVE 7 days +8; WALK breaks the link AND refuses the scale
  permanently — never chosen); COVENANT → The Founding Council (PACT
  war-pact +8; POOL founding pour +6; WALK defers 14 days);
  TRADE → The Charter (SIGN table rate +6; BARGAIN 1,500 by opinion);
  CONQUEST → The Iron Court (YOKE tribute +10%, trust −12; MERCY
  courtship terms +8, mercyUntil day+30 grace; RELEASE dissolves).
- Shape priority when several qualify: lead → belong → covenant →
  trade. A answered beat sets `nationalLive = true` (+ nationalDay,
  nationalShape, nationalFirstDay) — the court SAT is the moment
  national lands. If the realm dissolves before the answer, the beat
  dies aloud (returns null, national stays unachieved).
- Global (`state.pendingGlobal`) is NOT a national beat: it can only
  stage after national is already live (viewership ≥ 32), so answering
  it cannot move the primary metric. It is NOT answered by this arm
  (strict isolation — see below).

## The finding (measured, not guessed)

- sim-scaleclimb-b (band 98801–98808, 150d): the scaleclimb lever
  CLIMBS — regional day median 70 → 32, polity bar 5/8 — but the
  policy answers NO national beats by design, so a pending beat
  BLOCKED proposing on 327 days band-wide (the propose gate refuses
  while any counter/accord/national is pending). National 0/8.
- sim-holdpantry-b (band 91101–91108, 150d): scaleclimb + pantry
  banking + national/global answers — answered EVERY national beat
  (6 answerNationalChoice calls), propose-block days from pending
  beats 317 → 0, national 0 → 1 (91101, global rank), held-days
  median 10.5 → 21.5, ever-counted 5/8 → 6/8. But the bundle
  confounds the answer with the banking (567 extra evening forage
  trips, 118,914 kcal banked, median survival 150 → 114.5d).
- THE NEXT BLANK (1808Z #1; findings backlog: "THE FIRST COURT SITS
  UNANSWERED, SO NATIONAL NEVER LANDS"): is the ANSWER alone enough
  to turn a stood polity into a national? This arm isolates it.

## The lever (frozen — do not tune mid-run)

New policy `scripts/policies/competent-answercourt-b.js`: the
recovered scaleclimb policy VERBATIM as its courtship core, plus ONE
addition only — national-beat answers. NOTHING else: no banking
step, no pack changes, no tend changes, no propose changes.

BASELINE POLICY (the comparator):
`scripts/policies/competent-scaleclimb-b.js` recovered VERBATIM from
commit 29a794df6 (`git show 29a794df6:scripts/policies/competent-scaleclimb-b.js`,
265 lines, sha256
24d6b4ad8fbe8d3c5ff542cc99a8cd08fb6be1b4da3bff7b09f092b668d2a032).
Also byte-identical in holdpantry commit 4f26f01c5 (diff empty,
verified 2026-11-14). Scaleclimb was killed and its branch deleted,
so the file is restored in this tree as the baseline instrument,
not as a new lever. The armed policy composes onto it (require +
wrap), the way scaleclimb composed onto competent. Any byte
difference from the 29a794df6 file is an instrument error, not a
lever change — the proof test hashes the comparison (see §1).

THE ADDITION (frozen): answerNationalChoice on EVERY staged national
beat, at the START of the armed daily (before scaleclimb's daily, so
the same day's propose/tend can proceed once the beat is answered).
Per-shape answer mapping — PRE-REGISTERED, copied from leadcourt.js
(`scripts/policies/leadcourt.js`, the same pick map holdpantry used):

| shape    | answer  | engine effect (hierarchy.js) |
|----------|---------|------------------------------|
| lead     | 'feast' | 5,000 kcal → trust +10 each sub (proportional if thin); the generous answer that also feeds the hold |
| conquest | 'mercy' | yoke eased → courtship terms 4,000 kcal/wk, trust +8, mercyUntil day+30 grace (yoke would cut trust −12 and likely dissolve the war-realm) |
| belong   | 'swear' | 3,000 kcal oath → trust +12 (SERVE needs a 7-day speaker loan; WALK refuses the scale permanently — never chosen) |
| covenant | 'pact'  | war-pact sworn → trust +8 each; shared pool opens beside it either way |
| trade    | 'sign'  | charter sealed at table rate → trust +6 each (BARGAIN risks −5/−3 trust) |

- Unknown shape → do NOT answer (defensive: the engine itself
  returns null for an unknown shape and never sets nationalLive).
  An unanswered unknown shape counts as an instrument error.
- 'refuse' is NEVER chosen on any shape (permanent scale refusal).
- 'walk' is NEVER chosen (belong-walk refuses the scale; league
  walk only defers — the generous answers above are the point).
- GLOBAL beats (`pendingGlobal`) are NOT answered by this arm.
  Deliberate, recorded deviation from leadcourt/holdpantry (which
  answered global 'feast'): the global beat can only stage after
  national is already live, so it cannot move the primary metric,
  and `pendingGlobal` does not block scaleclimb proposes. Strict
  isolation: the ONLY difference between the two pilot legs is the
  national-beat answer. Global-pending days are recorded as an
  observation.
- Counters: nationalAnswers, nationalAnswersByShape{lead,conquest,
  belong,covenant,trade}, pendingNationalDays (days a beat sat
  pending at daily start), globalPendingDays (observed), errors,
  events.

COURTSHIP UNCHANGED (scaleclimb verbatim — propose day 10,
detJudge ≥ 45, SUB_CAP 3, propose pantry gate 12k, tend predicate
age < 30 OR trust < 40, tend pantry gate 20k, accord gift 2,000
kcal, counter accept). The ONLY difference between the two pilot
legs is the national-beat answer.

WHAT IT DOES NOT DO:
- No seat-taking (`tableTakeSeat`) — OUT OF SCOPE, a Steve-call.
- No banking step (no sort/cook/forage/donate), no pack changes,
  no tend-predicate or tend-gate change, no tribute change.
- No src/js changes. No proposeCovenant / proposeTrade /
  raidVillage. No defense-call answers (leadcourt's, not this
  arm's). No global-beat answers (see above).

## Seed-band freshness (verified BEFORE any judged sim)

- ASSIGNED BAND 100101–100108: FRESH. Check run 2026-11-14: 0 hits
  per seed (100101…100108 individually) in `evidence/*/*prereg*.md`
  (all dates, all prereg files — filesystem grep), 0 hits in
  `scripts/` (all .js), and 0 hits per seed in `git grep` across
  `evidence/**prereg*.md` + `scripts/*.js` +
  `scripts/policies/*.js` on the worktree HEAD. 0 hits in the
  Nov 13–14 evidence .md files. The coordinator-named bands to
  avoid — 94101/95101/96001/97001/99001/94401 — are not used.
  No forbidden/contaminated list names 10010x.

## Primary metric + GO bars (binding, §14)

- G1 INSTRUMENT VALIDITY — GO iff the driver captures a full
  per-day link roll on all 16 configs (8 seeds × scaleclimb-baseline
  / answercourt-armed), 0 instrument errors, EVERY diplomacy step —
  UP and DOWN — is attributed to a named link counting EPISODE
  (0 unattributed net AND 0 unattributed steps: endDip ==
  sum(up-steps) − sum(down-steps), every step names ≥1 link
  episode), and EVERY link on both legs is classified
  (seasoned-and-counted / seasoned-but-no-polity / broke-<reason> /
  never-seasoned-<bar> / still-young-at-end) — zero UNCLASSIFIED
  links. AND the lever-fired check: answerNationalChoice calls
  armed > 0 band-wide, baseline exactly 0. Any instrument error,
  unattributed diplomacy point/step, or unclassified link = NO-GO.
  If armed answerNationalChoice calls = 0 band-wide (no beat ever
  staged to answer), the run is DIAG-NOSTAGE, not a NO-GO on the
  answer — the staging gap, not the answer, is the blocker.
- G2 THE LEVER — GO iff on the armed leg, NATIONAL EVER
  (scaleRank ever 'national' or 'global' in the per-day series)
  on ≥4/8 pilot seeds AND baseline national ever ≤1/8. Baseline
  expectation (scaleclimb bands 9880x and 9110x, different seeds —
  the pilot's own BEFORE leg is the control): national ever 0/8.
  Held-days (median days with diplomacy > 0) and ever-counted
  (polity ever stood) are read ALONGSIDE, never re-scored as the
  judge. Also recorded per leg: answerNationalChoice call counts
  (must be >0 armed, 0 baseline), pendingNational days,
  propose-block days, and which shapes actually staged.
  A miss on either half of the conjunction = NO-GO, never re-scored
  mid-run.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch diff
  and the proof test (`scripts/test-answercourt-b-20261114.js`) is
  green. Any src/js change = NO-GO.

Cost bar (from sim-scalemetric): starvation deaths pooled armed ≤
baseline + 2 (totals AND arm-only: the pooled comparison is the
armed leg's total vs the baseline leg's total, reported per seed
as well) AND median survival armed ≥ 0.8× baseline median.
Starvation = deaths whose recorded cause names starvation/hunger.
Guardrail (§14c): villager (non-scholar) combat deaths are a
co-primary read on every seed — the evidence reports deaths per
seed and the pilot verdict names any seed where armed deaths exceed
the before leg by >50%.

## Method (staged, §§9–12, 14–15)

- STAGE 0 SMOKE (1 seed × 2 policies, 60d): does the policy load,
  does the driver capture the link roll + pendingNational, do the
  verb wrappers record answerNationalChoice with its shape? Fix
  wiring, not thresholds. (The proof test also carries a live 60d
  smoke leg on seed 100101. Note: national cannot stage before
  ~day 62 on the ladder, so the 60d smoke is NOT expected to stage
  a beat — the answer path itself is proven by a fake-Game unit
  test staging a pendingNational per shape.)
- STAGE 1 PILOT (8 seeds × 2 policies = 16 configs, 150d
  death-aware, identical seeds): the judged run. Horizon 150d
  because the finding's bands are 150d and links need 30 days to
  season after a day-10 start, plus a season for the national beat
  to stage. Seeds (exact literals): 100101, 100102, 100103,
  100104, 100105, 100106, 100107, 100108 (fresh band, verified
  above). Policies: competent-scaleclimb-b (baseline, recovered
  verbatim from 29a794df6) vs competent-answercourt-b (armed),
  identical seeds, same process shape as
  scripts/scaleclimb-driver-20261114.js (adapted: policies +
  per-seed filenames + pendingNational snapshot + national-answer
  shape capture + meal-filtered say capture at cap 600, per the
  holdpantry driver).
- ENV: defaults, matching scaleclimb/holdpantry — COUNTER_ANSWER
  unset, COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE unset
  (the engine's answermail drive is DEFAULT-OFF; none of the
  scaleclimb, holdpantry, or this leg sets it — the driver still
  reads state.answermailDrive totals, which will be null). No other
  env. Every flag is recorded here; there are no others.
- CONFIRM (12–16 seeds) ONLY if the pilot is a clear GO. A
  borderline pilot is reported as-is and the coordinator decides;
  do NOT spend a confirm to rescue it.
- DRIVER (scripts/answercourt-driver-20261114.js, adapted from the
  holdpantry driver recovered via /tmp + the scaleclimb driver
  from 29a794df6): daily link roll, verb wrappers,
  `Game.say` capture FILTERED to link/polity lines only
  (meal/tribute chatter excluded, cap 600), raw standing split read
  daily, `villageStandingTotal()` read ONCE at end-of-run.
  NEW for this arm: snapshot carries pendingNational
  (shape/primary/day), pendingGlobal, nationalLive; the
  answerNationalChoice wrapper records the staged shape alongside
  the answer. Per-seed JSON to
  evidence/2026-11-14/perseed-answercourt-b/. Zero src/js.
- ANALYZER (scripts/analyze-answercourt-b.js, adapted from the
  scaleclimb analyzer + holdpantry episode attribution): per-link
  trajectories + classification, verb table, per-seed diplomacy +
  polity days + HELD-DAYS + EVER-COUNTED + NATIONAL EVER /
  first-national day / national held-days, dip steps UP and DOWN
  each named to the link episode that started/ended, starvation
  deaths per seed, answer counts per shape. Writes
  evidence/2026-11-14/answercourt-b-analysis.json.
- BALANCED PANEL (§15, methodology note — READ): the real
  `scripts/balance-panel.js` compare cannot judge a policy
  contrast: both panels must carry identical options.policies and
  identical policy/harness sources, and a modified or added policy
  file used by a panel invalidates the compare (scorecard
  comparePanels; scaleclimb prereg records the same refusal).
  NOTE the filed methodology finding (2026-11-13): panel compare
  is INVALID BY CONTRACT for policy levers — the DRIVER numbers
  are the deciding instrument, not the panel compare. Per the
  linkdrive / scaleclimb precedent
  (scripts/build-scaleclimb-panels-20261114.js), the §15 compare
  runs on PSEUDO-panels built from the driver's per-seed JSONs
  (pseudo-policy 'answercourt' in both panels; case identity is
  the seed; contract metrics mappable from the JSONs only — won,
  national, survival30/60, communityLost, villageDeaths; all
  others null, never faked). The pseudo-panel compare is built for
  the record; the pre-registered G2 bar is the judge.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures — the
  driver observes the policies' own play; nothing is staged.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the staged beat + answer lines the driver captures and judge
whether the court reads like a played ceremony or a silent meter —
AND whether the polity's HOLDING after the court sat has a played
line (the holdpantry gap: dissolution had no line at all). Read
villager dialogue in the captured lines where present; judge
meaning and coherence, never just counts.

## Evidence

- Prereg: this file.
- Baseline policy: scripts/policies/competent-scaleclimb-b.js
  (restored verbatim from 29a794df6 — instrument, not a lever).
- Policy: scripts/policies/competent-answercourt-b.js (new).
- Driver: scripts/answercourt-driver-20261114.js (new, adapted).
- Analyzer: scripts/analyze-answercourt-b.js (new, adapted).
- Panel builder: scripts/build-answercourt-panels-20261114.js (new,
  scaleclimb pattern).
- Proof: scripts/test-answercourt-b-20261114.js (new; static + game).
- Per-seed JSON: evidence/2026-11-14/perseed-answercourt-b/ (16 files).
- Panel: evidence/2026-11-14/answercourt-panel.{json,md}
  (+ -before/-after .json.gz pair).
- Evidence: evidence/2026-11-14/sim-answercourt-b.md (per-seed
  tables, verb table, wall numbers, sense-testing, metric review).

## Convergence state

BUILD — the verdict is GO/NO-GO against G2 above (or DIAG-NOSTAGE
if no beat ever stages). A GO licenses a 12–16 seed confirm
(coordinator's call); a NO-GO parks the lever with the numbers that
killed it. Either way the axis line updates from this run's numbers
only.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did G1/G2/G3 measure the lever, or
did the metric prove wrong (bad proxy, blind channel)?
