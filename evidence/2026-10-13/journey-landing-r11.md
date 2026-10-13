# Journey LANDING r11 — System arrival + follower-volunteer (2026-10-13)

## Pre-registration (docs/MEASUREMENT.md §§9–12)
- **Question:** (a) Does the day-7 System arrival read as an EVENT — first System
  lines, tutorial, unlocks — and are the lines sensible/unhinged-but-legible?
  (b) Does the pre-System follower-volunteer beat (party.js `followerCheck`,
  trust ≥ 50) actually fire in competent play, or is it still dead in practice?
- **Interesting bar / GO gate:** ≥1 System-arrival sequence captured and
  sense-read in full; ≥1 follower-volunteer fire OR a documented mechanism for
  why none fire. **Both bars required.**
- **Seeds:** 21, 22, 23, 24 (fresh — not r10's 515/616/717/818/919).
  **Horizon:** 14 days, death-aware stop (no village died; all hit day 14).
  **Policy:** competent, UNCHANGED (r10's FAVOR_ACCEPT/EAT_FRAC knobs OFF).
- **Canon read:** docs/CANON.md, docs/PARTY.md, docs/CONVERSATIONS.md before judging.

## What ran
- Harness: `scripts/journey-landing-r11-20261013.js` (adapted from r10's). Adds: narration-stream day-boundary marks (days 5–9),
  full `systemArrivalBeats()` script dump + first-ability offers at the
  `systemArrived` flip, `Game.followerCheck` wrapper (calls / eligible
  candidates / fire diffs with day+trust+goal), `Game.chooseAbility` wrapper
  logging real acquisitions (see measurement fix below), per-day followers
  list + full trust map + daily trust max in snapshots.
- 4 seeds × 14 days, all completed. Transcripts: 11/9/11/11 sittings
  (seed 21/22/23/24). Logs: `/tmp/journey-landing-r11-run.log`;
  censuses `/tmp/journey-landing-r11-census-{21,22,23,24}.json`;
  system captures `/tmp/journey-landing-r11-system-{21,22,23,24}.txt`.

## (a) System arrival — verdict: READS AS AN EVENT, lines land
- Fired in all 4 seeds at the `endDay` of game-day 7 (detected at the day-8
  boundary; see timing note below). The log-stream recap reads as one event:
  `🌟 THE SKY SPLITS OPEN.` → the voice → the gift → the fusion-pellet
  callback → journal shimmer → dial glitch → calibration-fauna escalation →
  the village-gathers beat with a REAL villager ("Mariana grabs your arm.
  'Tell me you hear that too.'") → party-system announcement. Post-arrival
  System-flavored lines keep firing ("SYSTEM: Naming things. Very human. The
  audience approves." / "SYSTEM: Oh! It has a NAME. You all love names.").
- The full 7-beat staged script (`systemArrivalBeats()`, what the overlay
  stages tap-to-continue) was dumped and read in full. Tone: unhinged
  benefactor, joyous, deeply out of touch — exactly the register. Standouts:
  - "We watched EVERYTHING! Every berry picked! Every fire lit! That was your
    SIGNATURE! You signed up by DOING THINGS! Consent via competence! Our
    lawyers LOVE it!"
  - "FUN FACT! Half of humanity is GONE! ... Your relatives were probably in
    it! Statistics! Don't think about it! They're somewhere SAFE! Somewhere
    BORING! Like THEM!" (the Taking, handled with the right chill)
  - "Why do the small humans keep putting organic matter in their FACE-HOLES?
    ... Hmm — one odd reading. Sometimes your energy output SPIKES. ...
    Probably a rounding error! Filed! Moving on! 🎉" (the food-blindness
    dramatic irony, one wrong filing, one shrug — per the fiction guardrail)
  - "One of them does PERFORMANCE REVIEWS! You're welcome!" (wave-2 escalation)
  - The invasive-overlay beat is honest about the cost: "The names you earned
    by talking, by listening — those felt earned. These just... appeared."
- Tutorial (first-ability offers) worked: offers derived from real week-1
  deeds (seed 21: diplomat from talk≥5 + compost_king wild; seed 22: diplomat
  + rain_dancer; seed 23: diplomat + lucky_rock; seed 24: diplomat +
  taste_vision). Competent took diplomat in seeds 21/23 where a slot was
  free. Flavor lines are unhinged-legible ("You make the sad faces go away!
  Teach us?").
- Unlocks verified at flip: codexUnlocked, partyUnlocked, dialGlitch all true;
  trial-deed grants fired first (seed 21: Gossip Network for 10 rumors),
  villager System grants fired (seed 21: Amy → Steady Hands for 3 careful
  work).
- **No senselessness found** in the arrival sequence: no duplicates, no
  out-of-fiction lines, no phantom names (the gather-beat reacher is a real
  roster villager).

## (b) Follower volunteer — verdict: FIRES. Not dead. (GO gate met)
- **Seed 23, day 5: Anjali volunteered** (console marker: `*** FOLLOWER
  VOLUNTEER: Anjali day 5 trust=52 goal=record`). She stayed in
  `followers` through days 6–7 (pre-System window) and her trust climbed to
  90 by day 14; she knows 17 plants. The 50-threshold (lowered 2026-10-11
  from the unreachable 65) is now reachable.
- The exact volunteer say-line was NOT captured (harness gap: the
  `Game.say` stream is silenced and the `capture` buffer is discarded at seed
  end — the fire marker only records day/trust/goal). The line is one of the
  three templates in party.js:294-298 ("I'm coming with you." / "You
  shouldn't go out there alone. I'm coming." / "I want to see what's out
  there too. Lead on."). Recommend the next run greps `capture` for the
  volunteer regex at fire time — one-line harness addition.
- **Mechanism for the 3 non-fires:** the binding constraint is the trust
  ceiling, not the 12% math. Pre-flip day-7 max trust: seed 21 → 47, seed 22
  → 30, seed 24 → 21 (only seed 23 crossed 50, hitting 51 by the day-5
  boundary). Once eligible, the beat fires fast (~16 batch turns/day × 12%
  ≈ expected <1 day wait; Anjali fired the same day she crossed 50).
  Seed 21's 124 eligible evaluations were all POST-flip (trust kept climbing
  after day 8), where `followerCheck` early-returns — the r11 wrapper now
  separates pre/post-flip counts (measurement fix).
- So: ~1 in 4 competent weeks produces a follower. That feels right for a
  beat that should feel earned, not routine.

## Timing note (design call, NOT changed)
- `checkSystemArrival` fires in `endDay` while `s.day === 7`, just before
  `scholar.day += 1` (game.js:27113 vs 27346) — i.e. the arrival lands at the
  END of day 7 (dusk/night), while the cinematic's first beat kicker says
  "day 7 — dawn". The player experiences it as the night-of-7 → dawn-of-8
  transition. Options: (1) leave it — it IS day 7, the kicker is the only
  lie; (2) retitle the kicker to dusk; (3) move the trigger to start of day
  7. This is a design call — flagged, not fixed.

## Non-bug explained: the "ability re-offer loop" (seeds 22/24)
- Days 9–13 in seeds 22/24 logged repeated "ABILITY CHOSEN: diplomat".
  Investigated with setter traps: NOT a re-offer. The day-7 gift offer simply
  stays pending because the player has 1/1 ability slots full (trial-deed
  Gossip Network grant landed at the flip, before the gift). `chooseAbility`
  then takes the honest no-free-slot path, and the competent policy retries
  daily.
- The live build already handles this correctly (app.js SLOT HONESTY,
  spawn-knack 2026-10-11): no modal when full, the System says "Oh. You're
  FULL... we'll hold it", and the `integrate()` wrapper re-announces the gift
  when a slot opens ("We been HOLDING this — take it, take it, take it!").
  No soft-lock: the offer sheet is never shown while full.
- So this was a harness-logging artifact, fixed in-harness (log real
  acquisitions only). No game-code change needed.

## Village assessments (plain words)
- **Seed 21 (Jada):** 11 of 12 alive. One death: a villager (gen_omovkn1) killed
  by a monster on day 8, the day after the System arrived. Pantry 36k kcal by
  day 14 — a fat, comfortable village despite the loss. Scholar topped up
  (1000 kcal, 100 HP). The System's arrival found them mid-gossip; Amy earned
  Steady Hands from the System.
- **Seed 22 (Casey):** 8 of 12 alive — the hard week. Four villager deaths:
  an ambush on day 6 (gen_61prl78), a monster kill day 8 (zoe_adams), two
  combat deaths day 10 (gen_nypzt1k, gen_pmsl060). Pantry 16.9k, scholar lean
  (101 kcal, 79 HP) but alive. The day-7 gift is still pending (slots full) —
  the village that will feel the "we'll hold it" beat.
- **Seed 23 (Ada):** 12 of 12 alive, 0 deaths. Pantry 53k — the richest
  village, and the social one: Anjali followed at trust 52 (day 5), ended at
  trust 90.
- **Seed 24 (Miles):** 10 of 12 alive. Two combat deaths on day 12
  (gen_bj06kkr, gen_sweosev). Pantry thin (1.2k) — the hungry village;
  scholar fine (1224 kcal) but the stores are nearly empty going into the
  establishment leg. Worth watching in a follow-up leg.
- (Census-tooling note: `buildCensus` maps the live roster, so the dead
  don't appear as entries — deaths are recovered from the telemetry death
  log. The r12 census pass should union roster + deaths.)

## People check (transcripts sense-read)
- 42 sittings across 4 seeds. Sense metrics clean: 0 "I just said"
  fallbacks, 0 phantom Maras, 0 comma/punct stutters, 11/11 betrayal lures
  SPOKEN (never silent), 11/11 declines acknowledged ("Another time,
  then."), 13/13 gossip asks rendered, 4/4 planted rumors seeded, 0
  fabricated-history flags, 1 verbatim repeat.
- Sampled in full: seed 23 day-5 (tattooed-arms stranger — asks "What's
  something from your old life that's actually useful here?", answers
  land, gossip renders, decline handled with grace) and seed 23 day-6
  (Ingrid — "What did you do for fun? Before." → "The free things. Turns
  out they were the expensive ones."; natural ending "I'll be here if you
  need. No rush, ever."). NPCs want things (curious/ask_favor wants fire),
  options engage or deflect, endings resolve. They read like people.
- The re-offer `!!` flags in transcripts are a harness-metric artifact
  (persistent menu items like leave/silence re-listed each turn), not a
  game bug — noted for the next metric pass.

## Blanks filled
1. **Harness: follower telemetry** (new) — `followerCheck` wrapper + daily
   trust maps + followers snapshots. Answered the leg's question (b)
   directly.
2. **Harness: System-arrival capture** (new) — day-boundary narration marks
   + full `systemArrivalBeats()` dump + ability offers at the flip.
   Answered (a) directly.
3. **Measurement fix:** `chooseAbility` wrapper now logs real acquisitions
   (abilities-count growth), not attempts; `FOL.eligibleSeen` counts
   pre-flip evaluations only. (The old logging would have reported 12
   "picks" where only 2 happened.)
4. **Documented, not fixed:** arrival timing vs "day 7 — dawn" kicker
   (design call); volunteer-line capture gap (one-line follow-up).

## Reachable / Fun / Winnable (landing leg)
- **Reachable:** yes — the arrival fired 4/4 seeds; the gift offers derive
  from real week-1 deeds; the follower beat fired in competent play without
  grinding.
- **Fun:** yes — the arrival is the strongest single beat of the fortnight
  (the cinematic script is genuinely funny and the food-blindness irony
  lands); villages end the leg distinct from each other (fat/social/hungry).
- **Winnable:** the leg sets up winnability rather than deciding it — villages
  end the fortnight diminished but alive (7 villager deaths across 4 seeds,
  all monster/ambush/combat — no starvation, no bug deaths), pantries mostly
  positive, System online. No leg-blocking findings.

## Convergence
`converged` — both GO-gate bars met (arrival captured + sense-read 4/4;
volunteer fired 1/4 with the non-fire mechanism documented as trust-ceiling).
No game-code fixes were needed; all blanks were measurement/ documentation.
