# sim-chainclose-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0533Z (coordinator-assigned
worker sim-chainclose-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). Ranked next #1 by run fleshout-20261030T0420Z
(sim-chainfinish-a, evidence/2026-10-29/sim-chainfinish-a.md).
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default flip,
no gate change, no deed-bar move. This arm PRICES a target; building to
it is a later arm's job. No damage buff or gate move is proposed here
as a verdict.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft,
standing >= 100 gate; bands damage 35-95, HP 850-1500; a 4-6 round fight
for a godhood build). NO CANON-registered doc covers a chain-close
target specifically — the formula below is measurement-defined from the
recorders' own fields, stated exactly so it can be checked, and is NOT
canon. Governing canon rules: CANON.md "Monster encounters are fought,
not rolled" and the perception law (Steve 2026-10-28): tile-mate presence
is REPORTED from recorded state only, never fed into any decision.

## Band and substrate (binding)

- Seeds 75101-75116 (16, fresh band — NOT the chainfinish 8-seed band),
  180d death-aware horizon (dead villages stop simulating; +10d tail max
  per MEASUREMENT.md §10 — the harness's death-aware stop).
- Horizon why: 180d is the chainfinish horizon, kept so lifetimes are
  comparable in kind; the question is explicitly "inside a village
  lifetime", so the horizon must exceed observed village lifetimes
  (chainfinish host died day 86) without being a fixed 200d claim.
- Policy: scripts/policies/tableseat-nowait.js VERBATIM.
- Game substrate env (verbatim from the assignment):
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1.
- Recorder stack (instruments, reused verbatim from the chainfinish
  sweep, never edited): fieldparty-form-diag, w4dpr-diag, breakline-diag,
  tilejoin-diag, shoutrec-diag, joinendlines-diag, with env
  BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, JOINENDLINES=1. TILEJOIN=1
  disclosure carried from chainfinish: it enables the tilejoin prototype
  feed (tile mates only, perception-law compliant — never a roster
  feed), part of the reused instrument stack, NOT a new game change by
  this arm. This arm installs NO new engine wrap. The only new code is
  scripts/sweep-chainclose-a.js (a copy of the chainfinish sweep writing
  to perseed-chainclose-a, seeds 75101-75116), scripts/analyze-chainclose-a.js
  (a pure analyzer: reads corpus JSON, never touches game state), and
  scripts/test-chainclose-a.js (fixtures + determinism check).
- RE-DERIVATION CLAUSE (binding): this run's OWN corpus IS the baseline.
  Do NOT quote chainfinish's band numbers as current — not its meeting
  counts, not its chain prices, not its ~41/meeting illustration. Any
  comparison to chainfinish is a drift diagnostic only, never a GO/NO-GO
  leg. If this corpus diverges from chainfinish's, the divergence is
  reported, not forced.

## Universe and definitions (binding, fixed here)

UNIVERSE: every joined row with fieldparty wave == 4 AND channel ==
'field' (wild shape only), all callers, scholar-led flagged (never
silently pooled or dropped). Raid/other wave-4 rows are counted in a
one-line census and excluded from every judged table.

CHAIN (carried verbatim from chainfinish): a maximal run of meetings of
the SAME mid on the SAME seed, in day order, in which each meeting's
mHpStart equals the previous meeting's mHpLeft (wound continuity). A
meeting whose mHpStart differs from the previous same-mid meeting's
mHpLeft STARTS A NEW CHAIN. Zero-dealt meetings have mHpStart ==
mHpLeft trivially, so chain assignment across a zero meeting is by
continuity + order (disclosed wherever it matters). A chain is
"finished" only if a meeting ends with mHpLeft == 0 (a kill); no chain
is called finished by extrapolation.

VILLAGE LIFETIME: the seed row's `days` field (the day the village was
lost, or the 180d horizon if still alive). CENSORED flag: a seed alive
at the horizon has lifetime >= 180, so its runway and meetings-available
are LOWER BOUNDS and its close-target is an UPPER BOUND (the true
lifetime is longer, so the true target can only be lower). Censored
chains are flagged in every table; they are never silently treated as
dead on day 180.

LIFETIME AFTER FIRST WAVE-4 CONTACT (per contact seed): L_first =
days - firstWildDay, where firstWildDay is that seed's first wild
wave-4 meeting day. Reported for every contact seed (the lifetime
distribution leg); non-contact seeds report "no contact" (not zero).

PER CHAIN (all day counts are whole days):
- n = meeting count; firstDay, lastDay; inclusive span S = lastDay -
  firstDay + 1.
- Remaining HP R = the chain's last meeting's mHpLeft.
- Remaining runway after the chain's last meeting: T_rem = days -
  lastDay (>= 0; a lower bound when censored).
- CHAIN PACE p_chain = n / S meetings per day. Defined only for n >= 2
  (a single meeting has no re-meeting pace; its chain-pace target is
  explicitly UNDEFINED, not zero).
- Mean re-meeting gap g = mean of the day gaps between consecutive
  meetings of the chain (n >= 2 only). Note p_chain and g are two views
  of the same pace: p_chain = n / S uses the inclusive span (so the
  chainfinish eulogy illustration reproduces: 4 meetings over d55-d59,
  S = 5, p = 0.8/day); g averages the gaps (1, 1, 2 -> mean 1.33 days,
  i.e. ~0.75/day). Both are reported; the target uses p_chain.
- SEED PACE p_seed = (total wild wave-4 meetings on the seed) /
  (lastWildDay - firstWildDay + 1) meetings per day, defined whenever
  the seed has >= 1 wild meeting (span 1 when a single meeting).

## The close-target formula (binding — show the arithmetic)

MEETINGS AVAILABLE in the runway:
- At chain pace: M_chain = floor(p_chain * T_rem). Floor, so only whole
  meetings that fit the runway count.
- At seed pace: M_seed = floor(p_seed * T_rem).
- If M < 1, the target is INFINITY (no further meeting fits the runway
  at that pace — explicitly non-closable, never 0, never missing).

CLOSE TARGET (damage per meeting that closes the chain inside the
runway):
- C_chain = ceil(R / M_chain) if M_chain >= 1, else Infinity.
- C_seed = ceil(R / M_seed) if M_seed >= 1, else Infinity.
- Worked illustration (chainfinish numbers ONLY, to pin the arithmetic —
  NOT this run's data): R = 853, p_chain = 4/5 = 0.8/day, T_rem = 86 -
  59 = 27 days -> M_chain = floor(0.8 * 27) = floor(21.6) = 21 ->
  C_chain = ceil(853 / 21) = ceil(40.62) = 41 damage per meeting. This
  is the "~41/meeting" the assignment cites; this run re-derives its
  own number from its own corpus.

MEETINGS-PER-LIFETIME per chain (reported alongside the target):
- Observed meetings n; meetings available in the runway M_chain and
  M_seed; and, supplementary only (never judged), meetings available
  from the chain's first meeting to death at chain pace,
  M_first = floor(p_chain * (days - firstDay)).

THRESHOLD FRACTIONS (the distribution, not just a median): for each
threshold T in {20, 41, 60} damage per meeting, report:
- Chain-level: #{chains with C_chain <= T} / #{chains} (chain pace,
  primary), and the same at seed pace (secondary). Chains with
  C_chain = Infinity count as NOT closable at any threshold. Chains
  with undefined chain pace (n = 1) are excluded from the chain-pace
  denominator and reported separately (their seed-pace fraction is
  still computed).
- Seed-level: #{contact seeds with at least one chain C_chain <= T} /
  #{contact seeds}; plus the same denominator over all 16 seeds for
  context (contact rate bounds every seed-level claim).
- Also report the full distribution of C_chain (sorted list, median,
  min, max) — a median alone is not the deliverable.

BINDING-CONSTRAINT DIAGNOSIS (reported, NOT a scored leg): for each
chain, also compute C_daily = ceil(R / T_rem) (the target if the chain
met once per remaining day — the pace-free bound). Classification:
- If C_daily > 60: lifetime/HP binds even at a daily meeting — no
  meeting pace fixes it.
- Else if C_chain > 60: meeting pace binds (daily meetings would
  close it, observed pace does not).
- Else (C_chain <= 60): damage scale is the live question at the
  observed pace (the target is within the threshold band; whether
  observed damage reaches it is a separate, already-measured fact).
This classification is diagnostic language for the next arm, not a
verdict on this one.

JOIN EFFECTIVENESS (UNJUDGED observation only — not a scored leg, must
not move the verdict): for wild wave-4 meetings only, report total and
median leaderDealt vs allyDealt, joined share (calledHelp/joined
meetings), and ally share of dealt damage in joined fights. No
threshold, no GO/NO-GO, no lever judgment from it; it exists so the
next run can decide whether it deserves its own prereg.

## Primary metrics (binding)

- COMPLETENESS (blocks DIAG-GO): 16/16 valid seeds (days > 0) AND every
  recorder (fieldparty, w4dpr, breakline, shoutrec, tilejoin,
  joinendlines) errs 0 with overflow empty AND joins 100% (all six
  recorders index-aligned per seed; mid/vid/day match at every index;
  join errors 0) AND mDealt agreement breakline==w4dpr at every row
  AND shoutrec PREFIX-CONSISTENCY at every row (roundTotals entries
  non-decreasing and each <= the final total — the CORRECTED leg from
  chainfinish's metric review; final-equality is NOT demanded, because
  roundTotals is a morale-entry snapshot series that provably lags the
  final round).
- CLOSE-TARGET COMPUTABILITY (primary metric, blocks DIAG-GO): a
  close target (finite value or explicit Infinity with its M < 1
  reason) is computed for EVERY chain present, at seed pace for all
  chains and at chain pace for every n >= 2 chain; and the lifetime
  distribution (L_first per contact seed, days + censored flag per
  seed) is complete. Infinity is computable — it is a verdict of
  non-closability, not missing data. NaN, missing, or silently dropped
  chains fail this leg.
- DETERMINISM GATE (blocks DIAG-GO): one seed re-run into a scratch
  EVID dir; its row JSON byte-identical to the corpus row. Scratch
  dir removed after the diff.
- SENSE BAR (blocks DIAG-GO): ALL fought wild wave-4 meeting transcripts
  read end to end (w4dpr verbatim logs) when the wild wave-4 count is
  <= 40; if > 40, a stratified sample instead: ALL beast-zero wild logs
  + ALL leader-zero-ally-positive wild logs + 3 logs per fought outcome
  class present. The read set must include at least one transcript of
  each outcome class present in-band when that class has a log, and
  must include at least one transcript per chain when chains exist.
  Judgment is meaning/coherence/consequences (does the same beast
  return, do wounds persist in the story), not counts (SENSE-TESTING
  LAW).
- FIXTURE BAR (blocks judging): scripts/test-chainclose-a.js must prove,
  before the corpus is judged, on synthetic rows: the close-target
  arithmetic (including the ceil, the floor on meetings-available, the
  Infinity case at M < 1, the undefined chain-pace case at n = 1, the
  censored-flag carry), chain splitting on an HP break, pace variants
  (chain pace vs seed pace vs daily bound), threshold-fraction
  computation (Infinity counts as not closable, n = 1 excluded from
  the chain-pace denominator), and lifetime-after-first-contact
  computation.

## Verdict rule

- DIAG-GO iff COMPLETENESS PASS + CLOSE-TARGET COMPUTABILITY PASS +
  DETERMINISM PASS + SENSE PASS + FIXTURE PASS + a RANKED NEXT named
  with numbers.
- A completeness/computability/determinism/sense/fixture failure is
  DIAG-NO-GO.
- INSUFFICIENT-DATA (reported, never silently widened): if the band
  yields ZERO wild wave-4 meetings, the arm reports INSUFFICIENT-DATA
  with the counts and states the widen-or-close choice for the
  coordinator — seeds are NOT widened silently mid-run. Below-minimum
  n on raid/other shape is INSUFFICIENT-DATA for that shape, never GO.
  If chains exist but all are n = 1, chain-pace targets are
  INSUFFICIENT-DATA for chain pace (seed-pace targets still judge).
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.
- NO lever verdict: this arm does not propose a damage buff, gate move,
  or any game change. Its verdict is about the measurement (targets
  priced, distributions complete), not about building to the target.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (sweep + analyzer + fixtures), committed before the
   judged sweep is analyzed (fixture bar green first).
3. Sweep (16 seeds), determinism gate (one seed, scratch dir, removed
   after diff), sense transcripts read per the bar above.
4. Evidence evidence/2026-10-30/sim-chainclose-a.md with
   header-vs-result, per-chain close-target tables (n, span, pace,
   runway, meetings available, C_chain, C_seed, C_daily, binding
   class, censored flag), lifetime distribution, threshold fractions
   (chain-level and seed-level at 20/41/60), join-effectiveness
   observation (UNJUDGED, labeled), wall numbers (report-only, same
   upper-middle median convention as chainfinish), sense notes,
   ranked next, and findings-backlog items found (reported to the
   coordinator, NOT appended to sim-findings.md by this worker).
5. No src/js change, no push, no bump, no live verification. Report
   'branch ready for coordinator merge, pending ship' (coordinator
   merges; sibling loop B may move master under this branch — rebase
   cleanly at the end and re-run the proof; rebase conflict = FAIL
   LOUDLY, no force, no merge).

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js) via the shared
sim-harness (loadGame seeds Math.random BEFORE eval). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-chainclose-a (no jest is run by
this arm — the sweep/analyzer are plain node scripts).
