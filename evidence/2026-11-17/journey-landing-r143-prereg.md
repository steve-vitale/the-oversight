# journey-landing r143 — PREREG (Lane A, leg 0 LANDING)

**Run id:** journey-landing-20261117T2044Z (scheduled Tue 2026-11-17 14:45 CST).
**Base:** local master at run start (`1aba45367`, sim-winnability-round-1820
coordinator closeout).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration (~20:52Z); heartbeat loop re-armed every 10 min for
the whole run (nohup, log `~/workspace/worktrees/journey-landing-hbloop-r143.out`).
Lock: no stale lock (none present at run start); fresh lock created
2026-11-17T20:44:00Z (run_id laneA-2026-11-17T20:44:00Z).

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1212–1221**. Searched `evidence/` markdown (preregs +
run notes) for exact band namings ("1212–1221", "1212-1221", "band 1212") —
**zero hits**. Searched `evidence/**/*.md` for "1212" — zero hits in any
landing file (no landing prereg names it). Landing preregs name bands
1192–1201 (r142), 1182–1191 (r141), 1172–1181 (r140), 1162–1171 (r139),
1142–1151 (r121–r138, deliberate reuse), 1122–1131 (r119), 1083–1092,
1073–1082, 1063–1072, 1053–1062, 1043–1052, 897–906 (contaminated),
887–896, 867–876, 857–866, 847–856, 837–846, 817–826, 797–806, 777–786.
(Note: an old r122-era fresh-band scan used 1200–1209 for scan-after only;
1212–1221 does not overlap it.) Band 1212–1221 is fresh; no prereg,
forbidden list, or contaminated list names it.

## Q1 (PRIMARY) — regression watch on the post-r142 master, fresh band

Since r142's base (`3cb0782e5`), `src/js/` changed in 8 files
(`git diff 3cb0782e5..HEAD -- src/js/`, 258 insertions, 62 deletions).
Landing-domain changes in the watch:

- `convoTopics.js` +~24, `conversation.js` +~108, `convo-dialogue.js` +19 —
  succession r231 (ec7abcd00, [needs-eyes]): mourning lines stop wearing
  different names. The single-name mourning pool and the lately cope/next/
  part pools now carry `{mname}` and fill it in `t2fill` AFTER the pick,
  so convoPick's text dedupe sees one template, not one name-baked copy
  per dead person (r230: the first template fired 5x across the panel,
  once per corpse). Watch: every mourning line in the panel's transcripts
  names the current lately dead (no empty "Since died...", no stale name),
  and the same template does not re-serve once per corpse.
- `conversation.js` (same diff family) — crisis r230 (7eb8ffc22,
  [needs-eyes]): quote-aware pagination fix. Landing watch: no dry or
  stranded content in paged sittings; transcripts read whole.
- `conversation.js` / `convoTopics.js` — social-life r234 (39eaa043e,
  [needs-eyes]): DRY2 fix (F6 MISS 4 dry at new DRY3 sites). Landing
  watch: 0 dry lines (empty THEM/content lines) in the panel's
  transcripts.
- `win-plan.js` +80, `betrayal.js` +10, `party.js` +10, `truth.js` +18 —
  sim-nondeathplan-b (446a96ef4 + correction a3a7be77c): the win-plan
  dies on ANY removal (leave hook + fled-betrayer choke-point routing),
  not just death; the correction reports tbEnd fled-cleanup errors.
  Landing watch only: no plan oddity in the first fortnight's deaths or
  departures, no store ignition by a death or a leave, no stale plan
  trace after a removal.

**AMENDED mid-run (F1):** the panel found a verbatim-repeat bar MISS
(one sitting, seed 1213 d11 Mia, 18× the same line — the
already-confessed confront deflect never retires the option). A fix
landed in this run (`src/js/truth.js`: the already-confessed deflect
spends the confront choice for the sitting; proof test
`scripts/test-journey-landing-r143-confront-stale-20261117.js`, 16/16
green, red on unfixed code). A matched-band AFTER panel ran on the
same seeds 1212–1221 into `landing-r143-after-fix` (§15): verbatimRepeats
18→0, all other bars hold. The "no BEFORE/AFTER" premise above is
superseded by that matched-band comparison.

**Metric revisions adopted (r142 metric review, item 1):**
- **Pocket bar — bind the shape, watch the turns.** pocketFights = 0
  binds; stuckTurns is reported as a watch (a panel with ≥2 stuck turns,
  or a stuck turn in a LOST fight, reopens the question). r142 missed the
  bar as written on one board-sweep turn in a won fight.

**Interesting if:** any r142 bar moves on the fresh band; a mourning line
names the wrong dead person, comes out empty, or the same template
re-serves once per corpse; any dry line in a transcript; any plan oddity
after a death or departure; a second starvation death (r142's R66 miss —
the margin question, not a re-score); scholar deaths > 2; revised M-PR1
> 15%; statedAfterPick ≥ 6 (r141 metric review item 6: a second panel at
≥6 opens the away-guard over-fire question); hungry-at-horizon moves from
4/10 either way; any village starts a win-plan inside 28d (plan watch);
any death leaves a stale plan trace.

**Bars (bind, r142 bars carried, with the pocket revision above):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket: 0 pocket fights BINDS; stuckTurns reported as watch.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1 (revised): never-offered among established ask_favor sittings
  ≤15%; raw analyzer rate + max per-seed never-offered reported as watch.
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
- Presshop farUnreached REPORTED only.
- R66 HUNGRY: starvation deaths 0, starvingWarnings 0.
- 1130-d6 amnesia shape: 0 recurrences. Miriam line: 0 "That's settled".
  Deflect-fallback: 0 `fellBack`.
- Nodloop: LOOP=0.
- Q1 panel watch: resume-takes of deflected question-wants re-pose the
  question — report the count; a take that still ends in the generic
  acknowledgment is a Q1 failure on live data. verbatimRepeats 0,
  verbatimRepeatsExempted = re-poses observed; spot-check each exempted
  line against its transcript (a non-re-pose exemption is a Q1 failure).
- **Scholar deaths: ≤2 per 10-seed panel.** Report count, day, cause,
  succession latency per death.
- **silentTurns (phantom-line detector): 0 on the panel.**
- **Mourning watch (r231):** every mourning line names the current lately
  dead; no `{mname}` or empty-name render; the same template does not
  re-serve once per corpse (count firings per template).
- **Dry-line watch (r234/r230):** 0 dry (empty-content) lines in the
  panel's transcripts.
- Pilot first: seeds 1212–1215; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Q2 — People check (M5, sense-read)

Read 5 full transcripts from the panel. Bar: each sitting shows the NPC
wanting something, options engaging or deflecting it, endings resolving /
planting / owing. No fabricated shared history, no filler loops, no static
menus. Include a mourning sitting if the panel produces one (r231 watch —
read it for the name worn and the template spread). Include a warn_you
sitting if the panel produces one — read it for the deepen + 'heeded'
resolution. Include a stage-0 ask_favor sitting with dlg:help if one fires
— read it for the r231 deferred-ask guard (the live ask stated, not the
settled line). Include a resume-take sitting if the panel produces one
(Q1 watch) and read it for the re-pose AND for any drift-note tail quoted
as memory. Include a C3d recap sitting if one fires (recap naming the live
want with an empty thread log).

## Q3 — Telemetry

`telemetry-check.js` on the panel vs
`telemetry-baselines/landing-split.json` (re-pinned r136: 81/9/217/15/0).
LOUD lines are same-run investigation items. Baseline is NOT rolled
unless the panel carries new information.

## Q4 — Gate

`node scripts/check.js --quick` in the worktree
(`--cacheDirectory=/tmp/jest-cache-playtest`); adjudicate every failure
against pristine HEAD. 0 attributable is the bar.

## Policies / seeds

- Landing panel: seeds 1212–1221, 28d, r143 driver
  (scripts/journey-landing-r143-20261117.js — r142 driver verbatim
  except header/seeds/OUTDIR).
- Corpus: `landing-r143-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-17/`).
- No threshold, bar, price, or gate changes in this run except the
  pocket-bar revision above (proposed in r142's metric review).
  If the panel surfaces a further game defect, fix in the worktree with
  a proof test, or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — fix owed in the
  bridge-memory build arm with its own panel; NOT this run. Did not
  recur on r142 (verbatimRepeats 0, goal pool 1 serving, 0 repeats).
- Fights 21 vs 12 vs 17 vs 7 vs 16 — open question, matched-band A/B
  owed (same seeds, profile-gate bypass on/off), before any claim about
  the bypass or the band.
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10, r142 4/10.
- Stated same-day need with no commit path (r141 F1, 1189-d14) —
  design question (dawn-meet-shaped commit vs same-day accept),
  documented for Steve/design call, not fixed here. Did not recur on
  r142 (the one revised never-offered case is a turn-0 leave).
- NV sittings share one closing template (observation only).
- Analyzer vs transcript streak count (r134 carry).
- `test-convo-engine-trust.js` verbatim closeLine 6 pass/1 fail
  pre-existing on pristine (observation).
- Measurement-proof + phone-frame-proof staleness pair (standing;
  refresh owed via the update scripts — maintenance, not this run,
  unless this run's gate shows them moved).
- Hunt H0-ESTABLISHED: hunt assignments resolve, first rung (8 reps)
  still out of reach in 28d. (r142 reads H1 — same rung, no
  assignments at all; see r142 F3.)
- Lead-in nit (r139/r140/r141/r142): topic answers repeat their
  lead-in within a sitting. Observation only; worth a look when the
  bridge pool gets its per-sitting memory.
- R66 margin question (r142 F1): a scholar at home with a full pantry
  lived hand-to-mouth for three weeks and died on a 934-kcal nightly
  deficit. Balance/policy arm question — meal share vs daily burn for a
  Haven-bound scholar, and whether the competent policy should bank food
  during the day. Not this run.
