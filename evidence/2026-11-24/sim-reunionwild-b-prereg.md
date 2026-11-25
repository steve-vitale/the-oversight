# sim-reunionwild-b — PREREG (frozen before any judged join)

**Arm:** sim-reunionwild-b · **Loop B run:** fleshout-loop-b-20261125T0130Z
**Axis:** winnability-chain · **Answers:** wilddeath blank #2 / 2230Z next
blank (3) — "Reunion in the wild: is the wild Reunion pack
over-lethal relative to its spawn share?"
**Type:** DIAG join of two landed corpora. **NO NEW SIMS.**
**Corpora (both already committed on master; read-only inputs):**
- CONTACTS: `evidence/2026-11-24/perseed-bloodcluster-b/` — v2 judged
  leg only: 16 files, RUN `bloodcluster-b-v2`, seeds 109310–109325.
  v1 smoke files and the `-replay` file are EXCLUDED.
- DEATHS: `evidence/2026-11-24/perseed-wilddeath-b/` — 16 judged
  files, RUN `wilddeath-b`, seeds 109447–109462. The `-replay` file
  is EXCLUDED.
- Published summaries: `evidence/2026-11-24/sim-bloodcluster-b.md`
  (DIAG-GO), `evidence/2026-11-24/sim-wilddeath-b.md` (DIAG-GO).

## 1. The question, in plain words

Wilddeath says Reunion is the commonest killer in the wild (11 of 27
monster mentions across the 18 veteran deaths; 29 of the 95 wild
deaths involve a Reunion). But a common killer can simply be a common
monster. The question is whether a wild Reunion pack kills OUT OF
PROPORTION to how often villagers meet one — kills per contact,
Reunion against the other wave-4 kinds.

## 2. Join definition (frozen)

**No seed/day matching is possible.** The two corpora are disjoint
seed bands (109310–109325 vs 109447–109462) on different anchors.
The join is POOLED BAND-LEVEL: all contacts of kind K on the
bloodcluster band against all deaths attributed to kind K on the
wilddeath band. Comparability rests on identical spec — competent
policy verbatim, 150-day death-aware horizon, same harness — and on
the substrate check in §5. Cross-band scaling (one band simply
meeting more monsters than the other) is handled by the
ratio-of-ratios metric in §3, never by comparing absolute rates
across bands.

**Death (numerator).** A `playerDeaths` row counts as a wild death
iff ALL of: `causeArg === 'the wild'`, `hasTbEnd === true`,
`tb.arenaContest === false`. Cross-check: the count must equal the
`regDeaths` rows with `cause === 'the wild'` and `player === true`
(wilddeath evidence: 95).

**Attribution.** A death's kinds = the distinct `tb.monsterIds`
whose corresponding `tb.monsterWaves` entry is non-null. Null-wave
ids are fight adds (e.g. `focus_group_eye`), not kinds, and are
dropped. If exactly one kind remains, the death attributes to it.
If more than one remains, the death counts once per kind present
(mention-level) and is flagged MULTI. If zero remain, the death is
UNCLASSIFIED with the reason recorded. Every death must be
attributed or explicitly unclassified (bar 1).

**Contact (denominator, PRIMARY — TB only).** A `tbStarts` row counts
as a contact iff `rebuilt !== false` (a genuine new TB fight; a
`startCombat` call refused while a fight was live builds no fight
and is not a contact — the bloodcluster instrument's own rule) AND
`wave >= 4`, counted once per fight entry per `mid`. Rationale,
frozen: all 95 wild deaths are TB fights (`tbEnd`); field fights
never kill the scholar on the bloodcluster band (0 scholar-vid
`vDie` in 2346 field rows; the 10 scholar field rows are 9 `vKill`
+ 1 `evade`); field and TB are disjoint channels (1 of 89 genuine
TB starts shares a (day, mid) with a field row — coincidence
level). The kind mix differs sharply by channel (eulogy 54 field /
16 TB; reunion 15 field / 23 TB; herald 19 field / 0 TB), so a
field denominator would answer a different question.

**CORRECTION TO THE BRIEF (frozen here, not re-litigated in the
join):** the brief names "fieldFight rows by monster kind" as the
contact denominator. That is the WRONG channel for this numerator
— the scholar's wild deaths are 95/95 TB, and field fights kill
villagers, never the scholar. The field denominator is reported
only as sensitivity S2 below. The judged denominator is TB starts.

**Sensitivity denominators (reported, NOT judged):**
- S1 — BC-pooled contacts: field rows (`outcome !== 'alreadyDead'`)
  + genuine TB starts, by kind. Must reproduce the bloodcluster
  band total of 300 (211 field + 89 TB).
- S2 — field-only contacts by kind.

**Scope.** The rate table covers wave-4+ kinds only (wave-5 kinds
editor / rerun / spoiler / timeslot included). Wave-3 and lower
deaths count toward bar 1 (classification) but not toward the rate
comparison — different gate, different pool.

## 3. Lethality metric (frozen)

- Per kind K (wave ≥ 4): `kills-per-contact(K) = wild deaths
  attributed to K / genuine TB contacts of K`.
- Comparator: pooled other wave-4 kinds with ≥ 5 TB contacts (the
  pool floor): eulogy, algorithm, influencer, eater, suburb,
  strike.
- Rate ratio `RR = rate(Reunion) / rate(pooled others)`, with a 95%
  confidence interval by the log method,
  `SE(log RR) = sqrt(1/d1 + 1/d0 + 1/c1 + 1/c0)` (d = deaths,
  c = contacts; Reunion subscript 1, pooled-others 0).
- Interpretation ladder (frozen — the substantive answer is read
  off this ladder, never re-scored):
  - OVER-LETHAL: RR point > 1.5 AND lower CI bound > 1.0.
  - PROPORTIONAL: RR point in [0.67, 1.5].
  - ELEVATED-BUT-UNPROVEN: RR point > 1.5 but lower CI bound ≤ 1.0.
  - UNDER-LETHAL: RR point < 0.67 AND upper CI bound < 1.0.
  - Otherwise INCONCLUSIVE.
- Pool floors: kinds with < 5 TB contacts get a rate printed but
  marked LOW-N and are excluded from the comparator pool and from
  any per-kind verdict (expected: audit 3, congregation 3,
  editor 3, rerun 2, spoiler 1). Kinds with 0 TB contacts but ≥ 1
  death (expected: timeslot, 1 death / 0 contacts) are named as
  DENOMINATOR-ZERO join gaps, not rates. Herald (0 contacts,
  0 deaths) is a structural zero — it never enters TB (84/84
  `startCombat` calls refused) — named, not a rate.

## 4. Frozen bars

| # | Bar | Pass condition |
|---|-----|----------------|
| 1 | Classification completeness | 95/95 wild deaths attributed to exactly one kind; 0 unclassified; multi-kind deaths (if any) resolved by the §2 rule and flagged |
| 2 | Denominator integrity | Pooled genuine TB contacts reproduce the bloodcluster analyzer's TB count (89 w4+); pooled field+TB reproduces 300; refused starts excluded and counted (92 refused w4+ of 181 w4+ tbStarts); every w4+ kind's denominator stated, including explicit zeros |
| 3 | Cross-checks | Numerator 95 equals regDeaths wild+player 95; BC-band scholar wild deaths (deathEvents, player + cause 'the wild') reported as the cross-band scaling check (expected 72 on 2082 days vs WD 95 on 2202 days) |
| 4 | Verdict rule | DIAG-GO iff bars 1–3 pass AND the rate table is complete for every w4+ kind with denominators stated (zeros explicit) AND the substantive answer is read off the §3 ladder. Otherwise DIAG-NO-GO naming the failed bar. |

## 5. Comparability — substrate drift between the corpora (checked pre-prereg)

- Bloodcluster anchor `e68ab43a2d3c`: `git diff b7f77443c e68ab43a2d3c
  -- src/` is EMPTY. Its game substrate is the merge-base
  `b7f77443c`.
- Wilddeath anchor `6b837b1c1`: `git diff b7f77443c 6b837b1c1
  -- src/` touches 12 files (286 insertions) — but the content is
  voice/naming work only: calledname (`game.js` 8+/6−, `npcName`
  in the drift line), hold-line wording (`win-plan.js`,
  `villager-agency.js`, `villager-brain.js`), conversation files.
  A grep of the full diff for spawn / wave-pool / startCombat /
  tbEnd / fieldFight / castMonster / monsterWave finds NO
  mechanics change. No spawn-mix, wave-gate, TB-resolution, or
  field-fight mechanic differs between the corpora.
- Residual risk: the bands are different seed draws, so kind-level
  contact counts are small-n (1–23 per kind) and Poisson-noisy.
  The CI in §3 carries that noise; the ladder's
  ELEVATED-BUT-UNPROVEN rung exists for exactly this case.
- Arena contamination of the TB denominator: `tbStarts` rows carry
  no arena flag, so arena TB starts cannot be excluded. Bound: the
  wilddeath band has 4 scholar arena deaths on 16 seeds, so arena
  TB fights are rare; any inflation of a kind's denominator is
  small and is named in the evidence, not corrected by hand.

## 6. Exploration spot-checks (NOT frozen outcomes — the analyzer must reproduce them from the files; any deviation is a finding)

- Numerator by kind (distinct-kind attribution): reunion 29,
  eulogy 16, suburb 8, algorithm 8, eater 6, audit 4, buffering 4,
  spoiler 3, editor 3, terms_of_service 3, rerun 2, influencer 2,
  redactor 2, focus_group 1, speedbump_turtle 1, gallowdeer 1,
  gavel 1, timeslot 1. Total 95; w4+ deaths 82.
- Genuine TB contacts w4+: reunion 23, eulogy 16, algorithm 9,
  influencer 9, eater 7, suburb 7, strike 6, audit 3,
  congregation 3, editor 3, rerun 2, spoiler 1. Total 89.
- Implied: reunion 29/23 = 1.26; pooled others (≥5 contacts)
  40/54 = 0.74; RR ≈ 1.70, 95% CI ≈ (0.86, 3.37) →
  ELEVATED-BUT-UNPROVEN on the §3 ladder. The absolute rates above
  1.0 are the cross-band scaling artifact (§2) — only the ratio is
  interpretable.
- Bloodcluster per-seed table note: the published per-seed "W4
  contacts" column in sim-bloodcluster-b.md §5 does NOT reproduce
  from the raw JSONs on 10 of 16 seeds (e.g. 109312: table 61 vs
  56 field + 12 TB = 68), though the pooled totals reproduce
  exactly (300; door 167 / non-door 133). Filed as a finding for
  the bloodcluster arm; this join computes everything from the raw
  per-seed JSONs and does not use that table.

## 7. Deliverables

- `scripts/analyze-reunionwild-b.js` — performs the join from the
  two committed corpora, prints the by-kind table + RR + CI.
- `scripts/test-reunionwild-b.js` — proof: determinism (same
  inputs, same outputs, twice) + spot-checks against the published
  wilddeath/bloodcluster numbers (95 deaths; 300 pooled contacts;
  reunion 29 deaths; TB contacts by kind).
- `evidence/2026-11-24/sim-reunionwild-b.md` — verdict (judged only
  on §4), joined table, metric review, sense-test (2–3 Reunion
  death rows read as stories from their `sayTail`), wall numbers
  from both corpora.
- No src/js changes. No new sims. Commits: prereg first, then
  analyzer, then evidence.
