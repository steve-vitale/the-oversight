# sim-w5births-a — why is wave 5 never even born? (axis scale-onramp)

Run: fleshout loop A, 2026-10-25. DIAG ONLY — zero src/js changes,
zero game-code changes, zero default flips. Recorders only:
scripts/policies/spawnsrc-diag.js (reused verbatim) +
scripts/policies/raftdraft-diag.js (reused verbatim) +
scripts/policies/w5births-diag.js (new, this run) +
scripts/test-w5births-diag-sweep.js (new, this run) +
scripts/test-w5births-diag.js analyzer (new, this run).
This arm designs and lands NO fix. A complete classification IS the
deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  wave 3 = day 25+ and wave-2 ledger >= 4; wave 4 = w3 rung + gated
  standing >= 100; wave 5 = w3 rung + gated standing >= 200 AND wave-4
  faced; readiness gates hold waves 4-5: wave 4 demands 3 armored @
  P>=10 / 5 armed / 3 tricks / 1 living wave-3 killer; wave 5 demands 4
  @ P>=15 / 6 / 3 / 2 living wave-4 killers; plenty counts at most 100
  toward the wave-5 bar; peak ratchet floors the gated total once a
  wave releases). Read from code, never invented: unlockedWave() in
  game.js; villageStandingTotal() / waveCombatReadiness() /
  waveUnlockReady() in standing.js; spawnWaveTarget() in game.js
  (top<=1 -> 1; top 2 -> 60% 2; top 3 -> 60% 3; top 4 -> 60% 4; top 5 ->
  55% 5 / 20% 4 / 12% 3 / 8% 2 / 5% 1); monsterWavePool() filters by
  unlockedWave(); tile-entry / maintain / castMonster all pick their
  target wave through spawnWaveTarget(pool).
- Context read first: evidence/2026-10-25/sim-spawnsrc-a.md — wave-5
  births are ZERO across all sources on the shared band (0 births, 0
  pool entities in 1,494). Prior runs decomposed the full-seat block:
  wave-4 pins at standing 99 via the defer4 veterans lock (wave 4
  needs 1 living wave-3 killer, wave 5 needs 2 living wave-4 killers;
  stuck villages have 0), and wave-4 kills are 0/8 on this band.
  Question: WHY is wave 5 never even born? Is the block (a) standing
  never reaching 200, (b) wave-4 never faced (readiness gate), (c) the
  veterans lock, or (d) spawn targeting (spawnWaveTarget never
  selecting wave 5 even when eligible)? Classify, do not guess.
- Substrate (shared, landed pattern): tableseat-nowait
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + spawnsrc recorder
  (SPAWNSRC=1) + raftdraft recorder (RAFTDRAFT=1) + w5births recorder
  (W5BIRTHS=1). Seeds 73671-73678, 180d death-aware horizon (runDays
  stops on death/win; 180 is the cap). Pilot = this 8-seed band; NO
  confirm spend unless a follow-up run pre-registers a confirm band
  first (this header does not).
- Recorder neutrality (gate, stated before the sweep): recorders draw
  no RNG, throw nothing into the engine, return every original value
  untouched. The w5births recorder NEVER calls villageStandingTotal()
  or unlockedWave() during a run (vetkill discipline: the former
  releases peaks and emits hold beats — side effects; the latter calls
  the former). Daily points are pure reads only: villageStanding(),
  standingPlentyCappedTotal(), waveUnlockReady(4/5),
  waveLedgerPoints(2/3/4), waveEngaged(4/5), and a direct read of
  state._standingPeakWave. The gated total and the unlocked-wave proxy
  are RECONSTRUCTED in the analyzer from those pure reads (holds +
  peak simulation, documented in the analyzer header) — never by
  calling the gated function mid-run. spawnWaveTarget is wrapped
  outer-only: it calls the original once and records its return
  value, pool top wave, and day. The armed band must reproduce the
  published control band (see CONTROL GATE) or explain any deviation
  BEFORE judging; a moved trajectory invalidates the classification.
- PRIMARY (DIAG-GO requires ALL of):
  (a) every seed classified into exactly one primary blocking cause
  from the closed set below, with named per-seed evidence;
  (b) per-seed standing max + capped values reported (max raw, max
  capped-plenty, max reconstructed gated, peak wave);
  (c) per-seed wave-4 faced / wave-4 killed counts reported (faced =
  distinct wave-4 types in wavesFaced at end; killed = wave-4 entries
  in waveKillLog);
  (d) wave-5 birth attempts counted, or the absence proven as "no
  eligible moment ever occurred" with the gate trace to show it:
  eligible moment = a spawnWaveTarget call whose pool top wave is 5
  (wave 5 in the spawn pool), or a spawnWorldMonster call while the
  reconstructed unlocked proxy is 5. If neither ever occurs, the
  proof is: max pool top across ALL spawnWaveTarget calls per seed,
  plus the daily gate trace (raw/capped/gated, rd4/rd5 bars, w4
  faced) showing which gate never cleared.
  If any of (a)-(d) is missing, the verdict is DIAG-NO-GO
  (classification incomplete), not a pass. Do NOT design or land a fix.
- CONTROL GATE (before judging): reproduce the published control band
  headlines: deaths 234, national-ever 7/8, wins 4/8, wave-4 6/8,
  wave-5 0/8 (plus the spawnsrc band for strength: raids 85, raiders
  361, median survival 135d). If the control does not replicate, STOP
  and report — do not judge against a moved baseline.
- CLASSIFICATION SET (closed; exactly one primary per seed, causal
  order — the earliest gate in the chain that never clears wins):
  * STANDING100 — raw standing never reaches 100 (the wave-4 door
    never even opens; gated total never reaches 99 via deferral, it
    simply never approaches t4).
  * READINESS4 — raw >= 100 but wave-4 readiness never ready by end
    (report which bars were short at max-standing day and at end;
    name VETERANS explicitly when living wave-3 killers = 0 while the
    other bars were met at some point, else name the co-binding bars).
  * FACED4 — wave 4 unlocked (reconstructed proxy >= 4, and final
    harness unlockedWave >= 4) but wave-4 faced = 0 at end (report
    wave-4 births: if births > 0, contact/fight never happened; if
    births = 0 despite unlocked 4, say so — that is a spawn-path
    finding at wave 4, not a faced finding, and the seed is
    re-classed SPAWN4 with the target-call evidence).
  * STANDING200 — wave 4 faced > 0 but capped standing never reaches
    200 (report max capped and which source — war/bonds/bread — was
    furthest short; name the plenty cap when bread alone would have
    cleared 200 uncapped).
  * READINESS5 — capped >= 200 and wave-4 faced > 0 but wave-5
    readiness never ready by end (report which bars short; name
    VETERANS explicitly when living wave-4 killers < 2).
  * SPAWN-TARGETING — all wave-5 gates cleared (reconstructed proxy
    5, or final harness unlockedWave 5) yet wave-5 births = 0
    (report spawnWaveTarget calls at pool top 5 and their returned
    targets: if target 5 was returned but no spawn path fired, say
    which paths were silent; if target 5 was never returned despite
    top 5, that is the targeting finding).
  * OTHER-NAMED — none of the above fits; the seed's evidence must
    name the blocker in one line (no seed may be left "unknown").
  Note the task's four candidate causes map onto this set as:
  (a) standing never 200 = STANDING100 / STANDING200; (b) wave-4 never
  faced = FACED4 (and READINESS4 is the gate behind it when readiness
  is what blocks the unlock); (c) veterans lock = READINESS4 /
  READINESS5 with veterans named; (d) spawn targeting = SPAWN-TARGETING
  (and SPAWN4 at wave 4). The classification table must show the
  task's (a)-(d) mapping per seed alongside the closed-set label.
- Secondary (reported, NOT gated): per-seed wave-4 births by source
  (from the spawnsrc census); per-seed spawnWaveTarget call counts by
  (pool top, returned target); first-day table for each gate event
  (raw>=100, capped>=200, rd4 ready, rd5 ready, w4 faced, w4 killed,
  proxy unlocked 4/5, pool top 4/5, target 5 returned, w5 birth);
  per-seed readiness-bar trajectories at max-standing day (armored /
  armed / tricks / veterans vs demand for waves 4 and 5).
- SENSE: at least one transcript sample read and judged for sense,
  not just counts (does a village read as people; does a wave-4
  moment, if any, read as an escalation). One quoted line.
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md §14):
  pre-registered metrics bind the run — a miss is NO-GO, never
  re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest per-seed
  recorder corpora (fourth sighting, carried) — the sweep-compare
  table + analyzer output are attached instead, and telemetry-check
  is NOT run on recorder rows (standing instruction: its counts are
  wrong on recorder rows).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO

- (a) All 8 seeds classified into exactly one closed-set primary cause,
  with named per-seed evidence (table below). No OTHER-NAMED seeds.
- (b) Per-seed standing max + capped values reported (max raw, max
  capped-plenty, max reconstructed gated, peak wave — table below).
- (c) Per-seed wave-4 faced / wave-4 killed counts reported (faced =
  distinct wave-4 types in wavesFaced at end; killed = wave-4 entries
  in waveKillLog).
- (d) Wave-5 birth attempts counted AND the absence proven as "no
  eligible moment ever occurred": across the band, 309
  spawnWaveTarget calls, max pool top 4, ZERO calls at pool top 5,
  ZERO calls returning target 5, ZERO wave-5 births. The gate trace
  per seed (below) shows which gate never cleared on each seed, so
  the absence is not an assertion — it is the trace.
- CONTROL GATE: EXACT reproduction (see below). The classification is
  judged on a trajectory the recorders did not move.

## CONTROL GATE — EXACT REPRODUCTION (gate, not a claim)

Armed band (tableseat-nowait + raftdraft + spawnsrc + w5births)
reproduces the published control band on every headline: raids 85,
raiders 361, deaths 234, national-ever 7/8, national-final 6/8,
table invited 4/8, entered 4/8, wins 4/8 (all lesser seat), median
survival 135d, wave-3 8/8, wave-4 6/8, wave-5 0/8, starvation 5,
pool total 1,494, pool wave-3+ 107. Per-seed trajectories match the
spawnsrc control seed for seed (73671 survived 180d 16 raids/74
raiders; 73672 won lesser d97 7/28; 73673 won lesser d124 7/30; 73674
survived 180d 14/65; 73675 won lesser d135 13/56; 73676 village-lost
d70 7/28 starv 4; 73677 village-lost d143 12/45; 73678 won lesser
d116 9/35 starv 1). The detgate passes (recorders OFF: days/gameDays/
ts identical, no recorder surface, no wraps installed, post-setup
world size 0). Corpus: PASS (recorder errors 0 on all three
recorders, no overflow on the capped lists; target-call aggregates
are overflow-proof by construction).

## THE ANSWER, FIRST (plain words)

Wave 5 is never born because no village ever becomes eligible for it
— and the villages fail at different links of the same chain, so
there is no single block to point at. The chain is: open wave 4
(standing 100 + one living wave-3 killer) → a wave-4 monster must
actually appear in the world → someone must fight it → someone must
KILL it and live → two living wave-4 killers + standing 200 → wave 5
opens → a wave-5 monster must be picked by the spawn lottery.
Measured on this band:

- 1 seed never even approaches wave 4 (standing peaks at 50).
- 1 seed has the standing for wave 4 for 58 days but never fields
  the one living wave-3 killer it needs (armor, weapons, tricks all
  passed — veterans alone bind).
- 3 seeds open wave 4 but never fight a wave-4 monster — two of them
  because wave 4 opens in the last few days of the run, one because
  the monsters stood in the world for weeks and were never fought.
- 1 seed opens wave 4 on the penultimate day, so no wave-4 monster
  ever spawns — while already held at gated 199 by the wave-5
  veterans lock (named co-blocker, not hidden).
- 2 seeds fight wave 4 (one even kills one) but never reach standing
  200 (peaks 127 and 172).

Spawn targeting is EXONERATED, not implicated: whenever the spawn
lottery was offered a pool topped by wave 4, it picked wave 4 in
10 of 15 calls (67%, vs the designed 60% — the 60/20/15/5 ratio
working as designed). It never refused wave 5; it never SAW wave 5
(pool top never 5 in 309 calls). The (d) hypothesis — targeting
never selects wave 5 even when eligible — is FALSE on this band:
there was no eligible moment to select from.

## PER-SEED CLASSIFICATION TABLE (the deliverable)

Columns: seed | end | harness/proxy wave | maxRaw / maxCapped /
maxGated (peak) | faced4 / killed4 | w4 births (days) | spawn
window (proxy-4 day → end) | post-unlock top-4 calls (→4) |
LABEL (task map).

| seed | end | wave | maxRaw/Capped/Gated | faced/killed | w4 births | window | post-unlock calls | LABEL |
|---|---|---|---|---|---|---|---|---|
| 73671 | survived 180d | 4/4 | 127/127/127 (4) | 0/0 | 1 (d179 audit) | d177→180 (3d) | 1 (1→4) | FACED4 (b) |
| 73672 | won lesser d97 | 4/4 | 167/167/167 (4) | 0/0 | 2 (d79 herald-titan, d86 eulogy) | d60→97 (37d) | 5 (1→4) | FACED4 (b) |
| 73673 | won lesser d124 | 3/3 | 122/122/99 (0) | 0/0 | 0 | — (never unlocked) | 0 | READINESS4 (c) |
| 73674 | survived 180d | 4/4 | 167/167/167 (4) | 0/0 | 3 (d170 herald-titan, d172 suburb, d180 reunion) | d157→180 (23d) | 2 (2→4) | FACED4 (b) |
| 73675 | won lesser d135 | 4/4 | 267/227/199 (4) | 0/0 | 0 | d134→135 (1d) | 0 | SPAWN4 (d-at-wave-4, no-window) |
| 73676 | village-lost d70 | 3/3 | 50/50/50 (0) | 0/0 | 0 | — | 0 | STANDING100 (a) |
| 73677 | village-lost d143 | 4/4 | 127/127/127 (4) | 1/0 | 4 (d133 eater, d136 suburb, d139 algorithm, d140 eulogy) | d125→143 (18d) | 5 (4→4) | STANDING200 (a) |
| 73678 | won lesser d116 | 4/4 | 172/172/172 (4) | 1/1 | 1 (d113 eulogy) | d113→116 (3d) | 2 (2→4) | STANDING200 (a) |

Counts: FACED4 3, READINESS4 1, SPAWN4 1, STANDING100 1,
STANDING200 2, SPAWN-TARGETING 0, READINESS5 0 (as primary),
OTHER-NAMED 0. Band totals: wave-4 births 11 (9 tile-entry + 2
scripted-titan heralds), wave-4 faced seeds 2/8, wave-4 kills 1
(73678, strike, day 115, by elif_demir via player), wave-5 births 0,
eligible moments 0.

## PER-SEED EVIDENCE (why each label, not just the label)

- 73671 FACED4 — raw>=100 day 57, but rd4 ready only day 177
  (veterans 1 that day; 0 again by day 180 — the killer did not
  survive, the peak ratchet keeps wave 4 open, gated ends at 100).
  One top-4 target call, day 179, returned 4, birthed an audit
  (tile-entry). One day to meet it; run ends day 180. FACED4 here is
  a late-unlock story, not a refusal-to-fight story.
- 73672 FACED4 (the genuine one) — proxy 4 day 60, 37 days of
  wave-4 availability, 5 top-4 target calls. Eulogy (a real Mirror
  Draft monster) born day 86, stood in the day-89 raid-time pool,
  never fought in 11 days to the day-97 win. The herald (scripted
  titan) born day 79 stood in raid pools days 80 and 89, also never
  fought. Mechanism note: standing in a RAID pool does not count as
  faced — wavesFaced feeds only on real blow-by-blow fights
  (startCombat / fieldFight / recordWaveKill), and raid drafting is
  none of those. So a wave-4 monster can raid the village without
  the village ever "facing" wave 4 in the deed sense.
- 73673 READINESS4 (textbook veterans lock) — raw>=100 day 66,
  maxRaw 122, gated pinned at 99 from day 66 to the day-124 win (58
  days pinned). At max-raw day AND at end: armored 7/3 then 6/3,
  armed 8/5 then 9/5, tricks 20/3 then 24/3 — every bar passed except
  veterans, 0/1 at every daily point of the run (rd4 veterans max
  0). The village had the standing, the armor, the weapons, and
  the tricks; it never had one living wave-3 killer.
- 73674 FACED4 — proxy 4 day 157; suburb born day 172 (8 days to
  meet it), reunion born day 180 (0 days). Two top-4 calls, both
  returned 4. Never fought. A shorter-window sibling of 73672's
  story, not a separate mechanism.
- 73675 SPAWN4 (no-window; co-blocker defer5 named) — the closest
  seed to wave 5 and the most instructive. Day 99: raw 202 (bonds
  102 + bread 100, war 0), capped 202 — the wave-5 NUMBER already
  met — but rd4 not ready, veterans the ONLY short bar (armor 5/3,
  weapons 9/5, tricks 17/3). Pinned below wave 4 for 35 days
  (99→134) by veterans alone. Day 134: rd4 ready (veterans 1),
  peak 4, proxy 4. Day 135 (win): the veteran is gone again
  (rd4 veterans 0), gated 199 via defer5 (capped 227, rd5 veterans
  0/2 — never above 0 on any day of the run; rd5 armor 3/4 short
  at end too). Zero target calls at top>=4 after unlock — all 33
  calls happened at top<=3 before day 134. So "0 wave-4 births"
  here means the window never opened, and even with a window the
  seed still needed a wave-4 fight and two living wave-4 killers
  first. The plenty cap did NOT block this seed (capped 227 >=
  200); the veterans lock did, twice over (defer4, then defer5).
- 73676 STANDING100 — died day 70 (village-lost, starvation 4),
  maxRaw 50. Wave 4 was never in reach; nothing subtler to say.
- 73677 STANDING200 — proxy 4 day 125, faced suburb day 136
  (born day 136, faced the same day), 4 wave-4 births, eater +
  suburb in the day-137 raid pool, kills 0. MaxRaw 127, maxCapped
  127 — 73 short of 200. The chain worked up to the standing
  number and stopped there.
- 73678 STANDING200 (furthest played) — proxy 4 day 113, faced +
  killed strike day 115 (by elif_demir, via player — the band's
  only wave-4 kill), maxRaw 172, maxCapped 172 — 28 short of 200.
  Note the mechanism: the faced/killed monster is 'strike', which
  has NO world-monster birth on this seed (only eulogy was born,
  day 113) — the strike fight came through the cast-wanderer path
  (day-115 top-4 target call returned 4; a cast monster fights on
  contact without ever entering the world census). Faced can
  therefore happen without a birth, and births without faced —
  the two censuses measure different doors into the same fight.

## SPAWN TARGETING — THE (d) VERDICT IN FULL

Band: 309 spawnWaveTarget calls (per seed: 49/43/31/29/33/34/48/42).
Pool-top distribution: top 4 calls 15, top 5 calls 0. Returns at
top 4: 4 in 10/15 calls (67%), 3 in 2, 2 in 2, 1 in 1 — the designed
60/20/15/5 ratio, sampled thin (n=15) but centered on design, not
on refusal. Returns at top 3 and below follow the same designed
ratios (e.g. top-3 calls returning 3, 2, 1). No call ever returned
5 because no call ever saw top 5. Conclusion: spawnWaveTarget is
not the wave-5 block on this band, at any pool size — and the
wave-4 evidence shows it picks the newest wave when offered it.
Any future arm that suspects targeting must first produce a top-5
call that returns something else; this band contains none.

## READINESS-BAR TRAJECTORIES AT MAX STANDING (secondary)

- 73673 at maxRaw day: rd4 armor 7/3, armed 8/5, tricks 20/3,
  veterans 0/1 (veterans sole binder, all run).
- 73675 at maxRaw day (135): rd4 armor 5/3, armed 7/5, tricks 19/3,
  veterans 0/1; rd5 armor 3/4, armed 7/6, tricks 19/3, veterans 0/2.
  At its day-134 unlock moment rd4 was fully ready (6/8/19/1);
  the veteran did not survive to day 135. Mortality-selected
  readiness, measured live: the bar is met, then the veteran dies.
- 73678 at end: rd4 fully ready (5/6/23/1); rd5 short on veterans
  only (1/2) — one more living wave-4 killer would have cleared
  rd5's veterans bar, but standing (172) would still have held
  wave 5 out.
- 73671/73672/73674/73677 at end: rd4 veterans 0 (killers dead by
  end) — the peak ratchet, not living veterans, is what keeps
  their wave 4 open. The veterans bar is a revolving door: it
  opens the wave, then the veteran dies, and only the ratchet
  remembers.

## WALL NUMBERS (this run's band, armed rows = control)

- national-ever 7/8, national-final 6/8, table invited 4/8, entered
  4/8, wins 4/8 — all lesser seat. Full seat 0/8.
- wave reach: wave-3 8/8, wave-4 6/8, wave-5 0/8. Median survival
  135d; max 180d. Deaths 234 total, starvation 5.
- The scale wall above national/table is untouched by a diag, as
  it should be: this run changed no game code. What this run adds
  is the decomposition of the wave-5 zero: 0 eligible moments,
  with the chain breaking at standing (2 seeds incl. the 50-peak),
  readiness-veterans (1 + the 73675 co-blocker), faced (3), and
  spawn-window (1) — never at spawn targeting.

## SENSE-TESTING READ (transcript, not just counts)

Read: evidence/2026-10-25/sim-spawnsrc-a-sense.txt — the shared
band's own transcript (seed 73671, days 1–60, same trajectories
this run reproduces byte-identically, so these are these villages'
early days, not a stranger's). Villagers read as people, not
counters: Landon hauling water and wood and cooking for the haven
("💧 Landon returns with 1L of creek water… 🪵 Landon hauls back
10 wood… 🍲 Landon cooked for the haven — meals stretched"), and
the quoted line that carries the whole sense judgment:

> ⚔️ Daniela stood down the Moderator and kept walking — 6 rounds,
> bloodied but breathing. It's still out there, somewhere.

A villager fights a wave-2 apex, survives, and the narration
remembers that the monster is still out there — consequence, not
just a count. The fire-side gossip fragments ("Grace telling Theo
about Daniela. Half of it's true anymore.") read as people talking
about people. Two carried wrinkles, stated not hidden: the
player-wait line repeats verbatim ("You wait. The light changes.
Nothing asks anything of you.") — the bot waiting, also seen by
any human waiter; and NO wave-4/5 moment exists in any transcript
sample I can quote, because wave 4's first birth on this seed is
day 179 and no sense sample covers the late days — the wave-4/5
evidence here is numbers and gate traces, not narration, and I am
not inventing a wave-4 scene to fill that gap. The sense judgment
stands for the village half of the brief; the escalation half is
proven by the census, not by prose.

## VILLAGE ASSESSMENT (plain words)

The villages are the poolpres villages again — literally,
trajectory for trajectory — so this run's news is entirely about
why the biggest monsters never arrive. The story in one line: the
village has to prove it can fight the last war before the System
sends the next one, and the proof keeps dying. A village can have
the standing, the armor, the weapons, and the tricks, and still be
held at the door because the one person who killed a big monster
is dead — and on the one seed where the standing already passed
200, that exact lock held the village below wave 4 for 35 days,
then wave 4 opened on the second-to-last day of the run and there
was simply no time left for a wave-4 monster to even appear, let
alone be fought and killed twice over. Where wave 4 did appear
early enough to meet, the village sometimes just never fought it
— a Mirror Draft monster stood in a raid and the village still
has no "faced" credit for it, because raiding is not fighting in
the deed book. And where a village did fight and kill a wave-4
monster, it was still 28 standing short of the wave-5 number.
Wave 5 is not being refused by the spawn lottery, and it is not
being held back by one broken gate: it is at the end of a chain
with five links, and on this band every village breaks a
different link before the end.

## BLANKS FILLED OR DOCUMENTED (this arm: classification only)

- FILLED (answered, with numbers): why wave 5 is never born on the
  shared band — per-seed classification above; spawn targeting
  exonerated with the 10/15 top-4 return rate; raid-pool presence
  ≠ faced (73672 eulogy); faced-without-birth via cast wanderers
  (73678 strike); plenty cap exonerated on the closest seed
  (73675 capped 227, blocked by defer5 veterans, not bread).
- DOCUMENTED (for a follow-up run, not chased here): (1) the
  veterans bar as a revolving door — unlock-day veterans dead by
  end on 73671/73672/73675/73677, peak ratchet the only memory;
  whether readiness should remember a dead veteran is a design
  question for a follow-up arm, not a finding this diag settles.
  (2) The wave-4 spawn window is thin by construction: only 15
  top-4 target calls in 8 runs (spawns are rare events — 309 calls
  in ~1,000 run-days), so even a village that unlocks wave 4
  mid-run meets few wave-4 monsters; late unlocks meet ~none.
  (3) The 73672 eulogy case — a wave-4 monster raids but is never
  "faced" — is a deed-book semantics question (does a raid fight
  count as facing?) for a follow-up arm to settle from code and
  canon, not from this census alone.

## METRIC REVIEW (mandatory, §14)

No metric revisions. The pre-registered DIAG-GO criteria (a)-(d)
were met exactly as written; the closed classification set was not
expanded mid-run (SPAWN4 was pre-registered as the births=0-at-
wave-4 case, and its detail carries the no-window explanation
plus the defer5 co-blocker rather than re-scoring the seed into
READINESS5 — the single-label rule is the pre-registered causal
order: birth precedes faced precedes veterans-for-wave-5, and the
co-blocker is named alongside, not substituted). One method note
for the NEXT run, not a revision of this one: the analyzer's
reconstructed proxy agreed with the harness final unlockedWave on
all 8 seeds for waves 4/5 (no RECONCILIATION notes) — the pure-read
reconstruction is validated on this band. The control-gate
headlines (deaths/national/wins/wave-4/wave-5) reproduced exactly,
so no baseline movement needs explaining.
