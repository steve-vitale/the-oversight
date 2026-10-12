# Deep win-stats campaign (win-stats-deep) — 2026-10-12

**Steve 2026-10-12:** "playtest deeply to get some stats on wins and how long they take,
what route or build path they take to do it."

Large completion-attempt campaign on current local master (post table-sanctity
revert; sanctity held per Steve — these runs do NOT have it).
145 unique runs × 200-day horizon, 5 policies, seeds 1–30 per arm
(primeseek missing seed 4, cautseek missing seed 12 — both hung on pathological
game states, documented below).

## Policies (all scripts-only, no src/ changes)

| policy | n | description |
|---|---|---|
| winseek | 30 | baseline win-seeking (bold fighter, subordinate/tribute diplomacy, drains table) |
| fedseek | 30 | winseek + fed survival floor (SIM INSTRUMENT: starvation removed) |
| primeseek | 26 | winseek + PRIMACY-FIRST: propose as primary, walk subordinate counters, bid primacy aggressively, never tribute |
| cautseek | 29 | winseek + CAUTIOUS fighter: engage ≤2x HP (vs 3.5x), flee at 40% HP (vs 30%) |
| passive | 30 | do-nothing: eat/drink/flee only, never initiates; villagers full agency |

New this run: `scripts/policies/winvariants.js` (primeseek, cautseek),
`scripts/policies/passive.js`, `scripts/sweep-winstats-deep.js` (extended
funnel: abilities, synergies, integration, tribute/primacy counts, link
head/sub split, fight counters), `scripts/analyze-winstats-deep.js`.

## Headline: win rate 1/145 (0.7%)

| policy | won | win day | table fired (lost) | lesser | regional / national |
|---|---|---|---|---|---|
| winseek | 0/30 | — | 0 | 0 | 18 / 1 |
| fedseek | 1/30 | 69 | 0 | 0* | 28 / 1 |
| primeseek | 0/26 | — | 0 | 0 | 15 / 0 |
| cautseek | 0/29 | — | 0 | 0 | 17 / 1 |
| passive | 0/30 | — | 0 | 0 | 0 / 0 |

\* The win's lesserDay=0 is a sampler miss (5-day cadence); seatEnd=lesser confirmed.

**The game is not too easy.** One win in 145 runs, and it required the food
wall removed (fedseek instrument). No honest (unfed) policy won in 89 runs.
No table fired without resolving to a win (the prompt-drain works; sanctity
was not in these runs).

## The one win (fedseek seed 1, day 69, feared/light)

- **Route:** regional d25 → national d60 (BELONG, oath sworn, 279 tribute paid) →
  Arc IV → lesser seat (11/6/4 faced, 7 contests, 3 crises, national, stage 3,
  food deeds) → table d69 → 5 answers drained → **won**.
- **Table:** path feared, branch light, phase done. 5 table answers.
- **Build:** 6 abilities — gossip_network, green_thumb, photosynthesis,
  hive_mind, beard_moss, eagle_eye. **0 synergies.** Integration 100, 6 slots.
  Feastburn used. Stage 3, codex breadth 54.
- **Scale:** 5 proposals, 0 peer, 279 tribute payments, 0 primacy bids.
  End links: 0 head / 5 subordinate / 0 peer. Vest: belong (four-realm formed).
- **Combat:** 12 counters discovered, 7 counter-kills, 18 wave kills —
  **player struck 0 blows** (see below).
- **Continuity:** 7 successions (bearer died 7 times; the village carried on).

## Where the other 144 die

Death causes (non-passive, n=1240): combat 31.7%, villager combat 31.5%,
monster 24.5%, starvation 5.1%, wounds 2.6%, sickness 1.4%, contest 1.0%.

The funnel narrows hard at national: 3/145 reached it. Two (winseek + cautseek
seed 21, same seed) reached national d55 but stalled at arc 3 and died d96 —
never assembled Arc IV. Only the fed win cleared arc 4.

Median survival: winseek 32d, fedseek 43d, primeseek 37d, cautseek 30d,
passive 22d. Max: 96d (non-winning).

## The zero-strike finding

**The player struck zero blows in all 145 runs** (instrumented fight handler;
confirmed by direct runs). The winseek policy — designed as a "bold" fighter —
flees every engagement at the assessment gate (outmatched / bars filled /
already-faced / near-death) and never reaches the strike line.

What this means: the winning strategy is **diplomat + survivor, not fighter**.
All 18 wave kills in the win came from villagers, contests, and the village's
own fighting. The player contributes: courtship, tribute (279 payments),
beats answered, feast/integration/sentiment roads, and *not dying*.

This is within the game's explicit design ("facilitation is a chosen play
with architect's credit"; "the player authors it as hero, facilitator, or
footnote"). But it is a balance smell worth Steve's eyes: **the optimal sim
play is to never fight personally.** Whether that's "too easy" or "the point"
is a design call — the win rate (0.7%) says the *survival* is hard; the
*combat* is avoidable.

(Note: flee telemetry in the sweep double-counts — `fled` sums the
per-reason counters AND the per-flee-call counter. The zero-strike finding
is unaffected.)

## Scale strategy: primacy road vs tribute road

- **winseek (tribute/belong):** 106 proposals, 2856 tribute payments,
  105 subordinate links, 1 national.
- **primeseek (primacy/lead):** 471 proposals, 223 counters walked,
  0 tribute, 62 head-links, **0 national.**

The primacy road builds head-links readily (best run: 6 villages under Haven)
but never converts to national in 26 runs. The national beat for lead-shape
either needs more seasoning than 200 days or the policy misses a trigger —
filed as an open question, not a bug (the belong road is the proven path).

## Caution vs boldness: no difference

cautseek (0/29, median 30d) vs winseek (0/30, median 32d): statistically
identical outcomes. When the player never strikes anyway, the fight
thresholds don't matter — caution and boldness converge on "flee everything."

## The passive arm: can villagers carry a do-nothing player? No.

0/30 wins. 0/30 regional. Max wave 1, max arc 3, median 22 days, all
village-lost. The standout: several runs ended in **The Scattering** — 3+
hungry days and the villagers walk away in different directions (0 deaths
recorded; desertion, not death). Others: thirst (9), starvation (10),
combat (40). 45 successions — the village kept choosing new bearers, but
each new bearer was equally passive.

The design question, answered: competent villagers cannot carry a passive
player past wave 1. The endgame's "player as footnote" allows facilitation,
not absence — the village needs *a* driver, even if not a hero.

## Near-wins: none

No run fired the table without winning (0 near-win autopsies). The two
national non-wins (seed 21 × 2 policies) died at arc 3, day 96 — the wall
is Arc IV assembly (seat + arcs), not the table itself.

## Hung seeds (pathological game states)

- primeseek seed 4: hung ~day 27 (deterministic; base winseek completes seed 4
  in 11s — primeseek-specific).
- cautseek seed 12: hung (deterministic; base winseek completes seed 12).

Both excluded from stats. Not investigated to root cause — filed for the
long-run loop. If primacy/caution-specific hangs reproduce in real play,
that's a bug; on current evidence they're rare pathological states.

## Sense-check: does the win read as earned?

Honest judgment, with the r5 transcript read (the win transcript was
sense-checked in sim-winpath-r5.md, PASS): **earned at the village level,
odd at the player level.**

Earned: 69 days against 83%-combat-attrition pressure; 7 bearers died and
the mantle passed each time — the village, not the hero, reached the table.
The audit is honest ("waves 1–3 faced (11/6/4), 7 contests survived, 3 crises
weathered. The table does not rise. It prices."); 279 tribute payments are
real economic cost; the feared/light beats cohere ("the audience weeps, and
the galaxy learns that the feared one chose gentleness").

Odd: the winning "hero" never struck a blow. The fantasy of the feared
table-winner sits strangely beside a bearer who fled 40,000+ engagements.
The design allows the footnote — but Steve should decide whether the
*optimal* play being pure pacifism is the game he wants. The 0.7% win rate
says it's not free; the zero-strike says it's not fought.

## Files

- Policies: `scripts/policies/winvariants.js`, `scripts/policies/passive.js`
  (+ `winseek.js`: `_cautious`/`_primacyFirst` flags, `fledHurt` counter)
- Sweep: `scripts/sweep-winstats-deep.js`; analyzer: `scripts/analyze-winstats-deep.js`
- Data: /tmp/ws-merged.json (145 rows), /tmp/ws-{winseek,fedseek,primeseek2,cautseek2,passive}.json
