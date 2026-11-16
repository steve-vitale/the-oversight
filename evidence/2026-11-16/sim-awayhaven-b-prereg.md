# sim-awayhaven-b — PREREG (binding)

Run: fleshout-loop-b-20261116T0915Z (Loop B), axis winnability chain, arm
sim-awayhaven-b — DIAG: resolve the 18 away-while-at-Haven members (0730Z
run's next blank #5; open finding 2026-11-16 in sim-findings.md).
Branch `sim-awayhaven-b` (worktree `~/workspace/worktrees/sim-awayhaven-b`).
Base: master `796fa96ca` at arm start (the worktree HEAD; the coordinator
rebases at landing and re-runs proofs).
Binding prereg: THIS file — frozen before any judged sim. The instrument
(driver, analyzer, proof test) is built AFTER this commit; no judged
numbers exist yet. Commit this file FIRST (`scripts/safe-commit.sh`
"sim-awayhaven-b: frozen prereg — ..." — see the worker brief), then build.

## The question, in plain words

In the poolmarginals band, 18 village members are flagged "away" while
the place they stand reads Haven — home. They can't be away and home at
once, so one of the two readings is lying, or "away" means something
other than "not here". This DIAG traces each of the 18 day by day and
says which it is: does the away flag linger after a member comes home,
does it cover a kind of absence that isn't about place, or is the
recorder (or the node read) wrong?

## Prior art (read first)

- `evidence/2026-11-16/sim-poolmarginals-b.md` + prereg — the instrument
  this arm EXTENDS (extend `scripts/poolmarginals-driver-20261116.js`,
  `scripts/analyze-poolmarginals-b.js`, `scripts/test-poolmarginals-b.js`;
  don't rebuild). Its corpus is the reference: 171 plan-holder scored
  dawns, 1,043 member-checks, 18 members flagged away while their node
  reads Haven. Its evidence §Findings states the open question verbatim:
  "the away flag and the node read disagree for these members; whether
  the flag lingers after return or covers a non-spatial absence is a
  question for whoever owns away semantics, not this DIAG." This arm IS
  that whoever.
- `evidence/2026-11-16/sim-companionpool-b.md` + prereg — the driver
  family origin; the `away` condition as the pool reads it.
- `docs/CANON.md` (read first), `docs/VILLAGER-BRAIN.md` (one-brain
  contract; the brain owns dawn — `v.away` is read at
  `src/js/villager-brain.js:135`, `var away = v.away || {};`),
  `docs/PARTY.md`.
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  the away flag's semantics, departure gates, or the pick lottery
  (checked 2026-11-16 against the `docs/CANON.md` manifest;
  `docs/VILLAGER-BRAIN.md` mentions `exped[]`/`away{}`/indoor checks
  only in passing). The evidence file states this gap instead of
  inventing canon. If the trace shows the flag has a real meaning the
  code already implements (e.g. a companion-away or expedition-away
  state), report the code's meaning as the finding — grounded in the
  code, not in a new canon claim.

## Design — the trace (frozen)

Extend the poolmarginals driver with a per-member day-by-day trace for
EVERY member flagged away-while-at-Haven at ANY scored dawn, on EACH
leg. For each flagged member, record one row per day from 5 days before
the first flag day through 5 days after the last flag day (or the
village's death / the 150d cap, whichever comes first):

- day, seed, member id + name, alive
- `away` flag value (the exact value the pool reads — record the raw
  value, not just a boolean)
- node read (the exact node string the pool reads)
- current objective / activity (what the dawn scorer assigned that day)
- expedition membership (`exped[vid]` present or not; expedition
  destination if any)
- companion status (travelling as someone's companion or not)
- last departure day + last return day (from the member's movement /
  expedition history as the game records it)

Classification (frozen — every flagged member gets exactly one):

- (a) **linger-after-return** — the flag was set on a real departure
  and stayed set after the member's node returned to Haven (show the
  return day and the flag still set ≥1 day after it).
- (b) **non-spatial absence** — the flag means something other than
  place (show the code path or state that sets it while the node is
  Haven: companion-away, expedition-away, indoor-chore, or whatever
  the trace shows; name the state).
- (c) **recorder / node-read artifact** — the game state is consistent
  and the disagreement is in how the instrument reads it (show the two
  reads side by side and name which read is wrong).
- (d) **other, with evidence** — anything else, with the trace lines
  that force the category (do not use this as a bucket for "couldn't
  tell" — if the trace cannot decide, the member is UNRESOLVED, counted
  separately, and the missing hook is named).

Legs (frozen): mirror poolmarginals exactly — CONTROL = master as-is +
recorder (seed call absent); INSTRUMENT = control + the vetparty seed
call re-landed verbatim (13-line block from the poolmarginals prereg
§Design decision 1). Same band, same policy, same horizon. The headline
classification is on the INSTRUMENT leg (the leg the 18 were observed
on); the control leg is the check for seed-call dependence (report
whether the same members flag there, and whether their classes match).
After measurement the seed call is REVERTED on the branch; the
instrument, analyzer, proof test, corpora, and evidence merge
evidence-only. Instrument-only DIAG, zero `src/js` game-code change.

## Primary metric + GO bar (frozen)

Primary metric: **share of flagged members classified (a)–(d) with a
dated trace line each** (classification coverage), on the instrument
leg.

GO (instrument validity) iff ALL hold:

1. **100% of instrument-leg flagged members classified** (a)–(d) —
   every member gets a class and a trace; the bar is 100% because the
   subject is 18 named members, not a rate.
2. **UNRESOLVED = 0**, or every unresolved member names the missing
   hook that would decide it (no silent unknowns).
3. **Corpus 16/16 files parse** (8 control + 8 instrument legs,
   one file per seed per leg).
4. **Proof green**: `scripts/test-awayhaven-b.js` — static/judge/
   recorder green + determinism D1 (recorder ON twice, identical
   trajectories) + D2 (recorder ON vs OFF, identical trajectories) on
   the instrument tip, and green again in the off shape after the
   revert (same shape as poolmarginals' 64/64).
5. **Wall numbers reported** for both legs (national by standing ≥200
   AND by scaleRank, table, wins, wave 4/5 unlocked, median survival,
   wave-4 kills, deaths).

The VERDICT is the classification table itself: the dominant mechanism
across the 18, and whether the pool's `away` condition needs a game
fix, a recorder fix, or nothing (the flag means what it should and the
pool reads it right). A DIAG GO means the instrument is valid and the
table is trustworthy — not that any mechanism "wins".

## Seed bands (reuse-by-design, recorded per the seed-band-freshness skill)

- Band: **102131–102138** (8 seeds), control leg first (recorder only),
  then instrument leg (seed call + recorder), identical seeds, same
  policy/horizon.
- REUSE, NOT FRESH: this band is named in exactly one earlier prereg,
  `evidence/2026-11-16/sim-poolmarginals-b-prereg.md` (verified
  2026-11-16 by the coordinator: `grep -rl "102131"
  evidence/*/sim-*-prereg.md` returns that file only). The reuse is
  DELIBERATE and recorded here: the 18 members ARE this band's corpus —
  a fresh band would not contain them. This is a reuse-by-design release
  for tracing that judged corpus, not a fresh screening band; no
  fresh-band claim is made.
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568 (the poolmarginals
  forbidden list, carried over).

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  worker: verify the sha with sha256sum before the prereg commit and
  record it in the evidence; poolmarginals recorded
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`).
- Control anchor = the instrument commit (driver + analyzer + proof
  test, seed call ABSENT); instrument anchor = the seed-call commit
  (instrument + the 13-line seed call). Both SHAs are recorded in the
  evidence file.
- Determinism: D1/D2 as in §Primary metric. Drift check D3 (same shape
  as poolmarginals): the analyzer's `agree` check on the replica's
  ranked bid must pass on all scored dawns; any drift flag is
  investigated, not waived.

## Sense-testing (mandatory)

Read the traces as stories: pick three flagged members and follow their
days in plain words — where did they go, when did they come back, what
were they doing while flagged away at Haven? If the trace says "away"
and the story says "home, cooking", the classification must say why
both are true. One member whose trace contradicts its class is a
finding, not a rounding error — name it in the evidence.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the 5-day trace window catch the departure and the return for
  every member, or did any window need widening (record the widening)?
- Did the control leg flag the same members (seed-call dependence)?
- Did any member change class between legs — and if so, which leg's
  class is the true one?
- Is (b) one mechanism or several hiding under one label (split it if
  the traces show two different non-spatial states)?

## Wall numbers (report every run)

National (standing ≥200 AND scaleRank), table, wins, wave-4 unlocked,
wave-5 unlocked, median survival, wave-4 kills, deaths — per leg.
