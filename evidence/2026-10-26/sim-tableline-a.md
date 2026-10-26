# sim-tableline-a — canned fireside table line: census, not a fix (axis scale-onramp, dialogue-variety measurement)

Run: fleshout-20261026T1816Z, arm sim-tableline-a. DIAGNOSTIC ONLY — zero
src/js changes and ZERO dialogue-string changes. Narration variety still
awaits Steve's ruling (tracker 1715Z next blanks item 4), so this arm
measures the blank and specifies a future fix; it does not implement one.

Canon read first: docs/CANON.md, then docs/CONVERSATIONS.md (dialogue) and
docs/TABLE.md (the seat). There is NO canon doc covering fireside
table-talk variety specifically: CONVERSATIONS.md's "No repeats, ever"
rule governs conversation-UI threads via `convoPick` (said lines tracked
by text per villager); the fireside beat measured here is a separate
system (`havenGrowth.js tableWaitTalk`, a `say()` narration beat, not a
conversation thread), and its pool is read from code, not invented.

## PRE-REGISTRATION (binding — judged only against this; written BEFORE any sweep)

- Base: this worktree's tip at arm start (see "Base" below). The 1715Z
  band (tablenat) is the comparison of record; engine delta vs 1715Z is
  reported, not assumed.
- Instrument VERBATIM substrate, same as the 1715Z band: scripts
  (new in this arm) sim-tableline-a-sweep.js + sim-tableline-a-analyze.js,
  tableseat-nowait policy (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, seat legs
  only), 180d DEATH-AWARE horizon (villages stop at death; never a fixed
  200d — the horizon matches the 1715Z band so the canned-line
  reproduction is on identical ground, and a dead village's silence is
  data, not a missing row). Corpus under
  evidence/2026-10-26/perseed-sim-tableline-a/ — NEVER overwriting
  perseed-sim-tablenat-a/ or any other run's corpus.
- Seeds 73671–73678. Policy tableseat-nowait (same as 1715Z).
- Primary metric: census coverage + template counts.
- GO iff the census covers 8/8 seeds with a complete
  template-by-speaker-by-situation table AND a sense verdict for every
  situation class that occurs. If any seed's table-talk cannot be
  harvested by the instrument, report it as a COVERAGE MISS, not a zero.
- Reproduction leg (reported, not a second gate): seed 73672's canned
  line (the tablenat sentence, template T0 below) must appear in this
  arm's corpus. If it does not, the verdict is "unreproduced on current
  base" — report the re-baselined census, do not force the old line.
- Band-row corroboration (reported, not gated): per-seed
  days/endReason/won/maxRank/finalRank/table/entered compared against
  the tablenat corpus; any diff investigated in the open, never hidden.
- METRIC BINDING (§14): no mid-run re-scoring against a friendlier
  metric. Metric doubts go under "metric review" for the NEXT run.
- BALANCED PANEL (§15): attempted as in prior arms; if
  scripts/balance-panel.js has no corpus-ingest mode, say so explicitly
  and attach the paired identical-seed tables as the comparison of
  record — never fake a panel file.

## VERDICT: GO — census complete 8/8, reproduction exact, and the 1715Z "one canned line" reading is corrected, not confirmed

The tablenat sentence reproduces EXACTLY (same 6 fires, same speakers,
same days on 73672) — and it is not the whole story. The tablenat arm's
filter (`ring of pale light` etc.) could only ever pass ONE of the six
`tableWaitTalk` pool lines, so its transcript showed one line repeated
and hid the other five. Harvested unfiltered, 73672's waiting village
speaks 18 table-talk lines across ALL SIX templates. The real blank is
narrower and more precise than "one canned line": the pool varies, but
no line ever tracks the village's situation — the same T0 sentence
fires unchanged before and after the formal announce, before and after
the reactor pellet, before and after the System's nation prod, in early,
mid, and late waiting, at pantry 17,783 and pantry 2,510 alike. The
picker is situation-blind by construction (a hash of day + scholar id),
so variation is dice, not response. That is the specified future fix,
not a fix made here (DIAG scope, narration variety awaits Steve's
ruling).

## BASE

- Arm base: 9c9ac3e4f — "sim-scale-onramp-round-1715: coordinator
  evidence, tablenat + r52split GO, merged locally pending ship"
  (worktree tip at arm start; branch sim-tableline-a).
- Engine delta 7231f9272 (tablenat base) .. HEAD: ONE line in
  src/js/build.js (the batch-ship version bump) — zero game-code
  change, zero policy change. Prediction: the band reproduces the
  tablenat table exactly. Result: CONFIRMED — 8/8 seeds identical on
  all 7 compared fields (days, endReason, won, maxRank, finalRank,
  table, entered) after boolean/0-1 normalization; zero substantive
  diffs (the first summary run flagged only false↔0 / true↔1 type
  representations, and the comparator was fixed to normalize before
  comparing — the committed summary.json shows diffs: [] on all 8).

## BAND (base 9c9ac3e4f, tableseat-nowait, 180d death-aware, n = 8)

Corpus: evidence/2026-10-26/perseed-sim-tableline-a/ (8 rows +
summary.json + analysis.json, CORPUS PASS, ANALYSIS PASS).

| seed | days | end | won | fin | mx | tab | ent | firstWait | waitDays | fireside | tableTalk |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | survived | 0 | national | national | 0 | 0 | — | 0 | 9 | 0 |
| 73672 | 180 | survived | 0 | regional | regional | 1 | 0 | 62 | 119 | 29 | 18 |
| 73673 | 117 | village-lost | 0 | regional | national | 0 | 0 | — | 0 | 9 | 0 |
| 73674 | 166 | village-lost | 0 | global | global | 0 | 0 | — | 0 | 7 | 0 |
| 73675 | 180 | survived | 0 | global | global | 0 | 0 | — | 0 | 3 | 0 |
| 73676 | 144 | over-other | 1 | national | national | 1 | 1 | 144 | 1 | 6 | 0 |
| 73677 | 140 | over-other | 1 | national | national | 1 | 1 | 140 | 1 | 7 | 0 |
| 73678 | 104 | village-lost | 0 | regional | regional | 0 | 0 | — | 0 | 21 | 0 |

Band: wins 2/8, national-ever 6/8, table waiting 3/8, entered 2/8,
median 166d, max 180d — identical to the 1715Z band. (Wave reach is
not re-measured by this instrument; the tablenat band's wave-4 6/8,
wave-5 0/8 stands as the comparison of record.)

## CENSUS — template-by-speaker-by-situation (all 18 lines on 73672)

Templates (the six `tableWaitTalk` pool lines, havenGrowth.js):

| tpl | line (short) | n | speakers | seat | waitDur | pantry | announced | pellet | nationProd |
|---|---|---|---|---|---|---|---|---|---|
| T0 | The table's set. The ring of pale light … | 6 | Gustavo 2, Ingrid 2, Aria 1, Khalil 1 | waiting 6 | early 1, mid 4, late 1 | ok 6 | 3/6 | 3/6 | 2/6 |
| T1 | Nobody's sleeping. The sky is waiting … | 1 | Dale 1 | waiting 1 | mid 1 | ok 1 | 1/1 | 1/1 | 0/1 |
| T2 | Did you see their faces? Too many angles. | 2 | Ingrid 1, Afriyie 1 | waiting 2 | late 2 | low 1, ok 1 | 2/2 | 2/2 | 2/2 |
| T3 | It waits. We wait. Somebody should check the snares. | 2 | Petra 1, Khalil 1 | waiting 2 | mid 2 | ok 1, low 1 | 2/2 | 2/2 | 2/2 |
| T4 | It eats while we deliberate. The Herald feeds … | 4 | Aria 1, Petra 1, Khalil 1, Afriyie 1 | waiting 4 | early 2, late 2 | ok 4 | 2/4 | 2/4 | 2/4 |
| T5 | Why them? … they're the one who has to sit in it. | 3 | Petra 1, Ingrid 1, Afriyie 1 | waiting 3 | late 3 | ok 2, low 1 | 3/3 | 3/3 | 3/3 |

Full line table (73672, day, speaker → listener, template, situation):
T4 day 64 Aria → Sanne; T4 day 71 Petra → Gustavo; T0 day 75 Gustavo →
Dale; T0 day 80 Gustavo → Dale; T0 day 84 Ingrid → Gustavo; T0 day 91
Aria → Ingrid; T1 day 96 Dale → Petra; T3 day 107 Petra → Ingrid; T0
day 114 Ingrid → Petra; T3 day 122 Khalil → Petra; T5 day 127 Petra →
Khalil; T5 day 138 Ingrid → Khalil; T2 day 143 Ingrid → Afriyie; T0
day 154 Khalil → Ingrid; T4 day 158 Khalil → Ingrid; T5 day 164
Afriyie → Ingrid; T2 day 169 Afriyie → Khalil; T4 day 175 Afriyie →
Ingrid.

Situation detail that matters (snapshots, pantry via pantryKcalLive):
T0 fires at pantry 10,305 (day 75, 7 people, pre-announce, pre-pellet,
pre-prod) and at pantry 5,037 (day 154, 4 people, post-announce,
post-pellet, post-prod, overtime ×6 running) — verbatim identical.
No template ever mentions the pantry, the pellet, the nation prod,
the overtime, the waiting duration, or the shrinking roster. The
pool's own "snares" line (T3) and "Herald feeds" line (T4) gesture
at hardship in general, but neither fires on the hardship — T4 fires
at pantry 19,503 (day 64) and 3,400 (day 175) alike, and T3 fires at
pantry 10,381 and 486 alike. Distribution across waitDur/pantry
classes is hash dice, not tracking: the picker draws from
`tableTalkRand('tabletalk:' + day + ':' + scholarId)` with no
situation input at all (verified in code; the offline PRNG check
spreads line indices across all six, so there is no picker collapse
to explain — the tablenat single-line view was purely its filter).

Coverage notes (reported as structure, not zeros):
- The other 7 seeds contribute 0 table-talk lines, correctly: 5 never
  wait (no invitation, no talk — the gate is tableWaiting), and the
  2 winners (73676, 73677) wait exactly 1 day, the sitting day
  itself, so the fireside window never opens. Under this policy,
  entered-state table talk has ZERO occurrences on the band — a
  structural absence (no fireside window), not evidence that entered
  talk is broken or absent in general. A future arm that wants
  entered-state talk must first create a waiting window (a village
  that waits, then sits) — it cannot be harvested from this band.
- The 73 OTHER fireside lines are haven-need talk (pantry, wood,
  stone, granary), never table talk: a scan of OTHER lines for
  table/pale-light/waiting/Herald/seven-doors finds only the
  granary's "food that WAITS" line (5 occurrences) — a false friend
  of the keyword, correctly classified OTHER.
- Conversation-UI table lines (convoTopics.js `table` phase pools:
  "They say the table's coming…", "the air before a storm…") occur
  ZERO times in the capture on any seed — the bot policy never opens
  those conversations, so this census covers fireside talk only.
  That surface is unmeasured, not measured-zero; a future arm needs
  a conversation-driving policy to census it.
- System table lines (the /table|pale light/ capture, 564 band-wide)
  are context, not census: the regex is broad and catches village
  council tables ("Aria speaks at Emberhold's table") alongside the
  galactic Table. Only the fireside classification is the metric.

## SENSE-TEST (per situation class — meaning, coherence, relevance, consequences)

- WAITING, early (first 14 waiting days, 73672 days 62–76): the talk
  arrives on day 64, two days after the invitation, while the formal
  announce is still 26 days away (day-90 floor) — villagers noticing
  before the System announces reads right (the invitation is public
  the moment it is set, and fireside talk is the village's mouth, not
  the System's microphone). T4's Herald complaint on day 64 is
  coherent: the wait has a cost and they name it. Verdict: TRACKS
  loosely — the waiting itself is acknowledged, but no line says
  anything about THIS village's wait (no deeds named, no seat kind
  named — the lesser seat is never mentioned by any villager).
- WAITING, mid (days 77–122): the talk keeps coming (T0 ×4, T1, T3 ×2)
  across the announce (90), the pellet (91), and the nation prod
  (98) without once reacting to any of them. Day 91's T0 fires the
  morning the scholar stops needing food forever, and the line is
  identical to day 75's, when the pantry held 10,305 kcal and
  everyone still ate. Day 114's T0 fires while the roster is down to
  3 and the pantry to 2,510, and it is still the same sentence about
  the ring sitting there. Verdict: FLOATS FREE — the village's
  situation changes completely around the talk and the talk does not
  move. This is the blank, precisely located: not "one line" but
  "no line ever responds."
- WAITING, late (day 123+, 73672 days 123–180): T0 day 154, T2 day 143
  and 169, T4 day 158 and 175, T5 day 164 — six lines across the
  overtime grind (standing docked −25 to −33, rerun raids) that
  never mention the overtime, the dwindling (4 people, pantry 488
  at the end), or the 93–114 days already waited. A villager who has
  waited 100 days saying the same sentence as on day 13 of the wait
  is not a person marking time; it is a loop with a dice roll.
  Verdict: FLOATS FREE, and most damning here — waiting duration
  is the one thing every waiting villager must feel, and no
  template varies by it.
- ENTERED (73676, 73677 sit on their first waiting day): NO
  OCCURRENCES — no verdict possible, and none claimed. The system
  cannot be sense-tested in entered state from this band; do not
  cite this arm for entered talk either way.
- NEVER-WAITING (5 seeds): no table talk, correct — villagers who
  were never invited do not talk about an invitation. Verdict:
  COHERENT (silence is the right behavior here).

Overall sense verdict: the village knows about the table (good), the
pool has six voices (better than the 1715Z reading), but the talk
is decor, not response — it never answers the village's situation,
and the most repeated line (T0, 6 of 18) is the least situated of
all, since it names only the ring and the waiting, which never
change.

## SPECIFICATION FOR A FUTURE VARIETY FIX (specified, NOT implemented)

What the fix would need to vary, and by what (all in the
tableWaitTalk pool / picker, havenGrowth.js — no new systems):
1. By waiting duration: at least one template family per phase —
   early (the summons is new: wonder, questions), mid (the wait
   drags: impatience, the cost named — the Herald line already
   gestures here), late (the wait is old: weariness, counting the
   days, "still here?"). The bar is not "more lines" but "a late
   line cannot be a day-13 line": a reader given a line blind must
   be able to tell early from late waiting.
2. By situation, with the situation actually read at fire time:
   pantry class (empty/low/ok — the "snares" line should fire when
   the pantry is actually thin, not by dice), pellet (a villager
   talking about the table the week the scholar stopped eating
   should notice the irony, or the fix should say why they don't),
   nation prod / overtime (the System's "FINALES need a NATION"
   prod should enter at least one line after it fires — currently
   no line can, because no template references it).
3. By seat kind: the lesser seat is never named by any villager.
   Either a line names what was earned ("a lesser seat, not the
   high one" — in the village's own words, not mechanics), or the
   fix documents why villagers never distinguish seats.
4. By speaker continuity (optional, second-order): the same speaker
   repeating the same template (Gustavo → Dale, T0, days 75 and 80)
   is the sharpest "loop" tell. A per-speaker recent-template memory
   (the conversation system's convoPick already does this for
   threads; the fireside beat has no equivalent) would blunt it —
   but this is polish, not the core blank; duration/situation
   variation comes first.
Pre-registered bar a future variety arm should judge against (for
the coordinator to adopt or amend — not binding on this arm):
on the same 73671–73678 band, same substrate: (a) census covers
8/8 seeds; (b) T0's share of waiting-state table talk falls below
50% AND no single template fires in all three waitDur classes
unchanged (i.e., at least the most-repeated template varies by
phase); (c) at least one fired line references a post-waiting
situation marker (pellet, nation prod, or overtime) that fired
before it; (d) the sense verdict for mid and late waiting is
"tracks" on a blind read (a reader shown lines without days can
sort early from late better than chance). If the fix only adds
lines without situation inputs, it will fail (c) and (d) by
construction — that failure mode is named here so the future arm
does not re-learn it.

## VILLAGE ASSESSMENT (plain words)

Eight villages, same shape as the 1715Z band (it IS that band,
re-run). Three survive 180 days without winning, three are lost,
two win through the table on the day they are invited. Only one
village ever really waits: 73672, a regional village with a lesser
seat, talking about the table by the fire for 119 days while it
shrinks from 8 people to 4 and its pantry swings from 19,503 kcal
down to 488. Everyone else either never gets invited or sits
immediately. The wall stands exactly where 1715Z left it:
national-ever 6/8, table-entered 2/8, wins only through the
default-OFF tableseat-nowait lesser seat, full seat unreached,
wave 5 unborn on this band's comparison of record. What this arm
adds is the sound of the wait: the village does talk about the
table, in six voices — but it talks the same way on day 13 of the
wait as on day 93, and that sameness, not the single sentence
1715Z reported, is the dialogue blank.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No pre-registered leg was re-scored mid-run. The GO bar (8/8
  coverage + complete template-by-speaker-by-situation table + a
  sense verdict for every situation class that occurs) is met:
  8/8 harvested, the table above is complete, and verdicts are
  given for waiting-early, waiting-mid, waiting-late,
  entered (no occurrences — reported as no data, not a verdict on
  entered talk), and never-waiting. The reproduction leg is also
  met (T0 exact: days 75/80/84/91/114/154, speakers
  Gustavo/Gustavo/Ingrid/Aria/Ingrid/Khalil).
- One instrument-filter error caught and fixed BEFORE judging (same
  class as tablenat's, found in my own code): the analyzer's T2 key
  was lowercase ("too many angles") while the pool line capitalizes
  it ("Too many angles") — the first quick count silently dropped
  both T2 lines into OTHER. Fixed to exact-case keys; the committed
  analyzer classifies all 18 correctly, and the proof asserts the
  corrected counts. Recorded so the next run does not re-learn the
  case trap. No verdict turned on the pre-fix count — the
  tablenat-correction claim (unfiltered harvest shows 6 templates,
  not 1) holds under either count, since T0/T1/T3/T4/T5 were
  already visible.
- One comparator fix, also before judging: the summary's
  corroboration flagged boolean-vs-0/1 type differences as diffs
  (false vs 0, true vs 1). The comparator now normalizes before
  comparing; the committed summary.json shows zero diffs on all 8
  seeds. Values were never different, only representations.
- BALANCED PANEL (§15): ATTEMPTED AND NOT APPLICABLE — stated
  explicitly. scripts/balance-panel.js compare mode requires
  panel.json.gz pairs generated by its own observer; it has no
  recorder-corpus ingest mode. No panel file is produced or faked;
  the paired identical-seed tables in this file (same 8 seeds, same
  substrate, same horizon, two bases with a 1-line build.js delta)
  are the comparison of record. Same recorder-corpus limitation
  prior arms reported.
- Telemetry-check NOT run on these rows (their counts are wrong on
  recorder-style rows — standing instruction from the 0158Z
  evidence, same as the tablenat arm). The coordinator's telemetry
  step is the loop body's, not this arm's; no baseline is rolled
  here.
- check.js --quick NOT run: zero src/js diff in this tree (DIAG arm,
  three new scripts only) and sibling loops are live (its result
  would be unattributable); the arm's own proof is the corpus PASS
  + analysis PASS + test-tableline-a.js PROOF PASS. node --check
  clean on all three new scripts.
- Metric note for the NEXT run: the "table" shorthand in band tables
  must keep meaning invitation-ever (waiting or entered), as
  tablenat defined it — 73676/73677 are table=1 AND entered=1
  (waited 1 day, sat), while 73672 is table=1 entered=0 (waited 119
  days, never sat). A band table that collapses those two shapes
  into one "table" count hides the only waiting village on the
  band.

## PROOF SCRIPTS (all in this tree, all run)

- scripts/sim-tableline-a-sweep.js — NEW. 8/8 rows, CORPUS PASS
  (summary.json in perseed-sim-tableline-a/; corroboration diffs
  [] on all 8 after the normalization fix).
- scripts/sim-tableline-a-analyze.js — NEW. ANALYSIS PASS (8/8
  seeds, 91 fireside, 18 table-talk, 73 other; writes analysis.json).
- scripts/test-tableline-a.js — NEW. PROOF PASS: asserts the exact
  reported counts (templates T0 6/T1 1/T2 2/T3 2/T4 4/T5 3, per-seed
  table talk, T0 days + speakers + listeners verbatim, all
  table-talk in waiting state, band wins 2/table 3/entered 2/
  national-ever 6/median 166d). node --check clean on all three.
- Offline PRNG check (ad-hoc, not committed): tableTalkRand spreads
  line indices across all six pool lines for days 62–180 across
  five scholar ids — no picker collapse; the tablenat single-line
  view was its filter, not the picker.

## INFRASTRUCTURE (loud, as required)

- No EPERM flap hit this run: all node/shell disk writes succeeded
  (8 rows, summary twice, analysis, evidence). No stdout-only
  fallback was needed.
- No safe-commit refusal yet (commit pending at report time —
  coordinator merges; see "Tree state" in the final report).
- No [needs-eyes]: DIAG arm, zero game-code change, zero
  dialogue-string change. Nothing here needs Steve's phone.
- Files for commit (worktree ~/workspace/worktrees/sim-tableline-a):
  evidence/2026-10-26/sim-tableline-a.md (this file),
  evidence/2026-10-26/perseed-sim-tableline-a/ (8 rows + summary.json
  + analysis.json), scripts/sim-tableline-a-sweep.js,
  scripts/sim-tableline-a-analyze.js, scripts/test-tableline-a.js.
  Zero src/js diff, zero src/data diff, zero policy diff.
  No other untracked files in the worktree (verified by git status
  at close — see "Tree state" in the final report).

## BLANKS FILLED OR DOCUMENTED

- FILLED (measurement): the 1715Z "one canned line" reading is
  corrected — 73672 speaks 18 table-talk lines across all six pool
  templates, not one line. The tablenat observation (T0 ×6, same
  days/speakers) reproduces exactly; its generalization ("ONE
  canned line") does not survive an unfiltered harvest.
- DOCUMENTED, NOT FIXED (the actual blank, specified above):
  situation-blind table talk — no line ever tracks pantry, pellet,
  nation prod, overtime, waiting duration, or seat kind; T0 repeats
  unchanged across early/mid/late waiting and across every marker.
  Future fix specification + pre-registered bar are in "SPECIFICATION"
  above. Narration variety still awaits Steve's ruling — this arm
  does not pre-empt it.
- DOCUMENTED, NOT FIXED (coverage gaps, not findings): entered-state
  table talk has zero occurrences on this band (structural — the
  winners sit on their first waiting day); conversation-UI table
  lines occur zero times under this bot policy (unmeasured surface,
  needs a conversation-driving policy).
- DOCUMENTED (naming, no change): the /table/ regex is too broad for
  a census (catches village council tables); the fireside
  classification, not the system-line capture, is the metric.
- NOT A FINDING: no game bug was found in tableWaitTalk, its pool,
  or its picker. A fix arm for "picker collapse" would be fixing
  something that is not broken — do not spawn one; spawn the
  situation-variation arm (after Steve's narration ruling) instead.

Convergence state: scale-onramp stays converging (NOT converged):
the wall numbers are unchanged from 1715Z, and this arm is a
dialogue measurement on the wall's waiting village, not a wall
mover. The dialogue blank is now specified precisely enough for a
future arm to judge against — that is this arm's contribution to
convergence, not a convergence claim.

