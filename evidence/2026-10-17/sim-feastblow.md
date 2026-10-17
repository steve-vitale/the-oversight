# sim-feastblow — deliberate feasted-combat layer (flesh-out loop, 2026-10-17)

Axis: scale-onramp. Run: fleshout-20261017-032209 (arm). Master 56340dda.
Sharpens finding #441 (evidence/2026-10-17/sim-tablegate.md): THE FEASTED
BLOW IS THE NAMED BLOCKING GATE — foodDeeds' combat half (feastSurgeUsed)
never fired on base courtship. This arm does NOT decide Steve's design
call — it MEASURES what a policy that fields the scholar feasted can
reach, giving Steve data for the call.

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14)
Written BEFORE the pilot sweep. Substrate asserted up front by
scripts/sweep-feastblow-20261017.js (SWEEP STOP on mismatch):
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT (unset now means
  driver ON after c004b9dd — pinned OFF, same as the tablegate census).
  Policies: leadfeast / belongfeast (require('./feastscale') — the true
  feastscale substrate). ARMED adds the feastblow layer (FEASTBLOW=1);
  CONTROL is the bare feastscale policy. Identical seeds per road.
- SEEDS: 8 FRESH seeds 9501–9508 × {leadfeast, belongfeast} ×
  {armed, control} = 32 runs. Fresh = 0 filename hits across evidence/
  (verified 2026-10-17).
- HORIZON: 180d death-aware (matches the census/tablegate; dead villages
  stop simulating, +10d tail max).
- PRIMARY (GO) = armed foodDeeds bar-holding runs ≥ control + 3, where a
  run "holds the bar" iff foodDeeds = sentimentTaught && feastSurgeUsed
  is TRUE at end of run (both flags persistent once marked).
- SECONDARY (measured, not binding): feasted marks/run (noteFeastedCombatUse
  calls), draw-face rate (faceFeastDraw ok / draws cast), seat-earned
  (tableSeat() 'lesser' ever + first day), invitation staged
  (progState.tableWaiting ever), national ever, table ever, wins, median
  survival, scholar combat deaths.
- GUARDRAILS (kill conditions): scholar combat deaths armed > control+2;
  national armed < control−2; median survival armed < control−10d; any new
  death mode on armed. A miss is NO-GO per §14 — never re-scored mid-run.
- COMPLETION: 32/32 runs complete; det-gate byte-identical (layer on vs
  pure-delegation shape — gate OFF pins byte-identical); 0 instrument errors.
- CONVERGENCE verdict per run: converging | converged | parked | killed-at-pilot.

## Pre-arm reconnaissance (probes, NOT the pilot)
Two read-only probes ran on the feastscale substrate BEFORE this header
to scope the layer honestly (scripts/probe-feastchain-20261017.js,
scripts/probe-feastdraw-20261017.js — instruments, kept):
- leadfeast 90d × seeds 9001/9002: 7–9 armed feasts, 7–9 buff grants,
  12–30 feasted marks/run, feastSurgeUsed=TRUE at end on BOTH runs.
- The feast draw FIRES (3 draws/90d on s9101: voice_mimic_radio,
  nightcourt, paparazzo) but is NEVER faced (0/3): the buff marks via
  opportunistic patrol combat first (feastFightRoad's race — scaleFeast
  grants AFTER feastFightRoad checks in the same upkeep; by the next
  check the buff is usually already marked, and feastFightRoad returns
  early on b.used). The draw expires with the buff.
- CORRECTION to finding #441's premise: the tablegate's "base courtship
  never fields the scholar feasted" (feastSurgeUsed 0/5) was measured on
  BARE leadcourt/belongseek — FEASTSCALE_R13=1 was in the env but the
  feastscale wrapper was never applied, so the feast layer was silently
  OFF. On the TRUE feastscale substrate (leadfeast/belongfeast, layer on)
  the scholar DOES feast armed, the buff grants, and feasted strikes
  land. The pilot below re-measures the gate on the correct substrate.
- The layer's honest delta is therefore the DESIGNED deed path: face the
  feast's drawn scavenger immediately at grant time (the real
  faceFeastDraw verb, blow-by-blow) instead of losing it to the race.

## The layer (scripts/policies/feastblow.js)
FEASTBLOW=1 (default OFF — gate off = pure delegation, byte-identical).
Wraps leadfeast/belongfeast via require('./feastscale') (reposition.js
composition pattern). After the base's upkeep: if the FEASTED buff is
live and UNMARKED and the feast's draw is pending → face it immediately
via the real Game.faceFeastDraw(). No draw pending → pure delegation
(feastFightRoad's patrol already covers feasted combat). ENGINE-HONEST:
the real feast verb (base's), the real face verb, real TB combat; the
draw exists only if the engine drew it — never manufactures triggers.
SAFETY (reposition precedent): luxury move — scholar hpPct ≥ 0.7 (far
from the base's 0.35 eject); never face while a fight is live or the
game is over; never when the buff is already marked (nothing to gain);
the base's fight-or-flee/eject decisions are untouched. Zero src/js
changes — policy-side only.

## Metric review
Per §14 the pre-registered metrics bound the run; the miss stands, never
re-scored. PRIMARY said "armed foodDeeds bar-holding runs ≥ control + 3".
What happened: armed 15/16 vs control 15/16 — the control SATURATES the
metric. The pre-arm probe (2/2 marks) already hinted the coordinator's
"control 0" premise was wrong; the pilot confirms it at n=16. No metric
proved wrong in a way that changes the verdict — the PRIMARY correctly
killed a redundant layer. For the NEXT feasted-combat arm, do not
pre-register a bar-holding delta against the feastscale base; the base
already holds it. The remaining measurable deltas are draw-facing rate
(armed 150/150 vs control 0/150 — the only thing the layer changed) and
downstream chain progress (announced → take-seat → tableScene).
- Instrument note: runDays does not return ctx, so the layer's ctx
  counters (fbFacedCtx) read 0 in the JSONs; the read-only wrap counts
  (faceOk) are authoritative. Scholar "combat deaths" (52/52, 45/45)
  double-count tele-death records per death (the registerDeath
  double-registration race noted in sim-harness); armed/control are
  IDENTICAL so the guardrail comparison is valid, but the absolute
  number is not "52 scholar deaths".
- Completion gates: 32/32 runs complete, 0 instrument errors, det-gate
  byte-identical (gate OFF, 60d, seed 9501). GO.

## Results
Pilot ran 2026-10-17 ~03:30–04:10 UTC (36 min wall for 32 runs).
Substrate asserted up front (FEASTSCALE_R13=1, SEATDRIVE=0 explicit).

| road | arm | foodDeeds | seat | waiting | announced | arcIV | national | won |
|---|---|---|---|---|---|---|---|---|
| leadfeast | armed | 7/8 | 7/8 | 7/8 | 6/8 | 7/8 | 6/8 | 0/8 |
| leadfeast | control | 7/8 | 7/8 | 7/8 | 6/8 | 7/8 | 6/8 | 0/8 |
| belongfeast | armed | 8/8 | 8/8 | 8/8 | 8/8 | 8/8 | 6/8 | 0/8 |
| belongfeast | control | 8/8 | 8/8 | 8/8 | 8/8 | 8/8 | 6/8 | 0/8 |

**PRIMARY: NO-GO (15/16 vs 15/16, bar was armed ≥ control+3). The
feastblow layer is KILLED — deleted zero-trace per kill protocol.**
Armed and control are identical on EVERY metric: marks/run (20.1/20.1,
23.4/23.4), draws cast (74/74, 76/76), scholar combat deaths (52/52,
45/45), median survival (d138/d138, d147/d147), no new death modes, all
guardrails ok. The layer's mechanism engaged fully — armed faced 150/150
draws, control 0/150 — and changed nothing the deed cares about.

**THE SEAT QUESTION — ANSWERED YES.** On the true feastscale substrate,
the feasted scholar strike converts to seat-earned (lesser) on 30/32
runs and the invitation stages (tableWaiting) on 30/32 — on BOTH arms.
Arc IV reached 15/16, announced 14/16. The chain then stops: base
courtship has no seat-taking verb (tablegate's 'no-driver' gate) —
tableDone 0/16, won 0/16. The food-thesis deed is earnable by the
feasting life; the next gate is the missing take-seat verb, not the
scholar's hands.

**CORRECTION TO FINDING #441's PREMISE.** The tablegate's "base
courtship never fields the scholar feasted" (feastSurgeUsed 0/5) was
measured on BARE leadcourt/belongseek — FEASTSCALE_R13=1 sat in the env
but the feastscale wrapper was never applied, so the feast layer was
silently OFF. On the TRUE feastscale substrate (leadfeast/belongfeast,
layer on): sentimentTaught 16/16, feastSurgeUsed 15/16, seat 15/16,
invitation 15/16. Steve's sharpened call ("is the food-thesis deed
INTENDED to require the scholar's own hands in combat?") gets decisive
data: the deed IS earned by a policy that feasts armed and fights
feasted — and the feasting life alone (no special combat policy) does
it. The "never" was a substrate artifact, not a design truth.

Convergence verdict: **killed-at-pilot** (the layer). The axis question
it served is answered: the feasted blow reaches the seat.

## Village assessment — what the feasted blow READS like
Sense-read (SENSE-TESTING LAW) of the feast chain on leadfeast-s9503,
90d, base policy (the layer is dead; this is what lives):

- d27: "🍖 The feast is warm and good — full bellies, loud laughter —
  but no keepsake was channeled. The surge must be armed before a feast
  can carry it: hold a keepsake and channel first. (Feast buff refused:
  devotion gate.)" — the refusal is HONEST, narrated, instructive.
- d34: "🍖 FEASTED ×2.03 until tomorrow's dawn (6 parts left): a proper
  feast. A channeled keepsake feeds the flames (devotion ×1.5). Strikes
  and abilities hit with the feast behind them." → "🌙 The cookfire's
  smell carried further than the laughter did — smoke and grease on the
  night wind. Static is circling the edge of the light. It followed the
  feast here. (A scavenger, drawn by the feast. Face it while the feast
  is in you — or let the watch drive it off.)" → "FEASTED ×2.03: the
  feast was the weapon." — the weapon moment LANDS in real combat, with
  the true multiplier stated.
- d36: "The feast's fire burns low — the buff fades with the night.
  (Feasted expired.)" — clean expiry, narrated.

Judgment: the chain is coherent and legible — arm (channel) → feast →
buff → draw → feasted strike → expiry, every transition narrated, every
number honest. Nothing robotic. One documented blank: the draw's offered
choice ("Face it while the feast is in you — or let the watch drive it
off") is never EXERCISED on the base — driveOffFeastDraw is never
called, and the draw expires silently into "The thing at the edge of
the light gives up and moves on." The choice is theater until a policy
takes it. (The killed layer took it 150/150 — and proved it changes no
deed outcome.)

## Blanks filled / documented
- **MEASURED (pilot)**: 32-run armed/control pilot on the feastscale
  substrate (8 fresh seeds 9501–9508 × {leadfeast, belongfeast} ×
  {armed, control}, 180d death-aware, SEATDRIVE=0, FEASTSCALE_R13=1).
  Completion gates all GO. PRIMARY NO-GO → layer killed.
- **KILLED**: scripts/policies/feastblow.js deleted zero-trace. The
  mechanism worked (150/150 draws faced) but moved nothing.
- **ANSWERED**: the seat question — feasted scholar strikes convert to
  seat-earned (lesser) + invitation staged on 30/32 runs. The deed is
  earnable by the feasting life.
- **CORRECTED**: finding #441's premise — the "never fields the scholar
  feasted" reading came from bare courtship with the feast layer
  silently off. Filed as a correction note (not a new finding — same
  #441 thread).
- **DOCUMENTED**: the next gate is 'no-driver' — no take-seat verb on
  base courtship (tableDone 0/16, won 0/16 despite 15/16 invitations).
  The draw's face-or-drive-off choice is never exercised on the base.
- **FILED to sim-findings.md**: the #441 premise correction + the
  no-driver downstream gate (appended below by the coordinator's
  convention — worker appends directly).

## Instruments (kept per kill protocol)
- scripts/policies/feastblow.js — DELETED (the killed layer).
- scripts/test-feastblow-20261017.js — proof test; kill-protocol branch
  (layer absent → records verdict, skips mechanism checks). Pre-kill:
  10/10 green incl. RED→GREEN, 7 adversarial cases, det-gate
  byte-identical (gate OFF, 60d, seed 9501).
- scripts/sweep-feastblow-20261017.js — 32-run pilot sweep (substrate
  assertion, read-only feast-chain + tablegate instruments, live death
  capture, per-seed JSONs).
- scripts/analyze-feastblow-20261017.js — verdict analyzer (no sims).
- scripts/probe-feastchain-20261017.js, scripts/probe-feastdraw-20261017.js
  — pre-arm reconnaissance (the race diagnosis).
- scripts/capture-feastblow-beats-20261017.js — sense-read beat capture.
- evidence/2026-10-17/perseed-feastblow/ — 32 per-seed JSONs + sweep.log.
- evidence/2026-10-17/sim-feastblow.md — this file.
