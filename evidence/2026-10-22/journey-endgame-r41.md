# Journey Endgame r41 — THE VOICING AND THE FINAL LIVE CHOICE (Lane B)

Run: lane-B endgame r41, 2026-10-22, 21:00 CDT slot. Rotation-b read 4 at
start (endgame), advanced 4->5 at close.

## Pre-registered header (MEASUREMENT.md §§9–12, 14 — written before any play)

**Leg question:** THE VOICING AND THE FINAL LIVE CHOICE. Two halves:

1. **Forced-drift control (r40's metric-review follow-up).** r40's M4
   (lean-legible) was self-defeating: `relayLeanNoticed` fires on band
   crossings, and a perfectly held grey run never crosses a band (lean 9
   for 44 days → 0 notices, correctly). r40 proposed: keep the
   ledger-line half, add a forced-drift control — one seed with the
   thermostat disabled must produce ≥1 notice. The control is
   `RELAYGREY_NOTHERMO=1` (new, policy-side, default-off, zero src/js):
   thermostat reroutes skipped, commune scenes answered with the
   most-extreme choice. If the voicing is real, drift must cross bands
   and the System must comment on it.
2. **The final live choice as lived play.** Every path ends with one
   final live choice (TABLE.md: "the choice is which risk you take, not
   which ending you get"). r26 touched it once (assimilated
   comfort/grief); r40 walked three grey finals to terminal but never
   judged the CHOICE: does the beat fire with a real choice (≥2 options),
   is the choice dispatched from the offered set, and is the consequence
   voiced afterward (planted → resolved)? Walked on the grey relay road
   (3 seeds) plus a path-diversity seed (pure capable, whatever path it
   earns — r39's substrate walked beloved/relay/feared/assimilated).

**What would count as interesting:** the drift control crossing bands
with zero notices (a voicing bug in real play); the control holding grey
despite no thermostat (drift pressure weaker than assumed — the
substrate itself is the thermostat); a final beat firing with a single
option (no real choice); a final whose outcome lines never name the
chosen label (unresolved); the path-diversity seed winning a non-relay
path whose final choice reads as a menu click rather than a live
decision.

**Bindings (a miss is NO-GO, never re-scored):**
- M1 GUARD: ≥4/5 seeds reach the table window (announceDay != null) and
  sit (satDay != null).
- M2 GREY EARNED (r40 M4a kept): on qualifying grey-plan seeds
  (non-control, relay held pre-sit, ≥5 verbs, ≥1 commune answered),
  at-sit band is 'grey' AND |lean| ≤ 30. GO = 100%.
- M3 FORCED-DRIFT CONTROL: on the NOTHERMO seed, bandCrossings ≥ 1 AND
  noticedCount ≥ 1. GO = both.
- M4 FINAL LIVE CHOICE: on every WON seed — the terminal beat fired
  ("the last choice is yours, and it's live"), ≥2 options offered, the
  dispatched final id was one of the offered options, and the
  '◈ <PATH> — "<label>"' resolution line names the chosen label.
  GO = 100% of won seeds.
- REG (inherited, binding): r35 audit naming on sat seeds with nonzero
  w4/w5 deeds; r37 satPenalty present + voiced-line match.

**Substrate:** CAPABLE bot + CAPABLE_GREEDY=1 (deferral regime),
CAPABLE_GREEDY_MAXTIER=6, CAPABLE_GREEDY_LASTDAY=170, RELAYGREY=1,
CAPABLE_RELAYROAD=0 (grey owns the relay; r40b fix), TELEMETRY_FULL=1.
180d, death-aware. Seeds 83011–83015: 83011/83012/83013 grey road,
83014 pure capable (path diversity — RELAYGREY unset for that seed),
83015 grey + RELAYGREY_NOTHERMO=1 (forced-drift control).

**Instrument:** scripts/probe-endgame-r41-20261022.js (extends r40 probe:
tablePrompt frame recorder + chooseTableOption dispatch recorder;
final-choice verdict fields: finalBeat, finalOptsCount, finalPickId,
finalLabel, finalResolved, finalOutcomeLines, bandCrossings), verdict
scripts/analyze-endgame-r41-20261022.js. Policy: scripts/policies/
relaygrey.js gains the NOTHERMO branch (env-gated, default-off).
Gates: DET (grey, on-twice byte-identical), FID (RELAYGREY unset:
wrapped == pure capable).

## RESULTS

Sweep completed 2026-10-22 ~21:25Z (6/6 seeds, 180d, death-aware).
Analyzer verdict: `scripts/analyze-endgame-r41-20261022.js`.

| seed | plan | announce | sat | seat | path/branch | won | at-sit lean | verbs | communes | final | notices | crossings |
|------|------|----------|-----|------|-------------|-----|-------------|-------|----------|-------|---------|-----------|
| 83011 | grey | d90 | d110 | lesser | relay/grey | yes | 9 | 9 | 7 | both-hands | 0 | 0 |
| 83012 | grey | d90 | d134 | lesser | relay/grey | yes | 9 | 9 | 7 | both-hands | 0 | 0 |
| 83013 | grey | d90 | d132 | lesser | relay/grey | yes | 2 | 6 | 4 | both-hands | 0 | 0 |
| 83014 | base | d98 | d143 | lesser | beloved/light | yes | — | — | — | quiet | 0 | 0 |
| 83015 | nothermo | d90 | d132 | lesser | relay/grey | yes | 5 | 1 | 1 | both-hands | 0 | 0 |
| 83016 | forcedrift | d90 | d132 | lesser | relay/dark | yes | -71 | 49 | 7 | merge | 1 | 1 |

- M1 GUARD: GO — 6/6 announced+sat.
- M2 GREY EARNED: GO — 3/3 qualifying grey seeds grey at sit, |lean| ≤ 30 (9, 9, 2).
- M3 FORCED-DRIFT CONTROL (pre-registered binding): NO-GO — 83015 (NOTHERMO)
  crossed 0 bands, 0 notices. See metric review: the control underspecified
  the drift — the meter's lean sources barely fire, so disabling the
  thermostat cannot produce drift. NOT re-scored.
- M4a LEDGER NAMES THE BAND: GO — 3/3 ("The middle road is open.").
- M4 FINAL LIVE CHOICE: GO — 6/6. Every won seed: the terminal beat fired,
  ≥2 options offered, the dispatched final was an offered option, and the
  '◈ <PATH> — "<label>"' resolution line names the chosen label.
- REG r35 (audit naming): GO 6/6. REG r37 (satPenalty present + voiced match): GO 6/6.
- PRIMARY: NO-GO (M3 binding). ALL: NO-GO.
- EXTENSION (not a re-score): the FORCEDRIFT seed 83016 — thermostat off +
  one forced efficient reroute/day (-2 lean/day) — crossed grey→dark on day
  80, the System voiced it (1 notice), and the run walked relay/dark to the
  merge final and won. The voicing WORKS when there is drift to voice;
  the NOTHERMO control's null result is a meter-inertia finding, not a
  voicing bug. This satisfies r40's metric-review intent (M4b) and is the
  proposed replacement control going forward.

## Village assessment (census in plain words)

Six villages, zero deaths, six wins — the endgame substrate is winnable
for a competent player (cumulative with r40: 9/10 sat seeds won).

**83011 — 6 alive, pantry 8,007 kcal, global.** Bearer: <redacted> Diaz,
held the whole run. Relay/grey → both-hands. Lean roster but complete.

**83012 — 8 alive, pantry 12,086 kcal, REGIONAL.** Bearer: <redacted> Stepanov.
The outlier: only regional scale, yet sat the lesser seat and won —
the lesser-seat bar working as designed (reachable by non-global play).

**83013 — 8 alive, pantry 5,388 kcal, global.** Bearer: <redacted> Korhonen.
Leanest pantry (5.4k) but nobody hungry; won on the road's momentum.

**83014 — 7 alive, pantry 134,033 kcal, global.** Bearer: <redacted> Lee.
The hoarder: 134k kcal — more than the other five villages combined.
Pure capable base walked BELOVED/light → "quiet" (Speak for the quiet
ones). Path diversity from the base's own door scoring, no grey layer.

**83015 — 6 alive, pantry 9,900 kcal, global.** Bearer: <redacted> Syzdykov.
The inert control: thermostat off, extreme commune answers — lean 5 at
sit, grey by neglect. Still won both-hands.

**83016 — 7 alive, pantry 11,704 kcal, global.** Bearer: <redacted> Sherpa.
The drifted control: lean -71, dark, walked the merge final and won —
and Tashi (an NPC hero) "reached into the light" in the epilogue, the
conversation continuing both ways.

Who leads: the bearer, always — no succession this run (all six bearers
held their runs). Who is miserable: nobody — these are late-run
victories with full pantries. What is missing: nothing structural at the
village level; the endgame substrate reads as complete and generous.
The open design questions are all at the meter level (see blanks).

## People check (sense-read)

Read the final beats on three seeds in full: 83011 (both-hands),
83014 (beloved "quiet"), 83016 (dark merge).

1. **The both-hands final (83011)** still reads as the relay anthem: the
   System "does something it has never done: it ACCEPTS an unclean
   answer." In-run voicing stayed on-register: the audit prices overtime
   honestly ("2 weeks kept waiting, 3 of Haven lost meanwhile. Every
   door's standing −17"); "1 ascension from one village — its terms
   improve accordingly. Nobody has ever seen that before." The NPC-hero
   machinery fired organically: "◈ OUTSHONE — Rosa Mendez did what you
   would not: acted, boldly, while there was still time. The village
   thrives. The god is someone else. The record notes, kindly and
   accurately, that you watched. It stings exactly as much as it
   should." Passive play gets honestly outshone — the endgame design
   (NPC heroes) working inside a sim run.
2. **The beloved "quiet" final (83014)** is a real final live choice:
   "Speak for the quiet ones." → "You spend the last of the love on
   people who never had any. The villages nobody filmed, the dead
   nobody named. The audience weeps in eleven dimensions. This is what
   the show was for, it turns out." The epilogue then names the title's
   triple meaning outright: "The oversight is the looking away." The
   stasis kids appear on screen, still napping (KIN.md — the good path
   shows the pods; the demand to open them is a separate priced choice).
   Sense-read caught one text bug: "the lights stay warm behind he" —
   subject pronoun in object position. FIXED (this run, proof 6/6).
3. **The dark merge final (83016)** is the most chilling of the three:
   "No champion, no voice — just *us*. The distinction stops meaning
   anything somewhere around the third hour, and you stop minding. The
   food conversions fade (you don't eat anymore; the thought is quaint)."
   TABLE.md law 7 pays off on screen: the dark relay literally becomes
   what forgot food. "The village tells stories about who you were. The
   stories are accurate. They're about someone else now." And the
   counterweight: Tashi Sherpa reached into the light — "the village
   endures, and the conversation does not end." Failure of the self,
   priced and voiced; the run continues. This is the Relay humanity cost
   made legible.

No fabricated shared history in the read passages; no filler loops; the
System's register holds (big brother + chilling benefactor — the dark
notice line: "YOU WOULD MAKE A MAGNIFICENT MACHINE. I MEAN THAT AS THE
HIGHEST COMPLIMENT AND SLIGHTLY AS A THREAT.").

## Blanks

1. FIXED (text): beloved win coda "behind he" → "behind him/her/them"
   (object pronoun by gender; subject-position uses untouched).
   Root cause: the PRONOUN HONESTY block (r5) introduced `pro` as a
   subject pronoun and the beloved coda used it after "behind".
   Proof: scripts/test-coda-pronoun-20261022.js — 6/6 green.
   Before-state verified on HEAD (line 1538: `behind ${pro}`).
   Also fixed proactively in the same pattern audit: only the beloved
   coda used the pronoun in object position; feared/indispensable/
   witness/defiant use it in subject position (correct).
2. DOCUMENTED (design finding for Steve): THE METER IS NEARLY INERT.
   The NOTHERMO control (thermostat off, extreme commune answers) still
   sat grey at lean 5 — because the lean MOVERS barely fire in this
   substrate: 0 reroutes (delayed never ≥2), 1 commune answered in 85+
   days of holding. The thermostat's corrections (also 0 on the held
   runs) aren't holding the middle; the middle holds itself. Two
   consequences: (a) the r40 "thermostat is a backstop, not the
   mechanism" observation is confirmed from the other side — the
   mechanism's resting state is grey, and grey is free; (b) the r40
   blank #4 stands sharper: 82014's grey-by-neglect walk (2 verbs,
   1 commune → both-hands final, won) is the NORMAL case, not an edge
   case — any claimed-but-unused relay sits at lean 0 = grey. Whether
   the grey final should ask for the work is still Steve's call.
3. DOCUMENTED (design observation): the forced-drift seed walked
   relay/DARK to terminal on the standard capable substrate — lean -71
   at sit, grounding 59 (never near the 30 floor), bond 5. The dark
   road is reachable by sustained cold play, not just by the
   sim-tablepathdriver's engineered walks. The merge final is voiced,
   priced, and winnable.
4. DOCUMENTED (instrument): the final-live-choice instrument (tablePrompt
   frame recorder + chooseTableOption dispatch recorder) is reusable —
   probe-endgame-r41 records finalBeat/finalOptsCount/finalPickId/
   finalLabel/finalResolved/finalOutcomeLines/bandCrossings for every
   seed. Next runs can judge any path's final as played.

## Reachable / Fun / Winnable

- REACHABLE: yes — 6/6 reached the table window and sat on the standard
  capable substrate; 83012 did it at regional scale (lesser-seat bar).
  The dark relay road is reachable by sustained cold play (83016).
- FUN: yes. Three distinct finals walked to terminal in one run —
  both-hands (grey anthem), "quiet" (beloved eulogy for the unfilmed),
  merge (dark, chilling, priced) — all voiced in-register, all with the
  live choice feeling like a choice, not a menu. The NPC-hero beats
  (ascension, OUTSHONE) fired organically in the endgame, not as
  scripted set pieces.
- WINNABLE: yes — 6/6 won at the lesser seat; cumulative endgame
  9/10 sat seeds won since r40. The table prices the run, never gates
  on godhood (TABLE.md law 1), and the sims keep confirming it.

## Metric review

1. **M3 was underspecified (metric misfit, not a voicing bug).** The
   pre-registered binding demanded the NOTHERMO seed cross ≥1 band and
   produce ≥1 notice — but the lean sources (reroute-efficient needs
   delayed ≥2; communes need pending scenes) barely fire in this
   substrate (0 reroutes, 1 commune on the control), so disabling the
   thermostat can't produce drift. The miss is honestly NO-GO — never
   re-scored. The extension control (FORCEDRIFT: one forced efficient
   reroute/day) crossed grey→dark on day 80 and the System voiced it
   ("NOTICED. YOUR REGISTER IS SHIFTING TOTAL — ...I MEAN THAT AS THE
   HIGHEST COMPLIMENT AND SLIGHTLY AS A THREAT."), satisfying r40's M4b
   intent. PROPOSAL for the next endgame run: replace the NOTHERMO
   control with the FORCEDRIFT control as the canonical voicing test
   (bandCrossings ≥ 1 AND noticedCount ≥ 1 on one forced-drift seed).
   Keep the inert-meter finding (blank #2) as the design question.
2. **M2's qualifier vs the inert meter.** M2's "genuinely used" qualifier
   (≥5 verbs, ≥1 commune) excluded nothing this run (all 3 grey seeds
   qualified), but blank #2 + r40's 82014 show the qualifier is doing
   real work: without it, claimed-but-unused relays count as "earned
   grey". If Steve rules grey-by-neglect legitimate, drop the qualifier;
   if he rules the door should ask for the work, the qualifier belongs
   in the game, not the metric. His call — parked, not changed.
3. **M1's 4/5 bar held at 6/6.** The death-aware horizon keeps early
   deaths cheap; no famine deaths this run. Keep.
4. **Telemetry deviation check:** LOUD on maxTier (baseline 16 → current
   32). Investigated: explained — the baseline is a sum over n=4 seeds
   (avg 4.0), current is a sum over n=6 seeds (avg 5.33); per-seed
   distribution (2,6,6,6,6,6 — five at the greedy cap 6) matches the r39
   deferral regime. Seed-count artifact, not a behavior change.

## Regressions / checks

- DET (grey, on-twice byte-identical): GREEN.
- FID (RELAYGREY unset: wrapped base vs pure capable): GREEN — the
  NOTHERMO/FORCEDRIFT branches are default-off and don't leak.
- SMOKE (83011, 120d): relay/grey → both-hands → won; final-choice
  instrument validated (beat fired, 2 options, pick dispatched, resolved).
- Proof test scripts/test-coda-pronoun-20261022.js: 6/6 green (drives the
  real Game.tableEpilogue; male/female/unknown gender).
- check.js --quick: 282 passed, 5 failed (974s). ALL 5 failures verified
  PRE-EXISTING by re-running the 5 scripts on the clean main tree
  (2751fa05, no changes): identical failures. They are godpath
  maintenance tests (measurement comparison/proof-update/workflow,
  occupation panels CLI, phone-frame browser receipts — the receipts are
  browser-bound and refresh on their own lane). My change adds table.js
  to an already-stale receipt list; the failure mode is unchanged from
  master. No regressions from this run.
  (Note: a sibling loop's check.js ran concurrently in its own worktree;
  no phantom-failure signature — failures are deterministic godpath
  maintenance gaps, reproduced on the clean tree.)
- No src/js changes besides the table.js pronoun fix (6 lines); policy
  scripts/policies/relaygrey.js gains two env-gated control branches
  (NOTHERMO, FORCEDRIFT), default-off, zero game effect.
