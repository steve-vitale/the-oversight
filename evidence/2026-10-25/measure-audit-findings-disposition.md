# Measurement-audit findings disposition — 2026-10-25

Audit of sim-findings instrumentation items. One fixed with a proof test;
the rest documented with the exact gap and the named next step. Nothing here
changes game balance, design, or any steve-call item.

## FIXED

### #40 — fight-census undercount (comes-apart fights)
FIXED by commit `22f23b69d` (this audit): `scripts/fightopen-census-20261025.js`
+ `scripts/godpath/test-fightopen-census-20261025.js` (15/15 GREEN).
Method: tbfight-property census (the #434 trickfunnel hook pattern — covers
all five initiation paths, not just startCombat) plus a tbEnd close wrapper.
Proof: a follows:false heckler placed 6 tiles from the player routes in the
opening tbAdvance ("It comes apart — no one in reach, no one chasing" ->
'routed' at round 1); the census records 1 assignment + 1 routed outcome
while a dmg-audit-style startCombat wrapper records 0. A live adjacent
control fight is recorded by both (2 assignments, 1 wrapper record for the
live fight only). Future fight censuses MUST use this hook, not a
startCombat wrapper — the wrapper class undercounts by exactly the
comes-apart fights.

## DOCUMENTED (not built — exact gap + named next step)

### #49 — scholar outing-frequency gap
Gap: the r18 killroad diagnostic counts fights (startCombat/fieldFight) but
not trips or fight-assess walk-aways, so the scholar-activity delta behind
the wave-3 kill collapse (outing frequency vs encounter composition vs
declined encounters) is unmeasured. Verified 2026-10-25: no forageTrip
telemetry exists in src/js — the instrument must be policy-side.
Named next step: a trip-counting instrument wrapping the POLICY's trip
entry, NOT the competent module object (winseek destructures
forageTripSeedFirst at import, so a module-export wrap is bypassed). It must
count three separate series per day — trips started, encounters assessed,
encounters declined (walk-aways) — plus fights started, so the three-way
split is measurable. Proof requirement: a scripted policy run showing the
three series counted separately, plus a DET gate (instrument-on ==
instrument-off trajectories).

### #134 — person-fight deaths invisible (no combat_start tele)
Gap: alien-duel / uprising / betrayal fight paths bypass startCombat, so no
combat_start tele exists (s22 d144: scholar killed by a hostile 'Stranger'
alien duelist with only a start-less combat_end + death in telemetry).
Instrument-only path (NOT built here): observer-side capture via the
tbfight-property hook — the #40 census instrument in this audit already
records ALL tbfight assignments including bypass paths (justice.js:666
uprising, party.js:668 betrayal); extending it with a person-fight subtype
classifier (alien-duel / uprising / betrayal / other-person, per the r27
instrument's classification) closes the observer side.
OPEN DESIGN QUESTION (needs a ruling, not an instrument): whether
alien-duel paths should emit combat_start or their own tele type from game
code. Emitting a new tele type changes game telemetry output — that is a
design decision, so it is documented here, not built.

### #140 — person-fight subtype split has no live coverage
Gap: the r27 instrument (scripts/sweep-w5census-r27-20261014.js) is proven
22/22 on fixtures and classifies alien-duel/uprising/betrayal/other-person,
but its 8-seed suite fired zero person-fights — the split is unmeasured on
live trajectories. The #133 engine question stays OPEN (see #134).
Named next step: a person-fight-rich seed set (uprising-prone or
alien-active trajectories) swept with the r27 instrument (or the extended
#40 census). NOT more seeds of the same competent policy — the substrate,
not the seed count, is what failed.

### #529 — raid-day outcome lens (havenRaidTick outcomes on hunt days)
Gap: no raid-outcome lens exists anywhere. Verified 2026-10-25: the
emptydraft corpus (201 raid-nights) records defender COMPOSITION only
(away / sheltered / wounded / benched / engaged); raidgarrison records raid
DEATHS only (windowRaid / windowScholarRaid); no corpus records driven-off
vs lingering vs pillage outcomes or hunt-day flags. The window-attribution
instrument covers raid deaths by cause regardless of source, which is a
different question.
Named next step: a raid-night recorder instrument (havenRaidTick hook:
outcome class per night + hunt exposure that day + pantry-gorge delta)
with proof on scripted raids (sortie-driven-off, 6-day-valve linger, gorge
pillage), then a hunt-day vs matched-day comparison.
Do NOT build the #705 draft-aware muster lever — that is Steve's call
(muster discipline "outlast it, not feed it" is his design).

### #67 residual — intra-village violence (measurement exists; sub-criterion open)
Status: the measurement EXISTS and the plentyb 49/217 figure is explained
(intraviol census: 0/178 villager-on-villager deaths across 24 runs; the
49/217 does not replicate — likely player-vessel kills counted as
"villager"). Justiceladder (2026-10-20) GO: 141 moot verdicts, all five
rungs fire, control road 0/8.
Residual, still open: rung E's villager-on-villager death sub-criterion
never fired (0/16) — ambush KILLS and villager-on-villager lethal justice
remain unreachable. Named next step: a CONSTRUCTED scenario (scripted
lethal-justice setup) or a more violent policy — not more seeds of the
larceny-leaning policy, which already proved the lane reachable without
producing a vv death.

## Enabling pattern (already landed, reused here)
- #434 (tbfight-property hook, trickfunnel instrument 2026-10-16, landed
  `c698e2b11` per triage): the hook every future TB-fight instrument must
  use. The #40 census in this audit is built on it.
