# Journey endgame r264 — PRE-REGISTRATION (lane B, 2026-11-21 17:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run: the full cycle turned since the last leg-4 run — r259 endgame
(2026-11-20, rotation 4→5), r260 social life (5→6), r261 crisis (6→7),
r262 succession (7→4), r263 endgame (2026-11-21, rotation 4→5 by its
adoption), r260/r261/r262/r263 subsequent legs returning it to 4. The
rotation file reads 4 because the cycle completed, not because a write
was missed. This run plays leg 4 again and writes 5, social life, at
closeout ONLY after a verified landing — a failed or partial run does
not advance the leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r263
(endgame + succession, 2026-11-21). This run is r264 (max+1). NOTE: the
timed-out 1400Z succession attempt was schedule-labeled r264, but its
adoption closed it as r263 (prereg numbering); no r264 run note exists
on master, so r264 is free.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-21T22:55:32Z (run_id playtest-loop-2-20261121T2255Z).
- Main tree: `git status --short` at 22:55Z CLEAN (0 files). Disk 46%
  (fail line 85%).
- `git pull --ff-only`: "Already up to date." HEAD d1b71a8f6 at pull.
- `bash scripts/worktree-reap.sh`: SKIP — registry lock held by another
  reaper run (consecutive skips: 1); no cleanup this run.
- Registration: `worktree-register.sh journey2-endgame` completed
  22:56–23:11Z (~15 min; slow full checkout — the `git reset --hard`
  wrote under disk contention from sibling loops). QUEUED behind Loop A
  2215Z adoption's registration (sim-2215record-a, its `git reset --hard`
  ran 22:48–23:02Z, ~14 min) — the registry lock holder was LIVE, so
  the wait was correct, not a stale lock.
- STALE-BASE RECOVERY (this run): the register script's fallback
  attached the SURVIVING r263 branch (b6aad8942, 49 commits behind
  master — the r263 endgame adoption was flap-blocked at the gate and
  never deleted its branch). Branch had ZERO unique commits, so the
  worktree was brought current with `git reset --hard master` (45s,
  622 files) — exactly a rebase with no picks, no rebase machinery.
  Verified HEAD == master after the reset; the reset target had MOVED
  during the wait (Loop A 2215Z adoption landed c55bc8503 while the
  reset ran — tier4access NO-GO + killlootbundle INCONCLUSIVE round
  record). Worktree clean (0 dirty) after. Heartbeat landed at
  registration (23:20:53Z); hbloop r264 (setsid nohup, every 5 min,
  logging to hidden_files/journey-endgame-r264-heartbeat.log) started
  23:21Z.
- EVIDDIR set explicitly on EVERY pass invocation (r237 incident
  lesson).

SUBSTRATE: master c55bc8503 EXACTLY (worktree HEAD). No fix arm
pre-filed this run. A defect the panel surfaces is filed as an
F-item and fixed only under the r147 rule (planned before scored
seeds, own proof test, judged on the post-fix panel); a mid-run fix
otherwise gets its own proof + a re-run of affected passes, recorded
in the run note.

## What this run does NOT do (anti re-proof)

r263 ran the full 24-seed four-pass panel yesterday morning with ALL GO
verdicts, evidence-only, no src change. Re-running that panel would
re-prove a proven constraint (Steve 2026-11-01). This run does NOT
re-run passes A/C/C-wide/D. It mines the r263 corpus (already on
master) for the two carried questions, then runs ONE new-policy pilot
plus a diagnostic that rides the same sims.

## Mining already done (r263 corpus, 24 seeds — no sims spent)

Scripts: /tmp/mine-r263.js, /tmp/mine-r263-stall.js,
/tmp/mine-r263-stall3.js, /tmp/mine-r263-fates.js (scratch; the
findings below are frozen here).

- Q1 CAPSTONE READINESS (attempt days only, n=4 — one per converting
  seed): feast_embassy ready 4/4 AND military_tribute ready 4/4
  (payable 4/4: v3/p2 x3, v2/p2 x1). The embassy won the probe's
  delivery order all 4 times — tribute never delivered because the
  probe tries embassy FIRST, not because tribute is unavailable.
  trade_charter ready 0/4, blocker 'no-sealed-charter' 4/4,
  charteredLinks 0 on all attempt days. Deliveries: feast_embassy 4.
- Q2 STALL-199 (gated standing, analyzer M20 formula): 1,564 samples
  = 522.7 stall-days across 18/24 seeds (~3.0 samples/day); ALL
  defer5-bound, never cap/defer4. Fates: UNBLOCK 6 (rd5ready flips
  true, every one at rd5.veterans:2 — the second living wave-4
  veteran), REGRESSION 4 (rd4ready flips false — a veteran/armor loss
  crashes gated standing 199 -> 100, the peak-4 floor), PERSIST 8
  (still 199 at the sitting). 4/6 unblocked seeds converted to full
  (C 89702, C-wide 89851, D 89702, D 89705); 2 unblocked but sat
  lesser (A 89705, C 89705 — deed gate needs more than rd5ready).
  UNITS CORRECTION (carried to metric review): M20 daysAt199 counts
  TRACE SAMPLES (~3/day), not days — r263's "161 days at 199"
  (D 89703) is 161 samples = 53.7 days. This run reports days.
- Q3 M25d context: bought-then-lost = 89857 only (r263: 1/13, at the
  bar).

## Questions (frozen)

- Q1 STALL FATES (primary, measurement — first run of the r247
  stalled-while-ready metric, in DAYS): does the fate split
  (UNBLOCK/REGRESSION/PERSIST) reproduce on a fresh band under the
  tribute-first policy? Binding: stall-days per seed + fate split
  reported in days; the split itself is descriptive on this first
  run (no pass/fail bar on the split). UNBLOCK->full conversion is
  binding: unblocked seeds convert at the r263 rate (4/6 full) or
  the miss is investigated before any verdict.
- Q2 TRIBUTE-FIRST (primary, experiment): does delivering
  military_tribute when ready+payable produce full seats? Probe
  policy change: delivery order tribute-first (TRIBUTE_FIRST=1),
  all other flags identical to Pass C (CAPSTONE=1, BUYOUT=1,
  BUYOUT_EARLY=1). Pass T on matched seeds 89701–89705. Binding:
  tribute deliveries >= 1 — if zero, the policy change failed to
  engage and the experiment is VOID (not a NO-GO). Full seats on
  Pass T vs r263 Pass C (1/5) judged descriptively (n=5, no
  significance bar); kills / vet counts / deed-gate days reported.
- Q3 CHARTER CENSUS (diagnostic, rides the same sims): why is
  trade_charter never ready? New daily sampling: hierarchyState
  (active trade links, chartered count) + per-kind readiness saved
  on EVERY peak>=3 day (not just attempt days). Binding: the census
  must name the blocker distribution across the panel (no-links vs
  links-unchartered vs chartered-but-not-ready). If chartered links
  exist on any seed-day, "never available" is revised; if zero
  across the panel, the charter is unreachable in practice and the
  finding goes to the run note as a DESIGN OBSERVATION — no game
  change without a Steve call (the charter's preconditions are a
  design question, not a defect visible from the sim).
- Q4 M25d (carried, binding, bar stays <=1): bought-seed losses on
  this run's bought seeds. r263 read 1/13, at the limit.
- Q5 DIALOGUE HOLDS (people check): the head deltas are all dialogue
  — the panel transcripts are checked for: deflect-promise
  never-again lines = 0 (r262 fix holds), resume-quote-kind
  mismatches = 0, witness-line 'Names, named.' = 0, settled re-ask
  names the favor, namebeast opens the just-told beast. Any miss is
  an F-item, not a panel verdict by itself.

## Panel plan (pilot-first)

- Probe: scripts/probe-endgame-r264-20261121.js (r263 probe verbatim
  EXCEPT renames r263->r264, evidence dir 2026-11-21/perseed-endgame-r264*,
  header, substrate comment c55bc8503, + TRIBUTE_FIRST order flag +
  CHARTER daily census + capstoneReadinessDaily — verified by diff:
  only renames, dates, comment reflows, the substrate comment, and
  the three new instruments; zero other logic change).
- Analyzer: scripts/analyze-endgame-r264-20261121.js (r263 analyzer
  verbatim EXCEPT input dir, r263->r264, + STALL-FATES section
  (days + fate split, M20 formula) + TRIBUTE-FIRST section +
  CHARTER-CENSUS section — verified by diff the same way).
- Clone: scripts/clone-endgame-r264.py (r263 clone script verbatim
  EXCEPT r263->r264 renames, WT path, header lineage; the byte/char
  `robust_write` fix from the r246 adoption is carried; the
  `--print-probe` / `--print-analyzer` bash-redirection fallback is
  the escape hatch if the flap flickers during cloning).
- PILOT: Pass T on seeds 89701, 89702 only. If no tribute delivery
  fires on either (policy fails to engage), STOP per PILOT FIRST —
  document and move on, do not burn the full panel.
- EXPAND (only if the pilot engages): Pass T full 5 seeds
  (89701–89705). C-wide fresh band (8 seeds, TRIBUTE_FIRST on) ONLY
  if the clock allows after the T5 analysis — decision point at
  pilot analysis; the C-wide band needs a freshness check first
  (local_seed_band_freshness skill) and is NOT frozen here.
- Dark probe: SKIPPED — no delta since r211 touched the dark table
  (r211 skipped on the same reasoning; r219/r225/r230/r233/r237/r239/
  r243/r246/r249/r255/r259/r263 skipped too).
- COMPETENT_PIN=r127 support already in the tree.
- NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
- M2b GREEN from r182 — no re-sweep (carried as proven).
- FIGHTALLY2 stays OFF — this run does not touch it (eighth sighting
  stands; the turn-on decision is owed, not taken here).

HEAD DELTAS SINCE r263 SUBSTRATE (b6aad8942 -> c55bc8503, verified by
`git diff b6aad8942..HEAD -- src/js`, 183 lines, 7 files). Classified:
LIVE (behavior changes under the default panel — ALL dialogue/social):
(a) OWED WALK (scale r249, betrayal.js): a fever-vetoed walk the player
    said yes to comes back first once the villager is well — the SAME
    walk, and the withdrawal names the reschedule. LIVE dialogue.
(b) WITNESS-LINE RETURN (crisis r262 fix 4, betrayal.js): nameWitnesses
    returns the line; the caller speaks it instead of 'Names, named.'.
    LIVE dialogue.
(c) QUOTE-KIND MATCH (crisis r262 fix 3, conversation.js): a resume
    quote drops when the favor changed kind since planting. LIVE.
(d) SETTLED-FAVOR NAMES THE FAVOR (landing r152, conversation.js):
    the handled re-ask pool names the settled favor when it carries a
    speakable short. LIVE dialogue.
(e) NO NEVER-AGAIN PROMISE (crisis r262 fix 2, convo-wants.js): the
    deflect variants promise a pause, never forever. LIVE dialogue.
(f) NAMING RECENCY (landing r152, game.js): lastToldBeast recorded;
    namebeast kicks the just-told debate on the spot same-day. LIVE.
(g) build.js version stamp only.
ENV-GATED OFF by default (no effect on the default panel):
(h) KILLBUNDLE (killlootbundle-a, game.js): searcaster + 2 fusion
    cells, KILLBUNDLE=1 only, default OFF (INCONCLUSIVE pilot).
(i) PROFILEGATE4 (profilegate-b, villager-brain.js + win-plan.js):
    companion-pick gate relaxation for needWave>=4 plans,
    PROFILEGATE4=1 only, default OFF.
(j) TIER4ACCESS: REVERTED at tip (no contests.js in the diff;
    game.js/contests.js byte-identical to 5accf69db per the adoption
    record). No live code.
(k) d3refreeze2 (bcc59bcd4): GO re-judge, no default flip — no live
    src change under the default panel.
No delta touches table.js, standing.js, progression.js deed gates, or
the capstone paths — the endgame panel measures the same game as r263
on those paths, with cleaner dialogue. The r263 comparison is valid.

## Telemetry

Baseline: hidden_files/telemetry-baselines/endgame.json (uw 22 / won 4 /
peakVet 3, per the r263 revert). Telemetry check runs on the Pass T
per-seed glob with the same metrics; baseline NOT rolled without
adjudication (a LOUD line is investigated first, per the body).

## Metric review (to fill at closeout)

- M20 samples-vs-days units correction (see Q2 mining above).
- peakVet baseline (3, per r263 revert).
- FIGHTALLY2 (stays OFF; eighth sighting stands).
- M25d (bar <=1; r263 1/13 at the limit).
- NOTICK/CARRY (vacuous, sixth straight zero if it holds — the
  instrument keeps measuring nothing).
- Standing-199 stall fates (first run, Q1).
