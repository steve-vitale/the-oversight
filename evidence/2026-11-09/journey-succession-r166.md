# Journey succession r166 — Lane B, leg 7 (succession) — RUN NOTE

**Run:** r166 (next Lane B number after r165) ·
**Leg:** 7 succession · **Branch:** journey2-succession (adopted tree) ·
**Base:** master 17777346b at fix time (journey-deepening r122) ·
**Rotation-b:** 7 at run start, writes 4 (endgame next) at closeout ·
**Prereg:** evidence/2026-11-09/journey-succession-r166-prereg.md.

## Standing state — stale-lock recovery (this run's start)

The scheduled 15:00 CST run found the 13:55 CST run (r165) dead, not
live: lock `oversight-playtest-loop-2-2026-11-09T19:55:41Z`, registry
heartbeat 20:42:06Z (19+ min stale at decision), no run process, last
file write 20:47:55Z. r165 had finished its panel + analyzer but died
before its verdict, commit, merge, or lock deletion. Per the
closeout skill: the orphaned evidence was verified (prereg, analyzer,
9 stdout JSONs parse, tele JSONs, 70+ transcripts read in part),
committed as e435de909 ("recovery: ... MANTLE-FINE PASS on 16
deaths"), rebased 1/1 clean onto master, and the stale lock deleted
with a fresh lock for r166. The registry entry still carries r165's
run_id (heartbeat script only touches heartbeat_at); the next run's
guard fails safe on that (no matching run_id = dead = proceed).
Safe-commit index clobber struck on BOTH r166 commits (the known
class) — repaired the documented way both times, blobs verified.

## The carried blank, answered (r165's panel, recovered)

MANTLE-FINE: PASS. 16 bearer deaths on seeds 33998/34001–34008, every
one flippedImmediate=true inside playerDeath, max fine latency 1, all
latency-1 cases roll-covered, 0 day-skips, 0 sampling gaps. The r112
landing note / r117 owed item is ANSWERED: the mantle flips
synchronously; the 2-day latency was driver sampling. A contest death
was observed on the after-leg (34007 Willow -> Bautista d39) and
flipped immediately too — the r117 case class, now with the fine
probe. No game-side mantle fix owed; the prereg's day-skip instrument
correction is NOT implemented (see metric review).

## The finding (r165 panel): DRY CENSUS FAIL — 1 miss

Seed 34007 d22 Sofia, pantry-run favor, dlg:details turn: "Tell me
why you need this." → "...Sorry, lost my train of thought." The
sayTrace entry: pick dlg:details, key the meadow-edge whyLine
("I did the count twice... Nobody's worked the meadow edge, west of
the creek in days..."), preRun=true, fellBack=true. Mechanism pinned
from code + trace: the whyLine (1-of-9 whyBits x whyTails combo) was
run-ledger-blocked AND all three r151 need phrasings were blocked —
spent by Sofia herself in THIS sitting (opener/resume/ask stated the
ask three ways: v0/v1/v2 all in the transcript before the details
turn). engageBeat returned the blocked whyLine; sayLine dry-replaced
it and returned the dry line TRUTHY, so the caller's `!said`
fallback never fired. The r147 comment's "whose existing fallback
answers" is FALSE on current master. A second dry, descriptive (no
binding bar): seed 34003 d71 Javier, dlg:more dry-pool closer blocked
(all 3 pool variants in the run ledger). Same defect class, different
turn type — documented, not fixed this run.

Other r165 bars: AGENCY-DRY PASS (0), TEACH-DRY PASS (0),
OPENER-DRY PASS (0). CAP-NC INSUFFICIENT-DATA (1/1 eligible
bonded-by-deadline). SELF-REQUEST 0 everywhere. CARRIED: pick rank 1,
funeral INCALL true, every seed.

## The fix (src/js, +31/-13 across 3 files)

- convo-wants.js ask_favor.engageBeat: when the whyLine AND all three
  need phrasings are blocked, return null (was: return the blocked
  whyLine). Every engageBeat caller falls back to its graceful line
  (dlg:details' "It's... complicated", dlg:help's nowant pool,
  dlg:more's dry pool, alive:want resume's "Here's the thing").
  Callers verified null-safe (dlg:help, alive:want, threadBeat,
  details favor branch); voiceLine(null) returns null.
- convo-dialogue.js dlg:comfort: engageBeat null → comfort pool (was:
  voiceLine(null) → sayLine(null) → a silent turn).
- conversation.js convoThreadBeat 'want' branch: comment corrected —
  the dry admission was never "correct" here; the content was spoken
  by someone else in the run, not delivered in this sitting.
- No ledger, trust, RNG, gate, deed, wave, or table change.

## Proof test (scripts/test-journey-succession-r166-askfavor-exhaustion.js)

3 cases (heal_help fixture, r151 shape): engage-allblocked (null),
details-allblocked (graceful reply, want live), control (whyLine).
Verified RED on unfixed code (3 FAILURES — beat was the blocked
whyLine; details reply was the dry line) and GREEN after (ALL GREEN,
23 checks). r146 + r147 + r151 (updated) + r155 + r157 + r161 proof
tests re-run GREEN on the fixed tip. r151's engage-allblocked now
asserts null (deliberate design change — the old "honest exhaustion
case" was a dry line in the wild); r147/r151 header comments
corrected. No other test asserts the old return.

## After-leg (fixed code, same seeds) — VERDICTS

Seeds 34007 (panel config) + smoke 33998 (control), r166 driver
(rename only). Analyzer evidence/2026-11-09/
journey-succession-r166-analyzer.txt.

- **DRY CENSUS: PASS.** 0 dry lines in all after-leg transcripts;
  sayTrace 0 fellBack on both seeds. Sofia d+14 on the SAME seed/day/
  picks now answers "I don't have the words for all of it. But thank
  you for asking." — the graceful line, not the dry line. The fix
  works in the wild, not just in the fixture.
- **AGENCY-DRY / TEACH-DRY / OPENER-DRY: PASS.** 0 on both seeds.
- **MANTLE-FINE: PASS.** 6 deaths, all flippedImmediate, max fine
  latency 1, all roll-covered, 0 day-skips.
- **CAP-NC: INSUFFICIENT-DATA** (0 eligible on 2 seeds; descriptive
  bondedEver 1/1). Not a verdict — the after-leg is a fix
  verification, not a panel.
- **Control:** DeAndre d+14 (33998) still speaks the trapline line —
  the r161 agency fix holds. SELF-REQUEST 0. CARRIED: pick rank 1,
  funeral INCALL true, both seeds.
- **Trajectory note:** 34007's run diverged after Sofia's turn (chain
  mantles d39 contest, d68 starvation, d70, d78 vs r165's single
  death) — the fix changes the RNG stream exactly where the dry was,
  as expected when a fix engages. The mantle still flips synchronously
  on every death, including the contest one.

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions. The check
LOUD-flagged deaths.bearer (sum 17 vs mean baseline 7.6) and
census.fallen (sum 36 vs 14.3). **Diagnosis: summation artifact
(known, r151/r155/r157/r161) — the checker sums across 9 files while
the baseline holds per-seed means.** Per-seed means on the r165 panel
(n=8): deaths.bearer 2.0, census.alive 8.50, census.fallen 4.38,
census.integrationStage 3.00, week2.deadBearerMentions 3.75 — against
baseline 7.6 / 3.8 / 14.3 / 3.0 / 4.2. Deaths/fallen DOWN, alive UP:
a band draw, not a base change — the smoke seed 33998 is
byte-identical across r161-before, r165, and r166 (deaths 1, alive
11, fallen 1, stage 3, mentions 2), so the instrument and the base
are stable and the 34001–34008 band simply ran hardier than
33931–33938 (which had 3 villages die out). No real deviation;
baseline NOT rolled forward.

## Village assessment (plain words)

The succession leg works on current master, and the mantle question
that hung over it since November 2 is closed: when the bearer dies,
the next person steps up in the same breath — 22 deaths observed
across the two runs, none deferred, not even a contest death. The
villages talk like people: grief with names, a villager who put down
a monster at the treeline and refuses to call it brave, a pantry run
that finally gets its reason heard instead of a lost train of thought.
One real blemish was found and fixed in the wild — asking a villager
why they need help no longer dead-ends when three of them need the
same thing. 34007's village ran down to a chain of four bearers in
seventy days and still had people standing; the leg's shape holds.
Nothing in this run changes a gate, deed, wave, or table rule
(freeze stands).

## PEOPLE CHECK (sense)

8 r165 d+14 transcripts read in full (one per panel seed; 34002
drove no conversations) + the r166 after-leg Sofia transcript.
Conversations have meaning: real wants (pantry runs with live counts,
wound care, the meadow edge), real grief (Raj; "Someone died. The
work didn't."), real consequences (buried bundles feeding the pantry;
roles as promises, one of each). No new filler, no line promising a
need that isn't there. The one failure was the Sofia dry — fixed,
verified in the wild.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree → **294 passed, 6 failed in 648s** (gate log
evidence/2026-11-09/journey-succession-r166-checkquick.log). The 6 are
all STANDING (same set as r161: measurement-proof-update +
measurement-workflow — retained neutrality proof stale, refresh owed
at ship; mobile-combat-cadence; occupation-panels CLI workflow;
phone-frame-proof retained receipt stale; establishment-r20 voices
gate). No load timeouts this run (gate 648s vs r161's 996s). No new
attributable failure. Proof tests r146/r147/r151/r155/r157/r161/r166
re-run ALL GREEN on the final rebased tip (below).

## Rebased gate (adoption, 17:00 occurrence)

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
on the rebased tip ad3f0fffd (master 7cd52fbb0) →
**292 passed, 8 failed in 1219s** (gate log
evidence/2026-11-09/journey-succession-r166-adopt-gate.log).
Adjudication — GO:

- The 4 STANDING failures are unchanged from the pre-rebase gate:
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20 voices gate.
- The proof refresh FIXED 2: measurement-proof-update and
  measurement-workflow now pass (they failed pre-rebase on the stale
  retained neutrality proof).
- The other 4 are ENVIRONMENTAL, all green standalone on the same
  tip: trust-observer-neutrality 6/6, synergy-stall rc=0,
  capable-bot 42/0, measurement-cache-flags 4/4. The three gate
  timeouts hit the 120s per-script ceiling while the whole gate ran
  2x slower (1219s vs 648s) under the write-flap aftermath and
  sibling-loop contention — not regressions from the r166 src/js
  change (convo-wants/convo-dialogue/conversation.js touch none of
  those paths).
- Family proof tests re-run explicitly on the rebased tip: r146,
  r147, r151, r155, r157, r161, r166 — ALL GREEN, 7/7.
- Flap note: a write-flap (EPERM on creation/writes) ran
  ~22:14–23:18Z, killed the adoption's first three gate attempts
  (0-byte logs), truncated docs/ONTOLOGY.md to 0 bytes in the
  worktree (restored from HEAD, hash verified e16e3ed5c), and blocked
  heartbeats. Stale-lock recovery of r166 at 23:18Z; this
  occurrence's lock oversight-playtest-loop-2-2026-11-09T23:18:56Z.

## Rotation

7 → 4 (endgame next). [Advance at closeout; verify the file reads 4.]

## Metric review

- The mantle 2-day latency owed item (r112 landing note) is ANSWERED
  this run (sampling, not deferral) — it is not carried further.
- The prereg's day-skip instrument correction is NOT implemented: zero
  day-skips observed across 22 deaths / 10 seeds / ~580 sleeps, coarse
  latency 0 wherever measured, rollCover already classifies the
  sampling case — and no deterministic staging path exists to prove
  the correction. It stays an open instrument item for a run that
  observes a real skip.
- Javier dlg:more dry (34003) is the same defect class on a turn type
  with no binding bar; carried as a documented finding with the
  mechanism pinned (all 3 dry-pool closers run-blocked; pickCycle's
  run-ledger preference is a preference, not a filter, so an exhausted
  small pool returns a blocked line). The next run owns it — the
  terminal case needs a design call, not a knob.
- The r147 "existing fallback answers" claim is corrected in code and
  in the r147/r151 test comments: sayLine returns the dry line truthy,
  so `!said` fallbacks never fire on run-blocks. Any future guard
  that returns a possibly-blocked line to a caller must reckon with
  that, not assume the fallback.
- CAP-NC denominator: 1 eligible again (second handoffs dominate). A
  decisive CAP-NC verdict needs a longer panel or a band with earlier
  arrivals — a prereg question for the NEXT run, not a re-score.

## Adoption adjudication (main session, 2026-11-09 ~23:52Z)
- Rebased branch tip ad3f0fffd onto master 7cd52fbb0 (recovery f763765b5 + fix 33c5df9bf [needs-eyes] + note ef93bfc7a + proof refresh ad3f0fffd; proof trio 9/9+9/9+4/4, r166 proof ALL GREEN).
- Rebased gate 23:21–23:41Z: 292 passed, 8 failed in 1245s. Failures = standing 4 (mobile-combat-cadence, occupation-panels, phone-frame-proof, establishment-r20-fixes) + trust-observer-neutrality / synergy-stall / capable-bot (all 120s timeouts) + measurement-cache-flags (exit 1, 71.8s). The gate ran CONCURRENTLY with another check.js (pid 41547, already running at gate start — likely the Lane A journey-landing gate) under heavy load (two Loop B sim workers + my gate), which explains the timeouts.
- Standalone re-runs 23:42–23:51Z, all PASS: trust-observer-neutrality 6/6, synergy-stall EXIT 0, capable-bot 42/42, measurement-cache-flags 4/4. **Gate adjudicated GO — 296/4 standing only.**
- TWO ATTEMPTS polluted by the EPERM write flap (~22:16–23:20Z, ~64 min): first gate died at startup, second gate run 22:40–22:48Z showed ~10 F's incl. human-combat-parity writeFileSync EPERM. Both discarded; the 23:21Z gate above is the adjudicating one.
- Master has since moved to 65fef6d7e (Loop B 2130Z evidence commit, evidence-only — proof stays current). Adopter must rebase onto 65fef6d7e (explicit SHA) before the ff-only merge.
- HANDOFF: the 17:00 Lane B occurrence (lock oversight-playtest-loop-2-2026-11-09T23:18:56Z) is live in this tree re-running the proof tests (pid 57983, from 23:52Z). It owns the closeout from here: rebase, merge --ff-only, release, rotation-b 7→4, delete ITS lock (not the 21:24:51Z one — that lock is already gone), timeline + memory. Main session stands down; do not merge under its running tests.
