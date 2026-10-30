# sim-scale-onramp-round-1015 — same-day window + draft/siege-flag recorder

Run: flesh-out loop, run fleshout-20261030T1015Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Sibling loop B live on
food-economy the whole run (1030Z round: walktree + starveplenty,
landed mid-run) — NOT touched. This run worked scale-onramp, taking
the 0855Z run's ranked-next items (1) and (2)/(5) in order: the
same-day matching window with part-stamped ordering, and the draft
/ siege-flag lifecycle recorder. Not another fight-price arm, not a
damage buff, not a gate move.

Both arms DIAG ONLY, measurement only, zero src/js game changes, no
default flip, no gate move, no deed-bar move. Merged locally,
pending ship. No push, no version bump, no live verification (the
batch ship job owns deploys).

## Pre-registration (binding, per arm)

- sim-sameday-a: prereg 55e10e391 (rebased; worker original
  eb0ada8f8) + correction #1 48ab7c0cd (after pilot, before judged
  sweep: sameday recorder installed first/innermost so fieldparty's
  stack bytes match chainclose; stamp semantics unchanged),
  committed BEFORE any judged analysis. Primary metric: same-day
  window decision for the s75102 algorithm 959 chain under a
  part/sequence-stamped order rule. GO bars: prereg before judged
  analysis, pilot gate before the full sweep, 16/16 valid seeds,
  substrate rows byte-identical to chainclose minus additive
  fields, algorithm chain gets a primary verdict or a named missing
  instrument, determinism gate, sense bar. Horizon 180d
  death-aware; seeds 75101–75116; substrate tableseat-nowait
  exactly as chainclose used it.
- sim-draftflag-a: prereg b7b59d382 (rebased; worker original
  b2c580344), committed BEFORE any judged analysis. Primary
  metric: direct dating of both target siege drafts. GO bars:
  prereg before judged analysis, pilot gate before the full sweep,
  16/16 valid seeds, substrate rows byte-identical to chainclose
  minus additive fields, each target draft dated to a day/part
  window or honestly UNMEASURED with the named missing hook,
  determinism gate, sense bar. Same band, horizon, substrate.

## Arm 1 — sim-sameday-a: DIAG-GO (LANDED)

Commits (rebased onto 99b9da4e7, proof re-run green post-rebase,
merged --ff-only): prereg 55e10e391, correction 48ab7c0cd,
instruments 19b696fc8, evidence e3b0ea063. Proof on merged master:
scripts/test-sameday-a.js FIXTURES-PASS 39/39. Determinism: seed
75102 row + census byte-identical, scratch removed. Substrate: all
16 rows minus additive fields byte-identical to chainclose;
stripped census equals recurrence 16/16; own scholarmelt meetings
byte-identical to the committed scholarmelt corpus 16/16. Sameday
joins: meeting 2257/0, fight 424/0 (427 scholar rows minus 3
orphan-end rows, which have no start by construction).

Plain words: the beast that vanished on the same day it was last
seen did not vanish by magic either — it was met at night, and
later that same night a scholar fought it and it melted. The old
rule only counted fights on a later day, so it filed this one as
"not enough evidence." With the meeting and the fight stamped in
order, the order is provable, not guessed.

The decision, with the ordering proof stated numerically:
- Chain: s75102 algorithm, d65–d71, remaining HP 959,
  firstAbsentDay 72.
- Matched fight: fightSeq 21, d71, tile (4,4), wild, lift HP 959,
  lifted, fighter 959→957 alive, scholar died, result lost, no
  restore → SCHOLAR-FLEE-MELT.
- Meeting stamp: seq 98, day 71, dayPart 3 (night), partCounter
  283, Ursula, mHpStart 959 → mHpLeft 959.
- Fight stamp: seq 99, day 71, dayPart 3 (night), partCounter 283.
- Order judgment: meeting seq 98 < fight seq 99 AND meeting
  dayPart 3 ≤ fight dayPart 3 → ORDER-PROVEN. The day-part is the
  engine's own Game.dayPart (0 dawn, 1 midday, 2 dusk, 3 night);
  nothing fabricated; the sequence decides the tie within the
  shared night part. Removal corroboration from this corpus (never
  the verdict): removal seq 47, d71, hp 959, tile (4,4), uid 26,
  startCombat stack — exactly the prior arms' row.
- Scholarmelt's old verdict (INSUFFICIENT-DATA) stands under its
  prereg; this is a new judgment under the new prereg, kept
  separate in the evidence.

Other chains under the new window — only algorithm changes:
- s75102 eulogy: unchanged INSUFFICIENT-DATA (only near-miss is
  fightSeq 17 d62, bystander lift 146, not-lifted + hp-mismatch
  vs 853).
- s75116 audit: unchanged scholar-flee-melt (fightSeq 21 d140;
  stamps corroborate: meeting seq 195 d139 night → fight seq 196
  d140 dawn).
- s75116 suburb: unchanged INSUFFICIENT-DATA under this window
  (fightSeq 23 d159 still fails hp-exact, lift 960 vs chain 1285;
  its uid/toll identity proof stays with removal and was NOT
  imported as a promotion).
- No other same-day matched fight exists on the band; old-window
  verdicts recomputed agree with the quoted committed verdicts on
  all 4 chains.
- Band scholar census re-derived identically to scholarmelt (427
  fights; melts 63, wave-4 melts 15, wild melts 38; the 3
  UNCLASSIFIED are the same orphan rows, no lift, cannot affect
  any verdict).

## Arm 2 — sim-draftflag-a: DIAG-GO (LANDED)

Commits (rebased onto e3b0ea063, proof re-run green post-rebase,
merged --ff-only): prereg b7b59d382, instruments d92502d88, fix
0997d8a96, evidence b9925420c. Proof on merged master:
scripts/test-draftflag-a.js FIXTURES-PASS 62/62. Determinism: seed
75102 row + census byte-identical, scratch removed. Substrate: all
16 rows minus additive fields byte-identical to chainclose.
Pilot gate passed before the full sweep (fixtures + s75102
substrate-identical + pilot determinism + instrument observed
firing: 8 raids / 37 draft rows on the pilot seed).

Plain words: joining a siege is now a dated event, not a guess
from two snapshots. A beast walks in from the wild, the palisade
takes a quarter of its strength as a toll, and it becomes a
besieger on that day. And the scholar fight that should have put
one beast back failed for the smallest possible reason: a
one-strength fellow besieger was standing on its tile.

Verdicts, all from this run's own re-run corpus:
- Target 1 — s75116 suburb uid 29: DATED. Raid seq 26, day 158,
  palisade true, haven (4,4): hp 1285→960, toll 325 =
  round(1300×0.25), tollExact, tile (6,4)→(4,4), lingering
  false→true, raidBorn false→true. Pre-census d158 (1285,
  lingering false); gone by d159 via scholar fightSeq 23.
- Target 2 — s75116 audit uid 28: DATED. Raid seq 21, day 132,
  palisade true, haven (4,4): hp 1100→825, toll 275 =
  round(1100×0.25), tollExact, tile (3,4)→(4,4), lingering
  false→true. No pre-census exists (spawn row d132 is the
  pre-state); post-census d133 (825, lingering true). This day
  was undatable from the old corpus.
- Secondary — why fightSeq 23 was not restored: ANSWERED. tbEnd
  seq 27, day 159, result lost, restored false. The origin tile
  (4,4) was occupied before and after tbEnd by uid 33, the wave-3
  callback at 1 HP, itself floor-tolled 35→1 by the same d158
  raid (max(1, 35−65) = 1) and pinned at (4,4). The restore guard
  failed on a 1-HP fellow besieger holding the tile.
- Mechanism (code-read, havenGrowth.js): havenRaidTick is the
  only draft path (sole raidBorn setter, sole lingering-true
  setter); toll is round(maxHp×0.25) with a max(1, …) floor.
  Caveat carried honestly: per-raider order inside a single raid
  call is unmeasured (one wrap covers the loop); verdict
  granularity is per-call, which suffices for both targets.
  tollExact=false has two causes — defender-fight composition
  vs the 1-HP floor — and the evidence separates them per row.
- Band-wide: 180 fired raids, 785 draft rows (palisade true 139
  / false 41); wild wave-4 lingering flips — census-visible 15
  instances / 17 transitions vs draft-event 21 instances / 24
  rows (the census misses flips whose pre-state is a spawn row
  or post-state is a removal; the draft-event count is the
  complete one); census toll-shaped drops 16/16 matched to a
  draft event, 0 unexplained. Both targets' resolved uids equal
  the removal-corpus uids (28, 29).

## Wall numbers (this run's judged corpora, report-only)

Both bands substrate-identical to chainclose, so the wall numbers
re-confirm rather than move: wins 9/16 (all lesser, full 0),
national ever 13/16, final 11/16, table 12/16, entered 9/16, wave
reach 16/16/14/9/0, median survival 118d, deaths 527. Telemetry
check vs scale-wall baseline: quiet (16 seed rows from
perseed-sameday-a/s*-fresh.json, 0 non-row files skipped, 4
metrics, no large deviations) — baseline NOT rolled forward;
nothing deviated. Command: node scripts/telemetry-check.js
--baseline hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-30/perseed-sameday-a/s*-fresh.json'
--metrics national,table,wins,exiled --sweep-rows. (A first
attempt over the whole perseed-sameday-a dir counted 32 rows —
census files also carry a seed field — and was discarded; the
fresh-row glob is the 16-row count.)

## Reachability verdict

Waves 1–4 reachable; wave 5 unreachable on this band (0/16); the
table reachable only through the lesser seat via default-OFF
instruments (entered 9/16); the full seat unreached; wins only
lesser, only via those instruments. The two measurements close
two more vanishing-beast blanks rather than moving the wall:
every wild wave-4 chain end on this band now carries a primary
verdict across the three instruments (sameday + removal +
draftflag), and every siege draft on the band is a recorded event
with a day, a toll, and a palisade flag. What is still unmeasured
is downstream of the wall: how often restores fail on tile
occupancy band-wide, and whether the 1-HP blocker pattern is a
rarity or a rule.

## Village assessment (plain words)

The village in this band no longer watches beasts vanish for no
reason, on any day-boundary technicality. One beast met at night
died to a scholar later that same night, and the records can now
prove the meeting came first. Another beast was taxed a quarter
of its strength at the palisade and joined the siege on a dated
day — and the scholar who beat it could not put it back, because
a barely-living fellow besieger was standing on its tile. The
wall itself has not moved — no full seat, no wave 5 — but the
comings, joinings, and failed returns behind it are now
accounted for, beast by beast, day by day.

## Metric review

Both preregs bound their runs and were honored: sameday met every
bar (DIAG-GO); draftflag met every bar (DIAG-GO). Sameday's
correction #1 (install order) was committed after pilot but
before the judged sweep, so it is a correction, not a re-score;
stamp semantics were unchanged. No metric was re-scored mid-run.
Scholarmelt's old verdicts were not re-scored: sameday's
promotion is a new judgment under a new prereg, stated as such,
and suburb's uid/toll identity was NOT imported into the
hp-exact window. Proposed for the NEXT run only: a
blocked-restore census (analyzer over the tbEnd events already
in the draftflag corpus — no new recorder needed) as the
ranked-next #1, and a uid-carrying chain matcher as #2.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0
on this band, as on every band this cycle. No axis is
converged. No gate number was moved on this evidence, per the
2026-10-29 gate-sequencing note (prove behavior normal before
tuning gates to it). The rotation file is NOT advanced on a
convergence-directed run: the standing directive suspends the
rotation until a run demonstrates national reached in sims.

## Ranked next (NOT this run's work)

1. Blocked-restore census (generalize the 1-HP blocker
   band-wide): how often does a tbEnd restore fail on tile
   occupancy, and what occupies the tile (fellow lingerer? wild
   beast? the floor-tolled 1-HP class specifically)? The tbEnd
   events in the draftflag corpus already carry occupantBefore
   for every worldOrigin fight — the analyzer for it is a
   census, not a new recorder.
2. Uid-carrying chain matcher — match by census uid first, hp
   second, with the stamped window from this arm as the day rule.
3. Scholar-tile-presence census — price how often the tick
   mechanism even gets a chance (16/32 wild instances never
   share the scholar tile for a turn, per stalkertick).
4. Cross-wave lostSight census — 4 lostSight removals in 313
   removal events across waves 1–4.
5. Fled-class coverage — a band where a wave-4 beast flees
   across a grid edge would exercise FLED-BOLT/GAVE-UP.
6. Haven-anchor design question (steve-call): should a
   haven-pinned beast be able to lose sight and fade, or
   should haven presence anchor it?
7. 1-HP floor design question (steve-call if pursued): should a
   floor-tolled 1-HP besieger hold the haven tile against a
   fellow lingerer's restore, or should the restore
   displace/queue? Mechanism proven here; intent is not this
   run's call.
8. Witness/narration question (new, from sameday's sense flag):
   should a same-night meeting→fight sequence like Ursula's
   reach the village as a tellable story, or stay a
   measurement-only order?
9. Defender-identity recorder for raid nights (draftflag
   carried): name the defenders on fought raids; raid 25's
   callback fight has no named defender in any corpus.

## Infrastructure notes (disclosed, all repaired)

- Sibling loop B landed 5 commits on master mid-run (journey
  crisis r71, starveplenty, walktree) after both workers' bases;
  zero src/js overlap and zero file-path overlap with either arm.
  Both arms were rebased onto current master in their worktrees
  with proofs re-run green (sameday 39/39 + determinism,
  draftflag 62/62 + determinism) before their --ff-only merges.
  Sibling trees and claims were never touched.
- Draftflag's sweep copy bug (disclosed by the worker, verified
  by the coordinator via the removal-corpus diff): the sweep's
  evidDirOf default-dir replace missed path.join output, so
  default-dir runs wrote into perseed-removal-a, overwriting the
  committed removal rows. Caught via a missing summary.json,
  repaired by restoring the removal corpus from HEAD, and the
  fix was proven output-equivalent on seeds 75116 and 75102
  (scratch row + census byte-identical, scratch removed).
  Coordinator verification: git diff 66e3bb491..HEAD --
  evidence/2026-10-30/perseed-removal-a is 0 lines — the restore
  is complete, and no judged number in this run comes from the
  misdirected files. While the corpus was overwritten, any reader
  of perseed-removal-a would have seen draftflag rows (a
  superset, substrate-identical minus additive fields).
- safe-commit index-clobber variant hit both workers (bogus
  staged deletions, worktree files intact, commit contents
  verified correct); repaired each time via update-index
  --cacheinfo from the HEAD blob. No clobber on the coordinator
  commit — verified with git status below.
- At coordinator closeout, git status transiently showed
  sibling loop B's round-evidence file mid-commit (a staged
  deletion + untracked pair for the same path); by the next
  check the sibling had committed it and the tree was clean.
  It was never touched, staged, or committed by this run.
- Worktree registration was slow (large checkout, ~3.5 min for
  the first tree) and the original chained second registration
  failed once on a file-write error; the draftflag tree was
  then registered successfully in a separate call. No ref
  surgery was attempted at any point.
- Coordinator ordering note (learned from 0855, not repeated):
  both trees were released as done-merged only AFTER their
  --ff-only merges succeeded and were verified in git log.
