# sim-sighit-b — signature-hit measurement: the one-shot is a stacked roll, not a stat (DIAG-GO)

Run: Loop B, oversight-flesh-out-loop-b, axis scale-onramp, arm
sim-sighit-b. Worktree branch: sim-sighit-b. Base anchor:
b2518ece2863e6ebb8a34d60fa747bc0d9456b14 (recorded in every
corpus file).
Pre-registration: evidence/2026-10-31/sim-sighit-b-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/sighit-fixture-20261031.js (forced-meeting
fixture band through the real Game.fieldFight; solo unarmored
leader; a record-only wrapper plus a paired signature-suppressed
instrument leg inside the fixture process only — no game code
changed, no policy, no policy-default flips, no src edits).
Proof: scripts/test-sighit-b.js — all checks GREEN
(determinism gate: fixture re-run byte-identical to corpus;
independent re-derivation of every round-1 summary and the GO
gate; per-hit integrity; audit control exactness; DIAG purity:
no src/ file modified).
Corpus: evidence/2026-10-31/perseed-sighit-b/fixture-band.json
(48 fights: 3 beasts x 8 streams x 2 legs; per-hit records for
every monster hit).
No [needs-eyes] (measurement only; nothing player-facing ships).

## Verdict: DIAG-GO

Judged exactly against the prereg:
- G1 (records): 48/48 fights with per-hit records, no throws,
  no missing log line — PASS.
- G2 (attribution): congregation paired round-1 deltas in the
  predicted sig band 8/8, instrument hits in base band 8/8;
  eater 8/8 and 8/8; audit delta 0 and in-band 8/8 (strict
  control bar) — PASS.
- G3 (determinism): rerun byte-identical — PASS.
The mechanism is attributed, not just observed: the inflation
is the sigW4 field layer ADDING a second roll on top of the
generic attack roll in the same hit. Details below.

## The answer in one paragraph

A wave-4 monster does not hit "about double" by having big
stats. It hits twice in one log line: fieldFight rolls the
generic attack from monsters.json, then sigW4FieldMonster adds
a second signature roll to the same total, and the fight log
prints the sum as a single blow. The Congregation's round-1
hit is Absolution [50,70] PLUS a signature beam [50,70] =
[100,140]; the Eater's is its attack [45,75]/[55,85] PLUS a
signature gorge [45,75] = [90,160]. A 100-HP unarmored leader
therefore dies to the first hit, every time in this band
(congregation 8/8, eater 8/8 round-1 deaths). The Audit proves
the attribution by not doing it: its signature branch taxes
the villager's strike and adds nothing to monster damage, so
its round-1 hits land exactly in-band ([40,75], median 57,
0/8 deaths) and its instrument leg is byte-for-byte identical
to its main leg on every round. Remove the stack in the
instrument leg and the one-shots vanish: congregation round-1
deaths 8/8 -> 0/8, eater 8/8 -> 0/8, with the base hits
landing exactly inside their def bands.

## Numbers (main leg, round-1 hits, n = 8 per beast)

| Beast | Attacks seen (base band) | Observed median | Observed range | Above band top | Round-1 deaths |
|---|---|---|---|---|---|
| Congregation | Absolution [50,70] (8/8) | 116 | 108-135 | 8/8 | 8/8 |
| Eater | Gorge [45,75] (4/8), Smack-Rush [55,85] (4/8) | 125.5 | 104-138 | 8/8 | 8/8 |
| Audit | Assessment [55,75] (4/8), Field Audit [40,60] (4/8) | 57 | 43-71 | 0/8 | 0/8 |

Paired instrument leg (same streams, signature component
zeroed in the return value only, same RNG draws):
- Congregation round-1: median 59.5, range 51-69, 0/8 above
  band, 0/8 deaths. Paired deltas (main minus instrument):
  53, 66, 59, 59, 51, 51, 67, 62 — all inside the predicted
  signature beam band [50,70].
- Eater round-1: median 65.5, range 45-78, 0/8 above band,
  0/8 deaths. Paired deltas: 72, 58, 54, 65, 59, 70, 54, 48 —
  all inside the predicted signature gorge band [45,75]
  (round-1 growth is floor(1/2)*15 = 0).
- Audit round-1: median 57, range 43-71, identical to main
  on every stream. Paired deltas: 0 on all 8.
- Instrument-leg outcomes (what unstacked wave-4 looks
  like): congregation 4 vDie / 4 vFlee (leaders die by
  round 2 from TWO in-band hits, not one stacked hit);
  eater 2 vDie / 6 vFlee; audit 5 vDie / 3 vFlee, identical
  to main (the control changing nothing, as predicted).
- Reconstruction: log-final damage equals the sig-returned
  total on EVERY recorded hit (0 mismatches across all
  rounds and legs). No hidden layer — no armor (varmor 0),
  no worn-accessory avoidance (leader wears none), no
  leader-ability modification (boris_kowalski holds
  iron_stomach only, food-only) — sits between the sig
  total and the log line.

All-rounds (context, not the judge): congregation main has
no round-2 hits at all (every leader died in round 1);
eater main likewise. Audit main runs 13 hits over 1-2
rounds, all in-band, median 56 — the honest contrast: the
Audit kills by accumulation (two in-band hits), the other
two kill by stacking.

## Mechanism attribution (code citations)

fieldFights.js fieldFight, monster phase (function names
are the citation; line numbers drift):
- Multi-move selection picks ONE attack from mdef.attacks
  (entries with damage only; the filter honors hpBelow /
  hpAbove ONLY — cooldownTurns and firstTurn are NOT
  honored, which is why Smack-Rush and Field Audit, both
  cooldown-gated in the defs, fire in round 1 here).
- `d = lroll(rDmgRange)` — the generic roll.
- The sigW4 call passes that total through
  `Game.sigW4FieldMonster(mdef, rec, {total, round, ...})`
  and takes the returned number as the hit. It does NOT
  skip the generic attack: the signature is additive by
  construction.
- Armor (skipped, varmor 0), wornDamage (passthrough, no
  accessory), then the log line `R<round>: <atk> hits
  <name> for <total>` — one line for a two-component hit.

sigW4.js sigW4FieldMonster, per beast:
- Congregation, rounds where round % 3 === 1: `total +=
  lroll([50,70])` (the beam). Other rounds: no add. (The
  invitation/geas/liturg
...[truncated 4936 chars]