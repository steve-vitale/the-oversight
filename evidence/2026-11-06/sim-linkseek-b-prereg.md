# Link-seeking probe — PRE-REGISTRATION (arm sim-linkseek-b)

Run: fleshout-loop-b-20261106T0730Z. Loop B winnability-chain arm:
standaccum-b next blank #1 — why competent play never forms a link.
Committed BEFORE any judged sim. POLICY-SIDE ONLY, zero src/js.
No gate/price/deed change. No game-code change unless Stage 0
proves a policy leg cannot reach the blocker — and then DIAG only,
no game-code build this run. Do NOT rebuild villager-initiated
bonds (separate main-session build). Do NOT touch Loop A's live
arms (staging+rally, finishing probe) or flee-repair (STEVE CALL).

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` (standing
  gate; readiness gates the standing unlock). No canon invented.
- `evidence/2026-11-04/sim-standaccum-b.md` + its prereg (the
  DIAG-GO this arm continues): diplomacy is ABSENT, not short —
  0 links ever created on 8/8 seeds, 0 counting/0 seasoned/0
  young/0 broken across ~860 snapshots; war+bread carry standing;
  three seeds clear 200 raw and still sit at gated 199 because
  readiness-5's only short bar is veterans 0 of 2; the 99107
  pattern does NOT recur on current master.
- `evidence/2026-10-23/sim-links-diag.md` (prior leadcourt arm):
  under a courting policy links DID form (6–7 formations) but
  dissolutions ate them — the HOLD, not the attempt rate, bound.
  That arm is the reason this probe keeps leadcourt's propose/
  answer/tend parameters unchanged and isolates the TRAVEL leg
  as the delta.

## Grounding verified in code before the pilot (not assumed)

- `src/js/standing.js` `villageStanding()`: war = ledger points
  (waves 3+4+5) x25, diplomacy = seasoned REGIONAL+ links x34,
  plenty = qualifying feasts (quality >= 1) x20; t4=100, t5=200;
  plenty caps at 100 toward T5; total holds at t5-1=199 while
  any readiness-5 bar is short.
- Seasoned (`src/js/hierarchy.js` `_linkSeasoned`): active, 30+
  days old, trust 40+ (conquered: season only). Regional+
  (`standing.js` `_linkRegionalPlus`): LEAD / BELONG / LEAGUE
  polity participation — a seasoned bond with a splinter
  village scores 0.
- Links are born only through player-driven conversation
  answers: `_formLink` callers are `proposeLink` (score >= 55
  forms; 35–54 stages a counter, answered by `answerCounter`
  accept/sweeten/walk), `answerCounter`, primacy/covenant
  answers, raid/conquest answers, plus debug scenarios. There
  is no autonomous villager link-formation path in the callers
  found.
- `judgeLink` (hierarchy.js): base 38 + representative
  standing/2 (max 20) + opinion/2 + allied 15 + strength diff
  (max 15) + subordinate 10 + generosity 8 (opinion 5+ and
  tribute >= 3000) + R()*20-10. A cold proposal usually lands
  in the counter band, not a flat decline — the negotiation is
  the climb.
- Knowledge gate (`knowsVillage`, knower-traced 2026-10-29):
  true when the player's lore has the village, when the
  village is `generated`, or when a delivered `village` rumor
  names it. Villages become known by approach:
  `checkVillageProximity` (within 2 tiles) runs `catchUpSim`
  (how 'visit' at dist <= 1, 'seen-nearby' at dist 2) and sets
  `generated`; `recordVillageLore` also traces 'told' gossip.
  Other villages sit on the 9x9 home board (x,y), so a walking
  scholar can reach them.
- The climb verbs need presence: `studyVillageCodex`
  (game.js:9923) requires dist <= 2 (or joined) and gives +3
  opinion once per village (hierarchy.js wrapper) plus
  knowledge. `proposeLink` itself needs only knowledge, not
  presence.
- `scripts/policies/competent.js` contains ZERO scale code by
  design (pinned scale-free baseline, MEASUREMENT.md §2): no
  `proposeLink`, no `answerCounter`, no courtship of any kind.
  `scripts/policies/leadcourt.js` is competent + LEAD courtship:
  answers pending counters (accept; sweeten if pantry > 25000),
  accords, national/global choices; tends Haven-primary links
  weekly (pantry > 20000); proposes from day 25, pantry > 12000,
  one/day, 7-day cooldown per village, stops at 3 subordinate
  links, tribute 4000, asSubordinate false.

## Primary question

Why does competent play never form a link — never-met
villages, never-accepted bonds, or both? And under a
link-seeking policy, do links form AND season (trust 40+,
30+ days, regional+ polity) so diplomacy standing moves?

## The lever (policy-side only)

`scripts/policies/linkseek.js` — competent + link-seeking:
leadcourt's propose/answer/tend parameters EXACTLY (see
grounding above), PLUS the travel leg, which is the delta
under test:
- Each day after competent.daily: pick the nearest KNOWN
  village with no link (perception-gated: only villages the
  player actually knows via lore/generated/delivered rumor,
  never from a roster). If the scholar is farther than 2
  tiles from it, walk toward it with competent's exported
  `walkTo` (honest hop-by-hop `travelTo`, no force), at most
  one travel leg per day, only when pantry > 12000 and living
  roster >= 4 (never walk a starving or skeleton village into
  the wild to court).
- If within 2 tiles: `studyVillageCodex` once per village
  (the +3 opinion climb verb; tracked in ctx so it fires
  once), then propose under leadcourt's rules the same day.
- Counters/accords/national/global answered exactly as
  leadcourt does. Tending exactly as leadcourt does.
If no village is known, the travel leg has no target and
the policy degrades to leadcourt courtship — that outcome
is itself diagnostic (knowledge-blocked) and is recorded,
not worked around by inventing exploration.

## GO bar (binding — judge only against this)

GO iff ALL of:
1. Armed forms >= 1 SEASONED link on >= 2/8 seeds AND
   diplomacy standing > 0 on those same seeds (seasoned =
   `_linkSeasoned` true; diplomacy = `villageStanding()`
   .diplomacy > 0 on the seed's peak snapshot).
2. Classification delivered on all 8 seeds: each seed
   classified never-met / never-accepted / both (baseline
   leg) and, for the armed leg, the blocker named where
   links still don't form (knowledge / acceptance /
   seasoning-hold, with counts).
3. Guards hold: median survival armed >= 0.8x baseline
   median survival; total wave-4 ledger points armed >=
   0.5x baseline total (wave-4 kill proxy =
   `waveLedgerPoints(4)` summed across seeds; if the
   baseline total is 0 the guard is vacuous and is
   recorded as such, not as a pass-with-evidence).
A miss on any clause is NO-GO, never re-scored against a
friendlier metric mid-run. Metric problems go under
"metric review" for the NEXT run.

## Classification rules (applied by the analyzer)

Baseline leg (`competent` verbatim, proposals 0 by
construction — asserted, not assumed):
- `never-met`: max known villages over the run = 0 (no
  village ever known; propose never had a target).
- `never-accepted`: max known >= 1 (villages were known
  and never asked — competent contains no ask).
- `both` is recorded only if the armed leg ALSO shows
  knowledge failure (armed max-known = 0) AND acceptance
  failure on seeds where it knew villages; otherwise the
  baseline split above stands.
Armed leg, where links still don't form:
- `knowledge-blocked`: armed max-known = 0.
- `acceptance-blocked`: armed proposals >= 1, formations
  = 0 (report the outcome split: formed / counter /
  declined / shut-door / refused-unknown).
- `seasoning-blocked` (hold): formations >= 1, seasoned
  = 0 (report the hold split per link: too-young /
  low-trust / not-regional / dissolved, with ages and
  trust at end/dissolution).

## Method

- Two legs per seed, identical seeds, sequential
  `loadGame` calls (separate harness loads, same seed, so
  trajectories start identical and diverge only where
  the policies differ): BASELINE `competent` verbatim,
  ARMED `linkseek`. Default env. No policy variants
  beyond these two.
- Seeds: 56001–56008. Horizon: 150 days, death-aware
  (dead villages stop simulating; +10d tail max).
  Pilot scale: this 8-seed pilot; confirm 12–16 fresh
  seeds ONLY on pilot GO (confirm band 57001–57008 is
  reserved for this run's confirms).
- Instrument (`scripts/linkseek-instrument-20261106.js`,
  wraps `standaccum-instrument-20261104.js` and adds a
  per-snapshot KNOWLEDGE roll + court log): daily
  snapshots of the full standaccum set (standing raw +
  gated + war/diplomacy/plenty split, ledger per wave,
  full link roll with non-counting reason, feast log,
  readiness-5 bars, ready days, veteran counts, roster)
  PLUS per village: id, name, x, y, generated, rumored,
  lore how/day, knowsVillage bool, Manhattan distance
  from the scholar, opinion, linked?; PLUS court
  counters per day: proposals made + outcome, counters
  answered (accept/sweeten/walk), accords answered,
  studies done, travel legs taken, first-sight visits.
  Link formation/seasoning/dissolution events are
  derived from consecutive-snapshot transitions (stated,
  not hidden — the engine records no link-event log).
- Driver (`scripts/linkseek-driver-20261106.js`): runs
  both legs per seed, writes per-seed JSON to
  `evidence/2026-11-06/perseed-linkseek-b/` (sims write
  once, on purpose; refuses to overwrite). Say-lines
  captured with a TIGHT filter (the standaccum filter
  drowned in pantry lines: `Standing \d|FEAST|HELD|draft
  waits|smoke on the horizon|declines|counter|codex|study|
  \blink\b|bond|realm|polity|propose|tribute`) for the
  sense-test.
- Analyzer (`scripts/linkseek-analyze-20261106.js`):
  per-seed classification + outcome splits + GO/guard
  verdict + wall numbers.
- Scale-wall numbers every run: wins / national /
  table, wave 4–5 unlocks and facings, median survival,
  per leg.
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot
  gate (this 8-seed run), death-aware horizons,
  pre-registration (this file), metric binding (§14),
  balanced panel (§15 — a before/after comparison
  EXISTS here: baseline vs armed on identical seeds, so
  the panel compare IS attached via
  `scripts/balance-panel.js`).

## Seed-band freshness (mandatory, re-verified this run)

- Band 56001–56008: searched ALL committed preregs
  (`evidence/*/sim-*-prereg.md`, 0 hits), all
  2026-10/2026-11 sim evidence `.md` (only hits are
  commit-hash substrings `6560051d3` in
  `evidence/2026-10-27/sim-scale-onramp-round-1631.md`
  and `56007c185` in
  `evidence/2026-10-30/sim-food-economy-round-1230-b.md`
  — hashes, not band namings), the convergence tracker
  (0 hits). Coordinator pre-check found 0 hits in all
  committed preregs and 0 hits in all evidence `.md` as
  of ~07:40Z; re-verified above. FRESH.
- Confirm band 57001–57008: 0 hits in all committed
  preregs. Reserved for this run's confirms only.

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether the seasoned-link
  GO bar, the classification rules, and the ledger-point
  wave-4 proxy held up.
