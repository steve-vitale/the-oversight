# Loop A scale-onramp round — run fleshout-20261124T1115Z

Run fleshout-20261124T1115Z, Loop A, axis scale-onramp. Two coordinator-run
DIAG/measurement arms, both complete; NO worker trees registered this run
(registry lock jam + VM restart — see Infrastructure). No game-code change
in either arm. Base master c4d4fd01c (unchanged during the run — no merges
this run; master did not move under the coordinator).

## Pre-flight
- Main tree clean (`git status --short` empty at start). Disk 50%.
- `worktree-reap.sh`: SKIPPED every attempt — registry lock held
  continuously (see Infrastructure). Consecutive-skip count reached 10
  (ALERT threshold 3). No cleanup ran this run.
- Lock + claim written at start (run_id fleshout-20261124T1115Z).
  Sibling Loop B live on winnability-chain all run (1030Z claim:
  sim-worngun-reseat-b, sim-bloodcluster-b, sim-w5lateface-b,
  sim-linkform-b) — NOT touched.

## Arm 1 — sim-gateavoid-b8-a (DIAG + design call, complete)
Finding #2733 (gate-avoid-plan-exists B8, the remaining formation wall).
Reuse of the retarget band 109411–109418, both legs, 16 seeds.
Instrument `scripts/analyze-gateavoid-b8-a.js` (reuses the frozen
analyzer; own rest-of-run trace). Selftest 8/8, analyzer selftest 38/38.
Result: 72 B8 meetings, ALL wave-4+; 0/72 ever lead to the plan
targeting or launching on the met beast; every gate reason 'outmatched'
(72/72); later launches aim low (34 wave-3, 18 targetless, only 5
wave-4+); only 1 met beast ever killed by its holder, via the player
channel. Design call (coordinator, Steve can overrule): NO-GO on
building gate-set-target — the closest analog (retarget) already failed
on kills (19 vs 24, deaths up), and the gate already judged these
parties outmatched. The wall behind B8 is the wave-4 fight itself
(finding #2538). Finding #2733 ANSWERED in sim-findings.md.
Evidence: evidence/2026-11-24/sim-gateavoid-b8-a.md (+ prereg,
analysis JSON).

## Arm 2 — sim-holdrepeat-a (measurement, complete)
0915Z round's blank #4 (holdspeak repetition follow-up). Reuse of all
holdspeak after-leg corpora, 24 seeds. Instrument
`scripts/analyze-holdrepeat-a.js`. Selftest 9/9; Eamon 31x / Elif 21x
reproduce exactly. Result: DEFECT, narrow — Eamon (109430) repeats one
line 31x over 36 days, 13 consecutive days, 1 distinct text (trips the
frozen R3 rule); 39 of 40 holders stay cadence (median max-repeats 2).
Fix arm filed as finding #2743: day-count-varied hold wording, keeping
the reason identical. Evidence:
evidence/2026-11-24/sim-holdrepeat-a.md (+ prereg, analysis JSON).

## Arms NOT run this round (queued with briefs — next round takes them)
- **sim-waitseat-a** (tracker blank #5: whether waiting matters on
  bands where the seat stays unready longer). Replay band 107383–
  107390 (launchfield-refreeze: 4/8 ended at standing 199, seat
  unready) with policies `scripts/policies/tableseat.js` (wait) vs
  `scripts/policies/tableseat-nowait.js`, 150d, competent; verify the
  band's seat-unready shape from the existing corpora in the prereg
  first, screen a fresh band only if it does not show it. Primary:
  national/table reach + seat-taken; pre-register a "matters" bar
  (>= 2 seeds on national reach, or >= 10 days on median seat-ready
  day, or >= 2 villages on survival) before running.
- **sim-calledname-a** (findings #2741 + #2742). #2741: the drift line
  speaks the true name ("Ashley") while the beat says the use-name
  ("Ash") — `revealName` (game.js:17806) reads `v.name`, not `npcName`;
  the game.js:19504 overheard-chat path has the same shape.
  Coordinator decision (Steve can overrule): the drift line should
  speak the USE-NAME — the scholar hears what the village says, and
  `displayName` already renders "Ash" everywhere else; the true-name
  leak is a channel quirk, not a designed reveal. Scope the fix to the
  overheard/drift path if `revealName` is shared with other callers
  (intro/gesture/finder/System-arrival); proof-test each caller. Pilot
  8 seeds before/after (voice-line change: wall metrics zero-delta;
  the proof is line content). #2742: add the KNOWLEDGE.md line
  registering the overheard channel + `knownNames` sharing scope.
  [needs-eyes] on the lever commit (feel/voice).
- **sim-holdrepeat-fix-a** (finding #2743): day-count-varied hold
  wording. Pilot on the same 24-seed holdspeak corpora; bar = worst
  holder under 25x with no >= 10-day run; reason text identical.
- **Recommended next axis arm — the wave-4 fight** (finding #2538's
  open next step): launched parties must WIN wave-4 fights. Take the
  fight angle (party composition, gear, ability use in wave-4 fights),
  not plan memory. Note: Loop B's bloodcluster arm (vetpair #1) works
  a neighboring slice — coordinate, do not duplicate.

## Wall (this round's judged corpora — reused, reported never judged)
- Retarget band: wins 0, national 0, table 0, wave-5 2/1 seeds,
  wave-4 8/8, median survival 150d, villages lost 3/4, deaths 727/773.
- Holdspeak confirm: wins 0, national 0, wave-5 8/16, median 130.5d.
- The scale wall stands: villages reach wave 5, survive, and never
  reach national or win.

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-24/perseed-*' --metrics national,table,wins,exiled`
— LOUD (one line), INVESTIGATED, explained, baseline NOT rolled: the
--current glob matched per-seed DIRECTORIES and the checker tried to
read one as a file (`EISDIR ... perseed-accordanswer-b`) — an
input-shape error, not a metric deviation. A proper run would also be
meaningless here: the baseline scale-wall.json is a WINSEAT-regime
baseline (national 12/16, table 16/16, wins 16/16) and this round's
corpora are pre-seat competent substrate (national 0, wins 0) — the
baseline's own _regime note warns that comparison fires a spurious
LOUD 'wins disappeared'. The checker also refuses recorder-corpus
input without --allow-recorder-corpus. No deviation to chase; no
baseline roll.

## Infrastructure
- **VM restart ~11:28Z** (uptime 3 min at 11:31Z, was 1:52): /tmp wiped
  mid-run. The gateavoid script + analysis (written to /tmp) were lost
  and REGENERATED from scratch — the script rewritten directly into
  the repo, the analysis re-run (deterministic: T6 byte-identical
  replays; counts reproduce the retarget evidence exactly). The
  holdrepeat files (written 11:29Z, after the boot) survived. Lock,
  claim, prereg/evidence drafts (all under ~/workspace) survived.
  Nothing else lost; no worker was running at the restart.
- **Registry lock jam, all run:** the lock was held continuously from
  run start — Loop B's sim-linkform-b registration (11:11–11:20Z),
  then playtest-loop journey2-4 registration (11:12Z, still unregistered
  at last check — tree exists on disk, no registry entry, process gone;
  its registration appears to have FAILED, which is the playtest loop's
  to recover, not mine), then a reaper run (reaper-skip count 9 → 10).
  Consequence: `worktree-reap.sh` never ran (non-blocking SKIP every
  time), and NO worker tree could be registered — register.sh blocks
  indefinitely on `flock -x 200` with no timeout, so no registration
  was attempted. This run's arms were therefore coordinator-run DIAGs
  on existing corpora (no lock needed). The reaper ALERT (10
  consecutive skips) and the lock-serialization-by-slow-checkout shape
  (each registration holds the lock 10–20 min under load) are the
  standing infrastructure items for the next run.
- safe-commit index clobber: 0 on the arm commit (e2233b33) —
  `git status --short` empty after the commit, no repair needed.
- No write flap observed this run (write probes OK at ~11:33Z).
- Rotation left at 7 (no lever rotation this run — DIAG-only round).

## Convergence
scale-onramp stays converging (NOT converged): the B8 formation wall
is answered NO-GO as a lever (plans forget meetings, but pointing
outmatched parties at wave-4 beasts is the wrong direction), and the
holdspeak repetition is a narrow, fixable defect (1/40 holders) — but
villages still reach wave 5, survive, and never reach national or win.
Next blanks, in order: (1) the wave-4 fight (#2538 — recommended next
arm); (2) waiting on seat-unready bands (blank #5, sim-waitseat-a);
(3) calledName #2741 + overheard KNOWLEDGE.md #2742
(sim-calledname-a); (4) holdrepeat fix #2743. winnability-chain stays
converging (untouched; sibling loop B).

Merged e2233b33 (arm files) + [ROUND-RECORD-COMMIT]; merged locally,
pending ship. Claim deleted; lock deleted. Evidence: evidence/2026-11-24/sim-gateavoid-b8-a.md,
evidence/2026-11-24/sim-holdrepeat-a.md, this record.
