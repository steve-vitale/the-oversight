# journey-scale r52 — Lane A, leg 3 SCALE (2026-10-29)

**Run id:** oversight-playtest-loop-20261029T0745Z (scheduled 07:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 on completion.
**Base:** master@a6fa0710c at worktree creation.
**Pre-register:** evidence/2026-10-29/journey-scale-r52-prereg.md (written before
any seed ran). **Zero src/js changed by this run** — measurement only, plus
two driver-only scripts (r52 driver + r52 compare).
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before).

## Infrastructure notes (loud, first)
- **Master moved during registration** (be2c6d6fe → a6fa0710c, sibling
  merged build-pickdepart while this run registered). Verified by reflog
  + rev-parse: the worktree was created from the NEW tip, so the played
  base is current, not stale. No rebase needed at landing unless master
  moves again before merge.
- **First driver attempt exited 1 in ~1s with zero output** (empty stdout
  log). Immediate retry of the identical command ran clean (85001,
  ~52s). Cause not established — recorded as transient, same class as
  the container EPERM flap seen elsewhere this run (see below). No
  result rests on the failed attempt; both pilot seeds ran to completion
  after it.
- **sed -i hit the EPERM flap** while building the compare script (could
  not write its temp file; edits silently unlanded). Caught by grepping
  the file after the edit; repaired with the file-edit tool and
  re-verified with node --check. Lesson restated: never trust a sed -i
  on this box without re-reading the file.
- **Registry-lock contention:** the heartbeat script blocked twice on
  REGISTRY.lock (a lane-B succession worker held the lock from ~13:03
  with a queue of other workers' heartbeats behind it). Registry
  heartbeat was never more than ~4 minutes stale at any check; the
  queue cleared and heartbeats landed (13:02, 13:07, closeout). No
  reaper risk materialized, but a long lock-holder plus a 15-minute
  staleness threshold is a live-run hazard worth naming: a worker whose
  heartbeat queues behind a slow register could look dead while alive.
- The scale driver console-dumps the full trust JSON per seed (r50
  note's noise item, unchanged); pilot stdout went to the terminal for
  the retry runs, not a log file, because the first attempt's log file
  was empty — the per-seed evidence files carry the record.

## Verdicts (binding questions, answered)

### 1. SCALE-BASE-MOVE-R52: DIVERGED — and the divergence is armor-caused, not noise
`node scripts/journey-scale-r52-compare.js 85001,85003` → OVERALL DIVERGED
on both pilot seeds, every file class (capture, beats, moments, want,
gov, trust, trustevents, trustset, hungerwatch, wantwatch, betray,
transcripts, trust JSON).
- 85001: day 111 → 138, still died out (pop 0/0, pantry 0), rank
  regional both runs, but nationalDay 99 → none, globalDay 104 → none,
  firstCourt 98 → none, leaguePool 965 → 0, courtNational 1 → 0,
  pilgrimages 5 → 6, deaths 38 → 46, covenant trusts 24/19/14 →
  15/19/17. Seat lesser, arc 4, both runs.
- 85003: day 181, alive (pop 7/7, pantry 46,089, rank global) →
  day 161, died out (pop 2/2, pantry 0, rank regional), nationalDay
  142 → none, globalDay 143 → none, firstCourt 141 → none,
  leaguePool 32,822 → 0, poolEverMax 27,730 → 0, pilgrimages 8 → 11,
  deaths 39 → 45, maxWave 3 → 4, covenant trusts 64/70/56 →
  18/19/22 (different third link: village_spl_35_73428). Seat lesser,
  arc 4, both runs. Full seat unwon both runs (w5 0).
- **Attribution, pinned to a first-divergence line (not claimed from
  the census alone):** both captures are byte-identical for their
  first ~2,470 lines — village creation, early play, and the whole
  generation stream are unchanged, which rules out an RNG-stream shift
  (the armor seeding code itself states it draws no RNG: picks are
  deterministic in roster order). The first differing line on both
  seeds is a stash deposit: 85001 line 2477, r51 "Catalina left 1 wood
  log" vs r52 "Catalina left 1 bark strip"; 85003 line 2493, r51
  "Hassan left 1 branch" vs r52 "Hassan left 1 wood log". The
  following diffs are the same class (bark/vine/wood/branch
  substitutions at the stash). That is exactly the armor drift's
  footprint: bark inflow widened 15→30% + live pile draw (storage.js /
  villager-build.js). The stash is the fork; everything after it —
  different crafts, different fights, different deaths, different
  standing — is chaotic cascade from that fork, not a second mechanism.
- **What this does NOT prove:** direction. One seed lived longer but
  never reached national; the other died where it had survived to
  global. Armor firing is visible on both seeds (see below), but a
  two-seed cascade cannot say "armor helps" or "armor hurts" the scale
  band — the early stash fork reroutes the whole run before any
  wearer benefit could be isolated. A systematic armor-effect claim
  needs a multi-seed armor-on/off comparison; this run's claim is
  narrower and is the one the evidence supports: **the armor
  live-enable moves the scale band materially, via early stash-flow
  changes that cascade.** Parity is dead for this drift; the next
  scale question is measurement design (on/off panel), not another
  parity compare.
- **Armor visibly works on the scale band** (capture lines, not
  inference): bark-strip stash deposits 0 → 23 on 85001, 21 on 85003.
  Sewing fires: 85001 — Irving failed 4 times, Ava sewed one that
  holds and wears it (line 11879). 85003 — Theo sewed two that hold,
  Raj one, Joshua one (plus one Joshua failure). The sewing loop the
  fix-all arm built is alive in long play, not just in its band tests.
  Seeded wearers at creation are not separately tagged in the census,
  so no wearer-survival claim is made here.

### 2. BARRIER-LINE-PIN: PINNED — no attempt, not a broken guard
Driver-only instrument (wrap of `Game.sayOncePerFight`, prereg Q2),
both pilot seeds. Instrument validity established two ways before
trusting a zero: a standalone harness check proves the wrapper
installs and logs on the real Game object, and the live runs logged
real mid-fight calls (see below) — so a zero is a real zero, not a
dead instrument.
- 85001: ZERO sayOncePerFight calls in the entire run, zero barrier
  lines in capture, zero refusal lines of any sayOnce class.
- 85003: exactly TWO sayOncePerFight calls, both from `sleep`
  (game.js:20727 via timeSettlement), both with message 'Not in the
  middle of a fight.', both with inCombat=true and a live tbfight,
  on d117 and d120 — and both lines ARE in the capture (lines 10593,
  10841). The instrument catches real mid-fight calls; the barrier
  message simply never occurs.
- **Verdict per the prereg's fixed rules: no-attempt.** The guarded
  travel/building verbs (travelTo, clearBlockage, buildBridge,
  enterBuilding, exitBuilding) were never attempted mid-fight in
  either run — consistent with the policy's walk helpers guarding
  `!tbfight`. The r50 lines (4 on 85001, 2 on 85003) came from a call
  path that no longer lands, and the absence is now stable across
  four pilot runs (r51 pair by capture, r52 pair by call log). No
  guard is broken (the sleep guard fires correctly mid-fight), no
  narration is suppressed by dedup (a first-per-fight barrier call
  would say), and no fix is justified: a missing refusal narration
  with zero attempts and zero mechanical effect is not a bug. **This
  pin is closed; do not re-open it without a run that logs a barrier
  call.**

### 3. TABLE-APPROACH SENSE: ANSWERED — priced wait on both seeds, no seat taken
Quoted from THIS run's want files (not r51's):
- 85001: lesser seat, arc 4, waiting + announced, rank regional at
  close. Fireside: "The table's set. The ring of pale light — it's
  just sitting there. Waiting on them." Wantwatch tail prices the
  seat: w1 18 / w2 11 / w3 6 / w4 6 / w5 0, contests 14, crises 4,
  stage 3, foodDeeds true.
- 85003: lesser seat, arc 4, waiting + announced. "The table is being
  set for those whose deeds are done, and yours are not done. The
  ledger still wants: wave-3 monsters faced." Plus: "The table is
  being set — a lesser seat, priced for what you built. They are
  watching to see who comes to it."
Neither seed voices a seat-taker choice or a full-seat offer in-window;
neither sits. The wait reads as PRICED (a named deed gap on 85003, a
named seat + deed ledger on both), not a silent stall — but it is
still a wait, and the full seat stays unwon (w5 0 both). Note: the
lesser wait is announced at regional rank on both seeds this run
(r51's 85003 announced at global); arc-4 waiting does not need
global first. That is voicing, not a stall.

### 4. PEOPLE CHECK (sense law — full transcripts read, not counted)
- 85001 d90, Irving (baker, anxious, trust 90), want ask_favor stage 2:
  "About the sickness I'm fighting — still need hands. Are you in?"
  Player commits; "Thank you. Just — thank you. I'll be here,
  resting." A want, an engage, a resolution (a promise). Short, real.
- 85001 d120, Opanas (hunter, gentle, trust 31), want curious stage 1:
  "Teach me something. Anything you know that I don't." Player:
  "I'd rather show you while we're working." NPC: "Show me when we
  work together." — a planted future, an owed lesson. The follow-up
  goon earns a half-step back ("not leaving, just... further") — a
  human deflection beat, slightly opaque but legible as overstaying
  a welcome. Closing "Thank you for listening. Really listening.
  That's rare." is warm, generic, earned enough by the exchange.
- 85003 d90, Joshua (arborist, earnest, trust 90), want seek_taken
  stage 0: **the miss of this run.** Eight turns of leadership
  aphorisms ("Leadership isn't a title. It's the person who stays up
  wondering if everyone ate.") with the picker alternating more/react
  — a coherent topic, but no want surfaces, no decision, no plant,
  no owe. It ends "Good talk" with nothing changed. This is the
  conversation bar's filler-loop shape: lines that sound like a
  person without doing what a conversation does. Documented, not
  fixed here: no mechanism is proven (the want never engaged, and
  whether that is the want's stage-0 content or the picker never
  taking dlg:subject/dlg:invite is unpinned), and a blind fix would
  be inventing behavior. Follow-up for a dialogue run: pin whether
  seek_taken stage 0 offers any engageable want line at all.
- 85003 d120, Benoit (baker, prickly, trust 22), want ask_favor stage 1:
  "I'm sorry — I'm achy and wrung out, barely keeping food down. Will
  you help me?" Player commits; "Thank you. Whatever you can do —
  thank you." A want, an engage, a resolution. Real.
Verdict: 3 of 4 read as people with wants and consequences; Joshua d90
is a genuine filler loop and the run's documented blank.

### 5. FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: yes for the climb itself — both villages reached arc 4,
  formed covenants, ran courts and pilgrimages, and heard the table
  priced. The scale machinery is all reachable in ordinary play.
- FUN: mixed, and the mix is the finding. The fireside/table voicing
  and the covenant trust movement read as a story being told back to
  the player; the Joshua-style aphorism loop reads as a story being
  recited at them. The leg's texture problem is not missing systems
  — it is conversations that sometimes do nothing.
- WINNABLE: not shown, again. The lesser seat waits, priced, on both
  seeds; the full seat stays unwon (w5 0 both), and this run both
  villages died out before any seat was taken (85001 d138, 85003
  d161 — the second village's end is grimly legible: thirst, sickness,
  starvation, "a wound that wouldn't close"). The scale leg's win
  path remains the standing open question, now with a new confound:
  armor changed both trajectories wholesale, so the next win-path
  measurement must control for it rather than compare across it.

## Village assessment (plain words)
- **85001 — died out on day 138, pantry empty, rank regional.** A
  village that climbed to arc 4 and a priced lesser seat, then bled
  out person by person: fourteen player-character deaths, almost all
  "the wild," plus a contest death (Catalina, day 108) — the village
  did not fall in one disaster, it thinned until nobody was left.
  Covenant trusts at the end were 15/19/17: middling friendships
  with three other fires, none strong enough to carry it. One bark
  armor was sewn and worn late (Ava); four sewing attempts came
  apart in Irving's hands. The pantry ended at zero because there
  was nobody left to fill it, not because the food system failed.
- **85003 — died out on day 161 with two people left, pantry empty,
  rank regional.** The crueler arc: this seed had survived to global
  on r51, and on r52 it never got past regional — eleven pilgrimages
  (more wandering, less building), covenant trusts 18/19/22, and an
  endgame of thirst, sickness, starvation, and an unclosed wound.
  Four bark armors were sewn and worn (Theo twice, Raj, Joshua) —
  armor present, village still gone. What was missing was not gear
  or deeds (contests 15, crises 4, waves to 4); it was people alive
  and food in the pantry at the end. Both villages knew things,
  could do things, and still died thin — the scale leg's story this
  run is attrition outlasting achievement.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts); compare normalization extended r51→r52 (same rule).
- Barrier instrument is new telemetry, not a new metric: it records
  calls the engine already makes; it changes no engine input. Its
  verdict rules were fixed in the prereg before any seed ran, and the
  verdict follows them (no-attempt → pin closed).
- No metric was re-scored mid-run. The DIVERGED verdict stands as
  DIVERGED; the audit's narrower claim (armor-caused via the stash
  fork) is additional interpretation, not a re-score — the compare's
  strict verdict is not softened to parity anywhere above.
- The r51 "barrier line still gone" follow-up is answered, not
  carried: pin closed (see Q2).

## Telemetry deviation check (step 14 — NOT rolled, twelfth confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-29/journey-scale-r52/journey-scale-r52-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=2 files)" —
the same vacuous shape mismatch as r42–r51 (the journey trust JSONs do
not carry those fields at all). Verdict: NOT a real deviation. NOT rolled.

## Tests
- `node --check` clean on both new scripts (r52 driver + r52 compare).
- Compare re-run after closeout (see CHECK-QUICK section below for
  the suite result; the compare itself was run before the note was
  written and its verdict is quoted above).
- Zero src/js changes, so no game-code regression surface exists in
  this run's change set; the suite below is the standing proof, not a
  response to a suspected regression.

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**284 passed, 6 failed in 796s** (290 scripts — vs r51's 283/7 in 1405s).
The 6 in-suite failures are the SAME six r51 recorded as pre-existing
(measurement-proof-update, measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20-racks-full) —
and this run's change set is two driver scripts plus evidence, zero
src/js, and no quick-list test imports either new script, so nothing
here can have caused them. The delta vs r51 is one FEWER failure:
trust-observer-neutrality, r51's 7th failure by suite timeout, PASSED
standalone-slow this run (64s, slowest script, under the limit).
Verdict: zero regressions attributable to this run; the suite profile
is a strict subset of r51's.
Worktree status after the suite: only this run's entries — no
suite-touched ontology or stray evidence writes.
