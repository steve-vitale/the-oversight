# sim-gatediseng-b — DIAG-GO: ONE DISENGAGED-STATE CANDIDATE PASSES BOTH LEGS (STAND-DOWN + TREND)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T2030Z,
arm sim-gatediseng-b, axis food-economy. Worktree sim-gatediseng-b,
branch sim-gatediseng-b. DIAG ONLY: zero src/js changes, zero
policy-default flips, zero edits to any existing script or policy
file. New files only, all named *-gatediseng-b.*. The gatecover
tracer, the dipslide/falsefire analyzers, and the competent
policy are REUSED VERBATIM, never edited. This worker does NOT
push, bump, verify live, or merge into master; the coordinator
merges.
Status to coordinator: committed on branch sim-gatediseng-b,
pending coordinator merge.

## Verdict: DIAG-GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-01/sim-gatediseng-b-prereg.md, commit
b455d698bc10a70bd0d109b08dade3e32f8ce621, written and committed
BEFORE any judged analysis (proof test 21/21 ran after the
prereg commit but before any judged application; the proof test
is pure, uses no judged seeds, and changes no prereg word).

DIAG-GO requires at least one candidate PASS (in-time firing on
51608 AND corpus surviving firing-seed rate <= 25% AND fresh-
pilot surviving firing-seed rate <= 25%). Exactly one candidate
passes all three:

| candidate | 51608 firing day (days before first starvation, day 21) | corpus survivors firing | fresh pilot survivors firing | verdict |
|---|---|---|---|---|
| (a) TOTAL-SLIDE | 10 (11 days before) | 5/27 = 18.5% | 4/8 = 50.0% | PARTIAL — pilot leg fails |
| (b) HYSTERESIS (freshDays > 2) | 10 (11 days before) | 4/27 = 14.8% | 4/8 = 50.0% | PARTIAL — pilot leg fails, plus D+5 gap below |
| (c) STAND-DOWN + TREND | 15 (6 days before) | 2/27 = 7.4% | 2/8 = 25.0% | PASS |
| (d) FLOOR (< 10,000) | 12 (9 days before) | 3/27 = 11.1% | 3/8 = 37.5% | PARTIAL — pilot leg fails |

DIAG-GO means: candidate (c) is NAMED as the disengaged-state
rule a future adoption prereg can take up, with the thin-margin
caveat in metric review (1). It does NOT mean (c) is adopted,
deployed, or proven to save a village — a would-fire overlay on
as-run trajectories cannot show that, and adoption needs a
design decision plus a future adoption prereg. Candidates (a),
(b), (d) are measured, not killed: each fires in time on 51608
and passes the corpus leg, and each fails only on the fresh
pilot leg. A future arm may re-measure them on a confirm band;
it may not re-score this arm's bars.

## Q — THE CANDIDATES ON 51608 (what condition fired)

First starvation death on 51608: day 21 (Leo, starvation).
In-time bar: firing day <= 18. All four fire in time.

- (a) TOTAL-SLIDE, day 10, pantry 13,210, disengaged
  (freshDays 3.97, streak 0). 5-evening fall: day 5's 21,076 ->
  day 10's 13,210 = -37.3% (>= 20%). Three consecutive falls
  ending day 10: 18,610 -> 18,485 -> 15,200 -> 13,210. This is
  the flicker evening: the gate is off on day 10 while the
  fresh slice sits just under the 4-day line, and the total
  slide shape is already unmistakable.
- (b) HYSTERESIS, day 10, freshDays 3.97, streak 0, gateOn
  true, disengaged. The lowered 2.0-day line re-engages the
  gate on the same flicker evening as (a) — the first
  disengaged evening at or after day 8 meeting freshDays >
  2.0 with streak < 3. SECONDARY D+5 CHECK (preregged, not
  a bar): the day-11 candidate's D+5 evening, day 16, reads
  freshDays 1.72, streak 0, gateOn true — BELOW the 2.0 line,
  so day 16 is NOT engaged even under hysteresis, and the
  day-11 candidate STILL cannot confirm under hysteresis
  counting alone. Hysteresis re-engagement evenings on
  51608 (disengaged, freshDays > 2, streak < 3, gateOn):
  days 5, 6, 7, 10, 12, 13, 14, 15 — the re-engaged run after
  the final stand-down is days 12-15, and it breaks on day
  16, one evening before it could carry the confirmation.
  So (b) is PARTIAL twice over: it fails the pilot rate
  bar, and its gate re-engagement does not by itself rescue
  the warning that 51608 actually needed.
- (c) STAND-DOWN + TREND, day 15, stand-down day 12
  (pantry 9,483) -> day 15 pantry 7,535 = -20.5% (>= 10%).
  Three consecutive falls ending day 15, all after the
  stand-down: 9,483 -> 9,025 -> 8,295 -> 7,535. This is the
  only candidate whose firing waits for the FINAL stand-down
  rather than a flicker: the day 5-7 flicker stretch has
  only 2 falls before re-engagement, and the day-10 stretch
  is a single evening, so neither trips (c). Day 15 is 6
  evenings before the first starvation death — in time with
  margin to spare, and late enough that the slide is no
  longer flicker noise.
- (d) FLOOR, day 12, pantry 9,483 < 10,000, disengaged
  (freshDays 3.39, streak 0). The stand-down evening itself:
  the store crosses the round floor on the very evening the
  gate stands down for the last time. 9 evenings before the
  first starvation death.

Cross-check: the 51608 firing days are IDENTICAL whether
computed from the falsefire pilot rows or from the gatecover
trace rows (a 10, b 10, c 15, d 12); the trace version
additionally confirms gateOn true directly, while the
corpus-row version of (b) carries the prereg's assumed-
gateOn flag. The pooled corpus census below uses the
falsefire rows (28 seeds, no double count); the trace is
the diagnostic cross-check, not a second seed.

## Corpus census (existing files, no re-runs; 28 seeds, 27 survivors)

Firing seeds only; every other corpus survivor fires on no
candidate. Firing-evening condition values are quoted so the
cost is auditable, not just counted.

| seed | (a) day / condition | (b) day / condition | (c) day / condition | (d) day / condition |
|---|---|---|---|---|
| 51315 (survived; starvation death day 30) | 23: 4,200, -71.3% over 5 ev | 22: freshDays 2.94, streak 0 | 25: S=22 (7,600) -> 600, -92.1% | 22: 7,600 |
| 51323 | 20: 11,118, -46.9% | 20: freshDays 3.34, streak 2 | — | — |
| 51327 | 25: 20,100, -29.7% (streak 3 that evening) | — | — | — |
| 51330 | 11: 17,838, -26.1% | 19: freshDays 3.90, streak 1 | 22: S=19 (9,450) -> 6,582, -30.3% | 19: 9,450 |
| 51606 | 23: 7,450, -68.3% | 23: freshDays 3.52, streak 0 | — | 23: 7,450 |

Corpus surviving firing-seed rates: (a) 5/27 = 18.5%, (b)
4/27 = 14.8%, (c) 2/27 = 7.4%, (d) 3/27 = 11.1%. All four
pass the corpus leg (<= 25%).

Texture worth naming: 51315's (c) firing (day 25, pantry 600)
lands 5 evenings before that seed's own day-30 starvation
death on a seed that ultimately survives — a would-fire
warning that reads, in hindsight, like a true warning about
a village that nearly emptied its store, not a false alarm.
The cost metric counts it as cost (a firing on a survivor),
per the prereg; metric review (2) carries the scoring
question this raises. 51327's (a) firing is the corpus's
oddest: it fires on a hunger-exempt evening (streak 3,
freshDays 12.44) — a slide shape on a pantry that reads
plentiful on the fresh slice, which is exactly the shape
(a) was built to catch while the gate is off for hunger.

## Fresh pilot (new sims, seeds 52101-52108, armed, 30d competent)

All 8 seeds verified first try (rows == daysAlive each: 30
x 8). No EPERM-flap retry needed. The tracer is reused
verbatim from gatecover; gateOn is recorded directly on
every pilot row, so pilot (b) firings carry no assumption.

| seed | end | wave | (a) | (b) | (c) | (d) |
|---|---|---|---|---|---|---|
| 52101 | survived 30d | 2 | — | 25: freshDays 3.27, streak 0, pantry 7,364 | — | 25: 7,364 |
| 52102 | survived 30d | 2 | 24: 15,906, -23.5% | — | 29: S=24 (15,906) -> 12,567, -21.0% | — |
| 52103 | survived 30d | 1 | 30: 7,271, -42.6% | 30: freshDays 3.61, streak 0 | — | 30: 7,271 |
| 52104 | survived 30d | 2 | 21: 14,000, -39.7% | 21: freshDays 3.73, streak 0 | 24: S=21 (14,000) -> 11,965, -14.5% | 28: 7,650 |
| 52105 | survived 30d | 2 | — | — | — | — |
| 52106 | survived 30d | 2 | 27: 10,700, -51.4% | 27: freshDays 3.45, streak 1 | — | — |
| 52107 | survived 30d | 2 | — | — | — | — |
| 52108 | survived 30d | 2 | — | — | — | — |

Fresh-pilot surviving firing-seed rates: (a) 4/8 = 50.0%,
(b) 4/8 = 50.0%, (c) 2/8 = 25.0%, (d) 3/8 = 37.5%. Only (c)
passes the pilot leg (<= 25%), exactly at the bar.

Pooled texture (NOT judged — the prereg bars are per-leg,
and no leg is rescued by pooling): corpus + pilot survivors
35 seeds: (a) 9/35 = 25.7%, (b) 8/35 = 22.9%, (c) 4/35 =
11.4%, (d) 6/35 = 17.1%. Note what pooling would and would
not change: (a) still fails 25% pooled; (b) passes pooled
but fails the fresh leg, and per the prereg the fresh leg
is the certifying leg, so (b) stays PARTIAL — pooling is
reported here so a future reader can see the arithmetic,
not as a second verdict.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins
— those are late-game states, and this sweep carries no such
fields. NO wall movement is claimed. In-window, pilot band:
8/8 survived 30 days (median 30, max 30); collapses 0/8;
wave reach max 2 (7/8 reach wave 2; 52103 reaches wave 1
only); waves 3-5 not reached in 30 days (expected — early
window). Arc II/III/IV, regional -> national, table, win
flag: NOT REACHED IN WINDOW (0, as expected — not a rate
claim). Pilot deaths are combat/wild/expedition/wound/
sickness/dehydration, with ZERO starvation deaths on any
pilot seed: the pilot villages survive without starving,
which is precisely why their firings count as cost under
the prereg — a firing on a village that never starves is
the price a disengaged-state rule would pay.

## Sense test (SENSE-TESTING LAW: re-read days 12-28, judge the warning)

The (c) firing evening is day 15, and day 15's transcript is
already a thin-pack transcript — a warning there would land
on words the player is already hearing, not against them:

Day 15 (pantry 7,535, the (c) firing evening): "You keep a
day's food (1935 kcal) — nothing extra for the pantry this
time." and, the same evening, "Hunger gnaws. The pack is
thin — work the green, haul it back, get it named at camp.
That's the whole game." The same two lines recur on day 12
(the (d) firing evening, pantry 9,483). From day 12 on, no
"shelves are full" pantry-check line ever speaks again
until the day-25 hunger-exempt exception — the voice that
said "full" on day 11 ("Tariq checks the pantry before
heading out — the shelves are full, ~4 days of fresh on
hand… leaves the fish nets standing and turns to the water
run instead. The pantry can't take more; the wild will
keep.") simply stops, and what replaces it for 16 days is
keeping a day's food, nothing extra, and hunger gnawing.

A re-engaged warning on day 15 would therefore read
sensically: it would be the village finally saying out loud
what its own evenings have been saying since day 12 — the
store is thinning and nothing extra is reaching it — six
evenings before anyone starves. Contrast the (a)/(b) firing
evening, day 10, on which the "shelves are full" voice is
still speaking ("Tariq checks the pantry before heading out
— the shelves are full, ~4 days of fresh on hand… leaves
the fish nets standing and turns to the wood run instead"):
a warning there would read as two voices disagreeing on the
same evening — the plenty voice saying full, the warning
saying slide — which is arguably the honest tension of a
slide under a full-shelves voice, but it is a noisier fit
than day 15's, where the plenty voice has already gone
quiet. The (c) rule's shape is also the most legible to a
player: "the gate stood down, and since then the store has
kept falling" is a sentence a villager could say; "the
fresh slice crossed a lowered line" is not.

Day 21 (first starvation): "Leo starved. Slowly. Somebody
keeps looking at the door, like they're still going to walk
in." Day 25 (the trap evening, pantry 38,085, fresh 10.98,
streak 6): "Tariq checks the pantry before heading out —
~11 days of fresh on hand, but someone has gone hungry
three days running. The hungry eat first: keeps working
the fish nets instead of turning to other work." beside
"You keep a day's food (1950 kcal) and unload 36790 kcal
into Haven's pantry." Day 28 (collapse): "Cristian
starved. Slowly. Nobody eats much tonight. The pot stays
full and nobody touches it." — recorded only, not
re-litigated; already filed by the depositgate arm. The
sense judgment: a (c)-shaped warning on day 15 would have
read as the village noticing in time, in words that match
the evenings around it. The silence days 12-28 still reads
as gatecover diagnosed it — the gap — and (c) is the
candidate whose firing evening sits inside that silence
without contradicting the voice that remains.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's
inapplicability declaration (same reasoning as the prior
arms): this arm changes no game code, runs no lever, and
its primary metrics are within-trajectory instrument
diagnostics (would-fire overlays on identical evening
series), not panel metrics. The tables above are reported
directly, on identical seeds and identical trajectories.

## Metric review

(1) THE PILOT LEG IS THE BINDING LEG, AND (c)'s PASS IS
    THIN. (a), (b), and (d) all pass the 27-seed corpus leg
    and all fail the 8-seed pilot leg — the corpus alone
    would have passed all four, which is exactly why the
    prereg gates on the fresh band. (c) passes the pilot
    leg exactly at the bar (2/8 = 25.0%): one more firing
    pilot seed would have failed it. A future adoption
    prereg for (c) should therefore carry a CONFIRM BAND
    (12-16 fresh seeds, per the staged design) before any
    deploy claim, and should state its confirm bar before
    seeing the band. This arm's DIAG-GO names (c) as the
    candidate to confirm; it does not certify it.
(2) FIRING-SEED RATE OVERSTATES "FALSE" COST FOR (c).
    The cost metric counts any firing on a survivor, but
    51315's (c) firing (day 25, pantry 600, starvation death
    day 30, village survives) reads like a true warning
    about a near-empty store, and pilot firings like
    52104's (c) day 24 sit on villages whose pantries keep
    falling after firing. A future prereg that wants a
    false-cost number for (c) should score would-fire
    warnings the way falsefire scores confirmed warnings
    (confirmation + 10-evening recovery) — but that scoring
    does not exist yet for disengaged-state warnings, because
    a disengaged warning has no confirmation rule. Building
    that scoring is adoption-prereg work, not a correction
    to this census: under this arm's prereg, (c)'s cost is
    2/27 and 2/8, and that is what is judged.
(3) FIRST-FIRING-ONLY HIDES REPEAT TEXTURE. The rate
    counts seeds with >= 1 firing; it does not count how
    many evenings a candidate would fire on a seed, and
    this arm does not report repeat-firing counts. A rule
    that fires once and a rule that fires nightly are
    different costs to a player, and a future arm should
    measure evenings-per-firing-seed alongside the seed
    rate. Nothing in this arm's verdict depends on repeats
    (the bars are seed rates, as preregged), but the
    omission is stated so it is not mistaken for a finding
    of "fires once."
(4) No metric, threshold, seed, leg, or rule definition
    was changed mid-run. Prereg committed (b455d698b)
    before any judged analysis; the proof test (21/21)
    ran after the prereg commit and before the judged
    applications, uses no judged seeds, and changes no
    prereg word; the corpus census deduplicates 51608
    (falsefire rows judged, gatecover trace cross-checked
    with identical firing days); the pilot band's freshness
    was verified by seed-field scan before the prereg was
    written (no "seed":52101-52108 field in any evidence/
    *.jsonl; no whole-word mention in any
    evidence/2026-11-01/*.md — earlier substring grep hits
    elsewhere in evidence/ were longer numbers containing
    the digit string, not seed fields, and are not seed
    uses); the pilot sweep verified rows == daysAlive on
    all 8 seeds first try. The verdict is judged only
    against the prereg header.

## Village assessment (plain words)

Twenty-eight old villages and eight new ones, and the
question was simple: when the warning switch goes quiet,
what should wake it back up? Four answers were measured.
Three of them wake up too eagerly on the new villages —
the slide-shape rule, the lowered fresh-days line, and the
round floor all cry out on half or more of villages that
survive the month without anyone starving, even though all
three wake in time on the village that dies. The fourth
answer waits: it lets the gate stand down, watches three
evenings of falling stores, and only then speaks — and it
speaks on the dying village six evenings before the first
person starves, while staying quiet on most villages that
make it. That patience is why it passes and the others do
not: a warning that fires on every dip is a noise the
player learns to ignore, and a warning that waits for the
stand-down plus a falling trend is a warning that still
means something when it comes. The dying village's own
voice backs the verdict: by the evening the patient rule
fires, the village is already saying "nothing extra for the
pantry" and "hunger gnaws," and has been saying it since
the gate went quiet — the warning would have sounded like
the village noticing, not like an alarm from nowhere. The
new villages, meanwhile, are a quieter story than the old
one: all eight survive the month, their losses are fights
and the wild and wounds, not starvation, and their stores
dip and recover without anyone going hungry — which is why
a rule's cost on them is real cost, not a technicality.
What remains is a confirm band for the patient rule, and
the design decision to adopt it — neither is claimed here.

## Findings for the coordinator (to append to the backlog)

- Disengaged-state candidate NAMED for a future adoption
  prereg (closes the 1830Z next-blank (2) remainder as a
  census, opens the adoption decision): (c) STAND-DOWN +
  TREND — first evening of a disengaged stretch's trend:
  3 consecutive total falls ending at D, all after the
  stand-down evening S, with total(D) <= 90% of total(S)
  — fires day 15 on 51608 (6 evenings before first
  starvation day 21), at corpus cost 2/27 and pilot cost
  2/8 (exactly at the pilot bar). A future adoption prereg
  must carry a 12-16 seed confirm band before any deploy
  claim; this arm's DIAG-GO does not deploy (c).
- Hysteresis gap MEASURED (for that adoption prereg or a
  sibling arm): a lowered freshDays > 2 re-engage line
  re-engages the gate on 51608 day 10 but leaves the
  day-11 candidate unconfirmable, because its D+5 evening
  (day 16, freshDays 1.72) stays below even the lowered
  line. A gate change alone does not rescue the warning;
  any adoption that leans on hysteresis must also decide
  the counting rule for warnings born in a re-engaged run.
- Candidates (a), (b), (d) are PARTIAL, not killed: each
  fires in time on 51608 and passes the corpus leg, and
  each fails only the fresh pilot leg (50.0% / 50.0% /
  37.5%). A future arm may re-measure them on a confirm
  band; it may not cite this arm as killing them.

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT INDEX CLOBBER (same known class): after
  commit b455d698b the main index showed the committed
  prereg as a staged deletion alongside the worktree copy.
  Repaired via git update-index --add --cacheinfo from the
  HEAD blob, then verified tracked status clean and
  worktree hash matches HEAD. The commit itself was
  correct throughout.
- FULL `git status` (with untracked scan) STALLS on this
  worktree (hung past 80s in this run; the tracked-only
  `git status --porcelain --untracked-files=no` returns in
  ~1s and was used for all verification). The stall is the
  untracked scan over the huge evidence tree, not a dirty
  tree: tracked status is clean.
- PILOT SWEEP CLEAN, FIRST TRY EVERY SEED: all 8 pilot
  seeds verified on first try (rows == daysAlive each:
  30 x 8); no EPERM-flap retry was needed, no seed was
  re-run, no line was duplicated.
- FRESHNESS VERIFICATION: seed-field scan (exact
  "seed":52101-52108 fields) over all of evidence/*.jsonl
  plus whole-word .md grep over evidence/2026-11-01/ —
  both clean before the prereg was written. Pilot seeds
  52101-52108 are now consumed by this run.
- check.js --quick NOT re-run: zero src/js, zero green-list
  files on this arm; nothing here touches the runtime.

## Files

- Prereg: evidence/2026-11-01/sim-gatediseng-b-prereg.md
  (commit b455d698bc10a70bd0d109b08dade3e32f8ce621, before
  any judged analysis)
- Analyzer: scripts/analyze-gatediseng-b.js (the four
  candidate rules as pure functions over evening series)
- Proof test: scripts/test-gatediseng-b.js (21 pure checks,
  no judged seeds)
- Evidence: evidence/2026-11-01/sim-gatediseng-b.md (this file)
- Corpora: evidence/2026-11-01/sim-gatediseng-b-pilot-armed.jsonl
  (8 lines, seeds 52101-52108, armed only, gatecover tracer
  verbatim),
  evidence/2026-11-01/sim-gatediseng-b-corpus/
  sim-gatediseng-b-corpus-summary.json (28-seed census:
  dipslide3 51311-51330 + falsefire pilot 51601-51608),
  sim-gatediseng-b-pilot-summary.json (fresh pilot 8-seed
  analysis)
- Reused verbatim, never edited: scripts/trace-gatecover-b.js,
  scripts/analyze-dipslide3-b.js, scripts/analyze-falsefire-b.js,
  scripts/analyze-gatecover-b.js, scripts/policies/competent.js
- Consumed by this run (no longer fresh): pilot 52101-52108
