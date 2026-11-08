# sim-food-adoption-round-1315 — Loop A food-economy ADOPTION run

Run: oversight-flesh-out-loop, run fleshout-20261108T1315Z (Loop A), axis
food-economy (converging, NOT converged). Coordinator evidence.
Master at closeout: (see Closeout adoption section). Loop B live on scale-onramp/winnability
the whole run (1230Z claim: fightloop-b + tendtrust-b; tendtrust heartbeat
13:04Z fresh at run start) — NOT touched.

## STALE-LOCK RECOVERY at start

Lock fleshout-20261108T1017Z (created 2026-11-08T10:17:00Z, ~3h old) and its
claim were still live. All three trees' heartbeats stale past the 15-min
guard (sim-doublenight-rejudge-a 11:30:21Z, sim-medicduty-a 11:30:20Z,
sim-comparecontract-a 12:08:09Z); zero file writes in any tree in the 30 min
before recovery; sibling runs heartbeating fine at 13:15Z (no flap — the
EPERM-flare caution does not apply: other lanes' heartbeats landed at
13:15:45Z while these trees sat 68–105 min stale). The 1017Z workers'
subagent records are terminal (doublenight-rejudge failed on a transport
error after committing; comparecontract done; medicduty done, stopped by
cron timeout with the duty unbuilt). Run confirmed dead; lock deleted after
reading its run_id; claim retired to .DEAD with a note. Own lock + claim
(fleshout-20261108T1315Z) written before any sims. Tracker basis:
convergence-tracker.md latest reviews fleshout-20261108T0915Z (Loop A) +
fleshout-loop-b-20261108T1030Z (Loop B). Next blanks taken in order: (1)
doublenight re-judge, (2) Haven Medic Duty, (3) COMPARE-CONTRACT repair —
all three adopted from the dead 1017Z run.

Pre-flight: main tree clean at run start; disk 32%; `worktree-reap.sh` ran
(9/16 active, no dead trees removed; its LOUD lines are other owners'
uncommitted trees, not touched).

## Arm 1 — sim-doublenight-rejudge-a: RE-JUDGE GO, LANDED 6fad54d23

Adoption of the dead 1017Z arm. Branch sim-doublenight-a tip 915e6b7f4
(RE-JUDGE GO under Amendment A3) verified against its evidence file
(evidence/2026-11-07/sim-doublenight-fix-a.md, RE-JUDGE section):
0 dedupe fires after (19 before, 16 seeds), starvation RATE 0.2176 ->
0.2178 (bar +0.01/day, PASS by +0.000236), median daysAlive 100.5 ->
100.5 (ratio 1.0), trajectory identity clause PASS, neutrality exact 8/8.
The original NO-GO under the count bar stands as rendered; the re-judge is
a NEW verdict under the amended bar (MEASUREMENT.md §14). Convergence state
for the bug itself: converged — the bug is gone on every judged seed.

Coordinator landing: master read fresh (204bc55bb) immediately before
rebasing; `git rebase 204bc55bb` — the stop-at-pick quirk struck at the
last pick (915e6b7f4, evidence .md, "local changes would be overwritten"):
verified worktree clean + pick unapplied (`git diff 915e6b7f4 -- <file>`
159 lines, RE-JUDGE section absent), then `git rebase --continue` — no todo
edit, no abort. New tip 6fad54d23. Fix commit ff252c1ac diff is
BYTE-IDENTICAL to the original dde5c0c75 (md5 19ce9c1c2cb2321dc365f339d8633f49
on the +/- lines; game.js 9 lines, 8 insertions / 1 deletion).

Proof re-run on the rebased tip (same env as the worker):
`PLENTYDEPRI=1 DEPOSITGATE=1 MEALDAY_TRACE=1 SEEDS=<P1> DAYS=150 node
scripts/test-doublenight-fix-a.js` — 70 pass, E3 FAILS (assert crash, E4/E5
never run), exactly as on the worker's base. Coordinator re-ran the E3
diagnostic independently (/tmp/diag-e3.js, oneRun 98079 vs after-corpus):
live daysAlive 120 vs corpus 122, first meal-row diff day 33 (after the
d10 firing day), deaths day <= 10 byte-identical (Harold d10 starvation),
first death-row diff d27 Willie (same person/day/cause; pantryKcal 17312
vs 17142 — downstream r114 preserver drift), mealDupCount 0, live 925
meal rows vs corpus 1003, live 22 death rows vs corpus 13. The signature is
IDENTICAL to the worker's investigation on base 246ce6dc2 — the extra master
movement since (ladder leg2, r157, pelletpass) changed nothing in it.
Attribution stands: substrate drift (r114 preserver XP), not a fix
regression. E1/E2 pass live on the new base (0 fires). The E legs were NOT
loosened. Merged --ff-only (master verified 204bc55bb immediately before);
tree released done-merged, branch deleted. Record correction: the worker's
evidence cites the rebase base as 246ce6dc2, but the branch's first commit
parent is 2294ef815 (a descendant of 246ce6dc2) — the rebase happened onto
2294ef815 or was re-done; the verifiable fact is the parent chain, and the
landing rebase above was onto the explicit SHA 204bc55bb.

Wall (judged corpora, unchanged): national 0, table 0, wins 0 on the judged
seeds — the fix moves no scale metric. Telemetry deviation check
(coordinator, doublenight after-corpus, --sweep-rows): 3 LOUD lines
(national 12->0, table 16->0, wins 16->0, n=24 rows), all REGIME artifacts
(competent-only 150d measurement corpus vs the WINSEAT baseline; before ->
after 0 -> 0 on all three); baseline NOT rolled. sim-findings.md
DOUBLE-NIGHT BUG entry updated to [fixed] by this run.

## Arm 2 — sim-comparecontract-a: COMPARE-CONTRACT repair, LANDED 38e419d4b

Adoption of the dead 1017Z arm. Branch sim-comparecontract-a tip f5d9915d5
verified against its evidence file
(evidence/2026-11-08/sim-comparecontract-a.md): tooling-only repair
d938321b8 (registration-only harness exemption: registrationDigest
snapshot + pure-addition exemption, recorded never silent), proof
25/25, existing compare tests green, cheaptend pair rebuilt with compare
VALID (review_required) and wrapper neutrality 8/8 exact, doublenight pair
VALID on augmented copies and `invalid` on un-augmented copies
(reproduces the original). Findings #1903 and #1909 fixed by this arm
(sim-findings.md already marked by the worker's run).

Coordinator landing: the worker's half-done follow-up was recovered — a
fresh observer-neutral panel (evidence/2026-11-08/neutral-comparecontract-a-20261108/panel.json.gz,
seed 7 x 4 policies x 150d, built 12:15Z on the branch tip, validity
sourcesStable + neutrality 4/4 match, 0 warnings), the input for refreshing
the stale measurement neutrality proof after the repair changed harness
inputs. Committed as coordinator addendum 67e81a6c5 (panel.json.gz only;
cases/ deleted per §15; evidence-file addendum noting the proof-hash
refresh is owed post-merge, not on the branch tip). Master read fresh
(6fad54d23, post-doublenight) immediately before rebasing; the stop-at-pick
quirk struck TWICE in this rebase (pick e27fabfa7, then pick f5d9915d5 —
each appearing in both done and todo): verified worktree clean + pick
unapplied before each `git rebase --continue` (e27fabfa7 diff on its files
non-empty; f5d9915d5 diff 17 lines). New tip 38e419d4b, 5 commits, repair
diff intact (balance-panel.js +55, balance-scorecard.js +38).

Proof re-run on the rebased tip: scripts/test-comparecontract-a.js 25
passed, 0 failed; the seven panel/compare files all green individually
(balance-scorecard 35/35, measurement-comparison 14/14,
panel-contract-rulings 9/9, measurement-cache-flags 4/4,
measurement-flags 5/5, balance-source-identity 3/3, balance-windows
13/13). The worker's check.js --quick re-run attribution was not
recoverable (its /tmp log was deleted by /tmp cleanup); the first run's
278/14 was investigated by grep in the evidence file as not touching this
repair. Merged --ff-only (master verified 6fad54d23 immediately before);
tree released done-merged, branch deleted.

Open items carried (not fixed here, per the arm's own findings): the
LINKSEEK registration lost in the cheaptend landing (one-line restore, a
sibling arm's instrument — left for its owner); the compare sources check
ignores index.html (contract-scope question for a future arm); cross-policy
compare needs a Steve call (not implemented).

## Neutral-proof refresh (coordinator, post-merge)

Both landings changed proof inputs (game.js via doublenight; balance-panel.js
+ balance-scorecard.js via comparecontract), so the retained measurement
neutrality proof was refreshed on the merged master as the addendum owed:
fresh panel evidence/2026-11-08/neutral-loopa-1315-20261108 (seed 7 x 4
policies capable/risk-aware/socialite/winseeker x 150d, 4 cases, 0 cached;
built on master 38e419d4b, master did not move during the ~8 min build),
`node scripts/balance-proof-update.js <panel>` wrote
scripts/balance-proof.json, proof test
scripts/godpath/test-measurement-proof-update.js 9 passed, 0 failed — and
9/9 again on the committed master. Committed as d80f972a2 (panel.json.gz +
balance-proof.json; cases/ deleted per §15).

## Arm 3 — sim-medicduty-a: Haven Medic Duty — NO-GO, NOT LANDED

[RECOVERY COMPLETION — this section was PENDING in the coordinator's
13:56Z draft ("worker in flight at coordinator-evidence draft time;
section completed on worker report"). The coordinator died by cron
timeout before completing it; completed here from the worker's delivered
final report and its committed evidence file
evidence/2026-11-08/sim-medicduty-a.md on branch sim-medicduty-a.]

Worker verdict: NO-GO, judged against the A1 amended prereg header.
The duty WAS built this run (commit f6c0ffb14 [needs-eyes]: medicDutyTick
at dawn, departure blocks with LEAVE + directed-win-plan exemptions,
holder-tends-first + sickest-first, A2 cure channels — ability via
npcHasAbility + canon cure table, medicine from Haven stash pharmacy —
duty + no-medic voice lines). Before/after corpora on identical seeds
96301–96308, competent only, 150d death-aware, 3 recorders × 8 seeds.

- PRIMARY G1: FAIL on G1a — healer-present sick-days share 23.5% after
  vs ≥30% bar (before 24.6%, ceiling 32.9%); G1b PASS — absent-with-medic
  sick-days 18 vs ≤19 bar (before 38). Duty ran (284/739 duty-days,
  8 holders, 165 blocked departures, 33 ability cures, 0 medicine cures)
  but the share did not move: villages lived longer (median survival
  73d -> 95d), so the denominator grew with the numerator.
- GUARDRAILS G2: PASS (median survival ≥58.4d, starvation deaths 6 ≤ 10,
  produced/need 0.974 ≥ 0.965, no new death-cause mode ≥ 2).
- PANEL G3: compare attached, review_required; watches explained.
- PROOF G4: scripts/test-medicduty-a.js 13/13 green.
- SECONDARY: treated share fell 45.5% -> 25.2% (NULL prediction
  ±10pp band MISSED — the duty's holder-tends-first displaced other
  tending); sickness deaths 19 -> 21, wound-fever deaths 16 -> 17.
- Wall: national 0/8, table 0, wins 0, waveReach 1–4 on all 8 (wave 5: 0
  after vs 1 before) — the duty moves no scale metric.

NOT LANDED: NO-GO verdict, branch sim-medicduty-a tip 7411b7942 stays
unmerged (evidence + corpora + panel compare committed on the branch).
Worker's incomplete items (from its delivered final report): the
backlog-findings attribution ("(to be filled after the sweeps)" in its
evidence file) was never filled — the coordinator never appended it, and
the worker's findings section stays as-is on the branch. Next arm per
the worker: the medic-headcount shape — 4 of 8 seeds have no roster medic
at all, so the duty is vacuous there; villages need a way to get, train,
or find a medic in the first place (medicdiag C4's second shape).
Metric review (worker): the share bar is confounded by survival; the
treated-share join is blind to cures; the medicine channel was never
exercised live; Fever's End not read for NPC cures. Sense (worker): cure
line repeats verbatim — needs variants.

## Infrastructure

- Safe-commit index clobber hit THREE times this run (medicduty tree index
  repaired by the coordinator at adoption; comparecontract addendum commit;
  main-tree proof-refresh commit) — repaired via the documented
  `git ls-tree HEAD | git update-index --add --index-info` pipe each time,
  hashes verified == HEAD blobs, status clean + diff HEAD empty after every
  repair. Commits always correct.
- Rebase stop-at-pick quirk struck 3 times across the two landings (once on
  doublenight, twice on comparecontract) — recovered with the documented
  verify-clean + verify-unapplied + `git rebase --continue` each time, no
  todo edits, no aborts.
- Git operations slow under sibling load all run (single `git status` up to
  ~5 min; one merge/release sequence ~3 min; panel build ~8 min for 4 cases).
  No EPERM flap observed (flap probes not run; writes succeeded throughout).
- Main tree clean at every check; master moved only by this run's own
  landings during the landing windows (doublenight 204bc55bb -> 6fad54d23,
  comparecontract -> 38e419d4b, proof refresh -> d80f972a2).

## Metric review

Doublenight: the re-judge was decided BEFORE any re-judge computation
(Amendment A3, rate bar) and the verdict rests on the committed corpora;
the live E3–E5 legs are stale by construction (they compare live runs
against a corpus built on an older base) and fail on substrate drift that
the coordinator re-verified as identical in shape on the new base. The
stale-leg class is a standing measurement gap: any fix whose corpus base
moves under it will fail E3–E5 the same way, and the next arm that lands
on a determinism leg should pre-register how it treats that drift.
Comparecontract: tooling arm, no game metric; all five prereg proof bars
met. Medicduty: judged against the A1 amended header (see arm section).

## Sense

Doublenight + comparecontract are invisible correctness/tooling changes; no
player-facing text changed and no transcript read applies. Medicduty sense
section lives in the arm evidence file.

## Village assessment in plain words

(Completed on medicduty closeout — the two landed arms move no village
outcome: the double-night fix stops villagers eating twice on the night
their scholar dies, and the compare repair fixes the measuring instrument,
not the game.)

## Blanks filled or documented

- FILLED: the double-night endDay bug (fix landed, GO under A3).
- FILLED: the COMPARE-CONTRACT (findings #1903 + #1909 — wrapper-policy
  arms and harness-churn compares return valid decisions now).
- FILLED: the stale measurement neutrality proof (refreshed on the merged
  master, 9/9).
- DOCUMENTED (not fixed here): LINKSEEK registration loss; compare sources
  check ignoring index.html; cross-policy compare (steve-call).
- Medicduty blank: NO-GO — duty built and proven (f6c0ffb14, 13/13) but
  the share bar failed (23.5% vs 30%); binding constraint is medic
  headcount (see arm section).

## Findings for the backlog

None appended by the coordinator this run beyond the sim-findings.md
DOUBLE-NIGHT update above (the medicduty worker reports its own findings
in its evidence file; the coordinator appends them at closeout).

## Convergence

food-economy stays converging (NOT converged): the fever/wound->production
link is answered three ways and two of the three named blanks from the
0915Z review are now landed (doublenight fix, compare-contract repair),
but the third (Haven Medic Duty) is NO-GO — see arm section; the binding
constraint is now medic headcount, not the duty.
scale-onramp stays converging (untouched; sibling Loop B live).

## Recovery addendum (playtest-loop closeout, 2026-11-08 ~15:35Z)

The 1315Z coordinator died by cron timeout after drafting this file at
13:56Z: the Arm 3 section was left PENDING, this file was never committed,
and the fleshout-loop.lock (run_id fleshout-20261108T1315Z, created
13:18:00Z) was never deleted — despite the footer line below claiming
"Claim deleted; lock deleted", which was written aspirationally at draft
time. The medicduty worker's own record is terminal (done, final report
delivered ~15:17Z) and its branch is clean and committed (tip 7411b7942);
no live work was touched. Recovery per the loop-closeout playbook:
Arm 3 completed above from the worker's committed evidence + delivered
report; this file committed on its own branch and ff-merged; the stale
lock deleted; tracker entry appended. The footer line below is the
coordinator's original text, kept verbatim for the record.
Claim deleted; lock deleted. Evidence: this file (commit: see footer).
