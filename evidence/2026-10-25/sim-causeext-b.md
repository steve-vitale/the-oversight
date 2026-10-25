# sim-causeext-b — POOLED CAUSE LIST FOR THE TABLESEAT-NOWAIT SUBSTRATE: BLOCKED (axis food-economy, MEASUREMENT ONLY)

Run: fleshout-loop-b-20261025T1630Z (Sun 2026-10-25, loop B, second axis).
Worker tree: ~/workspace/worktrees/sim-causeext-b. Axis: food-economy.
MEASUREMENT ONLY: ZERO src/js game changes. NO new sims run. NO pooled list
built, NO analyzer built, NO N calibrated — because the primary corpus
cannot support any of them (see below). This file is the blocked finding
itself, so the coordinator can decide the unblock path. Nothing in this
file invents, estimates, or reverse-engineers a count.

Canon read first: docs/CANON.md, then docs/PRESERVATION.md (the food ladder).
No canon doc covers death-cause taxonomy — the causes here would have been
the engine's recorded labels, not canon, and no label is invented, renamed,
or merged in this arm. The competent pooled baseline
(evidence/2026-10-25/sim-causebase-b.md) and its audit
(evidence/2026-10-25/sim-causebase-audit-b.md) were read first, as was the
substrate evidence (evidence/2026-10-24/sim-tableseat-nowait-a.md and
evidence/2026-10-24/sim-tableseat-round-1955.md).

## PRE-REGISTRATION (as assigned — judged below, no re-scoring)

- Arm: pooled kind-filtered villager death-cause list for the
  tableseat-nowait substrate (the 1530Z food-economy next blank #1), with
  its OWN N calibration, NOT a reuse of the competent list's N=3.
- Kind filter, reused EXACTLY from scripts/analyze-causebase-b.js:
  villager death = per-death row with kind in {villager, person} AND
  scholar flag false (isPlayer false / player false). Scholar rows are
  successions; monster/animal-kind rows are monster kills, not village
  blood.
- Primary source corpus: evidence/2026-10-24/perseed-tableseat-nowait-a/
  (16 per-seed files + summary.json).
- GO gates (as assigned): G1 byte-identical reproduction from the same
  perseed dir; G2 N calibrated from THIS substrate's own count
  distribution and tail; G3 full scope line cited in the JSON and the
  evidence file; G4 scholar-only / other-substrate labels checked before
  any label is called new; G5 guardrail usability demonstrated on a worked
  example from the corpus.

## BLOCKED FINDING: the primary corpus has no per-death rows at all

Verified file by file (16/16 per-seed files + summary.json):

- ZERO occurrences of the string `"kind"` in any of the 17 files.
- ZERO occurrences of `deathRows` or `deathcensus` in any of the 17 files.
- Top-level keys of every per-seed file (identical set): policy, seed,
  days, gameDays, endReason, won, waveReach, maxArc, finalRank, maxRank,
  nationalEver, nationalFinal, table, entered, deaths, deathTotal,
  starvationDeaths, starvationDetail, ts, ctxExtra, finalPop, finalPantry,
  finalKnown. No per-death list key exists.

What the corpus DOES carry, and why it cannot substitute:

1. `deaths` — an AGGREGATED dict keyed `player:cause` / `villager:cause`
   (e.g. seed 73602 baseline: "villager:villager combat": 14,
   "villager:combat": 26, "player:the arena": 5, "villager:monster": 2).
   Per scripts/test-tableseat-nowait-sweep.js `deathSummary()`, this dict
   is built at write time from `result.samples.deaths` as
   `(d.player ? 'player:' : 'villager:') + cause`, and the underlying
   per-death rows are then DISCARDED — only the summary and the
   starvation subset survive in the file. The prefix records the dead
   person's scholar flag (player vs non-player). It does NOT record
   kind: a monster-kind death (a monster killed, if the samples include
   any) would fall under the `villager:` prefix exactly like a villager
   death, and person-kind vs villager-kind is unrecoverable. The
   kind-filter's first leg (kind in {villager, person}) therefore
   cannot be applied to this dict, by construction.
2. `starvationDetail` — per-death rows, but ONLY for starvation deaths,
   and carrying only day / who / cause / player (e.g. seed 73602
   baseline: day 34, gen_vmzh6wz, starvation, player false). No kind
   field, and no other cause is represented. It cannot yield a cause
   distribution.
3. `deathTotal` — a bare count (755 aggregated deaths across the 16
   per-seed files: armed + baseline sides pooled would also mix two
   policies, since the baseline side is leanlinkrescue-only and the
   armed side adds the seat legs).

Exactly what is missing, field by field (the brief's STOP condition):

- A per-death row list (deathRows / deathcensus.deaths or equivalent)
  for every per-seed file.
- On each such row: a `kind` field (villager / person / monster /
  animal) and a scholar flag (isPlayer / player), plus a `cause`.
- Without kind, the villager population cannot be separated from
  monster kills — the exact error class the competent baseline was
  built to remove (deathcensus: 192 of 261 rows are monster-kind).
  Assuming the `villager:` prefix means "villager death" would repeat
  that error, not fix it. The analyzer scripts/analyze-causebase-b.js
  would refuse these files outright (per-seed file without per-death
  rows = fatal exit 2), so there is no compliant mechanical path from
  this corpus to a pooled list.

Per the brief's explicit instruction, work STOPPED here: no counts
were derived from the aggregated dict, no N was calibrated from it,
and no pooled JSON was written. Any "pooled list" built from this
corpus would be an invented kind-filter, not a measured one.

## WHAT EXISTS ON THE SAME SUBSTRATE (context for the coordinator, NOT a substitute)

One filterable corpus exists on the tableseat-nowait substrate, on a
different seed band — reported here so the coordinator can judge the
unblock path, NOT pooled into this arm (substituting it silently would
change the assigned corpus, band, and scale without authorization):

- evidence/2026-10-25/perseed-deathcensus-a/ — baseline side ONLY:
  tableseat-nowait (leanlinkrescue courtship LEANLINKRESCUE=1 + seat
  legs TABLESEATNOWAIT=1, no wait leg), seeds 73671–73678, 180d
  death-aware horizon. The armed side is the same 8 trajectories by
  the deathcensus G2 neutrality proof, so pooling both sides would
  double-count; only the baseline side may ever be counted.
- Recomputed here (read-only, from the baseline-side files):
  261 rows = 192 monster-kind + 42 scholar + 27 villager deaths —
  exactly the published deathcensus decomposition, confirming the
  filter mechanics on this substrate.
- Baseline-side villager causes (n = 27): monster 11, ambush 3,
  sickness 3, starvation 3, a wound that wouldn't close 2, contest 1,
  combat 1, alien 1, Nevermore 1, The Suburb 1.
- Baseline-side scholar causes (n = 42): the arena 38, dehydration 1,
  contest 1, the expedition 1, the night 1.
- Why this does NOT unblock the arm on its own: 27 villager deaths
  from a single 8-seed band is ~1/20th the competent pool's scale
  (570 deaths / 144 runs) and far below the audit's own scale bar
  (>= 300 deaths across >= 100 runs). An N calibrated from a
  27-death pool with a 10-label tail would be noise, not a
  calibration — and the audit already showed that on a new substrate
  the competent N=3 swallows genuine labels as churn (Nevermore /
  The Suburb at n = 1 on this very band). A credible tableseat-nowait
  pooled list needs filterable corpora across MULTIPLE seed bands on
  this substrate, which do not currently exist.

Other nearby corpora checked and NOT usable as substitutes:

- evidence/2026-10-24/perseed-tableseat-a/ (seat + wait): different
  substrate (wait leg present), and likewise aggregated-only rows
  (deaths / deathByCause dicts, no per-death rows).
- Journey / narrative corpora: not tableseat-nowait sweep corpora.

## SCOPE FACTS (recorded, but NOT citable in a JSON that does not exist)

The intended scope line, from sim-tableseat-nowait-a.md (the facts are
established; the artifact they would have been cited in was not
buildable):

- Policy: leanlinkrescue courtship (LEANLINKRESCUE=1) + tableseat-nowait
  seat legs only (TABLESEATNOWAIT=1: tsDriveSeat + tsAnswerTableChoices
  + rank-national+ gating); wait leg OMITTED entirely.
- Baseline side of the corpus: leanlinkrescue-only (no seat legs).
  Armed side: leanlinkrescue + seat legs. A pooled list would have had
  to state which side(s) it pools; the brief's substrate is the armed
  (seat-legs-on) side.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Seed band: 73601–73608 (pilot, 8 seeds).
- Kind-filter definition: kind in {villager, person} AND scholar flag
  false; labels raw, unnormalized (per analyze-causebase-b.js).

## GO / NO-GO PER GATE (judged against the pre-registration, no re-scoring)

- G1 (byte-identical reproduction): NO-GO — blocked. There is no pooled
  list to reproduce, and the analyzer refuses the primary corpus
  (no per-death rows). Nothing was built to re-run.
- G2 (own-N calibration from this substrate's distribution + tail):
  NO-GO — blocked. No distribution exists for this substrate's
  kind-filtered villager deaths; the only filterable same-substrate
  count (deathcensus baseline side, n = 27, single band) cannot
  support a credible N. N=3 from the competent list was NOT reused,
  per the brief — and no other N is claimed here.
- G3 (full scope line cited in the JSON and the evidence file):
  NO-GO — blocked as a deliverable. The scope facts are recorded above
  in this evidence file, but no JSON exists to cite them in, so the
  gate as written cannot pass.
- G4 (scholar-only / other-substrate labels checked before any label
  is called new): NO-GO on the target corpus — no labels are called
  new here because no list was built, and no check can run on a
  corpus with no per-death rows. Adjacent context only (NOT the G4
  check): on the deathcensus baseline side of the same substrate,
  scholar deaths are dominated by 'the arena' (38/42), with
  dehydration / contest / the expedition / the night at 1 each —
  the same 'the arena' trap class the competent audit flagged
  (613 scholar deaths, zero villager deaths there). A future
  tableseat-nowait list must re-derive its own scholar-only set;
  the competent set must not be imported.
- G5 (guardrail usability demonstrated on a worked example):
  NO-GO — blocked. There is no list to demonstrate with, and the
  aggregated dict cannot supply a worked kind-filtered example
  (no kind field). The deathcensus baseline-side numbers above
  (Nevermore / The Suburb at n = 1, swallowed as churn under N=3)
  are the audit's already-published demonstration of why a
  borrowed N fails on this substrate — they are context, not a
  G5 pass for this arm.

OVERALL VERDICT: BLOCKED — no pooled list, no N, no guardrail artifact.
The arm's question (a tableseat-nowait pooled cause list with its own
N) remains open, and it cannot be closed from existing corpora without
a scope decision by the coordinator.

## SENSE-TESTING (honest limitation)

No sense verdict is possible on the target corpus: it records no death
contexts at all — only aggregated cause counts and starvation
day/who/cause/player rows with no narrative. There is no transcript,
no villager dialogue, and no death context to judge for meaning,
coherence, or consequences in perseed-tableseat-nowait-a/. Claiming a
sense read from the aggregated dict would be counting, not reading.
(The deathcensus corpus on the same substrate DOES carry per-death
contexts, but a sense read there belongs to a deathcensus-scope arm,
not to this blocked corpus — it is not claimed here.)

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- No metric was re-scored: the pre-registered gates are reported as
  NO-GO because their inputs do not exist, not because a threshold
  was missed or a friendlier metric was substituted.
- The competent baseline's DIAG-GO and the causebase audit's
  PARTIALLY SATISFIES verdict both stand untouched — this arm changes
  no landed number and reuses no landed N.
- Lesson for the NEXT run, not this one: sweep instruments that
  aggregate deaths at write time destroy the kind-filterable record.
  Any future tableseat-substrate sweep that wants a pooled cause
  list must record per-death rows (kind + scholar flag + cause) in
  the corpus file itself — the deathcensus recorder is the working
  pattern — or the next scope-extension arm will hit this exact
  block again. Recorder shape should be pre-registered before the
  sweep, not discovered after it.

## UNBLOCK PATH (for the coordinator, not taken here)

1. Run tableseat-nowait sweeps with a death-row recorder (deathcensus
   pattern: kind + player + cause per death row) across MULTIPLE new
   seed bands on the armed (seat-legs-on) substrate, 180d horizon —
   or extend the deathcensus corpus to further bands. Single-band
   (n ≈ 27) pooling is not a credible substitute for the competent
   pool's scale.
2. Only then build the pooled list with the kind filter applied
   exactly, calibrate N from that pool's own distribution and tail,
   cite the full scope line in the JSON, run the G4 scholar-only /
   other-substrate check, and demonstrate G5 on a worked example.
3. Do NOT unblock by aggregating the existing `deaths` dict, by
   treating the `villager:` prefix as a kind filter, or by importing
   the competent list's N=3 — each repeats an error class this
   baseline program was built to remove.

## PROOF

- Corpus inventory: all 17 files in
  evidence/2026-10-24/perseed-tableseat-nowait-a/ inspected by key
  listing and string search (0 `"kind"`, 0 `deathRows`/`deathcensus`);
  aggregated death total 755 across 16 per-seed files (armed +
  baseline sides; sides NOT pooled anywhere in this file).
- Instrument read: scripts/test-tableseat-nowait-sweep.js
  `deathSummary()` (player-prefix aggregation, rows discarded at
  write time) — the mechanism by which the kind field was lost.
- Deathcensus recomputation (read-only, baseline side only):
  261 = 192 + 42 + 27, matching the published decomposition exactly;
  villager and scholar cause tables above recomputed from the files,
  not quoted from prose.
- No scripts created (an analyzer for a nonexistent corpus would be
  vacuous, and the brief says STOP). No src/js changed. No sibling
  axis, tree, branch, claim, or file touched. No sims run. No push,
  no version bump — report is "blocked, pending coordinator decision"
  (the coordinator merges this evidence file).

## VILLAGE ASSESSMENT (plain words)

There is no village assessment to give from this corpus, and that is
the finding. The tableseat-nowait villages' wins are measured
elsewhere (3 seats taken, 3 wins on seeds 73601–73608), but how their
villagers died — which deaths were village blood, which were the
player character passing the mantle on, which were monsters the
village killed — was never written down in a form anyone can separate.
The sweep wrote down only tallies with a player-or-not tag, and threw
the individual death records away as it went. Until a sweep on this
substrate writes the deaths down properly, the village's death story
on the road to the table is unmeasurable — not zero, not small, just
unwritten. The ledger needs the recorder before it needs the analyst.
