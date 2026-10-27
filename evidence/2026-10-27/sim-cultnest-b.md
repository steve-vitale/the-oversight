# sim-cultnest-b — nesting proof for the 9954 cultivate duplication

Run: oversight-flesh-out-loop-b, arm sim-cultnest-b. DIAG/measurement
ONLY: ZERO src/js changes, no default flips, no game-code lever, no
analyzer/ledger code change (the de-duplication rule below is
DOCUMENTED, not landed — landing it is a follow-up arm, by design).
This arm does NOT re-judge the 9954perstack GO, the 9954trace
PARTIAL, or any standing verdict — their verdicts stand in their
own evidence. Its verdict is ONLY the nesting question, judged
ONLY against evidence/2026-10-27/sim-cultnest-b-prereg.md
(committed as f486b43b43 BEFORE any replay in this arm).

## Verdict against the pre-registered GO: NESTED

Both meal pantryDraw calls execute INSIDE the cultivate
useAbility span that creates the direct record — in the
replay's single monotonic event order, not by day labels:
span entry evt 241 (day 35) -> draw 466 entry evt 242 ->
draw 466 exit evt 243 -> draw 474 entry evt 244 -> draw 474
exit evt 245 -> span exit evt 246 (day 36, directRecords
123 -> 124). The day-35 vs day-36 puzzle is settled as
hypothesis H1 from the prereg: the span CROSSES a day
boundary. The direct record's day-36 date is a post-span
read, not the span's date.

## The question (verbatim from the prereg)

Do the meal pantryDraw calls seq 466 + 474 (both dated day 35
in the perstack replay) execute INSIDE the useAbility span
whose snapshot-diff produces the cultivate direct record
seq 124 (dated day 36)? "Inside the span" means the
pantryDraw call's entry event falls strictly between the
cultivate span's entry event and its exit event, for the
SAME span — the span whose exit creates direct record
seq 124 (directRecords length 123 -> 124 across its exit).

## Step 0 — fidelity gate: PASS (faithful replay reproduces both corpora)

Seed 9954 re-run ONLY (no new seeds spent) as a FAITHFUL
sweep replication: scripts/sweep-9954cultnest-b.js, vendored
from scripts/sweep-9954perstack-b.js with NO capture changes
except ONE added read-only span logger (useAbility span
entry/exit + pantryDraw entry/exit on one shared monotonic
evt counter, installed OUTSIDE the stockdoors useAbility
wrapper and OUTSIDE the mealdraw pantryDraw wrapper, so span
entry precedes the stockdoors pre-snapshot and span exit
follows its record push). Same policy (belongseek-nofeast),
same env gates, same death suppression (copied verbatim,
still not delegating to oDie). Replay output:
evidence/2026-10-27/sim-9954cultnest-b-replay/
(9954cultnest-b-belongseek-nofeast-s9954.json, 464
nestEvents).

Comparison (proof asserts each field): EVERY shared field
matches the committed perstack replay on every field except
`ms` and the new nestEvents field, and matches the committed
raidcallers corpus on every shared field except `ms`,
nestEvents, and the perstack-only fields — with one
test-bug correction disclosed here, in the same class as the
prior arms' corrections: the proof first compared raidRecords
literally and failed, because stackTop embeds the absolute
worktree path (sim-9954perstack-b vs sim-cultnest-b) and
the 300-char truncation window shifts with it. The fix is
the 9954trace arm's normalization, applied here to both
comparisons: strip the worktree segment from stackTop,
compare on the common length; every non-stackTop raid field
deep-equals. A second proof bug, also disclosed: the
meal-474 key expectation joined items with '|' where the
key function joins with ';' (single-item meal 466 passed
and hid it). Both were proof bugs, not replay bugs: the
replay payloads were unchanged, and the corrected proof
passes 97/97. The added logger consumed no RNG and shifted
nothing: headline (daysAlive 100, survived, national, wave 4,
deaths 7), all counters, and every list (spoilDays 100,
mealDrawRecords 1125, inflows 196, stockdoorRecords 705,
directRecords 262, raidRecords 16, driedEvents 121, sweeps
100) deep-equal. The fidelity gate is what proves it, not
the claim.

## Step 1 — reproduction: PASS (identities exact)

From the NEW replay payload (proof re-derives, not via the
analyzer): direct record seq 124 exists exactly once
run-wide, path green_whisper.cultivate, day 36, villager
player, totalKcal 3,820, items exactly the perstack items
(Foraged food 200 kcal spoilDay 34, 12u/2,400; Fish catch
20 kcal spoilDay 36, 1u/20; Foraged food 200 kcal spoilDay
36, 7u/1,400). Meal pantryDraw seq 466: day 35, context
player, want 2,200, taken 2,200, Foraged food spoilDay 34
11u/2,200. Meal pantryDraw seq 474: day 35, context other,
want 1,468, taken 1,620, items exactly the remaining
cultivate items (spoilDay 34 1u/200 + Fish spoilDay 36 1u/20
+ spoilDay 36 7u/1,400).

## Step 2 — code read (independent leg, agrees with the replay)

File:line citations (no line is quoted from memory; all
were read in this arm):

- Stockdoors useAbility wrapper
  (scripts/stockdoors-capture-raidcallers.js:217 wraps
  useAbility; :163-183 wrapMethod): pre-snapshot at :171,
  delegate at :173, post-snapshot + diffDecreases +
  recordDecrease at :180-183. recordDecrease (:145-148)
  reads dayOf() AT RECORD TIME, after the delegate
  returns. Prediction: if scholar.day advances anywhere
  inside the delegate, the record is dated with the NEW
  day while its decrease happened on the OLD day. That
  is exactly the day-35/36 pattern, and it is a property
  of the instrument, not of the game.
- useAbility (src/js/abilityActions.js:209): single entry
  point — precheck, payActionCost, dispatch to impl.
  Cultivate impl registration
  (src/js/gardenCultivation.js:221-228): the impl sets
  paidPlayerDispatch and re-enters cultivateGarden, so
  the player path is ONE useAbility span, not two —
  confirmed by the log (all 12 cultivate spans depth 0).
- cultivateGarden player path
  (src/js/gardenCultivation.js:192-196): calls
  useAbility(plan.source, 'cultivate'); the paid re-entry
  (:213-216) does the garden work, then
  `this.tickAction(16); this.save();` — tickAction is the
  span's ONLY clock-advancing step.
- tickAction (src/js/game.js:19173-19229): batch turns,
  day-part advances, and — when the day budget is spent
  (s.dayTicks >= TICKS_PER_DAY) — `this.endDay()` at
  :19229. endDay (src/js/game.js:31135) calls
  villageMeal() at :31369 and commonsTick() at :31419.
  villageMeal (src/js/game.js:28373) draws the player's
  meal via pantryDraw; commonsTick (src/js/game.js:21222)
  escalates commons strain into raids, and the raid
  pillage path (src/js/havenGrowth.js:866, raidPillage)
  draws via pantryDraw.
- The replay's caller stacks match this chain exactly:
  draw 466's stack runs villageMeal <- endDay; draw 474's
  runs commonsRaid <- commonsTick <- endDay. No code-read
  vs replay disagreement: the code read predicted H1 was
  mechanically possible and named the path; the replay
  proves it executed. (Precision note, stated honestly:
  the logger wrapped useAbility and pantryDraw, not
  tickAction/endDay, so the tickAction -> endDay link is
  code-read plus caller-stack evidence, while the nesting
  itself — draws between span entry and exit — is logged
  proof. The distinction matters and is kept.)

## Step 3 — nesting judgment (evt order, the whole table)

The seq-124 span, with everything inside it and nothing else:

| evt | event | day | note |
| --- | ----- | --- | ---- |
| 241 | spanEnter green_whisper.cultivate, depth 0, directBefore 123 | 35 | span opens |
| 242 | drawEnter, want 2,200 | 35 | meal 466, stack villageMeal <- endDay |
| 243 | drawExit, taken 2,200, spoilDay-34 11u | 35 | meal 466 complete |
| 244 | drawEnter, want 1,468 | 35 | meal 474, stack commonsRaid <- commonsTick <- endDay |
| 245 | drawExit, taken 1,620, spoilDay-34 1u + Fish-36 1u + spoilDay-36 7u | 35 | meal 474 complete |
| 246 | spanExit green_whisper.cultivate, directBefore 123 -> directAfter 124, result true | 36 | record seq 124 created HERE, dated day 36 |

Nothing else happens inside the span: the four draw events
are the ONLY events with evt strictly between 241 and 246.
Both draws match uniquely (one nestEvents match each, by
exact day/want/taken/items). The span enters on day 35 and
exits on day 36: the day advanced inside the span, between
the last draw (evt 245, day 35) and the span exit (evt 246,
day 36) — endDay rolled the day after the meals and the
raid, before the stockdoors wrapper read the day for the
record. H1 confirmed; H2 (two separate removals) is dead:
there is no second removal, and no replenishment is needed
or present.

Controls that sharpen the verdict (from the same log):
- The other 11 cultivate spans in the run create NO direct
  record (directBefore == directAfter on every one: days 8,
  23, 24, 25, 26, 27, 28, 31, 33, 36, 37). Only the span that
  swallows an endDay creates a diff. The diff instrument
  records whatever pantry decreases happen inside the span,
  whatever their cause.
- The very next villageMeal draw (evt 249-250, day 36,
  want 2,200, taken 2,297) falls OUTSIDE any cultivate span
  (after span exit evt 248) and creates no direct record.
  Normal endDay meals outside a span are counted once, as
  they should be. The double-count needs the span.

## Fix-target settlement (documentation ONLY — no code changed)

- Phantom count: the directRecords useAbility diff (record
  seq 124). The meal draws are real: pantryDraw's own
  returned draw lists, executed by villageMeal and by the
  commons raid inside endDay, removing real units from real
  stacks. The perstack direction argument is now PROVED,
  not merely argued: the draws are inside the span, the
  diff is the inferred attribution around a call whose own
  purpose (garden growth, 200 kcal/bed from the scholar's
  kcal) draws nothing like 3,820 from the pantry.
- Instrument that must de-duplicate: the LEDGER that sums
  directRecords + mealDrawRecords (analyzer/ledger code),
  with the exclusion implemented against directRecords —
  NOT by changing what pantryDraw records, and NOT by
  changing what the useAbility wrapper records (its raw
  diff is still true as a span measurement: the pantry DID
  get lighter by 3,820 across that span). Deleting the
  direct record would destroy a true span measurement;
  deleting the meal draws would destroy the true causal
  records. The ledger must count the kcal once.
- Draft de-duplication rule (for the follow-up arm to land,
  not landed here):
  1. Scope: EVERY useAbility span, not just cultivate —
     any ability whose impl advances the clock across a
     day boundary (tickAction, sleep, travel) can swallow
     an endDay and inherit its meals, raids, and takes.
     Scope by span, never by ability name: a draw is
     span-internal iff its draw entry falls between a
     useAbility span's entry and exit in monotonic event
     order (the nestEvents evt discipline), not by day
     label and not by ability key.
  2. Rule: for each pantryDraw call whose entry falls
     inside a useAbility span, the ledger counts its kcal
     ONCE, under the meal-draw record (kind pantryDraw /
     drawSpoiled, with its own items). Any directRecord
     whose span contains that draw EXCLUDES the draw's
     items (matched key-for-key: name, kcalEach, units,
     spoilDay, foodState) from its summed kcal; if the
     exclusion empties the direct record's generic items,
     the record contributes 0 to summed draws but is
     RETAINED in the corpus, flagged span-duplicate, with
     its span identity (ability.action, span entry/exit)
     preserved for audit.
  3. Remainder handling: a directRecord's items that match
     NO span-internal draw stay counted (they are the
     ability's own pantry effect, e.g. a Light Fingers
     lift). A draw that matches no span stays counted
     under itself. No silent drops: every exclusion is
     item-matched, never amount-matched (3,820 != a
     200-multiple was the tell that the diff was inferred,
     and amount-matching would re-create that error class).
  4. Verification bar for the follow-up arm: re-run the
     family ledger on the SAME 9954 corpus with the rule
     applied and show the generic residual at 0 (correct
     alignment) / the analyzer figure reconciled, with the
     seq-124 record flagged and contributing 0 to summed
     generic draws, and no other record's summed kcal
     changed. Until that re-run lands, this rule is a
     draft, not a fix.
- What this arm deliberately does NOT do: change
  analyzer/ledger code, change the stockdoors wrapper, or
  change game code. A rule landed on an unproven target
  would re-create the error; the target is now proven,
  and the landing belongs to the follow-up arm with its
  own prereg.

## Proof (scripts/test-9954cultnest-b.js)

97/97 checks PASS, exit 0, verdict NESTED printed. The
proof asserts: fidelity (vs perstack replay + vs
raidcallers corpus, with the stackTop normalization);
reproduction (direct 124 unique with exact items; meal
466/474 exact); unique nestEvents correlation for both
draws and the seq-124 span; the evt-order nesting
judgment against the prereg thresholds. Proof command
(from the worktree root): `node scripts/test-9954cultnest-b.js`
(exit 0). Analysis command:
`node scripts/nest-9954cultnest-b.js` (exit 0; prints the
span/draw evt table). Sweep command:
`COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
POLICY=belongseek SEEDS=9954 DAYS=100 node
scripts/sweep-9954cultnest-b.js` (2s compute, written
clean). No jest (proofs are node, not jest). No
[needs-eyes]: this lands a measurement, not a
player-visible change. No game-code change: zero src/js
files touched; files in this arm: prereg, evidence,
replay corpus (1 file), sweep-9954cultnest-b.js,
nest-9954cultnest-b.js, test-9954cultnest-b.js.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered GO thresholds did their job: NESTED
  required BOTH draws inside the SAME span with the
  directBefore/directAfter 123 -> 124 match — not "near"
  the span, not one draw in — and the log meets it with
  no slack (both draws strictly inside, nothing else
  inside). A split result would have been INCONCLUSIVE
  by rule, not rounded up; no split occurred.
- The prereg's evt-order rule (not day labels) is what
  settled this: by day labels alone the answer looks
  impossible (draws day 35, record day 36, different days
  = different events). The record's day is when it was
  WRITTEN (post-span read), not when its decrease
  happened — the same write-time-vs-event-time lesson
  as the 9954trace arm's snapshot-vs-flow dating, now
  shown inside a single ability call. Any future ledger
  that attributes by day label will manufacture exactly
  this class of phantom.
- The perstack direction argument is upgraded from
  evidence to proof (see fix-target settlement). If a
  future arm had found NOT-NESTED, that argument would
  have been reported wrong, loudly; it was not.
- The stockdoors wrapper's header disjointness claim ("a
  kcal is never recorded by both instruments") is now
  PROVEN false in its useAbility case, with the mechanism
  named: the claim holds for the wrapper's inline-decrement
  paths (NPC eats, raids, lifts — none call pantryDraw),
  but useAbility is a SPAN wrapper, not a method wrapper,
  and a span inherits every pantryDraw executed inside
  it, including endDay's meals and raids. The claim must
  be narrowed to non-span paths, or the wrapper must
  gain span-draw exclusion — that wording fix belongs to
  the follow-up arm's prereg, not to a silent edit here.
- Balanced panel (MEASUREMENT.md §15): NO comparison
  exists — this arm changes no lever and no game code, so
  there is no before/after to panel. The fidelity gate
  (replay vs corpora) is the instrument before/after. Not
  forced, not faked.

## Reachability + wall numbers (reused corpus, no new band)

No new band was run (seed 9954 replay only): wall numbers
are the raidcallers numbers, not re-judged — pilot
national-or-better 6/8, confirm 9/12, table 0/20, wins 0/20.
Seed 9954 itself: wave 4, national rank, survived 100 days.

## Village assessment (plain words)

One village, 100 days, still standing at national rank —
and its books now balance to the unit, with the reason
named. Picture the stretch in question, days 35 to 36: the
player works the garden beds with green-whisper magic,
coaxing them forward. That work takes time — enough time
that the day itself runs out mid-task. Night falls while
the magic is still, so to speak, in the player's hands:
the village eats its evening meal (the player's share,
2,200 kcal of foraged food), and out on the shared ground
a commons raid takes its cut (1,620 kcal more, including
one fish). Then the day rolls over, and the garden magic
finishes. Two different counters watched that night. The
meal counter wrote down what was eaten, correctly. The
garden-magic counter looked at the pantry before the magic
and after it, saw 3,820 kcal gone, and wrote that down too
— correctly, as far as "the pantry got lighter during the
magic" goes. The mistake was adding both counters together
as if they were two different nights of eating. They were
one night, counted twice. The village never lost 3,820
kcal twice; it ate once, and the books double-tallied it.
Take the second tally away and every stack lands exactly
where the records say it should, from day 1 to day 100.
What knowledge/capabilities were missing: none in the
village — the gap was in the counting instruments, and it
is a general one, not a garden one: ANY magic or action
that runs long enough for night to fall inside it will
inherit that night's meals and raids in its own tally.
Blanks filled: (1) the nesting question is SETTLED —
NESTED, evt 241 -> 246, H1 day-boundary crossing, with the
full call chain (cultivate -> tickAction -> endDay ->
villageMeal + commonsRaid); (2) the fix target is SETTLED
— the summing ledger must exclude span-internal draws
from directRecord sums, under the drafted rule; (3) the
day-label attribution trap is documented with a worked
example (record dated day 36 for a day-35 decrease).
Documented, not fixed: no counting code was changed in
this arm — the fix belongs to the follow-up arm, which
now has a proven target and a verification bar.

## Notes (out-of-scope gaps, appended here only — goal hidden_files NOT edited by this arm)

- [open] 2026-10-27 — ledger — span-draw double-count
  class beyond cultivate: any useAbility span that
  swallows an endDay inherits that endDay's pantryDraws
  in its diff (evidence: this arm's 11 no-record cultivate
  spans vs the one endDay-swallowing span). The drafted
  rule scopes by span, not by ability, for this reason.
  (sim-cultnest-b; follow-up arm owns the landing.)
- [open] 2026-10-27 — pantryDraw over-draw observation
  (NOT judged a bug): meal draw seq 474 wants 1,468 but
  takes 1,620 — taken exceeds want. Best-fit whole-piece
  drawing plausibly explains it (smallest pieces that
  cover the want overshoot), but no arm has asserted that
  mechanism for this draw. Needs a caller-level check
  before anyone calls it a bug or a feature.
  (sim-cultnest-b replay, evt 244-245.)
- [open] 2026-10-27 — recorder-scope gap (carried from
  perstack): the say recorders cover smoke-rack and
  treeline lines only, so no transcript line names
  cultivate or the double-count. The mechanism is a
  ledger phenomenon, invisible to the game's speech;
  sense here is reported, not judged, and never
  substitutes for the evt-order arithmetic above.

## Next arm (fix, not re-trace)

- 9954 row: CLOSED (perstack GO, stands). Nesting:
  SETTLED (this arm, NESTED). Do NOT re-trace 9954, do NOT
  re-open day-100 timing, feast previews, alien raids,
  stockdoor carry, cooking bonus, or the nesting question
  — all settled with numbers.
- Next arm, in order: (1) land the drafted
  de-duplication rule in the summing ledger/analyzer
  under its own prereg (span-scoped, item-matched,
  record-retaining, flagged exclusions); (2) re-run the
  family ledger on the SAME 9954 corpus and show the
  generic residual at 0 with seq 124 flagged at 0 summed
  generic kcal and no other record changed; (3) only then
  is the fix landed — this arm changes no counting code,
  by design (DIAG only).

## Convergence line

nested — the 9954 cultivate duplication is a span
double-count, proven in evt order: cultivate useAbility
span evt 241 (day 35) -> villageMeal draw evt 242-243
(meal 466) + commonsRaid draw evt 244-245 (meal 474) ->
span exit evt 246 (day 36, directRecords 123 -> 124,
record seq 124). The span crosses the day boundary via
tickAction -> endDay; the record's day-36 date is a
post-span read. Fix target: the summing ledger must
exclude span-internal draws from directRecord sums, per
the drafted item-matched, record-retaining rule. The
9954 row stays closed; only the fix target was in
question, and it is now settled.

## Verdict (judged against the pre-registered bar, not re-scored): NESTED

Both meal draws (seq 466 evt 242-243, seq 474 evt 244-245)
fall strictly inside the seq-124 cultivate span (evt 241
-> 246, directBefore 123 -> directAfter 124), fidelity and
reproduction both PASS (97/97 proof checks), and the
day-35/day-36 labels are explained by the span crossing
the day boundary (H1).
