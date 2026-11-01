# Journey endgame r77 — EVIDENCE (lane B, completed 2026-10-31)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start; this run writes 5
(social life next) at run end. Substrate r76 EXACTLY (capable +
deedhunt + vetcommit + greedy deferral defaults MAXTIER 4 / LASTDAY 145,
NOT tuned + armorydrive + fullseat-diag + vetguard on waves seeds;
forcedrift control clean). 180d, death-aware. NEW vs r76: the
FIRST-MENTIONING-LINE instrument (probe records rec.w3Mentions[].firstLine,
the verbatim first matching full-run capture line, truncated 400 chars)
+ a WORD-BOUNDARY FIX to the mention matcher found mid-run via that
instrument (see Blank: the fix, and why the run re-swept). Probe:
`scripts/probe-endgame-r77-20261101.js`. Analyzer:
`scripts/analyze-endgame-r77-20261101.js`, full output in
`evidence/2026-10-31/journey-endgame-r77-analysis.txt`. The analyzer
exits 1 on the M2/M3b/M4 NO-GOs by design — that exit code is the verdict,
not a run failure. No src/js change this run.

Seeds: 89008-89010 waves (Arm A), 89011 forcedrift control,
89012-89014 wavesnw (Arm B, waves + NOWALKIN_W4). Pilot
(89008+89012+89011) showed census fights (control), a relay final,
surge markings, and sat seeds with short w4 bars, so the run expanded
to the full 7 per the prereg gate; pilot seeds reproduced identically
in the full sweep (same announce/sat days and summaries).

Run infrastructure note: TWO sweeps ran. Sweep v1 used substring
mention matching (carried from r76); its analysis is preserved as
`journey-endgame-r77-analysis-v1-substring.txt`. The firstLine
instrument exposed a matcher bug in v1 (see Blank), the probe was fixed
and unit-checked (re-spool excluded, real mentions kept), and sweep v2
re-ran all 7 seeds into the same per-seed directory. V2 differs from
v1 in exactly two analysis lines (the 89009 LASTMILE spool lines);
every other verdict, count, and seed summary is identical, and v2's
announce/sat days match v1 seed for seed. SMOKE (89008 x 120d, lesser
feared/light) and DET (byte-identical) both green before the sweep.
Heartbeat loop verified landing (registry heartbeat fresh at every
check); no other loop acted on the tree.

## Village assessment, in plain words

Four villages won the lesser seat — two feared/light, one witness/light,
one relay/dark on the control — and three villages were lost. No
village won the full seat, none unlocked wave 5, none peaked even ONE
living veteran. The wall holds for an eighth block, and this block's
shape is starker than r76's: the sat villages sat WITHOUT fighting a
single wave-4 type.

- 89008 (waves): won lesser, feared/light, announced d90, sat d110
  after a 20-day deferral (tier-2 sat penalty, 1 loss). 5 alive.
  Zero census fights, zero wave-4 faced — yet faced ALL EIGHT wave-3
  types (8/4) and 4 crises. Full-seat gap w4:0/3 + w5:0/2. A win built
  on breadth below the wall, not on touching it.
- 89009 (waves): won lesser, witness/light, announced d90, sat d91
  (roster guard, no penalty). 4 alive. Zero census fights, zero
  wave-4 faced, w3 5/4. The finale is a trial of the judges (see
  People check). Full-seat gap w4:0/3 + w5:0/2.
- 89010 (waves): the village was lost (0 alive, d83). The block's
  only Arm A fighting seed: 3 census fights (1 talked down, 1
  villager died — James Okonkwo, the wild — 1 other end), 2 wave-4
  faced, 14 vetcommit-counted wave-4+ engagements, but zero wave-4+
  kills logged and zero villager veterans banked (killers empty at
  the end). Engagements without kills, then loss.
- 89011 (forcedrift control): won lesser, relay/dark, announced and
  sat d90 same-day. 9 alive, pantry rich. Two fights (1 villager
  died, 1 talked down), 1 wave-4 faced. Standing peaked at the
  gated 199 for 63 days (defer5/cap mechanism, same as r76's control).
  The control's dark relay final moves the series relay tally to
  dark 9, grey 1, light 1.
- 89012 (wavesnw): won lesser, feared/light, announced d90, sat d91.
  4 alive. Zero census fights, zero wave-4 faced, w3 exactly 4/4.
  Full-seat gap w4:0/3 + w5:0/2.
- 89013 (wavesnw): the village was lost (1 alive, d88). Zero fights,
  zero feasts, surge never used, w3 7/4 — breadth without survival
  again, the r76 89007 shape.
- 89014 (wavesnw): the village was lost at d31 with 7 people still
  alive and pantry at 0 — "village lost" here is not roster
  extinction but collapse: 8 fallen by d31, starvation among the
  causes, and the game called it. The run stopped there (+tail);
  the village did not get to grow into its bars (w1 12, w2 0).

## Leg questions, answered

1. SPOOL, WITH THE FIRST LINE — ANSWERED, AND THE R76 FINDING IS
   VOID. V1's 89009 spool "mentioned-d20x3" came from ONE line kind:
   Static's reveal text — "it has to re-spool before it rushes" —
   matched by substring. With the fixed matcher, 89009 spool reads
   never-mentioned, and spool was FACED on two sat seeds (89008 all
   eight w3 types, 89012). The r76 "spool mentioned-but-never-faced
   on two seeds" almost certainly has the same cause (the same
   Static reveal line is taught on those runs) and must not be cited
   again. The one remaining mentioned-but-never-faced case in r77 is
   89012 gavel (d72 x2), whose first line is a SYSTEM TV blurb —
   "TONIGHT: Small Claims... The gavel is a meteorite" — a narration
   joke about the common noun, not a Gavel arrival. LASTMILE verdict
   for this block: on sat seeds, every unfaced wave-3 type is either
   never mentioned or narration-only. Opportunity, not engagement —
   now with the engagement exception removed, not just narrowed.
2. WAVES AWAY, THIRD BLOCK — DIPS, DOES NOT REVERT. Waves AWAY
   59.5% (135/227 dusks; r75 65%, r76 65%). Wavesnw AWAY 52.8%
   (84/159; r76 65%). Control AWAY 4%. Median contribution shortfall
   still the full 1500 kcal on every seed. The away gate softened a
   little on both arms; the contribution gate did not move at all.
3. WALL CONTINUITY — NO movement, eighth block. 0/6 waves seeds
   peaked >=2 living veterans — and 0/6 peaked even >=1 (peaks all
   0). 0/6 unlocked wave 5, 0 full seats. The veteran bank did not
   merely stall; this block it never opened.
4. M18 REGRESSION — PASS, fourth block clean. 171 back-with lines
   scanned, 0 confirmed ghosts, 0 first-name-only hits.
5. CONTENTION WATCH — one FLAG on the r74 baseline, none on the r76
   baseline. Waves 94.0% (47 blocked, 3 committed): +14.6 vs r74
   (79.4%), +5.7 vs r76 (88.3%). Wavesnw 100% (24 blocked, 0
   committed): +6.9 vs r74 (93.1%), +6.0 vs r76 (94.0%). Control
   71.4% (5 blocked, 2 committed). The series reads as a high
   contention plateau, not a swing — same reading as r76.
6. FULL SEAT LAST MILE — no fourth shape, and a narrower shape:
   all three sat gaps are w4+w5 (89008, 89009, 89012 all w4:0/3 +
   w5:0/2). No sat seed this block even touched wave 4.
7. NOWALKIN REPLICATION, eleventh block — TIE. Arm A kills 0, Arm B
   kills 0 (no census kills on either arm). Series tally now Arm A
   5, Arm B 3, three ties. Tally only.
8. RELAY-BRANCH TALLY — one dark observation (89011 control). Series
   dark 9, grey 1, light 1. Still no second grey or light.
9. DECLINE vs SILENT NO-SHOW — no decline at all (seventh block
   running). Non-announced classifications: 89010, 89013, 89014 all
   village-lost. No silent no-show.
10. 199 MECHANISM (regression) — holds. Only the control peaked at
    exactly 199 (63 days, raw 297, defer5/cap). No waves seed touched
    199, let alone 200+.
11. AUDIT CROSS-CHECK — holds 4/4. Every sat seed's audit line parses
    and equals satWaves exactly on all counts (M21 GO).

## Pre-registered verdict

PRIMARY: NO-GO — driven by M2, M3b-peak and M4 (M3 is tally-only and
does not gate; the analyzer's ALL NO-GO also counts the M3 tally and
M4b tally).

- GO: M1 (7/7 resolved), M2c (6/6 engine coverage, 0 errors), M2d
  (1 uncommitted fight, classified never-observed), M2b (die
  attribution), M5 (control crossed + voiced), M5b (1 relay final
  tabulated), M6 (deferred sat guards named 3/3), M7 (2 beats
  sense-read, 0 senseless flags — judged in the note), M9 (76 blocked
  wave-4 arrivals, judged GO against the code rule: the
  single-occupant boundary rule firing as designed, not a spawn
  failure), M10 (full-seat gaps named 3/3), M11 (peaks reported 6/6,
  at-199: 0 waves), M12 (readiness-bar records 3/3), M13 (vacuous —
  no uw=5), M14 (invite classification 6/6), M15 (feast census 7/7),
  M16 (dusk census 7/7), M17 (surge spends named 7/7), M18 (ghost scan
  7/7, 0 hits), M19 (grant log 7/7), M20 (standing trace 7/7, mech199
  on the control only), M21 (audit cross-check 4/4), M22 (feast-hold
  7/7, 0 unclassified dusks), REG r35/r37 (4/4 each).
- NO-GO: M2 (Arm A with fights 1/3 — only lost 89010 fought; both sat
  waves seeds had zero census fights), M3b-peak (0/6 peaked >=2 —
  and 0/6 peaked >=1), M4 (0/6 wave-5 or full seat).
- TALLY ONLY (not PRIMARY-gating): M3 conversion (tie 0-0), M4b
  conjunction (0/6), M9b contention share (waves 94.0%, wavesnw
  100%, control 71.4%). M8 vacuous (0 mFlee fights — conditional
  binding does not gate).

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 89009 witness/light lesser finale. The audit reads the run
back honestly (17/9/5, 5 contests, 4 crises), the war path names real
bars (4 of 5 armed; 3 of 4 armored; 0 of 2 veterans — owned, not
hidden), the ledger is honest ("More promises broken than kept" —
yet the light road opens on protected-outnumbering-killed plus the
shared food truth, stated in the scene), the trial beats resolve
(call the chosen witness, refuse the quiet — "In public, or not at
all" — read the charges, set the precedent), the architect credit
lands (Ali Alireza ascended through doors the player built), and the
Oversight coda owes again (the pods still napping, "the oversight is
the looking away"). Sensical. Texture notes, not flags: the
pre-table day's betrayal arc plays Amelia's turn as a real fight
with gear absorbs and a codex entry closed at 6 deeds, and the Scout
role is reassigned twice in the window (Ali, then Giovanni, then Ali
again) — narrated as promises, but churny.

Beat 2 — 89011 relay/dark lesser finale (control). The audit is
honest (12/8/6, 1 wave-4 fought, 6 contests, 3 crises), the war path
names a real face (the Herald, Big Beast), the veteran bar is owned
(0 of 2), the ledger is honest ("protected outnumber the killed;
food truth shared; promises kept"), and the dark relay choice is
priced in the scene itself (children measured for boots, the village
never this quiet, "The System is delighted. That's the worst part.")
with the merge priced too (self eroded, food conversions fade, the
village tells stories about someone else now). Sensical.

No fabricated shared history, no filler loops, no static menus in
either beat. (The repeated "Smell that? Something's different here"
travel banter from two companions is generic, but it is travel
banter, not a finale beat.)

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes for the lesser seat (4/7, across three paths —
  feared, witness, relay/dark); the full seat is still unreached
  (0/7), and wave 5 is unreached again (0/6). This block sharpens the
  last-mile picture in an uncomfortable direction: the sat villages
  did not merely miss wave 4 — they never met it, and still sat.
  The lesser seat does not require touching the wall.
- FUN: the finale beats are strong (a witness trial that earns its
  precedent and a dark relay merge that makes its cost felt). The
  field texture is thinner than r76 (only 1 of 3 Arm A seeds fought
  at all, and both sat waves seeds fought nothing), and three
  villages lost — one of them (89014) collapsing at d31 with
  survivors still standing.
- WINNABLE: the lesser seat is winnable by a competent player on this
  substrate; the full seat is not yet demonstrated winnable, and r77
  adds the sharpest data point yet on WHY the veteran bar misses:
  this block it never opened — no seed banked even one living
  veteran — while wave-4+ engagements did happen (89010: 14
  vetcommit-counted, zero kills).

## Blank fixed in this run (instrumentation, not game code)

WORD-BOUNDARY MATCHER (probe fix, proof: unit check + v1/v2 sweep
comparison). V1's substring matcher counted Static's reveal line
("re-spool") as a Spool mention. The fix requires a form to be
flanked by non-letter/digit/underscore/hyphen characters — plain
`\b` does NOT fix it, because '-' is a non-word character and
`\bspool\b` still matches "re-spool" (verified in the unit check).
Common-noun whole-word lookalikes (gavel in a TV blurb) still count
by design; firstLine is what classifies those by line-kind. No src/js
touched; the analyzer is unchanged except it now reads corrected
counts. Next run inherits the fixed matcher; the r76 spool labels
are VOID and must not be cited.

## Metric review (for the NEXT run, not this one)

- M2's Arm A clause keeps its coverage-not-winnability reading; this
  block it went NO-GO while the sat seeds still won lesser seats —
  the separation the clause is for, in the other direction from r76.
- M22 stays regression reporting: waves AWAY dipped to 59.5% from
  two blocks at 65% — a softening, not a revert; wavesnw dipped to
  52.8% from 65%. If both arms dip again next block, the away gate
  deserves its own question.
- M9b: keep reporting both baselines (r74 and r76); the waves FLAG
  vs r74 (+14.6) is inside the band vs r76 (+5.7).
- M18 guard is now four blocks clean (r74–r77). Keep the scan; do
  not retire it yet.
- NOWALKIN tally Arm A 5, Arm B 3, three ties (eleven blocks).
  Still no lever fate; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot. This
  run's check LOUD lines (won 0->4, announceDay newly appeared) are
  the same stale-baseline artifact as r48–r76: EXPLAINED, baseline
  NOT rolled. The re-seed proposal stands.
- Next run's question, named: with the veteran bank at zero even
  for a peak of 1, is the bar failing on kill conversion (89010
  logged 14 vetcommit wave-4+ engagements but zero wave-4+ kills —
  engagements happen, kills do not), on survival of the killers, or
  on the bar's own definition? The instrument item is a kill-
  conversion trace: what ends the 14 engagements (talk-down, flee,
  villager death, other end) and whether any wave-4+ kill ever lands
  on this substrate.
- VILLAGE-LOST-WITH-SURVIVORS (89014 shape, documented not fixed):
  the loss fired at d31 with 7 alive and pantry 0. Worth one
  instrument line next run (what condition fired the loss), before
  anyone calls it a bug — collapse, not extinction, may be the
  design.

## Regression check (added before landing)

`node scripts/check.js --quick` in the worktree: 284 passed, 6 failed
in 817s — the same 284/6 shape as r76. This run modified ZERO tracked
files (only new probe/analyzer scripts + new evidence files — verified
via `git status`/`git diff`), so none of the 6 can be a regression
from this run. The failures: measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof (all proof-freshness/observer tests), and
test-establishment-r20-fixes-20261020 (the racks-full voice gate
r76 already isolated and reproduced standalone — pre-existing break
on current master, unrelated to endgame instrumentation, left for
its owning lane). The run's own proofs (SMOKE, DET byte-identical,
analyzer, telemetry check) are all green.
