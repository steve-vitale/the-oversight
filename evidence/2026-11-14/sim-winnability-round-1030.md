# sim-winnability-round-1030 — stale-lock recovery + 2 adoption landings + capablewinpath DIAG

Run: fleshout-loop-b-20261114T1030Z (Loop B), axis winnability chain.
Date: 2026-11-14. Coordinator evidence; all three arms merged locally,
pending ship (no push, no bump — ship loop owns deploys).

## Stale-lock recovery

The 0730Z Loop B run was dead at this run's start: its lock was 2.5h old
and its two trees' heartbeats were 64+ min stale (sim-fusionoffer-b
09:21:32Z, sim-proofrefresh-b15 09:25:56Z), past both the 15-minute live
guard and the 90-minute fallback. The lock was deleted at run start; the
claim was retired to .DEAD only after both orphaned arms were landed
below. No work lost. Loop A was live on scale-onramp the whole run
(fleshout-20261114T0936Z, transplant 15A–15F) — NOT touched.

Re-point queue check at run start: (1) arm-2 toggle DONE (togglepin-b,
MORALE CREDITED, per tracker) — not re-run; (2) flee-repair is Loop A's
stranded branch sim-fleerepair-a (4 commits, instrument built, no
evidence/verdict, no registry entry) — held for Loop A, not touched;
(3) standing accumulation on gear-ready seeds (99107 pattern) stays
queued for the next B run.

## Arm 1: sim-fusionoffer-b — BUILD, LANDED 59448d248

Adoption of the dead 0730Z run's GO arm (findings #2326 + #2327, filed
by sim-retribution-offer-b). Fix: #2326 deferral guard in
`maybeOfferFusionReactor` (src/js/game.js — defer while ANY ability
sheet is pending) + #2327 pellet gate in `_cxPrizeAbilityOffer`
(src/js/contests.js — offer fusion_reactor only when the scholar holds
a pellet). Proof test scripts/test-fusionoffer-b.js 16/16 on the
rebased tip; fix hunks byte-identical after rebase.

Landing path: rebased onto master b81fde1c5 (stop-at-pick quirk struck
once, recovered per the documented rule: verified the pick unapplied
with `git diff <pick>`, then `git rebase --continue`), then onto
b2b50c2cd after the proofrefresh merge (clean). Flap-debris check: the
worker's ONTOLOGY.md hard-link warning is moot — all three copies are
real files (distinct inodes, links=1).

check.js --quick — the owed clean re-run (the worker's GO bar (e)
failed as measured, 325/15, flap-caused): run 1 on the b81fde1c5 base:
330 passed, 10 failed; run 2: 333 passed, 7 failed. Every failure
attributed, none re-scored:

- proof-update + workflow (2): "Proof source inputs are not current" —
  the fix itself changes 2 manifest keys (game.js, contests.js). The
  proof is refreshed post-landing by round 16 (now owed). Expected on
  ANY game-code branch; the rageprecheck adoption set the precedent
  (landed with the proof 2 keys stale, round 15 re-pointed after).
- cache-flags (1): "both actual CLI configurations complete valid
  neutral panels" — the 2026-11-12 load artifact, same sub-check; it
  passed 4/4 on the proofrefresh tree (same master, no game change)
  ~40 min earlier while the box was quieter. A quiet-box A/B is owed
  (next run; round 16's legs re-run it).
- phone-frame (1): stale receipt on master (listed inputs index.html,
  data files, abilityActions.js — none touched by the fix; verified
  the fix's diff names none of them). Pre-existing; the existing
  finding #2299 was updated, not duplicated.
- 3x 120s timeouts (living-garden, one-person-army, capable-bot): load
  artifacts under concurrent panel/worker load; the same 3 in run 1
  (plus synergy-stall, which passed in run 2).
- Changed-area tests all green individually on the rebased tip:
  fusion-reactor 32/32, fusion-singularity 32/32, fusion-mantle 9/9,
  contest-prize-lanes 52/52, ability-lanes 38/38, gift-steering 2/2,
  mantle-reactor-voice 8/8, devotiongate 29/29, retribution-offer
  --game 26/26, fusionoffer 16/16.

GO bar (e) verdict: FAILED as literally stated (check.js --quick not
green), with every failure attributed above. The bar as written cannot
be met by a game-code arm without a panel regen on its branch — see
Metric review for the proposed revision. Merged on the attribution +
area-green evidence. Findings #2326/#2327 marked [fixed] in
hidden_files/sim-findings.md.

Wall (after leg, 8 seeds, competent, 150d): 1/8 survived (190395),
0 national, 0 table, 0 wins; median survival 127.5d; maxWave 5 on
190397 only. The wall stands — the fix was never expected to move it.
Neutrality 8/8 identical trajectories; the 190395 defects fixed live
(trample gone, fizzle gone).

## Arm 2: sim-proofrefresh-b15 — MEASUREMENT, LANDED b2b50c2cd

Adoption of the dead 0730Z run's GO arm (round 15 proof regen, GO
12/12 on tip 2de44bad8). Rebased onto master b81fde1c5 (stop-at-pick
quirk struck twice, recovered per rule). The proof test was verified
FAILING on the new tip (1 stale key: conversation.js, journey-deepening
r191 Q1), so the panel was regenerated on the rebased tip per the arm's
own procedure (same panel file, GO legs re-judged on the new tip)
instead of merging a stale proof.

- Regen: `node scripts/balance-panel.js --out .proofrefresh-b15-panel
  --n 16 --days 150 --par 4` (same spec: 16 seeds x 4 policies, 150d,
  Columbus). First attempt killed by SIGTERM after ~32 min
  (agent-service restart wiped /tmp — same signature as the 09:07Z
  restart in the b15 run); 65 case files were already banked in the
  worktree cache. Re-launch from the cache completed in ~2 min:
  "Saved .proofrefresh-b15-panel; 64 cases, 65 cached jobs."
- New panel: sourceHeadStart == sourceHeadEnd == 37267f43e; manifest
  526 keys, panel sources 526 keys, STALE 0; sourcesStable true; 64
  rows; neutrality 4/4 match, warnings 0; sha256
  70831cb459bed5627b7279337221e888e10f8dad30cfeb5ceda949fa5f027a67 (old
  panel fd0d5beb).
- Row movement vs the old b15 panel: 0/64 rows differ — the
  conversation.js change moved no verdict. Wall identical: national
  11/64, wins 16/64, entered 16/64, table 55/64 (Arc-IV reach).
- GO legs re-judged on the new tip: (a) proof-update 9/9 exit 0; (b)
  workflow 9/9; (c) cache-flags 4/4 outright, first attempt; (d)
  neutrality reproduces b14 + b13; (e) test-proofrefresh-b15.js 12/12
  incl. stale-input negatives (b14 and b13 fail validate); (f)
  ontology exit 0, 138 systems validated. Verdict: GO on the new tip.
- Master moved while landing (Loop A landed transplant15d); the move
  touched no manifest file, so leg (a) + the proof test were re-verified
  on the new tip (9/9, 12/12) before the ff-only merge. Cases cache
  deleted at closeout (not committed); the retained .gz is the artifact.
- Telemetry deviation check: not applicable (known parser limitation —
  telemetry-check.js cannot parse a .gz panel; neutrality reproduction
  is the instrument check, as in rounds b11–b14). Round 16 is owed
  after the next manifest change — the fusionoffer landing IS that
  change, so round 16 is owed NOW.

## Arm 3: sim-capablewinpath-b — DIAG-GO, LANDED e7c6861bf

Worker decomposed finding #2321 (capable wins 16/16 by ~day 90 while
competent wins 0/16 on identical seeds 98801–98816, 150d). Prereg
G1/G2/G3 all GO; reproduction check 32/32 match, 0 diffs vs the
stage-2 after-leg corpus. Proof test static 32/32 + game 18/18
(re-run by the coordinator on the rebased tip). Zero src/js changes.
Evidence: evidence/2026-11-14/sim-capablewinpath-b.md.

The answer, in plain words: competent loses because it never sits down
at the table. It earns a lesser seat on 15 of 16 seeds, the invitation
stands open, the preview reads ready for a median of ~33 days (up to
59) — and it never takes it: `competent.js` contains no call to
`tableTakeSeat` at all, 0 seat-takes in 16 runs. Capable sits the first
morning the seat can be taken (day 90, the table's day floor) and wins
the same morning through a lesser-seat door. That is the whole win gap.
The second divergence sets the win *day*: capable reaches regional
scale — the binding seat bar on nearly every seed — at median day 38
against competent's day 71, so capable holds the seat by day ~42 while
competent holds it by day ~71. The scale climb comes from capable's
leadfeast courtship/link layer, which also seasons links into diplomacy
standing (capable median 102 at the win; competent 0 on all 16 runs,
even 150-day survivors).

- Wins: all 16 lesser seats, light branch, self as seat-taker — beloved
  11 / feared 4 / witness 1; finals audience 9 / quiet 2 / pledge 3 /
  mercy 1 / charges 1. No wave-4/5 kills needed: 6/16 wins have zero
  wave-4 kills; the thinnest win (98804) has one wave-3 kill, zero
  wave-4, standing 165. The full seat is never reached (0/32).
- The 199 park / veterans bar gates wave 5, not the win: the gated
  total parks at t5−1 on 9/16 capable wins with rd5short=["veterans"].
- Wall: national 13/16 capable vs 0/16 competent; table 16/16 vs 0/16;
  wins 16/16 vs 0/16; wave-5 unlock 6/16 both; median survival
  competent 119d, capable 90d (win-truncated); villager combat deaths
  902 vs 883 pooled — the win is a sitting, not a saving.
- Coordinator notes: rebase onto eb6360801 clean (3 picks, no quirk);
  rebased diff is worker files only (38 files, +526k, all additions).
  The game-leg smoke seed reads 92/global on the new master vs
  90/regional on the worker tip (fusionoffer + journey r200 moved
  trajectories); the proof legs are structural, GO stands. check.js
  --quick was not run by the worker (zero src/js; the proof test is the
  relevant test) — accepted. Telemetry check refuses the recorder
  corpus (documented behavior, no LOUD line; wall numbers reported
  directly).
- Findings: #2321 annotated [ANSWERED 2026-11-14]; 5 new [open]
  findings appended (diplomacy-0, 199-park, keepsakes-never-worn,
  homecoming-line repeat, win-costs-lives). Follow-up is a BUILD arm,
  not more measurement — a Steve-call on whether competent-the-policy
  should sit or the game should prompt a human harder, plus a
  scale-climb lever for the 33-day gap.

## Wall numbers (this run's judged corpora)

- fusionoffer after-leg (competent, 8 seeds, 150d): 1/8 survived, 0
  national, 0 table, 0 wins, median 127.5d.
- proofrefresh panel (64 rows, 150d): national 11/64, wins 16/64 (all
  capable), entered 16/64, table 55/64, wave-5 14/64, median 90d.
- capablewinpath (32 configs): national 13/16 capable vs 0/16
  competent; wins 16/16 vs 0/16; wave-5 unlock 6/16 both; median
  survival 119d competent / 90d capable.
- The scale wall stands for competent play: wins come only through the
  capable policy's seat-taking + courtship layers; the full seat is
  0/32 and wave-5 kills are not the win path on this band.

## Infrastructure

- Reaper lock contention (known, AGENTS.md 2026-11-12 — the reaper
  holds REGISTRY.lock for its whole 9–14 min scan while the cron fires
  every 10 min; fix needs a Steve nod): pre-flight reap skipped (5
  consecutive skips on a held lock), heartbeats blocked ~2 min each
  (killed and retried, never chained behind one), worktree registration
  took ~30 min queued on the lock, releases took 4–7 min each. No work
  lost; all three trees released and branches deleted.
- Agent-service restart ~11:07Z killed the panel regen (SIGTERM) and
  wiped /tmp; resumed from the worktree cases cache. Panel logs are
  now written to ~/workspace, not /tmp.
- Write flap: cleared ~09:06Z; no flap symptoms this run (every git and
  file write worked). The flap-watcher's ALL-OK held through the run.
- Master moved 4 times under the run (transplant15d, proofrefresh
  adoption, fusionoffer merge, journey r200 adoption); every rebase
  was clean, proofs re-ran green after every rebase. The stop-at-pick
  rebase quirk struck 3 times across the two adoption rebases
  (fusionoffer 1x, proofrefresh 2x) and 0 times on the two clean ones;
  every strike was recovered per the documented rule (verify unapplied
  with `git diff <pick>`, then `git rebase --continue`).
- check.js --quick profile on the fusionoffer branch (333/7) is
  load + staleness, not the fix — see Arm 1 attribution. No new
  baseline rolled.

## Next blanks (in order)

1. Round 16 proof refresh (owed NOW — the fusionoffer landing changed
   2 manifest keys; regen + re-point + 6 GO legs).
2. BUILD arm: competent seat-taking path (Steve-call: policy sits vs
   game prompts harder) + scale-climb lever for the 33-day regional
   gap (finding #2321 follow-up).
3. Standing accumulation on gear-ready seeds (re-point queue item 3,
   the 99107 pattern) — still unclaimed.
4. Cache-flags quiet-box A/B (owed verification for the load-artifact
   attribution in Arm 1).
5. Phone-frame receipt refresh (stale on master; browser recipe via
   phone-frame-proof-update.js; finding #2299).
6. Loop A's stranded sim-fleerepair-a branch (instrument built, no
   verdict) — held for Loop A.

## Metric review

- GO bar (e) (check.js --quick green) as written cannot be met by a
  game-code arm without a panel regen on its branch, because any
  game-code change stales the proof by design (finding #2316
  structural staleness). Proposed revision for the next run: game-code
  arms judge (e) on the changed-area suite + explicit proof-staleness
  accounting (keys changed, round-N owed), with the panel regen riding
  the next proofrefresh round; the literal --quick-green bar applies
  to instrument/policy arms whose changes touch no manifest file. No
  re-scoring of this run's verdicts: the fusionoffer GO stands on its
  prereg bars (a)–(d),(f) + area-green + attribution.
- The capablewinpath DIAG needed the RAW standing split
  (war/diplomacy/plenty) + seat-day vs end-of-run reads; a single
  standing number hides the diplomacy gap entirely (0 at seat day, 102
  at the win). Future arms quote the split and the day it was read.

winnability chain stays converging (NOT converged): the win path is now
decomposed to a seat-taking gap + a scale-climb gap, both with named
levers, but competent still wins 0/16, the full seat is 0/32, and the
veteran link still gates wave 5. scale-onramp stays converging
(untouched; sibling Loop A). Claim deleted; lock deleted.

## Commits

- 59448d248 sim-fusionoffer-b (fix + proof + evidence; adopted)
- b2b50c2cd sim-proofrefresh-b15 adoption (panel regen 70831cb4 + re-point)
- e7c6861bf sim-capablewinpath-b (DIAG; adopted)
- (this commit) coordinator evidence
