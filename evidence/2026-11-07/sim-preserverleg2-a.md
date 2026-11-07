# sim-preserverleg2-a — the HAUL-THROUGHPUT vs ROT TRADEOFF deciding corpus for the preserver-widening pair

Run: oversight-flesh-out-loop, run fleshout-20261107T1205Z, arm
sim-preserverleg2-a, axis food-economy. Worktree:
`~/workspace/worktrees/sim-preserverleg2-a`, branch sim-preserverleg2-a.

Status: PRE-REGISTERED — the pre-registration
(evidence/2026-11-07/sim-preserverleg2-a-prereg.md) was written
BEFORE any sim in this run was executed. The RESULTS section below
was appended after the sweep completed and is judged ONLY against
that header. Prior runs' numbers quoted in the background section
are quoted, not recomputed and not re-judged.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
  The preserver-widening commit 75fdd9258 widens
  SPECIALTIES.preserver from ghost occupations matching nothing to
  the real occupation pool — a hypothesis about preservation
  throughput, not a finding; this corpus tests one precise
  consequence of it.
- No canon doc covers the tradeoff instrument — stated, not
  invented. The efficiency quantity, the GO bar, and the guards
  are measured instruments, not designed values.

## Background (quoted from prior runs, NOT re-judged here)

- leg2decide (seeds 9266-9281): deciding verdict STEP CONFIRMED,
  median step ratio 0.404x.
- rotdecide-govern (seeds 9310-9325): governing verdict STEP
  (CONTESTED), governing step 0.645x.
- rotcompanion (metric demonstration, NOT a verdict): the
  companion metric qualifies BOTH standing STEPs as
  DENOMINATOR-DRIVEN at corpus level (median pd1 abs ROSE on
  commit in both corpora).
- rotdecide2-b (seeds 9500-9515): the last deciding corpus on
  this pair: NO-GO (G1+G2 fail; median abs pd1 rot ROSE 7,380 ->
  9,353, x1.267; genuine down-moves 0). Its verdict STANDS and is
  NOT re-judged here. Its one down-move, seed 9514, was a
  FISHING BOOM — the no-depri village hauled 3.3x more food and
  rotted 5.9x more, while its cooks were credited more, not less.
- preserveact-b: preserve-action counts as primary: PILOT NO-GO
  (pooled batches+attempts 113.5 -> 102.0, P1 fail). Its verdict
  STANDS; preserve-action counts are NOT primary here.
- Findings backlog #1048: the next arm must pre-register a NEW
  deciding question — haul-throughput vs rot tradeoff,
  preserve-action counts as primary, or a different widening
  shape — and must NOT re-judge these corpora and must NOT
  re-run the ratio as judge. This run takes the FIRST of the
  three named questions.

## PRE-REGISTRATION (summary — the binding header is evidence/2026-11-07/sim-preserverleg2-a-prereg.md)

- Pair, ONLY pair: preserver widening, parent
  1f24a4ef04a857d33138fd0845cfa83df688285c -> commit
  75fdd92587ad9d83bb12f05da535cdfb49255835.
- Anchor contrast: policy leadfeast, DEPOSITGATE=1, FEASTSCALE_R13=1,
  SEATDRIVE=0 (all asserted FATAL), PLENTYDEPRI per SIDE, 100d
  death-aware horizon (dead villages stop; +10d tail max).
- Seeds, FRESH band: 96500-96515 (16 seeds), verified fresh before
  sweeping (all 603 dated preregs + all evidence .md files +
  filename scan + exact-token search over all evidence files;
  zero hits naming the band; the only exact-token hits are kcal
  quantities in unrelated JSON, not seeds).
- THE DECIDING QUESTION (new, per #1048): the HAUL-THROUGHPUT vs
  ROT TRADEOFF. Per cell, H = invHaulKcal, R = total rotted kcal,
  E = 1 - R/H ("haul efficiency": the share of hauled kcal that
  did NOT rot; can go negative, never clamped; undefined when
  H = 0). Primary side pd1. Per-seed tradeoff classes:
  identical / throughput-win (E rises, H does not fall) /
  lean-win (E rises, H falls) / glut (H rises, E falls) /
  collapse (H falls, E falls) / flat-efficiency (E exactly equal,
  H moved) / degenerate (E undefined on an anchor).
- VERDICT RULE (binding — ONE governing verdict under the
  govern-verdict discipline; diagnostics qualify only, never
  replace): GO iff ALL of H1, H2, H3, S1, S2 hold:
  - H1: median E(pd1) rises >= 5 percentage points.
  - H2: (a) median invHaulKcal(pd1) does not fall; AND (b)
    throughput-wins >= glut + collapse.
  - H3: median abs rot(pd1) rises at most 10%.
  - S1: median daysAlive (all cells) on commit >= parent median - 5d.
  - S2: starvation deaths on commit <= parent + 5 (corpus totals).
  Otherwise NO-GO with the failed condition(s) named. The ratio
  step (govern-verdict.js) is a DIAGNOSTIC on this fresh corpus
  only — never the judge, never a re-judgment of old corpora.
- Pilot gate: first 8 seeds (96500-96507), all 4 cells; pilot is
  NOT a verdict; one pilot config re-run once as a determinism
  spot check, must byte-compare.
- Balanced panel (§15): attempt the compare; expected failure
  class is recorder-row ingestion — if it fails in that class,
  attach the analyzer's sweep-compare table instead (§15
  fallback). A tooling failure NEVER blocks or re-scores the
  verdict.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the fresh 96500-96515 corpus)

### Corpus completeness

- 64/64 per-seed files (16 seeds x {pd0, pd1} x {parent, commit}),
  all parsing, all anchorCommit tags + seeds + contrast matching.
  Analyzer exits 0; proof test in corpus mode: 63 PASS, 0 FAIL
  (47 synthetic + 16 corpus checks: rows, fatal-empty, counts
  sum, no ambiguous, tradeoff verdict computable, rot-rule
  diagnostic computable, wall configs, haul medians, E defined
  on >= 14 paired seeds, fish medians defined, govern records ==
  seeds, wrappers present on every cell, fish fields present,
  fish subset of invHaul on every cell). Pilot mode earlier:
  65 PASS, 0 FAIL (the extra checks are the pilot invHaul > 0
  and pilot E-defined bars).
- Corpus dir also holds 4 sweep summaries (one per anchor/side —
  NOTE: each covers the CONFIRM run's 8 seeds; the pilot
  summaries were overwritten by the confirm run writing the same
  OUT filenames, as in the anchor script's design — the per-seed
  files are complete at 64/64 and are the analyzer's ONLY
  inputs, so no number depends on the summaries), govern-input.json
  (16 records for the ratio diagnostic), govern-verdict.json (the
  ratio diagnostic output), govern-input-pilot.json (8 pilot
  records, written by the pilot analyzer run), preserverleg2-panel-attempt.md
  + .json (the §15 compare output, see below), and 12 trace files
  (seeds 96507 + 96508 + 96513, all 4 cells each, from
  HAULCOUNT_TRACE=1 re-runs) + 4 trace sweep summaries. Trace
  re-runs' per-seed files byte-compare to the corpus files
  (md5-verified 12/12) and every trace's totals reproduce its
  per-seed file's totals exactly (12/12) — the traces are
  deterministic re-reads, not new runs.
- Determinism spot check (pilot, pre-registered): commit-anchor
  seed 96507 re-run once after the pilot; both rewritten cells
  byte-identical to the pilot files (md5-verified 2/2).
- Validity preconditions all hold: 64/64 files, 16/16 seeds
  classified, E defined on 16/16 paired seeds (>= 14 required),
  fish + preserve fields present on every file, bucket closure
  holds on all 64 files (analyzer FATALs on any break; none).
  There IS a verdict, and it is below.
- EPERM FLAP, STATED NOT HIDDEN: the run hit the host write-flap
  twice — the first instrument copy failed (a flap-poisoned
  0-byte file blocked rewrites of that inode; recovered by
  deleting it and writing via temp-file + rename) and the first
  parent-anchor extraction failed in tar (recovered by retrying
  in an observed-good window). After the first safe-commit, the
  worktree index showed the six committed files staged-as-deleted
  (the known safe-commit index-clobber class); the commit itself
  was verified correct (all six worktree hashes == HEAD blobs)
  and the index was repaired with update-index --cacheinfo.
  No number in this corpus depends on any flapped write: every
  per-seed file was read back by the analyzer and the proof test.

### DECIDING VERDICT (binding H1+H2+H3+S1+S2, judged ONLY on 96500-96515)

- Median haul efficiency pd1: 0.816 -> 0.843 (delta +0.026 —
  the typical depri-side village kept 2.6 points more of what it
  hauled, not 5).
- Median invHaulKcal pd1: 134,169 -> 123,040 (the typical
  depri-side village hauled LESS on commit, by ~8%).
- Median abs rot pd1: 33,394 -> 12,109 (x0.363 — the typical
  depri-side village rotted far less in absolute terms).
- Tradeoff split: throughput-win 1, glut 0, collapse 0 (the
  split half of H2 holds: 1 >= 0).
- Guards: median daysAlive 100 -> 100 (S1 holds); starvation
  deaths 20 -> 17 (S2 holds).
- H1: FAIL (0.843 < 0.816 + 0.05 = 0.866). H2: FAIL on part (a)
  (123,040 < 134,169 — median throughput fell; part (b) holds
  but H2 needs both). H3: HOLD. S1: HOLD. S2: HOLD.
- VERDICT: **NO-GO, failed=H1,H2.** The widening did not let the
  typical depri-side village haul more while keeping more of it.
  What it did on this corpus is make the typical village LEANER:
  it hauled less and rotted less, keeping slightly less food in
  absolute terms (median kept haul 115,137 -> 109,867 kcal,
  -4.6%). The efficiency gain that exists (+2.6 points) is below
  the pre-registered bar and was bought, at the median, by
  hauling less — exactly the tradeoff this question was designed
  to catch.
- Kill taxonomy (§14a): CONCEPT-DEAD for the tradeoff claim as
  stated — the mechanism was staged, the metric was fair, and
  the concept failed on its merits (efficiency +2.6pts vs 5
  required, median throughput down). Do not retry this question
  without a new mechanism or a new question. This does NOT kill
  the widening as code (it is a historical commit under test,
  not a live lever), and it does NOT overturn any standing
  verdict.

### Diagnostics (reported, never re-scored)

- RATIO-STEP (govern-verdict.js, on THIS fresh corpus only,
  diagnostic): STEP (CONTESTED), governing step 0.260
  (M(parent) = 0.909, M(commit) = 0.236). Diagnostics: aggregate
  step 0.593 (STEP), ratio-of-medians step 0.329 (STEP),
  median-per-seed-step 1.000 (NO-STEP — 8 of the 14 included
  seeds are ratio-identical, step exactly 1). CONTESTED because
  the median-per-seed diagnostic sits in a different band from
  the governing STEP. 14 included ratio seeds, 4 excluded
  zero-denominator, 2 degenerate per-seed steps, 8 identical,
  4 moved down, 0 moved up, numerator-driven 2, mixed-driven 2,
  denominator-driven 0. The ratio steps down hard — and the
  verdict is still NO-GO, because the GO rule judges the
  tradeoff (efficiency + throughput together), not the ratio.
  A reader who only saw "ratio 0.260x" would call this a win;
  the tradeoff refuses it, because the typical village hauled
  less to get there.
- COMPANION VERDICT (governing=STEP supplied, diagnostic only):
  GENUINE — median pd1 abs fell, and genuine down-moves (2) are
  at least as numerous as denominator-driven + mixed (0 + 2).
  It agrees with the H3 hold; it does not override the GO rule.
- ROT-RULE (G1+G2+G3, diagnostic only, recomputed on this
  corpus): NO-GO failed=G3. G1 HOLDS on this corpus (median abs
  pd1 fell 33,394 -> 12,109); G2 HOLDS (genuine 2 >= denom 0 +
  mixed 2); G3 FAILS by a hair (median abs pd0 rose x1.104
  against the 1.10 guard — one seed's pd0 blowup, 96503 at
  5,602 -> 55,293). The rot rule and the tradeoff rule disagree
  in direction on this corpus (rot-rule fails on the pd0 guard
  while the tradeoff fails on efficiency + throughput) — both
  are reported; neither re-scores the other, and the binding
  verdict is the tradeoff rule.
- Ratio medians exclude the 4 degenerate seeds (govern
  convention); abs and E medians include all 16 seeds per column
  (E medians over the 16 paired-defined seeds). The GO rule uses
  E + haul medians, so the degenerate count cannot move it.
- Per-seed E deltas (pd1): 4 up (96507 +0.207, 96508 +1.729,
  96510 +0.122, 96514 +0.265), 0 down, 12 flat. Mean E delta
  +0.145 — pulled by 96508's +1.729 (a seed whose parent
  efficiency was NEGATIVE, -0.947: it rotted nearly twice what
  it hauled). The median (+0.026) is the honest typical-seed
  number; the mean shows the upside lives in one seed.

### Per-seed classification table — every seed (96500-96515)

Tradeoff class is on the pd1 side. E = 1 - rot/invHaulKcal.
"Cells ident." = all four cells equal parent->commit (ratio
classification's flag). 96503's pd0 cells moved while its pd1
cells did not — it is tradeoff-identical but not
cells-identical.

Seed | tradeoff class | E pd1 p->c | invHaulKcal pd1 p->c | rot pd1 p->c | keptHaul pd1 p->c | ratio class | step
96500 | identical | 0.828->0.828 | 111,382->111,382 | 19,134->19,134 | 92,248->92,248 | identical | 1.000
96501 | identical | 0.804->0.804 | 226,840->226,840 | 44,361->44,361 | 182,479->182,479 | identical | 1.000
96502 | identical | 0.318->0.318 | 403,497->403,497 | 275,219->275,219 | 128,278->128,278 | identical | 1.000
96503 | identical | 1.000->1.000 | 145,457->145,457 | 0->0 | 145,457->145,457 | degenerate (pd1-rot-zero-both) | n/a
96504 | identical | 0.984->0.984 | 156,305->156,305 | 2,515->2,515 | 153,790->153,790 | identical | 1.000
96505 | identical | 0.944->0.944 | 70,933->70,933 | 3,955->3,955 | 66,978->66,978 | identical | 1.000
96506 | identical | 0.730->0.730 | 178,858->178,858 | 48,347->48,347 | 130,511->130,511 | identical | 1.000
96507 | lean-win | 0.596->0.803 | 366,287->73,965 | 147,835->14,562 | 218,452->59,403 | genuine (sharp) | 0.151
96508 | throughput-win | -0.947->0.782 | 48,709->106,300 | 94,821->23,163 | -46,112->83,137 | mixed (sharp) | 0.101
96509 | identical | 0.397->0.397 | 82,630->82,630 | 49,845->49,845 | 32,785->32,785 | identical | 1.000
96510 | lean-win | 0.837->0.959 | 137,479->131,895 | 22,426->5,433 | 115,053->126,462 | mixed (sharp) | 0.098
96511 | identical | 0.643->0.643 | 162,450->162,450 | 57,938->57,938 | 104,512->104,512 | identical | 1.000
96512 | identical | 1.000->1.000 | 115,221->115,221 | 0->0 | 115,221->115,221 | degenerate (pd1-rot-zero-both) | n/a
96513 | flat-efficiency | 1.000->1.000 | 27,382->61,274 | 0->0 | 27,382->61,274 | degenerate (undefined-ratio) | n/a
96514 | lean-win | 0.592->0.857 | 124,927->67,470 | 51,022->9,656 | 73,905->57,814 | genuine (sharp) | 0.340
96515 | identical | 1.000->1.000 | 130,859->130,859 | 0->0 | 130,859->130,859 | degenerate (undefined-ratio) | n/a

Counts: identical 11, lean-win 3, throughput-win 1,
flat-efficiency 1, glut 0, collapse 0, degenerate 0. Ratio
classes: identical 8, degenerate 4, genuine 2, mixed 2.
DAYS-CHANGED NOTE: 96507 pd0 lived 100 -> 97 days and 96510
pd1 lived 100 -> 92 days on commit; 96513 pd1 lived 30 -> 53.
E = 1 - R/H compares haul totals, not rates, so the tradeoff
classes are not flattered by shorter lives the way abs rates
can be — the seeds keep their computed classes with this note
attached, per the rotcompanion days-changed convention.

### Per-seed HAUL/PRESERVE/FISH table — PRIMARY invHaul (every seed)

Scholar attempts/successes are 0->0 on every cell in this corpus
(leadfeast never preserves — expected, not a finding); villager
batches are 0->0 on every cell (tap absent at both anchors —
pre-registered, never read as "nothing preserved").

Seed | tradeoff | invHaulKcal pd0 | invHaulKcal pd1 | fishKcal pd1 | villRes pd1 | depri pd1
96500 | identical | 79,422->79,422 | 111,382->111,382 | 58,555->58,555 | 27->27 | 101,517->101,517
96501 | identical | 342,245->342,245 | 226,840->226,840 | 0->0 | 57->57 | 281,711->281,711
96502 | identical | 363,415->363,415 | 403,497->403,497 | 936->936 | 58->58 | 345,878->345,878
96503 | identical | 105,955->312,369 | 145,457->145,457 | 124,330->124,330 | 9->9 | 30,182->30,182
96504 | identical | 210,809->210,809 | 156,305->156,305 | 41,482->41,482 | 24->24 | 128,617->128,617
96505 | identical | 60,094->60,094 | 70,933->70,933 | 0->0 | 30->30 | 117,143->117,143
96506 | identical | 60,992->60,992 | 178,858->178,858 | 15,256->15,256 | 65->65 | 183,231->183,231
96507 | lean-win | 311,853->219,630 | 366,287->73,965 | 32,808->22,812 | 49->45 | 184,739->215,344
96508 | throughput-win | 66,233->205,852 | 48,709->106,300 | 1,080->7,670 | 62->39 | 394,110->265,349
96509 | identical | 153,855->153,855 | 82,630->82,630 | 0->0 | 58->58 | 323,237->323,237
96510 | lean-win | 70,726->115,766 | 137,479->131,895 | 13,356->16,356 | 43->41 | 346,352->252,064
96511 | identical | 75,836->75,836 | 162,450->162,450 | 12,870->12,870 | 17->17 | 131,745->131,745
96512 | identical | 472,262->472,262 | 115,221->115,221 | 20,285->20,285 | 50->50 | 124,188->124,188
96513 | flat-efficiency | 7,368->7,368 | 27,382->61,274 | 0->0 | 1->0 | 25,599->25,570
96514 | lean-win | 110,975->61,525 | 124,927->67,470 | 0->0 | 45->29 | 260,139->159,802
96515 | identical | 66,199->66,199 | 130,859->130,859 | 67,825->67,825 | 0->0 | 121,339->121,339

### Haul / preserve / fish medians (diagnostic only — never overturn the verdict)

- PRIMARY invHaul actions: pd0 186->201, pd1 251->216.
  invHaul kcal: pd0 92,689->134,811, pd1 134,169->123,040.
  The typical depri-side village hauled less on commit (actions
  and kcal both down); the typical no-depri village hauled MORE
  (kcal +45%). The throughput story splits by side: pd0 up, pd1
  down — and the verdict side is pd1.
- Census cross-check: census haul medians are IDENTICAL to
  invHaul medians, and census == invHaul on ALL 64 files
  (0 mismatches, actions and kcal). The inversion's delta is
  +0/+0 on this corpus too — same as the haulinvert pilot and
  rotdecide2-b. The code-proven new haul classes (Expedition
  meat, Buried cache, Genesis fruit, custom haulLabels) fired in
  NO traced event (0 predicate disagreements across all 12
  traces). They remain code-proven, not event-proven.
- FISH (new split, diagnostic): actions pd0 4->3, pd1 16->16;
  kcal pd0 2,886->1,050, pd1 13,113->14,063. Fish medians are
  essentially FLAT while total haul moved — the big haul moves
  in this corpus are Burdock and Lamb's Quarters (pieces-path
  plants), not fish. The split does its job here by showing the
  ABSENCE of a fishing story, which is itself the answer to the
  rotdecide2 metric-review proposal: a fishing-driven blowup
  would now be visible in the medians, and this corpus has none.
- Scholar preserve medians: attempts 0->0, success items 0->0
  on both sides (leadfeast policy, expected).
- Villager resolutions medians: pd0 43->44, pd1 44->39 — the
  typical depri-side village's cooks were credited slightly
  FEWER times on commit, the no-depri side flat. Villager
  batches 0->0 (tap absent, pre-registered).
- Bucket closure holds on all 64 files (analyzer FATALs on any
  break; none). Foreign bucket 0 on all 12 traces (no non-home
  pieces deposit fired).

### The attribution answer (what the new quantity bought)

The tradeoff quantity separates three shapes the old rot
columns could not tell apart:

- 96508, the only throughput-win. The parent depri village
  rotted 94,821 kcal while hauling only 48,709 — efficiency
  -0.947, kept haul -46,112: the pantry spoiled nearly twice
  what the village brought in (other inflows + starting stock
  spoiling). On commit it hauled 106,300, rotted 23,163,
  efficiency 0.782, kept haul +83,137. The trace names the
  change: Burdock appears — 18 deposits / 47,160 kcal where the
  parent had effectively none — alongside steadier foraging
  (139 Foraged food / 36,020 kcal) and 11 Fish catch / 7,670
  kcal. Its no-depri sibling did the same thing bigger:
  Burdock 0 -> 20 deposits / 142,290 kcal, haul 66,233 ->
  205,852, rot 73,626 -> 177,224 (efficiency -0.11 -> +0.14).
  One village, both sides, found a root crop and kept its food
  instead of watching the pantry spoil. This is the widening
  working — once, in sixteen seeds.
- 96507, the biggest lean-win. The parent depri village is
  drowning in Lamb's Quarters: 77 deposits worth 275,300 kcal
  (75% of its 366,287 haul), plus 150 Foraged food and 38 Fish
  catch. It rotted 147,835. On commit the Lamb's Quarters
  collapse to 3 deposits / 3,350 kcal; the village forages
  normally (135 Foraged food / 41,571 kcal) and fishes a little
  less (28 Fish catch / 22,812 kcal). Haul falls 366,287 ->
  73,965, rot falls 147,835 -> 14,562, efficiency 0.596 ->
  0.803 — but kept haul falls 218,452 -> 59,403. The village
  kept a bigger share of a much smaller mountain. The ratio
  calls this a genuine sharp step (0.151x); the tradeoff calls
  it what it is: leaner, not stronger.
- 96514, lean-win (the quiet one). Haul 124,927 -> 67,470, rot
  51,022 -> 9,656, efficiency 0.592 -> 0.857, kept haul
  73,905 -> 57,814. Same shape as 96507 at half the scale, and
  its cooks were credited less (45 -> 29 resolutions) — the
  village handled less food with fewer cook resolutions, not
  more food with better preserving.
- 96510, lean-win with a lifespan note. Haul 137,479 ->
  131,895 (nearly flat), rot 22,426 -> 5,433, efficiency
  0.837 -> 0.959, kept haul 115,053 -> 126,462 — the only
  lean-win that kept MORE in absolute kcal. But its commit
  village died 8 days earlier (100 -> 92 days) while its
  no-depri sibling's rot exploded (82,052 -> 219,758) on a
  bigger haul (70,726 -> 115,766) — a pd0 glut. The ratio calls
  the seed mixed-sharp (0.098x); the tradeoff keeps it a
  lean-win, with the lifespan note attached.
- 96513, flat-efficiency (the longer life). The parent depri
  village lived 30 days, hauled 27,382 kcal (55 Foraged food +
  2 Expedition haul), rotted nothing. On commit it lived 53
  days, hauled 61,274 (127 Foraged food + 2 Expedition + 1
  Snared meat), rotted nothing. Efficiency is 1.000 on both
  anchors — perfection, flat — because nothing ever spoiled.
  The extra 23 days of life are the whole story; the tradeoff
  quantity correctly says nothing about efficiency changed.
- 96503, identical on pd1 but the corpus's pd0 blowup. Its
  depri side is untouched (145,457 hauled, 0 rot, both anchors)
  while its no-depri side hauled 3x more on commit (105,955 ->
  312,369) and rotted 10x more (5,602 -> 55,293). The trace
  was not run for this seed (it is tradeoff-identical), but the
  per-seed row shows the same glut shape rotdecide2's 9514 had
  — on the side the verdict does not judge. It is the single
  seed behind the rot-rule diagnostic's G3 failure (pd0 abs
  median x1.104 vs the 1.10 guard).
- 96500 / 96501 / 96502 / 96504 / 96505 / 96506 / 96509 /
  96511 / 96512 / 96515, identical (the untouched). Eleven
  villages where the preserver widening changed literally
  nothing on the deciding side — same haul, same rot, same
  efficiency, same standing, same waves. Together with the
  flat-efficiency seed, 12 of 16 seeds never felt the change
  on pd1. The widening binds rarely, and when it binds it
  binds through haul volume (Burdock, Lamb's Quarters), not
  through preserving work: resolutions moved down or flat on
  every moved seed's pd1 side except none (96508: 62 -> 39,
  96507: 49 -> 45, 96510: 43 -> 41, 96514: 45 -> 29).

### Wall numbers (from this corpus only)

- Configs 64, national 53/64 (83%), table 0/64, wins 0/64.
  Per side: parent pd0 national 14/16, parent pd1 12/16;
  commit pd0 national 14/16, commit pd1 13/16 — the commit
  moved exactly ONE village across the national line (96508
  pd1, regional -> global), and none the other way.
- Wave max: wave 4 in 18, wave 3 in 24, wave 2 in 20, wave 1
  in 2; no config reached wave 5. (Per-cell wave max
  distribution.) Per side: parent pd0 wave4 7, parent pd1
  wave4 2; commit pd0 wave4 6, commit pd1 wave4 3.
- Median daysAlive 100 (the 100d horizon cap); 12 cells ended
  early: parent pd0 96500 (96d), 96513 (21d), 96515 (66d);
  parent pd1 96503 (53d), 96513 (30d); commit pd0 96500 (96d),
  96507 (97d), 96513 (21d), 96515 (66d); commit pd1 96503
  (53d), 96510 (92d), 96513 (53d). The paired early endings on
  both anchors (96500, 96513, 96515) show the horizon is
  death-aware, not a fixed run length.
- Death causes, 443 deaths: combat 237 (53.5%), monster 60
  (13.5%), ambush 41 (9.3%), starvation 37 (8.4%), sickness 33
  (7.4%), a wound that wouldn't close 10 (2.3%), dehydration 4,
  contest 4, the night 4, a dog-shaped silence at the tree 4,
  the glow stag 2, highbeam deer 2, spool 2, the terms of
  service 1, the expedition 1, the focus group 1. Starvation
  by anchor: parent 20, commit 17 (guard S2 holds).
- Table 0 is a construction fact (SEATDRIVE=0), not a
  scale-wall finding — the table is unreachable by design in
  this contrast, exactly as in leg2decide and rotdecide2-b.

### SENSE-TESTING: per-seed stories in plain words

- 96508, the only throughput-win. The parent village's pantry
  spoiled nearly twice what the village hauled — food went bad
  faster than it came in. On the widening, the same village
  found Burdock: big root hauls, steady foraging, a little
  fishing, and for once the pantry kept what came in
  (kept haul -46,112 -> +83,137). It also climbed from regional
  to global standing and reached wave 4. This is the one seed
  where the widening looks like the hypothesis: more food in,
  more of it kept.
- 96507, the biggest lean-win. The parent village hauled a
  mountain of Lamb's Quarters — 275,300 kcal of greens — and
  rotted 147,835 of its haul. On the widening the mountain
  never arrives: three small deposits instead of seventy-seven,
  ordinary foraging, a little less fishing. The village kept a
  bigger share of a much smaller harvest and ended the run with
  59,403 kept kcal where the parent had 218,452. It looks
  efficient and feels poorer. The ratio calls it a sharp
  improvement; the pantry disagrees.
- 96513, flat-efficiency (the longer life). A short-lived
  village that died at 30 days having rotted nothing — it ate
  everything it hauled. On the widening it lived 53 days,
  hauled twice as much, rotted nothing again. Nothing about
  keeping food changed; the village simply got more days.
- 96510, lean-win (the mirror). The depri village kept more in
  absolute kcal while hauling slightly less — the one lean-win
  that is not poorer — but its no-depri sibling drowned in the
  same run (rot 82,052 -> 219,758 on a bigger haul), and the
  depri village itself died 8 days earlier. A better-kept
  harvest in a shorter life.
- The untouched eleven. Eleven villages where the widening
  changed nothing on the deciding side. Their stories are the
  same on both anchors — same hauls, same rot, same standing —
  which is itself the finding: the widening binds rarely, and
  when it binds it binds through what villages haul, not
  through how much they preserve.
- Villager behavior sample (from fields + traces, not dialogue):
  deaths spread across combat, monster, ambush, starvation,
  sickness, wounds, dehydration, contest, and named oddities on
  both anchors; villages diverge in rank, wave, and lifespan in
  ways that track their food story (96508's Burdock village
  gains standing; 96507's greens mountain collapses; 96513's
  village simply lives longer). Traces show foragers, fishers,
  snare-keepers, and expedition returns by name (Foraged food,
  Fish catch, Snared meat, Expedition haul, Lamb's Quarters,
  Burdock, Sassafras, Muscadine Grapes, Maypop, Chickweed,
  Jerusalem Artichoke, Blackberry), aid arriving from named
  villages (Stonebridge, Emberhold), and tribute grain leaving
  for Emberhold. Nothing reads robotic: the same village
  forages, fishes, and hauls differently on the two anchors
  because its food story changed, not because a script
  repeated. LIMIT RESTATED: no dialogue, goals, or routines
  are captured by this instrument — the behavior sample is
  event-level, and a transcript-capture arm remains a separate
  instrument.

### Balanced panel (§15)

- ATTEMPTED, DID NOT FAIL IN THE PRE-REGISTERED CLASS:
  `node scripts/balance-panel.js compare --before
  <parent per-seed row> --after <commit per-seed row> --out
  /tmp/preserverleg2-panel-attempt` exits 0 and writes
  preserverleg2-panel-attempt.md + .json (copied into the corpus
  dir). The tool no longer crashes on recorder rows with the
  TypeError reading 'days' that rotdecide2-b hit — it now
  handles them as a sweep-corpus screen. The output is explicit:
  "Sweep-corpus comparison (not a balanced-panel verdict) ...
  1 paired cases; screen only; review_required." Table sitting
  rate 0 -> 0, national scale access 1 -> 1, every other
  contract metric not_observed (never imputed). It is a 1-pair
  screen, not a panel verdict — it neither supports nor
  contradicts the tradeoff NO-GO, and no disagreement with the
  GO rule arises. The analyzer's paired tables in this file ARE
  the attached sweep-compare table (§15 fallback, as in
  leg2decide / rotragged / rotdecide2-b). No panel.json.gz exists
  for either anchor (the panel driver runs sweep-compare
  policies, not the leadfeast/dg1 anchor contrast), so a panel
  compare cannot be built from this corpus without running a
  different experiment. That is a scope statement, not a gap to
  fill mid-run.

### Village assessment, in plain words

The villages in this corpus look like ordinary mid-game villages
on a 100-day clock: most reach national standing (53 of 64),
none reach the table, none win, none get past wave 4 — the
familiar scale wall in miniature, unchanged by the commit except
for one village climbing into national. What preserver widening
changed is not survival or standing in aggregate but food
handling, and it changed it unevenly: eleven villages noticed
nothing, three villages kept a bigger share of a smaller harvest,
one village found Burdock and kept far more of far more, and one
village lived longer without anything about keeping food changing.
The honest summary is not "villages preserve better now" — the
cooks were credited the same or less on every moved seed — and
not "villages preserve worse now" but "on fresh seeds, the
preserver widening did not let the typical depri-side village
haul more while keeping more of it: efficiency rose 2.6 points
against a 5-point bar, median throughput fell, and the typical
village kept 4.6% less food in absolute kcal." The blank this
run filled is the tradeoff blank rotdecide2 left open: for this
corpus, the widening's gains are lean gains (haul less, rot
less), not throughput gains — proven by the efficiency quantity
itself, not inferred from rot alone.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- THE GO RULE WORKED AS WRITTEN, NO MID-RUN REPAIR. H1, H2,
  H3, S1, S2 separated cleanly: H3, S1, S2 held while H1 and
  H2 failed — and H2 failed on its throughput half (median haul
  fell) while its split half held (1 throughput-win >= 0
  glut + collapse). The rule can therefore pass the split while
  failing the throughput median — it is not a single-threshold
  rubber stamp, and it decided this corpus without ambiguity.
  No threshold was moved, no metric re-scored, no band re-cut.
- THE MEDIAN IS PINNED BY UNTOUCHED SEEDS. 11 of 16 seeds are
  tradeoff-identical, so the median E moves only when the
  median seed moves — and the median seed is an identical one.
  The +0.026 median delta understates the four moved seeds
  (mean delta +0.145, all four up, none down). PROPOSED FOR
  THE NEXT RUN: report the mean of per-seed E deltas alongside
  the median as a diagnostic (never as the judge — the median
  stays the bar, because a mean lets one Burdock seed speak
  for fifteen villages).
- NEGATIVE E IS REAL AND INFORMATIVE. 96508's parent efficiency
  of -0.947 (rotted ~2x what it hauled) is the corpus's most
  informative single number: a pantry spoiling faster than the
  village hauls. PROPOSED: keep reporting E unclamped, and
  never let a future instrument clamp it at 0 — the clamp
  would hide exactly the spoilage story the tradeoff question
  exists to see.
- E IS IMMUNE TO THE LIFESPAN CONFOUND THAT HAUNTS ABS RATES.
  96510's commit village died 8 days earlier, which flatters
  its abs rot rate — but E compares haul totals, not rates, so
  the tradeoff class does not need the days-changed caveat the
  abs columns carry. A future deciding corpus should prefer
  total-based quantities like E over rate-based ones where it
  can.
- THE ROT-RULE GUARD FAILED BY A HAIR (x1.104 vs 1.10) on one
  seed's pd0 blowup (96503). The guard is doing its job; the
  margin is not a reason to move the threshold. Noted, not
  adjusted.
- GOVERN STEP (CONTESTED) vs TRADEOFF NO-GO. The ratio steps
  (0.260x, contested by the median-per-seed NO-STEP) while the
  tradeoff fails — the same lesson as rotdecide2 in a new
  shape: the ratio and the tradeoff answer different questions,
  and the tradeoff is stricter in exactly the way #1048 asked
  for. It refuses to credit "rot less by hauling less." Any
  future run that wants to re-open the ratio question must say
  so before sweeping, not after.
- FISH SPLIT EARNED ITS KEEP BY SHOWING AN ABSENCE. Fish
  medians are flat while total haul moved — the big haul moves
  are Burdock and Lamb's Quarters, not fish. The split now
  exists in the instrument, so a future fishing-driven blowup
  will be visible in the medians. PROPOSED: keep the fish
  split mandatory in future rot corpora (it costs one counter
  in the driver).
- VILLAGER BATCHES STAY BLIND AT OLD ANCHORS. Batches read 0/0
  by construction (tap absent at both anchors) — resolutions
  are the live signal, and they moved informatively here
  (96508 pd1 62 -> 39 while its village kept far more food:
  the keeping did not come from more cook resolutions). The
  preserveact-b pilot NO-GO stands alongside: preserving WORK
  did not rise either. PROPOSED: a future corpus on anchors
  that POSTDATE the tap should read batches as the primary
  villager signal and resolutions as the cross-check; until
  then, never print batches without the tap-absent caveat.
- SCHOLAR PRESERVE PATH UNTESTED BY THIS CONTRAST. Scholar
  attempts are 0 under leadfeast by policy, so the scholar
  preserve verbs (smoke/render/pemmican item-state deltas)
  were wrapped but never exercised. PROPOSED: a future run
  that wants the scholar path needs a preserving policy, not
  more leadfeast seeds.
- WHAT THIS VERDICT DOES NOT DO: it does not overturn
  leg2decide's STEP CONFIRMED (0.404x) or rotdecide-govern's
  STEP (CONTESTED) (0.645x) or rotdecide2-b's NO-GO (G1+G2) or
  preserveact-b's PILOT NO-GO (P1). Those verdicts are ratio,
  rot, and preserve-count verdicts on their own corpora, and
  they stand. What this corpus adds is a fresh-seed,
  tradeoff-judged verdict on the same pair: NO-GO (H1+H2
  failed). Read together, the four corpora say: the ratio steps
  on old seeds, the companion qualifies those steps, on fresh
  seeds the absolute rot improvement exists but the tradeoff
  does not — the widening makes villages leaner, not
  higher-throughput. The next arm that wants to overturn
  anything must say which verdict system it is overturning, on
  which corpus, before sweeping — not after. Per #1048, the
  remaining named option is a different widening shape; the
  ratio, rot, preserve-count, and tradeoff questions on this
  pair are now all answered on fresh seeds.

### Proof

- node scripts/test-preserverleg2-a.js => 47 PASS, 0 FAIL
  (synthetic, before the sweep: T1 ratio classification incl.
  all classes and both degenerate reasons, T1b tradeoff
  classification incl. all seven classes + E arithmetic, T2
  tradeoff rule incl. the rotdecide2 shape and a 9514-like glut
  shape, both of which must NO-GO, T2b rot-rule diagnostic
  incl. the prior-corpus shapes, T3 abs/median/closure/fish
  arithmetic).
- node scripts/test-preserverleg2-a.js --corpus
  evidence/2026-11-07/preserverleg2-a-corpus --seeds 96500-96507
  --pilot => 65 PASS, 0 FAIL (pilot bar: 32/32 files, tags,
  8/8 classifications, 0 unclassified, invHaul > 0 on all 32
  cells, E defined on all 32 cells, fish + preserve fields
  present, wrappers present, bucket closure via the loader).
  TEST-FIX NOTE (honest, pre-sweep): the first pilot run
  failed one check — "E defined on >= 14 paired seeds" — because
  the >= 14 validity floor was written into the pilot-mode
  check, where only 8 seeds exist. The check was corrected
  BEFORE the confirm sweep to be scale-aware (pilot: all 8;
  full: >= 14). The correction is in the committed test file;
  the full-corpus run passes it at 16/16.
- node scripts/test-preserverleg2-a.js --corpus
  evidence/2026-11-07/preserverleg2-a-corpus --seeds 96500-96515
  => 63 PASS, 0 FAIL (full corpus: 64/64 files, 16/16 seeds,
  0 unclassified, tradeoff verdict computable, rot-rule
  diagnostic computable, wall configs, haul medians, E defined
  on 16/16 paired seeds, fish medians defined, govern records
  == 16, wrappers present, fish fields present, fish subset of
  invHaul on every cell, bucket closure via the loader).
- node scripts/analyze-preserverleg2-a.js --corpus
  evidence/2026-11-07/preserverleg2-a-corpus --seeds 96500-96515
  --govern-out evidence/2026-11-07/preserverleg2-a-corpus/govern-input.json
  => exit 0, 16 seeds, TRADEOFF VERDICT NO-GO failed=H1,H2
  (see above).
- node scripts/govern-verdict.js --input
  evidence/2026-11-07/preserverleg2-a-corpus/govern-input.json
  => STEP (CONTESTED), governing step 0.260 (diagnostic only;
  output saved as govern-verdict.json in the corpus dir).
- Determinism: pilot spot-check 2/2 cells byte-identical on
  re-run; trace re-runs 12/12 per-seed files byte-identical to
  the corpus files (md5-verified); trace totals reproduce the
  per-seed totals exactly (12/12).
- Census == invHaul on all 64 files (0 mismatches, actions and
  kcal) — verified by an independent script over the corpus,
  not by the analyzer.
- Node harness: the sweep uses scripts/sim-harness.js
  (loadGame/setupGame/runDays) exactly as leg2drift/haulinvert/
  rotdecide2 do; Math.random is seeded before eval by the
  harness. No Game.save stub. No jest run (no jest suites touch
  this instrument; the proof test is the designated suite).
- Standing verdicts re-judged: NONE. leg2decide STEP CONFIRMED
  0.404x, rotdecide-govern STEP (CONTESTED) 0.645x, rotcompanion
  DENOMINATOR-DRIVEN qualifiers, haulinvert instrument GO,
  rotdecide2-b NO-GO (G1+G2), preserveact-b PILOT NO-GO (P1) —
  all stand. This corpus's NO-GO is a new verdict on fresh
  seeds under a new (tradeoff-judged) rule, not a re-judgment
  of any of them.

### Scope compliance

Zero src/js game changes. New files only: scripts/sweep-preserverleg2-a.js,
scripts/analyze-preserverleg2-a.js, scripts/test-preserverleg2-a.js,
scripts/sweep-one-preserverleg2-anchor.sh,
scripts/sweep-one-preserverleg2-trace.sh,
evidence/2026-11-07/sim-preserverleg2-a-prereg.md,
evidence/2026-11-07/sim-preserverleg2-a.md (this file),
evidence/2026-11-07/preserverleg2-a-corpus/ (64 per-seed files,
4 sweep summaries, govern-input.json, govern-input-pilot.json,
govern-verdict.json, preserverleg2-panel-attempt.md + .json,
12 trace files, 4 trace sweep summaries).
Instrument commit d9fa3b74d (pre-registration + instruments,
committed BEFORE the sweep). No push, no version bump, no live
verification. Ready to merge, pending coordinator landing.
