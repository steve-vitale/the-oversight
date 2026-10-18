# sim-w5legs — wave-5 door bar-leg attribution (flesh-out loop, 2026-10-18, ARM sim-w5legs)

Run: fleshout-20261018T1715Z, arm sim-w5legs. Axis: scale-onramp (the blocking axis).
Lever-10 lens (the table→win chain). DIAGNOSTIC — policy-side instrument,
ZERO src/js changes, ZERO default behavior change.

Canon: docs/CANON.md, docs/TABLE.md (the 2026-10-10 deed gate =
`deedGateReady()` becomes the FULL seat), docs/MONSTER-WAVES.md (wave law +
design call #4 combat-readiness bar). The wave-5 door is
`standingDeferral(5)`: capped Standing ≥ t5=200 AND `waveUnlockReady(5)`
(four readiness bars: armored 4 @ P≥15, armed 6, tricks 3, veterans 2
living wave-4+ killers) AND peak<5. The old faced-experience bar
(standing≥200 + wave-4 faced distinct) was RETIRED by design call #4
(2026-10-16): "a village could flee its way into a war it can't fight."
The instrument records w4-distinct-killed (the successor observable) where
the old leg lived.

Context: the scale wall is now precisely drawn (sim-tabledeed, 2026-10-18):
national→lesser-invitation opens 15/16 on the competent substrate, but the
win chain needs the full seat or a lesser-seat path win. The full seat =
the deed gate (progression.js:588, 5/5/4/3/2 distinct fought per wave 1–5).
Wave-5 monsters cannot be fought until the wave-5 door opens — the deed
gate's w5 bar is downstream of THIS door. This arm enumerates the door's
legs and attributes which leg binds, per run.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sweep)

**PRIMARY QUESTION:** on the full winseat substrate, which leg of the
wave-5 door binds per run, and is the door reachable before villages die
(or win)?

**DIAG-GO: ≥15/16 runs (≥95%) with the binding leg FULLY ATTRIBUTED** —
each attributed run names: (a) the binding leg (or binding set), (b) the
day the bar could have cleared, (c) the day the village died/won, (d) the
gap. A miss is NO-GO, never re-scored (§14).

**Definitions (fixed before the sweep):**
- LEGS: STANDING (capped = war + diplomacy + min(plenty,100) ≥ t5=200),
  ARMOR (4 living fighters armored @ P≥15), WEAPONS (6 armed),
  TRICKS (3 counters known), VETERANS (2 living wave-4+ killers).
- firstSat[leg]: first day the leg was satisfied (null if never).
- Runs that UNLOCK w5: bindingLeg = the leg with the latest firstSat
  (the last to clear — the classic binding constraint).
- Runs that never unlock: binding set = the legs short on the most
  door-in-play days (days where wave-4 was unlocked, the village alive,
  unwon — the door is "in play" only then), ranked by short-days and by
  terminal shortfall (demand − final value).
- couldClearDay: wave5Day for unlocked runs; "never" for never-unlocked
  (the door never opened — the missed window is what matters).
- other4FirstJointDay: first day all non-binding legs were simultaneously
  satisfied (the day the binding leg started keeping the door shut alone).
- endDay/endKind: win day (Game.won), loss day (endReason), or 180
  (survived).
- gap: unlocked → endDay − wave5Day (post-door survival); never-unlocked →
  endDay − other4FirstJointDay (days the village held the other 4 legs
  while the binding leg kept the door shut; null if the other 4 never
  jointly satisfied).

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail
max) — the honest surface for a wave-5 question.

**Seeds:** 8 FRESH 65101–65108 (verified unused as sim seeds — see below)
× {leadfeast, belongfeast} = 16 runs. 8 seeds IS the pilot budget here
(seeds ~3s each; the diagnostic needs the census, not a confirm).

**Substrate (full winseat — EXACTLY evidence/2026-10-18/sim-vetwindow.md):**
`withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))`.
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 VETREL=1 REPOSITION=1
(VETREL/REPOSITION for the vetrel/reposition composition; SEATDRIVE=1
explicit — the win-side stack, NOT the w5gate pre-seat SEATDRIVE=0).

**Instrument (scripts/ only):** per run per day: every w5 door leg
(standing raw/capped + war/dip/plenty split, armored, armed, tricks,
veterans, the demand, the short list), deferral(5) state, deed-gate bars
(`deedGateReady()`: w1–w5 distinct fought, contests, crises, stage, rank,
ok), w4 kills + w4-distinct-killed + w4-killer count, unlockedWave(),
village alive/dead. All reads are engine-pure (verified: `waveUnlockReady`
/ `waveCombatReadiness` / `villageStanding` / `standingDeferral` /
`deedGateReady` / `monsterCounterKnown` write no state); the DET gate
pins instrument-on vs instrument-off byte-identical.

**Proof:** scripts/test-w5legs-20261018.js — (a) bar-shape fixtures: the
demands the instrument measures match standingCfg (t5=200, plentyCap=100,
{armored 4@P15, armed 6, tricks 3, veterans 2}) — fails LOUD if the game
bar moves; (b) attribution-logic fixtures on synthetic leg histories
(known binding legs, ties, all-satisfied-but-never-jointly,
unlocked-run-last-to-clear); (c) DET: instrument-on vs bare
byte-identical trajectories (2 seeds × 60d); (d) SMOKE both policies
drive with legs recorded; (e) attribution completeness on a REAL sweep
run (≥95% of the corpus attributed — the DIAG-GO's own machinery,
self-checked).

**Deliverable:** the binding-leg ranking across the corpus + a lever SPEC
for the binding leg (what a lever-10 arm would move, with a pre-registered
GO threshold proposed for the next run) + plain-words portraits of the
villages that got closest to the door + one near-door transcript
sense-test (SENSE-TESTING LAW).

**No balanced panel** (§15): pure diagnostic, no lever, no before/after —
the corpus summary + leg-attribution table are attached and the reason is
noted here.

## Instrument

- `scripts/w5legs-sweep-20261018.js` — 16-run sweep (8 fresh seeds × 2
  policies, full winseat, 180d death-aware). Daily `policy.daily` hook
  records the full leg vector; per-seed JSONs (byte-comparable, no
  timestamps) to `evidence/2026-10-18/perseed-w5legs/<policy>/`.
  SMOKE / DET / FIDELITY modes.
- `scripts/w5legs-analyze-20261018.js` — attribution: binding leg per
  run, firstSat days, couldClear/endDay/gap, binding-leg ranking,
  missed-window stats. Corpus summary + leg-attribution table attached.
- `scripts/test-w5legs-20261018.js` — proof (see pre-registration).

## Results

SWEEP COMPLETE (2026-10-18). 16/16 runs, 0 errors. Instrument:
`scripts/w5legs-sweep-20261018.js` (full winseat substrate —
`withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))`,
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 VETREL=1 REPOSITION=1; seeds
65101–65108 × {leadfeast, belongfeast} — verified fresh as sim seeds:
the 65101–65103 content hits are kcal-value artifacts in other seeds'
files, zero per-seed files; 180d death-aware). Per-seed JSONs:
`evidence/2026-10-18/perseed-w5legs/<policy>/` (16/16 present).

Proof: `scripts/test-w5legs-20261018.js` — 27/27 GREEN (bar-shape
fixtures 7/7 pinning t5=200/plentyCap=100/{armored 4@P15, armed 6,
tricks 3, veterans 2}; attribution-logic fixtures 14/14 on synthetic
histories F1–F6; DET 4/4 byte-identical instrument-on vs bare;
SMOKE both policies with legs recorded). One proof-script bug found
and fixed during the run (the SMOKE line filter trimmed the first
line's leading spaces — the instrument was innocent).

ATTRIBUTION (the pre-registered primary): **16/16 runs fully
attributed, 0 unattributed → DIAG-GO met (bar ≥15/16).**

The door's five legs, measured per day per run from the engine's own
reads (`waveUnlockReady(5)`, `villageStanding()`, `standingDeferral(5)`):

| leg | demand | runs ever satisfied | runs in binding set |
|---|---|---|---|
| VETERANS (2 living wave-4+ killers) | 2 | **0/16** | **16/16** |
| STANDING (capped ≥ 200) | 200 | 7/16 | 9/16 |
| ARMOR (4 @ P≥15) | 4 | ~9/16 | 9/16 |
| WEAPONS (6 armed) | 6 | 15/16 | 0/16 |
| TRICKS (3 counters known) | 3 | 16/16 | 0/16 |

Primary binding leg (most short-days): standing 9, veterans 4, armor 3.
**Veterans is the binding leg: in the binding set on all 16 runs and
never satisfied on any run.** The standing-primary count is inflated
by LEGS-order tie-breaking on runs where standing and veterans were
both never satisfied (including 5 runs where wave-4 never unlocked —
the door was never in play there).

The veteran wall, precisely: **maxVet = 0 on 15/16 runs, 1 on 1/16
(belongfeast-s65107, a single transient wave-4 kill); total wave-4
kills across the corpus = 1.** Villages that reach wave 4 (11/16)
FIGHT wave-4 monsters — the deed gate's w4 bar (distinct fought)
reaches 7 on belongfeast-s65104, 2–3 on five more — but the kills
don't land (waveKillLog w4kills = 0 on 10/11 wave-4 runs). The veteran
leg doesn't bind because veterans die; it binds because **wave-4 kills
don't happen.**

The 4 runs where the other 4 legs were jointly satisfied (the door
held shut by veterans alone — the missed window):
- belongfeast-s65104: other4joint d92, won d98 — 6d missed window.
  7 distinct wave-4 fought, cap 209, arm 7/4, wpn 7/6, trk 19/3, vet 0.
- leadfeast-s65103: other4joint d88, won d96 — 8d missed window.
- leadfeast-s65104: other4joint d57, won d90 — 33d missed window.
- leadfeast-s65106: other4joint d83, survived d172 (wave-4 never
  unlocked — door never in play; 89d nominal window).

Could the bar have cleared before the village died/won? On the 3 won
runs above, YES — if the veteran leg had cleared by d85–92, the door
would have opened before the ~d90 win. The win (lesser-seat path)
fires at median d90 and truncates the surface: 11/16 wins, 0/16
wave-5. The door is not behind the win by a little — on the closest
runs it was 6–33 days of veteran-production away from opening
pre-win.

Wall numbers (winseat, this corpus): national 9/16, table 10/16,
wins 11/16, wave-4 11/16, wave-5 0/16, median survival 91d
(win-truncated), exiled 0/16. The deed gate (`deedGateReady().ok`)
never fired — its w5 bar needs wave-5 fought, which needs this door.

## Binding-leg ranking

1. **VETERANS** — in binding set 16/16, satisfied 0/16. The leg.
2. STANDING — in binding set 9/16, satisfied 7/16. Binds on runs
   where the win (~d90) arrives before standing matures to 200;
   partly a win-truncation artifact, partly real (2 lost runs never
   reached 200 by d73–75).
3. ARMOR — in binding set 9/16, satisfied ~9/16. Co-binds; the
   P≥15 bar is reachable (maxArm hit 4–7 on several runs) but not
   reliable.
4. WEAPONS, TRICKS — never bind (satisfied nearly everywhere).

Corpus summary + full leg-attribution table attached:
`evidence/2026-10-18/w5legs-corpus-summary.json`,
`evidence/2026-10-18/w5legs-leg-attribution.md`.

## Village assessment (plain words)

Sixteen villages lived on the full winseat stack. Eleven won (the
lesser-seat path, median d90), two were lost, three survived to the
horizon. The wave-5 door never opened for any of them — not because
they died, but because they won first, or because they couldn't finish
what the Mirror Draft started.

The villages that got closest to the door:

**belongfeast-s65104 (won d98)** — the model near-door village. Wave 4
opened d50. By d92 the village had everything the door asks except the
one thing: standing 209, 7 distinct wave-4 types fought, 7 armored at
P≥15, 7 armed, 19 tricks known — and zero wave-4 kills. On d97 the
scholar walked out to the ruins with Stan and Anatoliy, stood before
The Terms of Service, survived its fine print — and it got away. "No
meat, no trophy — but you're breathing, and now you know its moves."
The next day the village won on the lesser seat. Who was alive: a full
roster — the scholar, Stan, Anatoliy, Owen, Tashi, Thabo, Ingrid, Ruby,
and Wren of Emberhold walking in with tribute baskets. What was
missing: not a single wave-4 kill. The village could face the draft,
survive the draft, learn the draft's tricks — but not finish it.

**leadfeast-s65104 (won d90)** — the longest pre-win window. The other
four legs were jointly satisfied by d57; veterans alone held the door
for 33 days. The village had a month with the door ajar and never
blooded a killer.

**leadfeast-s65103 (won d96)** — 8 days with the other four legs
satisfied, veterans at zero.

**leadfeast-s65106 (survived d172)** — wave 4 never unlocked, but by
d83 the village had standing, armor, weapons, and tricks. The door was
never in play; the village had everything except the wave-4 window
itself.

Who thrived: scholars who survived wave-4 encounters — trick-learning
worked (15–23 counters known on the closest runs); villages that built
standing to 200+ through war, bonds, and bread. Who died and why:
almost nobody in the wave-4 window — 11/16 villages won. The door
wasn't behind death; it was behind the win. What was missing: the
finishing blow. The capability gap isn't finding wave-4 monsters (deed
w4 up to 7), surviving them (sighting 1/2 toward tricks), or gearing
for them (armor 4–7 @ P≥15) — it's killing them.

## Sense-testing

Read end to end: belongfeast-s65104 d89–98 (the closest-to-door
window; transcript at
`evidence/2026-10-18/w5legs-transcripts/belongfeast-s65104.txt`,
1016 say lines).

- The d97 Terms of Service fight is the diagnostic in miniature: a
  real wave-4 fight, honestly narrated, ending in escape rather than
  death or kill. "It got away. No meat, no trophy — but you're
  breathing, and now you know its moves." The trick-learning
  progresses (1/2 sightings); the kill doesn't land. The fiction knows
  exactly what happened.
- The Arc IV beat the same day is seat-honest: "though unfinished, are
  undeniable" — the lesser seat, priced for what was built. The win
  that truncates the door is the designed path working, not a bug.
- Daily life around the door is coherent: tribute baskets from
  Emberhold, water duty, the cistern running short, gossip by the fire.
  The village feels like a place, not a spreadsheet.
- Robotic bits (filed as findings, not sense failures): "Too heavy.
  Carrying 26.4/26 kg." ×20 in a row; "The well won't fill itself."
  4–5× daily; "Not mid-fight — finish it first." ×~30 during the
  Terms of Service fight (the policy hammering actions the fight
  forbids).
- Judgment: meaning and coherence pass. The near-door stretch reads
  as a village that can face the draft but not finish it — which is
  exactly what the numbers say.

## Lever SPEC for the binding leg

**Target leg: VETERANS** (in binding set 16/16, satisfied 0/16; the
only leg that alone held the door shut on the 4 closest runs).

**The mechanism the SPEC must move:** wave-4 kills don't land. The
village fights wave-4 monsters (deed w4 = 2–7 distinct fought on
6/11 wave-4 runs) but the kills don't happen (1 wave-4 kill in 16
runs). The veteran leg is downstream of a kill drought, not a
survival failure — veterans aren't dying, they're never being made.

**Proposed arm (lever-10, policy-side, zero game-code):**
`sim-w4finish` — a wave-4 finishing layer. When wave 4 is unlocked
and wave 5 is not, the policy commits its best-equipped fighters to
FINISH wave-4 fights it already engages: no early retreat once
committed, counter-use when known, focus fire, and kill-attribution
spread across two fighters (the door needs TWO living killers, not
one hero). This is NOT the killed vetblood/vetstaff line (no new
hunts, no staffing, no kill-steering yield) — it converts the fights
the village already takes (deed w4 proves they happen) into kills.
Env-gated, default OFF.

**Pre-registered GO proposed for the next run** (same winseat
substrate, same 16 seeds 65101–65108, 180d death-aware):
- PRIMARY: runs with ≥1 wave-4 kill — baseline 1/16 → **GO ≥5/16**.
- SECONDARY: runs with maxVet ≥2 (the actual door leg) — baseline
  0/16 → **GO ≥2/16**.
- GUARDRAILS: no new death mode at n≥3; wins ≥ baseline−2 (9/16 —
  don't break the lesser-seat path); median survival ≥ baseline−25d.

**Why this SPEC and not the demand:** lowering the veteran demand
(2→1) is a design change (Steve's call), and even demand=1 is
unreachable here (maxVet=1 on 1/16, transiently). The kill drought
is the root; the demand is downstream of it. If the finishing arm
moves kills but the demand still binds, the NEXT spec revisits the
demand with kill-flow evidence.

**Standing note:** standing is the secondary bind (satisfied 7/16;
the ~d90 win truncates its maturation on the rest). Once veterans
move, standing becomes the next door — a future arm may need to
address the win-truncation (the door sits behind the lesser-seat
win) or standing acceleration. Flagged, not spec'd here.

## Metric review

1. **DIAG-GO (≥95% attribution): 16/16 → GO, no re-scoring.** Every
   run names its binding leg/set, firstSat days, couldClearDay,
   endDay/endKind, and gap.
2. **Tie-breaking wrinkle (noted, not re-scored):** the primary-leg
   count uses LEGS-order tie-breaking, which inflates standing's
   primary count (9) on runs where standing and veterans were both
   never satisfied. The in-binding-set counts (veterans 16, standing
   9, armor 9) are the honest ranking and are what the verdict uses.
   A future instrument revision could split ties fractionally.
3. **"The day the bar could have cleared"** for never-unlocked runs
   is "never" by construction; the operational gap is the missed
   window (other4joint → end). This worked — 4 runs had computable
   missed windows (6–89d).
4. **No balanced panel** (§15): diagnostic, no lever, no before/after.
   Corpus summary + leg-attribution table attached
   (`w5legs-corpus-summary.json`, `w5legs-leg-attribution.md`); the
   reason was pre-registered.
5. **Win-truncation:** 11/16 runs end in the lesser-seat win at
   median d90. The attribution treats wins as terminal (endKind=won)
   — correct for the question "is the door reachable before villages
   die?", since the win is the run's end. A future lever run on the
   veteran leg should keep this corpus as its baseline.

## Out-of-arm findings

1. **Veterans aren't dying — they're never made** (this arm's core
   finding, IN-arm): the wave-4 kill pipeline is dry (1 kill/16 runs)
   while wave-4 fights happen (deed w4 up to 7). The veteran leg's
   bind moved from survival (old bar) to production (new bar) to
   **kill-conversion** (this census).
2. Filed to `hidden_files/sim-findings.md`: "Too heavy" weight spam
   (×20), "Not mid-fight" action spam (×~30/fight).

## Files

- scripts/w5legs-sweep-20261018.js — sweep + SMOKE/DET/FIDELITY modes (this run)
- scripts/w5legs-analyze-20261018.js — attribution aggregator (this run)
- scripts/w5legs-transcripts-20261018.js — SAY-line probe for near-door windows (this run)
- scripts/test-w5legs-20261018.js — proof: bar-shape + attribution fixtures, SMOKE, DET (this run)
- evidence/2026-10-18/perseed-w5legs/ — 16 per-seed JSONs (this run)
- evidence/2026-10-18/w5legs-corpus-summary.json — corpus summary (this run)
- evidence/2026-10-18/w5legs-leg-attribution.md — leg-attribution table (this run)
- evidence/2026-10-18/w5legs-transcripts/belongfeast-s65104.txt — near-door transcript (this run)
- evidence/2026-10-18/sim-w5legs.md — this file
- ZERO src/js changes, ZERO scripts/policies changes (instrument-only arm)
