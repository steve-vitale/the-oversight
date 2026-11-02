# Journey endgame r101 — THE WALL MOVED UPSTREAM: NO KILLS, NO VETERANS, NO UNLOCK (lane B, 2026-11-02)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start; this run writes 5
(social life next) at run start (verified by re-read after landing).
Run number basis: last numbered Lane B run is r100 (succession,
landed 2026-11-01). This run is r101.

Substrate r98 EXACTLY (capable + deedhunt + vetcommit + greedy
deferral defaults MAXTIER 4 / LASTDAY 145, NOT tuned + armorydrive
+ fullseat-diag + vetguard on waves seeds; forcedrift control
clean). 180d, death-aware. NEW vs r98, both read-only
instrumentation: the three gaps r98's metric review named
(BLOCKED-DAY day-mapping, MENTION-KIND classification, M9-LABEL
total+wave-split). Probe:
`scripts/probe-endgame-r101-20261102.js`. Analyzer:
`scripts/analyze-endgame-r101-20261102.js`, full output in
`evidence/2026-11-02/journey-endgame-r101-analysis.txt`.
Analyzer exit 1, PRIMARY NO-GO, ALL NO-GO — driven by M3b-peak,
M4-wave5-or-full, W5-question, and M17-surge-mode, each explained
below as run outcomes or a single-seed instrument question, not
instrument failure (M2c, M2d, VETCONV, LOSSKIND, M18, M20, M21,
M22 all GO). No src/js change this run.

Seeds: 89401-89403 waves (Arm A), 89404 forcedrift control,
89405-89407 wavesnw (Arm B, waves + NOWALKIN_W4). Pilot
(89401+89405+89404) met the prereg gate (2 sats, census fights,
1 classified village loss), so the run expanded to the full 7;
pilot seeds reproduced BYTE-IDENTICALLY in the full sweep (JSON
snapshotted to `evidence/2026-11-02/r101-pilot/` before the sweep
overwrote them). Determinism leg: DET GREEN byte-identical on
89401 (2x 120d). Main tree clean at pre-flight (0 files), disk
26%. Worktree slug journey2-endgame registered clean. No lock
existed at run start (no stale-lock recovery this run).

## Village assessment, in plain words

Four villages won something, three did not — and for the first
time in this series, NO seed in the block unlocked wave 5, not
even the feasting control. The full seat is unwon for a twelfth
block, but the reason moved one step upstream: this block's wall
is not wave-5 facings or wave-3 breadth. It is kills.

- 89401 (waves): WON LESSER, feared/light, announced d127, sat
  d129 (roster guard, 2-day deferral). Two alive at the end,
  pantry 4,331. Four census fights, ALL talked down, zero kills,
  zero veterans. A feared win with no blood on its hands — the
  talk-down road can carry a lesser seat.
- 89402 (waves): SCATTERED d78. Three people left, pantry 0,
  0 feasts, never past wave 3, zero census fights. Hunger, not
  death, broke it — the honest scattering line.
- 89403 (waves): WON LESSER, feared/light, announced d90, sat
  d124 after a 34-day deferral (20 greedy waits, tier-4 penalty
  19, 1 loss in the window). Eight alive, pantry 8,052. Two
  census fights: one talked down, one villager death (Stepan
  Volkov, d121, to a triple Eulogy). Standing sat at 199 for
  120 days. Zero kills, zero veterans.
- 89404 (forcedrift control): WON LESSER, relay/dark, announced
  d95, sat d103. Eight alive, pantry 17,433. Six feasts, 22
  feasted days, wave-3 breadth COMPLETE (4/4) and wave-4 3/3 —
  and still no unlock. The record names the blocker exactly:
  rd5short=["veterans"], holdKind defer5, standing gated 199
  against raw 442 for 129 days, rd5 demand 2 veterans against 0
  held (armor 7/4, armed 8/6, tricks 21/3 — every other bar
  exceeded). Its two census fights were both talked down; it
  recorded zero wave-4+ kills all run (vetFights 0). Feasts and
  breadth did not unlock wave 5. Veterans did not exist to
  unlock it with.
- 89405 (wavesnw): TABLE WITHDRAWAL d90, then NO-SUCCESSOR LOSS
  d133. Zero alive, pantry 1,000. The table refused it with the
  pellet-hums line ("NO HUNGER ON THE RECORD... THE PELLET HUMS
  WHERE THE FIRE SHOULD BE"), naming wave-3 monsters faced and
  the food-thesis deeds as still wanted; the village then died
  out quietly — "No one is left to pick up the Codex" — the
  first no-successor loss in this series' recent blocks, distinct
  from scattering (flag and SAY line agree). Five census fights
  (vDie, vKill, vKill, vDie, vDie): 2 vKill outcomes, of which
  1 veteran-counted (the committed d133 influencer kill; the
  d133 eulogy kill was uncommitted — arena, at 7-19% HP — and
  does not count toward the bar). Peak veteran 1 on d133 —
  the day the village ended.
- 89406 (wavesnw): WON BY WALKING AWAY, defiant/light,
  announced d90, sat d90, seat none, final:walk. Seven alive,
  pantry 8,806. Four census fights (vFlee, otherEnd, vDie,
  vKill): 1 kill, 1 living veteran banked d76. The feared beat
  underwhelmed first ("THE TABLE FALTERS — you played your hand
  before the fear was in the room"), then the defiant walk paid
  every price and planted a promise (Seymour, a season's
  service, then return — "the village will hold you to it").
  A win that is not a seat at all.
- 89407 (wavesnw): TABLE WITHDRAWAL d116, then SURVIVED to d180
  without sitting. Six alive, pantry 9,148. Five census fights,
  all monster-fled, zero kills. Seventeen armory donations (the
  block's most), 159 devotion channels, 80 away dusks (58%) —
  a village that lived the whole window, armed itself, and
  never got a table it could sit at. The withdrawal line names
  only the food-thesis deeds as still wanted.

## Leg questions, answered

1. W3-LASTMILE — ANSWERED, AND THE ANSWER IS "NOT BREADTH".
   The question assumed a uw=5 seed to judge. There was none —
   but the control proves the point from the other side: 89404
   covers w3 4/4 and w4 3/3, feasts heavily, and still never
   unlocks, because rd5short is veterans alone. Breadth was
   complete; the last mile was kills. The r98 shape (a sat seed
   short only on w3 breadth) does not generalize: breadth is
   neither sufficient (89404) nor the binding gap this block.
2. FEAST-RATE — UNANSWERED, vacuous this block. No uw=5 seed
   means no feast-to-facing rate to measure: the feasting
   control (6 feasts, 22 feasted days) faced 0 wave-5 types
   because the pool never contained one. The rate question
   presupposes an unlock; this block measures the unlock's
   absence instead.
3. W5-FORK (cleaned) — ANSWERED AS NEVER-ARRIVED, EVERYWHERE.
   No seed reached uw=5, so every fork class is no-uw5 by
   construction — but the cleaned-mention instrument earns its
   keep here: raw mentions would have misread four seeds as
   MENTIONED-NOT-FACED. Hand-reading every 'other'-kind
   firstLine shows the analyzer's cleaned column still
   OVER-includes: Nielsen lines are war-table ABILITY text
   ("The Nielsen flinches first — you saw it", 89401 d129 /
   89406 d90; "The producers name it: the Nielsen", 89403
   d111), Rerun d16 (89402) is a proverb quote ("The future
   is a rerun"), and Finale d28 (89403) is a SYSTEM TV blurb
   ("a finale that rattles the set"). True cleaned-presence is
   ZERO on all seven seeds. The next run's kind rules must add
   ability-text and SYSTEM-blurb kinds (see metric review);
   until then, report cleaned-presence as hand-corrected 0.
4. WALL CONTINUITY — twelfth block: the wall as "full seat"
   stands (0/7), and its shape is NEW again. r95's wall was
   conjunction (unlock + announce + sit, no facing); r98's was
   w3 breadth on a facing seed; r101's is one step earlier —
   no unlock on any seed, because no seed banks 2 living
   veterans (peaks: 0,0,0,0,1,1,0; only 89405/89406 peak 1,
   both Arm B). The series' veteran wall is now the unlock
   wall, and the unlock wall is a kill wall: waves arms banked
   0 (Arm A) and 2 (Arm B) veteran-counted wave-4+ kills
   in 22 census fights (3 vKill outcomes — the third,
   89405's eulogy kill, was uncommitted), and the control
   killed 0 in 2 talk-down fights.
5. VETCONV — ANSWERED, 6/6 reconciled, third straight block.
   Sums exact everywhere (89405: 20=20, 89406: 29=29, 89407:
   25=25), unseen=0 everywhere, pre-call turns attributed
   (89403: 1, 89406: 3, 89407: 5). Kill conversion on waves
   seeds (veteran-counted): Arm B 2, Arm A 0. Census vKill
   outcomes total 3; the uncounted one is 89405's
   uncommitted eulogy kill (see 89405 above).
6. LOSS-KIND — ANSWERED, 2/2 classified. 89402 scattering
   (flag + SAY line agree; pantry 0). 89405 no-successor (line
   + flag agree; alive 0). No extinction this block.
7. NOWALKIN, fifteenth block — ARM B WINS. Arm A kills 0,
   Arm B kills 2 (89405, 89406). Series tally now Arm A 5,
   Arm B 7, three ties. Still a tally, not a lever verdict.
8. RELAY-BRANCH TALLY — dark 13, grey 1, light 1 (89404 dark).
   No second grey or light observation.
9. DECLINE vs SILENT NO-SHOW — two withdrawals, neither a
   decline-and-return nor a decline-and-never-return: both
   are table refusals (pellet-hums) followed by different
   endings — death without successor (89405) vs survival
   without sitting (89407). The withdrawal line is voiced and
   specific both times; neither seed was silently no-showed.
10. 199 MECHANISM — holds, fourth block running. 89403 (120
    days at 199), 89404 (129 days), 89405 (9 days), 89406 (90
    days) all gated 199 with raw above it; 89404's trace shows
    the mechanism plainly (raw 442, gated 199, defer5 hold on
    veterans). The 199 hold is not the villain here — it is
    the meter showing the veterans bar unmet.
11. CONTENTION WATCH — NO FLAG under the prereg rule (swing
    >10pt vs BOTH comparisons). Waves share 90% (blocked 54,
    committed 6) swings 10.6pt vs r74 but only 4.0pt vs r77;
    wavesnw share 83.9% (blocked 73, committed 14) swings
    9.2pt vs r74 and 16.1pt vs r77; forcedrift 83.3% (blocked
    10, committed 2) swings 11.9pt vs r77 with no r74 value.
    Counts beside shares, as the metric review requires. The
    wavesnw move is a fighting increase (committed 14), not
    an unblocking failure.
12. M17 SURGE-MODE — NO-GO, single seed, instrument question
    not a game defect claim. 89403 records surgeDay d52 with
    ZERO spends logged, while its feastedDays read 0 despite
    5 fsFeasts (1 armed). Either a surge sat unspent all run
    (plausible: its fights were talkDown/vDie, and no spend
    day ever came) or the spend capture misses a spend path.
    The other six seeds are clean (surge with spends, or no
    surge at all). Next run should say which: log surge
    arming vs spend separately for surged-but-unspent seeds.

## Pre-registered verdict

Analyzer exit 1. PRIMARY NO-GO, ALL NO-GO — on four verdicts
whose causes are run outcomes, stated plainly so the NO-GO is
not misread as an instrument failure:
- M3b-peak NO-GO: peak(>=2) 0/6 on waves seeds (only 89405
  peaked 1, d133; 89406 peaked 1, d76; the control peaked 0).
- M4-wave5-or-full NO-GO (waves scope): 0/6 waves seeds
  unlocked wave 5 or earned the full seat. The control also
  failed to unlock — M4's waves-only scope and the control
  agree this block.
- W5-question NO-GO: no uw=5 seed, so the question is
  unanswered — but every seed's records are complete
  (complete=true 7/7), and the fork answer for this block is
  NEVER-ARRIVED on the hand-corrected cleaned reading.
- M17-surge-mode NO-GO: 6/7 — 89403 alone (surge d52, spends
  none). See item 12 above.
- GO (all others incl.): M1-guard 7/7, M2-census (Arm A with
  fights 2/3), M2c, M2d (10/10 gate-named), M2b (5/6 dieFlag
  named; one day-window-only: 89405 d134 strike), M8-exit-canon
  (5 mFlee fights, all codex-matched), M3-conversion (tally,
  Arm B 2 vs Arm A 0), M10-fullseat-gap (89401: w4 2/3 + w5
  0/2; 89403: same; 89406: w3 3/4 + w5 0/2), M11-standing-peak,
  M12-bar-record, M13-release-snapshot (vacuous — no uw=5),
  M14-invite, M5-voicing, M5b-relay-tabulation, M6-guard-named,
  M15-feast-census, M16-dusk-census, M18-ghost-scan (469 lines
  scanned, 0 confirmed ghosts — eighth block clean),
  M19-grant-log, M20-standing-trace, M21-audit-crosscheck,
  M22-feast-hold (contribution shortfall still exactly 1500
  kcal median on every seed — seventh block), REG-r35-audit,
  REG-r37-satpenalty, VETCONV-recon 6/6, LOSSKIND-classified
  2/2.
- M4b: retired as a verdict per r95's metric review; INFO
  only (0/6 conjunction on waves seeds this block — expected,
  since no waves seed unlocked).

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 89401's feared/light pledge finale, read in full
(announce-sliced transcript, finale section). The audit is
honest (15/10/7 + 2 wave-4 fought, 11 contests, 5 crises;
"the table does not rise. It prices."). The war path names
its fights and reads both bars plainly ("blood your fighters
(0 of 1 veterans)" / "(0 of 2 veterans)"), and notes the
ascension honestly ("The table notes 1 ascension from one
village — its terms improve accordingly. Nobody has ever seen
that before."). The feared beat resolves: restraint as the
frightening thing, the pledge spoken aloud ("humanity's fear
is a standing shield, never a sword"), the System filing the
village under "deterrent, benevolent" without understanding
the second word. The Oversight coda lands its indictment from
the feared side, same device as r98's beats, opposite path.
Watch item, not a defect: the war path says "They faced The
Ugly Beast and lived" for fights the census records as
talkDowns — "faced" is true, "killed" is not claimed, so the
record stays honest.

Beat 2 — 89406's defiant walk finale, read in full (the whole
69-line announce-sliced transcript). The audit is honest
(19/5/3 + 4 wave-4 fought, 8 contests, 3 crises), the war path
itemizes ("On day 76, you put down Ugly-Eyes"), and the beat
does something the series has not shown before: it FAILS
first. "THE TABLE FALTERS — you played your hand before the
fear was in the room, and the demonstration underwhelmed."
Then the smaller door: the defiant walk, priced line by line
("Not one grain." ... "Dignity, priced in hunger."), paying
with a name spelled right in the eternal record, and planting
a promise — Seymour serves the relay a season, then returns,
"and the village will hold you to it." The ending resolves
AND owes, which is the bar. The Oversight coda closes it.
Watch item, not a defect: the audit line still reads "A
lesser seat — global standing" before the walk supersedes it
with seat none; a reader skimming the audit alone could
misread the outcome, but the final beat (final:walk, "Humanity
walks — poorer, whole, free") is unambiguous.

Live-build conversation check: not run — this run changes no
UI or dialogue code (instrument-only, zero src/js diff), so
there is no player-facing flow to verify at 390x844; the r98
precedent (same leg, same instrument-only pattern) likewise
verified dialogue via transcripts. If a future run touches
dialogue UI, the live check applies then.

## Blank: instrument gaps filled (r98's three) + gaps for the next run (documented)

FILLED — all three r98-named instrument blanks, verified on
this block's data:
1. BLOCKED-DAY: blocked arrivals now carry day (e.g. 89401's
   first blocked wave-4, Herald, d106; 89407's, Influencer,
   d154). No wave-5 blocked arrival exists this block to date,
   but the field is populated wherever a block occurs.
2. MENTION-KIND: firstLineKind is populated on every counted
   mention; the broadcast kind correctly cleans the SYSTEM
   "SEASON FINALE APPROACHES!" line on all seven seeds, and
   the buff-move kind cleans Rerun move lines. The residual
   gap is 'other' (see below), not the two kinds r98 named.
3. M9-LABEL: the analyzer now reports "137 blocked arrivals
   total (w4=22 w5=0 other/unmapped=115)" instead of r98's
   mislabelled "95 blocked wave-4 arrivals". The count
   series stays comparable; only the label changed. The
   other/unmapped 115 are the supply mechanism itself (the
   slot near-always occupied by an earlier-wave arrival).

DOCUMENTED, NOT FIXED — two instrument gaps for the next run
(all read-only, none worth re-running this sweep to populate):
1. MENTION-KIND 'other' is still a hand-read bucket: this
   block's 'other' firstLines are all lookalikes (Nielsen
   war-table ability text x3, Rerun proverb quote, SYSTEM TV
   blurb mentioning "a finale"). Fix: classify by line
   marker first — 'ability-text' for lines starting
   "◈ ABILITY", 'broadcast' for any "📺 SYSTEM:" line (not
   just SEASON FINALE APPROACHES), 'proverb' for quoted
   one-liners — and report cleaned-presence only from
   'presence'/'crew-beat' kinds. Until that lands, any
   cleaned-mention claim needs the hand-read correction this
   note applies (true cleaned-presence 0/7).
2. M17 surge-without-spend: 89403's surge d52 / spends none.
   Fix: log surge arming and spend as separate events so a
   surged-but-unspent seed is distinguishable from a missed
   spend capture.

DOCUMENTED, NOT A DEFECT CLAIM — the unlock wall's shape:
89404 proves a village can meet breadth (w3 4/4, w4 3/3),
feast (6 feasts, 22 feasted days), and stand at 199 with raw
442, and still never unlock, because rd5 demands 2 veterans
and it holds 0. Whether the veterans bar should be the
unlock's binding bar — vs standing, breadth, or feasts — is
a design question for Steve/Codex, not a bug report: the
mechanism is working as wired (defer5 hold, named short),
and the run's job was to name it, which it does.

## Metric review (for the NEXT run, not this one)

- W5-question: keep, with the marker-first kind rules (gap 1
  above) as the reported class, and cleaned-presence defined
  as presence/crew-beat kinds only. The question's next form:
  with unlocks at zero this block, the question is upstream
  — what produces a wave-4+ kill on the waves road at all?
  The feast-rate sub-question stays dormant until an unlock
  exists to rate.
- M4-wave5-or-full scope: keep wavesAll for series
  comparability, but report control unlocks/facings beside it
  (as here) so a control-only unlock never again reads as a
  closed wall — this block both scopes agree, which is itself
  the news.
- M17-surge-mode: keep the bar, but a surged-without-spend
  seed should classify as "surge unspent" (INFO) vs "spend
  capture gap" (NO-GO) once the arming/spend split lands;
  do not let a single unspent surge fail an otherwise clean
  block without that distinction.
- M18 guard is now eight blocks clean (r74, r75, r76, r77, r92,
  r95, r98, r101 scanned 469 lines — plus the r101 pilot's
  lines). Keep the scan; do not retire it yet.
- NOWALKIN tally Arm A 5, Arm B 7, three ties (fifteen
  blocks). Still no lever fate; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot.
  This run's check LOUD lines (maxTier 16->5,
  satPenalty.penalty 91->23) are the same stale-baseline
  artifact as r48–r101: EXPLAINED, baseline NOT rolled. The
  re-seed proposal stands. (This block's values run HIGHER
  than r98's 1/16 because 89403 deferred to tier 4 with
  penalty 19 — the direction tracks the Arm A deferral, not
  a telemetry break.)
- Next run's question, named: the kill wall — on the waves
  road, what turns a wave-4 fight into a kill? 22 census
  fights this block produced 2 veteran-counted kills (both
  Arm B; 3 vKill outcomes), 4 talkDowns on the winning Arm A
  seed, 5 monster-flees on the surviving seed, and a
  talkDown-only control. The full-seat road runs
  through veteran kills; measure the kill, not the seat.

## Regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree: 284 passed, 6 failed in 764s (log:
evidence/2026-11-02/journey-endgame-r101-checkquick.log).
- All 6 failures are the standing pre-existing families r98
  named — measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20-fixes — matching r98's baseline exactly.
- r98's 2 solo-reproduced deterministic failures
  (test-foodpower-20261014, test-capable-bot-20261014) PASSED
  this block, as did r95's contention timeouts — the suite
  total is unchanged (290 tests: r98 282+8, r101 284+6).
- Zero failures attributable to r101: instrument-only, zero
  modified tracked files — verified via `git status`: only new
  probe/analyzer scripts + new evidence files. The run's own
  proofs (DET GREEN, pilot reproduction byte-identical,
  analyzer verdicts above, telemetry check with explained LOUD
  lines) are all green except the four outcome NO-GOs already
  explained.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/endgame.json
--current 'evidence/2026-11-02/perseed-endgame-r101/endgame-r101-*.json'
--metrics maxTier,satPenalty.penalty --sweep-rows`:
- LOUD: maxTier swung -69%: baseline 16 -> current 5 (n=7).
- LOUD: satPenalty.penalty swung -75%: baseline 91 -> current 23 (n=7).
Verdict: EXPLAINED, baseline NOT rolled — the same stale-
baseline artifact as r48–r101 (the baseline file itself says
its regime is unrecorded and forbids pre-seat comparisons, and
the check's "current" values aggregate 7 seed rows, not a
single-seed snapshot). This block's higher values than r98's
(1 / 16) track 89403's tier-4 deferral (penalty 19), not a
telemetry break. The re-seed proposal stands.
