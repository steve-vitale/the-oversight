# sim-casualtyseq — the POST-UNLOCK casualty sequence on the PRE-SEAT substrate (flesh-out loop arm, 2026-10-17)

Worktree: `~/workspace/worktrees/sim-casualtyseq`. Diagnostic instrument, ZERO src/js changes — instrument only (composes fieldfightsrc-20261016's read-only instrument + survdiff-lib-20261015's livingRoster reader; adds the wave-4 rising-edge + daily roster-trajectory samplers). No game changes — TELEMETRY-ONLY. Loop-B lane constraint observed: src/js/game.js untouched.

## Context

- sim-survdiff (evidence/2026-10-15/sim-survdiff.md, #268): 14/16 wave-4 unlocks, 8 survivors / 6 non-survivors at +30d, ZERO separating factors among 15 pre-registered state variables ("post-unlock survival is a war of funerals, not stocks; combat deaths 12/14"). Named next: the casualty sequence — inter-death intervals and roster trajectory after wave-4 unlock.
- sim-casualtyseq (evidence/2026-10-15/sim-casualtyseq.md, 2026-10-15): the prior arm already measured the casualty sequence on the **ARMED win-side stack (SEATDRIVE=1)** — 16/16 unlocks, 80 post-unlock deaths, villager-only (0/16 scholar deaths), clustered (median interval 1d, 40% same-day), combat-monotone (~90% both windows), win-truncated ~30d (12/16 table wins). **This arm is the complementary measurement on the PRE-SEAT courtship substrate (SEATDRIVE=0 explicit)** — 0/16 wins, median survival ~117d — the full win-truncation-free war of funerals that survdiff named.
- Canon: docs/CANON.md (read first), docs/MONSTER-WAVES.md (wave-4 gate: w3-rung + standing ≥ t4(100); the readiness gate design call #4 holds standing at t4-1 until ARMORED/ARMED/TRICKS/VETERANS bars fill — the instrument records unlock day but does not touch readiness).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sim ran)

Written 2026-10-17 ~01:35 CDT, before SMOKE/DETGATE/the sweep. No sweep trajectory had been observed at write time. (Proof status at commit: REAL RED->GREEN — 32 fixture checks + SMOKE green + DET-GATE 4/4 trajectory-identical, re-verified after the mid-run instrument repairs.)

**Question:** what does the post-wave-4-unlock casualty sequence look like death-by-death on the pre-seat substrate — where the runs are NOT win-truncated — and does it show structure survdiff's unlock-time stocks couldn't see?

**PRIMARY (diagnostic GO, binding):** ≥ 90% of post-wave-4-unlock villager deaths attributed to a source system across the 16-seed sample. Attributed = sourceOf returns anything other than 'unattributed' (unobservable records: missing day/cause). Source systems: RAID | EXPEDITION | WILD-ENCOUNTER (the fieldfightsrc-20261016 srcOf convention for the monster family — rule order: engine raid markers first, then the villager-autonomous agency-expedition carve-out, then the policy-outing-day travel correlation) | CONTEST (contest context via noFlee opts / 'contest' cause) | COMBAT (the combat-family verb: raid-defense, ambush, 'the wild') | DISEASE | STARVATION | WOUNDS | OTHER (family null — raw cause preserved). A MISS means the instrument or the substrate has a gap (unobservable deaths) — diagnose which, keep the instrument. This is a diagnostic: GO means the casualty sequence is measured; the arm then names the next lever honestly.

**Substrate:** 16 seeds × {leadfeast, belongfeast} = 32 runs, 180d death-aware, pre-seat courtship substrate: FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1 asserted up front, SEATDRIVE=0 explicit, WAVE5REACH/W3DRIVE unset. Seeds: pilot 8 = 205/246/321/412/523/634/745/856 (fieldfightsrc's set — identical seeds, same substrate, cross-arm comparability); confirm adds 112/223/334/445/556/667/778/889. Policies from scripts/policies/tribfloor.js (same ids as fieldfightsrc).

**Staging (§9):** Stage 0 SMOKE (15d × 2 policies — instrument live, roster rows sampled, no crash, wave sampler reads). DET-GATE (4 pairs × 30d, both-repeat plain/instr, plain==instr — the instrument changes no trajectory). Stage 1 PILOT (the 8 fieldfightsrc seeds × 2 policies = 16 runs): instrument-health GO requires ≥10/16 wave-4 unlocks (survdiff measured 14/16 on the feast stack; the winpursuit/windefer layers are provably inert per sim-wincensus) + zero crashes + the day-stamp self-consistency guard passing (all death days in [1, engineDays+1] — the survdiff repair, hard-coded as a sweep STOP). Stage 2 CONFIRM (the 8 fresh seeds × 2 policies). The design's fixed seed budget (16, per Steve 2026-10-13 "more seeds each time") is the full sample; stages gate instrument health, not effect size — this is a diagnostic.

**Horizon + why (§10):** 180d death-aware (dead villages stop; +10d tail max). Reachability-class question (waves 4–5, the scale wall): survdiff measured unlocks d55–113 on this substrate class and the pre-seat stack's median survival is ~117d (max 180d); late unlocks (d100+) need the full horizon to show their casualty sequence. Dead villages stop simulating.

**Secondaries (report-only):** median inter-death interval post-unlock (first interval = days since unlock; 0 = same-day multi-death); roster trajectory shape SPRINT vs SIEGE (pre-registered definition: sprint = median run ENDS ≤45d after unlock; siege = median >45d) with median roster at unlock/+15/+30/+60; share of deaths in the first 10d post-unlock; death clusters (≥3 deaths in any 7-day sliding window) and their overlap with wave-5-contacted days (wave5Day = first dayTiers wave≥5).

**§14c roster rule:** the primary is over villager (non-scholar) deaths by construction — the scale wall lives in the roster, not the scholar.

**Pre-pilot substrate checklist (§14b):** (1) Contact — survdiff: 14/16 unlocks, combat deaths 12/14 post-unlock ✓; (2) Pool sizing — the bar is a rate (≥90%), not a count; the pool is the full post-unlock death census ✓; (3) Verb existence — deaths happen on this substrate (measured) ✓; (4) Horizon fit — the armed-stack arm showed the window truncates at wins ~d89; the pre-seat substrate survives to 180d, so 180d contains the phenomenon ✓.

**Instrument:** scripts/casualtyseq-20261017.js. For EVERY run that unlocks wave 4: unlock day (rising edge of unlockedWave() ≥ 4 in the daily sampler); EVERY post-unlock villager death — day, name, cause, family (holdloss taxonomy), source (sourceOf, contest carve-out added), fight-context via/raid/monsterName/scholarAway/travelLegs from the fieldfightsrc stack; inter-death intervals; clusters; daily living-roster trajectory from unlock; funeral/death beats for sense reads. Pure classifiers exported for the proof test: unlockDayOf, wave5ContactDay, isVillagerDeath, sourceOf, interDeathIntervals, clusters, trajectoryShape.

**Gates before spend:** proof scripts/test-casualtyseq-20261017.js REAL RED→GREEN (synthetic fixtures for every classifier; SMOKE green on the sweep's own wiring — the survdiff lesson; DET-GATE 4/4 instrument-identical before the pilot).

**Sense testing (SENSE-TESTING LAW):** sense-read 2–3 post-unlock death sequences from the beats end to end — judge whether they read as a war of funerals or something else (meaning, not counts). Villagers are people.

---

## Results

### Pilot (Stage 1): 16 runs — 8 seeds {205,246,321,412,523,634,745,856} x {belongfeast, leadfeast}, 180d death-aware

**wave-4 unlocks: 0/16** (belongfeast 0/8, leadfeast 0/8). Every run maxWave=3.

| policy | survived 180d | village-lost | national | table invite | wins |
|---|---|---|---|---|---|
| belongfeast (8) | 4 (s205, s321, s745, s856) | 4 (d118, d123, d136, d145) | 7/8 | 8/8 | 0/8 |
| leadfeast (8) | 4 (s321, s523, s634, s745) | 4 (d138, d148, d165, d173) | 7/8 | 7/8 | 0/8 |

Median survival 176.5d (max 180d). Median living roster at end: 3.5 (from 11 at day 1). The day-stamp self-consistency guard passed on all 16 runs (no SWEEP STOP).

**Pilot GO (pre-registered: >=10/16 wave-4 unlocks): MISS — 0/16.** Per §14 the miss is a miss, never re-scored. Classification per §14a: the pilot GO bar is **METRIC-BROKEN** (bar set from survdiff's 14/16 on the pre-readiness-gate substrate; the readiness gate — design call #4, 2026-10-16, Steve-approved — landed after survdiff and changed the unlock landscape; the bar could not have passed regardless of the diagnostic's merit). The instrument is healthy (proof REAL RED->GREEN 27+4 fixture checks, SMOKE green, DET-GATE 4/4 trajectory-identical, day-stamp guard green on all 16 runs). The diagnostic concept is not refuted — it is **unmeasurable on this substrate**: SUBSTRATE-MISSING in the §14a sense (the engine no longer stages post-unlock runs under competent policies; the arm blocks on the on-ramp being re-opened, then re-runs).

**PRIMARY (diagnostic GO: >=90% of post-unlock villager deaths attributed): NO-COVERAGE.** Zero post-unlock villager deaths exist (0/16 unlocks). This is reported as NO-COVERAGE, explicitly NOT a vacuous GO — the 2026-10-15 casualtyseq lesson ("a vacuous green is the most dangerous green").

### The finding: the readiness gate's VETERANS bar closed the wave-4 on-ramp

Substrate probe (scripts/probe-readiness-20261017.js, belongfeast s205, 100d, same env): standing climbs 0 -> 99 and **holds at 99 (= t4-1)** from d52 on; `waveCombatReadiness(4).short` = ["armor","veterans"] until d82, then **["veterans"] alone from d82 to d101+**. The armor bar clears (4 fighters with P>=15 worn); tricks clear by d12. The binding bar is purely VETERANS (demand: 2 living roster members with wave-3+ kills in state.waveKillLog).

The veterans bar is reachable in principle but leaks: the same probe run logs its first wave-3+ kill at d62 (1 kill by 1 vid) and reaches **2 kills by 2 vids at d101 — yet the bar still reads short**, because the bar counts only LIVING killers and the casualties keep claiming them (the war of funerals drains the bucket faster than kills fill it). survdiff's villages fled wave-3 fights; now they must kill wave-3 monsters (HP 240-420, damage 20-70) AND keep the killers alive simultaneously — on a substrate where the median village buries 52 villagers per run (range 21-61).

Consequence for the scale wall: villages reach **national 14/16** and receive **table invitations 15/16**, but wave 4 never unlocks, wave 5 never contacts, and the endgame deed gate (5/5/4/3/2 distinct facings per wave 1-5) can never complete — **wins 0/16**. The readiness gate, designed to stop "promoted into wars they can't fight," now reads as the wall itself: the on-ramp demands the war be already won.

The demand numbers are "sim starting points, not canon — the sim loops own tuning" (design call #4). The named next lever: tune the readiness demands (veterans bar: count wave-2+ kills, or participation-with-survival, or lower the demand) — a lever arm's job; this arm is telemetry-only.

### Confirm (Stage 2): 16 runs — 8 fresh seeds {112,223,334,445,556,667,778,889} x {belongfeast, leadfeast}, 180d death-aware, fixed instrument (full death census + scholar-death flag + full beats)

**wave-4 unlocks: 0/16 confirm, 0/32 total.** Both policies 0/16.

32-run wall numbers: national 27/32, table invites 29/32, **wins 0/32**, wave-5 0/32. Median survival 176.5d (16 survived / 16 village-lost). Median living roster at end: 3.5 (from 11 at day 1).

**Full death census (16 confirm runs, scholar/villager separated by the beat-time flag):**
- Villager deaths: **107** — families: monster 80, combat 8, wounds 8, sickness 6, starvation 4, null 1. Sources: EXPEDITION 59, RAID 17, CONTEST 4, WILD-ENCOUNTER 4, COMBAT 4, DISEASE 6, WOUNDS 8, STARVATION 4, OTHER 1 — **107/107 attributed (100%)**. The attribution pipeline is proven on real data even though the primary is NO-COVERAGE.
- Honesty note on EXPEDITION: the tag is a day-level correlation (death on a day the policy drove scholar travel), and **52/59 have the scholar HOME at the death beat** — these are home-field deaths on high-activity days, not "died on expedition." The correlation is real (outing days are the dangerous days); the mechanism is not "away."
- Scholar deaths: **114 across 16 runs (~7.1/run)** — 105 combat-family (96 raw 'combat', 9 'contest'), 5 sickness, 2 starvation, 2 null ('the night'). The scholar is very mortal on the pre-seat substrate (contrast the armed stack's 0/16 post-unlock scholar deaths — that claim is now doubly suspect: different substrate AND the kind-convention blind spot).
- The single OTHER: leadfeast-s667 d35, cause "Big Loud" (unregistered monster name — genuinely unnameable by the taxonomy; raw preserved).

## Village assessment (plain words)

Thirty-two villages on the pre-seat substrate, and not one of them ever sees the Mirror Draft. What they look like instead: ~11 people at day 1, national by mid-game (27/32), table invitations in the mail (29/32) — and then the long stall at wave 3. Half survive the full 180 days with ~3-4 people left; half die between days 109 and 173.

Who dies: everyone, in combat, at the treeline. 80 of 107 villager deaths are the monster verb — wave-3 monsters (the Callback, the Redactor, the Buffering, Ugly-Eyes) raiding Haven nightly, gorging 1,500+ kcal a night, killing villagers in 1-round volleys. The scholars die fastest of all: ~7 per run, almost always in combat — the mantle passes from Dieter to Rocco to Anderson to Jovan to Amina to Kwame to Quinn to Seamus to Axel to Yara to Somchai to Florentine on a single run, each holding the office for days. The village buries a median of 52 people per run and ends with 3.5 standing.

The cruelest shape is the siege: belongfeast-s778 loses Samorn to starvation d53, Aria to thirst d54 ("💀 Aria died of thirst. There was nothing to drink."), Hassan to starvation d55 — while the raids that week carry off "~0 kcal" because the pantry is already empty, and wave-3 monsters gorge at the treeline every night. Aria stood down the Ugly-Eyes on d53 and died of thirst on d54. The readiness gate demands the village kill wave-3 monsters and keep the killers alive; the village instead spends its killers as funeral fuel.

The missing capability is not in any stock — it is the veterans bar itself. The probe village reached 2 wave-3+ kills by 2 villagers at day 101 and still read short, because the bar counts only the living and the war keeps killing them. The war of funerals didn't end when the readiness gate landed; it moved. survdiff measured it post-unlock; now it happens pre-unlock, at the treeline, against the very monsters the village must beat to be deemed ready. The on-ramp demands the war be already won.

What the village assessment asks for (named, not built — telemetry-only arm): the readiness demands are the lever. The veterans bar as written (2 living wave-3+ killers) is a race the casualties usually win. The design doc says the numbers are sim starting points. Until a lever arm retunes them, the scale wall reads: national yes, table invited, wave 4 never, wins never.

## Sense verdict

Read end to end: belongfeast-s112 d16-22 (the succession chain: Dieter dies of sickness d16 → Rocco dies in combat d21 → Anderson; a 5-raider night raid with wave-3 monsters; Malik of Ashford's 2,000-kcal demand; "You weren't at the treeline. Malik of Ashford didn't wait — they hit the stores and melted back into the dark with 840 kcal"), leadfeast-s778 d100-103 (James Okonkwo dies d101 → Katarina dies d103 → Dylan dies d103 → Wei takes the mantle; "💀 The Ugly-Eyes killed Giulia in 1 round. The village mourns." then "⚔️ Wei killed the Ugly-Eyes alone — 5 rounds, 72 taken. Word travels fast. The village cheers." — revenge, same day), belongfeast-s778 d50-55 (the thirst siege above).

**Coherence: PASS.** The fiction and the numbers agree everywhere: funerals shake the village ("The village is rattled. Everyone's jumpy — eyes on the treeline."), the scholar's absence has priced consequences, revenge kills land the same day as the death, empty pantries read as "~0 kcal" raid hauls. Villagers flee fights they can't win, die, get succeeded, and the polity reacts. Nothing robotic in the events.

**The fingerprints are in the prose, not the events** (confirming the 10-15 finding on fresh runs): the mantle-transfer beats fire verbatim 114 times ("We hardly noticed. (That is a lie. We noticed. The audience CRIED.)"), "The village is rattled" triples on bad days, every stand-down reads "bloodied but breathing. It's still out there, somewhere." In a 12-succession run the liturgy loops. Filed already as [open] 2026-10-15 (death-beat prose variety); not re-filed.

One new wrinkle (documented, not fixed): "💀 The Ugly-Eyes killed Giulia in 1 round. The village mourns." fires alongside the funeral template for the same death — the village mourns twice for one body (also noted 10-15; still present).

## Metric review (§14)

1. **The pilot GO bar was set on stale substrate evidence.** survdiff's 14/16 unlocks were measured 2026-10-15, before the readiness gate landed 2026-10-16. Pre-registering >=10/16 assumed the unlock landscape was stationary; it wasn't. The bar is METRIC-BROKEN (§14a), not the diagnostic. Proposed for the NEXT run: pre-register the unlock bar from a same-substrate pilot probe (the probe-readiness script now exists for exactly this), or pre-register the veteran-gap measurement directly.
2. **NO-COVERAGE is not GO.** With 0 unlocks the primary has no population; reporting it as anything but NO-COVERAGE would be the vacuous green the 10-15 arm warned about. The 107/107 attribution on the full census proves the pipeline, not the primary.
3. **Scholar deaths are invisible to the 'player'-kind convention.** The scholar dies as kind='villager' (mantle-transfer beats prove it). fieldfightsrc's `d.player` misses them — and so did the 10-15 casualtyseq's "0/16 scholar deaths" claim. Fixed here via the beat-time Game.villagerId read (installScholarFlag). Filed as [open] in sim-findings.md — the loops' other instruments inherit the blind spot.
4. **EXPEDITION is a day-level correlation, not a mechanism.** 52/59 EXPEDITION-tagged villager deaths have the scholar home at the death beat. The tag fires on policy-travel days; the deaths are home-field. Reported as correlation, not "died on expedition."
5. **The sweep's "SWEEP DONE (FULL 16 seeds...)" log line lies when SEEDS is a subset.** Cosmetic; the evidence file states the exact seeds. Fix in the next instrument edit.
6. **Beats capture misses funeral narration.** fieldfightsrc's OD_BEAT regex doesn't match "X is dead" / "the grave" templates. The instrument now persists the full beats array; sense-reads used the confirm runs. (The funeral beats themselves still aren't in the capture — a capture-regex widening is a small future edit.)
7. **Engine-day/runDays-day drift confirmed again.** A scholar death stamped d182 on a "days=180" run — the +10d dead-village tail. The day-stamp guard's [1, engineDays+1] window holds; any future instrument must keep using the engine day.

## Convergence state

**parked** — the diagnostic is instrumented, proven, and committed, but unmeasurable until the wave-4 on-ramp re-opens (readiness-demand tuning, a lever arm). The kill taxonomy: pilot GO bar METRIC-BROKEN (§14a); the diagnostic itself SUBSTRATE-MISSING (§14a: blocks on the substrate staging post-unlock runs again, then re-runs). The instrument is kept (scripts/casualtyseq-20261017.js + proof + analyzer + probe), not deleted.

## Blanks (filled / documented)

- **FILLED:** the casualty-sequence instrument — scripts/casualtyseq-20261017.js (composes fieldfightsrc-20261016 + survdiff-lib-20261015 livingRoster; adds wave-4 rising-edge + daily roster-trajectory samplers + the scholar-death outer wrap) + scripts/test-casualtyseq-20261017.js (REAL RED->GREEN: 32 fixture checks + SMOKE + DET-GATE 4/4 trajectory-identical, re-verified after the mid-run repairs) + scripts/analyze-casualtyseq-20261017.js (32-run census) + scripts/probe-readiness-20261017.js (same-substrate unlock-bar probe). Zero src/js changes — scripts/ + evidence/ only.
- **FILLED (mid-run repairs):** (1) `wave5Day` ReferenceError (variable named `w5Day`) — crashed the first pilot attempt before any row persisted; (2) per-seed JSONs persisted post-unlock deaths only — now persists the full villager death census (`allDeaths`) with scholar/villager separation; (3) beats persisted filtered-subset only (funeral narration missed) — now persists the full beats array; (4) scholar deaths misclassified as villager deaths (kind='villager' convention gap) — now flagged by beat-time Game.villagerId read (installScholarFlag), validated 6/6 against independent mantle-transfer beats on belongfeast-s112.
- **FILLED:** the 32-run census — evidence/2026-10-17/perseed-casualtyseq/*.json (32 runs; 107 villager deaths + 114 scholar deaths classified on the 16 confirm runs; 107/107 villager deaths source-attributed) + evidence/2026-10-17/casualtyseq-beats/ (full beats for sense-reads).
- **DOCUMENTED (the diagnostic's answer):** the post-unlock casualty sequence is currently unmeasurable — 0/32 wave-4 unlocks on the pre-seat substrate. The readiness gate's VETERANS bar (2 living wave-3+ killers) closed the on-ramp: the probe shows villages reach 2 kills by ~d101 but the bar counts only the living and the casualties claim them. The war of funerals moved pre-unlock (80/107 monster-family deaths at the treeline; ~7.1 scholar deaths/run). Named next lever: readiness-demand tuning (veterans bar) — a lever arm's job; this arm is telemetry-only.
- **DOCUMENTED:** the 'player'-kind scholar-death blind spot affects fieldfightsrc and the 10-15 casualtyseq's "0/16 scholar deaths" claim — filed as [open] in sim-findings.md, not re-litigated here.
- **DOCUMENTED:** EXPEDITION source tag is a day-level correlation (52/59 scholar-home at the death beat) — reported as correlation, not mechanism.
