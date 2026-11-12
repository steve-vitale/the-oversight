# Journey succession r187 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r187 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r187 = next Lane B number after r186 crisis.
Base: master 5c5fbafc2 (sim-winnability-round-1430 adoption evidence) at
run start.

## Standing state (why this run plays leg 7 fresh)

r183 succession (2026-11-11, adopted as r184) was the THIRD fresh panel
under the r170-revised MANTLE-FINE rules: PASS 26/26 synchronous
handoffs, DRY CENSUS PASS with one dry line (warn-details, Naran d94),
RAFAEL FIX PASS, CAP-NC 0/0 eligible with bondedEver 2/2 (third straight
panel), day-skip instrument correction DROPPED TO A WATCH (six straight
panels at zero). Since r183, master moved through the r186 crisis
adoption, which LANDED the fix for r183's one dry line (warn-details
pool-picker in src/js/convo-wants.js, proof 12/12, [needs-eyes]) plus
the r133 scale gesture fix and the r132 raise-answer template. The r186
people check filed one follow-up defect of the SAME CLASS on a different
surface (see Question 1) — this run's job is to investigate it, fix it
if it reproduces, and verify both fixes on a fresh panel, not to
re-prove the r183 bars for their own sake.

## Questions (r187)

(1) CONFRONT DRY-REPLACEMENT (fix item, carried from crisis r186):
seed 14421 d124, a [confront:d_523ecni] pick dry-replaced with
"...Sorry, lost my train of thought." right after a real confession on
another thread — a non-sequitur, same class as the warn-details defect,
different surface (confront, not warning). Does it reproduce in code
review (truth.js confront machinery + the run-ledger no-repeat block)?
If yes: fix scoped like the r186 warning fix (pool-picker / honest
fallback, never a dry line where content was promised), with a proof
test (RED before the fix, GREEN after), and the fresh panel verifies
zero confront dry-replacements in the wild. If it does NOT reproduce
in code review, document the mechanism as found and close the item as
unreproducible — do not invent a fix.
(2) On a fresh 4-seed panel + smoke control, under the r170-revised
MANTLE-FINE rules and the r177-proposed revised smoke bar: does every
bearer <redacted> hand the mantle to a living successor synchronously (no real
deferral), does the r170 lately fix hold (0 ask:lately fellBack), and
does the r186 warn-details fix hold IN THE WILD (0 warn_you
dry-replacements on the panel)? The panel is the wild check for both
fixes; the proof tests are the unit check.
(3) Descriptive: does the CAP-NC bondedEver signal repeat (r181/r183:
2/2 probe-opened pairs bonded eventually)? No decisive denominator is
expected — r183's metric review already judged that a decisive verdict
needs a longer panel or a band with earlier arrivals, and the dominant
failure mode was no-newcomer-arrival, not survival.
(4) Watch: day-skips stay at zero (r183 judgment: watch, not a build).
If a future panel ever records a day-skip, the watch re-opens the
build question.

## Panel

- Driver: scripts/journey-succession-r187-20261112.js (r183 driver,
  rename only: r183 -> r187; seeds changed below).
- Analyzer: scripts/analyze-journey-succession-r187-20261112.js
  (r183 analyzer, rename only — it carries the revised MANTLE-FINE
  rules: VILLAGE-OVER exclusion + SAME-DAY-CASCADE classification).
- Seeds: FRESH BAND 34231–34234 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34231 alone to verify the driver runs
  clean on this base with any fix in; then the remaining 3 seeds
  sequentially, then smoke.
- Fix (if Q1 reproduces): truth.js / conversation.js confront path
  (scoped, see Q1). Proof test:
  scripts/test-journey-succession-r187-confront-dry-20261112.js.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for each seed 34231–34234: 0 hits each. (Comparison: 34221–34224 =
  r183 panel; 34211–34218 = r181 panel; 34201–34208 = r177 panel;
  34011–34018 = r169 panel; 33998 = standing smoke control.) No
  forbidden/contaminated band list names 3423x (no band list exists in
  the goal hidden_files).
- Band 34231–34234 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation.

## Bars (binding, §14)

- MANTLE-FINE (binding, revised r170 rules): PASS — 0 flippedImmediate
  =false rows outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips.
- DRY CENSUS (binding): 0 ask:lately fellBack on the panel; 0
  warn_you dry-replacements on the panel (r186 fix, wild check); 0
  confront dry-replacements on the panel (r187 fix, wild check — only
  if Q1 reproduces and is fixed; if Q1 is unreproducible, this clause
  is descriptive); 0 dry lines on the carried same-class sites (exh
  closers, base more); 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY (carried
  bars).
- CONFRONT FIX (binding, new, only if Q1 reproduces): proof test
  green — (a) the r186 defect shape (a confront pick after a real
  confession on another thread) renders honest content, never the dry
  line; (b) post-fix panel transcripts contain zero confront
  dry-replacements.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- CONTROLS (binding, REVISED per r177 metric review): smoke 33998
  holds the 5 headline numbers (deaths 1, alive 11, fallen 1, stage
  3, mentions 2) + MANTLE-FINE clean + pick rank 1, funeral INCALL
  true, selfReq 0 on every seed. Full-file byte-identity is NO LONGER
  the bar: second-order counter movement is expected (dialogue-ledgering
  changes since r177, incl. this run's fix if any).
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.

## What would count as interesting

- The confront defect reproducing in code review with a clean scoped
  fix (the fix is the finding, the panel is the check).
- A warn_you dry-replacement on the panel despite the r186 fix (would
  be a regression of a landed fix, not a re-proof).
- Any MANTLE-FINE miss on the fresh band after the fix (would be a
  regression — the fix touches conversation paths every sitting runs).
- A fourth straight panel with bondedEver 2/2 on probe-opened pairs
  (capacity signal strengthening while the denominator stays starved).
