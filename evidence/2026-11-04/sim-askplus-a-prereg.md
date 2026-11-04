# Competent-plus-ask pilot — run fleshout-20261104T0820Z, arm sim-askplus-a

Axis: scale-onramp / winnability chain. Tracker's named next blank #1
after Loop B 0730Z arm sim-diplo-b
(`evidence/2026-11-04/sim-diplo-b.md`, read in this worktree):
competent villages form ZERO inter-village links in 140 days because
competent contains zero scale code by design and never proposes, so
diplomacy income is structurally zero under the baseline policy. This
arm adds the asking move to competent and judges whether diplomacy
standing then flows and holds. POLICY-SIDE ONLY: scripts/policies
plus scripts instruments. ZERO src/js changes. No gate, price, deed,
or win-price change. Judging rules untouched.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. Correction/refinement of the
  diplo-b statement, verified by this worker: the CANON manifest
  lists NO doc covering standing scoring / deeds / scale — but
  docs/SCALE.md EXISTS in the tree (unlisted in the manifest) and
  covers the scale ladder, the polity definition (one primary with
  >=3 seasoned subordinates = a realm), seasoning (30+ days AND
  trust 40+; links form at trust 30 — tending required), and the
  six roads in (LEAD / BELONG / COVENANT / ...). SCALE.md was read
  for the ladder and polity rules. The standing SCORING formula
  (diplomacy = 34 x seasoned REGIONAL+ links) appears in no canon
  doc found; it is code-read from src/js/standing.js
  (diplomacyPerLink: 34; _linkRegionalPlus polity filter) and
  stated as code-read, not invented canon.
- Pipeline rule, as found in code (diplo-b, re-verified by grep in
  this worktree): a link forms ONLY by a played proposal verb
  (proposeLink primary/subordinate, proposeCovenant/proposeTrade
  peer; proposeAlliance is NOT a link), knowledge-gated
  (knowsVillage), peer proposals need opinion 10+, judgeLink base
  38 + standing/2 (cap 20) + opinion/2 + ally 15 + terms, >=55
  accepts. No engine or villager path proposes in competent's
  place.

## Policy (exact)

- BASELINE (before leg): `scripts/policies/competent.js`
  `{competent}` VERBATIM, default env.
- ARM (after leg): NEW `scripts/policies/competent-askplus.js`
  `{competentAskplus}` = competent.daily verbatim, then
  askCourtship, borrowed from `scripts/policies/leadcourt.js`
  leadCourtship with exactly two documented adaptations:
  1. It does NOT answer pendingNational / pendingGlobal. Those are
     endgame choices, not the ask; the competent baseline does not
     answer them either (grep: zero pendingNational/pendingGlobal
     references in competent.js), so baseline parity holds and the
     arm isolates proposing + courtship, not national-choice play.
  2. Policy id/description only otherwise. Every verb below goes
     through the same engine paths a player clicks, with real
     pantry costs. No judging rule, gate, price, or deed is
     touched, in policy or in game code.
- askCourtship, verbatim logic (leadcourt values, unchanged):
  - Answer pendingCounter: pantry > 25,000 kcal ? 'sweeten' :
    'accept'. Answer pendingAccord: 'gift'. Answer defense calls
    on our links: 'send' if living roster >= 5 else 'refuse'.
  - TEND Haven-primary active links weekly (link.tendedWeek !==
    week) when pantry > 20,000 kcal (tendLink; the LEAD road's
    seasoning engine — links form at trust 30, season at 40+).
  - PROPOSE from day >= 25, only when no pendingCounter /
    pendingAccord / pendingNational, pantry > 12,000 kcal, fewer
    than 3 active Haven-primary non-conquered subordinates:
    candidates = otherVillages known via knowsVillage and not
    already linked (linkWith); one proposal per day, 7-day
    cooldown per village; proposeLink(id, { asSubordinate: false,
    tributeKcalPerWeek: 4000 }).
- Registry plumbing (panel only, additive try/catch, prior-arm
  pattern): `scripts/sweep-compare.js` gains
  POLICY_REGISTRY['competent-askplus'] for the §15 panel. If this
  arm is killed, the policy file AND the registry entry are both
  reverted, leaving no trace.

## Pre-registration (committed before any judged sim)

- Question: when competent-plus-ask plays, do proposals get
  attempted, do links form, does diplomacy standing flow (>0) and
  hold (seasoned regional+ links over time), and in what shape
  (LEAD vs BELONG, incl. counter-flips)?
- Seeds (BOTH legs, identical): 99501–99508. FRESHNESS CHECK
  (2026-11-04, this worker): no evidence filename uses any
  99501–99508 seed; no dated evidence .md in evidence/2026-11-04/
  uses any of them (bounded grep over evidence/*/*.md also clean;
  the 99301–99308 diplo-b band and 99401–99408 context band are
  NOT reused). A full-tree grep was abandoned as too slow over
  multi-MB sweep JSONs; the filename + dated-.md checks are the
  stated freshness basis.
- Horizon: 140 days, death-aware (dead villages stop; +10d tail
  max as implemented by runDays). WHY 140: same as diplo-b — the
  proposal window (day 25+) plus a full 30-day seasoning window
  for any link formed before day 110, over the diplo-b survival
  distribution (median 59d on the 9930x band).
- Instruments: `scripts/diplo-instrument-20261104.js` VERBATIM
  (daily snapshots, proposal/courtship/travel wraps, link-diff
  detection, standing + capped + peak + scaleRank reads; snapshot
  never calls villageStandingTotal/unlockedWave; ONE end-of-run
  unlockedWave call reported separately, never counted as a
  natural door-open). New driver
  `scripts/diplo-driver-askplus-20261104.js` (diplo-driver shape,
  POLICY competent|competent-askplus, out dir
  evidence/2026-11-04/perseed-askplus-a/, refuses overwrite).
  New analyzer extension
  `scripts/diplo-analyze-askplus-20261104.js` (wraps
  diplo-analyze summarizeSeed; ADDS: maxDiplomacy over snapshots,
  endDiplomacy, diploPositiveDays, regionalPlusDays,
  seasonedDays, link shape per formed link — LEAD if primary
  'haven', BELONG if subordinate 'haven', LEAGUE if peer
  covenant/trade kind, else OTHER — tend counts, counter-answer
  counts, and a strict say-line recount for sense-testing).
  Diplo-b's instrument/analyzer files are NOT edited.
- PRIMARY METRIC + GO BAR (coordinator-set, judged strictly; a
  miss is NO-GO, never re-scored mid-run — doubts go under
  "metric review"): pilot GO iff proposals are attempted on
  >=6/8 seeds AND at least 3/8 seeds form >=1 link AND diplomacy
  standing >0 on >=3/8 seeds at end of run. "Diplomacy standing
  >0 at end of run" = endDiplomacy (final snapshot's
  standing.diplomacy) > 0. If pilot GOes, confirm on 12–16 fresh
  seeds (fresh band, same bar scaled: proposals >=75% of seeds,
  links >=3/12) before any landing claim. If pilot fails, KILL
  cleanly: policy file deleted, registry entry reverted, no
  game-code trace, evidence records the kill.
- BALANCED PANEL (§15): before/after through the balanced-panel
  schema — pseudo-panels built from the per-seed JSONs
  (diphold-arm pattern: `scripts/build-askplus-panels-20261104.js`,
  pseudo-policy 'askplus', paired seeds, before=competent,
  after=competent-askplus, same contract digest, same flags),
  compared via scripts/lib/balance-scorecard.js; the compare .md
  is attached to the evidence file. The panel is the instrument;
  the prereg bar above is the judge. A live balance-panel.js
  build was NOT used as the primary instrument because its child
  runs use sweep-compare's generic snapshot, which does not carry
  the diplo pipeline fields (proposal outcomes, link shapes,
  diplomacy series) this arm judges; the pseudo-panel compare
  covers the contract metrics (won / national / survival /
  communityLost) on paired seeds.
- SECONDARY (reported, never judged): scaleRank reach, wave reach
  (1–5), wave-5 faced, ready-5 days, survival distribution,
  death causes, proposal outcomes (accept/counter/decline/
  refused), link shapes, seasoning/regional+ days, polity
  fragility (diplomacy dropping to 0 after holding >0).
- SENSE-TESTING: read at least 2 transcripts (say-line samples
  from the corpus) and judge meaning/coherence — does a proposal
  read like people talking, do accept/decline consequences
  follow? Out-of-arm gaps go in the evidence file's findings
  section for the coordinator to append (this worker does NOT
  edit hidden_files files — they live outside the repo).
- HARD LIMITS (binding, honored): no src/js change of any kind;
  no gate/price/deed/win-price change; no judging-rule change;
  no wild-router, field-fight, national-standing, or
  veteran-counting code; no food-economy code. If a game-code
  fix is discovered to be needed, document it as a finding, do
  NOT implement it.
- PROOF: `scripts/test-askplus-20261104.js` must be green BEFORE
  any judged sim is reported: policy shape (competent daily +
  askplus courtship, no national/global answers), proposal
  gating (day/pantry/cooldown/subs-cap), shape classifier
  (LEAD/BELONG/LEAGUE/OTHER), diplomacy series extraction,
  GO-bar judge semantics (pass/fail edges), live harness smoke
  (snapshot shape, 2-day run, 0 instrument errors).
