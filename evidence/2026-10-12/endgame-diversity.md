# Endgame build/path distribution tooling (2026-10-12)

Steve 2026-10-12: now that villages reach national in sims, measure whether
endgame builds and strategies are evenly distributed or overrepresented.
Prior truth: 1 win in 145 runs (win-stats-deep) — a diplomacy/food-knowledge
build, feared/light, 0 synergies, 0 player blows. No distribution data
existed; sims measured reachability, not shape.

Steve 2026-10-12 (design law, added mid-build): EVERY villager must have a
potential path even to godhood if they play well enough. The player (human
intelligence steering) is an advantage on top of that — not the only route.
So the funnel records villager (non-player) ascensions too — which villagers
ascend, what distinguished them (abilities, teaching, notability, boldness,
trust standing, relay held, facilitated acts). The distribution report
covers player-path shares AND villager-ascension shares; villagers
effectively never ascending in sims is flagged as a blank to fill (per the
endgame build's NPC ascension design, table.js).

## Pre-registration (before running)

- **Primary metric:** funnel completeness + analyzer honesty. (a) 100% of
  pilot rows carry the new fields: scaleRoad, seasonedLinks,
  conqueredLinks, ascended[], ascendedN, maxAscScore. (b) the analyzer
  produces the full report on pilot rows and issues an insufficient-data
  verdict rather than a false distribution claim at tiny n.
- **GO threshold:** all pilot rows have the fields populated (no
  undefined/exception paths); analyzer runs clean end-to-end on the pilot
  rows. This is tooling, not a lever — the GO is "the instrument works",
  not "the distribution is X".
- **Horizon:** 200 days (reachability lever; matches win-stats-deep so rows
  pool with it). Death-aware: the harness stops dead/scattered villages via
  endReason — no dead-village ticking.
- **Seeds (pilot):** 1–4. **Policies (pilot):** winseek, fedseek.
  (8 rows max; small on purpose — the 145-run campaign is the loops' job.)
- **Note:** the 145-row winstats-deep results JSON was never committed to
  the repo (workers wrote it to /tmp). The analyzer pools old rows when
  present, but old rows lack the new fields — they are reported as
  'unknown' road, never backfilled. Going forward, every sweep writes rows
  to evidence/<date>/ with the OUT env var.

## What was built (scripts/ + docs/ only — no src/js game-code changes)

1. **scripts/sweep-winstats-deep.js** (extended): every row now records
   - `scaleRoad`: lead / lead-partial / belong / covenant / covenant-partial
     / trade / conquest / none. Derivation: linksHead>=3 (+conquered>=3 →
     conquest) = LEAD per hierarchy.js:88 ("primary of >=3"); belong/covenant/
     trade vest shapes from polityOf; linksSub = covenant. Seasoning:
     age>=30 days AND trust>=40 (hierarchy.js:69).
   - `seasonedLinks`, `conqueredLinks` (origin/how matching raid|force|conquer).
   - `ascended[]`: from Game.tableAscended() — {name, score, notes,
     abilities, knowledgeBreadth, facilitated[]} per ascended villager.
   - `ascendedN`, `maxAscScore` (highest non-player ascension score —
     the blank-detector: near 0 across many table runs = NPC ascension is
     decoration).
2. **scripts/analyze-endgame-diversity.js** (new): reads row JSONs,
   reports path reach shares (14 endings), scale-road shares, ability
   frequency (national-reachers vs winners, with overrepresentation notes),
   policy shares, and villager-ascension shares (runs with >=1 ascension,
   distinguishing notes, facilitated vs unbacked, median max score).
   Verdict vocabulary: **even / skewed / degenerate / insufficient-data**,
   with confidence labels (n<10 insufficient-data | 10–29 suggestive |
   30+ measured). Never claims a pattern from n<10.
3. **docs/MEASUREMENT.md**: new section 13 on endgame distribution metrics.

## Pilot results

**Stage 0 smoke (2026-10-12, 1 seed winseek):** funnel ran clean (6s), all
new fields populated: scaleRoad='covenant', seasonedLinks=0,
ascendedN=0, maxAscScore=15 (below the 45 bar — blank-detector reads
honestly). GO.

**Pilot (2026-10-12, 8 rows: seeds 1–4 × winseek,fedseek, 200d):**
`evidence/2026-10-12/endgame-diversity-pilot.json`. All 8 rows carry the
new fields (100% completeness — GO criterion (a) met). Villages died
early on master-based code (median day 32, 0 national-reachers) — expected:
this worktree is pre-scale-fix, and the pilot's job is the instrument, not
the distribution.

**Analyzer pilot:** `node scripts/analyze-endgame-diversity.js
evidence/2026-10-12/endgame-diversity-pilot.json` runs clean and reports
`insufficient-data` across every axis — GO criterion (b) met: it refuses
to claim a pattern from n=8/0 rather than inventing one. Full report at
`evidence/2026-10-12/endgame-diversity-report.json`.

**Synthetic verdict test (/tmp, not committed):** 12 fabricated
national-reacher rows (degenerate 10/12 feared path, mixed roads,
2 villager ascensions) confirmed the verdict logic fires correctly:
skewed/degenerate/insufficient-data at the right n, ability
winner-vs-national comparison lines, ascension notes/abilities/facilitated
shares, median maxAscScore. One quirk fixed: a 50/50 tie no longer reads
"skewed".

**Branch compatibility:** the funnel's Game APIs (tableAscended,
villagerAscensionScore, hierarchyState, tableState, polityOf) verified
present on the scale-wall-fix branch (95b49302) — the tooling runs on both
master and the fix branch. No campaign was launched on the fix branch;
that's the loops' job.

## Convergence state

**converging** — instrument built, pre-registered, piloted, and verified
honest at tiny n. The distribution verdict itself needs national-reachers
>= 10, which only the loops' larger campaigns (post scale-fix merge) will
produce.

## Convergence state

**converging** — instrument built and pre-registered; pilot pending in this
run. The distribution verdict itself needs national-reachers >= 10, which
only the loops' larger campaigns will produce.
