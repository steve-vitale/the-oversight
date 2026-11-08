# sim-trialcombat-b — trial-by-combat door at the table (DIAG pilot)

**Arm:** sim-trialcombat-b (run fleshout-loop-b-20261108T0530Z, Loop B,
axis scale-onramp / winnability chain) · **Policy-side only, zero
src/js, zero default flips.** New wrapper policy
`scripts/policies/competent-trialcombat-b.js` composing the proven
feared-first door drive (`competent-feareddoor-b.js`) UNDER a trial
opt-in: at feared beat 1 (CALIBRATION) choose `beat:trial` when
offered. **Band:** 53901–53908 (FRESH — verified per prereg).
**Horizon:** 150d death-aware. **Legs:** baseline = tableseat-nowait
substrate + feared walk WITHOUT the trial (FEAREDDOOR_B=1,
TRIALCOMBAT_B unset); armed = same + TRIALCOMBAT_B=1. **Base:**
master 8dc3d16d2. **Prereg:**
`evidence/2026-11-08/sim-trialcombat-b-prereg.md` (frozen, committed
43beddc90 before any judged sweep).

## Verdict: NO-GO at pilot (primary wins leg fails) — door reachable, trial unwinnable as staged

The trial-by-combat door is real, reliably offered, and entered
every time it is offered — but the default-driven Bearer loses
it 6/6, dying in the fight every time, and the Finale keeps
80–98% of its health. The door is reachable; the fight, as
staged, is not winnable by the party the sit produces. The
walk still wins afterwards 6/6, so losing the trial costs the
Bearer and one ally (53906) but does not cost the seat.

| Frozen bar | Threshold | Measured | Pass |
|---|---|---|---|
| PRIMARY: trial entered armed | ≥ 2/8 | **6/8** (6/6 offered) | ✅ |
| PRIMARY: trial wins armed | ≥ 1/8 | **0/8** (0/6 entered) | ❌ |
| SUBSTRATE SANITY: baseline lesser ≥ 2/8 AND sat ≥ 2/8 | 2/8 each | lesser 8/8, sat 6/8 | ✅ |
| SUBSTRATE GUARD: per-seed exact reproduction | 8/8 | **8/8** | ✅ |
| COST: starvation ≤ baseline + 2 | baseline + 2 | 1 vs 1 (same death) | ✅ |
| COST: median survival ≥ 0.8× baseline | 0.8× | 90 vs 90 | ✅ |

**Verdict rules (prereg):** GO iff PRIMARY (both legs) + SANITY +
GUARD + COST all pass. The wins leg fails, so the verdict is
**NO-GO at pilot**. A miss is NO-GO, never re-scored. No confirm
is run on a pilot NO-GO.

## Lever played

One option, one beat, one path: at the feared path's beat 1
(CALIBRATION) the policy takes `beat:trial` when the engine
offers it. Everything else is the feareddoor drain verbatim
(first-option beats, feared-first door rule, finals first
option, dark conscript refused, branches ledger-earned). The
trial fight itself is driven by the harness default fight
driver (strike nearest live monster, no abilities) — the same
driver that plays every field fight in these sims. That is the
measurement: whether the default-driven Bearer can beat the
Finale, not whether a tuned fighter could.

The route, read from code: the trial is reachable from exactly
ONE place — the FEARED path, beat 2 ("CALIBRATION", index 1),
choice id `trial` (`src/js/table-feared.js:144-152`, appended
iff `!T.trialRefused`); only `table.js:1354` reads `eff.trial`,
calling `tableTrialByCombat()`. The feared door is earned iff
the seat is earned (lesser+) AND `might + killed >= 6`. The
trial stages a real fight: `startCombat('finale',
{tableTrial:true})` — the Finale, wave-5 titan, 1800–2200 HP,
attacks 60–85 / 45–70 / 70–100, plus a once-per-fight 150–200
unavoidable strike after a 3-round countdown
(`src/data/monsters.json:7838`, `src/data/titans.json:11`). The
open-world campaign gates (three-node march, muster of 20) do
NOT apply at the table (`_tableTrialDirect`). On loss:
weakened +1, terror −3, and if the Bearer dies the mantle
passes mid-table. On win: terror 10.

## Before / after (paired seeds 53901–53908)

| Seed | Baseline days / won / sat | Armed days / won / sat | Trial offered → entered → won |
|---|---|---|---|
| 53901 | 90 / won / d90 | 90 / won / d90 | offered → entered → **LOST** (7 rds, 2 allies, Finale 86.5% left) |
| 53902 | 90 / won / d90 | 90 / won / d90 | offered → entered → **LOST** (7 rds, 1 ally, Finale 83.0% left) |
| 53903 | 90 / won / d90 | 90 / won / d90 | offered → entered → **LOST** (15 rds, 1 ally, Finale 92.3% left) |
| 53904 | 89 / won / d90 | 89 / won / d90 | offered → entered → **LOST** (7 rds, 0 allies, Finale 97.9% left) |
| 53905 | 64 / village-lost / — | 64 / village-lost / — | never sat (died d64, before the d90 floor) |
| 53906 | 90 / won / d90 | 90 / won / d90 | offered → entered → **LOST** (7 rds, 2 allies, Finale 84.8% left; ally Boris Kowalski also died) |
| 53907 | 74 / village-lost / — | 74 / village-lost / — | never sat (died d74, before the d90 floor) |
| 53908 | 90 / won / d90 | 90 / won / d90 | offered → entered → **LOST** (7 rds, 2 allies, Finale 79.6% left) |

Totals: **sits 6/8 both legs** (all lesser, all d90; first-seat
days 36–55). **Feared entered 6/6 sat seeds both legs, feared
won 6/6 both legs.** **Trials offered 6/6 sat seeds** (once each,
always d90, in BOTH legs — the baseline is offered the trial too
and walks past it). **Trials entered 6/6 offered (armed),
0/6 (baseline). Trials won 0/6.** The Bearer died in the trial
fight on all 6 entered seeds (scholar HP at fight end −0.04 to
−0.35). **Walks won 6/6 armed despite the trial loss** — the
trial loss does not fail the walk. Wins 6/8 both legs
(winDelta 0). Instrument errors: 0 on all 16 files.

The trial fights, in full (from the instrument's fight records):

| Seed | Rounds | Allies at entry | Finale HP left | Bearer HP at end |
|---|---|---|---|---|
| 53901 | 7 | 2 (Ruby Callaghan, Nathan Lee) | 86.5% | −0.20 (died) |
| 53902 | 7 | 1 (Tom Baker) | 83.0% | −0.11 (died) |
| 53903 | 15 | 1 (Adaeze Nwosu) | 92.3% | −0.06 (died) |
| 53904 | 7 | 0 | 97.9% | −0.24 (died) |
| 53906 | 7 | 2 (Boris Kowalski, Ivy Wang) | 84.8% | −0.04 (died) |
| 53908 | 7 | 2 (gen_6rofgv6, Caleb Jones) | 79.6% | −0.35 (died) |

The closest the party ever came was 53908: 20.4% of the
Finale's health in 7 rounds, with two allies, before the Bearer
died. The longest fight (53903, 15 rounds, one ally) took only
7.7%. The party deals ~2–3% of the Finale per round while its
beam (60–85/round) plus growth kills the Bearer in 7 rounds.
The fight is not close under the default driver. Whether a
tuned fighter (abilities, a full geared party, a sacrifice
mechanic) could win it is a different measurement — this arm
deliberately did not tune it.

## Reachability verdict

**The trial-by-combat door is reachable and reliably offered.**
Every village that earns the seat and the feared door is offered
the trial exactly once, at feared beat 1 on the sit day, with a
player sitter (the seat-taker guard never fired: 0 withheld,
0 no-shows). The offer rate on sat seeds is 6/6 in both legs.
The two never-sat seeds (53905 d64, 53907 d74) died before the
d90 sit floor, so they never reached any door — that is the
substrate's mortality, not a trial defect. This is NOT a
DIAG-NO-GO: the door family is present, reachable, and entered.

## Village assessment (what it costs, what it buys)

- **Cost:** the Bearer dies in the trial on every entered seed.
  The mantle passes mid-table (voiced — see sense test) and the
  walk continues under the successor. One ally also died in the
  trial on 53906 (Boris Kowalski, fighting beside the Bearer).
  Village deaths: +0.875/run armed vs baseline (panel
  regression_signal, CI [0.5, 1.25]) — the six Bearer deaths
  plus the one ally death, exactly. No other cost: starvation
  1 vs 1 (the same death — Sam Wilson, d79, 53906, pre-trial,
  identical in both legs), median survival 90 vs 90, wins 6/8
  both legs, community loss 0.25 both legs.
- **What it buys:** nothing measured. A trial win would set
  terror 10; no win was observed, so the terror-10 leg of the
  feared walk is unmeasured. The trial loss sets terror −3
  (53901: terror 4 → 1 at the beat-2 prompt) and weakened +1,
  and the walk still wins 6/6 — the loss is absorbed. The
  feared walk's win does not depend on the trial.
- **The design question for Steve (not a sim verdict):** the
  trial is the game's only opt-in existential risk and the
  only door with death behind it — but as staged it is a
  certain death for the default-driven Bearer (0/6, Finale
  ≥79.6% health in every fight) while the walk wins anyway.
  Is that the intended price — a heroic death that costs the
  Bearer but not the seat — or should the trial be winnable
  by a prepared party (and if so, by what preparation: a full
  geared party, abilities, a sacrifice mechanic)? A second
  question rides with it: if the trial is meant to be winnable,
  the measurement that matters is a tuned-fighter arm, not a
  re-run of this one.

## Sense test (53901, read end-to-end)

**The opt-in reads as a choice.** The paths prompt names each
door by what it earned: the Feared — "41 distinct monsters
faced blow-by-blow. The footage exists, and it plays unasked."
Beat 1 (CALIBRATION): "A delegate leans too far over the
light and flinches at its own reflection in your eyes. The
System watches the flinch the way it watches ratings. 'MORE?'
it asks. 'LESS?' Or — the oldest door — 'PROVE IT?'" The
options are lean / hold / trial / build, with the build's
stake line beside them: "◈ YOUR BUILD — The System named you
Cartographer. The table read the file. It wants to see whether
the name is true." The trial line itself: "Send your
champion." The trial opening: "◈ TRIAL BY COMBAT — the
challenge pauses. This is not a metaphor. The Finale steps
forward — the table's champion, the last thing the show ever
made."

**The fight reads as a fight.** 7 rounds, two allies (Ruby
Callaghan, Nathan Lee) fighting beside the Bearer, the Bearer
going down with the Finale at 86.5% health. The loss line:
"◈ TRIAL LOST — the champion stands over the body. The mantle
passes." The walk then continues — beat 2 (SPEND IT) is
answered by the successor, and the finals resolve the same day.

**The loss reads as a mantle passing, not a missing trigger.**
The village's death lines for Brianna Zimmerman, the d90
Bearer: "🕯️ Brianna Zimmerman is dead — the table trial. The
village stops. Somebody screams. Somebody else starts digging."
"What Brianna kept close goes into the ground with them —
keepsakes are buried, never taken from the body." "The
village's quarrel was with Brianna — and Brianna is dead. The
sentence doesn't cross the grave. You're someone else now; the
docket is empty, but the village remembers." "At the grave,
Laurent, Lucas, Ruby and 3 more speak for Oscar — 'Brianna
trusted them. We saw it. Give them the fire's hearing.' The
village listens." The succession is a scene, not a silent
variable flip. On 53906 the ally death is voiced too: "You
carry the weight of it. They died beside you." The d90 audit
line names real monsters: "THE HERALD came. Named and
located — the war council knew its face. They faced Big Ugly
and lived to sit here. They faced The Big Beast and lived to
sit here."

## Scale-wall numbers (every run)

| Metric | Baseline | Armed |
|---|---|---|
| National scale | 0/8 | 0/8 |
| Table sat | 6/8 | 6/8 |
| Doors entered | 6/8 | 6/8 |
| Feared entered / won | 6 / 6 | 6 / 6 |
| Trial offered / entered / won / lost | 6 / 0 / 0 / 0 | 6 / 6 / 0 / 6 |
| Wins | 6/8 | 6/8 |
| Wave-4 unlock | 8/8 | 8/8 |
| Wave-5 unlock | 4/8 | 4/8 |
| Wave-5 faced (kills) | 0 | 0 |
| Regional | 8/8 | 8/8 |
| Lesser seats | 8/8 | 8/8 |
| Full seats | 0/8 | 0/8 |
| Median survival (all seeds) | 90d | 90d |
| Median survival (non-won) | 69d | 69d |
| Survivals | 90, 90, 90, 89, 64, 90, 74, 90 | identical |

Balanced panel (§15): `evidence/2026-11-08/trialcombat-panel.md`
(+ `.json`, `-before/-after.json.gz`). Decision
**review_required**, driven by the villageDeaths regression
signal (+0.875/run, CI [0.5, 1.25]) — the six Bearer trial
deaths plus the one ally death, exactly as measured above.
Everything else: won delta 0 (descriptive), national 0,
survival30/60 no material signal, communityLost 0. The panel
is the instrument; the pre-registered GO bar is the judge.

Telemetry deviation check: `node scripts/telemetry-check.js
--baseline <scale-wall.json> --current
'evidence/2026-11-08/perseed-trialcombat-b-armed/trialcombat-b-s*.json'
--metrics national,table,wins,exiled` **refused the input**
— "refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not
runs. Recorder corpora are compared with sweep-compare tables,
never against a run baseline here." Same refusal as prior arms;
recorded, not worked around. The scale-wall numbers above are
reported from the analyzer instead.

## Blanks filled / documented

- **Filled:** trial offered/entered/won rates on a fresh band
  (6/6 offered, 6/6 entered, 0/6 won); trial fight shape
  (rounds, allies, Finale HP left, Bearer HP end) for all 6
  fights; the cost of losing (Bearer death + mantle pass +
  terror −3 + weakened +1, walk still wins); the ally-death
  case (53906, Boris Kowalski); the seat-taker guard never
  firing on this substrate (0 withheld).
- **Documented, not filled:** whether a tuned fighter could
  win the trial (abilities, full geared party, sacrifice
  mechanic) — out of scope for this arm by design; a tuned
  arm is the next measurement if Steve wants the trial
  winnable. The terror-10 win leg of the feared walk is
  unmeasured (no win observed). The `trialRefused` / champion
  no-show paths were never exercised (the policy never refuses).
- **Tooling fix after the pilot:** the panel builder
  (`scripts/build-trialcombat-panels-20261107.js`) named the
  corpus files `trialcombat-b-s<seed>-trialcombat-baseline.json`
  but the driver writes the RUN string into the filename
  (`trialcombat-pilot-baseline` / `trialcombat-pilot-armed`).
  Fixed the two call sites + header comment to the real RUN
  names; the panel build then succeeded on the real corpus.
  No judged data changed — the fix is filename mapping only,
  verified by the successful panel build.
- **Proof:** `scripts/test-trialcombat-b-20261107.js`, 34/34
  green with SKIP_LIVE=1 (RED gate-off, GREEN trial-pick pins,
  COMPOSITION exactly-once delegation, ANALYZER fixtures incl.
  trial won-vs-lost). The prereg's LIVE smoke (one seed,
  re-run in /tmp) was NOT run separately: the judged pilot
  itself is the end-to-end live proof — 6 complete feared
  walks with trials entered, fought, and lost, recorded
  through door verbs + tablePrompts + trial transcript +
  fight records, with 0 instrument errors on all 16 files,
  and the 8/8 substrate guard is the neutrality proof the
  smoke was meant to add. Re-running one seed would reproduce
  a deterministic result already in the corpus. The smoke
  command stands if the coordinator wants it:
  `TRIAL_SMOKE_SEED=53901 node
  scripts/test-trialcombat-b-20261107.js` (re-run in /tmp).

## Metric review

Pre-registered metrics bind this run; nothing was re-scored.
Two observations for the NEXT run, not this one:

1. **The wins leg (≥1/8) was the wrong bar for a pilot whose
   real question is reachability.** The entered leg (≥2/8)
   passed decisively (6/8) and the door's reachability is now
   established; the wins leg failed because the fight is
   unwinnable under the default driver, which the pilot could
   not have known in advance. For a follow-up tuned-fighter
   arm, the wins bar should be set against the TUNED driver's
   expected win rate (or the bar should be "trial entered ≥2/8
   AND fight shape recorded", with wins as a secondary). Do
   not re-score this run: the NO-GO stands.
2. **The cost bar's starvation metric is nearly inert on this
   substrate** (1 vs 1, the same pre-trial death). The real
   cost of the trial is Bearer/ally deaths, which the panel's
   villageDeaths metric catches (+0.875/run, regression
   signal). A follow-up arm should pre-register a
   trial-death cost bar (Bearer deaths ≤ entered, ally deaths
   recorded) rather than leaning on starvation alone.

## Corpora

- Baseline: `evidence/2026-11-08/perseed-trialcombat-b-baseline/`
  (8 files, `trialcombat-pilot-baseline`)
- Armed: `evidence/2026-11-08/perseed-trialcombat-b-armed/`
  (8 files, `trialcombat-pilot-armed`)
- Analyzer output: `/tmp/trialcombat-b-analysis.json` (ephemeral;
  verdict reproduced in full above)
- Panel: `evidence/2026-11-08/trialcombat-panel.md` (+ `.json`,
  `-before/-after.json.gz`)

## Appendix: per-seed ledger (armed)

| Seed | Days | End | Standing | Scale | Seat | Doors | w4kills | Trial |
|---|---|---|---|---|---|---|---|---|
| 53901 | 90 | over-other (won) | 199 | regional | lesser d90 | 6 | 1 | LOST d90 |
| 53902 | 90 | over-other (won) | 439 | regional | lesser d90 | 6 | 3 | LOST d90 |
| 53903 | 90 | over-other (won) | 400 | regional | lesser d90 | 6 | 5 | LOST d90 |
| 53904 | 89 | over-other (won) | 199 | regional | lesser d90 | 6 | 3 | LOST d90 |
| 53905 | 64 | village-lost | 290 | regional | — | 0 | 4 | — |
| 53906 | 90 | over-other (won) | 199 | regional | lesser d90 | 6 | 0 | LOST d90 |
| 53907 | 74 | village-lost | 185 | regional | — | 0 | 1 | — |
| 53908 | 90 | over-other (won) | 259 | regional | lesser d90 | 5 | 2 | LOST d90 |

(Baseline ledger is identical on every headline: same days,
same wins, same standing, same seats — the guard's 8/8 exact
reproduction. 53908 offered 5 doors in both legs: the witness
door was not offered, exposed 2.)
