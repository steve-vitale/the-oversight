# Journey — deepening r232 (2026-11-17)

**Leg:** deepening (days 40–80, DAYCAP 100) · **Base:** master `b4cdf252d`
(journey-establishment r231 closeout) · **Seeds:** 103301–103308, fresh
(full freshness check in the prereg; 0 hits anywhere) · **Policy:**
competent + muster policy (r227 verbatim, driver-only) + march step
(r228 verbatim, driver-only) · **Arms:** A = control (master, no fix),
run first; B = fix (src/js/titans.js), run second · **Driver:**
`scripts/journey-deepening-r232-20261117.js` · **Analyzer:**
`scripts/analyze-journey-deepening-r232-20261117.js` (single-arm, ARM=A/B)
· **Prereg:** `evidence/2026-11-17/journey-deepening-r232-prereg.md`
(run id `playtest-a-20261117T0920Z`).

## Pre-registered questions

- **Q1 — SLAIN-FIELD FIX (primary, before/after):** a villager field-kill
  of a titan must reconcile at the next dawn — slain set, outcome
  `'slain-field'`, muster cleared, upkeep stops. GO requires all three:
  ≥1 opportunity on B with EVERY opportunity reconciled; 0 false
  reconciliations on B; defect reproduces on A (≥1 opportunity left
  unreconciled). **0 opportunities panel-wide = UNMEASURED, not NO-GO**
  (fix then judged by proof test + code review).
- **Q2 — MARCH vs FULL-STRENGTH TITAN (secondary, diagnostic, both arms
  combined):** for each titan fight from a ready muster, record Herald HP
  at fight start and outcome. Interesting if ≥1 fight engages a Herald at
  ≥50% HP (350/700). No GO/NO-GO rides on this.
- **Q3 — PEOPLE CHECK:** read 1–2 full transcripts (convo days 45/60/80)
  in full; also read muster/march/fight voice in full on ≥1 seed.
- **Q4 — CENSUS + reachable/fun/winnable.** Carried: w4stuck1 (bar ≥6/8),
  trick pipeline, w4fights/w4kills, banked veterans, w5
  unlocked/faced/killed.

## The fix (landed this run)

**`src/js/titans.js` — `titanReconcileFieldSlain(day)`, called from
`titanDawnTick` after the omen advance and BEFORE `titanMusterUpkeep`.**
For every located (omen stage ≥2), unslain titan whose monster is absent
from the world AND whose death is recorded (telemetry death `who`=monster
id, OR `state.villageSlain[monster] >= 1` — both engine kill records from
the same vKill branch; the OR covers the 300-entry telemetry cap): mark
slain, say it aloud (naming the killer when the corpse names one),
release the committed, clear the muster (upkeep stops), `ledgerAdd('titan',
'slew:<tid>')`, `recordMoment`, record the outcome `'slain-field'` —
distinctly from the muster-fight `'slain'`. No relic, no viewership bump,
no System broadcast: those are muster-fight spectacle beats, and a field
kill is not a spectacle. The muster-fight path is untouched
(`titanVictory` already sets slain, so this never fires for a titan the
coalition slew). This answers only whether the corpse stops being billed —
NOT whether villagers should be able to grind titans by attrition (Steve
design call, still owed).

**Proof test `scripts/test-titan-slainfield-20261117.js`: 37 passed,
0 failed.** The fixture reproduces the vKill branch's three engine
effects with the engine's own calls (`recordWaveKill` + `registerDeath`
+ `removeWorldMonster`) after a real council→call→commit muster. Cases:
full reconciliation at the next dawn (slain, `'slain-field'`, muster
cleared, committed released, said aloud naming the killer, ledger
`'slew:'`, moment, upkeep stops, no relic/viewership/sysSay); living
titan → no-op; absent without a kill record → no-op; already-slain → no
duplicate; muster-fight slay path unchanged (still broadcasts, still
+10 viewership, still `'slew:'`, no `'slain-field'` after); telemetry-only
signal reconciles; villageSlain-only signal reconciles; stage < 2 →
no-op; corpse gone by dawn → unnamed line still reconciles.
**Red verified:** with the fix reverted the same test reads 26 passed,
11 failed — the 11 failures are exactly the reconciliation cases — and
the red run shows the defect's cost in the open: the muster keeps
charging ("The muster is hungry — 0 of 2,000 kcal fed") after the kill.
All 7 titan suites green (`test-titan-*.js`: 12x12 7/7, class 32/32,
load ALL PASS, piece-holds 12/12, slainfield 37/37, standdown 19/19,
variety 12/12).

**Pilot catch (analyzer):** the pilot seed (103301 arm A) slew the Herald
in a muster fight (8 blades, won, day 57) — and the analyzer's first
draft counted that death row + absent monster as a slain-field
opportunity, which would have read DEFECT on a healthy seed. A
muster-fight slay is not an opportunity: the titan is already accounted
for (outcomes `'slain'`). Exclusion added
(`scripts/analyze-journey-deepening-r232-20261117.js`,
`summarizeSlainField`), proof case (54) added to the analyzer test
(53 passed, 0 failed).

## Q1 — SLAIN-FIELD: UNMEASURED (both arms)

- **Arm A: opportunities=0, reconciled=0, defectReproduced=0,
  noDawnLeft=0, false=0 → SLAIN-FIELD-UNMEASURED.**
- **Arm B: identical → SLAIN-FIELD-UNMEASURED.**
- This is real, not an analyzer miss. Direct read of all 16 seed JSONs:
  the only titan death in the whole panel is 103301's muster-fight slay
  (death tele day 57, cause `'combat'`, outcome `'slain'`,
  `villageSlainTitan={herald:1}`); every other seed has no titan death
  row, no `'slain'` outcome, empty `villageSlainTitan`. No villager
  field-killed a titan on either arm — so the A-leg "defect reproduces"
  is unmeasured too, and the prereg's UNMEASURED clause applies: **the
  fix is judged by its proof test (37/37, red verified) + code review,
  not by this panel.** The pool is thinner than the prereg assumed:
  r227 saw 1 field kill in 8 seeds; r232 saw 0 in 16.
- The B panel is otherwise byte-identical in trajectory to A (after
  normalizing the arm tag, all 8 seed JSONs match exactly) — the fix
  changed nothing on these seeds, as expected with 0 opportunities: it
  only fires when a field kill exists.

## Q2 — MARCH vs FULL-STRENGTH TITAN: MARCH-SLAIN (both arms)

- **March: 9 march-days, 4 arrivals, 4 march-completed fights, 1 slain,
  0 fought-off-march → MARCH-SLAIN.** The lagged join holds (fight on
  arrival day or the day after, same titan).
- **All 4 fights engaged a FULL-STRENGTH Herald (700/700 HP at fight
  start).** This answers r228's named question: yes — a marched muster
  engages a full-strength titan, and can kill one.
  - 103301: ready d56 → fight d57, **SLAIN** (8 blades, latency 1).
  - 103306: ready d75 → fight d76, fled (latency 1).
  - 103308: ready d66 → fights d72 + d86, both fled (latency 6;
    march held `blocked-at:7,4` ×5 before arriving).
- Ready→fight latency: 1, 1, 6 days (r228 owed this bar; the march does
  not sit ready for weeks — when it is ready, it goes).

## Muster policy + the coalition choke

- **Called 6/8, ready 3/8, fought 3/3 ready, slain 1** (both arms).
- The Herald needs **10 allied blades** (`minAllies: 10` in
  `src/data/titans.json`). The three seeds that never fought sat just
  under it for weeks: 103302 gathered 7 blades (titan present 22 days),
  103303 gathered 9 (32 days), 103307 gathered 8 (42 days). The three
  that fought all reached exactly 10 (103301: 8 allies + 2 haven;
  103306: 8 + 2; 103308: first muster ≥10). The choke is the coalition
  bar, same as r227 — and it is a *near* miss, not a far one: one more
  blade on any of the three stuck seeds and the muster marches.
- 103308 re-called after the first muster routed (d72) and gathered 20
  allies across two calls — the call can be sounded again, and the
  village keeps answering.
- **Refusal spam (finding):** the hard gate works, but it talks every
  time. 103307 logged **41 `'refused'` outcomes** (all gate `'muster'`,
  10 distinct days) and 103308 logged **31** (4 days) as the scholar
  kept meeting the Herald without a ready muster — each attempt says
  the "you cannot face this alone" line aloud and records an outcome.
  The player hears the same refusal ~4–8 times a day while camped at
  the lair. Not fixed here (out of scope); owed as a small follow-up:
  the refusal should be said once per titan per day, or the encounter
  should stop offering a fight the gate will refuse.

## Q4 — census

- **Survival 8/8 both arms** (r227: 7/8). Pop at end 5–10. All villages
  reached wave 4; ladder stage 3 at d80 on all 8 seeds.
- **Wave 4: 22 fights, 4 kills** (r227: 24/5), killsPerSeed 0.5.
  Per-seed: 103301 2 fights/1 kill, 103302 3/2, 103303 3/0, 103304 1/0,
  103305 1/0, 103306 5/1, 103307 3/0, 103308 4/0. **Banked veterans
  (2+): 0/8. Wave 5 unlocked: 0/8, faced 0, killed 0** (r227: 1
  unlocked, 1 killed). **w4stuck1: 4/8 — bar ≥6/8 MISSED** (same as
  r227's 4/8).
- **Trick pipeline: TRICK-PIPELINE-FLOWS**, taughtRate=null (no
  countered wave 1–2 types — the r227 floor holds), learnedRate 0.583,
  w4killsKnown=1, w4killsUnknown=3.
- **Scholar deaths: 17 total, 13 wild** (r227: 23 total, 11 wild).
- **Titan panel: TITAN-MUSTER-MOVED** (6/8 seeds had titans, 158
  titan-days, 28 verb calls, 1 slain). **Muster policy:
  MUSTER-SLAIN.**
- Carried conversation watches (arm A; B identical): FIZZLE-FIX HOLDS
  (0 dry sittings), DOUBLE-ASK 0, MENU-FLIP 0 flips, LADDER-OPENS +
  minted 5/5 tracks, BOND-TELEMETRY PRESENT (198 tele, 97 proposals,
  52% accept), Q1-REQUESTS REACHED. GOALS-FAULT tracks bank_veterans
  and knowledge (0 lined) are pre-existing program notes, not this
  run's question.

## Q3 — people check

Read in full: **103301 day 60 — Aki (fisherman, prickly, trust 90)**
and **103301 day 80 — Boris (blacksmith, steady, trust 96,
grieving).** Both pass the sense test.

- Aki wants help hauling water at first light — concrete, reasoned
  (9 liters left, two of us, half the trips). The player's "why not
  now?" gets a real answer (stand beside your partner first, same side
  of the Haven door), the commit gets an honest deferral (he's out on
  the road, can't promise a dawn meet — find him when he's back), and
  the sitting then turns to real teaching (hazelnut, poison hemlock).
  The want stays `stated`, not `promised` — honest, not a bug.
- Boris, grieving, re-asks a pantry run (fromSeed) and then asks the
  player to walk his trap line — a second, different ask in one
  sitting, fitting a man who wants company. The player accepts, and
  Boris shows the player where he goes to think: "Don't tell the
  others. Everyone needs one place." A real moment; the closing line
  fits the mood ("I'll be okay. Don't worry about me...").
- Nits (pre-existing, not this run's fix): the favor-requirements line
  is the same system wording across villagers; the winddown lines
  ("...Think about it? I'll be around.", "Same time tomorrow, maybe.")
  repeat verbatim across sittings and sit oddly after Boris's
  secret-sharing moment.
- **Muster/march/fight voice:** the driver's `sayLines` capture is
  empty in the seed JSONs (pre-existing instrumentation gap — the voice
  was read from the proof test + source instead). The fix's own voice
  is proven in the test (killer named aloud, unnamed fallback when the
  corpse is gone). Muster counts: answers 2–10 per seed, refusals 0–1;
  the refusal line itself ("You cannot face this alone... This is not
  courage. This is arithmetic.") is the spam noted above.

## Village assessment (plain words)

Eight villages, all alive at day 100. The Herald came to six of them.
Three mustered ten blades, marched, and fought him at full strength —
one village killed him outright the day after the call (103301, eight
blades, one morning's fight). Three more villages spent weeks one or
two blades short of the ten the gate demands, calling and waiting while
the Herald fed in the night — and the scholar, camped at the lair,
was turned away from the fight dozens of times, each time told the
same thing. Nobody reached wave 5: no village banked two veterans,
so the door never opened. The people themselves are alive and talking
like people — asking for water hauls and pantry runs, showing each
other where they go to think — but the coalition is the wall: ten
blades is a near miss for half the villages, and a near miss that
lasts a month is a wall.

## Reachable / fun / winnable

- **Reachable: YES for wave 4 + the muster.** The call sounds, the
  muster forms, the march arrives, the fight engages at full strength.
  The coalition path works when it forms (103301).
- **Fun: PARTLY.** The muster fight is a real event (won once, routed
  twice). The stuck seeds are not fun: weeks of calling, waiting, and
  being refused at the lair with the same line, no new information
  about what would close the one-blade gap.
- **Winnable: NO on this band.** Wave 5 unlocked 0/8 — the binding
  wall is still the veteran bar (banked2 0/8) and the deed gate, not
  the titan fight. The fix does not move winnability; it stops a
  corpse being billed.

## Gate / telemetry

- **Gate: `node scripts/check.js --quick` in the worktree — 334 passed,
  6 failed in 838s** (first run, under load 9–12 with a sibling check
  running concurrently: 330/10, with 3 known 120s timeouts). The re-run
  on the quieter box matches r227's 334/6 exactly. Adjudication: all 6
  are the standing set, **zero attributable to this run** — the worktree
  changes touch src/js/titans.js only via the dawn reconciliation (plus
  driver/analyzer/proof tests/evidence), and none of the 6 suites touch
  titans or the dawn tick. (1) test-measurement-proof-update — staleness
  ("Proof source inputs are not current"). (2)
  test-measurement-workflow — staleness ("retained neutrality proof
  covers the current Game/controller/harness inputs"). (3)+(5)
  test-living-garden-deed-attainment and
  test-one-person-army-deed-attainment — 120s timeouts in the gate (same
  as r226/r227; both pass standalone on a quiet box per r227).
  (4) test-phone-frame-proof — staleness trio (retained browser inputs /
  boot-input coverage / phone evidence required). (6)
  test-ladder-bundle-20261108 — control "200 monster turns WITHOUT
  delivery fire the ambient raid — fires 0" (same standing failure as
  r226/r227). **Gate: GO (0 attributable).**
- **Telemetry: quiet on both arms** (8 files, 4 metrics —
  w3fights, engaged.w3, fightsTotal, fightsByWave.3 — no large
  deviations). Baseline NOT rolled (no LOUD lines; the known schema
  mismatch line did not appear).

## Metric review

- **w4stuck1 bar (≥6/8) missed again at 4/8 — same as r227.** The bar
  counts seeds with a wave-4 monster stuck at 1/2 observations; the
  panel's binding shape is now the 10-blade coalition choke, not the
  observation stall. Propose for the next run: either re-point the bar
  at the coalition (seeds reaching 10 blades) or lower it to what
  this band actually produces — as it stands it measures a different
  wall than the one that binds.
- **The slain-field opportunity pool is thinner than the prereg
  assumed** (r227: 1 in 8; r232: 0 in 16). A before/after panel on
  fresh seeds cannot judge this fix in the wild at this pool size.
  Next time the fix is in question, the panel needs a richer pool —
  more seeds, or a band where field kills are likelier — and the proof
  test carries the verdict meanwhile (it does here: 37/37, red
  verified).
- **Ready→fight latency (r228 owed):** 1, 1, 6 days. The march does
  not sit ready for weeks; when it is ready, it goes. Bar closed.

## Closeout

- **Commits (branch `journey-deepening`, after rebase):** `70f4b9103`
  prereg + driver/analyzer + proof tests (tooling only); `a6e2bfb58`
  the slain-field fix + proof test; `72a77b2cf` analyzer pilot catch
  (muster-fight slay exclusion + case 54); `b6c1a041c` run note.
  Safe-commit index clobber struck on all four commits
  (staged-as-deleted / MM pattern); repaired each time via the
  `ls-tree -r` pipe, blobs verified against HEAD, tree clean after
  each repair.
- Master moved during the run (Lane B succession r230 landed
  `7328a88fa`); rebased clean onto it (4/4, no conflicts, no overlap
  with this run's files), proof tests re-run green on the rebased tip
  (37 slain-field + 53 analyzer + 11 march + 12 muster), merged
  ff-only into local master.
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 2→3 written with read-back; lock deleted at closeout
  after run_id verification.
- Worktree released (`merged`), branch deleted; final reap sweep
  clean. Main tree verified clean after the merge.
- The r232 panel corpus (per-seed JSONs + convo transcripts + analyzer
  logs + gate log) lives under the goal hidden_files evidence dir for
  2026-11-17 (outside the repo, per the journey-lane pattern); the
  repo evidence dir holds the prereg and run note.
