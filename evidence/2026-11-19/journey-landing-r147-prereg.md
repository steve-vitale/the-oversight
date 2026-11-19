# journey-landing r147 — PREREG (Lane A, leg 0 LANDING)

**Run id:** lane-a-20261119T090508Z (scheduled Thu 2026-11-19 02:45 CST).
**Base:** local master at run start (`7235e2102`, bowopen adoption note; main moved
18dae3a93 → 7235e2102 during registration when the bowopen-fixnote release landed).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration; heartbeat loop re-armed every 10 min for the whole
run (nohup, log `~/workspace/worktrees/journey-landing-hbloop-r147.out`).
Lock: no stale lock (none present at run start); fresh lock created
2026-11-19T09:05:08Z (run_id 2026-11-19T09:04:57Z-playtest-loop-a).
Pre-flight: main tree clean, disk 45%, `git pull` already up to date;
`worktree-reap.sh` SKIPPED (registry lock held by another reaper run,
consecutive skips: 1 — not a failure; 13 trees listed, cap 16).
Registration was queued behind Lane B's journey2-social registration on
REGISTRY.lock (~4 min) and then ran `git worktree add` (~3 min, load ~8.5);
no failure, just a slow queue under a hot tree.

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1252–1261**. `grep -l "1252"` over
`evidence/*/journey-landing-*.md` + `evidence/*/sim-*-prereg.md`: zero hits.
The r146 prereg lists every used landing band: 1242–1251 (r146), 1232–1241
(r145), 1222–1231 (r144), 1212–1221 (r143), 1192–1201 (r142), 1182–1191
(r141), 1172–1181 (r140), 1162–1171 (r139), 1142–1151 (r121–r138, deliberate
reuse), 1122–1131 (r119), 1083–1092, 1073–1082, 1063–1072, 1053–1062,
1043–1052, 897–906 (contaminated), 887–896, 867–876, 857–866, 847–856,
837–846, 817–826, 797–806, 777–786. Band 1252–1261 is named in none of them.
(A full-tree `grep -rl` was abandoned after 3+ min, as on r145 — the
targeted search over landing run notes + sim preregs is the established scope.)
Band 1252–1261 is fresh.

## Q1 (PRIMARY) — regression watch on the post-r146 master, fresh band, + two r146-owed items

Since r146's base (`be0b90b41`), `src/js/` changed in 5 files
(`git diff be0b90b41..7235e2102 -- src/js/`, +125/−15). Landing-domain changes
in the watch:

- `convo-beats.js` +15/−3 — **r146's own want-bridge fix** (BRIDGES.want 6→10,
  HEED-V fix). Already in this run's base. This panel is the AFTER
  measurement: HEED-V binds at 0 (a sitting deflecting 11+ times would fire
  it again — that would be a real loop, not a pool-size problem).
- `party-wiring.js` +72 — **sim-senseexped-b** (finding #2583, GO): the
  launch-party sense reads the live expedition instead of mutable
  `winPlan[vid].party`. Env-gated (`SENSEEXPED=1`), default OFF = old sense,
  byte-identical. The driver does NOT set it, so the lever is OFF here. Any
  4-person launch or sense-shaped move on this panel is NOT attributable to
  this change; a 4-person launch with the gate off is a defect (as on r146).
- `game.js` +28 — **monsterCounterLabel** (journey-endgame r246): counter-learned
  lines name the beast via the guarded label instead of the raw display name,
  so a prose-clause descriptor ("the creek went still...") no longer stands
  where a name belongs. Landing watch: any COUNTER LEARNED line on this panel
  must use the guarded label; a clause-descriptor in a counter line is a Q1
  failure on live data. (Counters are rarely learned inside 28d; report
  0 if none fire.)
- `titans.js` +23 — **titan muster blade count** (journey-deepening r243 F2):
  the spoken refusal count and the hard gate now read the same blade count
  (unique living allies + committed Haven blades). Titans are deepening/endgame
  content, not in the 28d window. No landing signal expected.
- `build.js` 2+− — version stamp churn, no landing signal.
- `scripts/policies/competent.js` — r146's door-guard follow-up + fledBad probe
  (landed in the r146 fix commit). The panel is the second AFTER measurement:
  0 door-flee fights expected; fledBadLog samples (if any) must name their fight.

**Q1a — MAPS-POOL DRY LINES (r146 metric-review item 3, this run's fix):**
r146 found 2 bare-`...` THEM lines (1248 d6, 1250 d10), both `compare_maps`
with nothing new. Root cause, verified by reading the r146 transcripts and
the code: `compare_maps` picks the even-maps line from a **2-line** pool
(`maps:nonenew`) via `convoPick`, which filters against EVERYTHING ever said
to that villager (cross-sitting persistence). After both lines are used — in
1250 d10 by turn 12, in 1248 d6 by turn 12 — the third pick returns null and
the NULL-LINE CLASS GUARD (`conversation.js:8130`, r16) replaces it with bare
`"..."`. The villager asked to compare maps says nothing at all. Same defect
class lives in the `maps:shared` pool (3 lines): a sitting comparing maps 4+
times with new ground each time dries the same way. Fix in the same pass as
the same defect class (r146 Q1a precedent): expand `maps:nonenew` 2→6 and
`maps:shared` 3→6, existing lines kept first, same voice. Proof test
`scripts/test-journey-landing-r147-maps-pools-20261119.js` (pool6 distinct=6,
sitting3 — the exact panel shape: 3 nonenew picks in one sitting all distinct
— window, control; RED on unfixed code via the r146 pool). The panel is the
AFTER measurement for the fix: 0 dry `...` lines expected; a dry line on a
compare_maps turn is a Q1 failure.
**Q1b — LINK-ACCEPT (r146 metric-review item 12, conditional):** r146's
panel produced 1 link-raise, never accepted or declined — the r243 voiced
accept line is still untested on a landing panel. If THIS panel also produces
no accept, the driver is taught to take one (the way FAVOR_ACCEPT=1 exercises
the commit path) rather than leaving the watch untested run after run. The
decision is made AFTER the panel, not before — no driver change pre-registered.

**Interesting if:** any r146 bar moves on the fresh band; a pocket recurs
(any shape, including sub-threshold); a door-flee fight fires; a fledBad
sample fires with an unpinnable fight; an accepted link-raise parrots; a
scholar ends stranded homeward for 2+ days; a favor with a live need is
answered settled; a trail-talk / Wren line repeats verbatim in one sitting;
a second scholar death pattern (deaths > 2); revised M-PR1 > 15%;
statedAfterPick ≥ 6; hungry-at-horizon moves from 5/10 either way; any
village starts a win-plan inside 28d; a parting-hit death; a trio party forms
inside 28d; a 4-person launch fires with the env gate off; a dry `...` line
on any turn; a COUNTER LEARNED line naming a prose-clause descriptor.

**Bars (bind, r146 bars carried):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS under the REVISED metric (r145 adoption): bind
  B-shape (a fight where the scholar never got a turn or never struck AND
  the monster never acted is not a pocket by itself) and EXCLUDE
  routed-at-start fights. Raw zero-DMG reported as watch.
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
- **Dry-line watch (r146 item 3, now the Q1a fix): 0 dry (empty-content)
  lines in the panel's transcripts.** Any dry line is a Q1 failure on live
  data (the fix's AFTER measurement).
- **FIGHTALLY2 watch:** count landing fights where a second ally joins;
  report the fight-log trigger class for each; any fight with 2 allies
  that ends zero-DMG or stuck is a Q1 failure on live data.
- **Homeward watch (r240 fix):** report end-stranded days per seed; any
  scholar stranded homeward 2+ days is a Q1 investigation item.
- **Door-flee watch (Q1a r146):** 0 fights ending 'fled' where the scholar's
  last step was onto a door tile; the zero-DMG/B-shape analyzer plus the
  fight-log `player-move` entries adjudicate.
- **Link-accept watch (r243 fix):** every accepted link-raise talk ends
  with a voiced accept line (never the player's choice label verbatim).
  If 0 accepts fire, Q1b above (teach the driver) is the closeout.
- **Counter-label watch (r246 fix):** every COUNTER LEARNED line on the
  panel uses the guarded label (no prose-clause descriptor as a name).
- Pilot first: seeds 1252–1255; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Metric-review adoptions from r146

1. **HEED-V bar — keep at 0.** (r146 item 1.)
2. **Want-insistence question (design, not a metric).** After repeated
   deflection, should a pending want re-assert itself instead of handing the
   floor back? The [alive:thread:want] menu already re-surfaces it (1250 d9
   proves it works). No change proposed here; note it for the conversation arm.
3. **Dry "..." lines — OWED THIS RUN (Q1a above).** Fix + proof test + panel
   as AFTER measurement.
4. **Deflect-fallback — carry as watch.** Same sitting as the dry lines on
   r146 (1250 d10 turn 23): "I just said — did you miss it?" fires right
   after the "..." map beat — Wei hadn't just said anything about maps.
   Watch whether the fallback still mis-fires once the dry line is gone.
5. **fledBad twitchiness.** The 70%-rule fired on a 32-HP mosquito at 62% HP
   (1244 d21). Question for the next run: should the outmatched legs have a
   minimum monster-threat floor, or is a twitchy walk-away the correct
   behavior for a competent player? No change proposed here.
6. **Hungry-at-horizon 1→5 (watch move).** r145: 1/10; r146: 5/10. Report as
   a watch move; do NOT over-claim a cause. History: r137/r138 4/10, r139
   6/10, r140 6/10, r141 5/10, r142 4/10, r143 5/10→4/10, r144 5/10, r145
   1/10, r146 5/10. No lever changed in the food path this run (foodgate
   instrumentation is record-only). Keep watching.
7. **Fights 10 vs 21 (r145).** Sharp drop, in the same volatile range as the
   carried open question (21 vs 12 vs 17 vs 7 vs 16). No claim made; the
   matched-band A/B is still owed before any claim about fight frequency.
8. **Together-blocked breaks (8, +2 in R71's count of 10).** Outings that go
   out together and come back with 0 kcal break the favor — "You carry 0
   kcal; your partner carries 0 kcal." Several kept favors (delivered,
   thanked) still carry the break reason in the ledger, which looks like a
   counting quirk rather than a real break. Worth one look by the outing arm:
   does a kept favor keep its break flag, and should a 0-yield together-outing
   break at all?
9. **Win-plan early start (2 seeds at d14).** First time plans seed inside
   the landing window. Positive signal; watch whether it holds on the next band.
10. **R68 PARTY offers 4→8, accepted 1→5.** The r145 watch (fewer offers)
    reversed; no verdict, just the move.
11. **M-PR1 statedAfterPick 5 (r145: 4), all honest away-guard road lines.**
    Watch holds.
12. **Link-accept watch still UNTESTED — OWED THIS RUN (Q1b above).** No
    accepted link-raise on r146 (1 raise fired, neither accepted nor
    declined). The r243 accept-line pool variety question (same first pick
    every fresh run) is still open for the same reason.

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
(r243 watch). Include a compare_maps sitting if one fires with 3+ compares
— read it for the new pool lines (Q1a AFTER).

## Q3 — Telemetry

`telemetry-check.js` on the panel vs
`telemetry-baselines/landing-split.json` (re-pinned r136: 81/9/217/15/0).
LOUD lines are same-run investigation items. Baseline is NOT rolled
unless the panel carries new information.

## Q4 — Gate

`node scripts/check.js --quick` in the worktree
(`--cacheDirectory=/tmp/jest-cache-playtest`); adjudicate every failure
against pristine HEAD. 0 attributable is the bar. Never run concurrent jest
with a sibling gate (phantom-failure rule — wait if one is running).

## Policies / seeds

- Landing panel: seeds 1252–1261, 28d, r147 driver
  (scripts/journey-landing-r147-20261119.js — r146 driver verbatim
  except header/seeds/OUTDIR).
- Corpus: `landing-r147-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-19/`).
- Analyzers: the 15 standing analyzers (r144/r145/r146 order) via
  `evidence/2026-11-19/journey-landing-r147-analyzers.sh`.
- No threshold, bar, price, or gate changes in this run except the Q1a
  maps-pool fix above (applied before the panel, panel is the AFTER
  measurement). If the panel surfaces a further game defect, fix in the
  worktree with a proof test, or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — fix owed in the
  bridge-memory build arm with its own panel; NOT this run. Did not
  recur on r142, r143, r144, r145, or r146.
- Fights 21 vs 12 vs 17 vs 7 vs 16 — open question, matched-band A/B
  owed (same seeds, profile-gate bypass on/off), before any claim about
  the bypass or the band. (Profilegate lever has since been reverted;
  the question may be moot — revisit if fight counts move sharply.)
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10, r142 4/10, r143 5/10 (BEFORE) / 4/10 (AFTER-FIX),
  r144 5/10 both panels, r145 1/10, r146 5/10.
- Stated same-day need with no commit path (r141 F1, 1189-d14) — design
  question (dawn-meet-shaped commit vs same-day accept), documented for
  Steve/design call, not fixed here. Did not recur on r142, r143, r144,
  r145, or r146.
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
- Lead-in nit (r139/r140/r141/r142/r143/r144/r145/r146): topic answers repeat
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
- R146 infrastructure (carried): runtime restart killed a panel
  mid-seed; registry-lock jam (22-min `git status` under load 17.87)
  stalled all heartbeats ~23 min. The standing heartbeat loop is the
  mitigation; the reaper's per-tree `git status` cost under load is the
  thing to look at (reaper owner / ship loop).
