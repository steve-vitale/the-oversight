# sim-arenalabel-b — PREREGISTRATION (committed BEFORE any judged run)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T1730Z,
arm sim-arenalabel-b, tracker next blank #1 (follow-up to
sim-grantdeath-b, run fleshout-loop-b-20261028T1635Z, DIAG-GO).

## Gap

sim-grantdeath-b proved tbEnd's 'lost' branch
(src/js/game.js:44253) calls playerDeath('the arena') for
EVERY turn-based loss, but 6/7 reproduced succession deaths
were wild monster encounters interrupting sleep, not arena
contests. A player who reads "dead — the arena" after a
wild-fight death will rightly wonder what arena.

## Canon check (stated before judging, not after)

- docs/CANON.md read first. No canon doc covers tbEnd
  death-cause labels or death narration: the manifest's
  table has no death/narration doc, and docs/CONTESTS.md
  covers contests as played fights (arena fights are real
  tactical fights via _contestArena), which is consistent
  with KEEPING 'the arena' for genuine contest-arena
  losses. Nothing in canon is invented or rewritten here.
- Code rationale for the old label: the GAP-W4-NARR #107
  comment at the tbEnd 'lost' branch describes it as the
  arena loss path (Blood pit / gauntlet / siege). That
  rationale is true for contest-arena fights and false
  for wild fights — which is exactly why the fix is
  origin-labeling, not a rename.

## The lever (game-code, label-only — no mechanics change)

At tbEnd('lost') time, the death cause passed to
playerDeath is chosen by fight origin, via a new Game
method tbFightDeathCause(f) (testable in isolation,
called from the one existing playerDeath site at
game.js:44253; no other playerDeath call site changes):

- state.arenaContest present (a Blood pit / gauntlet /
  siege contest arena fight, set by _contestArena before
  startCombat and still live at tbEnd time) → 'the arena'
  (UNCHANGED).
- Otherwise, PROVEN WILD only: the fight has at least one
  kind:'monster' fighter, NO kind:'hostile' fighter, and
  none of f.betrayal, f.tableTrial, f.coalitionArena →
  'the wild' (the game's own wild fallback word: ledger.js
  playerDeath already uses cause || 'the wild').
- Otherwise (betrayal fights, table-trial fights, titan
  coalition-arena fights, alien-hostile fights, or a
  fight with no monster fighter) → 'the arena'
  (UNCHANGED — conservative fallback, documented as a
  known limit, NOT silently relabeled).

Origin is therefore NOT assumed recorded: it is derived
at tbEnd time from live code state (state.arenaContest
+ f's own flags + fighter kinds), and the mechanism is
documented in the evidence file. No damage, HP, death
rule, cheat/lifeline, or contest-routing change: the
lifeline check, _contestResolveOthers, and the tbEnd
finally-hook (_contestArenaAfter) all run exactly as
before, on the same state, in the same order. The ONLY
observable change is the cause string for proven-wild
tbEnd losses.

## Death-record fields that must agree (named here, not after seeing results)

For every judged death, ALL of these must carry the same
cause, because they all derive from the single playerDeath
argument (ledger.js playerDeath → registerDeath +
fallen push + lineage push + death say line; telemetry
carries registerDeath's record):

1. playerDeath cause argument (grantdeath wrapper record)
2. registerDeath cause (grantdeath wrapper record)
3. fallen entry cause (state.village.fallen)
4. telemetry death-record cause (state.telemetry, type 'death')
5. narration death line: "🕯️ <name> is dead — <cause>."
   (Game.log say line; the cause token inside it must
   match 1–4)

Lineage cause is a sixth derivation of the same argument
but is NOT in the grantdeath corpus output, so it is
checked in the proof-test harness leg (real playerDeath
through tbEnd), not in the band — stated here, not
discovered later. If any of 1–5 disagree for a judged
death, that death FAILS its GO clause (it is not
averaged away).

## Band and substrate (judged)

Instrument: scripts/grantdeath-trace-b.js, UNMODIFIED
(copied driver is not needed — the existing instrument
already captures all five fields above). Env substrate,
identical to grantdeath:
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, LEAD=2 TAPDAYS=5, competent policy.

- PILOT: seeds 10040–10047 (8 seeds) × the 7
  loss-bearing grantdeath keys ONLY (56 instances):
  animal_ken.read_beast, fear_aura.menace,
  molt.shed_skin, ambush.lay_wait,
  blood_trail.follow_blood, patient_aim.clean_shot,
  scarecrow.stage_injury. These are the keys that
  reproduced the 7 grantdeath losses; the other 8
  grantdeath keys lost no grant and add no death signal.
- BEFORE leg: current (pre-change) code, OUTDIR
  evidence/2026-10-28/sim-arenalabel-b-corpus-before.
- AFTER leg: changed code, OUTDIR
  evidence/2026-10-28/sim-arenalabel-b-corpus-after.
  File names inside each corpus keep the grantdeath
  naming (grantdeath-b-s<seed>-<key>.json) so the
  before/after diff is per-instance.
- CONFIRM (only if pilot GO): seeds 10040–10055 (16
  seeds, pilot seeds included) × the same 7 keys,
  before + after legs, OUTDIRs
  sim-arenalabel-b-corpus-confirm-before /
  sim-arenalabel-b-corpus-confirm-after (224 instances).
- Horizon: death-aware by construction — the driver
  runs 2 lead + 5 tap days per instance and dead
  villages stop (endReason recorded); NO fixed 200d
  horizon is imposed anywhere in this arm.

## Primary metric and GO threshold (pre-registered, §14 binds)

PILOT-GO requires ALL of P1–P5:

- P1 REPRODUCTION (before leg): all 7 grantdeath losses
  reproduce — same seeds, same keys, same bearer pairs
  (10041 animal_ken / fear_aura / molt;
  10042 ambush / blood_trail / patient_aim /
  scarecrow), same causes as grantdeath (starvation ×1,
  'the arena' ×6).
- P2 RELABEL (after leg): the 6 tbEnd wild losses read
  'the wild' in ALL FIVE fields above; the starvation
  loss still reads 'starvation' in all five.
- P3 DETERMINISM (before vs after, per instance):
  endReason, grant-loss localization, bearer pairs, and
  tap outcomes identical; EVERY other playerDeath cause
  in the band identical; say lines identical except the
  death lines of the 6 relabeled deaths, where ONLY the
  cause token changes ('the arena' → 'the wild').
- P4 PROOF GREEN: scripts/test-arenalabel-b.js passes
  BEFORE the judged after-band runs (label-function
  legs for arena / wild / betrayal / tableTrial /
  coalitionArena / hostile cases, plus harness legs:
  a real wild fight forced to 'lost' reads 'the wild'
  in all derivations including lineage, and a real
  fight with state.arenaContest set forced to 'lost'
  reads 'the arena').
- P5 ARENA BRANCH: no arena-contest tbEnd loss is
  expected in the pilot band (the band's fights are
  wild sleep-interruptions); the arena branch is
  therefore judged by the proof harness leg (P4), NOT
  by band counts. If an arena-contest loss DOES appear
  in the band, it must read 'the arena' in all five
  fields or pilot FAILS — the vacuity is disclosed, not
  hidden.

CONFIRM-GO (16 seeds, before + after) requires ALL of:

- C1: zero before/after cause differences except
  proven-wild tbEnd losses changing 'the arena' →
  'the wild'.
- C2: every tbEnd wild loss in the after band reads
  'the wild' in all five fields.
- C3: every arena-contest tbEnd loss in the after band
  (if any) reads 'the arena' in all five fields.
- C4: determinism as P3, on all 16 seeds.
- Any tbEnd loss whose origin falls in the conservative
  fallback (betrayal / tableTrial / coalitionArena /
  hostile) is counted and disclosed as
  AMBIGUOUS-UNCHANGED; it does not break GO (its label
  is unchanged by design), but it must be named in the
  evidence file with its seed/key/cause.

A miss on any clause is NO-GO (pilot) or CONFIRM-NO-GO
(confirm) — never re-scored against a friendlier metric
mid-run. Guards (reported, verdict-breaking only if a
clause above breaks): death-related existing tests green
(test-grantdeath-b.js, test-abilities-breakit-r4-20261011.js,
and node scripts/check.js --quick); no other src/js
file changes besides the tbEnd label site + the new
method; no policy-file changes.

## Sense test (pre-registered)

Read at least one before/after death beat from the
corpus sayLines (the 10042 ambush wild loss) and judge
it as a player would read it: does the after line name
the place the player actually died? The verdict in the
evidence file quotes both lines.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

This change has NO before/after game leg that a panel
can judge: it changes no mechanic, no policy, no
number — only a cause string for one death origin.
Panel metrics (national / table / wins, wave reach)
cannot move under a label-only change, and the
determinism clauses (P3/C4) are the binding guard that
they did not. So NO balance-panel compare .md is
produced for this arm, for the same reason as the
grantdeath diagnosis arm. If P3/C4 ever failed, that
would itself be the finding, and a panel compare would
be run before any landing claim.

## Metric review (carried — judged against this prereg as written)

Pre-registered metrics bind the run (§14). A miss is
NO-GO, never re-scored. If the metric proves wrong, it
goes under "metric review" in the evidence file and any
revision applies to the NEXT run. Every evidence file
carries a "metric review" section.
