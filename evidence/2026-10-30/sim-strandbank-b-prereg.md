# sim-strandbank-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1730Z
(coordinator task; worker spawned 17:42 CDT), arm sim-strandbank-b,
axis food-economy (strand-bank re-derivation). Worktree
sim-strandbank-b. DIAG ONLY: measurement, zero src/js changes,
zero policy-default flips, zero policy files created or edited,
no behavior probe built, run, or judged. Sibling trees (Loop A:
sim-w4field-a, sim-w4party-a, sim-linkgen-a; journey trees;
gapscomp trees) are never touched. The main tree is never touched.

## The question (backlog #1554, sim-findings.md 2026-10-30)

Loop-B arm sim-wakeforage-b (run fleshout-loop-b-20261030T1730Z,
evidence/2026-10-30/sim-wakeforage-b.md, DIAG-GO) reported drift:
15009's strand, present on the walktree base, is gone on later
bases, while the 15215 strand reproduced byte-identically in
story. The backlog item is a drift watch, not a lever: for
strand-built banks, re-derive strand membership per base, never
quote an old bank's strand set as current. This arm does exactly
that one job on the current base: re-derive the strand bank
(guard + ON legs, verbatim woodday env) and localize any drift
vs the wakeforage fresh baselines, per seed.

## Canon (read before judging)

- docs/CANON.md read first, then docs/PRESERVATION.md (food
  ladder: cleaned→cooked→smoked→rendered→pemmican; a stranded
  villager's food problem is a ladder problem before it is a
  bridge problem) and docs/TIME-ECONOMY.md (day parts; metabolic
  burn ~2200 kcal/day; forage 16 ticks + 60 kcal effort).
  No canon doc defines strand membership; the strand definition
  below is the woodday definition, reused verbatim, not invented
  here.
- docs/MEASUREMENT.md §§9–12, 14–15 read. Staging: this arm's
  corpus is 10 seeds × 2 legs (the full bank, not a pilot
  subset), because the question IS the bank — a pilot subset
  cannot answer "which seeds strand." The pilot gate (§9) is
  satisfied by instrument validation, not by a smaller seed
  count: the woodday driver and the wakeforage recorder are
  already-proven instruments (woodday 20/20, wakeforage 40/40
  on their own runs), and bar (b) below is the equivalence
  check on the full legs. Death-aware horizon (§10): 30
  loop-days, reused from woodday/walktree/wakeforage — the
  strand cycle closes inside it (guard strand days 7–9, ON
  strand days 7–16 on every base so far, both < 30); longer
  horizons add no strand information on this bank. The driver
  records daysAlive/endReason per seed and stops at death;
  any leg death is reported per seed, never averaged away.

## Definitions (the judged quantities)

- STRAND: maximal run of still-refused creek evenings on
  CONSECUTIVE loop-days (bucket creek, rescued false), the
  woodday analyzer's definition (scripts/analyze-woodday-b.js).
  Strand membership is reported per seed, per leg: which seeds
  strand, which loop-days, evening woods, post-evening woods.
- CREEK / STILL / RESCUED: per-leg totals over the 10-seed
  bank, counted by the analyzer from the driver corpora
  (bucket creek; rescued true vs false). Guard leg: WOODWARM=0
  (warmth off); ON leg: WOODWARM=1 (warmth on).
- RECORDER EQUIVALENCE: the wakeforage recorder legs must
  reproduce the woodday driver legs exactly on per-seed
  creek / still / rescued counts (same bar wakeforage met
  against its own fresh baselines). The recorder is the
  instrument that future strand arms will quote; equivalence
  is what licenses it on this base.
- DRIFT: per-seed difference between this run's fresh
  counts and the wakeforage fresh baselines (guard 12/3/9,
  ON 18/10/8; only 15215 strands, days 7–16 ON, 7–9 guard).
  Drift is LOCALIZED per seed (which seeds moved, which
  counts changed), never reported as a single net delta
  alone.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time
  (359a384cc, full hash recorded in the evidence file's
  proof section at evidence time). The prereg commit adds
  ONLY this file, so the legs run on pinned-base game code
  verbatim. NOTHING is quoted from wakeforage, woodday, or
  walktree censuses as current-base behavior: guard AND ON
  trajectories are RE-DERIVED on the pinned base from fresh
  legs below and judged against those fresh numbers.
  Divergence from wakeforage values is DRIFT to report and
  localize per seed, never a failure to hide.
- Tracked diff guard: at evidence time, `git diff` of src/
  and scripts/policies/ between pinned base and final tree
  must be EMPTY. The only new files are measurement scripts
  (proof) and evidence/ files; no driver is edited, no policy
  file is created, edited, or wired.

## Implementation (measurement first, no behavior)

- MASTER DRIVER (verbatim, OUTDIR override only):
  scripts/woodday-trace-b.js, run WITHOUT WOODDAY (probe
  off; WOODDAY unset or 0) for the fresh baselines. Env
  asserted FATAL on every leg: COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0|1 DAYS=30.
  Bank (10 seeds, screen order): 15003, 15009, 15091, 15211,
  15215, 15220, 15221, 15337, 15376, 15439.
  Output: evidence/2026-10-30/sim-strandbank-b-corpus-base-guard
  and -base-on.
- RECORDER DRIVER (existing instrument, OUTDIR override
  only): scripts/wakeforage-trace-b.js, guard + ON on all
  10 bank seeds, into evidence/2026-10-30/
  sim-strandbank-b-corpus-guard and -corpus-on. No driver
  code is changed in this arm; the recorder's read-only
  sweep additions are already proven behavior-neutral on
  their own run, and bar (b) re-proves it here.
- ANALYZER (existing instrument, pure reads):
  scripts/analyze-woodday-b.js run on each corpus, writing
  sim-strandbank-b-census-{base-guard,base-on,guard,on}.json.
- DETERMINISM re-run: the full ON recorder leg re-run
  into evidence/2026-10-30/sim-strandbank-b-corpus-
  determinism; every file must be byte-identical to the
  judged ON recorder corpus. (Stronger than the one-seed
  re-runs of prior arms; seeds are nearly free.)
- PROOF: scripts/test-strandbank-b.js (new, this arm):
  census totals on all four legs; recorder equivalence
  MATCH per seed on both legs; guard warmth acted 0;
  recorder errs 0; strand sets derived from the analyzer
  censuses (not hand-typed); drift table vs the wakeforage
  fresh baselines computed per seed; determinism
  byte-identical on the full ON leg; tracked diff guard
  (src/ + scripts/policies/ empty vs pinned base).
- §15 BALANCED PANEL — APPLICABILITY DECLARED HERE: no
  panel compare .md is produced. This is a DIAG instrument
  run with zero src/js changes and zero policy changes, so
  there is no game-root before/after delta for a panel to
  compare (same standing as the walktree and wakeforage
  preregs). The drift table vs wakeforage baselines is a
  census comparison across base pins, not a panel
  comparison of two game roots under one collector, and is
  reported as such — never labeled a panel compare.

## Legs (all on pinned base, 30 loop-days, bank order)

- BASELINE legs (BEFORE any recorder leg is judged):
  woodday driver guard (WOODWARM=0) + ON (WOODWARM=1) on
  all 10 bank seeds.
- RECORDER legs (judged measurement): wakeforage driver
  guard + ON on all 10 bank seeds. Judged against the
  EQUIVALENCE BAR below.
- DETERMINISM leg: wakeforage ON re-run, full bank, into
  the determinism corpus (byte-compare, never judged as
  a second measurement).

## Bars (judged exactly as written; a miss is NO-GO, never re-scored)

- DIAG-GO iff ALL hold on the fresh legs:
  (a) driver runs clean on all 10 seeds × 2 legs, 0
  instrument errors (recorder errs == 0; every seed
  writes an evening row for every loop-day; all 10 seeds
  present in every corpus);
  (b) recorder equivalence — per-seed creek / still /
  rescued counts match the driver legs exactly, on both
  legs; every mismatch named if any (a mismatch fails
  the bar, it is not averaged away);
  (c) strand set reported per seed with strand days, on
  both legs, derived from the analyzer censuses;
  (d) drift vs wakeforage fresh baselines localized per
  seed (which seeds moved, which counts changed, on each
  leg);
  (e) determinism re-run byte-identical on at least one
  leg (here: the full ON recorder leg);
  (f) proof suite green (scripts/test-strandbank-b.js).
  Otherwise DIAG-NO-GO, with the exact blocker named.
- BANK-COMPOSITION CLAUSE (written before any judged leg,
  so this is definition, not re-scoring): whatever the
  fresh bank strands IS the bank. If 15009 strands again,
  it is reported with its days; if it does not, that is
  reported as continued loss, not as a missing
  measurement. If a new seed strands, it is IN SCOPE and
  its days are reported. What would fail (c) is an
  unreported strand, never a seed that does not strand.
- SECONDARY (reported, NO bar): per-seed daysAlive /
  endReason; wave reach as recorded in the corpora (if the
  driver records no wave field, that is stated, not
  inferred); wall numbers (national / table / wins) as
  NOT OBSERVABLE on this 30-day pre-seat band, reported
  honestly, never as zeros.
- SENSE-TEST: one strand story read end to end on the
  fresh ON corpus (full day say lines + wood-short line +
  morning snap, judged for meaning and coherence, not
  just counts), reported as one paragraph in the evidence
  file.
- NO behavior probe is built, run, or judged in this arm.
  NO press, cut, or forage verb is called by any driver
  in this arm (the replay press lives in
  wakeforage-replay-b.js, which this arm does not run).

## Forbidden (violations void the run)

- Any src/js or scripts/policies/ change; any policy file
  created, edited, or wired; any driver edit (OUTDIR
  override only); quoting wakeforage/woodday/walktree
  censuses as current-base behavior without the fresh
  re-derivation above; touching sibling trees, claims, or
  branches; touching the main tree; writing outputs to
  /tmp (worktree evidence/ only).

## Metric review (for THIS run's evidence file, and the NEXT run)

- Doubts to answer in the evidence file: whether the
  creek/still/rescued census is still the right strand
  instrument when a behavior arm (pressb) has since
  changed strand lengths on its variant leg (this arm
  runs no variant leg, so the census definition is
  unaffected — but the next behavior prereg must keep
  the comparable vs variant-only split from backlog
  #1559); whether a 30-day window still contains the
  full strand cycle on this base (checked: strand days
  must fall inside it, else the horizon is revisited for
  the NEXT run, not stretched mid-run); whether
  per-seed localization adds anything over net deltas
  (it is the whole point of #1554 — a net −3 can hide
  five seeds moving in opposite directions).
- If the verdict is DIAG-GO, the next step is for strand
  arms to quote THIS run's strand set as current, until
  the next base move re-derives it again. If DIAG-NO-GO,
  the next run must name the blocker and fix the
  instrument, not re-ask the question on the same legs.
