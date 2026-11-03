# Loop 1915Z coordinator evidence — scale-onramp round (run fleshout-20261103T0115Z)

## Pre-registration (this round)

- Axis: scale-onramp (topmost non-converged axis; sibling Loop B live on
  food-economy from 22:33Z/00:45Z, NOT touched — its trees, branches, claims,
  and evidence were never written by this run).
- Arms (claim written before any sims, run_id fleshout-20261103T0115Z;
  lock created at run start, no fleshout lock present at run start):
  - sim-wave4encounter-diag: wave-4 encounter-opportunity diagnostic,
    measurement only, zero game-code change.
  - sim-wave4encounter-lever: wave-4 seek policy lever, policy-side only,
    zero game-code change.
  - sim-tabledone-split: tableDone recorder split, instrument only,
    zero game-code or policy change.
- Standing directive: rotation file reads 3 but rotation stays suspended
  by the directive for this run (not advanced). Scale-onramp is NOT
  converged at closeout — the directive is not lifted by this run.
- Master at run start (workers' bases): ee016ba16. Master moved under
  this run twice: sibling Loop B landed sim-atimescale-b evidence
  (36ec276a7) during registration (tabledone tree branched from it),
  then Loop B coordinator evidence (04eaeb441) plus a journey-deepening
  r87 recovery (90637bc7c) during the worker runs. Zero file overlap
  with any arm except evidence/version-adjacent files. All three worker
  branches were rebased onto the moving tip before merging (tabledone
  onto 90637bc7c, diag onto the tabledone tip, lever onto the diag
  tip); arm-file diffs vs old tips EMPTY in all three cases.
- No game-code change in any arm. No push, no version bump, no live
  verification — merged locally, pending ship.

## Arm sim-wave4encounter-diag — GO, bottleneck decomposed (merged 007c3db29)

- Worker branch sim-wave4encounter-diag: prereg 02d454528 (committed
  BEFORE any judged sim) + instrument/driver/analyzer/proof
  4a7f8ad0d, provenance upgrade c3ae74cc9, analyzer fix 005f3a77c,
  pilot corpus 204e60ea0 (rebased form 007c3db29). Proof
  scripts/test-wave4encounter-diag-20261103.js 21/21 on the final
  rebased tip AND on merged master. Merged --ff-only, ancestor-verified
  in the same call; worktree released, removed, branch deleted.
- Pilot: closecommit stack verbatim, 180d death-aware cap, 8 seeds:
  anchor 97339 + reused heraldband band 98201–98207 (named as reused,
  never presented as fresh). Refinement runs (97339 + 98201) reproduced
  the pilot exactly (same days, same say counts 9098/7913), proving the
  instrument change trajectory-neutral.
- Per-stage counts (unlock / targets→w4 / casts→w4 / spawns→w4 /
  wanderer-trigger / player starts / villager field fights / removals /
  deed-faced w4 at end):
  - 97339: 92d won, national, lesser; unlock d70; targets 2; casts 0;
    spawns 2 (checkEncounter 2); trigger 0; starts 0; field 0; removals 0;
    faced — (nothing).
  - 98201: 90d won, global, lesser; unlock d61; targets 5; casts 1;
    spawns 5; trigger 0; starts 4; field 0; removals 3; faced strike,
    algorithm, reunion, congregation.
  - 98202: 90d lost, regional; unlock d35; targets 11; casts 1;
    spawns 11; trigger 0; starts 30 (26 titan-Herald); field 5;
    removals 6; faced algorithm, eulogy, eater.
  - 98203: 66d lost, regional; unlock d34; targets 9; casts 1;
    spawns 9; trigger 0; starts 8; field 4; removals 6; faced algorithm,
    reunion, eater, eulogy, influencer.
  - 98204: 46d lost, village; never unlocked; all stages 0.
  - 98205: 88d lost, global; unlock d59; targets 3; casts 0; spawns 4;
    trigger 0; starts 10; field 0; removals 10; faced reunion, herald,
    eulogy.
  - 98206: 130d won, regional, lesser; unlock d91; targets 5; casts 1;
    spawns 5; trigger 0; starts 1; field 4; removals 2; faced reunion,
    herald, eulogy.
  - 98207: 91d lost, global; unlock d48; targets 7; casts 2; spawns 6;
    trigger 0; starts 27 (23 titan-Herald); field 16; removals 2;
    faced suburb, eulogy, herald, algorithm.
  - Aggregate: 7/8 unlocked, 42 targets, 6 casts, 42 spawns, 0
    wanderer-triggers, 80 starts, 29 field fights, 29 removals,
    6/7 unlocked seeds fought wave 4.
- Named bottleneck (GO met by separation, not restatement): stages
  0–2 are non-empty on 97339 while the fight stage is empty, and the
  same stage converts on sibling seeds — so this is NOT a spawn, pool,
  or unlock failure. It is a spawn→fight CONVERSION failure with two
  links: (1) Tile-entry spawn does not start combat. Wave-4 defs carry
  no `behavior` field, so stance defaults to curious: 3 watch turns at
  distance ≤3, then a hungry turn, are needed to escalate — but the
  forage policy gives the monster ~1 monsterTurn before traveling home,
  after which it is no longer the player's monster and monsterTurn never
  acts on it again. (2) The remaining paths both closed on 97339. The
  Eater (follows=true) followed home, held at the treeline by the
  safe-tile hold ("The walls end the argument"), then wandered away
  (distance-from-home 1→4) and never re-met anyone. The Eulogy
  (follows=false) lingered at the treeline and gorged 6 nights (d85–90),
  each night offering "or send a sortie" — never taken. The sortie is
  UI-only: `answerLingerer`'s sole caller in the codebase is app.js; no
  sim policy calls it, so sims can never take it. Both monsters were
  still alive, unfought, at the d92 win. The village kept fighting lower
  waves in the same window (player starts d76/85/87), so this is not
  endgame fighter-parking — it is the wave-4-specific offer never
  converting. Conversion routes proven on siblings: feast-draw pendings
  (98201 strike d68), world re-meets on later tiles (98201 reunion stood
  on the home tile d74, faced d75), villager field fights. The
  wanderer-contact path (`triggerEncounter`) produced ZERO wave-4 fights
  on all 8 seeds — a dead channel, but not the bottleneck since the
  other paths convert.
- Sense-read (97339 d77/d81/d85–90 stretch): PASS on coherence. The
  story is legible and rational: the Eater arrives, the village judges
  it "beyond us" (MUSTER beat: "Everyone inside… the hunters stand
  down. We outlast it"), the Eulogy gorges nightly at a stated price
  (~800–1,200 kcal/night) with the sortie alternative named nightly.
  Blemish, carried from the prior run: nothing in these lines (or the
  d92 lesser-seat audit) ever says a full seat exists or that wave-4/5
  fights are the shortfall — a player would reasonably conclude the
  village simply chose to wait. The fiction justifies waiting; the game
  never prices what waiting costs in seat terms.
- Wall (descriptive, pilot only): national/global 4/8, table-latch 6/8
  (latch is NOT table reach), won 3/8, maxWave4 7/8, maxWave5 1/8,
  wave-4 fought 6/8, wave-5 fought 0/8 (98201 unlocked wave 5, faced 0
  wave-5 monsters — the next wall, out of this arm's scope), median
  survival 90d (46, 66, 88, 90, 90, 91, 92, 130).
- Caveats (not hidden): daily snapshots miss same-day pendings (faced
  same day); covered by start-provenance + deed counts instead. The
  reunion's route onto the home tile (4,4, d74 on 98201) is observed but
  its entry route is NOT established (candidates: leg-board tile
  aliasing, follow re-entry) — reported as fact, not mechanism.

## Arm sim-wave4encounter-lever — KILLED at pilot (merged 12f2e03b1)

- Worker branch sim-wave4encounter-lever: prereg + policy + driver +
  proof 606211f73 (rebased form d9ba89127, prereg committed BEFORE any
  judged sim) + kill commit 27ac42038 (rebased form 12f2e03b1: policy +
  proof test DELETED, results + compare + 16 per-seed JSONs kept).
  Policy file absent on the merged tip (verified: 0 wave4seek files in
  scripts/policies/); driver/analyzer/prereg + results/compare +
  perseed intact; arm-file diff vs old tip EMPTY. Merged --ff-only,
  ancestor-verified; worktree released, removed, branch deleted.
- Design (policy-side only): baseline = closecommit stack verbatim from
  scripts/fightoutcome-driver-20261102.js (env FEASTSCALE_R13=1
  TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1;
  mode herald; 180d death-aware cap). Variant = baseline + daily
  undirected wild patrol while wave 4 is unlocked and the w4 deed bar
  (<3 distinct) is unmet, via travelTargets/travelTo (deed-seeking
  pattern). Fight behavior unchanged.
- Perception-law compliance (hard constraint, verified by code reading
  + proof test while the policy lived, 8/8): the policy NEVER read
  worldMonsters / nearestWorldMonster / monsterAt / any monster
  position or roster. It decided only from the announced unlock
  (unlockedWave), the village's own deed record (deedState().wavesFaced),
  and its own revealed map (travelTargets). Channel survey (in prereg):
  perception hints fire only for a monster on/adjacent to the player's
  tile; scout reports map tiles, never monster positions; the muster
  beat names no tile; the lair report is titans-only. So no targeted
  travel exists — the arm tested undirected patrol, honestly labeled.
- Pilot (fresh seeds 98301–98308, identical seeds both arms, 16/16 runs
  clean, zero instrument errors). Distinct wave-4 fought, baseline vs
  variant (unlock day / patrol days):
  - 98301: 1 [herald] (d80) vs 0 [] (10 patrol days)
  - 98302: 0 [] (never unlocked) vs 0 [] (0)
  - 98303: 1 [reunion] (d56) vs 3 [congregation, suburb, reunion] (21)
  - 98304: 0 [] (never unlocked) vs 0 [] (0)
  - 98305: 0 [] (never unlocked) vs 0 [] (0)
  - 98306: 2 [eulogy, algorithm] (d58) vs 2 [eulogy, algorithm] (17)
  - 98307: 4 [strike, reunion, suburb, influencer] (d75) vs 2 [reunion,
    suburb] (11)
  - 98308: 0 [] (never unlocked) vs 0 [] (0)
  - Totals: baseline 4/8 seeds, 8 distinct kinds; variant 3/8 seeds,
    7 distinct kinds.
- Verdict: KILLED. Prereg GO required variant ≥2/8 AND baseline 0/8.
  Actual baseline 4/8, variant 3/8 — GO fails on the baseline leg, and
  the descriptive delta is flat-to-negative, so no confirm round is
  justified. Policy + proof deleted; no trace of the lever remains.
- The finding (bigger than the kill): the 97339 zero is seed-specific,
  not systemic. On this band, 4/4 wave-4-unlocked seeds convert WITHOUT
  seeking: once wave 4 unlocks, the world spawner (60% newest wave) puts
  Mirror Draft monsters on wild tiles within days; they linger at
  Haven's treeline, gorge from stores, join pantry raids, and get fought
  at the door. 98307 baseline got 4 distinct kinds with zero seeking.
  Seeking is not the missing ingredient — and it isn't free: on 98301,
  10 patrol days coincided with LOSING the baseline's Herald titan
  fight (trajectory perturbation).
- Sense-reads: PASS, seek-success-without-seeking (98303 baseline
  d56–78: Reunion spawn beat → muster warning → nightly gorging
  1,454 kcal → 3-Reunion pantry raid d77 → party fight d78 with a real
  casualty, Quinn falls; the deed path is the raid/treeline path, not
  the wild-encounter path). PASS with a cost (98301 variant: patrol
  works mechanically but displaces converting paths). PASS,
  mechanism-real-but-rate-flat (98303 variant: patrol days DO generate
  coherent wild w4 encounters, yet the band rate doesn't rise because
  baseline converts through the same spawn system anyway).
- Wall (descriptive): national baseline 2/8, variant 0/8; table 4/8 →
  4/8; won 2/8 → 2/8; wave-4 unlocked 4/8 both arms; wave-5 fought 0/16
  runs; median survival 87d → 88d.
- Panel compare (§15) NOT run, stated in the prereg before any sim:
  POLICY_REGISTRY in scripts/sweep-compare.js is a fixed list containing
  neither the closecommit stack nor the wave4seek wrapper. Judged
  comparison is the identical-seed driver table in
  evidence/2026-11-03/wave4seek-compare.md (full record
  evidence/2026-11-03/wave4seek-results.md, per-seed JSONs in
  evidence/2026-11-03/perseed-wave4seek/). Carried as an instrument
  note, not re-scored here.

## Arm sim-tabledone-split — GO (merged 9e79bbe10)

- Worker branch sim-tabledone-split: prereg 2c968052e (rebased form
  50358c9f8, committed before any judged verification) + split
  733fe6142 (rebased form 9e79bbe10). Merged --ff-only,
  ancestor-verified; worktree released, removed, branch deleted.
- What the split is: the collapsed field lived in the driver, not the
  recorder module — scripts/fightoutcome-driver-20261102.js computed
  `table = tableWaiting || tableDone` from one progState() read. Source
  check (code, not inference): progression.js:705,820 / table.js:638 set
  tableWaiting=true (seat offered, not sat); table.js:713–714 and :728
  set tableDone=true AND tableWaiting=false (seat taken). The driver
  now reads both booleans at the same end-snapshot via a new shared
  helper and emits all three fields. Zero game-code change, zero policy
  change.
- Files: scripts/fightoutcome-tableflags.js (new, pure tableFlags(pg)
  + splitFromLegacy(rec), no game import, no I/O);
  scripts/fightoutcome-driver-20261102.js (emits tableWaiting,
  tableDone, plus legacy table with unchanged OR semantics);
  scripts/fightoutcome-analyze-20261102.js (additive only: per-seed
  split fields + wall.tableWaiting / wall.tableDone /
  wall.tableUnknown; every existing leg, floor, determinism check, and
  wall.table value untouched); scripts/test-tabledone-split-20261103.js
  (new proof).
- Proof on the worker's tree: 23 checks ALL PASS (helper units,
  legacy rules, fixture corpus). Proof exception on the REBASED tip,
  documented not hidden: the test's replay section extracts the OLD
  analyzer from `git show HEAD:...` — after rebase, HEAD is the NEW
  analyzer, which requires its sibling tableflags module and cannot
  resolve it from /tmp, so the 4 replay checks fail (19/23 pass on the
  rebased tip: all helper, legacy, and fixture checks). The replay
  SUBSTANCE was re-verified directly by the coordinator on both the
  rebased tip and merged master (analyzer + tableflags copied together
  to /tmp, run over a copy of evidence/2026-11-02/perseed-heraldband-widen):
  every pre-existing analysis.json field identical, wall.table=6
  unchanged, tableWaiting=0, tableDone=0, tableUnknown=6. The test was
  NOT edited to force green; its HEAD-sensitivity is recorded under
  metric review below.
- Old-vs-new replay (worker, corpora copied to /tmp since the analyzer
  writes analysis.json into its target dir):
  perseed-heraldband-widen (8 seeds): pre-existing fields identical;
  table=6 unchanged, tableUnknown=6. perseed-fightoutcome-a (9 seeds):
  pre-existing fields identical; table=7 unchanged, tableUnknown=7. No
  legacy run is mislabeled as done anywhere.
- Important caveat — no real tableDone corpus exists yet. Grep confirms
  no per-seed file in recorder format carries tableWaiting/tableDone
  keys; the collapsed table=1 runs (6/8 heraldband-widen, 7/9
  fightoutcome-a) are un-splittable without inference, so they report
  null (unknown) by design. Class (b) of the prereg is therefore proven
  by fixture + the code-level source check, NOT claimed as a real-corpus
  result. The first screen that runs the new driver will produce the
  first real tableDone corpus.
- Sense check: round-0011's transcript line ("Road inactive, tablePhase
  done") describes a sat table — the done class — and matches the
  table.js sitting semantics above. The heraldband-widen corpus's only
  table-mentioning anchored line is about the Herald striking the Red
  Table (a different thing), which is exactly why the split must come
  from progState(), never from transcript lines.
- How future screens should use the new fields: tableDone=1 — seat
  taken; use for "table reached and sat" screens, regardless of won.
  tableWaiting=1 — invitation pending, seat not yet taken; use for
  "offered but not sat." Never read it as reach. table (legacy) — kept
  only for old screens/corpora; new screens must not use it where the
  distinction matters, since it over-counts reach. Per-seed
  tableWaiting=null/tableDone=null — UNKNOWN (legacy corpus); exclude
  from both numerators, count in wall.tableUnknown, never treat as 0.
- Canon note: docs/SIM-INSTRUMENTS.md covers shared sim instruments
  generally, but no canon doc covers this recorder specifically; the
  recorder's own header + the round-0011 evidence note were the
  governing docs, and no canon was invented.

## Telemetry deviation check

Prescribed invocation on both landed corpora (diag per-seed glob,
wave4seek per-seed glob) REFUSED by the tool by design
(recorder-corpus class: rows carry top-level anchorCommit; "Recorder
corpora are compared with sweep-compare tables, never against a run
baseline here"). No LOUD lines, baseline NOT rolled. NOT forced with
--allow-recorder-corpus or --update-baseline, same as prior runs.

## Village assessment (plain words)

The village is no longer the problem at wave 4 — the invitation is.
Monsters of the fourth wave do show up once the village is strong
enough: they gather at the edge of home, eat from the stores night
after night, and join raids on the pantry, and villages that meet them
there do fight them. Seed 97339's village is the unlucky one: its two
fourth-wave visitors never turned into a fight. One followed the
villagers home and was kept out by the walls until it drifted away; the
other ate at the treeline for six nights while the game kept offering
"or send a sortie" — an offer no simulated villager can ever take,
because that button exists only on the phone screen, not in any
villager's behavior. Both monsters were still alive, unfought, the day
the village sat at the lesser seat and won. Meanwhile the game never
told the village, in words, that a full seat even exists or that
fourth- and fifth-wave fights are the price of it — so from the
village's side, waiting looked like the wise choice. Sending villagers
out hunting for fourth-wave monsters does not fix this: villages that
patrol find a few more wild ones, but villages that simply stay home
convert just as often through raids and the treeline, and patrolling
cost one village its titan fight. The blank this run filled is the
measurement itself: we can now say, stage by stage, where a
fourth-wave monster's journey to a fight breaks, and we can now tell a
sat table apart from a merely offered one in future screens.

## Metric review (for the NEXT run, not re-scored here)

- The staged-count prereg bound the diag run fairly; GO was met by
  separation, not by restatement. The next run should NOT re-prove this
  pipeline — it should attack the conversion links (lingerer-sortie
  availability in sims, curious-default escalation for wave 4, or
  feast-draw wave-4 rates), or the wave-5-fought wall.
- The seek prereg's 0/8 baseline assumption was 97339-specific. Future
  seek arms must pre-register a DELTA, not a zero baseline.
- The deed-feed wave-4 count mixes titan, raid/treeline, and wild paths.
  Future metrics should split them.
- The tabledone proof test is HEAD-sensitive (it extracts the old
  analyzer from HEAD). Future instrument proofs should pin the old
  analyzer by commit hash, not by HEAD.
- No targeted-travel channel should be built for wave-4 seeking — the
  monsters already arrive on their own. That is a finding, not a gap.

## Infrastructure

- Registration slowness: the three register calls took ~7 minutes total
  on REGISTRY.lock contention (previous runs: ~80–150s each); all three
  completed, all three heartbeated.
- Safe-commit index clobber (staged-deletion variant) hit every worker
  commit across all three arms — repaired via HEAD-blob cacheinfo each
  time, commits verified correct, worktrees clean at handoff.
- No EPERM flap this run. check.js --quick NOT re-run: zero src/js,
  zero default flips, zero green-list files (all changes are scripts/
  instruments + evidence/).
- Origin checked: local master ahead of origin/master (local merges not
  yet pushed — ship loop owns pushes). No push, no version bump.

## Coordinator evidence

This file (commit pending at closeout). Main tree verified clean after
all merges before this commit; trees removed, branches deleted, reap
run (new sibling Loop B trees present, untouched).

scale-onramp stays converging (NOT converged): the wave-4 conversion
mechanism is now named with stage counts, and the table flag is now
splittable, but no game change landed in this run, the full seat is
still unwon, and wave 5 is still unfought in normal play. Next blanks,
in order: (1) conversion-link arm — lingerer-sortie availability in
sims, curious-default escalation for wave 4, or feast-draw wave-4
rates, each with its own pre-registration, never bundled; (2) the
wave-5-fought wall (98201 unlocked wave 5, faced 0 wave-5 monsters);
(3) win-funnel variety (feared/mercy only proven path/final);
(4) first real tableDone corpus from the next screen using the new
driver; (5) heralddepart departure-telegraph design question
(Steve-call if feel); (6) npcdeadfilter follow-ups
(accepted-before-death refusal transcript, debate-notices-death design
question); (7) STEVE-CALL: committed blade as bearer (options a–d,
unchanged); (8) stores-draw upkeep proposal (Steve-call, unchanged).
food-economy untouched (sibling Loop B lane).
Claim retired to .DEAD; lock deleted.
Merged locally, pending ship (tabledone-split 9e79bbe10 + diag
007c3db29 + wave4seek-kill 12f2e03b1 + coordinator evidence).
