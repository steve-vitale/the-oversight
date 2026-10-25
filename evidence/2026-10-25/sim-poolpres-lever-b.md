# sim-poolpres-lever-b — pool-presence lever: maintenance-spawn weight for wave-3+ (axis scale-onramp)

Run: fleshout-loop-b-20261025T1531Z (Sun 2026-10-25 ~10:31 CDT onwards).
Axis: scale-onramp (converging). LEVER ARM — one game-code change, tested
against a control band on identical seeds. Worktree:
~/workspace/worktrees/sim-poolpres-lever-b. Main tree untouched.

## PRE-REGISTRATION (binding, written BEFORE any sweep — control band first,
## lever sweep second; judged only against this)

- Question (from evidence/2026-10-25/sim-poolpres-a.md, next blank #1):
  raid-time pools hold 7.16% wave-3+ monsters against ~23–24% needed for
  one wave-3+ raider per raid on average. Can a maintenance-spawn weight
  change move the pool share to the bar?
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  wave 3 = day 25+ and wave-2 ledger; wave 4 = standing >= 100; wave 5 =
  standing >= 200 and wave-4 faced; readiness gates hold waves 4-5).
  No haven/raid canon doc exists — the design lives in src/js/havenGrowth.js
  comments (carried from raftdraft-a / poolpres-a).
- MECHANISM (read from code, never invented):
  - src/js/game.js maintainWorldMonsters() (~line 19457): one spawn per
    worldTick (tile entry only), ONLY when the living pool is below
    worldMonsterCap() (~line 19420: 3 base / 5 arrived / 8 deep / +1 night).
  - It picks its wave via spawnWaveTarget(pool) (~line 32401), the shared
    single source of truth also used by castMonster and tile-entry spawns:
    at top unlocked wave 3: 60% wave 3 / 25% wave 2 / 15% wave 1; at top 4:
    60/20/15/5; at top 5: 55/20/12/8/5 (wave-3+ share of the target: 60% /
    80% / 87%).
  - EXACT LEVER (maintain path ONLY; every other spawn path keeps
    spawnWaveTarget untouched): in maintainWorldMonsters, once
    unlockedWave() >= 3, the target wave becomes the highest wave in the
    pool — i.e. maintain spawns are 100% newest-wave (100% wave-3+),
    replacing the 60/25/15-style ratios FOR THIS PATH ONLY. At top 3 that
    is 60% -> 100% wave-3; at top 4, 80% -> 100% wave-3+; at top 5,
    87% -> 100% wave-3+.
  - WHY THE MAXIMUM: this arm tests the CEILING of the maintain mechanism.
    If even 100%-wave-3+ maintain spawns cannot reach the bar, no weaker
    maintain weight can either (monotone in expectation, modulo RNG noise
    across 8 seeds — stated, not hidden). A failed ceiling kills the
    maintain mechanism as a candidate; it does not license a lower bar.
  - STRUCTURAL CAVEAT (pre-registered, not a rescue): maintain fires only
    when the pool sits below the cap, while raid-time pools measured
    median 17 / mean 17.6 — far above the cap of 8. The maintain path may
    therefore be dormant at most raid times, and the pool stock may be
    dominated by other spawn paths (tile-entry, wanderer casts) plus
    long-lived stock. This arm measures exactly how much the maintain
    ceiling can move the stock; it does not assume it can.
- Substrate (shared, landed pattern): tableseat-nowait (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1) + raftdraft-diag recorder reused VERBATIM
  (scripts/policies/raftdraft-diag.js + scripts/test-raftdraft-diag-sweep.js
  --one armed mode, as in poolpres-a). Recorder neutrality was proven by
  raftdraft-a (G2 8/8 identical), so armed rows ARE the substrate
  trajectories; control and lever bands are both armed rows on identical
  seeds, differing only by the game-code lever. Seeds 73671–73678, 180d
  death-aware horizon (dead villages stop; never a fixed 200d).
  Pilot = the 8-seed band; no confirm spend beyond it (no confirm was
  pre-registered, so none is run even on a GO — a confirm is a follow-up
  run's pre-registration, not a mid-run extension).
- CONTROL (run FIRST, on current master, before any lever code exists):
  the poolpres-a sketch reports death total 234 (band: wins 4/8,
  national-ever 7/8, median survival 135d). The coordinator brief states
  the substrate moved since poolpres-a (belltoad chorus-break + post-flee
  <=25% rest now in master) — but poolpres-a's own evidence records those
  two fixes as ALREADY in master when it ran, so the move, if any, is
  expected to be nil and the control band verifies it. The verified
  control death total is inserted in the CONTROL VERIFICATION section
  below BEFORE the lever sweep; the guards below are judged against that
  verified number, not the sketch. Inserting a verified control number
  before any armed (lever) sweep is not a re-score: the PRIMARY bar
  (pool share >= 23%, w3+/raid >= 0.9) is fixed regardless of the control.
- PRIMARY: band pool wave-3+ share (pooled per-raid living-pool counts,
  same denominator as poolpres-a). GO requires BOTH: pool share >= 23%
  AND wave-3+ per raid >= 0.9. MEAN-COUNT bar, stated exactly:
  23–24% buys one wave-3+ raider per raid ON AVERAGE (poolpres-a
  hypergeometric: 73.7% of raids get >=1 at 23.4%) — NOT one in every raid.
  Do not re-describe it as an every-raid bar.
- GUARDS (vs the verified control band): wins >= 3/8, national-ever
  >= 6/8, death total within ±20% of the verified control total.
  A presence lever that buys big monsters by killing villages is NO-GO.
- Secondary (reported, NOT gated): raids with >=1 wave-3+ raider;
  wave-5 pool presence (any nonzero count is a finding, not a bar —
  wave-5 presence is a separate standing/readiness-gates question; do NOT
  judge this lever on it).
- SENSE: one transcript read — does a wave-3+ raider arriving at the
  palisade read as an escalation, or pass unremarked? Quote one line.
  Do NOT bundle the palisade-escalation narration beat into this numbers
  arm (separate open blank); report the observation only.
- VERDICTS: GO = PRIMARY passes AND guards pass -> land the lever
  (own commit, [needs-eyes] — bigger monsters in the world change fight
  feel). NO-GO = PRIMARY missed (guards or not) -> revert the game code,
  commit measurement only, do not land. If the 100% ceiling misses the
  PRIMARY, the maintain-weight mechanism is additionally KILLED as a
  candidate for follow-ups (a second mechanism is a follow-up run, not a
  mid-run rescue, and the bar is never lowered).
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md §14):
  pre-registered metrics bind the run — a miss is NO-GO, never re-scored
  against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest per-seed
  recorder corpora (fourth sighting on record) — the sweep-compare table
  + analyzer output are attached instead, and telemetry-check is NOT run
  on recorder rows (standing 1027Z instruction: its counts are wrong on
  recorder rows).

## CONTROL VERIFICATION (written after the control band, BEFORE the lever sweep)

Control band run Sun 2026-10-25 ~11:00–11:15 CDT, pristine worktree code
(no lever), armed recorder rows only, seeds 73671–73678, 180d death-aware.
Analyzer: scripts/test-poolpres-diag.js --summary on
evidence/2026-10-25/perseed-sim-poolpres-lever-b/control/ (gates pass:
census 8/8, zero recorder errors, implied-presence agreement 0.74pp).

- Per-seed: 73671 survived 180d 16 raids/74 raiders; 73672 won lesser d97
  7/28; 73673 won lesser d124 7/30; 73674 survived 180d 14/65; 73675 won
  lesser d135 13/56; 73676 village-lost d70 7/28 starv 4; 73677
  village-lost d143 12/45; 73678 won lesser d116 9/35 starv 1.
- Band: raids 85, raiders 361, mean raidN 4.27, pool total 1,494,
  pool wave-3+ share 7.16% (107; SE 0.67pp), w3+/raid 0.400,
  raids with >=1 w3+ raider 26/85, wave-5 pool 0.
- Wall: wins 4/8 (all lesser, all "feared"), national-ever 7/8,
  national-final 6/8, table invited 4/8, entered 4/8, median survival 135d,
  wave-3 8/8, wave-4 6/8, wave-5 0/8, starvation total 5,
  VERIFIED CONTROL DEATH TOTAL = 234.
- VERDICT ON THE SUBSTRATE: the control reproduces poolpres-a EXACTLY on
  every headline (85/361, 7.16%, 234, 4/8, 7/8, 135d). The coordinator
  brief's "substrate moved" note therefore refers to the move since
  raftdraft-a, not since poolpres-a: belltoad chorus-break + post-flee
  <=25% rest were already in master when poolpres-a ran, and nothing
  since has moved this band. Guards are judged against the verified 234:
  death band [187.2, 280.8], wins >= 3/8, national-ever >= 6/8.
  The lever sweep starts only after this section was written.

## RESULTS (written after the lever sweep)

## VERDICT: NO-GO — maintain-weight mechanism KILLED

- PRIMARY: lever band pool wave-3+ share 7.16% (107/1,494) vs bar
  >= 23% — FAIL by 15.84pp. Wave-3+ per raid 0.400 vs bar >= 0.9 —
  FAIL. The lever moved NOTHING: the lever corpus is BYTE-IDENTICAL
  to the control corpus on all 8 seeds (cmp clean on every
  s<seed>-armed.json; identical raids 85, raiders 361, pool counts,
  wall numbers, deaths 234).
- GUARDS (all pass, trivially — nothing changed): wins 4/8 (>= 3/8),
  national-ever 7/8 (>= 6/8), deaths 234 within [187.2, 280.8] of
  verified control 234. The lever is not harmful; it is inert.
- SECONDARY: raids with >=1 wave-3+ raider 26/85 in both bands;
  wave-5 pool presence 0 in both bands (finding, not a bar — carried
  blank #2 stands); wave-4 pool 5 in both bands.
- Per-seed lever band (identical to control on every seed): 73671
  survived 180d 16/74; 73672 won lesser d97 7/28; 73673 won lesser d124
  7/30; 73674 survived 180d 14/65; 73675 won lesser d135 13/56; 73676
  village-lost d70 7/28 starv 4; 73677 village-lost d143 12/45; 73678
  won lesser d116 9/35 starv 1.

## THE CEILING TEST — why byte-identity is the result, not a bug

The pre-registered mechanism was the MAXIMUM maintain weight (100%
newest-wave once wave 3 unlocked, maintain path only). Two facts
together pin the interpretation:

1. THE LEVER CODE IS LIVE (direct proof, run BEFORE revert):
   scripts/test-poolpres-lever-maintain.js drove a real game to wave-3
   unlocked (ledger 6 wave-2 points vs bar 4, day 30, unlockedWave 3),
   emptied the pool, and called the real maintainWorldMonsters():
   pool 0 -> 3 (cap 3), every spawn wave 3 (chorus_line, gavel, gavel)
   — PASS. When maintain fires below cap post-unlock, it now spawns
   100% wave-3 as designed. (The proof script was deleted before commit
   because it asserts lever behavior that was reverted with the NO-GO;
   keeping it would leave a failing test on current code. Its exact
   output is preserved here.)
2. THE SWEEP MOVED NOTHING: 8/8 seeds byte-identical, including
   per-raid pool compositions. A single differing maintain spawn would
   change a raid's poolByWave and break identity. Therefore, on this
   band, maintain effectively never fires below cap post-unlock with a
   changed outcome — either it never fires below cap once wave 3 is
   unlocked, or it fires so rarely that no differing spawn occurred in
   8 full runs. Either way the ceiling movement is ZERO, against a bar
   that needed +15.84pp. No weaker maintain weight can do better.

Root cause (structural, pre-registered as the caveat): maintain fires
only when the living pool sits below worldMonsterCap (3/5/8/+1 night),
while raid-time pools sit at median 17 / mean 17.6 — the pool lives
above the cap, filled by other spawn paths (tile-entry, wanderer casts)
plus long-lived stock, and maintain is dormant. The lever tunes a tap
that is already closed. The follow-up is NOT another maintain weight —
it is the spawn-source audit (blank #3): which paths fill the pool past
the cap to 17, and do they favor wave-1/2? That audit is now the next
lever question, not a side note.

## WALL NUMBERS (lever band = control band, identical)

- national-ever 7/8, national-final 6/8, table invited 4/8, entered 4/8,
  wins 4/8 — all lesser seat, all path "feared". Full seat 0/8.
- wave reach: wave-3 8/8, wave-4 6/8, wave-5 0/8. Median survival 135d,
  max 180d. Deaths 234 total, starvation 5.
- The scale wall above national/table is untouched, as expected from
  an inert lever: wins still come only through courtship + seat
  instruments on the lesser seat; wave 5 is still 0 everywhere; wave-5
  pool presence at raid time is still 0/1,494.

## SENSE-TESTING READ (transcript, not just counts)

Sense replay: seed 73671, 60d horizon (the 180d replay's 240-line ring
covers only days 178–181 — a method note: full-run sense replays cannot
show mid-run raids; the 60d replay's ring covers days 58–61 and DOES
catch a monster raid). File:
evidence/2026-10-25/sim-poolpres-lever-b-sense.txt. Quoted verbatim,
day-60 monster raid (5 raiders, including The Moderator, the wave-2
apex — the strongest monster in the draft, given no special billing):

> [d60] 🐗 RAID — 5 raiders (Ugly-Eyes, The Moderator, Loud-Eyes,
> Inspiration, Flashbulb Moth) hit Haven in the night, drawn by the
> smell of the pantry! The palisade's stakes take their toll as they
> come over the wall.

Judgment: a wave-3+ raider at the palisade would read EXACTLY like
this — a name in a list. The raid line carries no wave marker, no
escalation language, no "bigger thing at the wall" beat — not even for
the wave-2 apex. Poolpres-a's judgment stands, now confirmed on the
raid line itself (poolpres-a caught the wave-3 arrival only through
fight mechanics): the palisade-escalation beat does not exist yet. It
remains a narration blank (blank #4), deliberately NOT bundled into
this numbers arm.

Villagers-act-like-people check (same transcript, day 60): people read
as people, not systems. Landon: "Snares were empty. They'll keep."
Sigrid: "No point hauling what'll rot. Mending the nets instead."
Landon, pantry full: "Dinner's on me tonight, then." Theo's discovery
beat ("I know this one now. Look — see the leaves?"), Brunhilde's
gossip ("Wren again. There was food by the hollow this morning — good
food. Don't ask me how I know it wasn't one of us."), defenders named
at the door (Landon, Daniela, Sigrid, Brian, Owen — "5 driven off").
One wrinkle, stated not hidden: the player's wait narration repeats
verbatim many times ("You wait. The light changes. Nothing asks
anything of you.") — that is the bot waiting, not villager behavior,
but a human waiter would see the same repeated line. Minor narration
repetition, carried as an observation below, not chased here.

## VILLAGE ASSESSMENT (plain words)

The villages are the same villages as last run — literally: every
seed's story is unchanged, because the lever changed nothing. Most
reach the region, a few sit at the lesser seat, nobody reaches the
full seat or wave 5. What this run adds is a killed mechanism with a
clean ceiling: the woods do not fill from the maintenance tap. The
maintenance crew tops the population up to a cap of eight, but the
woods already hold seventeen monsters when the raid comes — the extra
nine come from somewhere else, and that somewhere else is what decides
what stands at the palisade. Until the audit names those paths, every
pool-presence lever aimed at maintenance is tuning a closed tap.

## METRIC REVIEW (required, §14)

- No metric was re-scored mid-run. NO-GO is judged exactly as
  pre-registered: PRIMARY pool share >= 23% AND w3+/raid >= 0.9, guards
  vs the verified control 234. The control number was verified (234,
  exact reproduction of poolpres-a) and inserted BEFORE the lever sweep,
  as the pre-registration allowed; the PRIMARY bar never moved.
- Byte-identity vs bar-miss: the lever did not "almost" reach the bar
  — it recorded zero movement. There is no friendlier metric under which
  7.16% vs 23% with identical corpora becomes a GO, and none was tried.
- Mean-count vs every-raid bar (carried): 23% buys one wave-3+ raider
  per raid ON AVERAGE, not one in every raid. The lever reached neither
  reading (0.400/raid, 26/85 raids with >=1).
- Pool-share pooling choice (carried): per-raid pool counts summed
  across raids — right for "what does a raid draft from", NOT a
  distinct-monster census.
- Sense divergence (stated, not hidden): narration replays shift
  trajectories, so the day-60 raid line is from the replay's own run,
  not from any census raid. The judgment (no escalation beat exists in
  the raid line format) is about the transcript surface, which the
  replay does show — it does not depend on the replay matching a census
  raid. The 180d replay was superseded by the 60d replay for exactly this
  reason (ring limit), and the superseded file was overwritten before
  commit (it was this run's own uncommitted file, not another run's).
- Proof-test deletion (stated, not hidden): the maintain proof test
  passed against lever code and was deleted before commit because the
  lever was reverted; keeping it would fail on current code. Its output
  is preserved in "The ceiling test" above. The compare script (which
  proves the measurement) is committed and passes on the committed
  corpora.
- None of these change the verdict. NO-GO stands, and the
  maintain-weight mechanism is KILLED as a follow-up candidate.

## CONVERGENCE + NEXT BLANKS

scale-onramp stays converging (NOT converged): this run is a killed
lever, not a landed one — the full seat is still unreached, wave 5 is
still 0/8, wins are still lesser-seat only, and pool presence is still
7.16%. The standing directive stands until the tracker records this
axis converged on measured evidence.

Next blanks, in order:
1. Spawn-source audit for the above-cap raid-time pool (median 17 vs
   maintain cap 8) — PROMOTED by this run: maintain is killed, so the
   audit is now the next lever question. Which spawn paths fill the pool
   past the cap, and do they favor wave-1/2? (Carried from raftdraft-a,
   now blocking.)
2. Wave-5 pool presence is zero (0/1,494, both bands) — separate
   standing/readiness question, not a spawn-weight question. (Carried.)
3. Palisade-escalation narration beat for wave-3+ raids — confirmed
   again by the day-60 raid line (wave-2 apex gets no special billing).
   (Carried.)
4. Defender-fight wound manufacture (carried).
5. Field-kill narration/gossip beat (carried).
6. Wait-narration repetition ("You wait. The light changes. Nothing asks
   anything of you." verbatim, many times) — NEW minor observation from
   this run's sense read; a human waiter sees the same line. Not chased
   here.

## INFRASTRUCTURE + CORPUS

- No EPERM flap blocked this run; all 16 control+lever rows wrote first
  try. Safe-commit index clobber: [to be noted at commit time].
- No sibling tree, branch, claim file, tracker, or lock touched.
  Telemetry-check NOT run, per the standing instruction (recorder rows
  are not panels). Balanced panel NOT run: balance-panel.js cannot
  ingest per-seed recorder corpora (fourth sighting) — the compare
  table above + analyzer outputs are attached instead.
- Corpus (committed with this run): per-seed armed rows + summary.json
  in evidence/2026-10-25/perseed-sim-poolpres-lever-b/control/ and
  .../armed/ (16 rows, byte-identical across bands); sense transcript
  evidence/2026-10-25/sim-poolpres-lever-b-sense.txt; this file.
  Compare: scripts/test-poolpres-lever-compare.js (read-only over both
  summary.json files; prints PRIMARY + GUARDS + verdict).
- Recorder + sweep reused unchanged: scripts/policies/raftdraft-diag.js,
  scripts/test-raftdraft-diag-sweep.js (--one armed mode).
- Game code: REVERTED before commit (NO-GO — killed arms leave no
  trace). The committed tree contains zero src/js changes from this run.
  Analyzer: scripts/test-poolpres-diag.js (reused, read-only).
