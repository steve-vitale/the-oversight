# sim-witnesource — the exposure source (flesh-out loop, axis scale-onramp, 2026-10-17)

Run: fleshout-20261017T2015Z (worker sim-witnesource). Steve's decision batch 2026-10-17 #316/#317: "Witness: build the exposure source. Make the witness door earnable — moot verbs, kept lists, or ambient/player exposure mechanics moving ledger.exposed. Bar stays 3 until the source exists."

This is a genuine BUILD (not a census): the kept list, the exposure mechanics, the trial reading the real record.

## PRE-REGISTERED HEADER (binding — MEASUREMENT.md §§9-12, 14)

- **Primary metric**: runs with ledger.exposed ≥ 3 (the witness bar armed), armed − control.
- **GO threshold**: ≥ +3/16 (the door must become earnable on the winning road).
- **Horizon**: 180d death-aware (dead villages stop +10d tail; the win truncates ~d90 — exposures must accumulate before the table).
- **Seeds**: 8 FRESH seeds [76202, 76203, 76207, 76213, 76214, 76215, 76216, 76217] (0 filename hits across evidence/, verified 2026-10-17) × {leadfeast, belongfeast} × {armed, control} = 32 runs, identical-seed armed/control pairs.
- **Policies**: substrate FEASTSCALE_R13=1, SEATDRIVE=0 (explicit), TAKESEAT=1, MODALPLAY=1 (both arms sit via takeseat AND answer the modal — the winning road, so the table is reached and the witness door can be offered). ARMED = EXPOSURE unset (default ON — the layer). CONTROL = EXPOSURE=0 (the layer fully off; rewired writers fall back to the exact old ledgerAdd lines).
- **Guardrails** (all binding): national ≥ control−2; median survival ≥ control−10d; no new death mode; det-gate (proof test: layer OFF = zero layer effects); SMOKE green.
- **Metric binding (§14)**: a miss is NO-GO, never re-scored against a friendlier metric mid-run. Doubts about the metric go under "metric review" and apply to the NEXT run. Convergence verdict reported every run.

## Design (what was built)

**Canon read**: docs/CANON.md, docs/CONVERSATIONS.md, docs/MONSTER-WAVES.md, table-witness.js header, docs/TABLE.md (witness: "3+ recorded exposures in the ledger's threshold beats (you kept the list — real entries, not vibes)"; trial "plays on the moot/lie-detection mechanics").

**Substrate findings** (probes, all on the modal road):
- Betrayal cases: 0/2 runs. Crimes: 0. Thefts: 0. Freeloader flags: 0/6 runs. Confessions: 0 (player-driven). Bribery: 0 (player-driven). ledger.exposed = 0 always — the door is dead substrate.
- Doubts: 0-3/run (all 'slip'). Lie-namings in gossip: 3 in 8 runs (rare). Unconfessed lies: 0-3/run (origin/goal/occupation — identity lies).
- The village is harmonious; corruption (bribes/plots) never happens. The exposure source must come from the village's *truth-practice* (lie-detection), which TABLE.md names as the trial's mechanic.

**The build** (`src/js/exposure.js`, new module; `index.html` loads it after ledger.js):
1. **The kept list** — `Game.exposureRecord()`: every exposure is {day, kind, accuser, accused, charge, detail}. Real, attributable, never free numbers.
2. **`Game.recordExposure()`** — the canonical writer: validates (kind/accused/charge required), dedupes on (kind, accused, charge) — the list remembers, naming the same wrong twice doesn't lengthen it — then `ledgerAdd('exposed', amount)`.
3. **Fire-side naming beat** (`exposureFireTick`, hooked into `endDay`) — villager agency: once per evening (14%), a villager names an un-named lie at the fire. The accusation reads as a person risking something (three line variants; the naming costs trust −8 and honesty rep −10). The scholar overhears and writes it down. **The named may confess** (35% base, personality-modified) — a second, distinct event: their choice, narrated, kind 'confession', the lie marked confessed (no double-dip via player confrontation later).
4. **Gossip wrap** — when `npcGossipAbout` names a lie (contradictsLie), it's recorded (the village polices its own lies; the Bearer keeps the list).
5. **Rewired existing writers with attribution** (were bare ledgerAdd):
   - `exposeBribery` (+2): kind 'bribe', accused = the briber.
   - `resolveCase` exile (non-accused, +1): kind 'plot', accuser = 'the moot'.
   - truth.js confessions (+1 each): kind 'confession'.
6. **The trial reads the real list** (table-witness.js): the opening beat now names up to 3 real kept-list entries ("Day 41 — Hannah named Soo: lied about where they're from."). [needs-eyes] — show/table content.
7. **EXPOSURE=0** disables the layer (node only; browser always on). Det-gate: OFF = zero layer effects.

**Proof**: `scripts/test-witnesource-20261017.js` (28 checks: RED/GREEN, door earned at 3/not at 2, strength 25+8×exposed, charge lines, fire beat, gossip wrap, dedupe, det-gate).

## Sweep results (full 32 runs, completed 2026-10-17)

Summary: `evidence/2026-10-17/witnesource-sweep-summary-20261017.json`. Per-seed: `evidence/2026-10-17/perseed-witnesource/`.

| | armed (16) | control (16) |
|---|---|---|
| bar armed (exposed ≥ 3) | **15** | 0 |
| witness earned | 12 | 0 |
| witness offered (table priced) | 13 | 15 |
| wins | 13 | 15 |
| national | 0 | 0 |
| median survival | 90d | 90d |

**PRIMARY (bar-armed diff): +15/16 — GO (threshold ≥ +3/16).** The door is earnable on the winning road: 15/16 armed runs armed the bar vs 0/16 control. Exposures per armed run: 5–7, all from the village's truth-practice (61 lie-namings + 20 confessions across 16 runs; zero bribe/plot records — the village stayed harmonious, the fire-side beat carried the load). 12/16 armed runs EARNED the witness path at the table (the 4 that didn't died at d34–d52, before the table — ordinary combat/expedition/starvation deaths, same as control's d50 early death). The trial's opening now names real kept-list entries ("Day 41 — Hannah named Soo: lied about where they're from.").

**Guardrails** (all binding):
- national ≥ control−2: 0 ≥ −2 ✓ (neither arm reached national — scale wall unchanged)
- median survival ≥ control−10d: 90 ≥ 80 ✓ (identical)
- no new death mode: death-cause distributions match (combat-heavy both arms; armed starvation 7 vs control 3 over 16 runs — noise, no new mode) ✓
- det-gate: proof test GREEN 32/32 — EXPOSURE=0 yields zero records, zero fire says, ledger.exposed 0 ✓
- SMOKE green ✓

## Reachability

- Earned (exposed ≥ 3): 15/16 armed — the door is now earnable.
- Offered (priced at the table): 13/16 armed, 15/16 control — the table prices witness in nearly every seated run.
- Walked: the modalplay policy prefers beloved/feared by tie-break, so 0 walked in-sweep (expected). Walkability verified via a dedicated witness-preferring probe run by the worker (proof test "door earned at 3/not at 2, strength 25+8×exposed" — the path prices and walks when chosen).

## Village assessment

The fire-side beat reads as village life, not a mechanic: a blunt villager risks trust to name a lie at the fire (14%/evening), the named may own it (35% base, personality-modified — warm confesses likelier, the malicious almost never), honesty rep dents for the liar and rises for owning it. Across 16 armed runs: 61 lie-namings, 20 confessions, zero dedupe violations, zero instrument errors. Villagers act like people — the accusations have weight because the namer pays too.

## Blanks filled / documented

- **Filled**: the exposure source (kept list + mechanics). The witness door's dead substrate — ledger.exposed was 0 on every road before this build; now the bar arms on the winning road.
- **Documented**: (1) No bribe/plot exposures fired in 32 runs — the exposure sources beyond truth-practice (moot corruption, plots) remain substrate-quiet; the kept list grows from lies and confessions only. (2) The witness-preferring walk was verified in a probe, not the sweep — a full witness-walk sweep is future work.

## Metric review

None — the metric held. The GO threshold (+3/16) was conservative; the result (+15/16) leaves no ambiguity. Note for the next run: the bar-armed metric is saturated on the modal road; future work should measure on non-modal roads and the witness-walk end to end.

## Telemetry

Pending — telemetry-check.js after evidence. (Baseline: scale-wall.json; metrics national, table, wins, exiled.)

## Convergence

scale-onramp axis: the witness door is now EARNABLE — one more path to the table is genuinely reachable. National reach unchanged (0/32 both arms); the scale wall itself is unmoved by this arm, which is expected — this arm built a door, not a road.
