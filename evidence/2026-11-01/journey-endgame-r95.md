# Journey endgame r95 — THE CONJUNCTION MET, AND THE SEAT STILL WASN'T FULL (lane B, 2026-11-01)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start; this run writes 5
(social life next) at run end (verified by re-read after landing).
Run number basis: last numbered Lane B run is r94 (succession, landed
2026-11-01). This run is r95.

Substrate r92 EXACTLY (capable + deedhunt + vetcommit + greedy deferral
defaults MAXTIER 4 / LASTDAY 145, NOT tuned + armorydrive + fullseat-diag
+ vetguard on waves seeds; forcedrift control clean). 180d,
death-aware. NEW vs r92, both read-only instrumentation: the two
VETCONV fixes r92's metric review named (baseline + pre-call capture —
see Blank). Probe:
`scripts/probe-endgame-r95-20261101.js`. Analyzer:
`scripts/analyze-endgame-r95-20261101.js`, full output in
`evidence/2026-11-01/journey-endgame-r95-analysis.txt`. Analyzer exit 0,
PRIMARY GO, ALL GO — the first endgame block in this series with no
primary NO-GO. No src/js change this run.

Seeds: 89201-89203 waves (Arm A), 89204 forcedrift control,
89205-89207 wavesnw (Arm B, waves + NOWALKIN_W4). Pilot
(89201+89205+89204) met the prereg gate (2 sats, census fights, 1
classified village loss), so the run expanded to the full 7; pilot seeds
reproduced BYTE-IDENTICALLY in the full sweep (JSON + transcript,
snapshotted to `evidence/2026-11-01/r95-pilot/` before the sweep
overwrote them). Determinism leg: DET GREEN byte-identical on 89201
(2x 120d).
Heartbeat loop verified landing (registry heartbeat fresh at every
check, 8-minute cadence); no other loop acted on the tree. No lock file
existed at run start, so no stale-lock recovery was needed; fresh lock
written (2026-11-01T13:56:07Z), to be deleted at closeout. Worktree slug
journey2-endgame registered clean (no deviation needed — no prior
journey2-endgame branch). Base: master 7c0f1f4d0 at registration
(git pull already up to date).

Infrastructure notes (fail-loud class, recovered without forcing):
- EPERM flap on .git ref writes: the first lock-file write EPERM'd
  (0-byte file left behind); retry succeeded. Worktree registration
  then failed 6 times over ~90s with "couldn't write
  .git/refs/heads/journey2-endgame.lock" — the documented intermittent
  container EPERM on .git writes (AGENTS.md 2026-10-23). No manual ref
  surgery was attempted; the 7th attempt (after read-only prep work)
  registered clean and its heartbeat landed 2026-11-01T14:00:37Z.
- The registration heartbeat itself took ~109s to land (registry flock
  queue behind a sibling loop's reaper) — the same queue r93 saw. The
  heartbeat loop's later beats landed promptly.

## Village assessment, in plain words

Six villages won the lesser seat, one scattered. No village won the
full seat — but for the first time in the series, a village met the
full seat's hard bars AND was announced AND survived to sit, and still
sat lesser, because it had never faced a wave-5 monster (below).

- 89201 (waves): SCATTERED d105. One person left at the end (Tarek
  El-Gammal, fishing guide), pantry 0, 0 feasts all run, surge never.
  18 deaths on the record: starvation, sickness, the wild, a Reunion
  fight d88 that killed Luis and Bekzat. The scattering line is
  honest: "Haven couldn't hold. On the third hungry day, people
  started walking — in different directions. The scattering, again."
  The 89014 shape (lost with survivors) recurs here, classified by
  flag, not by survivor count.
- 89202 (waves): won lesser, witness/light, announced d90, sat d107
  after a 17-day deferral (tier-2 penalty 17, 3 losses in the window).
  7 alive, pantry 11,667. 8 census fights (2 villager deaths, 3
  talk-downs, 3 monsters fled). Standing gated at exactly 199 for 150
  days. Two ascensions from one village (Desmond Clarke, Rosa Mendez)
  — the table notes it has never seen that before.
- 89203 (waves): won lesser, feared/light, announced d90, sat d90.
  10 alive, pantry 9,441. 5 census fights, 2 wave-4+ kills by one
  villager, 1 living veteran at the end. Standing gated 199 for 99
  days. The efficient win: announced and sat the same day.
- 89204 (forcedrift control): won lesser, relay/dark, announced d119,
  sat d119. 9 alive, pantry 22,899. Release snapshot d110 (wave 5
  unlocked, 2 living veterans, rd5 ready) — and, like 89206, it sat
  lesser with w5 faced 0/2. Relay tally moves to dark 11, grey 1,
  light 1.
- 89205 (wavesnw): won lesser, feared/light, announced d90, sat d99
  after a 9-day deferral (tier-1 penalty 10). 9 alive. 3 census fights
  (1 villager death, 1 monster fled, 1 other end). Zero wave-4 faced
  is not the story here — w4 faced 4 — but w5 faced 0.
- 89206 (wavesnw): THE CONJUNCTION SEED. Ursula Weber killed the Eater
  d75; Jovan Milic killed the Algorithm d82; release snapshot fired
  d83 (wave 5 unlocked, 2 living veterans, rd5 ready: 7 armored, 7
  armed, 25 tricks). Jovan died d85 ("the night"); Leo Martin killed
  the Congregation d86 and became the second living veteran. Announced
  d90, sat lesser d90 with Ursula + Leo living, 6 alive, pantry
  26,693 — the richest pantry in the block. The village did the hard
  part, replaced its fallen veteran, announced, sat, and survived —
  and still took the lesser seat, because no wave-5 type was ever
  faced (gap w5:0/2, the same gap as every other sat seed).
- 89207 (wavesnw): won lesser, feared/light, announced d90, sat d97
  after a 7-day deferral (tier-1 penalty 7). 5 alive. Zero census
  fights, w4 faced 0 — a win built on breadth below the wall (w1 15,
  w2 9, w3 5), like 89105 before it.

## Leg questions, answered

1. CONJUNCTION — ANSWERED YES, AND THE ANSWER MOVES THE WALL. 89206
   meets bars (uw=5, 2 living veterans, rd5 ready d83) AND
   announcement (d90) AND survival to sit (sat d90, 6 alive) — the
   M4b conjunction goes 1/6, the first conjunction pass in the
   series (r92's 89106 met bars but was never announced). The control
   89204 does the same (uw=5, announced d119, sat d119, 9 alive).
   Neither takes the full seat, because the full-seat gap on BOTH is
   w5:0/2. The binding constraint is no longer the wave wall, the
   feast/announcement track, or post-peak survival — all three held
   on 89206. It is wave-5 FACINGS: wave 5 unlocks, veterans bank,
   the table announces, the village sits — and no wave-5 monster is
   ever met. (r92's 89106 faced 2 wave-5 types without sitting, so
   facings are possible in principle; r95 faced 0 across all 7 seeds.)
2. VETCONV — ANSWERED, FIRST GO IN THE SERIES. 6/6 reconciled under
   the pre-registered r95 rule. The fixed instrument proves itself:
   increment-log sums equal vetFights EXACTLY on every waves seed
   (9=9, 22=22, 68=68, 14=14, 17=17), unseen=0 everywhere (r92 had
   unseen turns on 3 seeds), and the pre-call capture attributes
   12 end-and-clear turns (89202: 6, 89203: 3, 89205: 2, 89206: 1)
   that would have read 'unseen' before. vetFights counts
   fight-TURNS, confirmed: 89203's 68 turns across 5 fights, 2 kills;
   89206's 17 turns across 3 fights, 3 kills. Kill conversion on
   this substrate: 5 wave-4+ kills on waves seeds (89203: 2, 89206:
   3), all by committed fights; engagements end vKill 5, mFlee 4,
   talkDown 4, vDie 4, vFlee 3, otherEnd 1 (census outcomes).
3. LOSS-KIND — ANSWERED, 1/1 classified. 89201 is scattering (flag +
   SAY line d105, 1 alive, pantry 0). No extinction, no
   no-successor this block. The flag + line agree; survivor count
   alone would have misread it.
4. WALL CONTINUITY — tenth block: the wall as "veterans/unlock" is
   BROKEN a second time (89206 peaks 2, unlocks wave 5, second block
   running after 89106). The wall as "full seat" stands: 0/7, 0 in
   the series on this substrate — but its shape is now precise:
   every sat seed's gap is w5:0/2 (89207 adds w4:0/3).
5. WAVES AWAY, fifth block — NO DIP, and the r92 dip reads as
   composition, confirmed. Waves 59.6% (133/223 dusks), wavesnw
   61.8% (126/204) — both arms back near the r75/r76 65% level, and
   the per-seed table is uniform (55–67%, no homebody outlier like
   r92's 2% seed). Median contribution shortfall is still exactly
   1500 kcal on every seed — the contribution gate has not moved in
   five blocks.
6. M18 REGRESSION — PASS, sixth block clean. 283 back-with lines
   scanned across 7 seeds, 0 confirmed ghosts, 0 first-name-only
   hits.
7. CONTENTION WATCH — waves FLAGS by the prereg rule (share 74.5%,
   down 20.8pt vs r92's 95.3% and 19.5pt vs r77's 94%), but the cause
   is fighting, not unblocking: waves blocked fell 61 -> 41 while
   committed census fights rose 3 -> 14. Wavesnw 86.7% (blocked 39,
   committed 6) swings 8.3pt vs r92's 78.4% — no flag. The
   analyzer's r77-only flags are the same story told against the
   older baseline; counts beside shares (this note) keep it honest.
8. FULL SEAT LAST MILE — no new shape. All five sat waves seeds gap
   w5:0/2 (89207: w4:0/3 + w5:0/2). The r92 shape (bars met, never
   announced) is superseded by 89206's shape (bars met, announced,
   sat lesser, w5 never faced).
9. NOWALKIN, thirteenth block — ARM B WINS. Arm A kills 2 (89203),
   Arm B kills 3 (89206). Series tally now Arm A 5, Arm B 5, three
   ties. Still a tally, not a lever verdict.
10. RELAY-BRANCH TALLY — dark 11, grey 1, light 1 (89204 dark). No
    second grey or light observation.
11. DECLINE vs SILENT NO-SHOW — no decline-and-return, no
    decline-and-never-return. Non-announced seeds: 89201 honest
    scattering death. No silent no-show.
12. 199 MECHANISM — holds as a pre-wave-5 attractor. 89202 gated 199
    for 150 days, 89203 for 99 days (raw peaks 227/377, defer/cap
    holds named). 89206 spent 6 days at 199, then broke to 372 after
    the wave-5 unlock; 89204 spent 41 days at 199 before peaking
    477. The 199 ceiling lifts with the unlock, as r92 found.

## Pre-registered verdict

Analyzer exit 0. PRIMARY GO, ALL GO.
- GO: M1-guard 7/7, M2-census (Arm A with fights 3/3), M2c-engine
  coverage 6/6, M2d-gate-named 6/6, M2b-attribution 3/4 named (one
  day-window-only), M8-exit-canon, M3b-peak (1/6, 89206),
  M4-wave5-or-full (1/6, 89206), M4b-conjunction (1/6, 89206),
  M13-release-snapshot (89206 d83), M14-invite 6/6, M5-voicing,
  M5b-relay-tabulation, M6-guard-named 3/3, M10-fullseat-gap 5/5,
  M11-standing-peak, M12-bar-record, M15-feast-census, M16-dusk-census,
  M17-surge-mode, M18-ghost-scan, M19-grant-log, M20-standing-trace,
  M21-audit-crosscheck 6/6, M22-feast-hold, REG-r35-audit,
  REG-r37-satpenalty, VETCONV-recon 6/6, LOSSKIND-classified 1/1.
- Tally only: M3-conversion (Arm B 3 vs Arm A 2), M4b as a question
  metric (now GO as a conjunction — the full seat itself remains
  unwon, which is M4's expected NO-GO shape in prior blocks, here
  recorded as GO on the unlock-or-full instrument while the seat
  stays lesser; do not cite M4 GO as a full-seat win).

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 89206's feared finale, read in full (announce-sliced
transcript, 71 lines). The audit reads the run back honestly (lesser
seat, waves 1-3 faced 21/7/6, 3 wave-4 fought, 7 contests, 4 crises).
The feared path is argued through terror-as-shield choices
(Oathbound, Shieldbearer, "the shield, not the sword") and lands on
the same pledge sentence as 89103's finale — a series voice, not a
copy error: the pledge is the path's words. The Oversight coda
indicts the player by the same device (napping children in glass,
looking away on purpose because busy). Small talk before the table
is human-scale: Ursula's "Stay close, yeah?" answered "...Yeah."
twice by different people — a repeated line with different
responders, not a filler loop; the System's alien voice ("IS THIS
WHAT HAVING A FRIEND IS. DO NOT ANSWER. LET ME HAVE THIS ONE
UNSOLVED.") reads as alien, not broken.

Beat 2 — 89202's witness finale, read in full (announce-sliced
transcript, finale section). The audit is honest (global standing,
17/10/5, 7 wave-4 fought, 12 contests, 4 crises; "the table does
not rise. It prices."), the war-path bar names the gap plainly
("blood your fighters (0 of 2 veterans)"), and the trial beats
resolve: the prosecutor holds one charge back, lets the judges
speak, refuses the quiet ("In public, or not at all"), reads the
charges while "some of them flinch — actual flinching, from beings
of light" — and the verdict works BECAUSE "your own ledger sits in
evidence beside theirs." Ascensions are named and consequential
(Desmond Clarke, Rosa Mendez, "gods, it turns out, have politics").
Pre-table small talk is quiet and true ("Rosa left 3 branches by
the stash. No announcement. That's how it works here." / "Desmond
doesn't say much. Sometimes that's the whole point.").

Live-build conversation check: not run — this run changes no UI or
dialogue code (instrument-only, zero src/js diff), so there is no
player-facing flow to verify at 390x844; the r92 precedent (same
leg, same instrument-only pattern) likewise verified dialogue via
transcripts. If a future run touches dialogue UI, the live check
applies then.

## Blank: VETCONV instrument fix (filled) + wave-5 facings (documented)

FILLED — the r92-named instrument blank: baseline gap + pre-call
capture, both proven by this block's own data (sums exact, unseen
0, 12 pre-call turns attributed). The analyzer's r95 rule
(per-turn-attributed) is the binding that makes a future
mismatch-unexplained mean a genuinely unattributed increment. No
src/js change proposed or needed for this blank.

DOCUMENTED, NOT FIXED — wave-5 facings: 0 faced types on all 7
seeds (fullseatMax w5:0 everywhere, including both uw=5 seeds).
This is a measurement question for the next run, not a game fix
today, and the gating freeze forbids touching it blind: what gates
a wave-5 facing — arrival scheduling, the unlock itself, the
veteran bank, or the blocked-arrival valve (85 blocked wave-4
arrivals this block, all "Something else is already here")? r92's
89106 faced 2 wave-5 types, so the channel exists; r95's zero is a
sample outcome to explain, not yet a defect claim. Next run's
named question: on a substrate that reaches uw=5, which seeds face
a wave-5 type, through which arrival path, and what distinguishes
them from the 0-facing seeds?

## Metric review (for the NEXT run, not this one)

- VETCONV's r95 rule stands: sum + full attribution = reconciled.
  Do not retire it — it is now the instrument's proof, not a tally.
- M4b: the conjunction is now MET (89206 + control 89204). Retire
  the conjunction as a question; replace it with the wave-5-facing
  question above (arrival path + distinguisher vs 0-facing seeds).
- M9b contention: keep reporting blocked AND committed counts beside
  every share — r95's waves "drop" is again a fighting increase
  (3 -> 14), not an unblocking.
- M22 away reporting: keep the per-seed table beside the arm share
  (r95's uniformity is the finding that clears r92's dip).
- M18 guard is now six blocks clean (r74, r75, r76, r77, r92, r95 —
  r95 scanned 283 lines). Keep the scan; do not retire it yet.
- NOWALKIN tally Arm A 5, Arm B 5, three ties (thirteen blocks).
  Still no lever fate; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot. This
  run's check LOUD lines (maxTier 16->4, satPenalty.penalty 91->34)
  are the same stale-baseline artifact as r48–r92: the baseline
  file itself says its regime is unrecorded and forbids pre-seat
  comparisons, and the check's "current" values are sums across 7
  seed rows, not a single-seed snapshot — EXPLAINED, baseline NOT
  rolled. The re-seed proposal stands.
- Next run's question, named: with bars + announcement + survival
  now proven together, does ANY seed face a wave-5 type, through
  which arrival path, and what distinguishes it from 0-facing seeds?

## Regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 281 passed, 9 failed in 1391s (log:
evidence/2026-11-01/journey-endgame-r95-checkquick.log).
- 6 standing pre-existing families — measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes — matching r92's
  baseline exactly.
- 2 contention timeouts at the 120s cap, exit null:
  trust-observer-neutrality, test-synergy-stall — the documented
  concurrent-load flake signature under 7+ active sibling runs
  (capable-bot-20261014 ran 119s and passed, just under the cap).
  Pattern-matched, not solo-verified.
- 1 load artifact, measurement-cache-flags (exit 1, 86.6s) — the
  r94-documented load artifact class for this test under sibling
  load; pattern-matched, not solo-verified.
- Zero failures attributable to r95: instrument-only, zero modified
  tracked files — verified via `git status`: only new probe/analyzer
  scripts + new evidence files — and none of the failing tests
  touches r95's scripts. The run's own proofs (DET GREEN, pilot
  reproduction byte-identical, analyzer exit 0, telemetry check
  with explained LOUD lines) are all green.

## Reachable / fun / winnable, for leg 4

- REACHABLE: the lesser seat is reachable (6/7 sat, five announced
  d90 and sat within 17 days, the control d119). The full seat is
  still unreached (0/7 this block, 0 in the series on this
  substrate) — but its remaining gap is now exactly one thing: face
  2 distinct wave-5 types. A real player can now be told, truthfully,
  that every other bar is meetable in one run and the last gap is
  meeting the wave-5 monsters themselves.
- FUN: the 89206 arc is the strongest endgame story since 89106
  (wall-break, fallen veteran replaced, sit) — and it ends on a
  sharper question than 89106's bleed-out: the village did everything
  and still sat lesser, because the monsters never came. The sat
  finales read with voice (89206's pledge, 89202's trial). The dull
  shape is 89207: a win with zero fights and zero wave-4 faced —
  coherent (breadth below the wall) but quiet.
- WINNABLE: lesser yes, 6/7, across feared/witness/relay and light/
  dark. Full not yet — the next question is wave-5 facings, not
  veterans, unlock, announcement, or survival.
