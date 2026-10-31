# sim-sighit-b — PRE-REGISTRATION (written BEFORE any judged sims)

Run: Loop B, oversight-flesh-out-loop-b, axis scale-onramp, arm
sim-sighit-b. Worktree branch: sim-sighit-b.
Base anchor: recorded by the fixture script in every corpus file
(worktree HEAD at run time; this arm re-anchors itself).
Substrate: FORCED-MEETING FIXTURE BAND through the real
Game.fieldFight, not a live sim band. This is the partyvolley
next question (evidence/2026-10-31/sim-partyvolley-b.md,
Finding 2 + ranked next arm 2): single monster hits on
UNARMORED leaders landed at roughly double the defs' base
bands, and a 100-HP leader died to ONE hit. DIAG ONLY: zero
src/js changes, zero policy-default flips, zero edits to
existing policy files. The instrument leg below monkeypatches
Game.sigW4FieldMonster inside the fixture process only — a
measurement instrument, never a default change, never a src
edit, never shipped.

## What prior work already settled (reconciliation, not re-proof)

- sim-partyvolley-b (2026-10-31, KILLED AT PILOT): P3-DUAL
  congregation 4/4 round-1 deaths, eater 4/4; observed single
  hits on unarmored leaders congregation 105-124 (base
  [50,70]), eater 112-145 (base [45,75]). Audit unarmored was
  NEVER run (post-armor audit hits ran 24-71, which cannot
  identify a raw hit). The inflation was reported as "the
  sigW4 layer", mechanism NOT attributed. This arm attributes
  it or fails trying.
- sim-volleyfix-b: lone-fighter ceiling; fixture pattern
  (full Game.state restore per fight, fresh beast entity,
  mulberry32 streams) reused here.

## Code-read attribution, stated BEFORE the numbers (the hypothesis under test)

Read from src/js, not assumed (line numbers drift; function
names are the citation):

1. fieldFights.js fieldFight, monster phase: for each live
   pack member it rolls ONE attack from the multi-move kit
   (mdef.attacks filtered to entries with damage; the filter
   honors hpBelow/hpAbove ONLY — cooldownTurns and
   firstTurn are NOT honored), `d = lroll(rDmgRange)`, then
   passes `total` through sigW3b, then
   `Game.sigW4FieldMonster(mdef, rec, {total, round, ...})`,
   then armor (skipped here: varmor = 0 unarmored), then
   wornDamage (no accessory worn by this leader: passthrough
   expected — verified empirically, see proof test), then
   the log line `R<round>: <atkName> hits <name> for <total>`.
   The log line therefore shows the FINAL hit, and the
   sigW4 wrapper in the fixture records the sig delta
   (sig-returned total minus incoming total) per call, so
   every hit decomposes as: log-final = base roll + sig
   delta (+ 0 expected from armor/wornDamage/abilities).
2. sigW4.js sigW4FieldMonster, congregation branch: on rounds
   where round % 3 === 1 it ADDS `lroll([50,70])` to total on
   top of the generic roll. It does NOT consume the attack
   (returns a number; the generic roll already happened).
   Predicted round-1 congregation total = Absolution
   [50,70] + sig beam [50,70] = [100,140]. At full HP the
   only legal damaging attack is Absolution (Excommunication
   is hpBelow 0.5; Invitation has no damage and is filtered
   out), so the base band is unambiguous in round 1.
3. sigW4.js sigW4FieldMonster, eater branch: EVERY round it
   ADDS `lroll([45,75]) + floor(round/2)*15` growth to total.
   Predicted round-1 eater total = base + [45,75] + 0:
   Gorge [45,75] -> [90,150]; Smack-Rush [55,85] ->
   [100,160] (Smack-Rush IS in the round-1 pool because
   cooldownTurns is not honored by the filter; Graze has no
   damage and is filtered out). Predicted combined round-1
   range [90,160], attack-dependent.
4. sigW4.js sigW4FieldMonster, audit branch: on round % 3
   === 0 it taxes the VILLAGER's strike (rec.auditTaxRounds
   = 2) and adds NOTHING to monster damage. Predicted
   round-1 audit total = base only: Assessment [55,75]
   (weight 3) or Field Audit [40,60] (weight 2; cooldown
   not honored), combined [40,75], sig delta exactly 0.
   Audit is the CONTROL beast: if audit round-1 hits also
   ran ~2x, the sigW4-add attribution would be wrong and
   something else (double attack, pack double-count) would
   be implicated.
5. packN: `Math.max(1, (mdef.pack || 1))` — none of the
   three beasts has a pack field, so exactly ONE member
   acts per round: one hit per round, no pack doubling.
   Leader: boris_kowalski, held ability iron_stomach only
   (food-only, no fieldFight effect) — no unbreakable
   brace, no shield_wall, no draw_fire/bodyguard, so no
   leader-side hit modification is expected.

Tolerance, stated up front: a round-1 hit "matches" the
attribution iff (a) its sig delta lies inside the predicted
sig band for that beast/round (congregation [50,70] on
round % 3 === 1, 0 otherwise; eater [45,75] + growth on
round r; audit 0 always), AND (b) its base component
(instrument-leg hit, same stream) lies inside the logged
attack's def band. The attribution is corroborated iff the
instrument leg (below) agrees per the GO rule. A single
unexplained out-of-band hit does not sink the arm; it is
reported as an unexplained layer and counts against the
7/8 per-beast bar.

## The fixture band

One harness load (scripts/sim-harness.js loadGame +
setupGame, seed 4242 — the volleyfix/partyvolley fixture
seed). Leader boris_kowalski fixed before every fight: age
35, temperament steady, health 100. Before EVERY fight the
script restores the staged villager record in place, the
FULL Game.state from a deep snapshot, and exactly the
fixture gear. Each fight calls the REAL Game.fieldFight
with a fresh beast entity { hp: midpoint, maxHp: midpoint }
(congregation 1000, eater 1050, audit 1200 — the
partyvolley midpoints), no awareness (forced meeting),
opts.rng = mulberry32(stream). Solo leader (party 1, no
allies): every monster hit lands on the leader, so
"leader died that round" is unambiguous and no ally
share (40%) contaminates the hit record.

Gear (leader only): DUAL = machete + crude_bow + 8 arrows,
NO armor. Unarmored is the point: armor would absorb a
pierce-reduced share and hide the raw hit.

Variants (main leg): P1-DUAL x congregation, P1-DUAL x
eater, P1-DUAL x audit. Each x 8 rng streams (301-308):
24 main-leg fights.

INSTRUMENT LEG (paired counterfactual, same 8 streams per
beast, 24 fights): the fixture wraps
Game.sigW4FieldMonster so it still CALLS the original
(same RNG draws consumed, same side effects including
audit tax and narration) but RETURNS the pre-sig total,
i.e. the signature damage component is zeroed in the
return value only. Per-stream paired comparison: main
hit minus instrument hit = the signature component, draw
for draw. For audit the instrument leg must come out
IDENTICAL to main on monster hits (delta 0), which is
itself a check on the instrument. This leg changes no
default, no src, no policy; it exists only inside the
fixture process.

Per-hit record (every monster hit on the leader, all
rounds until the fight ends): beast, stream, leg (main /
instrument), round, attack name (from the log line),
base band for that attack (from src/data/monsters.json),
sig delta (from the wrapper), observed final damage
(from the log line), leader HP after the hit, whether
the leader died that round (HP <= 0 after that hit),
and whether the hit was signature-inflated (delta > 0).
Per-fight record: variant, stream, leg, rounds, outcome,
round-1 leader-death flag, volley damage (context only),
total vTaken, full log.

## Pre-registered GO threshold (judged exactly as written)

PRIMARY METRIC: round-1 leader-death share on unarmored
leaders + per-type hit distribution (median, range, share
of hits above the logged attack's base band top), main leg,
round-1 hits only (n = 8 per beast).

Verdict DIAG-GO iff ALL of:
- G1 (records): all 24 main-leg + 24 instrument-leg
  fights complete with per-hit records for every monster
  hit (no fight throws, no missing log line).
- G2 (attribution, per beast, round-1 hits): congregation
  AND eater each have main-minus-instrument delta inside
  the predicted sig band on >= 7/8 streams AND the
  instrument hit inside the logged attack's base band on
  >= 7/8 streams; audit has delta 0 and main hit inside
  the logged attack's base band on 8/8 streams (the
  control bar is strict because the prediction is exact
  zero-add).
- G3 (determinism): the fixture script run twice produces
  byte-identical corpus files (no timestamps/timings).
Verdict DIAG-NO-GO iff any prong misses (a miss is NO-GO,
never re-scored against a friendlier metric mid-run;
doubts go under "metric review" for the NEXT run).
KILLED-AT-PILOT iff the fixture cannot produce per-hit
records at all (harness/fixture failure), not on numbers.

PREDICTED round-1 numbers (for the evidence file to judge
against, not additional gates): congregation deaths 8/8
(min total 100 = leader HP), eater deaths high but < 8/8
(min total 90 < 100), audit deaths 0/8 (max total 75);
congregation round-1 median ~120, eater ~120-125,
audit ~57-60; share of round-1 hits above base band top:
congregation 8/8, eater 8/8, audit 0/8.

SECONDARY (reported, never promoted to judge):
- All-rounds hit distribution per beast (rounds 2+
  only exist where the leader survives round 1 — mostly
  audit, some eater); congregation rounds 2-3 predicted
  in-band [50,70] (no sig add off beam rounds) IF any
  leader ever survives to see them.
- Sig delta by round (eater growth staircase: +0/+15/
  +15/+30... by round).
- Round-1 death share pooled (24 fights) and per beast.
- Log-final vs sig-total agreement: for every recorded
  hit, log-final damage must equal (base + sig delta)
  as reconstructed from the wrapper; any mismatch is a
  named unexplained layer, not assumed away.
- Sense-testing: read at least one full transcript per
  beast and judge whether the signature beat reads as a
  legible second blow or as one inflated blow (the log
  shows ONE line per hit — the decomposition is
  instrument-measured, not narrated).

## Horizon, policies, wall numbers, panel

- Horizon: NOT APPLICABLE. Fixture fights are not sim days;
  death-aware horizons apply to live sims, and the reason
  the fixture band is the right instrument here is that
  the question is per-hit damage arithmetic through the
  real fight engine, which a live sim cannot isolate
  (awareness, party, armor, and morale would all
  confound the hit record).
- Policies: NONE. No policy drives a fixture fighter.
- Wall numbers (national / table / wins / wave reach): NOT
  OBSERVABLE on this substrate, stated structurally, not
  as 0s. The wall relevance is the attribution: if
  one-shot round-1 deaths are a sigW4 double-count by
  design (generic roll + signature roll stacked), the
  wave-4 wall is a damage-stacking rule, not a stat
  problem — and any lever answer must address the stack.
- Panel (§15): NOT APPLICABLE, and none fabricated. No
  before/after comparison exists in this arm (the
  instrument leg is a paired measurement leg, not a
  policy before/after), so no balance-panel compare is
  owed. The judge is the pre-registered GO rule above.

## Sense-testing

Read at least one full fight transcript per beast and
judge whether the monster's signature beat reads as
people-facing fiction (a beam, a gorge, an audit) or as
an unexplained number — and whether the one-line-per-hit
log honestly represents a two-component hit.

## Metric review (for the NEXT run, never a re-score of this one)

Doubts about the metrics above go here in the evidence
file after the run; they do not change this run's verdict.
