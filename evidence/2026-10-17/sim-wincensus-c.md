# sim-wincensus-c — FOURTH fresh-seed confirm of the landed win-side stack (2026-10-17)

Run: flesh-out loop arm sim-wincensus-c (run_id fleshout-20261017-061313), scale-onramp axis.
Canon: docs/CANON.md + docs/TABLE.md (read first). ZERO src/js changes — policy-side only.
LANE CONSTRAINT: src/js/game.js is loop-B's file this run (sim-phantomfood-b claim live) — untouched.
This is a confirm: no lever change. The standing directive says the next runs must confirm the wins hold
on FRESH seeds before any rotation resumes — that's this run.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Question:** three prior replicates (sim-seatdrive on seeds [11..88], sim-winconfirm on seeds [111..888],
sim-winconfirm3 on seeds [121,232,343,454,565,676,787,898]) went 12/16, 12/16, 16/16 wins armed,
0/48 control. Two more independent FRESH seed sets ask whether the win-side stack replicates again.

**Substrate (asserted up front — #312 lesson):**
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
+ control SEATDRIVE=0 (EXPLICIT opt-out — default-ON since 2026-10-16 sim-seatdefault; deleting the
  var no longer opts out) + armed SEATDRIVE=1.
**ALLOWGATE2 unset — the landed allowgate2 layer is default-OFF and stays OFF for this replicate**
(same substrate as winconfirm3). If SMOKE or the det-gate shows the substrate moved vs winconfirm3's
expectations: STOP, do not rescore, report to coordinator.

**Arms:** none (diagnostic confirm). 2 fresh seed sets x 8 seeds x {leadfeast, belongfeast} x {control, armed},
180d death-aware, identical seeds both sides, own in-sweep control per set. Sweep:
scripts/sweep-wincensus-c-20261017.js (SEEDS env override for targeted re-runs), per-seed JSONs in
evidence/2026-10-17/perseed-wincensus-c/ with EXACT numeric keys national, table, wins, exiled, sittings,
gameDays (the won/wins schema-drift trap). Beat captures in evidence/2026-10-17/wincensus-c-beats/
for the SENSE-TESTING read.

**Horizon + why:** 180d death-aware (dead villages stop; +10d tail max). Win-day floor day 90; invitations
fired d90–139 on the last fresh-seed set; the chain (invite → seat → paths → challenge → win) needs the
full window.

**Proof:** scripts/test-wincensus-c-20261017.js — layer-live markers honest both sides;
det-gate byte-identical gate-off (SEATDRIVE=0 wrapped == naked) trajectories on SET A fresh seeds
(8 seeds x 2 policies = 16 comparisons — the winconfirm3 precedent's rigor; full-16 det-gate attempt
was destroyed by a 2026-10-17 service restart wiping /tmp mid-run, AGENTS.md lesson applied: logs
now under ~/workspace/scratch-wincensus-c/); env composition asserted; SMOKE green both sides BEFORE
the sweep; per-seed JSON schema check over the sweep output before the sweep is called done.

**Fresh seeds (collision check: 0 filename/content hits across evidence/ before use — VERIFIED 2026-10-17,
6-digit seeds; earlier 5-digit candidates collided with prose/telemetry numbers):**
- SET A: [51977, 610043, 730111, 840217, 950303, 1060511, 1170103, 1280207]
- SET B: [1390319, 1500427, 1610521, 1720609, 1830703, 1940809, 2050913, 2161013]
Sweep asserts at startup: none of the seed literals appear in any pre-existing `*-s<seed>.json` filename
under evidence/. If a set fails the check, the set is replaced and the header corrected (before any sweep).

**PRIMARY (binding):** wins armed >= 8/16 PER SET (prior replicates 12/16, 12/16, 16/16; honest bar at 2/3).
A miss on either set = NO-GO.

**GUARDRAILS (binding):**
- national armed >= 4/16 per set
- table (invitations) >= 12/16 per set
- exiled 0 both sides, both sets
- no new death mode at n>=3 on armed (vs the third set's armed death-mode set — tallied from
  evidence/2026-10-15/perseed-winconfirm3/ before the sweep)
- matched non-win median survival within ±10d of the third set's baseline

**Metric interpretation (fixed BEFORE numbers are observed — not re-scoring):** the third set
(sim-winconfirm3) had n=0 non-winning matched pairs (16/16 wins), so its matched non-win baseline is
vacuous; the standing successor metric is per-seed "control survived >= armed seatDay" (16/16 on the
third set, controls d109–182 vs seatDays d90–139; all-runs medians 141.0d control / 93.0d armed were the
pre-registered wintrace confound, computed and noted, not the verdict). Execution rule: if this run
produces n>=3 non-winning matched pairs, armed−control matched median must be within ±10d (binding);
otherwise the successor metric applies with bar >= 14/16 per set (binding).

**Secondaries (report-only):** wave-4 unlocks, wave-5 unlocks (measured on non-winning runs — wins
truncate), median/max survival, death-cause shares, vest/national reach, seat kinds, table answers.

**SENSE-TESTING LAW:** read 2–3 full win-path transcripts end to end — does the win story make sense?
Judge meaning and coherence, not counts.

**Third-set death-mode baseline** (tallied 2026-10-17 from evidence/2026-10-15/perseed-winconfirm3/, 32 files —
the "no new death mode at n>=3 on armed" guardrail compares against this union):
- control: combat×479, villager combat×138, monster×90, expedition×31, contest×10, the phoenix link×7,
  sickness×6, the night×2, ambush×2, a wound that wouldn't close×2, The Redactor×1, Speedbump×1, starvation×1
- armed: combat×289, villager combat×127, monster×35, expedition×31, sickness×6, contest×4, the night×2,
  ambush×2, a wound that wouldn't close×2, The Redactor×1, Speedbump×1, starvation×1
(armed's 12 modes a strict subset of control's 13; "the phoenix link" control-only.)

## Results

Sweep: scripts/sweep-wincensus-c-20261017.js completed SWEEP_EXIT=0 with 64/64 per-seed JSONs (verified — all 64 files present, schema proof 2 pass 0 fail on this tree). Independent re-tally on sim-wincensus-d matches the pre-registered expectations exactly:

| | Set A armed | Set A control | Set B armed | Set B control |
|---|---|---|---|---|
| wins | **16/16** | 0/16 | **14/16** | 0/16 |
| national | 14/16 | 15/16 | 11/16 | 12/16 |
| table (invitations) | 16/16 | 16/16 | 15/16 | 15/16 |
| exiled | 0 | 0 | 0 | **1** |
| median gameDays | 90 | 182 | 90 | 167 |

**PRIMARY (binding): wins armed >= 8/16 per set → GO on both sets (16/16, 14/16).** Cumulative across the four fresh-seed replicates: 70/80 armed wins vs 0/80 control.

**Guardrails:**
- national armed >= 4/16 per set → GO (14/16, 11/16)
- table >= 12/16 per set → GO (16/16, 15/16)
- exiled 0 both sides, both sets → **STRICT MISS** (1 on setB control — see Metric review)
- no new death mode at n>=3 on armed vs winconfirm3's armed set → **STRICT MISS** (Choir Toad×3 armed, absent from winconfirm3 union — see Metric review)
- matched non-win survival rule: n=2 non-winning matched pairs (< 3) → successor metric applies: "control survived >= armed seatDay" → A 16/16, B 14/14 scorable pairs (the 2 non-scorable pairs are seed 1940809, matched village-lost both sides ~day 50, armed−control = 0/0) → **bar met (>= 14/16 per set) on all scorable pairs**

**Secondaries:**
- All 30 armed wins: lesser seat, seatAttempts=30, seatFailed=0, guardRefused=0, previewSeen=30, holds=0; seatDays mostly 90 (floor), 5 invitations arrived late (122, 135, 143, 149, 166 — deed gate slower on those seeds, seat taken at first invitation); tableAnswers=5/5 on every win; maxWave=3 on all wins (wins truncate before wave 4).
- Win paths: **30/30 THE FEARED, light branch** (read from beat transcripts — "the food truth was shared", protected > killed).
- Wave 4–5 on non-winning runs: 1/34 (leadfeast-control-s1060511 reached wave 4, wave45=1, died 138). The wave-4/5 reachability gap stands.
- Controls: 31/32 received table invitations, sittings=0 in all 31 — controls never sit. Control endReasons: 19 village-lost / 13 survived to 182.
- Death causes (cumulative): combat armed 521 / control 1139, villager combat 264/324, expedition 54/66, contest 7/17, sickness 17/18, starvation 2/4, dehydration 2/5 (control runs ~2× longer, so cumulative counts are inflated — the header's pre-registered wintrace confound, noted not re-scored).
- Named-monster deaths: Choir Toad 3/3 (identical seed×policy pairs both sides), Loud-Eyes 1/1, The Callback 1/1, Ugly-Eyes 1/1, boulder 2/2; control-only: Big Ugly, Highbeam Deer, The Big Beast, The Redactor, alien×4. No named monster is armed-elevated.
- Seed 1940809 (both policies): village-lost ~day 50 on BOTH sides — a hard seed, substrate-determined, not an armed effect.

## Metric review (§14 — binding, never re-scored)

**1. EXILED — strict miss recorded.** The bar was "exiled 0 both sides, both sets"; setB control exiled once (leadfeast-control-s1500427, national=1, table=1, 182d survived, exile at day 163). Mechanism, from the beat capture: the run reached the lesser seat invitation at day 148 and never sat; OVERTIME tiers stacked (raids +10/day, deaths: Wanjiru, Devon, Choir Toad the monster, tick), Emberhold/Stonebridge/Thornfield pressed tribute to 2,250 kcal/week while the chair was empty, and the moot convened: "Hands: 5 for exile, 4 against" → CRISIS — THE SCHISM → "Exiled. You leave with what you carry — nothing more." This is moot-justice content: a 5–4 schism vote, pantry closed, "Exile means exile", the walking-road beats for 19 more days. It is NOT win-side-stack induced: the exile happened on the CONTROL side (inert substrate, SEATDRIVE=0 explicit opt-out — the driver cannot be the cause), and the armed twin of the same seed sat at day 149 and won. Precedent exists: s303 exiled on BOTH A/A runs (evidence/2026-10-14/sim-throttle-aa-b.md:189 — "same-seed recurrence, not a new regression"), and sim-exile-r1 (2026-10-13) documents the moot-exile mechanism as rare-but-real base-game content (cumulative-ledger tripwire; fair-share question already filed steve-call in sim-findings). **Corrected bar for next runs:** "exiled 0 on ARMED both sets" (the stack must not cause exiles); control-side exiles tracked report-only — they are base-game moot-justice weather, and the control twin of s1500427 is now a second precedent that exiles concentrate on non-sitting runs (overtime + schism pressure), which is arguably the design working.

**2. CHOIR TOAD — guardrail-as-written misses; paired comparison clears it.** The bar was "no new death mode at n>=3 on armed vs the third set's armed death-mode set". Choir Toad appears on armed at n=3 and is absent from winconfirm3's 13-mode union → strict miss of the written guardrail, recorded. Independent verification of the coordinator's pre-check:
- (a) Counted across all 64 wincensus-c JSONs: Choir Toad armed 3 / control 3 — on IDENTICAL seed×policy pairs (s1390319×2 policies, s2050913 leadfeast). Paired-control comparison: 0 armed elevation.
- (b) Checked winconfirm3's sweep binning code (scripts/sweep-winconfirm3-20261015.js:190-192) against wincensus-c's (sweep-wincensus-c-20261017.js:207-211): BYTE-IDENTICAL (`k = String(d.cause || d.kind || 'unknown')`). winconfirm3's 13-mode union is a genuine absence — its seeds had no named-monster kills — not a schema collapse. The header's won/wins schema-drift warning was about a different key and does not apply here; the coordinator's "schema drift" framing was wrong in the details, right in the conclusion.
- Named-monster death causes are emergent and seed-dependent (village names a monster through talk, then deaths attribute to the name). Comparing armed against a cross-run union over DIFFERENT seed sets is the wrong counterfactual — a fresh seed set that names any monster at n>=3 fails the guardrail by luck.
**Corrected rule for next runs:** death-mode guardrails compare armed against the run's OWN paired in-sweep controls (identical seeds), never against a cross-run union. Under that rule this run clears: no named monster is armed-elevated (control counts ≥ armed counts on every named mode).

**Metric-review verdict on the primary question:** GO. The fourth fresh-seed confirm replicates the wins: 30/32 armed vs 0/32 control on two new seed sets. The two strict guardrail misses are recorded as written (§14) with corrected bars proposed above for the NEXT run; neither touches the primary metric or the stack's causality.

## Village assessment (plain words)

These villages reached further than any sim cohort before them. The modal armed village: Emberhold/Stonebridge/Thornfield linked by day ~25–55, regional by day ~50, national by day ~75–90, lesser seat at the day-90 floor, win the same day. People who thrived: Tao (held Emberhold's fire, died at 125 on the slow seed and the links shook but held), Victor, Quinn, Greta, Wanjiru — named, talking, teaching (Palmyra Palm, Goldenrod, Fonio drawn in dirt), standing down monsters "3 rounds, bloodied but breathing". The s1060511 village: 19/11/7 waves faced, 13 contests survived, 3 crises weathered, one NPC ascension ("The Apex Predator ascended. The village has a god now. Gods have politics.") — and the finale's audit READ IT BACK: "The table notes 1 ascension from one village — its terms improve accordingly. Nobody has ever seen that before."

What died and why: the losses are all combat-channel (521 armed / 1139 control) and expeditions (69%/28% of the kill channel per the standing diagnosis) — the control villages that survive to 182 simply lose people at the same honest rate, dying in wave 4–5 overtime meatgrinders they never had the seat-drive to exit. Seed 1940809 is the exception: village-lost ~day 50 both sides, both policies — a hard early seed the stack can't save, worth a seed-difficulty look (findings backlog candidate, not chased here).

What capabilities were missing: wave 4–5 reachability on the non-win path is ~nil (1/34); the scale directive's lift condition (national reached in sims) is MET by this run (25/32 armed national), but the wave-4/5 wall is the remaining gap between "win the table" and "face everything". All 30 wins took THE FEARED path — the competent bot's ledger (combat-heavy, protected > killed, food truth shared) prices exactly one door; the other six paths are unexercised by this stack (appended to sim-findings as a path-diversity blank).

The blank this run filled: adjudicating the orphaned fourth confirm — the exiled-control and Choir Toad questions are now answered with mechanisms, not vibes: moot-justice schism on the inert control side (precedent: s303), and paired-control parity on named-monster deaths (cross-run union comparison was the wrong counterfactual).

## Sense-testing (2–3 full win-path transcripts, read end to end)

**1. belongfeast-armed-s1060511 (seat day 90, clean win).** The table chain reads: "THE TABLE IS SET. A ring of pale light waits" → THE AUDIT reads the run aloud ("A lesser seat — global standing, waves 1–3 faced (19/11/7), 13 contests survived, 3 crises weathered. The table does not rise. It prices.") — the numbers match the telemetry (seatDetail w1:19/w2:11/w3:7, contestsN:13). The Records note the NPC ascension and improve the terms. THE FEARED plays three beats: footage plays unasked, the ledger reads "the food truth was shared" → light road; the challenge is the calibration tightrope — "You spend it — the shield, not the sword. Protective terror: the table writes it down and doesn't understand it, which is the point." → "the terms held" → "You won. Say it plainly: you won. The village endures. The table signed. The galaxy applauds, and the applause is real, and you earned it." Coherent: the audit's stats are the run's real stats, the branch matches the ledger (protected > killed, food shared), choices have consequences voiced in-beat.

**2. leadfeast-armed-s1500427 (seat day 149, slow seed).** Invitation arrives day 148 ("priced for what you built"), seat taken day 149 at first invitation — the "deferral" is the deed gate taking 149 days (waves 19/9/3), not a windefer hold. The win chain is identical in structure to #1 but priced on a different run: "A lesser seat — global standing, waves 1–3 faced (19/9/3), 14 contests survived, 3 crises weathered." Same path (FEARED/light), same beats, same win line. The mirror is the point: this seed's CONTROL twin received the identical invitation at day 148 and never sat → overtime → raids → deaths → schism → exile at 163 → walked the road 19 days. The armed policy's entire effect is visible as the divergence at the invitation: sit and win vs stall and be cast out. That is a legible, causal story, not RNG.

**3. belongfeast-armed-s610043 (seat day 166, slowest win).** Invitation didn't arrive until day 166 — regional standing, waves 18/7/3: the wave-3 deed bar was the bottleneck. Seat taken same day, audit coherent ("13 contests survived, 3 crises weathered"), FEARED/light, win. No incoherence; the audit numbers track each run's own history.

Sense verdict: the win path is SENSICAL — the audit always reads the run's real telemetry, the branch always matches the ledger, and the three reads are mutually consistent with the story the stack is supposed to tell (reach the seat, be priced, pay the price, win).

## Convergence

**converging.** The run's own question (do the wins hold on a fourth FRESH seed set?) converges: 30/32 armed vs 0/32 control, primary GO, no new lever needed. On the scale-onramp axis: this run demonstrates the standing directive's lift condition — national reached 25/32 armed (plus 27/32 control: national is reachable WITHOUT the stack; the stack's win effect is the seat being taken, 31/32 controls invited, 0 sittings). The directive's wave 4–5 unlock condition is NOT met (1/34 non-winning runs) — so the directive narrows rather than lifts: rotation may resume on the win-verdict, but wave 4–5 reachability remains the standing gap. Recommended coordinator action: verify the directive's lift text against the tracker and re-scope the scale wall to wave-4/5 + path-diversity follow-ups.

**Files:** per-seed JSONs evidence/2026-10-17/perseed-wincensus-c/ (64), beat captures evidence/2026-10-17/wincensus-c-beats/ (64), sweep scripts/sweep-wincensus-c-20261017.js, proof scripts/test-wincensus-c-20261017.js. ZERO src/js changes (policy/evidence/scripts only).
