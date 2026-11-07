# sim-doorwalk-b — prereg (the door arm: walk an earned door after sitting)

**Arm:** sim-doorwalk-b (run fleshout-loop-b-20261107T1430Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** New
wrapper policy file composing the door-walking drive onto the FROZEN
takeseat substrate (`scripts/policies/competent-linkfeast-b.js`,
unmodified, with `TAKESEAT_B=1`). **Base:** master 62ca38845 (local
master = the 1330Z round-evidence tip; origin/master 2016a7ed0 is an
ancestor — the round is merged locally, pending ship — so no rebase
was needed; verified 2026-11-07). **Band:** 53001–53008,
DELIBERATELY REUSED (balanced panel: before/after on identical
seeds — the same band the linkdrive, feastdrive, and takeseat arms
use, so all columns are comparable). **Horizon:** 150d death-aware.
**Policies:** baseline = takeseat substrate with the door drive OFF
(`DOORWALK_B` unset — sits happen, doors never answered, pinned by
the proof's RED phase); armed = the same substrate with
`DOORWALK_B=1`.

## Canon

READ first: `docs/CANON.md`, then `docs/TABLE.md` (the endgame
Table — the seat, the seven doors, sanctity, the day-90 floor, the
sticky offer). **No canon is invented here.** Every mechanism claim
below is read from `src/js/table.js` and cited to it.

## The blank (from sim-takeseat-b, evidence/2026-11-07/sim-takeseat-b.md)

On frozen band 53001–53008, 150d, the takeseat substrate sits 5/8
lesser seats with 5–6 doors offered and **0 entered**. The sitting
is built; the winning is unmeasured. THIS arm builds the door-walk
drive: a policy that, after the sit, chooses and enters an earned
door through the engine's real door-choice verb and plays the path
to its resolution.

**STEVE-CALL behind this arm (do not re-decide it):** only the
player chooses the village's path and who takes the seat (Steve
2026-10-26). This arm MEASURES whether walking a door works, not
whether bots should sit or which path a player should take. The
policy is a measurement instrument, default OFF, policy-side only.
It never picks a sitter, never answers a seat-taker choice.

## Prior art — checked, not rebuilt blind

`scripts/policies/tablepaths.js` (2026-10-19, sim-tablepaths) and
`scripts/policies/tablepaths-nowait.js` (2026-10-24,
sim-tablepaths-a) are the proven door drivers: they drain the
table modal with `Game.chooseTableOption()` after a sit, answer
challenge beats / finals with the first presented option, refuse
the dark conscript, re-apply the door rule on downgrade, and
never override `tableBranch`. tablepaths proved feared /
assimilated / relay / witness / beloved all winnable as lesser
seats on the old tableseat-nowait substrate. This arm copies
that gate + drain shape onto the current takeseat substrate; it
does not rebuild the drain blind. What is NEW here: the
substrate (linkfeast + sit drive), the per-seed door rotation,
and the offered-doors recording the takeseat metric review asked
for ("a future door arm should record the offered doors in the
sit event itself").

## Mechanism (engine-honest, from src/js/table.js)

- `tableTakeSeat()` (no sitter id) calls `tableScene()` directly
  — no seat-taker modal intervenes; the sitting defaults to the
  player character (table.js ~1107). `tableScene()` sets
  `pg.tableDone = true`, `T.phase = 'paths'`, locks the ending
  key, voices the audit, and opens the 7-door modal via
  `tableOfferPaths` (~1129), which offers ONLY earned paths as
  `{id: 'path:' + p.id}`.
- `chooseTableOption('path:<id>')` in phase `'paths'` calls
  `tableStartPath` (~1194): `T.path` set, branch read from the
  ledger via `tableBranch` (never overridden by the policy),
  phase `'challenge'`, beat 0 rendered by `tableRunBeat`.
  `chooseTableOption` is the single UI entry point (app.js calls
  it) and routes by phase: `path:` → start, `downgrade:` →
  downgrade pick, `challenge` → `tableChoose` (beat), `finals` →
  `tableResolveFinal`, `demandprice:` → demand price,
  `conscript:` → conscript answer then challenge resumes.
- `tableEarnedPaths()` (~471) and `tableBranch()` are pure reads
  — no `Math.random` anywhere in `table.js` / `table-*.js`
  except the cosmetic framing draw inside `tableDeedLines`
  (line 391, called from the sit's audit — already drawn by the
  sit itself). The door drive's pre-verb reads therefore draw
  no RNG and write no state; the guard below judges exactness
  PRE-ENTRY, and post-entry divergence is by design (a walked
  path plays beats, may trial-pause — never opted in here — may
  downgrade, may win and end the run).
- The drain runs in the wrapper's `upkeep`, immediately after
  the linkfeast upkeep (which runs the sit drive). The harness
  calls `policy.upkeep` 3× a day (once per day-part, before
  `policy.daily`), so on the decision point where the sit fires,
  the door is walked the same part — entry day = sit day by
  construction. A live `tbfight` pauses the drain (the trial
  pause shape; no trial is ever opted in, so this is the
  feast-draw / ambient fight break only); the next upkeep
  retries. `Game.over` ends the drain.
- After a sit, `tableActive()` is true until a resolve sets
  phase `'done'` — sanctity suspends ambient monster pressure
  (TABLE.md §8). A win sets `Game.won = true` and `Game.over =
  true` (table.js ~1407/1512/1595/1624) and ends the run on the
  spot — a win truncates survival days and pair accumulation BY
  DESIGN, which is why the cost bar below treats won seeds as
  it does.

## The door drive (new file scripts/policies/competent-doorwalk-b.js)

Wrapper over the frozen linkfeast composite: `daily` delegates
to linkfeast daily untouched; `upkeep` runs linkfeast upkeep
(feast upkeep + sit drive) THEN the door-walk drive. Env gate
`DOORWALK_B=1`, default OFF. Zero src/js, zero changes to any
existing policy file.

**THE DOOR RULE (pre-registered, POLICY-SIDE, not canon):**
at a paths-phase offer, ASSIGNED = ROTATION[(seed − 53001) % 4]
with ROTATION = `['defiant', 'assimilated', 'beloved', 'relay']`
(seed from `DOORWALK_SEED`, set by the driver per seed; the
proof pins the mapping). (1) If ASSIGNED is offered, take it.
(2) Else take the first offered door that is NOT `'feared'`,
in engine (offered) order. (3) Else (only feared offered) take
feared. A door never offered is NEVER taken (the modalplay
precedent — forcing an unearned door would bypass the engine's
prereq). Witness is not in the rotation (no live exposure
source on this road) but is walkable by rule (2) when offered.
Indispensable is full-seat-only and never offered on a lesser
seat, so it can never be walked here.

| Seed | Assigned door | Expected (takeseat corpus) |
|---|---|---|
| 53001 | defiant | no seat — drive never fires |
| 53002 | assimilated | no seat — drive never fires |
| 53003 | beloved | lesser, sat d90, 6 doors |
| 53004 | relay | lesser, sat d94, 5 doors (relay offered) |
| 53005 | defiant | lesser, sat d90, 6 doors |
| 53006 | assimilated | lesser, sat d93, 6 doors (assimilated offered) |
| 53007 | beloved | no seat — drive never fires |
| 53008 | relay | lesser, sat d90, 6 doors |

**THE DRAIN RULE (pre-registered — the one judgment is the
door; everything after it is mechanical, the tablepaths
modalplay precedent):** challenge beats take the FIRST presented
option, EXCEPT the trial opt-in is NEVER taken (`'beat:trial'`
is skipped — trial-by-combat risks the Bearer's life and is
opt-in only; this arm does not opt in; if trial is the only
option offered, that beat is a classified skip `'trial-only'`
and the drain stops for this upkeep). Finals take the first
option. Downgrade re-applies the door rule among the remaining
earned `'downgrade:*'` options (assigned first if still
available, else first earned non-feared, else feared). The dark
conscript is REFUSED (`'conscript:no'`; if absent, classified
skip `'conscript-no-missing'`). Demand-price takes the first
option. Branches stay ledger-earned — the driver NEVER calls
anything that sets a branch. The driver NEVER answers a
`'seat:*'` option and NEVER calls `tableOfferSeatTaker` /
`tableChooseSeatTaker` (the sitter is the player's choice, and
the sit drive never opens that modal — the drain treats a
`'seat-taker'` phase as a classified skip, never an answer).

**READING OF "never answer anything except the door choice":**
the task's phrase is read as "the drive exercises no judgment
beyond the door" — beats, finals, downgrade, conscript, and
demand-price are drained mechanically (first option, per the
proven tablepaths shape) so a walked door PLAYS to its
resolution and a win is measurable. Answering ONLY the door
pick and leaving the challenge beats unanswered would leave
every walked path unresolved forever and make the "wins
reported" secondary vacuous; the 1330Z round's next blank #1
says "measure whether a path can be played to a win", which
requires the beats to be played. This reading is stated here
so the coordinator can correct it; the drain log records every
answer with its rule, so any answer is auditable.

**Classified skips (never a door entry):** `fight-live` (a
`tbfight` is live), `preview-null` (no modal pending — the
idle path; pure reads only), `not-ready` (phase is not a
drainable table phase), `seat-taker` (the modal wants a sitter
— never answered), `trial-only`, `conscript-no-missing`,
`already-entered` (this sitting already walked a door and the
phase is not a drainable one — the drain resumes only for a
downgrade re-offer), `no-doors-offered` (paths phase with no
`path:*` options). Every skip is tallied in the module stats;
every door entry, beat answer, final, downgrade, and conscript
refusal is logged with day, phase, path, branch, beat, option
id, and rule.

## Substrate — the takeseat composite (frozen, re-baselined here)

The baseline leg (`perseed-doorwalk-b-baseline/`) is the
linkfeast composite with `TAKESEAT_B=1` and the door drive OFF.
It is a RE-BASELINE on current master (62ca38845) — the 1330Z
corpus (base a78938a0b) is NOT trusted blindly; trajectories on
this band are fragile across master moves (53008 flipped
150d→95d on a master move once). The re-baseline numbers and
the guard result are reported on their own. The armed leg
(`perseed-doorwalk-b-armed/`) is the same composite with
`DOORWALK_B=1`, same seeds, same base, same days.

## Primary metric (frozen)

**Doors entered ≥ 3/8 armed vs 0/8 baseline.** "Entered" = a
seed on which `tableStartPath` ran via the door drive (phase
`'paths'` → `'challenge'` with a path set, recorded in the
driver's `doorEvents` + the policy's `walked` list). The
baseline leg must show 0/8 entered (gate OFF, pure delegation
— the RED-phase pin, live). Wins are REPORTED, not gated: a
win is the prize, but no win has ever happened on any
substrate, and gating the arm on a first-ever win would judge
a mechanism by its hardest outcome.

**Substrate sanity (frozen, untestable-if-failed):** the
re-baseline leg must earn lesser seats on ≥ 3/8 seeds AND sit
on ≥ 3/8 seeds (the door drive needs sittings to walk). If
either fails, the run is NO-GO on substrate and the door drive
is UNJUDGED — the substrate moved under the arm, not the
drive.

## Cost bar (frozen)

- Starvation deaths ≤ baseline + 2 total AND arm-only ≤ 2 (the
  takeseat rule, number stated — its metric review asked for
  the number in the prereg).
- Median survival ≥ 0.8× baseline median, computed over
  NON-WON seeds in each leg (a win ends the run by design —
  `Game.over = true` — so a won seed's truncated days are a
  victory, not a survival failure; won seeds are excluded from
  both medians and the exclusion is stated per leg).
- Pair days recorded against the re-baseline leg AND the 1330Z
  takeseat-armed 65 (a win truncates pair accumulation by
  design, so pair days are a recorded secondary here, not a
  gate — the task's shape).
- A primary hit that breaches the cost bar is NO-GO. A win can
  never breach the cost bar.

## Substrate guard (frozen — the per-seed exact-reproduction guard,
## adapted from takeseat's pre-sit guard to a lever that is DESIGNED
## to diverge trajectories after it fires)

A walked path plays beats, may downgrade, may win and end the
run, so whole-run exactness cannot hold on walked seeds. The
guard is:

- **Seeds where no door is ever entered:** armed must reproduce
  the baseline EXACTLY — days, endReason, standing, maxWave,
  wave-4+ kills, final seat.
- **Seeds where a door is entered:** armed must reproduce the
  baseline EXACTLY on every daily row BEFORE the entry day —
  fields day, rawStanding, rosterSize, living, w4kills, seat,
  feastSurgeUsed, sentimentTaught, pairDay, preview ready/why,
  scholarAtHaven — and the entry day itself must show the entry
  (`doorEvents` entry, `tableDone` true, phase
  `'challenge'` with the assigned/fallback path).
- **Guard passes iff ≥ 6/8 seeds satisfy their applicable
  clause.** The guard is computed by the analyzer from the two
  corpora and printed in the evidence file. A median guard is
  NOT used: 53008 flipped 150d→95d on current master after the
  finishersize landing, so a median guard is already known-bad
  (sitstep2 metric review §1).

## Secondaries (frozen)

Doors offered per sat seed (names, recorded in the sit/door
event — fixes takeseat metric-review #4) / entered per seed
(door, branch, day, assigned vs fallback, rule) / finals
reached / downgrades taken (second door entered?) / conscript
refusals / trial-only skips / challenge beats answered /
wins per leg, national, wave 4–5 unlocks, median survival
(non-won), pair days, starvation deaths per seed, feast surge
+ foodDeeds per seed, links formed per seed, days the run
continues after an entry (modal-stall check), per-seed entry
lag (sit day → entry day, 0 by construction — verify it).
Scale-wall numbers (national / table-sat / wins, wave 4–5
unlocks, median survival) reported every run.

## Confirm rule (staged, §9–12)

The 8-seed pilot above is the judged run. **If the pilot
passes GO, a 12-seed confirm runs in this same run** on fresh
band **53201–53212** (freshness checked 2026-11-07: no prereg,
forbidden list, screen, or extension band names it — searched
`evidence/*/sim-*-prereg.md`, the 2026-11-04/11-05
forbidden-band preregs, and `hidden_files/`; the first choice
53101–53112 COLLIDED — 53101–53108 named by winseat 2026-10-18
via `evidence/2026-11-01/sim-fertrot-b-prereg.md:125`, so it
was rejected and is recorded here so the next worker does not
repeat it). Confirm bars: doors entered ≥ 4/12 armed vs 0/12
baseline, substrate sanity (lesser ≥ 4/12, sat ≥ 4/12), guard
≥ 9/12, cost bar same shape (starvation ≤ +2 AND arm-only ≤2,
median non-won ≥ 0.8×, pairs recorded). **If the pilot is
NO-GO, stop — killed-at-pilot, no confirm spend.**

## Judge

The run is judged against this header. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If a metric
proves wrong, write it under "metric review" and propose the
revision for the NEXT run. Every evidence file carries a
"metric review" section.

## Panel (§15)

Before/after through `scripts/balance-panel.js` — the takeseat
panel-builder pattern (`scripts/build-takeseat-panels-20261107.js`):
panels built from the two per-seed corpora (paired seeds,
pseudo-policy `'doorwalk'`), scorecard compare, the compare
`.md` attached to the evidence file. The panel is the
instrument, the pre-registered threshold is the judge. The
panel measures the neutral before/after (survival, wins, rank,
arc); the door metrics come from this arm's own driver corpora.

## Convergence state reported

converging | converged | parked | killed-at-pilot, per axis
scale-onramp.

## Proof (before any judged sim)

`scripts/test-doorwalk-b-20261107.js`: gate-OFF RED phase
(never drives the verb, pure delegation, zero Game reads when
off), gate-ON fixtures on stub Games (ready modal → assigned
door called once, recorded; fallback / only-feared /
fight-live / preview-null / not-ready / seat-taker /
already-entered / trial-only → classified skips, verb never
called; downgrade re-applies the door rule; conscript
refused; double-entry guard), composition fixture (wrapper
daily runs linkfeast daily exactly once; upkeep runs linkfeast
upkeep exactly once + door drive), a live
trajectory-neutrality check (armed vs baseline on seed 53001
— a no-seat seed, so the drive can never fire — must
reproduce the baseline headline numbers exactly, proving the
idle reads draw no RNG and write no state in practice), and a
live 1-seed smoke leg (53003 baseline in /tmp) asserting
structural invariants only. Proof green BEFORE the judged run;
re-run green after every rebase.
