# sim-diphold — dip-HOLDING discipline layer (flesh-out loop A, 2026-10-19, ARM sim-diphold)

Run: fleshout-20261019T2115Z, arm sim-diphold. Axis: scale-onramp (the blocking axis).
Backlog charter: the sim-seasonblock DIAG's named next #1 (evidence/2026-10-19/sim-seasonblock.md).
POLICY-SIDE ARM — zero src/js changes. Layer deleted per kill protocol; instruments + evidence kept.

Canon: docs/CANON.md (read first), docs/SCALE.md (the BELONG road, the
good-standing bar: trust >= 50, arrears 0, age >= 14; the valued-subordinate
bar). No canon doc covers the bond/standing/tribute internals beyond SCALE.md —
the tribute/arrears/grief-leverage mechanics below are read from the engine
(src/js/hierarchy.js), not invented; the seasonblock evidence already
documented that no canon doc covers the deferral table itself.

steve-call #668 (grief-leverage ratchet once-per-primary) was NOT implemented
— that is Steve's call. This arm stayed policy-side per its charter.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY:** dip-days-held per seasoned belong bond = the count of dip=1 days
from the bond's first seasoned day (age >= 30 && trust >= 40 — the probe's
`seasoned` flag) until the first dip-0 day for that bond (a broken/vanished
bond counts as dip-0 from the break day), capped at run end. (Task phrasing
"days the seasoned grant survives after first dip-0" is incoherent as written
— a grant cannot survive its own first zero; operationalized as above and
documented here before the sweep.)
**GO:** armed mean >= 1.3x control mean over seasoned belong bonds.

**Guardrails:** national >= control-1; wave-4 unlocks within +/-2 of control;
starvation deaths <= control+1; no new death channel; median survival not
worse by >10d.

**Horizon:** 180d death-aware (dead villages stop simulating).
**Seeds:** 64201–64208 x belongfeast (control) vs belongfeast-dh (armed) —
8 paired runs per side, identical seeds.
**Substrate:** the seasonblock harness + per-seed corpus as control —
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 (SEATDRIVE='0' → seatdrive pure
delegation; REPOSITION unset → inert; VETREL unset → vetrel OFF), plus
DIPHOLD=1 on the armed side. Control fidelity vs the seasonblock corpus
verified by gate (below) — the corpus is reused, not re-run blind.

**Instrument:** scripts/probe-diphold-20261019.js (seasonblock instruments
reused verbatim: bond census, beat capture, death capture, flow recording;
DET/SMOKE/FIDELITY gates; per-seed JSON gains the death list + diphold ctx
counters). scripts/test-diphold.js (proof: 13/13 GREEN — trigger math,
arrears-clearing priority, tribute-first ordering, tribfloor interplay, DET).
scripts/analyze-diphold-20261019.js (primary + guardrails + mechanism).
scripts/build-diphold-panels.js (§15 panel compare; panel = instrument,
pre-registered threshold = judge).

**The lever** (scripts/policies/diphold.js — DELETED on kill): when a belong
bond's DIP-MARGIN <= 2 days, make arrears-clearing the payment priority.
Dip-margin (operational): days until the good-standing bar is expected to
break at the nearest ACTIONABLE leg — arrears > 0 → 0d (bar broken now);
this week's tribute unpaid with the weekly linkTick settlement <= 2d away →
<=2d (arrears post at the boundary). A trust leg (trust < 58, one -8
succession haircut from the 50 bar) was considered and CUT: the policy has no
trust-raising verb for the belong bond beyond paying — an un-actionable
trigger would be theater. Actions, once per day BEFORE the base daily
(tribute-first ordering): arrears > 0 → Game.payTribute(link.id, owed +
arrears) in one call (real food for the week AND the books — the engine zeroes
arrears when the week's total reaches the week's bill, and this layer does
NOT exploit that: it requests the honest total); unpaid near settlement →
pay the week's owed early. Composed UNDER tribfloor, so the 2-day pantry
floor binds on the layer's own payments. Gate: DIPHOLD=1 (default off = pure
delegation, pinned by proof D0).

**Kill rule:** primary miss at pilot → kill, layer deleted zero-trace,
instruments + evidence landed.

## Results

16/16 runs swept, 0 bad files, 0 instrument errors.
DET: armed 2/2 byte-identical (proof D7). FIDELITY: control PASS —
byte-identical to the seasonblock corpus on s64201 (85d), so the corpus reuse
is valid and the control re-run (8 seeds, my probe) is a second confirmation.

**PRIMARY: NO-GO.** dip-days-held: control 3.25 (n=8 seasoned belong bonds) |
armed 3.25 (n=8) | ratio **1.00** (GO bar 1.3x). The entire primary rests on
one granting bond per side — s64207's Thornfield bond, 26 days on BOTH sides
(seasoned d87, dip d87–d112, first arrears d113, dip 0 from d113 — day-exact
identical control vs armed). The other 7 seasoned bonds per side granted 0
dip-days (seasoned but never regionalPlus: their primaries' realms never
reached 4 fires).

**Guardrails:** national 4v4 ok; wave-4 unlocks 5v5 ok; starvation deaths 3v4
ok; no new death channel ok; **median survival 95.5d vs 116d — MISS** (-20.5d,
worse than the 10d allowance). Paired survival diffs (armed−control):
s64201 −14, s64202 0, s64203 −4, s64204 −77, s64205 +51, s64206 0, s64207 −27,
s64208 −50.

**Mechanism (the layer fired, the dip didn't move):** dh.arrearsClears=117,
dh.earlyPays=30, tfCapped=130 across the 8 armed runs; tribute paid +21%
(560,074 vs 462,191 kcal). On s64207 the layer cleared arrears 11 times —
but the post-d113 payments were **0-kcal floor-capped no-ops** (flows d113+:
tribute 0 kcal ×11 days; the pantry sat at/below the 2-day floor, capKcal=0).
The dip died at the FIRST arrears posting on both sides, and arrears-clearing
is inherently post-hoc: it can only act after the bar (arrears==0) breaks.

**§15 panel** (evidence/2026-10-19/diphold-panel-primary.md, .json, .json.gz —
attached): decision **review_required**, no material signal on any contract
metric (national 0.5→0.5, table invitation 0.875→0.875, survival30/60 flat).
The panel is the instrument; the pre-registered 1.3x threshold is the judge.

**Verdict: KILLED-AT-PILOT.** Primary 1.00x vs 1.3x bar, plus a median-survival
guardrail MISS. Layer deleted zero-trace per kill protocol (this commit keeps
instruments + evidence only).

## Village assessment

What the villages looked like: 8 belong-road villages on the pre-seat
win-side stack, the layer paying tribute first and clearing arrears daily
wherever they appeared — 117 clears, 30 early payments, 130 floor-capped
attempts. The villages paid 21% more tribute than control and died earlier on
the ratcheted seeds (s64204: 94d vs 171d; s64208: 113d vs 163d; s64207: 123d
vs 150d). The extra food bought trust that the succession economy took back
anyway: on s64207 the bond's trust ran 100 → 82 → 54 across d113–d120 while
the layer kept paying 0-kcal capped nothings into a broke pantry.

Who thrived and who died and why: nobody's dip held longer. The single
granting bond (s64207 Thornfield) lived the exact same 26-day dip on both
sides — seasoned d87, +34 for 26 days, first arrears d113, dip 0 from d113,
then the trust collapse the seasonblock DIAG measured. The other 7 bonds per
side seasoned into realms that never reached 4 fires (the consolidation
problem, not the holding problem). The layer's payments could not conjure the
missing food: once the grief-leverage ratchet pushed the weekly bill past
what the pantry could carry (11,250/wk on s64207), the dip's death was
scheduled at the next settlement boundary.

What was missing: not payment discipline — the layer paid first, paid early,
and cleared arrears 117 times. What was missing was food, and a bar that
survives first contact with arrears. The good-standing bar demands
arrears==0 every week; the dip dies at the first posting; no reactive policy
can prevent a first posting it cannot afford. The holding problem, measured
clean: **payment priority is the wrong layer — the bar's arrears leg is the
load-bearing one.**

## Sense-testing (SENSE-TESTING LAW)

Read: the armed s64207 tribute flows + bond census d100–d123 (the dip death),
joined to the dh counters.

The layer's decisions read sensibly: d110–d111 it paid partials (3,755 +
2,400 kcal of the 11,250 bill — the tribfloor floor capping each request, the
engine's "Tribute short… Arrears grow teeth" honesty intact); at d113, with
5,095 arrears posted and the dip dead, it switched to arrears-clearing mode
and kept trying daily — 11 clears, every one 0-kcal floor-capped because the
pantry sat at the floor. The "books come first" line fired once per day as
designed (not captured by this instrument's beat filter, which only keeps
bond-is-young / speaker-install / grief-card-spent / oath-summons — noted as
an instrument gap for the next holding arm). The succession beats on the
armed run read as designed (d91 "Tribute rises to 11,250… Grief is leverage",
d99/d120 the spent grief-card idiom, fiction-honest).

No robotic/static behavior in the tribute decisions. The 0-kcal payment loop
is not a bug — it is the tribfloor floor doing its job (the village eats
first) while the diphold layer does its (the books come first): two honest
rules in tension, and the tension is the finding.

## Metric review (§14 — honest doubts for the NEXT run, not this one)

1. **The primary's power is one bond.** 8 seasoned bonds per side, but only
   s64207's granted the dip (26d); the other 7 granted 0 (never regionalPlus).
   The 1.00x ratio is exact, not noisy — but a future holding arm should
   pre-register on seeds where the dip GRANTS (or run more seeds), because a
   lever that extends a granted dip is invisible in a corpus of ungranted ones.
2. **The median-survival MISS needs a mechanism read before it becomes lore.**
   Paired diffs (−14, 0, −4, −77, +51, 0, −27, −50): the −77 (s64204) and −50
   (s64208) dominate. Plausible cause: +21% tribute spend into ratcheted bills
   while living at the 2-day floor leaves no buffer for shocks (raids killed
   armed s64204's scholars). It is binding as pre-registered; the cause is
   hypothesis, not proof — a re-run would be needed to promote it.
3. **Dip-margin's two legs were the right cut.** The dropped trust leg would
   have fired often (trust < 58 across succession churn) with no action to
   take — measuring "triggered but did nothing" would have been theater.
4. **Reactive clearing can't hold a bar that dies at first arrears.** This is
   the arm's durable finding, and it reframes the charter's second candidate
   lever ("make arrears-clearing the good-standing bar"): that is a GAME-CODE
   change to hierarchy.js's bar (trust >= 50 && arrears==0 && age >= 14), and
   it is the honest next arm — pre-registered, coordinator-approved, not
   implemented here.

## Named nexts

1. **sim-diphold-bar (game-code arm, NEEDS pre-registration + coordinator
   approval — not implemented here):** change the good-standing bar's arrears
   leg from arrears-absence to arrears-clearing (e.g. arrears cleared within N
   days of posting, or arrears <= 1 week's bill while the current week is
   paid). Touches hierarchy.js tribute/good-standing only (grep-confined);
   steve-call #668 (ratchet once-per-primary) stays Steve's. Pre-register:
   dip-days-held >= 1.3x control on granting seeds.
2. **steve-call #668** (unchanged, still Steve's): is the succession
   grief-leverage x1.5 ratchet the intended price of succession on the belong
   road, or once-per-primary? This arm measured what the ratchet costs when
   it can't be paid: the dip, on schedule.
3. Instrument note: the next holding arm should widen the beat filter to the
   tribute/arrears say-lines ("books come first", "Tribute paid/short") so
   the payment-priority decisions are transcript-readable.

## Out-of-arm findings

(none chased; appended to hidden_files/sim-findings.md)
- The game-code bar variant above is recorded as a candidate next arm (open,
  needs pre-registration), not a finding.

## Convergence

**killed-at-pilot** (the arm), axis **converging**. The dip-HOLDING surface
via payment discipline is now measured closed: 117 arrears-clears bought zero
dip-days, and the mechanism is understood (first-arrears kills the dip;
reactive clearing is post-hoc; the pantry can't carry the ratcheted bill).
The remaining holding levers are game-code (the bar's arrears leg) or Steve's
call (the ratchet). Wall on this arm's corpora (16 runs, belong road):
national 8/16, table 14/16 (invitation), wins 0/16, wave-4 10/16, wave-5
0/16, median survival ~106d. The scale wall stands: wins 0, wave-5 0.

## Files

- scripts/probe-diphold-20261019.js — sweep probe (seasonblock instruments reused; DET/SMOKE/FIDELITY gates; control+armed compositions)
- scripts/analyze-diphold-20261019.js — primary + guardrails + mechanism counters
- scripts/build-diphold-panels.js — §15 panel builder
- scripts/test-diphold.js — proof (13/13 GREEN before the layer's deletion; archival after)
- evidence/2026-10-19/perseed-diphold/{belongfeast,belongfeast-dh}/s64201–s64208.json — 16 per-seed sweep JSONs
- evidence/2026-10-19/diphold-corpus-summary.json — analyzer output
- evidence/2026-10-19/diphold-panel-primary.{md,json,json.gz} — §15 panel compare (attached)
- evidence/2026-10-19/sim-diphold.md — this file
- scripts/policies/diphold.js — DELETED per kill protocol (zero trace)
