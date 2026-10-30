# journey-scale r56 — Lane A, leg 3 SCALE (2026-10-30)

**Run id:** oversight-playtest-loop-20261030T0045Z (scheduled 00:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 done at run start.
**Base:** master@eef5d6fa6 at worktree creation.
**Pre-register:** evidence/2026-10-30/journey-scale-r56-prereg.md (written before
any seed ran). **Zero src/js changed by this run** — measurement, plus one
driver fix (the PELLET_DECLINE wrapper, see Q2) with its own proof, one
analyzer (labels/EVIDIR only), and evidence.
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before).
**No lock contention:** no playtest-loop.lock existed at run start; this
run created it and deletes it at closeout.

## Infrastructure notes (loud, first)
- **Heartbeat:** 10-min background loop (log at
  `hidden_files/journey-scale-r56-heartbeat.log`) plus manual heartbeats
  at major steps; registry heartbeat never went stale.
- **Driver-copy slip, caught before any seed ran.** The first copy of the
  r55 driver ran under a backgrounded `cd && nohup … &` chain, so the
  `sed` ran in /home/hatch instead of the worktree and produced EMPTY
  output files — and `node --check` passes vacuously on empty files.
  The stray empties were deleted and the copy redone with absolute
  paths; the real driver is 568 lines, `node --check` clean, zero
  remaining r55 labels. Lesson, stated plainly: a check on a file
  proves nothing if the file was never verified non-empty.
- **Determinism re-verified on the new base.** Control 85001's capture
  is BYTE-IDENTICAL to r55's, and 85001/85003/85004 captures are all
  byte-identical to r55. The 85002 divergence below is base-driven,
  not flaky.
- Driver stdout for each arm went to goal hidden_files logs, not the
  terminal (r50/r51 noise lesson, kept).
- Base drift r55→r56 in src/js is SMALL (7 files, +117/−12): solo-fight
  end lines (fieldFights/game.js narration), the repeat-lesson fix
  (conversation.js: startConvo resets skillLessonDone), the raid-name
  provenance gate (game.js/havenGrowth.js/ledger.js/betrayal.js), and
  a version stamp (build.js). No scale-threshold change is claimed by
  any of those commit messages.

## Verdicts (binding questions, answered)

### 1. QUAD-CURRENT-R56: PARTIAL PARITY — 3/4 seeds identical, 85002 splits late
Same 4 seeds, control picker, policy scalecourt-nogate UNCHANGED, DAYCAP 180:
- 85001: day 144, died out (pop 2/2), GLOBAL (nationalDay 121,
  globalDay 122, firstCourt 102), lesser seat, arc 4, deaths 41,
  covenant trusts 38/37/30, maxWave 4, pilgrimages 4, fusion true,
  abilities iron_stomach/squirrel_friend/lucky_rock.
  r55: IDENTICAL on every scalar. Capture byte-identical.
- 85002: day 178, ALIVE 8/8, pantry 18,308, GLOBAL (nationalDay 104,
  globalDay 105, firstCourt 103), lesser seat, arc 4, deaths 43,
  covenant trusts 69/90/74, maxWave 4, pilgrimages 10, fusion true,
  abilities iron_stomach/echo_location/rage/dowsing/pyrokinesis/
  scream_cheese.
  r55: day 181, ALIVE 2/2, pantry 0, GLOBAL (same nat/glob/court
  days), lesser, arc 4, deaths 51, cov 72/83/66, pilg 10, fusion
  true, abilities iron_stomach/beard_moss. CHANGED: day, pop,
  pantry, deaths, covenants, abilities. UNCHANGED: rank, nat/glob/
  court days, seat, arc, maxWave, pilgrimages, fusion.
- 85003: day 88, died out (pop 5/5), regional, lesser seat, arc 4,
  deaths 39, covenant trusts NONE recorded, maxWave 4, pilgrimages 5,
  fusion NOT installed (died before any pellet offer landed),
  abilities beast_calm/war_cry/scream_cheese.
  r55: IDENTICAL on every scalar. Capture byte-identical.
- 85004: day 181, ALIVE 4/4, pantry 700, REGIONAL, lesser seat,
  arc 4, deaths 48, cov 12/28/30, maxWave 4, pilgrimages 14,
  fusion true, abilities green_whisper.
  r55: IDENTICAL on every scalar. Capture byte-identical.
- Descriptive quad count, unchanged from r55 except 85002's fate:
  global-final-rank 2/4 (85001, 85002), full seat 0/4, lesser seat
  waiting on 4/4. No causal claim is made or changed.
- **First-divergence audit (per the prereg's fixed rule):** the 85002
  capture diff's first hunk is at line ~14493 of ~17752 (r55) —
  the worlds are IDENTICAL through the first ~82% of the narration.
  Day-stamped instruments agree: hungerwatch identical through
  d157 (pantry 86,345 / 97,598 / 87,436 on d155–157 in both), first
  state divergence d158 (pantry 80,677 r55 vs 80,161 r56, −516);
  wantwatch identical through d158, with r55 SKIPPING the d159 row
  r56 records (r55 jumps d158 → d160 twice). Downstream of the
  split, r56 alone logs a covenant defense call + answer
  (d161–162, village_spl_29_11331) and a HERALD titan strike on
  Thornfield (d164, trust −5), and its w4 count reaches 1 only at
  d172 (r55: d166). The two barrier/trustset file diffs are
  instrument noise, not divergence: barrier stacks carry the
  driver filename, and trustset stacks do too — every line differs
  on filename alone.
- **Attribution: UNRESOLVED, stated as such.** On code reading, no
  landing in the r55→r56 range should move a d158 pantry by 516:
  the solo/join end lines are narration-only pushes to rec.log,
  the raid-provenance gate only gates which fight reads the raid
  line (and clears a shadow id), the lesson reset only flips
  skillLessonDone at conversation start, and build.js is a version
  stamp. The lesson reset is the only state change in range, but
  no lesson line appears before the split (captures identical to
  line 14492, transcripts d90/d120 identical), so it is NOT blamed
  either. The open instrument question for a later run is a
  pinned-base bisection (range landings one at a time), not a guess
  here. The r55 discipline (audit before attribution) is followed:
  the split is located (day ~158, pantry −516, day-sample shift
  at d159) and left unattributed.

### 2. DUPLICATE-ABILITY AUDIT: CONTROL CLEAN, NOPELLET MECHANISM FOUND AND FIXED
- (a) Control quad: ZERO repeated ability ids in any seed's
  abilitiesHeld (85001: 3 distinct, 85002: 6 distinct, 85003: 3
  distinct, 85004: 1). No control-quad blank.
- (b) Mechanism (code read + capture counts): every engine offer
  generator filters owned abilities (levelUpOffers, poisonAidChoices,
  safetynets gift pool), BUT the scholar take path
  (game.js chooseAbility, ~line 24704) pushes with NO owned check —
  the only guard of that shape in the tree is app.js:19925. A
  duplicate entry therefore needs an offer sheet that contains an
  already-held id. The r55 nopellet arm manufactured exactly that:
  its wrapper restored the WHOLE pre-daily sheet after daily even
  when the policy had consumed it (chooseAbility clears the sheet),
  so the same sheet returned the next day and the policy took its
  first choice again. First Survivor gain in nopellet 85004 carries
  the arrival-sheet line ("We've been watching you figure things
  out all week!"), and that capture shows 20 Survivor gains against
  a 6-slot end list — the sheet kept coming back. Control captures
  also show repeated gain LINES (e.g. Green Thumb x2, Lucky Rock x2
  on control 85002), but those are takes later REPLACED away (the
  scholar cycles abilities under the 6-slot law); only the
  nopellet end-state lists hold simultaneous duplicates
  (green_thumb x2 on 85002, survivor x3 on 85004).
- **Fix (driver only, this run):** the r56 driver's PELLET_DECLINE
  wrapper now restores by case — untouched sheet → full restore
  (pellet pending again); consumed sheet → ONLY the fusion entry
  stays pending; a fresh pump-opened sheet after a take is left
  alone (the engine moved on). A consumed sheet can never return
  its taken choices again.
- **Proof (before/after, separate EVIDIR
  journey-scale-r56-nopellet-fix, never the quad dir):** seed 85004
  with PELLET_DECLINE=1 under the fixed driver: fusionInstalled
  false (arm invariant holds), abilities
  iron_stomach/purify/bird_whisperer/battlefield_grace/war_cry/
  the_touch — 6 DISTINCT, zero duplicates, Survivor gained exactly
  once (the legitimate first-ability take). r55 nopellet 85004 was
  survivor x3 with fusion false. The fixed arm's world diverges
  from the buggy arm's world (as it must — sheets are no longer
  resurrected), so no pellet-effect continuity is claimed from it.
- **Fix-inertness proof (control arm unaffected):** seed 85001 rerun
  with the fixed driver and PELLET_DECLINE unset in a scratch
  EVIDIR: capture BYTE-IDENTICAL to the quad run, and the trust
  JSON identical except the embedded EVIDIR paths in convoFiles
  (the scratch dir name itself). The fix touches only the
  PELLET_DECLINE branch, which is inert when unset.

### 3. PEOPLE CHECK (sense law — all 6 control transcripts read fully)
All 6 transcripts are BYTE-IDENTICAL to r55's, and were read in full
again here (not merely counted):
- 85001 d120 Adaeze — favor asked, committed, thanked. Real, small,
  complete.
- 85001 d90 Irving — goal-thread opening + betrayal invitation; the
  NPC accepts, then backs out ("Maybe not today. The fire's got
  me"), then grief talk that PLANTS a lead ("If I ever get a real
  lead I'm gone that same day"). Coherent and complete as a talk —
  but the seeded ask_favor want (stage 2, fromSeed, planted d89)
  NEVER surfaces: turn-0 choices are betrayal/leave/silence only,
  stage stays 2 at pre-close, no alive:want item. r55's
  OPENING-ONLY finding stands, unchanged, on the same transcript.
- 85002 d120 Jian — first-memory question answered, field teaching
  (Murumuru), a PLANTED place (cellar full of jars, "I'll show you
  on the map sometime"), goon consequence (friendliness thins).
  Real, complete.
- 85002 d90 Jian — pantry-run re-ask via the seed ("hate to ask
  twice"), committed with place and time (east treeline, before the
  dew dries, two packs). Real — the seed loop doing its job.
- 85004 d120 Boris — Polish-only mime invitation, nods only, honest
  about its barrier — but the nod loop repeats five near-identical
  exchanges without progression: the invitation never resolves to
  going or not going inside the talk. Texture note, unchanged.
- 85004 d90 Neomar — spare-something ask, committed, thanked ("I
  won't forget who fed me when it mattered"). Real, small.
Verdict: 5/6 fully real (Irving coherent-but-displaced), 1
honest-barrier with a nod loop (Boris). No fabricated shared history,
no static menus. No change from r55, because the words did not change.

### 4. TABLE-APPROACH (standing, report-only)
Control: 85001 lesser waiting + species agency (global reached,
lesser waits); 85002 lesser waiting + the pellet price voiced back
hard ("NO HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE FIRE
SHOULD BE", this time pricing wave-3 monsters faced, mantle may
pass to hungrier hands) — the same voicing class as r55's 85002;
85003 lesser waiting (arc 4, died d88); 85004 lesser waiting. No
seat-taker choice voiced in-window; no full-seat offer; full seat
unwon (w5 0), as ever. Fixed-arm 85004 (proof run, not a leg
verdict): regional, lesser, arc 4, fusion false — declining the
pellet under the fixed wrapper does not open the full seat either.

### 5. BARRIER PIN (standing instrument, re-confirmed)
Control: sayOncePerFight calls 85001 d119, 85002 d25, 85003 none,
85004 d85/d136/d177 — ALL the sleep "Not in the middle of a fight."
family. ZERO barrier lines on the control arm; the pin stays in its
r55 form (re-open condition met on r55's nopellet arm with verdict
guard-holds; no new barrier call logged on this run's control arm).

## Village assessment (plain words)
- **85001 — the village that climbed, then collapsed, exactly as
  before.** Day 144, died out with two people left, but it had
  reached GLOBAL (day 122) first, lesser seat waiting at arc 4, 41
  deaths. Byte-identical to r55: the same story, word for word.
- **85002 — the village that held together this time.** Day 178,
  eight people alive, pantry 18,308, GLOBAL since day 105, lesser
  seat waiting, arc 4, 43 deaths, covenants at 69/90/74. On the old
  base it ended day 181 with two people alive and an empty pantry.
  Same climb, different ending: it answered a covenant defense call
  (days 161–162) and took a HERALD titan strike on a neighbor
  (day 164), and came
  out fatter and more populous. Why the worlds split on day 158 is
  the open question above — the climb itself is unchanged.
- **85003 — the village that died before the scale leg began,
  exactly as before.** Day 88, died out with five left, regional,
  lesser seat, arc 4, 39 deaths, no covenants recorded. Byte-
  identical to r55.
- **85004 — the village that fell back to regional, exactly as
  before.** Day 181, four alive, pantry 700, regional, lesser seat,
  arc 4, 48 deaths. Byte-identical to r55.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: yes, and steadier than r55 suggested — three of four
  scale fates now reproduce byte-for-byte across a base change, and
  the climb's machinery fires on all four seeds (courts, covenants,
  pilgrimages 4–14, priced table voicing). The one unstable seed
  splits late (day 158), not in the first days as r55's did — the
  instability moved later, it did not vanish.
- FUN: unchanged from r55, because the words are unchanged: the
  table voicing is still the leg's best writing, the seed loop
  still visibly remembers (Jian's pantry re-ask), Irving's
  displaced want and Boris's nod loop still thin two talks without
  breaking them.
- WINNABLE: not shown, again. The lesser seat waits on 4/4 control
  seeds; the full seat stays unwon (w5 0). Declining the pellet
  under the fixed wrapper does not open the full seat either.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores).
- r55's QUAD-diverged verdict is REFINED, not re-scored: r56 shows
  PARTIAL parity (3/4 identical, 1 late split) under the same fixed
  rule (any scalar difference → first-divergence audit). The audit
  ran before any attribution, and no attribution is made.
- r55's OPENING-ONLY (extended to stage 2) STANDS on byte-identical
  transcripts — not re-tested on new words, because there are none.
- r55's PHANTOM-RULE / NOT-RE-PICKED stands (not re-tested here).
- r52's barrier pin in its r55 form stands (no new barrier call on
  this run's control arm).
- NEW mechanism finding, not a metric change: the r55 nopellet
  duplicates are a driver artifact (whole-sheet restore), fixed in
  the r56 driver with a before/after proof. The engine's
  chooseAbility push remains unguarded — reachable only via a
  resurrected sheet or a replace edge — and is documented here
  rather than silently patched in game code, because the correct
  take-path behavior on a genuine duplicate offer (refuse? replace?
  level up?) is a design call, not a measurement fix.
- No metric was re-scored mid-run.

## Telemetry deviation check (step 14 — NOT rolled, sixteenth confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-30/journey-scale-r56/journey-scale-r56-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=4 files)" —
the same vacuous shape mismatch as r42–r55 (the journey trust JSONs do
not carry those fields at all). Verdict: NOT a real deviation. NOT rolled.

## Tests
- `node --check` clean on the r56 driver (at creation, and after the
  wrapper fix) and the r56 analyzer (at creation, and after the
  heading fix).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  (filled at closeout — see CHECK-QUICK section below.)
- Zero src/js changes, so no game-code regression surface exists in
  this run's change set; the suite below is the standing proof, not a
  response to a suspected regression.

## Landing (filled at closeout)
Master moved mid-run (eef5d6fa6 → c795e7e25: sim-evadeshape-a
evidence, landed by a sibling loop). Per body step 8 the branch was
rebased onto the new master before merging; proof re-run after rebase
(node --check on driver + analyzer, clean). Measured results above stay
pinned to the run base eef5d6fa6 — the rebase changes no measured
file's content.

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**284 passed, 6 failed in 472s** (290 scripts).
The 6 are EXACTLY r55's 6 pre-existing assertion-failure scripts, same
families, same signatures — measurement-proof-update ("Proof source
inputs are not current"), measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof, and the establishment-r20 family
(test-establishment-r20-fixes-20261020.js, "NEW: next day voices once
more (gate resets daily): expected 2, got 1", identical to r55).
r55's 2 contention timeouts did NOT recur (test-trust-observer-
neutrality and test-capable-bot-20261014 both pass this run;
capable-bot 40s, the suite's slowest). No quick-list test imports this
run's scripts (verified by grep), and this run's change set is driver
fix + analyzer + evidence with ZERO src/js, so it cannot have caused
any of the 6.
Verdict: zero regressions attributable to this run.
Worktree status after the suite: only this run's entries — no
suite-touched ontology or stray evidence writes.
