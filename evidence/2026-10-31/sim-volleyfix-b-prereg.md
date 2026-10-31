# sim-volleyfix-b — PRE-REGISTRATION (written BEFORE any judged sims)

Run: Loop B, oversight-flesh-out-loop-b, axis scale-onramp, arm
sim-volleyfix-b. Worktree branch: sim-volleyfix-b.
Base anchor: 7a297468408c669d6417eda0af1fb95135ec191a (worktree HEAD
at prereg time; the fixture script records its own anchorCommit in
every corpus file).
Substrate: FORCED-MEETING FIXTURE BAND, not a live sim band. This is
the divergence-proof measurement named as the next blank by
sim-ammo-a (evidence/2026-10-31/sim-ammo-a.md): identical-seed
before/after wave-4 comparisons are destroyed by trajectory
divergence, so the volley question is answered on fixtures where
the ONLY difference between a pair is ammo on hand.

## What prior work already settled (reconciliation, not re-proof)

- sim-volley-a (2026-10-26): the volley engine is intact.
- sim-w4field-a (2026-10-30): 0/27 wave-4 field kills, median damage
  0.7% of beast HP, 14 ranged fights all firing 0 volley shots.
- sim-ammo-a Stage 1 (2026-10-31): wave-4 field fighters who fight
  dry NEVER departed (0 departures, 0 pocket calls on 14/14 dry
  fights), so departure-only pocketing cannot reach them.
- sim-ammo-a Stage 2 (2026-10-31): the dawn home top-up lever was
  killed NO-GO because trajectory divergence emptied the lever
  corpus of ranged wave-4 fights (0/0).
- This arm does NOT re-prove pocketing reach, the volley engine, or
  any lever. Its question is narrow: when a ranged fighter DOES
  have ammo in hand against a wave-4 beast through the real
  fieldFight path, how much damage does the volley actually do,
  and can it change a fight outcome?

## The fixture band

One harness load (scripts/sim-harness.js loadGame + setupGame,
seed 4242 — the blitz-combatstats fixture seed, so the roster is
the same shape prior fixture work used). One roster NPC fighter,
fixed before every fight: age 35, temperament steady, health 100,
no armor, no melee weapon, no abilities recorded at fixture time
(the script records whatever abilities the chosen villager holds;
day-0 roster villagers are expected to hold none, and any held
ability is reported, not stripped). Before EVERY fight the script
resets health to 100, items to exactly the fixture gear, and
equipped to empty (fieldFight's own villagerGearUp then equips
the carried weapon, exactly as in a real fight entry).

Each fixture fight calls the REAL Game.fieldFight(vid, mdef, m,
{ rng }) — no stubbed damage table, no outcome roll. Forcing is
only in the meeting, never in the blows:
- m is a fresh entity { hp: X, maxHp: X } with X = the midpoint
  of the beast's hp range, so beast HP and damage fractions are
  exact (not the m=null rolled-HP estimate) and identical across
  each ON/OFF pair.
- opts.awareness is NOT set, so no evade exit: the meeting is
  forced, as the task specifies. Evade rate is therefore NOT a
  measured quantity here (wild fights can still evade; that is a
  separate, already-measured channel).
- opts.rng is an explicit mulberry32 stream, so each ON/OFF pair
  shares one stream and differs ONLY in ammo on hand.
- No allies (solo, the w4field lone-fighter population), no
  party, no bravery bonus.

Weapons (all via rangedWeaponOf + the volley code's own ammo id):
- bow (crude_bow, bonus 18, range 5, ammo arrow)
- sling (bonus 8, range 4, ammo stone)
- crossbow (bonus 28, range 6, ammo bolt)
ON gear: weapon + 8 units of its ammo (above every volley's max
shots, so shots are never ammo-capped). OFF gear (the no-ammo
control): the same weapon + 0 ammo — identical melee fold-in,
volley impossible. Any ON/OFF difference is purely the volley.

Beasts (wave 4, MONSTER-WAVES.md bands HP 850-1500, damage
35-95): congregation (hp midpoint 1000, speed 2), influencer
(950, speed 3), eater (1050, speed 4), audit (1200, speed 2),
algorithm (1100, speed 3). Expected volley shots from the engine
formula min(ammo, clamp(1+floor(range/speed),1,4)): bow 3/2/2/3/2,
sling 3/2/2/3/2, crossbow 4/3/2/4/3 across those five beasts.

## Staged plan

PILOT (8 fixture variants, before any confirm spend): bow and
sling x congregation, influencer, eater, audit. Each variant x
4 rng streams (101-104): 32 ON fights + 32 paired OFF fights.
Pilot gate: run the confirm ONLY if the pilot meets the primary
thresholds below on the pilot sample. If the pilot misses, stop:
verdict DIAG-NO-GO, no confirm, no re-score.

CONFIRM (16 fixture variants, if the pilot passes): all 3 weapons
x all 5 beasts (15 variants) + bow x congregation with 1 ammo
unit (the ammo-scarce edge: shots capped at 1). Each variant x
8 rng streams (201-208): 128 ON fights + 128 paired OFF fights.
The confirm verdict is judged on the CONFIRM sample alone
(pilot numbers are reported separately, never pooled into the
confirm verdict, so the gate cannot inflate the result).

DETERMINISM GATE (binding, both stages): the fixture script run
twice produces byte-identical corpus files (no timestamps or
timings are written). A det-gate failure voids the run, whatever
the damage numbers say.

## Pre-registered GO thresholds (judged exactly as written)

PRIMARY (both prongs must pass, on the confirm sample):
- P1: volley shots > 0 on >= 75% of ON fixture fights.
- P2: median volley damage per fought ON fixture fight > 0.
Verdict DIAG-GO iff P1 and P2 both pass AND the det-gate passes.
Verdict DIAG-NO-GO iff either prong misses (a miss is NO-GO,
never re-scored against a friendlier metric mid-run; doubts go
under "metric review" for the NEXT run).

SECONDARY (reported, never promoted to judge):
- Median volley share of total fight damage (volley dmg /
  rec.mDealt) across ON fights, and median volley damage as a
  fraction of beast start HP.
- Outcome flips: ON outcome vs OFF outcome on identical rng
  streams, counted per variant and band-wide (kill/drive-off
  gains, death/flee losses). A flip is the only outcome claim
  this arm can make; a zero flip count is reported as zero,
  not explained away.
- OFF baseline: median total damage and outcome mix with the
  same weapon and no ammo, so the volley contribution is visible
  against its own control, not against an unrelated band.

## Per-fight record

Weapon, ammo type + units at fight start, volley shots, hits,
damage, ammo left, total fight damage (rec.mDealt), melee damage
(mDealt minus volley dmg), rounds, outcome, beast start HP,
volley share of total damage, volley fraction of beast HP, the
paired OFF outcome for the same stream, and the full log for
every ON fight (sense-testing reads at least one in full).

## Horizon, policies, wall numbers

- Horizon: NOT APPLICABLE. Fixture fights are not sim days;
  there is no survival distribution to set a death-aware horizon
  from. Each fight is a single forced meeting, not a run.
- Policies: NONE. No policy drives a fixture fighter (policies
  drive the scholar; the fighter is an NPC through fieldFight).
- Wall numbers (national / table / wins / wave reach): NOT
  OBSERVABLE on this substrate, stated structurally, not as 0s.
  A fixture band has no village trajectory, no scale ladder, and
  no win flag; reporting 0/128 for any of those would be a
  category error, not a finding. The wall relevance is narrow
  and honest: the volley share and flip count bound what ammo
  delivery could ever buy a wave-4 field fight, whatever lever
  later delivers the ammo.

## Panel (§15)

NOT APPLICABLE, and none fabricated. scripts/balance-panel.js is
a policy-comparison driver: it runs registry policies on ONE
frozen root and compares panel outputs. It cannot express this
arm's substrate (a forced-meeting fixture band with no policy,
no sim days, and an ammo ON/OFF pair as the comparison) and it
has no fixture mechanism. The judge is therefore the
pre-registered fixture comparison + determinism gate above
(same rationale as sim-ammo-a / sim-w4field-a).

## Sense-testing

Read at least one full ON fixture-fight transcript and judge
whether the volley reads as a person fighting (narration
honesty, no silent actions, volley lines matching the ammo
actually spent), not just counts.

## Metric review (for the NEXT run, never a re-score of this one)

Doubts about the metrics above go here in the evidence file
after the run; they do not change this run's verdict.
