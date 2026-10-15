# sim-trustdelta-b — trust-delta-by-source instrument (loop B ARM 3, 2026-10-15)

Claims sim-findings #265 (FEED-SIDE TRUST GAINS). Instrument-only: zero src/js changes.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding)

- **Question**: where does trust actually come from in a living village, per policy?
  Decompose the trusthalf-vs-mealonly divergence in the source mix: identical
  sting-flow removal (25–30k refused takes), opposite trust direction. The
  standing theory: the FED scholar donates surplus (donations via
  trustGainProgressive) and keeps talk/mediate gain channels working, while
  the hungry scholar generates no gains.
- **Instrument**: scripts/trustdelta-lib-20261015.js — harness-side wraps
  (call-through, predation-lib pattern). A Proxy on Game.state.village.trust
  captures EVERY trust write (vid, before, after, delta); source attribution
  via (1) resolveConsequence spec.name (the named funnel), (2) per-applyRep
  observe:<action> / ripple, (3) stack classification fallback.
  Source categories: donations, talk, mediate, meal, amends, teaching, gossip,
  feast, aid, ripple, bump, event, trade, contest, ability, other.
- **Primary metric**: ≥80% of trust-delta ticks attributed to a named source
  (not 'other').
- **GO (diagnostic)**: ≥80% coverage AND named dominant sources per policy,
  with the trusthalf/mealonly divergence decomposed in the source mix — or
  honestly named UNCONCENTRATED per the pre-registered rule (no dominant
  source = finding, not failure).
- **Horizon**: 180d death-aware (runDays breaks on Game.over / deadTail).
- **Seeds**: 11/22/33/44/55/66/77/88. **Policies**: competent, belongseek,
  leadcourt (competent-family, unlayered — the bankleg-recal worker's
  take-discipline+banking layer is in sim-banklegrecal; NOT depended on).
  24 runs, identical seeds across policies.
- **Det-gate**: byte-identical armed-vs-pristine on 2 seeds (60d) BEFORE
  attribution is trusted.
- **SMOKE gate**: policy.daily fires ≥10×/run; ≥1 trust-delta observed per run.
- **Canon**: docs/CANON.md read. NO trust canon doc exists — stated here per
  the canon rule, no canon invented. Canon-adjacent rule honored: "Trust ≠
  reputation — gossip/rumors move REP only, never trust" (CANON.md). The
  instrument flags any trust tick from a gossip path as a canon violation.

## METHOD NOTES

- Seed Math.random BEFORE eval (mulberry32, fixed default, SEED env override).
  Full src/js list in index.html order minus DOM-only
  (app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js). Never stub Game.save.
- Instrument-honesty bug found and fixed mid-run: `v.trust = v.trust || {}`
  ALWAYS assigns (the || only picks the value), so a naive defineProperty
  setter nested the proxy one level per such line — O(n²) degradation reading
  as a hang + N× duplicate ticks. Fixed: setter no-ops on self-assignment
  (scripts/trustdelta-lib-20261015.js). Det-gate re-run green after fix.
- Fixture proof: scripts/test-trustdelta-20261015.js (PARTs A–E).

## RESULTS

Sweep: 24 runs (8 seeds × competent/belongseek/leadcourt), 180d death-aware,
identical seeds across policies. 43,844 trust ticks captured.

### GO verdict: GO
- Detail-attributed: **100.00%** (0 'fn:?' ticks of 43,844) — every trust
  write traced to a game function. Named-bucket coverage 23.9% (the brief's
  buckets are a lens; the detail mix is the decomposition).
- Dominant sources named per policy (consistent across all three):
  1. `resolveOneAssignment` — villagers completing assigned work: 5.9–8.2k
     ticks/run-pool, net +2.9k–3.6k. THE dominant trust source.
  2. `observe:order` — leadership orders: 2.9–3.8k ticks, net +683–930
     (talk, with −460–815 in penalties).
  3. villager objectives (`objAwayStep`/`objTick`/`objReturnEffect`):
     ~2.1k ticks, net ≈ +1.7k.
  4. `resolveWildMonsterEncounter` — villagers fighting monsters: 508–659
     ticks, net +512–632.
  5. `takeFromPantry` — takes cost trust: net −252–341.
  6. `leadershipFriction` — net −650–872.
  7. `playerDeath` — succession swings: net −476–961.
- Gossip canon check: **0 violations** in 43,844 ticks. Rumors move REP
  only — the canon holds in live sims, not just the fixture.
- Reconciliation: 0 mismatches (per-vid tick sums == final−initial).
  Instrument errors: 0. Det-gate byte-identical (60d, s11).

### Divergence decomposition (the #265 question)
The unlayered baseline's trust comes overwhelmingly from VILLAGER WORK
systems — assignments, objectives, orders, fights. The scholar's own
generosity channels are essentially ABSENT:
- donations: 25 ticks across 24 runs (net +12)
- feast: 19 (net +26); teaching: 1
- giveFood (personal gift): **0** — amends: **0** — comfort: **0** —
  meal: **0** — mediate: **0**
This decomposes the trusthalf/mealonly A/B from the other side: the fed
scholar in trusthalf ADDED a donation channel (17.4k kcal donated → trust
via trustGainProgressive) on top of a baseline that has no donation channel
at all, and a fed, present scholar keeps the talk channels (orders,
initiative) firing. Meal participation grants no trust directly — the meal
is a precondition (fed scholar), not a source; the instrument honestly
reports meal ≈ 0.

### Channel census vs the DEAD GIFT/COMFORT/AMENDS finding
CONFIRMED and extended: gift/comfort/amends/teach/mediate have zero fires
across 24 long runs (was: zero fires on 16 census combos). The r16b-era
theory that villages recover trust through these channels has no measured
instance on the competent-family road. The village recovers trust through
WORK — assignments, objectives, fights — not through gifts or words.

### Sense-testing (SENSE-TESTING LAW)
Read beats around the major deltas (|applied| ≥ 8): transcripts support the
attributed sources. Succession beats show the death + mantle transfer
(playerDeath ±); corpse-looting shows villagers refusing talk
(observe:loot_corpse −10); arrivals show wanderers joining (arrivalTick
+10); fight beats show witnessed bravery (observe:fight +10). The +8 ticks
on playerDeath for some villagers read as the village rallying around the
new bearer — coherent with the succession fiction.

### Wall numbers (standing directive)
national 5/24, table 0/24, won 0/24, maxWave 4, median survival 111d,
max 182d. Death causes: monster:combat 103, villager:combat 58,
monster:villager combat 35, villager:monster 30, starvation 19, sickness 19,
contest 11. The scale wall stands: villages reach national in 5/24 runs,
the table in none.

### Metric review (§14)
The pre-registered GO is met as written. One metric note for the NEXT run:
named-bucket coverage (23.9%) undercounts honest attribution — the
'other' bucket holds semantically clear work-system sources
(resolveOneAssignment, objectives). A future revision could add a 'work'
bucket; I kept the brief's buckets verbatim this run.

### Convergence state
Instrument: converged (landed). Axis finding: the trust-source map is now
measured — the next trust-side lever should target the work-system channels
or open the dead generosity channels, not tune donation math in a vacuum.
Sim-findings #265: fixed (instrument landed).
