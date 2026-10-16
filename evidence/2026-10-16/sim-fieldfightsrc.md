# sim-fieldfightsrc — the (b)-channel source-system dissection (flesh-out loop DIAGNOSTIC, 2026-10-16)

**Run:** flesh-out loop ARM sim-fieldfightsrc, run_id fleshout-20261016T0215Z (coordinator claim, filed before any sims), axis scale-onramp (blocking).
**Type:** DIAGNOSTIC — read-only instrument, no lever, zero src/js changes, zero policy behavior changes. The deliverable is the source-system attribution + the fork verdict (the overtimedeath-named next arm).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** sim-overtimedeath (evidence/2026-10-16/sim-overtimedeath.md) attributed 193 post-invite deaths: 14.5% inside OVERTIME rerun-scaled fights, 83.9% ordinary combat outside any rerun window — and on ladder-active days (tier≥1) the non-rerun villager combat deaths were dominated by the 'monster' field-fight/expedition verb (27/38). The ladder's direct channel is small; its killing is mostly indirect. This arm dissects that (b)-channel: tag every post-invite 'monster'-verb villager combat death by SOURCE SYSTEM.

**PRIMARY (binding):** ≥95% of post-invite 'monster'-verb villager combat deaths attributed to a source system — RAID / EXPEDITION / WILD-ENCOUNTER — on 16 runs. GO = attributed/(monster-verb villager combat deaths post-invite) ≥ 0.95. A miss is NO-GO, never re-scored.

**Source definitions (engine-grounded, never prose-reconstructed):**
- **RAID** — the engine's own raid context at the death beat: the enclosing `resolveWildMonsterEncounter` carried `opts.raid === true` (set only by `havenRaidTick`, the reactive haven raid — havenGrowth.js), OR the fought world-monster entity carried `m.lingering === true` (set only by havenRaidTick for unmet raiders at the treeline; nothing else in the codebase sets it — verified by grep). The aid crisis (`state.aidCrisis.raiders === true`, set by havenRaidTick) is recorded as corroboration, never the tag flipper.
- **EXPEDITION** — correlation tag (declared honestly): the death fell on a day the POLICY drove the scholar's travel (`Game.travelTo` calls wrapped during the policy's daily window — the competent policy's expedition verbs: stone runs, frontier pushes, courtship travel), or the enclosing fight had no village router (scholar's own field-fight context). Not a causal hook — a day-level correlation.
- **WILD-ENCOUNTER** — untagged field encounters: villager-autonomous life (patrol task encounters, villagerMonsterTick wild encounters, villager-agency expeditions via `expedDeath`, all with no raid marker and no policy-driven scholar outing).
- **unattributed** — reserved for unobservable records (missing day/cause); target 0.

**Fork verdict (the deliverable):** RAID-KNOBS-DOMINANT (the ladder kills mostly through its raid knobs → a tune fix is viable; name the lever) vs FIELD-EXPOSURE-DOMINANT (raw wave-4/5 field exposure → a deeper pacing question, say so plainly).

**Substrate:** FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE/WAVE5REACH/W3DRIVE unset (matches overtimedeath exactly). Policies: TF.leadfeast / TF.belongfeast.

**Seeds:** 8 FRESH [205, 246, 321, 412, 523, 634, 745, 856] (verified 0 per-seed `-s<seed>.json` hits across evidence/ before the run) x {leadfeast, belongfeast} = 16 runs.

**Horizon:** 180d death-aware (matches overtimedeath; the full post-invite ladder window must be observable).

**Instrument:** scripts/fieldfightsrc-20261016.js — read-only wraps: Game.registerDeath (records day/kind/cause/family + the fight-stack top at the death beat + scholar-away + crisis state), Game.resolveWildMonsterEncounter (captures opts.raid), Game.resolvePatrol (router tag), Game.fieldFight (upgrades the raid flag from the monster entity's own m.lingering; classifies unrouted calls by opts — awareness:true = villager-agency expedition, noFlee/rng = contest, else field-other), Game.expedDeath (agency-expedition context; its registerDeath fires after fieldFight returns, so the stack has already popped), and Game.travelTo during the policy daily window (policy-driven travel legs per day). Pure classification srcOf() exported for the proof test. Analyzer: scripts/analyze-fieldfightsrc-20261016.js. Proof: scripts/test-fieldfightsrc-20261016.js (synthetic death sequences of known source attribution, all RED→GREEN; det-gate 4/4 trajectory-identical on identical seeds; SMOKE green before the sweep).

**Read-only proof design (the seatpath both-repeat convention):** 4 identical-seed pairs (leadfeast s205/s246, belongfeast s205/s246) x 60d, plain-repeat + instr-repeat + plain==instr via dayHash; ends must agree.

**Gates before spend:** unit RED→GREEN (srcOf on synthetic contexts); DETGATE 4/4; SMOKE green (15d x 2 policies, instrument live, no crash).

**Finding #357 watch (sim-findings.md):** raw death cause 'combat' often carries no monster/raid attribution. This instrument answers it structurally for the monster-verb population: killer id/name on registerDeath is mostly null on these paths (hurtVillager passes killerId:null; expedDeath passes killerId:null), so attribution comes from the engine's fight-context markers captured at the death beat, not from the death record alone.

**Sense testing (SENSE-TESTING LAW):** sense-read at least one full sweep run end-to-end (death/beats for meaning, not just counts); note template fingerprints vs genuinely human moments.

---

## Results

Sweep complete 2026-10-16 ~04:10 UTC: 16/16 runs finished, 597→589 comparable scale (per-run deaths 14–59), 0 dropped beats (caps held), 2 engine-day drift notes (both ≤2d, the off-by-one window honored).

Per-seed JSONs: evidence/2026-10-16/perseed-fieldfightsrc/ (numeric wall-metric keys) · beats: evidence/2026-10-16/fieldfightsrc-beats/ · summary: evidence/2026-10-16/fieldfightsrc-summary.json

| run | days | end | invDay | maxT | mv-post | RAID | EXP | WILD | nat |
|---|---|---|---|---|---|---|---|---|---|
| belong s205 | 180 | survived | — | 0 | 0 | 0 | 0 | 0 | 1 |
| belong s246 | 60 | village-lost | — | 0 | 0 | 0 | 0 | 0 | 0 |
| belong s321 | 62 | village-lost | — | 0 | 0 | 0 | 0 | 0 | 0 |
| belong s412 | 76 | village-lost | 49 | 0 | 2 | 0 | 2 | 0 | 0 |
| belong s523 | 144 | village-lost | 107 | 6 | 6 | 1 | 5 | 0 | 1 |
| belong s634 | 155 | village-lost | 65 | 6 | 13 | 4 | 9 | 0 | 0 |
| belong s745 | 93 | village-lost | 53 | 1 | 5 | 1 | 3 | 1 | 1 |
| belong s856 | 134 | village-lost | 104 | 3 | 7 | 1 | 6 | 0 | 1 |
| lead s205 | 182 | survived | 136 | 1 | 0 | 0 | 0 | 0 | 1 |
| lead s246 | 126 | village-lost | 80 | 2 | 2 | 2 | 0 | 0 | 0 |
| lead s321 | 119 | village-lost | 94 | 3 | 4 | 2 | 1 | 1 | 1 |
| lead s412 | 98 | village-lost | 74 | 1 | 4 | 1 | 3 | 0 | 1 |
| lead s523 | 115 | village-lost | 62 | 2 | 12 | 4 | 8 | 0 | 1 |
| lead s634 | 104 | village-lost | 63 | 2 | 5 | 1 | 4 | 0 | 1 |
| lead s745 | 110 | village-lost | 83 | 2 | 6 | 1 | 5 | 0 | 1 |
| lead s856 | 119 | village-lost | 79 | 2 | 8 | 3 | 5 | 0 | 1 |

### Q1 — PRIMARY: GO MET (100%, unattributed = 0)

74 post-invite 'monster'-verb villager combat deaths, every one sourced:

| source | n | share |
|---|---|---|
| RAID (engine raid context: opts.raid from havenRaidTick, or m.lingering) | 21 | 28.4% |
| EXPEDITION (policy-travel day correlation, no raid marker) | 51 | 68.9% |
| WILD-ENCOUNTER (untagged field encounters) | 2 | 2.7% |
| unattributed | 0 | 0% — bar ≥95% |

By policy: belongfeast 33 (7/25/1), leadfeast 41 (14/26/1) — the split holds on both roads. Pre-invite baseline (same population definition, 1338 village-days): 20 deaths, ALL EXPEDITION-tagged, 0 RAID — raids kill nobody before the invite on this substrate.

### Q2 — per-day death rate by source (village-day denominators)

| phase | days | RAID | EXPEDITION | WILD |
|---|---|---|---|---|
| pre-invite | 1338 | 0.000%/day | 1.495%/day | 0.000%/day |
| post-invite, tier 0 (outside rerun) | 270 | 3.704%/day | 10.000%/day | 0.741%/day |
| post-invite, tier ≥ 1 (ladder active) | 260 | 4.231%/day | 9.231%/day | 0.000%/day |

The ladder's marginal on its OWN channel is small (+0.5pp/day raid rate tier-0→tier≥1). The phase jump is pre→post-invite: raids go 0 → 3.7%/day, field exposure 1.5% → ~10%/day. Confound (same as overtimedeath's): post-invite days are wave-4/5 days — the phase jump coincides with wave exposure, so "the invitation" is not proven causal; what is proven is the TIMING and the channel split. Even on ladder-active days, field exposure kills at 2.2× the raid rate.

### Q3 — corroboration audit (is the tag honest?)

- via|raid breakdown: `wild|raid=0`: 51, `wild|raid=1`: 21, `agency-expedition|raid=0`: 2. **Zero patrol-router deaths** — see the patrol finding below.
- Crisis corroboration: 16/21 RAID deaths had `state.aidCrisis` open with `raiders=true` at the death beat. The 5 without: 3 lingering-raider kills fought 24+ days after their raid (leadfeast-s523 d86–88, The Reunion — the crisis resolved, the raider still at the treeline; the m.lingering tag carried the attribution), 2 direct-wave fights where a pre-existing crisis blocked the new crisis's raiders flag (the opts.raid marker is primary, the crisis corroborative — as pre-registered).
- RAID monster ids: reunion 7, eulogy 3, eater 3, cancellation 2, strike 1, algorithm 1, editor 1, spool 1, redactor 1, rerun 1. **All 21 are wave-3+ monsters** — the raid channel only kills with late-wave raiders. Pre-invite raids (wave-1/2 raiders vs healthier villages) kill nobody.
- Cause breakdown: 'monster' 72, 'The Congregation' 1, 'The Focus Group' 1 (the two expedDeath agency-expedition kills — the only monster-name-cause deaths in the population).
- EXPEDITION honesty note: the scholar traveled on 92–179 days/run (courtship road — 579 legs on belongfeast-s205's 180d), so EXPEDITION is a broad correlation, nearly "non-raid field death". Only 4/51 EXPEDITION deaths had the scholar away from haven at the beat. The tag is declared as correlation, not causality — and for the fork verdict it doesn't matter: EXPEDITION + WILD-ENCOUNTER are both field exposure.
- The patrol finding (filed to sim-findings.md, no duplicate): resolvePatrol was called 0 times in 60-day probes on both policies — **patrols never fire on the courtship road**. The one villager system built to thin nearby threats before they reach villagers contributes nothing to the mortality picture; the whole (b)-channel field population is villagerMonsterTick wild encounters + agency expeditions.

### Wall numbers (this seed set, pre-seat substrate)

national **11/16** · table **13/16** invites / 0 sittings · wins **0/16** · wave-4 **13/16** · wave-5 **6/16** · median survival **116d** (max 182d, two survivors) · exiled 0/16. Matches overtimedeath's same-substrate wall (12/16, 13/16, 0/16, 13/16, 7/16, 112.5d) — no drift.

### Telemetry deviation check

1 LOUD: wins baseline 16 → current 0. **EXPLAINED, not a bug**: the scale-wall baseline reflects the full win-side stack (seat driver landed); this arm runs the pre-seat substrate (SEATDRIVE unset, matching overtimedeath) where wins are 0/16 by construction. Same-substrate comparison (overtimedeath) is 0=0. Baseline NOT rolled forward — rolling it would corrupt the full-stack baseline with a different substrate's numbers. (Same class as loop B r54b's stale-baseline artifact.)

---

## Sense-reads (SENSE-TESTING LAW)

**leadfeast-s523** (invited d62, died d115, 12 post-invite monster-verb deaths: 4 RAID / 8 EXPEDITION) read end-to-end. The story is coherent and brutal:

- d61: first monster raid — 5 raiders (The Focus Group, The Ugly Beast, Murkcap, Ad Break, Sweeps Week), no walls. Two unmet raiders linger.
- d62: the table invitation lands; the scholar dies the SAME day — the mantle transfers THREE times in one day (Khaled→Somchai→Anatoly), each announced with the identical "The Codex doesn't pause for grief..." template.
- d72: second raid brings The Reunion. d74: "💀 The Reunion killed Diana in 1 round. The village mourns." "💀 The Audit killed Olivia in 1 round." The Loud Beast takes Quinn and Ivy. d79: The Rerun kills Leo in 2 rounds.
- d83: third raid — The Reunion unmet, lingers. d84–88: it gorges ~800–1,800 kcal/night while killing Alfredo, Mileidys, Bishoy — one round each. (These are the instrument's 3 lingering-channel RAID tags — the attribution reads true against the beats.)
- Meanwhile human village raids (Emberhold, Stonebridge, The Bloodied, The Red Table, Thornfield) strip 700–1,500 kcal/night — and **never kill**: "Nobody's dead, but the message is clear." Only monster raids kill.

Template fingerprints (the usual suspects, relentless): "X stops at the treeline — pacing, unwilling. The walls end the argument. It's still out there." / "X came back from the treeline white-faced. Saw it too." / "Night. The treeline is just a sound now. The fire is the whole argument against it." / "⚔️ X stood down the Y and kept walking — N rounds, bloodied but breathing. It's still out there, somewhere." / the mantle-transfer template. The 1-round wave-4 kills ("The Reunion killed Diana in 1 round") are the lethality story in one line.

Genuinely human moments: d63 James's dream beat ("I need to tell you something. Last night I... dreamed? No. I was AWAKE. And something spoke to me."), the village-specific raid beats with named villages and kcal amounts, the d71 Red Table gossip ("Tariq was killed — Ruth did it, they say. (The truth: dead is dead; the killing part is gossip.)").

---

## Village assessment

The villages on this substrate die the way overtimedeath said — of combat, not hunger — and this arm names the channels. The raid channel is real but minority: haven raids arrive 6–13 times per run, defenders meet most raiders at the treeline, and ~28% of the post-invite monster-verb deaths are raid-system kills — always by wave-3+ monsters (Reunion ×7, Eulogy ×3, Eater ×3), never by the wave-1/2 raiders that visit pre-invite. The majority channel is raw field exposure: villagers meeting wave-3/4/5 monsters in the wild (villagerMonsterTick) on days the scholar is out traveling — 1.5%/day pre-invite, ~10%/day post-invite, a ~6.5× lethality jump that tracks wave exposure, not the ladder's tier clock.

Who dies: everyone, steadily — defenders at the treeline (raid), wanderers and foragers in the wild (field), scholars cycling the mantle (~8/run across the set). What was missing: no patrols exist on this road (filed), no village sat the table (0/16 sittings — the seatpath funnel), and the raid-defense answer for wave-4/5 raiders is unbuilt (finding #161's shadow — the call-for-help chain exists but the village fights one-round killers with bodies).

The blank filled: the (b)-channel is now source-tagged — 28% raid-knobs, ~72% field exposure. The overtimedeath "next arm" question is answered.

---

## Metric review (§14)

GO met: 74/74 post-invite monster-verb villager deaths sourced, unattributed = 0. No metric revision needed. Three instrument/method lessons:

1. **The EXPEDITION tag is a broad correlation on travel-heavy roads.** The scholar travels on ~95% of courtship-road days (579 legs/180d), so EXPEDITION ≈ "non-raid field death" here. The pre-registered rule was honored exactly; the fork verdict doesn't depend on the EXPEDITION/WILD split. A future run wanting a sharper expedition cut should key on scholar-away-at-beat + travel, or on the fight's node vs the scholar's node.
2. **The crisis is corroboration, not the tag** — proven right by the 5 crisis-less RAID deaths (3 lingering-channel, 2 blocked-crisis direct waves). Finding #357's honesty requirement is satisfied structurally: attribution comes from engine fight-context markers, never from prose or from crisis state alone.
3. **Det-gate cost**: 4 pairs × 60d took ~11 min (the dayHash loop is fine; loadGame dominates). Future read-only proofs can use 40d without losing the point.

---

## The fork verdict

**FIELD-EXPOSURE-DOMINANT.** The ladder kills mostly through raw wave-4/5 field exposure, not its raid knobs — said plainly, this is the deeper pacing question, not a tuning fix.

The numbers: of the 74 post-invite monster-verb villager deaths, 21 (28.4%) carry the engine's raid markers (havenRaidTick's opts.raid or the raiders' m.lingering). The overtime raid knobs (overtimeRaidKnobs: cooldown 7→3, skip 0.82→0.46, gorge ×1.25/tier) can at most address that 28% — and their measured marginal is small (raid death rate 3.7%/day → 4.2%/day from tier-0 to tier≥1). The other ~72% is wild field encounters with wave-3/4/5 monsters at ~9–10%/day post-invite vs 1.5%/day pre-invite — the overtime worldMonsterCap wrap ("the world holds more monsters", +ceil(t/2)/tier) feeds this channel too, but the lethality jump tracks wave exposure, and the wave-4/5 one-round kills (Reunion, Rerun, Audit) are a pacing fact about the monsters, not the knobs.

Named next levers (for the coordinator, not this arm): (a) the raid-knob tune (cooldown/skip/gorge) — viable but capped at ~28% of this channel; (b) the field-exposure pacing question — wave-4/5 field lethality vs villager survivability, world-monster density at scale, and the unbuilt raid-defense answer for apex raiders (filed finding #161's territory); (c) the patrol blank just filed — assigning patrols is the cheapest experiment for whether proactive threat-thinning moves the 72%.

---

## Convergence state

**converging.** The scale-onramp axis is not converged: the mortality wall is now attributed two levels deep (overtimedeath's rerun/field split → this arm's raid/field-exposure split), but the wall itself stands — 15/16 village-lost on the pre-seat substrate, median 116d, wins 0/16 without the seat driver. The directive's trigger (national reached in sims) was already met on the full-stack substrate; whether the directive lifts is a Steve/coordinator call.

---

## Per-seed JSONs

evidence/2026-10-16/perseed-fieldfightsrc/ (numeric wall-metric keys: national/table/wins/exiled as numbers) · beats: evidence/2026-10-16/fieldfightsrc-beats/ · summary: evidence/2026-10-16/fieldfightsrc-summary.json

## Proof artifacts

- scripts/fieldfightsrc-20261016.js — the instrument (read-only wraps + sweep)
- scripts/test-fieldfightsrc-20261016.js — proof: 21/21 synthetic unit RED→GREEN, SMOKE 27 pass, DET-GATE 4/4 trajectory-identical (plain-repeat + instr-repeat + plain==instr, ends agree)
- scripts/analyze-fieldfightsrc-20261016.js — the analyzer
- Live plumbing probe (one-off, not committed): opts.raid and m.lingering verified reaching the death-beat stack on real engine fights; the fieldFight lingering-upgrade path proven on real data (3 lingering-channel RAID tags, leadfeast-s523 d86–88)
