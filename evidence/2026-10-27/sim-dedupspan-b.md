# sim-dedupspan-b — landing the ability-span de-duplication rule

Run: oversight-flesh-out-loop-b, arm sim-dedupspan-b, axis food-economy.
Measurement/instrument arm ONLY: ZERO src/js changes, ZERO changes to
any existing analyzer. The rule is landed as a new ledger module,
`scripts/dedupspan-ledger-b.js`, with proof `scripts/test-dedupspan-b.js`.

## Verdict against the pre-registered GO: GO

GO required GO1 + GO2 + GO3 + GO4 + GO5, all met, judged ONLY against
`evidence/2026-10-27/sim-dedupspan-b-prereg.md` (committed as
418e9f72f BEFORE any rule run in this arm). Proof: 33/33 checks PASS,
exit 0. One proof bug was found and fixed during the run, disclosed
below in the same class as the prior arms' corrections — it was a
test bug, not a rule bug, and the rule's numbers never changed.

## The rule (landed, general, span-keyed)

`scripts/dedupspan-ledger-b.js` exports `applySpanDedup(payload)` and
runs as a CLI summary on the 9954 cultnest replay. It:

1. Pairs spanEnter/spanExit on a stack by (ability, action, depth) in
   monotonic evt order. A draw is span-internal iff its drawEnter evt
   falls strictly between its enclosing span's entry and exit evts.
   Never by day label, never by ability name.
2. Resolves a span's created directRecord by seq == directAfter when
   seqs are present (else 1-based ordinal). Seq/ordinal disagreement
   or a missing seq excludes NOTHING (fail-closed).
3. Matches each span-internal draw's drawExit items against the
   created record's remaining items on (name, kcalEach, spoilDay),
   consuming units. Only matched units are excluded; unmatched record
   items stay counted; unmatched draw items stay counted under the
   meal draw. No amount-matching, ever.
4. RETAINS every record: an excluded-from record keeps its place in
   the corpus with summed kcal reduced by exactly the excluded amount,
   flagged `span-duplicate`, with span identity preserved for audit.
5. With no `nestEvents`, yields zero exclusions — it never falls back
   to day-label matching.

LIMITATION, carried from the prereg (not discovered mid-run): nest
drawExit items carry (name, kcalEach, units, spoilDay) only — no
foodState, no granaryDays — so the match key is those four fields,
not the cultnest draft's five-field key. For seq 124 this is exact
(all its items have foodState null). A future span logger should
carry foodState to complete the key; the module documents this.

## Result on the 9954 corpus (cultnest faithful replay)

The rule's input is the 9954 cultnest replay, which the cultnest arm
proved faithful to the raidcallers corpus on every shared field plus
the read-only span log (464 nestEvents: 206 draw pairs = exactly the
206 pantryDraw records, 26 useAbility spans). The bare raidcallers
corpus carries no span log and cannot be the input — day labels
mislead (draws day 35, record day 36, same span) — so it is used
only for the no-span-data guard.

- Spans: 26; spans creating a direct record: exactly 1 (the seq-124
  span); draw pairs: 206, all linked to meal records in order (0
  unmatched); span-internal draws: exactly 2 (meal 466, meal 474);
  ambiguous spans: 0.
- GO1: seq 124 (green_whisper.cultivate, day 36) excluded generic
  3,800 kcal exactly, summed generic 0, retained and flagged
  span-duplicate with span green_whisper.cultivate evt 241 -> 246.
  Total excluded from seq 124: 3,820 kcal (generic 3,800 + the 20
  kcal Fish catch unit), summed total 0. Exclusions are per item:
  4 items (meal 466 x1 + meal 474 x3).
- GO2: only 1 changed record out of 262. All other 261 direct
  records: excluded 0, summed == original, unflagged. Every
  exclusion belongs to seq 124; the unique exclusion draws are
  meal 466 + 474.
- GO3: deduped correct-alignment generic residual = 3,800 (perstack
  closed input figure, not re-judged) − 3,800 (total excluded
  generic) = 0. Analyzer-style check via `analyze-raidcallers-b.js`
  `perSeed()`: generic old newDraws 202,259, old boundary residual
  3,700 (matches the published figure); deduped newDraws 198,459;
  deduped boundary residual −100 — exactly the already-proven
  day-100 inflow timing gap (correct = boundary + 100), not a new
  residual.
- GO4: bare raidcallers corpus (no `nestEvents`): 0 exclusions,
  0 changed records, all sums identical.
- GO5: synthetic generality, all pass — partial match leaves the
  remainder counted; a span creating no record excludes nothing; a
  draw outside any span excludes nothing; non-matching items exclude
  nothing; two independent spans exclude independently.

## Proof bug disclosed (test bug, not rule bug)

The first proof run was 32/33: the GO2 draw-set check compared the
raw per-item exclusion list `[466, 474, 474, 474]` against
`[466, 474]`. Exclusions are per item by design, so meal 474's three
items legitimately appear three times. The fix checks the UNIQUE
draw set plus an item-count check (4 items). The rule's numbers were
identical before and after the fix; the corrected proof passes
33/33. Proof command (from the worktree root):
`node scripts/test-dedupspan-b.js` (exit 0, verdict GO printed).
Rule summary command: `node scripts/dedupspan-ledger-b.js` (exit 0).
No jest (proofs are node, not jest). No [needs-eyes]: measurement,
not a player-visible change. No game-code change: zero src/js files
touched; no existing analyzer modified (their published figures
stand — future ledger runs must use this module, or they will
re-create the +3,800-class residual by summing the old way).

## Metric review (MEASUREMENT.md section 14)

- The prereg's dual-figure discipline (correct-alignment 3,800 vs
  boundary 3,700, never conflated) is what kept GO3 honest: a
  boundary-only bar would have read −100 as a failure, and a
  correct-only bar would have hidden the timing gap. Both figures
  are reported, and the −100 is explained by a prior arm's proof,
  not waved through.
- The per-item exclusion design is the right granularity and the
  test initially got it wrong (see proof bug above). A future prereg
  for an item-level rule should state "unique draw set" explicitly
  rather than "the exclusion draws are X" — wording tightening for
  the next arm, not a re-score here.
- The foodState key limitation is the one metric-shape gap: the
  match key is four fields, not five, because the span log does not
  carry foodState. On this corpus it cannot matter (all seq-124
  items have foodState null, and the exclusion is exact), but a
  future corpus with same-(name, kcalEach, spoilDay) items in
  different foodStates could over-match. That risk is documented in
  the module header, not hidden. Proposed revision for the NEXT
  run: extend the span logger to carry foodState (and granaryDays)
  on drawExit items, then extend the key — a logger change, not a
  rule change.
- Balanced panel (MEASUREMENT.md §15): no before/after game
  comparison exists — this arm changes no lever and no game code.
  The before/after is old sum vs deduped sum on identical inputs,
  judged by the prereg thresholds above. Not forced, not faked.

## Reachability + wall numbers (reused corpus, no new band)

No new band was run (9954 replay + synthetic payloads only): wall
numbers are the raidcallers numbers, not re-judged — pilot
national-or-better 6/8, confirm 9/12, table 0/20, wins 0/20. Seed
9954 itself: wave 4, national rank, survived 100 days.

## Village assessment (plain words)

One village, 100 days, still standing at national rank — and its
books now balance to the unit under a counting rule anyone can
re-run, not just an argument in a report. The story is the same
night the last two arms found, now with the double tally actually
removed by a rule instead of pointed at: the player works the
garden beds with green-whisper magic, the work runs long enough
that night falls mid-task, the village eats its evening meal and
a commons raid takes its cut, and then the magic finishes. Two
counters watched that night. The meal counter wrote down what was
eaten. The garden-magic counter looked at the pantry before and
after and wrote down the same food a second time. The new rule
says, in general and not just for this one night: whenever a
magic or action swallows a night inside it, the meals eaten during
that night count once, under the meals — never again under the
magic's own tally. Every other tally in the hundred days was
already right; the rule changes exactly one record's sum, from
3,800 generic kcal counted to zero, and leaves the record itself
in the books, flagged, so anyone auditing later can see what was
taken out and why. What knowledge/capabilities were missing: none
in the village — the gap was in the counting instruments, and it
is now a landed rule rather than a draft. Blanks filled: (1) the
span-keyed, item-matched, record-retaining de-duplication rule,
implemented generally (not a 9954 special case) and proven not to
touch unrelated records; (2) the 9954 generic residual at 0 under
that rule, with the boundary remainder −100 explained as the
already-proven day-100 timing gap; (3) the no-span-data guard, so
a corpus without span evidence can never be silently re-scored by
day labels. Documented, not fixed: existing analyzers still sum
the old way — any future ledger run that does not use this module
will re-create the residual. The module is the fix's home; wiring
it into the standing analyzers is follow-up work, not done here,
so no published figure was silently rewritten.

## Sense-testing

This arm has NO narration surface: it touches only a summing ledger
over already-recorded corpora. No villager transcript or dialogue
sample is claimed as a sense check for this rule, per the prereg.
(The cultnest and perstack arms already reported that say lines
around days 34–36 do not name cultivate or the double-count — a
recorder-scope gap — and that reporting is not reused here as a
substitute sense check.)

## Notes (out-of-scope gaps, recorded here only)

- [open] 2026-10-27 — ledger — standing analyzers still sum the old
  way: `analyze-raidcallers-b.js` / `analyze-stockdoors-b.js` /
  `analyze-raiddor-ledger-b.js` do not apply span de-duplication.
  Until one of them imports `dedupspan-ledger-b.js`, a fresh ledger
  run re-creates the +3,800-class residual. Wiring is follow-up
  work; this arm deliberately left published figures untouched.
  (sim-dedupspan-b)
- [open] 2026-10-27 — ledger — span logger foodState gap: nest
  drawExit items lack foodState/granaryDays, so the match key is
  four fields, not five. Extend the span logger, then the key.
  (sim-dedupspan-b; see metric review)
- [open] 2026-10-27 — ledger — span-draw class beyond cultivate:
  the rule is scoped by span, not by ability, so any useAbility span
  swallowing an endDay is covered — but only corpora WITH a span
  log can use it. Sweeps that do not install the span logger cannot
  be deduped after the fact. (sim-dedupspan-b)

## Convergence line

landed — the ability-span de-duplication rule is implemented
generally in `scripts/dedupspan-ledger-b.js` (span-keyed,
item-matched, record-retaining, fail-closed without span data) and
proven on the 9954 corpus: seq 124 excluded generic 3,800, summed
generic 0, retained and flagged; no other record changed; deduped
correct-alignment generic residual 0 (boundary −100 = proven
day-100 timing gap); 33/33 proof checks, verdict GO.

## Verdict (judged against the pre-registered bar, not re-scored): GO

GO1–GO5 all met on the 9954 corpus with the general rule: generic
residual 0, seq 124 at 0 summed generic kcal, no other record
changed, no-span-data guard clean, synthetic generality green.
