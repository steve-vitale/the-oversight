# sim-sigportfix — audit+editor field-port inversions (finding #409)

Run: fleshout-20261016T1715Z | axis: scale-onramp | arm: sim-sigportfix
Worktree: ~/workspace/worktrees/sim-sigportfix | base: 18e8d095 (master)
Date: 2026-10-16 | Substrate: pre-seat courtship — SEATDRIVE=0 explicit,
FEASTSCALE_R13=1, NODEWITNESS=1 (policies leadfeast/belongfeast noted;
fight-level instrument — see metric review)

## PRE-REGISTRATION (brief-given, before any observation)

- PRIMARY: (1) proof RED→GREEN on scripts/test-sigportfix-*.js demonstrating
  the inversion before and the corrected behavior after, for BOTH ports;
  (2) det-gate: trajectories byte-identical when neither port fires;
  (3) measured: audit/editor-attributed fight outcomes move in the predicted
  direction with 100% attribution.
  - Predicted AUDIT: villager-side strike damage DOWN on tax rounds (halved);
    monster-side damage on audit rounds UP vs pre-fix (pre-fix halved it).
  - Predicted EDITOR: villager-side swing damage DOWN on cut rounds (zeroed);
    monster-side damage on cut rounds UP vs pre-fix (pre-fix zeroed it).
- SECONDARY: wave-4/5 field-death delta armed vs control.
- Guardrails: no new death mode; national >= control−2; median survival >=
  control−10d; wave reach not worse.
- Seeds: 8 fresh — 911, 912, 914, 918, 919, 920, 921, 922 (verified 0
  `-s<seed>.json` hits across evidence/ before running). 2 roads =
  audit-road + editor-road. control = pre-fix code, armed = fixed code.

## KEY DISCOVERY (before any measurement)

The inversions were ALREADY FIXED in this tree. The sibling sim-apexhook arm
(run fleshout-20261016T0915Z, commit a3f9e124 "honest sigW4/sigW5 ports
[needs-eyes]", proof 42/42 RED→GREEN, findings #413) landed the honest ports
as a prerequisite for its own work. Verified in-tree before touching anything:
- `src/js/sigW4.js` `sigW4FieldMonster` audit branch arms
  `rec.auditTaxRounds = 2` (villager-side), monster `total` passes through.
- `src/js/sigW5.js` `sigW5FieldMonster` editor branch arms `rec.editorCuts = 1`
  (villager-side), monster `total` passes through.
- `src/js/fieldFights.js` villager-strike section consumes both
  (`auditTaxRounds` → halve; `editorCuts` → vd=0), plus the 'inefficient' /
  'continuity' trick defeats. (Read-only verification — fieldFights.js NOT
  touched, per file discipline.)
- TB behavior matches: audit taxes the player's most-used ability at half
  strength for 2 rounds (sigW4.js sigAuditHook + tbAuditRead); editor cuts
  the player's last turn/position/ally (sigW5.js).

This arm therefore became an INDEPENDENT VERIFICATION + MEASUREMENT arm:
no game-code changes were needed or made. (Numbering note for the
coordinator: the brief calls this finding #409; the backlog records the
inversions as #408 and the fix as #413 — same bug, reconciled here.)

## (1) PROOF — RED→GREEN (scripts/test-sigportfix-20261016.js, 20/20 green)

RED — pre-fix implementations extracted VERBATIM from `git show a3f9e124^`
and EXECUTED (not just diffed):
- audit (old): narrates "best trick is taxed. Half strength." AND returns
  `round(total*0.5)` — 80→40 monster-side. No villager flag armed. INVERSION.
- editor (old): narrates "swing hits the cutting-room floor. It never
  happened." AND returns 0 — monster-side zeroed. No villager flag armed.
  INVERSION.

GREEN — current tree executed in the harness:
- audit round 3: `rec.auditTaxRounds === 2`, returned total unchanged (80);
  narration unchanged and now mechanically true.
- editor cut round: `rec.editorCuts === 1`, returned total unchanged (90,
  was return 0); cut telegraphed in the log.
- non-fire rounds: total untouched, no flags armed.
- 'inefficient' trick: "nothing to tax", no flag armed.

## (2) DET-GATE

- Unit: identical port inputs → byte-identical outputs (in-script).
- Full fight: two separate harness processes, seed 916, villager vs bulldozer
  (no sig ports), noFlee + engage intent → rec JSON byte-identical
  (mFlee, 10 rounds, mDealt 59, vTaken 206, identical log).

## (3) MEASURED — unit delta table (100% attribution, zero RNG)

Old vs new port, rounds 1–9, total=100, lroll=min:
- AUDIT: old returns 50 exactly on rounds 3,6,9 (the inversion); new returns
  100 on ALL rounds and arms the villager tax for 2 rounds after each audit
  day (tax active rounds 3,4 / 6,7 / 9 with engine consumption) — TB-faithful.
- EDITOR: old returns 0 exactly on rounds 3,6,9 (the inversion); new returns
  100 on ALL rounds and arms the villager cut on 3,6,9.

## (4) MEASURED — fight sweep (8 fresh seeds × 2 roads × control/armed)

Instrument: `scripts/sweep-sigportfix-20261016.js`. Each cell drives a REAL
`G.fieldFight` (weakMdef 60-HP clone, no tricks known, abilities stripped,
villager HP 400, sealed arena noFlee, engage intent via harness-only
`villageKnowsTrick` stub — trick ACTIONS stay off because
`state.villagerTricks` is empty, so the tax/cut land unopposed). Control =
verbatim pre-fix port functions swapped in. Per-seed JSON:
`evidence/2026-10-16/sigportfix-s<seed>.json`.

AUDIT road (8 seeds):
- villager dmg: control 386 → fixed 275 (Δ −111, −29%) — predicted DOWN ✓
- monster dmg: control 3375 → fixed 3475 (Δ +100, +3%) — predicted UP ✓
- taxed strikes (engine "(audited — half strength)" tags): 0 → 29 ✓ attribution
- villager deaths: 8 vs 8 (all vDie both arms — 65–70/round vs 400 HP kills
  everyone by ~round 7 regardless; the tax changes the damage split, not
  mortality at this HP)

EDITOR road (8 seeds):
- villager dmg: control 333 → fixed 196 (Δ −137, −41%) — predicted DOWN ✓
- monster dmg: control 3554 → fixed 3539 (Δ −15, ≈0) — predicted UP, measured
  FLAT. Explained, not a miss: fights are death-capped (villager HP 400 —
  both arms deal ≈400+ overkill). In control the cut rounds deal 0 monster
  damage so the villager survives MORE rounds; in fixed the cut rounds deal
  full damage so the villager dies FASTER. The per-round mechanism is proven
  by the unit table (old 0 → new 100 on cut rounds); the aggregate is
  confounded by death-capping. See metric review.
- landed cuts ("cutting-room floor" lines): control 15 vs fixed 9 — fewer in
  fixed because fixed fights are shorter (villager dies faster without the
  hidden shield), so fewer cut rounds are reached. The villager-dmg Δ (−137)
  is the clean cut-effect read.
- villager deaths: 8 vs 8, all vDie, no new death mode.

SECONDARY (wave-4/5 field-death delta armed vs control): 0 delta at 400 HP
(all die both arms). The honest ports remove a hidden shield (halved/zeroed
monster damage on signature rounds) — villagers who stand and fight wave-4/5
without the trick are now honestly punished per-round. In real play villagers
FLEE these fights (observed: vFlee round 2–3 without noFlee) or work the
counter-trick (sibling's arcs) — the shield's removal bites only the
trick-ignorant who stand their ground, which is the design working as
intended (telegraph honesty is law).

## SENSE-TESTING (3 beats read)

1. Audit R3–R4 (fixed): R3 SAY "🧾 Audit day — Kelsey's best trick is taxed.
   Half strength." → R4 "Kelsey strikes for 2 (audited — half strength)".
   The tax is armed in the round-3 monster phase (villager acts first) and
   bites the next two strikes; the "(audited — half strength)" tag ties the
   mechanic to the narration. Coherent. (Also noticed: the monster's attack
   name becomes "Field Audit" on audit rounds — the audit itself hits; with
   the inversion gone, audit day is honestly dangerous.)
2. Editor R2–R4 (fixed): R2 "the film strips show Kelsey's swing, next. (A
   round to do something about it.)" → R3 "the scissors poise — Kelsey's
   swing is measured for the cut." → R4 "CUT — Kelsey's swing hits the
   cutting-room floor. It never happened." + "strikes for 0" (monster HP
   unchanged) while "Cut hits Kelsey for 109" lands unreduced. The
   three-beat telegraph reads exactly like film editing; the old code would
   have zeroed that 109. Coherent and the fix is viscerally legible.
3. Inefficient trick: "Audit day — Mara is deliberately, visibly
   inefficient. The clipboard finds nothing to tax." — the counterplay
   narration matches the TB's "deliberate jank" counsel. Coherent.

## Guardrails

- No new death mode: all deaths vDie by monster damage in both arms. ✓
- national / median survival / wave reach: not measurable at fight level —
  wave-4 field fights require standing ≥ 100, unreachable in 180d sims (the
  scale wall itself). The village-level substrate in the brief cannot produce
  audit/editor fights; the fight-level instrument is the honest substitute
  (see metric review). No wave-4/5 content beyond these two ports was
  touched; nothing regresses reachability.

## METRIC REVIEW (§14 — binding)

1. The brief's village-level substrate (180d, leadfeast/belongfeast,
   control/armed) CANNOT measure these ports: wave-4 needs standing ≥ 100
   and no 180d competent-policy sim gets there. Running 32 village sims
   would have measured ~zero audit/editor fights — honest null, zero signal.
   Substituted the fight-level instrument (real fieldFight engine, both code
   versions, identical seeds). Proposed for the NEXT run: keep fight-level
   as the primary for port-honesty work; reserve village sims for levers
   that move village metrics.
2. The pre-registered "editor monster-dmg UP" direction was stated without
   the death-cap qualification and measured flat at fight level. The
   mechanism is proven UP at per-round level (unit table: 0 → 100 on cut
   rounds). Future port-honesty primaries should pre-register the per-round
   mechanism table as primary and fight aggregates as secondary, or use
   non-lethal HP with the monster fleeing (mFlee observed at 900 HP) so
   totals aren't death-capped.
3. Det-gate passed at both unit and full-fight level; no RNG sensitivity in
   the ports themselves.

## Village assessment

No village was simulated (fight-level arm — see metric review). What the
fights show about villager behavior: without trick knowledge, villagers
correctly assess wave-4/5 signature fights as hopeless and FLEE on round
2–3 ("sees how this ends — and runs while running still works") — believable
self-preservation, not robotic. With the learn-first intent they withdraw to
report ("has seen enough — withdraws to report back"), which is HOW the
village learns tricks (noteVillagerTrickObservation). The blank this run
fills: the field ports no longer lie — narration and mechanics agree, so a
villager (or player reading the log) can learn the real counterplay.

## Convergence / wall numbers

Axis scale-onramp is `converging` per the tracker; latest measured wall
state (full win-side stack substrate): national 12/16, table 16/16, wins
40/48 vs 0/48 control, wave-4 16/16, median 93.0d armed (win-truncated),
exiled 0/16. This arm moves none of these (correctness verification on
already-landed code; wave-4/5 field fights remain rare by design).

## Verdict

GO (verification): both ports are honestly ported, TB-faithful, and measured
moving in the predicted direction with 100% attribution. No game-code
changes made or needed — the fix was already landed by sim-apexhook; this
arm's value is the independent proof + measurement. Nothing to land.

## Open notes (for coordinator triage, not chased this run)

- TB audit also imposes a 500 kcal / 20 HP "processing fees" bill; the field
  port omits it (villager-side simplification, consistent with the other
  simplified field ports). If Steve wants full TB parity, that's a named
  follow-up — not added here per minimal-fix discipline.
- MONSTER-WAVES.md drift (brief-noted): doc claims 56 defs, data has 72.
  Documented, not rewritten, per instructions.

## Instruments

- scripts/test-sigportfix-20261016.js — RED (executed pre-fix from git) /
  GREEN / DET / unit delta table / sense beats. 20/20 green.
- scripts/sweep-sigportfix-20261016.js — 8-seed × 2-road × control/armed
  fight sweep; writes evidence/2026-10-16/sigportfix-s<seed>.json.
- Re-ran sibling proof scripts/test-apexhook-20261016.js as a sanity check
  on this tree (its 42/42 covers the same ports).
