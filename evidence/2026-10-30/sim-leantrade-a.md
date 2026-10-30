# sim-leantrade-a evidence — leanlink village-loss decomposition (ANALYSIS ONLY)

Run: fleshout-20261030T1315Z, arm sim-leantrade-a, axis scale-onramp.
Verdict: **DIAG-GO** against the prereg (see "Verdict" below).

**What this arm is and is not:** analysis only. No new sims were run, no
game code was changed, no gate was moved, no default was flipped. The
question was whether the village losses seen under the leanlink policy
are the price of reaching national — i.e. whether national reach is
bought with village survival. The answer from this corpus is: **not
shown**. The divergence is evidenced; the tribute cost is not.

## Sources (committed, read-only)

- Prereg: `evidence/2026-10-30/sim-leantrade-a-prereg.md`
  (commit `0a44d7ce8`)
- Analyzer + proof test + analysis JSON:
  `scripts/analyze-leantrade-a.js`, `scripts/test-leantrade-a.js`,
  `evidence/2026-10-30/sim-leantrade-a-analysis.json`
  (commit `c8a29a767`)
- Corpora decomposed (loop B's sim-vests-b arm, committed before this
  arm; corpus commit `b32d19d43` per the prereg):
  `evidence/2026-10-30/sim-vests-b-corpus-competent/` and
  `evidence/2026-10-30/sim-vests-b-corpus-leanlink/`, seeds 9911–9918,
  180-day death-aware horizon, plus the aggregate files
  `sim-vests-b-corpus-competent.json` and
  `sim-vests-b-corpus-leanlink.json`.
- Narrative cross-check: `evidence/2026-10-30/sim-vests-b.md`
  (two-column table and wall numbers; used only for the sense-reads).

Seed pairing was confirmed by the analyzer, not assumed: identical seed
sets [9911..9918] with matching policy labels (`competent` /
`leanlink`) in both aggregate files (`seedPairingConfirmed: true`).

## Verdict: DIAG-GO

The prereg's DIAG-GO threshold had three legs, and all three are met:

1. **Every village-lost seed attributed** — 1 competent loss + 4
   leanlink losses, each with a primary cause class and cited corpus
   evidence (table below). No seed fell into the prereg's
   mixed/ambiguous band (top two classes within 2 deaths): the
   smallest margin is 18 deaths.
2. **Loss-day distribution** — reported below, competent vs leanlink.
3. **Tribute/proposal-cost section** — delivered as an explicit gap
   statement (see "The gap"), which the prereg accepts in place of
   quantification where the corpus cannot support it.

No re-scoring mid-run. Doubts are recorded under "Metric review".

## Paired-seed finding (seeds 9911–9918, competent vs leanlink)

Same seeds, same 180-day horizon, two policies. Tallied from the
analysis JSON's paired rows:

| seed | competent end | leanlink end | day delta (lean − comp) | death delta (lean − comp) | competent rank / nat / table | leanlink rank / nat / table |
|------|---------------|--------------|-------------------------|---------------------------|------------------------------|-----------------------------|
| 9911 | survived (180d) | village-lost (166d) | −14 | +3 (38 vs 35) | village / 0 / 0 | regional / 0 / 1 |
| 9912 | survived (180d) | village-lost (139d) | −41 | −5 (39 vs 44) | village / 0 / 0 | global / 1 / 0 |
| 9913 | village-lost (86d) | village-lost (129d) | +43 | +11 (42 vs 31) | village / 0 / 0 | global / 1 / 1 |
| 9914 | survived (180d) | survived (180d) | 0 | −2 (32 vs 34) | village / 0 / 0 | national / 1 / 0 |
| 9915 | survived (180d) | survived (180d) | 0 | −8 (26 vs 34) | village / 0 / 0 | regional / 0 / 0 |
| 9916 | survived (180d) | survived (180d) | 0 | +2 (48 vs 46) | village / 0 / 0 | regional / 0 / 1 |
| 9917 | survived (180d) | survived (180d) | 0 | −3 (37 vs 40) | village / 0 / 0 | national / 1 / 0 |
| 9918 | survived (180d) | village-lost (159d) | −21 | +1 (55 vs 54) | village / 0 / 0 | national / 1 / 1 |

The divergence half is real and one-sided: competent stays at village
rank on all 8 seeds with national 0/8 and table 0/8, while leanlink
reaches regional-or-better on all 8 seeds, national on 5/8
(9912, 9913, 9914, 9917, 9918) and table on 4/8
(9911, 9913, 9916, 9918). Leanlink climbs; competent does not.

The survival half is not one-sided. Leanlink loses 4/8 villages to
competent's 1/8 — but the paired pattern cuts both ways, which is why
no simple "climbing kills villages" claim survives this corpus (see
"Paired vs confounded" below).

## Per-seed loss attribution

Primary class = largest aggregate death class in the corpus `deaths`
field for that seed (monster combat = `monster:*` plus
`villager:monster`; player-field = player deaths in the wild, at night,
or to a stranger, plus `person:combat`). Attribution is by dominant
share, NOT proven terminal cause — the corpus carries aggregate counts
only, with no timestamped death log and no terminal (last-villager)
cause field. Starvation counts are zero in every lost seed below; the
only sustenance-disease deaths in the losses are thirst (1 each on
leanlink 9912 and 9913) and, on leanlink 9918, sickness (6) and wounds
that would not close (2).

| lost seed / policy | loss day | bucket | max rank at loss | national / table | deaths total | monster-combat | margin over 2nd class | 2nd class | starvation |
|--------------------|----------|--------|------------------|------------------|--------------|----------------|------------------------|-----------|------------|
| 9913 competent | 86 | early (<100d) | village | 0 / 0 | 31 | 26 | 21 | player-field (5) | 0 |
| 9911 leanlink | 166 | late (>150d) | regional | 0 / 1 | 38 | 27 | 18 | player-field (9) | 0 |
| 9912 leanlink | 139 | mid-ambition (100–150d) | global | 1 / 0 | 39 | 29 | 22 | player-field (7) | 0 |
| 9913 leanlink | 129 | mid-ambition (100–150d) | global | 1 / 1 | 42 | 30 | 22 | player-field (8) | 0 |
| 9918 leanlink | 159 | late (>150d) | national | 1 / 1 | 55 | 33 | 21 | player-field (12) | 0 |

Every loss is monster-combat dominant, by a wide margin (18–22
deaths). Monster combat also dominates both columns overall across
all 8 seeds (competent 258, leanlink 238 monster-combat deaths in the
column totals). No lost seed is starvation-driven, and no lost seed
is ambiguous.

## Loss-day distribution: leanlink losses come late, after scaling

- Competent losses: [86] — 1 early, 0 mid-ambition, 0 late.
- Leanlink losses: [129, 139, 159, 166] — 0 early, 2 mid-ambition,
  2 late.

None of the leanlink losses is an early wall death, and none is a
mid-ambition starvation death of the kind the scale-wall directive
describes (villages starving mid-ambition around day 39, dead by day
63). Every leanlink loss comes *after* scaling: all four reach
regional rank or better, three of the four reach national, and three
of the four reach the table. The villages that are lost under
leanlink are villages that climbed first and were lost later — to
monster combat, on the evidence available — not villages that
starved on the way up.

## The gap: tribute/proposal costs are NOT quantifiable from this corpus

This is stated explicitly, because it is the finding the arm was most
at risk of faking. From the corpus alone:

- **No pantry time series.** Tribute kcal actually paid cannot be
  quantified at all.
- **No proposal/tribute event log.** Proposal timing vs loss timing
  cannot be established — so no claim of the form "this proposal
  caused this loss" is supported.
- **No timestamped death log, no terminal-cause field.** Primary-cause
  attribution above is by aggregate dominant share only.
- **No population time series.** The final-decline shape (slow bleed
  vs sudden wipe) cannot be reconstructed.

What the corpus *does* support is proposal *counts* and endGate trust,
and those are reported as counts only, never converted into costs:

- Leanlink court totals across 8 seeds: proposedLead 30, courtAccords
  23, courtNational 5, courtGlobal 2, courtCounters 2. Competent court
  totals are empty on all 8 seeds (no proposals at all).
- Per lost seed: leanlink 9911 proposedLead 9, courtAccords 3,
  courtCounters 2; leanlink 9912 and 9913 proposedLead 3, courtAccords
  3, courtNational 1, courtGlobal 1 each; leanlink 9918 proposedLead
  3, courtAccords 3, courtNational 1. EndGate links at loss carry
  real trust (e.g. 77/43/45 on leanlink 9912; 45/65/39 on leanlink
  9913; 70/22/1 on leanlink 9918).
- Canon/policy context, marked as NOT corpus measurement (per the
  prereg): docs/SCALE.md courtship tribute is 4,000 kcal/week, and
  the leanlink policy proposes 4,000 kcal/week. That is the price
  schedule the policy plays against — it is not a measurement of
  what any village in this corpus actually paid.

Any tribute-cost claim from this run would be invented. The cost side
of the tradeoff is an open question, not a finding.

## Paired vs confounded: tradeoff real on 3 seeds, reversed on 9913

Read seed by seed before claiming a tradeoff:

- **Tradeoff pattern (3 seeds):** on 9911, 9912 and 9918, the
  competent village survives to the 180-day cap while the leanlink
  village climbs (regional/global/national, table on 9911 and 9918)
  and is then lost (−14, −41 and −21 days respectively). On these
  seeds, climbing and losing travel together.
- **Reversed on 9913 (+43 days):** both policies lose the village,
  but leanlink lasts 43 days *longer* than competent — and climbs
  while doing it (competent: lost day 86 at village rank, no
  proposals, no national, no table; leanlink: lost day 129 at global
  rank, national reached, table reached). On this seed, climbing did
  not cost survival; it bought 43 more days.
- **The confound that blocks a clean verdict:** on 9912, the leanlink
  village is lost with *fewer* deaths (39) than its surviving
  competent counterpart (44). Death counts alone cannot explain why
  one village stands and the other falls. Population dynamics — how
  many villagers there were, when they arrived or left, how the final
  decline ran — are the unmeasured piece. Without a population
  series, the 9912 paradox cannot be resolved from this corpus, and
  any claim that "more monster deaths killed the leanlink villages"
  would over-read aggregate counts that point the other way on this
  seed.

So: the tradeoff is real on 3 seeds, reversed on 1, and confounded on
the seed that should be its cleanest case. That is a mixed picture,
not a price tag.

## Sense-reads: two trajectories, read end to end

**Competent 9913 — the early wall death.** The village dies on day
86, still at village rank, having proposed nothing (court record
empty), reached no national standing, and sat at no table. It did
reach wave 4 and Arc 3, so it was not idle — but its 31 deaths are
overwhelmingly monster combat (26), and the village is gone before
the climb ever starts. This is the wall as originally described: a
village that never gets to choose between survival and scale, because
it dies before scale is on the table. Its leanlink twin on the same
seed is the counterfactual: same world, 43 more days, global rank,
national standing, a table seat — and then lost anyway, to the same
dominant cause.

**Leanlink 9912 — the polity outliving the village.** Under leanlink
this village climbs all the way to global rank, reaches national
standing (courtNational 1, courtGlobal 1), and ends with three
endGate links at trust 77/43/45 — a realm, built and trusted. Then the
village itself is lost on day 139, and the record dissolves back to
regional (endGateRank regional, nationalLive false in the
sim-vests-b narrative). The polity outlives the village: the links
and the standing are still in the record at the moment the village
ceases to exist, while the competent twin on the same seed simply
survives to day 180 at village rank, having built nothing. Read
plainly, this is a village that succeeded at the climb and then died
underneath its own realm — to monster combat (29 of 39 deaths) on
the aggregate evidence, with the actual final decline unrecoverable
from this corpus.

## Plain-words verdict

National reach is **NOT** shown to be bought with village survival.
What the corpus evidences is the divergence: leanlink villages climb
(regional-or-better 8/8, national 5/8, table 4/8) where competent
villages stay home (village 8/8, national 0/8, table 0/8), and
leanlink villages are lost more often (4/8 vs 1/8) — but the losses
come late, after scaling, to monster combat, never to starvation,
and the paired pattern refuses a single story: three seeds look like
a tradeoff, one seed reverses it, and one seed loses with fewer
deaths than its surviving twin. The tribute cost — the other half of
any "bought with" claim — stays an open question, because this
corpus contains no pantry series, no tribute-payment events, and no
proposal timing. Until that measurement exists, "leanlink trades
survival for scale" is a hypothesis with mixed paired support, not a
finding.

## What this arm does NOT do

No game change. No gate move. No default flip. Analysis only, no new
sims. Nothing in this file is flagged for Steve's eyes on his phone:
no feel, combat, or UI change is proposed or made.

## Follow-up measurement needs

In the order the gaps bite:

1. **Per-day pantry series + tribute-payment events** — the missing
   cost side. Without these, no tribute-cost claim can ever be made
   from a corpus like this one.
2. **Timestamped death log** (or at least the last-7-days death list)
   — to name what actually killed each village instead of attributing
   by aggregate dominant share.
3. **Population series** — to resolve the 9912 paradox (lost with
   fewer deaths than its surviving twin) and to reconstruct the
   final-decline shape.
4. **A tribute-isolating arm** — a policy or instrument variant that
   varies tribute exposure while holding climbing constant (or vice
   versa), so the cost half of the tradeoff can be measured rather
   than inferred from confounded pairs.

## Metric review

- The corpus `deaths` field is aggregate, not a death log: primary-cause
  attribution by share is a proxy, not a terminal-cause proof. The
  margins here (18–22 deaths) are far above the prereg's 2-death
  ambiguity band, so the proxy is unusually clean — but it remains a
  proxy, and the follow-up measurement in item 2 above is what would
  turn it into proof.
- The corpus has no pantry time series and no tribute-payment events:
  tribute cost CANNOT be quantified from this corpus at all; only
  proposal counts and endGate trust are available. This run honored
  that limit by ending the cost section in an explicit gap statement
  rather than converting counts into kcal.
- The corpus has no population series: the paired-vs-confounded
  reading is limited to day deltas, death-total deltas, and rank
  deltas. The 9912 paradox (fewer deaths, worse outcome) is exactly
  the kind of result a population series exists to explain, and it
  is left open here rather than explained away.
- No metric was re-scored mid-run. The prereg's GO threshold was met
  as written (attribution + distribution + gap statement), so no
  metric revision is proposed for the next run — but the next run's
  prereg should require a population series and a pantry series as
  corpus inputs, or pre-register the same gap statement again.

## Convergence state

Axis scale-onramp: this arm is diagnostic, not a lever landing. It
clarifies the scale wall's loss side (late, post-scaling,
monster-combat losses; starvation absent; tribute cost unmeasured)
without moving the wall. Report as a diagnostic contribution to the
axis, not as convergence.
