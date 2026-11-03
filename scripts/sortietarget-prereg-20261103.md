# Pre-registration — sim-sortietarget-a (Loop A 20261103, axis scale-onramp)

GAME-CODE ARM, the 0815Z run's next blank 1: the sortie TARGET-AGREEMENT
fix. Sortiev2 (evidence/2026-11-03/sim-sortiev2-a.md) settled Q1 YES (a
policy layer can skip stale offers on legal inputs) and Q2 NO (no
policy-side hook exists: answerLingerer(how) takes only the choice
string, lingererSortie() takes no arguments and fights every current
lingerer in world-array order, and no legal name-to-id join exists).
This arm builds the game-code fix, with its own proof, and measures it
before/after on identical seeds. This prereg is committed BEFORE any
judged work (sortiev2 precedent).

## Canon read first

docs/CANON.md read. There is NO dedicated lingerer/sortie canon doc
(docs/ grep finds lingerers only in SIMULATING.md, ONTOLOGY.md, and the
decision pack) — no canon is invented here. The sortie mechanism's own
source is the code header in src/js/havenGrowth.js (design call #8,
2026-10-16: "Endure it" default vs costly played sortie) plus the
beats-panel row in src/js/app.js. docs/PERCEPTION.md read: the
perception law that governs the join below is the standing law that
villagers (and policies standing in for the player) know who's around
only through their own senses — seeing someone in the same place,
hearing a shout, following someone they've seen — never through a
magic roster, snapshot, or list-fed decision. (The PERCEPTION.md doc
itself documents perception HINTS, the UI line; the law as applied here
is the standing perception-law ruling carried in the alignment
synthesis and the sortiev2 Q2 settlement.)

## The change (game code only, plus policy/instrument/evidence for this arm)

1. Thread an optional target through answerLingerer(how, targetKey?)
   -> lingererSortie(targetKey?). Absent or unmatched id falls back to
   the current world-array order, unchanged.
2. World monster entities carry NO unique id (src/js/game.js
   spawnWorldMonster: {id = monster-def id, tx, ty, mx, my, hp, ...} —
   and havenGrowthDaily re-pins ALL lingerers to the Haven tile, so
   even tile does not disambiguate two lingerers, let alone two of the
   same kind). So the engine stamps a stable per-entity token,
   `lingerKey` ('ling' + a state counter), when lingering starts (the
   two havenGrowth sites) and lazily in lingeringRaiders() (covers
   direct lingering=true sets and old saves). The token is
   entity-identity, not a monster-def id: same-kind twins get distinct
   keys.
3. Beats panel (src/js/app.js): one sortie button PER lingerer, each
   labeled with that lingerer's name and carrying its key
   (data-beat="lingerer:sortie:<key>"); the handler passes spec[2] as
   the target. The single joined-name button cannot express a target
   and is replaced for the sortie choice (Endure stays single: it is
   a global answer). This is a UI change: [needs-eyes] on the commit.
4. Engine offer record: when havenGrowthDaily speaks a gorge line for
   entity m, it records state.lastLingererOffer = {key, name, day}
   (name via the same monsterDisplayName the line itself uses). The
   record is overwritten nightly, so it always holds the LAST
   announced offer — the latest voice from the treeline.

## Design call: MATCH-FIRST (not match-only)

A sortie today fights every lingerer in turn for one muster + one
ration payment. MATCH-FIRST keeps that contract: fight the matching
raider FIRST, then the rest in current order, if the party survives.
Reasons: (a) the broken promise in sortie-b was order/omission — the
offered name was never fought because the party broke on earlier
fights — and match-first repairs exactly that: the named target is
fought first, at full party strength, guaranteed; (b) match-only
would strand the other lingerers gorging while the party already paid
full rations, a worse price and a feel regression, and would need new
price semantics (rations per fight? one sortie per lingerer?) — a
bigger design change than this wiring arm; (c) match-first preserves
comparability with the baseline (same fights, different order, plus
the guarantee). Steve can overrule to match-only; the parameter
threading is identical either way, only the loop order changes.

## Join legality argument (perception law)

Two joins, both legal; neither reads a roster in policy:

(a) THE BEATS BUTTON (the real player path, primary). The beats panel
is rendered by the engine from its own lingerer list: one row per
lingerer's spoken name, each button carrying that entity's key. The
player taps the named row — pointing at a named thing standing at the
treeline, announced nightly. The decider (the human) reads no roster;
the engine renders what the village can see. Legal by construction.
Twin-name caveat (knowledge-gating, pre-existing, not created here):
two unidentified lingerers share one spoken string, so their buttons
share a label; tapping either aims at that entity. The ambiguity is
inherent to unidentified monsters, not introduced by this change.

(b) THE ANNOUNCED-OFFER RECORD (the sim-policy path). The policy
reads ONLY state.lastLingererOffer plus the say transcript — i.e.,
what was announced aloud — and passes its key. The record holds ONE
entity (the last announced), written ONLY when the engine itself
speaks a gorge line; it is announcement memory, not a roster, not a
list, not a position channel. Reading it is the same class as reading
the spoken line it transcribes. The policy NEVER calls
lingeringRaiders() or worldMonsters() — the policy file and the proof
test assert the absence of those tokens (sortiev2 cleanliness-leg
precedent). If no legal join existed, this arm would stop before
building; the joins above are why it proceeds.

## Attribution instrument (0815 lesson applied)

NEVER a post-return tbfight.id wrap (the 0815 failure: node combat
runs synchronously, tbfight is nulled at fight end, the wrap can never
fire — and lingerer fieldFights never create a tbfight at all).
Attribution here is RETURN-VALUE, captured at fight start: inside
lingererSortie's loop, AFTER the skip check and BEFORE the fieldFight
call, the fought entry {key, id, name, outcome} is appended; outcome
is filled after the call (or 'error'/'none' if the call throws or
returns no record). The return object gains: fought[], targetKey,
targetMatched, raidersAtStart. The driver logs every answer call
(day, how, targetKey, ret.ok/why/cleared/fought/raidersAtStart/
targetMatched). FIRE COUNT = total fought entries across sorties,
reported alongside EVERY agreement number. A zero fought count with
ok sorties would be a broken instrument, reported as such, never as
a zero effect.

## Measurement — staged (MEASUREMENT §§9–12, 14–15)

- STAGE 0 (fixture sweep, part of the pilot gate): constructed
  treelines in scripts/test-sortietarget-a.js — 3-lingerer treelines
  including same-kind twins, target = middle entity, across ≥20
  seeded runs. Legs: match-first order, unmatched-key fallback to
  current order, absent-key fallback to current order, single
  lingerer, endure unaffected, keys stable across a second call,
  offer record stamped by the gorge loop, beats-panel static legs
  (per-lingerer button template + handler passes spec[2]).
- STAGE 1 (pilot, 8 seeds): identical-seed driver table (sortie-b
  precedent), seeds 98401–98408, 180d death-aware cap (sortie-b
  horizon; reachability-lever guide 150–200d), closecommit stack
  (tribfloor leadfeast + windefer + seatdrive + fullseat-diag +
  titanroute + musterclose + mustergap) + sortietarget answer layer.
  Env flags, same seven as the sortie driver: FEASTSCALE_R13=1
  TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1.
  Mode herald. Answer rule (BOTH arms, identical): in policy daily,
  if lastLingererOffer exists and its (key,day) has not been answered
  yet, answer it once — baseline passes bare 'sortie', variant passes
  ('sortie', offer.key). The ONLY difference between arms is the
  target argument. Q1 invalidation is NOT layered here: it would
  confound the wiring measurement (suppressed attempts differ); the
  retry arm combines Q1 + aiming.
- STAGE 2 (confirm, 12 seeds): ONLY on pilot GO. Seeds 98501–98512
  (next free band; if collided at run time, the next free band is
  used and the substitution is noted in the evidence file).

## Primary metric and GO threshold (binding, §14)

PRIMARY: multi-lingerer aimed-sortie first-fought agreement (field)
— over variant aimed sorties with raidersAtStart ≥ 2 and targetMatched,
fraction with fought[0].key == passed targetKey — corroborated by the
fixture sweep (same fraction over constructed multi-sorties).

GO (all must hold):
- (G1) Fixture sweep: 100% first-fought agreement, n ≥ 20 constructed
  multi-sorties, all fallback legs green.
- (G2) Field pilot: ≥3 aimed sorties total observed (any size) with
  100% target-fought rate (target key appears in fought), AND ≥1
  aimed multi-sortie observed with 100% first-fought agreement, AND
  zero crashes/errors in all 16 runs, AND variant attempts ≥ 50% of
  baseline attempts (the answer layer is alive in both arms).
- (G3) No-regression bars: variant total deaths ≤ baseline + 25%,
  variant wins ≥ baseline wins − 2. (Loose wiring bars, not balance
  bars: fight order legitimately changes RNG paths.)

PILOT EXTENSION: if G2's field counts are short (0 multi-sorties, or
<3 aimed sorties), run ONE pilot-extension band (98409–98416, same
stage, same rule) before any confirm decision. If still short, the
verdict is KILL (loop discipline: no confirm spend on an unexercised
effect; the fixture proof and the kill evidence remain, and the
feature returns as a held item in sim-findings, not landed).

BASELINE GAP LEG (report-only, not a GO bar — the gap itself is
already code-settled by sortiev2 Q2): baseline first-fought agreement
(fought[0].key == latest-offer key) over baseline multi-sorties.
Expected near 0%: world-order-first is not world-order-last for n ≥ 2.
If baseline multi-sorties = 0, this leg is unjudged, not failed.

CONFIRM GO: same G1–G3 bars on the confirm band (fixture legs
re-run, not re-counted). Anything else = KILLED: game-code reverted
before the final commit, no trace left except evidence/prereg/proof
of the kill (policy + driver deleted per kill protocol).

## Balanced panel (§15) — non-applicability, stated plainly

The §15 panel binary runs registry policies only, and no registry
policy answers lingerers — so no panel run can observe a sortie, and
a panel compare would be blind to this arm's entire observable. The
before/after instrument is therefore the identical-seed driver table
(sortie-b precedent, accepted in the 0815 coordinator evidence):
identical seeds, matched stack, one shared instrument, the
pre-registered threshold as judge. check.js --quick runs as the
regression smoke after the game-code change. No panel compare is
attached, and none is claimed.

## Sense-testing

Read transcripts: at least one aimed multi-sortie per arm (say lines
from the driver run, excerpts quoted in the evidence file). Judge:
does the sortie read as the village answering the named beast, and
does the aftermath line match what was fought? A wiring arm still has
to read sensibly.

## Kill protocol

On KILL: revert src/js/havenGrowth.js + src/js/app.js to base,
delete scripts/policies/sortietarget.js + scripts/sortietarget-driver-20261103.js,
keep prereg + proof test (rewritten to prove the kill: fallback-order
and no-target-parameter legs, as applicable) + pilot JSONs + evidence.
Worktree left with ONLY committed work at closeout.

## Files

- Prereg: scripts/sortietarget-prereg-20261103.md (this file).
- Game code: src/js/havenGrowth.js (threading + lingerKey + offer
  record + return attribution), src/js/app.js (per-lingerer buttons
  + handler).
- Policy: scripts/policies/sortietarget.js (bare + aimed wrappers).
- Driver: scripts/sortietarget-driver-20261103.js.
- Proof: scripts/test-sortietarget-a.js.
- Evidence: evidence/2026-11-03/sim-sortietarget-a.md.
- Per-seed JSONs: evidence/2026-11-03/perseed-sortietarget-a/.
