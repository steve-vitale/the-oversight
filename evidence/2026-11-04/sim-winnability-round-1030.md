# Loop B run fleshout-loop-b-20261104T1030Z — coordinator evidence
## Axis: scale-onramp (winnability-chain re-point). 3 arms, merged locally pending ship.

## Run-start state
- No B lock existed; the 0930Z B round had closed out on master (deaf78370).
  The fresh heartbeat on orphaned tree sim-recovery-zombie-b traced to a
  leftover heartbeat loop (no zombie processes running) — tree left untouched,
  per the closeout rule (heartbeat <15 min treated as alive; nothing retired).
- Loop A live on food-economy at run start (claim fleshout-20261104T1015Z:
  hurthome-fix + stasharmor) — NOT touched. Loop A landed mid-run
  (2dc6530fa: stasharmor GO confirm + hurthome-fix INSUFFICIENT-DATA, fix
  reverted), then journey-landing r96, a ship bump, and armorfetch-c-a.
  Master moved 02158dbea -> d6d91a32a under this run; all three B branches
  rebased clean (zero file overlap with sibling landings) and proofs re-ran
  green before merging.
- Pre-flight: main tree clean, disk 30%, reaper removed nothing sibling-owned
  (12/16 active). Claim written before any sims (lever-claims/
  fleshout-loop-b-20261104T1030Z.json); deleted at closeout. Lock deleted.
- Re-point queue disposition: item (1) arm-2 toggle already had its verdict
  (0330/0445/0550Z: MORALE credited, GEAR credited, SIGDMG/TRICKHOLD
  non-attributed); item (2) flee-repair confirmed GO by Loop A 0820Z. This
  run therefore took the next blanks: 0820Z (a) approach-path fallback,
  0820Z (b) recordWaveKill append-before-check, 0930Z (1) recovery on
  longer-lived seeds.

## Arm 1 — sim-approachfall-b: GO (pilot, THIN) — DO NOT cite as a loop kill
- Branch: 86802f65f prereg, 9678f300e fix+variant+proof, c214d3cd7 evidence
  (rebased; merged --ff-only).
- Built: gated (COMPETENT_APPROACH_FALLBACK=1, default OFF) fallback in the
  CLOSE THE DISTANCE path of scripts/policies/competent.js, mirroring the
  flee repair: 3 consecutive zero-movement approach steps mark the fight
  approach-blocked; a blocked fight re-picks a different adjacent tile with
  a real findPath route (failed tiles blacklisted per geometry); with no
  reachable adjacent tile it WAITS (tbPlayerWait, never endTurn after it);
  monster-geometry changes reset the state. Strike-anyway is not a fallback
  (striking out of range is a documented no-op). Zero src/js changes, no
  gate/price/deed change. Variant: scripts/policies/competent-approachfall-b.js.
  Policy-side placement is where the flee repair lives; flagged in the
  prereg for coordinator overrule if src/js was meant — no overrule made,
  the variant is the honest scope.
- Proof: scripts/test-approachfall-20261104.js ALL PASS (re-run post-rebase
  and on merged master); sibling test-fleerepair-20261104.js ALL PASS.
- Pilot (fresh seeds 99801-99808; 99701-99708 rejected — collides with
  holdbeat-a; 140d death-aware; 16 legs, 0 instrument errors): armed
  approach-loop fights 0 AND baseline loop fights 0 — both written bars
  pass (cost bar clean: starvation 9 ≤ 14+2 totals, 0 player-flagged;
  median survival 62 ≥ 0.8×65 = 52) but the pilot does NOT demonstrate the
  loop kill: zero failed-approach turns in either leg, armed leg zero
  blocked steps of any kind, fallback never fired in a live sim.
- Key diagnostic (reclassification, not a fix): every baseline blocked step
  sits in a turn where the weakest monster is IN RANGE with a non-adjacent
  move target — they are flee walks (edge targets like (0,4)), not approach
  steps, which the flee repair already addresses. Baseline: 20 TB exposures
  / 0 loops / 22 No-path lines / 30 zero-tile moves; armed: 13 / 0 / 0 / 0.
  Armed median strikes/fight 5 vs 3, linked W4 kills 5 vs 0 (supporting
  observation only, divergent trajectories).
- Sense-test: no loop fight exists on either leg. Closest baseline case
  (99801 seq 5): 8 clean Hatchet strikes, then 4 consecutive failed flee
  walks to edge tile (0,4) and death — the old flee shape on the verbatim
  leg, not an approach loop. Armed fights read clean. Sense veto does not
  fire — but no live fallback transcript exists yet. Noted, not chased:
  armed 99802 seq 2 throws Pocket Sand 3 turns running while dying, never
  striking — trick-spam shape for the ability-press owner.
- Confirm still owed: a band whose baseline actually produces approach loops
  plus a baseline-signal bar (baseline loops ≥ 1). Open coordinator question:
  whether the fleerepair confirm band (99601-99612, where the loops were
  observed) may be reused for this different arm's confirm, or a new
  exposure-dense band is needed. The 99801-99808 band is now judged and
  cannot be re-piloted. No default flip is proposed.
- Evidence: evidence/2026-11-04/sim-approachfall-b.md (+ prereg), corpus
  evidence/2026-11-04/perseed-approachfall-b/ (16 files), summaries
  approachfall-summary-baseline/armed.json.

## Arm 2 — sim-holdbeatfix-b: GO — the named hold-beat fix, LANDED
- Branch: e83fa729d prereg, da16c34f1 driver/analyzer, e38c1cd16 ordering
  fix + proof, 4a6fc2e33 pilot + evidence (rebased; merged --ff-only).
- Built: exactly the named fix from sim-holdbeat-a Q2, nothing else. In
  recordWaveKill (src/js/game.js), the KILL ATTRIBUTION block (waveKillLog
  push with dedupe + waveKillByChannel counter, byte-identical) moved to
  BEFORE the checkWaveUnlockBeat() call, so a kill's own unlock-check beat
  counts the kill. No gates, win prices, deed numbers, or veteran demand
  numbers touched; ledger scoring, companion beat, codex/teaching channels
  untouched.
- Proof: scripts/test-holdbeatfix-20261104.js 10/10 green (re-run post-rebase
  and on merged master); targeted neighbors green (holdbeat 6/6,
  killbeat-20261019 19/0, killbeat 24/0, gap-w1-fieldbeat 4/0).
- Fixture leg (deciding) — PASS via the preregistered fallback. Seed 99101
  does NOT reproduce holdbeat-a's d134 case at this anchor: both legs lose
  day 105 with 0 wave-4 kills (anchor drift, reported not papered over).
  Deciding evidence is the deterministic probe test, RED on baseline at
  exactly the right assertion and GREEN 10/10 on fixed code — covering
  player, wild, companion, pyrrhic (exactly one entry), duplicate (one
  entry, counters still count the call), and _attrKills=false paths. Plus a
  live wild case the pilot supplied: seed 99802 day 57, baseline says "not
  ready to FIGHT the Final Draft — blood your fighters (0 of 1 veterans)"
  and then opens wave 4 the same day; fixed leg just opens it.
- Calibration recorded: each recordWaveKill drives TWO unlock checks — the
  kill's own check plus a post-credit check from the progression deed
  wrapper — and the weekly beat cadence is why only the first check's
  (stale) beat is ever heard.
- Neutrality leg (pilot) — PASS on every clause. Fresh seeds 99801-99808,
  competent verbatim, 140d death-aware, identical seeds both legs:
  starvation 14 = 14 (bar ≤ baseline+2), per-seed arm-only excess 0,
  median survival 65d = 65d (bar ≥ 0.8×), no seed flips, no new failure
  class, 0 instrument errors on all 16 pilot legs. Trajectories
  byte-identical on 7/8 seeds; 99802 differs by exactly the one stale beat
  removed plus 3 kill-moment gate reads (99 → 105), zero daily-snapshot,
  death, or kill-content diffs. Balanced panel (capable policy, same seeds,
  both panels valid) identical before/after; its review_required decision
  was investigated and is a zero-delta coverage artifact (insufficient/
  not_observed luck metrics on an 8-seed pilot), not a harm signal — all
  paired deltas exactly 0.
- Wall on this pilot (both legs identical): wins 0/8, national 0/8, table
  0/8, wave-5 unlocks 0/8, wave-5 faced 0/8, median survival 65d, max 140d,
  wave-4 kills 0 on all 8 seeds — no village banks a living veteran. The
  wall stands; this arm removes a self-contradicting narration line on
  the road to it, and claims nothing more.
- Evidence: evidence/2026-11-04/sim-holdbeatfix-b.md (+ prereg), corpus
  evidence/2026-11-04/perseed-holdbeatfix-b/ (18 files), panel artifacts
  holdbeatfix-panel-*.

## Arm 3 — sim-recoverylong-b: NO-GO — rule HELD, NOT merged
- Branch sim-recoverylong-b: rule cherry-pick 9c4cdefc7, prereg 1d5781e86,
  pilot 6a3d9f466. LANDING: only the prereg (213fff9c2) and pilot
  (7e7b620fa) commits were cherry-picked onto landing branch
  sim-recoverylong-land and merged --ff-only. The rule commit was
  EXCLUDED: zero src/ diff on the landing branch, master
  src/js/hierarchy.js contains 0 "faded" occurrences. Killed game-code
  arms leave no trace on master; the rule + proof stay HELD on branch
  sim-recovery-zombie-b (c42730d4d, 34/34).
- Setup verified: cherry-pick of c42730d4d clean, no conflict; proof
  scripts/test-recoveryzombie-20261104.js 34/34 green before verdict sims;
  own analyzer proof scripts/test-recoverylong-20261104.js 14/14 green
  (re-run on the landing branch and on merged master). No gates, win
  prices, or deed numbers touched; tend-through NOT bundled.
- Prereg (before any verdict sims): fresh seeds 99801-99808 (0 hits in
  evidence/2026-11-04/*.md and that day's corpus filenames at check time),
  substrate identical to the 0930Z zombie pilot (leadcourt.js verbatim,
  diplo instrument verbatim, 300d death-aware). Two legs, identical seeds:
  ARMED (rule on) + CONTROL (rule off).
- Verdict NO-GO, judged exactly as written: 0 clears on all 8 armed seeds
  AND all 8 control seeds. No re-proposal, no re-link, no diplomacy
  recovery after a clear on any seed. The survival-after-clear distribution
  is empty — the prereg's "zero clears surviving 35+ days = NO-GO" clause
  applies directly, and this is a stronger NO-GO shape than 0930Z's (1
  clear, 1-day window): here the precondition never occurs. No
  unregistered seeds swept, no expansion to 12-16.
- Armed identical to control on every seed — same days, trajectories, and
  death totals (409 deaths per leg). The rule is fully inert on this band.
  Cost bar PASS, vacuously: starvation 7 = 7, median survival 76.5 = 76.5.
  A cost bar cannot distinguish anything when the rule never fires; the
  informative result is the identity itself (zero measured cost, zero
  measured benefit).
- Per-seed (armed = control): 99801 104d holds-to-death · 99802 84d
  holds-to-death · 99803 103d collapses (drop on death day, pantry 0, link
  45→32 unseasoning — not trust-0, not a break) · 99804 27d never · 99805
  69d holds-to-death · 99806 29d never · 99807 48d never · 99808 161d never
  (max 2 seasoned at once).
- Wall: wins 0/8, survived 0/8; end scaleRank global 2, national 1,
  regional 2, village 3; wave-5 unlocks 0/8, wave-5 faced 0/8, wave-4 faced
  4/8; wave reach 4 on 4 seeds, 3 on 3, 2 on 1; readiness-5 days 0; median
  survival 76.5d, max 161d. Deaths 409/leg, 62% combat. Note: this fresh
  band dies sooner than the 0930Z band (median 76.5 vs 109) under the
  identical policy — a fresh band is not a longer-lived band.
- Sharpest finding — the next lever, named: the ONLY trust-0 links on this
  band are BELONG-direction (99808: three links, primary = another village,
  subordinate = haven, breaking on the death day) — out of this rule's
  Haven-primary scope, the same shape as 99401 in 0930Z. Haven-primary
  links here never go below formation trust 30 (one dip to 24); across
  both pilots, Haven-primary trust-0 in life has occurred on exactly 1 of
  16 seeds. Next runs should point at (1) a BELONG-direction clear (same
  rule shape, other direction), and/or (2) a survival-first substrate
  pre-registered for ≥200d life before any clear measurement.
- Sense-test: no faded line fires on this band — the lever is invisible to
  a player here. Visible beats are coherent (grief speaker installs, "bond
  dips, but holds" lines); gaps documented, not fixed: 99803's collapse has
  no line naming the unseasoning, and 99808's BELONG bonds sit at 0 with no
  line naming them.
- Evidence: evidence/2026-11-04/sim-recoverylong-b.md (+ prereg), corpus
  evidence/2026-11-04/perseed-recoverylong-b/ (16 files).

## Wall numbers (this run's judged corpora)
- Holdbeatfix pilot: wins 0/8, national 0/8, table 0/8, wave-5 unlocks 0/8,
  wave-5 faced 0/8, median survival 65d, max 140d.
- Approachfall pilot: wins 0, national 0/8, table 0/8, wave-5 unlocked 0,
  median survival 65 baseline / 62 armed, rank 'village' on all 16 legs
  despite standing to 200/230.
- Recoverylong pilot: wins 0/8, global 2 / national 1 / regional 2 /
  village 3 at end, wave-5 unlocks 0/8, wave-5 faced 0/8, wave-4 faced 4/8,
  median survival 76.5d, max 161d.
- Full seat still unwon, wave-5 kills still 0 in normal play.

## Telemetry deviation check
- ATTEMPTED on the approachfall corpus; REFUSED by the tool itself
  (recorder rows with top-level anchorCommit — same field-shape artifact as
  0930Z). No --allow-recorder-corpus workaround used, no compare fabricated,
  baseline NOT rolled. The run book's telemetry-check step does not fit
  sweep-recorder corpora as written; wall numbers above are reported from
  measured per-seed scale fields instead.

## Infrastructure
- Safe-commit index clobber hit on all worker commits across all three arms
  (and the pattern is now routine): repaired each time via HEAD-blob
  update-index --cacheinfo, commits verified correct, worktrees clean.
  No clobber on the coordinator merges (ff-only, no commit) — the landing
  cherry-picks committed clean.
- Approachfall worker: /tmp tmpfs fill from a full `git archive` of the base
  into /tmp (512M tmpfs) — recovered by file-first deletion; home disk fine
  at 30%. Never full-archive this repo to /tmp; stream via git cat-file.
- No EPERM flap blocked this run.
- check.js --quick on merged master: see section below (appended at closeout).

## Metric review
- Approachfall: the prereg's GO bars passed, but the pilot band carried no
  baseline loop signal, so the bars could not distinguish "fallback works"
  from "no loop exists here". Next prereg for the confirm must carry a
  baseline-signal bar (baseline loops ≥ 1) alongside the armed-zero bar —
  otherwise a thin GO repeats. The worker's "GO (thin)" label is the honest
  verdict form for this shape and is adopted here.
- Holdbeatfix: the prereg's fixture fallback (probe test when the 99101
  anchor case drifts) worked as designed; anchor drift itself is now a
  recorded finding (99101 needs re-finding per anchor). Future preregs
  using the balanced panel should state its review_required-on-zero-deltas
  rule up front.
- Recoverylong: the prereg's precondition clause ("zero clears surviving
  35+ days = NO-GO") judged cleanly. Metric review proposes, for the NEXT
  run, a precondition leg (does the clear condition occur at all?) and an
  "not exercised" cost verdict, so "no clears" is never misread as "clears
  don't help".
- No metric was re-scored mid-run on any arm.

## Next blanks, in order
1. Approachfall confirm on a loop-producing band with a baseline-signal bar
   (open question: reuse of fleerepair confirm band 99601-99612 vs a new
   exposure-dense band).
2. BELONG-direction zombie clear (same rule shape, other direction) and/or a
   survival-first substrate pre-registered for ≥200d life before any clear
   measurement (from recoverylong).
3. Floored tend-through variant with death-day deltas + wave-facing guard
   pre-registered (carried from 0930Z blank 2 — untouched this run).
4. BELONG-tending gap — belongseek panel with a policy that tends
   subordinate links (carried from 0930Z blank 3 — untouched this run).
5. 99101 hold-beat case re-finding per anchor (anchor drift recorded here).
6. wave5faced label rename (carried from 0820Z blank c — untouched this run).
NO gate/price/deed arm follows.

## Disposition
- scale-onramp stays converging (NOT converged): the hold-beat narration fix
  is landed, but the full seat is still unwon, wave-5 kills still 0, and
  polity recovery is still unproven (now on two pilots: the Haven-primary
  clear's precondition essentially never occurs in life).
- food-economy stays converging (untouched; sibling Loop A).
- All three worker trees released done-merged, branches deleted (recoverylong
  rule branch sim-recoverylong-b deleted with its tree; the rule itself stays
  HELD on branch sim-recovery-zombie-b). Main tree clean at closeout.
- Claim deleted; lock deleted. Merged locally, pending ship. No push, no
  bump, no live verification (ship loop owns deploys).

## check.js --quick on merged master (appended at closeout)
- Result: 284 passed, 6 failed in 766s (CHECK_EXIT 1; log:
  evidence/2026-11-04/sim-winnability-round-1030-checkquick.log).
- The 6 failures, all named: test-measurement-proof-update.js,
  test-measurement-workflow.js (retained neutrality proof), 
  test-mobile-combat-cadence.js (2 assertions), test-occupation-panels.js,
  test-phone-frame-proof.js (3 assertions), 
  test-establishment-r20-fixes-20261020.js (voice gate). None touch this
  run's files (game.js ordering move, competent.js policy + variant, arm
  instruments/proofs) except in the manifest sense below.
- Measurement-proof staleness is documented pre-existing (tracker rebuild
  header: the proof was already failing at tip because 7 Game files had
  moved); this run's game.js move does not newly break it — it was already
  red — and the proof refresh belongs to the ship loop, not this arm.
- This resolves the holdbeatfix worker's uncaptured 281/9 run: it does NOT
  reproduce on merged master (284/6, the same profile the approachfall
  worker recorded twice on its branch). The worker's 3 extra failures were
  never named and cannot be attributed; the merged-master profile governs.
- Arm proofs re-run green on merged master: holdbeatfix 10/10, approachfall
  ALL PASS, recoverylong 14/14.

