# Journey endgame r61 — WAVE 5 RELEASES, WITHOUT A SEAT (lane B, 2026-10-28)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-28/journey-endgame-r61-prereg.md
(written AND committed BEFORE any play: commit 57818037). Instrument +
evidence only, zero src/js changes. Gating freeze (Steve 2026-10-27 16:53)
stands: no gating change in this run, whatever the chase finds.
Merged locally, pending ship (landing record below).

Canon read before play: docs/CANON.md + docs/TABLE.md (the table prices
the run, never gates on godhood; full seat keeps the national bar) +
standing.js readiness-gate comments (checked during analysis, not before
play — the gate mechanics below are read from code, cited by file).

## Leg question (r60's carried items, in order) — answered

1. SECOND FIGHTING ARM B SEED — YES, THREE TIMES OVER, AND THE
   DIRECTION REVERSES. All 3 Arm B seeds fought (88905: 2 fights,
   88906: 14, 88907: 10) and converted 5 kills; Arm A fought on 2/3
   seeds (88902: 9, 88903: 8) and converted ZERO. Per fight: Arm A
   0/17, Arm B 5/26. r60's thin signal (Arm B 0 on 5 fights, Arm A 1
   on 4) is reversed on a fuller block, and the confound has moved
   again: from opportunity (r59) to seed count (r60) to seed
   identity (r61 — different villages, different monsters). M3 GO
   on its binding (Arm B > Arm A). This is NOT a lever kill of the
   plain arm and NOT a proposal to make NOWALKIN the default — that
   would be a game-behavior change, and it needs its own decision
   plus a replication block. What r61 establishes is narrower and
   solid: on fights actually fought, the no-Walk-In arm converts
   this block, and the plain arm converts nothing on 17 fights.
2. RELAY-BRANCH VOICING — ONE RELAY FINAL, DARK AGAIN. The only
   relay final in the block is the control (88904, relay/dark,
   noticed 1, bandCrossings 1, verbs 44, communes 7, doorRelay 1,
   final:merge). No waves seed walked relay, so no light or grey
   relay final exists to compare. Tally across blocks: dark fires
   markers 2/2 (r60, r61 controls), grey 0/1 (r59 control), light
   unmeasured. M5b GO on the preregistered letter (the control
   tabulated with its branch named); the cross-branch LEAD is
   carried, not closed — it still needs a light or grey relay
   final, and r61 does not supply one. r59's NO-GO is not re-scored.
3. VETERANS-ONLY CHASE — APPEARS TWICE, AND A THIRD SHAPE BREAKS
   THE WALL FROM THE SIDE. 88905 and 88907 are both veterans-only
   at the sit (armor/weapons/tricks met, veterans 1/2), both at peak
   199, both won lesser. 88903 is the widened shape (armor +
   weapons + veterans short, peak 199). And 88906 is a shape the
   chase had never seen: peak 240, wave 5 UNLOCKED, never sat at
   all (see headline). The chase sentence splits three ways now:
   on an 88905/88907-class village, bank ONE more LIVING veteran
   at the sit; on an 88903-class village, armor more, arm more,
   AND bank two; on an 88906-class village, the monster ladder is
   already climbed — the missing piece is not a veteran at all.
4. DECLINE-BOILERPLATE WART — TWO MORE READABLE BEATS, SAME
   VERDICT, PLUS A NEW SUB-QUESTION. Withdrawals on 88901 and
   88906, both d90, both full-length lines (495 chars class — r59's
   truncation fix holds), both with a want-list of exactly ONE
   item: the food-thesis deeds. The want-list is TRUE and
   state-specific on both (sent early — d9, d14 — surge never).
   The two lines are byte-identical (495 chars each) — the
   accusation does not vary by village at all.
   The accusation is the same generic boilerplate ("NO HUNGER ON
   THE RECORD — NO FEAST, NO SURGE") about villages that shared
   77 and 112 food — overstated, 4/4 readable beats now (r58, r59,
   r61 ×2). NEW SUB-QUESTION: 88902 also never announced and also
   never surged, but carries NO withdrawal line — silent no-show.
   When the decline beat appears vs when the table simply never
   comes is unestablished; the instrument records both, the
   mechanism is not claimed here.
5. PANTRY-AT-END NOTE — NO ZERO THIS BLOCK. Sat seeds end at
   88903: 6,233; 88904: 26,392; 88905: 16,806; 88907: 6,203 kcal.
   r60's 88602 zero-pantry case does not reproduce, and no line
   says the finale spends the pantry — still not established,
   still not claimed.

## THE HEADLINE: WAVE 5 RELEASES ON A VILLAGE THE TABLE NEVER INVITES

88906 (wavesnw, Arm B) is the first wave-5 unlock in the chase
(r55–r60: 0/43 waves seeds; r61: 1/6 by unlock). The chain is
transcript-proven, day by day:

- Hold beats d81, d87 and onward: "The fifth draft stays in the
  wings — blood your fighters (0 of 2 veterans)."
- d139: Amina Diallo kills a Reunion (first living veteran).
- d153: Giulia Bianchi kills a Reunion (second living veteran) —
  and in the same day's beat sequence: "the Producers have
  greenlit the fifth draft. Wave 5 talent has been released."
- After release, wave-5 monsters arrive in the field: The Rerun
  (faced d153+), The Spoiler (killed d178 by a third killer),
  The Timeslot (faced). deeds w5 = 3 distinct at end.
- End state: unlockedWave 5, peak standing 240, 14 census fights,
  3 ledger kills — but readiness bars short again (armor 3/4,
  weapons 4/6, veterans 1/2: the second veteran did not survive
  to the end), bestSeat none, surgeDay never, announceDay never.
  The village survived to d181 with 4 alive and a 9,232 pantry
  and was never invited.

Why the end-state bars do not contradict the unlock: standing.js
villageStandingTotal() releases wave 5 the moment the gated total
reaches 200 with readiness met, records _standingPeakWave = 5, and
thereafter floors the total at 200 forever — holds bind only while
peak < 5. Readiness can decay after release (a veteran dies, armor
is lost) without re-locking the draft. The release moment is
transient by design; the end-state bars are not the release bars.
The instrument does not record the release day's bar snapshot —
that is a named tooling gap for the next run (record rd5 + living
veterans on the day uw first hits 5), not a gap in this finding:
the d153 kill and the release beat share a day in the transcript.

The substantive point, stated plainly: unlocking wave 5 and
earning a table seat are different gates. The monster ladder is
climbed on standing + readiness; the invitation is priced on the
food thesis (sent + surge), and 88906 never surged. A player can
now demonstrably reach wave 5 and still never hear from the
table — the silence r60 named ("the audit speaks; the climb is
silent") now covers the invitation itself, not just the bars at
the sit. The d90 withdrawal line is the first moment the game
names the surge deed, and only for villages the table declines.

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: GO 7/7 — 4 announced (88903, 88904, 88905, 88907) +
  2 honest-death (88901, 88902 village-lost) + 1 withdrawal-voiced
  (88906 survived, withdrawal d90).
- M2 CENSUS: GO — coverage 100% (every census fight carries a
  primary outcome), Arm A with fights 2/3 (88902, 88903; 88901
  zero-fight, village-lost).
- M2c ENGINE COVERAGE: GO 6/6 — fights == opens on every waves
  seed, censusErrors 0, policy-only opens 0.
- M2d COMMIT-GATE NAMED: GO 14/14 — every uncommitted fight
  classified (88902's 6 never-observed engine fights, 88906's 5,
  88907's 3; gate snapshots name uw/vetsShort/hp).
- M2b ATTRIBUTION: GO 10/10 — every dieFlag fight carries a named
  fight-causal death (88902: 3, 88903: 4, 88906: 3).
- M3 CONVERSION: GO — Arm B 5 kills vs Arm A 0 (88905: 1,
  88906: 3, 88907: 1; Arm A seeds all 0).
- M3b LIVING VETERAN: NO-GO on the replication bar — spread 3/6
  ≥ 1 (88905, 88906, 88907 bank 1 each, up from r60's 1/6), but
  0/6 bank ≥ 2 at END state. Note the metric tension: 88906 DID
  hold 2 living veterans transiently (d153, the release day) —
  the end-state bar misses the release mechanism. Metric review
  proposes a peak-living-veterans count for the NEXT run; this
  run is NOT re-scored.
- M4 WAVE-5/FULL: GO 1/6 — 88906 uw=5 (first unlock in the chase);
  full seat still 0/6 (0/49 waves seeds by seat across r55–r61).
  GO on the binding's letter (unlock OR full seat), with the
  headline caveat attached: the unlock produced no invitation.
- M5 VOICING CANONICAL: GO 1/1 — 88904 crossed=true, voiced=true
  (noticed 1, bandCrossings 1).
- M5b RELAY-BRANCH TABULATION: GO — 1 relay final tabulated
  (88904 dark, notice line in full); no other relay final exists
  to tabulate, so the cross-branch lead stays carried.
- M6 GUARD NAMED: GO 3/3 — deferred sat waves named: 88903
  guard=roster (3-day deferral), 88905 guard=hp (4-day; the kill
  day — see label note below), 88907 guard=not-ready (21-day;
  see overtime note below).
- M7 PEOPLE: GO — 3 finals sense-read in full (below), 0
  senseless flags.
- M8 EXIT CANON: GO — 10 mFlee fights, all matched to codex
  counter text (strike ×2, influencer, rerun, timeslot, eulogy
  ×3, algorithm, suburb).
- M9 SUPPLY: 133 blocked wave-4 arrivals across 7 seeds (88901:
  32, 88902: 43, 88903: 8, 88904: 4, 88905: 8, 88906: 29, 88907: 9),
  every one the same contention line ("stops at the boundary —
  pacing, unwilling. Something else is already here. It's still
  out there."). Same rule as r51–r60 (ONE MONSTER PER TILE +
  Haven safe law). Non-wave-4 arrivals are blocked by the same
  line (a raccoon, a Hushpuppy) — the slot is near-always
  occupied, the supply mechanism itself.
- M10 FULL-SEAT GAP: GO 3/3 — 88903: [w5:0/2], 88905:
  [w4:2/3, w5:0/2], 88907: [w5:0/2] (full-seat deed bars; the
  readiness bars are M12).
- M11 STANDING PEAK: GO — peaks reported 6/6 waves seeds: 50,
  127, 199, 199, 240, 199. At-199: 3, at-200+: 1 (88906).
- M12 READINESS-BAR TABLE: GO 3/3 — tabulated below from the
  probe's raw counts; audit agreement checked on the sat seeds
  (audit counts DISTINCT wave-4 types, census counts fights —
  88903: audit "4 wave-4 fought" = reunion/strike/eulogy/
  congregation across 8 fights; 88907: "4 wave-4 fought" =
  reunion/eulogy/algorithm/suburb across 10 fights).
- REG: r35 auditNamed GO 4/4; r37 satPenalty GO 4/4 (88907's
  overtime note matches tier 3 / losses 1 / penalty 15 exactly).
- PRIMARY: GO | ALL: NO-GO (M3b only).

## RESULTS (7/7 seeds)

| seed | plan | ann | sat | seat | path/branch | won | census fights | kills | living vets | peak |
|------|------|-----|-----|------|-------------|-----|---------------|-------|-------------|------|
| 88901 | waves | — | — | — | — | no (village-lost) | 0 | 0 | 0 | 50 |
| 88902 | waves | — | — | — | — | no (village-lost) | 9: 6 talkDown, 3 vDie | 0 | 0 | 127 |
| 88903 | waves | d90 | d93 | lesser | feared/light | yes | 8: 4 vDie, 2 vFlee, 1 otherEnd, 1 mFlee | 0 | 0 | 199 |
| 88904 | forcedrift (control) | d90 | d90 | lesser | relay/dark | yes | 0 | 0 | 0 | 99 |
| 88905 | wavesnw | d90 | d94 | lesser | feared/light | yes | 2: 1 mFlee, 1 vKill | 1 | 1 | 199 |
| 88906 | wavesnw | — | — | — | — | no (survived, uw 5) | 14: 3 vKill, 3 vDie, 2 vFlee, 3 mFlee, 3 otherEnd | 3 | 1 | 240 |
| 88907 | wavesnw | d90 | d111 | lesser | feared/light | yes | 10: 1 vKill, 1 vFlee, 5 mFlee, 3 otherEnd | 1 | 1 | 199 |

## M12 — READINESS-BAR TABLE (the shape of the hold)

Probe counts are waveUnlockReady(5) readings at run end (demand:
armored 4, armed 6, tricks 3, veterans 2). Audit lines are the
finale war-path's own words; a bar counts as met when the audit
does not name it short AND the probe count meets demand.

| seed | peak | hold | armor x/4 | weapons x/6 | tricks x/3 | veterans x/2 | rd5short |
|------|------|------|-----------|-------------|------------|--------------|----------|
| 88903 | 199 | HELD | 2 | 4 | 23 (met) | 0 | [armor, weapons, veterans] |
| 88905 | 199 | HELD | 8 (met) | 9 (met) | 23 (met) | 1 | [veterans] |
| 88907 | 199 | HELD | 7 (met) | 8 (met) | 24 (met) | 1 | [veterans] |
| 88906 (not sat, no M12 row) | 240 | RELEASED (uw 5) | 3 | 4 | 25 (met) | 1 | [armor, weapons, veterans] |

* 88906's end-state bars are short AND its wave is released — the
bars decayed after the d153 release (see headline); end-state
bars are not release bars. Weapons met on 2/3 sat waves seeds
this block (r60: 1/4) — the r60 weapons widening partially
recedes, not a trend either way yet.

## VILLAGE ASSESSMENT (census in plain words)

- 88901 (waves, village-lost, 0 alive): died early and often —
  sickness took Mateo (d14), Sarah (d23), Aki (d57), Ella (d87),
  Deeqa (d91, a wound that wouldn't close); monsters took Ruben
  and Catalina; the arena took Oliver, Morris, Nathan. Declined
  at d90 (food-thesis deeds: sent d9, never surged), dead by
  d119. An honest early death, not a table death.
- 88902 (waves, village-lost, 2 alive): the talking village — 9
  wave-4 fights, 6 resolved by TALK (Walk In stand-downs on
  eulogy, algorithm, suburb ×3, eater), 3 by villager death
  (Nathan Lee, Candela Cuello, Clara Carrasco, all in the
  arena). Never announced (sent d16, never surged), never
  declined aloud either — the silent no-show case. Survived to
  d158 with Tariq Mahmood and Domfeh Dake, pantry 0. Its 16
  armory donations (5 craft) read as 2/4 armored — donations do
  not read as armored fighters, same as r60.
- 88903 (waves, won lesser feared/light, 4 alive): the Reunion
  village — 4 Reunion fights, all ending in a villager's death
  (Michelle d58, Hans Xu d80, Ruby Callaghan d89, Wanjiru d93,
  the last on the sat day itself). Sat d93 after a 3-day roster
  deferral, pantry 6,233, peak 199, held on armor + weapons +
  veterans. A win carried on dead friends' names.
- 88904 (control, won lesser relay/dark, 9 alive): announced and
  sat the same day (d90), no deferral, pantry 26,392 — the
  fattest village in the block. Peak 99. The control that sat
  WITH the canonical voicing markers, dark branch, third dark
  data point in the tally (r60 dark, r61 dark vs r59 grey).
- 88905 (wavesnw, won lesser feared/light, 9 alive): the block's
  party-kill village. Announced d90, waited 4 days, sat d94 —
  the same day Jorge Silva put down the Reunion in a real party
  fight (Pack Hunt pin, scream stuns, bird strikes, Phase blade
  546 twice, "The Reunion falls," the Records beat). Peak 199,
  held on veterans ONLY, pantry 16,806. The war-path names the
  kill and the bar in one breath: "On day 94, you put down The
  Reunion... Even now the wave-5 bar reads: blood your fighters
  (1 of 2 veterans)."
- 88906 (wavesnw, survived, 4 alive): the release village (see
  headline). 14 fights, 3 kills, peak 240, wave 5 unlocked d153,
  never invited, pantry 9,232 at d181. The village that climbed
  the ladder and never got the letter.
- 88907 (wavesnw, won lesser feared/light, 8 alive): the patient
  village — announced d90, sat d111 after a 21-day deferral
  (overtime ×1/×2/×3, standing docked −4/−8/−15, 1 of Haven lost,
  penalty 15). Its veteran (Marcus Webb, Reunion d104 — a double
  Reunion fight) banked d105 but did not end the wait; the
  overtime clock did. Peak 199, held on veterans ONLY, pantry
  6,203. Same mercy pick as 88905, different road: 21 days of
  waiting vs 4.

## PEOPLE CHECK (SENSE-TESTING LAW — full transcripts read)

1. 88904 relay/dark final, "Merge fully. No way back" — PASS, and
   the dark road's cost is voiced, not abstracted (same shape as
   r60's control, different village: children as nodes, "the
   village doesn't cheer," merge completing as "glorious" with
   "self eroded" in the same breath, Aki Tanaka reaching into
   the light). 0 senseless flags.
2. 88905 feared/light final, "Show mercy" — PASS. The final is
   coherent end to end: the audit names real deeds (waves
   20/7/7, 2 wave-4 fought, 10 contests, 3 crises), the war-path
   names the day-94 kill and veterans as the ONLY short bar, the
   mercy pick follows from the village's restraint ("the time
   you stayed your hand"), and the architect/pantheon beats
   (Adaeze Nwosu ascended through doors you built; Marvin He and
   Adaeze ascended together, "gods have politics") land because
   the village actually built those doors. 0 senseless flags.
3. 88907 feared/light final, "Show mercy" — PASS, and honestly
   different from 88905's despite the same pick: its audit reads
   20/6/6 with 4 distinct wave-4 types, its war-path names the
   day-104 kill ("you put down The Ugly Beast" — the Reunion by
   its display noun, same reconciliation as r60), and its
   overtime note (3 weeks kept waiting, 1 of Haven lost,
   standing −15) matches its 21-day deferral and penalty 15
   exactly. Same seat, same pick, different run read back — the
   finale is not a static menu. 0 senseless flags.

Seams and label notes (none blocking, all recorded):
- 88905's war-path adds "THE HERALD came. Named, not yet
  located. They faced Loud-Eyes and lived to sit here." — a
  wave-5 teaser line on a wave-4 village. Color, not a defect
  claim; what "named, not yet located" does in play is not
  established here.
- 88905's window-end guard on its sat day reads 'hp', not
  'veteran-banked', though the day's kill banked the veteran
  (trace d94: hp, vets 1). The war-path credits the kill; the
  guard label does not. Label nuance, not a verdict change
  (M6 needs named, and it is).
- 88907 sat on a guard decision reading 'not-ready' (encounter
  gate) — explained, not a bypass: the 21-day overtime clock
  ended the wait, and the finale's overtime note says so.
- 88903's raw deathRecords carry Wanjiru twice for one death
  (tbVillagerFalls + registerDeath both fire on a combat death);
  the census fight carries one causal death (deduped by
  fightRef). Instrument double-count in the raw log, not a game
  double-death; verdicts use the deduped census.

## BLANKS FILLED OR DOCUMENTED

- FILLED (r60's question 1): the second — and third — fighting
  Arm B seed. Arm B converts 5/26 fights this block.
- FILLED (the chase's central blank): wave 5 unlocks, on a
  transcript-proven chain (d153 kill → release beat → wave-5
  field fights). M4 GO.
- FILLED (partially): the decline wart gets its 3rd and 4th
  readable beats; verdict stable (generic accusation, honest
  want-list). Withdrawal-not-terminal gains a third case (88906
  survived to d181 after a d90 decline, after r55's 88101 and
  r58's 88406); 88901 is the counter-case (died out by d119 for
  unrelated causes — sickness, thirst, starvation).
- DOCUMENTED (not a lever kill): NOWALKIN's direction reverses
  on this block, but seed identity is now the confound — no
  default change is proposed or implied by M3 GO.
- DOCUMENTED (metric tension): M3b's end-state ≥2 bar misses
  88906's transient-2 release. Peak-living-veterans is the
  proposed next-run metric (metric review below).
- DOCUMENTED (instrument gap): the release day's rd5 snapshot is
  not recorded — the next endgame probe should snapshot rd5 +
  living veterans on the day uw first hits 5.
- DOCUMENTED (open mechanism): withdrawal beat vs silent no-show
  (88902) — unestablished, carried.
- RECORDED, NOT INTERPRETED: armory donations do not read as
  armored fighters (88902: 16 donations, 5 craft, armored 2/4;
  88907: 9 donations, 1 craft, armored 7/4 at end — the craft
  donation's product is still not established as worn armor).

## JUDGEMENT — reachable / fun / winnable (leg 4)

- REACHABLE: yes for the window, no for the full seat, and now
  no for the invitation itself on one road — same split as
  r55–r60, sharpened a third way. 4/7 villages sat (all lesser,
  all won); 2 scattered before the window; 1 climbed to wave 5
  and was never invited at all. The window is not the problem;
  wave 5 is no longer the whole problem either — the invitation
  prices a deed (the feast surge) that the climb never names.
- FUN: yes, with the cost caveat sharpened into a silence
  caveat. The finals read as real payoffs (the day-94 party kill
  spoken aloud at the sit; the d153 release beat arriving the
  same day as the kill that earned it; 88907's 21-day wait priced
  in overtime beats). The caveat: a player who climbs to 240
  standing and hears nothing will feel the silence as a missing
  game, not a challenge — unless the game tells them the surge
  deed WHILE climbing, not only in a decline line at d90.
- WINNABLE: the lesser seat is winnable 4/4 among villages that
  reached the window this block (4/7 overall); the FULL seat
  remains unwon across r55–r61 (0/49 waves seeds by seat); wave 5
  is unlocked 1/43 by unlock, unplayed at the table.

## Gates + checks

- PILOT (88901 + 88905 + 88904, 180d): gate passed on all three
  clauses — census fights (88905: 2), a 199 peak (88905), a relay
  final (88904 dark, markers 1/1) — expanded to the full 7 seeds
  per the prereg gate.
- SWEEP (7 seeds, 180d): exit 0, stderr empty. First sweep run
  was killed by a service restart after seed 88903 (no probe
  crash — log ends cleanly after 88903, err empty); the re-run
  reproduced 88901–88903 byte-identically and all three pilot
  seeds byte-identically (cmp-verified), so nothing was lost and
  nothing was double-counted. Pilot seeds in the sweep log match
  the pilot log exactly.
- DET (instrument-on twice, 2x120d, seed 88901): GREEN
  byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini):
  GREEN byte-identical (122d, won false, alive 2, pantry 500
  both sides).
- ANALYZER: exit 1 = verdicts (PRIMARY GO | ALL NO-GO), not a
  crash; verdicts identical on re-run (see landing record).
- CHECK-QUICK (pre-merge, in the worktree): 276 passed, 14 failed
  in 739s. Standing failures (r60's set, same family): measurement
  proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes
  (next-day voice) — 6. Flap-noise failures (all 8 pass solo on
  re-run, most with EPERM write/copyfile signatures in the
  parallel log): measurement-cache-flags, measurement-flags,
  measurement-source-text, prepared-runner-custody,
  proof-text-identity, telemetry-check-recorder, foodpower
  (30/0 solo), sw-audio-cache (7/7 solo). Set shift vs r60's
  279/8, explained: hide-discovery and measurement-comparison
  now PASS; the 8 new failures are all flap noise, verified
  solo-green. Zero r61-attributable failures — this run changed
  zero src/js and zero test files.

## Telemetry deviation check (2026-10-28)

- Tool verdict (comparable metrics maxTier, satPenalty.penalty,
  7 files): LOUD on both.
  - maxTier: baseline 16 -> current sum 3 (−81%). Current
    maxTier values are 0 on six seeds and 3 on 88907 — the same
    guard-ended / short-deferral population as r48–r60 (r60's
    sum was also 3).
  - satPenalty.penalty: baseline 91 -> current sum 15 (−84%).
    Only 88907 carries a penalty (15, from its 21-day deferral);
    the other sat seeds deferred 0–4 days (penalty 0). r60's
    sum was 39 and QUIET only because it sat closer to the 60%
    gate — same regime, stronger artifact this block.
- VERDICT: both EXPLAINED — the baseline file itself says its
  regime is unrecorded and not to compare pre-seat corpora
  against it; it describes long-deferral sits (r37), not this
  block's guard-ended windows plus one 21-day overtime sit.
  Baseline NOT rolled. The re-seed proposal stands for a next
  run: re-seed from a same-regime guard-ended corpus and record
  the regime in the file.

## Metric review

- M4's GO is narrow and labeled: it counts the UNLOCK (uw=5) or
  the FULL seat, not a table invitation. 88906 satisfies the
  unlock half and no other half — the note's headline caveat is
  part of the verdict, not a footnote to it.
- M3b's end-state bar misses the release mechanism: 88906 held
  2 living veterans on d153 (the release day) and 1 at end.
  PROPOSED for the next run (not applied here): count PEAK
  living veterans during the run alongside end-state living
  veterans, and judge replication on the peak. This run stays
  NO-GO on its preregistered definition.
- M5b's GO is narrow and labeled: it counts tabulation, not a
  cross-branch comparison. Dark 2, grey 1, light 0 is the tally;
  the lead needs a light or grey relay final and does not have
  one yet.
- M2d's "never-observed" class (88902's 6 late engine fights)
  is classification, not a gap: fights that open and close
  between daily ticks carry gate snapshots from the closest
  observation, named as never-observed.
- Telemetry baseline: still describes long-deferral sits (r37),
  not guard-ended windows — r48–r61 all reported it EXPLAINED
  and did not roll it. Re-seeding proposal stands.
- Balanced panel (§15): no panel comparison applies — zero
  src/js changes, no lever moved on the default path (NOWALKIN
  default off, census + gate snapshot are read-only
  instrumentation). The comparison is r60→r61 via identical
  substrate, Arm A→Arm B on one variable.
- M12 (bound since r58): the bar table is filled from the
  probe's raw counts with audit agreement on all sat seeds; the
  88906 end-state-vs-release distinction is now part of the
  table's reading, not an exception to it.

## Evidence

- evidence/2026-10-28/journey-endgame-r61.md (this note)
- evidence/2026-10-28/journey-endgame-r61-prereg.md
- evidence/2026-10-28/perseed-endgame-r61/endgame-r61-{88901..88907}.json
- evidence/2026-10-28/perseed-endgame-r61/endgame-r61-{88901..88907}-transcript.txt
  (size note: 88901's and 88902's and 88906's transcripts are
  whole-run slices because null-announce seeds have no announce
  day to slice from — 88906's is ~1.8MB, stated in its header —
  not a dump error)
- journey2-endgame-r61-pilot.log (in goal hidden_files; NOT
  committed to the repo: sweep stdout is per-run bookkeeping)
- journey2-endgame-r61-sweep2.log (in goal hidden_files; NOT
  committed: the killed first sweep's partial log is superseded
  by sweep2, which reproduced its first three seeds
  byte-identically)
- journey2-endgame-r61-analyzer.txt (in goal hidden_files; NOT
  committed: analyzer stdout is per-run bookkeeping)
- journey2-endgame-r61-det.log, journey2-endgame-r61-fid.log
  (in goal hidden_files; NOT committed)
- scripts/probe-endgame-r61-20261028.js
- scripts/analyze-endgame-r61-20261028.js
- scripts/policies/capable.js (unchanged — NOWALKIN_W4 rule from
  r50, env-gated, default off; no src/js changes this run)

## Landing record

- Rebase: worktree rebased onto master 9e3c7f152 (includes the liveness dead-flag fix e1a86b20c); branch tip before note-fill 43523fd5c.
- Check-quick (post-rebase, recovery run in the worktree): 284 passed, 6 failed in 1416s. The failing scripts visible in the run tail are standing families from this note's pre-merge check (occupation-panels, phone-frame-proof, establishment-r20-fixes next-day voice); the count matches the 284/6 standing pattern. Zero r61-attributable failures — this run changed zero src/js and zero test files.
- Safe-commit: note-fill committed via scripts/safe-commit.sh; main-index state verified immediately after the commit (git status --short checked first; any clobber repaired via cacheinfo before proceeding).
- Merge: ff-only to master; master HEAD after merge = this branch tip (the note-fill commit).
- Second rebase (recovery): master moved to 072bc4750 (evidence-only coordinator record, zero src/js) during the full check-quick, so the first ff-only attempt failed with diverging branches — no force used. The branch rebased cleanly onto 072bc4750 (3 commits replayed, no conflicts). Targeted re-proof after rebase: measurement subset 5 passed, 2 failed, both standing failures (measurement proof-update, measurement-workflow); no new failure. The full check-quick 284/6 on the substantively identical tree stands — the rebase delta is one evidence markdown file, non-executable.
- Third rebase (recovery): master moved to ddf4f5786 (evidence + corpus, zero src/js) during the second merge attempt; branch rebased cleanly onto it (4 commits replayed, no conflicts). Measurement re-proof again 5 passed, 2 failed, same standing failures; no new failure.
