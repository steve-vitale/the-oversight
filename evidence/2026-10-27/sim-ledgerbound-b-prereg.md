# sim-ledgerbound-b — PRE-REGISTRATION (written BEFORE any judged sweep, 2026-10-27)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T0630Z, axis
food-economy. Arm: boundary-aware ledger re-judge (the 0530Z run's next
blank #1). Measurement only: zero src/js changes, no default flips, no
game-code lever. This arm does NOT re-judge the stockdoors NO-GO — its
verdict is ONLY whether the family ledgers close under the boundary
definition below. Judged ONLY against this prereg. The stockdoors NO-GO
verdict stands in its own evidence; this run reports pilot legs under
the new boundary, it does not re-score stockdoors.

## Question (verbatim from the assignment)

Read before writing this prereg: evidence/2026-10-26/sim-stockdoors-b-prereg.md
(legs 3/4/5: per-family-seed pass = within 1%; named pass rate >=80%;
generic >=80% plus pooled within 1%; dried pooled within 2%) and
evidence/2026-10-27/sim-residualhunt-b-prereg.md + sim-residualhunt-b.md
(the boundary model: closing snapshot is taken before day-100 meal draws
settle; day-101 sweeps are post-horizon flows counted in the ledger but
never reflected in closing; the reproducing base is the PRE-c04d4e0cb
game.js, blob b2ba423afdfbdce8c98751ef544f10805b46cfa6, seed-9820
counts 255/1249/4/163, trajectories fork day 43).

## Boundary definition chosen (ONE definition, stated exactly)

CHOSEN: closing snapshot taken after the final day's flows settle
(end of day 100, after meal draws), with day-101 sweeps treated as
post-horizon and excluded from the judged ledger.

Precise implementation (analyzer closing-step adaptation ONLY; the
sweep instrument is unchanged):

- The corpus closing snapshot (spoilDays day 100) is taken after the
  day-100 daytime flows (inflows, spoil sweeps, transforms, direct
  daytime draws) but before the day-100 night meal (villagerMealDay).
- Boundary closing for a family = corpus closing
  + day-100 stockSurplus pushes (Foraged food only; stockSurplus is
  a villagerMealDay output, so it moves with the meal)
  - day-100 meal draws (pantryDraw + drawSpoiled records dated day 100).
  Direct draws dated day 100 are daytime flows, already reflected in
  the snapshot, so they are NOT adjusted. No direct day-100 record
  exists on the pilot band; if any appears on the confirm band it
  will be listed in the evidence file, not silently adjusted.
- Boundary dried closing = corpus dried closing
  - day-100 dried meal draws (stockdoor never produces dried names,
  so there is no stockdoor term in the dried closing).
- Boundary flows = NEW-definition flows (stockdoors prereg: 3-door
  inflow + stockSurplus inflow; pantryDraw + drawSpoiled + direct
  draws; spoil sweeps; driedpath transform loss) dated <= 100.
  Flows dated > 100 (day-101 sweeps on this band; no other day>100
  flow class exists in the residualhunt corpus) are post-horizon:
  excluded from boundary flows and from boundary closing.
- Boundary residual for a family-seed = (boundary closing - opening)
  - (boundary inflow - boundary draws - boundary sweep
  - boundary transform loss). Boundary dried residual is defined
  analogously on dried names, with boundary transformed post-kcal
  (dated <= 100) as its denominator base.
- Rationale: the night meal is the only flow class that settles
  after the snapshot, and its two outputs (meal draws out, surplus
  pushes in) must move together. Subtracting draws alone breaks the
  generic family, whose day-100 surplus pushes are large; adding
  them back is not a tuning choice, it is the same call's other side.
  The alternative definition (ledger restricted to flows dated <=
  the closing snapshot's day, with the corpus closing left as-is)
  was NOT chosen: it leaves the day-100 meal draws counted but
  unreflected, so it cannot flip the 9824 pair, and it is therefore
  not a boundary fix for the leg-3 failures.

## GO thresholds (copied verbatim from the assignment; do not soften)

PILOT GO iff named pass rate >=11/12 (the two 9824 day-100-draw flips)
AND generic >=7/8 AND dried pooled <=2%. Lamb's Quarters 9825's -120
net is reported per the 1% tolerance (pass => 12/12, fail => 11/12
still GO) — never hidden, never re-barred.

Clarification (not a softening): the "-120 net" figure is Lamb's
Quarters 9825's OLD dried-channel residual on the residualhunt
corpus (analyzer driedResidNEW = -120; total old residual +1,130 =
base +1,250 plus dried -120). The judged Lamb's Quarters figure in
this run is its TOTAL boundary residual, judged per the same 1%
tolerance as every other named family-seed, and both the total and
the dried component will be reported. The 1% bar is unchanged; if
the total fails it, the count is 11/12, which is still GO under the
verbatim threshold above. No metric is re-barred to reach 12/12.

Full judged legs (stockdoors leg structure, boundary definition):

- Leg 1 (det-gate, DIAG): a paired run of one pilot seed with
  STOCKDOORS=0 vs STOCKDOORS=1 produces identical inflow records,
  mealdraw records, spoilvol records, driedpath records, death
  lists, and wall fields (stockdoors fields and `ms` excluded).
  Any mismatch is DIAG-NO-GO (instrument, not game).
- Leg 2 (coverage, DIAG): stockSurplus records with kcal > 0 on
  >= 7/8 pilot seeds; transformation events on >= 7/8 pilot seeds
  with linked transformed post-kcal >= 95% of total transformed
  post-kcal pooled; per-path direct census reported for every
  wrapped path, none claimed unwrapped. Any failure is DIAG-NO-GO.
- Leg 3 (named, boundary): per-family-seed pass rate over NAMED
  focal family-seeds >= 80% within 1% AND pooled |named boundary
  residual| within 1% of pooled named focal family inflow
  (boundary definition). The pilot GO count bar (>=11/12) is
  stricter than the 80% rate bar and governs the pilot verdict
  alongside the pooled bar.
- Leg 4 (generic, boundary, judged SEPARATELY, never folded into
  leg 3): per-family-seed pass rate over GENERIC focal
  family-seeds >= 80% within 1% AND pooled |generic boundary
  residual| within 1% of pooled generic focal family inflow
  (boundary definition). The pilot GO count bar is >=7/8.
- Leg 5 (dried, boundary): pooled |dried-channel boundary
  residual| across all focal family-seeds within 2% of pooled
  transformed post-kcal (boundary definition, dated <= 100).
- Old-boundary legs (NEW definition from stockdoors/residualhunt,
  unchanged) are computed on the same corpus and reported
  alongside as the control: old-boundary vs boundary-aware legs
  on identical seeds. A miss on leg 1 or 2 is DIAG-NO-GO. A miss
  on leg 3, 4, or 5 is NO-GO — never re-scored against a friendlier
  metric mid-run (no dropping the generic family, no switching to
  base-only residuals, no single-seed rescue, no ignoring unlinked
  events, no reverting to the OLD draw definition). Metric doubts
  go under "metric review" and propose the revision for the NEXT
  run.

Pilot NO-GO => NO confirm spend: document, kill, stop.

## Band (substrate identical to residualhunt)

- Policy: competent-nofeast. Env asserted FATAL in the runner:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 unset or 0.
- Pilot seeds: 9820–9827 REUSED as substrate (the residualhunt
  pilot band — stated, no freshness claim). Horizon: 100d,
  death-aware (run ends early if the village is lost; daysAlive
  reported per seed). Never a fixed 200d.
- Base pinned: the reproducing base is the PRE-c04d4e0cb game.js
  (blob b2ba423afdfbdce8c98751ef544f10805b46cfa6). The judged
  sweep runs on that pinned base: back up game.js OUTSIDE the repo
  first, swap in the pinned blob, run sweep + proof, restore,
  verify `git diff HEAD -- src/js/game.js` is empty, and NEVER
  commit the pin. The current worktree game.js blob at prereg
  time is bfa3631982cb2233fdc40ff54c4269bd2649c1fd (the restored
  post-residualhunt blob). Any base move between prereg and sweep
  is reported, never hidden.
- Corpus: evidence/2026-10-27/sim-ledgerbound-b-corpus/ (pilot 8
  files, ledgerbound-b- prefix). NEVER overwrites the residualhunt,
  stockdoors, or driedpath corpora.

## Confirm band (ONLY if the pilot verdict is GO)

- Seeds: 9850–9861 (12 seeds), chosen BEFORE the judged sweep and
  verified UNUSED first:
  - Corpus-filename search across evidence/ : no
    *-s9850.json … *-s9861.json files exist (bands 9900–9911,
    9700–9711, and 9930–9941 were rejected as contaminated;
    9950–9961 and 10000–10011 were also clean, 9850–9861 chosen).
  - Evidence-md mention search in evidence/2026-10-26/*.md and
    evidence/2026-10-27/*.md for seeds 9850–9861 and 9900–9911:
    no mentions.
  - Explicitly NOT used: seeds 9768–9779 (spent-but-unjudged
    stockdoors post-commit scratch — contaminated for this purpose).
  - Limitation, stated honestly: the filename search covers corpus
    JSON filenames (where seeds live as identifiers), not every
    standalone number inside JSON payloads (a kcal value is not a
    seed use). The collision check above is the meaningful one;
    it will be re-recorded in the evidence header before sweeping.
- Confirm corpus: evidence/2026-10-27/sim-ledgerbound-b-confirm-corpus/
  (12 files, separate dir so pilot legs are never mixed with
  confirm legs). Identical instrument, base, policy, and horizon.
- Confirm GO uses the same legs: named >=80% + pooled within 1%,
  generic >=80% + pooled within 1%, dried pooled within 2%
  (boundary definition). The confirm NEVER overrides the pilot
  verdict; it is reported alongside as CONFIRM-GO / CONFIRM-NO-GO /
  CONFIRM-DIAG.
- If the pilot is NO-GO or DIAG-NO-GO, no confirm band is spent.

## Instrument (DIAG only, new files only)

Vendored read-only from sim-residualhunt-b under ledgerbound names;
the residualhunt branch/worktree files are untouched, and no file
under a stockdoors- or residualhunt- name is modified here:

- scripts/stockdoors-capture-ledgerbound.js (residualhunt capture,
  filename/arm-name header change only — body otherwise identical).
- scripts/sweep-ledgerbound-b.js (residualhunt sweep; adaptations
  ONLY: output dir/file prefix, mode string, staging dir, capture
  require — sweep logic otherwise identical, including the EPERM
  retry/flush transport).
- scripts/analyze-ledgerbound-b.js (residualhunt analyzer;
  adaptations ONLY: default corpus dir, header, and the closing
  step as defined above — OLD and NEW leg math otherwise identical).
- scripts/test-ledgerbound-b.js (residualhunt proof; adaptations:
  corpus dir + LEDGERBOUND_CORPUS_DIR override for the confirm
  dir, sweep name, analyzer require, allowed-modified set,
  pinned-base allowance in BOTH hygiene checks, independent
  boundary recomputation, and corpus reproduction vs the
  residualhunt corpus on matched seeds).
- scripts/trace-ledgerbound-b.js (residualhunt trace, header only;
  takes a corpus dir as an argument).
- Reused UNCHANGED from this worktree (the residualhunt worktree
  copies, git-clean at prereg time, zero modifications in this
  arm): scripts/inflow-capture.js, scripts/mealdraw-capture.js,
  scripts/spoilvol-capture.js, scripts/driedpath-capture.js,
  scripts/stockdoor-capture.js. Zero src/js files touched, zero
  sibling capture files modified.

## Proof (must be GREEN on the pinned base before evidence commits)

scripts/test-ledgerbound-b.js proves: det-gate (leg 1),
corpus validity (8 pilot / 12 confirm files, policy, stockdoorsOn,
no truncation, all 7 direct methods wrapped), corpus reproduction
vs residualhunt (byte-identical excluding `ms` on matched seeds),
independent old + boundary leg recomputation matching the analyzer,
instrument integrity (stockdoor spoilDay = vDay + 3, event-take
retMismatch 0, no unknown direct paths, no pantryDraw/drawSpoiled
overlap), and hygiene (zero src/js modified apart from the pinned
game.js allowance in BOTH hygiene checks — the residualhunt
proof-fix lesson: one check alone is not enough; zero sibling
capture files modified; no modified tracked file outside this
run's own files). The proof is GREEN on a correctly-derived NO-GO
as well as on a GO — failures that make it red are instrument or
hygiene failures, not a NO-GO verdict. No jest unless a change
needs it; never concurrent jest; if jest runs, use
--cacheDirectory=/tmp/jest-cache-sim-ledgerbound-b.

## Reported, not judged

- Old-boundary vs boundary-aware legs on identical seeds (the
  control comparison above).
- Reachability on the pilot band (waves 1–5, Arc II/III/IV,
  regional → national, table, win) and on the confirm band if spent;
  reported ONLY if the corpus carries them, otherwise "not recorded
  in this corpus, not estimated".
- Village assessment in plain words, a sense-transcript sample
  (one sampled day's villager dialogue/behavior judged for meaning,
  coherence, relevance — SENSE-TESTING LAW, never just counts),
  wall numbers (national/table/wins, wave 4–5 unlocks, median
  survival), and a convergence line (converging | converged |
  parked | killed-at-pilot).
- Balanced panel (MEASUREMENT.md §15): no game-code change exists,
  so there is no before/after panel — stated in the evidence file,
  with the det-gate as the instrument before/after.
- The stockdoors NO-GO verdict itself: NOT re-judged here.

## Canon read

docs/CANON.md + docs/PRESERVATION.md + docs/MEASUREMENT.md sections
9–12 and 14–15, plus the stockdoors prereg/evidence and the
residualhunt prereg/evidence, all read before writing this prereg.
The food ladder (cleaned→cooked→smoked→rendered→pemmican) and the
"no nonsensical calorie loss" rule are the canon background for the
dried channel; this arm changes no canon.
