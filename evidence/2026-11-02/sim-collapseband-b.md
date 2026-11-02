# sim-collapseband-b — TIMELINESS-FAIL: THE PATIENT RULE DOES NOT WARN IN TIME ON A FRESH COLLAPSING BAND

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261102T1730Z,
arm sim-collapseband-b, axis food-economy. Worktree
sim-collapseband-b, branch sim-collapseband-b.
MEASUREMENT ONLY: zero src/js changes, zero policy-default
flips, zero edits to any existing script or policy file.
New files only, all named *-collapseband-b.*. The gatecover
tracer, the gatediseng analyzer, and the competent policy are
REUSED VERBATIM, never edited. This worker does NOT push,
bump, verify live, or merge into master; the coordinator
merges.
Status to coordinator: committed in worktree, pending
coordinator merge.

## Verdict: TIMELINESS-FAIL — judged exactly against the prereg bar

Prereg: evidence/2026-11-02/sim-collapseband-b-prereg.md,
commit 7a22a9c8f, written and committed BEFORE any judged
sim (proof test 10/10 ran after the prereg commit but before
any judged application; the proof test is pure, uses no
judged seeds, and changes no prereg word; the reused proof
tests were also re-run green on current master before the
screen: gatediseng 21/21, gatediseng-confirm 11/11).

Prereg bar (quoted in short): on the judged band of
collapsing seeds, EVERY seed must fire with lead >= 3 days
vs its reference day (first starvation day, else collapse
day) — the carried margin — AND >= 50% must reach lead
>= 6 days (the 51608-class margin). Screen: 64 fresh seeds
in blocks of 8, counted by collapse status ONLY, firings
computed only after screening stopped.

| leg | result | bar | outcome |
|---|---|---|---|
| Carried-margin leg (every band seed lead >= 3) | 1/4 seeds (only 79064, lead 5) | 4/4 | FAIL |
| 51608-class leg (>= 50% at lead >= 6) | 0/4 seeds | >= 2/4 | FAIL |
| Cross-check: thin analyzer vs reused analyzer, first (c) firing | 0 mismatches on 4/4 band seeds | Any mismatch = loud failure | PASS |
| Day-1 identity + determinism | Day-1 row present and numeric on 64/64; rows == daysAlive on 64/64; 79001 re-run byte-identical | Failure = substrate drift / INSUFFICIENT-DATA | PASS |
| Screen integrity | 64 screened, 4 collapsing, stop rule met exactly at budget exhaustion (4th collapse in the final block) | No widening, no redefinition | HELD — no mid-run change |

TIMELINESS-FAIL means: timeliness is NOT re-confirmed.
51608's in-time firing (day 15 vs starvation day 21) still
stands as a single-village observation, but it is now
outnumbered on fresh evidence: on the first fresh band
that actually contains collapsing villages, (c) warns in
time on 1 of 4 and reaches the 51608-class margin on 0 of
4. NO deploy claim may cite this arm for timeliness. This
verdict does NOT overturn the gatedisengconf-b PASS: that
pass was on the COST leg (survivor firing rate 2/12), which
this arm does not re-judge. What this arm overturns is the
assumption that the cost-confirmed rule also warns in
time — on collapsing villages, it mostly does not.

## Q — THE SCREEN (64 fresh seeds, 79001-79064, 30d competent)

Screened in blocks of 8; collapse counted per block, (c)
firings computed only after the screen stopped (block
summaries printed collapse status, starvation counts, and
wave only — no firing was computed mid-screen).

| block | seeds | collapsing (cumulative) |
|---|---|---|
| 1 | 79001-79008 | 1 (79006) — cumulative 1 |
| 2 | 79009-79016 | 0 — cumulative 1 |
| 3 | 79017-79024 | 1 (79019) — cumulative 2 |
| 4 | 79025-79032 | 1 (79031) — cumulative 3 |
| 5 | 79033-79040 | 0 — cumulative 3 |
| 6 | 79041-79048 | 0 — cumulative 3 |
| 7 | 79049-79056 | 0 — cumulative 3 |
| 8 | 79057-79064 | 1 (79064) — cumulative 4 |

Collapse rate on this band: 4/64 = 6.25% — higher than the
pooled gatediseng-line history before this arm (1/60:
corpus 1/28, pilot 0/8, confirm-522 0/12, confirm-767
0/12). Pooled with this screen: 5/124 = 4.0%. Band-to-band
variance is large; a future collapsing-band screen should
still budget 64 seeds, not 12.

## Q — THE JUDGED BAND, SEED BY SEED (all four are 51608-class: collapsing WITH starvation deaths)

| seed | lost | first starvation | (c) first firing | lead | carried (>= 3) | 51608-class (>= 6) | why (c) fires / stays silent |
|---|---|---|---|---|---|---|---|
| 79006 | day 24 | day 23 (3 deaths day 23, 2 day 24) | — (never) | — | FAIL (no fire) | FAIL | CLIFF: final stretch 21-24 (S = 21, 7,560) -> 4,585 -> 0 -> 0. No strict 3-fall window can form: the store empties in 2 evenings, and the 0 -> 0 evening is flat, not a fall. |
| 79019 | day 25 | day 20 (then 21, 23, 24) | 19 (S = 15, 9,850 -> 4,468, -54.6%) | 1 | FAIL (late) | FAIL | BOUNCE-DELAY: day-16 pantry RISES (9,850 -> 9,910), breaking the fall run; the first 3-fall window ends day 19, one evening before people start starving. |
| 79031 | day 22 | day 20 (2 deaths day 20, 2 day 21) | — (never) | — | FAIL (no fire) | FAIL | CLIFF: final stretch 19-22 (S = 19, 6,950) -> 2,500 -> 0 -> 0. Same shape as 79006: empty in 2 evenings, then flat at zero. |
| 79064 | day 26 | day 25 (2 deaths day 25, 2 day 26) | 20 (S = 15, 8,853 -> 5,450, -38.4%) | 5 | PASS | FAIL (misses by 1) | BOUNCE-DELAY: days 16-17 pantry RISES (8,853 -> 9,780 -> 10,284) before falling; the first 3-fall window ends day 20, five evenings before starvation — in time by the carried margin, one evening short of 51608-class. |

## Why the rule fails here — two mechanisms, both structural

(1) CLIFF-BLINDNESS (79006, 79031 — half the band). A
trend rule that needs three consecutive strictly-decreasing
falls needs three evenings of falling. These villages had
two: stand-down evening, one falling evening, then zero,
then zero again. The 0 -> 0 evening is not a fall under
any strict reading, so the rule cannot fire even on the
last evening of the village's life. This is not a
threshold that can be tuned: any 3-fall rule is blind to
a 2-evening emptying. Note the shared shape behind both
cliffs: the gate stands down LATE, after a long engaged
slide (79006 engaged through day 20 at 10,650; 79031
engaged through day 18 at 12,094), and then the store
falls off a cliff the moment the gate is off. (c) only
starts counting at stand-down, so it inherits the gate's
lateness and then runs out of evenings.

(2) BOUNCE-DELAY (79019, 79064 — the other half). A
one- or two-evening pantry rise right after stand-down
breaks the fall run and restarts the 3-fall clock:
79019's +60 rise on day 16 costs 3 evenings of lead
(firing day 19 instead of ~16); 79064's two-evening
recovery to 10,284 costs at least 2 (firing day 20
instead of ~18). On 79064 the village even unloads 8,280
kcal into the pantry on day 21, the evening AFTER firing
— a real recovery inside a collapse that still ends in
starvation on day 25. A trend rule that demands three
unbroken falls will always pay this bounce tax.

Common thread, stated plainly: on all four seeds the big
slide happens substantially WHILE ENGAGED (79019 falls
22,450 -> 9,850 across days 6-14 before standing down
day 15; 79064 falls 40,850 -> 8,853 before standing down
day 15). The (c) rule's stand-down anchor means it starts
watching only after most of the fall has already happened.
51608 is the exception that made the rule look timely:
its final stand-down (day 12) came with four falling
evenings still to run before starvation (day 21).

## Sibling candidates on the same band (texture, NOT judged)

From the reused analyzer on the four band seeds:

| seed | (a) TOTAL-SLIDE | (b) HYSTERESIS | (d) FLOOR |
|---|---|---|---|
| 79006 (ref 23) | 16, in time | — | 21, late (lead 2) |
| 79019 (ref 20) | 15, in time | — | 15, in time |
| 79031 (ref 20) | 19, late (lead 1) | 19, late (lead 1) | 19, late (lead 1) |
| 79064 (ref 25) | 15, in time | 15, in time | 15, in time |

The failure is (c)-specific in shape, not sensor-wide:
(a) warns in time on 3/4, (d) on 2/4. The structural
difference is the lookback: (a) measures a 5-evening slide
regardless of engagement, so it catches the engaged slide
(c) ignores; (c) counts only post-stand-down falls, so it
starts late and then needs three more evenings. This does
NOT make (a) the replacement: (a) already failed its
fresh-pilot cost leg (4/8 = 50% survivor firings in
gatediseng-b). The tradeoff is now measured both ways —
(c) wins cost, (a) wins timeliness on collapsing villages
— and a future arm must decide it explicitly. No rule
dominates, and no swap is claimed here.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table /
wins — those are late-game states, and this screen carries
no such fields. NO wall movement is claimed. In-window,
screen (64 seeds): 60/64 survived 30 days (median 30, max
30); collapses 4/64 (all wave-2 villages, all
starvation-class); wave reach max 3 (38/64 reach wave 3;
26/64 reach wave 2); waves 4-5 not reached in 30 days
(expected — early window). Arc II/III/IV, regional ->
national, table, win flag: NOT REACHED IN WINDOW (0, as
expected — not a rate claim). National / table / wins: 0
in-window (stated, not a comparison).
Deaths across the screen: 1,378 total — villager combat
874, combat 189, expedition 115, starvation 25, monster
41, the wild 41, sickness 31, ambush 18, wound 16, the
rest single digits (including 2 Highbeam Deer kills).
Starvation deaths split: 17 on the 4 collapsing seeds
(5 + 4 + 4 + 4) and 8 on 5 SURVIVING seeds (79001: 1,
79003: 1, 79011: 2, 79021: 1, 79028: 3) — the 76712 shape
recurring: villages that starve people and live. Those
5 survivors are screen texture, not band members, under
the prereg definition (survival is survival).

## Sense test (SENSE-TESTING LAW: firing evenings + cliff evenings, judged)

(i) 79064, day 20 (the firing evening, pantry 5,450,
-38.4% vs the day-15 stand-down at 8,853): day 20 itself
is quiet on the pantry voice, but the evenings around it
speak it steadily — day 18: "You keep a day's food (450
kcal) — nothing extra for the pantry this time."; day 19:
"You keep a day's food (90 kcal) — nothing extra for the
pantry this time." A warning on day 20 would land inside
that run of thin-pack evenings, five days before anyone
starves — it reads as the village noticing in time, in
words matching the evenings around it. One qualification,
stated not hidden: day 21 speaks a recovery — "You keep a
day's food (1980 kcal) and unload 8280 kcal into Haven's
pantry." A warning on day 20 would look briefly wrong on
day 21, then right again as the store falls 10,840 ->
6,680 -> 5,350 -> 3,249 -> 800 -> 1,200 to the end. The
warning survives the qualification: a one-evening haul
inside a collapse does not un-notice a falling store.
(ii) 79019, day 19 (the firing evening, pantry 4,468,
-54.6% vs the day-15 stand-down at 9,850): day 19 itself
is quiet, but day 17 speaks "You keep a day's food (1350
kcal) — nothing extra for the pantry this time.", day 18
speaks a thinner version — "You keep a day's food (270
kcal) — nothing extra for the pantry this time." — and
day 20, the first starvation day, speaks it again (900
kcal). A warning on day 19 would sit between the 270-kcal
evening and the first starvation death: it reads as the
village noticing one evening too late to act, which is
exactly what lead 1 means. The sense judgment matches
the number: this warning is real but tardy, not false.
(iii) The cliff evenings (79006 days 20-24, 79031 days
19-22): on 79006 the pantry voice is SILENT through the
whole cliff (no pantry-voice line on any evening from
day 20's 10,650 to day 24's 0, under the pantry/hunger
filter) — the store empties with no voice at all, which
is itself a sense finding: the rule's silence matches
the village's silence, and both are the failure. On
79031 the voice DOES speak, but only on the day people
start dying — day 20 (pantry 2,500): "You keep a day's
food (1350 kcal) — nothing extra for the pantry this
time." plus "Hunger gnaws. The pack is thin — work the
green, haul it back, get it named at camp. That's the
whole game." A (c) warning was never available to speak
alongside it, because the store hit zero the next
evening. The rule's absence here is the failure, not a
false alarm avoided.
(iv) Villagers act like people in the surrounding
transcript (sampled, not just counted): barter by the
fire, mending in the bunks, identification attempts on
unknown shoots and nuts ("Nothing they can name with
confidence"), a leadership challenge ("We need to talk.
About who's actually running things here."), and the
thin-pack voice itself. The collapse evenings are not
robotic — they are quiet or hungry in ways that match
the pantry numbers. What is missing is not villager
humanity but a warning voice on the two cliffs.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's
inapplicability declaration (same reasoning as
gatediseng-b / gatediseng-confirm-b / gatedisengconf-b):
this arm changes NO game code, runs NO lever, and its
primary metrics are within-trajectory instrument
diagnostics (would-fire overlays on identical evening
series), not panel metrics. The tables above are reported
directly in the evidence file instead, on identical seeds
and identical trajectories.

## Metric review

(1) THE TWO-MARGIN DESIGN WORKED AS INTENDED. The
    carried leg (>= 3) and the 51608-class leg (>= 6)
    distinguish "in time" from "51608-class in time":
    79064 passes the first and misses the second by one
    evening, and the table shows both facts. Neither
    margin saves the verdict — the binding failures are
    the two no-fires and one lead-1 — so no margin
    revision is proposed for the next run on this
    evidence. If a future arm revises the margins, it
    must say which seeds change sides (here: relaxing to
    >= 1 would still leave 79006 and 79031 failing, so
    no margin relaxation within reason rescues this
    band).
(2) THE NON-STARVATION FALLBACK WENT UNTESTED. All four
    band seeds are starvation-class, so the reference-day
    fallback (collapse day when no starvation death) was
    never exercised on judged seeds. It remains a rule,
    not a finding; a future collapsing band with a
    non-starvation collapse would test it. This is not a
    gap in this verdict (the fallback is not load-bearing
    here), but it is recorded so the next arm does not
    assume it was tested.
(3) SCREEN ECONOMICS REVISED UPWARD. Collapse rate
    4/64 = 6.25% on this band vs 1/60 pooled before it:
    collapsing bands are findable with a 64-seed budget
    but not with a 12-seed band (a 12-seed band at 4%
    collapse rate finds zero collapses ~61% of the time
    — which is exactly what happened on 522 and 767).
    Future timeliness arms should budget 64, and should
    expect the early-stop rule (>= 4) to trigger only
    near budget exhaustion.
(4) THE (c)-vs-(a) TRADEOFF IS NOW MEASURED BOTH WAYS.
    (c) wins the cost leg on two confirm bands (0/12,
    2/12); (a) wins the timeliness leg on this band
    (3/4 in time vs (c)'s 1/4). Neither dominates, and
    (a)'s failed cost leg (4/8 pilot) still stands. A
    future arm that wants a timely AND cheap rule must
    either design a new rule (e.g. a lookback that
    counts engaged-slide evenings, or a non-pantry
    signal) or explicitly accept one leg's cost — it may
    not cite this arm for (a) without re-confirming (a)'s
    cost on a fresh band.
(5) HUNGER STREAK AS A NON-PANTRY SIGNAL (texture, not
    chased). The hungryStreak rises through all four
    collapses (79006: 2 -> 6; 79019: 3 -> 8; 79031: 0 ->
    4; 79064: 1 -> 3 by collapse) while the pantry
    voice goes quiet or thin. Backlog item (10)
    "sensor non-pantry collapse signal" is the natural
    home for this observation; this arm reports it for
    the coordinator and does not chase it mid-run.
(6) No metric, threshold, seed, leg, collapse
    definition, or rule definition was changed mid-run.
    Prereg committed (7a22a9c8f) before any judged sim;
    the proof test (10/10) ran after the prereg commit
    and before any judged application, uses no judged
    seeds, and changes no prereg word; block summaries
    counted collapse status only and no (c) firing was
    computed until screening stopped; the screen verified
    rows == daysAlive on all 64 seeds first try with no
    re-runs for judging; the thin analyzer's first firing
    matches the reused analyzer on all 4 band seeds; the
    day-1 identity check passed on all 64 seeds and the
    79001 determinism re-run was byte-identical. The
    verdict is judged only against the prereg header.

## Village assessment (plain words)

Sixty-four new villages, and for the first time the
patient rule meets villages that actually die — and it
mostly fails them. Two villages fall off a cliff: their
store goes from several thousand to nothing in two
evenings, and the rule, which needs three evenings of
falling to speak, never gets its third evening. Two more
villages bounce: their store ticks up for an evening or
two right after the warning switch goes quiet, which
restarts the rule's count, so it speaks one evening
before people starve in one village and five evenings
before in the other — in time by the old margin, but not
by the margin the one village that ever proved this rule
set. The other sixty villages survive, and five of them
starve people and live anyway, the way 76712 did. Nothing
here reaches national, the table, or a win — that wall
was never this run's question, and it did not move. The
blank filled is a hard one: timeliness is no longer
"still owed" in the abstract. It has now been tested on
a band that actually collapses, and it failed — the rule
that is cheap enough to deploy is not timely enough to
trust on the villages that need it most. What a future
arm owes is not another confirm band but a rule that can
see a cliff and a bounce, or an honest acceptance that
this rule warns late.

## Findings for the coordinator (to append to the backlog)

- TIMELINESS-FAIL on a fresh collapsing band (screen
  79001-79064, band 79006 / 79019 / 79031 / 79064):
  carried-margin leg 1/4, 51608-class leg 0/4. (c) warns
  in time on 1 of 4 collapsing villages and reaches the
  51608-class margin on 0 of 4. Timeliness is NOT
  re-confirmed; 51608 remains the sole in-time
  observation, now outnumbered 1-to-4 on fresh evidence.
  No deploy claim may cite this arm for timeliness. The
  gatedisengconf-b cost PASS is untouched (different
  leg, not re-judged here).
- CLIFF-BLINDNESS mechanism (79006, 79031): a store that
  empties within 2 evenings of stand-down (7,560 -> 4,585
  -> 0; 6,950 -> 2,500 -> 0) can never satisfy a strict
  3-fall rule — the 0 -> 0 evening is flat, not a fall.
  Structural, not tunable.
- BOUNCE-DELAY mechanism (79019, 79064): a 1-2 evening
  pantry rise right after stand-down restarts the 3-fall
  clock, costing 79019 its timeliness (lead 1) and 79064
  its 51608-class margin (lead 5, misses 6 by one).
- (c)-vs-(a) TRADEOFF now measured both ways: (a)
  TOTAL-SLIDE warns in time on 3/4 band seeds (79006 day
  16, 79019 day 15, 79064 day 15) vs (c)'s 1/4, because
  (a)'s 5-evening lookback counts engaged-slide evenings
  (c) ignores. (a)'s failed pilot cost leg (4/8) still
  stands; no swap is claimed.
- HUNGER-STREAK texture for backlog item (10) (sensor
  non-pantry collapse signal): hungryStreak rises through
  all four collapses (79006 to 6, 79019 to 8, 79031 to 4,
  79064 to 3) while the pantry voice goes quiet or thin.
  Not chased mid-run.
- SCREEN ECONOMICS: collapsing-band screens need a
  64-seed budget (collapse rate 6.25% this band, pooled
  5/124 = 4.0%); a 12-seed band finds zero collapses
  ~61% of the time at 4%, which explains 522 and 767.
- SURVIVOR-STARVATION texture: 5 surviving screen seeds
  starved people and lived (79001: 1, 79003: 1, 79011: 2,
  79021: 1, 79028: 3 deaths) — the 76712 shape recurring,
  not a band membership change.

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT + TOOLS-COMMIT INDEX CLOBBER (same known
  class): after commits 7a22a9c8f and 91ccb2602 the main
  index showed the committed files as staged deletions
  alongside the worktree copies. Repaired both times via
  git update-index --add --cacheinfo from the HEAD blobs,
  then verified tracked status clean and worktree hashes
  match HEAD. The commits themselves were correct
  throughout.
- FULL `git status` (with untracked scan) STALLS on this
  worktree (as in gatediseng-b / gatediseng-confirm-b /
  gatedisengconf-b); the tracked-only `git status
  --porcelain --untracked-files=no` returns in ~1s and
  was used for all verification.
- SCREEN CLEAN, FIRST TRY EVERY SEED: all 64 screen
  seeds verified on first try (rows == daysAlive each);
  no EPERM-flap retry was needed, no seed was re-run for
  judging (the 79001 determinism re-run is a verification
  duplicate, not a judged re-run), no line duplicated.
  Per-seed tracer cost ~15-30s; 8-seed blocks ran ~2-6
  minutes each.
- FRESHNESS VERIFICATION: rg seed-field scan over all of
  evidence/*.jsonl and *.json (78xxx: only 78201-78208,
  another lane, avoided; 79xxx: zero), whole-word .md
  scan (only aggregate numbers, not seeds), filename
  scan (no 79xxx band files), and goal hidden_files scan
  (only kcal values, not seeds) — all clean before the
  prereg was written. Screen seeds 79001-79064 are now
  consumed by this run. Disclosed limit: Loop A was live
  concurrently on other arms; a concurrent lane picking
  790xx after this scan would postdate it.
- check.js --quick NOT re-run: zero src/js, zero
  green-list files on this arm; nothing here touches the
  runtime.
- Loop A NOT touched (arms sim-npcdeadconf,
  sim-fightoutrec on scale-onramp); no other loop's
  worktrees or branches touched.

## Files

- Prereg: evidence/2026-11-02/sim-collapseband-b-prereg.md
  (commit 7a22a9c8f, before any judged sim)
- Proof test: scripts/test-collapseband-b.js (10 pure
  checks, no judged seeds; commit 91ccb2602)
- Thin band analyzer: scripts/analyze-collapseband-b.js
  (imports the reused analyzer; commit 91ccb2602)
- Evidence: evidence/2026-11-02/sim-collapseband-b.md (this file)
- Corpora: evidence/2026-11-02/sim-collapseband-b-screen.jsonl
  (64 lines, seeds 79001-79064, armed only, gatecover
  tracer verbatim),
  evidence/2026-11-02/sim-collapseband-b-band.jsonl
  (4 lines, the collapsing band),
  evidence/2026-11-02/sim-collapseband-b-summary.json
  (thin-analyzer band summary + verdict),
  evidence/2026-11-02/sim-collapseband-b-gatediseng-summary.json
  (reused-analyzer summary, all four candidates),
  evidence/2026-11-02/sim-collapseband-b-sweep.log
  (per-seed tracer stderr)
- Reused verbatim, never edited: scripts/trace-gatecover-b.js,
  scripts/analyze-gatediseng-b.js,
  scripts/analyze-gatediseng-confirm-b.js (proof re-run only),
  scripts/policies/competent.js
- Consumed by this run (no longer fresh): screen 79001-79064
