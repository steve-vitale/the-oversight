# sim-tendexact-a — tend pays exactly 1,500 (finding #2072)

Arm: sim-tendexact-a, run fleshout-20261110T1215Z (Loop A), axis
scale-onramp / winnability chain. ADOPTED by run
fleshout-20261110T1415Z after the 1215Z run died mid-sweep — see
§ Adoption note. Base SHA: e2983bb90 (master at spawn; includes
landed talkturn-a and answermail-drive-a). Prereg:
evidence/2026-11-10/sim-tendexact-a-prereg.md (committed as
9926c9e4d before any judged sim). Fix commit: be3fb880c
(exact-split `_removePantryKcal`, src/js/hierarchy.js).

Finding: sim-findings #2072 — tendLink removes whole pantry items:
9 of 99101's 10 tends paid 1,600 kcal, not the 1,500 sticker price
(41 tends paid 64,732 kcal band-wide vs 61,500 at sticker, ~5%
over). The +8 trust is priced on 1,500, so the village pays ~5%
more grain than the fiction names. The fix splits the final unit
into a remainder piece (whole unit, units=1, reduced kcalEach,
proportional kg — the representation `depositPantryPieces` already
mints); it never mints fractional units. No trust, cap, price,
deed, or gate number moves.

## Verdict — GO

Primary (every tend pays exactly 1,500, >= 8 tends, none over):
**GO** — armed 54/54 exact, 0 overpaid, 0 partial. Cost bar
(scalemetric deciding bar): **PASS** — starvation 4 -> 0,
arm-only 0, median 124 vs 127.5 (bar 102). Judged strictly
against the prereg; no re-scoring. Confirm band 150209-150216 is
RESERVED for this arm per its prereg (freshness re-check at
confirm time); this run does not spend it — the confirm is the
next run's work.

## Per-seed table (analyzer scripts/tendexact-analyze-20261110.js)

seed | days base->armed | tends | paid base->armed | exact/over/partial armed | capped (lost) | starv base->armed | maxWave base->armed | scale base->armed
150201 | 141->131 (village-lost->village-lost) | 10->8 | [1500,1650,1600,1600,1600,1600,1600,1600,1658,1500]->[1500 x8] | 8/0/0 | 0 (0) | 0->0 | 4->5 | regional->regional
150202 | 92->107 (village-lost->village-lost) | 2->2 | [1500,1500]->[1500,1500] | 2/0/0 | 0 (0) | 0->0 | 4->4 | village->regional
150203 | 72->72 (village-lost->village-lost) | 6->6 | [1500,1500,1500,1600,1600,1600]->[1500 x6] | 6/0/0 | 0 (0) | 0->0 | 4->4 | regional->regional
150204 | 150->143 (survived->village-lost) | 7->7 | [1716,1600,1500,1648,1600,1600,1500]->[1500 x7] | 7/0/0 | 2 (9) | 0->0 | 4->4 | regional->regional
150205 | 122->135 (village-lost->village-lost) | 4->4 | [1500,1500,1500,1600]->[1500 x4] | 4/0/0 | 0 (0) | 1->0 | 4->4 | regional->regional
150206 | 134->100 (village-lost->village-lost) | 6->6 | [1630,1539,1901,1560,1560,1565]->[1500 x6] | 6/0/0 | 0 (0) | 2->0 | 4->4 | regional->regional
150207 | 110->150 (village-lost->survived) | 7->10 | [1500,1500,1600,1600,1570,1827,1874]->[1500 x10] | 10/0/0 | 2 (15) | 1->0 | 4->5 | regional->regional
150208 | 133->117 (village-lost->village-lost) | 12->11 | [1500,1500,1500,1600,1600,1600,1520,1560,1500,1785,1536,1560]->[1500 x11] | 11/0/0 | 3 (6) | 0->0 | 5->4 | regional->regional

Band totals (8 seeds/leg): tends base 54 armed 54 | paid base
85,459 (sticker 81,000, over +4,459) armed 81,000 (sticker 81,000,
over +0) | armed exact 54/54 overpaid 0 partial 0 | capped tends
base 4 (trust lost 7) armed 7 (trust lost 30) | starvation base 4
armed 0 (arm-only seeds 0) | deaths base 624 armed 613 | median
survival base 127.5 armed 124 (bar 102) | wall: wins 0->0
national 0->0 table 0->0 wave4 8->8 wave5 1->2 | instrument
errors (both legs): 0.

The control leg reproduces the finding (the fidelity gate): base
pays over 1,500 on 25 of 54 tends, up to 1,901 on a single tend
(150206). The armed leg pays exactly 1,500 on all 54. Per-seed
tend counts differ between legs (150201: 10->8, 150207: 7->10)
while the band total is identical (54/54) — RNG-stream divergence
after the first fix-touched call, not a lever effect; the primary
is per-tend, so it does not matter, recorded here.

## Proof — RED->GREEN, verified by the adoption run

scripts/test-tendexact-a.js: 10/10 checks pass on fixed code
(unit legs: overpay case, remainder-piece shape, no-merge
laundering, small-item, exact-item, multi-item, split-across-
stacks, empty-pantry, conservation; live smoke leg: 150201
answermail 150d, 131 days, 8 tends all exactly 1,500).
RED verified: with the pre-fix hierarchy.js (parent commit
9926c9e4d) swapped in, the test FAILS (exit 1, 4 checks passed —
overpay legs fail: "want 1500 paid 1850"; smoke leg fails: "tend
day 42 paid 1650, not 1500"). Restored byte-identical (`git diff
HEAD -- src/js/hierarchy.js` 0 lines) and re-ran GREEN 10/10 with
the identical smoke output (days=131, 8 tends all 1,500 —
deterministic reproduction).

## Secondary (measure only) — trust lost to the 100 cap (#2073)

Armed 7 capped tends, 30 trust lost (base 4, 7 lost). The cap is
doing more work now that tends fire weekly on the answermail
substrate — 150207 alone lost 15 across 2 capped tends, 150204
lost 9. The cap is NOT moved: whether 100 is the right ceiling
for a seasoned bond is a design question for Steve (#2073 stays
open). Note the armed leg loses more trust to the cap than the
base leg even though both fire the same number of tends band-wide
— capped tends cluster on the seeds that live longest
(150207/150208), i.e. the cap taxes exactly the villages that
season.

## Sense test

The tend line is `🌾 Haven sends {paid} kcal of grain to {village}'s
fire — not tribute, the other way around. Someone's grandmother
over there will remember who fed her. (Trust +8.)` — the line
prints the ACTUAL paid amount. On the fixed code the promise, the
words, and the payment agree: 150207-armed d35/d42/d49 all read
"Haven sends 1,500 kcal of grain to Thornfield's fire …
(Trust +8.)" and the pantry loses exactly 1,500 each time. On the
base code the same line wobbles — 150201-base d38 "sends 1,500",
d42 "sends 1,650", d49 "sends 1,600" — while the trust gain stays
+8 every time: the player watches the village hand over 1,650 for
the same +8 the deal prices at 1,500. Fixed, the number is one
number everywhere. (The tend line still repeats verbatim weekly —
named in the prereg as a sense-test tension, not fixed here.)

## Metric review

- The analyzer's median is the standard median (per-seed day
  list), per the prereg — not the trustgrowth analyzer's upper
  median (finding: MEDIAN 132 IS THE UPPER MEDIAN). Base median
  127.5, armed 124, bar 102 — passes with margin.
- No metric was re-scored. The primary (per-tend exactness) and
  the cost bar are exactly as pre-registered. The wave-5 1->2 and
  150207 surviving 150d are small-sample wall movements on an
  8-seed pilot, not a claim — the arm claims exact payment, not
  survival.
- Balance panel (§15): the panel takes no corpus input (1142Z
  precedent — recorder corpora are compared with the analyzer's
  per-seed table, never against a run baseline). No compare .md
  fabricated; the analyzer table above is the comparison.

## Adoption note (run fleshout-20261110T1415Z)

The 1215Z run died at its 2h boundary mid-sweep: its tendexact
worker had committed the prereg (9926c9e4d) and the fix
(be3fb880c), run the full base leg (8/8) and 6/8 armed cells, and
was writing armed cell 150206 at 14:17:47Z when its process died
(no process in ps, sweep cadence broken, heartbeat 37min stale,
lock 2h11m old — dead by every check; stale-lock recovery per the
guard). The adoption ran ONLY the two missing armed cells
(150207, 150208) with the committed driver (no valid file
overwritten — the driver refuses overwrites), re-ran the proof
RED->GREEN, ran the analyzer, and judged against the dead
worker's prereg WITHOUT changing it. The dead run's other two arms
had already landed on master before it died (talkturn-a
GO-candidate-HELD, answermail-drive-a NO-GO). The branch was
rebased onto explicit local-master SHA 3838d86dc (Loop B round
1248Z coordinator evidence, landed after the arm's base) — zero
file overlap (the intervening src/js change is game.js, vetcount-b;
this arm touches hierarchy.js) — and the proof was re-run green
on the rebased branch before merging.

## Wall (this arm's judged corpus, 16 configs)

National 0/16, table 0/16, wins 0/16, wave-5 unlock 3/16
(1 base + 2 armed), median survival 127.5 base / 124 armed.
The wall does not move on a 5% grain correction — expected; this
arm fixes a price, not a gate.

## Next blanks

(1) Tendexact confirm on 150209-150216 (reserved per prereg;
freshness re-check at confirm time — the band is named in the
talkturn-a and answermail-drive-a preregs as their confirm band,
no judged corpus exists on it yet). (2) The trust-100 cap (#2073)
is a Steve design question — do not build on it without a ruling.
