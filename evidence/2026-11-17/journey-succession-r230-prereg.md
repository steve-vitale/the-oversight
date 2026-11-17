# Journey succession r230 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r230 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r230: follows crisis r229 (today, 2026-11-17).
Base: master b4cdf252d at run start. Lock: playtest-loop-2.lock run_id
2026-11-17T08:55:25Z (own, created at run start; no prior lock present).

## Standing state (why this run plays leg 7, and what it verifies)

r229 succession (2026-11-16) closed with MANTLE-FINE FAIL adjudicated
INSTRUMENT ARTIFACT (34314 d41 Daniel→Gabriela, fineLatency=1 from a
MISSING ROLL — the 41→42 transition went through the expedition path
and left no sleep roll), DRY CENSUS PASS (first fully-clean census on
the leg), F5 WILD EXERCISE vacuous a second straight panel, F6/C3c/F2
wild holds, and C3d PROMOTED to fix item (second sighting: 34312 d+53
Onni, recap "Nothing important" while a live creek-water favor, a
party naming, and a role assignment were on the table).

Since r229, the C3d fix LANDED on another leg — journey-social-life
r231 (db83d5ccd, 2026-11-17 06:01Z): convoRecapLiveLine names the
live want when the thread log is empty (proof 35/35, gate 334/6, 0
attributable) — and journey-crisis r229 (today) CONFIRMED C3d on its
leg. So this run has NO new src/js fix arm: C3d arrives pre-landed,
and this run is its SUCCESSION-LEG WILD VERIFICATION, plus the two
r229 metric-review items owed to r230:

**MANTLE-FINE gap-subtraction revision (r229 metric review — BINDING
this run).** fineLatency = (first roll with the new bearer).dayBefore
− entryDay − gapDays, where gapDays counts days d in [entryDay,
firstNewRoll.dayBefore) with no roll having dayBefore == d. SHADOW-
PROVEN in r229 (scripts/shadow-mantle-gap-r229-20261116.js): over the
r229 panel it reclassifies ONLY the 34314 d41 row (UNEXPLAINED-1 →
SAMPLING-or-CLEAN, gapDays=1); over the r224 corpora it changes
NOTHING (19 rows, 0 changed). The r230 analyzer implements the
revision as the binding latency (field `fineLatency`, gap-adjusted;
r229 roll-based value kept descriptively as `fineLatencyRoll`,
sample-based as `fineLatencySample`, `gapDays` reported per row).
Corpus proof (before the panel): the r230 analyzer over the r229
corpora (PREFIX=r229, EVID_DATE=2026-11-16) must reclassify ONLY
34314 d41 and hold every other row; over the r224 corpora
(PREFIX=r224) it must change NOTHING. If it does not, the revision
is wrong and the run stops before spending seeds.

**F5 TARGETED HARNESS (r229 metric review).** The r225 proof test
(scripts/test-journey-endgame-r225-f5-settled-favor-20261116.js) IS
the targeted harness (stage a settled favor, re-ask it, assert the
variants cycle; 22/22 on r225's base). This run re-runs it on the
current base as the harness verdict, and the panel's wild exercise
is the third attempt to fire the branch in the wild (r225 endgame
and r229 succession both vacuous). A third vacuous panel is a
finding about the branch's wild rate, not a pass.

**C3d WILD HOLD (binding).** The r231 fix must hold in the wild on
the succession leg: 0 C3d-class erasures — a recap-empty pool line
served while a live want / open favor / unanswered question is on
the table. Method: grep the panel's transcript .txt files for the
four recap-empty pool variants and adjudicate each firing against
its sitting, on the r229 Onni/Ruth line (live unfinished thread =
sighting; all beats closed = honest). Positive evidence also
counted: recap servings of a live-want line (convoRecapLiveLine
stale-opener reframes in recap position).

**F6 / C3c / F2 / F4a-c WILD HOLDS (binding, carried).** 0 dry on
the stage-0 opener sites; resume openers name the LIVE favor (0
stale labels); 0 narration quotes in resume-opener memory quotes;
0 curious-singleton dry hits, 0 recap splices, 0 dlg:help dry hits.

No canon doc covers succession/mantle (docs/CANON.md grep: 0
mentions, re-checked this run, same as r54/r91/r94/r202/r209/r218/
r224/r229). No canon invented. No src/js change is pre-planned; any
fix this run makes is a regression fix for a landed fix failing in
the wild, judged by its own proof test per the r147 rule.

## Infra note (registration)

Worktree registration took ~9.5 min (08:56→09:05Z) — faster than
r229's ~20 min. Heartbeat loop (5-min cadence) started 09:07Z;
registry heartbeat_at 2026-11-17T09:07:08Z.

## Questions (r230)

(1) REVISED MANTLE-FINE, gap-subtraction (binding): corpus proof
    reclassifies ONLY the r229 artifact row and changes NOTHING on
    the r224 corpora; fresh panel PASS under the revised bar (0
    flippedImmediate=false outside VILLAGE-OVER, 0
    fineLatency>=2, 0 unexplained fineLatency==1).
(2) C3d WILD HOLD (binding): 0 C3d-class erasures on the panel;
    recap-empty firings adjudicated on the Onni/Ruth line.
(3) F5 WILD EXERCISE (binding): the settled-favor branch fires on
    the panel (it fired on r224's panel, so a zero-fire panel is a
    finding, not a pass); when it fires, variants cycle and 0
    F5-class dry hits. Targeted harness (r225 proof test) re-run on
    this base: 22/22.
(4) F6 WILD HOLD (binding): 0 dry-line servings on the stage-0
    opener sites (repay fulfilled-favor opener, fromSeed curious
    resumes, ask_favor followups) across the panel.
(5) C3c WILD HOLD (binding): every resume opener naming a favor
    names the LIVE favor (or the live need scan); 0 stale labels.
(6) F2 WILD HOLD (binding): 0 narration quotes inside resume-opener
    memory quotes.
(7) DRY CENSUS (binding, extended per r187 metric review, AMENDED
    per r202): 0 ask:lately fellBack; 0 warn_you, 0 confront,
    0 deflect_q, 0 dlg:doubt dry-replacements; 0 dry lines on the
    carried same-class sites (exh closers, base more); 0 AGENCY-DRY /
    TEACH-DRY / OPENER-DRY. Any dry hit fails the census, named-class
    or other-class — the analyzer is the judge; other-class hits are
    filed as next-fix items AND fail the run. Honest nonverbal
    fallbacks (r81 design) are listed, not counted.
(8) WILD CHECK, r192 F1–F3 + r193 agency + r131 HEED + r191
    fresh-favor + r201 favor-settle + r132 nod-loop + r209 F1/F2
    + r218 F3 + r224 F4a/F4b/F4c + r225 F5 + r226 F6 + r228 C3c/F2
    + r231 C3d (binding): 0 regressions on any landed fix's surface.
(9) CONTROLS (binding, smoke bar S_fixed from r224): smoke 33998
    at-death snapshot = d7 Ashanti 10/2/33 + machinery (pick rank 1,
    funeral INCALL true, selfReq 0 on every seed). A pristine-vs-fixed
    smoke A/B is NOT re-run (no src/js change is pre-planned); if the
    smoke snapshot moves, it is base drift since r224, recorded as
    such and the bar re-baselines by measurement, not adoption.
(10) Descriptive: CAP-NC bonded-by-deadline among eligible;
    denominator < 3 stays INSUFFICIENT-DATA. bondedEver reported
    descriptively.
(11) Watch: day-skips stay at zero (fifteenth straight panel watch).

## Panel

- Driver: scripts/journey-succession-r230-20261117.js (r229 driver,
  rename only: r229 -> r230; seeds changed below; EVID 2026-11-17).
- Analyzer: scripts/analyze-journey-succession-r230-20261117.js
  (r229 analyzer, rename only, PLUS the MANTLE-FINE gap-subtraction
  revision above; EVID_DATE env override for the corpus proof;
  default PREFIX r230).
- Panel runner: scripts/run-journey-succession-r230-panel.sh (r229
  runner, rename only).
- Seeds: FRESH BAND 34321–34324 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34321 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for 34321–34324: 0 hits each. Full-evidence .md grep for
  34321/34322/34323/34324 across evidence/**/*.md: 0 hits in ANY
  .md file. Same grep across the goal hidden_files .md files
  (outside the evidence mirror): 0 hits. No forbidden/contaminated
  band list names 3432x. (Raw .json data files contain the digit
  strings as data values — counts/hashes — not band reservations;
  the skill's scope is preregs, lists, screens, extension bands,
  all clean.)
- Band 34321–34324 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation. (Comparison: 34311–34314
  = r229 panel; 34301–34304 = r224 panel; 34291–34294 = r218;
  34281–34284 = r209; 34271–34274 = r202; 34261–34264 = r197;
  34251–34254 = r193; 34241–34244 = r187; 34231–34234 = r183;
  34221–34224 = r181; 34211–34218 = r177; 34201–34208 = r169;
  34011–34018 = r169; 33998 = standing smoke control.)

## Bars (binding, §14)

- MANTLE-FINE (binding, REVISED r230, gap-subtraction): PASS — 0
  flippedImmediate=false rows outside VILLAGE-OVER, 0
  fineLatency>=2 (gap-adjusted), 0 unexplained fineLatency==1,
  0 day-skips.
- DRY CENSUS (binding, extended + amended): 0 ask:lately fellBack;
  0 warn_you, 0 confront, 0 deflect_q, 0 dlg:doubt dry-replacements;
  0 dry lines on the carried same-class sites (exh closers, base
  more); 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY; ANY other-class dry
  hit also fails. Honest nonverbal fallbacks listed, not counted.
- WILD CHECK (binding): 0 regressions on F4a/F4b/F4c/F5/F6/C3c/F2/
  C3d and the carried landed-fix surfaces.
- C3d WILD HOLD (binding): 0 C3d-class erasures (recap-empty pool
  served while a live want is open), adjudicated on the Onni/Ruth
  line.
- F5 WILD EXERCISE (binding): settled-favor branch fires ≥1× on the
  panel AND 0 F5-class dry hits. A zero-fire panel is a finding
  (vacuous a third time), not a pass. Targeted harness (r225 proof
  test) 22/22 on this base.
- CONTROLS (binding, smoke bar S_fixed): smoke 33998 at-death
  snapshot = d7 Ashanti 10/2/33 + MANTLE-FINE clean + pick rank 1,
  funeral INCALL true, selfReq 0 on every seed.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.

## What would count as interesting

- A C3d-class erasure on the panel (r231 fix regression — FAIL LOUDLY).
- An F5-class dry hit on the panel (r225 fix regression — FAIL LOUDLY).
- An F6-class dry hit on the panel (r226 fix regression — FAIL LOUDLY).
- A stale-favor resume opener (r228 C3c fix regression — FAIL LOUDLY).
- A narration quote in a resume opener (r228 F2 fix regression).
- A curious-singleton dry hit / recap splice / dlg:help dry hit
  (r224 fix regression).
- A NEW dry line on an unpooled surface (the next fix item — filed).
- Any MANTLE-FINE miss on the fresh band under the REVISED metric
  (regression — the revision must not hide a real miss: the corpus
  proof guards this).
- A zero-fire F5 panel (the settled-favor branch never fires — the
  vacuous outcome a third time; the fix stays proof-only).
- A live-want recap serving (convoRecapLiveLine firing in the wild —
  positive evidence the C3d fix engages, not just holds).
- Smoke snapshot move vs S_fixed (base drift since r224).
- CAP-NC denominator >= 3 for the first time in several runs.

## Metric review (carried)

- r229's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in their run notes). This run runs telemetry-check
  against the succession baseline and reports LOUD lines; it does
  NOT roll the baseline forward until the mismatch is resolved.
- DRY CENSUS amendment stands (any dry hit fails).
- MANTLE-FINE is revised THIS run (gap-subtraction) per r229's metric
  review; the corpus proof is the guard against the revision hiding
  a real miss. Do NOT re-score this run against the revised metric
  mid-run — the binding bar is the revised metric as pre-registered
  here, and the corpus proof is run BEFORE the panel.
- C3d is CLOSED as a fix (r231, 35/35 proof + crisis r229 confirm);
  this run wild-verifies the fix instead of measuring the watch.
- F5 vacuous twice: the targeted harness (r225 proof test) is the
  verdict vehicle this run; panels don't reach the surface often
  enough to judge it alone.
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: fifteenth straight panel watch.
- Proof refresh rounds 11 + 12 remain owed (not this run's).
