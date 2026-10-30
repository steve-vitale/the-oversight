# journey-scale r57 — Lane A, leg 3 SCALE (2026-10-30)

**Run id:** oversight-playtest-loop-20261030T0445Z (scheduled 04:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@70ae4c83c at worktree creation.
**Pre-register:** evidence/2026-10-30/journey-scale-r57-prereg.md (written before
any seed ran). **Zero src/js changed by this run** — measurement plus two
code-read audits (Irving, Boris) with their own mechanisms documented, one
driver + one analyzer (labels/EVIDIR only), and evidence.
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before).
**No lock contention:** no playtest-loop.lock existed at run start; this
run created it and deletes it at closeout.

## Infrastructure notes (loud, first)
- **Heartbeat:** 10-min background loop (log at
  `hidden_files/journey-scale-r57-heartbeat.log`) plus manual heartbeat at
  registration; registry heartbeat never went stale (verified at closeout).
- **Safe-commit index clobber struck on the prereg commit**, same class as
  r56 and the 2026-10-22/23 register lessons: after a correct private-index
  commit, the worktree's main index showed all 3 committed files
  staged-as-deleted plus untracked. Repaired via HEAD-blob cacheinfo
  (`git update-index --add --cacheinfo`), then verified: `git status`
  empty, `git diff HEAD` empty, worktree hash-object == HEAD blob for all
  3 files. The commit itself was correct.
- Driver-copy discipline (r56 lesson) kept: copies made with absolute
  worktree paths, verified 577 lines non-empty, `node --check` clean,
  zero remaining r56 labels in driver or analyzer.

## Verdicts (binding questions, answered)

### 1. QUAD-CURRENT-R57: FULL SCALAR PARITY — 4/4 seeds identical to r56
Same 4 seeds, control picker, policy scalecourt-nogate UNCHANGED, DAYCAP 180:
- 85001: day 144, died out (pop 2/2), GLOBAL (nationalDay 121,
  globalDay 122, firstCourt 102), lesser seat, arc 4, deaths 41,
  covenant trusts 38/37/30, maxWave 4, pilgrimages 4, fusion true,
  abilities iron_stomach/squirrel_friend/lucky_rock.
  r56: IDENTICAL on every scalar. Capture byte-identical.
- 85002: day 178, ALIVE 8/8, pantry 18,308, GLOBAL (nationalDay 104,
  globalDay 105, firstCourt 103), lesser seat, arc 4, deaths 43,
  covenant trusts 69/90/74, maxWave 4, pilgrimages 10, fusion true,
  abilities iron_stomach/echo_location/rage/dowsing/pyrokinesis/
  scream_cheese.
  r56: IDENTICAL on every scalar. Capture byte-identical.
  **This answers r56's open question on this quad: the r56 fate
  reproduces on current master; the r55 fate (day 181, pop 2/2,
  pantry 0) does not recur here.** No claim is made that the r55 fate
  is gone forever — only that this quad reproduces r56, not r55.
- 85003: day 88, died out (pop 5/5), regional, lesser seat, arc 4,
  deaths 39, covenant trusts NONE recorded, maxWave 4, pilgrimages 5,
  fusion NOT installed, abilities beast_calm/war_cry/scream_cheese.
  r56: IDENTICAL on every scalar. Capture differs in EXACTLY ONE
  line (see below) — scalars untouched.
- 85004: day 181, ALIVE 4/4, pantry 700, REGIONAL, lesser seat,
  arc 4, deaths 48, cov 12/28/30, maxWave 4, pilgrimages 14,
  fusion true, abilities green_whisper.
  r56: IDENTICAL on every scalar. Capture byte-identical.
- Descriptive quad count, unchanged from r56: global-final-rank 2/4
  (85001, 85002), full seat 0/4, lesser seat waiting on 4/4.
- **The one differing line, attributed (not guessed):** 85003's capture
  line 8450 reads "eyes on you" where r56 reads "eyes on your
  bedroll". That is the sim-bedroll-b narration-honesty landing in
  the r56→r57 range (havenGrowth.js: the raid player line says
  "bedroll" only when the game's own `_sleeping` flag is true, i.e.
  the player actually slept that night; awake nights get "eyes on
  you"). Narration only by its own comment — no spawn, draft,
  damage, crisis, or economy value moves — and every scalar on
  85003 is identical, which is exactly what a narration-only change
  should produce. No first-divergence audit beyond this line was
  needed: it is the only differing line in the whole quad.
- Base drift r56→r57 therefore moves NO scale fate on this quad;
  the only visible change is one honest narration line.

### 2. IRVING OPENING-ONLY AUDIT: MECHANISM TRACED, NO FIX (design input)
The r55/r56 finding stands on a byte-identical transcript, and the
mechanism is now traced end to end in conversation.js:
1. `convoOpening` picks the GOAL thread ("Family isn't just blood..."),
   not the want thread — the goal line wins the opener.
2. Irving holds a pending betrayal invitation, so `startConvo`
   speaks it as a second beat with tag `invitation` (invitation
   honesty: the player must hear the ask before answering it).
3. `convoMenuPage`'s owns-rule then filters the turn-0 menu to
   betrayal accept/decline/leave/silence ONLY — the want's commit
   choices are never built at turn 0. That filter is intentional:
   an invitation that owns the reply must be answered, not dodged
   by menu-shopping.
4. After accept-then-backout ("Maybe not today. The fire's got me"),
   the thread stays GOAL; later menus are goal-thread menus
   (more/react). The seeded ask_favor want (stage 2) stays live
   but unengaged.
5. Favor wants engage SOLELY through their own menus (conversation.js
   want-aware engagement comment): answers/reactions engage only
   question wants. Re-entry is via the alive:want / subject menu,
   which a thread-following player (and this run's control picker)
   never taps — the same picker class as deepening r69's
   pager-gating finding.
6. The want is NOT lost: it stays stage 2, alive for a later
   sitting. What is lost is one sitting's chance to commit it, and
   only when a goal opener + a pending invitation coincide.
   Repeat-displacement across consecutive sittings is unmeasured.
- **No fix this run, per the prereg rule:** any fix touches the
  invitation-owns-menu rule or adds a post-invitation want
  re-surface, both of which change every invitation sitting and
  need their own proof + regression design. The talk itself is
  coherent and complete (accept, honest backout, grief that plants
  a lead). The design call for a later run: after an invitation
  beat resolves, re-surface a live stage<3 favor want as a held
  beat, or accept one-sitting displacement as the price of
  invitation honesty. Documented here, not silently patched.

### 3. BORIS NOD-LOOP AUDIT: MECHANISM TRACED, NO FIX (design input)
The r55/r56 finding stands on a byte-identical transcript, and the
mechanism is now traced:
- The nonverbal menu is a fixed set (nod, smile, pointself, listen,
  speak_back if earned, leave). `nvRespond` maps nod/smile/pointself
  to a foreign agree/warm line + a nod-back narration, with NO
  state tracking of the mime invitation and NO resolution branch:
  nodding 5 times is 5 same-shaped exchanges differing only in the
  foreign phrase variant, until the exchange budget lands the
  winddown ("gestures slow") and a gesture goodbye ends it.
- The mime invitation itself ("come with me", to the trap line)
  has NO accept/decline move in the nonverbal menu at all — not
  even for a player who tries pointself (that only earns a warm
  line). So this is NOT purely a picker artifact (though the
  control picker repeating the first menu item makes it look
  worst): a real player also has no conversation move that
  resolves the invitation.
- It is texture, not a softlock: the winddown ends the talk
  gracefully, and the barrier itself is honest (Polish-only, no
  shared words). The design call for a later run: add a
  follow/decline gesture that resolves a mime invitation, or an
  honest line that following happens outside talk, not in it.
  Documented here, not silently patched.

### 4. PEOPLE CHECK (sense law — all 6 control transcripts read fully)
All 6 transcripts are BYTE-IDENTICAL to r56's, and were read in full
again here (not merely counted):
- 85001 d120 Adaeze — favor asked, committed, thanked. Real, small,
  complete.
- 85001 d90 Irving — goal-thread opening + betrayal invitation; the
  NPC accepts, then backs out, then grief talk that PLANTS a lead
  ("If I ever get a real lead I'm gone that same day"). Coherent
  and complete as a talk — but the seeded ask_favor want (stage 2,
  fromSeed, planted d89) NEVER surfaces (see Q2 audit above).
- 85002 d120 Jian — first-memory question answered, field teaching
  (Murumuru), a PLANTED place (cellar full of jars, "I'll show you
  on the map sometime"), goon consequence (friendliness thins).
  Real, complete.
- 85002 d90 Jian — pantry-run re-ask via the seed ("hate to ask
  twice"), committed with place and time (east treeline, before the
  dew dries, two packs). Real — the seed loop doing its job, and
  the contrast case proving a stage-2 seeded want DOES surface
  when the opener is the want thread (unlike Irving's goal opener).
- 85004 d120 Boris — Polish-only mime invitation, nods only, honest
  about its barrier — but the nod loop repeats five near-identical
  exchanges without progression: the invitation never resolves to
  going or not going inside the talk (see Q3 audit above).
- 85004 d90 Neomar — spare-something ask, committed, thanked ("I
  won't forget who fed me when it mattered"). Real, small.
Verdict: 5/6 fully real (Irving coherent-but-displaced), 1
honest-barrier with a nod loop (Boris). No fabricated shared history,
no static menus. No change from r56, because the words did not change.

### 5. TABLE-APPROACH (standing, report-only)
Control: 85001 lesser waiting + species agency (global reached,
lesser waits); 85002 lesser waiting; 85003 lesser waiting (arc 4,
died d88); 85004 lesser waiting. No seat-taker choice voiced
in-window; no full-seat offer; full seat unwon (w5 0 on all 4).
Same voicing class as r56.

### 6. BARRIER PIN (standing instrument, re-confirmed)
Control: sayOncePerFight calls 85001 d119, 85002 d25, 85003 none,
85004 d85/d136/d177 — ALL the sleep "Not in the middle of a fight."
family, identical days to r56. ZERO barrier lines on the control
arm; the pin stays in its r55 form (re-open condition met on r55's
nopellet arm with verdict guard-holds; no new barrier call logged
on this run's control arm).

## Village assessment (plain words)
- **85001 — the village that climbed, then collapsed, exactly as
  before.** Day 144, died out with two people left, but it had
  reached GLOBAL (day 122) first, lesser seat waiting at arc 4, 41
  deaths. Byte-identical to r56: the same story, word for word.
- **85002 — the village that held together, again.** Day 178,
  eight people alive, pantry 18,308, GLOBAL since day 105, lesser
  seat waiting, arc 4, 43 deaths, covenants at 69/90/74. This is
  r56's fate reproducing, not r55's collapse — the climb is the
  same, and this time the ending holds across a base change too.
- **85003 — the village that died before the scale leg began,
  exactly as before.** Day 88, died out with five left, regional,
  lesser seat, arc 4, 39 deaths, no covenants recorded. Same fate
  as r56; only one narration word changed (bedroll → you, on an
  awake night — honest, per the bedroll fix).
- **85004 — the village that fell back to regional, exactly as
  before.** Day 181, four alive, pantry 700, regional, lesser seat,
  arc 4, 48 deaths. Byte-identical to r56.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: yes, and steadier than r56 suggested — all four scale
  fates now reproduce scalar-for-scalar across a base change, and
  the climb's machinery fires on all four seeds (courts, covenants,
  pilgrimages 4–14, priced table voicing). The r56 late split is
  resolved on this quad in r56's favor; the only r56→r57 movement
  is one honest narration word.
- FUN: unchanged from r56, because the words are unchanged: the
  table voicing is still the leg's best writing, the seed loop
  still visibly remembers (Jian's pantry re-ask), Irving's
  displaced want and Boris's nod loop still thin two talks without
  breaking them — and both now have traced mechanisms and named
  design calls instead of just observations.
- WINNABLE: not shown, again. The lesser seat waits on 4/4 control
  seeds; the full seat stays unwon (w5 0). Nothing in this run
  opens it.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores).
- r56's PARTIAL PARITY verdict is REFINED, not re-scored: r57 shows
  FULL scalar parity (4/4 identical) under the same fixed rule (any
  scalar difference → first-divergence audit). The single capture
  line difference was audited to a named narration-only landing
  before any attribution, and no scalar moved.
- r56's OPENING-ONLY (extended to stage 2) STANDS on byte-identical
  transcripts, now with a traced mechanism (Q2) — not re-tested on
  new words, because there are none.
- r56's PHANTOM-RULE / NOT-RE-PICKED stands (not re-tested here).
- r52's barrier pin in its r55 form stands (no new barrier call on
  this run's control arm).
- r56's chooseAbility-unguarded note stands (not re-tested here;
  no duplicate ability id appears in any control seed's
  abilitiesHeld — all 4 lists are distinct).
- No metric was re-scored mid-run.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-30/journey-scale-r57/journey-scale-r57-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=4 files)" —
the same vacuous shape mismatch as r42–r56 (the journey trust JSONs do
not carry those fields at all; tableTele 0→0 is not LOUD). Verdict: NOT
a real deviation. NOT rolled.

## Tests
- `node --check` clean on the r57 driver (at creation) and the r57
  analyzer (at creation).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  (filled at closeout — see CHECK-QUICK section below.)
  Run sequentially (no sibling check.js running); output logged whole to
  goal hidden_files/journey-scale-r57-checkquick.log, not piped through
  tail (r69 lesson).
- Zero src/js changes, so no game-code regression surface exists in
  this run's change set; the suite below is the standing proof, not a
  response to a suspected regression.

## Landing (filled at closeout)
Master at worktree creation: 70ae4c83c. Master moved mid-run to
e5e5daf60 (sibling sim-stalkertick-a evidence, landed by a sibling
loop). Per body step 8 the branch was rebased onto the new master
before merging; proof re-run after rebase (node --check on driver +
analyzer, clean); measured files verified byte-identical through
the rebase (0 diff lines on this run's paths vs the pre-rebase
evidence commit). Measured results above stay pinned to the run
base 70ae4c83c — the rebase changes no measured file's content.
Merged locally, pending ship (no bump, no push, no live verify —
ship loop owns those).

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**284 passed, 6 failed in 489s** (290 scripts).
The 6 are EXACTLY r56's 6 pre-existing assertion-failure scripts, same
families, same signatures — measurement-proof-update ("Proof source
inputs are not current"), measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof, and the establishment-r20 family
(test-establishment-r20-fixes-20261020.js). No quick-list test imports
this run's scripts (verified by grep), and this run's change set is
driver + analyzer + evidence with ZERO src/js, so it cannot have caused
any of the 6.
Verdict: zero regressions attributable to this run.
Worktree status after the suite: only this run's entries — no
suite-touched ontology or stray evidence writes.

## TELEMETRY (filled at closeout)
5 LOUD lines, all vacuous shape mismatch (see Telemetry section above).
Baseline NOT rolled.
