# sim-scale-onramp-round-1942 — coordinator evidence (axis scale-onramp, 1 NO-GO + 1 DIAG-GO)

Run: fleshout loop A, run fleshout-20261028T1942Z. Axis scale-onramp
(blocking axis, converging, NOT converged). Sibling loop B live on
food-economy throughout (new trees arenafallback / awayvoice /
insideevening appeared mid-run; B landed an awayvoice reproof and an
insideevening evidence note into master during this run) — NOT touched.
No push, no bump, no live verification (ship-loop line).
Merged locally, pending ship.

## Plain words first

Both arms attacked the same wall — field parties that never kill a
wave-4 beast — and both came back with a sharper picture of why, not
a fix:

1. Starting together does not happen, because the fight's leader is
   never the person who walked out with anyone. A perception-honest
   from-start join was built (a co-departure stamp: who walked out
   together) and proven working — it even produced a clean kill at
   wave 2 — but on 19 judged wave-4 meetings it fired zero times:
   the villager who meets the beast is never an outing member.
   The earlier "5 perception-legitimate" meetings turn out to be a
   different shape: the leader was outside the crew and the
   legitimate person was the tile-mate. That definitional gap, not
   the mechanism, is the next blank.
2. When parties do form (by shout), they retreat for a reason the
   numbers now justify: a party deals about 15 damage a round
   against beasts with 850–1500 health, while taking about 39 a
   round. Killing would take ~52 rounds; the fight allows 15.
   The retreat is people judging an unwinnable fight, not a
   missing system. The next lever is damage, by 3.8–5.3× — and
   loosening the retreat threshold alone would turn orderly
   retreats into deaths.

## Shared band and preregistration

Both arms: seeds 75101–75108, tableseat-nowait verbatim,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware, competent
policy. Control (1528Z): field meetings 24 all solo, field kills 0,
wall natEver 7/8, wins 3/8 all lesser, full 0/8, wave-4 6/8,
wave-5 0/8, median 146d, deaths 286, starvation 1. Each arm
pre-registered its own header before any judged sweep or census
(arm prereg commits on the merged branches); verdicts below are
judged against those headers, no re-scoring. Balanced panel (§15):
as in 1415Z/1528Z/1628Z/1736Z, the identical-seed before/after
corpora are the §15 substitute; no panel artifact is claimed and
no panel verdict is faked.

## Arm 1 — sim-perceptform-a: perception-based formation (game code, REVERTED) — NO-GO

Worker branch sim-perceptform-a (merged evidence + instruments +
corpora only, zero src/js diff on the merged tip). Prereg: primary
≥2 perception-legitimate wave-4 meetings starting as a party (ally
present round 1) OR ≥1 wave-4 field kill; meeting-floor leg judged
≥4; guards RELATIVE (armed median ≥0.8× own control median,
starvation ≤ control+2) per the 1736Z metric note — the absolute
120d bar is not used on this band.

- The change (reverted): a per-person co-departure stamp in
  resolveAssignments (day/part/task + same-task partners, departure
  only, rebuilt every part) plus a perceivedFromStartAlly helper
  that reads ONLY the fighter's own stamp and checks each named
  partner one by one (roster, not dead, pure nodePos read = monster
  tile — no _outdoorCrew read, no roster scan, no earshot radius,
  no trust/gear gate), wired into resolveWildMonsterEncounter and
  resolvePatrol (non-aid path only; raid exempt, aid untouched).
  Game.js only, +89/−2.
- Proof PROOF-GREEN on armed code: stamp records same-task partners
  only; on-tile partner joins from round 1 via the wild router
  (allyFromStart=true, door log line); off-tile and different-task
  negatives pass; solo control clean.
- Control gate PASS before the game edit: substrate + base code
  reproduces earlycrew-a EXACTLY — 907 meetings, 19 judged,
  crew-tile 5, vDie 10 / vFlee 9, fought 0, from-start 0, kills 0,
  wall 6/4/3/2, median 118d, deaths 306, starvation 1, pairs 1,881.
  Det-gate PASS (seed 75101 layer-OFF = plain tableseat-nowait:
  132/132 days, ts 77).
- Armed pilot (same seeds): 912 meetings, 19 judged,
  perceived-present 0, crew-tile 5, fought 0, outcomes vDie 10 /
  vFlee 9. Primary FAIL: PARTY-AT-START-PERCEIVED 0, field kills 0.
  Floor MET (19 ≥ 4) — a class verdict, not a scarce-opportunity
  verdict. Guards PASS (median 118d vs bar 94.4d; starvation 1 vs
  bar 3). Audit leg CLEAN (0 audit-failing from-start meetings).
  No confirm band (kill-fast rule).
- It fired in the wild, all-waves only (never substituted for the
  primary): 2 formations, including a clean kill — seed 75101 day
  69, Oliver Moore + Emma Larsen vs wave-2 alien tick, 2 rounds,
  vKill. Wave-3 contrast: 18 meetings, 0 from-start, 8 fought via
  shout (unchanged).
- Why wave 4 is 0: judged wave-4 leaders are NEVER outing members
  — 0/19 leader-in-crew on both bands (and 0/14 in earlycrew-a's
  75103 set, re-checked). Wild meetings pick whoever stands on
  the tile (wanderers, visitors, new joiners); the foraging pair
  are potential allies, not leaders. Earlycrew-a's "5
  perception-legitimate" meetings were never leader-partner
  meetings: in all 5 the leader was outside the crew and the
  legitimate person was the tile-mate. The prereg's strict
  leader-partner definition mismatched the measured class — the
  verdict was NOT re-scored under the looser class.
- Wall (armed vs control): national ever 6/8 = 6/8, final 4/8 =
  4/8, table 3/8 = 3/8, entered 2/8 = 2/8, wins 2/8 = 2/8 (all
  lesser, full 0/8 both), wave-4 7/8 = 7/8, wave-5 0/8 both, median
  118d = 118d, deaths 303 vs 306, starvation 1 = 1.
- Sense: replay (seed 75101 armed, d65–d75) reproduces the d69 kill
  exactly. Outing narration stays singular (no "X and Y head out
  together" line — standing blank). The d74 tap shows the rule
  refusing honestly (stamp partner present but not on tile → no
  join; partner later joins via shout). The from-start log line is
  aid-flavored ("already at the door") for a field fight — a
  narration blank for any future landing. No wave-4 formed party
  exists to judge gear on; none is claimed against the wave-4
  party+gear demand.
- Evidence: evidence/2026-10-28/sim-perceptform-a.md (+ prereg),
  sense log, corpora evidence/2026-10-28/perseed-perceptform-a/
  (control + armed), instruments scripts/test-perceptform-a{,-sweep,
  -sense}.js + stamp-lens recorder addition (additive, null-safe
  on base code, kept). Substrate policy (earlycrew.js, restored
  verbatim hash-verified vs 134bc0dbd) DELETED at verdict; armed
  proof test deleted with the reverted code (lives in branch
  history at 717ff8ed7).
- Coordinator verification: analyzer reproduction on the rebased
  branch reproduces the verdict exactly (PRIMARY 0/0 FAIL, floor
  19 MET, guards PASS, wall as above; control gate GATE-PASS);
  node --check clean on all three scripts; net src/js diff vs
  master zero after the revert commit.

## Arm 2 — sim-retreatdiag-a: formed-but-retreated diagnosis (DIAG ONLY) — DIAG-GO

Worker branch sim-retreatdiag-a (merged earlier in this run as
92abb0707; zero src/js, zero policy changes). Prereg: 100%
classification + ≥80% stay-to-kill quantification + one ranked
next lever.

- 16/16 formed-but-retreated parties classified, OTHER 0:
  HOPELESS-REFIRE 14 (vFlee with fleeHopeless=true — the hopeless
  formula fired again the round after the ally joined), DEATH 2
  (caleb_jones vs audit, 130 taken over 3 rounds; 75108 eater, 0
  dealt vs 219 taken in 2 rounds). HP-FLOOR 0, LEARN-WITHDRAWAL 0,
  ROUND-CAP 0, NON-RETREATING 0. Every party exactly 2 fighters
  (leader + one ally, one strike each); all 16 leaders armed;
  fights lasted 2–3 rounds, never more.
- Stay-to-kill gap, at observed rates only (16/16 quantified):
  party damage median 15/round (mean 13.4, range 0–19.3); leader
  share median 89%; ally total 3–6 per fight (~1 strike — the ally
  joins the round after the shout and the fight ends that same
  round, so ally damage is structurally capped). Rounds to kill:
  median 51.9; fresh beasts 73.3–77.3 (+1 infinite, the zero-damage
  eater). 16/16 need more than the 15-round cap — including the
  most wounded beast faced (herald at 294 HP, 16.6 rounds).
  Rounds to drive off (15% break line): median 44.1, over-cap
  15/16. Monster damage median 39/round (leader-only 25.2) vs
  ~100-HP villagers → survival window ~4 rounds vs kill window
  ~52 rounds. At retreat, parties still owed a median 1,547
  incoming damage (range 214–3,081) before the kill would land.
  Total damage across all 16 parties: 558 — less than one fresh
  beast's HP.
- Sense verdict COHERENT: three transcripts read (shoutgate d109
  Anthony/Sandile, fieldfeed d118 Elmarie/Jorge, plus 2 fresh
  base-code fixtures): aim, trade, shout, one shared round, "sees
  how this ends — and runs while running still works." The retreat
  reads as people judging an unwinnable fight. The missing system
  is damage/survivability, not the retreat judgment.
- Ranked next lever (single first lever, per prereg): (1) DAMAGE
  first — party DPR must reach 57–80/round for fresh beasts
  (mHpStart/15), i.e. 3.8–5.3× the observed median 15 (median
  across all parties 3.5×; drive-off inside cap 48–68/round);
  its prereg must define success as a kill or drive-off, never
  staying — a bump that merely delays retreat into death fails,
  and this diagnosis proves that failure mode is the default.
  (2) STAY-MECHANIC second (reinforcement, drive-off-as-win,
  trick/counter finish). (3) SURVIVABILITY supporting only (~13×
  effective HP needed to trade 52 rounds at observed damage).
  (4) THRESHOLD loosening LAST, harmful alone: it converts the 14
  orderly retreats into deaths (median 1,547 further incoming vs
  ~100 HP); any threshold proposal must answer that number first.
- Fresh-band control-shape check (base code, 75101–75108):
  CONTROL-SHAPE PASS — 1,272 meetings; judgedA 24, formed 0,
  kills 0; judgedB 18, formed 0, kills 0. Wall reproduces the 1528Z
  control EXACTLY on every field (natEver 7/8, final 6/8, table
  4/8, entered 3/8, wins 3/8 all lesser, full 0/8, wave-4 6/8,
  wave-5 0/8, median 146d, deaths 286, starvation 1). No wall
  movement claimed from re-analysis.
- Evidence: evidence/2026-10-28/sim-retreatdiag-a.md (+ prereg),
  input-corpus analysis, fresh-band corpus + summary, sense
  fixtures, instruments scripts/test-retreatdiag-a{,-sweep,-sense}
  .js (analyzer MACHINE LEGS PASS, sweep CONTROL-SHAPE PASS,
  sense SENSE-SHAPE PASS on the final tree).

## Metric review

- Relative guards validated and should be kept: both arms judged
  cleanly against armed-vs-own-control bars; the absolute 120d bar
  is not reused on this band.
- Perceptform definitional gap (not a re-score): the strict
  leader-partner "same outing" class does not occur among judged
  wave-4 leaders. The next formation prereg must define its
  eligible class from the measured population (leaders are never
  crew) and rule beforehand whether tile-mate-holds-a-stamp counts
  as "same outing" — a perception-law question, not a measurement
  choice to make mid-run.
- All-waves formations reported, never substituted for the wave-4
  primary, on both arms where they arose.
- Panel standing exception (no census-ingest mode) as in prior
  rounds; pre-registered analyzers, coordinator-reproduced for
  perceptform, are the comparison.

## Telemetry deviation check

- Perceptform corpus (worktree run, n=18 files): 3 LOUD lines
  (national 12→0, table −62% 16→6, wins 16→0) — all the known
  artifact class: the checker reads bare national/wins/table
  fields while per-seed rows carry nationalEver/entered/won
  (true armed wall natEver 6/8, entered 2/8, wins 2/8), and the
  WINSEAT baseline is regime-forbidden against this pre-seat
  substrate. Baseline NOT rolled.
- Retreatdiag corpus (n=11 files, glob sweeps summary + analysis
  files alongside per-seed rows): same 3 LOUD lines (national
  12→0, table −75% 16→4, wins 16→0), same artifact class (true
  fresh-band wall natEver 7/8, entered 3/8, wins 3/8). Baseline NOT
  rolled.
- The perceptform corpus run from the main tree before merging
  ENOENTs (corpus lives on the branch until merged) — rerun from
  the worktree above; no data problem.

## Infrastructure

- Coordinator approval for the perceptform revert: the worker
  correctly refused safe-commit's mass-deletion guard (89 lines)
  without coordinator approval and left the revert uncommitted
  with a LOUD blocker note. The coordinator verified the revert
  state (game.js hash = pre-change blob 044a8919, zero
  _coDepart/perceivedFromStartAlly references, uncommitted files
  exactly the revert), then approved and ran safe-commit with
  --force-delete in the FIRST-arg position
  (safe-commit.sh --force-delete "msg" -- files — a message-first
  attempt mis-parses the flag and is refused again; no commit was
  made by the mis-ordered attempt). Revert commit 847f97c7c
  (rebased 5fbf3076e), net src/js diff vs base zero.
- Safe-commit index clobber hit the revert commit (MM/AD index
  entries on all three files; commit itself correct) — repaired
  via HEAD-blob cacheinfo + force-remove of the stale deleted-file
  entries, verified status empty + diff HEAD empty + hash match
  before rebasing. Clobber also hit all three retreatdiag commits
  per the worker report (same repair, verified by the worker).
- Rebase: perceptform branch rebased clean onto master 782af19e0
  in its own worktree (7 commits, zero conflicts, zero file
  overlap with the sibling B landings); proofs re-run green after
  rebase (analyzer verdict + gate reproduction above).
- Master moved 3 times under the run from sibling loop B
  (retreatdiag's own merge aside: awayvoice reproof, insideevening
  evidence note, plus the retreatdiag merge itself) — zero overlap
  with either arm's judged content.
- docs/ONTOLOGY.md at 0 bytes in the main tree for the whole run
  (touched 18:55Z, same transient as 2026-10-24 and the 1730Z/1736Z
  rounds) — left alone throughout per precedent, never reset,
  never committed; it is NOT this run's dirt.
- No EPERM flap blocked this run's ref writes. check.js --quick
  NOT re-run by the coordinator: zero src/js in either merged
  branch, zero green-list files; B's 1730Z full check (275/15, all
  adjudicated pre-existing) stands as the recent profile.

## Wall (this run's judged corpora)

- Perceptform armed: national ever 6/8, final 4/8, entered 2/8,
  wins 2/8 (lesser only), full 0/8, wave-4 7/8, wave-5 0/8, median
  118d, deaths 303, starvation 1.
- Retreatdiag fresh band (control-shape): national ever 7/8,
  final 6/8, entered 3/8, wins 3/8 (lesser only), full 0/8, wave-4
  6/8, wave-5 0/8, median 146d, deaths 286, starvation 1.
- Pooled judged wave-4 field kills: 0 everywhere. Full seat 0,
  wave 5 0, in every judged band.

scale-onramp stays converging (NOT converged): from-start formation
now exists as a proven mechanism and the retreat is now explained
with numbers and a ranked next lever — but no wave-4 field party
starts as a party under the strict definition, no wave-4 field
kill has happened, the full seat is still unreached, and wave 5
is still 0. The directive stands until the tracker records this
axis converged on measured evidence. Next blanks, in order:
(1) TILE-MATE-STAMP class: the eligible class that actually exists
on this band is a tile-mate who holds a current outing stamp and
stands on the tile (5/19 judged by the crew-tile lens) — needs a
perception-law ruling on whether tile-mate-outing-status (vs
leader-partnership) counts as "same outing," then its own prereg;
leader-selection gap (wild meetings don't select for outing
members) rides with it; (2) DAMAGE lever for formed parties
(retreatdiag rank 1: 57–80/round, success defined as kill or
drive-off, never staying); (3) joint-outing narration blank
("X and Y head out together") + aid-flavored from-start log line;
(4) ally one-strike cap (ally can never contribute more than ~1
strike in this fight shape, so ally-only buffs cannot close the
damage gap); (5) wounded-beast chaining (herald 294 HP needs 16.6
rounds — measure whether repeated parties ever finish a chained
wounded beast). food-economy stays converging (untouched; sibling
B loop). Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted. Evidence: this file (coordinator) +
sim-perceptform-a.md + sim-retreatdiag-a.md (commits 92abb0707,
perceptform branch tip, coordinator record on the perceptform
branch).
