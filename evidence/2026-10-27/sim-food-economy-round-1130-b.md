# Loop B round 1130Z — food-economy ledger: day-100 raid reachability + generic remainder rows

Run: fleshout-loop-b-20261027T1130Z. Axis: food-economy (converging, second
non-converged axis). Sibling loop A live at run start on scale-onramp
(1121Z claim, surgeconfirm + tbstarts, heartbeats 11:22Z) — NOT touched.
A landed mid-run (coordinator evidence 879cc47bc + journey-landing r61
e424e99df); both B branches rebased clean onto the moved master, proofs
green after every rebase, then merged. Both arms DIAG/measurement only,
zero src/js, zero game-code levers.

## Arm 1 — sim-day100raid-code-b: day-100 raid take REACHABLE

Prereg cfa7b08f0 (written before any judged run), evidence 122aa7842,
proof scripts/test-day100raid-code-b.js GREEN (all checks pass by its own
reads), recorder scripts/trace-day100raid-code-b.js.

Question (tracker blank 1 from the 0945Z round, sim-findings line 1208):
is a day-100 unanswered-raid take even reachable at the horizon edge,
before any more seeds are spent on the post-snapshot raid adjustment?
Verdict: REACHABLE. No code fix needed.

- (a) villageAgencyDaily DOES run its raid branch on day 100. Chain:
  membership.js:1139-1143 (endDay wrap runs membershipDaily) →
  hierarchy.js:3657-3660 (membershipDaily runs hierarchyDaily) →
  villageAgency.js:1352-1357 (hierarchyDaily runs villageAgencyDaily) →
  take branch villageAgency.js:200 (`day > (pr.day || 0)`,
  `_removePantryKcal(800)` at line 203). The branch has no day guard of
  its own. A day-99 demand fires on the first day-100 call, and the
  famine guard (pendingBeg / pendingRaidDefense early return) means a
  pending day-99 demand cannot be clobbered by day-100 staging.
  Dynamic proof: the recorder observed a day-100 villageAgencyDaily call
  on seed 10133 (staged the day-100 demand, branch evaluated
  100 > 100 = false).
- (b) The horizon DOES include the day-100 endDay take. runDays calls
  policy.daily (closing snapshot) then Game.sleep() (endDay) in the same
  loop iteration (sim-harness.js ~574/~581); the membershipDaily chain
  runs before `scholar.day += 1` (game.js:31486), so the take is dated
  100, post-snapshot, and counted by the analyzer
  (`r.day === lastSnapDay`, analyze-raidday100-b.js:291,307). A day-101
  take is outside the run by construction — that is why 10133's day-100
  demand hangs.
- Why 0/60: sampling, not a structural block. Screen corpus reconciles
  exactly — 53 demands, 52 takes, take == demand + 1 on every matched
  pair, single hanging demand (10133, day 100), no demand dated 99
  anywhere. A raid demand arrives a day before its take, so a day-100
  take needs a day-99 demand seed, which no screened seed had.

Instrument finding (loud, for all ledger arms): the raidday100 sweep's
death wrapper SUPPRESSES the original Game.registerDeath (never calls
it) — and the original does real stateful work (deathSeen, deed credits,
corpse creation with Math.random()). That suppression shifts the RNG
stream from the first death onward: a plain-game recorder run of seed
10133 diverges from the corpus, while a faithful sweep replication
(including the suppression) reproduces it exactly. Sweep corpora are
therefore suppressed-registerDeath trajectories, not plain-game
trajectories. Internal on/off comparisons stay valid (suppression
present in both), but future preregs must state recorder instrument
fidelity explicitly. Full detail + bisect trail in the arm evidence.

## Arm 2 — sim-genericremainder-b: PARTIAL (one row traced, one fenced)

Prereg written before any trace run, evidence a6fdc683a, proof
scripts/test-genericremainder-b.js GREEN 31/31 (independent
recomputation, not the analyzer). No new seeds spent; both rows
re-derived from the committed raidcallers corpora. Ordering honesty
(from the arm evidence): the analyzer reproduction of the already-
published raidcallers values ran before the prereg file was written;
every NEW-definition trace run and all mechanism analysis ran only
after the prereg. No GO criterion was set or changed after mechanism
analysis began. Per its own prereg, a single-row trace is PARTIAL,
not GO.

- Confirm seed 9970, generic +416: TRACED. Named mechanism: death-day
  snapshot timing. The village died day 16; the closing snapshot was
  taken mid-death-day (after the first foraging arrival, before the rest
  of the day's flows). Day-16 flows net 0 (inflows 416+643, stockdoor
  600, draws 1,659); pre-snapshot +416, post-snapshot −416, so the
  residual is +416 exactly. The snapshot's single 416 stack (spoilDay
  19) is the seq-32 inflow, and the player draw takes exactly that
  stack. The boundary definition has a day-100 adjustment but no
  death-day adjustment — this is the known snapshot-vs-draws artifact
  class in death-day form, not a new mechanism. It predicts all four
  death-day seeds: 9951 +427 (same signature, corroborated), 9953 0,
  9962 0.
- Pilot seed 9954, generic +3,700: UNEXPLAINED, with a hard bound. The
  residual sits entirely in the fresh sub-ledger (fresh +5,719 NEW /
  +3,700 boundary; dried exactly 0). Every candidate excluded with
  numbers: stockdoor give−kcal = 49; transforms exact and in-family,
  zero unlinked; sweeps violation-free; meal taken−items gaps = cooking
  bonus exactly (7,500); no duplicate draws; 'other' draws are real (all
  wants <1,500, so no feast-preview copy-draws fired — though the
  copy-draw trap is real and documented for future feast-live bands);
  zero alien-raid records; zero excluded inflows; clocks agree;
  post-horizon family net 0; all other families close (Fish +20,
  Purslane +30, Winner's −600 = exactly its day-101 inflow). Hard bound:
  post-snapshot day-100 draws total at most 5,419, so ≥300 kcal is
  unaccounted under ANY snapshot-timing model (3,700 under the boundary
  model).

## Village assessment (plain words)

This was a bookkeeping round, not a new village band, so there is no new
village to describe — and that is the honest scope. What the books say:
the village pantry ledger now balances almost everywhere it is checked.
One loose end is closed (a death-day timing quirk that looked like
missing food but was really a snapshot taken in the middle of a dying
day). One loose end stays open (about a day's worth of food on one old
seed that no checked cause explains, with a firm floor: at least 300
calories are genuinely unaccounted for, however you draw the boundary).
And the long-standing question about whether a raid could ever land on
the last day is answered yes — it just needs a seed where the raid is
demanded on day 99, which none of the 60 screened seeds had. No villager
dialogue or behaviour sample was taken this run (measurement arms, no
new sim band); that sense-check gap is recorded, not claimed.

## Wall numbers (this run judged no new win-seeking band)

No national / table / wins band was run: both arms are measurement on
existing corpora. Reused corpora, already judged: raidcallers pilot +
confirm national-or-better 15/20, table 0/20, wins 0/20; raidday100
screen national/table/wins 0/40, wave 4/5 0/40, median 100d. The scale
wall is untouched by this axis this run (zero src/js, zero levers) —
that is expected for ledger-closing work, not a regression.

## Metric review

- Day-100 arm: judged only against its prereg (both subquestions
  answered definitively with citations + runnable proof). Met: GO
  (REACHABLE). The 0/60 screen is not re-judged; it is explained.
- Generic arm: judged only against its prereg (both rows traced with
  closing arithmetic, OR both explicitly UNEXPLAINED with exclusions;
  single-row trace = partial). Result PARTIAL stands; it is not
  re-scored as GO on the strength of the one traced row. The 9970
  death-day mechanism is a candidate for the NEXT prereg's boundary
  definition (a death-day adjustment alongside the day-100 one), not a
  silent rule change here.
- No metric was revised mid-run. Proposed for the next run: preregs for
  recorder instruments must state registerDeath fidelity (see the
  instrument finding above); ledger preregs must define the closing
  boundary for death-day snapshots as well as day-100 snapshots.

## Telemetry deviation check

No new per-seed band corpus exists this run (day-100: recorder log only;
generic: re-derived existing corpora), so the check was run on the
reused raidcallers pilot corpus as a re-check, not a new band judgment:
2 LOUD lines (table 16->0, wins 16->0), both the known regime artifact
class (pre-seat competent substrate vs the WINSEAT baseline; per-seed
rows, not top-level paths). No exiled LOUD line. Baseline NOT rolled.

## Infrastructure

- Master moved twice under the run (loop A 1121Z round 879cc47bc,
  journey-landing r61 e424e99df); both branches rebased clean in their
  own worktrees (generic twice, second after the day-100 merge when
  ff-only correctly refused the diverged branch), proofs green after
  every rebase and on merged master (day-100 proof GREEN, generic
  31/31, both re-run on merged master).
- Safe-commit index clobber hit both worker commits (committed files
  staged-as-deleted); repaired via the documented cacheinfo route,
  commits verified correct. CORRECTION (coordinator addendum, same run):
  the safe-commit index clobber DID hit the coordinator evidence commit
  too (staged-deletion variant: the committed file showed staged-as-
  deleted + untracked, worktree file byte-identical to HEAD). Repaired
  via --add --cacheinfo from the HEAD blob; verified afterwards with
  `git status --short` empty, `git diff HEAD` empty, and hash-object
  matching the HEAD blob (bfbe0cb97344b6c180a03db764ad77d8a3b45424).
  The commit itself (90a97ea23, 1 file, 192 insertions) was always
  correct.
- No EPERM flap blocked this run's writes. No jest run (proofs are node
  scripts; nothing jest-testable in either arm). check.js --quick NOT
  re-run: zero src/js, zero green-list files; arm proofs are the
  attributable verification.
- Loop A trees were NOT touched; their disappearance from the worktree
  list by closeout is A's own closeout (its claim deleted by itself).

## Next blanks, in order

1. A day-99-demand seed screen: spend seeds screening for a demand dated
   99, whose day-100 take will exercise the post-snapshot raid
   adjustment (day-100 arm's named next arm; prereg must state recorder
   fidelity).
2. A wider trace on 9954 ONLY: per-stack identity across the day-100
   snapshot boundary to collapse the 300–5,719 range to a point, then a
   same-seed replay instrument if still nonzero. Do NOT re-attribute
   9954 to feast previews, alien raids, stockdoor carry, or cooking
   bonus (all excluded with numbers).
3. The 0530Z carried blanks, still open: garden-attributed deposits with
   zero garden harvest, starting-stock draw order, spoilage-boundary
   split (meal vs cook), ~5,900 kcal non-draw removal day-82/83.
4. A treeline give/overrun band (seeds where holds fail) — still
   unexercised after raidcallers.

food-economy stays converging (NOT converged): the day-100 question is
answered and one generic row is closed, but the raid adjustment is still
unexercised, one generic row is still unexplained with a ≥300 kcal
floor, and the scale wall is untouched by this axis. scale-onramp stays
converging (untouched; sibling loop A). Claim deleted; lock deleted.
Merged locally, pending ship.
