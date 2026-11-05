# journey-landing r104 — run note (lane A, leg 0 LANDING)

**Run id:** laneA-20261105T082647Z (scheduled 01:45 CST 2026-11-05). Base
master@5a1d280a0 at branch creation; worktree `journey-landing`. Rotation read 0
→ leg 0 LANDING; 0→1 written at run start and verified by read-back.
Prereg: evidence/2026-11-05/journey-landing-r104-prereg.md (recorded in goal
hidden_files BEFORE any seed ran, then committed verbatim-plus-addendum
431376e9a BEFORE the pilot seed — the safe-commit index clobber struck on
that commit, same class as r90/r94/r95/r97/r98/r99: commit correct, index lied
with the files staged-as-deleted + untracked; repaired via HEAD-blob
cacheinfo, verified `git status` clean + `git diff HEAD` empty).
Panel outputs: goal hidden_files evidence/2026-11-05/landing-r104/ (panel
censuses/system/transcripts + analysis + pilot/panel logs + checkquick log).
Driver: scripts/journey-landing-r104-20261105.js (r100 driver verbatim +
R104 WINPLAN instrument + R104-GOAROUND rescue rungs + R104-PROBE gate;
fresh seeds 867–876, DAYS=28; diff-verified against the r100 driver at run
start: only header, seeds, OUTDIR, and the R104 blocks differ — zero policy
change except the go-around rungs, which are the fix below).
Analyzer: scripts/analyze-landing-r104-20261105.js (r94 analyzer verbatim +
R104 WINPLAN block). Fights: scripts/analyze-fights89-20261102.js
(unchanged, dir-as-argv). Shape test: scripts/test-landing-r94-shape.js.
Proof test: scripts/test-landing-r104-rescue-goaround.js (new).
Next driver prepared here: scripts/journey-landing-r105-20261105.js (r104
verbatim + seeds 877–886, OUTDIR landing-r105; diff-verified, node --check
clean).

## Infrastructure notes (loud, first)
- **Registration was SLOW, not flap-blocked.** `worktree-register.sh`
  attempt 1 hung inside `git worktree add` — the checkout's `git reset
  --hard` ran ~5 min at high CPU under a loaded box (siblings: two reaper
  flock-waits, main-session sim-bankadded-a release, Lane B
  journey2-social tests). Not the EPERM flap: plain writes worked
  throughout (lock file + rotation write landed fine), and the register
  succeeded on attempt 1 with no retry. No main-tree file was edited,
  committed, or written by this run.
- **Heartbeat held:** registration beat 08:28:33Z, heartbeat loop (10-min
  interval, logged to goal hidden_files
  journey-landing-r104-heartbeat.log, pid verified) landed 08:36:33Z and
  every beat since. The loop is killed at closeout (see Closeout note).
- **LOCK-READ-BEFORE-DELETE (new AGENTS.md rule, 2026-11-05):** the lock
  is read and its run_id confirmed before deletion at closeout — this
  run's lock is laneA-20261105T082647Z; a live 0815Z sibling loop holds
  its own lock and the pantrymealword-a / bankadded-a arms, which this
  run never touched.
- **EPERM flap:** NOT present this run (writes + git + registry all
  worked; the morning flare 00:36–01:48 CST had cleared ~07:48 UTC,
  before this run started).

## Panel verdicts (as run)

- **Q1 WINPLAN UPTAKE: GOAL-LIVE at d14.** The win-plan system bites in
  the first fortnight on half the panel: planSeeds>0 on 5/10 seeds at d14
  (13 total, 1.3/seed — above the preregistered ≥1/seed bar), 8/10 by d28
  (22 total). Holders 16 at d14, 28 at d28. The party machinery works
  in-window: invites 8, departures 8, waits 22, partyFights 21 by d14
  (24 / 23 / 41 / 72 by d28). Per-seed d14: 867: 2 seeds, 3 holders
  (hunt×3); 868: 1 seed, 1 holder (party); 870: 1 seed, 2 holders
  (hunt×2); 873: 4 seeds, 4 holders (hunt×4); 874: 5 seeds, 6 holders
  (hunt×3, party×3); 869/871/872/875/876: 0 at d14 (871, 872 stay 0 at
  d28 too — uptake is uneven, not universal). BUT the silent arms: 
  gearHolds 0, bondTends 0, avoidances 0, seekContacts 0,
  standingContacts 0, veteranGuardHolds 0, musterStanddowns 0,
  trickHolds 0 — across ALL 10 seeds at d28. In the landing window the
  win-plan system is party/hunt-only: plans advance gear→party→hunt so
  fast no gear-stage holder is ever observed, and the gear-check,
  bond-tending, avoidance, and standing-contact arms never fire. Named
  next blank: why the gear/bond arms stay silent while party/hunt runs
  (and whether the 2 never-seeding seeds differ in any readable way).
  Instrument caveat (reading, not a defect): holders can exceed
  planSeeds (867: 3 holders / 2 seeds) because `winPlanOf` creates a
  plan without bumping planSeeds, and such plans carry sinceDay 0 — the
  fresh-plan default, not a real day. The instrument reads only the raw
  `state.village.winPlan` map and the stats copy, never the accessor.
- **Q2 DOORSTEP-OUTINGLIVE REGRESSION: GO.** 281 checks, 1 triggered
  (874 d13: kcal 1023→2400, enter true), 0 refusals, 1 outing-live skip
  (on a fed scholar). The r99 branch fires a third time at panel scale.
  M6 clauses hold.
- **Q3 WATER CLAUSE: UNTESTED again** (16th run). 21 wild outing
  iterations, min hydration 72, 0 under 25, 0 wild water skips. R84
  water arrivals 0, R85 water rescue 0.
- **M1 ALIVE-D14: 10/10 PASS** (overAt None on all ten seeds; day-14
  pops 10–12 where recorded; no village lost).
- **M2 SYSTEM CONTACT: 10/10 PASS** (first contact day 8 on eight
  seeds, day 9 on two).
- **M3 FIGHT-LOG: PASS** — panel 35 hunt fights, 35/35 complete, 4
  fatal, 0 unknown/mixed trigger. The fatals are clean losses. Three
  ZERO-DMG shape notes (not verdict items): 874 d13 others-killed
  (scholar struck 0 blows, allies killed), 875 d14 others-killed,
  876 d21 no-strikes routed (0 strikes, allies dealt 219) — the
  wild-ally shape, recorded here.
- **M5 PEOPLE: PASS.** Wind-down more 9 picks, 0 empty; WD probe GATE-A
  GO, GATE-B GO; betrayal held-offers 0; party invites 8 offered / 8
  spoken / 0 dry / 2 accepted; case labeling 12/12. Two full transcripts
  read (867 day 10 Lucas, 868 day 7 Felipe) — both contentful, no
  fabricated shared history (see People check).
- **M7 GUARD v3: kcal PARTIAL, water UNTESTED.** Kcal skips 9 →
  arrivals 9, rescue ladder complete 9/9, eat-on-arrival 3/3 ate
  (R88 EAT-GO). But only 3 of 9 arrived: the other 6 are ONE seed's
  stall (870 d12–d17, the creek pocket — see Blank below). The guard
  fires, the ladder runs, the scholar does not arrive. Water: 0 wild
  water skips, min hyd 72 — UNTESTED as ever.

## Village assessment (plain words)
Ten villages, all alive at day 28 (pop 6–11, down from 12). The first
fortnight is harsh but survivable: 873 lost 8 people by day 28 (pop 6),
869 lost 5 (pop 7), the rest 1–4. Deaths are monsters, sickness, wounds
and ambushes — the landing's usual toll, not starvation (0 starvation
deaths on the panel). Pantries collapse on half the panel by the horizon
(5/10 seeds HUNGRY at d28, the recurring r60 pattern — lever-work
candidate, not new). The System shows up on day 8–9 everywhere and the
villages answer it. Monster meat moves: the flesh channel opens on 8/10
seeds (tests 10/10, pantry exits 6/10) — villagers haul, taste, and
cook what they kill. Outings work: joint foraging completes and keeps
(OUTING-GO, 7 departs / 6 returns / 14 talks / 2 kept). Armor is worn
(9/10 seeds have bark wearers) but the armor tele-vs-lines counts still
disagree (R69 INSTRUMENT-DISAGREE, carried — investigate before
trusting either count). Windows stay narrow: 11 promised favors, all 11
NARROW (zero slack), 2 kept inside narrow (R73 NARROW-PATTERN, design
input, carried).

## People check (SENSE-TESTING LAW — two full transcripts read)
- **867 day 10, Lucas (ask_favor, stage 2→3, promised):** Lucas wants a
  pantry run; the player commits; Lucas answers with a concrete
  instruction ("Where the muscadine grapes grows thick, before the dew
  dries. Bring the big pack if you have it") and the favor is promised
  ("forage with Lucas tomorrow to rebuild the pantry"). The beast-naming
  thread runs through the village (seven proposed names across
  villagers). The NPC wants something, the options engage it, the ending
  resolves into a promised outing. Real.
- **868 day 7, Felipe (curious, stage 1→3, engaged):** Felipe lost track
  of the days and asks whether anyone still counts them; the player
  answers "I count. Someone has to."; Felipe: "Good. Keep counting. The
  days need witnesses." Pressed further he grows careful ("A small chill
  settles between you. They're choosing words more carefully."). Ends
  with a goodbye, want engaged. Real — a small, human exchange about
  time passing, not a menu.

## BLANK FILLED — the creek pocket (seed 870) + R104-GOAROUND fix
**The blank:** seed 870's scholar Mateo sat 3 tiles from a full pantry
for 6 days (d12–d17) at 0 kcal (hydration 0 on d17) because the return
path crossed a creek band the rescue ladder could not clear. The ladder
ran daily and failed identically each day: `walkHome:
interrupted:blocked:blocked:creek | clear:creek@1,3:refused`. Mateo
never got home; he foraged back to ~1000 kcal by d20 in the wild, then
died of sickness d22 in the wild (the stall precedes the death; the game
records no causal chain, so this is correlation, not a proven cause).
The mantle passed d23 to Seamus.
**The mechanism (probed, RESCUE_PROBE=1 replay):** Mateo stood at
(1,4), home (4,4). Every exit east/north/south is creek — (2,4) creek
+ rubble, (1,3) creek/needsBridge, (1,5) creek, (2,3) and (2,5) creek —
and he held 0 wood on all 6 days. The game behaves as designed at
every step: clearBlockage refuses creeks honestly ("Bridge it (4 wood)
or swim it"), the swimmer ability would pass (Mateo lacks it), and
walkHome only steps homeward or perpendicular, never away — so it stops
honestly. The gap is the LADDER, not the game: the walk-home narration
prescribes "Clear it, bridge it, or go around", but the ladder only ever
tried clear + walk. It never tried bridge (with wood) or go-around.
**The fix (driver-only, zero src/js):** guardRescue gains two rungs —
(a) bridge: a creek block with >=4 wood gets Game.buildBridge, then
retry the walk; (b) detour: BFS over orthogonal enterable tiles
(travelBlockage as oracle, home board 0..8 only), walked one tile at a
time through travelTo, with honest stops on refusal/combat/death. If no
on-board path exists the rung records `detour:no-onboard-path` and the
scholar stays.
**Proof (before/after, seed 870):** BEFORE (panel corpus): 7 arrivals,
6 non-arrived (d12–d17), Mateo died d22, mantle d23. AFTER (fixed
replay): 2 arrivals, 0 non-arrived; d12 rescue
`... | clear:creek@1,3:refused | bridge:skipped:wood=0 |
detour:walked:11` — the BFS found an 11-step detour around the band
and walked it; d13 snapshot haven, kcal 1759; no Mateo death, no mantle
pass, playerDeaths 0. Proof test
scripts/test-landing-r104-rescue-goaround.js: FAIL 6/7 checks on the
before corpus, PASS 7/7 on the after corpus.
**Scope note:** a real player CAN escape the pocket by walking west
first — the game offers that; the driver didn't. Whether Game.walkHome
itself (the app's "Walk home" button) should route around is a separate
game-code decision for Steve, not taken here: walkHome stopping is
honest and its narration tells the player to go around first.

## Reachable / fun / winnable
- **Reachable:** yes — all content in the leg fired (System contact
  10/10, contests 18 fired / 17 ended, flesh channel opens, outings
  complete, win-plans seed in the first fortnight).
- **Fun:** yes — conversations read like people talking (Lucas's pantry
  run, Felipe counting days), the beast-naming thread is alive across
  villages, and the villages feel busy rather than mechanical.
- **Winnable:** not yet — unchanged. The win-plan system now demonstrably
  reaches the first fortnight (party/hunt arms live), but the gear/bond
  arms are silent, uptake is uneven (2 seeds never seed), and the
  landing's job — surviving to a village that can party up geared — is
  still gated by the wave-4 kill wall upstream work is attacking.

## Metric review
- M-W1 (planSeeds ≥1/seed at d14): panel 13 across 10 seeds (1.3/seed)
  — interesting bar met, verdict GOAL-LIVE. The metric worked as
  written; no revision proposed.
- M-W2/M-W3 (stage/party/bond counts; holders): reported as counts.
  The zero arms (gearHolds, bondTends, avoidances, seekContacts,
  standingContacts) are the finding, not a metric failure — but the
  prereg did not set a bar for them, so next landing run should
  pre-register one (e.g. bondTends>0 on ≥1 seed, or gearHolds>0 on ≥1
  seed) rather than treating silence as background.
- M7-kcal as worded ("kcal PASS") did not survive the panel: the ladder
  completed 9/9 but arrived 3/9. The binding was the r99 wording; the
  honest verdict is PARTIAL with the 870 stall as the named cause, and
  the fix above closes it. Next run's M7 should judge arrived/skips,
  not ladder-complete/skips.

## Telemetry deviation check
Ran `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/landing-split.json --current
'<landing-r104 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
lines, BOTH EXPLAINED as aggregation artifacts (same class as
r94/r95/r96/r97/r98/r99), baseline NOT rolled: (1) systemDay baseline 33
→ current sum 83 over 10 files (per-seed 8–9, mean 8.3); (2)
monsterKills baseline pooled mean 24 → current sum 208 over 10 files
(per-seed mean 20.8, range 9–32). No behavior change is indicated.

## Closeout note
- Commit: prereg + instruments (431376e9a) + this note + r104 driver
  fix/proof + r105 driver + panel evidence (tooling + evidence only,
  zero src/js). The fix is driver policy, not game code — no [needs-eyes]
  flag (nothing player-facing changed; the ship loop need not fast-track).
- Quick suite: `node scripts/check.js --quick` — 284 passed, 6 failed in
  496s (landing-r104-checkquick.log). The 6 are EXACTLY r99's standing
  set (measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20-fixes); none touches this run's files (zero src/js
  changed; the new files are not on the green list).
- Telemetry: LOUD explained, baseline NOT rolled.
- Rotation 0→1 already written. Lock deleted at closeout after
  read-back of its run_id.
