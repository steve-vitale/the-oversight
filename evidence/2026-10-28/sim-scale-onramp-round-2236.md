# sim-scale-onramp-round-2236 — coordinator evidence

Run: fleshout-20261028T2236Z (loop A). Axis: scale-onramp (blocking axis,
converging, NOT converged). Sibling loop B live throughout on food-economy
(2224Z run: dawnhall GO landed, nighttravel rerun INSUFFICIENT-DATA held;
new B trees active at closeout) — NOT touched, no B file committed, no B
branch merged here. Master moved under this run (ship-loop version bump
cb30d8f98 + B 2224Z evidence): both arms rebased clean onto current
master before landing decisions; sortie proofs re-run green after rebase.
No live claim conflict: B claimed food-economy; this run claimed
scale-onramp only.

## Plain words first

Two questions from the 2115Z run, both answered, neither with a game
change landing. First: if every villager standing on the same tile joins
a fight from the start, do wave-4 beasts finally die? No — not one, on
8 seeds. The joining itself works (parties of up to 7 formed, 17 kills
at waves 1–2), but the party still runs away after 2–3 rounds, because
the "this fight is hopeless" judgment looks only at the leader's health,
not at all the hands that just joined. Joining was never the blocker;
staying is. Second: are the village's organized musters already the
killers? No — a muster kills only beasts that are already broken
(median starting health of its kills: 1 HP). Against healthy beasts it
wins nothing: 0 kills in 12 healthy-beast fights, 0 kills in 7 wave-4
muster fights, 4 dead leaders. So the wall now has a sharper shape:
villagers can gather, and they can finish the nearly dead, but nothing
in the wild yet stands its ground long enough, or hits hard enough, to
kill a healthy wave-4 beast.

## Arms

### Arm 1 — sim-tileparty-a: PILOT NO-GO, HELD UNMERGED (kill lever killed at pilot)

Prereg 1b12737f5 (before any judged sweep): primary = wave-4 field
KILLS only; drive-offs reported separately and never counted as
success; horizon 180d death-aware; pilot 8 seeds 75101–75108, confirm
only on pilot GO. Canon note (worker's, in its evidence): no doc covers
villager tile-party joining — docs/PARTY.md is the player's System
party. The rule implements the 2115Z coordinator decision, grounded in
the perception law: sight = co-presence on the tile; no roster, stamp,
or list feed anywhere in the implementation.

Baseline gate PASS exactly: meetings 1272, judgedA 24, formed 0, kills 0;
wall identical to 2115Z (wins 3, natEver 7, entered 3, median 146d,
deaths 286).

Pilot (armed, tableseat-nowait, 180d): judgedA 24 → 8 (trajectories
diverge because the rule changes all waves, not just wave 4 — disclosed
in the worker evidence). Kills 0, tile-party kills 0, drive-offs 0.
Tile-party fights in the judged set: 2, both party size 2, both fled —
s75101 d69 reunion (2 rounds, 20 damage dealt, 96 taken, ally 9, beast
1200→1180); s75108 d151 eulogy (3 rounds, 4 dealt, 66 taken, ally 4,
beast 663→659). Party-fight survival: mean 2.50 / median 3 rounds
(solo wild mean 1.20). The pre-registered formation bar (≥4 fights at
tileJoined ≥2) also fails on the judged set (max tileJoined 1 there).

All-waves (the mechanism itself works): 215 tile-party fights, party
sizes to 7 (2:174, 3:29, 4:4, 5:4, 6:2, 7:2), 17 tile-party kills at
waves 1–2 (9 + 8), 0 at wave 3 (39 parties, 0 kills, 25 drive-offs) and
wave 4. Root finding: STAYING, not joining, is the blocker — hopeless
morale counts leader HP only, so parties flee in rounds 2–3 no matter
how many hands join.

Wall (reported, NOT claimed as movement — n=8, divergent trajectories):
wins 3→5, natEver 7→8, entered 3→5, median 146→162d, deaths 286→262,
full seat 0, wave 5 0 both sides. This early-survival side-effect needs
its own prereg if pursued; it is not a reason to land this arm.

Proofs (green before the sweep, on the patched code):
scripts/test-tileparty-a.js TILEPARTY-PROOF PASS (both allies strike
round 1; tilePresentAllies excludes off-tile crew, sheltered, dead;
surviving ally wounds settle into village.health; empty tile set = old
crew behaviour); scripts/test-tileparty-a-sense.js TILEPARTY-SENSE PASS
(joining reads coherent — "already here — charges in"; staying does not
change — same retreat line at round 2, party bought 17 damage and 0
extra rounds vs the solo fixture).

LOUD — safe-commit refused the game-code commit: "deletes 62 lines in
src/" (>50-deletion guard; fieldFights 189+/59−, game.js 64+/3−, net
+191 — a legitimate refactor, not a revert). The worker correctly did
NOT use --force-delete and did not game the guard by splitting hunks.
Resolution: the diff is preserved verbatim as
evidence/2026-10-28/sim-tileparty-a-game-code.patch (478 lines,
git apply --check clean against HEAD) on branch sim-tileparty-a; src
reverted to HEAD; the branch contains NO game-code change (verified by
the coordinator: git diff base..branch -- src/ = 0 lines). Proof tests
on that branch fail without the patch applied — correct and documented
in the worker evidence addendum. If the early-survival side effect is
ever wanted, it needs a fresh prereg plus either patch application or
coordinator approval of --force-delete.

Disposition: HELD UNMERGED (branch sim-tileparty-a, worktree
sim-tileparty-a, fresh heartbeat at closeout — NOT released as
merged/abandoned), on the nighttravel precedent. Its evidence, corpora,
instruments, and patch live on that branch, NOT on master. Do NOT merge
this branch as a kill lever; a future morale/staying arm adopts it by
rebase + fresh prereg.

### Arm 2 — sim-sortiedpr-a: DIAG-GO, MERGED locally pending ship

Measurement only, zero src/js, zero policy-default changes. Prereg
16aa80eab (before any judged sweep): sortie definition, sustained-DPR
formula (mDealt/rounds, rounds ≥ 1), kill-vs-drive-off frame (drive-off
never counts as a kill), horizon, seeds, DIAG verdict rule. Reused
verbatim (never edited): scripts/policies/fieldparty-form-diag.js,
scripts/policies/tableseat-nowait.js, the r50 episode-tracking method;
the partyfinish armed corpus as a secondary contrast (never pooled,
partyfinish's GO not re-judged).

Pilot (8 seeds 75101–75108, 180d death-aware): AUTO band — 8/8 rows,
errs 0, sortie fights 0, answerLingerer calls 0, with opportunities
present (53 episodes, 46 gorge-seen, 183 lingerer-days, 183 gorge
nights). The absence is measured, not assumed. AUTO wall exactly
reproduces the partyfinish baseline shape (won 3/8 lesser, full 0/8,
national ever 7/8, final 6/8, table 4/8, entered 3/8, wave-4 6/8,
wave-5 0/8, median 146d, starvation 1, deaths 286). PLAYED pilot: 37
sortie fights (threshold 10 cleared) → confirm ran.

Confirm (PLAYED, 16 seeds 75101–75116): 16/16 rows, errs 0, overflow 0.
60 sortie fights, 45 attempts, 112 episodes (100 gorge-seen, 100
sortied). 2 attempts failed honestly with no-fighters (bench bare while
a 619-HP influencer held the treeline). Outcomes, kills and drive-offs
separate: KILL 35, DRIVE-OFF 13, FLED 6, LEADER DIED 6, EVADE 0.
Sustained DPR: median 16.0, q25 9.5, q75 23.0, min 0, max 59. Leader
share median 15.0/round; ally share median 0.0. Total damage 1,540;
ally damage 34 (2.2%). Party sizes: mustered 2 in 21 fights, 3 in 39.
Joined fighters 1 in 52 fights, 2 in 8 — joined-ally rate 13%. The third
mustered fighter never appears in a fight log. Survival rounds:
kills median 1 (max 3); drive-offs median 1 (max 4); fled median 3
(max 4); leader deaths median 2 (max 5). Cap-fit at median DPR: 850 HP
needs 53.1 rounds, 1100 HP needs 68.8 — both far over the 15-round cap.
What sorties kill: 35 kills, median starting HP 1, max 64 (a heckler);
by wave w1 25, w2 9, w3 1, w4 0. Healthy beasts (≥91 HP, 12 fights):
0 kills, 1 drive-off, 6 fled, 5 leader deaths. Wave-4 slice (7 fights):
0 kills, 0 drive-offs, 3 fled, 4 leader deaths. Zero-damage
(trick-spend) fights: 13. Price: 176,714 kcal in sortie rations;
6 leader deaths. Taxonomy catch, stated in the worker evidence: the
'sortie combat' death-cause count (35) is the killed-monster records,
not villager deaths.

PLAYED wall (16 seeds, reported not claimed as movement): won 4/16
(all lesser, full 0), national ever 14/16, final 11/16, table 6/16,
entered 4/16, wave-4 11/16, wave-5 0/16, median 166d, starvation 4,
deaths 606. Secondary (partyfinish gated corpus, never pooled): 29
sorties, kills 22, drive-offs 7, median DPR 16.0 — identical to the
ungated median, so the DPR finding is not a driver artifact. Its
recorder carries no joined/ally fields, so those are reported UNKNOWN
there after an analyzer fix (never 0).

Sense: COHERENT, with one named blank. Seed 75105 replay reproduced the
judged corpus exactly. Quoted in the worker evidence: the d89 sortie
line, the three 1-HP kills credited "with their party" plus the cornered
clause, and the 4-round redactor fight (shout-joined ally, shield wall,
rally, redaction un-writing wounds, "sees how this ends" retreat,
counter learned). Blank: third mustered fighter Miguel never appears in
the fight log — named at the treeline, absent from the blows.

Proof (re-run green by the coordinator on the rebased base):
node --check clean on all three instruments; analyzer
CORPUS-VERDICT DISTRIBUTION-COMPLETE + FINAL-VERDICT DIAG-GO with
--sense-ok (sense replay CAPTURED on seed 75105 post-rebase); sortie
files byte-identical across the rebase (0 diff lines on sortie paths).
check.js --quick deliberately NOT run by the worker (sibling check runs
in flight; never concurrent jest); this arm touches zero src/js and
zero green-list files, so the ship loop's check remains the gate before
any push — no check.js-green claim is made here. Commits (rebased onto
cb30d8f98, then merged --ff-only): 21804bcbe prereg, c0914fef4
instruments, 19f667bf7 corpus + evidence. Tree released done-merged,
branch deleted, master now 19f667bf7.

## Wall (this run's judged corpora)

Sortie PLAYED: wins 4/16 lesser, full 0/16, wave-5 0/16, median 166d.
Tileparty armed: wins 5/8 (side-effect, NOT claimed), full 0/8,
wave-5 0/8, median 162d. No wave-4 field kill anywhere. No wall movement
is claimed from measurement alone, and the tileparty side-effect is
explicitly not a landing reason.

## Telemetry deviation check (loop body step 10)

Sortie played corpus (merged, 16 rows + summary = n=17 files): LOUD
national 12→0, table −62% (16→6), wins 16→0; no exiled LOUD line. All
the KNOWN artifact class, verified not assumed: per-seed rows carry
nationalEver (14/16 true) / won (4/16 true) / entered (4/16 true),
while the checker reads bare national/wins fields that do not exist on
these rows; the summary row inflates n to 17. True numbers are the wall
numbers above. Baseline NOT rolled.
Tileparty armed corpus (held branch only, not on master): the checker
failed on the absolute worktree glob (MODULE_NOT_FOUND, not a game
finding); no LOUD lines are claimed from it. Its own summary-armed.json
is quoted directly: won 5, wonFull 0, nationalEver 8, table 5,
entered 5, wave-4 6, wave-5 0, median 162d, deaths 262.

## Metric review (for the NEXT run — never a mid-run re-score)

- KILL vs DRIVE-OFF frames held in both arms (drive-off never counts
  as a kill, reported separately). The 2115Z note that retreatdiag
  counted drive-off as success stands as a frame difference to name,
  not to reconcile silently.
- JUDGED-N COLLAPSE under all-wave changes: tileparty's judgedA fell
  24 → 8 because the rule changes every wave's trajectories, so the
  wave-4 judged set shrinks even when the mechanism fires 215 times
  all-waves. The next party/staying prereg must carry an all-waves
  formation count alongside the judged wave-4 count, or it will
  under-count its own mechanism.
- SORTIE DPR vs FIELD DPR are different populations: sortie median
  16.0 must not be compared to the fieldability 48.25 wild-best as if
  one refuted the other — different fight populations (mustered
  sorties vs wandering pairs), same 15-round cap arithmetic.
- PANEL NOTE (standing): scripts/balance-panel.js has no census-ingest
  mode. Paired before/after tables on identical seeds/substrate are the
  §15 substitute, as in prior rounds. No panel artifact claimed.

## Blanks filled or documented

- FILLED (diagnosis): sortie DPR end to end (median 16.0, healthy-beast
  kills 0/12, wave-4 sortie kills 0/7, joined-ally rate 13%, ally damage
  share 2.2%); tile-party mechanism end to end (215 fights, sizes to 7,
  17 wave-1/2 kills, 0 wave-3/4 kills) with the staying blocker named
  (leader-only hopeless morale).
- DOCUMENTED (findings backlog, not chased here): leader-only morale as
  the ranked next step; tileparty early-survival side-effect (own
  prereg if pursued); third-mustered-fighter ghost narration; the
  safe-commit >50-src-deletion guard as a landing friction for
  legitimate refactors (needs a coordinator-approved path, not
  hunk-splitting).
- NOT re-judged: fieldability DIAG-GO, chainkill DIAG-GO, perceptform
  NO-GO, retreatdiag DIAG-GO, shoutgate NO-GO, fieldfeed pilot-GO-only
  all stand as published.

## Coordinator decision (documented for Steve to overrule)

STAYING IS THE NEXT ARM, NOT MORE JOINING: the next scale-onramp arm
preregisters a staying/morale question — what keeps a formed party in
a fight past round 3 — judged on wave-4 kills with party size and
survival rounds reported, and it must state whether morale counts
party HP, party size, or something else before any judged sweep. The
tileparty patch (held branch) is the adoption substrate, not a landing:
a future arm rebases it, applies the patch under a fresh prereg, and
re-proves. Threshold loosening stays LAST, harmful alone.

## Infrastructure

- Master moved under this run (ship bump cb30d8f98 + B 2224Z evidence);
  sortie branch rebased clean onto cb30d8f98, proofs re-run green,
  merged --ff-only. The rebase paused once on a duplicated todo entry
  (corpus pick listed both done and remaining, clean tree, no
  conflict); `git rebase --continue` completed it with zero conflicts
  and byte-identical sortie files. No ref surgery, no reset.
- Safe-commit index clobber hit worker commits on both arms; repaired
  via HEAD-blob cacheinfo each time with hash verification, never
  git reset. No clobber on the coordinator sortie merge (verified:
  status showed only the expected files at each step).
- docs/ONTOLOGY.md was 0 bytes at run start (the recurring sibling
  transient, touched 18:55Z) and was restored by its owning writer
  during the run (310,939 bytes at closeout); left alone throughout,
  never reset, never committed; NOT this run's dirt. Main tree clean
  at closeout except nothing — status empty.
- No .git EPERM flap this run. No push, no bump, no live verification
  (ship-loop line). Sortie tree released done-merged, branch deleted.
  Tileparty tree HELD unmerged with a fresh heartbeat (NOT released).
  Final reap left other lanes' active/dirty trees untouched.

## Convergence

scale-onramp stays converging (NOT converged): sortie DPR and
tile-present joining are now both measured end to end, and the blocker
has moved from joining to staying — but no wave-4 field kill has
happened, the full seat is still 0, and wave 5 is still 0. The directive
stands until the tracker records this axis converged on measured
evidence. food-economy stays converging (untouched; sibling loop B
lane). Rotation left at 3 (convergence work does not cycle it).

Claim deleted; lock deleted. Evidence: this file (coordinator,
merged locally pending ship) + sim-sortiedpr-a.md (on master) +
sim-tileparty-a.md (held branch sim-tileparty-a, NOT on master).

Next blanks, in order: (1) STAYING/MORALE arm (what keeps a formed party
past round 3; adopt the held tileparty patch under a fresh prereg;
judge wave-4 kills, report party size + survival rounds); (2)
tileparty early-survival side-effect — ONLY under its own prereg, never
as a reason to land the kill lever; (3) third-fighter ghost narration;
(4) DELIBERATE RETURNS via travel-to-known-monsters (chainkill rank 3,
still open); (5) narration blanks (silent HP-floor flee; unnarrated
chain thread); (6) THRESHOLD loosening LAST, harmful alone.
