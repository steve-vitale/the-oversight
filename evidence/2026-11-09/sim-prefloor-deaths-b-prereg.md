# sim-prefloor-deaths-b — prereg (DIAG, zero src/js)

**Arm:** sim-prefloor-deaths-b (DIAG) · **Run:** fleshout-loop-b-20261109T1230Z (Loop B, arm 3 of 3) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-prefloor-deaths-b, base master `5e79679e4` (worktree `~/workspace/worktrees/sim-prefloor-deaths-b`) · **Prereg committed BEFORE any judged computation.**

## The question

Why do villages die before the day-90 floor on current master — and what lever does the answer name? The sitdrive arm (evidence/2026-11-09/sim-sitdrive-winseek-b.md) fixed the sitting half and left the survival half open: only 2/8 pilot (band 53001–53008) and 3/16 fresh (band 54209–54224) reach day 90 alive under winseek; 15/16 fresh-band villages were invited to the table but died before the floor. The prior pre-floor decomposition (evidence/2026-11-08/sim-sitgap-winseek-b.md, master `9d5fe8ab6`) found pre-floor deaths wild-dominated on its band — this arm re-derives the split on current master on a fresh band. It does NOT copy the prior numbers.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/TABLE.md` — the day-90 floor (`tablePreview()` is null before day 90; the invitation "never exists before day 90"), the sticky offer, overtime; `docs/DISEASES.md` — two pools, never mix; disease deaths record as symptoms, never names (so the fallen cause for disease deaths is `sickness` / `wound_fever` / `a wound that wouldn't close`, not a disease id); `docs/MONSTER-WAVES.md` / `src/js/sigW4.js` — wave-4 signature monsters (Ad Break, The Eulogy, The Influencer, The Eater, …) are field-fight monsters whose names can appear as the fallen `cause` with `monsterName` set.
- `docs/MEASUREMENT.md` §§9–12, 14–15 read: staged seeds, death-aware horizons, pre-registration, metric binding, balanced panels. This is a DIAG, not a lever: the §9 pilot/confirm staging governs levers; this arm runs one 12-seed sweep per leg after a 1-seed-per-leg smoke (stage 0). No panel (§15): recorder corpora are refused by the panel by design, same standing as the sitgap/sitdrive DIAG arms.

## Legs (both with NO seat-walking — floor survival measured cleanly)

- **Main leg — plain winseek** (`scripts/policies/winseek.js`, default env, no `POINTER_GATED`, `WINSEEK_R8` default on — the same defaults the sitgap-winseek and sitdrive before legs used). Winseek has no sit drive by construction (verified from code in the sitgap-winseek prereg: extends base competent, never linkfeast; competent never calls `tableTakeSeat`); the driver feeds the recorder the zero-stats stub, as the sitgap-winseek driver does. No run can end early at the table, so floor-reach and survival are measured without table truncation.
- **Baseline leg — doorwalk, gates OFF** (`scripts/policies/competent-doorwalk-b.js` with `TAKESEAT_B` unset AND `DOORWALK_B` unset). DEPARTURE from sitgap-b's baseline, stated here before computation: sitgap-b ran this leg with `TAKESEAT_B=1` (sits happened, 6/8 sat). This arm runs it with the sit drive OFF, so the baseline also never sits and floor survival is measured cleanly on both legs; the two legs then differ only in policy substrate (winseek vs the linkfeast composite: stageally + link + feast drives). The door-walk drive is off too (`DOORWALK_B` unset), so no door is ever walked on either leg. Any sit-verb call on either leg contradicts the configuration and is flagged loudly by the analyzer (contradiction flag), never smoothed.
- **Horizon:** 150d death-aware (§10 reachability range 150–200d; the question is survival to day 90, and 150d lets floor-reaching villages show post-floor survival). Dead villages stop simulating (+10d tail max, per the harness).

## Fresh band — 55201–55212 (12 seeds)

Checked 2026-11-09, BEFORE this prereg was committed, per the seed-band freshness skill (all dated preregs + evidence `.md` + corpus filenames, not just today):
- All dated preregs (`evidence/*/sim-*-prereg.md`): 0 files name any of 55201–55212.
- All evidence `.md` files (`git grep` over `evidence/**/*.md`): 0 files name any of 55201–55212.
- Seed-pattern content grep (`5520[1-9]` / `5521[0-2]` over `evidence/**/*.md`): 0 files.
- Corpus filenames (`git ls-files 'evidence/*552*'`): only 3-digit seed-552 files (`perseed-apexroute/*-s552.json`, `eveningmeal-*-s551.txt`); no perseed file exists for any of 55201–55212.
- Forbidden/contaminated band lists: the standacc-b list covers 99201–99208 — does not touch 55201–55212. Loop A's live claim (fleshout-20261109T1015Z) uses band 96301–96308 — does not touch.
- **Collision found and avoided:** candidate band 55101–55112 is BURNED — 55104 and 55106 were used by sim-compvet (evidence/2026-10-18/sim-compvet.md: "8 fresh — 53704, 53707, 53708, 55104, 55106, 56101, 56104, 56106"). 55201–55212 is the replacement.
- Must NOT reuse 53001–53008 or 54209–54224 (per the brief).

## Cause-class registry (binding — the classifier implements exactly this)

Pre-floor deaths are fallen entries with `day < 90` (day 90 itself is a floor-day death, not pre-floor). Every fallen entry carries `day` + `cause` (+ `monsterName`/`monsterId` when a monster killed). Classes:

- **wild** — field-encounter deaths: cause in {`the wild`, `monster`, `ambush`, `combat`} OR the entry carries a non-null `monsterName`/`monsterId` (covers signature-monster-named causes) OR cause == `a stranger` (alien-player stranger fight, a field encounter per docs/ALIEN-PLAYERS.md).
- **arena** — cause exactly `the arena` (the game emits `the arena`, never `arena`).
- **starvation** — cause exactly `starvation`.
- **sickness-disease** — cause in {`sickness`, `wound_fever`, `a wound that wouldn't close`} (the wound/infection family; disease names never appear as fallen causes per docs/DISEASES.md — diseases never announce their names).
- **other (NAMED, never silently bucketed)** — every other cause value, each reported by name with its count in the raw census and in the other-class breakdown. REGISTERED here so they are never a surprise: `thirst` and `dehydration` (the thirst family — reported as their own named line, NOT merged into starvation and NOT merged into sickness); `contest` (show deaths, distinct from `the arena`); `the phoenix link (ash)` / `the phoenix link (broken)`; betrayal causes; and any unlisted cause value, which the analyzer prints verbatim. If an unlisted cause reaches ≥10% of pre-floor deaths, the evidence names it as a finding and the next arm re-registers it.

Registry grounding (cause inventory censused BEFORE this prereg from the three direct-predecessor corpora on recent masters — sitdrive-winseek baseline, sitgap-winseek, sitgap-b; 24 seeds, 281 fallen): `the wild` 155, `the arena` 23, `ambush` 14, `sickness` 14, `a wound that wouldn't close` 12, `starvation` 10, `contest` 8, `combat` 8, `monster` + named monster 22 (Buffering, Gavel, Nightlight, The Influencer, The Big Beast, The Herald, Choir Toad, The Redactor, The Living Wire, The Terms of Service, Spool, The Eater, Highbeam Deer, Big Ugly), `a stranger` 3, `thirst` 2, `dehydration` 2, `wound_fever` 1, `Ad Break` 1 (cause == monster name, `monsterName` == `Ad Break` — the monsterName rule catches it). `The Eulogy` appears in sim-53007-a (evidence/2026-11-08/sim-53007-a.md) as a cause; it is a wave-4 signature monster (src/js/sigW4.js: 5-verse doom narration) and classifies wild via the same monsterName rule. No cause in the inventory is left unregistered.

## Primary metric (binding)

**Cause-class shares of pre-day-90 deaths on the winseek leg.** Primary set: ALL fallen entries with `day < 90` across the 12 winseek-leg seeds (every death before the floor weakens a village before the floor, whether or not that village ultimately survives; villages ending before day 90 contribute all their deaths to this set anyway). Reported alongside: the same split restricted to deaths in villages whose run ends before day 90 (`gameDays < 90`, village-lost) — if dominance differs between the primary set and the subset, the evidence says so and the lever is named on the primary set with the subset noted. Classification complete = every primary-set entry assigned to exactly one class, with the full raw cause census printed (no entry unclassified; entries with a missing `day` are counted separately as a data-quality note, expected 0).

**GO = classification complete on all 12 seeds PLUS a NAMED lever candidate for the dominant cause class if one class is ≥50% of pre-floor deaths; if no class reaches 50%, the verdict is an explicit "no dominant cause" finding with the full split and the next measurement named.** The lever candidate is named, NOT built, in this arm (this arm is the diag that names it; a fix is the next arm).

**Secondary (report, not judged):** floor-reach rate (alive at day 90), true median survival, wave-4 unlocks, national / table / wins on the band; the same secondaries on the doorwalk baseline leg, and the doorwalk leg's own pre-90 cause split for the policy-vs-game read (if the splits differ sharply, the lever candidate may be policy-side; if both legs die of the same dominant cause, it is game-side).

## GO bars (binding — DIAG-GO requires ALL; a miss is NO-GO, never re-scored)

1. **Primary — classification complete, 12/12 winseek-leg seeds:** every pre-floor death classified; raw cause census printed; dominant class ≥50% → named lever candidate recorded; no class ≥50% → explicit "no dominant cause" finding + next measurement named.
2. **G1 det-gate PASS** (proof `scripts/test-prefloor-deaths-b.js`: classifier fixtures for all five classes + the monsterName rule + the Ad Break / The Eulogy / dehydration registrations + unknown-cause → other-named; broken-classifier sensitivity; see Proof).
3. **G2 recorder neutrality PASS** on the winseek leg (recorded vs unrecorded trajectory identical — headline + daily living/fallen/end fields — on control seeds 55202 and 55209, same code, same master).
4. **G3 corpus integrity PASS** (every corpus JSON: daily rows span first→last day, end snapshot present, `sitgap` present on every row, fallen list consistent with daily living drops, 0 instrument errors) — 12/12 both legs.
5. **Gate/contradiction flags PASS:** zero sit-verb calls (`tableTakeSeat` / `tableOfferSeatTaker` / `tableChooseSeatTaker` / `chooseTableOption`) on either leg; zero `takeseatStats.seatTaken` and zero `doorwalkStats` entries on either leg. Any call is a loud contradiction, never smoothed.
6. **Smoke gate:** 1 seed per leg in `/tmp` before the sweep (stage 0) — corpora parse, fallen present with day + cause, classifier runs, no instrument errors.

## Substrate

- New driver `scripts/prefloor-deaths-driver-20261109.js` (new, scripts only): the sitgap-winseek-driver pattern (sitstep instrument + both DIAG recorders + say-wrap with the TIGHTENED word-boundary death regex from the sitdrive prereg, `writeFileRetry` with 40 attempts × 15s) with a `LEG` switch: `LEG=winseek` (policy `winseek.js`, zero-stats stub) / `LEG=doorwalk` (policy `competent-doorwalk-b.js`, `TAKESEAT_B` + `DOORWALK_B` deleted, `DOORWALK_SEED` set per seed, real `takeseatStats`/`doorwalkStats` fed to the recorder). `DIAG_RECORDER=0` runs the identical driver without either recorder (the G2 control).
- New analyzer `scripts/analyze-prefloor-deaths-20261109.js` (new; reuses `checkCorpusSit` / `neutralityCompareSit` from `scripts/analyze-sitgap-20261108.js` — READ-ONLY, do not edit it): the cause classifier + per-seed pre-90 split + band split (primary set + pre-90-ending subset) + raw cause census + floor-reach / median / wave-4 / wall numbers + contradiction flags + G3/G2 reporting. The sit-classification (`classifySit`) is NOT reused for verdicts here — the seat is out of scope; only its contradiction-relevant verb counts are read.
- Corpora under `evidence/2026-11-09/perseed-prefloor-deaths-b/` (winseek leg) and `evidence/2026-11-09/perseed-prefloor-deaths-b-doorwalk/` (doorwalk baseline leg), plus `evidence/2026-11-09/perseed-prefloor-deaths-b-unrec/` (G2 controls, 55202 + 55209, winseek leg).
- Proof `scripts/test-prefloor-deaths-b.js` (det-gate + neutrality + corpus-integrity legs, modeled on `scripts/test-sitgap-winseek-b.js`). Must FAIL on a broken classifier (wild/arena rule swap fixture; monsterName rule removed fixture; Ad Break treated as other fixture; dehydration silently merged into starvation fixture) and PASS on the real ones.
- No game-code change. `git diff HEAD -- src/` must be empty at the end.

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts (`deathSays` + `tableLines` + daily rows) of 2–3 pre-floor deaths — the deaths that end the shortest-lived villages, or the deaths that best show the dominant cause — and judge meaning, coherence, consequences, never just counts. Include a short village assessment in plain words: what the villages looked like, who died and why.

## Non-goals

- DIAG only: name the lever, do NOT build it (a fix is the next arm). Zero `src/js`, no default flips, no door-walking, no sitting.
- No landing, no push, no version bump — report ready-to-merge; the coordinator lands it.
- Flap protocol: probe-gate EVERY git write (`git update-ref refs/heads/probe HEAD` before each safe-commit); if the probe fails, do read work and retry later — never force a write, never route around a denial with a manual ref edit. The `muse.write` tool bypasses the flap for file writes; git writes go through the probe.
- Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob.

## Metric review (pre-registered note)

- The primary metric is the cause-class split of pre-floor deaths on the winseek leg, judged exactly as registered above. The doorwalk leg's split is a secondary comparison, not a second primary smuggled in: if the doorwalk split disagrees with the winseek split, the disagreement is reported as a finding (policy-vs-game read), never used to re-pick the dominant class.
- The 50% dominance bar is a judgment threshold, not a statistical test: with ~100–200 pre-floor deaths expected across 12 seeds, a class at ≥50% is the obvious lever; a class at 30–49% with a clear mechanism may still earn a named lever candidate as a secondary finding, but the verdict is "no dominant cause" and the GO bar is met by the explicit finding + next measurement, not by the candidate.
- If a fallen entry carries a cause value this prereg did not register, it lands in other-NAMED with its count printed — the registry is explicit that unlisted causes are reported, not hidden. A taxonomy change after the sweep (e.g. reassigning a cause) is a dated CORRECTION, never a silent re-issue.
- The winseek leg never sits and never wins by design; national/table/wins are reported as wall numbers, not judged.
