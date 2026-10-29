# Journey endgame r65 — SURGE IS THE BOTTLENECK, AND NOBODY PRACTICES IT (lane B, 2026-10-29)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-29/journey-endgame-r65-prereg.md
(written AND committed BEFORE any play: commit 040d68371). Instrument +
evidence only, zero src/js changes. Gating freeze (Steve 2026-10-27 16:53)
stands: no gating change in this run, whatever the chase finds.

Canon read before play: docs/CANON.md + docs/TABLE.md (the table prices
the run, never gates on godhood; full seat keeps the national bar) +
standing.js readiness-gate comments (checked during analysis, not before
play — the gate mechanics below are read from code, cited by file).

## Leg question (r61's carried items, in order) — answered

1. UNLOCK + INVITATION CONJUNCTION — NO, AND THE FIRST HALF FAILS TOO.
   No waves seed unlocks wave 5 this block (best peak 199 on 88916,
   still uw 4; the other peaks are 152, 0, 125, 127). So M4b's
   conjunction (unlock AND announced) is 0/6 — but unlike r61, where
   88906 unlocked and went uninvited, this block never reaches the
   conjunction's first half at all. The sharper finding is in the
   second half's precondition: the SURGE deed. Only the two sat seeds
   ever surge (88913 d45, 88916 d33 — both EARLY, long before the
   d90 announce). The other five seeds send sentiment (d11–d20) and
   never surge. The mechanism, read from code: feastSurgeUsed marks
   a FEASTED ability resolving in combat (src/js/feastBuff.js) — the
   deed-hunt policy never feasts-then-fights deliberately (its
   surgeUpkeep channels sentiment, a different deed), so surge
   arrives only incidentally, on villages that happen to fight
   feasted. The invitation prices a deed the climb never names
   before d90 (r61) AND competent play as scripted never practices.
   That is two independent reasons the conjunction stays at zero,
   and the second one is about the policy, not the game — a future
   run that deliberately feasts-then-fights would test whether the
   game rewards the deed or the policy just never earns it.
2. PEAK LIVING VETERANS (r61 metric review, applied here) — NO-GO,
   AND THE NEW INSTRUMENT CLEARS THE OLD BAR OF SUSPICION. Peak
   >= 2: 0/6. Peak >= 1: 1/6 — 88916 only, peak 1 on d110, the sit
   day itself (Aria's Eulogy kill). Peak EQUALS end-state on every
   seed this block: no transient peak hid anywhere, so r61's
   transient-2 (88906, d153) remains the only transient case in the
   series, and end-state bars were not hiding peaks this time. The
   daily snapshot works (it tracked the d110 peak in place); it
   simply found nothing to track elsewhere, because only one
   wave-4+ kill happened in the whole block.
3. RELEASE-DAY SNAPSHOT (r61 instrument gap) — GO, VACUOUS, AND
   LABELED AS SUCH. No seed reached uw=5, so no release snapshot
   exists — the M13 binding passes only because there is nothing
   to snapshot. The daily hook ran all 180 days on all 7 seeds
   (peak tracking proves it runs); the release path itself is
   still unproven and still awaits a uw=5 seed. This is not a
   closure of the gap, it is a clean vacuous pass.
4. NOWALKIN REPLICATION, third block — ARM B AGAIN, BY ONE KILL.
   Arm B 1 kill (88916, double-Eulogy) vs Arm A 0. Fight totals:
   Arm A 17 fights (3+0+14), Arm B 23 (9+5+9). Block tally now:
   r60 Arm A, r61 Arm B, r65 Arm B — but the counts are tiny
   (r65: 1 kill in 40 fights) and no lever fate is decided on
   this. M3 GO on its letter; the direction tally is 2-1 Arm B
   across three blocks, not a verdict.
5. RELAY-BRANCH TALLY — THE LIGHT CELL FILLS. 88913 walks
   relay/light: noticed 1, bandCrossings 0, with the notice line
   in full ("NOTICED. YOUR REGISTER IS SHIFTING TENDER — YOU
   TEACH MORE THAN YOU TAKE. I AM... KEEPING UP. BARELY. DO NOT
   SLOW DOWN ON MY ACCOUNT."). The branch marker pattern is now
   a gradient, not a binary: dark 1/1 (r60, r61 controls), light
   1/0 (r65 88913), grey 0/0 (r59 control). Light notices but does
   not cross bands. M5b GO (1 relay final tabulated, branch
   named); the cross-branch LEAD is now a pattern with three
   cells filled, still one observation per cell — not a law.
6. DECLINE vs SILENT NO-SHOW — NO SILENT CASE THIS BLOCK. 88917
   is withdrawal-voiced d126 (the 5th readable beat, same generic
   boilerplate as r61: "NO HUNGER ON THE RECORD — ... NO FEAST,
   NO SURGE" — verdict stable, want-list = the food-thesis deeds,
   sent d20, never surged), then village-lost by scattering — a
   second died-after-decline case (after r61's 88901), against
   three survived-after-decline cases (r55, r58, r61-88906). The
   other four non-announced seeds are village-lost by scattering
   (88911, 88912, 88914) or true extinction (88915) — all
   classified, none silent. M14 GO 6/6. The silent-no-show class
   (r61 88902) does not reproduce.

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: GO 7/7 — 2 announced (88913, 88916) + 5 honest-death
  (4 scatterings + 1 extinction, all voiced in-transcript).
- M2 CENSUS: GO — coverage 100%, Arm A with fights 2/3 (88911,
  88913; 88912 zero-fight, village-lost d39).
- M2c ENGINE COVERAGE: GO 6/6 — fights == opens on every waves
  seed, censusErrors 0, policy-only opens 0.
- M2d COMMIT-GATE NAMED: GO 14/14 — every uncommitted fight
  classified (13 never-observed engine fights + 88917's d94
  triple-Reunion gate:hp).
- M2b ATTRIBUTION: GO 15/15 — every dieFlag fight carries a named
  fight-causal death.
- M3 CONVERSION: GO — Arm B 1 kill vs Arm A 0 (tally metric, no
  lever fate decided).
- M3b-peak PEAK LIVING VETERAN: NO-GO — 0/6 peak >= 2; spread-peak
  1/6 (88916 peak 1 @d110). End-state counts identical to peaks.
- M4 WAVE-5/FULL: NO-GO — 0/6 unlock or full seat.
- M4b CONJUNCTION: NO-GO (expected) — 0/6 both unlock and announce;
  no seed even unlocked.
- M5 VOICING CANONICAL: NO-GO — control 88914 village-lost d34
  (scattering), never announced, crossed=false, voiced=false.
  This is a CONTROL MORTALITY, not a voicing failure: the control
  died before the window. It is not re-scored, and it does not
  impugn the relay voicing — the block's one relay final (88913)
  fired its notice line.
- M5b RELAY-BRANCH TABULATION: GO — 1 relay final tabulated
  (88913 light, noticed 1, cross 0).
- M6 GUARD NAMED: GO 2/2 — 88913 guard=losses, 88916
  guard=veteran-banked (the sit-day kill).
- M7 PEOPLE: GO — 2 finals sense-read in full (below), 0
  senseless flags.
- M8 EXIT CANON: GO — 9 mFlee fights, all matched to codex
  counter text.
- M9 SUPPLY: 105 blocked wave-4 arrivals across 7 seeds (88911:
  17, 88912: 2, 88913: 17, 88914: 3, 88915: 7, 88916: 41, 88917:
  18), every one the same contention line ("stops at the boundary
  — pacing, unwilling. Something else is already here. It's still
  out there."). Same rule as r51–r61 (ONE MONSTER PER TILE +
  Haven safe law). Non-wave-4 arrivals blocked by the same line
  (a Big Beast, a Hushpuppy on 88911) — the slot is near-always
  occupied, the supply mechanism itself.
- M10 FULL-SEAT GAP: GO 2/2 — 88913: [w5:0/2], 88916: [w5:0/2]
  (distinct wave-5 types fought — a DIFFERENT bar from the
  readiness veterans bar; the two are not conflated here).
- M11 STANDING PEAK: GO — peaks reported 6/6 waves seeds: 152,
  0, 140, 125, 199, 127. At-199: 1, at-200+: 0.
- M12 READINESS-BAR TABLE: GO 2/2 — tabulated below from the
  probe's raw counts; audit agreement checked on both sat seeds
  (88913's war-path wave-5 bar: armor 3/4, weapons 4/6; 88916's:
  veterans 1/2 only — both match the probe counts).
- M13 RELEASE SNAPSHOT: GO (vacuous) — no uw=5 seed, no snapshot
  owed; the release path itself remains unproven (see question 3).
- M14 INVITE CLASSIFICATION: GO 6/6 — announced 2, village-lost
  3 (scattering/extinction counted as their own class, not
  silent), withdrawal 1.
- REG: r35 auditNamed GO 2/2; r37 satPenalty GO 2/2 (88913:
  tier 2 / losses 3 / penalty 17, matching its 17-day deferral
  and 2-week overtime note; 88916: tier 2 / losses 1 / penalty
  11, matching its 20-day deferral and 2-week note).
- PRIMARY: NO-GO (M3b-peak, M4, M4b, M5) | ALL: NO-GO (same four).
  Analyzer PRIMARY excludes the note-judged M7 (people) and M9
  (supply count) — both GO in this note — and includes every
  other preregistered gate.

## RESULTS (7/7 seeds)

| seed | plan | ann | sat | seat | path/branch | won | census fights | kills | peak vets | peak |
|------|------|-----|-----|------|-------------|-----|---------------|-------|-----------|------|
| 88911 | waves | — | — | — | — | no (village-lost, scattering d83) | 3: 1 mFlee, 1 talkDown, 1 vDie | 0 | 0 | 152 |
| 88912 | waves | — | — | — | — | no (village-lost, scattering d39) | 0 | 0 | 0 | 0 |
| 88913 | waves | d90 | d107 | lesser | relay/light | yes | 14: 3 mFlee, 1 vFlee, 7 talkDown, 3 otherEnd | 0 | 0 | 140 |
| 88914 | forcedrift | — | — | — | — | no (village-lost, scattering d34) | 0 | 0 | 0 | 0 |
| 88915 | wavesnw | — | — | — | — | no (village-lost, TRUE EXTINCTION d92) | 9: 7 vDie, 1 vFlee, 1 otherEnd | 0 | 0 | 125 |
| 88916 | wavesnw | d90 | d110 | lesser | beloved/light | yes | 5: 3 mFlee, 1 vDie, 1 vKill | 1 | 1 @d110 | 199 |
| 88917 | wavesnw | — | — | — | — | no (village-lost, scattering d133, withdrawal d126) | 9: 2 mFlee, 6 vDie, 1 otherEnd | 0 | 0 | 127 |

## M12 — READINESS-BAR TABLE (the shape of the hold)

Probe counts are waveUnlockReady(5) readings at run end (demand:
armored 4, armed 6, tricks 3, veterans 2). Audit lines are the
finale war-path's own words; a bar counts as met when the audit
does not name it short AND the probe count meets demand.

| seed | peak | hold | armor x/4 | weapons x/6 | tricks x/3 | veterans x/2 | rd5short |
|------|------|------|-----------|-------------|------------|--------------|----------|
| 88913 | 140 | sat, lesser | 3 | 4 | 24 (met) | 0 | [armor, weapons, veterans] |
| 88916 | 199 | sat, lesser | 4 (met) | 8 (met) | 22 (met) | 1 | [veterans] |

* 88916 is the r61-88905/88907 shape again: everything met except
  one living veteran. The veterans-only hold is now the modal sat
  shape (r61: 2/3 sat waves seeds; r65: 1/2, the other being the
  wider 88913 shape). 88913's wave-4 bar reads differently from
  its wave-5 bar (weapons 4/5, veterans 0/1) — the audit's two
  bars are not the same demand, and the table above is the wave-5
  bar only.
* Armory note (recorded, not interpreted): donations 1/3/2/0/9/1/1
  across the block, craft donations 0 everywhere — yet 88916 ends
  armored 4/4 and armed 8/6. Worn armor and weapons arrive by
  routes other than armorydrive donations, same as r61's recorded
  note; the donation→worn link is still unestablished.

## VILLAGE ASSESSMENT (census in plain words)

- 88911 (waves, village-lost d83, scattering): sent d13, never
  surged, peak 152, pantry 0 at end. Three fights: an Algorithm
  fled, a Suburb talked down, an Algorithm killed Mia and Hannah
  Kim in the arena on d83 — the same day the village scattered
  (starvation 3, thirst 2 among the fallen). A village that talked
  and fought and still went hungry.
- 88912 (waves, village-lost d39, scattering): the quiet seed —
  sent d12, never surged, peak 0, zero fights, zero wave-4
  meetings, dead by d39 (sickness 2, starvation 2, wild 1,
  stranger 1). It never got to play the leg at all; an honest
  early death, and the reason M2's Arm A arm counts 2/3, not 3/3.
- 88913 (waves, won lesser relay/light, 4 alive): the talking
  village — 14 fights, 7 resolved by TALK, 0 kills, 0 veterans.
  Sent d13, surged d45, announced d90, waited 17 days (guard
  losses, penalty 17), sat d107, pantry 11,092, peak 140, held on
  armor + weapons + veterans. It won WITHOUT killing a wave-4
  monster — the relay road does not need blood, and its final
  says so ("You came to the Table as the Relay the hard way:
  one fight at a time, most of them for someone else").
- 88914 (control, village-lost d34, scattering): sent d14, never
  surged, peak 0, zero fights. Sickness took 4 before hunger
  scattered the rest. The control that never reached the window
  — M5's NO-GO is this death, not a voicing defect.
- 88915 (wavesnw, village-lost d92, TRUE EXTINCTION): the fighting
  village that died fighting — 9 fights, 7 villager deaths, 0
  kills, peak 125, sent d19, never surged, pantry 8,162 AT
  EXTINCTION. Food existed; people didn't. The last bearer,
  Ghazi Al-Marri, dies in the wild: "No one is left to pick up
  the Codex. The village dies out — quietly, the way villages
  do." The block's starkest line, and a counter to any story
  that pantry alone saves a village.
- 88916 (wavesnw, won lesser beloved/light, 8 alive): the block's
  only veteran and only kill. Sent d11, surged d33, announced d90,
  waited 20 days, sat d110 — the same day Aria Thompson put down
  the double Eulogy (guard veteran-banked, peak vet 1 @d110,
  penalty 11, pantry 4,226, peak 199, global scale, held on
  veterans ONLY). The r61-88905 shape, one more time: the kill
  and the sit share a day.
- 88917 (wavesnw, village-lost d133, scattering after withdrawal
  d126): sent d20, never surged, peak 127, 9 fights, 6 villager
  deaths, 0 kills. Declined at d126 in the same boilerplate as
  r61, then scattered a week later. A village that heard the
  table's no and then starved — the decline did not kill it,
  hunger did.

## PEOPLE CHECK (SENSE-TESTING LAW — full finals read)

1. 88913 relay/light final, "Teach it to let go" — PASS. The final
   is coherent end to end: the audit names real deeds (18/9/6,
   7 wave-4 fought, 13 contests, 4 crises), the war-path names
   the HERALD "named and located" and the drafts faced, the
   overtime note (2 weeks, 3 lost, −17) matches the 17-day
   deferral and penalty 17 exactly, and the light road follows
   from the ledger (protected outnumber killed, food truth
   shared, relay carried faithfully). The OUTSHONE beat lands
   because it is honest: Xiaojuan Ni acted boldly while the
   player watched, "it stings exactly as much as it should."
   0 senseless flags.
2. 88916 beloved/light final, "Let the audience speak" — PASS,
   and honestly different from 88913's despite the same branch:
   its audit reads 17/9/4 with 4 wave-4 fought, its war-path
   names the day-110 kill ("On day 110, Aria put down The
   Eulogy") and veterans as the ONLY short bar, its overtime
   note (2 weeks, 1 lost, −11) matches its 20-day deferral and
   penalty 11, and its architect beat (Maame Robertson ascended
   through doors you built: relay) lands because the village
   actually built those doors. Same branch, different run read
   back — the finale is not a static menu. 0 senseless flags.

Seams and label notes (none blocking, all recorded):
- Both sat seeds carry "THE HERALD came. Named and located" —
  r61's 88905 read "Named, not yet located." The teaser has
  moved from named to located on both sat seeds this block;
  what "located" does in play is still not established.
- 88913's war-path wave-4 bar (weapons 4/5, veterans 0/1) differs
  from its wave-5 bar (weapons 4/6, veterans 0/2) — two demands,
  not a mismatch; the M12 table is the wave-5 bar only.
- Census "alive" after a scattering counts the pre-wipe roster
  (88911: 3, 88912: 4, 88914: 8, 88917: 1) — those are people
  records, not survivors walking. Only 88915's 0 is a true
  post-extinction count. Read the assessment with that in mind.
- 88913's 39 vetFights with 0 kills: veteran-turns are not kills,
  and the relay road banks none — reported, not interpreted.

## BLANKS FILLED OR DOCUMENTED

- FILLED (relay tally's missing cell): the first LIGHT relay final
  (88913), with its notice line in full and its band-crossing
  count (0) — the branch pattern is now dark 1/1, light 1/0,
  grey 0/0.
- FILLED (peak-vs-end question): the daily peak snapshot ran and
  found peak == end-state on all 6 waves seeds — end-state bars
  hid no transient peaks this block.
- DOCUMENTED (surge mechanism, code-read): feastSurgeUsed = a
  feasted ability resolving in combat. The competent policy never
  practices it; both surges this block were incidental. A
  feast-then-fight policy arm is the next test of whether the
  game rewards the deed — proposed, not built, here.
- DOCUMENTED (M13, honestly vacuous): the release snapshot path
  is still unproven — it needs a uw=5 seed, and this block has
  none.
- DOCUMENTED (control mortality): a forcedrift control can die
  before the window (88914, d34) — M5's NO-GO here is mortality,
  and future preregs should name a control-replacement rule
  rather than letting one early death sink the voicing metric.
- DOCUMENTED (not a lever kill): NOWALKIN's tally is 2-1 Arm B
  across r60/r61/r65 on a total of 2 kills — far too thin to
  bless or kill the lever.
- RECORDED, NOT INTERPRETED: armory donations (17 total, 0 craft)
  do not read as worn armor/weapons (88916: 1 donation, armored
  4/4, armed 8/6).

## JUDGEMENT — reachable / fun / winnable (leg 4)

- REACHABLE: the window yes, the full seat no, the invitation
  now doubly gated. 2/7 villages sat (both lesser, both won); 5
  scattered or went extinct before or without the window. The
  window is not the problem; the invitation's surge deed is —
  it is unpracticed by competent play and unnamed during the
  climb, so most villages never even enter the pricing.
- FUN: yes, with the silence caveat now carrying a mechanism.
  The finals read as real payoffs (the day-110 kill spoken aloud
  at the sit; the relay final that does not need blood; the
  extinction line that earns its quiet). The caveat: a player
  who climbs to 199 standing, never feasts-then-fights, and
  hears nothing will feel the silence as a missing game — unless
  the game teaches the feast-surge deed while climbing, not only
  in a decline line at d90.
- WINNABLE: the lesser seat is winnable 2/2 among villages that
  reached the window this block (2/7 overall); the FULL seat
  remains unwon across r55–r61 + r65 (0/55 waves seeds by seat);
  wave 5 is unlocked 1/49 by unlock across r55–r61 + r65 (this
  block: 0/6), unplayed at the table.

## Gates + checks

- PILOT (88911 + 88915 + 88914, 180d): gate passed on the census
  clause — census fights on both waves seeds (3 and 9) — expanded
  to the full 7 seeds per the prereg gate. No 199-class peak and
  no relay final in the pilot; the gate's letter is census
  fights OR peak OR relay final, and the first clause held.
- SWEEP (7 seeds, 180d): exit 0, stderr empty. Pilot seeds in the
  sweep log match the pilot log exactly (summary lines
  diff-identical for 88911, 88915, 88914).
- DET (instrument-on twice, 2x120d, seed 88911): GREEN
  byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini):
  GREEN byte-identical (99d, won true, alive 4, pantry 11227
  both sides).
- ANALYZER: exit 1 = verdicts (PRIMARY NO-GO | ALL NO-GO), not a
  crash; M3b-peak, M4, M4b, M5 the four NO-GOs, all
  preregistered as bindings (M4b expected).
- CHECK-QUICK (pre-merge, in the worktree): 284 passed, 6 failed
  in 663s. The 6 are r61's standing set, identical family by
  family: measurement proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20-fixes (next-day voice). Zero r65-attributable
  failures — this run changed zero src/js and zero test files,
  and the probe/analyzer are new scripts outside the green list.

## Telemetry deviation check (2026-10-29)

- Tool verdict (comparable metrics maxTier, satPenalty.penalty,
  7 files): LOUD on both.
  - maxTier: baseline 16 -> current sum 4 (−75%). Current
    maxTier values are 2 on both sat seeds (88913, 88916) and 0
    on the five non-sat seeds — the same guard-ended /
    short-deferral population as r48–r61.
  - satPenalty.penalty: baseline 91 -> current sum 28 (−69%).
    Only the two sat seeds carry penalties (17 + 11, from
    17-day and 20-day deferrals); the other seeds never sat.
- VERDICT: both EXPLAINED — the baseline file itself says its
  regime is unrecorded and not to compare pre-seat corpora
  against it; it describes long-deferral sits (r37), not this
  block's guard-ended windows plus two moderate overtime sits.
  Baseline NOT rolled. The re-seed proposal stands for a next
  run: re-seed from a same-regime guard-ended corpus and record
  the regime in the file.

## Metric review

- M3b-peak is now the binding and it behaved: the daily snapshot
  is cheap, it tracked the one real peak in place, and it proved
  the negative (no hidden transient peaks) rather than just
  asserting it. Keep it; keep reporting end-state alongside for
  series continuity.
- M4b's NO-GO is the finding, not a failure: the conjunction
  metric separates the unlock question from the invitation
  question, and this block shows the unlock can fail while the
  invitation precondition (surge) also fails independently.
  Keep M4 and M4b separate.
- M13's vacuous GO must not be read as instrument proof: the
  release path needs a uw=5 seed before it can be called tested.
  A future prereg should carry the release snapshot as a
  conditional binding (binding only when uw=5 occurs), which is
  what M13 already is — the note just must not oversell it.
- M5 needs a control-replacement rule: one early control death
  currently sinks the voicing metric even when a waves relay
  final voices fine. PROPOSED for the next run (not applied
  here): if the control dies before the window, M5 judges the
  block's relay finals' notice lines instead, labeled as a
  fallback, with the control mortality reported, not hidden.
- M5b's three-cell pattern (dark 1/1, light 1/0, grey 0/0) is one
  observation per cell — a pattern to watch, not a law. Do not
  cite it as a branch rule until a second observation lands in
  any cell.
- Telemetry baseline: still describes r37 long-deferral sits,
  not guard-ended windows — r48–r61 all reported it EXPLAINED
  and did not roll it. Re-seed proposal stands.
- Balanced panel (§15): no panel comparison applies — zero
  src/js changes, no lever moved on the default path (NOWALKIN
  default off, census + peak/release snapshots are read-only
  instrumentation). The comparison is r61→r65 via identical
  substrate, Arm A→Arm B on one variable.

## Evidence

- evidence/2026-10-29/journey-endgame-r65.md (this note)
- evidence/2026-10-29/journey-endgame-r65-prereg.md
- evidence/2026-10-29/perseed-endgame-r65/endgame-r65-{88911..88917}.json
- evidence/2026-10-29/perseed-endgame-r65/endgame-r65-{88911..88917}-transcript.txt
  (size note: null-announce seeds have no announce day to slice
  from, so their transcripts are whole-run slices — 88917's is
  ~1.2MB, stated in its header — not a dump error)
- journey2-endgame-r65-pilot.log (in goal hidden_files; NOT
  committed to the repo: sweep stdout is per-run bookkeeping)
- journey2-endgame-r65-sweep.log (in goal hidden_files; NOT
  committed)
- journey2-endgame-r65-analyzer.txt (in goal hidden_files; NOT
  committed: analyzer stdout is per-run bookkeeping)
- journey2-endgame-r65-det.log, journey2-endgame-r65-fid.log,
  journey2-endgame-r65-smoke.log, journey2-endgame-r65-checkquick.log
  (in goal hidden_files; NOT committed)
- scripts/probe-endgame-r65-20261029.js
- scripts/analyze-endgame-r65-20261029.js
- scripts/policies/capable.js (unchanged — NOWALKIN_W4 rule from
  r50, env-gated, default off; no src/js changes this run)

## Landing record

- Check-quick (pre-merge): 284 passed, 6 failed in 663s — the
  standing set only (see Gates + checks).
- Telemetry: LOUD on both metrics, EXPLAINED, baseline NOT
  rolled (see Telemetry deviation check).
- Safe-commit: prereg + probe + analyzer (040d68371), then note
  + 7 per-seed JSONs + 7 transcripts (4531198b1). Index clobber
  struck on BOTH safe-commits (committed files shown as staged
  deletions in the worktree index, files byte-identical to HEAD)
  and was repaired via cacheinfo both times; status verified
  clean + diff HEAD empty after each repair.
- Merge: ff-only failed on first attempt (master had moved to
  c3b5a187b under the run: 9 sibling commits, zero src/js —
  adjacenttile/eveningdetour instruments, pickdepart diag,
  scale r51 evidence). Branch rebased cleanly onto c3b5a187b
  (2 commits replayed, no conflicts; worktree clean). Targeted
  re-proof after rebase: analyzer verdict lines diff-identical
  to the saved analyzer log (PRIMARY NO-GO | ALL NO-GO, same
  four NO-GOs); probe + analyzer node --check clean. Full
  check-quick 284/6 stands: it ran on the substantively
  identical tree, and the rebase delta is instrument + evidence
  only with zero src/js, so no fresh 11-min full run was burned
  to re-prove an evidence-only delta.
- Merge (post-rebase) + release + rotation: NEXT — ff-only
  merge immediately after this note-fill commit, then release,
  then rotation-b 4→5. Do NOT push: the ship loop owns pushes.
  Target state: merged locally, pending ship — no version tag.
  (This note-fill commit itself is the last branch commit; the
  merge result is recorded in the run's closing record, not by
  editing this note after the merge — the note must not claim a
  merge that has not happened yet.)
