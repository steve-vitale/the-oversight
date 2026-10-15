# Agent lanes (2026-10-15)

Two agents work this repo. This note prevents file-level collisions.
Steve adjudicates; either agent may update this file when lanes change.

## Codex (taking over Claude's godpath work)
- Lane: `docs/godpath/PLAN.md` "What's left" — ascension gates, villager active
  verbs, early-kit subclass visibility, `god.scale` wiring, Table endings by
  class/god x light/dark.
- Files: `src/data/godpaths.json`, `src/js/godpath.js`, `src/js/godhood.js`,
  `src/data/table-endings.json` (endings side), `scripts/godpath/`.
- Status 2026-10-15: active on `codex/resume-claude`; publishing the recovered
  Claude work, noncombat gear/playstyle simulations, and actual runtime fixes.
  Resume higher-value godpath/ascension/subclass/scale/coda work next.

## Muse
- Lane: Claude roadmap `docs/ROADMAP.md` §2 minus the godpath files —
  region content wave 1 (done, on branch `region-content-wave1`), then
  The Long Way Home (nomad ending, `docs/WORLD-REGIONS.md` §6), then region
  systems (temperature, weather).
- Explicitly avoiding until lanes are confirmed: `src/data/godpaths.json`,
  `src/data/table-endings.json` (Table codas), godpath scripts.
- Files: `src/js/world.js`, region engine, new nomad-ending modules.

## Rule
Neither agent edits the other's listed files without a note here first.
Content merges happen through the normal worktree + `--ff-only` flow.


## Codex reconciliation note (2026-10-15)

Steve: "Muse agent is also working. You take the higher value work befitting
your model, I believe muse claimed a lane somewhere in roadmap. Push so it
can see your work."

Codex fetched `agent-lanes` and `region-content-wave1` after this direction.
Muse's wave-1 branch is already at `9cc36028` with six playable regions.
Codex's independently authored Europe slice (`7480ed60`) was made before
that remote claim was visible in this checkout. It overlaps Muse's Europe;
**do not blindly merge or replace Muse's regional data with it.** Preserve
Muse's region/nomad/systems lane. No further region authoring by Codex.

Already-running Codex regional audit is being completed as an explicit
exception: standard driver region/origin selection, 150-day gear/dead-usage
screens, and recipe catch-pool wiring (North American-only catch lists left
European traps unable to catch their actual local animals). These recipe
additions refer to Codex's animal IDs; reconcile species IDs against Muse's
branch before applying. Tests/evidence make the issue and contract portable.
The two Europe datasets are alternatives requiring deliberate reconciliation,
not two sequential content upgrades. The branch is shared for review and
integration; it does not deploy or change main.

Validation exception: Codex also fixes the confirmed fireside false-teaching
presence leak in game.js. Absent players were learning or contesting a
lesson they could not hear. This is a narrow knowledge/parity correction,
not region/nomad authoring; the targeted proof covers absent and present
novice/expert cases while preserving NPC false-knowledge spread.

Table-ending verification exception: Codex fixes tableSheet's own click
lifecycle in app.js. Browser play showed the selected door dropping its
next prompt because refresh ran while the old same-ID sheet was queued.
This stays inside the Table UI handoff; generic sheets and Muse's region/
nomad modules are unchanged.

Table ending-display exception: Codex retains the actually resolved final
outcome plus build coda in table.js and renders those escaped paragraphs in
app.js's ending screen. Phone play proved they previously existed only in
Game.say while the final screen showed a generic record. THE HOSTS and
pod-demand keep their full base stories, and losses reveal no win text.

Ascension-deed visibility exception: Codex adds the known class deed hint
to app.js Tracks, alongside its existing class line. Scope is godpath
objective/progress display only; no region or nomad UI changes.

Survivalist parity/settlement exception: Codex repairs Second Wind/Molt
activation plus their real health and gear results in fieldFights.js,
game.js, contestEngine.js and villager-agency.js. Field callers must apply
surviving HP once, rather than replaying cumulative damage after a rescue.
This is the godpath combat/contest contract, not region or nomad authoring.

Feast-deed/medical-cost exception: Codex credits actually landed, paid
noncombat feast healing through feastBuff.js and expands the caregiver bot
from comfort into known wound care. game.js only reads the existing native
Field Medicine price from data; foodPower.js shows the full unchanged bill.
This is food-powered progression/medical cost honesty, not region or nomad
content. Integrate the clock-neutral receipt follow-up with the initial
healing commit; the first telemetry comparison is diagnostic, not balance
proof. See evidence/2026-10-15/feast-healing-audit.md.

Tactical party-deed parity exception: Codex repairs game.js tbEnd so real
surviving NPC participants earn the existing shared combat/alien-fight deeds.
The player keeps its current timing and credits; no integration, world,
region or nomad system is changed. This closes a godpath progression caller
hole, with participant/death/flee/replay proofs and matched panels.

Alien companion readiness exception: Codex repairs encounters.js's actual
startAlienCombat party builder to carry existing world HP and equipment,
matching the ordinary monster builder. No region/nomad content changes and
no beam tuning. Paired constructor, damage, passive and campaign proofs
separate this from the preceding party-XP fix.

Companion health settlement exception: the same readiness audit proved that
57 surviving tactical HP reverted to 77 world HP on escape. Codex also
repairs game.js tbEnd's NPC health settlement, for real actor IDs only,
including fleeing and actual rescue healing. No repeated damage/death hooks.

Living Garden provenance exception: Codex edits food.js and narrow game.js
plant-harvest/stocking/transfer callers to retain the actual harvester
through existing food processing and whole-unit moves. No region/nomad
authoring, food-yield/cost changes or new ascension gate in this prerequisite.
The seven-day gate waits for actual eater receipts and parity measurements.
Harvest transfer follow-up: the same source metadata crosses Light Fingers
(abilityActions.js) and the corruption ration merge (corruption.js).
Scope is source preservation/dilution only; theft and corruption rules stay.
Continuous-travel proof fixture exception: exact-edge assertions now
prepare walkable target cells and add an explicit blocked-cell fallback
case. Only scripts/test-continuous-travel.js changes, not Muse travel code.
