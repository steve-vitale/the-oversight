# sim-intraviol — intra-village violence census (2026-10-14)

## Pre-registration (MEASUREMENT.md §11 — written BEFORE running)

- **Primary metric**: villager-on-villager death share on the courtship road
  (victim = roster villager, killer = villager), plus the top killer→victim
  trigger contexts. This is a DIAGNOSTIC INSTRUMENT, not a lever: the bar is
  the instrument being proven, then the breakdown delivered.
- **GO threshold**: (1) instrument proven — synthetic RED test green,
  byte-identical gameplay check on 2 seeds (on vs off, state-hash equal),
  sabotage control proving the equality check is sensitive, full suite run on
  the 16-run census; (2) breakdown delivered — villager-kill share, top
  contexts, ONE named next-lever candidate with a concrete mechanism.
- **Horizon**: 180d death-aware (runDays stops at pop-zero; WIN-PATH HORIZON 180
  per Steve 2026-10-13). Why: the courtship road's long survivors are the ones
  that reach wave-4/5/table; intra-village violence accumulates late.
- **Seeds/policies**: 11,22,33,44,55,66,77,88 × leadcourt + belongseek
  (16 runs). Why these: the courtship-road reference set (wave5-confirm,
  tablerecon, plentyb all run this set); the justice/moot lane has no
  measurement on this road yet.
- **Anti-drift (§14)**: the metric binds. If the share comes back "unknown"-
  heavy, that is a NO-GO on the breakdown — the instrument gets fixed, the run
  is not re-scored against a friendlier reading.

## What was built

- `scripts/intraviol-census-20261014.js` — INSTRUMENT-ONLY census. Zero
  game-code changes; harness-side wrappers installed after loadGame:
  `Game.registerDeath` (records kind, who, cause, killerId, player flag,
  tbfight uprising/betrayal flags + fighter composition, justice stage,
  fight-scoped last-hitter), `Game.tbDamage` (last-hitter per villager fighter,
  scoped to the current fight object), `Game.say` (death-adjacent transcript,
  bounded 600). All wrappers are pure observers: no RNG consumed, no game
  state mutated, records live on script-owned `Game._intraviol*` (never in
  `Game.state`). Classifier: victim kind (villager / player-vessel /
  nonperson), killer kind (villager / monster / player-vessel / alien /
  rival-village / none / unknown), trigger context (betrayal-ambush, uprising,
  betrayal-fight, raid-offense/defense, party-split, contest, deprivation,
  disease, phoenix-link, monster, tb-combat, ...). Monster-cause resolution
  covers true names, `mdef.unknown` strange descriptors ("Loud-Eyes"), and
  village-agreed codex names. `player:true` tele records (9067410c) are
  excluded from the villager census.
- `scripts/test-intraviol-20261014.js` — proof test, 37 assertions, REAL RED
  phase (`--red`: INTRAVIOL_NOATTACH / INTRAVIOL_BROKEN_CLASSIFIER env hooks
  make every assertion fail by design; sabotage child proves the equality
  check is sensitive). Parts: A capture fidelity (synthetic registerDeath incl.
  double-death guard → 11 assertions), B byte-identical gameplay (2 seeds ×
  40d competent, off-vs-off control + on-vs-off, clock frozen — 6 assertions),
  C classification (16 synthetic records → exact tuples — 16 assertions).

## Results

**GO: instrument proven + breakdown delivered.**

- Proof: 37/37 GREEN (`--red` fails exactly as designed: RED-A 1, RED-C 16,
  sabotage-sensitive). Byte-identical: state hashes equal on seeds 11 and 33
  with the instrument on vs off (off-vs-off control also identical, ruling out
  RNG flakiness). Wall-clock is baked into game state by design (startedAt,
  runKey, tele t-stamps, Date.now().toString(36) id segments, pacing
  dayMinutes) — the proof freezes the clock so both runs see identical time;
  the sabotage control (RNG-consuming wrapper) still diverges hashes, proving
  sensitivity.
- Census: 16 runs (leadcourt/belongseek × 8), 180d death-aware, all 16 ended
  village-lost. **123 villager deaths, 0 villager-on-villager. vvShare = 0.**

## Breakdown (n=123 villager deaths, 16 runs)

| killer → context | n | notes |
|---|---|---|
| monster / monster | 41 | field/expedition kills incl. descriptor + village-named causes |
| none / disease | 37 | sickness |
| none / injuries | 24 | 'the wild', wounds that wouldn't close |
| none / deprivation | 13 | starvation, thirst |
| monster / tb-combat | 7 | 4 via fight-scoped lastHit, 3 inferred by fight composition (marked) |
| alien / alien-attack | 1 | alienPlayers persona |

- killerKind 'villager' fired 115× — **every single one against a nonperson
  victim** (villagers killing monsters: field fights, expeditions, patrols).
  Zero against villagers.
- player-vessel killers: 58 (all vs monsters/hostile NPCs — the scholar
  fighting, never murdering villagers in these runs).
- Unknowns: 1/342 records (a player-vessel expedition death — excluded from
  the census anyway). The classifier v1's 106 unknowns were closed honestly:
  'sickness' → disease, hurtVillager 'monster' label → monster, descriptors +
  villageNames → monster, stale-lastHit scoping bug fixed (a day-10 monster
  hit was misattributing a day-40 starvation death).
- Trigger contexts observed for lethal intra-village violence: **none**.
  Zero betrayal-ambush deaths, zero uprising deaths, zero moot executions,
  zero succession fights across 16 runs. The 16 "ambush" transcript mentions
  are all monster ambushes or the System's Ambush ability grant.

## The plentyb discrepancy

evidence/2026-10-13/sim-plenty-b.md reports 49/217 villager-on-villager on the
plentyb suite (leadcourt × 8 + leadfeast × 8). This instrument does NOT
replicate it: 0/178 across 24 runs (leadcourt/belongseek/leadfeast × 8).
A dedicated leadfeast × 8 re-run (FEASTSCALE_R13=1, same as plentyb): 55
villager deaths, vv=0. The feast road is not the difference.

Most likely explanation: the plentyb census classified player-vessel kills as
"villager-on-villager" (the scholar IS a roster villager; killerId = player
vessel id). This census counts 85 player-vessel kills across 24 runs — the
same order of magnitude as their 49 on a more combat-heavy suite. Their
classification method is not recorded in the evidence file, so this is an
inference, not a verification. The instrument
(scripts/intraviol-census-20261014.js, POLICIES env filter) re-runs on any
policy/seed set if someone wants to re-audit their exact runs.

## Village assessment

The villages look like villages under siege, not villages at war with
themselves. Death comes from outside (monsters 48, aliens 1) or from the body
and the sky (disease 37, injuries 24, hunger/thirst 13). The justice ladder
never reaches its lethal end on the courtship road: competent policies commit
no crimes, so no confrontations, no moots, no uprisings; NPC betrayal plots
never matured to a lethal ambush in 24 runs. The lethal justice content —
moot executions, theft-killings, succession fights — is decoration on this
road, not a path. Whether that is correct pacing (justice violence is rare by
design) or unreachable content is a design question, not a bug: the machinery
exists (justice.js stages, simNpcAmbush, uprising fights) but nothing in the
courtship sims feeds it.

## Sense-testing notes

Read the leadcourt s11 d18–32 transcript around 9 villager deaths. The beats
read as tragedy with consequences, not interchangeable death lines:
- "💀 The Hushpuppy killed Davut in 1 round. The village mourns." / "📖 The
  Codex turns a page on its own. Davut is dead. You didn't ask. It knew." /
  "◈ CRISIS — THE FIRST GRAVE. Davut is dead. The village digs its first
  grave, and everyone understands at once: this place can kill you."
- Disease deaths move the diplomacy layer: "🕯️ Zoe is dead — and the dead
  hold no treaties. Every link Haven has shakes." / "Thornfield watches to see
  if Haven holds without its dead."
- Raids read as raids; the moot-call beats read as open questions.
- No moot-execution or theft-killing lines exist to sense-read — the content
  never fired. A moot execution cannot be judged as justice vs theater until
  a run actually produces one.

## Metric review

- The pre-registered breakdown bar is met: share 0/123 with 1/342 unknowns
  (0 affecting the VV count). No goalpost movement: the v1 classifier's
  106 unknowns were fixed in the instrument (v2: descriptors, sickness,
  fight-scoped lastHit), not re-scored.
- The byte-identical proof needed one honest correction mid-build: the first
  GREEN attempt failed because game state is wall-clock-contaminated by
  design (startedAt, tele t-stamps, Date.now id segments, pacing dayMinutes)
  — off-vs-off differed too. The proof now freezes the clock for both runs;
  documented in the test header. This is a test-design fix, not a metric
  change.
- Open metric question for the next run: if a future policy DOES produce
  villager-on-villager deaths, the current context taxonomy (betrayal-ambush,
  uprising, betrayal-fight, succession — currently unobserved) is ready but
  untested against real data. The instrument, not the metric, will need the
  workout.

## Blanks filled / documented

- FILLED: the intra-village violence measurement blank (sim-findings.md
  2026-10-13 justice/violence item — "whether this is theft-punishment,
  succession violence, or a bug is unmeasured"). Measured: on the courtship
  road it is NONE OF THE ABOVE — 0/178 across 24 runs. The lethal justice
  lane does not fire in sims.
- DOCUMENTED: (a) the plentyb 49/217 non-replication + likely explanation
  (player-vessel kills counted as villager); (b) stale-lastHit attribution
  bug class — any tbDamage-based kill attribution must scope to the fight
  object, else old hits misattribute later deaths; (c) monster death causes
  use THREE name forms (true name, mdef.unknown descriptor, village-agreed
  codex name) — classifiers must resolve all three.

## Wall numbers

national 3/16 · table 0/16 · wins 0/16 · wave-4+ unlocks 5/16 · wave-5 0/16 ·
median survival 65d · max 165d · all 16 village-lost. (Scale wall still
blocking; the violence census is not the binding constraint.)

## Convergence

diagnostic — no lever, no convergence claim. State: instrument proven
(37/37, real RED), census delivered (16+8 runs), backlog item's measurement
gap closed.
