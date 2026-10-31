# sim-partyvolley-b — party + gear vs the lone-fighter ceiling on a forced-meeting fixture band (KILLED AT PILOT)

Run: Loop B, oversight-flesh-out-loop-b, axis scale-onramp, arm
sim-partyvolley-b. Worktree branch: sim-partyvolley-b. Base anchor:
recorded in the corpus (worktree HEAD at run time).
Pre-registration: evidence/2026-10-31/sim-partyvolley-b-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/partyvolley-fixture-20261031.js (forced-meeting
fixture band through the real Game.fieldFight; no game code
changed, no policy, no policy-default flips).
Proof: scripts/test-partyvolley-20261031.js — 15/15 green
(determinism gate: two fresh fixture runs byte-identical to each
other AND to the committed corpus; independent re-derivation of
the pilot-gate numbers; ghost-ally identity; shout-never;
dual-equip proof; damage arithmetic).
Corpus: evidence/2026-10-31/perseed-partyvolley-b/fixture-band.json
(32 pilot fights; NO confirm fights — the pilot gate failed, so
per the prereg no confirm ran).
No [needs-eyes] (measurement only; nothing player-facing ships).

## Verdict: KILLED AT PILOT (DIAG-NO-GO at the pilot gate)

Pilot gate, judged exactly against the prereg on the P3 pilot
subset (5 variants x 4 streams = 20 fights):
- G1 (mechanism): from-start ally joins on 20/20 = 100%
  (bar >= 90%) — PASS.
- G2: P3 pilot median rounds = 2 (bar >= 3) — MISS.
- G3: P3 pilot median total damage = 79.5 (bar >= 71, i.e. 2x
  the volleyfix lone confirm median of 35.5) — PASS.
One miss kills the arm per the prereg: no confirm, no re-score.
The kill reason is narrow and informative — party + gear more
than doubles damage (G3 passes) but does NOT buy a third round
(G2 misses). The rest of this file is the pilot evidence, which
is complete and citable even though the arm stopped here.

## Numbers (pilot sample only — never pooled into a confirm)

Pilot: 32 fights (8 variants x 4 streams 101-104). P3 subset: 20
fights, outcomes vDie 8 / vFlee 12, kills/drive-offs 0.
P3 pilot medians: total damage 79.5 (mean 75.1), rounds 2
(mean 1.6), sustained DPR 48 (mean 47.5), volley damage 24,
ally damage 4. From-start join 20/20, shout join 0/20.

Per variant (rounds / total damage / outcomes):
- P1-BOW x congregation: rounds [1,1,1,1], dmg [13,32,62,64],
  4 vDie. In-band lone control, congregation only, 4 streams.
- P1-DUAL x congregation: rounds [1,1,1,1], dmg [31,50,80,82],
  4 vDie. Machete alone (no party, no armor) lifts damage but
  the leader still dies in round 1 every time.
- P2-DUAL x congregation: rounds [1,1,1,1], dmg [37,56,83,85],
  4 vDie, allyDealt [3,6,3,6]. One ally from the start.
- P3-DUAL x congregation: IDENTICAL to P2-DUAL on all 4 streams
  (same rounds, outcomes, damage, ally damage, HP left) — the
  second staged ally changed nothing (see Finding 1).
- P3-HIDE x congregation: rounds [1,2,2,2], dmg [75,83,96,123],
  4 vFlee, 0 vDie. Hide armor converts every death into a
  flee; it does not buy round 3.
- P3-DUAL x eater: rounds [1,1,2,2], dmg [0,16,64,65], 4 vDie.
- P3-HIDE x eater: rounds [1,1,2,2], dmg [34,52,95,98], 4 vFlee.
- P3-HIDE x audit: rounds [2,2,2,3], dmg [76,96,120,148],
  4 vFlee. The only 3-round fight in the whole pilot sits here.

Against the volleyfix lone ceiling (128 confirm fights, all
beasts/weapons): median total 35.5, median rounds 1, 0 kills.
Pilot P3 (congregation/eater/audit only, 20 fights) reaches
median total 79.5 — 2.24x the lone ceiling — and median rounds
2, still 0 kills/drive-offs. Against backlog #1369's yardstick:
median sustained DPR 48 vs the 57.25 yardstick (leader 48.25 +
2 allies 9.0) — short by about 16%, and below the 57-80
cap-fit band. Against backlog #1383's sortie DPR median 16.0:
the fixture party's 48 is 3x the live-sortie figure, but the
two DPRs are not same-instrument (fixture forced meetings vs
live sorties), so that comparison is directional only.

## Finding 1 — the engine fields at most TWO fighters, not three

This is the pilot's most consequential result, and it reframes
the yardstick. fieldFight's two ally-entry paths are mutually
exclusive by construction:
- allyFromStart shifts ONE allyVid in before round 1 and sets
  helpCalled = true (fieldFights.js ~907).
- The hopeless-shout branch requires !helpCalled (fieldFights.js
  ~1588), so in an allyFromStart fight it can NEVER fire.
- In a non-allyFromStart fight the shout fires at most once
  (helpCalled flips true), so at most one ally ever joins there
  either.
Measured, not just read: shoutJoined = 0 on all 24 from-start
pilot fights, and P2-DUAL == P3-DUAL congregation on every
stream and every recorded field. The second staged ally is a
ghost: staged, named in the fixture, never in the blows.
Consequence: backlog #1369's yardstick component "2 allies
9.0" (two allies at the flat [3,6] mean of 4.5 each) cannot be
fielded through fieldFight — the off-screen engine sorties use.
A 3-fighter wave-4 demand shape is unfieldable here; the
achievable party ceiling through this engine is leader + 1
ally (leader ~33/round at machete+bow + ally ~4.5/round when
alive). Whether the yardstick or the engine should change is a
coordinator/Steve decision, not a fixture finding — ranked as
next arm 1 below.

## Finding 2 — signature-inflated monster hits one-shot unarmored leaders

Base damage ranges from the defs: congregation [50,70], eater
[45,75], audit [55,75]. Observed single hits on unarmored leaders:
congregation 105-124, eater 112-145 — up to roughly double base
(the sigW4 layer, reported as observed, mechanism not attributed
here). No unarmored audit variant ran in the pilot, so audit raw
hits are unmeasured; observed post-armor audit hits run 24-71. A 100-HP
leader therefore dies to ONE hit unarmored: P3-DUAL
congregation 4/4 round-1 deaths, eater 4/4 deaths. Hide armor
(P20, pierce-reduced) absorbs 25-60 per hit and converts every
P3-HIDE fight in the pilot to a flee (12/12 vFlee, 0 vDie) —
armor buys survival-to-flee, not rounds: even armored, the
leader flees at 6-36 HP in congregation/eater fights because
the second hit would kill. The one-shot is the rounds cap, not
morale: fights end before round 3 because the leader is dead
or past holding, not because the party gives up early.

## Finding 3 — the volley does not scale with the party

P3 pilot median volley damage 24, vs the volleyfix lone
confirm median 21.5. Same bow, same arrows, same opening — the
party adds strikes and survival, not a bigger volley. The
volley is ~30% of the pilot P3 median total (24/79.5), down
from ~60% of the lone total, because melee + ally damage grew
around it. Nothing in the party shape rescues the volley as a
wave-4 answer; it was never the binding constraint at this
scale.

## Finding 4 — the ally is an HP sponge that sometimes dies first

Pilot P3 median allyDealt 4 per fight (one flat [3,6] strike
per round the ally stands). The ally's real contribution is
absorbing ~40% of monster hits: in the audit 3-round fight the
ally takes 71 then 55, goes down in round 2, and the leader —
untouched until round 3 — then flees alone. Ally gear is not a
lever here (flat strikes, no armor on ally hits — read from
the code, stated in the prereg, consistent with the pilot:
ally damage never exceeds one [3,6] strike per round).

## What the village looked like, in plain words

Three villagers walk up to a wave-4 beast, the best gear they
can honestly earn on their backs — machete, bow, a full quiver,
cured-hide armor — and the fight is still over in a round or
two. Without the armor, the beast's first blow kills the
leader outright: not a long fight lost, a single hit worth more
than a person's whole health. With the armor, the leader lives
to run: every armored party fight in the pilot ended with the
party fleeing, hurt, having scratched the beast for about 8%
of its health. The third villager, the one who was supposed to
make it a real party, never gets to fight at all — the engine
only ever lets two people into the blows. So the demand shape
"a party, fully geared, only when ready" is, through this
engine, two people, one of whom is a sponge, running from a
beast they cannot meaningfully wound. The damage roughly
doubled over the lone fighter — that is real — but doubling a
tiny number still leaves a wall: 80 damage against 1000 health
is not a fight, it is an opening that ends in flight.

## Sense-testing (full transcripts read, not just counted)

- P3-DUAL x congregation, stream 101: volley 3/3 for 48, ally
  "already at the door — charges in", leader strikes 32, ally
  strikes 3, Absolution hits the leader for 124 (0 left). Reads
  as people fighting: every blow accounted for, the ally's
  entry named, the death a single legible blow.
- P3-DUAL x eater, stream 104: volley 0/2 ("loosed wide — the
  arrow buries itself in the dirt. (spent)"), ally charges in,
  Gorge hits the leader for 117 before the leader ever strikes.
  The leader never getting a blow is honest, not a bug: the
  monster went first and the fight ended there.
- P3-HIDE x audit, stream 101 (the pilot's only 3-round fight):
  volley 48, ally takes 71 then 55 and "goes down!", leader
  strikes 31, absorbs 16, takes 24 (76 left), then "sees how
  this ends — and runs while running still works." The hopeless
  flee at 76 HP (not a floor flee) reads correctly: with the
  ally down and no help coming, the trajectory is legible.
  Two narration blanks, both already known, neither chased
  (DIAG only): the beast is unnamed in fixture logs
  ("something" / a description — knowledge-gating, coherent);
  volley lines say "arrow" for every weapon (volleyfix blank).

## Wall numbers

NOT OBSERVABLE on this substrate, stated structurally per the
prereg (not as 0s): a fixture band has no village trajectory,
no scale ladder, and no win flag, so national / table / wins /
wave reach cannot be read off it. The wall relevance is the
bound this pilot establishes: party + best earnable gear +
ammo, through the real fight engine, reaches median 79.5 total
damage and median 2 rounds with 0 kills/drive-offs in 20
fights — and the 3-fighter shape the yardstick assumes cannot
be fielded at all.

## Panel (§15)

NOT APPLICABLE, and none fabricated. scripts/balance-panel.js is
a policy-comparison driver: it runs registry policies on ONE
frozen root and compares panel outputs. It cannot express this
arm's substrate (a forced-meeting fixture band with no policy,
no sim days, and a party-size/gear ladder as the comparison)
and it has no fixture mechanism. The judge is the pre-registered
pilot gate + determinism gate above (same rationale as
sim-volleyfix-b).

## Metric review (applies to the NEXT run, never a re-score of this one)

1. The rounds gate (median >= 3) was the kill, and it was the
   right gate to have — but its failure mode is informative:
   rounds are capped by one-shot HP math, not by morale, so a
   future party prereg should ALSO pre-register a survival
   metric (vDie rate, or rounds-survived-before-death) rather
   than letting rounds alone carry the "does the party hold"
   question. Hide armor's 12/12 flee conversion would have
   passed a survival prong while failing rounds.
2. The yardstick comparison needs a same-instrument DPR
   definition. #1369's "sustained" DPR and this arm's
   mDealt/rounds (over fights that mostly end in rounds 1-2)
   may not share a denominator rule; the next run should state
   its denominator (e.g. DPR over fights reaching >= 3 rounds,
   or damage-per-round-survived) before comparing to 57.25.
3. Four streams per pilot variant is thin for volley luck
   (congregation volley ran 48/16/48/0 across streams). A
   confirm-scale run should use >= 8 streams (as preregistered
   for this arm's unrun confirm) and report per-stream volley
   spread, not just the median.
4. The fixture day is day 0, so the post-day-7 +0.08 hold bonus
   does not apply. Direction is conservative for holding, but
   it cannot explain the kill: one-shot deaths are HP math,
   not morale. A future fixture could set day >= 7 to test
   whether holdBonus buys round 3 — predicted no for
   unarmored leaders (they die before morale runs).
5. State hygiene improved over volleyfix: this fixture restores
   the FULL Game.state per fight (not just fighter records), so
   trick-observation drift is frozen by construction and the
   det-gate passes byte-identical. Future fixtures should keep
   this pattern.

## Ranked next arms (for the coordinator — not chased here)

1. ENGINE-CAP DECISION (highest value, needs a call): fieldFight
   fields at most leader + 1 ally. Either the wave-4 demand
   "party" must be re-expressed for a 2-fighter engine, or the
   engine must gain a genuine multi-ally path, or the yardstick
   must be recomputed for 2 fighters. A fixture cannot resolve
   this; it needs a design decision.
2. SIGNATURE-HIT MEASUREMENT: congregation/eater single hits
   land ~2x their base ranges. Measure raw-vs-final hits per
   beast across a band and establish whether sigW4 stacking is
   working as designed — it, not party size, is what caps
   rounds at 1-2 unarmored.
3. ARMOR LADDER AT PARTY SCALE (the unrun confirm's gear
   ladder): BARK vs HIDE vs none at P2/P3, 8 streams, survival
   (vDie rate) as a pre-registered prong alongside damage.
   Pilot predicts hide converts deaths to flees without buying
   round 3; the ladder would price that conversion per tier.
4. SPEAR SLOT PROOF + XBOW TOP (unrun — killed at pilot, not
   disproven): P3-SPEAR (does the spear actually take the
   ranged slot and zero the volley?) and P3-XBOW (does the
   strongest volley matter at party scale?). Both were
   preregistered confirm variants; neither has a single fight
   behind it yet. Do NOT cite them as measured.

## Convergence state

killed-at-pilot (measurement, no game change): the scale-onramp
axis does not gain a party+gear lever from this arm — party +
best earnable gear + ammo doubles lone-fighter damage but
still reaches median 2 rounds and 0 kills/drive-offs, and the
3-fighter demand shape is unfieldable through fieldFight. The
binding constraints this pilot names are the engine's 2-fighter
cap and signature-inflated one-shot hits, not quiver depth or
party size as staged. Those two are the next work, not another
identical-seed lever run.

## Files

- Pre-registration: evidence/2026-10-31/sim-partyvolley-b-prereg.md
- Evidence: evidence/2026-10-31/sim-partyvolley-b.md (this file)
- Fixture: scripts/partyvolley-fixture-20261031.js
- Proof: scripts/test-partyvolley-20261031.js (15/15 GREEN)
- Corpus: evidence/2026-10-31/perseed-partyvolley-b/fixture-band.json
