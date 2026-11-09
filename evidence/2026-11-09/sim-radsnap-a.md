# sim-radsnap-a — scholar radiation-snapshot instrument fix

Run: fleshout-20261109T1815Z, Loop A, axis food-economy. Arm: sim-radsnap-a.
Branch: sim-radsnap-a. Base: 91869f106. Prereg:
evidence/2026-11-09/sim-radsnap-a-prereg.md (committed b4923b00b BEFORE any
judged computation). Verdict: **GO**.

No `[needs-eyes]`: instrument-only fix, zero `src/js` changes, no feel /
combat / UI change. No cure behavior changed anywhere.

## The gap

The feveranat sweep's `DISEASE_IDS` roster predated the 2026-11-08 pellet
radiation build and lacked `radiation_sickness`, so scholar radiation
onsets never appeared in daily `scholarSick` snapshots and the feveranat
G3 corpus check failed on the sametick corpus (s96301: 8 onsets, s96302:
10 onsets, unaccounted). The old corpus failed G3 the same class.
(Filed as backlog 2026-11-09, scholar radiation-snapshot G3 gap; the
sametick evidence named the fix as roster-addition or G3 exemption.)

## Root cause (verified from the files, not taken on trust)

- `scripts/sweep-feveranat-a.js:88` — `DISEASE_IDS` was the 16-id set
  (`disease, wound_fever, gutrot, lockjaw, trichinosis, trembles,
  howlbelly, gristlefit, croakbelly, shellgut, witness_maw, flockmind,
  eurika, east_nile, lemons, tick_attached`); `MUNDANE_IDS` the 6 mundane.
  Comment cited "docs/DISEASES.md (mundane 6 + alien 9)".
- `scholarDiseaseList()` (~line 204) skips every `seList('scholar')` entry
  whose id is not in `DISEASE_IDS` — the daily snapshot's `scholarSick`
  could never contain `radiation_sickness`.
- The `contractDisease` wrapper (~line 600) records EVERY scholar onset
  into `sickOnsets` with NO roster filter — so radiation onsets ARE
  recorded (verified in the recorded sametick corpus: s96301 8, s96302 10
  radiation onsets, 0 `scholarSick` rows containing radiation).
- The `applyStatus` wrapper (~line 640) also gates on `DISEASE_IDS`, so a
  radiation onset via direct `applyStatus` would be missed the same way.
- `MUNDANE_IDS` gates the `cureStatus` / `seRemove` wrappers (~lines 881,
  899): scholar sickEnds (cured / recovered-expired) are recorded only for
  ids in it. Without radiation there, radiation episodes stay onset-only.
- `scripts/sweep-sicknessdiag-b.js:77-81` carries a PARALLEL roster with
  the identical shape and gap, and the same wrapper structure.
- `scripts/analyze-feveranat-a.js` carries NO disease roster — it joins
  recorded onsets to recorded snapshots. Its G3 requires every recorded
  onset to appear in a later snapshot (or end within a day).
- `src/data/statusEffects.json`: `radiation_sickness` exists — pool
  `mundane`, class `radiation`, cure antibiotics `no` / antiparasitic
  `no` / field_medicine `cure` / triage `cure`. "No pill touches it —
  skilled hands clear it, rest sheds it slowly." (Pellet radiation cost,
  Steve-ruled 2026-11-08.)
- `docs/DISEASES.md` was STALE: it listed the mundane pool as 6 and never
  mentioned radiation_sickness (it predates the pellet radiation build).

## What changed and why

- `scripts/sweep-feveranat-a.js` — added `radiation_sickness` to
  `DISEASE_IDS` (17 ids) and to `MUNDANE_IDS` (7 ids); roster comment
  updated to "mundane 7 + alien 9" with a note citing the data def and the
  2026-11-08 ruling. The `MUNDANE_IDS` addition is the same gap, same
  fix: without it, radiation cures/expiries produce no sickEnds.
- `scripts/sweep-sicknessdiag-b.js` — identical addition to both sets
  (same gap, same fix; its analyzer's G3 is day-row integrity, not
  snapshot accounting, so no live corpus exercises it in this arm — the
  addition is consistency/prospective, proven by the shared roster check
  in the proof test).
- `docs/DISEASES.md` — docs-only: `radiation_sickness` row added to the
  mundane-pool table (pool now 7) plus a change-log line. No canon
  invented: every fact comes from `src/data/statusEffects.json` and the
  recorded 2026-11-08 ruling.
- `scripts/analyze-feveranat-a.js` — RE-SCOPE (see below): two narrow G3
  exemptions for onsets no snapshot could ever show, named in the PASS
  line, never silent. (1) Scholar bearer died the same day as the onset
  (isPlayer deathRow that day — the status entry dies with its bearer;
  the successor never carries it). (2) Onset on the last snapshot day
  with no later snapshot (snapshots are taken at dawn; onsets happen
  during/after the day's parts).
- `scripts/test-radsnap-a.js` — new proof test, 13 legs (see below).

NOT changed: any `src/js` file, any cure behavior, any vector mapping.
The unattributed-vector gap (radiation onsets carry no source string —
`contractDisease('radiation_sickness', {})` from `src/js/feastBuff.js:389`
— so the analyzer honestly reports them unattributed under G4) is out of
scope for this arm; filed to the backlog (see Findings).

## Re-scope found by the judged legs (documented, not forced)

The roster fix was the primary root cause: on the fresh corpus it took
unaccounted radiation onsets from 18 (sametick) to 2. The remaining 2
(s96301 d128 and d150) have a DIFFERENT, narrower root cause — both are
scholar onsets whose bearer died the same day (Fernando d128, "You go
down" in the same fight where the pellet boost contracted the sickness;
Maricela d150). The status entry died with its bearer; no later snapshot
can show it. That is an analyzer-rule gap, not a recorder gap, so the
analyzer gained exemption (1). Exemption (2) never fired live in this
corpus (both residual onsets are bearer-deaths); it is proven
synthetically by the proof test (L6: minimal 8-seed corpus, horizon-edge
onset, G3 PASS with the exemption named 8/8).

One stated approximation: the corpus records scholar onsets as who
`scholar` with no bearer id, so on a day with MULTIPLE successions the
bearer-death check cannot tell which scholar held the onset — it exempts
when ANY player death lands that day. Footprint in this corpus: the
prefix run also exempts d129 + d137 (Desmond/Aki d129, Lena d137), whose
onsets are snapshot-seen in the fresh corpus and need no exemption there.
The direction is conservative (it can only excuse an onset on a
same-day-death day) and every exemption is named in the output. Noted in
the analyzer comment.

## G3 before / after

Baseline (pre-fix analyzer run on the recorded sametick corpus,
`node scripts/analyze-feveranat-a.js
evidence/2026-11-09/sametick-a-corpus`):

```
G3 CORPUS: FAIL — s96301: ... unaccountedOnsets=8 (scholar d128 radiation_sickness; ...); s96302: ... unaccountedOnsets=10 (scholar d65 radiation_sickness; ...)
G2 NEUTRALITY: PASS — recorded == bare on all 8 seeds
```

Fresh sweep with the fixed recorder (same band: seeds 96301–96308,
competent, 150d, PLENTYDEPRI=1/DEPOSITGATE=1) →
`evidence/2026-11-09/radsnap-a-corpus/` (8 competent + 8 bare +
`feveranat-a-summary.json`, 8.0MB). Wall clock ~14 min. Per-seed
compute times identical to the prefix run below (3490/2030/2696/2662/
3005/1899/3177/1726 ms) — deterministic replay.

```
WALL: national=0/8 table=0 wins=0 waveReach={"1":8,"2":8,"3":8,"4":7,"5":2} medianSurvival=120d max=150d
F1 INCIDENCE: episodes=175 (NPC 154, scholar 21) on 8 seeds; per-seed={"96301":36,"96302":16,"96303":21,"96304":12,"96305":32,"96306":12,"96307":27,"96308":19}
F2 DURATION: closed episodes=173 open at run end=2; duration days: min=0 median=2 mean=2.1 max=12
F3 VECTOR ATTRIBUTION: by vector={"tick":123,"unattributed":13,"wound":27,"unsafe food":6,"food":2,"dirty water":3,"raw food":1}
F4 TREATMENT IN THE WILD: treatEvents by kind={"dutyCure":64,"sickRest":6,"villagerCare":45,"villagerTreat":1} (total 116)
G3 CORPUS: PASS — all legs valid (8 recorded + 8 bare; every onset accounted for; exempted un-snapshot-able: s96301: scholar d128 radiation_sickness (bearer died onset day); s96301: scholar d150 radiation_sickness (bearer died onset day))
G2 NEUTRALITY: PASS — recorded == bare on all 8 seeds
G4 CLASSIFICATION: 175 episode(s) on 8/8 seeds — 13 honestly unattributed (listed under F3 with the sensor gap named)
DIAGNOSIS VERDICT: COMPLETE — 175 episode(s) classified (162 attributed, 13 unattributed-with-gap-named)
```

Before/after control at ONE base (the pre-fix recorder re-run on this
base) → `evidence/2026-11-09/radsnap-a-corpus-prefix/` (8.0MB):

```
G3 CORPUS: FAIL — s96301: ... unaccountedOnsets=9 (scholar d131 radiation_sickness; scholar d133 radiation_sickness; scholar d135 radiation_sickness)
G2 NEUTRALITY: PASS — recorded == bare on all 8 seeds
```

13 radiation onsets in both corpora (all on s96301 — the only seed whose
pellet bearer boosted into sickness range). Fresh: 0 unaccounted (11
snapshot-accounted, 2 bearer-death-exempt). Prefix: 9 unaccounted (the
other 4 are the bearer-death exemptions, incl. the multi-succession
approximation days d129/d137). The fix is what flips G3 at this base.

## Neutrality comparison (fresh vs prefix, same base/seeds/policy/env)

- Trajectories byte-identical on all 8 seeds: daysAlive, end, rank,
  wave, deaths, meals all equal (e.g. s96301 150d survived regional wave
  5 deaths 22 meals 1191; s96302 74d village-lost village wave 4 deaths
  12; s96306 97d regional wave 3 deaths 16; s96308 80d village wave 4
  deaths 9). Per-seed compute times identical to the millisecond.
- Bare fingerprints byte-identical on all 8 seeds.
- `sickOnsets` byte-identical (19/15/19/11/11/12/9/19 per seed) — the
  onset path is roster-free, as designed.
- Deep diff of the competent files: s96301 has exactly 31 differing
  elements, ALL containing `radiation_sickness` — 17 `scholarSick`
  snapshot entries (the only differing daySeries key on those 17 days),
  10 radiation `sickEnds` (`recovered (expired)`), 4 radiation `sickRest`
  treatEvents. Seeds 96302–96308: 0 differences. No non-radiation field
  moves anywhere.
- Analyzer G2 (recorded == bare) PASS on both corpora.

## Proof test

`node scripts/test-radsnap-a.js` — **13 passed, 0 failed**:

- L1 static roster (3 legs): both files, both sets, exact 17/7 lists,
  files agree.
- L2 data: `seDef('radiation_sickness')` mundane / class radiation,
  antibiotics + antiparasitic `no`, field_medicine + triage `cure`.
- L3 live: contracted radiation appears through the sweep file's ACTUAL
  `DISEASE_IDS` literal in a loaded game; non-roster `heatstroke` still
  excluded by the same filter.
- L4 fresh corpus: analyzer G3 PASS + G2 PASS; all 13 radiation onsets
  accounted-or-exempt under an independently recomputed G3 rule; onset
  counts equal fresh vs prefix per seed.
- L4b prefix corpus: analyzer G3 FAIL (9 unaccounted, all radiation);
  count equals the independent recompute.
- L5: 10 radiation sickEnds in the fresh corpus (MUNDANE_IDS path fires).
- L6 synthetic: horizon-edge onset passes G3 via the exemption, named 8/8.
- L7 neutrality: bare fingerprints byte-identical; trajectories
  identical; diff confined to radiation rows (31 elements, s96301 only).

Note: `node scripts/check.js --quick` was NOT run in this tree — the
sibling medchannel worker may run jest concurrently and the brief forbids
concurrent jest; the proof test + analyzer runs above are the
verification for this instrument-only arm. The proof test must be re-run
after any rebase (G4).

## Wall numbers (fresh corpus, for the scale-wall record)

national 0/8, table 0, wins 0, waveReach {1:8, 2:8, 3:8, 4:7, 5:2},
medianSurvival 120d, max 150d. Same band as sametick but a newer base;
s96301 survived the full 150d (regional, wave 5) where the sametick run
lost it at 143d — base drift, not this arm (game code changed in 4
src/js files between the bases; see Metric review).

## Village assessment (brief — instrument arm)

The fresh corpus is one band's worth of villages under the competent
policy on the current base: 121 deaths in the band, 1 starvation death,
sickness deaths 6. The pellet bearer on s96301 boosted into radiation
sickness 13 times across d128–d150 (a boost roughly every other day) and
kept fighting through it — the radiation cost is doing visible work in
the wild, and the instrument can now see it.

## Metric review

- The prereg assumed the fresh sweep would reproduce the sametick
  trajectories, so its G2 bar ("fresh vs sametick per-seed diff confined
  to radiation rows") and the proof test's sametick count-match
  (8/10) were predicated on the same base. FALSIFIED: 4 src/js files
  changed between the sametick base (8cee6a8d2) and this base
  (91869f106) — game.js, progression.js, truth.js, convo-wants.js
  (journey-social-life bonds, wideduty medic-duty widening, first-reveal
  guard, etc.) — and 6/8 trajectories legitimately diverged. REVISION
  (applied this run, not silently): the control is same-base — the
  pre-fix recorder re-run on this base
  (`radsnap-a-corpus-prefix`) vs the fixed recorder on this base. The
  G2 bar is met under the revised control (see Neutrality above).
  Proposed standing revision for the NEXT run: a fresh-sweep
  re-verification must state its base explicitly and, when the target
  corpus is from an older base, budget a same-base prefix run as the
  control rather than assuming trajectory reproduction.
- The prereg's G1 bar ("G3 passes on the sametick corpus or the fresh
  substitute sweep") is met via the fresh sweep + the analyzer
  exemptions. The exemptions were NOT in the prereg — they are a
  re-scope found by the judged legs (the roster fix took unaccounted
  onsets 18 → 2; the residual 2 are a different, narrower root cause:
  bearer-death onsets). The roster fix stands as the primary fix; the
  exemptions are documented in the analyzer header and in this file.
  The horizon exemption (2) is proven synthetically (L6), not live —
  it has not fired on a real corpus yet.
- No metric was re-scored mid-run to a friendlier one: the G3 bar
  (PASS) is unchanged; only the CONTROL for the neutrality comparison
  was corrected, with the falsifying evidence (base drift) recorded
  here.

## Findings for the backlog

- Radiation onsets carry no source string (`contractDisease
  ('radiation_sickness', {})`, `src/js/feastBuff.js:389`), so the
  analyzer honestly reports them unattributed under G4 (13 of 13
  radiation episodes in this corpus). A future arm could attribute them
  ("the pellet's invisible fire") from the disease id itself in the
  sweep's `vectorForScholarSource` / contractDisease wrapper. Appended
  to `hidden_files/sim-findings.md` as `[open]`.
