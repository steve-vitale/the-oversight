# DIRECTIVES — Steve's standing orders

## Redundant phone surfaces and unreadable chat (Steve, 2026-10-19)

“Still redundant as hell. Playable surfaces are now spread across roughly two phone screen lengths. Chat getting cut off and not being scrollable. Surfaces with same goals or info taking up space at several spots.”

Verify the build actually served to the phone as well as local renders. Keep
the field in one viewport; text inside its bounded message area can scroll
when it does not fit. Reply labels must remain readable and controls reachable.

## Phone space and coherent messages (Steve,2026-10-18)

“Your screenshots look like my screen on my phone. It needs to be playable on
one screen. Nobody wants to scroll back and forth to move and take actions then
up to see. We have chats and text notices popping up in all sorts of places,
too and bottom of screen. We need to use a coherent strategy and treat our
phone screen real estate as precious”

Current implementation and repeatable acceptance contract: PHONE-FRAME.md.

Verbatim-ish record of Steve's explicit instructions. These don't expire. When in doubt, this file wins over inference. Append-only: add new directives, never rewrite old ones. If a directive is superseded, note it — don't delete it.

## Repository scope correction (Steve, 2026-10-18)

Steve corrected “We should have those rules on this repo” with “Shouldn’t”.
The earlier request to reuse ChangePilot's old host rules is superseded.
Oversight uses its own repository instructions, roadmap, agent coordination,
Git history and simulation/playtest evidence. The imported ChangePilot workflow
and approval statements retained below are historical; they do not establish
Oversight prerequisites. Game design directives remain in force. See the
repository workflow scope in `AGENTS.md`.


## Repository scope correction (Steve, 2026-10-17)

"Nah, this repo doesn’t use changepilot. Let’s keep that straight."

Oversight uses its repository roadmap, agent lanes, Git history and simulation/playtest evidence for this work. Earlier ChangePilot workflow and approval statements below were imported from another project and are superseded for this repository. Retain them only as historical context; they do not establish an Oversight workflow requirement. Game design directives remain in force.

## How we work
- "Continue all work. You keep stopping."
- "Keep orchestrating to keep up throughput."
- "Be more proactive. Don't sit all night waiting for permission on three harmless choices."
- "Facilitate." — move work forward; don't make Steve decipher infrastructure.
- "Decisions, not chores."
- "Next?" advances the visible work queue with no clarification.
- "No sycophancy."
- "We don't want to rely on an agent for things that should be happening via deterministic means."
- Judge against external standards, not self-assessment.
- Test/gate claims carry command, method, duration, result.
- "We work Changepilot. Not the repo."
- "Throughout the experience, be sure to log any friction you get from using Changepilot."
- Pay as much attention to the code as to the game.

## The Scattering — design
- Mobile-first; phone playtesting is authoritative. Easy App Store portability later.
- One mobile screen. "I kinda hate changing views."
- "Everything should either cost time, time and calories, or just calories." No action points.
- "Number of times and results of you doing them depends on the biome."
- Power never removes the need to eat. "Does this let you skip dinner?" is the power-design test.
- Reward real survival understanding, not memorizing a crafting game. Caves of Qud is the anti-example: too much to learn.
- The world feels deep because it is rich/reactive, not because the interface has many systems.
- Specs are provisional v1 until playtesting proves otherwise. Preserve specs and intent from day one.
- Visual scope stays finishable by a solo-dev team. Art investment follows validated interest, not the other way around.
- Discovery, not given: the game must not give away information the player hasn't earned. If the RNG hasn't produced it, you don't know it's there.
- Symbols matter: close-up tiles are tappable for knowledge and will eventually direct effort.
- The Codex starts as a Journal (your handwriting); it becomes a Codex at the first milestone.
- Energy is a future mana system: eating past full charges it; it fuels skills (powerful blow, dodge). Not before the skill/combat systems exist.
- Survivors are people, not survival archetypes. Dialogue is character first, tips second.
- Scale transitions are moments, not thresholds (Steve 2026-10-05): village → regional → national → global, each FELT as a played beat. One system — the System overlay grows from HUD/abilities into coordination/logistics, tied to the codex (knowledge → food → power → coordination → species agency). You always walk around as a person; verbs never change. Transitions are never speedrunnable: relationships take seasons, rival leaders have agendas, feeding a coalition scales exponentially, viewership gates System upgrades.
- Keep business Drive files shared with Darren separate from personal files.
- Reverify notification data older than ~30 minutes.

## ChangePilot
- Consequential account, authorization, production, deployment, and repo actions require explicit approval.
- Do not nag about production authorization (state the blocker once per genuine state change).
- The detail grid is the world: 9x9 cells per tile, edges blend into neighbors, walking feels continuous. Big features can straddle boundaries.
- Play the game in free time, acting like a game critic. Look for friction, feel the loop, keep the playtest log current.
- The pantry is physical: it lives in the hall at haven. The dawn village meal and the player's roster draw only happen when the player is actually at haven — camp wild and you eat from your pack. (Membership still has no check-ins: away members stay members; they just don't get fed.)
- The cautious edibility test is always available, always honest: unknown lumps can be tested from the carried pack anywhere, not just at the haven stash. Sorting (the camp ritual with knowledgeable people) stays camp-only.
- Exile haven founding is a struggle, not a button (Steve 2026-10-06): a new haven CAN be founded but not easily — 7+ solo days, claimed site, hut+ shelter, 10000 kcal cached (~2 weeks of real work). More likely the exile joins an existing village/haven with capacity: discovery via drift smoke/map, capacity is real (full = refused), entry via petition, 14-day probation at their fire (half shares, trust from 5, voted in at 15+ or back on the road). Hard reset holds throughout: old village archived, no continued residence with exilers; player keeps self/pack/codex.
