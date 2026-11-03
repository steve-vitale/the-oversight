# sim-sensorredesign-b — PILOT-GO: THE ENVELOPE RULE WARNS ON ALL FOUR COLLAPSING SEEDS AND BEATS (c) ON ALL FOUR, AT ZERO PILOT-SURVIVOR COST

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T013651Z,
arm sim-sensorredesign-b, axis food-economy. Worktree
sim-sensorredesign-b, branch sim-sensorredesign-b.
MEASUREMENT ONLY: zero src/js changes, zero policy-default
flips, zero edits to any existing script or policy file.
New files only, all named *-sensorredesign-b.*. The
gatecover tracer, the gatediseng analyzer, and the
competent policy are REUSED VERBATIM, never edited. This
worker does NOT push, bump, verify live, or merge into
master; the coordinator merges.
Status to coordinator: committed on branch
sim-sensorredesign-b, pending coordinator merge.

## Verdict: PILOT-GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-02/sim-sensorredesign-b-prereg.md,
commit 03d4215682bf, written and committed BEFORE any
judged sim (proof test 13/13 ran after the prereg commit
but before any judged application; the proof test is
pure, uses no judged seeds, and changes no prereg word;
the reused proof tests were also re-run green on current
master before the pilot: gatediseng 21/21,
gatediseng-confirm 11/11).

Base at pilot: 90637bc7c (worktree tip; the tools commit
eea7903c33 sits on top of the prereg commit, zero game
code between base and pilot). The pilot re-ran all 8
seeds FRESH on this base via the verbatim tracer.

| leg | result | bar | outcome |
|---|---|---|---|
| Timeliness: (e*) fires on collapsing seeds | 4/4 | 4/4 | PASS |
| Timeliness: lead_e >= lead_c | 4/4 | 4/4 | PASS |
| Timeliness: lead_e > lead_c (strict) | 4/4 | >= 2/4 | PASS |
| Cost: (e*) fires on pilot survivors | 0/4 | <= 1/4 | PASS |
| Cross-check: thin (c) vs reused (c), first firing | 0 mismatches on 8/8 | Any mismatch = INSUFFICIENT-DATA | PASS |
| Tracer verification | rows == daysAlive on 8/8, first try | Failure = INSUFFICIENT-DATA | PASS |
| Base-equality control | 7/8 byte-identical to archived lines; 79001 drifted (see below) | Drift with membership preserved = report, judge on fresh lines | HELD — judged on fresh lines, drift reported |

PILOT-GO means, per the prereg: the shape earns a
FRESH-band confirm (12-16 seeds including a fresh
collapsing screen). It does NOT deploy (e*), and no
deploy claim may cite this pilot alone — the rule
shape was iterated on archived bands (prereg
design-honesty note), so this pilot judges it on a
known band, not a fresh one.

## Q — THE PILOT, SEED BY SEED (8 seeds, 30d competent, fresh on current base)

Reference day = first starvation death day (all four
collapsing seeds are starvation-class). Lead = reference
day - firing day. No-fire counts as worse than any
firing for the lead-vs-(c) legs.

| seed | end | ref | (c) firing | lead_c | (e*) firing | clause | lead_e | beats (c)? |
|---|---|---|---|---|---|---|---|---|
| 79006 | lost day 24 | 23 | — (never) | — | 22 | E2-cliff | 1 | YES (never -> 1) |
| 79019 | lost day 25 | 20 | 19 | 1 | 18 | E1-envelope | 2 | YES (+1) |
| 79031 | lost day 22 | 20 | — (never) | — | 20 | E2-cliff | 0 | YES (never -> 0) |
| 79064 | lost day 26 | 25 | 20 | 5 | 19 | E1-envelope | 6 | YES (+1) |
| 79001 | survived 30d | — | 22 | — | — | — | — | cost: (e*) silent |
| 79002 | survived 30d | — | — | — | — | — | — | cost: both silent |
| 79003 | survived 30d | — | — | — | — | — | — | cost: both silent |
| 79004 | survived 30d | — | — | — | — | — | — | cost: both silent |

How the shape earns each collapsing seed, in one line
each:
- 79006 (cliff): stand-down day 21 at 7,560, one fall to
  4,585 day 22 — E2 fires on the 35%-below-peak drop
  (0.607 <= 0.65) where (c) could never get its third
  fall. Lead 1: one evening before people starve.
- 79019 (bounce): stand-down day 15 at 9,850, day-16
  rise to 9,910 raises the peak instead of restarting
  the count; falls days 17-18 reach 7,060, and E1 fires
  day 18 (2 cumulative falls, 7,060 <= 0.90 * 9,910),
  one evening earlier than (c)'s day 19. Lead 2.
- 79031 (cliff): stand-down day 19 at 6,950, one fall
  to 2,500 day 20 — E2 fires the same evening people
  start starving (lead 0). It does not warn in time,
  and that is stated, not hidden: it beats (c)'s
  silence, but a lead-0 warning is a death-knell, not
  a rescue. The shape covers the seed; it does not
  save it.
- 79064 (bounce + 51608-class): stand-down day 15 at
  8,853, two-evening recovery to 10,284 raises the
  peak; falls days 18-19 reach 8,140, and E1 fires day
  19 (2 falls, 8,140 <= 0.90 * 10,284), one evening
  earlier than (c)'s day 20 — reaching lead 6, the
  51608-class margin (c) missed by one evening on this
  seed in the collapseband band.

Secondary (reported, NOT judged): collapsing seeds
with lead_e >= 1: 3/4 (79031 at lead 0 is the miss).
Mean lead_e on collapsing seeds: 2.25 (n = 4). Mean
lead_c over its FIRING seeds only: 3.0 (n = 2) — this
secondary mean favors (c) only because (c) fires
solely on the two easier seeds; it is reported to
show why the pairwise legs, not the means, are the
judged comparison (see metric review (2)).

## Base-equality control + substrate drift (loud, as prereg required)

7 of 8 fresh pilot lines are byte-identical to their
archived collapseband screen lines (all four collapsing
seeds, plus survivors 79002, 79003, 79004). Survivor
79001 DRIFTED: its fresh trajectory diverges from the
archived line starting day 8 (fresh day-8 pantry
21,250 vs archived 21,600; fresh day 8 learns a Night
Court counter and gathers 530 kcal, archived day 8
takes a Highbeam Deer mauling and gathers 920 kcal;
fresh maxWave 2 vs archived 3; deaths lists differ in
detail though both count 21 deaths; sayLines 2,871 vs
2,805). Collapse membership is PRESERVED (still a
30-day survivor), so per the prereg the legs are judged
on the fresh lines and the drift is reported, not
hidden — but the drift is itself a finding: game-code
movement between the collapseband base and this base
changed one seed's whole trajectory from day 8 on.
Notably the drift flips BOTH rules' readings on 79001:
archived, (c) never fired and (e*) fired day 19 (E2);
fresh, (c) fires day 22 and (e*) never fires. Any arm
that reuses archived trajectories across a base move
without this control step risks judging stale
trajectories. The pilot cost leg (0/4) is on fresh
lines; on archived lines it would have been 1/4
(79001 firing) — still within the bar, but a different
number, and the difference is disclosed here.

## Full-band context rates (NOT judged — archived trajectories, reported alongside)

With the streak gate, (e*) vs (c) survivor firing rates
on already-published bands (both rules on identical
archived trajectories):
- 790 screen (60 survivors): (e*) 9/60 = 15.0% vs (c)
  5/60 = 8.3%. (e*) roughly doubles (c)'s cost on this
  band but stays inside the carried <= 25% bar.
- 767 confirm band (12 survivors): (e*) 2/12 = 16.7%
  vs (c) 2/12 = 16.7% — the SAME two seeds (76706,
  76712), firing 1-2 evenings earlier (76706 day 17 vs
  18; 76712 day 11 vs 9 — later on 76712, because the
  streak gate holds day 8's streak-0 evening).
These context rates are why the pilot cost leg (n = 4)
must not be over-read: the honest cost picture is
15-17% on full bands, not 0% on four seeds.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table /
wins — those are late-game states, and this pilot
carries no such fields. NO wall movement is claimed.
In-window, pilot band: 4/8 survived 30 days (median
daysAlive 28, max 30); collapses 4/8 (by pilot design,
not a rate); wave reach max 3 (3/8 reach wave 3, 5/8
reach wave 2); waves 4-5 not reached in 30 days
(expected — early window). Arc II/III/IV, regional ->
national, table, win flag: NOT REACHED IN WINDOW (0,
as expected — not a rate claim). National / table /
wins: 0 in-window (stated, not a comparison).
Deaths across the pilot: 168 total — villager combat
105, starvation 18, expedition 9, sickness 8, combat 7,
the wild 7, monster 5, wound 4, ambush 3, the Union Rep
1, a dog-shaped silence at the treeline 1. The 18
starvation deaths split 17 on the 4 collapsing seeds
and 1 on survivor 79003 — the 76712 shape recurring
(starve people and live).

## Sense test (SENSE-TESTING LAW: (e*) firing evenings, fresh lines, judged)

(i) 79019, day 18 (E1 firing, pantry 7,060, streak 6,
freshDays 1.88): the evening speaks the thin-pack voice
— "You keep a day's food (270 kcal) — nothing extra
for the pantry this time." Day 17 spoke it too (1,350
kcal) beside a 1,350-kcal haul — the bounce texture,
a good evening inside a falling store. A warning on day
18 would land on the thinnest pack line yet, two
evenings before anyone starves, in words matching the
evenings around it. This is the shape working as
designed: the bounce did not silence it, and the
village's own hunger count (streak 6) agrees.
(ii) 79064, day 19 (E1 firing, pantry 8,140, streak 1,
freshDays 2.60): "You keep a day's food (90 kcal) —
nothing extra for the pantry this time." plus "The
pantry is in the hall. Your hands are not." — the
thinnest pack line on the seed to that point, six days
before starvation. A warning here reads as the village
noticing early, in its own thin-pack words.
(iii) 79006, day 22 (E2 firing, pantry 4,585, streak 4):
ZERO pantry/hunger lines that evening (0 of 20), and
zero on day 21 too — the cliff evenings are silent,
exactly as collapseband-b found. A warning on day 22
would NOT match surrounding words, because there are
none; it would be the only pantry voice in the cliff.
That is reported, not smoothed over: the warning's
job here is to break a silence, not to echo a voice —
and a one-evening warning before starvation is thin
rescue either way. The number is true (store halved,
streak 4); the voice fit is absent.
(iv) 79031, day 20 (E2 firing, pantry 2,500, streak 2):
the hunger voice IS speaking — "Hunger gnaws. The
pack is thin — work the green, haul it back, get it
named at camp. That's the whole game." beside the
1,350-kcal thin-pack line — but it speaks on the very
evening two people starve. A warning here lands
alongside the hunger voice, not ahead of it: it reads
as noticing at the moment of death. The sense judgment
matches the number (lead 0): real, but tardy.
(v) Villagers act like people in the surrounding
transcript (sampled, not just counted): barter by the
fire, mending, identification attempts on unknown
shoots ("Nothing they can name with confidence"), a
leadership challenge, counter-learning told at the
fire. The collapse evenings are not robotic — they are
quiet or hungry in ways that match the pantry numbers.
What was missing on the cliffs was a warning voice,
and (e*) supplies one (late on 79031, one evening
early on 79006).

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's
inapplicability declaration (same reasoning as
collapseband-b): this arm changes NO game code, runs
NO lever, and its primary metrics are within-trajectory
instrument diagnostics (would-fire overlays on
identical evening series), not panel metrics. The
tables above are reported directly in the evidence
file instead, on identical seeds and identical
trajectories.

## Metric review

(1) THE PILOT COST LEG (n = 4) IS TOO SMALL TO CARRY
    A COST CLAIM, AND THIS PILOT DOES NOT PRETEND
    OTHERWISE. 0/4 on fresh lines (1/4 on archived
    lines for the same seeds) is consistent with the
    full-band context (15-17%), not evidence of a 0%
    rate. The fresh-band confirm must carry its own
    cost leg on >= 12 survivors, judged against the
    carried <= 25% bar — the pilot's cost leg is a
    screen, not a rate.
(2) MEAN LEADS MISLEAD WHEN COVERAGE DIFFERS. Mean
    lead_c over firing seeds (3.0, n = 2) exceeds mean
    lead_e (2.25, n = 4) while (e*) beats (c) pairwise
    on all four seeds — because (c)'s mean excludes
    its two silences. The pairwise legs (fired? beats
    or ties? strictly beats?) are the correct
    comparison for a coverage-unequal pair, and the
    next arm's prereg should keep them, not revert to
    means.
(3) LEAD 0 IS COVERAGE, NOT TIMELINESS. 79031's lead-0
    firing passes the prereg's beats-(c) legs (never
    -> 0 is strictly better) but is not "in time" in
    any playable sense. The next arm's prereg should
    add a lead >= 1 leg for collapsing seeds
    alongside the beats-(c) legs, so a future shape
    cannot GO on death-knells alone. This pilot's
    verdict stands as judged (the prereg's legs are
    the prereg's legs), with 3/4 at lead >= 1 stated
    as the secondary that names the gap.
(4) THEORETICAL GAP, NOT A PILOT FINDING: (e*)'s peak
    anchor can in principle fire while pantry is still
    ABOVE the stand-down level (a rise then a 10%
    dip from the new peak, with hunger present). No
    archived firing on any measured band (790 screen,
    767, 522-pilot subset) has pantry above S — every
    checked firing is below its stand-down level —
    so the gap is unobserved, but the deploy wording
    for (e*) must be peak-anchored ("fallen from its
    recent high"), never stand-down-anchored, or the
    first such firing will read as a false statement.
    A future arm may add a pantry-below-S condition;
    that change belongs to its prereg, not to a
    re-score of this one.
(5) SUBSTRATE DRIFT IS NOW A MEASURED PHENOMENON, NOT
    A WARNING: 1 of 8 pilot seeds changed trajectory
    across the base move (79001, from day 8). The
    base-equality control step in this prereg caught
    it; arms that skip that step and reuse archived
    trajectories across a base move are judging stale
    data. The control step should stay mandatory.
(6) No metric, threshold, seed, leg, collapse
    definition, or rule definition was changed mid-run.
    Prereg committed (03d4215682bf) before any judged
    sim; the proof test (13/13) ran after the prereg
    commit and before any judged application, uses no
    judged seeds, and changes no prereg word; the
    pilot verified rows == daysAlive on all 8 seeds
    first try; the thin analyzer's (c) first firing
    matches the reused analyzer on all 8 seeds; the
    day-1 identity check passed on all 8 seeds (day-1
    rows present and numeric). The verdict is judged
    only against the prereg header.

## Village assessment (plain words)

Eight villages, and for the first time the warning
rule speaks on every village that dies. Two villages
fall off a cliff: on one, the rule speaks the evening
before people starve, on the store halving to almost
nothing; on the other, it speaks on the very evening
people start dying — late, but no longer silent, where
the old rule said nothing at all. Two villages bounce:
their store ticks up after the warning switch goes
quiet, which used to restart the old rule's count and
make it late; the new rule counts the falls anyway,
so it speaks a day earlier on both — and on one of
them, a full six days before anyone starves, the best
margin this rule family has ever shown. The four
villages that live hear nothing from the new rule,
though the old rule speaks once among them on the
re-run. Nothing here reaches national, the table, or
a win — that wall was never this run's question, and
it did not move. The blank filled: a rule shape that
can see a cliff and a bounce, where the old rule was
blind to both. What it still owes is proof on villages
it was never tuned against — a fresh band, with its
own collapsing villages, before anyone claims this
rule is safe to deploy.

## Findings for the coordinator (to append to the backlog)

- (e*) PILOT-GO on the known collapsing band (fresh
  re-run, current base): fires 4/4 collapsing seeds
  (leads 1, 2, 0, 6) vs (c)'s 2/4 (leads 1, 5); beats
  (c) strictly on 4/4; pilot-survivor cost 0/4 fresh
  (1/4 archived). Earns a fresh-band confirm; does
  NOT deploy; no deploy claim may cite this pilot
  alone (shape iterated on archived bands, prereg
  design-honesty note).
- SUBSTRATE DRIFT, MEASURED: survivor 79001's
  trajectory diverges from its archived line from day
  8 on the current base (fresh pantry 21,250 vs
  archived 21,600 day 8; different events after;
  maxWave 2 vs 3). Membership preserved (still a
  30-day survivor); legs judged on fresh lines. The
  drift flips both rules' readings on that seed
  ((c) never -> day 22; (e*) day 19 -> never).
  Base-equality control step must stay mandatory.
- LEAD-0 COVERAGE GAP (metric review (3)): 79031's
  lead-0 E2 firing passes beats-(c) legs but is not
  "in time" in any playable sense. Next (e*) prereg
  should add a lead >= 1 leg alongside beats-(c).
- ABOVE-S PEAK-ANCHOR GAP (metric review (4),
  theoretical, unobserved): (e*) can in principle fire
  while pantry is still above its stand-down level;
  no measured firing does. Deploy wording must be
  peak-anchored if (e*) ever deploys.
- CONTEXT COST RATES (not judged): (e*) survivor
  firing 9/60 = 15.0% on the 790 screen and 2/12 =
  16.7% on 767 (same two seeds as (c)) vs (c)'s 5/60
  = 8.3% and 2/12 = 16.7%. The honest cost picture is
  15-17%, not the pilot's 0/4.

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT + TOOLS-COMMIT INDEX CLOBBER (same
  known class): after commits 03d4215682bf and
  eea7903c33 the main index showed the committed files
  as staged deletions alongside the worktree copies.
  Repaired both times via git update-index --add
  --cacheinfo from the HEAD blobs, then verified
  tracked status clean and worktree hashes match HEAD.
  The commits themselves were correct throughout.
- FULL `git status` (with untracked scan) STALLS on
  this worktree (as in prior gatediseng arms); the
  tracked-only `git status --porcelain
  --untracked-files=no` returns in ~1s and was used
  for all verification.
- PILOT CLEAN, FIRST TRY EVERY SEED: all 8 pilot
  seeds verified on first try (rows == daysAlive
  each: 24, 25, 22, 26, 30, 30, 30, 30); no EPERM-flap
  retry was needed, no seed was re-run for judging.
  Per-seed tracer cost ~7s; the 8-seed sweep ran 53s.
- check.js --quick NOT re-run: zero src/js, zero
  green-list files on this arm; nothing here touches
  the runtime.

## Files

- Prereg: evidence/2026-11-02/sim-sensorredesign-b-prereg.md
  (commit 03d4215682bf, before any judged sim)
- Proof test: scripts/test-sensorredesign-b.js (13 pure
  checks, no judged seeds; commit eea7903c33)
- Thin analyzer: scripts/analyze-sensorredesign-b.js
  (imports the reused analyzer for (c); commit
  eea7903c33)
- Evidence: evidence/2026-11-02/sim-sensorredesign-b.md (this file)
- Corpora: evidence/2026-11-02/sim-sensorredesign-b-pilot.jsonl
  (8 lines, seeds 79006/79019/79031/79064 +
  79001/79002/79003/79004, fresh on current base),
  evidence/2026-11-02/sim-sensorredesign-b-summary.json
  (thin-analyzer pilot summary + verdict),
  evidence/2026-11-02/sim-sensorredesign-b-sweep.log
  (per-seed tracer stderr)
- Reused verbatim, never edited: scripts/trace-gatecover-b.js,
  scripts/analyze-gatediseng-b.js,
  scripts/policies/competent.js
- Consumed by this run (no longer fresh): none — the
  pilot re-runs already-consumed seeds by design
  (identical-seed before/after); no fresh band was
  screened.
