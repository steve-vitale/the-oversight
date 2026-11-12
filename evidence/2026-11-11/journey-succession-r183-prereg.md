# Journey succession r183 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r183 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r183 = next Lane B number after r182 endgame.
Base: master aedf7f699 (batch ship c136d851d-20261111-232432) at run start.

## Standing state (why this run plays leg 7 fresh)

r181 succession (2026-11-11, this morning, adopted) was the SECOND fresh
panel under the r170-revised MANTLE-FINE rules: PASS 26/26 synchronous
handoffs, DRY CENSUS PASS, smoke-bar revision VALIDATED (headlines
1/11/1/3/2 hold). Since r181, master moved through the r182 endgame
adoption (phantom-veteran fix), the r180 social-life adoption
(favorreq-exit honesty), and the r181 crisis adoption (regional ruin
medicines ease/cure as labeled). The crisis adoption CARRIED one defect
to this run (see Question 1) — this run's job is to FIX it and verify the
fix on a fresh panel, not to re-prove the r181 bars for their own sake.

## Question (r183)

(1) Does the Rafael resume-opener defect (crisis r181, seed 14411 d57,
Rafael Mendez) reproduce in code review, and does the fix land cleanly?
The defect, three ways at once: the resume opener attributes Rafael's
own confession ("Before the scattering, I froze when it mattered") to
Theo ("what *they* confided"); falsely claims "You weren't there for
that one" when the player was there in d43 (as Theo); then declares the
thread "settled" after two recap loops in which nothing new was said.
Fix item (crisis r181 filing): the resume opener must name the speaker
who actually left the thread, must not claim the player absent from a
conversation they were in, and the "settled" closer must be gated on new
content being shared.
(2) On a fresh 4-seed panel + smoke control, under the r170-revised
MANTLE-FINE rules and the r177-proposed revised smoke bar: does every
bearer <redacted> hand the mantle to a living successor synchronously (no real
deferral), and does the r170 lately fix hold (0 ask:lately fellBack)?
(3) Descriptive: does the CAP-NC bondedEver signal repeat (r181: 2/2
probe-opened pairs bonded eventually)? No decisive denominator is
expected — r181's metric review already judged that a decisive verdict
needs a longer panel or a band with earlier arrivals, and the dominant
r181 failure mode was no-newcomer-arrival (6/9 seeds), not survival.
(4) Judgment owed (metric review): the day-skip instrument correction
(r166/r169/r170/r177/r181: zero day-skips across ~142 deaths / 25 seeds /
~1300 sleeps, no deterministic staging path) — this run judges whether
the correction is still worth building or drops to a watch.

## Panel

- Driver: scripts/journey-succession-r183-20261111.js (r181 driver,
  rename only: r181 -> r183; seeds changed below).
- Analyzer: scripts/analyze-journey-succession-r183-20261111.js
  (r181 analyzer, rename only — it carries the revised MANTLE-FINE
  rules: VILLAGE-OVER exclusion + SAME-DAY-CASCADE classification).
- Seeds: FRESH BAND 34221–34224 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34221 alone to verify the driver runs
  clean on this base with the fix in; then the remaining 3 seeds
  sequentially, then smoke.
- Fix: src/js/conversation.js (resume opener inherited branch +
  convoCloseLine new-content gate + recap-scaffolding extension in
  convoSnippetIsStageDirection). Proof test:
  scripts/test-journey-succession-r183-rafael-resume-20261111.js.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for each seed 34221–34228: 0 hits each. (Comparison: 34211–34218 =
  r181 panel; 34201–34208 = r177 panel; 34011–34018 = r169 panel;
  33998 = standing smoke control.) No forbidden/contaminated band list
  names 3422x (no band list exists in the goal hidden_files).
- Band 34221–34224 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation.

## Bars (binding, §14)

- MANTLE-FINE (binding, revised r170 rules): PASS — 0 flippedImmediate
  =false rows outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips.
- DRY CENSUS (binding): 0 ask:lately fellBack on the panel; 0 dry
  lines on the carried same-class sites (exh closers, base more);
  0 AGENCY-DRY / TEACH-DRY / OPENER-DRY (carried bars).
- RAFAEL FIX (binding, new): proof test green — (a) inherited secret
  resume names the confider first-person ("what I confided in {pred}")
  and never renders "what they confided" with pred named; (b) the
  stale inherited branch never renders "You weren't there for that
  one"; (c) a recap-only sitting earns no "settled" close line, while
  a sitting with a real new beat on the thread still earns it;
  (d) post-fix panel transcripts contain zero "weren't there for that
  one" lines.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- CONTROLS (binding, REVISED per r177 metric review): smoke 33998
  holds the 5 headline numbers (deaths 1, alive 11, fallen 1, stage
  3, mentions 2) + MANTLE-FINE clean + DeAndre d+7 speaks the
  trapline line + pick rank 1, funeral INCALL true, selfReq 0 on
  every seed. Full-file byte-identity is NO LONGER the bar:
  second-order counter movement is expected (dialogue-ledgering
  changes since r177, incl. this run's fix).
- DAY-SKIP JUDGMENT (metric review, not a bar): judge drop-to-watch
  vs build, on the accumulated 5-panel zero record + this panel.

## What would count as interesting

- The fix changing a panel outcome (a "settled" line that should not
  have fired, an inherited resume that now reads honestly) — the fix
  is the finding, the panel is the check.
- Any MANTLE-FINE miss on the fresh band after the fix (would be a
  regression, not a re-proof — the fix touches conversation.js only,
  but the resume/close paths run every sitting).
- A third straight panel with bondedEver 2/2 on probe-opened pairs
  (capacity signal strengthening while the denominator stays starved).
