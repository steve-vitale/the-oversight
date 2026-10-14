# ARM "proposelayer" — policy-side propose layer on competent (the verb gap) — KILLED AT PILOT

Worktree: `~/workspace/worktrees/sim-proposelayer`. Run: oversight-flesh-out-loop, ARM 1 of the scale-onramp run (lever-8 lens: travel & regional), 2026-10-14.

## Context
journey-scale r3 (evidence/2026-10-14/journey-scale-r3.md) pinned the competent scale silence as a **verb gap, not a survival gap**: competent.js NEVER calls proposeLink — 0/8 links formed, rank never leaves `village`, even on 152-day survivors — while the deepening-r10 HARNESS's propose driver seasoned links on 4/8 competent runs. The playtest loop flagged three options as Steve's call: (a) policy-side propose layer, (b) villager-initiated proposals, (c) rely on the scaleDiscovery beat-4 pointer alone. **This arm measures option (a) ONLY.** Options (b) and (c) are documented below, not built.

## The lever (policy layer, now DELETED per kill protocol)
`scripts/policies/proposelayer.js` (PROPOSELAYER=1, default OFF — gate off exports the pinned competent policy itself, byte-identical), wrapping competent (gates OFF), driving the REAL proposeLink verb with its real costs/guards on the proposal-window conditions (day>=25, no pending counter/accord/national, pantry>12000, known+unlinked candidates, <3 subs base layer — the window definition from evidence/2026-10-14/sim-candwindow.md). The courtship pass mirrors `scripts/policies/leadcourt.js`'s leadCourtship verb bundle exactly (composition, not duplication — code-verified: the courtship stacks drive proposeLink the same way): answer counters (sweeten at 1500 kcal when pantry>25000, else accept their terms), answer accords ('gift', real 2000 kcal), answer national beats (LEAD pick 'feast'), tend primary links weekly (1500 kcal grain, pantry>20000), answer defense calls, and propose LEAD-road subordinates — one/day, 7-day per-target cooldown, `Game.proposeLink(t.id, { asSubordinate: false, tributeKcalPerWeek: 4000 })`. The scholar pays the real proposal costs and faces the real refusal paths (decline band: cold-ask −5 opinion; counter band: played negotiation). Canon: docs/SCALE.md (the scale ladder) and docs/SCALE-DISCOVERY.md cover this area — both read before building; nothing invented.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims
- **Axis**: scale-onramp (the wall), lever-8 lens. Same code tree, identical seeds, env-var only.
- **Seeds**: 11/22/33/44/55/66/77/88. **Horizon**: 150d death-aware (dead villages stop; +10d tail max).
- **PRIMARY**: links formed >= 2/8 AND >= 1 seed reaching regional+ by day 120 (or national >= 1/8).
- **GUARDRAILS**: median survival >= control−10d; starvation deaths <= control+9 (A/A p90abs); hungryDays (fc.starveDays) <= control × 1.409 (A/A p90rel); no new death mode; exiled <= control+1.
- **Gates before spend**: proof test scripts/test-proposelayer-20261014.js RED→GREEN; det-gate 16/16 identical; SMOKE=1 instrument-honesty gate both sides.
- **GO**: primary met at pilot → confirm 12–16 seeds before calling GO. A miss is NO-GO — never re-scored mid-run.

## Gates (all green before spend)
- **Proof** `scripts/test-proposelayer-20261014.js`: REAL RED on pristine (exit 1 — armed-identity assertion fails; plus structural evidence: competent.js has zero proposeLink calls, and driving the inert policy's real daily on the open-window fixture fires the verb 0 times — the verb gap reproduced) → GREEN 11/11 when armed (propose fires through the real engine — fixture adjudicated to the counter band; cooldown holds; day/pantry/pending/subs/candidate guards hold; counter answered via the real accept path forming a subordinate link; tend/accord/national delegated to the real verbs).
- **Det-gate** `scripts/det-gate-proposelayer-20261014.js` (PROPOSELAYER=1): 8/8 IDENTICAL (16/16 runs, 150d) — before/after comparisons trustworthy.
- **SMOKE=1** `scripts/sweep-proposelayer-20261014.js`: control side 4/4 (policy unwrapped, harness invokes daily 3.8/d, 2430 policy acts); armed side 5/5 (+ layer fires the real proposeLink on the window fixture: calls=1, plProposed=1).

## Pilot (8 seeds × competent ± PROPOSELAYER, 150d death-aware, identical seeds)

| seed | ctrl d/end | armed d/end | formed | regDay | nat | w4Day | starv C/A |
|---|---|---|---|---|---|---|---|
| 11 | 150/survived | 86/village-lost | 3 | 46 | – | 62 | 0/0 |
| 22 | 150/survived | 150/survived | 3 | 46 | – | – | 0/0 |
| 33 | 35/village-lost | 37/village-lost | 3 | – | – | – | 2/5 |
| 44 | 150/survived | 150/survived | 3 | 46 | – | 58 | 0/0 |
| 55 | 149/village-lost | 109/village-lost | 3 | 46 | – | 57 | 1/0 |
| 66 | 118/village-lost | 150/survived | 3 | 46 | – | 79 | 1/0 |
| 77 | 78/village-lost | 88/village-lost | 3 | 47 | – | 57 | 0/1 |
| 88 | 51/village-lost | 80/village-dead | 3 | 46 | –(rank=national) | 57 | 1/3 |

Suite: links formed 0 → **24** (24 proposals: 22 accepts, 2 counters); seasoned 0 → 20; regional+ by d120: 0/8 → **7/8** (dawn at day 46–47 on all); national beats: 0 → 1 staged (s88, First Court, answered 'feast' by the layer); wave4: 0/8 → **6/8**; maxStanding 25 → 152; median survival 149 → **109**; starvation deaths 5 → 9; hungryDays 6 → 6; exiled 0 → 0; table/wins 0/8 both.

**VERDICT: KILLED AT PILOT.** Primary met decisively (24 ≥ 2 links; 7/8 regional+ by d120). Guardrails: median survival **MISS** (109 < 149−10=139); no-new-death-mode **MISS** at the pre-registered key level (`player:sickness`, `player:starvation`, `villager:The Eater` — see metric review); starvation, hungryDays, exiled hold. Per §14 the miss is NO-GO, never re-scored. The policy file is deleted per kill protocol; proof + det-gate + sweep + evidence + per-seed JSONs kept.

## Why it missed (honest diagnosis — the run's real finding)
The layer works exactly as designed — that is the problem. The causal chain is fully traced on identical seeds (det-gate-green, so no noise defense):
1. The propose verb fires: 3 links form ~day 25 on 8/8 seeds (the subs<3 base-layer cap binds everywhere).
2. The tend verb seasons them: 20/24 seasoned (~day 55+).
3. Seasoned links fill the **diplomacy** deed bar: endStanding shows dip=102 (= 3 × 34/seasoned regional+ link) on every wave-4 seed, war 0–50. Wave 4 unlocks at day 57–62 on 6/8 seeds — **via diplomacy, not war**.
4. Wave-4 monsters then kill the diplomats: s11 (150→86, 9 villager:combat + 3 villager:monster), s55 (149→109), s77 (78→88), s88 (51→80, village-dead 4 days after its First Court).

The diplomacy road to wave 4 unlocks the wave **without selecting for military readiness** — the war road unlocks wave 4 by killing wave-3+ monsters (villages that can already fight); the diplomacy road unlocks it by holding three seasoned friendships (villages that may not). s22 is the control case inside the armed arm: only 2 links seasoned (dip=68 < 100), wave 4 never unlocked, survived 150. s44/s66 unlocked wave 4 and survived anyway — it is probabilistic, not certain, death.

So: the verb gap is closed (links form, regions dawn, a national court sat), but the wall moved rather than fell — **reaching scale via diplomacy alone gets you killed by the content you unlocked**. The food costs of diplomacy itself are honest and affordable (starvation 9 vs 5 within the +9 A/A bound; hungryDays flat at 6; tend grain + accord gifts + counter tribute all paid without a pantry crisis — s33's 4 starvation deaths are on a seed that died at d35–37 regardless). The killer is wave-4 monsters, not the pantry.

## SENSE-TESTING (armed s88 + s22 scale beats — judgment, not counts)
The scale content my layer touches plays end-to-end and reads as coherent, consequential, human:
- s88 d72: "Emberhold watches to see if Haven holds without its dead — and presses the tribute down to 2,250 kcal/week while the chair is empty. They'll test the link. Count on it." — subordinates probe Haven's weakness after deaths. A live relationship, not a buff.
- s88 d74: "🏃 Deshawn of Thornfield walks into Haven unannounced, pack-mules behind. 'Heard your bins are echoing. Thornfield has grain to spare — 2,772 kcal, no tribute, no ceremony. Say the word.'" → "That's what the fire network is FOR. (Trust +4.)" — aid flows the other way, unasked.
- s88 d76: "◈ SYSTEM: 'Four fires. One head. GOVERNANCE LAYER: online — polity tribute routing, the court calendar, famine reserves. You built a realm. Try not to lose it the way you found it.'" + the First Court beat with the played FEAST/HOST choice. The transition is a moment, not a threshold — canon honored.
- s22 d144: "In the chaos, the neglected link snaps — no tribute, no deeds, no one left who kept it. Nobody meant it. That's how these things go." / "The link with The Hungry Road is broken (succession). What was built over weeks comes apart in a sentence." — a link dies of neglect during chaos. Real consequences, well written.
- s22 d147: "🌾 Thornfield's tribute comes up thin — 536 of 1,266 kcal. They sent everything the wagons could carry, and it wasn't enough. The shortfall rides as arrears (+730 kcal). (Trust −1.)" — tribute with arrears, proportional honor.

**PASS** on meaning and coherence. The layer added no fiction of its own; every line above is engine text the policy's verbs earned.

## Village assessment (plain words)
The armed villages are the control villages with one new verb — and it changes their fate. Control villages live small, attritional, village-scale lives and mostly coast (3/8 survive the full 150). Armed villages court: three proposals go out ~day 25, three fires answer, grain walks both directions weekly, and at day ~46 the System announces the network. Then the diplomacy bar fills and wave 4 unlocks at day ~60 — and the villages that climbed socially but not martially bleed out through wave-4 combat (s11's nine combat deaths in the two weeks after its unlock). s88 is the tragedy and the proof: it built the realm — four fires, one head, the court sat, tribute flowed (2,813 kcal from Emberhold on d77) — and died at d80 with the governance layer four days old. s22 is the quiet counterpoint: it held two seasoned links for 104 days, never unlocked wave 4, buried a third link to succession neglect on d144 ("Nobody meant it. That's how these things go"), and lived. The missing capability is not food or diplomacy — it is **military readiness on the diplomacy timeline**: nothing in the climb warns or prepares a village that wave 4 is coming at day ~60 because its friendships are strong.

## Reachable / fun / winnable (scale leg, competent + propose layer)
- **Reachable:** YES for the propose verb — 24/24 proposals adjudicated honestly (22 accepts, 2 counters), 7/8 regional dawns, 1 national court staged and answered. The verb gap is closed at the policy level.
- **Fun:** YES where it fires — the courtship, the testing subordinates, the aid, the court. The s88/s22 beats are the best-read scale content in any sim this loop has run.
- **Winnable:** NO — 0/8 national held, 0/8 table, 0/8 wins. One national staged and the village died 4 days later. The wall's current face for the diplomacy road is wave-4 lethality, not link formation.

## Metric review (§14 — for the NEXT run, not this one)
1. **The no-new-death-mode key comparison is string-fragile** (candwindow's metric review predicted exactly this: "compare cause families, not victim-prefixed keys" — not incorporated into this run's pre-reg, my miss). At the cause-family level the armed side adds NOTHING: `player:sickness`/`player:starvation` match control's `villager:sickness`/`villager:starvation`; `villager:The Eater` is a monster-kill like control's `villager:The Bright Bastard`. Family-level, the guardrail HOLDS. Next run: compare cause families (strip the `player:`/`villager:` prefix and named-monster keys to a `monster` family) — but this run stays NO-GO on the pre-registered keys, and the median-survival miss stands regardless.
2. **The median-survival guardrail did its job.** 149→109 is a 40-day real drop through a traced causal chain, not noise (det-gate 16/16; mechanism: diplomacy→wave-4→combat deaths). The guardrail exists to catch exactly this: a lever that wins the metric and kills the village.
3. **The primary's regional+ prong was almost too easy** — 7/8 once the verb exists (dawn = first link + 21 days, deterministic). The binding constraint was never the dawn; it is what the dawn unlocks. Future primaries on this axis should measure wave-4 survival or national-held, not link counts.
4. The `regionalDay`/`networkLiveDay` read worked cleanly as the regional+ instrument — keep it.

## Blanks (documented, not fixed)
1. **DIPLOMACY ROAD TO WAVE 4 IS LETHAL (this run's headline):** 3 seasoned links = 102 diplomacy ≥ the 100 wave-4 bar → unlock at day ~57–62 → wave-4 monsters kill diplomat villages (4/6 unlocking seeds died 20–50 days early; median −40d). The war road selects for readiness; the diplomacy road doesn't. Design space (Steve's call): gate diplomacy-unlocked wave 4 behind a readiness signal, slow the diplomacy bar, or make wave-4-vs-diplomat-villages survivable. Appended to hidden_files/sim-findings.md as [open].
2. **Steve's three options:** (a) policy-side propose layer — MEASURED HERE, killed at pilot (works, costs 40 median days via the wave-4 chain). (b) villager-initiated proposals — needs engine design (villagers as diplomats: who proposes, with what authority, what costs; comms.js/conversation-adjacent). (c) scaleDiscovery beat-4 pointer alone — needs the beat to actually fire on competent runs (it triggers on wave-3-points-at-bar + sub-regional; none of these runs reached it) and a measurement of whether a pointer suffices where no verb is exercised.
3. **The subs<3 base-layer cap binds on 8/8 seeds** (exactly 3 links everywhere) — the fourthlink/fifthlink stacks already explore uncapped courtship; a propose-layer variant on those stacks would test whether 4+ links change the wave-4 timing, but the lethality finding says the direction is readiness, not more links.

## Convergence
scale-onramp: CONVERGING (unchanged). The verb gap is closed at the policy level (competent+propose: 24 links, 7/8 regional, 1 national staged), but the axis does not move until a non-courtship policy reaches national AND holds it — the current face of the wall is wave-4 lethality on the diplomacy timeline, one layer deeper than the verb gap.

## Files
- `scripts/policies/proposelayer.js` — DELETED per kill protocol (no trace).
- `scripts/test-proposelayer-20261014.js` — proof, REAL RED (exit 1) → GREEN 11/11 (kept).
- `scripts/det-gate-proposelayer-20261014.js` — det-gate 8/8 IDENTICAL, 150d (kept).
- `scripts/sweep-proposelayer-20261014.js` — pilot sweep + SMOKE=1 gate + COMPARE=1 verdict (kept).
- `evidence/2026-10-14/sim-proposelayer-control.json`, `sim-proposelayer-armed.json` — per-seed evidence rows (kept; rows carry linkpipe, fc/starveDays, sr/scale, tune/standing, deathCauses, proposelayer counters, scaleLines transcript material, regionalDay).
- `evidence/2026-10-14/sim-proposelayer-r33.md` — this file.
- Telemetry note for the coordinator: per-seed JSONs above are the telemetry-check inputs (national, table, wins, exiled per-row fields present). No telemetry-check run by this worker — coordinator owns the baseline roll per loop-body step 10 (same convention as sim-candwindow).
