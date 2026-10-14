# sim-siegedef3 — HAVEN SIEGE-DEFENSE DOCTRINE (w5death blank #96)

Arm: `sim-siegedef3` (oversight-flesh-out-loop, run 2026-10-14, axis scale-onramp).
Type: POLICY LEVER (scripts/policies/siegedef3.js, SIEGEDEF3=1, default OFF) — KILLED AT PILOT.
Scripts: `scripts/policies/siegedef3.js` (layer — DELETED per kill protocol),
`scripts/test-siegedef3-20261014.js` (proof, 22/22 GREEN),
`scripts/sweep-siegedef3-20261014.js` (pilot sweep),
`scripts/w5death-audit-rerun-20261014.js` (STEP-1 re-verification),
`scripts/w5death-drawdiag-20261014.js` (channel diagnostic).
Data: `evidence/2026-10-14/w5death-audit-rerun-20261014.json`,
`evidence/2026-10-14/siegedef3-pilot.json`.

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- PRIMARY METRIC: post-unlock scholar combat deaths per wave-5 unlocker.
  GO = armed ≤ control × 0.70.
- GUARDRAILS: median survival ≥ control−5d; national ≥ control−4;
  table ≥ control−1; wave-5 unlocks ≥ control−1; no new death mode.
  A miss on any is NO-GO — never re-scored against a friendlier metric.
- POLICY: control = leadfeast + FEASTSCALE_R13=1 (the plentycost road);
  armed = siegedef3 + FEASTSCALE_R13=1 + SIEGEDEF3=1.
- SEEDS: 11/22/33/44/55/66/77/88 (the plentycost road, 8-seed pilot).
- HORIZON: 180d death-aware (runDays stops on Game.over / village-dead tail).
  Why 180: WIN-PATH HORIZON 180 (Steve 2026-10-13) — post-unlock survival is a
  late metric; shorter caps truncate exactly the long survivors it needs.
- The lever: SALLY-ONLY-IN-STRENGTH. Once wave 5 is unlocked, the feast draw
  (the cookfire's scavenger at Haven's edge) is triaged at creation:
  face iff scholar HP ≥ 70% max AND (draw wave ≤ 4 OR village has slain the
  species before OR armor P ≥ 60); otherwise the watch drives it off via the
  engine's own Game.driveOffFeastDraw() — no fight, devotion unspent, buff
  stays live. Pre-wave-5 the draw is always faced (the deed engine as designed).

## Motivating numbers (STEP 1 — re-verified on current tip BEFORE building)

`scripts/w5death-audit-rerun-20261014.js` re-ran the w5death attribution
instrument on the current tip (9 seeds × leadfeast 180d): 6 unlockers,
33 post-unlock scholar deaths — at-Haven 84.8% (motivating 84%), w5-killers
48.5% (motivating 50%), combat 93.9% (motivating 93.8%), starvation 0.
STEP-1 GATE PASSED — the finding reproduces; building was authorized.

Channel diagnostic (`scripts/w5death-drawdiag-20261014.js`, seeds
11/22/44/55/77/303): 16 of the 33 post-unlock deaths (48.5%) had the feast
DRAW marker live at death — the scholar died facing the feast's scavenger
draw at Haven. The draw is cast wave-appropriate (castMonster: 55% newest
wave post-unlock); the substrate's feastFightRoad faces it unconditionally
to mark feastSurgeUsed. That was the lever surface.

## Results — KILLED AT PILOT (primary missed)

8-seed identical-seed pilot (leadfeast control vs siegedef3 armed, 180d):

| metric | control | armed | GO / guardrail | verdict |
|---|---|---|---|---|
| post-unlock combat deaths / unlocker | 5.00 (25/5) | 4.80 (24/5) | ≤ 3.50 | **NO-GO** |
| median survival | 101d | 114d | ≥ 96d | PASS |
| national | 5/8 | 5/8 | ≥ 1 | PASS |
| table | 3/8 | 3/8 | ≥ 2 | PASS |
| wave-5 unlocks | 5/8 | 5/8 | ≥ 4 | PASS |
| new death mode | — | none | none | PASS |

The mechanism fired exactly as designed — 58 draws triaged, 39 faced,
19 driven off (18 wave-5, 1 wave-4) — and wave-5-killer deaths fell 12 → 8.
But non-wave-5 combat deaths rose 13 → 16 (compensatory mortality: scholars
lived longer — median 101 → 114d — and died to other Haven combat instead).
Net: 5.00 → 4.80 per unlocker, a 4% move against a 30% GO bar. Per §14 the
miss is NO-GO; the arm is killed, the layer deleted.

Per-seed armed (unlockers only): s11 (d114, 180d, 0 draws triaged — no
post-unlock feasts fired); s22 (d88, 180d, 10 driven/11 faced — deaths moved
to creek meadow wild fights); s44 (d67, 114d lost, 2/7); s55 (d74, 180d,
6/12); s77 (d57, 79d lost, 1/5).

## Village assessment

s22 is the story of the arm: post-unlock, the watch drove off 10 scavengers
(including a Cancellation, a Finale, two Network Notes — the beats read
clean: "Victor takes up a brand and Jorge follows — they meet it at the edge
of the light with noise and fire. The Cancellation was never brave."). The
scholar lived to 180 (control: 167) but died three times at creek meadow to
wild wave-5s (spoiler ×2, editor) — the siege was answered at the door, and
the wild still took its toll. s11 is the counter-story: zero post-unlock
draws triaged (the feast cadence never fired there), six Haven deaths anyway
— the draw is not the whole siege.

The sense check passes: the drive-off beats name real villagers, the triage
reasons are legible (first drive: finale_crew w5, unknown-w5, hp 100%,
armor P=10, never slain — "strong enough to stand, not to sally"), and the
faced draws are the known quantities. The doctrine behaves sensibly; it is
simply insufficient — the draw is roughly a third of the post-unlock Haven
deaths on this seed set, not half.

## Blanks filled / documented

- FILLED (measured): the feast-draw channel's true size on the plentycost
  road — 19 driven draws bought −4 wave-5-killer deaths and +13 median days,
  but the primary needs the other Haven channels too. The draw is a real
  lever with a real but insufficient effect.
- DOCUMENTED (open): the REMAINDER — non-draw Haven combat deaths (raid
  nights, lingering raiders, wild wander-ins at the Haven tile). s22 HAS a
  palisade ("The palisade's stakes take their toll") yet still lost scholars
  at Haven to congregation(w4)×2 and gavel(w3) — the palisade answers the
  raid-night bedroll path, not the lingerer/wander-in paths. Next arm:
  raid-channel defense (lingerers, raid-night scholar positioning).
- DOCUMENTED (tooling): HARNESS FIDELITY — the sim harness converts pending
  encounters straight to `Game.startCombat(mid)` (sim-harness.js
  driveContests tail) and NEVER calls `Game.faceFeastDraw()`. The engine's
  face-vs-drive-off player choice is invisible to sims unless the policy
  intercepts at draw CREATION (drawFeastScavenger), which this arm did.
  Any future feast-draw lever must know: wrapping faceFeastDraw is a no-op
  in sims. (The proof's first GREEN phase caught this — 21/22 with the
  face-wrap, 22/22 after moving to the creation wrap.)

## Metric review (§14)

Primary missed cleanly (4.80 vs ≤3.50) — no re-score, no metric doubt. The
GO bar (30% reduction) was set against the diagnostic's 48.5% draw share
measured on seeds 11/22/44/55/77/303; on the pilot's seed set the draw
channel proved smaller (~1/3). If the raid-channel arm lands first, the
draw triage could be re-measured as a second layer — the instruments
(proof 22/22, sweep, diagnostics) are kept for that. Guardrails all passed;
median survival improved (101 → 114d), so the layer was harmless — killed
on effect size, not on harm.

## Wall numbers (this pilot, 8 seeds)

Control: national 5/8, table 3/8, won 0/8, wave-4 7/8, wave-5 5/8, median 101d.
Armed: national 5/8, table 3/8, won 0/8, wave-4 7/8, wave-5 5/8, median 114d.
(The wall did not move; the siege still grinds successions post-unlock.)
