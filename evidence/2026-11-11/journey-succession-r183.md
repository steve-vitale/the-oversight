# Journey succession r183 — Lane B, leg 7 (succession) — RUN NOTE (INTERIM)

**Run:** r183 (next Lane B number after r182 endgame) ·
**Leg:** 7 succession · **Branch:** journey2-succession ·
**Base:** master aedf7f699 (batch ship c136d851d-20261111-232432) at run start ·
**Rotation-b:** 7 at run start, writes 4 (endgame next) at closeout ·
**Prereg:** evidence/2026-11-11/journey-succession-r183-prereg.md.

## Status — INTERIM (coordinator execution limit; adoption finishes)

The coordinator hit its execution limit mid-panel. The fix + proof work
below is COMPLETE and committed on the branch; the panel is RUNNING
detached (nohup) and the adoption coordinator finishes from this note:
panel completion check → analyzer → people check (transcripts) →
family proofs → telemetry check → gate → rebase onto explicit master
SHA → merge → release → rotation 7→4 → lock delete → memory/tracking
closeout.

Panel runner: `scripts/run-journey-succession-r183-panel.sh`, launched
with nohup (runner PID 19437, pilot node PID 19443 at launch), log
`evidence/2026-11-11/journey-succession-r183-panel.log`. Seeds, in
order: pilot 34221, then 34222–34224 (EARLY_KILL_DAY=40, POST_DAYS=70),
then smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25). The runner stops on
the first failed seed and runs the analyzer itself at the end
(`journey-succession-r183-analyzer.txt`). If any seed failed, the
adoption re-runs ONLY that seed with the same env (never re-run a
complete seed).

Lock: `playtest-loop-2.lock` run_id `loop2-20261111T235602Z` (created
23:56:02Z) — held through adoption; delete at closeout after
verification. Registry heartbeat: 00:24:28Z at last coordinator
heartbeat — the adoption MUST heartbeat immediately on takeover
(`bash scripts/worktree-heartbeat.sh journey2-succession`) and between
steps; the tree holds uncommitted panel files, which the reaper never
auto-removes, but a stale heartbeat still reads as dead.

## The fix — Rafael resume-opener defect (crisis r181 carry, DONE)

Crisis r181 filed one dialogue defect (seed 14411 d57, Rafael Mendez):
the resume opener garbled a thread three ways — it attributed Rafael's
own confession ("Before the scattering, I froze when it mattered") to
Theo ("what *they* confided"), falsely claimed "You weren't there for
that one" when the player was there in d43 (as Theo), then declared the
thread "settled" after two recap loops in which nothing new was said.
Root causes found in code review (`src/js/conversation.js`):

1. **Attribution:** the base labels speak of the NPC in third person
   ("what they confided", "their past") — honest while the speaker is
   the only named person, but the inherited opener names the predecessor
   first ("{pred} and I..."), so "they"/"their" re-binds to the
   predecessor. Fix: in the inherited branch, NPC-self threads take
   first-person labels — `secret` → "what I confided in {pred}",
   `past` → "my past", `personal` → "my story". All three pred
   branches (ago>7, ago>1, same-day) use the re-anchored label.
2. **Presence claim:** the stale branch (ago>7) claimed "You weren't
   there for that one — {pred} was." Every open thread was planted in
   a conversation with the player (endConvo / subject-change only), so
   an inherited thread is always one the player sat in — as the
   predecessor. The claim is false in every case it can fire. Fix: the
   stale branch drops the claim entirely ("{pred} and I never did
   finish talking about {label} — that was {ago} back. Want to hear
   where it left off?"), matching the recent branches, which never
   claimed absence.
3. **"Settled" gating:** `convoCloseLine` fired whenever a hanging
   thread was noted as discussed this sitting — and every turn's line
   is noted as a beat on the current thread, including recap lines
   ("Still on X."). Fix: the closer now requires a REAL beat on the
   thread in this sitting's thread log (per-sitting; reset at
   startConvo). The resume opener itself never counts (its scaffolding
   fails `convoSnippetIsRealBeat`), nor do reframes or recap lines.
   Without a real beat, the closer is withheld and lastClosed cleared
   — the thread closes quietly, never declared settled on nothing.
   Supporting change: `convoSnippetIsStageDirection` now also rejects
   the remaining recap forms as grammar — "We started on X, then got
   onto Y.", "We were talking about X.", "X — that's still where we
   are.", "We're going in circles — still on X.", "As/Like I said —
   we're still on / we started on / we were talking about X." — so
   recap lines can neither quote as memories nor earn a "settled".

## Proof (DONE, all green on the branch)

- NEW `scripts/test-journey-succession-r183-rafael-resume-20261111.js`:
  **21/21 PASS.** Real succession via `playerDeath`; stale inherited
  secret resume reads "Luis and I never did finish talking about what
  I confided in Luis — that was 8 days back. Want to hear where it
  left off? 'Before the scattering, I froze when it mattered.'"
  Recap-only sitting earns no "settled"; sitting with a real new beat
  still earns it; resume opener alone earns none; all 7 recap forms
  fail the real-beat test; a real confession still passes it.
- `scripts/test-inherited-thread-resume-20261015.js` (REPAIRED +
  UPDATED): 6/6 PASS. The test was unrunnable — hardcoded paths to
  the deleted `journey-landing2` worktree — now uses relative paths.
  Its "owns the gap" check asserted the OLD "You weren't there" line;
  updated to the r183 behavior (design changed on purpose per the
  crisis r181 filing; the new line still names the dead, owns the gap
  by naming + inviting, never claims absence).
- `scripts/test-resume-opener-quotes-20261015.js` (UPDATED): 3/3 PASS.
  The r183 stage-direction extension made its planted recap snippet
  unquotable (regression caught by the before/after baseline run);
  the test pins the QUOTING (single quotes, no nested doubles), not
  recap quotability, so its snippet is now a substantive beat with a
  header note explaining the change.
- Green-listed, unaffected: `test-succession-opener-coherence.js`
  (9 checks, two arms) and `test-fusion-mantle-20261015.js` (9 passed).
- `test-snippet-stage-direction.js`, `test-resume-quote-hygiene-20261019.js`
  (10 pass), `test-journey-crisis-r176-resume-quote.js` (15 passed),
  `test-resume-memory-sense-20261016.js` (ALL GREEN),
  `test-resume-hook-quote-20261018.js` (13 assertions) — all green
  with the fix.
- Pre-existing failures, IDENTICAL before/after the fix (verified by
  stashing `src/js/conversation.js` and re-running): 
  `test-convo-resume-quote-20261014.js` (6 pass, 4 fail),
  `test-resume-nesting-r18-20261016.js` (1 pass, 2 fail),
  `test-resume-repair-r17-20261015.js` (9 pass, 1 fail). None is in
  the green list; all three fail on unmodified master the same way.
  Filed as known-stale in sim-findings.md (this run). NOT gate items.
- `test-conversation-coherence-20261007.js` is also stale on master
  (fails at `Game.init()` — `Game.state` null; not in the green list).
  Its close-line assertion (fabricated ledger, no thread log) is
  superseded by the r183 proof test's driven arms. Filed likewise.

## Panel (RUNNING — adoption completes the analysis)

Driver `scripts/journey-succession-r183-20261111.js` (r181 driver,
rename + seeds only), analyzer
`scripts/analyze-journey-succession-r183-20261111.js` (r181 analyzer,
rename only — revised MANTLE-FINE rules). Seeds 34221–34224 fresh
(0 prereg hits each; see prereg) + smoke 33998. Pilot 34221 was
running clean at coordinator handoff (node PID 19443, stderr.log
writing). The adoption MUST verify each seed's stdout.json is valid
JSON before analyzing; the runner already gates on that per seed.

Bars (binding, prereg §14): MANTLE-FINE (revised r170 rules), DRY
CENSUS (0 ask:lately fellBack; 0 dry on carried same-class sites),
RAFAEL FIX (proof green + zero "weren't there for that one" lines in
panel transcripts), CONTROLS (smoke headlines 1/11/1/3/2 + trapline
line + pick rank 1 + funeral INCALL + selfReq 0). CAP-NC descriptive.
Day-skip judgment owed in metric review (5 straight panels at zero).

## People check (TODO — adoption)

Read full transcripts for the leg: at least one inherited-resume
conversation (check the fixed lines read honestly in the wild), one
"settled" close line if any fires (verify a real beat preceded it),
and the d+3/d+7/d+14 checkpoint conversations on the pilot seed.
Check the panel transcripts for "weren't there for that one" (expect
0) and for "what I confided in" (expect present iff an inherited
secret resume fired).

## Village assessment / reachable / fun / winnable (TODO — adoption)

Fill from the analyzer output + transcripts. (Pre-panel expectation
from r181: succession itself is not the choke; the villages that
survive their handoff keep playing toward the table.)

## Telemetry (TODO — adoption)

Run `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-11/journey-succession-r183-tele-342*.json'
--metrics <leg key metrics>` on the 4 panel tele files. The known
summation artifact (checker sums across files vs per-seed-mean
baseline) produced LOUD lines on r151–r181; adjudicate per-seed means
before rolling the baseline forward. Baseline NOT rolled without a
real deviation verdict.

## Gate (TODO — adoption)

Full `node scripts/check.js --quick` on the rebased tip; adjudicate
standing failures (measurement-proof staleness pair, phone-frame-proof
stale receipt) vs load artifacts (re-run standalone green) per the
r181 precedent. Family proofs (r146/r147/r151/r155/r157/r161/r166/
r169/r170) re-run on the rebased tip.

## Metric review (TODO — adoption, from prereg)

- MANTLE-FINE / DRY CENSUS / smoke-bar verdicts on the fresh band.
- CAP-NC: denominator + bondedEver (r181: 0/0 eligible, bondedEver 2/2).
- DAY-SKIP JUDGMENT: 5 straight panels at zero day-skips + this
  panel — drop the instrument correction to a watch, or keep building
  it? The correction has no deterministic staging path after five
  panels of nothing to detect.
- RAFAEL FIX: did the fixed lines fire in the wild? Did any "settled"
  line fire on the panel, and was it earned?

## Rotation

7 -> 4 (endgame next). Advance at closeout; verify the file reads 4.
