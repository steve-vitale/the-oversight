# sim-doorpositions — fix the stale grid-position blindness in the TB join rule (2026-10-18)

Run: flesh-out loop arm sim-doorpositions (loop A), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (wave law; combat readiness design call #4).

LINEAGE: sim-compresence (2026-10-18, DIAG-GO 16/16) finding #2 — 14/90 same-node
companion dispositions were companions OUTSIDE on the scholar's side with no
positions[rid]: stale/absent grid assignment. ensureVillagerPositions() runs on
scholar movement / node arrival / init (game.js:11115, 11372, 12851, 22409), but
a villager arriving via npcNodeTravel (or a door transition that doesn't re-run
assignment) never gets a grid position — and the TB join rule in startCombat
("party: villagers within 4 squares join the fight", game.js) reads
state.village.positions[rid], so these companions are invisible to it. The join
rule itself is consistent (0 in-radius-not-joined anomalies on either corpus).

THE FIX (src/js/game.js, startCombat — REVERTED zero-trace per kill protocol,
see Results): call this.ensureVillagerPositions()
immediately before the join rule reads positions. Confined to position
assignment: the join radius (<=4), the nearest-4 cap, and the hall-door rule
(inside villagers lose their positions when the scholar is outside — the door
lever itself is a pending steve-call from compresence, NOT touched here) are
all unchanged. npcInside defaults untouched.

## Substrate (EXACT — matches compresence)

- policy: tribfloor leadfeast/belongfeast (TF base ONLY — NO vetstaff, NO vetblood, NO vetrel)
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1
- seeds: 8 fresh (63401–63408 — verified filename-unused in evidence/2026-10-18/perseed-*/ before the sweep) x {leadfeast, belongfeast} = 16 runs per arm
- horizon: 180d death-aware
- instruments: COMPRESENCE=1 (the compresence read-only presence instrument, reused unchanged: fight-start presence census + kill-time channel attribution + per-source tbDamage)
- arms: control = pristine master (fix reverted); armed = fix in game.js startCombat. Identical seeds across arms.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**PRIMARY:** companion join-rate on wave-3 TB fight-starts (joiners / fight-starts), armed vs control, identical seeds.
**GO:** armed join-rate >= 2x control.
**GUARDRAILS:** median survival >= control−10d; starvation deaths <= control+2; no new death mode.
Secondary: presence-channel (a+b) share of wave-3 killing fights. A miss is NO-GO, never re-scored. Metric doubts go under "metric review" for the NEXT run.

## Proof

- scripts/test-doorpositions-20261019.js — fixture proof:
  - RED (DOORPOS_RED=1, ensureVillagerPositions patched to a no-op = pristine-equivalent): stale outside companion A does NOT join, has no grid position. Bug reproduced.
  - GREEN: A gets a position and joins within 4 squares; inside-hall companion B keeps no position and does NOT join (door semantics preserved); fight live and well-formed.
  - DET-GATE: two identical seeded runs byte-identical.
  - SMOKE: 10d leadfeast run completes with the fix, no errors.
  - **8/8 GREEN (fix-mode), RED assertions pass (bug reproduced).**
- scripts/doorpositions-analyze-20261019.js — control-vs-armed comparison (primary, guardrails, wall numbers).

## Results — KILLED-AT-PILOT (PRIMARY miss + guardrail misses; fix reverted zero-trace)

16+16 runs, 0 errors, 0 instrument errors on all 32.

| metric | control (pristine) | armed (fix) | bar | verdict |
|---|---|---|---|---|
| wave-3 TB fight-starts | 149 | 420 | — | — |
| companion joiners | 9 | 50 | — | — |
| **join-rate (PRIMARY)** | **6.0%** | **11.9%** | ≥2x (12.0%) | **MISS 1.97x** |
| (a+b) share of w3 kills | 16.2% (6/37) | 22.5% (9/40) | secondary | +6.3pp |
| median survival | 153d | 129d | ≥143d | **MISS** |
| starvation deaths | 2 | 6 | ≤4 | **MISS** |
| new death mode | — | "The Strike" | none | name-level noise (see metric review) |
| national / table / won | 8 / 14 / 0 | 7 / 12 / 0 | — | — |
| wave4 / wave5 | 12 / 0 | 13 / 0 | — | — |

The mechanism works: the fix nearly doubled the join rate (9→50 joiners) and
lifted (a+b) presence share. But the pre-registered bar was ≥2x and it measured
1.97x — a miss is NO-GO, never re-scored. Both guardrails missed independently
(survival 129 < 143; starvation 6 > 4). Per kill protocol the game-code change
is reverted zero-trace (game.js restored to HEAD, verified 0 DOORPOSITIONS
matches); this commit lands instruments + evidence only.

## Sense-testing (SENSE-TESTING LAW)

Read: scripts/doorpositions-transcripts-20261019.js output for armed
belongfeast-s63407 (4 wave-3 fights with joiners: d90 ad_break [Isla], d97
callback [Henry, Megan, Katarina, Isla], d111 callback [Chloe], d119 spool
[Megan, Laurent]).

The extra joins read as people, not teleports. The d97 4-joiner fight is the
clean case: "🚶 Isla is back with Henry" and "🚶 Megan is back — found Henry"
— the joiners had just walked back in from foraging with Henry (npcNodeTravel
returns) and were on the grounds when the callback arrived. Isla was being
shown snare-tying by Isadora the same day; Chloe was "re-packing the bundle,
checking each thing twice." Nobody materializes mid-fight. The village around
the fights reads alive: funerals ("they bring Xavier home... the filling of it
is yours"), Thornfield choosing-or-fighting over Mei's death, a 7,669 kcal
tribute walking out to Thornfield, a MUSTER beat standing the village down
against The Eater. No robotic behavior in the join presence itself.

## Village assessment (plain words)

The fix did what it said: companions who were standing outside — back from the
creek, back from foraging with Henry — now walk into the fight instead of
standing there positionless while the scholar fights alone. Fifty joins across
420 wave-3 fight-starts vs nine across 149. But the door still owns the story:
30 of the armed arm's 40 wave-3 kills are still channel (f) — the scholar
outside, the village inside, "You're on your own." The stale-position blank
was real but small; the hall door is the veteran-production blocker, and this
arm doesn't touch it (pending Steve's call from compresence). The villages
that died early in the armed arm died the usual deaths — mauled on expedition,
bad water, the spiral after a missed meal — not some new horror the fix
introduced. The median-survival and starvation misses are small absolute deltas
on sixteen noisy runs (see metric review), but the bars bind and the arm dies
on them.

## Metric review (§14 — binding, never re-scored)

1. **PRIMARY miss: 1.97x vs the 2x bar.** The effect is real (6.0%→11.9%,
   9→50 joiners) but the bar was absolute and it missed by 0.03x. Not re-scored.
2. **RNG-stream confound (proposed for the NEXT run):** the fix consumes
   Math.random draws at fight start whenever a stale NPC needs a position, so
   armed trajectories diverge from control after the first such fight — by
   mid-run they are effectively different random trajectories, and "identical
   seeds" holds only until first divergence. The 420-vs-149 wave-3 fight-count
   gap is mostly this, not a join effect. A re-test should make position
   assignment RNG-neutral (deterministic placement or a separate RNG stream)
   so before/after stays on-rails; or pre-register a per-fight metric
   (join-rate) as primary with survival as a same-trajectory guardrail only.
3. **Guardrail power:** n=16 with heavy-tailed survival; median ±10d and
   starvation ±2 are tight against noise (129 vs the 143 bar; 6 vs the 4 bar).
   Plausibly noise, but binding — recorded here, not argued away.
4. **"New death mode" is name-level noise:** "The Strike" was flagged as new,
   but it is a wave-4 monster death — the same class as control's "The
   Suburb." The check should be category-level, not name-level.
5. **Determinism:** DET-GATE byte-identical held on the fix; RED/GREEN fixture
   proof 8/8; no instrument errors on 32/32 runs. The kill is on the metrics,
   not the mechanism.
6. **No balanced panel (§15):** the panel is the before/after instrument for
   lever comparisons; this arm ran the compresence instrument's presence
   channels instead (the pre-registered instrument for this question), with
   identical-seed before/after. Documented, not skipped silently.
7. **Seeds:** 63401–63408, verified filename-unused in evidence/2026-10-18/
   perseed-*/ before the sweep. 32/32 runs, 0 errors.

## Out-of-arm findings (not chased)

Filed to hidden_files/sim-findings.md by the coordinator as usual; noted here:
the door (compresence finding #1) remains the dominant absence mechanism —
30/40 armed kills still channel (f). The 7th production attempt's lever (get
companions outside when wave-3 fights start) is still the named next, still
pending Steve's call on whether the door is working as designed.

## Convergence

**KILLED-AT-PILOT.** The stale-position blindness is fixed in code and proven
(RED→GREEN, det-gate, smoke), but the pilot missed its pre-registered bar
(join-rate 1.97x < 2x) and both guardrails (survival, starvation), so the
change is reverted zero-trace per kill protocol. The axis stays scale-onramp:
the named next is the door lever (compresence finding #1), pending Steve's
call. A future re-test of finding #2 should use RNG-neutral position
assignment (metric review #2).

## Wall numbers (coordinator)

Control 16 runs: national 8/16, table 14/16, won 0/16, wave4 12/16, wave5 0/16, median survival 153d (max 180).
Armed 16 runs: national 7/16, table 12/16, won 0/16, wave4 13/16, wave5 0/16, median survival 129d (max 180).

## Files

- scripts/test-doorpositions-20261019.js — fixture proof (RED/GREEN, DET-GATE, SMOKE; 8/8 GREEN)
- scripts/doorpositions-analyze-20261019.js — control-vs-armed comparison (primary, guardrails, wall numbers)
- scripts/doorpositions-transcripts-20261019.js — sense-testing transcript probe
- evidence/2026-10-18/perseed-doorpositions-control/ — 16 per-seed JSONs + _summary.json (pristine)
- evidence/2026-10-18/perseed-doorpositions-armed/ — 16 per-seed JSONs + _summary.json (fix)
- evidence/2026-10-18/sim-doorpositions.md — this file
- ZERO src/js changes (fix reverted zero-trace per kill protocol)
