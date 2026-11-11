# Travel / roads — first numbers (arm sim-travelfirst-a)

Run fleshout-20261111T0315Z (Loop A), adopted and landed by run
fleshout-20261111T0615Z. Coverage Program Tier 2 (Steve order 2026-11-10
11:11 CST "Measure all"). Prereg committed before any judged sim
(190a80481); instrument + driver + analyzer + proof committed
(7e35cbbc3, proof 93/93). Corpus (16/16 per-seed files, band
180249–180256) + this evidence written after the 0315Z coordinator died
mid-closeout (lock 114 min old, travelfirst tree heartbeat 48 min stale,
last write 05:33Z, no sim procs); the 0615Z coordinator verified the proof
93/93 green in the worktree, verified the corpus 16/16 present, and wrote
this evidence from the analyzer summary (no worker evidence file existed
to adopt). Base commit ad6a04b27; landed on master fc0ffb37c.

## Verdict: GO on instrument validity + complete first-numbers capture

Pre-registered GO bar (prereg, § Primary metric): every travelTo call
classified, every wrap live or proven dead, neutrality exact, 0 instrument
errors, per-seed tables for metrics 1–9, engagement floor ≥100 travelTo
calls. All rows pass:

| GO check | Bar | Measured |
|---|---|---|
| Engagement floor | ≥100 travelTo calls band-wide | 3,007 |
| Unclassified calls | 0 other-caller calls | 0 |
| Instrument errors | 0, all seeds, all legs | 0 |
| Neutrality | days + end pantry kcal + deaths exact, 8/8 | 8/8, 0 mismatches |
| Complete capture | per-seed tables metrics 1–9 + sense scenes | 8 seeds tabulated; scenes below |
| Wrap liveness | each wrap live or proven dead | travelTo/tele/npcNodeTravel live 8/8; engine walkHome, tryNodeExit, road legs proven 0 in pilot + fixture (proof C5–C7) |

A GO makes NO landing claim and spends NO confirm band — there is no
lever here to land. This is measurement only.

## Headline — the scholar never leaves the home board

- **3,007 travelTo calls, 2,884 moved (95.9%), 100 blocked, 21
  refused-null, 2 combat-refused.** Callers: forageTripSeedFirst 2,865
  (95.3%), stoneRun 136, thirstWalkHome 5, feastFightRoad 1. Trips: 900,
  mean 3.34 steps, max 8. Steps/day mean 3.49, max 13. Day-ticks at day
  end mean 392 / median 407 (cap 512; at cap on 4/896 days) — travel is
  cheap in ticks because node travel is free by the standing rule.
- **Beyond-edge crossings: 0. Max Chebyshev distance from haven: 4.**
  tryNodeExit 0 in 896 days. Under competent, the scholar's whole life
  happens on the 9×9 home board; the world beyond the rim is never
  stepped into. Any arm that wants beyond-edge travel measured must use a
  different policy or substrate — competent never goes there.
- **Engine walkHome: 0 calls.** Policy walkHome: 0 calls. The compass
  action (Game.walkHome) is dead under competent, as the prereg
  predicted; the policy walks home hop-by-hop through walkTo (975 via)
  and forageTripSeedFirst (2,018 via) instead.
- **Road legs: 0.** enterLeg/departLeg never called, state.road active 0
  days, leg index max 0. Proven zeros, not assumed: wraps + daily
  snapshots. Competent never calls Game.nomad.start(); the road is a
  capable-only verb on this substrate.

## Away evenings — blocked paths do NOT dominate on plain competent

49 away evenings in 896 scholar-days (5.5%). Causes: **combat 27,
within-reach 15, too-far 6, blocked-path 1.** Blocked-path share of away
evenings: **2.0%** (1/49). Max strand run 9 nights (seed 180250);
27 strand runs total, mostly length 1.

This REFUTES backlog #1385's dominance claim on a plain competent band:
nighttravel-screened-b measured 62/103 away evenings blocked-path (60%)
on a screened/thief-grant substrate. On plain competent 150d the blocked
path is nearly never why the scholar sleeps out — combat is (27/49), and
within-reach evenings (15/49) are nights the scholar simply did not walk
the short way home. The prereg said the line becomes [fixed] on landing
if the fresh-band numbers confirm or refute the dominance with a stated
verdict: **refuted on this substrate; the screened-substrate number does
not generalize.** #1385 marked [fixed] (refuted) in sim-findings.md.
The remaining question is a lever one, not a measurement one: why 15
within-reach evenings end away from home.

## Blocked hops — the creek is the wall

100 blocked travelTo calls: **creek 82, washed_out 11, fallen_tree 3,
rubble 4.** 88 intermediate, 12 destination. One seed carries half the
band's blockages (180250: 48; next 180251: 24; four seeds 0). The creek
blockage needs a bridge or the swimmer ability; nothing in this corpus
clears one. routeAround fired twice band-wide.

## Villager travel — water is the commute

3,799 departures, 3,722 returns, 16 hurt returns. Departures by purpose:
**water 1,835, guard 682, visit 611, forage 438, haul 51, hunt 48,
traps 47, explore 43, expedition 35, leave 9.** Returns track
departures within ~2% per purpose except expedition (35 out, 121 back —
returns carry the purpose of the trip that brought them home, not the
outbound leg; the asymmetry is a ledger-label fact, not a count error).

Away-days as recorded (one snapshot-day per away villager): 7,155 of
7,880 roster-days = **90.8% away**. By purpose: water 2,066, guard
1,380, expedition 1,310, visit 682, leave 682, forage 609, traps 249,
explore 49, haul 67, hunt 61. Max node distance per villager: 0–4
(marcus_webb 4; most 1–3). **Metric-review flag:** a 91% away share
sits oddly against water trips that should be same-day — the day-end
snapshot may hold villagers "away" whose return lands after the snapshot
or whose ledger entry clears late. No arm should lean on the 90.8%
figure until a return-time check separates same-day returns from
multi-day absence. The departure/return counts are the solid numbers;
the away-day share is recorded, not trusted.

## Deaths by position — a third of scholar deaths happen away

637 deaths reconciled instrument = harness, 8/8 seeds. Scholar deaths
96: **33 away, 63 at haven.** Villager deaths 25: 11 away, 14 at haven.
Monster deaths 516 (the bulk of the 637). Away death causes: "the wild"
30, monster 11, "a stranger" 3. Haven death causes: "the wild" 57,
monster 4, arena 3, plus singletons (thirst, wound, expedition, combat,
contests, monster names). **Pit-trap travel deaths: 0** — the scholar's
own pit trap (50%, 15–25 dmg) never killed on this band. Note the
"the wild" cause dominates BOTH sides (87/121 located person-deaths):
death location is not the story; the wild kills at home too.

## Sense-testing (travelSays, 200 sampled lines/seed)

Travel narration reads like a walk, not a system: "Travel 1 tile to
trail edge. — An old trail — The trail splits around a boulder and
rejoins — the world's oldest traffic decision." / "Travel 2 tiles to
forest floor. — Under the canopy — Fallen trunks lie like sleeping
animals, furred with moss." The creek is talked about, not just blocked:
"Overheard — Lucas: 'The creek's lower than yesterday. Markedly.'" /
"A person, maybe 40s, with a crooked nose returns with 8L of creek
water. Risky until the hearth boils it." Stone runs narrate their own
economy: "Lucas to a person, maybe 50s, by the fire: 'Stone. We need 60
more for the palisade footings. Creek beds, hillsides — pry it loose.'"
Travelers bring the region in by voice: "A traveler passed through
yesterday, talking about a village to the northeast called Stonebridge.
The region is bigger than your fire." No blocked-path voice was sampled
— the scholar is refused silently 100 times; a refused hop says nothing
in the transcript. That silence is a blank (see findings).

## Per-seed table (control leg; neutral leg identical on days/pantry/deaths)

| seed | days | end | scale | wave | standing | deaths | pantry | travelTo | blocked | awayEv | maxStrand | dep/ret | schDeaths (away) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 180249 | 145 | lost | regional | 4 | 199 | 93 | 0 | 441 | 9 | 12 | 4 | 473/462 | 18 (10) |
| 180250 | 100 | lost | regional | 4 | 199 | 70 | 0 | 412 | 48 | 13 | 9 | 295/283 | 9 (5) |
| 180251 | 96 | lost | regional | 4 | 199 | 65 | 2,042 | 382 | 24 | 0 | 0 | 415/408 | 14 (0) |
| 180252 | 73 | lost | regional | 4 | 125 | 69 | 0 | 267 | 19 | 6 | 5 | 262/251 | 8 (2) |
| 180253 | 128 | lost | regional | 4 | 199 | 108 | 0 | 424 | 0 | 6 | 3 | 535/525 | 17 (4) |
| 180254 | 71 | lost | regional | 4 | 195 | 58 | 62,120 | 200 | 0 | 3 | 2 | 402/394 | 11 (3) |
| 180255 | 150 | survived | regional | 4 | 199 | 97 | 7,600 | 405 | 0 | 1 | 1 | 908/902 | 4 (2) |
| 180256 | 150 | survived | regional | 5 | 200 | 77 | 0 | 476 | 0 | 8 | 3 | 509/497 | 15 (7) |

## Wall numbers (this corpus, 8 seeds, competent, 150d)

National 0/8, table 0/8, wins 0/8; wave-5 unlocked 1/8; regional 8/8;
median survival 114d; 6/8 village-lost, 2/8 survived; standings
199/199/199/125/199/195/199/200. The scale wall stands, same as every
recent run. Standing 199 on 5/8 seeds (the defer5-veterans gate per
standing199-a) — this corpus reproduces it once more.

## Metric review (for the NEXT run, §14)

- The roster-away share (90.8%) is recorded, not trusted: re-measure
  with return-time stamps before citing it as "villagers spend 9/10 days
  away". The away ledger's day-end snapshot is the suspect, not the
  departure counts.
- Expedition returns (121) vs departures (35) is a purpose-label
  asymmetry: returns are labeled by the homeward purpose. Any arm
  comparing departures to returns per purpose must re-label or compare
  totals only (3,799 vs 3,722).
- The engagement floor passed by 30× (3,007 vs 100) — future travel arms
  can pre-register a tighter floor or a per-cause floor (e.g. ≥20
  blocked-path evenings) instead of a raw call count.
- Blocked-hop voice: 100 refusals, 0 sampled lines naming the blockage.
  A future arm that wants the refusal legible should capture the
  travelTo return site's say output, not the travelSays sample.
- Beyond-edge travel is unmeasurable under competent (0 crossings in 896
  days). Do not re-run this substrate for beyond-edge questions.

## Findings appended

- #1385 REFUTED (blocked-path dominance, plain competent band) — marked
  [fixed] in sim-findings.md with this evidence.
- Blocked hops are silent (see sense-testing) — appended.
- Roster-away 90.8% share needs a return-time check — appended.
- Within-reach away evenings (15/49) — appended.

## Infrastructure

- Adoption: proof re-run 93/93 in the worktree before commit; corpus
  16/16 files present; summary GO allPass + neutrality 8/8 read from the
  analyzer output (not re-derived). Evidence written by the coordinator
  from the summary + per-seed files (no worker evidence existed).
- Safe-commit index clobber: (recorded at closeout if hit).
- Telemetry deviation check: REFUSED expected (recorder rows, not runs)
  — same handling as sibling first-numbers arms; baseline NOT rolled.
