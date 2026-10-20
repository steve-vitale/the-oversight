# journey-scale r16 — the FEAST answer as primary (2026-10-20)

**Run id:** playtest-loop-2026-10-20-1418CDT (oversight-playtest-loop, LANE A, leg 3 scale).
**Base:** master f253d7a7d. Worktree: `journey-scale`.
**Rotation note:** journey-rotation-a.txt read "3" at run start. This run plays
leg 3 and writes back "0".

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before any code changed)

**Leg question:** on the current tip, when a competent national-road village
answers The Watchers with FEAST (5,000 kcal of theater, docs/SCALE.md §4),
what does the village really pay and what does it buy — versus champion
(7-day absence, r15) and decline (viewership −10 + defiance +1, r15)?
Engine (hierarchy.js `answerGlobalChoice`): `_removePantryKcal(5000)` — real
food leaves the pantry (whole-unit over-take honest, returns actuals); the
copy speaks the actual paid ("X kcal of theater"); `recordMoment` +
viewership +1; globalLive stages (same as the other answers); "the table
makes a note" is the moment log (`pg.moments`) — table.js does NOT read
moments.

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 staging — The Watchers beat stages on ≥2 pilot seeds (viewership ≥ 32
  + nationalLive; a seed that never stages is replaced, never a miss).
- M2 fire-aloud — the feast answer fires with beat text captured +
  consequences state-verified: pantryBefore−pantryAfter == paidSpoken,
  the moment logged, globalLive=true. NO-GO if silent or consequences don't
  match copy.
- M3 people — ≥4 full transcripts sense-read (Watchers beat + surround),
  0 senseless flags.
- M4 survival — ≥2/4 pilot seeds reach d120 (death-aware; dead/scattered stops).
- M5 honesty — the copy names the actual paid kcal (thin-pantry seeds must
  speak the real number, never "5,000"); the +1 viewership state-verified
  against the raw slot read (no `havenViewership()` call before the engine
  initializes it — r1 instrument-honesty).

**Interesting-finding bar:** the feast's real ledger — what ~5,000 kcal buys
beyond globalLive (which all three answers grant); whether the feast is ever
a trap on a thin pantry; the champion/decline/feast cost ranking.
**Policy:** belongseek + feast layer (FEASTSCALE_R13=1; r13's 7/8-lesser-seats
policy). The Binding is answered 'swear' (r13's control road to national).
**Horizon:** DAYCAP=185, death-aware. PILOT FIRST: 4 feast seeds 16001–16004
(fresh, disjoint from r9–r15); replacements 16005–16010 per M1's rule.

**Substrate checklist (§14b):**
1. Contact: the Watchers staged 3/4 on r15's pilot this morning, same
   policy/tip family — the mechanism is live. PASS.
2. Pool sizing: engine-path exercise with state verification, not a lever
   measure — the pilot + replacements suffice. PASS.
3. Verb existence: `answerGlobalChoice` + the r12/r15 watchers stamp are the
   established idiom. PASS.
4. Horizon fit: the beat stages d70–170 on this tip; DAYCAP=185 covers it. PASS.

**Kill verdict taxonomy:** an M2 miss is METRIC-BROKEN unless the autopsy
finds the answer can't reach the mechanism (then CONCEPT-DEAD). A silent
beat is NO-GO for the leg's "played, never a silent flip" canon.

## HARNESS

`scripts/journey-scale-r16-20261020.js` (r15 instrument + R16 feast-ledger
capture: pantryBefore/After around the answer, the spoken paid parsed from
the beat line, viewership delta vs the raw slot, the moment-log check —
all inside the existing try/catch stamp; zero game-code change).
`node --check` clean; the paid regex functionally verified against
"5,023 kcal of theater" / "5000 kcal of theater" before launch.

## RESULTS

### The feast ledger — 3 staged seeds

| seed | watchers | pantryBefore | paid (spoken) | pantryAfter | viewers | moment | end |
|------|----------|--------------|---------------|-------------|---------|--------|-----|
| 16003 | d170 | 3,758 | **3,758** ("3,758 kcal of theater") | 0 | 35→36 | ✓ d170 | survived d179 |
| 16008 | d89 | 17,976 | **5,003** ("5,003 kcal of theater") | 12,973 | +1 | ✓ | lost d173 |
| 16009 | d73 | 15,104 | **5,165** ("5,165 kcal of theater") | 9,939 | +1 | ✓ | lost d143 |

pantryDelta == paidSpoken **exactly** on all three (state-verified, not
copy-trusted). globalLive=true on all three.

### M1 staging — GO (3 staged)
16003 (d170), 16008 (d89), 16009 (d73). Replaced per the pre-registered
rule (never staged, never a miss): 16001 (d18, wave-1 + starvation
cascade), 16002 (d85, combat cascade — regional lesser seat first),
16004 (d55, wave-2), 16005 (d26, sickness + starvation), 16006 (d22,
wave-2 + sickness), 16007 (d116, wave-3/4 — regional lesser seat first),
16010 (d146, wave-4 window — lesser seat, never national).

### M2 fire-aloud — GO (3/3)
Every feast fired with the full beat text captured and every consequence
state-verified: the pantry lost exactly what the copy said, the moment
'Haven feasted the world feed.' is in `pg.moments`, viewership +1,
globalLive staged.

### M3 people — GO (5 transcripts sense-read, 0 senseless)
- **Prisca d80 (16003, seek_comfort):** the driver spammed "You alright?"
  7× — she stayed in voice throughout, varied every answer, then closed
  it herself ("I should get back to it"). Graceful anti-spam,
  resolution=engaged.
- **Prisca d100 (16003, seek_taken):** the same mason, 20 days later —
  now asking about her taken father Santiago. Canon-grounded (docs/KIN.md:
  the Taking), specific, dream detail ("rows of them, humming"), closes
  with a promise. A person with an arc.
- **Wei d120 (16003, ask_favor):** beekeeper, pantry-run favor → grief
  (Mateo) → dreams of Chengdu ("no step four"). Warm, specific, human.
- **Caleb d140 (16003, ask_favor):** firefighter, trust 25 — "We lost
  Diana and Wei this week. I keep setting out extra portions. Stupid."
  Verified against the death roster: diana_osei d137, chen_wei d139
  (combat). The dialogue is grounded in real roster events — the
  unique-person law working. Driver left early; resolution=unresolved,
  honest.
- **Rafael d80 (16002, ask_favor):** roofer, water crisis (2 liters, the
  creek run) — concrete want, deflection escalation on spam ("I just
  said — did you miss it?"), closes cleanly.

### M4 survival — NO-GO (1/4 pilot seeds ≥ d120)
Pilot-4: 16001 d18, 16002 d85, 16003 d179, 16004 d55. Scored as
pre-registered — a miss is a miss, never re-scored. (Replacement data:
16008 d173 and 16009 d143 both cleared d120 — the pilot-4 looks
seed-unlucky on the early game rather than systematically doomed; see
metric review.)

### M5 honesty — GO
- The thin-pantry case (16003: 3,758) spoke **"3,758 kcal"** — never
  "5,000". The rich pantries spoke 5,003 / 5,165 (whole-unit over-take,
  `Math.ceil(need/per)` — the break-it food r3 doctrine, callers report
  actuals).
- The +1 viewership verified against the raw slot before/after (r1
  instrument-honesty honored — no `havenViewership()` call pre-init).
- Post-feast starvation check (the trap question): 16003's pantry went
  3,758 → **0** at d170; the village's d176–178 deaths are all combat,
  zero starvation. The feast is not a starvation trap on the observed
  seeds — but there is **no affordability guard**: the feast always
  fires and takes everything down to the last crumb.

## FINDINGS

1. **The feast's real ledger.** ~5,000 kcal of real food buys: globalLive
   (which champion and decline also grant), viewership +1, and a moment in
   the log. The feast is the only Watchers answer with a resource cost and
   the smallest mechanical benefit — theater, priced honestly. Cost
   ranking: champion = 7 days of a real person's absence (or the
   no-speaker fallback, r15); decline = viewership −10 + defiance +1 (which
   *prices* the Defiant path — a currency, not just a cost); feast =
   ~5,000 kcal for the cameras.
2. **"Somewhere, the table makes a note" — theater with teeth.** The note
   is `pg.moments`; table.js never reads moments. BUT `sigW3a.js`
   (`sigGavelPickCrime`) accuses you with your *freshest moment* in the
   gavel's trial — "Day 170: Haven feasted the world feed." The feast can
   be read back at you, on the record, in a fight. Not flavor after all.
3. **No affordability guard (documented, not defect).** The feast fires on
   any pantry and empties it (16003: 3,758 → 0). The copy stays honest and
   the choice is the player's with a visible pantry — not a trap, but on a
   starving village it would be a self-inflicted wound. Steve's call whether
   the beat should refuse (or warn) under a floor.
4. **Copy wart (polish, not defect).** On 16003 the Watchers staged at d170,
   38 days *after* the lesser seat announced (d132) — the System's "But the
   table has your name now" reads as first contact. Literally true
   (announced ≠ seated; "not at the table yet" holds), but stale. Left
   untouched — the System's voice is Steve's to word.
5. **The early-death cluster.** 7/10 seeds died before the Watchers
   (d18–d146); r15 on the same policy this morning staged 3/4. Same
   instrument family, no early-game src/js change between the runs
   (intervening commits: deepening-r25 instruments, social-r34 copy,
   vgearbeats narration default-OFF, killbeat attribution, scholarcare
   instruments). Read as seed variance on a brutal on-ramp, not a
   substrate shift — reported plainly, not claimed.
6. **Ambient life at the beat.** 16009's staging caught Henry's line —
   "My kid asked if the watchers have favorites." — the same villager
   reaction r15 saw on decline seeds. The beat breathes regardless of
   answer.

## VILLAGE ASSESSMENTS — in plain words

- **16003 (feast):** 6 alive at d179, SURVIVED — Jianhua the teacher
  (trust 81), Caleb the firefighter, Tom the truck driver, Hassan the
  butcher, Scarlett the baker, Beatriz the bus driver. 53 dead, 35 of them
  combat — they bled through the entire wave-4 window and held. National
  88 days, lesser seat d132, feasted the Watchers at d170 with their last
  3,758 kcal and lived 9 more days. What they knew: 46
  counter-observations, 31 tricks learned. What was missing: people.
- **16008 (feast):** 2 alive at d173, lost — national 32 days, feasted
  rich at d89 (5,003 from 17,976 — affordable), lesser seat d131, died in
  wave-4 combat (40 combat deaths). A fighting village that bled out; the
  feast didn't kill them (hunger never appears in the causes).
- **16009 (feast):** lost d143 — national 34 days, feasted at d73 (5,165
  from 15,104), lesser seat, the wave-4 window finished them (nightcourt,
  monster kills d121–128).
- **The replaced:** 16001 (d18: wave-1 shock + starvation cascade —
  the classic early collapse), 16002 (d85: combat cascade, but a
  regional lesser seat first — the on-ramp works even for the doomed),
  16004 (d55: wave-2), 16005 (d26: sickness), 16006 (d22: wave-2 +
  sickness), 16007 (d116: wave-3/4, regional lesser seat), 16010 (d146:
  wave-4 window, lesser seat, never national).

## REACHABLE / FUN / WINNABLE (scale leg, the Watchers feast)

- **REACHABLE:** YES — the feast fires on deed-rich national villages; all
  three Watchers answers are one played choice at a staged beat.
- **FUN:** honest theater. The copy names the real price, the pantry
  really lightens, and the gavel may quote your feast back at you in a
  trial — the kind of systemic irony the game is built for.
- **WINNABLE:** the feast never closes the table path (3/3 staged seeds
  took lesser seats; globalLive stages like the other answers). It also
  never *buys* anything — a fair price for nothing but the cameras, which
  is exactly what the canon says it is.

## METRIC REVIEW (§14)

M4 NO-GO stands as scored on the pilot-4 — not re-scored against the
friendlier replacement data. If the bar is wrong, the revision belongs to
a future run: M4 could be defined on the staged set (villages that reach
the leg's content) rather than the pilot-4 (which mixes in the
landing/establishment on-ramp). No revision proposed now; the pilot-4
rule did its job — it surfaced the early-death cluster honestly.
No other metric was re-scored mid-run. The r15 "replace, never a miss"
rule was applied exactly as written.

## TELEMETRY

`telemetry-check.js` vs `scale-belong.json` (10 seeds, 9 metrics):
3 LOUD lines, all investigated same-run:
- `markerCounts.demand disappeared (251 → 0)`: EXPLAINED — instrument
  gap. The r14–r16 instrument family defines no demand marker (r13's
  script didn't either; the 251 comes from an older baseline corpus);
  the belong road generates no subordinate-link demands — regionalLog
  confirms 0 demand events on all 10 seeds, consistent.
- `fightsTotal swung +104% (112 → 228)`: EXPLAINED — corpus composition.
  Fight rate 0.237/day matches r15's 0.233/day (same tip, this morning)
  almost exactly; the baseline (0.12/day) and r14 (0.094/day) ran fewer
  wave-4-window seeds. Five of my ten seeds reached wave 4; the window
  is where the fights live. No src/js change between r15 and r16 touches
  fight generation.
- `fightsByWave.3 swung +72% (25 → 43)`: same explanation — wave-3/4
  reach, not a regression.
Baseline NOT rolled forward (deviations explained; rolling it forward on
a 10-seed corpus with 7 early deaths would bake in today's seed mix).

## BLANKS

1. **FILLED — the FEAST answer's real ledger** (r15's named comparison).
   Pantry delta == spoken paid on 3/3; viewership +1 verified; moment
   logged; globalLive. The gavel-moment connection (finding 2) is the
   genuinely new mechanical texture.
2. **Documented (no game-code change):** no affordability guard on the
   feast (finding 3); the post-table-announcement System line (finding 4).
   Both are Steve's call, not defects.

## FILES

- Harness: `scripts/journey-scale-r16-20261020.js` (r15 instrument +
  R16 feast-ledger capture; builder: transform script, auditable)
- Evidence: `evidence/2026-10-20/journey-scale-r16-belongfeast-watchfeast-160*.json`
  (10 seeds) + `-transcript-1600[23]-day{80,100,120,140}.txt` (5
  sense-read transcripts)
- No src/js changes. No proof test (no fix shipped).
