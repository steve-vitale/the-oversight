# Journey social life r172 — run note (Lane B, 2026-11-10)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5 and
writes 6 (crisis next) at closeout. Base: master 4717ed481
(journey-endgame r171 landed). Seeds 43401–43404 (fresh band,
verified in prereg), DAY CAP 140, policy journey (socialite base + real
conversations). Driver scripts/journey-social-life-r172-20261110.js,
analyzer scripts/analyze-journey-social-r172-20261110.js, helpers
scripts/journey-social-r172-helpers.js, proof
scripts/test-journey-social-r172.js + test-journey-social-r172-narr.js
+ test-journey-social-r172-coach.js + test-journey-social-r172-coachrepeat.js
+ test-journey-social-r172-agree.js + test-journey-social-r172-confess.js
(B1 tally, fixture-driven, ALL PASS pre-panel).

## Standing state at run start

- `git pull --ff-only` FAILED (diverging — local master ahead of
  origin; ship loop owns reconciliation; same standing state as
  r159/r163/r167). No origin merge attempted; landing is local-master
  only.
- The 10:00 occurrence's lock (16:13:48Z) had no registry match, but
  the r171 adoption coordinator was provably alive on
  journey2-endgame (heartbeat 18:54:02Z). The 11:00 and 12:00
  occurrences stood down on the same pattern. This 13:00 occurrence
  found the closeout FINISHED (tree removed, branch deleted, rotation
  5, lock gone) and created its own lock (run_id
  2026-11-10T18:59:07Z) only after verifying the tree was gone and
  the main tree clean. Main tree CLEAN, disk 34%.
- No live Lane B run at registration: journey2-social registered
  fresh (run_id 2026-11-10T19:05:16Z), heartbeat loop pid 11325
  (every 10 min).
- Base movement since r167: r167's coach-repeat + agree-pool fixes
  IN; r125 secret-line variety IN; r169/r170 succession conversation
  fixes IN; r123 observe-react fix IN; sim-roleform-b IN;
  sim-scholarcount-a IN (scholar kills count in the veteran bar);
  r171 M2b IN (probe-side only, zero src/js). Full list in the prereg.

## Pre-registration

evidence/2026-11-10/journey-social-life-r172-prereg.md — M1–M10 +
Q11, binding. Jobs: (A) continuity panel; (B1) double confession —
judge as pattern on the fresh panel (confrontDoubt/confrontTheft
wraps + CONFESS tally, new this run); (B2) M8 analyzer alignment
(re-raise = BLOCKED proposeLink after a settle; fresh re-links
reported separately); (B3) moots watch; (B4) face-beat recycle
watch; (C) carried watch tallies.

## Tooling changes this run (pre-panel, proven)

- Driver: confrontDoubt/confrontTheft wraps (read-only) with a
  sitting stamp into confrontEvents. Smoke SEED=43401 DAYS=5:
  exit 0, no errors, wraps installed (both true), 5 full
  conversations / 5 transcripts, scatteringEnd recorded.
  confrontEvents 0 at d5 (doubts accumulate over days — the panel
  is the real test; r167's people check proves doubt presses fire
  in the wild).
- Analyzer: M8 re-raise definition aligned to BLOCKED proposeLink
  after a link-forming settle; fresh re-links reported separately;
  unknown-pending raises listed and flagged, never silently
  counted. CONFESS panel rollup added.
- Helpers: tallyConfessions added (sittings with >=2 'confessed'
  outcomes; 'outside' confessions never grouped into a double).
- M8 REGRESSION CHECK (prereg promise): the fixed r172 analyzer
  re-run against the r167 JSONs reads M8 SETTLED (old analyzer:
  PARTIAL, 3 "re-raises"). The fixed run finds 0 blocked re-raises
  and 1 fresh re-link (43304, settle d13 -> raise d72,
  pendingBefore false — Sofia's re-link to village_0 after the d13
  link dissolved). The other two old "re-raises" (d70 village_0,
  d72 village_3) were villager-initiated bond_proposed events, not
  driver proposeLink calls — correctly outside the M8 loop-guard,
  which covers the driver's own propose/settle cycle. CONFESS on
  the r167 JSONs is 0 throughout (no confrontEvents field pre-r172)
  — the tally degrades gracefully.
- Carried proofs re-run pre-panel, all green: helpers 1/1,
  narr ALL PASS, coach ALL PASS, coachrepeat ALL PASS, agree
  ALL PASS, confess ALL PASS (new).

## Panel

Seeds 43401–43404, DAYCAP 140, policy journey. All four villages lost
(d72 / d96 / d139 / d116); 2/4 past d100; 2 scattered at the end.
298 full conversations, 290 transcripts read, 88 villager-initiated
bond proposals (87 villager, 1 scholar), 37 accepted. Full tallies in
evidence/2026-11-10/journey-social-life-r172-analysis.txt.

### Verdicts (binding prereg)

- M1 arming motive: NO DATA — 0 plots armed across all 4 villages
  (late d30+: 0), so the grievance-link question got no datapoint
  this run. A second observation (plotgate re-run, same 4 seeds,
  same outcomes) also shows 0 plots. r167 armed plots on real
  grievances; r172 armed none. NOT scored GO or NO-GO — the metric
  is silent at zero plots. See metric review.
- M2 villager-initiated bonds: ANSWERED — 88 bond_proposed
  (villager 87 / scholar 1), person-kind 40 (21 accepted), link
  raises 48 (16 accepted), per-initiator person max 4 (cap 8).
  End bonds 59 / 75 / 81 / 69. Seventh datapoint with the build
  live; villagers keep proposing on their own, accepting and
  refusing by character (chances 23–95%).
- M3 invite refusal: REPORTED — party accept 17 / decline 12;
  bond accept 9 / decline 3. Invitations sometimes taken,
  sometimes refused, both ways, split by inviter in the analysis.
- M4 sense: GO — 4/4 printed candidates read as real people.
  Aroha (43401): grief by the fire, then the naming debate, ends
  warm. Chloe (43402): "I wasn't a crossing guard. I was an
  interpreter. Someone I love needed the lie more than I needed
  the truth." Weiguo (43404): deflection, then "I don't actually
  want to belong somewhere. I want to find their family." The
  Benoit candidate (43403) is the double-confession defect itself
  (see B1) — otherwise coherent. React shape holds on the new
  base: goal-thread react offered 1986×, agree 0 / joke 0 /
  silence 1986; longest 'more' continuer run 4 (<5).
- M5 census guardrail: MET — 2/4 past d100. Sequence now ends
  …, 0/4 (r167), 2/4 (r172). A standing survival fact, not
  re-scored.
- M6 gossip-position: GO (gate definition) — 0 naming-beat lines
  emitted beyond radius-1 of Haven; 138 debates kicked, 137
  settled. Strict on-tile away total 43, reported as the known
  metric/gate definition discrepancy, does NOT fail M6 (prereg).
- M7 dedupe: HOLDS — 93 near-dup flags, 0 verbatim-identical
  pairs (re-scanned this closeout: 93 pairs, 0 identical), 0
  fallback "answer at length" hits. All pool-cycle (same core
  phrase, different nod suffix), never verbatim.
- M8 counter-settle: SETTLED (aligned definition) — 2 links
  formed via a driver settle (43401 d12 village_2, d71
  village_1), 0 BLOCKED re-raises, 0 fresh re-links after a
  settle. 16 proposeLink calls: 2 counter, 14 direct.
- M9 recap cap: HOLDS — maxPresses 5, 304 presses, 0 offered
  after cap, 0 cap failures.
- M10 coach variation: HOLDS — 0 verbatim NARR coach repeats
  in one sitting (panelMaxSameNarr 1).
- Q11 scattering capture: CONFIRMED — scattered / hungryDays /
  aliveEnd recorded for all 4 seeds.

### Jobs

- B1 DOUBLE CONFESSION: REPRODUCED (fourth datapoint) — 3
  double-confession sittings on the fresh panel (43402 s69
  theft+doubt; 43403 s139 doubt+doubt; 43403 s167 doubt+doubt),
  36 confront events, 16 confessed. GUARD LANDED:
  one-confession-per-sitting in src/js/truth.js (confrontDoubt +
  confrontTheft deflect on a second confess-candidate, flag on
  the convo object) and src/js/conversation.js (volunteered
  secret sets the flag; startConvo resets it per sitting).
  Proof: scripts/test-journey-social-r172-confessguard.js 17/17,
  test-journey-social-r172-confesswrap.js 4/4 (the wrap fix:
  one event per press — panel s69 looked like a theft+doubt
  double but was the driver-wrap artifact, one press recorded
  twice). CONFIRM re-run on the two double seeds (43402, 43403)
  with the guard: 0 double sittings (43402: 2 confessed;
  43403: 5 confessed). Side observation: 43403's fate changed
  on the confirm re-run — village survived to d140 with 7
  alive (panel: lost d139, 2 alive). The guard changes
  outcomes; noted, not claimed as an improvement.
- B2 M8 ANALYZER ALIGNMENT: done pre-panel. Fixed analyzer
  re-run against r167 JSONs reads M8 SETTLED (0 blocked
  re-raises, 1 fresh re-link). Fresh panel confirms the
  alignment: 0 blocked, 0 fresh.
- B3 MOOTS: 4 across the panel (1/2/1/0) — watch only, not 0.
- B4 FACE-BEAT RECYCLE: no verbatim face repeat in one sitting
  (NARR verbatimRepeats 0) — watch only.

### Village assessment (plain words)

Four villages, all lost, all to the wild first and foremost:
38 of 67 fallen died to "the wild", the rest to wounds, monsters,
strangers, betrayal (2 on 43403, 2 on 43404), and one arena death.
Nobody starved in large numbers (hungryDays 1–5). The social
layer is dense and alive — 298 real conversations, bonds passing
hand to hand as bearers die (43401: ten bearers in 72 days; 43403:
eleven in 139 days), villagers raising village links themselves
(48 raises, 16 accepted), moots and feasts happening (4 moots,
58 feasts). What the villages lack is not social life but
survival: the people talk, bond, grieve, confess — and then the
wild kills them anyway. The social layer does not move survival,
same as r167. The one senseless shape the panel caught — a
villager baring two different secrets in one sitting, back to
back, with the same windup — is now guarded: one secret per
sitting, the second press deflects.

### Reachable / fun / winnable (leg 5)

- REACHABLE: yes — conversations, bonds, confessions, moots and
  feasts all fire in wild play on fresh seeds, no harness-only
  paths.
- FUN: yes — the transcripts read as people (grief, lies told
  for love, naming debates, "someone I love needed the lie more
  than I needed the truth"), and the one joke-breaking shape
  (double confession) is fixed.
- WINNABLE: UNCHANGED — the social layer does not move survival;
  0/4 villages survived the leg window. Winnability stays with
  the survival chain, not this leg.

### Metric review

- M1 is silent at zero plots: its GO/NO-GO wording assumes ≥1
  plot arms. Propose for the next run: verdict NO DATA when 0
  plots arm, and if 0 plots recur a second panel running,
  investigate the plot-arming trigger (rarity hardening from
  watch to defect candidate, same shape as the moot rule).
- M4 near-dup flags (93) are all pool-cycle; the analyzer's
  jaccard threshold keeps flagging the same "we're still on X"
  continuer shapes. No action — pool depth, reported not failed,
  per the r163 wording. If a future run wants fewer flags, the
  lever is the continuer pool, not the metric.
- Telemetry: same l3.* keys as r167 vs baseline
  telemetry-baselines/social.json; the social driver never
  emits l3.* fields, so LOUD-disappeared lines are explained,
  not a bug. Baseline NOT rolled on a single 4-seed panel.

### Closeout (r173 adoption, 2026-11-10 ~21:00Z)

r172 timed out before closeout (~13:55 CST). This run adopted
the orphaned journey2-social tree: heartbeat 20:26Z was 30+ min
stale, no live processes, lock 2026-11-10T18:59:07Z 117 min old
(>90 min fallback) — stale-lock recovery, lock replaced with
run_id 2026-11-10T20:58:04Z. Adopted work verified, not
re-run: panel + confirm + plotgate evidence intact, all 8 r172
proof tests re-run green in-tree, check.js --quick re-run (see
below). No panel re-scoring: the panel judged the base as
landed; the guard was proven on its own tests + confirm re-run.

FLAP 21:41Z: EPERM write flap in progress at closeout time.
Registry heartbeat writes refused (PermissionError in
atomic_write_json), git ref writes refused (cannot write
.../.git/refs/heads/probe.lock); plain file writes still
succeed intermittently. Heartbeat stuck at 21:28:41Z. Per the
flap skill: no git writes attempted until a probe succeeds;
heartbeat + safe-commit retried on windows only. Next Lane B
occurrence (22:00Z) may misread the stale heartbeat — the flap,
not death, is the cause. DO NOT release or re-register
journey2-social while this run's lock (run_id
2026-11-10T20:58:04Z) is present; the branch + uncommitted
work below are live closeout state.

### Closeout (r174 adoption, 2026-11-10 ~22:00Z)

r173 adoption blocked on the host EPERM write flap at 21:41Z and left
the lock (run_id 2026-11-10T20:58:04Z) with the closeout pending. This
run (r174) did stale-lock recovery at 22:00:55Z (heartbeat 21:28:41Z
~32 min stale, no live procs), adopted the tree, and waited out the
flap: probes failed 22:06–22:21Z, window opened 22:23:21Z (O_EXCL +
git ref writes both succeeding). Adoption re-verified, not re-scored:
7/8 proof tests green in-tree; confesswrap failed only on the flap
(driver writeFileSync EPERM), re-run after commit. Measurement
proof refresh owed (balance-panel on the rebased tree +
balance-proof-update.js) — the guard changes the src manifest, so
the retained panel cannot cover it; the proofrefresh-b panel
(f21b474e4) predates the guard.
