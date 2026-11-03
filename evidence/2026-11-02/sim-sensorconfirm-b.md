# sim-sensorconfirm-b — INSUFFICIENT-DATA: FRESH BAND YIELDS ONLY 2 COLLAPSING SEEDS, SO THE CONFIRM CANNOT JUDGE — BUT EVERY LEG THAT COULD BE CHECKED PASSED ON THOSE TWO

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T0230Z,
arm sim-sensorconfirm-b, axis food-economy. Worktree
sim-sensorconfirm-b, branch sim-sensorconfirm-b.
MEASUREMENT ONLY: zero src/js changes, zero policy-default flips, zero
edits to any existing script or policy file. New files only, all named
*-sensorconfirm-b.*. The gatecover tracer, the gatediseng analyzer, and
the competent policy are REUSED VERBATIM, never edited. This worker
does NOT push, bump, verify live, or deploy (e*); the coordinator merges.
Status to coordinator: committed on branch sim-sensorconfirm-b,
pending coordinator merge.

## Verdict: INSUFFICIENT-DATA — judged exactly against the prereg bars

Prereg: evidence/2026-11-02/sim-sensorconfirm-b-prereg.md, commit
e310884073705902895f2417f33c76ed8e5c5190, written and committed BEFORE
any judged sim (proof test 15/15 ran after the prereg commit but before
any judged application; the proof test is pure, uses no judged seeds,
and changes no prereg word; the reused proof tests were also re-run
green on current base before the confirm: gatediseng 21/21,
gatediseng-confirm 11/11).

The count gate is the verdict. The fresh band 80001-80024 produced only
2 collapsing seeds (lost before 30d with a starvation death) against a
prereg bar of >= 4, while survivors cleared their bar (22 >= 12). Per the
prereg, that is INSUFFICIENT-DATA — bars are not lowered and no extra
seeds were screened to fill the count. The band was screened in full
(24/24 legs, first try, rows == daysAlive on every seed) and judged on
the full band; nothing was cherry-picked.

| leg | result | bar | outcome |
|---|---|---|---|
| Count gate: collapsing seeds | 2 | >= 4 | FAIL -> INSUFFICIENT-DATA |
| Count gate: survivors | 22 | >= 12 | PASS |
| Fire: (e*) fires on collapsing seeds | 2/2 | ALL | PASS (on n = 2, not a confirm) |
| Tie: lead_e >= lead_c | 2/2 | ALL | PASS (on n = 2) |
| Strict: lead_e > lead_c | 2/2 | >= 50% | PASS (on n = 2) |
| Lead-one: lead_e >= 1 | 2/2 | >= 75% | PASS (on n = 2) |
| Cost: (e*) fires on survivors | 4/22 = 18.2% | <= 25% | PASS |
| Cross-check: thin (c) vs reused (c), first firing | 0 mismatches on 24/24 | Any mismatch = INSUFFICIENT-DATA | PASS |
| Tracer verification | rows == daysAlive on 24/24, first try | Failure = INSUFFICIENT-DATA | PASS |
| Determinism spot-check | 3/3 byte-identical re-runs (80008, 80016, 80001) | Report match/mismatch | PASS |

INSUFFICIENT-DATA means, per the prereg: the shape neither advances nor
fails on this evidence. The two collapsing seeds are consistent with the
pilot (both fire, both beat (c), both with lead >= 1, no death-knell
lead-0 firing), but two seeds cannot carry a confirm verdict, and this
file does not pretend otherwise. A future confirm needs a band — or a
screening rule fixed in ITS prereg — that actually yields >= 4
collapsing seeds; screening extra seeds inside this run to fill the
count was explicitly forbidden by this prereg.

## Q — THE CONFIRM, SEED BY SEED (24 seeds, 30d competent, fresh)

Reference day = first starvation death day. Lead = reference day -
firing day. No-fire counts as worse than any firing for lead-vs-(c).

Collapsing seeds (2):

| seed | end | ref | (c) firing | lead_c | (e*) firing | clause | lead_e | beats (c)? |
|---|---|---|---|---|---|---|---|---|
| 80008 | lost day 20 | 18 | 17 | 1 | 16 | E2-cliff | 2 | YES (+1) |
| 80016 | lost day 29 | 28 | 26 | 2 | 25 | E1-envelope | 3 | YES (+1) |

How the shape earns each collapsing seed, in one line each:
- 80008 (cliff): stand-down day 14 at 9,900, falls to 8,878 day 15 and
  4,980 day 16 — E2 fires day 16 (4,980 <= 0.65 * 9,900 = 6,435),
  two evenings before the first starvation death, one evening earlier
  than (c)'s day 17. Lead 2.
- 80016 (envelope): stand-down day 22 at 9,100, rise to a 9,700 peak
  day 23, falls days 24-25 to 7,100 — E1 fires day 25 (2 cumulative
  falls, 7,100 <= 0.90 * 9,700 = 8,730), three evenings before the first
  starvation death, one evening earlier than (c)'s day 26. Lead 3.
  The day-23 rise raised the peak instead of restarting the count —
  the bounce immunity the pilot claimed, observed on a fresh seed.

Survivors with an (e*) firing (cost leg, 4/22 = 18.2%):

| seed | (e*) firing | clause | (c) firing |
|---|---|---|---|
| 80001 | 24 | E1-envelope (stand-down 20 at 25,160, peak 26,112, pantry 20,026) | 24 |
| 80017 | 22 | E1-envelope (stand-down 20 at 6,900, pantry 5,703) | 30 |
| 80020 | 27 | E1-envelope (stand-down 25 at 14,220, pantry 12,470) | 28 |
| 80021 | 29 | E1-envelope (stand-down 27 at 9,900, pantry 6,700) | 30 |

Notable: the reused (c) rule fires on exactly the SAME four survivors
(80001, 80017, 80020, 80021) — on this band (e*) costs no more than
(c) (both 4/22), though (e*) fires 0-8 evenings earlier on three of
them. The other 18 survivors are silent under both rules.

All other seeds (18 survivors): both rules silent. No seed was lost
before 30d without a starvation death, so the "other outcomes" category
is empty — the band splits cleanly into 2 collapsing + 22 survivors.

Secondary (reported, NOT judged): collapsing seeds with lead_e == 0:
0/2 (no death-knell firing on this band — the pilot's lead-0 worry did
not recur here). Mean lead_e on collapsing seeds: 2.5 (n = 2). Mean
lead_c over its firing seeds: 1.5 (n = 2) — with n = 2 on both sides
this mean is reported only for completeness; the pairwise legs are the
comparison, per the pilot's metric review (2). Mean leads are not a
confirm of anything at this n.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins — those
are late-game states, and this confirm carries no such fields. NO wall
movement is claimed. In-window, confirm band: 22/24 survived 30 days
(median daysAlive 30, max 30); collapses 2/24 (a band property, not a
rate claim — the band was fixed before screening, not chosen for its
collapse count); wave reach max 3 (16/24 reach wave 3, 24/24 reach wave
2); waves 4-5 not reached in 30 days (expected — early window). Arc
II/III/IV, regional -> national, table, win flag: NOT REACHED IN
WINDOW (0, as expected — not a rate claim). National / table / wins: 0
in-window (stated, not a comparison).
Deaths across the band: 518 total — villager combat 347, combat 53,
expedition 45, sickness 18, monster 17, the wild 14, ambush 5, a wound
that wouldn't close 5, thirst 3, starvation 5, and 6 singletons
(Big Big, Hushpuppy, bad belly, lockjaw, tick, contest). The 5 starvation deaths split across the 2 collapsing seeds
(80008: days 18, 19, 20; 80016: day 28 x2) — no survivor starved, unlike
the pilot band's 79003 survivor starvation.

## Sense test (SENSE-TESTING LAW: (e*) firing evenings, fresh lines)

(i) 80008, day 16 (E2 firing, pantry 4,980, streak 5): the evening
speaks the thin-pack voice — "You keep a day's food (360 kcal) —
nothing extra for the pantry this time." beside "1 unprocessed haul
onto the counter — the clock is ticking." A warning on day 16 would
land on the thinnest pack line yet, two evenings before anyone starves,
in words matching the evenings around it. This is the shape working as
designed: the store halved in one evening (8,878 -> 4,980) and the
village's own words already say it kept only a day's food.
(ii) 80016, day 25 (E1 firing, pantry 7,100, streak 4): the same voice,
thinner — "You keep a day's food (130 kcal) — nothing extra for the
pantry this time." beside "1 unprocessed haul onto the counter — the
clock is ticking." and a lesson voice ("Vanessa starts in on the
lesson, then catches themself..."). A warning on day 25 would land
three evenings before starvation, on the thinnest pack line of the
stretch, in the village's own thin-pack words — not an alarm from
nowhere. The sense judgment matches the numbers (leads 2 and 3): both
warnings read as the village noticing in time.
(iii) Villagers act like people in the surrounding transcript (sampled,
not just counted): gossip by the fire that mutates across retellings
("It's barely the same story now. That's what fires do."), a
leadership challenge ("Why are YOU giving orders?" — Afia, arms
crossed, silence doing the talking), counter-learning told at the fire
(Static's lure counter learned and narrated). The collapse evenings
are not robotic — they are hungry in ways that match the pantry
numbers, and the (e*) warning would echo a voice already speaking.

## Balanced panel (section 15)

No panel compare is fabricated, per the prereg's inapplicability
declaration (same reasoning as the pilot): this arm changes NO game
code, runs NO lever, and its primary metrics are within-trajectory
instrument diagnostics (would-fire overlays on identical evening
series), not panel metrics. The tables above are reported directly in
the evidence file instead, on identical seeds and identical
trajectories.

## Metric review

(1) THE COUNT GATE DID ITS JOB, AND THE BAND SIZE WAS THE WRONG BET.
    A 24-seed band at this base's collapse rate (2/24 = 8.3% starvation
    collapses in 30d competent) was never likely to yield 4 collapsing
    seeds — the pilot's 4/8 was a constructed band (the full known
    collapsing band plus 4 survivors), not a natural rate, and this
    prereg's 24-seed fresh band inherited a screening assumption the
    pilot never tested. The next confirm's prereg should fix the
    screening rule, not the verdict bars: e.g. screen a larger fixed
    band (48-64 seeds) OR pre-screen for collapsing membership with a
    rule fixed before judging (and report the screen rate honestly).
    What it must NOT do is screen-until-4 inside a run whose prereg
    forbids it — that is exactly the cherry-picking this prereg barred.
(2) THE LEGS THAT COULD BE CHECKED ALL PASSED, AND THAT IS STILL NOT A
    CONFIRM. 2/2 firing, 2/2 ties, 2/2 strict, 2/2 lead >= 1, cost
    18.2% — every number points the pilot's way, and none of it is
    cited here as a confirm. A reader who wants to claim "the shape
    survived fresh evidence" from n = 2 collapsing seeds is over-reading
    by a factor of two; the honest sentence is "fresh evidence is
    consistent with the pilot and contains no contradiction."
(3) COST PARITY WITH (c) ON THIS BAND IS NEW INFORMATION, NOT A LEG.
    (e*) and (c) fire on the identical 4 survivors, so the looser
    2-fall trigger cost nothing extra here — against the pilot's
    full-band context (15-17% for (e*) vs 8.3% for (c) on the 790
    screen). Whether that parity is a band fluke or a property of
    fresh bands is unmeasured; the next confirm should report the
    (c)-vs-(e*) survivor overlap, not just the two rates.
(4) NO DEATH-KNELL FIRING RECURRED. The pilot's lead-0 gap (79031) did
    not recur on this band (leads 2, 3), but n = 2 cannot close that
    gap either — the lead >= 1 leg stays in the next prereg.
(5) No metric, threshold, seed, leg, collapse definition, or rule
    definition was changed mid-run. Prereg committed (e31088407) before
    any judged sim; the proof test (15/15) ran after the prereg commit
    and before any judged application, uses no judged seeds, and
    changes no prereg word; the confirm verified rows == daysAlive on
    all 24 seeds first try; the thin analyzer's (c) first firing matches
    the reused analyzer on all 24 seeds; determinism re-runs matched
    byte-identically on 3/3 legs. The verdict is judged only against
    the prereg header.

## Village assessment (plain words)

Twenty-four villages, and only two of them die — both of hunger, both
late in the month, both after their store slides while the warning
switch has gone quiet. On both, the new rule speaks before anyone
starves: on one, the evening the store halves to almost nothing, two
evenings early; on the other, after a small bounce that used to restart
the old rule's count, three evenings early — and on both, the village's
own words that evening already say it kept only a day's food, so the
warning would sound like noticing, not like an alarm from nowhere. The
twenty-two villages that live mostly hear nothing from either rule; on
four of them the new rule speaks late in the month, and the old rule
speaks on the same four — the new rule costs no more than the old one
here. Nothing here reaches national, the table, or a win — that wall
was never this run's question, and it did not move. The blank this run
fills is a negative one, stated plainly: a fresh band of twenty-four
villages contains only two starving collapses, so the rule that earned
a pilot on a hand-picked dying band has not yet been proven on
villages it was never tuned against. What it owes is still a real
confirm — with a band big enough to actually contain dying villages.

## Findings for the coordinator (to append to the backlog)

- (e*) FRESH-BAND CONFIRM INSUFFICIENT-DATA (fresh 80001-80024, 30d
  competent, current base): only 2 collapsing seeds vs prereg bar
  >= 4 (survivors 22 >= 12), so NO confirm verdict either way — bars
  not lowered, no extra seeds screened. On the 2 collapsing seeds all
  legs passed (fire 2/2, tie 2/2, strict 2/2, lead >= 1 2/2; leads 2 and
  3, clauses E2-cliff and E1-envelope); cost 4/22 = 18.2%; cross-check
  0/24 mismatches; tracer 24/24 first try; determinism 3/3
  byte-identical. Does NOT deploy (e*); does NOT overturn the pilot.
- FRESH-BAND COLLAPSE RATE (band property, not a rate claim): 2/24
  starvation collapses in 30d competent on 80001-80024 — a 24-seed
  fresh band is too small a bet for a >= 4 collapsing bar at this
  base's collapse rate. Next (e*) confirm prereg must fix the
  screening rule (larger fixed band, e.g. 48-64 seeds, or a
  pre-screening rule fixed before judging), not the verdict bars.
- COST PARITY WITH (c) ON A FRESH BAND: (e*) and (c) fire on the
  identical 4 survivors (80001, 80017, 80020, 80021) — the looser
  2-fall trigger cost nothing extra here, vs the pilot's 790-screen
  context (15-17% (e*) vs 8.3% (c)). Whether parity is a band fluke
  or a fresh-band property is unmeasured; next confirm should report
  the (c)-vs-(e*) survivor overlap, not just the two rates.
- SENSE FIT ON FRESH COLLAPSING SEEDS: both (e*) firing evenings carry
  the village's own thin-pack voice ("You keep a day's food (360 kcal)
  / (130 kcal) — nothing extra for the pantry this time."), so both
  warnings read as noticing in time (leads 2, 3) — no silent-cliff
  voice gap on this band, unlike the pilot's 79006 cliff silence.
- DEPLOY WORDING NOTE (carried, not acted on): any future deploy
  wording must be peak-anchored ("fallen from its recent high"), never
  stand-down-anchored — this confirm does NOT deploy (e*).

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT + TOOLS-COMMIT INDEX CLOBBER (same known class): after
  commits e31088407 and e45eec702 the main index showed the committed
  files as staged deletions alongside the worktree copies. Repaired
  both times via git update-index --add --cacheinfo from the HEAD
  blobs, then verified tracked status clean. The commits themselves
  were correct throughout.
- FULL `git status` (with untracked scan) STALLS on this worktree (as
  in prior gatediseng arms); the tracked-only `git status --porcelain
  --untracked-files=no` returns in ~1s and was used for all
  verification.
- CONFIRM CLEAN, FIRST TRY EVERY SEED: all 24 seeds verified on first
  try (rows == daysAlive each); no EPERM-flap retry was needed, no seed
  was re-run for judging. Per-seed tracer cost ~3s; the 24-seed sweep
  ran 72s. Determinism re-runs (80008, 80016, 80001) matched
  byte-identically.
- check.js --quick NOT re-run: zero src/js, zero green-list files on
  this arm; nothing here touches the runtime.

## Files

- Prereg: evidence/2026-11-02/sim-sensorconfirm-b-prereg.md
  (commit e31088407, before any judged sim)
- Proof test: scripts/test-sensorconfirm-b.js (15 pure checks, no
  judged seeds; commit e45eec702)
- Thin analyzer: scripts/analyze-sensorconfirm-b.js (imports the reused
  analyzer for (c); commit e45eec702)
- Evidence: evidence/2026-11-02/sim-sensorconfirm-b.md (this file)
- Corpora: evidence/2026-11-02/sim-sensorconfirm-b.jsonl (24 lines,
  seeds 80001-80024, fresh on current base),
  evidence/2026-11-02/sim-sensorconfirm-b-summary.json (thin-analyzer
  confirm summary + verdict),
  evidence/2026-11-02/sim-sensorconfirm-b-sweep.log (per-seed tracer
  stderr),
  evidence/2026-11-02/sim-sensorconfirm-b-detcheck.log (3/3
  byte-identical determinism re-runs)
- Reused verbatim, never edited: scripts/trace-gatecover-b.js,
  scripts/analyze-gatediseng-b.js, scripts/policies/competent.js
- Consumed by this run (no longer fresh): seeds 80001-80024 (the fresh
  band screened here; a future confirm must use a different band or
  state its reuse).
