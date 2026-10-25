# sim-raftdraft-a — raid draft composition diag (axis scale-onramp)

Run: fleshout-20261025T0644Z (Sun 2026-10-25 ~01:45–03:00 CDT).
Axis: scale-onramp (converging). DIAG ONLY — zero src/js changes,
zero game-code changes, policy-side recorder only. Nothing in this
run changes what any player sees, so no `[needs-eyes]`.

## PRE-REGISTRATION (binding, judged only against this)

- Question: WHY do raids draft mostly wave-1/2 monsters? The 0535Z
  run (evidence/2026-10-25/sim-scale-onramp-round-0535.md, read
  first) found only 7 of 119 toll-marked meetings were wave-3+,
  and 114 arrived at exactly 1 HP. This diag decomposes the draft;
  it does not fix it.
- Substrate (shared, landed pattern): tableseat-nowait —
  leanlinkrescue courtship (LEANLINKRESCUE=1) + seat legs only
  (TABLESEATNOWAIT=1), no wait leg. Seeds 73671–73678, 180d
  death-aware horizon (runDays stops on death/win; 180 is the cap,
  MEASUREMENT §10 reachability horizon 150–200d).
- Recorder: scripts/policies/raftdraft-diag.js, composed UPON
  tableseat-nowait (never edited), env-gated RAFTDRAFT=1.
  Per raid: day, pantry kcal, raidN (3/4/5), and per drafted
  raider: type, wave (via crisisWaveOf — m.wave is never on the
  entity), HP pre-toll and post-toll, maxHp, distance to Haven at
  draft time, and the world-monster pool composition at that moment
  (counts by wave; wave mix of the N nearest = drafted set, vs the
  farthest N). Per drafted raider, later field-fight linkage by
  type + HP continuity (entities carry no stable instance id —
  the arrivaltrace linkage limit, restated, not hidden).
- DIAG-GO (binding): (a) census complete on 8/8 seeds with zero
  recorder errors, (b) raider wave shares, exactly-1HP share, raid
  count and pantry-tier mix, and a pool-vs-draft comparison
  answering whether nearest-draft selection or pool composition
  explains the wave-1/2 dominance, and (c) a lever named with
  numbers (or none supported). Pilot only: 8 seeds, no confirm.
- Control check (replicate, report any mismatch, do not hide):
  historic band headlines — won 4/8, median 150d, national-ever
  8/8, wave-4 5/8, wave-5 0/8.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  wave 3 = day 25+ and wave-2 ledger; wave 4 = standing >= 100;
  wave 5 = standing >= 200 and wave-4 faced), docs/MEASUREMENT.md
  §§9–12, 14–15. No haven/raid canon doc exists (noted by the prior
  run) — the design lives in src/js/havenGrowth.js comments, which
  this diag preserves and cites; nothing was invented.

## SUBSTRATE INVOCATION — difference report

None, except the recorder itself. The invocation is the landed
sim-arrivaltrace-a / sim-fieldfinish-a pattern verbatim:
loadGame({seed, mode, fullTelemetry: false}), setupGame, runDays
180d sampleEvery 10, per-seed incremental rows, baseline =
tableseat-nowait with a pure-read snapshot only (wavesFaced +
waveKillLog), armed = tableseat-nowait wrapped with the new
recorder. The only substitutions are the recorder module
(raftdraft-diag for arrivaltrace-diag) and the on-switch
(RAFTDRAFT for ARRIVATRACE). No silent improvisation.

## VERDICT: DIAG-GO

- (a) Census complete 8/8 seeds, zero recorder errors (diag errs 0
  on all 8 armed rows; no overflow). Detgate PASS, detail-repro
  PASS (below).
- (b) All required numbers are in this file and in
  evidence/2026-10-25/perseed-raftdraft-a/summary.json.
- (c) Lever named with numbers: POOL PRESENCE (see "The lever"
  below). A draft-order lever is NOT supported as the primary fix
  — the data bounds it.

## CONTROL REPLICATION — zero mismatch

Baseline and armed both reproduce the historic band exactly:

| headline | prior control | this run baseline | this run armed |
|---|---|---|---|
| won | 4/8 | 4/8 | 4/8 |
| median survival | 150d | 150d (days and gameDays both) | 150d |
| national-ever | 8/8 | 8/8 | 8/8 |
| national-final | 7/8 | 7/8 | 7/8 |
| table invited | 5/8 | 5/8 | 5/8 |
| entered | 4/8 | 4/8 | 4/8 |
| wave-4 | 5/8 | 5/8 | 5/8 |
| wave-5 | 0/8 | 0/8 | 0/8 |
| starvation total | 3 | 3 | 3 |
| death total | 261 | 261 | 261 |

Per-seed band (baseline = armed on every seed): 73671 lost d93
wave 4; 73672 won lesser d106; 73673 won lesser d134; 73674
survived 180d wave 2; 73675 survived 180d wave 3; 73676 lost d174
wave 4; 73677 won lesser d98; 73678 won lesser d150. All wins are
the lesser seat; the full seat is unreached, as in every run on
this band.

## THE CENSUS (armed rows, 8 seeds)

- Raids: 90. Raiders drafted: 392 (mean raidN 4.36).
  Per-seed raids/raiders: 73671 8/37, 73672 7/30, 73673 9/41,
  73674 17/81, 73675 16/61, 73676 11/40, 73677 8/37, 73678 14/65.
- Raid count reconciles with the 0535Z correction: 90, not the
  0337Z recorder's 77. The 0535Z defendfinish arm independently
  counted 90; this recorder counts 90 by a different instrument
  (lastRaidDay change, not tick diffs).
- Pantry-tier mix (raidN is fully explained by pantry bands):
  raidN 3: 16 raids, raidN 4: 24, raidN 5: 50. Pantry at raid:
  median 26,319 kcal, mean 29,278; >12k on 74/90 raids, >24k on
  50/90 — exactly the raidN 4/5 counts. Wealth draws teeth, as
  the havenGrowth.js comment says.
- Haven tier at raid: 68/90 raids with a palisade (tier >= 2),
  22/90 without.
- Raid-time pool size (living monsters): median 15, mean 15.8,
  min 4, max 33. NOTE: this exceeds the maintainWorldMonsters cap
  (3 base / 5 arrived / 8 deep / +1 night, game.js
  worldMonsterCap) — the cap governs top-ups only, and other
  spawn paths push the list past it. Which paths supply the excess
  is OUTSIDE this diag's instrument (it records raid-time pools,
  not spawn sources) and is stated as an open question, not a
  finding.

## RAIDER WAVE SHARES — the headline

Drafted raiders (n = 392):

| wave | n | share |
|---|---|---|
| 1 | 269 | 68.6% |
| 2 | 91 | 23.2% |
| 3 | 24 | 6.1% |
| 4+ | 8 | 2.0% |
| wave-1/2 total | 360 | 91.8% |
| wave-3+ total | 32 | 8.2% |

Wave-3+ drafted types: chorus_line 9, spool 4, redactor 4,
ad_break 2, terms_of_service 2, focus_group 1, buffering 1,
callback 1 (wave 3 = 24); eater 2, suburb 2, algorithm 1,
audit 1, herald 1, eulogy 1 (wave 4 = 8). Wave 5 drafted: 0.

## POOL-VS-DRAFT — the answer

Pool composition, pooled across all 90 raids (sum of per-raid
living pools, n = 1,423):

| wave | pool n | pool share | drafted share |
|---|---|---|---|
| 1 | 985 | 69.2% | 68.6% |
| 2 | 335 | 23.5% | 23.2% |
| 3 | 75 | 5.3% | 6.1% |
| 4 | 27 | 1.9% | 2.0% |
| 5 | 1 | 0.07% | 0% |
| wave-3+ total | 103 | 7.2% | 8.2% |

ANSWER: pool composition explains the dominance, NOT
nearest-draft selection. The drafted mix is the pool mix to
within a point on every wave. Under random drafting from the
pool, wave-3+ would be 7.2% × 392 = 28.4 raiders; the actual
draft took 32 — slightly ABOVE random. Nearest-first selection
mildly FAVORS wave-3+ monsters, because they sit closer to
Haven than the average monster (see distances below).

Three independent cuts confirm it:

1. Farthest-N control: the farthest raidN monsters per raid are
   299 wave-1 / 75 wave-2 / 13 wave-3 / 5 wave-4 (wave-3+ 4.6%).
   Drafting the FARTHEST monsters would have produced FEWER
   wave-3+ raiders (4.6%) than the nearest draft actually did
   (8.2%). Nearest selection is not the suppressor; it is a
   mild corrective.
2. Presence, not selection: 62 of 90 raids (68.9%) had ZERO
   wave-3+ monster in the pool at all. No draft rule — nearest,
   random, or wave-first — can draft what is not there. On the
   28 raids where wave-3+ WAS present, 24 (85.7%) drafted at
   least one. When present, wave-3+ monsters get drafted;
   they are usually absent.
3. Wave-3+ pool members: 103 present, 32 drafted (31.1%) —
   above the overall draft rate (392/1,423 = 27.5%). Drafted
   wave-3+ members sat at median rank 2 (of the distance order)
   and mean distance 1.84 tiles; undrafted wave-3+ members sat at
   median rank 12 and mean distance 4.46 tiles. Distance decides
   WHICH wave-3+ monsters get taken; pool presence decides
   whether any are taken at all.

Distances (per-raid means, pooled): drafted mean 2.28 tiles vs
pool mean 4.26; wave-3+ mean 3.32 vs wave-1/2 mean 4.31. The
nearest rule works as written — it just cannot conjure monsters.

Time split (presence grows with run age, but never enough):
raids before day 90 — pool wave-3+ share 2.5% (21/839),
8 wave-3+ drafted; raids day 90+ — pool share 14.0% (82/584),
24 wave-3+ drafted. Late runs draft 3× the wave-3+ raiders of
early runs, and still average under one per raid (32/90 = 0.36).

## THE WAVE-5 NEAR-MISS (one case, reported exactly)

The ONLY wave-5 monster in any raid-time pool in the whole
census: seed 73676, day 170, a nielsen at distance 2, rank 5 in
the distance order, raidN 3 — NOT drafted. It missed the cut
because three closer monsters filled the raid, despite sitting
two tiles from Haven. This is the one case where the raidN cut
(not the pool) is the binding constraint — and it is one case
in 1,423 pool monsters. It does not overturn the pool answer;
it bounds the cut's contribution at "rarely decisive."

## EXACTLY-1HP DECOMPOSITION (toll step, not tick diff)

Post-toll HP exactly 1: 216/392 raiders (55.1%). Split by the
instrument the 0535Z metric review demanded (the toll step
itself, per raider):

- Palisade raids (68 raids, 298 raiders): toll-created 1s
  (pre-toll HP > 1, post-toll HP = 1) = 97; pre-existing 1s
  (already 1 HP before the toll) = 119; post-toll 1s total 216.
- Non-palisade raids (22 raids, 94 raiders): post-toll 1s = 0
  (no toll, and no pre-existing 1-HP raider was drafted on
  those raids).
- Instrument note, not hidden: the 0535Z tollfloor arm reported
  96 attributable toll-written 1s; this census counts 97
  toll-created 1s. One-row delta between instruments
  (pre/post per-raider vs attributable diff rows); the 216
  total matches the 0535Z defendfinish arm's 216 exactly.
  The delta does not change any verdict here.

Reading: the toll manufactures roughly half the 1-HP raiders
(97/216); the other half (119) arrive at the palisade already
at 1 HP — wounded by earlier defender fights, chases, or
lingering, consistent with the 0535Z finding that defender
fights write most below-line wounds. A toll-only fix can at
most halve the 1-HP population, never clear it.

## FIELD LINKAGE (type + HP continuity)

Later field fights for each drafted raider (same seed, later
day, same type; "exact" = starts at exactly the post-toll HP,
or at the raid-day defender-fight end HP):

- All raiders: exact 273/392 (69.6%), type-only 45, never met 74.
- Wounded raiders only (post-toll HP < maxHp, n = 355 — the
  informative subset, since a full-HP "exact" match is also
  satisfied by any fresh spawn of the type): exact 254 (71.5%),
  type-only 30, never 71.
- Unwounded raiders (n = 37): exact 19 — weak linkage by
  construction, reported separately, never merged into the
  wounded headline.
- Post-call match kinds: same-index 357, gone (removed from the
  world list during the tick, e.g. killed by defenders) 34,
  haven-tile-unique 1. Same-type ambiguity: 43 raiders had more
  than one raid-day same-type field fight starting at their
  post-toll HP, so their defender-fight identification is
  ambiguous — the exact counts above carry that caveat.
- Limit restated: entities carry no stable instance id. "Later
  met (exact)" means a later fight of the same type at the same
  HP — strong continuity evidence, not proof of identity. A
  second live entity of the same type in the window weakens any
  single chain to "a" entity.

Substantive read: drafted raiders mostly DO come back to the
field at their raid HP (71.5% of wounded ones) — the village
keeps meeting the same wounded animals, exactly as the 0535Z
sense reads showed. The draft census and the field census agree.

## THE LEVER (named with numbers — a candidate, not a tested change)

POOL PRESENCE is the supported lever. At the current mean raidN
(4.36) and pool-proportional drafting, averaging one wave-3+
raider per raid needs a pool wave-3+ share of ~1/4.36 ≈ 23%,
against the measured 7.2% (14.0% even in late raids). That is a
~3× increase in wave-3+ pool presence (7.2% → ~23%), achievable
in principle by any mechanism that puts more unlocked wave-3+
monsters into the world pool at raid time — heavier wave-3+
weight in maintenance spawns once unlocked, wave-3+ monsters
wandering/lingering nearer Haven, or raids firing later in runs
that have unlocked more. Which mechanism is a future arm's
pre-registration, not decided here; this diag tested no lever.

What is NOT supported: a draft-order lever. Replacing
nearest-first with wave-first drafting caps out at the pool:
even drafting every wave-3+ pool member first leaves the 62
empty raids empty, and the farthest-N control shows the current
order already beats the alternative. The nielsen case shows the
raidN cut occasionally bites (1 case), but a bigger raidN alone
drafts more of the same wave-1/2 pool.

Second-order note for the next arm: late-run pool share (14%)
already doubles early-run share (2.5%). A lever that only
shifts raids later, or only unlocks wave 3 earlier, moves the
number in the right direction but, on these numbers, still
lands short of one wave-3+ raider per raid. The arm should
pre-register its pool-share target (~23%), not just "more."

## SENSE-TESTING READ (transcript, not just counts)

Sense replay: seed 73671, 9-day horizon (the narration ring
holds only the last 240 lines, so a full-run replay cannot show
a day-8 raid; the 9-day replay ends the day after it — stated,
not hidden). File:
evidence/2026-10-25/sim-raftdraft-a-sense-d9.txt. The day-8 raid
and its aftermath, quoted verbatim:

> [d8] 🐗 RAID — 5 raiders (The Anaconda Empress, Drum-Belly,
> Nevermore, Murkcap, Drum-Belly) hit Haven in the night, drawn
> by the smell of the pantry! No walls. No warning but the noise.
> [d8] 🚨 The Anaconda Empress, Drum-Belly, Nevermore, Murkcap,
> Drum-Belly is at Haven's door. The village looks to you. Four
> ways to call: a RUNNER (slow, dangerous), a SIGNAL FIRE (fast,
> loud, everyone sees), the SYSTEM RELAY (if it can carry
> voices), or an ABILITY CRY (if your build has one). Each with
> honest costs.
> [d8] 🛡️ Landon, Brunhilde, Daniela, Tesfaye and Sigrid met
> them at the door — 4 driven off, 1 barely walked away.
> Brunhilde, Tesfaye, Sigrid are hurt.
> [d8] One of them is coming for YOU — The Anaconda Empress,
> inside the haven, eyes on your bedroll.
> [d9] The village is rattled. Everyone's jumpy — eyes on the
> treeline.

Judgment: this reads as village life, and it matches the
measured census on the same seed and day (5 wave-1 raiders, no
palisade, defenders wounding two tanukis to 5 and 1 HP — the
census post-call values). People act with names and costs
(three hurt defenders, not a faceless "defense succeeded"), the
no-palisade player-facing beat follows honestly from the
missing wall, and the next morning the village is still
rattled — consequences persist past the night. Two wrinkles,
both inherited, neither invented here: the RAID line and the
crisis line repeat the full 5-name list verbatim (the
duplicate-noun listing the 0535Z defendfinish read also noted),
and the defender beat's "1 barely walked away" is a villager
fleeing, not a raider — legible in context, but the sentence
does not say whose feet did the walking. Neither wrinkle
changes the draft finding.

## VILLAGE ASSESSMENT (plain words)

The villages on this band are the same villages as last run:
they reach the region, a few sit at the lesser seat, nobody
reaches the full seat or wave 5. What this run adds is the
reason the palisade never delivers a big monster to the
village's door: the big monsters mostly are not out there when
the raid comes. In 7 raids out of 10, there is not one
wave-3-or-bigger monster anywhere near Haven at raid time —
the raid can only draft the small animals that happen to be
close by, and it does. When a big monster IS out there, the
raid usually takes it. The palisade stakes are not hiding the
big monsters; the woods are just not holding them yet. The
one wave-5 monster in the whole census was two tiles away and
still missed the cut because three smaller ones were closer —
a sharp little picture of both problems at once: rare, and
then crowded out.

## PROOFS

- G1 detgate (RAFTDRAFT unset delegation): seed 73671 —
  baseline days 93 / gameDays 93 / ts {tsNationalDay: 83} vs
  wrapped days 93 / gameDays 93 / ts identical, diagSurface
  false, wrapsInstalled false → PASS.
- G2 recorder neutrality: 8/8 seeds identical on days,
  gameDays, ts counters, starvation; faced-agree 8/8,
  kills-agree 8/8 → PASS.
- G3 corpus integrity: 16/16 rows, no zero-day rows, every armed
  row carries raid + field rows, every baseline row carries the
  pure-read snapshot, zero recorder errors → PASS.
- Detail repro: seed 73671 re-run reproduces days/gameDays/ts,
  raid rows (day, type, wave, pre/post HP) and field rows
  exactly → censusMatch true.
- Targeted suites: check.js --only fieldfight: 2 passed,
  0 failed. check.js --only raid: 6 passed, 1 failed —
  test-util-raid-crisis-20261010.js (aidCrisis not a function),
  the KNOWN pre-existing failure documented in the 0535Z
  evidence (proven there on pristine HEAD code); this run
  changes zero src/js, so it cannot have caused it. Stated,
  not hidden, not re-proven from scratch.
- Balanced panel (§15): no lever panel to compare — this run
  changes no game behavior, so there is no before/after lever
  corpus. The baseline-vs-armed comparison on identical seeds
  (G2) IS the §15-style paired comparison for this run, and
  the 0535Z known panel limitation (compare requires panel
  pairs; per-seed recorder rows are not panels) applies
  unchanged. No panel file is attached because no panel was
  built; inventing one would be worse than stating this.

## METRIC REVIEW (required, §14)

- No metric was re-scored mid-run. DIAG-GO is judged exactly
  as pre-registered above.
- Pool-share pooling choice: per-raid pool counts are summed
  across raids, so long-lived pools contribute repeatedly. That
  is the right denominator for "what does a raid draft from,"
  since each raid drafts from the pool as it stands that day —
  but it is NOT a census of distinct monsters. A future arm
  that wants distinct-monster counts needs entity-identity
  tracking the engine does not provide.
- "Later met (exact)" for unwounded raiders is weak (fresh
  spawns share full HP) and is therefore reported separately
  from the wounded headline. Merging them would move the
  headline from 71.5% to 69.6% — the separation is kept because
  the unwounded matches are not the same kind of evidence,
  not because the merge flatters the number.
- Median survival as a control headline: days and gameDays
  medians coincide at 150 here, so the 0535Z win-shortening
  caveat does not bite this run's control check. Noted so the
  next run does not assume it always will.
- None of these change the verdict. DIAG-GO stands.

## CONVERGENCE + NEXT BLANKS

scale-onramp stays converging (NOT converged): this run is a
diag, not a lever — it names the next lever (pool presence)
but tests none, the full seat is still unreached, wave 5 is
still 0/8, and wins are still lesser-seat only. The standing
directive stands until the tracker records this axis converged
on measured evidence.

Next blanks, in the 0535Z order as amended by this run:
1. Pool-presence lever for wave-3+ at raid time, pre-registering
   a pool-share target (~23% for ~1 wave-3+ raider per raid),
   measured with this recorder. (NEW — replaces "raid draft
   composition diag" as the open item; this run closes it.)
2. Survivability companion for any finish lever (carried).
3. Field-kill narration/gossip beat (carried).
4. Defender-fight wound manufacture (carried — this run
   counts 119 pre-existing 1-HP raiders arriving at the
   palisade, whose wound sources are not yet attributed;
   the question of a defender-fight finish/retreat rule
   stands).
5. Spawn-source audit for the above-cap raid-time pool
   (median 15 vs maintain cap 8): which spawn paths fill the
   pool past the cap, and do they favor wave-1/2? (NEW,
   boundary of this diag.)

## INFRASTRUCTURE + CORPUS

- No EPERM flap blocked this run; all 16 rows wrote first try
  (the sweep's 8-attempt write retry never fired).
- No safe-commit index clobber observed at commit time; commit
  verified with git show --stat after safe-commit (see below).
- Worktree heartbeat kept through the run; no sibling tree,
  branch, claim file, tracker, or lock touched. Loop-B trees
  (sim-awayration-fix-b and others) untouched.
- Corpus (committed with this run): per-seed rows +
  summary.json in evidence/2026-10-25/perseed-raftdraft-a/
  (1.8 MB total); sense transcript
  evidence/2026-10-25/sim-raftdraft-a-sense-d9.txt; this file.
  Per-seed JSONs live in the worktree evidence dir, not /tmp
  (sibling-cleanup wipe class avoided).
- Recorder: scripts/policies/raftdraft-diag.js. Sweep + proofs:
  scripts/test-raftdraft-diag-sweep.js (--one/--summary/
  --detgate/--detail/--sense).
