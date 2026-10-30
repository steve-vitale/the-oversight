# sim-woodshortline-b — evidence (wood-short lacking-line tail audit, backlog #1456 sub-item)

Verdict: **GO on the pinned base** — judged ONLY
against the base-pinning prereg bars in
`evidence/2026-10-30/sim-woodshortline-b-prereg.md`
(committed as 2edcb8d22, BEFORE any judged leg).
On every staged wood-short evening, the refused tail
names the lacking wood with the live count, in the
player's own terms, with no lie: 7 of 7 staged
evenings, 7 of 7 lines exact. No src/js change, no
policy-default change, no wording change —
measurement only. The wood-short sub-item of #1456 is
CLOSED on this evidence (see Bars). The woodwarm
Steve-call (should the bot learn warmth fires, and
with what restraint) stays OPEN and is NOT re-decided
here.

## Base pin and what was run

- PINNED BASE: 2138ad07e326ff9b2e16001347f5a4327820a435
  (worktree HEAD at prereg writing time). The prereg
  commit added only the prereg file, and the final
  tracked diff vs the pin for `src/` is EMPTY and for
  tracked files under `scripts/policies/` is EMPTY —
  the legs ran on pinned-base game code verbatim. The
  only policy addition vs the pin is NONE: driver,
  analyzer, and both policies are reused verbatim from
  the woodwarm run. New files are the audit script,
  proof script, evidence, corpora, and census JSONs.
- Index-clobber note (repo lesson, not a verdict
  factor): the safe-commit of the prereg left the main
  index showing the prereg file as a staged deletion
  (commit 2edcb8d22 itself correct, 236 insertions).
  Repaired with `git update-index --add --cacheinfo`
  from the HEAD blob; `git status --short` empty and
  `git diff HEAD` empty verified before any judged leg.
- PILOT (instrument validation, part of the bank):
  seeds 15003, 15215, ON+warmth, 30 loop-days. Instrument
  valid (errs 0 both stores, warmth records present with
  the full field set, 15215 warmth acted 6). The pilot
  legs ARE judged bank legs per the prereg, not extra
  draws, and the bank ran as pre-registered with no
  trigger change.
- BANK — JUDGED ON+warmth LEGS: all 10 qualifier seeds
  from the woodshort 500-seed screen, in screen order
  (15003, 15009, 15091, 15211, 15215, 15220, 15221,
  15337, 15376, 15439), 30 loop-days each, driver
  scripts/woodwarm-trace-b.js REUSED VERBATIM (OUTDIR
  override only), env POLICY=nighttravel,
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, WOODCARRY=1, WOODWARM=1. All 10
  survived the 30 days.
- GUARD LEGS (warmth off, carry on): same 10 seeds,
  WOODCARRY=1 WOODWARM=0. These double as the
  pinned-base census re-derivation (see below).

## Reproduction (NO drift on the new base)

ON census (this run) reproduces the woodwarm ON census
EXACTLY, despite the base moving c795e7e25 ->
2138ad07e (only src/js/havenGrowth.js changed in
`src/`): 21 creek evenings, 11 still-refused, 10
rescued; still skip kcal-short 3 / ticks-short 1 /
wood-short 7; wood values on creek evenings in order
4 x7, then the 15215 drain 3, 3, 2, 1, 0, 0, 0, then
4 x7; warmth acted 6, log-spent 4, fire-failed 2; miss
reasons not-creek-refused 279 / rescued 10 /
branches-available 1 / ticks-short 1 / no-wood 3;
spend nights 15215 days 9 (4->3), 11 (3->2), 12 (2->1),
13 (1->0). Guard legs reproduce the ledger/woodwarm
guard census EXACTLY: 15 creek / 4 still / 11 rescued,
woodPlayer = 4 on all 15, 0 wood-short, 0 warmth acted.
The old censuses are therefore safe to cite as
current-base behavior ONLY because this run
re-derived them — and they hold. No drift to report.

Committed records:
`evidence/2026-10-30/sim-woodshortline-b-census.json`
(ON) and `sim-woodshortline-b-guard-census.json`
(guard); analyzer scripts/analyze-woodwarm-b.js reused
verbatim; tail audit
`evidence/2026-10-30/sim-woodshortline-b-tail-audit.txt`
(full tails) and
`sim-woodshortline-b-tail-audit.json` (machine audit);
audit script scripts/audit-woodshortline-b.js.

## The audit: all 7 staged evenings, verbatim

All seed 15215, all with a prior warmth log-spend and
NO intervening haven-morning refill (carry records
checked night by night, same walk-back definition as
woodwarm). The line on each evening is quoted exactly
as it appears in the eveningSayTail, and the narration
field on the woodcarry record matches the tail line in
all 7 cases. In every case the line is said BEFORE the
night's own warmth outcome (failed fire on night 10,
successful fire on nights 11-13, no warmth action on
nights 14-16 where the no-wood miss applies) — so the
count is the live count AT THE DECISION, and a
same-night spend never retroactively falsifies it.

- Spend night 9 (4 -> 3) -> night 10, wood 3:
  "No bridge tonight — the pack holds 3 logs, and a
  bridge needs 4."
- Spend night 9 -> night 11, wood 3: same line.
  (Night 10's own warmth attempt failed, so night 9
  remains the most recent spend.)
- Spend night 11 (3 -> 2) -> night 12, wood 2:
  "No bridge tonight — the pack holds 2 logs, and a
  bridge needs 4."
- Spend night 12 (2 -> 1) -> night 13, wood 1:
  "No bridge tonight — the pack holds 1 log, and a
  bridge needs 4." (Singular correct.)
- Spend night 13 (1 -> 0) -> night 14, wood 0:
  "No bridge tonight — the pack holds 0 logs, and a
  bridge needs 4."
- Spend night 13 -> night 15, wood 0: same line.
- Spend night 13 -> night 16, wood 0: same line.
  (Nights 14-16 miss warmth on no-wood, so the night-13
  spend stays the staging spend.)
- The staged window ends on the morning of day 17: the
  player wakes at haven and the morning carry refills
  the pack 0 -> 4 (pile 35 -> 31, as in woodwarm). No
  staged evening is claimed past a refill.

Primary count: named/staged = 7/7 = 1.000, with staged
7 >= minimum-n 2. No staged tail carries a second
different count for the same pack, no staged tail
claims a bridge built or a home arrival via that gap,
and no staged tail misstates the spend that caused
the shortage — the line names the count, and the
spend trajectory (4->3->2->1->0 across nights
9/11/12/13) is exactly what the counts walk down.

## Sense-read (SENSE-TESTING LAW — read, not counted)

All 7 staged tails read end to end, plus all 10
rescued tails and all 4 other-still tails. Verdict:
PASS, with the two ambient wrinkles below carried
alongside it (both pre-existing, neither a lie).

- Night 10 (first staged evening): day walk finds and
  eats Purslane (240 kcal), creek refuses with the live
  count (3 logs), then the warmth attempt FAILS
  honestly ("Nothing. Your arms ache. But your hands
  know a little more than they did. (-70 kcal, 48 ticks
  of work, gone either way.)"). The failure spends no
  fuel, so night 9 remains the staging spend — and the
  tail proves the line is not self-staged on night 10
  itself. Coherent.
- Night 11: same wood-short line (3 logs), then a
  successful warmth fire ("The tinder catches. A real
  flame, breathing. You feed it twigs — fire. Yours.
  (-0 kcal, 48 ticks.)"). The refusal is said at 3
  logs, the fire then spends to 2 — the ordering the
  prereg's metric-review note anticipated, and it reads
  correctly: the line was true when said. Coherent.
- Night 12: wood-short line (2 logs), then the third
  successful fire earns the knack ("Third fire. You've
  got the knack now — friction fire is yours, every
  time."). The practice curve paying off mid-strand is
  a real story beat, not a number. Coherent.
- Night 13: wood-short line (1 log), then a successful
  warmth fire (knack — no lottery anymore). Coherent.
- Nights 14-16: wood-short line (0 logs), and the tails
  END at the refusal — no warmth lines follow, because
  the policy correctly misses on no-wood. A player with
  no logs left cannot light a log fire, and the tail
  does not pretend otherwise. Coherent.
- Rescued evenings (10/10): no rescued tail carries a
  same-evening refusal line for its gap, and the
  bridge/home narration reads sensibly throughout:
  creek warning ("The creek runs fast here — no
  crossing without a bridge or a swim."), lash ("You
  lash logs together. A rough bridge spans the gap.
  Rough wood, though — a bad storm could take it."),
  travel to Haven, "You walk back into Haven." No tail
  claims a bridge was possible when it was not, and
  none claims one was built when it was not — the
  full-corpus outcome-contradiction scan returns 0
  violations across all 21 ON creek evenings.
- Other-still evenings (4/4): each names its own lack
  correctly, never substituted for a wood-short result:
  15009 night 13 "24 kcal in hand, and the lashing
  takes 60."; 15215 night 7 "47 ticks left in the day,
  and a bridge takes 96 ticks."; 15215 nights 8 and 9
  "0 kcal in hand, and the lashing takes 60."
- Ambient wrinkles, noted not hidden (both pre-existing
  day-walk lines, also noted in woodwarm): the
  day-walk tails carry "fragments by the fire" gossip
  lines while the player is stranded outside, and the
  System/ability chatter (Lucky Rock, Green Thumb
  deepening) continues mid-strand. They read as
  overheard camp talk and System commentary during
  travel, not as claims about the player's own fire or
  pack, and they do not break any staged evening's
  coherence. They are not warmth-policy narration and
  no wording change is proposed for them here.

## Bars — judged, one by one

- (a) PRIMARY LINE-NAMING (staged >= 2 AND
  named/staged = 1.000): YES — staged 7, named 7.
  GO.
- (b) NO-LIE (no misstated count, no outcome
  contradiction on any ON creek tail): YES — 0
  contradictions on the full-corpus scan; every staged
  count equals woodPlayer and the spend trajectory.
  GO.
- (c) SENSE (at least one full staged tail passing,
  rescued tails sensible as a set): YES — all 7 staged
  tails pass end to end; rescued set coherent. GO.
- (d) TRAJECTORY REPRODUCTION (staged evenings on
  15215 from spends 9/11/12/13): YES — exact
  reproduction, no drift. (The INSUFFICIENT-DATA
  branch for staged < 2 was not needed.)
- (e) INSTRUMENT bars: recorder/classifier errs == 0
  on judged legs (wc errs 0, warmth errs 0, both legs)
  — HOLDS. Determinism re-run of 15003 ON+warmth
  byte-identical — YES (staging dir deleted; the proof
  script re-runs this check on every invocation).
  Guard 0 wood-short evenings and 0 warmth records
  acted — HOLDS.
- VERDICT RULE: (a) + (b) + (c) + (e) all hold with
  (d) holding — **GO**. The line plays on every
  wood-short evening. The wood-short sub-item of #1456
  is CLOSED on this evidence: measurement only, zero
  src/js, zero wording change. Recommended backlog
  action for the coordinator: mark the #1456 wood-short
  sub-item closed, citing this file; the warmth-policy
  Steve-call (bot learns warmth fires, with what
  restraint) remains OPEN and untouched by this run.

## Village assessment (plain words)

The 10 banked villages all survived the 30 days, on
both legs — partly selection (villages that lived long
enough to get caught at a creek), but within that frame
they are working villages: wave 1 in 10/10, wave 2 in
10/10, waves 3-5 not reached in this 30-day window.
The one village that matters here, 15215, is the same
story woodwarm told, now with its refusals audited
word by word: caught out at a creek on day 7 for want
of time, then days 8-9 for want of food, then — because
it lit fires for warmth — burning through its bridge
logs night by night (4 -> 3 -> 2 -> 1 -> 0), learning
friction fire properly (the knack on its third fire),
and every night told plainly, in its own pack's
numbers, why the bridge cannot be lashed. It walks
home on day 17 with a refilled pack. The refusal
narration never lies to it, never hides the shortage,
and never claims a bridge it cannot build.

What was missing, and what this run fills: the audit
itself. Woodwarm proved the wood-short evenings could
be staged; this run proves the refused tails on those
evenings say the true thing — the live count, the
4-log bridge requirement, in the player's own terms.
No blank remains open on the wood-short line: no fix
was needed, so no fix is claimed.

Wall numbers: NOT OBSERVABLE on 30-day evening legs
(pre-seat, no field). National / table / wins are
reported as NOT OBSERVABLE, never as zeros. No
national, table, or win claim is made or implied by
this run. Wave reach on the banked band: wave 1 in
10/10 villages, wave 2 in 10/10, waves 3-5 not reached
in this 30-day window. Median survival is 30 days (all
10 survived the window, both legs) — a ceiling effect
of the short window and the banking selection, not a
survival claim.

## Metric review (prereg doubts, answered; revisions for the NEXT run)

- The line-vs-same-night-spend ordering case named in
  the prereg's metric review OCCURRED (nights 11-13:
  refusal said, then the night's own warmth fire
  spends a log) and reads correctly: the refusal line
  precedes the fire lines in every tail, so the count
  is the live count at decision time. No re-scoring
  was needed; the ordering rule for the next run is:
  judge the count at the refusal line's position in
  the tail, not at the night's end.
- The singular "1 log" line (night 13) is grammatically
  correct — the lackingLine pluralization holds at the
  boundary. No wording issue at any count 0-4.
- The staged definition (walk-back + refill check)
  proved necessary again: nights 11, 15, 16 stage from
  spends 2-3 nights earlier, not just N+1. Keep it for
  any future spend-route prereg, with the refill check
  that keeps it honest.
- No balanced-panel compare .md is produced, as
  pre-registered: this is a 30-day position measurement
  of a policy-side behavior with zero src/js changes, so
  there is no game-root delta for a panel to compare,
  and the panel's registry policies do not include the
  nighttravel trace policy. The guard-vs-ON census
  comparison above IS the before/after, and the
  determinism re-run is the instrument-perturbation
  proof. The bars above are the judge.
- No metric doubt arose that would change the next
  run's bars: the named/staged fraction with minimum-n
  2 is the right primary for a line audit, and it was
  met at 7/7 without substitution.

## Proof

`scripts/test-woodshortline-b.js` — 55 checks, all
green: ON census recomputation (21 creek / 11 still /
10 rescued, skip kcal 3 / ticks 1 / wood 7, wood values,
warmth acted 6 / log-spent 4 / fire-failed 2, miss
reasons 279 / 10 / 1 / 1 / 3, staged 7 with exact
mapping, errs 0); per-staged-evening tail checks (exact
line, narration field match, refusal before own warmth
outcome, no contradiction); full-corpus contradiction
scan 0; other-still lines exact (4/4); guard census
recomputation (15 / 4 / 11, wood 4 everywhere,
staged 0, warmth acted 0, errs 0); determinism (15003
ON re-run byte-identical, staging dir deleted). Run:
`node scripts/test-woodshortline-b.js`.

## Landing

- Prereg: already committed (2edcb8d22), not
  recommitted.
- This commit: audit script
  (scripts/audit-woodshortline-b.js), proof script
  (scripts/test-woodshortline-b.js), ON corpora (10
  files), guard corpora (10 files), ON + guard census
  JSONs, tail audit txt + json, evidence file (this
  file).
- Measurement only: no src/js change, no policy change,
  no wording change. No [needs-eyes]: no wording is
  changed, and the audited line is the already-landed
  woodcarry lackingLine.
- Report: committed, pending coordinator merge.
  Verdict GO on pinned base 2138ad07e, 7/7 staged
  wood-short evenings naming the logs exactly, guard
  census reproducing exactly (no base drift), proof
  55/55 green. Recommended backlog action: close the
  #1456 wood-short sub-item on this evidence.
