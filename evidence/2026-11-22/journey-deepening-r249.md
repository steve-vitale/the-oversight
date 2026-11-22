# journey-deepening r249 — run note (2026-11-22)

- Run: r249, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100)
- Run id: playtest-20261122T0045Z (scheduled Sun 2026-11-22 00:45 CST)
- Base: local master `e67224635` (Loop A 0215Z adoption round record)
- Branch: `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`
- Rotation read `2` (deepening); write `2→3` at closeout with read-back
- Policy: competent + MUSTER POLICY (r227 verbatim + r236 growth amendment + r237 F1/F2 + r238 stand-down) + MARCH STEP (r228 verbatim)
- Seeds: panel 105071–105078 (8 seeds); probe seed 105079 (dedicated, NOT scored in panel metrics — Q1-probe only). Band verified fresh: 0 hits in `evidence/*-prereg.md`, evidence filenames, and git log. Nearest named bands 105061–105069 (r248), 105101.
- Prereg: `evidence/2026-11-22/journey-deepening-r249-prereg.md` (this note adjudicates against it; metric binding applies — a miss is NO-GO, never re-scored mid-run)
- Adoption: the 00:45 CST occurrence timed out at 08:41Z after ~2h without running the pilot or panel (flap-blocked registration, then a machine restart). This adoption finished the run from the occurrence's forked driver/analyzer/tests (proofs re-run green: analyzer 106/106, muster 41/41, march 11/11).

## Pre-registration (from `journey-deepening-r249-prereg.md`)

- **Q1 (primary, regression bar): growth-line honesty.** Bar: 0 bad lines; every growth call harvests exactly or cools honestly. Descriptive: does the "enough, if the morning holds" clause fire in the wild (r246: 2× honest; r247: 0; r248: 1× honest)? Does the cooled path fire (r245/r246/r247/r248: 0)?
- **Q2 (descriptive, NO bar): the wave-5 kill wall, fifth measurement.** r245: 3/8 unlocked, 2/3 faced, 0 kills. r246: 2/8 unlocked, 0/2 faced, 0 kills. r247: 0/8 unlocked. r248: 1/8 unlocked, never faced, 0 kills. Report `summarizeWave5` classes + party sizes. Descriptive sub-watches: march-arrived-no-fight recurrence (r248 105061 sat 9 days blocked at 4,4); march-flee recurrence (r246 7× loop, r247 single flee, r248 0 fled); PLANWAKE ignition (new instrument: `winPlanEnd` snapshot + Q2-WINPLAN panel); departbeat-b (new default-ON departure beat on wave-4+ launches).
- **Q3 (descriptive — NO bar): the bow watch, FIXED instrument.** Expected: `weapon_teach` = 0 (flag off).
- **Q4: people check.** Read 1–2 full transcripts from convo days 45/60/80; judge sense, not counts. Watch: (a) warn_you heed speaking the warning, (b) settled-help naming the favor, (c) closing-line duplication FIFTH sighting (Modhi r245, Noah r246, Esteban + Rafael r248 — named recurring defect), (d) link-raise opener variety, (e) staged-witness sitting, (f) Tashi favor-whiplash recurrence, (g) NEW searcaster-volley-as-gun narration + departbeat departure beat.
- **Q5: census + reachable / fun / winnable.**

## Rotation race (recorded in the prereg)
Deepening r248's closeout wrote rotation `2→3`, but the establishment r265 closeout overwrote it with a stale `1→2` write — its run had read `1` before deepening r248 closed out. Same race shape as r247/r248. This run re-plays deepening (r249) on the file's current read of `2`.

## What changed in the game (base delta vs r248's panel base `b6aad8942`, src/js +916/−76, 12 files)

- journey establishment r265 (`52bbec5e6`): **PLANWAKE** — win-plan ignites on establishment [needs-eyes]. **LIVE**: plans that never ignited before may now ignite during the deepening window. Q2 watches launches (and wave-4 kills by villagers). BEARER-END + DEPARTCOUNT in the same landing (dead-bearer close, departures counted).
- sim-searvoice-a (`b5fb12e10`): searcaster volley reads as a gun, not a bow [needs-eyes]. **LIVE** narration change; Q4 watches.
- journey-crisis r262/r263 + journey-landing r152 (`conversation.js` +58, `convo-wants.js` +19): stuck-key flee counter, sitting-favor settled-closer gate, namebeast opens the just-told beast, settled re-ask names the favor. **LIVE** dialogue changes; Q4 watches. No closing-line-duplication fix in this delta (defect stands).
- journey-scale r249 (`59339acbb`): owed-walk fix + **march route-around** [needs-eyes] + sim-departbeat-b (`e5c8b4633`): ordinary wave-4+ departure beat, default-ON + sim-profilegate-b (`84e57fcc3`): scoped profile-gate relaxation for wave-4+ plan holders (GO) [needs-eyes]. March route-around is the direct answer to r248's arrived-no-fight shape (105061 sat 9 days blocked at 4,4); Q2 watches whether it recurs.
- build.js +2 — version bump only.
- Net-zero / instrument-only arms (reverted levers, evidence kept): sim-tier4gate-a (NO-GO), sim-tier4access-a (NO-GO), sim-tier4pool-a (lever + instrument), sim-killlootbundle-a, M1RANGE (reverted). No live behavior change from these.

## Tooling (r249 forks)

- Driver `scripts/journey-deepening-r249-20261122.js` (r248 fork: seed band, tag r249, EVIDIR 2026-11-22). Policy, instruments, probe staging unchanged. PLUS the r249 `winPlanEnd` snapshot (Q2-PLANWAKE instrument).
- Analyzer `scripts/analyze-journey-deepening-r249-20261122.js` (r248 fork: EVIDIR 2026-11-22, probe-file regex r249). PLUS `summarizeWinPlan` + Q2-WINPLAN panel line (gated on field presence).
- Proof tests forked from r248: analyzer **106/106**, muster **41/41**, march **11/11**. All GREEN before the panel was judged (re-run green by the adoption).
- Panel: all 9 seeds in one process (~15 min wall; seed 105078 alone took ~8 min of it). No pilot run as a separate process — see Infrastructure for why the panel is a re-run.

## Infrastructure — flap-killed first attempt, full re-run

- **Write flap window 08:57–~09:31Z (~34 min, boot 87ed2c33):** the first panel attempt (launched 08:45Z, after the earlier 06:32–07:59Z window cleared) ran 7 seeds clean, then seed 105078's JSON write failed after retries — `SEED 105078 FATAL: seed JSON write failed after retries` — leaving a 0-byte JSON husk plus 16 zero-byte transcripts (08:49–08:57). The probe seed's JSON (759,545 bytes) landed in a breather at 09:00, but 5 of its transcripts are 0-byte husks from the same window. The flap-watchdog owns reporting this window; the adoption's concern is the evidence.
- **Recovery:** all 22 zero-byte husks deleted (unlink works during a flap; the EMPTY-FILE TRAP from the prereg — never leave an empty file behind for a retry to rewrite). Machine replaced ~09:31Z (new boot db346c9b); writes verified OK 3× over 60s; heartbeat re-secured 09:32:08Z; hbloop relaunched.
- **Full re-run, one process, all 9 seeds (09:33–09:44Z):** the re-run is the scored panel. Its 8 shared DONE lines (seeds 105071–105077 + probe 105079) are **byte-identical** to the first attempt's — the driver is deterministic per seed across processes. The r248 pilot/panel probe drift therefore has another cause (noted in Metric review); it did not recur here in the cross-process sense.
- **Heartbeat:** stale 08:46:32–09:32:08Z during the flap (registry writes EPERM) — the tree was protected by its untracked files (reaper never touches dirty trees) and no reaper run removed anything. Hbloop relaunched post-restart (10-min cadence).
- **Gate log:** `hidden_files/evidence/2026-11-22/journey-deepening-r249-gate.log` (see Infrastructure at the end of this note).

## Results — panel (8 seeds; 5 survived day 99–101, 3 village-lost)

| Question | Verdict | Numbers |
|---|---|---|
| Q1 growth-line (primary) | **GROWTH-LINE-GO** | poolDays=17 lineDays=14 badLines=0 repeatLines=0 growthCalls=14 harvestMismatch=0 havenMismatch=0 cooledDays=0 cooledCalls=0 |
| Q1 "enough" clause | **fired 1×, honest** | 105075 d74: line promised 10 of 10 ("enough, if the morning holds"); call harvested exactly; muster reached 10 on d75 |
| Q1 cooled path | **still 0 in the wild** | 0 cooled days/calls; stands on the 28/28 unit proof |
| Q2 wave-5 wall | **MOVED: first kill** | unlocked=2 (105071 d69, 105073 d94), faced=2, killed=1 (105073, party of 5, 1 death); 105071 faced 4× solo, 0 kills |
| Q2 veteran bar | **banked2=2** | only the two unlocking seeds banked 2 living wave-4 veterans; wave-4 kills 6 total (105071: 3, 105073: 2, 105078: 1) |
| Q2 march | **MARCH-FOUGHT-NOT-SLAIN** | marchDays=4 arrived=4 foughtOnMarch=2 slainOnMarch=0; both fights FLED at full 700 HP (105072 d94, 11 blades; 105075 d75, 10 blades) |
| Q2 march-arrived-no-fight | **did NOT recur** | held={} panel-wide — no blocked-at:4,4 holds; the route-around fixed the sitting, the fights now flee instead |
| Q2 coalition-reach | **descriptive: reached10=1, stuck79=7** | 105076 sat at exactly 9 for 44 of 49 watch days; 105071 29 short days (13 one-short, longest run 12); only 105075 ever reached 10 |
| Q2 PLANWAKE | **WINPLAN-LAUNCHES** | planSeeds=26 on 8/8 seeds, partyDepartures=137, partyFights=511, trios=0 quads=0 — plans ignite everywhere, departures are pairs/solos |
| Q2 departbeat | **unobserved in sample** | no departure-beat line in any readable transcript/JSON line; the "depart" hits are the `partyDepartures` stats key |
| Q3 bow watch | **BOW-WATCH** | weaponTeach=0, weaponCraft=24, ammoCraft=188, equippedBows=25, bowKnowers=89 (bow=68 crude_bow=66; 21 crude-only) |
| Q3 bow loot-vs-knowledge | **noted** | 105073 holds starfall_bow + crossbow + apex_bow with 0 knowers (loot, not knowledge); 105076 holds 7 bows with 10 crude-only knowers |
| Q1 stand-down probe | **Q1-STANDDOWN-GO** | probe 105079 d63, 9 blades, released, 0 stranded; panel stand-downs released 1/1 |
| Q1 probe determinism | **did NOT drift** | first-attempt and re-run DONE lines byte-identical across processes (see Infrastructure) |
| F8 wild | **F8-UNMEASURED** | hits=0 — the confide line never fired panel-wide |
| F2 muster resets | **F2-REARM-GO** | resets=5, rearmed=3, stale=0 |
| Q1 refusal-heard | **REFUSAL-HEARD-GO** | refused=12, spoken=10, badDays=0 |
| Q1 titan | TITAN-MUSTER-MOVED | 7/8 seeds saw the titan, 186 titan-days, 81 verbs, slain=1 (105073's wave-5 kill was a party fight, not a muster slay — muster slain=1 is the titan-panel count) |
| Q1 muster policy | MUSTER-SLAIN | called=7 ready=0 fought=2 slain=1 |
| Q1 wave 4 | 28 fights, 6 kills (0.75/seed) | banked2=2, unlockedW5=2, playerDeaths=26 (wild 11) |
| Q1 trick pipeline | TRICK-PIPELINE-FLOWS | w4killsKnown=2 vs unknown=4; 14 wave-3+ types countered; 17 taught; stalls flows 8/8 |
| Q1 ladder | LADDER-OPENS + MINTS + HOLDS | opens=8/8, all five tracks minted on all seeds, holds=8/8, first stage day 14 on all seeds |
| Q2 trust | TRUST-EARNED-ONLY (footnote) | deaths=26, strangerGains=0, knownGains=39; no trust paid to strangers |
| Standing-199 stall | **0 days in the daily trace** | no seed spent a day at exactly 199 (r248: 6/8 parked) — but the end deed snapshot still shows 199 on 105076 + 105078; two measures disagree, see Q2 section |

**Per-seed panel:** 105071 d99 survived w5 standing max 342 (unlocked d69, 4 solo w5 fights 0 kills, w4 6 fights 3 kills, pantry 1,229); 105072 d101 survived w4 max 175 (w4 3 fights 0 kills, march fled d94, pantry 8,339); 105073 d101 survived w5 max 337 (unlocked d94, w5 kill d98 with a party of 5, w4 4 fights 2 kills, pantry 30,104); 105074 d38 village-lost scatter-hunger (max 25, w4 0 fights, pop 1, pantry 0); 105075 d80 village-lost scholar-death-no-successor (max 100, w4 4 fights 0 kills, march fled d75, pop 0, pantry 0); 105076 d100 survived w4 max 347 (w4 2 fights 0 kills, 44 days at 9 blades, pantry 11,976); 105077 d83 village-lost scatter-hunger (max 252, w4 3 fights 0 kills, pop 4, pantry 0); 105078 d100 survived w4 max 215 (w4 6 fights 1 kill, pantry 2,824).

## Q1 GO — the r247 NO-GO does not recur (third straight GO)

All 14 growth calls exact (2 seeds had no growth line at all: 105074/105076 poolDays=0). The r247 mismatch shape — a fresh split-village link's roster generating between dawn and the call — did not fire on this band. The "enough" clause fired once (105075 d74) and was honest — the fourth honest firing in the series (r246 2×, r248 1×, r249 1×). The designed undercount is still in the code; this band simply never presented it. The bar stays as pre-registered for the next run.

## The wave-5 wall, this run: the door opened twice — and a party killed through it

**First wave-5 kill in the deepening series.** 105073 unlocked on day 94 and faced a wave-5 monster on day 98 with a party of **5** — and killed it, at the cost of 1 death. The other unlocked seed, 105071, faced wave-5 **four times alone** (party sizes [1,1,1,1]) and killed nothing. The contrast is the whole story in one pair: a party of five kills; a lone scholar does not, four times running. Series: r245 3/8 unlocked 0 kills, r246 2/8 unlocked 0 kills, r247 0/8 unlocked, r248 1/8 unlocked never faced, **r249 2/8 unlocked, 2/2 faced, 1 kill**.

The veteran bar still gates the door — only the two seeds that banked 2 living wave-4 veterans unlocked — but the binding wall after the door is no longer "nothing comes through": the kill came from a party, and the solo fights all failed. PLANWAKE is live underneath it: plans ignited on all 8 seeds, 137 party departures, 511 party fights — but **trios=0, quads=0**: every departure was a pair or a solo. The one killing party had 5 — bigger than any win-plan departure. The launch question is now: what makes a party of five, when the plan system only ever sends pairs?

**March:** the arrived-no-fight shape is gone (held={} panel-wide — the scale r249 route-around works), but the march-flee shape is back: both march fights fled at full 700 HP with 10–11 blades (105072 d94, 105075 d75). r246's loop shape (7×), r247's single flee, r248's 0 fled — r249's 2 fled. A coalition that walks to the lair and runs from a full-health Herald is a different dead end than sitting at (4,4), but it is a dead end all the same. The muster never stood ready (ready=0 panel-wide; called=7) — the two fights came from arrived coalitions, not ready musters.

**Standing-199:** the daily trace shows **0 days at exactly 199** anywhere — the stall shape that parked 6/8 villages in r248 did not recur. Maxima ran 25–347 and finals 25–337. Caveat: the end deed snapshot still reads standingTotal=199 on 105076 and 105078 at day 100 — a different standing measure (deed snapshot vs daily trace) that still shows 199. The trace is the panel's standing instrument; the deed snapshot is flagged here for the scale leg to reconcile, not re-scored.

**Coalition-reach:** reached10=1, stuck79=7 — the worst reach in the series (r248: 4 reached). 105076 sat at exactly 9 blades for **44 of 49 watch days**. The 9-blade shape is now the deepening wall's dominant form: coalitions form, stall one blade short for weeks, and the one seed that reached 10 marched and fled.

## Census (plain words)

71 villagers started across 8 villages; **51 alive at the horizon** — three villages lost (r248: 8/8 survived, 71/71 alive). 105074 scattered on day 38 to hunger (11 fell — starvation ×5, sickness ×3; pantry 0). 105075 lost its scholar on day 80 with no successor (15 fell — wound_fever ×4, starvation ×4; pantry 0, living 0). 105077 scattered on day 83 to hunger (10 fell — thirst ×4, Gavel ×2; pantry 0). The scholar died 26 times panel-wide (11 in the wild); the villages that survived hold 7–11 people with pantries from 1,229 to 30,104 kcal. Nobody died to a wave-5 monster except the one death in 105073's killing fight — the losses are hunger, thirst, fever, and a scholar with no one to take the mantle. The deepening window is survivable when the village holds together and lethal when it doesn't; the food/succession failures, not the monsters, ended three runs.

## People check (Q4) — PASS with the defect counting up

Three full transcripts read:

- **Colin (105073, day 60, chimney sweep, sardonic, trust 92):** warn_you — the heed speaks the warning in his voice ("the treeline at dusk. Don't." → "Last night I laid awake listening. Every sound was you not coming back. Please. Just — come back."), resolution heeded. A **third voice** confirming landing r150 (Stella r247 trust 92, Luigi r248 trust 12, Colin r249 trust 92). Sensical. Stage-direction-as-dialogue: 1 serving ("They're smiling as you go.").
- **Néstor (105071, day 80, truck driver, withdrawn, trust 92, grieving):** seek_taken — asks about taken kin, the pods; a promise is made and kept in the sitting. Sensical. BUT: closing line "Talking helps. Then it hurts. Then it helps again. It's a cycle." == first winddown line verbatim — **closing-line duplication, 5th sighting** (Modhi r245, Noah r246, Esteban + Rafael r248).
- **Logan (105071, day 60, programmer, earnest, trust 95, cheerful):** repay — settled-help **NAMES the favor**: "You came through on the food I needed. I won't forget it." (r248 Esteban, r249 Logan — the scale r247 change holds in the wild a second time). The repay deflects gracefully and the betrayal branch gives a gift ("Here. I made an extra." — a decent tool, oiled and kept). Sensical. BUT: closing line "Don't be a stranger." == first winddown line verbatim — **closing-line duplication, 6th sighting, 2/3 in this run's read sample**.
- Betrayal-branch thin pool: the secret-place line ("shows you where they go to think. 'Don't tell the others. Everyone needs one place.'") appears verbatim in both Colin's and Néstor's sittings, and the "Walk with me? I want another pair of eyes on something." lead-in opens all three read sittings. One line serving every accepted betrayal branch is a variety note for the conversation arm, not a sense failure.
- Searcaster-volley-as-gun narration (Q4g): **unobserved in the read sample** — no volley narration line appears in any transcript or readable JSON line this run (the "volley" hits are the monster-pack line "it fell to the volley"; the single "searcaster" hit is a tier-4 kill-loot grant). The fix's own proof (48baef381) stands; the wild sighting is still owed.
- Departbeat (Q4g): **unobserved in the read sample** — no departure-beat line in any transcript; the JSON "depart" hits are the `partyDepartures` stats key.
- Link-raise opener variety: 17 raises (r248: 13 across 2 frames) — the pool works.
- Staged-witness sitting (succession r262): not directly observed in the read sample.
- Tashi favor-whiplash (r247 soft note): no recurrence in the read sample.

**Q4 verdict: PASS on sense (3/3 sensical); the closing-line duplication counts up to 6 sightings, 2/3 in this run's sample.** The build arm owns the fix (distinct pools, or winddown excludes the closing line).

## Carried findings (not built this run)

- **Q1 growth-line GO (this run):** 14/14 calls exact; r247 NO-GO does not recur (third straight GO). The "enough" clause fired 1× and was honest.
- **Wave-5 wall (first kill):** 2/8 unlocked, 2/2 faced, 1 killed — the kill came from a party of 5; the solo scholar faced 4× and killed nothing. PLANWAKE ignites everywhere (8/8 seeds, 137 departures) but sends only pairs/solos (trios=0, quads=0). The launch question is now party size, not ignition.
- **March-flee returns:** 2 fled at full HP with 10–11 blades; arrived-no-fight is fixed (held={}). The muster never stood ready (ready=0).
- **Coalition-reach worst in series:** reached10=1, stuck79=7; 105076 sat at 9 for 44 days.
- **Standing-199:** 0 days in the daily trace (r248: 6/8 parked) — but the end deed snapshot still shows 199 on two seeds; measures need reconciling by the scale leg.
- **Survival broke:** 3/8 villages lost (hunger ×2, scholar-death-no-successor ×1) after r248's 8/8 survived. The losses are food/succession, not monsters.
- **Bow-watch:** 25 bows equipped (r248: 28); 89 knowers, 21 crude-only (r248: 0 crude-only) — the BOWKNOW mentor gate (`.bow >= 1`) excludes them. 105073's apex-tier bows sit with 0 knowers (loot, not knowledge).
- **Probe determinism did NOT drift** — first-attempt and re-run DONE lines byte-identical across processes. The r248 drift has another cause; the driver arm's process-isolation proposal stands but is not urgent on this evidence.
- **Downedtwice fix:** unmeasured (0 "goes down" lines panel-wide — same as r248).
- **Trust:** no trust paid to strangers (deaths=26, strangerGains=0).

## Metric review

- **Q1 bar held as pre-registered** (0 bad lines; 14/14 calls exact → GO). The "enough" clause fired 1× and was honest — now measured honest 4× across runs (r246 2×, r248 1×, r249 1×). Cooled path still 0 in the wild (four runs running); stands on the 28/28 unit proof. No revision.
- **Q2/Q3 descriptive as pre-registered; no verdicts taken on them.**
- **Probe determinism:** r247 agreed, r248 disagreed, r249's cross-process re-run agrees exactly — propose the driver arm treat the r248 drift as an open question, not a standing defect: the probe needs a same-process pilot/panel comparison to reproduce it, or the drift came from the pilot's different staging. Not a mid-run re-score: the re-run panel probe is the scored one (Q1-STANDDOWN-GO).
- **Q4 closing-line duplication:** 6 sightings now, 2/3 this run. The watch stays; the build arm owns the fix.
- **Bow-watch metric caveat (instrument, not game):** `weapon_craft` counts all weapon crafts, not bow crafts. The `bowKnowers` key-coverage gap stays FIXED (bow OR crude_bow + split) — and this run's 21 crude-only knowers are exactly why the split matters.
- **Standing measures:** the daily trace (0 days at 199) and the end deed snapshot (199 on 2 seeds) disagree; the next run should name which measure the 199-stall finding uses.

## Telemetry

`telemetry-check.js` **quiet** on the 8-seed panel (w3fights, engaged.w3, fightsTotal, fightsByWave.3 — no large deviations vs the r192 baseline). Baseline NOT rolled.

## Infrastructure

- **Write flap:** window 08:57–~09:31Z (~34 min) killed the first panel attempt's seed-105078 JSON + transcripts (0-byte husks, removed); machine replaced ~09:31Z (new boot db346c9b); full re-run in one process 09:33–09:44Z, all 9 JSONs valid, 0 husks. The earlier 06:32–07:59Z window (~87 min) blocked the original occurrence's registration and killed its heartbeat loop; adoption re-secured the heartbeat at 09:32:08Z after the restart.
- **Reaper:** not run by this adoption during the flap (registry writes EPERM); final sweep at closeout.
- **Heartbeat loop:** detached (setsid, 10-min cadence, pid 1756 post-restart), alive for the adoption; registry heartbeat never went stale after 09:32:08Z.
- **Safe-commit index clobber:** watch for it after every safe-commit (known class; repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`).
- **Gate (`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r249-gate`, log `hidden_files/evidence/2026-11-22/journey-deepening-r249-gate.log`): [TO BE FILLED AFTER GATE RUN]**

## Verdicts

| Leg question | Verdict |
|---|---|
| Q1 growth-line (proof) | **GO** — 14/14 calls exact; r247 NO-GO does not recur |
| Q1 "enough" clause | **FIRED 1×, honest** |
| Q1 stand-down probe | **GO** — probe d63, 9 blades, released, 0 stranded |
| Q2 wave-5 wall | **MOVED — first kill** — 2/8 unlocked, 2/2 faced, 1 killed (party of 5); solo scholar 0/4 |
| Q2 march | **fought-not-slain** — 2/2 fled at full HP; arrived-no-fight fixed |
| Q2 PLANWAKE | **ignites everywhere** — 8/8 seeds, 137 departures, 0 trios/quads |
| Q3 bow watch | **measured** — 25 bows equipped; BOWKNOW dormant (teach 0); 89 knowers, 21 crude-only |
| Coalition-reach | **descriptive** — reached10=1, stuck79=7; 9-blade shape dominates |
| Standing-199 | **0 days in trace** — stall shape did not recur; deed snapshot still 199 on 2 seeds |
| Survival | **5/8 survived** — 3 lost to hunger/succession, not monsters |
| People check | **PASS** — 3/3 sensical; warn heed in a 3rd voice; settled-help names the favor; closing-line duplication 6th sighting |
| Telemetry | quiet (8 files, 4 metrics) |
| **Deepening r249** | **reachable: yes; fun: yes (conversations sensical, a wave-5 kill at last, bows in hands); winnable: not yet — the door opened twice and a party killed through it once, but only one village in eight fielded a killing party, and three villages never got that far** |

## Closeout

- Panel evidence + run note committed via `bash scripts/safe-commit.sh` in the worktree (watch for index clobber after every safe-commit).
- Merge `git merge --ff-only journey-deepening` in the main tree; release + remove worktree + branch; final `bash scripts/worktree-reap.sh`; verify main tree clean.
- Rotation write `2→3` with read-back. Delete the lock.
- Merged locally, pending ship — no version bump, no push, no live verification (ship loop owns that).
