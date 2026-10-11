# Scale pacing fix — evidence (2026-10-11)

Steve: "National is being hit way too quickly. Pacing is off."
Correction: 1 season = 30 days. Ladder is one rung per season:
VILLAGE days 1–30, REGIONAL days 31–60, NATIONAL days 61–90, GLOBAL/table 91+.

## Diagnosis (from evidence/2026-10-11/journey-scale.md)

Seed 99: village→regional (day 26)→national (day 34) — 10 days from first
proposal to national, via COVENANT. Three peer proposals accepted days 31–33;
`_covenantPolity()` counted ≥3 peer links with zero maturity requirements.
Meanwhile 3/4 seeds had 48/48 proposals declined — a lottery, not a climb.

## The fix (src/js/hierarchy.js)

1. **Polity links must be seasoned** (`_linkSeasoned`): 30+ days old AND
   trust 40+ (formed at 30 — tending required). Conquered links: the season,
   not the trust. Applies to covenant, trade, and LEAD subordinate links.
   BELONG unchanged (trust 50, arrears 0, 14 days).
2. **The gesture is not the Dawn**: the first accord gesture stages at link
   formation, but the Regional Dawn (networkLive) waits until a bond is 21+
   days old. `networkLiveDay` tracked. Regional before ~day 25 impossible.
3. **One rung per season**: `_checkNational` requires regional ≥ 30 days old.
4. **Peer binding needs courtship**: `_proposePeer` requires opinion ≥ 10.
   Below the bar: honest refusal, no -5 (a prerequisite, not an ask).
5. **The decline is a beginning**: declines bank `ov.courtshipDeclined`;
   climb verbs ('codex'/'broadcast'/'aid'/'gift') land +1 harder for 28 days.
   The decline line names the single most relevant unbanked verb.
6. **Seasons said aloud**: third bond without maturity gets one honest line
   ("bonds aren't seasons") — once, never ticked daily.

Beats kept: Founding Council, First Court, Iron Court, Binding, Charter —
every REFUSE option intact.

## Before/after (courtship-seed replays, proof test)

| Seed (courtship pace) | Regional before | Regional after | National before | National after |
|---|---|---|---|---|
| aggressive (links d25–30) | d20 | d41 | d20 | d71 |
| seed-99-like (links d31–33) | d25 | d46 | d33 | d76 |
| steady (links d40–50) | d35 | d56 | d35 | d86 |
| slow (links d43–53) | d38 | d59 | d38 | d89 |

("Before" = pristine master replayed through the same harness; the harness
drives the real daily flow. Pristine national days are even faster than
seed-99's day 34 because the harness skips the proposal negotiation.)

- Zero seeds national before day 60 (was: all four before day 40).
- Median national: 81 — in the 65–90 window.
- Regional: all in 31–60, none before 25.
- Seed-99's actual arc (regional d26 → national d34) becomes regional d46 →
  national d76: the same realm, one season later, with tended bonds.

## Proof

`scripts/test-scale-pacing.js`: **47/47 GREEN × 3 seeds** (99, 777, 424242).
RED on pristine: 22 failures (including "national day 20").

- (a/a2/a3) maturity gates: fresh/high-trust-only/season-only links rejected;
  seasoned+tended accepted; 2/3 insufficient. Covenant, trade, LEAD, CONQUEST.
- (b) courtship distribution: table above.
- (c) spam (mocked accepts) forms links but never stages a beat (trust 30).
- (d) climb verbs: +3 codex, +2 broadcast; +1 watch bonus inside 28d of a
  decline; no bonus outside window, on unmarked nudges, or on negatives.
- (d2) opinion-10 floor: refused before judgment with a human line, no -5;
  proceeds at opinion 10.
- (e) BELONG reachable, gates unchanged.
- (f) REFUSE offered and permanent.
- (g) Dawn timing: link day 4 → Dawn day 25 (21-day bond).
- Ontology: 76/76.

## Regressions

- `test-national-shapes-20261010.js`: 3 failures — all pre-existing on
  pristine (wave-5 gate assertions, unrelated to scale pacing). Updated the
  test's fixtures to the new honest contract (seasoned links).
- Ontology validator: 76/76 green.

## Sense check (new copy, read aloud)

- Courtship floor: "Emberhold barely knows Haven's name — and a covenant is
  a relationship, not a handshake. Sit with them first: walk to their fire
  and study their codex, win where the region hears it, give it weeks. Come
  back when they know what Haven is." — human, specific, no mechanics lecture.
- Decline: "Emberhold declines. [reasons] The door isn't shut — just not
  today. They're watching now, and the climb lands harder while they watch:
  walk to their fire and sit with their book — study their codex (+3 in their
  eyes, once). Don't join their fire to be heard: that's leaving yours, and
  only Haven's own can propose. Asking again cold costs you (-5 each time);
  deeds don't." — the numbers are the existing visible-climb contract.
- Seasoning: "Three bonds. But bonds aren't seasons — a league is a
  relationship, and relationships take seasons. Tend these fires — keep the
  trust, keep the weeks — and the council will come."
- Dawn wait: "Three weeks. That's how long before a handshake is a
  relationship — the System will say so when it's true. Tend this fire."

## Files

- `src/js/hierarchy.js` (gates, Dawn split, rung gate, courtship floor, watch bonus)
- `src/js/debug-scenarios.js` (networkLiveDay in the regional debug setup)
- `scripts/test-scale-pacing.js` (new proof, 47/47 ×3 seeds)
- `scripts/test-national-shapes-20261010.js` (fixtures updated to seasoned links)
- `docs/SCALE.md` (pinned ladder, maturity gates, changelog)
- `evidence/2026-10-11/scale-pacing.md` (this file)
