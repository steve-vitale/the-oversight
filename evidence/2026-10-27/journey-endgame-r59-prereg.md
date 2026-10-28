# Journey endgame r59 — HOLD SHAPE, FIFTH BLOCK (lane B, pre-registration 2026-10-27)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next) at
run end. This run takes r58's carried items, in order, on r58's
substrate exactly. No src/js changes planned at prereg; the only new
code is the r58 probe/analyzer carried with seed numbers, evidence
dir, and transcript header updated (r58 → r59), plus the two r58
metric-review tooling fixes: (a) withdrawal lines in the probe JSON
carry the full capture line instead of the 300-char cut (r58's 88406
want-list was unrecoverable at 300 chars), and the transcript file
carries a withdrawal header line even when the beat predates the
announce slice; (b) the probe records raw readiness counts per sat village
(armored / armed / tricks) where the engine exposes them, so M12 no
longer leans on finale-audit recitation alone. Neither fix changes
a binding; both are instrumentation.

Rotation note (verified before play): r58 endgame played 88401–88407
but its run died before landing — heartbeat stale 2026-10-28T01:51Z,
lock stale, branch unmerged, rotation still 4. This run first
recovers r58 (its two evidence commits + the verified ONTOLOGY
alignment line, rebased onto current master) and then plays endgame
r59 as the completed rotation step. r59 is therefore a fresh block,
not a re-run of r58's seeds: r58's findings stand as the prior
block, r59's block is judged on its own seeds.

Canon read before play: docs/CANON.md (manifest) + docs/TABLE.md
(the table prices the run, never gates on godhood; full seat keeps
the national bar; lesser seat reachable by competent non-god play).
Gating freeze (Steve 2026-10-27 16:53) stands: no gating change in
this run, whatever the chase finds — instrument + evidence only.

## The carried items (from r58, in order)

1. 199-HOLD RELEASE CHASE (r58's shape, twice). r58: no village
   peaked at 200+, no wave-5 unlock, no full seat — but TWO waves
   seeds peaked at exactly 199 (88406, 88407) plus the control
   (88404), and BOTH waves 199s share one shape: armor + veterans
   short, weapons and tricks MET (88406: armor 3/4, veterans 1/2;
   88407: same). r57's three shapes collapsed to one. r59 asks:
   on fresh seeds, does a village meet every defer5 bar (armored 4,
   armed 6, tricks 3, veterans 2) and release the hold — peak >= 200,
   wave-5 unlock, or full seat? And does the hold keep its
   armor+veterans shape, split again, or move to a new bar?
   Report per-village readiness bars AND standing peak beside every
   unlock report (r54 rule, kept), and as the bound M12 table.
2. DECLINE-BOILERPLATE WART (carried, now measurable). r58 gave
   the first data in three blocks: TWO withdrawals (88404 control,
   88406 wavesnw). One beat fully readable (88404): accusation
   generic and overstated ("NO HUNGER ON THE RECORD" about a
   village with 293 food shared and a 64,850 pantry), want-list
   specific and mostly true. One beat ungradable (88406, truncated
   + no decline beat in its transcript slice). r59 measures the
   mismatch rate across withdrawal seeds IF any fire, with
   untruncated lines (tooling fix (a) above); zero withdrawals
   keeps it carried, not closed. No rewording made: generic by
   design means document, don't silently reword.
3. M3 CONVERSION, SPREAD WATCH (carried). r58: Arm B 2 kills vs
   Arm A 0 kills, spread across TWO seeds again (88406 influencer
   d120, 88407 influencer d61) — r57 two-seed edge, r58 two-seed
   edge, r56 zero-kill block reading as the outlier. r59 watches
   whether the edge holds a THIRD consecutive two-seed block, or
   collapses back to flights-only.
4. M3b LIVING VETERAN (carried, replication bar >= 2). r58: spread
   holds at 2/6 >= 1 living veteran (88406 Lucas Brown, 88407 Leo
   Martin), 0/6 >= 2, so the replication bar stays NO-GO for a
   third block. r59 keeps the >= 2 bar and reports the spread
   (>= 1) beside it.
5. M2 OPPORTUNITY (carried, pattern watch). r58: COLLAPSED back
   to zero on Arm A — 0/3 Arm A seeds recorded a fight (88401,
   88402, 88403 all zero-fight) while Arm B fought 13 census
   fights across 3 seeds. r59 watches whether Arm A opportunity
   stays at zero (a pattern, not variance) or rebounds (>= 2/3,
   as in r57). One more zero block makes it two in a row and an
   arm-split pattern to name, not a lever claim.
6. CONTROL SURVIVAL WATCH (carried, new control shape). r58's
   control (88404) survived with 10 alive and crossed + voiced
   (noticed 1, bandCrossings 1, M5 GO) — but never announced or
   sat: the table declined it at d90 (withdrawal). A control that
   survives but is declined is a new control shape, not a death
   and not a sit. r59 watches the fresh control the same way.
7. TELEMETRY BASELINE PROPOSAL (carried, not mid-run). r48–r58
   all reported satPenalty LOUD as EXPLAINED (baseline describes
   long-deferral sits, r37, not guard-ended windows); baseline
   NOT rolled. This run does NOT roll the baseline mid-run; it
   reports the deviation verdict the same way. Re-seeding from a
   same-regime guard-ended corpus is a NEXT-run proposal.

## Context, not substrate (measured elsewhere, NOT in this run)

- gap-route (another lane's unmerged branch at r58 prereg):
  villagers routed to known monsters (return-to-fight HUNT errand),
  the routing choke behind villager kill conversion. Per repo
  port+review rules this run does NOT port it in. r59 measures on
  master substrate exactly; if r59 again shows thin kills, gap-route
  is the pending mechanism to cite, not a new discovery — and its
  landing is its coordinator's job, not this run's.
- w5twokey / lowdef / callertag arms (scale-onramp + food-economy
  loops, 2026-10-27): two-key lock DIAG-GO, first wave-4 kill
  (killer dead), leanlink SCREEN-NEGATIVE. They bound the wall
  from other lanes; r59 does not re-run them.
- The wave-5 door opening reported 2026-10-27 (seed 74902, day 165,
  gated standing 202, then 15 days empty, no wave-5 monster met, no
  table offer; full seat 0/24, only 7 wave-4 kills across 24
  villages) is a different lane's measurement, not this run's
  substrate. r59's chase is the same wall from the endgame side:
  whether a village clears every readiness bar at the sit.

## Arms (r58 substrate exactly)

Substrate on every waves seed: capable base + deedhunt (deedPatrol +
surgeUpkeep) + vetcommit + greedy deferral (defaults MAXTIER 4 /
LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag + vetguard.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1 (waves only), TELEMETRY_FULL=1, RELAYGREY=1
(the forcedrift control requires it). 180d, death-aware.
- Arm A (engine census road): seeds 88501, 88502, 88503 (waves).
- Control: seed 88504 (forcedrift, capable + relaygrey FORCEDRIFT=1,
  greedy OFF, armory OFF, vetguard OFF — r49's canonical control).
- Arm B (fight-don't-talk, carried): seeds 88505, 88506, 88507
  (wavesnw = waves substrate + CAPABLE_NOWALKIN_W4=1 on waves seeds
  only).
Seeds verified fresh for endgame: the endgame probe block steps by
10 (88401→88501 across r58–r59); no 8850x hit in any prior endgame
note, probe, analyzer, or per-seed evidence dir (scoped check
before play; a broad evidence-wide grep for 8850[1-7] hits only
incidental numbers inside unrelated JSON values, not endgame
seeds).
Baseline: r58's waves seeds (census fights: 88405 bloodbath 9
fights 0 kills, 88406 3 fights 1 kill + 2 suburb escapes, 88407 1
fight 1 kill; M3 2 vs 0; M3b 2/6 >= 1 living veteran, 0/6 >= 2; M4
0/6 wave-5 unlock, 0/6 full seat; standing peaks waves 99, 95, 99,
172, 199, 199; control 199 held on armor + veterans; 4/7 sat, all
lesser; 2 village-lost, 1 survived-declined).

## Leg question

On fresh seeds, does any village meet every defer5 readiness bar
and release the 199 hold (peak >= 200, wave-5 unlock, or full
seat) — and does the NOWALKIN edge hold a third consecutive
two-seed block, or collapse to flights-only? And in plain words:
what shape is the hold on each village that reaches the window,
and does Arm A opportunity stay at zero a second block?

## What counts as an interesting finding

- A village peaking at standing >= 200, unlocking wave 5, or
  earning the FULL seat (any one advances the chase one step).
- A readiness-bar table showing which bar binds per village —
  the armor+veterans shape holding, splitting, or moving.
- A NOWALKIN kill on >= 2 Arm B seeds (edge holds a third block)
  — or a flights-only Arm B block (edge collapses).
- A waves seed banking >= 2 LIVING veterans (replication bar met)
  or >= 1 (spread holds).
- A withdrawal seed whose decline boilerplate matches vs
  mismatches its deeds — the rate, with untruncated lines.
- An Arm A block at zero fights a second time (pattern) or a
  rebound to >= 2/3 (variance).
- A control that survives to its voicing window and sits, sits
  declined, or dies before it — each a single data point, named
  cause.

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD (carried): >=5/7 seeds reach the window (announceDay !=
  null) OR resolve via a voiced non-table path (honest-death /
  withdrawal).
- M2 CENSUS COMPLETE (carried): every census fight on waves seeds
  carries a primary outcome (coverage 100%), AND >=2/3 Arm A waves
  seeds record >=1 census fight.
- M2b ATTRIBUTION (carried): every dieFlag fight is classified
  causal-vs-daywindow; AND >=1 dieFlag fight (if any dieFlag fight
  exists on waves seeds) carries >=1 NAMED fight-causal death. If
  zero dieFlag fights exist, M2b is NO-DATA (not GO, not NO-GO).
- M2c ENGINE COVERAGE (carried): census fights == distinct wave-4
  opens (engine opens + policy-only opens), AND censusErrors == 0.
- M2d COMMIT-GATE NAMED (carried, retired class excluded): every
  committed=false census fight on waves seeds carries a gate
  classification: 'never-observed', 'gate:<component>', or the
  retained-but-retired 'gate-passed-uncommitted' branch (reported
  if it ever fires; no longer a binding question). A
  committed=false fight with NO gate classification is NO-GO and
  the run names which fight lost it.
- M3 CONVERSION (carried replication): Arm B total wave-4+ kills >
  Arm A total wave-4+ kills.
- M3b LIVING VETERAN (carried, bar raised to replication): >=1/6
  waves seeds ends with >=2 LIVING veterans (r55's solve,
  replicated); the run also reports the spread (how many seeds
  bank >=1).
- M4 WAVE-5 OPEN / FULL-SEAT REACH (carried): >=1/6 waves seeds
  unlocks wave 5 OR earns the FULL seat. EVERY report of the
  unlock carries the readiness-bar reading AND the standing peak
  beside it (r54/r55/r56/r57/r58 rule).
- M5 VOICING CANONICAL (carried): 88504 — bandCrossings >= 1 AND
  noticedCount >= 1. A control death before the window is NO-GO
  with the cause named (death, not voicing).
- M6 GUARD NAMED (carried, deferred scope): every sat waves seed
  with deferDays >= 1 records a named window-end guard (not
  'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- M8 EXIT CANON (carried): every mFlee census fight on waves seeds
  is matched to its monster's codex counter text in the run note
  (0 mFlee fights = vacuous, stated plainly, not counted as
  coverage).
- M9 SUPPLY (carried): every wave-4 arrival that does not become a
  fight is recorded with its cause line; OR the run note cites the
  code rule that turns arrivals away (ONE MONSTER PER TILE + Haven
  safe law).
- M10 FULL-SEAT GAP (carried): every sat waves seed's closest
  full-seat gap component is named from fullseatMax (which bar,
  how far), including any village that closes w5 or sits full.
- M11 STANDING PEAK (carried): every waves seed's standing peak is
  reported; the chase is judged on peaks AND readiness bars (how
  many at 199, any at >= 200, which bar binds each 199).
- M12 READINESS-BAR TABLE (carried): every sat waves seed's defer5
  bar reading (armored x/4, armed x/6, tricks x/3, veterans x/2,
  holdKind, rd5short) is tabulated in the run note, so the chase
  is judged on bars, not just on peaks. A sat seed with no bar
  reading in the note is NO-GO for M12. Raw counts from the probe
  (tooling fix (b)) sit beside audit recitation where both exist;
  disagreement is reported, not papered over.
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

## Instrument

- scripts/probe-endgame-r59-20261027.js (r58 probe + seed block
  88501–88507 + perseed-endgame-r59 + transcript header r59;
  withdrawal lines untruncated; raw readiness counts recorded
  where the engine exposes them; no binding logic change).
- scripts/analyze-endgame-r59-20261027.js (r58 analyzer + same seed
  block + dir + M10/M11 tables + M12 bar table; no binding logic
  change).
- Gates: PILOT (88501 Arm A + 88505 Arm B + 88504 control, 180d
  sweep mode — expand if ANY leg-question signal fires: >=1
  census fight OR a withdrawal OR full-seat gap movement
  (standing peak >= 190 or a gap component closer than r58's
  armor+veterans hold); else document pilot-only and stop, per r55
  metric review 2's revised gate); DET (instrument-on twice,
  2x120d, seed 88501 — wrappers provably read-only:
  byte-identical); FID (env unset: wrapped == pure
  capable+deedhunt, mini gameDays/won/alive/pantry).

## Metric review (standing, carried)

- M4's GO stays narrow and must stay labeled: it counts the
  UNLOCK (uw=5) or the FULL seat, not the veterans bar. Every
  future endgame note reports the bar + standing peak beside
  the unlock, per r54–r58's rule.
- Gate-passed-uncommitted: RETIRED (r55). The branch stays in
  the analyzer; it is no longer a binding question.
- Daily-slice withdrawal detector: RETIRED (r55). The end-rescan
  IS the detector outright.
- Telemetry baseline (hidden_files/telemetry-baselines/endgame.json)
  still describes long-deferral sits (r37), not guard-ended
  windows — r48–r58 all reported it EXPLAINED and did not roll
  it. Same rule here; re-seeding from a same-regime corpus is a
  NEXT-run proposal, not a mid-run re-score.
- Balanced panel (§15): no panel comparison applies — zero src/js
  changes planned, no lever moved on the default path (NOWALKIN
  default off, census + gate snapshot are read-only
  instrumentation). The comparison is r58→r59 via identical
  substrate, and Arm A→Arm B on one variable. If the
  decline-boilerplate fix enters scope, the panel comparison
  for that text change is a before/after transcript diff, not
  a balance panel (text only, no numbers moved).
- M12 (bound since r58): the bar table is bound and filled from
  finale audits + probe short-lists, with the instrument gaps
  (truncated withdrawal lines, missing raw counts,
  audit-recitation limits) stated rather than papered over.
  r59's tooling fixes close two of the three gaps; the
  whole-run-max vs d90-decline timing gap stays open and
  stays stated.
- M2's arm split: one block cannot separate NOWALKIN's
  effect from seed variance. r59 watches whether Arm A
  opportunity stays at zero a second block (a pattern) or
  rebounds (variance) — and does NOT re-score r58's NO-GO
  against a friendlier metric.
