# sim-fieldpos-a — field-fight position trace (axis scale-onramp)

Run: fleshout-20261025T2115Z, arm sim-fieldpos-a. DIAG ONLY — zero
src/js game-code changes. This arm takes the 2015Z run's next blank:
the field-fight position trace — test LINGERING (defender-wounded
entities stay near Haven / near the fight site between fights)
against COUNTING-STRUCTURE (wounds never heal, so re-meets
accumulate by arithmetic, not position). Do NOT re-test the draft
hypothesis; sim-echodraft-a REFUTED it.

## PRE-REGISTRATION (binding — judged only against this)

Background (read before designing, not re-measured here):
- sim-defwound-a Stage 1: defender-wounded entities average 10.3
  re-meets each vs 4.1 for field-wounded ones (577 re-meets / 56
  entities vs 293 / 72).
- sim-echodraft-a REFUTED nearest-first drafting as the cause:
  nearest-first drafting is real (Spearman -0.654, 320/361 drafted
  from the nearest quartile vs 99.8 expected), but
  defender-wounded entities sit no nearer than field-wounded ones
  at draft time (drafted medians both 2; at-Haven share 0.0% vs
  3.4%), and raid share of re-meets is identical (34.5% vs
  35.8%). The residual gap is context-symmetric (2.57 vs 1.54
  wound events each; 4.01 vs 2.64 re-meets per event).

Substrate (fixed, do not change): tableseat-nowait policy, seeds
73671–73678, 180d death-aware horizon (runDays stops on death/win;
180 is the cap, not a fixed horizon). Control band to reproduce
exactly: deaths 234, national-ever 7/8, wins 4/8, wave-4 6/8,
wave-5 0/8, median 135d (cross-checks: raids 85, raiders 361).

Definitions (fixed before any sim):
- Field-fight resolve = a Game.resolveWildMonsterEncounter call
  with opts.raid falsy that returns a non-null fight record
  (villagerMonsterTick field fights; raid defender fights carry
  opts.raid and are the contrast population, not the test
  population). A call returning null (post-flee-rest guard) is
  counted as a no-fight call, never as a fight row.
- Fight-site position = the entity's tx/ty captured BEFORE
  delegating (the fight itself does not move the monster; the
  post-delegate tx/ty is captured as a fidelity check and must
  equal the pre-delegate pair). Haven coords = the village
  px/py at fight time (v.px ?? 4, v.py ?? 4 — the same Haven
  the draft and the lingering re-pin use). Distance =
  |tx-hx| + |ty-hy|; at-Haven = distance 0.
- First-wound source (whole timeline, from fieldpos rows): the
  context of an entity's FIRST below-line end — defender
  (manufactured by a raid fight), field (manufactured by a
  field fight), or arrived-wounded (its first below-line end
  started already below the line and no prior fight manufactured
  it). This matches the defwound/echodraft first-wound-source
  convention.
- Field re-meet row = a field-fight row for an entity AFTER its
  first wound event (row index strictly greater than the first
  wound event's row index), any outcome. The test population is
  field re-meet rows split by first-wound source (defender-first
  vs field-first); arrived-wounded rows are reported separately
  and never averaged into either class.
- Exposure (counting-structure check): for each wounded entity,
  days-alive = last-seen day (its last fight row's day, or the
  run's end day if still present) minus first-wound day, floor 1.
  Re-meets per day-alive = field re-meet rows / days-alive,
  averaged per class. If the per-entity gap shrinks to parity
  once exposure is divided out, the gap is arithmetic (more
  meetings because more days met), not position.

DIAG-GO rule (all required):
(a) detgate PASS (recorders OFF delegates byte-identically on
days/gameDays/ts, no diag surface, no wraps installed — the new
_fieldpos surface included in the check);
(b) corpus complete on 8/8 seeds with zero recorder errors and
zero overflow on every recorder;
(c) neutrality EXACT against the control band on deaths,
national-ever, wins, wave-4, wave-5, median days (any deviation
= STOP, recorder not neutral);
(d) every field-fight resolve on the band carries tx/ty (100%
of fight rows with non-null tx AND ty), AND the position
distributions for defender-first vs field-first field re-meet
entities are compared with a STATED verdict under the rule
below.
Any leg missing = DIAG-NO-GO.

VERDICT RULE (fixed before any sim — one of three, no open
hypothesis left):
- LINGERING CONFIRMED iff defender-first field re-meet rows
  cluster at Haven strictly more than field-first rows: at-Haven
  share at least 10 percentage points higher AND median distance
  strictly lower.
- Else COUNTING-STRUCTURE CONFIRMED iff the exposure check
  converges: the defender-first / field-first ratio of mean
  re-meets per day-alive lies within [0.8, 1.25] AND the
  at-Haven shares lie within 5 percentage points of each other.
- Else LINGERING REFUTED (the counting numbers are still
  reported in full, and the residual gap after exposure
  normalization is stated exactly as the next blank — a number,
  not an open hypothesis).

Sanity checks (reported, not bars): raid fight rows should sit
at Haven by construction (teleport before the defender fight) —
their at-Haven share validates the Haven coords, not the
hypothesis; pre- vs post-delegate tx/ty pairs must be identical
on all fight rows (any move is reported, not smoothed over);
untagged rows (seq null) are counted, never merged into a
species bucket.

Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law
and escalation; the break line and wave gating behind the wound
split). No doc covers field-fight positioning as a mechanic —
the position facts here are read from code (game.js
villagerMonsterTick: a villager on the monster's tile triggers
the fight; havenGrowth.js: lingering raiders are re-pinned to
the Haven tile each dawn), not invented.

## VERDICTS

DIAG-GO (all four legs pass — see "Gates" below).

POSITION VERDICT: COUNTING-STRUCTURE CONFIRMED — on the
pre-registered rule, exactly. Field re-meets of defender-first
entities do NOT cluster at Haven (at-Haven share 3.8%, LOWER
than field-first's 7.7%; medians both 2), and once exposure is
divided out the re-meet rates converge (ratio 1.06, inside
[0.8, 1.25]). Lingering is refuted in its field form, and the
draft form was already refuted by sim-echodraft-a. What remains
of the famous 10.3-vs-4.1 gap dissolves on entity counting
(see "The gap, dissolved" below): counted per entity instead of
per wound event, the two classes are re-met equally often
(4.41 vs 4.43). The gap was arithmetic — wounded animals are
re-counted at every meeting because wounds never heal — not
position.

## GATES

(a) DETGATE PASS: seed 73671, baseline days=180 gameDays=181
ts={tsNationalDay:77} vs wrapped-with-recorders-OFF identical on
all three, diagSurface=false, wrapsInstalled=false,
postSetupWorld=0. Identical to the defwound/echodraft detgates,
plus the new _fieldpos surface in the check.
(b) CORPUS PASS: 8/8 seeds, all five recorders errs=0,
overflow values 0 on every seed. Fieldpos fight rows equal
defwound fight rows on every seed (211/211, 70/70, 110/110,
124/124, 122/122, 52/52, 129/129, 76/76 — defFpMismatch=0).
(c) NEUTRALITY EXACT: deaths 234, national-ever 7/8, wins 4/8,
wave-4 6/8, wave-5 0/8, median 135d, raids 85, raiders 361,
pool 1494, pool wave-3+ 107 — every control headline reproduced
exactly, plus the per-seed lines (73671 survived 180d/16 raids/
31 deaths; 73672 won d97/7/25; 73673 won d124/7/28; 73674
survived 180d/14/18; 73675 won d135/13/24; 73676 village-lost
d70/7/31; 73677 village-lost d143/12/43; 73678 won d116/9/34).
(d) TRACE COMPLETE: 894 fight rows (322 raid, 572 field), 100%
with tx/ty (fightsMissingPos=0, untagged=0, noFightCalls=0),
and the position distributions below with the verdict above.

## WALL NUMBERS (this judged corpus)

national-ever 7/8, national-final 6/8, table 4/8, table-entered
4/8, wins 4/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median
survival 135d, deaths 234. Death-cause shares (pooled, 234):
villager combat 71, villager:villager combat 79, arena
(player) 28, sickness 16, expedition 9, ambush 5, monster 5,
wound that wouldn't close 5, starvation (villager) 4, alien 3,
contest (player) 2, dehydration (player) 2, Bulldozer 1,
Paparazzo 1, Living Wire 1, lockjaw (player) 1, starvation
(player) 1. (The two combat labels are the engine's own
cause strings, kept verbatim, not merged.) Arc reach: maxArc
4 on the four winning seeds, 3 elsewhere. The wall stands:
same villages, same numbers as the 1815 band — this arm moved
no lever, reached no new content.

## (a) FIELD POSITIONS: NO LINGERING, EITHER WAY YOU CUT IT

Field re-meet rows (field fights after an entity's first wound
event), pooled, by first-wound source (source key: 'raid' =
first wound manufactured by a raid/defender fight;
'field' = first wound manufactured by a field fight):
- defender-first: n=159, median 2, mean 2.18, at-Haven 6
  (3.8%), within-1 share 39.0%, within-2 share 76.7%.
  Histogram: dist 0:6, 1:56, 2:60, 3:5, 4:21, 5:4, 6:1,
  7:3, 8:3.
- field-first: n=208, median 2, mean 2.22, at-Haven 16 (7.7%),
  within-1 share 38.9%, within-2 share 73.1%. Histogram:
  dist 0:16, 1:65, 2:71, 3:10, 4:30, 5:6, 6:2, 7:1, 8:7.
- arrived-wounded: n=5, median 2, mean 2.8, at-Haven 1 (20%)
  — too small to read, reported, never averaged in.
Per-entity view (each entity's median field re-meet distance):
defender-first n=37 entities, median 2, at-Haven share 0.0%
(no defender-first entity's median field re-meet is at Haven);
field-first n=55, median 2, at-Haven share 3.6%. Per-seed
defender-first medians: 2, 1, 2, 2, 2, 2, 2, 2; field-first
medians: 2, 1, 2, 2, 2, 4, 2, 2. No seed shows defender-first
clustering at Haven.
Verdict-rule application: lingering required defender-first
at-Haven share ≥ field-first share + 10pp AND median strictly
lower. Observed: share is 3.9pp LOWER and medians are equal —
lingering fails in direction, not just in magnitude.
Counting-structure required exposure ratio within [0.8, 1.25]
AND shares within 5pp. Observed: ratio 1.06 (mean
re-meets per day-alive 0.0338 vs 0.0320; pooled rates
0.0346 vs 0.0290), shares 3.9pp apart — both legs hold.
Hence COUNTING-STRUCTURE CONFIRMED.

Sanity checks that validate the instrument, not the
hypothesis: raid fight rows sit at Haven 322/322 (the
teleport construction — if the Haven coords were wrong, this
would not be 100%); every mFlee row moves exactly one tile
(see "Correction" below); untagged rows 0.

## (b) THE GAP, DISSOLVED

The headline gap was 10.3 vs 4.1 re-meets per entity
(defwound Stage 1). Recomputed from THIS corpus, counted per
ENTITY (each entity's later fight rows counted once, not once
per prior wound event):
- defender-first entities: 247 later meetings / 56 entities
  = 4.41 each (88 raid + 159 field).
- field-first entities: 319 / 72 = 4.43 each (111 raid +
  208 field).
- arrived-wounded: 7 / 4 = 1.75 (n too small to read).
Ratio 1.00. There is no entity-level gap to explain. The 10.3
vs 4.1 counts each meeting once per prior wound EVENT of that
entity (defwound's event-counted 877 = 573 entity-counted
meetings + 304 repeat counts), and defender-first entities
carry more prior events each — so the event-counted total
inflates exactly the class that was defined by having events.
And every re-meet of a below-line entity IS another below-line
event (the wound persists, so the meeting re-counts as a wound
event): meetings and wound-events are the same count for
wounded entities, which is why the "events per entity" gap
(2.57 vs 1.54 defender wound events each, echodraft) and the
"re-meets per entity" gap are the same circular count, not
two facts. The field-position data in this arm adds the
independent leg: the meetings themselves happen at the same
distances for both classes, so no position mechanism is
needed to explain them either.
Residual, stated exactly (not hidden): the defender-wound-event
rate per entity (2.57 vs 1.54) is itself a raid-event count,
and defender-first MEANS drafted-and-wounded there, so that
class is draft-selected by construction (echodraft's
later-drafts-per-event 1.75 vs 1.23 is the same small draft-side
excess). This arm does not dissolve that sub-count further,
and it does not need to: it is a raid-event count, not a
field-position effect, and the field data here show no
position gap for it to hide behind.

## (c) CORRECTION — THE FIGHT DOES MOVE THE MONSTER

The pre-registration's mechanism note said "the fight itself
does not move the monster." The data refute that note, and the
recorder caught it because it captures post-delegate position:
709/709 mFlee rows moved, 0/185 other-outcome rows moved, and
every move is exactly one tile (Chebyshev 1 on all 709 —
game.js resolveWildMonsterEncounter: on mFlee the monster
steps one random adjacent tile, within the 9x9 world, never
onto a safe tile). The fight-site position used in every
distribution above is the PRE-delegate tile (the meeting tile,
where the villager stood), so the verdict is unaffected — but
the post-flee position is the fight site ±1, not the fight
site. Consequences, stated: a wounded animal never stays ON
the tile it was fought on (it steps away every time it flees),
which is itself anti-lingering evidence; and any future
"where does it go after the fight" question must use the post
tile, not the pre tile. The pre-registration's verdict rule did
not depend on this note, so no threshold was re-scored.

## (d) CLASSIFICATION CORRECTION — LIVING-ENTITY RULE

The analyzer's first version counted a wound event as an mFlee
below-line end only, giving first-wound sources 56/69/6
(n=131) against defwound's published 56/72/4 (n=132).
Investigation (recomputed from this corpus, no re-runs):
counting below-line ends that leave a LIVING entity — mFlee
or vFlee (vDie too, though none is a first wound here) —
reproduces defwound exactly: 56/72/4 (n=132). A vFlee also
leaves the monster wounded in the world (the villager fled),
and fieldFight persists HP for every outcome except vKill, so
the living-entity rule is the code-faithful one; the mFlee-only
rule wrongly dropped the two vFlee-first entities and
misclassified one more. The analyzer was corrected to the
living-entity rule and the unit test gained a vFlee case; the
summary was recomputed from the untouched corpus. Sensitivity:
under the mFlee-only classification the verdict is IDENTICAL
(counting-structure-confirmed; shares 3.8% vs 7.4%, medians
both 2, exposure ratio 1.04; field re-meets 370 vs 372).
The verdict rule and thresholds were never touched.

## SENSE-TESTING (one entity's story, with tiles)

Seed 73671, seq 2, the Drum-Belly Tanuki from the defwound and
echodraft sense stories — now with its field-fight tiles. Day 8
a defender drops it at the Haven tile itself (4,4) from full
health to 11%, in 3 rounds. Then it wanders. Its 17 field
re-meets: day 10 at (4,5) dist 1, day 12 at (4,3) dist 1, day
31 at (3,4) dist 1, days 72–74 at dist 2, 1, 1 — and then it
drifts OUT: days 78–124 at (5,7), (4,8), (5,8), (5,7),
(4,8), (5,8), (4,8), (4,8), dist 4–5, before coming back to
dist 1 on days 129–151. It is never met ON the Haven tile in
the field (its only Haven-tile fights are the raids that
teleport it there). Judged as a story: this is not an animal
lurking at the door. It is an animal wandering the near
woods, sometimes close, sometimes five squares out, getting
stared down wherever a villager happens to be standing —
because villagers roam the same near woods, and the near
woods are small. The full timeline is in
evidence/2026-10-25/sim-fieldpos-a-sense.txt. Villagers read
as people here in the limited sense this trace can judge:
field fights happen where villagers ARE (the meeting tile is
a villager's tile by construction), and the tanuki's story is
coherent across three independent traces (defwound, echodraft,
fieldpos) with no contradiction — the same animal, the same
days, the same wounds, now with tiles attached.

## VILLAGE ASSESSMENT (plain words)

These are the same villages as the 1815/defwound/echodraft
band, so the news is what placing the fights adds. The
wounded-animal mill is not a Haven-doorstep problem and not a
draft problem — it is a near-woods problem. Wounded animals
wander the same two-squares-out ring where villagers walk,
get stared down there, step one tile away, and get stared
down again next week — for months, because nothing heals them
and nothing finishes them except the scholar's own hand. The
field is where most echoing happens (572 field fights vs 322
raid fights; 372 field re-meets of wounded entities), and the
field treats defender-wounded and field-wounded animals
exactly alike: same distances, same rates, same shrugs. The
wall's draft is honest, the field is honest, and the mill
spins because the world never closes a wound — that is the
whole mechanism, and it is now measured in three independent
traces (draft, position, counting) with the same answer.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No metric was re-scored mid-run. The verdict follows the
  pre-registered rule exactly: lingering required BOTH a
  ≥10pp at-Haven excess AND a strictly lower median (failed
  in direction: 3.8% vs 7.7%, medians equal); counting
  required exposure ratio in [0.8, 1.25] AND shares within
  5pp (both held: 1.06, 3.9pp). The verdict is therefore
  COUNTING-STRUCTURE CONFIRMED, not softened.
- Two implementation corrections, both disclosed above, neither
  a threshold change: (1) the mFlee-relocation correction
  (pre-delegate tile remains the fight site); (2) the
  living-entity classification correction (reproduces
  defwound's 56/72/4; mFlee-only sensitivity gives the same
  verdict). The corpus files were untouched throughout; only
  the analyzer and the summary computation changed.
- Exposure definition, disclosed: days-alive runs from first
  wound day to the run's end day for still-present entities
  (last fight day if later). An entity last fought on day 70
  in a 180-day run counts 110 days-alive even if unmet after
  day 70 — it was still in the world, still meetable. A
  last-seen-day definition would raise both classes' rates
  together and cannot manufacture the convergence (the ratio
  is what the rule judges, and both definitions divide the
  same way).
- Balanced panel (§15): NOT run as a compare, deliberately —
  the panel cannot ingest per-seed recorder corpora (the same
  known error class defwound and echodraft reported). The
  sweep-compare tables on identical seeds (this corpus vs the
  1815 control band, reproduced exactly) are the comparison
  of record.
- Death-tele totals are NOT villager deaths (deathcensus
  correction, carried): the 234 headline mixes monster kills,
  scholar successions, and villager deaths, reported here as
  cause shares, not as a villager-death count.

## INSTRUMENT NOTES

- New: scripts/policies/fieldpos-diag.js (resolve wrap: pre/post
  tx/ty + Haven coords + lingering flag + defwound-mirror wound
  fields; pure analyzeFieldpos + verdictOf) +
  scripts/test-fieldpos-a-sweep.js (--one / --summary / --detgate
  / --sense) + scripts/test-fieldpos-a.js (analyzer unit proof,
  15/15).
- Reused VERBATIM (never edited): tableseat-nowait,
  raftdraft-diag, spawnsrc-diag, defwound-diag, sim-harness.
- Corpus: evidence/2026-10-25/perseed-sim-fieldpos-a/ (8
  per-seed JSONs + summary.json). Sense file:
  evidence/2026-10-25/sim-fieldpos-a-sense.txt.
- What the recorder cannot see (stated, not hidden): villager
  position beyond the meeting tile (the tile IS a villager's
  tile by construction, but which villager's routine brought
  them there is not recorded); wander path between fights
  (only fight-site tiles, never the path); the flee step's
  destination is recorded as post-tx/ty but the random
  direction choice itself is not logged.

## NEXT BLANK (concrete proposal for the next arm)

The echo mechanism is now settled on three legs: the draft
does not favor defender-wounded entities (echodraft), field
positions do not favor them (this arm), and entity-counted
meetings are equal (this arm). Do NOT re-run any of the
three. The next question is no longer "why are
defender-wounded entities re-met more" — on entity counting
they are not. The next question is the wound-closure blank:
with the mill proven to be counting, not position, the design
question is whether anything should ever close it (healing,
departure, villager finishing of met-below-line phantoms) —
and that is a Steve design ruling first (defender-finish
already NO-GO'd on cost guards; met-below-line finishing is
still a steve-call item from defwound). A paper arm first, no
new sims: price the closure options against this corpus
(how many phantom meetings each option removes) before any
rule arm is briefed.
Do NOT touch the defender-finish rule: it stays KILLED.
food-economy untouched (sibling loop B).

scale-onramp stays converging (NOT converged): this arm
settled a mechanism question (the echo gap is counting, not
position) but moved no lever, reached no new content, and
wave 5 remains 0/8 on this band (table-waiting 4/8,
table-entered 4/8 as measured by the sweep's progState flags;
whether that constitutes the full seat is not judged here).
Convergence state: converging.

## DIAG-GO SUMMARY (for the coordinator)

DIAG-GO. Verdict: COUNTING-STRUCTURE CONFIRMED (defender-first
field re-meets at-Haven 3.8% vs field-first 7.7%, medians both
2; exposure ratio 1.06; entity-counted re-meets per entity
4.41 vs 4.43). Commit lands record + tooling only (zero src/js
changes). Next blank: wound-closure pricing (paper arm) /
Steve ruling on met-below-line finishing. No [needs-eyes]:
diagnosis-only work.

