# sim-trialcombat-b — prereg (FROZEN)

**Arm:** sim-trialcombat-b (run fleshout-loop-b-20261108T0530Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** New
wrapper policy `scripts/policies/competent-trialcombat-b.js` composing
the proven feared-first door drive (`scripts/policies/
competent-feareddoor-b.js`, FEAREDDOOR_B=1) UNDER a trial opt-in:
at feared beat 1 (CALIBRATION) choose `beat:trial` when offered.
**Band:** pilot 53901–53908 (FRESH — see freshness check below).
**Horizon:** 150d death-aware. **Legs:** baseline = the
tableseat-nowait substrate + feared walk WITHOUT the trial
(FEAREDDOOR_B=1, TRIALCOMBAT_B unset — the feareddoor drain
verbatim: first-option beats, `beat:trial` skipped); armed = the
same substrate with TRIALCOMBAT_B=1 (trial taken when offered).
8 files per leg. **Base:** master 8dc3d16d2.

## The blank

The sit is built (sim-takeseat-b: 5/8 sat) and the feared door is
measured (sim-feareddoor-b: feared walked 5/5, won 5/5 on band
53201–53212) — but the trial-by-combat door inside the feared
path has never been entered in any sim: every prior door drain
skips `beat:trial` by rule ("trial-by-combat is opt-in only").
The trial is the game's only opt-in existential risk (TABLE.md:24
"Only trial-by-combat (opt-in, legible) risks the Bearer's life";
TABLE.md:119 "Trial by combat (opt-in): face the Table's Champion
blow-by-blow") and the only door with death behind it. This arm
measures whether it can be entered, fought, and won — and what
it costs.

## The route (read from code, not guessed)

- The trial is reachable from exactly ONE place: the FEARED
  path, beat 2 ("CALIBRATION", index 1), choice id `trial`
  (`src/js/table-feared.js:144-152`): the choice list at beat 1
  appends `{ id: 'trial', effects: { trial: true } }` iff
  `!T.trialRefused`. No other path def carries a `trial` effect
  (only `table.js:1354` reads `eff.trial`, calling
  `tableTrialByCombat()`).
- The feared door is earned iff the seat is earned (lesser+) AND
  `might + killed >= 6` (`table-feared.js` prereq). The policy
  never forces an unearned door.
- `tableTrialByCombat()` (`table-feared.js:144-243`) stages a REAL
  fight: `startCombat('finale', { tableTrial: true })` — the
  Finale, wave-5 titan (1800–2200 HP, attacks 60–85 / 45–70 /
  70–100, plus a once-per-fight 150–200 unavoidable strike after
  a 3-round countdown; `src/data/monsters.json:7838`,
  `src/data/titans.json:11`). The open-world campaign gates
  (three-node march, muster of 20) do NOT apply at the table
  (`_tableTrialDirect`). `tbEnd` resumes the table
  (`tableTrialResume`): won → terror 10; lost → weakened +1,
  terror −3, and if the Bearer dies the mantle passes mid-table.
- SEAT-TAKER GUARD (`table-feared.js:148-163`): if the sitter is
  a villager (seatTaker.id !== villagerId) the trial is WITHHELD
  with an honest line and the calibration continues without it.
  The sit drive takes the seat as the scholar (table.js:848-850
  sets seatTaker to the Bearer, self: true), and this policy
  NEVER answers a `seat:*` option — so the guard is expected
  NOT to fire on this substrate; if it does, the analyzer
  records it as a withheld trial, not an offered one.
- A withdrawn trial stays withdrawn (`trialRefused`): after an
  honest refusal / a champion who does not come, the door is not
  offered again on this walk. The policy never refuses, so
  refusal can only come from the engine (gate refusal, seat-taker
  guard, champion no-show).
- The trial fight is driven by the harness default fight driver
  (strike nearest live monster, no abilities) — the same driver
  that plays every field fight in these sims. That is the
  measurement: whether the default-driven Bearer can beat the
  Finale, not whether a tuned fighter could. Fighter counts,
  rounds, and damage are recorded from the instrument's fight
  record and the trial transcript.

## Frozen policy (do not tune)

- **Baseline leg:** FEAREDDOOR_B=1, TRIALCOMBAT_B unset.
  Feared-first door rule, first-option beats, trial NEVER taken
  (the feareddoor drain verbatim). The baseline reproduces the
  feareddoor arm's feared-walk behavior on a fresh band.
- **Armed leg:** FEAREDDOOR_B=1 + TRIALCOMBAT_B=1. Door rule
  identical. Beat rule identical EXCEPT: at a `challenge`-phase
  modal where `T.path === 'feared'` AND `T.beat === 1` AND
  `beat:trial` is among the offered options, choose
  `beat:trial`. That is the whole lever: one option, one beat,
  one path. "Offered and earned" means exactly this: the engine
  offered the trial on an earned feared walk with a player
  sitter; the policy takes it every time it is offered.
- Downgrade re-applies the feared-first rule (feareddoor
  verbatim). Finals first option. Dark conscript REFUSED.
  Branches stay ledger-earned — the driver NEVER overrides
  tableBranch. The driver NEVER answers a `seat:*` option and
  NEVER calls tableOfferSeatTaker / tableChooseSeatTaker.
- The trial fight itself is NOT policy-driven beyond the
  harness default: no ability use, no flee, no sacrifice
  mechanic. If the Finale's countdown strike or its growth
  kills the Bearer, that is the measured outcome.

## Frozen bars (judged here, never re-scored)

| Bar | Threshold | Notes |
|---|---|---|
| PRIMARY: trial-combat entered armed | **≥ 2/8** | a `beat:trial` choose on an earned feared walk |
| PRIMARY: trial-combat wins armed | **≥ 1/8** | `◈ TRIAL WON` in the trial transcript (terror 10) |
| SUBSTRATE SANITY: baseline lesser ≥ 2/8 AND sat ≥ 2/8 | 2/8 each | the darkwit convention; catches a dead band before any armed spend |
| SUBSTRATE GUARD: per-seed exact reproduction | **8/8** | feareddoor guard: seeds where neither leg enters a door reproduce the baseline EXACTLY whole-run; seeds where either leg enters a door reproduce EXACTLY on every daily row BEFORE the earlier of the two first-entry days (the trial can only diverge a run at/after entry) |
| COST: starvation ≤ baseline + 2 total | baseline + 2 | total starvation deaths across the 8 seeds |
| COST: median survival ≥ 0.8× baseline | 0.8× | median days, all seeds |
| SECONDARY (recorded, not gated): feared entered/won per leg; trial OFFERED rate (seeds where `beat:trial` appeared at feared beat 1); trial fight rounds / Finale HP left / Bearer HP; scholar death in trial (mantle pass); wins; scale-wall numbers |

**Verdict rules.** GO iff PRIMARY (both legs) + SANITY + GUARD +
COST all pass. NO-GO at pilot iff any frozen bar fails — a miss
is NO-GO, never re-scored against a friendlier metric. If the
trial is never OFFERED on the pilot band, that is a DIAG finding
(record offered/earned rates per seed, do not re-scope): the
verdict is DIAG-NO-GO "trial never offered on this band" with
the mechanism named (feared prereq unmet? sitter guard? beat
never reached?). If no trial-combat door is reachable in play at
all (no route from any earned door), the verdict is
DIAG-NO-GO "door family absent/unreachable" with the code
citation — still a reachability verdict, not a failure. No
confirm is run on a pilot NO-GO.

## Seed-band freshness (mandatory)

- **Chosen band: 53901–53908.** Suggested first try in the task
  brief; verified before this prereg was written.
- **Search scope (all on master 8dc3d16d2, 2026-11-08T06:2xZ):**
  (1) `git grep -l -F` for each of 53901–53908 across all
  `evidence/*/sim-*-prereg.md` — zero hits (exit 1);
  (2) same exact-seed search across all `evidence/*/sim-*.md`
  — zero hits; (3) prefix search `git grep -l -F "5390"`
  across ALL `evidence/*/*.md` and `evidence/*/*/*.md` (catches
  ranges like 53900–53910 that would not contain an exact seed
  string) — zero hits; (4) `grep -rn "5390"` in the goal
  workspace `hidden_files/convergence-tracker.md`,
  `hidden_files/sim-findings.md`, `hidden_files/lever-claims/`
  — zero hits; (5) `grep -rn "5390"` in the checked-out
  `evidence/2026-11-08/` (today's arms) — zero hits.
- **Result: FRESH.** No prior prereg, evidence .md, tracker,
  findings item, or claim names any seed in 53901–53908 or the
  5390x range. (The darkwit lesson is applied: sim-compvet's
  band was named in its evidence .md with no prereg file — hence
  scope (2) and (3) above cover dated evidence .md, not preregs
  alone. JSON corpora were not grepped: they are outputs, not
  reservations.)
- **Fallback:** if the pilot baseline fails substrate sanity
  (sits < 2/8 or lesser < 2/8), move to the next verified-fresh
  band 53911–53918 (verify with the same scope before use) and
  record the move in the evidence file. Do NOT re-use 53201
  (collapsed on this tip per darkwit: 0/8 sits) or 53701
  (3 seeds used by sim-compvet 2026-10-18).

## Horizon + why

150d death-aware: the sit floor is day 90, the feared walk
resolves the sit day, and the trial fight + its aftermath
(mantle pass, weakened negotiation, finals) play out the same
day or within days. 150d leaves 60 days after the floor for
the village to live with the outcome — the same horizon the
door arms used, so the numbers compare. Dead villages stop
simulating (+10d tail max).

## Policies

- Baseline: `scripts/policies/competent-trialcombat-b.js`
  with FEAREDDOOR_B=1, TRIALCOMBAT_B unset.
- Armed: same policy with FEAREDDOOR_B=1, TRIALCOMBAT_B=1.
- Substrate (both legs): competent-linkfeast-b composite
  (linkdrive + feastdrive, frozen) + sit drive (TAKESEAT_B=1).
- Driver: `scripts/trialcombat-b-driver-20261107.js`
  (darkwit/feareddoor driver pattern: sit recorder reused
  verbatim, door-verb recording, tablePrompt capture for the
  beat framing + trial lines, ledger vector per daily row).
- Analyzer: `scripts/trialcombat-b-analyze-20261107.js`
  (feareddoor analyzer pattern + trial offered/entered/won
  from door verbs, tablePrompts, and trial transcript lines).
- Panel: `scripts/build-trialcombat-panels-20261107.js`
  (balanced panel via `scripts/balance-panel.js`, §15; compare
  .md attached to the evidence file).
- Proof: `scripts/test-trialcombat-b-20261107.js` (RED phase:
  gate-off delegation byte-identical to feareddoor; trial pick
  only at feared beat 1 with the option present; never at other
  beats/paths; trial-only modal skips to first safe option when
  the gate is off; live smoke on one seed).

## Sense test

Read at least one trial transcript end-to-end (tablePrompt
capture + tableLines + deathSays for the trial seed): does the
Champion fight read as a fight (rounds, hits, the countdown)?
Does the opt-in read as a choice (the demand, the pause, the
stakes)? Does a loss read as a mantle passing, not a missing
trigger? Judge meaning, not just counts (SENSE-TESTING LAW).

## Metric review (to be filled in the evidence file)

Pre-registered metrics bind this run. If a metric proves
wrong, write it here in the evidence file under "metric
review" and propose the revision for the NEXT run — never
re-score this run.
