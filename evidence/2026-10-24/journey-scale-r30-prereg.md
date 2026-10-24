# journey-scale r30 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140)
Run id: oversight-playtest-loop-20261024T2143Z. Rotation read 3 → leg 3 SCALE; write 3→0 on completion.
Base: master@a6104f891 (pulled at run start). Driver: scripts/journey-scale-r30-20261024.js
(r29 driver + weekly village census + fixed covenant link-other mapping).
Analyzer: scripts/analyze-scale-r30-20261024.js. Policy: scalecourt (competent +
covenant-road courtship). Seeds: fresh 85001–85004. Horizon: DAYCAP=150, death-aware stop.
Pilot: seed 85001 runs clean before the other three launch.

## Leg question (from r29's metric review)
r29: covenant road 0/4 national, best 2/3 bonds; the league pool is national-gated,
so pre-national covenant famine has no granary. Why does the third bond never arrive?
Candidate mechanisms, in code order: (1) the map holds only 3–4 other villages
(genVillages: 3 + floor(rand*2)) while covenant polity needs 3 SEASONED peers, and
scalecourt spends the first link on a primary-sub proposeLink — on a 3-village map
covenant national is impossible by construction (max 2 peers); (2) a candidate
village is never rumored/generated, so it is never courted; (3) opinion stays <10
on all unlinked known candidates (codex +3 once, broadcast wins +2 each, +1/week
only lifts negatives toward 0); (4) proposals at/above the bar decline or counter
and stall; (5) 3 covenant links form but fail the seasoned bar (28+ days, trust 40+).

## Pre-registered verdicts (binding, §14)
- T1 count-ceiling: on seeds with totalVillages==3 and ≥1 primary-sub link, covenant
  national is structurally impossible (maxPeers < 3). Report the count; a 3-village
  seed can never be a covenant-national seed under this policy. Interesting if ≥1
  such seed (it reframes r29's 0/4, it does not excuse it).
- T2 blocker classification: every non-national seed gets exactly one blocker from
  the analyzer (count-ceiling / unknown-village / opinion<10 / declined-countered /
  seasoned-trust-bar). Interesting if one blocker dominates ≥3/4 seeds.
- L1 stay-green: national ≤d140 on ≥2/4 seeds (any road — scalecourt may stage lead
  via its first link + later subs; covenant-only national is the question, L1 is the guardrail).
- L5 stay-green: every scattered seed's ending voiced in full (scatter line present).
- M4 people: d90/d120 transcripts read in full; meaningful = NPC wants something,
  options engage/deflect, endings resolve/plant/owe; no fabricated shared history.

## What would count as interesting
A single dominant blocker, or a split that shows two independent ceilings (e.g.
count-ceiling on 3-village seeds AND opinion<10 on 4-village seeds). Either way the
next step is a Steve design call (village count, first-link policy, covenant bar, or
opinion economy) — NOT a silent worker code change to any of those bars.

## Metric review (to fill after the run)
