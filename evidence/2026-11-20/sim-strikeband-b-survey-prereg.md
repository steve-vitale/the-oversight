# sim-strikeband-b — STEP 1 SCREENING PREREG (frozen before any screening leg)

**Arm:** sim-strikeband-b, step 1 (strike-band search) · **Loop B run:**
fleshout-loop-b-20261120T1530Z · **Axis:** winnability chain
**Type:** DIAG survey, instrument-only. No game-code change, no default
flipped, no lever built.
**Branch:** `sim-strikeband-b` · **Worktree:**
`~/workspace/worktrees/sim-strikeband-b`
**Base at arm start:** master `057bfa60f1fb8700584325fe3b48e6291dc8836b`
(journey-social-life r256 gate-log closeout; the worktree arrived at
`0106e423c` and was fast-forwarded to this tip — the two commits in
between are a journey-social-life evidence + conversation.js
gossip-ask fix, which touch no launch/fight substrate; policy sha
unchanged).
**Frozen:** 2026-11-20 ~16:06 UTC, BEFORE any screening leg.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `150229eda010b89e4c73c0e7e68d06d30a7191cc3748778339c81f09e470161a`
(first 12: `150229eda010`; git blob `8f8307b54dee`). Same policy the
dmgsurvey and dmgshape legs ran.
**Horizon:** 150d, death-aware. **Bands screened in order:**
106211–106218, then 106221–106228, then 106231–106238 (8 seeds each).
Stop at the FIRST band that clears the designation bar; screen at
most 3 bands (24 seeds).

## The question (findings #2605 + #2620; tracker blank #1)

sim-dmgshape-b (this morning, band 106181–106188) went NO-GO kind
METRIC-BROKEN: pool passed (9 first-fights, 6 fled) but
classification 3/9 vs the 0.90 bar — 4 of 6 distinct first-fights
were 0-damage counterplay (Eulogy contradicts, monster flees) or a
death fight the decomposition cannot price. The decomposition also
lacks a strike-rate term (party lands ~1.07 strikes/round of 4
possible; P_mean 40.84 makes the base-rate ceiling go negative).
Step 2 of this arm re-runs the decomposition with counterplay
classified separately and a fifth strike-rate component — but it
needs a band whose first-fights STRIKE. This step screens FRESH
bands for exactly that: a band with enough first-fights AND enough
distinct strike-fights to carry the judged decomposition.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-20/sim-dmgshape-b.md` + prereg — the
  NO-GO METRIC-BROKEN leg: 16 launches, 9 counted / 6 distinct
  first-fights, 6 fled, 0 killed, 2 died + 1 mFlee; 4 of 6
  distinct first-fights 0-damage (3 Eulogy contradict fights +
  1 Eater death); only 2 distinct strike-fights; P_mean 40.84,
  1.07 strikes/round, base-rate ceiling −52.35, ally-delay 179%
  of gap (degenerate). The pool reproduced exactly in counts
  under the ported slot — the designation transferred; the pool's
  SHAPE is what failed.
- `evidence/2026-11-20/sim-dmgsurvey-b.md` + prereg — the survey
  instrument and its designation (106181–106188: 16 launches, 9
  first-fights, 6 fled; runner-up 106171–106178: 8 first-fights).
  Its GO bar was counts-only (≥6 first-fights); this step adds
  the strike-fight bar the dmgshape verdict demands.
- `docs/CANON.md`, `docs/MONSTER-WAVES.md` — read first; wave-4
  bands (damage 35–95, HP 850–1500) and the readiness bars are
  canon, not re-invented. No canon doc covers expedition
  destination picking (haventarget CANON GAP, inherited).

## Band freshness (verified 2026-11-20, before this prereg)

Candidate bands 106201–106208, 106211–106218, 106221–106228,
106231–106238. Search scope per the survey prereg protocol:
(1) `git grep` over `evidence/*/sim-*-prereg.md`; (2) `git grep`
bounded-pattern over the whole tracked worktree (contents +
filenames); (3) seed-field checks (`"seed":`, `SEEDS=`,
band ranges) over sim `.md` / preregs / `scripts/*.js`;
(4) `grep -rl` over goal `hidden_files/*.md` + filename
`find` over `hidden_files/`. Results:

- **106201–106208 AVOIDED.** Seed 106201 is name-reserved: it
  appears only in freshness-check lists — bowopen-a prereg
  ("verified CLEAR but not picked", 0 hits) and launchfunnel-b
  prereg (checked-candidate list, "none") — and speargate-a
  prereg explicitly avoided it per the skill's
  name-alone-reserves rule ("106201 (named in bowopen prereg,
  avoided)"). The band is not used.
- **106211–106218, 106221–106228, 106231–106238 FRESH.** Zero
  hits naming any of the 24 seeds as a sim seed anywhere:
  zero in any prereg, zero in any sim `.md` / script
  seed-field, zero in goal `hidden_files/*.md`, zero filenames
  in the worktree or `hidden_files/`. Every broad-pattern hit
  in old October corpus JSON was adjudicated by hand, all the
  same false-positive class the survey prereg documented
  (pantry/kcal values in census/sweep JSON — sampled:
  `"rotKcal": 106232`, `"pantryKcal": 106206`,
  `"pantryRoom": 106203` — none a seed use).
- Already-used bands NOT reused: 106161–106168, 106171–106178,
  106181–106188, 106191–106198 (dmgsurvey-b); 105931–105938
  (dmgshape-b 1230Z); 106081–106088 (dmgshape-rerun-b /
  launchfunnel-b); 106151–106158 (rageholder survey);
  107051–107058 (cellgate-a).

## Substrate (env flags — ALLYSLOT3 env-only, as in the survey)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim, 150d death-aware, one leg per band (recorder ON).
Six of the seven flags are env-gated on this base (verified by the
proof test); **ALLYSLOT3 is NOT landed on master `057bfa60f`**
(port `f4d1100ee` is NOT an ancestor of HEAD;
`grep -c ALLYSLOT3` = 0 in `fieldFights.js`, `game.js`,
`party-wiring.js`; `ally3Vid` 0 in `src/js`). The leg command
still sets `ALLYSLOT3=1`; the driver asserts the ENV var is set,
asserts src ABSENCE (stops if the port is present — the port
belongs to step 3's driver, not this one), and records
`allyslot3InSrc: false` on every corpus. **ZERO `src/js` changes
in this step.** Rationale (survey prereg, unchanged): the survey's
metric is first-fight EXISTENCE and strike-fight EXISTENCE, which
the slot cannot change — it gates only ally3's in-fight damage,
never launch formation or whether a fight is fought. The
designation is valid on the substrate as actually run (six flags
live + ALLYSLOT3 env-only); step 3 ports the slot and
re-verifies its pool on arrival.

## Legs (one per band, recorder ON, sequential with early stop)

One leg per band, differing ONLY by SEEDS. Screen band
106211–106218 first; run the analyzer on that band alone — if it
clears the designation bar, STOP and designate it. Otherwise
screen 106221–106228, then 106231–106238. At most 3 legs. Each
leg's stdout is tee'd to `evidence/2026-11-20/strikeband-b-legs.log`
so a `@@FALLBACK` corpus dump (write-flap fallback) is
recoverable from the log, per the rageholder-survey-b precedent.
No OFF leg (launchfunnel-a already established the master-default
funnel is dry) and no REC leg (D1/D2 neutrality proven for this
instrument family by launchfunnel-a/b and dmgsurvey-b, re-proven
for this copy at 30d by the proof test).

## Instrument (reused, not rebuilt — arm-label copies)

- `scripts/strikeband-survey-driver-b.js` — a copy of
  `scripts/dmgsurvey-driver-b.js` with ONLY these changes:
  header comment, arm/run `strikeband-b` (out object + file
  names `strikeband-b-s<seed>`), stop-message prefix
  `STRIKEBAND`, driver-filename strings in
  `firstCallerFrame`/`fightOrigin` updated to this file, and
  the `ALLYSLOT3 unexpectedly present` stop kept verbatim.
  The MODE guard stays `MODE=vre`; all substrate assertions
  stay; all recorder logic is byte-identical in behavior.
  Corpus: `evidence/2026-11-20/perseed-strikeband-b-<band>/`
  (8 files each; band dirs named by seed range).
- `scripts/analyze-strikeband-survey-b.js` — a copy of
  `scripts/analyze-dmgsurvey-b.js` with ONLY these changes:
  arm/run `strikeband-b`, output
  `evidence/2026-11-20/strikeband-b-survey.json`, and the
  strike-fight extension (see Counting): `firstFightStats`
  additionally reports counted + distinct strike-fights, and
  `judge` adds the distinct-strike bar. Ranking unchanged
  (firstFights desc, launches desc, quadLaunches desc, median
  survival desc). **Deviation rationale, recorded before
  freezing:** reusing the dmgsurvey analyzer as-is would
  OVERWRITE `dmgsurvey-b-survey.json` (fixed output path) and
  the dmgsurvey driver as-is would write `dmgsurvey-b-s<seed>`
  files under a strikeband label — the family pattern is
  copy-with-arm-label, and the copies keep the prior survey's
  evidence intact.
- `scripts/test-strikeband-survey-b.js` — proof (mirrors
  `scripts/test-dmgsurvey-b.js`): §1 static (frozen base
  resolves, src diff 0, substrate gates present, ALLYSLOT3
  absent from src, instrument = the 3 new files only, driver
  arm/filename strings, analyzer exports incl. the new
  `GO_DISTINCT_STRIKE`, selftest green) + §2 first-fight
  counting fixtures + §3 funnel taxonomy fixture + §4 live
  5d shape run on screening seed 106211 + §5 D1/D2 at 30d
  on 106211 under the full substrate.

## Counting (frozen definitions — survey verbatim + strike extension)

- **Wave-4+ launch (event):** a `v4departs` row with `result:
  'launch'` and `(targetWave | 0) >= 4`. Quad launch:
  `partySize >= 4`.
- **Launched first-fight (primary metric):** for each launch,
  the earliest `v4encounters` row with `mid === launch.target`
  (monster TYPE id; no instance id), day in
  `[launch.day, launch.day+21]`, fought (`rounds > 0` or
  `mDealt > 0`), ANY origin, ANY fighter. Earliest day wins;
  file order breaks a same-day tie. Two launches may share one
  fight; the distinct count is reported beside the counted
  count.
- **Distinct strike-fight (designation extension):** a distinct
  first-fight (same distinct key as the survey analyzer —
  seed/day/mid/vid) with `mDealt > 0`. Damage dealt implies at
  least one landed strike in the survey corpus shape: the
  dmgshape population's 0-damage fights (Eulogy contradict
  ×3, Eater death) all carry `mDealt = 0`, and its
  strike-fights carry `mDealt` 329 / 504. **Proxy caveat
  (pre-registered):** `mDealt` includes bow-opening volley
  damage, so a fight with volley-only damage and zero landed
  strikes would count as a strike-fight here. That over-counts
  by at most such fights; the judged run (step 2) re-classifies
  every first-fight exactly from `roundsDetail` (landed-strike
  `pMean != null`), so a proxy over-count cannot pass the
  judged classification bar. The designation bar is a screen;
  the judged prereg's classification bar is the judge.
- **Counterplay-fight (reported beside):** a distinct
  first-fight with `mDealt = 0` — the dmgshape 0-damage class
  (Eulogy contradict / death-before-strike). Reported per band
  so the designation's shape is visible, not just its size.

## Primary metric (frozen)

Launched first-fights against the launch target per 8-seed band
(any-origin definition above), with per-seed launches /
first-fights / distinct strike-fights / counterplay-fights /
quads reported.

## DESIGNATION BAR (frozen — a miss is NO-GO, never re-scored)

The first screened band that clears ALL of these is designated
for the step-2 judged run:

1. **First-fight-rich:** ≥ 6 launched first-fights per 8 seeds
   (the dmgshape pool floor, same-substrate priced).
2. **Strike-rich:** ≥ 4 DISTINCT classified strike-fights
   (`mDealt > 0`, distinct key seed/day/mid/vid) — the new bar
   the dmgshape verdict demands: the judged decomposition needs
   at least 4 distinct fights it can price, not 2.
3. **Taxonomy completeness:** the funnel taxonomy is complete
   (**0 `unknown`**) on ALL screened bands; all files parse
   (8/8 per band); 0 instrument errors on every file.
4. **Instrument validity:** proof test
   `scripts/test-strikeband-survey-b.js` green; analyzer
   selftest green; D1 repeatability + D2 wrap neutrality green
   (30d, screening seed 106211, full substrate).

If no screened band meets bars 1–2, the verdict is **NO-GO** —
report the best band and its rate, do NOT lower the bar mid-run;
the bar question goes in "metric review". The designation names
the substrate it was measured under (finding #2616).

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — per band. Also the
standing-199 stall count per band (the visible ceiling on the
prior bands: 15/32 at exactly 199 in the dmgsurvey survey).

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and at least one
launched first-fight end to end on the designated band (or, if
no band designates, the nearest launch-adjacent fight lines the
corpora carry). Judge meaning, coherence, consequences — never
just counts. The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **ALLYSLOT3 set-but-unread** (see above): the survey
   designates on first-fight / strike-fight counts, which the
   slot cannot change; step 2 re-verifies its pool on arrival
   with the slot ported.
2. **Strike-fight proxy** (`mDealt > 0`, see Counting): volley-only
   damage can over-count by at most such fights; step 2
   re-classifies exactly.
3. **Target matching is by TYPE, not instance:** a first fight
   against "the target" may be against a different individual
   of the target species than the one the plan tracked. The
   evidence names the target type beside every first fight so
   this stays auditable.
4. **Day granularity:** a same-day fight may precede the launch
   within the day (the analyzer sees days, not parts). The
   family's convention (day >= launch.day) is kept; same-day
   first fights are flagged in the per-launch table.
5. **Survey corpora carry no decomposition fields** (no
   `roundsDetail` on encounter rows — the launchfunnel recorder
   shape). The survey judges COUNTS only; the damage
   decomposition is step 2's job on its own corpora.
6. **Launch rate is substrate-sensitive** (finding #2616): the
   ranking holds under the survey substrate. A band's rate under
   a different flag set or policy may differ — the designation
   names the substrate it was measured under.
7. **Write flap:** intermittent EPERM on fresh-file writes has
   struck this program repeatedly (most recently quiet on the
   dmgshape-b run, active earlier on 2026-11-20). Legs tee to
   `strikeband-b-legs.log` (fallback recovery); writes are
   probed before they matter and verified by size/readback; a
   blocked final commit leaves files on disk intact for
   coordinator adoption, never forced.

## Files

- Prereg: `evidence/2026-11-20/sim-strikeband-b-survey-prereg.md` (this file)
- Instrument: `scripts/strikeband-survey-driver-b.js`,
  `scripts/analyze-strikeband-survey-b.js`,
  `scripts/test-strikeband-survey-b.js`
- Corpora: `evidence/2026-11-20/perseed-strikeband-b-<band>/`
  (8 files each; band dirs named by seed range, e.g.
  `perseed-strikeband-b-106211-106218`)
- Survey: `evidence/2026-11-20/strikeband-b-survey.json`
- Evidence: `evidence/2026-11-20/sim-strikeband-b.md`
  (screening + judged run share one evidence file; the
  screening section is written first, the judged section
  appended after step 3)
- Leg log: `evidence/2026-11-20/strikeband-b-legs.log`
- `src/` diff: 0 lines (DIAG, recorder wraps only).
