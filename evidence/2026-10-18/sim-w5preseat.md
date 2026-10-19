# sim-w5preseat — wave-5 door bar-leg census on the PRE-SEAT substrate (flesh-out loop, 2026-10-18, ARM sim-w5preseat)

Run: fleshout-20261018T1830Z (approx), arm sim-w5preseat. Axis: scale-onramp (the blocking axis).
Lever-10 lens (the table→win chain). DIAGNOSTIC — instrument-only,
ZERO src/js changes, ZERO scripts/policies changes.

Canon: docs/CANON.md, docs/TABLE.md (the 2026-10-10 deed gate = the FULL
seat), docs/MONSTER-WAVES.md (wave law + design call #4 combat-readiness
bar). The wave-5 door is `standingDeferral(5)`: capped Standing ≥ t5=200
AND `waveUnlockReady(5)` (four readiness bars: armored 4 @ P≥15, armed 6,
tricks 3, veterans 2 living wave-4+ killers) AND peak<5.

Context: sim-w5legs (2026-10-18) measured the wave-5 door on the FULL
WINSEAT substrate (`withSeatDrive(withWinDefer(withVetrel(withReposition(TF
base))))`, SEATDRIVE=1): **veterans bound 16/16** (never satisfied on any
run; 1 wave-4 kill across the corpus), standing 9/16, armor 9/16, weapons
and tricks never bound. The kill drought — not veteran survival — is the
bind shape there, and it produced the sim-w4finish lever SPEC
(kill-conversion → veteran production). THIS arm asks whether that
instrument re-pointed at the PRE-SEAT substrate says the same thing: does
the veteran leg bind pre-seat too, or does a different leg dominate?

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sweep)

**PRIMARY QUESTION:** on the pre-seat substrate, which leg of the wave-5
door binds per run, and is the door reachable before villages die?

**DIAG-GO: ≥15/16 runs with the binding leg FULLY ATTRIBUTED** — each
attributed run names: (a) the binding leg (or binding set), (b) the day
the bar could have cleared, (c) the day the village died/won, (d) the gap.
A miss is NO-GO, never re-scored (§14).

**Definitions (fixed before the sweep — IDENTICAL to sim-w5legs):**
- LEGS: STANDING (capped = war + diplomacy + min(plenty,100) ≥ t5=200),
  ARMOR (4 living fighters armored @ P≥15), WEAPONS (6 armed),
  TRICKS (3 counters known), VETERANS (2 living wave-4+ killers).
- firstSat[leg]: first day the leg was satisfied (null if never).
- Runs that UNLOCK w5: bindingLeg = the leg with the latest firstSat.
- Runs that never unlock: binding set = the legs short on the most
  door-in-play days (days where wave-4 was unlocked, the village alive,
  unwon — the door is "in play" only then), ranked by short-days and by
  terminal shortfall (demand − final value).
- couldClearDay: wave5Day for unlocked runs; "never" for never-unlocked.
- other4FirstJointDay: first day all non-binding legs were simultaneously
  satisfied. gap: unlocked → endDay − wave5Day; never-unlocked →
  endDay − other4FirstJointDay (null if the other 4 never jointly
  satisfied).
- endDay/endKind: win day (Game.won), loss day (endReason), or 180
  (survived).

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail
max).

**Seeds:** 8 FRESH 66101–66108 × {leadfeast, belongfeast} = 16 runs.
Verified filename-unused: zero hits in evidence/2026-10-18/perseed-*/
AND zero hits in the whole tree (find -name "*6610*" empty) before the
sweep. 8 seeds IS the pilot budget here (the diagnostic needs the
census, not a confirm).

**Substrate (PRE-SEAT — EXACT):** policy tribfloor leadfeast/belongfeast
(TF base ONLY — NO vetstaff, NO vetblood, NO vetrel, no reposition, no
windefer wrapper, no seatdrive wrapper). Env: FEASTSCALE_R13=1
TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1,
SEATDRIVE=0, NODEWITNESS=1.

**Instrument:** scripts/w5preseat-sweep-20261018.js (standalone driver —
sibling loop B has live concurrent edits on scripts/sweep-compare.js, so
this arm NEVER touches it), scripts/w5preseat-analyze-20261018.js (same
attribution schema as w5legs — the two censuses share a comparison
frame), scripts/w5preseat-transcripts-20261018.js (near-door SAY probe),
scripts/test-w5preseat-20261018.js (proof: bar-shape + attribution
fixtures, DET, SMOKE, attribution completeness on the real sweep).

**Named outputs (the three questions this census answers):**
1. Which leg binds pre-seat — honest ranking (in-binding-set counts, per
   w5legs' metric-review tie-breaking note).
2. Whether veterans bind pre-seat as on winseat.
3. Whether the sim-w4finish lever surface applies to the pre-seat
   substrate: if veterans bind but kills are absent, the lever applies;
   if a different leg dominates, name it and its shape.

**No balanced panel** (§15): pure diagnostic, no lever, no before/after —
the corpus summary + leg-attribution table are attached and the reason is
noted here.

## Results

SWEEP COMPLETE (2026-10-18). 16/16 runs, 0 errors. Seeds 66101–66108 ×
{leadfeast, belongfeast}, TF base ONLY, SEATDRIVE=0, 180d death-aware.
Per-seed JSONs: `evidence/2026-10-18/perseed-w5preseat/<policy>/`
(16/16 present).

Proof: `scripts/test-w5preseat-20261018.js` — **29/29 GREEN** (bar-shape
fixtures 7/7 pinning t5=200/plentyCap=100/{armored 4@P15, armed 6,
tricks 3, veterans 2}; attribution-logic fixtures 14/14 on synthetic
histories F1–F6; DET 4/4 byte-identical instrument-on vs bare; SMOKE
both policies with legs recorded; attribution completeness 2/2 on the
real corpus).

ATTRIBUTION (the pre-registered primary): **16/16 runs fully
attributed, 0 unattributed → DIAG-GO met (bar ≥15/16).**

### The three named outputs

**(1) Which leg binds pre-seat (honest ranking):**

| leg | demand | runs ever satisfied | runs in binding set |
|---|---|---|---|
| VETERANS (2 living wave-4+ killers) | 2 | **0/16** | **16/16** |
| ARMOR (4 @ P≥15) | 4 | 9/16 | 8/16 |
| STANDING (capped ≥ 200) | 200 | 11/16 | 5/16 |
| WEAPONS (6 armed) | 6 | 16/16 | 0/16 |
| TRICKS (3 counters known) | 3 | 16/16 | 0/16 |

Primary binding leg (most short-days): veterans 7, standing 5, armor 4.
**Veterans is the binding leg: in the binding set on all 16 runs and
never satisfied on any run.** (The standing-primary count is inflated
by LEGS-order tie-breaking on runs where standing and veterans were
both never satisfied — same wrinkle noted in sim-w5legs' metric
review.)

**(2) Veterans bind pre-seat as on winseat: YES.** Same binding leg,
same never-satisfied shape (0/16 on both substrates).

**(3) The sim-w4finish lever surface does NOT apply to the pre-seat
substrate — the bind has a different SHAPE:**

- Winseat (sim-w5legs): the veteran bind = **kill drought**. 1 wave-4
  kill across 16 runs; villages fight wave-4 (deed w4 up to 7) but the
  kills don't land. The w4finish SPEC (kill-conversion: finish the
  fights you already engage) is the right surface there.
- Pre-seat (this census): the veteran bind = **killer mortality**. 7
  wave-4 kills landed across 5 runs (deed w4 up to 7) — but maxVet
  never exceeded 1 on any run, and 0 terminally everywhere. Every
  wave-4 kill in the corpus was a **solo scholar (player) kill**
  (`via=player`), and the killers died within ~4–10 days:
  - s66107: scholar killed The Influencer (w4) d94 — the killer
    (Aki Tanaka) died the same day; mantle transferred to Caroline
    Hussain d95; vet never >0.
  - s66105: 2 kills (Congregation), killer held vet=1 d95–103 and
    d100–110, then died (35 "combat" deaths in the run).
  - s66104, s66108: vet=1 for d86–93 / d87–90, then died.
  - The remaining 11 runs: 0 kills (drought shape persists too).
- The w4finish pre-registered GO primary — **≥5/16 runs with ≥1 wave-4
  kill — is ALREADY MET on the pre-seat baseline (5/16).** Its
  mechanism (convert fights → kills) is saturated here; its "no early
  retreat" component would plausibly make the mortality shape WORSE
  (more committed wave-4 fights = more pyrrhic scholar kills). The
  pre-seat lever surface is **veteran SURVIVAL**: keeping wave-4
  killers alive long enough for TWO LIVING killers to coexist —
  support for wave-4-engaged fighters (field recovery after the kill,
  armed escorts, armor for the engaged pair), not kill conversion.
  Armor co-binds (in-set 8/16; armored fighters reach 4–5 transiently
  but die off terminally to 0–3) — the same mortality shape one leg
  down.

Wall numbers (pre-seat, this corpus): national=13/16, table=14/16,
wins=0/16, wave-4=14/16, wave-5=0/16, median survival=164d, exiled=0/16.
The win absence is substrate-honest (no seat-drive stack): villages
survive or die, they don't win. Missed windows (veterans held the door
shut alone while the other 4 were jointly satisfied): 7 runs, median
84d, range 50–125d.

## Binding-leg ranking

1. **VETERANS** — in binding set 16/16, satisfied 0/16. The leg. Bind
   shape on pre-seat: killer mortality (kills land, killers die).
2. **ARMOR** — in binding set 8/16, satisfied 9/16. Co-binds; the
   P≥15 bar is reachable transiently (maxArm 4–5 on most runs) but the
   armored fighters die off (terminal 0–3). Same mortality shape.
3. **STANDING** — in binding set 5/16, satisfied 11/16. Healthier than
   winseat (no ~d90 win truncation); maxCap 200+ on 11 runs.
4. WEAPONS, TRICKS — never bind (satisfied nearly everywhere).

Corpus summary + full leg-attribution table attached:
`evidence/2026-10-18/w5preseat-corpus-summary.json`,
`evidence/2026-10-18/w5preseat-leg-attribution.md`.

## Village assessment (plain words)

Sixteen villages lived on the pre-seat stack. None won (no seat to
take). Seven died between d112 and d168, one died at d45 (wave 2), six
survived to the horizon. The wave-5 door never opened for any of
them — and unlike the winseat villages, these villages weren't
truncated by a win; they had the full 180 days and still couldn't
assemble two living veterans.

The villages that got closest to the door:

**leadfeast-s66106 (survived d181)** — the near-door portrait. Wave 4
opened d144. By d97 the village had everything except veterans and one
armor: standing 252, 6 armed, 23 tricks — and zero veterans. The
transcript reads exactly like the numbers: villagers STAND DOWN
wave-4 monsters ("bloodied but breathing. It's still out there,
somewhere") — Heckler, Big Beast, Spool, Big Big, Loud Beast,
Understudy faced but never finished. Then The Audit (wave 4) killed
Pradapdao in 1 round, The Nielsen (a show-named boss, wave 5 in data —
an audience spawn, not a gate leak) killed Giuseppe and Hone. A
village that can face the draft, bleed through it, and never finish
it. The Nielsen is the producers' ratings boss, a show event — it
struck from the fiction, not the wave gate.

**leadfeast-s66107 (survived d182)** — the pyrrhic kill. The other 4
legs jointly satisfied from d57; the door held shut by veterans alone
for 125 days. The scholar killed The Influencer (wave 4, hp 850–1050)
on d94 and died the same day — "MANTLE TRANSFER DETECTED... The
Codex turns a page: Aki Tanaka, 95 days. The mantle passes to
Caroline Hussain." The fiction knows exactly what happened: a kill
that cost the killer.

**belongfeast-s66105 (survived d182)** — 2 wave-4 kills (The
Congregation ×2), both by the scholar, who held veteran status
d95–103 and d100–110 and then died in the 35-combat-death meatgrinder.
The door never had two living killers at once.

Who thrived: scholars who could strike wave-4 monsters and walk away
were rare — most kills were made by the dying. Who died and why:
fighters, constantly — 27–35 "combat" deaths per long run; the wave-4
window is a butcher's bill. What was missing: not the finishing blow
(this time) — the SURVIVOR. The capability gap is keeping the killer
alive to the second kill.

## Sense-testing

Read end to end: leadfeast-s66107 d54–96 (the pyrrhic-kill window)
and leadfeast-s66106 d94–181 (the stand-down village); transcripts at
`evidence/2026-10-18/w5preseat-transcripts/`.

- The d94–95 Influencer kill + mantle transfer is the diagnostic in
  miniature: a real wave-4 kill, honestly narrated, immediately
  followed by the killer's death and the village mourning-and-moving
  on. The waveKillLog records the kill; the living roster never
  records the veteran. The fiction and the numbers agree: the village
  paid a life for a kill and the door stayed shut.
- s66106's "stood down" beats are the other shape: villages that face
  wave-4 and live, narrated as survival rather than victory. The
  wave-4 monsters are feared ("It is WAITING. You cannot face it
  alone. Sound the call."), the Audit kills in 1 round, the Eater
  takes Naran in 2 — the monsters are real and the village knows it.
- Near-door coherence: a village one veteran short of the wave-5 door
  reads like a village one veteran short — fighters who stand down
  wave-4 monsters but never finish them, a scholar who finished one
  and died doing it. The near-door state is legible in the fiction,
  not a silent number.
- Robotic bits (filed as findings, not sense failures): "You don't
  know how to make a Arrow yet." repeated across windows (an
  article-grammar artifact in a knowledge-gated line); "The well won't
  fill itself." daily spam.
- Judgment: meaning and coherence pass. The near-door stretches read
  as a village that can face wave-4 and, sometimes, finish one —
  which is exactly what the numbers say.

## Metric review

1. **DIAG-GO (≥95% attribution): 16/16 → GO, no re-scoring.** Every
   run names its binding leg/set, firstSat days, couldClearDay,
   endDay/endKind, and gap.
2. **Tie-breaking wrinkle (noted, not re-scored):** the primary-leg
   count uses LEGS-order tie-breaking, which inflates standing's
   primary count (5) on runs where standing and veterans were both
   never satisfied. The in-binding-set counts (veterans 16, armor 8,
   standing 5) are the honest ranking. Same note as sim-w5legs —
   consistent frame.
3. **"The day the bar could have cleared"** for never-unlocked runs is
   "never" by construction; the operational gap is the missed window
   (other4joint → end). 7 runs had computable missed windows (median
   84d, range 50–125d).
4. **No balanced panel** (§15): diagnostic, no lever, no before/after.
   Corpus summary + leg-attribution table attached
   (`w5preseat-corpus-summary.json`, `w5preseat-leg-attribution.md`).
5. **Pre-seat wins = 0/16 is substrate-honest:** with SEATDRIVE=0 and
   no win-side layers there is no win path to be truncated by; the
   census answers "reachable before villages die", and the answer is
   that villages mostly survive to 180d with the door still shut.

## Out-of-arm findings

1. **Killer mortality is the pre-seat bind shape** (this arm's core
   finding, IN-arm): wave-4 kills land (7 in 5 runs) but killers die
   within ~4–10 days — maxVet never 2, 0 terminally everywhere. The
   w4finish lever surface (kill-conversion) is saturated here; a
   future pre-seat lever would target veteran survival.
2. Filed to `hidden_files/sim-findings.md`: "You don't know how to
   make a Arrow yet." article-grammar artifact (knowledge-gated line);
   "The well won't fill itself." daily spam.
3. Filed to `hidden_files/sim-findings.md`: show-named boss The
   Nielsen (wave 5 in data, hp 1100–1400) spawned via the audience
   show system on leadfeast-s66107/s66106 and killed villagers —
   fiction-coherent (producers' ratings boss), not a wave-gate leak;
   noted so nobody re-diagnoses it.

## Files

- scripts/w5preseat-sweep-20261018.js — sweep + SMOKE/DET/FIDELITY
  modes, PRE-SEAT substrate (this run; standalone — sweep-compare.js
  untouched)
- scripts/w5preseat-analyze-20261018.js — attribution aggregator,
  same schema as w5legs (this run)
- scripts/w5preseat-transcripts-20261018.js — SAY-line probe for
  near-door windows (this run)
- scripts/test-w5preseat-20261018.js — proof: bar-shape + attribution
  fixtures, SMOKE, DET, attribution completeness (this run)
- evidence/2026-10-18/perseed-w5preseat/ — 16 per-seed JSONs (this run)
- evidence/2026-10-18/w5preseat-corpus-summary.json — corpus summary
  (this run)
- evidence/2026-10-18/w5preseat-leg-attribution.md — leg-attribution
  table (this run)
- evidence/2026-10-18/w5preseat-transcripts/leadfeast-s66106.txt,
  leadfeast-s66107.txt — near-door transcripts (this run)
- evidence/2026-10-18/sim-w5preseat.md — this file
- ZERO src/js changes, ZERO scripts/policies changes
  (instrument-only arm)
