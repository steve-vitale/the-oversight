# journey-scale r125 — PRE-REGISTER (lane A, leg 3 SCALE, survival attribution)

**Run id:** laneA-20261109T2245CST (scheduled 22:45 CST 2026-11-09).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `91650a90f` for this run's own files (prereg,
instrument, driver clone, analyzer, note). The measurement arms run
on the r123 base (see below).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands.**
**DELIVER OVER MEASURE (2026-11-01):** this run is the attribution
run r123's metric review ordered — not a re-proof of a proven
constraint and NOT a re-run of the ladder band. r123: "Do NOT re-run
the ladder band until the attribution lands."

## Standing context (read before scoring)

- **r123 (2026-11-09, band 97901–97904, base 17777346b): the survival
  collapse.** 0/4 seeds alive at the horizon (r113: 2/4). Total band
  days 488 vs r113's 646 (−24%). End days: 97901 d103 (pop 1/1),
  97902 d121 (0/0), 97903 d131 (0/0), 97904 d133 (0/0). The collapse
  truncates the trade road (Q1 PARTIAL with that confound). Cause NOT
  established. The only survival-relevant landed change since r122's
  base is the wideduty medic-duty widening (`game.js`, commit
  `48c93b22b`); its mechanism points the other way (more cures —
  97902: 23, 97903: 24 — duty-held 61%→88%), but that is evidence,
  not proof. The other four landed changes are conversation/social/
  narration. **This run attributes the collapse or exonerates
  wideduty.**
- **The wideduty lever, exactly (commit `48c93b22b`, game.js only,
  +66/−20):** (a) `campHealerId` now returns the medic-duty holder
  as the camp healer, so healerRounds / healerFor /
  villagerTreatTick see a trained holder; (b) the duty itself is
  widened from medical occupations only to any trained villager
  (`isMedicDutyEligible`: medical occupation OR wound_care /
  herbal_medicine skill OR triage / herbal_remedy / field_medicine
  ability), with a tiered pick (healing ability first, then
  occupation, then skill-only). Mechanism FOR survival: a healer
  present more days → sick worsen slower (healerFor −1 dmg) + more
  cures. Mechanism AGAINST survival (second-order, this run's Q3):
  the holder "stays at Haven tending the sick instead of ranging
  out" — widening pins MORE villagers at Haven, and a holder who
  could have ranged/fought is now home. No canon doc covers medic
  duty (docs/PARTY.md has no healer/medic/duty lines; docs/CANON.md
  manifest checked 2026-11-10); the commit message + the MEDIC CURE
  ruling (Steve 2026-11-08: roster medics CAN cure, by ability OR
  medicine) are the record.
- **Carried, NOT this run's to build:** the brittle `walkTo`
  duplicated in ~12 policy files; tribute spends veterans (Steve
  design question); trade trust flicker; gossip voice-break + raise
  defects (Baraka unvoiced raise ×6 in 7 days; Stella's unanswered
  trap-line invitation); repeat-study loop (97903: village_3 studied
  ~30 times in 58 days while explore is capped); sayOncePerFight
  barrier noise.

## The two arms (matched panel, one lever)

- **Arm A (WITH wideduty): REUSE r123's published band — do NOT
  re-run.** Base `17777346b`, seeds 97901–97904, DAYCAP=180, the
  r123 driver/policy/instruments. The sim is deterministic per seed
  on fixed code; re-running would reproduce r123 exactly and spend
  a band of compute for zero information. Arm A numbers are r123's
  published numbers: lived days 103/121/131/133 (total 488), alive
  0/4, deaths from the trust JSONs' `deathLog` (complete — the sim
  harness sets TELEMETRY_FULL=1, verified: rows span d4–end on all
  four seeds). The Arm A census is built RETROACTIVELY by the new
  analyzer from r123's evidence (deathLog rows + wildfights +
  hungerwatch + capture cure lines); see Q2 for the classification
  rule and its limit (the driver dropped `kind`/`wave`, so monster
  vs person is re-derived from the `who` id).
- **Arm B (WITHOUT wideduty): surgical revert, throwaway worktree
  `journey-scale-attr`.** Content = `17777346b` tree with ONLY the
  wideduty game.js change reversed (`git show 48c93b22b --
  src/js/game.js | git apply -R`, in the attr tree). Verified
  before the pilot: `git diff 17777346b --stat` shows ONLY
  `src/js/game.js` changed (plus the copied r125 driver +
  census instrument, which are new tooling, not base code). If the
  reverse patch does not apply cleanly, FALL BACK to the
  `48c93b22b^` base (= `0ba20ac1c`, which also lacks the r163 coach
  + r122 post-secret conversation changes) and disclose the wider
  delta in the run note — the verdict bars still apply, read with
  that confound. The attr tree is NEVER merged; it is released
  unmerged at closeout. The r125 driver + census instrument are
  copied into it (byte-identical to the main-worktree versions).
- **Policy + instruments identical on both arms:** the r113
  trade-road policy + ladder/traderoad/regionalstep instruments,
  verified byte-identical to r123's base (`git log 17777346b..HEAD`
  on all four files: EMPTY). The ONLY code difference between the
  arms is the wideduty game.js hunk. The new death-census
  instrument is read-only (fallen + telemetry diffs, daily context
  reads; no wrappers, no RNG, no state writes) and runs on Arm B
  only — Arm A has no live run to attach it to.

## Q1 — ATTRIBUTION: did wideduty cause the collapse? (binding)

Primary metric: total band lived days (Arm A: 488) + alive at
horizon (Arm A: 0/4). Secondary: per-seed lived days.

- **WIDEDUTY-IMPLICATED** — Arm B total ≥ 548 (Arm A + 60, ~+12%)
  AND ≥1 seed alive at the horizon. The collapse lifts when the
  lever is removed.
- **WIDEDUTY-EXONERATED** — Arm B total ≤ 488 AND 0/4 alive at the
  horizon. The collapse reproduces without the lever; wideduty is
  not the cause (the next suspect is the conversation-change RNG
  shift or 4-seed noise — named, not pursued here).
- **INCONCLUSIVE** — anything between (489–547, or ≥1 alive but
  total < 548, or total ≥ 548 but 0 alive). Report the numbers;
  claim no verdict; propose the next step (more seeds) for a
  later run, do not run it here.
- Guardrail (NO-GO if breached): Arm B pilot 97904 crashes, or
  the census instrument errors > 0, or the Arm B mechanism sanity
  fails (0 studies by d60 — the walk regressed on the reverted
  base), or any walk teleports / `_returning` stuck.

## Q2 — THE DEATH-CAUSE CENSUS (binding — the instrument's own bar)

New instrument `scripts/deathcensus-instrument-20261110.js`
(read-only; pattern of the ladder instrument):
- Per policy day: diff `Game.state.village.fallen` (the memorial
  roll — every home-village villager death pushes {villagerId,
  day, cause, name, monsterId, monsterName}; never pruned;
  double-death-guarded) and diff `Game.state.telemetry` keeping
  type==='death' rows WITH kind/wave/player preserved; plus daily
  context (alive count, roster length, sick count, medic-duty
  holder vid, camp healer vid, pantry kcal, water clean+dirty,
  hungryDays).
- Finalize: deaths list, per-cause counts, multi-death days
  (≥3 deaths in one day) with each death named, and the
  reconciliation: fallen-count == telemetry person-deaths ==
  roster death delta (alive(t−1) + joins − leavers − alive(t));
  joins = roster-length growth; leavers = the residual.
- **Bar: unattributed deaths = 0 on Arm B** (every home-village
  villager death carries a named engine cause; the r123 note's
  unattributed 4-death day on 97904 must not recur as a gap). Any
  residual is listed by name + day + last-known state, never
  averaged away.
- Arm A retro census (analyzer `scripts/deathcensus-analyze-
  20261110.js`, run on r123's evidence, no live sim): classify
  each deathLog row — `who` in the monster-id set
  (`src/data/monsters.json` ids) → monster death; else a person
  death with the row's `cause`. Cross-check the person-death
  count against (start roster + joins − end alive) from the r123
  trust JSONs; report the residual. LIMIT (disclosed): Arm A
  cannot recover the fallen day-attribution for deaths the
  telemetry ring would have kept — it keeps all of them
  (TELEMETRY_FULL=1), so the retro census is complete on rows;
  what it cannot recover is the daily sick/duty context, which
  exists only in Arm B's instrument rows. Fever-death counts on
  Arm A come from the cause strings alone.

## Q3 — MECHANISM: which way does wideduty cut? (binding, reported)

- Fever/wound deaths (causes: sickness/disease-id, 'a wound that
  wouldn't close') Arm B vs Arm A; cures per seed (capture lines
  "is on the mend", counted by the analyzer on both arms'
  capture files); duty-held days + healer-present days (Arm B
  instrument rows; Arm A: the r123 duty-*.txt weapon-duty file
  does NOT cover medic duty — Arm A medic-duty presence is
  UNKNOWN, said so, not estimated).
- Reading: if Arm B fever deaths rise AND survival improves →
  the pinning mechanism (holders kept home) dominates the cure
  mechanism; if Arm B fever deaths fall AND survival falls →
  the cure mechanism was load-bearing and something else in the
  collapse is still unexplained (INCONCLUSIVE leans
  exonerated-with-a-puzzle); if both move the same way, say so
  plainly. No mechanism claim without both halves.

## Q4 — PEOPLE CHECK (sense law)

Transcripts the Arm B band produces, read in full (CONVO_DAYS
[90, 120]). Senseless count must be 0 to claim the people check
clean. The r123 defects are CARRIED, not re-litigated —
re-counted only if a fix touches conversation code (none does
this run: the driver change is the read-only census instrument).

## Q5 — CENSUS (plain words)

Village assessment per seed, Arm B (who lived, who died of what,
what the scholar learned on the road, what changed vs Arm A).

## Seed band — MATCHED PANEL, not a fresh band

- **Seeds 97901–97904 (the r112/r113/r122/r123 band), reused as a
  matched before/after panel** (§15): before = r123's published
  band (Arm A); after = this run's Arm B on the reverted base.
  This is NOT a freshness claim: 97901–97904 are used, named in
  the r112/r113/r122/r123 preregs, and must never be presented
  as fresh.
- Freshness re-check (per local_seed_band_freshness): grep ALL
  dated preregs (`evidence/*/sim-*-prereg.md` +
  `evidence/*/journey-*-prereg.md`) for each seed as a whole token
  — the ONLY hits must be the r112/r113/r122/r123 preregs + this
  one. No forbidden-band collision (99201–99208 contaminated
  band untouched; 97801–97804 r111, 98000–98099, 97501–97516,
  98601–98616, 99001–99016 all disjoint).

## Method

- PILOT GATE (Arm B): 97904 first, DAYCAP=180. Crash, census
  instrument errors > 0, 0 census rows, reconciliation residual
  ≠ 0, or 0 studies by d60 → STOP, do not score. The pilot gates
  the instrument AND the reverted base.
- BAND (Arm B): 97901/97902/97903, DAYCAP=180, one seed per
  process, same EVIDIR. Death-aware stop (+10d tail max).
- Policy: the r113 trade-road stack with the r122 walkTo fix,
  unchanged — frozen in this prereg, do not tune mid-band.
- Driver clone: `scripts/journey-scale-r125-20261110.js` (r123
  driver, labels/EVIDIR only + census instrument require;
  policy require unchanged).
- Instrument proof FIRST (before the pilot): `scripts/test-
  deathcensus-20261110.js` — short sim (one seed, ~40 days) on
  the current base: install/snapshot/finalize work, daily rows
  present, deaths reconcile (fallen == tele-person == roster
  delta), 0 instrument errors; plus the Arm A retro-classifier
  check on r123's deathLog rows (0 unclassified person deaths,
  residual reported). Proof must be green before the pilot runs.
- Telemetry: the band regime (4 seeds, DAYCAP=180) matches the
  `scale.json` baseline regime (4 seeds, d129–180, sums 446/289/
  646). Run `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/scale.json --current
  '<per-seed-evidence-glob>' --metrics
  fightsTotal,fightsByWave.4,maxGameDay` after the Arm B band.
  Any LOUD line is a same-run investigation item BEFORE any
  baseline roll. The binding comparison is Arm A vs Arm B, not
  the baseline; the baseline is NOT rolled forward on this run
  (r123 did not roll it either — the band is a different survival
  regime until the attribution lands).
- Gate: `check.js --quick` attempted at the end; result reported
  honestly. This run changes ZERO `src/js` in any merged branch
  (the revert lives only in the throwaway attr tree, never
  merged) and adds a read-only instrument + driver clone +
  analyzer + proof test; the proof test + pilot + band are the
  regression cover. If the ~12-min gate does not fit the run
  budget, report as not-run with the reason (same standing as
  r122/r123); the gate is owed on the next run that touches
  `src/js` or the harness.

## Pre-registered metrics (bind the run — §14)

- PRIMARY: per-seed lived days + alive at horizon, Arm A vs Arm
  B; per-cause death counts per seed on both arms; multi-death
  days attributed. A miss is NO-GO, never re-scored against a
  friendlier metric mid-run.
- SECONDARY (report-only): studies per seed + first-study day
  (Arm B mechanism sanity), trips started/completed/stalled,
  national stage day, lesser priced day, full-seat priced count,
  tribute deliveries, transcript senseless count (must be 0 to
  claim the people check clean), wild w4+ fights, cures per seed,
  duty-held/healer-present days (Arm B only).
- Every run note carries a "metric review" section; if a metric
  proves wrong, the revision is proposed for the NEXT run.

## Carried LOUD items (not this run's to fix)

1. **Local master is ahead ~355 / behind ~156 vs
   origin/master** (carried from r123's ~272/~156; origin tip
   `a628aeaf3`, PR #121). No reconciliation, no merge of
   origin/master, no push — the ship loop owns it. This run
   proceeds on local master `91650a90f` and merges locally only.
   (AGENTS.md push discipline: divergent histories are reported
   loudly, never "fixed" by the loop.)
2. **Survival collapse (r123)** — the question this run answers.
3. **No lock staleness this run:** no lock file existed at run
   start; fresh lock created `2026-11-10T04:43:32Z`.
