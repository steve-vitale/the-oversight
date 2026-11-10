# OVE-80 — scout DUTY ads stay 0 (opportunity classify)

Measurement / classification only. Muse lanes off. **No**
`villager-brain.js` product edit (OVE-78 owns hunt-weight work on that
file). Tip audited: `ae3fb87c3` (`origin/cursor/hunt-duty-dawn-pick-d17a`,
OVE-76 / PR #59).

## Verdict

**SCOUT_DUTY_OFFER_BRANCH_ABSENT — honest residual (scoped omission).**

Census scout ads **0/32** after OVE-71–77 is not a silent gate that never
becomes true. `dutyFeedCandsFor` never builds a scout candidate. OVE-71’s
contract and code added **hunt / patrol / teach** only. Downstream align +
practice already know scout; the offer branch was never written.

**Not a Game defect** of the “conditions exist but ads fail” class.
Follow-up product slice (name: scout DUTY offer) can wire ads when ready;
do **not** land it on the same `villager-brain.js` hunt-weight surface
while OVE-78 is in flight.

## Trace

| Layer | Scout status on tip |
|---|---|
| `dutyFeedCandsFor` | **No** `dutyBuildCand(..., 'scout', ...)`. Token `scout` appears **0** times in the function body. |
| OVE-71 contract | Kickoff/done-when: combat/social = hunt + patrol + teach. Scout out of slice. |
| Header comments | `vbrain_duty_combat_social` / duty pick docs name hunt/patrol/teach; not scout. |
| `vbrainAlignObjective` | **Ready:** `dutyTask === 'scout' \|\| 'patrol'` → EXPLORE. |
| OVE-74 practice | **Ready:** `objOnExploreReturn` accrues when `practiceTask` is `scout` or `patrol`. |
| Live panel (OVE-77) | capable/competent 80d: scout ads **0→0**, picks 0, practice 0 (vs teach/patrol live; hunt ads live / picks 0). |

## Runtime probe (one-shot, this tip)

Harness: `scripts/sim-harness.js`, seed `20261109`. Forced rich opportunity
still yields **no** scout DUTY:

| Scenario | DUTY tasks observed | scout? |
|---|---|---|
| low pantry + known animals + teach gap | forage, cook, hunt, teach | **no** |
| same + forced `objDangerBelief` fresh raid | forage, cook, patrol, hunt, teach | **no** |
| full pantry + heard threat | patrol, hunt, teach | **no** |

Static body counts inside `dutyFeedCandsFor`: scout **0**, patrol 4, hunt 14,
teach 6, forage 8, cook 3, water 6. Align still has the scout branch.

## Classification

| Question | Answer |
|---|---|
| Missing offer branch? | **Yes** |
| Gated condition never true? | **N/A** — no scout gate exists |
| Intentional OVE-71 omission? | **Yes** — slice scoped to hunt/patrol/teach |
| Design/omission (honest residual)? | **Yes** |
| Game defect (should fire when conditions exist)? | **No** — no authored scout opportunity→ad path yet; zero is explained by code as written |
| Wire now? | **No** — residual, and wiring would edit `villager-brain.js` beside OVE-78 hunt weights |

## Follow-up (do not start here)

**OVE-? scout DUTY offer** (after OVE-78 clears the brain/hunt lane, or on a
branch that avoids hunt weight hunks):

1. Define believed scout opportunity (e.g. unmapped / discovery pressure —
   Steve/contract, not invent numbers against Muse).
2. `dutyBuildCand(..., 'scout', w, …)` under `vbrainDisableCombatSocialDuty`
   or a sibling seam; failing control required.
3. Reuse existing align EXPLORE + OVE-74 `practiceTask='scout'`.
4. Seeded feed/commit/align proof + role-census remeasure.

## Sources

- Store census: Phase 6 after hunt pick (OVE-77) — scout 0/32
- Store formation scout (OVE-59): combat/social needed brain offers
- OVE-71 evidence: `evidence/2026-11-08/combat-social-duty-dawn.md`
- OVE-74 evidence: `evidence/2026-11-08/duty-objective-practice.md`
- Code: `src/js/villager-brain.js` (`dutyFeedCandsFor`, `vbrainAlignObjective`)
- Code: `src/js/villager-objectives.js` (`objOnExploreReturn`)
