# sim-warmthfuel-b — guard vs ON compare (standalone; panel N/A)

Panel (§15) is NOT APPLICABLE to this DIAG census: no
game-root delta exists (guard vs ON differ by the
WOODWARM policy env flag, not by a game change), and
the panel's compare mode consumes panel-driver outputs
(panel.json.gz), not recorder-row corpora. No panel
result is fabricated. This side-by-side is the
comparison delivered instead, computed by the
standalone analyzer (scripts/analyze-warmthfuel-b.js)
from the judged corpora.

Substrate (both legs): POLICY=nighttravel,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, DAYS=30, bank seeds 15003,
15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376,
15439. Guard = WOODWARM=0, ON = WOODWARM=1.

## Leg totals (10 seeds each, all survived 30 days)

| measure | guard | ON |
|---------|-------|----|
| creek evenings | 12 | 18 |
| still-refused | 3 | 10 |
| rescued | 9 | 8 |
| warmth acted (all seeds) | 0 | 6 (all on 15215) |
| warmth log-spent (all seeds) | 0 | 4 (all on 15215) |
| strand seeds | 15215 only | 15215 only |
| strand evenings | 3 | 10 |
| wave reach | w1 10/10, w2 8/10, w3 1/10 (15439), w4-5 0/10 | identical |

## Strand nights, 15215 (the only stranding seed)

| night | guard refusal logs / kcal / ticks | guard fuel | ON refusal logs / kcal / ticks | ON fuel |
|-------|-----------------------------------|------------|--------------------------------|---------|
| day 7 | 4 / 2254 / 47 | lever-off | 4 / 2254 / 47 | ticks-short (not attempted) |
| day 8 | 4 / 0 / 239 | lever-off | 4 / 0 / 239 | NO-FUEL (friction failed) |
| day 9 | 4 / 0 / 109 | lever-off | 4 / 0 / 109 | WOOD 4 -> 3 |
| day 10 | rescued (bridge built, post-wood 0) | — | 3 / 240 / 238 | NO-FUEL (friction failed) |
| day 11 | home | — | 3 / 0 / 111 | WOOD 3 -> 2 |
| day 12 | home | — | 2 / 0 / 239 | WOOD 2 -> 1 |
| day 13 | home | — | 1 / 0 / 111 | WOOD 1 -> 0 |
| day 14 | home | — | 0 / 240 / 238 | no-wood |
| day 15 | home | — | 0 / 0 / 111 | no-wood |
| day 16 | home | — | 0 / 0 / 111 | no-wood |

Days 7-9 are IDENTICAL on both legs (same refusal
numbers, same kcal, same ticks) — warmth has not yet
changed anything by the end of night 9's refusal; the
divergence starts with night 9's fire (guard: no fire;
ON: log 4 -> 3).

## Counterfactual (protected wood, both legs)

| leg | actual strand length | counterfactual length | converts | never reached |
|-----|---------------------|----------------------|----------|---------------|
| guard | 3 (nights 7-9) | 3 | none (reproduces actual) | — |
| ON | 10 (nights 7-16) | 3 (nights 7-9) | day 10 (wood' 4, kcal 240, ticks 238) | 11, 12, 13, 14, 15, 16 |

## Branch column (both legs)

Branches: 0 on every strand morning, evening, and
post-evening snapshot, both legs. The non-bridge-fuel
option has no fuel to burn on this strand.

## Strand exits

- Guard: bridge built day 10, walks home.
- ON: wakes inside the haven morning 17 ("You come
  home after 11 days"); day-16 record shows a 3-step
  route-around path to the haven. No bridge built.

## Verdict carried from the evidence file

DIAG-GO (see evidence/2026-10-31/sim-warmthfuel-b.md
for the full judged tables, sense-test, and decision
framing). Corpora: sim-warmthfuel-b-corpus-{guard,on};
censuses: sim-warmthfuel-b-census-{guard,on}.json;
determinism: sim-warmthfuel-b-corpus-determinism
(15215 ON byte-identical).
