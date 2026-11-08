# Journey leg ESTABLISHMENT — r114 pre-registration (2026-11-08, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105/r106/r107/r108/r109/r110/r111/r112/r113 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Leg question (fresh — named by r113's metric review)
The specialist/foodXp ladder is OPEN and EXERCISED, and the 5-XP rung moved
it (r113: 6→7 seeds, 8→12 moves) but the bar still missed by one (7/16,
bar 8/16). The r113 diagnosis: the rung is no longer the binding constraint
— the no-move seeds are holder-monopoly (work goes to holders already at
cap), thin villages with no XP at all, or death-erased moves. r113's metric
review named the next dial: **+1 XP per batch preserved instead of per
resolution** — it accelerates the cook side, where the work is daily and
spread across whoever cooks. THIS RUN IS THAT BUILD: grant preserver XP per
batch preserved in a rack resolution, and judge it before/after on the same
16-seed balanced panel.

## The fix (this run's design call — Steve can overrule; FIGURE IT OUT YOURSELF)
One line in `src/js/game.js` (cook-duty rack resolution, the PRACTICE
grant): `person.foodXp.preserver = (person.foodXp.preserver || 0) + 1`
becomes `+ n`, where n is the number of batches preserved in that
resolution (each pantry stack converted = one batch; the resolution budget
is 4000 kcal). The comment updates to match. The self-taught ladder itself
is unchanged (5→1 / 10→2 / 15→3, cap 3, r113). Hunt grants unchanged
(+1/kill). askSpecialist unchanged (+1/ask — one item per ask, already
per-batch in effect). Win prices and deed gates untouched.
- Canon grounding: CANON.md "Human skills ≠ alien abilities — practice
  and discovery earn them"; PRESERVATION.md "Blind penalties teach,
  never stupid-make — the attempt teaches the technique." Paying XP per
  batch done is the same canon: the work teaches, and more work teaches
  more.
- Design note: no cap on n — the 4000-kcal resolution budget and the
  rarity of preservable surplus already bound it (r113: 241 granting
  resolutions across 16 seeds, ~15/seed/42d). The panel judges the tuning
  risk explicitly (skill-3 saturation by d42).

## Mechanism check (read from code before the panel)
- Rack resolution (game.js, cook duty): eligible = about-to-rot surplus
  (spoilDay within 2d, not spoiled, not preserved/rendered); reserve 250
  kcal × roster kept fresh for dinner; budget 4000 kcal/resolution;
  n = stacks converted. Grant fires only when n>0.
- `specialistSkill`: self-taught 5→1 / 10→2 / 15→3 (cap 3); holders +1 at
  xp≥5 (cap 3). Pure function, no RNG.
- Grant sites draw no RNG and write one integer each (now +n).
  Trajectories diverge only through the skill's real effects (rack rates,
  duty mults) — the panel comparison is aggregate, not a funnel-repro.

## Engine identity (why the before-panel is FRESH, not r113-after)
`src/js/` MOVED since the r113 fix (e6ddaf32a..HEAD): progression.js
(pellet pass, 685dc9ec4 — dawn pellet logic), conversation.js +
villager-agency.js + villager-objectives.js (deepening r118 listen-menu
flip + indoor goal-line channel, 2add0f8ae), party-invite refusals
(endgame r156, b1dc80086), version bump (8dc3d16d2). The r113-after panel
is therefore NOT a valid before-panel for r114 on current master. r114
runs a FRESH before-panel on master (16 seeds × 42d) with the r114 driver,
then the fix, then the after-panel. The r113-after panel stays the
historical reference for the pace question (7/16 at the 5-XP rung,
+1/resolution); the r114 verdict is judged on the fresh before/after pair
only.

## Substrate (built and committed BEFORE any seed runs)
1. Driver `scripts/journey-establishment-r114-20261108.js` — r113 driver
   clone (same competent policy base, same 42d horizon, same census, same
   telemetry dump, same five duty-use wraps, same lean trace, same
   ever-substrate capture, HUNTSTAFF=2 prep arm, same 4-held-convo people
   check, same foodXp before/after reads). ONLY driver changes: run tag /
   seed file names (r113 → r114), dates, header comment. The driver is
   trajectory-neutral by construction; the neutrality check proves it.
   Driver-pick-after-goodbye quirk: DOCUMENTED AS ACCEPTED (r113's note
   offered fix-or-document; the pick lands after the goodbye line, the
   engine ends the convo right after, content is fine — changing the pick
   order would break driver neutrality for a cosmetic transcript line).
2. Analyzer `scripts/analyze-journey-establishment-r114-20261108.py` —
   r113 analyzer clone, re-pointed (before = r114-before, after =
   r114-after, all 16 seeds; neutrality = r113-driver-on-master 42d seed
   1502 vs r114-before seed 1502). Additions (r113 metric review): (a)
   ladder moves by window (d1→d14, d14→d28, d28→dEnd) for before AND
   after, so a mid-leg move that dies still counts; (b) first-move split
   into specialist-move vs foodXp-only (skill_moves counts both — the
   r113 line misleads); (c) SILENT VILLAGE 17107 diagnostic (hunt
   assignments, hunt kills, cook-duty calls, rack events, foodXp totals);
   (d) grant-event XP totals (preserver XP granted via racks = sum of
   cookLog fx deltas; rack resolutions granting as before).
   Held/notheld kcal ratio: panel-wide split (same method as r113, stated
   here so the next run uses one method).
3. Proof test `scripts/test-journey-establishment-r114-ladder.js` — r113
   proof-test pattern with the NEW grant: rack event proofs assert
   per-batch (+n; 2-batch case +2, 1-batch +1, none +0); gate checks
   unchanged (5-XP rung); det-gate reference: the r113 driver on master,
   5d seed 1502 (generated during the neutrality step, committed as
   evidence).

## Run order (binding — neutrality + before-panel on master FIRST, then the fix)
1. Substrate commits (prereg + driver + analyzer + proof test).
2. DRIVER-NEUTRALITY: r113 driver AND r114 driver, seed 1502, 42d, on
   master (HUNTSTAFF=2) — funnel keys must match EXACTLY. If they differ,
   the driver is NOT trajectory-neutral: stop, diagnose, do not judge.
   (The r113-driver 42d run is committed as the analyzer's neutrality
   reference: `journey-establishment-r113-master42-seed1502.json` +
   convo; the 5d run as the proof test's det-gate reference:
   `journey-establishment-r113-master5-seed1502.json`.)
3. BEFORE-panel: r114 driver on master (unfixed engine), 16 seeds × 42d.
4. Fix commit (game.js per-batch grant; proof test before-FAIL recorded,
   after-PASS green).
5. AFTER-panel: r114 driver on the fixed engine, 16 seeds × 42d.
6. Analyzer + verdicts. Then check.js --quick + adjacent suites, commit,
   merge, telemetry, closeout.

## Q1 PRIMARY — SPECIALIST LADDER PACE: DOES THE PER-BATCH GRANT MOVE IT?
- Instrument: balanced before/after panel (16 seeds) + live gate proof +
  live event proofs (proof test, before the panel).
- Bar (binding): GO if ≥1 villager moves specialist 0→positive on ≥8/16
  seeds. NO-GO if moves on <8/16 seeds. (Same bar as r112/r113.)
- Expected outcome (stated up front, NOT a re-score): GO is expected —
  cooks resolving with ~2 batches each should cross the 5-XP rung early
  and often, and the holder-monopoly seeds should move when a non-holder
  cooks (the work spreads across whoever cooks). If it is NO-GO, the
  verdict names the broken link (XP accrues but the rung still not
  reached? fewer batches than expected? skill read still blind at the
  snapshot?) with the numbers. If it is GO, the verdict ALSO reports the
  pace risk: how many villagers reach skill 3 by day 42, and whether
  every cook is a master preserver (the tuning risk) — a GO with
  every-cook-master is a GO with a tuning note, not a silent pass.
- Guardrails (binding, §14, scaled from r111's 3/4): M3 survival-42
  (≥12/16 seeds alive at 42) and M4 pantry-guardrail (0 starvation
  deaths on ≥12/16 seeds) must hold; a GO met with a guardrail breached
  is NO-GO.
- Descriptive (not judged): foodXp totals by task (before vs after);
  preserver XP granted via racks, total + per resolution; median
  time-to-first-move (specialist vs foodXp-only); skill distribution at
  dEnd per task; moved competence cells per window (continuity); npcSkills
  gained; held/notheld kcal ratio (panel-wide method); words-rung lesson
  line (attempts/oks/words-fails); prep funnel teacher-at-home share; seed
  17107 diagnostic (did it hunt/cook anything this panel?); seed 17102
  trajectory; seed 1604 survivor-filter check (moves by window vs
  d1→dEnd).

## Q2 STANDING — menu:more → (null) stays fixed
- Standing check (r111/r112/r113 metric review): 0 `(null)` THEM lines
  on every panel. Bar: 0 null THEM lines across the 16 after-panel
  people-check convos (4/seed × 4 matched seeds, read in full) AND the
  12 new seeds' convo files scanned. Else OPEN.

## Seeds
Matched reuse 1502, 1504, 1603, 1604 + 17101–17112 — the SAME 16 seeds
as r112/r113 (deliberate matched reuse for comparability). No new band is
reserved by this run; the r113 freshness check stands — this run reuses,
it does not reserve. Contaminated bands stay excluded: 897–906, 1301–1304,
917–926, 1001–1010, 1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042,
1043–1052, 1053–1062, 1063–1072, 1073–1082, 1083–1092.

## Policies
competent + withHuntStaff layer, HUNTSTAFF=2 (prep arm — r108/r109/r110/
r111/r112/r113's latest behavior). The play loop is byte-identical to
r113's driver except for the tag rename, so the before-panel's seed-1502
funnel keys must reproduce the r113 driver's seed-1502 keys on master;
the det-gate + driver-neutrality check verify this.

## Horizon
42 days (establishment precedent). Death-aware: stop after 10
consecutive all-dead daily checks.

## Base
Master f5cf45250 at branch time (journey-landing r118 merged — adoption
closeout by this run). Worktree `journey-establishment`, branch
`journey-establishment`. Rotation 1→2 written at closeout.

## Telemetry
Deviation check vs the establishment baseline (re-seeded r108) on the
after-panel; report LOUD lines with verdicts. Baseline NOT rolled on an
explained deviation. NOTE: the baseline is a gate-off CONTROL panel while
this panel runs HUNTSTAFF=2 (prep arm) — arm-driven deltas are expected
and adjudicated as such, as in r109–r113. The fix itself moves
trajectories through real skill effects; a telemetry deviation that
traces to the fix's intended effect (better preservation, more kcal) is
explained, not a bug — say so explicitly.

## Infrastructure notes
- Stale-lock recovery at run start: lock playtest-loop-a-20261108T063551Z
  (created 06:35:51Z, no registered tree, no heartbeat) deleted;
  journey-landing adoption closeout completed by this run first (branch
  merged f5cf45250, tree released, run note committed).
- EPERM write flap: registration failed ~07:35Z (checkout unable to
  write files); probes failed 5/5 O_EXCL + plain writes filesystem-wide
  07:38–08:05Z. Probe loop (45s interval, unique filename per attempt)
  found the window at 08:06:09Z (attempt 34); 3/3 verification probes OK;
  stale `journey-establishment` branch (== master) deleted; re-registration
  succeeded 08:12Z (~5.4 min checkout). Rotation history flag: deepening
  r118 wrote 2→3, but landing r118 then wrote 0→1 — the scale leg (3)
  was skipped without a stated jump reason in its note; file reads 1 now,
  this run plays establishment and writes 2 at closeout.

## Metric review (carried from r113; for the NEXT run, not this one)
- If GO, the ladder is open AND paced — the next run watches whether the
  butcher rung changes hunt economics and whether skill 3 saturation is a
  problem. If NO-GO, the verdict names the broken link; the next dial is
  NOT another rung or grant tweak without a design question — the r113
  diagnosis says the binding constraints are work concentration and thin
  villages, and a third blind tuning fix repeats the parked pattern.
- Words rung: report lesson attempts/oks/words-fails as a standing line.
- Held/notheld kcal ratio: panel-wide method (this run); keep it.
- Wanda-beat / teach-restate repeats: Loop B-owned.
- menu:more → (null): standing check "0 null THEM lines on every panel".
- Funnel reference: the r114-before panel is the before-reference for
  this run; the r113-after panel is the historical pace reference only.
- Context (not this run's work): pellet-pass build landed (685dc9ec4);
  alien expansion + Reunion mirror cap builds running in parallel
  worktrees; the one-brain program proceeds elsewhere. This run measures
  master as-is plus its own one-line dial.
