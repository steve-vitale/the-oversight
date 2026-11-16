# sim-medicduty-b — PREREG (binding)

Run: fleshout-loop-b-20261116T2230Z (Loop B), axis winnability chain, arm
sim-medicduty-b — DIAG: the medic-duty candidate starves expeditions on
whole seeds (tracker blank #6; findings backlog line 2444). Branch
`sim-medicduty-b` (worktree `~/workspace/worktrees/sim-medicduty-b`).
Base: master `cc0daf6c9` at arm start (Loop A's planignite DIAG +
journey-landing r140 already on master). Binding prereg: THIS file —
frozen before any judged sim. The instrument (driver, analyzer, proof
test) is built AFTER this commit; no judged numbers exist yet. Commit
this file FIRST (`scripts/safe-commit.sh "sim-medicduty-b: frozen
prereg — ..."`), then build.

## The question, in plain words

On the haventarget band 102201–102208, 3 of 8 seeds launched ZERO
expeditions in 150 days because the dawn brain kept picking the same
medic-duty holder as its launch candidate and startExpedition's
medic-duty gate blocked every attempt: Kyle on 102201 (8 attempts),
Franz on 102204 (3), Kenneth on 102205 (13). Medic-duty blocks were
26 of 198 attempts. Is this real on a fresh band, how often does it
bite, and is there a non-duty candidate available on the starved
seeds? This is a DIAG — measure it, do not build a fix (the fix is a
design question for later).

## Prior art (read first)

- `evidence/2026-11-16/sim-haventarget-b.md` + prereg — the subject:
  §Blocked launches: 95 of 198 attempts never landed (medic-duty 26,
  hurt-no-care 64, sick 5, unknown-block 0); the three zero-launch
  seeds named above. This arm extends that instrument; it does not
  rebuild from scratch. The haventarget recorder pattern
  (`scripts/haventarget-driver-20261116.js`,
  `scripts/analyze-haventarget-b.js`, `scripts/test-haventarget-b.js`)
  is extended, not forked blindly.
- `evidence/2026-11-08/sim-medicduty-a.md` — the Haven Medic Duty
  build (landed d910dc6da): the duty itself, `medicDutyHolder()`
  (`src/js/game.js:33434`), the gate in `startExpedition`
  (`src/js/villager-agency.js:477`).
- `docs/CANON.md` (read first), `docs/PARTY.md` (healer roles).
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  expedition candidate picking at dawn or the medic-duty departure
  gate's interaction with it. Nothing in this evidence invents canon:
  every mechanism below is grounded in the code read (file:line
  cited) and will be confirmed or overturned by the measured corpus.

## Code read (hypotheses to test, NOT verdicts)

All line numbers in THIS tree at arm start (they drift daily;
re-locate in the proof test by function name, not line number):

- **G1 — the medic-duty gate is the FIRST gate in
  `startExpedition`.** `src/js/villager-agency.js:477`: for a
  non-directed call (`opts.tx == null`), if
  `medicDutyHolder() === vid`, the call returns before gear-up,
  heal-check, sick-check, or range — and increments
  `v.medicDutyBlocked`. Directed win-plan launches (opts.tx set,
  `win-plan.js:419`) are exempt: the plan's path to the table is
  not the duty's to veto. So a medic-duty block can only ever fire
  on a non-directed call.
- **G2 — the true gate order is medic-duty, then hurt-no-care,
  then sick, then range.** `villagerHealCheck`
  (`src/js/game.js:7939`) runs second and returns true (sit out)
  only when HP < 70 AND no usable medicine AND no camp healer;
  medicine or a healer patches the villager and the launch
  proceeds. The sick check
  (`villager-agency.js:499`, `(v.sick || {})[vid]`) runs third;
  `npcMaxDist < 1` fourth. NOTE — the haventarget recorder derived
  the block reason AFTER the call in the order medic-duty, sick,
  range, hurt-no-care: a villager both sick and hurt-without-care
  would have been labelled 'sick' although the heal check blocked
  first. This arm derives the reason from a PRE-CALL gate
  snapshot in the true order, and the analyzer re-derives it from
  those raw fields (D3).
- **G3 — the dawn brain picks ONE candidate and never re-picks.**
  `vbrainExecuteDepart` (`src/js/villager-brain.js:1008`) honors
  today's dawn commitment for one villager (`vbrainCommit(vid)`);
  for a `party_launch` commit it calls `startExpedition` for the
  holder and then for the companion with the same directed opts.
  If the holder's call is medic-duty-blocked, the companion call
  never happens (the code returns 'hold' after checking
  `a.exped[vid]`), and nothing in the dawn path tries a second
  candidate. The candidate is whoever holds the EXPEDITION commit
  that dawn; the recorder names them per attempt.
- **G4 — the pool question is separate from the gate question.**
  A starved seed can mean (a) no launch-eligible non-duty
  villager existed that dawn (pool empty — the duty really does
  ground the village), or (b) eligible villagers existed and the
  brain never tried them (candidate-selection failure). The
  recorder snapshots the launch-eligible non-duty pool at each
  attempt so the two are told apart.
- **G5 — the fiction may not notice.** The only duty-related say
  lines are the assignment line (`game.js:33500`: "is staying at
  Haven as the camp healer now — tending the sick instead of
  ranging out") and the no-healer line (throttled, only while
  someone is sick). There is no line for a blocked launch and no
  line for a village that launches nothing for weeks. The
  hurt-no-care sit-out DOES get a line (`game.js:8024`: "is still
  hurting … no healer at haven. They rest today instead of ranging
  out"). Sense-testing will quote what fired on a starved seed.

## Design — the recorder (frozen)

One shared band, TWO legs, zero `src/js` game-code change on either:

- **OFF leg** = master as-is, recorder off (trajectory reference).
  **ON leg** = master as-is + recorder wraps only (the judged leg).
  The judged comparison is ON (measured attempts) against the OFF
  leg's trajectories (neutrality — the recorder must not move the
  game). No seed call, no lever, no balance change: this is a DIAG
  reproduction of the subject, NOT a change.
- Recorder wraps (scripts-side in
  `scripts/medicduty-driver-20261116.js`, pure reads + writes to
  driver-local arrays — no game-state writes, no RNG draws;
  `MEDICDUTY_RECORDER=off` skips installing them). The haventarget
  wraps are kept (startExpedition / expeditionReturn / expedDeath /
  say capture / daily signature) and the startExpedition wrap is
  extended per attempt:
  - **Candidate**: vid + name + `isDuty` (vid ===
    `medicDutyHolder()` at call time) + the current duty holder
    (vid + name, null when vacant).
  - **Pre-call gate snapshot** (raw fields, taken BEFORE
    `origStart` runs, so a heal-check patch or medicine spend
    cannot rewrite the reason): `health`, `sick` (bool),
    `maxDist`, `medicineExists` (any usable pharmacy dose,
    healAmount > 0), `campHealer` (bool), `dutyHolder`,
    `directed` (opts.tx/ty present). The block reason is derived
    from these fields in the true gate order (G2):
    medic-duty → hurt-no-care → sick → range-0 → unknown-block.
    A landed launch carries blockReason null.
  - **Pool**: the launch-eligible non-duty villagers at that dawn
    — roster members who are alive, not the scholar, at Haven
    (`campPeopleIds('haven')`), not away, not on an expedition,
    not sick, not the duty holder, `npcMaxDist >= 1`, and not
    hurt-without-care (health >= 70 OR medicine exists OR a camp
    healer is present). Recorded as `pool` (vid + name list) and
    `poolDepth` (count). The candidate themself is excluded from
    the pool (the question is whether ANOTHER candidate existed).
  - The haventarget launch fields are kept verbatim (day/part,
    hx/hy, node, opts, stackTop, origin, plan, dawnCommit,
    xpAtLaunch, landed, exped) so the ON corpus stays comparable
    with the haventarget band.
  - Say capture (ON leg only): the haventarget regex extended
    with duty/healer lines (`camp healer|no healer|doctoring|
    medic`), capped, with day — for sense-testing.
- A **starved seed** is a seed where the same medic-duty holder is
  re-picked as candidate ≥3 times AND the seed launches 0
  expeditions in 150 days. Re-pick counts are per holder per seed.
- The analyzer (`scripts/analyze-medicduty-b.js`) re-derives every
  block reason AND every candidate-duty flag from the raw recorded
  fields (D3): block reason recomputed from the pre-call gate
  snapshot in gate order; `isDuty` recomputed as
  `dutyHolder === vid`. Mismatch 0. It reports the attempt table
  (attempts by block reason per seed), the re-pick table (blocked
  medic-duty attempts per holder per seed), the starved seeds with
  their holder, and the pool-depth distribution on medic-duty
  blocks (how often poolDepth was 0 vs ≥1).

## Classification (frozen — every attempt gets exactly one of each)

- Block reason (from the pre-call gate snapshot, true order):
  - `medic-duty` — non-directed call, vid is the duty holder.
  - `hurt-no-care` — health < 70, no usable medicine, no camp
    healer.
  - `sick` — `(v.sick || {})[vid]` set.
  - `range-0` — `npcMaxDist(vid) < 1`.
  - `unknown-block` — no read explains it. Must be 0; any
    unknown row names the missing gate in the analyzer output.
    No silent unknowns.
- Candidate: the vid of the `startExpedition` call; `isDuty`
  iff vid === dutyHolder at call time.
- Pool: as defined in §Design; `poolDepth` is the count of
  launch-eligible non-duty villagers excluding the candidate.
- The analyzer RE-DERIVES block reason + candidate-duty flag from
  the raw recorded fields (D3). Mismatch 0.

## Primary metric + GO bar (frozen)

Primary metric: **blocked-attempt share by reason (medic-duty vs
hurt-no-care vs sick vs unknown-block) + zero-launch seeds
attributable to medic-duty candidacy**, on the ON leg.

GO (instrument validity) iff ALL hold:

1. **100% of ON-leg launch attempts classified by block reason**
   — every attempt row gets a reason (landed → null, blocked →
   one of the four); unknown 0.
2. **Corpus 16/16 files parse** (8 OFF + 8 ON legs, one file per
   seed per leg).
3. **Proof green**: `scripts/test-medicduty-b.js` — static checks
   (zero `src/` diff; wraps named) + D1 determinism (recorder ON
   twice, one seed, 60d, identical attempt corpus) + D2 neutrality
   (recorder ON vs OFF, same seed, 60d, identical daily trajectory
   signatures + identical wall fields) + D3 analyzer re-derivation
   (block reason + candidate recomputed from raw fields, mismatch
   0), green on the instrument tip.
4. **Wall numbers reported** for both legs (national by standing
   ≥200 AND by scaleRank, table, wins, wave 4/5 unlocked, median
   survival, wave-4 kills, deaths).

The VERDICT is the count table itself: attempts by block reason per
seed, re-pick counts per holder (a seed counts as starved when the
same medic-duty holder is re-picked as candidate ≥3 times and the
seed launches 0), zero-launch seeds named with their holder. A DIAG
GO means the instrument is valid and the table is trustworthy —
not that any mechanism "wins". No balanced panel (DIAG, no game
change) — stated in the evidence.

## Seed bands (fresh, verified)

- Band: **102801–102808** (8 seeds), OFF leg first (recorder off),
  then ON leg (recorder on), identical seeds, same policy/horizon.
- FRESH: verified 2026-11-16 by the worker: `grep -l <seed>
  evidence/*/sim-*-prereg.md` over all 942 prereg files returns
  nothing for any of 102801–102808 — no prereg names any of these
  seeds. (A whole-`evidence/` grep also matches kcal values such as
  `pantryFreshAfter: 102801` in old JSON corpora; those are pantry
  numbers, not seeds, and do not count as use.) Files searched:
  all `evidence/*/sim-*-prereg.md` (942 files).
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568, 102131–102138,
  102201–102208, 102141–102148, 102401–102408, 102601–102608,
  102701–102708 (the forbidden list carried over, plus the
  haventarget / planignite / stand199 bands). 102801–102808
  collides with none of them.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`,
  verified by the worker on this tree before the prereg commit —
  the policy changed under journey-landing r140; the old
  `74a890f0844e…` blob the haventarget prereg cites is NOT this
  tree's policy).
- OFF anchor = the instrument commit (driver + analyzer + proof
  test, recorder OFF by env); ON anchor = the same commit, recorder
  ON by env (no `src/` change between legs — the legs differ ONLY
  by the `MEDICDUTY_RECORDER` env flag). Both SHAs are recorded in
  the evidence file (they are the same commit; the env flag is the
  leg).
- Determinism: D1/D2 as in §Primary metric. Drift check D3 (same
  shape as haventarget): the analyzer's re-derivation must pass on
  every attempt row; the full-band OFF-vs-ON daily-signature
  comparison must show 0 divergences (any divergence is
  investigated, not waived).

## Sense-testing (mandatory)

Read the say lines for a blocked launch / a starved seed: does the
fiction notice the village launching nothing for 150 days, or that
the same holder keeps being picked? Quote at least one line (or
state that none fired). Judge meaning, not just counts. The
duty-assignment line and the hurt-no-care rest line are the
contrast set: both name the healer's staying-home; neither names
the expedition that never left.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the haventarget gate-order correction change any block
  reason (sick vs hurt-no-care) relative to the haventarget
  derivation — and by how many rows?
- Was the pool ever empty on a medic-duty block, or did eligible
  non-duty villagers always exist (candidate-selection vs
  pool-exhaustion)?
- Was 150d the right horizon, or did the starvation pattern set in
  early / only at the tail?
- Did the OFF leg reproduce the ON leg's trajectories exactly (D2
  full-band), or did the recorder move anything?
- Is "pool depth at the attempt" the right availability unit, or
  did the dawn brain's commit pool differ from the
  launch-eligible pool (e.g. a pool member held no EXPEDITION
  commit that dawn)? Name it if the corpus shows it.

## Wall numbers (report every run)

National (standing ≥200 AND scaleRank), table, wins, wave-4 unlocked,
wave-5 unlocked, median survival, wave-4 kills, deaths — per leg.
