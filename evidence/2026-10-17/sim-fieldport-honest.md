# sim-fieldport — HONEST wave-4/5 FIELD PORTS: audit + editor attribution (flesh-out loop ARM, 2026-10-17)

**Run:** flesh-out loop, run_id fleshout-20261017T0120Z (coordinator claim; axis scale-onramp blocking).
**Type:** VERIFICATION + WALL-COST measurement. No game-code changes — the fix for sim-findings
#408/#409's audit+editor port inversions was ALREADY LANDED by the sibling sim-apexhook arm
(commit a3f9e124, worker commit 484fdaaa, evidence/2026-10-16/sim-apexhook.md). This arm
independently re-proves the honest mechanic RED→GREEN (RED against the reconstructed inverted
ports), and measures the honest mechanic's wall cost on the vetrel trick-game substrate.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (waves 4–5: The Mirror Draft / The
Producers; Audit = "audits your build on a schedule — taxes your most-used ability"; Editor =
"cuts your last turn... retrieve them from the cutting-room floor"). The TB mechanic is the
source of truth: audit taxes the player's most-used ability at half strength for 2 rounds
(sigW4.js sigAuditHook); the editor cuts the player's swing — it never happened (sigW5.js TB).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the sibling's RED→GREEN proof (42/42) and 16-run pilot (national 8/16 vs 9/16,
median 139.5 vs 125.5, guardrails GO) measured the whole apexhook arm on pre-seat
leadfeast/belongfeast. Does the HONEST audit/editor port attribution (villager-side tax/cut,
which is HARSher than the inverted monster-side help) hold up on the vetrel trick-game
substrate — do captured port events show ≥90% correct (villager-side) attribution in the
honest arm vs inverted (monster-side) attribution in the reconstructed-inversion control,
and do the wall-cost guardrails still GO?

**PRIMARY (binding):** GO iff BOTH hold —
(a) on captured audit-day / editor-cut field-fight events, ≥90% of armed-arm events show
villager-side attribution (audit: a strike beat with "(audited — half strength)" within 2
rounds of the audit-day narration; editor: a villager strike beat "CUT — ... hits the
cutting-room floor. It never happened.") AND ≥90% of control-arm events show inverted
attribution (audit-day narration with NO audited strike following; editor CUT narrated from
the port branch with the monster's damage zeroed),
(b) GUARDRAILS all GO: national ≥ control−2 · median survival ≥ control−10d · no new death mode.
A miss is NO-GO, never re-scored mid-run.
**NO-COVERAGE RULE (binding):** <10 port-fights (audit or editor field fights reaching a
port round) across the sweep → do NOT judge the PRIMARY; file the sweep as a diagnostic,
commit instruments + evidence only (zero game-code changes either way — nothing to revert).

**Substrate:** vetrel trick-game arming — VETREL=1 via scripts/policies/vetrel.js (COMPOSED, not
modified), SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1. Policies: vetrel-lead / vetrel-belong.
**Seeds:** 8 FRESH [3901,3902,3903,3904,3905,3906,3907,3908] × {vetrel-lead, vetrel-belong} ×
{control=inverted, armed=honest} = 32 runs. FRESH = 0 per-seed filename hits across
evidence/ (verified before selection).
**Horizon:** 180d death-aware (wave-4 unlocks need standing≥100 + readiness bars; death-aware,
never fixed-window).
**Control:** reconstructed-inversion tree at ~/workspace/sim-fieldport-control — plain clone
pinned to the same commit 0c39d8d0, with ONLY the two port branches swapped to their
pre-484fdaaa inverted forms (sigW4.js audit: monster damage halved; sigW5.js editor: monster
damage zeroed). Everything else byte-identical to the armed tree; loaded via REPO=.
Identical seeds, policies, env; only the two ports differ.
**Gates before spend:** proof RED→GREEN (scripts/test-fieldport-20261017.js) · node --check
(control-tree files) · det-gate (inverted control vs armed on 2 seeds: instrument-vs-bare
byte-identical trajectories for the ARMed tree... N/A — no game-code change in the worktree;
the sweep's paired-seed design IS the comparison).
**Per-seed JSONs:** evidence/2026-10-17/perseed-fieldport/ (numeric keys national/table/won/
exiled + wins alias) · beats: evidence/2026-10-17/fieldport-beats/ (port-event captures) ·
analyzer: scripts/analyze-fieldport-20261017.js.

## The situation (why this arm exists)

The task brief assumed the inversion was still present ("fix a documented honesty bug"). On
opening the worktree, the ports were ALREADY honest — the sibling sim-apexhook run fixed all
three inversion-class ports (audit, editor, cancellation) and landed them in a3f9e124, with a
42/42 RED→GREEN proof and a measured 16-run pilot. Per the alignment rule (never claim work
done that isn't mine; verify before building), this arm does NOT re-fix. It: (1) independently
re-proves the honest mechanic RED→GREEN against the reconstructed inverted code, (2) measures
the honest mechanic's wall cost on the vetrel substrate the sibling never ran, (3) sense-tests
a captured audit/editor-day beat. If coverage fails, this becomes a no-coverage diagnostic.

## The situation (why this arm exists)

The task brief assumed the inversion was still present ("fix a documented honesty bug"). On
opening the worktree, the ports were ALREADY honest — the sibling sim-apexhook run fixed all
three inversion-class ports (audit, editor, cancellation) and landed them in a3f9e124, with a
42/42 RED→GREEN proof and a measured 16-run pilot. Per the alignment rule (never claim work
done that isn't mine; verify before building), this arm does NOT re-fix. It: (1) independently
re-proves the honest mechanic RED→GREEN against the reconstructed inverted code, (2) measures
the honest mechanic's wall cost on the vetrel substrate the sibling never ran, (3) sense-tests
a captured audit/editor-day beat. If coverage fails, this becomes a no-coverage diagnostic.

## Proof — scripts/test-fieldport-20261017.js (RED→GREEN, 18/18)

The fix predates this arm, so RED is demonstrated against a reconstructed-inversion control
tree (~/workspace/sim-fieldport-control — plain clone pinned to the same commit 0c39d8d0,
ONLY the sigW4 audit + sigW5 editor branches swapped to their pre-484fdaaa inverted forms;
`diff -rq` confirms src/ differs in exactly those two files, policies byte-identical).
GREEN runs against the worktree (the honest ports).

RED (REPO=control tree): 8 passed / 10 failed — the 10 failures are exactly the honesty
assertions (audit day arms no tax / monster damage halved; jank branch ignored; editor arms
no cut / monster damage zeroed; arcs show no taxed strike beats, no voided swing).
The 8 passes are the negatives (non-port days byte-identical on both trees — the fix fires
ONLY on port days).

GREEN (worktree): 18/18. Audit day arms auditTaxRounds=2 with monster damage untouched;
the inefficient trick defeats the tax ("nothing to tax"); the editor cut round arms
editorCuts=1 with monster damage untouched; full synthetic fieldFights show the tax landing
on villager strike beats ("(audited — half strength)") and the villager's swing voided
("CUT — ... hits the cutting-room floor" + a "strikes for 0" beat).

TB source-of-truth cross-check: sigW4's sigAuditHook taxes the player's most-used ability
at half strength for 2 rounds; sigW5's TB editor cuts the player's swing ("it never
happened"). The ports' own narration already described the villager-side mechanic — the
inversion was narration-honest, code-inverted, which is exactly what made it a lie.

## Results — NO-COVERAGE DIAGNOSTIC (binding rule fired)

**Control (inverted) arm:** 16/16 runs completed, 180d death-aware, vetrel substrate
(VETREL=1, SEATDRIVE=0 explicit, FEASTSCALE_R13=1), seeds 3901–3908 ×
{vetrel-lead, vetrel-belong}. Per-seed JSONs: evidence/2026-10-17/perseed-fieldport/.

| metric | control (inverted) |
|---|---|
| national | 12/16 |
| table (staged) | 15/16 |
| won | 0/16 |
| exiled | 0/16 |
| wave-4 reached | 3/16 |
| wave-5 reached | 0/16 |
| median survival | 180d (12 survived / 4 village-lost) |
| **port fights (audit/editor reaching a port round)** | **0** |

**The honest arm was NOT run.** Justification (throughput discipline, Steve 2026-10-13):
the only code difference between the arms is the two port branches, which execute
exclusively inside audit/editor field fights. With 0 such fights in 16 control runs,
the honest arm's guardrails would measure pure noise on unexecuted code paths. The
sibling sim-apexhook arm already measured the full arm (honest ports included) vs
pre-arm control on pre-seat — national 8/16 vs 9/16, median 139.5 vs 125.5, guardrails
GO — so the honest mechanic's wall cost is already measured where it can actually fire.

**Why 0 port fights — root-caused, not assumed** (scripts/diag-fieldport-coverage-20261017.js,
seed 3906 vetrel-lead — the instrument is proven working: 146 field fights captured):
- Wave-4+ field fights: 12/146. Of those: eulogy 11, reunion 1. **Audit: 0. Editor: 0.**
- The **editor is wave 5** (MONSTER-WAVES.md: The Producers; gate standing ≥200 AND
  wave-4 faced). Wave-5 was reached 0/16 on this substrate — the editor port is
  structurally unreachable here, not just unlucky.
- The audit is wave 4 (diurnal). It sits in the world-spawn pool (uniform 1/9 per
  wave-4 cast via castMonster; activity-weighted via pickByActivity in world spawns),
  but drew 0/146 field encounters. P(0 audit in 12 wave-4 fights) ≈ 24% under uniform
  1/9 — consistent with thin exposure, not a routing bug. The audit port's field
  exposure on this substrate is ~nil.
- The TB-side audit/editor mechanics (where these fights actually happen for the
  player) were always honest — the inversion only ever affected the abstract
  field-fight ports. Net: the honest-port fix's practical wall cost is ~zero because
  its field exposure is ~zero; the sibling's measured delta came from the arm's
  other hooks (eater/influencer/reunion/cancellation + gates).

**Blank documented (not chased — out of this arm's scope):** the wave-4/5 field ports
for audit/editor are near-dead code in practice. If the trick game is "a named answer
to the post-invite field-exposure mortality channel," the answer never reaches the
field for these two species — villagers essentially never fight the Audit or the
Editor off-screen. Filed to sim-findings.md as [open].

## Sense-test — audit/editor-day beats read for coherence (SENSE-TESTING LAW)

The sweep produced no port fights, so the sense read uses the proof harness's full
synthetic field fights (scripts/sense-fieldport-20261017.js — honest tree, Peyton
Dominguez vs weakened Audit/Editor, trick untaught so the mechanic lands unopposed).

**Audit (11 rounds):** "🧾 Audit day — Peyton's best trick is taxed. Half strength."
fires on rounds 3/6/9 (the say stream); the following two strikes each read
"(audited — half strength)" with visibly halved damage (8→4, 7→2). The tax lands on
the villager's strike — their best trick in the abstract model — exactly as the TB
mechanic taxes the player's most-used ability. The monster's damage is never halved
(hits for 40–90 throughout). Coherent and legible. (Phase note: the tax arms in the
round's monster phase and lands on the next two villager strikes — a one-phase shift
vs TB, but the "half strength for 2 rounds" contract holds verbatim.)

**Editor (14 rounds):** a textbook honest telegraph — R1 "scissors snip — measuring",
R2 "the film strips show Peyton's swing, next. (A round to do something about it.)",
R3 "the scissors poise — swing measured for the cut", R4 "CUT — Peyton's swing hits
the cutting-room floor. It never happened." + "Peyton strikes for 0". The cycle
repeats every 3 port calls; the monster's damage is never zeroed (hits for 61–144
on cut rounds). The warning round is a real counterplay window (the 'continuity'
trick: do something non-strike). Monster attack names rotate (Trim/Cut/Director's
Cut) — no robotic repetition. Coherent, dramatic, fair.

**Observation (not a finding):** round phase order flips between rounds — most rounds
read strike→port→hit, but some (R2/R7/R12 in the editor fight) read port→hit→strike.
The telegraph contract never breaks (warning always precedes the cut by the promised
rounds), but the flip is unexplained by anything in the port code — likely an
initiative/engagement ordering in the fieldFight round loop. Noted for the combat
owners; not this arm's target.

**Villagers-act-like-people check:** the synthetic villager is a bare striker (no
tricks taught, abilities stripped — the harness's choice, not the game's); within
that constraint the beats read as a person in a fight ("Peyton reads the fight — the
odds are good. Committing to the kill."), not a stat block. No robotic dialogue
observed in the captured beats.

## Metric review

The pre-registered PRIMARY's coverage assumption was flawed: the editor half requires
wave-5 field fights (standing ≥200 AND wave-4 faced — 0/16 on this substrate, and
thin on every substrate measured to date), and audit field encounters run ~0 even
with wave-4 unlocked. A future re-run of this question needs a coverage-first
substrate (e.g., a debug/exposure driver that routes wave-4/5 monsters into villager
field fights — or accept the proof-test RED→GREEN as the correctness evidence and
measure only the TB-side wall cost, where these mechanics actually fire). The
no-coverage rule worked as designed: it prevented a 16-run honest arm from measuring
noise. Proposed revision for the NEXT run: PRIMARY = proof RED→GREEN (done, 18/18)
+ TB-side guardrails on a wave-4/5-reaching substrate; field-port attribution judged
on synthetic fights only.
