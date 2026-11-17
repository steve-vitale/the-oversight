# Journey endgame r230 — Lane B leg 4 (2026-11-16)

Leg 4 (endgame). Rotation-b read 4 at run start (r229 succession landed,
rotation 7->4). This run plays leg 4 and writes 5 at closeout after a
verified landing.

Substrate: master e60b8241e exactly (batch-ship version bump over
947613d28; game-code substrate 947613d28). Tooling commit b64e48b79
(prereg + probe/analyzer clones).

## Run-start incidents (infrastructure, not measurement)

- Lock: none present at run start. This run's lock written
  2026-11-16T23:56:58Z (run_id journey2-endgame-20261116-2355Z).
- Main tree: `git status --short` 0 lines, disk 45% (fail line 85%).
- `git pull` "Already up to date" at 23:56Z (master 947613d28).
- Reaper ran at run start: removed nothing; 12/16 active, all dirty
  (never auto-removed).
- Registration slow (~15 min): the register script's internal reap runs
  first (~11 min on this box), then `git worktree add` checks out 100k+
  files on a loaded box (load avg ~7.5). No stale-branch issue: branch
  journey2-endgame did not exist (deleted at r225 release), so `-b`
  created it fresh at master. The worktree existed with files on disk
  byte-identical to HEAD while the checkout was still in flight
  (index.lock held, index empty) — the mid-checkout `git status`
  readings (100k "deleted") were artifacts, not damage.
- Master MOVED during registration: 947613d28 -> e60b8241e (batch-ship
  version bump, 00:12Z — index.html/sw.js hash regeneration +
  build.js/version.json stamps only, zero game-code change, verified by
  git show --stat). Worktree rebased onto e60b8241e via
  `git checkout -B journey2-endgame master` (fresh branch, zero commits
  of mine) — clean, 0 lines.
- Heartbeat via hbloop (pid 72638, every 5 min); hbwatch safety net
  (/tmp/r230-hbwatch.sh, pid 80048) kills the hbloop when the panel
  chain exits, so a later adoption run sees a stale heartbeat.
- safe-commit.sh index clobber struck on the tooling commit (the 3
  committed files showed staged-as-deleted, the known class): repaired
  with the `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info` recipe; commit b64e48b79 verified intact, `git diff
  HEAD` empty after repair.

## Panel verdicts

### Pass A-live (matched 89701–89705, CAPSTONE/BUYOUT off) — PRIMARY GO (ALL GO)

- Lesser 4/5, full 0/5, village-lost 1/5 (89705). ROAD-TALLY earned 0 sat 0.
- **M23b GATE-OK TALLY 1/5** — 89702@d65 (r225: 1/5, 89704@d82).
  Different seed, same tally: the gate opens on one matched seed per
  round, and which seed rotates with trajectories.
- **89702 (waves) FACED WAVE 5: w5max 4** — editor d57, timeslot d63,
  cancellation d99, spoiler d101 — uw 5, peakVet 2, standing 617,
  release snap d52 (2 living veterans, rd5 ready, 9 armored / 12 armed
  / 27 tricks). Gate ok d65. Seat lesser: the capstone leg is disabled
  on pass A by design, and the seat's binding was the capstone deed,
  never delivered.
- **89704 (forcedrift) FACED WAVE 5 again: w5max 1** (rerun d89), uw 5,
  peakVet 2, standing 496 — but the gate did NOT go ok this round
  (r225: ok d82, w5max 3). Trajectory re-roll, not a lever change.
- 89701 sat d105 lesser, w5max 0, peakVet 1, standing 199 (r225: d95).
  89703 sat d102 lesser, w5max 0, peakVet 0, standing 199 (r225: d97,
  peakVet 1).
- **89705 VILLAGE LOST d59 (scattering)**: 6 deaths by d58 — Alex
  Schmitz d19 sickness, Diana Osei d36 Reunion, Ethan d38 monster, Zoe
  Adams d46 Gavel, Sam d57 starvation, Sanne Bakker d58 wound that
  wouldn't close. The village bled out fighting, with one starvation
  death; r225's same seed sat d91 lesser. A survival note, not a defect.
- M3b GO (peak >=2: 1/4) and M4 GO (wave5-or-full: 1/4) — flipped from
  r225's NO-GO on wave-5 facing (89702 OPEN), not on full seats.
- Starvation: Wanda Xi d15 on 89701 AGAIN — the fourth consecutive
  panel occurrence on this seed/day (r225 A + C, r230 A + C): a
  deterministic early trajectory, not a new event. Also Sofia Chen d90
  + Mara d104 (89701, late, near the sitting), Ursula Xu d76 (89703),
  Sam d57 (89705).
- All bindings GO (full text in
  evidence/2026-11-16/journey-endgame-r230-analyze-a.log). M2b
  attribution 4/5 named (one day-window-only causal — the known
  fallback shape, not the r171 gap). Longest fight 50 turns (89704
  rerun) — the 159-turn Algorithm fight did NOT recur (Q7 clean).
  fastW4: [] on every seed — the diedInFight gap did NOT recur (Q8
  clean). M11: 3/4 at-199, 1 at-200+ (89702 at 617).

### Pass C-live (matched, CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1) — PRIMARY GO (ALL GO)

- Lesser 4/5, full **1/5 — 89704 FULL d90** (feast_embassy delivered
  d84, priced full 1/1). REVERSES r225's 0/5 (r219: 3/5). The buyout
  road converts again.
- **M23b GATE-OK TALLY 1/5** — 89704@d84/DELIVERED (r225 pass C: 0/5).
- M25c buyout-early GO: 5/5 bought early (89701 d39, 89702 d20,
  89703 d42, 89704 d37, 89705 d25; ~8,200 kcal spent each). 89701's d38
  attempt failed first ("You need to be at the haven to buy the
  bundle") and bought d39 at haven — the haven gate works as designed.
- 89701 lesser d90 (uw 5, w5max 0, standing 417, alive 7), 89702 lesser
  d90 (uw 5, w5max 1, standing 412, alive 8), 89703 lesser d112 (uw 4,
  standing 199, alive 7), 89705 lesser d90 (uw 4, standing 199, alive
  2 at the sitting — the village nearly died out and still sat).
- Starvation: Wanda Xi d15 on 89701 again (see pass A). No other
  starvation deaths on pass C.
- M23-capstone GO 1/1 delivered, priced full. M24/M24b vacuous.
  Full text in evidence/2026-11-16/journey-endgame-r230-analyze-c.log.

### Pass C-wide (fresh 89750–89757, buyout on) — WIDE-VERDICT GO (M25c + purity)

- Lesser 8/8, lost 0/8, full 0/8. M25c GO: 8/8 bought early (89750
  d37, 89751 d46, 89752 d55, 89753 d45, 89754 d44, 89755 d39, 89756 d41,
  89757 d28; ~8,000–8,260 kcal spent each). CORPUS-PURITY GO 8/8.
- **89751 FACED WAVE 5: w5max 2, uw 5, standing 320, peakVet 2** —
  the second consecutive C-wide panel with a fresh-band wave-5 facing
  (r225: 89746). Sat lesser d92; the gate never went ok on any C-wide
  seed (M23b 0/8), so no full seat converted. 89754 unlocked wave 5
  (uw 5, standing 331) without facing a wave-5 monster (w5max 0).
- All other C-wide seeds: lesser, w5max 0, uw 4, standing 199
  (89750 d100, 89752 d92, 89753 d94, 89755 d90, 89756 d101, 89757 d97).
- Starvation: Gianna Stevens d9 on 89751 only (pre-buyout; the d46
  buyout did not cause it). No village lost on the fresh band (r225:
  1/8 lost).

### Smoke (89706, pass-A policy, full horizon)

Sat d99 lesser, uw 4, w5max 0, alive 8. Harness + timing fine.

## F5 wild check — vacuous again

0 hits for all three settled-favor variant lines across all r230
transcripts so far (pass A + pass C + smoke): the old singleton, "It's
taken care of, I swear…", and "Honestly? It's done…". The branch has
now not fired in the wild in either r225 or r230 — the proof test
stands as the evidence. Open question for the next endgame run: is the
settled-favor branch reachable at all in panel play, or does it need a
targeted driver? No fix filed (nothing is broken; the branch is quiet).

## People check (Q6) — the finales read as people

- **89702 pass A (relay, light):** "Teach it to let go." The System
  says NEED — "It stops. It needs. It said NEED." Named kills: Saiful
  put down The Ugly Beast d99, Meera put down Loud-Eyes d63. The audit
  is honest: global standing, 4 wave-5 fought, and the ONLY remaining
  gap is the capstone deed. The wave-5 bar voice is live: "put weapons
  in hands (5 of 6 armed); blood your fighters (1 of 2 veterans)."
- **89704 pass C (relay, dark — FULL seat):** the pod-opening again,
  now with a full seat behind it: "Poran's brother is in that row…
  Yaa's grandfather is in that row… The village doesn't cheer. The
  village has never been this quiet." Named kills: Everett put down
  Big-Eyes d66, Poran put down Big Ugly d66. Audit: "A full seat.
  global standing, every wave faced, the deeds complete. The table
  rises when you enter." (+4 feast-bundle bonus named in the ladder
  line — the bundle's +4 landed in the counted points.)
- **89701 pass A (witness):** "On day 86, Norman put down The Big
  Beast." The trial of the judges, the precedent set, the closing
  sting ("the oversight is the looking away").
- **Funeral-mend fired + voiced (Q10):** Sofia's, Agnese's, and Zoe's
  funeral feasts — "Trust mended — the -8 bought back with grain."
- **Doubled-quotes fix holds:** zero `SYSTEM: ""` lines in all
  transcripts checked.

## Village assessment (plain words)

Five matched villages, two roads. On the plain road four sat at the
table and took the lesser seat, and one village died young and bloody
before day 60 — six deaths, four of them in fights, and the village
scattered. On the buyout road all five sat, and one — 89704, the
forced-drift village — took the full seat: it faced wave 5, its gate
opened on day 84, the feast embassy delivered, and the table rose. On
eight fresh villages the same story repeated at a smaller scale: all
eight sat lesser, one faced wave 5, none reached the gate. The wall has
moved since last round: two of five matched villages faced wave 5 on
the plain road (one of them for the first time), and the gate opened on
one seed per road — but the deed is still the wall for everyone else.
The villages that sit lesser are not weak: they hold global standing
and hundreds of points; they are one delivered deed short of the full
seat.

## Reachable / fun / winnable

- Reachable: yes — every surviving seed reached the table, the audit,
  and a finale; the buyout road fired 5/5 matched.
- Fun: yes — the finales land (see people check), the funeral-mend
  voice works, fights resolve with real anatomy.
- Winnable: **yes, on the buyout road, one seed in five — and the shape
  of the wall has moved.** The first full seat on the matched band
  since r219's 3/5: 89704 converted through the gate + capstone
  delivery. Wave-5 facing is no longer the rare event (2/5 matched on
  pass A, 1/8 fresh on C-wide); the binding wall is now the deed gate
  going ok AND a capstone delivering. The plain road still converts 0/5
  by design (capstone disabled). No fresh-band seed converted (0/8),
  and the gate never opened on the fresh band.

## Telemetry

`telemetry-check.js` vs `telemetry-baselines/endgame.json`
(metrics national, table, wins, exiled), run at adoption on the
per-seed corpora `evidence/2026-11-16/perseed-endgame-r230/*.json`:
**quiet — 5 files, 4 metrics, no large deviations.** Baseline NOT
rolled (no LOUD line). Pass-A sums vs the r188 baseline: uw 22
(4+5+4+5+4), won 4/5, peakVet 6 (baseline uw 22, won 4, peakVet 8)
— in-band.

## Metric review (§14)

- M23b adopted in r219; tally this run: pass A 1/5 (89702@d65), pass C
  1/5 (89704@d84/DELIVERED). The tally moves with trajectories — it is
  an observation, not a verdict.
- M3b/M4 flipped GO on wave-5 facing (89702 OPEN), not on full seats
  — the metric review notes the flip's meaning: the bars measure the
  door opening, and the door opened on 2/5 matched seeds this round.
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held in r225; verify
  against the r230 analyzer output at closeout).
- M2c adoptedRefs (HOLD). CORPUS-PURITY (HOLD — GO on every pass so
  far). M25c buyout-early (HOLD — GO 5/5 matched). M24b (HOLD —
  vacuous on every pass so far).
- Pass C's PRIMARY GO after r225's NO-GO is a trajectory re-roll
  resolving toward conversion, not a metric failure — no metric
  revision proposed.

## Gate

Adoption re-run (the worker's gate was killed at 42 dots by the
timeout): `node scripts/check.js --quick` in the worktree,
log `evidence/2026-11-16/journey-endgame-r230-gate.log` —
**329 passed, 11 failed in 1443s, 0 attributable.**

- 6 exact-120s timeouts, all PASS standalone: living-garden,
  occupation-panels (25/25), one-person-army, capable-bot (42/42),
  table-endings (61/61). trust-observer-neutrality crashes at load
  (line 16 child-spawn map, bare `Error`) — verified IDENTICAL on
  master (main tree, ed251c74c): pre-existing, not attributable.
- 5 standing failures: measurement-proof-update +
  measurement-workflow (staleness pair), phone-frame-proof (stale
  receipt), ladder-bundle (standing control failure: "200 monster
  turns WITHOUT delivery fire the ambient raid — fires 0"),
  measurement-cache-flags (0/4 standalone twice here AND 0/4 on
  master — pre-existing on this loaded box, matches the Nov 12
  load-artifact class; this run changes no game code, so nothing
  here can have caused it).
- Standing profile matches r225 (334/6) and r229 (329/11) modulo
  the load-artifact rotation. Gate GO for adoption.

## Blanks / fix items

- None filed. The F5 branch is quiet in the wild for a second panel —
  a reachability question for the next endgame run, not a defect. The
  89705 d59 village loss is a village-assessment note, not a defect.
  Next endgame run watches: (1) does M23b go ok again on the buyout
  road, or does the 1/5 repeat; (2) does the F5 settled-favor branch
  fire in the wild; (3) does a wave-5-facing seed convert to a full
  seat on the plain road (capstone leg off — no, the plain road cannot
  convert by design; the watch is whether a second buyout seed
  converts); (4) does a fresh-band seed take a full seat.

## Merge line

Merged locally by adoption (main session), pending ship.
Rotation-b 4->5. Lock `playtest-loop-2.lock`
(run `journey2-endgame-20261116-2355Z`) deleted at closeout after
run_id verification. Adoption notes: the worker timed out before
closeout — the gate was killed mid-run (42 dots) and re-run by the
adoption (329/11, 0 attributable); the evidence commit never
landed (safe-commit 'aborted') and was made by the adoption;
telemetry quiet. No game code changed in this run (panel +
assessment only); the branch is evidence + tooling.
