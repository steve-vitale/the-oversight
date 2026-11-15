# Loop B run fleshout-loop-b-20261115T1055Z (winnability chain) — coordinator evidence

Run `fleshout-loop-b-20261115T1055Z`, axis winnability chain. Loop A live on
scale-onramp throughout (0810Z transplant arms, then 1116Z adoption run) —
NOT touched. No stale-lock recovery: no Loop B lock existed at run start.
The re-point queue was fully disposed before this run (arm-2 toggle CLOSED
2026-11-06; flee-repair LANDED by Loop A; standing accumulation answered
2026-11-09) — NOT re-taken. No new food-economy arm (parked). Arms taken
from the 0930Z next blanks: (3) cascade gorge-pricing follow-up, (6)
only-lead-shape second band. Blanks (1) answercourt cost call and (2)
competent seat-taking BUILD are Steve / main-session; (4) veterans
survivorship is a design question; (5) phone-frame receipt refresh needs
real browser work; (7) family 2b is Loop A's list.

Seed bands verified fresh across ALL preregs by the coordinator before
assignment: 100301–100316 clean; 100401–100411 + 100413–100416 clean;
100412 USED (preserverleg2-a / sitstep2-b / answermail-a) — avoided,
arm 2 confirm uses 100421–100436, verified clean.

## Arm 1 — sim-gorgeprice-b: PILOT NO-GO (kill class METRIC-BROKEN, lever NOT landed)

Re-judgment of the killed cascade lever (linger holds the treeline,
branch `sim-cascade-b`) under the FRESH prereg prescribed by the 0930Z
run: starvation per 100 lived-days vs control rate + pooled cap tripwire,
gorge priced in pantry-kcal per siege. Fresh band 100301–100308, fresh
control on the current tip, 150d, competent-answercourt-b. Lever base
recovered from `sim-cascade-b` commit 942e15ca5 (game.js diff = 1 hunk
only). This is a NEW judgment under the revised bar, not a re-score —
the 0930Z NO-GO under the old pooled-count bar stands.

- P1 0.1338 → 0.0699 (0.52x, PASS); gap-0 12 → 6; same-instance
  repeat-killer pairs 15 → 0; survival 140d → 150d; survived 3/8 → 6/8.
- Cost bar fails on the rate leg ALONE: the fresh control starved
  NOBODY (rate 0.0), so 1.25× a zero control rate is zero, and the armed
  leg's 2 starvation deaths (rate 0.177/100 lived-days) fail a bar that
  allows exactly none. Pooled tripwire passed at its boundary
  (2 ≤ 0+2); survival passed (1.07x).
- Kill class is METRIC-BROKEN, not concept-dead: the bar form
  degenerates to zero-tolerance on a zero-starvation control band. The
  lever returns to the queue with a CORRECTED prereg (a rate floor),
  never a re-score.
- The gorge, priced (voiced lines — a lower bound): gorge nights
  309 → 468 (+51%), kcal 338,321 → 518,450 (+53%), ~1,100 kcal/night
  on both legs — the price is volume, not price-per-night. 7
  empty-pantry circle nights armed vs 0 control. The 2 starvations
  (both seed 100304): d95 gorge-adjacent (triple siege, ~5,300 kcal in
  2 nights) and d131 exposure (pantry slid to 0 over 20 days, no gorge
  nearby). Sieges stack — 5 lingerers gorged one night on 100305.
  Per-siege metric fragments to ~1.1 nights; the next run should price
  per 100 lived-days only.
- §15 panel: review_required, no material signals.

Wall (pilot band, 16 configs): control P1 0.1338, held 68.5d, survival
140d, starvation 0, national 8/8, wave-5 4/8, wins 0, table 0. Armed P1
0.0699, held 79d, survival 150d, starvation 2, national 8/8, wave-5 3/8,
wins 0, table 0.

Disposition: lever NOT merged. Evidence-only record landed on master
(prereg + evidence + panel + corpora, commits a29b88e21, b2d89f747,
61c287ba8; 0 src/js). The lever, analyzer, panel builder and proof test
stay on branch `sim-gorgeprice-b` (kept for the next arm with a
corrected prereg); worktree released done-abandoned. Proof
`test-gorgeprice-b.js` 4/4 GREEN on the branch; `test-cascade-b.js`
4/4 GREEN pre-commit; analyzer reproduces all published cascade
16-seed numbers and gorge counts (645 → 1172) exactly on the old
corpora. Evidence: evidence/2026-11-15/sim-gorgeprice-b.md (+ prereg).

## Arm 2 — sim-onlylead-b: DIAG GO / POLICY-CANDIDATE; Stage 2 build killed SUBSTRATE-MISSING

DIAG why only the lead/feast national-beat shape stages in live play
(findings #2358). Fresh band 100401–100408, 150d,
competent-answercourt-b armed vs competent-scaleclimb-b baseline.
G1 GO — 0 UNCLASSIFIED across all 40 shape-seed cells per leg,
0 instrument errors, 0 unattributed diplomacy points. G2
DIAG-POLICY-CANDIDATE. Baseline names identical blockers on every seed.

| Shape | Result | Named blocker |
|---|---|---|
| Lead | staged 5/8, all sat (first-national days 62–92) | 2× lead-subs-short:2, 1× lead-rung-gate (100407: polity stood 19d, village died ON the rung day) |
| Conquest | 0/8 | conquest-no-raids 8/8 — 0 conquered subs ever; policy never raids |
| Belong | 0/8 qualified — split | 5× belong-no-sub-link; 2× arrears (20,000 / 5,000 kcal, both trust 100, and both primaries' foreign realms too small); 1× belong-trust-short:40. No single blocker reaches the ≥6/8 bar |
| Covenant | 0/8 | covenant-no-peer-links 8/8 — 0 peer links, 0 proposeCovenant calls by policy OR engine |
| Trade | 0/8 | trade-no-peer-links 8/8 — same |

Key proof: the verb-callers table is empty band-wide — the engine never
initiates diplomacy either. Foreign polities reach 4–5 villages on 6/8
seeds, so the belong precondition isn't the blocker; Haven is never a
subordinate in good standing.

Stage 2: a covenant-road policy was built and proven (proof test 33/33),
but the 60d smoke showed 0 contact: the engine's opinion-10 prerequisite
for peer proposals is only reached at ~day 150 from a cold start (probe:
max known opinion 2→4→6→8→10 over 150d on both seeds). The first
covenant beat is structurally past day 175 — beyond the 150d horizon.
Kill: SUBSTRATE-MISSING (§14a). Per §14b the pilot was NOT spent;
confirm band 100421–100436 stays fresh. Policy + test committed as
proven instruments for a future arm (an opinion-building lever, or a
200d+ horizon). Answercourt itself was not re-judged. The finding stays
`[open]` — the four non-lead answers are still proven by fake-Game unit
tests only.

Wall (pilot band, 16 configs): national ever 5/8 armed vs 0/8 baseline;
table/wins 0/8 both; wave 4 8/8 vs 7/8; wave 5 4/8 vs 2/8; median
survival 117.5d vs 92.5d; survived horizon 1/8 vs 0/8; wave kills
229/137/59/34/8 vs 234/131/56/20/3; starvation 1 vs 2.

Disposition: DIAG evidence + instrument + policy (killed at smoke,
committed as instrument) LANDED ff-only on master (5 commits,
6eb1a2a1c–a6295465d; 0 src/js). Proofs re-run green after every rebase
and on merged master: test-onlylead-b 29/29, test-covenant-b 33/33.
Findings backlog line 2358 updated with the DIAG result; 4 new lines
added (opinion gate, belong analyzer names only first failing gate,
mangled trader rumor line on 100405 d49, rung-gate near-miss).
Evidence: evidence/2026-11-15/sim-onlylead-b.md (+ prereg).

## Telemetry deviation check (coordinator, both arms)

Ran `telemetry-check.js` with `--allow-recorder-corpus` on each arm's
control and armed legs (the tool refuses recorder-corpus input without
the flag, and takes a single `*` in the basename only — directory globs
fail). All four legs print the SAME 3 LOUD lines (national 12→0,
table 16→0, wins 16→0): the recorder-corpus per-seed files carry no
top-level national/table/wins paths, so the WINSEAT baseline's fields
read as disappeared on control and armed alike. Regime / field-shape
artifacts — baseline NOT rolled, no investigation item. (The gorgeprice
worker reported the same identical-on-both-legs result independently.)

## Infrastructure

Master moved three times under the run (batch ship bump 874d97c00,
journey-scale r207, Loop A 1116Z landings f76fa0d92). Two ff-only merges
were correctly refused (exit 128, no damage) when master moved under
the landing; both branches rebased clean onto the fresh tip each time
(onlylead twice, record branch twice), proofs re-ran green after every
rebase and on merged master. No rebase stop-at-pick quirk. Safe-commit
index clobber struck worker commits (gorgeprice 3×, onlylead 2×) —
repaired via the documented ls-tree pipe each time, commits verified.
No write-flap incident reported by either worker. Reap skipped at run
start (registry lock held by another reaper run). check.js --quick NOT
re-run (zero src/js on either landed branch; loop precedent). Trivia:
the onlylead merge carries a 0-byte `onlylead-b-pilot.err` log file —
harmless, left as-is. A git gc warning (unreachable loose objects,
`.git/gc.log`) appeared during landing; left alone, not this run's to
fix.

## Wall (this run's judged corpora, 32 configs)

National ever 13/16 armed vs 8/16 control; table 0/32; wins 0/32;
wave-5 7/16; wave-4 15/16; median survival 133.75d. The scale wall
stands: no wins, no table on either arm's band.

winnability chain stays converging (NOT converged): the cascade lever
works but its price is still unjudged under a sound bar (the corrected
prereg is owed), and the non-lead shapes are diagnosed but still
unstaged in live play. scale-onramp stays converging (untouched;
sibling Loop A). food-economy stays converging (untouched; parked).
Next blanks, in order: (1) answercourt cost call (Steve / main
session); (2) competent seat-taking BUILD (Steve-call); (3) cascade
gorge-pricing with a CORRECTED prereg (rate floor; fresh band, never a
re-score); (4) only-lead Stage 2 follow-up — an opinion-building lever
or a 200d+ horizon (confirm band 100421–100436 stays fresh); (5)
veterans survivorship (design question); (6) phone-frame receipt
refresh; (7) family 2b AMBIGUOUS (Loop A suspect list); (8) gap-3+
map-decline CLOSED. Claim deleted; lock deleted. Evidence:
evidence/2026-11-15/sim-winnability-round-1055.md.
