# sim-courtship-rework2-b — BFS-pathfinding rework, re-pilot (Loop B, 1930Z run)

**Verdict: PILOT GO.** G1 GO, G2 GO, G3 GO, cost bar PASS — all four
bars met on the frozen prereg, no bar re-scored. The stall is gone:
zero-movement continuation pilgrim-days **0 band-wide** (was 54 on
seed 100646 in round 1), stale drops **0** (was 4), every pilgrimage
(24/24) ends in a study within 2 days of its start. Covenant staged
**8/8**, all answered 'pact', all sat. The confirm band 100621–100636
stays fresh for the coordinator's next run — the confirm is owed on
this GO, not spent here.

## What this run was

The 1810Z re-pilot (sim-courtship-rework-b) proved the gate open
(covenant staged 8/8, opinion 10 by median day 16) and passed its
cost bar (starvation 0 vs 2), but failed G2 on the stall bar alone:
54 zero-move pilgrim-days, all on seed 100646. The mechanism was
proven by live map probe: village_2 (1,4) and village_3 (1,2) ARE
reachable by BFS, but the first step (4,4)→(4,3) moves AWAY
(Manhattan 3→4) because west (3,4) is a creek and the south-west
approach is rubble-walled — and the round-1 never-steps-away guard
vetoed exactly that step. The round-2 fix (policy-side only, zero
`src/js`), frozen in the prereg
(sim-courtship-rework2-b-prereg.md):

- **BFS pathfinding, chosen over a bounded step-away allowance.**
  `bfsNextStep` runs an orthogonal BFS over the 9×9 home board with
  `Game.travelBlockage` as the passability oracle for each single
  step (the same rule `travelTo` applies to a d==1 hop, entry side
  included), and `walkTo` takes the first step of the shortest
  path. Every BFS step strictly decreases BFS-distance to the
  target, so the walk cannot oscillate — the property the
  never-steps-away guard protected, now exact rather than greedy.
  A bounded allowance was rejected: it can still stall in a pocket
  deeper than the allowance and can oscillate at the allowance
  boundary. Canon (docs/MAP.md): blockages offer "cut, clear,
  bridge, swim, or go around" — BFS is the "go around" way. The
  greedy nearest-first step survives as the fallback for a missing
  path / off-board destination; the never-steps-away guard is
  removed (BFS-distance is the progress measure now).
- **Voice polish (round-1 sense-testing item):** the return line
  now distinguishes a completed study ("codex now read") from a
  stale turn-home ("codex stays unread").

Pilot: 8 seeds × 2 policies, 200d death-aware, identical seeds,
fresh controls on the current tip. Band **100761–100768** (verified
fresh). Baseline `competent-covenant-b` vs BFS-reworked
`competent-courtship-b`. RUN=`courtship-rework2-b`, anchor commit
`e577ef5f8`. 16/16 configs ran, 0 instrument errors. (One runtime
restart interrupted the pilot at 7/16 configs; the driver was
resumed from verified checkpoints — the 7 completed per-seed files
validated as complete JSON with 0 errors, the in-flight 8th config
had written nothing — and the remaining 9 configs ran to exit 0.
No config was re-run, no file overwritten.)

## Prereg gates

| Gate | Bar | Result | Verdict |
|---|---|---|---|
| G1 instrument validity | full series + shape roll + daily opinion + daily pos + pilgrim state on all 16; 0 errors; every staged beat classified; UNCLASSIFIED ≤1/8; pilgrim rollup present | 16/16 complete, 0 errors, UNCLASSIFIED 0, pilgrim rollup on every armed record | **GO** |
| G2 the lever | covenant staged ≥3/8; every staged beat answered 'pact' and sat (death-day beats excluded from the denominator); stall read: zero-move continuation pilgrim-days band-wide ≤8 AND per-seed ≤8 on every seed; stale drops band-wide ≤4 | staged **8/8**; 8/8 beats answered 'pact' and sat (no beat staged on a death day — the exclusion is moot); zero-move **0** band-wide, **0 on every seed**; stale drops **0** | **GO** |
| G3 lever-only | zero `src/js`; proof tests green at recorded baselines | 0 `src/js` files changed; test-courtship-rework2-b **59/59** (new); test-courtship-rework-b **58/58** (one named assertion update, see metric review); test-courtship-b 57/57; test-covenant-b 33/33; test-onlylead-b 29/29; test-onlylead2-b 24/25 (known drift, unchanged) | **GO** |
| Cost bar (veto) | starvation ≤ baseline+2 AND median survival ≥0.8× baseline | starvation **1 vs 5**; median survival **175d vs 150d (1.17×)** | **PASS** |

## Per-seed per-shape table (armed leg, competent-courtship-b)

| seed | days | end | scale | covenant | national answer | first op-10 | max op | w4 kills | w5 kills |
|---|---|---|---|---|---|---|---|---|---|
| 100761 | 176 | village-lost | national | STAGED sat 1/1 | d68 sat | d16 | 67 | 7 | 0 |
| 100762 | 200 | survived | national | STAGED sat 1/1 | d73 sat | d17 | 48 | 2 | 0 |
| 100763 | 200 | survived | national | STAGED sat 1/1 | d109 sat | d4 | 42 | 5 | 2 |
| 100764 | 174 | village-lost | national | STAGED sat 1/1 | d64 sat | d4 | 47 | 6 | 4 |
| 100765 | 160 | village-lost | regional | STAGED sat 1/1 | d69 sat | d4 | 51 | 4 | 0 |
| 100766 | 150 | village-lost | national | STAGED sat 1/1 | d72 sat | d20 | 61 | 1 | 0 |
| 100767 | 200 | survived | regional | STAGED sat 1/1 | d81 sat | d4 | 51 | 4 | 0 |
| 100768 | 149 | village-lost | national | STAGED sat 1/1 | d99 sat | d5 | 40 | 3 | 1 |

Control leg (competent-covenant-b): covenant staged 1/8 (100765
only, sat 1/1, staged d172); lead 0/8, conquest 0/8, belong 0/8,
trade 0/8, UNCLASSIFIED 0. Armed leg: lead 0/8, conquest 0/8,
belong 0/8, trade 0/8, UNCLASSIFIED 0 — the isolation held (no
lead staging on the courtship leg). National held days, armed:
109, 125, 92, 111, 72, 79, 116, 51 (median ~100 days); control:
27 days on the one national seed, 0 elsewhere.

## Opinion trajectories

First day max-known-opinion reached 10, per seed:

| seed | armed | control |
|---|---|---|
| 100761 | d16 | d67 |
| 100762 | d17 | d46 |
| 100763 | d4 | d41 |
| 100764 | d4 | d47 |
| 100765 | d4 | d122 |
| 100766 | d20 | d93 |
| 100767 | d4 | d46 |
| 100768 | d5 | never (max 2) |
| **median** | **d4.5** | **d57** |

The lever opens opinion far earlier than baseline (4.5 vs 57) and
faster than the round-1 armed leg (median d16) — the round-1
median was dragged by 100646's 54 stalled days; with the stall
gone the gate opens on the deeds' own schedule. Max opinion armed
40–67 (median 49.5) vs control 2–34 (median 25).

## Deeds table (armed leg)

| seed | aids (kcal) | studies | pilgrimages | pilgrim-days | stale drops | walk refusals | tends paid (kcal) |
|---|---|---|---|---|---|---|---|
| 100761 | 3 (6,000) | 3 | 3 | 6 | 0 | 0 | 15 (22,500) |
| 100762 | 3 (6,000) | 4 | 4 | 7 | 0 | 0 | 12 (18,000) |
| 100763 | 3 (6,000) | 4 | 4 | 8 | 0 | 1 | 5 (7,500) |
| 100764 | 3 (6,000) | 4 | 4 | 8 | 0 | 0 | 12 (18,000) |
| 100765 | 3 (6,000) | 2 | 2 | 4 | 0 | 0 | 8 (12,000) |
| 100766 | 3 (6,000) | 4 | 4 | 8 | 0 | 19 | 8 (12,000) |
| 100767 | 3 (6,000) | 3 | 3 | 6 | 0 | 0 | 5 (7,500) |
| 100768 | 3 (6,000) | 0 | 0 | 0 | 0 | 0 | 4 (6,000) |
| **total** | **24 (48,000)** | **24** | **24** | **47** | **0** | **20** | **66 (99,000)** |

Every pilgrimage (24/24) ends in a study within 2 days of its
start (start→study gaps of 1–2 days; the one 1-day gap is seed
100762's second pilgrimage, start d10 → study d11). Verb counts
band-wide: `studyVillageCodex:policy` 24, `aidVillage:policy` 24,
`proposeCovenant:policy` 618, `_formPeerLink:policy` 31.

**The 19 walk refusals on 100766 are not a stall.** Probed live
(`/tmp/probe-766-map.js`, diagnostic, no corpus): village_0 sits
at (2,2) on an **unbridged creek tile — entry blocked from all
four sides** — so BFS correctly returns null (no path exists) and
the greedy fallback runs, counting each vetoed offered target as
a refusal (~19 across the approach) while still walking the
scholar one hop closer per call. The scholar reaches (3,2) and
studies from distance 1 (study range is 2): start d11, study d13,
0 zero-move days. The refusal counter is noisy by design now — it
counts greedy-fallback vetoes, and a genuinely unreachable village
spikes it without any stall. The stall read rests on zero-move
days (0), not on refusals. The creek-tile village itself is a
world-gen quirk for the backlog (see metric review #6): the
village is studyable by proximity but no one can ever stand at
its fire.

**Seed 100768 opens the gate on aid alone.** 0 pilgrimages, 0
studies, 3 aids (d5, d6, d10), opinion 10 by d5, covenant staged
d99. On a fast seed the aid — not the walk — opens the gate
(round-1 metric review #4, confirmed in the other direction:
the pilgrimage is not the only road to the gate).

## Wall numbers

| | control | armed |
|---|---|---|
| Won (table) | 0/8 | 0/8 |
| National ever | 1/8 | **8/8** |
| National final | 1/8 | **6/8** |
| Table / seat takes | 0 / 0 | 0 / 0 |
| Wave 4 ever | 7/8 | 8/8 |
| Wave 5 ever | 2/8 | **6/8** |
| Wave-4 kills (total) | 24 | 32 |
| Wave-5 kills (total) | 11 | 7 |
| Survived 200d | 1/8 | **3/8** |
| Median survival | 150d | **175d** |
| Starvation deaths | 5 | **1** |
| Total deaths | 91, 62, 55, 71, 116, 70, 91, 37 (mean 74.1) | 90, 93, 109, 117, 57, 57, 93, 78 (mean 86.8) |
| Deaths per 100 days (panel) | 56.2 | 49.0 |

National access is now universal on the armed leg (8/8 ever, 6/8
held to the end) — and unlike round 1, survival moved WITH it
this run: median 175d vs 150d, 3/8 survived vs 1/8, community
loss down (panel: 0.875 → 0.625). The panel still flags deaths
per run as `regression_watch` (74.1 → 86.8, CI spans 0) — the
armed villages live longer and fight more waves, so they bury
more villagers in absolute terms while dying slower per day
(49.0 vs 56.2 per 100 days). Wave-5 kills, however, went DOWN
(7 vs 11) while wave-5 facing tripled (6/8 vs 2/8): more villages
reach the wave-5 door, but they kill fewer wave-5 monsters once
there. The winnability gap is still downstream — national
without wins — but it is no longer national without survival.

## Starvation split (preregged: per seed vs aid kcal paid before death day AND vs pilgrim-days before death day)

Armed leg: **one starvation death** — seed 100768, d57. Aid paid
before the death day: **6,000 kcal** (the full lever spend, d5/d6/
d10 — 47 days before the death). Pilgrim-days before the death
day: **0** (no pilgrimage ever started on this seed). The death
is neither an aid-spend cost (the aid was paid in full, early)
nor an absence cost (the scholar never left) — it is trajectory,
the same reading round 1's diagnosis gave: the village that
starves is the one whose pantry collapses in the endgame trough,
and no 6,000-kcal gift 47 days earlier can explain it. Control
leg starved 5: 100761 d194, 100762 d106, 100763 d138, 100768 d34
+ d35 (the cold seed that died d41 with max opinion 2 — it
starved before the road could even start).

§14c guardrail (villager combat deaths >50% over the before-leg,
named per seed): **100762 (79 vs 52, +52%), 100763 (92 vs 39,
+136%), 100764 (102 vs 63, +62%), 100768 (65 vs 35, +86%).**
All other seeds are within the guardrail (100761 76 vs 74;
100765 46 vs 109; 100766 46 vs 59; 100767 80 vs 81). The rate
read splits them: 100762 (46.5 vs 55.4 deaths/100d) and 100768
(52.3 vs 90.2) are pure exposure — longer runs (200d vs 112d;
149d vs 41d) bury more villagers at a LOWER daily rate. 100763
(54.5 vs 34.6) and 100764 (67.2 vs 50.4) are real rate
increases on the two longest national-held runs (92 and 111
held days) — the covenant road holds villages at national
while wave-4/5 fighting kills their villagers faster. Named
here, not hidden. The guardrail is a co-primary read, not a
veto; the cost bar (starvation + median survival) passes.

## Sense-testing

The pilgrimage is fully voiced now — 24 starts, 24 studied
returns, 0 stale lines across the band. Quoted verbatim:

- Start (s100761 d3): *"You set out on the pilgrimage road to
  Thornfield's fire — their codex waits, and the covenant road is
  walked, not wished."*
- Return, studied (s100761 d5): *"You walk back into Haven,
  Thornfield's codex now read — the road was worth walking."*
- Council (s100761 d68): *"🤝 The founding council: speakers from
  Emberhold, Stonebridge, Thornfield sit in a circle — no throne,
  no kneeling. This league needs its first act. Swear the war-PACT
  (mutual defense — any member's call is answered, or refused
  aloud), found the shared POOL (2,000 kcal a week from every fire
  into one granary, drawn in famine), or WALK from this table for
  now. Or REFUSE the scale itself — stay a fr…"*
- Answer (s100761): *"🤝 The war-pact is sworn — no throne, no
  kneeling, just hands on the table. When any member's treeline
  burns, the league answers: Haven sends hands (two villagers,
  three days) or refuses aloud and the whole league hears it.
  Emberhold, Stonebridge, Thornfield — equals, now, in war as in
  council."*
- Codex keeper (s100766): *"\"Stonebridge learned these the hard
  way,\" the codex keeper says, closing the book for you. \"Every
  page cost somebody a winter. Don't waste it.\""*

Judgment: the return line now says what actually happened — the
codex is read, the road was worth walking — where round 1's line
said "still open in your head" after a completed study. The pact
answer line is the best in the corpus: it names the price (two
villagers, three days) and the refusal rule aloud. One blemish
remains, and it is engine text, not policy text: the engine's own
return line ("You walk back into Haven. N Codex entries. The
village is glad to see you.") still fires on adjacent days, so a
returning scholar can produce a run of identical homecoming lines
(65 of them on seed 100761 alone). Untouched, as before — it is not
this arm's text to rewrite.

## §15 balanced panel (instrument, not judge)

`scripts/build-courtship-rework2-panels-20261115.js` from the two
per-seed dirs; the compare itself ran through
`scripts/balance-panel.js compare` (per the prereg); output
`evidence/2026-11-15/courtship-rework2-b-panel.{json,md}`.
Decision: **review_required** (8 paired cases). National scale
access 0.125 → 0.75 (+0.625, no material signal, CI 0.125 to 1).
Village deaths per run 74.1 → 86.8 (+12.6,
`regression_watch`, CI spans 0). Village deaths per 100 days
56.2 → 49.0 (−7.2, no material signal). Community loss 0.875 →
0.625 (−0.25, no material signal). Table win rate 0 → 0. The
panel agrees with the preregged bars: national access up,
survival up in rate terms, absolute deaths flagged for the
longer exposure. The panel does not overturn the GO; it sharpens
the same downstream question round 1 left (why national access
without wins), now with survival moving the right way.

## Metric review

1. **The per-seed stall bar worked as designed.** Round 1's
   metric review proposed the per-seed bar alongside the
   band-wide one so one seed could not hide the stall. Both bars
   read 0 on every seed this run — the BFS fix removed the stall
   everywhere, not just on average. The bar stays as written for
   the confirm.
2. **The death-day exclusion was moot.** No staged beat fell on
   a village's death day (all 8 sat 1/1). The reading adopted
   from round-1 review #2 stands for the confirm, untested.
3. **The walkRefusals counter is now noisy (see §Deeds).** 19 of
   the band's 20 refusals come from the greedy fallback sweeping
   vetoed targets on one genuinely unreachable (creek-island)
   village. The counter counts vetoes, not stalls; the stall read
   already rests on zero-move days. Next run: split the counter
   into BFS-step refusals vs greedy-fallback vetoes, so a
   genuinely walled-in village does not look like a walk that
   keeps failing.
4. **The aid can open the gate alone (100768).** 0 pilgrimages,
   0 studies, opinion 10 by d5 on three aids. The pilgrimage is
   the reliable road, but the aid is a road of its own on fast
   seeds — a future lever revision could ask whether the aid
   should fire before the first study by design, or whether the
   walk should matter more. Design question, not a measurement
   fix.
5. **The §14c guardrail trips on 4 seeds (named above).** Two
   are pure exposure (longer runs, lower daily rate); two are
   real rate increases on long national holds. The guardrail is a
   read, not a veto, and the cost bar passes — but the confirm
   should watch whether national-held villages keep dying faster
   per day at wave 4/5. If the confirm shows the same split, the
   next arm is downstream (what happens AFTER national), not the
   road.
6. **A village can sit on an unbridged creek tile (100766,
   village_0 at (2,2), entry creek from all four sides).** BFS
   correctly reports no path; the pilgrimage still completes
   because study range is 2. The scholar can never stand at that
   village's fire. This is a world-gen quirk, not a lever defect
   — added to the findings backlog as an open item. It also means
   "unreachable on foot" does not imply "uncourtable": aid +
   study-by-proximity still work.
7. **National access without survival is narrowing, not closed.**
   Round 1: national 6/8 vs 3/8 with survival 1/8 vs 4/8. This
   run: national 8/8 vs 1/8 with survival 3/8 vs 1/8 and median
   175d vs 150d — the road now carries survival with it. But
   wins are still 0 everywhere and wave-5 kills fell (7 vs 11)
   while wave-5 facing tripled. The confirm's job is to check
   whether the survival gain holds on 16 fresh seeds; the
   winnability gap after national is the next arm's question.
8. **test-courtship-rework-b's one assertion update (G3).** The
   §1a(a) check 'walkTo counted the refused jumps' encoded the
   round-1 walk (travelTo refusals on jumps BFS never attempts).
   Updated to the BFS semantic ('zero refused travelTo calls')
   in the same commit as the design change, per repo AGENTS.md;
   check count stays 58/58. No other test was touched; no test
   was edited to go green.
9. **Policy vs analyzer pilgrim-days differ by 2 (47 vs 45).**
   The policy counts continuation days (including the study day);
   the analyzer counts series days with a pilgrimage in progress,
   so a trip whose study day falls on a snapshot boundary counts
   once in one instrument and not the other (100764, 100767).
   Round 1 had the same class of difference (99 vs 96). The
   zero-move read — the gated read — is 0 in the analyzer on
   every seed, and the policy counter agrees trip by trip (every
   pilgrimage ends in a study). No gate touches the 2-day gap.

## What stays open

- The confirm: 16 seeds × 2 policies on the reserved band
  **100621–100636** (stays fresh and unspent) — owed on this GO,
  for the coordinator's next run.
- The findings-backlog item ("THE PILGRIMAGE STALLS ON FAR
  VILLAGES") is [fixed] if the confirm holds the pilot GO; until
  then it stays [claimed] by this arm — the pilot GO is the
  lever working, the confirm is the proof it holds.
- The covenant road itself is proven open (8/8 staged, 8/8 sat,
  opinion 10 by median day 4.5). The winnability gap is now
  downstream: national access without wins, wave-5 kills flat
  while facing triples.
- New backlog item: a village on an unbridged creek tile is
  unreachable on foot (100766 village_0) — study-by-proximity
  still courts it, but no one can stand at its fire.
