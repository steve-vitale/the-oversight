# sim-npcdeadfilter-confirm — PREREG (written BEFORE any judged sim in this arm)

Arm: npcIds() dead filter CONFIRM, run fleshout-20261102T1715Z,
axis scale-onramp. Confirms commit cc370f832 (sim-npcdeadfilter-a:
src/js/betrayal.js npcIds dead filter, +27/−1). This prereg is
committed BEFORE any judged sim and BEFORE the confirm driver is
run. Proof-test development runs (harness injection cases) are
not judged sims; the judged corpus is the driver band below.

## Background (proven, not re-proved)

The 1630Z pilot (evidence/2026-11-02/sim-npcdeadfilter-a.md) ran
8 seeds byte-identical before/after because the deadid entry
gates already hold — no live pilot seed puts a dead id on the
roster. The filter itself was proven only in harness injection
cases (14/14: P1a–P1d dead-mark sources, P2 driven succession
with a dead top-trust candidate). The 1630Z coordinator decision,
which BINDS this arm: a clean-seed 12–16 confirm would most
likely reproduce the byte-identical no-op, so the confirm is
owed as a CORRUPT-ROSTER band + longer horizon, under its own
prereg. Building that substrate is this arm, not a re-run of
the pilot.

## The corrupt-roster substrate (the judged instrument)

For each seed, the driver runs the closecommit policy sim and,
at the FIRST natural bearer death where the roster allows it,
injects a corrupt-roster state through a NON-entry-gate path,
then lets the game's own succession run:

1. At playerDeath time, BEFORE the original playerDeath runs,
   pick the victim X: the highest-trust living non-bearer on
   the roster (trust desc, roster order breaks ties), skipping
   any id holding phoenix_clause (removeVillager('killed')
   would fire the link instead of the death — the victim must
   actually die).
2. Kill X via Game.removeVillager(X, 'killed') — a real death
   path, deadMarked(X) true, dropped from the roster — then
   push X back onto the roster. This is exactly the pilot P2
   state, reached inside a live sim at a natural death: a
   dead id on the roster, through no application/arrival gate.
3. Set trust[X] to (max living trust + 100), so X is the
   top-trust candidate in the unfiltered ordering.
4. Let the original playerDeath run its succession:
   candidates = npcIds(), sorted by trust, candidates[0]
   becomes bearer.
5. The sim then CONTINUES to the horizon under the new
   bearer, so the downstream difference (living bearer vs
   dead bearer leading the village) plays out in the open.

Injection is attempted at each natural bearer death until it
succeeds once per run; a run's FIRST injected succession is
the judged, paired case. Later deaths are unpaired (the arms
have diverged by then) and are recorded descriptively only.

Roster-allowance rule: injection requires at least 3 living
non-bearers on the roster at death time (the victim plus at
least 2 living successors), so the filtered arm always has a
living successor to install. If the roster is too small, the
death proceeds naturally and injection is retried at the next
natural death. A seed with no successful injection (village
ends before any qualifying death, or every death is
roster-starved) yields NO judged case — reported, not counted
as a pass or a fail.

## The two arms (identical seeds, paired by construction)

- FILTERED: the shipped code — Game.npcIds() with the
  cc370f832 dead filter.
- CONTROL: the same run with Game.npcIds replaced by the
  pre-fix implementation — `(roster).filter(id !==
  villagerId)` — installed after setupGame, before the sim
  runs. On a clean roster this is byte-identical to the
  filter (the pilot proved it), so pre-injection trajectories
  are identical between arms: same death day, same victim,
  same trust. The ONLY difference at the judged succession
  is the filter. The control is a true positive control: it
  must install the dead id, or the substrate does not
  discriminate and the band proves nothing.

No policy changes. No game-code changes unless the substrate
exposes a real filter hole (then: small, documented, proof
test RED pre-fix / GREEN post-fix). No debate-notices-death,
no genApplicant changes (already landed). No new narration,
so no [needs-eyes] unless a fix changes feel/combat/UI.

## Primary metric (pre-registered, binds this arm)

Per seed with a successful first injection in BOTH arms
(paired cases):

- F-DEAD: filtered arm's bearer after the injected
  succession is deadMarked (dead id installed).
- C-DEAD: control arm's bearer after the injected
  succession is deadMarked (dead id installed).
- CLEAN: filtered no-injection (clean) runs on the 8 pilot
  seeds reproduce the pilot postfix outcomes exactly
  (gameDays, endReason, bearer-death counts) — the longer
  cap must not change them, since every pilot village
  resolved before 180d.

## GO threshold (pre-registered, strict)

CONFIRM PASS ONLY if ALL hold:

- At least 8 paired first-injection cases across the
  12-seed band (the band is not vacuous).
- F-DEAD = 0 across all paired cases: the filtered arm
  never installs a dead bearer.
- C-DEAD ≥ 75% of paired cases: the control installs the
  dead id in a clear majority, proving the substrate
  discriminates (a control that does not install dead is
  a substrate failure, not a filter pass).
- Guardrails G1–G3 all hold (below).

CONFIRM FAIL if the filtered arm installs a dead bearer in
any paired case, or if a filter hole is exposed and fixed
in-arm (then the verdict is the post-fix band's verdict,
reported as FAIL-then-fixed only if the post-fix band
passes; a hole that cannot be fixed in-arm is FAIL).

SUBSTRATE-FAIL if fewer than 8 paired cases are achieved,
or if C-DEAD < 75% for a mechanism reason (injection never
lands, victim never top-trust in the control ordering,
playerDeath undrivable in the driver). A SUBSTRATE-FAIL is
reported honestly with the blocking mechanism — never
padded with unpaired or harness-only cases to reach 8.

A miss on any item is NO-GO, never re-scored against a
friendlier metric mid-run. Metric doubts go under "metric
review" for the NEXT run. Unpaired later-death successions
are NEVER counted toward the thresholds.

## Guardrails

G1. CLEAN-GUARDRAIL REPRODUCTION. Filtered clean runs on
    the 8 pilot seeds match pilot postfix on gameDays,
    endReason, and bearer-death counts exactly. (Cap
    extension 180d → 250d must be inert here: all pilot
    villages resolved by 136d.)
G2. ZERO DEAD RETURNS, CLEAN RUNS. The driver traps
    npcIds() returns in clean runs: zero dead ids returned
    post-filter (expected vacuous, as in the pilot — the
    entry gates hold; disclosed, not hidden).
G3. NO NEW ERROR CLASS. Driver errors lists empty on all
    judged runs (filtered-injected, control-injected,
    filtered-clean).
G4. SENSE. At least one injected succession transcript is
    read for sense (SENSE-TESTING LAW): the succession must
    read like people choosing a successor, and the control's
    dead-bearer aftermath must be reported as it reads —
    not smoothed over.

## Horizon, seeds, policies (pre-registered)

- Horizon: 250d cap, death-aware (run ends early on
  village-lost / win as the harness reports; dead villages
  stop simulating, +10d tail max). Why 250d, not the
  pilot's 180d: the judged question is no longer intake
  (which resolved by d58 in deadid) but the AFTERMATH of a
  corrupt succession — a dead bearer leading, or a living
  successor carrying on — which needs room past the pilot
  band's 136d maximum to play out. The cap is a ceiling,
  not a target: villages that die out stop early.
- Seeds (confirm band, 12): 97330, 97331, 97332, 97333,
  97334, 97335, 97336, 97338 (the pilot band, unchanged,
  so clean-guardrail comparison is exact) + 97339, 97340,
  97341, 97342 (new seeds, same stack).
- Policies (closecommit stack, verbatim from the pilot):
  tribfloor leadfeast + windefer + seatdrive + fullseat-diag
  + titanroute + musterclose + mustergap commit-own, with
  env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1 HERALD=1. Driver:
  scripts/npcdeadfilter-confirm-driver-20261102.js (new
  per-seed dir perseed-npcdeadfilter-confirm, so judged
  pilot files are untouched).
- Panel: NO panel compare is attached as judge, for the
  reason carried from the pilot prereg — balance-panel.js
  runs its own registry policies and cannot express the
  closecommit stack, so it cannot judge this filter; the
  driver corpus is the judged instrument. STANDING WARNING
  (carried): panel/driver substrate divergence is an open
  finding (panel splits seeds and loses villages the judged
  driver survives). No panel number re-scores this verdict.

## Wall numbers (corpus context, NOT a reach claim)

The driver records, for the filtered arm, per seed:
endReason, gameDays, won, scaleRank (and whether it reaches
national), maxWaveUnlocked, and bearer-death counts. These
are reported as the diagnosis corpus's wall numbers
(national / table / wins, wave 4–5 unlocks, median
survival) with the explicit caveat that a corrupt-roster
substrate band is not a reach claim — same discipline as
the pilot (no substrate flag cited as reach).

## Canon

docs/CANON.md read first. No canon doc covers npcIds(),
succession ordering, or membership intake specifically
(MONSTER-WAVES.md covers wave law, not membership). The
rules above are code-read from src/js/betrayal.js,
src/js/ledger.js, and src/js/membership.js, not invented
canon. No new narration is added, so the "no silent
actions" standing rule needs no new line: filtering a
return list drops no event, and the injected victim's death
is a real removeVillager death, narrated (or not) exactly
as the game narrates such deaths.
