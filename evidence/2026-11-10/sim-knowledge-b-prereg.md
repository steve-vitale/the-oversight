# sim-knowledge-b — preregistration (Knowledge → behavior, BROAD — FIRST NUMBERS, coverage program Tier 1 #3)

- Run: `fleshout-loop-b-20261110T1930Z`, Loop B, arm `sim-knowledge-b`,
  worktree `~/workspace/worktrees/sim-knowledge-b`, branch `sim-knowledge-b`.
- Base: master `70e3af870` (verified `git log --oneline -1` in the worktree at
  spawn; if master moves before landing, rebase onto the explicit master SHA
  read immediately before rebasing and re-run proof green).
- Band: **170217–170224** (8 seeds, pilot). Seed-band freshness verified
  before this prereg was written (see "Seed-freshness record" below).
- Horizon: **100d max, death-aware** (run until game over / win; villages
  that die stop simulating, +10d tail max). Why 100d: MEASUREMENT §10
  mid-game band (knowledge, waves 2–3, regional) — long enough for plant
  learning, map memory, bonds, and cache finds to accumulate (all are
  week-scale phenomena), short enough to fit the hourly loop. The knowledge
  question is not a reachability question, so the 150–200d reachability band
  does not apply.
- Policy: `scripts/policies/competent` (verbatim, NOT modified) via the new
  `scripts/knowledge-b-driver-20261110.js` with `KNOWLEDGE_B_MODE=on`
  (instrument) and `KNOWLEDGE_B_MODE=off` (neutrality leg, wall numbers
  only). No new policy. No game-code change — MEASUREMENT ONLY. No
  gate/price/deed/readiness change. Zero `src/js` expected.
- Canon: docs/CANON.md read first; docs/KNOWLEDGE.md read (stores table,
  "If you don't know, it doesn't show", experiment-before-identification,
  villager plant knowledge is binary, sharedKnowledge + tested verdicts);
  docs/PERCEPTION.md read (perception hints are player-facing only).
  Coverage audit read:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/coverage-audit-20261110.md`
  (§3 combat slice + §4 systems map + §5 gap #3 + §6 unknowns).

## Steve's order (scope)

Steve 2026-11-10 11:11 CST: "Measure all so we can improve on all gaps."
Steve 2026-11-10 11:14 CST correction: when he talks about villagers acting
on what they know, he means MORE THAN COMBAT — food, looting, people,
foraging, exploring. The combat slice is ALREADY measured (audit §3) and is
recorded here ONLY as a baseline pointer — it is NOT re-measured as the
whole item.

## Combat baseline pointer (already measured — do not re-measure)

Audit §3, verified by reading the cited code on 2026-11-10:

- Trick execution is the one place villager action choice varies by species:
  `villagerTrickAction` (`src/js/fieldFights.js:134`, per round at
  1778–1781), all knowledge-gated (unknown species gets no trick action,
  `fieldFights.js:137-139`).
- Learn-vs-engage intent (`fieldFights.js:561-564`): default learn-first;
  learn intent drives the round-3 withdrawal.
- Morale trick-holds (`fieldFights.js:2360-2384`): the only knowledge reads
  inside the flee logic (mid-trick or trick-known villagers not called
  hopeless above 25% HP).
- Win-plan seek withheld when the trick is unknown (`src/js/win-plan.js:526-534`).
- Hunt routing (return-to-fight) (`src/js/villager-objectives.js:740-790`):
  routes only to the villager's own remembered fight tile/species, fresh
  (≤3 days), armed, in range.
- Goals (`src/js/villager-goals.js:195-210,281`): `bank_veterans` scores own
  wave-4 kills / own fought list — personal fight history, not trick
  knowledge.
- There is NO per-villager monster-knowledge store (`monsterKnowledge` /
  `knownMonsters` return zero hits in `src/js/`). What exists is
  village-wide: `state.monsterCounters[mid]` (waves 1–2),
  `state.villagerTricks[mid]` (wave 3+), `state.codex.monsters[mid]`
  (player-facing only), per-villager `agency know[vid].fought[]`
  (never read by `fieldFight`), per-villager
  `state.village.monsterSightings[vid]` (hunt routing only).
- Phase 4 verdict (one-brain program): CONFIRMED UNBUILT — no flee/engage
  judgment reads which monster this is, its wave, its veteran status, or
  what this villager personally knows about it.

## What this arm is (and is not)

- FIRST NUMBERS for the coverage program Tier 1 #3: the first per-domain
  knowledge-driven choice rates on a fresh band. This arm builds a
  measurement instrument and records the baseline — it changes no lever
  and re-judges no earlier arm's verdict.
- Five domains, each grounded in a code read BEFORE instrumenting (below).
  A domain with no readable knowledge store is reported as
  UNMEASURABLE-WITH-REASON, never faked with a proxy. The unmeasurable
  verdict itself is a first number: it names the missing substrate.

## Code facts verified before this prereg (all read 2026-11-10)

### FOOD — knowledge store EXISTS (village-level + per-villager), choice is gated at the draw

- Stores: `state.village.sharedKnowledge[pid]` = `{level, tested verdict,
  testedBy}` (village-level; `src/js/game.js:1732-1762, 19407-19410`);
  per-villager `village.taught[vid]` / `village.familiar[vid]` /
  `village.plantKnowledge[vid]`, unioned by `plantKnownBy` /
  `plantsKnownBy` (`docs/KNOWLEDGE.md` stores table; `src/js/game.js:2635`).
  Villager plant knowledge is BINARY (name or not).
- The meal: `villageEats` (`src/js/game.js:32378`) → per villager
  `villagerMealDay` (`src/js/game.js:31463`): eats own production first
  (`ownEat = min(produced, need)` — production is a SCALAR kcal from
  `villagerDayProduction`, `src/js/game.js:30797`, no plant identity, no
  known/unknown choice), then draws from the pantry via `pantryDraw`
  (`src/js/game.js:30221`).
- The gate: `pantryDraw` is fresh-first / best-fit over items with
  `kcalEach > 0`. Unknown flesh carries `kcalEach 0` and never reaches the
  sort ("Knowledge gating untouched: unknown flesh (kcalEach 0) never
  reaches this sort", `game.js:30221` header; `effectiveKcal <= 0` skipped).
  So villagers NEVER eat unknown monster flesh from the pantry — the
  known-vs-unknown choice is fully gated at the draw, but the choice AMONG
  known foods is by spoil-date/size, not by knowledge. The batch cook path
  likewise skips unknown monster meat (`src/js/food.js:3224`).
- Unknown-food testing exists as its own behavior: `villagerExperimentBeat`
  (`src/js/game.js:19283` — once per day a villager runs the cautious
  protocol on an unknown lump/meat at the fire; verdicts land in
  `sharedKnowledge`).
- MEASURABLE: per-draw item known-status (via `pantryItemKnown`,
  `src/js/game.js:48481`) on villager meals; unknown items present in the
  pantry but never drawn; experiment-beat fires per seed.

### LOOTING — one knowledge-driven trip type EXISTS (mapmem haul); "known caches" do NOT exist

- Store: per-villager map memory `state.village.mapmem[vid].sites`
  (cap 12, v1 kind is `'corpse'` only; `src/js/villager-mapmem.js:71-118`).
  Sites are remembered on perception (kill, walking past, being told —
  gossip copies are fuzzed ±30% and marked secondhand).
- The trip: HAUL objectives (`src/js/villager-objectives.js:634`,
  `objHaulFromSite`) target a remembered node. `mapmemHaulCandidate`
  (`villager-mapmem.js:360-400`) offers on TWO channels: the famine gate
  (pantry < 5000 or hunger > 50 → any site) and the KNOWLEDGE channel
  (unrevealed monster flesh is new knowledge worth a trip even with a full
  pantry; known-safe meat with a full pantry stays un-offered).
- The gate is deliberately NOT on hauling: `mapmemHaulSites`
  (`villager-mapmem.js:290-344`) has NO `mapmemFoodKnown` gate
  ("HAUL-UNREVEALED, Steve 2026-10-16: Villagers target unknown flesh too
  — the knowledge law gates eating, not hauling"). `mapmemFoodKnown`
  (`villager-mapmem.js:164-172`) — animal meat always known, monster meat
  needs `monsterFoodSafe` — gates only the at-the-body handling
  (`mapmemHaulAt`, `mapmemButcherForCarry`: known-safe meat as kcal,
  unrevealed flesh as 0-kcal testable items).
- "Known caches": NO SUCH STORE. Cache finds are expedition luck:
  `expeditionCache` (`src/js/villager-agency.js:580-592`, called from the
  per-leg roll at `:380` — 14% band after the monster roll, kcal
  300–1200 × distance, no knowledge input, no known-cache targeting).
  No villager dig verb for buried caches was found (tile type
  `'buried cache'` exists, `src/js/game.js:176`; the perceive hint names
  disturbed earth for the player).
- MEASURABLE: haul objectives formed, by channel (famine vs knowledge)
  and by flesh known-status; haul arrivals and their at-the-body outcome.
  UNMEASURABLE-WITH-REASON: trips to known caches — no known-cache store
  exists and no trip targets a cache; cache finds are recorded as
  knowledge-independent luck (counted, not gated).

### PEOPLE — known-person choice EXISTS and is perception-gated

- Store: `state.village.trust[vid]` (village-level scalar, init 5–20,
  scholar 15; `src/js/game.js:2569-2579`, written by `bumpTrust` etc.);
  fire-groups `state.village.groups[]`; per-villager `v.trust[id]` also
  exists but VISIT scoring reads the village-level map.
- The choice: `objVisitTarget` (`src/js/villager-objectives.js:782-800`):
  scores fire-group mates +3, trust > 40 +2 / > 20 +1, away +2; picks the
  top scorer; returns null when nobody scores. A roster member with score 0
  (not a fire-group mate, trust ≤ 20, at home) is NEVER chosen — villagers
  only visit people they actually know. Strangers (non-roster) are never
  candidates at all.
- Bonds: `bondProposalMaybe` (`src/js/bond-initiation.js:340-372`) fires on
  VISIT arrivals and the daily pair tick, gated on warming bond
  (15 ≤ warmth < 50, depth < 1), `pairAffinity >= 0`, and
  `bondProposalPerceived` (`:204-234` — fire-group, existing bond, gossip
  heard naming the target, or sensed ally; "Never a roster scan, never a
  list feed"). Every proposal emits `tele('bond_proposed', ...)` (`:185`).
- MEASURABLE: VISIT objectives formed, target channel (mate / trust /
  away), count of zero-score roster members at decision time (strangers
  never chosen); bond_proposed tele events by kind/outcome.

### FORAGING — NO patch-knowledge store exists; destination is random

- `mapmemNoticeNode` (`villager-mapmem.js:197-209`) records ONLY corpses.
  No forage-patch store, no rich-patch memory, no known-patch read was
  found anywhere in `src/js/` (grep: `forageTarget|richPatch|patchMemory|
  knownPatch|forageMemory` — zero hits).
- The destination: `objPick` (`src/js/villager-objectives.js:267`) FORAGE
  branch (`:529-531`): random direction (`pick(DIRS8)`) × random distance
  1–2 (capped by `npcMaxDist`); the tile is set at `:599-601` with no
  knowledge read. Forage yield is folded into the scalar
  `villagerDayProduction` — no per-plant attribution exists.
- MEASURABLE (as a negative result, reported not gated): share of FORAGE
  destinations landing on tiles the villager had already visited
  (`visitedTiles`) vs new ground — the pick is random, so the share is
  expected at chance level, which IS the finding (the choice is not
  knowledge-driven). UNMEASURABLE-WITH-REASON: trips to known-rich patches
  — no patch store exists to read.

### EXPLORING — NO knowledge read in destination choice; visitedTiles is write-once, read player-side only

- Store: per-villager `visitedTiles` (seeded at game start: haven + 2–5
  nearby tiles, `src/js/game.js:11920-11932`). It is WRITTEN exactly once
  (seed) — the only write in `src/js/` is `game.js:11928` — and NEVER
  updated by travel. It is READ only by `compareMaps` (conversation
  action, `:11938-11955`) and `villageMapKnown` (codex MAPS section,
  `:11962-11977`) — both player-facing, never by any villager movement
  decision. `know[vid].places` (`src/js/villager-agency.js:121,615`)
  grows via `expeditionSign` and is spent as teachable lessons
  (`npcFieldLessons`, `:885-900`); no routing decision reads it.
  `a.stats[vid].nodes` records expedition nodes visited, but no
  destination decision was found reading it.
- The destination: `objPick` EXPLORE branch
  (`src/js/villager-objectives.js:556-558`): random direction × random
  distance 1..maxD — same random pick as FORAGE.
- MEASURABLE (as a negative result): share of EXPLORE destinations on
  already-visited (seeded) tiles vs new ground; `compareMaps` events
  (map knowledge actually shared through conversation).

## Legs (all on band 170217–170224, competent, 100d max, death-aware)

- **Leg 0 — smoke (1 seed, 30d, MODE=on).** Instrument installs, no crash,
  per-seed JSON written with all five domain sections present.
- **Leg 1 — pilot (8 seeds, 100d, MODE=on).** The first-numbers capture.
- **Leg 2 — neutrality (3 proof seeds 170217–170219, 30d, MODE=on vs
  MODE=off).** End-state digest (day, roster alive, pantry kcal,
  standing, wave unlocked, won/over) byte-identical with the instrument
  on vs off — the instrument observes, it does not steer. Run inside the
  proof test, not as a judged sweep.
- **Leg 3 — determinism (same 3 proof seeds, 30d, MODE=on twice).**
  Per-seed event tables byte-identical across repeat runs.

## Binding metrics per domain (reported, not gated — M-values are findings)

- FOOD: villager pantry draws by known-status (share known-edible);
  unknown items present-but-never-drawn per seed; `villagerExperimentBeat`
  fires per seed.
- LOOTING: haul objectives formed per seed, split by channel
  (famine / knowledge) and by flesh known-status (known-safe / unrevealed);
  haul arrivals + at-the-body outcome split; expedition cache finds per
  seed (knowledge-independent count).
- PEOPLE: VISIT objectives per seed, target channel split
  (fire-group mate / trust band / away); zero-score roster members at
  decision time (never-chosen count); `bond_proposed` tele events per seed
  by kind/outcome.
- FORAGING: FORAGE destinations per seed, split visited-before vs new
  ground (chance-level expectation stated, not gated); known-rich-patch
  trips: UNMEASURABLE (no patch store — reason recorded).
- EXPLORING: EXPLORE destinations per seed, split visited-before vs new
  ground; `compareMaps` events per seed.
- Wall numbers (every run): national / table / wins, wave reach 1–5,
  median + max survival, death-cause shares (`state.village.fallen`).

## GO bar (instrument validity + complete first-numbers capture)

**GO** iff ALL of the following hold:

1. The instrument runs to completion on every pilot seed (8/8 per-seed
   JSONs written, no seed crash, no missing section — food, looting,
   people, foraging, exploring, wall).
2. **0 instrument errors** across all 8 seeds
   (`instrumentErrors.length === 0` in every per-seed file).
3. **Capture completeness**: every domain has a counted table OR an
   explicit `unmeasurable` marking WITH its reason (known-cache trips,
   known-rich-patch trips). No domain is silently absent.
4. **Neutrality leg pass**: MODE=on vs MODE=off end-state digests
   identical on all 3 proof seeds.
5. **Determinism leg pass**: MODE=on repeat runs byte-identical on all 3
   proof seeds.
6. **Proof test green**: `scripts/test-knowledge-b.js` passes, including
   recorder-validity fixtures that FAIL on broken fixtures (swapped
   known/unknown labels, dropped events) and ≥3 seeds per MEASUREMENT §5.

**NO-GO** if any of 1–6 fails. A NO-GO still publishes the partial capture
with the unmeasurable cells named — the blank is documented, not hidden.
M-values themselves are reported, never gated: a domain showing 0%
knowledge-driven choice is a finding (the choice is not knowledge-driven),
not a failed bar.

## Seed-freshness record

- Candidate band 170209–170216 checked 2026-11-10 before this prereg:
  - COLLISION: named in `evidence/2026-11-10/sim-diplo-a-prereg.md:159` —
    "Confirm band (if a later build arm needs one): 170209–170216, NOT
    spent". Per the seed-band-freshness skill a band named anywhere is
    treated as used, even when no judged corpus exists for it. NOT taken.
  - Forbidden bands avoided (named in the task brief): 160209–160216
    (medcure), 170201–170208 (spawncensus), 99101–99108 (secondlink),
    96301–96308 (medicdiag/medicduty), 58201–58208 (sicknessdiag),
    95205–95208 (medchannel), 99201–99208 (standacc).
- Chosen band 170217–170224 checked 2026-11-10 before this prereg:
  - `grep -rnw -E '17021[7-9]|17022[0-4]' evidence/ --include='*prereg.md'`
    — NO hits (all dated preregs searched, per the skill).
  - `grep -rn '170217' ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/`
    — NO hits (tracker + sim-findings + coverage audit searched).
- Conclusion: **170217–170224 is fresh.** The 170209–170216 collision is
  recorded here so the next worker does not repeat it.

## Comparison context (not judge)

- Coverage audit 2026-11-10 §3 (combat slice, summarized above) and §4
  (systems map: foraging/cooking/teaching/travel/conversations played
  daily but never panel-judged; godpath/fans/corruption never played).
- `sim-diplo-a` (2026-11-10, band 170201–170208, GO on instrument
  validity): the driver/instrument pattern this arm reuses
  (`scripts/secondlink-driver-20261110.js`, `scripts/sim-harness.js`
  `loadGame`/`setupGame`/`runDays`, competent verbatim).

## Metric review note (pre-registered, for the evidence file)

- The GO bar deliberately gates on instrument validity, not on M-values:
  this is a FIRST-NUMBERS measurement arm, and a 0% knowledge-driven rate
  in a domain is the finding Steve asked for ("measure all"), not a miss.
  If the pilot shows the instrument cannot separate known from unknown in
  some domain (e.g. `pantryItemKnown` unavailable at a call site), that is
  recorded under "metric review" and the metric is revised for the NEXT
  run — never re-scored within this run.
- Risk noted in advance: `pantryDraw` is also called for the scholar's own
  meals and by other systems (betrayal, feast draws). The instrument tags
  villager-meal draws by wrapping `villagerMealDay` with a reentrancy flag;
  draws outside a villager meal are counted in a separate `otherDraws`
  bucket and excluded from the FOOD rate. If the flag proves unreliable
  (e.g. a villager meal path that bypasses `villagerMealDay`), the FOOD
  rate is reported with the attribution caveat, not silently merged.
- Risk noted in advance: VISIT target channels overlap (a target can be
  both a fire-group mate AND trusted AND away). Channels are recorded as a
  SET per decision, and the split table counts decisions with each channel
  present — the channels are not forced mutually exclusive, so the split
  may sum past 100%. That is honest counting, not double-counting.
