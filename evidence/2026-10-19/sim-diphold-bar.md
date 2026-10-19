# sim-diphold-bar — arrears-CLEARING as the good-standing bar (flesh-out loop A, 2026-10-19, ARM sim-diphold-bar)

Run: fleshout-20261019T1726Z (coordinator run_id; worker arm sim-diphold-bar). Axis: scale-onramp (the blocking axis).
Backlog charter: the sim-diphold KILL's named next #1 (evidence/2026-10-19/sim-diphold.md).
GAME-CODE ARM — the lever the killed policy arm reframed to: the holding problem is the bar's arrears leg, not payment discipline.

Canon: docs/CANON.md (read first), docs/SCALE.md (the BELONG road, the
good-standing bar: trust >= 50, arrears 0, age >= 14 — the valued-subordinate
bar; ending eligibility is 70/0/21 — "national is the doorway, the ending is
the room"). No canon doc covers the tribute/arrears internals beyond SCALE.md
— the posting sites and the bar are read from the engine (src/js/hierarchy.js),
not invented.

steve-call #668 (grief-leverage ratchet once-per-primary) was NOT touched —
that is Steve's call. This arm changes only the bar's arrears leg.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** dip-days-held per seasoned belong bond = the count of dip=1 days
from the bond's first seasoned day (age >= 30 && trust >= 40 — the probe's
`seasoned` flag) until the first dip-0 day for that bond (a broken/vanished
bond counts as dip-0 from the break day), capped at run end. (Operationalized
exactly as sim-diphold did.)
**GO:** armed mean >= 1.3x control mean over seasoned belong bonds.

**Guardrails:** national >= control-1; wave-4 unlocks within +/-2 of control;
starvation deaths <= control+1; no new death channel; median survival >=
control-10d.

**Horizon:** 180d death-aware (dead villages stop simulating).
**Seeds:** 64201–64208 x belongfeast — 8 runs, armed side only; the control is
the COMMITTED seasonblock corpus (evidence/2026-10-19/perseed-seasonblock/belongfeast/),
fidelity-gated (byte-identical hashes on s64201 with the unmodified engine,
run BEFORE the hierarchy.js change). The divergence surface is ENGINE CODE
ONLY (hierarchy.js) — the policy composition is identical both sides, so no
control re-run is needed once fidelity passes.
**Substrate:** the seasonblock harness verbatim —
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1.

**Instrument:** scripts/probe-dipholdbar-20261019.js (seasonblock instruments
reused verbatim: bond census, beat capture, death capture, flow recording;
DET/SMOKE/FIDELITY gates; the diphold policy layer is gone — the `dip` flag
flows from Game._linkRegionalPlus → polityOf → the modified bar).
scripts/test-dipholdbar.js (proof: bar RED/GREEN, episode-clock unit tests,
grace say-line). scripts/analyze-dipholdbar-20261019.js (primary + guardrails
+ grace-held-days mechanism). scripts/build-dipholdbar-panels.js (§15 panel
compare; panel = instrument, pre-registered threshold = judge).

**Kill rule:** primary miss at pilot → kill: restore src/js/hierarchy.js from
HEAD (`git checkout HEAD -- src/js/hierarchy.js`), keep instruments + evidence,
land the kill commit with the verdict.

**Known weakness (disclosed, not re-scored):** sim-diphold's metric review #1 —
the primary rests on ONE granting bond per side (s64207's, 26d). The other 7
seasoned bonds per side grant 0 dip-days (their primaries' realms never reach
4 fires — the consolidation problem, untouched by this arm). The 1.3x bar is
binding anyway.

## The lever (src/js/hierarchy.js — DIPHOLD-BAR)

The killed policy arm proved the mechanism: the dip dies at the FIRST arrears
posting (`(l.arrears || 0) === 0` in polityOf's good-standing bar), and
reactive arrears-clearing is post-hoc — it can only act after the bar breaks.
So the bar itself changes: arrears-CLEARING, not arrears-absence.

**Numbered design calls (Steve can overrule):**
1. **Grace = 7 days** — one weekly settlement cycle. A fresh arrears posting
   opens a 7-day grace ("the court gives a week to make the books right");
   clear the books within it and standing never breaks.
2. **Episode clock** (`link.arrearsPostedDay`): stamped only on 0→>0
   transitions. Later postings in the same episode do NOT reset the clock —
   chronic non-payment's grace runs from the FIRST posting, not the latest.
   Clearing to zero ends the episode; the next posting starts fresh.
3. **Teeth kept:** the trust (>=50) and age (>=14) legs are unchanged, and
   `kingdomEndingEligible` (70/0/21) is untouched — grace holds the doorway,
   not the room. Arrears carried past day 7 break the bar exactly as before.
4. **Said aloud:** once per episode, on a dip-granting bond only — "The court
   notes the shortfall — seven days to make the books right. The oath holds
   while the books are being made right." (The existing shortfall lines
   already narrate the debt everywhere else.)
5. **Re-link inheritance carries the clock:** inherited arrears copy the
   broken link's `arrearsPostedDay` (or stamp today if unknown) — no
   clean-slate grace laundering; the debt still survives the break.
6. **Instrumented posting sites:** `linkTick` (weekly settlement) and
   `answerDemand` (tribute demand shortfall) — the two Haven-as-subordinate
   sites. Haven-as-primary sites (conquered sabotage, subordinate shortfalls)
   are untouched: the bar never reads those links.

Predicted mechanism on the granting seed (s64207): arrears post d113 → grace
holds the dip d113–d119 → bar breaks d120 (arrears age 7). Dip 26d → 33d;
armed mean 33/8 = 4.125 vs control 3.25 → **1.27x — predicted just UNDER the
1.3x bar.** The pantry was broke, not temporarily broke; no arrears-tolerant
bar can hold a dip the village cannot pay for. If the measurement lands here,
the honest verdict is NO-GO and the kill protocol runs — the durable finding
being that the holding problem is the ratcheted bill vs the pantry
(steve-call #668), not the bar's instant-death.

## Results

8/8 armed runs swept, 0 bad files, 0 instrument errors.
DET: armed self-consistency 2/2 byte-identical (post-change). FIDELITY:
control PASS — byte-identical to the seasonblock corpus on s64201 (85d),
run BEFORE the hierarchy.js change, so the corpus reuse is valid.
`node scripts/check.js --quick`: 96 passed, 0 failed (402s) on the modified
engine. `scripts/test-scale-pacing.js`: ALL GREEN on the modified engine.

**PRIMARY: NO-GO.** dip-days-held: control 3.25 (n=8 seasoned belong bonds) |
armed 4.00 (n=8) | ratio **1.231** (GO bar 1.3x). The entire primary still
rests on one granting bond per side — s64207's Thornfield bond: control 26d
(seasoned d87, dip d87–d112, first arrears d113, dip 0 from d113) vs armed 32d
(seasoned d87, dip d87–d118, first arrears d113, dip 0 from d119). The other 7
seasoned bonds per side granted 0 dip-days (their primaries' realms never
reached 4 fires — the consolidation problem, untouched by this arm).

**Guardrails (all PASS):** national 4v4 ok; wave-4 unlocks 5v5 ok; starvation
deaths 4v4 ok (death-control corpus — see instrument note below); no new death
channel ok (channels identical: disease, expedition, haven, other, raid,
wild); median survival 106d vs 116d ok (within the 10d allowance).

**Mechanism (the bar fired exactly as designed):** graceHeldDays control=0 |
armed=6 — the six d113–d118 dip-days on s64207 where arrears were 11,250 and
the dip still held. Arrears posted at the d112 boundary (stamped day 112);
grace covered d112–d118; the bar broke d119 (arrears age 7), one day before
the trust leg would have mattered (trust 74 at d119). Tribute paid is flat
(462,951 vs 462,191 kcal) — the bar changes nothing about payments, only
about what the bar tolerates. No behavior change on any other seed: their
bonds never granted the dip, so the grace had nothing to sustain.

**§15 panel** (evidence/2026-10-19/dipholdbar-panel-primary.md, .json,
.json.gz — attached): decision **review_required**, no material signal on any
contract metric. The panel is the instrument; the pre-registered 1.3x
threshold is the judge.

**Instrument note (disclosed, corrected mid-run):** the seasonblock corpus has
no per-seed death lists (its probe predates the death-list instrument), so the
first analyzer pass read control starvation=0/channels=[] and falsely flagged
a starvation MISS + new death channel. Both are instrument artifacts. The
death guardrails and the panel's before-side were re-pointed at the diphold
arm's control corpus (perseed-diphold/belongfeast) — same unmodified engine,
same substrate, same seeds, WITH death lists, fidelity-pinned byte-identical
to the seasonblock corpus. Provenance recorded in the analyzer header and in
dipholdbar-corpus-summary.json's `controlProvenance`. This is a measurement
correction, not a re-score: the guardrail definitions are unchanged.

**Verdict: KILLED-AT-PILOT.** Primary 1.231x vs 1.3x bar. Per the kill rule,
src/js/hierarchy.js is restored from HEAD zero-trace; this commit keeps
instruments + evidence only.

## Wall numbers (this arm's corpora, 8 seeds x belongfeast)

| | national | table | wins | w1 | w2 | w3 | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|---|---|---|
| control (seasonblock corpus) | 4/8 | 7/8 | 0/8 | 8 | 7 | 7 | 5 | 0 | 116d | 171d |
| armed (diphold-bar engine) | 4/8 | 7/8 | 0/8 | 8 | 7 | 7 | 5 | 0 | 106d | 171d |

The scale wall stands: wins 0/16, wave-5 0/16 on this substrate.

## Village assessment

What the villages looked like: 8 belong-road villages on the pre-seat
win-side stack, the engine now granting a week's grace on the books. The only
village whose story changed is s64207's: its Thornfield bond held the +34 dip
six days longer (d113–d118) while carrying 11,250 kcal of arrears, then lost
it on schedule at d119. The village lived 9 days longer (159d vs 150d) and
died the same way (village-lost). Every other village is day-exact identical
to control — the grace only matters where the dip is granted, and only one
bond per 8 seeds grants it.

Who thrived and who died and why: nobody's dip held meaningfully longer. The
grace bought exactly the grace window on the single granting bond — 6 extra
dip-days, then the same arrears the bar used to punish on day 1. The other 7
bonds per side seasoned into realms that never reached 4 fires; no
arrears-tolerant bar can conjure the missing consolidation.

What was missing: not payment discipline (sim-diphold proved that), not bar
tolerance (this arm proved that) — but food to pay the ratcheted bill, and a
realm that consolidates. The succession economy (grief leverage ×1.5 per
qualifying succession: 5,000 → 7,500 → 11,250/wk) outran the pantry on the
one seed where the dip granted; the bar — tolerant or not — only decides how
many days of grace the village gets before the arithmetic wins. That is
steve-call #668's territory, and it stays Steve's.

## Sense-testing (SENSE-TESTING LAW)

Read: the armed s64207 say-lines d106–d116 around the arrears posting
(scripts/sense-dipholdbar-20261019.js — 10,533 say-lines captured, 3 in the
window), joined to the bond census.

- d106: "You send 5,701 kcal. It hurts. That's rather the point of tribute."
  — the village paying what it can (a partial of the 11,250 bill), the
  existing fiction-honest partial-payment line.
- d112: "📖 Thornfield's court notes the shortfall — seven days to make the
  books right. The oath holds while the books are being made right." — the
  new grace line, firing exactly ONCE, on the dip-granting bond, at the
  arrears episode. It names the shortfall, grants the time, states the terms.
  In-voice, legible, not repeated.
- d115: "With Haven grieving again, Thornfield installs their own speaker at
  the table — and reaches for the grief card once more. The table has heard
  it before: the grief card is spent. Tribute stays at 11,250." — the
  succession beat firing honestly alongside the grace; the ratchet was
  already spent, no double-charge.

The grace line reads sensically as fiction: a court that notices, grants a
week, and means it. No robotic/static behavior. One instrument note carried
forward: the sweep's beat filter (inherited from seasonblock) does not
capture the grace line — the next holding arm should widen it (as sim-diphold
already noted for the tribute say-lines).

## Metric review (§14 — honest doubts for the NEXT run, not this one)

1. **The primary's power is one bond** (inherited from sim-diphold's review
   #1, confirmed again): 8 seasoned bonds per side, one granting bond. The
   1.231x ratio is exact, not noisy — the grace bought 6 days on s64207 and
   0 everywhere else. A future holding arm should pre-register on seeds where
   the dip GRANTS, or run more seeds; a lever that extends a granted dip is
   invisible in a corpus of ungranted ones.
2. **The grace window's observed length is 6 dip-days, not 7**, because the
   arrears post at the week's boundary after the census is taken (stamped
   d112, observed d113). The design's 7-day grace is intact; the observation
   window is a boundary artifact. Noted for whoever sizes the next variant.
3. **The death-list instrument gap** (seasonblock corpus has none) is now
   documented in two places (analyzer + panel builder). Any future arm
   reusing the seasonblock corpus for death-derived guardrails must use the
   diphold control corpus instead — or re-run the control with death lists.
4. **The bar change is behaviorally inert except on granted dips.** 7 of 8
   seeds are day-exact identical to control. This is a feature (minimal
   blast radius), not a bug — but it means the lever's ceiling on this seed
   set was always ~+7 dip-days on one bond, i.e. ~1.27x. The 1.3x bar was
   arguably unreachable by construction on this corpus; the next arm should
   size its GO bar against granting seeds.

## Named nexts

1. **steve-call #668** (unchanged, still Steve's): the succession
   grief-leverage ×1.5 ratchet on the belong road. Two arms have now measured
   what the ratchet costs when it can't be paid: sim-diphold (payment
   priority buys 0 dip-days) and sim-diphold-bar (bar tolerance buys 6
   dip-days, then the arithmetic wins). The holding problem is the ratcheted
   bill vs the pantry, not the bar's instant-death.
2. **Granting-seed corpus**: a future holding arm should pre-register its
   primary on seeds where the dip grants (s64207-like), per metric review #1.
3. Instrument: widen the sweep beat filter to the tribute/arrears say-lines
   (sim-diphold's note, repeated here for the grace line).

## Out-of-arm findings

(Appended to `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`; not chased.)
- (none new — the instrument gap in metric review #3 is recorded in the
  analyzer/panel headers)

## Convergence

**killed-at-pilot** (the arm), axis **converging**. The dip-HOLDING surface
is now measured closed from both sides: payment discipline (sim-diphold:
1.00x) and bar tolerance (this arm: 1.231x, mechanism verified day-exact).
The remaining holding lever is Steve's call (the ratchet). The axis stays
converging: wins 0/16, wave-5 0/16 on this substrate; national 8/16, table
14/16.

## Files

- src/js/hierarchy.js — RESTORED from HEAD per kill protocol (zero trace of
  the DIPHOLD-BAR change; the design is documented here, not in the tree)
- scripts/probe-dipholdbar-20261019.js — sweep probe (seasonblock instruments
  verbatim; single composition; DET/SMOKE/FIDELITY gates)
- scripts/analyze-dipholdbar-20261019.js — primary + guardrails (death
  guardrails read the diphold control corpus; provenance documented) +
  grace-held-days mechanism
- scripts/build-dipholdbar-panels.js — §15 panel builder (before-side
  provenance documented)
- scripts/test-dipholdbar.js — proof: bar RED/GREEN (14/14 GREEN on the
  change, T2+T3 RED without it), episode clock, grace say-line
- scripts/sense-dipholdbar-20261019.js — sense-test replay (say-tap to d116
  on s64207)
- evidence/2026-10-19/perseed-dipholdbar/belongfeast/s64201–s64208.json — 8
  armed per-seed JSONs
- evidence/2026-10-19/dipholdbar-corpus-summary.json — analyzer output
  (carries controlProvenance)
- evidence/2026-10-19/dipholdbar-panel-primary.{md,json,json.gz} — §15 panel
  compare (attached; decision review_required, no material signal)
- evidence/2026-10-19/sim-diphold-bar.md — this file
