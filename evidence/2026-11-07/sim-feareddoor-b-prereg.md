# sim-feareddoor-b — prereg (the feared-door arm: walk feared when offered)

**Arm:** sim-feareddoor-b (run fleshout-loop-b-20261107T1430Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file — in
particular scripts/policies/competent-doorwalk-b.js is required,
never edited.** New wrapper policy file composing the feared-first
door rule onto the doorwalk policy
(`scripts/policies/competent-feareddoor-b.js`). **Base:** branch
`sim-feareddoor-b` reset --hard to the doorwalk tip `660825ea2`
(the doorwalk branch rebased onto cf22937b8; verified `git log
--oneline -1` = 660825ea2, `git status --short` empty). **Band:**
53201–53212, FRESH (see freshness below). **Horizon:** 150d
death-aware. **Policies:** baseline = doorwalk rotation
(`DOORWALK_B=1`, `FEAREDDOOR_B` unset — sits happen, the
rotation walks the doors); armed = the same substrate with
`FEAREDDOOR_B=1` added (feared walked when offered and earned,
else the rotation exactly).

## Canon

READ first: `docs/CANON.md`, then `docs/TABLE.md` (the endgame
Table — the seat, the seven doors, sanctity, the day-90 floor,
the sticky offer). **No canon is invented here.** Every
mechanism claim below is read from `src/js/table.js` /
`src/js/table-feared.js` and cited to it.

## The blank (from sim-doorwalk-b, evidence/2026-11-07/sim-doorwalk-b.md)

On frozen band 53001–53008, 150d, the doorwalk arm walked 5/5
doors and won 5/5 — but feared was offered on all five sits and
NEVER walked (never assigned, never the fallback — the fallback
was never needed), and witness was offered on four sits and also
un-walked. THIS arm walks the feared door: a policy that, after
the sit, enters the feared door when the engine offers it and
plays the path to its resolution through the engine's real
door-choice verb.

**STEVE-CALL behind this arm (do not re-decide it):** only the
player chooses the village's path and who takes the seat (Steve
2026-10-26). This arm MEASURES whether walking feared works,
not whether bots should sit or which path a player should take.
The policy is a measurement instrument, default OFF, policy-side
only. It never picks a sitter, never answers a seat-taker choice.
Witness / dark branches / trial-by-combat stay for later runs;
this arm walks feared only.

## Band freshness (checked this run, 2026-11-07)

Band 53201–53212 is named ONLY in
`evidence/2026-11-07/sim-winnability-round-1430.md` (reserved
there for the doorwalk confirm, never judged) and in NO
`sim-*-prereg.md`. Checked by grep over all of `evidence/`:
`grep -rln "53201" evidence/*/sim-*-prereg.md` returns empty;
`grep -rln "53201–53212" evidence/ .../convergence-tracker.md
.../sim-findings.md` returns only the 1430Z round evidence, the
tracker, and the findings file (all three citing the same
reservation). The broad grep's other hits are coincidental
numeric values (`"pantry": 53201`) inside old per-seed JSON
corpora, not seed-band namings. Coordinator-verified
2026-11-07T16:00Z; re-verified by this worker before writing
this prereg.

## Prior art — checked, not rebuilt blind

`scripts/policies/tablepaths.js` (2026-10-19) and
`scripts/policies/tablepaths-nowait.js` (2026-10-24) are the
proven door drivers; `scripts/policies/competent-doorwalk-b.js`
(2026-11-07, sim-doorwalk-b) is the proven gate + drain shape
on the current takeseat substrate, with the per-seed door
rotation and the offered-doors recording. This arm copies that
gate + drain shape and changes ONLY the door pick at the paths
offer (feared first). It does not rebuild the drain blind.

## Mechanism (engine-honest, from src/js/table.js and src/js/table-feared.js)

- The sit and the offer work exactly as in the doorwalk prereg
  (`tableTakeSeat()` → `tableScene()` → `tableOfferPaths`,
  phase `'paths'`, `chooseTableOption('path:<id>')` →
  `tableStartPath`, branch read from the ledger via
  `tableBranch`, never overridden by the policy).
- The feared prereq (`table-feared.js`, `FEARED_DEF.prereq`):
  lesser+ seat AND might+killed ≥ 6 ("The table has seen
  fiercer ledgers" below 6). Strength scales with distinct
  monsters faced blow-by-blow. The door is offered only when
  the engine earns it; the policy never forces an unearned door.
- The feared challenge is three beats with terror/horror
  meters in tension; horror CURDLES at 5 — any beat choice
  that would push horror to 5+ fails the path ("the
  demonstration curdled — your own people flinched, visibly,
  where trillions watched") and the table offers a downgrade.
  Trial-by-combat is offered as a beat-2 choice (`trial`) and
  is NEVER taken by this drain (opt-in only). The dark
  conscript rule is the same drain as doorwalk (refused).
- **Consequence for reading the judged numbers (recorded here,
  NOT a tuning excuse):** under the frozen first-option drain,
  beat 1 takes 'kill' (horror 0→2), beat 2 takes 'lean'
  (horror 2→4), beat 3 LIGHT takes 'spend' (horror 4→1 — the
  path plays to its final and can win) while beat 3 DARK
  takes 'name' (horror 4→7 — curdles, the path fails, the
  drain is offered a downgrade). A DARK-branch feared walk is
  therefore EXPECTED to fail into a downgrade under this
  drain; feared wins are expected on LIGHT branches. The
  beat picks are NOT tuned here — tuning them would be a
  different lever (a "play feared well" arm, for a later run).

## The door drive (new file scripts/policies/competent-feareddoor-b.js)

Wrapper over the doorwalk policy: `daily` delegates to
doorwalk daily untouched; `upkeep` with `FEAREDDOOR_B` unset
delegates to doorwalk upkeep exactly (the BASELINE leg); with
`FEAREDDOOR_B=1` runs linkfeast upkeep (feast upkeep + sit
drive) THEN the feared-door drive. Env gate `FEAREDDOOR_B=1`,
default OFF. Zero src/js, zero changes to any existing policy
file. The doorwalk drive itself never runs in the armed leg,
so the two legs differ ONLY in which door is picked at the
paths offer — the substrate guard below judges exactly that.

**THE DOOR RULE (pre-registered, POLICY-SIDE, not canon):**
at a paths-phase offer, (1) if `'feared'` is offered AND
earned, take it (`'feared-first'`, fellBack false). (2) Else
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
the feared-first rule among the remaining earned
`'downgrade:*'` options (feared if still available, else the
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

## Substrate — the doorwalk rotation on a fresh band (re-baselined here)

The baseline leg (`perseed-feareddoor-b-baseline/`) is the
doorwalk rotation with `DOORWALK_B=1` on FRESH band
53201–53212 — it is a RE-BASELINE on the current base
(660825ea2), not a reuse of the frozen-band corpus: the
1430Z coordinator re-baseline showed the frozen band's
trajectories COLLAPSED on cf22937b8 (villages die 54–92d,
sits 5/8→0/8), so no frozen-band number is trusted here.
The armed leg (`perseed-feareddoor-b-armed/`) is the same
substrate with `FEAREDDOOR_B=1`, same seeds, same base, same
days.

**BAND RE-CHECK (runs first, before any judging):** the
baseline leg runs first. If the substrate is dead on this
band too (0/12 sit, villages dying ~70d like the collapsed
frozen band), STOP and report that the substrate moved — do
NOT judge the lever on a dead band. The armed leg runs only
after the baseline leg passes substrate sanity AND the proof
smoke leg (below) is green on a baseline sat seed.

## Primary metric (frozen)

**Feared doors entered ≥ 3/12 armed AND feared wins ≥ 3/12
armed AND armed wins ≥ baseline wins + 2 on identical seeds.**
"Entered" = a seed on which `tableStartPath` ran via the
feared drive for path `'feared'` (phase `'paths'` →
`'challenge'` with path feared, recorded in the driver's
`doorVerbMsgs` + the policy's `walked` list). "Won" = the
seed ends `won:true` with the walked feared door as the
winning path (final answered on feared, no downgrade away
from it — a downgrade win counts for the seed's win total,
not for the feared win count). The baseline leg must show
feared entered 0/12 (the gate is OFF for feared in the
baseline — the RED-phase pin, live; the rotation can still
walk feared by its rule (3) only-feared fallback, which the
analyzer reports separately if it ever fires).

**Substrate sanity (frozen, untestable-if-failed):** the
baseline leg must earn lesser seats on ≥ 4/12 seeds AND sit
on ≥ 4/12 seeds (the door drive needs sittings to walk). If
either fails, the run is NO-GO on substrate and the feared
drive is UNJUDGED — the substrate moved under the arm, not
the drive.

## Cost bar (frozen — THE REVISED BAR from the 1430Z metric review)

The defective frozen median-survival bar from the doorwalk
prereg is NOT used here. The revised bar:

- **Per-seed survival non-inferiority:** no seed dies
  earlier in the armed leg than its own baseline day. A won
  seed counts at horizon 150d (a win is a success, not a
  truncated life). Formally, for every seed:
  `(armed.won ? 150 : armed.days) >= baseline.days`. One
  violation fails the bar.
- **Starvation deaths ≤ baseline + 1 total** (the doorwalk
  bar was baseline + 2; tightened by one because the feared
  drive changes nothing before the sit — any starvation
  movement is substrate noise and the band is fresh).
- **Substrate guard 12/12 per-seed exact pre-first-bind**
  (see below).
- A primary hit that breaches the cost bar is NO-GO. A win
  can never breach the cost bar.

## Substrate guard (frozen — per-seed exact reproduction, adapted
## from doorwalk's guard to a lever whose baseline ALSO walks doors)

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
  clause.** The guard is computed by the analyzer from the two
  corpora and printed in the evidence file. (12/12, not
  doorwalk's 6/8: the feared drive changes nothing before the
  sit, so pre-entry exactness must hold on every seed.)

## Secondaries (frozen)

Doors offered per sat seed (names, recorded in the sit/door
event) / feared offered per seed / feared entered per seed
(door, branch, day, feared-first vs fallback, rule) / feared
wins per seed / finals reached / downgrades taken (second
door entered? which?) / conscript refusals / trial-only
skips / challenge beats answered / wins per leg, national,
wave 4–5 unlocks, median survival (all seeds, reported not
gated), pair days, starvation deaths per seed, feast surge +
foodDeeds per seed, links formed per seed, days the run
continues after an entry (modal-stall check), per-seed entry
lag (sit day → entry day, 0 by construction — verify it),
feared offered-but-unwalked per seed (must be 0 in the armed
leg by construction — verify it; in the baseline leg it is
the point of the arm). Scale-wall numbers (national /
table-sat / wins, wave 4–5 unlocks, median survival) reported
every run.

## Confirm rule (staged, §9–12)

The 12-seed sweep above IS the judged run (pilot + confirm
in one, on the fresh band — the doorwalk pilot already proved
the drain shape 5/5, so this arm spends its seeds on the
feared question directly). There is no separate confirm: if
the primary passes GO, the landing call belongs to the
coordinator (the doorwalk branch is still held; this arm's
commits touch only its own new files so the coordinator can
cherry-pick them whether or not doorwalk lands).

## Judge

The run is judged against this header. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If a metric
proves wrong, write it under "metric review" and propose the
revision for the NEXT run. Every evidence file carries a
"metric review" section.

## Panel (§15)

Before/after through `scripts/balance-panel.js` — the
doorwalk panel-builder pattern
(`scripts/build-feareddoor-panels-20261107.js`): panels built
from the two per-seed corpora (paired seeds, pseudo-policy
`'feareddoor'`), scorecard compare, the compare `.md`
attached to the evidence file. The panel is the instrument,
the pre-registered threshold is the judge. The panel measures
the neutral before/after (survival, wins, rank, arc); the
door metrics come from this arm's own driver corpora. The
panel's deaths/100d rate is read with the doorwalk metric
review in mind (wins are censoring events, not short lives).

## Convergence state reported

converging | converged | parked | killed-at-pilot, per axis
scale-onramp.

## Proof (before any judged sim)

`scripts/test-feareddoor-b-20261107.js`: gate-OFF RED phase
(never drives the verb, pure delegation, zero Game reads when
off), gate-ON fixtures on stub Games (feared-first mapping
pinned for this band, feared offered → walked feared;
feared not offered → doorwalk rotation fallback exactly;
only-feared; fight-live / preview-null / seat-taker /
already-entered / trial-only → classified skips, verb never
called; downgrade re-applies feared-first; conscript
refused; double-entry guard), composition fixture (wrapper
daily runs doorwalk daily exactly once; upkeep runs
linkfeast upkeep exactly once + feared drive when ON, and
doorwalk upkeep exactly once when OFF), a live
trajectory-neutrality check (armed vs baseline on seed 53001
— a no-seat seed on this base, so the drive can never fire —
must reproduce the baseline headline numbers exactly,
proving the idle reads draw no RNG and write no state in
practice), and a live 1-seed smoke leg (a fresh-band sat seed
from the baseline leg, /tmp) asserting structural invariants
only. Proof sections A/B/C/E green BEFORE the baseline leg;
the live neutrality leg green before the baseline leg; the
live smoke leg green before the ARMED leg (it needs a sat
seed, which only the baseline leg can name — the baseline leg
is the band re-check, not the judged comparison).
