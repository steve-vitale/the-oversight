# sim-medcure-b — prereg (FIRST NUMBERS, zero src/js)

**Arm:** sim-medcure-b (FIRST NUMBERS measurement) · **Run:** fleshout-loop-b-20261110T1730Z (Loop B) · **Axis:** winnability chain / scale-onramp (converging, NOT converged) · **Branch:** sim-medcure-b, base master `28a3952fd` (worktree `~/workspace/worktrees/sim-medcure-b`) · **Prereg committed BEFORE any judged computation.**

## The question

Coverage Program Tier 1 #4 (coverage-audit-20261110.md §4): Disease / medic
cure channels has never been judged against a pre-registered bar. The
2026-11-08 census (sim-medicdiag-a, competent, band 96301–96308) found
wound-fever mortality 2/85 (2.4%) with a healer present vs 18/75 (24.0%)
without one, and named Haven Medic Duty as the fix. The duty has since
LANDED on master (d910dc6da, verdict NO-GO: G1a FAIL 23.5% vs 30%) with
both cure channels (healing ability OR proper medicine) — but the medicine
channel fired 0 times in 8 live seeds (no pharmacy stock found) and the
treated-share join was blind to cures. This arm records the FIRST NUMBERS
on current master, on a fresh band: the wound-fever death rate by healer
presence re-measured post-duty, the cure-channel split, and pharmacy stock
over time. No lever change, no src/js — instrument only.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/DISEASES.md` — two pools,
  never mix; mundane pool (gutrot, trichinosis, Fever `disease`, lockjaw,
  wound_fever, trembles, radiation_sickness); alien pool never diagnosed,
  eased, or cured by mundane medicine. Wound fever is a mundane infected
  wound (dirty wounds, botched tick removal). Cure tiers: folk remedies →
  occupation medicine → specific ruin medicine → earned healer deepenings
  → the Fever's End synergy. No canon doc covers how many medics a village
  should have (medicdiag finding) — that gap is a finding, not an invention.
- Code facts verified BEFORE this prereg (read, not assumed):
  NPC sickness rides `v.sick[vid] = { name, daysLeft, severity }`
  (`villageSicknessTick`, game.js ~32835); `villagerDiseaseId(rec)` maps
  `'wound fever'` → `wound_fever` (game.js ~14354) and returns null for
  food-poisoning names. A wound-fever death routes through `hurtVillager`
  with cause `wound_fever` when the village knows the disease, else
  `sickness` (game.js ~32890). The duty cure
  `medicDutyCureAttempt(holder, pid, nm)` (game.js ~33172) tries Channel 1
  (a held healing ability: herbal_remedy / field_medicine / triage, via
  `cureEffectFor`) then Channel 2 (proper medicine from the Haven pharmacy,
  `stashState().medicine`: medType + doses; antibiotics kill bacterial,
  antiparasitics kill parasitic), increments `v.medicDutyCures[via]`, and
  deletes `v.sick[pid]` — it never calls `cureStatus`, so a duty cure
  leaves no cureEvent in a feveranat corpus. Pharmacy stock is
  `v.stash.medicine` (storage.js `stashState()`); medicine is ruin-found
  and rare (`med_antibiotics` / `med_antiparasitic`, 3 doses each, game.js
  ~210). `campHealerId('haven')` is the healer-presence read (same as
  medicdiag/medicduty).
- `docs/MEASUREMENT.md` §§9–12, 14–15 read: staged seeds, death-aware
  horizons, pre-registration, metric binding, balanced panels. This is a
  FIRST-NUMBERS measurement, not a lever: the §9 pilot staging governs it
  as an 8-seed pilot. No panel (§15): a measurement-only arm with no
  before/after has nothing to compare; the wall numbers are reported
  instead. No confirm spend is pre-authorized: a confirm needs a separate
  prereg amendment with a fresh band.

## Seed-band freshness — 160209–160216 (8 seeds, pilot)

Checked 2026-11-10, BEFORE this prereg was committed, per the
seed-band freshness skill (all dated preregs + tracker/findings, not just
today):
- All dated preregs (`evidence/*/sim-*-prereg.md`, word-boundary grep for
  160209–160216): 0 files name any of them.
- Goal tracker + findings (`hidden_files/convergence-tracker.md`,
  `hidden_files/sim-findings.md`, word-boundary grep): 0 hits.
- Sibling arm sim-secondlink-a (Loop A, live today) uses band 99101–99108
  (its prereg §152) — no collision. No other sibling arm prereg names a
  1602xx band.
- Substring hits for "16021" in goal hidden_files evidence JSON are
  interior digits of larger numbers (pantry kcal values, float tails, hash
  fragments) — verified by context scan: 0 seed-pattern hits (`"seed":
  1602xx`, `seed-1602xx`, `-s1602xx`). No seed naming anywhere.
- No standalone forbidden/contaminated band list names 160209–160216.
- Must NOT reuse 96301–96308 (medicdiag/medicduty/feveranat band),
  99101–99108 (sibling secondlink), 58201–58208 (sicknessdiag),
  95205–95208 (medchannel-seed-a), 99201–99208 (standacc-b list).

## Precondition (verified at base, before prereg)

`node scripts/godpath/test-measurement-proof-update.js` at base
28a3952fd: **9 passed, 0 failed, 0 todo** (phase 0). Green — proceed. Had
it been red, this arm would have STOPPED and reported to the coordinator
without regenerating a panel.

## Legs (one judged leg — measurement, not a before/after lever)

- **Main leg — competent** (`scripts/policies/competent.js`, UNMODIFIED),
  env `PLENTYDEPRI=1 DEPOSITGATE=1`, horizon 150d death-aware (dead
  villages stop simulating, +10d tail max per the harness). 8 seeds
  160209–160216. One shared sweep; no variants.
- **Horizon why:** 150d matches the medicdiag/medicduty census horizon,
  so the re-measured wound-fever rates are comparable to the 2026-11-08
  census; death-aware cap keeps dead villages from padding the
  denominator with post-death days.
- **Instrument** (new, scripts only): `scripts/medcure-driver-20261110.js`
  (recorder: daily snapshot + death capture + duty-cure event capture +
  BARE neutrality pass) and `scripts/medcure-analyze-20261110.js`
  (episode builder + the three metrics + wall numbers). Corpora under
  `evidence/2026-11-10/medcure-b-corpus/`.
- **Proof** `scripts/test-medcure-b.js` (determinism leg + recorder-validity
  legs: episode-builder fixtures, cure-split reconciliation fixture,
  pharmacy-series fixture, neutrality leg). Must FAIL on broken fixtures
  (swapped healer labels, dropped cure events, truncated pharmacy series).

## Metrics (binding — definitions the analyzer implements exactly)

Per-seed daily snapshot (in the policy.daily wrapper, pure reads only):
day, pop, `healerPresent` (`campHealerId('haven')` non-null),
`healerVid`, `medicCount` (living roster medics by occupation, medicdiag
definition), `sickMap` (vid → { name, diseaseId via
`villagerDiseaseId`, daysLeft, severity, diagnosed }), `dutyVid`,
`dutyCures` cumulative { ability, medicine } (read from
`v.medicDutyCures`), `pharmacy` ({ antibiotics: doses, antiparasitic:
doses, totalDoses } read from `v.stash.medicine` directly — never via
`stashState()`, which initializes state), scholar-sick flag.
Deaths via the registerDeath call-through (the documented exception: no
Game-state writes, no RNG). Duty cures via a `medicDutyCureAttempt`
call-through wrapper: counters diffed before/after the call gives the
channel (`ability`/`medicine`); the wrapper itself writes nothing and
consumes no RNG.

Episode builder (analyzer, from the daily series — no onset/end wrappers
needed): an NPC wound_fever episode opens the first day a vid shows
diseaseId `wound_fever` in `sickMap` and closes the last day it is seen.
Outcome: `died` if a death row for that vid has day in
[onsetDay, lastSeenDay+1] (the +1 covers the tick-after-snapshot ordering);
`cured-duty-<channel>` if a duty-cure event names (vid, wound_fever) in
the same window; `recovered` if the record disappears with no death or
cure; `open` if present on the final day. `healerPresent` at onset is the
onset day's snapshot value. Reconciliation counts (deaths joined vs
unlinked, cures joined vs unrecorded) are printed, never hidden.

- **M1 — wound-fever death rate by healer presence (PRIMARY):** NPC
  wound_fever episodes, split by healerPresent at onset; mortality each
  side (died / episodes). Re-measure of the 2026-11-08 census
  (2.4% present vs 24.0% absent). Reported alongside: all-disease NPC
  episode mortality by healer presence, and wound_fever episodes'
  treated share (duty-cure or tend) each side.
- **M2 — cure channel split:** duty cures total, by channel (ability vs
  medicine), per seed and pooled; cure events listed (seed, day, holder,
  patient, disease, channel); reconciliation vs the game's own
  `v.medicDutyCures` counters (must match exactly — a mismatch is an
  instrument failure, not a finding). Scholar-side cures
  (`treatVillager` cured) reported separately if any.
- **M3 — pharmacy stock over time:** total medicine doses per village-day
  (pooled mean, max, days with ≥1 dose, days with 0); per-type split;
  stock-change events (finds/deposits vs duty-cure spends) counted;
  seeds that ever hold medicine vs never.
- **Wall numbers (reported every run):** national / table / wins, wave
  reach 1–5, median + max survival, death-cause shares.

## Primary metric (binding)

**Complete first-numbers capture on every pilot seed, with a valid
instrument.** This is a FIRST NUMBERS arm: there is no lever to pass or
fail on an effect size, so the GO bar is on the measurement itself.

**GO requires ALL of G1–G4:**
1. **G1 capture complete, 8/8 seeds:** every pilot seed exits 0; every
   per-seed corpus parses; daily rows span first→last day; end snapshot
   present; death rows consistent with the fallen list.
2. **G2 episode join clean:** every NPC wound_fever episode has a
   non-null healerPresent at onset (0 UNCLASSIFIED); every wound-fever
   death row joins to an open episode (0 unlinked wound-fever deaths);
   duty-cure events reconcile exactly with `v.medicDutyCures` counters
   (0 unrecorded, 0 unexplained).
3. **G3 neutrality PASS:** recorded vs unrecorded trajectory identical
   (fingerprint: daysAlive, endReason, death keys + causes, final pop)
   on control seeds 160210 and 160214, same code, same master.
4. **G4 proof PASS:** `scripts/test-medcure-b.js` green on all legs
   (determinism + recorder-validity fixtures + broken-fixture sensitivity).
A miss on any gate is NO-GO for the measurement (never re-scored against
a friendlier metric); the evidence then says which gate failed and what
the partial numbers are worth.

**Secondary (report, not judged):** M1/M2/M3 values themselves (they are
the first numbers — reported, not gated against the 2026-11-08 census; a
divergence from 2.4%/24.0% is a finding, never a failure); healer-days
share; duty-days share; per-seed village assessment.

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts (say-lines around the event days) of 2–3 wound-fever
episodes — a wound-fever death with no healer present, a duty cure, a
recovery — and judge meaning, coherence, consequences, never just counts.
Include a short village assessment in plain words: what the villages
looked like, who died of wound fever and why, what the pharmacy held.

## Non-goals

- FIRST NUMBERS only: name the numbers, do NOT build a lever (a fix is
  the next arm). Zero `src/js`, no default flips.
  `git diff HEAD -- src/` must be empty at the end.
- No landing, no push, no version bump — report ready-to-merge; the
  coordinator lands it.
- Flap protocol: probe-gate EVERY git write (`git update-ref
  refs/heads/probe HEAD` before each safe-commit); if the probe fails, do
  read work and retry later — never force a write, never route around a
  denial with a manual ref edit. File writes go through the `muse.write`
  tool; git writes go through the probe.
- Safe-commit index clobber: after EVERY safe-commit, run `git status
  --short`; if files show as staged-deleted with worktree files intact,
  repair via `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`, then verify status empty + `git diff HEAD` empty +
  hash-object matches HEAD blob.

## Amendment (pre-sweep, before any judged computation)

- **Say-wrap added to the driver** (2026-11-10, before the pilot sweep):
  a `Game.say` call-through wrapper captures death/cure/fever lines
  (regex on succumbed/died/cured/mend/burning up/no healer/fever, capped
  600/seed) into `sayLines` in the per-seed corpus. Same documented
  exception as the registerDeath wrapper: external appends only, no Game
  writes, no RNG. Purpose: the prereg's sense-testing leg needs real
  transcript lines; the 30d smoke run (pre-amendment) had none. The
  neutrality leg (G3, all 8 bare fingerprints) and the proof test L4
  re-run after this edit cover the amended instrument.

## Metric review (pre-registered note)

- The primary metric is instrument validity + complete capture, judged
  exactly as registered above. M1/M2/M3 values are the deliverable, not
  a second primary smuggled in: if this band's wound-fever rates differ
  from the 2026-11-08 census (2.4%/24.0%), the difference is reported as
  a finding with the mechanism named if visible (duty cures, headcount,
  horizon), never used to re-pick the question or to claim the duty
  worked or failed — this arm has no before/after.
- The episode outcome window [onsetDay, lastSeenDay+1] is a stated
  instrument choice: if the analyzer reports unlinked wound-fever deaths
  > 0, the window is revisited in the metric review of the evidence file,
  not widened silently mid-run.
- The medicine channel is expected to stay near-zero (medicduty-a: 0/8
  seeds fired it; medicine is ruin-found and rare). A 0 is a valid first
  number, not a failed measurement — but the pharmacy series must still
  show whether stock ever existed to spend (M3 answers that).
- The competent policy never sits and never wins by design; national /
  table / wins are reported as wall numbers, not judged.
- Known instrument limit, stated before the run: the daily snapshot reads
  `v.sick` once per day; a villager who contracts wound_fever and dies
  in the SAME day's tick leaves an episode whose last-seen day is the
  onset day and whose death joins via the +1 window — the analyzer counts
  how many deaths were reconciled this way rather than observed ending.
