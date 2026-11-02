# Loop 2215Z coordinator evidence — scale-onramp round (run fleshout-20261102T2215Z)

## Pre-registration (this round)

- Axis: scale-onramp (topmost non-converged axis; no live fleshout claim at
  run start; sibling Loop B live on food-economy from 22:33Z, NOT touched).
- Arms (claim written before any sims, run_id fleshout-20261102T2215Z):
  - sim-fightoutrec-landing: land the 1715Z fightoutcome-recorder branch.
  - sim-heraldband-pilot: re-screened fight-positive herald-chain band,
    per staged prereg hidden_files/sim-heraldband-pilot-prereg-2018.md
    with the 2115Z anchor correction (anchor = tip of the tree the sims
    actually ran on).
- Standing directive: rotation file reads 3 but rotation stays suspended
  by the directive for this run (not advanced). Scale-onramp is NOT
  converged at closeout — the directive is not lifted by this run.
- Master at run start: 61e019a85. Master moved under this run by sibling
  lanes (build-outing merge 76d8b68fa, journey endgame r110 e54aeb922,
  batch ship version bump 2efd4d4bd) — zero file overlap with either arm
  except the version bump (version files only).

## Arm sim-fightoutrec-landing — LANDED

- Branch sim-fightoutrec at 66be62122 (5 commits, base 82b9d8649).
  Fresh rebase onto current master at rebase time (76d8b68fa, the
  build-outing merge) applied clean, 5/5 picks, no conflicts.
- Arm-file diff vs 66be62122 over the recorder, driver, analyzer, proof
  test, and both evidence md files: EMPTY (rebase preserved content).
- Proof scripts/test-fightoutcome-a.js on the rebased tip: 40/40.
- Merged --ff-only to master 19ad05107, ancestor-verified in the same
  call; worktree removed, branch deleted. The recorder is LANDED.
- Registry note: the first worktree-register.sh attempt failed on the
  flap (checkout write to .git/worktrees/sim-fightoutrec/locked EPERM);
  the worktree was then created and registered by the equivalent manual
  steps (git worktree add + atomic registry entry, read back verified).
  At release time the registry entry had vanished (sibling registry
  rewrite race — a new build-bloodtracker tree appeared in the same
  window), so worktree-release.sh reported "not registered"; release was
  moot (worktree dir already removed, branch deleted, nothing left for
  the reaper). No ref surgery, no force.
- With this landing, BOTH 1715Z arms are now on master (npcdeadconf
  6a7a6e454, verified by 1825Z, plus fightoutrec 19ad05107 here).

## Pending evidences committed

- hidden_files/coord-1715-pending-evidence.md committed as
  evidence/2026-11-02/sim-scale-onramp-round-1715.md with a landing
  addendum (npcdeadconf 6a7a6e454 + fightoutrec 19ad05107).
- hidden_files/coord-1825-pending-evidence.md committed as
  evidence/2026-11-02/sim-scale-onramp-round-1825.md with a landing
  addendum. Judged sims and verdicts were NOT re-run for either file.
- Commit 62e251b69 (2 files, 341 insertions). Safe-commit index clobber
  (staged-deletion variant) hit this commit; repaired with
  `git update-index --add --cacheinfo` from HEAD blobs; final state
  verified clean (status empty, diff HEAD empty, diff cached empty,
  hash-object matches HEAD blob for both files).

## sim-findings.md restore — DONE

- Live sim-findings.md was 0 bytes since the 18:48Z flap truncation.
  Restored by copy-then-rename from the verified backup
  sim-findings.md.bak-20261031T1830Z (1,317,730 bytes, 1651 lines,
  sha256 6179b4dd9e7e11f55f268b4167236a92120646c78eec31f1009c65b9f8844fa4;
  restore-copy.py reported dst sha match=True), then appended the
  1917 appendix with the recorder line updated from rebased-not-merged
  to LANDED (19ad05107). Final file: 1660 lines before this run's
  findings, 1664 lines after. The 1917 gap line still stands: items
  appended 2026-10-31T1830Z–2026-11-02T18:48Z beyond the re-applied batch
  are NOT reconstructed here.
- B-lane items were NOT touched: coord-1730 pending evidence, orphan
  branch sim-cband-b, and the C-band arm belong to Loop B.

## Arm sim-heraldband-pilot — SCREEN TOO THIN (worker report, verified)

- Worker worktree sim-heraldband, base 62e251b69 (post-landing master).
  Prereg commit 23db5b70 BEFORE any judged sim; result commit 55122313.
  Rebased twice by the coordinator onto current master (e54aeb922, then
  the ship bump 2efd4d4bd); arm-file diff vs 55122313 EMPTY both times;
  proof scripts/test-heraldband-pilot-20261102.js 45/45 on the final
  rebased tip. Merged --ff-only to master d8ce88852, ancestor-verified
  in the same call; worktree released, removed, branch deleted.
  (First merge attempt failed ff-only because the ship bump landed in
  the window — no merge was performed, no force, rebase-then-merge.)
- Band: fresh seeds 98101–98108, closecommit stack verbatim, env
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1 HERALD=1, mode herald, 180d death-aware cap, one process
  per seed. Actual sim anchor: prereg-commit tip (differs from base by
  exactly the prereg file — zero trajectory-relevant code change).
- Analyzer (per-seed JSON only): problems = 0 (missing 0, orphan 0,
  duplicates 0, unresolved 0; 115 fought TB rows, 643 field fights).
  Fight-positive yield = 1 (98102 only) < GO threshold 2.
  Verdict: SCREEN TOO THIN — screen usable, confirm round NOT justified
  on this band. NOT a verdict on the herald chain.
- Per-seed: 98101 no-call, village-lost 95d; 98102 call d66, fled fight
  d68, village-lost 89d; 98103/98104/98106/98108 no-call, won (over-other)
  90/90/90/101d; 98105 no-call, village-lost 62d; 98107 call d89,
  still-pending-at-cap (herald still present d90, game won d90).
  Refused-only final class: 0 seeds. Departed-silent-or-pending: 0
  seeds (class defined but unexercised; separates cleanly from
  still-pending on 98107).
- Sense-read (98102 d68 Herald fight): PASS on row/transcript match
  and coalition meaning, with two blemishes — "No path there." x112
  (allies repeatedly unable to reach the Herald) and the player ending
  untouched at 100/100 while 6/12 allies die. Herald 700 HP beaten to
  44 HP, fled; outcome blades 12 match "12 allies join you"; muster
  hunger lines make feeding the coalition part of the cost.
- Wall (8 pilot seeds, honestly limited): national 0/8, won 5/8,
  wave-4 unlocks 5/8, wave-5 unlocks 0/8, median survival 90d
  (62, 89, 90, 90, 90, 90, 95, 101). The table-latch flag reads 1 on all
  8 and is NOT "sat at the table" (latch = tableWaiting OR tableDone,
  including village-lost runs) — not cited as table reach. Runs ended
  at 62–101d, well short of the 180d cap, which is itself why 6/8 seeds
  never called at all.
- Findings appended to sim-findings.md by the coordinator (4 items):
  titan-fight pathing (x112), untouched bearer, herald gate accounting
  (refused days 68/69/83 after a 12-blade fled fight), screen thinness
  as run-length-driven (widen band / spare 98201–98208 / condition on
  call-age survival).

## Telemetry deviation check

Prescribed invocation on the landed heraldband corpus (per-seed-only
glob fo-*.json): REFUSED, exit class recorder-corpus refusal — "all 8
--current rows carry top-level anchorCommit, so they are sweep recorder
rows, not runs." No LOUD lines. Baseline NOT rolled; no
--update-baseline, no --allow-recorder-corpus. (The worker's first
invocation with a broad glob swept in analysis.json and printed
spurious LOUD lines; the corrected per-seed glob refuses cleanly —
the spurious lines do NOT stand.)

## Metric review

- Departed-silent-or-pending vs still-pending-at-cap separates cleanly
  on this band (98107 is unambiguously still-pending); the departed
  class stays defined but unexercised.
- Yield >= 2 gate held (yield 1 correctly blocks confirm), but
  thinness here is run-length as much as call rarity. Proposal for the
  NEXT run only: widen the band AND report yield per called seed
  alongside yield per band seed.
- The table-latch flag must not be read as table reach (see Wall above)
  — future arms should cite tableDone, not the latch.

## Infrastructure

- EPERM flap still flapping per-call through this run: registry atomic
  write failed once (reaper), .git worktree admin write failed once
  (registration), then both cleared. No ref surgery was forced at any
  point; every failed write was retried or routed around with a
  verified equivalent (manual register + readback; rebase-then-merge).
- Safe-commit index clobber hit the coordinator evidence commit and
  both worker commits (staged-deletion variant) — repaired via
  HEAD-blob cacheinfo each time, commits verified correct.
- check.js --quick NOT re-run: zero src/js in either arm, standing
  280/7 pre-existing profile recorded by sibling runs this cycle.
- Sibling lanes active throughout (build, journey, Loop B from 22:33Z)
  — nothing of theirs touched; master moved 3 times under this run,
  all handled by rebase-onto-current-tip discipline.

## Village assessment (plain words)

The village can now honestly record its fights — the fight-outcome
recorder is finally on the main line, and the pending 1715Z/1825Z
stories are filed where later runs can find them. The herald screen
itself came back thin: on eight fresh villages, only one ever fought
its titan, and most villages simply ended before they ever called one
— they lived about 90 days against a 180-day window. The one fight
that did happen reads like a real coalition battle with a real price
(six of twelve allies dead, the coalition hungry), marred by allies
who could not find a path to the monster and a hero who walked away
unscratched. Nothing here moves the scale wall: no village reached
national standing, no wave-5 monster was unlocked or fought.

scale-onramp stays converging (NOT converged): national + lesser table
are demonstrated on the closecommit stack (1825Z corrected figures:
national 1/12, lesser wins 5/12), but the full seat is still unwon and
wave 5 still unfought in normal play. Next blanks, in order: (1) a
widened herald screen (spare band 98201–98208 on file, yield per called
seed reported alongside yield per band seed); (2) full-seat reach: why
a national village (97339) still takes the lesser seat; (3) win-funnel
variety: feared/mercy is the only proven path/final — other paths,
finals, and non-self takers unproven; (4) heralddepart departure-
telegraph design question (Steve-call territory if it touches feel);
(5) npcdeadfilter follow-ups: live-sim transcript of the
accepted-before-death refusal line, debate-notices-death design
question; (6) STEVE-CALL: committed blade as bearer (options a–d,
unchanged); (7) stores-draw upkeep proposal (Steve-call, unchanged).
food-economy untouched (sibling Loop B lane).

Claim retired to .DEAD; lock deleted.
Merged locally, pending ship (fightoutrec landing + heraldband pilot;
coordinator evidences 1715/1825 + this round).
