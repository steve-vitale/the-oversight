# sim-lackingline-woodshort-b — evidence (wood-short lacking-line hunt, backlog #1456 still-open sub-item)

Verdict: **INSUFFICIENT-DATA on the pinned base** — judged ONLY
against the base-pinning prereg bars in
`evidence/2026-10-29/sim-lackingline-woodshort-b-prereg.md`
(committed as 9fc0b98c2, BEFORE any judged leg). No
wood-short still-refused ON creek evening occurred on
the bank, so no wood-short line was played, no tail
was sense-tested, and no bar was lowered, re-scored,
or faked. The diagnosis below is the result: it closes
both honest routes to a wood-short evening that the
prereg named, and it sharpens the "unplayable-by-
construction" question for the next prereg. No policy
change, no src/js change — measurement only.

## Base pin and what was run

- PINNED BASE: d6723d3f39495b26cedcfd518997a99df98ec5fc
  (worktree HEAD at prereg writing time). The prereg
  commit added only the prereg file, and the final
  tracked diff vs the pin for `src/` and
  `scripts/policies/` is EMPTY — the legs ran on
  pinned-base game code verbatim. New files are
  measurement scripts + evidence + corpora only.
- PHASE 0 — PILOT: seeds 15000–15007, OFF legs,
  30 loop-days. Instrument valid (errs 0, corpora
  shape correct, creek classification present).
  The pilot is part of the screen band, not a
  separate selection, and per the prereg it was
  NOT a kill gate for this existence hunt.
- PHASE 1 — SCREEN (OFF legs, WOODCARRY=0):
  all 500 seeds 15000–15499, 30 loop-days each,
  driver scripts/woodcarry3-trace-b.js UNCHANGED,
  env POLICY=nighttravel, COMPETENT_FEAST=0,
  SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  DAYS=30. No thief grant, no taps, no state edits.
  (The screen first ran sequentially, then was
  re-split into 4 parallel chunk processes over
  disjoint seed ranges writing distinct per-seed
  files; the killed sequential run's completed
  files were kept, its range re-run only for
  missing seeds — no seed was double-counted,
  and the final corpus has exactly one file per
  screen seed.)
- QUALIFIERS (fixed rule, ≥ 1 OFF creek evening):
  10 seeds — 15003, 15009, 15091, 15211, 15215,
  15220, 15221, 15337, 15376, 15439. No cap, no
  subset, no seed added after the screen.
- PHASE 2 — JUDGED ON LEGS (WOODCARRY=1): all 10
  qualifiers, 30 loop-days each, same driver and
  env. All 10 survived the 30 days.
- PHASE 3 — FULL ON CENSUS FIRST: analyzer
  scripts/analyze-lackingline-woodshort-b.js ran
  over the full qualifier bank IN SCREEN ORDER
  before any staged seed was named. No staged seed
  exists, so PHASE 4 (tail leg) was NOT built —
  per the prereg, dead code is not landed, and no
  sense-test is claimed.

## Screen census (500 seeds, pinned base)

Committed record:
`evidence/2026-10-29/sim-lackingline-woodshort-b-census.json`
(analyzer: scripts/analyze-lackingline-woodshort-b.js).

- Seeds screened: 500 (one corpus file each, all
  errs == 0, unclassified == 0).
- OFF creek evenings: 60. Qualifiers: 10 (2.0% of
  seeds — above lackingline2's 1.75% seed rate,
  but the qualifier definitions differ: here ≥ 1
  OFF creek evening; lackingline2's bank was built
  on a stricter episode trait. The rates are not
  directly comparable and no rate claim is made).
- Day-1 creek evenings: 0. Day-1 evening outcome
  distribution: inside 500/500. On this screen,
  under competent nighttravel play, loop-day 1
  ALWAYS ends inside at the haven — no day-1
  travel refusal of any bucket occurs. The day-1
  pile-floor window (universal, see below) can
  therefore never meet a creek evening on day 1,
  on this policy, on this base.
- 7 screen seeds end before 30 loop-days
  (15150: 19 evenings, 15177: 22, 15253: 27,
  15272: 23, 15386: 22, 15469: 23, 15479: 14) —
  death-aware horizons: dead villages stop
  simulating. None of the 7 is a qualifier, so
  no qualifier leg is affected.

## ON census (10 qualifier seeds, pinned base)

- ON creek evenings: 15. Still-refused: 4.
  Rescued (bridge built, retry arrived): 11.
  Rescue rate on the banked band: 11/15 = 73.3%
  (lackingline4: 6/14 = 42.9% — a different bank,
  reported for context only, never as a lever
  effect: the lever is identical, the banks differ).
- Still-refused skip breakdown: kcal-short 3,
  ticks-short 1, wood-short 0, build-refused 0,
  retry-refused 0.
- Still-refused evenings, in screen order:
  - 15009 day 13 kcal-short (wood 4, kcal 24,
    ticks 127);
  - 15215 day 7 ticks-short (wood 4, kcal 2254,
    ticks 47);
  - 15215 day 8 kcal-short (wood 4, kcal 0,
    ticks 239);
  - 15215 day 9 kcal-short (wood 4, kcal 0,
    ticks 109).
- Per-seed ON creek / still / rescued:
  15003 1/0/1, 15009 1/1/0, 15091 1/0/1,
  15211 1/0/1, 15215 4/3/1, 15220 1/0/1,
  15221 2/0/2, 15337 1/0/1, 15376 1/0/1,
  15439 2/0/2. All 10 seeds wave 2, all survived
  30 days.

### Gate distributions + margins (15 banked ON creek evenings)

- Wood: every evening woodPlayer = 4 — exactly at
  the 4-log floor, never below (margin 0, never
  negative), never above. Wood-short never bound
  ON, for the fourth consecutive lacking-line run
  (lackingline4's 14 evenings were also all 4).
- Kcal: range 0–2390. Below the 60-kcal floor: 3
  evenings (24, 0, 0; margins −36, −60, −60).
  The next lowest kcal above the floor is 180
  (margin +120). Kcal-short binds only after a
  stranding has drained the player (15215 days
  8–9 follow the day-7 stranding, exactly as
  13480 days 5–10 did in lackingline4).
- Ticks: range 47–255. Below the 96-tick floor: 1
  evening (47, margin −49). The next lowest ticks
  above the floor is 109 (margin +13).

### Morning carry-skip census (300 banked ON mornings)

- Acted (carry took logs): 25 mornings.
- Already-carrying (pack already 4): 253.
- Pile-floor: 10 — ALL on loop-day 1, ALL
  woodBefore 0 / pileBefore 10 / kcal 2190,
  one per qualifier seed. NO pile-floor morning
  after day 1 exists on this bank, and NO
  pile-floor morning is followed by a same-day
  creek evening (0/10). The day-1 pile is 10 on
  every seed (10 − 4 = 6 < 8 floor), and by day 2
  the pile is already 12–16+ and the carry acts.
- Kcal-floor: 0. Cannot-carry: 0. Neither
  alternative carry failure occurs on this bank.
- Not-at-haven (stranded mornings): 12 —
  15009 days 11–13, 15215 days 8–10, 15337 days
  25–30. Four of them ARE followed by a same-day
  creek evening (15009 day 13, 15215 days 8, 9,
  10) — the second honest route, tested and
  closed: every one of those evenings still holds
  woodPlayer 4. A stranded player keeps their 4
  logs through the stranding; the pack is not
  spent down by being out overnight.

## Bars (a)–(g) — judged, one by one

- (a) ≥ 1 wood-short still-refused ON creek
  evening: NO — 0 on the full bank. The existence
  bar is not met, and the verdict stops here by
  the prereg's own terms.
- (b) Judged tail contains the wood-short line
  with the live number: NOT APPLICABLE — no
  judged evening exists. No tail was built, no
  line was played, and no rescued-evening tail is
  substituted as a sense pass.
- (c) No contradicting lever line: NOT APPLICABLE
  (same reason).
- (d) Recorder/classifier errs == 0, judged
  evening classified creek: the instrument half
  HOLDS (screen errs 0, ON errs 0, unclassified
  0 throughout), but there is no judged evening
  for the classification half to attach to.
- (e) Determinism re-run of first qualifier seed
  ON (15003) byte-identical: YES — re-run into a
  worktree staging dir matched the judged corpus
  JSON byte for byte; staging dir deleted after
  comparison. (The proof script re-runs this
  check on every invocation.)
- (f) OFF guard: YES — 300 qualifier OFF evenings
  scanned, 0 "No bridge" hits. The line fires
  only on the ON leg, and on this bank it never
  fired at all.
- (g) Sense-test: NOT PERFORMED — no staged
  evening exists, so no played still-refused tail
  was read for sense. This is recorded, not hidden.

Verdict: (a) fails with a complete diagnosis →
**INSUFFICIENT-DATA**. This is a complete result,
not a worker failure, and never a reason to lower
the bar, repeat sequential-ON screening, or
re-score against a friendlier metric.

## Diagnosis — exactly which precondition failed

Wood-short needs, on the same day: a haven
morning that leaves the pack below 4, AND a
creek-refused evening that day. Both named routes
fail on this bank, for measured reasons:

1. Pile-floor route: the pile-floor morning exists
   (10/10 qualifier seeds, day 1, pack 0, pile 10)
   but NEVER meets a creek evening — day-1
   evenings are inside on 500/500 screen seeds,
   and no later pile-floor morning exists (the
   pile grows past the floor by day 2 and never
   comes back under it on this bank).
2. Stranded-morning route: not-at-haven mornings
   DO meet same-day creek evenings (4 cases),
   but the pack still holds 4 logs on all 4 —
   stranding does not spend pack wood.
3. The other two carry failures never occur:
   kcal-floor 0, cannot-carry 0 on 300 mornings.

In plain words: the morning carry is too good at
its job, and the one morning it refuses (day 1,
when the village pile holds only 10 logs) is a
morning the player never leaves home. Under the
shipped carry, a wood-short creek evening needs
either a village whose pile stays under the floor
past day 1 (never seen: piles grow to hundreds),
or a day the player spends pack wood while out
(never seen: stranded packs stay at 4), or a
carried-load or starvation morning (never seen:
kcal-floor 0, cannot-carry 0). None of those is
manufacturable without weakening the carry or
editing state — both refused in advance by the
prereg.

## Village assessment (plain words)

The 10 banked villages all survived the 30 days,
on both legs — partly selection (these are
villages that lived long enough to get caught at
a creek), but within that frame they are working
villages: wave 1 in 10/10, wave 2 in 10/10, wave 3
in 0/10 on this 30-day window. They kill monsters
steadily (76 wave kills over 30 days) and they
lose people along the way — 109 death-log entries
(77 monsters killed, 28 villagers, 4 persons).
The lever's rescue effect is visible in the
episode shapes: OFF, the qualifier villages sit
through long creek episodes (15211: 18 OFF creek
evenings; 15215: 9; 15220: 9); ON, those episodes
collapse to a bridge and a walk home (15211: 1 ON
creek evening, rescued; 15220: 1, rescued).
The two still-refused villages are the familiar
shape from lackingline4: 15215 gets stranded on
day 7 for want of time (47 ticks), then strands
again days 8–9 for want of food (0 kcal) — a
village that gets caught out, runs down, and
still survives the month. 15009 strands once, on
day 13, for want of food (24 kcal) after three
stranded mornings.

What was missing, and what this run documents:
the wood-short line has now never played on four
consecutive lacking-line bands (woodcarry3's 5,
lackingline3's 18, lackingline4's 14, this run's
15 ON creek evenings — 52 evenings, wood 4 on
every one). The blank this run fills is the
diagnosis with a fresh 500-seed screen: it is not
that the screen was too small or the bank unlucky
— the carry-skip census shows the routes
themselves do not meet a creek evening. What is
still missing is a playable wood-short evening,
and the next prereg must either find a new honest
route in this census's negative space (a pile
that stays low, a wood-spending day, a load/starve
morning) or close the sub-claim as
unplayable-by-construction under the shipped
carry, on these grounds. Do not weaken the carry
to stage it.

Wall numbers: NOT OBSERVABLE on 30-day evening
legs (pre-seat, no field). National / table /
wins are reported as NOT OBSERVABLE, never as
zeros. No national, table, or win claim is made
or implied by this run. Wave reach on the banked
band: wave 1 in 10/10 villages, wave 2 in 10/10,
waves 3–5 not reached in this 30-day window.
Median survival is 30 days (all 10 survived the
window, both legs) — a ceiling effect of the short
window and the banking selection, not a survival
claim.

## Metric review (prereg doubts, answered; revisions for the NEXT run)

- Minimum-n 1 for existence, kept — and NOT met:
  0 staged evenings. No lowering, no re-scoring,
  no substitution (no ticks/kcal evening was
  used as a wood-short stand-in, and no rescued
  tail was read as a sense pass).
- The 500-seed screen, validated as a method:
  the screen yield (10 qualifiers, 2.0%) clears
  the 8-seed floor that lackingline2 missed, and
  the day-1 result (500/500 inside) is a finding
  in its own right, not a null: day 1 is a home
  day under competent nighttravel play, which
  kills the day-1 pile-floor route structurally
  on this policy, not just on this bank.
- Carry-skip census, new instrument, keep it:
  recording skip reasons per morning (not just
  evening classifications) is what lets this run
  close routes instead of merely counting zeros.
  Future wood-short preregs should keep the
  carry-skip census and add, if a route is ever
  proposed, the pile trajectory (daily pile
  values, not just carry mornings) and the pack-
  wood spend ledger (what, if anything, ever
  spends pack wood during a day out).
- Wood-short may be unplayable-by-construction
  under the shipped carry — this run's evidence
  is the strongest version of that claim yet
  (four bands, 52 ON creek evenings, all wood 4;
  both named routes measured and closed; the
  other two carry failures at zero on 300
  mornings). The next prereg should either name
  a concrete new route with a predicted signature
  in the pile/pack ledgers, or close the sub-claim
  on these grounds with a Steve-call note (the
  line text itself is unit-proven and harmless;
  an unplayed line variant is a small, honest
  gap, not a game defect). What the next prereg
  must NOT do is weaken the carry, drain the pile,
  starve kcal by hand, or re-screen ON legs
  hoping for a better draw.
- No balanced-panel compare .md is produced, as
  pre-registered: this is a 30-day position
  measurement of a policy-side lever with zero
  src/js changes, so there is no game-root delta
  for a panel to compare, and the panel's registry
  policies do not include the nighttravel trace
  policy. The determinism re-run is the
  instrument-perturbation proof, and the
  pre-registered bars above are the judge.

## Proof

`scripts/test-lackingline-woodshort-b.js` — all
checks green: screen recomputation (500 seeds,
60 OFF creek evenings, 10 qualifiers in screen
order, day-1 inside 500/500, errs 0); ON census
recomputation (15 creek, 4 still, 11 rescued,
skip kcal 3 / ticks 1 / wood 0, wood 4 on all 15);
carry-skip census (pile-floor 10 all day 1,
already-carrying 253, not-at-haven 12, kcal-floor
and cannot-carry absent, all 4 not-at-haven
same-day creek evenings at wood 4); OFF guard
(300 evenings, 0 lever lines); determinism
(15003 ON re-run byte-identical, staging dir
deleted). Run: `node scripts/test-lackingline-woodshort-b.js`.

## Landing

- Prereg: already committed (9fc0b98c2), not
  recommitted.
- This commit: analyzer
  (scripts/analyze-lackingline-woodshort-b.js),
  census JSON, screen OFF corpora (500 files),
  ON band corpora (10 files), evidence file
  (this file), proof script
  (scripts/test-lackingline-woodshort-b.js).
- Measurement only: no src/js change, no policy
  change, no wording change. No [needs-eyes]: no
  line was played, so no wording is judged.
- Report: committed, pending coordinator merge.
  Verdict INSUFFICIENT-DATA on pinned base
  d6723d3f, 0 wood-short still-refused ON creek
  evenings on a 10-seed bank from a 500-seed
  screen, with the carry-skip diagnosis above.
