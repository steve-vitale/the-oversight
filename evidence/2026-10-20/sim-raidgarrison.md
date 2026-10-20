# sim-raidgarrison — the garrison doctrine: def5-window raid-defense posture (flesh-out loop, 2026-10-20, ARM sim-raidgarrison)

Run: fleshout-20261020T1015Z, arm sim-raidgarrison. Axis: scale-onramp (the blocking axis).
LEVER RUN — one new policy-side file (scripts/policies/raidgarrison.js), zero src/js changes.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; "Monster encounters are fought, not rolled", Steve 2026-10-08), docs/PRESERVATION.md (pantry/wealth draws teeth — raids are reactive on pantry kcal). The raid system: src/js/havenGrowth.js (havenRaidTick — reactive raids: 3+ world monsters, 3k+ pantry kcal, 7-day cooldown, 18% roll; wealth draws teeth: 3 raiders base, +1 above 12k, +1 above 24k pantry kcal, cap 5; defenders = healthy at-home villagers, one per raider, sequential real fights; unmet raiders LINGER and gorge nightly; without a palisade a surviving raider reaches the sleeping scholar's bedroll via pendingEncounter); the aid chain: src/js/comms.js (raid raises the aid crisis reactively; lingering raiders during a crisis route through aidFight); the deferral: src/js/standing.js (standingDeferral(5) — wave-4 unlocked, readiness bars short).

## Design calls (documented — the doctrine)

While the def5 window is live (Game.standingDeferral(5).deferred — the engine's own deferral state, hooked read-only; the WINDEFER layer composes underneath, untouched):
1. **HOMEKEEP — keep fighters home.** Covenant defense calls and trade-league favor calls are answered 'refuse' instead of 'send': no 2-villager/3-day away parties draining the home-defender bench. The engine's own refusal path fires — said aloud, the real trust price paid (defense: -10 league trust; trade: the charter's cost), ledger entries written. Defense is a trade, not a tax. (The base courtship policy answers defense calls with 'send' when pop>=5 — leadcourt.js; belongseek never answers.)
2. **MUSTER ON RAID WARNING — the scholar holds Haven.** While the window is live AND the night is dangerous (an aid crisis is live, raiders linger at the treeline, or the night is raid-ripe: >=7d since lastRaidDay, pantry >= 3,000 kcal, 3+ world monsters — the engine's own havenRaidTick preconditions read back as the policy-side warning), the scholar does not leave Haven. The travelTo wrapper refuses outward travel (at-haven + destination != haven -> null, logged); homeward travel and combatExit barrier crossings always delegate (the scholarraid wrapper contract). One posture SAY-beat per muster stretch, then quiet (canon: violence is desperate and traumatic).

Lineage — what this arm is NOT:
- sim-winsupport (field-recovery: post-fight triage + raid-night rest posture): KILLED concept-dead (549a640cd) — all 4 field-recovery variants missed on 160 fresh-seed runs. The garrison has NO field-recovery half and NO rest verb.
- sim-raidwall / sim-scholarraid / sim-shelteronly / sim-raidstand: all RAID-LIVE reactive (engage only while a raid crisis is live or raiders linger). The garrison is DEF5-WINDOW proactive: it postures for the whole deferral window, and its novel core (the fighter-drain refusal) was never tested.
- sim-raiddef (2026-10-14): raid-night scholar party-building at the door, KILLED. The garrison never fights at the door; it keeps fighters home.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** window raid-death SHARE — raid-channel deaths inside def5 'died' windows / all deaths inside def5 'died' windows, pooled per arm, armed vs control on IDENTICAL seeds, paired deltas per (policy, seed). (Window definitions identical-by-construction with analyze-windowsurvive-20261019.js, incl. the endRec-boundary fix.)

**GO:** armed share <= 0.5x control share.

**GUARDRAILS (all must hold):**
- starvation deaths <= control + 2 (the garrison must not starve the village)
- median survival >= control - 10d
- wave-4 readiness-bar fill not worse than control (terminal mean short bars armed <= control + 0.5)
- no new death mode (a new cause counts at >= 2 events)

**SECONDARY (report, don't judge):** scholar vs villager window-raid deaths; raid deaths by rule; wall numbers (national/table/wave-4/wave-5/wins); garrison engagement (garrisonDays, musterDays, travelRefusals, defense/trade calls seen+refused, beats).

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max). Why 180: the def5 window is a late-window phenomenon (median window 78d, def5 opens ~d50-70); shorter caps truncate the windows the arm exists for.

**Seeds:** pilot 8 (64001–64008) x {leadfeast, belongfeast} x {control, armed} = 32 runs. IDENTICAL seeds on both arms (paired before/after). Seeds verified fresh: no `-s6400*.json` hits across evidence/*/perseed-*/ before the run.

**Policies:** competent-player policy; substrate pre-seat + windefer (the sim-w5door-measure substrate): withSeatDrive(withWinDefer(withReposition(TF base))) on {leadfeast, belongfeast} tribfloor bases. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 (+ RAIDGARRISON=1 armed only; VETREL/REPOSITION unset -> inert).

**Instrument:** scripts/probe-raidgarrison-20261020.js (reuse-fork of probe-raidstand-20261019.js: identical policy stack + identical pure death-capture reads + identical death-channel classifier; the deliberate changes: the raidgarrison layer outside on the armed arm, the ARM dimension, the winarm tag, ctx._raidgarrison ledger capture, seeds 64001-64008, no VETREL), scripts/analyze-raidgarrison-20261020.js (arm-shift comparison against the 0.5x bar), scripts/build-raidgarrison-panels.js (§15 balanced-panel compare builder), scripts/test-raidgarrison-20261020.js (proof: GATE + HOMEKEEP + MUSTER + WINDOW + SMOKE + DET + VERDICT — GATE pins layer-off == bare stack; DET pins RAIDGARRISON=1 vs unset byte-identical until the first engagement morning; RED->GREEN demonstrated on fixture Game: 4 doctrine assertions fail on the bare base, 26/26 pass wrapped).

**No [needs-eyes]:** policy-side sim lever, no player-facing change.

## Metric review

(pre-registered doubts — for the NEXT run if the metric proves wrong; the GO bar above binds THIS run, §14)
1. **Share vs absolute:** the share can move if the garrison changes non-raid window deaths (e.g. holds trading expedition deaths for starvation). The guardrails (starvation, survival, readiness) judge that; the secondary absolute counts are reported alongside.
2. **Window definition:** only 'died'-outcome def5 windows count (the windowsurvive convention); deaths in 'horizon'/'regressed' windows are contrast, not primary. A garrison that converts died-windows into horizon-windows shows up in the wall numbers instead.
3. **Classifier noise** (raidwall diagnosis #4): deaths during a live raid crisis count as raid-channel even when the killer was unrelated. The primary is conservative (some counted deaths were never addressable by the garrison).
4. **Night-1 draft**: the raid fires at endDay; the garrison's muster only reaches post-night-1 nights. Night-1 bedroll deaths are unpreventable policy-side.
5. **The 0.5x bar is the hypothesis under test.** Four consecutive raid arms landed 15–22% with all guardrails passing (raidwall -18.2%, scholarraid -17%, shelteronly -17%, raidstand -2.9%). If this arm lands in the same band, the metric review decides: converge the bar or keep hunting the residual.

## Results

32/32 sweep complete (8 seeds 64001–64008 x {leadfeast, belongfeast} x {control, armed}, 180d death-aware, 0 bad per-seed files). The pilot MISSES GO — KILLED per protocol (see Verdict).

| dimension | control | armed | delta |
|---|---|---|---|
| PRIMARY window raid-death share | 53/83 = 63.9% | 38/59 = 64.4% | **ratio 1.01x (GO <= 0.50x: MISS)** |
| window raid deaths (absolute) | 53 | 38 | -28.3% |
| window scholar raid deaths | 45 | 35 | -22.2% |
| window villager raid deaths | 8 | 3 | -62.5% |
| def5 died-windows | 8 | 6 | -2 (l64006 -> full survival d182; b64005 -> regressed/survived) |
| wall: national | 13 | 13 | +0 |
| wall: table | 14 | 13 | -1 |
| wall: wins | 0 | 0 | +0 |
| wall: wave-4 | 13 | 13 | +0 |
| wall: wave-5 | 0 | 0 | +0 |
| wall: exiled | 0 | 0 | +0 |
| median survival | 154d | 154.5d | +0.5d (guardrail >= 144d: PASS) |
| window starvation deaths | 4 | 1 | (guardrail <= 6: PASS) |
| readiness fill (terminal mean short bars) | 2.63 | 2.56 | (guardrail armed <= control+0.5: PASS) |
| new death modes (>=2 events) | — | none | PASS |
| doctrine engaged | — | 11/16 runs | garrisonDays 764, musterDays 412, travelRefusals 1305, beats 412 |
| defense/trade calls seen | — | 0 / 0 | HOMEKEEP half never engaged |
| unattributed deaths | 0 | 0 | — |

Paired per-run window raid deaths (control -> armed): l64002 11->8, l64003 6->7, l64006 8->0 (survived), l64007 9->9, l64008 8->4, b64002 6->7, b64003 3->3, b64005 2->0 (survived); rest 0/0 both arms. Direction mixed — no single-run outlier drives the absolute -28%, but l64003/b64002 worsened.

§15 balanced panel (evidence/2026-10-20/raidgarrison-panel-primary.md): decision=review_required; the only non-descriptive signal is table regression_watch on leadfeast (delta=-0.125, CI [-0.375,0] — touches 0; the same pattern as scholarraid's panel). The panel corroborates the analyzer: no material improvement.

Standout seed (l64006): control died d163 in-window (14 window deaths); armed SURVIVED to d182 with the def5 window live d62-182 (garrisonDays 120, musterDays 66, 198 travel refusals, 4 total deaths all outside the died-window definition). The one genuine window-to-survival conversion — n=1, reported as the aggregate's tail, not a claim.

## Sense-testing (raid transcripts, s64008 leadfeast armed vs control)

1. **The muster beat repeats daily** — "🛡️ The garrison stands ready — nobody ranges out tonight" fired 24x on this run (every muster day). The "one per stretch then quiet" keying failed: the beat key includes the day, so it never dedupes. Robotic/repeated — a design flag for any future posture layer (filed below).
2. **Death fiction reads as people**: "📖 The Codex turns a page on its own. Dante Luna is dead. You didn't ask. It knew." / "🕯️ Dante is dead — and the dead hold no treaties. Every link Haven has shakes." / Rosa: "Dante's gone." ... "You're not Dante." No heat in it. Just fact. / mantle passes to Samat, who dies the next day. Grief, succession, consequence — the village acts like people around the deaths.
3. **THE EMPTY DRAFT (systemic, both arms)**: raids routinely meet ZERO defenders — armed d59: "Nobody met Headlight Harry / The Big Beast / Static / Nevermore / Cliffhanger" x5, then "One of them is coming for YOU — Headlight Harry, inside the haven, eyes on your bedroll." Control d23/d73/d101/d106 show the same pattern (3-4 unmet per raid). Roster was 9 on armed d59 — all 8 villagers away/sheltered/wounded at raid-night. Scholars die defending villages that field no defenders. The garrison's homekeep half was built for exactly this drain, but its trigger (covenant defense calls) never fired on this substrate — the draft empties through autonomous NPC expeditions the policy cannot touch. Filed as a findings-backlog diagnostic.
4. **The lingerer gorge is the real pressure**: 800–1,456 kcal/night per lingerer (4 lingerers ≈ 4k/night on armed d60-62) — the pantry bleeds while the treeline holds.

## Verdict

**NO-GO — KILLED AT PILOT (primary miss; guardrails all pass).**

- PRIMARY MISS: window raid-death share 1.01x vs the pre-registered <=0.50x bar. The share did not move because non-raid window deaths fell proportionally (83->59 total window deaths): the garrison reduced window deaths overall, not the raid share of them.
- The absolute movement (-28.3% window raid deaths, -22.2% scholar raid deaths) is the strongest of the five raid arms (raidwall -18.2%, scholarraid -21.8% all-raid, raidstand -2.9%), but §14 binds the run to its pre-registered metric — a miss is NO-GO, never re-scored. The absolute story goes to metric review for the next run.
- GUARDRAILS ALL HOLD: starvation 4->1; median survival +0.5d; readiness fill 2.63->2.56; no new death modes.
- MECHANISM HONESTY: the HOMEKEEP half (the novel core — refusing covenant defense/trade calls) NEVER ENGAGED (0 calls seen across 16 armed runs). The measured effect is the muster half only: a def5-window-gated scholar hold, i.e. a narrowing of the killed sim-scholarraid mechanism. The five-raid-arm line (raidwall, scholarraid, shelteronly, raidstand, raidgarrison) now reads: defense posture is real at 15–28% on absolutes and never near the bars; the residual mechanism (the empty draft) is diagnostic territory, not another posture variant.
- KILL PROTOCOL: scripts/policies/raidgarrison.js deleted zero-trace; instruments (test/probe/analyzer/panel-builder/transcript-sampler), evidence, and per-seed JSONs kept.

## Convergence state

killed-at-pilot. The scale-onramp axis is NOT converged by this arm. The raid-defense decomposition is now five arms deep with a consistent verdict: posture trims absolute raid deaths ~15–28% but cannot move the window raid-death share. Named next (diagnostic, not a lever): the empty-draft investigation — why raid nights routinely field zero defenders (filed in sim-findings.md).

## Infra note

`node scripts/check.js --quick` was started per repo AGENTS.md and produced zero output for 9+ minutes (killed, SIGTERM). The arm's verification does not depend on it: this run touched zero src/js (one new policy file, since deleted per kill protocol; instruments + evidence only). Proof RED→GREEN, SMOKE, DET, the 32-run sweep, and the §15 panel all ran and are recorded above.

## Village assessment

A stalled village in the def5 window is a rich, undefended camp: pantries at 28–95k kcal draw 3–5 raiders every ~7 days; the defender draft is routinely empty (villagers out on autonomous expeditions, sheltered, or hurt); the scholar meets the bedroll raider alone or dies answering the aid crisis; lingerers gorge ~1k kcal/night each until the 6-day valve. The garrison's scholar-hold kept the scholar home (1,305 travel refusals) and converted two died-windows into survivals, but the village still could not field defenders — the blank this run documented (not filled): the empty draft is an engine-autonomy composition problem (NPC expedition rhythm vs raid-night draft), not a policy-posture problem. No policy-side lever in five attempts has filled it.
