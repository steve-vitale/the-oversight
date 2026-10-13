# Villager depth playtest — the trickle and the fighting (2026-10-12)

Steve's questions: "How often do villagers trickle in from other villages? Are
they being properly strategic in combat as well as fight selecting? Look deeper
than just a couple shallow levers and playtest all."

Method: 8 seeds × 150d death-aware (competent policy + auto-accept via the real
`acceptApplication`), 347 village-days, 531 villager field fights, full
`fieldFight` rec capture + transcripts. Probe:
`scripts/probe-villager-depth-20261012.js`. No game-code changes except one
small naming bugfix (below).

## 1. THE TRICKLE

**Mechanics (all real, all on master):**
- **Remote applications** (`membership.js`): daily `considerApplications`,
  p = (notability−40)/100 + viewership/200. Applicants are 70% generated
  survivors, 30% drifters; 35% come FROM a named village (migration prototype).
  Player accepts via UI (housing-gated, 3 intakes/week); `arrivalTick` walks
  them in 2–4 days later at trust 20, with `memberReactions` (the village
  notices newcomers — generous welcome or territorial resent by temperament).
- **Visitor invitations** (`betrayal.js`): `considerStrangers` spawns
  trader/scout/curious/fleeing visitors once notability ≥ 40; fleeing/curious
  ones can be invited to join ("Haven grows by one", trust 20).
- **Births** (`game.js`): rare by design — "most playthroughs see zero births."

**Measured (347 village-days):**
- Applications generated: **121 → 10.5 per 30 days** (natural rate; fires
  regardless of policy).
- With auto-accept: **9.25 arrivals per 30 days.** Roster 12 → 18–25 within
  two months on surviving seeds.
- Arrival origins: **68% drifters from nowhere**, 32% from named villages
  (Ashford 11, Stonebridge 10, Thornfield/Emberhold/The Bloodied/The Red
  Table a few each) — matches the 35% design target.
- Arrival reputations: 61% unknown, 24% good, **15% bad** (auto-accept says
  yes to everyone; a real player would filter).
- Visitor spawns: **72 (6.2/30d)** — 26 trader, 14 scout, 16 curious,
  16 fleeing. **Invites: 0** — inviting is player-gated (a UI choice) and no
  sim policy ever invites. The path exists; sims never walk it.
- Births: 0 (as designed).
- Newcomer trust: mean 16.0 (starts at 20).

**Verdict: Haven is not a closed box — once you're notable it's a flood.**
~10 applications per month is a lot of mouths; the housing/intake gates are
the only throttle, and acceptance is 100% player judgment. The village-to-
village trickle specifically is real but minority (about 3 per 30 days).

**The dark side of the trickle:** newcomers are **31.6% of fighters but
62.1% of combat deaths** — 2× the death rate. They arrive with 0 bravery XP
and 0 abilities and walk the same treeline as veterans. The village feeds
its FNGs to the monsters first. (Realistic. Bleak. Worth knowing.)

## 2. VILLAGER COMBAT — THE FULL PICTURE

**Fight selection (before steel is crossed):**
- The pre-fight awareness check ("saw it, gave it room") works: **51% evade**
  when it runs — villagers do avoid fights they sense.
- But only **15% of fights run the check.** Patrol/wild paths skip it; the
  villager fights whatever jumps them.
- **No fitness gate:** wounded villagers go right back out on expeditions.
  Nothing stops a 30-HP villager from ranging.

**Mid-fight morale (the situational system, Steve 2026-10-09):**
- Hopeless trajectory → **flee 100%** (114/114). It works exactly as designed.
- Winning trajectory → commit (flee only at 5% HP): **0.9% die** (1/109).
  The "winning→hold" death trap the counter-execution lever tripped over is
  essentially absent in the game's own logic.
- Mean flee point: **30% HP.** Sensible, human.
- War Cry / Scream Cheese fire as designed (once per fight, at the hopeless
  or hurting moment).

**How villagers actually die (30 deaths):**
- **87% die in round 1** — burst damage before the morale system (which
  engages at round ≥ 2) ever gets a vote. David vs buffering: "Catch Up
  hits David for 34 (0 left)" — he entered wounded and never got a turn
  to run.
- Killers: hushwolf 6, gallowdeer 6 (wave 1 still leads), then wave-2/3
  signature one-shots (memory_projector 3, callback 2, redactor 2).
- The one winning→death: Diana vs spool — the spool "recorded" for 3 rounds
  while she chipped it (trajectory: winning, taking 0), then REPLAYED her
  own strikes back for 54. Telegraph was there ("recording (1/3)... does
  not attack"); the DPR-trajectory morale can't see a telegraphed one-shot
  coming. Honest limit, not a bug.

**Coordination — the gaping hole:**
- **calledHelp fired 0 times in 531 fights.** The "shout for help" branch
  is unreachable in practice.
- **allies > 0 in 0/531 fights.** The PARTY-UP mechanic (Steve 2026-10-09)
  passes `_outdoorCrew` as allies — but the crew is always empty when it
  matters, and the main fight path (`expeditionMonster`, villager-agency.js)
  **doesn't pass allies at all.** Villagers always die alone, one by one,
  even when the code for fighting together exists two rooms over.
- No rescues, no joint fights, no "hold them off while she runs." The
  coordination verbs are decoration until allies actually arrive at fights.

**Transcript sense-reads:**
- David/buffering: abrupt but fictionally coherent (time-distortion
  signature, wounded man, no chance). Sensible.
- Diana/spool: the monster's trick is telegraphed and fair; her death is
  the price of not reading it. Sensible — and the one case where "winning"
  lies.
- A heron mFlee: "A walks straight into the heron that isn't quite there
  when you look at it. No avoiding it." — led to the naming bugfix below.

## 3. BUGFIX: fight-log "A" naming

Fight logs rendered unknown pre-System villagers as bare **"A"** ("A strikes
for 25", "A is losing — shouts for help!") — `displayName(vid).split(' ')[0]`
on the "A woman, maybe 30s" descriptor. The `firstRef` helper was built for
exactly this and `fieldFights.js` wasn't using it. Fixed all three sites
(vName + 2× allyName) to prefer `firstRef` for non-player villagers; player
path unchanged. Proof `scripts/test-fightlog-names-20261012.js`: 6/6 green,
RED-verified (pristine code fails with "R1: A strikes for 4 (16 left)").
Committed in worktree (safe-commit.sh). ~20 other call sites across the
codebase use the same naive pattern (app.js, comms.js, conversation.js,
corruption.js, game.js, havenGrowth.js, hierarchy.js, carexplore.js) —
documented for a future pass, not touched here.

## 4. PLAIN-WORDS ASSESSMENT

Do villagers act like people when it matters? **Half.**

They are sane individuals in a fight: they evade when they see it coming,
they run when it's hopeless (every single time), they hold when they're
winning, they bellowing-rally once before breaking. The morale model is
one of the best-built systems in the game — the numbers prove it behaves.

But they are strategically helpless in every way that matters before the
fight starts: the wounded go back out, the new walk the treeline first and
die twice as often, nobody travels with backup, and nobody ever shouts for
help because help is never there. 87% of deaths are round-1 bursts — the
fight is over before the good decision-making gets a turn. Villagers don't
die because they're stupid in combat. They die because they're alone.

And they don't stay alone by necessity — they stay alone because the
coordination code paths never connect: the expedition fight doesn't pass
allies, the outdoor crew is empty, the help branch is dead. That's the
blank this playtest found. The fix isn't a lever — it's wiring villagers
to actually arrive at each other's fights.
