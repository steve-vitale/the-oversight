# Journey deepening r243 — prereg

- Run: r243, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222/r226/r227/r232/r235/r236/r237/r238)
- Run id: playtest-loop-a-20261119T055025Z (scheduled Wed 2026-11-18 23:45 CST)
- Base: local master `b76d65445` (worktree branch journey-deepening; r242 establishment + ship version bump). The only src/js delta vs r238's base this run is the F2 fix below (verified by git diff --stat at closeout).
- Rotation read `2` (deepening); write `2→3` at closeout with read-back.
- Policy: competent + MUSTER POLICY (r227 verbatim + r236 growth amendment + r237 F1/F2 amendments + r238 stand-down amendment) + MARCH STEP (r228 verbatim, driver-only). The muster/march machine is otherwise unchanged since r238.
- Seeds: panel 105011–105018 (8 seeds); probe seed 105019 (dedicated, NOT scored in panel metrics — reported under Q1-probe only).
- Seed-band freshness check (local_seed_band_freshness): repo evidence `*-prereg.md` via git grep — 0 hits for 105011–105019; full prereg number list (104000–106000) shows the nearest named bands 105001–105008, 105101, 105201–105208 — 105011–105019 absent; hidden evidence — 0 namings (the only 10501[1-9] content hits are numeric substrings inside old JSON corpora, e.g. `"pantry":105017` kcal and float substrings like `93618.55105016391`, not seed bands — same class r238 documented for 10480x). REJECTED first choice: 104901–104908 (104905–104908 prereg-named). REJECTED: 105001–105008 (all prereg-named); 105101 (per-seed files belongfeast-105101.json / leadfeast-105101.json exist).
- Driver: fork of scripts/journey-deepening-r238-20261118.js (band + tag r243; r238 instruments carried) + staged-departure probe (Q1, below) + F2 wild instrument (record the spoken `have` on every refusal; analyzer checks spoken-have == gate count). Analyzer: fork of scripts/analyze-journey-deepening-r238-20261118.js + probe-aware Q1 reporting. Proof tests: new F2 test (15 checks) + forked muster/march/analyzer tests from r238.
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing >= 100 + readiness bars; observation channel: 2 survived encounters → trick) + docs/CONVERSATIONS.md (for the carried F8 note). NO canon doc covers titans/muster — mechanism grounded in src/js/titans.js + src/data/titans.json (Herald: wave 4, minAllies 10; quota 6 iff trust >= 70 and opinion >= 10 else 2; refusal bars trust < 25 / opinion < -10 / arrears > 0; Haven commit cap 3).

## The one src fix (r238 F2 — owed to this run)

**F2 — Refusal line understates the muster.** The titan fight wrapper's refusal counted ALLIED blades only (`muster.allies.length`, raw: duplicates and the dead included, Haven excluded) while the hard gate counts unique living allies + committed Haven blades. On r238 seeds 104806/104807 the line said "you have 6" on 14 refusals each while the muster genuinely stood at 9 (6 allies + 3 Haven). The spoken number contradicts the world, and the muster decision it informs is made on a lie.
- FIX (src/js/titans.js): one shared helper, `titanMusterBladeCount(titanId)` (unique living allies via `titanUniqueAllies` + committed Haven blades via `titanHavenBlades`, deduped), read by BOTH the hard gate (`titanMusterReady`) and the refusal's spoken `have` (and the recorded outcome detail). The gate and the line cannot drift again. The line text is unchanged — "allied blades" is still accurate (Haven blades ARE allied blades, 2026-10-13); only the number now tells the truth.
- PROOF: scripts/test-titan-refusal-have-counts-haven-20261119.js — 15 checks, GREEN on the fixed build (6+3 refused with "you have 9", outcome detail have 9 / need 10; 6+0 control says 6; duplicate ally entry does not inflate; 10 blades reads ready). RED verification (same test on the unfixed build) is DEFERRED to closeout — the write flap blocked every attempt (fresh-file writes and git index-lock writes refused intermittently from ~06:32Z; see Flap note below). RED must pass before landing; if the flap still blocks it at closeout, nothing lands.

## Q1 — STAGED-DEPARTURE PROBE (primary)

The stand-down rule (r238, proven at unit level M24–M28) is UNMEASURED in the wild on two straight panels — the departure it judges occurs ~1/16 seeds. This run stages it explicitly, as r238 F1 prescribed ("the prereg must name that probe explicitly").
- PROBE (driver-side, probe seed 105019 only): at the first dawn where the herald muster holds >= 1 blade (allies + haven) and the omen stage is >= 2, the driver removes the herald from `state.worldMonsters` — the same world state a natural departure produces (the daily census reads that array; titans arrive by omen only and are never re-added) — and logs a probe row `{ day, probe: 'staged-departure', before }`. The muster step then sees blades + absent + not slain and must call `G.titanStandDown('herald')` that same morning.
- Bar: the stand-down fires that same morning (musterLog row `held: 'stood-down'`, `after` empty) and 0 STRANDED days follow (a STRANDED day = a musterPlay snapshot where the muster still holds blades AND the herald is absent AND the previous day's snapshot ALSO showed blades + absent). The departure morning itself (first absent snapshot) is NOT stranded.
- Verdicts: GO (stand-down fires same morning, 0 stranded days), NO-GO (>= 1 stranded day, or the stand-down fails to fire — classify per §14a), UNMEASURED (the probe seed never reaches a standing muster by day 100 — the phenomenon never stages).
- Wild Q1 on the 8-seed panel reported alongside under the same STRANDED bar (r238 wording); expected UNMEASURED given the 1/16 rate, reported not assumed. The probe seed is excluded from the panel's wild Q1 count.
- Secondary: upkeep saved (blades × days the muster would otherwise have stood), reported as context not a bar.

## Q2 — COALITION-REACH (secondary, outcome; r235 metric-review adopted)

Bound metric: per seed, max blades (allies + haven) reached while a titan is present. Bar: >= 6/8 seeds reach 10. Secondary watch: longest one-short run. Analyzer reports reached-10 alongside the band's link/trust depth (linksMax from musterLog, mean trust at last trustSnap). F2 WILD CHECK (new): on every refusal in the panel, spoken-have == gate count (musterLog/outcome detail); 0 mismatches. A mismatch is a NO-GO on the fix, investigated before landing.

## Policy safety rules (part of the prereg, not tunable mid-run)

- Muster (r227 verbatim + r236 growth amendment + r237 F1/F2 + r238 stand-down): call ONCE per link-count change OR once per growth-line hearing (refusals cost trust −8 per call, never sound daily without the line or a new link); council once per muster (re-armed on dissolution); one commit cycle per muster (re-opened on fresh Haven growth or dissolution); titanCommitOwn two-tap in one daily tick.
- Titan carve-out in policy.fight applies ONLY when the fight holds a titan monster id AND Game.titanMusterReady(mid) is true; the mid-fight hpPct < 0.35 flee and the stalemate flee stay as-is.
- March (r228 verbatim): fires ONLY for a located (stage >= 2), present, unslain titan with a READY muster; sanctity holds (over / tbfight / pendingEncounter / tableActive / sleeping) use the braced pattern (hold(...) then continue INSIDE the if); never marches without a ready muster, never outfits allies, never touches finale/nielsen campaign gates.
- Probe rule (new): the staged departure fires ONCE, on the probe seed only, at the first qualifying dawn; it never touches a panel seed, never slays the herald (slain stays empty — the stand-down's !slain guard must see a departure, not a kill), never re-adds the herald.
- No seek-the-titan pathfinding beyond the march. If a muster completes but no fight fires by day 100, that is a recorded finding (march gap), not a policy failure to hide.

## Q3 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING LAW): does the NPC want something, do options engage/deflect it, do endings resolve/plant/owe? Note verbatim lines. Also read the muster/march/fight voice in full on at least one seed (the growth line itself is Q1's instrument — read it in the wild, not just the count; the MUSTER BREAKS line if a stand-down fires — the probe seed's line is read in full).

## Q4 — CENSUS + REACHABLE / FUN / WINNABLE

Census in plain words (who lived, who died, what they knew, what was missing). Judge reachable / fun / winnable for deepening. Carried: trick pipeline (taughtRate null rule, learnedRate), w4fights / w4kills, banked veterans, w5 unlocked/faced/killed. Slain-field carried as a watch. Refusal-heard carried as a regression watch.

## F8 — CARRIED, NOT BUILT THIS RUN

r238 F8 (voice, rare — 1/106 transcripts): "This stays between us, right? Right." closes a sitting where NOTHING was confided (Ellie 104806 d60, cautious temperament exit pool, `src/data/characterGen.json` cautious exits). The fix is sketched, not built: in `endConvo` (conversation.js ~8463), filter that line out of the exit pool unless the sitting shared a secret — the conversation state already carries the exact flag (`c.secretShared`, set only when the villager volunteers a secret as the opener, conversation.js:3793; the secret thread is entered only there). Deferred because the write flap cost ~50 minutes of this run's budget and the fix needs a conversation-audit re-check the run cannot fit. The defect is rare and cosmetic; the F2 honesty bug (spoken number wrong on 28 refusals) takes the run's build slot. Owed to the next deepening run or a conversation-voice arm.

## Substrate checklist (§14b, before the pilot)

1. Contact: short musters occur on the deepening band (r238: 4/8 stuck at 7–9 blades). The probe seed must reach a standing muster for Q1 to judge; if it never does by day 100, Q1 reports UNMEASURED with the series as evidence.
2. Pool sizing: the GO bar needs >= 1 staged departure with a standing muster. The probe stages it deterministically once the muster stands; the only failure mode is a muster that never stands.
3. Verb existence: the fix needs no new verb — the wrapper calls the existing `titanMusterBladeCount` helper; musterPlay calls the existing `titanStandDown` verb, already proven by the r242 scale driver + win-plan departure.
4. Horizon fit: DAYCAP 100 — r237's strand spanned d67–d101; the phenomenon is inside the horizon.

## Watches (no verdicts unless the bar trips)

- Q1-growth-line REGRESSION WATCH: r237 bars unchanged (0 bad lines, 0 repeats, harvests exact on both legs). A miss here is a regression on the repaired harness — investigate before landing anything.
- Scholar deaths (standing metric): compare against r238 (20 total, 10 wild), NOT the establishment ≤2/panel bar.
- Survival vs r238 (7/8 survived, 100d).
- Ladder stage at d80; regional links seasoned by d80.
- Wave-3 wild Reunion: fights + outcomes (arena cap landed; wild untouched).
- Herald gorge: transcript lines where the titan eats from the stores — counted only if the analyzer scan finds them; no verdict.
- FIGHTALLY2: second ally slot landed. Watch wave-4/titan fight party sizes in wildFightTable — no verdict, the fightallycap confirm panel owns the verdict.
- TableActive distinction (r242 landed tableSitting() in src/js/table.js): NOT adopted by this run's driver — the march sanctity gate still uses tableActive(). Deferred to a later deepening run; the r242 scale verdict carries the distinction for now.
- F2 watch — REARM-GO, keep as a watch. The reset log stays in the per-seed JSON.
- March latency (r237 F4: ready → fight latency 19 days on 104607, 11 holds): report ready→fight latency per seed; no bar.

## Pilot gate (before the full panel)

3 seeds (105011–105013). Gate: driver runs clean (no FATAL seeds), musterLog rows present on titan-days, Q1-growth shows no NEW bad-line class (a bad line naming the r236 harness-order shape again is a repair failure, not a new defect — fix before the panel), probe seed stages (or reports why not — the probe runs on its own seed in parallel with the pilot). If the pilot shows a STRANDED day on a wild seed, that is the defect under test — fix the driver before the panel (r237 precedent); the panel verdict comes from the repaired build only. The pilot seeds are scored (r233/r240 precedent) unless the pilot forces a driver change, in which case the panel re-runs on the repaired build and the pilot is re-run.

## Flap note (infra — write flap, ongoing)

- Registration failed once (~05:57–06:00Z): `git worktree add` checkout refused fresh-file writes (`unable to write file` on 5 files; `fatal: Could not reset index file to revision 'HEAD'`); left an orphaned branch `journey-deepening` at master (no registry entry, no tree). The register script's fallback attaches to the existing branch, so the retry needed no cleanup.
- Probe `git update-ref refs/heads/probe-r243 HEAD` failed 06:03Z and 06:05Z (couldn't write `.git/refs/heads/probe-r243.lock`); /tmp fresh-file write refused ~06:02Z. Runtime restart ~06:07–06:10Z; probe OK 06:10:07Z; registration succeeded on retry (~06:13–06:15Z, EXIT 0; heartbeat 06:18:43Z, hbloop pid 3572, 9-min cadence).
- Flap flickering again from ~06:32Z: git index-lock writes refused (`git stash` failed twice), fresh-file writes refused intermittently (a 111743-byte backup copy created a 0-byte file, then a probe write succeeded 30s later, then the same copy failed again). Plain writes to existing files and tiny fresh writes sometimes land; large fresh writes and git internals usually refuse. Per the flap skill: probe before writes that matter, verify size after every write, never claim success on a write that was refused.
- Consequence for this run: F2 RED verification deferred to closeout (see above); every evidence write is size-verified; closeout commits need git writes — if the flap is still active, the run aborts loudly at that point with nothing half-landed.

## Gate / telemetry

- `node scripts/check.js --quick` in the worktree (cache /tmp/jest-cache-playtest); 0 attributable failures = GO.
- Telemetry: `node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/deepening.json --current 'evidence/2026-11-19/journey-deepening-r243-*-seed*.json'`. Known LOUD schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on that line alone; any NEW loud line is a same-run investigation item.

## Metric review (filled at closeout)

- (to be filled)
