# sim-causebase-b — POOLED KIND-FILTERED VILLAGER DEATH-CAUSE BASELINE (axis food-economy, MEASUREMENT ONLY)

Run: fleshout-loop-b-20261025T0730Z (Sun 2026-10-25, loop B, second axis).
Worker tree: ~/workspace/worktrees/sim-causebase-b. Axis: food-economy.
MEASUREMENT ONLY: ZERO src/js game changes. This arm builds the pooled
baseline villager death-cause list that future arms will use for
"new death mode" guardrails, plus the reusable analyzer that produces
it. It reads existing corpora; it runs no new sims (see the
no-new-sims note in Metric review — no sim was needed to verify the
kind field, because the corpora themselves carry it).

Canon read first: docs/CANON.md, then docs/PRESERVATION.md (the food
ladder; pack food travels only what fits in the actual pack). No canon
doc covers death-cause taxonomy — the causes here are the engine's
recorded labels, not canon, and no label is invented or renamed in
this run. The death-census correction this arm implements comes from
loop A's sim-deathcensus-a (read-only; its axis and files untouched):
harness death lists mix monster + scholar + villager deaths, and
FALLEN is not a death census.

## PRE-REGISTRATION (binding — written BEFORE counting anything)

- Question: what does the kind-filtered villager death-cause
  distribution look like on the recent competent-policy food-economy
  substrate, pooled across enough runs that an 8-seed band's zero
  can never again read as "a new death mode"? (The 0630Z
  awayration-fix arm's "new starvation cause" guardrail flag fired
  only because its 8-seed baseline band contained zero starvation
  deaths at all.)
- Substrate (all pooled corpora): competent policy ONLY
  (scripts/policies/competent.js, unmodified), PLENTYDEPRI=1,
  DEPOSITGATE=1, 150d death-aware horizon, measurement-only arms
  (zero src/js in every source arm's own evidence). Pooling is
  legitimate only because every included corpus shares this
  substrate; any corpus failing any leg is excluded below, with
  the reason, before counting.
- Corpus rule (inclusion criteria, fixed before analysis):
  a corpus is ingested IFF (1) policy is competent, (2) every death
  row carries a kind field AND a scholar flag (kind + isPlayer /
  player), so the kind filter can actually be applied, (3) the arm
  is measurement-only (no game-code intervention), and
  (4) its seed band is disjoint from the other ingested bands
  (verified by the analyzer's seed-overlap report; overlap would
  be reported, not hidden).
- Corpora INGESTED (6, all under evidence/2026-10-24, per-seed
  files only; each dir's sweep summary file is listed as skipped,
  never silently dropped):
  1. pantrystarve-b-corpus — 8 seeds 94301–94308 (competent, 150d).
  2. fullpantry-diag-b-corpus — 16 seeds 94401–94416.
  3. fullpantry-confirm-b-corpus — 16 seeds 94421–94436.
  4. awayration-size-b-corpus — 8 seeds 94501–94508.
  5. fullpantry-casecount-b-corpus — 64 seeds 94601–94664.
  6. awayration-cover-b-corpus — 32 seeds 94701–94732.
  Total ingested per-seed files: 144. Total death rows before
  filtering: counted by the analyzer (see results).
- Corpora EXCLUDED, with reasons (stated before counting):
  - 0630Z fix pilot corpora (seeds 94801–94808 baseline + fix):
    UNAVAILABLE, not skipped by choice — the fix arm was KILLED
    at pilot and its branch (with corpora) deleted per kill
    protocol; no 9480x file exists anywhere under evidence/
    (verified by search). The pooled baseline therefore does NOT
    contain the 0630Z band; the guardrail note it motivated is
    still the reason this baseline exists.
  - perseed-deathcensus-a / perseed-raftdraft-a (2026-10-25):
    DIFFERENT SUBSTRATE — tableseat-nowait policy, not competent.
    Used for kind-filter VERIFICATION only (worked example +
    negative-control source), never pooled into the competent
    baseline. Deathcensus baseline side only is ever read (its
    armed side is the same 8 trajectories by G2 neutrality proof;
    reading both would double-count seeds 73671–73678).
    Raftdraft files carry no per-death list at all (only the
    aggregated killer:cause `deaths` dict), so they could not be
    kind-filtered even if the substrate matched.
  - All belongfeast / leadfeast corpora (belongcost,
    depositrelief, keepceil, leg2decide, leg2drift, pddrift,
    pdtradeoff, pdvalue, rotdecide-govern): WRONG POLICY — not
    competent. (Belongcost additionally lacks the scholar flag
    entirely — its rows carry kind but no isPlayer — so it could
    not be kind-filtered for scholar even under a policy waiver.)
  - Corpora with no per-death rows at all (depositrelief,
    keepceil, leg2*, pd*, rotdecide-govern): UNFILTERABLE — they
    carry only the cause-only `deathCauses` dict, which mixes
    scholar and villager deaths with no kind field to separate
    them. Ingesting them would re-introduce exactly the mixed
    population this baseline exists to remove.
  - Journey corpora (2026-10-24 / 2026-10-25 journey-*): NOT
    competent-policy sweep corpora — narrative runs on other
    substrates, excluded by criterion (1).
  - No corpus that would change a share was silently dropped: every
    candidate dir under evidence/2026-10-24 and
    evidence/2026-10-25 was inventoried above; each is either
    ingested or excluded with a stated reason.
- Denominator (binding): kind-filtered villager deaths ONLY =
  rows with kind in {villager, person} (both are sapient dead per
  src/js/corpses.js corpseIsPerson) AND scholar flag false
  (isPlayer false / player false). Scholar = the player character
  (successions); monster / animal rows are excluded, never
  counted. Denominator stated per corpus and pooled. FALLEN
  counts are never substituted: most death paths leave no fallen
  entry (deathcensus: 64 fallen vs 261 harness deaths).
- Cause taxonomy: RAW labels exactly as recorded in the corpora.
  NO NORMALIZATION — decided before counting, for two verified
  reasons: (1) the known duplicate-label pair from the 2026-10-24
  backlog ("villager:combat" vs "villager:villager combat")
  occurs ONLY in the sweep's aggregated top-level `deaths` dict,
  which encodes killer:cause, not per-death cause — it never
  occurs among per-death row causes (verified: zero rows carry
  either label across all 6 ingested corpora), so there is
  nothing to merge at row level; (2) monster-name causes
  ('choir toad', 'bulldozer', 'the eater', ...) look mergeable
  into generic 'monster', but collapsing them would require a
  monster roster the corpora do not carry (spot check:
  'choir toad' and 'the eater' do not occur in src/data/
  monsters.json text) and would destroy exactly the signal a
  guardrail wants (WHICH monster). Normalized table therefore
  EQUALS the raw table in this run; the analyzer emits raw only,
  and the guardrail rule below handles the long tail by count,
  not by invented grouping. (One recorder caveat, verified
  before counting: cause strings are truncated at 32 characters
  — 4 labels sit at exactly 32 chars cut mid-word — so long
  monster-name labels are approximate and two long names could
  in principle collide; no collision is observed in this pool.)
- Output: (a) pooled cause table with counts + shares + per-corpus
  breakdown (below + committed JSON); (b) reusable analyzer
  scripts/analyze-causebase-b.js (takes corpus dirs, emits the
  table; refuses loudly, non-zero, on any unparseable file or any
  per-seed file whose rows lack kind / scholar flag; lists every
  skipped summary file by name); (c) guardrail guidance below.
- Guardrail rule SHAPE (pre-registered; the numeric threshold N is
  justified from the pooled counts in the results, not chosen as
  a magic number): a future arm's cause label counts as a "new
  death mode" candidate ONLY if it is absent from the pooled
  baseline raw list AND appears at least N times among that arm's
  kind-filtered villager deaths, where N is set from the pooled
  singleton rate (how often baseline labels appear exactly once).
  A label PRESENT in the pooled list can never be "new" — only
  its share can shift, judged against the pooled share. A small
  band's zero is never evidence of absence. The analyzer's
  --compare mode implements this rule mechanically.
- Verdict bar for THIS arm (measurement, not a lever): DIAG-GO
  iff (a) the analyzer ingests all 6 corpora with denominators
  stated, (b) the proof test passes all 4 legs, (c) the
  kind-filter worked example (one monster death excluded, one
  scholar death excluded, from real corpus data, not synthetic)
  is shown, and (d) re-running the analyzer is byte-identical.
  No new sims are run: this arm reads existing corpora only.

## RESULTS

### Denominators (kind-filtered, per corpus and pooled)

The sweep corpora's death recorder is villager-only by construction:
across all 6 ingested corpora, zero rows carry kind monster/animal,
so the by-kind exclusion bites only in census-format corpora (see
the deathcensus verification below). The scholar exclusion is where
the sweep corpora's mixed population lives: 732 of 1,302 rows
(56%) are scholar deaths, and any unfiltered "death cause" table
built from these corpora would be mostly scholar successions.

| Corpus (seeds) | Files | Rows | Excl kind | Excl scholar | Villager deaths |
|---|---|---|---|---|---|
| pantrystarve-b (94301–94308) | 8 (+1 summary listed) | 90 | 0 | 50 | 40 |
| fullpantry-diag-b (94401–94416) | 16 (+1) | 145 | 0 | 80 | 65 |
| fullpantry-confirm-b (94421–94436) | 16 (+1) | 132 | 0 | 61 | 71 |
| awayration-size-b (94501–94508) | 8 (+1) | 79 | 0 | 57 | 22 |
| fullpantry-casecount-b (94601–94664) | 64 (+1) | 549 | 0 | 302 | 247 |
| awayration-cover-b (94701–94732) | 32 (+1) | 307 | 0 | 182 | 125 |
| POOLED | 144 (+6 summaries) | 1,302 | 0 | 732 | 570 |

Seed overlap across ingested corpora: NONE (analyzer reports
`seedOverlap: []`). Every ingested file's seed band is disjoint,
so no trajectory is double-counted in the pool.

### Pooled cause table (villager deaths only, n = 570, raw labels)

Full machine-readable table (counts + shares + per-corpus breakdown):
evidence/2026-10-25/sim-causebase-b-baseline.json (committed with
this arm; produced by scripts/analyze-causebase-b.js, re-run
byte-identical — see proof).

| Cause | Deaths | Share |
|---|---|---|
| monster | 219 | 38.4% |
| sickness | 83 | 14.6% |
| ambush | 63 | 11.1% |
| a wound that wouldn't close | 56 | 9.8% |
| starvation | 49 | 8.6% |
| combat | 12 | 2.1% |
| alien | 11 | 1.9% |
| choir toad | 7 | 1.2% |
| contest | 6 | 1.1% |
| dehydration | 6 | 1.1% |
| the phoenix link | 6 | 1.1% |
| the union rep | 4 | 0.7% |
| gavel | 3 | 0.5% |
| the static kite | 3 | 0.5% |
| 8 labels at 2 deaths each (bad belly, bulldozer, drum-belly, experiment, night court, spool, the mountain lord, the paparazzo) | 16 | 2.8% |
| 26 labels at 1 death each (all monster names or one-off causes; full list in the JSON) | 26 | 4.6% |

48 labels total. The top 5 causes cover 470/570 (82.5%) of
villager deaths. The long tail is real: 34 of 48 labels (71%)
appear at most twice, and 26 appear exactly once — nearly all of
them monster names. That tail is what the guardrail threshold
below is calibrated against.

Per-corpus shape (top causes per corpus, villager deaths): monster
leads everywhere (12, 25, 24, 7, 106, 45 across the six corpora in
table order above); starvation is 10/40 in pantrystarve (the
starvation-diagnosis run — see the compare demo) vs 4/22 in
awayration-size and 30/247 in casecount. The pooled share, not any
single corpus's share, is the baseline.

### Kind-filter VERIFICATION (not taken on faith — recomputed)

Worked example from real corpus data (deathcensus baseline side,
seed 73671, deathcensus.deaths list):
- EXCLUDED (monster): day 7, kind monster, who ducks_in_a_row,
  cause "villager combat" — a monster killed by villagers, not a
  villager death. The old unfiltered reading counted this as
  village blood.
- EXCLUDED (scholar): day 9, kind villager, who gen_euaedv8,
  cause "the arena", player true — a scholar succession death,
  not a villager death.
- INCLUDED (villager): day 89, kind villager, who ursula_weber,
  cause "monster", player false — a villager killed by a monster.
- INCLUDED (person): day 21, kind person, who gen_6lh1fqj,
  cause "ambush", player false — person-kind is sapient dead too
  (corpses.js corpseIsPerson), counted as a villager death.

Independent recomputation of the deathcensus band from the
BASELINE side only (the armed side is the same trajectories by
G2 neutrality, so it is never pooled): 261 rows = 192 monster +
42 scholar + 27 villager — EXACTLY the published armed-side
decomposition. The kind-filter correction is confirmed, not
assumed. The baseline-side villager causes (monster 11, ambush 3,
sickness 3, starvation 3, wound 2, alien 1, contest 1, combat 1,
The Suburb 1, Nevermore 1) match the published census exactly.
Note the deathcensus band is NOT part of the pooled competent
baseline (different substrate); it is verification only.

Analyzer guard demonstrated on real data: running the analyzer
on the whole perseed-deathcensus-a dir FAILS (exit 2) with
"duplicate seed 73671" — baseline and armed files share seeds,
and the analyzer refuses to double-count a trajectory rather
than silently pooling both sides. Verification therefore used a
read-only recomputation of the baseline side (above), plus the
proof test's synthetic census-format leg.

### Guardrail guidance for future arms (the deliverable's rule)

Use scripts/analyze-causebase-b.js --baseline
evidence/2026-10-25/sim-causebase-b-baseline.json <arm-corpus-dir>
on the arm's own kind-filtered corpora (same population rule).
It emits new-label flags and share comparisons mechanically.

1. NEW DEATH MODE (flag for investigation, never an auto-fail):
   a cause label ABSENT from the pooled baseline raw list that
   appears at least N = 3 times among the arm's kind-filtered
   villager deaths. Justification from the pooled counts (not a
   magic number): 34 of the 48 baseline labels appear at most
   twice, and 26 appear exactly once — a new label at 1–2 deaths
   is indistinguishable from routine rare-monster churn (a new
   monster name showing up once is the normal case, not an
   event). 3 is the smallest count that clears the entire
   observed rare-churn band (max 2) while still catching a real
   new mode early. 1–2 appearances of an absent label are
   NOTED as churn, never flagged as a mode.
2. SHARE SHIFT (flag for investigation): a label PRESENT in the
   pooled list whose arm count is >= 3 AND whose arm share is at
   least 2x its pooled share. A present label can never be
   "new" — only its share can move, and small arms are noisy, so
   both legs (count and ratio) must fire.
3. NEVER use a small band's zero as absence. The 0630Z failure
   is the cautionary tale: an 8-seed band with zero starvation
   deaths made starvation look "new" when it appeared. Starvation
   sits in the pooled baseline at 49/570 (8.6%) — no future arm
   can flag starvation as new on this evidence, whatever its own
   small band shows. If an arm's own band shows zero of a pooled
   cause, that is sampling noise until the pooled comparison
   says otherwise.
4. Truncated labels: 4 pooled labels sit at exactly 32
   characters cut mid-word (recorder truncation). Treat a new
   long monster-name label as approximate — check whether it is
   a truncation collision before calling it a new mode.

Compare-mode demo (proves the rule works, not a verdict): the
pantrystarve corpus against the pooled baseline yields ZERO new
labels (it is in the baseline, as it should be) and ONE
share-shift flag — starvation, 10/40 (25.0%) vs pooled 8.6%
(2.9x). That flag is CORRECT behavior, not an alarm: pantrystarve
is the starvation-diagnosis run, so its starvation share is
expected to run hot. A flag means "look", never "fail".

### What was built

- scripts/analyze-causebase-b.js — pool mode (corpus dirs in,
  pooled table + per-corpus breakdown + denominators + seed
  overlap + skipped-file list out) and compare mode (--baseline,
  --new-threshold). Refuses loudly (exit 2) on: unparseable
  JSON, per-seed file without per-death rows, row missing kind /
  scholar flag / cause, duplicate seed within a dir. Summary
  files are listed as skipped by name, never silently dropped.
- scripts/test-causebase-b.js — proof, all legs green (below).
- evidence/2026-10-25/sim-causebase-b-baseline.json — the pooled
  baseline table (committed; the file future arms pass as
  --baseline).
- This evidence file.

No src/js changed. No new sims run. No sibling axis, tree,
branch, claim, or file touched. Deathcensus/raftdraft files were
read only.

### SENSE-TESTING (one transcript read, judged as story)

Spot-check from the pooled corpora (casecount seed 94605, day 5):
Owen dies of starvation with 25,750 kcal and 5.3 fresh days in
the pantry, awayAtDeath true, while his day's lines show the
village eating ("Village meal: +1200 kcal") and the STARVING
warning firing. Read as a story this is NOT a data error — it is
the documented away-ration shape in miniature: a full pantry the
traveler cannot reach, a village eating at home, a traveler
spiraling away. The death reads as the mechanism the
fullpantry arms already proved, and the pooled starvation count
(49) is the honest size of that shape across 144 runs. No new
sense finding; the transcript corroborates the table.

### PROOF

scripts/test-causebase-b.js — ALL LEGS PASS:
- leg1 sweep-format kind filter: exact table (rows 10, excluded
  by kind 3, excluded scholar 1, villager 6; causes starvation 2,
  monster 1, ambush 2, sickness 1).
- leg1b census-format kind filter: exact table (rows 4, excluded
  by kind 1, excluded scholar 1, villager 2).
- leg2 monster/scholar-only negative control: zero villager
  deaths, empty cause table, no crash, no mislabel.
- leg3 raw-label preservation: 'monster' vs 'choir toad' and
  'combat' vs 'villager combat' stay distinct with exact counts
  (no hidden normalization).
- leg4 determinism: synthetic corpus twice identical; real
  corpus (awayration-size-b) stdout byte-identical across runs.
- leg5 refusals: unparseable JSON, per-seed file without rows,
  row missing kind, row missing scholar flag, duplicate seed —
  all exit non-zero naming the problem; summary file listed as
  skipped, not dropped.
Pooled analyzer re-run on all 6 real corpora: byte-identical
JSON (diff clean). Node --check clean on both new scripts.
check.js --quick NOT re-run: zero src/js changed in this arm, and
the arm's suite is test-causebase-b.js (green); the coordinator
re-runs suites at merge per standing protocol. No green-list
claim is made beyond the arm's own proof.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- The pooled baseline REPAIRS the 0630Z guardrail-design note:
  "new death mode" can now only mean absent-from-pooled (n=570),
  never absent-from-an-8-seed-band. 0630Z's own verdict (NO-GO at
  pilot on its pre-registered PRIMARY pack/need bar) is NOT
  re-scored here — only its guardrail note is superseded, by
  construction, for future arms.
- Death-tele totals are NOT villager deaths (deathcensus
  correction, independently recomputed here on the baseline side:
  261 = 192 + 42 + 27). The sweep corpora add a second, subtler
  version of the same trap: their death rows are villager-only
  but scholar-majority (732/1,302 scholar). An unfiltered sweep
  "death cause" table is mostly scholar successions. Both
  filters (kind AND scholar flag) are required; either alone
  misstates the population.
- FALLEN is not a death census (deathcensus: 64 fallen vs 261
  harness deaths). This baseline's denominator is harness death
  rows, kind-filtered — stated explicitly so no future arm
  substitutes fallen counts.
- Balanced panel (§15): no panel compare is attached, deliberately.
  There is no lever in this run and no panel pair to compare —
  the pooled table IS the comparison instrument future arms will
  use (via --compare mode). Attaching a panel compare over
  per-seed corpora would repeat the known panel-input error class
  (panel requires panel.json.gz pairs, not sweep corpora).
- No new sims were needed: the kind field is carried by the
  corpora themselves, so the brief's conditional ("if you find
  you MUST run a sim...") did not trigger. No determinism check
  sim was run; determinism is proven by byte-identical analyzer
  re-runs instead.
- Normalization decision recorded (see pre-registration): raw
  labels only, because the duplicate pair lives in the aggregated
  dict, not in rows, and monster-name collapsing would need an
  unreliable roster. A future arm that wants a grouped monster
  view must pre-register its roster rule; it must not silently
  re-group this baseline.
- Per-corpus heterogeneity is disclosed, not smoothed away:
  pantrystarve's starvation share (25.0%) vs pooled (8.6%) is a
  real corpus-level difference (a diagnosis run's composition),
  and the share-shift flag exists precisely to surface it. The
  pooled share is the baseline; no single corpus's share
  replaces it.
- No metric was re-scored mid-run. The guardrail threshold N=3
  was set AFTER counting, as the pre-registration explicitly
  allowed ("justified from the pooled counts"), and it is a
  flag-for-investigation threshold, not a verdict bar — it cannot
  retroactively change any prior arm's verdict.

## VERDICT: DIAG-GO

- (a) PASS: all 6 corpora ingested, denominators stated per
  corpus and pooled (570 villager deaths from 1,302 rows).
- (b) PASS: proof test all legs green (see above).
- (c) PASS: kind-filter worked example shown from real corpus
  data (monster excluded, scholar excluded, villager + person
  included), and the deathcensus decomposition independently
  recomputed exactly (261 = 192 + 42 + 27).
- (d) PASS: pooled analyzer re-run byte-identical.

The pooled baseline future arms need now exists, with its
analyzer, its guardrail rule, and its proof. The 0630Z "new
starvation cause" false flag cannot recur on this evidence:
starvation is in the baseline at 49 deaths.

## VILLAGE ASSESSMENT (plain words)

Across 144 competent-policy villages, the village loses about
four villagers per run to all causes — and more than a third of
those deaths are a villager meeting a monster and losing
(219 of 570). Sickness takes about one in seven, betrayal
ambushes about one in nine, wounds that never close about one
in ten, and starvation about one in twelve — the starvation
number is the one that matters for this axis, because it is now
measured on 570 deaths instead of an 8-seed band that happened
to contain none. The scholar, the player character, dies far
more often than any villager (732 scholar deaths in the same
corpora) — but those are successions, the mantle passing on,
not village blood, and every table that mixed them in was
overstating the village's losses by more than double. The
village's real death shape is: monsters first, then sickness,
betrayal, wounds, and hunger — in that order, on numbers no
single small run could have shown.

Convergence state: food-economy stays converging (this arm is
measurement infrastructure, not a lever — no game-code fix
landed here, and the away-hunger voice blank from 0630Z stays
open). The next food-economy arm that needs a death guardrail
uses this baseline instead of inventing one from its own band.

