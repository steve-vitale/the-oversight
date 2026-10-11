# Long-run sim: TRAVEL & REGIONAL lever (2026-10-11)

Lever 8. Worktree `sim-travel`. Canon read first: CANON.md, SCALE.md.

## Baseline (12 seeds × 200 days, winseek policy, pristine engine)

| measure | result |
|---|---|
| first contact (rumor) | day 2–9 (early-contact lever healthy) |
| regional (first link) | 12/12, day 3–8 |
| national | **0/12** — natDay None on every seed |
| global | 0/12 (blocked on national; viewership already ~35–43 by day 7 — the 40 bar is nearly free) |
| foreign 4-realm | formed in 2/12 runs (seed 8: 5-realm; seed 12: 4-realm) — the engagement engine works |
| survival | 10/12 village-lost (median ~30d), 2/12 survived 200d |
| table / won | 0/12 |

Journey-scale leg (2026-10-11, survival-first policy) got national 1/4 via
covenant at day 35 — the ladder is walkable, but the winseek policy never
gets there.

## The weak link: the succession death-cascade (diagnosed, then levered)

Instrumented seed 8 (diag scripts): 5 leader deaths in 3 days (d17–d19) cost
**−8 trust per death per link** (−40 total: 39→0) and the young-link grace
beat's expiry compounded tribute **×1.5 per lapsed beat** (6000→9000→13500→
20250→30375/week). Links could never mature to the BELONG bar (trust ≥50,
14 days, arrears 0). The win gate REQUIRES fighting (wave deed bars
5/5/4/3/2); the ladder punished fighting multiplicatively — the two systems
were structurally at war.

**Lever played (ONE): grief coalesces** — `src/js/hierarchy.js`,
`successionCrisis` + `theirLeaderDied`. If a link is already grieving (a
young-link beat already staged, or inside the 7-day mourning window), a new
death extends the grief but applies no new −8, no new beat, no new ×1.5
leverage. The first death keeps its full designed force (−8, mourning/beat,
leverage). The neglect snap still runs mid-grief (death + neglect kills).
Exact numbers: no numeric bar changed (trust ≥50, 14d, 4-realm, −8, ×1.5 all
kept — the definitions are not weakened).

Proof: `scripts/test-succession-coalesce-20261011.js` — 15/15 × 3 seeds
(4242, 7, 99). Before: 3 deaths → young link 30→6, old link 30→14 with
tribute 4000→9000. After: 30→22, tribute 4000→6000, one beat.

## Before/after on identical seeds (improved policy both sides)

The winseek policy predated the young-link grace beat (2026-10-10) and never
answered renegotiation beats or demands — each lapsed beat is −6 + ×1.5
tribute, the designed recovery path (+8 gift / +5 visit) unused. Fixed the
instrument: `scripts/policies/winseek.js` diplomacyRoad now answers beats
(gift if pantry >8000, else visit) and demands (accept). before2 = pristine
engine + improved policy; after2 = fixed engine + improved policy.

maxTrust (weekly max link trust), 12 identical seeds:

| seed | before2 | after2 |
|---|---|---|
| 1 | 18 | 34 |
| 2 | 1 | 41 |
| 4 | 9 | 25 |
| 8 | 0 | 22 |
| 11 | 28 | **52** (crossed the BELONG 50 bar) |
| others | = | = (unchanged trajectories) |

National: still 0/12. Seed 11's trust-57 link (day 21, age ≥14) failed the
beat only because no foreign 4-realm existed (fpMax 2) — the realm side, not
the trust side. Seed 12 grew a foreign 4-realm (day ~40) but Haven had no
link to its primary. The lever fixed maturation; the remaining gap is
survival (median ~30d vs the ladder's ~100d pacing) + realm formation timing.

## Reachability verdict per rung

- **village → regional**: reachable, healthy (12/12, day 3–8). First contact day 2–9.
- **regional → national**: reachable but rare. Organic: covenant 1/4 (journey-scale),
  belong/lead/trade/conquest/refuse 0 observed in 24 winseek seeds. The six
  beats' mechanics were proof-tested (test-national-shapes-20261010 green
  except 3 pre-existing wave-5-gate failures, identical on pristine HEAD).
- **national → global**: mechanics staged correctly (test-scale-ladder F
  green); organic 0/12 — blocked on national. Viewership bar 40 is nearly
  free (~35+ by day 7); the "season+ of being worth watching" intent is not
  what the numbers do. Documented, not changed (tuning call for Steve).
- **catch-up sim**: verified working — approach within 2 tiles runs the sim
  (probe: Emberhold day 0→62, named 6-person roster, fisher focus, 7 plants,
  re-sync on revisit). News records named hunger deaths / births; the probe
  village never exceeded pop 6 so no news fired (by design: never below 6).
- **foreign polities**: engagement-driven growth works (pair → 4–5 realm in
  ~4–8 weeks observed); drift-only never passes a pair (break-it r12 held).

## Sense-testing (transcripts read)

- Grief beat: "🕯️ Bill is dead — and the dead hold no treaties. Every link
  Haven has shakes." + "Grief delays the verdict: send grain (1,500 kcal),
  send a speaker (2 days), or let the silence answer." — meaningful,
  consequential, played. The coalesced second death stages no new beat
  (verified in unit test).
- Empty-pantry gift answer: "Haven sends 0 of 1,500 kcal — all the pantry
  holds. Ashford counts the gap, but counts the gesture too. (Trust +0.)" —
  honest (the +0 is stated), slight copy tension ("counts the gesture" / +0).
  Left as is; the proportionality rule is the design.
- Refuse-the-scale: System line ("The audience is... divided. Half of them
  just subscribed.") + plain-price line (no ×1.25, no league, table distant)
  — a real choice with real costs. Good.
- First-sight line: "You see smoke on the horizon. Emberhold — 6 people, 62
  days in. fishing folk, by the look of it. They know 7 plants — 3 new to
  you. They look lean — hungry, even. Food would talk here. They've been
  here the whole time." — excellent. BUT it fired twice for near-duplicate
  names: "Emberhold" and "Emberhold the Red Table" (a splinter). Two fires
  with near-identical names make rumors ambiguous ("Emberhold has bound
  Stonebridge" — which one?). Documented blank, not fixed (lever discipline).
- Rumor line: "a far fire sent another fire grain when their stores ran
  thin — no tribute, no ceremony, just food on the road. That's a thing
  villages DO now." — human, alive. Good.
- Villagers act like people: observed a villager waiting 3 days for a moot
  that never came, then walking to Thornfield the Red Table ("Another fire
  in the world, whether you wanted it or not"); foragers disputing the
  commons via runner ("Back off — or we'll talk with teeth." Trust −3).

## Village assessment (plain words)

The winseek villages court hard and die young. They propose early (first
links day 3–8, usually as subordinate with generous tribute), pay tribute
dutifully (100–500 payments/run), and answer every beat put in front of
them — but they fight everything (hunt patrols 3×/week, never flee at
start), so the player dies every week or two and each death used to shake
every link. Seed 8's village is the type specimen: two good links at trust
39 on day 15, five funerals by day 19, both links at trust 0 with tribute at
30,375 kcal/week by day 56 — a death spiral the design never intended. After
the lever, the same village holds its links in the 20–35 band for weeks;
the links still die, but of economics (tribute outgrowing the famine pantry)
and war, not of arithmetic. The villages that survived 200 days (seeds 5,
11) are quiet regional powers — linked, tribute-current, watching foreign
pairs become realms without ever quite reaching the table themselves. What's
missing is time: nobody lives long enough to finish the climb.

## Blanks filled vs documented

- FILLED: succession death-cascade (grief coalescing) — engine fix + proof
  test + before/after on identical seeds.
- FILLED: winseek policy ignored the grace beat and demands — instrument fix.
- DOCUMENTED: duplicate-ish village names (Emberhold / Emberhold the Red
  Table) confuse rumors and first-sight lines.
- DOCUMENTED: viewership-40 global bar is nearly free by day 7 — the
  "season+ of being worth watching" intent isn't in the numbers.
- DOCUMENTED (pre-existing, verified identical on pristine HEAD):
  test-scale-ladder-20261010.js section E (3 failures, seed 11 — Binding
  re-stage after walk) and test-national-shapes-20261010.js wave-5-gate
  assertions (3 failures). Not caused by this change; the wave-5 gate is
  another worker's area.

## Files

- `src/js/hierarchy.js` — grief coalescing (+39, ontology rule added)
- `scripts/policies/winseek.js` — answer renegotiation beats + demands
- `scripts/test-succession-coalesce-20261011.js` — 15/15 ×3 seeds
- `scripts/sweep-travel-baseline-20261011.js` — scale-trajectory sweep harness
- `scripts/diagnose-scale-20261011.js`, `scripts/probe-catchup-20261011.js`,
  `scripts/sense-travel-20261011.js` — diagnostics
- `scripts/sweep-travel-{baseline,after,before2,after2}-s1.json` — 12-seed data

No `[needs-eyes]`: no feel/combat/UI change (engine numbers only, copy untouched).
