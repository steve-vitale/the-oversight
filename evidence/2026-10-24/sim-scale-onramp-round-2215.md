# sim-scale-onramp-round-2215 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261024T2215Z (loop A). Claim + lock held for the run, both
deleted at closeout. Sibling loop B live during this run on food-economy
(fullpantry-diag-b, governverdict-b — NOT touched; their trees appear in the
reap output and were left alone).

## Standing directive status

Still stands. Scale-onramp stays converging (NOT converged): wins are real
but only through default-OFF courtship + seat instruments, only through the
lesser seat, wave 5 still 0 everywhere. This run names the lock behind the
99-pin and walks a second table door — it does not climb past national.

## Arms (both pre-registered in their own evidence headers before sweeping)

### Arm 1 — sim-standing99-diag-a: DIAG-GO

Question: why does standing pin at 99, and why does wave 5 never unlock?
Substrate tableseat-nowait (leanlinkrescue + seat legs only). Pilot 8 seeds
73671–73678, 180d death-aware. New pure-read recorder
scripts/policies/standing99-diag.js (STANDING99=1, default-OFF; computes the
gated total from pure reads, never calls side-effecting villageStandingTotal
mid-run). G1 det-gate PASS, G2 recorder neutrality PASS (8/8 seeds identical
on days/gameDays/ts counters/starvation; deaths 261 = 261), G3 corpus
integrity PASS (16/16 rows, daily trajectories, engine-gated validation:
computed gated total == engine's villageStandingTotal() at run end).

Finding, in plain words: standing 99 is a lock, not a stall. When a village
reaches 3 regional links (102 diplomacy points) but has no fighter who has
killed a wave-3 monster and lived, the game clamps the number the wave gate
reads to 99 — one point below the wave-4 bar — no matter how high the real
sum climbs (one village read 99 while its real sum was 292). Armor, weapons
and monster-trick knowledge all clear on stuck villages; the only bar that
never clears is living veterans (0 of 1). The same lock repeats one rung up:
two villages reach the wave-5 bar on points (capped 252/262) but sit at 199
because wave 5 needs TWO living wave-4 killers, and no seed ever has even
one at any day. 7/8 seeds pinned at 99 at some point (73674/73675/73677 stuck
to end, 58/92/36 days); 73672 never pinned (readiness already met when raw
crossed 100). Wave-5 readiness: ready 0 days on 8/8 seeds.

Correction carried from this arm: fullseat-diag.js hold inference omits
defer4, which is why the 2115Z run mislabeled defer4-held totals (raw
102/182, gated 99) as below-bar. Past evidence citing fullseat holdKind for
wave-4 pins should be re-read with that correction. fullseat-diag.js itself
was NOT edited (owning lane's call).

Sense read (seed 73675, non-measured replay): the stall is not silent — the
System broadcasts "The next act is still waiting — blood your fighters (0 of
1 veterans)" — but it never says "one point short," never names 99, and
never says what deed counts. Villagers never react to it, and the village
otherwise lives normally, so a 92-day pin feels like weather, not a wall.

Next arm (precise, from this arm's evidence): vetshape/kill-log diag on
stuck seeds 73674/73675/73677 (+73676 intraday case) — record
state.waveKillLog to decide whether stuck seeds never kill a wave-3+
monster vs kill with dead killers; if the latter, probe the existing
default-OFF VETSHAPE=1 instrument (living-or-dead killers) before anyone
moves demand numbers. Do NOT move readyDemand numbers on this evidence
(armor/armed/tricks already clear).

Commit: f755ff4ba (single commit: recorder, sweep, proof test, evidence,
sense file, 16-row corpus). Proof: scripts/test-standing99-diag.js, 14
checks, ALL PASS (re-ran green after both rebases and on merged master).

### Arm 2 — sim-tablepaths-witness-a: GO

Question: does the witness door walk? Substrate tableseat-nowait.
Policy scripts/policies/tablepaths-witness.js (TABLEWITNESS=1, default-OFF;
paths-phase override only, reuses the existing chooseTableOption answering
path exactly; no src/js changes). Pre-registered fallback: witness if
offered, else first non-Feared door, else Feared flagged fallback-Feared.
Pilot 8 seeds 73671–73678, 180d death-aware, own tableseat-nowait baseline
on identical seeds. G1 det-gate PASS, G2 non-seated leak gate PASS, G3
corpus integrity PASS (16/16 rows).

Results: witness entered 3 seatings (73672 day 106, 73673 day 134, 73677
day 98 — all lesser seats, all light road, all won); fallback exercised
honestly on 73678 (witness NOT earned, 1 exposure vs 3 needed — rule took
beloved and won light). Fallback-Feared: 0 uses — that rule arm is
live-untested, unit-tested only. Cost bar clean: starvation 3 vs 3
(arm-only 0), median 150 vs 150 (>= 0.8x). Death totals identical per seed
and per cause (261 each); paired rows identical except the door walked.
Baseline entered feared 4/4 seatings and won 4/4; armed won 4/4 (witness 3,
beloved 1).

Sense read (seed 73672, non-measured replay): reads as witnessing, not a
reskinned negotiation — charges read cold, defense witnesses let to speak,
private settlement refused ("In public, or not at all"), final "Read the
charges" with the village's own ledger in evidence. Epilogue honestly
leaves the stasis-kids thread open (non-hosts ending, by design). Known
note again: routine butchering/loot lines resume immediately after the win
line inside the finale day, slightly undercutting finality.

Commits: 15596cf77 (policy, [needs-eyes] — a new door walk is
feel-adjacent), 014f67695 (sweep, proof test, evidence, sense file,
16-row corpus). Proof: scripts/test-tablepaths-witness.js, ALL PASS
(re-ran green after rebase and on merged master).

## Shared-band cross-validation (accident, reported honestly)

Both arms independently chose the SAME fresh band (73671–73678): the
standing99 worker rejected 73661–73668 (73668 appears in unrelated
pantrystarve corpus files) and verified 73671–73678 fresh against dated
.md files and filenames — correctly, because the witness corpus lived only
in the witness worktree, uncommitted, at check time. This is NOT
contamination: the standing99 arm never consumed witness outputs, and its
armed arm is tableseat-nowait + a neutral recorder. The payoff is a clean
independent replication: both arms' tableseat-nowait baselines agree EXACTLY
(won 4/8, national ever 8/8, final 7/8, wave 4 5/8, wave 5 0/8, starvation
3, median 150, deaths 261) — the same baseline reproduced by two workers,
two instruments, two worktrees.

## Wall numbers (this run's judged corpora, 32 configs on one band)

| metric | baseline (tableseat-nowait) | witness armed | standing99 armed (recorder) |
|---|---|---|---|
| n | 16 (8+8 replicated) | 8 | 8 |
| national ever / final | 8/8, 7/8 | 8/8, 7/8 | 8/8, 7/8 |
| table entered | 4 (feared) | 4 (witness 3, beloved 1) | 4 (feared, same as baseline) |
| wins | 4/8 | 4/8 | 4/8 |
| entered FULL | 0 | 0 | 0 |
| wave 4 / wave 5 reach | 5/8, 0/8 | 5/8, 0/8 | 5/8, 0/8 |
| median days | 150 | 150 | 150 |
| starvation | 3 | 3 | 3 |

The door rule changes which story the village tells at the table, not
whether it gets there: national/wave numbers are identical across all
three columns. The wall past national is the veterans lock (arm 1), not
the door menu.

## Village assessment (plain words)

These villages climb to national and then wait at a door they cannot see.
Seven of eight sit at standing 99 — the game has quietly decided they are
not ready to fight the next draft because no living fighter has killed the
last one, and it tells them so only in a System line about "blood your
fighters" that nobody in the village ever answers. The villages that do get
invited now have a second story to tell: three of them stood up as
witnesses, read the charges aloud, refused a private deal, and won by
putting their own ledger in evidence — and the one village that hadn't
kept enough of the list still won, as a beloved village, instead of
falling back to terror. Nobody reached wave 5, nobody sat a full seat, and
the full seat is now measurable as a veterans problem with a named key,
not a points problem.

## Balanced panel (§15)

Attempted on both corpora; throws the known error both times —
TypeError: Cannot read properties of undefined (reading 'days') in
scripts/lib/balance-scorecard.js comparePanels (panel wants panel-driver
output, not per-seed rows; same as 1955Z/2115Z). Sweep-compare tables above
are the before/after comparison, on identical seeds, judged against the
pre-registered bars. Panel-contract lane's item, not chased here.

## Metric review

- Both arms' pre-registrations held as written; no mid-run re-scoring.
  The shared-band accident was disclosed, not hidden, and it strengthened
  rather than weakened the baseline (exact independent replication).
- "Median days" is uninformative for the diag arm (150 = 150 by
  construction); the informative neutrality proof is per-seed identity
  (G2) plus identical death breakdowns — same lesson as fullseat-diag.
- The standing99 arm's gated-total validation (computed == engine's
  villageStandingTotal() at run end, 16/16) is the right strength for a
  recorder that re-derives a gated number: future standing instruments
  should keep it.
- Telemetry-check's top-level national/wins paths do not exist on
  per-seed rows (rows carry nationalEver/entered/won) — see below.

## Telemetry deviation check

Ran on both landed corpora (baseline
telemetry-baselines/scale-wall.json, metrics national,table,wins,exiled):
both corpora print the same 2 LOUD lines — "national disappeared:
baseline 12 -> current 0 (n=17 files)", "wins disappeared: baseline 16
-> current 0 (n=17 files)". Verdict: REGIME + FIELD-SHAPE artifacts, same
as 1955Z/2115Z. The WINSEAT baseline's own _regime note forbids comparing
courtship/pre-seat substrates against it, and the script reads top-level
national/wins paths that per-seed rows do not carry (n=17 = 16 rows +
summary.json). Judged numbers above (national ever 8/8, wins 4/8) contradict
the LOUD lines on the rows themselves. Baseline NOT rolled, no new
investigation.

## Infrastructure

- Master moved once under the run (journey-endgame r48 47426505e, zero
  file overlap with either arm). Both branches rebased clean in their own
  worktrees (witness once, standing99 twice — the second rebase after the
  witness merge, because ff-only correctly refused a diverged branch);
  proofs re-ran green after every rebase and on merged master.
- Safe-commit index clobber hit both workers' commits (committed files
  showing staged-deleted); repaired via cacheinfo each time, commits
  verified correct. No clobber on the coordinator merges.
- check.js --quick on merged master: 280 passed, 7 failed in 853s — the
  SAME profile as the 2115Z run (280/7), visible failure the pre-existing
  parity gear assertion ("they still wear their spear and jacket"). Zero
  src/js changes and zero green-list files in this run, so the 7 failures
  are pre-existing, not attributable here. Full failure list not captured
  (tail-only output; same gap as 2115Z, not chased — re-running costs
  ~14 min under sibling load).
- check.js --quick ran slowly (853s vs 356s in 2115Z) because sibling
  loop-B sweeps were running concurrently; the check process itself was
  progressing (green-list tests observed mid-run), not hung.
- No EPERM flap on ref writes this run. Worktree registration was slow
  (~2.5 min for two trees) but clean.

## Convergence state

Axis scale-onramp: stays converging (NOT converged). Witness path diversity
now covers feared (prior), assimilated + relay (2115Z), witness + beloved
(this run) — all lesser seats, all won at zero measured cost. The full seat
is now decomposed to a single named lock: living veterans (wave-4 needs 1,
wave-5 needs 2; stuck villages have 0). Next blanks, in order: (1) the
vetshape/kill-log diag on stuck seeds 73674/73675/73677 (+73676 intraday
case); (2) whether waiting matters on bands where the seat stays unready
longer (still untested). food-economy stays converging (untouched;
sibling B loop). Rotation left at 3 (convergence work does not cycle it).

## Blanks filled / documented

- FILLED (measurement): the standing-99 pin mechanism — defer4 veterans
  lock, with trajectory proof and a precise next arm.
- FILLED (measurement + instrument): the witness door walks and wins
  (3/3 seatings, light road) at zero cost; fallback-to-beloved exercised,
  fallback-Feared still live-untested.
- DOCUMENTED (not chased): fullseat-diag holdKind mislabels defer4 holds
  as below-bar (correction noted, file untouched); post-finale routine
  chatter (third confirmation); 73676's intraday veteran open-and-die
  (daily sampling caveat — the kill-log arm closes it); check.js full
  failure list not captured.
