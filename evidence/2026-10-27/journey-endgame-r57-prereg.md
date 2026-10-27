# Journey endgame r57 — 199-HOLD RELEASE CHASE (lane B, pre-registration 2026-10-27)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next) at
run end. This run takes r56's carried items, in order, on r56's
substrate exactly. No src/js changes planned at prereg; the only new
code is the r56 probe/analyzer carried with seed numbers, evidence
dir, and transcript header updated (r56 → r57).

Rotation note (verified before play): r56 endgame ran 2026-10-27 and
merged locally (its note records rotation-b 4 → 5 written at run
end, then later runs advanced it through the cycle back to 4 —
social/ crisis/ succession legs ran after it). Rotation-b reading 4
this run is therefore the correct post-cycle value, not a missed
write — this run is endgame r57, not a repeat of r56. The two
13:00/13:56 CDT cap aborts recorded as "endgame r57" in today's
memory log were aborts, not plays: no evidence, no commit, no
rotation write. This run is the first actual r57 play.

## The carried items (from r56, in order)

1. 199-HOLD RELEASE CHASE (r56's mechanism, now named). r56 proved
   199 is not a near-miss score: it is the t5-1 HOLD bound in
   standing.js. A village sits at 199 because the wave-5
   combat-readiness gate (defer5) holds it there until it meets
   every readiness bar — armored 4, armed 6, tricks 3, veterans 2.
   What clears 199 is not one more point of standing; it is
   meeting every readiness bar. Closest r56: 88204 (control) short
   on veterans ONLY (1/2 living), and 88207 short on THREE bars
   (armor, weapons, veterans). r57 asks: on fresh seeds, does any
   village meet every bar (esp. a second living veteran +
   armor/weapons) and release the hold — peak >= 200, wave-5
   unlock, or full seat? Report per-village readiness bars AND
   standing peak beside every unlock report (r54 rule, kept).
2. DECLINE-BOILERPLATE WART (carried, measurement first). r56
   recorded ZERO withdrawals, so the mismatch rate stayed
   undefined (not zero). Code read in r56 (no change): the
   "PELLET HUMS / NO FEAST, NO SURGE" line in progression.js is a
   single hardcoded boilerplate string with the state-specific
   want-list (missTxt) appended; no unused state-specific
   template exists. Per the prereg's rule — generic by design
   means document, don't silently reword — the wart stays
   DOCUMENTED for Steve's call. r57 measures the mismatch rate
   across withdrawal seeds IF any fire; zero withdrawals keeps
   it carried, not closed.
3. M3 CONVERSION, SPREAD WATCH (carried). r56: Arm B 0 kills vs
   Arm A 0 kills. r55's edge (4 vs 0, all on one seed) did not
   generalize — on fresh seeds NOWALKIN produced flights, not
   kills (88207: 10 census fights, 0 kills, 4 fled, 4
   monster-fled, 1 talked-around, 1 villager died). r57 watches
   whether NOWALKIN produces a kill on any fresh seed, or
   flights again.
4. M3b LIVING VETERAN (carried, replication bar >= 2). r55's
   solve does NOT replicate: r56 0/6 waves seeds bank even one
   living veteran (control banks 1, not a waves seed). r57
   keeps the >= 2 bar and reports the spread (>= 1) beside it.
5. M2 OPPORTUNITY (carried). r56: only 1/3 Arm A seeds recorded
   a fight (88203, 2 talkDown; 88201/88202 zero-fight). The miss
   is opportunity, not instrumentation. r57 watches whether Arm A
   fight opportunity recovers on fresh seeds.
6. CONTROL SURVIVAL WATCH (carried, streak broken). r55's control
   died before its voicing window; r56's control (88204)
   announced d90, sat promptly, won relay/dark with 9 alive,
   voiced (noticed 1, bandCrossings 1). M5 GO. No second-strike
   substrate question. r57 watches the fresh control the same
   way; a fresh control death is a single data point, not a
   streak.
7. TELEMETRY BASELINE PROPOSAL (carried, not mid-run). r48–r56
   all reported satPenalty LOUD as EXPLAINED (baseline
   describes long-deferral sits, r37, not guard-ended windows);
   baseline NOT rolled. This run does NOT roll the baseline
   mid-run; it reports the deviation verdict the same way.
   Re-seeding from a same-regime guard-ended corpus is a
   NEXT-run proposal.

## Context, not substrate (measured elsewhere, NOT in this run)

- gap-route (branch, NOT on master at run start — verified:
  `git merge-base --is-ancestor 836a594fa HEAD` false): villagers
  routed to known monsters (return-to-fight HUNT errand), the
  routing choke behind villager kill conversion. It is another
  lane's unmerged branch; per repo port+review rules this run
  does NOT port it in. r57 measures on master substrate exactly;
  if r57 again shows 0 kills / flights, gap-route is the pending
  mechanism to cite, not a new discovery — and its landing is
  its coordinator's job, not this run's.
- w5twokey / lowdef / callertag arms (scale-onramp + food-economy
  loops, 2026-10-27): two-key lock DIAG-GO, first wave-4 kill
  (killer dead), leanlink SCREEN-NEGATIVE. They bound the wall
  from other lanes; r57 does not re-run them.

## Arms (r56 substrate exactly)

Substrate on every waves seed: capable base + deedhunt (deedPatrol +
surgeUpkeep) + vetcommit + greedy deferral (defaults MAXTIER 4 /
LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag + vetguard.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1 (waves only), TELEMETRY_FULL=1, RELAYGREY=1
(the forcedrift control requires it). 180d, death-aware.
- Arm A (engine census road): seeds 88301, 88302, 88303 (waves).
- Control: seed 88304 (forcedrift, capable + relaygrey FORCEDRIFT=1,
  greedy OFF, armory OFF, vetguard OFF — r49's canonical control).
- Arm B (fight-don't-talk, carried): seeds 88305, 88306, 88307
  (wavesnw = waves substrate + CAPABLE_NOWALKIN_W4=1 on waves seeds
  only).
Seeds verified fresh for endgame: the endgame probe block steps by
10 (88201→88301 across r56–r57); no 8830x hit in any prior endgame
note, probe, analyzer, or per-seed evidence dir (scoped check
before play; a broad evidence-wide grep for 8830[1-7] hits only
incidental numbers inside unrelated JSON values, not endgame
seeds).
Baseline: r56's waves seeds (census fights: 88203 2 talkDown,
88207 10 fights 0 kills; M3 0 vs 0; M3b 0/6 >= 1 living veteran;
M4 0/6 wave-5 unlock, 0/6 full seat; standing peaks waves 99,
172, 172, 0, 70, 199; control 199 held on veterans-only).

## Leg question

On fresh seeds, does any village meet every defer5 readiness bar
and release the 199 hold (peak >= 200, wave-5 unlock, or full
seat) — and does NOWALKIN produce a kill anywhere, or flights
again?

## What counts as an interesting finding

- A village peaking at standing >= 200, unlocking wave 5, or
  earning the FULL seat (any one advances the chase one step).
- A readiness-bar table showing which bar binds per village
  (veterans-only vs multi-bar) — the shape of the hold, not just
  the peak.
- A NOWALKIN kill on any Arm B seed (edge returns) — or a second
  straight flights-only block.
- A waves seed banking >= 1 living veteran (M3b spread breaks
  zero) or >= 2 (replication bar met).
- A withdrawal seed whose decline boilerplate matches vs
  mismatches its deeds — the rate, not one anecdote.
- A control that survives to its voicing window (streak stays
  broken) or dies before it (single data point, named cause).

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
  beside it (r54/r55/r56 rule).
- M5 VOICING CANONICAL (carried): 88304 — bandCrossings >= 1 AND
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
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

## Instrument

- scripts/probe-endgame-r57-20261027.js (r56 probe + seed block
  88301–88307 + perseed-endgame-r57 + transcript header r57;
  withdrawal end-rescan carried; no logic change).
- scripts/analyze-endgame-r57-20261027.js (r56 analyzer + same seed
  block + dir + M10/M11 tables; no binding logic change).
- Gates: PILOT (88301 Arm A + 88305 Arm B + 88304 control, 180d
  sweep mode — expand if ANY leg-question signal fires: >=1
  census fight OR a withdrawal OR full-seat gap movement
  (standing peak >= 190 or a gap component closer than r56's
  veterans-only hold); else document pilot-only and stop, per r55
  metric review 2's revised gate); DET (instrument-on twice,
  2x120d, seed 88301 — wrappers provably read-only:
  byte-identical); FID (env unset: wrapped == pure
  capable+deedhunt, mini gameDays/won/alive/pantry).

## Metric review (standing, carried)

- M4's GO stays narrow and must stay labeled: it counts the
  UNLOCK (uw=5) or the FULL seat, not the veterans bar. Every
  future endgame note reports the bar + standing peak beside
  the unlock, per r54/r55/r56's rule.
- Gate-passed-uncommitted: RETIRED (r55). The branch stays in
  the analyzer; it is no longer a binding question.
- Daily-slice withdrawal detector: RETIRED (r55). The end-rescan
  IS the detector outright.
- Telemetry baseline (hidden_files/telemetry-baselines/endgame.json)
  still describes long-deferral sits (r37), not guard-ended
  windows — r48–r56 all reported it EXPLAINED and did not roll
  it. Same rule here; re-seeding from a same-regime corpus is a
  NEXT-run proposal, not a mid-run re-score.
- Balanced panel (§15): no panel comparison applies — zero src/js
  changes planned, no lever moved on the default path (NOWALKIN
  default off, census + gate snapshot are read-only
  instrumentation). The comparison is r56→r57 via identical
  substrate, and Arm A→Arm B on one variable. If the
  decline-boilerplate fix enters scope, the panel comparison
  for that text change is a before/after transcript diff, not
  a balance panel (text only, no numbers moved).
