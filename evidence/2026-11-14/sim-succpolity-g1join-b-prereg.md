# sim-succpolity-g1join-b — PREREG (instrument fix)

Run: fleshout-loop-b-20261115T0310Z (Loop B), arm sim-succpolity-g1join-b
Axis: winnability chain. INSTRUMENT arm: fix the succpolity analyzer's
G1 join — no game change, no new sims, no lever judged.
Branch: sim-succpolity-g1join-b — worktree ~/workspace/worktrees/sim-succpolity-g1join-b
Date: 2026-11-15

## Canon note (read first)

docs/CANON.md read. No canon doc covers realm holding/dissolution or
the succgrace beat accounting — the rules below are grounded only in
src/js/hierarchy.js (header comments + successionCrisis /
answerRenegotiation / _renegotiationTick) and in the driver/policy
instrument code, never invented. The succgrace beat itself is canon
from the 2026-10-15 sim-succgrace arm (docs/CANON.md change log via
hierarchy.js header ~line 108).

## Background — the false positive (0155Z round, binding record)

The 0155Z Loop B round (evidence/2026-11-14/sim-succpolity-b.md §
"Instrument note" + "Metric review") killed all three succpolity legs
at pilot on dissolutions. Leg (b) (SUCCGRACE=1) additionally reported
G1 `GO=false` with `youngAnswers=6`: six `answerRenegotiation` events
joined to link-days with `prSg=0`. That join is a FALSE POSITIVE. The
policy's own stats settle it: `succgraceAnswers` ==
`succgraceBeatsSeen` on every seed (2/2, 1/1, 2/2, 1/1 = 6 total),
each logged as a `succgrace-answer` policy event with the succgrace
flag seen true at answer time, and zero `answerRenegotiation` events
name a link on a day the policy logged it young.

## Mechanism (verified in code + corpus before writing this prereg)

Why the join is blind — the day-loop ordering, read from
scripts/sim-harness.js `runDays` (policy.daily at the END of the
day's play, before `Game.sleep()`) and
scripts/succpolity-driver-20261114.js (the driver snapshots AFTER
each daily call):

1. A succession stages the beat (`link.pendingRenegotiation`, with
   `succgrace: true`) during the day's play or at dawn
   (hierarchy.js:1991; the young-link idiom stages at :1940 with no
   succgrace flag — the ONLY two staging sites in the file).
2. The succpolity policy answers at the START of daily — the next
   daily after a dawn staging, the same daily after a during-play
   staging. Both patterns occur in the corpus: 100203 staged d89 /
   answered d90; 100208 staged d100 / answered d100 (staging line and
   answer line share the day).
3. `answerRenegotiation` clears `pendingRenegotiation` (hierarchy.js
   :2071) BEFORE the driver's post-daily snapshot runs, so a beat
   staged and answered the same day NEVER appears as `prSg=1` in the
   series. The old join's `prSg=1 on the answer day or the day before`
   can only ever fire for a beat the policy FAILED to answer promptly.
4. Young-link beats (left alone by the policy) DO survive to
   snapshots: they show `pr=1, prSg=0` for their 7-day window
   (verified: 100202 link_mgpspjq9871 pr=1 on d70–76 and d81–88,
   policy saw it young on those same days, prSg=0 throughout).
   `prSg` is therefore a valid read ONLY for beats the policy did not
   answer — i.e. lapsed beats — never for answered ones.
5. Related context (NOT changed by this fix): the snapshot roll's
   trust never reflects the gift's +8 on succession days (100203
   Emberhold reads 44 before, on, and after the d90 gift; the beat
   text prints the funeral-hour figure, 36). The series roll is not a
   reliable trust read on succession days. Dissolutions are read from
   `scaleRank` transitions, never from the roll — this fix does not
   touch dissolution counting.

## The fix (implement exactly this)

In `scripts/analyze-succpolity-b.js`, `succgraceAccounting(rec)` only:

- **Staged beats = union of two sources:**
  (a) pr-derived: `pr` 0→1 transitions per link in the series — any
      beat that survived to a snapshot (young beats left to lapse, and
      any succgrace beat that lingered past a snapshot). Each entry
      carries `via: 'pr'` and `succgrace: <prSg on its first pr=1 day>`.
  (b) policy-derived: one entry per `succgrace-answer` event in
      `capSummary.succpolity.events` — a succgrace beat the policy saw
      and answered before any snapshot could record it. Each entry
      carries `via: 'policy'`, `day: <answer day>`,
      `stagedDayInferred: true` (the beat staged that day or the day
      before — both patterns occur in the corpus; the policy event is
      the authoritative observation that the beat was pending then).
  Dedup: a policy-derived entry is dropped iff a pr-derived entry
  exists for the same link with `succgrace=true` and staged day in
  [answerDay−7, answerDay] (the retry case: answer delayed past a
  snapshot). In the 0155Z corpus no prSg=1 cell exists, so no dedup
  fires; the rule exists so a future lingering succgrace beat is not
  double-counted.
- **Answers:** `answerRenegotiation` verb events. GENUINE iff EITHER
  (i) a matching `succgrace-answer` policy event exists (same linkId,
  same day), OR (ii) `prSg=1` on the answer day or the day before
  (legacy fallback, for records without policy events — e.g. the old
  proof test's prSg-visible fixtures). Otherwise YOUNG (a G1
  violation). Each genuine entry records `via: 'policy-event' |
  'prSg'`.
- **Answered / lapsed / pending:** a staged entry is answered if a
  genuine answer names its link on a day in [staged.day,
  staged.day+7] (policy-derived entries carry their own answer day).
  Unanswered staged entries are LAPSED if their pr returned to 0
  before the last snapshot, PENDING-AT-END if pr=1 on the last
  snapshot. `accounted = answeredStaged + lapsed + pendingAtEnd` must
  equal `stagedCount` (the G1 closure check, unchanged in shape).
- **Cross-check (informational, reported per seed, not a G1 gate):**
  `crossCheck = { policySuccgraceAnswers vs analyzer answeredCount,
  policySuccgraceBeatsSeen vs analyzer stagedSuccgraceCount,
  policyYoungBeatsSeen vs analyzer youngStagedCount }`. BeatsSeen
  counts daily SIGHTINGS, staged counts DISTINCT beats — they agree
  when every beat is answered at first sighting (the clean corpus)
  and may legitimately differ under a retry; a mismatch is reported,
  not silently absorbed. G1's formal gates stay: 0 instrument
  errors, every staged beat accounted, 0 young answers.
- **Untouched:** `dissolutionEvents`, `reclimbEvents`, `legVerdict`,
  `pilotVerdict`, `wallNumbers`, the G1/G2/G3 gate definitions in
  `analyze()`, the analyzer's CLI output path. The re-judgment of the
  pilot corpus writes a NEW file,
  `evidence/2026-11-14/succpolity-g1join-b-analysis.json` — it MUST
  NOT overwrite `succpolity-b-analysis.json` (the 0155Z record).

## Corpus (fixed — no new sims)

- Pilot corpus: `evidence/2026-11-14/perseed-succpolity-b/` — 24
  per-seed files (seeds 100201–100208 × legs (a)/(b)/(c), 150d).
- Baseline for the re-run: `evidence/2026-11-14/perseed-answercourt-confirm-b/`
  (unchanged; wall/G2 numbers must reproduce exactly).
- The pilot panels (`succpolity-panel-{a,b,c}-pilot.json`) carry no G1
  read and are not re-judged.

## Primary metric + GO bars (binding, §14)

- **(a) CORPUS RE-JUDGMENT** — GO iff the fixed analyzer, re-run on
  the 0155Z pilot corpus, reports `youngAnswers=0` on ALL THREE legs
  (the 6 were all same-day genuine answers), with every staged beat
  accounted on every seed (`unaccountedBeats=0`), and the
  policy/analyzer cross-check agreeing on every leg-(b) seed
  (`succgraceAnswers == answeredCount` and `succgraceBeatsSeen ==
  stagedSuccgraceCount`).
- **(b) SYNTHETIC FIXTURES (RED-pinned in the proof test)** — GO iff
  the new proof test
  `scripts/test-succpolity-g1join-b-20261114.js` proves BOTH: (i) a
  same-day staged+answered beat (prSg=0 on every snapshot day, with a
  matching `succgrace-answer` policy event) counts as a GENUINE
  succgrace answer (`youngAnswers=0`, `answeredStagedCount=1`) — this
  fixture FAILS (RED) on the old analyzer; (ii) a genuinely-young-link
  answer (answerRenegotiation with prSg=0 and NO policy event) is
  STILL flagged (`youngAnswers=1`) — the fix must not bless every
  answer. Both fixtures run in the new test; the old test's fixtures
  (prSg-visible beat, lapsed beat) keep passing unchanged.
- **(c) PROOF GREEN ON THE FINAL TIP** — GO iff the new proof test is
  green AND the old proof test
  `scripts/test-succpolity-b-20261114.js` stays green (static §1;
  §2 game legs re-run if the analyzer change could reach them — it
  cannot: §2 never calls the analyzer — so §1 static suffices, plus
  a fresh §2 run on the final tip as belt-and-braces if time allows).
- **(d) G2/G3 UNAFFECTED** — GO iff the re-run reproduces the 0155Z
  pilot/dissolution/wall numbers EXACTLY (per-leg `wall`, `pilot`,
  and `verdict` objects byte-identical to
  `succpolity-b-analysis.json`, modulo the `succgrace` sub-objects
  and the G1 `youngAnswers`/`go` fields the fix corrects), and zero
  `src/js` changes in the branch diff. Any other drift = NO-GO.
- Any miss on any bar = NO-GO for the arm. No re-scoring, no
  mid-run metric revision.

## NON-RE-SCORING RULE (§14, binding)

Do NOT re-score the 0155Z run under the revision. The three pilot
kills stand EXACTLY as the pilot gate judged them (killed on
dissolutions: (a) 4 events / 3 seeds, (b) 4 events / 4 seeds, (c) 4
events / 3 seeds — all failing the ≤2-of-4 pilot gate). The fixed
join is the instrument for the NEXT succgrace leg, not a re-verdict
on this one. The 0155Z evidence file and analysis JSON are not
edited; the re-judgment lives only in the new analysis JSON + this
arm's evidence file.

## The old test's assertions (semantic change, recorded — not silent)

`scripts/test-succpolity-b-20261114.js` lines ~239/248 assert the OLD
(prSg-join) accounting: '0 young answers' for a prSg-visible beat
and 'young-link answer flagged' via the old join. Those assertions
still PASS under the corrected analyzer (the fixtures show prSg, so
both the old rule and the new rule classify them the same way) — the
old test file is LEFT UNTOUCHED. The corrected semantics live in the
NEW proof test, where the same-day fixture (prSg=0 everywhere +
policy event) is the case the old join gets wrong. If the old test
ever fails after this change, that is a loud failure to report, not
an expectation to edit.

## Evidence

- Prereg: this file (committed BEFORE any analyzer change).
- Analyzer: scripts/analyze-succpolity-b.js (`succgraceAccounting`
  only + a mismatch-only cross-check line in the CLI summary).
- Proof: scripts/test-succpolity-g1join-b-20261114.js (new; §1
  static + §2 analyzer unit legs with both RED pins + §3 corpus
  re-judgment asserting bars (a) and (d)).
- Re-judgment: evidence/2026-11-14/succpolity-g1join-b-analysis.json
  (new file; the 0155Z analysis JSON is untouched).
- Evidence: evidence/2026-11-14/sim-succpolity-g1join-b.md (the
  false positive, the fix, the re-judged corpus numbers before/after
  youngAnswers per leg, the fixture RED pins, the explicit
  non-re-scoring statement).
- RED log: the new proof test run against the OLD analyzer (before
  the fix) is recorded in the evidence file.

## Convergence state

Winnability chain — this arm is an instrument fix (tracker next blank
#6 from the 0155Z round), not a lever. A GO arm hands the NEXT
succgrace leg a truthful G1 join; it changes no verdict, lands no
game change, and flips no default.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did the corrected join measure what G1
asks (no young-link answers), or does the policy-event dependence
introduce a new blind channel (e.g. a future policy that answers
without logging events)?
