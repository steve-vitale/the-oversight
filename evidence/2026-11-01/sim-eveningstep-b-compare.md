# sim-eveningstep-b — pair-decomposition tables (matched seed-days, NOT a panel comparison)

Arm sim-eveningstep-b, run fleshout-loop-b-20261101T0545Z.
Analysis corpus: the awayeve corpora on master (base 6409c1312),
read through scripts/analyze-eveningstep-b.js. Drift check
(17563, 30d, current base 2debb6756 + this arm's commits):
90/90 leg-days match the awayeve corpus on evening tile,
position, outcome, and travelledHome, plus morning tile and
position — ZERO drift. This compare file is a
matched-seed-day decomposition, never a balance-panel
comparison (see the evidence file's §15 declaration).

## Pooled leg-path census (awayeve pooled corpora, 24 seeds x 30d)

Leg paths are the evening step's own branches (nighttravel.js
nightStep + insideevening.js eveningStep), recovered from
eveningOutcome + travelledHome + positions. Surprises 0 on
every policy.

| policy | evenings | L4-entry-only | L2-offer-no | L3-hop-no | L3-hop-yes-entry-no | L1-guard-combat | L0-no-step | travelledHome |
|---|---|---|---|---|---|---|---|---|
| P1 nighttravel-stack | 714 | 680 | 30 | 1 | 1 | 2 | 0 | 1 |
| creekseek-stack | 714 | 676 | 34 | 1 | 1 | 2 | 0 | 1 |
| BARE competent-only | 708 | 0 | 0 | 0 | 0 | 0 | 708 | 0 |
| P3 deed-seeking | 720 | 0 | 0 | 0 | 0 | 0 | 720 | 0 |

Cross-checks against the awayeve census: P1 away evenings 31
= 30 offer-no + 1 hop-no; creekseek away 35 = 34 offer-no +
1 hop-no. P1 travelledHome = 1 in 714 evenings: the ONLY
evening hop in the whole pooled corpus is 17563 day 5.
L3-hop-yes-entry-yes = 0 on both stacks: NO hop on this
corpus was ever followed by a successful lodge entry.
L1-guard-combat evenings (2 per stack, same seed-days:
17546 day 28, 17559 day 30) are HAVEN evenings where a
fight was live at step time — the guard leg fires on haven
days too, and the evening stays haven by position.
BARE and P3 carry no evening machinery at all (L0 everywhere),
as awayeve's policy-no-record already said.

## PAIR 0 — seed 17563, days 4-5 (+ episode context days 6-9)

Same vessel gen_ocpths4 throughout except where noted.
Morning kcal / dayTicks are the day's opening state;
evening kcal / dayTicks are the post-step snap.

| day | policy | morning (tile, pos, kcal, ticks) | evening (tile, pos, kcal, ticks) | outcome | travHome | leg path | deciding |
|---|---|---|---|---|---|---|---|
| 4 | P1 | haven (4,4), 2322, 384 | forest_floor (5,3), 2172, 499 | travel-refused | false | L3-hop-no | L3-hop-no |
| 4 | BARE | haven (4,4), 980, 384 | forest_floor (5,3), 890, 403 | policy-no-record | false | L0-no-step | — |
| 4 | CS | haven (4,4), 2322, 384 | forest_floor (5,3), 2172, 499 | travel-refused | false | L3-hop-no | L3-hop-no |
| 5 | P1 | forest_floor (5,3), 0, 256 | haven (4,4), 0, 277 | walk-no-path | TRUE | L3-hop-yes-entry-no | **L3-hop** |
| 5 | BARE | forest_floor (5,3), 207, 384 | forest_floor (5,3), 117, 403 | policy-no-record | false | L0-no-step | — |
| 5 | CS | forest_floor (5,3), 0, 256 | haven (4,4), 0, 277 | walk-no-path | TRUE | L3-hop-yes-entry-no | **L3-hop** |
| 6 | P1 | haven (4,4) | creek (2,0) | out-of-reach | false | L2-offer-no | L2-offer-no |
| 6 | BARE | forest_floor (5,3) | forest_floor (5,3) | policy-no-record | false | L0-no-step | — |
| 6 | CS | haven (4,4) | creek (2,0) | out-of-reach | false | L2-offer-no | L2-offer-no |
| 7 | P1 | creek (2,0) | creek (2,0) | out-of-reach | false | L2-offer-no | L2-offer-no |
| 7 | BARE | forest_floor (5,3) | forest_floor (5,3) | policy-no-record | false | L0-no-step | — |
| 8 | P1 | creek (2,0) | creek (2,0) | out-of-reach | false | L2-offer-no | L2-offer-no |
| 8 | CS | creek (2,0) | creek (2,0) | out-of-reach | false | L2-offer-no | L2-offer-no |
| 9 | P1 | haven (4,4), successor gen_8tyqfs5 | haven (4,4), completed | completed | false | L4-entry-only | daytime-divergence |
| 9 | BARE | forest_floor (5,3), gen_ocpths4 | forest_floor (5,3) | policy-no-record | false | L0-no-step | — |
| 9 | CS | creek (2,0), gen_ocpths4 | creek (2,0) | out-of-reach | false | L2-offer-no | L2-offer-no |

Day 5 wrapper records: P1 woodcarry null, warmth
miss not-creek-refused (no wrapper action on day 5
itself); CS creekseek moved-to-creek (5,3) -> (4,3),
then the hop (4,3) -> (4,4). Day 5 following
mornings: P1 and CS wake at haven (4,4), kcal 1190
— the haven evening STICKS overnight; BARE wakes
at (5,3), kcal 35. Day 4 wrapper chain (P1/CS):
woodcarry classification combatLive false, bridge
built true (96 ticks: snap ticks 403 -> 499; 60 kcal:
2232 -> 2172), retry arrived false, narration "The
bridge stands, but the way home still refuses —
block:creek."; warmth then misses on combat; the
evening snap reads inCombat true. The step record
(travel-refused) and the snap flag (inCombat) are
taken at different times with wrapper work between
them — see the evidence file.

## PAIR 1 — seed 17549, episode [9-11] end (walk-home day 12)

Same vessel gen_vl0pol1 throughout. P1 and CS agree
on every day below; BARE's trajectory diverged
earlier (its mornings are at (7,8), not (6,7)).

| day | policy | morning | evening | outcome | travHome | leg path | deciding |
|---|---|---|---|---|---|---|---|
| 9 | P1/CS | haven (4,4) | forest_floor (6,7) | out-of-reach | false | L2-offer-no | L2-offer-no |
| 10 | P1/CS | forest_floor (6,7) | forest_floor (6,7) | out-of-reach | false | L2-offer-no | L2-offer-no |
| 11 | P1/CS | forest_floor (6,7) | forest_floor (6,7) | out-of-reach | false | L2-offer-no | L2-offer-no |
| 12 | P1/CS | forest_floor (6,7), kcal 39 | haven (4,4), kcal 440 | completed | FALSE | L4-entry-only | **daytime-divergence** |
| 12 | BARE | forest_floor (7,8), kcal 105 | forest_floor (7,8), kcal 35 | policy-no-record | false | L0-no-step | — |
| 13 | P1/CS | haven (4,4) | haven (4,4) | completed | false | L4-entry-only | daytime-divergence |

Day 12 is a DAYTIME walk home, not an evening hop:
the day lines carry "Travel 2 tiles to Haven." and
"Haven. 4 days. The palisade looks smaller than you
remembered, or you got bigger." BEFORE the evening
entry (completed, inside true). The evening step's
only work that night was the entry leg. Three
straight offer-no nights (days 9-11) precede it:
the step ran each night, found home unoffered, and
the villager stayed put at (6,7) — then walked home
in daylight.

## PAIR 2 — seed 17549, day 6 (first same-morning-tile P1-haven / BARE-away pair in seed order, excluding 17563 and pair-1 days)

| policy | morning | evening | outcome | travHome | leg path | deciding |
|---|---|---|---|---|---|---|
| P1 | haven (4,4), kcal 2400, ticks 384 | haven (4,4), kcal 2320, ticks 458 | completed | FALSE | L4-entry-only | **daytime-divergence** |
| BARE | haven (4,4), kcal 1193, ticks 384 | forest_floor (0,5), kcal 1123, ticks 401 | policy-no-record | false | L0-no-step | — |
| CS | haven (4,4) | haven (4,4) | completed | FALSE | L4-entry-only | daytime-divergence |

P1's day 6 is a day out AND back: forest-floor
travels, a trail-edge leg, then "Travel 2 tiles to
Haven." + "You walk back into Haven. 9 Codex
entries." in DAYTIME, a grove trip, a second
haven return, and "You step into the Haven hall."
The evening step moved nothing; it only ran the
entry leg. BARE's day 6, from the same morning
tile, wanders out to (0,5) and stays there. Same
morning tile, different morning kcal (2400 vs
1193 — trajectory divergence from earlier days),
different daytime itinerary, different evening —
and the evening step is not the difference.
