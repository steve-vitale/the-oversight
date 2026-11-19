# journey-landing r148 — PREREG (Lane A, leg 0 LANDING)

**Run id:** lane-a-20261119T164116Z (scheduled Thu 2026-11-19 09:45 CST).
**Base:** local master `0aa413222` (journey-scale r245 note; `git pull` already up to date at run start).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration; heartbeat loop re-armed every 5 min for the whole
run (nohup, log `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-landing-r250-heartbeat.log`).
Lock: none present at run start; fresh lock created 2026-11-19T16:41:16Z
(run_id 2026-11-19T16:41:16Z). Pre-flight: main tree clean, disk 49%,
`worktree-reap.sh` ran (12/16 active; 4 trees with uncommitted changes
belong to other loops — never touched). Registration took ~6 min
(`git worktree add` reset under load); no failure.

## Seed-band freshness check (local_seed_band_freshness)

Candidate band **1262–1271**. `grep -l "1262"` over
`evidence/*/journey-landing-*.md` + `evidence/*/sim-*-prereg.md`: one hit,
`evidence/2026-11-14/sim-transplant16-prereg.md:305` — a diff line count
("+1262, living-garden-deed-attainment-panel.log +16"), not a seed. No
landing run note or sim prereg names seeds 1262–1271. The r147 prereg lists
every used landing band: 1252–1261 (r147), 1242–1251 (r146), 1232–1241
(r145), 1222–1231 (r144), 1212–1221 (r143), 1192–1201 (r142), 1182–1191
(r141), 1172–1181 (r140), 1162–1171 (r139), 1142–1151 (r121–r138,
deliberate reuse), 1122–1131 (r119), 1083–1092, 1073–1082, 1063–1072,
1053–1062, 1043–1052, 897–906 (contaminated), 887–896, 867–876, 857–866,
847–856, 837–846, 817–826, 797–806, 777–786. Band 1262–1271 is fresh.

## Q1 (PRIMARY) — regression watch on the post-r147 master, fresh band, + two r147-owed items

Since r147's base (`7235e2102`), `src/js/` changed in 6 files
(`git diff 7235e2102..0aa413222 -- src/js/`, +317/−5). Landing-domain changes
in the watch:

- `conversation.js` +49 — **r147's own maps-pool fix** (in base; this panel
  is the second AFTER measurement: 0 dry `...` lines expected). **Social
  r238 FALLBACK-STRUCTURAL**: the last-resort fallback ("Okay. Here's the
  thing —") is exempt from the run-ledger block, so a ledger-blocked
  fallback no longer dries to "...Sorry, lost my train of thought."
  (wild, seed 45752). Same bar as the maps fix: 0 dry lines.
  **Deepening r244 F8 confide-line secret gate**: the cautious "This stays
  between us, right? Right." exit is filtered out of the closing pool
  unless a secret was shared (`c.secretShared`). Landing watch: any
  confide exit closing a sitting where no secret was shared is a Q1
  failure on live data (grep transcripts + read the sitting).
- `fieldFights.js` +18 — **sim-speargate-a #2593 ammo naming**: the volley
  log now names the weapon's ACTUAL ammo ("has a bow but no arrows" →
  "has a searcaster but no fusion cells", etc.; unknown ammo falls back
  to "arrows"). Landing watch: any volley log line naming the wrong ammo
  for the weapon is a Q1 failure on live data.
- `equipment.js` +23 — **`volleyWeaponOf`** (speargate): pure read, no
  behavior change by itself. No signal expected.
- `game.js` +225 / `villager-agency.js` +5 — **VILLAGER STAGE BOW**
  (sim-bowopen-a, finding #2544) + SPEARGATE bits. Env-gated (`BOWOPEN=1`),
  off is byte-identical old behavior. The driver does NOT set it, so the
  lever is OFF here. Any 4-person launch or bow-staged volley on this
  panel is NOT attributable to this change; a 4-person launch with the
  gate off is a defect (as on r146/r147).
- `build.js` — version stamp churn, no landing signal.

**Q1a — MOURNING BEAT (r147 metric-review item 14, this run's driver change):**
the mourning option was offered twice on r147 (1260 d6, Ella) but the
probe driver paged past it both times, so the beat's name-wearing and
template spread stay untested. The driver already carries the instrument:
`MOURN_PROBE` (r16) takes `alive:event:mourning` when a death happened in
the last 2 game days — it was OFF on r147. **This run's driver defaults it
ON** (driver-only change, zero src/js; env override still available).
If a mourning sitting fires, read it in full: does the spoken beat name
the dead, and does the template spread hold?
**Q1b — LINK-ACCEPT (r146 item 12 / r147 item 12, this run's driver change):**
r147 produced 0 link-raises (third panel ≤1: r145 16, r146 1, r147 0) and
diagnosed the binding gate as the standing-drive weight (0 villagers ≥1
at d28 on the probed seed). **This run's driver adds LINK_PROBE**
(driver-only, zero src/js): `pickVillager` prefers a villager with a
pending linkRaise talk request (raises expire in 2 days — the old
fresh-faces-first pick could let one expire unheard), and `pickChoice`
takes `link:accept` when offered (same shape as INVITE_PROBE), counted
as `MET.linkAcceptTakes`. If a raise fires and is accepted, the accept
line must be voiced, never the player's choice label verbatim (r243
watch). **If this panel also produces 0 raises, per r147 metric-review
item 12 the question goes to Steve with the diagnosis attached** — the
probe is re-run on a panel seed to confirm the gate numbers on the new
band, and the run note carries the question, not another silent carry.

**Interesting if:** any r147 bar moves on the fresh band; a pocket recurs
(any shape, including sub-threshold); a door-flee fight fires; a fledBad
sample fires with an unpinnable fight; an accepted link-raise parrots; a
scholar ends stranded homeward for 2+ days; a favor with a live need is
answered settled; a trail-talk / Wren line repeats verbatim in one sitting;
a second scholar death pattern (deaths > 2); revised M-PR1 > 15%;
statedAfterPick ≥ 6; hungry-at-horizon moves from 4/10 either way; any
village starts a win-plan inside 28d; a parting-hit death; a trio party forms
inside 28d; a 4-person launch fires with the env gate off; a dry `...` line
on any turn; a COUNTER LEARNED line naming a prose-clause descriptor; a
confide exit with no secret shared; a volley line naming the wrong ammo;
a mourning beat that names no one or reads as template filler.

**Bars (bind, r147 bars carried):**
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
- **Dry-line watch: 0 dry (empty-content) lines in the panel's transcripts.**
  Any dry line is a Q1 failure on live data (maps-pool + fallback-structural
  AFTER measurement).
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
  If 0 accepts fire, Q1b above (question to Steve) is the closeout.
- **Counter-label watch (r246 fix):** every COUNTER LEARNED line on the
  panel uses the guarded label (no prose-clause descriptor as a name).
- **Confide watch (r244 F8):** no "This stays between us, right? Right."
  closing a sitting where no secret was shared.
- **Ammo-name watch (#2593):** every volley "has no X" line names the
  weapon's actual ammo.
- Pilot first: seeds 1262–1265; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Metric-review adoptions from r147

1. **HEED-V bar — keep at 0.** Holds on its second full panel.
2. **Dry-line bar — keep at 0.** Maps-pool fix holds (0 dry lines); this
   panel is the second AFTER measurement, plus the fallback-structural
   fix's first.
3. **Want-insistence question (design, not a metric).** Carried: after
   repeated deflection, should a pending want re-assert itself instead of
   handing the floor back? The [alive:thread:want] menu already re-surfaces
   it (1253 d10 proves it works). No change proposed here.
4. **Deflect-fallback — CLOSED as a watch (r147 item 4).** "I just said" 0×
   on r147. Drop the watch unless it recurs — it stays in the bar list
   above as a 0-count check, not a carried investigation.
5. **fledBad twitchiness.** The minimum-threat-floor question (r146 item 5)
   stays open, unmeasured.
6. **Hungry-at-horizon 5→4 (watch move).** r145: 1/10; r146: 5/10; r147: 4/10
   at d28 entries. Report as a watch move; do NOT over-claim a cause.
   History: r137/r138 4/10, r139 6/10, r140 6/10, r141 5/10, r142 4/10,
   r143 5/10→4/10, r144 5/10, r145 1/10, r146 5/10, r147 4/10. No lever
   changed in the food path this run. Keep watching.
7. **Fights 10→8 (r146→r147).** Still in the volatile range (21 vs 12 vs 17
   vs 7 vs 16 vs 10 vs 8). No claim made; the matched-band A/B is still
   owed before any claim about fight frequency.
8. **Together-blocked breaks (9, all "carry 0 kcal").** Same shape as r146
   item 8. Worth one look by the outing arm: does a kept favor keep its
   break flag, and should a 0-yield together-outing break at all?
9. **Win-plan early start (2 seeds at d14 → 0).** The r146 signal did not
   hold on this band. Positive signal downgraded to noise; watch whether
   it ever recurs.
10. **R68 PARTY offers 8→6, accepted 5→2.** The r146 high reversed; no
    verdict, just the move.
11. **M-PR1 statedAfterPick 5→0.** Watch holds; the away-guard road line did
    not fire once on r147.
12. **Link-accept watch still UNTESTED — OWED THIS RUN (Q1b above).** If
    this panel also produces 0 raises, the question goes to Steve with the
    diagnosis attached (r147 item 12 — this run is the trigger).
13. **Resume-take re-pose — OBSERVED, PASS (r147).** The analyzer still
    prints no resume-take count; the count, if wanted, is a tooling
    addition for the analyzer arm, not this run.
14. **Mourning beat — OWED THIS RUN (Q1a above).** MOURN_PROBE defaults ON
    in the r148 driver.

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
— read it for the new pool lines (Q1a re-verify). Include a confide-exit
sitting if one fires — read it for whether a secret was actually shared.

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

- Landing panel: seeds 1262–1271, 28d, r148 driver
  (scripts/journey-landing-r148-20261119.js — r147 driver verbatim
  except header/seeds/OUTDIR + MOURN_PROBE default ON + LINK_PROBE).
- Corpus: `landing-r148-after` under the goal hidden_files evidence
  dir (`evidence/2026-11-19/`).
- Analyzers: the 15 standing analyzers (r144/r145/r146/r147 order) via
  `evidence/2026-11-19/journey-landing-r148-analyzers.sh`.
- No threshold, bar, price, or gate changes in this run except the two
  driver-only probes above (MOURN_PROBE default ON, LINK_PROBE). If the
  panel surfaces a further game defect, fix in the worktree with a proof
  test, or document and carry.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (r141 F2) — fix owed in the
  bridge-memory build arm with its own panel; NOT this run. Did not
  recur on r142, r143, r144, r145, r146, or r147.
- Fights 21 vs 12 vs 17 vs 7 vs 16 — open question, matched-band A/B
  owed (same seeds, profile-gate bypass on/off), before any claim about
  the bypass or the band. (Profilegate lever has since been reverted;
  the question may be moot — revisit if fight counts move sharply.)
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10, r142 4/10, r143 5/10 (BEFORE) / 4/10 (AFTER-FIX),
  r144 5/10 both panels, r145 1/10, r146 5/10, r147 4/10.
- Stated same-day need with no commit path (r141 F1, 1189-d14) — design
  question (dawn-meet-shaped commit vs same-day accept), documented for
  Steve/design call, not fixed here. Did not recur on r142, r143, r144,
  r145, r146, or r147.
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
- Lead-in nit (r139/r140/r141/r142/r143/r144/r145/r146/r147): topic
  answers repeat their lead-in within a sitting. Observation only; worth
  a look when the bridge pool gets its per-sitting memory.
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
- R147 infrastructure (carried): registration queue (~7 min, REGISTRY.lock
  held by Lane B); `git worktree add` ~3 min under load ~8.5; VM restart
  ~08:11Z preceded the run. The standing heartbeat loop is the mitigation.
