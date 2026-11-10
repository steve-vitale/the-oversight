# sim-knowledge-b — Knowledge → behavior, BROAD: FIRST NUMBERS (coverage program Tier 1 #3)

- Run: `fleshout-loop-b-20261110T1930Z`, Loop B, arm `sim-knowledge-b`,
  worktree `~/workspace/worktrees/sim-knowledge-b`, branch `sim-knowledge-b`.
- Base: master `70e3af870`. Prereg:
  `evidence/2026-11-10/sim-knowledge-b-prereg.md` (written BEFORE any judged
  sims). Band **170217–170224** (8 seeds, fresh — see prereg seed-freshness
  record; candidate 170209–170216 collided with the diplo confirm band and
  was not taken). Horizon **100d max, death-aware**. Policy:
  `scripts/policies/competent` verbatim. No game-code change — MEASUREMENT
  ONLY. Zero `src/js`.
- Instrument: `scripts/knowledge-b-instrument-20261110.js` (method wraps,
  daily snapshots, lazy tele capture). Driver:
  `scripts/knowledge-b-driver-20261110.js`. Analyzer:
  `scripts/knowledge-b-analyze-20261110.js` (pure, deterministic — two runs
  byte-identical). Proof: `scripts/test-knowledge-b.js` — **41/41 PASS**
  (recorder-validity fixtures incl. swapped-label and dropped-event
  fixtures, determinism + neutrality sim legs on seeds 170217–170219, 30d).
- Corpus: `evidence/2026-11-10/perseed-knowledge-b/` —
  `knowledge-b-s<seed>-knowledge-b-pilot-on.json` (8 pilot files) plus
  `knowledge-b-proof-*` files (determinism/neutrality legs).
- Rebase note: the branch was rebased onto master `5dea46a45` (killchoke-a
  landing) after the pilot; the proof test was re-run on the rebased tip
  `d7ad00107` and passed 41/41 again. The regenerated proof files differ
  from the pre-rebase ones ONLY in `anchorCommit` — every event table,
  digest, and wall number is byte-identical across the rebase, so the
  killchoke-a landing changed nothing on these seeds for this instrument.
  The pilot numbers below were run on `70e3af870` and stand as-run.

## Verdict: GO (on instrument validity + complete first-numbers capture)

Judged STRICTLY against the prereg GO bar (M-values reported, never gated):

1. Instrument ran to completion on every pilot seed: **8/8 per-seed JSONs**,
   no seed crash, no missing section (food, looting, people, foraging,
   exploring, wall). PASS.
2. **0 instrument errors** across all 8 seeds. PASS.
3. Capture completeness: every domain has a counted table OR an explicit
   `unmeasurable` marking WITH its reason (trips to known caches;
   trips to known-rich patches — see §LOOTING and §FORAGING). PASS.
4. Neutrality leg: MODE=on vs MODE=off end-state digests identical on all
   3 proof seeds. PASS.
5. Determinism leg: MODE=on repeat runs identical on all 3 proof seeds
   (modulo the run label itself, which differs by construction — see
   Metric review). PASS.
6. Proof test green: `scripts/test-knowledge-b.js` 41/41. PASS.

**GO.** The first numbers below are the deliverable. Convergence state:
this is a measurement arm, not a tuning lever — no convergence line applies;
Tier 1 #3 is now MEASURED (first numbers), pending the follow-up items in
Metric review.

## The headline, in plain words

Villagers act on what they know in exactly two of the five domains — and
nowhere else. They eat only food the village knows is safe, and they walk
back to carcasses they remember to haul meat the village hasn't identified
yet. They visit only people they actually know, and they propose bonds only
to people they have personally perceived. But when they forage or explore,
they walk in a random direction — no remembered rich patch, no known ground
guides them, because no such memory exists in the code to read. And nobody
ever walks to a "known cache", because caches are found by luck on
expeditions, never by going somewhere on purpose.

## Per-domain first numbers (8 seeds, 100d, competent, band 170217–170224)

### FOOD — knowledge-driven: YES, at the draw (gated by construction)

- Villager pantry draws: **1,372** (1,360 other draws — scholar meals,
  feast draws — kept in a separate bucket and excluded from the rate).
- Items drawn: **1,699 — 1,698 known-edible, 1 unknown (99.9% known)**.
- Unknown-food testing: `villagerExperimentBeat` fired **799 times**
  (99–100 per seed — once a day, every day, like clockwork).
- Village plant knowledge at day 100: **23–36 plants known** per village
  (`sharedKnowledge`); tested verdicts **1–5** per village.

What the numbers mean: villagers never eat unknown flesh from the pantry
because unknown flesh carries 0 kcal and never reaches the draw
(`pantryDraw`, game.js:30221) — the choice is fully gated at the draw, and
the choice AMONG known foods is by spoil-date/size, not by knowledge.
The one exception proves the seam: on seed 170217, day 6, a villager drew
2 units of `meat_hushwolf` (280 kcal each, cooked) while the instrument's
known-check said "unknown". The meat was village-known-safe (it had real
calories and was cooked) but the monster was not yet NAMED — and the
instrument's check, `pantryItemKnown`, gates monster meat on naming, i.e.
on the SCHOLAR's knowledge, not the eater's. See Metric review: the FOOD
rate as instrumented is the scholar-known rate, and the villager-side rate
needs a revised check next run. The mechanism finding stands regardless:
unknown flesh cannot be eaten because it has no calories to draw.

### LOOTING — knowledge-driven: YES, for carcass hauls; NO, for caches

- Haul candidates offered: **12,111** calls, **78 offers** (17 famine
  channel, 61 knowledge channel, 0 other). The other 12,033 calls ranked
  no feasible site (273 ranked sites total across all calls: 82 known-safe,
  191 unrevealed — most days there is simply nothing worth hauling).
- Haul objectives formed: **50** (46 of them for fresh unrevealed flesh,
  14 from secondhand/gossip memories). Haul arrivals: **36** (72% of
  formed hauls reach the body).
- Expedition cache finds: **302 finds, 352,283 kcal** — the village's
  single biggest luck income, and entirely knowledge-independent.
- **Trips to known caches: UNMEASURABLE.** No known-cache store exists;
  caches are found by a 14% luck roll on expedition legs
  (`expeditionCache`, villager-agency.js:380,580). No villager ever walks
  to a cache on purpose, because there is no "known cache" to walk to.
  The 302 finds are counted as luck, not gated.

What the numbers mean: the knowledge channel is the live one — when the
pantry is full, the ONLY reason a haul is offered is unrevealed flesh
(61 of 61 non-famine offers were for unknown flesh; known-safe meat with
a full pantry is never offered). Hauling is how unknown flesh reaches the
cautious-test loop, exactly as the code intends. But the haul is a thin
stream (50 trips in 800 village-days) next to the cache lottery (302
finds): the village learns about meat mostly by accident, not by going
back for it.

### PEOPLE — knowledge-driven: YES, strictly (strangers are never chosen)

- `objVisitTarget` calls: **5,941**; null (nobody scorable): **1**.
- Target channels (a target may carry several): fire-group mate **4,463
  (75%)**, trust > 40 **5,163 (87%)**, trust 20–40 **440 (7%)**, away
  **4,110 (69%)**, no channel **0 (0%)**. Every single visit target
  carried at least one known-person channel.
- Zero-score roster members at decision time: mean **0.81 per call**
  (4,818 instances over 5,941 calls) — the never-chosen pool is thin:
  almost everyone is a mate, trusted, or away by the time visits happen.
- Bond proposals (`tele bond_proposed`): **299 events — staged 136,
  expired 135, accepted 19, refused 9.** Proposals usually die of neglect
  (expired), not refusal.
- `compareMaps` events (map knowledge shared through conversation): **0**
  in 800 village-days. The only sharing verb is a player conversation
  action (`conversation.js:6996`) the competent driver never takes.
- Places learned (`expeditionSign`): **484**.

What the numbers mean: villagers only visit people they actually know —
the scoring (fire-group +3, trust +2/+1, away +2) admits no stranger, and
the measurement confirms zero exceptions in 5,941 decisions. Bond
proposals are perception-gated (`bondProposalPerceived`: fire-group,
existing bond, gossip heard naming the target, sensed ally) and the
proposals that do fire mostly expire unanswered (135 expired vs 19
accepted) — the bond is offered, then the moment passes. Map knowledge
never spreads villager-to-villager in sims because the only verb that
shares it belongs to the player.

### FORAGING — knowledge-driven: NO (destination is random)

- FORAGE objectives: **554**; destinations on visited-before tiles:
  **57 (10.3%)**, new ground: 497.
- **Trips to known-rich patches: UNMEASURABLE.** No patch store exists —
  `mapmemNoticeNode` records only corpses, and no
  `forageTarget|richPatch|patchMemory|knownPatch` symbol exists anywhere
  in `src/js/`.

What the numbers mean: 10.3% looks like a knowledge signal until you
compute the chance band. Visited tiles are seeded as haven + 2–5 random
tiles within ±2 of haven (a 25-tile box); FORAGE picks a random direction
× distance 1–2 (the 24-tile ring around haven). A villager holds ~2–5
visited tiles inside that ring, so chance overlap is ~8–21%. Measured
10.3% sits inside chance: the pick is random, and the measurement agrees
with the code. Forage yield is a scalar kcal (`villagerDayProduction`) —
no per-plant attribution exists, so even the harvest cannot be scored
known-vs-unknown.

### EXPLORING — knowledge-driven: NO (destination is random; the map is never read)

- EXPLORE objectives: **105**; destinations on visited-before tiles:
  **15 (14.3%)**, new ground: 90. Same chance-band reading as FORAGING
  (wider ring, n=105 — noisy, same order as chance).
- `visitedTiles` is written exactly once (seed) and NEVER updated by
  travel; it is read only by `compareMaps` / `villageMapKnown`
  (player-facing). No villager movement decision reads it.
- `know[vid].places` grows (484 sign events) and is spent as teachable
  lessons; no routing decision reads it.

What the numbers mean: villagers explore by rolling dice, not by memory.
They learn places (484 times) and then never use that learning to decide
where to go next. (SEEK picks show 71% "visited-before" and VISIT picks
46.7% — both artifacts: SEEK is indoor, so its destination IS haven,
which is a visited tile; VISIT mixes indoor home visits with outdoor
trips. Neither is a knowledge signal.)

### COMBAT — baseline pointer (already measured, audit §3; NOT re-measured)

Trick execution is the one place action choice varies by species
(`villagerTrickAction`, fieldFights.js:134, knowledge-gated); learn-vs-
engage intent (561-564); morale trick-holds (2360-2384); win-plan seek
withheld when the trick is unknown (win-plan.js:526-534); hunt routing to
own remembered fight tiles (villager-objectives.js:740-790). No
per-villager monster knowledge exists; village-wide stores only. Phase 4
(one-brain) confirmed unbuilt.

## Sense-testing — three knowledge-driven choices, read as people

1. **The haul that names nothing (s170217 d6).** "A man, maybe 40s, with
   tattooed arms sets out for the moth the size of a dinner plate,
   catching light wrong. 'Meat's meat. Back with it or not at all.'"
   The villager goes after a carcass he remembers, and the game names it
   by the strange descriptor he actually knows — not the true name. The
   knowledge-gating rule is working in the prose, not just the code.
   Two villagers set out for the same Anaconda Empress on d9 (the
   no-dogpile cap is 2, and the code honors it). Coherent, consequential,
   and the reason for the trip (unrevealed flesh) is the knowledge itself.
2. **The unknown flesh comes home labeled (s170217 d6–d8).** "Naomi is
   back from past the south (+491 kcal for the pantry, strange meat
   (unknown flesh — test it cautiously), 1 story, hurt on the way home)."
   The meat arrives AS unknown flesh, with the instruction attached:
   "Test it cautiously before anyone eats." Two days later the bill comes
   due: "The village threw out spoiled stores: Unknown flesh. Lauren
   mutters: 'Should've smoked that. Fresh stuff keeps a day or two on the
   shelf — the smoke rack is right there.'" Unrevealed flesh rots,
   gets thrown out, and someone says so with a lesson. The knowledge law
   holds end to end: transport is not consumption, and ignorance has a
   price the village can see.
3. **The bond that lands (s170218 d19).** "Noah and Jessica shake on it.
   'Bonded. Whatever comes, we face it together.'" Short, human, and it
   costs nothing to say but changes what the pair will do. Against it,
   the 135 expired proposals: the bond is offered and then the moment
   passes, mostly in silence — which reads less like a decision and more
   like a verb nobody answers. That expiry-heavy shape (135 expired vs
   19 accepted) is the finding the counts alone would hide: the proposal
   system speaks, but the village rarely answers.

One more voice worth recording, because it shows the gap: the forage
departures — "Bringing dinner back. One way or another." / "There's food
out there. Going to find it." — say nothing about WHERE. The villager
doesn't pretend to know a patch; the lines are honest about a random
walk. And the scholar's own forage DOES read patch state ("This patch is
worked out — step to another green patch"), so the patch knowledge exists
for the player's hands and not for villager routing — the asymmetry is
real, and it is exactly what the numbers say.

## Village assessment (plain words)

Eight villages lived the full hundred days. Nobody won, nobody reached the
national table, nobody sat at the table — the scale wall stands exactly
where the last runs left it (see Wall numbers). Two villages unlocked wave
5; the rest stopped at wave 4. People died mostly out in the wild (41 of
86 deaths) and to monsters (22) — the village itself held.

What these villages looked like, through the knowledge lens: they are
careful about food and faithful about people, and blind about ground.
They test what they don't know before they eat it, they walk back for
meat they remember, they only visit people they know, and they bond with
people they have actually perceived. Then they walk out the gate in a
random direction, because nothing they learned about the ground yesterday
is available to them today. The knowledge they carry is real but narrow:
it lives in the pantry, in the carcass memory, and in the fire-group —
not in the map. The blank this run fills is the measurement itself: the
first numbers that say, per domain, where knowledge drives choice and
where it cannot, because the store does not exist.

## Wall numbers (every run)

- Won: **0/8** · national: **0** · table: **0** · max wave reached: **5**
  (2 seeds unlocked wave 5; 6 stopped at wave 4).
- Survival: median **101d**, max **101d** — all 8 villages alive at the
  100d horizon (median = horizon cap, not a death distribution; no village
  died or scattered inside the window).
- Standing at day 100: 199 on five seeds, 325, 500 (two seeds at wave 5).
  Five seeds sitting at exactly 199 is a plateau worth a look on a later
  run — it smells like a stage boundary, not a coincidence.
- Deaths: **86 total** — the wild 41 (47.7%), monster 22 (25.6%), arena 4,
  ambush 3, a wound that wouldn't close 3, a stranger 3, starvation 2,
  dehydration 1, lockjaw 1, sickness 1, contest 1, combat 1, Gavel 1,
  The Reunion 1, the night 1.
- Wave reach 1–5: W1–W4 on all 8 seeds; W5 unlocked on 2/8 (seeds 170220,
  170224). W5 kills: none recorded in this corpus (wave-5 facing was not
  the question here; the kill log is in the per-seed files).

Per-seed table (from the analyzer):

| seed | days | end | wave | standing | food known% | haul formed | visits | bonds | errors |
|---:|---:|---|---|---:|---:|---:|---:|---:|---:|
| 170217 | 101 | survived | 4 | 199 | 99.4 | 8 | 705 | 31 | 0 |
| 170218 | 101 | survived | 4 | 199 | 100 | 9 | 745 | 51 | 0 |
| 170219 | 100 | survived | 4 | 199 | 100 | 7 | 775 | 50 | 0 |
| 170220 | 101 | survived | 5 | 325 | 100 | 7 | 697 | 33 | 0 |
| 170221 | 101 | survived | 4 | 199 | 100 | 3 | 792 | 40 | 0 |
| 170222 | 101 | survived | 4 | 199 | 100 | 4 | 698 | 42 | 0 |
| 170223 | 101 | survived | 4 | 199 | 100 | 5 | 809 | 20 | 0 |
| 170224 | 101 | survived | 5 | 500 | 100 | 7 | 720 | 32 | 0 |

## Metric review

- **FOOD rate measures the scholar's knowledge, not the eater's.** The
  instrument's known-check is `pantryItemKnown`, which gates monster meat
  on NAMING (scholar/codex) and plants on `plantKnown` (scholar/codex) —
  "Villager knowledge alone does NOT reveal" (game.js:48481 header). The
  99.9% is therefore the scholar-known rate. The single exception (hushwolf
  meat, village-safe but scholar-unnamed) is the proof of the split. The
  mechanism finding — villagers cannot eat unknown flesh because it
  carries 0 kcal — is village-side and stands. REVISION FOR THE NEXT RUN:
  the villager-side FOOD rate should re-check each drawn item against the
  EATER's knowledge at draw time (meat → `monsterFoodSafe(mid)`; plant →
  `plantKnownBy(vid, pid)`), using the `vid` the instrument already
  records. This run is NOT re-scored: the 99.9% stands as the
  scholar-known rate, with this caveat attached.
- **Determinism wording.** The prereg said repeat runs are "byte-identical".
  The compared content IS byte-identical; the per-seed files differ only
  in their own `run` field (the run label differs by construction between
  the two legs). The proof test now compares modulo the run label and
  passes 3/3. No metric change — a clarification, recorded here.
- **Visit channels overlap by design.** A target can be mate AND trusted
  AND away; the split counts each channel present, so channel shares sum
  past 100%. That is honest counting, as pre-registered — not
  double-counting, and the "none: 0" cell is the finding that matters.
- **Haul candidate volume.** 12,111 candidate calls vs 78 offers looks
  like noise until you see the ranked lists: 273 ranked sites total, most
  calls ranking zero. The call count is the dawn-pick census (one per
  villager per day), not 12,111 near-misses. Reported as measured; no
  revision needed.
- **Horizon cap.** All 8 villages survived to the 100d horizon, so median
  survival is the cap. A longer horizon would separate survival from the
  cap, but the knowledge question is week-scale and 100d already holds
  ~800 village-days of decisions. No revision.
- **No metric was moved mid-run.** The GO bar was judged exactly as
  pre-registered; the M-values were reported, never gated.

## Findings for the backlog (appended to sim-findings.md separately)

- Standing plateau at exactly 199 on 5/8 seeds at day 100 — stage
  boundary or cap worth a look (observation, not a claim).
- Bond proposals expire far more than they are refused (135 expired vs 19
  accepted, 9 refused) — the proposal verb speaks and the village mostly
  doesn't answer.
- `compareMaps` never fires under the competent driver (0 events in 800
  village-days) — map knowledge never spreads villager-to-villager in
  sims; the only sharing verb is a player conversation action.
- Patch knowledge exists for the scholar's hands ("This patch is worked
  out") but no patch store exists for villager routing — the foraging
  asymmetry is measured, not assumed.
