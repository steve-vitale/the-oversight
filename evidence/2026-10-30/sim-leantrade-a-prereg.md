# sim-leantrade-a prereg — leanlink village-loss decomposition (ANALYSIS ONLY)

Run: fleshout-20261030T1315Z, arm sim-leantrade-a, axis scale-onramp.
Policy: NO new sims, NO game change. Read-only decomposition of the COMMITTED
corpora from loop B's sim-vests-b arm. If a needed field is absent from the
corpora, the analysis reports the gap — it never invents numbers.

## Corpora (verified present in this worktree, committed)
- evidence/2026-10-30/sim-vests-b-corpus-competent/ (seeds 9911–9918)
- evidence/2026-10-30/sim-vests-b-corpus-leanlink/ (seeds 9911–9918)
- evidence/2026-10-30/sim-vests-b-corpus-competent.json
- evidence/2026-10-30/sim-vests-b-corpus-leanlink.json
- evidence/2026-10-30/sim-vests-b.md (narrative + wall numbers)
- Corpus commit: b32d19d43 ("sim-vests-b evidence: vest census DIAG verdict
  MIXED, fresh band + wall-band re-run + panels")
- Worktree HEAD at prereg time: c138488b2 (sim-vestcounter-b instrument commit)

## Seed pairing (to be confirmed by the analyzer, not assumed)
Both corpora list seeds [9911..9918]. Pairing is claimed ONLY if the analyzer
confirms identical seed sets and matching policy labels in both aggregate files.

## Analysis plan
1. Loss inventory: every village-lost seed in both corpora, with loss day,
   national/table status at loss, max rank, wave reach, arc reach.
2. Primary-cause attribution per lost seed from the corpus `deaths` field:
   aggregate cause shares grouped into classes (monster combat incl.
   villager combat / expedition / monster; player deaths in the wild, arena,
   contest, night, stranger; starvation / thirst / sickness / wounds).
   Primary class = largest share; reported WITH the caveat that the corpus
   carries aggregate counts only — no timestamped death log, no terminal
   (last-villager) cause field — so attribution is by dominant share, NOT
   proven terminal cause. Any seed where the top two classes are within 2
   deaths is reported as mixed/ambiguous, not forced.
3. Loss-day distribution: leanlink lost days vs competent lost day(s);
   early (<100d) / mid-ambition (100–150d) / late (>150d) buckets; paired
   seed-by-seed day deltas.
4. Tribute/proposal quantification from the corpus ONLY: `court` counts
   (proposedLead, courtAccords, courtNational, courtGlobal, courtCounters)
   and endGate links/trust per lost seed. Pantry trajectories, per-week
   tribute kcal actually paid, and proposal-day timing are NOT in the corpus
   (verified by grep: no pantry/kcal/tribute fields) — that section ends in
   an explicit gap statement, with canon context (docs/SCALE.md: courtship
   tribute 4,000 kcal/week; leanlink policy proposes 4,000 kcal/week) clearly
   marked as canon/policy, NOT corpus measurement.
5. Paired-vs-confounded verdict: same-seed outcomes under both policies
   (survived-vs-lost, lost-vs-lost day deltas, death-total deltas, rank
   deltas) before any tradeoff claim.
6. SENSE-TESTING LAW: read >= 2 village-loss trajectories end to end, one
   per policy, from the corpus rows + sim-vests-b.md narrative, and judge
   what actually happened (not just counts). Candidates: competent 9913
   (the only competent loss) and leanlink 9912 (national reached, then
   lost; maxRank global dissolving to regional at loss).

## GO threshold (DIAG-GO)
Every village-lost seed in both corpora (expected: competent 1, leanlink 4)
attributed to a primary cause class with cited corpus evidence, PLUS the
loss-day distribution, PLUS a quantified tribute/proposal-cost section OR an
explicit gap statement where the corpus cannot support quantification.
Miss on any leg = DIAG-NO-GO. No re-scoring mid-run; doubts go under
"metric review" in the final evidence.

## Metric review (pre-filled, to be completed at analysis end)
- The corpus `deaths` field is aggregate, not a death log: primary-cause
  attribution by share is a proxy, not a terminal-cause proof. A follow-up
  measurement needs a timestamped death log (or at least the last-7-days
  death list) to name what actually killed each village.
- The corpus has no pantry time series and no tribute-payment events:
  tribute cost CANNOT be quantified from this corpus at all; only proposal
  counts and endGate trust are available. Any cost claim from this run
  would be invented.

## Outputs
- scripts/analyze-leantrade-a.js (pure corpus reader, deterministic)
- scripts/test-leantrade-a.js (fixtures on synthetic rows + determinism:
  analyzer run twice byte-identical)
- evidence/2026-10-30/sim-leantrade-a-analysis.json (analyzer output)
- Final evidence narrative delivered in the worker report (no separate
  evidence .md required by the task; the analysis JSON + this prereg are
  the committed artifacts).
