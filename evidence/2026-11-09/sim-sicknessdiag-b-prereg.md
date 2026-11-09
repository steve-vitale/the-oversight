# sim-sicknessdiag-b — prereg (DIAG, zero src/js)

**Arm:** sim-sicknessdiag-b (DIAG) · **Run:** fleshout-loop-b-20261109T1530Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-sicknessdiag-b, base master `0ba20ac1c` (worktree `~/workspace/worktrees/sim-sicknessdiag-b`) · **Prereg committed BEFORE any judged computation.**

## The question

Decompose the pre-day-90 sickness-disease deaths under winseek — the runner-up
cause class from the prefloor DIAG (23/154, 14.9%, led by
`a wound that wouldn't close`, 14) — into wound→fever→death chains, and name
the medic/wound-care lever candidate, or report DIAG-NO-GO if the measurement
does not support one. The party-up build arm that was supposed to attack the
dominant wild deaths has just been KILLED at pilot (armed pre-90 wild 77 vs
control 86, bar 51.6; floor 3/8 vs 4 — brief), so the second killer matters
more. The fever anatomy (evidence/2026-11-07/sim-feveranat-a.md, competent
band 96301–96308) found tick 105 / wound 45 episodes, cures 0 in the wild,
wound_fever the only killer (20/43 NPC episodes died, tick fever 0/105); the
medic census (evidence/2026-11-07/sim-medicdiag-a.md) found healer-present
mortality 2/85 (2.4%) vs healer-absent 18/75 (24.0%) and named Haven Medic
Duty as the next arm — but BOTH were measured on competent, not winseek, and
neither joined deaths to episodes on the winseek substrate where villages die
at a 75.5d median. This arm re-derives the chain on winseek, on a fresh band.
It does NOT copy the prior numbers.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/DISEASES.md` — two pools,
  never mix; mundane pool (gutrot, trichinosis, Fever `disease`, lockjaw,
  wound_fever, trembles); disease deaths record as symptoms, never names, so
  the fallen cause for disease deaths is `sickness` / `wound_fever` /
  `a wound that wouldn't close`, not a disease id. Cure tiers run folk
  remedies → occupation medicine → specific ruin medicine → earned healer
  deepenings → the Fever's End synergy. No canon doc covers how many medics
  a village should have or what village-side care looks like (medicdiag
  finding) — that gap is a finding, not an invention.
- Code facts verified BEFORE this prereg (read, not assumed):
  `a wound that wouldn't close` deaths fire on the daily wound-attrition path
  (src/js/game.js ~28924: a bad day rolls -15..-28 HP; HP ≤ 0 routes through
  the real death pipeline + a fallen push) — a wound death is NOT necessarily
  a wound_fever death. `healerRounds` (game.js ~7915) treats the single
  most-hurt villager (<70 HP) once per day, +15 HP, returns the vid or null;
  no healer → no treatment. `villagerCareTick` tends ONE sick villager per
  medic per day (TWO if that medic holds triage); it never deletes a
  `v.sick` record — tending only (`daysLeft -= 1`); the only non-scholar
  cure in code is the foreign-aid medicine delivery. `treatVillager` is
  scholar-only (ability + level 2, 150 kcal). Healer definition per
  medicdiag L1: the scholar holding triage / field_medicine /
  herbal_remedy, else a living roster villager whose formerOccupation
  matches nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|
  herbalist|dentist, only if physically present in camp
  (`Game.campHealerId`, `Game.campPeopleIds` — away residents excluded).
- `docs/MEASUREMENT.md` §§9–12, 14–15 read: staged seeds, death-aware
  horizons, pre-registration, metric binding, balanced panels. This is a
  DIAG, not a lever: the §9 pilot/confirm staging governs it as an
  8-seed pilot with a 12-seed confirm ONLY on pilot GO. No panel (§15):
  recorder corpora are refused by the panel by design, same standing as the
  sitgap/sitdrive/prefloor DIAG arms.

## Legs (one judged leg — this is a measurement, not a before/after lever)

- **Main leg — plain winseek** (`scripts/policies/winseek.js`, default env,
  same defaults the prefloor winseek leg used). Winseek has no sit drive by
  construction; the sweep feeds the recorder no seat stats. No run can end
  early at the table, so floor-reach and survival are measured without table
  truncation. Any sit-verb call contradicts the configuration and is flagged
  loudly by the analyzer (contradiction flag), never smoothed.
- **Horizon:** 150d death-aware (§10 reachability range 150–200d; the
  question is survival to day 90, and 150d lets floor-reaching villages show
  post-floor survival). Dead villages stop simulating (+10d tail max, per
  the harness).

## Fresh band — 58201–58208 (8 seeds, pilot)

Checked 2026-11-09, BEFORE this prereg was committed, per the seed-band
freshness skill (all dated preregs + evidence `.md` + corpus filenames +
goal hidden_files, not just today):
- All dated preregs (`evidence/*/sim-*-prereg.md`, git grep): 0 files name
  any of 58201–58208.
- All evidence `.md` files (`git grep` over `evidence/**/*.md`): 0 files
  name any of 58201–58208.
- Corpus filenames (`git ls-files 'evidence/*5820[1-8]*'`): none.
- Goal hidden_files (`grep -rln "58201|58202"` over
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/`):
  10 files contain "58201"/"58202" as interior digits of larger numbers
  (pantry kcal 58201, float tails like 445820168, hash fragments) — verified
  by per-file context scan: 0 seed-pattern hits (`"seed": 5820x`,
  `seed-5820x`, `-s5820x`). No seed naming anywhere.
- Forbidden/contaminated band lists: the standacc-b list covers 99201–99208
  — does not touch 58201–58208. Loop A's live claim
  (fleshout-20261109T1015Z) uses band 96301–96308 — does not touch.
- **Collision found and avoided:** candidate band 58101–58108 is BURNED —
  used by sim-vetstaff-a (evidence/2026-10-18/sim-vetstaff-a.md;
  perseed-vetstaff corpora for all of 58101–58108). 58201–58208 is the
  replacement.
- Must NOT reuse 55201–55212 (prefloor), 57301–57312 (party-up pilot),
  53001–53008, 54209–54224, 55101–55112, 56101/56104/56106, 53701–53708,
  96301–96308 (Loop A live claim), 99201–99208, 87001–87008.

## Cause-class registry (binding — the analyzer reuses the prefloor classifier read-only)

Pre-90 deaths are fallen entries with `day < 90` (day 90 itself is a
floor-day death, not pre-floor). The analyzer requires
`scripts/analyze-prefloor-deaths-20261109.js` and calls its exported
`classifyCause` — never copied, never edited — which implements exactly:
- **wild** — cause in {`the wild`, `monster`, `ambush`, `combat`,
  `a stranger`} OR a non-null `monsterName`/`monsterId` (signature-monster
  causes).
- **arena** — cause exactly `the arena` (the game emits `the arena`, never
  `arena`).
- **starvation** — cause exactly `starvation`.
- **sickness-disease** — cause in {`sickness`, `wound_fever`,
  `a wound that wouldn't close`} (the wound/infection family).
- **other (NAMED, never silently bucketed)** — every other cause value, each
  reported by name with its count. REGISTERED here as observed:
  `the night` and `betrayal` (other-NAMED, as observed on the prefloor
  doorwalk leg). Any unlisted cause value lands in other-NAMED with its
  count printed. If an unlisted cause reaches ≥10% of pre-floor deaths, the
  evidence names it as a finding and the next arm re-registers it.

## Wound-chain taxonomy (binding — the analyzer implements exactly this)

For each pre-90 sickness-disease fallen entry, join to the victim's sickness
episodes (built by the feveranat analyzer's exported `buildEpisodes`,
required read-only) and to the daily snapshot series:
- **wound-first** — a `wound_fever` episode (diseaseId `wound_fever`) is OPEN
  for the victim on the death day (onset ≤ death day ≤ end, or open at run
  end and reconciled to this death), OR the victim's death-day snapshot
  shows a `wound fever` record in `sickMap`.
- **sickness-first** — no open wound_fever episode, but a non-wound episode
  (`disease`, `gutrot`, `bad belly`, food poisoning, …) is open on the
  death day, OR the death-day snapshot shows a non-wound record.
- **unlinked** — no episode open on the death day and no record in the
  death-day snapshot (the death is a pure HP-attrition wound death, or the
  instrument missed the chain — the evidence says which, per death).
- Per death the analyzer prints: seed, day, victim, fallen cause, episode
  disease/vector, onset day, days onset→death, treated? (treat kinds),
  healer present at onset?, healer-present sick-days / total sick-days of
  the episode (from the daily `healerPresent` series over onset..end),
  healerRounds events for the victim in the 7 days before death, victim HP
  on the day before death (from the daily health map).
- **Wound-care availability** (band-wide): healerRounds events (count,
  distinct patients, HP before→after), tendVillager wound-care events,
  villagerCare tends, treatVillager calls, dutyCure events vs the game's
  own `medicDutyCures` counter, diagnoses, cureEvents. Cures are expected
  0 in the wild (feveranat/medicdiag) — any cure is a loud finding.
- **Medic presence table** (per seed + pooled): village-days, healerDays,
  medicDays, NPC sick-days healer-present vs healer-absent, wound_fever
  episodes healer-present vs healer-absent at onset with mortality each,
  treated share each.

## Primary metric (binding)

**Wound-chain attribution of pre-day-90 sickness-disease deaths on the
winseek leg.** Primary set: ALL fallen entries with `day < 90` classified
sickness-disease by the reused classifier, across the 8 pilot seeds, each
joined to wound-first / sickness-first / unlinked per the taxonomy above.
Reported alongside: the same pre-90 cause split as the prefloor arm (all
five classes, raw census) so the runner-up share is re-derived on this band,
not assumed from the prefloor band.

**GO (DIAG-GO) requires ALL gates G1–G5 below PLUS the lever-naming rule:**
wound-first ≥ 50% of attributed sickness-disease deaths (attributed =
wound-first + sickness-first) AND healer-absent wound_fever mortality ≥ 2×
healer-present wound_fever mortality with ≥ 3 healer-absent wound_fever
deaths — then the named medic/wound-care lever candidate is recorded. If
the gates pass but the lever-naming rule fails, the verdict is an explicit
**DIAG-NO-GO** (measurement does not support a lever) with the full chain
and the next measurement named. The lever candidate is named, NOT built, in
this arm (a fix is the next arm).

**Secondary (report, not judged):** floor-reach rate (alive at day 90),
true median survival, wave-4/5 unlocks, national / table / wins on the
band; wound_fever vs tick-fever episode counts, durations, treated shares;
time onset→death distribution for wound deaths.

## GO bars (binding — gates must ALL pass for the measurement to count; a miss is NO-GO, never re-scored)

1. **Primary — classification complete, 8/8 pilot seeds:** every pre-90
   sickness-disease death attributed per the taxonomy; unlinked ≤ 2 deaths
   band-wide; raw cause census printed; no entry unclassified; entries with
   a missing `day` counted separately as a data-quality note (expected 0).
2. **G1 det-gate PASS** (proof `scripts/test-sicknessdiag-b.js`:
   classifier fixtures for all five classes + the monsterName rule +
   `the night`/`betrayal` → other-NAMED + unknown-cause → other-named;
   wound-chain join fixtures (wound-first / sickness-first / unlinked) on
   synthetic corpora; broken-classifier sensitivity; see Proof).
3. **G2 recorder neutrality PASS** on the winseek leg (recorded vs
   unrecorded trajectory identical — fingerprint: daysAlive, endReason,
   death keys + causes, final pop — on control seeds 58202 and 58206,
   same code, same master).
4. **G3 corpus integrity PASS** (every corpus JSON: daily rows span
   first→last day, end snapshot present, fallen list consistent with the
   registerDeath death rows, episodes classified with 0 orphan ends
   unexplained, healerRounds + treatEvents present, 0 instrument errors)
   — 8/8.
5. **Gate/contradiction flags PASS:** zero sit-verb calls
   (`tableTakeSeat` / `tableOfferSeatTaker` / `tableChooseSeatTaker` /
   `chooseTableOption`) on the leg; zero `takeseatStats.seatTaken` and zero
   door walks. Any call is a loud contradiction, never smoothed.
6. **Smoke gate:** 1 seed in `/tmp` before the sweep (stage 0) — corpus
   parses, fallen present with day + cause, episodes built, classifier
   runs, no instrument errors.

## Confirm (12 seeds) — ONLY on pilot DIAG-GO

On a pilot DIAG-GO, the same sweep runs on 12 fresh seeds (band chosen and
freshness-checked at confirm time, recorded in a prereg amendment committed
before the confirm sweep — the band is NOT named here, so no stale band can
be reused by accident). On DIAG-NO-GO or a gate failure, no confirm spend.

## Substrate

- New driver `scripts/sweep-sicknessdiag-b.js` (new, scripts only): the
  feveranat sweep pattern (`scripts/sweep-feveranat-a.js`, read in-tree —
  own code, same harness pattern) with policy swapped to winseek and the
  meal/flow wrappers dropped (production cost is out of scope here), PLUS
  three declared deltas: (a) a `healerRounds` wrapper (call-through; logs
  the returned vid + HP before/after + caregiver — the wound-care channel);
  (b) a lean daily snapshot in the policy.daily wrapper (day, pop,
  healerPresent, medicCount, sickMap, scholarSick, sickCountNPC, mean /
  sick / healthy mean health, health map — the healer-presence series the
  chain join reads); (c) a say-wrap death sample (prefloor pattern,
  tightened word-boundary death regex) + the fallen list read at run end
  (`Game.state.village.fallen`, full entries incl. monsterName) for the
  classifier. `SICKNESSDIAG_BARE=1` runs the identical driver without the
  recorders (the G2 control), keeping only the registerDeath capture (the
  feveranat documented exception: it performs no Game-state writes and
  consumes no RNG). Corpus writes go through the fresh-child
  `writeRobust` (feveranat pattern — the in-process retry loop is futile
  under the EPERM flap).
- New analyzer `scripts/analyze-sicknessdiag-b.js` (new; requires
  `scripts/analyze-feveranat-a.js` `buildEpisodes` and
  `scripts/analyze-prefloor-deaths-20261109.js` `classifyCause` — READ-ONLY,
  never edited): the pre-90 cause split + raw census + the wound-chain
  join table + medic presence table + wound-care availability + wall
  numbers + contradiction flags + G3/G2 reporting.
- Corpora under `evidence/2026-11-09/perseed-sicknessdiag-b/` (8 pilot
  winseek corpora) and `evidence/2026-11-09/perseed-sicknessdiag-b-unrec/`
  (G2 controls, 58202 + 58206). Confirm corpora, if any, go under
  `evidence/2026-11-09/perseed-sicknessdiag-b-confirm/`.
- Proof `scripts/test-sicknessdiag-b.js` (det-gate + neutrality +
  corpus-integrity legs, modeled on `scripts/test-prefloor-deaths-b.js` /
  `scripts/test-feveranat-a.js`). Must FAIL on a broken classifier
  (wild/sickness rule swap fixture; monsterName rule removed fixture;
  `the night` silently merged fixture; wound-chain join swapped fixture)
  and PASS on the real ones.
- No game-code change. `git diff HEAD -- src/` must be empty at the end.

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts (`deathSays` + daily rows) of 2–3 pre-90
sickness-disease deaths — the deaths that best show the wound chain (a
wound-first death with no healer present, a treated wound-fever recovery,
a sickness-first death) — and judge meaning, coherence, consequences,
never just counts. Include a short village assessment in plain words: what
the villages looked like, who died of wounds/sickness and why.

## Non-goals

- DIAG only: name the lever, do NOT build it (a fix is the next arm). Zero
  `src/js`, no default flips, no door-walking, no sitting.
- No landing, no push, no version bump — report ready-to-merge; the
  coordinator lands it.
- Flap protocol: probe-gate EVERY git write (`git update-ref
  refs/heads/probe HEAD` before each safe-commit); if the probe fails, do
  read work and retry later — never force a write, never route around a
  denial with a manual ref edit. The `muse.write` tool bypasses the flap
  for file writes; git writes go through the probe.
- Safe-commit index clobber: after EVERY safe-commit, run `git status
  --short`; if files show as staged-deleted with worktree files intact,
  repair via `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`, then verify status empty + `git diff HEAD` empty +
  hash-object matches HEAD blob.

## Metric review (pre-registered note)

- The primary metric is the wound-chain attribution of pre-90
  sickness-disease deaths on the winseek leg, judged exactly as registered
  above. The full five-class pre-90 split is a secondary re-derivation, not
  a second primary smuggled in: if this band's split disagrees with the
  prefloor band's (wild 76.6%, sickness-disease 14.9%), the disagreement is
  reported as a finding, never used to re-pick the question.
- The 50% wound-first bar and the 2× healer-mortality bar are judgment
  thresholds, not statistical tests: with ~10–20 sickness-disease deaths
  expected across 8 seeds, the bars are deliberately strict so a thin band
  cannot manufacture a lever. A wound-first share of 30–49% with a clear
  mechanism may still earn a named lever candidate as a secondary finding,
  but the verdict is DIAG-NO-GO and the GO bar is met by the explicit
  finding + next measurement, not by the candidate.
- If a fallen entry carries a cause value this prereg did not register, it
  lands in other-NAMED with its count printed — the registry is explicit
  that unlisted causes are reported, not hidden. A taxonomy change after
  the sweep (e.g. reassigning a cause) is a dated CORRECTION, never a
  silent re-issue.
- The winseek leg never sits and never wins by design; national/table/wins
  are reported as wall numbers, not judged.
- Known instrument limit, stated before the run: the wound-chain join reads
  episodes + daily snapshots; a villager who contracts wound_fever and dies
  of the daily wound-attrition roll in the SAME tick leaves an open episode
  whose end is reconciled via deathRows (feveranat pattern) — the join
  counts it wound-first, and the evidence says how many deaths were
  reconciled this way rather than observed ending.
