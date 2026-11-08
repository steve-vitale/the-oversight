# Journey leg ESTABLISHMENT — r115 pre-registration (2026-11-08, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105/r106/r107/r108/r109/r110/r111/r112/r113/r114 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Leg question (fresh — named by r114's metric review #1)
The specialist/foodXp ladder is OPEN and MOVING (r114: 10/16 seeds, bar
8/16, GO), but the pace is the open question: six villagers went
0→skill 3 in 42 days (Caroline 38 XP, Linda 35, Helga 38, Miguel 53,
Tymofiy 21, Marcus 47) and preserver skill-3 holders went 12→17. A cook
going from knowing nothing to being the village's best preserver in six
weeks is faster than the craft should travel. r114's metric review named
the next dial: **a per-resolution XP cap (say +3)** — the cap trims only
the top end (multi-batch resolutions), where the races are banked, while
ordinary 1–3 batch resolutions pay in full. THIS RUN IS THAT BUILD: cap
the per-batch preserver grant at +3 XP per rack resolution, and judge it
before/after on the same 16-seed balanced panel.

## The fix (this run's design call — Steve can overrule; FIGURE IT OUT YOURSELF)
One line in `src/js/game.js` (cook-duty rack resolution, the PRACTICE
grant): `person.foodXp.preserver = (person.foodXp.preserver || 0) + n`
becomes `+ Math.min(n, 3)`, where n is the number of batches preserved in
that resolution. The comment updates to match. The self-taught ladder
itself is unchanged (5→1 / 10→2 / 15→3, cap 3, r113). Hunt grants
unchanged (+1/kill). askSpecialist unchanged (+1/ask). Win prices and
deed gates untouched.
- Canon grounding: CANON.md "Human skills ≠ alien abilities — practice
  and discovery earn them"; PRESERVATION.md "Blind penalties teach,
  never stupid-make — the attempt teaches the technique." The cap does
  not change what the work teaches — it bounds how much one sitting can
  teach. A master is still made by many sittings, not one big one.
- Design note: the cap binds only resolutions preserving ≥4 batches
  (r114: 260 granting resolutions, ~2.5 batches average — the cap trims
  the tail, not the middle). If the pace bar still misses, the next dial
  is a steeper rung or a lower cap — named here, not decided here.

## Mechanism check (read from code before the panel)
- Rack resolution (game.js, cook duty): eligible = about-to-rot surplus
  (spoilDay within 2d, not spoiled, not preserved/rendered); reserve 250
  kcal × roster kept fresh for dinner; budget 4000 kcal/resolution;
  n = stacks converted. Grant fires only when n>0; the cap binds at n≥4.
- `specialistSkill`: self-taught 5→1 / 10→2 / 15→3 (cap 3); holders +1 at
  xp≥5 (cap 3). Pure function, no RNG.
- Grant sites draw no RNG and write one integer each (now +min(n,3)).
  Trajectories diverge only through the skill's real effects (rack rates,
  duty mults) — the panel comparison is aggregate, not a funnel-repro.

## Engine identity (why the before-panel is FRESH, not r114-after)
`src/js/` MOVED since the r114 fix (0dc167d9c): ladder leg3 (Standing
ladder bar), pellet pass (685dc9ec4), pellet-boost build (in flight),
tendtrust DIAG-GO (a111b57fa), trialcombat, journey landing r119
(1d85f7399, far-node chain), medicduty LAND (d910dc6da, Haven Medic Duty
+ both cure channels), Loop B fightloop/winnability landings
(9962b53fc, 50677c5e2), plus the 1315Z closeout recovery (ad0fc09eb,
evidence only). The r114-after panel is therefore NOT a valid
before-panel for r115 on current master. r115 runs a FRESH before-panel
on master (16 seeds × 42d) with the r115 driver, then the fix, then the
after-panel. The r114-after panel stays the historical reference for the
pace question (6 villagers 0→3, 10/16 moves); the r115 verdict is judged
on the fresh before/after pair only.

## Substrate (built and committed BEFORE any seed runs)
1. Driver `scripts/journey-establishment-r115-20261108.js` — r114 driver
   clone (same competent policy base, same 42d horizon, same census, same
   telemetry dump, same five duty-use wraps, same lean trace, same
   ever-substrate capture, HUNTSTAFF=2 prep arm, same 4-held-convo people
   check, same foodXp before/after reads). ONLY driver changes: run tag /
   seed file names (r114 → r115), dates, header comment. The driver is
   trajectory-neutral by construction; the neutrality check proves it.
   Driver-pick-after-goodbye quirk: DOCUMENTED AS ACCEPTED (r113's note
   offered fix-or-document; the pick lands after the goodbye line, the
   engine ends the convo right after, content is fine — changing the pick
   order would break driver neutrality for a cosmetic transcript line).
2. Analyzer `scripts/analyze-journey-establishment-r115-20261108.py` —
   r114 analyzer clone, re-pointed (before = r115-before, after =
   r115-after, all 16 seeds; neutrality = r114-driver-on-master 42d seed
   1502 vs r115-before seed 1502). Additions (r114 metric review): (a)
   PACE count — (villager, spec-task) cells with specialist 0 at d1 and
   3 at dEnd, per panel, before and after (the r115 Q1 pace bar); (b)
   held/notheld kcal ratio line, printed explicitly (prep_kcal_held /
   prep_kcal_notheld totals + counts — r114 metric review #2, "one
   method").
3. Proof test `scripts/test-journey-establishment-r115-ladder.js` — r114
   proof-test pattern with the NEW cap: rack event proofs assert
   per-batch (+n capped at +3; 2-batch case +2 unchanged, 1-batch +1,
   none +0, 4+-batch case +3 — the before/after discriminator); gate
   checks unchanged (5-XP rung); pace synthetic cases (GO pace ≤4,
   pace-fail at 5, moves-fail at 7/16); det-gate reference: the r114
   driver on master, 5d seed 1502 (generated during the neutrality step,
   committed as evidence).

## Run order (binding — neutrality + before-panel on master FIRST, then the fix)
1. Substrate commits (prereg + driver + analyzer + proof test).
2. DRIVER-NEUTRALITY: r114 driver AND r115 driver, seed 1502, 42d, on
   master (HUNTSTAFF=2) — funnel keys must match EXACTLY. If they differ,
   the driver is NOT trajectory-neutral: stop, diagnose, do not judge.
   (The r114-driver 42d run is committed as the analyzer's neutrality
   reference: `journey-establishment-r114-master42-seed1502.json` +
   convo; the 5d run as the proof test's det-gate reference:
   `journey-establishment-r114-master5-seed1502.json`.)
3. BEFORE-panel: r115 driver on master (unfixed engine), 16 seeds × 42d.
4. Fix commit (game.js cap; proof test before-FAIL recorded, after-PASS
   green).
5. AFTER-panel: r115 driver on the fixed engine, 16 seeds × 42d.
6. Analyzer + verdicts. Then check.js --quick + adjacent suites, commit,
   merge, telemetry, closeout.

## Q1 PRIMARY — SPECIALIST LADDER PACE: DOES THE +3 CAP SLOW THE RACES WITHOUT STALLING THE LADDER?
- Instrument: balanced before/after panel (16 seeds) + live gate proof +
  live event proofs (proof test, before the panel).
- Bar (binding, both must hold): GO if (a) ≥1 villager moves specialist
  0→positive on ≥8/16 seeds (same moves bar as r112/r113/r114) AND (b)
  villagers reaching specialist 3 from 0 inside the 42 days number ≤4
  on the AFTER panel (r114: 6). NO-GO if either leg misses. (The pace
  count is (villager, spec-task) cells with specialist 0 at d1 and 3 at
  dEnd, all five spec tasks; preserver dominates and is reported split
  out.)
- Expected outcome (stated up front, NOT a re-score): GO is expected —
  the cap trims only n≥4 resolutions, and r114's 260 granting
  resolutions averaged ~2.5 batches, so the moves bar should hold while
  the biggest XP races (Miguel's 53 XP) are cut down. The before-panel
  pace (expected ~6, matching r114-after) is the comparison: the cap
  must move pace DOWN without moving moves DOWN. If moves hold but pace
  is still >4, the cap was insufficient — NO-GO with the diagnosis (next
  dial: steeper rung or +2 cap), never a re-score. If moves fall below
  8/16, the cap overshot — NO-GO with the diagnosis (the tail was doing
  real work, not just racing).
- Guardrails (binding, §14, scaled from r111's 3/4): M3 survival-42
  (≥12/16 seeds alive at 42) and M4 pantry-guardrail (0 starvation
  deaths on ≥12/16 seeds) must hold; a GO met with a guardrail breached
  is NO-GO.
- Descriptive (not judged): foodXp totals by task (before vs after);
  preserver XP granted via racks, total + per resolution (cap fires:
  count resolutions with n≥4 and XP trimmed); median time-to-first-move
  (specialist vs foodXp-only); skill distribution at dEnd per task;
  moved competence cells per window (continuity); npcSkills gained;
  held/notheld kcal ratio (panel-wide method, one line); words-rung
  lesson line (attempts/oks/words-fails); prep funnel teacher-at-home
  share; seed 17107 diagnostic (did it hunt/cook anything this panel?);
  seed 17102 trajectory; seed 1604 survivor-filter check (moves by
  window vs d1→dEnd).

## Q2 STANDING — menu:more → (null) stays fixed
- Standing check (r111/r112/r113/r114 metric review): 0 `(null)` THEM
  lines on every panel. Bar: 0 null THEM lines across the 16 after-panel
  people-check convos (4/seed × 4 matched seeds, read in full) AND the
  12 new seeds' convo files scanned. Else OPEN.

## Seeds
Matched reuse 1502, 1504, 1603, 1604 + 17101–17112 — the SAME 16 seeds
as r112/r113/r114 (deliberate matched reuse for comparability). No new
band is reserved by this run; the r113 freshness check stands — this run
reuses, it does not reserve. Contaminated bands stay excluded: 897–906,
1301–1304, 917–926, 1001–1010, 1101–1110, 1201–1210, 2001–2010,
3001–3010, 1033–1042, 1043–1052, 1053–1062, 1063–1072, 1073–1082,
1083–1092. NOTE: seed band 96301–96308 (medicduty) is NOT used here.

## Policies
competent + withHuntStaff layer, HUNTSTAFF=2 (prep arm — r108/r109/r110/
r111/r112/r113/r114's latest behavior). The play loop is byte-identical
to r114's driver except for the tag rename, so the before-panel's
seed-1502 funnel keys must reproduce the r114 driver's seed-1502 keys
on master; the det-gate + driver-neutrality check verify this.

## Horizon
42 days (establishment precedent). Death-aware: stop after 10
consecutive all-dead daily checks.

## Base
Master ad0fc09eb at branch time (1315Z closeout recovery merged — this
run's own recovery commit; Loop B 1530Z closeout 50677c5e2 below it).
Worktree `journey-establishment`, branch `journey-establishment`.
Rotation 1→2 written at closeout.

## Telemetry
Deviation check vs the establishment baseline (re-seeded r108) on the
after-panel; report LOUD lines with verdicts. Baseline NOT rolled on an
explained deviation. NOTE: the baseline is a gate-off CONTROL panel while
this panel runs HUNTSTAFF=2 (prep arm) — arm-driven deltas are expected
and adjudicated as such, as in r109–r114. The fix itself moves
trajectories through real skill effects; a telemetry deviation that
traces to the fix's intended effect (slower preservation skilling, more
kcal kept fresh) is explained, not a bug — say so explicitly.

## Infrastructure notes
- Stale-lock recovery at run start: no playtest lock existed. Pre-flight
  found the main tree dirty with ONE orphaned file — the dead
  fleshout-20261108T1315Z coordinator evidence (uncommitted since
  13:56Z, lock + claim still live despite the draft's "Claim deleted;
  lock deleted"). Recovered first per the loop-closeout playbook:
  Arm 3 completed from the worker report, committed ad0fc09eb (rebase +
  cherry-pick onto fresh master, blob verified identical), lock deleted,
  claim retired to .DEAD, tracker entry appended. The 1515Z Loop A run
  landed medicduty d910dc6da in the meantime, so the recovered file's
  "NOT LANDED" disposition is stale on arrival — the 1515Z run owns the
  Variant 1 correction. Lessons re-learned this run: verify the merge
  before any release/remove/delete, in separate steps (a premature
  release + untracked-file merge refusal cost a re-registration); an
  untracked file in the main tree blocks `git merge --ff-only` — move
  it aside first, merge, verify the blob.
- Rotation history: deepening r119 wrote 2→3, landing r119 jumped to
  landing (0) and wrote 0→1; file reads 1 now, this run plays
  establishment (r115, the pace dial r114 left open) and writes 2 at
  closeout.

## Metric review (carried from r114; for the NEXT run, not this one)
- If GO, the ladder is open AND paced — the next run watches whether
  the butcher rung changes hunt economics and whether skill-3 saturation
  stays bounded. If NO-GO on pace, the next dial is a steeper rung or a
  +2 cap (named, not decided). If NO-GO on moves, the cap overshot and
  the tail was doing real work — say so with the numbers.
- Words rung: report lesson attempts/oks/words-fails as a standing line.
- Held/notheld kcal ratio: panel-wide method, one line (this run emits
  it); keep it.
- First-move split works — keep it. Window moves are the honest count —
  keep the window method as the primary ladder count, with the survivor
  count alongside.
- 17107 is not a ladder problem (four panels at zero foodXp, racks
  firing, earners dying) — don't chase it with ladder dials.
- preserve_food still has no read site. The ladder now makes preservers
  at a sane pace while the skill itself does nothing a villager can use.
  That gap belongs to a leg that can give the skill a job.
- Context (not this run's work): pellet-boost build live in its lane;
  alien expansion + Reunion mirror cap shipped; the one-brain program
  proceeds elsewhere; medicduty LANDED (d910dc6da) — the cure channels
  change what a village can do with its sick, which may move the
  establishment guardrails (M3/M4) for reasons unrelated to the ladder;
  adjudicate any guardrail movement against that landing, not the cap.
  This run measures master as-is plus its own one-line dial.
