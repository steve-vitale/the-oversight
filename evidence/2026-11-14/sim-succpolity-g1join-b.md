# sim-succpolity-g1join-b — G1 join false positive: FIXED, GO on all four bars

Run: fleshout-loop-b-20261115T0310Z (Loop B), arm sim-succpolity-g1join-b.
Prereg: `evidence/2026-11-14/sim-succpolity-g1join-b-prereg.md` (commit
b615df4af, binding — committed BEFORE any analyzer change).
Status: **GO — all four bars met.** The instrument is fixed; no verdict
changes; nothing is re-scored.

## The false positive (0155Z record, unchanged)

The 0155Z round's leg (b) (SUCCGRACE=1) reported G1 `GO=false` with
`youngAnswers=6`: six `answerRenegotiation` events joined to link-days
with `prSg=0`. All six were genuine succgrace answers. The policy's
own stats settled it then (`succgraceAnswers` == `succgraceBeatsSeen`
on every seed, 2/2, 1/1, 2/2, 1/1 = 6), and the corrected join now
proves it from the corpus itself.

## Why the join was blind (mechanism, verified in code + corpus)

The day-loop ordering, read from `scripts/sim-harness.js` `runDays`
and `scripts/succpolity-driver-20261114.js`:

1. `runDays` calls `policy.daily` at the END of the day's play,
   before `Game.sleep()` rolls the day.
2. The driver snapshots AFTER each daily call.
3. A succession stages the beat (`link.pendingRenegotiation`, with
   `succgrace: true`) during the day's play or at dawn
   (`src/js/hierarchy.js:1991`; the young-link idiom stages at :1940
   with no succgrace flag — the ONLY two staging sites in the file).
4. The succpolity policy answers at the start of daily — the next
   daily after a dawn staging, the same daily after a during-play
   staging. Both patterns occur in the corpus: 100203 staged d89 /
   answered d90; 100208 staged d100 / answered d100 (staging line
   and answer line share the day).
5. `answerRenegotiation` clears `pendingRenegotiation`
   (`hierarchy.js:2071`) BEFORE the post-daily snapshot runs, so a
   beat staged and answered the same day NEVER appears as `prSg=1`
   in the series. The old join's `prSg=1 on the answer day or the day
   before` could only ever fire for a beat the policy FAILED to
   answer promptly.

Young-link beats (left alone by the policy) DO survive to snapshots:
they show `pr=1, prSg=0` for their 7-day window (verified: 100202
link_mgpspjq9871 pr=1 on d70–76 and d81–88, policy saw it young on
those same days, prSg=0 throughout). `prSg` is therefore a valid read
ONLY for beats the policy did not answer — i.e. lapsed beats — never
for answered ones.

## The fix (`scripts/analyze-succpolity-b.js`, `succgraceAccounting` only)

- **Staged beats = union of two sources:** (a) pr-derived — `pr`
  0→1 transitions per link in the series, any beat that survived to
  a snapshot (young beats left to lapse, and any succgrace beat that
  lingered past a snapshot), each with `via: 'pr'` and `succgrace:
  <prSg on its first pr=1 day>`; (b) policy-derived — one entry per
  `succgrace-answer` event in `capSummary.succpolity.events`, a beat
  answered before any snapshot could record it, with `via:
  'policy'`, `day: <answer day>`, `stagedDayInferred: true` (staged
  that day or the day before — both patterns occur; the policy event
  is the authoritative observation). Dedup: a policy-derived entry
  is dropped when a pr-derived succgrace entry for the same link
  staged within the 7 days before the answer (the retry case). In
  the 0155Z corpus no `prSg=1` cell exists, so no dedup fires.
- **Answers:** `answerRenegotiation` verb events. GENUINE iff a
  matching `succgrace-answer` policy event exists (same linkId,
  same day) OR `prSg=1` on the answer day or the day before (legacy
  fallback, for records without policy events). Otherwise YOUNG (a
  G1 violation). Each genuine entry records `via: 'policy-event' |
  'prSg'`.
- **Answered / lapsed / pending:** a staged entry is answered if a
  genuine answer names its link within [staged.day, staged.day+7]
  (policy-derived entries carry their own answer day). Unanswered
  entries are LAPSED if their pr returned to 0, PENDING-AT-END if
  pr=1 on the last snapshot. `accounted = answeredStaged + lapsed +
  pendingAtEnd` must equal `stagedCount`.
- **Cross-check (informational, per seed):** policy stats vs
  analyzer counts — `answersMatch`, `beatsSeenMatch`, plus young
  sightings vs distinct young beats (sightings ≠ distinct beats;
  reported, not conflated). A mismatch prints an `XCHK MISMATCH`
  line in the analyzer CLI summary.
- **Untouched:** `dissolutionEvents`, `reclimbEvents`, `legVerdict`,
  `pilotVerdict`, `wallNumbers`, the G1/G2/G3 gate definitions, the
  analyzer's CLI output path. The re-judgment writes a NEW file,
  `evidence/2026-11-14/succpolity-g1join-b-analysis.json`; the 0155Z
  `succpolity-b-analysis.json` is untouched (verified: `git diff`
  empty on it).

Context, not changed: the snapshot roll's trust never reflects the
gift's +8 on succession days (100203 Emberhold reads 44 before, on,
and after the d90 gift; the beat text prints the funeral-hour figure,
36). Dissolutions are read from `scaleRank` transitions, never from
the roll, so no verdict moves.

## Re-judged corpus numbers (before → after, per leg)

Before = committed `succpolity-b-analysis.json` (old join); after =
new `succpolity-g1join-b-analysis.json` (fixed join). Same 24
per-seed files, same baseline corpus.

| leg | youngAnswers before → after | staged before → after | answered / lapsed / pending after | G1 GO before → after |
|-----|----------------------------|----------------------|-----------------------------------|----------------------|
| (a) SUCCPOLITY=1 | 0 → **0** | 0 → **12** (0 succgrace, 12 young) | 0 / 12 / 0 | true → **true** |
| (b) SUCCGRACE=1 | 6 → **0** | 0 → **18** (6 succgrace, 12 young) | 6 / 12 / 0 | false → **true** |
| (c) both on | 0 → **0** | 0 → **12** (0 succgrace, 12 young) | 0 / 12 / 0 | true → **true** |

Leg (b) per-seed youngAnswers before → after: 100203: 2 → 0; 100204:
1 → 0; 100206: 2 → 0; 100208: 1 → 0; all other seeds 0 → 0. The 6
answers are all blessed via policy events (`via: 'policy-event'`,
6/6). The 12 distinct young beats per leg (identical across legs —
young beats are engine-level, policy-independent on these seeds):
100201: 1, 100202: 4, 100203: 2, 100204: 1, 100205: 0, 100206: 0,
100207: 2, 100208: 2 — all lapsed, 0 pending at end, 0 young
answers. Young sightings vs distinct beats on leg (b): 93 sightings
of 12 beats (100202 alone: 32 sightings of 4 beats) — the old join
saw none of them; the new join counts each beat once.

Two links carry both kinds, weeks apart, and the new accounting
keeps them distinct: 100204 link_mgpspiwv206 — young beat d44,
succgrace beat answered d139; 100208 link_mgpsphur223 (Stonebridge)
— young beat d23–30, succgrace beat answered d100. 100203's two
young beats are successive beats on ONE link (link_mgpsplah75,
staged d121 and d129 — the 15 sightings the 0155Z evidence
reported as one link seen d121–136 span two beats, 8 + 7 days).

Cross-check: `answersMatch` and `beatsSeenMatch` true on every
leg-(b) and leg-(c) seed carrying succpolity stats (policy answers
== analyzer answers, policy beats seen == distinct succgrace beats
staged, 6 == 6 on leg (b)).

## GO bars — verdicts

- **(a) CORPUS RE-JUDGMENT — GO.** `youngAnswers=0` on all three
  legs, `unaccountedBeats=0` on every seed, cross-check agreeing on
  every seed with stats.
- **(b) SYNTHETIC FIXTURES — GO.** New proof test
  `scripts/test-succpolity-g1join-b-20261114.js`: RED PIN 1 (a
  same-day staged+answered beat, prSg=0 everywhere, with a matching
  policy event) counts as GENUINE (`youngAnswers=0`,
  `answeredStagedCount=1`); RED PIN 2 (a genuinely-young-link
  answer, prSg=0, NO policy event) is STILL flagged
  (`youngAnswers=1`). Guards green: prSg-visible genuine beat via
  the legacy fallback, lapsed young beat via the pr read, retry
  dedup (one staged beat, pr-derived entry kept), pending-at-end.
- **(c) PROOF GREEN ON THE FINAL TIP — GO.** New test 56/56 green;
  old test `scripts/test-succpolity-b-20261114.js` 67/67 static +
  16/16 game (§2, 2× 60d smoke on 100201) green on the final tip —
  untouched file, still passing.
- **(d) G2/G3 UNAFFECTED — GO.** The re-run reproduces the 0155Z
  per-leg `wall`, `pilot`, and `verdict` objects EXACTLY
  (deep-equal, asserted in the new test §3) and the per-seed
  non-succgrace fields EXACTLY; zero `src/js` changes in the branch
  diff. Pilot dissolutions unchanged: (a) 4 events / 3 seeds, (b) 4
  events / 4 seeds, (c) 4 events / 3 seeds; all three `verdict.go`
  remain false (the kills stand — see below).

## NON-RE-SCORING STATEMENT (§14, binding)

The 0155Z run is NOT re-scored under this revision. The three pilot
kills stand EXACTLY as the pilot gate judged them (killed on
dissolutions: (a) 4 events / 3 seeds, (b) 4 events / 4 seeds, (c) 4
events / 3 seeds — all failing the ≤2-of-4 pilot gate). The G1
correction changes no leg verdict: legs (a) and (c) already had G1
GO=true, and leg (b) was killed on dissolutions, not on G1. The
fixed join is the instrument for the NEXT succgrace leg, not a
re-verdict on this one. The 0155Z evidence file
(`sim-succpolity-b.md`) and analysis JSON
(`succpolity-b-analysis.json`) are not edited. The re-judgment lives
only in the new analysis JSON + this file.

## RED pins (recorded)

The new proof test run against the OLD analyzer (before the fix):
**39 passed, 17 failed** — log
`evidence/2026-11-14/g1join-red.log`. The failures are exactly the
designed RED: all four RED PIN 1 assertions (the same-day genuine
answer flagged young, `youngAnswers=1`), §3 leg (b)
`youngAnswers=0` (old analyzer reports 6 — the false positive,
reproduced), leg (b) totals (answered=0, stagedSuccgrace=NaN,
young=6, viaPolicy=0), the §1 fix-marker assertions, and the new
`via`/`crossCheck`/`staged` field assertions on the guard fixtures.
RED PIN 2 passed on the old analyzer too (a young answer was
flagged then as now — the guard against overcorrection holds on
both joins). After the fix: **56 passed, 0 failed** — log
`evidence/2026-11-14/g1join-green.log`.

One fixture correction during the work (recorded, not silent): my
first draft of the prSg-visible guard fixture set pr=0 with prSg=1.
That is impossible data — in the driver's snapshot both fields
derive from the same `pendingRenegotiation` object, so prSg=1
implies pr=1 — and the new analyzer correctly reported staged=0
for it (staged keys on pr, the "a beat is pending" signal). The
fixture was fixed to pr=1/prSg=1 (the old test's rec2 shape); the
analyzer was not bent to accept corrupt data. The dedup guard
fixture had the same shape issue and was fixed the same way, with
its assertion strengthened to check the kept entry is the
pr-derived one (`via === 'pr'`).

## The old test's assertions (semantic change, recorded)

`scripts/test-succpolity-b-20261114.js` lines ~239/248 assert the OLD
(prSg-join) accounting and are LEFT UNTOUCHED — verified: the file
still contains both assertions verbatim and `git diff HEAD` on it is
empty. They still pass under the corrected analyzer because their
fixtures show prSg (both joins classify them the same way). The
corrected semantics live in the NEW proof test, where the same-day
fixture (prSg=0 everywhere + policy event) is the case the old join
gets wrong.

## Proof tests

- `scripts/test-succpolity-g1join-b-20261114.js` (new): §1 static
  (prereg, analyzer markers, old test untouched, G3 static) + §2
  analyzer unit legs (both RED pins + 4 guards) + §3 corpus
  re-judgment (bars (a) + (d)). 56/56 green on the final tip.
- `scripts/test-succpolity-b-20261114.js` (old, untouched): §1
  static 67/67 + §2 game 16/16 green on the final tip.

## What is committed (branch sim-succpolity-g1join-b)

- `b615df4af` prereg (this arm's binding record).
- This stage (to commit): analyzer fix
  (`scripts/analyze-succpolity-b.js`, `succgraceAccounting` only +
  a mismatch-only `XCHK MISMATCH` CLI line), new proof test
  (`scripts/test-succpolity-g1join-b-20261114.js`), re-judgment
  (`evidence/2026-11-14/succpolity-g1join-b-analysis.json`), RED +
  GREEN logs (`evidence/2026-11-14/g1join-{red,green}.log`), this
  evidence file.

## Infrastructure notes

- Index clobber struck after the prereg commit (committed file
  showing staged-deleted, worktree file intact); repaired with the
  documented `git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info` pipe, verified `git status` empty + `git
  diff HEAD` empty. The commit was correct; only the index lied.
- The write flap was quiet during this arm (all writes landed
  first try; no stdout fallbacks needed).

## Metric review

- G1 as corrected measures what it asks: no young-link answers.
  The staged set is now complete (policy events + pr transitions)
  and closes on every seed of the corpus.
- New blind channel, disclosed: the join now depends on the policy
  logging `succgrace-answer` events. A future policy that answers
  renegotiation beats WITHOUT logging those events would have a
  same-day answer misflagged young (the prSg fallback only catches
  beats that linger past a snapshot). Mitigations in place: the
  cross-check (`policySuccgraceAnswers` vs analyzer
  `answeredCount`) flags a missing verb/policy event the moment the
  counts disagree, and the old test's byte-identity + fake-Game legs
  pin the current policy's logging behavior. A future policy change
  must keep the event logging or update this join with it.
- No metric revision is proposed for G2/G3. G2's dissolution
  counting and G3's lever-only rule are untouched by this fix and
  reproduce exactly.
- The snapshot roll's trust on succession days stays unreliable
  (gift's +8 never in the roll) — context for the next leg's
  evidence, not a metric change: dissolutions are read from
  `scaleRank` transitions, never from the roll.

## Convergence state

Winnability chain — this arm is DONE (instrument fix, tracker next
blank #6 from the 0155Z round). The NEXT succgrace leg judges its G1
with this join. No game change lands from this arm; no default flip
is proposed. A `steve-call` is NOT raised — the fix is an instrument
correction under the pre-registered bars, and the 0155Z verdicts
stand unchanged.
