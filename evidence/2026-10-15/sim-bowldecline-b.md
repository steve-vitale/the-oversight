# sim-bowldecline-b — bowl-decline policy layer (loop B, food-economy axis)

Run: fleshout-b-2026-10-15T155859Z | worker branch: sim-bowldecline-b | date: 2026-10-15
Finding: #340 (HALF-APPLIED R8: THE MEAL-DRIP STILL ARMS THE TRUST BAR AND JUSTICE HEAT)
Canon read: docs/CANON.md ("No silent actions"; "Trust ≠ reputation"), docs/PRESERVATION.md.

## Pre-registered (docs/MEASUREMENT.md §§9–12, 14 — binding)

- Design: 8 seeds (11/22/33/44/55/66/77/88) × {leadcourt, belongseek} ×
  {control, armed (BOWLDECLINE=1)}, 180d death-aware, identical-seed
  before/after, own control in the same sweep. Trust metrics via
  TRUSTCENSUS=1 instrument; wall numbers via stdSnapshot.
- PRIMARY: mean(armedCrossDay − controlCrossDay) ≥ +7d, where crossDay is
  the first day the CUMULATIVE −5000 trust-drop bar trips (game.js
  takeFromPantry) and a non-crossing run counts its end day. Pooled over all
  16 pairs; GO additionally requires no policy with a negative mean delay.
- CO-PRIMARY: mean hunger-days (STARVING nights) armed ≤ 1.0× control (pooled).
- GUARDRAILS (binding): starvation deaths armed ≤ control+2; median survival
  armed ≥ control−10d; national reach armed ≥ control−2; no new death mode;
  SOCIAL: decline beats must not read as insult or antisocial coldness.
- Lever: scripts/policies/bowldecline.js — when the village offers a
  communal bowl AND the pack holds ≥1 full packed meal (≥500 kcal edible,
  unspoiled), decline the bowl honestly and out loud, eat from the pack via
  Game.eat(). Zero src/js. Gate BOWLDECLINE=1, default OFF.

## Mechanism proof (scripts/test-bowldecline-20261015.js) — ALL GREEN

- (a) Decline path honest in the engine: bowl declined → no v.takes write,
  pantry untouched, packed meal eaten via Game.eat() (kcal rose), decline
  narrated (3 rotating variants), v.lastPlayerMeal = 0, decline telemetry
  recorded on Game._bowlDeclines.
- (b) REAL RED on pristine base: unlayered meal draws and writes v.takes
  (the bar the arm attacks exists); gate-off layer leaves villageMeal
  untouched.
- (c) det-gate: BOWLDECLINE=0 layered run byte-identical to unlayered (30d,
  seed 11; Game.state JSON identical after stripping the decision-free
  wall-clock pacing.lastTs subtree — the harness freezes Date.now() but
  pacing uses performance.now(); verified the same-policy-twice baseline
  also differs only there).

## Pilot results — KILLED AT PILOT (NO-GO)

Driver: scripts/run-bowldecline-20261015.js. Raw: evidence/2026-10-15/bowldecline-pilot.json + .log.
32 runs (16 pairs), 180d death-aware. Mean declines on armed: 44.2/run (~25% of nights; range 1–125).

| metric | control | armed | pre-registered bar | verdict |
|---|---|---|---|---|
| PRIMARY: mean crossDay delay | — | +1.9d | ≥ +7d | MISS |
| delay by policy (leadcourt / belongseek) | — | +1.9 / +1.9 | ≥ 0 each | pass (weak) |
| pairs with any delay | — | 4/16 (s22 +10, s77 +5, both policies) | — | — |
| CO-PRIMARY: hunger-days ratio | 1.00 | 0.88 | ≤ 1.0 | PASS (pooled; high per-seed variance) |
| starvation deaths | 2 | 7 | ≤ control+2 (=4) | FAIL |
| new death modes | — | player:starvation (+7 villager/contest/combat modes) | none | FAIL |
| median survival | 162d | 180d | ≥ control−10 | PASS |
| national reach | 12/16 | 11/16 | ≥ control−2 | PASS |
| table / wins | 0 / 0 | 0 / 0 | — | — |
| max wave / max arc | 4 / 3 | 4 / 3 | — | identical |

Delay pairs (armed−control crossDay): 12 of 16 pairs show exactly 0 — the
bar trips day 4 on both arms. The 4 delayed pairs are seeds 22 (+10) and 77
(+5), identical on both policies (early-game play is identical pre-day-20,
so the RNG-stream perturbation lands the same way — instrument working as
designed, not a bug).

The mechanism works (meal share of cumulative takes 0.86 → 0.64) but the
day-4 crossing is OVERDETERMINED: 4 days × ~2000 kcal bowls ≈ 8000 kcal >
5000 no matter what. Even the heaviest decliner (leadcourt+bowl s88: 118
declines/180d) still crosses day 4. To delay the crossing 7 days the scholar
would need to decline ~11 straight bowls and cover ~22,000 kcal from the
pack — impossible without starvation, which is exactly what the guardrail
caught: the bowl is ~2000 kcal/day of free pantry calories, and replacing
it with pack food the bot doesn't forage extra for starves the scholar
(belongseek+bowl s11: 95 hunger-days, scholar starved; village survived via
young-link succession) and cascades into village-collapse starvation on
brutal seeds (s33: armed villages died 38/52d vs control 95/174d).

## Sense-test (social guardrail) — PASS

Decline beats read as a person eating their own packed lunch, generous
framing throughout, never rejection:

- "The communal bowl comes around at the haven fire. You pass it along — you packed plenty today; someone else should have this."
- "You wave it off — your pack is full, and hungrier mouths should eat first."
- "Not tonight — your own food is going stale first, and waste would be the real insult."
- "You eat Dried meat and Trail mix (1400 kcal). / You eat your own packed food instead (+1,400 kcal from your pack). The pantry keeps its food. / You still take your 1L water from the cistern."

The scholar still lingers at the fire (same 50% +2 bond roll as the
communal meal). No villager line in the crossing-day windows reads the
decline as insult — there is no engine gossip event for declining, and none
is needed: the fiction is "ate my own lunch with everyone," not "refused
their food."

## Village assessment (plain words)

The villages looked the same on both arms — the decline changes where the
scholar's calories come from, not how the village lives. Declining scholars
ate Dried meat, Trail mix, Burdock from their packs at the fire while the
pantry kept roughly a third more of what the scholar would have drawn. On
kind seeds (s88, s44) heavy decliners thrived to 180d and reached national;
on brutal seeds (s33) the villages collapsed early on both arms, faster on
armed. The standout story: belongseek+bowl s11, where the scholar slowly
starved over 95 hungry nights declining bowls they couldn't cover — and the
village carried on without them through young-link succession (end=survived,
180d). The ledger outlived the bearer. Nobody who needed the bowl went
without because of a decline — the pantry kept the food — but the scholar
sometimes went without because of their own pride.

## Blanks filled / filed

- FILLED (measurement): the policy-side attack on #340 is now measured —
  it cannot move the bar. Filed as sim-findings #341 (below): the day-4
  crossing is behaviorally unfixable, which is evidence FOR the #340
  steve-call's ledger-side fix (bars reading the dated voluntary ledger).
- DOCUMENTED: young-link succession survival observed in the wild
  (belongseek+bowl s11: scholar starved, village survived 180d via
  succession, ledger zeroed for the new bearer per ledger.js:841-844).
- The layer is DELETED per kill protocol (scripts/policies/bowldecline.js
  removed; proof + driver + evidence retained as the measurement record —
  re-running them requires restoring the layer from git history).

## Metric review (§14)

- The PRIMARY's +7d bar was honest and the miss is real — but in hindsight
  the bar was unreachable by construction (see overdetermination above). A
  future behavioral arm against this bar should pre-register against the
  TR7 (trailing-7d) crossing instead, where declines can actually move the
  number — or attack the ledger composition directly (game-code side).
- The hunger-days co-primary passed pooled (0.88) while starvation DEATHS
  failed — hunger-days and starvation deaths measure different things
  (chronic under-eating vs terminal cascades). Both guardrails were needed;
  keep both.
- The "no new death mode" guardrail caught player:starvation — exactly the
  failure mode the co-primary's pooled pass hid. The guardrail set worked as
  designed.

## Convergence state

killed-at-pilot. Food-economy axis: the bowl-decline lever is dead; the
#340 steve-call (ledger-side fix) is now the live option, with this run as
supporting evidence.
