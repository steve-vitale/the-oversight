# Journey leg ESTABLISHMENT — r112 pre-registration (2026-11-07, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105/r106/r107/r108/r109/r110/r111 precedent). Death-aware:
stop after 10 consecutive all-dead daily checks; never tick a dead village
to fill the leg.

## Leg question (fresh — named by r111's metric review)
The specialist/foodXp ladder is PROVEN shut at the bottom and unexercised
at the top (r111: 0 moves on 4/4 seeds; gate proof: forager butcher xp100
→ 0; askSpecialist is the only foodXp source and the competent bot never
calls it). r111's metric review proposed the fix as a build run with a
balanced panel. THIS RUN IS THAT BUILD: un-shut the ladder and judge it
before/after on a 16-seed balanced panel.

## The fix (this run's design call — Steve can overrule; FIGURE IT OUT YOURSELF)
Three small, scoped changes; no new system, no win price or deed gate
touched, no occupation table changed.

- **A. Bottom rung (food.js `specialistSkill`, ~1230-1240):** a villager
  with occupation skill 0 in a task can now earn it by doing the work:
  foodXp ≥ 10 buys skill 1, +1 per further 5 XP (15 → 2, 20 → 3, cap 3).
  Holders unchanged: occupation skill > 0 still steps +1 at 5 XP (cap 3).
  Canon grounding: CANON.md "Human skills ≠ alien abilities" — human
  skills are "teachable earthly knowledge — occupations grant them as
  background, practice and discovery earn them"; PRESERVATION.md "Blind
  penalties teach, never stupid-make — the attempt teaches the
  technique." Practice earning skill is the canon, not an invention.
- **A2. Read-shape fix (same function):** `specialistSkill` currently
  reads XP only from `person._src.foodXp`, so it sees XP only when passed
  the `villagePeople()` wrapper. Game code (smoke-rack skill read,
  duty mults) and the driver snapshot pass the raw `getPerson` record,
  where XP reads 0 — the +1 rung was silently invisible at those call
  sites. The function now also reads `person.foodXp` as a fallback.
  No behavior change while XP is 0 (the before-panel); the +1 rung
  becomes visible where the skill is actually used.
- **B1. Village work teaches preserving (game.js cook duty, smoke racks
  ~7310-7360):** when the cook's resolution actually preserves ≥1 batch
  (n > 0), the cook earns +1 foodXp['preserver']. One rep per resolution
  that worked the racks, not per batch. This is the village's own
  processing — the coarse sim `villageHasSpecialty` gestures at — now
  paying practice. The racks already run in natural play; the grant
  rides them, no new duty, no new trigger.
- **B2. Village work teaches butchering (game.js `villagerHuntResolve`,
  ~6803):** on a villager hunt kill — the hunter cleans the carcass at
  the duty's own flat rate (0.60, 0.78 with field_dressing) — the hunter
  earns +1 foodXp['butcher']. A failed stalk cleans nothing, earns
  nothing. The hunter's labor is the village's butchering path.
- NOT in this fix: 'cook' foodXp stays askSpecialist-only (no village-side
  cooking transformation exists to ride); 'spotter'/'builder' likewise.
  The player's own hunts/cooking do not grant villagers XP. The bot
  policy is UNCHANGED (it never asks specialists — a bot gap, documented,
  not silently re-scoped; the proof test exercises askSpecialist directly
  for the butcher/cook rungs).
- Tuning risk, stated up front: a cook resolving ~3x/day can reach 10 XP
  in ~10 rack-days and 20 XP (skill 3) in ~20. If the panel shows every
  cook a master preserver by day 42, the thresholds (10/15/20) are the
  one-line tuning for the next run — the panel measures the pace, it does
  not assume it.

## Mechanism check (read from code before the panel)
- `specialistSkill`: occupation skill + holder +1 at xp≥5 (cap 3).
  After A: + self-taught 10→1 / 15→2 / 20→3; + raw-record XP read.
- foodXp store: ONE object — live probe (seed 1502) confirms
  `getPerson(id) === rosterChars[id]` for 12/12 roster members, so a
  grant on the getPerson record IS the `_src` askSpecialist writes.
  Same store, same save lifecycle; no new persistence surface.
- Grant sites draw NO RNG and write one integer each; the skill read is
  a pure function. Trajectories diverge only through the skill's real
  effects (rack rates, duty mults) — the panel comparison is aggregate,
  not a funnel-repro (see Analyzer).

## Substrate (built and committed BEFORE any seed runs)
1. Driver `scripts/journey-establishment-r112-20261107.js` — r111 driver
   clone (same competent policy base, same 42d horizon, same census,
   same telemetry dump, same five duty-use wraps, same lean trace, same
   ever-substrate capture, HUNTSTAFF=2 prep arm, same 4-held-convo people
   check). ONLY driver changes: run tag / seed file names; the hunt wrap
   and cook wrap ALSO read the actor's foodXp[butcher] / foodXp[preserver]
   before/after each resolution (pure reads — the grant events are
   attributed, the trajectory is untouched).
2. Analyzer `scripts/analyze-journey-establishment-r112-20261107.py` —
   r111 analyzer clone, re-pointed (before = r111 panel for the 4 matched
   seeds + r112-before for the 12 new seeds; after = r112-after, all 16),
   plus: LADDER-BY-TASK (foodXp accrual per task per window, from the
   practice snapshots); GRANT EVENTS (rack resolutions with a preserver-XP
   delta, hunt kills with a butcher-XP delta, from the wraps);
   TIME-TO-FIRST-MOVE (first day any villager's specialist moves
   0→positive, per seed); SKILL DISTRIBUTION at dEnd (per task, counts at
   0/1/2/3). FUNNEL-REPRO is replaced by DRIVER-NEUTRALITY: the r112
   driver on master, seed 1502, 42d, must reproduce the r111 seed-1502
   funnel keys EXACTLY (the driver changes are pure reads); the
   before/after panel comparison is aggregate by design (the fix moves
   trajectories through real skill effects).
3. Proof test `scripts/test-journey-establishment-r112-ladder.js` —
   r111 proof-test pattern (static driver checks + synthetic-corpus
   analyzer runs in temp dirs, no repo writes) plus:
   - LIVE GATE PROOF (Q1, on the loaded Game, no state writes):
     forager butcher xp9 → 0, xp10 → 1, xp14 → 1, xp15 → 2, xp20 → 3,
     xp100 → 3 (cap); fisherman butcher xp5 → 3 (holder unchanged),
     xp4 → 2; baker cook xp5 → 3; raw-record shape reads XP too
     (forager record with foodXp directly, no _src, xp10 → 1). Run
     BEFORE the fix (must FAIL on the new-rung checks: xp10 → 0) and
     AFTER (must PASS) — the before-FAIL is recorded, not assumed.
   - LIVE EVENT PROOFS (Q1, real harness Game, state writes only on the
     test Game): a cook-duty smoke-rack resolution that preserves ≥1
     batch grants the cook +1 foodXp['preserver'] (read before/after
     around a forced-eligible resolution); a villagerHuntResolve kill
     grants the hunter +1 foodXp['butcher'] (forced kill via a stubbed
     chance — the grant, not the stalk, is under test; the stalk path
     itself is unchanged). A resolution that preserves nothing grants
     nothing; a failed stalk grants nothing.
   - LIVE det-gate: the r112 driver on 5d seed 1502 (HUNTSTAFF=2)
     reproduces the committed r111 seed-1502 funnel keys at day 6
     (the r111 det-gate, re-pointed: r111 is the reference now).

## Run order (binding — before-panel on master FIRST, then the fix)
1. Substrate commits (prereg + driver + analyzer + proof test).
2. DRIVER-NEUTRALITY: r112 driver, seed 1502, 42d, on master — funnel
   keys must equal r111 seed-1502 exactly. If they differ, the driver is
   NOT trajectory-neutral: stop, diagnose, do not judge.
3. BEFORE-panel: r112 driver on master (unfixed engine), 12 NEW seeds ×
   42d. The 4 matched seeds' before IS the r111 panel (engine
   byte-identical: `git diff 19ee88466..HEAD -- src/js/` empty — the
   r111 fix commit is in master, the run-note commits touch only
   evidence/scripts; the proof test's det-gate + step 2 verify it).
4. Fix commit (food.js + game.js; proof test before-FAIL recorded,
   after-PASS green).
5. AFTER-panel: r112 driver on the fixed engine, 16 seeds × 42d.
6. Analyzer + verdicts. Then check.js --quick + adjacent suites, commit,
   merge, telemetry, closeout.

## Q1 PRIMARY — SPECIALIST LADDER FIX: DOES IT MOVE?
- Instrument: balanced before/after panel (16 seeds) + live gate proof +
  live event proofs (proof test, before the panel).
- Bar (binding): GO if ≥1 villager moves specialist 0→positive on ≥8/16
  seeds. NO-GO if moves on <8/16 seeds. (r111's 4-seed bar was ≥2/4;
  the 16-seed bar is the same 50% proportion at balanced-panel scale.)
- Expected outcome (stated up front, NOT a re-score): GO is expected —
  the racks fire on most seeds and hunters kill most days, so preserver
  and butcher XP should accrue and the 10-XP rung should be reached
  somewhere on most seeds. If it is NO-GO, the verdict names the broken
  link (no rack events? no kills? XP accrues but the rung never reached?
  skill read still blind at the snapshot?) with the numbers.
- Guardrails (binding, §14, scaled from r111's 3/4): M3 survival-42
  (≥12/16 seeds alive at 42) and M4 pantry-guardrail (0 starvation
  deaths on ≥12/16 seeds) must hold; a GO met with a guardrail breached
  is NO-GO.
- Descriptive (not judged): foodXp totals by task (before vs after);
  median time-to-first-move; skill distribution at dEnd per task;
  moved competence cells per window (continuity); npcSkills gained;
  held/notheld kcal ratio (r111: 1 held kill 45,209 kcal vs 38 not-held);
  words-rung lesson line (attempts/oks/words-fails); prep funnel
  teacher-at-home share.

## Q2 STANDING — menu:more → (null) stays fixed
- Standing check (r111 metric review): 0 `(null)` THEM lines on every
  panel. Bar: 0 null THEM lines across the 16 after-panel people-check
  convos (4/seed × 4 matched seeds, read in full) AND the 12 new seeds'
  convo files scanned. Else OPEN.

## Seeds
Matched reuse 1502, 1504, 1603, 1604 (r107–r111's four firing seeds —
deliberate matched reuse for comparability) + 12 NEW seeds 17101–17112.
Freshness check (skill local_seed_band_freshness, full scope): grepped
all dated preregs (`evidence/*/sim-*-prereg.md`,
`evidence/*/journey-*-prereg.md`) for 17101–17112 as a seed band — NO
hit. Raw-text hits elsewhere are kcal values / line numbers in old JSON
and MD (pantryKcal 17106, preservedKcal 17112, game.js:17111), not band
reservations. Forbidden/contaminated bands named in preregs are 99xxx
(99009–99024, 99041–99052, 99101, 99201–99232 — standacc/tendbelow/
tendfloor-guard, 2026-11-04), nowhere near 171xx. No journey prereg
names a 171/181/191 band. Band 17101–17112 is FRESH.

## Policies
competent + withHuntStaff layer, HUNTSTAFF=2 (prep arm — r108/r109/r110/
r111's latest behavior). The play loop is byte-identical to r111's driver
except for the two pure-read wrap additions (foodXp before/after), so the
before-panel's matched-seed funnel keys must reproduce r111's; the
det-gate + driver-neutrality check verify this.

## Horizon
42 days (establishment precedent). Death-aware: stop after 10
consecutive all-dead daily checks.

## Base
Master c88df9d25 at branch time (r111 merged). Worktree
`journey-establishment`, branch `journey-establishment`. Rotation 1→2
written at closeout.

## Telemetry
Deviation check vs the establishment baseline (re-seeded r108) on the
after-panel; report LOUD lines with verdicts. Baseline NOT rolled on an
explained deviation. NOTE: the baseline is a gate-off CONTROL panel while
this panel runs HUNTSTAFF=2 (prep arm) — arm-driven deltas are expected
and adjudicated as such, as in r109/r110/r111. The fix itself moves
trajectories through real skill effects; a telemetry deviation that
traces to the fix's intended effect (better preservation, more kcal) is
explained, not a bug — say so explicitly.

## Metric review (carried from r111; for the NEXT run, not this one)
- Specialist-gate fix (this run): if GO, the ladder is open — the next
  run watches the PACE (does every cook hit preserver 3 by day 42?
  thresholds 10/15/20 are the tuning dial) and whether the butcher rung
  changes hunt economics (kills → skill → better cleaning → more kcal).
  If NO-GO, the verdict names the broken link; do not re-score the bar.
- Words rung: report lesson attempts/oks/words-fails as a standing line.
- Same-animal held/notheld kcal ratio: quote the ratio each run.
- Wanda-beat / teach-restate repeats: narration-pool work, Loop B owned;
  third sighting of the repeat class across r109–r111 — do not re-chase
  here unless a new repeat class appears.
- `menu:more` → (null): fixed r111 (Q2); the standing check is now
  "0 null THEM lines on every panel".
- Funnel reference: the r111 panel is the before-reference for the 4
  matched seeds; the r112-before panel is the before-reference for the
  12 new seeds. Comparing across a landed lever build without saying so
  is how a DIVERGED verdict gets misread as driver drift.
