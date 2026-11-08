# sim-pairoverlap-rate-b — prereg (v1 FROZEN, GO bars by amendment)

**Arm:** sim-pairoverlap-rate-b (run fleshout-loop-b-20261108T0013Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** The lever
mechanism is UNCHANGED from sim-pairoverlap-b: the yield-the-blow
wrapper (`scripts/policies/competent-pairoverlap-b.js`, as-is, composing
onto the FROZEN feast-drive substrate
`scripts/policies/competent-feastdrive-b.js`, unmodified, composing onto
the FROZEN staged substrate `scripts/policies/competent-stageally-a.js`,
unmodified). **The ONLY change in this arm is the cost instrument:**
starvation deaths per 100 village-days instead of the absolute count.
**Base:** master **ba9859e132ebec89c2bb1451af5986d8199ddfa1** (read fresh
in the main tree immediately before writing this prereg; worktree
rebased onto it clean — the pairoverlap-b commits are already ancestors
of this master).
**Pilot band:** 53001–53008, DELIBERATELY REUSED balanced-panel band.
**Confirm band (if the pilot goes):** 53501–53512 (first choice;
53601–53612 backup) — freshness verified in this prereg, see §Confirm.
**Horizon:** 150d death-aware. **Policies:** baseline = staged +
feast drive re-baselined on current master; armed = staged + feast
drive + yield-the-blow (`scripts/policies/competent-pairoverlap-b.js`).

## Why this arm exists (read from sim-pairoverlap-b.md, not re-argued)

The lever is HELD, not killed. Pilot GO (pair days 97 vs bar 61),
confirm NO-GO only because the absolute starvation count bar (8 vs
bar 5) fired on one seed whose village lived twice as long (53303:
141d vs 70d). The mechanism is proven on two bands (scholar-kills →
companion-kills: pilot 22→13 / 8→16; confirm 24→14 / 12→17). The
starvation bar counts absolute deaths with no adjustment for days
lived, so a longer-lived village is punished for surviving. This arm
re-runs the identical lever with the cost instrument fixed:
starvation deaths per 100 village-days. The old confirm's own rates
were armed 0.66 vs baseline 0.24 per 100d — this arm sets its bar from
ITS OWN pilot baseline, not from those numbers (see Cost bar). If the
rate bar still fails, the lever is killed: the cost is real, not an
artifact of the instrument.

## Canon

READ first: `docs/CANON.md`. **No canon doc covers the feast/surge
system as a dedicated doc** — the same standing note as the
feastdrive / pairoverlap preregs. The design record is the code
itself: `src/js/feastBuff.js` (timed buff, devotion gate, feast draw,
honest use marking — spend consumes the arming, `feastSurgeUsed`
marks real combat use) and `src/js/progression.js` (`foodDeeds =
sentimentTaught && feastSurgeUsed`, :650) plus `docs/BALANCING.md`
§78–79. Nothing is invented from scratch; every mechanism claim is
read from that code and cited to it. The lever mechanism, its seven
frozen conditions, and the yield shape are as specified in
`evidence/2026-11-07/sim-pairoverlap-b-prereg.md` — that prereg is
the mechanism's frozen record and is not re-copied here.

## Substrate — RE-BASELINE FIRST (the pilot gate covers this)

Master moved since the pairoverlap-b base (8842af2e6 →
ba9859e13). The src/js delta in the range that can touch this arm's
path: `food.js` (journey-establishment r113: self-taught first rung
10 XP → 5 XP — villagers gain their first skill rung sooner, which
can move foraging/preservation trajectories), `conversation.js`
(journey-succession r155 opener-skip fix — dialogue only), plus the
alien expansion (`alienPlayers.js`, `alienPlayers.json`: 4 new
meddler personas wired into contest interference, verdict-only).
The old proof test re-ran 34/34 PASS on this base, but its live legs
already show moved trajectories (53004 armed pair days 7 vs 23 on
the old base; 53006 armed 9 vs 0), so the substrate MUST be
re-verified on current master before any verdict leans on it.
Order: (1) run the re-baseline leg (staged + feastdrive, current
master, 8 seeds); (2) check SUBSTRATE SANITY (below); (3) run the
armed leg only if sanity passes.

**Substrate sanity (FROZEN, pilot):** the re-baseline leg must show
`foodDeeds` ≥ 3/8 AND ≥ 2 seeds with a spend day. If sanity fails,
the outcome is SUBSTRATE COLLAPSED — the lever is NOT judged (no
GO/NO-GO), the collapse is reported with numbers, and the finding
is filed. The pairoverlap-b re-baseline (base 8842af2e6: pair days
51, foodDeeds 5/8, median 129d) is historical context only; the
judged comparison is re-baseline vs armed, both on ba9859e13,
identical seeds.

**Substrate sanity (confirm, scaled):** `foodDeeds` ≥ 5/12 AND ≥ 3
seeds with a spend day (3/8 scaled to 12 seeds, rounded up).

**Substrate guard (FROZEN):** 8/8 per-seed exact pre-first-yield
(pilot; 12/12 on confirm). Baseline and armed daily rows must match
exactly for every day strictly BEFORE the armed leg's first
yield-fire day on that seed. A divergence before the first yield
day is an instrument / composition error and invalidates the verdict
— investigate, do not judge.

## Primary metric (FROZEN, number by amendment)

PAIR-DAYS (total over 8 seeds pilot / 12 seeds confirm, from the
driver's daily rows) **AND** `foodDeeds` kept (≥ the re-baseline
count — BOTH must pass). The exact pair-days GO number is set by
AMENDMENT after the re-baseline is measured and BEFORE any armed
pilot, by this rule: **armed ≥ max(35, re-baseline + 10)**. The 35
is the feastcap/feaststopspend bar; the +10 requires the lever to
ADD overlap, not merely match a collapsed baseline. The amendment
carries the exact number AND the pool check (§14b): the
re-baseline's scholar-kill pool (via-player wave-4 kills) must be ≥
the delta's order of magnitude; if the pool cannot support the
delta, the arm stops as DIAG (metric-broken), not as a judged NO-GO.
A primary hit that breaches the cost bar is NO-GO.

## Cost bar (FROZEN — the rate instrument is the arm's only change)

- STARVATION RATE (the new instrument): starvation deaths per 100
  village-days, where village-days = the sum over seeds of days
  lived (`days` in the driver output) and deaths = the analyzer's
  corrected starvation count. **Armed rate ≤ baseline rate + TOL**,
  where TOL is set by AMENDMENT after the pilot baseline is
  measured and BEFORE any armed pilot, by this rule:
  **TOL = max(0.15, 0.5 × pilot-baseline rate)**. Justification,
  pre-committed: the tolerance must scale with the baseline's own
  hunger level (a flat +0.30 would be 3× a quiet baseline and
  nothing on a hungry one); the 0.15 floor keeps the bar meaningful
  when the baseline is near zero (with ~800–1,200 village-days per
  leg, 0.15/100d is ~1–2 deaths — one seed's bad winter must not
  sink a clean lever); the 0.5× slope caps the allowance at half
  the baseline's own rate, so the armed leg cannot run half-again
  as hungry as baseline and pass. Calibration check against the
  OLD arm's numbers (not the bar — the bar comes from THIS pilot):
  on the old confirm band the delta was +0.42/100d (0.66 vs 0.24),
  which exceeds max(0.15, 0.5×0.24) = 0.15, so this instrument
  would still have caught the old failure — it is not a rescue
  re-score. On the old pilot the delta was small (3 vs 2 deaths on
  longer-lived armed villages), inside the tolerance. The absolute
  starvation count is reported per seed as a secondary and is NOT a
  bar in this arm.
- DONATIONS (armed total, from the policy stats `donatedKcal`)
  ≤ re-baseline total.
- `foodDeeds` ≥ re-baseline count (see primary — the deed is kept).
- Median survival ≥ 0.8× re-baseline median. Survived count is
  reported alongside the median.

## Secondaries (FROZEN)

Yield fires (total + per seed), yield fights, yields-capped,
first-yield days, wave-4 kills by `via` (player / companion / wild
— the conversion the lever claims), companion kills on yield days,
pair days per seed, first-pair day per seed, `feastSurgeUsed` per
seed, first-spend days, end feast gates, wave-4 kills and pair days
vs re-baseline, wave-5 unlocks/kills, standing, survived count,
scale-wall numbers (national / table / wins, wave 4–5 unlocks,
median survival), starvation deaths per seed (absolute, reported
not judged), village-days per leg, starvation rate per leg and per
seed.

## Judge

The run is judged against this header (plus the amendment's exact
numbers). A miss is NO-GO, never re-scored against a friendlier
metric mid-run. If a metric proves wrong, write it under "metric
review" and propose the revision for the NEXT run. If the pilot
fails, the lever is killed at pilot — never run 12 seeds on an
invisible effect. The rate instrument is judged by the same rule:
if the rate bar fails on the confirm, the lever is KILLED (the
cost is real, not an artifact of the instrument — this arm spends
its one re-instrumentation).

## Panel (§15)

Before/after through `scripts/balance-panel.js` — the pairoverlap
policy is already registered in `scripts/sweep-compare.js` (no
existing policy file touched), same seeds, same days, one combined
campaign; the compare `.md` is attached to the evidence file. The
panel is the instrument, the pre-registered threshold is the judge.
Panel builders: `scripts/build-pairoverlap-rate-panels-20261107.js`
(pilot) and `scripts/build-pairoverlap-rate-confirm-panels-20261107.js`
(confirm). Rate analysis: `scripts/pairoverlap-rate-analyze-20261107.js`
(reuses `loadCorpus` from `scripts/pairoverlap-analyze-20261107.js`;
adds village-days, per-leg starvation rates, and the rate bar).

## Confirm (if GO at pilot)

12-seed confirm, only after the seed-band freshness check (below).
Same frozen bars (plus the amendment's numbers, re-derived from
the confirm's own baseline by the same rules: pair bar
max(35, confirm-baseline + 10); rate tolerance max(0.15, 0.5 ×
confirm-baseline rate)).

**Freshness check (done 2026-11-07, recorded here):** scope — grep
over ALL `evidence/*/sim-*-prereg.md` in the repo, plus all `*.md`
under
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/`
(forbidden/contaminated lists included), for the exact band starts
and every seed in each candidate range. Results: `53501` — zero
namings; `53601` — zero namings; no `.md` file anywhere in
`evidence/` or `hidden_files/` names any seed in 53501–53512 or
53601–53612. Control: the same grep DOES find `53401` named in
`evidence/2026-11-07/sim-pairoverlap-b-prereg.md` (the backup band
named there) — therefore **53401–53412 is NOT fresh**, as the brief
stated, and the method is verified sensitive. The `grep -rln` hits
for 53501/53601 inside `hidden_files/` JSON files are false
positives — the digits occur inside floating-point values (e.g.
`18069.553301672266`), not as seed bands; no `.md` file names
either band. **Confirm band: 53501–53512 (first choice);
53601–53612 is the verified backup.** If the pilot goes, the
confirm runs on 53501–53512.

## Convergence state reported

converging | converged | parked | killed-at-pilot, per axis
scale-onramp.

## Proof (before any judged sim)

`scripts/test-pairoverlap-rate-20261107.js`: rate-arithmetic
fixtures (deaths/days → rate per 100d, including the zero-days
guard and the per-seed rate), rate-bar fixtures (the OLD confirm
numbers as a must-FAIL fixture — baseline 3 deaths / 1,239 days =
0.24, armed 8 / 1,221 = 0.66, delta +0.42 > tolerance — and the
OLD pilot numbers as a must-PASS fixture), analyzer reuse fixtures
(`guardRows` still catches a pre-yield divergence), and a live leg
via the driver in /tmp (structural invariants only): a neutrality
leg (feastdrive vs pairoverlap on seed 53001 — daily rows exact
before the first yield day) with the rate computed from the two
live corpora. Proof green BEFORE the judged pilot sims; re-run
green after each commit that touches the instrument, driver, or
policy. The lever mechanism itself is already proven by
`scripts/test-pairoverlap-20261107.js` (34/34 PASS, re-run on this
base 2026-11-07); this test proves the NEW instrument, not the
lever again.
