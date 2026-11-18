# Journey deepening r237 — prereg

- Run: r237, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222/r226/r227/r232/r235/r236)
- Run id: playtest-loop-a-20261118T152106Z (scheduled Wed 2026-11-18 08:45 CST)
- Base: local master `402726f9b` (r240 establishment, third rebase hashes)
- Rotation read `2` (deepening); write `2→3` at closeout with read-back.
- Base delta vs r236's panel base (5168f824d): r240 establishment (walkHome first-refusal + clearableBlocked, `[needs-eyes]`), r239 scale, r238 lane-B evidence, r237? No — this run's own base is 402726f9b. Src changes relevant to titans/muster/deepening: **none in src/js/titans.js** (verified: the r240 delta touches game.js walkHome + journey tooling only). The muster machine is unchanged since r236; comparisons to r236 numbers are context, never replication.
- Policy: competent + MUSTER POLICY (r227 verbatim + r236 growth amendment + r237 F1/F2 amendments below, driver-only) + MARCH STEP (r228 verbatim, driver-only). Single arm: this run FIXES the driver (no src/js change) and re-judges Q1 on the repaired harness.
- Seeds: 104601–104608 (8 seeds)
- Seed-band freshness check (local_seed_band_freshness): repo evidence `*.md` via git grep — 0 hits for 104601–104608 in any prereg (sim-*/journey-*); full evidence tree — 0 namings (the only 10460x content hits are floating-point substrings inside old JSON corpora, e.g. `3.730551046044973`, not seed bands); hidden evidence — 0 prereg hits. REJECTED first choice: 104001–104008 (named in sim-fleerepair2-b, sim-fleerepair2-rejudge-b, sim-analyzer2513-b, sim-expedroster-b, sim-triodrought-b preregs). REJECTED: 104101, 104201, 104301, 104401 (all named in other lanes' preregs). 104501 named once. 104601 is the first clean band.
- Driver: fork of scripts/journey-deepening-r236-20261117.js (band + tag r237; r236 instruments carried) + F1/F2 driver fixes below. Analyzer: fork of scripts/analyze-journey-deepening-r236-20261117.js + summarizeMusterResets (new) + link/trust depth in summarizeCoalitionGap (r236 metric review). Proof tests: forked muster/march/analyzer tests with F1/F2 cases added (M19–M23, analyzer 72+); game-level growth test carried unchanged (no src/js change this run).
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing >= 100 + readiness bars; observation channel: 2 survived encounters → trick). NO canon doc covers titans/muster — mechanism grounded in src/js/titans.js + src/data/titans.json (Herald: wave 4, minAllies 10; quota 6 iff trust >= 70 and opinion >= 10 else 2; refusal bars trust < 25 / opinion < -10 / arrears > 0; Haven commit cap 3). The growth line names only what the muster can already know.

## The two driver fixes (r236 F1/F2 — owed to this run, driver-only)

**F1 — Harness-order drain.** r236 proved the growth math exact at dawn (14/14 harvests exact) but the panel's one bad line came from the harness's own wait-parts: `runDays` calls `policy.daily` only AFTER three `doAction('wait')` cycles, each running `villagerTurn` — NPCs leave Haven between the dawn line and the policy's first act. The r236 repair moved the line to the last beat of dawn and `musterPlay` to the top of `policy.daily`, but `policy.daily` itself still runs after the waits.
- FIX: move the `musterPlay` call from the top of `policy.daily` to the top of `policy.upkeep` (before `goInside`, mirroring r236's daily order). The harness calls `policy.upkeep` 3× per day — once per part, BEFORE each wait — so the first upkeep of the day runs before any villagerTurn wait. The day-guard inside `musterPlay` keeps it once/day. The growthWatch snapshot is now taken at the first upkeep: the true dawn pool, the exact comparator for the dawn line (implements r236's metric-review proposal — the bad-line check now joins the line to the dawn pool, no analyzer change needed for Q1).
- GUARD: if a fight is active when `musterPlay` runs (`Game.tbfight && !Game.tbfight.over`), skip the DECISION without consuming the day — but the snapshot still records (so the analyzer never sees a line day with no growth row). A skipped decision sets `ctx._musterDeferredGrowth`, carried into the next day's `growthHeard` so the line's growth is not lost to a frozen fight. This preserves r236's never-mid-fight behavior (daily ran after fights were driven).

**F2 — Stood-down muster leaves stale commit flags.** r236 seed 103906: first muster day 76 (6+3=9), titan stood down day 80 (win-plan departure calls `titanStandDown`, which nulls `state.titans.musters.herald` and releases the committed), new muster day 95 (0→8 allies) — but the policy never committed Haven (`committed` still true from the old muster), and the line stayed silent days 96–100 because the day-95 call's re-arm stored `_growthSaid=3`. Three Haven blades sat free while the muster sat at 8/10 for the last five days.
- FIX: `musterPlay` tracks `ctx._musterHadBlades` (set whenever a muster shows total > 0). When a muster that HAD blades is now empty (allies 0, haven 0), reset `_musterCalledLinks=null`, `_musterCouncilDone=false`, `_musterCommitted=false`, `_musterHadBlades=false`, and log the reset to `ctx.musterResets` (day + reason 'stood-down') for the analyzer. The reset is deliberately NOT triggered when the muster never had blades: a refused call (0 allies) must not re-sound daily at −8 trust per call — the once-per-link-count rule still governs refusals.

## Q1 — ONE-SHORT GROWTH LINE, RE-JUDGED (primary)

Same GO bars as r236 (metric binding §14 — the bar is unchanged, the harness is fixed to meet it):
- >= 1 titan-day panel-wide has harvestable > 0 during a short muster AND the line fires on it.
- 0 days where the line fires twice without an intervening call or further harvestable growth (dedupe holds).
- On every growth-call, the muster gains the announced allied blades AND the announced Haven blades (after − before == announced, both legs).
Verdicts as r236: UNMEASURED (no pool day), UNMEASURED-SILENT (pool but no line), UNMEASURED-HARVEST (line but no growth-call), NO-GO (bad/repeat line or harvest mismatch — classify per §14a), GO (all three hold).
- F2 watch (report-only unless the bar trips): every muster reset is followed by a re-armed commit when the new muster needs Haven blades (analyzer `summarizeMusterResets`: REARMED / NO-NEED / STALE — STALE = a later musterLog entry shows total < 10 with haven < 3 and no commit fired after the reset; 0 STALE = F2-REARM-GO).

## Q2 — COALITION-REACH (secondary, outcome; r235 metric-review adopted)

Bound metric: per seed, max blades (allies + haven) reached while a titan is present. Bar: >= 6/8 seeds reach 10. Secondary watch: longest one-short run. Per r236's metric review, the analyzer now reports reached-10 alongside the band's link/trust depth (links at last watch day from standingTrace, mean trust at last trustSnap) so the bar reads as a wall measurement, not a line verdict.

## Policy safety rules (part of the prereg, not tunable mid-run)

- Muster (r227 verbatim + r236 growth amendment + r237 F1/F2): call ONCE per link-count change OR once per growth-line hearing (refusals cost trust −8 per call, never sound daily without the line or a new link); council once per muster (re-armed on dissolution); one commit cycle per muster (re-opened on fresh Haven growth or dissolution); titanCommitOwn two-tap in one daily tick.
- Titan carve-out in policy.fight applies ONLY when the fight holds a titan monster id AND Game.titanMusterReady(mid) is true; the mid-fight hpPct < 0.35 flee and the stalemate flee stay as-is.
- March (r228 verbatim): fires ONLY for a located (stage >= 2), present, unslain titan with a READY muster; sanctity holds (over / tbfight / pendingEncounter / tableActive / sleeping) use the braced pattern (hold(...) then continue INSIDE the if); never marches without a ready muster, never outfits allies, never touches finale/nielsen campaign gates.
- No seek-the-titan pathfinding beyond the march. If a muster completes but no fight fires by day 100, that is a recorded finding (march gap), not a policy failure to hide.

## Q3 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING LAW): does the NPC want something, do options engage/deflect it, do endings resolve/plant/owe? Note verbatim lines. Also read the muster/march/fight voice in full on at least one seed (the growth line itself is Q1's instrument — read it in the wild, not just the count).

## Q4 — CENSUS + REACHABLE / FUN / WINNABLE

Census in plain words (who lived, who died, what they knew, what was missing). Judge reachable / fun / winnable for deepening. Carried: trick pipeline (taughtRate null rule, learnedRate), w4fights / w4kills, banked veterans, w5 unlocked/faced/killed. Slain-field carried as a watch. Refusal-heard carried as a regression watch.

## Substrate checklist (§14b, before the pilot)

1. Contact: short musters occur on the deepening band (r236: 7/8 stuck at 7–9 blades; 103601 27 days at 9 in r235). The growth series is observable daily via the pure Game.titanMusterGrowth read.
2. Pool sizing: the GO bar needs >= 1 titan-day with harvestable > 0 during a short muster. Trust moves under the competent policy (gifts +10, weekly tribute), so the pool is not thin by construction; if it proves thin anyway, Q1 reports UNMEASURED with the series as evidence.
3. Verb existence: the fix needs no new verb — musterPlay only moves call sites; the dawn line is a say in game.js dawn; the harvest verb is the existing call.
4. Horizon fit: DAYCAP 100 — r236's stalls span the whole window; the phenomenon is inside the horizon.

## Watches (no verdicts unless the bar trips)

- Scholar deaths (standing metric): compare against r236 (23 total, 16 wild), NOT the establishment ≤2/panel bar.
- Survival vs r236 (6/8 survived, 100d).
- Ladder stage at d80; regional links seasoned by d80.
- Wave-3 wild Reunion: fights + outcomes (arena cap landed; wild untouched).
- Herald gorge: transcript lines where the titan eats from the stores — counted only if the analyzer scan finds them; no verdict.
- FIGHTALLY2: second ally slot landed. Watch wave-4/titan fight party sizes in wildFightTable — no verdict, the fightallycap confirm panel owns the verdict.
- TableActive distinction (r235 investigated, NOT landed; owed to the scale leg): no src change here; the march sanctity gate still uses tableActive(). Not re-investigated.

## Pilot gate (before the full panel)

3 seeds (104601–104603). Gate: driver runs clean (no FATAL seeds), growthWatch rows present on titan-days, Q1 shows no NEW bad-line class (a bad line naming the r236 harness-order shape again is a repair failure, not a new defect — fix before the panel). If the pilot NO-GOs on a NEW defect, repair before the panel (r236 precedent); the panel verdict comes from the repaired build only. The pilot seeds are scored (r233/r240 precedent) unless the pilot forces a driver change, in which case the panel re-runs on the repaired build and the pilot is re-run.

## Gate / telemetry

- `node scripts/check.js --quick` in the worktree (cache /tmp/jest-cache-playtest); 0 attributable failures = GO.
- Telemetry: `node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/deepening.json --current 'evidence/2026-11-18/journey-deepening-r237-*-seed*.json'`. Known LOUD schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on that line alone; any NEW loud line is a same-run investigation item.

## Metric review (filled at closeout)

- (to be filled)
