# sim-holdpantry-b — BUILD: scaleclimb + pantry-first banking + national answers — NO-GO

Run: fleshout-loop-b-20261114T1557Z (Loop B), arm sim-holdpantry-b
Axis: winnability chain. BUILD arm — the recovered scaleclimb policy
(baseline) vs scaleclimb + a pantry-first banking step + national/global
beat answers (armed), measured before/after on identical seeds.
Policy-side only: one new policy file + the baseline policy restored
verbatim, zero src/js changes.
Branch: sim-holdpantry-b — worktree ~/workspace/worktrees/sim-holdpantry-b
Base: master f524932d6
Date: 2026-11-14
Prereg: evidence/2026-11-14/sim-holdpantry-b-prereg.md (binds G1/G2/G3)

## Verdict: NO-GO on G2 (held-days half) + cost-bar median half

- **G1 INSTRUMENT VALIDITY — GO.** Full per-day link roll on all 16
  configs, **0 instrument errors**, **0 unattributed diplomacy points
  (net)**, **0 unattributed steps** (every up-step AND down-step names
  its link episode), **0 UNCLASSIFIED links**. The episode analyzer
  (scaleclimb metric review §2 fix) is validated on genuinely
  flickering legs: 91102's polity counts, un-counts, and re-counts
  THREE times (episodes 79–91, 117–118, 127–150) and every step is
  named; 91106 dissolves and re-forms (42–55, 104–116) and every step
  is named.
- **G2 THE LEVER — NO-GO.** Half 1 PASSES: EVER-COUNTED (polity ever
  stood) on **6/8** armed seeds (need ≥6/8; baseline 5/8). Half 2
  FAILS: median HELD-DAYS (days with diplomacy > 0) **21.5** (need
  ≥45; baseline 10.5). A miss on either half is NO-GO, never re-scored.
  The lever moves holding in the right direction — ever 5→6, median
  held 10.5→21.5, national 0→1 — but not far enough, and it costs
  survival to get there (see cost bar).
- **G3 LEVER-ONLY — GO.** Zero `src/js` changes in the branch diff;
  proof test green (static 57/57, game 28/28 on smoke seed 91101).
- **COST BAR — FAILS on the median half.** Starvation deaths pooled
  armed **1** vs baseline **1** (≤ control+2 ✓). Median survival armed
  **114.5d** vs baseline **150d** (0.76× control, need ≥0.8× ✗).
  Guardrail (§14c): armed villager combat deaths exceed the before leg
  by >50% on ONE seed — **91104 (86 vs 49, +76%)**, named here.

No confirm band was spent. The prereg licenses a 12–16 seed confirm
only on a clear GO; the pilot is a NO-GO, so the pilot IS the result.

## The answer in one paragraph

Bank the pantry before you tend it, and the realm holds longer — but
not long enough, and the banking itself is what kills the village.
The armed villages banked 118,914 kcal across the pilot (567 extra
evening forage trips, 88 of them productive, plus a leaner 1-day pack
keep that pushed the day's haul into the pantry instead of the pack),
tended 99 times instead of 62, and answered every national beat, so
the propose block that cost scaleclimb 317 days vanished to zero and
one village reached global rank. Three more polities stood than fell
apart early, and the best village held its realm 81 days to the end.
But the pantry never actually stayed above the 20k gate (median 35
days above it vs 34 without banking — the extra tends spend the
banked grain as fast as it arrives), the mourning choke ate the extra
tends (37 refused vs 7, and every paid tend still only buys +8), and
the evening forage trips that mostly fail (15.5% success) put the
scholar in the field twice as often — the villages fought more,
died more (586 vs 524 villager combat deaths), and died younger
(median 114.5 days vs 150; seven of eight lost vs four of eight).
The pantry was the right diagnosis and the wrong instrument: banking
more grain into a flow-through pantry does not hold a realm when the
spend is weekly, the grief is weekly, and the banking trip itself is
a fight.

## Before / after (paired seeds, 150d)

| Seed | Before: scaleclimb (days, end, scale, maxW, stand, w1/w2/w3/w4/w5) | Armed (days, end, scale, maxW, stand, w1/w2/w3/w4/w5) | dip end (peak, held d) | polity bar day | regional day |
|---|---|---|---|---|---|
| 91101 | 81, lost, regional, 4, 199, 21/16/13/1/0 | 142, lost, global, 4, 199, 34/31/10/5/0 | 102 (136, 81) | 62 | 32 → 32 |
| 91102 | 150, lost, regional, 5, 570, 27/14/13/9/2 | 150, survived, regional, 4, 199, 38/38/16/4/0 | 0 (102, 36) | 79 | 33 → 33 |
| 91103 | 150, survived, regional, 4, 199, 27/15/9/2/0 | 110, lost, regional, 4, 199, 26/17/9/2/0 | 0 (0, 0) | — | 62 → 73 |
| 91104 | 103, lost, regional, 4, 199, 22/12/7/7/0 | 119, lost, regional, 5, 350, 33/19/11/5/1 | 0 (0, 0) | — | 32 → 32 |
| 91105 | 150, survived, regional, 5, 250, 27/20/8/4/0 | 58, lost, regional, 4, 199, 30/13/4/0/0 | 102 (102, 1) | 58 | 33 → 33 |
| 91106 | 147, lost, regional, 5, 350, 18/20/8/6/0 | 129, lost, regional, 5, 340, 21/18/10/5/0 | 0 (136, 24) | 42 | 32 → 32 |
| 91107 | 150, survived, regional, 5, 465, 54/30/10/6/3 | 97, lost, regional, 4, 175, 38/25/9/0/0 | 0 (102, 19) | 67 | 32 → 32 |
| 91108 | 150, survived, regional, 5, 505, 30/20/8/4/5 | 108, lost, regional, 4, 199, 28/19/10/7/0 | 0 (102, 49) | 52 | 32 → 32 |

Pooled wave kills — baseline 226/147/76/39/10 (waves 1–5),
armed 248/180/79/28/1. Median survival 150d → 114.5d; survived
4/8 → 1/8 (91102 only). Gated standing median 199 → 199 (the 199
park holds on both legs — armed 91101's raw split is 557 and 91108's
is 520, past the gate, but the gated read still parks at 199).
National 0/8 → 1/8 (91101, global rank); table/wins 0/8 both (by
design — no seat-taking in this lever).

## The verb table (armed leg, 8 seeds)

| verb | calls | trust moved | first-crossings | refused |
|---|---|---|---|---|
| proposeLink (LEAD) | 27 | — | — | 0 declined, 0 shut |
| └ accepted outright | 22 | — | — | — |
| └ countered | 5 | — | — | — |
| answerCounter ('accept') | 5 | — | — | 0 |
| answerAccord ('gift' +10) | 23 | +230 | 23 | 0 |
| answerNationalChoice | 6 | — | — | 0 |
| answerGlobalChoice | 5 | — | — | 0 |
| tendLink, policy (+8/week) | 99 | +496 (62 paid) | 15 | 37 (n=0) |
| tendLink, engine — villagers' own drive | 21 | +168 | 3 | 0 |
| payTribute | 0 | 0 | 0 | 0 |
| hostFeast / devotion channel | — | 0 (no link) | 0 | — |

Baseline leg for contrast: propose 28 (23 accepted, 5 counter, 0
declined), counter-answers 5, accord 21 (+210, 21 crossings), tend
policy 62 (+440, 12 crossings, 7 refused), tend engine 17 (+136,
2 crossings), national/global answers 0. The accord is still the
crossing verb (23 of 23 armed first-crossings by accord or tend;
the full split over the 30 armed seasoned links: accord 23,
tend-policy 15 crossings incl. re-crossings, tend-engine 3 — the
accord carries every first trust-40 crossing on the armed leg).
Propose judge still exact: **0 cold declines in 27 calls**.
Propose blocks (days): pantry 396, 3-sub cap 315, pending
counter/accord/national **0** (baseline 317 — the national answers
eliminated the block entirely, as designed), not-ready 97.
Tends paid: 93,000 kcal across the pilot on the armed leg (62 paid
× 1,500) vs 82,500 kcal baseline (55 paid) — only 7 more PAID
tends for 37 more attempts. Every paid tend buys the full +8
(496/62 = 8.0 exactly); the shortfall is entirely the 37 mourning
refusals, not partial payment.

## The banking, seed by seed (the mechanism, measured)

| Seed | bank days | trips (ok) | donated kcal | cooked | pantry med | days ≥20k |
|---|---|---|---|---|---|---|
| 91101 | 98 | 98 (37) | 29,709 | 0 | 11,745 | 40 |
| 91102 | 110 | 110 (6) | 17,020 | 0 | 9,887 | 36 |
| 91103 | 96 | 96 (0) | 40,590 | 0 | 9,771 | 10 |
| 91104 | 88 | 88 (4) | 0 | 0 | 14,200 | 25 |
| 91105 | 20 | 20 (4) | 0 | 0 | 24,788 | 34 |
| 91106 | 98 | 98 (10) | 16,870 | 0 | 11,016 | 24 |
| 91107 | 29 | 29 (12) | 660 | 0 | 35,833 | 65 |
| 91108 | 28 | 28 (15) | 14,065 | 0 | 29,714 | 76 |
| **Band** | **567** | **567 (88, 15.5%)** | **118,914** | **0** | — | **med 35** |

Three things in that table decide the verdict. First, the extra
forage trip fails **84.5% of the time** (88/567) — and on 91103 it
fails 96/96, every single evening, while the scholar still spends
those evenings walking out. The trip's failure reason is not
recorded (instrument gap — see metric review §4). Second, the cook
leg contributed **nothing: 0 items cooked on all 8 seeds** — there
is never raw pack food near a fire at end-of-day, so the
sort/cook half of "forage/preserve/stockpile" never fires. The
banking that happened was the donation leg alone (the 1-day keep
pushing the day's haul into the pantry). Third, the pantry is a
flow-through, not a stockpile: the armed leg's median days above
the 20k gate is 35 vs the baseline's 34 — flat — because the extra
tends (99 vs 62) and the standing tribute drain the banked grain
as fast as it arrives, and the armed villages live 168 fewer
game-days in total (913 vs 1,081) to accumulate it in.

## The holding failure, seed by seed

The polity bar (3 Haven-primary seasoned subs at once) was reached
on 91101 (d62, held to d142 — the village's death), 91102 (d79,
flickered, last stood d127–149), 91105 (d58, the village died that
day), 91106 (d42, dissolved, re-formed d104, dissolved again),
91107 (d67, dissolved d86), 91108 (d52, dissolved — dip 102 held
49 days, ended 0). It never stood on 91103 or 91104.

- **91101 — the hold that worked.** Polity d62, 4 links, dip 136
  held 81 days to the village's death at d142, dip 102 at end — the
  only armed seed ending diplomacy-positive. What distinguishes it:
  the banking trips SUCCEEDED here (37/98, the band's best rate),
  29,709 kcal donated, the pantry cleared 20k on 40 days, and only
  0 tends refused. The village still died (village-lost d142) but
  it died holding its realm — and reached global rank, the pilot's
  only national.
- **91102 — the flicker.** Polity stood d79–91, dissolved, re-stood
  d117–118, dissolved, re-stood d127–149, then died on the horizon
  day: on d150 all three links' regional+ flipped off at once with a
  ~7-point trust drop on each (48→41, 43→36, 49→42), dip 102 → 0.
  The village survived to 150d — the only armed survivor — and its
  realm died on the last day. Whether the d150 cliff is a real
  dissolution or a horizon artifact is a single-seed open question
  (see metric review §5). Held 36 days across three episodes.
- **91105 — stood and died the same day.** Polity d58; the village
  was lost d58. The realm stood for one day. Its pantry was the
  fattest in the band (median 24,788) — the death was not food.
- **91106 — dissolve, re-form, dissolve.** Polity d42–55, gone,
  re-formed d104–116 with a fourth link, gone again. The drift
  warning IS captured this time (d55: "Thornfield's fire is drifting
  from ours — their speaker doesn't linger at the gate the way they
  used to"). Held 24 days across two episodes.
- **91107 / 91108 — held, then dissolved.** 91107: polity d67–86
  (19 days), 91108: d52 onward, 49 held days, dip 102, ended 0.
  Both villages died younger than their baselines (97 vs 150,
  108 vs 150) despite holding longer than baseline's 91108
  (33 held days) — the hold improved, the survival worsened.
- **91103 — never formed.** Only 2 links, 1 broke (succession), the
  third seasoned too late or never. 96 banking trips, 0 succeeded;
  40,590 kcal donated anyway (the donation leg works even when the
  trips don't), but the pantry median stayed 9,771 and the propose
  gate (12k) blocked 70 days. Regional came at d73 vs the baseline's
  d62 — banking DELAYED the climb here: the scholar spent 96
  evenings walking out and coming back empty.
- **91104 — never formed, and the cost seed.** 4 links formed, 2
  seasoned, 2 broke (succession); max 2 Haven-primary seasoned at
  once. 23 policy tends attempted, 16 refused (mourning), only 7
  paid — the worst refusal rate in the band. Villager combat deaths
  86 vs the baseline's 49 (+76%, the §14c-named seed).

## Per-seed link table (armed leg)

`seas` = seasoned day; `count` = first day counted; `eps` =
counting episodes; `cross` = verb that carried the first trust-40
crossing; `end` = end trust/age.

| seed | link | formed | t40 | seas | count | eps | cross | end |
|---|---|---|---|---|---|---|---|---|
| 91101 | village_0 | d10 propose | d11 | d40 | d62 | 62–142 | accord | 19/132 |
| 91101 | village_2 | d11 propose | d12 | d41 | d62 | 62–142 | accord | 78/131 |
| 91101 | village_1 | d32 propose | d35 | d62 | d62 | 62–142 | tend:engine | 41/110 |
| 91101 | spl_28 | d40 propose | d42 | d70 | d70 | 70–142 | tend:policy | 45/102 |
| 91102 | village_1 | d11 propose | d11 | d41 | — | — | accord | 2/140 |
| 91102 | village_2 | d12 propose | d12 | d42 | — | — | accord | 20/139 |
| 91102 | village_3 | d12 propose | d13 | d42 | d79 | 79–91, 117–118, 127–150 | accord | 41/139 |
| 91102 | spl_36 | d41 propose | d49 | d71 | d79 | 79–91, 117–118, 127–150 | tend:engine | 36/110 |
| 91102 | spl_26 | d49 propose | d56 | d79 | d79 | 79–91, 117–118, 127–150 | tend:engine | 42/102 |
| 91103 | spl_34 | d51 propose | d52 | d81 | — | — | accord | 21/58 |
| 91103 | village_1 | d57 propose | d58 | — | — | — | accord | 11/52 broke |
| 91104 | village_2 | d10 propose | d11 | d40 | — | — | accord | 24/109 |
| 91104 | village_1 | d11 propose | d12 | d41 | — | — | accord | 49/108 |
| 91104 | village_0 | d17 propose | d17 | — | — | — | accord | 0/102 broke |
| 91104 | spl_27 | d37 propose | — | — | — | — | — | 9/82 broke |
| 91105 | village_1 | d11 propose | d11 | d51 | — | — | accord | 34/47 |
| 91105 | village_3 | d16 propose | d17 | d46 | d58 | 58–58 | accord | 43/42 |
| 91105 | spl_22 | d27 propose | d28 | d57 | d58 | 58–58 | accord | 46/31 |
| 91105 | village_2 | d28 propose | d29 | d58 | d58 | 58–58 | accord | 58/30 |
| 91106 | village_3 | d10 propose | d11 | d40 | d42 | 42–55, 104–116 | accord | 60/120 |
| 91106 | village_0 | d11 propose | d12 | d41 | d42 | 42–55, 104–116 | accord | 30/119 |
| 91106 | village_2 | d12 propose | d13 | d42 | d42 | 42–55, 104–116 | accord | 36/118 |
| 91106 | village_1 | d42 propose | d42 | d105 | d105 | 105–116 | tend:policy | 32/88 |
| 91107 | village_2 | d10 propose | d11 | d40 | d67 | 67–86 | accord | 77/87 |
| 91107 | village_1 | d11 propose | d12 | d41 | d67 | 67–86 | accord | 58/86 |
| 91107 | spl_33 | d37 propose | d40 | d67 | d67 | 67–86 | tick/other | 39/60 |
| 91108 | village_0 | d10 propose | d11 | d40 | d52 | 52–101 | accord | 46/98 |
| 91108 | village_1 | d12 propose | d12 | d42 | — | — | accord | 12/96 broke |
| 91108 | village_2 | d12 propose | d13 | d42 | d52 | 52–101 | accord | 75/96 |
| 91108 | spl_21 | d22 propose | d23 | d52 | d52 | 52–101 | accord | 31/86 |

Dip steps (armed leg, each +34 named to its link episode; down-steps
named to the un-counting link — 0 unattributed steps band-wide):
91101 d62 +102 (3 links), d70 +34, d114 −34 (village_0 un-counted);
91102 d79 +102, d91 −102, d117 +102, d118 −102, d127 +102, d150
−102; 91105 d58 +102; 91106 d42 +102, d55 −102, d104 +102, d105
+34, d116 −136; 91107 d67 +102, d86 −102; 91108 d52 +102, d101
−102.

## Wall numbers (scale wall, every run)

- National / table / wins: armed reaches national on **1/8**
  (91101, global rank), takes the table on **0/8**, wins **0/8**;
  baseline national **0/8**, table **0/8**, wins **0/8**. No village
  reaches the table as a distinct step — by design, this lever never
  sits.
- Wave 4–5 reach: wave 4 unlocked 8/8 both policies; wave 5
  unlocked **2/8 armed** (91104, 91106) vs **5/8 baseline**
  (91102, 91105, 91106, 91107, 91108). Pooled wave kills — armed
  248/180/79/28/1 (waves 1–5), baseline 226/147/76/39/10. The armed
  villages kill MORE at waves 1–3 and FEWER at waves 4–5: they fight
  more per day and die before the late waves.
- Median survival: baseline **150d** (81–150; 4/8 survived to 150d);
  armed **114.5d** (58–150; 1 survived to 150d, 7 village-lost).
- Death causes (§14c co-primary): villager (non-scholar) combat
  deaths pooled **586 armed vs 524 baseline** (+12%). Total deaths
  696 vs 615 (+13%). Deaths per 100 game-days: 76.2 armed vs 56.9
  baseline (panel's per-run means: 78.47 vs 58.37). Per-seed armed
  exceeds the before leg by >50% on one seed — **91104 (86 vs 49,
  +76%)**, named here per the prereg guardrail. Starvation deaths:
  1 armed (91105) vs 1 baseline (91105) — the cost is fight
  exposure from the extra evening trips, not hunger.

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-14/holdpantry-panel.md` (+ .json, .json.gz pair;
pseudo-panels built from the driver's per-seed JSONs, scaleclimb
pattern — the real balance-panel.js compare cannot judge a policy
contrast, see prereg): decision **review_required** (8 paired
cases, screen only). National 0 → 0.125 (no_material_signal);
wins 0 → 0 (descriptive); survival30 1.0 → 1.0
(no_material_signal); survival60 1.0 → 0.875 (regression_watch);
villageDeaths/run 76.875 → 87 (regression_watch, CI straddles 0);
villageDeaths/100d 58.37 → 78.47 (**regression_signal**, CI
[6.89, 33.42]); communityLost 0.5 → 0.875 (regression_watch, CI
straddles 0). Per §15 this does NOT override the prereg verdict
(already NO-GO on G2); the panel's signals are consistent with the
paired story — the lever holds longer, reaches national once, and
buys it with more deaths per day because its scholar spends every
evening in the field. Panel limitation (stated in the prereg): the
pseudo-panel covers only contract metrics mappable from the driver
JSONs (won, national, survival30/60, communityLost,
villageDeaths); playerDeaths, gear, luck, and NPC metrics are null,
never faked. Diplomacy itself is NOT a contract metric — the panel
cannot see the lever's primary effect at all.

## Telemetry deviation check (loop step 10)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-14/perseed-holdpantry-b/*.json' --metrics
national,table,wins,exiled` REFUSES the input by design:
"refusing recorder-corpus input: all 16 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs.
Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." No LOUD line was produced — the
refusal is the tool's designed behavior for a sweep corpus, not a
finding. The §15 pseudo-panel compare above is the instrument
for this corpus instead.

## Village assessment

The same eight villages, twice — once courted, once courted and
banked. The banked villages work harder at the relationship: the
scholar comes home from the day's work and goes straight back out
to gather, comes back, and pushes the haul into the pantry; the
grain walks to the neighbors' fires 99 times instead of 62; the
national beats get answered the morning they arrive instead of
sitting unread for 317 days; and on five seeds the realm stands
longer than it ever did before. One village (91101) holds its realm
81 days and climbs all the way to global rank. But the evenings in
the field are the price: the scholar meets more monsters (428
wave-1/2 kills vs 373), the village buries more of its own (586 vs
524), and seven of eight villages are gone before day 150 where
four survived before. The pantry, banked or not, sits at 4–12k
most days on the thin seeds and 30k on the fat ones — the banking
moves grain through the pantry, it does not raise the floor, because
the tend and the tribute drink it as fast as it arrives. And the
grief keeps pace with the grain: 37 tends refused at funerals
against 7 before, because a village that fights more buries more,
and a tended fire cannot be fed while its speaker is being buried.
The courtship is solved. The keeping is still not — and this run
says the keeping is not a pantry problem anymore. It is a grief
problem (the mourning choke now eats 27% of tend attempts) and a
spend problem (a tend a week per link plus 4,000 kcal/week tribute
per link is more than a banked pantry can carry while the village
is also fighting for its life).

## Sense-testing (SENSE-TESTING LAW)

The courtship still reads like a played relationship, and the
realm's LIFE now has played lines the scaleclimb band never
captured. The formation (91101, day 62): "◈ SYSTEM: 'Four fires.
One head. GOVERNANCE LAYER: online — polity tribute routing, the
court calendar, famine reserves. You built a realm. Try not to lose
it the way you found it.'" The drift warning, captured for the
first time (91106, day 55): "⚠️ Thornfield's fire is drifting
from ours — their speaker doesn't linger at the gate the way they
used to, and nobody over there says why. Bonds don't mend themselves;
a tended fire remembers who fed it." The realm feeding its own
(91102, day 80): "🍲 The shared granary opens: 5,000 kcal for every
fire of the realm, no strings. Ashford, The Red Table II, The Red
Table count it — and remember who fed them first. (Trust +10 with
each — 3 grieving fire(s); theirs waits.)" — the game itself names
the grief. The gift and the link read as before (91101, day 11:
"🎁 Haven's first gesture: 2,000 kcal walks to Emberhold's fire — a
gift, no strings. They count it, and they remember who sent it.
(Trust +10.)"). What is STILL missing: the dissolution has no
played line. 91102's polity dissolves on day 91, re-forms, dissolves
again — and the captured lines around day 91 are a fight broadcast
and a book, nothing marking the loss. The say-capture filter helped
(max captured day rose from ~28 on scaleclimb to 68–119 here) but
the 600-line cap still binds on long runs, and the loss itself is
an engine event with no line at all. Villager dialogue in the
captured lines stays coherent and specific (people confessing,
teaching, grieving by name). Two recorder limits remain: the cap
still binds, and there is no polity-loss line in the game to capture.

## Metric review (§14)

1. The metrics held. G1 held in its REVISED form: the episode
   analyzer attributed every step on flickering legs (0 unattributed
   net, 0 unattributed steps) where the old analyzer failed by
   construction. G2's ever-counted half held (6/8); its held-days
   half failed on its own terms (21.5 vs the 45 bar) — and the bar
   was the right bar: 45 days is what "holding" has to mean when
   the polity needs 30 days just to season. G3 held.
2. The cost bar's median half (≥0.8× control) caught a real cost
   the starvation half missed: the lever is not hungry, it is
   exposed. Starvation 1 vs 1 says nothing; median 114.5 vs 150
   says the villages die younger. Keep both halves.
3. The H-guess (implicit in the lever) — that banking the pantry
   to the 20k gate would let tends fire and hold the polity — was
   HALF right: the gate clears more often on tend days (99 attempts
   vs 62) and the pantry does take the banked grain (118,914 kcal),
   but the gate does not STAY cleared (median 35 days above 20k vs
   34) because the tend+tribute spend drinks it, and the extra
   attempts mostly die in mourning (37 refused). The pantry was
   the scaleclimb diagnosis; the hold failure is now a grief +
   spend problem, not a pantry-stock problem.
4. The banking trip's 15.5% success rate is the lever's own wound:
   an evening trip that fails 85% of the time still costs the
   evening — and on 91103 it fails 96/96 while the scholar walks out
   every night. A follow-up that wants the banking without the
   exposure should bank WITHOUT the trip (donation leg only — it
   moved 118,914 kcal with zero field time) or fix the trip (why it
   fails is unrecorded — see §5).
5. Two open observations, single-seed each, neither a verdict
   driver: (a) 91102's polity dies on the horizon day — all three
   links' regional+ flips off at once on d150 with a ~7-point trust
   drop on each — real dissolution or a horizon artifact is
   unestablished; (b) the cook leg of banking never fired (0 items
   on 8 seeds) — there is never raw pack food near a fire at
   end-of-day, so "preserve/stockpile" as staged does nothing.
6. Say-capture: the meal filter + 600 cap raised the max captured
   day from ~28 to 68–119, and the drift warning was captured — but
   the cap still binds and the polity's dissolution still has no
   played line in the game at all. A future recorder should sample
   link/polity lines across the WHOLE run (e.g. keep every
   polity/drift/seasoning line, cap the rest), and the game needs a
   dissolution line before any recorder can capture one.

## Evidence files

- Prereg: evidence/2026-11-14/sim-holdpantry-b-prereg.md
- Baseline policy: scripts/policies/competent-scaleclimb-b.js
  (restored verbatim from 29a794df6 — instrument, not a lever)
- Policy: scripts/policies/competent-holdpantry-b.js (new)
- Driver: scripts/holdpantry-driver-20261114.js (new)
- Analyzer: scripts/analyze-holdpantry-b.js (new)
- Panel builder: scripts/build-holdpantry-panels-20261114.js (new)
- Proof: scripts/test-holdpantry-b-20261114.js (new; static 57/57,
  game 28/28 on smoke seed 91101)
- Per-seed JSON: evidence/2026-11-14/perseed-holdpantry-b/ (16 files)
- Analysis JSON: evidence/2026-11-14/holdpantry-b-analysis.json
- Pilot log: evidence/2026-11-14/holdpantry-b-pilot.log
- Analyzer log: evidence/2026-11-14/holdpantry-b-analyzer.log
- Panel: evidence/2026-11-14/holdpantry-panel.{json,md}
  (+ -before/-after .json.gz pair)
- Evidence: this file

## Commits (branch sim-holdpantry-b)

- c776ad6ae prereg (G1/G2/G3 bars; fresh band 91101–91108;
  93201–93208 collision recorded)
- 842ddaa71 instrument: baseline policy (verbatim 29a794df6) +
  armed policy + driver + analyzer + panel builder + proof test
  (static 57/57, game 28/28 on smoke seed 91101)
- (this commit — pilot corpora + analysis JSON + panel + evidence)

## Findings for the backlog (coordinator owns sim-findings.md)

1. **Holding is now a grief + spend problem, not a pantry-stock
   problem.** Banking moved 118,914 kcal and tends 99 times (vs 62)
   but the pantry never stayed above the gate (35 vs 34 days) and
   mourning refused 37 tends (vs 7). A follow-up arm should test
   holding verbs that survive grief (tend-through-mourning is an
   engine question, a Steve-call) or a cheaper tend/tribute spend
   — not more pantry.
2. **Bank without the trip.** The donation leg (1-day pack keep)
   moved the grain with zero field time; the extra evening forage
   trip succeeded 15.5% of the time and bought fight exposure
   (median survival 150→114.5, wave-5 unlocks 5/8→2/8). A
   donation-only banking arm isolates the gain from the cost.
3. **The d150 horizon cliff (single seed).** On 91102 all three
   counted links' regional+ flipped off at once on day 150 with a
   ~7-point trust drop each. Real dissolution or horizon artifact —
   needs a targeted probe, not a verdict.
4. **The polity's dissolution has no played line.** The drift
   warning is captured now, the formation line exists, but the loss
   itself is silent in the numbers. The game needs a dissolution
   line before any recorder can capture one.
5. **Say-capture cap still binds** (600 lines, max day 68–119).
   Future recorders should keep every polity/drift/seasoning line
   and cap only the rest.

## Convergence state

BUILD — NO-GO against the preregged G2 bar (median held-days 21.5
vs the 45 bar; ever-counted half passed 6/8) and the cost-bar
median half (114.5d vs the 120d floor). The axis line updates from
this run's numbers only: the climb is closed (regional 32d, polity
6/8 ever); the hold is open (median held 21.5d, 4 of 6 polities
dissolved, 2 never formed). No confirm band is licensed. The next
arm on this axis is a GRIEF/SPEND lever (mourning-proof tending or
cheaper tend/tribute) or a donation-only banking arm — not another
pantry-stock measure.
