# Journey endgame r270 — PRE-REGISTRATION (lane B, 2026-11-22 21:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run: the endgame r267 adoption advanced rotation-b 4→5 and the
social r266 adoption advanced it 5→6, but later Lane B occurrences
stood down / closed out without advancing, and the rotation file
reads 4 again at this run's start (verified 02:55Z, run_id
playtest-loop-2-20261123T0255Z). This run plays leg 4 and writes 5,
social life, at closeout ONLY after a verified landing — a failed or
partial run does not advance the leg, per r135/r138/r140/r194
precedent.

Run number basis: the highest journey run number on disk is r269
(deepening, 2026-11-22); r268 is the establishment leg, same day.
This run is r270 (max+1). No r270 run note, prereg, probe, or
analyzer exists on master, so r270 is free.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-23T02:55:32Z (run_id playtest-loop-2-20261123T0255Z).
- Main tree: `git status --short` at 02:55Z CLEAN (0 files). Disk 50%
  (fail line 85%).
- `git pull --ff-only`: "Already up to date." HEAD a4603add1 at pull;
  master then moved to ff17699c7 (sim-wornstack-a landing) before
  registration, so the worktree substrate is ff17699c7.
- `bash scripts/worktree-reap.sh`: SKIP — registry lock held by a
  live reaper run (consecutive skips: 3, ALERT threshold reached);
  the holder was a live reaper python (pid 43584, started 02:43Z).
  No cleanup this run, nothing reaped, lock NOT touched.
- Registration: `worktree-register.sh journey2-endgame` completed
  02:56–03:14Z (~17 min; slow full checkout under sibling-loop disk
  contention + registry-lock jam: lane A `journey-landing`
  registration held the registry lock from 02:59Z, and a
  `worktree-release.sh sim-dawnchoke-rejudge-a` release was also
  queued on it — all holders live and legitimate, verified via
  fuser). Worktree HEAD == master ff17699c7, clean. Heartbeat landed
  at registration (02:58:51Z, written by the register script).
- Heartbeat jam: the first two manual heartbeats (03:16Z, 03:20Z)
  FAILED — "registry lock held > 120s" — same jam. The hbloop
  (setsid nohup, every 5 min, r270 script) started 03:20Z to retry.
- MACHINE RESTART ~03:23Z (uptime 1 min at 03:23:48Z): the restart
  killed the hbloop (pid 56188) and the lane A registration. The
  run's lock file survived; the registry entry survived (heartbeat
  02:58:51Z, ~25 min stale at restart). Per the restart protocol the
  heartbeat was re-established FIRST (03:24:01Z, landed clean — the
  jam cleared with the restart) and the hbloop restarted (pid 1780,
  alive 03:24:12Z). Worktree re-verified after the restart: HEAD
  ff17699c7, `git status --short` empty. Nothing lost.
- Write flap: probes OK at run start (lock write + registry reads
  went through). Last flap window per memory ended ~Nov 21–22;
  writes are verified per commit, not assumed.
- Gate slot: other loops' gates run through the day; this run's gate
  serializes after the pilot analysis, with its own
  --cacheDirectory=/tmp/jest-cache-playtest2.

SUBSTRATE: master ff17699c7 EXACTLY (worktree HEAD). No fix arm
pre-filed this run. A defect the panel surfaces is filed as an
F-item and fixed only under the r147 rule (planned before scored
seeds, own proof test, judged on the post-fix panel); a mid-run fix
otherwise gets its own proof + a re-run of affected passes, recorded
in the run note.

## What this run does NOT do (anti re-proof)

r263 ran the full 24-seed four-pass panel with ALL GO verdicts, and
r264/r267 ran tribute-first pilots (both VOID) plus the charter
census, stall-fates runs, and the first W5-FACING census. Re-running
passes A/C/C-wide/D would re-prove proven constraints (Steve
2026-11-01). This run does NOT re-run them. It runs ONE new-policy
pilot on a FRESH band plus diagnostics that ride the same sims.

## Head deltas since r267 substrate (dd740ad83 -> ff17699c7)

`git log dd740ad83..ff17699c7 -- src/js`: 15 commits; `git diff
--stat`: 9 files, 344 insertions, 29 deletions. Classified by
reading the diff and the commit messages:

LIVE (behavior changes under the default panel):
(a) WORNSTACK (ff17699c7, villager-agency.js + villager-build.js):
    mantleBecome now carries worn stack units — a 2-cell stack worn
    as gear no longer collapses to 1 on succession (finding #2698;
    proof 13/13). Commit says "No player-visible behavior change",
    but it changes what a successor inherits. The endgame leg is
    where succession inside the endgame happens (r267's 107329: the
    scholar died d78, the village still sat and won) — this is the
    one live delta to watch on the chain.
(b) NEEDWAVE-B (054f525bc, win-plan.js): guarded needWave copy in
    the companion plan sync (copy only when the leader's wave
    number is set; never erase a companion's). Live party-launch
    behavior; the guard makes it a copy-only change. Its predecessor
    (1703f42b7, unguarded copy) was reverted (f54c24e42, NO-GO on
    det-gate — null-holder wipe); the guarded copy is what is live.
(c) SUCCESSION r267 (970fc5524, convo-wants.js + convoTopics.js +
    villager-agency.js): fill-aware retry in topic2Ask + panel
    (REL-WIT PASS, first wild witness serving; DRY-CENSUS 1
    pool-exhaustion dry on table event). Live conversation behavior.
(d) ESTABLISHMENT r268 (1c11dbb14, win-plan.js + villager-brain.js):
    PLANWAKE fresh band GO, LAUNCHVOICE speaks, day-desync
    answered, STRANDED-CLOSE menu fix. PLANWAKE itself was already
    live in r267's substrate; this is a follow-up (LAUNCHVOICE
    narration + a menu fix).
(e) DEEPENING r269 (ddcecb96d, 9accff480, convo-beats.js +
    convo-dialogue.js + convo-wants.js): DRY-COUNT WASHOUT — a
    blocked beat restores the dead-react streak so the r246
    exhaustion gate fires; MOOT-CLOSE — an evicted favor's live
    joint run closes its books. Live favor/conversation behavior.
(f) SCALE r250 (20783a0be, convo-beats.js): broken-favor resolution
    lines. Dialogue only.
(g) LANDING r154 (29a8dde3a, convoTopics.js): grief-bridge pool
    2->6 lines. Dialogue only.
ENV-GATED OFF by default (no effect on the default panel):
(h) HPGATE (87b2122f3, villager-agency.js): HP-gate door parties,
    HPGATE=1 only; off-mode byte-identical per the code comment.
    NO-GO on P2/B1 (metric-broken); #2619 stays open.
(i) LEADERHPGATE (d9d98bf8f, villager-agency.js): leader-HP gate,
    LEADERHPGATE=1 only; off-mode byte-identical. NO-GO
    (CONCEPT-DEAD, subsumed by HPGATE).
(j) LEADERPROJ (fb0794a44, villager-agency.js): leader-PROJECTION
    gate, LEADERPROJ=1 only; off-mode byte-identical. NO-GO
    (METRIC-BROKEN).
(k) build.js version stamps only (two batch-ship bumps).
No delta touches table.js, standing.js, progression.js deed gates,
or the capstone paths — the endgame panel measures the same
deed-gate game as r267, with WORNSTACK + NEEDWAVE-B + the
conversation deltas to watch.

## Fresh band (local_seed_band_freshness skill)

Band **107501–107508** (8 seeds). Freshness check, run before this
prereg was written:
- Searched all `evidence/**/*.md` for 107501–107508: ZERO hits.
- Searched goal `hidden_files/` for 107501–107508: hits ONLY as
  float substrings inside old data JSONs, adjudicated NOT seed
  reservations: `7.107501594098059` (orphan-fracchoice screen.jsonl),
  `1677.60451107502` (awayration2-b s96105.json, contains "107502"),
  `21826.171075077727` (panel-plentydepri case json, contains
  "107507"), haven-access holdout scorecards (contain "107506" the
  same way). No prereg, forbidden list, screen, or extension band
  names any of 107501–107508 as a seed band.
- Collisions recorded so the next worker does not repeat them:
  107337–107344 (107338/107341/107342/107344 in sim-hpgate-b +
  sim-scale-onramp-round-1115); 107345–107352 (107348/107351/107352
  in sim-hpgate-b, sim-cellcheck-a, sim-leaderhpgate-b,
  sim-winnability-round-0930); 107353–107360 (107353–107358
  sim-hpgate-b, 107358–107360 sim-leadgate-a); 107361–107368
  (107361 sim-leadgate-a, 107366–107368 sim-cellcheck-a +
  sim-launchfield-refreeze/rejudge-b); 107401–107408 (107401/107402/
  107404/107406/107407 in sim-launchfield-rejudge-b, sim-dawnchoke-a,
  sim-homebody-a); 108001–108008 (establishment r244–r268). The
  1073xx space is saturated by today's flesh-out arms; 107501 is the
  first free block above it.
- No forbidden/contaminated band list file exists under evidence/.
- FRESH.

## Questions (frozen)

- Q1 TRIBUTE-FIRST (primary, experiment — carried from r264/r267,
  still VOID in the wild twice): does delivering military_tribute
  when ready+payable produce full seats on a FRESH band? Probe
  policy change: delivery order tribute-first (TRIBUTE_FIRST=1),
  all other flags identical to r267 Pass T (CAPSTONE=1, BUYOUT=1,
  BUYOUT_EARLY=1). Binding: tribute deliveries >= 1 on the pilot —
  if zero, the policy change failed to engage and the experiment is
  VOID again (not a NO-GO); the pilot stops per PILOT FIRST. Full
  seats on Pass T vs r263 Pass C (1/5) judged descriptively (small
  n, no significance bar); kills / vet counts / deed-gate days
  reported. Third VOID in a row would confirm the gate, not the
  tribute, as the binding constraint — the w5 census below is the
  instrument that names it.
- Q2 W5-FACING (primary, diagnostic — second run of the census,
  from r264's finding): distinct wave-5 types faced per seed at the
  sitting (analyzer-side, from the existing w5FaceEvents/facedIds
  fields — no probe change). Binding: the distribution is reported
  (0/1/2 types faced per seed that reaches the table). If w5>=2
  holds on fewer than half the pilot seeds that reach the table, the
  gate's w5 bar is named as the binding constraint — a DESIGN
  OBSERVATION, not a defect (the bar is Steve's design; the
  measurement is the finding). Pooled with r267 (0/4): the running
  total is the finding.
- Q3 STALL FATES (carried, measurement — third run, in DAYS): does
  the fate split (UNBLOCK/REGRESSION/PERSIST) reproduce on a fresh
  band under the tribute-first policy? Binding: stall-days per seed
  + fate split reported in days (samples / samples-per-day, per the
  r264 units correction); the split itself is descriptive.
  UNBLOCK->full conversion reported against the pooled rate (r263
  4/6, r264 0/2, r267 0/2 — pooled 4/10) descriptively.
- Q4 M25d (carried, binding, bar stays <=1): bought-seed losses on
  this run's bought seeds. r263 read 1/13, at the limit; r267 read
  0/4.
- Q5 DIALOGUE HOLDS (people check): the head deltas are mostly
  dialogue/narration — the panel transcripts are read IN FULL and
  checked for: deflect-promise never-again lines = 0 (r262 fix
  holds), resume-quote-kind mismatches = 0, witness-line 'Names,
  named.' = 0, settled re-ask names the favor, namebeast opens the
  just-told beast. PLUS the new live narration read for sense: the
  LAUNCHVOICE launch beat (holder+party+target named, once per
  launch), the DRY-COUNT/MOOT-CLOSE favor lines (a blocked beat
  restores the streak; an evicted favor's joint run closes honestly),
  the grief-bridge pool (6 lines, no repeats crowding), and any
  succession-inside-the-endgame (WORNSTACK: a successor who wore a
  2-cell stack keeps 2 cells — check the handover reads as one
  story). Any miss is an F-item, not a panel verdict by itself.

## Panel plan (pilot-first)

- Probe: scripts/probe-endgame-r270-20261122.js (r267 probe verbatim
  EXCEPT renames r267->r270, evidence dir
  2026-11-22/perseed-endgame-r270, header, substrate comment
  ff17699c7, + PLAN-map entries 107501–107508 (107501–107502
  'wavesnw', 107503–107508 'waves', per the C-wide band pattern) —
  verified by diff: only renames, dates, comment reflows, the
  substrate comment, and the PLAN-map addition; zero other logic
  change).
- Analyzer: scripts/analyze-endgame-r270-20261122.js (r267 analyzer
  verbatim EXCEPT input dir, r267->r270 — verified by diff the same
  way; the W5-FACING section, STALL-FATES, TRIBUTE-FIRST, and
  CHARTER-CENSUS are carried verbatim).
- Clone: scripts/clone-endgame-r270.py (r267 clone script verbatim
  EXCEPT r267->r270 renames, WT path, header lineage; the byte/char
  `robust_write` fix from the r246 adoption is carried).
- PILOT: Pass T on seeds 107501, 107502, 107503, 107504 (2 wavesnw +
  2 waves). If no tribute delivery fires AND no deedGate-ok day
  occurs on any of the four (policy fails to engage AND the gate
  never opens), STOP per PILOT FIRST — document and move on, do not
  burn the full band. If either engages, EXPAND to the remaining
  four seeds (107505–107508).
- Dark probe: SKIPPED — no delta since r211 touched the dark table
  (r211 skipped on the same reasoning; r219/r225/r230/r233/r237/r239/
  r243/r246/r249/r255/r259/r263/r264/r267 skipped too).
- COMPETENT_PIN=r127 support already in the tree.
- NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
- M2b GREEN from r182 — no re-sweep (carried as proven).
- FIGHTALLY2 stays OFF — this run does not touch it (eleventh
  sighting stands; the turn-on decision is owed, not taken here).

## Telemetry

Baseline: hidden_files/telemetry-baselines/endgame.json (uw 22 / won 4 /
peakVet 3, per the r263 revert). Telemetry check runs on the Pass T
per-seed glob with the same metrics; baseline NOT rolled without
adjudication (a LOUD line is investigated first, per the body).

## Metric review (to fill at closeout)

- M20 samples-vs-days (r264 correction: report days).
- peakVet baseline (3, per r263 revert).
- FIGHTALLY2 (stays OFF; eleventh sighting stands).
- M25d (bar <=1; r263 1/13 at the limit; r267 0/4).
- NOTICK/CARRY (vacuous, eighth straight zero if it holds).
- M1/M6 on pilots (structural on a 4-seed pilot: M1 needs >=3 seeds
  reaching the window — reachable; M6 needs >=1 deferred sit).
- M23 vs TRIBUTE-FIRST (same fact scores NO-GO under M23 and VOID
  under TRIBUTE-FIRST on a pilot; the run note adjudicates).
- W5-FACING (second run of the census; no bar, descriptive; pooled
  with r267's 0/4).
