# Journey crisis r247 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads **6** at run start (mtime
2026-11-19T09:54:25Z). Reconstruction of the file's history: r245
succession wrote 7→4 (verified in its note); r246 endgame played 4
and landed (eccc08af2 on master) but its note carries NO rotation
claim; the r238 social-life adoption landed 09:48Z today
(e7bd782ab) and the file was written 09:54:25Z — the 5→6 write of a
social-leg closeout. The cycle (endgame 4 → social 5 → crisis 6)
is coherent and the file is the authority per the body, so this run
plays crisis (6) and writes 7 at closeout, verifying the write by
reading it back. Run number: r247 follows r246 (max on disk).
Base: master `416e81241` (sim-speargate-a adoption — master moved
385f07995 -> 416e81241 WHILE this run's worktree was registering;
the worktree was fast-forwarded to the new tip in-tree, see
pre-flight). Lock: playtest-loop-2.lock run_id `2026-11-19T10:56:40Z`
(own).

## Pre-flight / standing infrastructure notes (LOUD)

- **STALE-LOCK RECOVERY.** A lock existed at run start, created
  2026-11-19T09:56:10Z (run_id = the timestamp, plain style).
  Registry check: NO journey2 tree registered for that run_id, NO
  journey2 worktree dir on disk, NO live node/git process for it
  (only Lane A's journey-landing heartbeat loop, PID 1797, left
  alone). Per the overlap guard the previous run is DEAD no matter
  how fresh the lock is. Lock deleted, own lock written 10:56:40Z.
  The 09:56Z run died after creating its lock and before
  registering a tree — same failure shape as the 2026-10-11
  coordinator death the guard was written for.
- **Main tree dirty at first check: 1 file, 0 bytes.**
  `evidence-TEST.tmp` (created 10:28:04Z) — an empty write-flap
  probe artifact, no content to lose. Removed (not committed),
  status clean after. Same minute (10:28Z) as the probe artifact
  below — one flap-probe window.
- **FLAP PROBE BLOCKED ALL FETCHES — fixed.** `git pull` failed:
  `fatal: bad object refs/heads/probe-py3.txt`. The probe had
  left a 0-byte file `.git/refs/heads/probe-py3.txt` (also
  10:28Z) — git treats any file in refs/heads as a ref, and an
  empty one is a broken ref that aborts every fetch. The file was
  MOVED (not deleted) to goal hidden_files/flap-probe-evidence/
  as `probe-py3.txt-20261119-1056Z-0bytes`, preserving the
  evidence; fetch then succeeded and `git pull --ff-only`
  reported "Already up to date" (master 385f07995; origin/master
  b76d65445 is 20 commits behind local — the ship loop owns
  pushes, normal). The 0-byte probe-*.lock files still sitting in
  refs/heads were left alone (git ignores *.lock as refs; they
  block nothing). LOUD for the flap owner: a probe run is writing
  test files into `.git/refs/heads/` — one empty file there
  breaks fetch/pull for every agent on this box until removed.
- Disk 46% (fail line 85%).
- `worktree-reap.sh`: ran clean; 10/16 active, no removals; LOUD
  notes about four other owners' dirty trees (not mine, left
  alone). journey-landing (Lane A) has uncommitted changes and a
  heartbeat 44 min stale at my check — Lane A's business, not
  touched.
- **REGISTRATION ATTACHED TO A STALE BRANCH — fixed in-tree.**
  `worktree-register.sh journey2-crisis` took ~25 min (slow full
  checkout under load) and landed the worktree at e7bd782ab, NOT
  master: the branch journey2-crisis already existed at e7bd782ab
  (reflog: "Created from HEAD" when that commit was the tip,
  09:48Z — the 09:56Z dead run's branch, left behind when its
  worktree vanished), so the script's `-b` failed and its fallback
  attached to the stale branch. The worktree was clean, so it was
  fast-forwarded in-tree (`git merge --ff-only master`) to the
  then-current tip. LOUD for the script owner: the fallback should
  fast-forward a reused branch to master (or fail loudly) — a
  silent 7-commit-stale base is exactly the failure the push
  discipline warns about. Heartbeat landed at registration
  (11:03:13Z, already >15 min stale by the time the checkout
  finished — re-heartbeated 11:28:14Z after the ff-merge).
- **MASTER MOVED DURING REGISTRATION.** While the 25-min checkout
  ran, the sim-speargate-a adoption landed 12 commits
  (385f07995 -> 416e81241). The worktree's ff-merge took the new
  tip, so this run plays on 416e81241, NOT the 385f07995 the
  pre-flight verified. The delta is classified below; the prereg
  base is 416e81241.
- Registration: `worktree-register.sh journey2-crisis` — slow
  full checkout under load (r244 precedent ~15 min); heartbeat
  immediately after registration. No background heartbeat loop
  (the runtime reaps long-lived backgrounded exec sessions —
  r234/r235 precedent). The tree is dirty once work starts, and
  the reaper never auto-removes dirty trees — second line of
  defense, not a substitute.
- Flap watcher: not checked this run (probe + watchdog cron own
  it); the 10:28Z probe window above is this run's flap sighting.

## Canon read this run

- docs/CANON.md + docs/DISEASES.md + docs/MONSTER-WAVES.md +
  docs/DIRECTIVES.md + docs/MEASUREMENT.md §§9–12, 14–15 read this
  run. `git log 986cc5584..HEAD` on CANON.md, DISEASES.md,
  CONVERSATIONS.md, ALIEN-PLAYERS.md, MONSTER-WAVES.md,
  CONTESTS.md, MEASUREMENT.md, DIRECTIVES.md is EMPTY — unchanged
  since r244's read, which stands. Canon: two pools never mix;
  ruin medicines ease/cure as labeled; radiation is pellet cost,
  no pill touches it; waves 4–5 gate on standing + readiness
  (t4 100 / t5 200, readiness bars armored/armed/tricks/
  veterans); the death record says "a stranger", never "an
  alien"; Q2 stays OPEN, Steve's call.

## Base movement since r244 (986cc5584 -> 385f07995, 40 commits)

src/js diff is behavior-thin in count (6 commits) but crisis-
relevant in content. Classified:

LIVE (behavior changes under the default panel):
(a) F2 TITAN REFUSAL COUNTS HAVEN BLADES (journey-deepening
    r243, d3dcd1acd, src/js/titans.js +23/-3): one helper
    `titanMusterBladeCount` — unique living allies + committed
    Haven blades — now read by BOTH the hard gate and the spoken
    refusal line. The r244 wrinkle ("you have 0" while the gate
    counted allied + Haven) is fixed at the source. This run's
    TITAN-REFUSAL confirm checks the spoken count against the
    gate count, not just the ≤1-per-titan-day rule. Proof test
    `test-titan-refusal-have-counts-haven-20261119.js` (r243,
    RED+GREEN).
(b) R238 SOCIAL FIX (journey-social-life r238, e7bd782ab,
    src/js/conversation.js): F5 all-3-blocked handled-pool
    falls to null instead of keeping a blocked pick, and
    FALLBACK-STRUCTURAL exempts the generic "Okay. Here's the
    thing —" opener from the run-ledger block. Fixed a wild dry
    at the repay opener (seed 45752, twice). LIVE dialogue. The
    DRY census re-verifies all surfaces; any dry line on the
    repay opener is a REGRESSION of the r238 fix, filed LOUD.
(c) DOOR-GUARD FOLLOW-UP (journey-landing r146, 05921a54d,
    scripts/policies/competent.js +38, src/js/convo-beats.js
    +15): the bot's beastStrikeTarget skips a stepped-on door
    tile; beastTrickPlay's trick-move + keep-distance picks skip
    door tiles; fledBad recorder (record-only). Plus the
    want-bridge pool widens 6→10 lines. LIVE: fewer accidental
    door-tile fight flees; more dialogue variety. Watch:
    door-tile fight ejects (expect 0), want-bridge repeats inside
    one sitting (expect none before 11 bridges).
(d) LINK-ACCEPT VOICE (journey-scale r243, ee4e9d07f,
    src/js/bond-initiation.js +69): the raise-accept reply no
    longer parrots the player's choice label; the NPC answers in
    their own words via linkAcceptLine, keyed to how they know
    the village. LIVE dialogue. Watch: the ECHO question — any
    accepted raise talk still serving '"All right — let's ask
    them."' is a REGRESSION, filed LOUD.
(e) SENSEEXPED (sim-senseexped-b, 97e78670d): launch-party sense
    reads the live expedition (finding #2583) [GO]. LIVE for
    launch sensing — can move which launches form on the crisis
    band, where launches are scarce. Watch: launches vs r244
    (attempts/ok/refused); any launch naming a companion whose
    expedition never existed is the mirror gap — FAIL LOUDLY.
ENV-GATED (inert under the default panel):
(f) PARTYSIZE4 (a9a4108fe + 1032897dc): third companion behind
    PARTYSIZE4=1. OFF on the main panel; the PS4 side-arm turns
    it on (see below).
(g) FIGHTALLY2, WILDAVOID, FLEEREPAIR2/3: unchanged, still
    gated. FLEEREPAIR2 is on only in the PS4 side-arm, as the
    partysize4 pilot's substrate.
INSTRUMENTS ONLY (no src/js game change):
(h) FOODGATE-INSTR flags (engine-side only); PARTYQUADS counter
    bump (stat only); sim-partyfunnel-a (evidence/instruments/
    proof test only — pilot NO-GO, lever HELD, no src/js change);
    sim-fieldcarrier-a / sim-wildavoid-seedplan-b (evidence /
    instrument only).
(i) PEAKVET RE-BASELINE (endgame r246): the endgame leg's
    baseline peakVet 8→3 (three consecutive 5-seed sums 4/3/3).
    Crisis carries no peakVet baseline; the census still reports
    living wave-4 killers per seed for the winnability read.
Base movement, continued (385f07995 -> 416e81241, landed during
registration — 12 commits, 3 with src/js, all sim-speargate-a):
(j) BOWOPEN PORT (901dc9957, game.js +191, villager-agency.js +5):
    villagerStageBow launch staging + startExpedition call site,
    behind BOWOPEN=1. Env-gated OFF by default ("off is
    byte-identical") — INERT on the main panel and the PS4 arm
    (neither sets BOWOPEN). The launch-staging question stays
    with the bowopen/speargate arm.
(k) SPEARGATE GATE FIX (95d3c04a6, equipment.js +23, game.js +42):
    ranged-gated staging checks weapon.ammo, not the slot; new
    equipment.volleyWeaponOf helper; villagerStageBow step 0
    passes spear-holders to sources — behind SPEARGATE=1.
    Env-gated OFF by default — INERT on this run's panels.
    volley/pocketAmmo/ARMED/fold-in audited-and-left-alone.
(l) #2593 AMMO NAMING (6c55f0f2d, fieldFights.js +18/-1): the
    field-fight 'no arrows' line now names the weapon's actual
    ammo from the ammo item's data name (searcaster: fusion
    cells; crossbow: crossbow bolts; sling: stones; bow still
    says arrows). UNGATED narration-only change — LIVE on the
    panel's fight transcripts. Watch: any 'no X' line naming the
    WRONG ammo for the weapon is a #2593 regression, filed LOUD.
    No behavior change (proof 31/31).
(m) sim-fightcap-b commits (evidence/instruments only — survey
    corpus, driver, analyzer, proof test; NO src/js change) and
    the sim-winnability-round-0830 adoption closeout (no src/js).
    Fightcap's survey numbers (launches 15, quad launches 10,
    field-4 denom 6, median survival 142.5d) are context for the
    PS4 arm, not a bar for this run.
No medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
2026-11-13 medicine brief have NOT landed — Steve ruled
2026-11-14 13:18 CST the medicine trio needs more complexity, a
richer layered design is owed. The RUINROAD arm stays parked
this run.

## Instrument addition this run (driver-only, zero src/js)

PANTRYPER (r244 metric review 1): the r244 C3b adjudication could
not recover the exact pantryPer at the settled line's day from
the saved corpus — pantryDaily carries kcal but no roster size.
The r247 driver adds ONE record-only field to the existing
pantryDaily push: `roster: livingCount(Game)` (the driver's own
pure-read helper, line ~110: living roster count). No RNG, no
state mutation, no trajectory change — same class as r246's
NOTICK/CARRY instrument. C3b adjudication this run reads
pantryPer = kcal / roster from the per-seed JSON for the settled
line's day. The analyzer is NOT changed beyond renames — the
adoption computes pantryPer from the JSON directly.

## Leg question (carried from crisis r244, updated for the base)

**Do r244's verdicts hold on the new base — F2 Haven-count
refusal, r238 dry fixes, door-guard policy, link-accept voice,
senseexped launch sense — and does the PARTYSIZE4 substrate
reach the crisis band, where launches are scarce and 2/5 r244
seeds never seeded a plan?**
Threads (r244's 1–26 carried, updated where noted):

1. DRY3 CONFIRM (continued): 0 dry lines on the three r235 fixed
   surfaces. Any dry line is a REGRESSION of the r235 fix, filed
   LOUD with a fix in-run if the cause is local.
2. DRY2 CONFIRM (continued): 0 dry lines on the three r234 fixed
   surfaces. Any dry line is a REGRESSION of the r234 fix, filed
   LOUD.
3. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes
   (F1–F5) held at 0 dry lines on r201–r244. Any dry line on a NEW
   surface names the next fix. NEW THIS RUN: the repay-opener
   surface (r238 fix) — any dry line there is a REGRESSION of
   the r238 fix, filed LOUD.
4. C3b SETTLED-FAVOR CONFIRM — THIRD WILD PANEL for the r240 fix:
   a broken favor whose need is still live must NEVER be called
   done/square/settled. r244 SERVED one qualifying line and it
   held. This panel spot-checks every "settled" line the same
   way, now with pantryPer read from the per-seed JSON
   (pantryDaily kcal / roster). Any false settlement is a
   REGRESSION of the r240 fix, filed LOUD. 0 served again is a
   coverage note, not a confirmation.
5. C3c CLOSED (r228 harness verdict). Any resume opener naming a
   favor that changed since planting is a REGRESSION of the r228
   fix, filed LOUD.
6. C3d CONFIRM (continued): a "Nothing important" recap with live
   business is a REGRESSION of the r231 fix, filed LOUD.
7. NODEAWAY PANEL METRIC (tracked, no bar): r244: 15 / 6 /
   worst-5 (all on 14542); r241: 11 / 6 / worst-3; r240: 19 /
   10 / worst-4. Descriptive against the base movement, never
   lever attribution with n=5.
8. FUNERAL-MEND CONFIRM (r216 F1, r223–r244 GO): any over-claim
   line is a REGRESSION, filed LOUD.
9. STAGE-0 SURFACING WATCH (descriptive): a second sitting with
   dlg:help never offered graduates to a fix item.
10. DEATHCLEANUP WATCH (measurable since r238): any dead-holder
    winPlan entry lingering at census is a FINDING; planSeeds == 0
    with entries present is a FINDING.
11. NONDEATHPLAN WATCH (descriptive): any winPlan entry for a
    removed villager lingering at census is a FINDING.
12. TITAN-REFUSAL CONFIRM (binding this run, UPDATED): refusal
    lines per titan per day ≤ 1 (r233 fix) AND the spoken "you
    have N" equals the gate count (unique living allies +
    committed Haven blades — the F2 fix). Any repeat on the same
    titan-day is a REGRESSION of the r233 fix; any spoken count
    disagreeing with the gate count is a REGRESSION of the F2
    fix. Both filed LOUD. Zero lines with zero 'refused'
    outcomes is vacuous-explained.
13. DEFERRED-ASK WATCH (descriptive): any dlg:help 'already
    handled' about a settled favor while a live need waits is a
    REGRESSION of the r231 fix, filed LOUD.
14. HOMEBODYVOICE + NOTICKDEFER: RETIRED to descriptive-only per
    r241 metric review (fourth consecutive vacuous panel
    expected). Reported, never judged.
15. TRIODROUGHT WATCH — MAIN PANEL expects 0 by construction:
    PARTYSIZE4/VETREENGAGE are env-gated OFF, so no second/third
    companion is picked and partyTrios stays 0 (r244: 0 on every
    seed). The discriminating read is the PS4 side-arm below, not
    the main panel.
16. REL-MOURN WATCH (descriptive): any mourning line wearing a
    wrong/different name is a REGRESSION of the r231 fix, filed
    LOUD.
17. MUSTER-GROWTH WATCH (descriptive): dawn muster-growth lines —
    do they fire, and name the right fire/commit?
18. HOLDERVoice WATCH (descriptive): holder-half lines ("stays
    home") vs companion lines ("never leaves Haven") per seed.
19. POCKET WATCH (descriptive): any sortie fight breaking with the
    party unable to reach the monster is a FINDING. "No path
    there." lines are travel noise, no bar.
20. TRAILTALK WATCH (descriptive): any verbatim repeat of the same
    trail-talk line 3×+ in one outing is a REGRESSION of the r236
    fix, filed LOUD.
21. FIGHT-1 WATCH (descriptive): okSorties / cleared /
    multiMonsterCleared vs r244 (32/23/22 of 29); a cleared
    fight-1 with vTaken >= 70 is the standing Q4 live-play
    confirmation trigger.
22. FLEEREPAIR3 / WILDAVOID watches: STILL UNMEASURED — no
    instrument exists (r244 metric review 3). The prereg claim is
    not an instrument; this run does not judge them and does not
    claim 0 parting hits / 0 outmatched-avoids. Any
    parting-hit-shaped anomaly in the muster rows is reported
    descriptively only.
23. CRISIS REGRESSION: raids, gorge nights, sorties, favors,
    mourning still fire on ordinary seeds, and villages bend or
    break the same way (r244: 0/5 game-over, all 5 reached the
    150d horizon — the first no-game-over crisis panel; r241:
    1/5; r240: 1/5)? Descriptive watch.
24. R244 BLEMISH RE-CHECK (conditional): the mime-walk and Wren
    fixes held on r244 (mime 3 distinct variants per seed, no
    same-variant 3 days running; Wren most-reprinted 3× under
    the 5× bar). This panel re-checks both surfaces in the wild.
    Any same-variant mime 3 days running is a REGRESSION of the
    r241 mime fix; any Wren note reprinted 5×+ on one seed is a
    REGRESSION of the r241 Wren fix. Both filed LOUD.
    Doubt-stonewall 3×+ VERBATIM in one sitting graduates to a
    fix item (r240: 4× honest escalation, left out). Voted case
    re-appearing under a new number; resume-opener quote SPLIT
    across two entries — watch both.
25. WALKHOMe WATCH (descriptive): travel-home refusal naming
    (476f43e1d). Any homeward travel that strands, loops, or
    narrates a refusal the game cannot clear is a FINDING.
26. TABLEACTIVE WATCH (descriptive): mercy-is-not-a-sitting
    (8747d1bcd). Expected vacuous on the crisis band. Any
    mercy/table line is reported, not judged.
27. DOOR-GUARD WATCH (new, descriptive): any door-tile fight
    eject on any seed is a FINDING (the r146 policy change
    should have removed them); fledBad firings are now named by
    day + monster HP — reported, not judged.
28. LINK-ACCEPT ECHO WATCH (new, descriptive): any accepted
    raise talk still serving '"All right — let's ask them."'
    is a REGRESSION of the r243 link-accept fix, filed LOUD.
29. WANT-BRIDGE WATCH (new, descriptive): any want-bridge repeat
    inside one sitting before 11 bridges is a REGRESSION of the
    r146 pool widening, filed LOUD.
30. SENSEEXPED LAUNCH WATCH (new, descriptive): launches per
    seed vs r244 (attempts 22/ok 13/refused 9 on the PS4 arm;
    main-panel attempts from the r244 analyzer table); any launch
    naming a companion whose expedition never existed is the
    mirror gap — FAIL LOUDLY.
31. AMMO-NAMING WATCH (new, descriptive): any field-fight 'no X'
    line naming the WRONG ammo for the weapon is a REGRESSION of
    the #2593 fix, filed LOUD. (The fix itself is narration-only;
    a wrong-ammo line is the only failure shape.)

NOT this run: the RUINROAD forced-search arm. Cumulative 0/317
(r244 panel: 1 ruin search, 0 med items; cumulative now 0
acquisitions in 317 ruin searches) is a PROVEN constraint;
re-running the arm with no lever landed would re-prove it (Steve
2026-11-01 rebuke). The supply question lives with the medicine
build brief.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14551–14555. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo) — zero hits for 14551, 14552, 14553, 14554, 14555 as
  seeds. The full-evidence grep found 2 false positives only:
  `game.js:14554` (a line number in a landing prereg) and a lock
  run_id timestamp `20261117T145537Z` (not a seed). Scripts grep:
  zero hits. Forbidden bands named in preregs (73641–73648,
  73671–73678; 99201–99208; 78201–78208; 99351–99358;
  99401–99412): no intersection. Collision notes (carried):
  14541–14545 r244. 14531–14535 r241. 14521–14525 r240.
  14511–14515 r238. 14501–14505 r230. 14491–14495 r229.
  14481–14485 r228. 14471–14475 r223. 14461–14465 r216.
  14451–14455 r208. 14441–14445 r201. 14431–14435 r192.
  14421–14425 r182/r186. 14411–14415 r181. 14401–14405 r180.
  Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14551–14555,
  sequential. PILOT FIRST (§9): seeds 14551–14553 run first; the
  panel expands to 14554–14555 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the
  answer.
- Smoke first: SEED=14551 DAYS=5 into the r247 evidence dir,
  driver runs, no instrumentErrors, stranger counters present.
- Driver: r244 driver verbatim EXCEPT r247 filenames/paths/seeds
  (14551–14555), ORIGINS map keys, EVID path 2026-11-19, DAYS 150,
  + the PANTRYPER instrument field (roster on pantryDaily —
  record-only, see above). Verified by diff: only renames, dates,
  seed/ORIGINS changes, the prereg path, and the one instrument
  line differ; history lines untouched.
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r247 seeds (r201 hygiene carried).
- Analyzer: r244 analyzer verbatim EXCEPT r247 filenames/paths.
  Validated on r244's per-seed JSONs before the panel: carried
  numbers reproduce (panel table + NODEAWAY 15/6/worst-5).
- EVID (goal hidden_files): evidence/2026-11-19/ for per-seed
  JSONs + transcripts; repo evidence/2026-11-19/ holds the prereg,
  run note, and gate log (committed).

## Side-arm PS4 — PARTYSIZE4 reach on the crisis band (descriptive, not §15)

- Same driver, same 3 pilot seeds (14551–14553), env
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1` — the substrate the
  partysize4 pilot ran on (second companion needs VETREENGAGE;
  third needs PARTYSIZE4; FLEEREPAIR2 is the pilot's plan-seeding
  substrate). Separate EVID subdir `evidence/2026-11-19/ps4/`
  (same filenames, no overwrite). Analyzer runs on that dir.
- Question: does any trio/quad fire on the crisis band with the
  substrate on? r244's PS4 arm: trios 2/3 seeds, quads 1/3, but
  deltaBad 2 on 14543 (both paid-6000 shortfalls) — a PS4-only
  anomaly to watch for recurrence. 0/3 here is a reach finding
  about the launch drought, not a lever failure; any quad/trio is
  the reach confirmed. NOT a §15 comparison (no frozen bars, n=3,
  trajectories diverge at first plan) — descriptive only, never
  lever attribution.
- The side-arm runs AFTER the main panel (same seeds, sequential
  processes — never two harnesses in one process, never parallel
  jest/sim under load).

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel;
  other-surface dry lines reported with pick attribution, no bar.
  Any dry line on a NEW surface is the next fix item, named in
  the run note.
- DRY3 CONFIRM (binding this run): 0 dry lines on the three r235
  fixed surfaces. Any dry line is a REGRESSION of the r235 fix.
- DRY2 CONFIRM (binding this run): 0 dry lines on the three r234
  fixed surfaces. Any dry line is a REGRESSION of the r234 fix.
- R238 DRY CONFIRM (binding this run): 0 dry lines on the repay
  opener (FALLBACK-STRUCTURAL surface). Any dry line is a
  REGRESSION of the r238 fix.
- Q6 RETIRED (r201 metric review): descriptive-only.
- C1 (bend, not break) GO: every game-over has a named cause that
  is NOT a siege-mechanic failure; horizon reachable on at least 1
  seed is descriptive, not a bar. A softlock seed is reported
  separately.
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
  confession: 0 expected (r172 guard + r143 spend); any recurrence
  is a guard failure, filed LOUD. Naming-stance wobble: a fourth
  sighting graduates to a fix item.
- C3b SETTLED-FAVOR CONFIRM — THIRD WILD PANEL (binding this
  run): every "settled" close line fires only on a sitting that
  shared a real beat with the favor it names, AND a broken favor
  whose need is still live is never called done/square/settled.
  Spot-check each one, with pantryPer read from the per-seed
  JSON (pantryDaily kcal / roster) for the settled line's day.
  Any false settlement is a REGRESSION of the r240 fix, filed
  LOUD. 0 served is a coverage note, not a confirmation.
- C3c CLOSED: see thread 5. Any resume opener naming a changed
  favor is a REGRESSION of the r228 fix, filed LOUD.
- C3d CONFIRM (binding this run): every recap served while a
  favor/want is live on the table names that want; a "Nothing
  important" recap with live business is a REGRESSION of the r231
  fix, filed LOUD. "Nothing important" with nothing open is honest
  and recorded, not judged.
- WRAP-CHECK GO: analyzer WRAP section reports unmarked = 0 across
  all driven transcripts.
- C7b GO: buried list reported per seed; corpse-cause counts
  reported for famine/disease/wound/thirst.
- S1–S5 SUPPLY: NOT RUN this panel (RUINROAD parked). Cumulative
  stays 0/317, carried as the standing number; the supply question
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
  wins/losses vs r244's arena-death say lines, no bar. No
  win/loss instrument exists — the instrument gap carries.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming
  the mend + funeralMendStats counters per seed; any silent mend,
  silent shortfall, or over-claim line is a FINDING (over-claim =
  r216 F1 REGRESSION).
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as
  the killer; gorge nights and sortie shape vs r244.
- NODEAWAY PANEL METRIC (tracked, no bar): NODEAWAY_PANEL totals
  vs r244's 15/6/worst-5 and r241's 11/6/worst-3. A repeat at
  r244's scale keeps the muster-vs-travel tension a design
  question; movement is reported descriptively against the base
  movement, never lever attribution with n=5.
- STAGE-0 SURFACING WATCH (descriptive): stage-0 ask_favor wants
  with a live need that sit a full sitting with dlg:help never
  offered, recorded per sitting; a second sitting graduates to a
  fix item.
- DEATHCLEANUP WATCH (measurable): deathCleanups +
  removalCleanups + planSeeds stats per seed; winPlan census per
  seed; any dead-holder entry lingering at census is a FINDING;
  planSeeds == 0 with entries present is a FINDING; firstPlanDay
  the day after a death with zero cleanups is a FINDING.
- NONDEATHPLAN WATCH (descriptive): removalCleanups stat per seed;
  any winPlan entry for a removed villager lingering at census is
  a FINDING.
- TITAN-REFUSAL CONFIRM (binding this run): refusal lines per
  titan per day ≤ 1 (r233 fix) AND spoken "you have N" equals the
  gate count (F2 fix), judged against the outcomes table
  (calls). Any repeat on the same titan-day is a REGRESSION of
  the r233 fix; any spoken-count/gate-count mismatch is a
  REGRESSION of the F2 fix. Both filed LOUD. Zero lines with
  zero 'refused' outcomes is vacuous-explained.
- DEFERRED-ASK WATCH (descriptive): any dlg:help 'already handled'
  answer about a settled favor while a live need waits is a
  REGRESSION of the r231 fix, filed LOUD.
- HOMEBODYVOICE / NOTICKDEFER (descriptive-only, retired): picks
  vs voice lines reported; never judged.
- TRIODROUGHT WATCH (main panel: 0 expected by construction;
  PS4 arm: the discriminating read): partyTrios / partyQuads per
  seed + launched-party sizes. Any trio/quad on the PS4 arm is
  the reach confirmed; 0/3 is a reach finding about the launch
  drought.
- REL-MOURN WATCH (descriptive): mourning lines name the
  relationship; any wrong-name line is a REGRESSION of the r231
  fix, filed LOUD.
- MUSTER-GROWTH WATCH (descriptive): dawn muster-growth lines per
  seed; do they fire and name the right fire/commit?
- HOLDERVoice WATCH (descriptive): holder-half lines ("stays home")
  vs companion lines ("never leaves Haven") per seed.
- POCKET WATCH (descriptive): fights with ≥3 stuck turns; bar 0
  (r144 repair). Any such fight is a FINDING.
- TRAILTALK WATCH (descriptive): any verbatim repeat of the same
  trail-talk line 3×+ in one outing is a REGRESSION of the r236
  fix, filed LOUD.
- WALKHOMe WATCH (descriptive — new): any homeward travel that
  strands, loops, or narrates an unclearable refusal is a FINDING.
- TABLEACTIVE WATCH (descriptive — new): any mercy/table line is
  reported, not judged; expected vacuous.
- DOOR-GUARD WATCH (descriptive — new): any door-tile fight eject
  is a FINDING; fledBad firings reported by day + monster HP.
- LINK-ACCEPT ECHO WATCH (binding this run): any accepted raise
  talk serving '"All right — let's ask them."' is a REGRESSION
  of the r243 link-accept fix, filed LOUD.
- WANT-BRIDGE WATCH (binding this run): any want-bridge repeat
  inside one sitting before 11 bridges is a REGRESSION of the
  r146 pool widening, filed LOUD.
- SENSEEXPED LAUNCH WATCH (descriptive — new): launches per seed
  vs r244; any launch naming a companion whose expedition never
  existed is the mirror gap — FAIL LOUDLY.
- R244-FIX RE-CHECK (binding this run): mime variant rotation
  across days; Wren note variety across drops. Same-variant mime
  3 days running is a REGRESSION of the r241 mime fix; a Wren
  note reprinted 5×+ on one seed is a REGRESSION of the r241
  Wren fix. Both filed LOUD with a fix in-run if the cause is
  local.
- Interesting finding (panel triggers): any medicine acquisition
  on the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence); any resume-opener stale
  want label (C3c regression); any funeral-mend line that mends
  silently or over-claims; any "Nothing important" recap with a
  live favor on the table (C3d regression); any dry line on a
  DRY2-, DRY3-, or R238-fixed surface (DRY2/DRY3/R238 regression);
  reproduction of any r244 blemish at its graduation bar
  (doubt-stonewall 3×+ VERBATIM in one sitting; voted case
  re-appearing under a new number); resume-opener quote SPLIT
  across two entries (the real defect, not the ellipsis-cap
  shape); any dead-holder winPlan entry at census; any homebody
  voice line naming a wrong block; any titan refusal repeat on
  the same titan-day; any spoken titan count disagreeing with the
  gate count (F2 regression); any deferred pick launching the
  same day; any fight narrated as stuck / unreachable in the
  transcript read, or any sortie fight breaking with the party
  unable to reach the monster; any trail-talk line repeated 3×+
  in one outing; any trio/quad on the PS4 arm (TRIODROUGHT
  movement); any homeward travel strand (WALKHOMe); any
  door-tile fight eject; any link-accept parrot line (ECHO
  regression); any want-bridge repeat before 11 bridges; any
  launch naming a companion with no expedition (mirror gap); any
  field-fight 'no X' line naming the wrong ammo for the weapon
  (#2593 regression).

## Telemetry

- Metrics: defendedFights, playerFights, latelyDefenseCount vs
  baseline telemetry-baselines/crisis.json. LOUD lines are same-run
  investigation items before any baseline roll; baseline NOT rolled
  on a single panel's variance. The units question (r240 metric
  review 3, r241 metric review 8, r244 metric review 4) stays open:
  report per-seed values + the 5-seed sum and judge the per-seed
  range against the implied historical per-seed range.

## Metric review section

Every run note carries one. No metric is re-scored mid-run; doubts
go there and revisions apply to the NEXT run. Open from r244:
(1) C3b on the r244 panel was SERVED and held, but the exact
pantryPer figure at d68 was not recoverable from the saved corpus
— this run's PANTRYPER instrument (roster on pantryDaily) closes
that gap; the next run verifies the field is populated. (2) The
titan refusal line still counts ALLIED blades only ("you have 0")
while the gate counts allied + Haven (r238 F2 — fix owed,
carried) — NOW LANDED (d3dcd1acd); this run confirms it in the
wild, and the item closes if the spoken count matches the gate
count on every refused titan-day. (3) PS4 deltaBad 2 on 14543
(both paid-6000 shortfalls, one −9000) is a descriptive anomaly
on the side-arm only; this run watches for recurrence on the
fresh band. (4) Telemetry baseline units (crisis.json): sum or
mean? Still open. Per-seed defended fights on this panel are
reported below; the units question stays open for the next run.
(5) The rotation file read 6 at this run's start, disagreeing
with the r246 prereg's cycle (which implied 5 after its
closeout) — the file is the authority (r244 metric review 9
precedent); this run plays crisis (6) and writes 7 at closeout,
with a read-back. (6) HOMEBODY and NOTICKDEFER stay
descriptive-only (vacuous again expected). FLEEREPAIR3 and
WILDAVOID stay unmeasured — no instrument exists; this run does
not judge them. (7) The r240 player-side "we're square" option
question (r240 metric review 2) is carried unchanged: the NPC
side is honest; the player can still claim "we're square" with a
live need. Design question, not a false claim by the game.
(8) The invite-decline "Another time. The village needs me
here." has no re-ask variant — identical twice in one sitting.
Polish, not a defect. (9) The 10:28Z flap-probe window left a
0-byte file in `.git/refs/heads/` that blocked every fetch until
moved — the probe owner should keep test files out of `.git/`.
(10) The stale lock at 09:56:10Z (no registered tree, no
heartbeat, no process) is the second coordinator-death-after-
lock in this lane's history — the heartbeat-or-dead guard held.
(11) worktree-register.sh silently attaches to a stale pre-
existing branch (this run: 7 commits behind) instead of
branching from master — the fallback needs a fast-forward or a
loud failure. Filed as an infrastructure finding in the run
note; not fixed in this run (shared script, out of scope for a
measurement run). (12) Master moved 12 commits during this
run's 25-min registration — a measurement run's "base" is only
fixed once the worktree is verified at a tip; the prereg base
is the verified tip (416e81241), not the pre-flight tip.

## Prereg amendment (before the first scored seed — not a re-score)

TITAN-REFUSAL wild-check method, clarified: the per-seed JSON
carries titan outcomes ({titan, day, outcome, endDay}) and the
analyzer prints each gate line's spoken "you have N", but the
muster composition (unique living allies + committed Haven
blades) at refusal time is NOT persisted in the corpus — so a
strict per-line spoken-vs-gate equality check cannot be computed
from the saved files alone. The helper agreement itself is proven
on this base by the r243 proof test
`scripts/test-titan-refusal-have-counts-haven-20261119.js`, re-run
in this worktree before the panel: **15 passed, 0 failed**
(including "dup refusal says 'you have 9'", the exact r244
wrinkle shape). The wild confirm therefore judges: (a) ≤1 refusal
line per titan per day (gateRepeatLines == 0); (b) the spoken
counts across the panel's gate lines, cross-checked against
Haven-commitment evidence in the same seed's transcripts where a
line's count is in question — any line saying "you have 0" on a
day the transcript shows Haven blades committed is a REGRESSION
of the F2 fix, filed LOUD. A future run that wants a strict
per-line check must persist the muster composition at outcome
time (driver instrument).
