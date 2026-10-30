# sim-kcalshort-b — strand-evening failure-mode census

Run: oversight-flesh-out-loop-b, arm sim-kcalshort-b, axis
food-economy. Worktree sim-kcalshort-b. DIAG ONLY:
measurement, zero src/js changes, zero policy-default
changes, no behavior probe built, run, or judged.
Sibling trees never touched; main tree never touched.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-kcalshort-b-prereg.md (commit
3813b9024). Pinned base 18d27c4c20a7ce42cb5d655e047396d8a6377cd2
(worktree HEAD at prereg time). Primary metric: the
failure-mode census over strand evenings — kcal-short
share, wood-short share, median kcal gap on kcal-short
evenings. DIAG-GO bars, judged exactly as written:
(a) failure-mode table complete for 100% of strand
evenings on the current-master strand set (both judged
legs), every evening classified with gap numbers, zero
unclassified; (b) the #1499 question answered on
current data, per evening class with counts, with the
15009 day-13 case explicitly addressed; (c) determinism
re-run byte-identical on at least one leg; proof suite
green. §15 panel: applicability declared in the prereg
— pure DIAG census, no game-root delta, so no panel
compare .md (same standing as walktree/wakeforage).

Prior evidence read in full before designing anything:
sim-woodday-b.md (#1499: 15009 day 13, 4 logs,
kcal-short 24 kcal), sim-wakeforage-b.md (strand bank,
yield table, #1554: 15009's strand gone on the
wakeforage base), sim-pressb-b.md (bank reproduction:
only 15215 strands on the pressb base).

## Instruments

Recorder: scripts/kcalshort-trace-b.js (the woodday
driver with WOODDAY probe wiring REMOVED and exactly
two read-only additions: eveningPantryKcal via
Game.pantryKcal() and eveningPackFoodKcal via a sum
over scholar.inventory of kcalEach * units for
kcalEach > 0, both taken after dayPolicy.daily
returns; warmth spends a log and possibly kcal, never
food items or pantry stock, so the snapshots are
unaffected by it). Policy stack identical to the
woodday driver at WOODDAY=0. Analyzer:
scripts/analyze-kcalshort-b.js (strand definition and
evening-wood helpers identical to
scripts/analyze-woodday-b.js; classification from RAW
refusal-time gates — bridge needs 4 logs, 60 kcal,
96 ticks — never the bridge decision's first-failure
skip, which names only the first gate in wood, kcal,
ticks order and cannot express "both"). Proof:
scripts/test-kcalshort-b.js.

Classification inputs: woodcarry.classification at
refusal time — logs = woodPlayer, kcal = kcalLive
(fallback to kcal, named per evening if used — used
on ZERO strand evenings), ticks = ticksToDayEnd.
Evening kcal in the tables below is refusal-time kcal;
post-evening scholar kcal is reported separately and
never mixed with it.

## Fresh baselines — NO DRIFT from wakeforage/pressb

Woodday driver verbatim, OUTDIR override only, same
env (POLICY=nighttravel, COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1,
DAYS=30, bank 15003, 15009, 15091, 15211, 15215,
15220, 15221, 15337, 15376, 15439; all 10 seeds
survived 30 days on every leg):

| leg | creek | still | rescued | warmth acted | log-spent |
|-----|-------|-------|---------|--------------|-----------|
| guard (fresh) | 12 | 3 | 9 | 0 | 0 |
| ON (fresh) | 18 | 10 | 8 | 6 | 4 |

Exactly wakeforage's and pressb's fresh numbers.
The recorder legs reproduce them EXACTLY on every
per-seed creek/still/rescued count, every strand's
nights, and every strand evening's woods
(EQUIVALENCE BAR: holds on both legs, proven by
scripts/test-kcalshort-b.js). The recorder is proven
behavior-neutral; every number below is measured on
the true trajectory.

## The current-master strand set (re-derived, not inherited)

Only ONE seed strands on current master: 15215.
15009 has ZERO creek evenings on both legs — it does
not strand, does not even visit a creek evening. The
#1554 strand loss stands on this base too (third
consecutive base: wakeforage, pressb, now this pin).
Per the prereg, the census covers 100% of the strand
evenings that exist: guard 3 + ON 10 = 13 strand
evenings, all 15215. The woodday 15009 day-13 story
(4 logs, 24 kcal, kcal-short) is NOT current-master
behavior and is NOT quoted as a current result
anywhere below — bar (b)'s explicit-address
requirement is met by this paragraph and by the
tables, which answer on the current strand set.

## 1. THE FAILURE-MODE CENSUS (judged measurement)

### ON leg (primary; warmth live)

Strand: 15215 nights 7–16 (10 evenings).

| evening | class | logs | kcal | kcalGap | ticks | pantry kcal | pack food | post kcal | bridge skip |
|---------|-------|------|------|---------|-------|-------------|-----------|-----------|-------------|
| day 7 | ticks-only | 4 | 2254 | 0 | 47 | 21968 | 0 | 2254 | ticks-short |
| day 8 | kcal-only | 4 | 0 | 60 | 239 | 22580 | 0 | 0 | kcal-short |
| day 9 | kcal-only | 4 | 0 | 60 | 109 | 23250 | 0 | 0 | kcal-short |
| day 10 | wood-only | 3 | 240 | 0 | 238 | 24094 | 0 | 170 | wood-short |
| day 11 | both | 3 | 0 | 60 | 111 | 24403 | 0 | 0 | wood-short |
| day 12 | both | 2 | 0 | 60 | 239 | 24311 | 0 | 0 | wood-short |
| day 13 | both | 1 | 0 | 60 | 111 | 24662 | 0 | 0 | wood-short |
| day 14 | wood-only | 0 | 240 | 0 | 238 | 24873 | 0 | 240 | wood-short |
| day 15 | both | 0 | 0 | 60 | 111 | 26679 | 0 | 0 | wood-short |
| day 16 | both | 0 | 0 | 60 | 111 | 30581 | 0 | 0 | wood-short |

ON counts: ticks-only 1, kcal-only 2, wood-only 2,
both 5. kcal-short 7/10 (0.70), median kcal gap 60.
wood-short 7/10 (0.70), median wood deficit 3.
ticks-short 1/10. Zero unclassified, zero
kcalLive fallbacks, zero recorder errors, zero
pantry/pack nulls.

### Guard leg (secondary; warmth off)

Strand: 15215 nights 7–9 (3 evenings).

| evening | class | logs | kcal | kcalGap | ticks | pantry kcal | pack food | post kcal | bridge skip |
|---------|-------|------|------|---------|-------|-------------|-----------|-----------|-------------|
| day 7 | ticks-only | 4 | 2254 | 0 | 47 | 21968 | 0 | 2254 | ticks-short |
| day 8 | kcal-only | 4 | 0 | 60 | 239 | 22580 | 0 | 0 | kcal-short |
| day 9 | kcal-only | 4 | 0 | 60 | 109 | 23250 | 0 | 0 | kcal-short |

Guard counts: ticks-only 1, kcal-only 2. kcal-short
2/3, wood-short 0/3. The guard strand is pure food
(+ the ticks opener). It ends by RESCUE, not by
starvation: guard day 10 builds the bridge (4 logs,
180 kcal, 110 ticks) and the villager walks home —
verified on the guard corpus row (bridge built true,
retry arrived true).

### Pooled (13 strand evenings)

ticks-only 2, kcal-only 4, wood-only 2, both 5.
kcal-short 9/13 (0.69), median kcal gap 60.
wood-short 7/13 (0.54), median wood deficit 3.
ticks-short 2/13. Median pantry kcal 24094, median
pack-food kcal 0.

Three facts carry the verdict:

1. Every kcal-short evening sits at EXACTLY 0 kcal.
   The gap is never a near-miss: it is the full 60,
   on all 9 kcal-short evenings, both legs. The
   villager does not "almost" have the lashing — it
   has nothing in hand.
2. Pack food is 0 on ALL 13 strand evenings, while
   the home pantry holds 21,968–30,581 kcal and
   GROWS across the strand. The village is not
   starving; the field villager is disconnected from
   it. The gap is carriage, not scarcity — food the
   villager cannot reach might as well not exist.
3. The bridge skip names wood-short on all 5
   both-evenings. The spoken line is TRUE (the pack
   is short of logs) but INCOMPLETE: it never says
   kcal is also 0. Anyone reading only the narration
   — player or analyst — would call the late strand
   a wood failure and miss that food binds on every
   one of those evenings too. The raw-gate census
   exists precisely because the first-failure line
   cannot express "both". (Filed as a backlog item
   below; the line is not a lie, so no wording change
   is proposed here.)

## 2. THE #1499 ANSWER (plain words)

On current master, the strand evenings' binding
failure is food AND wood jointly — neither alone
describes it.

The strand opens on time, not food or wood: night 7
holds 4 logs and 2,254 kcal but only 47 ticks, and
the bridge needs 96. Nights 8–9 are pure food
failures (4 logs, 0 kcal). Then warmth — the fire
the villager lights to survive the night — starts
eating the bridge logs: night 9's fire spends one
(4→3), night 11's spends another (3→2), night 13's
the last (1→0). From night 10 on, every evening is
wood-short or both; 5 of the 10 ON evenings fail on
BOTH gates at once.

So: wood levers alone cannot move this strand (the
5 both-evenings would still fail on kcal, and the
2 kcal-only evenings would still fail). Food levers
alone cannot move it either (the 7 wood-short
evenings would still fail on logs). And without
warmth the strand is a different, shorter animal —
3 nights, pure food, ending in a built bridge on
night 10. Warmth does not merely accompany the
strand; it EXTENDS it, by burning the very logs the
bridge needs. Any fix aimed at this strand must feed
both gates, or it must reckon with the warmth fire
as a log consumer — feeding the villager without
protecting the logs leaves 7 failing evenings, and
protecting the logs without feeding the villager
leaves 7 failing evenings (the same count, a
different set: the overlap is the 5 both-evenings).

The 15009 day-13 case, explicitly: on current master
15009 does not strand at all (0 creek evenings, both
legs), so its woodday story — 4 logs failing
kcal-short at 24 kcal — cannot be re-verified and is
not the current answer. The current strand set's
nearest analogue is nights 8–9: 4 logs, 0 kcal,
kcal-only — a food failure with a bridge's worth of
logs in hand, exactly the shape #1499 described, but
with a full 60-kcal gap rather than 36, and on 15215
rather than 15009.

## 3. WHAT THE CENSUS DOES NOT CLAIM

- No neither/other evenings exist on either leg:
  every strand evening fails at least one gate, and
  every bridge skip matches its class's first gate.
- Ticks bind only on night 7 (both legs, 47 ticks).
  After night 7, ticks never bind again (109–239).
  The strand is not a time failure past its opening
  night.
- The census prices the gap; it does not prescribe
  the fix. Whether the answer is carried rations,
  a protected bridge-log reserve, a warmth fuel other
  than bridge logs, or something else is a design
  call for the food-economy axis — this DIAG arm
  built no probe and judges none.

## Sense-test (law — read end to end, judged for meaning)

Judged ON corpus, seed 15215, nights 11 and 13 —
both both-evenings (night 11: 3 logs, 0 kcal; night
13: 1 log, 0 kcal):

Night 11 reads as a coherent hungry day that forages
only unknowns ("A shot in the dark — you take what's
green: 5× unknown shoots, 5× unknown berries, 6×
unknown berries. Into the bag, unnamed. (Not food
until identified...)"), is told "Nothing edible",
reaches the creek, and is refused on wood alone
("the pack holds 3 logs, and a bridge needs 4") —
true, but silent about the 0 kcal that would block
the lashing anyway. Then the warmth fire catches and
spends a log (3→2): the fire that keeps the villager
alive tonight consumes tomorrow's bridge. The
sequence is honest in every line and quietly
tragic in its order: the refusal judges the
pre-fire pack, the fire spends after, and nobody in
the narration connects the two. Night 13 repeats the
shape with the last log (1→0): unknown berries
foraged, "the pack holds 1 log" (singular correct),
fire catches, pack empty. Two pre-existing ambient
wrinkles, same class as woodday/wakeforage, not
census failures: "fragments by the fire" gossip
lines run before the fire is lit, and night 11
carries a "Something moves out there — White Noise"
sighting with no fight in the day's own lines.
No bridge line, fire line, or count contradicts its
record on either night read.

PASS: both nights cohere as the census says they
should — a villager with unknown food it cannot eat,
a bridge it cannot lash for two reasons of which
only one is spoken, and a survival fire that burns
the bridge itself.

## Village assessment (plain words)

The banked villages are the same working villages
the strand arms have always seen: all 10 survived
30 days on every leg (ceiling effect of the window
+ banking selection, not a survival claim). The
story this arm adds is about the distance between
two pantries: at home, the village sits on
22,000–30,000 kcal and growing; in the field, its
villager carries no food at all and holds 0 kcal on
most stranded nights. The villager is not starving
because the village is poor. It is starving because
everything it needs — food, and after a few nights
of warmth fires, logs — is somewhere else, and the
day gives it no way to close that distance: its
forages return unknowns it cannot eat, its fire
eats its bridge, and the creek line that refuses it
names only half the reason. The strand is not one
failure but a sequence: a short day, then hunger,
then a fire that trades the bridge for the night,
until the pack holds nothing and the pantry might
as well be on another map.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Creek/bridge content
reached (ON: 18 creek evenings, 8 rescued; guard: 12
creek evenings, 9 rescued). Waves 1–2 in
9/10 banked villages on the ON leg, wave 3 in 1/10
(15439); waves 4–5 not reached in this 30-day
window (same window as woodday/wakeforage/pressb).

## Wall numbers

NOT OBSERVABLE as reachability on 30-day evening legs
(pre-seat, no field) — reported, never claimed.
Observed counts on the ON leg, all 10 seeds alive at
day 30: national 0, table 0, wins 0 (structurally
unreachable in this band, not a wall measurement);
wave reach: wave 1 in 10/10, wave 2 in 8/10, wave 3
in 1/10 (15439), waves 4–5 in 0/10; median survival
30 days (ceiling — all seeds survived the window);
harness death-sample counts 6–18 per seed (village
deaths over the 30 days as recorded by the harness,
not a mortality claim). Guard leg wall numbers are
identical on wave reach and survival.

## Proof

scripts/test-kcalshort-b.js: 52/52 checks pass
(classification unit cases for all eight classes +
null handling + kcalLive fallback; census totals
recomputed independently from the corpora; per-class
counts and medians recomputed; equivalence recorder
== fresh master baselines per-seed on creek/still/
rescued + strand nights + evening woods, both legs;
100% classified, 0 unclassified, 0 recorder errors,
0 pantry/pack nulls on strand evenings, every strand
evening fully priced; neither/other evenings
explained (vacuous — none exist); all seeds 30 days
alive; determinism 15003 ON byte-identical;
tracked-diff guard: src/ and scripts/policies/ clean
vs HEAD; recorder source contains no engine verb
calls). Instrument note (disclosed): the first
baseline guard leg was killed mid-run by a host
service restart after 9/10 seeds; seed outputs are
independent, so only the missing seed (15439) was
re-run into the same corpus dir with the identical
driver and env — no number from the killed run is
quoted, and the completed corpus passed the
equivalence bar in full.

## Metric review

- The raw-gate classification (not the bridge skip)
  is the right instrument for this question, and the
  run proves why: on 5 of 10 ON evenings the skip
  names wood-short while kcal is also 0. Any census
  built on skip reasons would have reported the late
  strand as a wood failure and missed the food half
  entirely. A future prereg must never accept skip
  reasons as failure modes.
- The median kcal gap (60) is exact, not estimated:
  every kcal-short evening is at 0 kcal, so the
  median equals every observation. Reporting it as a
  distribution would add nothing; the informative
  number is the share (9/13) plus the fact that the
  gap is always the full lashing cost.
- The pooled median pantry (24,094) mixes two legs'
  overlapping evenings (guard days 7–9 repeat inside
  the ON strand). It is reported as a pooled pricing
  aid only; the per-evening pantry column is the
  judged data, and the leg tables are the citable
  units. No verdict hinges on the pooled median.
- The "100% of strand evenings" bar behaved well on
  a single-seed strand set, but it is fragile to bank
  drift by construction: had 15009 stranded, the bar
  would have demanded its evenings too, and the arm
  would have had to say so. The bar's bank-composition
  reading (cover what exists, name what vanished) is
  what made it satisfiable here, and the next prereg
  should keep that clause verbatim.
- No metric revision is proposed for the class
  definitions or the gates: they separated cleanly
  (no neither/other, no unclassified, no fallback),
  and the guard/ON contrast (food-only vs food-and-
  wood) is exactly the comparison the classes were
  built to draw.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — food-economy/narration — LACKING
  LINE NAMES ONLY THE FIRST GATE: on both-evenings
  the bridge refusal names wood-short while kcal is
  also 0 (15215 ON nights 11, 12, 13, 15, 16). The
  line is true, not a lie — but a player or analyst
  reading only narration calls the late strand a wood
  failure and misses the food half. Whether the line
  should name all failing gates is a design call.
  (evidence: sim-kcalshort-b ON corpus, 15215.)
- [open] 2026-10-30 — food-economy/warmth — WARMTH
  EXTENDS THE STRAND IT WARMS: the warmth fire
  spends bridge logs (ON nights 9, 11, 13), turning a
  3-night food-only guard strand (rescued by a built
  bridge on night 10) into a 10-night food-and-wood
  strand. Warmth is both remedy and cause here;
  whether the fire should burn a non-bridge fuel, or
  the bridge logs should be protected from it, is a
  design call for the warmth/wood decision. (evidence:
  sim-kcalshort-b guard vs ON corpora, 15215.)
- [open, re-confirmed] 2026-10-30 — food-economy/drift —
  15009 STRAND LOST, THIRD BASE: the wakeforage
  #1554 loss stands on base 18d27c4c (15009: 0 creek
  evenings, both legs). Strand-built banks must
  re-derive membership per base. (evidence:
  sim-kcalshort-b fresh baselines.)

## Verdict

DIAG-GO. Bar (a): table complete for 100% of strand
evenings on both legs (guard 3/3, ON 10/10), every
evening classified with gap numbers, zero
unclassified. Bar (b): #1499 answered on current
data — food AND wood jointly, per class with counts
(ON: both 5, kcal-only 2, wood-only 2, ticks-only 1;
pooled: both 5, kcal-only 4, wood-only 2, ticks-only
2), with 15009 explicitly addressed as non-stranding
on current master. Bar (c): determinism 15003 ON
byte-identical; proof suite 52/52 green.

## Files

- Prereg: evidence/2026-10-30/sim-kcalshort-b-prereg.md
  (commit 3813b9024)
- Evidence (this file): evidence/2026-10-30/sim-kcalshort-b.md
- Recorder driver: scripts/kcalshort-trace-b.js;
  analyzer: scripts/analyze-kcalshort-b.js; proof:
  scripts/test-kcalshort-b.js
- Fresh baselines (woodday driver): evidence/2026-10-30/
  sim-kcalshort-b-corpus-base-guard, -base-on;
  censuses: sim-kcalshort-b-census-base-{guard,on}.json
- Judged recorder corpora: evidence/2026-10-30/
  sim-kcalshort-b-corpus-guard, -corpus-on;
  censuses: sim-kcalshort-b-census-{guard,on}.json
- Determinism: evidence/2026-10-30/
  sim-kcalshort-b-corpus-determinism (15003 ON re-run,
  byte-identical to the judged ON 15003 file)
