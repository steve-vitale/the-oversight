# sim-overtimedeath — the OVERTIME mortality attribution (flesh-out loop DIAGNOSTIC, 2026-10-16)

**Run:** flesh-out loop ARM sim-overtimedeath, run_id fleshout-20261016T012900Z (coordinator claim), axis scale-onramp (blocking).
**Type:** DIAGNOSTIC — read-only instrument, no lever, zero src/js changes, zero policy behavior changes. The deliverable is the attribution + the named next lever.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the presubstrate census (evidence/2026-10-15/sim-presubstrate.md) measured the new mortality bind: win-side content all reachable (Arc IV 16/16, wave-4 16/16, wave-5 11/16, table invites 16/16) but villages die rich — 16/16 village-lost, median 134.5d, combat 65% of deaths, starvation 1/685 — under the post-invite OVERTIME rerun ladder (x1->x6 escalation, wave 4-5 reruns +25%->+150% HP while the table sits open). This diagnostic attributes that mortality death-by-death.

**PRIMARY (binding):** 100% of post-invite deaths attributed to a bucket on 16 runs — (a) combat inside an OVERTIME rerun window / (b) combat outside a rerun window / (c) non-combat / (d) unattributed. GO = every post-invite death classified, unattributed bucket exactly 0 (bar 100%). A miss is NO-GO, never re-scored.

**Analysis questions (binding):**
1. For every death post-invite: classify (a)/(b)/(c)/(d).
2. Per-day combat-death rate: pre-invite vs post-invite-in-rerun vs post-invite-outside-rerun (village-day denominators, not run denominators).
3. The rerun ladder's escalation trajectory: OVERTIME xlevel over time per run — does the ladder outrun the village's power, or stay proportional?
4. Invite timing (winDayFloor d90 vs actual invite day) x mortality curve — the seatpath diagnostic found 224/717 open-invite dawns never-offered:winDayFloor; belong s163 was invited d81 and died d89, the seat never existing.

**Substrate:** FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE/WAVE5REACH/W3DRIVE unset (asserted at load — the substrate presubstrate measured). Policies: TF.leadfeast / TF.belongfeast (tribfloor base ids, plain — WINPURSUIT/WINDEFER inert on the base policies, set so the env matches the declared composition).

**Seeds:** 8 FRESH [181,292,403,514,625,736,847,958] (verified 0 per-seed JSON hits across evidence/ before the run) x {leadfeast, belongfeast} = 16 runs.

**Horizon:** 180d death-aware (dead villages stop; harness dead-village tail). Chosen to match presubstrate (median 134.5d there) so the full post-invite ladder window is observable on every run.

**Instrument:** scripts/overtimedeath-20261016.js — read-only wrap of Game.registerDeath (reads day/kind/cause + the engine's own rerun marker Game.tbfight.otTier at the death beat + overtimeTier()) and daily() entry (tier trajectory, inviteDay rising edge, unlockedWave, scaleRank), plus Game.say capture (OVERTIME/death/funeral filter, cap 2000/run). Proof: scripts/test-overtimedeath-20261016.js (23/23 unit GREEN: synthetic death sequences with known rerun windows and known invite days classify exactly; the harness day-accounting off-by-one finding honored — deaths timestamping finalDay+1 stay in the window). Analyzer: scripts/analyze-overtimedeath-20261016.js.

**Rerun-window definition (engine-grounded):** the OVERTIME rerun ladder only scales turn-based fights via overtimeScaleFight (overtime.js:123-149), which sets `Game.tbfight.otTier` on the fight it scales. A death is (a) "combat inside an OVERTIME rerun window" iff otTier was set at the death beat — the ladder's own marker, not a reconstruction. tbfight is nulled at fight end, so a set flag at the death beat means the death happened inside a rerun-scaled fight.

**Det-gate (read-only proof, the seatpath both-repeat design):** 4 identical-seed pairs (leadfeast s181/s292, belongfeast s181/s292) x 60d, plain-repeat + instr-repeat + plain==instr: 4/4 trajectory-identical (dayHash per day), ends agree (survived x3, village-lost x1). The instrument does not move trajectories.

**Gates before spend:** SMOKE green (15d x 2 policies, tier rows collected, no crash); DETGATE green 4/4; unit 23/23.

**Sense testing (SENSE-TESTING LAW):** sense-read presubstrate leadfeast-s373 end-to-end (the classic: table set d90, OVERTIME x1->x5 by d125 while the seat waits) + at least one own-sweep run end-to-end. Read the death/funeral beats for meaning — note template fingerprints in prose.

---

## Results

Sweep complete 2026-10-16 ~02:45 UTC: 16/16 runs finished, 597 deaths recorded, 0 dropped beats (caps held).

Per-seed JSONs: evidence/2026-10-16/perseed-overtimedeath/ · beats: evidence/2026-10-16/overtimedeath-beats/ · summary: evidence/2026-10-16/overtimedeath-summary.json

| run | days | end | invDay | maxT | vDeaths | rerunFlag | nat |
|---|---|---|---|---|---|---|---|
| belong s181 | 112 | village-lost | 68 | 3 | 12 | 2 | 1 |
| belong s292 | 44 | village-lost | — | 0 | 8 | 0 | 0 |
| belong s403 | 128 | village-lost | 83 | 5 | 17 | 2 | 0 |
| belong s514 | 172 | village-lost | 93 | 6 | 17 | 5 | 1 |
| belong s625 | 36 | village-lost | — | 0 | 8 | 0 | 0 |
| belong s736 | 148 | village-lost | 139 | 1 | 25 | 0 | 1 |
| belong s847 | 182 | survived | 172 | 1 | 10 | 0 | 1 |
| belong s958 | 106 | village-lost | 72 | 2 | 19 | 1 | 1 |
| lead s181 | 120 | village-lost | 56 | 4 | 17 | 3 | 1 |
| lead s292 | 115 | village-lost | 89 | 3 | 20 | 2 | 1 |
| lead s403 | 108 | village-lost | 47 | 2 | 21 | 2 | 0 |
| lead s514 | 108 | village-lost | 56 | 2 | 19 | 4 | 1 |
| lead s625 | 110 | village-lost | 65 | 2 | 17 | 0 | 1 |
| lead s736 | 157 | village-lost | 117 | 5 | 18 | 4 | 1 |
| lead s847 | 127 | village-lost | — | 0 | 12 | 0 | 1 |
| lead s958 | 106 | village-lost | 69 | 2 | 14 | 0 | 1 |

### Q1 — post-invite attribution: GO MET (100%, unattributed = 0)

193 post-invite deaths, every one classified:

| bucket | n | share |
|---|---|---|
| (a) combat inside an OVERTIME rerun window (engine otTier flag at the death beat) | 28 | 14.5% |
| (b) combat outside a rerun window (combat/monster family, no flag) | 162 | 83.9% |
| (c) non-combat | 3 | 1.6% |
| (d) unattributed | 0 | 0% — bar 100% |

By phase: post-invite-outside-rerun {a:0, b:94, c:1, d:0}; post-invite-in-rerun {a:28, b:68, c:2, d:0}. The (c) three: 1 starvation, 2 cause "the night" (family null — the holdloss taxonomy has no 'the night' slot; classified (c) with raw preserved, never unattributed). 14 deaths timestamped a day after runDays' returned day were kept and classified (the off-by-one handling); 3 runs logged the engine-day drift note, 0 deaths fell outside finalDay+1.

**The headline:** the ladder's DIRECT mechanism — rerun-scaled turn-based fights — hosts only **14.5%** of post-invite deaths. The mortality is 84% ordinary combat outside any rerun window. The presubstrate story ("villages die rich and armed, ground down by reruns") needs the correction: they die ground down by *combat*, and the rerun fights are the minority channel. All 28 (a) deaths carried cause 'combat' (25 villager-kind, 3 monster-kind).

### Q2 — per-day combat-death rates (village-day denominators)

| phase | villager combat deaths | village-days | rate |
|---|---|---|---|
| pre-invite | 94 | 1318 | **7.1%/day** |
| post-invite, tier 0 (outside rerun) | 65 | 296 | **22.0%/day** |
| post-invite, tier ≥ 1 (ladder active) | 63 | 249 | **25.3%/day** |

Post-invite sub-phases: never-offered wait (invite..d89): 39/205d = **19.0%/day**; offered (d90+): 89/340d = **26.2%/day**.

The mortality jump happens at the INVITE phase (+15pp/day), not at the ladder tiers (+3.3pp/day tier-0→tier≥1 within post-invite). Confound noted honestly: post-invite days are late-game days (wave-4/5 exposure, median unlock d76) — the phase jump coincides with wave exposure, so "the invitation" is not proven causal; what is proven is the TIMING and the ladder's small marginal. The never-offered wait already bleeds at 19%/day before the ladder even starts ticking (d97): leadfeast s403 lost 17 villagers in [d47,d90) while the seat didn't exist yet.

Post-invite (b) villager combat deaths (103): 'monster' verb 59, 'combat' verb 41, contest 2, 'The Suburb' 1. On ladder-active days (tier≥1) the non-rerun villager combat deaths (38) are dominated by the **'monster' field-fight/expedition verb (27/38)** — the channel the OVERTIME raid knobs (sooner/more-often/harder-gorge raids, denser world monsters) feed — plus 10 unscaled tb 'combat' deaths (wave<4 fights are never rerun-scaled, even mid-ladder).

### Q3 — the ladder's escalation trajectory

Median tier-hit days: ×1@d97, ×2@d104, ×3@d111, ×4@d121, ×5@d128, ×6@d135 (clock-like: +7d/tier from the d90 floor). Days-per-tier across runs: t0 1601, t1 83, t2 64, t3 35, t4 23, t5 16, t6 38. Villager deaths-per-tier: t0 189, t1 17, t2 20, t3 6, t4 7, t5 8, t6 7.

The (a) rerun-flag deaths by tier: {1:7, 2:12, 3:2, 4:5, 5:1, 6:1} — **68% at ×1–×2, front-loaded, not escalating**. Death days: d97–d165, clustering d97–d108. The ladder does NOT outrun the village in the direct sense: by the time it reaches ×5–×6 the roster is already depleted (fewer villagers left to die in its fights), and the per-tier-day death rates show no clean escalation (t5 8/16d is small-n noise). Verdict: the ladder stays roughly proportional in its direct channel — it is a steady grinder, not an accelerating one. Its killing is mostly indirect (the raid/world-density knobs inside bucket (b)).

### Q4 — invite timing × mortality

Invite days: 47,56,56,65,68,69,72,83,89,93,117,139,172 — 9/13 pre-floor (<90). Three runs never invited (died d36, d44, d127 — all deaths pre-invite by construction). The winDayFloor wait is a real bleeding phase: the 9 pre-90-invited runs lost 3–17 villagers each between invite and d90 (leadfeast s403: 17; leadfeast s514: 10; belongfeast s958: 10). No run on this seed set repeated the seatpath belong-s163 case (invited d81, died d89, seat never existing) — the closest is leadfeast s292 (invited d89, died d114). The offered phase (d90+) kills faster (26.2%/day) than the wait (19.0%/day).

### Wall numbers (this seed set, pre-seat substrate)

national **12/16** · table **13/16** invites / 0 sittings · wins **0/16** · wave-4 **13/16** · wave-5 **7/16** · median survival **112.5d** (max 182d, one survivor) · exiled 0/16. Slightly weaker than presubstrate's set (median 134.5d, wave-5 11/16) — seed heterogeneity on a diagnostic, not a substrate move. 15/16 village-lost.

## Sense-reads (SENSE-TESTING LAW)

**Presubstrate leadfeast-s373** (the classic): table set d90, OVERTIME ×1→×6 on clock (d97→d132, every 7 days), village died d160. The fiction screams the fix every tier ("Take your seat from Haven to stop the clock") while the policy has no seat verb (seatpath's finding). Funeral beats are sparse in the set-piece filter, but the combat template repeats relentlessly: "X stood down the Y and kept walking — N rounds, bloodied but breathing. It's still out there, somewhere." ×25+ in one run — the casualtyseq template-fingerprint finding, confirmed again.

**Own sweep leadfeast-s403** (invited d47, died d107, 17 deaths before d90): the war of funerals at its most absurd. The mantle transferred **12 times** — d48, d53, d61, d64, and THREE bearers in a single day d73 (Stan→Chantal→Elif→Benoit), each announced with the identical "The Codex doesn't pause for grief. X blinks — and it's already there..." template. "The Reunion killed Tom/James/Elijah in 1 round" d70–71 — endgame monsters mulching villagers one round apiece. "A fallen tree blocks the path." ×20+ in the travel beats — another template fingerprint (pathing narration). 126 mantle transfers across the 16 runs (~8 scholar deaths/run): the scholar is not surviving the post-invite window either — the bearer cycles through villagers as each dies. The village behaves like people all the way down: they keep foraging, fishing, talking, and dying while the table waits.

One honest instrument limitation the sense-read surfaced: scholar deaths register as kind='villager' (opts.player is not set on this substrate's scholar-death path), so the `player` flag fired 0 post-invite — scholar vs villager deaths are NOT separated in the JSONs. The attribution buckets don't need the split, but a future scholar-mortality analysis should key on mantle-transfer beats, not opts.player.

## Village assessment

The villages on this substrate are rich, armed, nationally scaled (12/16), and dying of combat, not hunger (starvation 1 death in the (c) bucket across 597 deaths; the feast stack holds). Who dies: everyone, steadily — scholars cycling through the mantle (~8/run), villagers in field fights ('monster' verb) and tb fights alike. What was missing: no village sat the table (0/16 sittings — the seatpath funnel), so every run played the full ladder. The blank filled: the mortality is now attributed — the ladder's direct rerun channel is 14.5% of post-invite deaths; the killing is 84% non-rerun combat, with the field-fight 'monster' verb the largest single villager channel (59 post-invite) and the never-offered wait already bleeding at 19%/day.

## Metric review (§14)

GO met: 193/193 post-invite deaths classified, (d) = 0. No metric revision needed. Two instrument lessons for the next run: (1) the `player` flag (opts.player) does not fire for scholar deaths on this substrate — scholar/villager separation needs mantle-beat keying; (2) 'the night' is a real death cause with no holdloss-lib family — the taxonomy should gain the slot rather than future instruments hand-filing it. The (a)/(b) split measures the ladder's DIRECT mechanism cleanly; the INDIRECT channel (raid knobs, world density) lives inside (b) and is the named next arm. The phase-rate comparison carries the late-game confound honestly — a future run wanting the ladder's causal marginal needs a same-day control, not a phase contrast.

## The named next lever

**Dissect the (b) residual on ladder-active days — the 'monster'-verb field-fight channel.** 27 of the 38 villager combat deaths on tier≥1 days (no rerun flag) carry the field-fight/expedition 'monster' verb — the channel the OVERTIME raid knobs (overtimeRaidKnobs: sooner/more-often/harder-gorge raids + denser world monsters) feed. The next arm is a diagnostic instrument tagging 'monster'-cause deaths by source system (raid vs expedition vs wild encounter) on this same substrate, or a lever arm neutering overtimeRaidKnobs to measure the raid channel's share of the 84%. The seatpath-named "seat driver default-ON" remains the funnel fix; this arm is the mortality wall's next named cut — it decides whether the ladder kills mostly through its raid knobs (fixable in tuning) or through raw wave-4/5 field exposure (a deeper pacing question).
