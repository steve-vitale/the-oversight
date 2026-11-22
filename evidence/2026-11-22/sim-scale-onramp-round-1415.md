# sim-scale-onramp-round-1415 — Loop A lever round (ADOPTION)

Run `fleshout-20261122T1415Z`, axis scale-onramp. Base master `3fafa9a7d`
(the gunloss-a evidence merge). The run timed out at its 7200s execution
cap during closeout — all three arms merged, but the round gate unrun, no
round record, telemetry / tracker / findings unrun, claim + lock left in
place. This adoption finished the closeout. All three arms are the
tracker's next blanks from the 0615Z review, in order: (1) the guarded
needWave copy (sim-needwave-b, the 0615Z follow-up); (2) the vanished-gun
trace (sim-gunloss-a, the cellcheck §4.3 attribution); (3) the adoption of
the 0615Z needwave-a branch itself (sim-needwave-a-adopt).

## Arm 1 — sim-needwave-a-adopt: ADOPT THE 0615Z needwave-a BRANCH (TEST-ONLY)

Evidence: `evidence/2026-11-22/sim-needwave-a.md` (0615Z, NO-GO on
det-gate). This arm is the 1415Z run's adoption of the branch the 0615Z
adoption left HELD — it is NOT a re-judgment and NOT a re-landing of the
lever.

- **The discrepancy, resolved.** The 0615Z adoption closed as a HANDOVER:
  needwave-a was NO-GO on the determinism gate (the UNGUARDED copy wipes
  a companion's set wave number — seed 107377, Mia's null wipes Jason's
  seeded wave 4 the day before his launch) and its game-code fix
  (`587ce525d`) was reverted zero-trace. The 1415Z round nevertheless
  merged needwave-a as `d313fcb5c`. That commit is TEST-ONLY: one file,
  `scripts/test-needwave-a.js` (8+/4−) — §B3 follows LAUNCHVOICE r268
  (the wave-4+ beat gate is gone by design; a companion-turned-holder
  now speaks), guard pins unchanged, 26/26 on the rebased tip. No game
  code re-landed; the NO-GO lever stays reverted.
- What landed from the 0615Z branch, under rebased hashes (the 0615Z
  adoption's pre-rebase hashes do NOT resolve as ancestors — rebase
  rewrote them; verified by per-file log): instrument `3be1ac1cd`,
  evidence `9637cedb3`, guard flip `76f8bf9ea` (rebased `512f86760` —
  the proof test flipped into a NO-GO revert guard, 26/26 on reverted
  code, §B2W wipe guard pins the null-holder wipe), §B3 adoption
  `d313fcb5c`, round record `5e02a9bf8` + handover correction
  `5e8001d2f`. The 0615Z NO-GO verdict stands unchanged; the guard
  test now pins the revert on master.
- Branch `sim-needwave-a`: verified DELETED by the adoption (all three
  arm branches — sim-needwave-a, sim-needwave-b, sim-gunloss-a — are
  gone; only the adoption branch `sim-winnability-round-1415` remains).

## Arm 2 — sim-needwave-b: GUARDED needWave COPY (GO)

Evidence: `evidence/2026-11-22/sim-needwave-b.md`. The 0615Z follow-up
arm, exactly as the 0615Z record named it: copy only when the leader's
wave number is set, never erase a companion's.

- Prereg `6bf3be04e` (frozen before any judged run; fresh band
  107391–107398, 150d, competent verbatim, gunlife substrate).
  Instrument: wipe-aware driver + analyzer (selftest 26/26) + proof
  tests (`test-needwave-b.js` 31/31, `test-needwave-a.js` 26/26 with
  deliberately updated pins), commit `ce18e29f0`.
- The lever (`054f525bc`, rebased `af4d7007f`): one guarded line per
  companion, three syncs per site, at BOTH sites — `src/js/win-plan.js`
  `launchParty` (dead in sims, parity) and `src/js/villager-brain.js`
  `vbrainExecuteDepart` (the live path: all 23 copies on this band came
  through it). Guard: `if (plan.needWave != null) cplan.needWave =
  plan.needWave;`. A set leader OVERWRITES a companion's set number
  (leader 3 + companion 4 → companion 3) — the chosen shape, not a
  wipe: the sync re-points the target unconditionally, so the wave
  number follows the target. Two such downgrades on the band, both
  re-upgraded the same day.
- **Verdict: GO — all eight frozen bars pass, judged twice.** First
  judgment on base `b199d55c8` (GO), re-judged on rebased base
  `1c11dbb14` (GO again, identical numbers except the beat rate, which
  master changed underneath — see below). Analysis
  `evidence/2026-11-22/needwave-b-analysis.json` (verdict GO, all 9
  bars true, det-gate pass); first judgment preserved as
  `needwave-b-analysis-b199d55c8.json`. Numbers verified from the
  analysis JSON by the adoption (not just the writeup): control 15
  launches, 7 null (0.47), 6 trio+ (0.40), beats 15/15, starvation 2,
  median survival 151d; armed 9 launches, 0 null (0.00), 8 trio+
  (0.89), beats 9/9, starvation 0, median 151d. Det-gate passes all 8
  seeds wipe-aware (bounds day 35–118); 23 companion copies, 0 wipes
  to null (19 fills from null, 2 upgrades, 2 downgrades).
- The lever is LIVE on master: unconditional game code, NOT env-gated,
  `[needs-eyes]` in the commit message. This is the first needWave
  change to ship — the 0615Z unguarded copy stays reverted and the
  revert guard pins that.
- Caveats (evidence §14, metric review — NOT re-scored): bar 5
  (departure-beat rate) no longer discriminates — on the first
  judgment's base it measured the lever's beat effect (0.40 → 1.00);
  on the rebased base master landed LAUNCHVOICE (r268), which deleted
  the beat's wave-4+ gate, so the bar reads 1.00 = 1.00, a pass that
  proves nothing about this lever. The launch total fell 15 → 9 and no
  bar turns on it: seed 107392 stopped launching entirely while
  surviving 81 days longer — a future prereg should consider a
  launch-count floor or an attempt-rate bar.
- Panel comparison (§15): decision review_required. Wins 0 → 0,
  national 0 → 0, deaths per run 88 → 95.75 (+7.75,
  regression_watch) — a longer-life denominator effect, not more dying
  per day (armed villages lived 766 total village-days vs 704;
  deaths per 100 days 67.0 → 64.3, starvation 2 → 0). The panel is the
  instrument; the frozen bars are the judge.
- Wall: wins 0 → 0, national 0 → 0, wave-5 reached 6 → 5 villages,
  wave-4 reached 8 → 8, median survival 151d = 151d, villages lost
  1 → 1. No movement toward the table on either leg. Table entry is
  not instrumented by this driver — recorded as not instrumented,
  never faked.
- In plain words: the guarded copy does what the unguarded copy was
  supposed to do, without doing the thing that killed it. On seed
  107391 the control leg is five silent null launches and one quad;
  the armed leg is four launches, all quads, all with a wave number,
  all announced — and each launch hands its wave number to the next
  launch's leader. The wall after this lever is the ATTEMPT rate, not
  the sync: 4 of 8 villages never attempt a wave-4+ departure in 150
  days on either leg (homebody holders, the forager dawn choke,
  targetless plans — carried from -a §6). A copy cannot fix a launch
  that is never attempted.

## Arm 3 — sim-gunloss-a: OMAR'S VANISHED GUN, TRACED (DIAG-GO)

Evidence: `evidence/2026-11-22/sim-gunloss-a.md`. Instrument-only arm
(no game-code behavior change). Finding #2650 follow-up (the cellcheck
§4.3 vanish).

- Prereg `70d01729b` (seed 107369 frozen bars). Instrument: recorder
  + driver + analyzer + proof test (42/42, analyzer selftest 20/20),
  commit `fd7491722`.
- **Verdict: DIAG-GO — the gun never vanished.** Analysis
  `evidence/2026-11-22/gunloss-a-analysis.json` (verdict DIAG-GO;
  bar1/bar2 true, bar3 ATTRIBUTED, bar5 true; 1,279 gunloss events).
  The exact call: `mantleBecome`, `src/js/villager-build.js`, day 134
  — the succession that made Omar the scholar the day the previous
  scholar died in the arena. It moved the searcaster to the new
  scholar's ranged weapon slot and one fusion cell to accessory slot 3;
  the second cell was destroyed by the transfer itself (the worn copy
  carries no `units`, so a 2-cell stack worn as one accessory collapses
  to 1). Net loss of the whole event: 0 guns, 1 cell.
- This OVERTURNS cellcheck-a §4.3's "succession refuted": its census
  counted scholar inventory only for cells and read the ranged slot off
  the wiped villager record, never the scholar's own worn slots. The
  gun and the cell were sitting on the new scholar in plain sight the
  whole time. Day 136 Omar died in the wild as the scholar and the gun
  + worn cell went onto his corpse; nobody took them (0 matching
  corpse-takes).
- The same pattern fires elsewhere in the run (day 84: another
  succession moved a searcaster + 1 cell the same way). This is how
  every succession carries a holder's worn gear.
- Instrument notes: the recorder first hung on its own install
  (`Game.getPerson` → `hydrateSeed` → RNG + `autoEquip` re-entrancy);
  fixed by reading `data.villagers` directly + a per-function
  re-entrancy guard. A recorder must never draw RNG or mint people.
  Attribution is nesting-aware now: the splice/reassign backstops name
  the function whose own lines moved the pieces (`mantleBecome`'s
  villager-build.js:648/672/701), not the outer `playerDeath` span.
- Next levers (filed, NOT landed — instrument-only arm): (1) the
  worn-stack collapse defect — `mantleBecome`'s worn copy drops
  `units` (finding #2698, open); (2) Omar's corpse (gun + cell, day
  136, never looted) — open thread. No further tracing needed on the
  day-134 loss.
- Wall numbers (re-run window, seed 107369, 150d death-aware): days
  145, village lost, maxWave 4, unlockedWave 4, standing 199, scale
  regional, won false. Single seed — a window, not a band verdict.

## Wall (arm legs)

| | needwave-b (ctl → arm) | gunloss-a (window) |
| --- | --- | --- |
| Wins | 0 → 0 | 0 |
| National | 0 → 0 | 0 |
| Table | not instrumented | not instrumented |
| Wave-5 reached | 6 → 5 | 0 |
| Wave-4 reached | 8 → 8 | 1 |
| Median survival | 151d = 151d | 145d (single seed) |
| Village-lost | 1 → 1 | 1 |

All seeds regional; the scale wall still binds everywhere. The
needWave copy is now fixed and shipped — the next wall is the launch
attempt rate, and the gun-supply chain's next question is the
worn-stack collapse + the corpse, not another cell count.

## Telemetry

`telemetry-check` against the scale-wall baseline
(`--allow-recorder-corpus`, metrics national,table,wins,exiled) on the
needwave-b arm corpus
(`evidence/2026-11-22/perseed-needwave-b-arm/*.json`, n=8) and the
gunloss corpus
(`evidence/2026-11-22/perseed-gunloss-a-diag/*.json`, n=1): exactly
the same 3 LOUD regime lines on both (national 12 -> 0, table 16 ->
0, wins 16 -> 0) — EXPLAINED, regime artifact (the baseline is the
winseat regime; these corpora are a pre-seat competent-policy
substrate where wins are structurally ~0), baseline NOT rolled.
Exiled quiet. Same artifact as 0615Z/0815Z/0215Z/1115Z.

## Gate

Serialized gate on the merged tip, run by the adoption from its worktree
via a detached script file (log
`hidden_files/check-quick-1415-adoption.log`), launched only after the
journey-deepening gate (pid 23381) finished — no two check.js ran
concurrently. **339 passed, 5 failed in 833s, 0 attributable** — exactly
the standing set: measurement-proof staleness pair
(`test-measurement-proof-update.js`, `test-measurement-workflow.js`),
phone-frame stale receipt (`test-phone-frame-proof.js`, 3 inner FAILs),
2 × deed-attainment 120s timeouts
(`test-living-garden-deed-attainment.js`,
`test-one-person-army-deed-attainment.js`). None touches this round's
files (evidence + instruments + one test file). The dead run's own gate
log (`hidden_files/check-quick-1415.log`) is a single partial line
(344 scripts, 5 F's visible) — it certified nothing; this adoption's
gate is the certification.

## Findings

The arms' workers already updated the findings file; the adoption
verified the entries (no new items filed by this adoption itself):
- #2650 (line 2672) UPDATED by gunloss-a: the §4.3 "vanished gun" is
  ATTRIBUTED to `mantleBecome` day 134 (gun → scholar ranged, 1 cell
  → acc3, 1 cell collapsed); OVERTURNS cellcheck-a §4.3's
  "succession refuted".
- #2692 (null-holder wipe) FIXED by needwave-b: the guarded copy
  landed — null-launch rate 0.47 → 0.00, trio+ 0.40 → 0.89, det-gate
  passes all 8 seeds wipe-aware, 23 copies, 0 wipes.
- #2693 (diffNeedWaves blind to null wipes) FIXED by needwave-b: the
  driver records every needWave change including wipes to null and
  includes the holder's own plan; analyzer selftest 26/26.
- #2698 (worn-stack collapse) FILED OPEN by gunloss-a: `mantleBecome`'s
  worn copy drops `units` (2-cell stack → 1 on succession); fix shape
  named (carry units, or stop wearing stacked consumables); Omar's
  corpse thread carried in the same entry.
- needwave-b filed NO new backlog items (evidence §7): the downgrade
  shape (2 rows, re-upgraded same day) is documented, not a defect;
  the fill-only variant is named if downgrades ever stick on launches.

## Flap / infrastructure

- The run timed out at its 7200s execution cap during closeout. The
  run's own flap note: a write-flap window ~16:47Z with index-clobber
  repairs, registry-lock serialization slow.
- Write flap during the adoption: a ~2-min window 16:47:16–16:48:18Z
  (10:47–10:48 CST), EPERM on write probes, cleared by 16:49:20Z on
  the same boot (063f9721) — reported to Steve the same morning; no
  flap window during the adoption's own closeout work. Writes probed
  before committing.
- Registry-lock serialization: the adoption's own worktree registration
  held the registry lock across a ~40-min checkout (two `git reset
  --hard` passes in D-state under load — the first checkout's index
  lock was removed by the adoption while its reset was still running,
  which killed the first attempt; the retry re-checked-out from scratch
  and completed, exit 0). Heartbeat retries failed on "registry lock
  held > 120s" throughout; the reaper skipped consecutive runs on the
  same held lock (live registrations, verified by the reaper workers;
  nothing removed, no action taken).
- Worktree damage at registration: the fresh worktree arrived with NO
  index file and a partial checkout (only 7 top-level entries;
  `src/`, `scripts/`, `index.html` missing). The adoption repaired it
  with `git read-tree HEAD` (index == HEAD, 0 diffs after) while the
  registration's own `git reset --hard` was still running — and removed
  a 0-byte index.lock that looked stale but was in fact held by that
  live reset process (the first `ps` grep did not match `reset`, so the
  holder was missed). The interference killed the first checkout
  attempt; the retry wiped the tree — including the adoption's first
  draft of this record, rewritten here from the adoption's own context.
  Lessons for the next registration: never remove an index.lock on a
  `ps` grep alone — match `reset` too, and check the lock's owner
  before touching it; and never write work into a worktree while its
  registration checkout is still running — a retry can wipe the tree.
- Master moved during the adoption: the batch ship loop bumped the
  version (`f5b6c71d1`, "Version bump 3fafa9a7d-20261122-173534", version
  files only, zero overlap with this record). The adoption branch was
  rebased onto the ship tip before the ff-only merge (see below).

## Commits

- sim-needwave-a-adopt: `d313fcb5c` (test-only §B3, by the run);
  0615Z branch content on master under rebased hashes (instrument
  `3be1ac1cd`, evidence `9637cedb3`, guard flip `76f8bf9ea`, record
  `5e02a9bf8` + handover `5e8001d2f`).
- sim-needwave-b: prereg `6bf3be04e`, instrument `ce18e29f0`, lever
  `054f525bc` (rebased `af4d7007f`), evidence `ea83b225e`.
- sim-gunloss-a: prereg `70d01729b`, instrument `fd7491722`, evidence
  `3fafa9a7d`.
- Round record: this commit (adoption branch, merged ff-only onto the
  ship tip — see closeout).

## Closeout

- Gate: serialized gate on the merged tip — 339 passed, 5 failed in
  833s, 0 attributable (standing set only; log
  `hidden_files/check-quick-1415-adoption.log`).
- Claim file `hidden_files/lever-claims/fleshout-20261122T1415Z.json`
  retired to .DEAD by this adoption; lock deleted LAST (run_id matched
  per-line, same call as the read).
- Worktree `sim-winnability-round-1415` released + removed, branch
  deleted; arm branches already deleted by the run (verified by the
  adoption); main tree clean at closeout.
- Tracker updated (this entry); findings verified (above).
