# sim-volleyfix-b — divergence-proof volley measurement on a forced-meeting fixture band (DIAG-GO)

Run: Loop B, oversight-flesh-out-loop-b, axis scale-onramp, arm
sim-volleyfix-b. Worktree branch: sim-volleyfix-b. Base anchor:
7a297468408c669d6417eda0af1fb95135ec191a (worktree HEAD; the
fixture corpus records the same anchorCommit).
Pre-registration: evidence/2026-10-31/sim-volleyfix-b-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/volleyfix-fixture-20261031.js (forced-meeting
fixture band through the real Game.fieldFight; no game code
changed, no policy, no policy-default flips).
Proof: scripts/test-volleyfix-20261031.js — 39/39 green
(determinism gate: two fixture runs byte-identical; independent
re-derivation of both summaries; verdict logic; pair integrity;
ON shots checked against the engine formula read from the data
files, not from the fixture script's constants).
Corpus: evidence/2026-10-31/perseed-volleyfix-b/fixture-band.json
(320 fights; the committed corpus is byte-identical to a fresh
det-gate re-run, verified by diff).
No [needs-eyes] (measurement only; nothing player-facing ships).

## Verdict: DIAG-GO (judged exactly against the prereg)

Confirm sample (128 ON fights): P1 volley shots > 0 on 128/128
= 100% (bar >= 75%) — PASS. P2 median volley damage per fought
ON fight = 21.5 > 0 — PASS. Determinism gate: PASS (two runs
byte-identical). DIAG-GO.

The pilot also passed its gate (32/32 shots, median 19), so the
confirm ran as preregistered. The confirm verdict is judged on
the confirm sample alone; pilot numbers are reported separately
and never pooled into it.

## The answer, in one line

When a ranged fighter DOES have ammo in hand, the volley always
fires and does real damage — but it is ~2% of a wave-4 beast's
health, and in 128 confirm fights it never once turned a fight
into a kill or a drive-off. The volley is more than half of the
tiny damage a lone fighter manages before dying or fleeing, and
still nowhere near enough to change who wins the fight.

## Numbers (confirm sample unless stated)

- ON fights: 128 (16 variants x 8 rng streams), each paired with
  an OFF fight (same weapon, 0 ammo, same rng stream): 128 OFF.
  Pilot: 32 ON + 32 OFF. Total band: 320 fights.
- Volley shots: 128/128 ON fights fired (100%). OFF fights: 0
  shots on 160/160 (the dry control behaves exactly as the dry
  wave-4 fights in w4field/ammo-a did).
- Volley damage: median 21.5, mean 24.5 per ON fight. Median
  volley share of total fight damage: 60.5%. Median volley
  fraction of beast start HP: 2.0% (mean 2.3%; best single fight
  8.0% — crossbow vs congregation, 80 damage on 1000 HP).
- Total fight damage: median 35.5 ON vs 18.0 OFF. Damage taken
  by the fighter: median 114.5 ON vs 108.0 OFF — the volley does
  NOT reduce damage taken; the fighter still dies or flees in
  round 1-2 (confirm rounds: 92 x round 1, 28 x round 2, 8 x
  round 3; median rounds 1).
- Outcomes, confirm: ON — vDie 83, vFlee 45, vKill 0, mFlee 0.
  OFF — vDie 94, vFlee 34, vKill 0, mFlee 0. Zero kills and zero
  drive-offs in EITHER arm, on any variant, any weapon, any
  beast. The wave-4 wall is not a volley problem at this scale:
  a lone fighter's whole fight (volley + melee) lands a median
  35.5 damage against 950-1200 HP.
- Outcome flips (ON vs OFF on the same stream): 27/128. Net:
  11 fewer deaths ON (83 vs 94) and 11 more flees ON (45 vs 34).
  Direction split: 19 vDie->vFlee, 8 vFlee->vDie. Read the flip
  count with the caveat in §Caveats below — it is NOT a clean
  causal count (the volley consumes rng draws, shifting every
  later draw, and trick-knowledge intent drifts across the
  process). What is robust is the zero: no flip in either
  direction ever reached vKill or mFlee.

Per weapon (confirm ON medians):
- Bow (crude_bow, 48 fights incl. the 1-ammo edge): median
  volley 17.0, median share 48.6%, median HP fraction 1.7%.
- Sling (40 fights): median volley 19.0, median share 63.1%,
  median HP fraction 1.8%.
- Crossbow (40 fights): median volley 38.0, median share 63.1%,
  median HP fraction 3.4% — the strongest volley in the band,
  still 3-4% of beast HP.
- Ammo-scarce edge (bow x congregation, 1 arrow, 8 fights):
  1 shot on 8/8, median volley 15.5 (one hit's worth), 0 flips,
  8/8 vDie. A single arrow is a gesture, not an opening.

Per beast (confirm ON median volley / HP fraction):
congregation 21.0 / 2.1%, influencer 21.5 / 2.3%, eater 19.0 /
1.8%, audit 30.0 / 2.5%, algorithm 21.5 / 2.0%. No beast is
volley-soft; the eater (fastest, speed 4, fewest shots) is the
hardest to soften, the audit (slow, 1200 HP) takes the most
absolute damage and still the second-smallest fraction.

Pilot (for the record, not pooled): 32 ON, shots 32/32, median
volley 19, median share 55.1%, median HP fraction 1.9%, flips
15 (11 vFlee->vDie, 4 vDie->vFlee), ON vDie 27 / vFlee 5, OFF
vDie 20 / vFlee 12, kills/drive-offs 0 in both arms. The pilot's
flip direction ran opposite to the confirm's — one more reason
to treat the flip count as stream noise around a zero kill
effect, not as a stable lever effect.

## What the village looked like, in plain words

Give a villager a bow, put eight arrows in their hand, and walk
them up to a wave-4 beast, and the opening is exactly what the
bow promises: arrows fly, most of them land, the beast loses a
sliver of health. Then the beast hits back once — for more
damage than the villager has health — and the fight is over.
The volley is not broken and it is not trivial: it is more than
half of everything a lone fighter achieves. It is simply aimed
at a wall ten times its size. Even the best volley in the band,
a crossbow emptying four bolts into a congregation, took 8% of
the beast. Nothing in the ammo channel, however perfectly
delivered, turns a lone wave-4 meeting into a win. That takes
a party, armor, and rounds the fighter survives — the
wave-4 demand (Steve 2026-10-28: parties, fully geared, only
when ready), not a fuller quiver.

## Sense-testing (full transcripts read, not just counted)

Exemplar — confirm, bow x congregation, 8 arrows, stream 201
(ON): "the person in their 40s sees the something coming and
nocks an arrow — the fight opens at range (3 shots). loosed —
it takes the something for 15 (985 left). loosed — for 17 (968
left). loosed — for 13 (955 left). lowers the bow — the
something is on them now. (3/3 hit). R1: strikes for 19 (936
left). R1: Absolution hits for 136 (0 left)." The volley reads
as a person fighting: the opening is announced, every shot is
accounted for (hits with damage and remaining HP, misses as
"loosed wide — the arrow buries itself in the dirt. (spent)"),
and the bow is lowered honestly when the beast closes. No
silent actions in the volley itself.

Two narration blanks, both already known, neither chased (DIAG
only — recorded for the backlog, not fixed here):
- The beast is "the something" in every fixture log: the fighter
  does not know the wave-4 beast, so knowledge-gating renders it
  unnamed. Coherent with "if you don't know, it doesn't show,"
  but it means a fixture-fight transcript never names its
  monster.
- The volley lines always say "arrow" even for sling and
  crossbow ("nocks an arrow", "the arrow buries itself in the
  dirt") — the same wording class sim-ammo-a found for the dry
  line ("has Crossbow but no arrows"). A sling fighter looses
  stones, not arrows; the spend is honest, the noun is wrong.

## Wall numbers

NOT OBSERVABLE on this substrate, stated structurally per the
prereg (not as 0s): a fixture band has no village trajectory,
no scale ladder, and no win flag, so national / table / wins /
wave reach cannot be read off it. The wall relevance is the
bound this band establishes: perfect ammo delivery to a lone
wave-4 fighter buys a median 21.5 damage (2% of beast HP) and
zero kills or drive-offs in 128 fights. Any future ammo lever
must be judged against that ceiling, not against the hope that
a firing volley wins fights — on this evidence, it cannot, for
a lone fighter. The party/gear question (does a volley matter
inside a 3-fighter, armored, multi-round fight?) is a different
fixture and is named as a blank below.

## Caveats (read before citing the flip count)

1. Outcome flips are stream-contaminated, by construction. The
   ON/OFF pair shares one rng stream, and the volley consumes
   draws from it — so every post-volley draw (initiative, hits,
   monster attack choice) lands on a different stream position
   in ON than in OFF. The volley damage itself is measured
   cleanly (it precedes round 1), but a flip cannot be credited
   to the damage alone. The net -11 deaths / +11 flees is
   consistent with "softening helps a fighter live to flee,"
   and equally consistent with stream noise: the pilot's flips
   ran the other way (net +7 deaths ON).
2. Intent drifts across the process. fieldFight's learn/engage
   intent flips to engage once the village has two survived
   observations of a beast's trick — and the snapshot restore
   between fixture fights does not cover villageCounterObs /
   villagerTricks. So influencer/audit/algorithm fights run
   engage in later variants while congregation/eater fights
   (which always kill the fighter, and the dead tell no tales)
   stay learn. Intent affects flee timing, not volley damage,
   so the primary verdict is untouched — but a future fixture
   that wants clean outcome attribution must snapshot/restore
   the trick-observation state per fight too.
3. The fixture fighter holds beast_calm. That ability touches
   only monster.detect_chance, which the forced meeting never
   consults (no awareness step), so it does not confound the
   volley or the outcome numbers — recorded for completeness,
   not as a caveat on the verdict.
4. Solo, unarmored, 100 HP is the w4field lone-fighter shape,
   not the wave-4 demand shape. Nothing here speaks to a
   party volley (allies add strikes, hold rounds, and absorb
   hits) or to an armored fighter surviving to round 4+.
   Generalizing "the volley cannot change outcomes" beyond the
   lone fighter would over-read this band.

## Panel (§15)

NOT APPLICABLE, and none fabricated. scripts/balance-panel.js is
a policy-comparison driver: it runs registry policies on ONE
frozen root and compares panel outputs. It cannot express this
arm's substrate (a forced-meeting fixture band with no policy,
no sim days, and an ammo ON/OFF pair as the comparison) and it
has no fixture mechanism. The judge is the pre-registered
fixture comparison + determinism gate above (same rationale as
sim-ammo-a / sim-w4field-a).

## Metric review (applies to the NEXT run, never a re-score of this one)

1. The primary thresholds were easily met (100% shots, median
   21.5) while the interesting question — kills/drive-offs —
   sat at zero in both arms. A future volley prereg should
   pre-register the kill/drive-off count as its headline
   secondary with an explicit "zero is a finding" rule, rather
   than letting a shots-rate pass imply a combat effect.
2. Identical-stream ON/OFF pairs are NOT pure counterfactuals
   once the treatment consumes rng (see Caveat 1). A future
   fixture that wants causal flip attribution should give the
   volley its own rng sub-stream (engine change, out of DIAG
   scope) or pre-register flips as a noisy indicator only,
   with the kill/drive-off zero as the robust claim.
3. Intent drift (Caveat 2) should be frozen in future fixtures:
   snapshot/restore villageCounterObs + villagerTricks per
   fight, or set the intent explicitly per variant, so outcome
   comparisons are not confounded by learning accumulated
   across the band.
4. Median volley damage pooled across weapons hides the weapon
   spread (bow 17 / sling 19 / crossbow 38). Future preregs
   should judge per-weapon medians, or pre-register the weapon
   whose volley is actually at issue.

## Blanks found (for the coordinator's findings backlog — not chased here)

- Party volley: does a volley matter inside a 3-fighter,
  armored, multi-round wave-4 fight (the wave-4 demand shape)?
  This band answers the lone fighter only.
- Volley noun wording: sling/crossbow volley lines say "arrow"
  (same class as sim-ammo-a's dry-line wording blank).
- Fixture harness: snapshot/restore trick-observation state
  per fight for clean outcome attribution (see Metric review 3).

## Convergence state

converging (measurement, no game change): the scale-onramp axis
now has the divergence-proof volley number sim-ammo-a asked
for — a firing volley is real, ~2% of wave-4 HP, and never a
kill or drive-off for a lone fighter. The ammo channel's ceiling
is now measured, not hoped for: delivering ammo cannot, by
itself, make lone wave-4 fights winnable. The next work on this
channel is the party-volley fixture and/or the stick/fiber
supply blank (sim-ammo-a) — not another identical-seed lever
run, and not a bigger quiver.

## Files

- Pre-registration: evidence/2026-10-31/sim-volleyfix-b-prereg.md
- Evidence: evidence/2026-10-31/sim-volleyfix-b.md (this file)
- Fixture: scripts/volleyfix-fixture-20261031.js
- Proof: scripts/test-volleyfix-20261031.js (39/39 GREEN)
- Corpus: evidence/2026-10-31/perseed-volleyfix-b/fixture-band.json
