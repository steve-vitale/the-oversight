# Journey endgame r267 — PRE-REGISTRATION (lane B, 2026-11-22 05:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run: the succession r266 adoption advanced rotation-b 7→4 at
~10:20Z on 2026-11-22, and this run plays leg 4 and writes 5, social
life, at closeout ONLY after a verified landing — a failed or partial
run does not advance the leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r266
(succession adoption, 2026-11-22). This run is r267 (max+1). No r267
run note exists on master, so r267 is free. (r263 was shared by the
crisis and endgame legs on different days; r267 is unused by any leg.)

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-22T10:55:47Z (run_id playtest-loop-2-20261122T1055Z).
- Main tree: `git status --short` at 10:55Z CLEAN (0 files). Disk 45%
  (fail line 85%).
- `git pull --ff-only`: "Already up to date." HEAD dd740ad83 at pull.
- `bash scripts/worktree-reap.sh`: SKIP — registry lock held by another
  reaper run (consecutive skips: 1); no cleanup this run.
- Registration: `worktree-register.sh journey2-endgame` completed
  10:58–11:06Z (~8 min; slow full checkout under sibling-loop disk
  contention). Worktree HEAD == master dd740ad83, clean. Heartbeat
  landed at registration (script run immediately after; see run note
  for the timestamp — the hbloop (setsid nohup, every 5 min) starts
  after this prereg commit.
- Write flap: probes OK at 10:55Z (new-file writes in /tmp succeed,
  shell + python). Last flap window ended ~09:31Z with a machine
  replacement; watchdog cycles 09:48–10:06Z all ALL-OK; main-session
  verification at ~10:07Z confirmed writes OK. The flap has returned
  mid-boot before, so writes are verified per commit, not assumed.
- Gate slot: Loop A 0815Z adoption gate (`check.js --quick`,
  /tmp/jest-cache-0815-gate, pid 43903) was RUNNING at 11:0xZ. This
  run's gate serializes after it.

SUBSTRATE: master dd740ad83 EXACTLY (worktree HEAD). No fix arm
pre-filed this run. A defect the panel surfaces is filed as an
F-item and fixed only under the r147 rule (planned before scored
seeds, own proof test, judged on the post-fix panel); a mid-run fix
otherwise gets its own proof + a re-run of affected passes, recorded
in the run note.

## What this run does NOT do (anti re-proof)

r263 ran the full 24-seed four-pass panel with ALL GO verdicts, and
r264 ran the tribute-first pilot (VOID) plus the charter census and
the first stall-fates run in days. Re-running passes A/C/C-wide/D
would re-prove proven constraints (Steve 2026-11-01). This run does
NOT re-run them. It runs ONE new-policy pilot on a FRESH band plus
diagnostics that ride the same sims.

## Head deltas since r264 substrate (c55bc8503 -> dd740ad83)

`git diff c55bc8503..HEAD --stat -- src/js`: 10 files, 802 insertions,
64 deletions. Classified by reading the diff and the commit messages:

LIVE (behavior changes under the default panel):
(a) PLANWAKE (establishment r265, 52bbec5e6, win-plan.js + villager-
    brain.js + favor-forage.js + favor-water.js): the plan store now
    wakes live on establishment — plans ignite earlier in a run.
    This is the one live delta that can move the endgame chain
    (launches -> wave-4 kills -> veterans -> deed gate). The fresh
    band measures the chain as it now plays; same-seed comparisons
    to r263/r264 are descriptive only, per r264's RNG-drift note.
(b) DEPARTBEAT (departbeat-b, e5c8b4633, villager-brain.js +
    win-plan.js): an ordinary wave-4+ departure beat, default-ON —
    holder+party+target, once per launch. Narration only.
(c) CRISIS r263 FIXES (924626218, conversation.js + fieldFights.js):
    stuck-key flee counter (monster+day) — live fight behavior; and
    the sitting-favor settled-closer gate — live dialogue.
(d) SEARVOICE / CROSSVOICE volley narration (b5fb12e10, a730a0612,
    fieldFights.js): searcaster/crossbow/sling volleys read as their
    own weapons, not bows. Narration only — "chance, damage and ammo
    spend are untouched" (code comment, verified in the diff).
(e) GUNLIFE tracer fix (b50562d2e): scripts-only (tracer + proof
    test); no src/js change.
ENV-GATED OFF by default (no effect on the default panel):
(f) DOORFLEE2 (4266e6cce): leader-survival-only hold, DOORFLEE2=1
    only; off-mode byte-identical per the code comment.
(g) DMGPIN (same commit, fieldFights.js): pinned-quad coordinated
    strikes, DMGPIN=1 only; off-mode byte-identical.
(h) HYPOFLOOR (4681e740f): hypo floor for pinned-door flee, env-gated
    OFF, NO-GO on F1.
(i) TIER4POOL (fa9d00a6b, game.js): TIER4POOL=1 only (node sims).
(j) PROFILEGATE4: still env-gated OFF (unchanged since r264).
(k) build.js version stamp only.
No delta touches table.js, standing.js, progression.js deed gates, or
the capstone paths — the endgame panel measures the same deed-gate
game as r264, with PLANWAKE as the live change to watch.

## Fresh band (local_seed_band_freshness skill)

Band **107329–107336** (8 seeds). Freshness check, run before this
prereg was written:
- Searched `evidence/*/sim-*-prereg.md` and
  `evidence/*/journey-*-prereg.md` for 107329–107336: NO hits.
- Searched all dated `evidence/*/*.md` for 107329–107336: NO hits.
- Searched goal `hidden_files/*.md` for 107329–107336: NO hits.
- No forbidden/contaminated band list file exists under evidence/.
- Neighborhood: the highest 1073xx band named in sim preregs is
  107321–107328 (gunlife-a / launchfield-b); 107313–107320 is
  killrate-a; 107297–107304 is tier4gate-a. 107329–107336 is adjacent
  and unnamed anywhere. FRESH.

## Questions (frozen)

- Q1 TRIBUTE-FIRST (primary, experiment — carried from r264, still
  VOID in the wild): does delivering military_tribute when ready+
  payable produce full seats on a FRESH band? Probe policy change:
  delivery order tribute-first (TRIBUTE_FIRST=1), all other flags
  identical to r264 Pass T (CAPSTONE=1, BUYOUT=1, BUYOUT_EARLY=1).
  Binding: tribute deliveries >= 1 on the pilot — if zero, the policy
  change failed to engage and the experiment is VOID again (not a
  NO-GO); the pilot stops per PILOT FIRST. Full seats on Pass T vs
  r263 Pass C (1/5) judged descriptively (small n, no significance
  bar); kills / vet counts / deed-gate days reported.
- Q2 W5-FACING (primary, diagnostic — new, from r264's finding):
  both r264 pilot seeds faced only 1 of 2 wave-5 types, so the deed
  gate stayed shut even after the stall unblocked. Census: distinct
  wave-5 types faced per seed at the sitting (analyzer-side, from
  the existing w5FaceEvents/facedIds fields — no probe change).
  Binding: the distribution is reported (0/1/2 types faced per
  seed that reaches the table). If w5>=2 holds on fewer than half
  the pilot seeds that reach the table, the gate's w5 bar is named
  as the binding constraint — a DESIGN OBSERVATION, not a defect
  (the bar is Steve's design; the measurement is the finding).
- Q3 STALL FATES (carried, measurement — second run, in DAYS):
  does the fate split (UNBLOCK/REGRESSION/PERSIST) reproduce on a
  fresh band under the tribute-first policy? Binding: stall-days
  per seed + fate split reported in days (samples / samples-per-day,
  per the r264 units correction); the split itself is descriptive.
  UNBLOCK->full conversion reported against the r263 rate (4/6)
  descriptively.
- Q4 M25d (carried, binding, bar stays <=1): bought-seed losses on
  this run's bought seeds. r263 read 1/13, at the limit.
- Q5 DIALOGUE HOLDS (people check): the head deltas are mostly
  dialogue/narration — the panel transcripts are read IN FULL and
  checked for: deflect-promise never-again lines = 0 (r262 fix
  holds), resume-quote-kind mismatches = 0, witness-line 'Names,
  named.' = 0, settled re-ask names the favor, namebeast opens the
  just-told beast. PLUS the two new live narration lines read for
  sense: the DEPARTBEAT departure beat (holder+party+target named,
  once per launch, not a bare-ground repeat) and the searvoice/
  crossvoice volley lines (weapon named correctly, no bow language
  on a gun/crossbow/sling). Any miss is an F-item, not a panel
  verdict by itself.

## Panel plan (pilot-first)

- Probe: scripts/probe-endgame-r267-20261122.js (r264 probe verbatim
  EXCEPT renames r264->r267, evidence dir
  2026-11-22/perseed-endgame-r267, header, substrate comment
  dd740ad83, + PLAN-map entries 107329–107336 (107329–107330
  'wavesnw', 107331–107336 'waves', per the C-wide band pattern) —
  verified by diff: only renames, dates, comment reflows, the
  substrate comment, and the PLAN-map addition; zero other logic
  change).
- Analyzer: scripts/analyze-endgame-r267-20261122.js (r264 analyzer
  verbatim EXCEPT input dir, r264->r267, + W5-FACING section
  (distinct w5 types faced per seed at sit, from facedIds) —
  verified by diff the same way).
- Clone: scripts/clone-endgame-r267.py (r264 clone script verbatim
  EXCEPT r264->r267 renames, WT path, header lineage; the byte/char
  `robust_write` fix from the r246 adoption is carried).
- PILOT: Pass T on seeds 107329, 107330, 107331, 107332 (2 wavesnw +
  2 waves). If no tribute delivery fires AND no deedGate-ok day
  occurs on any of the four (policy fails to engage AND the gate
  never opens), STOP per PILOT FIRST — document and move on, do not
  burn the full band. If either engages, EXPAND to the remaining
  four seeds (107333–107336).
- Dark probe: SKIPPED — no delta since r211 touched the dark table
  (r211 skipped on the same reasoning; r219/r225/r230/r233/r237/r239/
  r243/r246/r249/r255/r259/r263/r264 skipped too).
- COMPETENT_PIN=r127 support already in the tree.
- NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
- M2b GREEN from r182 — no re-sweep (carried as proven).
- FIGHTALLY2 stays OFF — this run does not touch it (tenth sighting
  stands; the turn-on decision is owed, not taken here).

## Telemetry

Baseline: hidden_files/telemetry-baselines/endgame.json (uw 22 / won 4 /
peakVet 3, per the r263 revert). Telemetry check runs on the Pass T
per-seed glob with the same metrics; baseline NOT rolled without
adjudication (a LOUD line is investigated first, per the body).

## Metric review (to fill at closeout)

- M20 samples-vs-days (r264 correction: report days).
- peakVet baseline (3, per r263 revert).
- FIGHTALLY2 (stays OFF; tenth sighting stands).
- M25d (bar <=1; r263 1/13 at the limit).
- NOTICK/CARRY (vacuous, seventh straight zero if it holds).
- M1/M6 on pilots (structural on a 4-seed pilot: M1 needs >=3 seeds
  reaching the window — reachable; M6 needs >=1 deferred sit).
- M23 vs TRIBUTE-FIRST (same fact scores NO-GO under M23 and VOID
  under TRIBUTE-FIRST on a pilot; the run note adjudicates).
- W5-FACING (new — first run of the census; no bar, descriptive).
