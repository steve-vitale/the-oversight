# sim-takeseat-b — prereg (the sit drive: issue the sit verb on a preview-ready day)

**Arm:** sim-takeseat-b (run fleshout-loop-b-20261107T1330Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** New
composite policy file composing the sit drive onto a NEW
linkdrive+feastdrive composition (both frozen substrates,
unmodified). **Base:** master a78938a0b (measurement-proof refresh
#2 on r151 rebased tip, post-feastdrive). **Band:** 53001–53008,
DELIBERATELY REUSED (balanced panel: before/after on identical
seeds — the same band the linkdrive, feastdrive, and sitstep2 arms
use, so all columns are comparable). **Horizon:** 150d death-aware.
**Policies:** baseline = linkfeast composite with the sit drive OFF
(`TAKESEAT_B` unset — pure delegation, pinned by the proof's RED
phase); armed = the same composite with `TAKESEAT_B=1`.

## Canon

READ first: `docs/CANON.md`, then `docs/TABLE.md` (the endgame
Table — the seat, the seven doors, sanctity, the day-90 floor, the
sticky offer). **No canon is invented here.** Every mechanism claim
below is read from `src/js/table.js` and cited to it.

## The blank (from sim-sitstep2-b, evidence/2026-11-07/sim-sitstep2-b.md)

On band 53001–53008, 150d, the linkdrive-armed replay earns lesser
seats on 4/8 seeds, the offer is announced and ready, the scholar
is at Haven and alive on 75/75 preview-ready days — and the sit
verb is called 0 times, tableChoices never surface, the table is
never sat. The seat is earned, offered, ready, scholar-present —
and nobody sits because no policy issues the sit verb. The feast
drive (landed GO, eaf80f65f) bought the surge deed on 5/8, so the
seat's other half is done. THIS arm builds the sit drive: a policy
that calls the real `Game.tableTakeSeat()` verb on a preview-ready
day (scholar at Haven, no entry block, no live fight), waiting
encounters out — sitstep2 found "finish the current encounter"
blocks 46/122 post-floor seat days.

**STEVE-CALL behind this arm (do not re-decide it):** only the
player chooses the village's path and who takes the seat (Steve
2026-10-26). This arm MEASURES whether sitting works, not whether
bots should sit. The policy is a measurement instrument, default
OFF, policy-side only. It never picks a door, never answers the
table modal, never chooses a sitter.

## Prior art — checked, not rebuilt blind

`scripts/policies/takeseat.js` exists (2026-10-17, sim-takeseat,
13/16 tables sat on the feastscale substrate). It composes onto
belongfeast/leadfeast, NOT onto the current substrate, so it is not
reused — but its gate shape is copied verbatim: env gate default
OFF, pure delegation when off, luxury-move safety (never while the
game is over, never while a fight is live), own-flag double-take
guard, `tablePreview().ready` as the only go-ahead. The 2026-10-17
run got 13/16 sat, so the modal does not stall a node sim — this
run re-verifies that on the current substrate and reports exactly
what the engine/harness does with the modal after a sit.

## Substrate — the NEW composite (frozen here, before any judged sim)

No combined linkdrive+feastdrive composition exists (checked
2026-11-07: `scripts/policies/` holds `competent-linkdrive-b.js`
and `competent-feastdrive-b.js` separately, nothing composing
them). The new file is
`scripts/policies/competent-linkfeast-b.js`:

- **Daily:** feastdrive daily (frozen staged daily + donate-down)
  THEN linkdrive (`linkDrive`, exported from
  `competent-linkdrive-b.js`) — staged.daily runs exactly once.
- **Upkeep:** feastdrive upkeep (frozen staged upkeep +
  feast-at-dusk) THEN the sit drive.
- **Sit drive** (`takeSeatDrive`, `TAKESEAT_B=1` only): never while
  `Game.over`; never while a `tbfight` is live (classified skip
  `fight`); never twice (`ctx.tsSeatTaken` + `pg.tableDone`);
  requires `pg.tableAnnounced`; requires scholar at Haven
  (`playerAtHaven`, classified skip `away`); reads
  `tablePreview()` — null is a classified skip (`preview-null`),
  not-ready is a classified skip carrying the engine's `why`
  (`not-ready:<why>`); only then calls the real
  `Game.tableTakeSeat()` and records ok/fail + day + seat kind +
  doors offered (`tableChoices` options count read after the
  call). It never calls `tableOfferSeatTaker`,
  `tableChooseSeatTaker`, or `chooseTableOption`.
- **What it does NOT do:** no door answers, no sitter choice (the
  sitting defaults to the player character, the engine's unchanged
  default in `tableScene`), no feast/link/staged change, no roster
  reads, no RNG draws. The preview path is RNG-neutral by
  construction (verified 2026-11-07 before this prereg:
  `tablePreview` → `tableSeat` + `tableEarnedPaths` +
  `overtimeStanding` + `fullSeatShortfall` + `tableEntryBlock`
  consume no `Math.random` — the single `R()` in `table.js`
  is `tableDeedLines`' local mulberry32 stream, and the witness
  prereq is pure; `overtime.js` contains zero `Math.random`).

**Baseline leg** (`perseed-takeseat-b-baseline/`): the composite
with the gate OFF. It is a NEW composition, so it has no prior
corpus to reproduce — its numbers are reported on their own, and
the feast/link halves are sanity-checked against the two prior
corpora (linkdrive: 41 links, lesser 4/8; feastdrive-armed: surge
5/8, foodDeeds 5/8) as context, not as a verdict bar.
**Armed leg** (`perseed-takeseat-b-armed/`): the same composite
with `TAKESEAT_B=1`, same seeds, same base, same days.

## Mechanism (engine-honest, from src/js/table.js)

- `tablePreview()` is null when the invitation is not staged
  (`pg.tableWaiting`), when the seat is 'none', when `tableDone`,
  and BEFORE DAY 90 (`winDayFloorOk` — "nonexistent before day 90
  — no preview, no button, no spoilers"). A null preview is the
  engine saying "not yours yet" — never bypassed.
- `ready` is `!tableEntryBlock()`: over/won ("This expedition has
  ended."), active contest ("Finish the current contest..."),
  in combat / `scholar.monster` ("Finish the current encounter
  before taking your seat."), `havenStoresAccess() === 'none'`
  ("Return to Haven to take your seat.").
- `tableTakeSeat()` re-checks the preview and the entry block
  itself, then calls `tableScene()`, which sets `pg.tableDone =
  true`, `T.phase = 'paths'`, locks the ending key, voices the
  audit, and opens the 7-door modal via `tableOfferPaths`
  (`scholar.tableChoices`, options = earned paths only).
- After a sit, `tableActive()` is true until a resolve sets phase
  'done' — sanctity suspends ambient monster pressure (TABLE.md
  §8). Post-sit trajectories therefore diverge from baseline BY
  DESIGN (sanctity + the overtime clock stopping), which is why
  the substrate guard below judges exactness PRE-SIT, not whole-run.
- The modal is NOT answered by this arm. Any door-answering is a
  separate pre-registered decision, not a quiet patch. If the modal
  stalls the run (days stop advancing after a sit), that is
  reported exactly as a finding — a stalled modal is a finding,
  not a bug to patch around.

## Primary metric (frozen)

**Tables sat ≥ 3/8 armed vs 0/8 baseline.** "Sat" = a seed on
which `pg.tableDone` becomes true via the sit drive
(`tableTakeSeat` returning `ok`, recorded in the instrument's
`sitAttempts` + the driver's `sitVerbMsgs`), with the seat kind
reported per seed (lesser expected on this band; a full seat sat
would exceed the bar, not break it). The baseline leg must show
0/8 sat (gate OFF, pure delegation — the RED-phase pin, live).

**Substrate sanity (frozen, untestable-if-failed):** the baseline
leg must earn lesser seats on ≥ 3/8 seeds (the seat must exist
for the drive to have something to sit). If the baseline earns
fewer, the run is NO-GO on substrate and the sit drive is
UNJUDGED — the composition interaction is the finding, not a
re-scored bar.

## Cost bar (frozen)

- Starvation deaths ≤ control + 2 total AND arm-only (a starvation
  death on a seed where the control had none counts against the
  arm even inside the +2).
- Median survival ≥ 0.8× control median.
- Pair days must not fall below the feastdrive-armed 14
  (secondary guard — record it; the sibling feastcost arm owns
  taming the pair cost). "Control" throughout = the baseline
  composite leg on the same band, same base.
- A primary hit that breaches the cost bar is NO-GO.

## Substrate guard (frozen — the per-seed exact-reproduction guard
## proposed in sitstep2's metric review, adapted to a lever that is
## DESIGNED to diverge trajectories after it fires)

Sitting changes the world by design (sanctity, overtime stop), so
whole-run exactness cannot hold on sat seeds. The guard is:

- **Seeds where the sit never fires:** armed must reproduce the
  baseline EXACTLY — days, endReason, standing, maxWave, wave-4+
  kills, final seat.
- **Seeds where the sit fires:** armed must reproduce the baseline
  EXACTLY on every daily row BEFORE the sit day — fields day,
  rawStanding, rosterSize, living, w4kills, seat, feastSurgeUsed,
  sentimentTaught, pairDay, preview ready/why, scholarAtHaven —
  and the sit day itself must show the sit (`sitAttempts` ok,
  `tableDone` true).
- **Guard passes iff ≥ 6/8 seeds satisfy their applicable clause.**
  The guard is computed by the analyzer from the two corpora and
  printed in the evidence file. A median guard is NOT used: 53008
  flipped 150d→95d on current master after the finishersize
  landing, so a median guard is already known-bad (sitstep2 metric
  review §1).

## Secondaries (frozen)

Doors offered (earned paths per sat seed) / entered (0 by design
— never answered), wins, national, wave 4–5 unlocks, median
survival, sit-call counts (attempts / ok / failed + skip-class
tallies), encounter-blocked days (post-floor seat days with the
encounter `why`), per-seed seat days (earned → sat lag in days),
overtime tier at sit, tableChoices surfaced (count + options),
days the run continues after a sit (modal-stall check), pair days,
starvation deaths per seed, feast surge + foodDeeds per seed,
links formed per seed. Scale-wall numbers (national / table-sat /
wins, wave 4–5 unlocks, median survival) reported every run.

## Judge

The run is judged against this header. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If a metric proves
wrong, write it under "metric review" and propose the revision
for the NEXT run. Every evidence file carries a "metric review"
section.

## Panel (§15)

Before/after through `scripts/balance-panel.js` — the
feastdrive panel-builder pattern
(`scripts/build-feastdrive-panels-20261107.js`): panels built from
the two per-seed corpora (paired seeds, pseudo-policy
'takeseat'), scorecard compare, the compare `.md` attached to
the evidence file. The panel is the instrument, the pre-registered
threshold is the judge. The panel measures the neutral
before/after (survival, wins, rank, arc); the sit metrics come
from this arm's own driver corpora. The composite is registered
in `scripts/sweep-compare.js` (additive try/catch entry, the
established pattern; no existing policy file touched).

## Convergence state reported

converging | converged | parked | killed-at-pilot, per axis
scale-onramp.

## Proof (before any judged sim)

`scripts/test-takeseat-b-20261107.js`: gate-OFF RED phase (never
drives the verb, pure delegation, zero Game reads when off),
gate-ON fixtures on stub Games (ready → verb called once, ok
recorded; fight-live / not-announced / preview-null / not-ready /
already-taken → classified skips, verb never called; double-call
guard), composition fixture (composite daily runs staged.daily
exactly once + donateStep + linkDrive; upkeep runs staged.upkeep
exactly once + feastStep + sitDrive), a live trajectory-neutrality
check (armed vs baseline on seed 53001 — a no-seat seed in
sitstep2, so the drive can never fire — must reproduce the
baseline headline numbers exactly, proving the preview reads
draw no RNG and write no state in practice), and a live 1-seed
smoke leg (53004 baseline in /tmp) asserting structural invariants
only. Proof green BEFORE the judged run; re-run green after every
rebase.
