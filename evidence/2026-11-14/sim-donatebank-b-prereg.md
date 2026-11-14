# sim-donatebank-b — PREREG (BUILD arm: donation-only pantry banking)

Run: fleshout-loop-b-20261114T1945Z (Loop B), arm sim-donatebank-b
Axis: winnability chain. BUILD arm — isolates the DONATION leg of the
holdpantry bundle (banking without the field trips) and measures
whether polities HOLD before/after on identical seeds.
Policy-side only: one new policy file + the baseline policy restored
verbatim, zero src/js changes.
Branch: sim-donatebank-b — worktree ~/workspace/worktrees/sim-donatebank-b
Base: master 62dd6d36f (coordinator evidence commit; tree rebased onto
it before the first commit)
Date: 2026-11-14

## Canon note (read first)

docs/CANON.md was read. There is NO canon doc covering hierarchy,
diplomacy, the tend gate, or the pantry gate — no HIERARCHY.md,
DIPLOMACY.md, or equivalent exists in docs/. The mechanics below are
taken from code (src/js/hierarchy.js, src/js/standing.js,
scripts/policies/competent.js) and from measured preregs
(sim-diplo-verb-b, sim-scaleclimb-b, sim-holdpantry-b, sim-cheaptend-b),
NOT invented. docs/SCALE.md (read via the cheaptend prereg) covers the
polity definition only: one primary + ≥3 SEASONED subs; seasoned =
30+ days AND trust 40+.

## The finding (measured, not guessed)

sim-holdpantry-b (evidence/2026-11-14/sim-holdpantry-b.md, band
91101–91108, 150d): scaleclimb + pantry-first banking + national
answers — NO-GO. Ever-counted 6/8 (passes), median held-days 21.5
(needs 45), median survival 114.5d vs baseline 150d (0.76×, needs
≥0.8×). The banking moved 118,914 kcal and tends went 62 → 99, but
the pantry never stayed above the 20k gate (median 35 days above it
vs 34) and the evening forage trips failed 84.5% of the time while
buying fight exposure (villager combat deaths 586 vs 524, wave-5
unlocks 5/8 → 2/8). Metric review §4 of that evidence: "a follow-up
that wants the banking without the exposure should bank WITHOUT the
trip (donation leg only — it moved 118,914 kcal with zero field
time)". This arm IS that follow-up.

## The separation verification (done BEFORE the prereg — the task's gate)

The donation leg CAN be cleanly separated from the trips. Proof from
the holdpantry evidence (evidence/2026-11-14/sim-holdpantry-b.md,
"The banking, seed by seed", and holdpantry-b-analysis.json
per-seed `bankDonatedKcal` / `bankTripsOk`):

| Seed | bank trips (ok) | donated kcal |
|---|---|---|
| 91101 | 98 (37) | 29,709 |
| 91102 | 110 (6) | 17,020 |
| 91103 | 96 (0) | 40,590 |
| 91104 | 88 (4) | 0 |
| 91105 | 20 (4) | 0 |
| 91106 | 98 (10) | 16,870 |
| 91107 | 29 (12) | 660 |
| 91108 | 28 (15) | 14,065 |

Seed 91103 is the decisive case: 96 banking trips, ZERO succeeded,
yet 40,590 kcal was donated — the largest single-seed donation in the
band. The donation cannot be trip grain: the trips contributed nothing
there. The donation leg is the `donateSurplus` call with a 1-day keep
(`keepKcal: cap`): it pushes the day's ordinary haul — gathered by
competent's own daily foraging, no extra evening out — into the pantry
instead of letting it sit in the pack. The cook leg contributed
nothing on all 8 seeds (0 items cooked) and is carried only as the
same sort/cook preamble so the extracted mechanism is byte-faithful
to holdpantry's donation step; its counters will show whether it
fires here at all.

THE PACK-KEEP QUESTION (the task's second gate, resolved by code
read, not by assumption): holdpantry's donation call passes
`keepKcal: cap` explicitly. Under the run env
(COMPETENT_TRADE_RESERVE unset), `donateSurplus`'s default keep IS
`cap` (scripts/policies/competent.js:1649: `options.keepKcal ??
(process.env.COMPETENT_TRADE_RESERVE==='1' ? cap*3 : cap)`). The
explicit keep is therefore a NO-OP against the default in this env —
there is NO separate pack-keep change to remove. The holdpantry
evidence's "competent's default 3× cap" holds only when
COMPETENT_TRADE_RESERVE='1', which no scaleclimb/holdpantry driver
sets (verified by grep: the flag appears in competent.js, the
nofallback/r126/r127 policy copies, balance-panel.js's flag list, and
livelihood.js — none of them set by the scaleclimb/holdpantry
drivers). So the extracted donation mechanism is: sort + cook +
`donateSurplus({ keepKcal: cap })`, no trips. That is exactly what
this arm runs. The proof test asserts the keep equals the default
under the run env (static check on competent.js:1649 + a live check
that the armed policy's donation call carries keepKcal: cap).

WHAT IS EXCLUDED (the rest of holdpantry's bundle):
- NO extra forage trip (`forageTripSeedFirst` never called — the
  armed policy contains no trip call at all; `bankTrips` is
  structurally 0 and the proof test asserts the trip symbol absent).
- NO national/global beat answers (that is the sibling arm
  sim-answercourt-b's isolation; this arm answers nothing).
- No tend-predicate retune, no tend-gate change (20k stands), no
  tribute change. No src/js changes. No feast/devotion changes.
- No seat-taking (`tableTakeSeat`) — OUT OF SCOPE, a Steve-call.

## The lever (frozen — do not tune mid-run)

New policy `scripts/policies/competent-donatebank-b.js`: the recovered
scaleclimb policy VERBATIM as its courtship core, plus ONE addition
only — a donation step.

BASELINE POLICY (the comparator): `scripts/policies/competent-scaleclimb-b.js`
recovered VERBATIM from commit 29a794df6 (`git show
29a794df6:scripts/policies/competent-scaleclimb-b.js`, 265 lines;
sha256 24d6b4ad8fbe8d3c5ff542cc99a8cd08fb6be1b4da3bff7b09f092b668d2a032,
verified against the commit blob before this prereg was written).
Scaleclimb was killed and its branch deleted, so the file is restored
in this tree as the baseline instrument, not as a new lever. The armed
policy composes onto it (require + wrap), the way holdpantry composed
onto scaleclimb. Any byte difference from the 29a794df6 file is an
instrument error, not a lever change — the proof test hashes the
comparison (see §1).

THE ADDITION (frozen):

DONATION STEP — runs each day after `competent.daily` and BEFORE the
courtship step, when day ≥ 10 (courtship season) AND pantry < 20,000
kcal (the tend gate). In order, using only competent's exported
helpers + Game verbs:
   a. sort the haul (`sortHaul` — lumps become real food);
   b. cook raw pack food (≤6 items, the cookPack rule: foodState raw,
      kcalEach > 0, near fire) so it becomes donatable;
   c. donate the surplus (`donateSurplus` with keepKcal = 1× kcalCap)
      — the day's haul goes to the pantry instead of sitting in the
      pack.
   Counters: bankDays, bankSorted, bankCooked, bankDonatedKcal,
   bankPantryDelta, bankPantryBefore/After per banking day.
   bankTrips is structurally 0 (no trip call exists in this policy).
   The donation step NEVER touches diplomacy verbs and never spends
   pantry kcal — it only adds to it.
COURTSHIP UNCHANGED — propose day 10, detJudge ≥ 45, SUB_CAP 3,
propose pantry gate 12k, tend predicate age < 30 OR trust < 40,
tend pantry gate 20k, accord gift 2,000 kcal, counter accept.
The ONLY difference between the two pilot legs is the donation step.

## Seed-band freshness (verified BEFORE any judged sim)

- ASSIGNED BAND 100101–100108: FRESH. Check run 2026-11-14, this
  worker: 0 hits per seed (100101…100108 individually) in
  `evidence/*/*prereg*.md` (all dates, all prereg files), 0 hits in
  `scripts/` (all files), 0 hits in a full-evidence grep for
  `10010[1-8]`, 0 hits in `git grep` over evidence + scripts.
  The sibling arm sim-answercourt-b ran the same check independently
  and also found 0 hits (its prereg §"Seed-band freshness"). No
  forbidden/contaminated band list names 10010x. The band is SHARED
  with the sibling arm by coordinator design (same band, same
  baseline policy) so the two baselines replicate each other — the
  sharing is the design, not a collision.
- Previously used bands NOT reused: 94101/95101/96001/97001/99001/
  94401 (coordinator note), 91101–91108 (holdpantry), 93211–93218
  (cheaptend), 98801–98808 (scaleclimb).

## Primary metric + GO bars (binding, §14)

- G1 INSTRUMENT VALIDITY (holdpantry form, unchanged) — GO iff the
  driver captures a full per-day link roll on all 16 configs (8 seeds
  × scaleclimb-baseline / donatebank-armed), 0 instrument errors,
  EVERY diplomacy step — UP and DOWN — is attributed to a named link
  counting EPISODE (0 unattributed net: endDip == sum(up-steps) −
  sum(down-steps), every step names ≥1 link), and EVERY link on both
  legs is classified (seasoned-and-counted / seasoned-but-no-polity /
  broke-<reason> / never-seasoned-<bar> / still-young-at-end) — zero
  UNCLASSIFIED links. Counting is per EPISODE: a link that un-seasons
  and re-counts gets a new counted-day per episode, not just its
  first. Any instrument error, unattributed diplomacy point, or
  unclassified link = NO-GO.
- G2 THE LEVER — GO iff on the armed leg, EVER-COUNTED (polity ever
  stood: ≥3 Haven-primary seasoned subs at once) on ≥6/8 pilot seeds
  AND median HELD-DAYS (days with diplomacy > 0) ≥ 45. Baseline
  expectation (the pilot's own BEFORE leg is the control, not the
  9110x numbers; holdpantry band for shape only: ever 5/8, held-days
  median 10.5, end-positive 2/8). End-state diplomacy is reported
  alongside, NEVER as the judge (scaleclimb metric review §1).
  A miss on either half = NO-GO, never re-scored mid-run.
  Recorded alongside the judge: kcal banked via donation (per seed
  and band total), donation-call counts (bankDays), pantry days above
  the 20k tend gate (per seed and median), and field-trip counts —
  competent's own `forageTrips` ctx counter on BOTH legs (must be ~0
  extra on the armed leg: the point of the arm is banking with zero
  extra field time; a rise in the scholar's own trips would be a
  confound, named in the evidence if it appears).
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch diff
  and the proof test (`scripts/test-donatebank-b-20261114.js`) is
  green. Any src/js change = NO-GO.

Cost bar (from sim-scalemetric): starvation deaths pooled armed ≤
baseline + 2 AND median survival armed ≥ 0.8× baseline median.
Starvation = deaths whose recorded cause names starvation/hunger.
Guardrail (§14c): villager (non-scholar) combat deaths are a
co-primary read on every seed — the evidence reports deaths per seed
and the pilot verdict names any seed where armed deaths exceed the
before leg by >50%.

## Method (staged, §§9–12, 14–15)

- STAGE 0 SMOKE (1 seed × 2 policies, 60d): does the policy load,
  does the donation step fire, do proposes/accords/tends fire, does
  the driver capture the link roll? Fix wiring, not thresholds. (The
  proof test also carries a live 60d smoke leg on seed 100101.)
- STAGE 1 PILOT (8 seeds × 2 policies = 16 configs, 150d
  death-aware, identical seeds): the judged run. Horizon 150d because
  the finding's band is 150d and links need 30 days to season after a
  day-10 start. Seeds (exact literals): 100101, 100102, 100103,
  100104, 100105, 100106, 100107, 100108 (fresh band, verified
  above). Policies: competent-scaleclimb-b (baseline, recovered
  verbatim from 29a794df6) vs competent-donatebank-b (armed),
  identical seeds, same process shape as
  scripts/holdpantry-driver-20261114.js (adapted: policies +
  per-seed filenames + donation counters only).
- ENV (frozen — every flag recorded here; there are no others):
  defaults, matching the holdpantry driver — COUNTER_ANSWER unset,
  COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE unset,
  COMPETENT_TRADE_RESERVE unset. No other env.
  NOTE ON THE FLAG CHOICE (recorded so the replication check is
  auditable): the task brief says to replicate the driver setup of
  the cheaptend/holdpantry scaleclimb legs "including any
  ANSWERMAIL_DRIVE flag". The two legs differ, and the difference is
  lever-specific, not a setup drift: cheaptend ran with
  ANSWERMAIL_DRIVE=1 because its judged lever (the tend gate
  20k→10k) lives INSIDE the drive hook — the gate is only live when
  the drive is on. Holdpantry ran with the drive OFF (its per-seed
  JSONs carry `drive: null` on every series day; its driver header
  says "Env: defaults"). This arm isolates a leg of HOLDPANTRY's
  bundle, so the comparator is holdpantry's baseline: drive OFF.
  Turning the drive on here would add an engine tend channel to
  both legs and confound the isolation (the drive tends weekly at
  the 20k gate — the very gate the donation leg feeds). The sibling
  arm sim-answercourt-b made the same call independently (its prereg:
  "ENV: defaults, matching scaleclimb/holdpantry — COUNTER_ANSWER
  unset, COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE unset"),
  so the two baselines replicate each other exactly. If the
  coordinator intended ANSWERMAIL_DRIVE=1 for this arm, the
  baselines will NOT match cheaptend's — that would be a prereg
  revision for the next run, not a mid-run retune.
- CONFIRM (12–16 seeds) ONLY if the pilot is a clear GO. A
  borderline pilot is reported as-is and the coordinator decides; do
  NOT spend a confirm to rescue it.
- DRIVER (scripts/donatebank-driver-20261114.js, adapted from the
  holdpantry driver recovered from 4f26f01c5^): daily link roll, verb
  wrappers, `Game.say` capture FILTERED to link/polity lines only
  (cap 600), raw standing split read daily,
  `villageStandingTotal()` read ONCE at end-of-run. Per-seed JSON to
  evidence/2026-11-14/perseed-donatebank-b/. Zero src/js.
- ANALYZER (scripts/analyze-donatebank-b.js, adapted from the
  holdpantry analyzer): per-link trajectories + classification, verb
  table, per-seed diplomacy + polity days + HELD-DAYS + EVER-COUNTED,
  dip DECREMENTS named to the un-counting link, counted-day per
  counting EPISODE. Writes
  evidence/2026-11-14/donatebank-b-analysis.json.
- BALANCED PANEL (§15, methodology note — READ): the real
  `scripts/balance-panel.js` compare cannot judge a policy contrast:
  both panels must carry identical options.policies and identical
  policy/harness sources, and a modified or added policy file used by
  a panel invalidates the compare (scorecard comparePanels;
  scaleclimb/holdpantry preregs record the same refusal; filed
  methodology finding 2026-11-13). So per the holdpantry precedent
  (scripts/build-holdpantry-panels-20261114.js), the §15 compare runs
  on PSEUDO-panels built from the driver's per-seed JSONs
  (pseudo-policy 'donatebank' in both panels; case identity is the
  seed; contract metrics mappable from the JSONs only — won,
  national, survival30/60, communityLost, villageDeaths; all others
  null, never faked). The pseudo-panel compare is the instrument;
  the pre-registered G2 bar is the judge. The driver's
  identical-seed numbers decide the verdict, not the panel.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures — the
  driver observes the policies' own play; nothing is staged.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the propose / accord-gift / tend / seasoning / polity lines the
driver captures and judge whether the courtship reads like a played
relationship or a silent meter — AND whether the polity's HOLDING or
DISSOLUTION now has a played line (the holdpantry gap: dissolution
had no line at all). Read villager dialogue in the captured lines
where present; judge meaning and coherence, never just counts.

## Evidence

- Prereg: this file.
- Baseline policy: scripts/policies/competent-scaleclimb-b.js
  (restored verbatim from 29a794df6 — instrument, not a lever).
- Policy: scripts/policies/competent-donatebank-b.js (new).
- Driver: scripts/donatebank-driver-20261114.js (new, adapted).
- Analyzer: scripts/analyze-donatebank-b.js (new, adapted).
- Panel builder: scripts/build-donatebank-panels-20261114.js (new,
  holdpantry pattern).
- Proof: scripts/test-donatebank-b-20261114.js (new; static + game).
- Per-seed JSON: evidence/2026-11-14/perseed-donatebank-b/ (16 files).
- Panel: evidence/2026-11-14/donatebank-panel.{json,md}
  (+ -before/-after .json.gz pair).
- Evidence: evidence/2026-11-14/sim-donatebank-b.md (per-seed
  tables, verb table, wall numbers, sense-testing, metric review).
- Replication check: the BEFORE leg's per-seed end-state columns
  (days, endReason, won, maxWave, standing, waveKills) compared
  against the sibling sim-answercourt-b baseline leg on the SAME
  seeds (100101–100108) — identical seeds + identical policy +
  identical env must give identical numbers; any difference is an
  instrument error to investigate, not a rounding artifact.

## Convergence state

BUILD — the verdict is GO/NO-GO against G2 above. A GO licenses a
12–16 seed confirm (coordinator's call); a NO-GO parks the lever
with the numbers that killed it. Either way the axis line updates
from this run's numbers only.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did G1/G2/G3 measure the lever, or
did the metric prove wrong (bad proxy, blind channel)?

## SEPARATION FINDING (post-prereg, pre-pilot — STAGE 0 STOP, 2026-11-14)

Added after the proof test's §2 smoke leg and a mechanism probe, both
run BEFORE any pilot seed was spent. The task's gate ("if the donation
leg cannot be cleanly separated from the trips/pack changes, say so in
your prereg and STOP") is answered here: the donation leg separates
CLEANLY as code, but the separated leg moves ZERO grain — the
separation kills the effect. The pilot is NOT run. Verdict: DIAG-STOP,
not a G2 NO-GO (no judged pilot exists to fail).

The smoke (proof test §2, seed 100101, 60d, both policies): the armed
leg's donation step ran on 49 bank days and donated **0 kcal**
(bankDonatedKcal 0, bankPantryDelta 0; bankSorted 4, bankCooked 0).
The mechanism probe (scripts/probe-donation-source-20261114.js,
decomposed daily on seeds 100101 and 91103, 60d each) pins why:

| Seed | Donatebank banking step (60d) | Holdpantry banking step (60d) |
|---|---|---|
| 100101 | bankDays 49, donated **0** | bankDays 42, trips 42 (5 ok), donated **306** |
| 91103 | bankDays 51, donated **0** | bankDays 47, trips 47 (**0 ok**), donated **15,210** |

On 91103 — the exact seed where holdpantry's pilot donated the most
(40,590 kcal with 0/96 trips ok) — the donation-only step still moves
0 kcal, while holdpantry's full banking step moves 15,210 kcal in 60d
with ZERO successful trips. The probe's pack measurement explains it:
donation-ready pack kcal after competent.daily is 0 on most days
(median 0, max 900–1,030 without the trip; max 10,260 with the trip).
Competent's own daily already eats the day's ordinary haul and sweeps
its surplus (keep 2× cap when kcal > 1.5× cap), so by the time the
donation step runs the pack holds nothing above the 1-day keep. The
trip — even a "failed" one (forage returns falsy) — leaves
donation-ready food in the pack (travel + forage attempts gather
even when the forage action reports failure; the exact yield channel
is unrecorded — see the evidence file's backlog item). The donation
call is the FUNNEL; the trip is the SOURCE. Without the trip, the
funnel is empty.

CORRECTED CAUSAL CLAIM: the holdpantry evidence's "the donation leg
moved 118,914 kcal with zero field time" is wrong as a causal claim.
What moved the grain was the TRIP's gathering + the donation call
together; the donation call alone moves nothing. The 91103 case does
NOT prove donation-without-field-time — it proves donation-without-
SUCCESSFUL-trips, and a failed trip still spends the evening in the
field (the exposure cost the arm was meant to remove is still paid
by the trip that fills the pack).

CONSEQUENCE: no pilot band is spent. The G2 bar (median held-days
≥45, ever-counted ≥6/8) is never tested because the lever's input —
banked kcal — is 0 on both probe seeds; a pilot would be measuring a
zero-effect lever. The cost bar is moot for the same reason (nothing
is spent, nothing is risked). G1 holds at smoke scale (0 instrument
errors, 0 unattributed diplomacy, all links classified on the 60d
smoke). G3 holds (zero src/js changes; proof test static 63/63,
game 28/29 — the single failure IS the donation-moved-grain
assertion, which correctly caught the dead lever). Full record in
evidence/2026-11-14/sim-donatebank-b.md.
