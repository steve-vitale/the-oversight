# sim-scale-onramp-round-1115 — ADOPTION of timed-out Loop A round fleshout-20261123T1115Z

**Run:** fleshout-20261123T1315Z (scheduled 07:15 CST), Loop A, axis scale-onramp (converging, NOT converged).
**Adoption:** the 1115Z occurrence timed out at the 2-hour boundary before closeout, with both workers done and reports delivered. This run adopted the round: verified both arms from git/files, merged one, held one, and closed out.
**Base master at adoption:** c60b3c4e5 (journey-landing r156). Master moved twice during the adoption: ae4d4c277 (journey-crisis r274) then a6cb127cc (Loop B merged sim-killarrive-b GO). Final merge tip 45617c490.
**Sibling Loop B** live on winnability-chain all run (1230Z claim: sim-doorstage-b + sim-killarrive-b) — NOT touched; B merged killarrive-b mid-adoption (zero src/js diff, see §5).

## Arm 1 — sim-launchsilence-a: DIAG-GO, MERGED

**Verdict: DIAG-GO** — all six frozen bars pass (evidence `evidence/2026-11-23/sim-launchsilence-a.md`, prereg `evidence/2026-11-23/sim-launchsilence-a-prereg.md`).
**Merged:** worker `a2877adc1` + addendum `6d1d9c562` + re-freeze #3 `1925ca4f5` + re-freeze #4 `45617c490` (ff-only onto a6cb127cc; merge tip 45617c490, ancestor check passed).

The question: on the homebody band 11/16 villages launched nothing. The recorder decomposes the silence per village per day. Fresh band 107517–107532 (16 seeds, 150d, competent verbatim, control leg only).

- Villages launching a wave-4+ party: 10/16; never launching: 6/16. Launches 50 (48 direct + 2 join-inferred; strict reading 48).
- First-fail stages (6/6 classified, 0 unclassified): `no-plan-created` 3 (107517, 107527, 107530), `plan-never-ignites` 3 (107526, 107528, 107529). No village died at the attempt: every plan that formed was considered at dawn, every depart attempt launched.
- The silence lives upstream of the launch, in two places: (1) no wave-4+ plan ever forms, even while wave-4 monsters walk past and get fled from; (2) the plan forms but the party never musters — the dawn scorer never offers the launch because the companion pool reads eligible 0 and nobody is free at Haven.
- Sense-test (seed 107529): standing 0→480, wave 5 unlocks, a wave-4 herald killed in the wild day 108 — yet the first wave-4+ plan appears day 112 on a dying holder (health 5), the scorer offers `party_wait` 16 times and never `party_launch`, six holders cycle, nobody ever musters. Sensible in its own terms (a wounded person does not walk alone at a monster), senseless in its duration — the village never acts like a village.
- Wall (this band): wins 0/16, national 0/16, table 0/16, wave 5 9/16, wave 4 16/16, villages lost 6/16, median survival 150d, total deaths 1594. Standing 199 on 4/16 (the known stall band).

**Re-freezes (the adoption's main work).** Master moved twice, so the arm was re-anchored and re-recorded twice; both reproductions are exact:
- #3 onto ae4d4c277 (r274 changed src/js/comms.js +18 — a live game-code change): FROZEN_BASE b602eb83b, corpus re-recorded, regenerated analysis.json byte-identical, analyzer --diff 2/2 overlapping seeds match, selftest 20/20, proof 50/50.
- #4 onto a6cb127cc (killarrive-b, zero src/js diff): FROZEN_BASE 5ca133385, corpus re-recorded, analysis byte-identical, --diff 2/2, selftest 20/20, proof 50/50.
- A first #4 attempt failed silently (all driver legs exit 0, zero files): a string edit truncated the driver to its first 104 lines (a `find` miss silently resolved to end-of-file). Caught by the zero-line logs; driver restored from HEAD and re-edited with exact-string replacement plus a line-count assertion. Nothing committed from the failed attempt. Lesson recorded in the prereg §Re-freeze #4.
- Re-freeze #2 (FROZEN_BASE 96cbe6887) by the 1115Z coordinator died mid-re-record at the occurrence timeout (1/16 seeds re-recorded, 15 deleted on disk, 4 replay files deleted, driver edited on disk); the adoption restored the tree to HEAD and discarded it uncommitted. The 4.6 MB re-recorded seed-107517 file was valid JSON anchored to 96cbe6887 but unverified as a set; regenerable from the driver, not preserved.

## Arm 2 — sim-departsafe-a: NO-GO, HELD (lever NOT merged)

**Verdict: NO-GO** — frozen bar 2 (det-gate) fails on 1/16 seeds (107611); all other frozen bars pass (evidence `evidence/2026-11-23/sim-departsafe-a.md`, prereg `evidence/2026-11-23/sim-departsafe-a-prereg.md`).
**Held:** branch `sim-departsafe-a` (commit e9dcc0ffe) stays unmerged per the worker's explicit HOLD flag (held-NO-GO precedent, cf. sim-deadgate-b). Worktree + branch kept; nothing from this arm is on master.

The lever, in plain words: the dawnchoke door lets forager companions answer staged wave-4+ hunting plans, but bought departures with deaths. This arm pairs the door with a safety check — a departure only leaves when the whole party is fit (armed, armored ≥10 wave-4 / ≥15 wave-5, health ≥70 or healable, not sick, able to walk); otherwise the party stays home and tries another day. Default-OFF (`DEPARTSAFE=1`); no default flipped. Three legs on identical seeds 107601–107616 (16 seeds, 150d, tableseat-nowait): ctl / lift (door open, safety off) / arm (door open, safety on).

- Launches: ctl 14 → lift 35 → arm 33 (2.36× ctl, bar 3 PASS). Deaths mean: 77.1 → 80.4 → 80.8 (bar 4 PASS by 0.23 deaths/run — a noise margin on a band where one seed swings ±67). Median survival 93.5 → 94. Starvation 5 → 5.
- Only 3 of 16 seeds do anything; 13/16 launch nothing on any leg — the launch funnel's silence recurs. One seed (107605) carries the whole story: +67 deaths, most launches.
- The safety check held 44 departures (30 party-too-small, 11 sick, 5 hp<70, 0 armor) — but saved zero lives vs the lift (1292 vs 1287 deaths). A hold is a delay, not a cancellation: held parties re-bid the next day and the deaths follow them.
- Bar 2 fails on seed 107611 only: the legs first diverge on day 64 (a deferred part-3 `party_launch` bid), one day before the frozen bound's first extra depart call (day 65). The bound lags the lever's first effect when the first bid is deferred — an instrument-lag artifact, diagnosed not re-scored. Under the corrected bound (min of first extra depart call, first safety effect, first `party_launch` bid divergence) the gate passes 16/16 and every frozen bar would pass — a follow-up arm could re-judge this corpus under an amended prereg with no new sims. Whether the pair should then land as a default-OFF instrument is a coordinator/Steve call; the 0.23-death margin and zero lives saved vs the lift argue for caution even under a GO.
- Balanced panel: decision `review_required`. Table win rate 0.75 → 0.8125 (+0.0625, change_watch); deaths/run 77.125 → 80.75 (+3.625, regression_watch, 95% exploratory interval −1.44 to +12.44 — includes zero, not a proven regression).
- Sense-test: launched departures read sensibly (named parties hunting named beasts). Two flags: finding #2710 recurs (first departure beat names people by physical description — "A man, maybe 40s, with a long braid…"); held departures are SILENT — 44 holds produce zero spoken lines, so a player would watch a party keep not leaving with no explanation. Whether a hold should speak is a design call.
- Wall: wins 12–13/16 (any run-ending win, mostly cash-outs — `Game.won` is not the full seat; the table seat is not instrumented by this driver), national 0/16 all legs, wave 5 3/16, wave 4 16/16, villages lost 4→3, median survival 93.5→94.

## Wall numbers (this round's judged corpora)

| | launchsilence ctl (16) | departsafe ctl/lift/arm (16 each) |
|---|---|---|
| Wins | 0 | 12 / 13 / 13 (any ending) |
| National | 0 | 0 / 0 / 0 |
| Table seat | 0 (not offered) | not instrumented |
| Wave 5 reached | 9 | 3 / 3 / 3 |
| Wave 4 reached | 16 | 16 / 16 / 16 |
| Villages lost | 6 | 4 / 3 / 3 |
| Median survival | 150d | 93.5 / 92.5 / 94d |

scale-onramp stays converging (NOT converged): the launch funnel is now decomposed, not just measured — the silence is upstream (no plan, no muster) — but wins are still 0 on the launchsilence band, national 0 everywhere in this round, and the table seat unreached. The departsafe pair does not move any village toward national either.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-23/perseed-launchsilence-a-ctl/*.json' --metrics national,table,wins,exiled --allow-recorder-corpus --sweep-rows` on the merged corpus: exactly the 3 LOUD regime lines (national 12→0, table 16→0, wins 16→0), exiled quiet — the EXPLAINED regime artifact seen on every recent adoption (pre-seat competent-policy substrate vs WINSEAT-regime baseline; the baseline's own _regime note predicts it). Baseline NOT rolled.

## Gate

check.js --quick was NOT run on the merged tip in this adoption. Basis: the merge adds zero src/js changes and zero modifications to existing scripts — only new files (scripts/launchsilence-driver-a.js, scripts/analyze-launchsilence-a.js, scripts/test-launchsilence-a.js) plus evidence. The arm's own proof test ran green 50/50 twice on the rebased trees (re-freeze #3 at b602eb83b, #4 at 5ca133385); the analyzer selftest 20/20 twice. The base tip a6cb127cc was gated by journey-crisis r274 at 337/7, 0 attributable (commit ae4d4c277), and Loop B's killarrive-b merge carried its own verification. The launchsilence proof test is not in the check.js set. The ship loop runs its own checks before deploying.

## Infrastructure

- **Stale-lock recovery:** lock fleshout-20261123T1115Z (created 11:17:27Z) deleted after registry heartbeats 12:42:36Z/12:47:23Z (>15 min stale), no live Loop A processes, both workers done in subagent state. The lock's own run had timed out ~13:15Z; the last file write in its trees (13:13:27Z, an uncommitted 4.6 MB re-record) was stable with no holder before the restore.
- **Duplicate adoption:** the main chat spawned a second adoption agent (3d04027c, ~13:19Z) for the same 1115Z round while this scheduled run was adopting it. Flagged to the main chat; the main agent cancelled its agent. The cancelled agent left no commits and touched no branch. This run owns the closeout; lock held as fleshout-20261123T1315Z throughout.
- **Registry lock jam:** heartbeat attempts by other loops hit `REGISTRY.lock held > 120s` during the run; a cross-loop sweep heartbeated both A trees at 13:24:34Z/13:24:35Z (fresh at adoption time). No registry edits were made by this run; held dispositions are recorded here and in the tracker.
- **Safe-commit index clobber:** struck on BOTH re-freeze commits (23 files, `MM` staged+unstaged) — repaired via the `git ls-tree -r HEAD | git update-index --add --index-info` pipe; commits verified correct, status clean after each repair.
- **Rebase churn:** master moved twice mid-adoption (r274, killarrive-b); the arm was rebased twice with a full re-freeze each time. No quirk stops on either rebase.
- **Write flap:** no flap window hit this run. The flap-watch probe process is running.

## Metric review

- **Launchsilence:** the taxonomy held (6/6 named, 0 unclassified), but three stages (`no-target`, `no-companions-available`, `holder-blocked`) never fired on live data — synthetic selftest fixtures only. A band where a village attempts and holds would exercise them. The 48-vs-50 launch gap is the definition's edge (departures counted by the plan scored for vs the hunt they became). Balanced panel N/A (single control leg).
- **Departsafe:** the death bar is decided by one seed (0.23-death margin). The det-gate bound needs the bid (see §Arm 2). `won` is any run-ending win, not the full seat — the table seat is not instrumented by this driver, by prereg design.
- **The launch funnel is the wall, not the safety bar.** 13/16 departsafe villages never launch on any leg; the safety bar can only filter departures that exist.

## Next blanks in order

1. **The muster** — why is nobody free at Haven to join a wave-4+ plan: is the companion pool really empty (villagers dead, out, or engaged), or does the muster never ask them? (launchsilence §8; findings entry appended.)
2. **Plan formation** — what turns a wave-4 meeting (fled, evaded) into a wave-4 target, when even a kill (107529's herald, day 108) doesn't produce a plan until day 112? (launchsilence §8; findings entry appended.)
3. **Departsafe re-judge** — amend the prereg det-gate bound to include the first bid divergence and re-judge this same corpus (no new sims); under the corrected bound every bar passes. Landing as a default-OFF instrument is a coordinator/Steve call. (departsafe §10.)
4. **Held departures are silent** — 44 holds, zero spoken lines. Whether a hold should speak is a design call. (departsafe §7; findings entry appended, steve-call.)
5. **Omar's corpse thread** — whether villagers ever loot a scholar's corpse (carried from 0815Z; #2672 stays open).
6. **Finding #2710** — departure-beat physical-description naming; recurred again on the departsafe band (first departure beat). Stays open; UPDATE appended.

## Files

- Round record: `evidence/2026-11-23/sim-scale-onramp-round-1115.md` (this file)
- Arm 1: `evidence/2026-11-23/sim-launchsilence-a.md`, `evidence/2026-11-23/sim-launchsilence-a-prereg.md`, `evidence/2026-11-23/launchsilence-a-analysis.json`, `evidence/2026-11-23/perseed-launchsilence-a-ctl/` (16), `perseed-launchsilence-a-replay-on/` + `-replay-off/` (2 each); instrument `scripts/launchsilence-driver-a.js`, `scripts/analyze-launchsilence-a.js`, `scripts/test-launchsilence-a.js`. Merged 45617c490.
- Arm 2: `evidence/2026-11-23/sim-departsafe-a.md`, `evidence/2026-11-23/sim-departsafe-a-prereg.md`, `evidence/2026-11-23/departsafe-a-panel.md`, corpora in worktree `~/workspace/worktrees/sim-departsafe-a/evidence/2026-11-23/perseed-departsafe-a-{ctl,lift,arm}/` (16 each). HELD on branch sim-departsafe-a e9dcc0ffe — not on master.
- Claim retired to `.DEAD`; lock deleted LAST after same-call per-line verification.
