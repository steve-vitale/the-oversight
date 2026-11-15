# Journey crisis r208 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads 6 at run start — social-life r206
read 5, played 5, wrote 6 at closeout (adoption r207). This run plays
crisis and writes 7 (succession next) at closeout. Run number: r208
follows r206; r207 was the adoption coordinator for r206 (not a play
run). Base: master 0054751ad. Lock: playtest-loop-2.lock run_id
2026-11-15T02:55:40Z (own). Worktree slug: journey2-crisis.

## Pre-flight / standing infrastructure notes (LOUD)

- Main tree clean (0 dirty), disk 37%.
- `git pull --ff-only`: "Already up to date" (master 0054751ad).
- `worktree-reap.sh`: exit 0, 11/16 active, removed nothing. 8 LOUD
  lines, all other owners' uncommitted trees (sim-wideduty-a,
  sim-sametick-a, journey-scale-attr, sim-secondlink-a, sim-redactor-a,
  sim-saycap-a, sim-siegedialog-a, sim-inffight-ab): never
  auto-removing, not mine to touch.
- DEAD-REGISTRATION RECOVERY: a prior `journey2-crisis` registration
  (run_id 2026-11-15T01:56:50Z, owner oversight-playtest-loop-2,
  purpose "village journey lane B: crisis") was found at run start
  with heartbeat 01:56:50Z — ~59 min stale, no live journey/crisis
  processes, tree CLEAN (0 dirty), branch tip 3321c6546 fully merged
  into master (verified `merge-base --is-ancestor`), no prereg, no
  evidence file, no commit of its own. Dead by the overlap-guard rule
  (heartbeat > 15 min + no live process). Released as abandoned,
  worktree removed, branch deleted. NOTHING RECOVERED: no report,
  commit, or evidence survived it, so per the loop-closeout skill
  this run is a clean re-run, not an adoption. The registration was
  created ~1 min after the r207 adoption finished (01:55Z) — likely
  the 20:00 CST occurrence registering then dying immediately
  (same shape as the 2026-10-11 coordinator death ~1 min after
  creating its lock). No lock file from that occurrence survived.
- REGISTRATION QUEUE: this run's own `worktree-release.sh` blocked
  ~3 min on REGISTRY.lock while Lane A registered `journey-deepening`
  (its `git worktree add` grinding under heavy concurrent git load);
  the lock is held for the whole registration. Queue, not wedge —
  the release proceeded once Lane A finished. Noted, not chased.

## Canon read this run

- docs/CANON.md (re-read 2026-11-15) + docs/DISEASES.md (re-read
  2026-11-15). Canon: two pools never mix; ruin medicines ease/cure
  as labeled (r181 fix native); radiation is pellet cost, no pill
  touches it. docs/CONVERSATIONS.md: r192 read stands (the fix area).
  docs/ALIEN-PLAYERS.md: r182 read stands (canon: the death record
  says "a stranger", never "an alien"; Q2 stays OPEN, Steve's call).

## Base movement since r201 (f1871e37b -> 0054751ad)

src/js + src/data commits only (129 commits total, mostly evidence):
- Reunion arena re-tune (0d8d3650a, e17c08d78, ee8292e0b): mirror cap
  1, arena-only clone HP x0.4, damage x0.5 -> x0.6 (correction 3:
  first panel 6/8 wins TOO EASY). Wild Reunion untouched. Arena
  fights occur in crisis panels (r201 deaths included the arena),
  so this is the one balance change that can move crisis outcomes.
- r206 invite-small double-serve fix (365b17d7d): conversation.js —
  dialogue-adjacent, D1/C3 regression surface.
- r132 nod-loop fix (3bffd4752): repeat nv: gesture thins the
  sitting — conversation-adjacent, D1/C3 regression surface.
- r139 spotter wiring (93f88819c): forage + bumpPlantFamiliarity
  grants, faster-ID threshold benefit — forage-adjacent; crisis
  villages forage to survive, could move food outcomes slightly.
- sim-holdbuild-b BUILD (e37c4503b) + REVERT (aea3cb311): killed at
  pilot, "leaves no trace in game code" — net zero.
- sim-succpolity-b (f1400295b + parents): all three legs killed at
  pilot, instruments/evidence only — no src/js change.
- NO medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed — the RUINROAD arm
  stays parked this run (see below).

## Leg question (carried from crisis r201)

**Do r201's verdicts hold on the new base — and does the r201 C3b
settled-favor gate confirm on fresh seeds?** Three threads:

1. C3b CONFIRM (the designated confirm job): r201 found one
   "settled" line firing on a sitting that shared no real beat with
   the favor (seed 14445 d10, Ella) and fixed it in-run (a favor
   want is settled only when the favor itself is done). The fix is
   native now; this panel runs fresh seeds and spot-checks every
   "settled" line — the fix must hold at 0 false settlements.
2. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes
   (F1–F5) held at 0 dry lines on r201. This panel re-runs the same
   driven transcripts on fresh seeds; any dry line on a NEW surface
   names the next fix (the r206 invite-small + r132 nod-loop fixes
   are new dialogue-adjacent code since r201).
3. CRISIS REGRESSION: do raids, gorge nights, sorties, favors,
   mourning still fire on ordinary seeds, and do the villages bend
   or break the same way (r201: 4/5 game-over, 1/5 horizon, 0 alien
   kills)? Descriptive watch: arena-fight outcomes under the
   Reunion re-tune (HP x0.4 / damage x0.6, mirror cap 1).

NOT this run: the RUINROAD forced-search arm. Cumulative 0/301
(r186 0/151 + r192 0/150) is a PROVEN constraint; re-running the
arm with no lever landed would re-prove it (Steve 2026-11-01
rebuke). The supply question lives with the medicine build brief
— lever (h) duty-holder scavenging first. If (h) lands, a later
crisis run re-runs RUINROAD to measure the movement.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14451–14455. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo): zero prereg hits for 1445[1-5]. Broad grep across repo
  evidence/*.md for 14451–14455 hit only census JSON data values
  (pantry kcal fields, trust floats) — verified non-seeds, same
  class as r201's 1444x false positives. Goal hidden_files evidence
  grep: same class, no prereg. Forbidden bands named in preregs
  (73641–73648, 73671–73678; 99201–99208; 78201–78208): no
  intersection. Collision notes (carried): 14441–14445 r201.
  14431–14435 r192. 14421–14425 r182/r186. 14411–14415 r181.
  14401–14405 r180. Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14451–14455,
  sequential. PILOT FIRST (§9): seeds 14451–14453 run first; the
  panel expands to 14454–14455 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the answer.
- Smoke first: SEED=14451 DAYS=5 into the r208 evidence dir, driver
  runs, no instrumentErrors, stranger counters present.
- Driver: r201 driver verbatim EXCEPT r208 filenames/paths/seeds
  (14451–14455), ORIGINS map keys, EVID path 2026-11-14, DAYS 150.
  No behavior change: originals called first, returns preserved.
  RUINROAD env stays OFF (arm parked, see above).
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r208 seeds (r201 hygiene carried — r192's map silently fell back
  to St. Louis for unkeyed seeds).
- Analyzer: r201 analyzer verbatim EXCEPT r208 filenames/paths and
  the DRY-CENSUS section carried. Validated on r201's JSONs before
  the panel: carried numbers reproduce exactly.

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel
  (F1/F2/F3's proof in the wild); other-surface dry lines reported
  with pick attribution, no bar. Any dry line on a NEW surface is
  the next fix item, named in the run note.
- Q6 RETIRED (r201 metric review): gorge-after-clear id-matched
  0/5 for the sixth consecutive zero panel — METRIC-BROKEN,
  descriptive-only from here. Reported, never judged.
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
- C3b SETTLED-FAVOR CONFIRM (binding this run): every "settled"
  close line fires only on a sitting that shared a real beat with
  the favor it names (favor itself done: fulfilled / thanked).
  Spot-check each one. Any false settlement is a REGRESSION of the
  r201 fix, filed LOUD with a fix in-run if the cause is local.
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
- ARENA WATCH (descriptive): arena-fight outcomes per seed under
  the Reunion re-tune (HP x0.4 / damage x0.6, mirror cap 1) —
  wins/losses vs r201's arena deaths, no bar.
- Interesting finding (panel triggers): any medicine acquisition on
  the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence).

## Telemetry

- Metrics: defendedFights, playerFights, latelyDefenseCount vs
  baseline telemetry-baselines/crisis.json. LOUD lines are same-run
  investigation items before any baseline roll; baseline NOT rolled
  on a single panel's variance. Units check first: the r201 metric
  review notes succession.json stores per-seed means while
  telemetry-check.js sums — verify the crisis baseline's units
  before rolling anything (this run does not roll).

## Metric review section

Every run note carries one. No metric is re-scored mid-run; doubts
go there and revisions apply to the NEXT run. Open from r201:
(1) Q6 retired to descriptive-only (METRIC-BROKEN) — done here.
(2) Dialogue-only fixes are NOT trajectory-neutral while voiceLine
draws RNG — the r192 fixes spend no RNG on the common path;
pre/post trajectory comparisons stay descriptive, never fix-effect
claims. The C3b fix likewise spends no RNG — its postfix check
(seed 14445, one line withheld, days/end identical) is a
regression check, not a fix-effect claim. (3) For supply-gated
fixes, the unit test is the proof and the panel is a regression
check only. (4) Telemetry baseline units — verify crisis.json
units before any roll (carried).
