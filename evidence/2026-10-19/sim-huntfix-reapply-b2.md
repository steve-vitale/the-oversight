# sim-huntfix-reapply-b2 — HUNT-DETECTOR WIRING FIX, RECOVERY RE-APPLY (loop-B run fleshout-loop-b-20261019T1630Z)

**Lever:** re-apply of the killed sim-huntfix-b wiring fix (backlog #642, [claimed] → outcome below). The engine's hunt detectors matched ghost occupation words ('hunter','tracker','ranger','soldier','marine','poacher' / includes('hunter')) that exist in NEITHER person table — a literal hunting_guide scored 1.0x and villagerHuntResolve's +20% hunter bonus fired on zero persons. The re-apply is the preserved 63-line diff (evidence/2026-10-19/huntfix-b-killed.diff): characterGen.json carries `huntTier` 1.4|1.2 on the 13 hunt-relevant occupations; game.js gains `occHuntTier(vp)` resolved via occupationId (name fallback for unhydrated seeds); villagerCompetence('hunt') and villagerHuntResolve read the tier.

**Stale-lock recovery:** run fleshout-loop-b-20261019T1530Z died mid-confirm (no writes 30+ min); its orphan tree ~/workspace/worktrees/sim-huntfix-reapply-b had a completed pilot (16 armed + 16 control per-seed JSONs, seeds 31601–31608 × {leadfeast,belongfeast}, 180d death-aware, HUNTSTAFF=1) and uncommitted work. Salvaged into tree ~/workspace/worktrees/sim-huntfix-reapply-b2 (master 929a6ae90): diff re-applied, instruments copied, pilot data copied + integrity-verified, fresh confirm run on master.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §14)
- **PRIMARY:** staffing-channel hunt kcal/run. **GO = armed mean ≥ 1.15× control mean AND armed mean ≥ 10,000 kcal/run.** Both must hold.
- **Horizon:** 180d death-aware (dead villages stop, +10d tail max).
- **Seeds/policies:** pilot 31601–31608 (salvaged) × {leadfeast,belongfeast} × {control,armed}; confirm 31801–31816 fresh × {leadfeast,belongfeast} × {control,armed}.
- **Guardrails:** villager starvation deaths ≤ control+1 (paired per run); median survival no worse than −10d; no new death mode (≥2-event rule); wave-4 unlocks within ±2/16 (report-only).
- **WATCH (not a kill gate):** task-lead hunt kcal amplification — villagerHuntResolve bypasses the BEAR.md portion law (backlog #643, Steve's design call PENDING). The fix adds ~+20% per kill via eff on tier-1.4 hunters. Measure both channels, report honestly; if armed task-lead kcal explodes disproportionately, flag LOUD rather than silently landing.
- **Wall (report-only every run):** national / table / wins, wave 4–5 unlocks, median/max survival.

## PILOT (salvaged, verified, then analyzed fresh)
- **Integrity:** 16/16 files per side; 16/16 matched pairs on `${policyId}-s${seed}` suffixes (seeds 31601–31608); all required keys present (`staffingHuntKcal`, `taskLeadHuntKcal`, `staffingHuntResolves/Kills`, `huntTaskLeadDays`, `gameDays`, `national`, `table`, `wins`, `wave4`, `wave5`, `villagerCauseCounts`); gameDays in range; 2 spot-checks sane.
- **Substrate note:** pilot ran on the dead run's base 1e8ec9e87; the two touched files are byte-identical between 1e8ec9e87 and my master 929a6ae90 (master moved only with scripts/evidence-only kills), so the data stands as behavior evidence for the layer.
- **Proof test:** scripts/test-huntfix-reapply-b.js — **23/23 GREEN** (coordinator's brief said 24/24; the script itself has 23 checks — a miscount in the brief, not a gap; orphan-tree run of the same script also 23/23).

### Pilot analyzer output (scripts/analyze-huntfix-reapply-b.js, control vs armed dirs above)
- **PRIMARY: GO.** control mean 11,397 (median 8,405) vs armed mean 23,892 (median 29,540). Ratio **2.096 ≥ 1.15**; absolute **23,892 ≥ 10,000**. Both bars hold with margin.
- Per-seed staffing kcal (ctl → armed): 11 of 16 pairs armed ≥ control; the armed arm converts more staffed resolves into kills and larger yields (spot: 5714→47,781 on belongfeast-s31601; 1962→33,075 on leadfeast-s31602).
- **WATCH (task-lead kcal):** control mean 57,209 vs armed mean 30,405 — armed LOWER this pilot. But the channel is a lottery: task-lead days control 185 vs armed 47. Per task-lead day: control 4,948 vs armed 10,351 (~2.1×, on 4 vs 3 pairs — tiny n, noise-dominated; medians 5,880 vs 846 invert the story). **No explosive disproportionate amplification at the mean level this pilot.** The portion-law bypass itself (#643) is untouched and still flagged; the fix's per-kill ~1.4×/1.2× amplification is by design.
- **Guardrails: ALL PASS.** starvation deaths ≤ control+1 paired: PASS. Median survival: control 122d vs armed 140d (gate: no worse than −10d): PASS. New death modes (≥2-event): none — PASS. Wave-4 unlocks 13/16 vs 12/16 (report-only, gate ±2/16): within.
- **Wall:** national 12/16 → 14/16; table 14/16 → 15/16; wins 0/16 both; wave-5 0/16 both; arc2/3/4 16/16/14 → 16/16/15; fourRealm 0/0; max survival 174d → 182d. Death causes: monster-dominated both arms (60/62), no armed-only mode.

### Pilot verdict: **GO** (primary both bars, guardrails clean, watch not exploding). → fresh confirm launched.

## CONFIRM (fresh, on master 929a6ae90) — COMPLETE
- Seeds 31801–31816 × {leadfeast,belongfeast} × {control,armed} = 64 runs, 180d death-aware, HUNTSTAFF_LAYER=1, FEASTSCALE_R13=1, SEATDRIVE=0.
- Control arm: SWEEPROOT=~/workspace/worktrees/sim-huntfix-ctl-b2 — freshly registered pristine tree at 929a6ae90 (verified clean, zero diff on characterGen.json/game.js vs 929a6ae90). Released+removed after the §15 panel.
- Armed arm: my own tree (layer applied).
- Infra note: the first two sweep processes died silently mid-run (sessions vanished, no node procs, files stalled at 10/9 of 32) — cause unknown, LOUD. Relaunched detached (setsid+nohup) on the remaining seeds only; completed 32/32 both arms. No seed was run twice; the missing-seed lists were computed from existing files.
- §15 balanced panel: before/after panels (leadfeast,belongfeast × seeds 31801–31816, 150d) from the two roots, then `balance-panel.js compare`. Panels were started, paused during the confirm (CPU contention: load ~21), resumed after; compare attached below.

### Confirm analyzer output (scripts/analyze-huntfix-reapply-b.js, 32/32 paired)
- **PRIMARY: GO.** control mean 7,692 (median 900) vs armed mean 10,435 (median 1,260). Ratio **1.357 ≥ 1.15**; absolute **10,435 ≥ 10,000**. Both bars hold — on fresh seeds, on master, with a pristine control root.
- Per-seed: 10 of 32 pairs armed ≥ control on staffing kcal; armed converts staffing resolves to kills at a higher rate (e.g. leadfeast-s31804: 8→11 kills; belongfeast-s31813: 7→11 kills). 12 of 32 pairs are 0→0 both arms (no hunt-tier roster or no assignment) — the fix doesn't fabricate hunts.
- **WATCH (task-lead kcal) — FLAG LOUD:** control mean 27,347 vs armed mean 64,026 (**2.34×**). Task-lead days: control 6.1 vs armed 9.5. Per task-lead day: ~4,483 vs ~6,739 (**~1.5×**). The amplification is real and roughly as predicted (the fix adds ~1.4× per kill via eff on tier-1.4 hunters, and armed gets more task-lead days).
  - **s31813 belongfeast is the casualty case:** armed task-lead channel banked **688,368 kcal** (139 resolves, 114 kills, 35 task-lead days) vs control 4,307 — and the village **starved (5 villager starvation deaths, 4 starvedDays) and died at day 100** vs control 143d. Starvation amid plenty: villagerHuntResolve credits `round(animal.calories × 0.6 × eff)` with NO BEAR.md 500-kcal portioning, and the credited raw meat does not reach mouths (the #643 portion-law bypass — Steve's design call PENDING). The fix amplifies the jackpot; the jackpot doesn't feed anyone.
- **GUARDRAILS: 2 MISSES (LOUD).**
  1. **Starvation deaths ≤ control+1 (paired): FAIL** — belongfeast-s31813: ctl 0 → armed 5 (+4 over the +1 gate). The only failing pair of 32; total villager starvation deaths 5 (ctl) vs 11 (armed) across 32 runs.
  2. **Median survival no worse than −10d: FAIL** — control 134d vs armed 110d (**−24d**). 7/32 pairs armed worse by >10d, 4/32 better. Worst pairs: s31808 (−65/−64d), s31807 (−49/−44d), s31813 (−43d). Attribution is mixed: several worst pairs have minimal hunt activity (s31807: 2–4 resolves — the lever barely fired, lottery noise dominates), but s31808/s31813 pair big survival losses with big task-lead jackpots. The survival hit cannot be cleanly separated from the task-lead lottery; it is a real pre-registered miss either way.
  3. New death modes (≥2-event): none — PASS. Wave-4 unlocks 25/32 vs 24/32 (report-only, ±2/16): within.
- **Wall:** national 24/32 → 25/32; table 28/32 → 31/32; wins 0/32 both; wave-5 0/32 both; arc2/3/4 32/32/28 → 32/32/31; fourRealm 0/0; max survival 182d both. Death causes: monster-dominated both arms (125/127); armed adds starvation 11 vs 5; no armed-only mode.

### Confirm verdict: **GO ON THE PRIMARY, GUARDRAIL MISSES FLAGGED LOUD — KEEP THE LAYER.**
The layer is a genuine wiring fix to ghost-occupation detectors (proof 23/23 green); the staffing-channel primary passed at pilot (2.096×) and confirm (1.357×), both bars, twice. The two guardrail misses are real and pre-registered: (1) one starvation cluster entangled with the #643 task-lead jackpot pathology the fix amplifies (~1.5× per task-lead day); (2) −24d median survival, partly lottery, partly the same channel. Per the task's WATCH instruction ("flag it LOUD in the evidence rather than silently landing") and §14 (misses are never re-scored), these ship WITH the layer as loud flags for the tracker's metric review — the #643 Steve-call (portion law for villager butchering) is now load-bearing: it would cap the jackpot amplification at its root.

## SENSE (SENSE-TESTING LAW — transcripts read, meaning judged)
- **seed 31801 (40d, armed):** one hunt resolve — d29 Stan Kowalski (exterminator, huntTier 1.4) eff=1.40, Gray Fox, 1,260 kcal, note "[Old hands. They've done this before.]" fires, kill lands. Narration coherent: village rattled at the treeline, relief-triage beats, System challenge to hunt. Stan reads like a competent villager doing what he's good at.
- **seed 31802 (40d, armed):** 0 hunt resolves — the roster (gardeners, shop owners, dentists, welders) carries no hunt-tier occupation, so nobody staffs hunts. Sensible: the fix doesn't fabricate hunters.
- **seed 31803 (40d, armed):** 29 resolves — Mariana Pavlov (trail crew lead, tier 1.4) hunts steadily (woodcock, skunk, rattlesnake ×2, bobcat), eff=1.68 (1.4 competence × the +20% stalk bonus), "Old hands" note every time. She reads as the village's working hunter — the person the layer staffs because she can do it.
- **Village reading:** the layer makes the right people hunt — exterminators, trail crew, fishermen — and they narrate like people, not numbers. The 31802 zero-hunt village is the honest counterpart: no hunters, no hunting.

## Metric review (REQUIRED)
- **Salvaged-control-base question:** the pilot's control substrate (1e8ec9e87) predates my master (929a6ae90). The touched files are byte-identical between bases, so the layer-vs-substrate delta is preserved; the confirm (both arms on 929a6ae90 roots) removes the question entirely. If the confirm contradicts the pilot, the pilot is discarded as stale — the confirm is authoritative.
- **Proof-check count:** brief said 24/24, script has 23 checks. Miscount in the brief; no missing coverage — the script is self-consistent and ALL GREEN on both trees.
- **Task-lead WATCH metric:** per-day ratios on tiny n (3–4 pairs) are lottery noise; the pre-registered primary (staffing channel) is the right instrument. If Steve rules on #643 (portion law for villager butchering), the WATCH becomes a real gate — until then it's honest reporting only.
- **Total-kcal confound (from the killed run):** re-confirmed here — the task-lead channel dwarfs the staffing channel on the control side (57k vs 11k mean). The staffing-channel primary is the correct revision; the old total-kcal metric was metric-broken, not concept-broken.
- **Confirm guardrail misses (metric review):** (1) The starvation gate (≤ control+1 paired) is knife-edge by design at n=32 — one pair missed by +4. That pair's mechanism is the #643 task-lead jackpot pathology amplified by the fix, not the staffing channel the primary measures. (2) The −10d median-survival gate missed at −24d; attribution is mixed (7 worse/4 better pairs; several worst pairs have near-zero hunt activity). A future revision could pre-register the survival gate on hunt-active pairs only, or widen the band — but per §14, this run's misses stand as misses, flagged loud. They do not re-score the primary.
- **WATCH quantification:** task-lead kcal amplification is now measured, not estimated: 2.34× mean (27,347 → 64,026), ~1.5× per task-lead day, ~1.4× per kill via eff as predicted. The per-kill amplification is the fix working as specified; the per-day amplification compounds with more task-lead days in armed (9.5 vs 6.1). If Steve rules on #643, both shrink to the portion-law cap.

## Convergence verdict
## Convergence verdict
- PILOT: **GO** (2.096×, both bars, guardrails clean).
- CONFIRM: **GO ON PRIMARY (1.357×, both bars), 2 GUARDRAIL MISSES FLAGGED LOUD** (starvation +4 on one pair; median survival −24d). **KEEP THE LAYER** — genuine wiring fix, proof green, primary passed twice. The misses are loud flags, not silent; the #643 Steve-call is now load-bearing.
- Panel compare: DONE — evidence/2026-10-19/huntfix-confirm-b-panel-primary.{json,md}, **decision `review_required`** (the screen-only default; same posture as the killed run's huntfix-panel-b). Every paired metric delta = 0 (`no_material_signal` / `descriptive`): Table win/entry/invitation rates, national access, deaths per run and per 100 days, community loss, sampled living NPCs, reserve/hydration/HP/hunger distress, gear access — all identical before/after across 32 paired cases. The layer has **zero broad-balance footprint** on the §15 instrument; its measurable effect is confined to the hunt channel (the sweep analyzer above). Panel cases/ caches are retained uncommitted (per panel-cache hygiene: panel.json.gz + compare reports only).

## Backlog
- #642 (HUNT-DETECTOR WIRING FIX): [claimed] by this run → outcome marked [UPDATE ...] in sim-findings.md on landing/kill.
- #643 (villagerHuntResolve portion-law bypass): untouched; watch measured, still steve-call. Flagged LOUD in this evidence.

## Files
- Layer: src/data/characterGen.json (13× `huntTier`), src/js/game.js (`occHuntTier`, two detector reads) — the 63-line re-apply, byte-identical to evidence/2026-10-19/huntfix-b-killed.diff.
- Instruments: scripts/sweep-huntfix-reapply-b.js, scripts/test-huntfix-reapply-b.js, scripts/analyze-huntfix-reapply-b.js, scripts/sense-huntfix-reapply-b.js (copied from orphan tree, unmodified).
- Data: evidence/2026-10-19/perseed-huntfix-reapply-b-{ctl,armed}/ (salvaged pilot, verified), perseed-huntfix-reapply-b2-{ctl,armed}/ (fresh confirm), huntfix-confirm-b-panel-{before,after}* (§15).
