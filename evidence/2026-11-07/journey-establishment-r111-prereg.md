# Journey leg ESTABLISHMENT — r111 pre-registration (2026-11-07, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105/r106/r107/r108/r109/r110 precedent). Death-aware: stop
after 10 consecutive all-dead daily checks; never tick a dead village to
fill the leg.

## Leg question (fresh — named by r110's metric review)
The specialist/foodXp ladder is frozen: r110 measured 0 specialist moves
and 0 foodXp moves on 4 seeds / 42 days (1,797 practice reps, 88 npcSkills
gained, specialist/foodXp 0→positive: 0). The r110 metric review ordered the
next run to pre-register the specialist-ladder question explicitly: **is
the ladder shut, or does it need a longer horizon / a specific trigger?**
This run answers it three ways — panel measurement, live code-gate proof,
and the trigger's exercise in natural play.

Mechanism (read from code before the panel, food.js):
- `specialistSkill(person, task)` returns occupation-derived skill, then
  `if (skill > 0 && xp >= 5) skill = min(3, skill + 1)`. A villager with
  occupation skill 0 in a task can NEVER gain specialist skill in it, no
  matter how much foodXp they hold — 0→positive is impossible by
  construction. The +1 rung exists only for holders.
- `foodXp` accrues ONLY inside `askSpecialist` (food.js:1470-1471), when
  the scholar asks a specialist to process an item. The competent bot never
  calls askSpecialist (grep: only the r20/r21 probe drivers and census
  scripts call it). The village's own overnight processing does not grant
  foodXp to anyone.
- r110 corpus check (this prereg, before the panel): dEnd foodXp total 0
  on all 4 seeds; specialist>0 cells at dEnd 0/2/5/3 (occupation skill
  exists, unevenly); specialist moves d1→dEnd: none. So the +1-rung pool
  (skill>0 holders) exists on 3/4 seeds but sits at xp 0.

Why this is not a re-proof (Steve 2026-11-01 rebuke; 2026-11-04 standing
rule): r110's Q1 (second-month practice) is GO and closed; r110's Q2
(holder dating) is GO and closed. Neither is re-judged. The ladder was
documented, not judged — this run judges it. Funnel numbers are reported
descriptively; the verdict turns on the ladder.

## Substrate (built and committed BEFORE any seed runs)
1. Driver `scripts/journey-establishment-r111-20261107.js` — r110 driver
   clone (same competent policy base, same 42d horizon, same census, same
   telemetry dump, same five duty-use wraps, same lean trace, same
   ever-substrate capture, HUNTSTAFF=2 prep arm, same 4-held-convo people
   check). ONLY driver changes: run tag / seed file names; the PRACTICE
   SNAPSHOT TIMING fix (r110 metric review — snapshot on the FIRST day
   ≥14 / ≥28, recording the actual day, instead of exact-day matching
   that missed skipped days on 2/4 seeds); and NAVIGATION-TURN LOGGING
   (Q2 — a convoTurn return with `navigation:true` is logged as
   `(menu page turned)`, never as a THEM line, so a pagination tap can no
   longer print `(null)` in the transcript).
2. Analyzer `scripts/analyze-journey-establishment-r111-20261107.py` —
   r110 analyzer clone, re-pointed at r111 files (reference: r110
   after-panel), plus:
   - LADDER section (Q1): per seed — specialist 0→positive moves and
     foodXp 0→positive moves per window; dEnd foodXp totals; +1-rung pool
     (villagers with occupation skill>0 in a task AND foodXp≥5 in that
     task at dEnd — did the skill step up?); 0-skill villagers with
     foodXp>0 (wasted XP — the gate's shadow); occupation skill>0 cells
     at dEnd.
   - Q2 section: count of `(null)` THEM lines in the r111 people-check
     transcripts (bar 0) and navigation turns logged.
   - FUNNEL-REPRO: convo-body compare NORMALIZES navigation turns (the
     r110 body has `THEM: (null)` after a menu:more pick; r111 logs
     `(menu page turned)` — both normalize to one canonical token before
     comparing; the bodies must otherwise be byte-identical).
   - Retired: Q2 holder-dating (r110 GO, hole closed — not re-judged).
     Competence windows + npcSkills-gained stay as descriptive continuity.
3. Proof test `scripts/test-journey-establishment-r111-ladder.js` —
   r110 proof-test pattern (static driver checks + synthetic-corpus
   analyzer runs in temp dirs, no repo writes) plus:
   - LIVE GATE PROOF (Q1 mechanism, on the loaded Game, no state writes):
     `specialistSkill({formerOccupation:'fisherman', _src:{foodXp:
     {butcher:5}}}, 'butcher')` === 3 (the +1 rung exists for holders);
     fisherman xp4 → 2 (the threshold is real); `specialistSkill(
     {formerOccupation:'forager', _src:{foodXp:{butcher:100}}}, 'butcher')`
     === 0 (the bottom rung is missing by construction — 100 XP cannot
     buy skill 1 from 0). Written and run BEFORE the panel; the gate
     verdict is the proof test's, not the panel's.
   - LIVE menu:more PROOF (Q2, before-FAIL/after-PASS): a real convo is
     opened on a live harness Game, the menu is paged (forced menuPages
     state on the real convo object — the pagination path itself is
     exercised, not stubbed), `convoTurn(vid, 'menu:more')` must return
     `navigation:true` AND a non-null `line` equal to the last 'them'
     transcript entry. Run BEFORE the fix (must FAIL: line undefined)
     and AFTER (must PASS).
   - LIVE det-gate: the r111 driver on 5d seed 1502 (HUNTSTAFF=2)
     reproduces the committed r110 after-panel seed-1502 funnel keys at
     day 6 (endDay/alive/pantryKcal/deaths≤d6/skillRows≤d6).

## Run order (binding — single panel on the current engine; the Q2 fix
## lands BEFORE the panel, so the panel is the after-proof)
1. Substrate commits (prereg + driver + analyzer + proof test).
2. Q2 fix commit (convoNextMenu returns the current line; proof test
   before-FAIL recorded, after-PASS green).
3. Panel: the r111 driver on the fixed engine, 4 seeds × 42d.
4. Analyzer + verdicts. Then check.js --quick + adjacent suites, commit,
   merge, telemetry, closeout.

## Q1 PRIMARY — SPECIALIST LADDER: SHUT, OR UNEXERCISED?
- Instrument: matched panel (same 4 seeds as r107–r110) + live gate proof
  (proof test, before the panel).
- Bar (binding): GO if ≥1 villager moves specialist 0→positive or
  foodXp 0→positive on ≥2/4 seeds. NO-GO if 0 moves on all 4 seeds.
- Expected outcome (stated up front, NOT a re-score): NO-GO is expected
  — the r110 corpus shows foodXp 0 everywhere and the trigger is never
  pulled by the competent bot. The run's value is the mechanism
  diagnosis, which the verdict must name explicitly:
  - SHUT if the gate proof shows 0→positive impossible AND the panel
    shows 0 moves (the bottom rung does not exist).
  - UNEXERCISED if foodXp stays 0 in natural play (the trigger is never
    pulled) even though the +1 rung exists for holders.
  - If the panel shows foodXp>0 anywhere, that overturns the
    unexercised half and is the interesting finding — report it as such.
- The fix is NOT this run's: letting foodXp build specialist skill from
  0 (or granting foodXp through village processing) is a lever change on
  the ROLE PATHS commitment (Steve 2026-11-04: skill builds from zero) —
  it needs a design decision + a balanced panel of its own. This run
  delivers the measurement + the gate proof + the concrete proposal in
  the run note.
- Guardrails (binding, §14): M3 survival-42 (≥3/4 seeds alive at 42)
  and M4 pantry-guardrail (starvationDeaths 0 on ≥3/4 seeds) must hold;
  a GO met with a guardrail breached is NO-GO.
- Descriptive (not judged): moved competence cells per window
  (continuity with r110), npcSkills gained, per-task movement.

## Q2 — menu:more → (null) FIX (r110 blemish 1, "fix owed")
- Defect: `convoNextMenu` (conversation.js:4312-4317) returns
  `{navigation:true, ...}` with NO `line`. The full-screen chat guards
  navigation (app.js:13656 — refresh only), but the inline dialogue box
  sets `view.line = st.line` unconditionally (app.js:13934), so the NPC's
  line blanks (`view.line || ''`, app.js:13430) on a pagination tap. The
  sim transcript logs `THEM: (null)`. One occurrence on the r110 panel
  (Tama, seed 1504, after a `[dlg:react]` listen beat).
- Fix (engine): `convoNextMenu` returns `line` = the current line — the
  last 'them' transcript entry's text, the same computation as
  `convoUI` — on both branches (null if no 'them' entry yet). No
  transcript mutation: the line is already in the transcript; returning
  it only names the current line, so no duplication. The inline box keeps
  showing what they last said while the menu re-pages; the full-screen
  chat's navigation guard is untouched.
- Fix (driver): navigation turns are logged as `(menu page turned)`,
  never as a THEM line.
- Bar (binding): FIXED iff the proof test passes after the fix (and
  failed before it) AND 0 `(null)` THEM lines appear across the 16
  people-check convos on the panel. Else OPEN.

## Seeds
Matched reuse 1502, 1504, 1603, 1604 (r107/r108/r109/r110's four firing
seeds — deliberate matched reuse for funnel comparability). No new band:
no new seeds are claimed; the freshness rule applies to NEW bands.

## Policies
competent + withHuntStaff layer, HUNTSTAFF=2 (prep arm — r108/r109/r110's
latest behavior). The play loop is byte-identical to r110's driver except
for the snapshot-timing fix (pure-read timing only) and the navigation
logging (transcript text only), so the panel's funnel keys should
reproduce r110's after-panel numbers; the det-gate in the proof test +
the panel itself verify this.

## Horizon
42 days (establishment precedent). Death-aware: stop after 10
consecutive all-dead daily checks.

## Base
Master 4e4158b77 at branch time — the ship loop's version bump on
eac2bfc4d (17:54Z, version files only: index.html/build.js/sw.js/
version.json, no src/js, no scripts, no evidence). Master moved during
the EPERM-flap wait; the worktree branched from the fresh tip, no
stale-base risk. Worktree `journey-establishment`, branch
`journey-establishment`.

## Telemetry
Deviation check vs the establishment baseline (re-seeded r108) on the
panel; report LOUD lines with verdicts. Baseline NOT rolled on an
explained deviation. NOTE: the baseline is a gate-off CONTROL panel while
this panel runs HUNTSTAFF=2 (prep arm) — arm-driven deltas are expected
and adjudicated as such, as in r109/r110.

## Metric review (carried from r110; for the NEXT run, not this one)
- M1 'words' side: 0 lesson rows expected again (r110: 12 prep calls, 0
  lessons — no teacher ever at home). The words rung stays unexercised,
  not failed. A run that wants to judge it needs a panel where a teacher
  is at home.
- Same-animal held/notheld kcal ratio: descriptive only — 0
  field-dressing kills on the r110 panel, so the ratio stays unmeasurable
  unless a holder hunts this panel.
- Gossip-repeat / accept-line-repeat: narration-pool work, Loop B owned.
- Specialist-gate fix proposal (if Q1 lands NO-GO/SHUT): allow foodXp to
  build specialist skill from 0 at a higher threshold (e.g. 10 XP buys
  skill 1), OR grant foodXp through the village's own overnight
  processing — a lever decision for Steve / a build run with a balanced
  panel, not a silent change here.
- `menu:more` → (null): fixed this run (Q2); the standing check is now
  "0 null THEM lines on every panel".
- d14 snapshot gap: fixed this run by the first-day-≥14/≥28 rule; the
  next run verifies all four snapshots fire on all four seeds.
