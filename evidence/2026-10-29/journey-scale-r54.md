# journey-scale r54 — Lane A, leg 3 SCALE (2026-10-29)

**Run id:** oversight-playtest-loop-20261029T1545Z (scheduled 15:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 done at run start.
**Base:** master@30aeceb36 at worktree creation (sibling landed
7f74e1d15 mid-run; rebased at landing, proof re-run — see closeout).
**Pre-register:** evidence/2026-10-29/journey-scale-r54-prereg.md (written before
any seed ran). **Zero src/js changed by this run** — measurement only, plus
one driver script (r54 driver = r53 driver, labels/EVIDIR only, plus
read-only open-thread logging and the env-gated probe), one analyzer,
and evidence.
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before;
the probe pins Joshua, whom the quad run itself talks to at day 90).

## Infrastructure notes (loud, first)
- **Probe overwrote quad files — recovered, not papered over.** The
  probe run (85003, DAYCAP 100, talks d91–93) wrote into the same
  EVIDIR as the quad run and overwrote the quad's 85003 per-seed files
  — the exact r53 probe mistake, repeated. Caught before commit:
  probe files moved to evidence/2026-10-29/journey-scale-r54-probe/
  (per-seed files + d91–93 transcripts; the probe's d90 transcript
  copied there too), quad 85003 re-run (DAYCAP 180, no probe env),
  quad census restored exactly (day 161, pop 2/2, regional, lesser,
  arc 4, deaths 45, cov 18/19/22, pilg 11), and the re-run's d90
  transcript verified BYTE-IDENTICAL to the probe run's d90 transcript
  — which both proves the probe baseline valid (probe env inert
  through day 90) and that no quad data was lost. Lesson restated for
  the next probe run: probe EVIDIR must differ from quad EVIDIR in the
  driver (env-gated EVIDIR suffix), not by post-hoc file moves.
- **r53's on-disk 85003 capture is the probe artifact, not the quad.**
  Verified: r53's 85003 trust JSON says day 156, pop 1/1, pilg 7 —
  the probe run r53's note describes. The 9,461-line r54-vs-r53
  capture diff for 85003 is therefore probe-vs-quad, not a base
  divergence, and is excluded from the parity claim with this reason.
  The valid parity reference for 85003 is r52's census, which r54
  matches on every scalar (see Q1).
- **Master moved mid-run** (30aeceb36 → 7f74e1d15, sibling
  sim-food-economy-round-1930 evidence). Rebased at landing per the
  body; proof tests re-run after rebase (see closeout). No src/js in
  this run's change set, so the rebase cannot change game behavior.
- Heartbeat loop (10-min cadence, log at
  `hidden_files/journey-scale-r54-heartbeat.log`) verified landing
  after start and at each major step; registry heartbeat never went
  stale (last check 21:07Z vs 21:17Z now — inside the 15-min window).
- Driver stdout for each seed run went to goal hidden_files logs, not
  the terminal (r50/r51 noise lesson, kept).
- Base drift r53→r54 in src/js is narration-only (sim-raidname-b +
  version bump), verified by reading the raidname diff before
  pre-registering: no Math.random draw, no spawn/damage/crisis/
  economy value touched. The raid lines are the ONLY capture delta on
  85001/85002/85004 (see Q1).

## Verdicts (binding questions, answered)

### 1. QUAD-CURRENT-R54: PARITY-HOLDS — raidname confirmed narration-only in long play
Same 4 seeds, control picker, policy scalecourt-nogate, DAYCAP 180:
- 85001: day 138, died out, regional, national NONE, global NONE,
  lesser seat, arc 4, deaths 46, covenant trusts 15/19/17, maxWave 4,
  pilgrimages 6. Identical to r52/r53 on every scalar.
- 85002: day 178, scattered, regional, national NONE, global NONE,
  NO seat, arc 3, deaths 36, covenant trusts 33/26/26, maxWave 4.
  Identical to r53.
- 85003: day 161, died out (pop 2/2), regional, national NONE,
  global NONE, lesser seat, arc 4, deaths 45, covenant trusts
  18/19/22, maxWave 4, pilgrimages 11. Identical to r52 (the valid
  reference; r53's on-disk 85003 files are the probe — see above).
- 85004: day 181, ALIVE 7/7, pantry 25,536, NATIONAL (nationalDay
  179 — the day before the cap), global NONE, lesser seat, arc 4,
  firstCourt 178, covenant trusts 51/51/50, deaths 46, maxWave 4.
  Identical to r53, including the pantry to the kcal.
- Capture diffs vs the valid references: 85001 vs r52 — 52 diff
  lines, ZERO non-raid lines; 85002 vs r53 — 38 diff lines, ZERO
  non-raid lines (19 raid lines added, 0 in r53); 85004 vs r53 — 26
  diff lines, ZERO non-raid lines (13 raid lines added, 0 in r53).
  The raid-naming lines ("This one came with the raid on Haven",
  "already fell to the raid") are the only delta. No first-divergence
  audit was needed because there is no non-raid divergence to audit.
- Descriptive quad count, unchanged from r53: national 1/4 (at the
  wire), global 0/4. No causal claim is made or changed.

### 2. WANT-OPEN-THREAD-R54: OPENING-ONLY (n=1 displaced) — the opening is the want's only door
New read-only logging (open thread, want stage at open, stage at
pre-close, pre-talk seed) on all 8 quad talks:
- 7 of 8 talks open with thread 'want', want stage ≥1 at open:
  Irving d90 (ask_favor fromSeed, stage 2→3, committed), Opanas d120
  (curious fromSeed, 1→2), Nora d90 (curious fresh, 1→1, picker
  leaves at once), Keisha d120 (ask_favor fromSeed, 2→3, committed),
  Benoit d120 (ask_favor fresh, 1→3, committed), Zhanibek d120
  (curious fromSeed, 1→2). The want IS the spine in ordinary play.
- 1 of 8 talks is DISPLACED: 85003 d90 Joshua, want seek_taken
  fromSeed (seed planted d90 by competent-policy socializing earlier
  that day — takenWantDay=90, convoCount=13; the policy talks via
  competent.daily, the driver does not), open thread 'goal', stage
  0 at open AND 0 at pre-close, ZERO alive:want items in any turn's
  choices. Eight turns of leadership aphorisms, "Good talk", nothing
  changed — reproducing r52's control talk exactly on the new base.
- Per the prereg's fixed rule (0 of displaced talks surface the want
  later → OPENING-ONLY): the want never surfaces later in this
  conversation. No menu path, no thread-settle path rescued it. The
  subject menu offers no want item at stage 0 (code: convo-wants.js
  line 1950, stage 0 returns []), which is why r53's subject-first
  probe also found nothing there.
- Honest n: the displaced sample is ONE talk. OPENING-ONLY is the
  verdict for this sample, not a universal rate — but the mechanism
  (stage-0 wants have exactly one door, the opening) is code-pinned,
  not sample-inferred: the only other want paths (seed branch, fresh
  branch, stale reframe) all live in the opening.
- Sub-cause NOT pinned: why the seed branch fell through for Joshua
  (seed opener ledger-blocked vs opener null) is not directly logged
  by this run's instrument. Named as the next instrument (a
  would-block log on the seed line), not guessed. What IS pinned is
  the aftermath (Q3): the seed does not survive the failed talk.

### 3. SEED-CARRY-PROBE-R54: PHANTOM-RULE CONFIRMED + SEED LOOP POSITIVE CONTROL
Probe-only (85003, Joshua, control picker, talks d90 + d91 + d92 + d93;
probe census not judged):
- d90: reproduces the quad talk byte-identically (see infrastructure
  note). seek_taken fromSeed, thread goal, stage 0→0.
- d91 pre-talk dump: seed NONE — the phantom-seed rule's prediction
  holds exactly: the d90 talk (fromSeed + stage 0 at close) DELETED
  the seed at endConvo instead of re-planting it. takenWantDay stays
  90 (the d90 talk never surfaced). No seed carry for unestablished
  wants — by design, not by bug.
- d91: fresh pick is ask_favor, NOT seek_taken — the next talk is a
  fresh lottery, weighted by live need (a real water need: "Water's
  almost gone — 1 liters"). Thread want, stage 1 at open, player
  commits ("I'll come back to help"), stage 3 at pre-close. A real
  want, engaged, promised.
- d92 + d93: the POSITIVE CONTROL — the d91 promise plants a repay
  seed, and it surfaces both days via thread want, stage 1:
  "About the creek water run — have you had a chance? By the end of
  tomorrow." → "…By the end of today." The player (control picker)
  leaves without doing the favor, so it re-plants with a tightening
  deadline. The seed system works exactly as designed for wants that
  DID surface. The contrast is the finding: surfaced wants carry,
  unestablished wants evaporate.
- Per the prereg's fixed rules: seek_taken was picked in 1 of 4 talks
  and surfaced in 0 of that 1 — it was NOT re-picked on d91–93, so
  neither RE-PICK-SURFACES nor LOTTERY-COLD (as written) fires; the
  honest verdict is NOT-RE-PICKED (1/4 picked, 0/1 surfaced) plus
  PHANTOM-RULE CONFIRMED (d91 seed none). No seed-carry contradiction
  occurred. r53's open thread ("what moves a want from stage 0 to
  stage 1") is answered: NOTHING carries it — each talk re-picks
  fresh, and surfacing requires winning that talk's opening. A
  stage-0 want's only second chance is a later talk re-picking it.
- The r53 SEEK-TAKEN-PIN stands, refined: "stage 0 is silent" →
  "stage 0 is silent in that talk, evaporates at close, and gets only
  a fresh lottery next talk." No game change follows: both halves are
  designed behavior (phantom rule + seed loop), verified working.

### 4. PEOPLE CHECK (sense law — all 12 transcripts read fully)
Quad (8): Irving d90 — sick baker's favor, committed, thanked,
resolved. Real. Opanas d120 — teaching ask, player defers to
showing-while-working, NPC accepts, goon consequence (pulls back
half a step), closing thanks for listening. Real, small, complete.
Nora d90 — want named in opening, control picker leaves at once.
Thin-by-picker, not by content (same as r53). Keisha d120 — pantry
run committed with place and time. Real (same talk as r53, reproduced).
Benoit d120 — sick baker asks for help, committed, thanked. Real.
Joaquim d90 — no shared language, mime invitation, nods only, "a
promise without words." Honest about its barrier (same as r53).
Zhanibek d120 — distrust question, shared watchfulness planted, goon
consequence. Real (same as r53). Joshua d90 — goal aphorisms, nothing
changed. Thin-by-opening-loss (the Q2 case).
Probe (4): d91 water favor committed with a dawn plan. Real. d92/d93
repay follow-ups with tightening deadline. Real — the seed loop doing
its job in plain sight.
Verdict: quad 6/8 fully real, 1 thin-by-picker (Nora), 1
thin-by-opening-loss (Joshua); Joaquim honest-barrier, not thin.
Probe 3/3 real. No fabricated shared history, no filler loops, no
static menus in any transcript read.

### 5. TABLE-APPROACH (standing, report-only)
Identical voicing to r53 on all four seeds (parity, not a new
finding): 85001 lesser seat waiting + pellet; 85002 NO seat, priced
wait ("The ledger still wants: wave-3 monsters faced") + pellet;
85003 lesser seat + pellet; 85004 lesser seat waiting + the pellet's
price voiced back hard ("NO HUNGER ON THE RECORD — THE PELLET HUMS
WHERE THE FIRE SHOULD BE"). All four seeds took the fusion pellet
under this policy — the pellet confound r53 named is present on
every seed, not just 85004. No seat-taker choice voiced in-window;
no full-seat offer; full seat unwon (w5 0), as ever.

### 6. BARRIER PIN (standing instrument, re-confirmed)
sayOncePerFight calls: 85001 zero; 85002 two (boilWater "finish it
first" d81, sleep d161); 85003 two (sleep d117, sleep d120); 85004
five (sleep d26/d67/d127/d142/d143). ALL are real mid-fight
non-barrier refusals. ZERO barrier lines. The r52 pin stays
closed — no barrier call logged on any seed this run.

## Village assessment (plain words)
- **85001 — the village that died on schedule, again.** Day 138,
  died out, regional, lesser seat waiting at arc 4, 46 deaths, three
  covenants at 15/19/17. Byte-identical fate to r52/r53 — the base
  moved under it (raid names only) and nothing else did.
- **85002 — the village that ate the future and then scattered.**
  Day 178, scattered on the fifth hungry day, regional, NO seat, arc
  3, 36 deaths, covenants 33/26/26. Same as r53, including the pellet
  irony (never hungry personally, starving as a village).
- **85003 — the village that talked about the taken and never got an
  answer.** Day 161, died out with two people left, regional, lesser
  seat, arc 4, 45 deaths, covenants 18/19/22. Joshua's taken kin went
  unasked again — not because the content is missing, but because
  the want lost its one opening and evaporated, exactly as designed.
- **85004 — the village that climbs at the wire.** Day 181, all
  seven alive, pantry 25,536, national since day 179, lesser seat
  waiting, arc 4, 46 deaths, covenants 51/51/50. Same as r53 to the
  kcal — and still priced out of the feast deeds by the pellet it
  swallowed.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: yes for the climb's machinery — courts, covenants,
  pilgrimages, first courts, priced table voicing all fire in
  ordinary play, unchanged on the new base. The destination is still
  thin: national on 1 of 4 seeds, at the wire (day 179 of 180).
- FUN: mixed, same mix as r53 with one sharpening. The table voicing
  is still the leg's best writing, and this run adds a second piece
  of working machinery to admire: the seed loop (repay follow-ups
  that tighten their deadline) is the village remembering, in plain
  sight. The texture problem is now fully mechanized, not vague:
  a want that loses its opening goes silent for that talk AND
  evaporates — a real player who talks again tomorrow gets a fresh
  lottery, not the same ask. Whether that evaporation rate feels
  right is a design question, not a bug report.
- WINNABLE: not shown, again. The lesser seat waits, priced, on 3 of
  4 seeds (85002 has no seat at all); the full seat stays unwon
  (w5 0). The scale leg's win path remains the standing open
  question, with the pellet-on-every-seed confound now visible
  panel-wide: a policy that always takes the pellet always prices
  itself out of feast deeds.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant trusts).
- New metrics this run are classifications of transcript lines the
  driver already produced (open thread, stage at open/close,
  pre-talk seed), not re-scores of prior verdicts. r52's DIVERGED,
  r52's barrier pin, r53's QUAD-PARTIAL and SEEK-TAKEN-PIN stand;
  Q2/Q3 REFINE the seek-taken pin (from "stage 0 is silent" to the
  mechanism above) without re-scoring it, and Q1 confirms r53's quad
  counts on the new base.
- Q3's verdict rules were applied as written: neither
  RE-PICK-SURFACES nor LOTTERY-COLD fired as written (seek_taken was
  not re-picked on d91–93), so the verdict is reported as
  NOT-RE-PICKED + PHANTOM-RULE CONFIRMED rather than stretched to fit
  a rule. No metric was re-scored mid-run.
- The probe-overwrite incident is an instrument-operations failure,
  not a metric failure: no verdict rests on an overwritten file (the
  quad was re-run and verified; the probe baseline was verified
  byte-identical). Next probe runs get a separate EVIDIR by env.

## Telemetry deviation check (step 14 — NOT rolled, fourteenth confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-29/journey-scale-r54/journey-scale-r54-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=4 files)" —
the same vacuous shape mismatch as r42–r53 (the journey trust JSONs do
not carry those fields at all; n=4 here because the probe files live
in the probe subdir and are not globbed). Verdict: NOT a real
deviation. NOT rolled.

## Tests
- `node --check` clean on the r54 driver (at creation) and the r54
  analyzer (at creation).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  (filled at closeout — see CHECK-QUICK section below.)
- Zero src/js changes, so no game-code regression surface exists in
  this run's change set; the suite below is the standing proof, not a
  response to a suspected regression.

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**282 passed, 8 failed in 2289s** (290 scripts — slower than r53's
515s because a lane-B worker ran its own check.js concurrently for
much of the window; CPU contention, not a code change).
The 8 break down as 6 pre-existing assertion failures + 2
contention timeouts, ZERO attributable to this run:
- The 6 assertion failures are the SAME families r53 recorded as
  pre-existing (measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof, and
  the establishment-r20 family — here as
  test-establishment-r20-fixes-20261020.js, "NEW: next day voices
  once more (gate resets daily): expected 2, got 1").
- The 2 timeouts (test-trust-observer-neutrality.js and
  test-capable-bot-20261014.js, both exit null at the 120s cap) were
  re-run SOLO after the suite: both PASS clean (trust 6/6, capable
  42/42). Contention artifacts, not regressions.
- The r20 failure was also re-run solo: it fails identically
  ("expected 2, got 1"), so it is repeatable on this base — but this
  run's change set is driver + analyzer + evidence with ZERO src/js,
  and no quick-list test imports this run's scripts (verified by
  grep), so it cannot be caused by this run. It is pre-existing on
  base 30aeceb36, same family as r53's sixth failure.
Verdict: zero regressions attributable to this run.
Worktree status after the suite: only this run's entries — no
suite-touched ontology or stray evidence writes.
