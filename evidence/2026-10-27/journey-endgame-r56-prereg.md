# Journey endgame r56 — STANDING-200 CHASE + DECLINE-BOILERPLATE WART (lane B, pre-registration 2026-10-27)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next) at
run end. This run takes r55's carried items, in order, on r55's
substrate exactly (r54 substrate carried through r55 unchanged).
No src/js changes planned at prereg; the only new code is the r55
probe/analyzer carried with seed numbers, evidence dir, and the
transcript-header wart fixed (r52 → r56).

Rotation note (verified before play): r55 endgame ran 2026-10-27
~00:00-00:45 CDT and merged as b486bcba3; social r59 adoption then
advanced 5 → 6, crisis r54 advanced 6 → 7, succession r52 advanced
7 → 4. Rotation-b reading 4 this run is therefore the correct
post-cycle value, not a missed write — this run is endgame r56,
not a repeat of r55.

## The carried items (from r55, in order)

1. FULL-SEAT / STANDING-200 CHASE. r55's closest gap is no longer
   a wall: 88107 met every full-seat bar except w5 faced 0/2, and
   wave 5 stayed locked because standing peaked at 199 — one point
   under the t5=200 threshold. Three r55 villages peaked at 199
   (88102, 88105, 88107). r56 asks: can any fresh-seed village
   bank one more standing point (peak >= 200), unlock wave 5, and
   close the w5 full-seat gap? Report per-village standing peak
   beside every unlock report (r54 rule, never "wave 5 reached"
   without the bar + peak).
2. TWO RETIREMENTS, APPLIED (r55 metric review, mechanism-backed).
   (a) Gate-passed-uncommitted is RETIRED as a binding question:
   empty across r53, r54, r55 (32 uncommitted fights classified,
   0 in the class); mechanism: a fight meeting all gates gets
   its flags set through the policy path the same turn. The
   classifier branch stays in the analyzer for a future
   wrapper-lookup-disagreement seed; it is no longer judged.
   (b) Daily-slice withdrawal detector is RETIRED: zero daily
   hits r52–r55; every withdrawal arrived via end-rescan, and
   the decline fires at the night transition, which the per-day
   slice structurally misses. The end-rescan IS the detector
   outright from this run. Withdrawals are still reported with
   day + source (end-rescan) + line quoted.
3. DECLINE-BOILERPLATE WART (carried, measurement first). r55:
   the decline line's boilerplate ("NO FEAST, NO SURGE") does
   not match 88101's deed state (sent d26, surge d41) — the
   boilerplate is generic, only the trailing want-list is
   state-specific. r56 measures the wart across all withdrawal
   seeds (boilerplate-vs-deed mismatch count) and reads the
   decline-line code: if the boilerplate is generic by design
   (no state-specific template exists), the wart is DOCUMENTED
   as a text-fidelity gap for Steve's call, not silently
   reworded; if a state-specific template exists but is
   unused, a fix + proof test is in scope. No rewording on
   speculation.
4. CONTROL SURVIVAL WATCH (carried, second-strike trigger).
   r55's control (88104 forcedrift) died village-lost before
   its voicing window (influencer arena deaths d60–61 wiped 5).
   M5's NO-GO there was a control death, not a voicing bug.
   r56 watches whether the fresh control survives; a SECOND
   straight control death triggers a substrate question for
   Steve (harden the control, or accept M5 as death-gated) —
   a Steve-call, not a silent instrument change.
5. M3 CONVERSION EDGE, SPREAD WATCH. r55: Arm B 4 vs Arm A 0,
   all 4 kills on one seed (88107) — the edge holds but is one
   village's road, not an arm-wide effect. r56 watches whether
   the edge spreads beyond a single seed.
6. TRANSCRIPT-HEADER WART (instrument, fixed this run). r55's
   transcripts still said "journey-endgame r52" — probe header
   text never updated across carries. Fixed in the r56 probe
   (header says r56); verified by grep on the emitted
   transcripts, not a game bug.
7. TELEMETRY BASELINE PROPOSAL (carried, not mid-run). r48–r55
   all reported satPenalty LOUD as EXPLAINED (baseline
   describes long-deferral sits, r37, not guard-ended
   windows); baseline NOT rolled. Next-run proposal stands:
   re-seed the baseline from a same-regime guard-ended
   corpus and record the regime in the file. This run does
   NOT roll the baseline mid-run; it reports the deviation
   verdict the same way.

## Arms (r55 substrate exactly)

Substrate on every waves seed: capable base + deedhunt (deedPatrol +
surgeUpkeep) + vetcommit + greedy deferral (defaults MAXTIER 4 /
LASTDAY 145, NOT tuned) + armorydrive + fullseat-diag + vetguard.
FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1,
CAPABLE_VETGUARD=1 (waves only), TELEMETRY_FULL=1, RELAYGREY=1
(the forcedrift control requires it). 180d, death-aware.
- Arm A (engine census road): seeds 88201, 88202, 88203 (waves).
- Control: seed 88204 (forcedrift, capable + relaygrey FORCEDRIFT=1,
  greedy OFF, armory OFF, vetguard OFF — r49's canonical control).
- Arm B (fight-don't-talk, carried): seeds 88205, 88206, 88207
  (wavesnw = waves substrate + CAPABLE_NOWALKIN_W4=1 on waves seeds
  only).
Seeds verified fresh for endgame: the endgame probe block steps by
10 (88101→88201 across r55–r56); no 8820x hit in any prior endgame
note, probe, or per-seed evidence dir (checked before play).
Baseline: r55's waves seeds (12 census fights: talkDown 6, vKill 5,
vDie 1, vFlee 0, mFlee 0, otherEnd 0; M3 4 vs 0; M3b 1/6 seeds with
2 living veterans — 88107; M4 0/6 wave-5 unlock, 0/6 full seat,
closest gap w5-only on 88107; standing peaks 199 on 88102, 88105,
88107).

## Leg question

On fresh seeds, does any village bank standing 200 (unlocking
wave 5 and closing the w5 full-seat gap) — and does the decline
boilerplate mismatch recur, on how many withdrawal seeds?

## What counts as an interesting finding

- A village peaking at standing >= 200, or unlocking wave 5, or
  earning the FULL seat (any one advances the chase one step).
- A withdrawal seed whose decline boilerplate matches its deeds
  (the by-luck case, like 88103) vs mismatches (like 88101) —
  the mismatch rate, not one anecdote.
- A control that survives to its voicing window (breaks the
  death streak) or dies a second straight run (triggers the
  substrate question).
- An Arm B kill on a seed other than the single fighting seed
  (edge spreads) — or a second straight one-seed concentration.
- A gate:veterans-met fight (vetcommit's job done, fight
  uncommitted by design) — the class that bounds the retired
  class's scope.

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
  beside it (r54/r55 rule).
- M5 VOICING CANONICAL (carried): 88204 — bandCrossings >= 1 AND
  noticedCount >= 1. A control death before the window is NO-GO
  with the cause named (death, not voicing); a second straight
  control death triggers the substrate question in Blanks.
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
- M11 STANDING PEAK (new): every waves seed's standing peak is
  reported; the chase is judged on peaks (how many at 199, any at
  >= 200), not on the unlock alone.
- REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty present + voiced-line match on sat seeds.

## Instrument

- scripts/probe-endgame-r56-20261027.js (r55 probe + seed block
  88201–88207 + perseed-endgame-r56 + transcript header r56;
  withdrawal end-rescan carried; no logic change).
- scripts/analyze-endgame-r56-20261027.js (r55 analyzer + same seed
  block + dir + M10/M11 tables; no binding logic change except
  M2d's retired-class note and M11 standing-peak table).
- Gates: PILOT (88201 Arm A + 88205 Arm B + 88204 control, 180d
  sweep mode — expand if ANY leg-question signal fires: >=1
  census fight OR a withdrawal OR full-seat gap movement
  (standing peak >= 190 or a gap component closer than r55's
  w5-only); else document pilot-only and stop, per r55 metric
  review 2's revised gate); DET (instrument-on twice, 2x120d,
  seed 88201 — wrappers provably read-only: byte-identical);
  FID (env unset: wrapped == pure capable+deedhunt, mini
  gameDays/won/alive/pantry).

## Metric review (standing, carried)

- M4's GO stays narrow and must stay labeled: it counts the
  UNLOCK (uw=5) or the FULL seat, not the veterans bar. Every
  future endgame note reports the bar + standing peak beside
  the unlock, per r54/r55's rule.
- Gate-passed-uncommitted: RETIRED (r55). The branch stays in
  the analyzer; it is no longer a binding question.
- Daily-slice withdrawal detector: RETIRED (r55). The end-rescan
  IS the detector outright.
- Telemetry baseline (hidden_files/telemetry-baselines/endgame.json)
  still describes long-deferral sits (r37), not guard-ended
  windows — r48–r55 all reported it EXPLAINED and did not roll
  it. Same rule here; re-seeding from a same-regime corpus is
  a NEXT-run proposal, not a mid-run re-score.
- Balanced panel (§15): no panel comparison applies — zero src/js
  changes planned, no lever moved on the default path (NOWALKIN
  default off, census + gate snapshot are read-only
  instrumentation). The comparison is r55→r56 via identical
  substrate, and Arm A→Arm B on one variable. If the
  decline-boilerplate fix enters scope, the panel comparison
  for that text change is a before/after transcript diff, not
  a balance panel (text only, no numbers moved).
