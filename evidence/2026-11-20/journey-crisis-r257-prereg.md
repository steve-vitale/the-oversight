# Journey crisis r257 — PREREGISTRATION (Lane B, leg 6)

**Status: FROZEN. This run (`playtest2-20261120T1555Z`, scheduled Fri
2026-11-20 10:00 CST / 16:00Z) plays crisis (6) on seeds 14571–14575 per
this prereg. Base master `057bfa60f`. Rotation-b read 6 at run start; this
run writes 7 at closeout. The r253 panel (seeds 14561–14565, base
`1cb6ce2e1`) went GO with the march-refusal + antler-thrash fixes landed
(`eb12c1471`); this run is the first wild confirmation panel for both
fixes on the new base.**

## Run-state handoff (r257, written at run start)

- Lock: NO `playtest-loop-2.lock` existed at run start (r256's adoption
  deleted its own at closeout; the 09:00 CST occurrence stood down without
  touching it). Own lock created 15:56:00Z, run_id
  `playtest2-20261120T1555Z`; deleted at closeout with run_id verified in
  the same call.
- Pre-flight: main tree clean at 15:55Z (`git status --short` empty).
  Disk 49%. `git pull --ff-only`: already up to date (tip `057bfa60f`).
  `worktree-reap.sh`: nothing removed, 13/16 active, 10 LOUD dirty trees
  (other owners', left alone: journey-scale-attr, sim-inffight-ab,
  sim-redactor-a, sim-saycap-a, sim-secondlink-a, sim-siegedialog-a,
  journey-landing, sim-deadsuppress-b, sim-presence-a, sim-evade-a,
  sim-strikeband-b, sim-targetless-b — reaper output truncated to tail;
  full list in the run note).
- Registration: `bash scripts/worktree-register.sh journey2-crisis
  oversight-playtest-loop-2 "village journey lane B: crisis"` — slow
  (~13+ min at note time): `git worktree add` checkout to 8.2G plus
  registry-flock contention with sibling loops (load avg ~13, VM up 47
  min after a ~15:21Z restart). Worktree verified in `git worktree list`
  at `057bfa60f` [journey2-crisis] locked while the registry write waited
  on flock. Heartbeat immediately after registration completes.
- Canon read: CANON.md + DISEASES.md read in full by r247/r251/r253;
  `git log 1cb6ce2e1..057bfa60f` on CANON.md, DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
  DIRECTIVES.md is EMPTY — r247's canon read stands unchanged.

## Base movement since r253's panel base (1cb6ce2e1 -> 057bfa60f) — classified

65 commits. Canon unchanged (see above).

LIVE (behavior changes under the default panel):
(a) **R253 FIXES THEMSELVES (`eb12c1471`)** — march-gate refusal says its
    line once per muster-day (`finale-campaign.js`, marchRefusalDay); the
    refusal still stands on every attempt (return null). Antler-thrash
    composes via `articlePhrase(mn, true)` (`game.js` tbAntlerThrash).
    This panel is the FIRST WILD CONFIRMATION of both. Watches: march
    refusal lines ≤1 per muster-day (thread 33); any "The The"
    antler-thrash line is a REGRESSION of the r249/r253 fix (thread 34).
(b) **GROWTH-LINE COOLED CALL (`e086cffcb`, deepening r245, game.js)** —
    dawn growth line re-validated at the act, reworded (Q1 fix, proof
    28/28). LIVE dialogue. Watch: growth lines naming the right act
    (thread 35).
(c) **GOSSIP-ASK DRY FIX + TRAIL 3-PRESS (`ed19c3d57`, social r256,
    conversation.js / convo-wants.js)** — gossip-ask dry lines fixed (Arm
    C); trail-talk verbatim repeat capped at 3 presses. LIVE dialogue.
    Watches: DRY census on the gossip-ask surface (thread 1); any
    verbatim trail-talk repeat 3x+ in one outing is now a REGRESSION of
    the r256 fix (thread 36 — was the graduation bar, now the fix is
    live).
(d) **WANT-MENU REACT WIND-DOWN (`db6f4d7ce`, scale r246, [needs-eyes])**
    — LIVE. Watch want-menu react behavior (thread 37).
(e) **MULTI-NAME WITNESS VARIANT (`aea63f6b5`, succession r254,
    convoTopics.js)** — mourning pool serves witness lines when the
    speaker saw the latest fresh dead fall (proof 4/4). LIVE dialogue.
    Watch REL-MOURN: witness lines naming the right witness/dead
    (thread 16).
CORRECTION to r253's classification: **BOWKNOW (`eaf530d6a`) is
ENV-GATED, not live.** r253's base-movement note called it live; the
code requires `process.env.BOWKNOW === '1'` (`villager-build.js:1361`)
and the default panel never sets it. Inert under the default panel.
The sim-bowknow-a verdict was NO-GO and the lever was never turned on.
(f) **SEARSUPPLY REVERTED (`0fd416c5d`)** — the lever (`6c4b75925`,
    contests.js +66 / game.js +12) was reverted in full after the
    NO-GO (SUPPLY) verdict. Not live; nothing to watch.
Inert: all sim-* diagnostics + evidence-only commits (dmgsurvey,
deadtarget, laterage, spearstage, fusioncell, cellgate, gunrate, depmat,
dmgshape, searsupply/bowsee instruments), all round records, ship
version bumps (build.js only), journey r254/r255/r256 evidence + run
notes + gate logs. No medicine-lever commits: the levers from the
2026-11-13 medicine brief have NOT landed (Steve ruled 2026-11-14 the
trio needs more complexity). RUINROAD arm stays parked (cumulative
0/317, proven constraint).

## Leg question (carried from crisis r253, updated for the base)

**Do r253's verdicts hold on the new base — march-refusal dedup,
antler articlePhrase, growth-line cooled call, gossip-ask dry fix,
TRAIL 3-press, want-menu wind-down, witness-mourn — and does the
PARTYSIZE4 substrate reach the crisis band, where r253's PS4 arm
seeded trios 3 + quads 3 on 14562 (reach 1/3 seeds)?**
Threads (r253's 1–32 carried; updates noted; new 33–39):
1–3. DRY3 / DRY2 / R238-DRY CONFIRM (binding): 0 dry lines on the fixed
   surfaces. NEW surfaces this run: gossip-ask (r256 Arm C fix) — any
   dry line there is a REGRESSION of the r256 fix. F8 confide gate,
   maps-pool compare_maps — any dry line there is the next fix item,
   named in the run note.
4. C3b SETTLED-FAVOR CONFIRM — FIFTH WILD PANEL for the r240 fix: a
   broken favor whose need is still live must NEVER be called done/square/
   settled. Spot-check every "settled" line with pantryPer from the
   per-seed JSON (pantryDaily kcal / roster — PANTRYPER instrument
   carried). Any false settlement is a REGRESSION of the r240 fix. 0
   served is a coverage note, not a confirmation.
5. C3c CLOSED (r228). Any resume opener naming a favor that changed since
   planting is a REGRESSION of the r228 fix.
6. C3d CONFIRM (binding): a "Nothing important" recap with live business
   is a REGRESSION of the r231 fix.
7. NODEAWAY PANEL METRIC (tracked, no bar): r253 15/6/worst-5 (matched
   band); r247 15/6/worst-5; r244 15/6/worst-5; r241 11/6/worst-3;
   r240 19/10/worst-4.
8. FUNERAL-MEND CONFIRM (r216 F1): any over-claim line is a REGRESSION.
9. STAGE-0 SURFACING WATCH (descriptive): a second sitting with dlg:help
   never offered graduates to a fix item.
10. DEATHCLEANUP WATCH (measurable): any dead-holder winPlan entry
    lingering at census is a FINDING; planSeeds == 0 with entries present
    is a FINDING.
11. NONDEATHPLAN WATCH (descriptive): any winPlan entry for a removed
    villager lingering at census is a FINDING.
12. TITAN-REFUSAL CONFIRM (binding): refusal lines per titan per day ≤ 1
    (r233 fix) AND spoken "you have N" equals the gate count (unique
    living allies + committed Haven blades — F2 fix). Re-run the r243
    proof test `scripts/test-titan-refusal-have-counts-haven-20261119.js`
    in the worktree before the panel (was 15/15 on r247's base; re-run
    on this base).
13. DEFERRED-ASK WATCH (descriptive): any dlg:help 'already handled'
    about a settled favor while a live need waits is a REGRESSION of the
    r231 fix.
14. HOMEBODYVOICE + NOTICKDEFER: descriptive-only (retired r241; vacuous
    expected).
15. TRIODROUGHT WATCH — main panel expects 0 by construction (PARTYSIZE4/
    VETREENGAGE gated OFF); the discriminating read is the PS4 side-arm.
16. REL-MOURN WATCH (descriptive): any mourning line wearing a wrong name
    is a REGRESSION of the r231 fix. NEW: r254 witness variant — a
    witness line must name a speaker who actually saw the latest fresh
    dead fall; a witness line from a non-witness is a FINDING.
17. MUSTER-GROWTH WATCH (descriptive): dawn muster-growth lines — fire,
    name the right fire/commit?
18. HOLDERVoice WATCH (descriptive): holder-half vs companion lines per seed.
19. POCKET WATCH (descriptive): fights with ≥3 stuck turns; bar 0 (r144).
20. TRAILTALK WATCH (descriptive): see thread 36 (3-press fix now live).
21. FIGHT-1 WATCH (descriptive): okSorties / cleared / multiMonsterCleared
    vs r253 (main panel analyzer table); a cleared fight-1 with vTaken
    >= 70 is the standing Q4 live-play confirmation trigger (r253 max
    65, not fired).
22. FLEEREPAIR3 / WILDAVOID: STILL UNMEASURED — no instrument exists. Do
    not judge them.
23. CRISIS REGRESSION (descriptive): raids, gorge nights, sorties, favors,
    mourning fire on ordinary seeds; villages bend or break the same way.
    r253 fresh band: 3/5 game-overs (BAND verdict — hunger wall, not a
    regression); matched band 5/5 horizon.
24. R244-FIX RE-CHECK (binding): mime variant rotation across days; Wren
    note variety. Same-variant mime 3 days running is a REGRESSION of the
    r241 mime fix; a Wren note reprinted 5x+ on one seed is a REGRESSION
    of the r241 Wren fix. Doubt-stonewall 3x+ VERBATIM in one sitting
    graduates to a fix item. Voted case re-appearing under a new number;
    resume-opener quote SPLIT across two entries — watch both.
25. WALKHOMe WATCH (descriptive): any homeward travel that strands, loops,
    or narrates an unclearable refusal is a FINDING.
26. TABLEACTIVE WATCH (descriptive): any mercy/table line is reported, not
    judged; expected vacuous.
27. DOOR-GUARD WATCH (descriptive): any door-tile fight eject is a FINDING;
    fledBad firings named by day + monster HP.
28. LINK-ACCEPT ECHO WATCH (binding): any accepted raise talk still serving
    '"All right — let's ask them."' is a REGRESSION of the r243/r148
    link-accept fix. Link-accept still untested through r253 (0 raises,
    fifth panel running) — this is the SIXTH panel; 0 served again is a
    coverage note, and the ECHO question stays open.
29. WANT-BRIDGE WATCH (binding): any want-bridge repeat inside one sitting
    before 11 bridges is a REGRESSION of the r146 pool widening.
30. SENSEEXPED LAUNCH WATCH (descriptive): launches per seed vs r253; any
    launch naming a companion whose expedition never existed is the mirror
    gap — FAIL LOUDLY.
31. AMMO-NAMING WATCH (descriptive): any field-fight 'no X' line naming the
    WRONG ammo for the weapon is a REGRESSION of the #2593 fix.
32. BOWCRAFT WATCH (descriptive): bows/armed counts per seed vs the
    bowcraft arms (attempts 54, bows 15 on band 107011–107018); any
    bowcraft-duty villager with no bow after a full season is a supply
    observation, not a bar. BOWKNOW is env-gated OFF — no mentoring
    lines expected; any bowknow teach line on the default panel is an
    env-gate failure, FAIL LOUDLY.
33. MARCH-REFUSAL CONFIRM (binding, NEW): the Commercial Break march
    gate says its refusal line at most ONCE per muster-day (r253 fix).
    Count refusal lines per muster-day in the panel transcripts; >1 on
    any day is a REGRESSION of the r253 fix. The refusal itself still
    stands on every attempt (return null) — a refused attempt with no
    line on a fresh day is also a FINDING. Re-run the r253 proof test
    `scripts/test-finale-march-refusal-once-per-day-20261119.js` in the
    worktree before the panel (was 7/7 on r253's base).
34. ANTLER "THE THE" CONFIRM (binding, NEW): any antler-thrash line
    reading "The The <name>" is a REGRESSION of the r249/r253 fix.
    Re-run the r253 proof test
    `scripts/test-antler-thrash-the-the-20261119.js` in the worktree
    before the panel (was 7/7). Also watch any counter line using a
    comma-carrying display name as the noun (r253 metric review 15 —
    the 9fb55be89 counter-label fix).
35. GROWTH-LINE WATCH (descriptive, NEW): dawn growth lines under the
    r245 cooled call — the line must name the act actually taken, not a
    cooled one. A growth line naming a cooled act is a REGRESSION of
    the r245 fix.
36. TRAIL 3-PRESS CONFIRM (binding, NEW): any verbatim trail-talk repeat
    3x+ in one outing is a REGRESSION of the r256 TRAIL 3-press fix
    (was the r236 graduation bar; the fix is now live).
37. WANT-MENU WIND-DOWN WATCH (descriptive, NEW): want-menu react lines
    under the r246 wind-down fix — a react line firing after its want
    wound down is a FINDING.
38. WAR-PATH NAME WATCH (descriptive, NEW — open defect from endgame
    r255): full-seat war-path lines naming nonexistent monsters ("The
    Big Thing", "Big-Bane", "Big Ugly") instead of actual kills. Any such
    line on this panel is the same defect class, named in the run note
    for the next fix round.
39. COUNTER-LABEL WATCH (descriptive, carried from r253 review 15): any
    counter line using a comma-carrying display name as the noun is a
    REGRESSION of the 9fb55be89 fix; the r244 panel's fired set
    (belltoad/dustboar/rut_king) is the reference.

NOT this run: the RUINROAD forced-search arm (cumulative 0/317, proven
constraint; Steve 2026-11-01 rebuke). The supply question lives with the
medicine build brief. M4-SPLIT is a social-leg instrument (r256 NO-GO by
one, 13 vs bar 12 — metric review owed on the SOCIAL leg); the crisis
analyzer does not report M4 counts, so it is not judged here.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band **14571–14575**. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo) — the only hits for 14571–14575 are timestamp coincidences in
  run_ids (`loop2-20261103T145757Z` in r118/r226/r239/r256 preregs — a
  timestamp, not a seed). Goal hidden_files preregs: zero hits for
  14571-14575. Forbidden bands named in preregs (73641–73648,
  73671–73678; 99201–99208; 78201–78208; 99351–99358; 99401–99412): no
  intersection. Collision notes (carried): 14561–14565 r253.
  14551–14555 r247. 14541–14445 r244. 14531–14535 r241. 14521–14525 r240.
  14511–14515 r238. 14501–14505 r230. 14491–14495 r229. 14481–14485 r228.
  14471–14475 r223. 14461–14465 r216. 14451–14455 r208. 14441–14445 r201.
  14431–14435 r192. 14421–14425 r182/r186. 14411–14415 r181. 14401–14405
  r180. Band is fresh. (Verified by grep at run start; r253's
  third-check method reused.)

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14571–14575,
  sequential. PILOT FIRST (§9): seeds 14571–14573 run first; the panel
  expands to 14574–14575 only if the instrument holds (smoke green, no
  instrumentErrors, stranger counters populating). If the pilot shows 0
  alien kills on all 3 seeds, that IS a finding about the channel's rate
  (not an instrument failure) and the expansion still runs.
- Smoke first: SEED=14571 DAYS=5 into the r257 evidence dir, driver runs,
  no instrumentErrors, stranger counters present.
- Driver: r253 driver (`scripts/journey-crisis-r253-delayed-20261119.js`)
  verbatim EXCEPT r257 filenames/paths/seeds (14571–14575), ORIGINS map
  keys (Seattle/Boston/Austin/Chicago/Phoenix keyed to all five r257
  seeds), EVID path 2026-11-20, DAYS 150, prereg path. PANTRYPER
  instrument (roster on pantryDaily) carried. Verified by diff: only
  renames, dates, seed/ORIGINS changes, the prereg path differ.
- Analyzer: r253 analyzer (`scripts/analyze-crisis-r253-delayed-20261119.js`)
  verbatim EXCEPT r257 filenames/paths. Validate on r253's per-seed
  JSONs before the panel: carried numbers reproduce (panel table +
  NODEAWAY).
- EVID (goal hidden_files): `evidence/2026-11-20/` for per-seed JSONs +
  transcripts; repo `evidence/2026-11-20/` holds the prereg, run note,
  and gate log (committed).

## Side-arm PS4 — PARTYSIZE4 reach on the crisis band (descriptive, not §15)

- Same driver, same 3 pilot seeds (14571–14573), env
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1`. Separate EVID subdir
  `evidence/2026-11-20/ps4/` (same filenames, no overwrite). Analyzer runs
  on that dir.
- Question: does any trio/quad fire on the crisis band with the substrate
  on? r253's PS4 arm: trios 3, quads 3 on 14562 (reach on 1 of 3 seeds);
  r247's: trios 0/2/0, quads 0/2/0 (reach on 1 of 3 seeds). 0/3 here is
  a reach finding about the launch drought, not a lever failure. NOT a
  §15 comparison (no frozen bars, n=3) — descriptive only, never lever
  attribution. Runs AFTER the main panel (sequential processes — never
  two harnesses in one process, never parallel jest/sim under load).

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel; other-surface
  dry lines reported with pick attribution, no bar. Any dry line on a NEW
  surface is the next fix item, named in the run note.
- DRY3 / DRY2 / R238-DRY CONFIRM (binding): 0 dry lines on the three r235 /
  three r234 / repay-opener surfaces. Any dry line is a REGRESSION of the
  respective fix.
- C1 (bend, not break) GO: every game-over has a named cause that is NOT a
  siege-mechanic failure; horizon reachable on at least 1 seed is
  descriptive, not a bar. A softlock seed is reported separately.
- C2 (episodes fire + gates hold) GO: raids fire on all seeds; fought
  resolutions present; D1 snapshots all delayed >= 3 attempts; deltaBad
  empty; D3 drift unknown = 0 (union counting).
- C2b (linger-conditional gorge/sortie) GO: every boundary-firable case fires
  or is refused with a recorded reason; no boundary-firable case unfired.
- C3 (people check) GO: all driven transcripts read in full; fabricHits = 0;
  conversations meet the meaning bar. VoiceLine prefix stacking >= 3
  sightings graduates to a fix in-run. Double confession: 0 expected; any
  recurrence is a guard failure. Naming-stance wobble: a fourth sighting
  graduates to a fix item.
- C3b SETTLED-FAVOR CONFIRM — FIFTH WILD PANEL (binding): every "settled"
  close line fires only on a sitting that shared a real beat with the favor
  it names, AND a broken favor whose need is still live is never called
  done/square/settled. Spot-check each one, with pantryPer read from the
  per-seed JSON (pantryDaily kcal / roster). Any false settlement is a
  REGRESSION of the r240 fix. 0 served is a coverage note.
- C3c CLOSED / C3d CONFIRM (binding): see threads 5–6.
- WRAP-CHECK GO: analyzer WRAP section reports unmarked = 0 across all
  driven transcripts.
- C7b GO: buried list reported per seed; corpse-cause counts reported for
  famine/disease/wound/thirst.
- S1–S5 SUPPLY: NOT RUN this panel (RUINROAD parked). Cumulative stays
  0/317, carried as the standing number.
- A1–A6 stranger counters: DESCRIPTIVE ONLY. A7 NOT judged on the crisis leg.
- ARENA WATCH (descriptive): arena-fight outcomes per seed under the Reunion
  re-tune (HP x0.4 / damage x0.6, mirror cap 1); no bar; no win/loss
  instrument exists — the instrument gap carries.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming the mend +
  funeralMendStats counters per seed; any silent mend, silent shortfall, or
  over-claim line is a FINDING (over-claim = r216 F1 REGRESSION).
  Counters are NOT persisted in the per-seed JSON (r247 metric review 8) —
  read the verdict from the lines themselves.
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as the killer;
  gorge nights and sortie shape vs r253.
- NODEAWAY PANEL METRIC (tracked, no bar): totals vs r253's matched 15/6/
  worst-5.
- STAGE-0 SURFACING WATCH (descriptive): stage-0 ask_favor wants with a live
  need that sit a full sitting with dlg:help never offered; a second sitting
  graduates to a fix item.
- DEATHCLEANUP / NONDEATHPLAN WATCH: see threads 10–11.
- TITAN-REFUSAL CONFIRM (binding): ≤1 refusal line per titan per day AND
  spoken "you have N" equals the gate count. Zero lines with zero 'refused'
  outcomes is vacuous-explained. (Strict per-line check still wants muster
  composition persisted at outcome time — driver instrument, future run.)
- MARCH-REFUSAL CONFIRM (binding): ≤1 march refusal line per muster-day;
  refusal still stands on every attempt. See thread 33.
- ANTLER "THE THE" CONFIRM (binding): 0 "The The" antler-thrash lines. See
  thread 34.
- TRAIL 3-PRESS CONFIRM (binding): 0 verbatim trail-talk repeats 3x+ in one
  outing. See thread 36.
- DEFERRED-ASK WATCH (descriptive): see thread 13.
- HOMEBODYVOICE / NOTICKDEFER (descriptive-only, retired).
- TRIODROUGHT WATCH (main panel: 0 expected by construction; PS4 arm: the
  discriminating read).
- REL-MOURN / MUSTER-GROWTH / HOLDERVoice / POCKET / TRAILTALK / WALKHOMe /
  TABLEACTIVE / DOOR-GUARD / LINK-ACCEPT ECHO / WANT-BRIDGE / SENSEEXPED /
  AMMO-NAMING / BOWCRAFT / GROWTH-LINE / WANT-MENU / WAR-PATH / COUNTER-LABEL
  watches: see threads 16–21, 24–32, 35, 37–39.
- Interesting finding (panel triggers): any medicine acquisition on the main
  panel (S3 > 0 — would mean the supply moved with no lever landed;
  investigate); a cleared fight-1 with vTaken >= 70 (Q4 live-play
  confirmation, standing); any dry-replacement on a NEW surface; any
  resume-opener stale want label; any funeral-mend line that mends silently
  or over-claims; any "Nothing important" recap with a live favor on the
  table; any dry line on a DRY2-, DRY3-, or R238-fixed surface; reproduction
  of any r253 blemish at its graduation bar; any dead-holder winPlan entry at
  census; any titan refusal repeat on the same titan-day; any spoken titan
  count disagreeing with the gate count; any march refusal line repeated on
  the same muster-day; any "The The" antler-thrash line; any verbatim
  trail-talk repeat 3x+ in one outing; any fight narrated as stuck /
  unreachable, or any sortie fight breaking with the party unable to reach
  the monster; any trio/quad on the PS4 arm; any homeward travel strand; any
  door-tile fight eject; any link-accept parrot line; any want-bridge repeat
  before 11 bridges; any launch naming a companion with no expedition; any
  field-fight 'no X' line naming the wrong ammo; any F8 confide line firing
  with no secret; any surviving "The The" scream (r249/r253 fix regression);
  any bowcraft-duty villager with no bow after a full season (descriptive);
  any bowknow teach line on the default panel (env-gate failure); any
  growth line naming a cooled act; any war-path line naming a nonexistent
  monster.

## Telemetry

- Metrics: defendedFights, playerFights, latelyDefenseCount vs baseline
  `telemetry-baselines/crisis.json`. LOUD lines are same-run investigation
  items before any baseline roll; baseline NOT rolled on a single panel's
  variance. The units question (r240 metric review 3, r241 metric review 8,
  r244 metric review 4, r247 metric review 4, r253 metric review) stays
  open: report per-seed values + the 5-seed sum and judge the per-seed range
  against the implied historical per-seed range.

## Metric review section (carried open items for the resuming run)

1. PANTRYPER verified populated on r247 (roster on every pantryDaily row);
   C3b adjudicated with exact figures.
2. Titan F2 item CLOSES on r247 (spoken "you have 0" honest on all 8 gate
   lines + proof 15/15); the strict per-line spoken-vs-gate equality check
   still wants muster composition persisted at outcome time (driver
   instrument, future run).
3. PS4 deltaBad anomaly did NOT recur on r247 or r253 — closes as
   non-recurring.
4. Telemetry baseline units (crisis.json): sum or mean? Still open.
5. HOMEBODY and NOTICKDEFER stay descriptive-only. FLEEREPAIR3 and
   WILDAVOID stay unmeasured — no instrument exists.
6. The r240 player-side "we're square" option question: the NPC side is
   honest (r247 proves it by contrast in one panel); the player can still
   claim "we're square" with a live need. Design question, not a false
   claim by the game.
7. Lucia's Tagalog pool repeats lines across sittings (small-pool
   observation, no bar) — r247 metric review 11.
8. 14553's census reads extinct=False with aliveCount=0 on an extinction
   game-over — census-owner look, no panel impact (r247 metric review 13).
9. Joko's d50 death absent from the census corpse list (no-body return) —
   census-owner look, no panel impact (r247 metric review 10).
10. funeralMendStats counters NOT persisted in the per-seed JSON (r247
    metric review 8) — a future run that wants counters must persist them
    (driver instrument).
11. Link-accept still untested through r253 (0 raises, fifth panel running)
    — this run is the sixth panel; ECHO stays open.
12. The rotation file read 6 at r257's start; this run plays crisis (6)
    and writes 7 at closeout, with a read-back.
13. worktree-register.sh FAILS LOUDLY when branch journey2-crisis already
    exists instead of attaching to it (r251, attempt #2, 8s) — the r247
    attach-fallback did not trigger. r253 adds a second failure mode: the
    script ALSO fails when the worktree PATH exists as a non-git husk
    (r251's partial checkout left `evidence/` only, 17G) — it does not
    clean or adopt the husk. The script owner should make both the
    branch-exists and path-exists paths fail loud with a clear message, or
    restore the attach fallback. (r253 deleted the branch and moved the
    husk aside; hashes verified vs `5e38f3f7b` first.)
14. Flap probes must NEVER write under `.git/refs/heads/` — r251 left a
    0-byte `probe-r251` broken ref (removed same run). Probe only in
    worktrees/ or hidden_files/.
15. COUNTER-LABEL WATCH (carried from r253): the comma-clause fix
    (9fb55be89) — any counter line using a comma-carrying display name as
    the noun is a REGRESSION of that fix; the r244 panel's fired set
    (belltoad/dustboar/rut_king) is the reference.
16. BOWKNOW CORRECTION (new for r257): r253's base-movement note called
    BOWKNOW live; it is env-gated (`BOWKNOW=1`) and OFF under the default
    panel. Any future base-movement classification must read the gate in
    code, not the commit message.
17. M4-SPLIT metric review (social leg, carried): r256 NO-GO by one
    (conversational 13 vs bar ≤12). Owed on the next SOCIAL run, not
    judged here — the crisis analyzer carries no M4 instrument.
18. War-path monster names (open defect, endgame r255): full-seat lines
    name nonexistent monsters ("The Big Thing", "Big-Bane", "Big Ugly").
    Next fix round's item; this run watches for the same class (thread 38).
