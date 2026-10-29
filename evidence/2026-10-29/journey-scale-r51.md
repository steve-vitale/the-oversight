# journey-scale r51 — Lane A, leg 3 SCALE (2026-10-29)

**Run id:** oversight-playtest-loop-20261029T0145Z (scheduled 01:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 on completion.
**Base:** master@b1f7edbca at worktree creation.
**Pre-register:** evidence/2026-10-29/journey-scale-r51-prereg.md (written before
any seed ran). **Zero src/js changed by this run** — measurement only.
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before).

## Infrastructure notes (loud, first — a run almost lost its worktree)
- **First register attempt died with the service restart (07:27Z):** the
  lock was written, but registration stopped mid-checkout, leaving
  `~/workspace/worktrees/journey-scale/` holding ONLY a partial `evidence/`
  copy (13,902 files, all byte-identical to repo evidence, zero files
  unique to that copy — verified by file-list diff + spot diffs) and a
  `journey-scale` branch at master tip with NO registry entry.
  Recovery: the partial dir was MOVED (not deleted) to
  `~/workspace/worktrees/journey-scale-partial-20261029`, then
  re-registration succeeded (branch re-attached, registry entry
  `2026-10-29T07:31:44Z`, heartbeat verified landing at 07:34/07:35 and
  again manually at 07:44). Lesson for the next run: if a register call
  is interrupted, check for a path-but-no-registry half-state before
  retrying — `git worktree add` fails on the occupied path, and the
  branch it created masks the failure.
- Heartbeat loop (10-min cadence, pid 2810, log at
  `hidden_files/journey-scale-r51-heartbeat.log`) verified alive in sleep
  between beats; registry heartbeat never went stale (9 min at the one
  check that looked stale — the clock, not the loop, was the surprise).
- The scale driver console-dumps the full trust JSON per seed (r50 note's
  noise item, unchanged); stdout was redirected to goal hidden_files logs
  this run, not the terminal.
- Main HEAD moved during this run (b1f7edbca → ba02a987f, the Loop A
  lottery NO-GO landing — evidence-only, no game change, per its message).
  This branch was rebased onto ba02a987f before merging; the PLAYED base
  stays b1f7edbca as stated above, and the rebase adds no game code
  under the run. Proof tests (node --check on both scripts + compare
  re-run) were re-run after the rebase to the same verdict.

## Verdicts (binding questions, answered)

### 1. SCALE-BASE-MOVE-R51: DIVERGED by the strict rule — audit proves NARRATION-ONLY
`node scripts/journey-scale-r51-compare.js 85001,85003` → OVERALL DIVERGED,
but the full-diff audit (below) proves the divergence is one narration
line, not a mechanical move:
- Census scalars identical on BOTH seeds (all 19 compare scalars, plus
  covenant trusts identical: 85001 24/19/14, 85003 64/70/56).
- Trust JSONs identical after normalizing driver labels/paths/dates AND
  stack traces (the only stack diffs are the driver filename r50→r51 and
  `villager-objectives.js` line numbers 1349→1370 from the slice-2
  insertion — same call chains, same values).
- beats, moments, want, gov, trust, trustevents, hungerwatch, wantwatch,
  betray, and transcripts (d90 both seeds, d120 85003) IDENTICAL.
- Death logs identical (85001: 38 deaths, 85003: 39 deaths, same names,
  days, causes — including 85003's one genuine 'the arena' death).
- Capture diff, full audit (not the compare's capped samples): the ONLY
  differing lines are DELETIONS of one line, zero additions —
  85001: 4 deletions, 85003: 2 deletions, all the same line:
  `Not mid-fight — the barrier is the way out.`
  (r50 counts 4/2, r51 counts 0/0.)
- 85001: day 111, over=true, pop 0/0, pantry 0, rank regional,
  nationalDay 99, globalDay 104, seat lesser, arc 4, maxWave 4,
  pilgrimages 5, firstCourt 98, leaguePool 965.
- 85003: day 181, over=false, pop 7/7, pantry 46,089, rank global,
  nationalDay 142, globalDay 143, seat lesser, arc 4, maxWave 3,
  pilgrimages 8, firstCourt 141, leaguePool 32,822.
Per the prereg, the remaining r43 seeds (85002, 85004) are SKIPPED: the
pilot pair bounds the move (here: no mechanical move) and breadth would
burn a run that should go to mechanism pinning, not sweeping.
**What this proves:** the net drift since r50 (map slices 1a–4, geartier
abilities pass, invite seam, ghost narration) moves NOTHING mechanical
on the scale band. Not a day, not a trust point, not a fight, not a death.
The one lost line is the finding, and its mechanism is UNPINNED (see below)
— it is not re-scored as parity, and it is not blamed on a mechanism
without a call path. The compare's strict verdict stands as DIVERGED;
the audit's verdict is mechanical parity with one narration loss.

#### The lost line — what it is, and what is NOT established
- The line is `sayOncePerFight('Not mid-fight — the barrier is the way out.')`,
  the once-per-fight refusal from travelTo's inCombat guard and the
  clearBlockage / buildBridge / enterBuilding / exitBuilding guards
  (game.js). It fires in r50 at fight starts (5 of 6 cases immediately
  after "Turn-based now."; the 6th after the stranger's opening strike +
  dread projector, before the player's wait) — i.e. a mid-combat travel/
  building call the policy daily makes around a fight that starts during
  its walk.
- Ruled OUT by direct checks: the line text and all five guard sites are
  untouched by the r50→r51 drift (git diff for sayOncePerFight / the line
  is empty); the policy is unchanged (walk helpers all guard `!tbfight`);
  the ghost narration is log-only and cannot move a say line; the
  walk-home button is UI-only (node driver never clicks it).
- NOT established: which call site produced the r50 lines, or why the
  call no longer lands while `inCombat()` is true in r51. The plausible
  class is encounter-start ordering (the call now lands when the fight
  is not yet / no longer live, so the guard never fires and the call
  returns silently with no move — consistent with zero other diffs),
  but that is a HYPOTHESIS, not a finding: no stack trace was captured
  for a say line (the driver instruments trust setters, not say calls).
- Follow-up for the NEXT scale run (not a fix from this run — nothing
  mechanical is broken): if the line is still gone, add a say-call-site
  instrument (caller stack on the barrier refusal) for one pilot seed
  and pin the site before claiming a mechanism. Do NOT "fix" it by
  re-adding a say — a missing refusal narration with zero mechanical
  effect is not a bug that justifies inventing behavior.

### 2. MAP-MOVE: ANSWERED — no map move on this band
- Pilgrimages identical (5 / 8), leg-board / region behavior leaves no
  census trace: firstCourt, nationalDay, globalDay, leaguePool, covenant
  trusts all identical. The slice-1b region-seeded leg boards did not
  move any pilgrimage outcome on these pilots.
- Beyond-board returns (slice 2 unclamped return walk) and beyond
  generation (slice 3 city districts, slice 4 blockage/bridge parity)
  leave no differing line in either capture except the barrier line —
  and the barrier line is not a map line (no city, street, plaza, cache,
  blockage, or bridge line differs anywhere). The slice comments' claim
  (near tiles byte-identical) holds on this band; beyond tiles either
  were not reached differently or their differences never surfaced.
- The barrier-line loss is NOT attributed to map on current evidence:
  no map line differs, and the line's guards are untouched.

### 3. GEAR-MOVE: ANSWERED — no gear move measurable on this band
- Capture counts for geartier lines are 0 = 0 on both seeds, both runs
  (Mending Hands, Bird Strike miss, Live Broadcast extra strike, and the
  ghost rear-guard line). Caveat, stated plainly: those lines live in
  fight record logs, not necessarily in the say capture — so 0 in
  capture does NOT prove the abilities never fired. What IS proven:
  bearer-death names/days are identical (death logs byte-identical),
  and no fight outcome, day, or trust value moved. If the abilities
  fired on this band, they moved no outcome the scale census can see.
- 85001's bearer chain recurs exactly (13 deaths, day-111 die-out);
  85003's attrition recurs exactly (6 bearer deaths, survived).
  The r50 relabeling stands: 85001's deaths are wild/stranger, not arena.

### 4. TABLE-APPROACH SENSE: ANSWERED — priced wait on both seeds, no seat taken
Quoted from THIS run's want files (not r50's):
- 85001: lesser seat, arc 4, waiting + announced. "SYSTEM: Species
  agency: unlocked. You are not at the table yet. But the table has your
  name now." and fireside "The table's set. The ring of pale light —
  it's just sitting there. Waiting on them."
- 85003: lesser seat, arc 4, waiting from the wantwatch, announced.
  "The table is being set for those whose deeds are done, and yours are
  not done. The ledger still wants: wave-3 monsters faced." Plus: "The
  table is being set — a lesser seat, priced for what you built. They
  are watching to see who comes to it."
Neither seed voices a seat-taker choice or a full-seat offer in-window;
neither sits. The wait reads as PRICED (a named deed gap on 85003, a
named seat on both), not a silent stall — but it is still a wait, and
the full seat stays unwon (w5 0 both).

## Village assessment (plain words)
- **85001 — the village that reaches for the world and then empties,
  unchanged.** It climbs to national on day 99 and global on day 104,
  holds three covenant links (trusts 24/19/14 — thin, but alive), and
  reaches the lesser seat at arc 4, waiting with its name on the table.
  Then its leaders die one by one — thirteen of them, ending with
  Wanjiru on day 111 — until nobody is left to pick up the Codex. The
  map work, the gear pass, the invite seam: none of it changes this
  story by a single day or death. The pantry is empty at the end, but
  this is still not a starvation story: it is a leadership story.
- **85003 — the village that holds, unchanged.** Seven of seven alive
  at the day-181 cap, pantry 46,089 kcal, global since day 143, covenant
  trusts strong (64/70/56), league pool 32,822. Six bearer deaths hurt
  but do not break it. It waits at the lesser seat with a named price
  still unpaid (wave-3 monsters faced). This is the picture of a
  village that could sit — if it ever faced what the ledger wants.

## People check (full transcript read, not assumed)
- **85001 day 90 — Daniyar (paramedic, gentle, trust 25), want curious.**
  Read in full from r51's own file (compare says IDENTICAL to r50, but
  the read is this run's). He opens worried about noises past the
  treeline, the player says they heard them too, and he tells how he
  now sleeps in shifts — two hours, up, listen, two more — a body that
  learned before his head agreed, Almaty never having taught him that.
  Closes: "Thanks for listening. I mean that." The NPC wants
  reassurance and a witness; the options engage it; the ending resolves
  with gratitude. No fabricated shared history, no filler loop. GO,
  unchanged.

## Reachable / fun / winnable (leg 3)
- **REACHABLE: yes for scale content.** National, global, court, lesser
  seat, arc 4, and the priced wait all fire in-window on both seeds.
  The full seat is the unreachable part (w5 0 both) — the wall is
  unchanged in kind since r42, and unchanged by this window's landings.
- **FUN: yes, with the known ache.** The transcripts are people talking
  like people; the bearer-death chain is dramatic. The ache is 85001's
  tail: thirteen leaders dying one after another with no choice point
  visible in-window reads as attrition the player watches, not a fight
  the player shapes. That is the r48–r50 finding, unchanged.
- **WINNABLE: lesser yes, full no (on this band).** A lesser seat waits,
  priced and announced. The full seat needs wave-5 contact that never
  happens here, and neither the map slices nor the gear pass moves it.

## Blank filled or documented
No game fix from this run — mechanical parity means there is nothing
mechanical to fix from this evidence, and inventing one would violate
the measurement discipline. Documented instead: (a) the barrier-line
loss — narration-only, mechanism unpinned, with a concrete follow-up
instrument for the next scale run; (b) the map slices + gear pass show
zero movement on the scale band, which constrains where their effects
(if any) live: not in pilgrimages, courts, trusts, or bearer deaths on
these pilots; (c) the 85001 die-out tail stable across r48→r49→r50→r51.
No src/js, no [needs-eyes]: nothing here needs Steve's eyes on his
phone — nothing a player would feel changed, because nothing mechanical
changed (one refusal line, in six fights, is the only difference a
player could even notice, and only if they were reading closely).

## Metric review
- SCALE-BASE-MOVE-R51: the prereg's PARITY clause (b) (empty capture
  diff) failed literally — but the full-diff audit proves every capture
  diff is a deletion of one refusal line, and the prereg's DIVERGED
  branch required naming a first divergence + mechanism class. The
  first divergences are named (85001 capture line 7253, 85003 line
  5783, both the barrier line at a fight start); the mechanism class is
  HONESTLY UNPINNED, not forced into map/gear/invite. Refinement for
  the NEXT base-move prereg: state the capture rule as "identical
  except enumerated narration-only lines, each audited by full diff,"
  and add a say-call-site instrument to the driver so a lost refusal
  line can be pinned instead of bounded. No mid-run re-scoring: the
  audit ran after the compare, on the same files.
- MAP-MOVE / GEAR-MOVE / TABLE-APPROACH all ANSWERED with counts and
  quoted lines, per their verdict rules. GEAR-MOVE carries its caveat
  (capture counts do not prove non-firing) in the verdict itself.
- Telemetry-check step: eleventh confirmation of the same shape
  mismatch (see below). Process debt, not a finding.

## Telemetry deviation check (step 14 — NOT rolled, eleventh confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-29/journey-scale-r51/journey-scale-r51-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=2 files)" —
the same vacuous shape mismatch as r42–r50 (the journey trust JSONs do
not carry those fields at all). Verdict: NOT a real deviation. NOT rolled.

## Tests
- `node --check` clean on both new scripts (r51 driver + r51 compare).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  (filled at closeout — see CHECK-QUICK section below.)
- Compare cosmetic fixes, made before the verdict was committed: stale
  print labels corrected to r50|r51 at creation (same class of cosmetic
  fix r50 made to its own compare). Labels only; no comparison logic
  touched. One duplicate norm line (r51 replace listed twice) removed
  before any run.

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**283 passed, 7 failed in 1405s** (290 scripts — vs r50's 284/6 in 779s).
The 7 in-suite failures, each dispositioned by a standalone re-run on
this worktree (which carries ZERO src/js changes vs master, so nothing
here can have caused them):
- measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-racks-full:
  all 6 reproduce standalone (exit 1) — the same pre-existing profile
  r50 recorded (racks-full gate failure + the five suite-total failures).
  Phone-frame-proof's staleness now also names arrivalText.json — the
  map slice's new street/plaza/cache arrival text landed without a
  refreshed phone receipt. That staleness belongs to the map landing,
  not to this measurement run.
- trust-observer-neutrality: in-suite TIMEOUT (120.1s, killed by
  check.js) is the 7th failure and the ONLY delta vs r50's profile.
  Standalone it PASSES: 6 passed, 0 failed in 102s wall (20s user CPU —
  wait-bound, slow under the suite's 2-parallel load). Verdict: suite
  timeout artifact, not a real failure and not a regression.
Zero regressions attributable to this run: its change set is two driver
scripts plus evidence, zero src/js, and no quick-list test imports
either new script. Worktree status after the suite + standalones: only
this run's entries — no suite-touched ONTOLOGY or stray evidence writes.
