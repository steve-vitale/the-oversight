# Loop A scale-onramp round — run fleshout-20261124T1215Z

Run fleshout-20261124T1215Z, Loop A, axis scale-onramp. Three arms, all
complete and merged. Base master moved during the run — succession r280
(68053e081) merged mid-round; each arm branch was rebased onto current
master before its ff-only merge. Master at record write 003f86c9f.

## Pre-flight
- Lock + claim written at run start (run_id fleshout-20261124T1215Z).
  The coordinator timed out before closeout; the finisher recovered
  the lock after a liveness check (no live 1215Z coordinator process;
  heartbeats stale 15–60 min; only the Lane A deepening r282 hbloop
  and the Lane B succession-r280 gate test were running) and deleted
  it by same-call cat + run_id verify.
- sim-fightcap-recheck-a (wave-4 fight #2538/#2544) never registered —
  the worktree cap sat at 16/16 when the claim was written. Unrun;
  carries to the next Loop A run as blank #1. Do not treat it as run.
- Sibling Loop B live on winnability-chain all run (1030Z round:
  worngun-reseat-b GO, linkform-b DIAG-PARTIAL, bloodcluster-b
  DIAG-GO) — NOT touched.

## Arm 1 — sim-waitseat-a (NO-GO, CONCEPT-DEAD, merged bdc3801a0)
Tracker blank #5: whether waiting matters on bands where the seat stays
unready longer. Replay band 107383–107390 (launchfield-refreeze: 4/8
ended at standing 199, seat unready), 3 configs x 8 seeds = 24 rows,
150d, competent. Policies `scripts/policies/tableseat.js` (wait) vs
`scripts/policies/tableseat-nowait.js` vs baseline.
Result: the wait leg adds nothing. Seat+wait vs seat-only: entered 7v7,
won 7v7, national ever/final 7/7 both, table invited 8/8 both, wave-5
1/8 both, median survival 96.5d vs 97.0d, deaths 632 = 632 — every wall
metric identical. The wait leg did fire: 89 wait-days (82 at Haven, 5
stranded returns), 22 not-ready previews — and still zero conversion
delta. Baseline (no seat policy): 0 entered, 0 won, national 7/6,
table 8, wave-5 4/8, median 176.5d, deaths 839. G1 det-gate PASS (seed
107383: 179/179 days all three configs, empty ts counters); G3 corpus
24/24 rows, 0 bad. Design call (coordinator, Steve can overrule):
CONCEPT-DEAD — do not retry the wait leg without a new angle.
Evidence: evidence/2026-11-24/sim-waitseat-a.md (+ prereg, sweep
JSON, panel JSON/md).

## Arm 2 — sim-holdrepeat-fix-a (GO, merged 003f86c9f)
Finding #2743 (Eamon repeats one hurt line 31x over 36 days, 13
consecutive days — 1115Z measurement arm). Fix commit 233d6aceb
(rebased from c7767fcee): day-count-varied hold wording, reason text
identical. Proof `scripts/test-holdrepeat-fix-a.js` 21/21;
`scripts/test-holdspeak-a.js` 30/30 on the fixed code; analyzer
`--selftest` 9/9. Pilot after-leg (8 seeds, same-base before/after):
verdict CADENCE — 38 hold lines, 14 holders, worst single line 4x,
0 holders >=10x. Confirm (16 fresh seeds 109417–109432): combined
both after-legs verdict CADENCE — 227 hold lines over 24 seeds, 43
holders, 0 defects; worst single line 12x (Eamon band-3, was 31x),
worst same-line run 7 days (was 13), median max-repeats 2 (baseline
2), 0 holders >=20x (was 3). The analyzer's own verdict reads NO-GO
only because its B2 bundles a silence-baseline check written for the
holdspeak arm (before leg pre-voice code); on this base the before leg
legitimately HAS hold lines, so the check is inapplicable — B2
adjudicated PASS on the substantive fields (identical outcomes + 0
mismatches), the same shape the holdspeak arm used. Balanced panel:
review_required, compare exit 2, adjudicated PASS (every contract
metric exactly 0 delta: deaths 92 -> 92, national 0 -> 0, won 0 -> 0).
Frozen GO bar: (a) worst holder 12x < 25x — PASS; (b) no line on >= 10
consecutive days (worst 7) — PASS; (c) median 2, not risen — PASS;
(d) B2 no-regression — PASS (adjudicated). Verdict: GO. Finding #2743
marked [fixed] in sim-findings.md by the arm. Evidence:
evidence/2026-11-24/sim-holdrepeat-fix-a.md (+ prereg, analyses,
panel JSON/md).

## Arm 3 — sim-calledname-a (GO, merged 6e4af0dbe)
Findings #2741 + #2742 (0915Z round): the drift line speaks the true
name ("Ashley") while the beat says the use-name ("Ash") — `revealName`
reads `v.name`, not `npcName`; the game.js overheard-chat path has the
same shape. Coordinator decision (Steve can overrule): the drift line
should speak the USE-NAME — the scholar hears what the village says.
Fix commit c584775e7 (rebased from 3a6e4fec): drift lines + journal
speak the use-name (`npcName`) when one exists; KNOWLEDGE.md line
registers the overheard channel ("Overheard names are earned too") +
`knownNames` sharing scope. Prereg 0bbdffd99, proof test 00a3e6d22.
Adoption note: the coordinator ran a before-leg replay that reverted
the worktree's src/js/game.js + src/js/journal.js to pre-fix code,
then timed out before restoring; the /tmp backup was wiped by the VM
restart ~11:28Z. No data lost — the fix was committed at 3a6e4fec; the
finisher restored both files from the fix commit, re-anchored the
driver (FROZEN_BASE moved from prereg c5c048654 to fix commit
3a6e4fec), and re-ran the proof test 19/19 green.
Bars: B1 (PRIMARY — mechanism, proof test) PASS — 19/19 post-fix;
B3 (SENSITIVITY) PASS — pre-fix run 11 pass / 8 fail, verified by the
finisher on the base code; analyzer `--selftest` 15/15 PASS. Main
compare (recorded departteach-arm vs calledname-arm, preregged):
meta 8, line 7, struct 8, taught 5=5, drift 5=5, deaths 1509 -> 1533,
launches 51 -> 48. Control 1 (recorded vs before-leg replay, identical
gameSha 950901f3fdcc): identical 8/7/8 — the divergence reproduces on
identical code, so it is INSTRUMENTAL (substrate drift: brainSha
dc247673d540 -> f9cf9be25ede; plus the r278 per-seed isolation leak).
Control 2 (before vs arm, same driver, only the fix differs): meta 0,
line 0, struct 0, totals identical (deaths 1533=1533, launches 48=48,
taught 5=5, drift 5=5). 0 use-named drift lines in either corpus (no
file mentions "Ash") — B1 carried by the proof test alone, as
preregged. B2 adjudicated PASS on the valid within-driver comparison.
B6 (PILOT GATE): GO. Verdict: GO. Findings sim-findings.md lines 2742
(#2741 drift line) + 2743 (#2742 canon doc) marked [fixed] by the
finisher. Evidence: evidence/2026-11-24/sim-calledname-a.md (+ prereg,
3 analysis JSONs, 2x16 per-seed corpora).

## Wall (this round's judged corpora)
- Waitseat replay band: wins 7/8 on the seat legs (seat-only and
  seat+wait alike), national 7/8 ever, table 8/8, wave-5 1/8, median
  ~97d. This is a seat-policy band, not a substrate read — the seat
  legs win because the seat is taken when offered; the wait leg adds
  nothing to it.
- Calledname 16-seed departteach reuse band: wins 0/16, national 0/16
  (scaleRank regional on all 16), wave-5 unlocked 9/16, median 136.5d,
  deaths 1533 — identical before vs arm, as preregged for a voice-line
  change.
- The scale wall stands on the judged competent-substrate band:
  villages reach wave 5, survive, and never reach national or win.

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-24/perseed-waitseat-a/*.json' --metrics
national,table,wins,exiled --sweep-rows` — NOT APPLICABLE, no deviation
to chase, baseline NOT rolled: the checker refused recorder-corpus
input (all 24 rows carry anchorCommit), same as the 1115Z round. A
proper run would also be meaningless here: the baseline
scale-wall.json is a WINSEAT-regime baseline (national 12/16, table
16/16, wins 16/16) and this round's corpora are pre-seat competent
substrate (national 0, wins 0 on the judged band) — the baseline's own
_regime note warns the comparison fires a spurious LOUD 'wins
disappeared'.

## Gate
Full repo gate (`node scripts/check.js --quick`, run from
hidden_files/evidence/2026-11-24/run-gate-1215.sh): **339 passed, 5
failed in 704s**, exit 1. All 5 are the standing failure set, 0
attributable to this round: measurement-proof staleness pair
(test-measurement-proof-update.js, test-measurement-workflow.js —
retained neutrality proof vs current inputs), phone-frame stale receipt
(test-phone-frame-proof.js), and two 120s deed-attainment timeouts
under load (test-living-garden-deed-attainment.js 120.2s,
test-one-person-army-deed-attainment.js 120.0s). Gate adjudicated PASS.

## Infrastructure
- **VM restart ~11:28Z** (uptime 3 min at 11:31Z): /tmp wiped mid-run.
  The calledname fix backup was lost and UNNEEDED — the fix was
  committed on the branch (3a6e4fec) and recovered from there. Nothing
  else lost; no worker was running at the restart.
- **Registration stall, twice:** the 1215Z coordinator could not
  register sim-fightcap-recheck-a (cap 16/16, registry-lock jam); the
  finisher's own registration of sim-round-1215 (for this record)
  stuck in `worktree-register.sh`'s reap-first step under load, then
  in `git worktree add` — killed mid-add (branch created, partial
  checkout on disk, no registry entry), partial dir removed, the
  register script's python block re-run directly under `flock -w 300`
  (per the AGENTS.md reaper-race lesson, reap skipped with cap room) —
  registered cleanly as the 15th active tree.
- safe-commit index clobber: struck on the calledname adoption commit
  (36 files staged-deleted in the worktree index); repaired via
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`
  (`-r` required for directories); `git status --short` + `git diff
  HEAD` verified empty on completed runs. 0 clobber on the waitseat /
  holdrepeat merges (no safe-commit used there).
- No write flap observed this round (no new window since W28;
  watermark 2026-11-24T12:07:23Z).
- **First gate attempt died unlogged:** the gate was started detached
  (setsid nohup) from the same exec that ran the stalled
  worktree-register.sh; when the finisher SIGTERMed that exec, the kill
  tore down the whole process tree INCLUDING the setsid-detached gate
  (log froze at 14:23Z, 113/344 scripts, no GATE-EXIT). Lesson: never
  SIGTERM an exec that launched a detached gate — or re-check the gate
  process after any kill. The gate was re-run from the same script file
  and completed (see Gate).
- Master moved during the round (succession r280 68053e081); each arm
  rebased onto current master before its ff-only merge; each merge in
  its OWN exec call with the exit code verified before the next step.
- No lever rotation this round (two fixes + one concept-dead NO-GO —
  no new lever landed); rotation unchanged.

## Convergence
scale-onramp stays converging (NOT converged): waiting adds nothing on
seat-unready bands (concept dead — do not retry without a new angle);
the holdspeak stuck-record defect is fixed on measured evidence
(Eamon 31x -> 12x, worst run 13d -> 7d); the calledname drift line now
speaks the use-name and the overheard channel is canonically
documented. But villages on the judged substrate still reach wave 5,
survive, and never reach national or win. Next blanks, in order:
(1) sim-fightcap-recheck-a — the wave-4 fight (#2538/#2544), never
registered this round; (2) the wave-4 fight itself (#2538 — the
recommended next arm: launched parties must WIN wave-4 fights, fight
angle not plan memory). winnability-chain stays converging (untouched;
sibling loop B).

Merged bdc3801a0 (waitseat) + 233d6aceb + 003f86c9f (holdrepeat-fix) +
0bbdffd99 + 00a3e6d22 + c584775e7 + 6e4af0dbe (calledname); merged
locally, pending ship. Claim deleted; lock deleted. Evidence:
evidence/2026-11-24/sim-waitseat-a.md,
evidence/2026-11-24/sim-holdrepeat-fix-a.md,
evidence/2026-11-24/sim-calledname-a.md, this record.
