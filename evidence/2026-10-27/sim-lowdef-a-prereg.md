# sim-lowdef-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: flesh-out loop, low-defiance substrate screen. Axis: scale-onramp.
Worker: sim-lowdef-a. Worktree:
`~/workspace/worktrees/sim-lowdef-a` (branch sim-lowdef-a).

Canon (read first): docs/CANON.md, then docs/TABLE.md (the Feared
section, §1; the Defiant path definition in src/js/table-defiant.js:
prereq ledger defiance >= 4, minSeat lesser) and docs/MEASUREMENT.md
§§9-12, 14-15. No canon invented. The defiant-door rule under test is
POLICY-SIDE, not canon (see below).

## Background (why this arm exists)

evidence/2026-10-27/sim-fallbackfeared-a.md (pilot 1631Z, seeds
74201-74208) was PILOT-INCONCLUSIVE: defiance was offered on all 6
seated seeds, so rule (1) of the defiant-door rule pre-empted rule (3)
every time and fallback-feared seatings were 0/8. Its metric review
says the next arm must pre-screen for defiance NOT being offered.
evidence/2026-10-27/sim-defnoffer-screen-a.md (1715Z, bands
74601-74608, 74801-74808, 75701-75708) was SCREEN-NEGATIVE: 9/24
seated, 0 with defiance NOT offered, defiance 5-13 vs threshold 4 on
the leanlinkrescue courtship substrate. Its metric review says the
next screen needs a DIFFERENT substrate, e.g. a courtship/policy that
earns less defiance, and asks whether one exists among already-landed
policies. That is this arm. Seeds 74201-74208, 74601-74608, 74801-74808,
75701-75708 are NOT re-swept or re-scored here, ever.

## Phase 0 — design (UNJUDGED; the candidate and its mechanism)

HOW LEDGER DEFIANCE IS EARNED (from code grep, not hope). The ledger
dimension `defiance` (src/js/ledger.js) is written by exactly four
channels:
  (a) trial expiry: src/js/progression.js checkTrial — each expired
      3-day audience trial writes ledgerAdd('defiance', 1);
  (b) arena defiance acts: src/js/ledger.js arenaAct PRICING ledger
      ['defiance', 1], reached only from a contest option node with
      do.notability 'defiant' (exactly one such node in
      src/js/contests.js: the Price contest's 'Refuse, if chosen',
      option index 1 of its final beat — the harness answers contests
      with contestChoose(0), so harness-driven contests NEVER pick it);
  (c) hierarchy 'global-declined': declining the world feed
      (src/js/hierarchy.js answerGlobalChoice else-branch);
  (d) hierarchy 'scale-refused': refusing the national scale
      (src/js/hierarchy.js refuseTheScale).
The leanlinkrescue courtship (and every linkform-family courtship)
answers pendingGlobal with 'feast' and pendingNational with a
shape-mapped pick — never 'decline', never 'refuse' — so channels (c)
and (d) are CLOSED on this whole family, and channel (b) is closed by
contestChoose(0). That leaves channel (a), trial expiry, as the only
open defiance source on the substrate.

DIAGNOSTIC (unjudged, scratch script /tmp/lowdef-diag.js, NOT a judged
instrument, NOT committed): tableseat-nowait baseline leg on fresh
diagnostic seeds 76901-76902 (diagnostic-only; never judged, never
re-scored), wrapping Game.ledgerAdd / Game.arenaAct to count channels.
Result: seed 76901 final defiance 7 = 7 trial expiries, 0 arena, 0
global-declined, 0 scale-refused; seed 76902 final defiance 11 = 11
trial expiries, 0/0/0. Expiries start early (days 13-22) and recur
roughly every 9-13 days. CONCLUSION: on the leanlinkrescue substrate,
defiance at seating IS trial expiries, and even a day-90 seating
carries ~6 expiries — so an EARLIER seating alone cannot qualify
(needs < 4). Only a higher trial-COMPLETION rate can.

TRIAL COMPLETION (from code): a haul trial completes iff the pantry
GROWS by its need (1000/3000 kcal) within 3 days; an identify trial
completes iff 3 plants newly reach knowledge level 3 within 3 days.
Completion is therefore pantry-growth-gated, and pantry drains hurt
it directly.

CANDIDATE SUBSTRATE (judged from code): leanlink courtship
(scripts/policies/leanlink.js, LEANLINK=1: cap 3, NO tends) under
tableseat-nowait's seat legs, with tablepaths-defiant's door rule on
top. The ONLY difference from the screened substrate is the removal
of the 1,500 kcal/week/link tend drain (leanlinkrescue's rescue-tends
to dipping links). Mechanism by which it should earn less defiance:
less pantry drain → more 3-day pantry growth → more haul trials
complete → fewer expiries → lower defiance at seating. Channels (b),
(c), (d) stay closed exactly as on leanlinkrescue (same courtship
answers, same harness contest driver, same competent base), so no new
defiance source opens. HONEST CAVEAT, stated before sweeping: the
tend drain (~214 kcal/day/link) is small against the village's
~3,000 kcal/day drain, so the effect may be too small to move any
seed under 4 — the screen tests it, and a negative result is a real
finding (it would say no landed courtship moves defiance enough, and
a future arm needs a trial-completing player, not another courtship).
No other landed policy is a better candidate by this mechanism:
nofallback variants differ only in fish/cook staffing fallbacks (no
defiance channel); leanlinkcap5/linkform/fourthlink/fifthlink all
keep tends; feastscale (takeseat) is a different scale road but its
feasts SPEND pantry (wrong direction for haul-trial growth) and it
has no proven seat+modal-answer combination, so it is not the
candidate — it is a documented alternative for a future arm.

INSTRUMENTS (new, policy-side only, default-OFF, zero src/js):
  - scripts/policies/tableseat-leanlink.js: leanlink courtship +
    tableseat-nowait's seat legs verbatim (ts counters), env
    TABLESEATLEANLINK=1; off → leanlink.daily exactly.
  - scripts/policies/tablepaths-leanlink.js: the defiant-door rule
    verbatim (dp counters, dpOffers, dpFallbackFeared) on
    tableseat-leanlink, env TABLEPATHSLEANLINK=1; off →
    tableseat-leanlink.daily exactly.
  - scripts/test-lowdef-a-sweep.js: paired sweep modeled on
    scripts/test-tablepaths-defiant-sweep.js (same row shape, same
    incremental corpus writer, same G2/G3 reporting), with the new
    pair; env SEEDS / EVID / DAYS; modes default sweep, --detgate,
    --sense (non-measured replay only).
  - scripts/test-lowdef-a.js: this arm's proof validator (G-screen /
    G-offer / G-leak / qualification / Phase 2 GO inputs), modeled on
    scripts/test-defnoffer-screen-a.js.
If the screen is negative, the two new policy files are DELETED
before the final commit (killed arms leave no trace); the sweep and
proof scripts stay as the measurement record only if the coordinator
wants them — otherwise they go too. If a band qualifies, the policy
files are KEPT as the Phase-2 instrument and the evidence says so.
NEVER edited: tablepaths-defiant.js, tableseat-nowait.js,
leanlinkrescue.js, leanlink.js, or any src/js file.

## Substrate and pairing (VERBATIM rule, new substrate)

- Baseline: scripts/policies/tableseat-leanlink.js
  (LEANLINK=1, TABLESEATLEANLINK=1, TABLEPATHSLEANLINK unset).
- Armed (the observing leg): scripts/policies/tablepaths-leanlink.js
  (LEANLINK=1, TABLESEATLEANLINK=1, TABLEPATHSLEANLINK=1).
- The door rule is tablepaths-defiant's rule verbatim:
  (1) if 'defiant' is offered, take it (rule 'defiant');
  (2) else take the first offered door that is NOT 'feared', in engine
      order (rule 'fallback-non-feared');
  (3) else (only feared offered) take feared (rule 'fallback-feared';
      that seating is flagged fallback-Feared).
  A door never offered is NEVER taken. Branches stay ledger-earned;
  this arm NEVER overrides tableBranch.
- Sweep instrument: scripts/test-lowdef-a-sweep.js via env only
  (SEEDS / EVID / DAYS). Its verdict field is the DEFIANT verdict and
  is NOT this run's verdict; this run judges manually from its
  per-seed rows + proof script output.
- Own baseline: every candidate band runs its OWN baseline on identical
  seeds (the sweep always runs both legs). NEVER another arm's corpus
  as baseline.

## Phase 1 — screen design (BINDING)

Candidate bands, screened IN ORDER, each a full paired sweep (both legs,
8 seeds, same instrument, same horizon). Screening STOPS at the first
band that qualifies; later bands are then never run. A band that
qualifies is the SOLE Phase 2 band. A band that fails to qualify is
screen-only: its fallback-feared count is recorded but NEVER judged
for the Phase 2 GO (judging every band until one passes would be
cherry-picking, and this prereg forbids it).

  Band A: 76101-76108
  Band B: 76301-76308
  Band C: 76501-76508

Freshness verified BEFORE sweeping: grep of evidence/2026-10-27/
found ZERO hits for any seed in bands A, B, or C (all 24 seeds 0 hits;
neighbouring used ranges 74201-74208, 74601-74608, 74801-74808,
75701-75708, diagnostic 76901-76902, and all other 2026-10-27 bands
avoided). No other 2026-10-27 evidence uses these seeds.

Per seed per band, recorded from the armed row: entered, offer list
(dpOffers: the paths-phase `offered` array), defiance offered yes/no
('defiant' present in `offered`), defiance value if present (from the
earned snapshot's defiant `why` string, e.g. "Defiance 11"), door
taken (enteredPath / doorRule), won, national ever/final, table,
wave reach, median survival. Wall numbers per band: national / table
/ wins, wave 4-5 unlocks, median survival (both legs).

Horizon: 180d death-aware, same as the 1631Z pilot and the 1715Z
screen (dead villages stop simulating, +10d tail max per the harness's
death-aware stop) — so the qualifying band's pilot is comparable in
shape to the pilots it follows.

### Qualifying-band definition (BINDING)

A band QUALIFIES iff BOTH hold on its armed leg:
  (a) seated seeds >= 3 (a seated seed = armed row entered = 1), AND
  (b) >= 2 seated seeds have defiance NOT offered ('defiant' absent
      from that seed's paths-phase offer list).
If no band satisfies both, the verdict is SCREEN-NEGATIVE (see below)
— documented, killed with teeth, no live test forced, no
cherry-picking beyond these three pre-registered bands, no fourth
band, no re-screening of 74201-74208, 74601-74608, 74801-74808,
75701-75708, or 76901-76902.

Note the deliberate gap between qualification and the Phase 2 GO:
qualification needs only defiance-not-offered, while a fallback-feared
seating needs ONLY feared offered. A qualifying band may therefore
still yield zero fallback-feared seatings (its no-defiance seeds may
take fallback-non-feared doors, as 74106 did). That outcome is
PILOT-INCONCLUSIVE in Phase 2, not a failure of the screen.

## Phase 2 — conditional live pilot (qualifying band ONLY)

Judged ONLY on the first qualifying band's already-run paired corpus
(no re-sweep: the Phase 1 sweep on that band already ran both legs on
identical seeds, so its corpus IS the pilot corpus). Adapted
explicitly from the 1631Z prereg shape (same primary, same cost bar):

GO requires ALL of:
  (a) at least 1 fallback-feared seating that enters AND wins
      (armed row entered = 1 AND fallbackFeared = 1 AND won = 1), AND
  (b) the scalemetric cost bar (same as the 1631Z pilot):
      - starvation (death cause matching /starv|hunger/i) armed total
        <= baseline total + 2, AND
      - arm-only starvation deaths <= 2 (seeds where baseline
        starvation = 0 but armed > 0, summed), AND
      - median days armed >= 0.8 x baseline median days.

Verdict branches (no re-score mid-run):
  - QUALIFIED + GO met -> GO (pilot-level; a confirm on a fresh
    separate 12-seed band is a FUTURE run's job, never blended here).
  - QUALIFIED + fallback-feared seatings enter but LOSE -> NO-GO
    with the mechanism named (branch, meters, price, death,
    downgrade — whatever the rows show).
  - QUALIFIED + ZERO fallback-feared seatings -> PILOT-INCONCLUSIVE
    (the screen found no-defiance seats, but rule (3)'s only-feared
    trigger still never fired; do NOT proceed to another band).
  - NO BAND QUALIFIES -> SCREEN-NEGATIVE (the screen, not the rule,
    is what failed; rule (3) stays unit-proven only, exactly as after
    1631Z and 1715Z).

## Proof gates (defined BEFORE sweeping)

  - G-det (NEW pair, so it MUST run — unlike 1715Z, where the policy
    was unchanged): --detgate mode on band A's first seed 76101,
    TABLEPATHSLEANLINK unset: tablepaths-leanlink days/gameDays ==
    tableseat-leanlink days/gameDays, no dp counters. A mismatch is a
    proof-gate failure (exit 1), not a verdict. Run BEFORE judging
    band A (it uses a door-off config, so it is not a judged sweep).
  - G-screen (per band): every config produced a row (16/16), no
    zero-day rows, counters object present on every row (the sweep's
    G3, reported per band).
  - G-offer (per seated armed row): the row's defiance-offered flag
    is consistent with its offer list — flagged offered iff 'defiant'
    appears in dpOffers' `offered` array, and vice versa; rule <->
    offer-list consistency per the defnoffer script; earned snapshot
    defiant.earned matches offer inclusion. Checked by
    scripts/test-lowdef-a.js; a mismatch is a proof-gate failure
    (exit 1), not a verdict.
  - G-leak (per band run, as in the defnoffer script): for every seed
    where NEITHER leg entered the table, days and gameDays must be
    identical between legs — the door assignment changes NOTHING
    except the door answered. A leak is a proof-gate failure.

## SENSE TEST

If a fallback-feared seating occurs in the qualifying band, read at
least one seating transcript (the sweep's --sense mode is a
NON-MEASURED replay; it never enters the census) and judge it in
plain words in the evidence: does the seating read as a real choice,
not a mechanical fallback? If none occurs, say explicitly that no
seating transcript is claimed.

## Balanced panel (MEASUREMENT.md §15)

scripts/balance-panel.js has NO corpus-ingest mode for this corpus
(its modes are its own observer/compare; no per-seed-corpus ingest
flag exists). So: no panel artifact is produced and none is faked.
The before/after per-seed comparison in the evidence IS the
comparison, as in 1631Z and 1715Z.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
