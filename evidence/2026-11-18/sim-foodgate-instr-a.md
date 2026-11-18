# sim-foodgate-instr-a — carrier food-gate instrumentation (finding #2557-A)

Run fleshout-20261118T2015Z, Loop A, axis scale-onramp. Worker arm
sim-foodgate-instr-a. Finding #2557-A (the Loop B reuse of #2557 the same
day is a different finding — the post-quad launch drought; this arm cites
its finding as #2557-A throughout).

**Verdict: GO.** The instrument lands on master on its own (engine-side
flags only, no behavior change) and measures both gates with counts, so the
next carrier retune argues from numbers, not from a probe.

## Question

Finding #2557 (round 1715Z): the field-engine Rage carrier (held branch
sim-fieldcarrier-a, NOT on master) fired in the wild — arm 16 held / 6
fired, control 0/0 — but 2 of 8 engaged held fights never fired, and a
probe verified BOTH candidate gates live: (a) food tier `tight`/`starving`
blocks `fieldAct`; (b) hunger 79 blocks the 60-kcal Rage pay. The corpus
recorded NEITHER tier nor hunger. This arm instruments both gates on the
field-fight encounter row and measures how often each bites.

## What landed (commits on branch sim-foodgate-instr-a)

- `7881238e6` — food-gate instrumentation on the field-fight record +
  proof 38/38. `src/js/godpath.js`: `fieldAct` tier-gate early returns
  set `G.tierBlocked` (`'starving'` | `'tight'`, first round, blocked-round
  count); `fieldPay` records a failed pay on `G` (count, first blocked
  `{id, actId, kcal, hunger}`, `payBlockedRage` flag); the Rage branch
  sets `G.rageFired`. `src/js/fieldFights.js`: the fight record carries
  `foodTier` (fight-start tier), `hungerStart`, `holdsRage` / `gpActive`,
  the copied gate flags, `rageFired`, and `carrierRageHeld` /
  `carrierRageFired`. Reads only, no RNG, no behavior change:
  flag-setting on paths that already returned.
- `c01d2de57` — driver + analyzer + panel builder. `scripts/foodgate-driver-a.js`
  (encounter rows carry the foodgate fields plus `trickLog`, finding
  #2558's competing explanation), `scripts/analyze-foodgate-a.js`
  (bite-rate judge + selftest 17/17), `scripts/build-foodgate-panels-a.js`
  (§15 pristine-vs-instrument).
- `983b7193e` — fix FOODGATE_PRESENT regex — godpath names the flags
  `payBlocked*` / `tierBlocked`, not `foodgatePayBlocked`; smoke seed
  showed live rows (25/25 foodTier+hungerStart, 4 tier-blocked,
  1 pay-blocked-rage) with the self-description false.
- This commit — evidence: analysis, panels, compare, this file.

## Primary metric (frozen prereg)

Engaged held fights, arm leg (instrument + carrier staged in a SCRATCH
worktree only, FIELDCAPDMG=1; the carrier is diagnostic-only and reverted
before commit — the committed instrument stands alone on master). Seeds
104601–104608, 150d, competent policy, VETREENGAGE=1 + FLEEREPAIR2=1 +
FIGHTALLY2=1. Deliberate matched-band reuse: the band where the carrier
fired 6× in the wild (1715Z). Anchor differs — this tree is at master
6a97f3a07 (journey r145 landed after 1715Z's 41a47a7b9) — so bit-identity
with the 1715Z corpora is NOT assumed; the 1715Z numbers (16 held / 8
engaged held / 6 fired) are a sanity read, not a bar.

| Bar (frozen) | Result |
| --- | --- |
| Instrument errors ctl 0 / arm 0 (bar 0) | PASS |
| Field completeness: engaged rows with null foodTier/hungerStart ctl 0 / arm 0 (bar 0) | PASS |
| Pool floor: engaged held fights (arm) 11 (floor 4; 1715Z had 8) | PASS |
| Carrier fires on control leg 0 (bar 0; any ctl fire is an instrument failure) | PASS |
| Cost guardrails: arm community loss 2/8 (bar ≤3), starvation 1 (bar ≤4), median 151d (bar ≥120d) — 1715Z arm leg: 2/8, 2, 150d | PASS |

**Bite rates, arm leg (N = 11 engaged held fights):**

- Tier gate: **5/11 (0.455)** fights ever hit a tier-blocked round.
- Hunger gate: **0/6 (0.000)** among the tier-unblocked engaged held
  fights (sequential gates — the tier gate runs first).
- Carrier fires: **6/11 (0.545)**.
- Never-fired decomposition (sums to 5 = 11 − 6): tier-denied 3,
  hunger-denied 0, trick-displaced 1, other 1.

The never-fired five, by seed/day/fighter:

- 104603 d146 aki_tanaka vs Network Note — starving, tier-blocked round 1, fled.
- 104604 d65 ruby_callaghan vs audit — starving, tier-blocked round 1, fled.
- 104606 d117 desmond_clarke vs eulogy — starving, tier-blocked round 1, fled.
- 104608 d134 visjoin_125 vs eulogy — abundant, no gate, trick-displaced
  (six `wait:algorithm-tank` entries), fled.
- 104608 d146 visjoin_131 vs eulogy — abundant, hunger 32, no gate, no
  trick, **won the fight (vKill)** — won too fast for Rage to matter.

## Secondary population (master-alone, ctl leg)

Same three rates on the real-Rage population — engaged wave-4+ rows with
`holdsRage === true` AND `gpActive === true`, `rageFired` replacing
`carrierRage` (N = 22, engagedN 124):

- Tier gate: 5/22 (0.227). Hunger gate: 1/17 (0.059). Fires: 9/22 (0.409).
- Carrier fires on ctl: 0. Instrument errors 0, gaps 0.

The gates bite real Rage too, at lower rates than the carrier — the
carrier's 0.545 fire rate is not a measurement artifact of the staging.

## Panel (§15, frozen expectation: `no_material_signal`)

Pristine master (same driver, FIELDCAPDMG unset) vs instrument
(FIELDCAPDMG unset), 8 paired seeds. Compare verdict:
**`review_required`** — investigated, NOT a re-score.

Every observed metric is identical before/after: village deaths
85.75 = 85.75, community loss 0.375 = 0.375, first-bearer survival
1 = 1 at day 30 and day 60, national 0 = 0, table wins 0 = 0. The
`review_required` label is the panel's screen-only caveat (most metrics
`not_observed` on the pseudo-policy panels), not a movement — nothing
observed moved at all. Per the frozen prereg this is an investigation
note, and the investigation finds zero behavior delta, exactly as the
instrument-only design promises. Compare file:
`evidence/2026-11-18/foodgate-a-panel.md` (panels
`foodgate-a-panel-before.json.gz` / `-after.json.gz`).

## Sense test (frozen prereg)

Read full fight logs where a gate bites:

- **Fired:** 104606 d125 desmond_clarke vs strike, tier tight, hunger 55 —
  "R4: Desmond's eyes go red. Next 3 strikes hit twice as hard. (Rage)"
  then "R5: Desmond strikes for 30 (x2.0)". The firing path IS narrated.
- **Tier-blocked:** 104603 d146 aki_tanaka vs Network Note, starving —
  bow opening (3 shots, 8/8/12), then ordinary strikes ("R1: Aki strikes
  for 20"). No Rage attempt is narrated, so nothing contradicts the gate —
  but nothing explains it either: the gate is silent in narration. No line
  says the fighter was too hungry to call on the Rage. That is a
  narration gap for the carrier retune to close (a blocked Rage deserves
  one honest line), not an instrument defect — the instrument records
  truthfully what the engine did.

## Metric review (closeout)

- **Tier-blocked-round ≠ fight-denied.** The headline 5/11 counts fights
  that EVER hit a tier-blocked round, but 2 of those 5 still fired Rage
  later (104606 d125 Desmond, blocked round 1, fired round 4; 104606 d143
  Aroha, blocked round 2, fired). The tier gate is per-round: a blocked
  round delays Rage, it does not deny the fight. Per-fight denial from
  the tier gate is 3/11, not 5/11. The analyzer's headline rate and its
  decomposition (3 tier-denied) are both correct; the distinction is
  recorded here, not re-scored. The next carrier retune should argue
  from the 3/11 denial rate, and from rounds-lost if it wants the
  delay cost.
- **Hunger gate never bit on the arm leg (0/6).** The probe showed it
  live (hunger 79 blocks the 60-kcal pay), and the ctl leg shows 1/17 —
  so the gate is real but rare on this band: the 6-fight hunger
  denominator is small and the arm's engaged fights started at hunger
  21–62, none near the pay threshold. A hunger-gate rate needs a
  hungrier band, not a re-scored bar.
- **Tier/hunger overlap is unmeasurable from this instrument** (prereg
  note): a tier-blocked fight never reaches the pay, so whether the
  hunger gate would also have bitten is unknowable. The sequential
  denominators handle this by construction.
- **The "other" row won too fast.** visjoin_131 killed the eulogy
  without Rage and without any gate or trick — a fast kill leaves no
  window for the carrier. A carrier that only fires on longer fights
  will always show a residue of quick-win non-fires; that residue is
  not a gate.

## Files

- Prereg: `evidence/2026-11-18/sim-foodgate-instr-a-prereg.md` (frozen,
  commit b9221b565)
- Analysis: `evidence/2026-11-18/foodgate-a-analysis.json`
- Panels: `evidence/2026-11-18/foodgate-a-panel-before.json.gz`,
  `foodgate-a-panel-after.json.gz`, `foodgate-a-panel.json`,
  `foodgate-a-panel.md`
- Corpora: `evidence/2026-11-18/perseed-foodgate-a-arm/` (8 seeds),
  `perseed-foodgate-a-ctl/` (8 seeds). The pristine corpus
  (`perseed-foodgate-a-pristine/`) was deleted after the panel build —
  it exists only as the before-panel; the carrier staging lived in the
  scratch tree sim-foodgate-measure, never on this branch.

## Gate / telemetry

Proof `scripts/test-foodgate-instr-a.js` 38/38 GREEN; analyzer selftest
17/17 GREEN (both re-run on the rebased tip at adoption). Round-level
gate and telemetry are in the round evidence
`evidence/2026-11-18/sim-scale-onramp-round-2015.md`.
