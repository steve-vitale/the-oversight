# Veterans alive TOGETHER — Loop B, run fleshout-loop-b-20261124T0840Z, arm sim-vetpair-b (DIAG)

Axis: winnability chain. DIAG-ONLY arm: zero src/js changes.
Anchor: HEAD `87f6312b4d2c` at leg time (instrument commit; prereg
`219ecba4f` on `a77a5a749`). Instrument: the standing-gearready
instrument reused VERBATIM under a new thin driver
(`scripts/vetpair-b-driver-20261124.js`, run `vetpair-b`) and a new
analyzer (`scripts/vetpair-b-analyze-20261124.js`). Proof
`scripts/test-vetpair-b-20261124.js` 7/7 before the leg. Policy
`scripts/policies/competent.js` `{competent}` VERBATIM, default
env. Horizon 150 days, death-aware. Seeds 109310–109325 (16) — a
deliberate REPLAY of the standingconfirm band for comparability.
Balanced panel (§15): INAPPLICABLE — a census, no before/after
change.

Prereg: `evidence/2026-11-24/sim-vetpair-b-prereg.md` (committed
before any judged sim). Staging (§9): pilot = seeds 109310–109317
(instrument fires, killers recorded, deaths attributed), confirm =
109318–109325, both judged against the same frozen bars. One
runtime restart interrupted the confirm leg after seed 109323 was
fully written (verified: all 14 files parse, 0 defects); seeds
109324–109325 were run cleanly afterwards — the driver refuses to
overwrite, so no seed was run twice in the judged leg.

## Verdict — DIAG-GO (all 4 frozen bars pass)

| # | Frozen bar | Result |
|---|-----------|--------|
| 1 | Classification completeness — every wave-4+ killer carries exactly one terminal status; 0 unclassified, 0 unclassified killer-deaths | **PASS — 30/30 killers classified, 0 unclassified** |
| 2 | Overlap measured on all 16 seeds (event-level AND snapshot-level); 0 seeds unmeasurable; 0 instrument errors | **PASS — 16/16, 0 errors** |
| 3 | Determinism — seed 109314 run twice yields byte-identical killer census | **PASS — daily series identical, census identical** |
| 4 | Instrument health — 0 instrument errors; 0 veteran-recount mismatches; every wave-4+ log row linked to a kill event; 0 orphans | **PASS — 0 on every count** |

The headline finding REFUTES the prereg's working description
("pairs never overlap") and replaces it with a sharper one — see
"The pair is the door's fingerprint" below. The overlap COUNT was
measured, not judged, so a refutation of the expectation is the
census succeeding, not a bar failure. No in-run re-scoring (§14).

## Pooled numbers (16 seeds, this arm's own corpus)

- Killers (wave-4+ blooded): **30** on 12 seeds; 4 seeds blooded
  nobody (109315, 109316, 109323, 109324). Terminal statuses:
  dead 21, alive-at-end 9, departed 0, unclassified 0.
- Overlap (event-level, from kill/death EVENTS): **92 days, 6
  windows, on 4 seeds**. Max living veterans at once: 4
  (109312). Snapshot-level (daily veteran lists): 85 days, 5
  windows, on 3 seeds — the 7-day gap is the transient-pair
  effect (see below).
- Blooding→death (21 dead killers): median **15 days**, max 50,
  min 1; 0 same-day deaths. Sorted: 1, 2, 3, 7, 7, 8, 8, 10, 11,
  12, 15, 15, 20, 20, 24, 24, 25, 25, 37, 41, 50. Half die
  within 12 days; half live 15–50 days.
- Death-cause split (21 dead killers): **"the wild" 12** (57%),
  combat 7 ("the arena" 3, "monster" 2, "contest" 2), starvation
  1, disease 1 ("a wound that wouldn't close"). Raw strings kept
  in the census table; groups per the frozen map.
- Wave-5 kills on this band: **3, not 4** — see "Correction" below.
- Ready days: 85 (14 + 61 + 10 + 0), on the same 4 seeds that
  overlap. Every ready day is an event-overlap day; the 7
  event-overlap days that are NOT ready are all snapshot-timing
  edge days (5 short on veterans only, 2 on 109314 short on
  weapons + veterans + armor).

## Per-seed table

| seed | days | end | scale | maxW | door | killers | overlap ev (days / windows) | overlap snap | max vets | ready days |
|------|------|-----|-------|------|------|---------|-----------------------------|--------------|----------|------------|
| 109310 | 150 | survived | regional | 4 | — | 1 | 0 / 0 | 0 | 1 | 0 |
| 109311 | 150 | survived | regional | 5 | d117 | 4 | 16 / 1 (116–131) | 14 | 2 | 14 |
| 109312 | 150 | survived | regional | 5 | d89 | 8 | 62 / 2 (89–91, 93–151) | 61 | 4 | 61 |
| 109313 | 97 | lost | regional | 5 | d65 | 4 | 12 / 2 (65–68, 84–91) | 10 | 2 | 10 |
| 109314 | 150 | survived | regional | 5 | d138 | 2 | 2 / 1 (137–138) | 0 | 2 | 0 |
| 109315 | 96 | lost | regional | 4 | — | 0 | 0 / 0 | 0 | 0 | 0 |
| 109316 | 49 | lost | village | 3 | — | 0 | 0 / 0 | 0 | 0 | 0 |
| 109317 | 150 | survived | regional | 4 | — | 1 | 0 / 0 | 0 | 1 | 0 |
| 109318 | 150 | survived | regional | 4 | — | 2 | 0 / 0 | 0 | 1 | 0 |
| 109319 | 150 | survived | regional | 4 | — | 1 | 0 / 0 | 0 | 1 | 0 |
| 109320 | 150 | survived | regional | 4 | — | 2 | 0 / 0 | 0 | 1 | 0 |
| 109321 | 122 | lost | regional | 4 | — | 3 | 0 / 0 | 0 | 1 | 0 |
| 109322 | 150 | survived | regional | 4 | — | 1 | 0 / 0 | 0 | 1 | 0 |
| 109323 | 68 | lost | regional | 4 | — | 0 | 0 / 0 | 0 | 0 | 0 |
| 109324 | 150 | survived | regional | 4 | — | 0 | 0 / 0 | 0 | 0 | 0 |
| 109325 | 150 | survived | regional | 4 | — | 1 | 0 / 0 | 0 | 1 | 0 |

## The pair is the door's fingerprint

On this band, overlap and the door are the SAME four seeds:
109311, 109312, 109313, 109314 open the door, and they are the
only four with any overlap day. The other 12 seeds — including
three that blood 2–3 killers each (109318, 109320, 109321) —
never hold two living veterans for a single day. The door opens
within a day of the pair forming on every seed (109312: overlap
starts d89, door d89; 109313: d65/d65; 109311: overlap d116,
door d117; 109314: overlap d137–138, door d138).

So the standingconfirm narrative needs its sharp edge corrected:
it is NOT true that "pairs never overlap." It IS true that a pair
is rare and fragile — 4 of 16 villages ever hold one, and on 3 of
those 4 the pair exists only because bloodings CLUSTER (109312
bloods 8 killers in 69 days; 109311 bloods 4 in 28 days). On the
non-door seeds the failure is SEQUENTIAL blooding, not
simultaneous death: the second killer bloods AFTER the first
dies. 109318: amina_diallo bloods d118, dies d138 "contest";
app_mgpspl1482 bloods d144 — six days too late. 109321:
gen_jwfuhpt d40→d47, gen_up9q8vq d50→d74, tashi_sherpa d100 —
each bloods after the last died. 109320: owen_smith d103→d128,
thabo_maseko bloods d150, the last day. The village does not
lose its veterans in a single catastrophe; it bloods them one
at a time, and the first is usually dead before the second
earns the title. The question for the next arm is what makes
bloodings cluster on the door seeds — kill rate, wave-4 spawn
density, party formation — not what kills veterans faster.

## The 109314 pair case, quoted (reproduced exactly)

The replay reproduces the standingconfirm corpus's pair case day
for day AND the determinism leg reproduces my own run byte for
byte (daily series identical, anchor `87f6312b4d2c` both runs):

- omar_farouk: blooded day 88 (wave-4 eater, via 'wild'), again
  day 96 (eulogy, aid-crisis) and day 116 (herald, wild); died
  day 138, "the wild" — 50 days alive after blooding, the longest
  on the band.
- visjoin_136: blooded day 137 (wave-4 audit, aid-crisis); died
  day 149, "monster" — 12 days alive after blooding.
- Event-level overlap: days 137–138 (2 days, 1 window).
  Snapshot-level overlap: 0 days — the pair formed after the
  day-137 snapshot and died before the day-138 snapshot (omar's
  death day 138 came before that day's snapshot). The gate's
  daily read never saw two veterans on this seed, yet the door
  opened day 138 on the release check that ran BEFORE the day's
  deaths. The instrument's two measures disagree by design here;
  the event-level measure is the true one.

## Census table (all 30 killers)

Blood = first wave-4+ kill day. Kills = wave-4+ log entries
(deduped; one duplicate choke-point call on 109313 excluded —
see Correction). AliveAfter = death day − blood day; null =
alive at end (censored).

| seed | killer | blood | kills (w4/w5) | death | cause (group) | aliveAfter | status |
|------|--------|-------|---------------|-------|---------------|------------|--------|
| 109310 | gen_8wfxdj8 | 103 | 1 (1/0) | 105 | the arena (combat) | 2 | dead |
| 109311 | gen_ps9tn1q | 88 | 1 (1/0) | 89 | the wild (wild) | 1 | dead |
| 109311 | gen_w8mp02u | 91 | 1 (1/0) | 99 | starvation (starvation) | 8 | dead |
| 109311 | mara_vasquez | 100 | 1 (1/0) | — | — | — | alive-at-end |
| 109311 | quinn_murphy | 116 | 2 (2/0) | 131 | monster (combat) | 15 | dead |
| 109312 | gen_l59pl8j | 57 | 1 (1/0) | 82 | the wild (wild) | 25 | dead |
| 109312 | gen_891vnz0 | 83 | 1 (1/0) | 91 | contest (combat) | 8 | dead |
| 109312 | boris_kowalski | 89 | 2 (2/0) | — | — | — | alive-at-end |
| 109312 | aroha_ngata | 93 | 1 (1/0) | 113 | a wound that wouldn't close (disease) | 20 | dead |
| 109312 | grace_obi | 107 | 1 (1/0) | — | — | — | alive-at-end |
| 109312 | devon_okafor | 109 | 1 (0/1) | 119 | the wild (wild) | 10 | dead |
| 109312 | jovan_milic | 119 | 2 (2/0) | 143 | the arena (combat) | 24 | dead |
| 109312 | luis_fernandez | 126 | 1 (0/1) | — | — | — | alive-at-end |
| 109313 | gen_2fleeyg | 58 | 1 (1/0) | 69 | the wild (wild) | 11 | dead |
| 109313 | wanjiru_kamau | 65 | 1 (1/0) | 68 | the wild (wild) | 3 | dead |
| 109313 | gen_c5dqn8u | 70 | 1 (1/0) | — | — | — | alive-at-end |
| 109313 | gen_wa9lzr8 | 84 | 2 (1/1) | 91 | the wild (wild) | 7 | dead |
| 109314 | omar_farouk | 88 | 3 (3/0) | 138 | the wild (wild) | 50 | dead |
| 109314 | visjoin_136 | 137 | 1 (1/0) | 149 | monster (combat) | 12 | dead |
| 109317 | chloe_dubois | 128 | 1 (1/0) | — | — | — | alive-at-end |
| 109318 | amina_diallo | 118 | 2 (2/0) | 138 | contest (combat) | 20 | dead |
| 109318 | app_mgpspl1482 | 144 | 1 (1/0) | — | — | — | alive-at-end |
| 109319 | gen_sb2h332 | 77 | 1 (1/0) | 92 | the wild (wild) | 15 | dead |
| 109320 | owen_smith | 103 | 1 (1/0) | 128 | the wild (wild) | 25 | dead |
| 109320 | thabo_maseko | 150 | 1 (1/0) | — | — | — | alive-at-end |
| 109321 | gen_jwfuhpt | 40 | 1 (1/0) | 47 | the wild (wild) | 7 | dead |
| 109321 | gen_up9q8vq | 50 | 2 (2/0) | 74 | the wild (wild) | 24 | dead |
| 109321 | tashi_sherpa | 100 | 1 (1/0) | — | — | — | alive-at-end |
| 109322 | ava_garcia | 112 | 1 (1/0) | 149 | the wild (wild) | 37 | dead |
| 109325 | oliver_moore | 82 | 2 (2/0) | 123 | the arena (combat) | 41 | dead |

No killer departed (0/30): exile/fled never took a veteran on
this band. No killer was ever stamped `by: "player"` (0 in this
corpus and 0 in the standingconfirm corpus's 64 wave-4+ kill
events) — scholar kills carry the scholar's villager id.

## CORRECTION — wave-5 kills on this band are 3, not 4

The standingconfirm evidence (sim-standingconfirm-b.md, §Wall
numbers and §4) states "wave-5 kills 4 (109312: 2, 109313: 2)"
and "kills TWO wave-5 monsters, both by gen_wa9lzr8 on day 91."
The log rows say otherwise, in BOTH corpora (my replay is
identical to the old corpus on these seeds): 109313 has ONE
wave-5 log row — gen_wa9lzr8, editor, day 91. The "second" kill
is the SAME kill reaching `recordWaveKill` twice (logLen 75→75,
`entryAdded: false` on the second call — the log dedupe working
as designed). 109312's two are genuine and distinct (devon_okafor,
editor, day 109; luis_fernandez, spoiler, day 126). Band total:
3. The standingconfirm file's prose over-counted calls instead
of log rows; its own per-seed table (109313 w5 = 1) already had
the right number. This arm's census counts deduped log entries
only. Coordinator: correct the standingconfirm prose (or note
the correction here and leave that file as-is).

## Sense-test — one seed's killer timeline (109312, plain words)

The richest village on the band. Eight people blood themselves
against the fourth draft across 69 days, and for two months four
of them are alive at once — the only village where the veteran
bench ever gets deep. gen_l59pl8j opens it day 57 and dies in
the wild day 82, twenty-five days a veteran. gen_891vnz0 bloods
day 83 and dies in a contest eight days later. boris_kowalski
bloods day 89 — the day the door opens — and is still standing
at the horizon. aroha_ngata bloods day 93 and dies of a wound
that wouldn't close, day 113. grace_obi bloods day 107 and
survives. devon_okafor bloods day 109 by killing a wave-5 Editor
(the first Producer kill on the band) and dies in the wild ten
days later, day 119. jovan_milic bloods the same day devon dies
and lasts until the arena takes him day 143. luis_fernandez
bloods day 126 by killing a wave-5 Spoiler in the wild and is
still alive at the horizon. Two Producers dead, four veterans
standing, the door open since day 89 — and still regional, still
no polity, still no table. The village tells the kills at the
fire by name — "Devon has been quiet all evening, and now
everyone knows why. 'Ducks in a row — I put it down today.'"
(day 15), "Jovan has been quiet all evening... 'The Terms of
Service — I put it down today.'" (day 30) — and the door fires
its doubled announcement on day 89, both wordings at once (the
doubled-release line the standingconfirm arm already filed).
Two repeated-frame oddities, both already filed, recur here:
the fire-beat frame repeats verbatim with only name and beast
changing, and "FEASTED ×2.03: Jovan's blow carries the feast"
repeats half a dozen times across days 26–42. Nothing new is
chased here.

## Village assessment (plain words)

Sixteen villages, and the whole story is in how their killers
arrive. Four villages blood killers in clusters — two or more
people earning the title while the last one still lives — and
those four are exactly the four that open the fifth draft's
door. The other twelve blood their killers one at a time, each
one dying in the wild or the arena before the next earns the
name; three of them blood two or three killers across the whole
run and never once hold two together. A killer who bloods
typically gets about two weeks — half are dead within twelve
days — but a quarter of them last a month or more, and the
longest-lived veteran on the band (omar_farouk, fifty days)
died the same day his village's door opened. What kills them
is mostly not the monsters that made them veterans: twelve of
twenty-one die "in the wild," off-screen, unnamed — the arena
and contests take seven more between them. Nobody starves to
veteran death in any numbers (one), nobody dies of disease in
any numbers (one), nobody leaves. The villages that never blood
anyone at all (four of them, including one that survives all 150
days) are the quietest finding: a village can live five months,
reach regional, and never once kill a fourth-draft monster. The
bar is not that veterans die too fast — median fifteen days is
enough to overlap, when the next blooding comes in time. The bar
is that the next blooding usually comes too late.

## Wall numbers (this census)

Wins 0/16. National (scaleRank) 0/16, table 0/16 (no seed
reached national, and the table requires it). Wave-5 unlocks
4/16, wave-5 faced 3/16, wave-5 kills 3 (corrected — see above).
Wave-4 faced 15/16. Readiness-5-ready days 85, on 4 seeds.
Median survival 150 days (CENSORED — 11/16 survived to the
horizon; sorted 49, 68, 96, 97, 122, 150×11), max 150
(censored). These are this census's own numbers on anchor
`87f6312b4d2c`, not pooled with the standingconfirm corpus.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- THE EXPECTATION WAS WRONG, THE BARS HELD: the prereg's
  working description ("pairs never overlap") is refuted as a
  blanket claim — overlap days total 92 on 4 seeds. The verdict
  is still DIAG-GO because the overlap count was MEASURED, not
  judged; the frozen bars were about classification
  completeness, measurability, determinism, and instrument
  health, and all four pass. The refined claim (overlap ⟺ door;
  non-door failure is sequential blooding) replaces the blanket
  one in "Next blanks."
- WAVE-5 KILL CORRECTION (4 → 3): the standingconfirm prose
  counted a duplicate choke-point call as a second kill. Future
  arms must count deduped LOG rows, never kill-event calls,
  for kill totals. The analyzer already does this (w4/w5 counts
  use `entryAdded` rows only).
- SNAPSHOT/EVENT GAP QUANTIFIED: daily snapshots understate
  overlap by 7/92 days (7.6%) — the pair that forms after a
  snapshot and dies before the next is invisible to the daily
  read. The release check runs during play, so the ENGINE sees
  it; only the instrument's snapshot view misses it. A future
  instrument could snapshot on the release event itself
  (standingconfirm metric review already filed this).
- "THE WILD" IS TOO COARSE: 12/21 killer deaths (57%) carry the
  cause string "the wild" with no further detail — the census
  knows WHEN veterans die and THAT they die off-screen, but not
  WHAT kills them out there. A finer attribution (expedition
  leg? wild encounter type?) needs its own instrument. Appended
  to sim-findings.md as an open observation.
- MEDIAN: 150 is CENSORED (11/16 survived to the horizon).
  Report it as "150 (censored)", never as a survival claim.
- DEPARTED: 0/30 killers departed — the departed terminal
  status was never exercised on this band. It stays in the
  taxonomy (exile/fled removals exist in code) but is
  unvalidated by live data.
- DETERMINISM: the replay leg passed with the daily series
  byte-identical — the harness is deterministic on this anchor
  for this band. The cross-corpus check (my 109313/109312 kill
  events vs the standingconfirm corpus) is also identical,
  including the duplicate call — the anchor move changed
  nothing on these seeds.

## Next blanks, in order

1. What makes bloodings CLUSTER on door seeds? The pair forms
   when the second killer bloods before the first dies; on 8/12
   non-door seeds the bloodings are sequential with gaps of
   days to weeks. Candidate mechanisms: wave-4 spawn density /
   kill rate, party formation (veterans hunting together),
   field-fight damage/staying (the win-fielddmg lane), wild
   ally-join (the win-allyjoin lane). Coordinate with, do not
   duplicate, those lanes — this census is the measurement they
   build against.
2. "The wild" kills 57% of veterans: what actually kills a
   veteran off-screen? Needs a finer death-attribution
   instrument (filed in sim-findings.md).
3. 109324: 150 days, regional, ZERO killers — a village that
   survives to the horizon without ever blooding. The healthy-
   but-bloodless shape is unexamined.
4. Wave-5 kill correction (3, not 4) needs the coordinator's
   call on whether to correct the standingconfirm prose.

## Proof and landing

- Proof: `scripts/test-vetpair-b-20261124.js` — 7/7 PASS
  (fixture + live harness smoke), re-run green before the leg.
  Determinism replay leg: seed 109314 twice, byte-identical
  daily series + killer census (replay file
  `vetpair-b-s109314-vetpair-b-replay.json`, NOT pooled into
  the 16-seed summaries).
- Commits (this worktree branch sim-vetpair-b; coordinator
  merges via --ff-only; ready to merge, pending ship — no push,
  no bump, no live verification by this worker):
  - `219ecba4f` sim-vetpair-b prereg (before any judged sim)
  - `87f6312b4d2c` sim-vetpair-b instrument: driver + analyzer + proof test (7/7)
  - (corpus + evidence commits follow)
- Files: prereg + evidence in
  `evidence/2026-11-24/sim-vetpair-b*.md`; per-seed JSONs in
  `evidence/2026-11-24/perseed-vetpair-b/` (16 judged files +
  1 replay file, `-vetpair-b-replay` in the RUN slot).
- Telemetry deviation check (body step 10): NOT APPLICABLE in
  the pilot's sense — a census with no before/after change; the
  scale-wall baseline carries a DO NOT compare note for
  pre-seat substrates. The wall numbers above are the report.
- Convergence state: DIAG-GO — the census question is answered
  (the pair is the door's fingerprint; sequential blooding is
  the failure); the next work is a BUILD question (what clusters
  bloodings), owned by the adjacent lanes.
