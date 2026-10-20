# Muse calibration handoff — conversation/favor repair

Steve requested: “Get it live and muse should calibrate. Continue with other work.”

Reconciled release build: `347cce498-20261020-194257`. Runtime repairs are
`3329c74bf` and `dedc46db7`; their original release stamp is `347cce498`.
The current integration merges Muse's `699c56ba8` (33 later commits) and
preserves both histories. Common ancestor: `a4404566ccfee345813469a842b1994b9083cc2b`.
There is no unrelated-history or wholesale-port requirement for this release.
The old `codex/resume-claude` branch mentioned in historical lane notes is a
different integration source; do not calibrate against it. Its 149 unique
commits remain preserved for separate review. Direct Git inspection also
finds its common ancestor `7d011395d` with current master, so the historical
claim that even that branch is disjoint is no longer accurate.

Shared delivery refs are `origin/master`, `origin/main` and
`origin/codex/conversation-structure-20261020`. Check the remote refs and
production `version.json` before calling this candidate live. The integration
audit records actual publication/readback separately. ChangePilot does not
manage Oversight; its host integration has been scoped to moc-ai worktrees.

Muse: preserve any local work, fetch origin, and use the current shared
master/main history. On a clean master/main checkout, update with `git pull
--ff-only`. Before claiming a disjoint history, inspect `git remote -v` and
`git merge-base HEAD origin/master`; include those exact results in the lane
note if there is a problem. Do not reimplement or file-port the conversation,
favor, voice or shared measurement changes. This release contains them.

Muse owns gameplay calibration against the final shipped revision. Codex continues
favor quest/deadline visibility and conversation response contracts. Avoid
changing those files concurrently; use ROADMAP and AGENT-LANES for shared lanes.

Use docs/MEASUREMENT-PLAN.md, SIMULATING.md and SURVIVAL-LEVERS.md. First screen
16 matched seeds each for capable/maker/merchant/caregiver with identical current
observer, harness, policies and settings on both roots. Confirm small effects
with64 eligible pairs and independent holdouts; add named job/region cohorts.
Review all23 metrics, actual NPC eligibility, gear delivery/equipping/use and
feature opportunity. These mixed policies do not prove pacifist viability.
Win movement in either direction prompts investigation. Winning should be hard.

Historical balance evidence: evidence/2026-10-20/favor-action-audit-r3.md, retained64-case panels,
favor-balanced-a440-to-r3 and favor-balanced-r7-to-r3, feature census and36 exact
replay pairs. Against a440, wins per16 are capable16→15, maker9→7, merchant7→10,
caregiver5→6. This is a screen with review_required, not a target or clearance.
Keep survival, community, NPC/player progression, earned gear and contest/show
watches; higher wins cannot offset another warning. Do not restore false favor
fulfillment or tune HP/food/rewards merely to recover an earlier win rate.

Integration evidence: `evidence/2026-10-20/muse-reconciled-release-audit-r1.md`,
new source-bound neutral panel, both 390px touch-frame receipts, and the real
installed Muse-699 build update/offline-Continue receipt. The neutral panel
checks observer neutrality for the merged source; it does not replace a
matched balance study of the two combined gameplay changes.

Three favors have actions: food sharing and basic wound/illness care. Five
authored joint jobs remain unavailable: creek hauling, snare repair, watch
handover, overnight company and joint foraging. They explain the missing action
and offer no new hollow promise. Exclude them from claimed viable quest content.
General assignments, brief chat or gifts cannot substitute for those jobs.

Before every push use quick/full, fresh source-bound neutral and phone proofs,
and update survival-lever decisions with raw panels/config/hashes. Actual phone
interaction is distinct from node campaigns. Report actual days/endings; later
game still needs play-until-death coverage.
