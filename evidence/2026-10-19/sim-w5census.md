# sim-w5census — wave-5 unlock-PATH census (flesh-out loop, 2026-10-19, ARM sim-w5census)

Run: fleshout-20261019T0215Z, arm sim-w5census. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes.
Instruments + evidence only.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law + design call #4 combat-readiness
bar), hidden_files/wave4-standing-spec.md (the Standing implementation spec).
The wave-5 door is `standingDeferral(5)`: capped Standing ≥ t5=200 AND
`waveUnlockReady(5)` (four readiness bars on the recalibrated 2026-10-18 bar:
armored 4 @ P≥15, armed 6, tricks 3, veterans 2 living wave-4+ killers) AND
peak<5. The engine's w5 gate (`unlockedWave()`, game.js): wave-3 rung AND
gated standing ≥ 200 AND wave-4 faced.

## Where this sits

- sim-w5legs (2026-10-18): the wave-5 DOOR's five legs on the full winseat
  substrate (SEATDRIVE=1) — veterans bind 16/16, never satisfied; shape =
  KILL DROUGHT (1 wave-4 kill / 16 runs; villages fight w4 but kills don't
  land). Produced the sim-w4finish lever SPEC.
- sim-w5preseat (2026-10-18): the same door on the PRE-SEAT substrate (TF
  base only, SEATDRIVE=0) — veterans bind 16/16; shape = KILLER MORTALITY
  (7 wave-4 kills in 5 runs, all solo-scholar, killers dead in ~4–10d;
  maxVet never 2). The w4finish surface is saturated here; the pre-seat
  surface is veteran SURVIVAL.
- sim-vetwindow (2026-10-18): veteran release-window on winseat/new bar —
  the killing channels are raid (4/8) + thirst (2/8), all scholar deaths.
- 0115Z run (2026-10-19): pre-seat 32 runs — wave-4 25/32, wave-5 0/32.

THIS census measures the PATH to the door (not the door's legs): where
exactly each run's wave-5 progress stalls, on the pre-seat + windefer
substrate. It complements sim-w5preseat (legs) with stall POINTS.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY (diagnostic GO):** ≥15/16 of runs fully attributed with a named
stall class. The brief enumerates 16 seeds (63701–63716) crossed with the
winseat policy set ({leadfeast, belongfeast}) — by the loop's standing
convention (vetwindow/w5legs/w5preseat: N seeds × 2 policies) that is a
32-run census; the binding bar is the same fraction, **≥30/32**. A miss is
NO-GO, never re-scored (§14).

**Stall-point classes (door-centered — the w5 door is standingDeferral(5);
a strict path ladder, mutually exclusive and exhaustive by construction):**
- `unlocked` — peak ≥ 5 observed (the w5 door opened).
- `engaged-but-failed` — deferral(5) true ≥ 1 day (the village stood at
  the door) but the door never opened.
- `progressed-but-stalled` — wave-4 unlocked (peak ≥ 4) but deferral(5)
  never true (the door never approached).
- `never-progressed` — peak < 4 all run (the w5 path never opened).
- Sub-shape `w5door-without-w4`: deferral(5) true while peak < 4 (stood at
  the w5 door on standing alone; the w4 door was the real bind).

**Wave-5 unlock attempt** = a maximal contiguous deferral(5)-true window.
Outcome ∈ {released, died, won, horizon, regressed} (regressed = the window
ended while alive+unwon — capped standing fell below t5).

**Traced per run:** standing points by source (war = wave-3+ ledger kill
pts ×25; diplomacy = seasoned regional+ links ×34; plenty = major feasts
×20; plenty capped at 100 toward t5), wave-4 ledger points earned
(waveLedgerPoints(4)) + wave-4 kill anatomy (count, distinct types,
killers, engine via tags), readiness-bar state at the stall point
(waveUnlockReady(5): armored/armed/tricks/veterans + short list), deed-gate
bars, wall numbers.

**Horizon:** 180d death-aware (dead villages stop simulating; the honest
surface for a wave-5 question — pre-seat villages survive to ~140d median).

**Seeds:** 16 FRESH 63701–63716 (verified: zero filename hits in
evidence//scripts; content hits are pantry-kcal artifacts in other seeds'
files, e.g. "pantryKcal":63707 in a 2026-10-15 file) × {leadfeast,
belongfeast} = 32 runs.

**Substrate (the brief's EXACT stack):** policy
`withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))` on
tribfloor leadfeast/belongfeast — the winseat policy set, EXACTLY as
evidence/2026-10-18/sim-vetwindow.md. Env: FEASTSCALE_R13=1 TRIBFLOOR=1
SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1
(VETREL/REPOSITION unset → those layers inert by their own gates;
SEATDRIVE=0 → seatdrive pure delegation, proven byte-identical in
scripts/policies/seatdrive.js). Effective behavior: windefer-active
tribfloor on pre-seat. The sweep FAILS LOUD unless the env matches exactly
(SEATDRIVE must be '0', not '1' or unset; VETREL/REPOSITION must not be '1').

**Instrument:** scripts/probe-w5path-20261019.js (daily path census —
pure engine reads; DET gate pins instrument-on vs instrument-off
byte-identical), scripts/analyze-w5path-20261019.js (stall-point
attribution), scripts/w5path-transcripts-20261019.js (SAY-line probe for
sense-testing), scripts/test-w5path-20261019.js (proof: bar-shape fixtures
pinning t4=100/t5=200/plentyCap=100/{4@P15,6,3,2} + classification fixtures
on synthetic histories F1–F9 + SMOKE + DET + attribution completeness).

**No balanced panel** (§15): pure diagnostic, no lever, no before/after —
the corpus summary + stall-attribution table are attached and the reason is
noted here.

**No [needs-eyes]**: instrument-only, no player-facing change.

## Results

SWEEP COMPLETE (2026-10-19). 32/32 runs, 0 instrument errors. Seeds
63701–63716 × {leadfeast, belongfeast}, pre-seat + windefer, 180d
death-aware. Per-seed JSONs: `evidence/2026-10-19/perseed-w5path/<policy>/`
(32/32 present and valid).

Proof: scripts/test-w5path-20261019.js — 34/34 GREEN (bar-shape 13/13;
classification fixtures 16/16 incl. F9 endRec-boundary; SMOKE 3/3; DET 1/1
covering 4/4 byte-identical; attribution completeness 32/32). FIDELITY 4/4
(2 sweep seeds re-run byte-identical).

**INFRA NOTE:** the first sweep run died at 26/32 on a flapping host EPERM
(write) outage (the documented 2026-10-18 git-EPERM class, now hitting node
fs writes; ~10-min outage windows). One blind retry left a 0-byte
`belongfeast/s63713.json`; it was deleted and the seed re-run cleanly.
Per-seed JSONs are deterministic — the 6 missing seeds re-ran standalone,
then the file set was validity-checked (32/32 parse). No seed was run twice
for the same question.

### The stall-point census (the pre-registered primary)

**32/32 runs fully attributed → DIAG-GO met (bar ≥30/32).**

| stall class | n/32 | shape |
|---|---|---|
| engaged-but-failed | 21 | stood at the w5 door (deferral(5) ≥1d), never opened it |
| progressed-but-stalled | 9 | w4 unlocked, the w5 door never approached |
| never-progressed | 2 | w4 never unlocked |
| unlocked | 0 | — |

- 21/32 runs (66%) REACH the w5 door. Median first-deferral day: **d72**.
  Median attempt-window length: **40d** (max 105d — leadfeast-s63701,
  d57–161).
- Attempt outcomes (21 windows): **died 18**, horizon 2, regressed 1.
  The window is lethal: 86% of villages that reach the door die inside
  the window. The 2 horizon runs sat at the door to d182; the 1 regressed
  run (belongfeast-s63705, d163–175) had the door close when a seasoned
  link broke (dip 34→0, cap 175 < 200) — the "deaths hit hard /
  renegotiation" design working as priced.
- Sub-shape `w5door-without-w4`: **4/32** (all leadfeast) — capped standing
  hit t5 on bread+bonds with ZERO wave-3+ kills (war=0) and w4 never
  unlocked. The standing side outruns the war side; the fiction correctly
  names only the w4 door (knowledge gating — the village can't be told
  about a door beyond the next one).

### The path anatomy

**Standing by source** (terminal means on the 21 door runs):
war 70 / diplomacy 73 / plenty 187 (capped) / capped total 243.
Plenty dominates everywhere (13 feasts mean); war is thin — 8/32 runs end
with war=0 (no wave-3+ ledger kill points at all); diplomacy is
policy-split (leadfeast: steady 102 = 3 seasoned links; belongfeast: 0–34).

**Wave-4 ledger + kills:** 13 wave-4 kills total across 32 runs, on 6 runs
(max 3/run) — **all 13 via=player (the scholar); 0 villager, 0 companion**.
Deed w4 (distinct fought): median 3, max 7, 24/32 runs fought ≥1 w4 type.
Villages FIGHT the Mirror Draft (deed proves it) but only the scholar ever
finishes — and the kills don't make veterans (maxVet never 2 anywhere).

**Readiness at the stall (terminal):** veterans short on **32/32** runs,
armor on 31/32, weapons on 26/32, tricks on 0/32. The veteran leg is short
everywhere at the end — confirming sim-w5preseat's leg ranking from the
path side. Armor co-binds (the mortality shape one leg down: armored
fighters die off — the near-miss transcript shows 3/4 → 1/4 armored as the
window grinds).

**Wall numbers (this substrate):** national 27/32, table 31/32, wins 0/32
(substrate-honest: no seat driver), wave-4 26/32, wave-5 0/32, median
survival 137d, exiled 0/32.

### The verdict

The wave-5 path on pre-seat + windefer stalls in exactly one place that
matters: **at the door, in the window, dying**. Two-thirds of villages
reach the w5 door (median d72 — the standing bar is reachable, mostly on
bread+bonds with thin war); they then hold the door for a median 40 days
while the readiness bars — veterans always, armor almost always — stay
short; 86% die inside the window (starvation and the wave-4 overtime, per
the transcripts); none open it.

This reframes sim-w5preseat's "killer mortality" from the path side: it's
not only that wave-4 killers die (they do — 13 kills, all scholar, 0
surviving pairs). It's that **the window itself is where villages go to
die** — the door opens onto a 40-day siege the village can't survive while
short 2 veterans and 3 armor. The veteran leg binds (32/32 short
terminally), but the stall point is the window, not the leg: even the
closest runs (105d at the door, 3 w4 kills) end starved at d161 with
standing 537.

The second stall point is earlier and quieter: 9/32 runs unlock w4 but
never approach the door (capped standing never reaches 200 — the plenty
engine stalls or the village dies first), and 2/32 never unlock w4 at all.

## Village assessment (plain words)

Thirty-two villages lived on the pre-seat + windefer stack. None won (no
seat to take). Twenty-one reached the Producers' door; eighteen died
standing in front of it.

**leadfeast-s63701 (died d161)** — the near-miss portrait. At the door
from d57 (standing 200 on bread+bonds, before wave 4 even unlocked at
d106). For 105 days the System named the short bars weekly — "armor the
village (1 of 4 fighters armored); blood your fighters (0 of 2
veterans)" — and the village bled trying: 3 wave-4 kills, all by the
scholar; at d127 the beat read "blood your fighters (1 of 2 veterans)"
for a week — a killer lived — then back to 0/2. The armored count fell
3/4 → 1/4 as fighters died. On d161, five hungry days after the pantry
emptied, "Haven couldn't hold... people started walking — in different
directions. The scattering, again." Standing 537. One veteran short.

**belongfeast-s63716 (survived d182)** — the stall portrait.
Progressed-but-stalled: wave 4 unlocked d115, the door never approached
(capped standing peaked at 125). Sixty-seven days under the Mirror Draft:
"The Eulogy gorges at the treeline — 963 kcal gone from the stores",
starving, a trader offering grain, "Something has shifted. Conversations
stop when you approach the fire." A village enduring the draft, not
advancing past it — exactly what the class name says.

**leadfeast-s63707 (died d125)** — the w5door-without-w4 portrait. Bread
140 + bonds 102 = standing 242 with war=0: not a single wave-3+ kill all
run. The village stood at the w5 standing bar from d76 and heard only the
w4 hold beat — "The next act is still waiting — blood your fighters (0 of
1 veterans)" — correct, because w4 never unlocked. It starved at d125
having never bled for anything. The bread road reaches the door's number
without ever fighting the draft that guards it.

Who thrived: scholars who could kill wave-4 monsters (13 kills, 6 runs) —
but every kill was the scholar's, and no pair of living veterans ever
coexisted. Who died and why: villages, in the window — 18/21, mostly
starvation after the pantry emptied under wave-4 pressure, plus the
wave-4 overtime's combat toll. What was missing: not the door (66% reach
it) and not the fights (deed w4 median 3) — the SURVIVORS. Two living
veterans, four armored fighters, six armed: the bars name exactly what's
missing, weekly, and the village can't fill them faster than the window
kills.

## Sense-testing (SENSE-TESTING LAW)

Three full transcripts read:
`evidence/2026-10-19/w5path-transcripts/leadfeast-s63701.txt` (near-miss,
10,147 say lines, d54–164), `belongfeast-s63716.txt` (stall, 1,601 lines,
d167–182), `leadfeast-s63707.txt` (w5door-without-w4, 4,135 lines, d73–128).

**Judgment: legible and reachable-but-hard — not broken-fiction.**

- The near-miss reads as a tragedy the numbers predict: the System's hold
  beats name the short bars every 7 days ("The fifth draft stays in the
  wings. The Producers want a village that can fight them — armor the
  village (1 of 4 fighters armored); blood your fighters (0 of 2
  veterans)"), the bars visibly degrade as fighters die, a veteran is
  blooded at d127 (1/2 for a week) and lost. The d161 starvation ending —
  "Haven couldn't hold... The scattering, again." — lands with the full
  weight of the 105-day setup. The System televising "Ask a Human" while
  the village starves is the thesis (out-of-touch aliens) played straight.
- The stall reads as endurance: wave-4 monsters taxing the village (Eulogy
  gorging 963 kcal), hunger, traders, fraying trust. No door beats —
  correct, the door never approached.
- The w5door-without-w4 reads as the design intends: a village that bought
  standing with bread hears only about the next act. Knowledge gating holds
  — the fifth draft is never named before its time.

**PROBE ARTIFACT (fixed in-instrument, documented):** the first transcript
pass rendered the w5 door SILENT — no hold beats, no release beats — which
would have read as broken-fiction ("Unreadiness is never silent" violated).
Root cause: `scripts/sim-harness.js:234` stubs `G.sysSay` to a no-op for
sims ("silence narration for sims"), and the transcript probe only
re-wrapped `Game.say`. The beats fire in-game (watermark
`state._standingDeferBeat` proves it); the probe was deaf to the System's
voice. Fixed in `scripts/w5path-transcripts-20261019.js`: the probe now
restores `Game.sysSay` in the engine's format, routed through the wrapped
say. All three transcripts were regenerated with the fix. Lesson for the
loops: any sense-testing probe that wraps `Game.say` must also restore
`Game.sysSay`, or every System-voiced beat (holds, releases, RATINGS)
vanishes from the transcript and the fiction misreads as silent.

Robotic bits (filed as findings, not sense failures): "Too heavy.
Carrying X/26 kg." weight spam persists; "The well won't fill itself."
daily.

## Metric review (§14 — binding, never re-scored)

1. **PRIMARY (≥30/32 attributed): 32/32 → GO, no re-scoring.** Every run
   carries a named stall class + sub-shape + attempt windows with outcomes.
2. **Seed×policy → 32 runs:** the brief enumerates 16 seeds and "x winseat
   policies"; the loop's standing convention (N seeds × 2 policies) gives
   32 runs, and the brief's ≥15/16 fraction scales to the binding ≥30/32.
   Documented here; the fraction is unchanged.
3. **Attempt-outcome boundary fix (instrument, not metric):** the first
   analyzer pass misread 3 windows because the daily series lags run end by
   a day (s63708/s63713 'regressed' → 'horizon'; s63711 'regressed' →
   'died'). Fixed by appending endRec as the terminal observation
   (analyze-w5path-20261019.js); pinned by new F9 fixtures (a/b/c) in the
   proof. Outcomes are now: died 18, horizon 2, regressed 1 (real —
   s63705's link broke, cap 175 < 200).
4. **No balanced panel** (§15): diagnostic, no lever — corpus summary +
   stall-attribution table attached, reason pre-registered.
5. **DET 4/4 + FIDELITY 4/4:** the instrument is trajectory-neutral and the
   corpus reproduces byte-identically.
6. **Classification is door-centered by pre-registration:** the 4
   w5door-without-w4 runs count as engaged-but-failed (the engine's
   deferral(5) was true) with the sub-shape named — the true stall point
   (w4 readiness) is explicit in the table, not hidden.

## Named nexts (for a future wave-5 lever)

1. **The window is the lever surface, not just the veteran leg.**
   sim-w5preseat named veteran SURVIVAL as the pre-seat surface; this census
   adds: 86% of door-reaching villages die IN the window (median 40d).
   A veteran-production lever that doesn't also keep the village alive
   through the window just produces better-fed corpses. Candidate: window
   support — field recovery for wave-4-engaged fighters, pantry defense
   during the deferral — measured against door-reaching runs' survival,
   not just maxVet.
2. **Re-measure with VETREL=1.** This substrate has the companion-veteran
   channel OFF (VETREL unset per the brief). All 13 wave-4 kills were the
   scholar's; villager wave-4 kills are 0/32. The vetrel channel exists
   precisely to manufacture villager veterans — the stall distribution
   with it ON is unmeasured on this path census.
3. **The w5door-without-w4 question is a Steve-call, not a lever:**
   should t5 standing without w4 unlocked count as "at the w5 door"
   (deferral(5) true)? The bread+bonds road reaches the number without
   fighting the draft. Options: gate deferral(5) on peak≥4, or leave it
   (the fiction already gates on the w4 beat). Flagged, not spec'd.
4. **Armor mortality is the second bind (31/32 short terminally).**
   Same shape as veterans one leg down — armored fighters die in the
   window. Any veteran-survival lever should track armor retention jointly.
5. **The regressed run (s63705) is the design working:** a broken link
   closed the door (cap 175 < 200). Link fragility is already a priced
   input to the door — no lever needed, but a future arm should measure
   link-break frequency in the window deliberately.

## Out-of-arm findings (appended, NOT chased)

- **[open] 2026-10-19 — telemetry — TRANSCRIPT PROBES MUST RESTORE
  Game.sysSay (sim-w5census):** sim-harness stubs sysSay to a no-op; any
  probe wrapping only Game.say renders all System-voiced beats silent
  (holds, releases, RATINGS) and the fiction misreads as broken. Fixed in
  scripts/w5path-transcripts-20261019.js. Other loops' transcript probes
  (w5legs, vetwindow, w5preseat) should be audited for the same deafness.
- **[open] 2026-10-19 — infra — HOST EPERM FLAPPING HIT NODE FS WRITES
  (sim-w5census):** the documented 2026-10-18 git-EPERM outage class now
  hits node writeFileSync (~10-min windows; killed the sweep at 26/32,
  one 0-byte per-seed file from a blind retry). Recovery: delete 0-byte
  files, re-run missing seeds (deterministic), validity-check the set.
- **[open] 2026-10-19 — telemetry — "Too heavy. Carrying X/26 kg." weight
  spam persists in transcripts (sim-w5census).** (Already in backlog from
  sim-w5legs; still present.)

## Files

- scripts/probe-w5path-20261019.js — sweep + SMOKE/DET/FIDELITY modes,
  w5path substrate (this run)
- scripts/analyze-w5path-20261019.js — stall-point attribution (this run;
  endRec-boundary fix)
- scripts/w5path-transcripts-20261019.js — SAY-line probe with sysSay
  restored (this run; the probe-artifact fix)
- scripts/test-w5path-20261019.js — proof: bar-shape + classification
  fixtures F1–F9, SMOKE, DET, attribution completeness (this run)
- evidence/2026-10-19/perseed-w5path/ — 32 per-seed JSONs (this run)
- evidence/2026-10-19/w5path-corpus-summary.json — corpus summary (this run)
- evidence/2026-10-19/w5path-stall-attribution.md — stall-attribution table
  (this run)
- evidence/2026-10-19/w5path-transcripts/ — 3 sense-testing transcripts
  (this run)
- evidence/2026-10-19/sim-w5census.md — this file
- ZERO src/js changes, ZERO scripts/policies changes (instrument-only arm)

## Convergence

**converging.** DIAG-GO met on a clean instrument (32/32 attributed,
DET 4/4, FIDELITY 4/4): the wave-5 path on pre-seat + windefer stalls at
the door — 21/32 reach it (median d72), 18/21 die in the window (median
40d), 0/32 open it. The stall point is the window, not just the veteran
leg: villages die faster than they blood killers. Named nexts above give
the next lever its surface (window survival + veteran survival, ideally
with VETREL=1 re-measured). The axis stays scale-onramp. No game change:
zero src/js, zero scripts/policies — instruments + evidence only.
