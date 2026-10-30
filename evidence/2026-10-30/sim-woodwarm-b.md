# sim-woodwarm-b — evidence (warmth-fire staging route, backlog #1456 still-open sub-item)

Verdict: **GO on the pinned base** — judged ONLY
against the base-pinning prereg bars in
`evidence/2026-10-30/sim-woodwarm-b-prereg.md`
(committed as ffc1e11c0, BEFORE any judged leg).
The warmth-fire route stages the wood-short line
honestly: 7 staged wood-short creek evenings on
the 10-seed bank (bar: >= 2), with a full tail
sense-read passing. No src/js change, no
policy-default change — measurement only. The
policy is NOT landed as a bot default by this
run; whether the bot should learn warmth fires
is a design call for the coordinator/Steve (see
the self-trap caveat below — it matters).

## Base pin and what was run

- PINNED BASE: c795e7e2535921c21fd0c27d5cd180f34d0fb40a
  (worktree HEAD at prereg writing time). The
  prereg commit added only the prereg file, and
  the final tracked diff vs the pin for `src/` is
  EMPTY and for tracked files under
  `scripts/policies/` is EMPTY — the legs ran on
  pinned-base game code verbatim. The only policy
  addition is the NEW measurement wrapper
  `scripts/policies/woodwarm.js` (no existing
  policy touched). New files are measurement
  scripts + evidence + corpora only.
- PILOT (instrument validation, part of the
  bank): seeds 15003, 15215, ON+warmth, 30
  loop-days. Instrument valid (errs 0, warmth
  records present with the full field set,
  evening loopDay sequences intact — no
  day-rollover inside the fire step). The pilot
  already showed the result taking shape (15215
  warmth acted 6, log-spent 4); the pilot legs
  ARE judged bank legs per the prereg, not
  extra draws, and the bank ran as pre-registered
  with no trigger change.
- BANK — JUDGED ON+warmth LEGS: all 10 qualifier
  seeds from the woodshort 500-seed screen, in
  screen order (15003, 15009, 15091, 15211,
  15215, 15220, 15221, 15337, 15376, 15439), 30
  loop-days each, driver scripts/woodwarm-
  trace-b.js, env POLICY=nighttravel,
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, WOODCARRY=1, WOODWARM=1. All 10
  survived the 30 days.
- GUARD LEGS (warmth off, carry on): same 10
  seeds, WOODCARRY=1 WOODWARM=0. These double as
  the pinned-base census re-derivation (see
  below): they reproduce the ledger run's ON
  census EXACTLY, so the base has NOT drifted
  on this bank and no old census is quoted
  second-hand.

## ON census (10-seed bank, pinned base)

Committed records:
`evidence/2026-10-30/sim-woodwarm-b-census.json`
(ON) and `sim-woodwarm-b-guard-census.json`
(guard); analyzer scripts/analyze-woodwarm-b.js.

- ON creek evenings: 21. Still-refused: 11.
  Rescued: 10.
- Still-refused skip breakdown: kcal-short 3,
  ticks-short 1, wood-short 7.
- Wood on creek evenings, in order: 4 ×7, then
  the 15215 drain 3, 3, 2, 1, 0, 0, 0, then
  4 ×7 (other seeds, untouched by warmth).
- Warmth records: 300 evenings, acted 6,
  log-spent 4, fire-failed 2. Miss reasons:
  not-creek-refused 279, rescued 10,
  branches-available 1, ticks-short 1,
  no-wood 3.
- Spend nights (all seed 15215, branches 0,
  kcal 0 -> 0, fire lit): day 9 wood 4 -> 3
  (ticksLeft 109); day 11 wood 3 -> 2
  (ticksLeft 111); day 12 wood 2 -> 1
  (ticksLeft 239); day 13 wood 1 -> 0
  (ticksLeft 111). The two failed warmth
  attempts (days 8 and 10) spent no fuel — the
  friction lottery, honestly recorded.
- The other still-refused evenings: 15009 day 13
  kcal-short, missed on branches-available (2
  branches held — a branch fire would have
  spent no log, so the policy correctly did not
  light); 15215 day 7 ticks-short (47 ticks,
  below even the 48-tick fire cost before the
  +10 margin — correctly missed).

## The staged evenings (PRIMARY bar: >= 2 — met with 7)

All seed 15215, all with a prior warmth log-
spend and NO intervening haven-morning refill
(carry records checked night by night):

- Spend night 9 (4 -> 3) -> night 10, wood 3:
  "No bridge tonight — the pack holds 3 logs,
  and a bridge needs 4."
- Spend night 9 -> night 11, wood 3: same line.
  (Night 10's own warmth attempt failed, so
  night 9 remains the most recent spend.)
- Spend night 11 (3 -> 2) -> night 12, wood 2.
- Spend night 12 (2 -> 1) -> night 13, wood 1.
- Spend night 13 (1 -> 0) -> night 14, wood 0.
- Spend night 13 -> night 15, wood 0.
- Spend night 13 -> night 16, wood 0.
  (Nights 14–16 miss warmth on no-wood, so the
  night-13 spend stays the staging spend.)
- The staged window ends on the morning of day
  17: the player wakes at haven and the morning
  carry refills the pack 0 -> 4 (pile 35 -> 31).
  No staged evening is claimed past a refill.

## Why the ON trajectory diverges from the guard (read this before celebrating)

Guard 15215 strands only days 7–9: on day 10
the player, still holding 4 logs, reaches the
evening with 180 kcal and 110 ticks, and the
evening bridge attempt succeeds — rescued, home
that night.
ON 15215 strands days 7–16: the day-9 warmth
spend leaves 3 logs, so the day-10 bridge gate
fails on wood-short BEFORE kcal/ticks are even
checked, and each further warmth spend digs
the hole deeper (3 -> 2 -> 1 -> 0). The warmth
fire is therefore self-trapping as an
unconditional bot behavior: it burns the very
logs needed to escape, stretching a 3-night
strand into a 10-night strand. That is a
consequence of the staging, not a flaw in the
measurement — the line plays honestly in every
staged evening — but it is exactly why this run
does NOT propose warmth-every-stranded-night as
a bot default. A wise version (for a future
prereg, not assumed here) would have to decide
when warmth is worth a bridge log — e.g. stop
spending once the pack is at the bridge
threshold's edge, or only when no rescue is in
reach. The measurement proves the line CAN play
honestly; it does not prove the bot SHOULD
light the fire every night.

## Sense-read (SENSE-TESTING LAW — read, not counted)

Full tails read for seed 15215, nights 9–13.
Verdict: PASS on the staged line, with the
self-trap caveat above carried alongside it.

- Night 9 (the staging spend): the day walk
  forages unknown berries the bot cannot cook
  (knowledge-gating working), the creek refuses
  for 0 kcal ("No bridge tonight — 0 kcal in
  hand, and the lashing takes 60."), then the
  fire catches: "The tinder catches. A real
  flame, breathing. You feed it twigs — fire.
  Yours. (-0 kcal, 48 ticks.)" A cold night
  outside, a fire lit, a pack one log lighter.
  Coherent.
- Night 10 (first staged evening): the day walk
  finds and eats Purslane (240 kcal), the creek
  refuses with the live count ("the pack holds
  3 logs, and a bridge needs 4."), then the
  warmth attempt FAILS honestly: "Nothing. Your
  arms ache. But your hands know a little more
  than they did. (-70 kcal, 48 ticks of work,
  gone either way.)" The failure spends no fuel,
  so night 9 remains the staging spend — and
  the tail proves the line is not self-staged
  on night 10 itself. Coherent.
- Night 11: same wood-short line (3 logs), then
  a successful warmth fire (-0 kcal, 48 ticks).
  Coherent.
- Night 12: wood-short line (2 logs), then the
  third successful fire earns the knack: "Third
  fire. You've got the knack now — friction fire
  is yours, every time." The practice curve
  paying off mid-strand is a real story beat,
  not a number. Coherent.
- Night 13: wood-short line (1 log), then a
  successful warmth fire (knack — no lottery
  anymore). Coherent.
- One ambient wrinkle, noted not hidden: the
  day-walk tails carry "fragments by the fire"
  gossip lines while the player is stranded
  outside. Those are pre-existing day-walk
  ambient lines, not warmth-policy narration,
  and they read as overheard camp talk during
  travel rather than as claims about the
  player's own fire. They do not break the
  staged evenings' coherence, but a future
  tail-reader should know they are there.

## Guard census (pinned-base re-derivation — NO drift)

Guard legs (WOODCARRY=1, WOODWARM=0) reproduce
the ledger run's ON census EXACTLY: 15 creek
evenings, 4 still-refused, 11 rescued; still
skip kcal-short 3 / ticks-short 1; woodPlayer =
4 on all 15; haven mornings with pile 263;
pile min days 2+ = 8 (day 7); pile-floor mornings
after day 1 = 0. The old census is therefore safe
to cite as current-base behavior ONLY because
this guard re-derived it — and it holds.
Guard: 0 wood-short evenings, 0 warmth records
acted, errs 0.

## Bars — judged, one by one

- PRIMARY >= 2 honestly-staged wood-short creek
  evenings AND >= 1 full tail sense-read
  passing: YES — 7 staged, sense-read PASS
  (nights 9–13 read above). GO.
- CLOSE-AS-UNPLAYABLE: NOT APPLICABLE — the
  route staged, so nothing is closed. The
  narrower ledger-run claim ("unplayable under
  competent+nighttravel bot play") is now
  SUPERSEDED for the warmth purpose: a bot that
  lights a warmth fire on a stranded night CAN
  stage wood-short honestly. Whether that
  behavior belongs in the bot is the open
  design call above, not a measurement gap.
- INSTRUMENT bars: recorder/classifier errs == 0
  on judged legs (wc errs 0, warmth errs 0, both
  legs) — HOLDS. Determinism re-run of 15003
  ON+warmth byte-identical — YES (staging dir
  deleted; the proof script re-runs this check
  on every invocation). OFF guard 0 wood-short
  evenings and 0 warmth records acted — HOLDS.
- Pile ledger (secondary, no bar): min pile
  days 2+ = 8 on both legs; pile-floor mornings
  after day 1 = 0. The pile route stays closed,
  re-confirmed.

## Village assessment (plain words)

The 10 banked villages all survived the 30 days,
on both legs — partly selection (villages that
lived long enough to get caught at a creek), but
within that frame they are working villages:
wave 1 in 10/10, wave 2 in 10/10, waves 3–5 not
reached in this 30-day window. They kill steadily
(ON: 80 wave kills recorded across the bank;
guard: 76 — the small gap is the warmth
trajectory's extra stranded days, not a combat
change) and they lose people along the way (ON:
110 death-log entries; guard: 109). The one
village that matters here, 15215, is the
familiar shape with a new ending: caught out at
a creek on day 7 for want of time, then days
8–9 for want of food, carrying unidentified
berries it cannot cook — and this time, because
it lit fires for warmth, it burns through its
bridge logs night by night (4 -> 3 -> 2 -> 1
-> 0), learns friction fire properly (the knack
on its third fire), and still walks home on day
17 with a refilled pack. It survives the month,
but the warmth fires cost it a week of strand.
That is the village this run documents: a real
trade — warmth tonight against the bridge home
tomorrow — played out in the open, with honest
numbers at every step.

What was missing, and what this run fills: a
played wood-short evening, and the proof that
the warmth purpose (not cooking) is the honest
staging route for it. The blank filled is the
sub-item itself, as a measurement: the line
variant now has a played, sense-read instance
on record. What is still missing is the design
call — should the bot learn warmth fires, and
with what guard against burning its own bridge
home — plus the daytime bridge-spend route,
still real-play-true but bot-untestable on
current policy.

Wall numbers: NOT OBSERVABLE on 30-day evening
legs (pre-seat, no field). National / table /
wins are reported as NOT OBSERVABLE, never as
zeros. No national, table, or win claim is made
or implied by this run. Wave reach on the banked
band: wave 1 in 10/10 villages, wave 2 in 10/10,
waves 3–5 not reached in this 30-day window.
Median survival is 30 days (all 10 survived the
window, both legs) — a ceiling effect of the
short window and the banking selection, not a
survival claim.

## Steve-call note (for the coordinator's report)

Wood-short now PLAYS honestly via warmth fires:
a stranded-night fire for warmth (no food
needed, no cooking step) stages the line on the
very next stranded night, 7 times on one seed.
The open question for Steve is no longer whether
the line can play — it can — but whether the
bot should learn this behavior, and with what
restraint: unconditional warmth fires trap the
bot (3-night strand becomes 10 nights on seed
15215, because each spent log is a bridge log
lost). Options for his call: (a) bot learns
warmth fires with a guard (never spend the last
bridge logs, or only when rescue is out of
reach); (b) warmth fires stay a real-player
behavior and the bot never learns them, with
the line standing as played-in-measurement but
rare in bot sims; (c) the daytime bridge-spend
route instead. No design ruling is assumed here.

## Metric review (prereg doubts, answered; revisions for the NEXT run)

- Minimum-n 2 for staged evenings, kept — and
  MET with 7. No lowering, no re-scoring, no
  substitution (no ticks/kcal evening was used
  as a wood-short stand-in).
- The walk-back staged definition (any earlier
  spend night, no intervening refill) proved
  necessary and honest: nights 11, 15, 16 stage
  from spends 2–3 nights earlier, not just N+1,
  because a stranded player stays stranded and
  the pack stays unrefilled. Keep it for any
  future spend-route prereg — but keep the
  refill check (carry records), which is what
  keeps the definition honest.
- The +10 ticks margin (rollover guard only, no
  cooking margin) proved sufficient: no
  day-rollover in any evening sequence, and the
  day-7 ticks-short miss (47 < 48) shows the
  gate binding exactly where the engine cost
  binds. Keep +10 for warmth; do not import the
  campfire's +40 without a cooking step to
  justify it.
- The branches < 2 gate proved load-bearing
  twice over: it correctly refused 15009 day 13
  (2 branches — a branch fire would spend no
  log) and it is what makes every counted spend
  a LOG spend. Keep it.
- The self-trap finding belongs in the NEXT
  prereg's design, not in this run's bars: any
  future "bot learns warmth" arm must
  pre-register a strand-length or escape guard
  (e.g. strand nights vs guard baseline) alongside
  the staging count, so a staging win cannot
  hide a strand cost.
- No balanced-panel compare .md is produced, as
  pre-registered: this is a 30-day position
  measurement of a policy-side behavior with zero
  src/js changes, so there is no game-root delta
  for a panel to compare, and the panel's registry
  policies do not include the nighttravel trace
  policy. The determinism re-run is the
  instrument-perturbation proof, and the bars
  above are the judge.

## Proof

`scripts/test-woodwarm-b.js` — all checks green:
warmDecision unit gate (act case + all 12 miss
reasons + boundary at fireCost+10); ON census
recomputation (21 creek / 11 still / 10 rescued,
skip kcal 3 / ticks 1 / wood 7, wood values,
warmth acted 6 / log-spent 4 / fire-failed 2,
spend nights 15215 days 9/11/12/13, miss reasons
279 / 10 / 1 / 1 / 3, staged 7 with exact
mapping, pile min 8 / pile-floor-after-day-1 0);
sense anchors (day-10 tail carries the 3-log
line; day-10 warmth is a failed fire, so the
line is not self-staged); guard census
recomputation (15 / 4 / 11 exact, wood 4 on all
15, staged 0, warmth acted 0, pile min 8);
determinism (15003 ON+warmth re-run
byte-identical, staging dir deleted). Run:
`node scripts/test-woodwarm-b.js`.

## Landing

- Prereg: already committed (ffc1e11c0), not
  recommitted.
- This commit: warmth policy
  (scripts/policies/woodwarm.js), driver
  (scripts/woodwarm-trace-b.js), analyzer
  (scripts/analyze-woodwarm-b.js), ON corpora
  (10 files), guard corpora (10 files), ON +
  guard census JSONs, evidence file (this file),
  proof script (scripts/test-woodwarm-b.js).
- Measurement only: no src/js change, no
  policy-default change, no wording change. No
  [needs-eyes]: no wording is changed, and the
  played line is the already-landed woodcarry
  lackingLine, sense-read here.
- Report: committed, pending coordinator merge.
  Verdict GO on pinned base c795e7e25, 7 staged
  wood-short creek evenings on a 10-seed bank
  (warmth acted 6, log-spent 4, all seed 15215),
  guard census reproducing the ledger ON census
  exactly (no base drift), with the self-trap
  caveat and Steve-call note above.
