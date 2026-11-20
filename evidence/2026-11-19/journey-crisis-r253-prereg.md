# Journey crisis r253 — PREREGISTRATION (Lane B, leg 6)

**Status: ADOPTED from the r251 draft. This run (`playtest2-20261120T0105Z`,
scheduled Thu 2026-11-19 19:00 CST / Fri 2026-11-20 01:00Z) plays crisis (6)
on seeds 14561–14565 per this prereg. r251 (22:00Z) never played — worktree
registration failed twice on the host write flap; r252 (23:58Z) aborted at
pre-flight — main tree dirty from the failed Lane A r244 ff-merge (since
repaired; r244 landed as `8bd330f22`, main tree clean at this run's start).
Rotation-b read 6 at run start; this run writes 7 at closeout. Base master
`1cb6ce2e1`. The resuming run adopted the r251 draft VERBATIM except the
handoff, base-movement, and band sections below; all threads, metrics, and
bars are the r251 draft's, re-verified before playing.**

## Run-state handoff (r253, written at run start)

- Lock: NO `playtest-loop-2.lock` existed at run start (r252 deleted its own
  at closeout). Own lock created 01:03:16Z, run_id
  `playtest2-20261120T0105Z`; deleted at closeout with run_id verified in
  the same call.
- Branch `journey2-crisis` (r251's failed-registration remnant, at old ship
  bump `7d71cb971`, 0 commits ahead of master) DELETED at 01:05Z after the
  flap cleared (watcher ALL-OK 00:57–01:02Z). Registration #1 then failed on
  a SECOND remnant: `~/workspace/worktrees/journey2-crisis/` existed as a
  bare directory (no `.git`, no registry entry, not in `git worktree list`)
  holding only `evidence/` — a 17G partial checkout of master's committed
  `evidence/` tree from r251's registration #1 (checkout wrote evidence/,
  then died on the flap). Two spot files hash-matched their git blobs at
  `5e38f3f7b` exactly — pure checkout husk, no unique work. Moved aside
  (rename, recoverable) to
  `~/workspace/worktrees-orphans/journey2-crisis-evidence-husk-20261120T0108Z`
  (main session: safe to delete once confirmed). Registration #2 then
  SUCCEEDED (REG-EXIT 0, ~5 min); worktree at master tip `1cb6ce2e1`,
  clean, heartbeated immediately.
- Pre-flight: main tree clean at 01:03Z (the 00:55Z dirt was the ship loop's
  pre-commit bump state; bump `1cb6ce2e1` landed 00:55:45Z; `git status`
  slowness at 01:00Z was the post-`read-tree` restat, settled by 01:03Z).
  Disk 47%. `git pull --ff-only`: already up to date. `worktree-reap.sh`:
  nothing removed, 10/16 active, 9 LOUD dirty trees (other owners', left
  alone).
- Canon read: CANON.md + DISEASES.md read in full by r251/r252; `git log
  416e81241..1cb6ce2e1` on CANON.md, DISEASES.md, MONSTER-WAVES.md,
  CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md, DIRECTIVES.md is EMPTY —
  r247's canon read stands unchanged.

## Base movement since r247 (416e81241 -> 5e38f3f7b) — classified for the resuming run

LIVE (behavior changes under the default panel):
(a) BOWCRAFT TURN-ON (d56fbe819, src/js/villager-build.js): env gate removed
    — bowcraft duty always on in live play. Fix ef1c81094: serve ranged-less
    villagers + seed bow knowledge from seeing. LIVE: more bows in villages
    → more armed villagers → launches/sorties/armed fights may shift vs
    r247. Watch attempts/ok/refused, armed fights, volley lines.
(b) LINK-ACCEPT ROTATION BY POOL INDEX (cf17e4dd6, src/js/bond-initiation.js
    +29): accepted raises rotate by pool index instead of parroting. ECHO
    watch: variety should improve (r148 verified 22/1→14/9). Any parrot line
    is a REGRESSION of the r148 fix, filed LOUD.
(c) DOUBLE-"THE" NARRATION FIX (26772ac93, src/js/game.js + favor-outing.js,
    string-only, RNG-neutral, proof 14/14): no more "The The Big Loud"
    screams. Any surviving "The The" line is a REGRESSION of the r249 fix.
(d) F8 CONFIDE-LINE SECRET GATE (baba35e87, src/js/conversation.js +12):
    confide lines gated on secrets. LIVE dialogue. Any confide line firing
    with no secret is a gate failure — FINDING.
(e) MAPS-POOL EXPANSION (c44c7382b, src/js/conversation.js +19):
    compare_maps nonenew 2→6, shared 3→6. LIVE dialogue. DRY census watch.
ENV-GATED / INERT under the default panel:
(f) SUBCAP-LIFT (c6d14b071): scripts + test only, no src/js. Inert.
(g) ALLYSLOT3: NOT in src/js (grep empty) — the dmgshape-b "ported live"
    note is panel-substrate-only. Inert.
(h) SPEARGATE / BOWOPEN / FIGHTALLY2 / WILDAVOID / FLEEREPAIR2-3: unchanged,
    still gated. PARTYSIZE4/VETREENGAGE only in the PS4 side-arm.
(i) Moderator-mute guard (cf17e4dd6, scripts/policies/competent.js +78):
    bot policy only; the crisis driver uses oracleV2 — inert for this panel.
(j) Version bumps (17bb496df, 2c2b6b293): build.js only. Inert.
No medicine-lever commits: the levers from the 2026-11-13 medicine brief
have NOT landed (Steve ruled 2026-11-14 the trio needs more complexity).
RUINROAD arm stays parked (cumulative 0/317, proven constraint).

## Base movement since r251's base (5e38f3f7b -> 1cb6ce2e1) — classified for r253

12 commits. Only ONE touches live behavior under the default panel:
(k) COUNTER-LABEL COMMA-CLAUSE FIX (9fb55be89, src/js/game.js +15):
`monsterCounterLabel` uses the guarded noun when the display name carries a
comma; proof test 19/19; r244 panel fired belltoad/dustboar/rut_king. LIVE
narration. Watch: any counter line on this panel that uses a
comma-carrying display name as the noun is a REGRESSION of the fix.
Inert: (l) dmgshape-rerun-b (b766fc392/c3134ef65/9d178bd00/be918544e —
scripts + evidence only, no src/js); (m) rageholder-survey-b
(407f5aeba/feaadf80d/ff54bd5e3 — scripts + evidence only); (n) r244
evidence + run note (8bd330f22) and r244 prereg/driver clones (74cd43f58 —
scripts + evidence only); (o) ship version bumps (7d71cb971, 1cb6ce2e1 —
build.js only).
Canon: `git log 5e38f3f7b..1cb6ce2e1` on the canon docs is EMPTY (r251 had
already verified 416e81241..5e38f3f7b empty) — canon unchanged since r247.

## Leg question (carried from crisis r247, updated for the base)

**Do r247's verdicts hold on the new base — bowcraft turn-on (armed supply),
link-accept rotation, double-The narration, F8 confide gate, maps-pool — and
does the PARTYSIZE4 substrate reach the crisis band, where launches are
scarce and 1/3 r247 PS4 seeds seeded a plan?**
Threads (r247's 1–31 carried; updates noted):
1–3. DRY3 / DRY2 / R238-DRY CONFIRM (binding): 0 dry lines on the fixed
   surfaces. NEW surfaces this run: F8 confide gate, maps-pool
   compare_maps — any dry line there is the next fix item, named in the
   run note.
4. C3b SETTLED-FAVOR CONFIRM — FOURTH WILD PANEL for the r240 fix: a
   broken favor whose need is still live must NEVER be called done/square/
   settled. Spot-check every "settled" line with pantryPer from the
   per-seed JSON (pantryDaily kcal / roster — PANTRYPER instrument carried).
   Any false settlement is a REGRESSION of the r240 fix. 0 served is a
   coverage note, not a confirmation.
5. C3c CLOSED (r228). Any resume opener naming a favor that changed since
   planting is a REGRESSION of the r228 fix.
6. C3d CONFIRM (binding): a "Nothing important" recap with live business is
   a REGRESSION of the r231 fix.
7. NODEAWAY PANEL METRIC (tracked, no bar): r247 15/6/worst-5 (matched
   band); r244 15/6/worst-5; r241 11/6/worst-3; r240 19/10/worst-4.
8. FUNERAL-MEND CONFIRM (r216 F1): any over-claim line is a REGRESSION.
9. STAGE-0 SURFACING WATCH (descriptive): a second sitting with dlg:help
   never offered graduates to a fix item.
10. DEATHCLEANUP WATCH (measurable): any dead-holder winPlan entry lingering
    at census is a FINDING; planSeeds == 0 with entries present is a FINDING.
11. NONDEATHPLAN WATCH (descriptive): any winPlan entry for a removed
    villager lingering at census is a FINDING.
12. TITAN-REFUSAL CONFIRM (binding): refusal lines per titan per day ≤ 1
    (r233 fix) AND spoken "you have N" equals the gate count (unique living
    allies + committed Haven blades — F2 fix). Re-run the r243 proof test
    `scripts/test-titan-refusal-have-counts-haven-20261119.js` in the
    worktree before the panel (was 15/15 on r247's base).
13. DEFERRED-ASK WATCH (descriptive): any dlg:help 'already handled' about a
    settled favor while a live need waits is a REGRESSION of the r231 fix.
14. HOMEBODYVOICE + NOTICKDEFER: descriptive-only (retired r241; vacuous
    expected).
15. TRIODROUGHT WATCH — main panel expects 0 by construction (PARTYSIZE4/
    VETREENGAGE gated OFF); the discriminating read is the PS4 side-arm.
16. REL-MOURN WATCH (descriptive): any mourning line wearing a wrong name is
    a REGRESSION of the r231 fix.
17. MUSTER-GROWTH WATCH (descriptive): dawn muster-growth lines — fire, name
    the right fire/commit?
18. HOLDERVoice WATCH (descriptive): holder-half vs companion lines per seed.
19. POCKET WATCH (descriptive): fights with ≥3 stuck turns; bar 0 (r144).
20. TRAILTALK WATCH (descriptive): verbatim repeat 3×+ in one outing is a
    REGRESSION of the r236 fix.
21. FIGHT-1 WATCH (descriptive): okSorties / cleared / multiMonsterCleared vs
    r247 (main panel analyzer table); a cleared fight-1 with vTaken >= 70 is
    the standing Q4 live-play confirmation trigger.
22. FLEEREPAIR3 / WILDAVOID: STILL UNMEASURED — no instrument exists. Do not
    judge them.
23. CRISIS REGRESSION (descriptive): raids, gorge nights, sorties, favors,
    mourning fire on ordinary seeds; villages bend or break the same way.
    r247 fresh band: 4/5 game-overs (BAND verdict — hunger wall, not a
    regression); matched band 5/5 horizon.
24. R244-FIX RE-CHECK (binding): mime variant rotation across days; Wren
    note variety. Same-variant mime 3 days running is a REGRESSION of the
    r241 mime fix; a Wren note reprinted 5×+ on one seed is a REGRESSION of
    the r241 Wren fix. Doubt-stonewall 3×+ VERBATIM in one sitting graduates
    to a fix item. Voted case re-appearing under a new number; resume-opener
    quote SPLIT across two entries — watch both.
25. WALKHOMe WATCH (descriptive): any homeward travel that strands, loops,
    or narrates an unclearable refusal is a FINDING.
26. TABLEACTIVE WATCH (descriptive): any mercy/table line is reported, not
    judged; expected vacuous.
27. DOOR-GUARD WATCH (descriptive): any door-tile fight eject is a FINDING;
    fledBad firings named by day + monster HP.
28. LINK-ACCEPT ECHO WATCH (binding): any accepted raise talk still serving
    '"All right — let's ask them."' is a REGRESSION of the r243/r148
    link-accept fix. Link-accept still untested through r247 (0 raises,
    fourth panel running) — this is the FIFTH panel; 0 served again is a
    coverage note, and the ECHO question stays open.
29. WANT-BRIDGE WATCH (binding): any want-bridge repeat inside one sitting
    before 11 bridges is a REGRESSION of the r146 pool widening.
30. SENSEEXPED LAUNCH WATCH (descriptive): launches per seed vs r247; any
    launch naming a companion whose expedition never existed is the mirror
    gap — FAIL LOUDLY.
31. AMMO-NAMING WATCH (descriptive): any field-fight 'no X' line naming the
    WRONG ammo for the weapon is a REGRESSION of the #2593 fix.
32. BOWCRAFT WATCH (new, descriptive): bows/armed counts per seed vs the
    bowcraft arms (attempts 54, bows 15 on band 107011–107018); any
    bowcraft-duty villager with no bow after a full season is a supply
    observation, not a bar.

NOT this run: the RUINROAD forced-search arm (cumulative 0/317, proven
constraint; Steve 2026-11-01 rebuke). The supply question lives with the
medicine build brief.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band **14561–14565**. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md` (repo) —
  zero hits for 14561, 14562, 14563, 14564, 14565 as seeds. Full-evidence
  grep for `14561-14565`: zero hits. Scripts grep: one false positive only
  (`scripts/sweep-r6-tribute-s6.json`: `"v3TributeKcal": 145622` — a kcal
  value, not a seed). Forbidden bands named in preregs (73641–73648,
  73671–73678; 99201–99208; 78201–78208; 99351–99358; 99401–99412): no
  intersection. Collision notes (carried): 14551–14555 r247. 14541–14545
  r244. 14531–14535 r241. 14521–14525 r240. 14511–14515 r238. 14501–14505
  r230. 14491–14495 r229. 14481–14485 r228. 14471–14475 r223. 14461–14465
  r216. 14451–14455 r208. 14441–14445 r201. 14431–14435 r192. 14421–14425
  r182/r186. 14411–14415 r181. 14401–14405 r180. Band is fresh.
  (RE-VERIFIED by r253 at 01:20Z — third check: repo-prereg grep zero;
  goal-hidden-files hits are all `pantryKcal` metric values (e.g. 14563
  kcal), not seeds; the senseexped-file hit is a longer-number substring.
  No new crisis prereg since 22:00Z.)

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14561–14565,
  sequential. PILOT FIRST (§9): seeds 14561–14563 run first; the panel
  expands to 14564–14565 only if the instrument holds (smoke green, no
  instrumentErrors, stranger counters populating). If the pilot shows 0
  alien kills on all 3 seeds, that IS a finding about the channel's rate
  (not an instrument failure) and the expansion still runs.
- Smoke first: SEED=14561 DAYS=5 into the r253 evidence dir, driver runs,
  no instrumentErrors, stranger counters present.
- Driver: r247 driver (`scripts/journey-crisis-r247-delayed-20261119.js`)
  verbatim EXCEPT r253 filenames/paths/seeds (14561–14565), ORIGINS map keys
  (Seattle/Boston/Austin/Chicago/Phoenix keyed to all five r253 seeds),
  EVID path 2026-11-19, DAYS 150, prereg path. PANTRYPER instrument
  (roster on pantryDaily) carried. Verified by diff: only renames, dates,
  seed/ORIGINS changes, the prereg path differ.
- Analyzer: r247 analyzer (`scripts/analyze-crisis-r247-delayed-20261119.js`)
  verbatim EXCEPT r253 filenames/paths. Validate on r247's per-seed JSONs
  before the panel: carried numbers reproduce (panel table + NODEAWAY).
- EVID (goal hidden_files): `evidence/2026-11-19/` for per-seed JSONs +
  transcripts; repo `evidence/2026-11-19/` holds the prereg, run note, and
  gate log (committed).

## Side-arm PS4 — PARTYSIZE4 reach on the crisis band (descriptive, not §15)

- Same driver, same 3 pilot seeds (14561–14563), env
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1`. Separate EVID subdir
  `evidence/2026-11-19/ps4/` (same filenames, no overwrite). Analyzer runs
  on that dir.
- Question: does any trio/quad fire on the crisis band with the substrate
  on? r247's PS4 arm: trios 0/2/0, quads 0/2/0 (reach on 1 of 3 seeds);
  r244's: trios 2/3, quads 1/3, deltaBad 2 on 14543. 0/3 here is a reach
  finding about the launch drought, not a lever failure. NOT a §15
  comparison (no frozen bars, n=3) — descriptive only, never lever
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
- C3b SETTLED-FAVOR CONFIRM — FOURTH WILD PANEL (binding): every "settled"
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
  gorge nights and sortie shape vs r247.
- NODEAWAY PANEL METRIC (tracked, no bar): totals vs r247's matched 15/6/
  worst-5.
- STAGE-0 SURFACING WATCH (descriptive): stage-0 ask_favor wants with a live
  need that sit a full sitting with dlg:help never offered; a second sitting
  graduates to a fix item.
- DEATHCLEANUP / NONDEATHPLAN WATCH: see threads 10–11.
- TITAN-REFUSAL CONFIRM (binding): ≤1 refusal line per titan per day AND
  spoken "you have N" equals the gate count. Zero lines with zero 'refused'
  outcomes is vacuous-explained. (Strict per-line check still wants muster
  composition persisted at outcome time — driver instrument, future run.)
- DEFERRED-ASK WATCH (descriptive): see thread 13.
- HOMEBODYVOICE / NOTICKDEFER (descriptive-only, retired).
- TRIODROUGHT WATCH (main panel: 0 expected by construction; PS4 arm: the
  discriminating read).
- REL-MOURN / MUSTER-GROWTH / HOLDERVoice / POCKET / TRAILTALK / WALKHOMe /
  TABLEACTIVE / DOOR-GUARD / LINK-ACCEPT ECHO / WANT-BRIDGE / SENSEEXPED /
  AMMO-NAMING / BOWCRAFT watches: see threads 16–21, 24–32.
- Interesting finding (panel triggers): any medicine acquisition on the main
  panel (S3 > 0 — would mean the supply moved with no lever landed;
  investigate); a cleared fight-1 with vTaken >= 70 (Q4 live-play
  confirmation, standing); any dry-replacement on a NEW surface; any
  resume-opener stale want label; any funeral-mend line that mends silently
  or over-claims; any "Nothing important" recap with a live favor on the
  table; any dry line on a DRY2-, DRY3-, or R238-fixed surface; reproduction
  of any r247 blemish at its graduation bar; any dead-holder winPlan entry at
  census; any titan refusal repeat on the same titan-day; any spoken titan
  count disagreeing with the gate count; any fight narrated as stuck /
  unreachable, or any sortie fight breaking with the party unable to reach
  the monster; any trail-talk line repeated 3×+ in one outing; any trio/quad
  on the PS4 arm; any homeward travel strand; any door-tile fight eject; any
  link-accept parrot line; any want-bridge repeat before 11 bridges; any
  launch naming a companion with no expedition; any field-fight 'no X' line
  naming the wrong ammo; any F8 confide line firing with no secret; any
  surviving "The The" scream (r249 fix regression); any bowcraft-duty
  villager with no bow after a full season (descriptive).

## Telemetry

- Metrics: defendedFights, playerFights, latelyDefenseCount vs baseline
  `telemetry-baselines/crisis.json`. LOUD lines are same-run investigation
  items before any baseline roll; baseline NOT rolled on a single panel's
  variance. The units question (r240 metric review 3, r241 metric review 8,
  r244 metric review 4, r247 metric review 4) stays open: report per-seed
  values + the 5-seed sum and judge the per-seed range against the implied
  historical per-seed range.

## Metric review section (carried open items for the resuming run)

1. PANTRYPER verified populated on r247 (roster on every pantryDaily row);
   C3b adjudicated with exact figures (4,931 vs 1,857 kcal/person).
2. Titan F2 item CLOSES on r247 (spoken "you have 0" honest on all 8 gate
   lines + proof 15/15); the strict per-line spoken-vs-gate equality check
   still wants muster composition persisted at outcome time (driver
   instrument, future run).
3. PS4 deltaBad anomaly did NOT recur on r247 — closes as non-recurring.
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
11. Link-accept still untested through r247 (0 raises, fourth panel running)
    — this run is the fifth panel; ECHO stays open.
12. The rotation file read 6 at r253's start; this run plays crisis (6)
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
15. COUNTER-LABEL WATCH (new for r253): the comma-clause fix (9fb55be89)
    is the only live behavior change since r251's base. Any counter line
    using a comma-carrying display name as the noun is a REGRESSION of
    that fix; the r244 panel's fired set (belltoad/dustboar/rut_king) is
    the reference.
