# Journey crisis r216 — RUN NOTE (Lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this closeout writes 7
(succession next). Base: master abc52dce1. Lock:
playtest-loop-2.lock run_id 2026-11-15T20:55:31Z (own). Worktree slug:
journey2-crisis. Prereg: evidence/2026-11-15/journey-crisis-r216-prereg.md
(committed with this note). Panel evidence (per-seed JSONs, transcripts,
analysis): goal hidden_files/evidence/2026-11-15/journey-crisis-r216-*.
Proof tests: scripts/test-journey-crisis-r216-funeral-partial-20261115.js
(3/3, seeds 7 + 42) + scripts/test-journey-crisis-r216-analyzer-dup-20261115.js
(2/2) + test-funeral-mend-b.js regression 7/7.

## Pre-flight / infrastructure (LOUD)

- Main tree clean (0 dirty), disk 42%.
- `git pull --ff-only`: "Already up to date" (master 605d72bd4 at pull
  time; Lane A landed journey-scale r215 into master 2 min later,
  20:55:23Z — the worktree branched from the then-current HEAD
  abc52dce1, verified: 605d72bd4 is an ancestor of the worktree tip,
  worktree clean, branch journey2-crisis).
- `worktree-reap.sh`: exit 0, 13/16 active, removed nothing. LOUD
  lines, all other owners' uncommitted trees (sim-wideduty-a,
  sim-sametick-a, journey-scale-attr, sim-secondlink-a, sim-redactor-a,
  sim-saycap-a, sim-siegedialog-a, sim-inffight-ab, sim-courtship-
  rework2-b, sim-producergate-b): never auto-removing, not mine to
  touch.
- REGISTRATION QUEUE: this run's own `worktree-register.sh` took
  ~15 min (git worktree add's reset grinding under load avg ~11;
  Lane A registered journey-landing concurrently). Queue, not wedge.
  Heartbeat confirmed landed at registration (20:57:42Z); hbloop
  every 7 min (journey2-crisis-hbloop-r216.sh).
- SERVICE RESTART MID-PILOT: the runtime restarted during the pilot
  run; seed 14461's first attempt died at ~d70 with a 0-byte JSON,
  and the hbloop died with it (heartbeat 12 min stale at recovery,
  still inside the 15-min window). Recovered per the loop-closeout
  skill: heartbeat FIRST, hbloop restarted, pilot re-run from scratch
  (seed 14461's partial transcripts were overwritten by the clean
  re-run). Nothing else lost; the 0-byte JSON was the killed process,
  not a write flap (transcript files wrote fine in the same minutes).

## Panel (binding, prereg)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14461–14465,
  sequential. Pilot 14461–14463 first, expanded to 14464–14465 (the
  instrument held: smoke green, no instrumentErrors, stranger
  counters populating). Whole panel ran in ~14 min (seeds ~2 min
  each).
- Driver: r208 driver verbatim except r216 filenames/paths/seeds,
  ORIGINS map keys (all five seeds keyed — Seattle/Boston/Austin/
  Chicago/Phoenix), EVID path 2026-11-15, DAYS 150. RUINROAD env OFF
  (arm parked — cumulative 0/301 is a proven constraint; the supply
  question lives with the medicine build brief).
- Analyzer: r208 analyzer verbatim except r216 filenames/paths,
  PLUS one in-run fix (see below). Validated on r208's JSONs before
  the panel: carried numbers reproduce exactly (gorge 100, convos 38,
  fab 0, sorties 20, D1 20/20, drift unknown 0, fight-1 15/7/8,
  multiMonsterCleared 5/9, DRY-CENSUS GO, WRAP 38/38).
- Driver diff vs r208: 42 lines, renames only (seed numbers, r208->
  r216, EVID path). One mechanical-rename artifact in comments: a
  probe note now reads "seed 14461 d16" (was 14451) — comment only,
  no behavior.

## Village assessment (plain words)

Five villages, all hit hard, two held to the horizon. They died later
than r208's — d99, d129, d131 game-over (median 129d; r208's median
was 84d, r201's 109d) and two horizon seeds at d150 (14463 with 5
alive, 14465 with 1 alive and an empty pantry). Raids fired on every
seed (6–11 each, 39 total); gorge nights totaled 273 (r208: 100).
Sorties fought 20 times, 12 refused. Villages bent the way r208's
did — fought, moved on, starved, died in the wild — only later, and
two of them were still standing at the horizon. Deaths were the wild
above all, then monsters, then the arena (7 arena deaths on 4/5
seeds), then wounds that wouldn't close, thirst and starvation. Two
villagers died to their own village's pit trap again (Thabo Maseko
14462 d108, Nadia Khoury 14463 d147). The scholar died once (Simone
Konate 14464 d17, the wild) and the village carried on to d99 — the
mantle passed and the run continued. No siege-mechanic failure, no
softlock (0 softlock seeds). The medicine picture is unchanged and
stark: 0 ruin searches across the panel, 0 medicine found, 0 pharmacy
days; the healer's ability did all the curing (92 ability cures, 0
medicine cures). One village (14464) had NO medic-duty holder at
all — spans empty, blocked 0, cures 0 — the holder-less shape from
the r196 re-analysis; it died d99. No alien kills on any seed
(stranger channel VACUOUS again, eighth consecutive zero panel).

The median-death-day shift (84 -> 129) and the two horizon seeds are
DESCRIPTIVE, not a fix-effect claim: n=5 each, distributions overlap,
and no single cause dominates the shift — the wild leads both panels.
The base changes since r208 (CASCADE lingerer hold, FUNERALMEND,
r211/r214/r215/r209 dialogue fixes) are all plausible contributors
and none is isolated by this panel. Do not cite this panel as proof
any of them moved survival.

## Verdicts (against the prereg)

- D1 DRY CENSUS — GO: 37 transcripts, 0 dry lines, deflect_q 0.
  r192's five ledger-aware pool fixes hold in the wild on fresh
  seeds; the r211 sysSay/quoteWrap, r214 plain-parting, r209
  favor-block, and r215 curious-resume fixes introduced no new dry
  surface.
- Q6 — DESCRIPTIVE ONLY (retired r201): gorge-after-clear
  (id-matched) 0/5, the eighth consecutive zero panel. Reported,
  never judged. Name-matched gorge-after-clear rose to 34 (r208: 17)
  in step with gorge nights (273 vs 100) — the name-collision class,
  not clears failing.
- C1 (bend, not break) — GO: every game-over has a named cause that
  is NOT a siege-mechanic failure; 0 softlock seeds. Two horizon
  seeds this time (14463, 14465).
- C2 (episodes fire + gates hold) — GO: raids on all seeds; fought
  resolutions present; D1 snapshots 32/32, delayed >= 3 attempts
  32/32; D5 deltaBad empty; D3 drift unknown = 0.
- C2b (linger-conditional gorge/sortie) — GO: every
  boundary-firable case judged on gorge+sorties, all 5 seeds.
  Refused sorties (12) all carry a reason: gateOneShort 11,
  supplyEmpty 1. NOTE the shape change: r208's refusals were
  gateOneShort 2 / supplyEmpty 2 / availabilityDrain 1 with
  nodeAway exclusions 1; this panel's are 11/1/0 with nodeAway
  exclusions 39 — on the 6 alive-bench refusals, 7 villagers were
  out on node-travel business at once (14461 d60/d61, 14463 d61/d62).
  Villages live longer with more people traveling; the refused
  sorties are honestly gated, not broken. Descriptive, carried as a
  watch: if a later panel shows the same nodeAway wall, the
  muster-vs-travel tension is a design question, not an instrument
  artifact.
- C3 (people check) — GO: all 37 driven transcripts read in full;
  fabricHits 0; conversations meet the meaning bar. No voiceLine
  prefix stacking >= 3, no double confession, no naming-stance
  wobble sighting. Confessions land (Enzo's night-sneaking, Kennedy's
  ER-nurse truth, Shrikant's Emilia in the pods — followed up d72
  -> d89, "Still nothing on Emilia"); mourning names the dead (Raj:
  Adaeze and Opanas; Kennedy: Sari and Carl; Dante: Hermann owed me
  a favor); the betrayal investigations press, crack, and exhaust
  honestly ("either it's true, or it's been rehearsed a lot");
  non-verbal conversations (Didier, Olivier) thin gracefully — the
  r132 nod-loop fix holds, no loop. One standing small gap (not a
  fix): a recap pressed right after a favor commit reads "We were
  just talking. Nothing important." (14461 d31) — the recap-empty
  pool is honest about the thread log (favor commits log no thread),
  but the sitting DID have content; a favor commit logging a thread
  would let recap name it. Noted, not fixed (one sitting, no
  falsehood beyond the log's emptiness).
- C3b SETTLED-FAVOR CONFIRM — GO: both "settled" close lines fire
  on sittings that shared a real beat with the favor (Leroy 14463
  d16: wound fulfilled/thanked, "Good — that debt, settled";
  Cheyenne 14464 d27: food fulfilled, "They file it away — settled,
  and counted" + "Good — that debt, settled"). The other "settled"
  lines are honest unsettled-matter lines ("Nobody's settled the
  ambush against me yet" / "of Sari"). The r201 gate + r208
  lapse-label fix confirm on fresh seeds.
- C3c RESUME-OPENER WANT-LABEL WATCH — UNMEASURED this panel (no
  qualifying case, not a confirmation): only one "never finished"
  resume opener fired (14465 d22, "that personal stuff" — generic,
  not a favor label) and one lapse line (14463 d59, "Glad we circled
  back to that water haul" — names the CURRENT favor after a
  forage_help -> water_haul change; the r208 fix holds in the wild).
  The favor-change-within-14-days + resume-opener combination never
  occurred, so the stale-label site stays unwitnessed. The watch
  stays open for a panel where it fires.
- WRAP-CHECK — GO: 37 transcripts, 37 marked, 0 unmarked (35
  engine-ended, 1 driver cap break, 1 refused/ended — Carl 14465
  d31, refused because the defender died d30; honest).
- C7b — reported: buried list + corpse-cause counts per seed in
  the analysis (famine 3, disease 3, wound 5, thirst 5 across the
  panel; the wild dominates everywhere). Buried dead: Oscar (14462),
  Hermann Ford (14463), Simone Konate (14464).
- A1–A6 stranger counters — DESCRIPTIVE: 0 kills, 0 silent, 0
  cooldown violations on all 5 seeds; panel verdict VACUOUS.
  Eligibility: apEligible ~95% of days, encounterEligible 0 on all
  seeds — the channel never opens under home-based play (carried).
- S1–S5 SUPPLY — NOT RUN (RUINROAD parked). Cumulative stays 0/301
  for the arm; this panel adds 0 searches, 0 medicine. The supply
  question is owned by the medicine build brief.
- R181 fight-1: okSorties 20, brokeAfterFight1 8, cleared 12;
  multiMonsterCleared 10/17 (r208: 15/7/8, 5/9). R186 eligibility:
  encounter-eligible days 0 on all seeds (the channel never opens
  under home-based play — carried).
- ARENA WATCH — reported: 7 arena deaths on 4/5 seeds (14461: 2,
  14462: 3, 14463: 1, 14464: 1, 14465: 0). No Reunion-arena fight
  record in the driver data, so no Reunion attribution for the arena
  deaths. No Reunion fights in defendedFights/sortieFights either.
  Wild Reunion is untouched by the arena re-tune (arena-only by
  design); the wild balance question is Steve's standing
  holistic-Reunion call, not this leg's.
- FUNERAL-MEND WATCH — 25 funeral-feast lines across all 5 seeds,
  all voiced: every mend names the dead, the links, and the kcal;
  5 shortfalls (pantry empty) said aloud with "(Trust -8 stands.)".
  ONE DEFECT FOUND AND FIXED IN-RUN (see below): partial-payment
  mends over-claimed the -8.
- CASCADE WATCH — 0 scholar deaths to a hall lingerer this panel
  (the only player death was Simone Konate 14464 d17, the wild).
  The CASCADE lever's shape holds descriptively: lingerers gorge
  (273 nights) and are answered by sortie or endurance, never by
  stepping onto the scholar inside the hall.

## Fixes in-run

### F1 FUNERAL-MEND PARTIAL-PAYMENT OVER-CLAIM — FOUND, FIXED
(sibling surface to the r208 lapse-label fix: a public line promising
what the mechanics did not deliver). Three panel lines over-claimed:
seed 14461 d96 (Alba, 600 kcal -> +3), d110 (Leo, 1,000 kcal -> +5),
seed 14464 d71 (Theo, 900 kcal/link -> +5 each) — all three said
"(Trust mended — the -8 bought back with grain.)" while the
mechanics restored only part of the -8 (gain = round(8 * paid/1500);
the ledger note records the true gain, the public line did not).
Fix (this landing, hierarchy.js _funeralMend only): track the actual
gain per mended link; when every mended link got the full +8 the line
stays verbatim; on any partial mend the line states the true total
gain — "(Trust +N — the feast could not buy back the full -8.)".
Proof test scripts/test-journey-crisis-r216-funeral-partial-20261115.js
3/3 (seeds 7 + 42; RED verified on unfixed code — both partial cases
reproduce the exact wild lines — then GREEN after the fix; cases cover
the mixed thin-pantry shape, the single-link 600-kcal shape, and the
full-pantry control). Original suite test-funeral-mend-b.js re-run
7/7 (mend-thin now shows the honest "+11" line). Postfix
verification on seed 14461: exactly two say-line differences (the
d96/d110 lines now read "+3"/"+5"), days 131 and end identical,
deaths/sorties/gorge/convos identical — the fix spends no RNG and
moves no trajectory.

### F2 ANALYZER DRIFT-DUPLICATE CROSS-SEED FALSE POSITIVE — FOUND, FIXED
(tooling, not game code). The analyzer's R154 drift-duplicate census
keyed its panel-wide `seen` map by (id, episode, day, label) WITHOUT
the seed — seed 14461 and seed 14464 both drifted an ad_break on day
45, episode 1, label player-drawn-off (two legitimate records on two
seeds), and the analyzer flagged the second as a duplicate ("drift
duplicates in panel JSONs=1") while every driver's driftDupesSkipped
stayed 0. Fix (this landing, analyze-crisis-r216-delayed-20261115.js
only): the key is seed-scoped. Proof test
scripts/test-journey-crisis-r216-analyzer-dup-20261115.js 2/2 (RED
verified on unfixed code — cross-seed 1, want 0 — then GREEN; the
same-seed control still catches a true duplicate). Panel re-analysis
after the fix: duplicates 0, all other numbers unchanged.

## Reachable / fun / winnable

- Reachable YES: raids, gorge nights, sorties, favors, mourning,
  funerals, betrayal investigations, party namings all fire on
  ordinary seeds; the crisis leg's content is all reachable.
- Fun YES: villages fight, move on, talk like people (37
  transcripts, 0 fabrications, 2 fixable mislabels caught and
  fixed); confessions land, mourning names the dead, funerals mend
  (and say so honestly now). The leg bends — and this panel, twice,
  it held to the horizon.
- Winnable NO (this leg): 3/5 game-over, 0/5 national — the crisis
  leg is not a win path on its own, and was never meant to be.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: **333 passed, 7 failed in 631s** (gate log
evidence/2026-11-15/journey-crisis-r216-gate-quick.log, goal
hidden_files). **0 attributable** — the 7 failures are all on surfaces
this run never touched: godpath test-measurement-proof-update,
test-measurement-workflow, test-living-garden-deed-attainment (120s
timeout), test-phone-frame-proof, test-one-person-army-deed-attainment
(120s timeout), test-ladder-bundle-20261108 (ambient-raid control),
test-person-trust-20261108 (HAUL errands ±25%). None touches
hierarchy.js funeral-mend or the crisis analyzer; adjudicated
pre-existing/standing. (Verified by the adopting 17:00 run against
the gate log; post-rebase re-run below.)

## Landing

ADOPTED by the 17:00 occurrence via stale-lock recovery — r216 timed
out 15:57 CST before closeout (panel complete, gate 333/7, fixes
verified, nothing committed). Rebased onto master 8c4db3ce2
(hierarchy.js untouched since the r216 base abc52dce1); proof tests +
funeral-mend regression re-run green post-rebase. Safe-commit + ff-merge
+ release + rotation-b 6→7 + lock deletion recorded in
~/memory/2026-11-15.md. Merged locally, pending ship.

## Telemetry

- `node scripts/telemetry-check.js --baseline .../crisis.json
  --current '.../journey-crisis-r216-delayed-seed*.json' --metrics
  defendedFights,playerFights,latelyDefenseCount`: QUIET (5 files,
  3 metrics, no large deviations). Panel sums: defendedFights 72
  (baseline 95), playerFights 0 (baseline 0),
  latelyDefenseCount 0 (baseline 0). Baseline NOT rolled
  (single-panel variance; units check still owed per r201 metric
  review — verify crisis.json units before any roll).

## Metric review

- Dialogue-only fixes are NOT trajectory-neutral while voiceLine
  draws RNG (carried from r192): the r201/r208 fixes spend no RNG on
  the common path; pre/post trajectory comparisons stay
  descriptive, never fix-effect claims. The r216 funeral fix
  likewise spends no RNG — its postfix check (seed 14461, two lines
  changed, days/end identical) is a regression check, not a
  fix-effect claim.
- For supply-gated fixes, the unit test is the proof and the panel
  is a regression check only (carried).
- Telemetry baseline units — verify crisis.json units before any
  roll (carried from r201; this run does not roll).
- NEW from this run: the funeral-mend public line is a SECOND
  consumer of a stored-vs-live value (the gain is computed live but
  the line quoted the full -8 as if it always landed). The same
  audit that found the want-label staleness applies to any line
  that states a number the mechanics computed proportionally: check
  the claim against the computed value, not the nominal one.
- NEW from this run: the analyzer's panel-wide dedupe maps must be
  seed-scoped — any cross-seed census keyed without the seed will
  false-positive whenever two seeds share the key. The R154
  drift-duplicate census is fixed; other panel-wide maps in the
  analyzer (driftSeen is driver-side and per-run, fine) should be
  checked for the same class when touched.
- Median-death-day movement (84 -> 129) is a panel-level
  descriptive, not a per-change claim: with n=5 and overlapping
  distributions, no lever is isolated by this panel. A future
  crisis run that wants to attribute a survival shift needs a
  matched-seed A/B on one change, not a fresh-seed panel.

## Remaining gaps

- Proof refresh round 16 owed (carried from r201; more keys stale
  after this landing — hierarchy.js changed).
- Telemetry baseline re-base owed (carried).
- Lane decision owed on daily-play accept handling (carried).
- Held scale-attr tree remains unlanded (carried, 4+ runs).
- C3c watch stays open: the resume-opener stale want label was
  UNMEASURED this panel (no qualifying case) — a future panel
  needs a favor change within 14 days of planting followed by a
  resume opener naming it.
- Follow-up: recap-after-favor-commit reads "Nothing important"
  (14461 d31) — a favor commit logging a thread would let recap
  name it. Small; one sitting; no fix without a second sighting.
- Follow-up: nodeAway muster wall (39 exclusions, 11 gate-one-short
  refusals) — watch whether it repeats on the next crisis panel;
  if it does, the muster-vs-travel tension is a design question.
- Follow-up: 14463 d62 carries two refused sorties on the same day
  with the same bench — likely a slow day spanning two iterations
  (one call per boundary, same bench both times); recorded, not
  chased (the bench didn't change between attempts).
- Open loop question (carried from r201): what copied 5.6 GB of
  evidence into ~/workspace/worktrees/journey2-crisis at ~11:55Z
  on 2026-11-14 — recorded, not chased further this run.
