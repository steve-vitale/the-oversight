# sim-scale-onramp-round-2016 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261026T2016Z. No lock and no live claims at start
(all prior claims .DEAD; the sibling loop B trees and playtest
trees live at run start were NOT touched). Pre-flight clean
(main tree empty, disk 25%); reaper removed nothing of ours
(it flagged other owners' uncommitted trees, left alone).
Band 73671–73678, tableseat-nowait substrate, 180d death-aware,
scalemetric cost bar. Both arms DIAG ONLY, zero src/js, no
default flips, no demand-number moves, no veterans-bar changes.

## PRE-REGISTRATION (run-level, binding)

- Axis: scale-onramp (topmost non-converged axis; no live claim
  at start, so this run takes it). Blanks worked, in 1920Z order:
  (1) wave-4 encounter opportunity — why 24/33 spawns are never
  fought; (2) wave-4 fight winnability — 0–31 damage vs
  448–1000 HP (opportunity arm first in order, winnability as
  the paired DIAG arm; both measurement only, so neither moves
  demand numbers on this evidence).
- Baseline of record: the 1920 band table (wins 2/8,
  national-ever 6/8, national-final 5/8, table 4/8, entered 2/8,
  wave-4 6/8, wave-5 0/8, median 152d, deaths 307, starvation 1).
  Each arm re-baselined on its own starting HEAD and reported
  its delta; neither absorbed a delta silently.
- BALANCED PANEL (§15): same recorder-corpus limitation as
  prior arms — balance-panel.js has no corpus-ingest mode;
  the paired identical-seed tables in the arm evidence files
  are the comparison of record. No panel file is produced
  or faked.
- Telemetry-check is run on the corpora (below) and its LOUD
  lines adjudicated, not rolled forward blindly.

## Arm 1 sim-w4opp-a — DIAG-GO (commits 423af308f + addendum 9490f7da1 after rebase; proof 247 PASS, 0 FAIL on the rebased tree)

Question (1920Z blank 1, findings #1152): why 24 of 33 wave-4
spawns are never fought. Pre-registered partition, every
never-fought spawn in exactly one opportunity class.

- Re-baseline on its base (c1e8329e5, eggroad pilot): EXACT
  vs the 1920 table — aggregates and all 8 per-seed
  trajectories identical on every compared field.
- Partition (24 never-fought): never-in-range 22,
  contact-without-fight 2, in-range-never-met 0. Fully
  classified 8/8 seeds. Fought-spawn contrast: 9 fought
  (both channels 4, field-only 3, tb-only 2).
- Mechanism, not placement: monsters spawn CLOSE (mean 2.0
  tiles from Haven) and persist for weeks (mean 25.3 days)
  without ever sharing a tile with an eligible villager
  (22/24). No engine path sends a villager TO a monster —
  npcNodeTravel is objective-driven (forage / explore /
  visit / guard / haul). Villager meetings need same-tile
  co-location at a worldTick, and worldTick runs ONLY on
  player tile entry (a player sitting at Haven freezes
  meeting chances). Player meetings need same tile PLUS
  same grid cell; players shared tiles with never-fought
  monsters repeatedly (minPlayerTiles 0) without ever
  sharing a cell. The 2 contacts show the rules working as
  written (one coin flip lost, one grid cell never shared
  at a behavior step). No hidden blocker.
- r41 spawnfate cross-check (addendum, read-only via git
  show): r41's fate classes are end state, this arm's are
  opportunity history — a cross, not a duplication.
  Cross-tab: alive-at-end + never-in-range 19,
  alive-at-end + contact-without-fight 2,
  vanished-near-player + never-in-range 3. Agreement on
  every shared number across two instruments and two bases
  (33 spawns, 24 never-fought, 9 fought, 21 alive-at-end,
  3 vanished-near-player, vanished-interior 0).
- r41's open hole CLOSED: the 1/33 unexplained removal
  (73677 eulogy, single-day spawn) was traced with a
  stack-hinted removal log built for the whole band —
  removed d121 during a monster turn (monsterTurn hint),
  fled/gone, not fought. No removal in this band is
  unexplained. r41's arena-collateral explanation
  confirmed with a second instrument (removal hints
  startCombat + d145 arena start rows carrying tileMonster
  seqs 28/31 into wave-1 arena fights).

## Arm 2 sim-w4dmg-a — DIAG-GO (commit 78b0f38ef after rebase; proof 171 PASS, 0 FAIL on the rebased tree)

Question (1920Z blank 2): why wave-4 fights deal so little
damage. Pre-registered per-fight damage decomposition,
field AND tb, sources summed per row.

- Re-baseline on its base (628ceb21e, journey-scale r41):
  EXACT vs the 1920 table — aggregates and per-seed
  trajectories identical. The r41 base reproduces the 1920Z
  trajectories on this band, so these damage numbers sit
  on the same trajectories the 1920Z arm decomposed.
- Field (12 fights): damage 0–39 HP, median 23, vs start HP
  448–1000 (median 850). Median DPS 13/round over 1–3
  rounds. Source split exact on every row: volley 0, ally 6,
  close-in 248, total 254. The ranged opening NEVER fires
  on a wave-4 field fight; 11/12 fights are fought alone;
  10/12 open as 'learn'. Wounds persist across field
  meetings (herald 525→502→479→448) — grinding works in
  principle at ~24 HP/meeting, but each meeting costs a
  flight or a death.
- TB (13 fights, all lost): median net damage 252 HP,
  median 20.1% of the monster pool, max 58.5%. Closest
  fight: 73675 d146 algorithm, scholar alone, 10 rounds,
  1172→486 (686 HP, 58.5%), still lost — at its own rate
  (~69/round) the kill needed ~17 rounds.
- Dominant limiter, band totals (25 fights): field
  DPS-TOO-LOW 9, tb TRUNCATED 7, tb DPS-TOO-LOW 6, field
  ZERO-HIT 2, field TRUNCATED 1. Band dominant: field
  DPS-TOO-LOW (9).
- Rounds-to-kill arithmetic (descriptive, NOT a proposal):
  field at band medians 850 HP / 13 DPS = 66 rounds
  (median per-fight 63) vs the 15-round field cap —
  unwinnable on rate alone, before truncation. TB is
  unwinnable on survival, not only on rate.
- Structural finding — the channel reset: TB fights
  rebuild monster HP from the def's HP range (plus crew
  scale) and never inherit field wounds (73671 influencer:
  field ends 618, tb starts 941; 73671 suburb: field ends
  934, tb starts 1396). Field wounds persist in the
  field; tb damage dies with the loss. The two channels
  never combine, which is why 25 fights produce zero
  kills. The 73672 d148 influencer crew fight (4 monster
  fighters, 9281 total HP; party dealt 252, all to one
  crew fighter, lead untouched) is a different damage
  problem from solo fights.

## WALL NUMBERS (both arms agree exactly — baseline = armed, G2 identical)

Wins 2/8, national-ever 6/8, national-final 5/8, table 4/8,
entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median 152d,
max 180d, deaths 307, starvation 1. Wave-4 kills 0/8 seeds,
wave-4+ killers peak 0. Death-cause shares (w4dmg corpus):
villager combat 41.0%, villager-vs-villager combat 27.7%,
player arena 14.0%, expedition 4.2%, monster 2.6%,
dehydration 2.3%, sickness/wound 2.0% each, rest singletons.
Against 1920Z: identical in every field — the wall did not
move, but its manning now has a mechanism on both sides:
unmet because nothing routes villagers to monsters and
meeting rules need co-location the game never creates,
unbeaten because field DPS is ~1/66th of a kill and tb
resets the board every fight.

## VILLAGERS ACTING LIKE PEOPLE (sampled from both corpora)

- Villagers DO return to known monsters across people
  (73671 suburb met twice by different villagers, 73672
  herald/influencer three times each) — the village shares
  a problem across persons. But the sharing stops at
  contact: no party forms around a known wave-4 monster in
  any row, no second villager joins a fight in progress.
- Between fights villagers read as people (patching up,
  foraging promises, belt-tightening); in wave-4 fights
  they fight one at a time, alone, opening 'learn'.
- Sense (both arms, NON-MEASURED replays): wave-4 fights
  read as executions, not contests — 1 round, 0 damage,
  death, mourning, and a wry aside instead of a next step
  ("Isadora should have poisoned the meal" is a
  retrospective hint, not a plan). Nothing names a party,
  a counter, or a next step for the Algorithm. The one
  full teaching beat in a replay ring is for a wave-3
  monster (Callback counter). The fiction mourns well
  and instructs not at all.

## TELEMETRY DEVIATION CHECK

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-26/perseed-w4opp-a/*.json' --metrics
national,table,wins,exiled` and the same for perseed-w4dmg-a:
2 LOUD lines each (national 12→0, wins 16→0). Adjudicated
as artifacts, baseline NOT rolled: (1) the baseline's
_regime is WINSEAT (wins 16/16) while this substrate is
pre-seat tableseat-nowait, where wins 2/8 is the measured
band value — the checker's own note warns against exactly
this comparison; (2) the checker reads top-level
national/wins keys that recorder rows do not carry (the
known recorder-row counting artifact, same as 1920Z/1930Z).
Actuals are national-ever 6/8, wins 2/8 on both corpora.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- Both DIAG-GO bars judged exactly as pre-registered
  (w4opp: >= 6/8 fully classified + dominant named;
  w4dmg: >= 6/8 fully decomposed + dominant limiter
  named + RTK arithmetic stated). No metric re-scored.
- Disclosed pre-judgment corrections (in the arm files,
  not hidden): w4dmg tb net damage was first computed
  lead-fighter-only; the crew fight showed that hiding
  252 damage, so the classifier now sums across all
  monster fighters by key (band tb median 242→252,
  limiters unchanged). w4opp's first sweep parent died
  mid-run; the armed run was resumed from row files and
  completed, and a corrected re-sweep later overwrote
  every armed row — no outcome waits on the killed
  session.
- Notes for the NEXT run's prereg: (1) w4dmg per-seed
  rtkMedian 0 on 73673/73675 means "no finite RTK in
  set," not zero rounds — add an explicit UNMEASURED
  limiter for startHp-null (ephemeral) fights; the
  73675 field TRUNCATED is the startHp-null ephemeral
  fight, assigned via else-branch, not a "would finish"
  case. (2) w4opp's proof is base-agnostic (re-derives
  from rows); if a merge base moves trajectories, that
  is a re-sweep, not just a re-proof — the summary must
  be rebuilt from new rows first. (3) The "fully
  traced/classified" bars pass vacuously on
  zero-encounter seeds (73674/73678 here); a future bar
  that wants encounter coverage should require a minimum
  encounter count per seed separately.
- BALANCED PANEL (§15): not applicable (no corpus-ingest
  mode); paired identical-seed tables are the comparison
  of record. No panel file produced or faked.

## LANDING (coordinator)

- w4dmg: branch base 628ceb21e → master had moved to
  7a7336514 (journey r57/r58, zero src/js, zero file
  overlap with the arm). Rebased clean in its own
  worktree, proof re-run 171/0, merged ff-only as
  78b0f38ef, tree released, branch deleted.
- w4opp: branch base c1e8329e5 → master had moved past
  it (w4dmg landing + journey r57/r58 + loop B food
  round 2029, zero src/js across the delta, zero file
  overlap). Rebased clean in its own worktree, proof
  re-run 247/0 (DIAG-GO restated, baseline vs 1920
  diffs all zero), merged ff-only as 9490f7da1, tree
  released, branch deleted.
- No [needs-eyes]: both arms measurement only.
- check.js --quick NOT re-run (zero src/js in either
  arm, sibling loops live); attributable evidence is the
  arm proofs on merged master.
- Infrastructure, loud: (1) safe-commit index-clobber
  variant hit BOTH worker commits AND the w4opp addendum
  (staged-deletion / staged-as-deleted forms) — repaired
  via HEAD-blob cacheinfo each time, commits verified
  correct, worktrees clean at release. (2) A sibling
  cleanup wiped /tmp mid-run and killed w4dmg's first
  full sweep (after baseline 8/8 + armed 73671–73673);
  no corpus lost (rows live in the worktree evidence
  dir); recovered by re-running armed 73674–73678 plus
  --summary, with EXACT re-baseline + G2 PASS confirming
  the same corpus. (3) Worktree registration itself was
  slow (~3.5 min per tree): git's worktree reset
  contended with a sibling loop's concurrent git gc /
  prune at closeout — delay, not failure; both trees
  registered clean. (4) No EPERM flap on .git ref writes
  this run; merges succeeded first try.

## BLANKS FILLED OR DOCUMENTED

- FILLED (measurement): the wave-4 opportunity
  decomposition — 24 never-fought spawns classified
  (never-in-range 22, contact-without-fight 2), mechanism
  named (no routing to monsters; worldTick only on
  player tile entry; player meetings need same cell).
- FILLED (measurement): the wave-4 damage decomposition
  — 25 fights, dominant limiter field DPS-TOO-LOW (9),
  RTK 66 rounds vs the 15-round cap, and the tb
  channel-reset mechanism.
- FILLED (cross-check): r41 spawnfate agreement on every
  shared number + r41's unexplained removal traced and
  closed (73677 eulogy, d121 monster-turn removal).
- DOCUMENTED, NOT FIXED (instrument gap): a 213-HP gap
  on 73672 influencer seq51 (field end 799 → tb-start
  tile read 586, no recorded fight between) — needs a
  trace arm, not an explanation.
- DOCUMENTED, NOT FIXED (sense blank): wave-4 defeats
  are mourned, never instructed — no narration names a
  counter, a party, or a next step.
- DOCUMENTED, NOT FIXED (policy confound, carried from
  1920Z): the scholar's six same-day tb losses to one
  algorithm cannot be split by these recorders into
  bot-policy persistence vs engine re-engagement.
- NOT A FINDING: no game bug in the spawn, field-fight,
  or tb paths — wraps agree, source sums hold, every tb
  initiation joins to a tbEnd row. The fights work as
  designed; villages lose them, and mostly never meet
  them.

Convergence state: scale-onramp stays converging (NOT
converged): wave 5 still 0/8, wave-4 kills still 0/8, full
seat still unreached, wins still only via the lesser seat
— but the wall now has a two-sided mechanism (unmet +
unbeatable, each measured, each with a named next
question) instead of a single dominant class. Next
blanks, in order: (1) the routing/meeting-rule gap as a
DIAG question — what a "go to the known monster"
behavior would need, measured before any lever (party
formation conditions, eligible-villager availability);
(2) the tb channel reset as a design question — whether
tb should inherit field wounds is a ruling, not a fix
to smuggle in; (3) why volley never fires and fights
open 'learn' alone (party/volley conditions for field
fights); (4) the 213-HP seq51 gap trace; (5)
situation-aware table-talk variety once Steve rules
(carried); (6) dead-entry drop ruling (Steve, carried);
(7) remaining 1354Z steve-calls (choice-price,
met-below-line finishing, melt — still skipped, not
re-measured). food-economy stays converging (untouched;
sibling loop B). Rotation left at 3 (convergence work
does not cycle it). Claim deleted; lock deleted.
Evidence: evidence/2026-10-26/sim-w4opp-a.md +
perseed-w4opp-a/ + evidence/2026-10-26/sim-w4dmg-a.md +
perseed-w4dmg-a/. Merged locally, pending ship.
