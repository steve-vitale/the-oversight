# Journey leg ESTABLISHMENT — r110 run note (2026-11-07, Lane A)

## Pre-registration (summary — full text in `journey-establishment-r110-prereg.md`)
- **Leg question (fresh):** does practice keep moving competence in the
  second month (d28→d42), or does it saturate after the first month?
  Landing r112/r113 proved first-month movement (94 attributed cells
  d1→d28 on 10/10 seeds); the d28→d42 window was unmeasured.
- **Q1 PRIMARY:** attributed moved competence cells d28→dEnd. Bar GO if
  ≥1 on ≥3/4 seeds; NO-GO if 0 on ≥2 seeds.
- **Q2 SECONDARY:** holder-since dating hole (Ursula gains field_dressing
  with no datable row) — every living dEnd field_dressing holder datable
  to a ≤14-day window via telemetry or the new snapshots; ≥1 gain in
  d14–dEnd. Bar GO if 0 undatable AND ≥1 gain in-window.
- **Guardrails:** M3 survival-42 (≥3/4 alive at 42), M4 pantry (0
  starvation deaths on ≥3/4).
- **Seeds:** matched reuse 1502, 1504, 1603, 1604. Policies: competent +
  withHuntStaff, HUNTSTAFF=2. Horizon 42d. Base master 2016a7ed0.
- **Substrate:** r110 driver (r109 clone + practice snapshots d1/d14/d28/
  dEnd, pure reads), r110 analyzer (practice counting + holder dating +
  funnel-reproduction vs r109), proof test 23/23 incl. a live 5-day
  det-gate (seed 1502 reproduces r109 funnel keys at day 6).

## Verdicts
- **Q1 SECOND-MONTH PRACTICE: GO** — attributed moved cells d28→dEnd:
  1502: 9, 1504: 5, 1603: 4, 1604: 5 — **23 pooled, 4/4 seeds** (bar:
  ≥1 on ≥3/4). Practice does NOT saturate after the first month; the
  second month moves MORE cells than the first fortnight (d1→d14: 10 on
  the 2 seeds with d14 snapshots; d14→d28: 16 on 2 seeds). By task
  d28→dEnd: wood 7, stone 6, cook 6, water 4. Practice reps at dEnd:
  1,797 pooled. Ethan (1502) is the standout: wood/stone/water/cook all
  stepped 1.3→1.4 with 33–69 reps each — a villager visibly becoming the
  village's builder-hand.
- **Q2 HOLDER-SINCE DATING: GO** — 4 living dEnd field_dressing holders,
  **0 undatable**, 3 gains in the d14–dEnd window: Pavel (1504, telemetry
  d41), Cristina (1603, telemetry d36), Catalina (1603, telemetry d42);
  Emma (1604) seeded at d1. The dating hole is closed: every holder is
  datable to a ≤14-day window, and the snapshots + telemetry agree on the
  bracket for all three gains.
- **FUNNEL-REPRO: REPRODUCED** — every funnel key (endDay/aliveEnd/
  aliveAt40/wave/pantry/deaths/teleTypes/skillCounts/huntStaff/daily)
  reproduces r109's after-panel exactly on all 4 seeds, and the 16
  people-check transcripts are byte-identical apart from the run-tag
  header line. The practice snapshots are proven trajectory-neutral at
  panel scale. (Correction, not a re-score: the analyzer's first pass
  flagged DIVERGED on the transcripts because the byte-compare included
  the header line carrying the run tag; the bodies were identical. The
  compare now normalizes the header. See "Closeout notes".)
- **M3 SURVIVAL-42: 4/4. M4 PANTRY: 4/4** (0 starvation deaths).
- **Telemetry: quiet** — `telemetry-check` on the 4 r110 files vs the
  establishment baseline: no large deviations. Baseline NOT rolled.
  (Baseline is a gate-off control; this panel runs HUNTSTAFF=2 — the
  check stayed quiet regardless.)
- **check.js --quick: 284 passed, 6 failed in 673s** — all 6 the known
  pre-existing set, identical to r113's 6 on the same src/js base:
  measurement-proof-update + measurement-workflow (retained neutrality
  proof staleness), mobile-combat-cadence, occupation-panels (CLI
  workflow), phone-frame-proof (stale receipt), establishment-r20
  racks-full voice gate. None touches a file this branch changed (the
  branch has zero src/js changes). Gate bar met: no new failures. The
  r110 proof test itself is not in check.js's fixed list (same as r112/
  r113 practice tests); run directly, 23/23.

## Village assessment (plain words)
Four villages, 42 days each, all still standing at the end:
- **1502 (8 alive, wave 3, pantry 21k):** the fighting village. 29
  monsters killed in the field, 6 villagers lost — including the player
  twice over (Aubrey died in the wild on day 13; Maureen died in the
  arena on day 25) — and the village carried on both times, which is the
  succession working as designed. Chen the pharmacist is still tending
  wounds and asking for hands; Ethan the trail-crew lead is becoming the
  village's builder-hand, his wood/stone/water/cook all stepping up in
  the second month.
- **1504 (12 alive, wave 3, pantry 73k):** the fat, lucky village. All
  12 starters still alive, nobody died at all — 41 monsters killed, zero
  villager deaths. The pantry is triple anyone else's. Pavel the bush
  pilot picked up field_dressing on day 41, late but real.
- **1603 (8 alive, wave 4, pantry 31k):** the hard village. Wave 4
  reached by day 42. Four villagers lost, including the player (Carmine
  died of sickness on day 15) and Ursula the mortician, killed by a
  monster on day 38 — the same Ursula whose thin conversation started
  the r109 run. Cristina and Catalina both learned field_dressing in the
  last week (days 36 and 42).
- **1604 (9 alive, wave 4, pantry 14.5k):** the lean village. Wave 4
  reached, but the pantry is the thinnest (14.5k) and the player died on
  the last day (Deirdre, in the wild, day 42) — the same Deirdre Emma
  asks about in the end-of-run conversation ("Deirdre's gone"). The
  game remembers its dead inside its dialogue.
- **What they know:** 88 skills gained across the panel (track_read,
  wound_care, steady_hands, diplomat, gossip_network lead). Skills
  spread villager to villager — teaching works.
- **What is missing:** the specialist ladder. Specialist skill and
  foodXp are frozen at zero for every villager on every seed (1,797
  practice reps, 0 moves from 0 to positive in 42 days). A few villagers
  start with specialist depth from their old job (butcher 2–3, preserver
  3, spotter 2–3) and it never grows. Competence moves, skills spread,
  but specialist depth does not — the same gate sim-practicemove-a named
  ("specialist ladder shut with 0 foodXp"). That is the next lever to
  test, not this run's fix.
- **Care:** triage USED (9 reach-2 tends, Chen tending 2 in one tick
  repeatedly); 167 care ticks, 75 tends, 49 healer rounds. Herbal
  remedy, field_dressing, preserve_food, wound_care, diplomat all
  HELD-UNUSED on the end snapshots — the same shape as r108/r109.
  Field_dressing holders exist (4) but no hunt kill in the panel used
  one (0 field-dressing kills; 12 hunt kills, all not-held).
- **Hunt prep:** 12 prep calls, all no-teacher (9 no-teacher-anywhere,
  3 teacher-unseeded), 0 lesson attempts — the words rung stays
  unexercised for a third run running. The teacher is never at home when
  the hunter is picked.

## People check (16 held convos read in full)
**0 stalls** across 16 conversations (2 wound-down clean endings, the
same shape r109 verified). Villagers act like people:
- **Wants that are real:** Chen needs hands for a wound because Maureen
  is dead; Omar is feverish and wants to be taught; Yara asks to bond
  and wants the village to link with Emberhold; Caroline and Paolo both
  carry a taken sister / grandfather in the pods and the player OWES
  them an ask to the System; Cristina confides she knows who took the
  extra rations but won't say; Tama is saving a candy bar for when
  things get better.
- **The nonverbal system works:** Simran (Hindi-only) and Juan
  (Tagalog-only) hold full conversations in gesture — mime, nod, smile,
  listen — and Juan's speak-back beat ("You said that BEAUTIFULLY. It
  means nothing like what you think it means.") is the funniest line in
  the panel. Both wind down cleanly with wordless closings.
- **Party naming lands:** Nora's party becomes APEX SNACKS by player
  pick, with the roles menu offered right after ("Roles. Not ranks —
  promises.").
- **Blemishes (documented, not fixed here):**
  1. Tama (1504): picking `menu:more` ("More things to say") returns a
     **(null)** line — a pagination pick with no line at all. Minor,
     real, needs a fix on the conversation side.
  2. Nora (1604): the same gossip line ("Did you hear? You won The
     Auction on the cameras...") fires twice in one conversation via
     different picks. Same class as the r109 metric-review item
     (accept lines repeat verbatim) — narration-pool work, Loop B's
     arena/gauntlet axis owns it.
  3. Omar (1502): the teach-me want is restated twice in a row
     ("Teach me something" → "I'd like to learn something I can use
     today") right after agreeing. Mild repetition.
  4. DeShawn (1504): "I want to remember what fun felt like" is a
     great want that the conversation never develops — two goon picks
     wind it down. Driver-side (goon-first sampling), not an engine
     defect; noted, not chased.

## Blanks filled / documented
- **Filled:** the holder-since dating hole (Q2 GO) — the d14/d28/dEnd
  snapshots date every skill gain to a ≤14-day window. The practice
  snapshot is now a standing instrument for this leg (d1/d14/d28/dEnd
  competence + practice + specialist + foodXp + npcSkills), proven
  trajectory-neutral.
- **Documented, not fixed:** the specialist/foodXp ladder is frozen
  (0 moves, 4 seeds, 42 days) — the next lever, needs a design + fix
  run of its own. The `menu:more` → (null) line. The gossip-repeat
  class (Loop B owned). The prep funnel stays dry (0 lessons in 12
  calls — no teacher ever at home; the words rung unexercised).
- **Instrument note:** the d14 snapshot missed on 1504 and 1603 —
  not a bug: the scholar day SKIPS days (sleeps sometimes advance 2
  days; daily rows miss 7/12/14/… identically in r109, r109-before
  and r110 — deterministic engine behavior). Exact-day snapshot
  matching is brittle against skips; the next run should snapshot on
  the first day ≥14 / ≥28 and record the actual day. Q1 was unaffected
  (d28 + dEnd fired on all 4 seeds).

## Reachable / fun / winnable (establishment leg)
- **Reachable: yes.** Every establishment beat fired on 4/4 seeds:
  routines, specialists, pantry, first contests (2–6/seed), wave 1–3
  everywhere, wave 4 on 2/4 seeds by day 42.
- **Fun: yes, with thin spots.** The villages feel alive — competence
  visibly moves, skills spread, conversations carry real wants, grief
  and jokes. Thin spots: the prep funnel is dry (no teacher ever at
  home), DeShawn's fun-want never develops, one null pagination line.
- **Winnable: the leg does its part.** Practice keeps working in month
  2 (23 attributed cells, 4/4 seeds) — the upstream lever for the
  wave-4 party problem is real and sustained. The binding link stays
  downstream (wild wave-4 kills → veterans → readiness), owned by the
  winnability rounds; nothing in this leg blocks it, and the frozen
  specialist ladder is the clearest next constraint to price.

## Metric review (for the NEXT run, not this one)
- **d14 snapshot gap:** exact-day matching misses skipped days — next
  driver snapshots on the first day ≥14 / ≥28 (record actual day).
  The d1→d14 / d14→d28 windows were only measurable on 2/4 seeds
  this run.
- **Specialist/foodXp 0→positive is the sharper skill bar:** 0 moves
  while npcSkills gained 88 — the next run should pre-register the
  specialist-ladder question explicitly (is the ladder shut, or does
  it need a longer horizon / a specific trigger?).
- **Same-animal held/notheld kcal ratio** (r109 carry): still
  descriptive only — 0 field-dressing kills in the panel, so the ratio
  is unmeasurable here too. It needs a panel where a holder actually
  hunts.
- **M1 'words' side:** 0 lesson rows for a third run — the words rung
  is unexercised, not failed. A run that wants to judge it needs a
  panel where a teacher is at home (different seeds, or a setup that
  puts a holder at home).
- **Gossip-repeat / accept-line-repeat:** narration-pool work, Loop B
  owned; second sighting of the class this run (Nora, 1604).
- **`menu:more` → (null):** conversation-side fix owed; small.
- **Metric held:** Q1's bar (≥1 attributed d28→dEnd cell on ≥3/4
  seeds) measured what it claimed — movement continuing, not just
  movement existing. No re-score was needed or done.

## Closeout notes
- **Index clobber on the substrate commit** (known class, third
  sighting pattern): committed files showed staged-as-deleted +
  untracked after safe-commit. Repaired via HEAD-blob
  `update-index --add --cacheinfo`; verified status clean + diff
  HEAD empty + blobs match. Commit d765061de is correct.
- **Reap slow (~8 min):** `git status` in round-0515-evidence takes
  minutes — that tree holds 81,789 files / 9.4G. The reap is not hung,
  just scanning; nothing was removed, 3 LOUD dirty trees belong to
  live owners.
- **EPERM flap (morning):** active ~06:30 CST (O_EXCL refused
  minute-to-minute); clear by run start (3/3 probes OK 12:44Z).
  Registration still took ~4.5 min (slow reset + registry-lock
  contention with a sibling reap).
- **Analyzer correction (not a re-score):** the funnel-repro
  transcript compare first flagged DIVERGED on all 4 seeds because it
  compared the header line carrying the run tag; the conversation
  bodies were byte-identical (verified with diff). The compare now
  normalizes the header. The data never changed; the check was
  over-strict. The proof test was re-run green (23/23) on the final
  analyzer.
- **Master moved during the run:** base 2016a7ed0 → 4ac05a8b9 (Loop B
  sim-winnability-round-1230 evidence + feastdrive/sitstep2 scripts;
  zero src/js changes, zero overlap with this branch's files). Branch
  rebased onto the explicit SHA 4ac05a8b9 before merging; proof test
  re-run green (23/23) on the rebased tip. Panel numbers stand: the
  engine the panel ran on is byte-identical to the rebased tip's for
  every file the journey driver loads.
- **Rotation:** played leg 1 (establishment); write back 2
  (deepening) at closeout.
- **Convergence:** `converging` — Q1 GO, Q2 GO; the specialist-ladder
  freeze is the next question, not a re-run of this one.

## Evidence
- `evidence/2026-11-07/journey-establishment-r110-prereg.md`
- `evidence/2026-11-07/journey-establishment-r110-seed{1502,1504,1603,1604}.json`
- `evidence/2026-11-07/journey-establishment-r110-convo-seed{1502,1504,1603,1604}.txt`
- `evidence/2026-11-07/journey-establishment-r110-analysis.txt`
- `evidence/2026-11-07/journey-establishment-r110-panel.log`
- `evidence/2026-11-07/journey-establishment-r110-telemetry.txt`
- `evidence/2026-11-07/journey-establishment-r110-checkquick.log`
- `scripts/journey-establishment-r110-20261107.js`
  `scripts/analyze-journey-establishment-r110-20261107.py`
  `scripts/test-journey-establishment-r110-practice.js`
