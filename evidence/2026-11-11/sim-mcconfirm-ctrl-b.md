# Survival-collapse confirm CONTROL leg — evidence (arm sim-mcconfirm-ctrl-b)

Run fleshout-b-2026-11-12T03:29Z, Loop B, axis scale-onramp / winnability
chain. ADOPTION: the original run died by cron timeout during a host
write flap (~04:21–04:42Z); this leg was adopted and finished by a
fresh worker on the same worktree. Pre-registration:
`evidence/2026-11-11/sim-mcconfirm-ctrl-b-prereg.md` (committed
7697570ac, BEFORE any judged sim). Base `5157782a4` — the vetphantom
base, roster-check fix in-tree (standing.js sha256
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
verified at every run entry by the driver leg guard). Instrument-only
arm — ZERO src/js changes; `git status` shows no src/js modification
before the evidence commit.

## Adoption state (verified at adoption)

- 3 finished per-seed JSONs (seeds 190419–190421) verified: parse clean,
  all required fields present, final harness state (`endReason`,
  `days`, `instrumentErrors: []`), standingSha `f8fda4295a99` on all
  three. Kept as-is.
- 5 PARTIAL `.tmp-*` files (seeds 190422–190426) deleted — none had
  completed. Seeds 190422–190434 (13) re-run fresh with the committed
  driver; no partial was resumed or repaired.
- `evidence/2026-11-11/.probe-write` (flap-probe artifact) deleted.
- No fix-swap performed: the fix is in-tree at this base, as the
  prereg requires.

## Lever played

None — this is an instrument-only control leg. It runs one fresh
16-seed band (190419–190434) on the vetphantom base to establish the
fresh-band healthy number, so the coordinator can judge whether the
merge-a COLLAPSE_INSIDE_MERGE verdict (1/8 on matched seeds
190391–190398) reproduces on fresh seeds. Competent policy verbatim,
150d death-aware horizon (+10d tail max), mode `fix` only, driver
`scripts/mcconfirm-ctrl-driver-20261111.js`, analyzer
`scripts/mcconfirm-ctrl-analyze-20261111.js`.

## Result — this leg only (no joint verdict claimed)

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8 (75%)** | **150d** |
| merge-cut leg (seeds 190391–190398) | merge `e4dbe581b` | **1/8 (12.5%)** | **126d** |
| **this control leg (seeds 190419–190434, FRESH)** | vetphantom base `5157782a4` | **5/16 (31%)** | **138d** |
| sibling merge leg (seeds 190419–190434, FRESH) | merge `e4dbe581b` | **?** | **?** |

Analyzer: `LEG_COMPLETE`, exit 0, 16/16 per-seed JSONs present and
parseable, 0 instrument errors. Summary:
`evidence/2026-11-11/mcconfirm-ctrl-b-summary.json`.

**Joint rule inputs (verbatim from the prereg, for the coordinator's
read — this leg claims no joint verdict):** merge survived 1/8 vs
control 5/16. The rule: CONFIRMED if merge ≤ control − 4 AND
control ≥ 8/16; REFUTED if merge ≥ control − 1; INCONCLUSIVE
otherwise. Factual note for the coordinator: the control number is
5/16, and the CONFIRMED branch names a control floor of 8/16. The
joint verdict is the coordinator's read of both legs together.

Per-seed survival (days): 190419 150 survived, 190420 150 lost,
190421 135 lost, 190422 60 lost, 190423 138 lost, 190424 150 survived,
190425 118 lost, 190426 80 lost, 190427 150 survived, 190428 150
survived, 190429 60 lost, 190430 116 lost, 190431 150 survived,
190432 141 lost, 190433 118 lost, 190434 67 lost. Days sorted:
60, 60, 67, 80, 116, 118, 118, 135, 138, 141, 150, 150, 150, 150,
150, 150 — upper median (index 8) 138d.

## The scale wall (every run)

- Wins: **0/16**. National: **0/16**. Table: **0/16**.
- Wave-5 unlocks: **5/16** (seeds 190419, 190421, 190424, 190428,
  190432). Wave-4 unlocks: **15/16** (only 190422 never got past
  wave 3).
- Median survival: **138d**. Scale rank at end: regional 14/16,
  village 2/16.
- Standing range 75–620. **Seven seeds end at exactly 199** —
  the t4-1 readiness hold: 190420, 190423, 190427, 190429, 190430,
  190431, 190433. Two of them (190427, 190431) survived the full
  150 days stuck at 199: alive, but never released. This is the
  99107 pattern again — the village lives, the door stays shut.
- Wave kills (final daily cumulative, all 16 seeds): wave 1: 586,
  wave 2: 385, wave 3: 137, wave 4: 41, wave 5: **5**. Only three
  seeds killed any wave-5 beast (190419: 2, 190428: 1, 190432: 2).
- Veterans (living, end of run): only seed 190419 held 2 living
  wave-4 veterans (the wave-5 demand). Four more seeds held 1.
  Eleven seeds ended with 0 living wave-4 veterans — the veteran
  bar is the binding link in this band, not food or gear.
- Readiness at end: wave-4 ready on 7/16 seeds, wave-5 ready on
  1/16 (190419 only). Blooded: 5/16. Military tribute ready: 1/16
  (190419 only).

## Death causes (1,365 deaths)

| Cause | Deaths | Share |
|---|---|---|
| villager combat | 550 | 40.3% |
| expedition | 380 | 27.8% |
| combat | 223 | 16.3% |
| the wild | 125 | 9.2% |
| monster | 32 | 2.3% |
| ambush | 9 | 0.7% |
| a stranger | 8 | 0.6% |
| the arena | 8 | 0.6% |
| a wound that wouldn't close | 5 | 0.4% |
| contest | 5 | 0.4% |
| Gavel | 4 | 0.3% |
| sickness | 3 | 0.2% |
| the night | 3 | 0.2% |
| dehydration | 2 | 0.1% |
| starvation | 1 | 0.1% |
| Highbeam Deer / Loud-Eyes / The Eater / alien / lockjaw / Cliffhanger / The Loud Beast | 1 each | ~0.1% each |

Combat/expedition/wild together: 1,278/1,365 (93.6%). Starvation
killed **one** villager in the whole band — food is not what kills
these villages; fights and the road are. This matches
survivalcontrol's combat-heavy profile and the prereg's expectation.

## Phantom check (the instrument's reason for existing)

- Instrument vs ladder agreed on all 176 snapshot samples
  (0 disagreements). Phantom days: **0**, as expected with the
  roster-check fix in-tree.
- 964 vetSays lines recorded; 1,195 kill calls; 4 pyrrhic calls;
  0 instrument errors on every seed.
- Proof `scripts/test-mcconfirm-ctrl-b.js`: **51/51 green, exit 0
  checked unpiped** — including section 3 (driver leg guard /
  refusal leg), which the flap had left unproven in the original
  run. The refusal leg now proves: wrong-sha driver run exits 2
  with MCCONFIRMCTRL STOP; pre-fix text refused; marker-bearing
  wrong-sha refused.

## Village assessment (plain words)

Five villages made it to day 150; eleven died, most between day 60
and day 141. Nobody reached national standing, nobody sat at the
table, nobody won. The villages that lived were not comfortable —
two of the five survivors spent the whole run parked at standing
199, strong enough to stay alive and too short on veterans to be
allowed through the wave-5 door. The villages that died mostly died
fighting: monsters on expeditions, ambushes, the wild itself. Only
one person in sixteen villages starved. The pantry was not the
problem; the killer shortage was. Only one village in sixteen ended
with two living wave-4 killers — the number the wave-5 door
demands — and that village (seed 190419, standing 620) is the only
one that was tribute-ready and wave-5 ready at the end. Wave 5
opened in five villages but only three of them actually killed a
wave-5 beast, five kills total across the band. In plain terms:
villages can now survive to the door, but they arrive without the
veterans to walk through it.

## Sense-testing (villagers act like people?)

Sampled the 964 vetSays transcript lines across seeds. Villagers
narrate choices with reasons, not bare actions: "Salman leaves the
foraging basket at the door. 'The pantry can't take more — sitting
with the elders instead.'" / "Petra drew European Elder in the dirt
for the others. It'll wash away. The knowledge won't." / the System
calling out a veteran kill on camera: "Quinn just put down The
Herald... on CAMERA. That's a veteran kill, folks. REMEMBER the
name." The pantry-full logic is voiced, knowledge-sharing is
voiced, kills are celebrated. One repeated template noted (the
foraging-basket line appears twice with different names — Maya and
Salman); same line, different people, which reads as a shared
village habit rather than a robot repeat. Nothing in the sample
reads robotic, static, or consequence-free. No finding appended to
the backlog from this sample.

## Metric review (§14 — no re-scoring; the primary metric held)

- Primary metric (survived count on fresh seeds) held and was
  judged as registered. This leg's number is 5/16.
- **The metric set needs one revision for the NEXT run:** the
  matched-seed fix leg survived 6/8 (75%) while the fresh-band
  control on the same base survived 5/16 (31%). The healthy
  number is strongly seed-band dependent — an 8-seed matched band
  flatters the base. The joint rule's CONFIRMED branch assumes a
  control floor of 8/16 that this fresh band does not reach; the
  coordinator's read should weigh the band effect, and future
  confirm legs should pre-register the band-size sensitivity
  (or run the control on the same matched seeds as well as fresh
  ones) rather than treating one 8-seed number as the healthy
  baseline.
- Secondary observation for the next run: the standing-199
  clustering (7/16) is a sharper signal than the survived count
  for the readiness question. A "days held at t4-1" / "tribute-ready
  days" metric would measure the door directly; survived count
  alone hides villages that live but never release.
- No metric was re-scored mid-run. No verdict was claimed by this
  leg.

## Flap-window closeout (infrastructure)

Original run's flap: onset ~03:59Z 2026-11-12, probes failing
04:05Z–04:42Z (git update-ref EPERM, node read-then-write EPERM,
worktree-heartbeat PermissionError). Coordinator probed the flap
CLEAR at 06:32Z. This adoption ran 06:32Z onward with **no flap
recurrence**: all 13 seed writes, the analyzer summary write, and
the full proof (including the section-3 scratch-repo writes that
the flap had killed) succeeded on first attempt. No retry loops
fired. Flap window closed.

## Guards / non-judgements

- This arm does NOT re-judge the merge-a verdict
  (COLLAPSE_INSIDE_MERGE stands on its 8 matched seeds), the
  anchor verdict, or the mournblooded verdict.
- No game-code change was made; no `[needs-eyes]` applies.
- Telemetry deviation check (Loop B body step 10): attempted;
  the tool refuses recorder-corpus input ("all 16 --current rows
  carry top-level anchorCommit, so they are sweep recorder rows,
  not runs") — same refusal class as vetphantom-b,
  tributedeliv-b, survivalcontrol-b, anchor-a, and merge-a.
  Recorded, not waived.
- Balanced panel (§15): N/A — instrument-only single leg, no
  code change; the before/after comparison is the vetphantom fix
  leg vs this control leg, judged by the coordinator under the
  joint rule. Same standing as survivalcontrol-b §7 and merge-a §7.

## Convergence state

Axis scale-onramp / winnability chain: this leg supplies the
fresh-band control number; the joint verdict awaits the sibling
merge leg and the coordinator's read. Leg status: LEG_COMPLETE.
