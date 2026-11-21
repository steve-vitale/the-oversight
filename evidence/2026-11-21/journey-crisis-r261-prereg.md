# Journey crisis r261 — PREREGISTRATION (Lane B, leg 6)

**Status: FROZEN. This run (`playtest-loop-2-20261121T0155Z`, scheduled Fri
2026-11-20 20:00 CST / Sat 2026-11-21 02:00Z) plays crisis (6) on seeds
14581–14585 per this prereg. Base master `3235672ad`. Rotation-b read 6 at
run start; this run writes 7 at closeout. The r257 panel (seeds 14571–14575,
base `057bfa60f`) went GO with the march-refusal + antler-thrash fixes
holding in the wild; this run is the confirm panel for the r261 dodge-article
fix (below) plus a re-confirmation of r253/r257's verdicts on the new base.**

## Run-state handoff (r261, written at run start)

- Lock: NO `playtest-loop-2.lock` existed at run start. Own lock created
  01:56:17Z, run_id `playtest-loop-2-20261121T0155Z`; deleted at closeout
  with run_id verified in the same call.
- Pre-flight: main tree clean at 01:55Z (`git status --short` empty).
  Disk 49%. `git pull --ff-only`: already up to date (tip `af2320278`).
  `worktree-reap.sh`: SKIP, registry lock held by another reaper run
  (consecutive skips: 1) — no cleanup this run, nothing removed.
- Registration saga (recorded, not hidden): `bash
  scripts/worktree-register.sh journey2-crisis` took ~9 min, blocked on
  the registry flock behind a sibling `r260-gate` registration (its `git
  worktree add` checkout of 106k files) plus a heartbeat and a release.
  The script's branch-exists fallback attached the worktree to the
  LEFTOVER `journey2-crisis` branch, which pointed at `87994afe3` (Lane
  A's r247 tip — the r257 adoption never deleted the branch). Master moved
  DURING registration: Lane A's r247 adoption merged `87994afe3`, then
  sim-lendpool-a landed (`3235672ad`). The worktree was fast-forwarded
  onto master `3235672ad` in its own call (`git merge --ff-only master`),
  verified clean + at tip. No Lane A commit is carried by this branch
  beyond what master already holds. Heartbeat immediately after; a 5-min
  hbloop runs detached (`setsid nohup`, pid 21935).
- Canon read: CANON.md + DISEASES.md read in full by r247/r251/r253;
  `git log 057bfa60f..3235672ad` on CANON.md, DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
  DIRECTIVES.md is EMPTY — r247's canon read stands unchanged.

## Base movement since r257's panel base (057bfa60f -> 3235672ad) — classified

63 commits. Canon unchanged (see above).

LIVE (behavior changes under the default panel):
(a) **WARN-HEED (`a11df1fac`, landing r150, convo-dialogue.js +36)** — the
    first heed of a warn_you want speaks the warning [needs-eyes]. LIVE
    dialogue. Watch: a warn_you heed that stays silent is a FINDING
    (thread 41).
(b) **SETTLED-HELP NAMES THE FAVOR (`b6a551691`, scale r247,
    convo-dialogue.js +17)** — LIVE dialogue [needs-eyes]. Watch C3b:
    a settled-help line must name the favor it settles (thread 42).
(c) **SELF-WITNESS FIX IN AMBUSH PATH (`ef5e65cb1`, succession r258,
    betrayal.js +7)** — LIVE. Watch REL-MOURN: a witness line in the
    ambush path must name a speaker who saw the fall (thread 43).
(d) **DODGE/CLOSE NO-PATH FIXES + GOAL-BRIDGE POOL (`0d38a74d1`,
    landing r149, convo-beats.js +15)** — LIVE [needs-eyes]. Watch: a
    dodge/close no-path line is a REGRESSION of the r149 fix (thread 44).
(e) **THIS RUN'S OWN FIX — DODGE ARTICLE (`game.js:44729`, proof
    `scripts/test-dodge-the-the-20261121.js` 7/7)** — the DODGED style
    line composed "dodged the the attack!" (r257 panel seed 14575 d44):
    `encAttackName` returns 'the attack' (article included) while the
    pattern is unlearned, and the line prepended "the " blindly. Fixed
    via `articlePhrase` (the r249/r253 class fix); the only blind-prepend
    site among the encAttackName call sites (grep verified). The panel
    runs WITH this fix on the branch — a confirm panel, same pattern as
    r253's fixes under r257's panel. Watch: 0 "dodged the the" lines
    (thread 40, binding). Proof RED 3 failed (A "dodged the the attack!",
    B "dodged the Trample!") → GREEN 7/7 after the fix.
(f) **R253 PROOFS RE-RUN on this base before the panel:** titan-refusal
    15/15, march-refusal 7/7, antler-thrash 7/7 — all GREEN.

ENV-GATED (inert under the default panel — read the gate in code, not the
commit message, per r257 metric review 16):
(g) **LEND / GUNRATE / CELLGATE (`13a0c5ed2`, sim-lendfix-a)** — contest
    prize redirect + searcaster bundle + searcaster hold-fire, all
    `process.env.* === '1'` gated (contests.js, fieldFights.js, game.js
    +303). OFF by default. Any lend/gunrate/cellgate line on the default
    panel is an env-gate failure, FAIL LOUDLY (thread 45).
(h) **BOWKNOW** stays env-gated OFF (r257 correction stands). Any bowknow
    teach line on the default panel is an env-gate failure, FAIL LOUDLY.
(i) **AMMO lever reverted (`8ca5da828`), EVADE lever reverted
    (`85115230d`), RAIDDEF lever reverted (`4d370200b`)** — instruments
    only; nothing live.
Inert: all sim-* diagnostics + evidence-only commits, round records, ship
version bumps (build.js only), journey r246/r247/r258/r259/r260 evidence +
run notes + gate logs. r260 social carries NO src change (the M4 strip is
analyzer-side, in the shared helpers — not a game change). No
medicine-lever commits: the levers from the 2026-11-13 medicine brief have
NOT landed (Steve ruled 2026-11-14 the trio needs more complexity).
RUINROAD stays parked (cumulative 1/320, proven constraint).

## Leg question (carried from crisis r257, updated for the base)

**Do r253/r257's verdicts hold on the new base — march-refusal dedup,
antler articlePhrase, growth-line cooled call, gossip-ask dry fix, TRAIL
3-press, want-menu wind-down, witness-mourn — does the r261 dodge-article
fix hold in the wild, do the new live dialogue changes (warn-heed,
settled-help naming, self-witness ambush, dodge/close no-path) read
honestly, and does the PARTYSIZE4 substrate reach the crisis band, where
r257's PS4 arm seeded trios/quad patterns on 14571–14573?**
Threads (r257's 1–39 carried; updates noted; new 40–45):
1–3. DRY3 / DRY2 / R238-DRY CONFIRM (binding): 0 dry lines on the fixed
   surfaces. NEW surface this run: warn-heed (r150 fix) — any dry line
   there is a REGRESSION of the r150 fix. F8 confide gate, maps-pool
   compare_maps — any dry line there is the next fix item, named in the
   run note.
4. C3b SETTLED-FAVOR CONFIRM — SIXTH WILD PANEL for the r240 fix: a
   broken favor whose need is still live must NEVER be called done/square/
   settled. Instrument FIXED this run (r257 metric review 2): the analyzer
   now greps the DRIVEN transcripts (R261 C3b-TRANSCRIPT section) instead
   of sayLines. Spot-check every reported hit with pantryPer from the
   per-seed JSON. Any false settlement is a REGRESSION of the r240 fix.
   0 served is a coverage note, not a confirmation.
5. C3c CLOSED (r228). Any resume opener naming a favor that changed since
   planting is a REGRESSION of the r228 fix.
6. C3d CONFIRM (binding): a "Nothing important" recap with live business
   is a REGRESSION of the r231 fix.
7. NODEAWAY PANEL METRIC (tracked, no bar): r257 13 total, worst 7;
   r253 15/6/worst-5 (matched band); r247 15/6/worst-5; r244 15/6/worst-5;
   r241 11/6/worst-3; r240 19/10/worst-4.
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
    living allies + committed Haven blades — F2 fix). Proof re-run on
    this base: 15/15 GREEN (see above).
13. DEFERRED-ASK WATCH (descriptive): any dlg:help 'already handled'
    about a settled favor while a live need waits is a REGRESSION of the
    r231 fix.
14. HOMEBODYVOICE + NOTICKDEFER: descriptive-only (retired r241; vacuous
    expected).
15. TRIODROUGHT WATCH — main panel expects 0 by construction (PARTYSIZE4/
    VETREENGAGE gated OFF); the discriminating read is the PS4 side-arm.
16. REL-MOURN WATCH (descriptive): any mourning line wearing a wrong name
    is a REGRESSION of the r231 fix. NEW: r258 self-witness fix — a
    witness line in the ambush path must name a speaker who actually saw
    the latest fresh dead fall; a witness line from a non-witness is a
    FINDING (thread 43).
17. MUSTER-GROWTH WATCH (descriptive): dawn muster-growth lines — fire,
    name the right fire/commit? r257: 0 fired (muster never grew).
18. HOLDERVoice WATCH (descriptive): holder-half vs companion lines per seed.
19. POCKET WATCH (descriptive): fights with ≥3 stuck turns; bar 0 (r144).
20. TRAILTALK WATCH (descriptive): see thread 36 (3-press fix live).
21. FIGHT-1 WATCH (descriptive): okSorties / cleared / multiMonsterCleared
    vs r257 (main panel analyzer table); a cleared fight-1 with vTaken
    >= 70 is the standing Q4 live-play confirmation trigger (r257 max
    52, not fired).
22. FLEEREPAIR3 / WILDAVOID: STILL UNMEASURED — no instrument exists. Do
    not judge them.
23. CRISIS REGRESSION (descriptive): raids, gorge nights, sorties, favors,
    mourning fire on ordinary seeds; villages bend or break the same way.
    r257 fresh band: 4/5 horizon (BAND verdict — hunger wall, not a
    regression); r253: 2/5 horizon, 3/5 game-overs in the 130s–140s.
24. R244-FIX RE-CHECK (binding): mime variant rotation across days; Wren
    note variety. Same-variant mime 3 days running is a REGRESSION of the
    r241 mime fix. **Wren-note bar REVISED per r257 metric review 1:**
    the old "5x+ reprints of the same note on one seed" bar fires on the
    r253 GO panel (up to 11x) and r257 (up to 14x) — the pool fires daily
    and 3 variants over 150 days repeat by construction. The revised bar:
    the SAME variant on CONSECUTIVE days, or the same variant TWICE in
    one day, is a REGRESSION of the r241 Wren fix; panel totals are
    descriptive only. Doubt-stonewall 3x+ VERBATIM in one sitting
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
    link-accept fix. Instrument FIXED this run (r257 metric review 3):
    the analyzer now greps the DRIVEN transcripts (R261
    LINK-ACCEPT-TRANSCRIPT section) — validated on r257's corpus, where
    it finds exactly the two voiced accepts (Sal 14573 d32 Stonebridge,
    Shannon 14575 d10 Thornfield), 0 parrot lines. This is the SEVENTH
    panel; 0 served again is a coverage note, and the ECHO question stays
    open.
29. WANT-BRIDGE WATCH (binding): any want-bridge repeat inside one sitting
    before 11 bridges is a REGRESSION of the r146 pool widening.
30. SENSEEXPED LAUNCH WATCH (descriptive): launches per seed vs r257; any
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
33. MARCH-REFUSAL CONFIRM (binding): the Commercial Break march gate says
    its refusal line at most ONCE per muster-day (r253 fix). Count refusal
    lines per muster-day in the panel transcripts; >1 on any day is a
    REGRESSION of the r253 fix. The refusal itself still stands on every
    attempt (return null) — a refused attempt with no line on a fresh day
    is also a FINDING. Proof re-run on this base: 7/7 GREEN.
34. ANTLER "THE THE" CONFIRM (binding): any antler-thrash line reading
    "The The <name>" is a REGRESSION of the r249/r253 fix. Proof re-run
    on this base: 7/7 GREEN. The R261 DODGE-ARTICLE analyzer section
    covers both the antler and the dodge line.
35. GROWTH-LINE WATCH (descriptive): dawn growth lines under the r245
    cooled call — the line must name the act actually taken, not a cooled
    one. A growth line naming a cooled act is a REGRESSION of the r245
    fix.
36. TRAIL 3-PRESS CONFIRM (binding): any verbatim trail-talk repeat 3x+
    in one outing is a REGRESSION of the r256 TRAIL 3-press fix.
37. WANT-MENU WIND-DOWN WATCH (descriptive): want-menu react lines under
    the r246 wind-down fix — a react line firing after its want wound down
    is a FINDING.
38. WAR-PATH NAME WATCH (descriptive — open defect from endgame r255):
    full-seat war-path lines naming nonexistent monsters ("The Big Thing",
    "Big-Bane", "Big Ugly") instead of actual kills. Any such line on this
    panel is the same defect class, named in the run note for the next fix
    round.
39. COUNTER-LABEL WATCH (descriptive, carried from r253 review 15): any
    counter line using a comma-carrying display name as the noun is a
    REGRESSION of the 9fb55be89 fix; the r244 panel's fired set
    (belltoad/dustboar/rut_king) is the reference.
40. DODGE-ARTICLE CONFIRM (binding, NEW): any dodge style line reading
    "dodged the the <attack>!" is a REGRESSION of the r261 fix. The R261
    DODGE-ARTICLE analyzer section scans all sayLines; validated on
    r257's corpus, where it finds exactly the 1 panel defect (14575 d44,
    9 dodge lines served). 0 dodge lines served is vacuous-explained.
41. WARN-HEED WATCH (descriptive, NEW): first heed of a warn_you want
    speaks the warning (r150 live). A heed that stays silent is a FINDING.
42. SETTLED-HELP WATCH (descriptive, NEW): settled-help lines name the
    favor they settle (r247 live). A settled-help line naming no favor,
    or the wrong favor, is a FINDING.
43. SELF-WITNESS WATCH (descriptive, NEW): see thread 16.
44. DODGE/CLOSE NO-PATH WATCH (descriptive, NEW): dodge/close no-path
    lines under the r149 fix — any such line is a REGRESSION of the r149
    fix. Goal-bridge pool lines reported, not judged.
45. ENV-GATE WATCH (binding, NEW): any LEND/GUNRATE/CELLGATE/BOWKNOW line
    on the default panel is an env-gate failure, FAIL LOUDLY.

NOT this run: the RUINROAD forced-search arm (cumulative 1/320, proven
constraint; Steve 2026-11-01 rebuke). The supply question lives with the
medicine build brief. M4-SPLIT is a social-leg instrument (r260 GO at the
bar, 12); the crisis analyzer does not report M4 counts, so it is not
judged here.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band **14581–14585**. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo) plus goal hidden_files `evidence/2026-11-*/` `*.md` — the only
  hit for 14581 is a commit-hash fragment (`b14582845` in the r178
  endgame prereg, not a seed). Full `evidence/` grep for
  `14581–14585` / `14581-14585`: zero hits. Forbidden bands named in
  preregs (73641–73648, 73671–73678; 99201–99208; 78201–78208;
  99351–99358; 99401–99412): no intersection. Collision notes (carried):
  14571–14575 r257. 14561–14565 r253. 14551–14555 r247. 14541–14445 r244.
  14531–14535 r241. 14521–14525 r240. 14511–14515 r238. 14501–14505 r230.
  14491–14495 r229. 14481–14485 r228. 14471–14475 r223. 14461–14465 r216.
  14451–14455 r208. 14441–14445 r201. 14431–14435 r192. 14421–14425
  r182/r186. 14411–14415 r181. 14401–14405 r180. Band is fresh.
  (Verified by grep at run start; r257's third-check method reused.)

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14581–14585,
  sequential. PILOT FIRST (§9): seeds 14581–14583 run first; the panel
  expands to 14584–14585 only if the instrument holds (smoke green, no
  instrumentErrors, stranger counters populating). If the pilot shows 0
  alien kills on all 3 seeds, that IS a finding about the channel's rate
  (not an instrument failure) and the expansion still runs.
- Smoke first: SEED=14581 DAYS=5 into the r261 evidence dir, driver runs,
  no instrumentErrors, stranger counters present.
- Driver: r257 driver (`scripts/journey-crisis-r257-delayed-20261120.js`)
  verbatim EXCEPT r261 filenames/paths/seeds (14581–14585), ORIGINS map
  keys (Seattle/Boston/Austin/Chicago/Phoenix keyed to all five r261
  seeds), EVID path 2026-11-21, DAYS 150, prereg path. PANTRYPER
  instrument (roster on pantryDaily) carried. Verified by diff: only
  renames, dates, seed/ORIGINS changes, the prereg path differ.
- Analyzer: r257 analyzer (`scripts/analyze-crisis-r257-delayed-20261120.js`)
  verbatim EXCEPT r261 filenames/paths, PLUS three new sections (r257
  metric review 2–3 + the r261 fix confirm): R261 C3b-TRANSCRIPT
  (settlement lines in driven transcripts), R261 LINK-ACCEPT-TRANSCRIPT
  (link-accept voicing + parrot line), R261 DODGE-ARTICLE (doubled
  articles in dodge + antler-thrash sayLines). Validated on r257's
  per-seed JSONs (renamed copies in /tmp/r261-validate): carried numbers
  reproduce (D2 40 attempts / 35 ok / 5 refused / 4 cleared / deltaBad
  []; DRY 0; titan 0 repeats), C3b finds Wren d37's true settlement,
  LINK-ACCEPT finds exactly the two voiced accepts (Sal 14573 d32,
  Shannon 14575 d10) with 0 parrot lines, DODGE-ARTICLE finds exactly
  the 1 panel defect (14575 d44 "dodged the the attack!", 9 dodge lines
  served).
- EVID (goal hidden_files): `evidence/2026-11-21/` for per-seed JSONs +
  transcripts; repo `evidence/2026-11-21/` holds the prereg, run note,
  and gate log (committed).

## Side-arm PS4 — PARTYSIZE4 reach on the crisis band (descriptive, not §15)

- Same driver, same 3 pilot seeds (14581–14583), env
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1`. Separate EVID subdir
  `evidence/2026-11-21/ps4/` (same filenames, no overwrite). Analyzer runs
  on that dir.
- Question: does any trio/quad fire on the crisis band with the substrate
  on? r257's PS4 arm: trios/quad patterns fired on the crisis band (see
  its run note); r253's: trios 3, quads 3 on 14562 (reach on 1 of 3
  seeds); r247's: trios 0/2/0, quads 0/2/0 (reach on 1 of 3 seeds). 0/3
  here is a reach finding about the launch drought, not a lever failure.
  NOT a §15 comparison (no frozen bars, n=3) — descriptive only, never
  lever attribution. Runs AFTER the main panel (sequential processes —
  never two harnesses in one process, never parallel jest/sim under load).

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
- C3b SETTLED-FAVOR CONFIRM — SIXTH WILD PANEL (binding): every "settled"
  close line fires only on a sitting that shared a real beat with the favor
  it names, AND a broken favor whose need is still live is never called
  done/square/settled. Adjudicate each R261 C3b-TRANSCRIPT hit in the run
  note, with pantryPer read from the per-seed JSON (pantryDaily kcal /
  roster). Any false settlement is a REGRESSION of the r240 fix. 0 served
  is a coverage note.
- C3c CLOSED / C3d CONFIRM (binding): see threads 5–6.
- WRAP-CHECK GO: analyzer WRAP section reports unmarked = 0 across all
  driven transcripts.
- C7b GO: buried list reported per seed; corpse-cause counts reported for
  famine/disease/wound/thirst.
- S1–S5 SUPPLY: NOT RUN this panel (RUINROAD parked). Cumulative stays
  1/320, carried as the standing number.
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
  gorge nights and sortie shape vs r257.
- NODEAWAY PANEL METRIC (tracked, no bar): totals vs r257's 13/worst-7.
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
- DODGE-ARTICLE CONFIRM (binding): 0 "dodged the the" lines. See thread 40.
- TRAIL 3-PRESS CONFIRM (binding): 0 verbatim trail-talk repeats 3x+ in one
  outing. See thread 36.
- DEFERRED-ASK WATCH (descriptive): see thread 13.
- HOMEBODYVOICE / NOTICKDEFER (descriptive-only, retired).
- TRIODROUGHT WATCH (main panel: 0 expected by construction; PS4 arm: the
  discriminating read).
- REL-MOURN / MUSTER-GROWTH / HOLDERVoice / POCKET / TRAILTALK / WALKHOMe /
  TABLEACTIVE / DOOR-GUARD / LINK-ACCEPT ECHO / WANT-BRIDGE / SENSEEXPED /
  AMMO-NAMING / BOWCRAFT / GROWTH-LINE / WANT-MENU / WAR-PATH / COUNTER-LABEL
  / WARN-HEED / SETTLED-HELP / ENV-GATE watches: see threads 16–21, 24–32,
  35, 37–39, 41–45.
- Interesting finding (panel triggers): any medicine acquisition on the main
  panel (S3 > 0 — would mean the supply moved with no lever landed;
  investigate); a cleared fight-1 with vTaken >= 70 (Q4 live-play
  confirmation, standing); any dry-replacement on a NEW surface; any
  resume-opener stale want label; any funeral-mend line that mends silently
  or over-claims; any "Nothing important" recap with a live favor on the
  table; any dry line on a DRY2-, DRY3-, or R238-fixed surface; reproduction
  of any r257 blemish at its graduation bar; any dead-holder winPlan entry at
  census; any titan refusal repeat on the same titan-day; any spoken titan
  count disagreeing with the gate count; any march refusal line repeated on
  the same muster-day; any "The The" antler-thrash line; any "dodged the
  the" dodge line; any verbatim trail-talk repeat 3x+ in one outing; any
  fight narrated as stuck / unreachable, or any sortie fight breaking with
  the party unable to reach the monster; any trio/quad on the PS4 arm; any
  homeward travel strand; any door-tile fight eject; any link-accept parrot
  line; any want-bridge repeat before 11 bridges; any launch naming a
  companion with no expedition; any field-fight 'no X' line naming the wrong
  ammo; any F8 confide line firing with no secret; any surviving "The The"
  scream (r249/r253 fix regression); any bowcraft-duty villager with no bow
  after a full season (descriptive); any bowknow teach line on the default
  panel (env-gate failure); any LEND/GUNRATE/CELLGATE line on the default
  panel (env-gate failure); any growth line naming a cooled act; any
  war-path line naming a nonexistent monster; any warn_you heed that stays
  silent; any settled-help line naming no favor or the wrong favor.

## Telemetry

- Metrics: defendedFights, playerFights, latelyDefenseCount vs baseline
  `telemetry-baselines/crisis.json`. LOUD lines are same-run investigation
  items before any baseline roll; baseline NOT rolled on a single panel's
  variance. The units question (r240 metric review 3, r241 metric review 8,
  r244 metric review 4, r247 metric review 4, r253 metric review) stays
  open: report per-seed values + the 5-seed sum and judge the per-seed range
  against the implied historical per-seed range.

## Metric review section (carried open items for the resuming run)

1. Wren-note bar REVISED this run (see thread 24): consecutive-day repeats
   of the same variant, or same-day duplicates — panel totals descriptive
   only. The r257 proposal is adopted by this prereg.
2. C3b instrument FIXED this run: analyzer R261 C3b-TRANSCRIPT greps the
   driven transcripts; validated on r257's corpus (finds Wren d37). The
   sayLines-only check is retired for C3b. Same correction applies to the
   confide check, which also returned 0 in sayLines while confide-thread
   recalls fire in the transcripts — NOT fixed this run (carried).
3. Link-accept ECHO instrument FIXED this run: analyzer R261
   LINK-ACCEPT-TRANSCRIPT greps the driven transcripts; validated on
   r257's corpus (finds exactly the two voiced accepts, 0 parrot lines).
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
11. Census corpses omit scholar deaths (r257 metric review 5) — any verdict
    that counts deaths from the census alone undercounts scholar deaths.
12. Muster-growth watch (r257 metric review 6): 0 dawn muster-growth lines
    fired on r257 — the muster never grew. The watch stays descriptive
    until a panel grows a muster.
13. The rotation file read 6 at r261's start; this run plays crisis (6)
    and writes 7 at closeout, with a read-back.
14. worktree-register.sh's branch-exists fallback ATTACHES to a stale
    same-slug branch without checking its base (r261: the leftover
    journey2-crisis branch pointed at Lane A's r247 tip; the worktree was
    ff-merged onto master after the fact). The script owner should verify
    the attached branch's base is current master, or fail loud. (r257's
    prereg item 13, about the earlier fail-loud behavior, is superseded
    by this observation.)
15. COUNTER-LABEL WATCH (carried from r253): the comma-clause fix
    (9fb55be89) — any counter line using a comma-carrying display name as
    the noun is a REGRESSION of that fix; the r244 panel's fired set
    (belltoad/dustboar/rut_king) is the reference.
16. War-path monster names (open defect, endgame r255): full-seat lines
    name nonexistent monsters ("The Big Thing", "Big-Bane", "Big Ugly").
    Next fix round's item; this run watches for the same class (thread 38).
17. M4-SPLIT metric review (social leg, carried): r260 GO at the bar (12).
    Owed on the next SOCIAL run, not judged here — the crisis analyzer
    carries no M4 instrument.
