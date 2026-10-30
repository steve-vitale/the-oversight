# sim-woodday-b — daytime wood recovery census + morning-gather probe

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T0930Z,
arm sim-woodday-b, axis food-economy. Worktree sim-woodday-b.
Sibling loop A live on scale-onramp the whole run — never touched.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-woodday-b-prereg.md (commit 680363a43).
Pinned base aa05732023cc2f7b760a64118c027afc1ca3940e (worktree
HEAD at prereg time). Primary question: does pack wood EVER
increase during daytime on a stranded sequence without the bot
reaching haven — by what verb, how often, on which seeds/days?
Probe (conditional, policy-side only): a morning wood-gather
probe (engine verbs cutTree/clearBrush, adjacent cells only,
pack < 4, kcal >= 80, ticksLeft >= 96, max 2 fells) is built ONLY
if the census finds a window (a stranded-sequence morning with
an adjacent wood source). Probe GO bar: stranded evenings fall
by >= 3 vs the fresh warmth-ON baseline AND rescued crossings
do not fall AND no narration lie in sense-read tails — else
NO-GO, judged exactly, never re-scored.

## Fresh baseline — NO DRIFT (re-derived on the pinned base)

Master driver scripts/woodwarm-trace-b.js verbatim, OUTDIR
override only, same env as 0830Z (POLICY=nighttravel,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
WOODCARRY=1, DAYS=30, bank 15003, 15009, 15091, 15211, 15215,
15220, 15221, 15337, 15376, 15439; all 10 seeds survived 30 days
on every leg):

| leg | creek | still | rescued | warmth acted | log-spent | 15215 strand |
|-----|-------|-------|---------|--------------|-----------|--------------|
| guard (fresh) | 15 | 4 | 11 | 0 | 0 | days 7–9 (3) |
| ON (fresh) | 21 | 11 | 10 | 6 | 4 | days 7–16 (10) |

These reproduce the 0830Z numbers exactly (guard 15/4/11, ON
21/11/10, warmth 6/4/2, staged wood-short 7). The 0830Z censuses
are therefore NOT quoted as current-base behavior anywhere
below — every judged number below is fresh, and the old corpora
were re-analyzed only as a cross-check (Census A: ON 0/9
positive deltas, guard 0/2 — same answer, older base, noted).

## Census (judged measurement)

Instrumented driver scripts/woodday-trace-b.js (master driver +
READ-ONLY additions: morning woodCount, per-day wood-line scan,
adjacent + whole-tile wood-source counts, full day lines on
still-refused creek evenings; NO behavior change — proven by
the equivalence bar: instrumented guard and ON reproduce the
fresh master legs exactly on every per-seed count and on
15215's strand nights). Analyzer scripts/analyze-woodday-b.js.

### Strand table (fresh instrumented legs)

| leg | strands | strand pairs | deltas pos / zero / neg | carry inside strand |
|-----|---------|--------------|-------------------------|---------------------|
| ON | 15009 night 13 (1); 15215 nights 7–16 (10) | 9 | 0 / 9 / 0 | 0 |
| guard | 15009 night 13 (1); 15215 nights 7–9 (3) | 2 | 0 / 2 / 0 | 0 |
| probe | same as ON | 9 | 0 / 9 / 0 | 0 |

15215 ON evening woods: 4, 4, 4, 3, 3, 2, 1, 0, 0, 0
(nights 7–16); post-evening woods: 4, 4, 3, 3, 2, 1, 0, 0, 0, 0
(spends nights 9, 11, 12, 13; failed fires nights 8, 10 spend
nothing). Every adjacent pair's delta is exactly 0: the pack
never rises, never falls, between one stranded evening and the
next — it only falls at the evening warmth fire itself.

### Overnight reconciliation (both delta definitions agree)

On every strand pair, morningWood(N+1) == post-evening-wood(N)
(0 mismatches, all three legs): nothing happens to the pack
overnight. The daytime delta (def 2: evening(N+1) −
morning(N+1)) therefore equals the evening-to-evening delta
(def 1) on every pair, as the prereg required. Morning carry
never acts inside a strand (0 cases): the only refill on the
bank is the day-17 haven morning (0→4, pile 35→31) that ends
the ON strand.

### Source attribution: there is no daytime wood verb in play

- Gathering verb lines on stranded days: cutTree 0, clearBrush
  0, fallen-tree clear 0, pile-take 0 — on ON (11 stranded
  days), guard (4), and probe (11) alike. The day wood lines on
  stranded days contain only creek refusals, travel lines, and
  the lacking line itself.
- This matches the code survey: competent.js + nighttravel.js
  never call cutTree or clearBrush; competent's only
  clearBlockage call is rubble-for-stone (yields stone, never
  wood); forage yields plants, never wood; gatherTimber is
  exile-only. The bot's only pack-wood gains on this trajectory
  are the haven-pile morning carry and, in principle, the three
  field verbs — which it never runs.

### The window: adjacent vs whole-tile (the distinction that decides this arm)

- Pre-registered window (ADJACENT sources on a stranded-sequence
  morning): the analyzer's pair-morning scan finds 0. The
  full still-morning scan (every still evening's own morning,
  including single-night strands) finds exactly ONE:
  seed 15009, day 13, wake tile forest_floor (map 0,2), 1
  adjacent tree — with morningWood ALREADY 4 and morning kcal
  34. Its evening failure is kcal-short (24 kcal, lashing needs
  60), NOT wood-short. A morning cut there would add logs to a
  pack that already holds a bridge's worth, on a day whose
  bridge fails for food, not wood.
- Sharp fact (proof P7): NO still morning bank-wide with
  morningWood < 4 has ANY adjacent wood source. Every pack<4
  stranded morning on 15215 (days 10–16: packs 3, 3, 2, 1, 0, 0,
  0) wakes beside zero trees, zero bigtrees, zero bushes.
- Supplementary whole-tile scan (NOT the pre-registered window,
  reported separately): 15215's wake tile holds 8 bigtrees on
  every stranded morning — but none adjacent to either wake
  cell (micro-positions alternate 0,0 and 8,0, the entry
  corners). Wood exists on the tile, out of arm's reach. Whether
  micro-walking can reach those bigtrees (detail-cell
  passability, creek cells) is NOT established by this census
  and is NOT claimed here.

## Probe (built, run, judged — verdict NO-GO)

The window condition as written in the prereg (at least one
stranded-sequence morning with an adjacent wood source) is met
by the single 15009 morning, so the probe was built exactly as
pre-registered (scripts/policies/woodday.js, WOODDAY=1 opt-in,
master policy files untouched) and run on all 10 bank seeds
(WOODWARM=1 + WOODDAY=1, instrumented driver).

Probe records, bank-wide (300 loop-days): acted 0, missed 300.
Skip breakdown: at-haven 282, pack-ready 11, kcal-floor 7.
On 15215's strand mornings the skips are: day 7 at-haven
(bot still home that morning), days 8–9 pack-ready (pack 4),
days 10–16 kcal-floor (morning kcal 0, 0, 31, 0, 0, 0, 25 —
the bot is starving; it cannot afford cutTree's 80 kcal even
if a tree stood beside it). On 15009 day 13: pack-ready
(pack 4, kcal 34 — blocked on both gates independently).

GO bar judgment (fresh ON baseline: still 11, rescued 10):

| bar | probe | holds? |
|-----|-------|--------|
| (a) stranded evenings fall by >= 3 | 11 → 11, fall 0 | NO |
| (b) rescued crossings do not fall | 10 → 10 | yes |
| (c) no narration lie in sense-read tails | counts match records (see below) | yes |

Verdict: NO-GO. The morning adjacent-cut probe changes nothing
on this bank because it never acts: the only adjacent tree on
the bank stands beside a pack that already holds 4 logs, and
every pack-short stranded morning wakes treeless AND broke
(morning kcal below the 80-kcal felling cost). Per the prereg,
the probe file is committed as measurement record with this
NO-GO verdict; it is never wired as a default and never merged
as a behavior change. The warmth middle is NOT the adjacent
morning cut.

## Sense-test (law — read end to end, judged for meaning)

Full stranded days read from the instrumented ON corpus, seed
15215, nights 7, 8, 9, 10, 13, 16, plus the day-17 rescue:

- Night 7: travels wetland → forest floor → creek, forages,
  meets Dakota (named, remembered in journal), learns Old
  World Caches; refusal ticks-short (47 ticks, bridge needs
  96) — honest, and the count matches the record. Morning
  carry already-carrying (pack 4, pile 32).
- Night 8: forages, gains Green Thumb; refusal kcal-short
  (0 kcal) — honest; failed fire ("Sparks, then nothing")
  spends no log (4→4) — the line and the record agree.
- Night 9: refusal kcal-short (0 kcal) at pack 4, then the fire
  catches and spends one log (4→3) — the order is right (the
  refusal judges the pre-fire pack; the fire spends after).
- Night 10: wood-short line "the pack holds 3 logs" matches
  the record exactly; failed fire ("arms ache") spends nothing
  (3→3).
- Night 13: wood-short "1 log" — singular correct; fire
  catches, 1→0.
- Night 16: wood-short "0 logs"; warmth miss no-wood; no fire
  line at all — the bot does not pretend to a fire it cannot
  light.
- Day 17: morning carry acted (0→4, pile 35→31), travels
  grove → Haven, "You walk back into Haven. 17 Codex entries.
  The village is glad to see you." The window closes the way
  the 0830Z run said it would, and it reads as a return, not a
  teleport.

PASS, with two pre-existing ambient wrinkles (not lies, not
probe-bar failures, same class as the 0830Z note): "fragments
by the fire" gossip lines continue on fireless stranded nights
(days 8, 10, 13 — the bot has no fire, yet hears fireside
retellings), and day 16 carries combat-adjacent lines ("One
down — but 2 still hold the treeline") with no fight in the
day's own lines. No wood count, bridge line, or fire line
contradicts its record on any night read. Probe-corpus
spot-check (days 10, 13): wood-short lines name 3 / 1 logs,
matching the probe records — bar (c) holds.

## Village assessment (plain words)

The banked villages are working villages in a short window: all
10 survived 30 days on every leg (ceiling effect of the window
+ banking selection, not a survival claim). The story this arm
adds to the 0830Z story is about the mornings, not the nights:
the stranded villager wakes up hungry — morning food at zero
on most strand days — beside ground that holds no tree within
reach, while eight big trees stand somewhere else on the same
creek tile, unvisited, because nobody in the village's daily
routine walks over to cut one. The pack does not recover during
the day because nothing in the day recovers it: no gathering
verb runs, no villager hands the bot wood, the pile is back at
Haven. The only morning that offers a tree next to the bed is
one where the pack already holds a bridge's worth of logs and
the evening fails for food, not wood. Warmth's trap, restated
in daytime terms: the bridge logs burn at night, and the day
gives nothing back — not because wood is absent from the world,
but because reaching it is a behavior the bot does not have.

## Reachability

Creek/bridge content reached (21 creek evenings, 10 rescued
crossings per warmth leg; probe leg identical). Wave 1 in 10/10
banked villages, wave 2 in 10/10, waves 3–5 not reached in this
30-day window. No new content reached; no game change landed,
so no reachability change is claimed.

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no field) —
reported, never zeros. No national, table, or win claim is made
or implied by this run.

## Proof

scripts/test-woodday-b.js: 20/20 checks pass (probeGate unit
cases; instrumented == fresh master legs; guard 0 warmth acted;
0 positive / 0 negative deltas + 0 mismatches + 0 carry-inside
on all three instrumented corpora; probe acted 0 with stranded
and rescued unchanged; sharp window fact; 15003 determinism
re-run byte-identical; probe sense anchors). Woodwarm
regression scripts/test-woodwarm-b.js: ALL GREEN.
Instrument bars: recorder/classifier errs 0 on judged legs;
guard legs 0 warmth acted; both delta definitions agree on
every strand pair.
Instrument note (disclosed): the pilot (instrumented ON, first
8 seeds) validated the adjacent scan and reproduced the master
trajectory; the whole-tile count was then added as a read-only
supplementary scan and the instrumented legs were re-run in
full (ON 10 + guard 10) under the single final driver, so all
judged instrumented legs share one driver version. No judged
quantity (deltas, adjacent window) changed between pilot and
final legs.
Tracked diff guard: src/ and scripts/policies/ between pinned
base and final tree differ ONLY by the new opt-in probe file
scripts/policies/woodday.js (never a default); the driver,
analyzer, and proof are measurement scripts.

## Metric review

- The evening-to-evening delta definition separated daytime
  gain from overnight/carry effects cleanly on the fresh base:
  overnight reconciliation held on every pair (0 mismatches),
  and the guard control matched ON (daytime recovery is
  warmth-independent, as predicted). No metric revision is
  proposed for this definition.
- The morning probe's "away from haven at wake" gate is what
  the stack offers (inner.daily is atomic from the wrapper's
  view, so a morning probe is the only policy-side insertion
  point) — but this run shows its limit plainly: it is not a
  mid-day behavior. A probe that could walk to a tree DURING
  the day, after competent.daily's travel, would be a different
  instrument, not a tuning of this one; the next prereg must
  not silently re-label a morning probe as daytime recovery.
- The >= 3 stranded-evening GO bar was the right size for this
  bank (ON baseline 11 stranded evenings): the probe missed it
  by the maximum margin (fall 0), so no borderline re-reading
  is available — the NO-GO does not hinge on bar calibration.
- The window definition's gap is recorded, not hidden: as
  written it counts any adjacent-positive stranded morning,
  including one whose pack already holds 4 logs. The next
  prereg should define the window as actionable (pack < 4 AND
  adjacent source AND kcal/ticks headroom), or it will keep
  commissioning vacuous probes. This run followed the written
  definition and let the GO bar do the judging — the probe
  leg, not a re-definition, is what killed it.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — daytime wood recovery — the walk-to-tree
  middle: 15215's wake tile holds 8 bigtrees every stranded
  morning, none adjacent to the wake cell. A middle would
  require a walk-to-tree-and-cut behavior (micro-walk within
  the tile + cutTree), which no bot policy has. Needs a design
  answer first: is walking to a known tree on your own tile a
  competent-bot behavior, or does it wait on the travel-scale
  coherence work? (evidence: sim-woodday-b instrumented ON
  corpus, 15215 mornings 8–16.)
- [open] 2026-10-30 — daytime wood recovery — starvation gates
  recovery before wood does: 15215 strand mornings hold 0–44
  kcal (days 9–16 mostly 0), below both the bridge cost (60)
  and the felling cost (80). Even a treeless-morning fix that
  only adds adjacent trees would still strand the bot on food.
  Any recovery behavior must be measured together with its
  kcal cost, not as wood alone. (evidence: probe corpus
  woodday records, 15215 days 8–16.)
- [open] 2026-10-30 — daytime wood recovery — 15009's strand is
  a food failure, not a wood failure: its single still evening
  (day 13) holds 4 logs and fails kcal-short (24 kcal). Wood
  levers cannot move it; it belongs to the food-economy axis,
  not the wood axis. (evidence: instrumented ON corpus,
  15009 day 13.)
- [open] 2026-10-30 — narration — fireside gossip on fireless
  nights: "fragments by the fire" lines appear on stranded
  nights where no fire was lit (15215 days 8, 10, 13). Ambient
  and pre-existing (also noted 0830Z), not a lie about wood —
  but a sense-reader notices it every time. No wording change
  proposed here.

## Files

- Prereg: evidence/2026-10-30/sim-woodday-b-prereg.md
- Evidence (this file): evidence/2026-10-30/sim-woodday-b.md
- Driver: scripts/woodday-trace-b.js; analyzer:
  scripts/analyze-woodday-b.js; probe policy:
  scripts/policies/woodday.js; proof: scripts/test-woodday-b.js
- Corpora: evidence/2026-10-30/sim-woodday-b-corpus-guard,
  -corpus-on (fresh master-driver baselines),
  -corpus-instr-guard, -corpus-instr-on (judged census),
  -corpus-probe (judged probe), -corpus-determinism (15003
  re-run); censuses: sim-woodday-b-census-{guard,on,
  instr-guard,instr-on,probe}.json + sim-woodday-b-censusA-
  {guard,on}.json (0830Z re-analysis cross-check).
