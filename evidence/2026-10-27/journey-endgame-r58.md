# Journey endgame r58 — THE HOLD NARROWS TO ARMOR + ONE VETERAN, TWICE (lane B, 2026-10-27)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-27/journey-endgame-r58-prereg.md
(written BEFORE any play). Instrument + evidence only, zero src/js
changes. Merged locally, pending ship.

Rotation note (verified before play): r57 endgame merged locally as
eafaed0e3, then social r61 (5 → 6), crisis r58 (6 → 7) and succession
r54 (7 → 4) completed the cycle. Rotation-b reading 4 this run is
the correct post-cycle value, not a missed write.

Canon read before play: docs/CANON.md + docs/TABLE.md (the table
prices the run, never gates on godhood; full seat keeps the
national bar). Gating freeze (Steve 2026-10-27 16:53) stands: no
gating change in this run, whatever the chase finds.

## Leg question (r57's carried items, in order) — answered

1. 199-HOLD RELEASE CHASE — NOT RELEASED, BUT THE HOLD NARROWED
   TO ONE SHAPE, TWICE. No village peaked at 200 or above; no
   wave-5 unlock; no full seat. But two waves seeds peaked at
   exactly 199 (88406, 88407) plus the control (88404) — and BOTH
   waves 199s now share the same shape: armor + veterans short,
   weapons and tricks MET. Compare r57's three shapes
   (veterans-only, armor+veterans, three bars): r58's hold is
   one shape, twice over. The chase sentence sharpens again:
   on a 88406/88407-class village, bank one more LIVING veteran
   AND armor one more fighter, and the hold releases. The
   veterans-only village (r57's 88305-class, r56's 88204-class)
   did not appear this block — no village this block is one
   veteran away alone.
2. DECLINE-BOILERPLATE WART — FIRST DATA IN THREE BLOCKS, AND
   THE VERDICT IS MIXED (see below). Two withdrawal seeds
   (88404 control, 88406 wavesnw), after zero in r56 and r57.
   One beat is fully readable (88404, in the played transcript);
   one is truncated to 300 chars in the JSON with its want-list
   cut off (88406, no decline beat in its transcript slice).
   The wart is no longer "undefined" — it is measured once,
   with a caveat, and still DOCUMENTED for Steve's call (no
   rewording made: generic by design means document, don't
   silently reword).
3. M3 CONVERSION, SPREAD WATCH — THE EDGE HOLDS A THIRD BLOCK.
   Arm B 2 kills vs Arm A 0 kills, spread across TWO seeds
   again (88406 influencer d120, 88407 influencer d61). Three
   blocks now: r55 one-seed edge, r56 zero-kill block, r57
   two-seed edge, r58 two-seed edge. The r56 block reads as the
   outlier, not the rule: NOWALKIN produces kills when fights
   happen, on two seeds at a time, and flights are still there
   too (88406: 2 suburb mFlee before its kill).
4. M3b LIVING VETERAN — SPREAD HOLDS AT 2/6, BAR STILL
   UNREACHED. 2/6 waves seeds bank >= 1 living veteran (88406
   Lucas Brown, 88407 Leo Martin) — same as r57, vs r56's 0/6;
   0/6 bank >= 2, so the replication bar stays NO-GO. The
   direction holds but does not advance: two villages each one
   veteran short, twice in a row.
5. M2 OPPORTUNITY — COLLAPSED BACK TO ZERO ON ARM A. 0/3 Arm A
   seeds recorded a fight (88401, 88402, 88403 all zero-fight)
   vs r57's recovered 2/3. The miss is opportunity again, and
   it is arm-specific this block: Arm B fought 13 census fights
   across 3 seeds while Arm A fought none. Whether that is
   NOWALKIN's doing or seed variance cannot be separated on
   one block — it is reported as an arm split, not a lever
   claim.
6. CONTROL SURVIVAL WATCH — STREAK SPLITS. The fresh control
   (88404) survived with 10 alive and crossed + voiced
   (noticed 1, bandCrossings 1, M5 GO) — but it never announced
   or sat: the table declined it at d90 (withdrawal, see
   below). A control that survives but is declined is a new
   control shape, not a death and not a sit. Single data point,
   named cause: decline, not death.
7. TELEMETRY BASELINE PROPOSAL — CARRIED, NOT ROLLED (see
   Telemetry below).

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: GO 7/7 — 4 announced (88401, 88403, 88406, 88407) +
  2 honest-death (88402 village-lost by scattering, 88405
  village-lost after the bloodbath) + 1 withdrawal (88404).
- M2 CENSUS: NO-GO — coverage 100% (every census fight carries
  a primary outcome), but 0/3 Arm A seeds recorded a fight.
  The miss is opportunity, arm-specific this block.
- M2b ATTRIBUTION: GO — 4 dieFlag fights, all classified, all
  NAMED fight-causal deaths (88405: Lena Ruiz, Thirachai
  Sawaengsri, Olivia + Zhansaya + Xavier + Petra Novak;
  88407: Marvin + Omar).
- M2c ENGINE COVERAGE: GO 6/6 — fights == opens on every waves
  seed, censusErrors 0 everywhere, policy-only opens 0.
- M2d COMMIT-GATE NAMED: GO 2/2 — never-observed ×1 (88405 d86
  eulogy) + gate:hp ×1 (88405 d110 influencer, hp 0.29);
  retired class 0, branch kept.
- M3 CONVERSION: GO 2 vs 0 — Arm B kills on 88406 + 88407, Arm
  A kills 0.
- M3b LIVING VETERAN: NO-GO on the replication bar (0/6 >= 2);
  spread 2/6 >= 1 (88406, 88407), same as r57.
- M4 WAVE-5/FULL: NO-GO 0/6 — no wave-5 unlock, no full seat.
  Closest: 88406 + 88407 at standing 199, held on armor +
  veterans (M12 table below).
- M5 VOICING CANONICAL: GO 1/1 — 88404 crossed + voiced
  (bandCrossings 1, noticedCount 1) even though it never sat.
  The binding counts voicing, not sitting, and the split is
  reported plainly: voiced but declined.
- M6 GUARD NAMED: GO 2/2 — deferred sat waves named: 88403
  guard=losses (17-day deferral), 88406 guard=not-ready
  (6-day deferral).
- M7 PEOPLE: GO — 2 finals sense-read in full (below),
  0 senseless flags.
- M8 EXIT CANON: GO 2/2 — both mFlee fights matched to codex
  counter text (88406 suburb ×2: "You don't kill a suburb;
  you ESCAPE it — LEAVE").
- M9 SUPPLY: GO by code rule — 83 blocked wave-4 arrivals
  across 7 seeds, every one the same contention line ("The
  <monster> stops at the boundary — pacing, unwilling.
  Something else is already here. It's still out there.").
  Same rule as r51–r57 (ONE MONSTER PER TILE + Haven safe law).
- M10 FULL-SEAT GAP: GO 4/4 — 88401 [w4:0/3, w5:0/2], 88403
  [w4:0/3, w5:0/2], 88406 [w3:3/4, w4:2/3, w5:0/2], 88407
  [w4:1/3, w5:0/2].
- M11 STANDING PEAK: GO — peaks reported 6/6 waves seeds: 99,
  95, 99, 172, 199, 199. At-199: 2 waves (+ control 199).
  At-200+: 0.
- M12 READINESS-BAR TABLE (new): GO — tabulated below for
  every sat waves seed from the finale war-path audit (raw
  counts, not just short-lists) plus the control's JSON
  short-list (no finale, no audit). The probe record itself
  carries only short-lists, not raw armor/weapon/trick
  counts — the table's raw counts come from the played
  finale audits, stated here so the next run knows where
  each number came from.
- REG: r35 auditNamed GO 4/4; r37 satPenalty GO 4/4.
- PRIMARY: NO-GO | ALL: NO-GO (M2 + M3b + M4 only; every
  other binding GO).

## RESULTS (7/7 seeds)

| seed | plan | ann | sat | seat | path/branch | won | census fights | kills | living vets | uw | peak |
|------|------|-----|-----|------|-------------|-----|---------------|-------|-------------|----|------|
| 88401 | waves | d90 | d90 | lesser | feared/light | yes | 0 | 0 | 0 | 3 | 99 |
| 88402 | waves | — | — | — | — | no (village-lost, scattered) | 0 | 0 | 0 | 3 | 95 |
| 88403 | waves | d90 | d107 | lesser | witness/light | yes | 0 | 0 | 0 | 3 | 99 |
| 88404 | forcedrift (control) | — | — | — | — | no (survived, withdrawal) | 0 | 0 | 0 | 4 | 199 |
| 88405 | wavesnw | — | — | — | — | no (village-lost, bloodbath) | 9: 5 otherEnd, 1 vFlee, 3 vDie | 0 | 0 | 4 | 172 |
| 88406 | wavesnw | d114 | d120 | lesser | feared/light | yes | 3: 2 mFlee, 1 vKill | 1 | 1 | 4 | 199 |
| 88407 | wavesnw | d90 | d90 | lesser | feared/light | yes | 1 vKill | 1 | 1 | 4 | 199 |

## M12 — READINESS-BAR TABLE (the shape of the hold)

Counts are the finale war-path audit's own words ("Even now
the wave-5 bar reads: ..."); short-lists are the probe's
veterans snapshot. A village at 199 with any short bar is
HELD by defer5; a village below 199 is BELOW-BAR (short, not
held). Weapons/tricks are listed as MET only where the audit
does not name them short (88406/88407) — the audit names
short bars, it does not recite met ones.

| seed | peak | hold | armor x/4 | weapons x/6 | tricks x/3 | veterans x/2 | rd5short |
|------|------|------|-----------|-------------|------------|--------------|----------|
| 88401 | 99 | below-bar | 1 | 3 | met | 0 | [armor, weapons, veterans] |
| 88403 | 99 | below-bar | 2 | 5 | met (not named short) | 0 | [armor, weapons, veterans] |
| 88406 | 199 | HELD | 3 | met | met | 1 | [armor, veterans] |
| 88407 | 199 | HELD | 3 | met | met | 1 | [armor, veterans] |
| 88404 (control, no finale) | 199 | HELD (by peak + short-list) | short | — | — | 0 | [armor, veterans] |

The "met" rule, stated so the next run can check it: a
bar counts as met when it appears in NEITHER the audit's
short list NOR the probe's rd5short — and on all four sat
seeds the two sources agree exactly (88401's audit names
armor/weapons/veterans short and its short-list matches;
88406/88407's audits name armor/veterans short and their
short-lists match). A future probe should still record
raw armor/weapon/trick counts per village instead of
relying on audit recitation (instrument gap, not a game
finding) — agreement between two recitations is not the
same as a count.

The chase in one line: the two held villages each need
ONE more armored fighter AND ONE more living veteran.
No village this block is one veteran away alone.

## THE HEADLINE: THE HOLD NARROWS TO ARMOR + ONE VETERAN, TWICE

88406 (wavesnw, won feared/light, sat d120 after a 6-day
deferral) and 88407 (wavesnw, won feared/light, sat d90)
are the same village shape twice: standing 199, wave-5 bar
"armor the village (3 of 4 fighters armored); blood your
fighters (1 of 2 veterans)", one living veteran banked
each (88406: Lucas Brown, influencer d120 — the kill
landed on sit day itself; 88407: Leo Martin, Ugly Beast
d61). Their full-seat gaps differ by one wave-3 fight
(88406 [w3:3/4, w4:2/3, w5:0/2], 88407 [w4:1/3,
w5:0/2]), but the hold is identical. r57's three shapes
have collapsed to one shape, twice — which makes the
next chase falsifiable: a village that armors its fourth
fighter and banks a second living veteran releases, or
the hold has another component the audit is not naming.

## THE SECOND HEADLINE: WITHDRAWAL IS NOT TERMINAL, AGAIN — AND THE BOILERPLATE GETS ITS FIRST READING

88406 was declined at d90 (withdrawal, end-rescan), then
announced d114, sat d120, and won feared/light. That is
the second withdrawal-is-not-terminal case after r55's
88101 — the decline is a missed window, not a run end.
88404 was declined at d90 and never sat, but it survived
with 10 alive to day 180 — the decline is not a death
either. The village keeps living after the table doesn't
come: 88404's transcript shows meals, injuries, and
lingering by the fire after the decline beat.

The boilerplate reading (88404, the fully-readable beat):
the accusation says "NO HUNGER ON THE RECORD — THE PELLET
HUMS WHERE THE FIRE SHOULD BE. NO FEAST, NO SURGE,
NOTHING HERE WE CAN PRICE." The village it accuses had
shared 293 food, held a 64,850 pantry, and kept 10 people
alive — read literally, "no hunger" is wrong about this
village. The appended want-list is the honest part: "wave-2
monsters faced; wave-3 monsters faced; the food-thesis
deeds (no feast can carry the surge while the pellet
hums)." Two of the three are certainly gaps (wave-3 max
1 against a 3-or-4 bar; surge deed never fired all run),
and the third (wave-2) is timing-uncertain: the whole-run
max is 6, but the decline fired at d90 and the d90 value
is not recoverable from the whole-run max. Verdict:
accusation generic and overstated; want-list specific and
mostly true. The 88406 beat cannot be graded the same
way: its JSON line is truncated at 300 chars with the
want-list cut off, and its transcript slice contains no
decline beat — the want-list for 88406 is unknown, not
assumed to match 88404's. A future probe should stop
truncating withdrawal lines (instrument gap, not a game
finding).

## VILLAGE ASSESSMENT (census in plain words)

- 88401 (waves, won lesser feared/light, 3 alive): Sanjay
  Nikitin's village, global scale, pantry 18,512. It sat
  on day 90 without ever meeting a wave-4 monster — 17
  arrivals turned away at the boundary — and won on waves
  1–3 alone (15/9/6). Nobody in it killed a wave-4 beast;
  nobody needed to for the lesser seat.
- 88402 (waves, village-lost, 6 alive at the scatter):
  Paisley Gallagher's village never reached the window.
  It sent food deeds (d12) and even surged (d50), but the
  pantry hit zero and on the third hungry day people
  walked in different directions — "The scattering,
  again." An honest starvation-scatter, not a table death.
- 88403 (waves, won lesser witness/light, 5 alive): Ivy
  Wang's village, global scale, pantry 22,675. It waited
  17 days past the window (losses guard, satPenalty 17 —
  the block's only penalty) and sat on day 107. Zero
  wave-4 fights; the window, not the road, was its story.
- 88404 (control, survived, declined, 10 alive):
  Pamela Ramirez's village, global scale, pantry 64,850 —
  the richest pantry in the block. It crossed and voiced
  (noticed 1, bandCrossings 1) but the table declined it
  at day 90 and it never sat. Ten people, two dead all
  run (arena d12, wound d22), still living at day 180.
  The decline did not kill it.
- 88405 (wavesnw, village-lost, 1 alive): Andre Flores
  alone. The block's bloodbath: 9 census fights, 3
  villager-death fights (Lena d87, Thirachai d95, Olivia
  + Zhansaya + Xavier + Petra d97 — the eater took four
  people in one day), then starvation took two more and
  a wound took the last but one. It fought wave-4
  monsters nine times and killed none of them. The
  village that fought hardest died hardest.
- 88406 (wavesnw, won lesser feared/light, 9 alive):
  Nadia Khoury's village, national scale, pantry 10,678.
  Declined at d90, announced d114, sat d120. Lucas Brown
  put down The Influencer on sit day; two suburb escapes
  (d113, d119) are the honest "you don't kill a suburb,
  you escape it" exits. Two ascensions from one village
  (Pavel Dubinin, Greta Hansen) — the table notes it has
  never seen that before.
- 88407 (wavesnw, won lesser feared/light, 8 alive):
  Natalia Mironova's village, global scale, pantry
  16,242. Leo Martin put down The Ugly Beast on day 61
  and lived to sit on day 90; Leo ascended through relay
  doors the village built. Marvin and Omar died to the
  influencer on day 61 — the kill cost two people, and
  the finale says so.

## PEOPLE CHECK (SENSE-TESTING LAW — full transcripts read)

1. 88406 feared/light final, "Show mercy" — PASS. The
   final is coherent end to end: the audit names real
   deeds (waves 14/7/3, 2 wave-4 fought, 11 contests, 4
   crises), the war-path names Lucas's sit-day kill and
   the exact bars still short, the feared path plays
   restraint as the frightening choice ("Your people
   notice the restraint too"), mercy lands as "the most
   frightening thing you ever did," and the architect +
   pantheon beats credit Pavel and Greta by name without
   inventing shared history. The oversight coda (stasis
   kids, "the looking away") resolves the run's theme
   rather than restating it. 0 senseless flags.
2. 88407 feared/light final, "Show mercy" — PASS, and
   honestly different from 88406's despite the same path
   and final pick: its ledger reads "More promises broken
   than kept" where 88406's reads "the protected outnumber
   the killed," its kill is Leo's day-61 Ugly Beast
   (not a sit-day kill), and its herald line ("THE HERALD
   came. Named and located") is its own. Same path, same
   final choice, different run read back — the finale is
   not a static menu. 0 senseless flags.
3. Withdrawal beat (88404) — PASS with the boilerplate
   caveat above. The beat itself is voiced and consequential
   (the village lives on after it, and the want-list names
   what it would take), even though the accusation
   overstates. No fabricated shared history, no filler loop.

## BLANKS FILLED OR DOCUMENTED

- FILLED (r57's open question): whether the live game
  surfaces the readiness bars outside the audit. YES — in
  the finale war-path audit itself, in plain words with
  counts ("armor the village (3 of 4 fighters armored);
  blood your fighters (1 of 2 veterans)"). The caveat
  stands beside it: a village that never sits (88402,
  88405) or is declined (88404) never hears its bars —
  the hold is explained at the sit, not while climbing.
  That is a design observation for Steve, not a fix made
  here (gating freeze; text only, and the audit already
  speaks).
- DOCUMENTED (instrument gaps, not game findings): (a)
  withdrawal lines truncate at 300 chars in the probe
  JSON — 88406's want-list is unrecoverable this run;
  (b) the probe records readiness short-lists, not raw
  armor/weapon/trick counts — M12's raw counts come from
  finale audits, and 88401's tricks count is unknown
  (stated, not invented); (c) whole-run fullseat max
  cannot re-derive a d90 decline state — 88404's wave-2
  want item stays timing-uncertain.
- DOCUMENTED (no new game change): M2's Arm A zero-fight
  block is an arm split (Arm B 13 fights, Arm A 0), not a
  lever claim — one block cannot separate NOWALKIN's
  effect from seed variance, and the prereg binds that
  restraint.

## JUDGEMENT — reachable / fun / winnable (leg 4)

- REACHABLE: yes for the window, no for the full seat —
  same split as r55–r57, sharper. 4/7 villages sat (all
  lesser), 2 scattered or bled out before the window, 1
  survived but declined. The window is not the problem;
  wave 5 and the full seat are, and the wall now has one
  shape (armor + one veteran) instead of three.
- FUN: yes, with the same cost caveat sharpened. The
  finals read as real payoffs (Lucas's sit-day kill spoken
  aloud; Leo's day-61 kill remembered; 88405's bloodbath
  the most memorable loss of the recent blocks). The
  caveat: a player who climbs to 199 twice in a row and
  hears the same two bars short will feel the hold as a
  ceiling, not a challenge — unless the game tells them
  the bars WHILE climbing, not only at the sit. The
  audit speaks; the climb is silent.
- WINNABLE: the lesser seat is winnable 4/4 among villages
  that reached the window this block (4/7 overall); the
  FULL seat and wave 5 remain unwon across r55–r58 (0/25
  waves seeds). The wall is reachable — one armored
  fighter + one living veteran on a 88406-class village —
  but it has not fallen yet.

## Gates + checks

- PILOT (88401 + 88405 + 88404, 180d): signal fired on
  every clause (census fights on 88405; withdrawal on
  88404; standing 199 on 88404) — expanded to the full 7
  seeds per the prereg gate.
- SWEEP (7 seeds, 180d): exit 0, stderr empty; pilot
  seeds byte-identical between pilot and sweep runs.
- DET (instrument-on twice, 2x120d, seed 88401): GREEN
  byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini):
  GREEN byte-identical (121d, won false, alive 8, pantry
  12705 both sides).
- ANALYZER: exit 1 = verdicts (PRIMARY NO-GO | ALL NO-GO),
  not a crash; verdicts identical on re-run.
- CHECK-QUICK (pre-merge, in the worktree, 2026-10-28):
  278 passed, 9 failed in 468s — IDENTICAL script set to
  r56/r57's standing profile (hide-discovery, measurement
  comparison/proof-update/workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, parity-20261014
  gear spear+jacket, establishment-r20-fixes racks-full
  next-day voice). This run changed zero src/js, so the
  9 are pre-existing on current master, not a regression
  from this commit; check.js does not execute this run's
  probe/analyzer scripts. A post-merge re-run is due only
  if master moves under the branch before landing (see
  landing record below).

## Telemetry deviation check (2026-10-27)

- Tool verdict (comparable metrics maxTier,
  satPenalty.penalty, 7 files): LOUD on maxTier (baseline
  16 -> current 2) and satPenalty.penalty (baseline 91 ->
  current 17).
- VERDICT: EXPLAINED — the same guard-ended population as
  r48–r57, taken further (this block's only penalty is
  one 17-day losses-guard deferral on 88403; prompt sits
  and the 6-day not-ready deferral on 88406 carry no
  penalty by construction). The baseline file itself says
  its regime is unrecorded and not to compare pre-seat
  corpora against it. Baseline NOT rolled. The re-seed
  proposal stands for a next run: re-seed from a
  same-regime guard-ended corpus and record the regime
  in the file.
- Footnote (measurement hygiene): an earlier invocation
  with --metrics maxTier,satPenalty (object, not
  .penalty) reported "satPenalty 0 -> 22" — that 22 is
  telemetry-check summing the object's numeric leaves
  (tier 2 + losses 3 + penalty 17), not the penalty. The
  comparable figure is penalty 17, used above. The next
  run should use satPenalty.penalty, not satPenalty.

## Metric review

- M4's GO stays narrow and labeled: it counts the UNLOCK
  (uw=5) or the FULL seat, not the veterans bar. This run
  reports bars + peaks beside every 199, per r54–r57's
  rule, and now as the M12 table.
- Gate-passed-uncommitted: RETIRED (r55). 0 hits again;
  the branch stays in the analyzer.
- Daily-slice withdrawal detector: RETIRED (r55). The
  end-rescan IS the detector; two withdrawals this run,
  both via end-rescan.
- Telemetry baseline: still describes long-deferral sits
  (r37), not guard-ended windows — r48–r58 all reported
  it EXPLAINED and did not roll it. Re-seeding proposal
  stands.
- Balanced panel (§15): no panel comparison applies —
  zero src/js changes, no lever moved on the default path
  (NOWALKIN default off, census + gate snapshot are
  read-only instrumentation). The comparison is r57→r58
  via identical substrate, and Arm A→Arm B on one
  variable.
- M12 (new this run): the bar table is bound and filled
  from finale audits + probe short-lists, with the
  instrument gaps (truncated withdrawal lines, missing
  raw counts, audit-recitation limits) stated above
  rather than papered over. Next run's prereg should
  carry M12 unchanged and add the probe fix (stop
  truncating withdrawal lines; record raw readiness
  counts) as a tooling item, not a binding change.
- M2's arm split: one block cannot separate NOWALKIN's
  effect from seed variance. The next run should watch
  whether Arm A opportunity stays at zero (a pattern)
  or rebounds (variance) — and should NOT re-score this
  block's NO-GO against a friendlier metric.

## Evidence

- evidence/2026-10-27/journey-endgame-r58.md (this note)
- evidence/2026-10-27/journey-endgame-r58-prereg.md
- evidence/2026-10-27/perseed-endgame-r58/endgame-r58-{88401..88407}.json
- evidence/2026-10-27/perseed-endgame-r58/endgame-r58-{88401..88407}-transcript.txt
- journey2-endgame-r58-pilot.log (in goal hidden_files; NOT
  committed to the repo: sweep stdout is per-run bookkeeping)
- journey2-endgame-r58-sweep.log (in goal hidden_files; NOT
  committed: sweep stdout is per-run bookkeeping)
- journey2-endgame-r58-analyzer.txt (in goal hidden_files; NOT
  committed: analyzer stdout is per-run bookkeeping)
- journey2-endgame-r58-det.log, journey2-endgame-r58-fid.log
  (in goal hidden_files; NOT committed)
- scripts/probe-endgame-r58-20261027.js
- scripts/analyze-endgame-r58-20261027.js
- scripts/policies/capable.js (unchanged — NOWALKIN_W4 rule from r50,
  env-gated, default off; no src/js changes this run)
