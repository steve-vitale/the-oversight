# sim-witnessdoor-b — prereg (the witness-door arm: walk witness when offered)

**Arm:** sim-witnessdoor-b (run fleshout-loop-b-20261107T1830Z,
axis scale-onramp / winnability chain) · **Policy-side only, zero
src/js, zero default flips, no changes to any existing policy file
— in particular scripts/policies/competent-doorwalk-b.js is
required, never edited.** New wrapper policy file composing the
witness-first door rule onto the doorwalk policy
(`scripts/policies/competent-witnessdoor-b.js`). **Base:** master
c88df9d25 (read fresh at run start, 2026-11-07T18:30Z; the
doorwalk-confirm landing dbfcca9b3 is on this tip).
**Band:** 53201–53212, JUDGED comparison band reused deliberately
(see band note below — this is comparison reuse, NOT fresh-ground
confirmation). **Horizon:** 150d death-aware. **Policies:**
baseline = doorwalk rotation (`DOORWALK_B=1`,
`WITNESSDOOR_B` unset — sits happen, the rotation walks the
doors); armed = the same substrate with `WITNESSDOOR_B=1`
added (witness walked when offered and earned, else the
rotation exactly).

## Canon

READ first: `docs/CANON.md`, then `docs/TABLE.md` (the endgame
Table — the seat, the seven doors, sanctity, the day-90 floor,
the sticky offer). **No canon is invented here.** Every
mechanism claim below is read from `src/js/table.js` /
`src/js/table-witness.js` and cited to it.

## The blank (from sim-doorwalk-b and sim-doorwalk-confirm-b)

On frozen band 53001–53008 the doorwalk arm walked 5/5 doors
and won 5/5 — but witness was offered on four sits and NEVER
walked (never assigned, never the fallback — the fallback was
never needed). The confirm on band 53201–53212 repeated it:
witness offered on 4/5 sits (53201, 53203, 53206, 53212),
walked 0/5. The feareddoor arm then walked feared 5/5 and won
5/5 on the same band. THIS arm walks the witness door: a policy
that, after the sit, enters the witness door when the engine
offers it and plays the path to its resolution through the
engine's real door-choice verb. Witness is the last of the
seven doors never walked; after it, only the dark branches
and trial-by-combat stay unmeasured.

**STEVE-CALL behind this arm (do not re-decide it):** only the
player chooses the village's path and who takes the seat (Steve
2026-10-26). This arm MEASURES whether walking witness works,
not whether bots should sit or which path a player should take.
The policy is a measurement instrument, default OFF, policy-side
only. It never picks a sitter, never answers a seat-taker choice.
Dark branches / trial-by-combat stay for later runs; this arm
walks witness only.

## Band note (JUDGED comparison band — reuse, not fresh ground)

Band 53201–53212 is named in these prior preregs / evidence
(checked this run by grep over `evidence/*/sim-*-prereg.md`
plus the feareddoor worktree, whose prereg is not on master
yet):

- `evidence/2026-11-07/sim-winnability-round-1430.md` —
  reserved for the doorwalk confirm, never judged (at that time).
- `evidence/2026-11-07/sim-doorwalk-b-prereg.md:277` — names
  the band as the fresh confirm band.
- `evidence/2026-11-07/sim-doorwalk-confirm-b-prereg.md` +
  `sim-doorwalk-confirm-b.md` — JUDGED there: 12-seed confirm,
  5/5 doors entered, 5/5 won (landed dbfcca9b3).
- `sim-feareddoor-b-prereg.md` + `sim-feareddoor-b.md`
  (worktree sim-feareddoor-b, branch tip 6e8b3e8f0, NOT on
  master) — JUDGED there: feared 5/5 entered, 5/5 won,
  guard 12/12, cost bar clean.

This run reuses the SAME band deliberately so the
before/after comparison runs on identical seeds against the
two judged legs that already live there (doorwalk rotation
baseline, feared-first armed). The witness arm's baseline IS
the doorwalk rotation re-baselined on this tip; its numbers
are judged against its own baseline leg, not against the
feareddoor corpus. No claim of fresh-ground confirmation is
made from this band: a fresh-band witness confirm belongs to
a later run if the coordinator orders one.

## Prior art — checked, not rebuilt blind

`scripts/policies/tablepaths.js` (2026-10-19) and
`scripts/policies/tablepaths-nowait.js` (2026-10-24) are the
proven door drivers; `scripts/policies/competent-doorwalk-b.js`
(2026-11-07, sim-doorwalk-b) is the proven gate + drain shape
on the current takeseat substrate, with the per-seed door
rotation and the offered-doors recording; the feareddoor
wrapper (`scripts/policies/competent-feareddoor-b.js`,
worktree sim-feareddoor-b) is the proven force-one-door
pattern this arm mirrors exactly, with 'witness' in place of
'feared'. This arm copies that gate + drain shape and changes
ONLY the door pick at the paths offer (witness first). It
does not rebuild the drain blind.

## Mechanism (engine-honest, from src/js/table.js and src/js/table-witness.js)

- The sit and the offer work exactly as in the doorwalk prereg
  (`tableTakeSeat()` → `tableScene()` → `tableOfferPaths`,
  phase `'paths'`, `chooseTableOption('path:<id>')` →
  `tableStartPath`, branch read from the ledger via
  `tableBranch`, never overridden by the policy).
- The witness prereq (`table-witness.js`, `WITNESS_DEF.prereq`):
  lesser+ seat AND ledger.exposed ≥ 3 ("You didn't keep the
  list (N exposures on record — the trial needs 3)"). Strength
  = min(100, 25 + exposed×8). The door is offered only when
  the engine earns it; the policy never forces an unearned door.
- The witness challenge is three beats on the swing meter,
  with a convict-mid-trial tripwire: every beat choice's
  effects run through `swingCheck`, and a swing total ≤ −1
  fails the path ("your own record convicted you mid-trial —
  the defense was good, and the ledger was honest") and the
  table offers a downgrade. Beat 1 (opening charges): 'cold'
  +2, 'names' +1, 'reserve' +0. Beat 2 (the defense): 'let'
  +1 when protected ≥ killed, −2 when killed > protected;
  'cross' +1; 'subpoena' +1 (only when the subpoena ability
  is held and unused); 'silence' −2 light / −4 dark. Beat 3:
  light 'public' +2 / 'settle' +1; dark 'blood' +2 /
  'disappoint' +0. Ability grants: shared 'docket' (swing
  starts at 1); light 'clean-hands' +2; dark 'gavel' +2.
  The defense's two witnesses testify in their own words,
  sampled by personality, honest to the vector — the sitter
  is never their own witness (seat-taker variation, Steve
  2026-10-26 item 495; the sitter here is the player
  character, since the sit drive never answers a seat-taker
  choice). Finals (first option taken): light 'charges'
  ("Read the charges") and dark 'charges' both read as wins
  in the text; the second finals ('wayback' / 'gavel') are
  never taken by this drain.
- **Consequence for reading the judged numbers (recorded here,
  NOT a tuning excuse):** under the frozen first-option drain,
  beat 1 takes 'cold' (+2), beat 2 takes 'let' (+1 light /
  −2 dark-dirty), beat 3 takes 'public' (+2 light) / 'blood'
  (+2 dark). Swing starts at 1 (docket) + 2 (branch grant) =
  3. Light worst case: 3+2+1+2 = 8. Dark worst case (dirty
  ledger): 3+2−2+2 = 5. The −1 tripwire is unreachable under
  this drain on either branch — witness wins are expected on
  every entry. 'silence' (the convict path) is never picked
  because it is never the first option. The beat picks are NOT
  tuned here — tuning them would be a different lever (a
  "play witness well" arm, for a later run). A dark-branch
  witness walk is unlikely on this band (all five confirm
  sittings read light except the grey relay) and stays
  unmeasured if it does not fire.

## The door drive (new file scripts/policies/competent-witnessdoor-b.js)

Wrapper over the doorwalk policy: `daily` delegates to
doorwalk daily untouched; `upkeep` with `WITNESSDOOR_B` unset
delegates to doorwalk upkeep exactly (the BASELINE leg); with
`WITNESSDOOR_B=1` runs linkfeast upkeep (feast upkeep + sit
drive) THEN the witness-door drive. Env gate
`WITNESSDOOR_B=1`, default OFF. Zero src/js, zero changes to
any existing policy file. The doorwalk drive itself never runs
in the armed leg, so the two legs differ ONLY in which door is
picked at the paths offer — the substrate guard below judges
exactly that.

**THE DOOR RULE (pre-registered, POLICY-SIDE, not canon):**
at a paths-phase offer, (1) if `'witness'` is offered AND
earned, take it (`'witness-first'`, fellBack false). (2) Else
the doorwalk rule exactly: ASSIGNED =
ROTATION[(seed − 53001) % 4] with ROTATION =
`['defiant', 'assimilated', 'beloved', 'relay']` (seed from
`DOORWALK_SEED`, set by the driver per seed; the proof pins
the mapping for this band); assigned if offered, else first
offered earned non-feared in engine order, else feared if it
is the only one. A door never offered is NEVER taken.

| Seed | Assigned (fallback) door |
|---|---|
| 53201 | defiant |
| 53202 | assimilated |
| 53203 | beloved |
| 53204 | relay |
| 53205 | defiant |
| 53206 | assimilated |
| 53207 | beloved |
| 53208 | relay |
| 53209 | defiant |
| 53210 | assimilated |
| 53211 | beloved |
| 53212 | relay |

**THE DRAIN RULE (pre-registered — the doorwalk drain, copied,
not re-decided):** challenge beats take the FIRST presented
option, EXCEPT the trial opt-in is NEVER taken (`'beat:trial'`
is skipped — if trial is the only option offered, that beat is
a classified skip `'trial-only'` and the drain stops for this
upkeep). Finals take the first option. Downgrade re-applies
the witness-first rule among the remaining earned
`'downgrade:*'` options (witness if still available, else the
doorwalk downgrade rule). The dark conscript is REFUSED
(`'conscript:no'`; if absent, classified skip
`'conscript-no-missing'`). Demand-price takes the first
option. Branches stay ledger-earned. The driver NEVER answers
a `'seat:*'` option and NEVER calls `tableOfferSeatTaker` /
`tableChooseSeatTaker`.

**Classified skips (never a door entry):** `fight-live`,
`preview-null`, `not-ready`, `seat-taker`, `trial-only`,
`conscript-no-missing`, `already-entered`,
`no-doors-offered`, `no-earned-door`, `over`, `already-done`,
`no-options`. Every skip is tallied in the module stats;
every door entry, beat answer, final, downgrade, and conscript
refusal is logged with day, phase, path, branch, beat, option
id, and rule.

## Substrate — the doorwalk rotation on this band (re-baselined here)

The baseline leg (`perseed-witnessdoor-b-baseline/`) is the
doorwalk rotation with `DOORWALK_B=1` on band 53201–53212 —
it is a RE-BASELINE on the current base (c88df9d25), not a
reuse of any prior corpus: the feareddoor corpus lives on a
different branch tip and the doorwalk-confirm corpus on a
different base, so no prior corpus is trusted here. The armed
leg (`perseed-witnessdoor-b-armed/`) is the same substrate
with `WITNESSDOOR_B=1`, same seeds, same base, same days.

**BAND RE-CHECK (runs first, before any judging):** the
baseline leg runs first. If the substrate is dead on this
band (0/12 sit, villages dying ~70d like the collapsed
frozen band), STOP and report that the substrate moved — do
NOT judge the lever on a dead band. The armed leg runs only
after the baseline leg passes substrate sanity AND the proof
smoke leg (below) is green on a baseline sat seed.

## Staged run (pilot gate, §9–12)

**PILOT (8 seeds, 53201–53208, before/after):** the pilot runs
first and is judged on its own frozen bars before ANY confirm
spend. Pilot GO bars: witness entered ≥ 2/8 armed AND
(armed − baseline witness-entered) ≥ 2 AND substrate guard
8/8 AND the cost bar below computed on the 8 pilot seeds AND
pilot substrate sanity (baseline lesser ≥ 2/8 AND sat ≥ 2/8).
The pilot's sat seeds are 53201, 53203, 53206 (3 sittings on
the judged band; witness was offered on all three in the
confirm). If the pilot fails any bar, the lever is KILLED at
pilot — no 12-seed confirm is run. **CONFIRM (12 seeds,
53201–53212, before/after):** runs only on pilot GO. The
confirm corpus is the judged corpus; the pilot corpus is a
separate, earlier 8-seed run and is not folded into the
confirm numbers.

## Primary metric (frozen — confirm)

**Witness doors entered ≥ 4/12 armed AND (armed witness-entered
− baseline witness-entered) ≥ 3 on identical seeds.**
"Entered" = a seed on which `tableStartPath` ran via the
witness drive for path `'witness'` (phase `'paths'` →
`'challenge'` with path witness, recorded in the driver's
`doorVerbMsgs` + the policy's `walked` list). "Won" = the
seed ends `won:true` with the walked witness door as the
winning path (final answered on witness, no downgrade away
from it — a downgrade win counts for the seed's win total,
not for the witness win count). The baseline leg must show
witness entered 0/12 (the gate is OFF for witness in the
baseline — the RED-phase pin, live; the rotation can still
walk witness by its rule (2) first-non-feared fallback, which
the analyzer reports separately if it ever fires).

**Witness wins (secondary with an expectation, not a gate):**
witness wins ≥ 3/12 armed is expected (the mechanism section
shows the tripwire unreachable under this drain) and is
reported in the evidence. If entered passes its bars but
witness wins fall short, the verdict is GO on the frozen
header but the evidence flags the win shortfall loudly and
the landing call goes to the coordinator — a door that is
entered but does not win is not silently landed. (This
deliberately avoids the feareddoor run's unreachable
win-delta clause: the baseline rotation already wins every
seed that sits, so no armed-wins-over-baseline-wins clause
can be a gate here; the win contribution is judged as
witness wins vs baseline witness wins, 4–5 vs 0 expected.)

**Substrate sanity (frozen, untestable-if-failed):** the
baseline leg must earn lesser seats on ≥ 4/12 seeds AND sit
on ≥ 4/12 seeds (the door drive needs sittings to walk). If
either fails, the run is NO-GO on substrate and the witness
drive is UNJUDGED — the substrate moved under the arm, not
the drive.

## Cost bar (frozen — the sim-scalemetric shape, per the task brief)

- **Starvation deaths ≤ baseline + 2 total.**
- **Arm-only starvation ≤ 1** (seeds that starve in the armed
  leg but not in their own baseline leg; 0 expected — the
  pre-sit trajectories are identical by the guard, so any
  arm-only starvation is post-entry substrate noise).
- **Median survival (harness `days`, all seeds) armed ≥ 0.8 ×
  baseline median.** NOTE (why this bar is meaningful on
  this design, recorded before judging): the baseline leg
  ALSO walks doors and wins its sittings (5/12 in the
  judged legs on this band), so its median is already
  win-truncated (112.5d in the feareddoor legs) — the
  doorwalk-confirm median artifact (armed median collapsing
  against a no-win baseline) cannot recur here, because both
  legs win the same sittings on the same days.
- **Per-seed survival non-inferiority is RECORDED, not gated**
  (the feareddoor revised bar: `(armed.won ? 150 :
  armed.days) >= baseline.days` per seed). It is computed by
  the analyzer and printed in the evidence; a violation is a
  same-run investigation item, not a frozen gate — the frozen
  gate is the median bar above.

A primary hit that breaches the cost bar is NO-GO. A win can
never breach the cost bar.

## Substrate guard (frozen — per-seed exact reproduction, adapted
## from feareddoor's guard to a lever whose baseline ALSO walks doors)

Both legs walk doors (different doors, possibly), so the
guard compares daily rows BEFORE the first door entry in
either leg:

- **Seeds where neither leg ever enters a door:** armed must
  reproduce the baseline EXACTLY — days, endReason, standing,
  maxWave, wave-4+ kills, final seat.
- **Seeds where either leg enters a door:** armed must
  reproduce the baseline EXACTLY on every daily row BEFORE
  the earlier of the two first-entry days — fields day,
  rawStanding, rosterSize, living, w4kills, seat,
  feastSurgeUsed, sentimentTaught, pairDay, preview ready/why,
  scholarAtHaven.
- **Guard passes iff 12/12 seeds satisfy their applicable
  clause** (8/8 for the pilot). The guard is computed by the
  analyzer from the two corpora and printed in the evidence
  file. A guard miss names the seed and the first differing
  field — it is an instrument/substrate signal, not a lever
  verdict by itself, but the run is NO-GO if the guard is not
  12/12 (the instrument must be exact before the lever is
  judged).

## Secondaries (frozen)

Doors offered per sat seed (names, recorded in the sit/door
event) / witness offered per seed / witness entered per seed
(door, branch, day, witness-first vs fallback, rule) /
witness wins per seed / finals reached / downgrades taken
(second door entered? which?) / conscript refusals /
trial-only skips / challenge beats answered / wins per leg,
national, wave 4–5 unlocks, median survival (all seeds, and
non-won, both reported for the record — NEITHER is a gate
beyond the frozen median bar above), pair days, starvation
deaths per seed, feast surge + foodDeeds per seed, links
formed per seed, days the run continues after an entry
(modal-stall check), per-seed entry lag (sit day → entry day,
0 by construction — verify it), witness offered-but-unwalked
per seed (must be 0 in the armed leg by construction —
verify it; in the baseline leg it is the point of the arm).
Scale-wall numbers (national / table-sat / wins, wave 4–5
unlocks, median survival) reported every run.

## Judge

The run is judged against this header. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If a metric
proves wrong, write it under "metric review" and propose the
revision for the NEXT run. Every evidence file carries a
"metric review" section.

## Panel (§15)

Before/after through `scripts/balance-panel.js` — the
doorwalk panel-builder pattern
(`scripts/build-witnessdoor-panels-20261107.js`): panels built
from the two per-seed corpora (paired seeds, pseudo-policy
`'witnessdoor'`), scorecard compare, the compare `.md`
attached to the evidence file. The panel is the instrument,
the pre-registered threshold is the judge. The panel measures
the neutral before/after (survival, wins, rank, arc); the
door metrics come from this arm's own driver corpora.
Telemetry deviation check: `scripts/telemetry-check.js`
REFUSES recorder-corpus input by design (same refusal as
sitstep2/feastdrive/takeseat/doorwalk pilot/feareddoor) —
record the refusal, no LOUD line expected; zero src/js
changed, so no Game-telemetry baseline exists to deviate
from.

## Convergence state reported

converging | converged | parked | killed-at-pilot, per axis
scale-onramp.

## Tooling (new this run, committed before any judged sim)

- `scripts/policies/competent-witnessdoor-b.js` — the
  witness-first wrapper policy (mirror of
  competent-feareddoor-b.js with 'witness' in place of
  'feared'; `WITNESSDOOR_B=1`, default OFF).
- `scripts/witnessdoor-b-driver-20261107.js` — the driver
  (mirror of the feareddoor driver; corpora
  `perseed-witnessdoor-b-baseline/` and
  `perseed-witnessdoor-b-armed/`, pilot corpora
  `perseed-witnessdoor-b-pilot-baseline/` and
  `perseed-witnessdoor-b-pilot-armed/`; the driver's
  tableLines filter extended with witness win/epilogue lines
  — "the trial of the judges", "the dock has a second chair",
  "Your own record convicted you", "Read the charges",
  "Offer them a way back").
- `scripts/witnessdoor-b-analyze-20261107.js` — the analyzer
  (mirror of the feareddoor analyzer; judges the frozen bars
  above — witness entered ≥4/12 AND margin ≥3, witness wins
  recorded, guard 12/12, cost bar starvation ≤ baseline+2 /
  arm-only ≤1 / median ≥0.8× baseline, per-seed
  non-inferiority recorded; writes
  `/tmp/witnessdoor-b-analysis.json`, working copy).
- `scripts/build-witnessdoor-panels-20261107.js` — the panel
  builder (mirror of the feareddoor builder; seeds
  53201–53212, corpora `perseed-witnessdoor-b-*`, run names
  `witnessdoor-baseline/armed`, out prefix
  `witnessdoor-panel`).
- `scripts/test-witnessdoor-b-20261107.js` — the proof
  (mirror of the feareddoor proof: RED gate-OFF, GREEN
  fixtures incl. witness-first mapping pinned for this band
  and the unprefixed-offered-id shape, COMPOSITION exactly-
  once fixtures on a real loaded game, LIVE neutrality on
  seed 53001, LIVE SMOKE on a baseline sat seed,
  ANALYZER pure-function fixtures incl. witnessWin and its
  downgrade-negates variant).

## Proof (before any judged sim)

`scripts/test-witnessdoor-b-20261107.js`: sections A/B/C/E
green BEFORE the baseline leg; the live neutrality legs (D)
green before the baseline leg; the live smoke leg (D2) green
before the ARMED leg (it needs a sat seed, which only the
baseline leg can name — the baseline leg is the band
re-check, not the judged comparison). check.js --quick NOT
required: zero src/js in this arm.
