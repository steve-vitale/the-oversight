# sim-answermail-a — pre-registration (committed BEFORE any judged sim)

Run: fleshout-20261110T0615Z (Loop A). Arm: sim-answermail-a.
Branch: sim-answermail-a, rebased onto master a5d615880 (explicit SHA,
read in the main tree before rebasing). Worktree:
~/workspace/worktrees/sim-answermail-a. Previous 0415Z run died before
its workers did anything; this tree was clean at old base 91650a90f —
nothing adopted, start fresh.

## Stale-brief check (done before this prereg)

The named work — "answer the mail", sim-findings #2032 update, named by
sim-trustgrowth-b (evidence/2026-11-09/sim-trustgrowth-b.md) — has NOT
been landed:

- `scripts/policies/competent-linkdrive-b.js` (landed 2026-11-07,
  commit 7100412b8, GO on band 53001-53008) DOES answer the accord
  ('gift') and DOES tend — but it bundles answering with PROPOSING new
  links as-subordinate, answering raises in conversation, and honoring
  demands. Its GO verdict was driven by link formation (links 8/8,
  regional 8/8, lesser seats 4/8). It was never measured on band
  99101-99108, and its seasoning/polity numbers (3-5 links/seed
  seasoned, 0 polities, max 2 seasoned together) ride on links it
  proposed itself.
- `scripts/policies/leadcourt.js` (landed 2026-10-12) also answers the
  accord and tends weekly under its own pantry gates — but it ALSO
  proposes subordinates from day 25 and answers counters/national/
  global beats. It was never run as a judged lever on this band.
- The ISOLATED answer-the-mail effect — answer the pending beats and
  tend weekly, with NO proposing — has never been measured anywhere.
  On band 99101-99108 exactly one link forms per village (ladder
  stage-3 reward; secondlink-a, evidence/2026-11-10/sim-secondlink-a.md:
  raises are staged and lost, first link never comes from a raise).
  So the isolated question is well-posed here: does answering the mail
  season the one link the village actually gets, at what survival
  cost — and does the polity answer change (it should not: a polity
  needs 3 seasoned subs, and this arm proposes none).

Verdict of the check: PROCEED. This arm is the isolated measurement
the trustgrowth-b naming asked for, on the diag band.

## Canon

No canon doc covers trust, links, accords, or polity formation
(docs/CANON.md manifest: none listed; docs/SCALE.md covers polity
shapes, the 30-day season, trust-40 bar, and names
`state.pendingAccord` / `Game.answerAccord`). The verbs below are
grounded in code, verified by reading before this prereg:

- `answerAccord('gift')` (hierarchy.js ~921): 2,000 kcal -> +10 trust
  (scaled down if the pantry is thin; +2 floor even on an empty
  pantry). 'visit' +8, 'word' +4. Clears pendingAccord.
- `tendLink(linkId)` (hierarchy.js ~1147): 1,500 kcal -> +8 trust,
  once per week per link (tendedWeek). Refuses during their mourning
  (returns 0, charges nothing — grief is not bought off). Refuses an
  empty pantry (returns 0). LEAD links (primary haven) only; BELONG
  refuses; covenant/trade peers allowed.
- `answerRenegotiation(linkId, 'gift')` (hierarchy.js ~2033):
  1,500 kcal -> +8 trust (scaled if thin); the beat's answers land
  through the mourning choke for succgrace beats (mourningUntil
  restored after). 'visit' +5 (speaker away 2 days), 'wait' = the
  silence answers now. Unanswered beats expire after 7 days
  (_renegotiationTick) at -6 (trustgrowth-b: 7 silences band-wide).
- `answerDemand(linkId, true)` (hierarchy.js ~1512): honor a pending
  demand (linkdrive-b uses exactly this call).
- Seasoned (hierarchy.js `_linkSeasoned`): active, 30+ days old,
  trust 40+. `polityOf('haven')` needs >= 3 seasoned subordinates.

No win price, deed gate, readiness bar, or readyDemand number moves
in this arm. No src/js changes are planned (policy-only lever, like
linkdrive-b).

## The lever (the build)

New policy `scripts/policies/competent-answermail-a.js` — competent
VERBATIM, plus a daily answer-the-mail step after `competent.daily`:

1. `pendingAccord` present -> `Game.answerAccord('gift')`.
   Unconditional (leadcourt-shaped; the engine prices a bare pantry
   honestly with a scaled gain).
2. Each active LEAD link (primary 'haven'): if `link.tendedWeek !==
   week` and pantry > 20,000 kcal -> `Game.tendLink(link.id)`.
   Leadcourt's gate. tendLink itself refuses mourning weeks at no
   cost, so no separate mourning check.
3. Each active link with `link.pendingRenegotiation` ->
   `Game.answerRenegotiation(link.id, 'gift')`.
4. Each active link with `link.pendingDemand` ->
   `Game.answerDemand(link.id, true)` (honor; counted separately).

Explicitly NOT in this arm: proposing links (no `proposeLink` call
anywhere — the policy must never form a link), answering counters,
answering national/global beats, tribute manipulation, arrears
calls/forgiveness. The arm answers mail that arrives; it does not
write new mail.

## Design (staged, §§9-12, 14-15)

- Band: seeds 99101-99108 — the trustgrowth/standaccum band, RE-USED
  deliberately (paired before/after on identical seeds). Re-use is
  RECORDED here, not claimed as freshness.
- Policies: `competent` (baseline) vs `competent-answermail-a`
  (armed). Default env. 150d death-aware horizon (dead villages stop
  simulating; +10d tail max per the loop's death-aware rule).
- Instruments (reused verbatim, zero src/js):
  - `scripts/trustgrowth-instrument-20261109.js` v2 (property-setter
    event log + seq intervals + _trustGain wrap; cause map already
    classifies tend / accord-gift / renegotiation-answer /
    demand-honor).
  - Driver `scripts/answermail-driver-20261110.js` modeled on
    trustgrowth-driver-20261109.js (same fields, same snapshot
    discipline) + linkdrive-driver-20261107.js (POLICY switch,
    `teleDeaths` from `result.samples.deaths`, policy STATS capture).
    Per-seed JSON to `evidence/2026-11-10/perseed-answermail-a/`.
  - Analyzer: `scripts/trustgrowth-analyze-20261109.js` v2 verbatim
    for attribution/reconciliation, plus new
    `scripts/answermail-analyze-20261110.js` for the verdict
    (seasoning counts, polity counts, starvation, medians).
  - Balanced panel (§15): askplus pattern per
    build-linkdrive-panels-20261107.js (pseudo-policy, paired seeds,
    balance-scorecard compare). Panel is the instrument; this prereg
    is the judge.
- Proof: `scripts/test-answermail-a.js` — fixture proofs for each
  verb (accord gift called once, tend gate + mourning refusal +
  once-per-week dedup, renegotiation gift, demand honor, NO
  proposeLink call) + a live harness smoke leg. Green BEFORE any
  judged sim.

## Primary metric + GO threshold

PRIMARY: seasoned links per band — a link that is active, age >= 30
days, AND trust >= 40 on the same day (the instrument's seasoned
window; cross-checked against `_linkSeasoned` semantics). Counted per
link, band-wide (one link per village on this band, so 8 max).

- Control (trustgrowth-b, plain competent): 1/8 seasoned (99104
  only, 28 days, trust 42-45).
- GO: armed leg seasons >= 5/8 links.
- NO-GO: armed leg seasons <= 4/8.

## Fidelity gates (run-invalid, not NO-GO — a failed gate means the
## instrument or the policy did not do what this prereg says, and the
## run is re-run or re-briefed, not judged)

- Accord answers >= 8 on the armed leg (one per first link; more if
  a re-link restages the accord).
- Tend calls > 0 band-wide on the armed leg.
- Renegotiation silences = 0 on the armed leg (every staged beat
  answered; 'wait' counts as answered-with-silence only if the
  policy ever calls it — it never does).
- Instrument errors = 0 on all 16 legs.
- Analyzer reconciliation 100%: every trust event attributed, 0
  unattributed residue, on both legs.

## Cost bar (scalemetric, from the run brief)

Starvation deaths counted from `teleDeaths` (`cause ===
'starvation'`), exactly as linkdrive-b did:

- Armed starvation total <= control starvation total + 2, AND
- Armed starvation on arm-only seeds (seeds where control
  starvation = 0) <= 2, AND
- Median survival armed >= 0.8 x control median.

GO requires the primary threshold AND the cost bar. A primary pass
with a failed cost bar is NO-GO.

## Secondary (reported, NOT judged)

- Polity formation: EXPECTED 0 on both legs — a polity needs 3
  seasoned subordinates and this arm proposes no links, so the band
  can hold at most 1 seasoned link. If a polity somehow forms, that
  overturns the secondlink-a link-count finding and is reported
  loudly. The polity half of the question is answered by the
  blocked-by-link-count finding, not by a GO bar.
- Wall numbers every run: national / table / wins, wave-4 unlocks,
  wave-5 unlocks, median survival, seasoning rate, polity formation.
- Per-link peak trust, accord/tend/renegotiation/demand counts by
  cause (analyzer attribution), aid + tribute totals (the control's
  only growers, for the before/after).

## Pilot gate + confirm

- PILOT: 8 seeds before/after (16 legs). Kill at pilot on any miss
  of the primary or the cost bar — never run 12-16 seeds on a failed
  pilot.
- CONFIRM (only on pilot GO): 12-16 seeds on a FRESH band, checked
  against the seed-band freshness rule before assignment; the fresh
  band is named in a prereg amendment before the confirm runs.

## Control-reproduction diagnostic (not a gate)

The control leg is expected to TRACK trustgrowth-b v2 (days
132/58/132/150/109/87/150/62; standings
270/199/199/199/150/199/199/25). Master has moved since that run
(spearvolley-b + volleysoft-b landed 2026-11-10, among others), so
drift is possible: any deviation is REPORTED with the master delta
and does not itself fail the run. The paired before/after on current
master is the judge, not the old numbers.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

If the primary proves wrong (e.g. the accord's +10 at birth seasons
links before tending can matter, making the tend half
unattributable), that goes here after judging, and the revision is
proposed for the next run — never re-scored mid-run.
