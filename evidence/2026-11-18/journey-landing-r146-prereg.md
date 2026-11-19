# journey-landing r146 — PREREG (Lane A, leg 0 LANDING)

**Run id:** lane-a-20261119T012424Z (scheduled Wed 2026-11-18 18:45 CST).
**Base:** local master at run start (`be0b90b41`, journey-scale r243 closeout).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration; heartbeat loop re-armed every 10 min for the
whole run (nohup, log `~/workspace/worktrees/journey-landing-hbloop-r146.out`).
Lock: no stale lock (none present at run start); fresh lock created
2026-11-19T01:24:24Z (run_id lane-a-20261119T012424Z). Pre-flight: main tree
clean, disk 47%, `git pull` already up to date; `worktree-reap.sh` ran
(11/16 active; 4 trees with uncommitted changes belong to other owners —
left alone).

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1242–1251**. `git grep "1242"` over
`evidence/*/journey-landing-*.md` hits only
`evidence/2026-11-16/journey-landing-r140.md:356` — "pid 12423", a process
ID, not a seed. `git grep "1242–1251" / "1242-1251"` over evidence/ — zero
hits. `git log --grep="1242"` hits are version-bump strings
(e33315442-20261027-112424, efdfd56c9-20261024-112420) — noise. No landing
prereg or run note names seeds 1242–1251. Landing preregs name bands
1232–1241 (r145), 1222–1231 (r144), 1212–1221 (r143), 1192–1201 (r142),
1182–1191 (r141), 1172–1181 (r140), 1162–1171 (r139), 1142–1151
(r121–r138, deliberate reuse), 1122–1131 (r119), 1083–1092, 1073–1082,
1063–1072, 1053–1062, 1043–1052, 897–906 (contaminated), 887–896,
867–876, 857–866, 847–856, 837–846, 817–826, 797–806, 777–786. Band
1242–1251 is fresh; no prereg, forbidden list, or contaminated list names
it.

## Q1 (PRIMARY) — regression watch on the post-r243 master, fresh band, + two r145-owed items

Since r145's base (`a48b2405c`), `src/js/` changed in 6 files
(`git diff a48b2405c..be0b90b41 -- src/js/`, +350/−56).
Landing-domain changes in the watch:

- `bond-initiation.js` +69 — **r243 linkAcceptLine** (raise-accept echo
  fix): accepted link-raise talks now answer with a voiced line keyed to
  the lore `how`, never the player's choice label verbatim. Landing
  window: raise talks fire from d12 on (r145 had 16). Watch: any accepted
  talk on this panel shows the voiced line; a parroted accept is a Q1
  failure on live data.
- `fieldFights.js` +44, `godpath.js` +48 — **sim-foodgate-instr-a**
  FOODGATE-INSTR: record-only food-gate flags on the encounter row
  (foodTier / hungerStart / tier-blocked / pay-blocked / rageFired). No
  engine code reads them back; no behavior change. Watch: fight records
  carry the new fields; any behavior-shaped move in fight counts is NOT
  attributable to this change.
- `villager-brain.js` +56 — **PARTYSIZE4** (sim-partysize4-b): third
  companion pick + launch for wave-4-target plans. Env-gated
  (`PARTYSIZE4=1`); the driver does NOT set it, so the lever is OFF
  here. Any 4-person launch on this panel would be a defect.
- `win-plan.js` +187 — win-plan depart-path work (sim-winplandepart-b
  family). Landing watch: win-plan holders at d14/d28 (r145: 0 at d14, 4
  holders on 1241 only at d28).
- `build.js` 2+- — version stamp churn, no landing signal.

**Q1a — DOOR-GUARD FOLLOW-UP (r145 metric-review item 8, this run's
fix):** r145 fixed the door-step defect class in `closeStep` and
`beastDodgeMove` (shared `isDoorTile` helper). The same class lives in
two more fight-step sites, which did not fire on the r145 panel:
`beastStrikeTarget` (the strike-approach walk — its stepped tile is a
`findPath` prefix step, which can cross a door even when the destination
is not one) and the `move_x2` trick pick (direct `tbPlayerMove` to a
`beastFreeTiles` candidate, which includes door tiles). The same shape
also lives in the `keep_distance` trick pick (direct `tbPlayerMove` to a
candidate) — fixed in the same pass as the same defect class, not left
as a known hole. Evidence check first: `tbPlayerMove` flees only when
the move ENDS on a door tile (game.js FLEE BY DOOR reads the final cell
after the path walk), so the guard is: never let a fight step END on a
door tile — skip door-tile destinations AND clamp the walked prefix
before the first door tile. Fix in `scripts/policies/competent.js`
(driver-only, no src/js change), proof test
`scripts/test-journey-landing-r146-door-followup-20261118.js` (RED on
unfixed policy via stash-swap, GREEN with the fix). The panel is the
AFTER measurement for the fix: 0 door-flee fights expected; a fled
fight whose scholar stepped on a door tile is a Q1 failure.
**Q1b — fledBad PROBE (r145 metric-review item 7, this run's blank):**
r145 recorded fledBad=1 with the firing fight unpinned ("the legacy
outmatched block, turn-1, gate COMPETENT_FIGHT_ASSESS off"). Instrument
the single increment site (`competent.js`, the legacy outmatched block)
to push a sample into `ctx.fledBadLog` — day (from
`Game.state.scholar.day`), totalMhp, maxWave, hpPct, pmax, monster
id/hp/maxHp — and have the r146 driver dump it into the per-seed census
JSON. The probe closes the item by NAMING the fight (matched to the
census `fights81` record by day + monster HP) or by reporting fledBad=0
with the instrument proven live (a forced-outmatched unit case in the
proof test). Record-only; no behavior change.

**Interesting if:** any r145 bar moves on the fresh band; a pocket
recurs (any shape, including sub-threshold); a door-flee fight fires; a
fledBad sample fires with an unpinnable fight; an accepted link-raise
parrots; a scholar ends stranded homeward for 2+ days; a favor with a
live need is answered settled; a trail-talk / Wren line repeats verbatim
in one sitting; a second scholar death pattern (deaths > 2); revised
M-PR1 > 15%; statedAfterPick ≥ 6; hungry-at-horizon moves from 1/10
either way; any village starts a win-plan inside 28d; a parting-hit
death; a trio party forms inside 28d; a 4-person launch fires with the
env gate off.

**Bars (bind, r145 bars carried, with r145 metric-review item 2
ADOPTED):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS under the REVISED metric: bind B-shape (a
  fight where the scholar never got a turn or never struck AND the
  monster never acted is not a pocket by itself) and EXCLUDE
  routed-at-start fights (a monster that flees at the face-off ends the
  fight before any turn exists). Raw zero-DMG reported as watch.
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
- **Dry-line watch (r235/r230):** 0 dry (empty-content) lines in the
  panel's transcripts.
- **FIGHTALLY2 watch:** count landing fights where a second ally joins;
  report the fight-log trigger class for each; any fight with 2 allies
  that ends zero-DMG or stuck is a Q1 failure on live data.
- **Homeward watch (r240 fix):** report end-stranded days per seed; any
  scholar stranded homeward 2+ days is a Q1 investigation item.
- **Door-flee watch (Q1a):** 0 fights ending 'fled' where the scholar's
  last step was onto a door tile; the zero-DMG/B-shape analyzer plus the
  fight-log `player-move` entries adjudicate.
- **Link-accept watch (r243 fix):** every accepted link-raise talk ends
  with a voiced accept line (never the player's choice label verbatim).
- Pilot first: seeds 1242–1245; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Metric-review adoptions from r145

1. **Pocket watch (adopted r144, carried):** report fights with 0
   scholar strikes AND 0 scholar moves where the scholar is first in
   turn order. Keep the watch.
2. **Zero-DMG metric revision — ADOPTED (r145 item 2):** bind B-shape /
   exclude routed-at-start fights, as above.
3. **M-PR1 away-guard — CARRIED as watch:** statedAfterPick = 4 on
   r145, all four the honest away-guard road line. Keep watching that
   the line stays honest.
4. **Mourning — CLOSED by proof test on r145.** No further panel watch
   unless the menu path changes.
5. **Hungry-at-horizon 5→1 — watch move:** only seed 1241 hungry at
   d28 on r145. Report as a watch move; do NOT over-claim a cause.
6. **R68 PARTY offers 11→4 — watch:** fewer party offers than r144,
   accepted 1. Not a bar — watch, not a verdict.
7. **fledBad=1 — OWED THIS RUN (Q1b above).** Close by naming the
   fight or by a proven-live zero.
8. **beastStrikeTarget / move_x2 door shape — OWED THIS RUN (Q1a
   above).** Fix + proof test + panel watch.

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
reads as a person joining, not a stat appearing. Include an accepted
link-raise talk if one fires — read it for the voiced accept line
(r243 watch).

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

- Landing panel: seeds 1242–1251, 28d, r146 driver
  (scripts/journey-landing-r146-20261118.js — r145 driver verbatim
  except header/seeds/OUTDIR + the fledBadLog census dump).
- Corpus: `landing-r146-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-18/`).
- No threshold, bar, price, or gate changes in this run except the
  zero-DMG metric revision adopted above (proposed in r145's metric
  review). If the panel surfaces a further game defect, fix in the
  worktree with a proof test, or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — fix owed in the
  bridge-memory build arm with its own panel; NOT this run. Did not
  recur on r142 (verbatimRepeats 0, goal pool 1 serving, 0 repeats),
  r143, r144, or r145.
- Fights 21 vs 12 vs 17 vs 7 vs 16 — open question, matched-band A/B
  owed (same seeds, profile-gate bypass on/off), before any claim about
  the bypass or the band. (Profilegate lever has since been reverted;
  the question may be moot — revisit if fight counts move sharply.)
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10, r142 4/10, r143 5/10 (BEFORE) / 4/10 (AFTER-FIX),
  r144 5/10 both panels, r145 1/10.
- Stated same-day need with no commit path (r141 F1, 1189-d14) —
  design question (dawn-meet-shaped commit vs same-day accept),
  documented for Steve/design call, not fixed here. Did not recur on
  r142, r143, r144, or r145.
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
- Lead-in nit (r139/r140/r141/r142/r143/r144/r145): topic answers repeat
  their lead-in within a sitting. Observation only; worth a look when
  the bridge pool gets its per-sitting memory.
- R66 margin question (r142 F1): a scholar at home with a full pantry
  lived hand-to-mouth for three weeks and died on a 934-kcal nightly
  deficit. Balance/policy arm question — meal share vs daily burn for a
  Haven-bound scholar, and whether the competent policy should bank food
  during the day. Not this run.
- R240 homeward shape (seed 101401): the fix is IN this run's base;
  the watch above is the regression check, not a carry.
- Accept-line pool variety (r243 metric review item 2): the r243 fix's
  pool has 2 lines per `how`, but the scale band showed the same line
  9/9 — every fresh run opens with the same first pick. The ledger
  rotation is proven by the unit test; cross-run variety is unproven.
  Watch on this panel: if an accepted link-raise talk fires, record
  which line served.
