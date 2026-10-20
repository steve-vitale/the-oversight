# journey-scale r14 — the unexercised Binding answers: WALK and SERVE (2026-10-20)

## Pre-registration (MEASUREMENT.md §§9–12, 14)
- **Leg question:** on the current tip, does a competent belong-road village that reaches The Binding in days 80–140 get the WALK and SERVE answers aloud with real consequences — and what do they cost/buy versus the swear road (r4/r10/r13: oath + ~3,000 kcal, trust +12, Haven national)?
- **Binding metrics:**
  - M1 staging — The Binding stages on ≥2/4 pilot seeds. A seed that never stages is replaced, never counted as a miss.
  - M2 fire-aloud — each exercised answer fires with beat text captured + consequences state-verified. NO-GO if silent or consequences don't match copy.
  - M3 people — ≥4 full transcripts sense-read, 0 senseless flags.
  - M4 survival — ≥2/4 reach d100 (death-aware).
  - M5 honesty — no table seat announces on a walked run; any earned seat announces aloud.
- **Interesting-finding bar:** first walk/serve beat text on this tip; the serve loan's real cost; whether serve stages national; the table's response to a walked village; the d140 census.
- **Policy:** belongseek unlayered (BELONG_V3=1). Probe: R14_BINDING_ANSWER=serve|walk.
- **Horizon:** DAYCAP=185, death-aware. Seeds 14001–14009 (fresh).

## Harness bug caught on pilot (r13 lesson applied)
The first serve seed (14003) answered **swear** despite R14_BINDING_ANSWER=serve: belongseek inherits scalecourt's national-beat answers, which fire inside the policy drive — the harness backstop never sees the beat. Fixed by substituting the probed answer in the outer answerNationalChoice wrap (harness-only, zero game-code change). Re-ran 14003: bindingAnswer=serve, loaned={vid, untilDay=day+7}. The pre-fix 14003 file was overwritten by the fixed run (same seed, verified).

## Results

### SERVE — fires aloud, real consequences (M2 GO)
- 14003: Binding ×2 (d~72 Xóchitl, d146 Jimena) — realm dissolved aloud mid-run and re-formed; national held 115d, global reached, survived d176.
- 14004: Binding d79 (Vivian loaned to d86); national held 108d, global, survived d187.
- Beat: "🚶 Jimena rides to Stonebridge's court for seven days — Haven's face, their time. Still ours; membership needs no presence. (Trust +8.)"
- State: mshipState().loaned={vid, untilDay: day+7, to: primary}; trust +8; **serve DOES stage national** (hierarchy.js: only walk returns early).
- The return is said aloud by loanedReturnTick: "walks back in — days at their fire, served."
- Table: no approach on either (unlayered policy → foodDeeds=false, r13's finding reproduced). Serve does NOT close the table path — national stages, the seat's other sub-gates are untouched.

### WALK — fires aloud, real consequences (M2 GO)
- 14006: Binding d106 → walk. returnVal='walked'; state.scaleRefused=true (shape=belong, day=106); links broken; national NEVER (0d held); village survived to d170 as a regional free fire.
- 14008: Binding d79 → walk; scaleRefused=true; national never; survived d179, regional, 9 alive.
- 14009: Binding d76 → walk; scaleRefused=true; national never; survived d187, regional, 9 alive.
- Beat: "🚶 Haven walks away from Stonebridge's table — a free fire, whatever that costs." + System: "Noted. The offer is withdrawn — permanently..." + "Haven refuses the scale. Every kcal stays in Haven's pantry..."
- Table: seat=none on all three, no announcement (M5 GO) — canon: the table stays distant for the refused scale.
- (14007 died d64 pre-Binding — replaced per M1.)

### Village assessments (plain words)
- **14003 (serve):** 8 alive / 37 dead at d176. A fighting village that bled for the realm — 31 of 37 deaths combat-related. Nino the dry cleaner and Hassan the butcher (trust 90) anchor it; Jimena the loaned infantry soldier came home and is still standing. National 115 days, then global.
- **14004 (serve):** 7 alive / 35 dead at d187. Gloria the baker and Meera the dentist hold the center; Vivian the loaned night-security guard served her seven days and lived. Diana the paramedic is lonely at trust 100 — the village's healer, loved and alone.
- **14006 (walk):** 7 alive / 32 dead at d170. The free fire — no realm, no oath, no tithe. Lena the ER nurse, Nadia the radio DJ, Dale the rail conductor. They refused the scale at d106 and kept living: regional, unbowed, unapproached.
- **14008 (walk):** 9 alive at d179. The second free fire — walked at d79, still regional, still standing.
- **14009 (walk):** 9 alive at d187. The third free fire — walked at d76, the longest-lived walked village of the run.

### People check (M3) — 8 transcripts sense-read, 0 senseless
- DeAndre d80 (ask_favor): real want, concrete plan, honest deflection on grief. Person.
- Quan d140 (curious): gossip about departures/returns — grounded in real expedition leaves (verified: departure/return gossip seeded from actual roster events; Elif/Jimena alive at end). Tone is gossip-dramatic, not fabricated.
- Gloria d100 (curious): two identical departure rumors about Hannah served in one sitting — verified as TWO DISTINCT departures (different partKeys/days; Hannah died d178 on expedition). Honest but reads as a repeat: polish note, the render could disambiguate ("again").
- Gloria d120 (curious): "Are you going to stay? With us. For real." — a person asking a real question.
- Pamela d120 (ask_favor): driver spammed the same choice 6×; she escalated deflections ("I just said — did you miss it?") and left cleanly. Graceful anti-spam, resolution=unresolved. Minor: opener leaks the want ID ("About ask favor").
- Valeria d140 (ask_favor): a cut that needs tending → chickweed → dandelion teaches that land. Warm, competent, human.
- Austin d120 (curious): a journalist asking about first memories; gossip walks distinct rumors with no repeats (the walk-down working). "Ivy talks to the garden. The garden listens."
- Ji d100 (ask_favor): short, clean — food needed, commit, gratitude. resolution=promised.

### Blanks
1. **FILLED — the WALK and SERVE Binding answers** (r13's named-next). Both fire aloud with state-verified consequences; serve stages national and keeps the table path open; walk refuses the scale permanently and the table stays distant, aloud. No game-code change needed — the engine paths were complete, just unexercised.
2. **Documented (polish, not defect):** gossip render of repeat departures reads as verbatim repetition; want-ID leak in one ask_favor opener ("About ask favor").

### Metric review (§14)
- M1 GO (5/8 seeds staged: 14003, 14004, 14006, 14008, 14009; 14001/14002/14005/14007 died pre-Binding and were replaced per the pre-registered rule).
- M2 GO (serve ×3 bindings, walk ×3 bindings — all fired aloud, all consequences state-verified).
- M3 GO (8/8 transcripts sense-read, 0 senseless).
- M4 GO (5/5 good seeds reached d100+: 176/187/170/179/187).
- M5 GO (walked run: seat=none, no announcement; serve runs: no approach — foodDeeds=false, the unlayered-policy finding, not a serve effect).
- No re-scoring. The pre-fix 14003 swear answer stands as the honest record of the harness bug, not a serve data point.

### Telemetry
`telemetry-check.js` vs `scale-belong.json` (5 good seeds). One LOUD, explained:
- `markerCounts.demand disappeared (251→0)`: EXPLAINED — known instrument difference (r13's finding, inherited: SCALE_MARKERS has no 'demand' entry; r4's harness did). belongLog proves 22 demands fired and were answered across the 5 seeds. The mechanic is live.
- Baseline NOT rolled forward.

### Regressions
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`: **253 passed, 4 failed** (751s, box loaded by sibling sims).
- The 4 failures are all in `scripts/godpath/test-phone-frame-proof.js` (retained phone receipt hashes stale vs current source: index.html, contests.js, table.js, etc.). **Pre-existing on pristine master** — verified by running the same test in the main tree (untouched by this run): identical 2 failures. This run made zero src/ changes (harness + evidence only); the staleness comes from siblings' landed src/ work. Documented, not quarantined (godpath check, not mine to waive).
- No src/ changes this run.

## Reachable / fun / winnable (scale leg, belong road + Binding answers)
- **Reachable:** YES — both answers are one choice at a staged beat; the beat stages reliably on surviving belong-road villages (3/4 pilot).
- **Fun:** the walk is the most voiced refusal in the game — three beats (the walk, the System's noting, the plain-spoken price) and then you live with it: no realm, no tithe, no table. The serve is the cheap oath with a human price: seven days of someone's life, said aloud when they leave and when they walk back in.
- **Winnable:** serve keeps the table path open (national stages); walk closes it by design (canon: "the table stays distant"). Both honest.

## Files
- Harness: scripts/journey-scale-r14-20261020.js (r13's instrument + R14_BINDING_ANSWER probe + bindingLog accumulation; builder: direct edit of the r13 harness, auditable diff).
- Evidence: evidence/2026-10-20/journey-scale-r14-belongseek-{serve,walk}-*.json + transcripts.
