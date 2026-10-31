# sim-spearxbow-a — PRE-REGISTRATION (written BEFORE any judged sims)

Run: Loop A, oversight-flesh-out-loop, run fleshout-20261031T0915Z,
axis scale-onramp, arm sim-spearxbow-a. Worktree branch: sim-spearxbow-a.
Base anchor: recorded by the fixture script in every corpus file
(worktree HEAD at run time; this arm re-anchors itself and does not
assume the partyvolley-b tree).
Substrate: FORCED-MEETING FIXTURE BAND through the real
Game.fieldFight, not a live sim band. DIAG ONLY: zero src/js, zero
policy-default flips, zero edits to existing policy files.

## What prior work already settled (reconciliation, not re-proof)

- sim-volleyfix-b (2026-10-31, DIAG-GO): lone fighter, ammo ON, 128
  confirm fights: volley always fires (100%), median volley 21.5.
  Per weapon (confirm ON medians): crossbow 38.0 > sling 19.0 >
  bow 17.0. Zero kills/drive-offs in either arm. The volley
  ranking this arm confirms at party scale is XBOW > SLING > BOW.
- sim-partyvolley-b (2026-10-31, KILLED AT PILOT): party + best
  gear doubles lone damage (P3 pilot median total 79.5 vs lone
  35.5) but median rounds 2 < 3, 0 kills/drive-offs, and the
  3-fighter shape is UNFIELDABLE: allyFromStart sets helpCalled
  = true (fieldFights.js ~907) while the hopeless-shout branch
  requires !helpCalled (~1588), so shoutJoined was 0/24 on
  from-start fights and P2-DUAL == P3-DUAL on every stream. Its
  preregistered P3-SPEAR and P3-XBOW confirm variants never ran
  a single fight. This arm runs their fieldable equivalents.
- Backlog #1370 (via partyvolley-b prereg): the hunting spear
  occupies the ranged slot and drops the bow, so spear+bow does
  NOT stack. This arm PROVES that in-fixture instead of
  assuming it.

## Engine facts the design rests on (read from src/js, not assumed)

- fieldFight fields at most leader + 1 ally: allyFromStart shifts
  ONE allyVid in before round 1 and sets helpCalled = true; the
  hopeless-shout branch requires !helpCalled, so a second staged
  ally can NEVER enter a from-start fight. This arm therefore
  stages P2 (leader + 1 from-start ally) as its party shape —
  the largest party fieldFight can actually field — and does NOT
  stage a ghost third fighter. The P3→P2 change from the
  partyvolley-b prereg is forced by the engine cap, stated here
  up front; the slot question and the volley ranking do not
  depend on party size (volley fires before round 1, ally
  strikes are flat and gear-independent — see below).
- Volley (fieldFights.js ~730-796): rangedWeaponOf + weapon.ammo
  required; shots = min(ammo, clamp(1+floor(range/speed),1,4));
  hit 0.85-0.06*range; damage lroll([4+wbR, 8+wbR]),
  wbR = round(rangedBonus/2). A weapon with NO ammo field gets
  NO volley: rec.volley stays null.
- Weapon defs (src/data/items.json, weapon sub-object):
  crude_bow bonus 18, range 5, ammo arrow; crossbow bonus 28,
  range 6, ammo bolt; sling bonus 8, range 4, ammo stone;
  hunting_spear bonus 30, range 2, type melee, NO ammo field;
  machete bonus 35, range 1, type melee.
- Slot rule (src/js/equipment.js isRangedWeapon/slotForItem):
  range > 1 or bow/sling name -> ranged slot; one item per slot
  (autoEquip). Hunting spear (range 2) therefore maps to the
  RANGED slot and competes with the bow there, even though its
  weapon type is melee. Consequence, predicted here and measured
  in-fixture: a spear+bow inventory equips the spear (higher
  ranged-slot equipScore: bonus 30 vs 18) in the ranged slot,
  the bow is unequipped, and the volley is null (spear has no
  ammo) despite 8 arrows in hand.
- Ally strikes are flat lroll([3,6]) per round (fieldFights.js
  ~1482), independent of anything the ally carries; ally hits
  take NO leader-armor absorption. Varying ALLY gear is a null
  manipulation in this engine, so allies carry no gear in the
  leader-tier variants. The ally-spear secondary variant tests
  exactly that null (see below) rather than assuming it.
- Leader strike is lroll([4+wb, 8+wb]) with wb =
  round((meleeBonus + rangedBonus)/2). All four leader tiers
  below share machete (melee +35) + hide_armor, so the ONLY
  varied factor is the ranged-slot contents — the ranking is a
  clean ranged-slot comparison, not a melee confound. (Deviation
  from partyvolley-b's SPEAR tier, which omitted the machete:
  omitting it would confound the slot comparison with a missing
  melee weapon. The slot question — which item autoEquip puts
  in the ranged slot — is identical either way, and equipped
  melee/ranged ids are recorded post-fight to prove it.)
- MAX_ROUNDS = 15. Beast midpoints (as volleyfix/partyvolley):
  congregation 1000 (speed 2), eater 1050 (speed 4), audit 1200
  (speed 2). Volley shots by weapon x beast speed follow the
  formula above: bow 3/2, crossbow 4/2, sling 3/2 shots
  (congregation-audit / eater).

## Sensed channel (perception law, standing Steve 2026-10-28)

Staged allies arrive through ONE channel the code actually
provides, named per fixture: CO-PRESENCE AT THE MEETING.
The from-start ally is a co-traveling party member already at
the meeting site — engine log line "already at the door —
charges in" (AID, comms 2026-10-10: "allied parties already at
the door join from round 1"). The fixture stages a party that
traveled together; it does NOT consult a roster or "who is
around" list to pick an ally mid-fight, and no list-fed
decision is used anywhere in this arm. The shout channel
(hearing a shout for help) is NOT used: as wired it cannot
fire in a from-start fight (helpCalled already true), so no
fixture pretends a shouted ally arrives. If a variant needed
a shouted ally it would be reported BLOCKED, not staged
around.

## The fixture band

One harness load (scripts/sim-harness.js loadGame + setupGame,
seed 4242 — the volleyfix/partyvolley fixture seed, so the
roster is the same shape prior fixture work used). Two roster
NPC fighters (leader + 1 ally), fixed before every fight: age
35, temperament steady, health 100. Before EVERY fight the
script restores: each staged villager's record in place, the
FULL Game.state from a deep snapshot (the partyvolley-b
pattern: trick observations, villageCounterObs, villagerTricks,
villagePatterns, bonds, deeds, wounds — nothing accumulates
across fights), and exactly the fixture gear per variant.
Each fight calls the REAL Game.fieldFight with a fresh beast
entity { hp: midpoint, maxHp: midpoint }, no awareness
(forced meeting), opts.rng = mulberry32(stream), opts.allies
= 1, opts.allyVids = [A1], opts.allyFromStart = true.

Leader tiers (P2, hide_armor in every tier; allies unarmed
except the ALLY-SPEAR secondary):
- BOW: machete + crude_bow + 8 arrows + hide_armor.
- XBOW: machete + crossbow + 8 bolts + hide_armor.
- SLING: machete + sling + 8 stones + hide_armor.
- SPEAR: machete + hunting_spear + crude_bow + 8 arrows +
  hide_armor (the #1370 slot-conflict proof: record equipped
  ranged weapon post-fight and volley shots; expected spear
  wins the ranged slot and the volley is null/0 shots —
  reported as measured, not assumed).
Secondary variant (reported, never promoted to judge):
- ALLY-SPEAR: leader BOW tier, ally carries hunting_spear
  (ally items = [hunting_spear]) — tests whether ally gear
  changes anything (engine says flat strikes: predicted null).

## Staged plan

PILOT (4 leader tiers x congregation, 4 rng streams 101-104
= 16 fights, plus ALLY-SPEAR x congregation x 4 streams = 4
fights; 20 pilot fights total). Pilot gate (all must pass,
else stop: killed-at-pilot, no confirm, no re-score):
- M1 (mechanism): from-start ally joins on >= 90% of pilot
  fights (log line "already at the door").
- M2 (mechanism): XBOW pilot volley shots > 0 on 4/4 fights
  (the volley instrument works at party scale).
- M3 (mechanism): SPEAR pilot equippedRanged == hunting_spear
  on 4/4 fights (the slot instrument resolves; if autoEquip
  picks the bow instead, the slot proof fails at the gate and
  the confirm still runs only if the gate is re-read honestly
  — no: M3 is binding, a miss stops the run, because a
  bow-equipped SPEAR tier would not be a spear test at all).
CONFIRM (if the pilot gate passes; judged on the confirm
sample alone, pilot numbers reported separately, never
pooled): 4 leader tiers x 3 beasts (congregation, eater,
audit) x 12 rng streams (201-212) = 144 fights, plus
ALLY-SPEAR x congregation x 12 streams = 12 fights; 156
confirm fights total.

DETERMINISM GATE (binding, both stages): the fixture script
run twice produces byte-identical corpus files (no timestamps
or timings written). A det-gate failure voids the run,
whatever the damage numbers say.

## Pre-registered GO thresholds (judged exactly as written)

SPEAR variant — GO iff S1 AND S2 pass on the confirm sample:
- S1: equippedRanged == hunting_spear on >= 90% of confirm
  SPEAR fights (>= 33/36).
- S2: volley shots == 0 or volley null on >= 90% of confirm
  SPEAR fights (>= 33/36), despite crude_bow + 8 arrows in
  inventory.
SPEAR ranking (reported, never promoted to judge): median
volley damage and median total damage per tier, pooled
across the 3 beasts and per beast, ranked BOW / XBOW / SLING /
SPEAR. A spear total-damage rank is descriptive — the slot
proof is S1+S2, not a damage win.

XBOW variant — GO (ranking confirmed) iff X1 AND X2 pass on
the confirm sample:
- X1: XBOW median volley damage ranks #1 among the four
  tiers (pooled 3-beast band): XBOW > BOW, XBOW > SLING,
  XBOW > SPEAR.
- X2: XBOW median total damage >= BOW median total damage
  (pooled 3-beast band) — the strongest volley must not lose
  the fight on total damage to the bow.
Verdict per variant judged independently: SPEAR GO/NO-GO,
XBOW GO/NO-GO, plus the determinism gate. A miss is NO-GO,
never re-scored against a friendlier metric mid-run; doubts
go under "metric review" for the NEXT run.

SECONDARY (reported, never promoted to judge):
- Kill/drive-off rate (vKill + mFlee) per tier and overall.
  A zero is reported as zero, not explained away.
- Median sustained DPR = median over fights with rounds >= 1
  of (totalDmg / rounds), per tier, compared to the #1369
  yardstick 57.25 and the 57-80 cap-fit band (same-instrument
  caveat as partyvolley-b: fixture forced meetings, not live
  sorties).
- Survival: vDie / vFlee mix, leader vHpLeft, ally down rate,
  allyDealt share of total, from-start join rate, per-beast
  breakdown.
- ALLY-SPEAR: median allyDealt and median total damage vs the
  BOW-tier confirm band on congregation; a null (no material
  difference) confirms the engine's flat-ally-strike reading.

## Per-fight record

Party size staged, tier, beast, beast start HP, stream,
equipped melee/ranged/torso ids post-fight (proves the dual
equip and the spear slot outcome), volley shots/hits/damage
(null preserved as null, never coerced to 0 in the record —
the summary treats null as 0 shots for the S2 count and says
so), allyDealt, total damage, leaderDealt (= total - volley -
ally), rounds, sustained DPR, outcome, intent, fromStartJoined,
shoutJoined, vTaken, vHpLeft, allyTaken, allyHpLeft, mHpLeft,
and the full log for every fight (sense-testing reads at
least one party-fight transcript in full, plus one SPEAR
transcript).

## Horizon, policies, wall numbers

- Horizon: NOT APPLICABLE. Fixture fights are not sim days.
- Policies: NONE. No policy drives a fixture fighter.
- Wall numbers (national / table / wins / wave reach): NOT
  OBSERVABLE on this substrate, stated structurally, not as 0s.
  A fixture band has no village trajectory, no scale ladder,
  and no win flag. The wall relevance is the bound this band
  establishes: which ranged slot actually fires at party scale
  and whether the crossbow top survives the party-scale
  re-measurement.
- Caveat, stated up front: the fixture day is day 0, so the
  post-day-7 +0.08 hold bonus does NOT apply. Direction is
  conservative (real wave-4 fights hold slightly longer); it
  cannot manufacture kills, and it cannot change a slot
  outcome or a volley ranking.

## Panel (§15)

NOT APPLICABLE, and none fabricated. scripts/balance-panel.js
is a policy-comparison driver: it runs registry policies on
ONE frozen root and compares panel outputs. It cannot express
this arm's substrate (a forced-meeting fixture band with no
policy, no sim days, and a ranged-slot ladder as the
comparison) and it has no fixture mechanism. The judge is the
pre-registered fixture comparison + determinism gate above
(same rationale as sim-volleyfix-b / sim-partyvolley-b).

## Sense-testing

Read at least one full P2 party-fight transcript and one full
SPEAR transcript and judge whether the fight reads as people
fighting together (ally named and entering through the
co-presence channel, strikes accounted for, volley lines
honest about the weapon actually loosed, no ghost fighters),
not just counts.

## Metric review (for the NEXT run, never a re-score of this one)

Doubts about the metrics above go here in the evidence file
after the run; they do not change this run's verdict.
