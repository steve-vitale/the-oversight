# Journey crisis r201 — RUN NOTE (Lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this closeout writes 7
(succession next). Base: master 49d5c4a32. Lock:
playtest-loop-2.lock run_id loop2-20261114T115724Z (own). Worktree slug:
journey2-crisis. Prereg: evidence/2026-11-14/journey-crisis-r201-prereg.md
(committed with this note). Panel evidence (per-seed JSONs, logs,
analyses): goal hidden_files/evidence/2026-11-14/journey-crisis-r201-*.

## Pre-flight / infrastructure (LOUD)

- Main tree clean (0 dirty), disk 40%.
- `git pull --ff-only`: "Already up to date" at pull time (master
  e7c6861bf); a sibling landed 49d5c4a32 mid-preflight and the second
  pull picked it up — the worktree branches from 49d5c4a32.
- `worktree-reap.sh`: exit 0, 13/16 active, removed nothing. 4 LOUD
  lines, all other owners' uncommitted trees (sim-siegedialog-a,
  sim-inffight-ab, sim-transplant15c52-a, journey-scale): never
  auto-removing, not mine to touch.
- STALE-LOCK RECOVERY: a lock from run loop2-20261114T105601Z
  (2026-11-14T10:56:01Z) was present at run start with NO registered
  tree and NO heartbeat for that run_id anywhere in REGISTRY.json —
  dead by the overlap-guard rule, deleted, own lock created.
- REGISTRATION RECOVERY (loud, diagnosed, safe): the first
  `worktree-register.sh` failed — "a branch named 'journey2-crisis'
  already exists". Diagnosis: (a) the branch name had been REUSED by a
  transplant118 worker after r192's release; its tip (b5ae72cd4) is
  fully merged into master (verified `merge-base --is-ancestor`, and
  the commits are also reachable from master/main/build-medicduty-h/
  journey-scale), so deleting the pointer loses nothing. (b) The path
  ~/workspace/worktrees/journey2-crisis held a 5.6 GB / 48,793-file
  copy of evidence/ only (no .git, no src — not a worktree), all
  files created ~11:55Z today, every one of them byte-present in the
  main tree's committed evidence/ (file-list diff: 0 files unique to
  the leftover; sample md5 identical; not hardlinks). No live process
  owned it (no journey/crisis procs running). Moved to recoverable
  trash (trash_id 20261114-120822-54a7dacdbebd4225bf30313c9d38fef0,
  expires 2026-12-14) instead of deleting, branch deleted with
  `git branch -d`, re-registration succeeded from 49d5c4a32.
  Open question for the loop: what copied 5.6 GB of evidence into
  that path at 11:55Z — recorded here, not chased further this run.
- TIMED OUT at the 2h cron deadline: the run's coordinator was killed
  with the gate at 149/340 (7 failures sampled, log ephemeral) and the
  C3b fix uncommitted. Adoption coordinator closed it out: re-ran the
  full gate to completion, committed, rebased, merged (see Gate and
  Landing below). The gate's first full re-run was itself killed by a
  VM replacement at ~27.5 min with all 340 scripts complete (330 pass,
  10 fail) but the summary unprinted; a second full re-run produced
  the adjudicated result. The run's hbloop died with the VM
  replacement and was restarted by the adoption coordinator.

## Panel (binding, prereg)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14441–14445,
  sequential. Pilot 14441–14443 first, expanded to 14444–14445 (the
  instrument held: smoke green, no instrumentErrors, stranger
  counters populating).
- Driver: r192 driver verbatim except r201 filenames/paths/seeds,
  ORIGINS map keys (all five seeds keyed — r192's map silently fell
  back to St. Louis for 14432–14435), EVID path 2026-11-14, DAYS 150.
  RUINROAD env OFF (arm parked — cumulative 0/301 is a proven
  constraint; the supply question lives with the medicine build
  brief).

## Village assessment (plain words)

Five villages, all hit hard. Four died (d81–d128, game-over); one
(14445) held to the 150-day horizon. Raids fired on every seed
(5–8 each); gorge nights totaled 80 across the panel (4–35 per
seed). Sorties fought 17 times. Villages bent the same way r192's
did — fought, moved on, starved, died in the wild — but one village
survived the horizon, which r192's panel never did. Deaths were
monsters, the wild, the arena, the night, wounds that wouldn't close,
thirst and starvation — no siege-mechanic failure, no softlock (0
softlock seeds). The medicine picture is unchanged and stark: 4 ruin
searches across the panel, 0 medicine found, 0 pharmacy days; the
healer's ability did all the curing (64 ability cures, 0 medicine
cures). No alien kills on any seed (stranger channel VACUOUS again).

## Verdicts (against the prereg)

- D1 DRY CENSUS — GO: 39 transcripts, 0 dry lines, deflect_q 0.
  r192's five ledger-aware pool fixes hold in the wild.
- Q6 RE-JUDGE — RETIRED: gorge-after-clear (id-matched) 0/5, the
  sixth consecutive zero panel. Per the prereg, Q6 retires to
  descriptive-only with a METRIC-BROKEN classification. The pattern
  does not fire under this definition on ordinary seeds.
- C1 (bend, not break) — GO: every game-over has a named cause that
  is NOT a siege-mechanic failure; 0 softlock seeds.
- C2 (episodes fire + gates hold) — GO: raids on all seeds; fought
  resolutions present; D1 snapshots 19/19, delayed >= 3 attempts
  19/19; D5 deltaBad empty; D3 drift unknown 0.
- C2b (linger-conditional gorge/sortie) — GO: every
  boundary-firable case judged on gorge+sorties, all 5 seeds.
- C3 (people check) — GO: all 39 driven transcripts read in full;
  fabricHits 0; conversations meet the meaning bar. No voiceLine
  prefix stacking >= 3, no double confession, no naming-stance
  wobble sighting.
- C3b RAFAEL RE-CONFIRM — REGRESSION FOUND, FIXED IN-RUN: one
  "settled" line fired on a sitting that shared no real beat with
  the favor — seed 14445 d10, Ella: the favor was still 'asked' and
  the close line declared the wound care settled. Root cause: the
  thread is labeled by the favor it names, but the threadLog
  attributes every beat of a want-driven sitting to `want`
  whatever the subject, so the real-beat gate passed on beats that
  never touched the favor. Fix (C3b, this landing): a favor want is
  settled only when the favor itself is done (fulfilled / thanked);
  a promise is not a settlement, and a broken or lapsed favor is
  not one either. Anchor corrected in a postfix pass: the close line
  keys on the LEDGER thread (which outlives the sitting that planted
  it), so the gate reads the villager's favor ledger and matches
  the thread label against that favor's label — a pending favor
  never blocks an unrelated want thread. Proof test
  scripts/test-journey-crisis-r201-settled-favor-20261114.js 9/9
  (seeds 4242, 7, 42). Postfix verification on seed 14445: exactly
  one transcript/JSON difference (the d10 close line withheld),
  days and end identical.
- WRAP-CHECK — GO: 39 transcripts, 39 marked, 0 unmarked.
- C7b — reported: buried list + corpse-cause counts per seed in the
  analysis (famine/disease/wound/thirst).
- A1–A6 stranger counters — DESCRIPTIVE: 0 kills, 0 silent, 0
  cooldown violations on all 5 seeds; panel verdict VACUOUS.
- S1–S5 SUPPLY — NOT RUN (RUINROAD parked). Cumulative stays 0/301
  for the arm; this panel adds 4 searches, 0 medicine. The supply
  question is owned by the medicine build brief.
- R181 fight-1: okSorties 12, brokeAfterFight1 5, cleared 7;
  multiMonsterCleared 5/9. R186 eligibility: encounter-eligible
  days 0 on all seeds (the channel never opens under home-based
  play — carried).

## Reachable / fun / winnable

- Reachable YES: raids, gorge nights, sorties, favors, mourning all
  fire on ordinary seeds; the crisis leg's content is all reachable.
- Fun YES: villages fight, move on, talk like people (39 transcripts,
  0 fabrications); the one horizon survivor shows the leg can bend
  without breaking.
- Winnable NO (this leg): 4/5 game-over, 0/5 national — the crisis
  leg is not a win path on its own, and was never meant to be.

## Gate

`node scripts/check.js --quick` in the worktree, re-run to completion by
the adoption coordinator (the run's own gate was killed at 149/340 by the
2h cron timeout; its log was ephemeral). First full re-run: killed by a
VM replacement at ~27.5 min with all 340 scripts complete (330 pass, 10
fail) but the summary unprinted — the progress line is preserved in
evidence/2026-11-14/journey-crisis-r201-gate-quick.log. Second full
re-run: 334 passed, 6 failed in 816s
(evidence/2026-11-14/journey-crisis-r201-gate-quick-retry.log).
Adjudication — 0 attributable:
- scripts/godpath/test-measurement-proof-update.js — proof staleness
  (standing set; any src/js change stales the neutrality proof inputs;
  round 16 refresh owed, not a defect of this fix).
- scripts/godpath/test-measurement-workflow.js — proof staleness
  (standing set; same cause).
- scripts/godpath/test-phone-frame-proof.js — receipt staleness
  (standing set; receipt predates the rageprecheck + r191 + fusionoffer
  landings; refresh needs a browser run, out of scope here).
- scripts/godpath/test-living-garden-deed-attainment.js — 120s load
  timeout in the gate; green standalone (exit 0, 252s on a quiet box;
  first standalone attempt hit the 400s cap while still progressing
  through seeds, no failure).
- scripts/godpath/test-one-person-army-deed-attainment.js — 120s load
  timeout in the gate; green standalone (exit 0).
- scripts/godpath/test-occupation-panels.js — 120s load timeout in the
  gate; green standalone (25 passed, 0 failed).
Standalone logs: evidence/2026-11-14/journey-crisis-r201-standalone-*.log.
Establishment-r20-fixes and mobile-combat-cadence did not fail. Gate GO.

## Landing

Adoption closeout by the Lane B closeout coordinator (run
loop2-20261114T115724Z timed out at the 2h cron deadline).
- Gate: 334/340 passed, 6 failed, 0 attributable (see Gate above).
- Commit 924bc616e (worktree) rebased onto master fbd6d9ce9
  (proofrefresh-b16 tip) as f1871e37b — arm files byte-identical
  across the rebase; proof test 9/9 re-run green on the rebased tip.
- Merged ff-only to master: HEAD f1871e37b. Worktree released,
  branch deleted. Main tree clean.
- Rotation-b advanced 6→7 (succession next).
- Lock playtest-loop-2.lock deleted at closeout.

## Metric review

- Q6 RETIRED to descriptive-only (METRIC-BROKEN): six consecutive
  zero panels under the id-matched definition. The bar as defined
  does not describe anything that happens in live play. Any future
  gorge-after-clear question needs a new definition, not a new panel
  on this one.
- Dialogue-only fixes are NOT trajectory-neutral while voiceLine
  draws RNG (carried from r192): the r192 fixes spend no RNG on the
  common path; pre/post trajectory comparisons stay descriptive,
  never fix-effect claims. The C3b fix likewise spends no RNG — its
  postfix check (seed 14445, one line withheld, days/end identical)
  is a regression check, not a fix-effect claim.
- For supply-gated fixes, the unit test is the proof and the panel
  is a regression check only (carried).
- Telemetry baseline succession.json stores per-seed means while
  telemetry-check.js sums (carried from r192) — verify the crisis
  baseline's units before rolling anything. This run's telemetry
  was quiet vs the crisis baseline; baseline NOT rolled.

## Remaining gaps

- Proof refresh round 16 owed (2 keys stale: fusionoffer + r200
  changes; more after this landing — conversation.js changed).
- Telemetry baseline re-base owed (carried).
- Lane decision owed on daily-play accept handling (carried).
- Held scale-attr tree remains unlanded (carried, 4+ runs).
- Open loop question: what copied 5.6 GB of evidence into
  ~/workspace/worktrees/journey2-crisis at ~11:55Z (see
  Registration Recovery above).
