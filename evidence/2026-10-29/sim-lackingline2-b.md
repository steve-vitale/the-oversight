# sim-lackingline2-b — INSUFFICIENT-DATA (banking shortfall): 7 qualifiers at the 400-seed cap, floor 8 unmet, no judged ON leg

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261029T1930Z,
arm sim-lackingline2-b, axis food-economy. Worktree
sim-lackingline2-b. MEASUREMENT ONLY: zero src/js changes,
zero policy retunes — scripts/policies/woodcarry.js is
untouched by this arm. This worker does NOT merge to master
— coordinator merges.

Prereg: evidence/2026-10-29/sim-lackingline2-b-prereg.md
(committed b8e6c838, before any judged leg — and before
the banking screen itself). Judge (prereg, unchanged):
DIAG-GO requires >= 1 honestly-staged still-refused ON
creek evening on a banked band of >= 8 seeds, with the
lacking-line for the actual skip reason naming the live
number, plus errs == 0, determinism byte-identical, OFF
guard leg free of lever lines, and a passing sense-test.
A miss is never re-scored. No post-hoc seeds were added
after the stop rule; the bar was never lowered and no
refusal was faked. In particular, NO judged ON leg was
run on the 7-seed bank: the prereg's 8-seed floor binds,
and running a 7-seed "confirm" would have violated both
the prereg and the never-below-8 rule.

## Verdict: INSUFFICIENT-DATA — banking shortfall (7 < 8)

| Check | Result | Bar |
|---|---|---|
| Seeds screened OFF (sequential from 13400) | 400 (13400–13799) | cap 400 |
| Total evenings screened | 11,945 | — |
| OFF creek evenings / episodes | 34 / 7 | — |
| Qualifiers (banked seeds, screen order) | 7: 13421, 13473, 13480, 13556, 13592, 13703, 13714 | target 12, floor 8 |
| Qualifier rate on this band | 7/400 = 1.75% (banking yield only, never a blind-band rate) | — |
| Judged ON legs run | NONE (floor unmet — see above) | — |
| Still-refused ON creek evenings (PRIMARY) | NOT MEASURED (no judged band exists) | >= 1 |
| Classifier errs (all 400 seeds) | 0 | == 0 |
| Unclassified (all 400 seeds) | 0 | == 0 |
| Determinism re-run | NOT RUN — conditioned on a judged band (phase 3 guard); with no judged band there is nothing to re-run | n/a |
| OFF guard (lever lines in OFF corpora) | 0 strings in all 7 banked corpora (proof T4c) | 0 |
| Sense-test on a played still-refused tail | NOT PERFORMED — no staged evening exists | NOT claimed as pass |

This is the fifth consecutive run in which the lacking-line
has no played tail: sim-woodcarry-b, sim-woodcarry2-b,
sim-woodcarry3-b, sim-lackingline-b (1730Z), and now this
banking-first run, which does not even reach a judged band.
Findings backlog #1450 stays OPEN — this arm does NOT close
it, and does not claim otherwise. What this run DOES settle
is a method question the 1730Z note left open: banking-first
does not rescue the hunt on a fresh band, because the
banking trait itself is rare (1.75%), and the woodcarry3
band's rich yield (4 banked seeds, 47 OFF creek evenings)
was a selected band's yield, not a population rate. Any
future run that budgets "bank 12 creek seeds" from a fresh
band should budget ~700 seeds at this rate, or bank on a
sharper trait (see "What would stage it honestly").

## The funnel: why banking stopped at 7

Evening outcomes across the 400 screened seeds (11,945
evenings):

| Outcome | Evenings | Share |
|---|---|---|
| completed (night spent inside) | 10,233 | 85.7% |
| already-inside | 1,264 | 10.6% |
| out-of-reach (haven never attempted) | 297 | 2.5% |
| travel-refused | 77 | 0.6% |
| blocked-combat | 58 | 0.5% |
| walk-interrupted-combat | 10 | 0.1% |
| walk-no-path | 6 | 0.1% |

Of the 77 travel-refused evenings: creek 34, other-refused
43, unclassified 0. The funnel narrows twice before any
banking trait can appear:

1. A refusal needs a hop ATTEMPT. Most outside nights
   never attempt one: 297 evenings end out-of-reach, so
   no refusal, no classification, no bank. Only 77 of
   11,945 evenings (0.6%) even reach a travel refusal.
2. A creek refusal needs creek geography at the haven
   crossing. Creek is 34 of 77 refusals (44%) but only
   34 of 11,945 evenings (0.28%), concentrated on 7
   seeds (1.75% of seeds) — creek-proneness arrives in
   geographic clumps, as blockscreen2 also found (its
   last block contributed 5 qualifiers at once after a
   zero block). A fresh 400-seed band simply did not
   contain 8 such clumps.

End states: 389 of 400 villages end survived; 390 reach
day 30 (13731 is village-lost at day 30 itself); 11 are
village-lost in total (days 20–30).

## The bank: 7 seeds, 7 episodes, 34 OFF creek evenings

| Seed | OFF creek evenings | Episode (loop-days) | Blocked tile | Wood on OFF evenings | Kcal range | Ticks range |
|---|---|---|---|---|---|---|
| 13421 | 6 | 18–23 | (2,4) | 0 every evening | 0–2297 | 95–255 |
| 13473 | 2 | 29–30 | (3,4) | 0 every evening | 2279–2340 | 103–127 |
| 13480 | 6 | 4–9 | (2,4) | 0 every evening | 0–2220 | 45–253 |
| 13556 | 8 | 20–27 | (3,4) | 0 every evening | 308–2326 | 111–239 |
| 13592 | 5 | 22–26 | (4,3) | 0 every evening | 0–2241 | 102–127 |
| 13703 | 3 | 18–20 | (4,6) | 0 every evening | 0–2375 | 46–255 |
| 13714 | 4 | 14–17 | (4,3) | 0 every evening | 0–2330 | 111–245 |

Notes, verified against the raw banked corpora (not just
the analyzer): every OFF creek evening holds wood 0 —
without the lever's morning carry, competent play never
packs road wood at all, which is exactly the gap the
lever was built to fill. Kcal and ticks, by contrast,
vary widely and DO bind OFF: kcal < 60 on stranded
evenings (13421 days 21–22 at 0; 13480 days 5–9 at 0;
13592 days 24–25 at 0; 13703 day 20 at 0; 13714 day 17
at 0; 13421 day 19 at 57), and ticks < 96 on three
first-episode evenings (13421 day 18 at 95; 13480 day
4 at 45; 13703 day 18 at 46). New geography appears:
blocked tiles (2,4) and (4,6) join woodcarry3's (4,3)
and (3,4) — the haven crossing is not always the same
two tiles. All 7 episodes are single runs (one episode
per seed); no seed contributes two episodes.

These OFF numbers are NOT ON numbers — the ON leg
diverges from day 2 (the carry packs 4 logs and costs
2 ticks, and the first refused evening rescues instead
of stranding). They are published because they name
the next hunt precisely (below), not because they prove
anything about ON behavior. In particular, the kcal-0
stranded evenings are an OFF-leg starvation spiral
(the lever's rescue prevents the spiral ON); they do
not show that an ON evening would be kcal-short.

## Diagnosis: what the banking shortfall means, and what it does not

- BANKING-FIRST IS NOT A YIELD FIX ON A FRESH BAND.
  The 1730Z note's hope — that banking on OFF creek
  episodes "multiplies the creek-evening yield per seed
  by an order of magnitude" — holds only against the
  sequential-ON denominator (3 ON creek evenings per
  60 seeds), not against the banking cost: finding the
  bank itself cost 400 seeds for 7 seeds. The
  woodcarry3 band looked rich because it WAS selected
  (blockscreen2's 12 qualifiers, of which 4 were
  creek seeds, chosen for creek content). Selection
  effects cut both ways: a selected band's yield never
  estimates a fresh band's yield.
- THE GATES BIND OFF, AND THE LEVER REMOVES THE
  BINDING ON — that is the lever working, not the
  line failing. Wood binds OFF on every creek evening
  (0 < 4) and the carry removes it ON; kcal binds OFF
  only inside multi-evening stranding spirals that the
  rescue prevents ON; ticks binds OFF on long days
  (45, 46, 95) and is the ONE gate the lever does not
  fix — a long day stays long with or without 4 logs
  in the pack. If any gate can still produce a
  still-refused ON evening under competent play, it
  is ticks-short first, then a carry-skip wood-short
  (see next-run note). The 1730Z ON evenings all held
  ticks >= 127, so ticks-short ON remains unobserved
  — but unlike wood and kcal, it is not structurally
  removed by the lever.
- NO INSTRUMENT FAILURE. Errs 0, unclassified 0 on all
  400 seeds; the banking analyzer's counts reconcile
  exactly with an independent raw-corpus tally (77
  refusals = 34 creek + 43 other-refused; 11,945
  evenings). The shortfall is a population fact (few
  creek seeds on this band), not a recorder miss.

## What would stage it honestly (next-run note, NOT a claim)

The prereg's banking rule is spent at the cap; a next
run should NOT extend this band post-hoc (that would
be re-scoring the stop rule after seeing the result).
Honest routes that stay inside the staging rules (real
game state, seed selection only, no edited narration
or state), each needing its own prereg:

- BANK ON THE SHARPER TRAIT — OFF TICKS-SHORT CREEK
  EVENINGS: bank seeds whose OFF leg contains a creek
  evening with ticksToDayEnd < 96 (this bank already
  contains three: 13421 day 18 at 95, 13480 day 4 at
  45, 13703 day 18 at 46). The lever does not fix
  ticks, so an ON day shaped like its OFF day stays
  ticks-short, skips the bridge, and owes the ticks
  line — the most plausible still-refused route under
  competent play. The risk to pre-register honestly:
  ON day shapes diverge (carry costs 2 ticks; rescue
  changes later days), so a ticks-short OFF evening
  does not guarantee a ticks-short ON evening.
- BANK ON THE CHAIN — TICKS-SHORT, THEN WOOD-SHORT:
  a ticks-short first evening strands the player, so
  the next morning is not-at-haven, so the morning
  carry skips, so the next creek evening is wood-short
  even with the lever ON. A banked seed with a
  multi-evening OFF episode whose first evening is
  ticks-short is the seed to watch for this chain.
  (13480's episode days 4–9 opens ticks-short at 45;
  13703's days 18–20 opens at 46.)
- BANK ON THE OUT-OF-REACH PRELUDE: 297 out-of-reach
  evenings exist on this screen. A night spent out
  for out-of-reach (not creek) leaves the next morning
  not-at-haven, so the carry skips that morning; if
  that day ends at a creek refusal, the evening is
  wood-short ON with no stranding spiral needed.
  Banking trait: an OFF out-of-reach evening followed
  within a day or two by a creek evening. This route
  does not need a starvation spiral or a long day.
- DO NOT stage by weakening the lever, by editing
  kcal/wood/ticks, by reusing the known-rescued
  woodcarry3 band as the judged band, or by running
  a sub-floor judged band and calling it a confirm.
  A 7-seed ON run on this bank would be exactly the
  bar-lowering this run refused; if a next run wants
  these 7 seeds' ON behavior, it pre-registers them
  as a 7-seed measurement (not a confirm) or banks
  further seeds under a new prereg to reach the floor.

## Sense-testing (honest statement, not a vacuous pass)

NO played still-refused tail exists, so NO sense-test
on a played still-refused tail was performed. This is
recorded as NOT PERFORMED, never as passed. Three
stranded OFF evenings were read end to end as CONTEXT
for the village assessment only (never as a sense
pass for the lacking-line, which fires on no OFF leg):

- 13480 day 5 (episode day 2, 0 kcal by morning):
  a full lived day — creek survey for an elder, a
  meeting with Isabella by name ("touching their
  chest. 'I'm Isabella.'"), worked-out patches — ends
  on the engine's own refusal line ("The creek runs
  fast here — no crossing without a bridge or a
  swim."). The morning after wakes outside on a
  forest floor with 0 kcal: the stranding reads as
  a person camped out and going hungry, not a counter.
- 13421 day 19 (kcal 57, episode day 2): foraging,
  a Speedbump counter learned from Aroha ("Never
  stand next to it... just walk around"), a French-
  speaking Cecile met through the translator's
  cheerful mistranslation — then the same refusal
  line. The day's play explains the evening; the
  refusal is the honest last line, not a debug string.
- 13556 day 20 (episode day 1): gossip by the fire
  (Fatih, Miguel, Marta retelling each other), a
  Hushpuppy pacing at a boundary, a creek sighting
  confirmed by Diana — then the refusal line twice.
  The village keeps living in the narration while
  the player is out; nothing robotic, but nothing
  marks the night away either (the known un-narrated
  episode-exit wrinkle, third sighting class).

The question the sense-testing law asks — does a
still-refused evening read as a person lacking
something, with the day explaining how the lack came
about? — remains unanswered in play. The gap #1450
names is still exactly this gap.

## Village assessment (plain words)

Four hundred villages, thirty days each (eleven lost
along the way). Almost every night is spent inside —
11,497 of 11,945 evenings end at haven or already
inside — and the nights spent out are mostly
out-of-reach nights (297), where the player simply
never tries the walk home, not dramatic strandings.
Creek strandings, the thing this arm hunts, touched
only seven villages in four hundred, and on those
seven the story is the same shape: one crossing that
will not let the player through, night after night
for two to eight nights, while the village goes on
without them — and while the stranded villager goes
hungry, down to nothing on the longest episodes.
What was missing on every one of those nights was
the same small thing the lever was built to supply:
four logs in the pack, which competent play without
the lever never packs at all (wood 0 on all 34
stranded evenings). The lever fixes that lack; what
this run documents, without filling, is whether the
game ever still says so out loud — five runs
running, the lacking-line still unplayed, and now
with a measured reason why the hunt itself is hard:
creek villages are 1.75% of a fresh band, and the
gates that would make the line fire are the ones the
lever, doing its job, removes.

## Wall numbers (every run)

- National: NOT OBSERVABLE in 30-day evening legs
  (pre-seat, no field) — not claimed, never zero.
- Table: NOT OBSERVABLE in 30-day evening legs.
- Wins: NOT OBSERVABLE in 30-day evening legs;
  0 win flags present.
- Wave 4–5 unlocks: not re-measured on this leg shape;
  no wave-4/5 content is reachable from a 30-day
  evening leg, and none is claimed.
- Median survival: 30 days (390 of 400 villages reach
  day 30; 11 village-lost, days 20–30).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as pre-registered
before judging: this leg is a 30-day position measurement
of a POLICY-SIDE lever — zero src/js changes, so there is
no game-root delta for a panel to compare, and the panel's
registry policies do not include the nighttravel trace
policy. The determinism guard is conditioned on a judged
band, which does not exist here; the instrument-integrity
evidence is errs == 0, unclassified == 0 on all 400 seeds,
and the exact reconciliation of the analyzer's counts
with an independent raw-corpus tally.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- BANK TARGET 12, FLOOR 8, CAP 400: the combination
  failed as a budget, not as a principle. At the
  measured 1.75% qualifier rate, 12 qualifiers need
  ~700 seeds (~55 min of sim time at the observed
  ~4.7 s/seed) and 8 need ~460. A next banking run
  should either raise the cap to ~800 with the same
  target/floor, or bank on a sharper trait (ticks-
  short creek evenings; out-of-reach preludes) whose
  rate is unknown until screened — pre-register the
  trait AND its own cap, never the trait after seeing
  the screen.
- FLOOR 8, KEPT AND HONORED: refusing the 7-seed
  judged leg is the run's most consequential decision,
  and it is the right one — a sub-floor confirm would
  have been a bar-lowering dressed as pragmatism, and
  the prereg's stop rule exists precisely to prevent
  it. The cost (no ON data on this bank) is real and
  is reported, not hidden.
- MINIMUM-N 1, KEPT BUT UNMET (vacuously — no judged
  band, so no evening to count). The unit is still
  right for an existence proof; the failure here is
  upstream of the unit (no band to stage on).
- SEQUENTIAL-ON SCREENING, RETIRED, CONFIRMED: this
  run did not repeat it, and the banking screen's own
  numbers confirm why — creek evenings are 0.28% of
  evenings, so any unbanked screen burns seeds on
  non-creek villages. Banking is still the right
  family of method; it needs a sharper trait or a
  bigger cap, not abandonment.
- GATE-SKIP PRIMARY, KEPT: the OFF data sharpens
  which gate is plausible ON (ticks first, carry-skip
  wood second, kcal essentially never outside a
  stranding spiral the lever prevents). A next prereg
  should name ticks-short as the primary hunted line
  explicitly, while keeping the other gate lines as
  judged-if-they-occur.
- If the metric proves wrong, write it under "metric
  review" in the evidence file and propose the revision
  for the NEXT run — never re-score mid-run.

## Evidence files

- Prereg: evidence/2026-10-29/sim-lackingline2-b-prereg.md
  (commit b8e6c838, before any judged leg and before
  the banking screen)
- This file: evidence/2026-10-29/sim-lackingline2-b.md
- Banking census (all 400 seeds, per-seed creek/
  episodes/outcomeDist/errs):
  evidence/2026-10-29/sim-lackingline2-b-bank-census.json
- Banked OFF corpora (the 7 qualifier seeds ONLY;
  the other 393 screen corpora are NOT committed —
  they contain no banked trait and are exactly
  reproducible from the documented driver + env +
  seed list, as the 400-seed census record proves):
  evidence/2026-10-29/sim-lackingline2-b-corpus-off/
  (woodcarry3-b-nighttravel-s13421, -s13473, -s13480,
  -s13556, -s13592, -s13703, -s13714.json)
- Instruments: scripts/analyze-lackingline-bank-b.js
  (banking census), scripts/test-lackingline2-b.js
  (T1–T4, ALL PASS: 14 checks), scripts/
  woodcarry3-trace-b.js (judged driver, reused
  unchanged from woodcarry3).
- NO src/js change, NO policy change, NO default flip.
- NOT BUILT (conditioned on staging that never
  occurred): scripts/lackingline2-trace-b.js, the
  full-tail driver — building it without a staged
  evening would be dead code, and the prereg's phase
  3 never triggered. A staged run builds it then.

## Infrastructure note for the coordinator

The prereg commit via scripts/safe-commit.sh triggered
the known index-clobber variant: after the commit the
worktree index showed the prereg file as a staged
deletion while the worktree file was byte-identical to
HEAD. The commit itself was verified correct (git show
--stat + HEAD blob match), and the index was repaired
with `git update-index --add --cacheinfo
"100644,<blob-from-HEAD>,<path>"` per the repo lesson;
`git status --short` and `git diff HEAD` were empty
after repair. No work was lost; the clobber is
reported, not hidden.

## Landing note for the coordinator

INSUFFICIENT-DATA (banking shortfall: 7 qualifiers at
the 400-seed cap, 8-seed floor unmet, NO judged ON leg
run — by prereg rule, not by omission): land prereg +
this evidence file + banking census + 7 banked OFF
corpora + banking analyzer + proof. Backlog disposition
(reported, NOT edited — goal hidden_files are the
coordinator's): #1450 remains OPEN — the lacking-line
is still unit-proven only, five runs running, and the
recommended next step is a sharper-trait banking run
(ticks-short OFF creek evenings, or out-of-reach
preludes) under a new prereg with a cap sized to the
measured 1.75% rate — not a fifth blind screen and
not a sub-floor judged band. This worker does NOT
merge to master — coordinator merges. Report:
'committed, pending coordinator merge'.
