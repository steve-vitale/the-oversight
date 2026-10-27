# Journey social r61 — PRE-REGISTER (lane B, 2026-10-27)

Written before any r61 seed ran. Leg 5 (social life), cycle r61.
Rotation-b read 5 at run start. This run ADVANCES rotation-b to 6
at closeout if it lands: leg 5's named-next question from r60's
metric review is the dry-family census, which this run carries.
No src/js change is planned for this run (see "Why no fix" below)
— this is the measurement run r60 called for, and its census is
the baseline the fix run scores against.

## Why no fix in this run (decision, documented for overrule)

r60's metric review named a fix run next. But a sibling lane
(gap-social, oversight-gap-closure) is ALREADY working exactly
this system: its registered purpose is "gap closure B7+B15:
dry-fallback frequency + gift lines", and its branch carries
"Triage B7 dry-fallback frequency: exempt conversation grammar
from the run ledger" (980c5aa17, not on master). Landing a
second, competing conversation.js dry fix from Lane B would
collide at merge and duplicate owned work. Lane B therefore does
NOT touch src/js/conversation.js this run. Instead this run
delivers what r60 said the fix run needs and does not yet have:
a full 12-line dry-family census (r60 counted only the train
line; its ~2.5x dry burden was a selected-sample estimate, not
a census) plus a mechanism split the fixing lane can aim at.
The census + this note go to gap-closure via evidence; the fix
itself stays theirs. If their fix lands first, the next Lane B
social run scores it against this census.

## Follows

- r60 (lane B, 2026-10-27, merged b353f3817): train-line census
  pooled 0.891 stalls/convo, 89.1% of conversations with >= 1
  stall, histogram 0-or-1 only; preceding-pick split topic
  68.5% / react 18.6% / other 12.9%; follows question 57.3% /
  other 29.3% / recap 0.2% / close 0 / no-follow 13.2% (stall is
  the conversation's last line). Sample-level dry burden ~2.5x
  the train count (232 sibling dry lines vs 152 train lines in
  160 selected transcripts). Guardrails held: no-offer 9.2%,
  late picks 443 pooled, deep2 93 pooled, villages 7/7/8/8.
- r60 open hypotheses this run tests (measurement only):
  (a) run-ledger-vs-repeated-question: blocks fire on ordinary
  topic asks, not just react/silence filler; (b) wind-down
  silence stalls as a second question.

## Leg questions

- (Q1) CENSUS: across full runs, what is the FULL dry-family
  rate — all 12 deflection lines per conversation, share of
  conversations with >= 1 dry line, per-convo histogram — and
  how does it split between the first-9 (run-ledger dry) pool
  and the last-3 (self-repeat) pool?
- (Q2) MECHANISM: for all dry lines, which pick precedes each
  (topic / react / other), what follows it (question / other /
  recap / close / end-of-conversation), and how often does a
  conversation END on a dry line (last NPC line is deflection)?
  Engine cross-check: per-convo convoGet dryLines /
  selfRepeatLines counters vs the transcript-text census.
- (Q3) GUARDRAILS (report-only, not bars): does r59's fix hold
  on fresh seeds — no-offer rate, late picks, deep2 formation,
  villages alive — in r59/r60's range? The fix is already
  landed; this run guards it, it does not re-test it.

## Arms (fresh seeds 5601-5604, smoke 5605 30d, DAYCAP=140, death-aware)

ALL linger, seeded-speaker steering ON (constant, excluded from
the natural funnel, as r56-r60). No control arm: r60's per-seed
JSONs are the guardrail + train-line comparison, share-level
only (fresh seeds, no turn-identity comparison claimed).
Policy is r60's policy verbatim except the r61 dry-family
instrumentation (driver-only, zero src/js): every transcript
line matching any of the 12 convoDeflectionLines (quote-
normalized) is counted per conversation, with its pool
(first-9 vs last-3), preceding pick, following line, and
whether it is the conversation's last NPC line; per-convo
engine counters (dryLines, selfRepeatLines) are recorded as
a cross-check.

## Bindings (a miss is NO-GO, never re-scored)

- D1 census reported for all 4 seeds: total conversations,
  total dry lines (all 12), dry lines per conversation, share
  of conversations with >= 1 dry line, per-convo histogram,
  pool split (first-9 vs last-3), train-line rate for direct
  comparison to r60's 0.891. A seed with zero instrumented
  conversations fails D1.
- D2 mechanism reported: preceding-pick distribution and
  follow classes pooled across seeds, share of conversations
  ending on a dry line, and the counter cross-check (transcript
  census vs engine counters). A census with no mechanism split
  fails D2.
- G guardrails (report-only): no-offer rate, late picks,
  deep2 pairs, villages alive at horizon — reported, not bars.
- M5 people: 5 sense-reads, 0 fabricated-history flags; at
  least 2 of the 5 must be dry-bearing conversations. Weak
  count is REPORTED, not a pass/fail floor for this measurement
  run (no fix is in it to move the count; the floor returns as
  a bar for the fix run, with this run's count as its baseline).
- NO-REGRESSION: check.js --quick at the standing profile
  (278/9). Any NEW failure vs the standing set fails the run.
- Bars explicitly NOT adopted by this run (they belong to the
  fix run, scored against this census): train stalls/convo
  < 0.5, dry-family rate < any threshold, M5 weak floor.

## Interesting-finding rule (pre-registered)

- Dry-family census >= 2.0/convo => the wart is bigger than
  the train census showed; the fix run's bar must be set on
  the dry-family rate, not the train rate.
- First-9 pool >= 80% of dry lines => the run ledger is the
  dominant source; the fix belongs in ledger/block logic, not
  in line wording.
- Conversations ending on a dry line >= 10% => the ending wart
  (r60's 13.2% for train lines) is a dry-family property, and
  the fix run must pre-register an end-on-dry bar.
- Otherwise: report the census as measured; no bar invented
  after the fact.
