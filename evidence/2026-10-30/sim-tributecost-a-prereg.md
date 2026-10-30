# sim-tributecost-a prereg — tribute-cost recorder + paired re-run + zero-feasibility

Run: fleshout-20261030T1427Z, arm sim-tributecost-a, axis scale-onramp.
Finding under test: #1540 (run fleshout-20261030T1315Z, arm sim-leantrade-a,
evidence/2026-10-30/sim-leantrade-a.md, DIAG-GO): the leanlink-vs-competent
paired decomposition (seeds 9911–9918, 180d) showed national reach is NOT
shown to be bought with village survival — but tribute kcal actually paid
was NOT quantifiable from that corpus (no pantry series, no
tribute-payment events, no timestamped death log, no population series),
and leanlink 9912 (fewer deaths than its surviving competent twin, still
lost) stays unexplained.

## Canon read first

- docs/CANON.md, then docs/SCALE.md (courtship/national canon).
- No canon doc covers tribute-payment instrumentation specifically. The
  mechanism below comes from src/js/hierarchy.js, read before writing
  this prereg — not invented:
  - LEAD courtship (leanlink's proposals, `asSubordinate: false`):
    Haven is PRIMARY; the subordinate pays Haven
    (`tributeKcalPerWeek`, courtship terms 4,000 kcal/week). Tribute on
    a LEAD link is Haven INCOME, engine-abstracted from the
    subordinate's own pantry and arriving as real spoil-dated pantry
    grain (x1.25 while national). It is not Haven pantry outflow.
  - COUNTER path: a mid-band courtship score (35–54) stages a counter
    on FIXED terms — Haven subordinate, tribute 5,000 kcal/week
    (LEAD-origin; 6,000 floor for subordinate-origin offers).
    Accepting forms the link on those terms. Leanlink answers counters
    (sweeten if pantry > 25,000 kcal, else accept).
  - Haven-as-subordinate tribute is paid ONLY through the `payTribute`
    verb (real pantry food out, `tributePaidKcal` accumulation,
    idempotent per week). NO competent-derived policy calls it (grep:
    only belongseek / scalecourt / oracle call `payTribute`; competent
    and leanlink never do). Unpaid Haven-subordinate weeks settle at
    the week boundary as arrears (+trust −6), not as pantry outflow.
  - Formation floors: `proposeLink` uses
    `opts.tributeKcalPerWeek || 4000` (counter staging and `_formLink`
    the same). A proposal of 0 therefore reads as 4000, not 0.
  - Courting costs that ARE real pantry outflow in leanlink: counter
    sweeteners (1,500 kcal, kept even on refusal) and accord gifts
    (2,000 kcal via `answerAccord('gift')`, actuals by pantry removal).
- Code-derived EXPECTATION to be confirmed or denied by measurement
  (not a verdict in advance): Haven-paid tribute in the leanlink
  column should be ~0 by construction (no `payTribute` calls), and the
  cost side of flipped (Haven-subordinate) links should appear as
  arrears + trust decay + link snaps, while LEAD links appear as
  pantry income. If the recorder shows anything else, the expectation
  is wrong and the evidence says so.

## Scope guard (binding)

- ZERO src/js changes, ZERO default flips, ZERO policy-default changes.
  Recorder + policy-side instrumentation only (a sweep driver, a
  proof test, an analyzer, evidence files). The leanlink and competent
  policies run byte-identical to the vests-b corpora: same files, same
  env gates (LEANLINK=1 for the leanlink column only, separate
  processes per column).
- The recorder NEVER feeds a roster, list, census, or link snapshot
  into any villager decision (perception law): it reads game state
  only, wraps verbs for event logging only, and never calls a game
  verb itself. `hierarchyState()` / pantry sums / roster reads are
  pure reads already used by policies.
- Base pin (HEAD at prereg time): 58744e3657caa83df70fee045b8ddaae637b17ba.
  NOTE: sibling loop B's landing 5857590ee is NOT an ancestor of this
  base (base predates it). Before finishing, rebase onto current
  master and re-run the proof test; on conflict, FAIL LOUDLY rather
  than forcing anything.

## The recorder (scripts/sweep-tributecost-a.js)

Per seed, per column, daily (sampleEvery=1 — the vests-b corpus used
sampleEvery=10, which is too sparse for a cost series):

1. Per-day pantry kcal series: runDays `samples.pantry` (daily
   [day, kcal]) PLUS an independent daily snapshot in the recorder
   (same pantry-sum formula as leanlink.js) so a harness/sample
   regression shows up as a mismatch, not a silent gap.
2. Tribute-payment events, both directions, with amount, day,
   recipient/link:
   - Haven-paid: a wrapper on `Game.payTribute` (installed before
     runDays, chaining like the vests-b tele wrapper) logging every
     call, its return (actual kcal removed), and the link.
   - Haven-received / waived / short: a DAILY link-state snapshot
     (`hierarchyState()` per link: id, primary, subordinate, kind,
     status, trust, tributeKcalPerWeek, tributePaidKcal, tributeWeek,
     tributePaidWeek, arrears, day formed) PLUS the link's new
     `history` entries (kind + note, capped at 40 by the engine, so
     daily capture is what makes them lossless). Arrivals are
     identified from history `tribute` notes + pantry-series movement,
     never by attributing individual pantry kcal (see metric review).
   - Courting outflow (the cost side leanlink actually pays):
     wrappers on `Game.proposeLink`, `Game.answerCounter`,
     `Game.answerAccord` logging the call, its args, and the pantry
     kcal before/after, so sweetener (1,500) and accord-gift (2,000
     nominal, actuals by removal) costs are measured, not assumed.
3. Timestamped death log: runDays live capture (`samples.deaths`:
   day, kind, who, cause, player flag) — the uncapped capture, not
   the 300-event telemetry ring. Cross-checked against the aggregate
   `deaths` field (counts must match; see GO bar 2).
4. Population series: runDays `samples.pop` (daily roster count)
   PLUS a daily roster-set snapshot: joiner events (new roster id +
   day) and leaver events (vanished roster id + day + whether that id
   appears in the death log). A leaver with no death-log entry is
   reported as unexplained, never assumed dead. Bearer succession
   (scholar identity change with roster membership unchanged) is NOT
   a joiner/leaver event.

Determinism gate: the recorder sweep re-run on the pilot seeds must
be byte-identical (no wall-clock timestamps in outputs), and the
recorder must not perturb outcomes (see GO bar 3).

## The tribute-isolating arm (CONTINGENT, decision pre-registered)

A same-seed leanlink-courting variant with tribute ZEROED, policy-side
only. Feasibility is decided FIRST by a behavioral proof test
(scripts/test-tributecost-zero.js), BEFORE any isolating sweep:

- Leg Z1: `_formLink` with `tributeKcalPerWeek: 0` must yield a link
  whose tribute is 0 for zeroing to be possible at formation.
- Leg Z2: a staged counter from a 0-tribute proposal must carry
  tribute 0 (not the fixed 5,000 terms), and accepting it must form
  a 0-tribute link.
- If EITHER leg shows a policy path to a genuine 0 (not a negative
  tribute, not a monkey-patched engine method, not a game-code change),
  the isolating sweep is designed from that path and its own GO bar
  is written before it runs.
- If BOTH legs show the engine floors tribute (4000 at formation,
  5000 on counters — the `|| 4000` defaults above), the isolating leg
  STOPS here per the task: no game-code change, no default flip, no
  negative-tribute hack, no engine-method rewrite from policy code.
  The finding is reported as DIAG scope: tribute cannot be zeroed
  from policy code, so the cost of paying cannot be isolated that
  way; the recorder's Haven-paid ≈ 0 measurement (if confirmed) is
  itself the isolation — leanlink already pays ~nothing, and the
  flipped-link cost is arrears/decay, not outflow.
- Follow-ups NOT run in this arm (named for the backlog, not executed):
  a walk-away-from-counters variant (never accept subordinate terms)
  and a pay-in-full variant (call `payTribute` weekly on
  Haven-subordinate links). Both are legitimate policy variants, but
  neither is "tribute zeroed", and the task stops the isolating leg
  at the zero-feasibility verdict.

## Pilot (judged): seeds 9911–9918, competent vs leanlink, 180d

- Horizon: 180 days, DEATH-AWARE (runDays ends on village-lost /
  over; no fixed-200d tail). Same horizon as the vests-b corpus being
  re-measured, so per-seed reproduction is checkable.
- Seeds: 9911, 9912, 9913, 9914, 9915, 9916, 9917, 9918. Policies:
  competent (LEANLINK unset) vs leanlink (LEANLINK=1, separate
  processes). One shared recorder, identical harness call.
- Confirm band (ONLY if pilot GO): fresh seeds 9921–9930 (10 seeds),
  same columns, same horizon, same recorder. If the pilot fails its
  bars, STOP per the pilot gate — no confirm sweep on an invisible
  or broken effect.

## Primary metric (binding) + GO threshold (DIAG-GO)

GO iff ALL of:

1. All 8 pilot seeds complete in both columns (a seed ending early
   by village-lost still counts — death-aware horizon, end state
   recorded).
2. Recorder completeness on all 16 pilot runs: pantry series present
   for every loop-day (one post-daily snapshot per runDays iteration;
   count == result.days, all values finite and non-negative);
   TIMING CORRECTION (pre-sweep, no sweep has run): the recorder's
   pantryDaily snapshots land at policy.daily time (pre-sleep) while
   the harness samples.pantry lands at loop-end (post-sleep +
   driveContests), so the two series are NOT expected byte-equal —
   they are reported side by side with their timings, and their max
   abs daily gap is reported as a diagnostic (sleep-time and contest
   flows explain small gaps; a large unexplained gap is investigated,
   not gated). Death-log check: the driver's INDEPENDENT tele capture
   count (teleDeathCount) == harness live-capture count
   (deathLogCount) on every run, and the aggregate `deaths` field
   sums to deathLogCount; population series present daily with
   joiner/leaver events derived; link snapshots present on every day
   a link is active.
3. Non-perturbation: recorder rows match the committed vests-b corpus
   rows on endReason, national, and table for 16/16 cases, and on
   game days exactly for ≥14/16 (any mismatch investigated and
   attributed; a recorder-caused mismatch is NO-GO, not a footnote).
4. Tribute quantification delivered, not gap-stated: per column,
   totals for Haven-paid tribute kcal (payTribute events), tribute
   income events (subordinate→Haven arrivals incl. waivers and
   shorts, from link snapshots + history), courting outflow
   (sweeteners + accord gifts, actuals), and end-state arrears per
   flipped link — plus per-seed tables for the 5 lost seeds
   (competent 9913; leanlink 9911, 9912, 9913, 9918).
5. Zero-feasibility verdict delivered with the proof test green:
   either a genuine policy path to 0 (with the isolating sweep
   designed) or the stopped-leg finding above.
6. The 9912 paradox addressed from the new series: the population
   series + death log for leanlink 9912 vs competent 9912 must show
   WHY the leanlink village fell with fewer deaths (final-decline
   shape: roster trajectory, last-14-days deaths, joiners) or state
   explicitly that the series still does not explain it.

A miss on any leg is NO-GO. No re-scoring mid-run; doubts go under
"metric review" in the evidence file.

## Balanced panel (§15)

- Real balance-panel driver panels per column (seeds 9911–9918,
  days 180, LEANLINK=1 for the leanlink panel process only):
  sim-tributecost-a-panel-competent / sim-tributecost-a-panel-leanlink
  (panel.json.gz committed; cases/ caches deleted, never committed).
- Panel compare via `balance-panel.js compare`, attached as
  sim-tributecost-a-panel-compare.md/.json. EXPECTED decision
  "invalid" (structural, vests-b precedent: the compare tool expects
  before/after panels with IDENTICAL policy sets — a code change
  under the same policies — while this pair differs BY DESIGN).
  Comparing a panel to itself to force a valid decision would be a
  fabricated artifact and is NOT done. The judge for this pair is
  the prereg recorder thresholds above; the two valid single panels
  are the §15 instrument artifacts. Panel rows must reproduce the
  recorder rows on days, wave, rank, national, table, entered, won
  (vests-b precedent: exact).

## Sense-testing (SENSE-TESTING LAW)

Read ≥1 trajectory end to end from the NEW corpus (not counts only):
the leanlink 9912 final decline — last-14-days death log +
population series + pantry series + link/arrears state — and judge
whether the village's fall reads as a coherent story (what killed
the last villagers, what the polity was doing while it fell) or as
an incoherent one. Quote the series, not just the totals.

## Wall numbers (every band)

Report for every band: national / table / wins, wave 1–5 reach,
median + max survival, village-lost count, death-cause shares,
four-realm formation (maxRank global count), and the tribute totals
from the recorder (paid / received / arrears / courting outflow).

## Metric review (pre-filled, to be completed at run end)

- The pantry series measures LEVELS, not flows: tribute income is
  identified from link snapshots + link-history notes + pantry
  movement around week boundaries, not by tracing individual pantry
  kcal (tribute grain is deposited as ≤500-kcal pieces among other
  food; per-kcal attribution would be invented). Arrival totals are
  therefore link-history-grounded counts, and any week where the
  history cap (40 entries/link) may have dropped a note is flagged.
- The death log is the harness live capture; the aggregate `deaths`
  field is derived from the same capture in this driver, so the
  count cross-check guards recorder loss, not harness truth. A death
  the engine never telegraphed as a `death` tele event is invisible
  to both — population-series leavers with no death-log entry are
  the backstop that catches that class.
- Roster-set joiners/leavers are identity observations, not reasons:
  a joiner is a new roster id, not proof of a join event's cause, and
  a leaver without a death entry is unexplained, not "left".
- The panel compare is expected invalid by structure (see above);
  that invalidity is a property of the comparator, not of the data,
  and is recorded here rather than repaired by relabeling policies.

## Outputs

- scripts/sweep-tributecost-a.js (recorder driver)
- scripts/test-tributecost-a.js (proof: recorder completeness on
  fixtures + determinism: sweep run twice byte-identical on 1 seed
  per column, or the full pilot if fast enough)
- scripts/test-tributecost-zero.js (proof: zero-feasibility legs
  Z1/Z2 above)
- scripts/analyze-tributecost-a.js (paired analysis: tribute
  totals, 9912 decomposition, wall numbers, panel-row cross-check)
- evidence/2026-10-30/sim-tributecost-a-corpus-competent.json +
  sim-tributecost-a-corpus-leanlink.json (+ per-seed dirs)
- evidence/2026-10-30/sim-tributecost-a-panel-competent/panel.json.gz
  + sim-tributecost-a-panel-leanlink/panel.json.gz
  + sim-tributecost-a-panel-compare.md/.json
- evidence/2026-10-30/sim-tributecost-a.md (final evidence narrative
  + metric review section; confirm band appended if GO)
