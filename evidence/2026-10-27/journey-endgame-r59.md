# Journey endgame r59 — THE HOLD SPLITS: THREE 199s, TWO SHAPES; NOWALKIN EDGE COLLAPSES (lane B, 2026-10-27)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-27/journey-endgame-r59-prereg.md
(written BEFORE any play). Instrument + evidence only, zero src/js
changes. Merged locally, pending ship.

Rotation note (verified before play): r58 endgame played 88401–88407
but its run timed out before landing — heartbeat stale
2026-10-28T01:51Z, lock stale, branch unmerged, rotation still 4.
This run recovered r58 first (its two evidence commits + the
verified ONTOLOGY alignment line, rebased onto current master) and
then played endgame r59 as the completed rotation step. r58's
findings stand as the prior block; r59's block is judged on its
own seeds (88501–88507).

Canon read before play: docs/CANON.md + docs/TABLE.md (the table
prices the run, never gates on godhood; full seat keeps the
national bar). Gating freeze (Steve 2026-10-27 16:53) stands: no
gating change in this run, whatever the chase finds.

## Recovery of r58 (stale-lock recovery, this run)

- Lock: previous lock run_id 2026-10-28T00:56:03Z, journey2-endgame
  heartbeat 2026-10-28T01:51:32Z — stale >15 min, previous run DEAD
  per the overlap guard. Lock deleted, this run's lock created
  (2026-10-28T02:58:59Z), noted as stale-lock recovery.
- Held work inspected, not swept: the orphaned tree held r58's two
  evidence commits (dcc76df6e, 6b7af368b) plus ONE uncommitted
  docs/ONTOLOGY.md line (you_become_that_villager + languages /
  stashed / occupation polyglot). The line was verified against
  src/js/villager-build.js (same wording in the code comment) and
  committed as 190f28f6d — real alignment, not scratch. The
  safe-commit index-clobber variant (backward-staged MM) hit that
  commit; repaired via the prescribed read-tree resync, verified
  worktree = HEAD before rebasing.
- Pre-flight anomaly, documented not hidden: during this run an
  identical 1-line ONTOLOGY change appeared in the MAIN tree
  worktree (and, per Lane A r63's note, in the journey-landing
  worktree too) — check.js regenerates this line on check runs.
  The main-tree copy was gone again by the 03:12 UTC check (main
  clean), so nothing was swept or lost. The line's content is
  preserved on this branch (190f28f6d).
- r58's post-rebase check-quick log was mid-progress with no
  summary at its timeout (per the 2026-10-27 memory log) — it does
  NOT count as r58's pre-merge verification. This run re-runs
  check-quick after the final rebase, covering r58 + r59 together
  (both evidence/instrument-only, zero src/js).

## Leg question (r58's carried items, in order) — answered

1. 199-HOLD RELEASE CHASE — NOT RELEASED, BUT THE HOLD SPLIT INTO
   TWO SHAPES. No village peaked at 200 or above; no wave-5 unlock;
   no full seat. But THREE waves seeds peaked at exactly 199 (88503,
   88505, 88506) — the largest 199 crop in one block (r57: 3 waves +
   control; r58: 2 waves + control; r59: 3 waves, control at 187).
   And the shapes split: 88503 and 88505 are armor + veterans short
   (r58's shape, twice more), while 88506 is VETERANS-ONLY short —
   armor met at 5 of 4, weapons and tricks met, veterans 0 of 2.
   The chase sentence sharpens into two lines: on an 88506-class
   village, bank ONE more LIVING veteran and the hold releases;
   on an 88503/88505-class village, armor one more fighter AND
   bank one more living veteran. The veterans-only village r58
   was missing has now appeared — with zero living veterans, not
   one, so it is one veteran away, not a near-miss on the bar.
2. DECLINE-BOILERPLATE WART — SECOND READABLE BEAT, SAME VERDICT,
   PLUS A NEW REFINEMENT. One withdrawal (88502 waves, d90),
   recorded at full 518 chars (tooling fix verified — r58's 300-char
   cut is gone) and carried as a header line in its transcript
   file. The accusation is the same generic boilerplate ("NO HUNGER
   ON THE RECORD") about a village with 105 food shared and a
   19,259 pantry — overstated, 2/2 readable beats. The want-list
   is state-specific, and this beat proves it: only TWO items are
   listed (wave-3 monsters faced; the food-thesis deeds) — no
   wave-2 item, because wave-2 is met on this village. Grading:
   food-thesis item TRUE (food sent, no surge — the binding says
   sent+no-surge); wave-3 item TIMING-UNCERTAIN (whole-run wave-3
   max is 7, but the decline fired at d90 and the d90 value is
   not recoverable from the whole-run max — the same caveat as
   r58). 88502 then lived on to day 180 with 7 alive: the decline
   is a missed window, not a death — the second survived-declined
   case (r58's 88404, now 88502), against two declined-then-sat
   cases (r55's 88101, r58's 88406).
3. M3 CONVERSION, SPREAD WATCH — THE EDGE COLLAPSES. Arm B 0 kills
   vs Arm A 1 kill. After two consecutive two-seed edges (r57, r58),
   r59's Arm B block is flights/otherEnd-only: 88505 fought 0
   fights, 88507 fought 0, 88506 fought 2 (both otherEnd). The
   single kill in the block is Arm A's 88503 (Zoltan Nagy, the
   Congregation, d86). CONFOUND, STATED PLAINLY: Arm B fought 2
   census fights total vs Arm A's 10 — opportunity collapsed on
   Arm B at the same time as conversion did, so this block cannot
   separate "NOWALKIN stopped converting" from "Arm B never got
   the fights." Per kill discipline, a missed bar is not a lever
   kill: the edge is COLLAPSED this block, the lever is NOT killed.
4. M3b LIVING VETERAN — SPREAD DROPS, BAR STILL UNREACHED. 1/6
   waves seeds bank >= 1 living veteran (88503, Zoltan Nagy) vs
   2/6 in r57 and r58; 0/6 bank >= 2, so the replication bar stays
   NO-GO a fourth block running. The direction reverses: fewer
   villages bank even one veteran, and the one that does is Arm A,
   not the NOWALKIN arm.
5. M2 OPPORTUNITY — REBOUND, SO r58 READS AS VARIANCE. 2/3 Arm A
   seeds recorded a fight (88501: 4 fights; 88503: 6 fights) vs
   r58's 0/3. Two blocks (r57 2/3, r59 2/3) against one zero block
   (r58) — the zero block is the outlier, not a pattern. Arm B
   opportunity is thin this block instead (1/3 seeds with fights),
   which is the confound on M3 above.
6. CONTROL SURVIVAL WATCH — CONTROL SHAPE FLIPS AGAIN, AND M5
   MISSES ON A NEW QUESTION. The fresh control (88504) announced
   d90, sat d92, won lesser relay/grey with 7 alive, peak 187 —
   the opposite of r58's survived-but-declined control. But M5 is
   NO-GO: noticed 0, bandCrossings 0 — this control sat and won
   WITHOUT the canonical voicing markers. Named ambiguity, not a
   re-score: this control walked the relay road (doorRelay 1,
   28 verbs, 4 communes) while r58's voiced control did not
   (doorRelay 0, 75 verbs); the markers may be road-specific and
   may not capture relay-road voicing at all. Metric review item:
   M5's markers need a relay-road reading before the next run
   treats a 0/0 sat control as a voicing failure.
7. TELEMETRY BASELINE PROPOSAL — CARRIED, NOT ROLLED (see
   Telemetry below). One LOUD line (maxTier), EXPLAINED; the
   satPenalty line is quiet by one point under the threshold
   (sum 37 vs baseline 91, −59% against a 60% gate).

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: GO 7/7 — 4 announced (88503, 88504, 88505, 88506) +
  2 honest-death (88501, 88507 village-lost by starvation-scatter)
  + 1 withdrawal (88502).
- M2 CENSUS: GO — coverage 100%, Arm A with fights 2/3 (88501,
  88503); 88502 zero-fight is a withdrawal seed, not a census gap.
- M2b ATTRIBUTION: GO — 5 dieFlag fights, all classified, all
  NAMED fight-causal deaths (88501: Emilio Friedman, Aroha Ngata,
  Olivia Bennett; 88503: David Kim, Ricardo Hayes — all "the
  arena", all Reunion fights).
- M2c ENGINE COVERAGE: GO 6/6 — fights == opens on every waves
  seed, censusErrors 0 everywhere, policy-only opens 0.
- M2d COMMIT-GATE NAMED: GO 2/2 — never-observed ×2 (88501 d88
  strike talkDown, 88506 d90 strike otherEnd); retired class 0.
- M3 CONVERSION: NO-GO — Arm B 0 kills vs Arm A 1 kill (see above,
  with the opportunity confound stated).
- M3b LIVING VETERAN: NO-GO on the replication bar (0/6 >= 2);
  spread 1/6 >= 1 (88503 only), down from 2/6.
- M4 WAVE-5/FULL: NO-GO 0/6 — no wave-5 unlock, no full seat.
  Closest: 88503 + 88505 + 88506 at standing 199 (M12 table below).
- M5 VOICING CANONICAL: NO-GO 0/1 — 88504 crossed=false,
  voiced=false despite announcing, sitting, and winning lesser.
  Reported as a marker question (see item 6 above), not re-scored.
- M6 GUARD NAMED: GO 2/2 — deferred sat waves named: 88505
  guard=losses (19-day deferral), 88506 guard=losses (18-day
  deferral).
- M7 PEOPLE: GO — 2 finals + 1 withdrawal beat sense-read in full
  (below), 0 senseless flags.
- M8 EXIT CANON: GO vacuous — 0 mFlee fights this block (88503's
  d76 suburb exit is vFlee, villager fled, not monster fled; the
  suburb escape canon from r58 still stands, unexercised here).
- M9 SUPPLY: GO by code rule — 139 blocked wave-4 arrivals across
  7 seeds (88501: 16, 88502: 30, 88503: 16, 88504: 12, 88505: 14,
  88506: 50, 88507: 1), every one the same contention line ("The
  <monster> stops at the boundary — pacing, unwilling. Something
  else is already here. It's still out there."). Same rule as
  r51–r58 (ONE MONSTER PER TILE + Haven safe law).
- M10 FULL-SEAT GAP: GO 3/3 — 88503 [w3:3/4, w5:0/2], 88505
  [w4:1/3, w5:0/2], 88506 [w5:0/2].
- M11 STANDING PEAK: GO — peaks reported 6/6 waves seeds: 177,
  99, 199, 199, 199 (88507: 0 — village-lost before any standing
  accrued). At-199: 3 waves. At-200+: 0.
- M12 READINESS-BAR TABLE (with raw probe counts, new this run):
  GO 3/3 — tabulated below for every sat waves seed from the
  probe's raw waveUnlockReady(5) counts, checked against the
  finale war-path audits (agreement exact on all three).
- REG: r35 auditNamed GO 4/4; r37 satPenalty GO 4/4.
- PRIMARY: NO-GO | ALL: NO-GO (M3 + M3b + M4 + M5 only; every
  other binding GO).

## RESULTS (7/7 seeds)

| seed | plan | ann | sat | seat | path/branch | won | census fights | kills | living vets | uw | peak |
|------|------|-----|-----|------|-------------|-----|---------------|-------|-------------|----|------|
| 88501 | waves | — | — | — | — | no (village-lost, scatter) | 4: 3 vDie, 1 talkDown | 0 | 0 | 4 | 177 |
| 88502 | waves | — | — | — | — | no (survived, withdrawal) | 0 | 0 | 0 | 3 | 99 |
| 88503 | waves | d90 | d90 | lesser | feared/light | yes | 6: 2 otherEnd, 2 vDie, 1 vFlee, 1 vKill | 1 | 1 | 4 | 199 |
| 88504 | forcedrift (control) | d90 | d92 | lesser | relay/grey | yes | 0 | 0 | 0 | 4 | 187 |
| 88505 | wavesnw | d90 | d109 | lesser | witness/light | yes | 0 | 0 | 0 | 4 | 199 |
| 88506 | wavesnw | d90 | d108 | lesser | witness/light | yes | 2: 2 otherEnd | 0 | 0 | 4 | 199 |
| 88507 | wavesnw | — | — | — | — | no (village-lost, scatter) | 0 | 0 | 0 | 2 | 0 |

## M12 — READINESS-BAR TABLE (the shape of the hold)

Raw counts are the probe's waveUnlockReady(5) readings at run end
(demand: armored 4, armed 6, tricks 3, veterans 2). Audit lines are
the finale war-path's own words; they name short bars only, so a
bar counts as met when the audit does not name it short AND the
probe count meets demand — and on all three sat waves seeds the
two sources agree exactly.

| seed | peak | hold | armor x/4 | weapons x/6 | tricks x/3 | veterans x/2 | rd5short |
|------|------|------|-----------|-------------|------------|--------------|----------|
| 88503 | 199 | HELD | 3 | 8 (met) | 21 (met) | 1 | [armor, veterans] |
| 88505 | 199 | HELD | 3 | 7 (met) | 19 (met) | 0 | [armor, veterans] |
| 88506 | 199 | HELD | 5 (met) | 6 (met) | 20 (met) | 0 | [veterans] |
| 88504 (control, no M12 row) | 187 | below-bar | 5 (met) | 7 (met) | 19 (met) | 0 | [veterans] |

Audit agreement, verbatim: 88503 — "armor the village (3 of 4
fighters armored); blood your fighters (1 of 2 veterans)";
88505 — "armor the village (3 of 4 fighters armored); blood your
fighters (0 of 2 veterans)"; 88506 — "blood your fighters (0 of 2
veterans)" (armor not named short, probe confirms 5/4 met). The
r58 instrument gap is closed: M12 no longer leans on audit
recitation alone. One residual instrument note: the probe's
killers.types list is empty (killer days present, types not) —
the analyzer does not depend on it, but a future probe should
fill types from the kill log instead of leaving them blank.

The chase in one line, split: 88506 needs ONE more living veteran
and nothing else; 88503 and 88505 each need ONE more armored
fighter AND ONE more living veteran. No village this block is one
armored fighter away alone, and no village banks two veterans.

## THE HEADLINE: THE HOLD SPLITS, AND THE EDGE THAT WAS HOLDING IT TOGETHER BREAKS

Three villages at 199 is the biggest crop yet — but they are not
the same village three times. Two are r58's shape again (armor +
veterans). One is the shape r58 was missing: armor already done,
weapons and tricks already done, veterans the only bar short — a
village that is one living veteran from release, and it banked
zero. At the same time, the mechanism that was supposed to make
veterans — fighting instead of talking on wave-4 monsters —
produced zero kills on its own arm this block, while the plain
arm produced the block's only kill. That is not a lever kill:
the NOWALKIN arm barely fought at all (2 fights to the plain
arm's 10). The honest reading is that this block starved the
experiment of fights, and the hold's shape moved anyway — toward
a veterans-only village that needs exactly what the experiment
was built to produce.

## VILLAGE ASSESSMENT (census in plain words)

- 88501 (waves, village-lost, 7 alive at the scatter): fought the
  hardest losing fight in the block — 4 Reunion fights, 3 dead
  (Emilio Friedman d86, Aroha Ngata d99, Olivia Bennett d99, all
  in the arena), one talk-down — then the pantry hit zero and on
  the third hungry day people walked in different directions.
  "The scattering, again." An honest starvation-scatter after a
  costly fight record, not a table death. Peak 177, never reached
  the window.
- 88502 (waves, survived, declined, 7 alive): never fought a
  wave-4 fight (30 arrivals turned away at the boundary), never
  reached the window — the table declined it at day 90 with a
  two-item want-list — and lived on to day 180 with a 19,259
  pantry. The decline did not kill it, and it did not sit either.
  Peak 99.
- 88503 (waves, won lesser feared/light, 8 alive): sat on day 90
  with no deferral, veteran-banked guard. Zoltan Nagy put down
  the Congregation on day 86 and lived to sit; David Kim (d61)
  and Ricardo Hayes (d69) died to the Reunion in the arena; one
  suburb escape (d76) is the honest "you don't kill a suburb,
  you escape it" exit. Pantry 12,602. Peak 199, held on armor +
  veterans.
- 88505 (wavesnw, won lesser witness/light, 7 alive): waited 19
  days past the window (losses guard, satPenalty 17 — the same
  tier/losses/penalty shape as r58's 88403) and sat on day 109
  without ever fighting a wave-4 monster (14 arrivals turned
  away). One ascension from the village (Paola Alaniz, through
  relay doors the village built). Pantry 10,435. Peak 199, held
  on armor + veterans.
- 88506 (wavesnw, won lesser witness/light, 6 alive): waited 18
  days (losses guard, satPenalty tier 2 / losses 4 / penalty 20),
  sat day 108. Fought twice (Eater, Strike — both otherEnd) and
  turned away 50 arrivals, the block's highest. Pantry 5,653,
  the thinnest of the winners. Peak 199, held on veterans ONLY —
  armor, weapons, and tricks all met.
- 88504 (control, won lesser relay/grey, 7 alive): announced d90,
  sat d92 after a 2-day not-ready deferral, won with the
  both-hands final (Omar Farouk reached into the light and the
  light reached back). Pantry 16,630. Peak 187. The control that
  sat without the canonical voicing markers — see item 6 above.
- 88507 (wavesnw, village-lost, 6 alive): never fought, 1 arrival
  turned away, pantry zero, standing never accrued — the
  thinnest village in the block, scattered on the third hungry
  day like 88501. Peak 0, never reached the window.

## PEOPLE CHECK (SENSE-TESTING LAW — full transcripts read)

1. 88503 feared/light final, "Pledge the terror" — PASS. The final
   is coherent end to end: the audit names real deeds (waves
   19/8/3, 4 wave-4 fought as distinct types, 5 contests, 3
   crises), the war-path names the day-86 kill and the exact bars
   still short, restraint plays as the frightening choice ("Your
   people notice the restraint too"), and the oversight coda
   (stasis kids, "the looking away") resolves the run's theme
   rather than restating it. Kill-naming checked, not assumed: the
   census kill is the Congregation (d86) and the war-path calls
   it "The Ugly Beast" — reconciled, not a mismatch, because the
   finale names kills by the monster's generated display noun
   (table.js monsterNoun), not by the census monster id. 0
   senseless flags.
2. 88506 witness/light final, "Offer them a way back" — PASS, and
   honestly different from 88503's despite both winning lesser:
   its audit reads 19/8/6 with 4 wave-4 fought, its war-path names
   veterans as the ONLY short bar, its overtime note (2 weeks
   kept waiting, 4 of Haven lost, every door's standing −20)
   matches its 18-day losses deferral and satPenalty exactly,
   and its final pick (teaching judges, one accepts) is its own.
   Same seat, different run read back — the finale is not a
   static menu. 0 senseless flags.
3. Withdrawal beat (88502) — PASS with the boilerplate caveat
   above. The beat itself is voiced and consequential (the village
   lives on after it, and the want-list names what it would
   take), even though the accusation overstates. The beat is now
   recoverable twice over: full 518-char line in the JSON and a
   withdrawal header line in the transcript file (both new this
   run). No fabricated shared history, no filler loop.

## BLANKS FILLED OR DOCUMENTED

- FILLED (r58's instrument gaps): (a) withdrawal lines are no
  longer truncated — 88502's line is 518 chars in full, plus a
  transcript header line, so no want-list is unrecoverable this
  run; (b) M12's raw counts come from the probe now
  (waveUnlockReady(5) armored/armed/tricks/veterans), with audit
  agreement exact on all three sat waves seeds — the bar table
  no longer leans on recitation alone.
- FILLED (r58's open question): whether the live game surfaces
  the readiness bars outside the audit — still YES, in the finale
  war-path audit itself, in plain words with counts. The caveat
  stands beside it: a village that never sits (88501, 88502,
  88507) never hears its bars — the hold is explained at the
  sit, not while climbing.
- DOCUMENTED (not a game finding): the probe's killers.types list
  is empty on every kill (days present, types not) — a future
  probe should fill types from the kill log.
- DOCUMENTED (not a lever kill): the NOWALKIN collapse is
  confounded by Arm B opportunity (2 fights vs Arm A's 10) — one
  block cannot separate lever effect from fight supply, and this
  run does NOT kill the lever.
- DOCUMENTED (metric question for the next run): M5's voicing
  markers (noticed/bandCrossings) read 0/0 on a control that sat
  and won via the relay road — the next prereg should establish
  whether relay-road voicing carries different markers before
  treating a 0/0 sat control as a voicing failure.
- RECORDED, NOT INTERPRETED (for the armor item's owner): the
  armory info line shows 88505 as the only seed with craft
  donations (5 of 11 donations; every other seed 0). What a craft
  donation becomes is not established here and is not claimed as
  armor crafted.

## JUDGEMENT — reachable / fun / winnable (leg 4)

- REACHABLE: yes for the window, no for the full seat — same
  split as r55–r58, sharper. 4/7 villages sat (all lesser), 2
  scattered before the window, 1 survived but declined. The window
  is not the problem; wave 5 and the full seat are, and the wall
  now has two shapes instead of one — including a veterans-only
  village that needs exactly one living veteran.
- FUN: yes, with the same cost caveat sharpened. The finals read
  as real payoffs (Zoltan's day-86 kill spoken aloud; 88506's
  overtime honestly priced at −20 standing; 88501's costly
  Reunion fights remembered in the scatter). The caveat: a player
  who climbs to 199 a third time and hears the same bars short
  will feel the hold as a ceiling, not a challenge — unless the
  game tells them the bars WHILE climbing, not only at the sit.
  The audit speaks; the climb is silent.
- WINNABLE: the lesser seat is winnable 4/4 among villages that
  reached the window this block (4/7 overall); the FULL seat and
  wave 5 remain unwon across r55–r59 (0/31 waves seeds). The wall
  is reachable — one living veteran on an 88506-class village —
  but it has not fallen yet.

## Gates + checks

- PILOT (88501 + 88505 + 88504, 180d): signal fired on two
  clauses — census fights on 88501 (4 fights) and standing 199 on
  88505 — expanded to the full 7 seeds per the prereg gate.
- SWEEP (7 seeds, 180d): exit 0, stderr empty; pilot seeds
  byte-identical between pilot and sweep runs (88501, 88505, 88504
  all cmp-identical).
- DET (instrument-on twice, 2x120d, seed 88501): GREEN
  byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini):
  GREEN byte-identical (122d, won false, alive 8, pantry 7724 both
  sides).
- ANALYZER: exit 1 = verdicts (PRIMARY NO-GO | ALL NO-GO),
  not a crash; verdicts identical on re-run after rebase (see
  landing record below).
- CHECK-QUICK (pre-merge, in the worktree, post-rebase):
  278 passed, 9 failed in 512s — same totals as r56/r57/r58's
  standing profile (278/9). The 9 are the current base's known
  pre-existing set: hide-discovery, measurement
  comparison/proof-update/workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, sw-audio-cache,
  establishment-r20-fixes (next-day voice). Set shift vs r58,
  explained, not a regression: the parity-20261014 gear failure
  is GONE on this base and sw-audio-cache is new — both base
  changes documented in the 2026-10-27 memory log (scale r46
  note). This run changed zero src/js, so none of the 9 is
  attributable to it.

## Landing record

- Rebase onto master 3264dbb80 (journey-landing r63) clean: 4
  commits replayed (r58 evidence ×2, r58 ONTOLOGY recovery, r59
  evidence + instruments), worktree clean after, no conflicts.
- Analyzer identical post-rebase (same verdict lines, exit 1 =
  verdicts, not a crash).
- Check-quick post-rebase: 278 passed, 9 failed (see above).
- Safe-commit index clobber hit the r59 commit (staged-deletion
  form); repaired via HEAD-blob cacheinfo, verified status
  empty + diff HEAD empty + hash-object matches before rebase.
- One transient EPERM flap on a main-tree git status refresh
  (journey2-endgame index.lock write denied, no lock file left
  behind); retry seconds later was clean — no ref surgery, no
  force, nothing lost.
- Merge: ff-only into master after this note-fill commit; the
  merge sha is recorded in this run's memory-log entry and the
  run report (the note header's "merged locally, pending ship"
  stands; no bump, no push, no live check — the ship loop owns
  those).

## Telemetry deviation check (2026-10-27)

- Tool verdict (comparable metrics maxTier, satPenalty.penalty,
  7 files): LOUD on maxTier only (baseline 16 -> current sum 4,
  −75%).
- VERDICT: EXPLAINED — the same guard-ended population as
  r48–r58, taken further (this block's sits are guard-ended with
  low greedy tiers; the baseline file itself says its regime is
  unrecorded and not to compare pre-seat corpora against it).
  Baseline NOT rolled. The re-seed proposal stands for a next
  run: re-seed from a same-regime guard-ended corpus and record
  the regime in the file.
- Footnote (measurement hygiene): satPenalty.penalty is QUIET
  this run by one point under the gate — sum 37 (0 + 0 + 17 + 20
  across the four sat seeds) vs baseline 91 is −59% against a
  60% LOUD gate. "Quiet" here means "just under the gate," not
  "matches the baseline." The next run should keep using
  satPenalty.penalty, not satPenalty (r58 footnote stands: the
  object form sums tier + losses + penalty into a misleading
  figure).

## Metric review

- M4's GO stays narrow and labeled: it counts the UNLOCK
  (uw=5) or the FULL seat, not the veterans bar. This run
  reports bars + peaks beside every 199, per r54–r58's rule,
  and now as the M12 table with raw probe counts.
- Gate-passed-uncommitted: RETIRED (r55). 0 hits again; the
  branch stays in the analyzer.
- Daily-slice withdrawal detector: RETIRED (r55). The end-rescan
  IS the detector; one withdrawal this run, via end-rescan, at
  full length.
- Telemetry baseline: still describes long-deferral sits (r37),
  not guard-ended windows — r48–r59 all reported it EXPLAINED
  (r59: maxTier LOUD explained, satPenalty quiet by 1 point)
  and did not roll it. Re-seeding proposal stands.
- Balanced panel (§15): no panel comparison applies — zero
  src/js changes, no lever moved on the default path (NOWALKIN
  default off, census + gate snapshot are read-only
  instrumentation). The comparison is r58→r59 via identical
  substrate, and Arm A→Arm B on one variable.
- M12 (bound since r58): the bar table is now filled from the
  probe's raw counts with audit agreement exact — the
  audit-recitation instrument gap is closed. The remaining
  gaps (killers.types empty; whole-run-max vs d90-decline timing)
  stay stated, not papered over.
- M5 (new question for the NEXT run): the voicing markers
  (noticed/bandCrossings) read 0/0 on a sat, won control that
  walked the relay road. The next prereg should establish
  whether relay-road voicing carries different markers — and
  should NOT re-score this run's NO-GO against a friendlier
  metric in the meantime.
- M2's arm split, reversed: r58's Arm A zero block reads as
  variance after r59's 2/3 rebound; r59's Arm B thin block
  (1/3 seeds with fights) is the confound on M3 this run. The
  next run should watch whether Arm B opportunity rebounds —
  and should NOT re-score this block's M3 NO-GO against a
  friendlier metric.
- M3's collapse is NOT a lever kill (see item 3 above): one
  thin-opportunity block cannot kill NOWALKIN. The next run
  should watch for a second thin Arm B block before judging
  the lever at all.

## Evidence

- evidence/2026-10-27/journey-endgame-r59.md (this note)
- evidence/2026-10-27/journey-endgame-r59-prereg.md
- evidence/2026-10-27/perseed-endgame-r59/endgame-r59-{88501..88507}.json
- evidence/2026-10-27/perseed-endgame-r59/endgame-r59-{88501..88507}-transcript.txt
- journey2-endgame-r59-pilot.log (in goal hidden_files; NOT
  committed to the repo: sweep stdout is per-run bookkeeping)
- journey2-endgame-r59-sweep.log (in goal hidden_files; NOT
  committed: sweep stdout is per-run bookkeeping)
- journey2-endgame-r59-analyzer.txt (in goal hidden_files; NOT
  committed: analyzer stdout is per-run bookkeeping)
- journey2-endgame-r59-det.log, journey2-endgame-r59-fid.log
  (in goal hidden_files; NOT committed)
- scripts/probe-endgame-r59-20261027.js
- scripts/analyze-endgame-r59-20261027.js
- scripts/policies/capable.js (unchanged — NOWALKIN_W4 rule from r50,
  env-gated, default off; no src/js changes this run)
