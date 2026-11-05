# KILLERSIM2 — killer simultaneity re-measure with a banking screen (Loop B verdict, run fleshout-loop-b-20261105T1322Z, arm sim-killersim2-b)

Axis: scale-onramp / winnability chain. DIAGNOSTIC ONLY, zero src/js.
No readyDemand move, no VETSHAPE flip, no gate/price/deed change, no
policy variant. Fresh band 99311–99342 (32 seeds), competent policy
verbatim, default env, 150d death-aware horizon. Banking screen, per
the 0915Z run's metric review: the screen says HOW it gets >= 4
banking seeds (volume at measured rates — see Prereg) before running.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-05/sim-killersim2-b-prereg.md`
(commit 62d500a2f). In short: Stage 1 SCREEN — 32 fresh seeds,
banking defined as >= 1 wave-4 kill AND the killer alive at end of
the kill day (same-day kill-and-exit does NOT bank). Target >= 4
banking seeds; fewer = UNDERPOWERED, never widened post-hoc.
Stage 2 MEASURE on the banking subset only: M1 days with >= 2
living killers, M2 first-killer survival, M3 second-killer
production (bar >= 2 kills), M4 ready days, plus the post-blood
death channel (contest/arena vs wild vs other) for each killer
death. Verdict DIAG-GO iff powered AND L>=2 days on <= 1 banking
seed AND >= 1 named mechanism (M1–M4, M3 with the n>=2 guard)
holds on >= 1 banking seed. DIAG-NO iff >= 2 banking seeds show
sustained pairs (>= 7 consecutive L>=2 days) with no mechanism
visible. INSUFFICIENT-DATA iff > 2 of 32 screen seeds carry
instrument errors. Balanced panel (§15): INAPPLICABLE for a pure
diagnostic on a fresh band with no before/after comparison —
stated, not fabricated.

## Verdict — DIAG-GO (judged strictly against the prereg)

- The screen is POWERED: **6 banking seeds** (99316, 99317, 99327,
  99328, 99334, 99337) — above the >= 4 target, at a 19% banking
  rate (6/32). The volume plan worked: prior bands banked
  25–37.5% of seeds under the looser killersEver>=1 count; the
  stricter banking definition cost 3 seeds here (see below) and
  the screen still powered.
- The gap is CONFIRMED on the banking subset: **0 days with two
  living killers on any of the 6 banking seeds** (0/6 with any
  L>=2 day; maxLiving 1 on every banking seed; 73 days with
  exactly one living killer, 0 days with two).
- Mechanisms hold on ALL 6 banking seeds: M1 dies-fast on 5/6,
  M2 never-arrives on 5/6, M4 made-late on 3/6, M3 clusters on
  0/6 (see M3 note — the guard bites correctly, it does not
  hide a finding).
- Instrument errors 0 on all 32 seeds; liveMissing rows 0;
  mismatch days 2, both exit-day boundary (see Metric review).
  The instrument is clean; the screen is powered; the verdict
  stands on the prereg's letter.

## THE ANSWER (plain words)

Two living wave-4 killers never coexist — not for a day, on any
of the six villages that bank a killer at all. And this time the
screen is big enough to say it properly: thirty-two villages,
two hundred wave-4 fights, ten kills — and the pair never forms.
Three of the nine villages that land a wave-4 kill don't even
bank it: their killer dies in the same fight, the same day, and
was never a living veteran for a single day. Of the six that do
bank, five produce exactly one killer ever, despite fighting
wave 4 five to twenty-one times. The one village that bloods a
second killer does it thirty-five days after the first killer
died — and the second killer dies the same day she lands her
kill, to a stranger, away from home. The longest-lived first
killer on the screen lasts thirty-three days, watches four more
wave-4 fights go by without another kill, and dies fighting at
home on the day her village falls. The pair never forms because
the second killer almost never arrives, and when one does, the
first is already dead — or the second dies in the act.

## The named mechanisms (with code citations)

1. M2 NEVER-ARRIVES — holds on 5/6 banking seeds (99316, 99317,
   99327, 99328, 99334). Each banks exactly 1 killer ever
   despite >= 5 wave-4 fights (6, 14, 21, 7, 14 fights). The
   post-first-blood numbers sharpen it: 45 wave-4 fights after
   first blood across the banking subset, 1 kill (2.2%) — the
   secondkiller finding (0/19 after first blood) reproduced on
   a bigger screen, now with the one post-blood kill named
   (99337's Aroha, who dies the same day). Code: kills score
   the ledger per killer (waveLedger.js); nothing spreads them.
2. M1 DIES-FAST — holds on 5/6 banking seeds (99316, 99317,
   99327, 99334, 99337). First-killer survival: [11, 7, 1, 33,
   8, 13] days, median **9.5d** (n=6 observed, 0 censored) —
   a real re-measure now, against the 11d (standaccum2), 9d
   (postblood), and 10d (killersim-a n=1) priors. All-killer
   intervals: [0, 1, 7, 8, 11, 13, 33], median 8d. Only 99328's
   Greta beats 14 days. Code: the death block (game.js
   hurtVillager path) and removeVillager choke point
   (betrayal.js) — the killer leaves the roster by death, and
   the readiness bar reads living roster only.
3. M4 MADE-LATE — holds on 3/6 banking seeds (99316, 99327,
   99334). First kills land day 54 of a 68-day run, day 72 of
   a 105-day run, day 107 of a 125-day run — each inside the
   last 30 days. Code: wave 4 unlocks only when standing
   reaches 100 (villageStandingTotal(), src/js/standing.js),
   so the first kill can only come late in a run that opens
   wave 4 late.
4. M3 CLUSTERS — holds on NO banking seed, and that is the
   guard working, not a missing measurement. The only
   multi-kill banking seed (99337, 2 kills) splits them 1–1
   (topShare 0.5 < 2/3), so there is nothing to cluster. The
   other five banking seeds have exactly 1 kill each — M3 is
   vacuous there by the prereg's n>=2 guard, reported as
   "only one villager ever killed", not as clustering evidence.

## The three seeds that kill but do NOT bank (the banking definition bites)

99326, 99331, 99333 each land exactly one wave-4 kill and lose
the killer the same day (survivalDays 0): Thabo Maseko kills
The Influencer day 91 and dies day 91 in combat at haven
('the wild'); Elijah Scott kills The Congregation day 91 and
dies day 91 in the arena, at haven, in combat; gen_0q7n84r
kills The Congregation day 79 and dies day 79 in combat at
haven ('the wild'). Under killersEver>=1 they would count as
banking seeds (9/32, 28% — right in the prior bands' range);
under the prereg's banking definition they do not, because the
killer was never a living veteran on any day. A third of all
wave-4 kills on this screen (3 of 10) are same-day deaths.
That is not a definitional quirk — it is the finding in its
sharpest form: the kill itself is often the killer's last act.

## Stage-2 measures (banking subset only, n=6)

- M1 — days with >= 2 living killers: 0 total, 0 seeds. Days
  with exactly 1: 73 total (99316: 11, 99317: 7, 99327: 1,
  99328: 33, 99334: 8, 99337: 13). Longest L>=2 run: 0.
- M2 — first-killer survival (exit-based = death-based here;
  no killer was exiled): intervals [11, 7, 1, 33, 8, 13],
  median 9.5d, 0 censored. All-killer intervals [0, 1, 7, 8,
  11, 13, 33], median 8d.
- M3 — second-killer production: 1/6 banking seeds banks >= 2
  killers ever (99337 only). Post-first-blood: 45 fights, 1
  kill, rate 2.2%. Per-seed post-blood: 99316 5f/0k, 99317
  11f/0k, 99327 12f/0k, 99328 4f/0k, 99334 3f/0k, 99337
  10f/1k. The single post-blood kill is Aroha's same-day death.
- M4 — ready days: 0 total on the banking subset (and 0 on all
  32 screen seeds). Release days: 0.
- Death channels (7 dead killers on banking seeds; all 7 died,
  none still living, none exiled): wild 5, contest/arena 1,
  other 1. The wild five: Valeria (99316), gen_cvkjiys
  (99317), Greta (99328), Victor (99334), Nikos (99337) — all
  died in combat AT HAVEN (scholarDeath context: atHaven true,
  inCombat true). The arena one: app_mgpsphtd170 (99327) died
  day 73 in the arena, at haven, in combat, one day after
  banking. The other one: Aroha Ngata (99337) died day 108 to
  'a stranger', away from haven, in combat — the same day she
  killed The Suburb. No killer on the banking subset died
  away from combat; no unsplit 'the wild' residual appears
  among them (every banking-seed killer death carries a
  scholarDeath split).

## Per-seed table (fresh band, all error-free)

days = run days; end = village-lost except 99332 (survived to
the 150d horizon, censored); un = unlockedWave at finalize;
w4f/w4k = wave-4 fights/kills; rate = kill rate; kbw = kills by
wave (w1/w2/w3/w4); rPeak/gPeak = raw/gated standing peaks;
kev = killers ever; banks = banking seed under the prereg
definition; maxL = max living killers; L2/L1 = days with 2 /
exactly 1 living killers; run = longest L>=2 run; r5 =
readiness-5-ready days; rel = release days; mech = mechanisms
(guarded M3; * = mechanism on a NON-banking seed, which does
not count toward the verdict); first = first killer.

| seed | days | end | un | w4f | w4k | rate | kbw | rPeak | gPeak | kev | banks | maxL | L2 | L1 | run | r5 | rel | mech | first killer |
|------|------|-----|----|-----|-----|------|-----|-------|-------|-----|-------|------|----|----|-----|----|-----|------|--------------|
| 99311 | 50 | lost | 3 | 0 | 0 | — | 18/11/2/0 | 70 | 70 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99312 | 111 | lost | 4 | 7 | 0 | 0.00 | 31/16/6/0 | 150 | 150 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99313 | 65 | lost | 4 | 7 | 0 | 0.00 | 37/11/4/0 | 100 | 100 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99314 | 103 | lost | 4 | 3 | 0 | 0.00 | 21/15/5/0 | 125 | 125 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99315 | 121 | lost | 4 | 10 | 0 | 0.00 | 40/27/8/0 | 150 | 150 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99316 | 68 | lost | 4 | 6 | 1 | 0.17 | 45/15/4/1 | 225 | 199 | 1 | YES | 1 | 0 | 11 | 0 | 0 | 0 | M1+M2+M4 | valeria_quispe d54→d65 (11d, wild) |
| 99317 | 81 | lost | 4 | 14 | 1 | 0.07 | 29/12/6/1 | 270 | 199 | 1 | YES | 1 | 0 | 7 | 0 | 0 | 0 | M1+M2 | gen_cvkjiys d40→d47 (7d, wild) |
| 99318 | 60 | lost | 3 | 0 | 0 | — | 16/9/0/0 | 0 | 0 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99319 | 88 | lost | 3 | 0 | 0 | — | 24/11/2/0 | 70 | 70 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99320 | 62 | lost | 4 | 2 | 0 | 0.00 | 23/9/4/0 | 100 | 100 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99321 | 47 | lost | 3 | 0 | 0 | — | 16/9/1/0 | 25 | 25 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99322 | 115 | lost | 4 | 6 | 0 | 0.00 | 27/22/5/0 | 125 | 125 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99323 | 85 | lost | 4 | 3 | 0 | 0.00 | 29/8/6/0 | 150 | 150 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99324 | 81 | lost | 4 | 1 | 0 | 0.00 | 24/10/1/0 | 105 | 105 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99325 | 104 | lost | 4 | 2 | 0 | 0.00 | 33/22/5/0 | 145 | 145 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99326 | 108 | lost | 4 | 10 | 1 | 0.10 | 27/21/4/1 | 145 | 145 | 1 | NO* | 0 | 0 | 0 | 0 | 0 | 0 | M1+M2+M4* | thabo_maseko d91→d91 (0d, wild) |
| 99327 | 105 | lost | 4 | 21 | 1 | 0.05 | 29/26/6/1 | 175 | 175 | 1 | YES | 1 | 0 | 1 | 0 | 0 | 0 | M1+M2 | app_mgpsphtd170 d72→d73 (1d, arena) |
| 99328 | 87 | lost | 4 | 7 | 1 | 0.14 | 30/19/5/1 | 145 | 145 | 1 | YES | 1 | 0 | 33 | 0 | 0 | 0 | M2 | greta_hansen d54→d87 (33d, wild) |
| 99329 | 93 | lost | 4 | 13 | 0 | 0.00 | 40/21/8/0 | 200 | 199 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99330 | 127 | lost | 4 | 5 | 0 | 0.00 | 26/7/5/0 | 225 | 199 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99331 | 101 | lost | 4 | 4 | 1 | 0.25 | 26/8/6/1 | 175 | 175 | 1 | NO* | 0 | 0 | 0 | 0 | 0 | 0 | M1+M4* | elijah_scott d91→d91 (0d, arena) |
| 99332 | 150 | surv | 4 | 10 | 0 | 0.00 | 42/17/6/0 | 170 | 170 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99333 | 92 | lost | 4 | 9 | 1 | 0.11 | 28/21/4/1 | 145 | 145 | 1 | NO* | 0 | 0 | 0 | 0 | 0 | 0 | M1+M2+M4* | gen_0q7n84r d79→d79 (0d, wild) |
| 99334 | 125 | lost | 4 | 14 | 1 | 0.07 | 29/14/6/1 | 175 | 175 | 1 | YES | 1 | 0 | 8 | 0 | 0 | 0 | M1+M2+M4 | victor_lopez d107→d115 (8d, wild) |
| 99335 | 61 | lost | 4 | 9 | 0 | 0.00 | 16/15/4/0 | 100 | 100 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99336 | 82 | lost | 4 | 9 | 0 | 0.00 | 26/15/4/0 | 100 | 100 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99337 | 111 | lost | 4 | 16 | 2 | 0.13 | 18/15/3/2 | 205 | 199 | 2 | YES | 1 | 0 | 13 | 0 | 0 | 0 | M1 | nikos d60→d73 (13d, wild); aroha d108→d108 (0d, stranger) |
| 99338 | 79 | lost | 4 | 5 | 0 | 0.00 | 25/14/6/0 | 190 | 190 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99339 | 51 | lost | 3 | 0 | 0 | — | 36/20/2/0 | 50 | 50 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99340 | 14 | lost | 2 | 0 | 0 | — | 6/0/0/0 | 0 | 0 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99341 | 72 | lost | 3 | 0 | 0 | — | 36/19/3/0 | 75 | 75 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99342 | 121 | lost | 4 | 7 | 0 | 0.00 | 21/9/9/0 | 195 | 195 | 0 | no | 0 | 0 | 0 | 0 | 0 | 0 | — | — |

Band totals: 200 wave-4 fights, 10 wave-4 kills (5.0% kill
rate), 10 killers ever across 9 seeds, 6 banking seeds, 73
days with exactly one living killer, 0 days with two. Fates
(all 10 killers): died-in-fight 10, still-living 0, died-away
0, exiled 0, left 0. Exile-list entries on the band: 3
(99327, 99331, 99333 — one 'ambushed' each), none a wave-4
killer. Readiness-5-ready days: 0 on all 32 seeds. Gated 199
on 5 seeds (99316, 99317, 99329, 99330, 99337).

## The 99328 trajectory (quoted — the closest seed to a pair)

- 55 kills total (30/19/5/1 by wave). Wave 4 opens after day
  43 (first wave-4 fight: a field flee on day 44).
- Day 54: Greta Hansen kills The Eulogy as a companion while
  Devon Okafor is scholar — the village's only wave-4 kill, in
  a turn-based fight the scholar lost (the companion landed
  it). The System cheers it on camera (see Sense-test).
- Greta then lives 33 days — the longest first-killer survival
  on the screen. Four wave-4 fights follow her kill (days 58,
  86, 86, 87 — all turn-based, all lost): nobody else ever
  lands one. Gated standing peaks at 145 on day 54 and never
  climbs past it; the readiness-5 short bar at the peak is
  ['veterans'] alone — armor, weapons, and tricks are met, and
  the village is short exactly one more living veteran.
- Day 87: Greta dies in a turn-based fight at haven ('the
  wild', in-combat, at haven), the same day the village is
  lost. L==1 for 33 days, L>=2 for none. The village had a
  month with a living veteran and four more fights — and
  produced no second killer in any of them.

## The 99337 trajectory (quoted — the only multi-killer banking seed)

- 38 kills total (18/15/3/2 by wave). Sixteen wave-4 fights:
  9 field, 7 turn-based.
- Day 60: Nikos Papadopoulos kills The Influencer as scholar,
  turn-based, won. Day 73: Nikos dies in a turn-based fight
  at haven ('the wild', in-combat) — 13 days a veteran. The
  three days before his kill, three NPC villagers die in field
  fights to wave-4 monsters (Influencer, Influencer,
  Algorithm, days 54–56) — the village bleeds to wave 4
  before it ever kills one.
- Day 108: Aroha Ngata kills The Suburb as scholar,
  turn-based, won — the screen's only post-first-blood kill
  (10 fights after first blood on this seed, 1 kill). She dies
  the same day, cause 'a stranger', away from haven,
  in-combat. The two killers' lives do not overlap: Nikos dies
  35 days before Aroha's kill. L==1 for 13 days, L>=2 for
  none. Standing peaks at 205 raw / 199 gated.

## Wall numbers (fresh band, baseline observations)

Wins 0/32. National 0/32, table 0/32 (unobserved — not
detectable from this corpus, never inferred; scaleRank
"village" on all 32). Wave-4 unlocks 25/32, wave-4 faced
25/32 (same seeds), wave-4 kills 10, wave-5 unlocks 0/32,
wave-5 faced 0/32, wave-5 kills 0. Readiness-5-ready days
0/32. Median run-days 87.5 (sorted: 14 / 47 / 50 / 51 / 60 /
61 / 62 / 65 / 68 / 72 / 79 / 81 / 81 / 82 / 85 / 87 / 88 /
92 / 93 / 101 / 103 / 104 / 105 / 108 / 111 / 111 / 115 /
121 / 121 / 125 / 127 / 150; 31 villages lost, 1 censored at
the horizon). Village death-cause shares: not instrumented
by this arm — not reported, not guessed (killer death
channels above are the only death-cause numbers this arm
owns).

## Reachability verdict

Waves 1–4 are reached and faced (25/32 seeds face wave 4, 10
kills); wave 5 is unlocked on no seed, faced on no seed,
killed on no seed. Regional → national, the table, and the win
flag are unreached on all 32 fresh seeds. The wall has not
moved on this band — and this arm tightens the diagnosis
upstream of simultaneity a second time: on 23 of 32 seeds the
village never banks even one wave-4 killer, and on 3 more the
kill itself kills the killer. The readiness-5 door was never
ready on any day of any seed.

## Village assessment (plain words)

Picture thirty-two villages playing competently. One dies at
day 14, standing zero, never past the second wave. Six never
get past the third. Twenty-five meet the fourth wave and fight
it two hundred times between them — and land ten kills. Of
those ten kills, three kill the killer in the same fight. Of
the six villages left holding a living veteran, five never
blood a second fighter at all, though they fight wave 4 five
to twenty-one times each. The sixth bloods its second fighter
thirty-five days after the first one died, and the second
fighter dies the day she lands her kill. The longest-lived
veteran on the screen gets thirty-three days, four more fights,
and no successor. What is missing is not a second killer
surviving alongside the first. It is the second killer
arriving at all — and, once made, surviving the fights at home
that take five of the seven banked killers within two weeks,
all of them in combat at haven.

## Sense-test (this arm's own corpus, judged for meaning)

- The veteran-word collision reproduces for the seventh time.
  On 99328 the System cheers wave-3 kills as "veteran kills"
  three times — The Terms of Service (d28, Raúl), Chorus Line
  (d39, Oliver), Spool (d42, Devon) — and then cheers Greta's
  real wave-4 Eulogy kill (d54) with the identical line.
  Verbatim (d28): 📺 "Oh — OH. Everybody saw that, right?
  Raúl just put down The Terms of Service... on CAMERA.
  That's a veteran kill, folks. REMEMBER the name." The word
  "veteran" is spent on kills that count for nothing toward
  the veteran bar, and spent identically on the one kill that
  counts. A player told to blood two veterans hears the same
  cheer for the wrong kills.
- The hold-beat silence reproduces in its filtered form: on
  99328 the village sits at gated 145 with the readiness-5
  short bar ['veterans'] alone from day 54 to the end, and no
  hold beat naming the short bar appears in anything the
  capture saw. Same caveat as killersim-a: the capture keeps
  only lines matching the death/fight filter, so a hold beat
  outside it is not established — but nothing in the kept
  lines tells the village why it is one veteran short.
- Greta's death (99328, d87) reads as a village losing its
  last bearer, not as bookkeeping: she dies fighting at home
  on the day the village falls, after a month as its only
  veteran. The death narration is honest about the fight
  being at haven. No retained veteran on this band died away
  from combat (the one away death, Aroha's 'a stranger', is
  in combat, not an expedition-at-home shape — see Metric
  review).
- Village voice reads as people deliberating, not robots: the
  fire settles and a villager names a kill and its lesson
  ("Hushpuppy — I put it down today." "No telegraph you can
  hear. Watch the birds — when they go quiet, the pack is
  already moving." — 99328 d9). No villager behavior was
  flagged as robotic by this arm's corpus.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- THE BANKING DEFINITION WORKED AS DESIGNED — and cost 3
  seeds. Under killersEver>=1 the screen banks 9/32 (28%,
  inside the prior bands' 25–37.5% range); under the prereg's
  stricter definition it banks 6/32 (19%). The 3 excluded
  seeds are exactly the same-day kill-and-die cases, which is
  what the definition was written to exclude. The screen
  still powered (>= 4). A future arm that wants the looser
  count should say so in ITS prereg; this verdict stands on
  the strict one.
- M3 GUARD: the guard fired correctly — no banking seed
  qualifies for clustering (99337 splits 1–1; the rest have
  n=1). The prereg's M3 is now testable in principle: it
  needs a multi-kill banking seed with a dominant killer, and
  this screen produced none.
- DEATH-CHANNEL FIX (analyzer bug, found by the corpus, fixed
  before the evidence was written — verdict unaffected): the
  game's playerDeath causeArg carries the article ('the
  arena', 'the wild'), so the first channel mapping compared
  'the arena' against 'arena' and filed an arena death as
  'other:the arena'. Fixed (strip a leading 'the '; bare raw
  cause 'the arena' also maps to contest/arena), with two new
  proof fixtures; proof re-run 26/26 and the analyzer re-run
  on the same corpus. Channel counts moved from
  wild 5 / other:the arena 1 / other:a stranger 1 to wild 5 /
  contest/arena 1 / other:a stranger 1. The verdict never
  depended on the channel split.
- 'A STRANGER' AS A DEATH CAUSE (follow-up, not a verdict):
  Aroha Ngata (99337) dies day 108 to 'a stranger' — the
  fallen cause and the scholarDeath causeArg agree, in combat,
  away from haven, the same day she kills The Suburb. What
  kills a scholar "a stranger" mid-fight is not established
  by this corpus; it needs a code read before anyone explains
  it. It is NOT the open backlog item ("THE EXPEDITION" deaths
  landing on at-haven scholars): Aroha was away and in
  combat, not at haven. Recorded here as an adjacent shape.
- MISMATCH DAYS: 2 (99334 d115, 99337 d108), both exit-day
  boundary — derived L(d) 0 vs live/engine 1 on the killer's
  death day (the live snapshot fires before that day's death;
  the derived rule counts d < exitDay). Same class as
  standaccum2/3's banking-day lag, mirrored to the exit day.
  No L>=2 day is affected on either seed; the verdict is
  untouched. LiveMissing rows 0 on all 32 seeds.
- DEATH-BASED vs EXIT-BASED SURVIVAL: identical on the
  banking subset (no killer was exiled; all observed exits
  were deaths), so the two medians coincide (first-killer
  [9.5] vs [9.5]; all-killer [8] vs [8]). The distinction the
  killersim-a prereg introduced had no bite here either.
- FIRST-KILLER-SURVIVAL MEDIAN: claimable this time — 6
  observed exits, 0 censored, median 9.5d. It sits between
  the 9d and 11d priors and confirms them rather than moving
  them.
- HORIZON RULE: the post-run snapshot repeats the horizon day
  (99332's daily list ends [149, 150, 150]) and is included in
  snapshot counts and peak reads, as preregistered; no release
  days there. Unlike killersim-a/standaccum2, no snapshot lands
  past the horizon on this screen.
- DETERMINISM: the proof's live determinism + off/on
  neutrality legs pass (same seed twice identical; instrument-
  off trajectory unchanged at 30d). Mismatch days 2 on engine
  and live derivations, both exit-day boundary (above).

## Telemetry deviation check (loop-body step 10)

ATTEMPTED, refused by design: `node scripts/telemetry-check.js
--baseline .../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-05/perseed-killersim2-b/*.json' --metrics
national,table,wins,exiled` exits refusing recorder-corpus
input ("all 32 --current rows carry top-level anchorCommit, so
they are sweep recorder rows, not runs"). Same refusal
killersim-a, standaccum2/3, killerdeath-b, and postblood-b hit.
No LOUD line exists to investigate; wall numbers are reported
directly above instead of via a forced flag.

## Balanced panel (§15)

INAPPLICABLE, stated not fabricated: single-arm diagnostic run,
no Game-root change and no policy variant to compare. No
balance-panel compare exists for it, and none is attached.

## Infrastructure notes (loud, as required)

- EPERM flap: NONE this run. All 32 corpus files wrote
  first-try via the file driver. Judged runtime ~12 minutes
  for 32 seeds (150d horizon): pilot 8 seeds ~4 min, screen
  24 seeds ~8 min.
- Safe-commit index clobber hit all three commits so far
  (prereg, instrument, channel fix) and was repaired the same
  way each time (HEAD-blob cacheinfo, verified `git status`
  empty + `git diff HEAD` empty + hash-object matches);
  commits always correct. Third commit's clobber differed in
  shape (stale index, worktree clean) — same repair.
- Proof: `scripts/test-killersim2-20261105.js` — 26/26 PASS
  on the final code (banking definition incl. same-day
  kill-and-die / kill-and-exile, death channels incl. the
  article-carrying 'the arena' and bare 'the arena', M3 n>=2
  guard, post-blood counting, 32-seed verdict fixtures incl.
  GO / NO / UNDERPOWERED / INSUFFICIENT-DATA and the
  banking-excludes-fleeting case, analyzer determinism, live
  smoke, live determinism, off/on neutrality at 30d).
- No push, no bump, no live verification (ship loop owns
  deploys). Coordinator merges via --ff-only; this worker
  reports its branch tip below.

## Next blanks, in order (proposals only — this arm builds nothing)

1. The pair question is now ANSWERED on a powered screen
   (DIAG-GO): two living wave-4 killers never coexist, and
   the binding mechanisms are M2 (the second killer never
   arrives: 1 kill in 45 post-first-blood fights) and M1 (the
   first killer dies fast: median 9.5d), with M4 (late first
   kills) on half the banking seeds. The next work is a BUILD
   arm on second-killer production or first-killer survival —
   not another simultaneity measurement. A re-measure would
   need a new lever to test (standing rule).
2. Same-day kill-and-die (3 of 10 kills): a killer who dies in
   the act of killing never becomes a living veteran. Whether
   the killing blow itself is what kills them (the fight's
   last exchange) or the same fight's aftermath is a named
   question for the fight-interior work — the three cases here
   all died in combat at haven on the kill day.
3. 'A stranger' as a death cause (99337, Aroha) needs a code
   read: what kills a scholar "a stranger" mid-fight, away
   from haven, on the day she kills a wave-4 monster.
4. Veteran-word collision, seventh sighting; hold-beat silence
   reproduced in filtered form (99328 at gated 145, short bar
   veterans alone, no hold beat in the capture).
5. Five seeds sit at gated 199 (99316, 99317, 99329, 99330,
   99337) — the 199 ceiling is the standing story for a sixth
   of the screen, and none of them ever releases.

## Proof and landing

- Proof: `scripts/test-killersim2-20261105.js` — 26/26 PASS on
  the final code (see Infrastructure notes).
- Commits (this worktree branch sim-killersim2-b; coordinator
  merges via --ff-only; ready for coordinator merge, pending
  ship — no push, no bump, no live verification by this
  worker): 62d500a2f prereg, 2c302b0e5 instruments + proof
  24/24, 4f22bf9e7 channel fix + proof 26/26, plus the corpus
  + evidence commit below (32-seed corpus; this evidence).
- Files: prereg + evidence in `evidence/2026-11-05/
  sim-killersim2-b*.md`; per-seed JSON in
  `evidence/2026-11-05/perseed-killersim2-b/` (32 files;
  instrument errors 0 on all 32); scripts
  `killersim2-analyze-20261105.js`,
  `test-killersim2-20261105.js` (instrument + driver reused
  verbatim from killersim-a: `killersim-instrument-20261105.js`,
  `killersim-driver-20261105.js`; zero src/js anywhere in this
  arm).
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the corpus + evidence commit
  below (verified before reporting).
