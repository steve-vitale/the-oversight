# sim-congtrace-a — preregistration (the 1-round solo Congregation kill, seed 53006 day 149)

- Run: `fleshout-20261106T1515Z`, Loop A, axis scale-onramp / winnability chain
- Arm: `sim-congtrace-a`, branch `sim-congtrace-a`,
  worktree `~/workspace/worktrees/sim-congtrace-a`
- Base: master `99813ea70` (current master at registration; verified not
  moved before the judged legs — main-tree master is the same commit, so
  no rebase was needed; re-check before merging)
- Seed: **53006 only** — deliberate reuse of the stageally-confirm band,
  not a fresh band. This is a deterministic reproduction of one recorded
  fight, not a lever trial and not a band claim.
- Horizon: **150d, death-aware** (the confirm corpus ran 150d death-aware
  on this seed; the trace re-runs the same horizon).
- Legs: staged only (`scripts/policies/competent-stageally-a.js`, landed,
  verbatim; NOT modified) — the d149 kill is on the staged leg. No
  baseline leg: the question is the shape of one staged-leg kill, not a
  before/after. No gate/price/deed/readyDemand change. Zero src/js.
  DIAG-only, instrument-only.

## The question (stageally-confirm next blank 4)

On the stageally-confirm band, seed 53006 staged, the leg's only
post-first-blood wave-4 kill is a SOLO kill in ONE round: day 149, the
Congregation, scholar gen_y8hmuwz (after succession), 0 allies, 0 party,
scholar ending at 76.4% HP, fight row `seq 16, rounds 1, outcome won,
monsterHpFracEnd 0`. A wave-4 monster carries 850–1500 HP
(MONSTER-WAVES.md; the Congregation's own def is HP [900,1100], armor
10). One round ending it, alone, is unexplained by the fight row — the
instrument records no damage trace. The committed corpus file is
`evidence/2026-11-06/perseed-stageally-confirm-b/stageally-s53006-stageally-confirm-staged.json`
(anchor 2ff11cbf). The kill is in BOTH `waveKillLog` (d149, congregation,
w4, by gen_y8hmuwz, via player) and `killsLive` (same, scholarChannel
true), so it went through `recordWaveKill` — not the pyrrhic path that
bypasses it (fightinterior-b: pyrrhic kills write `waveKillLog` directly
and never reach `killsLive`). The corpus's `fights` array holds NO other
Congregation fight on the seed, so the fightinterior-b wounded-entry
shape (a beast ground down across repeated fights — 51005 d66 Reunion
entered at 123 HP after fights at 3380/1778/2805 entry) has NO direct
support in the corpus for this kill. That shape is an inference, not a
reproduction. This arm reproduces the SAME seed.

## Primary metric and verdict rule (DIAG arm)

This arm builds no policy and pilots nothing, so it is judged as a
diagnosis, not a lever trial:

- **Primary metric:** the d149 Congregation fight's damage account —
  monster entry HP, damage per round by source (scholar strike /
  companion / ability / trick / other), scholar HP at end, rounds —
  from the per-turn recorder, plus the determinism comparison (same
  driver, same seed, kill ledger + trajectory vs the corpus).
- **DIAG-GO** iff the d149 kill is reproduced AND its damage account is
  complete (monster entry HP + per-round damage by source summing to
  the kill), OR the non-reproduction is proven with a determinism
  comparison (same driver, same seed, ledger diff named) AND the nearest
  equivalent wave-4 kill on the fresh leg is traced.
- **DIAG-NO-GO** iff the recorder cannot observe entry HP / per-round
  damage.
- Reported alongside (context, NOT re-judged): the stageally bar —
  living pair ≥1 seed OR post-first-blood wave-4 kills ≥3. The confirm
  measured pair 0/8, post-blood 1. This arm explains one kill; it does
  not re-score the bar.
- Guards (reported, not gated): trajectory comparison vs the corpus
  (kill days/monsters, succession days); no new death mode introduced
  (the instrument records only — it changes no game behavior).

## Method

1. **Determinism leg** — re-run seed 53006 staged, 150d death-aware,
   with the stageally driver (`scripts/stageally-driver-20261106.js`,
   OUTDIR to the congtrace corpus), and compare the kill ledger /
   trajectory to the committed corpus file: kill days + monsters, both
   wave-4 kills (d89 Strike, d149 Congregation), succession days,
   scholar deaths, end state (days, endReason, standing). Killersurvive-a
   already verified staged 53006 reproduces EXACTLY on anchor
   2298a6069; this leg re-verifies on the current tip.
2. **Recorder leg** — the same seed, same driver shape, with the
   fightinterior per-turn instrument
   (`scripts/fightinterior-instrument-20261106.js`, layered on the
   stageally instrument — entry HP, `tbDamage` hit log, per-actor turns,
   player verbs, tbEnd close) via a thin congtrace driver
   (`scripts/congtrace-driver-20261106.js`, a rename of the
   fightinterior driver with the congtrace corpus dir). If the d149
   kill reproduces, the trace of fight seq 16 answers the question
   plainly: wounded entry vs one-shot vs other — with the numbers.
   Read `waveKillLog` as well as `killsLive` (pyrrhic kills bypass
   `recordWaveKill`).
3. **If it does NOT reproduce**, report trajectory divergence honestly
   (killersurvive-a found seed 53004 trajectory-fragile: a one-day RNG
   displacement changed the whole trajectory) — name the ledger diff,
   trace the nearest equivalent wave-4 kill on the fresh leg, and do
   NOT claim the d149 shape explained.
4. **Proof** (`scripts/test-congtrace-20261106.js`): determinism legs +
   recorder captures entry HP and per-round damage on a fixture fight;
   headline numbers reproduce the confirm evidence for 53006 staged
   (2 kills: d89 Strike, d149 Congregation). GREEN before the evidence
   file is written.
5. **Sense test:** read the d149 fight lines (fightLines, deathSays) —
   judge meaning, coherence, relevance, consequences, never just
   counts.

## Seed-freshness record (seed 53006)

- Reserved by the 0615Z run for the stageally confirms ("extension band
  53001–53008 RESERVED for this run's confirms (0 hits everywhere)").
  The confirm prereg verified 0 hits in ALL preregs and 0 hits in
  evidence .md except the range endpoints.
- Reuse check for THIS arm (2026-11-06): "53006" hits in preregs are
  references to the stageally-confirm band and its follow-ups only
  (killersurvive-a prereg/evidence, fightinterior-b evidence naming
  the d149 kill as its blank). No other arm ran judged sims on this
  seed except the confirm itself. No forbidden-band list names it (no
  hits in the goal hidden_files forbidden lists). The seed is REUSED
  DELIBERATELY for a deterministic reproduction — same seed, same
  driver, new question — not fresh, and not claimed fresh.
- Loop B is live in parallel (sim-tableoffer-b landed as 99813ea70; its
  coordinator evidence file sim-winnability-round-1430.md is currently
  untracked in the main tree — do NOT touch it). This arm does not
  duplicate fightinterior-b: that arm traced a FRESH band (51001–51008)
  and found the wounded-entry shape; this arm reproduces the SAME seed.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: INAPPLICABLE (no armed leg — same as
  killersurvive-a; the panel runs its own full panel and takes no
  corpus input, so do not fabricate a compare .md).
- `scripts/telemetry-check.js`: run
  `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current '<per-seed-evidence-glob>' --metrics national,table,wins,exiled`
  and record the result (expected REFUSED on the recorder corpus —
  record it as the result, do not roll the baseline).

## Metric review (pre-run note)

- The damage account is ledger-based (`tbDamage` hit log + entry HP
  from the fight object at `startCombat`), not SAY-based — the
  finishprobe reclassification (SAY "got away" ≠ engine mFlee) applies
  here too: a kill is classified by the engine record (waveKillLog +
  killsLive + tbEnd outcome), never by a narration line.
- Direct HP writes that bypass `tbDamage` are NOT captured by the
  recorder (fightinterior instrument caveat); no such path is known to
  carry fight damage on this engine. If the damage account does NOT sum
  to entry HP, that gap is reported as the finding (a non-tbDamage kill
  path), not papered over — the account must close, or the miss must be
  named.
- The Congregation's signature (sigW4.js): invite-then-absolve liturgy;
  heresy deals 25 damage via `tbDamage` (captured); the Absolution beam
  is [50,70] with windup 2. A 1-round solo kill of a 900–1100 HP beast
  by strikes alone is arithmetically impossible at measured damage
  rates (fightinterior-b: median 28 dmg/round with company) — so the
  trace is expected to show either a deeply wounded entry or a
  non-strike damage source, and either answer is a DIAG-GO if the
  account closes.
- The `fights` array in the corpus holds one Congregation entry only
  (d149, player-tb). If the fresh leg's trace shows a wounded entry
  with no prior fight on record, the wounding channel itself (field
  grind unrecorded? spawn HP roll? a prior fight the instrument does
  not see?) becomes the open question, reported as such.
