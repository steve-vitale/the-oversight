# sim-ove48-drawparity-prereg — OVE-48 RNG-DRAW-PARITY PROBE (Loop A, fleshout-20261115T0547Z)

Run: fleshout-20261115T0547Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-ove48-drawparity-a, branch `sim-ove48-drawparity-a`,
worktree `~/workspace/worktrees/sim-ove48-drawparity-a`. Tracker blank:
the RNG-draw-drift carrier named (not proven) in
evidence/2026-11-14/sim-ove48-mech-a.md §(c). This arm is DIAG only —
it does NOT make the revert-vs-keep call and does NOT re-test the
survival gap (the sibling arm sim-ove48-freshband-a owns the
fresh-band survival re-test).

## Authority

- evidence/2026-11-14/sim-transplant15a-band3.md (band 3: far end 3/8
  survived vs OVE-48 subject 0/8 on band 190457–190464, 150d,
  competent verbatim — CARRIER verdict, causal path unproven).
- evidence/2026-11-14/sim-ove48-conv.md (mechanism GO: dawn-aligned
  share 28.7% → 74.9%; weighted-pick OPENS 515 base vs 569 subject,
  +54; `convoDawnPriorities` reads 0 base / 569 subject).
- evidence/2026-11-14/sim-ove48-mech-a.md §(c) (CAUSAL PATH PROVEN
  NEGATIVE: kcal +0.014% of pantry flow, ticks +0.012%, 0 held
  opens, no state series diverges before the first death divergence
  on any seed; deathDiv days 190457 d6, 190458 d11, 190459 d11,
  190460 d6, 190461 d6, 190462 d14, 190463 d4, 190464 d4).
- evidence/2026-11-13/sim-culpritbisect-a-prereg.md (standing-fix
  swap discipline; leg-verification precedent) and
  evidence/2026-11-14/sim-ove48-mech-prereg.md (step mechanics,
  own-policy per step).
- docs/CANON.md read first; docs/VILLAGER-BRAIN.md Phase 4 read
  (`convoSelectWant` reads the villager's current commitment and
  top drive so a conversation opens from the same priorities dawn
  chose); docs/CONVERSATIONS.md read (real back-and-forth dialogue;
  a conversation costs 10 kcal + 1 tick to open). No canon doc
  covers RNG-draw parity — this is a measurement question, not a
  design one, and nothing here invents canon.

## Correction to the record (made here, before any judged sim)

The mech evidence §(c) table labels "Weighted-pick draws (RNG
draws) | 515 | 569 (+54)". That label is WRONG: the conv evidence
table (line 134) says "Weighted-pick opens | 515 | 569 | +54" —
515/569 is a count of OPENS classified as weighted-pick, not a
count of Math.random draws. No RNG draw was ever counted on either
leg. The candidate carrier as stated ("54 extra weighted-pick
draws re-roll every later fight and forage") is therefore
UNMEASURED, and this probe measures the real thing: total
Math.random draws per seed-run on each leg, per day, and by call
site. The +54 opens is still the right scale hint (see §Scale
expectation).

## Code-read result (done BEFORE this prereg; not a sim)

On current master (this worktree's HEAD), the weighted pick in
`convoSelectWant` (src/js/convo-wants.js:2609-2672):

- `convoDawnPriorities` (convo-wants.js:1783-1824) is PURE READS:
  `vbrainCommit` / `vgoalState` / `vgoalWeights` + a table lookup
  (`dawnPreferredBoosts`). It calls `Math.random` ZERO times. The
  OVE-48 read itself consumes no draws.
- The weighted-pick loop iterates `Object.keys(WANTS)` — 9 keys on
  this tree (share_news, ask_favor, repay, pocketed, seek_comfort,
  warn_you, curious, just_company, seek_taken) — and adds
  `Math.random() * 0.5` once per key: ≥9 draws per weighted pick,
  plus whatever `def.pick()` / `def.canOpen()` draw internally
  (those are state-dependent and may differ once trajectories
  diverge).
- Consequence: at the FIRST pick of a seed-run the game state is
  identical on both legs (same seed, same dawn state — no writer
  exists on either leg, so kind/drive come from the same
  `vgoalState`/`vgoalWeights` reads), so per-pick draw counts
  should be identical there. Any total draw delta must therefore
  come from a DIFFERENT NUMBER of picks and downstream events —
  i.e. the draw delta is downstream of the pick OUTCOME (the
  subject picks a different, dawn-aligned want; the opener, the
  sitting, and everything after it draw differently), not of the
  dawn read itself. The timing question below tests exactly when
  the draw streams part, against the deathDiv days.

## The question

Does the OVE-48 subject consume a different number of RNG draws
than the far-end base on identical seeds, where does the delta
live, and does it precede the first death divergence — i.e. is
RNG-draw drift a live non-semantic carrier for the band-3
survival gap, or is there no draw delta at all?

## Legs (TWO judged legs + determinism re-runs; all band 190457–190464, 150d death-aware)

- L-BASE: far end `203a32775`, STEP t-ove48-drawparity-base,
  competent verbatim (COMPETENT_TALK NOT set — the walk-out policy
  band 3 ran).
- L-SUBJ: subject branch `transplant-15a-narrowed-subject` at
  `493d7a975`, STEP t-ove48-drawparity-subj, competent verbatim.
  Subject verified at run start before any sim (exactly 1 commit
  on the far end; diff vs far end exactly 3 files +320/-3:
  docs/ONTOLOGY.md, scripts/test-convo-dawn-priorities.js +206,
  src/js/convo-wants.js +111/-1; same verification as the
  ove48-conv prereg). Read-only use; NEVER commit onto it; NEVER
  rebuild it. If verification fails, FAIL LOUDLY and stop.
- All legs: roster-check standing fix swapped in for every step
  exactly as the bisect prereg specifies (fix file sha
  f8fda4295a99, from commit 5157782a4; native restored
  byte-identical afterwards, sha-verified 75762cb2…). Own-policy
  per step (each step runs its commit's OWN competent.js).
- DETERMINISM RE-RUNS (instrument validity, separate processes):
  seeds 190457 + 190464 on EACH leg, STEPs
  t-ove48-drawparity-base-r2 / t-ove48-drawparity-subj-r2, same
  driver, same env. Per-seed total draws must reproduce EXACTLY
  or the verdict is withheld (see §Determinism check).

## Seeds — deliberate reuse (recorded, not a freshness violation)

Band 190457–190464 is DELIBERATELY reused: it is the band where
the +54 opens were measured and where the deathDiv days come
from, so the draw probe is measured on the same trajectories.
No fresh-band check is owed for a deliberate reuse. No other live
arm runs this band: the sibling freshband arm uses a different
fresh band (claim fleshout-20261115T0547Z.json), Loop B is on
winnability-chain seeds.

## Horizon + policy

- Horizon: 150d, death-aware (+10d tail max) — identical to band 3,
  so per-seed days are comparable.
- Policy: competent verbatim, own-policy per step (recorded per
  seed). COMPETENT_TALK NOT set on any leg.

## Instrument (drawparity — new; reuses the conv/mech driver shape)

`scripts/ove48-drawparity-instrument-20261114.js`, installed
BEFORE `sim-harness` is required (modules capture Math.random at
load; the harness assigns `Math.random = mulberry32(seed)` per
loadGame, and the instrument's defineProperty getter/setter wraps
each assignment):

- A pure pass-through Math.random counter: wraps the seeded
  function, counts calls, returns its value unchanged. It writes
  NO game state and consumes NO draws itself (count by wrapping,
  never by drawing). The stage-1 proof unit-tests this against a
  fake RNG (values pass through in order; the fake is called
  exactly once per call).
- Attribution by context stack (no per-call stack capture — too
  slow for 150d runs): method wraps set the innermost context
  while they run; each draw is bucketed to the innermost active
  context. Buckets: `dawn` (inside `convoDawnPriorities`),
  `selectWant` (inside `convoSelectWant`, outside `dawn`),
  `talk` (inside `talkTo`, outside the pick), `other` (everywhere
  else). The wraps are pure observers: they call the original and
  return its value unchanged, and record only counts.
- Per weighted pick (inside the `convoSelectWant` wrap): day,
  vid, want id, source class (seed / repay-preemptor /
  pocketed-preemptor / weighted-pick, same classifier as the conv
  instrument), draws consumed inside that call, and
  `convoDawnPriorities` calls inside it.
- Per-seed series: cumulative draws at each day boundary
  (recorded in the policy.daily wrapper, same point as the conv
  driver's vetfirst snapshot), so a per-day draw series and a
  cumulative-draws-by-day series fall out by differencing.
  Setup draws (loadGame + setupGame, before the run phase) are
  recorded separately and the run counters reset after setupGame.
- The driver (`scripts/ove48-drawparity-driver-20261114.js`) is a
  copy of the ove48-conv driver with the convo recorder replaced
  by this instrument (same substrate, same leg guards — standing
  marker-required, policy record-only — same vetfirst install,
  same per-seed JSON shape plus the draw fields, same
  writeRobust). It also records deaths (day/kind/who/cause),
  days, endReason, scale rank, wave, standing, pantry, readiness
  — the wall numbers are context, not the verdict.
- The analyzer (`scripts/ove48-drawparity-analyze-20261114.js`)
  compares the two corpora and judges the bars below. The step
  script (`scripts/ove48-drawparity-step.sh`) is modeled on
  scripts/ove48-mech-step.sh (checkout detached, restore tooling
  scratch — drawparity instrument/driver/analyzer + vetfirst
  instrument — from branch sim-ove48-drawparity-a, swap the fix,
  run the driver, restore native standing.js byte-identical,
  delete scratch, verify the tracked tree clean).

## Scale expectation (stated before the runs, not a bar)

Each weighted pick draws ≥9 (one per WANTS key) plus
pick()/canOpen() draws. If per-pick draws are equal across legs,
the +54 opens alone predict a total draw delta in the HUNDREDS
(54 × ~9–15), concentrated in the `selectWant` bucket — so the
+40 total bar below is a weak tripwire and the sign-consistency
(≥7/8) and localization (≥80%) bars carry the information. A
total delta near zero would mean per-pick draws are NOT equal
(the subject's picks draw fewer each, offsetting the extra
opens) — that is itself a finding, reported, not re-scored.

## Pre-registered bars (judge exactly this)

Primary metric: per-seed TOTAL Math.random draws consumed in the
run phase (after setupGame), subject − base, on identical seeds.

- **PARITY-FAIL** (candidate carrier alive): median per-seed
  total-draw delta (subject − base) > 0 AND total delta across
  8 seeds >= +40 AND the same sign (positive) on >= 7/8 seeds.
- **PARITY-OK** (no draw delta): |total delta across 8 seeds|
  <= 10 OR the per-seed sign is mixed across seeds (neither
  positive on >= 7/8 nor negative on >= 7/8).
- **AMBIGUOUS** otherwise (e.g. median > 0 but total < +40 with a
  consistent positive sign on ≥7/8 seeds; or a consistent NEGATIVE
  delta — the subject drawing fewer — with |total| > 10; or median
  and total pointing in opposite directions).
- **Localization bar** (only if PARITY-FAIL): name the call
  site(s) carrying >= 80% of the total delta, or report
  UNLOCALIZED. Buckets are `dawn`, `selectWant`, `talk`, `other`;
  a `selectWant`-dominant delta localizes to the weighted pick
  (and the per-pick records say whether it is more picks or more
  draws per pick); an `other`-dominant delta is UNLOCALIZED at
  this instrument's resolution and the evidence says so.
- **Timing question** (diagnostic, NOT part of the PARITY
  verdict): for each seed, the first day the cumulative-draw
  series differ between legs (first day with a nonzero per-day
  draw delta) vs that seed's deathDiv day from ove48-mech
  (190457 d6, 190458 d11, 190459 d11, 190460 d6, 190461 d6,
  190462 d14, 190463 d4, 190464 d4). Report X/8 seeds where the
  draw divergence strictly precedes deathDiv, and whether these
  runs reproduce the same deathDiv days (any drift noted
  per-seed). Draw divergence preceding deathDiv keeps the
  carrier candidate alive as a timing matter; draw divergence
  ON/AFTER deathDiv would make the draw delta an effect of the
  deaths, not a carrier — reported either way, never re-scored.

## Determinism check (instrument validity, pre-registered)

Re-running the same leg reproduces the same per-seed draw counts
exactly, or the counts are reported as non-deterministic and the
verdict is withheld. Concretely: the r2 re-runs (seeds 190457 +
190464 per leg) must match the judged legs' per-seed TOTAL draws
exactly (and per-seed days exactly). Any mismatch → verdict
WITHHELD, evidence reports the mismatch, no PARITY call is made.

## Validity (per leg; a failed check is reported, never waived)

- V1 opens ≥ 200/leg (walk-out policy; expect ~875 base / ~935
  subj per the conv corpora).
- V2 replication: per-seed days match the ove48-conv corpora
  EXACTLY (base 150/101/150/124/129/150/23/115; subj
  134/108/109/129/135/123/138/142) and survived counts match
  (3/8 base, 0/8 subj). The draw counter is a pure observer, so
  any mismatch means the instrument perturbed the run — the leg
  is re-run or the verdict withheld.
- V3 dawn reads: `convoDawnPriorities` calls = 0 on the base leg
  (function absent — control read) and > 0 on the subject leg
  (expect one per weighted pick, ~569).
- V4 0 instrument errors on every seed.
- V5 determinism: r2 totals match judged totals exactly on
  190457 + 190464 per leg (see §Determinism check).

## Secondary (reported, not judged)

Per leg: per-seed days, survived/8, wall numbers
(national/table/wins, wave-5, median survival, death-cause
shares), opens + weighted-pick counts, per-pick mean draws
(base vs subj — are they equal?), bucket shares, first draw-
divergence day per seed, deathDiv reproduction table, setup
draws per seed (should be identical across legs — same seed,
same world gen; a mismatch is a finding).

## Sense-testing

This probe touches dialogue only through the pick (which want
opens the conversation). If the per-pick records surface any
sitting whose opener reads wrong for its want, read that
transcript and judge it (meaning, coherence, relevance) in the
evidence; the probe's verdict does not rest on it. No new
sense-testing is owed beyond what the records surface.

## Metric review (section in the evidence file)

Pre-registered here so the evidence carries it: if any bar
misses, write under "metric review" whether the bar or the
instrument was wrong (e.g. the +40 total bar too weak given the
≥9-draws-per-pick scale; the ≥7/8 sign bar too strict for a
chaotic system where one seed's trajectory dominates; the
context-stack attribution too coarse if the delta lands in
`other`), and propose the revision for the NEXT run. Do not
re-score this run.

## Fix policy

Bisect prereg §Fix policy binds this arm: no game-code change
lands from this measurement arm. This arm builds instrument
scripts + evidence only. ZERO src/js changes. No revert, no keep
decision — that call follows with the carrier question resolved
(coordinator/Steve).

## Balanced panel (§15) — N/A

Diagnostic probe, no code change, no before/after pair to
compare on one base. The before/after comparison IS the
base/subject pair on identical seeds, judged by the analyzer's
decision rule. Same standing as the mech arm.

## Freshness / band note

Deliberate reuse of band 190457–190464 (band 3) for both legs
and the r2 re-runs. This is NOT a freshness violation: the
transplant protocol reuses the band where the effect was proven,
so the mechanism is measured on the same trajectories. The band
is named in the band-3 prereg/evidence and the 0215Z round
record; no new band is consumed. The sibling freshband arm runs
a different fresh band; Loop B runs winnability-chain seeds.

## Ordering note

Subject verification and the code-read above ran as part of
prereg preparation, before this file was committed (same
precedent as the band-3 prereg). The binding requirement is met:
this prereg is committed BEFORE any judged sim runs. No STEP
t-ove48-drawparity-base / -subj corpus, summary, or driver log
exists at commit time. The stage-1 proof
(scripts/test-ove48-drawparity.js --stage1) is committed WITH
this prereg.
