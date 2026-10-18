# sim-vetwindow — CLEAN re-run of the veteran release-window diagnostic (2026-10-18)

Run: flesh-out loop arm sim-vetwindow, axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first; the gate is design
call #4 — four bars; on the recalibrated bar (sim-readinessfix, 2026-10-18)
wave-4 demands {armored 3 @ P>=10, armed 5, tricks 3, veterans 1}, wave-5
{armored 4 @ P>=15, armed 6, tricks 3, veterans 2}). ZERO src/js changes,
ZERO scripts/policies changes — instrument-only arm. Instruments + evidence
only.

LINEAGE: the 2026-10-18 0831Z run claimed a sim-vetwindow diagnostic (NO-GO,
18.2% vs 80% bar) but left ZERO artifacts — no tree, no branch, no evidence,
no worker record. That claim is UNVERIFIED. This is the diagnostic run
cleanly from scratch, on the NEW (recalibrated) bar.

## The question

On the new readiness bar (veterans: 2 -> 1 for wave 4), does the veteran leg
still bind — and if so, on which substrate pattern? The release window is
where the answer lives: days the Standing door is open, readiness alone holds
it shut, and the veteran bar is the short one. Which channel kills veterans
in that window?

Binding anatomy (from sim-defercensus2b/3, on the OLD bar): veterans were in
the binding set on 98.5-100% of deferral days; the median village maxed at 1
living wave-3 killer vs demand 2. The recalibration moved demand to 1 — the
median village's level. This census measures the window on the new bar.

## Substrate (copied EXACTLY from evidence/2026-10-18/sim-defercensus3.md)

winseat: `withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))`
- VETREL=1 (companion veteran channel) + REPOSITION=1 (movement-kind
  execution) + NODEWITNESS=1 (witness observation channel, game-code flag in
  fieldFights.js) + SEATDRIVE=1 (seat driver, explicit composition)
- Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
  (+ WINPURSUIT=1 WINDEFER=1 set in-process; the windefer wrapper is
  composed, so the env is live — exactly the defercensus2b corpus)

## Definitions (src/js/standing.js — the engine's own)

- **veterans** = living roster members with a wave-(w-1)+ kill in
  `state.waveKillLog` (waveCombatReadiness). For w=4: wave-3+ kills.
- **release window** = days where `Game.standingDeferral(4).deferred` is true
  (raw Standing >= t4=100, !ready, peak<4) AND `'veterans'` is in
  `Game.waveUnlockReady(4).short`. On the new bar this is deferral days with
  ZERO living veterans.
- **veteran-leg satisfaction** = `waveCombatReadiness(4).veterans >= 1`.
- **DURABLE** release = the leg held >=7 consecutive days from first
  satisfaction. **TRANSIENT** = the leg dropped to 0 within <7 days (the
  transient-veteran mechanism: N living veterans at the gate instant, one
  dying the same day — defercensus2b documents it on the old bar; documented
  here, not judged). **CENSORED** = the run ended (won/lost/survived) with
  the leg still held <7 days — reported separately, counted in neither share.
- **Death channels**: raid / expedition / wild / patrol (fieldfight) vs haven
  vs disease vs alien vs other. Cause->channel map documented in
  scripts/vetwindow-sweep-20261018.js (classifyDeath); 'other' is a
  legitimate channel, never a void. Death-tele traps handled: dedup on
  (who,day,cause); kind-filtered to person deaths (the DEATH-TELE KIND
  POLLUTION finding); phantom person-teles (still-living villager per vpOf)
  excluded and counted.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Seeds:** 8 fresh (53101-53108 — verified unused as sim seeds in evidence/;
the only hits were pantry-kcal false positives), x {leadfeast, belongfeast} =
16 runs. **Horizon:** 180d death-aware (dead villages stop simulating; the
harness's runDays handles it). **No control arm** — this is a census (like
defercensus2b).

**PRIMARY (diagnostic GO, binding):** 100% attribution of veteran deaths to
channels with 0 unattributed rows, PLUS the release-window distribution
(median first-satisfaction day, median window length, transient-vs-durable
release share) computed on all 16 runs. A miss is NO-GO, never re-scored.

**The verdict names** THE channel(s) that kill veterans in the window, with
counts, and states whether the veteran leg still binds on the NEW bar (and
if so, on which substrate pattern).

**Fidelity (pre-registered):** DET-gate — instrument-on vs instrument-off
trajectories byte-identical (2 seeds x 60d), both-repeat stable;
FIDELITY — re-run 2 completed sweep seeds, byte-identical per-seed JSON
(including the veteran-death channel classification). Proof:
scripts/test-vetwindow-20261018.js (classifier fixtures + SMOKE + DET +
FIDELITY, all GREEN before the sweep except FIDELITY which needs the sweep).

**Deferral-day binding** (secondary, same method as defercensus2b/3):
sampleReadiness + attributeRun from scripts/wave4census-lib-20261017.js —
days the w4 veteran leg was the binding constraint vs armor/weapons/tricks.

## Results

**PRIMARY: DIAGNOSTIC GO — 16/16 runs fully attributed, 0 unattributed veteran-death rows, 0 instrument errors.** Per-seed JSONs: evidence/2026-10-18/perseed-vetwindow/ (16 files). Fidelity/det-gate: see Metric review.

### Veteran deaths by channel (8 total, all attributed)

| channel | n | causes |
|---|---|---|
| raid | 4 | 'combat' ×4 (scholar TB fights at haven; 3 via ctx:scholar-fight-at-haven, 1 via ctx:aid-crisis) |
| other | 2 | 'dehydration' ×2 (scholar thirst-deaths; see note) |
| expedition | 1 | 'combat' ×1 (scholar on expedition, ctx:on-expedition) |
| wild | 1 | 'combat' ×1 (scholar TB fight away from haven) |
| patrol | 0 | — |
| haven | 0 | — |
| disease | 0 | — |
| alien | 0 | — |

**In-window veteran deaths: 0/8.** Every veteran death happened on a non-window day. 7/8 happened AFTER wave 4 unlocked (the window closes at release — peak ratchet); the 8th (leadfeast s53106 d67) was on a run that never deferred (binding=standing).

**All 8 veteran deaths are scholar deaths (player=True).** Not a single villager veteran died in 16 runs. The ever-villager veterans (gen_do6b1kj, sanne_bakker) survived to run end.

Note on 'dehydration': the classifier maps 'thirst' → haven but 'dehydration' fell to 'other' (cause-unmapped). Dehydration IS thirst-death; under the taxonomy's intent it belongs in haven. Kept as 'other' per the proven classifier (fixtures); the cause is named in every row so the verdict is auditable. A future instrument revision should map it to haven.

### Release-window distribution (new bar, demand veterans=1)

- **Median first-satisfaction day: 65** (8/16 runs satisfied the leg; 8 never did)
- **Median window length: 16.5 days** (range 0–85; window = deferral days with 0 living veterans)
- **Leg durability: durable 7, transient 1, censored 0, never-satisfied 8**
  - The single transient (leadfeast s53104): leg satisfied d74 → wave 4 unlocked d74 → scholar-veteran died of dehydration d79 (5 days later). The peak ratchet held the release — the transient was harmless.
- **Binding labels (deferral-day method): veterans 7, unlocked 7, standing 2**

### The verdict

**The veteran leg still binds on the new bar — but the binding moved from SURVIVAL to PRODUCTION.**

On the old bar (demand 2), veterans bound 98.5–100% of deferral days because villages couldn't keep 2 killers alive simultaneously. On the new bar (demand 1):
- The leg binds on 7/16 runs (deferral days with 0 living veterans). The median village that defers needs ~16.5 days to blood its first veteran.
- Once produced, the veteran is NOT killed in the window — 0/8 in-window deaths. The window has no veterans to kill (by construction: window = 0 living veterans).
- Veterans die AFTER the release: 7/8 deaths happened post-unlock, in the wave-4 overtime. The channels that kill them: **raid (4/8)** — the scholar's own fights at haven — plus thirst (2/8), expedition (1/8), wild (1/8).
- The transient-veteran mechanism still exists (1/8) but is harmless under the peak ratchet.

**The channel that kills veterans is the scholar's own combat — specifically raid-defense at haven (4/8), plus the survival logistics (dehydration 2/8).** Villager veterans don't die; scholars do. The meatgrinder moved: it's no longer "veterans die as fast as they're made" (old bar) — it's "the scholar-veteran dies after opening the door."

### Wall numbers (winseat, new bar)

| national | table | wave-4 | wave-5 | wins | median survival |
|---|---|---|---|---|---|
| 9/16 | 7/16 | 7/16 | 0/16 | 9/16 | 90d (win-truncated) |

Wave-4 unlocks are seed-determined and frequent (7/16) on the new bar — vs 3/16 on winseat with the old bar (defercensus2b). The recalibration opened the door as designed.

### Village assessment (plain words)

The modal winseat village: opens the Standing door around day 50–80, grinds wave-3 with the scholar doing most of the killing, bloods its first veteran around day 65, unlocks wave 4, and then the scholar-veteran dies — in a raid at haven, on expedition, or of thirst in the wild. The village wins (9/16) or grinds on. Villager veterans are rare and, when they exist, they survive — the vetrel companion channel manufactures them but the scholar remains the primary killer.

Who thrived: the scholars who killed wave-3 monsters and lived to see wave 4; the 9/16 villages that won. Who died and why: the scholar-veterans — 4 in raid combat at haven, 2 of dehydration while foraging, 1 on expedition, 1 in the wild. What was missing: nothing structural — the bar is clearable (7/16 unlocks). The blank this diagnostic fills is the channel map itself (the unverified 0831Z claim).

## Metric review (§14 — binding, never re-scored)

1. **100% attribution:** 16/16 runs, 8/8 veteran deaths channeled, 0 unattributed rows, 0 instrument errors. GO.
2. **Release-window distribution:** computed on all 16 runs (median first-sat 65d, median window 16.5d, durable 7 / transient 1 / censored 0 / never 8). GO.
3. **Det-gate:** 2/2 byte-identical trajectories (instrument-on vs instrument-off, 2 seeds × 60d), both-repeat stable. One instrument bug found and fixed during the gate: the trajectory hash was recorded inside the census block, voiding the bare-vs-census comparison (fixed: hashes always recorded; re-verified 3/3 configs identical). Proof: scripts/test-vetwindow-20261018.js.
4. **Fidelity:** 2/2 sweep seeds re-run byte-identical (full per-seed JSON including veteran-death classification). Proof in the same script.
5. **Seeds:** 8 fresh (53101–53108), verified unused as sim seeds in evidence/ (all hits were pantry-kcal false positives).
6. **'dehydration' → 'other':** honest per the proven classifier; noted for a future instrument revision (should map to haven). Not re-scored.
7. **Phantom person-death teles (14):** person-kind teles for fighters alive at run end. Probed: they are non-roster combatants (foreign allies / away villagers) who fell in the scholar's TB fight — the tele fires (kind 'person', cause 'combat') but no death lands in any verifiable record. Two were ever-veterans (gen_do6b1kj, sanne_bakker); both survived, so neither is a missed veteran death. Documented as a findings-backlog item (the alienPlayers.js #530 pattern generalizes to TB ally falls).

## Convergence

**converging.** The diagnostic GO is met on current master with a clean instrument: 100% veteran-death attribution, determinism proven (DET + fidelity), and the binding picture resolved on the new bar — the veteran leg binds 7/16 runs but the bind moved from survival (old bar) to production (new bar); the killing channels are raid (4/8) and thirst (2/8), all scholar deaths, 0 in-window. The axis stays scale-onramp. No game change: zero src/js changes, zero scripts/policies changes — instruments + evidence only.

## Sense-testing (SENSE-TESTING LAW)

Three veteran-death transcripts read (evidence/2026-10-18/vetwindow-transcripts/). The deaths are meaningful — desperate, consequential, coherent — never arbitrary.

**1. Sigrun's thirst (leadfeast s53104, d79 — 'dehydration', other channel).** A veteran — a wave-3 killer — died of thirst while foraging. The transcript shows four days of escalating warnings ("⚠ DEHYDRATED: find and treat water today", "Your stomach is a fist", "Dawn. You wake wrung out and unrepaired... no water, no food, no real recovery. The body keeps score."). She kept foraging, eating 200-kcal scraps, never stopping to drink. The death lands like a thesis statement: "🕯️ Sigrun Eiriksdottir is dead — dehydration. The village stops. Somebody screams. Somebody else starts digging." Then the consequences ripple: succession ("You're not Sigrun... You'll have to earn this face"), treaties shake ("the dead hold no treaties. Every link Haven has shakes"), the linked villages press tribute down, the burial ("That night, they bring Sigrun home... the filling of it is yours"). This is the food thesis made manifest — survival logistics never stop, no matter how powerful you are. Meaningful.

**2. Dakota's thirst (leadfeast s53107, d65 — 'dehydration', other channel).** Same shape: warnings, foraging, death, succession to Alejandra, treaty shake, grief. The village later lost (d95). The death is the beginning of the end, and it reads that way. Meaningful.

**3. Aki's fall (leadfeast s53105, d70 — 'combat', expedition channel), then Somchai's (same day).** Aki died in combat on expedition; the mantle passed to Somchai — who ALSO died in combat the same day, passing to Mekonnen. Two successions in one day. The transcript shows the village reeling: "Aki's gone... You're not Aki" then hours later "Somchai's gone... You're not Somchai." The fire speaks for each. Desperate, traumatic, coherent — exactly what Steve's "violence desperate and traumatic" rule demands.

No robotic lines, no filler loops. The death pipeline (tele → succession → treaty shake → burial → the fire speaks) is the most human system in the game.

## Out-of-arm findings (appended, NOT chased — per arm discipline)

- **[open] 2026-10-18 — telemetry — NON-ROSTER 'combat' PERSON-DEATH TELES (sim-vetwindow):** 14 person-kind death teles across 5 runs for fighters never in Haven's roster and never marked dead (foreign allies / away villagers falling in the scholar's TB fight; game.js:34713 fires registerDeath without tbVillagerFalls for non-haven allies). The tele is honest (they fell) but no death lands verifiably. Death-count instruments must cross-check roster liveness (as this arm does) or overcount. Generalizes finding #530 (alienPlayers.js) to TB ally falls.
- **[open] 2026-10-18 — telemetry — 'dehydration' CAUSE UNMAPPED (sim-vetwindow):** the death-channel classifier maps 'thirst' → haven but 'dehydration' → other. Same death, different string. A future instrument revision should normalize thirst-strings before classification.
- **[open] 2026-10-18 — axis — VETERAN DEATHS ARE SCHOLAR DEATHS (sim-vetwindow):** 8/8 veteran deaths on winseat are scholar successions; 0 villager veterans died. If a future arm wants villager-veteran mortality, it needs a substrate where villagers (not the scholar) hold wave-3+ kills — vetrel manufactures them but the scholar still lands most killing blows.

## Files

- scripts/vetwindow-sweep-20261018.js — sweep + SMOKE/DET/FIDELITY modes (this run)
- scripts/vetwindow-analyze-20261018.js — aggregator (this run)
- scripts/test-vetwindow-20261018.js — proof: classifier fixtures + SMOKE + DET + FIDELITY (this run)
- scripts/vetwindow-transcripts-20261018.js — SAY-line probe around veteran deaths (this run)
- evidence/2026-10-18/perseed-vetwindow/ — 16 per-seed JSONs
- evidence/2026-10-18/vetwindow-transcripts/ — veteran-death transcripts
- evidence/2026-10-18/sim-vetwindow.md — this file
- ZERO src/js changes, ZERO scripts/policies changes (instrument-only arm)
