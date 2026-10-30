# sim-chainfinish-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0420Z (coordinator-assigned
worker sim-chainfinish-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). Finding #1462, ranked next by run fleshout-20261030T0320Z.
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default flip,
no deed-bar move, no gate change.

## The blank (from the assignment, not re-judged here)

Arm sim-w4shape-a (evidence/2026-10-29/sim-w4shape-a.md) re-baselined
wave-4 meetings on current master: 13 meetings, 5 beasts, wounds
persisting across re-meetings, 4 meetings dealing zero damage, 0 kills.
Its ranked-next #1 orders this arm: decompose the zero-dealt class per
cause for WILD-shape meetings only, and price the chain — how many
re-meetings finish each beast at observed rates, and whether re-meetings
recur inside a run at all. Raid shape (n=2 last round) and other shape
are reported as counts only, with NO lever judgment from them.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft,
standing >= 100, never pure calendar; bands damage 35-95, HP 850-1500;
a 4-6 round fight for a godhood build). NO CANON-registered doc covers
a zero-dealt taxonomy or a chain-finish price specifically — the
taxonomy below is code-derived from the recorders' own fields and the
verbatim w4dpr fight logs, stated exactly so it can be checked.
Governing canon rules: CANON.md "Monster encounters are fought, not
rolled" and the perception law (Steve 2026-10-28): tile-mate presence
is REPORTED from recorded state only, never fed into any decision.

## Band and substrate (binding)

- Seeds 75101-75108 (8, the shared band), 180d death-aware,
  scripts/policies/tableseat-nowait.js VERBATIM.
- Game substrate env (verbatim from the assignment): LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1.
- Recorder stack (instruments, reused verbatim from the w4shape sweep,
  never edited): fieldparty-form-diag, w4dpr-diag, breakline-diag,
  tilejoin-diag, shoutrec-diag, joinendlines-diag. Five of the six are
  record-only (pure pre-reads, post-copy, no decision reads). The one
  exception, disclosed: TILEJOIN=1 enables the tilejoin prototype feed
  (tile mates only, perception-law compliant — never a roster feed),
  exactly as in the w4shape sweep; it is part of the reused instrument
  stack, NOT a new game change by this arm. The w4shape run proved the
  joinendlines leg neutral by before/after byte-identity modulo logs.
  This arm installs NO new engine wrap. The only new code is
  scripts/sweep-chainfinish-a.js (a copy of the w4shape sweep writing
  to perseed-chainfinish-a), scripts/analyze-chainfinish-a.js (a pure
  analyzer: reads corpus JSON, never touches game state), and
  scripts/test-chainfinish-a.js (fixtures + determinism check).
- RE-DERIVATION CLAUSE (finding #1457 substrate drift, binding): this
  run's OWN corpus IS the baseline. Do NOT quote shoutrec / w4shape
  band numbers as current — not their meeting counts, not their
  zero-dealt counts, not their chain arithmetic. Comparisons to the
  w4shape corpus are drift diagnostics only, never GO/NO-GO legs. If
  this corpus diverges from w4shape's, the divergence is reported,
  not forced.

## Universe and definitions (binding, fixed here)

UNIVERSE: every joined row with fieldparty wave == 4 AND channel ==
'field' (wild shape only), all callers, scholar-led flagged (never
silently pooled or dropped). Raid/other wave-4 rows are counted in a
one-line census and excluded from every judged table.

BEAST-LEVEL ZERO vs LEADER-LEVEL ZERO (binding definitions):
- Beast-zero: the BEAST took 0 damage in the meeting, i.e. breakline/
  w4dpr mDealt == 0 (totalled over leader + ally; the recorders agree
  — a mismatch fails COMPLETENESS). A meeting is beast-zero ONLY on
  this definition.
- Leader-zero: leaderDealt == mDealt - allyDealt == 0. A meeting with
  leaderDealt == 0 AND mDealt > 0 (ally dealt damage, leader did not)
  is LEADER-ZERO-ALLY-POSITIVE: it is NOT beast-zero, it is reported
  in its own separate count, and it never enters the per-cause
  beast-zero table. A meeting with leaderDealt == 0 AND mDealt == 0
  is beast-zero and classified below (its leader-zero status is noted
  inside its class row, not double-counted).

BEAST IDENTITY / CHAIN (binding): a chain is a maximal run of meetings
of the SAME mid on the SAME seed, in day order, in which each meeting's
mHpStart equals the previous meeting's mHpLeft (wound continuity).
A meeting whose mHpStart differs from the previous same-mid meeting's
mHpLeft STARTS A NEW CHAIN (a fresh instance of that type, or a healed
one — the analyzer reports the break, it does not guess which). Zero-
dealt meetings have mHpStart == mHpLeft trivially, so chain assignment
across a zero meeting is by continuity + order and is disclosed as an
assumption wherever it matters. The first meeting of a chain reports
its mHpStart as the chain's opening HP. A chain is "finished" only if
a meeting ends with mHpLeft == 0 (a kill); no chain is called finished
by extrapolation.

PER-CAUSE BEAST-ZERO TAXONOMY (binding, priority order — first match
wins, exactly one class per beast-zero wild meeting):
1. PRE-CONTACT-SCATTER: rounds < 1 AND outcome mFlee (beast leaves
   before any blow).
2. PRE-CONTACT-FLEE: rounds < 1 AND outcome vFlee (fighter flees
   before any blow).
3. PRE-CONTACT-DEATH: rounds < 1 AND outcome vDie.
4. NARRATION-SUPPRESSED: rounds >= 1 AND the verbatim log contains
   'contradicts the narration' (the eulogy signature consuming the
   fighter's turns; equivalently breakline trickLog contains
   'contradict'). This class outranks weapon classes: a meeting can
   be both narration-suppressed AND arrowless, and it lands here.
5. NO-USABLE-WEAPON: rounds >= 1 AND loadoutPost melee == null AND
   loadoutPost ranged != null AND the verbatim log contains 'no
   arrows' (a ranged-only fighter whose only weapon cannot fire, with
   no melee fallback). Armed == false or carriedWeapons empty also
   lands here (unarmed fighter).
6. TURN-CONSUMED-OTHER: rounds >= 1 AND the verbatim log contains NO
   'strikes for' line AND none of classes 1-5 applies (turns spent on
   ability activation, field medicine, or death before acting — the
   analyzer quotes the consuming lines per meeting).
7. STRIKE-WITHOUT-DAMAGE: rounds >= 1 AND the verbatim log DOES
   contain a 'strikes for' line AND mDealt == 0 (strikes recorded but
   no damage totalled — a recorder/mechanic contradiction if ever
   seen; expected 0, reported as a finding if > 0).
8. OTHER: anything else. OTHER > 0 fails COMPLETENESS — the taxonomy
   must assign every beast-zero wild meeting, or say why it cannot.

DAMAGE-PER-MEETING: per chain, the list of mDealt values in day order
(including zeros — zeros are meetings, not missing data). MEDIAN RATE
= the statistical median of that list (even n: mean of the two middle
values, disclosed). BEST RATE = the maximum per-meeting mDealt in the
chain. MEETINGS-TO-FINISH at a rate r = ceil(remaining HP / r), where
remaining HP = the chain's last meeting's mHpLeft; reported at the
median rate AND at the best rate. Chains with n >= 2 meetings get a
price; single-meeting chains report remaining HP and their one rate
but no median price (a median of one meeting is not a rate claim).
MEETINGS-TO-FINISH is a price, not a prediction — it prices how far
the current meeting shape is from a finish.

RE-MEETING INTERVALS: for each chain with n >= 2, the day gaps between
consecutive meetings of that chain. Reported as the list per chain and
as a band range + median. The chain-recurrence question is judged on
whether gaps fit inside a run's remaining horizon (chain meetings
spanning <= the seed's survival window vs a price demanding more
meetings than any run contains).

## Primary metrics (binding)

- COMPLETENESS (blocks DIAG-GO): 8/8 valid seeds (days > 0) AND every
  recorder (fieldparty, w4dpr, breakline, shoutrec, tilejoin,
  joinendlines) errs 0 with overflow empty AND joins 100% (all six
  recorders index-aligned per seed; mid/vid/day match at every index;
  join errors 0) AND mDealt agreement across breakline/w4dpr/shoutrec
  at every wild wave-4 row AND every beast-zero wild meeting assigned
  exactly one taxonomy class AND OTHER = 0.
- DETERMINISM GATE (blocks DIAG-GO): one seed re-run into a scratch
  EVID dir; its row JSON byte-identical to the corpus row. Scratch
  dir removed after the diff.
- SENSE BAR (blocks DIAG-GO): ALL wild wave-4 meeting transcripts read
  end to end (w4dpr verbatim logs) when the wild wave-4 count is <= 40;
  if the band yields > 40 wild wave-4 meetings, a stratified sample
  instead: ALL beast-zero wild logs + ALL leader-zero-ally-positive
  wild logs + 3 logs per outcome class present (fought classes only;
  pre-contact meetings have no fight log and never count toward the
  bar). The read set must include at least one transcript of each
  outcome class present in-band when that class has a log. Judgment
  is meaning/coherence/consequences, not counts (SENSE-TESTING LAW).
- FIXTURE BAR (blocks judging): scripts/test-chainfinish-a.js must
  prove, before the corpus is judged, on synthetic rows: every
  taxonomy class above (including priority order — narration beats
  weapon, pre-contact beats all), the beast-vs-leader zero split
  (ally-positive is NOT beast-zero), chain splitting on an HP break,
  meetings-to-finish arithmetic at median and best rates (including
  the ceil and the n>=2 price rule), and re-meeting interval
  computation.
- CHAIN-PRICE BAR (reported, not a GO leg on its own): a chain price
  is computed for every chain with n >= 2 meetings. If NO chain has
  n >= 2, the arm reports INSUFFICIENT-DATA for chain pricing (the
  completeness/determinism/sense/fixture legs still judge DIAG-GO).

## Verdict rule

- DIAG-GO iff COMPLETENESS PASS + DETERMINISM PASS + SENSE PASS +
  FIXTURE PASS + a RANKED NEXT named with numbers.
- A completeness/determinism/sense/fixture failure is DIAG-NO-GO.
- INSUFFICIENT-DATA (reported, never silently widened): if the band
  yields ZERO wild wave-4 meetings, the arm reports INSUFFICIENT-DATA
  with the counts and states the widen-or-close choice for the
  coordinator — seeds are NOT widened silently mid-run. Below-minimum
  n on raid/other shape is INSUFFICIENT-DATA for that shape, never GO.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (sweep + analyzer + fixtures), committed before the
   judged sweep is analyzed (fixture bar green first).
3. Sweep (8 seeds), determinism gate (one seed, scratch dir, removed
   after diff), sense transcripts read end to end per the bar above.
4. Evidence evidence/2026-10-29/sim-chainfinish-a.md with
   header-vs-result, per-cause beast-zero table, per-beast chain
   table (meeting count, damage-per-meeting distribution, HP at each
   meeting, wound persistence/heal verdict, remaining HP at horizon
   end, meetings-to-finish at median and best rates), re-meeting
   intervals, sense notes, wall numbers (report-only, same
   upper-middle median convention as the 0320Z round), ranked next,
   and findings-backlog items found (reported to the coordinator, NOT
   appended to sim-findings.md by this worker).
5. No src/js change, no push, no bump, no live verification. Report
   'ready for coordinator merge, pending ship' (coordinator merges).

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js). Seed
Math.random BEFORE eval (modules capture it at load). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-chainfinish-a (no jest is run by
this arm — the sweep/analyzer are plain node scripts).
