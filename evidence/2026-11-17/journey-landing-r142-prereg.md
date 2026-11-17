# journey-landing r142 — PREREG (Lane A, leg 0 LANDING)

**Run id:** journey-landing-20261117T1229Z (scheduled Tue 2026-11-17 05:45 CST).
**Base:** local master at run start (`3cb0782e5`, journey-scale r233 closeout +
sim-sametick-a adoption addendum).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration (12:29Z); heartbeat loop re-armed every 10 min for
the whole run (nohup, log `/tmp/hb-journey-landing-r142.log`). Lock: no stale
lock (none present at run start); fresh lock created 2026-11-17T12:23:24Z
(run_id 2026-11-17T12:23:24Z).

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1192–1201**. Searched `evidence/` markdown (preregs +
run notes) for exact band namings ("1192–1201", "1192-1201", "band 1192") —
**zero hits**. Searched `evidence/**/*.md` for "1192" — 10 files, all
incidental numbers inside unrelated docs (doomdraw-panel-compare,
haven-access-holdout-features, overnight-save-features, garden audits,
journey-crisis-r107, sim-hold-b, sim-winnability-round-1130,
sim-knowledge-b-prereg) — none is a landing prereg naming this band.
Landing preregs name bands 1182–1191 (r141), 1172–1181 (r140), 1162–1171
(r139), 1142–1151 (r121–r138, deliberate reuse), 1122–1131 (r119),
1083–1092, 1073–1082, 1063–1072, 1053–1062, 1043–1052, 897–906
(contaminated), 887–896, 867–876, 857–866, 847–856, 837–846, 817–826,
797–806, 777–786. Band 1192–1201 is fresh; no prereg, forbidden list, or
contaminated list names it.

## Q1 (PRIMARY) — regression watch on the post-r141 master, fresh band

Since r141's base (`3a2808723`), `src/js/` changed in 7 files
(`git diff 3a2808723..HEAD -- src/js/`, 222 insertions, 13 deletions).
Landing-domain changes in the watch:

- `convo-dialogue.js` +17, `convo-wants.js` +22 — establishment r231
  deferred-ask guard (af1791e90, [needs-eyes]): a stage-0 ask_favor want
  with a live need no longer takes the settled-favor short-circuit
  ("It's already handled. Thank you for asking.") about a dead ledger
  favor; the deferred branch states the live ask instead. Watch: dlg:help
  presses in stage-0 favorless ask_favor sittings must state the live
  ask, never the settled line about a favor this sitting never pinned.
- `win-plan.js` +77, `game.js` +5, `betrayal.js` +7 — deathcleanup-b
  (5f583a056 + correction 1f3187fc2): the win-plan dies with the
  villager; the correction keeps the death hook from materializing an
  empty plan store in sleeping villages. Landing watch only: no plan
  oddity in the first fortnight's deaths, no store ignition by a death.
- `win-plan.js` (same diff) — planignite-fix (a61f03d22, PILOT GO):
  plan store initializes on first HavenTick. Landing watch only: count
  villages that start a win-plan inside 28d (r141 did not report this;
  the pre-fix shape was "plan store never switches on until a wave-3
  fight, a kill, or a narrow escape").
- `titans.js` +105 — scale r233 titan refusal said once per titan per
  day; out of the landing window, noted only.

**No src/js fix this run** — pure regression watch + metric-review
adoptions. Single AFTER corpus (`landing-r142-after`); no BEFORE/AFTER.

**Metric revisions adopted (r141 metric review, item 1):**
- **M-PR1: denominator revised.** Score never-offered only over sittings
  where the want reached stage ≥1 (established), and count a dlg:help
  offer as the stage-0 offer (that is the r230 fix's whole point). The
  r107 analyzer counts neverOffered over ALL ask_favor sittings and does
  not print stage, so the revised rate is adjudicated by reading each
  never-offered sitting's transcript: stage from its `want final:` line
  (stage 0 + resolution=unestablished → excluded from the denominator),
  and a `[dlg:help]` menu in the sitting counts as offered. Binding:
  **never-offered among established sittings ≤15%** (r141 under this
  scoring: 1/26 = 3.8%). The raw analyzer rate is still reported.

**Interesting if:** any r141 bar moves on the fresh band; the r231
deferred-ask guard fails live (a stage-0 favorless ask_favor sitting
answers "already handled" about a settled ledger favor while a live
need waits); any warn_you sitting goes silent (silentTurns > 0 —
heed-fix regression); scholar deaths > 2; revised M-PR1 > 15%;
statedAfterPick ≥ 6 (r141 metric review item 6: a second panel at ≥6
opens the away-guard over-fire question); hungry-at-horizon moves from
5/10 either way; any village starts a win-plan inside 28d (planignite
watch); any death leaves a stale plan trace.

**Bars (bind, r141 bars carried, with the M-PR1 revision above):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket watch: 0 pocket fights, 0 stuck turns.
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
- Pilot first: seeds 1192–1195; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Q2 — People check (M5, sense-read)

Read 5 full transcripts from the panel. Bar: each sitting shows the NPC
wanting something, options engaging or deflecting it, endings resolving /
planting / owing. No fabricated shared history, no filler loops, no static
menus. Include at least one resume-take sitting if the panel produces one
(Q1 watch) and read it for the re-pose AND for any drift-note tail quoted
as memory. Include a warn_you sitting if the panel produces one — read it
for the deepen + 'heeded' resolution. Include a stage-0 ask_favor sitting
with dlg:help if one fires — read it for the r231 deferred-ask guard
(the live ask stated, not the settled line). Include a C3d recap sitting
if one fires (recap naming the live want with an empty thread log).

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

- Landing panel: seeds 1192–1201, 28d, r142 driver
  (scripts/journey-landing-r142-20261117.js — r141 driver verbatim
  except header/seeds/OUTDIR).
- Corpus: `landing-r142-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-17/`).
- No threshold, bar, price, or gate changes in this run except the
  M-PR1 denominator revision above (proposed in r141's metric review).
  If the panel surfaces a further game defect, fix in the worktree with
  a proof test, or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — fix owed in the
  bridge-memory build arm with its own panel (per-sitting bridge memory
  or a bar revision); NOT this run — the fix touches shared pick-cycle
  machinery used by every pool. Verbatim bar stays 0 until that arm
  lands and its panel re-scores it.
- Fights count keeps moving (r139: 21, r138: 12, r140: 17, r141: 7) —
  open question, matched-band A/B owed (same seeds, profile-gate bypass
  on/off), before any claim about the bypass or the band.
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10.
- Favors watch CLOSED (r141: kept 7 vs broken 7, tie — the break-ahead
  pattern did not hold a third panel).
- Stated same-day need with no commit path (r141 F1, 1189-d14) — design
  question (dawn-meet-shaped commit vs same-day accept), documented for
  Steve/design call, not fixed here.
- NV sittings share one closing template (observation only).
- Analyzer vs transcript streak count (r134 carry).
- `test-convo-engine-trust.js` verbatim closeLine 6 pass/1 fail
  pre-existing on pristine (observation).
- Measurement-proof + phone-frame-proof staleness pair (standing;
  refresh owed via the update scripts — maintenance, not this run,
  unless this run's gate shows them moved).
- Hunt H0-ESTABLISHED: hunt assignments resolve, first rung (8 reps)
  still out of reach in 28d.
- Lead-in nit (r139/r140/r141): topic answers repeat their lead-in
  within a sitting ("Good question." ×8 on r141). Observation only;
  worth a look when the bridge pool gets its per-sitting memory.
