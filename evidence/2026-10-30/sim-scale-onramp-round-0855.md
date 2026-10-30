# sim-scale-onramp-round-0855 — unexplained-removal census + stalker-tick recorder

Run: flesh-out loop, run fleshout-20261030T0855Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Sibling loop B live on
food-economy the whole run (0830Z claim: warmthrestr2 +
woodshortline2, then further B trees) — NOT touched. This run worked
scale-onramp, taking the 0738Z run's ranked-next item (1) in order:
the unexplained-removal census + stalker-tick recorder. Not another
fight-price arm, not a damage buff, not a gate move.

Both arms DIAG ONLY, measurement only, zero src/js game changes, no
default flip, no gate move, no deed-bar move. Merged locally,
pending ship. No push, no version bump, no live verification (the
batch ship job owns deploys).

## Pre-registration (binding, per arm)

- sim-removal-a: prereg 276f3ceb6 (+ empty follow-up commit
  560405d7e, same message/tree, a retry-loop misfire during an
  EPERM flap — disclosed, no content change), committed BEFORE any
  judged analysis. Primary metric: removal-path classification of
  every wild wave-4 chain end on the band, with the 2 no-story
  chains + 3 unexplained (4,4) drops resolved. GO bars: prereg
  before judged analysis, 16/16 valid seeds, substrate rows
  byte-identical to chainclose (minus the additive `removal`
  field), every wild wave-4 chain end classified or honestly
  UNCLASSIFIED, the 2 chains + 3 drops each verdict or named
  missing instrument, determinism gate, sense bar. Horizon 180d
  death-aware; seeds 75101–75116; substrate tableseat-nowait
  exactly as chainclose used it.
- sim-stalkertick-a: prereg 6a95014e8 + correction #1 c755ac243
  (committed after pilot, before judged sweep — see below),
  committed BEFORE any judged analysis. Primary metric: daily
  stalker-tick trace (census + monsterTurn events + removal
  events) for every wild wave-4 individual, first sighting to
  removal/end. GO bars: prereg before judged analysis, 16/16
  valid seeds, substrate rows byte-identical to chainclose, tick
  trace covers every wild wave-4 individual, the vanished chains'
  tick paths reported day by day or honestly UNMEASURED,
  determinism gate, sense bar. Same band, horizon, substrate.

## Arm 1 — sim-removal-a: DIAG-GO (LANDED)

Commits (rebased onto aa0573202, fixtures + determinism re-run
green post-rebase, merged --ff-only): prereg 276f3ceb6 /
560405d7e, instruments 4532bc0ee (rebased cc6dca966),
evidence 6aa31bd0c (rebased 70ae4c83c). Proof on merged master:
scripts/test-removal-a.js FIXTURES-PASS 32/32.
Determinism: seed 75102 row + census byte-identical, scratch
removed. Substrate: all 16 rows minus the additive `removal`
field byte-identical to chainclose's corpus; joins 2257/2257,
join errors 0. Sense: all 4 chains' villager logs + matched
scholar traces + removal rows read end to end.

Plain words: the two beasts that vanished with no story did not
vanish by magic — one faded for losing the trail, the other was
drafted into a siege, wounded by the palisade toll, and finished
in a scholar's fight that the old hp-exact matching could not
see as the same beast. The instrument is a record-only
removeWorldMonster + spawnWorldMonster wrap capturing stack
function tokens, pre-removal fields, and an object-identity uid
shared with the enriched daily census — trajectories are uid
paths, never hp+tile guesses. tbEnd restores push the object
directly (no spawn row), so reappearance without a spawn row is
a restore, not a birth.

The 2 no-story chains:
- s75102 eulogy 853 (d57–61 at (4,4), gone d62):
  LOSTSIGHT-REMOVE. Removal seq 41, d62, lostSight=7 > 6,
  monsterTurn stack, no fight, no fled entry. The beast sat at
  the haven tile after its last meeting (d59) and faded for
  losing the trail.
- s75116 suburb 1285 (d140, roams d141–158, gone d159):
  SCHOLAR-MELT via a toll bridge. Same uid 29 throughout:
  spawned d140 (1300) → met d140 (1285) → roams → drafted to
  siege between d158–d159 snapshots (tile → (4,4), lingering
  flips true, hp 1285→960 = exactly round(1300×0.25) toll) →
  scholar fightSeq 23, d159, lift 960, lost, no restore.
  Scholarmelt's near-miss call stands under its hp-exact prereg;
  this arm proves with uid that the 960 lingerer IS the 1285
  beast. The draft event itself is not recorded (inferred from
  exact amount + tile + lingering flip + uid); identity is
  uid-proven.

The other 2 vanished chains (completeness):
- s75116 audit 785: SCHOLAR-MELT (cross-ref fightSeq 21, d140
  — scholarmelt's judged melt, corroborated by removal seq 48,
  uid 28).
- s75102 algorithm 959: SCHOLAR-MELT (EDGE). Removal seq 47,
  d71, startCombat, fightSeq 21, d71, lift 959, lost, no
  restore. EDGE because the removal day equals the chain's last
  meeting day, outside this prereg's primary window (lastSeen
  null → (71, 72]); meeting-then-fight is still the only order
  consistent with both events + gone by d72. A next-run
  [lastDay, firstAbsentDay] + part-stamped prereg would make it
  primary. Scholarmelt's chain verdict stays INSUFFICIENT-DATA
  — NOT promoted.

The 3 unexplained (4,4) drops (all reproduced, exactly one
matching fight each): all DROP-SCHOLAR-RESTORED-WOUND — a
scholar fight vs a lingering besieger, lost, whose fighter
wounds survive the restore. Defeat still wounds the siege.
- s75105 suburb 975→872 (d127→128): fightSeq 25, d128, lift
  975 → restored 872 (wound 103).
- s75114 reunion 900→745 (d125→126): fightSeq 29, d126, lift
  900 → restored 745 (wound 155).
- s75114 algorithm 750→624 (d158→159): fightSeq 42, d159, lift
  750 → restored 624 (wound 126).
Phase note: in all three, fight dayStart equals the drop's later
snapshot day (day-boundary phase, same as scholarmelt's audit
note); the hp-exact lift→restore match is the proof, not the
day label.

Band totals: 10 wild wave-4 chains — 4 BEAST-VANISHED (all
resolved), 4 NEVER-CROSSED, 2 VILLAGE-GONE, 0 FINISHED by
villagers, 0 UNCLASSIFIED. 29/29 uid-trajectory drops
classified, 0 DROP-UNCLASSIFIED (villager-fight 7,
scholar-restored-wound 4, raid-toll 18); per-id method finds
only 28 (misses s75102 reunion 1200→1185, a twin-pair artifact)
— uid method is strictly better. 27 wave-4-type removal rows
(all channels/flags, not a fight census): MELT 15, RESTORED 9,
LOSTSIGHT 2, KILL 1; FLED-BOLT, FLED-GAVE-UP, GLASSWING,
CURIOUS-FADE, TITAN-CLEANUP, CAMPAIGN-CLEAR have zero wave-4
rows this band (code-read classes, unobserved for wave-4).
Bonus resolution (not a chain end): s75113 eulogy, tolled
900→675 d113, LOSTSIGHT-removed d114.
Open, not guessed: why lingering fightSeq 23 was not restored
by tbEnd (restore needs an unoccupied origin tile; tile
occupancy at tbEnd is unrecorded).

## Arm 2 — sim-stalkertick-a: DIAG-GO (LANDED)

Commits (rebased onto 8aed42529, fixtures + determinism re-run
green post-rebase, merged --ff-only): prereg 6a95014e8
(rebased 7a9077bb5), instruments 4b50ee84d (rebased 41f4f9fef),
correction #1 c755ac243 (rebased b65a32678), evidence
ec2a9dbc1 (rebased e5e5daf60). Proof on merged master:
scripts/test-stalkertick-a.js FIXTURES-PASS 36/36.
Determinism: seed 75102 row JSON byte-identical AND tick
census JSON byte-identical, scratch removed. Pilot gate
(before full sweep): fixtures green + seed 75102 substrate
byte-identical to chainclose + determinism pass + lostSight
observable (turn events show the 0→7 climb). Pilot caught one
real instrument bug (correction #1) before the judged sweep.
GO legs, all PASS: completeness 16/16 (all recorders errs 0,
overflow empty, census sorted + last day within 1); substrate
16/16 rows-minus-stalkertick byte-identical to chainclose;
trace coverage (32 wild wave-4 traces, all 3 judged chains
EXACT instance matches with COMPLETE tick paths; 28,880 census
entries, 0 null lostSight); sense (3 judged traces + 5
survived traces + 3 near-miss climbs + second wave-4 lostSight
removal read end to end).

Plain words: the fading beast does not fade in one jump — it
loses the trail one unseen turn at a time, and the daily
census cannot see it happen at all. The eulogy's whole 0→7
climb lived between two daily snapshots. Only turn-by-turn
events show the climb, and only the seventh unseen turn
removes the beast — six ticks is not removal.

Tick paths:
- s75102 eulogy 853 — tick path CONFIRMS the carried
  LOSTSIGHT-REMOVE verdict on independent instrumentation:
  census LS 0 on d56–61 at (4,4), then seven consecutive
  monsterTurn ticks on d62 (0→1→2→3→4→5→6→7 REMOVED),
  removal event LS 7, inMonsterTurn=true, no fight live, HP
  853, tile (4,4).
- s75116 suburb 1285 — lostSight RULED OUT: LS 0 on all 18
  census days and all 11 removal-day turn events; removal LS 0
  with a fight live (removal object HP 960, lingering=true —
  the toll-bridge shape, corroboration of the carried
  SCHOLAR-MELT verdict, not a re-judgment).
- s75102 algorithm 959 — lostSight RULED OUT: LS 0 on all 13
  census days and all 3 turn events; removal LS 0 with a fight
  live, consistent with the carried SCHOLAR-MELT (EDGE)
  verdict. The same-day matching-window question is untouched.

Method findings (not just verdicts):
- Census-only lostSight observation is blind: the eulogy's
  0→7 climb lived entirely between daily censuses. Turn
  events are the required instrument for any tick claim.
- lostSight persists across day boundaries: s75113 eulogy
  climbs 0→5 on d113, then 5→7 + removal on d114 — not a
  per-day counter.
- Six ticks is not removal: s75113 suburb climbs to 6 then
  resets to 0 on being seen; only the 7th unseen turn removes.
- Prereg correction #1 (committed after pilot, before judged
  sweep): `lingering` is a MUTABLE flag on the same object
  (eulogy lingering=true d56–61 census, false at d62 removal;
  algorithm false→true→false), so "wild = lingering false on
  every snapshot" excluded the judged chains themselves.
  Corrected to wild = wave 4, not a titan, not lingering AT
  THE FATE OBSERVATION (removal event, else final census). A
  second wave-4 lostSight removal (s75113 eulogy) ended
  lingering=true, so it sits outside the wild-at-fate count
  but proves the mechanism fires for wave-4 beasts generally.
- Coverage limitation (stated, not hidden): turn events are
  tile-gated by construction (monsterTurn runs only for the
  scholar-tile monster); s75103/s75108 record zero monsterTurn
  events, and 16/32 wild instances never share the scholar tile
  for a turn. For those beasts the census LS 0 throughout is
  itself the structural answer.
- Phase note: the suburb is absent from the d159 census yet
  present in d159 turn events — the known snapshot-phase
  offset (scholarmelt's finding); tick conclusion unaffected
  (every observation reads 0).

Band numbers: 601 instances, 32 wild wave-4 (16 with ≥1
monsterTurn, 5 ever ticked; max-LS distribution 0:27, 1–3:2,
4–6:2, 7+:1); wild fates survived 20, LOSTSIGHT-REMOVE 1,
OTHER-REMOVE 11, NO-REMOVAL-EVENT 0; 313 removal events
band-wide, 4 lostSight removals (only 1 wild-at-fate wave-4);
3,887 turn events.

## Wall numbers (this run's judged corpora, report-only)

Both bands substrate-identical to chainclose, so the wall
numbers re-confirm rather than move: wins 9/16 (all lesser,
full 0), national ever 13/16, final 11/16, table 12/16,
entered 9/16, wave reach 16/16/14/9/0, median survival 118d,
deaths 527. Telemetry check vs scale-wall baseline: quiet
(16 seed rows, 0 non-row files skipped, 4 metrics, no large
deviations) — baseline NOT rolled forward; nothing deviated.

## Reachability verdict

Waves 1–4 reachable; wave 5 unreachable on this band (0/16);
the table reachable only through the lesser seat via
default-OFF instruments (entered 9/16); the full seat
unreached; wins only lesser, only via those instruments. The
two measurements close the vanishing-beast blank rather than
moving the wall: every wild wave-4 chain end on this band now
has a code path and, for the eulogy, a tick-by-tick mechanism.
What is still unmeasured is upstream of the wall: when a wild
beast becomes a siege draft (no draft event is recorded
anywhere), and whether the same-day window promotes the
algorithm chain to a primary melt.

## Village assessment (plain words)

The village in this band no longer watches beasts vanish for
no reason. One beast that camped on the haven tile faded
because nobody crossed its path for seven turns — a quiet,
rule-shaped disappearance, not a story anyone in the village
could tell, because nobody saw it happen. Another beast was
hauled into a siege, taxed a quarter of its strength by a wall
the villagers never see, and died in a scholar's fight that
the old records filed under a different name — the same
animal, misfiled. Even losing fights leave marks: scholars
who lose to besiegers still wound the siege, and those wounds
are what the old census read as mysterious drops. The wall
itself has not moved — no full seat, no wave 5 — but the
comings and goings behind it are now accounted for, beast by
beast, tick by tick.

## Metric review

Both preregs bound their runs and were honored: removal met
every bar (DIAG-GO); stalkertick met every bar (DIAG-GO).
Stalkertick's correction #1 (wild = fate-observation flags)
was committed after pilot but before the judged sweep, so it
is a correction, not a re-score; the judged chains were
carried from removal/scholarmelt, never re-judged, and the
same-day algorithm candidate was NOT promoted. No metric was
re-scored mid-run. Proposed for the NEXT run only: a
same-day matching window with part-stamped ordering in the
melt prereg (makes algorithm primary), and a census-phase
note in every sweep header (snapshot day = pre-meeting state;
fight dayStart can equal the drop's later snapshot day).

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0
on this band, as on every band this cycle. No axis is
converged. No gate number was moved on this evidence, per the
2026-10-29 gate-sequencing note (prove behavior normal before
tuning gates to it). The rotation file is NOT advanced on a
convergence-directed run: the standing directive suspends the
rotation until a run demonstrates national reached in sims.

## Infrastructure notes (disclosed, all repaired)

- The container EPERM flap on .git ref writes was ACTIVE at
  run start: the second worktree registration failed twice
  (checkout "unable to write file" + "Could not reset index
  file", then packed-refs.new write denials on deleting the
  empty leftover branch). No ref surgery was attempted. The
  flap cleared mid-run (branch deletion succeeded), the
  stalker-tick worktree was then registered at aa0573202, and
  both arms landed normally. The empty branch
  sim-stalkertick-a (exactly at master 2067af34e, zero work)
  was deleted after the flap cleared; nothing was lost.
- safe-commit hit the known index-clobber variant on both
  workers (bogus staged deletions, worktree files intact);
  repaired each time via update-index --cacheinfo from the
  HEAD blob and verified before proceeding. Commit contents
  verified correct in every case.
- Removal carries one empty follow-up commit (560405d7e,
  same message/tree as the prereg, retry-loop misfire during
  the flap) — disclosed, no content change.
- Test hygiene (from removal): calling process.exit() inside
  try skips the finally block and leaves scratch dirs behind;
  fixed in test-removal-a.js (exit only after finally runs).
- Sibling loop B landed its 0830Z round (b4dde2795) and a
  wall snapshot (8aed42529) mid-run; both arms rebased onto
  current master with proofs re-run green before merging.
  Loop B's trees and claim were never touched.

## Ranked next (NOT this run's work)

1. Same-day matching window with part-stamped ordering as a
   next-run scholarmelt prereg — makes the algorithm EDGE row
   primary.
2. Draft recorder — date the suburb bridge draft and the
   75116 audit pre-d133 draft directly; confirm the palisade
   condition instead of inferring it.
3. Blocked lingerer restore — record tbEnd origin-tile
   occupancy to explain why fightSeq 23 was not restored.
4. Uid-carrying chain matcher — hp-exact matching
   systematically misses drafted instances; match by census
   uid first, hp second.
5. Siege-flag lifecycle recorder — pin when wild instances
   become siege drafts (suburb 1285→960 conversion happens
   between censuses).
6. Scholar-tile-presence census — price how often the tick
   mechanism even gets a chance (16/32 wild instances never
   share the scholar tile for a turn).
7. Cross-wave lostSight census — 4 lostSight removals in 313
   removal events across waves 1–4.
8. Fled-class coverage — a band where a wave-4 beast flees
   across a grid edge would exercise FLED-BOLT/GAVE-UP.
9. Haven-anchor design question (steve-call): should a
   haven-pinned beast be able to lose sight and fade, or
   should haven presence anchor it?
