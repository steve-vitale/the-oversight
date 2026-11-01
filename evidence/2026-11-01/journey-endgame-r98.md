# Journey endgame r98 — THE FEASTS BROUGHT THE PRODUCERS (lane B, 2026-11-01)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start; this run writes 5
(social life next) at run start (verified by re-read after landing).
Run number basis: last numbered Lane B run is r97 (succession,
landed 2026-11-01; r96 crisis also 2026-11-01). This run is r98.

Substrate r95 EXACTLY (capable + deedhunt + vetcommit + greedy
deferral defaults MAXTIER 4 / LASTDAY 145, NOT tuned + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control
clean). 180d, death-aware. NEW vs r95, both read-only
instrumentation: the W5ARRIVAL set r95's metric review named
(W5FACE first-faced days, W5MENTIONS full-capture scan with
firstContext, W5BLOCKED wave split on blocked arrivals). Probe:
`scripts/probe-endgame-r98-20261101.js`. Analyzer:
`scripts/analyze-endgame-r98-20261101.js`, full output in
`evidence/2026-11-01/journey-endgame-r98-analysis.txt`.
Analyzer exit 1, PRIMARY NO-GO, ALL NO-GO — driven by M2-census,
M3b-peak, and M4-wave5-or-full, all three explained below as
arm-composition outcomes, not instrument failures (M2c, M2d,
VETCONV, LOSSKIND, W5-question all GO). No src/js change this run.

Seeds: 89301-89303 waves (Arm A), 89304 forcedrift control,
89305-89307 wavesnw (Arm B, waves + NOWALKIN_W4). Pilot
(89301+89305+89304) met the prereg gate (2 sats, census fights,
1 classified village loss), so the run expanded to the full 7;
pilot seeds reproduced BYTE-IDENTICALLY in the full sweep (JSON
snapshotted to `evidence/2026-11-01/r98-pilot/` before the sweep
overwrote them). Determinism leg: DET GREEN byte-identical on
89301 (2x 120d).
Heartbeat loop verified landing (registry heartbeat fresh at every
check); no other loop acted on the tree. Stale-lock recovery at
run start: the lock file (run 2026-11-01T20:14:36Z) had NO
registered worktree and NO heartbeat, and was 2h41m old — dead
by both the no-registry rule and the 90-minute fallback. Lock
deleted, fresh lock written (2026-11-01T22:56:06Z), to be deleted
at closeout. Worktree slug journey2-endgame registered clean.
Base: master 28e636868 at registration (git pull already up to
date). Main tree clean at pre-flight (0 files), disk 24%.

## Village assessment, in plain words

Four villages won the lesser seat, three scattered. No village
won the full seat — but for the first time, a seed faced TWO
wave-5 types and still sat lesser, because of a wave-3 breadth
gap, not wave 5.

- 89301 (waves): SCATTERED d51. Two people left at the end,
  pantry 0, 0 feasts all run, never past wave 2. Starved before
  the endgame window opened; the same honest scattering line as
  r95's 89201.
- 89302 (waves): SCATTERED d35 — the earliest loss in the block.
  Seven people left, pantry 0, 0 feasts, never past wave 2. The
  village scattered while most of its people were still alive:
  hunger, not death, broke it.
- 89303 (waves): SCATTERED d81. Two people left, pantry 0, 0
  feasts, reached wave 3 but never fought a wave-4 monster. The
  longest-lived Arm A seed, same ending.
- 89304 (forcedrift control): WON LESSER, relay/dark, announced
  d98, sat d104. Ten alive, pantry 19,503. Wave 5 unlocked d78
  (release snapshot: 2 living veterans, rd5 ready). The Spoiler
  came to a feast d81 and was killed d82 (11 turns); the Timeslot
  came to a feast d92 and killed Emmett Young d93 (15 turns) —
  Emmett was one of the two snapshot veterans. The Editor was
  seen d101 and blocked at a boundary once. A Finale-crew march
  beat fired d95 (broadcast tower, Commercial Break node 1 of 3,
  "needs 20 allied blades") and sat unresolved d104. The audit
  names the seat gap exactly: waves 16/5/3 + 3 wave-4 + 2 wave-5,
  10 contests, 3 crises — binding ["w3"], worst "w3". One more
  distinct wave-3 type faced, and this village's deed counts
  would have read full.
- 89305 (wavesnw): WON LESSER, beloved/light, announced d90, sat
  d101 after an 11-day deferral (tier-1 penalty 13, 3 losses in
  the window). Six alive, pantry 12,723. Six census fights, all
  fled or other-end, zero kills. The beloved path's first win in
  this series' notes (final:audience).
- 89306 (wavesnw): WON LESSER, beloved/light, announced d90, sat
  d95. Four alive, pantry 6,904. ZERO census fights — a win with
  no fights at all, the quiet shape r95's 89207 showed, now on
  the beloved path (final:quiet).
- 89307 (wavesnw): WON LESSER, beloved/light, announced d118,
  sat d118. Seven alive, pantry 5,617. Eight census fights, one
  wave-4+ kill, one living veteran banked d117 — the day before
  sitting.

## Leg questions, answered

1. W5FACING — ANSWERED, WITH THE PATH NAMED. The only uw=5 seed
   (89304, control) FACED: Spoiler d82, Timeslot d93, in a 26-day
   window (unlock d78 -> sat d104). Both facings arrived through
   the FEAST-SCAVENGER channel, and the instrument proves the
   sequence, not just the outcome: each type was mentioned the
   night before as a feast scavenger ("The Spoiler is circling
   the edge of the light. It followed the feast here. Face it
   while the feast is in you — or let the watch drive it off.")
   and fought the next day. The blocked-arrival valve is a
   minor tax, not the wall: exactly 1 blocked wave-5 arrival
   (Editor) against 2 faced types, and the Editor was ALSO seen
   d101 — it arrived twice, once blocked, once seen. The
   distinguisher is two-layered, and the second layer is a
   correction to the naive reading: (a) UNLOCK — all six waves
   seeds never reached uw=5 (max uw 4), so the wave-5 pool never
   contained a Producer for them; their fork class is
   NEVER-ARRIVED, and every one of their raw "wave-5 mentions"
   is a lookalike (see below). (b) FEAST — the only uw=5 seed
   feasted heavily (7 feasts, 30 feasted days, scholar home at
   dusk 80/80 dusks, vs waves seeds away at dusk 51-64% with 0
   feasts), and its facings rode feasts. But feasts are NOT
   sufficient: r95's feasting uw=5 control (89204, 10 fs-feasts,
   18 feasted days) faced zero wave-5 types. The honest rate
   across feasting uw=5 seeds is 1 faced of 3 (89204, 89206,
   89304 — 89206 feasted 3/3 and faced 0). The channel exists
   and is now proven with day-before mentions; its firing is
   rare, consistent with pool dilution (the spawn pool holds
   every monster of every unlocked wave, so 10 Producers share
   it with 100+ earlier types at default weight — a mechanism
   hypothesis from monsterWavePool, not a measured rate).
2. WALL CONTINUITY — eleventh block: the wall as "veterans/
   unlock" stands on the waves arms (0/6 peaked >=2, 0/6 unlocked
   wave 5) and falls on the control (peak 3, unlock d78, 2 wave-5
   faced). The wall as "full seat" stands: 0/7, but its shape is
   NEW (see 8).
3. VETCONV — ANSWERED, r95 rule holds. 6/6 reconciled. Sums exact
   everywhere (89305: 11=11, 89307: 52=52), unseen=0 everywhere,
   pre-call turns attributed (89305: 5, 89307: 6). Kill
   conversion on waves seeds: 1 wave-4+ kill (89307), all other
   waves-seed engagements ending fled/other-end.
4. LOSS-KIND — ANSWERED, 3/3 classified. All three losses are
   scattering (flag + SAY line agree; pantry 0 in all three).
   No extinction, no no-successor this block.
5. WAVES AWAY, sixth block — no dip to explain, but the arm
   table is composition, not behavior: Arm A dusks are truncated
   by early scatter (38/25/59 dusks vs Arm B 74/74/91). Away
   shares: waves 61/52/51%, wavesnw 57/64/57%, control 0% (home
   every dusk — the feast enabler). Contribution shortfall is
   still exactly 1500 kcal median on every seed — the gate has
   not moved in six blocks.
6. M18 REGRESSION — PASS, seventh block clean. 236 back-with
   lines scanned across 7 seeds, 0 confirmed ghosts, 0
   first-name-only hits.
7. CONTENTION WATCH — NO FLAG under the prereg rule (swing >10pt
   vs BOTH r95 and r77). Waves share 100% (blocked 33,
   committed 0) swings 25.5pt vs r95's 74.5% but only 6.0pt vs
   r77's 94% — and the 100% is committed=0 (Arm A died before
   any fight), not unblocking: blocked also FELL 41 -> 33.
   Wavesnw share 79.7% (blocked 55, committed 14) swings 7.0pt
   vs r95's 86.7% and 20.3pt vs r77's 100% — the move is a
   fighting increase (6 -> 14 committed), with blocked also up
   (39 -> 55). Counts beside shares, as the metric review
   requires. CORRECTION to the series' M9-supply label: the
   analyzer's "95 blocked wave-4 arrivals" counts ALL blocked
   arrivals. The r98 split is 95 total = 8 wave-4-named + 1
   wave-5-named + 86 other-wave/unmapped. r95's "85 blocked
   wave-4" carries the same mislabel (total, not wave-4-named).
8. FULL SEAT LAST MILE — NEW SHAPE. 89304: w5 met 2/2, w4 met
   3/3, w3 short 3/4 — the first sat seed whose ONLY deed gap
   is wave-3 breadth. The last mile is no longer "face wave 5";
   it is "face wave 5 AND cover wave 3". The waves seeds' gaps
   are unchanged in kind (89305: w5:0/2; 89306: w4:0/3 + w5:0/2;
   89307: w5:0/2).
9. NOWALKIN, fourteenth block — ARM B WINS. Arm A kills 0,
   Arm B kills 1 (89307). Series tally now Arm A 5, Arm B 6,
   three ties. Still a tally, not a lever verdict.
10. RELAY-BRANCH TALLY — dark 12, grey 1, light 1 (89304 dark).
    No second grey or light observation.
11. DECLINE vs SILENT NO-SHOW — no decline-and-return, no
    decline-and-never-return. Non-announced seeds: all three
    honest scattering deaths. No silent no-show.
12. 199 MECHANISM — holds. 89305 gated 199 for 125 days, 89307
    for 12 days, control 54 days at 199 before breaking to 592
    after the wave-5 unlock.

## Pre-registered verdict

Analyzer exit 1. PRIMARY NO-GO, ALL NO-GO — on three verdicts
whose causes are arm composition, stated plainly so the NO-GO
is not misread as an instrument failure:
- M2-census NO-GO: Arm A with fights 0/3 — all three Arm A
  seeds scattered (d35/d51/d81) before reaching any wave-4
  fight. The census instrument itself is GO (M2c engine
  coverage 6/6, M2d gate-named 5/5, VETCONV 6/6).
- M3b-peak NO-GO: peak(>=2) 0/6 on waves seeds (only 89307
  peaked 1, d117; the control peaked 3 but sits outside
  wavesAll, as in every block).
- M4-wave5-or-full NO-GO (waves scope): 0/6 waves seeds
  unlocked wave 5 or earned the full seat. The control DID
  both unlock (d78) and face 2 wave-5 types — M4's waves-only
  scope reads closed while the run's W5 question is answered.
  See metric review for the scope note.
- GO (all others incl.): M1-guard 7/7, M2c, M2d, M2b
  NO-DATA (no dieFlag fights on waves seeds — nothing to
  attribute), M8-exit-canon, M3-conversion (tally, Arm B 1 vs
  Arm A 0), W5-question (1 uw=5 seed, complete records),
  M13-release-snapshot (vacuous on waves seeds), M14-invite,
  M5-voicing, M5b-relay-tabulation, M6-guard-named,
  M10-fullseat-gap, M11-standing-peak, M12-bar-record,
  M15-feast-census, M16-dusk-census, M17-surge-mode,
  M18-ghost-scan, M19-grant-log, M20-standing-trace,
  M21-audit-crosscheck, M22-feast-hold, REG-r35-audit,
  REG-r37-satpenalty, VETCONV-recon 6/6,
  LOSSKIND-classified 3/3.
- M4b: retired as a verdict per r95's metric review; INFO
  only (0/6 conjunction on waves seeds this block — expected,
  since no waves seed unlocked).

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 89304's relay/dark finale, read in full
(announce-sliced transcript, finale section). The audit is
honest (16/5/3 + 3 wave-4 + 2 wave-5 fought, 10 contests, 3
crises; "the table does not rise. It prices."). The war path
names kills by day and killer ("On day 82, you put down
Ugly-Eyes. On day 78, Panas put down Big-Eyes"). The relay
finale is the series' darkest beat and it lands: the System
proposes wiring children into the machine ("Nodes. Little warm
nodes... children adapt SO fast"), the player says yes, "The
village doesn't cheer. The village has never been this quiet,"
and the merge completes "glorious" while "The village grieves
you while you're alive." The Oversight coda indicts by the
same device as r95 (napping children in glass, looking away on
purpose because busy). Watch item, not a defect: the war path
also says "THE FINALE came. Named and located" — the Finale
itself was never fought; only its crew beat fired (broadcast
tower d95, Commercial Break node 1 of 3). "Came" here means the
march beat arrived, not a fight; a reader could misread it as
a third wave-5 facing. The audit's own numbers (2 wave-5
fought) keep the record honest.

Beat 2 — 89305's beloved/light finale, read in full
(announce-sliced transcript, finale section). The audit is
honest (16/6/6 + 5 wave-4 fought, 11 contests, 3 crises), the
war-path bar names the gap plainly ("blood your fighters (0 of
2 veterans)"), and the deferral cost is voiced ("1 week kept
waiting, 3 of Haven lost meanwhile. Every door's standing
−13."). The beloved finale reads with voice: "You spend it
all — the love, the light, the finale slot — on people the
cameras never found. You name the unfilmed villages. You name
the dead." The ending resolves ("the show becomes the
government without anyone quite deciding it should... The
ratings dip. The constitution doesn't.") and the Oversight
coda lands the same indictment as beat 1, from the opposite
path — the symmetry is the point, not a copy error.

Live-build conversation check: not run — this run changes no
UI or dialogue code (instrument-only, zero src/js diff), so
there is no player-facing flow to verify at 390x844; the r95
precedent (same leg, same instrument-only pattern) likewise
verified dialogue via transcripts. If a future run touches
dialogue UI, the live check applies then.

## Blank: W5 arrival instrumentation (filled) + gaps for the next run (documented)

FILLED — the r95-named instrument blank: W5FACE days match
fight days exactly (spoiler mention d81 -> fight d82; timeslot
mention d92 -> fight d93); blocked arrivals now split by wave
(8 w4 / 1 w5 / 86 other of 95 total); mention contexts name
the feast-scavenger path in the monster's own words. No src/js
change proposed or needed for this blank.

DOCUMENTED, NOT FIXED — three instrument gaps for the next
run (all cheap, all read-only, none worth re-running this
sweep to populate):
1. Blocked arrivals carry capIdx, not day: the Editor's single
   blocked wave-5 arrival cannot be dated from the stored
   record. Fix: day-map blockedArrivalsOf via dayBounds at
   summary, the same pattern the mention scan already uses.
2. Mention lookalikes: every waves seed's raw "wave-5 mention"
   is a false positive — the SYSTEM "SEASON FINALE
   APPROACHES!" broadcast (finale@d30 on all 7 seeds) and the
   Rerun overtime/tiger-move lines (rerun@d23, rerun@d99).
   The cleaned classification (NEVER-ARRIVED for all six waves
   seeds) required reading firstLines by hand. Fix: classify
   mention firstLines by line-kind (broadcast / buff / move
   vs monster-presence) in the analyzer, and report the
   cleaned class beside the raw count.
3. M9-supply label: the analyzer's "blocked wave-4 arrivals"
   counts all blocked arrivals. Fix: relabel to total blocked
   + the wave split (this note's 8/1/86). This also corrects
   r95's "85 blocked wave-4" phrasing.

DOCUMENTED, NOT A DEFECT CLAIM — the Finale-crew march beat
(broadcast tower d95, Commercial Break node 1 of 3, "needs 20
allied blades") fired on 89304 and sat unresolved d104. Whether
a sitting village should resolve, decline, or carry the march
is an open design question, not a bug report: sitting may
legitimately pre-empt a muster call.

## Metric review (for the NEXT run, not this one)

- W5-question: keep, with the lookalike-cleaned classification
  (gap 2 above) as the reported class. The question's next
  form: with the feast-scavenger path proven, what sets its
  rate — feast frequency, pool dilution, or the scavenger draw
  itself? r95's feasting-but-0-faced control (89204) vs
  r98's feasting-and-faced control (89304) is the comparison
  to design around; do not claim feasts suffice.
- M2-census: keep the bar, but when an arm collapses before
  the wall (all-scatter, committed=0), the NO-GO must be
  reported as arm composition, as here — not as census
  failure. Proposed (not applied): a conditional reading that
  evaluates M2 on surviving Arm A seeds when the arm's loss
  rate hits 3/3 before day 90.
- M4-wave5-or-full scope: keep wavesAll for series
  comparability, but report control unlocks/facings beside it
  (as here) so a control-only unlock never again reads as a
  closed wall.
- M18 guard is now seven blocks clean (r74, r75, r76, r77,
  r92, r95, r98 — r98 scanned 236 lines). Keep the scan; do
  not retire it yet.
- NOWALKIN tally Arm A 5, Arm B 6, three ties (fourteen
  blocks). Still no lever fate; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot.
  This run's check LOUD lines (maxTier 16->1,
  satPenalty.penalty 91->16) are the same stale-baseline
  artifact as r48–r95: EXPLAINED, baseline NOT rolled. The
  re-seed proposal stands.
- Next run's question, named: the last mile is now wave-3
  breadth + the feast-scavenger rate — on a substrate that
  reaches uw=5, which seeds cover w3 4/4, and how often does a
  feast draw a Producer?

## Regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 282 passed, 8 failed in 580s (log:
evidence/2026-11-01/journey-endgame-r98-checkquick.log).
- 6 standing pre-existing families — measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes — matching r95's
  baseline exactly.
- 2 solo-reproduced deterministic failures, both pre-existing
  at base 28e636868 and unrelated to r98 (this run has ZERO
  tracked modifications — only new probe/analyzer scripts +
  new evidence files — and neither failing test touches r98's
  scripts): test-foodpower-20261014 (29/30; the failure is the
  ontology validator over 129 system files) and
  test-capable-bot-20261014 (39/40; "real capable player
  combat earns the food deed at first use"). Solo re-runs
  reproduce both identically, so these are not load flakes.
  They are recorded here, not fixed: both sit outside this
  leg, and a fix belongs to its owning lane, not to an
  instrument-only endgame run.
- r95's 2 contention timeouts (trust-observer-neutrality,
  test-synergy-stall) and its measurement-cache-flags load
  artifact both PASSED this block — the suite total is
  unchanged (290 tests: r95 281+9, r98 282+8).
- Zero failures attributable to r98: instrument-only, zero
  modified tracked files — verified via `git status`: only new
  probe/analyzer scripts + new evidence files. The run's own
  proofs (DET GREEN, pilot reproduction byte-identical,
  analyzer verdicts above, telemetry check with explained LOUD
  lines) are all green except the three composition NO-GOs
  already explained.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/endgame.json --current
'evidence/2026-11-01/perseed-endgame-r98/endgame-r98-*.json'
--metrics maxTier,satPenalty.penalty --sweep-rows`:
- LOUD: maxTier swung -94%: baseline 16 -> current 1 (n=7).
- LOUD: satPenalty.penalty swung -82%: baseline 91 -> current
  16 (n=7).
Verdict: EXPLAINED, baseline NOT rolled — the same stale-
baseline artifact as r48–r95 (the baseline file itself says
its regime is unrecorded and forbids pre-seat comparisons, and
the check's "current" values aggregate 7 seed rows, not a
single-seed snapshot). This block's lower values than r95's
(4 / 34) track the Arm A collapse, not a telemetry break:
scattered seeds accrue no sat penalties and low max tiers.
The re-seed proposal stands.
