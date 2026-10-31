# sim-spearxbow-a — SPEAR slot proof + XBOW top confirm on a forced-meeting fixture band (SPEAR:GO, XBOW:GO)

Run: Loop A, oversight-flesh-out-loop, run fleshout-20261031T0915Z,
axis scale-onramp, arm sim-spearxbow-a. Worktree branch: sim-spearxbow-a.
Base anchor: 003a9c2f391edd56f31a0f6f9f1305dfe6380a48 (recorded in the
corpus; this arm re-anchored itself, it does not assume the
partyvolley-b tree).
Pre-registration: evidence/2026-10-31/sim-spearxbow-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/spearxbow-fixture-20261031.js (forced-meeting
fixture band through the real Game.fieldFight; no game code
changed, no policy, no policy-default flips).
Proof: scripts/test-spearxbow-20261031.js — 27/27 green
(determinism gate: two fresh fixture runs byte-identical to each
other AND to the committed corpus; independent re-derivation of
the pilot gate, S1/S2, X1/X2, per-beast rankings, and verdict
fields; ally-spear per-fight identity; mechanism invariants).
Corpus: evidence/2026-10-31/perseed-spearxbow-a/fixture-band.json
(176 fights: 20 pilot + 156 confirm).
No [needs-eyes] (measurement only; nothing player-facing ships).

## Verdicts (judged exactly against the prereg, confirm sample alone)

Pilot gate: PASS, so the confirm ran. M1 from-start join 20/20 =
100% (bar >= 90%). M2 XBOW volley fired 4/4. M3 SPEAR
equippedRanged == hunting_spear 4/4. Pilot numbers below are
reported separately and never pooled into the confirm.

- SPEAR slot proof: GO. S1 equippedRanged == hunting_spear on
  36/36 confirm SPEAR fights = 100% (bar >= 90%). S2 volley
  shots null/0 on 36/36 = 100% (bar >= 90%), despite a crude bow
  and 8 arrows sitting in the same inventory. Backlog #1370 is
  now PROVEN in-fixture, not assumed: the spear takes the ranged
  slot (range 2 > 1 under equipment.js isRangedWeapon) and the
  bow never fires, because the volley requires a ranged weapon
  WITH an ammo field and the spear has none.
- XBOW top confirm: GO. X1 XBOW median volley damage ranks #1
  among the four tiers on the pooled 3-beast band AND on every
  beast individually. X2 XBOW median total damage >= BOW median
  total pooled (118 vs 93) AND on every beast. The volleyfix
  lone-fighter ranking (XBOW > SLING > BOW) survives the move
  to party scale with one reorder: at P2+hide it is
  XBOW > BOW > SLING > SPEAR on volley (see below).

## Numbers (confirm sample unless stated)

Confirm: 156 fights (4 leader tiers x 3 beasts x 12 streams
201-212, plus ALLY-SPEAR x congregation x 12). All 156 confirm
fights and all 20 pilot fights ended vFlee; kills/drive-offs
0/176 overall. From-start join 176/176, shout join 0/176
(the engine cap, re-observed: no fixture here pretends a
shouted ally arrives).

Pooled 3-beast medians (36 fights per tier):
- XBOW: volley 42, total 118, rounds 2, DPR 62.25, vDie 0.
- BOW: volley 28.5, total 93, rounds 2, DPR 52.5, vDie 0.
- SPEAR: volley 0, total 82, rounds 2, DPR 42.5, vDie 0.
- SLING: volley 20.5, total 76, rounds 2, DPR 43.25, vDie 0.
Volley ranking: XBOW 42 > BOW 28.5 > SLING 20.5 > SPEAR 0.
Total-damage ranking: XBOW 118 > BOW 93 > SPEAR 82 > SLING 76.
Against the #1369 yardstick 57.25 sustained DPR: only XBOW
(62.25) clears it; BOW (52.5) sits ~8% short, SPEAR/SLING
(~42-43) well short. Same-instrument caveat as partyvolley-b:
fixture forced meetings, not live sorties, so the yardstick
comparison is directional, not a live-sortie verdict.

Per beast (median volley / median total, 12 fights each):
- Congregation (1000 HP, speed 2): XBOW 51/124.5, BOW
  29.5/87.5, SLING 21.5/78, SPEAR 0/78.5.
- Eater (1050 HP, speed 4): XBOW 22/83, BOW 17/68, SLING
  14.5/62.5, SPEAR 0/79. The eater compresses every volley
  (fewer shots before contact) and is the only beast where
  SPEAR (79) beats BOW (68) on total — no volley to lose, and
  the spear's +30 ranged bonus folding into melee strikes
  outweighs the bow's small volley there.
- Audit (1200 HP, speed 2): XBOW 51/144, BOW 29.5/109.5, SLING
  21.5/92.5, SPEAR 0/90.

Pilot (20 fights, congregation only, streams 101-104 — NOT
pooled): BOW total 79 / volley 32; XBOW 71.5 / 31; SLING 64 /
22; SPEAR 45 / 0; ALLY-SPEAR 79 / 32. Pilot XBOW volley (31)
runs well below its confirm congregation median (51) on 4
streams — stream luck at small n, which is why the pilot
never judges a ranking and the confirm uses 12 streams.

SPEAR detail: every confirm SPEAR fight still carries machete
in the melee slot and hide_armor on the torso — the spear
displaces ONLY the bow, it does not displace the melee weapon.
Leader strikes run higher with the spear (transcript: 38/41)
than bow-tier strikes (~31-35), consistent with wb =
round((35+30)/2) vs round((35+18)/2) — but the gained melee
does not repay the lost volley except against the eater (see
above). A spear fighter's opening is no opening at all: the
fight starts in melee, and the 8 arrows in hand are dead
weight. That is the slot proof's practical meaning, and it
cuts both ways for loadout advice: spear+bow is not a ranged
build, it is a melee build carrying a bow it cannot fire.

ALLY-SPEAR secondary (reported, never a judge): 12/12 confirm
ally-spear fights are IDENTICAL — total damage, volley damage,
allyDealt, rounds, outcome, and the full log text — to the
same-stream BOW x congregation fights with an unarmed ally.
Ally gear is a complete null in this engine, not just a
median-level null: giving the ally a hunting spear changes
literally nothing, because ally strikes are flat [3,6] and
the ally's inventory is never read by the fight. Any future
"arm the allies" lever must change the ally-strike code
itself, not ally inventories.

Survival (confirm, per tier): vDie 0 everywhere — hide armor
converts every death to a flee at this party scale, as
partyvolley-b's P3-HIDE pilot showed. Ally down
(allyHpLeft == 0): BOW 13/36, XBOW 19/36, SLING 15/36, SPEAR
17/36. Median leader HP left: XBOW 55.5, SPEAR 36.5, BOW 33.5,
SLING 35.5 — the crossbow's bigger opening leaves the leader
healthier as well as dealing more, the only tier where both
move together.

## What the village looked like, in plain words

Two villagers walk up to a wave-4 beast in cured-hide armor,
machete in hand, and the choice in the other hand decides the
opening. With a crossbow, the beast eats four bolts before it
closes — the best opening in the band, on every beast — and
the pair still ends up running, having scratched about a tenth
of the beast's health. With a spear, there is no opening at
all: the spear pushes the bow out of the hand that would have
loosed, the arrows stay in the quiver, and the fighter just
walks into melee swinging harder. The spear is not a bad
weapon — its blows hit harder than the bow-fighter's — but it
is not a ranged weapon in any sense the fight honors, and
carrying both is carrying one weapon too many. The ally, for
their part, fights exactly as hard with a spear as without
one: same blows, same death, same words in the log. Arming
the second villager is, through this engine, theater.

## Sense-testing (full transcripts read, not just counted)

- P2-XBOW x audit, stream 201 (confirm, 3 rounds, vFlee):
  volley 4/4 for 79, ally "already at the door — charges in",
  leader strikes 40/38, ally strikes 6/5, ally takes 44 then 70
  and "goes down!", leader absorbs 25 through gear, strikes 18
  "(audited — half strength)", then "sees how this ends — and
  runs while running still works" at 61 HP. Reads as people
  fighting: every blow accounted for, the ally's entry named
  through the co-presence channel, the flee a judgment call
  with the ally down, not a floor trip.
- P2-SPEAR x congregation, stream 201 (confirm, 2 rounds,
  vFlee): NO volley lines at all — the fight opens straight
  into the ally's entry and melee, which is exactly what the
  slot proof predicts. Leader strikes 38/41, ally takes 112
  and goes down in round 1 (ally hits take no armor, honest),
  leader absorbs 30, flees at 61 HP. Coherent: a spear fighter
  closes to melee immediately; nothing in the narration
  pretends a ranged opening happened.
- Two narration blanks, both already known, neither chased
  (DIAG only): volley lines say "arrow"/"bow" for every weapon
  (the crossbow transcript above "nocks an arrow" and "lowers
  the bow" — the volleyfix blank, unchanged); the beast is
  unnamed in fixture logs ("something" / a description —
  knowledge-gating, coherent). Minor observation, not a
  finding: the fixture leader is set age 35 but the log calls
  him "the man in his 40s" — a description bucket, not a
  fight-relevant error; noted here so a future reader does
  not mistake it for an age-setting failure.

## Wall numbers

NOT OBSERVABLE on this substrate, stated structurally per the
prereg (not as 0s): a fixture band has no village trajectory,
no scale ladder, and no win flag, so national / table / wins /
wave reach cannot be read off it. The wall relevance is the
bound this band establishes: at the largest party fieldFight
can field (leader + 1 sensed ally) in the best earnable armor,
the crossbow is confirmed the top ranged slot on every beast
(median total 118, DPR 62.25 — the only tier clearing the
#1369 57.25 yardstick), the spear is proven a melee build
that sacrifices its volley, and still no tier kills or
drives off a wave-4 beast in 156 confirm fights. The ranged
slot is now priced; it is not the wall-breaker.

## Panel (§15)

NOT APPLICABLE, and none fabricated. scripts/balance-panel.js
is a policy-comparison driver: it runs registry policies on
ONE frozen root and compares panel outputs. It cannot express
this arm's substrate (a forced-meeting fixture band with no
policy, no sim days, and a ranged-slot ladder as the
comparison) and it has no fixture mechanism. The judge is the
pre-registered fixture comparison + determinism gate above
(same rationale as sim-volleyfix-b / sim-partyvolley-b).

## Metric review (applies to the NEXT run, never a re-score of this one)

1. The P3→P2 substitution should stay the standard for
   fixture party work until the engine cap changes: staging a
   third fighter measures a ghost, not a party. Any future
   prereg that writes "P3" for a fieldFight band without
   addressing helpCalled should be returned, not run.
2. The eater exception (SPEAR total > BOW total) suggests a
   future prereg could price the spear honestly as a
   fast-beast melee option rather than a failed ranged build —
   but on this band it is one beast out of three, and the
   spear still never kills or drives off. Do not promote it
   to a recommendation off this sample.
3. Pilot stream luck was large (XBOW pilot volley 31 vs
   confirm congregation 51). Future fixture preregs should
   keep pilot gates mechanism-only (join/slot/fire checks),
   never damage medians, at 4 streams.
4. The ally-gear null is now proven at identity level
   (12/12 identical logs). Future arms should not spend a
   variant on ally inventories again; the open question is
   ally-strike code, which is a game change, not a fixture.

## Ranked next arms (for the coordinator — not chased here)

1. ENGINE-CAP DECISION (carried from partyvolley-b, unchanged
   by this arm): fieldFight fields at most leader + 1 ally.
   Either the wave-4 demand "party" is re-expressed for a
   2-fighter engine, or the engine gains a genuine multi-ally
   path, or the yardstick is recomputed for 2 fighters.
2. SIGNATURE-HIT MEASUREMENT (carried from partyvolley-b):
   congregation/eater single hits land ~2x their base ranges
   (112-145 observed); it, not the ranged slot, caps rounds.
3. SPEAR+MACHETE STACKING, already answered in passing here
   (spear ranged + machete melee coexist on all 36 confirm
   SPEAR fights) — no separate arm needed; cite this file.
4. ALLY-STRIKE CODE as a lever (new): ally gear is proven
   null at identity level, so any "better allies" work must
   touch ally strikes, armor, or targeting in code — a game
   change for a future arm, not a fixture.

## Convergence state

measured (no game change): the scale-onramp axis gains two
closed questions from this arm — the spear slot is proven
(spear wins the ranged slot, volley null, bow unfired) and
the crossbow top is confirmed at party scale on every beast
— but gains no wall-breaking lever: even the top tier reaches
median total 118 against 1000-1200 HP with 0 kills/drive-offs
in 156 confirm fights. The binding constraints remain the
ones partyvolley-b named (2-fighter engine cap,
signature-inflated one-shot hits), not the ranged slot.

## Files

- Pre-registration: evidence/2026-10-31/sim-spearxbow-a-prereg.md
- Evidence: evidence/2026-10-31/sim-spearxbow-a.md (this file)
- Fixture: scripts/spearxbow-fixture-20261031.js
- Proof: scripts/test-spearxbow-20261031.js (27/27 GREEN)
- Corpus: evidence/2026-10-31/perseed-spearxbow-a/fixture-band.json
