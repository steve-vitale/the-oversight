# Journey: crisis leg (6) — 2026-10-11

Worker: crisis-leg subagent. Worktree: ~/workspace/worktrees/journey-crisis (branch journey-crisis).

## Played

**Tool**: `scripts/journey-crisis-20261011.js` (new) — 6 seeds × 180 days as a competent
player (oracleV2), tracking crisis beats, deaths+causes, disease cases by pool,
famine days, sieges, succession outcomes, and a plain-words census.

**Harness repairs made along the way** (both in `scripts/sim-harness.js`, the shared harness):
1. **Day-loop fix**: `runDays` used raw `tickAction(128)` ×3/loop-day — probed: villagers'
   `villagerTurn` NEVER ran (0 calls in 30 parts) and the day clock stalled
   (~0.1 day/loop-day under a real policy; sleep() refused on the half-spent day).
   Replaced with `doAction('wait')` per part (villagerTurn + tick-to-part-boundary),
   matching winrate-iter4's proven `runOne`. Days now advance 1:1.
2. **Time-freeze watchdog**: a fight neither side can advance froze the clock for
   160 loop-days (probed: stuck on day 22, fight=true). Added winrate-iter4's guard:
   8 loop-days with no day advance + unresolved fight → `tbEnd('routed')`.

## Village assessment (plain words)

Six villages, six dyings — every seed ended `village-lost`, but the dyings differ:

- **Seed 1 (103d)**: the succession story. NINE player deaths, each passing the mantle
  cleanly (Darius→Scarlett→Marcus→Moshe→Ursula→Sofia→Sunan→Simone→Lena→James).
  The village-as-protagonist design WORKS — the Codex, arc, and trust carried on
  through nine bearers. Starvation killed 4 bearers, combat 5. One villager
  (Emma) died to a monster at d86. Gutrot hit three bearers in a row (d20–36).
- **Seed 2 (59d)**: the famine story. Hunger-winter@d13, 29 hungry-days, max streak 5.
  Five bearers starved in sequence (Marisol→Lena→Nataly→Manuel→Fiona→Marcus→Paloma).
  Lockjaw and wound_fever stalked the later bearers. The village ate; the bearers didn't.
- **Seed 3 (11d)**: the stillbirth. First bearer starved d8; the village scattered d11.
- **Seed 4 (32d)**: the siege story. Five villagers dead to monsters in 9 days
  (d15–24: Tiana to a belltoad, Aaron, Krzysztof, James), then a schism@d29 (exile).
  This is the leg's thesis in miniature: the village bends (exile!) then breaks.
- **Seed 5 (82d)**: the long attrition. Eight bearers, hunger-winter@d63, four villagers
  dead (3 monster, 1 sickness). Emma Larsen (veterinarian) was the last one standing.
- **Seed 6 (18d)**: the exile story. Player exiled d16 (schism), pantry empty, the
  village SCATTERED d18 — "Haven couldn't hold... The scattering, again."
  Correct per design (the village is the protagonist; a scattered village is a dead run).

**Who lived**: nobody, in the end — but bearers lasted 100+ days in seed 1 through
nine successions. **What they knew**: the runs were too short for deep knowledge
(codex breadth stayed low; survival ate every action). **Who led**: trust leaders
emerged (Sofia Chen trust 90 in one timeline; Simone Barbagallo 90 in another) —
and the mantle consistently passed to the highest-trust villager. **Who was
miserable**: nearly every census row reads `mood=lonely` — the loneliness economy
is loud in crisis timelines. **What was missing**: any villager-initiated
sickness talk (fixed this run — see below).

**Crises fired**: breach 6/6, first-grave 5/6, hunger-winter 3/6, schism 3/6,
blood-on-air 0/6 (no contest deaths in these seeds). **Deaths**: 12 villagers
(monster 8, sickness 2, starvation 1, ambush 1), 27 player deaths (starvation 15,
combat 11, contest 1). Starvation is the #1 bearer-killer — the "competent"
policy feeds the village but not itself (policy weakness, not a game bug;
noted for the policy owners).

## People check (SENSE-TESTING LAW) — 4 full transcripts

- **A. famine**: PASS with meaning. The starving NPC opens "I hate to ask, but do you
  have anything to eat? ... I can't keep going like this." Crisis colors the talk
  ("11 of us are running on empty", "We need food. Everything else is decoration
  until that's solved."). Minor wart: `alive:thread:*` choices re-offer after
  exhaustion (bounded; engine ends it).
- **B. disease**: FAIL → FIXED. Before: a gutrot sufferer opened with "What's the
  worst thing you've done since the sky changed?" and chatted about guilt for 22
  exchanges without once mentioning their cramping gut. After: "I hate to ask
  this, but whatever this is, it's getting worse — I'm doubled up with gut
  cramps. Will you help me?" → commit → tracked obligation → tend/treat keeps it.
- **C. grief**: PASS. "Do you ever — no. Never mind." → mourning thread, push-ups at
  dawn, "We bury, we grieve, we keep going. There's no step four." Stays on topic.
- **D. succession**: PASS with a note. The new bearer is met with grief ("I'm not
  okay. I'm saying it out loud so it's real") — right. The "you're not her" beat
  fires in narration at death time (ledger.js), not in conversation; acceptable.

## Blank filled

**Disease-blind conversations.** The want system had favor needs for hunger, wounds,
water, and work — but none for disease. Sick villagers never asked for help and
never mentioned being sick. Fix (in worktree):
- `src/js/convo-wants.js`: new `sick_help` favor kind (keepKind/goal `heal`,
  deadline 2d) — symptom-only lines per instance (never the true disease name;
  canon docs/DISEASES.md), wired into `convoFindFavorNeed` (acute, urgency 4;
  hunger/wounds still outrank), `convoFavorNeedLive` (re-ask only while sick),
  and the generic favor machinery (ask→commit→tend/treat→keep, or rot honestly).
  Mundane `v.sick` records only — alien quirks never ask (two pools never mix).
- `src/js/game.js`: `treatVillager` and `tendVillager` now call
  `checkPromises('heal', vid)` — curing/tending keeps heal promises. Before,
  only words (comfort) could keep them; actual medicine couldn't.
- Proof: `scripts/test-sick-favor-20261011.js` — 17/17 × 6 seeds (need detection,
  want selection, symptom-only opener, commit→tend→kept→fulfilled+trust,
  treatVillager keeps, alien-quirk exclusion, priority order).
- Adjacent: `scripts/test-crisis-20261009.js` C6 was stale vs the 2026-10-10 pacing
  retune (arc-3 needs TWO crises; breadth must be earned). Updated: 18/18 × 3 seeds.

Regressions: test-convo-beats 43/43, test-favor-system 30/30,
test-soc-favor-followup 17/17, test-disease-pools 66/66, test-disease-break-r14
63/63, ontology 63/63.

## Reachable / fun / winnable (crisis leg)

- **Reachable**: yes — crises fired in 6/6 runs without any forcing. Breach and
  first-grave are near-certain; hunger-winter and schism about half the time.
  Blood-on-air needs contest deaths (not seen; rarer by design).
- **Fun**: the crisis beats are the best writing in the game (the System's
  "The audience is crying. I did not know they could do that." is perfect).
  Succession chains are genuinely moving — nine bearers, one village.
  The famine/siege arcs produce real stories. The disease ask now gives sickness
  a social dimension it lacked.
- **Winnable**: through crisis, yes — the mantle passing is the win-through-death
  mechanic and it held for 103 days / 9 successions. But: 6/6 villages eventually
  scattered or died under oracleV2. The policy starves its own bearers (feeds the
  village, not itself) — a policy gap worth a future lever rotation, not a crisis
  design flaw. No seed reached Arc 3+; the 180-day cap with real days is now the
  honest measuring stick.

## Unfixed / notes for coordinator

- `alive:thread:want` / `alive:thread:lately` re-offer after exhaustion (seen in A,
  C, D transcripts) — bounded, engine-capped, but robotic. Social-life leg's
  territory; flagging, not fixing.
- Near-universal `mood=lonely` in crisis timelines — the loneliness economy may be
  overtuned when villagers are dying, or it may be honest. Flagging for a feel pass.
- The sim-harness day-loop fix changes results for all runDays callers
  (bal-waves-sweep, parity-sweep, probe-fights, diag-*) — their "days" are now real
  days with acting villagers. Parity comparisons remain valid (same loop both sides).
