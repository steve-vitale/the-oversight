# journey-scale r44 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261027T1058Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. Base master@2097f7f04 (journey-deepening r56) at run start.
**No src/js change planned at pre-register time:** measurement + tooling first
(r43's discipline). A game-code fix is decided ONLY after evidence confirms a
mechanism, and only lands with its own proof test — otherwise the direction
is documented, not driven by.

## Standing context (read before scoring)
- r43 (commit a33fe3c74) closed the bystander-fix verification: 0 bystander-lift
  rows band-wide, 8/8 partitioned, lesser seat 3/4 (85001, 85003, 85004), full
  seat unreached (w5 0 everywhere), PEOPLE-SENSE GO.
- r43 left two named open items for THIS run: (a) formalize the first-capture-diff
  instrument as a JOURNEY-DIVERGENCE report field; (b) the betrayal:accept label
  question — is "betrayal" the picker's name for leaving Haven, or a mislabel?
  (Joshua's d90 trap-line walk accept recorded as betrayal:accept, nothing bad
  happened on the walk.)
- Base-drift check at run start: `git log a33fe3c74..HEAD -- src/js/` is EMPTY
  (22 commits in range, all evidence/scripts). So a full 4-seed rerun is
  expected to reproduce r43 exactly — the pilot-first rule applies: run one
  pilot seed, and expand to the full batch ONLY if the pilot diverges.

## Leg questions (binding)
1. **BETRAYAL-LABEL (r43 item b):** is a betrayal:accept pick a betrayal? Read
   the engine path (betrayal.js betrayalChoices / acceptInvite / pendingInvite)
   and the r43 transcripts + betray files. Verdict rule: LABEL-MISLEADING iff
   accepts occur with no sprung plot while the instrument names them betrayals;
   LABEL-ACCURATE iff every accept springs a plot. Also check whether the
   instrument counts every accept or only the first per villager.
2. **DIVERGENCE TOOL (r43 item a):** new `scripts/journey-divergence.js` — given
   two run dirs, per seed report first differing capture line + surrounding
   context, total differing lines, and identical-or-not. Validation: it MUST
   reproduce r43's reported first-diff lines on r42→r43 (85001 line 7129,
   85002 line 2376, 85003 line 3424, 85004 none) before it is trusted on
   r43→r44.
3. **PILOT PARITY:** pilot seed 85001 on the current base, r43 driver with
   labels/EVIDIR only, policy scalecourt-nogate, DAYCAP 180, death-aware stop.
   If the pilot capture is byte-identical to r43's, the full batch is SKIPPED
   (pilot-first: nothing interesting to expand — the leg is frozen because the
   base is frozen) and the run's value is items 1, 2, 4. If it diverges, expand
   to all 4 seeds and trace each divergence with the new tool.
4. **SEASONED-BAR (analysis-only, r43 data):** on 85003, why 0/3 seasoned
   covenants at end (r43 blocker: seasoned-trust-bar)? From r43's trust JSON
   + trustWatch: split age-short vs trust-short per covenant. No new sim;
   the answer is read off existing evidence + the _linkSeasoned rule
   (age>=30 AND trust>=40, per the r43 analyzer).

## What would count as an interesting finding
- A betrayal:accept that springs an ambush (label accurate for that accept) —
  or the proof that Joshua's two accepts are ordinary invites (label misleading).
- A divergence-tool first-diff line that does NOT match r43's reported lines
  (tool wrong, or r43's ad-hoc numbers wrong — either is a finding).
- A pilot capture that differs from r43 despite zero src/js changes (nondeterminism
  or a scripts-only drift that moves the game — a NEW bug class).
- A seasoned-bar split that is all age-short (the village simply didn't hold
  covenants long enough) vs all trust-short (covenants exist but trust never
  reaches 40) — different next levers.

## Seeds, policies, horizons
- PILOT: seed 85001, policy scripts/policies/scalecourt-nogate.js UNCHANGED,
  driver scripts/journey-scale-r44-20261027.js (r43 driver, labels/EVIDIR only),
  DAYCAP 180, death-aware stop, EVIDIR evidence/2026-10-27/journey-scale-r44
  (scratch dir, never r43's).
- DIVERGENCE VALIDATION: r42 dir evidence/2026-10-26/journey-scale-r42 vs r43
  dir evidence/2026-10-27/journey-scale-r43; then r43 vs r44 pilot.
- PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages == 0, STOP
  and diagnose before anything else.

## Pre-registered metrics (binding — §14 anti-drift)
- PILOT-PARITY: GO iff pilot capture-85001 is byte-identical to r43's. (A miss
  is NO-GO, never re-scored — it expands the batch instead.)
- DIVERGENCE-VALIDATION: GO iff the tool reproduces all four r43 first-diff
  lines (7129 / 2376 / 3424 / none) on r42→r43.
- BETRAYAL-LABEL: REPORT with the verdict rule above — not GO/NO-GO, because
  the label is an instrument naming question, not a game pass/fail.
- SEASONED-BAR: REPORT — age-short / trust-short split per covenant, no bar.
- PEOPLE-SENSE: GO iff the pilot's d90/d120 transcripts (or, if the pilot is
  byte-identical, the re-verified r43 transcripts) show no fabricated shared
  history and no NEW filler loop beyond the known Dorothy-d120 circling control.

## Metric review (filled at run end)
- (to be filled: whether any metric proved wrong, and the revision proposed
  for the NEXT run — never applied mid-run.)
