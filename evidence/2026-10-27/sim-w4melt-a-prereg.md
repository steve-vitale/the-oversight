# sim-w4melt-a — PRE-REGISTRATION (binding, written BEFORE any sweep)

Run: fleshout loop A, run fleshout-loop-a-20261027T0840Z, axis scale-onramp.
Arm: sim-w4melt-a — CLASSIFY THE WAVE-4 MELT DOOR on the w4funnel-repin band.
DIAG ONLY — zero src/js changes, zero default flips, no game lever,
no game-lever proposal. The deliverable is measurement, not a fix:
do not change melt behavior. No [needs-eyes] flag applies (DIAG
measurement only, no feel/combat/UI change; said explicitly).

## BASE AND REBASE (done before this file was written, verified)

- Worktree branch sim-w4melt-a was created at a2e3e2719 (ledgerbound-b
  evidence). It had NO unique commits of its own: `git log master..HEAD`
  was empty, and HEAD was an ancestor of master.
- Rebase onto current master tip 3a12db1aa (journey crisis r54)
  completed CLEAN, no conflicts, no file changes from the rebase
  itself. Post-rebase HEAD == 3a12db1aa == main-tree master tip.
- Master movement since the w4funnel-repin base fc57dd0bd is ONLY
  evidence/scripts commits (repin prereg/sweep/evidence,
  finalloss-rebase-a, journey-landing r60, coordinator 0755,
  ledgerbound-b) plus r54, whose message states "no src change"
  (episode/death/contest instrument fixes). The five reused
  recorders hash IDENTICALLY to the repin prereg (see below), so
  the game behavior on this band is expected identical — but the
  melt-set movement rule below still applies, and any deviation
  is reported, never absorbed.

## CANON READ FIRST

- docs/CANON.md, docs/MONSTER-WAVES.md. Wave law used here, read
  from canon + code (never invented): wave 4 = The Mirror Draft,
  standing >= 100 (blood / bonds / bread, pure or hybrid).
  Readiness gates hold wave 4: 3 armored @ P>=10 / 5 armed /
  3 tricks / 1 living wave-3+ killer.
- Melt mechanism, read from code BEFORE sweeping (never invented):
  - game.js startCombat (~l33080): the player-tile monster is
    lifted via removeWorldMonster ONLY when it IS one of this
    fight's monsters (_originIsFighter — by fighter id or mdef
    id match). A bystander stays on its tile (journey-scale r42
    bystander hold: lifting a bystander on contest/trial fights
    silently deleted full-health wave-4 lingerers). No worldOrigin
    is recorded for a bystander.
  - game.js startCombat (~l33104): tbfight.worldOrigin is set
    ONLY when the lifted origin is a fighter AND (titan OR
    lingering). A besieging raider (m.lingering, set in
    havenGrowth.js when a drafted raider is met by no defender
    at a raid) is lifted the same way.
  - game.js tbEnd (~l43576): the worldOrigin restore runs only
    on result !== 'won'. A lingerer restores ONLY on 'fled' or
    'lost' (lingererKeeps); a routed lingerer does NOT restore.
    A titan restores on any non-won result if still standing.
    Restore requires a standing fighter of the origin's id
    (stillUp: some alive fighter, or no fighter of that id at
    all) AND the origin tile unoccupied (no monsterAt(tx,ty)).
    A restored lingerer comes back WOUNDED (fighter HP, floored
    at 1), re-placed at the village tile; a restored titan comes
    back at full HP. Every other lifted monster is never put
    back: it melts.
  - Consequence fixed in advance: a melt after a LOST fight
    with a non-titan non-lingerer origin is the plain door. A
    melt after a lost fight with a LINGERER origin is NOT the
    plain door — it means the restore failed for a named reason
    (fighter dead at tbEnd, i.e. stillUp false; or the origin
    tile occupied; or worldOrigin never set). The new
    instrument records exactly that reason, per fight. A melt
    with no lift row at all (bystander lifted by another fight)
    would be the r41 class — the r42 hold says it should not
    occur on this base; if one occurs it is reported as its own
    class, never folded into the fought melts.

## CONTEXT READ FIRST

- evidence/2026-10-27/sim-w4funnel-repin-a.md and its prereg
  (the band being classified: 31 wave-4 arrivals, 5 melted,
  all after lost TB fights; the census table, definitions,
  and control band are inherited verbatim).
- Sim-findings backlog lines: 2026-10-27 melt-is-real-funnel-
  exit (this arm's charter); 2026-10-25 TB bystander melt #1054;
  2026-10-26 tbmelt census #1062 — do NOT re-run the tbmelt
  census (different band, different waves: 7 melts/128 TB
  fights, waves w1 4/w2 2/w3 1/w4 0, doors wanderer-pending 4
  + contest-arena 3). This arm's 5 melts are wave-4 melts on
  the repin band and must never be conflated with that census.
- evidence/2026-10-26/sim-tbmelt-a.md (tbEnd restore rule
  citation source: startCombat lifts via removeWorldMonster,
  worldOrigin only for titan/lingering, restore on non-won
  with the lingerer fled/lost restriction).

## SUBSTRATE (fixed before sweeping)

- Seeds 73671-73678 (identical seeds, always).
- Policy: scripts/policies/tableseat-nowait.js, composed upon,
  NEVER edited (LEANLINKRESCUE=1, TABLESEATNOWAIT=1).
- Horizon: 180d death-aware (runDays stops on death/win; 180
  is the cap, not a fixed horizon — MEASUREMENT §10).
- Two arms, same seeds, same substrate:
  - PLAIN: tableseat-nowait with NO recorders.
  - ARMED: tableseat-nowait + the SIX recorders below.
- Plain runs FIRST. The armed band must reproduce plain EXACTLY
  on every shared field (days, gameDays, endReason, won,
  waveReach, maxArc, finalRank, maxRank, nationalEver,
  nationalFinal, table, entered, deathTotal, starvationDeaths,
  faced, waveKillLog entries) or STOP and report the deviation
  — never judge on a moved baseline.

## THE 5 MELTS TO CLASSIFY (from w4funnel-repin-a, targets)

- 73671 reunion, born d153, removal d167 (14 days to removal).
- 73675 eater, born d106, removal d145 (39 days to removal).
- 73675 eulogy, born d139, removal d145 (6 days to removal).
- 73675 suburb, born d150, removal d167 (17 days to removal).
- 73677 suburb, born d114, removal d123 (9 days to removal).
All five classified in repin as player-fight-melt after lost
TB fights. Days-to-removal here is removal day minus BIRTH
day (the repin census convention); the new instrument ALSO
reports fight day to removal day (the melt lag after the
losing fight), which is the mechanistically meaningful lag.

## INSTRUMENTS (recorders reused VERBATIM from current master, never edited)

- scripts/policies/raftdraft-diag.js (raid draft census + final
  waveKillLog snapshot), spawnsrc-diag.js (birth source + seq
  tags), oldcore-diag.js (birth -> removal fate per entity,
  tbEnd settlements), w5births-diag.js (daily rd5.veterans),
  defwound-diag.js (resolve rows per entity instance).
- sha256 at this base (IDENTICAL to the repin prereg — the
  verbatim claim, re-checked here, never edited):
  raftdraft 5aef723cb3c902bee6d03eb9b40f8194bbd616a7798049f226c1417194e10b97,
  spawnsrc 31c496ac41e1213095b3b25854a6c7e584cc05c0bbb255e39c9376a0a3da4e17,
  oldcore efedd0cd0999d9f1b4987671b1da791109579ebdf72bb97d7478dc85c6e706cd,
  w5births b2f2d909f0bdc8a3d4bb2fd40e6d70d7a7a578da169e4b3d49ab63b7b0da1ebe,
  defwound 3f3f8eed58bb1a4bf02e124ae47f0ff5255a059339898cc93b1231bcb1fd9401.
- NEW this run, policy-side only, zero src/js changes:
  scripts/policies/w4melt-diag.js (W4MELT=1), installed
  OUTERMOST (last, after the five). It wraps Game.startCombat
  (pre-call: player-tile monster id/seq/wave/hp/titan/
  lingering/lingerSince/tile; post-call: fight monster fighter
  ids, whether the tile monster was lifted, whether
  tbfight.worldOrigin was set) and Game.tbEnd (pre-call:
  result, worldOrigin presence/seq, monster fighters alive/hp,
  origin-tile occupancy; post-call: restored presence, HP
  after restore) plus a daily snapshot of wave-4 present
  entities (seq/type/hp/maxHp/lingering/lingerSince/titan/
  tile) — the post-fight HP path. Pure reads only: writes
  nothing to game state, draws no RNG, never throws into the
  engine (recording errors counted), returns original values
  untouched. Unset, it delegates byte-identically (no wraps,
  no ctx surface) — the detgate proves it.
- New sweep-side only (no recorder edits):
  scripts/test-w4melt-diag-sweep.js — the repin sweep copied
  with (1) evidence dir evidence/2026-10-27/perseed-w4melt-a/,
  (2) the sixth recorder in the armed arm and in the detgate,
  (3) a summary that judges armed-vs-plain exactness on the
  shared fields above AND prints the melt census from the
  corpus (oldcore removals + w4melt settlements joined), (4)
  corpusOk extended to w4melt errs 0 + no overflow.
- Analyzer reused VERBATIM: scripts/test-w4funnel-diag.js
  (takes the corpus dir as argv; writes analysis.json).
  Unit proof scripts/test-w4funnel-a.js runs 48/48 BEFORE any
  sweep and is re-run after.
- New proof validator: scripts/test-w4melt-a.js (pure corpus
  analysis, no harness, no RNG): re-derives the plain band,
  the armed band, the plain-vs-armed exactness, the corpus
  error counts, the melt set, and each DIAG-GO leg from the
  corpus files, and exits non-zero on any mismatch with the
  evidence numbers it is given. Written BEFORE the sweep; run
  AFTER. It reports the melt-set comparison against the repin
  5 as MATCH or MOVED (report-only, never a gate failure —
  see the melt-set movement rule).
- New sense script: scripts/test-w4melt-sense.js — the repin
  sense pattern parameterized by SEED/DAYS (NON-MEASURED
  replay only; replay text never enters any count).

## DEFINITIONS (verbatim from w4funnel-repin-a unless noted)

- ARRIVAL, OUTCOME classes, FOUGHT, LIVING/CUMULATIVE: as in
  the repin prereg (arrival = wave-4 birth joined on seq;
  outcome precedence still-present > pending > last-removal-
  kind mapping; melted = player-fight-melt).
- FIGHT-CLASS of a melt (new, fixed here): FOUGHT-ENTITY =
  the melted seq has a w4melt lift row for the same fight
  (tile monster lifted AND its id among the fight's monster
  fighters); BYSTANDER = the melted seq has a removal with
  hint tbEnd but NO lift row for that fight (lifted by
  another fight's startCombat — the r41 class); UNLIFTED =
  no tbEnd row for the seq at all (removal via another path
  — would contradict the repin classification and is reported
  as its own finding).
- LINGERER/RAIDER STATE (new, fixed here): from the w4melt
  lift row — lingering flag + lingerSince day at lift
  (lingerSince is stamped when the raider starts besieging,
  havenGrowth.js; a lingerer IS a raider nobody met). Titan
  flag likewise. RAIDER-HISTORY (analysis join): whether the
  seq appears in a raftdraft raid pool/draft is NOT asserted
  from raftdraft rows alone (raiders carry no seq in that
  recorder) — the lingerer flag at lift is the raider-state
  evidence; any raid-pool join is reported as type/hp/tile
  matching, never as seq proof.
- NO-RESTORE REASON (new, fixed here): from the w4melt tbEnd
  pre-call row for the melt's fight — fighter-dead (no alive
  fighter of the origin's id at tbEnd), tile-occupied (a
  monster sits on the origin tile at tbEnd), worldOrigin-
  unset (no worldOrigin recorded for the fight), or
  result-not-restorable (result 'won' — a kill, not a melt;
  or a lingerer on 'routed' — restore refused by rule).
  Exactly one reason is named per melt; if none applies, the
  melt is UNEXPLAINED and leg (a) fails.
- DAYS-TO-REMOVAL: birth day to removal day (repin
  convention) AND fight day to removal day (melt lag).
  Both reported per melt.
- FOLLOW-UP (new, fixed here): for each melt's seq, the
  removal kind + day that FOLLOWS its last tbEnd (melt vs
  linger vs depart vs still-present), read from oldcore
  removals + final present list with the re-appearance rule
  (a seq present after its removal cancels the exit). For
  the 5 melts the follow-up is the melt removal itself; for
  the contrast lingerers (73671 eulogy d132, 73675 reunion
  d152, 73677 influencer d96) the follow-up is re-entry /
  still-present / kill, reported alongside.
- POST-FIGHT HP PATH (new, fixed here): hp at lift, fighter
  HP at tbEnd, HP after restore if restored, and the daily
  w4melt snapshot HP series for the seq after the fight
  (for melts: the series ends at the fight — reported as
  ended, never extrapolated).

## CLUSTERING TEST (fixed here, tested not assumed)

- d145 pair (same seed 73675, eater + eulogy, both removal
  d145): TESTED by (1) whether d145 is a raid day on 73675
  (raftdraft raids day list for that seed), (2) whether both
  melts' losing fights fall on d145 itself (same fight day,
  not just same removal day), (3) whether both entities
  share a lingerSince day (same besieging raid). A shared
  raid day + shared fight day + shared lingerSince would
  support a shared-cause reading; any leg failing keeps the
  pair as a coincidence of the same run, reported as such.
- d167 pair (cross-seed: 73671 reunion + 73675 suburb, both
  removal d167): a shared calendar day across DIFFERENT
  seeds is NOT a shared cause — stated plainly regardless
  of any other result. Tested per seed separately: is d167
  a raid day on 73671? on 73675? are the losing fights on
  d167 in each seed? The verdict for this pair is fixed in
  advance: NO shared-cause claim across seeds, whatever the
  per-seed raid-day answers are.
- Siege-day note, fixed here: lingering gorges happen nightly
  (havenGrowthDaily), not on event days — there is no single
  "siege day" to cluster on. The testable events are raid
  days and fight days; a "siege-day cluster" claim would
  require a named siege event day, and none exists in the
  corpus vocabulary. If no raid-day membership is found for
  a pair, the verdict is "no raid-day cluster", not "siege
  cluster by another name".

## SENSE PLAN (selection rule fixed before sweeping)

- Sense thread = 73675's d145 pair (eater + eulogy), fixed
  here because it is the clustering question itself. Its
  census timeline is the authoritative thread. A NON-MEASURED
  narration replay (scripts/test-w4melt-sense.js, SEED=73675
  DAYS=169, window d139-169) is run for wording/meaning only;
  if the replay's trajectory shifts past the census thread,
  the divergence is disclosed, not hidden, and the replay
  proves wording only. Replay text never enters any count.

## MELT-SET MOVEMENT RULE (fixed now, not decided after seeing numbers)

- If the new base's wave-4 melt set differs from the repin 5
  (different seqs, days, or count), that is BASE MOVEMENT
  (r54 instrument fixes or a recorder interaction), reported
  field by field, and the DIAG-GO legs apply to the ACTUAL
  band melts, not the repin 5. The validator reports
  MATCH/MOVED; MOVED is never a gate failure and never a
  reason to stop. Only armed-vs-plain inexactness, corpus
  errors > 0, or a detgate FAIL stops the run.

## PRIMARY QUESTION

What IS a wave-4 melt, mechanically, after a lost TB fight?
For each of the 5 melts: fought entity or bystander? What
was its lingerer/raider state at lift? Why did tbEnd not
restore it (fighter dead / tile occupied / worldOrigin
unset / result not restorable)? What HP path did it take
into the fight and out of it (or into nothing)? What
removal kind + day followed? And do the d145 / d167
removal-day coincidences cluster on raid days, or are
they coincidences (the d167 pair across seeds: not a
shared cause, by construction)?

## DIAG-GO RULE (ALL required, judged only against this header)

- (a) Every melt on the band is fight-classified (fought
  entity vs bystander lifted by another fight, with the
  lingerer/titan restore state and the tbEnd restore rule
  cited from code — game.js startCombat ~l33080-33104 and
  tbEnd ~l43576-43605) AND carries a named no-restore
  reason (fighter-dead / tile-occupied / worldOrigin-unset /
  result-not-restorable). Any melt unclassified or with no
  reason = leg failed.
- (b) Per-melt days-to-removal (birth-to-removal AND
  fight-to-removal) and fight result reported for every melt.
- (c) Raid/siege-day clustering TESTED, not assumed, for
  the d145 pair (same seed 73675) and the d167 pair
  (cross-seed — a shared calendar day across seeds is not
  a shared cause, said plainly whatever the per-seed
  answers are).
- (d) Sense: one melt thread read and described in plain
  words (the 73675 d145 pair) — numbers plus meaning, not
  counts alone (a non-measured narration replay is allowed;
  replay text never enters any count).
- Gates (STOP conditions, not verdict inputs): armed-vs-plain
  exactness on all shared fields; corpus recorder errors 0
  on all SIX recorders, no overflow; detgate PASS on 73671;
  analyzer unit proof 48/48. Any leg missing = DIAG-NO-GO.
  Any gate failing = STOP and report, no verdict judged.

## METRIC REVIEW (mandatory section in the evidence file)

Pre-registered metrics bind the run — a miss is NO-GO, never
re-scored against a friendlier metric mid-run. Metric doubts
go here for the NEXT run. No metric is re-scored in this run.

## BALANCED-PANEL / TELEMETRY NOTE (standing exception, carried)

scripts/balance-panel.js cannot ingest per-seed recorder
corpora (carried from w4funnel-repin-a) — the sweep-compare
table + analyzer output are attached instead, and
telemetry-check is NOT run on recorder rows (its counts are
wrong on recorder rows). No panel file is faked and no
telemetry baseline is rolled on recorder rows.

## WALL NUMBERS TO REPORT (every run)

national-ever / national-final, table invited / entered,
wins, wave 4-5 unlocks, median survival, deaths, starvation
deaths, wave-4 kills total + per seed, death-cause shares.
