# journey-scale r32 — THE POOR VILLAGE THAT FINALLY CLIMBED (2026-10-25, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261025T0600Z. Rotation read 3 → leg 3 SCALE
(days 80–140); wrote 3→0 on completion.
**Base:** master@f35a6c0c2 (pulled at run start).
**Driver:** `scripts/journey-scale-r32-20261025.js` (r31 driver, names/EVIDIR only,
plus three census fields). **Analyzer:** `scripts/analyze-scale-r32-20261025.js`
(r31 analyzer, names only, plus poor-courtship counts).
**Policy:** `scripts/policies/scalecourt-nogate.js` — a VARIANT of scalecourt.
Standing scalecourt.js is untouched. **Proof test:**
`scripts/test-journey-scale-r32-nogate.js` (14/14).
**Pre-register:** `evidence/2026-10-25/journey-scale-r32-prereg.md` (written
before any sim).
**Seeds:** MATCHED to r30/r31: 85001–85004. Same starting worlds, same driver,
same horizon (DAYCAP=150, death-aware stop). Pilot seed 85001 ran first and
passed the prereg gate (pilgrimages 4 > 0, no crash) before the other three
launched. Picker UNCHANGED (r31 discipline — its cap is r33's own driver arm).

## Pre-registered leg question

r31 named the >12,000 kcal pantry gate as the sharpest policy artifact: it
blocks new courtship AND freezes in-progress pilgrimages (85004: 1/5
completed). Does dropping the gate move anything — or does courting while
poor fail for game reasons?

## The arm (policy tooling only, zero src/js changes, zero game-bar changes)

In scalecourt-nogate.js the courtship-block gate `pantryKcal(Game) > 12000`
is removed. Climb-before-knock, the opinion-≥10 proposal bar, one proposal
per day, and 7-day cooldowns are identical. DELIBERATELY UNCHANGED pay-gates:
tribute >15,000, trade-call >10,000, demand >12,000, counter-sweeten
>25,000 — a poor village still does not pay what it cannot carry; only the
courtship verbs (climb + propose) run while poor.

## Verdicts (binding — none re-scored)

- **G1 poor-courtship fires: GO.** On 85004 (r31's poor seed): courtPoorDays
  54 (≥10) and pilgrimage completions 5 (≥3; r31: 1 of 5 started). Completion
  rate 5/7 = 71% vs r31's 20%. Poor courtship also directly produced
  proposals (proposedPeerPoor 4 on 85004, 2 on 85003). The gate was the
  freeze — courting while poor works in-game.
- **P1 third bond by d110 on ≥ 3/4: GO (3/4; r31: 2/4).** 85001 week d49
  (same as r31), 85004 week d91 (r31: never — max 1 bond all run), 85003
  week d98 (same as r31). 85002 never: count-ceiling in its diverged world
  (3 villages total, as in r31).
- **L1 stay-green (national ≤ d140 on ≥ 2/4): NO-GO (1/4, same count as
  r30/r31).** Only 85001, at d77 (same as r31) with global d83 (r31: d78 —
  viewership timing diverged). The bottleneck has MOVED: it is no longer
  bond count, it is trust. 85003's three covenants ended at trust 34/34/34
  (age 52–54 days passes; trust 40 fails on all three). 85004's ended at
  60/35/35 (one seasoned of three). The seasoned-trust bar (SCALE.md:
  age ≥ 30 AND trust ≥ 40) is now the named next bottleneck — exactly as
  r31 predicted for 85003-type seeds.
- **L5 stay-green: GO (vacuous — no ending owed).** All four villages alive
  at the d150/151 cap, so no ending was owed and none went unvoiced.
  (Contrast r31, where both endings were voiced in full.)
- **M4 people: GO on content, NO-GO on the picker as played.** All 8
  transcripts carry a real want (see People check). 2 clean, 1 lightly
  marred, 5 marred by the picker (goon ×2–3, more ×7, and one goon re-ask
  after a deflect that does not hear the no). Same formulation as r30/r31;
  the picker cap is r33's arm, with this run's instances as its evidence.

## Mechanisms verified in the wild (not just in code)

- **The gate drop moved the poor village, not the rich ones.** 85001
  (rich early) is near-identical to r31: third bond d49, national d77,
  pool drawn 24,521 kcal. 85002 (rich all run, poorDays 0) is identical in
  shape to r31: 17/17 pilgrimages/studies, 2 covenants, count-ceiling. The
  arm's effect concentrates exactly where the gate bound: 85004 (poorDays
  54) and 85003 (poorDays 15).
- **Bonds can arrive in a bunch.** 85003 went 0→3 covenants between the d91
  and d98 weekly samples, 85004 between d84 and d91. Candidates sit below
  the bar together, climb together, and cross the opinion bar together —
  courtship is lumpy, not one-a-month. Weekly granularity, so the true
  formation days are within those weeks.
- **Earlier bonds do not season themselves.** 85003's bonds are 52–54 days
  old at the cap — the age bar is cleared twice over — but trust sits at
  34 on all three, six points short. Trust growth after formation, not bond
  formation, is now the pace question. (Why all three sit at exactly 34 is
  noted, not explained — same formation week, same treatment since.)
- **Courting while poor did not collapse any village.** No r32 village
  scattered or died out; the fear case for the gate (poor courtship drains
  the pantry into collapse) did not materialize on any seed. 85004 ended
  with pantry 11,544 and 3 people alive — thin, but alive and bonded.
  (Its roster fell 12→3 across the run on arena and monster deaths, not
  starvation — see Village assessments.)

## Village assessments (plain words)

- **85001 (national d77, global d83, alive 7/7 at d150):** the league that
  lived. Same three covenants as r31, same national day, global five days
  later (viewership, not courtship, moved). Pool drew 24,521 kcal in famine
  relief. Ended on pantry 500 — global, bonded, and living hand to mouth.
- **85002 (alive 9/9 at d151, regional):** the climber with nowhere to
  climb, again. 17 pilgrimages, 17 studies, 2 covenants at trust 67/66 —
  healthy bonds, but its diverged world holds only 3 villages, so a third
  covenant is structurally impossible. Rich (pantry 53,157) and capped by
  the map it drew.
- **85003 (3 bonds by d98, alive 9/9 at d150, regional):** the early-but-
  unseasoned one. Same three covenants as r31, same third-bond week, but
  trust 34/34/34 at the end — six points short on all three — so the
  seasoned bar never cleared and no national staged. (r31's version
  scattered d146; this one survived to the cap — divergence, not
  attribution.)
- **85004 (3 bonds by d91, alive 3/3 at d150, regional):** the poor village
  that finally climbed. r31: 1 bond all run, 1/5 pilgrimages completed.
  r32: 54 poor-courtship days, 7 pilgrimages, 5 completed, 3 bonds by d91,
  trusts 60/35/35. Alive but gutted — 12 people down to 3, arena and
  monster deaths through the run — bonded, thin, and still standing.

## People check (SENSE-TESTING LAW — 8 transcripts read in full)

- **85001-d90 Tom (curious, song):** content meaningful — "I just realized
  I haven't heard anyone sing" — marred by picker goon ×2 and a dropped
  plant ("Come see what I found" → leave). Content GO, as-played
  driver-marred.
- **85001-d120 Miguel (ask_favor, water haul):** clean GO. "The cistern's
  nearly dry — 7 liters left. I need someone to haul water with me at first
  light" → commit → "Dawn, then." A want, an engagement, a resolution.
- **85002-d90 Domfeh (ask_favor, forage together):** content GO, deflect
  taken with consequence ("They won't ask twice"), then the picker goons
  a re-ask AFTER the deflect — it does not hear the no. Content GO,
  as-played driver-marred; this is the same defect instance as r31's
  Domfeh transcript, and it sharpens r33's spec: never goon after a
  deflect, not just cap consecutive goons.
- **85002-d120 Sanne (curious, regrets):** content GO — "I regret the
  ordinary days I rushed through… I'd pay anything for one annoyed morning
  now" — stretched by picker goon ×3 into a loop. Content GO, as-played
  driver-marred.
- **85003-d90 Joshua (seek_taken, pod dreams):** content GO. "Even asking
  is more than the silence." One goon after the resolution, plant dropped.
  Lightly marred.
- **85003-d120 Joshua (leadership):** content on-point for the scale leg —
  a villager deciding to step up ("Leadership isn't a title. It's the
  person who stays up wondering if everyone ate.") — but the picker chose
  dlg:more 7 times running, turning a conversation into a monologue.
  Content GO, as-played the run's clearest picker failure (same beat as
  r31's instance).
- **85004-d90 Rubel (curious, first memories):** content GO — "First
  memories are half real and half the story you needed" — marred by
  picker goon ×3. The opening ("I asked Dorothy about your first memory —
  Dorothy's gone") reads as a dead villager remembered, coherent in a
  village that has lost people.
- **85004-d120 Vasyl (ask_favor, pantry run):** clean GO. Details engaged,
  deflect taken with consequence ("the subject is closed. They won't raise
  it again"), leave. A want, an engagement, a closed door.

## Blanks filled / fixed this run

1. **Pantry-gate arm (policy variant):** `scripts/policies/scalecourt-nogate.js`
   drops the courtship-block pantry gate; standing scalecourt.js untouched.
   Proven by the matched 4-seed run (85004: 3 bonds vs r31's 1; completions
   5 vs 1) and by `scripts/test-journey-scale-r32-nogate.js` (14/14: gate
   dropped only in the variant, standing gate intact, all pay-gates kept,
   r31 health fix kept, census instruments present, 85004 arm-firing
   thresholds met). Zero src/js changes.
2. **Driver + analyzer copies:** r32 pair, matched seeds, same instruments
   plus poor-courtship counts.
3. **Documented, NOT fixed this run (discipline — each needs its own arm):**
   - (a) **Picker more/goon loop + post-deflect goon:** cap consecutive
     dlg:more/goon AND never goon after a deflect. Evidence: 6/8 transcripts
     above (Tom, Domfeh, Sanne, Joshua d120, Rubel marred; Joshua d90
     lightly). Next run's driver arm (r33), with before/after transcript
     proof. r33 should also decide whether the "Come see what I found"
     plant-drop (Tom, Joshua d90) is picker or content.
   - (b) **Seasoned-trust bar:** the next scale question is trust growth
     after formation (85003: 34/34/34 at age 52+; 85004: 35/35 on two of
     three). What raises covenant trust post-formation, and at what rate?
     That measurement — not another bond-count arm — is what stands
     between these villages and national.
   - (c) **85004's roster collapse (12→3)** is reported, not diagnosed:
     arena and monster deaths, not starvation, but whether that attrition
     rate is scale-leg normal or a divergence artifact is unmeasured.

## Metric review

- No metric re-scored mid-run. L1 reported NO-GO as bound, with the
  mechanism behind the miss named (seasoned-trust bar) rather than
  softened. P1's bar (3/4 by d110) was met with one seed to spare; the miss
  (85002) is count-ceiling-by-divergence, same as r31.
- **Matched-seed lesson, restated:** matched seeds are matched at world-gen,
  not throughout — r32's 85001 survived to the cap where r31's died out
  d125, and 85003 survived where r31's scattered d146. Later deaths and
  survivals are divergence, not attribution. Bond timing in the first
  ~50 days (85001 d49 both runs) is the clean comparison.
- **G1 wording lesson for the NEXT run:** "completions ≥ 3" is now too weak
  a bar for the poor seed — 85004 completed 5. Next run should pre-register
  completion RATE and the trust-growth question, not re-run the gate arm.
- **Telemetry check:** LOUD on 5 of 6 scale baseline metrics — ALL EXPLAINED
  as instrument-shape mismatch, same as r30/r31: r32 census JSONs carry no
  markerCounts/fightsTotal/maxGameDay fields (that baseline is from a
  different instrument). The mechanisms are present in-capture: national
  on 1/4 (d77), global d83, defense calls answered, pool drawn 24,521 kcal.
  Baseline NOT rolled (shape mismatch, and rolling a policy-arm run into
  the baseline would bake the arm in). tableTele 0→0, no LOUD line.
- **Test suites:** `node --check` clean (variant policy, driver, analyzer,
  proof test); proof test 14/14. Quick gate: `node scripts/check.js --quick`
  → 279 passed, 8 failed in 1413s. The 8th failure vs r31's 280/7 is
  `test-hide-discovery.js` ("counter butchering keeps material and lesson on
  the counter until pickup") — caused by r44's just-landed hide-beat change
  (food.js, base f35a6c0c2), NOT by this run (zero src/js changes, zero
  standing-policy changes, all r32 files new). Corroborated: lane B's
  independent quick gate in another worktree the same morning also reports
  279/8 with hide-discovery failing. The other 7 failures are r31's exact
  pre-existing set (measurement-comparison, measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, test-parity-20261014). No re-run: the failure set is
  identical across two independent worktrees, and this run's files cannot
  load into that test (it exercises src/js food behavior, not policy
  tooling).

## Ops

- Worktree journey-scale registered, heartbeated throughout (9-minute
  loop), released and removed at the end; branch deleted after merge;
  main tree verified clean. No version bump/push (ship loop owns it).
  Merged locally, pending ship — no version tag, no push. Lock deleted.
