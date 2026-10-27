# sim-spandraw-census-b — pre-registration (committed BEFORE any census sweep)

Run: oversight-flesh-out-loop-b, arm sim-spandraw-census-b, axis food-economy.
DIAG/measurement ONLY: ZERO src/js changes, ZERO default flips, ZERO
changes to any existing analyzer or to scripts/dedupspan-ledger-b.js /
scripts/dedupspan-apply-b.js. This arm measures with the already-wired
span-dedup rule; it does not re-land or re-judge it.

## Question (from hidden_files/sim-findings.md, food-economy/ledger)

"SPAN-DRAW CLASS BEYOND CULTIVATE — only cultivate spans are proven
to swallow an endDay; other useAbility spans that cross a day boundary
could create the same direct+meal double-count. A span-draw census
across ability types is the follow-up, not assumed."

Background taken as proven, NOT re-proved: sim-cultnest-b (NESTED) +
sim-dedupspan-b (GO) + sim-dedupspan-wire-b (GO). The 9954 residual
(+3,800 kcal generic, +20 Fish catch) was a single cultivate
useAbility span double-count; the dedup rule (exclude ability-span
draws when summing directRecords + mealDrawRecords) is wired into
all 8 summing analyzers. This arm asks only whether any OTHER
ability type does the same thing on a fresh band.

## Corpus, policy, horizon (pre-registered)

- Sweep: a vendored copy of scripts/sweep-9954cultnest-b.js
  (scripts/sweep-spandraw-census-b.js) with ONLY these changes:
  output dir evidence/2026-10-27/sim-spandraw-census-b-corpus/,
  file prefix spandraw-census-b-, PERSEED_DIR env override honoured,
  and ONE added read-only post-run ability-ownership snapshot
  (scholar.abilities ids + village.npcAbilities ids per villager,
  read-only, no RNG, no state write). The span logger itself is
  UNCHANGED (useAbility span entry/exit + pantryDraw entry/exit on
  one monotonic evt counter, installed outside the stockdoors
  useAbility wrapper and outside the mealdraw pantryDraw wrapper).
  No capture file is modified; no src/js is modified.
- Policy: competent-nofeast substrate exactly as the cultnest sweep
  gates it: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, FEASTSCALE_R13 unset/0, POLICY=competent.
  ("Competent policy" in the task = this competent substrate, not
  a belongseek/treeline variant, so the census is not confounded
  by a regional-politics policy's extra ability use.)
- Horizon: DAYS=100 MAXIMUM, death-aware via runDays endReason —
  never a fixed 200d. Justification: 100d is the horizon of every
  prior span corpus (9954 cultnest replay, raidcallers band), so
  span rates are comparable; it is long enough for dozens of
  useAbility spans per seed (9954 alone had 26) and for many
  endDay crossings, while dead villages stop simulating (the
  sweep reports daysAlive + endReason per seed, and a seed that
  dies early contributes its spans up to death, not a padded
  100d of nothing). A fixed 200d would double compute for a
  question about span mechanics, not late-game reach.
- Pilot seeds: 9951-9958 (8 seeds, distinct from the 9954 anchor;
  the 9954 anchor is NOT re-run in this arm — its verdicts stand).
- Full census band IF the pilot passes: pilot 8 + 9959-9966 (8
  more) = 16 seeds. Confirm band IF a new PROVEN class appears
  in the pilot or full band: 12 fresh seeds 9967-9978, judged
  ONLY on recurrence of that same ability type's double-count
  (same item-matched exclusion, not a new metric).

## Classification rules (fixed before seeing data)

For EACH ability.action key that fires a useAbility span on the band,
from nestEvents + applySpanDedup(payload) per seed (reused, not
re-invented; dedupspan-ledger-b.js is the detector):

- PROVEN-SPAN-DOUBLE-COUNT: >=1 span of this key with
  totalExcludedKcal > 0 attributed to it by applySpanDedup
  (item-matched on name/kcalEach/spoilDay, consuming units;
  amount-matching never counts), AND the span's enterDay !=
  exitDay (day-boundary crossing), AND >=1 span-internal
  pantryDraw (drawEnter evt strictly between span entry/exit).
- SPAN-CROSSES-DAY-NO-DRAW: >=1 span with enterDay != exitDay,
  but zero span-internal pantryDraws and zero exclusions on
  the band. (A day-crossing span with a draw that matches NO
  record item is NOT promoted: unmatched items stay counted
  under the meal draw by the rule, so it is reported as
  crosses-day with an unmatched-draw note, not as proven.)
- NO-DAY-CROSSING: >=1 span fired, zero spans with
  enterDay != exitDay, zero exclusions.
- NOT-FIRED-ON-BAND: zero spans on the band. Never a bare zero:
  the census analyzer MUST also report, per ability id in
  src/data/abilities.json, (a) seeds in which the ability was
  owned at post-run snapshot by player or any villager
  (opportunity present, unused), vs (b) seeds in which it was
  never owned at post-run snapshot (no opportunity on this
  band — not a defect claim). Post-run snapshot is an
  end-of-run observation only; an ability owned mid-run and
  lost before post-run can be missed, and that limit is
  stated in the evidence, not hidden. A NOT-FIRED ability
  with zero owned seeds is NOT called a defect.

Span/draw pairing hygiene (reported, never hidden): per seed,
spans, drawPairs, spanInternalDraws, unmatchedDrawLinks,
ambiguousSpans from applySpanDedup; a seed with
ambiguousSpans > 0 contributes its unambiguous spans only,
and the ambiguity is named in the evidence.

## Legs and GO / DIAG-GO thresholds (judge ONLY against these)

- LEG 1 — pilot gate (sniff, before any confirm spend):
  DIAG-GO iff all 8 pilot seeds complete without sweep crash,
  every pilot payload carries nestEvents, total spans across
  the pilot >= 50, distinct ability.action keys fired >= 5,
  and the analyzer classifies 100% of fired keys (no
  unclassified span). If any clause fails: KILL or NARROW
  (report the failing clause, do not run the full band).
  Rationale: 9954 alone had 26 spans, so 50 across 8 seeds
  is a deliberately low sniff floor — a band below it has no
  power to speak about the class at all.
- LEG 2 — census completeness (full band, 16 seeds):
  DIAG-GO iff every fired key on the full band is classified
  under the rules above, per-key counts (spans, day-crossing
  spans, span-internal draws, exclusions) are published, and
  every NOT-FIRED ability id carries its owned/never-owned
  split. A census that meets LEG 2 is a DIAG-GO even if its
  answer is "cultivate only" — a negative census is a
  completed census, not a failed run, and must NOT be
  re-scored as a failure for finding nothing new.
- LEG 3 — new-class proof (only if a non-cultivate key meets
  PROVEN-SPAN-DOUBLE-COUNT on the pilot or full band):
  DIAG-GO iff (a) at least one full span trace for that key
  is read end-to-end in the evidence and judged real vs
  instrument artifact, (b) the exclusion is item-matched
  (not amount-matched) and the span crosses a day boundary,
  and (c) the same key recurs with an exclusion on the
  12-seed confirm band (9967-9978). If (c) fails, the
  verdict is SINGLE-SEED CANDIDATE, not PROVEN CLASS —
  reported as such, never rounded up.
- LEG 4 — control (cultivate must still show up honestly):
  DIAG-GO iff the analyzer's cultivate row is reported
  whatever it is (proven again, crosses-day-no-draw, or
  no-day-crossing on this competent band) — the 9954
  cultivate proof is NOT assumed to recur on new seeds,
  and a non-recurrence is reported as band behaviour, not
  as a contradiction of sim-cultnest-b (different seeds,
  different policy substrate).

## Before/after and balanced panel (MEASUREMENT.md §15)

This census has NO before/after game leg: zero game changes,
zero lever variants, nothing to panel. The only old-vs-new
comparison is instrument-internal (old sum vs deduped sum
inside applySpanDedup on identical payloads), which is the
detector, not a lever outcome — so NO balance-panel compare
.md is produced or faked for this arm. This paragraph is the
explicit statement required by the task in place of a panel
attachment.

## Wall numbers (reported for the judged corpus, never estimated)

For the full judged band (16 seeds, or pilot 8 if LEG 1
fails): national count, table/wins count, wave 4-5 unlock
count, wave reach per seed, median/max survival (daysAlive),
death-cause shares. Anything not recorded in the payload
(e.g. Arc II/III/IV reach, four-realm formation, trap
acquisition by source, counter discovery/kill rate, young-
link succession survival, tier-2/wave-3 reach as separate
fields) is listed as NOT RECORDED, not estimated.

## Sense-testing

At least one span trace is read end-to-end in the evidence:
if LEG 3 fires, that key's trace; otherwise the longest
day-crossing cultivate span on the band (or, if none, the
longest day-crossing span of any key), judged on whether
the draws inside it are real meals/raids (caller frames:
villageMeal / commonsRaid) vs an instrument artifact. No
villager transcript claim is made for a ledger phenomenon
unless a transcript line actually names the span — the
cultnest arms already established this surface is silent
here, and silence is reported, not filled in.

## Metric review (MEASUREMENT.md §14 — filled in the evidence)

Pre-registered metrics bind this run; a miss is NO-GO /
not-DIAG-GO, never re-scored mid-run. Metric doubts go in
the evidence's "metric review" section for the NEXT run.
