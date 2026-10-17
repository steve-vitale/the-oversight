# sim-wave4census — WHICH readiness bar binds wave-4 unlock (2026-10-17)

Run: flesh-out loop arm sim-wave4census (axis scale-onramp, the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first). ZERO src/js changes,
ZERO scripts/policies changes — read-only diagnostic arm.

## The question

wincensus-c (the 4th fresh-seed win confirm, evidence/2026-10-17/sim-wincensus-c.md):
wins replicate (30/32 armed vs 0/32 control on two fresh seed sets) but wave-4/5
reachability doesn't (1/34 non-winning runs reached wave 4). On the non-winning
runs, WHICH of Steve's design-call-#4 readiness bars binds the wave-4 unlock —
armor (4 fighters P≥15), weapons (5 armed), counters (3 known), or veterans
(2 living wave-3 killers)? Context: vetrel made the veteran channel reliable
as a policy layer (18–0 companion wave-3 kills armed vs control, wave-4
unlocks 3v1 at confirm, evidence/2026-10-16/sim-vetrel.md) — but vetrel was
NOT in the wincensus-c substrate (VETREL unset, seatdrive doesn't compose it).
Readiness is "reachable but rare" — this arm names the binding bar.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**PRIMARY (diagnostic GO):** 100% attribution of the 34 non-winning
wincensus-c runs to a binding constraint on the wave-4 unlock path. Every
run gets exactly one attribution from this taxonomy (implemented in
scripts/wave4census-lib-20261017.js, fixed before any sweep ran):
- `armor` / `weapons` / `tricks` / `veterans` — a single readiness bar present
  in the engine's own `short` (failing-bars) set on ALL deferral days.
  Deferral day mirrors the defer4 hold in villageStandingTotal()
  (src/js/standing.js): raw Standing ≥ t4 AND !ready AND peak < 4.
- `multi:a+b` — 2+ bars co-bind (non-empty intersection, >1).
- `none-single` — deferral days exist but the short-set intersection is empty
  (the binding bar rotates; documented, never re-scored).
- `standing` — zero deferral days AND wave 4 never released: the scale/
  on-ramp bar bound, readiness was never the constraint (maxRaw < t4, with
  the number).
- `unlocked` — wave 4 released during the run (peak ≥ 4).
An unattributed run, or an instrument-error-voided run, is NO-GO — never
re-scored against a friendlier taxonomy.

**Secondary (report-only):** per-bar distance-to-threshold distributions
(max value/demand per bar over the run); which bar is closest to its demand
most often; days-in-`short` shares over deferral days.

**Substrate (asserted up front — #312 lesson):** FEASTSCALE_R13=1
TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, ALLOWGATE2
unset, SEATDRIVE per side (0 control / 1 armed, EXPLICIT), policies
SD.leadseat/SD.belongseat — the EXACT wincensus-c substrate, on the EXACT
wincensus-c code (see Substrate shift below). The sweep re-runs the 34
non-winning seeds (wins=0 in perseed-wincensus-c/); the 30 armed wins
truncate at the win (maxWave=3 on all wins), so their wave-4 readiness
is moot.

**Instrument (read-only):** once per day, two engine readers +
one state read, zero writes, zero RNG draws:
Game.villageStanding() (the honest breakdown), Game.waveUnlockReady(4)
(the engine's own four-bar reader — design call #4), and
state._standingPeakWave (the ratchet the gate writes). The det-gate proves
byte-identical day-hash trajectories with the instrument attached vs bare
(in-process pairs, 60d, 2 policies × 2 seeds); any divergence = instrument
not neutral = STOP.

**Horizon:** 180d death-aware (same as wincensus-c).

**Proof:** scripts/test-wave4census-20261017.js — (a) attribution
completeness on fixtures: 11/11 (all 8 taxonomy branches + 2 loud-failure
branches + the armored/armed key-mapping regression); (b) det-gate
byte-identical (60 day-hashes × 2 pairs); (c) SMOKE schema-clean, 12/12
snapshots, 0 instrument errors.

## Substrate shift (found mid-run — read before the results)

The first re-run batch on current master (7b2f6907) DIVERGED systematically
from the wincensus-c trajectories: 17/20 completed re-runs diverged on days
and/or endReason (e.g. belongfeast-armed-s1940809: 51d village-lost →
182d survived; leadfeast-control-s1060511: 138d wave-4 → 166d wave-3).
The instrument is NOT the cause — the det-gate proves byte-identical
trajectories instrumented vs bare, in-process, on both code versions.

Root cause: the substrate moved between the wincensus-c sweep and this
arm. The sweep ran ~06:13–09:30 UTC 2026-10-17 on master's tip at ~06:11
UTC (1d565b52); three game-code changes landed 09:12–09:22 UTC, before
this arm's task was spawned (09:47 UTC):
- fd8c1c8a sim-phantomfood-b: stockSurplus remainder-carry (game.js —
  pantry kcal accounting)
- 8433c269 sim-mergereval-b: stockSurplus merge gate (game.js — pantry
  merge revaluation killed)
- f59e1e69 sim-spiralgate-b: hunger-spiral alarm gate + _hungerVid stamp
  fix (engine/calories.js)
All three touch food/hunger/pantry mechanics — exactly the systems that
decide early survival on hard seeds. The readiness gate itself
(src/js/standing.js, design call #4) is BYTE-IDENTICAL between the two
commits (same waveCombatReadiness, same readyDemand) — the object of
study didn't move, the ground under it did.

Per the task's "re-run the same substrate/seeds" instruction, the sweep
below runs on a plain-directory extraction of 1d565b52
(~/workspace/wave4census-oldcode/ — git archive, not a worktree, not
registered; the instrument scripts copied in unmodified). Proof re-run
there: ALL GREEN (det-gate byte-identical on old code too). This keeps
the PRIMARY literal: attribution of the wincensus-c trajectories, not
of post-food-fix trajectories.

**Reproduction confirmed:** old-code re-runs reproduce the wincensus-c
trajectories EXACTLY — 34/34 exact-day match, 34/34 exact-wave match,
34/34 same endReason (analyzer's divergence table). Including the one
wave-4 unlock (leadfeast-control-s1060511: 138d village-lost wave-4,
reproduced to the day).

## Results

**PRIMARY: GO — 34/34 runs attributed (100%), 0 instrument errors, 0
unattributed.** Per-seed JSONs: evidence/2026-10-17/perseed-wave4census/
(34 files, daily readiness snapshots).

### Binding-bar counts

| binding | n/34 | reading |
|---|---|---|
| veterans (single) | 11 | the veteran bar alone never clears |
| multi:armor+veterans | 18 | armor + veterans co-bind |
| standing | 4 | raw Standing never reached t4 (all four are s1940809, dead ~d50) |
| unlocked | 1 | leadfeast-control-s1060511 — the one wave-4 unlock |

**Veterans is in the binding set on 29/34 runs (85%). Weapons bind on 0.
Tricks bind on 0.**

### Deferral-day anatomy (3,131 deferral days across the 30 readiness-bound runs)

| bar | days in `short` | share of deferral days |
|---|---|---|
| veterans | 3,131 | **100.0%** — fails every single deferral day |
| armor | 2,605 | 83.2% |
| weapons | 283 | 9.0% |
| tricks | 0 | 0.0% |

### Distance-to-threshold (max value / demand over the run)

| bar | demand | median max | range | verdict |
|---|---|---|---|---|
| veterans | 2 | **1** | 0..1 | **never reaches 2 on any of 34 runs** |
| armor | 4 (P≥15) | 3 | 0..6 | reachable (6 max) but fragile — median below bar |
| weapons | 5 | 11 | 10..12 | satisfied 2× over on every run — non-binding |
| tricks | 3 | 24 | 16..29 | satisfied 8× over on every run — non-binding |

**The answer: VETERANS binds.** It is the only bar that fails on 100% of
deferral days and never reaches its demand on any run. Armor is the
secondary co-binder (fails 83% of deferral days; reachable — max 6 — but
decays as armored fighters die). Weapons and tricks are structurally
non-binding on this substrate (satisfied 2–8× over demand everywhere).

### The veteran mechanism (why 2 living killers never happens)

The demand is 2 LIVING roster members with a wave-3+ kill in
state.waveKillLog (standing.js waveCombatReadiness: `isLiving(e.by)`).
Median max veterans = 1, range 0..1 — villages touch 1 veteran but never
hold 2. This is the sim-arming diagnostic confirmed on the win-side
substrate: the kill channel is scholar-centric, and killers die — the
bar demands two living killers from a channel that produces at most one
at a time. The one unlock (s1060511) is the exception that proves it
(see below).

### The one unlock: a transient (leadfeast-control-s1060511)

Wave 4 released at day 124 ("The Mirror Draft opens") — but the daily
snapshots show veterans=1, ready=0, short=veterans on day 124 itself.
The release was a sub-day transient: two living veterans coincided
briefly (a second killer bloodied then died the same day), the monotonic
peak ratchet caught it (peak=4, never re-locks — #289), and by the next
snapshot only 1 veteran remained. The village never SUSTAINED readiness —
and died 14 days later (d138) in the wave-4 overtime meatgrinder. The
gate opened on a flicker, not on a standing army.

## Village assessment (plain words)

These are the villages the win-side stack leaves behind. The modal
non-winning village: reaches national (26/32 controls), grinds the
wave-3 overtime for 100+ deferral days with raw Standing 300–600 (3–6×
the t4 door), learns counters prodigiously (16–29 known, 8× the tricks
bar), arms widely (10–12 fighters with weapons, 2× the weapons bar) —
and never unlocks wave 4 because it cannot keep two killers alive at
once. The readiness fiction the village hears is honest: "The next act
is not for strangers... blood your fighters (1 of 2 veterans)" — and it
hears it for months.

Who thrived: the scholars and fighters who learned counters (Paparazzo
d78, Redactor d111 on s51977) and stood down wave-3 monsters round after
round. Who died and why: the kill channel's own — everyone who lands a
wave-3 killing blow seems to die soon after, which is exactly why the
veteran count never compounds. The four s1940809 villages never even
reached the door (dead ~d50, maxRaw 40–85 < 100) — the hard seed kills
before Standing opens.

What was missing: a second living killer. Not gear (armor is craftable
and spawnable, and reached 6/4 on the unlock run), not knowledge
(counters 8× over), not weapons (2× over) — blood that survives.

## The named next

**Compose vetrel's companion-veteran channel into the win-side stack**
(or equivalent). Vetrel (scripts/policies/vetrel.js, VETREL=1, landed
but default-OFF, not composed into seatdrive) made the veteran channel
reliable as a policy layer: 18–0 companion wave-3 kills armed vs control
across 40 runs, wave-4 unlocks 3v1 at confirm
(evidence/2026-10-16/sim-vetrel.md). This census proves the veteran bar
is THE binding constraint (100% of deferral days, 0/34 runs at demand)
— the lever that moves it is already built and proven. The remaining
questions are compositional, not mechanical: does the win-side stack
adopt the companion-veteran driver, or does Steve loosen the 2-veteran
demand (a "sim starting point" per the standingCfg comment — his call),
or does the bar change shape (e.g. count veteran kills rather than
living veterans — a design call with fiction consequences)?

Second-order: armor's fragility (median 3 < 4, decays as fighters die)
is the co-binder on 18/34 — worth watching, but not the named next;
fix veterans first and re-measure.

## Metric review (§14 — binding, never re-scored)

1. **Substrate shift (above):** the PRIMARY assumed current master ==
wincensus-c substrate. It wasn't (three food-code commits landed
09:12–09:22 UTC). The arm detected the divergence (17/20 re-runs
diverged), diagnosed it (food-code shift, readiness gate byte-identical),
and re-ran on the exact wincensus-c code (1d565b52 extraction) —
34/34 exact reproduction. Corrected rule for future census arms:
assert the sweep-time commit, not just the policy env; a same-day
re-run is not the same substrate after any src/js landing.

2. **Key-mapping bug (caught by the proof's new fixture):** the first
analyzer run zeroed armor/weapons maxVal (snapshot keys are
armored/armed, bar names are armor/weapons). The binding verdict was
unaffected (it reads the engine's `short` array, not maxVal), but the
distance secondary was wrong. Fixed in wave4census-lib-20261017.js
(KEYMAP) + proof fixture (11) locks it. The numbers above are post-fix.

3. **The `standing` attribution on s1940809:** these runs died before
the Standing door opened (maxRaw 40–85 < 100). The taxonomy handles
them honestly as "not a readiness bind" rather than forcing a bar.
No re-score needed — the category existed in the pre-registration.

4. **Transient unlock vs sustained readiness:** the taxonomy's
`unlocked` branch fires on peak ≥ 4, but s1060511 shows the unlock can
be a sub-day flicker the snapshots never see at v=2. A future census
should capture intra-day veteran peaks (or the waveKillLog) to
distinguish "sustained readiness" from "ratchet caught a flicker."
Not re-scored here — documented as the next instrument refinement.

## Convergence

**converging.** The diagnostic GO is met (100% attribution), and the
binding bar is named with a mechanism: veterans, the living-killer
requirement, failing 100% of deferral days. This sharpens the
readiness-gate steve-call (#427): the selectivity question is now
specific — is the 2-living-veteran demand (never met on 34 runs, opened
once on a sub-day flicker) the intended tightness, or should the
proven vetrel companion channel join the win-side stack? The axis
stays scale-onramp; the next arm is compositional (vetrel × seatdrive)
or a Steve ruling on the demand.

## Sense-testing (SENSE-TESTING LAW)

**1. leadfeast-control-s1060511 d110–138 (the unlock and the death).**
Day 124: "📡 RATINGS ARE UP... Wave 4 talent has been released. The
Mirror Draft opens." — the release beat fires with veterans=1 in the
same day's snapshot: the fiction announces an opening the readiness
bars say isn't there. What follows is coherent and grim: Jovan dead d124
("Every link Haven has shakes", tributes pressed), Sigrun d129, Ulyana
d130, overtime ×6, village dead d138. The story the beats tell — "you
opened a war you couldn't staff" — matches the measured mechanism
(transient unlock, no sustained readiness). The fiction is honest about
the consequences, silent about the flicker.

**2. belongfeast-control-s51977 d78–138 (national, never unlocked).**
Counters learned (Paparazzo d78, Redactor d111 — "💡 COUNTER LEARNED"),
overtime grinding ×1→×6 from d103, village alive at d174. The village
does everything the readiness fiction asks — learns, arms, bleeds —
except produce the second living killer. The hold beat the village
would hear ("blood your fighters (1 of 2 veterans)") names the true
bind. Coherent: the village's lived experience IS the measured bar.

**3. The s1940809 pair (dead ~d50, both sides).** No deferral days, no
hold beats — the Standing door never opened (maxRaw 40–85). These
villages died in the wave-3 meatgrinder before readiness was ever a
question. The `standing` attribution is the honest one: the scale
on-ramp bound, not the readiness gate.

Sense verdict: the readiness fiction (hold beats naming the short bars)
tracks the measured bars. The one dishonest note is the release beat
on s1060511 firing for a flicker-unlock — a transient the village
couldn't have distinguished from a real opening, and it cost them the
village.

## Files

- scripts/wave4census-lib-20261017.js — instrument + attribution (pure)
- scripts/wave4census-sweep-20261017.js — sweep (exports runWave4census)
- scripts/wave4census-analyze-20261017.js — analyzer
- scripts/test-wave4census-20261017.js — proof (11/11 fixtures + det-gate + SMOKE, ALL GREEN)
- evidence/2026-10-17/perseed-wave4census/ — 34 per-seed JSONs (daily readiness snapshots)
- evidence/2026-10-17/sim-wave4census.md — this file
- ZERO src/js changes, ZERO scripts/policies changes (read-only arm)
