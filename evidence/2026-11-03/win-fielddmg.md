# Winnability push arm 2: field-fight damage + staying (2026-11-03)

Branch win-fielddmg, base 6fb93c5c4 (master after the sim-sortieretry-a
evidence merge; arm 1's wild-join work untouched — this arm changes only
what happens ONCE fighters are in the fight).

## In plain words

A geared two-fighter party used to lose to a wave-4 beast almost without
hurting it: the second fighter hit like a slap, died in a round or two
without armor, and the pair ran away in round 2. Three separate bugs
caused that, all fixed here:

1. **Wave-4 beasts hit twice per round off-screen.** In the player's own
   fights, the Congregation's beam, the Suburb's tax, the Algorithm's
   attack and the Eater's gorge ARE the monster's attack for that round.
   Off-screen, the engine rolled that attack and then the signature hook
   rolled it a second time on top. Beam rounds dealt ~100-140 raw damage
   instead of ~50-70. Fixed: the hook now narrates only (the Eater keeps
   its growth bonus, which is genuinely extra). The Congregation's argue
   trick also actually works now: it used to print "(No beam.)" while the
   beam still landed in full; arguing now zeroes the beam round.
2. **The ally fought with a slap, not their weapon.** Ally strikes were a
   flat 3-6 no matter what they carried, while the leader's identical
   weapon dealt ~24-60. The ally now strikes with their own weapon on the
   leader's formula, wears their own armor against hits on them, and gets
   the same well-fed strike bonus the leader gets (the leader's strikes
   carried x1.3; the ally's never did).
3. **Morale judged a solo fight while a party stood there.** The
   hopeless check compared the leader's survival alone against the kill
   time, and it fired at round 2 before a known trick could even be used
   (argue first fires round 3). Party fights now compare the party's
   combined health against total incoming, and a fighter who knows the
   beast's trick holds past round 2 to use it (same 25%-health threshold
   as the existing mid-trick hold; floor flee and death untouched; solo
   and trick-less fights unchanged).

No gates, prices, thresholds, or readiness numbers changed. No roster-fed
or list-fed logic added (ally gear reads the ally's own record only;
foreign allies keep the old flat strike). The 2-fighter engine cap is
untouched — and, per the numbers below, is NOT the binding constraint
for a prepared T4 party anymore.

## Proof (identical seeds 9201-9205, party vs 1000-HP beast)

Committed test: `scripts/test-winfielddmg-20261103.js` (6/6 PASS).
Method: same fixture as the Nov 1 audit's wave-4 bar (leader + ally,
T3 phase_blade/investigators_coat or T4 godslayer_spear/
lifebound_vestments), arena (noFlee) + wild, congregation + strike.

BEFORE (master) -> AFTER (this branch), median % of beast HP dealt /
median rounds / median ally damage:

| fight | before | after |
|---|---|---|
| congregation T3 arena | 10% / 3 / 3 | 36% / 5 / 177 |
| congregation T3 wild | 5% / 1 / 3 | 18% / 2 / 91 |
| congregation T4 arena | 20% / 4 / 9 | 100% / 10 / 598, wins 3/5 |
| congregation T4 wild | 13% / 2 / 6 | 62% / 6 / 370, wins 1/5 |
| strike T3 arena | 24% / 5 / 14 | 36% / 4 / 177 |
| strike T3 wild | 10% / 2 / 11 | 18% / 2 / 94 |
| strike T4 arena | 38% / 6 / 15 | 61% / 6 / 248, wins 0/5 |
| strike T4 wild | 14% / 2 / 11 | 61% / 6 / 242, wins 0/5 |
| TOTAL wins | 0/40 | 4/40 |

Prepared wild parties (trick known + war_cry/rally/unbreakable, T4):
congregation 3/5 wins, 10 rounds, 100% median; strike 1/5 wins, 6 rounds,
61% median. Unprepared wild parties still mostly flee at round 2 — that
is now honest (an ignorant party genuinely loses the damage race), and
they deal 2-4x more on the way out. A prepared party is what turns a
wave-4 meeting into a kill, which is the veterans pipeline working as
designed rather than a stat gift.

## What is still short (honest, not held)

- Strike T4 arena: 0/5 wins at 61% median — the strike's shutdown
  mechanics (dead turns) still tax the party; the remaining gap is one
  strong round, not a wall.
- T3 parties still cannot kill a full-HP wave-4 beast (36% arena
  median). T3 is a wounding tier now, not a killing tier — kills need
  T4 gear, tricks, and abilities together, or a previously wounded beast.
- Ally defensive verbs (their own dodge/blind) still do not apply to
  hits on the ally — offensive parity landed, defensive parity is a
  follow-up, not a blocker.

## Files

- `src/js/sigW4.js` — beam/tax/attack/gorge de-duplication + argue fix.
- `src/js/fieldFights.js` — ally gear/strike/armor/multiplier, party
  morale, known-trick hold, header rules.
- `scripts/test-winfielddmg-20261103.js` — proof test (6/6).
- This evidence file.

[needs-eyes] — combat feel change: wave-4 field fights last longer and
hurt more; a prepared party can now actually win one.
