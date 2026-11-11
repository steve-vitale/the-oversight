# Fishing — first numbers (arm sim-fishfirst-a)

Run fleshout-20261111T0215Z, Loop A. Coverage Program Tier 2 #3 (Steve order
2026-11-10 11:11 CST "Measure all"). Prereg:
evidence/2026-11-10/sim-fishfirst-a-prereg.md (committed BEFORE any judged
sim). Band 180233–180240, 8 seeds, competent policy verbatim, 150d
death-aware horizon. Zero src/js. Instrument + proof:
scripts/fishfirst-instrument-20261110.js, scripts/fishfirst-driver-20261110.js,
scripts/fishfirst-analyze-20261110.js, scripts/test-fishfirst-a.js (51/51).

Canon: docs/CANON.md read first; **there is NO FISHING.md in docs/** — no
canon doc covers fishing, and none is invented here. Mechanics as coded:
villager fish duty (game.js ~7182, bal-survival 2026-10-10), scholar
line-fish (game.js ~15966, ecology-fixed 2026-10-10), gill net (game.js
~3910 setNet / ~3983 haul), trader gift of 2 smoked fish (game.js ~26993).
Staffing context: evidence/2026-10-26/sim-fishstaff-b.md. Backlog #1072
(fish staffing fallback fix shape) is a BUILD queued behind these first
numbers — NOT implemented here.

## Verdict: GO on instrument validity + complete first-numbers capture

| GO check | Result |
|---|---|
| Every fishing event classified by method + caller, none 'other' | PASS — 1,279/1,279 deposits named (0 null-name); 74/74 carcasses with an origin (0 null-origin); teleFish 0, netSets 0 (both proven live in fixtures, dead under competent — the zeros ARE the finding) |
| Every wrapped method's call path verified live or marked dead | PASS — 9 wraps live in the pilot (stockPantry, foodCarcass 7/8, tele, assignTask, noteDeed, creditDeed, pantryDraw, eat, cleanCarcass 7/8); 4 proven live in fixtures and dead under competent (setNet, eatOne, eatStashOne, offerDeal/appealToGoal — see Dead wraps) |
| Neutrality: OFF leg matches instrumented leg on days + end pantry kcal + deaths | PASS — 8/8 exact |
| Instrument errors 0 | PASS — 0 on all seeds, all legs |
| Complete first-numbers capture | PASS — per-seed tables for metrics 1–8, sense-test scenes quoted (with the stated cap limitation) |

A GO verdict makes NO landing claim and spends NO confirm band: there is
no lever here to land.

## The headline: the creek crew works, but the pantry decides when — and the scholar never fishes at all

In 869 village-days across 8 seeds, the village's creek crew is staffed
on 838 days (96%) and catches fish on **86** of them. The other 752
staffed-but-empty days decompose honestly: **432 days the pantry was
full, so the duty was redirected to wood/water/stone before it ever
touched the water** (PRODTHROTTLE: pantry > 4 fresh days); **104 days
the fish branch ran and found nothing** (one whole village, seed 180235,
has no water on its home board at all — yet staffed the crew for 143
days); **217 days every holder was sheltered inside** during a muster.
When the crew does fish it pays: **113,790 kcal** of 'Fish catch' (13.6%
of everything deposited in the pantry, the second-biggest duty food
source after foraging). The creeks are never fished out — the fish stock
grows on every watered seed, from 141 to 761 fish on seed 180233 — so
the limit is never the ecology. It is the pantry being full.

And the scholar never fishes. Not once, in any form, in 869 days:
**line-fish attempts 0, gill-net sets 0, fish carcasses 0, fish cleaned
0, fishWise learned 0/8 scholars, player fishing deeds 0.** The
competent policy never calls the scholar's fishing verbs — the same
class of dead branch cookfirst-a found for cooking. The scholar eats
fish anyway (7,025 kcal, 1.4% of their diet) — but only fish the
village caught and the pantry handed over ('Fish catch (smoked)' 4,485
+ 'Fish catch' 2,540). The village fishes; the scholar eats what the
village caught.

## Per-seed tables

Wall numbers (median survival 122.5d — middle two 116/129; 7/8
village-lost, 1/8 survived; wins 0, national 0, table 0; wave 5 on 2/8;
regional 6/8; deaths 650; starvation 4, 0.6% of deaths):

| seed | days | end | scale | wave | standing | deaths | end pantry |
|---|---|---|---|---|---|---|---|
| 180233 | 102 | village-lost | regional | 4 | 199 | 72 | 12,287 |
| 180234 | 50 | village-lost | village | 4 | 199 | 69 | 10,646 |
| 180235 | 150 | survived | regional | 4 | 195 | 71 | 2,400 |
| 180236 | 129 | village-lost | regional | 4 | 199 | 60 | 0 |
| 180237 | 116 | village-lost | regional | 4 | 199 | 127 | 0 |
| 180238 | 145 | village-lost | regional | 5 | 290 | 96 | 0 |
| 180239 | 144 | village-lost | regional | 5 | 365 | 101 | 1,000 |
| 180240 | 33 | village-lost | village | 4 | 115 | 54 | 36,668 |

Metric 1+2 — fishing events and yield kcal by method (duty / scholar-line
/ scholar-net / opportunistic / trader-gift):

| seed | Fish catch kcal | catch days | first catch | scholar line | nets | opportunist fish carcasses | trader gift |
|---|---|---|---|---|---|---|---|
| 180233 | 19,632 | 6 | d22 | 0 | 0 | 0 | unmeasured |
| 180234 | 1,734 | 3 | d44 | 0 | 0 | 0 | unmeasured |
| 180235 | 0 | 0 | — | 0 | 0 | 0 | unmeasured |
| 180236 | 6,045 | 9 | d50 | 0 | 0 | 0 | unmeasured |
| 180237 | 8,485 | 14 | d22 | 0 | 0 | 0 | unmeasured |
| 180238 | 38,799 | 26 | d93 | 0 | 0 | 0 | unmeasured |
| 180239 | 39,095 | 28 | d84 | 0 | 0 | 0 | unmeasured |
| 180240 | 0 | 0 | — | 0 | 0 | 0 | unmeasured |
| pooled | 113,790 | 86 | — | 0 | 0 | 0 | unmeasured |

1,323 kcal per catch-day on average. The two late-catch seeds (180238
first catch day 93, 180239 day 84) still land ~39,000 kcal each — when
the pantry finally thins, the crew fishes hard. Trader gift: 0 smoked
fish in any pack snapshot, 0 eaten — UNMEASURED, not zero-proven (the
gift is an inline inventory push with no wrappable method; it may have
fired and been eaten the same day, before the snapshot).

Metric 3 — who fishes. Scholar: nobody (see above). Villager duty
holders by days (top 5 pooled): gen_0kinwxe, Fisherman, 121d (seed
180239); aki_tanaka, Fisherman, 73d + 8d (seeds 180238, 180234);
gen_6qm4476, pottery instructor, 62d (180233); benoit_lambert, Baker,
56d (180238); app_mgpsphjg751, farmer, 50d (180238). Food occupations
are NOT the fishers — whoever is free holds the duty, and the 1.4x
fisherman efficiency rarely applies (only 3 holder-instances with a
fishing occupation across 8 seeds). Fishing deeds: 149, all
villager-side (top: benoit_lambert 23, visjoin_92 19, visjoin_97 17,
app_mgpsphjg751 15); 0 player deeds. **No villager ever earns fishing
foodXp** (0 snapshots with a fishing foodXp key): the duty grants a
deed and +1 trust, but nobody gets better at fishing by doing it —
unlike preserving, where the racks teach (cookfirst-a / preserve-a).
Fishermen stay fishermen only by occupation, never by practice.

Metric 4 — duty-fish staffing: 1,142 assignTask('fish') calls, 1,099
ok, 43 refused (3.8%), 0 nulls, 0 other-path calls (offerDeal /
appealToGoal never called for fish — fishstaff-b's "no second path"
re-verified). Every refusal is trust-below-10 (all 43 refusal reasons
are trust lines: "Ask someone who trusts you" / "You haven't earned
that yet" / "Why should I listen to you?"). 8 refusers; the worst is
gen_wip1lua with 17 refusals. The repeat-ask shape persists despite
the landed fish fallback (sim-fishfallback-b): 28 (seed, vid, day)
cells hold the 43 refusals, max 4 asks of one villager in one day, 11
cells with more than one ask. The fallback walks down the candidate
list inside one staffing call, but the outer crew loop re-reads the
top scorer each iteration — so a refuser can still absorb several asks
a day. Backlog #1072 stays queued as the build behind these numbers.

Metric 5 — fish stock over time. Home-board fish wildlife (sum of
regionFish() counts over the 9×9 home grid; read-only snapshot, never
backfilled):

| seed | first | min | max | last | water tiles | pantry fish peak (day) | end |
|---|---|---|---|---|---|---|---|
| 180233 | 141 | 141 | 763 | 761 | 16 | 9,984 | 0 |
| 180234 | 177 | 177 | 891 | 891 | 20 | 840 | 500 |
| 180235 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 180236 | 126 | 126 | 622 | 620 | 13 | 1,080 | 0 |
| 180237 | 151 | 151 | 807 | 801 | 17 | 1,200 | 0 |
| 180238 | 138 | 138 | 712 | 697 | 15 | 2,900 | 0 |
| 180239 | 119 | 119 | 621 | 549 | 13 | 5,392 | 0 |
| 180240 | 418 | 418 | 1,825 | 1,825 | 44 | 0 | 0 |

The stock only grows: min equals first on every watered seed. The
fished-out line ("walked the banks — the water's fished out") fires 0
times in the captured say sample, and the ecology outpaces the duty
everywhere — the creek is effectively inexhaustible under competent.
Seed 180235 is the exception that proves the staffing rule: 0 water
tiles, 0 fish, yet 301 staffing calls and 357 holder-days. The policy
staffs the creek crew without ever checking whether the home board has
water. Seed 180240 is the other extreme: 44 water tiles and 1,825 fish,
and the village dies on day 33 with a 36,668-kcal pantry — the throttle
stood the crew down (187 redirects) while the village died of violence,
not hunger. Pantry fish is eaten, not hoarded: end 0 on 7/8 seeds.

Metric 6 — fish kcal share vs forage/hunt/garden. Pantry deposits by
name (pooled, 838,459 kcal total): Foraged food 294,354 (35.1%),
Expedition haul 261,205 (31.2%), **Fish catch 113,790 (13.6%)**,
Aid from Stonebridge 53,202, Expedition meat 42,465, Garden harvest
26,181 (3.1%), Aid from Emberhold 23,155, Snared meat 10,290, Pit meat
~4,383, System-replicated stew 2,400, Aid from Thornfield 6,434,
Trial feast 600. **'Game meat': 0.** The hunt duty is never staffed
under competent (no 'hunt' staffing call in scripts/policies/
competent.js — the only "hunt" hits are wave-3 monster-hunt comments),
so the village's meat comes from the scholar's traps (74 trapped
carcasses, 32,650 kcal) and expeditions, never from a hunt duty. Fish
is the second-biggest DUTY food source (forage 294,354 > fish 113,790
> garden 26,181 > hunt 0). Village-meal draws: fish 100,121 kcal of
2,713,457 drawn (3.7%) — 'Fish catch' 97,994 + 'Fish catch (smoked)'
2,127. The meal draws 86% of what the duty lands (97,994 drawn of
113,790 landed, plus smoked stock drawn separately).

Metric 7 — fish spoilage. Spoiled-present fish kcal at snapshot: 0 on
every seed, every day — the same dawn-sweep limitation as cookfirst-a:
the sweep purges pantry rot BEFORE the daily snapshot, so the snapshot
cannot see it. **Fish spoilage is UNMEASURED, not zero.** 'Fish catch'
spoils in 3 days (stockPantry spoilDay = day+3), and the duty lands in
bursts (up to ~3,900 kcal on a catch day), so rot is plausible between
landings — but no instrument here sees it. The say corpus has 0
spoil/rot lines mentioning fish (same early-game cap caveat as below).
Smoked-fish stock: drawn 2,127 kcal by the meal; eaten 4,485 kcal from
the pack (see Metric 8). No spoiled fish was ever purged via eat
(purged 0 on all seeds).

Metric 8 — wall numbers: wins 0/8, national 0/8, table 0/8, wave-4
unlock 8/8, wave-5 unlock 2/8, regional 6/8, standing median 199,
median survival 122.5d (middle two 116/129), deaths 650 over 869
village-days. Death causes: villager combat 248, expedition 152,
combat 117, "the wild" 70, monster 15, a wound that wouldn't close 10,
arena 10, sickness 6, starvation 4, dehydration 1, the rest single
alien/monster names. The villages die by violence (248 + 152 + 117 =
517 of 650 deaths are combat/expedition), not hunger — starvation is
0.6%. The scale wall stands (0/8 national, 0/8 table, 0 wins), same as
every recent run.

## Dead wraps (proven live in the proof miniature, 0 calls in the pilot)

setNet, eatOne, eatStashOne, offerDeal, appealToGoal. Each fires in
the proof (setNet records a null without a net; eatOne/eatStashOne
wraps are installed and record on call; offerDeal/appealToGoal wraps
are installed — the proof asserts no fish call came through them).
Their pilot zeros ARE the finding — the competent policy never sets a
net, never eats one item at a time, never deals/appeals for fish —
not an instrument gap. foodCarcass / cleanCarcass fired on 7/8 seeds
(seed 180240 died day 33 with 0 carcasses of any kind).

## Reconciliation

- Eat: tele('eat') total 512,740 vs wrap-attributed 484,545, gap
  28,195 (5.5%). Per-seed gaps: 1.8% / 2.4% / 2.0% / 4.7% / 9.5% /
  0.0% / 10.8% / 27.6%. EXPLAINED in mechanism, not a miss: `eat()`
  adjusts absorbed kcal after the wrap's gross count (shellgut −25%,
  engorge +20%, disease absorption debuff — game.js eat()), the same
  mechanism cookfirst-a (2.3%) and preserve-a (4.8%) recorded. Seed
  180240's 27.6% is the outlier (short run, 33 days); the mechanism is
  identified in code, not attributed to that scholar's statuses
  per-seed (see Metric review).
- Scholar fish eaten (7,025 kcal) vs meal-drawn fish (100,121 kcal):
  different instruments, different eaters — the scholar eats from the
  pack (pantry→pack transfers), the meal draws from the pantry. The
  2,540 kcal of plain 'Fish catch' the scholar ate arrived in the pack
  by transfer, not by catching.
- No-catch day split (838 holder-days): 86 catch days + 432
  throttle-redirect days + 104 fished-out/no-water days + 217
  all-sheltered days = 839, one day over the analyzer's 838 — the
  fishstaff-b scholar-day seam (scholar days stall/skip relative to
  loop days, so a deposit day-key and a snapshot day-key can disagree
  by one). The split is approximate to ±1 day, not exact.
- Deeds (149) vs catch days (86): the 'fishing' deed is capped per
  doer per day, not per day — up to 2 fishers × 3 parts can each earn
  one, so 149 deeds over 86 catch-days (≈1.7/day) is consistent.

## Instrument notes (found while proving, fixed, proven)

1. **noteDeed IS creditDeed('player', ...)** (tracks.js): wrapping
   both double-counts every player deed — the proof caught it (3
   records for 2 calls). Fix (this arm): the noteDeed wrap sets a
   suppression flag around the original call and the creditDeed wrap
   skips while it is set, so one deed = one record. Proof B8/B9 assert
   the dedup. Cookfirst-a's instrument has the same latent
   double-count (harmless there: 0 player cooking/preserving deeds
   ever fired); flagging it here so a later arm does not re-learn it.
2. **The full-pantry zero is throttle, not a dead duty** (proof C3 +
   B25): in the 12-day miniature the duty stocked 0 Fish catch while
   the pantry held ~12 fresh days — throttleRedirects 120 in 20 days
   on the debug seed. The B25 control (drain the pantry, resolve one
   staffed fish assignment) stocks fish immediately, proving the
   stockPantry backstop records real duty fish when the throttle is
   off. The pilot's 2,199 redirects are the same mechanism at scale.

## Sense-testing (SENSE-TESTING LAW)

The staffing voice is honest and the redirect voice is the most
self-aware line in the corpus — but the catch itself is never heard.

Assignment (92 captured): "📋 Kayden — 🎣 Fish. They'll report back by
next part." (seed 180233, day 4). The assignment line names the person
every time; no two seeds repeat the same fisher.

Redirect (13 captured, the throttle speaking): "🌿 A person, maybe 40s,
with freckles checks the pantry before heading out — the shelves are
full, ~8 days of fresh on hand… leaves the fish nets standing and
turns to the wood run instead. The pantry can't take more; the wild
will keep." (seed 180233, day 2). The same shape fires with different
names and alt-tasks (wood run / stone pile / water run) across seeds —
it reads as a repeated decision, not a repeated line, because the
pantry number and the alt-task change.

Catch: NONE captured. The duty's own line ("🎣 X worked the creek — N
fish, +Y kcal to the pantry.") fires 0 times in the say sample — not
because it never fires in the game (86 catch days prove it does), but
because the 200-line-per-seed cap exhausts by day 7–9 on every seed
while the first catch lands on day 22–93. The sense sample covers only
the first week of each run; every catch happens after the sample ends.
The counts are complete; the voice of a catch is unquoted. (Metric
review: narrow the regex, sample by day strata.)

Flagged as robotic: nothing in the fishing voice itself. The robotic
things are the ABSENCES: the scholar never fishes, so the line-fish
voice ("You read the water — the deep cut by the bank…") fires 0 times
in 869 days; and on seed 180235 the village staffs a creek crew for
143 days on a board with no water, and the only honest line it ever
gets is the throttle redirect — the crew never once says "there is no
water here."

## Village assessment (plain words)

Eight villages, and in every one the pattern is the same: the village
fishes, the scholar doesn't. The creek crew is the village's second
food leg — when the pantry runs thin the crew works the creek and the
fish comes in by the thousand-kcal day — but the pantry decides when
they fish, not the crew: while the shelves are full the fishers are
sent to cut wood and haul stone instead, and the fish keep multiplying
in creeks nobody is working. One village has no creek at all and still
keeps two people "on the creek" for five months, because nobody ever
checked whether there was water to fish. The scholar, meanwhile, never
once picks up a line or stakes a net in 869 days — the policy that
plays them never asks — and eats only the fish the village hands over.
The villages that lived longest are the ones whose pantry thinned
enough, late enough, for the crew to actually fish (seeds 180238 and
180239, ~39,000 kcal each). Nothing here reached national or the
table — the scale wall stands (0/8 national, 0/8 table, 0 wins), same
as every recent run — and the villages died fighting, not starving
(4 starvation deaths in 650).

## Blanks filled / documented

- FILLED (measurement): fishing's first numbers — every method counted
  per caller, per seed; the duty measured exactly (deposit + deed +
  snapshot agree); the throttle decomposition of empty crew-days;
  home-board fish stock over time; fish share vs forage/hunt/garden.
- FILLED (instrument): the noteDeed/creditDeed double-count — found in
  proof, fixed with a suppression flag, proven 51/51.
- DOCUMENTED (finding): the fish duty stands down whenever the pantry
  is full (2,199 redirects) — the "second food leg" only fishes in
  hunger (see Findings for the backlog).
- DOCUMENTED (finding): a no-water village staffs a creek crew for 143
  days (see Findings for the backlog).
- DOCUMENTED (finding): the scholar never fishes under competent; the
  hunt duty is never staffed under competent (see Findings for the
  backlog).
- DOCUMENTED (finding): fishing grants no foodXp — no skill progression
  (see Findings for the backlog).
- DOCUMENTED (limitation): fish spoilage unmeasured (dawn sweep purges
  rot before snapshots); trader-gift smoked fish unmeasured (inline
  push, no wrap); catch voice uncaptured (say cap exhausts day 7–9).

## Findings for the backlog

(For the coordinator to append to sim-findings.md — this arm does NOT
edit that file itself.)

- [open] 2026-11-10 — fishing / prod-throttle — the fish duty is
  redirected to wood/water/stone on 2,199 resolutions across 8 seeds
  whenever the pantry holds >4 fresh days; two seeds never caught a
  fish in 150/33 days. The "second food leg" only fishes in hunger.
  Design question: should the crew bank preserved fish while the
  pantry is full, or is standing down correct? (sim-fishfirst-a.)
- [open] 2026-11-10 — fishing / staffing — seed 180235 has 0 water
  tiles on its home board yet staffed a creek crew for 143 days (301
  calls, 299 ok, 0 fish). The policy never checks whether the home
  board has fishable water. Fix shape: skip fish staffing when the
  home board has no water tiles with fish (or say so once and stop).
  (sim-fishfirst-a.)
- [open] 2026-11-10 — fishing / scholar verbs — the scholar never
  fishes under competent: line-fish attempts 0, gill-net sets 0, fish
  carcasses 0, fishWise 0/8. Same class as the cookfirst-a dead branch
  (cookPack 'raw' gate): the policy never calls doAction('fish') or
  setNet. (sim-fishfirst-a.)
- [open] 2026-11-10 — hunting / staffing — 'Game meat' deposits are 0
  across 838,459 kcal because competent never staffs the hunt duty
  (no 'hunt' staffing call in scripts/policies/competent.js). The
  village's meat comes from the scholar's traps/expeditions. Needs its
  own measurement arm. (sim-fishfirst-a.)
- [open] 2026-11-10 — fishing / skill — the fish duty grants no
  foodXp: 0 snapshots with a fishing foodXp key in 869 village-days.
  Villagers never get better at fishing by doing it, unlike
  preserving (racks teach). Design question: should fishing teach?
  (sim-fishfirst-a.)
- [open] 2026-11-10 — fishing / trader gift — the trader's 2 smoked
  fish per generous meal are unmeasured (inline inventory push, no
  wrappable method; 0 pack snapshots caught one). Add a wrap if the
  exogenous inflow matters to a later arm. (sim-fishfirst-a.)
- [open] 2026-11-10 — fishing / instrument — noteDeed IS
  creditDeed('player', ...) (tracks.js), so wrapping both
  double-counts player deeds. Fixed in the fishfirst instrument with
  a suppression flag; cookfirst-a's instrument has the same latent
  double-count (harmless there: 0 player deeds fired). (sim-fishfirst-a.)

Backlog #1072 stays queued (fish staffing fallback fix shape): the
landed fallback cut refusals to 43/1,142 (3.8%) but the repeat-ask
shape persists (max 4 asks of one villager in one day) — the numbers
behind the queued build are now measured.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The say-sample cap (200 lines/seed) plus the broad regex (which
  matches 'water') exhausts by day 7–9, while the first catch lands
  day 22–93. A later run that needs fishing voice should narrow the
  regex (fish|🎣|creek|nets, drop 'water') and sample by day strata
  instead of first-N. The counts are unaffected — only the voice
  sample is early-game only.
- The no-catch day split uses scholar-day keys; the 1-day seam (839
  vs 838 holder-days) is the fishstaff-b scholar-day stall. A future
  instrument should key snapshots to loop-day as well as scholar day
  (same note as fishstaff-b's metric review).
- The eat reconciliation gap (tele net vs wrap gross) is 5.5% pooled
  but 27.6% on seed 180240 (33-day run). The mechanism (absorption
  adjustments in eat()) is known in general; attribute the gap to the
  scholar's statuses (shellgut/engorge/disease) per seed next time.
- The "share of eaten kcal fish" headline (1.4% scholar pack) and the
  meal-drawn fish kcal (100,121) are different numbers from different
  instruments; the next run should decide which headline binds
  (carried from cookfirst-a / preserve-a).
- Fish spoilage needs a same-tick capture (a wrap on the dawn sweep's
  purge, or a tele event) — daily snapshots cannot see rot that is
  purged before they run (carried from cookfirst-a).
- The median-survival figure: the analyzer reports the upper median
  (129d); the true median of [33, 50, 102, 116, 129, 144, 145, 150]
  is 122.5d. Quote 122.5d.
- The talkturn-a cost bar is already known-wrong; this arm carries NO
  cost bar and does not re-judge it.

## Balanced panel (§15)

Not applicable, honestly: this is a MEASUREMENT arm with no lever
change and no before/after arms, so there is no panel comparison to
fabricate (same position as sim-fishstaff-b; cookfirst-a and
preserve-a likewise attached no panel). The control/neutral legs are
the neutrality proof, not a panel.

## Base + landing

Base at spawn: master cb7cd6695. No src/js change. Commits on branch
sim-fishfirst-a: prereg 7300e0413, instrument + proof 51/51 f99067038.
Corpus + this evidence to follow in the next commit. Corpus:
evidence/2026-11-10/perseed-fishfirst-a/ (16 files, seeds 180233–180240
x control+neutral) + evidence/2026-11-10/fishfirst-summary-fishfirst-pilot.json
(analyzer re-run reproduces it). Do NOT push, do NOT bump versions, do
NOT verify live. Do NOT merge — the coordinator merges with --ff-only.
