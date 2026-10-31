# Journey endgame r76 — EVIDENCE (lane B, completed 2026-10-31)

## Run provenance

Leg 4 (endgame). Rotation-b read 4 at run start; this run writes 5
(social life next) at run end. Substrate r75 EXACTLY (capable +
deedhunt + vetcommit + greedy deferral defaults MAXTIER 4 / LASTDAY 145,
NOT tuned + armorydrive + fullseat-diag + vetguard on waves seeds;
forcedrift control clean). 180d, death-aware. NEW vs r75: the FULL-RUN
W3 MENTION LOG instrument only (probe scans the full SAY capture for
wave-3 roster names, day-mapped via dayBounds; analyzer classifies from
rec.w3Mentions, never from the announce-sliced transcript) + the M5b
zero-relay vacuous-GO definition (r75 metric-review fixes). Probe:
`scripts/probe-endgame-r76-20261031.js`. Analyzer:
`scripts/analyze-endgame-r76-20261031.js`, full output in
`evidence/2026-10-31/journey-endgame-r76-analysis.txt`. The analyzer
exits 1 on the M3b/M4 NO-GOs by design — that exit code is the verdict,
not a run failure. No src/js change this run (see Blank: two items
investigated and closed/documented, not fixed).

Seeds: 89001-89003 waves (Arm A), 89004 forcedrift control,
89005-89007 wavesnw (Arm B, waves + NOWALKIN_W4). Pilot
(89001+89005+89004) showed census fights, surge markings, and a relay
final, so the run expanded to the full 7 per the prereg gate; pilot
seeds reproduced identically in the full sweep (89001 re-run in the
full sweep matches its pilot summary; 89004/89005 pilot files kept,
same 180d inputs). SMOKE (89001 x 120d) and DET (byte-identical) both
green before the sweep.

Run infrastructure note: the full sweep's first attempt died on seed
89002 with an EPERM evidence-write failure (0-byte JSON, the
2026-10-30 registry-truncation class) after the 15-retry write helper
gave up; the four missing seeds were re-run in one command and all
seven per-seed files verified parseable. Registry heartbeats flapped
twice (one EPERM tmp-write failure, one flock queue behind sibling
flesh-out-loop registrations); every manual retry landed, the standing
loop process stayed alive throughout, and the registry was fresh at
closeout. No other loop acted on the tree.

## Village assessment, in plain words

Five villages won the lesser seat — four beloved/light, one feared,
one relay/dark on the control — and two villages were lost. No village
won the full seat, none unlocked wave 5, none peaked 2 living
veterans. The wall holds for a seventh block, but its shape changed:
fight coverage recovered (every Arm A seed fought this time, vs 1 of 3
in r75), while the veteran bank and wave-5 breadth still never arrive.

- 89001 (waves): won lesser, beloved/light, announced d92, sat d105
  after a 13-day deferral (tier-1 sat penalty, 3 losses). 10 alive.
  One fight (a suburb monster fled by design). Full-seat gap w4:1/3 +
  w5:0/2. Pantry thin at the end (371 kcal) — a win on a nearly empty
  larder.
- 89002 (waves): won lesser, beloved/light, announced d90, sat d96
  (roster guard, no penalty). 4 alive. Two fights (one villager fled,
  one villager died — Sofia Wilson, the wild). Full-seat gap w4:2/3 +
  w5:0/2. The costliest win in the block by roster: six fallen.
- 89003 (waves): won lesser, beloved/light, announced and sat d131
  same-day (veteran-banked guard). 8 alive, at global scale. Four
  fights (2 talked down, 1 kill — Priya put down Loud-Eyes d97 — 1
  monster fled). Peak 1 living veteran d98. Full-seat gap w3:3/4 +
  w5:0/2 — the block's LASTMILE subject (see below). Pantry 16,184.
- 89004 (forcedrift control): won lesser, relay/dark, announced and
  sat d90 same-day. 10 alive, pantry 42,712. Four fights, all talked
  down or fled. The control's dark relay final (lean -69, 48 verbs, 7
  communes) moves the series relay tally to dark 8, grey 1, light 1.
- 89005 (wavesnw): won lesser, feared/light, announced d123, sat d124.
  6 alive. Four fights (1 kill, 2 villager flees, 1 other end). Peak
  1 living veteran d79. Full-seat gap w5:0/2 only — the closest to the
  full seat in the block on breadth (w3 6/4, w4 7).
- 89006 (wavesnw): withdrew at d90 (pellet beat, voiced, original
  quote) and then the village was lost (4 alive at the end). Zero
  fights, zero feasts, surge never used — but w3 breadth 8/4 and 4
  crises weathered. Sentiment taught d31, surge never used: the exact
  r75-closed shape, so the original quote stands (see Blank).
- 89007 (wavesnw): the village was lost (1 alive). No withdrawal, no
  fights, no feasts, no surge. Ten fallen, the last to a wound that
  wouldn't close on d120. Breadth without survival again (w3 7, 20
  contests, 3 crises) — the village did a great deal and still died.

## Leg questions, answered

1. LAST MILE, WITH A VALID INSTRUMENT — answered, and the answer is
   mostly OPPORTUNITY. For the w3-short sat seed 89003 (faced
   chorus_line, buffering, callback; w3 timeline 1st d85, 2nd d114,
   3rd d130, sat d131; crises met by d13; stall window 1 day by the
   analyzer's definition): of its 6 unfaced wave-3 types, FIVE were
   never named once in the full 131-day SAY capture (redactor, gavel,
   focus_group, terms_of_service, ad_break) — they simply never
   showed up in the village's spoken record. The one exception is
   spool, named d72 (3 lines) and never faced by d131 — a genuine
   engagement gap for one type. Qualification, stated plainly:
   "mentioned" means the name appears in a SAY line, not a confirmed
   arrival — the never-mentioned side is the strong side (absence
   across a full run is meaningful); the mentioned side cannot yet
   distinguish a codex line from an arrival. Next run's instrument
   item: persist the first mentioning line per type.
   Cross-seed pattern: spool is mentioned-but-never-faced on TWO
   seeds (89003 d72, 89005 d105) — the only type with that shape
   twice. Redactor is mentioned-but-never-faced on 89001 (d70, 1
   line). Every other unfaced type on every sat seed is
   never-mentioned.
2. WAVES AWAY REPLICATION — REPLICATES. Waves AWAY 65% (r75 65%,
   r74 39%), CONTRIBUTION 24% (r75 26%). Wavesnw AWAY 65% (r75 69%),
   CONTRIBUTION 28% (r75 20%). Control CONTRIBUTION 50% (r75 51%).
   The away gate is now two blocks at ~65% on waves: the r75 jump
   was not a one-block blip. Median contribution shortfall still the
   full 1500 kcal on every arm.
3. WALL CONTINUITY — NO movement, seventh block. 0/6 waves seeds
   peaked >=2 living veterans (peaks: 89003 1@d98, 89005 1@d79, rest
   0), 0/6 unlocked wave 5, 0 full seats. Fight coverage recovered
   but the veteran bank did not follow.
4. M18 REGRESSION — PASS, third block clean. 187 back-with lines
   scanned, 0 confirmed ghosts, 0 first-name-only hits.
5. CONTENTION WATCH — one FLAG on the r75 baseline, none on the r74
   baseline. Wavesnw 94.0% (63 blocked, 4 committed): +12.6 vs r75
   (81.4%), +0.9 vs r74 (93.1%). Waves 88.3% (53 blocked, 7
   committed): +6.3 vs r75, +8.9 vs r74, both inside the band.
   Control 50.0% (4 blocked, 4 committed). The series across four
   blocks (80.3 → 93.1 → 81.4 → 94.0 on wavesnw) reads as volatility
   on thin fight counts, not a trend — same reading as r75.
6. FULL SEAT LAST MILE — no fourth shape. The four sat gaps are all
   previously seen shapes: w5-only (89005), w4+w5 (89001, 89002),
   w3+w5 (89003).
7. NOWALKIN REPLICATION, tenth block — TIE. Arm A kills 1 (89003),
   Arm B kills 1 (89005). Series tally now Arm A 5, Arm B 3, two
   ties. Tally only.
8. RELAY-BRANCH TALLY — one dark observation (89004 control). Series
   dark 8, grey 1, light 1. Still no second grey or light.
9. DECLINE vs SILENT NO-SHOW — no decline at all (sixth block
   running). Non-announced classifications: 89006
   withdrawal-then-lost, 89007 village-lost. No silent no-show.
10. 199 MECHANISM (regression) — holds. Three waves seeds peaked at
    exactly 199 with the defer5/cap mechanism (89002: 55 days at cap,
    raw 297; 89003: 75 days, raw 257; 89005: 133 days, raw 297) plus
    the control (51 days, raw 297). No waves seed touched 200+.
11. AUDIT CROSS-CHECK — holds 5/5. Every sat seed's audit line parses
    and equals satWaves exactly on all five counts (M21 GO).
12. BLANK — investigated, closed/documented (see below).

## Pre-registered verdict

PRIMARY: NO-GO — driven by M3b-peak and M4 (M3 is tally-only and does
not gate; the analyzer's ALL NO-GO also counts the M3 tally and M4b
tally).

- GO: M1 (7/7 resolved), M2 (Arm A with fights 3/3 — coverage
  recovered from r75's 1/3), M2c (6/6 engine coverage, 0 errors), M2d
  (3 uncommitted fights, all classified never-observed), M2b (die
  attribution), M5 (control crossed + voiced), M5b (1 relay final
  tabulated; the vacuous-GO redefinition was not needed this block
  because a relay final exists), M6 (deferred sat guards named 3/3),
  M7 (2 beats sense-read, 0 senseless flags — judged in the note),
  M8 (2 mFlee fights, all matched to codex counter text — binding),
  M9 (120 blocked wave-4 arrivals, every sampled one carrying the
  verified boundary contention line — judged GO against the code
  rule: the single-occupant boundary rule firing as designed, not a
  spawn failure), M10 (full-seat gaps named 4/4), M11 (peaks reported
  6/6, at-199: 3), M12 (readiness-bar records 4/4), M13 (vacuous — no
  uw=5), M14 (invite classification 6/6), M15 (feast census 7/7),
  M16 (dusk census 7/7), M17 (surge spends named 7/7), M18 (ghost scan
  7/7, 0 hits), M19 (grant log 7/7; 89006's one refusal is
  reactor-classified), M20 (standing trace 7/7, mech199 on four
  seeds), M21 (audit cross-check 5/5), M22 (feast-hold 7/7, 0
  unclassified dusks), REG r35/r37 (5/5 each).
- NO-GO: M3b-peak (0/6 peaked >=2 living veterans), M4 (0/6 wave-5 or
  full seat).
- TALLY ONLY (not PRIMARY-gating): M3 conversion (tie 1-1), M4b
  conjunction (0/6), M9b contention share (waves 88.3%, wavesnw 94.0%
  FLAG-vs-r75, control 50.0%).

## People check (M7: GO — 2 beats sense-read in full, 0 senseless flags)

Beat 1 — 89003 beloved/light lesser finale. The audit reads the run
back honestly (17/7/3, 4 wave-4 fought, 11 contests, 3 crises — all
matching the analyzer), the war path names a real kill (Priya put
down Loud-Eyes on d97, matching the census vKill), the veteran bar
is owned honestly (1 of 2 for wave 5), the architect credit lands
(Priya Nair ascended through relay doors the player built), the
"let the audience speak" resolution carries a real consequence
(popularity into a constitution), and the Oversight coda owes again
(the pods still napping, "the oversight is the looking away").
Sensical.

Beat 2 — 89004 relay/dark lesser finale. The audit is honest
(16/8/4, 4 wave-4 fought, 6 contests, 4 crises), the war path names
real faces (the Herald, Big Loud, Loud-Eyes), the veteran bar is
owned (0 of 2), the ledger is honest ("More promises broken than
kept"), and the dark relay choice is priced in the scene itself
(children measured for boots, the village never this quiet, "The
System is delighted. That's the worst part.") with the merge priced
too (self eroded, the village grieves you while you're alive). The
pre-table gossip lines ("Three retellings in, nobody remembers what
actually happened") read like people. Sensical.

No fabricated shared history, no filler loops, no static menus in
either beat.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes for the lesser seat (5/7, across three paths this
  time — beloved, feared, and relay/dark — not r75's all-one-path
  block); the full seat is still unreached (0/7), and wave 5 is
  unreached again (0/6). The last mile's binding constraint is now
  visible: on the w3-short seed, the missing types mostly never
  arrived in the village's spoken record at all.
- FUN: the finale beats are strong (a beloved finale that prices
  honestly and a dark relay finale that makes its cost felt in the
  scene). The field texture is better than r75 (every Arm A seed
  fought), but two seeds still never fought a wave-4 fight at all
  (89006, 89007 — both lost), and 89006's 17 blocked arrivals with 0
  fights is the contention story again.
- WINNABLE: the lesser seat is winnable by a competent player on this
  substrate; the full seat is not yet demonstrated winnable, and r76
  adds the sharpest data point yet on WHY the w3 bar misses: mostly
  opportunity, not engagement — except spool, which keeps showing up
  named and never faced.

## Blank investigated / documented

PELLET SHAPE (89006) — INVESTIGATED AND CLOSED, NO FIX. Sentiment
taught d31, surge never used, withdrawal d90 with the original
"NO FEAST, NO SURGE" quote — exactly r75's closed shape (r74's
proof-test case A: sentiment taught, surge unused → original quote
asserted correct). The quote stands as landed. The d113 grant refusal
(reactor ceiling) postdates the withdrawal and does not change the
reading.

SPOOL ENGAGEMENT QUESTION — DOCUMENTED, NOT FIXED. Spool is now
mentioned-but-never-faced on two blocks' seeds (r76: 89003 d72,
89005 d105). The current instrument cannot distinguish a spool
arrival the scholar never engaged from a codex/fight-narration
mention. Next run's instrument item: persist the first mentioning
line per wave-3 type (or an arrival log) so the engagement question
can be answered per type instead of per name-presence.

## Metric review (for the NEXT run, not this one)

- M5b's redefinition worked but was not exercised (a relay final
  existed, so both old and new rules give GO). Keep the vacuous-GO
  definition; it now matches the prereg text.
- M9b's baseline question: wavesnw swings >10 points vs r75 but
  <1 point vs r74. Keep reporting both baselines; the series is
  volatile, and a single-baseline flag overstates it.
- M22 stays regression reporting: waves AWAY held at 65% for a
  second block — if it holds a third, the away gate deserves its own
  question.
- M2's Arm A clause keeps its coverage-not-winnability reading; this
  block it went GO while M3b/M4 stayed NO-GO, which is exactly the
  separation the clause is for.
- M18 guard is now three blocks clean (r74, r75, r76). Keep the scan;
  do not retire it yet.
- NOWALKIN tally Arm A 5, Arm B 3, two ties (ten blocks). Still no
  lever fate; keep it a tally.
- Telemetry baseline: still the r37-era 2-metric snapshot. This run's
  check LOUD lines (won 0->5, announceDay newly appeared) are the
  same stale-baseline artifact as r48-r76: EXPLAINED, baseline NOT
  rolled. The re-seed proposal stands.
- Next run's question, named: with the first-mentioning-line
  instrument, is spool's named-but-never-faced shape an arrival the
  scholar never engaged, or a narration-only mention? And does the
  waves AWAY 65% hold a third block?

## Regression check (added before landing)

`node scripts/check.js --quick` in the worktree: 284 passed, 6 failed
in 932s. This run modified ZERO tracked files (only new probe/analyzer
scripts + new evidence files — verified via `git status`/`git diff`),
so none of the 6 can be a regression from this run. One failure was
isolated and reproduced standalone:
`scripts/test-establishment-r20-fixes-20261020.js` — racks-full voice
gate, "next day voices once more: expected 2, got 1" (1 FAILURE
standalone, same as in the suite). Pre-existing break on current
master, unrelated to endgame instrumentation; left for its owning
lane, not fixed here. The run's own proofs (SMOKE, DET byte-identical,
analyzer, telemetry check) are all green.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/endgame.json --current
'evidence/2026-10-31/perseed-endgame-r76/*.json' --metrics
won,announceDay,satSeatKind` → LOUD: won newly appeared (baseline 0 ->
current 5, n=7); LOUD: announceDay newly appeared (baseline 0 ->
current 526, n=7). Verdict: EXPLAINED — the baseline file contains
only maxTier/satPenalty from an older regime and says so itself;
won/announceDay are not in it at all. Not a bug, baseline not rolled.
