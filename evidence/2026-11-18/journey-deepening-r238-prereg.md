# Journey deepening r238 — prereg

- Run: r238, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222/r226/r227/r232/r235/r236/r237)
- Run id: playtest-loop-a-20261118T220705Z (scheduled Wed 2026-11-18 15:45 CST)
- Base: local master `c0151cb53` (worktree branch journey-deepening; contains ecdee2fff + sim-partyform-diag-a evidence; no src/js delta vs r237's base 402726f9b except alienPlayers.js, conversation.js, table.js [tableSitting], build.js — verified by git diff --stat). The muster/march/titans machine is unchanged since r237; the tableSitting addition is NOT adopted by this run's driver (deferred — see Metric review / deferred).
- Rotation read `2` (deepening); write `2→3` at closeout with read-back.
- Policy: competent + MUSTER POLICY (r227 verbatim + r236 growth amendment + r237 F1/F2 amendments + r238 stand-down amendment below, driver-only) + MARCH STEP (r228 verbatim, driver-only). Single arm: this run FIXES the driver (no src/js change) and re-judges Q1 on the repaired harness.
- Seeds: 104802–104809 (8 seeds)
- Seed-band freshness check (local_seed_band_freshness): repo evidence `*.md` via git grep — 0 hits for 104802–104809 in any prereg (sim-*/journey-*); full evidence tree `*.md` — 0 hits; hidden evidence — 0 namings (the only 10480[2-9] content hits are floating-point substrings inside old JSON corpora, e.g. map-panel case hashes, not seed bands). REJECTED first choice: 104701–104708 (104701 named in sim-partysize4-b-prereg.md + sim-scale-onramp-round-1715.md; 104705/104708/104712 named in preregs). REJECTED: 104801 (named once in sim-partysize4-b-prereg.md line 232 as a clear-but-unchosen candidate — a naming reserves it under the skill). 104802 is the first clean band.
- Driver: fork of scripts/journey-deepening-r237-20261118.js (band + tag r238; r237 instruments carried) + ONE driver change below (F1 stand-down). Analyzer: fork of scripts/analyze-journey-deepening-r237-20261118.js + summarizeMusterStanddowns (new). Proof tests: forked muster/march/analyzer tests with stand-down cases added (M24–M28, analyzer 76+); game-level growth test carried unchanged (no src/js change this run).
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing >= 100 + readiness bars; observation channel: 2 survived encounters → trick). NO canon doc covers titans/muster — mechanism grounded in src/js/titans.js + src/data/titans.json (Herald: wave 4, minAllies 10; quota 6 iff trust >= 70 and opinion >= 10 else 2; refusal bars trust < 25 / opinion < -10 / arrears > 0; Haven commit cap 3). The growth line names only what the muster can already know.

## The one driver fix (r237 F1 — owed to this run, driver-only)

**F1 — Ready muster strands when the titan leaves its lair (march gap, r237 seed 104602).** The muster reached 11 (ready d66), marched twice, "arrived" at the lair both times — and no fight ever fired. The Herald moved tiles between the march days and then left the world census entirely after d67 (not slain — titanEnd.slain empty). The march records arrival at stale coordinates; there is no re-chase and no "titan left" handling. The muster stood eating 1,000 kcal/blade/day and decayed 11 → 9 (Haven 3 → 1) by d101.
- FIX (port of the r242 scale driver's muster-step rule, herald-scoped): in `musterPlay`, after the fight-active guard and before the decision, if the herald muster holds blades (allies + haven > 0) AND the herald is NOT present in the world AND NOT slain, call `G.titanStandDown('herald')` (the real verb: nulls the muster, releases the committed, says the MUSTER BREAKS line aloud, costs allied trust −5 per answering village) and log a musterLog entry `{ day, held: 'stood-down', before, after }`. The verb itself refuses mid-fight and returns null when slain, so the placement after the fight guard + the !slain condition are belt-and-braces, not the guard.
- The F2 dissolve-reset then re-arms the per-muster flags the next morning (the muster is empty + hadBlades), so a later muster can call, council, and commit fresh. A muster that never had blades is untouched (no stand-down call — nothing stands).
- VOICE WRINKLE (noted, not fixed): the verb's line says the titan "still stands, unanswered" even when the titan has left the world. The mechanics are right; the fiction is slightly off for the departed case. Flagged for the march/titan build; out of this run's driver-only scope.

## Q1 — F1 MARCH GAP, RE-JUDGED (primary)

- **STRANDED day** (bound metric): a musterPlay snapshot (the `before` counts on a musterLog row, or a coalitionWatch/growthWatch day) where the herald muster holds blades AND the herald is absent AND the previous day's musterPlay snapshot ALSO showed blades + absent — i.e. the stand-down did not fire within one dawn. The departure morning itself (first absent snapshot) is NOT stranded: the stand-down fires that same morning.
- **Bar: 0 STRANDED days panel-wide.** Every stand-down must be followed by an empty muster at the next morning's snapshot (STANDDOWN-RELEASED); a muster still holding blades the next morning is a STRANDED day.
- Verdicts: GO (0 stranded days, all stand-downs released), NO-GO (>= 1 stranded day — classify per §14a), UNMEASURED (no titan departure with a standing muster on the panel — the phenomenon never occurs; the stand-down rule is then unexercised, not proven).
- Secondary: count stood-down events panel-wide; report the upkeep saved (blades × days the muster would otherwise have stood — approximate from the decay the r237 seed showed, 11 → 9 over ~35 days, reported as context not a bar).

## Q2 — COALITION-REACH (secondary, outcome; r235 metric-review adopted)

Bound metric: per seed, max blades (allies + haven) reached while a titan is present. Bar: >= 6/8 seeds reach 10. Secondary watch: longest one-short run. Analyzer reports reached-10 alongside the band's link/trust depth (linksMax from musterLog, mean trust at last trustSnap) so the bar reads as a wall measurement, not a line verdict.

## Policy safety rules (part of the prereg, not tunable mid-run)

- Muster (r227 verbatim + r236 growth amendment + r237 F1/F2 + r238 stand-down): call ONCE per link-count change OR once per growth-line hearing (refusals cost trust −8 per call, never sound daily without the line or a new link); council once per muster (re-armed on dissolution); one commit cycle per muster (re-opened on fresh Haven growth or dissolution); titanCommitOwn two-tap in one daily tick.
- Titan carve-out in policy.fight applies ONLY when the fight holds a titan monster id AND Game.titanMusterReady(mid) is true; the mid-fight hpPct < 0.35 flee and the stalemate flee stay as-is.
- March (r228 verbatim): fires ONLY for a located (stage >= 2), present, unslain titan with a READY muster; sanctity holds (over / tbfight / pendingEncounter / tableActive / sleeping) use the braced pattern (hold(...) then continue INSIDE the if); never marches without a ready muster, never outfits allies, never touches finale/nielsen campaign gates.
- No seek-the-titan pathfinding beyond the march. If a muster completes but no fight fires by day 100, that is a recorded finding (march gap), not a policy failure to hide.

## Q3 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING LAW): does the NPC want something, do options engage/deflect it, do endings resolve/plant/owe? Note verbatim lines. Also read the muster/march/fight voice in full on at least one seed (the growth line itself is Q1's instrument — read it in the wild, not just the count; the MUSTER BREAKS line if a stand-down fires).

## Q4 — CENSUS + REACHABLE / FUN / WINNABLE

Census in plain words (who lived, who died, what they knew, what was missing). Judge reachable / fun / winnable for deepening. Carried: trick pipeline (taughtRate null rule, learnedRate), w4fights / w4kills, banked veterans, w5 unlocked/faced/killed. Slain-field carried as a watch. Refusal-heard carried as a regression watch.

## Substrate checklist (§14b, before the pilot)

1. Contact: short musters occur on the deepening band (r237: 4/8 stuck at 7–9 blades; 104608 28 days at 9). Titan departures with a standing muster are the phenomenon — r237 showed 1/8 seeds (104602); if the fresh band shows 0, Q1 reports UNMEASURED with the series as evidence.
2. Pool sizing: the GO bar needs >= 1 departure-with-standing-muster. The departure is engine-driven (the titan leaves the world census); the policy cannot force it. If it proves thin anyway, Q1 reports UNMEASURED.
3. Verb existence: the fix needs no new verb — musterPlay only calls the existing `titanStandDown` verb, already proven by the r242 scale driver + win-plan departure.
4. Horizon fit: DAYCAP 100 — r237's strand spanned d67–d101; the phenomenon is inside the horizon.

## Watches (no verdicts unless the bar trips)

- Q1-growth-line REGRESSION WATCH: r237 bars unchanged (0 bad lines, 0 repeats, harvests exact on both legs). A miss here is a regression on the repaired harness — investigate before landing anything.
- Scholar deaths (standing metric): compare against r237 (23 total, 10 wild), NOT the establishment ≤2/panel bar.
- Survival vs r237 (8/8 survived, 100d).
- Ladder stage at d80; regional links seasoned by d80.
- Wave-3 wild Reunion: fights + outcomes (arena cap landed; wild untouched).
- Herald gorge: transcript lines where the titan eats from the stores — counted only if the analyzer scan finds them; no verdict.
- FIGHTALLY2: second ally slot landed. Watch wave-4/titan fight party sizes in wildFightTable — no verdict, the fightallycap confirm panel owns the verdict.
- TableActive distinction (r242 landed tableSitting() in src/js/table.js; the scale driver runs MUSTER_HOLD arms): NOT adopted by this run's driver — the march sanctity gate still uses tableActive(). Deferred to a later deepening run; the r242 scale verdict carries the distinction for now.
- F2 watch — REARM-GO, keep as a watch. The reset log stays in the per-seed JSON.
- March latency (r237 F4: ready → fight latency 19 days on 104607, 11 holds): report ready→fight latency per seed; no bar.

## Pilot gate (before the full panel)

3 seeds (104802–104804). Gate: driver runs clean (no FATAL seeds), musterLog rows present on titan-days, Q1-growth shows no NEW bad-line class (a bad line naming the r236 harness-order shape again is a repair failure, not a new defect — fix before the panel). If the pilot shows a STRANDED day, that is the defect under test — fix the driver before the panel (r237 precedent); the panel verdict comes from the repaired build only. The pilot seeds are scored (r233/r240 precedent) unless the pilot forces a driver change, in which case the panel re-runs on the repaired build and the pilot is re-run.

## Gate / telemetry

- `node scripts/check.js --quick` in the worktree (cache /tmp/jest-cache-playtest); 0 attributable failures = GO.
- Telemetry: `node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/deepening.json --current 'evidence/2026-11-18/journey-deepening-r238-*-seed*.json'`. Known LOUD schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on that line alone; any NEW loud line is a same-run investigation item.

## Metric review (filled at closeout)

- (to be filled)
