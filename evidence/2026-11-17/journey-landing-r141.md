# Journey landing r141 — run note (2026-11-17)

Lane A leg 0 LANDING. Run `journey-landing-20261117T0640Z`, scheduled
Mon 2026-11-16 23:45 CST. Base master `3a2808723` (journey-scale r228).
Seeds 1182–1191, 28d, r141 driver (r140 driver verbatim except header/
seeds/OUTDIR). Corpus `landing-r141-after` under the goal hidden_files
evidence dir. Prereg: `journey-landing-r141-prereg.md`.

## Q1 — regression watch on the post-r140 master: TWO BAR MISSES

The run's question: does the post-r140 master (crisis r228 C3c stale-favor
resume opener + F2 narration-quote guard; establishment r230 dlg:help for
stage-0 ask_favor wants; social-life r231 C3d recap names the live want;
companion guard unconditional) hold the landing bars on a fresh band, and
does the r140 heed fix hold? Metric revisions adopted from r140's review:
scholar-death bar ≤1 → ≤2; M-PR1 binds in rate form (never-offered ≤15%
of sittings), per-seed max reported as watch.

### Binding bars

| Bar | r141 | Verdict |
|---|---|---|
| M1 10/10 alive d28 | 10/10 | PASS |
| M2 System contact 10/10 by d9 | 10/10 (8×d8, 2×d9) | PASS |
| M3 fight-log 0 unknown/mixed | 0 unknown (7 fights) | PASS |
| zero-DMG invariant | PASS (1 zero-DMG, S-struck-0-dmg, classified) | PASS |
| practice movedCells ≥50, seedsWithMove 10/10 | 84 cells, 10/10, skill0→pos 62 | PASS |
| pocket watch 0 pocket fights / 0 stuck turns | 0 / 0 | PASS |
| D1 garbled labels | 0 | PASS |
| HEED-V verbatim filler loop | 0 | PASS |
| M-PR1 never-offered ≤15% | **21.9% (7/32)** | **MISS** |
| personal/small bridge 0 repeats | 0 / 0 (personal 20, small 9) | PASS |
| presshop farUnreached | 1 (reported only) | — |
| R66 starvation deaths 0, starvingWarnings 0 | 0 / 0 | PASS |
| amnesia 0, Miriam "That's settled" 0, fellBack 0 | 0 / 0 / 0 | PASS |
| nodloop LOOP=0 | 0 (107 sittings) | PASS |
| verbatimRepeats 0 | **2** (1182-d6, goal-pool, both real) | **MISS** |
| **scholar deaths ≤2** | **1** (Ethan, 1191 d24, the wild; mantle Luke d25, latency 1) | PASS |
| **silentTurns 0** | 0 | PASS |
| fleeStuckTurns / closeStuckTurns | 0 / 0 | — |

### FINDING F1 — M-PR1 misses at 21.9% (7/32 never-offered)

Commit-offer analyzer: sittings=32 offered=23 picked=23 promised=16
statedAfterPick=7 neverOffered=7 settled=2. Per seed: 1182: 0, 1183: **3**
(d11, d4, d8), 1184: 1 (d5), 1185: 0, 1186: 1 (d10), 1187: 0, 1188: 1
(d11), 1189: 1 (d14), 1190: 0, 1191: 0. Max per-seed 3 (was 2 on r140).

- Six of the seven are resolution=`unestablished`: the want never got
  established in the sitting, so no commit could be offered. Read
  1184-d5 (Rahul, trust 26, day 5): the NPC opens with gossip, the
  player pages menus twice and leaves after 4 turns; the want thread
  ("Is there something you need? Really.") sat on the turn-3 menu
  untaken. The r230 dlg:help WAS offered there (turn 2) — the fix
  fires — but the probe driver picked dlg:subject instead. This is a
  probe-shape artifact as much as a game fact: in a TOPIC PROBE
  sitting the driver prioritizes topic asks over the want thread.
- The seventh (1189-d14, Ethan, trust 82, day 14) is different and
  real: the want DID establish — the player picked dlg:help, Ethan
  stated a concrete same-day need ("I know the meadow edge, west of
  the creek — come with me and we'll fill packs before dark"), the
  want reached stage 2, the player listened and comforted, and the
  sitting ended `stated` with NO commit path ever offered. The
  commit menu ("I'll come back to help.") appears in promised
  sittings; here the menus offered only react/comfort/askwhy/subject/
  leave. A stated same-day need gets no accept path. Whether the
  commit mechanism is dawn-meet-shaped by design or this is a gap is
  a design question — documented, not fixed here.
- Per §14 the miss stands as scored; the adjudication above goes to
  metric review (proposal: score M-PR1 only over sittings where the
  want established, or count a dlg:help offer as the stage-0 offer).

### FINDING F2 — verbatim repeat in the goal bridge pool (1182-d6)

`!! VERBATIM REPEATS (2)` on the Anh sitting (day 6, 20 turns, trust
62): "Anyway — that's my cross to carry. What's on your mind?" at
turns 1 and 11, and "Right. Sorry, I go on about it. What did you
want?" at turns 7 and 15. The player picked [dlg:subject] five times;
the goal pool has few closing lines, so after one cycle it repeats.
The sitting itself is NOT a loop — the conversation moves (personal
story → goal → teach → map-sketching → winddown) — but the ear hears
the same two hinges twice in 20 turns. Same family as the Olivia
repeat: the per-sitting bridge-memory gap. Fix owed in the bridge-
memory build arm (carried, NOT this run — shared pick-cycle
machinery). 6 exempted lines panel-wide, all spot-checked genuine
re-poses (resume x1, opener).

### Heed fix holds (r140 F1)

All 3 warn_you sittings resolve `heeded` at stage 3 (1185-d11 Andres,
1188-d12, 1191-d10), 0 silent turns anywhere. The Andres sitting is
the textbook shape: heeds 1–3 are the ack lines, heed 4 deepens
("...I keep seeing it. Whatever it was, out past the treeline. I
don't want to be the one telling the fire you didn't come back."),
then Andres asks for help hauling and accepts the decline honestly
("Another time, then." A small thing, pocketed.).

### r230 dlg:help fires; C3c/C3d do not fire live

- dlg:help menus appear in 6 transcripts (baseline 0 on r140): the
  r230 fix is live. In 1189-d14 it carries the sitting (help → stated
  need); in 1184-d5 it is offered and passed over.
- No [recap] pick and no stale-favor resume on the panel, so C3c
  (stale-favor resume opener) and C3d (recap names the live want)
  have no live firing to judge. Their proof tests (9/9, 24/24, 35/35)
  stand; the panel neither confirms nor contradicts them.

### Watch items (reported, not binding)

- **Hungry at horizon 5/10** — down one from r139/r140 (6/10).
  Hungry seeds at 824, 1509, 1612, 775, 539 kcal/person. The collapse
  pattern persists; lever work candidate (carried).
- **Favors kept 7 vs broken 7 — TIED.** The break-ahead pattern
  (r139: 4 vs 1, r140: 5 vs 4) does NOT hold a third panel. No trend
  call; the watch closes.
- **Fights 7** (r139: 21, r138: 12, r140: 17) — a new low. Flee/dodge/
  close: fleeStuckTurns 0, dodgeStuckTurns 0, closeStuckTurns 0; 1
  failed move (occupied). Matched-band A/B (profile-gate bypass
  on/off) still owed before any claim about the bypass or the band.
- **Contests**: 18 fired, 18 ended, 0 open, 0 orphan ends,
  deathsWithContext 0, deathsMissing 0 — GO.
- **Flesh**: CHANNEL OPENS — deposits 9/10, tests 10/10, exit (into
  pantry) 7/10.
- **Practice**: 84 moved cells, 10/10 seeds, skill0→pos 62.
- **Hunt**: 247 kills, 23 reps, max 5 — H0-ESTABLISHED holds (first
  rung 8 reps still out of reach in 28d).
- **statedAfterPick 7** (was 4 on r140) — all seven are the away-guard
  refusal ("out on the road, away from Haven — no dawn meet while
  I'm out"). Honest refusals, not a defect; count watched.
- **Presshop**: attempts 119, pressFailTotal 1 (honest empty-patch),
  farUnreached 1, hopReached 29.
- **Lead-in nit recurs**: "Good question." ×8 across 7 sittings;
  "Huh. Let me think about that." twice as a hinge in 1182-d6.
  Carried to the bridge-pool per-sitting memory arm.
- **Winddown/closing duplication persists** in the transcript-
  capture artifact form (closeLine surfaces in TRANSCRIPT-DIFF
  rather than as the spoken closing; 1189-d14 shows two diff lines).
  Known artifact from r226/r227, not a UI bug.

## Village assessment (plain words)

Ten villages, all alive at day 28. The System reached every one by
day 8 or 9. Eight villagers died across the ten villages — ambushes
took 3, monsters 3, the Gavel 1, and the wild took the scholar Ethan
on day 24 (seed 1191); Luke took up the mantle the next day and the
village carried on. Nobody starved. Two villages lost nobody at all.
The pantry is the standing worry: 5 of 10 villages end the fortnight
under 2000 calories per person in store, two of them under 850 — the
same collapse shape as the last four panels, easing one notch, and
nobody in the villages is fixing it. Favors mostly stay open (32 of
46), and this panel exactly as many break as hold. The monster-meat
channel is open everywhere it needs to be: 9 of 10 villages got flesh
in, all 10 tested it, 7 got it into the pantry. People are learning
to fight (84 practice cells moved, 62 skills lifted off zero) and 247
monsters died to villager hands — but the kills don't yet turn into
wave-4 readiness, and only 7 real fights happened all fortnight. The
villages survive the fortnight. They do not yet look like they will
win the year.

## People check (Q2) — 5 full transcripts read

All five read as people, not menus. No fabricated shared history in
any of them. No drift-note tail quoted as memory anywhere in the
corpus.

1. **Andres, 1185-d11 (warn_you)** — PASS. Heeds 1–3 are the ack
   lines; heed 4 deepens with the fear said out loud; want stage 3,
   resolution `heeded`; then a real ask (help hauling) and an honest
   decline with a lingering cost. 0 silent turns.
2. **Ethan, 1189-d14 (ask_favor, stage-0 help)** — PASS as people,
   FINDING as mechanism (F1 above). A grieving man at trust 82:
   "We gave them a good burial. Doesn't feel like enough, does it?"
   The player offers help, Ethan names a real need (the meadow edge,
   west of the creek), the player listens and comforts — and the
   favor stays stated because no commit path ever appears. The
   conversation is human; the missing accept is the gap.
3. **Grace, 1184-d6 (curious, resume-take)** — PASS. Grace asks what
   the player's plan is; the player deflects twice and the question
   dies where it stood ("Fine." Their face closes like a door.). The
   re-pose is a genuine return ("We never finished — your plan
   here."), and the second deflect ends it for good. The sitting
   wanders through real things: getting stronger ("Not tough-guy
   stronger. Just... carry-more, walk-further stronger."), one person
   injured and tension about who's in charge, and who she is ("The
   others think I've got it together. Cute. Very cute.").
4. **Rahul, 1184-d5 (ask_favor, probe)** — PASS as people. A low-
   trust (26) villager opens with gossip ("People are saying things.
   About you. Is any of it true?"), the player says yes, Rahul nods
   ("Okay."), and the sitting wanders off through menus and ends.
   The want never establishes — the player never asked what he
   needed. Reads as a missed connection, not a broken scene.
5. **Anh, 1182-d6 (curious, 20-turn probe)** — PASS as people,
   FINDING as repetition (F2 above). A long, moving sitting: the
   Columbus traffic line, the map sketched in dirt ("Don't go there
   after rain."), teaching Diplomatic Incident, a real winddown
   ("Whatever did this — it had a reason. Reasons can be found.").
   The two repeated goal-pool hinges are the only false note.

## Q3 — telemetry

`node scripts/telemetry-check.js` vs
`telemetry-baselines/landing-split.json`:
**quiet** (10 files, 5 metrics, no large deviations). Current vs
baseline: systemDay 82 (81), villagerDeaths 8 (9), monsterKills 247
(217, +14%), folTelemetry fires 11 (15), starvAutopsies 0 (0).
Baseline NOT rolled.

## Q4 — gate

`node scripts/check.js --quick` (worktree,
`--cacheDirectory=/tmp/jest-cache-playtest`): **332 passed, 8 failed
in 1095s** (r140: 330/10). Adjudication: 0 attributable to this run
(this run changed no src/js — driver, prereg, evidence only).

Standing 6, identical files/messages to r140:
- `test-measurement-proof-update.js` +
  `test-measurement-workflow.js` — measurement-proof staleness pair.
- `test-phone-frame-proof.js` — phone-frame receipt staleness (3
  fails, same messages as r140).
- `test-ladder-bundle-20261108.js` — same control fail (200 monster
  turns WITHOUT delivery fire the ambient raid — fires 0).
- `test-living-garden-deed-attainment.js` +
  `test-one-person-army-deed-attainment.js` — both hit the 120s
  check.js cap (load timeouts under 4-parallel jest).

Load/flap 2, adjudicated NOT attributable — both pass standalone on
this tree, run sequentially after the gate:
- `test-trust-observer-neutrality.js` (120s timeout → 6/6
  standalone).
- `test-measurement-cache-flags.js` (1/4 in gate) — fails
  standalone too, BUT with `EPERM: operation not permitted, write`
  from the balance-panel worker writing its temp dir: the host write
  flap, active in this window (5 attempts, all EPERM; plain probe
  writes to /tmp and the worktree succeed in the same minutes — the
  flap is intermittent within the window). Not a code failure and not
  this run's change. The flap is ongoing; see infra notes.

Standalone re-verified after the gate: living-garden 8/8,
one-person-army 7/7, trust-observer 6/6.

## Metric review (proposals for r142, nothing binds this run)

1. **M-PR1 — revise the denominator.** r141 misses at 21.9% (7/32)
   under the rate form adopted this run, but 6 of the 7 are
   `unestablished` probe sittings where the want never got a chance
   to be offered — the driver paged past the want thread. The
   seventh (1189-d14) is the real case: an established, stated want
   with no commit path. Propose: score M-PR1 only over sittings
   where the want reached stage ≥1 (established), and count a
   dlg:help offer as the stage-0 offer (that is the r230 fix's whole
   point). Under that scoring r141 reads 1 never-offered of 26
   established sittings (3.8%).
2. **Verbatim bar — the miss is real but the fix is owned elsewhere.**
   The 2 repeats are goal-pool exhaustion in a 20-turn sitting, the
   same family as the Olivia repeat. The per-sitting bridge-memory
   arm owns this fix; the bar stays 0 until that arm lands and its
   panel re-scores it.
3. **Fights count keeps moving** (21, 12, 17, 7). No bar, but the
   matched-band A/B (profile-gate bypass on/off) is now the only way
   to tell band variance from a bypass effect. Still owed.
4. **Hungry-at-horizon 5/10** — eases one notch from 6/10 but the
   collapse pattern is five panels deep. Lever work candidate,
   still carried.
5. **Favors watch CLOSES.** Kept 7 vs broken 7 ties the panel; the
   break-ahead pattern does not hold a third time. No trend call.
6. **statedAfterPick 7, all away-guard.** If r142 also states ≥6,
   open the question of whether the away-guard is over-firing (the
   player commits to villagers who are out on the road).
7. **Telemetry baseline — do NOT roll.** Quiet panel; the baseline
   stays r136-pinned.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat + goal-pool repeat (F2) — fix owed in the
  bridge-memory build arm with its own panel (per-sitting bridge
  memory or a bar revision); NOT this run — the fix touches shared
  pick-cycle machinery used by every pool.
- Fights 21 vs 12 vs 17 vs 7 (r139) — open question, matched-band
  A/B owed (same seeds, profile-gate bypass on/off), before any claim
  about the bypass or the band.
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10,
  r141 5/10.
- Stated same-day need with no commit path (F1, 1189-d14) — design
  question (dawn-meet-shaped commit vs same-day accept), documented
  for Steve/design call, not fixed here.
- NV sittings share one closing template (observation only).
- Analyzer vs transcript streak count (r134 carry).
- `test-convo-engine-trust.js` verbatim closeLine 6 pass/1 fail
  pre-existing on pristine (observation).
- Measurement-proof + phone-frame-proof staleness pair (standing;
  refresh owed via the update scripts — maintenance, not this run,
  unless this run's gate shows them moved).
- Hunt H0-ESTABLISHED: hunt assignments resolve, first rung (8 reps)
  still out of reach in 28d.
- Lead-in nit (r139/r140/r141): topic answers repeat their lead-in
  within a sitting ("Good question." ×8 this panel). Observation
  only; worth a look when the bridge pool gets its per-sitting
  memory.

## Landing

- Committed `519f571a7` (frozen prereg + r141 driver fork) on base
  `3a2808723`; safe-commit index clobber struck and was repaired via
  `git ls-tree -r HEAD` + `update-index --add --index-info`,
  verified status empty + diff HEAD empty.
- Master moved during the run (Loop B round-0430 landed
  `97ad635c7`); rebased clean onto it, driver re-checked
  (`node --check` green), merged ff-only into local master.
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 0→1 written with read-back; lock deleted at closeout.

## Infrastructure notes

- **VM restart ~07:17Z killed the full panel mid-seed-1189 (day 5).**
  Uptime showed 5 min at 07:22; the panel log ends mid-seed with no
  error. 7 seeds (1182–1188) had complete corpora; resumed the
  remaining 3 seeds (1189–1191) into the same OUTDIR with the same
  driver (deterministic per seed) — RESUME_EXIT:0, all 10 census
  files present. The pilot corpus (1182–1185) is separate and
  unaffected.
- **Registry lock contention:** Lane B's crisis-r229 registration
  held REGISTRY.lock for its whole slow `git reset --hard` (~10 min),
  so my 07:00 and 07:08 heartbeats queued on flock and my registry
  heartbeat went stale (06:50 → 07:18, 28 min). The nohup heartbeat
  loop died with its parent exec session when the VM restarted; the
  loop was restarted with `setsid` (pid 1841, 9-min interval) and the
  heartbeat landed 07:18. Lesson: heartbeat loops must be setsid-
  detached, not plain nohup children of an exec session.
- **Write flap active ~07:48–07:52Z:** the cache-flags proof fails
  with EPERM on temp-dir writes (5 attempts); plain probe writes
  succeed in the same minutes. Flap ongoing, not solved.
- Worktree registration took ~10 min on the slow `git reset --hard`
  under load average ~9 (same family as r227).
- Safe-commit index clobber struck on the prereg/driver commit
  (both files staged-as-deleted after commit); repaired via the
  documented pipe, verified clean.
