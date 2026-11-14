# Journey crisis r201 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads 6 at run start — social-life r200
read 5, played 5, wrote 6 at closeout. This run plays crisis and writes 7
(succession next) at closeout. Run number: r201 follows social r200. Base:
master 49d5c4a32. Lock: playtest-loop-2.lock run_id
loop2-20261114T115724Z (own). Worktree slug: journey2-crisis (registered
12:09Z, heartbeat 12:09Z, hbloop every 7 min).

## Pre-flight / standing infrastructure notes (LOUD)

- Main tree clean (0 dirty), disk 40%.
- `git pull --ff-only`: "Already up to date" (master e7c6861bf at pull
  time; a sibling landed 49d5c4a32 mid-preflight and the second pull
  picked it up — the worktree branches from 49d5c4a32).
- `worktree-reap.sh`: exit 0, 13/16 active, removed nothing. 4 LOUD
  lines, all other owners' uncommitted trees (sim-siegedialog-a,
  sim-inffight-ab, sim-transplant15c52-a, journey-scale): never
  auto-removing, not mine to touch.
- STALE-LOCK RECOVERY: a lock from run loop2-20261114T105601Z
  (2026-11-14T10:56:01Z) was present at run start with NO registered
  tree and NO heartbeat for that run_id anywhere in REGISTRY.json —
  dead by the overlap-guard rule, deleted, own lock created.
- REGISTRATION RECOVERY (loud, diagnosed, safe): the first
  `worktree-register.sh` failed — "a branch named 'journey2-crisis'
  already exists". Diagnosis: (a) the branch name had been REUSED by a
  transplant118 worker after r192's release; its tip (b5ae72cd4) is
  fully merged into master (verified `merge-base --is-ancestor`, and
  the commits are also reachable from master/main/build-medicduty-h/
  journey-scale), so deleting the pointer loses nothing. (b) The path
  ~/workspace/worktrees/journey2-crisis held a 5.6 GB / 48,793-file
  copy of evidence/ only (no .git, no src — not a worktree), all
  files created ~11:55Z today, every one of them byte-present in the
  main tree's committed evidence/ (file-list diff: 0 files unique to
  the leftover; sample md5 identical; not hardlinks). No live process
  owned it (no journey/crisis procs running). Moved to recoverable
  trash (trash_id 20261114-120822-54a7dacdbebd4225bf30313c9d38fef0,
  expires 2026-12-14) instead of deleting, branch deleted with
  `git branch -d`, re-registration succeeded from 49d5c4a32.
  Open question for the loop: what copied 5.6 GB of evidence into
  that path at 11:55Z — recorded here, not chased further this run.

## Canon read this run

- docs/CANON.md (re-read 2026-11-14) + docs/DISEASES.md (re-read
  2026-11-14). Canon: two pools never mix; ruin medicines ease/cure
  as labeled (r181 fix native); radiation is pellet cost, no pill
  touches it. docs/CONVERSATIONS.md: r192 read stands (the fix area).
  docs/ALIEN-PLAYERS.md: r182 read stands (canon: the death record
  says "a stranger", never "an alien"; Q2 stays OPEN, Steve's call).

## Base movement since r192 (6a16152d5 -> 49d5c4a32)

- r192's own fixes now native (F1-F5 ledger-aware dialogue pools,
  27ce36ecd + proofs f1d13286b).
- r130 ask:village injured answer (6ccdc325e); r131 HEED warn_you fix;
  social-life r200 panel + adoption (86bb8e526, eb6360801);
  capablewinpath-b DIAG (e7c6861bf); fusionoffer-b fixes
  (afa416371); proofrefresh-b15 adoption.
- NO medicine-lever commits: `git log 6a16152d5..49d5c4a32
  --grep=medic/healer/scaveng -i` finds only 6ccdc325e (r130,
  a conversation fix). Levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed — the RUINROAD arm
  stays parked this run (see below).

## Leg question (carried from crisis r192 + succession r187)

**Do the villages bend or break under crisis — and do r192's
dialogue fixes hold in the wild?** Three threads:

1. DRY-CENSUS REGRESSION (the designated confirm job): r192 landed
   five ledger-aware pool fixes (F1 deflect_q, F2 refusal line, F3
   dlg:doubt, F4 monsterNoun clause-verb, F5 question-shaped thread
   labels). This panel runs the same driven transcripts on fresh
   seeds and counts dry lines per pick — the fixes must hold at 0
   on their own surfaces; any NEW surface names the next fix.
2. Q6 RE-JUDGE (due since r181, zero through r190, r192 NO-GO
   id-matched 0/5): the gorge-after-clear pattern. This run judges
   the bar itself — retire to descriptive-only or re-scope — on a
   fresh 5-seed panel with the same id-matched definition.
3. CRISIS REGRESSION: do raids, gorge nights, sorties, favors,
   mourning still fire on ordinary seeds, and do the villages bend
   or break the same way (r192: 5/5 game-over, 0 alien kills)?

NOT this run: the RUINROAD forced-search arm. Cumulative 0/301
(r186 0/151 + r192 0/150) is a PROVEN constraint; re-running the
arm with no lever landed would re-prove it (Steve 2026-11-01
rebuke). The supply question now lives with the medicine build
brief — lever (h) duty-holder scavenging first. If (h) lands, a
later crisis run re-runs RUINROAD to measure the movement.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14441–14445. Searched: all dated preregs
  `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md`
  (repo) plus goal hidden_files preregs — grep for 1444[0-9]: zero
  prereg hits. Broad grep `14441|14442|14443|14444|14445` across
  repo evidence/*.md: zero hits. Goal hidden_files evidence grep
  for 1444[0-9] hit 10 census JSONs + 2 r15 answer txts — ALL
  verified non-seeds: pantry kcal values (pantryFreshBefore/After
  14440–14449) and one viewership float (32.14443607025001). No
  prereg, forbidden list, or screen names this band. Forbidden bands
  named in preregs (73641–73648, 73671–73678; 99201–99208;
  78201–78208): no intersection.
- Collision notes (carried): 14431–14435 r192. 14421–14425 r182/r186.
  14411–14415 r181. 14401–14405 r180. 14301–14305 r176. 14201–14205
  r168. 14101–14105 r164. 13901–13905 r156. 13801–13805 r155.
  13701–13705 USED (13703 named in sim-lackingline4-b-prereg.md).
  13501–13505 r154. 13101–13105 stays skipped (13100 named as a
  conditional screening start in sim-woodcarry3-b-prereg.md).
  Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14441–14445,
  sequential. PILOT FIRST (§9): seeds 14441–14443 run first; the
  panel expands to 14444–14445 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the answer.
- Smoke first: SEED=14441 DAYS=5 into the r201 evidence dir, driver
  runs, no instrumentErrors, stranger counters present.
- Driver: r192 driver verbatim EXCEPT r201 filenames/paths/seeds
  (14441–14445), ORIGINS map keys, EVID path 2026-11-14, DAYS 150.
  No behavior change: originals called first, returns preserved.
  RUINROAD env stays OFF (arm parked, see above).
- ORIGINS CORRECTION (carried, driver hygiene): r192's ORIGINS map
  still keyed 14422–14425 — only seed 14431 got its origin; seeds
  14432–14435 silently fell back to St. Louis, and the r192 prereg's
  claim ("the keys are now the r192 seeds") was wrong. r201's map
  keys all five seeds (Seattle/Boston/Austin/Chicago/Phoenix).
  Origin is start-city flavor only; this does not re-score r192.
- Analyzer: r192 analyzer verbatim EXCEPT r201 filenames/paths and
  the DRY-CENSUS section carried. Validated on r192's JSONs before
  the panel: carried numbers reproduce exactly.

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel
  (F1/F2/F3's proof in the wild); other-surface dry lines reported
  with pick attribution, no bar. Any dry line on a NEW surface is
  the next fix item, named in the run note.
- Q6 RE-JUDGE (binding as a judgment): id-matched gorge-after-clear
  count on 5 fresh seeds, same definition as r192. If 0/5 again
  (sixth consecutive zero panel), the metric review RETIRES Q6 to
  descriptive-only with a METRIC-BROKEN classification. If >=1
  fires, the review re-scopes the bar around the firing shape.
- C1 (bend, not break) GO: every game-over has a named cause that is
  NOT a siege-mechanic failure; horizon reachable on at least 1 seed
  is descriptive, not a bar. A softlock seed is reported separately.
- C2 (episodes fire + gates hold) GO: raids fire on all seeds;
  fought resolutions present; D1 snapshots all delayed >= 3
  attempts; deltaBad empty; D3 drift unknown = 0 (union counting).
- C2b (linger-conditional gorge/sortie) GO: every boundary-firable
  case fires or is refused with a recorded reason; no
  boundary-firable case unfired.
- C3 (people check) GO: all driven transcripts read in full;
  fabricHits = 0; conversations meet the meaning bar. VoiceLine
  prefix stacking >= 3 sightings graduates to a fix in-run (r180
  fixed it; any recurrence is a REGRESSION, filed LOUD). Double
  confession: 0 expected (r172 guard); any recurrence is a guard
  failure, filed LOUD. Naming-stance wobble: a fourth sighting
  graduates to a fix item.
- C3b RAFAEL RE-CONFIRM (watch, not a bar): zero "weren't there for
  that one" lines in any panel transcript; inherited resumes render
  in the new form; "settled" lines fire only on sittings that shared
  a real beat (spot-check each one). Any recurrence is a REGRESSION
  of the r183 fix, filed LOUD.
- WRAP-CHECK GO: analyzer WRAP section reports unmarked = 0 across
  all driven transcripts.
- C7b GO: buried list reported per seed; corpse-cause counts
  reported for famine/disease/wound/thirst.
- S1–S5 SUPPLY: NOT RUN this panel (RUINROAD parked). Cumulative
  stays 0/301, carried as the standing number; the supply question
  is owned by the medicine build brief now.
- Q1 missed-window, Q5 multi-monster clear, BENCH, Q7 naming watch:
  carried as descriptive/watch, r180 definitions.
- A1–A6 stranger counters: DESCRIPTIVE ONLY this run. A7 NOT judged
  on the crisis leg (moved to the endgame leg per r186 metric
  review — the channel never opens under home-based play; the
  gates are anti-correlated by design). The counters stay in the
  driver/analyzer so the panel still records any kill that fires.
- Interesting finding (panel triggers): any medicine acquisition on
  the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence).

## Telemetry

- Metrics: defendedFights, playerFights, latelyDefenseCount vs
  baseline telemetry-baselines/crisis.json. LOUD lines are same-run
  investigation items before any baseline roll; baseline NOT rolled
  on a single panel's variance.

## Metric review section

Every run note carries one. No metric is re-scored mid-run; doubts
go there and revisions apply to the NEXT run. Open from r192:
(1) Q6 re-judge lands HERE (see Q6 above). (2) Dialogue-only fixes
are NOT trajectory-neutral while voiceLine draws RNG — the r192
fixes spend no RNG on the common path (ordered pools, pure-read
checks); pre/post trajectory comparisons stay descriptive, never
fix-effect claims. (3) For supply-gated fixes, the unit test is the
proof and the panel is a regression check only. (4) Telemetry
baseline succession.json stores per-seed means while
telemetry-check.js sums — NOT this leg's baseline, but the same
class of compare artifact is possible; verify the crisis baseline's
units before rolling anything.
