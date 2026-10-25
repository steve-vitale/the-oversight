# Journey endgame r50 — FIGHT-OUTCOME CENSUS + FIGHT-DON'T-TALK (lane B, 2026-10-25)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-25/journey-endgame-r50-prereg.md (written
BEFORE any play). Instrument + one env-gated policy rule; no src/js changes.
Merged locally, pending ship.

## Leg question (r49's two named next steps, in order)

1. HOW do committed wave-4 fights end? r49 counted decisions (23/41/2
   turns), not outcomes.
2. Does refusing to talk wave-4 encounters down (decline Walk In on
   wave-4) convert encounters into kills — and at what cost?

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: >=5/7 reach the window or a voiced non-table path.
- M2 CENSUS COMPLETE: every committed wave-4 fight carries a primary
  outcome, AND >=2/3 Arm A waves seeds record >=1 committed fight.
- M3 CONVERSION: Arm B total wave-4+ kills > Arm A total.
- M3b LIVING VETERAN: >=1/6 waves seeds ends with >=1 living veteran.
- M4 WAVE-5/FULL: >=1/6 waves seeds unlocks wave 5 or the full seat.
- M5 VOICING CANONICAL: 88054 control crossings >= 1 AND noticed >= 1.
- M6 GUARD NAMED (deferred scope): every sat waves seed with deferDays
  >= 1 records a named window-end guard (not 'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- REG: r35 auditNamed on sat seeds with nonzero w4/w5; r37 satPenalty
  present + voiced-line match on sat seeds.

## RESULTS (7/7 seeds)

| seed | plan | ann | sat | seat | path/branch | won | census fights | kills | living vets | uw |
|------|------|-----|-----|------|-------------|-----|---------------|-------|-------------|----|
| 88051 | waves | d90 | d110 | lesser | feared/light | yes | 0 (wave 4 never unlocked) | 0 | 0 | 3 |
| 88052 | waves | — | — | — | — | no (village-lost, scattered) | 0 | 0 | 0 | 3 |
| 88053 | waves | d90 | d90 | lesser | feared/light | yes | 5: vFlee2 vDie3 | 0 | 0 | 4 |
| 88054 | forcedrift | d90 | d95 | lesser | relay/dark | yes | 0 (nonCommittedW4 2) | 0 | 0 | 4 |
| 88055 | wavesnw | d90 | d106 | lesser | beloved/light | yes | 8: mFlee6 vDie2 | 0 | 0 | 4 |
| 88056 | wavesnw | d90 | d109 | lesser | feared/light | yes | 0 (wave 4 unlocked, unmet) | 0 | 0 | 4 |
| 88057 | wavesnw | d90 | — | — | — | no (village-lost d110) | 6: mFlee1 vDie5 | 0 | 0 | 4 |

- **M1 GUARD: GO 7/7** — 6 announced; 88052 resolves via honest death
  (village-lost, scattered after 3 hungry days).
- **M2 CENSUS: NO-GO on the second clause, GO on coverage.** Every one
  of the 19 committed fights carries a primary outcome (coverage 100%,
  censusErrors 0) — but only 1/3 Arm A seeds recorded a fight (88053;
  88051 never unlocked wave 4, 88052 scattered before the window). The
  instrument is proven; the Arm A road's coverage is not. Not re-scored.
- **M3 CONVERSION: NO-GO (binding) 0 vs 0** — Arm B kills 0, Arm A kills
  0. Refusing to talk did not convert a single encounter into a kill.
- **M3b LIVING VETERAN: NO-GO 0/6** — the r46–r49 0/3 streak extends to
  0/6 waves seeds. No killer exists, living or dead, on any waves seed.
- **M4 WAVE-5/FULL: NO-GO 0/6 (expected on a zero-kill run)** — the
  component table shows w5 as the sole blocker on 88053/88055 (every
  other bar met, standing 199); on 88051/88056 the w4 bar itself is
  still short (0/3).
- **M5 VOICING CANONICAL: GO 1/1** — 88054: bandCrossings 1, noticed 1,
  relay/dark merge final resolved.
- **M6 GUARD NAMED: GO 3/3** — deferred sat waves end on hp (88051),
  losses (88055, 88056), all named. Same-day sit 88053 ends on roster
  (fix verification, not scored).
- **M7 PEOPLE: GO** — 3 beats sense-read in full (below), 0 senseless
  flags.
- **REG r35: GO 5/5. REG r37: GO 5/5** — satPenalty present on all sat
  seeds, voiced penalty matches the record on every one.
- **PRIMARY: NO-GO** (M2 clause, M3, M4). **ALL: NO-GO.**

## THE CENSUS — HOW COMMITTED WAVE-4 FIGHTS END (19 fights)

Distribution (waves seeds): **mFlee 7, vDie 10, vFlee 2, talkDown 0,
vKill 0, otherEnd 0.**

- **No fight killed anything, on either arm.** 100 committed fight
  turns (26 + 50 + 24 vetTurns) across 19 fights, zero wave-4+ kills.
  The conversion problem is NOT the talk-down: Arm A (Walk In allowed)
  also produced zero talkDown endings — no committed fight on 88053
  ended by talking, and the one Walk In line anywhere in the run's
  window transcripts sits in a wave ≤ 3 fight. r49's 88043 talk-downs
  were one village's story, not the leg's law.
- **Monster flight (7):** the signature wave-4s — suburb, influencer,
  congregation, strike — leave after 2–6 turns, almost always with an
  "It got away" line. They are fought, not talked, and still walk out.
  Short fights, no kill: the monsters' exit behavior, not the party's
  damage, ends these.
- **Party flight (2):** both on 88053 (reunion d59, suburb d80), both
  with a villager fled flag — the party breaks before the monster does.
- **Death on the fight day (10):** the largest bucket, and the one that
  needs its caveat stated plainly (see below). On 88057, five algorithm
  RERUN fights on day 110 coincide with the village's death day (8
  fallen that day: 6 arena, 2 combat) — the village collapsed across
  systems while fighting, not in a single duel. On 88053/88055, the
  vDie fight days pair with arena deaths in the fallen ledger (Desmond
  d65, Siobhan d76, Manuel d81, Susan d104, Meihua d106 — all 'the
  arena'), not with monster-caused deaths in those fights.
- **CAVEAT (vDie semantics, disclosed):** vDie means "a roster member
  died on the fight's day" — day-window, NOT fight-causal. The census
  cannot yet attribute a death to the fight itself (the engine's
  kill/hurt records are not yet wired into the instrument). The 10
  vDie fights are honestly reported as death-days, and the fallen
  ledger must be read alongside them. Fight-level death attribution
  is the named next instrument refinement (r51).

## WHY ZERO KILLS — THE TWO MECHANISMS, NOW COUNTED

1. **Signature wave-4s exit.** Suburb/influencer/congregation/strike
   fights end in 2–6 turns by monster departure ("It got away"). The
   party never gets the long fight that a kill would need — and
   vetcommit's DPS-race eject never fired (dpsBails 0 on all three
   census seeds), so these are not conviction retreats either.
2. **The long fights are the deadly ones — for the village.** The
   fights that last (reunion ×3, 11 turns; eater ×2, 10 turns; algorithm
   pairs, 2–6 turns each across five fights in one day) coincide with
   deaths, flights, and on 88057 the village's end. Bravery's price is
   visible, and it is not paid in kills.

## VILLAGE ASSESSMENT (plain words)

- **88051 — 7 alive, pantry 44,382, global.** A comfortable village
  that never met wave 4 (standing capped 99, wave-4 door unopened) and
  won feared anyway — "Pledge the terror," the shield not the sword.
  The lesser seat does not need wave 4.
- **88052 — scattered.** Thirteen dead by day 86 (arena, contest,
  monster, a wound that wouldn't close), then 3 hungry days with an
  empty pantry and the village walks in different directions. The
  scattering, again — honestly voiced, not a crash.
- **88053 — 4 alive, pantry 7,906, global.** The small
  village: sat at once on the roster guard (4 people), won feared on
  restraint, its 5 wave-4 fights all ending in flight or a death-day.
  Nenden Samosir's village holds.
- **88054 — 7 alive, global.** The dark control: relay/dark to the
  merge final, voiced crossing, pods opened like a barracks, the
  village quiet, Rosa Mendez reaching into the light. The control
  still fires clean.
- **88055 — 7 alive, global.** The beloved village: fought wave-4s
  (6 faced) without talking them down, watched them walk away, lost
  Tariq to an Eater raid and Susan and Meihua during the wait, and
  still won beloved — "Speak for the quiet ones," naming the unfilmed
  villages and the dead.
- **88056 — 5 alive, pantry 17,818, regional.** The armed village (14 donations, 7
  crafted) that never met a wave-4 at all: wave 4 unlocked, zero
  facings, sat on the losses guard and won feared ("mercy"). Armor
  without encounters is a road to nowhere for the veterans bar.
- **88057 — 0 alive, village-lost.** The wiped village: waited 15 days
  at the table, fought algorithm RERUNs on day 110 while the arena
  took the rest, and died with the table unseated. Deferral's price,
  paid in full.
- Who leads: the bearer, always — no succession this run. Who is
  miserable: the villages that scattered or died (88052, 88057) — the
  census can see them clearly; the winning villages are fed and warm.
  What is missing: a single wave-4 kill on any road tried so far
  (r46–r50); a fight-causal death attribution; a reason for wave-4
  monsters to stay and die instead of leaving.

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The beloved final (88055, full window).** The audit prices the
   wait honestly ("2 weeks kept waiting, 3 of Haven lost meanwhile.
   Every door's standing −17"), names the 6 wave-4 fought, and the
   veteran bar (0 of 2). The final choice is real ("Speak for the
   quiet ones") and its resolution names the choice. Human beats
   throughout: looting Tariq's body ("Your hands know what they
   did. (+18 trauma)"), Carlos's unprompted gift ("Here. I made an
   extra."), Fatima freezing at fresh tracks ("We go back now.
   Quietly."). PASS.
2. **The feared final (88051, full window).** "Pledge the terror" —
   restraint as the frightening thing, the shield not the sword, the
   architect beat (Devon Okafor ascended through doors the village
   built), and the Oversight coda in its feared key ("You never
   asked. Not once."). The audit names the veteran bars (0 of 1, 0
   of 2) even though wave 4 never faced. PASS.
3. **The dark merge (88054, full window).** The pods offer ("children
   adapt SO fast... You were already thinking it."), the village's
   silence ("The village has never been this quiet."), Refilwe's
   grandfather in the row, "The System is delighted. That's the worst
   part." The merge completes ("Power immense. Self eroded.") and
   Rosa Mendez reaches into the light — the conversation does not
   end. PASS.
- 0 senseless flags. No fabricated shared history in the read passages.
- Warts (driver artifacts, not game bugs): the "While you were gone"
  away-report summaries compress multi-system days into one block;
  the fallen ledger's 'the arena' cause on fight days is coarse next
  to the census (see vDie caveat above).

## BLANKS

- FILLED (instrument): the fight-outcome census — 19/19 committed
  fights carry a primary outcome + flags, censusErrors 0,
  nonCommittedW4 0 on all waves seeds (every wave-4 fight was
  committed; vetcommit engaged fully). The control's 2 non-committed
  fights (no vetcommit on that plan) are tallied separately, not
  hidden.
- FILLED (policy, new): CAPABLE_NOWALKIN_W4 — declines Walk In only on
  wave-4+ fights, env-gated, default off, proof 11/11. It is proven
  sound and exercised (88055/88057 fought without talking) — and it
  did not convert: 0 kills on Arm B, same as Arm A.
- FILLED (probe bug, found live): the seed-order env bug — a
  forcedrift seed deleted CAPABLE_GREEDY/ARMORYDRIVE/CAPABLE_VETGUARD
  from process.env, so a later waves seed failed its own env check
  (r49 never hit it: its control ran last). Fixed by snapshotting the
  invoked env (ORIG_ENV) and restoring it per waves seed; the loud
  check still fires if the invocation itself lacked the vars.
  Regression proof: the fixed probe ran forcedrift-then-wavesnw
  (88054 → 88056/88057) clean.
- DOCUMENTED (instrument gap, r51's work): fight-causal death
  attribution — vDie is day-window today. Wire the engine's death
  records (hurtVillager/kill attribution) into the census so a vDie
  fight can say WHO died IN it, not just on its day.
- DOCUMENTED (road question, r51's candidate): why signature wave-4s
  leave after 2–6 turns — is the exit behavior (flee/retreat thresholds,
  "It got away" conditions) the real conversion blocker? And why
  88056's armed village met zero wave-4s despite an open door
  (encounter supply, not just readiness)?
- DOCUMENTED (Steve-call territory, carried): whether the full seat is
  MEANT to require banking living veterans through this mortality.
  r50 adds: on this seed block, the bar's count (2) is downstream of
  a conversion problem (monsters leave; long fights kill villagers),
  not just a defense problem — and two villages never even reached
  the question (one scattered, one unmet).

## Metric review (§14)

1. **M1's restatement held** — 7/7 with the honest-death clause used
   once (88052). Keep.
2. **M2's second clause is the honest failure** — coverage 100% but
   Arm A fights 1/3. Do not re-score coverage as road coverage: the
   instrument and the road are different claims, and this run separates
   them. Next run's M2 should keep both clauses.
3. **M3's 0-vs-0 is a real answer, not a null** — the variant changed
   fight endings (Arm B: mFlee-led; Arm A: vFlee/vDie-led) without
   changing kills. The single variable moved the distribution, not
   the outcome. That distinction is the finding.
4. **M3b/M4 stay binding and unmet** — 0/6 on both, fifth straight run
   at zero living veterans (r46–r50). The streak itself is now data.
5. **M5's substrate rule held** — control fired on capable,
   sit-promptly, greedy OFF, armory OFF, vetguard OFF (1/1). Keep the
   control clean.
6. **M6's deferred scope held (3/3)** — plus same-day roster fix
   verification (88053). Keep.
7. **Telemetry deviation check:** tool reports quiet (see below).
   Baseline NOT rolled — it still describes long-deferral sits, and
   the per-seed values here (max tier 2, penalties ≤ 17) are the same
   guard-ended population r48/r49 reported as EXPLAINED.
8. **Balanced panel (§15):** no panel comparison applies — zero src/js
   changes, no lever moved on the default path (NOWALKIN default off,
   census is read-only instrumentation). The comparison is r49→r50
   via identical substrate plus the census, and Arm A→Arm B on one
   variable. The FID proof (wrapped == pure capable+deedhunt, mini
   byte-identical) is the default-off evidence.

## Regressions / checks

- PILOT (88051 census arm + 88055 nowalkin arm, 180d sweep mode):
  pipeline end-to-end; 88051 exposed the never-unlocked class,
  88055 proved the census (8 fights, differentiated outcomes).
  Pilot gate PASSED on 88055's evidence, not on 88051's null.
- DET (instrument-on twice, 2x120d, seed 88051): GREEN byte-identical.
- FID (env unset: wrapped == pure capable+deedhunt, mini
  gameDays/won/alive/pantry): GREEN byte-identical (90d, won true,
  alive 10, pantry 82739 both sides).
- NOWALKIN proof (scripts/test-nowalkin-20261025.js): 11/11 pass —
  gate off/on × wave 4/2 × outmatched, no-mdef, no-leak.
- Existing suites: check.js --quick — DONE 279 passed, 8 failed in
  1666s (recovery re-run 2026-10-25, after the 03:00 run's timeout
  killed the first attempt 4m in and a runtime restart killed the
  second attempt 4m in). The 8 failures are exactly the standing
  set: hide-discovery (r44 hide-beat, Lane A fix owed),
  measurement-comparison, measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, parity-20261014. No new regressions; the run
  changed no src/js. Log: evidence/2026-10-25/journey-endgame-r50-check-quick.log.

## Telemetry deviation check (2026-10-25)

- Tool verdict: quiet (7 files, 2 metrics, no large deviations) —
  under the tool's SUM rule (maxTier sum 8 vs baseline 16: −50%;
  satPenalty sum 48 vs 91: −47%; both under the 60% LOUD bar).
- Per-seed reading (the r48/r49 comparison): maxTier 2 max, penalties
  0–17 — the same guard-ended population as r48/r49, NOT long-deferral
  sits. VERDICT: EXPLAINED, same as r48/r49; baseline NOT rolled.
  (Note for the tool's owner: the sum rule is n-sensitive — 4 files
  LOUD, 7 files quiet, same population. The per-seed reading, not the
  tool's quiet, is what the run note records.)

## Evidence

- evidence/2026-10-25/journey-endgame-r50.md (this note)
- evidence/2026-10-25/journey-endgame-r50-prereg.md
- evidence/2026-10-25/perseed-endgame-r50/endgame-r50-{88051..88057}.json
- evidence/2026-10-25/perseed-endgame-r50/endgame-r50-{88051..88057}-transcript.txt
- scripts/probe-endgame-r50-20261025.js
- scripts/analyze-endgame-r50-20261025.js
- scripts/policies/capable.js (NOWALKIN_W4 rule, env-gated, default off)
- scripts/test-nowalkin-20261025.js (new, 11/11)
