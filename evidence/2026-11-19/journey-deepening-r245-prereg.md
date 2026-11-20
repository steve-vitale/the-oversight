# Journey deepening r245 — prereg

- Run: r245, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222/r226/r227/r232/r235/r236/r237/r238/r243/r244)
- Run id: playtest-loop-a-20261120T0145Z (scheduled Thu 2026-11-19 19:45 CST)
- Base: local master `904545499` (sim-scale-onramp-round-2215 adoption closeout; deepening r244 F8 fix + establishment r244 + endgame r249 included). The only src/js delta this run is the growth-line fix below (verified by git diff --stat at closeout).
- Rotation read `2` (deepening); write `2→3` at closeout with read-back.
- Policy: competent + MUSTER POLICY (r227 verbatim + r236 growth amendment + r237 F1/F2 + r238 stand-down) + MARCH STEP (r228 verbatim, driver-only). The muster/march machine is otherwise unchanged since r244. **The driver is deliberately NOT gated on the fresh projection** (see Q1): a competent player who hears the dawn line sounds the call, and the cooled path is the instrument — gating the driver would hide the very behavior the game fix exists to narrate.
- Seeds: panel 105031–105038 (8 seeds); probe seed 105039 (dedicated, NOT scored in panel metrics — Q1-probe only).
- Seed-band freshness check (local_seed_band_freshness): repo evidence `*-prereg.md` via git grep — 0 hits for 105031–105039; evidence filenames 2026-11-19/20 — 0 hits for 10503x; git log --grep — 0 hits. Nearest named bands 105021–105029 (r244), 105101. Band 105031–105039 is fresh.
- Driver: fork of scripts/journey-deepening-r244-20261119.js (band + tag r245; r244 instruments carried) + cooled-call instrument (say-wrap match on the cooled line; musterLog entries marked cooled) + growthWatch per-link detail (links[] on every row, so the next stale line names its mover). Analyzer: fork of scripts/analyze-journey-deepening-r244-20261119.js + cooled-day exemption in summarizeGrowth (a line day whose call cooled is explained, not bad) + per-link growthWatch support. Proof tests: new growth-line fix test + forked muster/march/analyzer tests from r244.
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing >= 100 + readiness bars; observation channel: 2 survived encounters → trick) + docs/CONVERSATIONS.md. NO canon doc covers titans/muster — mechanism grounded in src/js/titans.js + src/data/titans.json (Herald: wave 4, minAllies 10; quota 6 iff trust >= 70 and opinion >= 10 else 2; refusal bars trust < 25 / opinion < -10 / arrears > 0; Haven commit cap 3). Mechanism memo: evidence/2026-11-19/journey-deepening-r245-growthline-memo.md.

## The one src fix (r244 growth-line stale promise — owed to this run)

**The dawn growth line promised blades the morning could not deliver.** r244, seed 105024 day 86: the line said "The fires have warmed since the call — The Hungry Road would send 2 more blades if the call were sounded again. The muster would stand at 11 of the 10 THE HERALD demands — enough. Sound the call." The policy sounded the call that morning on that promise and harvested 0. Mechanism pinned (memo): the line is computed inside endDay (game.js:34505, last dawn beat); after sleep() returns, the harness runs driveContests before the first upkeep — a contest death that morning (`gen_uiy4q4k`, cause "contest", day 86) killed a committed Haven blade after the line spoke. For a real player the gap is worse: fights, contests, travel and deaths can all land between dawn and tapping the call. A driver-only gate would hide the lie, not fix it.

- FIX (src/js/titans.js, two parts):
  1. **Re-validate at the act** (`soundTitanCall`, ~862): recompute `titanMusterGrowth` fresh before sounding. If a growth line promised allied blades (`muster._growthPromisedAllied > 0`, set when the line speaks) and the fresh allied gain is 0, do NOT sound — say honestly instead ("The fires have cooled since dawn — the growth the dawn promised is gone. No new blades answer. The muster stands at N of the M demands." + Haven-still-free clause when havenGain > 0), re-arm `_growthSaid` to the fresh harvestable, clear the promise, return null. No "THE CALL GOES OUT", no trust −8, no empty ritual. When no line promised allied growth, or the fresh gain is still > 0, the call sounds exactly as before (unchanged behavior — the fix targets only the stale-promise case).
  2. **Reword the line as a dawn report** (`titanMusterGrowthLine`, ~1426): keep the exact prefix `📯 The fires have warmed since the call —` (the driver instrument matches it) and keep the parsed number phrases (`would send N more blades`, `Haven has N volunteers`, `would stand at T`); add the dawn framing (`at dawn, …`) and the honest qualifier on the enough-clause (`— enough, if the morning holds.`). The line still wakes the player to growth; it no longer issues an unconditional imperative about a future act.
- PROOF: scripts/test-titan-growthline-cooled-call-20261120.js — RED+GREEN before landing (RED on unfixed code: the cooled call sounds the ritual and brings 0; GREEN on the fixed build: cooled call says the cooled line, no ritual, no trust charged, no new allies; mirror case with fresh growth proceeds as before; Haven case — volunteer gone between line and commit tap — first tap still says "No one is free"). Staged live via scripts/sim-harness.js `loadGame`.
- CONVERSATION-AUDIT RE-CHECK: the relevant conversation tests run as part of the gate; the fix touches no conversation code.

## Q1 — GROWTH-LINE FIX + WILD CHECK (primary)

- Proof test GREEN (RED verified) = the fix holds at unit level.
- Wild: the analyzer judges every panel growth line against the same-day growthWatch row + the musterLog harvest, with the cooled-day exemption (a line day whose call cooled honestly is explained, not bad). Bar: **0 bad growth lines panel-wide; every growth call either harvests exact (allied + Haven) or cools honestly (cooled line said, 0 trust charged)**. A silent empty call after a growth line (ritual sounded, 0 harvested, no cooled line) is a NO-GO on the fix, investigated before landing.
- Verdicts: GO (proof green + 0 bad wild lines, harvests exact or cooled), NO-GO (a bad wild line, a silent empty call, or proof RED), UNMEASURED (no growth line fires panel-wide AND the proof test is the only evidence — reported as such, the proof still stands).
- Seed-band note: the memo suggested re-running the r244 panel (seeds 105021–105028) after the fix. Not taken: r244 itself found probe seeds are not bitwise reproducible across processes (105024 replayed to a different trajectory with no growth line), so same-seed re-runs are not paired comparisons — a fresh band judges the absolute bar (0 bad lines) cleanly, and matches the r243→r244 comparison pattern.

## Q2 — COALITION-REACH (secondary, DESCRIPTIVE — no bar this run)

r243: 1/8 FAIL. r244: 4/8 FAIL (bar ≥6/8). The design call (more allies / more Haven / lower gate) is already with the build arm with two panels of evidence. A third re-measure on an unchanged gate would be re-proving a proven constraint (Steve 2026-11-01: deliver changes, not more measurement) — so Q2 is a watch this run: report reached10 count + stuck-at-9 shapes descriptively, NO GO/NO-GO verdict against the ≥6/8 bar. The bar stands for the build arm's lever; the metric review records this downgrade and why.

## Q3 — TRICK PIPELINE (descriptive — no bar)

r244: all 9 wave-4 kills on unknown monsters; 14 slain wave-3+ types have no counter in their data. Report wave-4 kills by known/unknown + count of slain wave-3+ types with no counter. Feeds the build arm; no verdict.

## Policy safety rules (part of the prereg, not tunable mid-run)

- Muster (r227 verbatim + r236 growth amendment + r237 F1/F2 + r238 stand-down): call ONCE per link-count change OR once per growth-line hearing (refusals cost trust −8 per call, never sound daily without the line or a new link); council once per muster (re-armed on dissolution); one commit cycle per muster (re-opened on fresh Haven growth or dissolution); titanCommitOwn two-tap in one daily tick.
- Titan carve-out in policy.fight applies ONLY when the fight holds a titan monster id AND Game.titanMusterReady(mid) is true; the mid-fight hpPct < 0.35 flee and the stalemate flee stay as-is.
- March (r228 verbatim): fires ONLY for a located (stage >= 2), present, unslain titan with a READY muster; sanctity holds (over / tbfight / pendingEncounter / tableActive / sleeping) use the braced pattern (hold(...) then continue INSIDE the if); never marches without a ready muster, never outfits allies, never touches finale/nielsen campaign gates.
- Probe rule (carried): the staged departure fires ONCE, on the probe seed only, at the first qualifying dawn; it never touches a panel seed, never slays the herald (slain stays empty — the stand-down's !slain guard must see a departure, not a kill), never re-adds the herald.
- No seek-the-titan pathfinding beyond the march. If a muster completes but no fight fires by day 100, that is a recorded finding (march gap), not a policy failure to hide.

## Q4 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING LAW): does the NPC want something, do options engage/deflect it, do endings resolve/plant/owe? Note verbatim lines. Also read the growth line in the wild (and the cooled line, if one fires — read it in full) and the muster/march/fight voice on at least one seed. F8 hits, if any, are read in full here.

## Q5 — CENSUS + REACHABLE / FUN / WINNABLE

Census in plain words (who lived, who died, what they knew, what was missing). Judge reachable / fun / winnable for deepening. Carried: trick pipeline (taughtRate null rule, learnedRate), w4fights / w4kills, banked veterans, w5 unlocked/faced/killed. Slain-field carried as a watch. Refusal-heard carried as a regression watch.

## Substrate checklist (§14b, before the pilot)

1. Contact: growth lines occur on the deepening band (r244: 7 heard panel-wide). The probe seed must reach a standing muster for the stand-down probe to judge; if it never does by day 100, the probe reports UNMEASURED with the series as evidence.
2. Pool sizing: the GO bar needs >= 1 growth line heard with a growth call following. r244 heard 7 lines on 8 seeds; the pool is there.
3. Verb existence: the fix needs no new verb — `soundTitanCall` already reads the projection path and `titanMusterGrowthLine` already speaks; the cooled line is a new `Game.say` in an existing verb.
4. Horizon fit: DAYCAP 100 — r244's defect fired day 86; the phenomenon is inside the horizon.

## Watches (no verdicts unless the bar trips)

- Q1 stand-down probe (standing instrument): bar unchanged (stand-down fires same morning, 0 stranded days).
- F8 wild check: spoken-have == gate count on every refusal; 0 mismatches. F8 line: 0 occurrences in sittings where no secret was shared.
- Q1-growth-line REGRESSION WATCH: r244 bars as amended by the cooled exemption (0 bad lines, 0 repeats, harvests exact or cooled). A miss here is a regression on the repaired harness — investigate before landing anything.
- Scholar deaths (standing metric): compare against r244 (24 total, 14 wild), NOT the establishment ≤2/panel bar.
- Survival vs r244 (8/8 survived, 100d).
- Ladder stage at d80; regional links seasoned by d80.
- Wave-3 wild Reunion: fights + outcomes (arena cap landed; wild untouched).
- Herald gorge: transcript lines where the titan eats from the stores — counted only if the analyzer scan finds them; no verdict.
- FIGHTALLY2: second ally slot landed. Watch wave-4/titan fight party sizes in wildFightTable — no verdict, the fightallycap confirm panel owns the verdict.
- TableActive distinction (r242 landed tableSitting() in src/js/table.js): NOT adopted by this run's driver — deferred again to r246 (single-variable discipline on the Q1 re-panel; the r242 scale verdict carries the distinction for now).
- F2 watch — REARM-GO, keep as a watch. The reset log stays in the per-seed JSON.
- March latency (r237 F4: ready → fight latency 19 days on 104607, 11 holds): report ready→fight latency per seed; no bar.
- Trust-paid-to-stranger (r244 single instance, 105023 day 17, −36 to a stranger with firstContact null): report if it recurs; no verdict on one instance.

## Pilot gate (before the full panel)

3 seeds (105031–105033). Gate: driver runs clean (no FATAL seeds), musterLog rows present on titan-days, growth instrument records line-time per-link detail, probe seed stages (or reports why not — the probe runs on its own seed in parallel with the pilot). If the pilot shows a STRANDED day on a wild seed, that is the defect under test — fix the driver before the panel (r237 precedent); the panel verdict comes from the repaired build only. The pilot seeds are scored (r233/r240 precedent) unless the pilot forces a driver change, in which case the panel re-runs on the repaired build and the pilot is re-run.

## Flap note (infra — write flap, ongoing)

- r244 (2026-11-19): registration took ~6.6 min on the 23G checkout, no write refusals seen; probe `git update-ref refs/heads/probe-r244 HEAD` OK 12:57Z.
- This run (r245): registration took ~10.7 min (01:46–01:57Z) on the loaded machine (restart ~01:42Z, load avg ~12). **Flap UP since ~02:19Z**: heartbeat writes refused (PermissionError on json.dump) continuously 02:19–02:31Z+; heartbeat_at stuck at 02:18:29Z. Retry loops running; memo file write at 02:26Z succeeded while registry writes failed the same minute (flap is selective/flaky). Per the flap skill: probe before writes that matter, verify size after every write, never claim success on a write that was refused. If the flap is still up at closeout, commits/merges must be verified byte-for-byte before claiming them.

## Gate / telemetry

- `node scripts/check.js --quick` in the worktree (cache /tmp/jest-cache-playtest); 0 attributable failures = GO.
- Telemetry: `node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/deepening.json --current 'evidence/2026-11-19/journey-deepening-r245-*-seed*.json'`. Known LOUD schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on that line alone; any NEW loud line is a same-run investigation item.

## Metric review (filled at closeout)

- (to be filled)
