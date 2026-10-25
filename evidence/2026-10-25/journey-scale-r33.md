# journey-scale r33 — THE PICKER STOPS MONOLOGUING (2026-10-25, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261025T0943Z. Rotation read 3 → leg 3 SCALE
(days 80–140); write 3→0 on completion.
**Base:** master@f810314b8 (pulled at run start).
**Driver:** `scripts/journey-scale-r33-20261025.js` (r32 driver, picker cap only).
**Analyzer:** `scripts/analyze-scale-r33-20261025.js` (r32 analyzer + picker
counts + trust trajectories). **Proof test:**
`scripts/test-journey-scale-r33-pickcap.js` (14/14).
**Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED from r32.
Standing scalecourt.js untouched. Zero src/js changes.
**Pre-register:** `evidence/2026-10-25/journey-scale-r33-prereg.md` (written
before any sim).
**Seeds:** MATCHED to r30/r31/r32: 85001–85004. Same horizon (DAYCAP=150,
death-aware stop). Pilot seed 85001 ran first and passed the prereg gate
(4 pilgrimages, no crash) before the other three launched.

## Pre-registered leg question

r32 named the conversation picker as the as-played defect: more/goon loops
marred 6/8 transcripts (measured max consecutive stretches 0, 2, 3, 1, 8, 1,
0, 3) plus one goon re-ask after a deflect. Does capping the picker fix the
as-played conversation without breaking the content — and, measured on the
same run, what does covenant trust actually do after formation?

## The arm (driver only, one change)

At most ONE consecutive dlg:more/goon press, and NEVER goon after a deflect
in the same conversation. State {consec, deflected} is maintained by
runConversation and passed to pickChoice. Everything else is r32-identical.

## Verdicts (binding — none re-scored)

- **PICK1 picker stretches: GO.** All 8 transcripts: max consecutive
  dlg:more/goon ≤ 1 (0, 1, 0, 1, 1, 1, 0, 1), post-deflect goon picks 0.
  r32 baseline: stretches up to 8, post-deflect goon 1. Both defect classes
  are gone, not reduced.
- **PICK2 meaning preserved: GO (8/8 meaningful; bar was ≥ 6/8).** Every
  transcript below carries a real want with engage/deflect and a
  resolution. Shorter transcripts are not thinner ones — the cap forced
  alternation (more/react) and the content held across 7 turns where r32
  looped.
- **TRUST (measurement, report-only):** covenant trust does NOT behave one
  way. Two classes, split by formation day (see Mechanisms): early-formed
  covenants climb to season (85001: peaks 71–89; 85002: 30→66); late-formed
  covenants (d91–98) stall at peak 35–38 and decay to 34–37, never reaching
  40 (85003 all three; 85004's two late ones). The seasoned-trust bar is
  the wall for late bonds, not for bonds in general. No bar was set and
  none is claimed — this run measures, r34 arms.
- **BONDS/NATIONAL (report-only):** third bond by d110 on 3/4 (85001, 85003,
  85004) and national by d140 on 1/4 (85001 d77, global d83) — identical
  counts to r32. The picker change moved no courtship outcome, as expected:
  sampled d90/d120 talks do not move the ladder.
- **L5 stay-green: GO (vacuous).** All four villages alive at the d150/151
  cap, so no ending was owed and none went unvoiced.

## Mechanisms verified in the wild (not just in code)

- **The before/after pair is exact.** 85003-d120 is the same villager
  (Joshua), same want (seek_taken/leadership), same opening as r32's
  8×more monologue. r33: more/react alternating over 7 turns, every line
  distinct, leadership arc intact ("Leadership isn't a title. It's the
  person who stays up wondering if everyone ate."), clean leave. The
  content was fine; the picker was the defect. Same for 85002-d120 Sanne
  (r32 goon×3 → r33 more/react arc about collecting jokes like firewood).
- **The deflect defect is fixed in its own case.** 85002-d90 Domfeh is the
  r32 post-deflect-goon instance: r33 runs details → cant ("They won't ask
  twice") → leave. The no is heard now.
- **Covenant trust splits by formation day, not by seed.** Formed ≤ d77:
  climb (85001 d42–49: first 43–46, peaks 71–89; 85002 d70–77: first 30–32,
  peaks 65–66, still climbing at the cap). Formed ≥ d91: stall-and-decay
  (85003 d98: first 30, peak 38 @age ~36, final 35–37 @age ~43; 85004 d91:
  first 29–31, peak 35–37 @age ~16–19, final 34 @age ~58–61). Primary-sub
  links climb throughout (40→50–73) on every seed, so this is covenant-
  specific, not a global trust freeze. Tended counter is 0 everywhere, so
  whatever grows covenant trust is not the policy's tending path — r34's
  instrument must day-attribute trust deltas against capture lines
  (tribute arrivals, defense, feasts, court lines) per link to find it.
  Correlation across 4 seeds is not a mechanism; the split is reported as
  the shape r34 must explain, not as a cause.
- **85001 is byte-stable where it counts.** National d77, global d83, pool
  drawn 24,521 kcal — identical to r32 — while its d90 transcript went
  from goon×2 to a single goon and a clean leave. The picker arm is
  behaviorally surgical.

## Village assessments (plain words)

- **85001 (global d83, alive 7/7 at d150):** the league that lived, again.
  Three covenants seasoned (trust 59–89), pool drew 24,521 kcal in famine
  relief. Ended on pantry 500 — global, bonded, living hand to mouth.
- **85002 (alive 8/8 at d151, regional):** the climber with nowhere to
  climb, again. Two covenants seasoned (65/66), pantry 28,720 — rich, and
  capped by a 3-village world, same as r32.
- **85003 (alive 8/8 at d151, regional):** the early-but-unseasoned one,
  again. Three covenants formed d98 at trust 30, peaked 38, ended 35–37 —
  six points short on the seasoned bar, same class as r32's 34/34/34.
  Pantry lean at 4,389.
- **85004 (alive 3/3 at d150, regional):** the poor village that climbed,
  gutted. 54 poor-courtship days, 7 pilgrimages, 3 covenants — one early
  one seasoned (59), two late ones stalled at 34. Pantry 11,544, thin but
  standing.

## People check (SENSE-TESTING LAW — 8 transcripts read in full)

- **85001-d90 Tom (curious, song):** clean GO. r32's goon×2 is now one goon
  and a leave ("Tunes outlast everything."). Want, engagement, resolution.
- **85001-d120 Miguel (ask_favor, water haul):** clean GO on content
  ("Dawn, then."), with a minor closing-line mismatch noted: the endConvo
  'done' closing ("Think about it. Really think. Then come find me.")
  contradicts the commit just made. Content GO, closing-line blank (see
  Blanks).
- **85002-d90 Domfeh (ask_favor, forage together):** clean GO — the fixed
  defect case. Details engaged, deflect taken with consequence ("They
  won't ask twice"), leave.
- **85002-d120 Sanne (curious, jokes/joy):** clean GO. r32's goon×3 loop is
  now a more/react arc: "I'm collecting jokes like firewood… Joy is a
  resource. I'm foraging for it." A villager with a project, not a loop.
- **85003-d90 Joshua (seek_taken, pod dreams):** content GO, plant-drop
  mar (recurring, see Blanks). Commit promise ("Even asking is more than
  the silence.") then one goon to "Come see what I found" — and the
  conversation leaves without following it, exactly as in r32.
- **85003-d120 Joshua (leadership):** clean GO — the decisive before/after
  (see Mechanisms). Same villager, same want, same opening as r32's
  monologue; now a real conversation.
- **85004-d90 Rubel (curious, first memories):** clean GO, short. r32's
  goon×3 is now tell → one goon → a reaction beat ("The air goes tight.")
  → leave. The "Dorothy's gone" opening still reads as a dead villager
  remembered, coherent in a village that has lost people.
- **85004-d120 Vasyl (ask_favor, pantry run):** clean GO. Details engaged,
  deflect taken with consequence ("the subject is closed. They won't
  raise it again"), leave — same shape as r32's clean instance.

## Blanks filled / fixed this run

1. **Picker cap (driver):** `scripts/journey-scale-r33-20261025.js` caps
   consecutive dlg:more/goon at 1 and blocks goon after a deflect.
   Proven by `scripts/test-journey-scale-r33-pickcap.js` (14/14: extracts
   the actual pickChoice from the driver and replays r32's failure traces)
   and by the matched 4-seed run (all 8 transcripts stretch ≤ 1,
   post-deflect goon 0). Zero src/js changes; standing policy untouched.
2. **Driver + analyzer copies:** r33 pair, matched seeds, same instruments
   plus picker counts and trust trajectories.
3. **Documented, NOT fixed this run (discipline — each needs its own arm):**
   - (a) **"Come see what I found" plant-drop:** recurs in r33 (85003-d90,
     same as r32's Tom and Joshua d90 instances). The line is followed by
     a leave with no follow-through. Next run should determine whether
     the engine offers a follow-up the driver ignores, or the content
     itself dead-ends — picker or content, decided by evidence, not by
     this run's guess.
   - (b) **Closing-line mismatch after a commit:** 85001-d120's endConvo
     'done' closing ("Think about it…") contradicts the commit. The
     closing line should reflect the conversation's outcome, or the
     driver should not request a 'done' closing after a commit.
   - (c) **Covenant trust growth mechanism:** the d77/d91 split above is
     the r34 question — day-attributed trust deltas per link against
     capture lines. What raises trust post-formation, and why does it
     stop for late bonds?
   - (d) **Cosmetic:** the r33 driver's summary header still prints
     "R32 SUMMARY" (copied label, console output only — no behavior
     difference). Fix with the next driver copy.

## Metric review

- No metric re-scored mid-run. PICK1/PICK2 were judged exactly as
  pre-registered (stretches counted from transcript YOU lines; meaning
  judged by full reads). Bonds/national were report-only as pre-registered
  and are reported at r32-identical counts, not upgraded into a verdict.
- **Trust-measurement lesson for the NEXT run:** weekly samples are too
  coarse to find the growth mechanism — the d77/d91 split is visible, but
  the events between samples are not. r34 needs day-attributed deltas, or
  it will re-measure the same split.
- **Matched-seed lesson, restated:** matched seeds are matched at
  world-gen, not throughout — 85001's national/global timing is identical
  to r32's, but 85003's and 85004's late-covenant trusts differ slightly
  (35–37 vs 34/34/34; 34 vs 35/35) because the picker change rewrote the
  RNG stream after d90. Timing in the first ~50 days is the clean
  comparison; late trust values are same-class, not same-number.
- **Telemetry check:** LOUD on 5 of 6 scale baseline metrics — ALL
  EXPLAINED as instrument-shape mismatch, same as r30/r31/r32: r33 census
  JSONs carry no markerCounts/fightsTotal/maxGameDay fields (that baseline
  is from a different instrument). The mechanisms are present in-capture:
  national on 85001 (d77), global d83, pool drawn 24,521 kcal, defense
  calls answered (85001: 7). Baseline NOT rolled (shape mismatch, and
  rolling a driver-arm run into the baseline would bake the arm in).
  tableTele 0→0, no LOUD line.
- **Test suites:** `node --check` clean (driver, analyzer, proof test);
  proof test 14/14. Quick gate: `node scripts/check.js --quick` →
  279 passed, 8 failed in 1382s — the EXACT pre-existing failure set from
  r32 (hide-discovery, measurement-comparison, measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, parity-20261014). No new regressions: this run made
  zero src/js changes, zero standing-policy changes, and all r33 files
  are new. Full log committed as journey-scale-r33-checkquick.log.

## Ops

- Worktree journey-scale registered, heartbeated throughout (loop + manual
  heartbeats), to be released and removed at the end; branch deleted after
  merge; main tree verified clean. No version bump/push (ship loop owns
  it). Merged locally, pending ship — no version tag, no push. Lock
  deleted at end. Rotation-a 3→0 on completion.
