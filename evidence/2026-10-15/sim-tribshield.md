# sim-tribshield — the tribute-shield policy layer (2026-10-15)

Worktree: `~/workspace/worktrees/sim-tribshield`. Run: oversight-flesh-out-loop (loop A),
ARM 3 of 3, run fleshout-a-20261015T0615Z, scale-onramp axis (standing scale directive).
Assignment: r4's holdloss census named the wall's hold face as POLITICAL ATTRITION —
rival raids + "tribute-on-empty-chair" on young nationals. The landed succpolity arm
(ee5d1803, src/js/hierarchy.js, SUCCPOLITY=1) fixed polity-persistence game-side; this
arm closes the tribute half from the POLICY side (zero src/js).

Canon read first: docs/CANON.md (no tribute/polity canon doc exists — stated per the
canon rule, not invented). Tributary mechanics from src/js/hierarchy.js as-is. Design
anchor: Steve's young-bond ruling (2026-10-14) — the bearer inherits the obligations;
relief must be ASKED FOR via renegotiation, never automatic.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

- **Question**: does a policy-side tribute discipline — answering staged renegotiation
  beats (the asked-for relief path) and triaging weak bonds first on tends, inside the
  succession window / young national — reduce tribute-snap national losses?
- **Lever**: TRIBSHIELD=1, `scripts/policies/tribshield.js` (new layer file, wraps
  leadfeast/belongfeast, default OFF, zero src/js). Shield window: young national
  (first 60 hold-days, ctx-tracked from scaleRank()) OR succession grief live on any
  active link (pendingRenegotiation / mourningUntil / 'succession' link-history note
  ≤14d — the succpolity 14d proving window and beyond). Verbs, before the parent's
  daily:
  - V1: answer every staged renegotiation beat — 'gift' when the pantry carries
    1,500 kcal above the 1-day floor (mouths×2000), else 'visit'; never 'wait'
    (silence = −6 trust + the deferred ×1.5 tribute leverage landing).
  - V2: weakest-first tend triage on Haven-primary links with trust<45 at the
    base's own 20k gate (the base tends in link order; the shield rebuilds the
    haircut links first inside the proving window).
- **Design rationale** (Steve can overrule): the base courtship policies
  (leadcourt/belongseek/scalecourt) NEVER answer renegotiation beats — unanswered,
  a young belong-link's beat costs −6 trust AND lands the deferred ×1.5 tribute
  leverage ("Grief became leverage"), the exact tribute-on-empty-chair mechanism.
  Answering the beat is Steve's young-bond ruling made policy: the bearer asks for
  relief via renegotiation instead of taking automatic relief or silent punishment.
  A tribute-PAYMENT verb was designed, measured against the base, and REMOVED:
  scalecourt already pays ALL active Haven-subordinate links weekly at pantry > 15k
  (proof R3 pins the redundancy) — a shield payment gate is dead code. Named next:
  the base's floor-less 15k gate can empty the pantry on a partial leveraged
  payment; a floor belongs on the BASE gate, not in a shield.
- **Why this scope**: the shield is a window, not a tax — outside succession grief
  or a young national the base policies' tribute discipline stands on its own.
- **PRIMARY (§14, absolute counts)**: tribute-snap losses on young nationals —
  nationalLoss (holdloss-lib-20261015.js) lossMode === 'tribute-collapse' AND
  (lossDay − firstDay) ≤ 60 — armed ≤ 0.7× control, identical seeds, own control
  in the same sweep.
- **GUARDRAILS**: national reaches armed ≥ control−2/16; median survival armed ≥
  control−10d; no new national-loss mode at n≥3; table/wins report-only.
- **SECONDARIES (mechanism-firing)**: shield verb counts per run
  (tsReneg_gift/tsReneg_visit/tsTends); beats answered; arrears on young-national
  links.
- **Substrate**: 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast} ×
  {control: unlayered, armed: TRIBSHIELD=1}, 180d death-aware, FEASTSCALE_R13=1
  asserted up front (the courtship-road substrate, per r4).
- **Wall numbers every run**: national / table / wins, wave 4–5 unlocks, median
  survival.

## Gates (all green before spend)

- Proof `scripts/test-tribshield-20261015.js`: **9/9 GREEN** —
  D0 gate-off delegation byte-identical to base (interleaved create-run pattern);
  REAL RED R1 (base leaves the staged beat pending) and R2 (base tends in link
  order, haircut link untended); R3 documents the removed payment verb's
  redundancy (base clears multi-link arrears on its own); G1 beat answered with
  gift, ×1.5 leverage never lands, trust +8; G2 weakest-first triage flips the
  last tend slot; G3 layer inert outside the window; G4 thin pantry → visit,
  never silence; G5 lead-road young-link gift credits the subordinate's pantry
  (the griefgrain aid-credit path).
- SMOKE=1: **GREEN** — 4/4 (2 policies × 2 arms, 15d, samples collect, no crash).
- DETGATE=1: **GREEN** — D1 gate-off determinism (11/leadfeast/60d ×2
  byte-identical); D2 armed determinism (×2 byte-identical); D3 mechanism
  isolation (11/belongfeast/60d: shield counters all zero → armed trajectory
  byte-identical to control — the layer touches nothing outside its window).
- Harness quirk filed (proof header): back-to-back loadGame() calls diverge by
  one trust point on the next policy run even though the games snapshot
  identical — fixture writers must use the interleaved create-run pattern
  (the sweep's oneRun shape).

## Results

32 runs (8 seeds × {leadfeast, belongfeast} × {control, TRIBSHIELD=1}, 180d
death-aware, FEASTSCALE_R13=1). Full rows: `evidence/2026-10-15/sim-tribshield-runs.json`;
sweep log: `evidence/2026-10-15/sim-tribshield-sweep.log`; per-seed telemetry:
`evidence/2026-10-15/telemetry-tribshield/` (32 records, {run, seed, policy, arm,
national, table, wins, exiled, holdDays, lossMode, youngTributeSnap, maxWave,
survivalDays, shieldGift, shieldVisit, shieldTends}).

**PRIMARY: GO on the letter — young-tribute-snap 0 ≤ 0.7×0 (vacuous).**
tribute-collapse fired on NEITHER side (0/16 vs 0/16). The mechanism the primary
targets did not occur in this 32-run suite — see metric review.

| arm (n=16) | youngSnap | tribColl(any) | national | table | wins | w4 | w5 | medSurv | loss modes |
|---|---|---|---|---|---|---|---|---|---|
| control | 0 | 0 | 5/16 | 8/16 | 0/16 | 8/16 | 6/16 | 128.5d | succession-chain 2, held-to-end 2, other-named 1 |
| armed | 0 | 0 | 8/16 | 9/16 | 0/16 | 9/16 | 6/16 | 130.5d | succession-chain 2, held-to-end 1, other-named 4, wave-unlock 1 |

GUARDRAILS: national 8 ≥ 5−2 ✓; median 130.5d ≥ 128.5−10 ✓; no new loss mode
at n≥3 (wave-unlock appears at n=1 only) ✓; table/wins report-only.

**Mechanism-firing (secondaries)**: the shield fired **62 verbs** on the armed
side (gifts/visits/tends, from ctx counters) vs 0 on control — the layer is not
inert. Per-seed: belong road national 0/8 → 4/8 (s22 35d, s33 83d, s44 38d,
s77 49d holds; shield verbs 3/2/3/5 on those seeds); lead road national 5/8 →
4/8. Per-seed regressions on lead: s66 (control held-to-end 180d → armed
other-named, village-lost d90) and s77 (control national 16d → armed no
national, d55); s33 control held-to-end → armed succession-chain (both 180d).
The s66 autopsy: 7 shield gifts + 2 tends = 13.5k kcal total outflow — against a
90-day/120k-kcal trajectory divergence this is perturbation-scale, not
harm-scale (the kcal cannot account for the divergence; the deaths were a
sickness/combat/starvation tie). Median and national-count guardrails are the
perturbation-robust metrics; both pass.

## Village assessment (plain words)

Two roads, two stories. On the belong road, four villages that never reached
national on control (s22, s33, s44, s77 — three of them died before day 65)
reached it on armed and held 35–83 days, surviving 112–180 days. The shield's
beat-answers (+8 trust, leverage never landing) land exactly on the belong
formation bar (trust ≥ 50, arrears 0). On the lead road the picture is mixed:
s44's succession-chain became a held-to-end (the succpolity story repeating one
run later), but s66 and s77 show the chaotic cost — villages that held or
reached on control diverged to early deaths on armed. The through-line from the
s77-armed transcript (below): the shield answers every young beat faithfully,
then the OLD-link ×1.5 death spiral (5,264 → 7,500 → 11,250 → 16,875 → 25,313
→ 37,970 kcal/week across five leader deaths) takes the realm apart anyway —
three dissolutions and three re-swearings in one run. The village keeps paying
("You send 8,801 kcal. It hurts. That's rather the point of tribute.") until
the bill outruns the pantry ("You send 3,468 of 12,657 kcal — all the pantry
holds. They count the gap; the arrears grow teeth.").

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Two transcripts read end to end:
`evidence/2026-10-15/sense-tribshield-belo77-armed.txt` (94 tribute/succession
lines) and `evidence/2026-10-15/sense-tribshield-lead22-control.txt` (244 lines).

1. **Armed (belo77)**: the shield's answers read as people managing obligations —
   "🕊️ Haven sends 1,600 kcal to Thornfield's fire — grief met with grain. The
   new speaker eats with Haven's people and the tribute stays where it was.
   (Trust +8.)" The d68 visit ("a face for the grief, not a ledger") is the
   young-bond ruling made legible. Then the old-link spiral (above) reads as
   genuine political attrition, not numbers — each death's leverage lands with
   "Grief is leverage, and they know it," and the realm's three dissolutions
   are chapters, not bugs. PASS.
2. **Control (lead22)**: the lead road forming ("Stonebridge bows to Haven —
   one organization, us primary"), Haven tending with grain ("Someone's
   grandmother over there will remember who fed her"), then d39's triple
   young-link beats — and d46: "Seven days of silence, and the silence answered
   for Haven. Stonebridge's new speaker reads it plainly. (Trust −6.)" All
   three beats expire unanswered. This is the exact gap the shield fills. PASS.

Robotic note (filed, not chased): the gift beat says "1,500 kcal" while the
engine removes 1,600 (indivisible-piece overshoot — the #313 bank-cap ceil
manifesting in the gift verb). The beggar beat ("Heard your bins are echoing")
repeats verbatim 8× in the armed transcript.

## Blanks filled / documented

- **FILLED (design)**: the tribute-payment verb's redundancy — scalecourt's
  all-links 15k tribute gate means a shield payment verb is dead code (proof R3).
  The policy-side tribute surface is beat-answering + tend triage, not payment.
- **FILLED (mechanism)**: the shield is structurally blind to the OLD-link ×1.5
  leverage — successionCrisis applies it immediately with no beat to answer
  (s77-armed transcript: five compounding ×1.5s, zero answerable). The young-link
  beats (<21d) are the only policy-answerable surface. This is a steve-call
  design question (filed below), not a policy bug.
- **CLAIMED**: sim-findings #149 (6-bond economy / tribute reliability) — this arm
  works the tribute-reliability question via the succession/tribute-beat path;
  the late-subordinate productivity question stays open.
- **NAMED NEXTS**:
  - Old-link answerable beat (steve-call): should succession on links ≥21d also
    stage an answerable renegotiation beat instead of applying the ×1.5
    immediately? The young-bond ruling's asked-for-relief path currently covers
    only the 14–21d window.
  - A survival floor on the BASE tribute gates (scalecourt's 15k, belongseek's
    trib×2) — the floor-less gates can empty the pantry on a partial leveraged
    payment. Belongs in the base policies, not a shield.
  - Re-measure with an intermediate primary (beats answered → leverage landings
    prevented; arrears levels on young-national links) — tribute-collapse is too
    rare for an 8-seed pilot (0/32 here, 1/13 in tworung2).

## Metric review (§14)

1. **The primary was vacuous.** 0 vs 0 is GO on the letter but demonstrates
   nothing — the tribute-collapse mechanism did not fire on either side in 32
   runs (base rate ~1/13 in tworung2). Landing on a vacuous primary is a
   letter-GO; the honest claim is weaker: the layer is proven safe (det-gate,
   proof, guardrails), mechanism-firing (62 verbs), and directionally positive
   (national 8 vs 5, median +2d). The demonstrated effect is beat-answering
   discipline, not tribute-snap reduction. A future run should pre-register the
   intermediate primary (leverage landings prevented per beat answered) or run
   the seed count the base rate demands.
2. **Scope note**: the one measured tribute-collapse on the current substrate
   (tworung2 s77) fired at hold-day 81 — OUTSIDE the brief's 60d young-national
   window. The 60d scope may miss the mechanism's real habitat; the s77-armed
   transcript here shows the spiral playing out over 130+ days. Next run should
   consider the full hold, not just the first 60 days.
3. **Perturbation, not harm**: the s66/s77 lead regressions are trajectory
   perturbation (13.5k kcal of shield outflow vs 90-day/120k-kcal divergences).
   The pre-registered guardrails (median, national counts) are the
   perturbation-robust metrics by design; per-seed autopsies are diagnostic,
   not verdicts. No guardrail was breached.
4. **Harness quirk** (proof header): back-to-back loadGame() calls diverge by
   one trust point — fixture writers must use the interleaved create-run
   pattern.
