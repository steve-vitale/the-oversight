# Journey succession r49 — MIXED REGIME + C1v3 TRANSITION RULE + MG2v2 MEAL-LINE + ARMOR HOLDER IDENTITY + OVER-CAUSE (lane B, pre-registration 2026-10-26, written before any run)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r48's metric-review next steps verbatim. Instrument only, zero
src/js changes. Base: master at run start (recorded in the run note).

## The next steps (from r48's run note + metric review)

1. MIXED REGIME (carried). 2 day-5 seeds + 3 mature seeds (r45's mix).
   Seeds 26041–26045 (fresh band): 26041–26042 EARLY_KILL_DAY=5 (scripted
   kill staged before the arena band opens); 26043–26045 EARLY_KILL_DAY=40
   (organic arena mantles honored per the standing rule; mature seeds give
   V1 real non-vacuous coverage).
2. C1v3 TRANSITION RULE (r48's documented instrument bug). r48 proved the
   convo-window capture works but C1v2's same-day letter misses: a convo
   move on day N manifests as the daily transition on day N+1 (the daily
   transition spans the previous day's convo window plus the current day's
   runDays call — 26034: convo moves d19 29→27 and d26 24→22 vs daily
   transitions d20 and d27, matching exactly). C1v3: a daily transition
   (prevEntry → entry) is covered by a callMove on the ENTRY's day OR a
   convoWindowMove on the PREVIOUS entry's day. C1v2 same-day is still
   reported for continuity, not judged.
3. MG2v2 MEAL-LINE REGEX (r48's documented instrument false positive).
   r48's one MG2 "violation" was the safetynet hunger-advice beat ("Half
   rations for three days..."), not a meal gate — Leah's actual day-30 meal
   was full. MG2v2: halfVoice counts ONLY a daySay line matching
   /^Village meal: .*\(Half ration/ (the real meal line, game.js: the meal
   say is `Village meal: +N kcal ... (Half ration — they don't trust you
   yet.)`). Old MG2 (any /Half ration/ line) still reported for continuity,
   not judged.
4. A1v2 ARMOR HOLDER IDENTITY + PACK-MERGE RULE (r48's documented gap).
   Counts alone cannot say whose piece vanished. armorMap now records,
   per location, the HOLDER: living/dead villagers' worn+pack keyed by
   villager first name, corpses keyed by corpse villagerId, plus a
   deadBearerAccess proof at post-handoff (does Game.vpOf(oldId) return
   the just-died bearer's record, dead flag, worn/pack counts?). A1v2:
   every bark_armor piece present pre-death carries a holder+location at
   pre-death and post-handoff, or a named loss transition (holder, from,
   window). The successor-pack-merge rule is read off the holder maps:
   does the successor's pack at post-handoff contain the dead bearer's
   pieces (merge), or do they sit in corpses / nowhere (loss)?
5. OVER-CAUSE CAPTURE (r48's documented gap). At finish(), for every seed
   that ends over=true, record rec.overCause = {over, villageLost, won,
   alive, pantryEnd, lastSay (last 5 say lines)}. No cause is guessed
   from pantry alone; the end narration is quoted.
6. WRITER-SITE TRAPPING SPIKE (r48's "if the trust-move trap is to move";
   exploratory, NOT binding). E1b is retired as a discriminator (r48:
   diffuse 5/5 named, singles often unnamed). The spike cross-tabs each
   trust-move callMove by deedLedger presence on the same day (0 deed
   entries vs >=1, with deed names): if moves with no deed call that day
   still move the office, the writer sits outside the five trapped deed
   APIs (teachPlant, giveFood, treatVillager, comfort, donateToPantry)
   and the next instrument must trap wider. No new wrappers this run —
   the join is by day in the analyzer.

## Canon note

No dedicated succession/mantle canon doc exists in docs/ (CANON.md's table
does not cover the lineage/mantle machinery). This run invents no canon;
it measures the machinery r38–r48 exercised, under Steve's 2026-10-23
meal-gate ruling (established-villager successors eat full at any trust).

## Leg question

On the same mixed band, does the C1v3 transition rule close C1 to 100%,
does MG2v2 stay clean where MG2 false-alarmed, can holder maps name the
loser of every bark piece at a mantle pass, and what ends the villages
that end over?

## What counts as an interesting finding

- C1v3: 100% of daily transitions covered under the transition rule. A
  transition covered by neither callMove (entry day) nor convoWindowMove
  (previous day) is a REAL attribution gap, reported with its day/delta.
- MG2v2: 0 violations on 5/5 seeds. An MG2v2 violation (real meal line,
  established successor) is a REAL BUG (meal-gate regression). An old-MG2
  flag with MG2v2 clean reproduces r48's false-positive class and
  retires the old regex.
- A1v2: every pre-death bark piece has a holder at pre-death and either a
  holder at post-handoff or a named loss (holder, from-location, window).
  A piece with a holder pre-death and no holder post-handoff and no
  receiving location is UNACCOUNTED with the holder named — the thread
  narrowed to a person, not just a window.
- OVER-CAUSE: every over=true seed carries overCause with villageLost
  and quoted end narration. A seed over=true with no narration is itself
  reported (silent end screen).
- WRITER-SITE SPIKE: the cross-tab is reported whatever it shows. A
  majority of trust moves with 0 same-day deed entries means the writer
  is outside the trapped APIs (next instrument: wider trapping).
- V1 NON-VACUOUS: at least one mature seed has eligibleAtDeath > 0 and
  resolves PASS-fired. A FAIL-alive-silent on any seed is a REAL BUG.
- SCRIPT (young staging): 2/2 day-5 seeds stage the scripted kill.

## Binding metrics (§14)

- SCRIPT (young staging): 2/2 day-5 seeds with death.scripted === true.
  Mature seeds: scripted-or-organic honored, reported per seed.
- V1 (vouch snapshot, carried): on every seed with eligibleAtDeath > 0,
  verdict PASS-fired; no FAIL-alive-silent anywhere.
- C1v3 (transition rule): 100% of post-death officeDaily transitions
  covered by a callMove on the entry day OR a convoWindowMove on the
  previous entry's day. C1v2 same-day reported for continuity only.
- S1 (bearer-own delta, carried): 100% of same-bearer trust moves carry
  a numeric bearerDeltaExact; 100% of chain handoffs carry null; every
  solo-office call has |delta| <= 2 (a >= 3 solo-office delta is an
  instrument contradiction — fail loudly, not a game finding).
- MG2v2 (meal-line only): 0 violations on 5/5 seeds (established
  successor, real meal line). Old MG2 reported for continuity only.
- A1v2 (holder accounting): 100% of bark_armor pieces present pre-death
  have a holder+location at pre-death and either a holder+location at
  post-handoff or a named loss transition (holder, from, window).
  Organic seeds have no pre-death map (death already happened at
  detection) — their A1v2 coverage starts at post-handoff and is
  reported as such, not claimed as pre/post coverage.
- M3v2b (social echo, carried): on >= 4/5 seeds, >= 2 v2b mentions of
  the dead bearer within 7 days of death (funeral-arc lines excluded,
  loot lines excluded by the /^You take /i rule). v2 reported alongside.
- M1 (funeral arc): >= 4/5 deaths produce (a) the death beat naming the
  bearer, (b) recoverBearer within 2 days, (c) the burial act completable.
- M4 (machinery): 5/5 mantles clean (linOk + moOk).
- OVER-CAUSE: every over=true seed carries rec.overCause (over,
  villageLost, won, alive, pantryEnd, lastSay). Missing overCause on an
  over=true seed is an instrument failure, reported as such.
- PEOPLE CHECK (M5): 5 transcripts sense-read in full; 0 real identity
  failures. Driver artifacts (double-invite tell, etc.) reported as
  artifacts, not game bugs, unless a transcript shows otherwise.
