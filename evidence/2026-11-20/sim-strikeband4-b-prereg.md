# sim-strikeband4-b — STEP 1 SCREENING PREREG, 4th band (frozen before any judged sim)

**Arm:** sim-strikeband4-b, step 1 (strike-band search, 4th band) ·
**Loop B run:** fleshout-loop-b-20261120T2130Z · **Axis:** winnability chain
**Type:** DIAG survey, instrument-only. No game-code change, no default
flipped, no lever built.
**Branch:** `sim-strikeband4-b` · **Worktree:**
`~/workspace/worktrees/sim-strikeband4-b`
**Base at arm start:** master `1fcd7edba` (sim-winnability-round-1830
adoption round record — verified at arm start: worktree HEAD
`1fcd7edba...`, `git status --short` empty).
**Frozen:** 2026-11-20 ~21:35 UTC, BEFORE any screening leg.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
(first 12: `1884c8852d38`; git blob `aaf5e31ace8db87a2d51d9f992603df9b6db6d07`).
**Horizon:** 150d, death-aware. **Band screened:** 106241–106248
(8 seeds, ONE leg only — this prereg freezes a single-band screen).

## The question (finding #2605; tracker blank #1)

sim-strikeband-b (1530Z, bases `057bfa60f`) screened three fresh bands
and went NO-GO survey: best band 106231–106238 delivered 2
first-fights / 2 distinct strike-fights against the frozen floors
(6 / 4). The strike bar never bound — all 3 first-fights in 24
seeds struck (mDealt 59, 135, 123), 0 counterplay fights — the pool
floor bound: 9 launches / 24 seeds (0.375/seed) vs 40 / 32 on the
dmgsurvey survey (finding #2627, the launch drought). The dmgcheck-b
1830Z re-run has since RESOLVED #2627's cause as band variance, not
a base regression: the dmgsurvey instrument re-run verbatim on its
designated band 106181–106188 on base `d352834ef` reproduces the
designation EXACTLY (16 launches, 9 first-fights / 6 distinct,
6 fled; corpora byte-identical). The launch engine works on its
designated band; fresh bands still launch thin. This arm screens
ONE more fresh band, 106241–106248, under the strikeband survey
protocol. If it designates, the dmgshape decomposition on it is
the next arm, not this one. If it does not, the verdict is NO-GO
survey and the 4th-band question is closed for this screen.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-20/sim-strikeband-b.md` + survey prereg — the
  3-band NO-GO screen: 9 launches / 24 seeds, best band 2
  first-fights / 2 distinct strike-fights; funnel binding stages
  plan-churned-before-dawn (band 1) and candidate-not-bid
  (bands 2–3); herald-grind proof (§5.1: entry HP must be carried
  by any future decomposition).
- `evidence/2026-11-20/sim-dmgcheck-b.md` + prereg — BAND VARIANCE
  verdict: the 1530Z collapse was the seed draw, not the base;
  the r149 fight-step policy change is proven launch-neutral;
  "Next step is the 4th-band screen 106241–106248
  (coordinator-authorized, fresh prereg)."
- `evidence/2026-11-20/sim-dmgshape-b.md` + prereg — the
  NO-GO METRIC-BROKEN leg whose shape failure this screen exists
  to cure (pool passed, 4 of 6 distinct first-fights 0-damage).
- `docs/CANON.md`, `docs/MONSTER-WAVES.md` — read first; wave-4
  bands (damage 35–95, HP 850–1500) and the readiness bars are
  canon, not re-invented. No canon doc covers expedition
  destination picking (haventarget CANON GAP, inherited).

## Band freshness (verified 2026-11-20, before this prereg)

Candidate band 106241–106248. Search scope per the survey prereg
protocol + `local_seed_band_freshness` skill: (1) `grep` over
`evidence/*/sim-*-prereg.md`; (2) `git grep` bounded-pattern
(`10624[1-8]`) over the whole tracked worktree (contents +
filenames); (3) seed-field checks (`"seed":`, `SEEDS=`, band
ranges) over sim `.md` / preregs / `scripts/*.js`; (4) `grep -rl`
over goal `hidden_files/*.md` + filename `find` over
`hidden_files/` and `evidence/*/perseed-*`. Results:

- **106241–106248 FRESH.** Zero judged corpora: no
  `perseed-*10624*` dir exists anywhere; the strikeband corpora
  are only `perseed-strikeband-b-106211-106218` /
  `-106221-106228` / `-106231-106238`, proving strikeband ran
  only those three bands. Zero seed-field hits in any sim `.md`
  or script. Every broad-pattern hit in old October corpus JSON
  was the same false-positive class the survey prereg
  documented (pantry/kcal values in census/sweep JSON).
- **CORRECTION — `sim-sense3-b-prereg.md` line 108 is WRONG.**
  It calls 106241–106248 "used and therefore NOT fresh"
  ("next band after strikeband-b's 106241–106248, which is used
  and therefore NOT fresh"). That is incorrect. Proof:
  `evidence/2026-11-20/sim-strikeband-b.md` §7 ("106241–106248:
  scoped-fresh per the survey protocol") — strikeband only
  PROPOSED it as the next band, never screened it — and the
  corpus dirs above, which prove strikeband ran only its three
  bands. The sense3 author mistook a proposal for a use. This
  prereg records the correction; the sense3 band choice
  (106251–106258) stands unaffected.
- **The other two namings are authorizations / plans, not uses:**
  `sim-dmgcheck-b-prereg.md:217` ("Next step is the 4th-band
  screen 106241–106248 (coordinator-authorized, fresh prereg)")
  is the coordinator authorization FOR THIS screen; the
  convergence tracker (3 lines) and `sim-findings.md` #2627
  update name it as the planned next step. No judged corpus
  sits behind any of them.
- Already-used bands NOT reused: 106161–106168, 106171–106178,
  106181–106188, 106191–106198 (dmgsurvey-b); 105931–105938
  (dmgshape-b 1230Z); 106081–106088 (dmgshape-rerun-b /
  launchfunnel-b); 106151–106158 (rageholder survey);
  106211–106218, 106221–106228, 106231–106238 (strikeband-b);
  106251–106258 (sense3-b); 107051–107058 (cellgate-a).

## Policy-sha deviation (verified, not assumed)

The strikeband survey prereg froze policy sha `150229eda010`.
On THIS base (`1fcd7edba`) the file's sha256 is
`1884c8852d38...` — the file changed in commit `0d38a74d1`
(journey-landing r149: landing leg panel + dodge/close no-path
fixes + goal-bridge pool). The diff is confined to three
in-fight movement helpers (`beastDodgeMove`, `closeStep`,
`beastStrikeTarget`): no-path / reachability skips that remove
refused in-fight moves. Launch formation, plan bidding, dawn
decisions, and wave-4 targeting are untouched. The change is
PROVEN launch-neutral by the dmgcheck-b 1830Z re-run (same
policy sha, designated band reproduced exactly, corpora
byte-identical). This screen therefore runs on the CURRENT
master policy (`1884c8852d38`) and records it as such; the
screen's metric (first-fight EXISTENCE) is launch-side, and
the launch engine is the thing already proven working on this
policy. The `src/js` delta `057bfa60f..1fcd7edba` is four files
only (`betrayal.js`, `build.js`, `convo-beats.js`,
`convo-dialogue.js` — conversation/social), touching no
launch/fight code. If master moves during this run, the
dmgcheck base-update procedure applies: check the delta touches
nothing in the judged paths before proceeding, and re-run the
proof tests.

## Substrate (env flags — ALLYSLOT3 env-only, as in the survey)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim, 150d death-aware, one leg (recorder ON).
Verified on this base (not taken from the brief): six flags are
env-gated in `src/js` (`VETREENGAGE` in game.js /
villager-brain.js / win-plan.js; `PARTYSIZE4` in
villager-brain.js / win-plan.js; `SENSEEXPED` in
party-wiring.js; `FLEEREPAIR2` in win-plan.js; `FIGHTALLY2` in
fieldFights.js / party-wiring.js; `LAUNCHSURVIVE` is a
driver-side recorder flag, read by the driver, not a `src/`
flag). **ALLYSLOT3 is NOT landed on master `1fcd7edba`**
(port `f4d1100ee` is NOT an ancestor of HEAD;
`grep -c ALLYSLOT3` = 0 across `src/js`). The leg command
still sets `ALLYSLOT3=1`; the driver asserts the ENV var is set,
asserts src ABSENCE (stops if the port is present — the port
belongs to step 3's driver, not this one), and records
`allyslot3InSrc: false` on every corpus. **ZERO `src/js` changes
in this step.** Rationale (survey prereg, unchanged): the
survey's metric is first-fight EXISTENCE and strike-fight
EXISTENCE, which the slot cannot change — it gates only ally3's
in-fight damage, never launch formation or whether a fight is
fought. The designation is valid on the substrate as actually
run (six flags live + ALLYSLOT3 env-only); step 3 ports the
slot and re-verifies its pool on arrival.

## Leg (one band, recorder ON, no early stop — single band)

One leg, seeds 106241–106248, differing from the strikeband
legs ONLY by SEEDS and arm label. Stdout is tee'd to
`evidence/2026-11-20/strikeband4-b-legs.log` so a `@@FALLBACK`
corpus dump (write-flap fallback) is recoverable from the log,
per the rageholder-survey-b precedent. No OFF leg
(launchfunnel-a already established the master-default funnel
is dry) and no REC leg (D1/D2 neutrality proven for this
instrument family by launchfunnel-a/b and dmgsurvey-b,
re-proven for this copy at 30d by the proof test).

## Instrument (reused, not rebuilt — arm-label copies)

- `scripts/strikeband4-survey-driver-b.js` — a copy of
  `scripts/strikeband-survey-driver-b.js` with ONLY these
  changes: header comment, arm/run `strikeband4-b` (out object
  + file names `strikeband4-b-s<seed>`), stop-message prefix
  `STRIKEBAND4`, driver-filename strings in
  `firstCallerFrame`/`fightOrigin` updated to this file, the
  ALLYSLOT3-discrepancy comment re-based to `1fcd7edba`, and
  the usage line re-seeded to 106241–106248. The MODE guard
  stays `MODE=vre`; all substrate assertions stay; all
  recorder logic is byte-identical in behavior.
  Corpus: `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/`
  (8 files).
- `scripts/analyze-strikeband4-survey-b.js` — a copy of
  `scripts/analyze-strikeband-survey-b.js` with ONLY these
  changes: arm/run `strikeband4-b`, output
  `evidence/2026-11-20/strikeband4-b-survey.json`. The
  first-fight + strike-fight counting, ranking, and judge are
  byte-identical.
- `scripts/test-strikeband4-b.js` — proof (mirrors
  `scripts/test-strikeband-survey-b.js` with the arm label,
  base, policy sha `1884c8852d38`, and screening seed 106241
  updated): §1 static (frozen base resolves, src diff 0,
  substrate gates present, ALLYSLOT3 absent from src,
  instrument = the 3 new files only, driver arm/filename
  strings, analyzer exports incl. the new
  `GO_DISTINCT_STRIKE`, selftest green) + §2 first-fight
  counting fixtures + §2b strike-fight counting through
  `firstFightStats` on real temp-dir corpora + §3 funnel
  taxonomy fixture + §4 live 5d shape run on screening seed
  106241 + §5 D1/D2 at 30d on 106241 under the full substrate.

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
  (Eulogy contradict / death-before-strike). Reported so the
  designation's shape is visible, not just its size.

## Primary metric (frozen)

Launched first-fights against the launch target per 8-seed band
(any-origin definition above), with per-seed launches /
first-fights / distinct strike-fights / counterplay-fights /
quads reported.

## DESIGNATION BAR (frozen — a miss is NO-GO, never re-scored)

The screened band designates for the step-2 judged run only if
it clears ALL of these:

1. **First-fight-rich:** ≥ 6 launched first-fights per 8 seeds
   (the dmgshape pool floor, same-substrate priced).
2. **Strike-rich:** ≥ 4 DISTINCT classified strike-fights
   (`mDealt > 0`, distinct key seed/day/mid/vid) — the judged
   decomposition needs at least 4 distinct fights it can price,
   not 2.
3. **Taxonomy completeness:** the funnel taxonomy is complete
   (**0 `unknown`**); all files parse (8/8); 0 instrument
   errors on every file.
4. **Instrument validity:** proof test
   `scripts/test-strikeband4-b.js` green; analyzer selftest
   green; D1 repeatability + D2 wrap neutrality green (30d,
   screening seed 106241, full substrate).

If the band meets bars 1–2, the verdict is **DESIGNATES** —
report the designation and STOP (the dmgshape decomposition
on it is the next arm, not this one). Otherwise the verdict is
**NO-GO** — report the band and its rate, do NOT lower the bar
mid-run; the bar question goes in "metric review". The
designation names the substrate it was measured under
(finding #2616).

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — per band. Also the
standing-199 stall count (the visible ceiling on the prior
bands: 11/24 at exactly 199 in the strikeband screen).

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and at least one
launched first-fight end to end on the band (or, if no band
designates, the nearest launch-adjacent fight lines the corpora
carry). Judge meaning, coherence, consequences — never just
counts. The evidence carries a "metric review" section.

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
   struck this program repeatedly (quiet on the dmgshape-b and
   strikeband-b runs, active earlier on 2026-11-20). The leg
   tees to `strikeband4-b-legs.log` (fallback recovery); writes
   are probed before they matter and verified by size/readback;
   a blocked final commit leaves files on disk intact for
   coordinator adoption, never forced.

## Files

- Prereg: `evidence/2026-11-20/sim-strikeband4-b-prereg.md` (this file)
- Instrument: `scripts/strikeband4-survey-driver-b.js`,
  `scripts/analyze-strikeband4-survey-b.js`,
  `scripts/test-strikeband4-b.js`
- Corpora: `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/`
  (8 files)
- Survey: `evidence/2026-11-20/strikeband4-b-survey.json`
- Evidence: `evidence/2026-11-20/sim-strikeband4-b.md`
  (screening + judged run share one evidence file; the
  screening section is written first, the judged section
  appended after step 3 — only if a band designates)
- Leg log: `evidence/2026-11-20/strikeband4-b-legs.log`
- `src/` diff: 0 lines (DIAG, recorder wraps only).
