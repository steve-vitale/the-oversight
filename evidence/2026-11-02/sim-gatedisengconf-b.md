# sim-gatedisengconf-b — PASS: STAND-DOWN + TREND RE-CONFIRMED ON A FRESH BAND, AND THIS TIME IT FIRES

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261102T1636Z,
arm sim-gatedisengconf-b, axis food-economy. Worktree
sim-gatedisengconf-b, branch sim-gatedisengconf-b.
RE-QUALIFICATION ONLY: zero src/js changes, zero
policy-default flips, zero edits to any existing script or
policy file. New files only, all named *-gatedisengconf-b.*.
The gatecover tracer, the gatediseng analyzer, and the
gatediseng-confirm evenings analyzer are REUSED VERBATIM,
never edited. This worker does NOT push, bump, verify live,
or merge into master; the coordinator merges.
Status to coordinator: committed on branch
sim-gatedisengconf-b, pending coordinator merge.

## Verdict: PASS — judged exactly against the carried prereg bar

Prereg: evidence/2026-11-02/sim-gatedisengconf-b-prereg.md,
commit c9df9812f, written and committed BEFORE any judged
sim (proof test 10/10 ran after the prereg commit but before
any judged application; the proof test is pure, uses no
judged seeds, and changes no prereg word; the reused proof
tests were also re-run green on current master before the
sweep: gatediseng 21/21, gatediseng-confirm 11/11).

Carried bar (quoted from
evidence/2026-11-01/sim-gatediseng-confirm-b-prereg.md):
survivor firing-seed rate <= 25% on the confirm band, PLUS
the in-time check on any collapsing trajectory. Result:

| leg | result | bar | outcome |
|---|---|---|---|
| Survivor firing-seed rate, band 76701-76712 | 2/12 = 16.7% | <= 25% | PASS |
| In-time check on collapsing trajectories | No collapsing seed on the band (12/12 survived) | Every collapsing seed fires >= 3 evenings before first starvation | VACUOUS — not re-tested on this band |
| Evenings-per-firing-seed | Raw evenings mean 5, median 5, max 6; warnings 1 per firing seed | Reported, not a bar (per prereg) | REPORTED — measured this time |
| Cross-check: evenings analyzer vs reused analyzer, first (c) firing | 0 mismatches on 12/12 seeds | Any mismatch = loud failure | PASS |
| Day-1 identity + determinism | Day-1 row present and numeric on 12/12; 76701 re-run byte-identical | Failure = substrate drift / INSUFFICIENT-DATA | PASS |

PASS means, per the carried prereg: rule (c) is CONFIRMED
on a second fresh band on current master and the deploy
spec in the confirm prereg stays deploy-ready — a future
arm may then make the deploy claim. PASS does not itself
deploy (c), does not change any default, and does not
re-prove timeliness: this band contains no collapsing
trajectory, so the in-time leg is NOT re-tested here
(51608's in-time firing, day 15 vs starvation day 21,
stands from gatediseng-b). What this band DOES add over
the 522 confirm — which fired zero times — is a real
firing measurement: (c) fires on 2 surviving villages,
with raw-evenings texture now measured instead of null.
That closes gatediseng metric review (3) as a measurement
gap for the first time (see metric review (1)).

## Q — THE CONFIRM BAND, SEED BY SEED (armed, 30d competent)

All 12 seeds verified first try (rows == daysAlive each:
30 x 12). No EPERM-flap retry needed, no seed re-run (the
76701 determinism re-run is a verification duplicate, not
a judged re-run), no line duplicated. Cross-check
mismatches: none.

| seed | end | wave | (c) first firing | (c) evenings | (c) warnings | disengaged evenings | why (c) fires / stays silent |
|---|---|---|---|---|---|---|---|
| 76701 | survived 30d | 2 | — | 0 | 0 | 0/30 | gate never stands down |
| 76702 | survived 30d | 3 | — | 0 | 0 | 0/30 | gate never stands down |
| 76703 | survived 30d | 3 | — | 0 | 0 | 0/30 | gate never stands down |
| 76704 | survived 30d | 3 | — | 0 | 0 | 0/30 | gate never stands down |
| 76705 | survived 30d | 3 | — | 0 | 0 | 6/30 | stretch 18-23, pantry RISING 3,862 -> 8,109 — no falling trend after S |
| 76706 | survived 30d | 2 | 18 | 6 (18,19,20,21,26,27) | 1 (day 18) | 16/30 | S = 15 (16,500) -> day 18 pantry 10,600, -35.8% |
| 76707 | survived 30d | 3 | — | 0 | 0 | 0/30 | gate never stands down |
| 76708 | survived 30d | 3 | — | 0 | 0 | 0/30 | gate never stands down |
| 76709 | survived 30d | 3 | — | 0 | 0 | 0/30 | gate never stands down |
| 76710 | survived 30d | 2 | — | 0 | 0 | 1/30 | single-evening stretch day 21 — no 3-fall window can form |
| 76711 | survived 30d | 3 | — | 0 | 0 | 6/30 | three single-evening stretches + stretch 28-30: only 2 falls after S, window needs a day 31 |
| 76712 | survived 30d | 2 | 9 | 4 (9,10,11,15) | 1 (day 9) | 25/30 | S = 6 (20,650) -> day 9 pantry 11,242, -45.6% |

Survivor firing-seed rate: 2/12 = 16.7%.
Evenings-per-firing-seed: raw counts [6, 4] — mean 5,
median 5, max 6; warning counts [1, 1] — mean 1, max 1.
The one-per-stretch counting rule works as specified:
76706's second fall run (days 26-27, after the day 22-23
bounce) issues NO second warning, and 76712's day-15
evening (pantry 4,431, -78.5% vs stand-down) likewise
issues nothing new — the stretch's single warning stands.

That the analyzer is alive on this band, not blind, is
shown by the other candidates on the same trajectories
(reused analyzer, reported for texture, NOT judged):
(a) TOTAL-SLIDE fires on 4/12 survivors (76705, 76706,
76711, 76712), (b) HYSTERESIS on 3/12 (76705, 76711,
76712), (d) FLOOR on 4/12 (76705, 76706, 76711, 76712).
So the band contains slide shapes and low stores — (c)
is quieter than its siblings by construction, not by
instrument failure. Note 76705 and 76711 fire (a)/(b)/(d)
but NOT (c): their slides happen while engaged or on
single evenings, and (c) counts only falls AFTER a
stand-down — the same structural difference the 522
confirm measured on 52206/52212.

WHY THE TWO FIRINGS ARE REAL (c) SHAPES, NOT FLICKER:
- 76706: the gate stands down day 15 at 16,500 and NEVER
  re-engages through day 30 (16 disengaged evenings).
  Days 15-21 fall every evening (16,500 -> 15,461 ->
  12,450 -> 10,600 -> 7,900 -> 6,860 -> 4,423); the day-18
  firing is the first evening with 3 falls after S AND
  >= 10% below S, and the fall continues past it. This
  is the 51608 shape with a surviving ending.
- 76712: the gate stands down day 6 at 20,650 and NEVER
  re-engages through day 30 (25 disengaged evenings, the
  longest stretch on any measured band). Days 6-11 fall
  every evening (20,650 -> 16,450 -> 14,450 -> 11,242 ->
  10,850 -> 10,450); the day-9 firing is -45.6% vs S, and
  the store keeps falling to 4,431 by day 15. The village
  then loses 3 people to starvation on days 22-23 (see
  below) and still survives — a firing that precedes real
  hunger deaths by 13 days on a village that ultimately
  survives. Per the prereg it counts as cost (a firing
  on a survivor), and that scoring is kept; the texture
  is reported so a future reader does not mistake it for
  a false alarm in the plain sense.

## Pooled texture (NOT judged — prereg bars are per-leg, as in gatediseng-b / gatediseng-confirm-b)

Survivor (c) firing rates across every measured band:
corpus 2/27, fresh pilot 2/8, confirm-522 0/12,
confirm-767 2/12 — pooled 6/59 = 10.2%. Pooling is reported
so a future reader can see the arithmetic, not as a
second verdict: the prereg judges the confirm band alone,
and the confirm band passes on its own (2/12).

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table /
wins — those are late-game states, and this sweep carries
no such fields. NO wall movement is claimed. In-window,
confirm band: 12/12 survived 30 days (median 30, max 30);
collapses 0/12; wave reach max 3 (8/12 reach wave 3;
4/12 reach wave 2); waves 4-5 not reached in 30 days
(expected — early window). Arc II/III/IV, regional ->
national, table, win flag: NOT REACHED IN WINDOW (0, as
expected — not a rate claim). National / table / wins: 0
both legs — there are no legs here (would-fire overlay,
armed only); the 0 is the in-window statement, not a
comparison.
Deaths across the band: 253 total — villager combat 179,
combat 29, expedition 15, monster 8, the wild 4, ambush 4,
a wound that wouldn't close 4, sickness 3, starvation 3,
contest 2, Grief Counselor 1, the expedition 1. The 3
starvation deaths are all on 76712 (days 22, 22, 23),
after its day-9 (c) firing; no other seed starves anyone.

## Sense test (SENSE-TESTING LAW: two firing evenings to judge)

(i) 76712, day 9 (the firing evening, pantry 11,242,
-45.6% vs the day-6 stand-down at 20,650): the village
says exactly one pantry line that evening — "You keep a
day's food (360 kcal) — nothing extra for the pantry this
time." The prereg's deploy line ("the shelves stopped
reading full days ago, and the store has kept falling
since. Nothing extra is reaching it.") would echo that
sentence's second half word-for-word in spirit, on an
evening when the store has fallen four evenings running
since the stand-down. The stand-down evening itself,
day 6, already speaks the thin-pack voice twice: "Hunger
gnaws. The pack is thin — work the green, haul it back,
get it named at camp. That's the whole game." and "You
keep a day's food (540 kcal) — nothing extra for the
pantry this time." A warning on day 9 would therefore
read as the village noticing in time, in words matching
the evenings around it — the same fit as 51608's day 15.
One qualification, stated not hidden: day 8 speaks an
optimistic counter-voice — "Owen looks at the pantry,
then at the Codex, then at you. 'We're going to make
it.' Haven will survive — because someone learned the
land, and wrote it down. One less thing to fear." A
warning on day 9 would sit beside that optimism, not
against the pantry voice — the village can believe it
will make it while its store falls, and the warning is
the part of it that is counting.
(ii) 76706, day 18 (the firing evening, pantry 10,600,
-35.8% vs the day-15 stand-down at 16,500): day 18 itself
is quiet on the pantry voice (its filtered lines carry
only the green-thumb debit), but the evenings around it
speak it steadily — day 16: "Hunger gnaws. The pack is
thin — work the green, haul it back, get it named at
camp. That's the whole game."; day 17: the same hunger
line plus "You keep a day's food (910 kcal) — nothing
extra for the pantry this time."; day 20: "You keep a
day's food (780 kcal) — nothing extra for the pantry
this time." A warning on day 18 would land inside that
run of thin-pack evenings, not against them — and the
hunger streak behind it (streak 6 on day 18, rising to 8
by day 20) is the village's own hunger count, not a
number the warning would need to name. The sense
judgment is unchanged from 51608 and 52206: the (c)
warning reads as the village noticing, and on 76712 it
notices 13 days before anyone starves.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's
inapplicability declaration (same reasoning as
gatediseng-b / gatediseng-confirm-b): this arm changes NO
game code, runs NO lever, and its primary metrics are
within-trajectory instrument diagnostics (would-fire
overlays on identical evening series), not panel metrics.
The tables above are reported directly in the evidence
file instead, on identical seeds and identical
trajectories.

## Metric review

(1) EVENINGS-PER-FIRING-SEED IS NOW MEASURED — AND THE
    NUMBER SAYS THE COUNTING RULE MATTERS. Raw evenings
    per firing seed: 6 and 4 (mean 5). Without the
    one-per-stretch rule, (c) would speak 4-6 evenings
    per firing village; with it, it speaks exactly once.
    The 522 confirm's worry (a rule that fires nightly
    vs once is a different cost) is now answered with a
    number: the raw shape repeats, the issued warning
    does not. A future deploy arm should quote both
    numbers side by side (raw 5 mean, issued 1), never
    the raw count alone as a spam claim.
(2) 2/12 DOES NOT PROVE A TRUE RATE, AND THE BAND IS
    STILL GATE-QUIET IN THE SAME WAY. Seven of 12 seeds
    never stand down at all, and the two firings come
    from the only two long disengaged stretches on the
    band (16 and 25 evenings). The pooled 6/59 = 10.2%
    across corpus + pilot + both confirms is the better
    cost picture to quote, with the per-leg bars kept
    separate for judging. A future arm that wants a
    stronger confirm should still pick its band for
    disengagement exposure rather than re-running a blind
    fresh band — but that selection rule belongs to that
    arm's prereg, not to a re-score of this one.
(3) TIMELINESS STILL RESTS ON 51608 ALONE. Two bands in
    a row (522, 767) contain zero collapsing seeds, so
    the in-time leg has now been vacuous twice. The
    deploy decision still carries single-village
    timeliness evidence (day 15 vs starvation day 21).
    76712 sharpens the question without answering it: a
    (c) firing 13 days before starvation deaths on a
    village that SURVIVES is consistent with "warns in
    time" but is not a collapse averted, and must not be
    cited as one.
(4) No metric, threshold, seed, leg, or rule definition
    was changed mid-run. Prereg committed (c9df9812f)
    before any judged sim; the proof test (10/10) ran
    after the prereg commit and before any judged
    application, uses no judged seeds, and changes no
    prereg word (one proof-test fix before any judged
    application corrected a wrong expected value in a
    synthetic check — the test's own arithmetic, not the
    analyzer or the prereg); the confirm sweep verified
    rows == daysAlive on all 12 seeds first try; the
    evenings analyzer's first firing matches the reused
    analyzer on all 12 seeds; the day-1 identity check
    passed on all 12 seeds and the 76701 determinism
    re-run was byte-identical. The verdict is judged only
    against the carried prereg header.

## Village assessment (plain words)

Twelve new villages, and this time the patient rule
speaks — twice, and both times it earns the word. One
village's warning switch goes quiet on day 15 and its
store falls every single evening after, from sixteen
thousand down past four thousand; the rule waits for the
fall to prove itself, then speaks once on day 18 and
never nags again, even when the store falls a second
time. Another village's switch goes quiet on day 6 and
stays quiet for twenty-five evenings while its store
falls by nearly half in three days; the rule speaks once
on day 9, and thirteen days later three people starve —
the village survives, but the warning was not crying
over nothing. The other ten villages say nothing, and
rightly: seven never go quiet at all, one goes quiet
while its store climbs, one for a single evening, one
for three evenings that end before any trend can form.
Nothing here reaches national, the table, or a win — that
wall was never this run's question, and it did not move.
The blank filled: the patient rule now has a second fresh
band behind it, and for the first time the evenings
number behind its single warning — five raw evenings of
falling store, one spoken warning. What still rests on a
single village is whether it speaks in time on a village
that actually dies: that question has now gone unanswered
on two bands in a row, because no village on either band
died.

## Findings for the coordinator (to append to the backlog)

- (c) STAND-DOWN + TREND RE-CONFIRMED on a second fresh
  band on current master (confirm band 76701-76712:
  2/12 survivor firings = 16.7%, PASS per the carried
  bar; in-time leg vacuous, no collapsing seed; 0
  analyzer cross-check mismatches). Deploy spec from
  the 522 confirm prereg stays deploy-ready; this arm
  deploys nothing.
- Evenings-per-firing-seed MEASURED for the first time
  (gatediseng metric review 3, now closed as a
  measurement): raw evenings [6, 4], mean 5, median 5,
  max 6; issued warnings [1, 1]. The one-per-stretch
  counting rule is what keeps a 5-evening falling shape
  to a single spoken warning.
- Timeliness re-confirm STILL OWED (third statement of
  the gap, now with two vacuous bands behind it): the
  767 band had zero collapsing seeds, so 51608 remains
  the sole in-time evidence (day 15 vs starvation day
  21). 76712's day-9 firing 13 days before starvation
  deaths on a SURVIVING village is texture, not a
  collapse averted, and must not be cited as one.
- Observation (not a (c) miss): 76712's gate stands down
  day 6 and never re-engages for 25 evenings while the
  village survives to day 30 — the longest disengaged
  stretch measured on any gatediseng band. Filed for the
  coordinator, not chased mid-run.

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT INDEX CLOBBER (same known class): after
  commit c9df9812f the main index showed the committed
  prereg as a staged deletion alongside the worktree copy.
  Repaired via git update-index --add --cacheinfo from the
  HEAD blob, then verified tracked status clean and
  worktree hash matches HEAD. The commit itself was
  correct throughout. The proof-test commit (5ad3d7a7d)
  did NOT clobber.
- FULL `git status` (with untracked scan) STALLS on this
  worktree (as in gatediseng-b / gatediseng-confirm-b);
  the tracked-only `git status --porcelain
  --untracked-files=no` returns in ~1s and was used for
  all verification.
- CONFIRM SWEEP CLEAN, FIRST TRY EVERY SEED: all 12
  confirm seeds verified on first try (rows == daysAlive
  each: 30 x 12); no EPERM-flap retry was needed, no seed
  was re-run for judging, no line was duplicated. The
  76701 determinism re-run (verification only) was
  byte-identical to the swept line.
- FRESHNESS VERIFICATION: seed-field scan (exact
  "seed":76701-76712 fields, both spellings) over all of
  evidence/*.jsonl and *.json, plus whole-word .md grep
  over evidence/2026-11-02/ — both clean before the
  prereg was written (only range-string mentions in
  coordinator next-blank lists). Confirm seeds
  76701-76712 are now consumed by this run.
- check.js --quick NOT re-run: zero src/js, zero
  green-list files on this arm; nothing here touches the
  runtime.

## Files

- Prereg: evidence/2026-11-02/sim-gatedisengconf-b-prereg.md
  (commit c9df9812f, before any judged sim)
- Proof test: scripts/test-gatedisengconf-b.js (10 pure
  checks, no judged seeds; commit 5ad3d7a7d)
- Evidence: evidence/2026-11-02/sim-gatedisengconf-b.md (this file)
- Corpora: evidence/2026-11-02/sim-gatedisengconf-b-armed.jsonl
  (12 lines, seeds 76701-76712, armed only, gatecover
  tracer verbatim),
  evidence/2026-11-02/sim-gatedisengconf-b-summary.json
  (confirm analysis + verdict),
  evidence/2026-11-02/sim-gatedisengconf-b-gatediseng-summary.json
  (reused-analyzer summary, all four candidates),
  evidence/2026-11-02/sim-gatedisengconf-b-sweep.log
  (per-seed tracer stderr)
- Reused verbatim, never edited: scripts/trace-gatecover-b.js,
  scripts/analyze-gatediseng-b.js,
  scripts/analyze-gatediseng-confirm-b.js,
  scripts/policies/competent.js
- Consumed by this run (no longer fresh): confirm 76701-76712
