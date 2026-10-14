# SIM-TRIAGE — pantry triage evening pass (food economy, game-code arm) — KILLED AT PILOT

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-triage
Axis: food economy (scale-wall lens) — sim-findings #30 (village-scale fresh-rot overproduction).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding)

- **Primary metric:** fresh-rot share = rot:fresh/(rot:fresh+rot:preserved) in pp,
  summed over the 16-run suite (the r18b convention).
- **GO:** armed share ≥ 10pp below baseline on identical seeds.
- **KILL:** share moves <5pp.
- **Mechanism metric (pre-registered secondary):** absolute fresh-rot kcal; GO note −15%.
- **Guardrails:** median survival no worse than −10d; laundering telemetry stays
  at 0 (spoilsmoke #82 — legit-preserved vs laundered counted separately).
- **Horizon:** 180d death-aware (WIN-PATH HORIZON 180).
- **Seeds:** 11/22/33/44/55/66/77/88 × leadcourt/belongseek = 16 runs per side,
  IDENTICAL seeds before/after.
- **Canon:** docs/PRESERVATION.md — "Rot can't be smoked back into food";
  energy never created; the dinner reserve (250/person, DINNER-FIRST) and the
  racks-cap formula (125/person × ownShelf) are deliberate and untouched.

## The blank (sim-findings #30)

Two of three named levers are dead (preservation drive = racks capacity binds;
production throttling = rarely engages; dinner-reserve cut = reserve isn't the
constraint). The third, PANTRY TRIAGE, was untested — and the dinreserve
finding named exactly what the duty-time cook drive never sees: "the would-rot
surplus ... (spoilDay−day > 2 window, racks-full stand-downs, post-cook arrivals)."

## The lever (game.js, reverted per kill protocol)

`Game.eveningTriage(v)`, hooked at the end of `villageEats` (once per village
day, after the evening meal — the meal already ate fresh-first, so the triage
only ever touches what the village couldn't eat):

- Eligibility mirrors the duty drive exactly: 0..2-day about-to-rot window,
  same exclusions (bonded, keepsake, already preserved/rendered, pemmican,
  spoilDay ≥ 9999), and the spoilsmoke `isSpoiled(it, 0)` canon exclusion.
- Keeps ~1 night of the measured pantry draw (125/person) fresh for tomorrow's
  meal — the drive keeps 2 nights because it fires pre-meal; the triage fires
  post-meal. The would-rot excess goes to the racks.
- Racks-cap = the drive's own formula (125/person × ownShelf) — never
  bypassed; honest stand-down narration when full.
- Budget 4000 kcal/evening (the drive's own per-shift budget).
- Rates: the village's best preserver tends the racks (named in the beat);
  nobody skilled → blind rough job (0.80x, 15d), same as the drive.
- Design calls (Steve 2026-10-07, documented for overrule): post-meal hook
  (needs no cook staffing — the drive only fires when the leader staffs a
  cook); 1-night reserve; best-preserver tender; 4000 budget parity.

## Proof (REAL red/green)

`scripts/test-triage-20261014.js` — full src/js harness, seeded RNG before
eval, Game.save never stubbed. RED on pristine (mechanism absent → 4,000 kcal
would-rot stack rots), GREEN with the patch (12/12):

| check | result |
|---|---|
| triage ran, preserved real kcal | PASS |
| ~1 night of draw kept fresh (1500 vs ~1500) | PASS |
| no spoiled stack laundered (canon) | PASS |
| human beat (lantern + smoke racks, named villager) | PASS |
| preserved stack survives past the rot window | PASS |
| racks-full: stands down, honest beat, stack left for the meal | PASS |
| hooked inside villageEats | PASS |

## Pilot results (corrected suite — see methodology note)

16 runs per side, identical seeds. Before = pristine game.js; after = triage.

| metric | baseline (pristine) | armed (triage) | delta |
|---|---|---|---|
| fresh-rot share (PRIMARY) | 91.8pp (3539k/315k) | **92.0pp** (3193k/279k) | **+0.2pp → KILL** |
| rot:fresh absolute | 3539.3k | 3192.7k | −9.8% (−347k) |
| rot:preserved | 315.0k | 279.4k | −36k |
| triage throughput | 0 | 779.1k over 266 runs | mechanism fires |
| racks-full stand-downs | 0 | 475 | cap binds by design |
| duty-drive throughput | 956.0k | 581.4k | **−375k (substitution)** |
| real laundered kcal | 0 | 0 (verified) | ✓ (see note) |
| median survival | 72d (83/72 by policy) | 81d (81/92) | +9d (guardrail ✓) |
| hungryDays | 35 | 36 | +1 (noise) |
| wins / national / table | 0 / 6 / 0 | 0 / 7 / 0 | — |
| max wave reach | 4 | 4 | — |
| exiled | 0 | 0 | — |

**Verdict: KILLED AT PILOT.** The primary moved +0.2pp — the <5pp kill floor
fired. Game code reverted; evidence + scripts survive as instruments.

Why it failed (measured, not theorized): the triage works as a mechanism
(779k preserved, unit-proven, zero real laundering) but it fishes the SAME
pool as the duty-time cook drive — the drive's throughput fell 956k → 581k
(−375k), almost exactly offsetting the triage's 779k. Net new preservation
was only ~404k; net rot fell 383k. When the policy staffs cooks (the real
competent suite), the drive already covers the about-to-rot pool; the triage
is a second net in the same water. The share can't move because the
composition barely changes — and the remaining rot is dominated by trajectory
noise and the mortality wall (villages die to combat at median 72–81d, not
hunger: starvation is 5% of deaths both sides).

## Wall numbers (scale wall — report every run)

| side | national | table | wins | w4 | w5 | median surv | max |
|---|---|---|---|---|---|---|---|
| baseline | 6/16 | 0/16 | 0/16 | 4/16 | 0/16 | 72d | 180d |
| armed | 7/16 | 0/16 | 0/16 | 4/16 | 0/16 | 81d | 180d |

Exiled: 0 both sides. The scale wall is untouched by this arm (food-economy
axis, as expected).

## Death-cause shares

Baseline (176 deaths): combat 77 (44%), sickness 25 (14%), wound-wouldn't-close
23 (13%), villager combat 18 (10%), monster 12 (7%), starvation 8 (5%).
Armed (184): combat 97 (53%), sickness 21 (11%), monster 19 (10%), villager
combat 19 (10%), starvation 9 (5%), wound 9 (5%). Villages die to violence,
not hunger — a food-rot lever cannot move survival while combat attrition is
the bind.

## Village assessment (plain words)

Sixteen villages, fifteen funerals and one 180-day survivor (belongseek s44,
national, both sides — the triage didn't change its fate). The typical story
with the real policy running: a competent courtship village staffs its smoke
racks, gets to regional by day 40–60, courts its neighbors, and bleeds out to
wave-2/3 monster pressure. The pantry is usually full when the village dies.
The triage's evening beat reads as a person, not a system: "🌙 After the meal,
Carlos walks the pantry with a lantern — 2 batches of the almost-gone onto
the smoke racks (~3,399 kcal, keeps for weeks). Nothing good rots tonight."
(166 chars, phone-legible, names the village's actual best preserver.) The
racks-full stand-down fired 475 times and always said so honestly. Nothing
about the arm felt robotic; it just didn't move the needle the share measures.

## Sense-testing

Read 23 triage beats across a 40-day run (16 unique): all name a real
villager, all read as evening routine, none spreadsheet-like. The stand-down
line mirrors the drive's honest register. No silent actions: the triage only
narrates when it preserves or stands down.

## Metric review (§14)

1. The share metric behaved exactly as the prodthrottle/dinreserve reviews
   warned: on a suite where the drive already preserves ~1M kcal, the share
   measures pool composition, and two nets in the same pool can't change the
   composition. The absolute fresh-rot metric (−9.8%) is the honest read of
   the mechanism — real, but small.
2. The sweep's laundering telemetry initially read 10,048 kcal (leadcourt
   s77) — a FALSE POSITIVE from post-hoc instrumentation: it counted
   legit-preserved items that later spoiled on the racks (isSpoiled(it,0) raw
   boundary vs sweepSpoiled's bonus-aware default), re-counted across days.
   A focused at-convert-time check measured 0 real laundering. Laundering
   telemetry must be measured at preserve time (the spoilsmoke pattern),
   never post-hoc. Appended to sim-findings.md.
3. hungryDays is confounded with run length (dinreserve review §14.2 stands):
   35 → 36 across longer runs is noise, not a signal.

## Methodology note (instrument bug caught mid-run)

The first before/after pair ran **policy-less**: the sweep used
`Object.assign({}, require('./policies/leadcourt'))`, but the module exports
`{ leadcourt }` — so `policy.daily` was undefined and the "competent" suite
ran with no policy at all (cook drive never staffed, 0 duty throughput;
share 100pp on 521k rot). The spoilsmoke sweep (`.leadcourt` unwrap) was
correct; a repo-wide audit found exactly one other script with the broken
pattern: `scripts/measure-prodthrottle-20261013.js` — the prodthrottle pilot
(baseline median 33d, rotF 521.5k, share 100pp — byte-identical to my
policy-less baseline) ran policy-less. Its KILL verdict is provisional if the
axis is revisited. Both triage scripts fixed; suites re-run with the real
policy (duty drive fires: 956k baseline). The policy-less pair is discarded
(it still validated the mechanism end-to-end: 444k triaged, share −17.1pp on
a suite with zero preserved rot — but that suite wasn't the registered one).

## Blanks filled / documented

- FILLED (unit-proven, killed at pilot): the evening pantry triage — game-code,
  no staffing needed, canon-clean, zero laundering. Reverted per kill protocol.
- DOCUMENTED (appended to hidden_files/sim-findings.md): (a) the drive+triage
  substitution — the about-to-rot pool is already covered when cooks are
  staffed; future rot arms must target a different pool; (b) the
  POLICY_REGISTRY unwrap bug (prodthrottle provisional); (c) laundering
  telemetry must be measured at convert time.
- Instruments surviving: scripts/test-triage-20261014.js (RED-verified proof),
  scripts/measure-triage-20261014.js (16-run sweep, corrected policy wiring),
  scripts/diag-triage-20261014.js (rot-margin classifier).

## Convergence

food-economy: killed-at-pilot (triage). The village-scale rot bind stands:
preservation drive (capacity binds), production throttling (provisional kill —
policy-less suite), dinner-reserve cut (reserve isn't the constraint), pantry
triage (substitution — pool already covered). The remaining rot is death-tail
and trajectory noise under the mortality wall.
