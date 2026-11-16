# sim-aidgate-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261116T0130Z`, axis winnability chain, arm
sim-aidgate-b (aid-gate link lever pilot). Branch `sim-aidgate-b`, base
master `126382932` (gatereach instrument just landed). Binding prereg:
this file — frozen here, judged in
`evidence/2026-11-15/sim-aidgate-b.md` without alteration. The GO bar
below is copied EXACTLY from `evidence/2026-11-15/sim-gatereach-b.md`
§11; the operational definitions under it pin down how each bar is
counted, and the "Frozen code facts" section records two deviations
from the §11 prose, with the code facts that force them.

## The question, in plain words

Both wave-5 field kills on the gatereach band came through aid fights
against lingering raiders at the Haven door, while the expedition path
produced one fight in 95 and zero wave-5 fights — but the gate/SEEK
machinery lives only in `expeditionMonster`, never in the door fights.
This lever routes aid fights through the gate's SEEK branch: when a
wave-5 lingerer is at the door, the fight consults the gate first; on
SEEK the fight opens with the trick, exactly as an expedition SEEK does
today; on outmatched the village still fights (it cannot walk away
from its own door) but the fight is narrated as a defense, not a hunt.
Nothing else changes: no gate bar, no standing or readiness number, no
win price, no deed gate, no table rule.

## The lever (frozen design)

- **Flag:** `AIDGATE=1` (env, default OFF — read live at the call
  site, never captured at load). Control leg runs with the flag
  unset; lever leg with it set. A pilot GO keeps the lever code
  behind the flag, default OFF; the confirm run (later) decides any
  default. A pilot NO-GO reverts the lever from game code entirely.
- **`src/js/win-plan.js`: new method `winPlanDoorGate(vid, mdef)`**
  (additive only — no existing function is edited). The door consult:
  party = self + `villagerFightAllies(vid)` (sensed only, the gate's
  own helper); armed/armored via the gate's own `gearOf`. Wave 5
  only (other waves return null, no consult). Returns
  `{seek:true, reason:'seek', party}` when party is 3, all armed and
  armored, AND `villageKnowsTrick(mdef.id)`; `{avoid:true,
  reason:'outmatched', party}` when party < 3 or not all armed /
  armored; `null` otherwise (party ready but trick unknown — the
  gate's trick-hold, ordinary fight proceeds and surviving it can
  still teach the trick). **Side-effect-free:** no plan is read in a
  way that creates one, no plan is seeded, no stage is changed, no
  counter is bumped. See "Frozen code facts" for why this is a new
  method rather than a literal `winPlanFightGate` call.
- **`src/js/comms.js`: `aidFight` consults the door gate** when
  `AIDGATE=1` and the lingerer's wave is 5, before `fieldFight`:
  - SEEK → `opts.trickOpen = true` (the fight opens with the trick)
    plus one say line naming the trick-opening at the door.
  - outmatched → one say line naming the fight a defense of the
    door (the village holds it anyway); the fight proceeds with
    unchanged opts.
  - null → unchanged fight, no line.
  - Non-wave-5 lingerers: no consult at all.
  The consult result is carried into the fight as
  `opts.aidGate = 'seek' | 'defense' | null` so the instrument can
  read it off the `fieldFight` call (the record is stamped after
  the fight returns, too late for the recorder to see).
- **`src/js/fieldFights.js`: the round-1 trick opener gains a
  per-fight switch.** `villagerTrickAction`'s opener branch fires
  when `process.env.FIGHTOPEN === '1'` (unchanged) OR
  `fctx.trickOpen` is true; `fieldFight` threads
  `opts.trickOpen` into `fctx` and records `rec.trickOpen`.
  No other opener condition changes (round 1, trick known,
  wave ≥ 4, the same five species). Expedition fights never set
  `opts.trickOpen`, so expedition behavior is unchanged; the
  global FIGHTOPEN default stays OFF.
- **Narration only, never mechanics:** the defense line changes no
  number. The SEEK opener is the lever's only mechanical effect.

## GO bar (copied EXACTLY from gatereach §11)

Pilot 8 seeds, confirm 16, on this band's seeds as control vs the
lever, 150d death-aware, policy `competent-answercourt-b`. GO iff ALL
hold: (1) wave-5 FIELD kills per unlocked village ≥ 1.00; (2) TB
kills per unlocked ≥ 0.5× control; (3) kill:death ≥ 0.92 where deaths
count encounter-row `vDie` PLUS same-day/same-beast 'villager combat'
deaths (gatereach §7 — the lead-only count under-prices kills); (4)
FACED-NOT-KILLED share among unlocked ≤ 0.20; (5) starvation ≤
control + 2 AND median survival ≥ 0.8× control. A miss is NO-GO,
never re-scored mid-run.

## Operational definitions (how each bar is counted)

- **(1) FIELD kills per unlocked** = wave-5 `vKill` outcomes on
  `w5encounters` rows, divided by unlocked villages
  (`maxWave ≥ 5` or unlock event). Control on the gatereach band:
  2 field kills / 3 unlocked = 0.67 — the lever must add at least
  one field kill on this band to pass (3/3 = 1.00).
- **(2) TB kills per unlocked** = (`waveKills['5']` − field kills)
  per unlocked village. Control: 7 TB / 3 unlocked ≈ 2.33, so the
  lever leg must hold ≥ 1.17. Guards against the lever cannibalizing
  the scholar's TB kills (e.g. by changing fight outcomes globally
  or starving the village of fighters).
- **(3) kill:death** = field kills / (encounter-row `vDie` on wave
  5 + same-day/same-beast 'villager combat' deaths), where a
  'villager combat' death is a per-seed `deaths` row with
  `kind === 'monster'`, `cause === 'villager combat'`, `who` equal
  to the killed beast's id, on the same day as a field kill of that
  beast on that seed. Kills in this ratio are FIELD kills only
  (total kills would let TB kills mask the field price — see the
  §7 correction below). **Corpus check (gatereach band): the only
  two such rows in the whole band are the two field kills' own
  death records** (d106 `cancellation`, d147 `finale_crew`, seed
  100825) — so on this band the term equals the field-kill count
  and the ratio reduces to fieldKills / (vDie + fieldKills). The
  bar is still judged exactly as written: at pilot scale it
  effectively requires zero lead-fighter deaths (1 vDie with 2
  kills reads 2/3 = 0.67, FAIL). If the ratio's denominator is 0
  (no field kills and no deaths), the bar FAILS (nothing priced).
- **(4) FACED-NOT-KILLED share** = unlocked seeds in class
  FACED-NOT-KILLED / unlocked seeds (classes per
  `analyze-wave5kill-b.js`). Control: 0/3 = 0.00.
- **(5) starvation** = per-seed starvation deaths summed over the
  band (same `isStarvation` rule as the gatereach analyzer);
  control is 3. **Median survival** = median of per-seed days
  (150d capped) over all 8 seeds; control is 150d, so the lever
  leg must hold ≥ 120d.
- **Instrument bars (must also hold for the verdict to be trusted):**
  corpus complete on all 8 seeds per leg (8/8 files, 0 parse
  errors); instrument errors = 0 on both legs; classified share of
  wave-5 field fights ≥ 0.90 per leg (same rule as gatereach).

## Frozen code facts (read before building — and the deviations)

- `src/js/win-plan.js` `winPlanFightGate`: party = self +
  `villagerFightAllies(vid)`; OUTMATCHED (avoid) for wave ≥ 4 when
  party < 3 or not all armed/armored; SEEK only when the plan stage
  is hunt/standing, the beast is the target wave/species, party ≥ 3
  armed+armored, AND the trick is known (else `trickHolds` → null,
  ordinary encounter proceeds).
- `src/js/villager-agency.js` `expeditionMonster`: the ONLY caller
  of the gate. A SEEK's only fight-mechanical effect there is
  `awareness: false` (the evade check is skipped); the trick
  opener itself lives in `fieldFights.js` behind the `FIGHTOPEN`
  env flag (default OFF).
- `src/js/fieldFights.js` `villagerTrickAction`: the round-1 trick
  opener fires only when `process.env.FIGHTOPEN === '1'` AND round
  1 AND trick known AND wave ≥ 4, for five species only —
  `congregation`/`reunion`/`editor`/`cancellation`/`audit`. Among
  wave-5 Producers that is **editor and cancellation only**;
  `spoiler` (prone, schedule-tied), `nielsen` (already opens
  boring), `network_note` (bad-note already fires round 1), and
  `rerun`/`timeslot`/`finale`/`finale_crew`/`finale_opening`
  (documented un-actuatable) are unaffected by the opener. The
  Blooded bonus (`standing.js` `villageBlooded`, 1.5× strikes /
  0.75× incoming) is separate and ALREADY fires in aid fights when
  the village is Blooded (gatereach §8, d147).
- `src/js/comms.js` `aidFight`: calls `fieldFight` with no
  `awareness` opt (aid fights never run the evade check — they
  always make contact) and scores a `vKill` through
  `recordWaveKill(..., 'aid-crisis', ...)`. Callers: game.js
  `resolveWildMonsterEncounter` / `resolvePatrol` route a lingering
  raider fight here while a crisis is open.
- Canon: `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  wave 5 "The Producers" (standing ≥ 200 AND wave-4 faced; damage
  50–130, HP 1000–2200), `docs/PARTY.md` (party cap 3 — the
  scholar's party; the villager party of 3 here is fighter + 2
  sensed allies through `villagerFightAllies`).

### Deviation 1 — the consult is a door method, not a literal `winPlanFightGate` call

The §11 prose says "`aidFight` consults `winPlanFightGate` first".
A literal call cannot serve at the door, for two code facts:

1. Its SEEK branch is unreachable without a hunt/standing plan
   (`if (plan && (plan.stage === 'hunt' || plan.stage ===
   'standing'))` wraps the whole SEEK block). A door fight is
   unplanned by nature — gatereach §5 showed the two KILLED
   villages had ZERO win-plan activity (no plans at all). A literal
   consult would return SEEK ~never at the door, and the lever
   would be inert by construction. The brief's own parenthetical
   defines door-SEEK as the readiness triple — "(party of 3
   armed+armored at the door, trick known)" — not the plan stage.
   `winPlanDoorGate` applies the gate's own readiness triple
   without the expedition-only plan-stage requirement.
2. Its avoid branch MUTATES plan state: with no plan it calls
   `winPlanSeedFromFight(vid, mdef, 'avoided')` (seeding a hunt
   plan for the lingerer); with a plan it resets the plan's stage
   and party. That seeding IS the §11 second-candidate lever
   (linger-hunt seeding), explicitly deferred — routing through the
   literal gate would smuggle it into this arm and conflate the
   two levers. `winPlanDoorGate` is side-effect-free by
   construction, and the prereg forbids the door consult from
   seeding plans.

The gate's verdict SHAPES are reused verbatim (`{seek}` /
`{avoid, reason:'outmatched'}` / `null`), and the expedition gate
itself is untouched — no existing function is edited.

### Deviation 2 — "opens with the trick" is supplied per-fight, not by SEEK as it stands

The §11 prose says the fight "opens with the trick, exactly as an
expedition SEEK does today". In live code that is not true of SEEK:
an expedition SEEK only skips the awareness evade, and the
round-1 trick opener is env-gated OFF (`FIGHTOPEN`, default OFF —
no live caller sets it), so even an expedition SEEK never opens
with the trick in live play. Aid fights never run the evade check
anyway, so a bare SEEK pass-through would change nothing
mechanically at the door. The lever therefore supplies the opener
itself, per-fight only (`opts.trickOpen` → `fctx.trickOpen`), for
door-SEEK fights — without flipping the global FIGHTOPEN default
and without changing expedition behavior. If the confirm run later
wants the opener on expedition SEEKs too, that is a separate
decision, not taken here.

### Correction — gatereach §7's "two villagers died" misreads the death rows

Gatereach §7 says two villagers died in 'villager combat' on the
kill days. Verified against the gatereach corpus
(`evidence/2026-11-15/perseed-gatereach-b/`, seed 100825): the two
rows (d106 `cancellation`, d147 `finale_crew`) are `kind:
'monster'` — they are the KILLED BEASTS' own death records
(`who` = the dead beast, `tbfightPresent: false`), not villager
deaths; no villager death row exists on either day, and the
cascade rows' `lastSessionVs` names a different beast
(`bulldozer` / `eater` — a stale session). Likewise the "7 died
inside the scholar's TB fights" are seven WAVE-5 MONSTERS the
scholar killed in TB fights (`kind: 'monster'`, `tbfightPresent:
true`), not seven villagers. The kill:death bar is still judged
exactly as §11 wrote it (see the operational definition of bar
(3) above); the correction is that its 'villager combat' term
counts the field kills' own death records on this band, so the
bar effectively prices lead-fighter deaths only. A future bar
that wants to price ally deaths inside won fights needs a
different instrument (kind=`villager` deaths joined by day to a
field fight) — proposed under "metric review", not adopted here.

## Seed bands (verified fresh per the seed-band-freshness skill)

- **Corpus: 100821–100828 (8 seeds), TWO legs (control + lever),
  ONE policy (`competent-answercourt-b`), 150d death-aware.**
  REUSED BY DESIGN as control-vs-lever on identical seeds: the
  gatereach corpus is a REFERENCE, not the control — the control
  leg is re-run FRESH on this tip (committed corpora go stale when
  game code drifts), and the lever leg runs on the same seeds, so
  the paired deltas are the lever's effect. Reuse is recorded here
  explicitly because the band is named in
  `evidence/2026-11-15/sim-gatereach-b-prereg.md` (the parent
  diagnostic) and in the unmerged `sim-vetparty-a` branch's prereg
  (a different lever, separate corpora, no shared files — no
  contamination of this arm's corpora, which are re-run fresh).
- Freshness check (2026-11-16, exact-seed grep with digit
  boundaries `(^|[^0-9])10082[1-8]([^0-9]|$)`): the band is named
  in committed `evidence/*/sim-*-prereg.md` ONLY by
  sim-gatereach-b-prereg.md in this tree (plus the unmerged
  vetparty prereg noted above); zero hits in committed
  `scripts/*.js`, zero hits in the goal
  `hidden_files/convergence-tracker.md`, zero hits in
  `~/memory/2026-11-1*.md`, no `perseed-*10082*` directories
  other than the gatereach reference corpus. Spent bands avoided:
  100521–100536, 100601–100608, 100621–100636, 100641–100648,
  100701–100708, 100721–100728, 100761–100768, 100781–100788,
  100801–100816 (per the gatereach prereg's spent list).
- No confirm band is named: a pilot spends no confirm.

## Horizon, policy, death-awareness

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy `competent-answercourt-b` (same as gatereach, so numbers
  compare).
- Driver: `scripts/gatereach-driver-20261115.js` (RUN `aidgate-b`;
  OUTDIRs `perseed-aidgate-b-control` / `perseed-aidgate-b-on`),
  EXTENDED only with the fields this lever needs (see below) —
  reused, not rebuilt. Control leg: `AIDGATE` unset. Lever leg:
  `AIDGATE=1`. Both legs on the same tip, same seeds, same policy,
  same horizon.
- Analyzer: `scripts/analyze-gatereach-b.js`, extended with the
  door-gate + aidGate accounting and a `judgeAidgate(control,
  lever)` implementing the GO bar above. The balanced panel
  compare runs per `docs/MEASUREMENT.md` §15
  (`scripts/build-aidgate-panels-20261115.js`, modeled on the
  vetparty panel builder; pseudo-policy `aidgate-b`; paired seeds;
  panel is the instrument, the frozen GO bar is the judge).

## Instrument extensions (what the lever needs that gatereach lacks)

- **Door-gate rows (`w5doors`):** the driver wraps
  `winPlanDoorGate` and records `{day, vid, mid, wave, result,
  reason, partySize, allArmed, allArmored, trickKnown}` per
  consult (wave-5 aid consults only — the method returns null
  without consulting for other waves, and the wrap records only
  wave-5 calls).
- **Encounter rows:** `aidGate` (from `opts.aidGate` at the
  `fieldFight` call: `'seek' | 'defense' | null`) and `trickOpen`
  (from `opts.trickOpen`) plus `trickLog` (from the fight record,
  so the opener's firing is visible) are recorded on wave-4+
  encounter rows.
- **Analyzer:** door-gate counts by result/reason; wave-5 aid
  fights split by `aidGate` (seek / defense / null) with outcomes;
  opener firings (rows with `trickOpen` whose `trickLog` names an
  opener `why`); the bar-(3) death count per the operational
  definition above; `judgeAidgate(control, lever)` over the two
  legs' pooled summaries.

## Proof test

`scripts/test-aidgate-b.js` proves, on synthetic fixtures and live
in-memory runs (no corpus numbers): the lever wiring (door-gate
method present with the frozen verdict shapes; `aidFight` consults
it for wave-5 lingerers only when `AIDGATE=1`, never for wave-4,
never when the flag is unset); the SEEK opener (a wave-5 editor /
cancellation fight with the trick known opens with the trick —
`trickLog` names the opener — only with `opts.trickOpen`, never
without it; expedition fights never set it); the defense path (an
outmatched party still fights, with the defense line said);
no-change guards (no plan seeded / no stage changed / no counter
bumped by a door consult; standing / readiness / win prices /
deed-gate readiness identical with the flag on vs off on a fixed
fixture); the analyzer's `judgeAidgate` (GO shape + one NO-GO
fixture per bar + boundary GO); the driver is deterministic (seed
100821, 150d, twice identical, 0 errors, with the flag on).
GREEN before any judged corpus runs; re-run green on the final tip
before landing.

## Sense-testing

Quote the aid-fight lines the corpora capture (encounter-row
`log`/`lines` plus the door say lines) for 2–3 wave-5 door fights
and judge whether they read like fights — and hand-check one
fight per `aidGate` value present (seek / defense / null): does
the classification match what a player would see (a party that
opens with the trick, a defense held at the door, an ordinary
door fight)? Name the fight lines' source (seed, day, fighter,
monster) and the counts searched. Do not invent fight narrative
from kill counts.

## Metric review (to be filled in the evidence file)

Pre-registered here: the bar-(3) death term counts the field
kills' own death records on this band (see the §7 correction) —
if the lever leg's wave-5 door fights produce genuine ally deaths
inside won fights, the review will say whether the bar or the
instrument needs the revision (kind=`villager` deaths joined by
day to a field fight). The opener's species scope (editor /
cancellation only) may make the pilot's effect undetectable on a
band whose wave-5 door fights are other species — the review will
say so plainly if the pilot NO-GOs on bar (1) with zero SEEKs.
The panel compare is evidence, never the judge.

## Loop A overlap flag (loud, per the task brief)

Loop A is live on `sim-vetparty-a` (claim
`fleshout-20261116T0115Z`, vetparty A/B + gate + merge-or-kill).
The vetparty lever's file set includes `src/js/win-plan.js`,
which this arm also touches. Verified 2026-11-16: the vetparty
lever was REVERTED on its branch (commit `17357d691`) and
`git diff master sim-vetparty-a -- src/js/` is EMPTY — no live
game-code overlap right now. This arm's `win-plan.js` change is
additive-only (one new method, zero edits to existing functions),
and it touches none of vetparty's other files (`game.js`,
`villager-brain.js`). The coordinator must still sequence the
merges: if Loop A re-applies the vetparty lever (a 256-line
`win-plan.js` rewrite) while this arm is unmerged, the two
branches will conflict on `win-plan.js` and need a manual merge.
This arm does not touch Loop A's worktree or branch.
