# sim-woodshortline2-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-woodshortline2-b,
axis food-economy (wood-short lacking-line audit, backlog
#1456 still-open sub-item). Worktree sim-woodshortline2-b.
MEASUREMENT ONLY unless a tail lie is found: zero src/js
changes expected, zero policy-default changes. This worker
does NOT merge to master — coordinator merges. Do NOT push,
bump versions, or verify live.

## Why this run exists

This is a CURRENT-MASTER RE-JUDGMENT, not a new design.
The previous Loop B run (0730Z, now dead, coordinator lost)
already ran this audit on old base 2138ad07e (branch
sim-woodshortline-b, evidence
evidence/2026-10-30/sim-woodshortline-b.md + prereg,
verdict GO 7/7 staged evenings name the logs exactly,
measurement only, zero src/js). That branch is NOT on
master and this run must NOT cherry-pick, copy, or commit
its files — its prereg and evidence were read with
`git show sim-woodshortline-b:...` as REFERENCE ONLY.
This run writes its own scripts and evidence and runs
FRESH legs on its own pinned base. Its corpora must never
be quoted as current-master behavior. The woodwarm
policy/driver/analyzer it reused ARE on master (landed
with sim-woodwarm-b) — this run reuses those master files
verbatim.

The question is unchanged: the woodwarm run PLAYED the
wood-short route (staged wood-short creek evenings after
warmth log-spends with no intervening haven-morning
refill) but did not audit whether the refused tails on
those evenings actually name the missing logs. This run
is that audit, re-derived on current master: re-run the
woodwarm bank/policy on a freshly pinned base and read
the tails of the warmth-route wood-short evenings
END TO END.

## Canon (read before judging)

- docs/CANON.md read first. No canon doc covers the
  creek/bridge lacking-line narration itself — stated here
  instead of inventing canon, as in the woodwarm and
  prior woodshortline preregs. Closest grounded canon:
  docs/TIME-ECONOMY.md (bridge build = 96 ticks, 60 kcal
  — the thresholds the line family names), docs/MAP.md
  (creeks block travel), docs/ABILITY-REFUSALS.md
  (refusals must be honest about why). The line under
  audit is the landed woodcarry.js lackingLine,
  wood-short branch, NOT re-specified here:
  'No bridge tonight — the pack holds N log(s), and a
  bridge needs 4.' where N is the live pack count at the
  evening decision.
- Fire / warmth engine facts are as surveyed in the
  woodwarm prereg (makeFire spends fuel ONLY on success;
  fireFuel prefers 2 branches over 1 log; warmth needs no
  food). This run reuses scripts/policies/woodwarm.js
  verbatim and does not re-litigate the trigger.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time, full
  hash ee3be4fc5f4e3561e6f98df359e680d70a4d8b8e.
  The prereg commit adds ONLY this file (no code, no
  policy, no driver change), so the legs run on
  pinned-base game code verbatim.
- Base drift vs the old audit pin (2138ad07e) is checked
  explicitly: `git diff 2138ad07e HEAD -- src/
  scripts/policies/` is EMPTY at prereg time (the
  intervening commits touch evidence/scripts/tests, not
  game code or the measurement policies), so no src-level
  drift is expected — but expectation is not evidence:
  the bank is RE-DERIVED on this base from both legs,
  and judged against the fresh censuses. The old ON
  census (21 creek / 11 still / 10 rescued, wood-short 7,
  spends 15215 nights 9/11/12/13) and the old guard
  census (15 / 4 / 11, wood 4 on all 15, 0 wood-short,
  0 warmth acted) are REPRODUCTION TARGETS, not quoted
  results. If either leg diverges, the divergence is
  reported plainly and the old census is not cited as
  current-base behavior.
- If the coordinator later rebases this branch, the
  verdict does NOT travel with it: re-judgment would need
  a fresh base-pinning prereg.

## Legs (all on pinned base, identical driver env)

- Driver: scripts/woodwarm-trace-b.js REUSED VERBATIM
  (same honesty guards: no thief grant, no taps, no state
  edits, no clock-setting, no top-ups, no driver travelTo).
  Env asserted FATAL, identical to woodwarm:
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1
  WOODWARM=0|1 DAYS=30.
- OUTDIR override only: judged corpora go to
  evidence/2026-10-30/sim-woodshortline2-b-corpus-on
  (WOODWARM=1) and
  evidence/2026-10-30/sim-woodshortline2-b-corpus-guard
  (WOODWARM=0). No driver, policy, or analyzer change.
- PILOT (instrument validation, part of the bank, not a
  separate selection): seeds 15003, 15215, ON+warmth, 30
  loop-days. Pilot checks: errs 0, warmth records present
  with the full field set, evening loopDay sequences
  intact, determinism re-run of 15003 byte-identical. A
  pilot instrument failure stops the run (fix the
  instrument, never the bar). The pilot seeds are bank
  seeds, so the pilot legs ARE judged bank legs, not
  extra draws.
- BANK (judged ON legs): all 10 qualifier seeds from the
  woodshort 500-seed screen, in screen order (15003,
  15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376,
  15439), 30 loop-days each, WOODWARM=1. No cap, no
  subset, no seed added after the bank runs.
- GUARD legs: the same 10 seeds, WOODCARRY=1 WOODWARM=0,
  for the pinned-base census re-derivation (target: the
  old guard census 15 / 4 / 11, wood 4 on all 15,
  0 wood-short, 0 warmth acted) AND as the before
  side of the before/after. Guard legs are NOT judged
  for staging.
- SIZING NOTE (seed floor, stated up front): this is a
  re-derivation audit of the woodwarm bank, not a new
  lever confirm — the brief names this bank, and the bank
  is 10 seeds, above the 8-seed floor and never below it.
  The powered unit is the staged evening, not the seed:
  minimum-n is set on staged evenings (bar (a) below),
  and expanding the bank would break the pinned
  re-derivation comparison the run exists to make. No
  seed is added after the bank runs for any reason.
- Analyzer: scripts/analyze-woodwarm-b.js REUSED VERBATIM
  (same staged definition: wood-short skip AND an earlier
  loop-day warmth record acted=true, fireLit=true,
  logSpent>=1, AND no morning carry acted=true on any
  loop-day strictly after the spend night up to and
  including the staged evening's loop-day; the staged
  evening's own warmth action never stages itself).
  Census JSONs:
  evidence/2026-10-30/sim-woodshortline2-b-census.json
  (ON) and sim-woodshortline2-b-guard-census.json.
- TAIL AUDIT (the new work vs woodwarm): for EVERY
  staged wood-short evening, read the full eveningSayTail
  (last 30 say lines of that loop-day) END TO END and
  record: (i) the verbatim lacking line or its absence;
  (ii) whether the count in the line equals the evening's
  recorded woodPlayer AND the spend trajectory (e.g.
  after spend 4->3, the line must read 3, not 4 or 2);
  (iii) whether any other line in the tail contradicts
  the refusal (a bridge-built claim, a home-arrival via
  that gap, a second different count for the same pack).
  Also audit: (iv) every rescued ON creek evening's tail
  for a same-evening refusal line (a rescued evening must
  not carry an evening refusal line for that gap) and for
  sense (bridge/home narration coherent); (v) every
  still-refused non-wood-short ON evening's tail for its
  own line naming its own lack (kcal/ticks), reported as
  a secondary check, never substituted for a wood-short
  result. Tails are quoted verbatim in the evidence file
  for every staged evening; rescued/other tails are
  quoted when they contain a line at issue, otherwise
  summarized with the sense verdict.
- AUDIT + PROOF SCRIPTS (this run's own, not copied
  from the old branch): scripts/audit-woodshortline2-b.js
  and scripts/test-woodshortline2-b.js, proving each
  measurement (census recomputation, staged mapping,
  per-staged tail checks, full-corpus contradiction scan,
  other-still lines, guard census, determinism).

## Bars (adopted verbatim from the old prereg; judged exactly as written; a miss is NO-GO / INSUFFICIENT-DATA, never re-scored)

- (a) PRIMARY LINE-NAMING: staged wood-short evenings
  >= 2 AND every staged evening's tail carries the
  wood-short lacking line with the live count ('the pack
  holds N log(s), and a bridge needs 4.', N ==
  woodPlayer) — i.e. named/staged = 1.000 with staged
  >= 2. GO on this bar requires both halves.
- (b) NO-LIE: no staged tail misstates the count, and no
  ON creek evening's tail contradicts its outcome
  (still-refused tail claiming a bridge built / home via
  that gap; rescued tail carrying an evening refusal line
  for that gap). Any genuine contradiction = NO-GO, even
  if bar (a) passes by count. (A line about a DIFFERENT
  gap, day, or ambient gossip is not a contradiction —
  it must be read in context and the reading stated.)
- (c) SENSE: at least one full staged tail read end to
  end passes (spend -> count -> refusal -> warmth outcome
  cohere: a cold night outside, a fire lit or failed
  honestly, a pack one log lighter, a bridge that cannot
  be lashed), AND the rescued-evening tails read
  sensibly as a set (no nonsense bridge/home narration).
  If no evening stages, the sense-test is NOT PERFORMED
  and is recorded as such, not hidden.
- (d) TRAJECTORY REPRODUCTION: the ON leg reproduces the
  woodwarm ON census shape on this base — staged
  evenings on seed 15215 from spends on nights 9/11/12/13
  (exact evening counts may differ only with a stated
  cause; any difference is reported, not smoothed over).
  If staged = 0 on this base (trajectory did not
  reproduce), the verdict is INSUFFICIENT-DATA with the
  banking yield reported — NOT a fail of the line, NOT
  a lowered bar, and NO repeat sequential screening
  hoping for a better draw. If staged = 1 (below the
  minimum-n 2), likewise INSUFFICIENT-DATA, not GO.
- (e) INSTRUMENT bars: recorder/classifier errs == 0 on
  judged legs; determinism re-run of 15003 ON+warmth
  byte-identical; guard 0 wood-short evenings and 0
  warmth records acted. A guard divergence from the old
  census is reported as drift (see Base pin), and the ON
  leg is then judged against the fresh guard, not the
  old census.
- VERDICT RULE: GO requires (a) + (b) + (c) + (e), with
  (d) holding at least to the staged>=2 level. GO means:
  the line plays on every wood-short evening, and the
  wood-short sub-item of #1456 is CLOSED on this
  evidence (measurement only, zero src/js — said
  plainly). NO-GO means: a tail lies, omits the lacking
  wood, or misstates the count (fix in game code with a
  before/after proof on identical seeds, unless the fix
  needs Steve's design ruling — then document as an open
  backlog finding and do not invent canon).
  INSUFFICIENT-DATA means: the trajectory did not
  reproduce or staged < 2 (see (d)).

## Forbidden (as briefed; violations void the run)

- Lowering any minimum-n bar; re-screening ON legs hoping
  for a better draw; substituting a ticks/kcal evening
  for a wood-short evening; quoting the woodwarm census
  as current-base behavior without re-deriving it;
  staging via dropItem; lighting a fire on a non-stranded
  night; any state edit outside engine verbs; claiming
  the warmth policy as a bot default (the Steve-call
  from woodwarm stays OPEN and is not re-decided here).

## Metric review (for the NEXT run)

- If the count in the line ever disagrees with woodPlayer
  by exactly the evening's own warmth spend (a
  same-evening spend changing the pack after the line is
  said), the next prereg must define line-vs-spend
  ordering explicitly (line said at decision time, spend
  after) rather than scoring it a lie — but this run
  scores what it finds: the ordering must be READ from
  the tail (refusal line before/after the fire lines),
  and a same-evening spend is recorded, not hidden.
- No balanced-panel compare .md is produced, as
  pre-registered in woodwarm and carried here: this is a
  30-day position measurement of a policy-side behavior
  with zero src/js changes, so there is no game-root
  delta for a panel to compare, and the panel's registry
  policies do not include the nighttravel trace policy.
  The guard-vs-ON census comparison in the evidence file
  IS the before/after, and the determinism re-run is the
  instrument-perturbation proof. The bars above are the
  judge.
