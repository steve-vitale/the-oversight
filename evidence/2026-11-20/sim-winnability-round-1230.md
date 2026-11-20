# sim-winnability-round-1230 — Loop B lever round (axis winnability chain)

Run: fleshout-loop-b-20261120T1230Z (Loop B, 2026-11-20 12:31–~14:00Z).
Axis: winnability chain — wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat.
Base at run start: master 683c9a6e5. Master moved once under the run:
Loop A 1015Z adoption landed as 57b085a44 (scale-onramp evidence +
scripts only, zero src/js). Nothing pushed, nothing bumped, no live
verification — merged nothing this round, pending ship does not apply:
the judged arm stays HELD, unmerged.

## Arm 1 — sim-deadsuppress-b: NO-GO (guardrail) — HELD, unmerged

Branch `sim-deadsuppress-b`, tip `3e7cf93d0` (built on `ab54a27d7`,
master 407168f1d era; NOT rebased onto current master — the next run
adopts by porting/rebasing at adoption time). Worktree
`~/workspace/worktrees/sim-deadsuppress-b` left registered and
heartbeated for adoption; the branch is the durable record (prereg,
verdict, corpora, panel, proofs all live there, not on master).

The lever: same-day suppression for the dead-target departure gate
(finding #2621 — a gate-blocked villager re-departed targetless the
same day) plus the silent-dissolve fireside beat, exactly as frozen in
the prereg on the branch. The coordinator verified the verdict
independently from the corpora and re-ran the proofs — it does not
rest on the worker's report alone.

**Judged legs** (band 106081–106088, 150d death-aware, competent
verbatim, policy sha 150229eda010, substrate SENSEEXPED=1 PARTYSIZE4=1
VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1):

| | control | armed |
|---|---|---|
| launches (wave-4+ target) | 6 | 4 |
| dead-target launches | 2 | **0** |
| live-target launches | 4 | 4 |
| median survival (gameDays) | 150.5d | **147.5d** |
| villages survived | 5/8 | **4/8** |
| starvation deaths | 2 | 1 |
| wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |
| wave 5 reached | 4/8 | 5/8 |
| wave 4 reached | 8/8 | 8/8 |
| standing ≥ 200 | 4/8 | 5/8 |

- **Control reproduction — EXACT.** 6 launches, dead 2/6, the 106084
  d136/d141 herald re-launch pair present, gate snapshots 0 missing /
  0 mismatched, instrument errors 0, files 8/8. The gate code is inert
  with the flag off, as designed.
- **Primary bar — MET.** Dead-target share 2/6 → 0/4 armed (launches
  4, exactly at the floor of 4).
- **Suppression bar — MET.** Six gate blocks on the armed leg, zero
  targetless re-departures on any block day. The #2621 retry hole is
  closed on the block day.
- **Secondary — MET.** The 106084 re-launch pair did not recur (0
  judged launches on 106084 armed); `deadTargetHolds` fired 6 times.
- **Guardrail — MISS (two of three).** Median 150.5d → 147.5d and
  survived 5/8 → 4/8; starvation improves 2 → 1 but does not rescue
  the other two. The flip is one village: 106081 survives on control,
  dies day 141 armed. Per §14 metric binding the run is NO-GO on the
  guardrail. The suppression recovered about half of the held gate
  run's survival loss (held: 143.5d / 3-8; this run: 147.5d / 4-8)
  but not all of it.
- **Proofs (re-run by the coordinator on the branch tip):** gate
  test 99/99 (73 ported + 26 new §F suppression checks), diag test
  22/22.
- **Balanced panel:** `deadsuppress-b-panel.md`, decision
  review_required; regression_watch on village deaths per 100 days
  (+0.26) and community loss (0.375 → 0.5 — the same 106081 flip).
- **Telemetry check:** `telemetry-check.js` refuses recorder corpora
  by design; with `--allow-recorder-corpus` it prints LOUD lines
  (national/table/wins "disappeared") on the CONTROL leg identically
  — a shape artifact (recorder files carry no national/table/wins
  counts; both legs read 0), not an armed-leg regression.

**The village, in plain words.** The village the gate was built for,
106084, is better: on control it sent hunters after a herald Rafael
had already killed, twice more; armed, Brian is stopped at the door
on day 69 with a word from the fire, held there the rest of the day,
and the village reaches wave 5 and standing 245 instead of stalling
at wave 4 / 199. 106087 is better too (standing 390 → 465). But
106081 pays: two hunters stopped on day 119, the village's path
bends, and 22 days later six people die in one day when a phoenix
link collapses — pantry down to 613 kcal from 3307 on control.
Nothing starves; the deaths are a link event, not hunger. Whether
the day-119 blocks caused the collapse or merely re-rolled the dice
is not provable from one seed. That is the reshuffle cost the
guardrail prices, and on this band it costs more than it saves. The
other five villages never meet the gate and live exactly the same
lives on both legs.

**Blanks filled.** The same-day retry hole (#2621) is closed in code
and proven. The silent dissolve now has its fireside beat
(live-verified on a real loaded game; the corpus transcript cannot
show it — the recorder's `SAY_RE` filter drops the line, see the arm
evidence metric review 7). The dead-target launch share is 0 with
the launch count intact (4, at the floor).

**Blanks documented (not fixed).** Cross-day targetless re-launch —
new finding #2626, appended to `hidden_files/sim-findings.md`. The
suppression closes the hole on the block day, but the dissolved plan
never re-seeds unless its holder fights a wave-3+ beast, and the dawn
pass keeps committing `party_launch` for the targetless plan: 12
post-block targetless launches on the armed leg. Next lever: don't
commit `party_launch` for a targetless plan (or re-seed the plan
before committing). Also a same-day retarget edge is noted as a
design note in the arm evidence (not built).

**Disposition.** Guardrail NO-GO stays HELD, unmerged, per the
deadgate-replace precedent (same chain, same guardrail kind — its
evidence likewise lives only on its branch). No rebase, no merge.
Full verdict: `evidence/2026-11-20/sim-deadsuppress-b.md` (on the
held branch).

## Arm 2 — sim-strikeband-b: STOOD DOWN, nothing built

Registration failed twice: attempt 1 hit the 280s timeout, killed
mid-checkout, left an empty directory plus a branch; retry hit the
1150s timeout (exit 124), checkout reached 4.3G / 54 entries before
being killed. A reaper then removed the partial directory; the
coordinator deleted the leftover branch. Root cause: `git worktree
add` checkout takes 15–19+ minutes under load, versus ~3 minutes for
a plain checkout, plus registry-lock contention. Lesson for the next
run: register the tree FIRST, before spawning worker 1, to avoid CPU
contention; partial directories are reaper-vulnerable. The damage
question (#2605) stays the topmost winnability blank after
deadsuppress. The strike-band search plus counterplay-priced
decomposition (#2620) is still owed.

## Scale-wall numbers (this round)

Wins 0, national 0, table 0 on both legs. Wave-4 reached 8/8 both
legs; wave-5 4/8 control → 5/8 armed. Standing-199 stall: 3/8 on
both legs (control 106082/106084/106085; armed 106082/106085/106088).
Median survival 150.5d → 147.5d. The wall has not moved: nothing
reaches national or the table.

## Infrastructure

- **No write flap this run.** Watchdog ALL-OK continuously
  (12:02Z through the closeout); probes pass. Flap log:
  `hidden_files/flap-watch.log`.
- **Machine restart ~13:20Z.** Killed the armed leg at 2/8 seeds
  (driver process gone, uptime 1 min on recovery). No refused
  writes; the two completed corpus files verified intact (flag 1,
  policy sha 150229eda010). Resumed the remaining 6 seeds in one
  call; exit 0, 8/8 files. The armed leg ran in two processes, same
  driver, same env, same seeds — per-seed files are independent, and
  the control reproduction + identical outcomes on the five no-block
  seeds confirm no divergence from the split. The flap watchdog
  restarted after the boot (pid 4800, boot 823612be, ALL-OK).
- **Registry-lock contention:** `worktree-reap.sh` skipped twice
  (lock held by another reaper); the registry lock was FREE when
  tested ~12:44Z. Registry had 15 trees, cap 16.
- **Sibling runs, not touched:** Loop A 1015Z adoption closed and
  landed 57b085a44 during this run; Loop A 1315Z (axis
  scale-onramp) live with two workers from ~13:41Z (searcaster /
  contest-prize and launch gear-up / ranged areas); Lane B social-life
  r256 adoption also live. A chat-side adoption agent for the 1030Z
  Loop B round saw this run's lock and stood down without writing.
- **Pre-flight passed:** main tree clean at run start; disk use 49%.

## Convergence state

Winnability chain stays **converging (NOT converged)**. The
dead-target gate + suppression are built and proven (proof 99/99)
but fail the guardrail and stay HELD; the damage question is still
unanswered; nothing reaches national or the table. Next blanks, in
order: (1) the damage question (#2605) — strike-band search plus
counterplay-priced decomposition (#2620); (2) the cross-day
targetless re-launch (#2626) — don't commit `party_launch` for a
targetless plan, judged on the same frozen bars plus a post-block
targetless-launch count of 0 across the whole run; (3) the third-ally
sense question (#2619); (4) the standing-199 stall. Scale-onramp
untouched; sibling Loop A 1315Z closed separately.

## Evidence

- This round record: `evidence/2026-11-20/sim-winnability-round-1230.md`
- Arm evidence (on the held branch `sim-deadsuppress-b`,
  tip 3e7cf93d0): `evidence/2026-11-20/sim-deadsuppress-b.md`,
  `sim-deadsuppress-b-prereg.md`, `deadsuppress-b-panel.md`,
  corpora `perseed-deadsuppress-b-control/` + `-armed/` (8/8 each),
  analyses `deadsuppress-b-control-analysis.json` +
  `-armed-analysis.json`
- Finding #2626: `hidden_files/sim-findings.md`
- Claim retired to .DEAD; lock deleted.
