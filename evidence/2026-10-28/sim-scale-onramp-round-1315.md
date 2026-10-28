# sim-scale-onramp round 1315Z (coordinator landing run, axis scale-onramp)

Run: fleshout-20261028T1315Z, loop oversight-flesh-out-loop. No live claim
at run start; sibling loop B had no live claim either. This run worked the
topmost axis, scale-onramp (converging, NOT converged), by landing the
two arms held since the 1115Z/1215Z rounds. No new game experiment was
designed and no new sweep was judged here; the judged corpora are the
workers' own, re-verified on rebased checkouts.

## Pre-registration (landing bar, binding)

- Primary metric: landing proof green on the rebased checkout.
- GO threshold: partyfinish proof 12/12 + analyzer GO + one fresh armed
  seed reproducing its stored headline on the rebased checkout; teleingest
  proof 21/21 + telemetry-check proof 12/12 + recorder-guard proof 8/8 +
  check.js --only telemetry green; telemetry deviation check run and
  interpreted (baseline rolled only on an unexplained LOUD — none).
- Horizon/seeds/policies: judged bands are the workers' (partyfinish:
  seeds 75101–75108, 180d death-aware, tableseat-nowait + partyfinish
  policy; teleingest: tooling only, zero src/js).
- Result: GO on both arms. Both landed, merged locally, pending ship.
  No push, no version bump, no live verification (ship-loop line).

## Arm 1 — sim-partyfinish-a LANDED (37aa0a4fb on master)

- Mechanism (game code, [needs-eyes] combat change): cornered-party hold
  — a party sortie that corners a monster at the field-flee break line
  holds it for the finishing blow instead of letting it slip away; kill
  narration now says "with their party" with a cornered clause, where
  solo kills still read "alone".
- Files: src/js/fieldFights.js (+37/-5), src/js/havenGrowth.js (1 line),
  policies/partyfinish*.js, test-partyfinish*.js, evidence + per-seed
  corpus (control + armed, 8 seeds each).
- Landing path: arm committed in its own tree (41a32a034) after
  re-verifying proof 12/12 + analyzer GO on the stored corpus; safe-commit
  index clobber hit (staged deletions, worktree byte-identical to HEAD)
  and was repaired via cacheinfo before rebasing; clean rebase onto
  master b898dff4a (zero overlap in the two game files across 28
  commits); proof + analyzer re-run identical on the rebased checkout;
  fresh single-seed armed reproduction (seed 75101, rebased checkout):
  162d, wave 4, lesser win, pf counters identical to the stored row
  (pfHeldNoLinger 154, pfSortieCalls 1, pfSortieCleared 3); stored row
  restored byte-identical (md5 verified) and a stray sweep side-file
  removed; tree released, branch deleted.
- Sense check: party kill lines read as real narration ("Thao killed
  the Ugly Beast with their party — 1 round, 0 taken. ... Cornered at
  the treeline, it could not slip away before a blow."), not as a
  counter dump. The mechanism's own sense finding (the "alone" lie)
  was already fixed by the worker's post-sweep summary change, covered
  by the 12/12 proof.

## Arm 2 — sim-teleingest-a LANDED (via sim-teleingest-land)

- Tooling only, zero src/js: telemetry-check --sweep-rows ingest —
  per-seed sweep-row corpora count seeds, not files (summary/analysis
  files skipped and reported); bare wall names alias to row fields
  (national -> nationalEver, wins -> won); wall line prints the full
  wall picture from the same rows.
- Landing path: fresh registered tree sim-teleingest-land at master;
  cherry-picked the arm's prereg + implementation + evidence. Conflict
  in scripts/telemetry-check.js exactly as the 1215Z analysis predicted
  (sibling 9ea8fbbd4's recorder-corpus guard + underscore preservation):
  composed, not picked-a-side — guard now runs on the filtered seed
  rows, master's underscore-preserving update-baseline kept, both flags
  (--allow-recorder-corpus and --sweep-rows) live together. One
  composition slip (stray closing brace) was caught by node --check
  BEFORE any proof ran and fixed in its own commit (17d9ec559, rebased
  as 403e87503); safe-commit index clobber hit that fix commit too
  (index held the pre-fix version, worktree already equal to HEAD) and
  was repaired via cacheinfo. Clean rebase onto the partyfinish master.
- Proofs on the rebased checkout: test-teleingest.js 21/21,
  test-telemetry-check.js 12/12, recorder-guard proof 8/8,
  check.js --only telemetry 3 passed.
- This commit also lands the long-pending 1115Z coordinator evidence
  (evidence/2026-10-28/sim-scale-onramp-round-1115.md), as the 1215Z
  run directed. The orphan branch sim-teleingest-adopt-a (zero unique
  commits, at a55b293ca) and the dead sim-teleingest-a branch are
  deleted after this merge; their content is on master in rebased form.

## Telemetry deviation check (this run, --sweep-rows)

- Partyfinish armed corpus vs WINSEAT scale-wall baseline: wall line
  reproduces the worker wall exactly (nationalEver 8/8, nationalFinal
  6/8, table 7/8, entered 5/8, won 5/8; 1 non-row file skipped).
  1 LOUD: wins swung -69% (baseline 16 -> current 5, n=8 seed rows).
  Verdict: EXPLAINED, not a regression — the baseline is 16 winseat
  seeds at 16/16 wins; the band is 8 seeds whose wins are lesser-only
  (full seat 0), so both seed-count halving and the lesser-only
  ceiling push wins down. National (12 -> 8) and table (16 -> 7) did
  NOT fire (swings under the 60% bar). Baseline NOT rolled.
- Tbovertime corpus vs the same baseline: wall 7/8 / 6/8 / 4/8 / 3/8 /
  3/8 (8 seeds, 2 non-row files skipped). 2 LOUD: table 16 -> 4,
  wins 16 -> 3. Verdict: REGIME artifacts — a pre-seat substrate
  against a winseat baseline, which the baseline's own note forbids
  comparing. Baseline NOT rolled.

## Village assessment (plain words)

With the party-finishing mechanism in, villages in the judged band
reliably reach national standing (8 of 8 ever, 6 of 8 at the end) and
take a seat at the table (7 of 8 reach it, 5 of 8 sit down) — but every
seat taken is the lesser seat. Nobody takes the full seat, and no
wave-5 monster is ever met. In other words the road to the table is
now paved and walked, but the top of it is still empty: villages win
small, survive about 140 days in the middle of the band, and die or
stall before the endgame's hardest step. The mechanism landed here
closes the "crippled beast slips away" gap; it does not close the
full-seat gap.

## Blanks filled / documented

- FILLED (game): party finishing — crippled beasts cornered by a party
  sortie are now finished and honestly narrated.
- FILLED (tooling): telemetry-check can now ingest per-seed sweep-row
  corpora without counting summary files as seeds, so coordinator wall
  numbers reproduce from the corpus in one command.
- DOCUMENTED (not filled): the full seat stays at 0 and wave 5 at 0
  across every judged band. Next scale-onramp work should target
  full-seat conversion (kills converting into living veterans, the
  veterans bar) — under the standing gating freeze, as measurement
  first, not as a gating change.

## Metric review

- The telemetry wins LOUD on an 8-seed lesser-only band vs a 16-seed
  winseat baseline is a size-and-regime artifact, not a failed metric:
  the deviation rules fire on counts, and counts halve when the band
  halves. No revision proposed for the next run; the next run should
  keep reporting bands separately and never pool them, and should
  compare wins only within the same regime (winseat vs winseat,
  pre-seat vs pre-seat).
- Partyfinish's pre-registered GO bar (counted finishes + cost bar on
  median/starvation) was met without touching the full-seat question,
  which is a separate axis item — the GO verdict is for the mechanism,
  not for the scale wall. scale-onramp stays converging, NOT converged,
  until a judged band shows a full seat or a wave-5 meeting.

## Convergence state

scale-onramp: converging. food-economy: converging (untouched this run).
No axis is converged. Claim + lock deleted at closeout.
