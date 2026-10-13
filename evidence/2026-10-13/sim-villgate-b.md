# flesh-out-b r18 arm 1 — villager departure heal gate (combat-balance axis)

Worker: sim-villgate-b | run 2026-10-13T21:32:00Z | axis combat-balance
Date: 2026-10-13. Canon read: docs/CANON.md, docs/PARTY.md (healer roles,
villager treatment). No canon doc covers objective-departure gating — the
expedition `villagerHealCheck` (Steve 2026-10-09) is the standing precedent
this lever extends; nothing invented from scratch.

## Question
r16 arm C census: 22 of 27 wave-1 NPC monster deaths were non-expedition
purposes (visit 7, water 4, guard 3, traps 2, leave 2, explore 2), median
entry HP 22. Expeditions/patrols get the 70-HP heal check; objective
departures walked out at any HP. Sim-findings item 32 names this exact
blank ("Game-code blank for a future lever run"). Item 34 caveat: pharmacy
supply is ~0 in sims, so the gate's full-heal path can't fire — measured
the healer/sit-out fallbacks instead.

## Lever
`src/js/villager-objectives.js`: new `objHealGate()` — every objective
departure (water/visit/traps/guard/leave/explore/forage/haul) now runs the
expedition heal check (pharmacy → healer +25 → sit-out) BEFORE the move.
One verdict per villager per day (`hurtGate`): a patched villager isn't
re-healed on a second departure, a sat-out one isn't re-narrated and rests
at haven the rest of the day (early exit in `objMaybeDepart`). LEAVE is
exempt from the sit-out — the desperate still walk out, patched first when
help is at hand, never blocked (same reasoning as "the desperate don't do
danger checks"). Companion departures are gated too (rid gated first so a
sat-out rid never strands a departed companion; companion sat out →
rid tightens/defers like the no-companion case).
`src/js/game.js`: `villagerHealCheck(vid, first, opts)` gains optional
`opts.noSitOut` (LEAVE); new narration line for the desperate walk-out.
Ontology header updated; `validate-ontology.js` green (94 systems).

## Pre-registered measurement (docs/MEASUREMENT.md §§9–12)
- Pilot: 8 seeds (11/22/33/44 × belongseek/leadcourt), 150d death-aware,
  identical-seed before/after on current master. Instrument: the r16 arm C
  census (`scripts/villdeath-census-20261013.js` +
  `scripts/test-villdeath-sweep-20261013.js`), unchanged.
- PRIMARY GO: NPC villager monster-death share −10pp vs baseline.
  Guard: no survival regression (median survival within ±10d in the bad
  direction — improvement is not a regression).
- Horizon rationale: baseline median survival ~83d; 150d gives headroom
  without simulating dead villages (death-aware stop).

Raw: `/tmp/villgate-base.json` (before), `/tmp/villgate-after.json` (after).
Instruments: `scripts/test-villgate-20261013.js` (proof test, 19/19, RED
observed pre-change), `scripts/analyze-villgate-20261013.js`,
`scripts/capture-villgate-20261013.js`.

## Results

| metric | before | after | delta |
|---|---|---|---|
| NPC monster-death share | 0.795 (31/39) | 0.667 (26/39) | **−12.8pp** |
| median survival | 83.5d | 123d | +39.5d (no regression) |
| national reach | 4/8 | 7/8 | +3 |
| table / wins | 0/8 / 0/8 | 0/8 / 0/8 | — |
| vDie/contact | 6.3% (33/524) | 3.9% (25/646) | −2.4pp |
| vDie entry-HP median | 22 | 35 | +13 |
| vDie fights entered <50 HP | 29/33 | 14/25 | −32pp of vDie |
| NPC deaths/run (median) | 4.5 | 4.0 | — |
| maxWave reach | 2,2,2,2 / 4,4,4,4 | 3,3,3,3 / 4,4,4,4 | wave-3 1/8→4/8 |

Gate firings (8 after-runs, instrumented): 1507 checks → 1472 cleared,
243 healer patch-ups (+25), 35 sit-outs, pharmacy path 0 (item 34
confirmed: supply ~0, gate runs on the healer/sit-out fallbacks as
pre-registered). LEAVE-at-low-HP never occurred in the 8 runs; the
noSitOut path is unit-proven (T6) but unexercised in the pilot.

NPC monster-death purposes before → after: visit 8→3, water 4→4,
expedition 5→4, guard 3→0, explore 3→2, leave 2→1, traps 1→1,
forage 2→1, **none 3→10**. The `none` rise is late-run wave-4/5 deaths
in the longer-lived villages (leadcourt s44: 4 monster-w4 NPC deaths),
not gate evasion — total NPC deaths held at 39/39 while villages lived
~40 days longer, so the death RATE per villager-day fell substantially.

## Verdict: GO
−12.8pp ≥ 10pp GO bar; survival guard met (large improvement, not a
regression). Reachability improved (national 4/8→7/8, wave-3 1/8→4/8);
nothing gated that players need (table/wins 0/8 both sides — the wall,
not the gate).

## Sense-test (SENSE-TESTING LAW — read, don't count)
Gate narration sampled live from the after-runs:
- Sit-out: "🩹 Nina is still hurting (65 HP) — no healer at haven. They
  rest today instead of ranging out." (d106, d107, d126, d127 — one line
  per day, not per part; the rest-day idempotence works in live sims.
  Reads as a person deciding to rest.)
- Patch-up: "🩹 Sujon is hurting (68 HP) — Fatima patches them up before
  they head out. (68 → 93 HP)" — a named person, a named healer, a
  before/after. Reads like care, not a UI flag.
- Healer rounds interleave honestly: "🩹 Fatima makes rounds — Deirdre
  gets bound up properly. (12 → 27 HP)" three days running — the village
  nursing its worst-hurt member back, legible in the transcript.
Judgment: the gate's beats read as people making decisions (rest / be
patched / walk out desperate), not as a system vetoing them. The one
rough edge: the shared sit-out line says "ranging out" even for a water
errand — expedition language leaking into errand fiction. Observed, not
fixed (the line is shared with expeditions/patrols; a per-purpose variant
is polish, not a blank).

## Village assessment (assess and fill in the blanks)
The villages looked like this: longer-lived, more of them reaching
national (7/8), villagers dying of attrition (disease, wound, thirst,
starvation, wild-exposure) instead of walking wounded into hushwolves.
The lever filled the item-32 blank: objective departures now get the
same pre-departure care expeditions always had. What stayed empty: the
pharmacy is still a dead letter (item 34 stands — 0 fires), and the
`none`-purpose late deaths are the wave-4 wall, not this axis.

## Landing
Committed in worktree (safe-commit.sh): `src/js/game.js`,
`src/js/villager-objectives.js`, `docs/ONTOLOGY.md` (validator regen),
`scripts/test-villgate-20261013.js`,
`scripts/analyze-villgate-20261013.js`,
`scripts/capture-villgate-20261013.js`. Reported 'committed, pending
coordinator merge'. No push, no bump, no live verify (ship loop owns).

## Findings (appended to sim-findings.md by coordinator per protocol)
- None new this run beyond the `none`-purpose note above (filed here,
  not appended — coordinator owns the backlog file).
