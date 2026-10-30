# sim-draftflag-a — draft / siege-flag lifecycle recorder (DIAG-GO)

**Verdict: DIAG-GO** (every GO bar met; both target drafts dated
directly from recorded raid events, palisade/toll condition
confirmed from recorded fields, secondary restore question
answered with the blocker identified).
Run: flesh-out loop, run fleshout-20261030T1015Z, worker
sim-draftflag-a, axis scale-onramp (blocking axis, converging,
NOT converged). Sibling loop B and the sibling sim-sameday-a
worker were live during this run — NOT touched. DIAG ONLY — no
game changes, no default flip, no gate move, no deed-bar move.
No [needs-eyes]: this arm changes no feel, combat, or UI — it
only records. Committed on branch, pending coordinator merge.
No push, no version bump, no live verification (the batch ship
job owns deploys).

Prereg: `evidence/2026-10-30/sim-draftflag-a-prereg.md` (committed
b2c580344, BEFORE any judged analysis).
Corpus: `evidence/2026-10-30/perseed-draftflag-a/` (row + enriched
census per seed, summary.json), analysis:
`evidence/2026-10-30/sim-draftflag-a-analysis.json`.
Instruments: `scripts/policies/draftflag-diag.js` (record-only
havenRaidTick + tbEnd wraps, DRAFTFLAG=1),
`scripts/sweep-draftflag-a.js`, `scripts/analyze-draftflag-a.js`,
fixtures `scripts/test-draftflag-a.js`. Reused verbatim, never
edited: tableseat-nowait policy, fieldparty-form-diag, w4dpr-diag,
breakline-diag, tilejoin-diag, shoutrec-diag, joinendlines-diag,
scholarmelt-diag, removal-diag.

## What was asked

Removal-a proved with object identity that two wild wave-4
beasts reached the siege through a toll bridge, but the draft
event itself was never recorded — only inferred from endpoints
(exact amount + haven tile + lingering flip + uid continuity).
This arm dates each draft directly with a within-day recorder,
confirms or refutes the palisade/toll condition from code +
recorded state instead of inferring it, and — as a secondary
leg — records tbEnd origin-tile occupancy to explain why
scholar fightSeq 23 was not restored.

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Prereg | committed before judged analysis | PASS — b2c580344 before any judged analysis |
| Pilot gate | fixtures + 1-seed determinism + substrate identity before full sweep | PASS — fixtures 62/62; pilot s75102 row-minus-additive byte-identical to chainclose; pilot determinism (two scratch runs) IDENTICAL; instrument observed 8 raids / 37 draft rows / 12 tbEnd-with-origin on the pilot seed |
| Seeds | 16/16 valid | PASS — 16/16 rows (days > 0, all recorder errs 0, overflow empty), census present/sorted/within-1 on all 16 |
| Substrate | every row minus additive fields (draftflag, scholarmelt, removal) byte-identical to chainclose | PASS — 16/16 |
| Targets | each target draft dated to day + seq + bracketing censuses, or honestly UNMEASURED with named missing hook | PASS — both DATED (see below), 0 UNMEASURED |
| Determinism | seed 75102 re-run, row + census byte-identical, scratch removed | PASS — DETERMINISM-PASS, scratch removed |
| Sense | judged chains' logs + traces read end to end | PASS — both target chains + the blocker chain read end to end (see sense section) |
| Fixtures | test script green before judged sweep analyzed | PASS — FIXTURES-PASS 62/62 |
| Band counts | lingering flips + toll-shape drops, counts not just targets | PASS — both census and draft-event counts reported (see band section) |

**Formal verdict is DIAG-GO.** Scholarmelt's and removal's
verdicts are carried, never re-judged: this arm dates the
drafts those arms inferred; it does not re-score their melts.

## The mechanism (read from code, now with recorded events)

havenRaidTick (havenGrowth.js, via the progDaily wrap every
endDay) is the ONLY draft path: raidBorn is set only there,
lingering is set true only there. On a fired raid it picks the
raidN nearest living world monsters to the haven tile, sets
raidBorn=true, moves each to the haven tile, and — if palisade
(havenTier() >= 2) — charges wall = round(maxHp x 0.25),
hp = max(1, hp - wall). Later in the SAME call, raiders nobody
meets flip lingering=true (defenders loop). The recorder wraps
havenRaidTick with a before/after world-monster diff, so one
recorded call carries the draft, the toll, and the lingering
flip together, with the call's day + a per-seed monotonic seq.
Per-raider order INSIDE one call is not hooked (one wrap covers
the whole loop) — all raiders in a call share the call's day +
seq, and the verdict granularity is per-call, as preregistered.
No draft step lacks a hook: the draft loop sits after every
early return, so a draft can only happen inside a fired call,
and the analyzer's cross-check (every census toll-shaped drop
matched to a draft event, 16/16) found no draft-shaped
transition without an event.

## Target 1 — DATED: s75116 suburb uid 29, draft day 158

- Chain (carried, re-verified in this corpus): spawned d140
  (1300/1300) at (6,4); met d140 (1300→1285, Miguel dies);
  census d141–158 at 1285, lingering false, roaming tiles;
  removal d159 hp 960, tile (4,4), lingering true, uid 29.
- Draft event: raid seq 26, day 158, palisade TRUE, haven
  (4,4). Draft row uid 29: hp 1285→960, toll 325 =
  round(1300 x 0.25), tollExact TRUE, tile (6,4)→(4,4),
  lingering false→true, raidBorn false→true.
- Bracketing: pre-census d158 (1285, (6,4), lingering false);
  no post-census (the beast is gone by d159 — it was lifted
  into scholar fightSeq 23 on d159 and melted there). The
  draft day 158 is the endDay of d158: the d158 census
  (daily-hook, pre-endDay) still shows the wild state, and
  the d159 removal shows the drafted state. The day label is
  the raid call's scholar.day, not an invented day-part.
- Palisade/toll condition: CONFIRMED from recorded fields
  (palisade true in the event's beforeCtx, toll == expected
  exactly, on maxHp as the code charges it).
- The d158 raid drafted four raiders, ALL undefended (every
  draft row lingeringAfter true — the defenders loop's else
  branch for all four, i.e. zero defenders met the raid that
  night; defender identities are not recorded by this
  instrument, and none are invented here): suburb 1285→960
  (exact), callback 35→1 (floor-capped, see secondary),
  eulogy 900→675 (exact), giant_mosquito 30→22 (exact).

## Target 2 — DATED: s75116 audit uid 28, draft day 132

- Chain (carried, re-verified in this corpus): spawned d132
  (1100/1100) at (3,4), lingering false; first census d133
  at 825, tile (4,4), lingering true; censused d133–139 at
  825 (lingering true d133–138, false d139); met d139
  (825→785, Miguel + Isabel, vFlee); removal d140 hp 785,
  tile (4,4), uid 28 (scholarmelt fightSeq 21, lost,
  fighter 785→661 alive, no restore).
- Draft event: raid seq 21, day 132, palisade TRUE, haven
  (4,4). Draft row uid 28: hp 1100→825, toll 275 =
  round(1100 x 0.25), tollExact TRUE, tile (3,4)→(4,4),
  lingering false→true, raidBorn false→true.
- Bracketing: NO pre-census exists (the spawn row d132 IS the
  pre-state — the draft fired in d132's endDay, after the
  spawn and before the first census); post-census d133
  (825, (4,4), lingering true). The draft day 132 was
  undatable from the old corpus; it is now a recorded event.
- Palisade/toll condition: CONFIRMED from recorded fields
  (palisade true, toll == expected exactly).
- The d132 raid drafted four raiders, all undefended (all
  lingeringAfter true): sweeps_week 20→15 (exact), alien_tick
  1→1 (floor: max(1, 1-11) = 1, toll 0 vs expected 11 —
  tollExact false by the floor, NOT by fight damage),
  landlord 90→67 (exact), audit 1100→825 (exact).
- Uid check: both targets' resolved uids in THIS corpus equal
  the removal-corpus uids (28, 29) — uid assignment order was
  not perturbed by the added recorders.

## Secondary — ANSWERED: why fightSeq 23 was not restored

- Match: scholarmelt fightSeq 23, d159, suburb lift 960,
  lingering true, result lost, fighter 960→885 alive,
  restoredIdentity false, restoredHp null — the same fight
  removal-a left open.
- tbEnd event: seq 27, day 159, result lost, origin uid 29
  (960, (4,4), lingering true), originInWorldBefore -1
  (lifted, as expected), restored FALSE.
- Blocker, identified: occupantBefore AND occupantAfter are
  the SAME entity — uid 33, the wave-3 callback, hp 1,
  tile (4,4), lingering true, raidBorn true. The tbEnd
  restore guard (`!monsterAt(o.tx, o.ty)`) failed because
  another lingerer held the haven tile.
- The blocker's own chain explains the 1 HP: spawned d148
  (260) at (5,4); raid seq 25 (d151) tolled + defender-fought
  it 260→35 (toll 225 vs expected 65 — tollExact false by
  fight damage, the defended composition); raid seq 26
  (d158) drafted it AGAIN, floor-tolling 35→1
  (max(1, 35-65) = 1, toll 34 vs expected 65 — tollExact
  false by the floor, NOT by fight damage) and pinning it
  at (4,4) lingering true. It was still there at the
  suburb's tbEnd, and still there after (census d159–160
  at (4,4), 1 HP, lingering true).
- So the suburb did not melt for lack of a restore rule —
  the rule ran and found the treeline tile occupied by a
  1-HP fellow besieger that the same raid had just
  floor-tolled into place. One tile, one monster per tile,
  and the siege continues with the blocker instead of the
  suburb. This is the secondary leg's answer, reported as
  secondary: it explains one melt, it does not change any
  primary verdict.

## Band-wide counts (not just the two targets)

- Raid events: 180 fired raids band-wide, 785 draft rows;
  palisade true 139 raids, false 41.
- Wild wave-4 instances (census: wave 4, non-titan): 38.
  Drafted at least once (draft rows): 25 instances, 28 rows
  (some re-drafted, e.g. the callback pattern in wave 3).
- Lingering flips, TWO numbers (prereg asked for both):
  census-visible false→true transitions: 15 instances,
  17 transitions. Draft-event false→true flips (wild
  wave-4): 21 instances, 24 rows. The census count
  undercounts by construction — it misses flips whose
  pre-state is a spawn row (audit) or whose post-state is
  a removal (suburb). The draft-event count is the complete
  one; the census count is reported so the gap is visible,
  not hidden.
- Toll-shaped census drops (drop == round(maxHp x 0.25)
  with a haven-tile move): 16 drops, 14 uids, ALL 16
  matched to a draft event (matched 16, unmatched 0, zero
  UNEXPLAINED-TRANSITION). The two targets are NOT in this
  list (neither has a census-to-census drop — audit lacks
  a pre-draft census, suburb lacks a post-draft census),
  which is exactly why the recorder, not the census, was
  needed for them.
- TollExact honesty note: tollExact false has TWO causes in
  this corpus and they must not be conflated — (a)
  defender-fight composition (toll + fight damage in one
  call, e.g. callback d151: 225 vs 65), (b) the max(1, ...)
  floor (hpAfter == 1 with hpBefore < expected, e.g.
  callback d158: 34 vs 65; alien_tick: 0 vs 11). The
  analyzer reports toll/tollExpected/hpAfter for every
  row so the cause is read, not assumed. Both targets are
  clean exact tolls (neither floored, neither fought).

## Wall numbers (this band's own corpus, report-only)

Identical to chainclose (a consequence of the byte-identical
rows, reported here as this run's own corpus, never as a
before/after): wins 9/16 (all lesser, full 0), national ever
13/16, national final 11/16, table reached 12/16, table
entered 9/16, wave reach 16/16/14/9/0, median survival 118d,
deaths 527. Telemetry vs the scale-wall baseline is the
coordinator's step (this worker reports the numbers, not the
baseline roll).

## Reachability verdict

Unchanged by this arm (measurement only): waves 1-4 reachable,
wave 5 unreachable on this band (0/16), the table reachable
only through the lesser seat, the full seat unreached. What
this arm changes is the wall's plumbing, not its height: the
two inferred toll bridges are now dated events with recorded
palisade flags, and the one blocked restore has a named
blocker. Nothing here moves a gate or a deed bar.

## Village assessment (plain words)

The village in this band no longer has to guess when a beast
joins the siege. Twice now the record catches the night it
happens: on one night nobody is home healthy to meet the
raid, and four beasts walk over the wall in the dark — the
wall takes its quarter-strength cut from each as they come
over, and all four stay at the treeline. One of them is the
great beast the village has been watching for eighteen days;
by morning it is a besieger, and by the next night it is
dead in the scholar's fight. The other night is the same
story with a smaller beast, drafted the very day it spawned,
taxed before it ever met a villager. And the siege has its
own traffic jam: the beast that should have come back after
the scholar's loss could not, because another wounded
besieger — itself taxed down to a single point of strength
by the same wall — was already standing on the one tile
where it would have returned. The wall wounds, the tile
holds one beast, and the loser melts. The village's hardest
beasts do not vanish anymore, and they do not join the siege
in secret anymore — each joining now has a night, a toll,
and a name.

## Sense notes (logs read end to end)

- SENSE-PASS on both targets + the blocker chain. Villager
  logs cohere with the draft events in every case: the
  audit chain's d139 meeting leaves the beast at 785
  (vFlee, Miguel + Isabel); the suburb chain's d140 meeting
  leaves it at 1285 (vDie, Miguel dies); the draft rows
  then move exactly those HP values across exactly the
  toll amounts, on nights when no field meeting intervenes.
- The d158 raid's all-lingering rows cohere with the
  absence of fieldparty meetings on s75116 days 157–160:
  raid-defense fights do not go through the fieldparty
  recorder, so no meeting log exists for them — but the
  zero-defenders deduction comes from the draft rows
  themselves (all four lingeringAfter true in a call whose
  defenders loop is the only lingering-true path), not from
  the absence of logs.
- Limitation, stated plainly (carried from removal): node-sim
  stubs Game.say to no-op, so there is no say transcript for
  any of this — evidence is the structured trace (draft
  events, census trajectories, removal rows, scholarmelt
  fights). The RAID narration lines are code text, not
  observed narration in this corpus; a browser play pass
  would be needed to hear them.
- A sense flag, not a verdict: the 1-HP floor means a raid
  can never toll a beast to death — the wall always leaves
  at least 1 HP standing on the treeline. Whether a 1-HP
  besieger SHOULD be able to block a fellow lingerer's
  restore (one tile, one monster) is a design question for
  a later arm, not a finding of this one. The mechanism is
  proven; its desirability is not this arm's call.

## Metric review

- The prereg bound the run and was honored: no metric was
  re-scored mid-run. Both targets dated under the
  preregistered rule (draft row with post-draft hp + haven
  tile + lingering true, palisade + tollExact confirmed).
  No correction was needed after the prereg commit.
- Two prereg-wording notes for the NEXT run (not revisions
  to this run's verdict): (a) "day/part window" resolved in
  practice to day + seq + bracketing censuses, because the
  raid path stamps no day-part field — a future prereg
  should say that outright instead of "day/part"; (b)
  "lingering flips" needs its instrument named (census
  transitions vs draft events) because the two counts
  differ systematically (15 vs 21 instances here) — future
  arms should preregister which count judges.
- The tollExact flag needs its floor cause named in the
  analyzer (hpAfter == 1 with hpBefore < expected) so a
  floor-capped toll is never misread as a fought toll.
  This arm reports the distinction in prose; a future
  analyzer revision could carry it as a field.
- Instrument lesson (disclosed, repaired in this run): see
  Infrastructure notes — the evidDirOf default bug. The
  lesson for future sweep copies: grep the new sweep for
  the OLD corpus dirname after copying; the header comment
  is not the code.

## Infrastructure notes (disclosed, all repaired)

- evidDirOf BUG + OVERWRITE + RESTORE (this run, caught by
  this worker before any judged analysis was committed on
  the wrong corpus): scripts/sweep-draftflag-a.js was copied
  from the removal sweep, and the string replace for the
  default EVID dir missed evidDirOf (its path is built with
  path.join, no trailing slash — the replace pattern
  required one). Every default-dir run (the first full
  sweep + the --summary runs) therefore wrote into
  perseed-removal-a, overwriting the committed removal
  rows with draftflag rows. Caught when --summary printed
  but no summary.json appeared in perseed-draftflag-a:
  the summary had gone to removal-a. Repair: (1) the
  removal corpus was restored from HEAD with
  `git checkout HEAD -- evidence/2026-10-30/perseed-removal-a`
  and verified with `git diff HEAD` = 0 lines (rows,
  censuses, summary all back to HEAD; the census files and
  summary.json were byte-identical anyway, only the 16
  row files had differed); (2) evidDirOf fixed to
  perseed-draftflag-a and grepped clean of the old
  dirname; (3) the corpus in perseed-draftflag-a comes
  from the foreground per-seed runs that passed EVID
  explicitly (byte-identical outputs — every per-seed
  line matched the first sweep's output), and the fixed
  sweep was proven output-equivalent on seeds 75116 and
  75102 (scratch row + census byte-identical to the
  corpus, scratch removed). No judged number in this
  evidence comes from the misdirected runs' files.
- Background-session red herring (corrected, not claimed):
  when the first full sweep's files did not appear under
  perseed-draftflag-a, the working theory was a
  background-exec filesystem loss. That theory was WRONG:
  the files were in perseed-removal-a all along (the
  evidDirOf bug). No filesystem-loss claim is made.
- safe-commit index-clobber variant (known class) hit both
  the prereg commit (1 file) and the instruments commit
  (4 files): bogus staged deletions, worktree files intact,
  commit contents verified correct; repaired each time via
  update-index --cacheinfo from the HEAD blob and verified
  `git status` clean before proceeding.
- The sibling sim-sameday-a worker's tree and claim were
  never touched. One caution for the coordinator: while
  the removal corpus was overwritten (between the first
  full sweep and the restore, same morning), any reader of
  perseed-removal-a would have seen draftflag rows (a
  superset: substrate-identical minus the additive
  fields). The restore is verified complete, so no action
  is needed — but the window is disclosed, not hidden.

## RANKED NEXT (with numbers — no lever built here)

1. SAME-DAY WINDOW + PART-STAMPED ORDERING (scholarmelt
   next-run prereg, still owed — sibling sim-sameday-a is
   live on it). The algorithm EDGE row becomes primary
   under a [lastDay, firstAbsentDay] window; this arm's
   day + seq stamps are the ordering instrument it needs.
2. BLOCKED-RESTORE CENSUS (the 1-HP blocker pattern,
   generalized): how often does a tbEnd restore fail on
   tile occupancy band-wide, and what occupies the tile
   (fellow lingerer? wild beast? the floor-tolled 1-HP
   class specifically)? This arm answers ONE case (uid 33
   blocks uid 29); the band rate is unmeasured. The tbEnd
   events in this corpus already carry occupantBefore for
   every worldOrigin fight — the analyzer for it is a
   census, not a new recorder.
3. 1-HP FLOOR DESIGN QUESTION (steve-call if pursued):
   should a floor-tolled 1-HP besieger hold the haven tile
   against a fellow lingerer's restore, or should the
   restore displace/queue? Mechanism proven here; intent
   is not this arm's call.
4. DEFENDER-IDENTITY RECORDER for raid nights: this arm
   deduces "zero defenders" from all-lingering rows but
   records no defender roster for fought raids (raid 25's
   callback fight has no named defender in any corpus).
   A resolveWildMonsterEncounter raid:true recorder would
   name them.
5. UID-CARRYING CHAIN MATCHER (carried): hp-exact chain
   matching systematically misses drafted instances; future
   chain arms should match by census uid first, hp second.
   This arm's target resolution (spawn→removal uid
   continuity) is the pattern to reuse.
6. FLED-CLASS COVERAGE (carried): FLED-BOLT / FLED-GAVE-UP
   (and CAMPAIGN-CLEAR / TITAN-FALL-CLEANUP) still have
   zero wave-4 rows on this band. A band where a wave-4
   beast flees across a grid edge would exercise them.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0
on this band, as on every band this cycle. No axis is
converged. No gate number was moved on this evidence, per the
2026-10-29 gate-sequencing note (prove behavior normal before
tuning gates to it). What converged further is the draft
plumbing: the siege-joining event is now a recorded event
with a day, a toll, and a palisade flag — not an inference —
for both targets, and for every toll-shaped census drop on
the band (16/16 matched).
