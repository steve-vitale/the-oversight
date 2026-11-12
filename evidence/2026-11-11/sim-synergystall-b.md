# sim-synergystall-b — synergy-stall spot-check re-run to verdict

Run: `fleshout-loop-b-20261112T0230Z` (Loop B, 2026-11-12 02:30Z / 2026-11-11 20:30 CST).
Axis: scale-onramp — winnability chain. Tracker blank: 0130Z next blank #2
("the synergy-stall spot-check left inconclusive by the medname adoption —
re-run to a verdict or drop it").
Loop A live on its 0215Z claim (survival-collapse bisect ROUND 2) — NOT touched.
Base: master `d897eab1f` (sim-voice-adopt-round-0130 coordinator evidence).

## Prereg

- Script: `scripts/test-synergy-stall.js` verbatim (seed 20261011, god policy,
  94 days). No code change in this arm; the run is a re-execution to completion.
- Primary question (the script's own): why do synergy attempts stall at 1–2?
- GO bar for this spot-check: the script completes with exit 0 and its output
  answers (a) whether attempts stall, (b) the mechanism, with the mechanism
  verified in code and the class size counted from data. The blank's own words
  are "re-run to a verdict or drop it" — a verdict either way closes it.
- Horizon / seeds / policy: fixed by the script (94d, seed 20261011, god
  policy). Single-seed diagnostic, NOT a panel: no before/after, no wall
  numbers beyond the run's own end state.
- Log: `evidence/2026-11-11/synergystall-20261112.log` (full stdout, exit 0).

## Verdict: CONFIRMED — attempts stall at 1–2, zero discoveries in 94 days

The 0130Z spot-check was lost after ~2.5 min with progress output
("total ability_granted events: 157") but no verdict. Re-run here completed in
**12 seconds, exit 0** — the loss was the host write flap, not the script.
The 157-grant count is byte-identical to the lost run's progress line: same
run, now finished.

Output (seed 20261011, god policy, 94d):

- Abilities held at day 94: the_touch, beard_moss, adrenaline_control,
  echo_location, cornered_rat (5, all L1).
- `synergyAttempts`: `{ ringcraft: 2, ringcraft_teased_1: 1,
  ringcraft_teased_2: 1 }` — the `_teased_N` keys are once-per-count tease
  markers, not attempts. Real attempt total: **4, all ringcraft, in 94 days**.
- `synergies discovered`: `[]` — **zero in 94 days** of a policy that uses
  2 abilities every day.
- `abilityUseLog` tail (days 88–94): ambush, animal_ken, green_thumb,
  patient_aim on daily rotation — yet NONE of ambush / animal_ken /
  patient_aim is held at end of day 94.
- Held-leg synergies with zero attempts: **cornered_fury attempts=0**,
  type=simultaneous, legs=[adrenaline_control, cornered_rat] — both legs
  held, zero attempts.
- `ability_granted` telemetry: 157 events, mostly day-1 villager grants
  (green_whisper ×7, the_touch, iron_stomach…); player: green_thumb d8,
  lucky_rock d16.

## Mechanism — why it stalls (verified in code)

Discovery progresses only when a synergy leg is "noted" in the scholar's use
log (`checkSynergyDiscovery`, `src/js/game.js:29469`, reached from
`noteAbilityUse`, `:29418`). A leg gets noted through:

1. `useAbility` activation (usable abilities — those with actions);
2. ambient `noteAbilityUse('<id>')` calls — 13 ids: leech, third_eye,
   second_wind, rain_dancer, rage, photosynthesis, phoenix_clause, molt,
   mediator, hollow_bones, grave_robber, cold_blooded, chitin_skin;
3. `gainAbilityXP` literal sites — diplomat (conversation), tracker
   (encounters ×2 + game.js), camp_cook, generous, scrounger, green_thumb;
4. `treatDisease` — herbal_remedy, field_medicine, triage (treat: buttons);
5. tech:/skill:/item: legs via synthetic events;
6. surge focused-practice (`src/js/progression.js:489`) — the devotion-lane
   session grants XP to the single closest-to-complete unmaxed held ability,
   which notes it. Narrow and gated; it never fired for cornered_fury's legs
   in 94 days.

The passive-resonance safety net (`_synergyPassiveLegHeld`, game.js:29702)
only helps when a USABLE leg is used while the other (passive) leg is held.
When BOTH legs are passive with no note path, there is no trigger at all:
`checkSynergyDiscovery` never runs for that synergy because the
`livePaths` filter requires the used ability to be a leg, and neither leg can
ever be the used ability. The 2026-11-02 trigger-side resonance fix covered
the `sequential` case (passive second leg) — it does not cover this case.

### cornered_fury (the observed case)

- Legs adrenaline_control + cornered_rat: both pure-passive (no actions),
  no ambient note, no XP-tick site. Only the surge focused-practice session
  could ever note either leg — and it did not, once, in 94 days.
- Result: 0 attempts while both legs were co-held. Structurally stalled in
  ordinary play, not bad luck.

### ringcraft (the 2 attempts)

- Sequential, order [brawler_instinct, intimidating_presence]. The god
  policy's NOPE list excludes BOTH intimidating_presence actions
  (stare_down, end_it_before), so the second leg is unusable by policy; the
  2 attempts came only via the fight path (competent `fight` calls
  `useAbility`) when both legs happened to be used the same day.
- The legs have since been replaced: neither is held at day 94. Level-up
  picks replace a held ability when slots are full (`chooseAbility`,
  game.js:25680, `s.abilities.splice`), so progress strands at 2/3 until
  the legs are re-granted AND the rare same-day alignment recurs. Attempts
  persist on the scholar record; the legs do not.

### Ability churn strands progress generally

The use log shows ambush / animal_ken / patient_aim used daily through day 94
part 2, yet none is held at the end of day 94 — a level-up replacement cycled
them out in the last two parts. Any synergy whose legs include a churned-out
ability stalls until re-granted.

## Class size — 11 of 57 synergies have no trigger in ordinary play

Counted from `src/data/synergies.json` + `src/data/abilities.json` against
the trigger set above (activation / ambient / XP-tick / treat / synthetic).
A synergy counts when NO path (`requires` or any `requires_any` path) has a
triggerable leg:

| synergy | type | legs (no-trigger path) |
|---|---|---|
| critter_network | sustained | bird_whisperer, squirrel_friend |
| cornered_fury | simultaneous | adrenaline_control, cornered_rat |
| polyglots_ledger | sustained | translator, open_book |
| everybodys_friend | sequential | silver_tongue, gossip_network |
| farsight | sequential | eagle_eye, pathfinder |
| owl_hours | sustained | eagle_eye, night_eyes |
| tells | simultaneous | lie_detector, open_book |
| string_wall | sustained | evidence_board, eagle_eye |
| airtight | sequential | lie_detector, evidence_board |
| war_chest | sequential | deep_reserves, blood_magic |
| stand_together | sequential | draw_fire, shield_wall |

Rescued by the corrected trigger set (first-pass count of 17 was wrong):
closed_loop + master_of_flame (camp_cook XP-tick), field_pharmacy +
fevers_end + surgeons_calm (treat), rain_catcher (rain_dancer ambient note
on rain), one_person_army (requires_any path with usable legs / rage
ambient). Sequential synergies with a passive FIRST leg are NOT dead —
`otherResonant` covers the first leg when the second is used. 36/57
synergies have at least one passive-no-trigger leg, but only the 11 above
have no triggerable leg on any path.

Caveat, stated plainly: the 11 are not *logically* undiscoverable — the surge
focused-practice session can note any held ability. They are undiscoverable
in ordinary play: no activation, ambient event, XP tick, or treatment ever
notes their legs, and the one session that could never did in 94 days.

## Village assessment (plain words)

The scholar lived the full 94 days and the village was intact at the end —
this seed is not a survival story, it is a progression story. The scholar
collected five abilities and used two or three every day, but the game's
combination powers — the synergies that are supposed to reward holding the
right pair — never once fired. The pair the scholar actually held for the
endgame (the cornered-fighter pair) is one the game can never notice, because
neither half has a button to press and nothing in the world ever remarks on
either half. The fix is a design question, not a knob: how should a pair of
pure-passive abilities be discovered — a dawn resonance check, ambient notes
when the situation arises, or a different discovery shape? Filed as a finding
(sim-findings.md, 2026-11-11, synergies/discovery); NOT fixed in this run —
the blank's scope is the verdict.

## Scale wall (this run)

Single-seed diagnostic, not a panel: seed 20261011 survived the full 94d
horizon; no national / table / win read is available from it, and none is
claimed. The wall instrument this cycle is Loop A's survival-collapse
bisect (live). Telemetry deviation check: N/A — no per-seed panel corpus
from a diagnostic script (the tool refuses recorder corpora; a 1-seed
diagnostic has no baseline to compare).

## Metric review

No metric was re-scored mid-run. The prereg bar (script completes, verdict
with mechanism + class size) is met in full. The first-pass class count (17)
was corrected to 11 during the run after the ambient/XP/treat trigger paths
were enumerated from the code — the correction is recorded above, not hidden.
The script has no built-in pass/fail; the verdict is the deliverable, and
the blank ("re-run to a verdict or drop it") is closed by it.

## Proof

- `node scripts/test-synergy-stall.js` in worktree sim-synergystall-b (base
  d897eab1f): exit 0, 12s, output in
  `evidence/2026-11-11/synergystall-20261112.log`.
- Mechanism reads: `src/js/game.js` checkSynergyDiscovery (29469),
  noteAbilityUse (29418), _synergyPassiveLegHeld (29702), chooseAbility
  (25680), gainAbilityXP (26118); `src/js/progression.js:489` (surge
  focused practice); `src/js/app.js:15840-15842,16017` (treat: buttons).
- Class count: python over synergies.json + abilities.json against the
  enumerated trigger set (see §Class size). No game code changed; no test
  suite run is owed by a diagnostic re-run (no src/ touched).
