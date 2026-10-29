# sim-geartier-a — PREREGISTRATION (binding, committed BEFORE any judged run)

Run: gaps-gear arm, run geartier-20261029T0400Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: gaps-gear.
Assignment: GEAR-TIER + ABILITIES (Steve 2026-10-28 22:04: a better
tier of gear/abilities that is actually earnable, because there are
more and harder waves than 4; Steve 2026-10-28 22:29, folded into
this arm: abilities as a class don't feel impactful enough — a
general abilities-strength pass, not just the new tier).

## Canon read first

- docs/godpath/STEVE-ANSWERS.md (combat is not the only viable way
  to obtain good gear; sentimental items compete with accessory gear
  for the extra slots), docs/COHERENCE-SPINE.md (weapons & armor fade
  by waves 4-5 BY DESIGN, power moves to abilities; accessories
  acc1-acc4 are "actions and boosts, right now," mostly found/earned
  mid-to-late tier 3-4; keepsakes compete for the same slots),
  repo AGENTS.md (gear-changing-abilities least-frequent lever;
  control changes the board, not the numbers; abilities food-powered;
  dinner test; six System-ability slots; first ability magic given;
  human skills are NOT alien abilities).
- evidence/2026-10-28/sim-fieldability-a.md (ceiling table, verbatim
  numbers reused as the fixture-control anchor): machete+bow+arrows
  fed party 48.25 sustained DPR; 850-HP beast needs 17.6 rounds vs
  the 15-round cap; hunting-spear full damage-ability stack ~39.5;
  tricks are not damage; spear occupies the ranged slot; only
  alien-tier weapons (godslayer 65.75, worldbreaker 87.0) reach
  57-80. evidence/2026-10-28/sim-sortiedpr-a.md (mustered parties
  median 16.0 DPR; healthy beasts >= 91 HP: 0 kills in 12; wave-4
  sorties 0 kills / 0 drive-offs in 7).
- sim-w4dpr2 prereg (git show sim-w4dpr2:evidence/2026-10-29/
  sim-w4dpr2-prereg.md): band seeds 75101-75116, tableseat-nowait,
  judgedA universe (wave == 4, channel field, caller resolve/patrol/
  aid, leader not scholar). This arm does NOT duplicate that diag:
  no per-round parser, no decomposition. This arm is before/after
  (control vs armed on identical seeds) for a NEW action and a NEW
  item, which w4dpr2 does not build or judge.

## Phase 1 root cause (verified from code + corpora, not the brief)

1. APEX IS NOT EARNABLE IN THE WILD. Census of the committed
   fieldability-a (9 rows) + sortiedpr-a (auto 9 + played 17 rows)
   corpora: ZERO holdings of godslayer, worldbreaker, apex_bow,
   starfall, searcaster, phase_blade, beastcall_horn,
   warlords_standard, phase_shawl — 0 mentions in 35 seed-runs.
   Mechanism (src/js/game.js rollAlienLoot): monster kills roll ONLY
   alien-origin items, tier capped by the monster's loot tier.
   Wave-4 monsters carry loot tier 3 at 0.10-0.12 chance, so a
   wave-4 kill can NEVER roll tier 4. Tier 4 drops only from
   wave-1 apex gallowdeer (0.12), wave-2 apex moderator (0.12),
   wave-5 cancellation/editor/finale (0.10) — the hardest kills, or
   a wave-5 that is 0 everywhere — and even then the alien tier-4
   pool is just 4 items (fusion_cell, starfall_lance, genesis_seed,
   searcaster); godslayer/worldbreaker/apex_bow are NOT in it.
   They enter only through the rewardSource path (contest/trade/
   show pools, src/data/reward-economy.json extraItems['4']),
   where tier 4 additionally requires an extreme-risk contest AND
   apex standing (wave >= 4 or 8 wins or favor >= 100) AND a 0.25
   roll, then a 3-in-15 draw for a weapon. Trade caps at tier 3
   (tradesForTier [0,3,8]). Contest base tier caps at min(3,wave).
   So the tier-4 weapon path is: kill the hardest beasts, or win
   extreme contests at apex standing, then win a lottery — while
   the beasts that need the weapons (wave 4) cannot drop them.
   Circular, and the 0-holding census is the receipt.
2. ABILITIES FEEL WEAK IN FIELD FIGHTS BECAUSE THE STRONG-LOOKING
   VERBS ARE ONE-SHOT, TURN-CONSUMING, AND SMALL. Field verbs
   (src/js/godpath.js fieldAct) fire at most once per fight and
   replace the round's strike: bird_strike 8-12/round x3 (~30
   total, no blind in the field port though the card promises it),
   live_broadcast one extra ally strike (~4.5 total), mending_hands
   12-18 HP to the leader only (the ally, who draws 40% of hits,
   gets nothing). The damage-ability stack needs a six-ability
   godhood holder to reach the band (fieldability ~62.7) — the
   wild population does not hold it. The kcal costs are real
   (bird 60, broadcast 50, mending via abilityKcalCost) and
   food-gated (hunger gate 80, tier starving/tight blocks), so
   the verbs are honest but thin: one turn for ~30 damage or one
   4.5 strike is why they read as weak, not because they are
   absent. The pass therefore strengthens EXISTING verbs in
   board terms (see Design), never by inflating a multiplier,
   and never by adding a slot or a new ability.
3. SURVIVAL BINDS BEFORE DAMAGE. Wild wave-4 fights end by
   morale/death in ~3-6 rounds (incoming 35-95 raw, armor +
   pierce, leader HP 100, wound floor ~0.2-0.3, hopeless
   trajectory at round >= 2), not at the 15-round cap. A lever
   that only adds strike damage cannot move wild kills: even
   48.25 DPR deals ~150-290 in a lived fight, vs 850+ HP. Any
   honest kill movement must come through (a) damage per
   MEETING rising (wounded beasts persist to the next meeting:
   chainkill chains), and/or (b) the trajectory flipping to
   "winning" so the party commits instead of fleeing (fleeAt
   drops to 0.05 when winning). The snare below is designed for
   exactly those two mechanisms, and the prereg judges damage
   per meeting and rounds survived alongside kills — never
   fixture DPR alone (fieldability's metric-review warning:
   fixture DPR flatters one-shots).

## Design (frozen before building)

### (a) New earnable accessory: the Tangle Line

- DATA (src/data/items.json, one new item, all existing fields,
  no schema change): id `tangle_line`, name "Tangle Line", class
  `tool`, slot `acc` (competes for acc1-acc4 with keepsakes and
  every other accessory), lootTier 3, origin `alien`, kg 0.4,
  findable true. Flavor + baseEffect state the field-fight effect
  in plain words, so the effect is visible before it is used.
- ACTION (src/js/fieldFights.js only, keyed on the equipped acc
  item id — the file's existing per-id branch pattern; no new
  item field, no strike-formula change, no wb/power/mult change):
  once per fight, in the villager phase AFTER a trick or godpath
  verb has had its chance (tricks and verbs keep priority), if
  the leader wears the Tangle Line, round <= 11, lead HP > 150,
  and lead max HP >= 200 (big-beast tool, not a rabbit tool):
  the leader spends the round setting the line instead of
  striking (the ally still strikes that round, as on trick
  rounds). From the next round on, while the line holds (rest
  of the fight): (i) the tangled lead takes lroll([10,14])
  snare damage at the start of each villager phase, counted in
  rec.mDealt and logged (a NEW damage stream, like bird
  harry/pack harry — not a multiplier on any strike); (ii) the
  lead's attacks land at half strength (floor), logged (control,
  like the shout-disrupt halving — the beast still fights,
  still wounds, still kills). The line does NOT touch trickLog
  (no free trick-aware morale hold), break lines, flee lines,
  or the 15-round cap. Cost: the set round's strike + the acc
  slot, every fight it is worn. No kcal cost (it is gear, not
  an ability; the volley precedent is ammo, the snare is
  reusable line). Dinner test: it grants no food, reduces no
  food need, and cannot skip dinner.
- EARN PATHS (all pre-existing pools, zero gate retunes — adding
  an id to a pool is content, not a threshold change):
  (1) monster loot: alien tier-3 pool is automatic (origin
  alien + lootTier 3) — wave-2 tier-3, wave-3, and wave-4 kills
  can roll it (1 of 5 alien tier-3 items per tier-3 drop);
  (2) contest prizes + trader cart + show gifts: added to
  src/data/reward-economy.json extraItems['3'] (contest base
  tier reaches 3 at wave >= 3, trade reaches 3 at 8 trades,
  show gifts draw the hot tier-3 pool) — the non-combat routes
  Steve required, with no threshold touched.
  NOT a spawn item: genItemCandidates is NOT changed. Known
  leak, disclosed and censused: take('tool',2) is unfiltered,
  so the line can appear as a spawn candidate; it carries NO
  `tool:{}` object, so choosePersonalFive scores it ~0-10
  (vs keepsakes 1000, weapons bonus*10, tooled tools +50),
  and a stashed copy never auto-equips (gearUp fetches only
  weapons/armor from stash). P3 below counts only post-day-14
  holders, so a spawn holder cannot satisfy the earn leg.
- PERCEPTION LAW: the line is worn gear on the holder's own
  body, read from their own equipped slots (player: scholar
  equipped, same as wornDamage). No roster, no list, no
  tile-mate feed. It does not summon, join, or reveal anyone.
- TACTICAL SCOPE NOTE (disclosed, not hidden): the line's
  action is wired in field fights only — the wall this arm
  measures. In tactical combat it is currently an unworn
  effect (like several flavor accessories). Named here so the
  coordinator can scope a tactical follow-up, not claimed
  otherwise.

### (b) Abilities-strength pass (3 existing magic verbs, costs unchanged)

All three are System abilities (magic lane) already in
FIELD_IDS; no new ability, no new slot, no cost change, no
multiplier change. Each change is board-shaped:
1. BIRD_STRIKE (src/js/godpath.js fieldAct/fieldIncoming):
   while the birds harry (call round + 2), the beast's attacks
   miss 25% (birds in its eyes) — the card already promises
   a 20% blind in tactical; the field port had none. Damage
   stream unchanged (8-12/round x3).
2. LIVE_BROADCAST (fieldAct + fieldFights ally block): the
   ally fights louder for TWO rounds (one extra ally strike
   per round for 2 rounds) instead of one extra strike once.
   Same kcal, same turn, same once-per-fight gate.
3. MENDING_HANDS (fieldAct + fieldFights gpOut handling):
   the mend heals the fighting ally by the same amount when
   the ally is wounded (out.allyHp, capped at allyMax) —
   two bodies kept up, not one number. Same kcal, same turn.
Dinner test: none grants food or reduces need. Six slots:
untouched. First ability: untouched. Human skills: untouched
(all three are magic; no skill is promoted to an ability).

### Severability (pre-declared)

Snare and pass are separate commits, judged on separate legs
(snare: P1+P2+P3; pass: P4). Either may live or die alone.
If a leg fails, its code is killed (reverted, not shipped)
and only evidence remains — per kill discipline, a buff that
does not move outcomes does not land.

## Measurement (frozen before building)

INSTRUMENTS (new, scripts/ only, no policy defaults changed):
- scripts/test-geartier-a.js: fixture matrix on the
  fieldability pattern (sim-harness loadGame + setupGame,
  roster leader+ally, HP 100, armor kit, machete+bow+arrows,
  shout-join allies:1, mulberry rng, 5 seeds per cell).
  Cells: CONTROL (machete+bow) vs SNARE (same + tangle_line
  in acc, verified equipped after gearUp) vs BIRD / BROADCAST /
  MENDING (same kit + that one ability, no snare), each vs
  influencer 850 and audit 1100. Reports per cell: outcome,
  rounds, mDealt, vTaken, allyDealt, snareDamage, damage per
  meeting (= mDealt), DPR, kill/driveoff counts, plus one full
  transcript per changed cell for sense-testing.
- scripts/test-geartier-a-sweep.js: pilot sweep, seeds
  75101-75108, scripts/policies/tableseat-nowait.js VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware.
  TWO arms on identical seeds, same code, differing ONLY by
  a sweep-script-only wrapper (never a policy default):
  CONTROL-NATURAL (wrapper is read-only: records, at fight
  time, whether the leader already holds/wears tangle_line,
  and snapshots holders at day 7 and at end; it grants
  nothing, draws no RNG, changes no behavior) and ARMED-SAT
  (wrapper equips tangle_line on every fieldFight leader
  before the fight — saturation, measuring the ACTION's
  ceiling in the wild, not the earn rate; the grant is
  disclosed as a saturation instrument, never as game
  behavior). The wrapper records per field fight: mid, wave,
  caller/channel where the recorder carries them, outcome,
  rounds, mDealt, vTaken, snareSet, snareDamage, heldSnare.
  Judged universe U for wave-4 reporting: wave == 4, channel
  field, caller in {resolve, patrol, aid}, leader not scholar
  (w4dpr2 universe, verbatim). Control anchors also cited:
  fieldability judgedA 24 meetings / 0 kills, sortiedpr wave-4
  sorties 0/7 kills+driveoffs — but the JUDGED comparison is
  CONTROL-NATURAL vs ARMED-SAT on identical seeds, not
  anchor-vs-arm.
- No panel artifact: scripts/balance-panel.js has no
  census-ingest mode (standing §15 substitute, as in prior
  rounds). Identical-seed paired tables are the substitute;
  no panel artifact faked, no panel verdict claimed.

## Thresholds (GO = all legs of that item pass; a miss is NO-GO, never re-scored)

- P1 (snare fixture): SNARE damage per meeting (mean mDealt)
  >= CONTROL +30% AND median rounds >= CONTROL +1, pooled
  over both beasts (10 cells per arm). Both conditions.
- P2 (snare wild saturation): ARMED-SAT wave-4 judged-U field
  fights: mean damage per meeting >= CONTROL-NATURAL +25%
  AND median rounds >= control +1 AND kills+driveoffs >=
  control count (non-regression; any kill movement is upside,
  reported, not required — survival binds, see §root cause 3).
- P3 (natural earn): CONTROL-NATURAL across 8 seeds: >= 1
  villager FIRST observed holding tangle_line AFTER day 14
  (fight-time census or end inventory scan; day-7 snapshot
  holders are spawn candidates and do NOT count). If P3
  fails while P1+P2 pass, the verdict is ACTION-GO /
  EARN-NO-GO and the code is HELD (not merged) with the earn
  fix named — the action is not smuggled in on a failed earn.
- P4 (abilities pass): >= 2 of 3 fixtures improve on their
  named metric vs CONTROL (bird: vTaken/round down >= 10%
  or median rounds up >= 1; broadcast: allyDealt up >= 25%
  or median rounds up >= 1; mending: allyHpLeft up or
  median rounds up >= 1) AND none of the three regresses
  mDealt by > 10%.
- GUARDS (reported, not judged, except the crash rule):
  wall numbers (national ever/final, table invited/entered,
  wins incl. full seat, wave-4 reach, wave-5) per arm;
  death-cause shares; recorder errs/overflow must be 0;
  any crash, save corruption, or softlock = NO-GO outright.
- SENSE (law, not optional): >= 1 full snare fixture
  transcript quoted verbatim and judged as a played fight
  (does the line read as a thing used, with cost and effect,
  or as numbers?), >= 1 ability transcript quoted. A
  transcript that reads as numbers without a fight fails
  sense even if the numbers pass.
- GATING FREEZE: zero gate/threshold retunes anywhere in
  this arm. Any readiness-count movement is reported as a
  MEASURED consequence, never as a gate change.

## Confirm (only if pilot GO)

Pilot 8 seeds -> confirm 16 seeds (75101-75116), same arms,
same thresholds judged on the 16-seed set (fixtures stand
from pilot; confirm re-runs the fixture script for stability
and reports any drift). If confirm fails any leg, that leg's
code is killed and the pilot GO is withdrawn in the report.

## Files this arm will NOT touch

src/js/storage.js, src/js/villager-build.js,
src/js/villager-objectives.js, docs/MAP.md (other workers'
files — if the design needs them, STOP and report to the
coordinator instead of editing). No merge to master, no push,
no version bump, no live verification (coordinator line).
After changes: node scripts/check.js --quick with
--cacheDirectory=/tmp/jest-cache-gaps-gear. Never loosen an
assertion to go green. Evidence under evidence/2026-10-29/
(Oct 28 evening CDT = Oct 29 UTC). No /tmp outputs that must
survive.
