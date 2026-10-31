# sim-partyvolley-b — PRE-REGISTRATION (written BEFORE any judged sims)

Run: Loop B, oversight-flesh-out-loop-b, axis scale-onramp, arm
sim-partyvolley-b. Worktree branch: sim-partyvolley-b.
Base anchor: recorded by the fixture script in every corpus file
(worktree HEAD at run time; volleyfix base was 7a2974684 — this arm
re-anchors itself and does not assume the volleyfix tree).
Substrate: FORCED-MEETING FIXTURE BAND through the real
Game.fieldFight, not a live sim band. This is the volleyfix next
question (evidence/2026-10-31/sim-volleyfix-b.md, "Blanks found"):
does a volley matter inside a 3-fighter, armored, multi-round
wave-4 fight — the wave-4 demand shape (Steve 2026-10-28: parties,
fully geared, only when ready)? DIAG ONLY: zero src/js, zero
policy-default flips, zero edits to existing policy files.

## What prior work already settled (reconciliation, not re-proof)

- sim-volleyfix-b (2026-10-31): lone fighter, ammo ON, 128 confirm
  fights: volley always fires (100%), median volley damage 21.5
  (2.0% of beast HP), median total fight damage 35.5, median
  rounds 1, kills/drive-offs 0/128 in BOTH arms. The lone-fighter
  ceiling this arm measures against.
- Backlog #1369 (tile-present party yardstick): machete+bow leader
  48.25 sustained + 2 allies 9.0 = 57.25; cap-fit needs ~57-80
  sustained DPR. This arm measures its own sustained DPR and
  compares it to that yardstick; it does NOT re-derive #1369.
- Backlog #1383 (sortie DPR median 16.0, healthy beasts 0 kills):
  the live-sortie context — sorties do not kill healthy wave-4
  beasts either. This fixture asks whether the demand shape
  (party + best earnable gear + ammo) does any better.
- Backlog #1370: the hunting spear occupies the ranged slot and
  drops the bow, so spear+bow does NOT stack. This arm PROVES
  that in-fixture (SPEAR variant) instead of assuming it.

## Engine facts the design rests on (read from src/js, not assumed)

- fieldFight stages at most ONE ally from the start: opts.allies
  + opts.allyVids (sliced to 2), but only allyFromStart shifts
  ONE allyVid in before round 1 (fieldFights.js ~907). A second
  staged ally can enter ONLY via the hopeless-shout branch
  (round >= 2, intent != learn; party intent is engage, so the
  branch is open). "3 fighters" in this arm therefore means
  leader + from-start ally + shout-reserve ally, and the rate at
  which the third fighter actually enters is itself a measured
  quantity (shoutJoined), not a staging given.
- Ally strikes are flat lroll([3,6]) per round (fieldFights.js
  ~1482), independent of anything the ally carries; ally hits
  take NO leader-armor absorption (the armor block applies only
  to leader hits) and the ally draws ~40% of monster hits.
  Consequence, stated up front: varying ALLY gear is a null
  manipulation in this engine, so allies carry no gear in any
  variant and ally gear is NOT a varied factor. The varied
  factors are party size (1/2/3 staged) and LEADER gear tier.
- Leader strike is lroll([4+wb, 8+wb]) with wb =
  round((meleeBonus + rangedBonus)/2). Machete (melee +35) + bow
  (ranged +18) gives wb = round(26.5) = 27, strikes [31,35].
  Machete (range 1) sits in the melee slot and bow in the ranged
  slot (equipment.js weapon_split), so the dual config stacks;
  hunting spear (range 2) sits in the ranged slot, so it
  competes with the bow there — the SPEAR variant tests which
  one autoEquip actually equips.
- Leader armor absorbs via r = effP/(effP+20) with pierce
  reducing effP (wave-4 pierce 0.25-0.40). Bark P10, hide P20.
- MAX_ROUNDS = 15. Morale: learn-intent fighters withdraw at
  round >= 3 when not winning; party (engage) fighters shout or
  flee when hopeless. Volley can end a fight at rounds = 0.

## The fixture band

One harness load (scripts/sim-harness.js loadGame + setupGame,
seed 4242 — the volleyfix fixture seed, so the roster is the
same shape prior fixture work used). Three roster NPC fighters
(leader + up to 2 allies), fixed before every fight: age 35,
temperament steady, health 100. Before EVERY fight the script
restores: each staged villager's record in place, the FULL
Game.state from a deep snapshot (this freezes the volleyfix
caveat-2 drift: trick observations, villageCounterObs,
villagerTricks, villagePatterns, bonds, deeds, wounds — nothing
accumulates across fights, so the P1-BOW control stays
learn-first and every fight starts from identical state), and
exactly the fixture gear per variant. Each fight calls the REAL
Game.fieldFight with a fresh beast entity { hp: midpoint,
maxHp: midpoint } (same midpoints as volleyfix: congregation
1000, influencer 950, eater 1050, audit 1200, algorithm 1100),
no awareness (forced meeting, as volleyfix), opts.rng =
mulberry32(stream) shared across a variant's party-size/gear
ladder only in the sense that each fight gets its stream id —
party-size comparisons are NOT identical-stream pairs (the
party changes draw counts by construction); the comparison is
band-to-band on identical stream SETS, and the in-band P1-BOW
control is the lone ceiling re-measured on this tree.

Gear tiers (leader only; allies unarmed, see above):
- BOW: crude_bow + 8 arrows, no melee weapon, no armor.
- DUAL: machete + crude_bow + 8 arrows, no armor.
- BARK: DUAL + bark_armor.
- HIDE: DUAL + hide_armor.
- XBOW: machete + crossbow + 8 bolts + hide_armor (best ranged
  at top armor; tests whether the strongest volley changes
  anything at party scale).
- SPEAR: hunting_spear + crude_bow + 8 arrows + hide_armor
  (the #1370 slot-conflict proof: record equipped ranged
  weapon post-fight and volley shots; expected spear wins the
  ranged slot and the volley is 0 shots — reported as measured,
  not assumed).
Ammo is ON in every variant (8 units, above the 4-shot volley
cap). No variant is ammo-OFF: volleyfix already owns that
control.

Party staging: P1 = allies 0, no allyVids. P2 = allies 1,
allyVids [A1], allyFromStart true. P3 = allies 2, allyVids
[A1, A2], allyFromStart true (A1 from start, A2 shout-reserve).

## Staged plan

PILOT (8 fixture variants, before any confirm spend):
P1-BOW x congregation, P1-DUAL x congregation, P2-DUAL x
congregation, P3-DUAL x congregation, P3-HIDE x congregation,
P3-DUAL x eater, P3-HIDE x eater, P3-HIDE x audit.
Each variant x 4 rng streams (101-104): 32 fights.
Pilot gate (on the P3 pilot subset: 5 variants x 4 = 20 fights,
plus the mechanism check): run the confirm ONLY if ALL of G1-G3
pass. If any misses, stop: verdict killed-at-pilot /
DIAG-NO-GO, no confirm, no re-score.
- G1 (mechanism): from-start ally actually joins on >= 90% of
  P3 pilot fights (log line "already at the door").
- G2: P3 pilot median rounds >= 3 (lone confirm median was 1).
- G3: P3 pilot median total damage >= 71 (2x the volleyfix lone
  confirm median of 35.5).

CONFIRM (41 fixture variants, if the pilot passes):
- Size ladder, DUAL gear: P1-DUAL, P2-DUAL, P3-DUAL x 5 beasts
  = 15 variants.
- Gear ladder at P3: P3-BOW, P3-BARK, P3-HIDE x 5 beasts = 15
  variants (P3-DUAL counted in the size ladder).
- Lone control: P1-BOW x 5 beasts = 5 variants.
- Top ranged: P3-XBOW x 5 beasts = 5 variants.
- Slot proof: P3-SPEAR x congregation = 1 variant.
Each variant x 8 rng streams (201-208): 328 fights.
The confirm verdict is judged on the CONFIRM sample alone
(pilot numbers reported separately, never pooled).

DETERMINISM GATE (binding, both stages): the fixture script run
twice produces byte-identical corpus files (no timestamps or
timings written). A det-gate failure voids the run, whatever
the damage numbers say.

## Pre-registered GO thresholds (judged exactly as written)

PRIMARY (all three prongs must pass, on the confirm sample):
- P1: P3-HIDE confirm median total damage (mDealt) >= 2x the
  P1-BOW in-band confirm median total damage.
- P2: P3-HIDE confirm median rounds >= 3.
- P3: from-start ally joins on >= 90% of all P3 confirm fights.
Verdict DIAG-GO iff P1, P2, P3 all pass AND the det-gate passes.
Verdict DIAG-NO-GO iff any prong misses (a miss is NO-GO, never
re-scored against a friendlier metric mid-run; doubts go under
"metric review" for the NEXT run). Killed-at-pilot if the pilot
gate misses (no confirm run).

SECONDARY (reported, never promoted to judge):
- Kill/drive-off rate (vKill + mFlee) per band and for P3-HIDE
  specifically. A zero is reported as zero, not explained away
  (volleyfix metric-review rule 1).
- Median sustained DPR = median over fights with rounds >= 1
  of (mDealt / rounds), per band, compared to the #1369
  yardstick 57.25 and the 57-80 cap-fit band. Fights ending on
  the volley (rounds = 0) are excluded from the DPR median but
  counted in damage and outcomes.
- Party-size ladder: median total damage, median rounds,
  kill/drive-off rate at fixed DUAL gear for P1/P2/P3.
- Gear ladder at P3: BOW / DUAL / BARK / HIDE medians.
- XBOW vs HIDE at P3 (does the strongest volley matter at
  party scale?).
- SPEAR proof: equipped ranged weapon + volley shots on all 8
  spear fights.
- Survival: vDie / vFlee mix, leader vHpLeft, ally down rate,
  allyDealt share of total, third-fighter entry rate
  (shoutJoined on P3 fights), per-beast breakdown.

## Per-fight record

Party size staged, gear tier, beast, beast start HP, stream,
equipped melee/ranged/armor ids post-fight (proves the dual
equip and the spear slot outcome), volley shots/hits/damage,
leaderDealt (= mDealt - volleyDmg - allyDealt), allyDealt,
total damage, rounds, sustained DPR, outcome, intent,
fromStartJoined, shoutJoined, vTaken, vHpLeft, allyTaken,
allyHpLeft, and the full log for every fight (sense-testing
reads at least one party-fight transcript in full).

## Horizon, policies, wall numbers

- Horizon: NOT APPLICABLE. Fixture fights are not sim days.
- Policies: NONE. No policy drives a fixture fighter.
- Wall numbers (national / table / wins / wave reach): NOT
  OBSERVABLE on this substrate, stated structurally, not as 0s.
  A fixture band has no village trajectory, no scale ladder,
  and no win flag. The wall relevance is the bound this band
  establishes: what party + best earnable gear + ammo adds on
  top of the volleyfix lone ceiling, measured through the real
  fight engine.
- Caveat, stated up front: the fixture day is day 0, so the
  post-day-7 +0.08 hold bonus does NOT apply. Direction is
  conservative (real wave-4 fights hold slightly longer); it
  cannot manufacture kills.

## Panel (§15)

NOT APPLICABLE, and none fabricated. scripts/balance-panel.js is
a policy-comparison driver: it runs registry policies on ONE
frozen root and compares panel outputs. It cannot express this
arm's substrate (a forced-meeting fixture band with no policy,
no sim days, and a party-size/gear ladder as the comparison)
and it has no fixture mechanism. The judge is the pre-registered
fixture comparison + determinism gate above (same rationale as
sim-volleyfix-b / sim-ammo-a).

## Sense-testing

Read at least one full P3 party-fight transcript and judge
whether the party fight reads as people fighting together
(allies named, strikes accounted for, shout/reserve entry
honest, no ghost fighters), not just counts.

## Metric review (for the NEXT run, never a re-score of this one)

Doubts about the metrics above go here in the evidence file
after the run; they do not change this run's verdict.
