# sim-answercourt-confirm-b — PREREG (CONFIRM of the pilot GO)

Run: fleshout-loop-b-20261114T1945Z (Loop B), arm sim-answercourt-confirm-b
Axis: winnability chain. CONFIRM arm — the pilot's exact lever, judged
again on a FRESH 16-seed band. The pilot (sim-answercourt-b, branch
ed6df749e, NOT yet landed on master) went GO on G2: national ever 5/8
armed vs 0/8 baseline, band 100101–100108, 150d. This confirm tests
whether that GO survives a fresh band twice the size.
Policy-side only: pilot policies recovered byte-identical, zero src/js
changes, zero policy edits.
Branch: sim-answercourt-confirm-b — worktree ~/workspace/worktrees/sim-answercourt-confirm-b
Base: master at worktree creation (59f78034c)
Date: 2026-11-14

## Canon note (read first)

docs/CANON.md was read, then docs/SCALE.md (the scale-ladder canon —
the only canon doc covering hierarchy/diplomacy). There is NO
HIERARCHY.md / DIPLOMACY.md; the mechanics are taken from docs/SCALE.md
+ src/js/hierarchy.js `answerNationalChoice` + the existing answering
policies leadcourt.js / leanlink.js, NOT invented. The pilot prereg
(evidence/2026-11-14/sim-answercourt-b-prereg.md on branch ed6df749e)
carries the full canon summary; it is adopted here unchanged:
national = LEAD primary of ≥3 SEASONED subordinates (seasoned = link
30+ days old AND trust 40+); national cannot stage until Haven has
been regional a full season (networkLiveDay + 30); one rung per season
(national ~day 61–90 at the earliest); beats stage the morning after
the deed and are answered by `Game.answerNationalChoice(how)`; the
First Court (LEAD shape): FEAST 5,000 kcal trust +10 each sub;
HOST speaker loan 7 days trust +6; COLD tribute +10% trust −12.
Other shapes: BELONG → The Binding (SWEAR 3,000 kcal +12; SERVE 7
days +8; WALK breaks the link AND refuses the scale permanently —
never chosen); COVENANT → The Founding Council (PACT war-pact +8;
POOL founding pour +6; WALK defers 14 days); TRADE → The Charter
(SIGN table rate +6; BARGAIN 1,500 by opinion); CONQUEST → The Iron
Court (YOKE tribute +10% trust −12; MERCY courtship terms +8,
mercyUntil day+30 grace; RELEASE dissolves). Shape priority when
several qualify: lead → belong → covenant → trade. A answered beat
sets `nationalLive = true`. Global (`state.pendingGlobal`) is NOT a
national beat and is NOT answered by this arm (strict isolation,
same as the pilot).

## The pilot result being confirmed (measured, not guessed)

- sim-answercourt-b (band 100101–100108, 150d, 8 seeds × 2 policies):
  G1 GO (0 instrument errors, 0 unattributed diplomacy points up AND
  down, 0 unattributed steps, 0 UNCLASSIFIED links); G2 GO
  (NATIONAL EVER armed 5/8 vs baseline 0/8; first-national days 62,
  88, 62, 89, 71 — all in the canon window; end-state national 3/8
  vs 0/8; held-days median 40 armed vs 26.5 baseline);
  answerNationalChoice calls armed 6, baseline 0 — ALL the lead
  shape, ALL 'feast'; G3 GO (zero src/js changes; proof 70/70
  static, 26/26 game on 100101 smoke); cost bar PASSES (starvation
  1 vs 1; median survival 137d vs 126.5d, 1.08× control).
- The pilot's open hold question: 2/5 nationals dissolved before the
  horizon (100106 after 45 days, 100107 after 67 days, both silently
  — dissolution has no played line). Held-days and end-state national
  are read alongside in this confirm, never re-scored as the judge.
- The pilot's open shape question: only the lead shape staged (6/6).
  The other four per-shape answers (conquest mercy, belong swear,
  covenant pact, trade sign) are proven by fake-Game unit tests only.
  This confirm records EVERY shape that stages on the fresh band.

## The lever (frozen — the pilot's exact lever, do not tune)

Both policy files recovered from the pilot branch tip ed6df749e via
`git show`, byte-verified against the pilot branch blobs
(`git hash-object` vs `git rev-parse ed6df749e:<path>` — all six files
MATCH; see the proof test):

- BASELINE `scripts/policies/competent-scaleclimb-b.js` — 265 lines,
  sha256 24d6b4ad8fbe8d3c5ff542cc99a8cd08fb6be1b4da3bff7b09f092b668d2a032
  (identical to commit 29a794df6, as in the pilot).
- ARMED `scripts/policies/competent-answercourt-b.js` — 132 lines,
  sha256 616aa98670770697fac49fba3dad06c6ec9895f16361368eaf6d757d4a25a0c2
  (the ed6df749e blob). Scaleclimb verbatim as its courtship core
  plus ONE addition only: answerNationalChoice on EVERY staged
  national beat (lead feast / conquest mercy / belong swear /
  covenant pact / trade sign), at the start of the armed daily.
  Global beats NOT answered; 'refuse' and 'walk' NEVER chosen;
  unknown shape NOT answered (instrument error if one stages).
  Per-shape answer mapping — PRE-REGISTERED, copied from leadcourt.js
  (the same pick map the pilot used):

| shape    | answer  | engine effect (hierarchy.js) |
|----------|---------|------------------------------|
| lead     | 'feast' | 5,000 kcal → trust +10 each sub (proportional if thin) |
| conquest | 'mercy' | yoke eased → courtship terms 4,000 kcal/wk, trust +8, mercyUntil day+30 grace |
| belong   | 'swear' | 3,000 kcal oath → trust +12 |
| covenant | 'pact'  | war-pact sworn → trust +8 each; shared pool opens beside it either way |
| trade    | 'sign'  | charter sealed at table rate → trust +6 each |
- Do NOT edit either policy — the confirm judges the pilot's exact
  lever. Any byte difference from the ed6df749e blobs is an
  instrument error, not a lever change; the proof test hashes both.

## Instrument (recovered from ed6df749e; changes are instrument-only)

- DRIVER `scripts/answercourt-driver-20261114.js` — reused UNCHANGED
  (byte-identical to ed6df749e, sha256
  1257e215ff601ccbd2fa52b2aff6ed6fe12e1e36b698ecdb76b5591b8f89b7c8).
  It is env-driven (SEEDS / POLICY / DAYS / RUN / OUTDIR), so the
  fresh band needs no code change. Invocation for this confirm:
  `SEEDS=100201,...,100216 POLICY=competent-scaleclimb-b,competent-answercourt-b DAYS=150 RUN=answercourt-confirm-b OUTDIR=perseed-answercourt-confirm-b node scripts/answercourt-driver-20261114.js`.
- ANALYZER — the pilot analyzer is reused as a confirm-suffixed copy
  `scripts/analyze-answercourt-confirm-b.js`, logic IDENTICAL; the
  only changes are the literals that name the run: default input dir
  `perseed-answercourt-confirm-b` and output
  `answercourt-confirm-b-analysis.json`. The pilot analyzer file
  itself stays byte-identical in this tree. (The pilot analyzer's
  input dir is an argv override and its output path is hardcoded —
  a copy with renamed literals is the minimal instrument-only change.)
- PANEL BUILDER — the pilot builder is reused as a confirm-suffixed
  copy `scripts/build-answercourt-confirm-panels-20261114.js`, logic
  IDENTICAL; the only changes are the literals that name the run:
  SEEDS 100201–100216, SWEEP_DIR `perseed-answercourt-confirm-b`,
  per-seed filename suffix `-answercourt-confirm-b.json`, OUT_PREFIX
  default `answercourt-confirm-panel`, origin
  `sim-answercourt-confirm-b`. The pilot builder file itself stays
  byte-identical in this tree. (The pilot builder hardcodes SEEDS,
  SWEEP_DIR, and the `-answercourt-b` RUN suffix — a copy with
  renamed literals is the minimal instrument-only change.)
- PROOF TEST — new file `scripts/test-answercourt-confirm-b-20261114.js`,
  adapted from the pilot proof test: same static legs (policy
  byte-identity vs the ed6df749e blobs, per-shape answer map, no
  banking / no seat / no global answers, no RNG, driver/analyzer
  exports), same fake-Game answerNationalBeat unit legs per shape,
  same classifyLink/attribute flicker legs, same G3 static leg
  (zero src/js diff vs master), plus a 60d game smoke on confirm
  seed 100201 (both policies). The pilot proof test file itself
  stays byte-identical in this tree.

## Seed-band freshness (verified BEFORE any judged sim)

- ASSIGNED BAND 100201–100216: FRESH. Check run 2026-11-14: 0 hits
  per seed (100201…100216 individually, slow grep) AND 0 hits for
  the whole band at once (`rg -l -g '*prereg*.md'
  '10020[12]|10021[0-6]' evidence/` — exit 1, no matches; `rg -l
  '10020[12]|10021[0-6]' scripts/` — exit 1, no matches; `rg -l
  '10020[12]|10021[0-6]' evidence/2026-11-13/ evidence/2026-11-14/
  -g '*.md'` — exit 1, no matches; `git grep -l '10020[12]|10021[0-6]'
  -- 'evidence/**prereg*.md' 'scripts/*.js' 'scripts/policies/*.js'`
  on worktree HEAD — exit 1, no matches). The coordinator-named
  bands to avoid — 94101/95101/96001/97001/99001/94401 — are not
  used. No forbidden/contaminated list names 10020x/10021x.

## Primary metric + GO bars (binding, §14)

- G1 INSTRUMENT VALIDITY — GO iff the driver captures a full
  per-day link roll on all 32 configs (16 seeds × scaleclimb-baseline
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
  on ≥8/16 confirm seeds AND baseline national ever ≤3/16. The
  armed bar (8/16 = 50%) sits below the pilot rate (5/8 = 62.5%)
  to allow sampling variation on a fresh band twice the size; the
  baseline bar (≤3/16 ≈ 19%) allows some baseline nationals where
  the pilot saw none. Held-days (median days with diplomacy > 0),
  end-state national, and ever-counted (polity ever stood) are read
  ALONGSIDE, never re-scored as the judge. Also recorded per leg:
  answerNationalChoice call counts (must be >0 armed, 0 baseline),
  answer counts per shape, pendingNational days, propose-block
  days, and which shapes actually staged. A miss on either half of
  the conjunction = NO-GO — the pilot GO is then CONTESTED, never
  re-scored mid-run.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch diff
  and the proof test (`scripts/test-answercourt-confirm-b-20261114.js`)
  is green. Any src/js change = NO-GO.

Cost bar (same as pilot): starvation deaths pooled armed ≤
baseline + 2 (totals AND arm-only: the pooled comparison is the
armed leg's total vs the baseline leg's total, reported per seed
as well) AND median survival armed ≥ 0.8× baseline median.
Starvation = deaths whose recorded cause names starvation/hunger.
Guardrail (§14c): villager (non-scholar) combat deaths are a
co-primary read on every seed — the evidence reports deaths per
seed and the verdict names any seed where armed deaths exceed
the before leg by >50%.

## Method (staged, §§9–12, 14–15)

- STAGE 0 SMOKE (1 seed × 2 policies, 60d): the proof test's --game
  leg on confirm seed 100201 — policy loads, driver captures the
  link roll + pendingNational, verb wrappers record
  answerNationalChoice with its shape. Fix wiring, not thresholds.
  (National cannot stage before ~day 62, so the 60d smoke is NOT
  expected to stage a beat — the answer path itself is proven by
  the fake-Game unit tests staging a pendingNational per shape.)
- STAGE 1 CONFIRM (16 seeds × 2 policies = 32 configs, 150d
  death-aware, identical seeds): the judged run. Horizon 150d
  because the pilot's bands are 150d and links need 30 days to
  season after a day-10 start, plus a season for the national beat
  to stage. Seeds (exact literals): 100201, 100202, 100203,
  100204, 100205, 100206, 100207, 100208, 100209, 100210, 100211,
  100212, 100213, 100214, 100215, 100216 (fresh band, verified
  above). Policies: competent-scaleclimb-b (baseline, recovered
  byte-identical from ed6df749e) vs competent-answercourt-b (armed),
  identical seeds, same process shape as the pilot driver.
- ENV: defaults, matching the pilot — COUNTER_ANSWER unset,
  COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE unset (the engine's
  answermail drive is DEFAULT-OFF; none of the scaleclimb,
  holdpantry, pilot, or this leg sets it — the driver still reads
  state.answermailDrive totals, which will be null). Verified unset
  in the run shell before the prereg was written. No other env.
  Every flag is recorded here; there are no others.
- DRIVER (scripts/answercourt-driver-20261114.js, pilot file reused
  unchanged): daily link roll, verb wrappers, `Game.say` capture
  FILTERED to link/polity lines only (meal/tribute chatter excluded,
  cap 600), raw standing split read daily,
  `villageStandingTotal()` read ONCE at end-of-run. Snapshot
  carries pendingNational (shape/primary/day), pendingGlobal,
  nationalLive; the answerNationalChoice wrapper records the staged
  shape alongside the answer. Per-seed JSON to
  evidence/2026-11-14/perseed-answercourt-confirm-b/. Zero src/js.
- ANALYZER (scripts/analyze-answercourt-confirm-b.js, pilot logic
  verbatim, renamed literals only): per-link trajectories +
  classification, verb table, per-seed diplomacy + polity days +
  HELD-DAYS + EVER-COUNTED + NATIONAL EVER / first-national day /
  national held-days, dip steps UP and DOWN each named to the link
  episode that started/ended, starvation deaths per seed, answer
  counts per shape. Writes
  evidence/2026-11-14/answercourt-confirm-b-analysis.json.
- BALANCED PANEL (§15, methodology note — READ): the real
  `scripts/balance-panel.js` compare cannot judge a policy
  contrast: both panels must carry identical options.policies and
  identical policy/harness sources, and a modified or added policy
  file used by a panel invalidates the compare (scorecard
  comparePanels; scaleclimb prereg records the same refusal).
  NOTE the filed methodology finding (2026-11-13): panel compare
  is INVALID BY CONTRACT for policy levers — the DRIVER numbers
  are the deciding instrument, not the panel compare. Per the
  linkdrive / scaleclimb / pilot precedent
  (scripts/build-answercourt-confirm-panels-20261114.js), the §15
  compare runs on PSEUDO-panels built from the driver's per-seed
  JSONs (pseudo-policy 'answercourt' in both panels; case identity
  is the seed; contract metrics mappable from the JSONs only — won,
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
line (the pilot gap: dissolution had no line at all). Read
villager dialogue in the captured lines where present; judge
meaning and coherence, never just counts. Note any shape OTHER
than lead that stages, and whether its answer lines read true.

## Evidence

- Prereg: this file.
- Baseline policy: scripts/policies/competent-scaleclimb-b.js
  (recovered byte-identical from ed6df749e — instrument, not a lever).
- Policy: scripts/policies/competent-answercourt-b.js (recovered
  byte-identical from ed6df749e — the pilot's exact lever, NOT edited).
- Driver: scripts/answercourt-driver-20261114.js (recovered
  byte-identical from ed6df749e, reused unchanged).
- Analyzer: scripts/analyze-answercourt-confirm-b.js (pilot logic
  verbatim; renamed literals only).
- Panel builder: scripts/build-answercourt-confirm-panels-20261114.js
  (pilot logic verbatim; renamed literals only).
- Proof: scripts/test-answercourt-confirm-b-20261114.js (new;
  static + game smoke on confirm seed 100201).
- Pilot files kept byte-identical in this tree for the record:
  scripts/analyze-answercourt-b.js,
  scripts/build-answercourt-panels-20261114.js,
  scripts/test-answercourt-b-20261114.js.
- Per-seed JSON: evidence/2026-11-14/perseed-answercourt-confirm-b/ (32 files).
- Panel: evidence/2026-11-14/answercourt-confirm-panel.{json,md}
  (+ -before/-after .json.gz pair).
- Evidence: evidence/2026-11-14/sim-answercourt-confirm-b.md (per-seed
  tables, verb table, wall numbers, sense-testing, metric review).

## Convergence state

CONFIRM — the verdict is GO/NO-GO against G2 above (or DIAG-NOSTAGE
if no beat ever stages). A GO confirms the pilot GO and the lever
stands as proven on 24 seeds (8 pilot + 16 confirm); a NO-GO
contests the pilot GO with the numbers that killed it. Either way
the axis line updates from this run's numbers only.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did G1/G2/G3 measure the lever, or
did the metric prove wrong (bad proxy, blind channel)?
