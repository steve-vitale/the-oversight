# sim-packtail-confirm-b — CONFIRM band for the tail pack top-up (coordinator-run)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261025T0730Z, axis
food-economy. Coordinator-run confirm of worker arm sim-packtail-b
(evidence/2026-10-25/sim-packtail-b.md, commit a9f3aa7d5, pilot GO on
8 seeds 94901–94908). This file is a SEPARATE run with its own
pre-registration: the pilot evidence carries VERDICT-RENDERED: GO and its
runner refuses re-runs, so the confirm uses its own instrument copies
(-packtail-confirm-b suffix), its own corpus dir, and this file. No pilot
verdict is re-scored here; the pilot verdict stands regardless of the
confirm outcome. The confirm judges whether the lever survives a fresh
16-seed band — and, specifically, whether the pilot's unexplained arena
excess reproduces.

## The lever (unchanged from the pilot; no new game code in this run)
`src/js/game.js` packMeal only (+43/−1 at a9f3aa7d5): when the dawn pack
falls short of the day's shortfall (dawnKcal < dayWant), draw the
shortfall (want − dawnKcal) as REAL pantry items via pantryDraw (never
conjured) and add it to the pack, once per pack-day. packKcal's formula
is untouched, so theft, intimidation, and packSpend callers keep the
old formula. Non-binding days draw nothing; empty pantry pays nothing.

## PRE-REGISTRATION (bound per MEASUREMENT.md §14 — written BEFORE any confirm sim; a miss is NO-GO, never re-scored)
- Substrate: competent policy only, unmodified; env PLENTYDEPRI=1,
  DEPOSITGATE=1 (= shipped defaults, as in the pilot). Baseline runs on
  pristine game.js (master blob ecadca554003e517ecda2e82980f77c887cbfd18,
  identical at 6e7dbe528 and 52ac2eb62 — zero src/js diff between those
  tips, verified before sims); armed runs on the lever blob
  b0ce6955e90fbc385c52c295e7ae306a4a8df140 (a9f3aa7d5). The lever diff
  is therefore identical to the pilot's, and the confirm transfers
  exactly to current master.
- Horizon: 150d death-aware (dead villages stop; no fixed-200d run).
- Seeds: CONFIRM BAND 94909–94924 (16 seeds), baseline vs armed on
  IDENTICAL seeds. Freshness: band verified absent as exact "seed"
  fields in all per-seed corpora, as per-seed filenames, and as
  word-boundary mentions in dated .md files (worker-method check,
  run before sims; on any hit the band shifts and the reason is
  recorded here before sims — no silent shift after sims).
- PRIMARY: median binding-day coverage (drawn/dayWant) on
  pool-binding days only (dawn pack < dayWant, draw days only),
  armed median >= 0.90 AND armed binding n >= 30. Same bar as pilot.
- Guardrails (same as pilot): pack-draw-day capture == 1.000 both
  arms; median survival >= 0.8x control; full-pantry away starvation
  deaths <= control+2; no armed-only death cause with >= 3 deaths.
  Death-cause comparison ALSO runs through the causebase analyzer
  (scripts/analyze-causebase-b.js, baseline
  evidence/2026-10-25/sim-causebase-b-baseline.json) when corpus
  shape allows: a new label at >= 3 deaths, or a present label at
  >= 3 deaths and >= 2x its pooled share, is an investigation flag
  (flag means "look," not auto-fail — same semantics as causebase).
  If the packtail corpus shape cannot feed the causebase analyzer,
  that is recorded as inapplicable, never forced.
- ARENA LANDING GATE (pre-registered for THIS confirm only; it gates
  landing, not the primary verdict): the pilot showed arena deaths
  22 baseline -> 49 armed (2.2x, +27) with two armed village losses
  vs zero baseline losses, reported as an unexplained finding, NOT
  a guardrail (none was pre-registered on total/arena deaths). For
  the confirm: if armed arena deaths are >= 1.5x baseline arena
  deaths AND the absolute excess is >= 10 deaths, the lever is HELD
  (stays on its branch, NOT merged, reported as held-for-
  investigation) even if the primary verdict is GO. If the gate
  does not trip, the lever merges on the primary + guardrails.
  This gate is set BEFORE confirm sims; it does not retroactively
  change the pilot verdict.
- Wall metrics (national/table/wins/wave reach) reported, not judged.
- Balanced panel (§15): attempted with the correctly-shaped compare
  call; the known TypeError reading 'days' on sweep corpora (fourth
  sighting incl. cover-b) is a tool finding, never a verdict input;
  the sweep-compare table is the before/after comparison.
- Metric review section below (filled after judging; verdicts are
  never re-scored under a revision).

## Method
Two-phase runner scripts/run-awayration-packtail-confirm-b.sh
(baseline | armed), copied from the pilot runner with BAND, corpus
dir, evidence path, per-seed filename prefix, and analyzer BANNED
list changed (BANNED adds the pilot band 94901–94908). Baseline
phase: game.js temporarily replaced with the pristine master blob,
sweep runs, lever blob restored and hash-verified before the armed
phase (worktree clean except confirm files throughout; any
interruption leaves the branch tip intact — recovery is
`git checkout HEAD -- src/js/game.js`... note: HEAD at confirm
time is the pilot commit, whose game.js IS the lever blob, so that
restore is exact). Sweep outputs under
evidence/2026-10-25/sim-packtail-confirm-b-corpus/ (NEVER /tmp).
Analyzer: scripts/analyze-awayration-packtail-confirm-b.js.

## Results (adoption judgment, 2026-10-25, loop B run fleshout-loop-b-20261025T1329Z)
Judged, not re-run: both cells were complete before this judgment. Corpus
verified 32/32: 16 per-seed JSONs per cell, seeds exactly 94909–94924 in
both cells, sweep-competent.json present in both, zero 0-byte files.
Analyzer re-run fresh (scripts/analyze-awayration-packtail-confirm-b.js)
matches evidence/2026-10-25/sim-packtail-confirm-b-analyzer-output.txt
byte-for-byte. Verifier scripts/test-packtail-confirm-b-verdict.js: ALL
CHECKS PASS (corpus + analyzer-match + every verdict leg + arena gate).
Worktree game.js blob verified b0ce6955e90fbc385c52c295e7ae306a4a8df140
= the pre-registered lever blob; no game code was touched by this judgment.
The causebase cross-check named in the pre-registration could not run in
this tree: scripts/analyze-causebase-b.js and
evidence/2026-10-25/sim-causebase-b-baseline.json are absent here, so it
is recorded inapplicable, never forced; the analyzer's own armed-only
cause check covers the equivalent guardrail (blockers: none).

PRIMARY (binding-day coverage, drawn/dayWant, pool-binding days only):
baseline median 0.772 (n=191) -> armed median 1.000 (n=282). Bar: >= 0.90
AND n >= 30. BOTH LEGS PASS. Mean 0.747 -> 0.993; share at full coverage
0.000 -> 0.989.
Guardrails, all pass: pack-draw-day capture 1.000 both arms (bar == 1.000);
median survival 150d -> 150d, ratio 1.000 (bar >= 0.8); full-pantry away
starvation deaths 4 -> 0 (bar <= 6); armed-only death causes >= 3 deaths:
none (largest: alien=2; others 1 each).
ARENA LANDING GATE: baseline arena deaths 65 -> armed 82. Ratio 1.262
(bar >= 1.5: NOT met); absolute excess +17 (bar >= 10: met). The gate
requires BOTH legs, so it does NOT trip. The pilot's arena excess did not
reproduce at gate scale (pilot 22 -> 49, 2.2x/+27; confirm 65 -> 82,
1.26x/+17) — and the confirm's much higher baseline arena count shows the
pilot's low baseline made its ratio fragile. Total deaths 162 -> 181 is
reported, not judged (no guardrail was pre-registered on it).
SENSE-TESTING verdict: COHERENT. Armed starvation deaths fall 17 -> 4 and
all four die with a 0-kcal pantry — genuine scarcity, not the full-pantry
bug the lever targets (full-pantry away starvation 4 -> 0; inadequate-away
streak global max 6 -> 1). Death-adjacent narration reads human: grief
lines ("Somebody's sleeping-roll stays rolled out. Nobody puts it away.",
"Hassan went to sleep hungry. Nobody says anything."), warnings that
precede the spiral, and village meals that match the pantry state. One
reporting quirk, not a sim defect: some sense-window quote lines are
same-day filler (e.g. Franco teaching snare-tying on his starvation day)
because the picker grabs a same-day say line, not necessarily the death
line. Nothing robotic or incoherent in the deaths themselves.
Wall numbers (reported, not judged): national 0/16 -> 0/16; wins 0/16 ->
0/16; wave reach w1 16/16 both, w2 16/16 both, w3 14/16 both, w4 6/16 both,
w5 0/16 both; median survival 150d both, max 150d both. The scale wall is
unmoved by this lever, as expected — it fixes away-day hunger, not reach.

## Metric review
- No re-scoring: the verdict above is judged only against the
  pre-registration. The arena gate's AND construction worked as designed —
  a +17 excess alone did not hold a lever whose ratio fell to 1.26x.
- For the NEXT run (not this one): the pilot/confirm arena baselines
  (22 vs 65) swing so much by band that a raw-ratio gate is noisy. A
  future pre-registration could gate on pooled arena share or on
  arena deaths per village-day instead. This is a proposal only; it does
  not change this verdict.
- Binding coverage saturates at the ceiling (median 1.000, share==1.0
  0.989). The metric still discriminates for GO/NO-GO here, but a future
  lever in this family may need a finer primary (e.g. days at partial
  coverage, or pantry cost of the top-up).
- The causebase cross-check's absence from this tree is a process gap,
  not a metric gap: future confirm runners should carry the causebase
  analyzer + baseline into the worktree or the pre-registration should
  name the analyzer's own armed-only check as the operative guardrail.

## Verdict
VERDICT-RENDERED: GO — merge-ready. Primary passes on both legs, all four
guardrails pass, the arena landing gate does NOT trip, sense-testing is
coherent. The lever stays exactly as committed at a9f3aa7d5 (this
judgment's commit covers evidence + analyzer + runner + sweep + corpus +
verifier only; src/js/game.js is NOT in it). Ready for coordinator merge;
no [needs-eyes] on this judgment commit — the player-visible pack behavior
was already covered by the pilot's visibility, and this commit judges
numbers, not feel.
