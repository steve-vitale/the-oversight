# Journey deepening r244 — prereg

- Run: r244, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222/r226/r227/r232/r235/r236/r237/r238/r243)
- Run id: playtest-loop-a-20261119T124738Z (scheduled Thu 2026-11-19 06:45 CST)
- Base: local master `e1f002065` (worktree branch journey-deepening; deepening r243 F2 fix + establishment r243 + crisis r247 adoption + social r238 adoption). The only src/js delta this run is the F8 fix below (verified by git diff --stat at closeout).
- Rotation read `2` (deepening); write `2→3` at closeout with read-back.
- Policy: competent + MUSTER POLICY (r227 verbatim + r236 growth amendment + r237 F1/F2 amendments + r238 stand-down amendment) + MARCH STEP (r228 verbatim, driver-only). The muster/march machine is otherwise unchanged since r243.
- Seeds: panel 105021–105028 (8 seeds); probe seed 105029 (dedicated, NOT scored in panel metrics — reported under Q1-probe only).
- Seed-band freshness check (local_seed_band_freshness): repo evidence `*-prereg.md` via git grep — 0 hits for 105021–105029; evidence filenames 2026-11-19 — 0 hits for 10502x; git log --grep — 0 hits. Nearest named bands 105011–105019 (r243), 105101. Band 105021–105029 is fresh.
- Driver: fork of scripts/journey-deepening-r243-20261119.js (band + tag r244; r243 instruments carried) + F8 wild instrument (scan panel transcripts for the "stays between us" exit line; each hit joined to the sitting's secret state and read in full) + Q3 march sub-gate instrument (blades at march-fight time vs the 10-blade gate). Analyzer: fork of scripts/analyze-journey-deepening-r243-20261119.js + F8 scan + Q3 sub-gate march section. Proof tests: new F8 test + forked muster/march/analyzer tests from r243.
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing >= 100 + readiness bars; observation channel: 2 survived encounters → trick) + docs/CONVERSATIONS.md (exits cycle; convo data in src/data/characterGen.json). NO canon doc covers titans/muster — mechanism grounded in src/js/titans.js + src/data/titans.json (Herald: wave 4, minAllies 10; quota 6 iff trust >= 70 and opinion >= 10 else 2; refusal bars trust < 25 / opinion < -10 / arrears > 0; Haven commit cap 3).

## The one src fix (r243 F8 — owed to this run)

**F8 — "This stays between us, right? Right." closes a sitting where NOTHING was confided.** r238, 1/106 transcripts (Ellie 104806 d60, cautious temperament exit pool, `src/data/characterGen.json` cautious exits). The line implies a confidence was shared; in that sitting none was. The conversation state already carries the exact flag (`c.secretShared`, set only when the villager volunteers a secret as the opener, conversation.js:3793; the secret thread is entered only there).
- FIX (src/js/conversation.js, `endConvo` ~8496): filter that line out of the exit pool unless `c.secretShared` is true. Data untouched — the line stays in the cautious pool for sittings where a secret WAS shared. Defensive: filter only when the pool still holds >1 line after filtering, so a one-line pool can never empty.
- PROOF: scripts/test-convo-exit-secret-gate-20261119.js — RED+GREEN before landing (RED verified against the unfixed code: the line is pickable with no secret shared; GREEN on the fixed build: never pickable without a secret, still pickable with one; close-tier shorthand pool unaffected; grieving/scared pools unaffected).
- CONVERSATION-AUDIT RE-CHECK (r243's owed item): the relevant conversation tests (cycle/norepeat, coherence) run as part of the gate; any exit-pool regression is a landing blocker.

## Q1 — F8 FIX + WILD CHECK (primary)

- Proof test GREEN (RED verified) = the gate holds at unit level.
- Wild: the analyzer scans every panel transcript for the line. Bar: **0 occurrences in sittings where no secret was shared**. Any occurrence is read in full (people-check style) and judged: did that sitting share a secret? A hit in a secret-less sitting is a NO-GO on the fix, investigated before landing.
- Verdicts: GO (proof green + 0 bad wild hits), NO-GO (a bad wild hit, or proof RED), UNMEASURED (the line never fires panel-wide AND the proof test is the only evidence — reported as such, the proof still stands).

## Q2 — COALITION-REACH (secondary, outcome; r235 metric-review adopted)

Bound metric: per seed, max blades (allies + haven) reached while a titan is present. Bar: >= 6/8 seeds reach 10. r243: 1/8 FAIL (three villages sat one blade short 12–23 days; muster tops out at 9 = 6 allies + 3 Haven; Haven cap of 3 the binding blade). Re-measure on this fresh band. A second FAIL with the same 9-blade shape confirms the wall on two fresh bands and sends the design call (more allies / more Haven / lower gate) to the build arm with two panels of evidence. The metric stands as written; no mid-run re-scoring.

## Q3 — MARCH-VS-GATE (secondary, new, descriptive — no bar)

r243's seed 105016 slew the Herald day 85 on the march with **8 blades** — under the 10-blade gate. The gate's arithmetic and the march's reality disagree: a party that walks to the monster fights with whoever is there, gate or no gate.
- Instrument: the analyzer reports every march fight with the blade count at fight time, split sub-gate (<10) vs at-gate (>=10), with outcomes (slain / routed / lost).
- Question: how often does a sub-gate march fight, and does it win? Feeds the design call on the gate; no verdict this run — the number is the finding.

## Policy safety rules (part of the prereg, not tunable mid-run)

- Muster (r227 verbatim + r236 growth amendment + r237 F1/F2 + r238 stand-down): call ONCE per link-count change OR once per growth-line hearing (refusals cost trust −8 per call, never sound daily without the line or a new link); council once per muster (re-armed on dissolution); one commit cycle per muster (re-opened on fresh Haven growth or dissolution); titanCommitOwn two-tap in one daily tick.
- Titan carve-out in policy.fight applies ONLY when the fight holds a titan monster id AND Game.titanMusterReady(mid) is true; the mid-fight hpPct < 0.35 flee and the stalemate flee stay as-is.
- March (r228 verbatim): fires ONLY for a located (stage >= 2), present, unslain titan with a READY muster; sanctity holds (over / tbfight / pendingEncounter / tableActive / sleeping) use the braced pattern (hold(...) then continue INSIDE the if); never marches without a ready muster, never outfits allies, never touches finale/nielsen campaign gates.
- Probe rule (carried): the staged departure fires ONCE, on the probe seed only, at the first qualifying dawn; it never touches a panel seed, never slays the herald (slain stays empty — the stand-down's !slain guard must see a departure, not a kill), never re-adds the herald.
- No seek-the-titan pathfinding beyond the march. If a muster completes but no fight fires by day 100, that is a recorded finding (march gap), not a policy failure to hide.

## Q4 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING LAW): does the NPC want something, do options engage/deflect it, do endings resolve/plant/owe? Note verbatim lines. Also read the muster/march/fight voice in full on at least one seed (the growth line itself is Q1's instrument — read it in the wild, not just the count; the MUSTER BREAKS line if a stand-down fires — the probe seed's line is read in full). F8 hits, if any, are read in full here.

## Q5 — CENSUS + REACHABLE / FUN / WINNABLE

Census in plain words (who lived, who died, what they knew, what was missing). Judge reachable / fun / winnable for deepening. Carried: trick pipeline (taughtRate null rule, learnedRate), w4fights / w4kills, banked veterans, w5 unlocked/faced/killed. Slain-field carried as a watch. Refusal-heard carried as a regression watch.

## Substrate checklist (§14b, before the pilot)

1. Contact: short musters occur on the deepening band (r243: 1/8 reached 10, three sat at 9 for 12–23 days). The probe seed must reach a standing muster for the stand-down probe to judge; if it never does by day 100, the probe reports UNMEASURED with the series as evidence.
2. Pool sizing: the GO bar needs >= 1 staged departure with a standing muster. The probe stages it deterministically once the muster stands; the only failure mode is a muster that never stands.
3. Verb existence: the fix needs no new verb — `endConvo` already reads the exit pool and `c.secretShared`; the probe calls the existing `titanStandDown` verb, proven by r242/r243.
4. Horizon fit: DAYCAP 100 — r237's strand spanned d67–d101; the phenomenon is inside the horizon.

## Watches (no verdicts unless the bar trips)

- Q1 stand-down probe (standing instrument): bar unchanged (stand-down fires same morning, 0 stranded days).
- F2 wild check: spoken-have == gate count on every refusal; 0 mismatches.
- Q1-growth-line REGRESSION WATCH: r237 bars unchanged (0 bad lines, 0 repeats, harvests exact on both legs). A miss here is a regression on the repaired harness — investigate before landing anything.
- Scholar deaths (standing metric): compare against r243 (22 total, 13 wild), NOT the establishment ≤2/panel bar.
- Survival vs r243 (8/8 survived, 100d).
- Ladder stage at d80; regional links seasoned by d80.
- Wave-3 wild Reunion: fights + outcomes (arena cap landed; wild untouched).
- Herald gorge: transcript lines where the titan eats from the stores — counted only if the analyzer scan finds them; no verdict.
- FIGHTALLY2: second ally slot landed. Watch wave-4/titan fight party sizes in wildFightTable — no verdict, the fightallycap confirm panel owns the verdict.
- TableActive distinction (r242 landed tableSitting() in src/js/table.js): NOT adopted by this run's driver — the march sanctity gate still uses tableActive(). Deferred to a later deepening run; the r242 scale verdict carries the distinction for now.
- F2 watch — REARM-GO, keep as a watch. The reset log stays in the per-seed JSON.
- March latency (r237 F4: ready → fight latency 19 days on 104607, 11 holds): report ready→fight latency per seed; no bar.

## Pilot gate (before the full panel)

3 seeds (105021–105023). Gate: driver runs clean (no FATAL seeds), musterLog rows present on titan-days, Q1-growth shows no NEW bad-line class (a bad line naming the r236 harness-order shape again is a repair failure, not a new defect — fix before the panel), probe seed stages (or reports why not — the probe runs on its own seed in parallel with the pilot). If the pilot shows a STRANDED day on a wild seed, that is the defect under test — fix the driver before the panel (r237 precedent); the panel verdict comes from the repaired build only. The pilot seeds are scored (r233/r240 precedent) unless the pilot forces a driver change, in which case the panel re-runs on the repaired build and the pilot is re-run.

## Flap note (infra — write flap, ongoing)

- r243 (this morning): registration failed ~05:57–06:00Z (worktree checkout refused fresh-file writes); probes failed 06:03Z and 06:05Z; runtime restart ~06:07–06:10Z; registration succeeded on retry. Flap flickered again from ~06:32Z (git index-lock writes refused, large fresh-file copies created 0-byte files ~25 times 06:48–06:55Z, cleared 06:56Z).
- This run (r244): registration took ~6.6 min (12:49–12:56Z) on the 23G checkout, no write refusals seen; probe `git update-ref refs/heads/probe-r244 HEAD` OK 12:57Z. Per the flap skill: probe before writes that matter, verify size after every write, never claim success on a write that was refused.

## Gate / telemetry

- `node scripts/check.js --quick` in the worktree (cache /tmp/jest-cache-playtest); 0 attributable failures = GO.
- Telemetry: `node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/deepening.json --current 'evidence/2026-11-19/journey-deepening-r244-*-seed*.json'`. Known LOUD schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on that line alone; any NEW loud line is a same-run investigation item.

## Metric review (filled at closeout)

- (to be filled)
