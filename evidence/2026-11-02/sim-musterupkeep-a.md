# sim-musterupkeep-a — muster upkeep: fed march vs empty pack (Loop A 20261102)

Arm: muster upkeep feeding, axis scale-onramp, blank (3) from
sim-closedecay-a. Coordinator claim fleshout-loop-a-20261102T1340Z
(this arm; sibling Loop B live on food-economy — NOT touched; sibling
trees NOT touched; no goal hidden_files claim/lock files touched).
Prereg: evidence/2026-11-02/sim-musterupkeep-a-prereg.md, written
BEFORE any judged sim in this arm. Policy/instrument only. Zero
src/js changes. Ready for coordinator merge, pending ship (NOT pushed,
NOT bumped, NOT live-verified — ship loop owns deploys).

## Verdict: NO-GO — a fed march does not preserve the coalition

The fed-march policy (scripts/policies/musterfed.js: pack pantry
rations into the scholar's pack each evening up to the next dawn's
upkeep need) moves allied trust by +6.0 points on 97330 and +7.0 on
97338 at the day-matched contact day — against a pre-registered bar
of +20 on BOTH seeds. The bar fails on both seeds, and the mechanism
explains why it could never have passed: the pantry cannot sustain
the need, and the drain is all-or-nothing.

- Fully-fed dawns: 1 of 44 on 97330 (only the d99 dawn, from the d98
  pack of 11,173 kcal) and 2 of 39 on 97338 (d114, d142). Every other
  dawn still fired the hungry line and the full −2/link charge — a
  8,712-of-11,000 partial feed buys exactly as much trust as 0.
- The leg packed 80,583 kcal on 97330 and 38,090 kcal on 97338, and
  still starved the march: the need is 11,000 / 9,000 kcal EVERY day,
  while the pantry — which also feeds the village — empties within
  two days of packing (0 from d99 on 97330, from d114 on 97338) and
  then offers crumbs (286, 434, 600 kcal) or nothing for weeks.
- The arm is KILLED, not screened further. The pilot-gate rule
  allowed up to 8 screening seeds if trust moved on both — it did
  move, but by +6/+7 through a mechanism capped at ~1–2 fully-fed
  days per stand: no plausible seed screen reaches +20 when the
  pantry holds a fraction of one day's need. Screening would burn
  runs to re-prove a capped mechanism. The policy file is committed
  as a measured prototype, not landed as a fix.

## Upkeep source + rate (one sentence, from code)

Muster upkeep draws 1000 kcal per blade per day at dawn from the
scholar's pack alone (`Game.playerPackSpend` in
`titanMusterUpkeep`, src/js/titans.js) — never from the village
pantry — and charges −2 trust per mustered link on any day the pack
covers less than the full need, even on a near-miss partial feed.

## Baseline vs fed, per seed (identical seeds, closecommit baseline reproduced exactly)

Baseline reproduction (new driver, before any fed run): gate series
AND trust series identical to the closedecay records on both seeds
(proof test asserts both) — the comparison below is apples-to-apples.

### 97330

| | closecommit baseline | musterfed |
|---|---|---|
| Call | d97, gate 11, ready | d97, gate 11, ready (same) |
| Contact attempts | d110 ×12, all MUSTER-GATE refused, gate 8 | NONE — 0 attempts, scholar never ends a day on the lair tile |
| Trust at baseline contact d110 | Emberhold 65, Stonebridge 51 → mean 58.0 (Thornfield link row absent from d107) | Emberhold 72, Stonebridge 56 → mean 64.0 (Thornfield row absent from d109) |
| Gain at contact | — | +6.0 (bar +20: MISS) |
| Gate at d110 | 8 | 9 (trajectory diverged — see below, not a feeding effect) |
| Hungry dawns | 25 (d98–d122, 0 kcal fed) | 43 of 44 dawns (d98–d141); fully fed only d99 |
| Packed | 0 | 80,583 kcal over 45 packs (d97–d141) |
| Pantry at contact | 3,200 kcal | 0 kcal (0 from d99) |
| Arrears at contact | Stonebridge 2250 (Thornfield row absent) | Stonebridge 5250, Thornfield row absent |
| Fights / end | 0 fights, village-lost d122, 49 deaths | 0 fights, village-lost d141, 51 deaths (guardrail: NOT earlier ✓) |

Decomposition of the +6.0: baseline Emberhold fell 96→65 (−31 =
hunger −26 over 13 days + one −5 strike); fed Emberhold fell 96→72
(−24 = hunger −24 over 12 hungry days + no strike on that link).
Only +2 of the +6 is hunger saved (the single fully-fed dawn);
the rest is strike-timing divergence between trajectories.

### 97338

| | closecommit baseline | musterfed |
|---|---|---|
| Call | d113, gate 9 (already short) | d113, gate 9 (same) |
| Contact attempts | d118 ×6, all refused, gate 6 | NONE — 0 attempts |
| Trust at baseline contact d118 | Thornfield 85 (call day 96) → mean 85.0 | Thornfield 92 → mean 92.0 |
| Gain at contact | — | +7.0 (bar +20: MISS — and below the +10–11 arithmetic ceiling noted in the prereg) |
| Gate at d118 | 6 | 8 (trajectory diverged — see below) |
| Hungry dawns | 9 (d114–d122) | 37 of 39 dawns (d115–d152); fully fed only d114, d142 |
| Packed | 0 (130 kcal in pack on d114 only) | 38,090 kcal over 40 packs (d113–d152) |
| Pantry at contact | 0 kcal | 0 kcal (0 from d114) |
| Arrears at contact | Thornfield 0 (Emberhold/Stonebridge already in arrears at call) | Thornfield 0 (same) |
| Fights / end | 0 fights, village-lost d122, 46 deaths | 0 fights, village-lost d152, 46 deaths (guardrail: NOT earlier ✓) |

Decomposition of the +7.0: baseline Thornfield fell 96→85 (−11 =
hunger −10 over 5 days + −1 other); fed fell 96→92 (−4 = hunger −8
over 4 hungry days in the window + +4 other, strike timing again).
Only +2 of the +7 is hunger saved (the single fully-fed dawn d114
in the window).

## What a GO would have meant — and what this NO-GO means instead

As stated in the prereg, a GO here would have preserved coalition
trust for the NEXT call only — it would NOT have closed the muster
gap (the gate is fixed at call; feeding adds no blades, restores no
succession-eaten Haven blade, and cannot lift 97338's ceiling of 9
above the 10-blade gate). This NO-GO means even that narrower prize
is out of reach through the pack: the village's stores cannot fund
an 11,000 kcal/day march for two weeks. The trust bleed on a long
stand is, for practical purposes, the price of the stand — unless a
real fix draws upkeep from village stores directly (game-code
change, Steve-call territory, NOT proposed here) or the stand itself
gets shorter (faster contact, which neither arm achieves).

## Two trajectory facts, recorded not hidden

1. NO CONTACT IN EITHER FED RUN. Both fed scholars never end a day
   on the lair tile, so the primary metric's "own contact day"
   does not exist and the verdict falls back to the day-matched
   comparison (prereg allowed both readings; both miss). The
   baseline scholars reached the lair (d109 / d118) and attempted.
   The fed divergence is attributed to the leg's own actions
   perturbing the trajectory — daily pantry takes trip the
   fair-share / theft-confrontation bars, whose witness rolls
   consume RNG, shifting wild encounters, bearer deaths, and march
   outcomes. Feeding is not shown to prevent contact; contact
   absence here is trajectory noise from a pantry-touching policy,
   and the day-matched trust comparison (which does not depend on
   contact) misses by the same margin. A future contact audit
   should still explain why fed scholars oscillate Haven↔lair
   instead of ending days on the lair tile.
2. GATE AT DAY-MATCHED CONTACT DIFFERS (9 vs 8; 8 vs 6) — because
   bearer-succession timing diverged between arms (fed Haven blades
   survive longer on both seeds), NOT because feeding moves the
   gate. The prereg's "gate expected unchanged" did not hold, and
   the reason matters: gate comparisons across policy arms inherit
   succession noise. The gate conclusion stands on its own terms —
   feeding adds no blades — but cross-arm gate equality is not a
   clean check while succession timing diverges.

## Sense-testing (transcript judged for meaning)

- Baseline hunger line (every hungry dawn, both seeds): "🍽️ The
  muster is hungry — 0 of 11,000 kcal fed. Bellies remember who
  feeds them. (loyalty strains when the food runs thin.) (trust −2
  per fire per day while the muster stands hungry.)" The hunger is
  ANNOUNCED, with honest numbers, every day — but it is never
  EXPERIENCED: no ally speaks, no village reacts, no consequence
  lands except the trust arithmetic. The allies are remote fires;
  their hunger arrives as a ledger line, not a scene. A player
  watching only the fiction would know the muster is hungry and
  never feel anyone being hungry.
- Fed packing line (e.g. 97330 d98): "Packed: 1 Foraged food, 1 Aid
  from Emberhold, 3 Aid from Emberhold, … (11.2 Mcal, 8.0 kg)".
  As provisioning it reads fine; against the march fiction it sits
  oddly — the scholar packs tribute and aid out of Haven's pantry
  while days out on the road, with no travel fiction for where the
  food comes from. The remote-packing instrument limit (prereg)
  is audible in the transcript: the line never says the scholar
  went home. And on 43 of 44 dawns the very next line is still the
  hunger line — the fiction of a fed march never actually arrives.
- The fed run's pantry-emptying has no voice of its own: Haven's
  shelves hit 0 on d99 and stay there for weeks, with no line
  saying the village is eating its seed stock to feed the march.
  If a real stores-draw fix ever lands, it needs that line — the
  cost must be speakable, not just a zero in a trace row.

## Per-seed records (all under evidence/2026-11-02/perseed-musterupkeep-a/)

- mu-closecommit-s97330-r1.json — baseline reproduction (gate +
  trust series identical to closedecay r1)
- mu-closecommit-s97338-r1.json — baseline reproduction (identical
  to closedecay diag)
- mu-musterfed-s97330-r1.json — fed run (call d97, 0 attempts,
  village-lost d141, 45 packs, 1 fully-fed dawn)
- mu-musterfed-s97338-r1.json — fed run (call d113, 0 attempts,
  village-lost d152, 40 packs, 2 fully-fed dawns)

## Files committed (this arm)

- scripts/policies/musterfed.js — fed-march prototype (measured,
  killed, not landed as a fix)
- scripts/musterupkeep-driver-20261102.js — daily muster trace
  driver (closecommit + musterfed arms; driver-side reads only)
- scripts/test-musterupkeep-a.js — proof test, 35/35 green
- evidence/2026-11-02/sim-musterupkeep-a-prereg.md (pre-sim prereg)
- evidence/2026-11-02/sim-musterupkeep-a.md (this file)
- evidence/2026-11-02/perseed-musterupkeep-a/*.json (4 run records)

## Metric review (for the NEXT run, not this verdict)

- The +20 bar was unreachable on 97338 by hunger removal alone
  (prereg arithmetic bound: 5 hunger days = max ≈ +10–11; the bar
  needed 105 against a call-day 96). Future fed-march thresholds
  should be set from the hunger-day arithmetic per seed (days
  standing × 2), not a flat number — a flat bar silently grades
  the seed's calendar, not the policy.
- "Contact day" as a primary-metric anchor is fragile across policy
  arms: a pantry-touching leg perturbs RNG and march outcomes, so
  contact may not occur at all. Day-matched trust (same day number
  in both arms) is the sturdier primary for upkeep work; contact
  day should be secondary.
- Cross-arm gate equality is not a clean check while bearer
  succession timing diverges; gate claims need same-trajectory
  evidence or a succession-controlled comparison.
- The refusal line's allies-only "you have N" undercount and the
  12-attempts-on-one-day count (closedecay metric review) are
  untouched by this arm and remain open.

## Instrument observations (not verdicts)

- `takeFromPantryBulk` has no tile gate (code read): a marching
  scholar packs remotely. Any future policy that packs on the road
  inherits this fiction gap; a location-gated pack verb would be a
  game-code change, not a policy choice.
- The fed leg drains the pantry to 0 within two days of the call
  and the village still outlives baseline (d141/d152 vs d122) —
  pantry-zero does not itself kill the village on these seeds
  (villagers forage for themselves). Do not cite "pantry 0" as a
  village-death mechanism without a starvation trace.
- Baseline 97338's driver-computed national flag reads 1 at end
  (rank national/global at final read) despite village-lost d122;
  not investigated here — outside this arm's question, and the
  closedecay evidence does not report it either. Left for a scale
  audit, not chased mid-run.

## Next blanks, in order

1. STEVE-CALL CANDIDATE (unchanged from closedecay): should a
   committed blade be allowed to become the bearer (and thereby
   leave the muster)? This arm does not touch it.
2. Stores-draw upkeep as a game-code proposal (draw the 1000
   kcal/blade/day from village stores, with a speakable cost line
   when stores run thin) — needs Steve's ruling before any src/js
   work; this arm proves the pack route cannot fund it, not that
   the stores route should be built.
3. Why fed scholars never end a day on the lair tile (contact
   cadence under pantry-touching policies) — contact audit.
4. Succession-order rule (why the mantle passes through committed
   blades first) — unchanged from closedecay.

## Village assessment (plain words)

The village tried to feed its march. Every evening the scholar
packed everything finished the pantry held — eleven thousand
calories' worth on the good day, a few hundred on the bad ones —
and nearly every dawn the muster was still hungry, because an army
of eleven eats eleven thousand calories a day and the pantry holds
barely one day of that. The allies' trust still slipped, a little
slower on the one day the food covered, then at the same two points
a day after. The march lasted longer this time — the village held
on three to four weeks past where it died before — but it never
reached the herald at all, and the coalition it was trying to
preserve was still short of blades when the village finally fell.
Feeding the march through one person's pack is carrying water in a
cup: the cup can be full and the march still thirsty.
