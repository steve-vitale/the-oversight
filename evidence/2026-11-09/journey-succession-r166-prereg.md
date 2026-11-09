# Journey succession r166 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r166 after-leg play. Rotation-b read 7 at run start;
this run writes 4 (endgame next) at closeout and VERIFIES the file reads
4 afterwards. Run number r166 = next Lane B number after r165. Base:
master 17777346b (journey-deepening r122 adoption; r165 evidence
recovered onto it as e435de909).

## Standing state (why this run replays leg 7)

r165 (2026-11-09 ~19:55–20:48Z) DIED before committing: its coordinator
timed out after the panel + analyzer finished. This run RECOVERS r165
(prereg + 9-seed panel + analyzer + driver/analyzer scripts, committed
as e435de909, rebased onto master) and completes the verdict the run
never wrote. r165's panel (smoke 33998 + fresh band 34001–34008) found:

- MANTLE-FINE: PASS — 16 bearer deaths, every one flippedImmediate,
  max fine latency 1, all latency-1 cases roll-covered. The carried
  r112/r117 owed item is ANSWERED: the mantle flips synchronously in
  playerDeath; the 2-day latency was driver sampling, not a game
  deferral. No game-side fix owed.
- CAP-NC: INSUFFICIENT-DATA (1/1 eligible bonded-by-deadline).
- DRY CENSUS: **FAIL — 1 miss.** Seed 34007 d22 Sofia: the pantry-run
  favor whyLine dried at a dlg:details turn ("Tell me why you need
  this." → "...Sorry, lost my train of thought."). Mechanism pinned
  from the committed sayTrace + code: the whyLine (1-of-9 combos) was
  run-ledger-blocked AND all three r151 need phrasings were blocked —
  spent by Sofia herself in this sitting (opener/resume/ask stated the
  ask three ways). engageBeat returned the blocked whyLine; sayLine
  dry-replaced it and returned the dry line truthy, so the caller's
  `!said` fallback never fired. The r147 comment's "whose existing
  fallback answers" is false on current master.
- A second dry, descriptive (no binding bar): seed 34003 d71 Javier,
  dlg:more dry-pool closer blocked (all 3 pool variants in the run
  ledger). Same defect class, different turn type. Documented, not
  fixed this run — its terminal case (all variants blocked) has no
  clean rung; the next run owns it.
- AGENCY-DRY / TEACH-DRY / OPENER-DRY: PASS (0). SELF-REQUEST: 0.
  CARRIED: pick rank 1, funeral INCALL true, every seed.
- PEOPLE CHECK (r165 transcripts, read in recovery): 8 seeds read.
  Villagers read as people — grief with names (Raj), "Someone died.
  The work didn't.", "I put down Nostalgia at the treeline. Don't
  call it brave. Call it awake.", the r161 agency fix holding in the
  wild (DeAndre d+14 speaks the trapline line on the re-run).
  34002 drove no conversations (reqTotal=0, quiet seed).

## Question (r166)

Does the r166 fix (engageBeat returns null when whyLine + all three
need phrasings are blocked; dlg:comfort falls back to its pool) make
the Sofia turn speak gracefully in the wild, without changing any
unblocked path — and do the carried regression bars still hold?

## Fix (landed this run, before the after-leg)

- src/js/convo-wants.js ask_favor.engageBeat: both-blocked → return
  null (was: return the blocked whyLine). All engageBeat callers fall
  back to their graceful lines. Comments updated (r147 + r151 claims
  corrected).
- src/js/convo-dialogue.js dlg:comfort: engageBeat null → comfort
  pool (was: voiceLine(null) → sayLine(null) → silent turn).
- src/js/conversation.js convoThreadBeat 'want' branch: comment
  corrected (the dry admission was never "correct" here — the content
  was spoken by someone else in the run, not delivered in this
  sitting).
- Proof test scripts/test-journey-succession-r166-askfavor-exhaustion.js:
  engage-allblocked (null), details-allblocked (graceful reply, want
  live), control (whyLine). Verified RED on unfixed code (3 FAILURES)
  and GREEN after (ALL GREEN, 23 checks).
- r151 test updated (design change on purpose): engage-allblocked now
  asserts null; header comment corrected. r147 header comment
  corrected. r146/r147/r155/r157/r161 proof tests re-run GREEN.

## After-leg (this run)

- Driver: scripts/journey-succession-r166-20261109.js = r165 driver
  with ONLY r165->r166 renames. Analyzer: same rename.
- Seeds: 34007 (the Sofia seed, panel config POST_DAYS=70,
  EARLY_KILL_DAY=40) + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25,
  control: DeAndre trapline must still speak). No fresh band — the
  fix is verified on the seed that produced the miss, plus the unit
  proof; a fresh panel would re-measure the denominator, not the fix.
- Analyzer run on both seeds for the census + MANTLE-FINE lines.

## Bars (binding, §14)

- DRY CENSUS (binding, the failed bar): ZERO dry lines at ask/details
  turns attributable to a favor whyLine on the after-leg seeds. The
  Sofia d+14 transcript must speak a need/graceful line, never the dry
  line; sayTrace on 34007 must show no favor-why fellBack.
- AGENCY-DRY / TEACH-DRY / OPENER-DRY (binding, carried): ZERO on
  the after-leg seeds.
- MANTLE-FINE (binding, carried from r165): every observed bearer
  death flippedImmediate, fine latency <= 1 with roll cover.
- PROOF TESTS (binding): r146 + r147 + r151 (updated) + r155 + r157
  + r161 + r166 ALL GREEN on the final tip.
- GATE (binding): check.js --quick on the final tip; standing
  failures only, no new attributable failure; load timeouts re-run
  standalone.

## What would count as an interesting finding

- The Sofia turn still drying after the fix (fix incomplete).
- A NEW dry appearing on the after-leg seeds (fix leaking).
- The graceful line itself blocked (the corner the fix leaves open).
- Any control changing (trapline line, CAP-NC, self-request).

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions (r151 precedent:
per-seed means; the checker sums — LOUD lines on deaths.bearer /
census.fallen are the summation artifact unless per-seed means move).
Run on the r165 panel tele files (the 8-seed panel is the measurement;
the 2-seed after-leg is the fix verification, not a new baseline).

## Metric review (to be filled after the after-leg)

- The prereg's instrument fix (day-skip correction in the coarse
  detector) is NOT implemented this run: zero day-skips observed
  across 16 deaths / 8 seeds / ~500 sleeps, coarse latency 0 wherever
  measured, rollCover classification already covers the sampling
  case — and no deterministic staging path exists to prove the
  correction. It stays an open instrument item for a run that
  observes a real skip. The DRY fix is this run's real change.
- Javier dlg:more dry (34003) is the same defect class on a
  turn type with no binding bar; carried as a documented finding with
  the mechanism pinned, not fixed this run.
- CAP-NC denominator: 1 eligible again (second handoffs dominate).
  A decisive CAP-NC verdict needs a longer panel or a band with
  earlier arrivals — a prereg question for the NEXT run.
