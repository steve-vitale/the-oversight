# sim-watchline — the watch materializes: 7th veteran-production attempt (2026-10-18)

Run: flesh-out loop arm sim-watchline (loop A), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (veteran vocabulary; design call #4 readiness gate; wave-3 bands).

LINEAGE: sim-compresence (2026-10-18, DIAG-GO 16/16): the hall door excludes companions from the wave-3 TB join rule — 82% of wave-3 kills channel (f) solo-by-rule; 75/90 same-node dispositions door-blocked; the scholar fights outside at the treeline while the village sits inside. steve-call #590 (whether the door itself should change) stays OPEN — this arm does NOT touch the join rule's door logic or ensureVillagerPositions (sim-doorpositions' lane). This arm executes compresence's named next #1: get companions outside when wave-3 fights start — via the watch.

## Substrate (EXACT)

- policy: scripts/policies/watchline.js wrapping tribfloor leadfeast/belongfeast (TF base ONLY — no other layers); WATCHLINE=1 armed, unset control
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 COMPRESENCE=1
- seeds: 8 fresh (63401–63408 — verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep) x {leadfeast, belongfeast} x {control, armed} = 32 runs
- horizon: 180d death-aware
- instruments: COMPRESENCE=1 (read-only; join-rate secondary). ZERO src/js changes.

## The lever

The watch materializes outside. Each day the village posts a 2-person watch on the haven grounds (outside the hall door) — the watch the d90 feast-draw beat promises ("let the watch drive it off") but that never materializes as fighters. Mechanism: `Game.npcSetInside(vid, false)` duty post, maintained across `npcNodeTravel`'s drift (day + night) and `objTick`'s indoor pull-in via ONE post-chain wrap on `Game.npcNodeTravel` (objTick runs inside its wrap chain — one post-chain covers both). Grid positions come from the engine's own `ensureVillagerPositions` (untouched). Roster: deterministic — living non-scholar roster at the haven node, not engaged, not sheltered, hp>=40, no current assignment, not in the scholar's party; sorted by vid, rotated by (scholarDay % n). WATCH_SIZE=2 (the drive-off beat's own number). Fiction fudge (documented in the layer header): a watch member keeps their indoor objective — the chore ticks in objTick before the post-chain re-posts them outside.

Design calls (mine; Steve can overrule):
1. Watch posts EVERY part (day + night), not night-only — wave-3 fights happen across parts; presence is the metric.
2. Roster rotates DAILY (day % n), not per part — clearer fiction ("tonight's watch"), fewer moving parts.
3. Watch drawn from villagers WITHOUT a current assignment — idle hands stand watch; production verbs untouched.
4. No startCombat wrap — the watch genuinely stands outside all part (scholar can see them on the grid); no teleport-at-fight-time.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**PRIMARY (GO/NO-GO):** living veterans at run end, armed − control over the 16+16 runs, ≥ **+3** → GO. Living veteran = living roster member with ≥1 wave-3+ kill in `state.waveKillLog` at run end (the readiness gate's VETERANS bar, exactly). A miss is NO-GO, never re-scored.

**SECONDARY (directional, reported not binding):** ever-veteran rate (armed > control); wave-4 unlocks (armed ≥ control−1); companion join-rate on wave-3 TB fight-starts via COMPRESENCE (armed > control).

**GUARDRAILS (binding NO-GO if violated):** median survival armed ≥ control−10d; starvation deaths armed ≤ control+2; national armed ≥ control−1; table armed ≥ control−2; no new death-cause mode.

Horizon 180d death-aware because the veteran question needs the full wave-3 window (day 25+) plus survival tail; 8 seeds × 2 policies per arm is the pilot gate (never below 8).

## Proof

- `scripts/test-watchline-20261019.js` — (a) roster determinism + posting survives 3× night drift and day drift; (b) DET-GATE: WATCHLINE unset, wrapped vs tribfloor base, byte-identical 60d trajectories both policies; (c) SMOKE: 30d live run, watch posted 30/30 days, zero errors; (d) JOIN-VISIBILITY: posted watch gets outside-side positions while the scholar is outside (the join rule's visibility precondition); empirical in-radius(≤4 of treeline corner) rate 0.23/draw reported. **10/10 GREEN.**
- `scripts/watchline-sweep-20261019.js` — standalone 32-run sweep driver (sweep-compare.js untouched per the sibling-edit constraint).
- `evidence/2026-10-18/perseed-watchline/` — 32 per-seed JSONs + _summary.json.

## Results — PRIMARY MISSED → KILLED-AT-PILOT

32-run census (seeds 63401–63408 × {leadfeast, belongfeast} × {control, armed}, 180d death-aware, COMPRESENCE instrument, zero instrument errors on 32/32):

| metric | control (16) | armed (16) | Δ | pre-registered bar | verdict |
|---|---|---|---|---|---|
| **living veterans (PRIMARY)** | 0 | 1 | **+1** | ≥ +3 | **MISS → NO-GO** |
| ever veterans | 1 | 1 | 0 | directional | flat |
| wave-4 unlocks | 12 | 13 | +1 | ≥ −1 | ✓ |
| wave-5 unlocks | 0 | 0 | 0 | — | — |
| national | 8 | 8 | 0 | ≥ −1 | ✓ |
| table | 14 | 13 | −1 | ≥ −2 | ✓ |
| won | 0 | 0 | 0 | — | — |
| median survival | 153d | 161d | +8d | ≥ −10d | ✓ |
| max survival | 180d | 180d | — | — | — |
| starvation deaths | 2 | 1 | −1 | ≤ +2 | ✓ |
| wave-3 TB fight-starts | 149 | 400 | — | — | see note |
| w3 fights w/ companion join | 9 (6.0%) | 57 (14.3%) | 2.4× | directional | mechanism works |
| new death mode | — | none | — | none | ✓ |

**The one Naran-shaped outcome:** armed-belongfeast-s63404 — Patrick (gen_0ws4wk6) landed the killing blow on a wave-4 Congregation on d140 via 'companion' inside the scholar's TB fight and survived to run end (180d, village survived). The control's one ever-veteran (Emma, control-leadfeast-s63407) died before run end — the Greta mechanism again.

**The w3Fights gap (149 vs 400) is trajectory noise, not a watch effect.** The armed outliers (s63402-belong 76, s63407-lead 76, s63405-lead 58, s63408-lead 46, s63404-lead 42) are runs where the trajectory diverged into wave-5 unlock + wild grinding: re-ran armed-belongfeast-s63402 — 68/76 fight-starts were wild Nielsens (wave 5) on d88–146, only 7/76 at haven. Identical seeds ≠ identical trajectories once the lever perturbs the RNG stream; fight-count comparisons need shape-attribution. Lesson recorded.

**Why the primary missed (mechanism read):** the watch works at the presence step — join-rate 6.0% → 14.3%, the largest companion-presence lift measured on this axis — but kills stay scholar-dominated: the scholar's godhood Phase blade (98–323/strike) ends fights before companions land killing blows, and companion survival in wave-3+ TB fights is luck (Greta/Emma died; Naran/Patrick lived). Presence is necessary but not sufficient — the binding constraint moved to KILL-SECURING (see named next).

Per the kill protocol: the layer is deleted zero-trace (policy file + sweep-compare registry entries reverted; the proof test INFO-SKIPs on absence). Instruments (proof, sweep driver, 32 per-seed JSONs) + this evidence land.

## Village assessment (plain words)

The modal armed village posts its watch every dawn — "Quinn and Aroha take the watch — brands by the door, eyes on the treeline" — and the grounds are no longer empty when the scholar walks out to face the Big-Eyes. In 57 wave-3 fight-starts companions stood beside the scholar, up from 9. But the village's story didn't change: scholars with godhood weapons still end nearly everything first, and the one companion who both fought and lived (Patrick, who argued at moots, cooked for the haven, and wanted "a say in how this village runs") is the exception that proves the production line is still stuck — now at kill-securing, not presence. Who thrived: scholars; Patrick. Who died: Emma (the control's veteran, dead before run end), and everyone the Phase blade beat to the kill. What was missing: not presence anymore — the killing blow.

## Sense-testing (SENSE-TESTING LAW)

Read: re-ran armed-belongfeast-s63404 (the Patrick run) with Game.say captured, d135–145 window + all 146 watch announcements.

- The watch reads as people being posted: "Henry and Pavel take the watch", "Lucia and A take the watch" — rotation visible, villagers named. BUT the naming has the short-name wart: `displayName` returns descriptors ("A person, maybe 20s") for stranger-villagers and the layer's first-name split renders them as "A" — "🌙 A and A take the watch — brands by the door, eyes on the treeline." Robotic. The driveOffFeastDraw `disp()` convention ("A person, maybe 20s", never "A") exists for exactly this; any future watch work must use it. Filed below.
- Patrick's d140 kill had no dedicated beat in the say stream (the kill is recorded in waveKillLog/tele, not narrated as a companion triumph) — a companion landing a wave-4 killing blow passes without the fiction noticing. If veterans are the product, the kill deserves a beat. Filed below.
- The d90 "let the watch drive it off" beat: unchanged by this arm (the drive-off path is game code, untouched). The watch now exists as real posted villagers when that choice is offered — the fiction finally has referents — but the beat still narrates generic brands, not the actual watch roster. Filed below.
- No robotic behavior in the posting itself; villagers kept their lives (Patrick cooked, fished, argued, wanted a moot say) while standing watch.

## Metric review (§14 — binding, never re-scored)

1. **PRIMARY missed: Δ=+1 < +3 → NO-GO.** Not re-scored. The bar was honest (a presence lever must produce Naran-shaped outcomes, not just join counts) and the lever didn't clear it. Kill protocol executed.
2. **Join-rate secondary: 6.0% → 14.3%.** Directional lift, mechanism confirmed working — but it didn't convert at the bar. Not promoted to primary post-hoc.
3. **No balanced panel (§15).** The panel is the before/after instrument; this arm is killed at pilot — there is no after to compare. The 32-run identical-seed sweep is the before/after instrument; the pre-registered threshold is the judge. Documented here, not skipped silently.
4. **Seeds.** 63401–63408, verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep. 32/32 runs, 0 errors, 0 instrument errors.
5. **Determinism.** The proof's DET gate pinned layer-off byte-identical (6/6); the transcript probe re-ran deterministically (Patrick's d140 kill reproduced).
6. **w3Fights comparability.** Identical seeds diverge into different trajectories once the lever perturbs RNG (68-wild-Nielsen grind). Proposed for the NEXT run: attribute fight counts by shape (haven vs wild) before comparing, or gate the comparison on matched wave-unlock trajectories.

## Out-of-arm findings (not chased)

Filed to hidden_files/sim-findings.md:
1. KILL-SECURING is the new binding constraint on the veteran line (presence fixed 6.0%→14.3%, kills still scholar-dominated) — the 8th production attempt's lever: companions landing killing blows (fight-longevity? scholar target-selection? a "let them have it" beat?). The Phase blade ends fights first.
2. Watch-announcement short-name wart: "A and A take the watch" — displayName descriptors split to "A"; use the driveOffFeastDraw disp() convention.
3. Companion wave-3+ killing blows deserve a fiction beat (Patrick's d140 Congregation kill passed unnarrated) — if veterans are the product, the village should notice.
4. The d90 "let the watch drive it off" beat could name the actual watch roster now that the watch exists as state (game-code, steve-call).

## Convergence

**KILLED-AT-PILOT.** The 7th veteran-production attempt is complete: the watch materialized (join-rate 6.0%→14.3%, mechanism proven, zero src/js), but the pre-registered PRIMARY (living-veteran Δ≥+3) missed at Δ=+1. The axis stays scale-onramp: the named next is a kill-securing lever (8th attempt), pending the findings above.

## Wall numbers (coordinator)

32 runs: national 16/32, table 27/32, won 0/32, wave4 25/32, wave5 0/32, median survival 157d (max 180; 19 village-lost, 13 survived).


## Files

- scripts/policies/watchline.js — DELETED (killed at pilot, zero-trace per kill protocol)
- scripts/test-watchline-20261019.js — proof (10/10 GREEN with layer present; INFO-SKIPs cleanly on absence)
- scripts/watchline-sweep-20261019.js — standalone 32-run sweep driver
- evidence/2026-10-18/perseed-watchline/ — 32 per-seed JSONs + _summary.json
- evidence/2026-10-18/sim-watchline.md — this file
- ZERO src/js changes
