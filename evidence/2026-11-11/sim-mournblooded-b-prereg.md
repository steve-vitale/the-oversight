# sim-mournblooded-b — PREREG (Loop B arm 3, run fleshout-loop-b-20261111T1830Z)

Fix backlog #472 (sim-vetcompose sense reads #2/#3, evidence/2026-10-17/sim-vetcompose.md):
when a blooded veteran dies between hold-beat snapshots, the hold beat silently
falls back from "(1 of 2 veterans)" to "(0 of 2 veterans)" — the village hears
the bind named honestly but gets no fiction for the loss. Fix: voice the fallen
veteran — one short eulogy line naming them, in the hold beat's voice (📡 System
broadcast, the voice `_standingHoldBeat` already speaks in).

## Canon

- docs/CANON.md read first. No canon doc covers the hold/standing area (the
  manifest lists no standing/hold doc; the readiness gate lives in code
  comments in src/js/standing.js and the 2026-10-16 design call #4 noted
  there). The fix invents no system: it voices a death the game already
  records, in a voice the game already uses, on a beat the game already
  fires. The eulogy wording follows the companionKillBeat precedent
  ("REMEMBER the name") — the kill beat told the village to remember the
  name; the eulogy says the name stays remembered after the person is gone.

## Design (decided from the death-path audit, before building)

- The hold beat is `_standingHoldBeat` (src/js/standing.js), weekly cadence
  (`_standingDeferBeat` day stamp, 7-day gate), naming short bars via
  `_readinessBarLine` — "(N of 2 veterans)" is the wave-5 demand-2 line.
- Trigger (Design A — inside the hold-beat path): at each hold-beat firing
  for wave key 4/5, diff the living-veteran SET against the set snapshotted
  at the previous firing (`state._standingVeteranSet[key] = {day, scholar,
  vids}`). A veteran present last beat and gone now is mourned ONLY with
  positive evidence of death: `state.village.deathSeen[vid]` (set by
  `registerDeath`, the one death hook — audited: every villager death path
  calls it: hurtVillager, tbVillagerFalls call sites, expedDeath, wound/
  thirst deaths, alien beam, betrayal, playerDeath) OR a `state.village.
  fallen` memorial entry (every path mirrors the fallen push). A count drop
  with no death evidence — exile, flight, roster move, snapshot noise —
  stays silent. The snapshot's scholar id is skipped: a scholar's death is
  succession fiction (playerDeath's own beat), not a hold-beat eulogy.
  The snapshot updates on EVERY firing, so a death is mourned exactly
  once, on the first hold beat after it.
- "Death-day transition" for the prereg: the hold-beat transition spanning
  the death day — the eulogy rides the first hold beat that reports the
  lowered count (weekly cadence; the beat is the village hearing about it,
  as the finding frames it). The eulogy does NOT fire at the death event
  itself; the hold beat is where the silence was.
- Boundaries (stated up front, not discovered later): no eulogy for a death
  before the hold began (no prior snapshot — the village never heard the
  veteran counted); no eulogy when the hold itself has ended (no beat
  fires); the scholar's death is never eulogized here; two veterans dying
  between beats get one line each. The veteran-count logic, the readiness
  gate, and all win prices/deed gates are untouched. A new
  `livingVeteranIds(w)` helper returns the SET behind
  `waveCombatReadiness`'s veteran count (count IS the set's size — the two
  cannot drift); the helper mirrors the existing log filter + isLiving
  rule, VETSHAPE branch included, and the test pins count == set size.

## Primary metric

Fixture/transcript (scripts/test-mournblooded-b.js): the eulogy line fires
on the death-day transition of a blooded veteran AND on no other
hold-beat transition in the fixture band.

- GO = 100% of death-day transitions voiced (1/1 in the band) AND 0 false
  voicings on the fixture's non-death transitions (5/5 silent).
- NO-GO = any death-day transition unvoiced, or any false voicing.

## Fixture band (one loadGame, seed 99107, no policy — constructed state)

Staged state (mirrors the vetcompose villages): wave 4 already released
(`state._standingPeakWave = 4`), standing capped 250 ≥ t5 200 (war 150
from ledger kills + plenty 100 from 6 feastLog entries), one wave-4
killer (VidA) → wave-5 readiness veterans 1 of 2, held on wave 5.
Hold beats driven through the real `villageStandingTotal()`; sysSay
captured per step; day advanced +7 between firings (the beat's own gate).

- T1 establish: first defer5 firing reads "(1 of 2 veterans)", no eulogy
  (no prior snapshot — nothing to mourn yet).
- T2 DEATH-DAY: VidA killed through the real `hurtVillager` pipeline
  (registerDeath + fallen + roster removal). Next firing reads
  "(0 of 2 veterans)" + eulogy naming VidA and the beast they blooded.
- T3 rise: a second villager (VidB) bloods a wave-4 kill → "(1 of 2
  veterans)", NO eulogy (count rose, nobody died).
- T4 no-change: same count → hold beat, NO eulogy.
- T5 roster move: VidB exiled via `removeVillager(VidB, 'exiled')` →
  "(0 of 2 veterans)", NO eulogy (no death evidence).
- T6 succession: the scholar bloods a wave-4 kill (counted veteran),
  then scholar death via `registerDeath` + `removeVillager(...,'killed')`
  + mantle to a new bearer → count drops, NO eulogy for the old scholar.

Also pinned: `livingVeteranIds(5).length === waveCombatReadiness(5).veterans`
at every step (count/set agreement); the "(N of 2 veterans)" count line
itself is unchanged before/after (same numbers on identical staging);
no eulogy line ever fires twice for one death.

## Method

- Proof: scripts/test-mournblooded-b.js (harness loadGame + setupGame,
  `captureSysSay` transcript + plain-say capture; asserts per step).
- Sense-check: full transcript of the T1→T2 passage read in full and
  judged for meaning/coherence (SENSE-TESTING LAW — never just counts).
- Wall numbers: N/A with reason — this is a fiction fix verified by
  fixture + transcript, not a band lever; no seed band runs. The
  before/after comparison is the transcript before the fix (silent
  fallback, reproduced by the fixture on unpatched code) vs after.
- Horizon/seeds: fixture only, seed 99107. No sim band, no policy.
