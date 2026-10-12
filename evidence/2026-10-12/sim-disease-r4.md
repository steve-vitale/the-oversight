# Longsim: DISEASE PRESSURE lever r4 (2026-10-12) — THE SEEKER

Lever 7 (disease pressure). Round 4. Canon read first: docs/CANON.md,
docs/DISEASES.md. r1–r3 re-read (evidence/2026-10-11/sim-disease.md,
sim-disease-r2.md, sim-disease-r3.md).

## Lever played: THE SEEKER POLICY (harness-only, no src changes)

Canon (DISEASES.md): "Alien diseases are min-max building blocks (drawback +
new ability + horrible physical transformation)... Some players avoid disease
at all costs, others seek infection to boost their build." **No prior sim
policy ever played the seeker angle** — the building-block half of the canon
was completely untested. Did seekers actually acquire the viruses? Did the
abilities fire? Was the bargain worth it?

**The change** (`scripts/policies/seeker.js`, new — competent + alien-seeking):
- PURE vector fights (every live monster is giant_mosquito/alien_tick): never
  flees on the new-fight assessment — the infection is the goal. Mosquito:
  WAITS without striking until it drinks (the drink is the 50/50 virus roll),
  then kills it in the heavy punish window. Tick: walks INTO adjacency
  deliberately (the honest counter is "keep 2 squares away"; the seeker does
  the opposite), takes the latch (50% lemons roll fires at latch), then kills
  it. The <35% HP mid-fight retreat still applies — a dead seeker gets no
  build. Mixed fights use competent rules.
- Monster meat: eaten as food, never avoided (chases the quirks). Human meat
  still refused (trembles: no cure, ever — not a build, a grave).
- Mundane sickness: fully competent (cookPack, drinkSafe, checkTicks).
- Stops seeking a vector once its permanent warping is held (eurika AND
  east_nile — min-maxers seek both; lemons for the tick).

Policy-honesty note: the seeker knows the vectors the way a real player does
after a few lives — the codex records meatDisease, counters, transformations.
The measurement is "does the building-block path function," not "is it
discoverable" (r3 covered discoverability).

**Sweep instrumentation** (`scripts/sweep-disease-lever.js`): registered the
seeker policy; counts alien-ability narration firings via say-wrapping
(eurika-sense, crow warnings, engorge, blood-sense, gristlefit — say is
silenced in sims); records seeker ctx stats (waits, walk-ins, drinks stood,
meat eaten).

## Before/after on identical seeds (6 seeds × {competent, seeker}, 200d horizon)

`evidence/2026-10-12/sim-disease-r4-sweep.json`. BEFORE = competent,
AFTER = seeker. Same seeds, same encounters (giant fights identical: 2 tick +
1 mosquito in both).

| measure | competent (before) | seeker (after) |
|---|---|---|
| giant vector fights /12 runs | 3 (tick 2, mosquito 1) | 3 (identical) |
| alien cases | **0** | **2 (lemons 1, eurika 1)** |
| seeker waits / walk-ins / drinks stood | — | 4 / 2 / 1 |
| Lemons engorge firings | 0 | **43** |
| eurika-sense / crow warnings / blood-sense | 0 / 0 / 0 | 0 / 0 / 0 |
| quirk-meat eaten | 0 | 0 (no quirk-carrier kills — see below) |
| median / max survival | 77d / 135d | 65d / 135d |
| player death causes | combat 15, starvation 9 | combat 14, starvation 8 |
| villager death causes | combat 23, wound 4, starvation 2, other 2, contest 2, murder 1 | combat 26, wound 4, starvation 2, other 1, contest 2, murder 1 |
| disease deaths (either) | 0 | 0 |
| win rate | 0/12 | 0/12 |
| arc reach | I–III 12/12, IV 0 | identical |
| wave reach | w1–w3 6/6, w4/w5 0 | identical |
| national / four-realm | 0 | 0 |

**The headline: the competent player fought all 3 vector fights and got
nothing — the infections were wasted encounters. The seeker converted 2 of 3
into permanent warping.** Seed 2026: 2 tick fights → walk-ins 2 → lemons on
the second latch (50% miss, then hit — the honest gambler's arc). Seed 4242:
1 mosquito fight → 4 waits → stood the drink → eurika → killed it in the
heavy window with a 92-damage spear strike.

**The bargain, measured:** the lemons carrier (seed 2026) ate with +20% kcal
efficiency for the rest of its life — engorge fired 43 times (+80–130 kcal
per meal). It died day 61 of combat vs its competent twin's day 79 (18 days
earlier; the warping's tax — 1 HP/part + energy x0.85 — is real, though
n=1 can't separate it from combat noise). The eurika carrier (seed 4242)
lived to day 80 vs competent's 77 — the virus cost nothing and the sense
never got a chance to fire (no ambushes in its remaining days). The viruses
don't kill carriers — combat does, same as r3.

## Reachability verdicts

- **The seeker path WORKS (first time tested).** Both permanent viruses were
  acquired by deliberate play, the abilities are real (engorge fired 43×),
  and the bargain is legible in the numbers. Not decoration.
- **east_nile: still 0 cases this batch** (blank 1 remains open). The one
  mosquito drink rolled eurika (50/50). Machinery verified again in proof
  (both viruses reachable from bites, r3's 400-call 50/50 still green via
  the unchanged code path). It's a sample-size problem now, not a machinery
  problem — a seeker who keeps getting bitten converges to both.
- **eurika-sense / crow warnings: 0 firings** — no wanderer ambushes or tent
  breaches occurred while the eurika carrier lived. The lines are proven
  (r3); they just need ambush events to trigger. Documented, not a gap in
  the virus half.
- **Quirk-meat half: UNMEASURED.** seekerMeatEaten = {} — across 12 runs the
  policies fought hushwolves 9× and belltoads 2× but won 0 (competent flees
  bad fights; the seeker inherits that). No kills → no carcasses → no quirk
  meat → no quirk cases in either policy. The seeker eats quirk meat when
  the village HAS it but doesn't HUNT quirk-carriers — and hunting a
  160-HP hushwolf is a different, more dangerous policy. Filed for r5: a
  hunter-seeker variant, or longer horizons. The temporary quirks (8–12
  dayParts) remain the untested half of the building-block canon.
- **Wave-3 reach note:** 6/6 both policies here vs 1/6 in r3's batch. The
  disease lever is harness-only, so this isn't my change — the combat-r5
  beast-trick policy upgrade landed on master today (2026-10-12) and the
  policy now plays monster counters tactically. Credited there, not here.

## Sense findings (SENSE-TESTING LAW — transcripts read)

`scripts/sense-disease-r4-20261012.js`. Two arcs, read whole:

**S1 — the lemons arc (seeker, seed 2026):** "Something moves out there —
tick." → "In the grass: legs waving, slow. Questing. It's not hiding — it's
fishing, and you're warm." → "⚔ TICK! Bao joins you!" (a villager joins the
fight — people, not props) → "It's on you — mouthparts in before you can
move. (5) LATCHED." → "Something was in you before you felt the bite — the
tick's bite. The joints ache, and a ringed red circle blooms on the skin."
(transformation narrated AT application — body horror as story beat) → "You
STRIKE the tick for 49 (Machete). The tick falls." → then the kicker: "Bao
leans in, voice low. 'Here's what we figured out about tick. Keep two squares
away...'" / "💡 COUNTER LEARNED — tick: Keep two squares away." **The seeker
learns the counter and will deliberately ignore it next time.** That is the
whole min-max story in one beat — knowledge earned, bargain chosen. Then
"Your occupied joints drink deeper — the food goes further. (+104 kcal,
Lemons engorge)" on nearly every meal thereafter. The build pays, visibly.

**S2 — the eurika arc (seeker, seed 4242):** "A mosquito the size of your
thumb, hanging in the air like it owns it." → "⚔ MOSQUITO! You're on your
own." → "Something lands on your neck with real weight — the mosquito's
bite. It drinks, and something cold goes in with the bite." (the seeker stood
still for exactly this) → "You STRIKE the mosquito for 92 (Hunting spear)."
(one shot, heavy window) → "💡 COUNTER LEARNED — mosquito: Hit it after it
drinks." Same irony: the counter is learned by taking the hit on purpose.

**Villagers act like people:** "🤒 Jenny is feverish, a cut gone hot and
angry. Rest and clean water — or it gets worse. Norman is already boiling
water. It's handled." / "⚔️ Emma killed the tick alone — 4 rounds, 15 taken.
Word travels fast. The village cheers." / "🤒 Luigi is feverish... Felicia is
already boiling water." Named sitters, unasked tending, solo kills that get
cheered — the village tends its sick and celebrates its fighters without
being told. (r2/r3 beats holding.)

**Nit (documented, not changed):** the d16 RAID on seed 2026 fielded a tick
raider ("One of them is coming for YOU — tick, inside the haven") — the r3
tick-as-haven-raider roster question, still the raids lever's, not chased.

## Village assessment (plain words)

Villages still live ~2 months and die of violence and hunger: 29 combat + 17
starvation vs 0 disease player-deaths across 12 runs. Sickness is a tax
(wound_fever is the workhorse: 14 cases), not the reaper — Steve's "must be
feared" lands in the *outbreak* moments (r3's village-wiping fever) more than
in the death shares, and r1's lockjaw certainty still kills the undiagnosed.
What's new this run is that the alien pool finally has a *player* story, not
just a victim story: a seeker can walk up to the tick on purpose, take the
latch, and walk away changed — ringed rashes at every joint, drinking deeper
from every meal for the rest of their life. Who thrives: the infected who
survive the next fight — the warping is a passenger, combat is the gate. Who
dies: the same as ever — the outmatched, the starving, the wounded who keep
fighting. The village doesn't fear the seeker's warping; it tends the
feverish and cheers the tick-killers, and the record now remembers both.

Knowledge missing: the quirk-hunting half (filed for r5). Nothing else
structural — the map was always there; what was missing was a player.

## Run-wide measures

- Win rate: 0/12. Four-realm formation: 0/12 (no national reach).
- Arc reach: I 12/12, II 12/12, III 12/12, IV 0/12.
- Wave reach: w1 6/6, w2 6/6, w3 6/6; w4/w5 0/12 (both policies).
- Median/max survival: competent 77/135d, seeker 65/135d.
- Death-cause shares (players): competent combat 15 starvation 9; seeker
  combat 14 starvation 8. (Villagers): competent combat 23 wound 4
  starvation 2 other 2 contest 2 murder 1; seeker combat 26 wound 4
  starvation 2 other 1 contest 2 murder 1.
- Disease-specific: cases competent 11 mundane/0 alien; seeker 7 mundane/
  2 alien (lemons, eurika). Cures 0. Vector fights 3 (tick 2, mosquito 1),
  lost all 3 by both policies (the vectors' damage is the price of the
  encounter, win or lose). Engorge firings 43 (seeker). eurika-sense 0,
  crow warnings 0, blood-sense 0, gristlefit 0.
- Trap acquisition by source / young-link succession survival / tier-2
  reach: not this sweep's instrumentation (noted, not faked — same gap as
  r3). Counter discovery observed in transcript (tick + mosquito counters
  learned, codex entries written).
- The table / win flag: unreached in 200d sim horizons (consistent with all
  prior disease-lever runs).

## Tooling

- `scripts/policies/seeker.js` (new) — the seeker policy (+ unit-tested
  helpers `pureVectorFight`, `missingViruses`).
- `scripts/test-disease-r4-20261012.js` (new) — 32 assertions, ALL GREEN:
  seeker claims pure vector fights where competent flees; still retreats
  <35% HP; walks into the tick; stands for the drink; kills post-drink;
  stops seeking when warping held; quirk meat taken first, human meat never;
  mosquitoBiteVirus applies; lemons engorge fires on eat; pool separation
  (eurika not pill-curable).
- `scripts/sense-disease-r4-20261012.js` (new) — S1/S2 transcripts.
- `scripts/sweep-disease-lever.js` — seeker registered; ability-firing
  counters; seeker ctx stats.
- `evidence/2026-10-12/sim-disease-r4-sweep.json` (new) — raw 12-run data.

## Regressions

- `scripts/test-disease-r3-20261011.js`: ALL GREEN (31 assertions).
- `scripts/test-disease-curepath-20261011.js`: ALL GREEN (39/39).
- `scripts/test-disease-break-r14-20261011.js`: 66/66 × 3 seeds (7, 999, 4242).
- `scripts/validate-ontology.js`: 84/84, release permitted.

## Blanks filled vs documented

Filled: (1) **the seeker angle** — the biggest untested canon claim: alien
viruses acquired by deliberate play (lemons + eurika), abilities firing
(engorge 43×), bargain measured; (2) policy + sweep tooling for all future
seeker measurements.
Documented: east_nile still 0 cases (sample size, machinery verified);
eurika-sense/crow warnings 0 firings (need ambush events); quirk-meat half
unmeasured (no quirk-carrier kills in 12 runs — needs a hunter variant, r5);
tick-as-haven-raider roster question (raids lever); tick-enrage flavor nit
(still open from r3); trap/counter/young-link/tier-2 instrumentation gaps.
