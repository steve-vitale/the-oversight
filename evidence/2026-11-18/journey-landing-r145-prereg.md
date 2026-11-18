# journey-landing r145 — PREREG (Lane A, leg 0 LANDING)

**Run id:** playtest-a-20261118T1817Z (scheduled Wed 2026-11-18 11:45 CST).
**Base:** local master at run start (`a48b2405c`, journey-scale r242 closeout).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration (~18:29Z); heartbeat loop re-armed every 10 min for
the whole run (nohup, log `~/workspace/worktrees/journey-landing-hbloop-r145.out`).
Lock: no stale lock (none present at run start); fresh lock created
2026-11-18T18:17:23Z (run_id 2026-11-18T18:17:23Z). Pre-flight: main tree
clean, disk 51%, `git pull` already up to date; `worktree-reap.sh` ran
(14/16 active; 4 trees with uncommitted changes belong to other owners —
left alone). Register took ~9.5 min (git reset --hard under ship-loop load;
ship loop was mid version-bump at registration time — merge must re-verify
HEAD before landing, per the r144 adoption race lesson).

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1232–1241**. `git grep` for the exact band strings
"1232–1241" / "1232-1241" over `evidence/*/*.md` — zero hits. `git grep
"1232"` over `evidence/*/journey-*` hits are substring noise in non-landing
corpora (5-digit seed captures, scale/deepening JSON), none a landing prereg
or run note naming seed 1232. Landing preregs name bands 1222–1231 (r144),
1212–1221 (r143), 1192–1201 (r142), 1182–1191 (r141), 1172–1181 (r140),
1162–1171 (r139), 1142–1151 (r121–r138, deliberate reuse), 1122–1131
(r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062, 1043–1052, 897–906
(contaminated), 887–896, 867–876, 857–866, 847–856, 837–846, 817–826,
797–806, 777–786. Band 1232–1241 is fresh; no prereg, forbidden list,
or contaminated list names it. (A full-tree `grep -rl` was abandoned after
4 min — the evidence tree is too large for a cold recursive grep; the
`git grep` over journey evidence + the prereg band list is the check.)

## Q1 (PRIMARY) — regression watch on the post-r144 master, fresh band

Since r144's base (`6fb98f473`), `src/js/` changed in 10 files
(`git diff 6fb98f473..a48b2405c -- src/js/`, +441/−35).
Landing-domain changes in the watch:

- `game.js` +130 — **r144's own pocket repair** (cc35d76b9, in range):
  pocketFights must stay 0 on the fresh band; zero-DMG fights 0.
  **r240 homeward-refusal fix** (journey-establishment r240):
  clearBlockage now names the FIRST homeward refusal (fallen tree /
  rubble / washed_out on the direct route), so a walk stopped by a creek
  can still clear a tree on a sidestep and detour. Watch: end-stranded
  days, homeward-stuck scholars; the seed-101401 shape (scholar stuck
  8 end attempts, dead d16 of sickness) must not recur.
  **WILDAVOID** (sim-wildavoid-a, finding #2506): outmatched parties give
  the beast room on the wild routers — env-gated `WILDAVOID=1`, driver
  does NOT set it, so the lever is OFF here; any wild-avoid shape in the
  panel would be a defect, none expected.
  **FLEEREPAIR3** (sim-fleerepair3-b, finding #2500): leaving ends the
  fight, no parting hit — watch fleeStuckTurns, flee deaths, parting-hit
  deaths (panel 698→694 on its own band).
- `convo-wants.js` +66, `favor-forage.js` +45 — **639bd3f41 repay-want
  fix** (journey crisis r240, C3b r201): a repay want must not call a
  broken favor settled while its need is live (Amanda 14525 d38).
  Watch: favor sittings — a favor with a live need must never be
  answered with the settled line; M-PR1 watch.
- `conversation.js` +25 — journey-social-life r236 **TRAILTALK fix**
  (talkUsed no-repeat-until-exhausted per outing) + crisis r241
  mime-walk 6-variant pool / Wren cache-note 6-variant rotation.
  Watch: verbatimRepeats 0; no Wren note reprint in one sitting.
- `fieldFights.js` +13 — FIGHTALLY2/FLEEREPAIR3 wiring. Watch:
  second-ally fights, zero-DMG/stuck = Q1 failure on live data.
- `villager-brain.js` +69, `win-plan.js` +81 — sim-partytrios-b
  brain-mirror partyTrios bump + sim-triodrought-b companion carry
  restore + sim-notickexact-a (wave-4 only, past window) + win-plan
  depart-path work. Watch: PARTY offered/spoken/accepted; trios in the
  landing window are unexpected — report if one forms.
- `table.js` +24, `alienPlayers.js` +21 — journey-scale r242
  tableSitting mercy distinction; alien-player voice work. Past the
  landing window / no landing signal expected.
- `win-plan.js` — sim-aidleave-b DIAG-GO (mechanism A): aid crises
  resolve — watch aid-leave shapes in the panel.
- `build.js` 2+- — version stamp churn, no landing signal.

**Interesting if:** any r144 bar moves on the fresh band; a pocket
recurs (any shape, including sub-threshold); a scholar ends stranded
homeward for 2+ days; a favor with a live need is answered settled; a
trail-talk / Wren line repeats verbatim in one sitting; a second
scholar death pattern (deaths > 2); revised M-PR1 > 15%;
statedAfterPick ≥ 6; hungry-at-horizon moves from 5/10 either way; any
village starts a win-plan inside 28d; a parting-hit death; a trio party
forms inside 28d.

**Bars (bind, r144 bars carried, with r144 metric-review items adopted):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket: 0 pocket fights BINDS; stuckTurns reported as watch.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1 (revised per r143 metric review item 1): never-offered among
  established ask_favor sittings ≤15%, where "established" excludes
  `resolution=unestablished` sittings regardless of final stage; raw
  analyzer rate + max per-seed never-offered reported as watch.
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
- **Mourning watch (r232):** every mourning line names the current lately
  dead; no `{mname}` or empty-name render; the same template does not
  re-serve once per corpse (count firings per template).
- **Dry-line watch (r235/r230):** 0 dry (empty-content) lines in the
  panel's transcripts.
- **FIGHTALLY2 watch:** count landing fights where a second ally joins;
  report the fight-log trigger class for each; any fight with 2 allies
  that ends zero-DMG or stuck is a Q1 failure on live data.
- **Homeward watch (r240 fix):** report end-stranded days per seed; any
  scholar stranded homeward 2+ days is a Q1 investigation item.
- Pilot first: seeds 1232–1235; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Metric-review adoptions from r144

1. **Pocket watch (adopted):** report fights with 0 scholar strikes AND
   0 scholar moves where the scholar is first in turn order (the r144
   d12 Hummice shape, below the ≥3-stuck-turn bar) — inspect every
   zero-DMG fight in the analyzer output for the unreachable shape.
   No bar change.
2. **M-PR1 away-guard:** carry as watch. The revised 1/18 already
   discounts the away-guard road lines; no metric change.
3. **Mourning watch still UNMEASURED (third panel running):** 7 deaths
   on r144, no name-bearing mourning line fired. **This run's blank:**
   write the targeted proof test (force the mourning thread, read the
   line) the way r144 closed the r231 item — do not carry the item a
   fourth time.

## Q2 — People check (M5, sense-read)

Read 5 full transcripts from the panel. Bar: each sitting shows the NPC
wanting something, options engaging or deflecting it, endings resolving /
planting / owing. No fabricated shared history, no filler loops, no static
menus. Include a mourning sitting if the panel produces one (r232 watch —
read it for the name worn and the template spread). Include a favor/repay
sitting if one fires (639bd3f41 watch — the live need stated, never the
settled line). Include a flee fight transcript if one fires (FLEEREPAIR3
watch — the leave reads as a person leaving, not a stat). Include a
warn_you sitting if the panel produces one — read it for the deepen +
'heeded' resolution. Include a resume-take sitting if the panel produces
one (Q1 watch) and read it for the re-pose AND for any drift-note tail
quoted as memory. Include a C3d recap sitting if one fires (recap naming
the live want with an empty thread log). Include a fight transcript with
a second ally if one fires — read it for whether the ally's presence
reads as a person joining, not a stat appearing.

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

- Landing panel: seeds 1232–1241, 28d, r145 driver
  (scripts/journey-landing-r145-20261118.js — r144 driver verbatim
  except header/seeds/OUTDIR).
- Corpus: `landing-r145-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-18/`).
- No threshold, bar, price, or gate changes in this run except the
  homeward watch above (proposed in r144's metric review + r240's fix).
  If the panel surfaces a further game defect, fix in the worktree with
  a proof test, or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — fix owed in the
  bridge-memory build arm with its own panel; NOT this run. Did not
  recur on r142 (verbatimRepeats 0, goal pool 1 serving, 0 repeats),
  r143, or r144.
- Fights 21 vs 12 vs 17 vs 7 vs 16 — open question, matched-band A/B
  owed (same seeds, profile-gate bypass on/off), before any claim about
  the bypass or the band. (Profilegate lever has since been reverted;
  the question may be moot — revisit if fight counts move sharply.)
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10, r142 4/10, r143 5/10 (BEFORE) / 4/10 (AFTER-FIX),
  r144 5/10 both panels.
- Stated same-day need with no commit path (r141 F1, 1189-d14) —
  design question (dawn-meet-shaped commit vs same-day accept),
  documented for Steve/design call, not fixed here. Did not recur on
  r142, r143, or r144.
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
- Lead-in nit (r139/r140/r141/r142/r143/r144): topic answers repeat
  their lead-in within a sitting. Observation only; worth a look when
  the bridge pool gets its per-sitting memory.
- R66 margin question (r142 F1): a scholar at home with a full pantry
  lived hand-to-mouth for three weeks and died on a 934-kcal nightly
  deficit. Balance/policy arm question — meal share vs daily burn for a
  Haven-bound scholar, and whether the competent policy should bank food
  during the day. Not this run.
- R240 homeward shape (seed 101401): the fix is IN this run's base;
  the watch above is the regression check, not a carry.
