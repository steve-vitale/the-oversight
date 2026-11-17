# Journey deepening r227 — run note

- Run: r227, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222/r226)
- Run id: playtest-a-20261117T0420Z (lock playtest-loop-a-2026-11-17T03:43:48Z)
- Base: master 2ac3052b0 (worktree journey-deepening, registered 03:47Z; registration queued ~27 min on the registry lock + slow `git reset --hard` under load average 12–21 — live reaper self-contention, same family as r222/r226)
- Policy: competent + MUSTER POLICY (new, driver-only — no src/js change): when the Herald omen reaches stage 2 (located) and the Herald is present, sound the call (once per link-count change), sit the war council once, commit Haven's blades (two-tap) once. Fight policy gains a titan carve-out: a titan fight with a ready muster is not fled on solo-HP math. No seek-the-titan pathfinding.
- Seeds: 102501–102508 (fresh band; full check in the prereg — 102401–102408 REJECTED as used by sim-launchsurvive-a)
- Driver: fork of scripts/journey-deepening-r226-20261116.js (band + tag + EVIDIR date + musterPlay/musterDecision + titan carve-out + musterLog/musterSayCounts in the per-seed JSON). Analyzer: fork of scripts/analyze-journey-deepening-r226-20261116.js + summarizeMusterPolicy + taughtRate denominator floor (r226 metric-review owed item). Proof tests: muster 12/12 green, analyzer 41/41 green.
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing >= 100 + readiness bars; observation channel: 2 survived encounters → trick). NO canon doc covers titans/muster — mechanism grounded in src/js/titans.js + src/data/titans.json (Herald: wave 4, minAllies 10, monster "herald"; omen needs wave >= 4 AND scaleRank regional+, 0.10/day; no_solo_titans hard-refuses startCombat without a complete muster; commit_own_is_explicit; soundTitanCall asks each allied link — 2 blades base, 6 if trust >= 70 and opinion >= 10, REFUSES if trust < 25 / opinion < -10 / arrears > 0 with trust −8 per refusal).

## Q1 — MUSTER POLICY: GO (MUSTER-SLAIN)

Verdict: **MUSTER-SLAIN**. The machine works when someone sounds the call.
The r226 blank was a drive/policy gap, not a broken machine — but the panel
pins the two layers that bind NEXT: coalition size and the march.

- The call was sounded on 7/7 seeds with a located omen (102502 lost its
  village at day 46, before any omen). 31 muster verbs panel-wide (r226:
  0). Councils sat 7/7. Haven blades committed 7/7.
- **Musters completed on 2/7** (102501: 10 allies + 1 haven = 11, ready
  day 90; 102506: 13 allies + 1 haven = 14, ready day 90; 102508 reached
  11 after its second call, ready day 85 — so 3/7 reached ready at some
  point, 2 still ready at end). The re-sound rule worked: 102505, 102507
  and 102508 all sounded a second call when a new link formed.
- **A titan fight happened and was WON: 102508, day 97, 54 rounds, party
  of 13 (scholar + 4 villagers + 8 allies), the Herald at 517/700 when
  the fight opened** (already mauled by field meetings). The titan
  carve-out fired (stood=1 — the scholar stood in the coalition fight
  instead of fleeing on solo-HP math). slain=true, muster cleared after.
- The binding constraint is now coalition size: **5/7 musters stalled
  below 10 blades.** 102505 finished 9/10 — ONE short. 102503 finished
  8/10 — two short. 102504 and 102507 finished 4/10. The quota math is
  the story: 2 blades per link at base trust, 6 only at trust >= 70 and
  opinion >= 10. With 3–4 links and no trusted link, 6–8 allies + 3
  Haven blades lands at 9–11 — right on the edge. Refusals: 102507 heard
  FIVE (all three links refused — village_2 and village_3 carry arrears
  of 33,750 and 45,000; the third link's trust is 6). By day 100 the
  village_3 link had BROKEN and a new link to village_3 carried arrears
  of 56,250. **The muster is gated by debt, not just trust.**
- The march/seek gap is measured, not assumed: **2 musters sat ready for
  10–11 days with the Herald present and no fight fired** (102501 ready
  day 90, Herald present to day 100; 102506 ready day 90, present to
  day 98). The scholar never met the Herald in the field in that window
  even though villagers mauled it (102501: 700→2 HP; 102506: 700→80 HP;
  102504: 700→1 HP — the r226 1-HP image reproduces twice). Even the
  seed that fought took 12 days from ready (day 85) to fight (day 97),
  and the fight fired at the haven tile — the Herald came to Haven.
- w4stuck1: 4/8 seeds (102503, 102505, 102506, 102508) — BELOW the >= 6
  prereg bar, so the r226 thin spot does not reproduce at the bar level.
- Wave-4: 24 fights, 5 kills (r226: 34/9); banked 2 on 1 seed (102506);
  wave 5 unlocked on 1 (102506, day 99), faced day 101, KILLED (solo
  scholar, party size 1 — a wave-5 kill by a lone scholar on day 101;
  deathsW5=1). Attribution caution: different band; r226 noted band
  composition moves these numbers.
- Scholar deaths: 23 total, 11 wild (r226: 20/13). Survival 7/8 (r226:
  8/8) — 102502 scattered from hunger at day 46 (3 starvation deaths;
  the panel's only hunger deaths).

## Q1-TRICK (carried): FLOWS

- taughtRate: null — countered12 EMPTY panel-wide (0/8 seeds have a
  slain-unknown wave 1–2 countered type at day 100). The r227 floor
  reports null instead of a rate; the wave 1–2 pipeline is fully
  drained, not broken. Same shape as r226.
- learnedRate: 0.6 — 9/15 wave-3+ signature tricks learned (redactor,
  callback, algorithm, influencer, herald, spool, ad_break, strike,
  suburb). Unlearned: chorus_line, focus_group, terms_of_service,
  editor, buffering, gavel.
- asks: 112 beasttricks asks panel-wide, 16 taught, 96 none-no-counter,
  **0 none-other** (the r92 bug class never fires).
- stallW12: 8× no-countered12. stallW3plus: 8× flows.

## NEW DEFECT (documented, not fixed): FIELD-KILL DOESN'T RESOLVE THE TITAN

- **102506, day 98: villagers killed the Herald in the field** (engine
  telemetry death event: who='herald', cause='villager combat'). The
  Herald is absent from the world census on days 99–100 (titanDays 9,
  days 90–98; last HP 80) — the kill is real, corroborated by two
  instruments.
- **But the game never noticed:** state.titans.slain.herald is still
  unset at end, the omen sits at stage 2, and the muster (13 allies + 1
  haven) kept charging upkeep through day 101 (lastUpkeep 101). On
  102508, where the Herald died in the muster fight, slain=true and the
  muster cleared. The slain flag is set ONLY by titanResolveFight (the
  tbEnd path for a muster fight, titans.js:1498); a villager field-kill
  never reaches it.
- **Fix brief (owed, needs its own arm + prereg):** reconcile in
  titanDawnTick — for each live titan with omen stage 2 and not slain,
  if the titan monster is absent from the world census AND a telemetry
  death for that monster id is recorded, mark it slain, say it aloud,
  and stand the muster down (release allies/haven, stop upkeep).
  Record the outcome distinctly ('slain-field') so the key's gate can
  tell it apart from a muster slay.
- **Open design call (Steve's, not made here):** villagers ground the
  Herald 700→2 HP by attrition on 102501 and 700→1 on 102504 without
  any muster. Should field fights be able to grind a titan down at all,
  or is the muster the only honest way to kill one? The bookkeeping fix
  above does not answer that — it only stops charging upkeep for a
  corpse. Do not conflate the two.

## Q2 — PEOPLE CHECK: PASS

- **Day 80 Nino (102501, trust 96, repay want): short, honest, human.**
  Nino wants to repay a food debt ("I need something to do. Anything.
  Please."); the scholar deflects ("Don't worry about it."); Nino
  accepts but keeps turning it over ("It's done now. I keep turning it
  over anyway.") — a deflection with a lingering cost, not a clean
  resolution. No lecture, no agency-pick pileup: the r226 cap holds.
- **Day 60 Brian (102503, trust 93, hungry, ask_favor): genuinely
  human.** A lived opening ("Never mind the creek water run — we got it
  handled. Thanks anyway.") before the real need (food, running on
  empty). The door-side requirement is stated plainly, the scholar
  commits, the want resolves as promised. No filler.
- The winddown/closing-line duplication persists (closing line == first
  winddown line in both transcripts) — the known transcript-capture
  artifact from r226, not a UI bug. Noted, not fixed.

## Q3 — census (plain words)

Eight villages, 100 days. **7/8 survived** (r226: 8/8). 67 living at end
(7–10 per village).

- **The living:** 102505 is the strong one (10 alive); 102501/102503/
  102504/102506/102507 hold 9; 102508 holds 7; 102502 holds 5, lost.
- **The dying:** ~453 death records. Causes: villager combat 262 (mostly
  villagers killing monsters in the field), expedition 91, combat 56,
  the wild 11 (scholar), monster 7, the arena 5, a stranger 4, starvation
  3 (all 102502), a wound that wouldn't close 4, sickness 2, the night
  2, Gavel 1, dehydration 1, thirst 1. The villages die fighting and on
  expeditions, not hungry — same shape as every deepening panel, except
  102502, which scattered from hunger.
- **Scholar deaths:** 23 across the panel (11 in the wild). Successions
  carried on every time; no village was lost for lack of a successor.
- **What they knew:** 17–35 counters known per village at end; 1–5
  wave-3 signature tricks held. Ladder: stage 3 on all 8 seeds (first
  stage day 14 on 102501); 102501 reached GLOBAL scale (standing 184);
  the rest regional (standing 75–265).
- **Social life:** bond telemetry — proposals 7–10 per seed; link raises
  frequent; ask_favor sittings land (promised/stated).

## Reachable / fun / winnable

- **Reachable: YES.** Wave 4 reached 7/8, wave 5 unlocked on 1 and
  killed on that seed. The Herald is fightable AND killable when the
  muster is used — the r223/r226 unkillable wall is down in the policy
  sense.
- **Fun: YES.** Conversations are the strength (Nino's lingering debt,
  Brian's creek-water run); the muster itself produces drama (the
  council's readiness gap, the refusals said aloud with reasons, the
  9/10 near-miss).
- **Winnable: NOT YET, but closer.** The chain now reads: muster
  completes 3/7 → titan fight 1/3 ready → titan slain 1/1 fought →
  wave-5 unlocked 1 → killed 1. The next chokes are coalition size
  (trust/arrears gating the 10-blade bar) and the march (ready musters
  waiting 10+ days for a meeting).

## Gate / telemetry

- **Gate: `node scripts/check.js --quick` in the worktree — 334 passed,
  6 failed in 780s** (r226: 330/10). Adjudication: all 6 are the standing
  set, zero attributable to this run — the worktree changes touch no src/
  (driver, analyzer, proof tests, evidence only), and this run's own proof
  tests passed inside the gate (muster 12/12, analyzer 41/41).
  (1) test-measurement-proof-update — staleness ("Proof source inputs are
  not current"). (2) test-measurement-workflow — staleness ("retained
  neutrality proof covers the current Game/controller/harness inputs").
  (3) test-phone-frame-proof — staleness trio (3 sub-failures: retained
  browser inputs / boot-input coverage / phone evidence required).
  (4) test-ladder-bundle-20261108 — control "200 monster turns WITHOUT
  delivery fire the ambient raid — fires 0" (same standing failure as
  r226). (5)+(6) test-living-garden-deed-attainment and
  test-one-person-army-deed-attainment — 120s timeouts in the gate;
  both PASS standalone on the quiet box (living-garden 8/8,
  one-person-army 7/7), confirming the load-artifact reading (same as
  r226/r230).
- **Telemetry: quiet** (8 files, 3 metrics — fightsTotal, wave4,
  standing — no large deviations). Baseline NOT rolled (no LOUD lines;
  the r222-known schema-mismatch line did not appear).

## Metric review

- **taughtRate floor works as designed:** the panel reads taughtRate=null
  (countered12 empty) instead of a spurious 0 — the r226 denominator-of-one
  artifact cannot fire. The (27) proof fixture needed a third countered12
  type (mirror_stag) to keep exercising the rate at 1.0; the (30) panel
  test now trips TRICK-PIPELINE-FINDING via the stall-count bar with
  taughtRate=null, proving the verdict no longer rides on the rate.
- **w4stuck1 bar:** 4/8 vs the >= 6 bar — the r226 thin spot is weaker
  on this band. The bar stays; the stall is real on 4 seeds but not a
  panel-level finding this run.
- **Muster-ready-but-no-fight is now a measured quantity** (2 seeds, 10–11
  days each) — the next deepening prereg should carry a ready→fight
  latency bar, and a seek/march lever would move it.
- **Scholar-deaths watch:** 23 total / 11 wild vs r226 (20/13) — total
  up, wild down; no verdict (watch only, per r222's review).

## Blanks filled / documented

- **FILLED (driver-only, proof 12/12):** the muster policy — the
  competent player now sounds the call, sits the council, and commits
  Haven's blades when the omen locates. Panel verdict MUSTER-SLAIN.
- **FILLED (analyzer, proof 41/41):** summarizeMusterPolicy + taughtRate
  denominator floor.
- **Documented (not fixed):** field-kill doesn't resolve the titan
  (102506) — fix brief above, needs its own arm + prereg; plus the
  Steve design call on whether villagers should grind titans by
  attrition at all.
- **Documented (not fixed):** coalition size (trust/arrears gate) and
  the march/seek gap (ready musters waiting 10+ days) — the next two
  lever briefs for the gaps program.
- **Documented (not fixed):** winddown/closing-line duplication is a
  transcript-capture artifact, not a UI bug.

## Infra notes

- Worktree registration queued ~27 min on the registry lock + slow `git
  reset --hard` (load average 12–21; a sibling sim-nightcarry-baseline
  reset ran concurrently). Heartbeat landed immediately after registration
  and was refreshed at every long step (panel, gate).
- Safe-commit index clobber struck on the prereg/tooling commit
  (cbf2a2a7; all 5 files staged-as-deleted after commit) and was repaired
  via `git ls-tree -r HEAD` + `update-index --add --index-info`, verified
  status empty + diff HEAD empty.
- The analyzer log was written to /tmp/r227-analyzer.log during the run
  (not the repo) and is committed as evidence/2026-11-17/
  journey-deepening-r227-analyzer.log alongside this note.
- Pilot: 1 seed (102501) ran BEFORE the prereg commit to smoke the
  driver (4 verb calls, muster ready day 90); the scored panel re-ran
  all 8 seeds after the commit. The pilot corpus was overwritten by the
  panel run of the same seed.

## Landing

- Committed edfb08543 (frozen prereg + muster-policy driver/analyzer +
  proofs) and f00e6b19e (run note + analyzer log) in the worktree; the
  safe-commit index clobber struck on both commits and was repaired via
  `git ls-tree -r HEAD` + `update-index --add --index-info`, verified
  status empty + diff HEAD empty each time.
- Master moved during the run (Loop B 0215Z+0030Z adoption landed
  7199f371f: companion guard SHIPPED unconditional, expignite DIAG GO,
  nationalsticky DIAG-NO-GO, rumortarget PILOT NO-GO, nightcarry
  INCOMPLETE); rebased clean onto it, proof tests re-run green
  (12/12 muster, 41/41 analyzer), merged ff-only into local master.
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 2→3 written with read-back; lock deleted at closeout.
