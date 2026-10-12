# Long-run sim — food economy ROUND 4: the surplus at scale (2026-10-12)

Lever 0: **food economy** — round 4. Territory: the FOOD SURPLUS ECONOMY AT
SCALE. Follows sim-food.md (r1: smoke technique), sim-food-feastburn.md
(feast→damage chain, racks cap), sim-food-r2.md (granary famine auto-draw,
scale ledger, competentEat), sim-winpath-r3.md (feast-surge 2-dawn window;
its upstream-block #1 — "the village eats ~6k/day; the pantry swings 0→34k.
Feasts need a 1.5× buffer the starving village can't spare" — is this run's
territory).

## Baseline measurement (current master, 12 seeds × scalecourt × 200d)

- Median survival **80d**, max 125d. All village-lost. Ranks: 7 village, 5 regional, **0 national**.
- Pantry swings **33k–116k → 0** on every seed (confirmed the 0→34k band and worse).
- Spoilage **5,126 kcal/run-day**; cook preserves 756/day (13% of rot — the racks cap binds, by design).
- Coalition food layers: tribute-in **14.7k received vs ~48k owed (31%)** on the one primary run (seed 222); arrears 13.6k, trust 42→0. League pool **0 in 12/12** (national-gated by canon — break-it regional r4). Aid offers/begs appear (seed 22: 7 offers; seed 77: 6 begs) but the competent policy answers **0**.
- Deaths overwhelmingly combat (seed 77: 40+ combat, 1 starvation). The pantry crash follows roster collapse, not the reverse.

## The five open questions, measured

1. **Feeder-village tribute flows**: 31% paid; peers run hand-to-mouth by design (turf+ranging covers 60–100% of need; pantry capped at 4 days). Arrears→trust is the honest story of a struggling subordinate, not a bug. NOT a blank.
2. **League pool as two-way instrument**: pours weekly (national covenant only), draws in famine (r2). National-gated by canon. 0/12 in sims because sims don't reach national. NOT a blank.
3. **Tier storage at scale**: tier-3 granary = 5 famine days (famineGraceDays), narrated. Coherent. NOT a blank.
4. **Feast 1.5× buffer**: policy gate (feastseek/winseek), correct — feasting into famine is wrong. Winpath-r3 showed the chain's bind is luck-gated uses, not the buffer. NOT a blank.
5. **Pantry swing smoothing**: the swing is real (33k–116k→0) but driven by roster collapse (combat), not food tuning. The glut rots by design (racks cap stops preserved-rot); smoothing the swing with food numbers would fight the combat bind. NOT a lever-0 blank.

## The blank: the fire network's pipes were shut (policy)

The aid instrument (safetynets.js) is the coalition's ONLY non-national-gated
food layer and it works end-to-end — offer → accept → inbound delivery →
pantry +2,500; beg → give → their pantry +1,500, trust +4, aidCredit. Proof
`scripts/test-aid-pipes-20261012.js`: **game chain 9/9 sound**. But NO
competent-derived policy ever answered offers/begs — every loop's sims
measured a coalition food economy with the pipes shut. On seed 22, 7 offers
(~19k kcal) went unanswered; on seed 77, 6 begs from starving neighbors went
unanswered while Haven sat on 82k.

**The lever (policy, round-2 precedent)**: `answerAidBeats` in
`scripts/policies/competent.js` — accept aid offers (they only fire when
Haven struggles; no cost to yes); give to begs when the pantry carries it
(3× the ask, 1.5× for a creditor — refusing a creditor costs double trust).
Env-gated (`COMPETENT_AID=0`) for identical-seed before/after.

## Before/after (identical seeds × 200d, COMPETENT_AID=0 vs 1)

**12-seed aid diagnostic** (`scripts/diag-aid-flows-20261012.js`):

| metric | before | after |
|---|---|---|
| offers seen / answered | 2 / 0 | 9 / 9 |
| begs seen / answered | 3 / 0 | 11 / 11 |
| inbound aid deliveries | 0 | 9 (21,742 kcal) |
| given to begs | 0 kcal | 10,697 kcal |
| median / max survival | 80d / 125d | 80d / 125d |
| ranks | 7 village, 5 regional | 7 village, 5 regional |

**24-seed scale ledger** (`scripts/sweep-scale-food-20261011.js`, scalecourt):

| metric | before | after |
|---|---|---|
| median / max survival | 78d / 135d | 78d / 126d |
| ranks | 21 village, 3 regional | 21 village, 3 regional |
| spoilage | 4,873 kcal/run-day | 4,906 kcal/run-day |
| tribute-in / tribute-out | 14,676 / 5,180 | 21,560 / 0 (RNG divergence) |
| league pool pour / draws | 0 / 0 | 0 / 0 |
| empty-pantry days | 62 | 53 |

**12-seed completion** (`scripts/sweep-completion.js`, competent): wins
0→0, maxWave 3→3, feastSurgeUsed 0→0, table 0→0, median 77d→77d.

**Verdict**: the pipes are open and moving real food (21.7k in, 10.7k out),
but the aid is a trickle (~23 kcal/day in) against 5k/day of rot and a
combat-driven roster collapse. The policy fix is correct competent play —
a real player answers the fire network — but it is not the lever that moves
the mid-game wall. The wall's food component is roster→production collapse
(combat bind), not distribution.

## Proof tests

- `scripts/test-aid-pipes-20261012.js`: **11/11** (9 game-chain + 2 policy).
- Regressions: policy-only change (no src/ touched — ontology unaffected);
  sweep-completion before/after identical (no breakage); competent syntax
  verified via node --check after the lootCorpses-header repair.

## Sense-testing (transcripts read)

- Aid beats are voiced and human: "Thornfield is eating bark and calling it
  dinner. We left before we started looking at each other like food."
  / "Tomás waits two days at your fire, getting thinner. Nobody answers.
  They walk back with nothing. They'll remember the silence."
- Teaching lines repeat the "remember it / Word gets around" template
  across villagers — knowledge lever's territory, noted not fixed.

## Village assessment (plain words)

The village is a hungry place that throws away dinner. It grows and catches
2–3× what it eats, and 5,000 kcal a day rots in the pantry while the cook
works the racks as fast as honest shelves allow. When the roster dies in the
treeline — and it does, forty dead on a bad seed, combat not hunger — the
fields go quiet, the pantry breathes out from 100k to nothing, and the last
souls eat scraps until the fire goes out. The coalition's food never mattered:
tribute is a promise the starving can't keep (31¢ on the dollar, the books
honest about it), the league's granary is a national dream the village never
lives to see, and the fire network — the one pipe that actually carries food
between fires — sat silent because no competent player ever answered it.
Now they do. Nineteen thousand kcal walked in on pack-mules on one seed;
eleven thousand walked out to beggars on another. It is real food, honestly
counted, and it changes nothing about the dying. The village doesn't starve
for lack of sharing. It starves because the hands that grew the food are
dead in the treeline.

## Blanks: filled / documented

- FILLED (policy): competent answers the fire network — the coalition food
  pipes open in measurement. Proof 11/11.
- DOCUMENTED: tribute 31%, pool national-only, tier-3 grace, feast 1.5×,
  pantry swing — all measured coherent, not blank. The mid-game wall's food
  component is the roster→production collapse (combat bind), not distribution.
- DOCUMENTED: unanswered aid pendings never expire and block new beats
  (one pending at a time by design — the beats row is the player's to clear).

## Design calls for Steve's overrule

1. Aid answering lives in the competent policy (all policies inherit) —
   accept offers always, give to begs at 3×/1.5× pantry cover.
2. No game-number changes: the aid amounts (1500–3000 offers, 1200–2000
   begs) are narrative gifts, not supply lines — left alone per "feel over
   math."

No `[needs-eyes]`: policy-only, no feel/combat/UI change.
