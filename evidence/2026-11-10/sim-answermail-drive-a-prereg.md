# sim-answermail-drive-a — pre-registration (committed BEFORE any judged sim)

Run: fleshout-20261110T1215Z (Loop A). Arm: sim-answermail-drive-a.
Branch: sim-answermail-drive-a. Base: 75f37618573fcf155afa92d72330c147d33a1fdc
(explicit SHA, verified `git rev-parse HEAD` in the worktree at spawn).
Worktree: ~/workspace/worktrees/sim-answermail-drive-a. Axis: scale-onramp /
winnability chain (the diplomacy half of the standaccum-b split, sim-findings
#2032, blank 2 — "the game answering its own mail").

## The question

Trust grows ONLY on aid + tribute under competent play (trustgrowth-b), and
the first-gesture accord (+4..10) sits pending from formation day to death
on all 8 trustgrowth seeds. The answermail-a policy (landed 5db4f6fef, GO
pilot + confirm) proved a competent PLAYER who answers the mail seasons
links: seasoned 13/15 armed vs 2/15 control on the confirm band. But that
arm is policy-side — the sim's player bot doing the answering. The game
itself, under plain competent play, still lets the accord sit unanswered.

This arm asks: does a VILLAGER-side auto-answer — the village
leader/leadcourt answering pending accords and tend offers on the village's
behalf, direct engine answer, no conversation turns — raise seasoned links
without the player sitting down?

## Stale-brief check (done before this prereg)

- `competent-answermail-a.js` (landed 5db4f6fef) answers the accord, tends,
  answers renegotiations and demands — but ONLY as a policy: the player bot
  calls the verbs in `policy.daily`. Under plain competent the engine never
  answers anything. The engine-side drive has never been built or measured.
- `competent-linkdrive-b.js` (landed 2026-11-07) also answers, but bundles
  answering with PROPOSING new links and answering raises in conversation.
- `leadcourt.js` (landed 2026-10-12) answers and tends, but also proposes
  from day 25 and answers counters/national/global beats.
- No engine hook answers pending accords, tends, renegotiations, or demands
  today: `hierarchyDaily()` runs `linkTick`, `_renegotiationTick`,
  `_checkRegional`, `_checkNational`, `_checkGlobal` and the rumor/news
  beats — no answering step exists (verified by reading hierarchy.js:3838).

Verdict of the check: PROCEED. The villager-side drive is unbuilt and
unmeasured; this arm builds the smallest version and measures it in
isolation (no proposing, same verbs and gates as answermail-a, different
actor).

## Canon

- docs/SCALE.md (read): polity = one primary + >= 3 SEASONED subordinates;
  seasoned = 30+ days old AND trust 40+; the first gesture stages at link
  formation (gift 2,000 pantry kcal / send the representative / cold ink)
  while the Regional Dawn waits for a 21+ day bond; national needs regional
  >= 30 days old. The scale doc does NOT cover who answers the mail — no
  canon doc covers a villager-side answering drive. The drive is a new
  engine behavior, not a canon restoration; this is stated here, not
  invented as canon.
- docs/CANON.md manifest: no doc covers trust, links, accords, or polity
  formation beyond SCALE.md.
- Code-grounded facts (verified by reading before this prereg):
  - `answerAccord('gift')` (hierarchy.js ~921): 2,000 kcal -> +10 trust
    (scaled down if the pantry is thin; +2 floor even on an empty pantry).
    'visit' +8, 'word' +4. Clears pendingAccord.
  - `tendLink(linkId)` (hierarchy.js ~1147): 1,500 kcal -> +8 trust, once
    per week per link (tendedWeek). Refuses during their mourning (returns
    0, charges nothing). Refuses an empty pantry (returns 0). LEAD links
    (primary haven) only; BELONG refuses; covenant/trade peers allowed.
  - `answerRenegotiation(linkId, 'gift')` (hierarchy.js ~2033): 1,500 kcal
    -> +8 trust (scaled if thin); succgrace beat answers land through the
    mourning choke (mourningUntil restored after). Unanswered beats expire
    after 7 days at -6.
  - `answerDemand(linkId, true)` (hierarchy.js ~1512): honor a pending
    demand (linkdrive-b uses exactly this call).
  - `representative()` (hierarchy.js ~520): the best-standing roster member
    — who Haven IS. `_availableRepresentative()` (hierarchy.js ~544): the
    best-standing member who can actually walk out — not node-travel away,
    not on another ledger, not traveling with the player, not
    mid-conversation — and NEVER the player. This is the drive's answerer:
    a living villager, never the scholar.
  - `hierarchyDaily()` (hierarchy.js ~3838) is the engine's daily hierarchy
    tick, called from `membershipDaily`. The drive hooks there: the game
    answers its own mail on its own daily tick, whatever policy drives the
    player.

## The lever (the build)

GAME-CODE HOOK — additive-only, default-OFF (flagged prominently, as the
brief requires). A new engine method `_answermailDriveDaily()`, called once
from `hierarchyDaily()` inside the same try/catch discipline as its
siblings. It fires ONLY when `ANSWERMAIL_DRIVE === '1'` in the node
environment (`typeof process !== 'undefined' && process.env &&
process.env.ANSWERMAIL_DRIVE === '1'` — the established precedent in
src/js, e.g. FOODLEVER_R5, EXPOSURE, CAPDRAW2). In the browser `process`
is undefined, so the drive can never fire there: shipped play is
byte-identical with the drive off, and the player still answers the mail
herself. No win price, deed gate, readiness bar, readyDemand number, or
seasoning rule moves. No existing verb changes: the hook calls the same
`answerAccord` / `tendLink` / `answerRenegotiation` / `answerDemand`
verbs a player clicks, with the same pantry costs.

Per daily tick, when the flag is on:

1. Answerer: `this._availableRepresentative()`. If none is available (no
   living villager can walk out — bench empty, all away/engaged/loaned),
   NOTHING is answered that day and the day is counted as blocked
   (`noAnswerer`). This is the villager-side failure mode, measured, not
   assumed away: leaders can die, and a dead bench means unanswered mail.
2. `pendingAccord` present -> `Game.answerAccord('gift')` (unconditional;
   the engine prices a bare pantry honestly with a scaled gain).
3. Each active LEAD link (primary 'haven'): if `link.tendedWeek !== week`
   and pantry > 20,000 kcal -> `Game.tendLink(link.id)` (leadcourt's gate;
   tendLink itself refuses mourning weeks at no cost).
4. Each active link with `link.pendingRenegotiation` ->
   `Game.answerRenegotiation(link.id, 'gift')`.
5. Each active link with `link.pendingDemand` ->
   `Game.answerDemand(link.id, true)` (honor; counted separately).

The hook records its own stats on `state.answermailDrive` (created only
when the flag is on): accordAnswers, tends, tendsBlockedPantry,
renegotiationAnswers, demandAnswers + demandKinds, blockedDays
{noAnswerer}, answerers {villagerId: count}, firstAnswerDay per link,
errors. The driver reads these stats per seed; the control leg must show
NO `state.answermailDrive` stats object at all (drive-off proof).

POLICY INSTRUMENT — new policy
`scripts/policies/competent-answermail-drive-a.js`: competent VERBATIM.
The policy itself NEVER answers mail — that is the point. It exists so the
driver has a named instrument for the armed leg, documents the
ANSWERMAIL_DRIVE=1 env instrument, and exposes stats readers. The armed
leg is `competent` + `ANSWERMAIL_DRIVE=1` in the driver environment; the
control leg is `competent` with the env unset.

Explicitly NOT in this arm: proposing links (no `proposeLink` call
anywhere — the policy must never form a link and the hook must never form
one), answering counters, answering national/global beats, tribute
manipulation, arrears calls/forgiveness, new say lines (the verbs' own
lines already read as the village acting — see the sense-test note; any
named-carrier line is a follow-up feel change, not this arm). The arm
answers mail that arrives; it does not write new mail.

How this differs from answermail-a (the isolated question): same four
verbs, same pantry gates — but a different ACTOR (the engine's daily tick,
not the player bot's daily step), a different GATE (a living available
villager must exist), and different TIMING (the accord staged mid-day is
answered at the next daily tick, not the same day). The secondary metric
(accord-pending days) measures the timing difference; the blocked-days
count measures the answerer gate. If the armed leg seasons like
answermail-a did, the game can answer its own mail. If it seasons less,
the gap IS the finding (bench deaths, dawn timing, or both).

## Design (staged, §§9-12, 14-15)

- Band: seeds 150201-150208 — FRESH. Freshness check (local_seed_band_freshness
  skill): `git grep` for 150201..150208 over evidence/ and scripts/, all
  dated prereg .md files, and filenames (`find evidence scripts
  -name "*15020[1-8]*"`); plus `git log --all -S "150201"`. Result: NO
  prereg, dated .md, script, or filename names any seed 150201-150208. The
  only content hits are coincidental substrings inside unrelated corpora —
  a float tail (`592.060315150201` kcal drawn, tendsick-a corpus) and
  cumulative counters (e.g. `depriKcalCum: 150206`). None is a seed. The
  confirm band 150209-150216 was checked the same way over dated .md
  files: also clean. Loop B uses 140201-140216 — not used here.
- Policies: `competent` (baseline, drive OFF) vs competent +
  `ANSWERMAIL_DRIVE=1` (armed, drive ON). Default env otherwise. 150d
  death-aware horizon (dead villages stop simulating; +10d tail max).
- Instruments (reused verbatim, zero new src/js in the instruments):
  - `scripts/trustgrowth-instrument-20261109.js` v3 (property-setter event
    log + seq intervals + _trustGain wrap with the cap-phantom fix).
  - Analyzer: `scripts/trustgrowth-analyze-20261109.js` v3 verbatim for
    attribution/reconciliation, plus a new
    `scripts/answermail-drive-analyze-20261110.js` for the verdict
    (seasoning counts, polity counts, starvation, medians, accord-pending
    days, drive stats).
  - Driver: new `scripts/answermail-drive-driver-20261110.js`, modeled on
    `answermail-driver-20261110.js` (same fields, same snapshot
    discipline, POLICY=competent|drive, RUN names, OUTDIR). Per-seed JSON
    to `evidence/2026-11-10/perseed-answermail-drive-a/`. The driver sets
    ANSWERMAIL_DRIVE=1 only for the armed invocation (separate node
    process per leg, so no env leakage between legs).
  - Balanced panel (§15): same askplus pattern as answermail-a
    (pseudo-policy, paired seeds, balance-scorecard compare), built after
    the pilot verdict. Panel is the instrument; this prereg is the judge.
- Proof: `scripts/test-answermail-drive-a.js` — RED->GREEN where
  applicable: (a) hook OFF by default (env unset, and `process`
  undefined in the fake browser-shaped Game) — no verb called, no stats
  object created; (b) hook ON with an available rep — accord gift called
  once, tend gated on pantry > 20,000 and once-per-week, renegotiation
  gift, demand honor; (c) hook ON with NO available rep — nothing
  answered, blocked day counted; (d) hook never proposes; (e) live
  harness smoke leg (one pilot seed, 60d, /tmp) — drive stats present,
  accord answered, instrument errors 0. Green BEFORE any judged sim.

## Primary metric + GO threshold

PRIMARY: seasoned links per band — a link that is active, age >= 30 days,
AND trust >= 40 on the same day (the instrument's seasoned window;
cross-checked against `_linkSeasoned` semantics). Counted per link,
band-wide (one link per village expected on this band, so 8 max).

- GO candidate: armed seasons >= 3/8 AND control seasons <= 1/8.
- NO-GO: armed seasons <= control seasons.
- Anything else (e.g. armed 2/8 vs control 0/8) is INCONCLUSIVE — reported
  as such, NOT a GO candidate, and NOT confirmed. No re-scoring.

The bar is deliberately lower than answermail-a's (>= 5/8 on a re-used
band): this is a fresh band with an unknown control rate, and the drive
carries two real handicaps answermail-a did not (answerer gate, dawn
timing). The pilot's job is to say whether the villager-side drive works
at all, not to repeat answermail-a's 8/8.

## Fidelity gates (run-invalid, not NO-GO — a failed gate means the
## instrument or the hook did not do what this prereg says, and the run
## is re-run or re-briefed, not judged)

- Accord answers == links formed on the armed leg (every staged accord
  answered by the drive), counted from `state.answermailDrive` stats and
  cross-checked against the trust-event log.
- Tend calls > 0 band-wide on the armed leg.
- Renegotiation silences = 0 on the armed leg (every staged beat answered).
- Instrument errors = 0 on all 16 legs.
- Analyzer reconciliation 100%: every trust event attributed, 0
  unattributed residue, on both legs.
- Drive-off proof: `state.answermailDrive` is absent on all 8 control legs
  (the hook never ran, the stats object was never created). A control leg
  WITH drive stats invalidates the run.
- The policy file contains no `answerAccord` / `tendLink` /
  `answerRenegotiation` / `answerDemand` / `proposeLink` call (the player
  bot answers nothing — the engine does). Enforced by a proof check that
  greps the policy source.

## Cost bar (scalemetric, from the run brief)

Starvation deaths counted from `teleDeaths` (`cause === 'starvation'`):

- Armed starvation total <= control starvation total + 2, AND
- Armed starvation on arm-only seeds (seeds where the control leg starved
  0) <= control starvation total, AND
- Median survival armed >= 0.8 x control median (standard median).

GO candidate requires the primary threshold AND the cost bar. A primary
pass with a failed cost bar is NO-GO.

## Secondary (reported, NOT judged)

- Accord-pending days (formation day to answer day, per link, both legs):
  the drive's timing handicap, measured — the control leg's pending days
  run to village death or the horizon (the trustgrowth-b shape).
- Trust at season (trust on the day each link first seasons, armed vs
  control) and peak/end trust per link.
- Drive stats: blocked-no-answerer days per seed, answerer roster (who
  answered, how many times each), tends blocked on pantry.
- Polity formation: EXPECTED 0 on both legs — a polity needs 3 seasoned
  subordinates and this arm proposes no links, so the band can hold at
  most 1 seasoned link. If a polity somehow forms, that overturns the
  secondlink-a link-count finding and is reported loudly.
- Wall numbers every run: national / table / wins, wave-4 unlocks, wave-5
  unlocks, median survival, seasoning rate, polity formation.
- Per-link peak trust, accord/tend/renegotiation/demand counts by cause
  (analyzer attribution), aid + tribute totals (the control's only
  growers, for the before/after).

## Pilot gate + confirm

- PILOT: 8 seeds before/after (16 legs). Kill at pilot on any miss of the
  primary or the cost bar — never run 12-16 seeds on a failed pilot.
- CONFIRM (only on pilot GO candidate): band 150209-150216, 8 seeds/leg,
  same bars (GO candidate: armed >= 3/8 vs control <= 1/8; same cost bar
  on the confirm band's own control leg). The confirm band is named here
  and in this prereg before the confirm runs; no fresh band is chosen
  mid-run.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

If the primary proves wrong (e.g. the answerer gate blocks so often that
the drive is really measuring bench availability, not answering — or the
dawn timing makes the accord land a day late on every seed and the
pending-days metric is the honest primary), that goes here after judging,
and the revision is proposed for the next run — never re-scored mid-run.
