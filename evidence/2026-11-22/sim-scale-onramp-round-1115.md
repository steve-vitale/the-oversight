# sim-scale-onramp-round-1115 — Loop A lever round

Run `fleshout-20261122T1115Z`, axis scale-onramp. Base `d2aedf6e6` (the
0815Z adoption record); master at closeout `be0cfca40` (the leadgate
merge — this record's commit follows it).

Two arms ran; a third was deferred. Both arms are the tracker's next
blanks, in order: (1) the wave-4+ lead question (gunlife-a GO, #2667
answered); (2) the vanish-tiling tracer fix + deterministic re-analysis
on the 107321–107328 corpus (finding line 2675). The third blank (cell
supply / re-arming diagnosis, #2650 follow-up) was DEFERRED to the next
Loop A run: its registration was killed 12:07Z because the Loop B
register held the registry lock for its ~25-min checkout and the
cellcheck checkout would have spawned its worker ~12:50Z, too late to
finish this round. It stays the top remaining blank; the claim was
updated to two arms at 12:07Z.

## Arm 1 — sim-leadgate-a: WHO LEADS WAVE-4+ PARTIES (DIAG-GO)

Finding #2667 follow-up. Evidence: `evidence/2026-11-22/sim-leadgate-a.md`.

- Prereg `88c9d12c3` (fresh band 107359–107366, 150d, competent
  verbatim, gunlife substrate). Instrument: driver +
  `scripts/analyze-leadgate-a.js` + proof test `scripts/test-leadgate-a.js`
  (selftest 21/21, test 33/33; killlootbundle proofs 12/12 + 17/17
  re-green on the rebased base).
- **Verdict: DIAG-GO — there is NO lead-selection rule, and that IS the
  answer.** The lead of a wave-4+ party is the win-plan HOLDER by
  construction (`winPlanDepart` launches the holder's own plan; nothing
  in the holder pick, the companion pick, or the companion ranking
  mentions the gun, ranged weapons, or combat skill). A gun holder leads
  only by holding a wave-4+ plan of their own — and on this band they
  almost never do: **1 of 9 gun holders ever held a wave-4+ plan**
  (katarina_novak, 24 days; launched once, six days BEFORE the gun
  arrived day 135). The other 8 held one on 0 of 202 combined gun-days.
  Three measured links: (a) plans seed only from a personal wave-3+
  face, and a `hunt`-stage plan can NEVER retarget — hannah_kim and
  zoe_adams froze targetless in `hunt` by riding as companions on
  days ~12–14, and all 8 of their later wave-3/4/5 seeds bounced;
  (b) the companion sync copies target but NOT `needWave`
  (`launchParty`, win-plan.js:1313) — 22/33 launches were led by a
  null-needWave holder and ALL went out as pairs (mean 1.95, 0 trios)
  vs 11/11 trio+ for needWave-set holders (mean 3.82), and the
  departure beat stays silent on the null half; (c) the gun never
  enters the pick (`findCompanion` / `companionScore` /
  `extraCompanionScan` — a holder is at best tier-2 armed companion;
  7 rides as first companion, 0 leads). The gun DOES fire when its
  holder leads (2 of 3 gun-led fights fired, 68 and 65 dmg).
- Next lever (named, not built — diag arm): copy `needWave` in the
  companion plan sync (one-line class); second: let a `hunt`-stage plan
  retarget on a higher-wave seed.
- Coverage 100% both legs (33/33 launches, 146/146 fights attributed;
  5 grants, 0 unaccounted). Instrument found a real bug before
  judgment: the v4fights push read a block-scoped `const v` inside the
  volley try — every wave-4+ fight threw `v is not defined` (leg-1
  corpus discarded, both legs killed, driver fixed `let v` at wrap
  scope, regression check in the proof test, full band re-run fresh).
- Merge: `be0cfca40` (rebased onto `186feb935`, 4/4 clean, no quirk;
  proofs re-run green on the rebased tip 33/33 + 21/21; analysis
  re-run byte-identical by the coordinator; ff-only exit 0). Worktree
  released done-merged, branch deleted. Verified an ancestor of HEAD.
- Findings filed: #2667 follow-up ANSWERED; [open] companion sync
  drops needWave (party size + beat silence); [open] the profile flip
  (wave-3 plans seed onto rangers, wave-4 onto foragers); [open] one
  solo wave-4+ launch.
- Wall: wins 0/8, national 0/8, wave-5 4/8, wave-4 8/8, median survival
  150d, villages lost 3/8, deaths 827, starvation 0 recorded.

## Arm 2 — sim-vanishtile-a: VANISH-TILING FIX + DETERMINISTIC RE-ANALYSIS (GO)

Finding line 2675. Evidence: `evidence/2026-11-22/sim-vanishtile-a.md`.

- Prereg `49907461e`; tracer fix `626bcfcb1`; NO new band — deterministic
  re-analysis on the frozen gunlife corpus
  `evidence/2026-11-21/perseed-gunlife-a-ctl/` (anchor `01ff4956f` on
  all 8 files, verified before the re-analysis).
- **Verdict: GO on instrument + tiling — 8/8 grants traced; attribution
  PROVEN.** The terminal `vanished` state range closes the tiling (the
  vanish grant's rows now tile 105–150, `rowsComplete` false→true);
  the 7 previously-traced grants reproduce with mechanisms
  byte-identical (only diff: additive `vanishedDays: 0`). Attribution
  PROVEN by elimination: the corpse entry leaves the census on day 105
  (present 72–104), world total 2→1, zero searcaster corpse-takes, a new
  corpse registered day 105, and the cap cull (corpses.js ~248–253) is
  the only path that removes a corpse from the world list (single
  splice in all of src/js; burial/butchering only flag). Caveat, stated
  in the evidence: the direct live-list-length reading is not in this
  corpus — the proof is by elimination, not a direct count. The
  gunlife-a verdict is NOT re-scored (stands at 7/8 GO).
- Selftest 36/36 (was 25/25 — rowsComplete assertions on fixture 7 +
  new mid-run-vanish fixture 9), test-gunlife-a 11/11. Coordinator
  re-ran both (36/36, 11/11) and re-ran the analysis: byte-identical
  to the committed output.
- Merge: `999e1df97` (rebased onto `1b297b431`, 3/3 clean, no quirk;
  proofs re-green on the rebased tip; ff-only exit 0). Worktree
  released done-merged, branch deleted. Verified an ancestor of HEAD.
- Findings filed: [fixed] vanish-tiling; [answered] vanished gun was a
  corpse-cap cull; [open] the cull has no event (no telemetry — next
  step: a cull tele event or a live corpse-count census).
- Wall (re-read from the re-analysis): identical to gunlife-a — wins
  0/8, national 0/8, wave-5 4/8, wave-4 8/8, median 150d, 921 deaths.

## Wall (arm legs)

| | leadgate | vanishtile (re-analysis) |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National | 0/8 | 0/8 |
| Table | not instrumented | not instrumented |
| Wave-5 reached | 4/8 | 4/8 |
| Wave-4 reached | 8/8 | 8/8 |
| Median survival | 150d | 150d |
| Village-lost | 3/8 | 3/8 |

All seeds regional; the scale wall still binds everywhere. The lead
question is answered one level up from the gun — the next lever is the
needWave copy, not a gun change.

## Telemetry

`telemetry-check` ran against the scale-wall baseline
(`--allow-recorder-corpus`, metrics national,table,wins,exiled) on the
leadgate per-seed corpus
(`evidence/2026-11-22/perseed-leadgate-a-ctl/*.json`): the same 3 LOUD
regime lines as 0815Z/0215Z (national 12 -> 0, table 16 -> 0, wins 16
-> 0) — EXPLAINED, regime artifact (the baseline is the winseat
regime; this corpus is a pre-seat competent-policy substrate where
wins are structurally ~0; the baseline's own note says this comparison
fires a spurious LOUD), baseline NOT rolled. Exiled quiet. Vanishtile
has no new per-seed corpus (deterministic re-analysis of the gunlife
corpus, already telemetry-checked in 0815Z) — no telemetry input,
recorded. Note: the first telemetry invocation passed the corpus
directory instead of a `*.json` glob and failed with EISDIR; the glob
form is the correct one.

## Gate

`node scripts/check.js --quick` on the merged tip `be0cfca40` (log
`hidden_files/check-quick-1115.log`, run in the main tree, serialized
after the sibling r267 gate cleared): **339 passed, 5 failed in 700s,
0 attributable.** All 5 are exactly the standing set, identical to
0815Z: test-measurement-proof-update.js + test-measurement-workflow.js
(the measurement-proof staleness pair), test-phone-frame-proof.js
(stale receipt), test-living-garden-deed-attainment.js +
test-one-person-army-deed-attainment.js (120s timeouts under load).
The first launch attempt 12:39Z was killed seconds in: a sibling r267
gate (pid 41580, cache /tmp/jest-cache-r267-gate) was still running —
the pre-launch check had only verified its parent pid was gone, not
the node process itself. Relaunched 12:53Z after it exited; the
second launch's setsid detached process died instantly with an empty
log, so the gate was re-run as a foreground backgrounded exec
(session proc_db76b8798bd3), which completed normally.

## Flap / restart

- Machine restart ~11:31Z (uptime 1 min at 11:32Z) killed the
  registration chain mid-second-register: the sim-vanishtile-a tree
  was left half-checked-out (branch at 87b2122f3, 0 src/js files,
  unregistered). Recovered by removing the broken tree + branch and
  re-registering fresh; sim-cellcheck-a never started. Write probe OK
  immediately after the restart; no flap window observed during the
  run's work. The leadgate worker hit one write-flap blip (leg-2 log
  redirect failed `No such file or directory`, relaunched with the log
  pre-created; no judged numbers from the failed launch).
- Registry-lock serialization: the Loop B register held the lock for
  its ~25-min checkout; my vanishtile register waited behind it, and
  one heartbeat attempt failed on `registry lock held > 120s` (retry
  later). The lock is a whole-script hold, so parallel registers
  serialize for the full checkout duration — that is what pushed the
  cellcheck spawn past the feasible window.

## Lock / claim

Claim file `hidden_files/lever-claims/fleshout-20261122T1115Z.json`
(arms leadgate/vanishtile, axis scale-onramp, base `d2aedf6e6`,
cellcheck deferred 12:07Z) deleted by the coordinator at closeout.
Lock `hidden_files/fleshout-loop.lock` (run_id
`fleshout-20261122T1115Z`, created 2026-11-22T11:15:00Z) deleted LAST
at closeout, in the same exec call as its read, run_id matched
per-line with `grep -qx`. Rotation index 6 -> 7 written at closeout.

## Closeout mechanics (for the record)

- Master moved three times during the run: `d2aedf6e6` -> `87b2122f3`
  (Loop B sim-hpgate-b merge) -> `1b297b431` (journey-scale r250) ->
  `186feb935` (Loop B 0930Z adoption record). Both arms rebased onto
  the current master before merging (vanishtile 3/3, leadgate 4/4,
  both clean, no stop-at-pick quirk); scope verified each time (no
  overlap with either arm's files; the only src/ change in the ranges
  was journey's convo-wants.js dialogue +44).
- Index clobber struck on the vanishtile arm's safe-commits (twice);
  repaired with the `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe; no clobber on leadgate.
- Seed bands: leadgate 107359–107366, verified fresh (0 hits across
  evidence/*/sim-*-prereg.md and sim-*.md); the first-choice bands
  107329–107344 collided with Loop B hpgate-b's probe bands
  (107331–107338, 107341–107348, named in its prereg) and 107351–107358
  are hpgate probe bands too. Cellcheck's band 107367–107374 was
  verified fresh (0 hits) but never spent — it stays free for the next
  run's cellcheck arm.
- The 49-seed kill-loot searcaster arrival band stays unrun (deferred
  with rationale in the claim: the fixture already judged the volley
  and killrate sized the rate at ~4.6%/seed).

## Commits

- sim-vanishtile-a: prereg `2fcc3363f` (rebased), tracer fix
  `c7f4b9a46` (rebased), evidence `999e1df97` (merge tip).
- sim-leadgate-a: prereg `16ce4c973` (rebased), instrument `1c83b356f`
  (rebased), volley fix `fb0ca5b49` (rebased), evidence `be0cfca40`
  (merge tip).
- Round record: this commit (follows `be0cfca40`).
