# sim-tendexact-a — pre-registration (committed before any judged sim)

Arm: sim-tendexact-a, run fleshout-20261110T1215Z (Loop A),
axis scale-onramp / winnability chain. Base SHA: e2983bb90
(current master at spawn; includes landed talkturn-a and
answermail-drive-a arms). Worktree: sim-tendexact-a.
Finding: sim-findings #2072 (from sim-answermail-a, pilot band
99101-99108): tendLink removes whole pantry items — 9 of 99101's
10 tends paid 1,600 kcal, not the 1,500 sticker price; 41 tends
band-wide paid 64,732 kcal vs 61,500 at sticker (~5% over).
The +8 trust is priced on 1,500, so the village pays ~5% more
grain than the fiction names.

## The fix (decided with evidence, before the judged pilot)

`_removePantryKcal` (src/js/hierarchy.js:991) takes whole units
with `Math.ceil(need / per)` — the deliberate break-it food r3
(2026-10-10) doctrine: fractional UNITS minted crumbs that ate
at full per-unit value downstream (eatOne grants kcalEach per
bite regardless of fraction; takeFromPantry's coercion inflated
sub-1 crumbs back to whole units — measured +50% phantom kcal
on a tribute shave). That doctrine is evidence that NAIVE
fractional-unit splitting is wrong — it is NOT evidence that
exact payment is impossible.

The exact-split this arm implements does NOT mint fractional
units. It follows the precedent already in the codebase,
`depositPantryPieces` (src/js/game.js, "PANTRY GRANULARITY —
DEFAULT DEPOSIT", Steve 2026-10-08): food enters the pantry
granulated into pieces of at most 500 kcal, each piece a whole
unit (units=1) with its own kcalEach and proportional kg. The
fix: when the final unit of a `_removePantryKcal` take would
over-take, remove that unit and leave behind a remainder piece —
same fields, units=1, kcalEach = per - needed, kg scaled
proportionally (mirroring `depositPantryPieces.place`).
`stacksMatch` (src/js/food.js:2892) requires kcalEach AND kg to
match before two stacks merge, so the remainder piece can never
merge into a full stack and launder its value upward — the
exact hazard the fungibility gate exists to prevent. Eating the
remainder grants its kcalEach (its true value), never a full
bite. The resticker fallback (tend price 1,500 -> 1,600)
applies ONLY if the proof shows the split representation leaks
value (remainder pieces merging, eaten at full value, or
pantry totals drifting) — the proof test checks exactly those
properties, RED->GREEN, before any judged sim is trusted.

Scope: `_removePantryKcal` only — one function, the shared
pantry-removal path. Every caller (tend, accord gift, tribute,
renegotiation, demands) already reports ACTUALS, so exact
payment makes every sticker honest, not just the tend's. No
trust, cap, price, deed, or gate number moves. The 100 trust
cap (#2073) is NOT moved: it is measured only (secondary).

## Canon

No canon doc covers trust, links, accords, or tend pricing
(docs/CANON.md manifest lists none; docs/SCALE.md covers
polity shapes and the trust-40 bar). The split representation
is grounded in code precedent (depositPantryPieces granulation
+ stacksMatch gate), stated here, not invented as canon.
docs/PRESERVATION.md covers the food ladder (cleaned ->
cooked -> smoked -> rendered -> pemmican); this fix does not
change any ladder step.

## Substrate

competent + ANSWERMAIL=1 policy: scripts/policies/
competent-answermail-a.js (landed as 5db4f6fef, arm
sim-answermail-a) — the policy that makes tends fire. Control
leg: same policy on BASE code (fix off). Armed leg: same
policy on FIXED code. The fix is game code, so the two legs
run on different code revisions by design; identical seeds,
identical policy, identical driver
(scripts/tendexact-driver-20261110.js, modelled on
scripts/answermail-driver-20261110.js, trustgrowth
instrument v2 reused verbatim). ANSWERMAIL_DRIVE is NOT set:
only policy tends fire.

## Seeds and band accounting

- Pilot: 150201-150208, 8 seeds/leg, 150d death-aware
  horizon (matches answermail-a; villages die before 150d).
- Band freshness: 150201-150208 was checked fresh by
  sim-talkturn-a and sim-answermail-drive-a (their preregs;
  `git grep` over evidence/*/sim-*-prereg.md names only those
  two arms). Both sibling arms already ran JUDGED pilots on
  this band with different levers (plain-competent controls):
  perseed-talkturn-a/ and perseed-answermail-drive-a/ hold
  their 16-file corpora. That does not contaminate this band
  for a game-code arm — the seeds are the same ground, the
  lever is different — but it is recorded here for band
  accounting, per the brief.
- Confirm (ONLY if the pilot is GO): 150209-150216, 8
  seeds/leg. NOTE: 150209-150216 is named in the talkturn-a
  and answermail-drive-a preregs as THEIR confirm band (range
  endpoints only; no judged corpus exists on it — no
  perseed-*-s15020[9]*/s15021* files). A naming reserves a
  band per the seed-band-freshness skill, and this brief
  assigns it to this arm anyway; at confirm time, re-check
  whether either sibling actually ran judged sims on it
  before using it, and record the outcome in the evidence
  file. If it is taken, pick a fresh band and record the
  collision.
- Loop B uses 140201-140216 and 140217-140224 — NOT used here.

## Primary metric (binds the run, §14)

Pantry kcal paid per tend == 1,500 exactly.

- GO: every tend in the armed pilot corpus pays exactly
  1,500 kcal (at least 8 tends sampled — the answermail-a
  pilot fired 41 tends on its band, so 8+ is expected), AND
  no tend in the armed corpus pays MORE than 1,500.
- NO-GO: any tend pays more than 1,500 kcal.
- Partial tends (paid < 1,500 because the pantry held less
  than 1,500 at tend time) are honest underpayment, priced
  by tendLink's frac path — they are counted separately and
  do NOT fail GO, but any such tend is investigated and
  reported (the policy gate is pantry > 20,000 kcal, so a
  partial tend would mean the pantry collapsed between the
  gate check and the tend — a real finding, not a pass).
- Judge against this header. A miss is NO-GO, never re-scored
  against a friendlier metric mid-run.

## Secondary (measure only)

Trust lost to the 100 cap (#2073): count tends landing at
trust 100 with a gain below +8 (e.g. 96 -> 100, +4) and the
trust lost (8 - gain, summed). DO NOT move the cap — whether
100 is the right ceiling for a seasoned bond is a design
question for Steve.

## Cost bar (scalemetric deciding bar)

Starvation (armed) <= starvation (control) + 2 AND arm-only
starvation deaths <= control starvation deaths AND median
survival (armed) >= 0.8 x median survival (control). Standard
median on the per-seed day list (not the trustgrowth
analyzer's upper median — see answermail-a amendment 1).
Death-cause shares and per-100-day deaths reported alongside
(the whole-run death count misleads on life-extension levers;
answermail-a metric review).

## Fidelity gates

- Instrument errors 0 on all 16 legs.
- Per-tend paid values recorded for every tend on both legs
  (policy STATS events, kind 'tend').
- Reconciliation: the tend count in the corpus matches the
  policy stats on every seed.
- Tends fire on the armed leg (tends > 0 band-wide); the
  control leg reproduces the overpay (paid > 1,500 on at
  least one tend — the finding this arm fixes).

## Wall numbers (reported every run, not judged)

National / table / wins, wave 4-5 unlocks, median survival,
per seed and band-wide, both legs.

## Sense test

Read at least one transcript/case where a tend is paid and
judge whether the fiction (what the village paid vs what the
tend promises — "Haven sends 1,500 kcal of grain") reads
honestly on the fixed code. The tend line repeats verbatim
weekly (answermail-a sense-test tension (a)) — named, not
fixed here.

## Proof (RED->GREEN, before the judged pilot is trusted)

scripts/test-tendexact-a.js: unit legs for the split —
exact payment on mixed pantry (item smaller than amount,
exact item, multiple items, remainder-piece shape:
units=1, reduced kcalEach, proportional kg, never merges
with a full stack via stacksMatch, eaten at its true value),
plus a sim leg (per-tend cost on the pilot band). The unit
legs MUST fail on pre-fix code (overpay reproduced) and pass
on fixed code. The sim legs run after the fix lands in the
worktree; the control leg runs on the pre-fix code first and
its corpus is kept as the before.
