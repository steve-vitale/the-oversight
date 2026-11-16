# Journey succession r229 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r229 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r229: follows crisis r228 (today). Base: master
9c78fd585 at run start. Lock: playtest-loop-2.lock run_id
loop2-20261116T215801Z (own, created at run start; no prior lock present).

## Standing state (why this run plays leg 7, and what it verifies)

r224 succession LANDED 2026-11-16: F4a/F4b/F4c dry-line fixes verified
clean in the wild (0 hits in their classes; 48 clean "Still on" recaps,
0 splices), MANTLE-FINE FAIL adjudicated INSTRUMENT ARTIFACT (34303
d108 Elijah→Javier, fineLatency=2 from a 0-day sleep + sample-tag
arithmetic; the flip was synchronous, wrap-proven), DRY CENSUS FAIL on
one NEW surface filed as F5. Since r224, three more fixes landed on
other legs and all need their first wild exercise on the succession
leg — THIS run is a WILD-VERIFICATION run, with NO new fix arm
pre-planned:

**F5 — settled-favor "it's handled" singleton (r225 endgame).**
conversation.js settled-favor branch now cycles 3 honest variants via
convoPickCycle ('favor:handled:' + kind; verified present in this base,
convo-wants.js:771) + fallback. r225's wild check was VACUOUS — the
settled-favor branch never fired in the endgame panel. The succession
panel is the first real wild exercise: r224's panel DID fire the
surface (34301 d105 Farid, trust 90). Question: does the branch fire,
do the variants cycle, and are there 0 F5-class dry hits?

**F6 — dry-opener guard (r226 social life).** The alive:want
handler's stage-0 opener branch now falls to a stale-opener reframe
(convoWantStaleOpener; verified present, conversation.js:3804, 7368)
instead of serving the dry line when all fresh variants are
ledger-blocked. r226: 21 dry-line drops on the social panel (worst
seed 45704: 16) → 0 after the fix on the same seed. Question: does F6
hold on the succession leg (0 dry on the stage-0 opener sites,
repay/curious/ask_favor)?

**C3c — stale-favor resume opener (r228 crisis).** CLOSED by r228:
the harness reproduced the stale label ("that wound care" after the
favor moved to a food share) and the fix landed (convoOpenThreadLabel,
verified present, conversation.js:2237/2370/2602; proof 9/9 × 3
seeds). The watch is closed as a FINDING, not open. Question: does
the fix hold in the wild — resume openers name the LIVE favor, never
a stale label?

**F2 — narration-quote guard (r228 crisis).** convoSnippetIsStageDirection
now rejects mixed snippets whose longest quoted span is a fragment
(< 4 words) while words sit outside the quotes (proof 24/24 × 3
seeds). Question: 0 narration quotes in resume openers on this panel?

**F4a/F4b/F4c (r224) — regression watch.** 0 curious-singleton dry
hits, 0 recap splices, 0 dlg:help dry hits (same as r224's bars).

Any NEW dry surface found on this panel is FILED as the next fix item,
not fixed in this run (r224 prereg rule, carried).

## Metric revision (r224 metric review — implemented THIS run)

MANTLE-FINE fineLatency is revised from sample-based to ROLL-BASED,
per the r224 metric review's proposal for the NEXT run:

- **Old (r187–r224):** fineLatency = first mantle-sample day with the
  new bearer − entryDay. A 0-day sleep (108→108) followed by a sample
  tagged by the sleep's dayAfter reads as lat 2 even when the flip
  was synchronous inside the death (r224 34303 artifact).
- **New (r229):** fineLatency = (first sleep roll whose bearerBefore
  is already the new bearer, or whose bearerAfter is) .dayBefore −
  entryDay. A roll that STARTS with the new bearer proves the flip
  was in place before that sleep; a roll that ENDS with the new
  bearer proves the flip happened during that sleep. Both read 0
  when the flip was synchronous at the entry-day death.
- **rollCover widened:** a latency-1 row is EXPLAINED by a roll with
  dayBefore == entryDay OR dayBefore == entryDay+1 when a 0-day
  sleep intervened (a roll with dayBefore == dayAfter == entryDay
  exists). Same-day-cascade and held-briefly rules unchanged.
- **Bar (binding, revised):** 0 flippedImmediate=false outside
  VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained fineLatency==1,
  0 day-skips. Sample-based latency is still computed and reported
  descriptively (column fineLatencySample) so the revision's effect
  is visible, but the verdict judges the roll-based column only.
- **Corpus proof (before the panel):** the revised analyzer run over
  the r224 corpora (evidence/2026-11-16/journey-succession-r224-*.stdout.json)
  must reclassify 34303 Elijah→Javier GAME-LATE → SAMPLING-or-CLEAN
  and keep every other row's class and the panel verdicts unchanged
  except that row. If it does not, the revision is wrong and the run
  stops before spending seeds.

No canon doc covers succession/mantle (docs/CANON.md grep: 0
mentions, re-checked this run, same as r54/r91/r94/r202/r209/r218/
r224). No canon invented. No src/js change is pre-planned; any fix
this run makes is a regression fix for a landed fix failing in the
wild, judged by its own proof test per the r147 rule.

## Infra note (registration)

Worktree registration took ~20 min (22:03→22:23Z). The
`git worktree add` checkout is I/O-bound on the 7 GB evidence/
tree (`git reset --hard` used 2:10 CPU over 17:37 elapsed, still
running at last check before completion). Nothing was stuck; the
checkout just writes gigabytes. The heartbeat loop (5-min cadence)
started at 22:23Z; registry heartbeat_at 2026-11-16T22:23:48Z.

## Questions (r229)

(1) REVISED MANTLE-FINE (binding): corpus proof reclassifies the
    r224 artifact row and holds all other rows; fresh panel PASS
    under the revised bar (0 flippedImmediate=false outside
    VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained fineLatency==1).
(2) F5 WILD EXERCISE (binding): the settled-favor branch fires on
    the panel (it fired on r224's panel, so a zero-fire panel is a
    finding, not a pass); when it fires, variants cycle and 0
    F5-class dry hits.
(3) F6 WILD HOLD (binding): 0 dry-line servings on the stage-0
    opener sites (repay fulfilled-favor opener, fromSeed curious
    resumes, ask_favor followups) across the panel.
(4) C3c WILD HOLD (binding): every resume opener naming a favor
    names the LIVE favor (or the live need scan); 0 stale labels.
(5) F2 WILD HOLD (binding): 0 narration quotes inside resume-opener
    memory quotes.
(6) DRY CENSUS (binding, extended per r187 metric review, AMENDED
    per r202): 0 ask:lately fellBack; 0 warn_you, 0 confront,
    0 deflect_q, 0 dlg:doubt dry-replacements; 0 dry lines on the
    carried same-class sites (exh closers, base more); 0 AGENCY-DRY /
    TEACH-DRY / OPENER-DRY. Any dry hit fails the census, named-class
    or other-class — the analyzer is the judge; other-class hits are
    filed as next-fix items AND fail the run. Honest nonverbal
    fallbacks (r81 design) are listed, not counted.
(7) WILD CHECK, r192 F1–F3 + r193 agency + r131 HEED + r191
    fresh-favor + r201 favor-settle + r132 nod-loop + r209 F1/F2
    + r218 F3 + r224 F4a/F4b/F4c + r225 F5 + r226 F6 + r228 C3c/F2
    (binding): 0 regressions on any landed fix's surface.
(8) CONTROLS (binding, smoke bar S_fixed from r224): smoke 33998
    at-death snapshot = d7 Ashanti 10/2/33 + machinery (pick rank 1,
    funeral INCALL true, selfReq 0 on every seed). A pristine-vs-fixed
    smoke A/B is NOT re-run (no src/js change is pre-planned); if the
    smoke snapshot moves, it is base drift since r224, recorded as
    such and the bar re-baselines by measurement, not adoption.
(9) Descriptive: CAP-NC bonded-by-deadline among eligible;
    denominator < 3 stays INSUFFICIENT-DATA. bondedEver reported
    descriptively.
(10) Watch: day-skips stay at zero (fourteenth straight panel watch).
(11) Descriptive, carried from r216 (C3d watch): recap-after-favor-commit
    reading "Nothing important" — count sittings where a favor commit
    is followed by a recap naming nothing; a second sighting (after
    14461 d31) promotes it to a fix item. (r218: 0 sightings; r224: 1
    surface match judged NOT a sighting; r228 crisis: 0. Stays filed,
    not promoted.)

## Panel

- Driver: scripts/journey-succession-r229-20261116.js (r224 driver,
  rename only: r224 -> r229; seeds changed below; EVID 2026-11-16).
- Analyzer: scripts/analyze-journey-succession-r229-20261116.js
  (r224 analyzer, rename only, PLUS the MANTLE-FINE revision above;
  default PREFIX r229).
- Panel runner: scripts/run-journey-succession-r229-panel.sh (r224
  runner, rename only).
- Seeds: FRESH BAND 34311–34314 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34311 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for 34311–34314: 0 hits each. Full-evidence grep for 34311/34312/
  34313/34314 across evidence/**/*.md: 0 hits in ANY file. Same grep
  across the goal hidden_files evidence/**/*.md: 0 hits. No
  forbidden/contaminated band list names 3431x (no band list exists
  in the goal hidden_files; the five sim preregs naming
  "forbidden/contaminated" are unrelated screens).
- Band 34311–34314 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation. (Comparison: 34301–34304
  = r224 panel; 34291–34294 = r218; 34281–34284 = r209; 34271–34274 =
  r202; 34261–34264 = r197; 34251–34254 = r193; 34241–34244 = r187;
  34231–34234 = r183; 34221–34224 = r181; 34211–34218 = r177;
  34201–34208 = r169; 34011–34018 = r169; 33998 = standing smoke
  control.)

## Bars (binding, §14)

- MANTLE-FINE (binding, REVISED r229, roll-based): PASS — 0
  flippedImmediate=false rows outside VILLAGE-OVER, 0
  fineLatency>=2, 0 unexplained fineLatency==1, 0 day-skips.
- DRY CENSUS (binding, extended + amended): 0 ask:lately fellBack;
  0 warn_you, 0 confront, 0 deflect_q, 0 dlg:doubt dry-replacements;
  0 dry lines on the carried same-class sites (exh closers, base
  more); 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY; ANY other-class dry
  hit also fails. Honest nonverbal fallbacks listed, not counted.
- WILD CHECK (binding): 0 regressions on F4a/F4b/F4c/F5/F6/C3c/F2
  and the carried landed-fix surfaces (same counts as the DRY
  CENSUS lines above, stated separately because these are landed-fix
  regressions if they fire).
- F5 WILD EXERCISE (binding): settled-favor branch fires ≥1× on the
  panel AND 0 F5-class dry hits. A zero-fire panel is a finding
  (vacuous again), not a pass.
- CONTROLS (binding, smoke bar S_fixed): smoke 33998 at-death
  snapshot = d7 Ashanti 10/2/33 + MANTLE-FINE clean + pick rank 1,
  funeral INCALL true, selfReq 0 on every seed.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.

## What would count as interesting

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
  vacuous outcome again; the fix stays proof-only).
- Smoke snapshot move vs S_fixed (base drift since r224).
- CAP-NC denominator >= 3 for the first time in several runs.

## Metric review (carried)

- r224's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in their run notes). This run runs telemetry-check
  against the succession baseline and reports LOUD lines; it does
  NOT roll the baseline forward until the mismatch is resolved.
- DRY CENSUS amendment stands (any dry hit fails).
- MANTLE-FINE is revised THIS run (roll-based latency + widened
  rollCover) per r224's metric review; the corpus proof is the
  guard against the revision hiding a real miss.
- C3c is CLOSED (r228 harness verdict + fix); this run wild-verifies
  the fix instead of measuring the watch.
- C3d stays open (0 sightings on r218/r224/r228).
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: fourteenth straight panel watch.
- Proof refresh rounds 11 + 12 remain owed (not this run's).
