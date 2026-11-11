# Feast / tribute — first numbers (arm sim-feastfirst-a)

Run fleshout-20261111T0646Z, Loop A. Coverage Program Tier 2 (Steve order
2026-11-10 11:11 CST "Measure all"). Prereg:
evidence/2026-11-10/sim-feastfirst-a-prereg.md (committed 64c15d5a5 BEFORE
any judged sim). Instrument + driver + analyzer + proof committed
8a2530482 (proof 53/53). Base commit b7fe9c03d. No src/js change.

Corpus: evidence/2026-11-10/perseed-feastfirst-a/ (16 files: 8 control +
8 neutral). Summary: evidence/2026-11-10/feastfirst-summary-feastfirst-pilot.json.
Analyzer: scripts/feastfirst-analyze-20261110.js.

## Verdict: GO

GO (instrument validity + complete capture — a GO makes NO landing claim
and spends NO confirm band; there is no lever here to land):

| GO check | Result |
|---|---|
| Every feast/tribute event classified by verb + caller, none 'other' | PASS — 0 unclassified events across the pilot |
| Every wrapped method's call path verified live or marked dead | PASS — hostFeast / feastPlan / grantFeastBuff / draw / face / channel / tele / pantryDraw / _removePantryKcal / stockPantry live in the pilot (on the 3 feasting seeds); payTribute / answerSystemFavor / villageDeal / answerNationalChoice / answerGlobalChoice / feastBundleBuyOut proven live in fixtures (test-feastfirst-a.js B20–B24, B29–B30) and 0 in the pilot — measured zeros, marked dead under competent |
| Neutrality: OFF leg matches instrumented leg | PASS — days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | PASS — 0 on all seeds, all legs |
| Complete first-numbers capture | PASS — per-seed tables for metrics 1–8 below; sense-test scenes quoted from a feast-only replay probe on seed 180271 |

## Headline numbers (8 seeds, 150d, competent, band 180265–180272)

| Seed | Days | End | Feasts | Spent kcal | Granted | Surge uses | Draws faced | Bundle max | Channels | Pellet passes | Deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 180265 | 143 | village-lost | 0 | 0 | 0 | 0 | 0 | 0/6 | 136 | 0 | 76 |
| 180266 | 147 | village-lost | 0 | 0 | 0 | 0 | 0 | 0/6 | 144 | 0 | 89 |
| 180267 | 94 | village-lost | 1 | 1,530 | 1 | 6 | 1 | 4/6 | 91 | 0 | 73 |
| 180268 | 104 | village-lost | 4 | 7,110 | 3 | 33 | 3 | 4/6 | 106 | 2 | 88 |
| 180269 | 144 | village-lost | 0 | 0 | 0 | 0 | 0 | 0/6 | 154 | 1 | 82 |
| 180270 | 150 | survived | 0 | 0 | 0 | 0 | 0 | 0/6 | 144 | 1 | 99 |
| 180271 | 150 | survived | 7 | 12,150 | 5 | 42 | 5 | 4/6 | 150 | 1 | 104 |
| 180272 | 148 | village-lost | 0 | 0 | 0 | 0 | 0 | 0/6 | 138 | 0 | 92 |
| **Pooled** | **median 147** | **6 lost / 2 survived** | **12** | **20,790** | **9/12** | **81** | **9/9** | **max 4/6, 0 complete** | **1,063** | **5** | **703** |

Wall numbers: national 0/8, table 0/8, wins 0/8, wave 4 unlocked 8/8,
wave 5 unlocked 0/8, regional 8/8, median survival 147d (94–150),
deaths 703. Standing (gated) 199 on all 8 seeds — see §8.

## 1. Feasts held — 12 feasts on 3 of 8 villages

Five villages never feast once in 143–150 days. The three that do feast
feast rarely and late-ish: first feasts on days 66 (267), 19 (268),
27 (271); last feasts days 66, 103, 132. Quality: 11 fine, 1 thin,
0 legendary. Every feast was armed (11/12 surge 1.5; the one unarmed
feast is 268 d19 — see §4). Feasts shrink with the village: 271's
feasts feed 1–4 guests (roster collapsing under 104 deaths); the
cheapest feast cost 1,530 kcal, the dearest 2,050 kcal.

Feast detail (feasting seeds):

| Seed | Day | Quality | Spent | Showed/invited | Surge | Granted | Mult | Draw | Bundle |
|---|---|---|---|---|---|---|---|---|---|
| 180267 | 66 | fine | 1,530 | — | 1.5 | yes | — | audit | 4/6 |
| 180268 | 19 | fine | 1,800 | — | 0 | NO (devotion gate) | — | — | 3/6 |
| 180268 | 26 | fine | 2,010 | — | 1.5 | yes | — | mirror_stag | 4/6 |
| 180268 | 96 | fine | 1,600 | — | 1.5 | yes | — | strike | 3/6 |
| 180268 | 103 | fine | 1,700 | — | 1.5 | yes | — | buffering | 3/6 |
| 180271 | 27 | fine | 1,600 | 2/2 | 1.5 | yes | 2.03 | union_rep | 3/6 |
| 180271 | 35 | fine | 1,600 | 1/1 | 1.5 | yes | 2.03 | focus_group | 4/6 |
| 180271 | 44 | fine | 1,600 | 1/1 | 1.5 | yes | 2.03 | eater | 3/6 |
| 180271 | 60 | fine | 2,000 | 4/4 | 1.5 | yes | 2.53 | audit | 4/6 |
| 180271 | 91 | fine | 1,760 | 3/3 | 1.5 | yes | 2.53 | eater | 4/6 |
| 180271 | 112 | thin | 1,540 | 1/1 | 1.5 | NO (reactor ceiling) | — | — | 4/6 |
| 180271 | 132 | fine | 2,050 | 4/4 | 1.5 | NO (reactor ceiling) | — | — | 3/6 |

## 2. Why five villages never feast — the gives gate, not the pantry

On the five never-feast seeds, `feastPlan` was called **0 times** in
143–150 days: `eveningFeast` never reached the plan at all. `feastPlan`
refusals are therefore 0 across the pilot — not because the plan never
refuses, but because the policy pre-filters before calling it. The
binding gates are the policy's own, upstream of the engine:

- **Recent gives (the discriminator).** `eveningFeast` requires the
  scholar to have given ≥1,500 kcal to the pantry in the last 7 days.
  Gates probes (40d, same harness): seed 180265 (never feasts) — gives
  **0** by day 40, pantry 17,856 kcal; seed 180271 (feasts) — gives
  **12,360** by day 40, pantry 34,104 kcal, feasts on days 27 and 35.
  The feast is hostage to whether the scholar ever donates, and the
  competent scholar's donation behavior varies wildly by seed.
- **Dusk timing.** The policy's `daily()` runs at dusk (dayPart 2) on
  only ~1/8 days (5/40 on 265, 6/40 on 271); the rest of the time it
  runs at part 3, when `eveningFeast` returns before doing anything.
  Whenever it did run at dusk, the scholar was at Haven (5/5, 6/6).
- **Buffer / cadence.** Never observed binding: every plan in the pilot
  was ok (24/24), and every ok-plan day produced a feast the same day
  (the 24 plans are 12 policy calls + 12 internal calls from
  `hostFeast` itself). No plan was refused for pantry-short, exile,
  not-at-haven, or one-a-day.

In plain words: the feast is not gated by hunger or by the pantry —
villages that never feast have full pantries. It is gated by the
scholar's giving habit and by the accident of which day-part the
daily driver runs at.

## 3. The bundle deed — never completes (max 4 of 6)

No bundle completed on any seed; no buy-out (8,000 kcal) was ever
attempted — the policy never calls `feastBundleBuyOut`. Ladder
bundleBonus 0 on all 8 seeds; the `feast_embassy` capstone (needs a
completed bundle at ladder stage 3) is unreachable on this band even
though 7/8 seeds reach ladder stage 3.

Contributions served across the 12 feasts (of 12 possible):

| Contribution | Feasts |
|---|---|
| guest of honor | 12 |
| kept recipe | 12 |
| keepsake channel | 11 |
| monster meat | 4 |
| garden harvest | 2 |
| foraged feast | 1 |
| crafted centrepiece, hunted meat, cooked meat, preserved food, medicine brewed, explorer's rare | 0 |

The three state-fact slots (guest of honor, kept recipe, keepsake
channel) fill nearly every feast for free. The served-item slots almost
never fill: the pantry serves what it has — mostly foraged food and
unidentified flesh — and a competent pantry never assembles pemmican,
cooked/smoked meat, preserved food, a rare plant, or a brewed medicine
for the table. The bundle needs a deliberately stocked table; the
driver never stocks one.

## 4. Feast surge / buff — when it fires, it pays

- Grants: 9/12 granted (mult 2.03 early, 2.53 once Arc IV burns
  hotter), 0 refreshes. Refusals: 1 devotion-gate (268 d19 — the feast
  fired the same day the devotion armed, before the arming landed),
  2 reactor-ceiling (271 d112/d132 — the scholar held the fusion
  reactor; the feasts still fed people and counted toward standing,
  the buff alone was refused).
- Combat uses: 81 `noteFeastedCombatUse` marks across the 9 granted
  buffs — the buff is spent in real fights, not left to expire
  (271's d27 buff: 7 feasted blows logged in one fight).
- Draws: 9 drawn (audit ×2, eater ×2, mirror_stag, strike, buffering,
  union_rep, focus_group), **all 9 faced** via `faceFeastDraw`,
  0 driven off. Draw-fight outcomes (won/lost) were not captured —
  faced ≠ won; see Metric review.

## 5. Devotion lane — arms everywhere, feasts rarely follow

`channelSentiment` fired **1,063 times** across the 8 seeds
(91–154/seed). The devotion armed (prog.feastSurge set) on all 8
seeds, on days 16–27; surgeResonance peaks 118–361 (the gate is 35).
The arming is early and easy; the feast that would spend it is the
rare event. On the five never-feast seeds the armed surge (×1.5–×3.0
by the channeling lines) sits unused for the whole run — devotion
without a feast is a loaded weapon nobody fires.

## 6. Tribute — zero by every verb, in both directions

| Verb | Calls (8 seeds) |
|---|---|
| payTribute | 0 |
| answerSystemFavor | 0 (0 System favor demands raised) |
| villageDeal 'tribute' | 0 |
| answerNationalChoice 'feast' | 0 |
| answerGlobalChoice 'feast' | 0 |

Why: each village forms exactly one link, and Haven is the **primary**
in it (subordinate village_0, 4,000 kcal/week owed TO Haven, trust 30
at birth). Haven owes nothing, so `payTribute` has no target — its
only caller is the app.js Haven button, which the policy never
presses. The subordinate's payments are abstracted (trust-weighted,
no pantry flow into Haven). Link tribute ledgers: tributePaidKcal 0,
arrears 0 on every seed. The System never demanded its 1,500 kcal
favor in 150 days.

Pantry outflows that LOOK like tribute but aren't (29,592 kcal total
via `_removePantryKcal`): unanswered raids at the treeline — 800 kcal
each, 25× ("they hit the stores and melted back into the dark") — and
answered aid begs — 1,325–1,982 kcal each, 4×. Both are aid/raid, not
tribute; the tribute verbs never move food.

## 7. Pellet — 5 passes; the release valve works, the feast doesn't always follow

- 5 pellet passes (268 ×2, 269 ×1, 270 ×1, 271 ×1), 461 pellet-holder
  days, 84 reactor-online days, 105 hungry-days (hunger > 70 present),
  max 4 hungry villagers at once.
- Seed 271 timeline: holder null until day 102, when the scholar
  (chen_wei) installs the reactor — online days 102–136 (35 days).
  Days 112/132 feasts are refused the buff (reactor ceiling). Day 136
  the pellet passes to visjoin_99 (a villager) when the village
  hungers; day 147 the mantle passes to visjoin_99 as the new scholar.
- Seed 265: reactor online 28 days, max 1 hungry villager — the pass
  never needs to fire. Seed 272: 28 hungry days, but the reactor was
  online only 1 day — nothing to pass (holder null most of the run).
- 2 feasts were held while a reactor was online (271 d112/d132) — both
  refused the buff but still counted as feasts.
- The d136 pass line promises "The table can hear a feast again" — but
  no feast followed in the remaining 14 days (cadence 7d, one guest
  left, village dying). The promise is voiced; the feast is not
  delivered in the window.

## 8. Feast's share of standing + the wall

Feast plenty (20 × major feasts, quality ≥ 1): 0, 0, 20, 80, 0, 0, 120,
0 per seed — 220 pooled. But the gated standing total is **199 on all
8 seeds**: that is the wave-5 readiness-deferral hold (t5 − 1,
standing.js `villageStandingTotal`), not a feast shortage. Feasts feed
the raw total; the wall at wave 5 is combat readiness, which no seed
met in 150 days (standing199-a, same band shape, shows the deferral
opening on the second veteran's arrival — no seed here got there).

Wall numbers: national 0/8, table 0/8, wins 0/8, wave 4 8/8, wave 5
0/8, regional 8/8, median survival 147d, deaths 703 (73–104/seed),
6 village-lost / 2 survived. Ladder stage 3 on 7/8 seeds (267 died
day 94 at stage 1) while scale rank stays regional — ladder stage and
scale rank are different systems.

## Sense-test — do feasts read like a village celebrating?

Quoted from a feast-only replay probe on seed 180271 (same seed,
deterministic; the pilot's 200-line say cap filled by ~day 27 with
channeling lines, so no feast lines survived in the pilot corpus —
see Metric review).

First feast, d27 — it reads like a celebration:

> 🍖 FEAST 📺 — Scarlett opens the pantry wide: 7× Foraged food, 1×
> Foraged food. Carmela, Onni eat until the fire burns low. Somebody
> laughs so hard they cry. For one evening, nobody is surviving —
> they're just together. (−1,600 kcal from the pantry)

The draw arrives in the same breath, and the village faces it:

> 🌙 The cookfire's smell carried further than the laughter did — smoke
> and grease on the night wind. The Union Rep is circling the edge of
> the light. It followed the feast here.

The thin feast at the end of a dying village, d112 — the register
bends to match, and it is the truest line in the corpus:

> 🍖 FEAST 📺 — Wei opens the pantry wide: 11× Muscadine Grapes, 5×
> Burdock, 1× Foraged food. Onni eat until the fire burns low. Nobody
> talks much. It isn't plenty — but it's warm, and everybody's here.

And d132, winter, four people left:

> Nobody says what this cost — everybody knows, and winter is
> listening. For one evening, the pantry is lighter and the people are
> not.

Verdict: **yes, feasts read like a village celebrating** — named hosts
(who change as the mantle passes: Scarlett → Enrique → Sonny → Wei),
real menus, and emotional registers that match the village's state
(harvest laughter, thin-table quiet, lean winter). Two robotic notes:
(1) the FEASTED combat lines repeat byte-identical per blow
("Carmela's blow carries the feast." ×7 in the d27 fight; "the feast
was the weapon." alternating with it); (2) the menu names unidentified
meat "Unknown flesh" (honest, but the feast serves meat nobody has
identified — the bundle's monster-meat slot wants it tested and
cooked). The keepsake-channeling lines are lovely and varied (Photo
album, Wedding ring, Daughter's Drawing, Dead Phone) and all end on
the same true sentence: "The feast was the weapon."

## The village, assessed

Three villages in eight ever light the fire, and when they do it is
the best thing in the run: an armed surge, a monster drawn to the
light, the village facing it together while feasted. The other five
villages eat from a full pantry for 150 days and never once sit down
together — not because they are starving, but because the scholar
never gives first and the driver rarely comes home at dusk. The
devotion lane arms on every seed by day 27 and then waits, sometimes
forever, for a feast that never comes. The bundle — the Standing
ladder's feast deed — is a table nobody sets: three of its six slots
fill themselves, and the other three need a pantry the driver never
builds. Tribute is a word nobody says: Haven is owed, never owing,
and the System never comes to collect. The pellet passes when it
must, and the table hears the promise — but on this band the feast
after the pass never arrives. The wall is not the feast: every village
sits at 199, one point short of wave 5, held by fighting strength,
not by bread.

## Metric review (§14)

- **standingPlenty derivation.** The driver's `standing` field is the
  gated number (a plain 199), not the `{total, war, diplomacy,
  plenty}` breakdown — `villageStandingTotal()` returns a number.
  Plenty is derived from the feast log (20 × major feasts) instead;
  the analyzer was fixed and the summary regenerated (same corpus).
- **Deposit caller attribution is unmeasured.** Every `stockPantry`
  deposit records caller `'w'` (a minified engine frame) — the
  deposits-by-name totals stand, but which verb deposited them cannot
  be attributed from this instrument. The gives-gate finding rests on
  the gates probes (direct `state.village.gives` reads), not on
  deposits.
- **Draw-fight outcomes unmeasured.** `faceFeastDraw` records the
  facing, not the win/loss. The next arm that wants draw outcomes
  should join `waveKillLog` (or the fight result) to the draw record.
- **Say-cap caveat (same as the siblings).** The 200-line-per-seed say
  cap filled by ~day 27 with channeling lines, so no feast say-line
  survived in the pilot corpus. Recovered by a feast-only replay probe
  on seed 180271 (same seed, deterministic replay, no judged
  re-run). Future arms should filter say lines by verb instead of
  capping globally.
- **Non-fire analysis is vacuous by construction.** `feastPlan`
  refusals are 0 because the policy only calls the plan after its own
  gates pass. The binding gates (gives, dusk timing) live in the
  policy, not the engine — the gates probes, not the plan records,
  are the evidence for them.
- **Metric set held.** No metric needs revision for the next run; the
  draw-outcome and say-filter gaps above are additions, not
  corrections.

## Balanced panel (§15)

Attempted and recorded honestly: measurement arm, no lever change, no
before/after arms — no panel comparison to fabricate (same position
as sim-fishstaff-b). The control/neutral legs are the neutrality
proof, not a panel.

## Neutrality proof (8/8 exact)

| Seed | Control days / pantry / deaths | Neutral days / pantry / deaths |
|---|---|---|
| 180265 | 143 / 0 / 76 | 143 / 0 / 76 |
| 180266 | 147 / 0 / 89 | 147 / 0 / 89 |
| 180267 | 94 / 0 / 73 | 94 / 0 / 73 |
| 180268 | 104 / 3,250 / 88 | 104 / 3,250 / 88 |
| 180269 | 144 / 0 / 82 | 144 / 0 / 82 |
| 180270 | 150 / 10,652 / 99 | 150 / 10,652 / 99 |
| 180271 | 150 / 0 / 104 | 150 / 0 / 104 |
| 180272 | 148 / 0 / 92 | 148 / 0 / 92 |

Instrument errors 0 on all 16 runs.

## Notes for the coordinator

- **BAND SHARING (recorded 2026-11-11, after the pilot):** the sibling
  trade arm (sim-tradefirst-a) independently shifted its band to
  180265–180272 — the same 8 seeds (its prereg lines 213–227: it found
  seed 180259 named in the travelfirst prereg and took a strict
  freshness reading, moving off its assigned 180257–180264). This arm's
  judged sims were already run and committed (16 runs, d25637f4e)
  before the collision was noticed, so per the coordinator's
  instruction the band is KEPT and NOT re-run. Shared band, not
  contamination: same seeds, different instrument (feast/tribute wraps
  vs trade wraps), different system measured, independent measurement;
  both instruments are record-only, and neutrality is 8/8 exact on
  this arm. A later reader comparing the two arms' per-seed files
  should expect identical days / end pantry kcal / deaths per seed
  and different system counts. Also recorded in the prereg.
- One runtime restart interrupted the control leg after seed 180267;
  the driver was resumed for seeds 180268–180272 only (the driver
  refuses to overwrite per-seed files, so the first three files are
  untouched originals). No seed was re-run.
- The analyzer was fixed after the pilot (standingPlenty derived from
  the feast log; the driver's standing is a gated number) and the
  summary regenerated from the same corpus — no sim was re-run.
- No src/js change. Nothing to land. Proof test 53/53
  (scripts/test-feastfirst-a.js). Files: scripts/feastfirst-instrument-20261110.js,
  scripts/feastfirst-driver-20261110.js,
  scripts/feastfirst-analyze-20261110.js, scripts/test-feastfirst-a.js.
