# sim-winnability-chain-round-1730

Run fleshout-loop-b-20261123T1730Z, Loop B, axis winnability-chain.
ADOPTION of the timed-out 1430Z round — both workers done, coordinator dead,
nothing merged. No new sims in this run; both arms verified from git/files,
rebased onto current master, proofs re-run green, merged ff-only.

## Stale-lock recovery

- B lock held `fleshout-loop-b-20261123T1430Z` (created 14:34:34Z).
  At run start 17:30Z: lock 2h55m old; registry heartbeats for the run's
  trees (sim-killbundle-b 82 min, sim-gatehorizon-b 67 min) stale past the
  15-min guard; `ps` showed no coordinator, heartbeat, or fleshout
  process; machine uptime 3 min (restart ~17:27Z killed everything).
  Lock older than the 90-min fallback → deleted in the same call it was
  re-read in, replaced with `fleshout-loop-b-20261123T1730Z` 17:33:20Z.
- 1430Z claim retired to `.DEAD`; this run's claim written
  (`fleshout-loop-b-20261123T1730Z.json`: arms killbundle-b +
  gatehorizon-b, axis winnability-chain).
- NOT touched: Loop A 1415Z arms (muster-a / planform-a — main-chat
  adoption; both merged during this run, 5fc503d9e / 16de94e71) and the
  Loop B 1230Z closeout (doorstage-b — live main-chat adoption agent;
  merged fdd90bb48, record 7b5bc0571 landed mid-run).

## Arm 1 — sim-killbundle-b: GO (merged 97cf9d7c2)

KILLBUNDLE=1 judged on the kill-loot path (lever landed in
sim-killlootbundle-a 48c1a692a; this arm judges only, no game-code
change). Frozen prereg rule (§7): GO = bars 1, 2, 5, 6, 7 pass AND
(bar 3 OR bar 4 passes). Verified from the raw corpora, not the
worker report: armed analysis klArrivals 1, klBundled 1, klDry 0,
klVolleys 0, holderDaysCells 69, 0 errors, 49 seeds; staged analysis
16/16/0, 2 volleys, 4 shots; panel decision review_required both legs.

- Bar 1 instrument validity: proof 12/12, selftest 17/17, killrate
  36/36, analysis 14/14, killarrive-b 12/12, killbundle-b 11/11 pre-run
  + 11/11 live — re-run green on both rebased trees (see below).
- Bar 2 cells-at-arrival: 17/17 arrivals carry exactly 2 cells, 0 dry.
- Bar 3 matched primary: MISS, diagnosed — the single natural arrival
  (Jorge Silva, 107533, d19) carried 2 cells 69 days through 15 fights,
  all waves 1–3; CELLGATE held every volley (fire probability exactly 0).
- Bar 4 staged primary: PASS — 2/16 staged holders fired: Emma Larsen
  107539 d51 wave-4 suburb, 2 shots / 1 hit / 68 dmg; Caleb Jones
  107542 d100 wave-5 spoiler, 2 shots / 2 hits / 132 dmg. Per-arrival
  fire rate 12.5% (Wilson 3.5–36.0%); per-fight at wave 4+: 2/2.
- Bar 5 tier-4 no-regression: armed 31/399 = 7.77%, byte-identical to
  ctl (same 31 rolls, same seeds).
- Bar 6 guardrails: starvation 16 = 16, median survival 149 = 149.
- Bar 7 panel: review_required; 1 descriptive, 6 no_material_signal,
  24 not_observed; every paired delta 0.
- Bar 8 re-arm record + sense-test: delivered (§5 + §4). No holder
  re-arms anywhere (0 re-arms after firing; no cell gains beyond the
  bundle). Only second life is the scholar taking a gun/cell from a
  holder's corpse (2 of 17 arrivals).

Verdict GO per the frozen rule (bar-3 miss + bar-4 pass = GO with the
miss diagnosed — not a re-score; the analyzer's own NO-GO is its
narrower matched-pair rule only). The bundle is done: the binding
constraint has moved to CELLGATE's wave floor vs the holder's fight
mix (100 of 102 staged fights below wave 4) plus the absent re-arm
path. Finding [claimed] (KILL-LOOT GUNS ARRIVE DRY AND NEVER FIRE)
is judged; its two successor constraints were already in
sim-findings.md (CELLGATE holds every volley below wave 4; no re-arm
path exists) — verified present, no duplicate append by this run.

Landing: rebased twice (ba7e17d5b, then 7b5bc0571 after the 1230Z
adoption record landed); proofs re-run green on each rebased tree
(11/11, 11/11 live, 12/12, 17/17, 36/36, 14/14, 12/12); merged
ff-only 7b5bc0571 → 97cf9d7c2, 113 files, +1,122,772/−2. Zero src/js;
one instrument-script change (killlootbundle-driver-a.js STAGE_SEAR
hook, 30 lines).

## Arm 2 — sim-gatehorizon-b: DIAG-NO-GO SUPPLY-THIN (merged 9f329a6a5)

150-day horizon judge of the leader-projection gate (LEADERPROJ=1,
default OFF; zero src/js). Verified from the raw analysis JSON:
supply 5/8 scored both legs (need 6) → FAIL; H1a pool-door leader
deaths 0/0 (need armed ≤ control − 1) → FAIL; H1b downstream wave-4
kills 37 → 14 (need ≥ 36) → FAIL; starvation guardrail 1 → 6 (need
≤ 3) → FAIL; village deaths 896 → 774 PASS; median survival 90 = 90
PASS; D5/D6 no instrument errors PASS. Panel review_required, no
village-death regression signal. Verdict DIAG-NO-GO SUPPLY-THIN,
pilot only, no confirm spend.

- The gate fires 29 times and refuses all five staged doors — but
  every refused door was winnable on control (5/5 killed, 0 leader
  deaths), so refusals cost wave-4 kills instead of saving leaders
  (14 vs 37 downstream; wave-5 kills 14 → 1; wave-5 unlocks 8 → 6).
- The leaders who actually die in wave-4 fights die on unpinned doors
  the gate never sees: all six armed-leg low-HP deaths unpinned, none
  fire-covered; armed 109104 byte-identical to control.
- Instrument defect (metric review §7, recorded not re-scored): the
  frozen H1a flag reads `p.dead` synchronously after fieldFight, but
  the game sets the death flag at settlement — 9 same-day monster
  deaths of leaders who entered wave-4 fights at ≤75 HP read as
  survived. A follow-up arm must attribute via the deaths log under a
  fresh prereg, stage on organic unpinned doors or earlier, and log
  every staging-boundary check.
- One paired divergence in the wrong direction: 109105 control won
  global d90, 0 starvation; armed lost the village regional d76, 4
  starvation (observed, not proven causation).

Landing: rebased twice (97cf9d7c2 after the killbundle merge, then
506f922ce after the 1230Z adoption's record correction); proof
test-gatehorizon-b.js 32/33 on the 97cf9d7c2 base — the single miss is
§6's nested spawn of test-leaderproj-b.js at 54/55, adjudicated as a
load flake: the same test standalone on the same rebased tree passes
55/55 TWICE, and nothing in the intervening master moves touches the
leaderproj gate (killbundle changed only the killloot driver + test;
muster/planform/doorstage are separate instruments; r268 is journey
evidence). On the final 506f922ce base the rebase delta is evidence-
only (2 round-record files, 0 lines in any arm file or code), so per
the 2115Z precedent the re-proof is a 0-line arm-file diff check plus
an analyzer re-run on the committed corpora, which reproduces the
frozen verdict EXACTLY (DIAG-NO-GO SUPPLY-THIN, all bars identical).
Merged ff-only 506f922ce → 9f329a6a5, 28 files, +58,666.

## Wall numbers (this round's judged corpora)

- Killbundle matched 49 seeds: wins 0/49, national 0/49, table not
  instrumented, wave 5 18/49, wave 4 49/49, median survival 149d,
  villages lost 25/49. Staged 16: wins 0/16, wave 5 11/16.
- Gatehorizon pilot 8+8: wins 6/8 both legs, national 7 vs 6, table
  entered 6/8 both, wave 5 8 vs 6, median survival 90d both.
- The scale wall still binds on the killbundle band (best standing 650,
  regional ceiling); the gatehorizon band wins through the table path
  on the capable policy with the gate off — the gate itself changes
  how villages fight wave 4, not whether they win.

## Telemetry deviation check

- Killbundle armed corpus (49 seeds): exactly the 3 LOUD regime lines
  (national 12→0, table 16→0, wins 16→0), exiled quiet — EXPLAINED
  regime artifact (competent-policy pre-seat substrate vs the
  WINSEAT-regime baseline; the baseline's own _regime note predicts
  it). Baseline NOT rolled.
- Gatehorizon control + armed corpora (8 seeds each): the same 3 LOUD
  lines per leg (national 12→0, table 16→0, wins 16→6, −62%). The wins
  line differs from the usual 16→0 because this band runs the capable
  policy and actually wins 6/8 — control and armed are IDENTICAL (6/8
  both), so the arm caused zero win change; the line is the same
  regime artifact, not a regression signal. Baseline NOT rolled.

## Infrastructure

- Machine restart ~17:27Z killed the 1430Z coordinator and every
  heartbeat loop (uptime 3 min at run start); all registry heartbeats
  67–82 min stale. Post-restart git was extremely slow on the cold
  cache: main-tree `git status` took 573s; the Lane B finisher's
  journey2-7 merge and the 1230Z adoption's `git worktree add` each
  ground for 6+ min in R state before completing.
- Master moved under this run: ship bump 6d8478d00 (16de94e71-20261123-
  172503) + journey-succession r268 merges (ba7e17d5b) + 1230Z adoption
  record (7b5bc0571) — zero file overlap with either arm; both branches
  rebased clean (no conflicts, no rebase-quirk stops), proofs re-run
  green after every rebase.
- Safe-commit index clobber: NOT struck on this run's merges (ff-only
  merges, no safe-commit calls by the coordinator).
- Main tree at closeout: clean (`git status --porcelain` empty).
  The Lane B finisher's untracked journey-succession-r268 logs seen
  mid-run were committed by the finisher before closeout (master log
  shows the r268 gate commits ba7e17d5b / 8acc75177 / 05c28484c).

## Gate

check.js --quick on the merged tip 9f329a6a5 (log
hidden_files/check-quick-1730.log): **339 passed, 5 failed in 713s,
0 attributable**. The 2 timeouts (living-garden, one-person-army —
the same pair as the 1415Z gate) re-ran green standalone, serialized,
on the same tip (exits 0, 114.9s / 83.8s; log
hidden_files/check-quick-1730-standalone.log) — load flakes,
confirmed. The 3 remaining failures are the standing staleness set
(measurement-proof-update, measurement-workflow, phone-frame-proof —
proof inputs not current / stale phone receipt). None touches any
1730Z arm file (killbundle driver/test, gatehorizon driver/analyzer/
test, or any evidence file). The gate result stands for the merged
tip; master did not move during the gate.

winnability-chain stays converging (NOT converged): the kill-loot gun
now demonstrably fires when loaded, but wins are still 0 on the
killbundle band and the gate's horizon effect is unmeasurable on its
band — the chain's next blanks are the CELLGATE wave floor / re-arm
path (design calls) and a re-prereg'd gate-horizon attribution.
Next blanks in order: (1) CELLGATE floor vs kill-loot fight mix —
design call on moving the floor or giving holders a path to wave-4+
fights; (2) searcaster re-arm path — what re-arms a holder
(crafting? corpse takes? trade?); (3) gate-horizon re-prereg with
deaths-log attribution + organic unpinned doors + boundary logging;
(4) departsafe re-judge under the bid-inclusive det-gate bound (no
new sims; still open from the 1315Z tracker entry).

Merged 97cf9d7c2 (killbundle) + 9f329a6a5 (gatehorizon); round record
evidence/2026-11-23/sim-winnability-chain-round-1730.md.
Claim deleted; lock deleted.
