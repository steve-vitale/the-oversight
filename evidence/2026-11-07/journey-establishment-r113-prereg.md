# Journey leg ESTABLISHMENT — r113 pre-registration (2026-11-07, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105/r106/r107/r108/r109/r110/r111/r112 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Leg question (fresh — named by r112's metric review)
The specialist/foodXp ladder is OPEN and EXERCISED (r112: mechanism works —
306 foodXp, 235 rack grants, 255 hunt grants) but the pace misses the bar:
6/16 seeds move specialist 0→positive (bar 8/16). The miss is PACE, not
mechanism: 28 XP cells sit at 1–9, below the 10-XP first rung, because the
work spreads thin across many hands. r112's metric review proposed the
tuning for r113: first rung at 5 XP (matching the holder rung). THIS RUN
IS THAT BUILD: lower the self-taught first rung 10 → 5 XP and judge it
before/after on the same 16-seed balanced panel.

## The fix (this run's design call — Steve can overrule; FIGURE IT OUT YOURSELF)
One line in `src/js/food.js` (`specialistSkill`): the self-taught ladder
goes 10→1 / 15→2 / 20→3 to **5→1 / 10→2 / 15→3, cap 3**. Holders
unchanged (+1 at 5 XP, cap 3). The old-life grounding still matters: the
self-taught now pay the SAME first rung as holders (5 XP), not double —
the r112 "double price" asymmetry is the thing being tuned away, and the
panel measures whether the pace lands without every cook becoming a master
preserver by day 42 (r112 prereg's stated tuning risk).
- NOT in this fix: the per-batch grant alternative (+1 XP per batch
  preserved instead of per resolution) stays the NEXT dial if this NO-GOs;
  grant sites unchanged (racks +1/resolution, hunts +1/kill); cook/spotter/
  builder foodXp stays askSpecialist-only; bot policy unchanged. Win
  prices and deed gates untouched.
- Canon grounding: unchanged from r112 — CANON.md "Human skills ≠ alien
  abilities — practice and discovery earn them"; PRESERVATION.md "Blind
  penalties teach, never stupid-make — the attempt teaches the technique."
  A rung reached sooner is the same canon, not a new one.

## Mechanism check (read from code before the panel)
- `specialistSkill`: occupation skill + holder +1 at xp≥5 (cap 3); after
  the fix: self-taught 5→1 / 10→2 / 15→3 (cap 3). Pure function, no RNG.
- Grant sites draw NO RNG and write one integer each. Trajectories
  diverge only through the skill's real effects (rack rates, duty mults)
  — the panel comparison is aggregate, not a funnel-repro (see Analyzer).

## Engine identity (why the before-panel is FRESH, not r112-after)
`src/js/` MOVED since the r112 fix (d6eed674e..HEAD): conversation.js
(opener-skip fix, journey-succession r155), game.js + party.js +
villager-build.js (r155/r154/r116), build.js (version bump). The
r112-after panel is therefore NOT a valid before-panel for r113 on
current master. r113 runs a FRESH before-panel on master (16 seeds × 42d)
with the r113 driver, then the fix, then the after-panel. The
r112-after panel stays the historical reference for the pace question
(6/16 at the 10-XP rung); the r113 verdict is judged on the fresh
before/after pair only.

## Substrate (built and committed BEFORE any seed runs)
1. Driver `scripts/journey-establishment-r113-20261107.js` — r112 driver
   clone (same competent policy base, same 42d horizon, same census,
   same telemetry dump, same five duty-use wraps, same lean trace, same
   ever-substrate capture, HUNTSTAFF=2 prep arm, same 4-held-convo people
   check, same foodXp before/after reads). ONLY driver changes: run tag /
   seed file names (r112 → r113) and header comment. The driver is
   trajectory-neutral by construction; the neutrality check proves it.
2. Analyzer `scripts/analyze-journey-establishment-r113-20261107.py` —
   r112 analyzer clone, re-pointed (before = r113-before, after =
   r113-after, all 16 seeds; neutrality = r112-driver-on-master 42d seed
   1502 vs r113-before seed 1502). All sections identical otherwise
   (LADDER-BY-TASK, GRANT EVENTS, TIME-TO-FIRST-MOVE, SKILL DISTRIBUTION,
   Q2 null-line check, M3/M4 guardrails, practice windows).
3. Proof test `scripts/test-journey-establishment-r113-ladder.js` —
   r112 proof-test pattern with the NEW thresholds: forager butcher xp4 →
   0, xp5 → 1, xp9 → 1, xp10 → 2, xp14 → 2, xp15 → 3, xp100 → 3 (cap);
   holders unchanged (fisherman xp5 → 3, xp4 → 2; baker cook xp5 → 3);
   raw-record shape reads XP too (xp5 → 1, xp4 → 0). Event proofs
   (rack/hunt grants) and Q2 menu:more proofs unchanged — the grant
   sites are untouched by this fix. Det-gate reference: the r112 driver
   on master, 5d seed 1502 (generated during the neutrality step,
   committed as evidence).

## Run order (binding — neutrality + before-panel on master FIRST, then the fix)
1. Substrate commits (prereg + driver + analyzer + proof test).
2. DRIVER-NEUTRALITY: r112 driver AND r113 driver, seed 1502, 42d, on
   master (HUNTSTAFF=2) — funnel keys must match EXACTLY. If they differ,
   the driver is NOT trajectory-neutral: stop, diagnose, do not judge.
   (The r112-driver 42d run is committed as the analyzer's neutrality
   reference: `journey-establishment-r112-master42-seed1502.json` + convo.)
3. BEFORE-panel: r113 driver on master (unfixed engine), 16 seeds × 42d.
4. Fix commit (food.js threshold; proof test before-FAIL recorded,
   after-PASS green).
5. AFTER-panel: r113 driver on the fixed engine, 16 seeds × 42d.
6. Analyzer + verdicts. Then check.js --quick + adjacent suites, commit,
   merge, telemetry, closeout.

## Q1 PRIMARY — SPECIALIST LADDER PACE: DOES THE 5-XP RUNG MOVE IT?
- Instrument: balanced before/after panel (16 seeds) + live gate proof +
  live event proofs (proof test, before the panel).
- Bar (binding): GO if ≥1 villager moves specialist 0→positive on ≥8/16
  seeds. NO-GO if moves on <8/16 seeds. (Same bar as r112.)
- Expected outcome (stated up front, NOT a re-score): GO is expected —
  r112's 28 wasted cells at 1–9 XP mostly sit at 5–9, and the cooks and
  hunters who work one job over and over should cross the 5-XP rung
  early. If it is NO-GO, the verdict names the broken link (XP accrues
  but the rung still not reached? fewer grants than r112? skill read
  still blind at the snapshot?) with the numbers. If it is GO, the
  verdict ALSO reports the pace risk: how many villagers reach skill 3
  by day 42, and whether every cook is a master preserver (the tuning
  risk) — a GO with every-cook-master is a GO with a tuning note, not a
  silent pass.
- Guardrails (binding, §14, scaled from r111's 3/4): M3 survival-42
  (≥12/16 seeds alive at 42) and M4 pantry-guardrail (0 starvation
  deaths on ≥12/16 seeds) must hold; a GO met with a guardrail breached
  is NO-GO.
- Descriptive (not judged): foodXp totals by task (before vs after);
  median time-to-first-move; skill distribution at dEnd per task;
  moved competence cells per window (continuity); npcSkills gained;
  held/notheld kcal ratio; words-rung lesson line (attempts/oks/
  words-fails); prep funnel teacher-at-home share; seed 17107 foodXp
  (r112: zero — did it hunt/cook anything this panel?); seed 17102
  trajectory (r112: pantry −59k after the fix — does it recur?).

## Q2 STANDING — menu:more → (null) stays fixed
- Standing check (r111/r112 metric review): 0 `(null)` THEM lines on
  every panel. Bar: 0 null THEM lines across the 16 after-panel
  people-check convos (4/seed × 4 matched seeds, read in full) AND the
  12 new seeds' convo files scanned. Else OPEN.

## Seeds
Matched reuse 1502, 1504, 1603, 1604 + 17101–17112 — the SAME 16 seeds
as r112 (deliberate matched reuse for comparability). No new band is
reserved by this run; the r112 freshness check (band 17101–17112 fresh
across all dated preregs) stands — this run reuses, it does not reserve.
Contaminated bands stay excluded: 897–906, 1301–1304, 917–926,
1001–1010, 1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042,
1043–1052, 1053–1062, 1063–1072, 1073–1082, 1083–1092.

## Policies
competent + withHuntStaff layer, HUNTSTAFF=2 (prep arm — r108/r109/r110/
r111/r112's latest behavior). The play loop is byte-identical to r112's
driver except for the tag rename, so the before-panel's seed-1502 funnel
keys must reproduce the r112 driver's seed-1502 keys on master; the
det-gate + driver-neutrality check verify this.

## Horizon
42 days (establishment precedent). Death-aware: stop after 10
consecutive all-dead daily checks.

## Base
Master a7a26a1ff at branch time (r117 merged). Worktree
`journey-establishment`, branch `journey-establishment`. Rotation 1→2
written at closeout.

## Telemetry
Deviation check vs the establishment baseline (re-seeded r108) on the
after-panel; report LOUD lines with verdicts. Baseline NOT rolled on an
explained deviation. NOTE: the baseline is a gate-off CONTROL panel while
this panel runs HUNTSTAFF=2 (prep arm) — arm-driven deltas are expected
and adjudicated as such, as in r109/r110/r111/r112. The fix itself moves
trajectories through real skill effects; a telemetry deviation that
traces to the fix's intended effect (better preservation, more kcal) is
explained, not a bug — say so explicitly.

## Metric review (carried from r112; for the NEXT run, not this one)
- Specialist-gate pace (this run): if GO, the ladder is open AND paced
  — the next run watches whether the butcher rung changes hunt economics
  (kills → skill → better cleaning → more kcal) and whether skill 3
  saturation is a problem. If NO-GO, the verdict names the broken link;
  the next dial is the per-batch grant (+1 XP per batch preserved
  instead of per resolution) — do not re-score the bar.
- Words rung: report lesson attempts/oks/words-fails as a standing line.
- Same-animal held/notheld kcal ratio: quote the ratio each run.
- Wanda-beat / teach-restate repeats: narration-pool work, Loop B owned;
  do not re-chase here unless a new repeat class appears.
- `menu:more` → (null): fixed r111 (Q2); the standing check is now
  "0 null THEM lines on every panel".
- Funnel reference: the r113-before panel is the before-reference for
  this run; the r112-after panel is the historical pace reference only.
  Comparing across a landed lever build without saying so is how a
  DIVERGED verdict gets misread as driver drift.
- Context (not this run's work): Steve 2026-11-07 17:55 CST RULED the
  pellet passes to hungrier hands (MEMORY.md) — a pellet-pass build is
  owed elsewhere; this run measures master as-is and does not touch it.
