# sim-echodraft-a — raid-draft echo trace (axis scale-onramp)

Run: fleshout-20261025T2015Z, arm sim-echodraft-a. DIAG ONLY — zero
src/js game-code changes. This arm takes the 1915Z run's next blank
(5): the wall-wounded echo draft trace — test the nearest-first
hypothesis from sim-defwound-a Stage 1.

## PRE-REGISTRATION (binding — judged only against this)

Primary question: does nearest-first raid drafting explain the
defwound echo gap — defender-wounded entities re-met 10.3 times
each vs 4.1 for field-wounded ones (577 re-meets / 56 entities
vs 293 / 72, sim-defwound-a Stage 1)?

DIAG-GO rule (all required):
(a) detgate PASS (recorders OFF delegates byte-identically on
days/gameDays/ts, no diag surface, no wraps installed);
(b) corpus complete on 8/8 seeds with zero recorder errors and
zero overflow;
(c) neutrality EXACT against the 1815 control band on raids,
raiders, deaths, national-ever, wins, median days (any deviation
= STOP, recorder not neutral);
(d) the trace covers ALL raids in the band with draft distance +
wound-state data AND gives a numeric nearest-first test with a
confirm/refute verdict on the hypothesis.
Any leg missing = DIAG-NO-GO.

Horizon + why: 180d death-aware (runDays stops on death/win;
180 is the cap, not a fixed horizon) — the SAME band as the
defwound result it explains, so the echo gap being traced is the
same population, not a new one.
Seeds: 73671–73678 (the defwound band). Policy: tableseat-nowait
(leanlinkrescue courtship + seat legs only, no wait leg).
Control aggregates to reproduce (neutrality proof): deaths 234,
national-ever 7/8, wins 4/8, raids 85, raiders 361, median 135d.

Definitions (fixed before any sim):
- Draft = one fired havenRaidTick: the living world-monster pool
  sorted by Manhattan distance |tx-hx|+|ty-hy| to Haven (v.px ?? 4,
  v.py ?? 4), first raidN taken (havenGrowth.js havenRaidTick).
  The recorder snapshots the pool BEFORE delegating, because the
  draft itself teleports raiders to the Haven tile (tx=hx, ty=hy)
  and the toll rewrites their HP — a post-tick read cannot see
  draft distance at all.
- Draft distance = the entity's pre-draft Manhattan distance.
  Draft order = its rank in the engine's sorted pool (0 = nearest).
- Wound state at draft = pre-toll HP fraction vs the break line
  (0.15 wave>=2, 0.25 wave 1, fieldFights.js mBreak): below-line
  vs above-line, from the pre-draft snapshot.
- Prior-history class (primary, judged at draft time): from
  defwound resolve rows with day STRICTLY before the draft day
  for the same instance seq — defender-wounded (a prior raid
  fight ended below the line for this entity), field-wounded (a
  prior field fight ended below the line), arrived-wounded (a
  prior below-line end that started already below the line and
  no prior fight manufactured it), healthy (no prior below-line
  end). Whole-timeline first-wound source is reported as a
  secondary cross-check, never as the at-draft classification.
- Previously-drafted = the seq appeared in an earlier raid's
  drafted list in the same seed.
- Nearest-first test (numeric, not a vibe): (1) construction
  check — recorded drafted set equals the sorted pool's first
  raidN on every raid; (2) Spearman rank correlation between
  pool distance and drafted indicator across all pool entries
  (negative = nearer entities are drafted more); (3)
  nearest-quartile share of drafted entities vs the
  random-draft expectation (drafted count x quartile size /
  pool size, summed per raid).
- Hypothesis verdict: CONFIRMED iff defender-wounded entities
  sit nearer Haven at draft time than field-wounded ones (median
  distance strictly lower AND dist-0 share higher) AND the
  nearest-first test shows drafting actually favors nearness
  (Spearman clearly negative, nearest-quartile share clearly
  above random); REFUTED iff defender-wounded entities sit no
  nearer (median equal or higher) or drafting shows no nearness
  favor; UNRESOLVED otherwise, with the exact missing datum
  named. If position data cannot be shown, the evidence says
  exactly what is missing instead of inferring it.

Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law
and escalation; the break line and wave gating behind the wound
split). docs/BEAR.md is not relevant to this arm (no bear, no
butchering, no fat/yield question) and was not used as a source
for any claim here.

[RESULTS BELOW — written after the sims ran, judged against the
header above. Nothing below was written before the corpus existed.]

## VERDICTS

DIAG-GO (all four legs pass — see "Gates" below).

HYPOTHESIS VERDICT: REFUTED — on its own comparative terms.
Nearest-first drafting is real and strong (leg (b) below), but
defender-wounded entities do NOT sit nearer Haven than
field-wounded ones at draft time, so nearness cannot explain why
defender-wounded entities echo 10.3 times each vs 4.1. The draft
re-pulls wounded animals constantly — but it re-pulls
field-wounded animals at the same rate. What the draft does NOT
do is favor the defender-wounded. The residual gap (below) is a
new blank, not a draft effect.

## GATES

(a) DETGATE PASS: seed 73671, baseline days=180 gameDays=181
ts={tsNationalDay:77} vs wrapped-with-recorders-OFF identical on
all three, diagSurface=false, wrapsInstalled=false,
postSetupWorld=0. Identical to the defwound detgate, plus the new
_echodraft surface in the check.
(b) CORPUS PASS: 8/8 seeds, all four recorders errs=0,
overflow values 0 on every seed. Echodraft raids (85) equal
raftdraft raids (85) on every seed — the new recorder misses no
raid and invents none.
(c) NEUTRALITY EXACT: raids 85, raiders 361, deaths 234,
national-ever 7/8, wins 4/8, median 135d, pool 1494, pool
wave-3+ 107 — every 1815 headline reproduced exactly. Per-seed
lines also match the defwound band exactly (73671 survived
180d/16 raids/31 deaths; 73672 won d97/7 raids/25 deaths; 73673
won d124/7 raids/28 deaths; 73674 survived 180d/14 raids/18
deaths; 73675 won d135/13 raids/24 deaths; 73676 village-lost
d70/7 raids/31 deaths; 73677 village-lost d143/12 raids/43
deaths; 73678 won d116/9 raids/34 deaths). The defwound wound
numbers reproduce exactly from this corpus too: defender
fights 322, manufactured 56, pre-wounded 204, re-meets 877
(manufactured-only 247, pre-wounded-only 630) — so the band
being traced is the same population, not a lookalike.
(d) TRACE COMPLETE: all 85 raids carry full-pool draft data
(1,494 pool entries, every one with distance, pre-toll wound
state, and instance seq; untagged 0 drafted / 0 pool), plus the
numeric nearest-first test and the confirm/refute verdict below.

## (a) THE DRAFT, IN NUMBERS

Pooled (85 raids, 361 drafted, 1,494 pool entries):
- Drafted distance: median 2, mean 2.18, at-Haven (dist 0) 1.1%
  (4/361). Pool distance: median 4, mean 4.34, dist-0 0.3%.
- Drafted by wound state AT DRAFT (pre-toll fraction vs the
  break line): below-line 224, above-line 137. Below-line
  drafted: median 2, mean 2.17. Above-line drafted: median 2,
  mean 2.20. Wounded and healthy raiders are drafted from the
  same distance band — the draft does not reach farther for
  healthy animals or nearer for wounded ones.
- Drafted by prior-history class (fights with day strictly
  before the draft day): field-wounded 118, healthy 143,
  defender-wounded 98, arrived-wounded 2. So over a quarter of
  all drafted raiders (98/361) were already defender-wounded
  before the draft — re-drafting the wounded is routine, not
  rare.
- Re-drafts overall: 182/361 drafts (50.4%) are re-drafts of an
  entity drafted before in the same seed; 179 distinct entities
  drafted, mean 2.02 drafts each, max 7 (one entity per seed
  reaches 7; see Sense).
- Construction check: recorded drafted set equals the sorted
  pool's first raidN on 85/85 raids (0 mismatches). This is a
  recorder-fidelity check, not evidence about the rule — the
  rule itself is read from havenGrowth.js, and the independent
  evidence is the distance distribution below.

Per-seed draft table (raids / drafted / pool entries / drafted
median dist / pool median dist / Spearman / nearest-quartile
observed vs random-expected):
73671: 16 / 74 / 342 / 2 / 4 / -0.65 / 69 vs 19.9.
73672: 7 / 28 / 127 / 2 / 5 / -0.60 / 25 vs 8.0.
73673: 7 / 30 / 104 / 2 / 5 / -0.74 / 28 vs 8.4.
73674: 14 / 65 / 210 / 2 / 4 / -0.71 / 57 vs 18.1.
73675: 13 / 56 / 146 / 2 / 4 / -0.71 / 41 vs 15.8.
73676: 7 / 28 / 121 / 2 / 4 / -0.69 / 26 vs 8.0.
73677: 12 / 45 / 282 / 2 / 4 / -0.58 / 42 vs 11.9.
73678: 9 / 35 / 162 / 2 / 4 / -0.65 / 32 vs 9.7.
The pattern holds on every seed — no seed rescues the
hypothesis.

## (b) DOES THE DRAFT ACTUALLY PULL NEAREST-FIRST? YES — STRONGLY

- Spearman rank correlation between pool distance and drafted
  indicator across all 1,494 pool entries: -0.654. Negative and
  large: nearer entities are drafted much more often.
- Nearest-quartile share: 320 of 361 drafted entities (88.6%)
  come from the nearest quartile of their raid's pool, vs 99.8
  expected under a distance-blind draft. The draft is not
  "somewhat" nearest-first; it is overwhelmingly nearest-first.
- Drafted median distance 2 vs pool median 4 (means 2.18 vs
  4.34). The draft's reach is roughly half the pool's spread.
This leg of the hypothesis is CONFIRMED. It is the other leg
that fails.

## (c) DO DEFENDER-WOUNDED ENTITIES SIT NEARER? NO

Drafted entities, median (mean) distance by prior-history class:
- defender-wounded: median 2, mean 2.23, dist-0 share 0.0%
  (0/98), mean draft rank 1.72.
- field-wounded: median 2, mean 2.12, dist-0 share 3.4%
  (4/118), mean draft rank 1.71.
- healthy: median 2, mean 2.20, dist-0 share 0.0%, rank 1.62.
- arrived-wounded: n=2, median 2, mean 1.50 (too small to read).
On every seed, the defender-wounded and field-wounded drafted
medians are equal (2 and 2, or 2 and 3 in opposite directions
on two seeds: 73673 def 2 / field 3; 73674 def 3 / field 2 —
they cancel, they do not accumulate).

The whole pool, not just the drafted — median (mean) distance
by prior-history class at raid time:
- defender-wounded: median 4, mean 4.39 (n=361 pool entries).
- field-wounded: median 4, mean 4.47 (n=573).
- healthy: median 4, mean 4.19 (n=548).
No nearness advantage anywhere: not in the pool, not in the
draft, not at distance 0. If anything, defender-wounded
entities sit a hair FARTHER (mean 2.23 vs 2.12 drafted).

Previously-drafted vs never-drafted, at draft time: median 2
vs 2, mean 2.14 vs 2.21, dist-0 share 2.2% vs 0.0%. Being drafted
before leaves an entity essentially where any other entity is
— the teleport to Haven does not stick. Why: between raids
(7+ days apart) wanderWorldMonsters moves each entity on ~35%
of ticks, and the trace sees only draft-time positions, never
the path between drafts. The one thing the trace DOES show is
that almost nobody is AT Haven when drafted (4/361) — the
"they stay near Haven" premise fails in its strong form
before any class comparison is even needed.

## THE DRAFT-SIDE ECHO DECOMPOSITION

Where the 10.3 vs 4.1 gap does and does not live:
- Later DRAFTS per defender wound event: manufactured events
  98 later drafts / 56 events = 1.75 each; pre-wounded events
  251 / 204 = 1.23 each. A modest draft-side excess (1.4x),
  nowhere near the 2.5x entity-level gap.
- Raid share of ALL re-meets, by the entity's first-wound
  source: defender-manufactured entities 199 raid / 577 total
  = 34.5%; field-manufactured entities 105 / 293 = 35.8%;
  arrived-wounded 2 / 7. The raid channel carries NO excess
  for defender-first entities — raid and field re-meets scale
  together (field re-meets: manufactured events 159, pre-wounded
  412; the field is where most echoing happens for everyone).
- The residual gap, stated exactly: defender-first entities
  accumulate 144 wound events / 56 entities = 2.57 events each
  vs field-first 111 / 72 = 1.54; and 577 / 144 = 4.01 re-meets
  per event vs 293 / 111 = 2.64. Both factors — more events per
  entity AND more re-meets per event — run in BOTH contexts.
  The draft trace cannot explain either factor, because both
  factors are context-symmetric. They are the next blank, not
  a draft effect.

What the trace cannot see (stated, not hidden): resolve rows
carry no tile, so FIELD fights cannot be placed — whether the
field re-meets of a wounded entity happen on the Haven tile
(lingering, fought by villagers standing there) or out in the
woods is UNRESOLVED by this trace. That is the single most
valuable next measurement (see Next blank).

## SENSE-TESTING (one entity's story, in plain words)

Seed 73671, seq 2, a Drum-Belly Tanuki — the same animal as
the defwound sense story, now with its drafts added. Day 8 it
walks in healthy from 3 squares out, is drafted second, and
loses a real 3-round fight to a defender, dropping from full
health to 11%. It never recovers — wounds never heal. From
then on it is drafted six more times (days 22, 30, 60, 72, 145,
154), always already wounded, always ending in a zero-round
staredown. Its draft distances are 4, 1, 2, 1, 3, 3 — it
wanders the near woods like any other animal, never sits on
the doorstep (never distance 0 at a draft), and gets picked
because distances 1–3 usually fall inside the draft's cut of
the nearest four or so animals, not because the draft seeks
IT out. Between drafts it is also met in the field — days 10
and 12 right after the first draft, then a run of field
staredowns in the 70s and 80s — twenty-four meetings in all,
every one after day 8 a zero-round shrug at 11%, then at 2%
after the day-60 draft's toll re-floors it to a single hit
point (drafted at 11%, the palisade takes its quarter, and
there is nothing left to take). The story the village tells
about this animal is not "the beast that keeps coming back
for us." It is "the animal we broke on day 8 and have stared
at, on and off, for five months, because nothing in the world
finishes it, heals it, or makes it leave." The full
draft-by-draft timeline is in
evidence/2026-10-25/sim-echodraft-a-sense.txt.

## VILLAGE ASSESSMENT (plain words)

These are the same villages as the 1815/defwound band, so the
news is what the draft trace adds. The wall's draft is honest
and brutal in a specific way: it takes the nearest animals,
whatever they are, and a quarter of everything it takes is
already wounded — animals the village itself broke on an
earlier night. The draft is not picking on the wounded; the
woods near home are simply full of them, because wounded
animals never heal and never leave, and the near woods are
where the village keeps meeting everything. Half of all
drafts are second (or third, or seventh) helpings of an animal
the village has already drafted. The wall does not have a
wounded-animal problem. It has a wounded-animal population,
and a draft that faithfully re-serves it.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No metric was re-scored mid-run. The hypothesis verdict
  follows the pre-registered rule exactly: CONFIRMED required
  BOTH nearness (defender-wounded median strictly lower AND
  dist-0 share higher) AND nearness-favor (Spearman clearly
  negative, quartile share clearly above random). The favor
  held (-0.654; 320 vs 99.8) and the nearness failed (medians
  equal, dist-0 share 0.0% vs 3.4%, means slightly reversed) —
  so the verdict is REFUTED, not softened to "partially
  confirmed."
- One check-implementation note, disclosed: the sweep's
  summary gate initially failed on a bug in the NEW summary
  code (the sum() helper passes analysis objects, but six call
  sites re-dereferenced .analysis). The fix changed only the
  summary code, no threshold and no number; the corpus files
  were untouched and the summary was then computed from them.
  The same class of bug (summary-code vs corpus-code mismatch)
  is why the summary re-derives pooled medians from the raw
  rows rather than trusting per-seed summaries.
- Balanced panel (§15): NOT run as a compare, deliberately —
  the panel cannot ingest per-seed recorder corpora (the same
  known error class defwound reported). The sweep-compare
  tables on identical seeds (this corpus vs the 1815 control
  band, reproduced exactly) are the comparison of record.
- Events vs entities, carried from defwound: wound counts are
  EVENTS (per fight); draft counts here are per draft; entity
  counts (179 distinct drafted entities) are reported
  separately and never averaged into event rates.

## INSTRUMENT NOTES

- New: scripts/policies/echodraft-diag.js (pre-draft pool
  snapshot with seq + distance + pre-toll wound state, new
  recorder) + scripts/test-echodraft-a-sweep.js (--one /
  --summary / --detgate / --sense) + scripts/test-echodraft-a.js
  (analyzer + unit proof, 4/4) +
  scripts/analyze-echodraft-context.js (second-pass splits:
  re-meet context, pool distance by class, draft ranks).
- Reused VERBATIM (never edited): tableseat-nowait,
  raftdraft-diag, spawnsrc-diag, defwound-diag, sim-harness.
- Corpus: evidence/2026-10-25/perseed-sim-echodraft-a/ (8
  per-seed JSONs + summary.json). Sense file:
  evidence/2026-10-25/sim-echodraft-a-sense.txt.
- What the recorder cannot see (stated, not hidden): position
  between drafts (wander path unobserved); tile of field
  fights (resolve rows carry no tile); the draft's own sort
  is re-derived from the snapshot, so the construction check
  proves recorder fidelity, not the rule — the rule is read
  from havenGrowth.js and the independent evidence is the
  distance distribution.

## NEXT BLANK (concrete proposal for the next arm)

NEXT-ARM: field-fight position trace (DIAG ONLY, same band).
Question: do the field re-meets of wounded entities happen on
the Haven tile (lingering raiders fought by villagers standing
there) or out in the woods? Instrument: wrap
resolveWildMonsterEncounter as defwound does, but ALSO record
the entity's tx/ty at fight time (m.tx/m.ty are on the object
at resolve time) and the Haven coords — one new recorder,
same seeds/policy/horizon, pre-registered GO: position data
on 100% of field re-meets of below-line entities + a Haven-tile
share for defender-first vs field-first entities. If field
re-meets cluster on the Haven tile for defender-first
entities, the echo mechanism is lingering, not drafting, and
the remedy arm changes entirely (linger handling, not draft
handling). If they do not cluster, the remaining candidate is
the counting structure itself: wounded entities accumulate
below-line EVENTS at every meeting because wounds never heal,
so "events per entity" grows with survival time — testable
from the existing corpus by events-per-entity vs days-alive,
no new sims needed, as a paper arm first.
Do NOT re-run the draft hypothesis: it is settled on this
band. Do NOT touch the defender-finish rule: it stays KILLED
(deaths 234->316, wins 4->3) and met-below-line finishing
stays a steve-call item.

scale-onramp stays converging (NOT converged): this arm
settled a mechanism question (the draft does not explain the
echo gap) but moved no lever, reached no new content, and the
full seat / wave 5 remain 0/8 on this band.
Convergence state: converging.

## DIAG-GO SUMMARY (for the coordinator)

DIAG-GO. Hypothesis REFUTED. Commit lands record + tooling
only (zero src/js changes). Next blank: field-fight position
trace (above). No [needs-eyes]: diagnosis-only work.

