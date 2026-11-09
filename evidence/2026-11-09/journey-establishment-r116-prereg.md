# Journey leg ESTABLISHMENT — r116 pre-registration (2026-11-09, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105/r106/r107/r108/r109/r110/r111/r112/r113/r114/r115
precedent). Death-aware: stop after 10 consecutive all-dead daily checks;
never tick a dead village to fill the leg.

## Leg question (named by r115's metric review #1)
r115's +3 per-resolution preserver-XP cap was NO-GO: pace 9→9. The cap
trimmed XP (preserver 440→344) but the races are banked through many small
resolutions, not a few big ones. r115's metric review named the next dial:
**a steeper rung or a +2 cap — pre-register which, and judge on the same
16 seeds.** THIS RUN IS THE STEEPER RUNG.

## Why the rung, not the +2 cap (design call — Steve can overrule)
The +2 cap cannot move the pace bar, and the r115 before-panel proves it
from the end-XP distribution: the top preserver earner banks 78 XP in 42
days, and eight villagers sit at 16+ XP. A per-resolution cap trims the
tail of each sitting; even halving every racer's XP leaves the top racers
above the 15-XP mastery threshold. The cap dial is structurally incapable
of moving pace03 without gutting the ladder — it would need to cut XP by
~80%. The rung is the conversion from practice to mastery, and it is the
lever the races actually run through. The +2 cap is not re-run.

## The fix (this run's design call — Steve can overrule)
`specialistSkill` self-taught ladder (`src/js/food.js`): 5→1 / 10→2 /
15→3 becomes **5→1 / 15→2 / 30→3**. Basics stay quick (5 XP — the
attempt teaches the technique; canon PRESERVATION.md: "Blind penalties
teach, never stupid-make — the attempt teaches the technique"). Journeyman
takes real work (15 XP). Mastery takes a full season of steady work
(30 XP). A cook still becomes good in six weeks; becoming the village's
best takes longer. Occupation holders' +1 at 5 XP unchanged (they were
already nearly there — a professional starts ahead). Hunt grants
(+1/kill), askSpecialist (+1/ask), cook-duty rack grant (+n/batch,
uncapped — the r115 cap was reverted) unchanged. Win prices and deed
gates untouched.
- Canon grounding: CANON.md "Human skills ≠ alien abilities — practice
  and discovery earn them"; PRESERVATION.md "Blind penalties teach,
  never stupid-make — the attempt teaches the technique." The rung does
  not change what the work teaches — it changes how much practice makes
  a master.
- The ladder is shared across tasks (butcher/cook/preserver/spotter/
  builder): the rung steepens for all of them. The pace question is
  preserver-dominated (8 of 9 races), but the ladder is one ladder.

## Static prediction (from the r115 before-panel end-XP distribution —
prior evidence, not a seed run of this run)
0-start villagers by end foodXp, r115 before-panel (16 seeds, 42d):
preserver Ruth 53, Alejandra 47, Caroline 33, Rahul 30, Sattam 30,
Maricela 21, Raj 19, Miguel 16; butcher Sola 27. Old rung (15): 9
villagers 0→3 (matches r115 pace03=9 — the counting method reproduces).
New rung (30): **5 villagers 0→3** (Ruth, Alejandra, Caroline, Rahul,
Sattam — all preserver; Sola demoted to 2). The static prediction is a
MISS by one against the ≤4 bar. The panel is the judge, not the
prediction: the fix moves trajectories through real skill effects
(slower skill → slower racks → slower XP), and two racers sit exactly
at 30 XP — any XP slowdown demotes them. The dynamic effect is the
open question this panel answers. If the panel lands 5, the verdict is
NO-GO with a precise diagnosis: the rung alone cannot do it below ~35,
and the next dial is the grant rate itself (or the bar needs revisiting).

## Bars (binding, §14 — no mid-run re-scoring)
- Q1 PACE: GO iff (a) moves (seeds with a specialist 0→positive move)
  ≥8/16 on the AFTER panel AND (b) pace03 (villagers 0→skill 3 in 42d)
  ≤4 on the AFTER panel. (r115: moves 10/16, pace03 9.)
- Q2 (standing): menu:more NULL LINES — 0 literal THEM: (null) lines
  across the 16 after-panel people-check transcripts (bar 0).
- M3 survival-42 ≥12/16; M4 pantry (0 starvation deaths) ≥12/16.
- The verdict is judged on the fresh before/after pair on current
  master only. The r115 panels are historical reference.

## Seeds, policy, horizon
Seeds: matched reuse 1502, 1504, 1603, 1604 + 17101–17112 (same 16 as
r112/r113/r114/r115). Policy: competent + HUNTSTAFF=2. Horizon 42d.
Driver: `scripts/journey-establishment-r116-20261109.js` (r115 driver
clone — tag rename only; neutrality proven below). Analyzer:
`scripts/analyze-journey-establishment-r116-20261109.py` (r115 analyzer
clone — tag rename only; the analyzer reads skill values from the
driver snapshots, it carries no rung table of its own).

## Substrate (built and committed BEFORE any seed runs)
1. Driver `scripts/journey-establishment-r116-20261109.js` — r115 driver
   clone, re-pointed (r115 → r116, 20261108 → 20261109, EVID default
   evidence/2026-11-09). ONLY driver changes: run tag / seed file names
   / dates / header comment. The driver is trajectory-neutral by
   construction; the neutrality check proves it.
2. Analyzer `scripts/analyze-journey-establishment-r116-20261109.py` —
   r115 analyzer clone, re-pointed (before = r116-before, after =
   r116-after, neutrality = r115-master42 vs r116-before).
3. Proof test `scripts/test-journey-establishment-r116-ladder.js` —
   r115 test clone: analyzer unit legs (A–S) unchanged (synthetic
   fixtures carry explicit skill values, no rung table); ladder-gate
   legs re-pointed to the new rung (xp10 stays 1, xp15 buys 2, xp29
   stays 2, xp30 buys 3, xp100 caps 3; holder +1 unchanged); rack
   grant legs unchanged except BG, which now asserts the UNCAPPED
   grant (5 batches → +5 XP — the r115 cap was reverted, the grant is
   not this run's dial); hunt legs unchanged; menu:more legs unchanged;
   det-gate re-pointed to the r115-master5 reference.
4. Neutrality references (r115 driver on the UNFIXED engine, this
   worktree, before the fix): `r115-master42` (42d, seed 1502) and
   `r115-master5` (5d, seed 1502), committed with the substrate. The
   analyzer's neutrality check (r115-master42 vs r116-before seed
   1502, same engine) is the driver-neutrality proof; the test's
   det-gate (r116 driver 5d vs r115-master5) is the second check.

## Mechanism check (read from code before the panel)
- `specialistSkill` (`src/js/food.js`): occupation base from
  SPECIALTIES; holders +1 at xp≥5 (cap 3); self-taught 5→1 / 10→2 /
  15→3 (cap 3) — the line this run changes to 5→1 / 15→2 / 30→3.
  Pure function, no RNG.
- Rack resolution (game.js, cook duty): eligible = about-to-rot
  surplus (spoilDay within 2d, not spoiled, not preserved/rendered);
  reserve 250 kcal × roster kept fresh for dinner; budget 4000
  kcal/resolution; n = stacks converted. Grant +n/batch, uncapped.
  Grant sites draw no RNG and write one integer each. Trajectories
  diverge only through the skill's real effects (rack rates, duty
  mults) — the panel comparison is aggregate, not a funnel-repro.
- Skill read sites that move trajectories: game.js:6356 (preserver
  skill ≥2 → 1.3 mult), game.js:7221 (rack resolution skill read),
  game.js:26725 (cook skill >0). All read `specialistSkill`, so the
  rung change flows through the existing reads — no new wiring.

## People check
Read 4 held convos from the after-panel in full (same method as r114/
r115). Standing watch: the r115 menu-hygiene note (betrayal menu as a
standing stall option) and the scale r112 raise-talk defects (accept
echo, unvoiced raise, unanswered invitation) — note whether they appear
on this leg's convos; a fix is out of this run's prereg scope.

## Engine identity (why the before-panel is FRESH, not r115-before)
`src/js/` MOVED since the r115 fix attempt (2079d5344, reverted):
pellet-boost build (6680d7924, landed), ladder leg4 work, medicduty
LAND, Loop B fightloop/winnability landings, journey landing r119/r120,
scale r112, sim-pricedseat-b (9d6ebf59c). The r115-before panel is
therefore NOT a valid before-panel for r116 on current master. r116
runs a FRESH before-panel on master (16 seeds × 42d) with the r116
driver, then the fix, then the after-panel. Base at branch time:
master `9d6ebf59c`.

## Divergence note (pre-flight, this run)
Local master is ahead 194 / behind 156 vs origin/master at run start
(merge-base d229b58f5, 2026-11-08 11:29Z batch ship; origin tip
a628aeaf3, 2026-11-09 05:15Z, "Merge pull request #121 from
steve-vitale/cursor/ove-161-capable-seed-65"). Origin received a large
batch of Cursor/OVE PR merges overnight while local master accumulated
loop landings. Per repo AGENTS.md push discipline this run does NOT
attempt any reconciliation — no rebase onto origin, no merge of origin,
no push. Work merges locally ff-only as usual; the divergence is the
ship loop's to reconcile and is flagged LOUDLY in the run note.
