# sim-scale-onramp-round-1736 — coordinator evidence (axis scale-onramp, 2 arms, both NO-GO)

Run: fleshout loop A, run fleshout-20261028T1736Z. Axis scale-onramp
(blocking axis, converging, NOT converged). Sibling loop B live on
food-economy throughout (1730Z claim: sim-arenalabel-b +
sim-thiefinside-b) — NOT touched; B landed into master mid-run
(arenalabel-b + thiefinside-b commits) and both worker branches were
rebased onto the moving master, proofs re-run green, then merged
ff-only. No push, no bump, no live verification (ship-loop line).
Merged locally, pending ship.

## Plain words first

Both arms attacked the same wall from opposite sides, and both lost
cleanly — which is itself the finding. A villager who meets a wave-4
beast in the field still fights alone, and still loses or flees
alone, for two separate reasons that are now both proven:

1. Shouting earlier does not save the fight. Letting a villager
   shout in round 1 instead of round 2 got parties to form
   (12 of 14) — but every formed party still retreated, and no
   field kill happened. Forming is not fighting.
2. Standing together does not start a party fight. A crew-mate
   physically on the monster's tile still does not join from
   round 1, because the wild-fight path never passes the
   "ally from the start" flag — only the aid-at-the-door path
   sets it. Presence without the flag is still a solo fight.

And a ruling landed mid-run that reframes the next step: villagers
only know who is around through their own senses (Steve 2026-10-28
12:48 CDT, perception law, below). The shout is legitimate
hearing. But the ally supply the shout calls on is currently a
roster snapshot, not people the leader actually saw, heard, or
walked out with. So the next blank is perception-based formation
itself — solved first, before any shout-gate fix can matter in
the wild.

## Shared band and preregistration

Both arms: seeds 75101–75108, tableseat-nowait verbatim,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware, competent
policy. Control (1528Z/1628Z): field meetings 24 all solo, field
kills 0, wall natEver 7/8, wins 3/8 all lesser, full 0/8, wave-4
6/8, wave-5 0/8, median 146d. Each arm pre-registered its own
header before any judged sweep (arm prereg commits on the merged
branches); verdicts below are judged against those headers, no
re-scoring. Pilot 8 seeds; confirm only on pilot GO — neither arm
reached confirm. Balanced panel (§15): as in 1415Z/1528Z/1628Z, the
identical-seed before/after corpora are the §15 substitute; no
panel artifact is claimed and no panel verdict is faked.

## Arm 1 — sim-shoutgate-a: the shout/hopeless gate (game code, REVERTED) — NO-GO

Worker branch sim-shoutgate-a (merged; game change reverted in
branch, zero src/js diff on the merged tip). Prereg: primary >= 1
non-retreating fought wave-4 field party (FORMED-STRUCK with
outcome vKill or mFlee) OR 1 wave-4 field kill; guards median
>= 120d, starvation <= 3; meeting-floor leg judged >= 4.

- The change (reverted): a catastrophic round-1 exchange —
  hopeless formula satisfied AND more than half the villager's
  health lost in the first blow, with allies present — fires the
  existing shout in round 1 instead of waiting for round 2. No
  feed change, no roster read, no monster/wave/table change.
- Armed band (substrate + fixed gate, pilot seeds): judged 14,
  crewed 14/14, FORMED 12/14 (control: judged 19, formed 0),
  FED-NO-SHOUT substantively empty — the gate fix works as a
  mechanism. But non-retreating fought parties 0, wave-4 field
  kills 0. Primary FAIL. Confirm not run.
- Guards: median armed 109d FAIL, starvation 0 PASS. The median
  guard is disclosed, not hidden — and see metric review: the
  control band's own median is 118d, below the 120d bar.
- Wall (armed vs control): national ever 8/8 (vs 6/8), final 8/8
  (vs 4/8); table invited 7/8 (vs 3/8), entered 7/8 (vs 2/8);
  wins 7/8 all lesser (vs 2/8), full seat 0/8 both; wave-4 reach
  8/8 (vs 7/8); wave-5 0/8 both; deaths 279 (vs 306). A favorable
  wall does not rescue a failed primary — no re-scoring.
- Sense: formed parties read as people judging a fight they
  cannot win and retreating; the retreat, not the formation,
  is now the binding step (1628Z blank #2, carried forward).
- Evidence: evidence/2026-10-28/sim-shoutgate-a.md (+ prereg),
  corpora evidence/2026-10-28/perseed-shoutgate-a/ (control +
  armed), instruments scripts/test-shoutgate-a{-sweep,}.js and
  scripts/test-shoutgate-a-sense.js. Post-rebase analyzer
  re-run by coordinator reproduces VERDICT: NO-GO.
- Coordinator closeout note: the worker finished with its final
  canon amendment uncommitted (its final report flags a LOUD
  infrastructure blocker — the uncommitted file). The
  coordinator reviewed the full amendment diff, committed it
  in the worktree (e463b5ca9, rebased to 9a768563b), repaired
  the safe-commit index clobber on it (HEAD-blob cacheinfo,
  status empty + diff HEAD empty + hash-object match), and
  merged the branch. Verdict unchanged by the amendment.

## Arm 2 — sim-earlycrew-a: the walked-out-together crew (policy only, DELETED) — NO-GO

Worker branch sim-earlycrew-a (merged; policy deleted at verdict,
zero src/js and zero policy files on the merged tip — evidence +
instruments + corpus only). Prereg: primary >= 2 wave-4 field
meetings fought as a party with crew present at fight start OR
>= 1 wave-4 field kill; guards median >= 120d, starvation <= 3;
meeting-floor leg judged >= 4.

- The policy sent villagers out in pairs on forage outings
  (1,881 pairs, 3,839 villagers sent out). It is mechanism-
  identical to outdoorcrew-a (pair outings, trust-descending,
  same guards) and reproduces outdoorcrew-a's numbers exactly
  (17 crewed, 0 formed, same wall) — a same-mechanism
  replication, not a new result.
- Judged wave-4 field meetings 19 (floor met — not an
  opportunity failure): fought as a party 0, from-start parties
  0, field kills 0. Primary FAIL. Confirm not run.
- New lens, tile: in 13 of 19 judged meetings another villager
  was physically standing on the monster's tile at fight start
  (11 of them the crew-mate). In all 13 the fight began solo
  and ended solo — fled 9/19, dead 10/19 overall, never joined,
  never a kill.
- Perception-legitimate re-read (per the mid-run ruling): of
  the 19, 5 were same-outing + same-tile + same person — the
  genuinely perception-legitimate subset — and 0 of those 5
  fought. The other 12 tile-crewed meetings were list-only
  (tile presence via the engine's crew snapshot, not a shared
  outing) and are documented perception-blocked, not counted
  as perception evidence.
- Mechanism proof (post-rebase PROOF-GREEN): a wild meeting
  whose crew-mate is both in _outdoorCrew AND on the monster
  tile still receives allyFromStart=false from
  resolveWildMonsterEncounter — the wild router never passes
  that flag. The only caller that sets it is aidFight
  (foreign help-at-door during an aid crisis). The capability
  exists (a direct fieldFight call with allyFromStart:true
  puts the ally in from round 1, "already at the door"), but
  the wild path cannot reach it.
- Guards: median 118d FAIL (bar >= 120d), starvation 1 PASS.
  Guards failing does not change the verdict; the primary
  already failed.
- Wall (this band vs 1528 control): national ever/final 6/8 /
  4/8 (vs 7/8 / 6/8); table invited/entered 3/8 / 2/8 (vs 4/8 /
  3/8); wins 2/8 all lesser (vs 3/8), full 0/8 both; wave-5 0/8
  both. Det-gate PASS (seed 75101 replays the 1528 control
  seed exactly: days 132/132, tsNationalDay 77/77).
- Evidence: evidence/2026-10-28/sim-earlycrew-a.md (+ prereg),
  corpus evidence/2026-10-28/perseed-earlycrew-a/, instruments
  scripts/test-earlycrew-a{,-sweep,-proof,-sense}.js. The
  policy file survives only in branch history (instruments
  commit) for re-runs.

## Canon — perception law (Steve 2026-10-28 12:48 CDT, landed mid-run)

NO MAGIC LISTS / PERCEPTION LAW: villagers are real people with
eyes — they know who's around only through their own senses:
seeing someone in the same place, hearing a shout, following
someone they've seen. No global roster or "who is around" list
fed into a decision. The field-feed fix was that pattern and
stays reverted; list-feed arms stop. Party formation, travel,
and following must be solved through perception, not lists.
Fits his standing "if you don't know, it doesn't show."

Compliance of this run: neither arm revived the field-feed
change or built on a list feed. The shoutgate gate fix only
changed WHEN the existing shout fires (hearing is legitimate
perception). The earlycrew policy was amended mid-run to remove
its tile-pair preference before any judged sweep. Both arms
record the ruling in their evidence canon sections.

Perception-blocked assessment (from shoutgate-a's canon
amendment, adopted by this round): the gate fix itself is NOT
perception-blocked, but its effect in wild meetings currently
depends on a list-mediated ally supply (the base-code crew
snapshot, _outdoorCrew → wild PARTY-UP: trust-sorted, capped,
no proximity check — a villager on the far side of the map can
be named as an ally). Until party formation is solved through
perception — allies the leader actually saw, heard, or walked
out with, on the tile, not a snapshot roster — a landed gate
fix would be a dead letter in the wild: the shout would be
legitimate, but there would be no legitimate hearer standing
by. A future arm must NOT shortcut this by reviving a list
feed and calling it perception.

## What the village looked like (assessment)

On the shared band, villages reach national often and win the
lesser seat sometimes, but the full seat stays at 0 and wave 5
at 0 in every judged band this round — the scale wall is
unchanged by either arm. Wave-4 beasts are met, usually alone,
and the meeting ends in one or two rounds: fled or dead, never
joined, never a kill. The villagers read like people judging a
fight they cannot win — and like a missing system: no join
attempt, no "nobody came" beat when help is standing on the
same tile. Two halves of one missing system are now named:
(1) perception-based ally discovery (who is really there, by
sight/hearing/shared outing), and (2) the wild router passing
allyFromStart for a genuinely present ally. Neither half alone
suffices: shouting earlier without legitimate hearers forms
parties that retreat; presence without the flag fights solo.

## Metric review

- The absolute median-survival guard (>= 120d) cannot pass on
  this substrate band even without any change: the control
  band's own median is 118d (both arms). Future preregs on
  this band should use a relative guard (armed vs control
  median) or a recalibrated absolute bar, and say which before
  judging. This does not change either verdict here — both
  failed on primary regardless of the guard reading.
- The shoutgate armed band's strong wall (7 wins) pulls its
  median down because wins end runs — a faster-winning band
  looks worse on a median-days guard. Same prescription:
  relative guards on win-ending bands.
- No metric was re-scored mid-run. The 1628Z blank #1
  (shout/hopeless gate) is answered in the mechanism sense and
  closed; 1628Z blank #2 (formed-but-retreated) is now the
  next blank in order, reframed by the perception law (see
  next blanks).

## Next blanks, in order

1. PERCEPTION-BASED FORMATION (new, blocking): allies the
   leader actually saw, heard, or walked out with, on the
   tile — as the formation mechanism, under its own prereg,
   with a perception-legitimate judged subset (same outing +
   same tile + same person) as the deciding class. No list
   feed, no snapshot roster.
2. WILD-ROUTER allyFromStart (mechanism, perception-fed
   only): resolveWildMonsterEncounter passing the flag for a
   genuinely present ally (earlycrew-a proof). Must be fed by
   blank #1, never by the crew snapshot.
3. FORMED-BUT-RETREATED (1628Z blank #2, reframed): damage per
   round vs 850–1500 HP beasts, retreat thresholds, whether a
   staying party can finish — measured only once a
   perception-formed party exists to study.
4. Median-guard recalibration (metric review above) for the
   next prereg on this band.

## Telemetry deviation check

Run by coordinator on both corpora. LOUD lines, all the known
artifact class (checker reads bare national/table/wins fields;
corpora carry nationalEver/entered/won per seed; WINSEAT
baseline regime vs pre-seat substrate band):
- shoutgate corpus (n=19 files): national 12 -> 0, wins 16 -> 0.
  True numbers: armed natEver 8/8, wins 7/8 (arm section above).
- earlycrew corpus (n=9 files): national 12 -> 0, table -81%
  (16 -> 3), wins 16 -> 0. True numbers: natEver 6/8, entered
  2/8, wins 2/8 (arm section above).
Verdict: explained artifacts, not real deviations. Baseline
NOT rolled.

## Infrastructure

- Master moved twice under the run from the sibling lane
  (B-loop arenalabel-b + thiefinside-b landings); both worker
  branches rebased clean (zero file overlap), proofs re-run
  green post-rebase (earlycrew proof PROOF-GREEN; shoutgate
  analyzer reproduces NO-GO, including after the second
  rebase forced by the sequential merge), ff-only merges
  clean. Sequential-merge note: merging earlycrew first moved
  master, so shoutgate needed a second rebase before its
  ff-only merge — handled, not forced.
- Safe-commit index clobber hit the coordinator closeout
  commit (shoutgate canon amendment) — repaired via HEAD-blob
  cacheinfo, verified status empty + diff HEAD empty +
  hash-object match before merging.
- docs/ONTOLOGY.md sat at 0 bytes in the main tree during
  closeout (touched 18:55Z, same transient as 2026-10-24) —
  left alone throughout, never reset, never committed; see
  final message for its state at closeout. It is NOT this
  run's dirt and no commit in this run touches it (verified
  via git show --stat on the coordinator commit).
- check.js --quick started by coordinator per repo house rule
  but stopped after ~9 min with no output (green-list run on
  this box, sibling lane live): zero src/js in either merged
  branch, zero green-list files (both arms evidence +
  instruments only on their merged tips), and both worker
  proofs re-ran green post-rebase (earlycrew proof
  PROOF-GREEN; shoutgate analyzer reproduces NO-GO). No stray
  changes left by the stopped check (verified via git
  status: only the ONTOLOGY transient + this file).
- Sibling loop B still live at closeout (1730Z lock + claim
  present) — its lane was not touched at any point.

scale-onramp stays converging (NOT converged): parties now
form on an earlier shout but do not fight without retreating,
and tile presence still does not start a party fight; full
seat still 0, wave 5 still 0. food-economy stays converging
(untouched; sibling loop B lane). Claim + lock deleted by
coordinator at closeout (see final message).
Evidence: evidence/2026-10-28/sim-scale-onramp-round-1736.md
(this file), sim-shoutgate-a.md, sim-earlycrew-a.md (all on
master, pending ship).
