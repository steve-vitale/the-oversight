# sim-articles-b — hunt-beat indefinite-article fix (loop B, food-economy axis)
run: loop-b-articles-20261023T001320Z | worktree: sim-articles-b | base: e32d4e8c4
findings backlog item: #764 (claimed 2026-10-22 by this arm)

## PRE-REGISTRATION (binding, MEASUREMENT.md §14 — written before measuring)
- **Primary metric:** the indefinite article is correct for EVERY vowel-initial
  animal in the fixture set across BOTH templates (stalk-fail pool and kill
  case), asserted end-to-end through `Game.villagerHuntResolve`.
- **Fixture set (8):** Eastern Chipmunk, American Mink, American Crow (the three
  from #764) + American Alligator, European Hare, Eurasian Badger, Indian
  Peafowl, Amur Tiger — all from the animals.json roster.
- **GO threshold:** green phase asserts 100% correct articles (incl. the
  phonetic Eu- exception: "a European Hare", "a Eurasian Badger") in both
  templates on seeds 8903–8906, PLUS `Game.indefArt` unit-tested over all 22
  vowel-initial roster names + consonant controls + empty-string edges, PLUS
  the det-gate digest byte-identical red vs green. Any miss = NO-GO.
- **Guardrail:** 60d × 12-villager fixture (fail arm eff=0, real arm eff=1, the
  stalkfail-beats det-gate style) — kills/kcal/aid/fails digest byte-identical
  before/after. Fiction-only, zero stream effect. A miss is NO-GO, never
  re-scored against a friendlier metric.
- **Horizon:** beat-level arm — no run horizon applies (no policy, no survival
  question). Death-aware horizons n/a; the fixture is the same 60d fixture the
  stalk-fail det-gate used, so numbers are comparable by construction.
- **Seeds:** 8903, 8904, 8905, 8906 (SEED=8903 corpus for the sense read,
  matching the original #764 finding's corpus seed).
- **Policies:** none — direct `Game.villagerHuntResolve(vid, eff)` fixture.

## The blank (#764)
The stalk-fail pool (landed 0b2e2ea3d) hardcodes `a ${an}` in all four
variants, and the kill case hardcodes `a ${aname}` — pre-existing, shared with
the original verbatim line's template. Vowel-initial names read "a Eastern
Chipmunk" / "a American Mink" / "a American Crow". The trap catch line
(`_trapCatchLine`, game.js ~3582) has the same pattern ("caught a
${animalName}") — found during the fix, same blank family.

## The lever (fiction-only)
- New `Game.indefArt(word)` helper next to `leadPick` (game.js): phonetic
  a/an — vowel-initial → "an", with the Eu- → "a" exception ("yoo" onset:
  European Hare/Hedgehog/Perch, Eurasian Badger), consonant-initial → "a",
  empty → "a". Zero Math.random draws — stream-neutral by construction.
- Applied at all three template sites: stalk-fail pool (4 variants), kill
  case, trap catch line.

## Results
- **RED (unfixed game.js), first run:** blank reproduced on all 6 non-Eu
  vowel-initial fixture animals in BOTH templates on all 4 seeds (32/32).
  "a Eastern Chipmunk", "a American Mink", "a American Crow",
  "a American Alligator", "a Indian Peafowl", "a Amur Tiger" — verbatim in
  fail beats and kill beats. Eu- names already correct ("a European Hare").
  RED PASS.
- **GREEN (fixed game.js), first run:** 64/64 template assertions correct —
  "an Eastern Chipmunk", "an American Mink", "an American Crow",
  "an American Alligator", "an Indian Peafowl", "an Amur Tiger",
  "a European Hare", "a Eurasian Badger" in both templates on all seeds.
  `indefArt` unit test: all 22 vowel-initial roster names + 6 consonant
  controls (Cottontail Rabbit, White-tailed Deer, Gray Squirrel, Moose,
  Raccoon, Black Bear) + empty/whitespace edges — 30/30. GREEN PASS.
- **Det-gate:** 60d × 12-villager outcome digests (kills/kcal/aid/fails/other)
  byte-identical red vs green across all 4 seeds. Fiction-only confirmed:
  zero stream effect. GUARDRAIL PASS → GO.

## Before/after beat corpus sense-read (SENSE-TESTING LAW — SEED=8903)
BEFORE (red):
  "Grayson stalks a Eastern Chipmunk all morning — never gets closer than old
  sign; the morning goes still and stays still. Nothing to bring home."
  "Grayson brings down a American Crow — clean kill, +210 kcal to the pantry."
  — reads as a typo, breaks the quiet register of the pool; six roster names
  affected every time they fire.
AFTER (green):
  "Grayson stalks an Eastern Chipmunk all morning — never gets closer than old
  sign; the morning goes still and stays still. Nothing to bring home."
  "Grayson brings down an American Crow — clean kill, +210 kcal to the pantry."
  "Jada stalks a European Hare all morning — the wind turns mid-stalk and it
  winds them. Gone. Nothing to bring home."
  — all read naturally; the four variants still land as distinct moments
  (wind shift, snapped twig, lookout crow, still morning). Kill beats carry
  real kcal and read honest.
Observation (not chased): the lookout-crow variant firing during a crow hunt
("stalks an American Crow … a lookout crow kicks up the alarm call") is a
mildly odd image, but it's a real moment and pre-existing from the landed
pool — out of this arm's scope; noted, not changed.

## Village assessment
Fiction arm — the 60d det-gate fixture is the village lens: 12 villagers
hunting 60 days produced 825 real-arm kills / 1,962,910 kcal and 637
fail-arm kills / 31,850 kcal with 2,243 stalk-fail beats across 4 seeds.
Digests byte-identical red vs green — the village that hunts is unchanged;
only its narration is grammatical. No villager-behavior flags: villagers
still stalk, fail, kill, and butcher exactly as before.

## Metric review
- The pre-registered metric proved RIGHT: the det-gate held byte-identical,
  and the primary asserted 100% correct articles end-to-end. No re-scoring,
  no revision proposed for the next run.
- Collateral: the older `scripts/test-stalkfail-beats-b.js` encoded the bug
  in its own assertions — its fail-beat regex `/stalks a /` and its
  verbatim-normalizer `stalks a\s+` assumed the hardcoded article, so its
  det-gate "failed" after the fix even though kcal/kills/aids were identical
  and fails+other summed to the red fails count (a test-encoding artifact,
  not a stream disturbance). Per the repo green-list rule (design changed on
  purpose → update the test in the same commit), both regexes now accept
  `an?`; the old test re-runs DET-GATE PASS with 4 variants cycling. Updated
  in this commit, documented here.
- Convergence: **converging** — #764's blank is filled (helper + three
  template sites), proof RED→GREEN on first run both sides, zero stream
  effect, no new findings chased.

## Wall numbers (scale wall — Steve 2026-10-12 standing)
This arm is fiction-only and did not move the wall; latest tracker state
(cited, not re-measured): wins 40/48 (win-side stack), table 16/16,
national 12/16, wave-4 16/16, median 93.0d armed; wave-5 wall 0-for-19 era;
scale-onramp remains the blocking axis. This run's contribution: zero wall
regression risk (det-gate byte-identical).

## Files
- src/js/game.js — Game.indefArt + three template sites (the fix)
- scripts/test-articles-b.js — RED→GREEN + det-gate proof (new)
- scripts/test-stalkfail-beats-b.js — an? regex update (collateral, same commit)
- evidence/2026-10-22/articles-b/digests-red.json — det-gate baseline
