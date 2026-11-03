# sim-sensorresupply-b — PILOT-NO-GO: THE RE-SUPPLY EXISTS (8 FRESH COLLAPSERS), THE SHAPE FAILS EXACTLY ONE LEG — THE TIE, ON ONE SEED

Run: oversight-flesh-out-loop-b, arm sim-sensorresupply-b, axis
food-economy. Worktree sim-sensorresupply-b, branch
sim-sensorresupply-b. MEASUREMENT ONLY: zero src/js changes, zero
policy-default flips, zero edits to any existing script or policy
file. New files only, all named *-sensorresupply-b.*. The gatecover
tracer, the gatediseng analyzer, and the competent policy are REUSED
VERBATIM, never edited. This worker does NOT push, bump, verify
live, merge, or rebase — the coordinator lands the branch. This run
does NOT deploy (e*).
Status to coordinator: committed in worktree, pending coordinator merge.

## Verdict: PILOT-NO-GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-03/sim-sensorresupply-b-prereg.md, commit
5b9c91e81de18a675b85dc61bf2b29305e6868e7, written and committed
BEFORE any screen or judged leg (tools commit e759fb18fd3607054dc
after the prereg commit and before any judged application; proof
test 24/24, pure synthetic series, no judged seeds, changes no
prereg word; the reused proof tests were also re-run green on
current base before judging: gatediseng 21/21,
gatediseng-confirm 11/11).

| leg | result | bar | outcome |
|---|---|---|---|
| Stage 1 calibration gate (record-only) | 4/7 reproduced | record, does not stop the run | RECORDED (see below) |
| Stage 1 screen GO: screened collapsing | 8 / 200 | >= 4 | PASS -> Stage 2 |
| Stage 2 count gate: still-collapsing | 8 | >= 4 | PASS |
| Stage 2 count gate: traced survivors | 16 | >= 12 | PASS |
| Fire: (e*) fires on still-collapsing seeds | 8/8 | ALL | PASS |
| Tie: lead_e >= lead_c | 7/8 | ALL | FAIL — sole failing leg |
| Strict: lead_e > lead_c | 7/8 = 87.5% | >= 50% | PASS |
| Lead-one: lead_e >= 1 | 7/8 = 87.5% | >= 75% | PASS |
| Cost: (e*) fires on traced survivors | 4/16 = 25% | <= 25% | PASS (exactly at bar) |
| Cross-check: independent (c) vs reused (c) | 0 mismatches on 24/24 | Any mismatch = INSUFFICIENT-DATA | PASS |
| Tracer verification | rows == daysAlive on 24/24, first try | Failure = INSUFFICIENT-DATA | PASS |
| Determinism spot-check | 3/3 byte-identical re-runs | Report match/mismatch | PASS |
| Base-equality: tracer vs screen lines | 24/24 byte-identical | Report per seed | PASS |
| Survivor drift (newly collapsing cost seed) | 0 | Any = INSUFFICIENT-DATA | PASS |
| Excluded candidates (fresh non-collapsing) | 0 | reported, never a failure | — |

PILOT-NO-GO means, per the prereg: Stage 1 GO and the count gates
hold, but one judged leg fails, and the failing leg is named: the
TIE leg, on seed 82127 alone. The shape does not advance on this
evidence. No leg was re-scored, no margin relaxed, no seed
substituted, no clause redefined mid-run.

## STAGE 1 — calibration gate (record-only, per the prereg's stated change)

Reproduced 4/7 — byte-identical lines to the confirm3 calibration
corpus, on a base that still contains 5440b7747. The three misses
are the same three, in the same direction, as confirm3:

| seed | known classification (archived) | fresh classification (this run) |
|---|---|---|
| 80008 | collapsing: lost day 20, first starvation day 18 | SURVIVOR: survived 30d, 0 starvation deaths |
| 80016 | collapsing: lost day 29, first starvation day 28 | SURVIVOR: survived 30d, 0 starvation deaths |
| 81053 | collapsing: lost day 30, first starvation day 26 | SURVIVOR: survived 30d, 0 starvation deaths |
| 79001 | survivor: survived 30d | survivor: survived 30d |
| 79002 | survivor: survived 30d | survivor: survived 30d |
| 79003 | survivor: survived 30d | survivor: survived 30d |
| 79004 | survivor: survived 30d | survivor: survived 30d |

Per the prereg, this mismatch is the EXPECTED re-confirmation of
confirm3's finding, not this run's failure, and it did not stop the
run: the gate's role here is diagnostic data for the re-supply, and
the fresh screen does not depend on the old supply. The confirm3
divergence days (11/12/18) and timing lead (gap-w5window 5440b7747
wanderer change, NOT a proven cause) carry over unchanged, since
the lines themselves are byte-identical to confirm3's.

## STAGE 1 — screen (full band 82001-82200, competent 30d, death-aware)

200/200 lines, rows == daysAlive on all 200, no re-run needed for
verification (one screen seed per process; a runtime restart midway
wiped the first attempt's /tmp checkpoints at ~132 seeds, and the
screen was re-run in full from worktree checkpoints — the reported
corpus is the complete second run, not a merge of attempts).
Screen rate: 8/200 = 4.0% collapsing. Survivors 192/200, other
outcomes 0/200 — no village in this band was lost without a
starvation death. Starvation deaths across the band: 48.

Screened collapsing seeds (the new supply):

| seed | lost day | first starvation day | starvation deaths |
|---|---|---|---|
| 82032 | 24 | 22 | 4 (days 22, 23, 23, 23) |
| 82077 | 28 | 25 | 2 (days 25, 25) |
| 82088 | 22 | 19 | 4 (days 19, 20, 20, 21) |
| 82120 | 20 | 18 | 2 (days 18, 20) |
| 82127 | 24 | 23 | 3 (days 23, 23, 24) |
| 82148 | 23 | 19 | 4 (days 19, 19, 22, 22) |
| 82166 | 27 | 24 | 1 (day 24) |
| 82177 | 30 | 28 | 1 (day 28) |

First-16 survivor sample (seed order): 82001-82016 — the band opens
with 16 straight survivors, so the sample is the band's first 16
seeds. Stage-1 GO (>= 4) is met with 8, not scraped: this is the
first fresh (e*) supply since the two failed confirms to clear the
count bar, and it clears it by double.

## STAGE 2 — the pilot, seed by seed (24 tracer legs, 30d competent)

Reference day = first starvation death day. Lead = reference day -
firing day. No-fire counts as worse than any firing for lead-vs-(c).
Tracer lines are byte-identical to screen lines on 24/24 legs, so
the judged trajectories are the screened trajectories, re-run.

Still-collapsing seeds (8, zero exclusions):

| seed | end | ref | (c) firing | lead_c | (e*) firing | clause | lead_e | beats (c)? |
|---|---|---|---|---|---|---|---|---|
| 82032 | lost day 24 | 22 | 23 | -1 | 21 | E1-envelope | 1 | YES (after death -> 1) |
| 82077 | lost day 28 | 25 | 17 | 8 | 16 | E1-envelope | 9 | YES (+1) |
| 82088 | lost day 22 | 19 | 18 | 1 | 18 | E2-cliff | 1 | TIE (not strict) |
| 82120 | lost day 20 | 18 | 18 | 0 | 17 | E2-cliff | 1 | YES (+1) |
| 82127 | lost day 24 | 23 | 20 | 3 | 23 | E2-cliff | 0 | NO — the tie failure |
| 82148 | lost day 23 | 19 | 19 | 0 | 18 | E2-cliff | 1 | YES (+1) |
| 82166 | lost day 27 | 24 | 20 | 4 | 15 | E1-envelope | 9 | YES (+5) |
| 82177 | lost day 30 | 28 | 27 | 1 | 26 | E1-envelope | 2 | YES (+1) |

How the shape earns each seed, in one line each:
- 82032 (envelope): stand-down day 18 at 8,180, two falls to 5,830
  day 21 — E1 fires day 21, one evening before starvation, where
  (c) waits until day 23, after the first death (lead_c -1).
- 82077 (envelope, best margin): stand-down day 14 at 28,014, two
  falls to 23,650 day 16 — E1 fires nine evenings before starvation.
- 82088 (cliff, tie): stand-down day 15 at 8,264, falls to 3,900
  day 18 — E2 fires the same evening as (c) (lead 1 each).
- 82120 (cliff): stand-down day 15 at 8,134, falls to 3,309 day 17
  — E2 fires one evening before starvation, where (c) fires on
  the death evening itself (lead_c 0).
- 82127 (cliff, THE FAILURE — see below): (e*) fires day 23, the
  starvation evening, three evenings AFTER (c)'s day-20 firing.
- 82148 (cliff): stand-down day 16 at 7,500, falls to 1,250 day 18
  — E2 fires one evening before starvation, where (c) fires on
  the death evening (lead_c 0).
- 82166 (envelope, best margin tied): stand-down day 13 at 22,830,
  two falls to 19,815 day 15 — E1 fires nine evenings before
  starvation, five evenings before (c).
- 82177 (envelope, day-30 boundary): stand-down day 24 at 11,250,
  two falls to 7,850 day 26 — E1 fires two evenings before
  starvation.

Cost survivors (16, fresh): 82001-82016, all survived 30d, none
newly collapsing. (e*) fires on 4/16 (82002 day 10 E2-cliff, 82006
day 25 E1-envelope, 82009 day 17 E1-envelope, 82011 day 21
E1-envelope) — exactly at the <= 25% bar, not under it. (c) fires
on 5/16 (82001, 82002, 82006, 82009, 82011); the (c)-vs-(e*)
survivor overlap is the 4 (e*) firers, all also (c) firers — (e*)
adds no new survivor false alarm beyond (c)'s set here, but the
cost leg passes with zero margin: one more (e*) survivor firing
would have failed it (5/16 = 31.25%).

Secondary (reported, NOT judged): still-collapsing seeds with
lead_e == 0: 1/8 (82127, named above — the same death-knell shape
as 79031 in the supply pilot, but here it also loses the tie).
Mean lead_e on still-collapsing seeds: 3.0 (n = 8). Mean lead_c:
2.0 (n = 8 — (c) fired on ALL 8 candidates this time, so unlike
prior runs its mean excludes no silences; the pairwise legs, not
the means, are still the comparison). Fresh-vs-screen firing
comparison: identical by construction (24/24 byte-identical lines
entail identical firings).

## Why the tie fails on 82127 (the one seed that matters)

82127's pantry collapses in plain sight — 10,900 (day 16) → 9,700
→ 8,300 → 6,400 → 4,500 → 2,750 → 0 (day 23) — and (c) fires day 20
on its third consecutive fall. (e*) cannot fire on days 19-22 even
though E1 qualifies on day 19 (two falls, 8,300 <= 0.90 x 10,900):
its hungryStreak gate reads 0 on days 19, 20, 21, and 22, and only
returns to 1 on day 23, when the pantry is already 0 and two people
starve that evening. The streak, not the pantry shape, is what
delays (e*): the village's recorded hunger streak is 0 through
four evenings of a draining store. This is an observed instrument
interaction, not a proven defect in either the streak or the rule —
the streak is whatever the game records, and (e*) as specified
reads it — but it is the exact mechanism a next rule revision
would have to address (e.g. whether the streak gate belongs in
(e*) at all, or whether a falling-store signal should fire
without it). That revision is NOT made here: the prereg binds this
run, and a miss is NO-GO, never re-scored. Note the asymmetry the
failure exposes: on 82032 (e*) rescues a seed where (c) fires
AFTER the first death, while on 82127 (c) rescues the lead and
(e*) arrives at the death. Neither rule dominates the other on
this supply; the tie leg, which demands (e*) never lose, is what
fails.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins — those
are late-game states, and this run carries no such fields. NO wall
movement is claimed. In-window, traced legs: 16/24 survived 30 days
(median daysAlive 30, max 30); still-collapsing 8/24 (by screen
design of the tracer set, not a rate); wave reach max 3 (10/24
reach wave 3, 14/24 peaking at wave 2); waves 4-5 not reached in 30
days (expected — early window). Arc II/III/IV, regional ->
national, table, win flag: NOT REACHED IN WINDOW (0, as expected —
not a rate claim). National / table / wins: 0 in-window (stated,
not a comparison).
Deaths across the 24 tracer legs: 514 total — villager combat 285,
combat 70, expedition 42, sickness 24, starvation 32, ambush 14,
the wild 14, monster 14, a wound that wouldn't close 7, thirst 3,
and singletons (Nostalgia, Choir Toad, experiment, Nevermore,
Bulldozer, contest, bad belly, a raccoon with too many fingers,
Night Court, and one Union Rep-class entry each). Of the 32
starvation deaths, 21 fall on the 8 collapsing seeds and 11 on
villages that survive the month — the recurring shape of a village
that starves people and lives.

## Sense test (SENSE-TESTING LAW: (e*) firing evenings, tracer lines, judged)

(i) 82032, day 21 (E1, pantry 5,830, streak 1, lead 1): the evening
speaks the thin-pack voice — "You keep a day's food (240 kcal) —
nothing extra for the pantry this time." A warning here lands on
the thinnest pack line yet, one evening before anyone starves, in
words matching the evenings around it. Noticing in time, thin.
(ii) 82166, day 15 (E1, pantry 19,815, streak 5, lead 9): "You keep a
day's food (1590 kcal) — nothing extra for the pantry this time."
beside leadership strain ("We need to talk. About who's actually
running things here."). Nine evenings early, in its own thin-pack
words — but the store is still near 20,000 kcal, so a warning here
reads as noticing a fall from the peak, not as hunger: the
store-framing constraint matters most on exactly this kind of
early firing.
(iii) 82177, day 26 (E1, pantry 7,850, streak 4, lead 2): "You keep a
day's food (735 kcal) — nothing extra for the pantry this time."
plus "1 unprocessed haul onto the counter — the clock is ticking."
Two evenings before starvation, voice matches. Noticing in time.
(iv) 82120, day 17 (E2, pantry 3,309, streak 1, lead 1): NO thin-pack
line in the evening; the voice is monster maulings ("The
Understudy mauled Manuel (-19 health) over 2 rounds") and the
unprocessed-haul clock. A warning here would be the only pantry
voice on a violent evening, one evening before starvation: true by
the numbers, thin as rescue, breaking a busy evening rather than
echoing it.
(v) 82077, day 16 (E1, pantry 23,650, streak 5, lead 9): NO pantry
line in the evening; the voice is gossip-by-the-fire and a counter
lesson ("WAIT to answer back. SHAME is the damage, not the
swing"). A warning nine evenings early, on a store still above
23,000 kcal, would be the only pantry voice — early noticing only
if framed as the store's fall from its 28,014 peak, never as
hunger.
(vi) 82127, day 23 (E2, pantry 0, streak 1, lead 0): NO pantry/hunger
line in any evening line; the voice is gossip ("The retelling is
already better than the event") and fishing orders. The pantry is
0 and two people starve this evening. A warning here lands
alongside deaths on a silent evening: noticing at the moment of
death, and — unlike every prior (e*) death-knell — three evenings
after the old rule already spoke. The sense judgment matches the
number (lead 0, tie lost): real, tardy, and beaten.
(vii) Villagers act like people in the surrounding transcripts
(sampled, not just counted): gossip by the fire that mutates across
retellings ("Three retellings in, nobody remembers what actually
happened"), counter-learning told at the fire, leadership
challenges ("Interesting. Nobody asked me."), lessons that catch
themselves repeating ("Hold on — I already showed you this one").
The collapse evenings are not robotic — they are quiet, hungry,
fractious, or violent in ways that match the pantry numbers. What
was missing on the cliffs was a warning voice, and (e*) supplies
one (early on 82077/82166, in time on 82032/82177/82120/82148,
late on 82127).

## Balanced panel (section 15)

No panel compare is fabricated, per the prereg's inapplicability
declaration (same reasoning as the pilot, both confirms, the supply
pilot, and confirm3): this arm changes NO game code, runs NO lever,
and its primary metrics are within-trajectory instrument
diagnostics (would-fire overlays on identical evening series), not
panel metrics. The tables above are reported directly in the
evidence file instead, on identical seeds and identical
trajectories.

## Metric review

(1) THE RE-SUPPLY WORKED; THE SHAPE DID NOT SURVIVE IT. The
    confirm3 metric review ordered re-derivation before judging,
    and this run did it: 8 fresh collapsing villages on the current
    base, double the count bar, zero exclusions, zero drift, full
    survivor sample. That supply is now the standing (e*) supply
    for the next run — it must not be re-screened away or pooled
    with the old supply (whose villages no longer collapse). The
    verdict that follows from it is NO-GO, not a supply complaint.
(2) THE TIE LEG IS THE BINDING CONSTRAINT, AND IT BINDS ON A
    STREAK-GATE INTERACTION, NOT A PANTRY SHAPE. Every prior (e*)
    run passed tie 100% (pilot 4/4, confirms 2/2 and 1/1, supply
    7/7). This supply breaks it on exactly one seed, where the
    streak gate — not the envelope or cliff clause — holds (e*)
    silent through a draining store. A future prereg must decide,
    explicitly and before judging: does (e*) keep its streak gate
    (and accept that a 0-streak collapse beats it), drop or weaken
    it (and re-measure cost, which already sits exactly at its bar
    here), or add a streak-free fallback clause? That decision is
    for the NEXT prereg, never a mid-run re-score of this one.
    Note the cost interaction: any change that makes (e*) fire
    earlier or more often must re-prove cost, which passed here
    with zero margin (4/16 exactly at 25%).
(3) COST PASSES WITH ZERO MARGIN — TREAT IT AS A WARNING, NOT A
    PASS TO BANK. 4/16 is the bar, not under it. The four firing
    survivors are all also (c) firers, so (e*) adds no NEW false
    alarm on this sample — but a single additional firing survivor
    in any re-run sample flips the leg. The next run should keep
    the full >= 12 survivor denominator and report the margin
    prominently; a cost leg that passes by one seed is not a
    comfortable leg.
(4) (c) FIRED ON ALL 8 CANDIDATES — THE COMPARISON IS CLEANER
    HERE THAN IN ANY PRIOR RUN. Prior runs' (c) means excluded its
    silences; here there are none, so mean lead_e 3.0 vs mean
    lead_c 2.0 is a like-for-like mean for once. The pairwise legs
    still govern (and the tie leg still fails), but the mean gap
    no longer flatters (e*) by dropping (c)'s worst seeds.
(5) THE STREAK ITSELF IS NOW A MEASUREMENT QUESTION. On 82127 the
    recorded streak is 0 for four evenings while the store drains
    10,900 → 2,750. Whether that streak reading is correct game
    behavior (villagers genuinely not counted hungry — e.g. eating
    elsewhere, or a streak definition that resets on some event)
    or an instrument read issue is unmeasured here; the tracer
    only reads progState().hungryStreak as the sensor does. A
    diagnostic on what resets hungryStreak would sharpen the next
    (e*) revision — and would also matter to any other rule that
    reads the streak.
(6) DETERMINISM + BASE-EQUALITY ARE BOTH CLEAN, AND THE CLEANLINESS
    IS REPORTABLE: 24/24 tracer lines byte-identical to screen
    lines, 3/3 determinism re-runs byte-identical (first 82032,
    middle 82120, last 82177 still-collapsing legs in seed order).
    The detcheck log's in-loop intermediate flag (a faulty
    comparison expression comparing raw text against re-serialized
    JSON) was superseded in the same run by the direct raw-string
    comparison, which is the reported result; the faulty flag is
    not a substrate mismatch and no leg was judged on it.
(7) No metric, threshold, seed, leg, collapse definition, or rule
    definition was changed mid-run. Prereg committed (5b9c91e8)
    before any screen or judged leg; the proof test (24/24) ran
    after the prereg commit and before any judged application,
    uses no judged seeds, and changes no prereg word; the screen
    ran the full fixed band (a runtime restart wiped the first
    attempt's /tmp checkpoints at ~132 seeds, and the screen was
    re-run in full from worktree checkpoints — the reported corpus
    is the complete second run, and no seed was cherry-picked
    between attempts); tracer legs ran after the Stage-1 GO; the
    verdict follows the prereg header exactly (tie fails on one
    seed, so PILOT-NO-GO).

## Village assessment (plain words)

Two hundred new villages, and eight of them starve. They are not
the old dying villages — those live now, on today's game — they are
new ones, found the honest way, by screening a band nobody had
touched. On seven of the eight, the new warning rule speaks before
people starve, and on six of those it speaks at least a day earlier
than the old rule — twice, nine days earlier, while the store was
still high but falling from its peak. On the eighth, it speaks on
the evening people starve, three days after the old rule already
spoke, because the village's recorded hunger streak sat at zero
while its store drained away — the rule was waiting for a hunger
signal that never came until the store was empty. The sixteen
villages that live hear the new warning on four of them — right at
the limit of what the rule allows itself. Nothing here reaches
national, the table, or a win — that wall was never this run's
question, and it did not move. The blank filled: the warning rule
finally has a fresh supply of dying villages on today's game, and
that supply exposes exactly one crack — a hunger-streak gate that
can hold the warning silent through a collapse. The next attempt
has to decide what to do about that gate before it can claim the
rule is safe.

## Findings for the coordinator (to append to the backlog)

- (e*) RE-SUPPLY PILOT-NO-GO (fresh band 82001-82200, 30d competent,
  current base): screen 8 collapsing / 192 survivors / 0 other
  (rate 4.0%, 48 starvation deaths); Stage-2 tracer 24 legs, zero
  exclusions, zero survivor drift, 24/24 tracer==screen
  byte-identical, determinism 3/3 byte-identical, cross-check 0/24
  mismatches; fire 8/8, strict 7/8, lead >= 1 7/8, cost 4/16 exactly
  at the 25% bar — but TIE FAILS 7/8 on seed 82127 alone ((e*) day
  23 lead 0 vs (c) day 20 lead 3). Does NOT deploy (e*); does NOT
  overturn the supply PILOT-GO (different supply, different base).
- NEW STANDING (e*) SUPPLY: 82032, 82077, 82088, 82120, 82127,
  82148, 82166, 82177 (fresh, current base). The old supply
  (79006/79019/79031/79064/80008/80016/81053) is stale: its three
  80xxx/81xxx members now survive, confirmed byte-identical to
  confirm3's calibration lines. The next (e*) run should judge
  against the new supply or a new fresh band, never re-pool the
  old one.
- TIE FAILURE MECHANISM (82127): (e*)'s hungryStreak >= 1 gate
  reads 0 on days 19-22 while pantry drains 10,900 → 2,750, so E1
  (qualifying day 19) cannot fire until day 23 (pantry 0, E2),
  the starvation evening. Next prereg must decide explicitly
  whether (e*) keeps, weakens, or drops the streak gate — and
  re-prove cost, which passes here with zero margin (4/16).
- STREAK-READ DIAGNOSTIC OWED: what resets hungryStreak to 0
  during a draining store (82127 days 19-22)? Unmeasured here;
  matters to (e*) and to any rule reading the streak.
- COST WARNING: 4/16 exactly at bar; all four (e*) firing
  survivors are also (c) firers (no new false alarm on this
  sample), but one more firing survivor flips the leg.
- CALIBRATION GATE, CONFIRMED TWICE: 4/7 again, byte-identical
  to confirm3's lines. The old supply's staleness is now a
  twice-measured fact, not a one-run anomaly.
- SCREEN-RATE NOTE: fresh-band collapse rate on this base is
  4.0% (8/200) — higher than the two failed confirms' bands
  (2/24, 1/56), consistent with a base where old collapsers
  survive but new ones still appear. Do NOT cite 4.0% as a
  population rate: it is one band's property.

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT + TOOLS-COMMIT + STAGE-1-COMMIT INDEX CLOBBER
  (same known class): after commits 5b9c91e8, e759fb18, and
  57c06ef3 the main index showed the committed files as staged
  deletions alongside the worktree copies. Repaired each time via
  git update-index --add --cacheinfo from the HEAD blobs, then
  verified tracked status clean and `git show --stat HEAD`
  correct. The commits themselves were correct throughout.
- FULL `git status` (with untracked scan) STALLS on this worktree
  (as in prior gatediseng arms); the tracked-only
  `git status --porcelain --untracked-files=no` returns in ~1s and
  was used for all verification.
- RUNTIME RESTART MID-SCREEN: the first screen attempt's /tmp
  per-seed checkpoints were wiped by a runtime restart at ~132
  seeds (of 200, pre-restart partial: 5 collapsing at that point).
  Recovery: re-ran the full band from worktree checkpoints
  (evidence/2026-11-03/screen-tmp-sensorresupply-b/, deleted on
  assembly). Lesson carried forward: NEVER checkpoint sim corpora
  in /tmp on this host — worktree checkpoints survive restarts.
- TRACER CLEAN, FIRST TRY EVERY LEG: all 24 tracer legs verified
  on first try (rows == daysAlive each); no EPERM-flap retry was
  needed. Screen legs likewise verified 200/200 first try (the
  retry loop in the screen command found nothing to retry).
- check.js --quick NOT re-run: zero src/js, zero green-list files
  on this arm; nothing here touches the runtime.

## Files

- Prereg: evidence/2026-11-03/sim-sensorresupply-b-prereg.md
  (commit 5b9c91e8, before any screen or judged leg)
- Proof test: scripts/test-sensorresupply-b.js (24 pure checks, no
  judged seeds; commit e759fb18)
- Thin analyzer: scripts/analyze-sensorresupply-b.js (imports the
  reused analyzer for judged (c); independent (c) for the
  cross-check; commit e759fb18)
- Evidence: evidence/2026-11-03/sim-sensorresupply-b.md (this file)
- Calibration corpus: evidence/2026-11-03/
  sim-sensorresupply-b-calib.jsonl (7 lines) / *-calib.log
  (commit 57c06ef3)
- Screen corpus: evidence/2026-11-03/
  sim-sensorresupply-b-screen.jsonl (200 lines) / *-screen.log
  (commit 57c06ef3)
- Tracer corpus: evidence/2026-11-03/
  sim-sensorresupply-b-tracer.jsonl (24 lines) /
  sim-sensorresupply-b-summary.json (thin-analyzer verdict) /
  *-sweep.log / *-detcheck.log (to be committed with this file)
- Reused verbatim, never edited: scripts/trace-gatecover-b.js,
  scripts/analyze-gatediseng-b.js, scripts/policies/competent.js
- Consumed by this run (no longer fresh): band 82001-82200
  (screened in full — no longer available as a fresh band).
