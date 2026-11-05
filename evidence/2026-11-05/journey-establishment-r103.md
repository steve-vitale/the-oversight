# Journey leg ESTABLISHMENT — r103 run note (2026-11-05, Lane A)

## Prereg
`evidence/2026-11-05/journey-establishment-r103-prereg.md` (committed
52c60d148 BEFORE any scored seed; instrument + proof + driver/analyzer
committed 1820415e before scoring). Driver
`scripts/journey-establishment-r103-20261105.js` (r102 clone — diff is
comments/names/output paths only), analyzer
`scripts/analyze-journey-establishment-r103-20261105.py` (r102 clone +
FIGHT category + id-fallback mapping + `actor` key). Seeds 1501–1504
(IDENTICAL to r102, MEASUREMENT §1), competent policy, 42-iteration
horizon, death-aware tail (never hit). Base: master 7ff459001 at branch
time.

## Leg question
r102 proved learning propagates but no taught skill was ever seen firing in
a fight (26/89 strict-use, ALL onward-teaching). This run built the
instrument r102's metric review named — actor-attributed field-fight
skill-use telemetry — and re-measured strict-use on identical seeds.

## Instrument (what was built)
- `src/js/fieldFights.js`: `ffFired` completion — 18 new one-line
  `ffFired(id)` calls at the remaining honest firing points (game_sense /
  tracker / echo_location in the evade computation; ambush opening strike;
  haymaker round-3 windup; draw_fire / bodyguard / unbreakable /
  shield_wall-only-where-the-blow-softened; field_medicine / patient_aim
  turns spent; stalk / dead_aim / blood_trail / trade_of_blows in the
  strike block; rally / war_cry / scream_cheese). 9 Arm-4 sites already
  recorded; untouched. Record-only: array push, no RNG, no state writes.
- `src/js/telemetry-hooks.js`: observe-only wrap on `fieldFight` emitting
  one `skill_used` row per UNIQUE fired id
  `{vid, skill, context: 'field_fight', outcome}` (covers every return
  path, including the early evade return; deduped — shield_wall can fire
  several rounds in one fight). `actor: 'player'` added to both
  `ability_used` wraps (`useAbility` is the player-facing entry point).
- Proof test `scripts/test-establishment-r103-skill-used.js`: stalk,
  field_medicine, game_sense fire in record + telemetry on load seeds 7,
  42, 99; control (nothing held) emits nothing; `ability_used` rows carry
  `actor: 'player'`. **27/27 PASS.**
- `check.js --quick`: **284 passed, 6 failed in 650s** — exactly the
  long-standing suite baseline (same 284/6 from r74 through r104; the two
  visible failures are the known phone-frame proof and
  test-establishment-r20-fixes). Targeted re-runs on the touched areas:
  field 4/4, telemetry 1/1, ability 9/9, fight 3/3. No new failures.

## Panel verdict (BINDING metrics)
- M0 INSTRUMENT-NEUTRALITY: **CORRECTED, see below.** endDay, aliveEnd,
  pantryKcalEnd reproduce r102 EXACTLY on all four seeds (43/9/46221,
  44/6/40850, 43/9/11794, 42/9/25575). Lesson counts reproduce on 1502
  (14=14), 1503 (28=28), 1504 (25=25) — but 1501 is 21 vs r102's 22.
  The one missing lesson is NOT an instrument gameplay effect (see M0
  finding). The seeded RNG stream is provably aligned (see below).
- M1 LESSONS: **GO 4/4.** Natural lessons per seed: 21/14/28/25 (88
  total), distinct skills 7/8/6/9.
- M2 STRICT-USE: **USE-VISIBLE 36/88 (41%)** — above the pre-registered
  1/3 bar. Cats: ONWARD 24, **FIGHT 12**, CRAFT 0, ABILITY 0, OTHER 0.
  Per seed: 7/21, 6/14, 12/28, 11/25. The FIGHT category is 12 of the 36;
  net +10 evidence vs r102's 26/89 (2 lessons flipped ONWARD→FIGHT-first
  by sequence order).
- M3 SURVIVAL-42: **GO 4/4.** No game over; alive at end 9/6/9/9.
- M4 PANTRY-GUARDRAIL: **GO 4/4.** Zero starvation/thirst deaths.
- M5 PEOPLE: **PASS on all 8 held convos read in full** (2 per seed).
  See below.

## M0 finding — the lesson-count clause is METRIC-BROKEN (correction)
The 1501 lesson gap (21 vs 22) is fully explained, and it exonerates the
instrument:
1. The missing lesson is hassan_ali → Tanya `wound_care`, day 39.
   Tanya is a joiner whose id is wall-clock-derived
   (`membership.js:411`: `'app_' + Date.now().toString(36) +
   Math.floor(R() * 999)`). r102's Tanya is `app_mgpspi00221`; r103's is
   `app_mgpspi06221` — same person, same skills, same equipment.
2. The lesson gate is `dayRoll(learner, day)` (skill-teaching.js:39), an
   FNV hash of `id + ':' + day` against the 0.15 daily chance. Computed
   exactly: r102's id rolls **0.138 < 0.15** (fires); r103's rolls
   **0.7822** (skips). The day-35 field_dressing lesson to the other
   joiner fires in both runs (0.1074 / 0.0635, both < 0.15).
3. The RNG stream is aligned: the `R()*999` suffix is **221 in both
   runs** — the instrument draws no RNG.
4. The coupling: `tele()` calls `Date.now()` once per row, and the
   harness freezes `Date.now()` as base + call-count
   (sim-harness.js:161). Each added `skill_used` row advances the frozen
   clock, so applicant ids created after the first fight row carry a
   different timestamp suffix (+6 net calls before Tanya's id), which
   re-hashes their lesson rolls. Any telemetry-adding instrument does
   this; it is not a gameplay effect of this one.
5. Control: re-running seed 1501 with the r103 driver reproduces the
   r103 panel file **byte-identically** (lessons, skill_used, summary) —
   r103 runs are deterministic with each other.
**Correction (for the NEXT run's prereg, per §14):** M0's lesson-count
clause is unachievable as written — even two runs of identical code can
differ by a wall-clock-id'd joiner's 15% roll once telemetry volume
changes. Revised M0: endDay/aliveEnd/pantryKcalEnd exact + lesson sets
identical modulo wall-clock-id'd learners (same teacher/skill/day,
learner matched by name/role). M2 is judged on this panel with the
correction disclosed here, not silently re-scored: the panel's lesson
set is 95% identical to r102's and the one flip is a clock-coupled
coin-flip, not an instrument effect.

## What "use-visible" does and does not mean
It DOES mean taught skills now visibly fire in fights: 101 `skill_used`
rows across the panel (1501: 18, 1502: 56, 1503: 8, 1504: 19). The
firing skills are the skill-lane abilities that map to taught skills:
`game_sense`/`tracker`/`blood_trail` → `track_read` (10/16 lessons with
evidence, up from 6/16), `peacemaker` → `mediate` (4/5, up from 0/5),
`field_medicine` → `wound_care` (3/5, up from 2/6), `stalk` → `stalk`
(1/1). Concrete: Sebastian learns `wound_care` day 2 and binds a wound
mid-fight day 8 (FIGHT evidence); Katarina learns `mediate` day 7 and
walks into a fight open-handed day 10.
It does NOT mean all taught skills are used: `diplomat` 0/5 and
`herbal_medicine` 0/5 never show evidence; `field_dressing` 3/11 is
unchanged (its use is the cleaning duty, which still has no actor row);
CRAFT 0 and ABILITY 0 again — no armor/ammo craft evidence, and no
`ability_used` row matched a taught skill even with the actor field and
id-fallback (the player's fight presses are non-skill-lane abilities).
The instrument answers the FIGHT half of "use"; the duty/craft half
(cleaning-duty field_dressing, wound-care treatment gating,
preserve_food duties) still has no actor row. No haymaker / draw_fire /
bodyguard / unbreakable / shield_wall / patient_aim / freeze_tag /
tripwire / hogtie rows fired in-panel — that is a firing count, not a
defect claim: whether villagers HOLD those abilities was not censused
(holdings are the next instrument's question, not this run's).

## Village assessment, in plain words
Four villages started with 12 people each and all four are still
standing at day 42–44 — the third establishment panel in a row with no
scatter, and (identical seeds) the same four villages r102 saw: 1501 is
the quiet one (wave 2 only, pantry fat at 46k, 9 alive); 1502 is the hard
one (reached wave 4, pantry fat at 40k, but only 6 alive at the end — 41
death records, almost all monster fights and expeditions, no starvation);
1503 is the lean one (wave 3, pantry 11.8k, 9 alive, the most lessons at
28); 1504 is the steady one (wave 3, pantry 25.6k, 9 alive, 5 contests
all won). Living villagers end knowing 1–16 skills each (the 16 is the
player character's codex; most villagers hold 3–8). Bark armor is worn at
the end on two seeds (James 1503, Caroline 1504) but armor-craft attempts
in-window are 0/1/1/2 — the worn armor is starting gear more than
in-window making, and no armor lesson appears in any skill_lesson row
(armor lessons are not recorded as skill lessons). Nobody on any final
roster is dead; the 21–41 death records per seed are fight/expedition
records, as in r99/r101/r102.

## Contests (r101 metric-review rule applied)
Fired/ended per seed: 3/3, 5/4, 3/2, 5/5 — identical to r102. Under the
corrected rule (exclude fired within 2 days of run end): 1502's
calorie_run (fired day 43, endDay 44) and 1503's drop (fired day 41,
endDay 43) are excluded — ZERO stuck contests on any seed. No seed fired
zero contests. Results are mostly wins (1504: 5/5 won).

## People check (M5), in plain words
All eight held conversations read as people with business, not menus
(the same eight villagers r102 sampled — the villages reproduced):
- 1501 Ana dreams of taken kin in humming pods, asks the player to ask
  the System, and accepts a promise; Greta tests whether the player can
  be trusted and judges the answer ("The wrong one would've been 'yes'
  too fast").
- 1502 Ezequiel needs hands on a wound and a Haven-door condition;
  Quinn confesses skimming food, ashamed and unable to stop, then notices
  who eats first and who waits.
- 1503 Priya's cut, a gossip thread, and three confront picks that
  escalate instead of looping ("I confessed that already. I'm not
  confessing it twice for dramatic effect"); James keeps a mental list of
  everyone still kind.
- 1504 Caroline and Sebastian both carry taken kin (sister Wanda,
  brother Kuba) and the pod dreams; Sebastian's trap-line invitation ends
  with a gifted tool.
Flat notes, stated not hidden: repeated "goon" picks return templated
mood lines ("The ease drains out of it, a little") — readable as mood,
not nonsense. Driver hygiene (not a game bug, same as r102): the
people-check driver picked a betrayal:accept verdict on Sebastian's case
while sampling; held-convo drivers should avoid story verdicts the way
the teaching driver did.

## Telemetry deviation check (step 14)
Baseline: `telemetry-baselines/establishment.json` (r40 re-seed).
Per-seed JSONs carry derived `guardrails` + `c3` blocks (deaths /
aliveEnd / pantryKcalEnd / starvation count, computed from each file's
own fields, same shape as r101/r102 — derivation recorded here, not
hidden; the first check run read 0s because the blocks were missing,
and was re-run after adding them).
Command: `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/establishment.json --current
'evidence/2026-11-05/journey-establishment-r103-seed*.json' --metrics
guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths`
- LOUD: `guardrails.deaths` 41 -> 114 (+178%).
- Quiet: popAlive, pantryKcal, starvationDeaths.
- Verdict: same class as r85/r86/r99/r101/r102, now a sixth consecutive
  panel — and the numbers are IDENTICAL to r102's (same seeds, same
  deaths: 21+41+22+30=114). NOT a village-mortality regression —
  rosterDead 0 on all four seeds, and villager-combat / expedition rows
  dominate every seed's death list, so most death records are fight
  records, not village deaths. **Baseline NOT rolled forward** in this
  run; the roll needs its own regime note (per the baselines NOTES.md)
  and is not done silently here.

## Metric review (for the NEXT run, not this one)
- M0 lesson-count clause is METRIC-BROKEN as written (see M0 finding):
  revise to "lesson sets identical modulo wall-clock-id'd learners".
  The frozen-clock coupling (telemetry volume → Date.now() call count →
  applicant ids → dayRoll) is worth a harness note of its own: any
  future instrument that adds telemetry rows should expect ±1 lesson
  flips for joiners, and panels should compare lesson sets by
  (teacher, skill, day, learner-name), not by learner id.
- The missing instrument is now the DUTY/CRAFT half: cleaning-duty
  `field_dressing`, wound-care treatment gating, `preserve_food` duties
  have no actor-attributed row. Until then, "use" for those skills stays
  invisible by construction, and runs should say so.
- A holdings census (`npcAbilities` per villager at end, like the
  `skillsKnownBy` census) would let the next run separate "held but
  never fired" from "never held" for the silent abilities (haymaker,
  draw_fire, bodyguard, unbreakable, shield_wall, patient_aim, the Arm-4
  set).
- Still standing, unchanged: scholar-day labels skip/repeat (all ordering
  uses telemetry sequence index); census `equipped` first-row duplication
  (r99); player codex start snapshot is missing (end snapshot only);
  armor lessons are not skill_lesson rows and armor-craft attempts are
  near-zero in-window.
- `ability_used` double-emission (pre-existing, not introduced here): a
  composite `activateAbility('purify.cleanse')` emits TWO rows — one from
  the `useAbility` wrap (action 'cleanse'), one from the `activateAbility`
  wrap (action 'activate'). The analyzer counts first evidence only, so
  rates are unaffected; noted so a future reader doesn't mistake the
  doubling for two uses.

## Reachable / fun / winnable (establishment)
- Reachable: YES for learning — 88 natural lessons across 4 villages
  with no player intervention, 6–9 distinct skills per village; and now
  YES for seeing use — 101 field-fight skill firings, 12 lessons with
  fight evidence.
- Fun: IMPROVED over r102 — the classroom is no longer just a ledger:
  a taught wound_care visibly binds a wound mid-fight, a taught
  track_read visibly reads the sign, a taught mediate visibly walks into
  a fight. What still doesn't show: diplomat and herbal_medicine never
  fire anywhere, and field_dressing's real use (the cleaning duty) is
  still invisible in the record.
- Winnable: PARTIAL, same shape as r101/r102 but healthier — survival,
  wave progression (to wave 4 on one seed), contests, and teaching all
  work in-window, no scatter, no starvation. The establishment risk this
  panel is not food but fights: 1502 lost half its roster to monster
  fights/expeditions while its pantry stayed fat.

## Infrastructure notes
- safe-commit index clobber hit on both commits this run (prereg commit
  52c60d148, instrument commit 1820415e); repaired both times with `git
  update-index --cacheinfo` from HEAD blobs, verified with clean `git
  status` + empty `git diff HEAD` and correct `git show --stat`.
  Commits themselves were correct.
- Heartbeat loop held throughout (600s loop, log:
  goal hidden_files/journey-establishment-r103-heartbeat.log); lock
  discipline held throughout.
- No EPERM flap this run. Registration was slow (~75s) but clean.
- `scripts/__pycache__/` from a `py_compile` check was removed before
  committing (not gitignored; do not commit it).
