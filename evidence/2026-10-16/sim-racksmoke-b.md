# sim-racksmoke-b — the RACK-side scholar smoke arm (finding #50's named next)

Run: fleshout-b 2026-10-16T~0850Z. Axis: food/preservation (finding #50).
Verdict: **PRIMARY NO-GO — KILLED**. Layer deleted per kill protocol; instruments + evidence landed.

## Pre-registration (binding, MEASUREMENT.md §14)

- Primary metric: scholar smoke/preserve calls per run. GO: ≥4/8 armed runs with ≥1 call (baseline 0/16, selfsmoke r18).
- Horizon: 180d death-aware. 8 fresh seeds [103,215,327,439,541,653,765,877] × {belongfeast, leadfeast} × {control, armed} = 32 runs, identical seeds both sides, own control in the same sweep.
- Substrate: SEATDRIVE=0 explicit (pre-seat), FEASTSCALE_R13=1. Asserted up front (SWEEP STOP otherwise).
- Guardrails: national ≥ control−2; median survival within 10d of control; starvation deaths ≤ control+2; no new death mode; fresh-rot kcal ≤ 1.15× control.

## What was built

`scripts/policies/racksmoke.js` (RACKSMOKE=1, default OFF; policy-side only, zero src/js):
the scholar works the village smoke racks at dawn via real verbs —
`takeFromPantry` (one unit/call, weight-checked, trust-ledgered) →
`preserveFood` (16 ticks, rough-first-then-solid, teaches 'preserve') →
`donateToPantry` (the smoked stack goes back; trust + granary +14d).
Coverage rules so the scholar is the second hand, not a rival: no-cook days,
blind-cook + knowing-scholar quality lane (0.95x/30d beats 0.80x/15d),
overflow past the cook's 4000-kcal budget, dinner-first 250/person reserve,
racks-full stand-down, and a trust-ledger guard that never takes the unit
that would trip the gift-REVOKE. Cap 3 stacks / 4 units / 2000 kcal per dawn.

Proof `scripts/test-racksmoke-20261016.js`: 24/24 PASS — RED→GREEN mechanism
on fabricated verb contracts (take→smoke→donate end-to-end, teach channel
opens, dinner reserve holds, racks-full/skilled-cook/trust guards fire,
once-per-day), det-gate byte-identical gate-off (2 seeds, 60d), gate-on
deterministic, SMOKE green. The instrument was honest; the pool was not there.

## Results (sweep-racksmoke-20261016.js, 32 runs)

| road | side | rack runs | rack smokes | learns | national | table | wave5 | wins | medSurv | starveDeaths | freshRot |
|---|---|---|---|---|---|---|---|---|---|---|---|
| belongfeast | control | 0/8 | 0 | 0 | 5/8 | 8/8 | 3/8 | 0 | 87.0d | 3 | 24,845 |
| belongfeast | armed | 0/8 | 0 | 0 | 5/8 | 8/8 | 3/8 | 0 | 87.0d | 3 | 24,845 |
| leadfeast | control | 0/8 | 0 | 0 | 7/8 | 8/8 | 8/8 | 0 | 110.0d | 2 | 21,484 |
| leadfeast | armed | 0/8 | 0 | 0 | 7/8 | 8/8 | 8/8 | 0 | 110.0d | 2 | 21,484 |

PRIMARY: 0/8 armed runs with ≥1 rack smoke call on both roads (bar ≥4/8) → **NO-GO**.
Guardrails: all pass — armed is byte-identical to control on every aggregate
(the layer never fired, so this is the det-gate in the wild, not luck).
Deaths: combat 688 + villager-combat 256 + monster 242 (~94%); starvation 10.
No new death mode.

## Root cause (the actual blank)

The scholar's `preserveFood` verb requires `foodKind==='meat'` **and**
`foodState∈{cleaned,cooked}`. The village pantry's meat arrives via
`stockPantry` (game.js:7568), which mints **unlabeled items** — no foodKind,
no foodState, no edible flag ("Snared meat", "Game meat", "Foraged food").
Measured over 60 dawns × 2 seeds: the pantry holds ~28k kcal of meat-by-name
at every day-part, but **0 kcal** of it is scholar-smokable. The about-to-spoil
surplus (~17–22k kcal/dawn) is likewise unlabeled. The cook's rack path works
it label-blind (Vera: "worked the smoke racks too", 140 notes/60d on seed 103);
the scholar's verb refuses it ("Nothing to preserve").

So the rack-side pool for the scholar's own hands is **structurally empty** —
not small, empty. The selfsmoke r18 diagnosis ("the scholar rarely holds
about-to-spoil cleaned/cooked meat at haven mornings") has a rack-side twin:
the village's about-to-spoil meat is never labeled for the scholar's verb.
No policy-side reframing can fix this: widening the verb or labeling pantry
meat are both src/js changes — a Steve design call (is unlabeled "Snared meat"
smokable? it's likely raw; the cook already smokes it raw, which the scholar
cannot). Filed as the named next below.

## Village assessment

- Belong road: villages reach national 5/8, table 8/8, wave-5 3/8, then die
  in the post-invite overtime (median 87d, combat ~94% of deaths). The wall
  numbers hold: the scale on-ramp is reachable, the win conversion is not
  (pre-seat substrate — wins 0/16 by design).
- Lead road: national 7/8, wave-5 8/8, median 110d — the stronger road on this
  substrate, same overtime ending.
- The racks ARE worked — by the assigned cook, 140 times in 60 days on seed
  103. The village does not lack rack labor; it lacks a scholar-sized handle.
- The #50 teach channel stays shut: 0 preserve learns in 32 runs. The
  scholar never smokes in these sims, pack-side or rack-side.

## Sense read (transcript beats, not just counts)

The cook's rack beats read as a person working ("🍲 Vera cooked for the
haven — meals stretched. Vera worked the smoke racks too — 1 batch preserved
(~3200 kcal, keeps a couple of weeks)"). The spoil mutters still repeat
word-identical across speakers (finding #56, already filed — Naran d8, Vera
d9: "Should've smoked that…"). The scholar's dawn rack beat never appears in
2,168 captured beats on seed 103 — the absence is the measurement.

## Metric review (required)

The pre-registered metric (≥4/8 armed runs with ≥1 scholar smoke call) was
honest but its **assumption** was wrong: it assumed a rack-side pool exists
for the scholar's verb and only needed finding. The pool is structurally
empty (label mismatch), not small — no threshold tuning would have changed
the verdict. A future arm needs an engine-side change first (verb widening
or pantry labeling — steve-call); its metric should then be kcal-based
(smoked kcal via the scholar's hands), not call-count-based, since the
scholar's work would substitute the cook's on the same pool.

## Convergence state

**killed-at-pilot** (full 32-run sweep run to confirm; verdict was evident
from the pool diagnosis). The finding #50 line stays open — the named next
is now engine-side, not policy-side.

## Named nexts

1. **steve-call**: should the scholar's preserve verb accept the pantry's
   unlabeled meat ("Snared meat", "Game meat")? And in what state — the cook
   smokes it raw today; the scholar's verb demands cleaned/cooked. Either
   label pantry meat at deposit (stockPantry) or widen the verb. Until one
   lands, no policy arm can open the #50 channel rack-side.
2. If the verb is widened: revive racksmoke with a kcal-based primary
   (scholar-smoked kcal vs the cook's blind rate) — the instrument
   (sweep-racksmoke-20261016.js) is landed and reusable.

## Files

- `scripts/test-racksmoke-20261016.js` — proof (24/24; INFO-SKIPs with RACKSMOKE_KILLED=1)
- `scripts/sweep-racksmoke-20261016.js` — sweep + instruments (reusable if the verb is widened)
- `evidence/2026-10-16/perseed-racksmoke/` — 32 per-seed JSONs (national/table/wins/exiled/wave5 numeric)
- `evidence/2026-10-16/racksmoke-beats/` — beat captures (sense read)
- `scripts/policies/racksmoke.js` — DELETED per kill protocol (zero src/js was ever touched)

Telemetry check: LOUD lines (national 12→24, table 16→32, wins 16→0) are
substrate-explained — the baseline is the win-side stack; this run is
pre-seat by design (SEATDRIVE=0), where wins are 0. Armed≡control on every
metric: the layer caused zero deviation.
