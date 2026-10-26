# sim-freshdays-b — what pantryFreshDays actually counts (DIAG ONLY, no game change)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1730Z, axis
food-economy, arm sim-freshdays-b. Takes the 1730Z next blank: the
fresh-days snapshot scope question left open by sim-preservesched-b
(evidence/2026-10-26/sim-preservesched-b.md, "Metric review" /
"Out-of-arm observation"): first-bound-line pantryFreshDays() on 38
racks-bound days runs 4.6 to 249.8 days (seed 9753 day 74: 249.8; day 64:
221.7; seed 9752 day 90: 132.0). The throttle saturates above 4 days, so
nothing in the preservesched verdict turns on the top of the range — but
a pantry holding ~250 days of fresh food is worth its own look.

Analyzer: `scripts/analyze-freshdays-b.js`. Sweep:
`scripts/sweep-freshdays-b.js` (reuses `scripts/substrate-capture.js`
unchanged + new `scripts/freshdays-capture.js`). Proof:
`scripts/test-freshdays-b.js`.
Canon: docs/CANON.md + docs/PRESERVATION.md (ladder: cleaned 2d < cooked
5d < smoked 30d < rendered 90d < pemmican 120d; "rot can't be smoked back
into food").

## Pre-registration (binding, MEASUREMENT.md §14 — written before the sweep ran)

Band: re-run of the preservesched band, same seeds (9750–9757),
competent-nofeast, 100d, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1.
The original corpus cannot decompose freshDays (substrate capture stores
only the scalar), so a fresh instrumented re-run is required; the band
label follows the reproduction check below.

Primary metric: component-sum coverage of reported pantryFreshDays on
reproduced high-value days (reported freshDays >= 50).
GO threshold: coverage >= 95% on EVERY reproduced high-value snapshot
(daily + cook-line) AND one named dominant component identified.
Horizon: 100d (same as the preservesched band — the high values live
inside it). Seeds: 9750–9757. Policies: competent-nofeast as above.
Judge against this header only. A miss is NO-GO, never re-scored; metric
doubts go under "Metric review" for the next run.

Reproduction branch (fixed here, before judging): the sweep also carries
substrate capture, so the racks-bound day set and the three named
first-bound-line values are checked against preservesched. If the day
set (327 total, 38/38 no-inflow subset) and the named values (within
0.15) reproduce, the band is "the preservesched band, reproduced". If
not, the band re-labels as "a fresh 8-seed competent-nofeast 100d band"
and the coverage verdict still stands on THIS band's high days — the
reproduction miss is reported, not hidden, and never used to re-score
coverage.

Dominance note (fixed here): "dominant component identified" is
descriptive, not a second bar — the largest aggregate bucket share over
high snapshots is named with its share. The teeth of GO are coverage.

## The definition, read from code (game.js pantryFreshKcal / pantryFreshDays)

pantryFreshDays() = pantryFreshKcal() / burn, where burn is the mean of
the positive entries of village burnHistory (rolling 7-day honest net
from villageEats: pantry outflow minus gives, plus the player's meal;
pre-endDay fallback is roster x 2000).

pantryFreshKcal() sums (kcalEach || 0) * (units || 1) over village
pantry items, skipping in this order: foodState 'preserved', foodState
'rendered', foodKind 'pemmican', then isSpoiled items (spoilDay + bonus
<= today). Everything else counts — with NO test for edible, known,
cooked, or fresh-vs-shelf-stable beyond the spoil boundary. Consequences
read from the code before any numbers (each checked against the corpus
below):

1. Cooked food counts (5d shelf — genuinely fresh, fine).
2. Cleaned meat and carcasses count, including inedible-until-processed
   stock: in-shell nuts (edible: false) and carcasses count at full
   kcalEach.
3. Unknown/unrevealed stock counts if it carries kcalEach > 0 (unknown
   flesh at 0 kcal contributes 0, so it cannot inflate the figure).
4. Pemmican bars count: real pemmican items carry foodKind 'meat' and
   foodState 'pemmican' (food.js:1118), but the exclusion tests
   foodKind === 'pemmican' — which no real pemmican item satisfies.
   The pemmican clause is dead for real bars, so 120-day shelf-stable
   pemmican is counted as "fresh" days. (Preserved/smoked 30d stock IS
   excluded; rendered fat IS excluded.)
5. Zero-unit stacks count at kcalEach x 1 (units || 1).
6. No double counting: one loop, one pass over the pantry array. Garden
   stock, packs, and the league pool are NOT in v.pantry and are not
   counted.
7. The denominator can deflate the figure upward: burn is pantry
   outflow only. A village that eats mostly self-caught food, receives
   gives, or has dead/away members draws little from the pantry, so
   burnMean falls far below roster x 2000 and the same stockpile reads
   as many more "days".

## Result: GO — coverage 100% on every high-value snapshot (bar 95%)

Reproduction first: the band reproduced EXACTLY. Total racks-bound days
327 (preservesched 327), all 38 no-inflow bound days present, and the
three named first-bound-line values within 0.04 of the quotes (9753
d74: 249.84 vs 249.8; 9753 d64: 221.69 vs 221.7; 9752 d90: 132.03 vs
132.0). The corpus is therefore "the preservesched band, reproduced",
not a fresh band. Wall numbers also reproduce preservesched exactly
(deaths 43, same cause shares — see below), which corroborates the
trajectory match beyond the bound-day set.

High-value days: 908 snapshots at reported freshDays >= 50, over 200
distinct (seed, day) pairs; maximum 314.5 days (seed 9753 day 89).
Component-sum coverage = 1.000 on EVERY high snapshot (min = max =
1): the decomposition sums exactly to the reported freshKcal, because
it replays the same loop. Rebuilt days (countedSum / burnMean) match
reported days within 1% on all high snapshots. The instrument is not
approximating the function — it IS the function, itemized.

Dominant component (named): UNSTAMPED STOCK-DOOR PANTRY ITEMS — items
with no foodState, no foodKind, and no edible flag — 75.8% of all
high-day counted kcal. stockPantry and deposit doors stamp name,
kcalEach, units, and spoilDay, but not foodState/foodKind/edible, so
the fresh-days numerator cannot tell foraged stock, pit meat, alien
rations, or starting staples apart by kind. The remaining 24.2% is
ready-state plants (Burdock 12.5%, Muscadine Grapes 5.9%, Staghorn
Sumac 5.8%). By name over high snapshots: Rice 24.8%, Foraged food
24.0%, Canned soup 17.5%, Burdock 12.5%, Muscadine 5.9%, Sumac 5.8%,
Dried beans 4.3%, Snared meat 2.0%, Expedition haul 1.3%, Winner's
share 1.0%, pit meats ~0.9% combined.

## Answer in plain words: what "250 days" really is

pantryFreshDays() counts something BROADER than edible fresh stock, in
two ways — and both matter more than any single item class:

(a) IT COUNTS SHELF-STABLE STAPLES AS "FRESH." Starting pantry goods
with spoilDay 366 — Rice, Canned soup, Dried beans — make up 46.6% of
high-day counted kcal. They are not spoil-risk fresh food; they are a
year's larder, and they count because the function only excludes
preserved/rendered/pemmican-kind/spoiled. Preserved (smoked) stock IS
correctly excluded (49,219 kcal excluded on 9753 d74 alone), rendered
fat is excluded, and immortal stock (spoilDay 9999, e.g. "Can labeled
BEANS") is only 0.16% of high-day kcal — small, real, and counted
forever. Pemmican bars WOULD also count (the foodKind miss proven in
the unit test), but no pemmican appears in high-day pantries on this
band, so that clause is a live code property with 0% measured share
here — not a driver of these figures. Inedible-until-processed stock
(in-shell nuts, carcasses) would count too, but likewise measures 0%
on high days here.

(b) THE DENOMINATOR IS PANTRY DRAIN, NOT VILLAGE NEED — and this is
the bigger distortion. On seed 9753 day 74 (the quoted 249.8): counted
fresh stock is only 42,687 kcal, and the burn denominator is 170.9
kcal/day for a 9-person roster. 42,687 / 170.9 = 249.8. At the roster's
full need (9 x 2000 = 18,000 kcal/day) that same stockpile is 2.4
days; counting the correctly-excluded preserved stock too, the whole
pantry (91,906 kcal) is 5.1 days. Band-wide, the median daily snapshot
reads 16.0 "fresh days" on 23,895 counted kcal — about 1.3 days at full
need — and the median high-day ratio of reported days to
roster-x-2000 days is 61.9x. The burn clock is honest about what it
measures (pantry outflow net of gives, per the villageEats r3 comment:
self-caught food never touches the pantry, so it never enters burn) —
but a village that eats mostly around the pantry will always read as
holding absurd "days" of food. The figure is pantry-drain days, not
survival days.

## Do prior cited figures need correcting?

NO numeric correction; ONE interpretation correction. The preservesched
figures reproduce exactly (249.84 / 221.69 / 132.03 vs quoted 249.8 /
221.7 / 132.0; range 4.6–249.8 stands), and the preservesched verdict
does not turn on them (the throttle saturates above 4, and the throttle
reads the same function, so its behavior is unchanged). What must
change is the READING: "the pantry holds ~250 days of fresh food"
should read "the pantry reads 250 pantryFreshDays units — about 2.4
days of fresh stock at the roster's full need, on a day the pantry
drained only 171 kcal". Any future evidence that uses freshDays as
"days the village could eat" should use fallbackDays (counted /
roster x 2000) instead; freshDays remains valid as a pantry-drain
gauge and as the throttle's own input.

Out-of-arm observation (logged, not chased): because the throttle
engages at freshDays > 4, its effective kcal threshold swings with
burn — on a 171-kcal-burn day the throttle engages on a pantry holding
under 700 fresh kcal. Whether the throttle should key on drain-days or
on need-days is a design question for a future arm, not a finding of
this one.

## Sense sample (plain words — meaning, not just counts)

Seed 9753, day 74: Courtney checks the pantry before heading out and
the game tells her — and the player — "the shelves are full, ~250 days
of fresh on hand… leaves the fish nets standing and turns to the wood
run instead." Her cook lines that day are all plain (silenced
racks-full, matching preservesched's 0 spoken / 3 silenced). The day's
real pantry: 42,687 kcal of counted stock (Rice 13,000; Canned soup
7,500; Foraged food stacks ~15,600; Dried beans 1,950; Winner's share
1,800; pit/snared meats ~2,800) plus 49,219 kcal of smoked stock on
full racks. That IS a full pantry — a village with five days of food
and full racks, standing its fishers down, is a coherent story. The
incoherent part is only the number the game speaks: no villager with
eyes would call five days of food "250 days". The voice is faithful
to the function and unfaithful to the pantry. The fix, if Steve wants
one, is in the words or the denominator — not in the stockpile, which
is real, modest, and sensible: mostly starting staples the village has
husbanded plus recent foraging, not a hoard.

## Village assessment

What the village looked like: on the surviving seeds, a village living
mostly around its pantry — foraging, depositing scholar hauls
(Muscadine, Sumac, Burdock), smoking yesterday's pile onto full racks,
and standing down production whenever the drain-gauge reads full.
Starting staples (rice, canned soup, beans) anchor the pantry all run;
they are the reason high "fresh days" persist even on days with little
new foraging. Nobody starved on the strength of a 250-day pile: the
pile was never 250 days.

Who thrived and died and why: 43 deaths across 8 seeds, identical in
count and cause shares to preservesched (corroboration, not new
data). Top causes: the arena 15, starvation 7, monster 4, a wound that
wouldn't close 4, sickness 4, ambush 3, dehydration 3, old stare 1,
alien 1, lockjaw 1. Seeds 9751 (day 48) and 9754 (day 97) lost their
villages; the other six survived to the 100d horizon. Seed 9753 lost
four (arena x2 early, monster day 55, old stare day 76) and still held
its pantry together — the deaths are contest/arena/monster-shaped,
not pantry-shaped.

What knowledge/capabilities were missing: nothing in this arm's scope
— the blank was the instrument's meaning, and it is now filled: the
function is itemized, its denominator is named, and its staples share
is measured. The remaining knowledge gap is the throttle's keying
(drain-days vs need-days), logged above as out-of-arm.

Blanks filled: (1) pantryFreshDays decomposition — every high-day
value now breaks into named components summing exactly to the total.
(2) The 250-day figure's meaning — drain-days, not survival days, with
the 2.4-day full-need equivalent. Documented, not fixed: no game-code
change was made (DIAG only), and no prior evidence needs numeric
revision.

## Wall numbers (this band, competent-nofeast, seeds 9750–9757)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave reach: wave
3 on 9750, 9753, 9754, 9755; wave 2 on the rest. Median survival: 100d
(censored at the 100d horizon; 9751 lost day 48, 9754 day 97).
Rank stayed village on all 8 seeds. Arc II/III/IV and regional-stage
reach are not recorded in this corpus and are not estimated here. The
scale wall stands on this band; this arm closes a measurement-meaning
blank, it does not move the wall numbers.

Verdict (judged against the pre-registered bar, not re-scored): GO.
Coverage is 1.000 >= 0.95 on all 908 high-value snapshots, and the
dominant component is named (unstamped stock-door items, 75.8%).

## Metric review

- The pre-registered metric held trivially in one sense and usefully
  in another: coverage is 1.000 by construction (the recorder replays
  the function's loop), so the bar's real work was forcing the
  decomposition to exist at all — the verdict's substance is the
  bucket shares and the denominator analysis, not the 1.000. A future
  run reusing this metric should pre-register a bar on a bucket share
  or on the denominator ratio instead, where a miss is possible.
- "Dominant component" as pre-registered was descriptive (largest
  aggregate share), and two different cuts both deserve the name:
  by spoil class, dated stock is 99.8%; by item class, unstamped
  stock-door items are 75.8%. The evidence names both rather than
  crowning one, because they answer different questions (how much is
  immortal vs what kind of thing is it). No re-scoring was involved:
  coverage alone carried GO.
- High-value day definition (>= 50) was generous: 200 distinct days
  qualified, and the top of the range (314.5) exceeds the preservesched
  quote (249.8) because daily snapshots catch instants the bound-line
  snapshots don't. The verdict does not depend on the 50-day cut: the
  median-day analysis (16.0 reported vs ~1.3 full-need days) shows the
  same denominator story at ordinary values.
- No revision proposed for THIS metric: it answered its question.
  For a future run that wants the throttle keying settled: compare
  throttle engagement under drain-days (current) vs need-days
  (fallbackDays) on identical seeds, and report which threshold the
  village's behavior actually tracks.
- Out-of-arm observation (logged, not chased): throttle effective
  kcal threshold swings with burn (see above). Also: stock-door items
  carry no foodKind, so monster-meat shares in the pantry cannot be
  measured from pantry snapshots — pit/snared meat is visible only by
  name, not by kind. A future pantry recorder that wants meat shares
  must classify by name or stamp kind at the door.

## Reproduction check (this run)

- Sweep `scripts/sweep-freshdays-b.js` ran 8 seeds, 100d,
  competent-nofeast, in ~13s total; corpus at
  `evidence/2026-10-26/sim-freshdays-b-corpus/` (8 files, no
  truncation: cookSeen <= 424 per seed against SAYCAP 1000).
- Analyzer `scripts/analyze-freshdays-b.js` prints reproduction,
  high-day decomposition, and wall numbers.
- Proof `scripts/test-freshdays-b.js` green in this worktree, exit 0:
  unit decomposition (preserved/rendered/pemmican-kind/spoiled
  excluded; real pemmican bars, in-shell nuts, carcasses, and
  zero-unit stacks counted — each asserted), corpus validity (8
  seeds, competent-nofeast, no truncation), reproduction (327 total
  bound days, 38/38, named diffs <= 0.04), coverage >= 0.95 on all
  908 high snapshots (observed 1.000), dominant component named,
  rebuilt days within 1% of reported on all high snapshots.
- Determinism legs: the re-run reproduces the preservesched
  trajectory exactly on every checked dimension (bound-day set,
  named values, death count and cause shares), so the decomposition
  attaches to the same days preservesched quoted — no fresh-band
  fallback was needed. No jest was run (nothing to test in jest —
  the proof is node, not jest). No [needs-eyes]: this lands a
  measurement, not a player-visible change.
- No game-code change: zero src/js files touched. Files in this
  commit: scripts/freshdays-capture.js, scripts/sweep-freshdays-b.js,
  scripts/analyze-freshdays-b.js, scripts/test-freshdays-b.js,
  evidence/2026-10-26/sim-freshdays-b.md, and the 8 corpus files.
