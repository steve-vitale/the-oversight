# sim-spandraw-playpath-b — PREREGISTRATION (committed BEFORE any judged census)

Run: oversight-flesh-out-loop-b, arm sim-spandraw-playpath-b, axis
food-economy. MEASUREMENT ONLY, zero src/js, zero app.js UI code,
zero changes to any existing analyzer, sweep, capture, or to
scripts/dedupspan-ledger-b.js / scripts/census-spandraw-b.js.
One NEW driver (scripts/playpath-spandraw-b.js), one NEW analyzer
(scripts/analyze-spandraw-playpath-b.js), one NEW proof
(scripts/test-spandraw-playpath-b.js). This arm does NOT re-run
under competent policy as a promotion band (spanpromo forbids
that re-run); it builds the NEW instrument spanpromo named, and
runs a fresh pilot census through it.

## Gap (backlog, claimed this run)

Span-draw class beyond cultivate, instrument gap: competent
census finds only cultivate keys firing (356 spans, 0 crossings);
spandraw-design proved 15 keys PROBE-PROVEN (mechanism) on
scripted day-boundary probes; spanpromo proved NO PROMOTIONS
under competent policy (8 fresh seeds, all 15 keys 0 spans).
Standing rule: a future promotion claim needs a NEW instrument
— a play path that taps arbitrary ability actions — NOT more
competent seeds, and NOT a forced-timing probe (which could
manufacture crossings real play never makes).

## The instrument (what counts as a real-play tap)

Per (seed, key), one fresh game (loadGame + setupGame via
scripts/sim-harness.js, FULL src/js list in index.html order
minus DOM-only files, Math.random seeded BEFORE eval, never
stub Game.save):

1. GRANT (setup, disclosed, same as the design probe): the key's
   ability is pushed onto scholar.abilities (level 1) before play
   begins, because on competent bands most keys are never owned
   and an unowned ability cannot be tapped at all. Granting is
   setup, never play: the tap, its timing, and its outcome are
   all played.
2. PLAYED DAYS: the game is played with the competent policy
   (competent-nofeast substrate: COMPETENT_FEAST=0, SEATDRIVE=0,
   PLENTYDEPRI=0, DEPOSITGATE=1, asserted FATAL by the driver)
   for 2 lead days, then 5 tap days. Lead days let the village
   settle into routine instead of tapping on a day-1 fixture.
   On each tap day, the wrapper policy runs competent.daily
   (real game actions: forage, sort, sow, talk, traps, meals)
   and THEN, as the day's last player act before the harness
   sleep, performs the tap sequence. No dayTicks is ever set,
   no tickAction is ever called by the driver, no clock is
   ever advanced except by game actions themselves. The tap's
   position is whatever the day's work left — recorded, never
   chosen. (Calibration, seed 10030, NOT in the judged band:
   a competent daily starts at dayTicks 384 after the harness
   waits and ends anywhere from early next morning to late
   evening depending on the day's work — so tap positions
   genuinely vary by play, and crossings, if any, are chance,
   not design.)
3. TAP SEQUENCE (per key class):
   - Explore / camp keys with no world prerequisite (tracker,
     thief, game_sense, patient_aim, stalk, blood_trail,
     ambush, animal_ken, scarecrow, molt, long_table):
     button read, then tap. No extra setup.
   - Social keys (fear_aura.menace, intimidating_presence.
     end_it_before, war_cry.challenge): open a conversation
     with a living roster villager via Game.talkTo and KEEP
     it open (competent talkRound closes conversations at
     once, which is why the button scan finds no audience),
     then button read, then tap, then endConvo('left').
     The conversation is a played player verb, not state
     poking: the precheck's own scan reads the active
     conversation the player is holding.
   - Trophy (trophy_room.mark): no setup. Its prerequisite
     (≥1 kill in state.villageSlain) must genuinely exist
     from played days; if none exists, the tap is recorded
     as button-refused (see success criterion) and no tap
     is issued.
4. BUTTON READ + UI TAP (the success criterion, per key):
   A tap is GENUINELY ATTEMPTED iff BOTH hold: (a) the button
   read Game._actionAvailable(abilityId, actionObject) returns
   ok — the same read the action bar uses, with the bar's
   null target, so a precheck refusal is a disabled button,
   not a tap; and (b) the tap is issued through
   Game.activateAbility('ability.action') with NO target —
   the exact dispatcher a UI bar tap reaches (it routes to
   useAbility). A direct useAbility call, a direct impl call,
   or a tap issued while the button read refused is NOT a
   genuine attempt and is never counted as one. If the
   button read refuses, the instance records
   outcome=button-refused with the why verbatim, issues NO
   tap, and creates NO span. If the player is in combat at
   tap time, the tap is SKIPPED (in combat the bar offers
   only combat actions; these 15 keys are all non-combat)
   with reason=in-combat, and no tap is issued.
   Tap success (attempted → fired) is useAbility's return
   plus the tap-window say lines: an impl refusal narrated
   after payment is a fired-but-refused tap (span logged,
   outcome recorded as such), NOT a success and NOT a
   button-refused case.
5. SPAN LOGGING (same detector as census/design): the nest
   logger wraps Game.useAbility OUTERMOST and Game.pantryDraw
   (spanEnter/spanExit + drawEnter/drawExit, monotonic evt),
   installed AFTER the stockdoors + mealdraw + spoilvol
   captures, in census order. Every tap records its evt
   window (nest evt counter before/after the tap call), its
   dayTicks/dayPart/kcal/health before and after, game day
   before/after, atHaven, inCombat, conversation partner (or
   null), kills (trophy), and tap-window say lines. Policy
   spans (e.g. cultivate taps inside competent.daily) fall
   OUTSIDE every tap window and are excluded by the
   analyzer — only tap-window spans are judged.
6. NO kcal/health top-up (unlike the design probe): the
   player's resources at tap time are whatever played days
   left. A cost refusal is a genuine play outcome, recorded
   as cost-refused, not a fixture artifact to top away.

## Keys claimed (15 PROBE-PROVEN keys, nothing else)

tracker.track, thief.steal_pantry, game_sense.read_sign,
patient_aim.clean_shot, stalk.stalk_prey,
blood_trail.follow_blood, ambush.lay_wait,
animal_ken.read_beast, scarecrow.stage_injury,
molt.shed_skin, fear_aura.menace,
intimidating_presence.end_it_before, war_cry.challenge,
trophy_room.mark, long_table.share_pot.
Cultivate is NOT claimed here: its real-play proof is the
9954 belongseek replay (3,820 kcal), and this arm does not
re-judge it. Kcal-only keys (ask, push_through) and the 5
pre-payment fixture refusals are NOT claimed: they cannot
cross by construction / on fixture world-state, and this
instrument does not re-prove them.

## Census band (fresh pilot)

- Seeds: 10040–10047 (8 fresh seeds; calibration seed 10030
  and all census/design/promo seeds are excluded).
- Horizon: 7 harness days per instance (2 lead + 5 tap days).
  WHY: lead days settle routine; 5 tap days give each key 5
  evening taps per seed (40 taps per key across the band)
  without ever steering a tap toward the boundary. Death-
  aware: if the game ends (Game.over) before the tap days
  complete, the instance ends, already-made taps count,
  and the instance is flagged ended-early — a dead village
  is a played outcome, not a missing file.
- Instances: 8 seeds × 15 keys = 120 instance files, one per
  (seed, key), under
  evidence/2026-10-28/sim-spandraw-playpath-b-corpus/.
- No confirm band is pre-registered: this is a pilot census
  of a NEW instrument. If a key promotes on pilot, the
  confirm band (12 fresh seeds) is a NEXT arm's prereg,
  not an extension of this one.

## Judged classification (per tap-window span, census rules)

The analyzer runs the UNCHANGED span-dedup rule
(applySpanDedup) on each instance's tap-window events and
classifies each key with the census classes:
- PROMOTED-REAL-PLAY: ≥1 tap-window span with excludedKcal
  > 0 AND day-crossing AND span-internal draws > 0 (the
  census PROVEN rule, applied to played taps only).
- TAPPED-NO-CROSSING: ≥1 genuinely attempted tap, zero
  day-crossing tap spans, zero exclusions.
- SPAN-CROSSES-DAY-NO-DRAW / MIXED-NEEDS-READ: census
  definitions, applied to tap spans only.
- NOT-TAPPED: zero genuinely attempted taps across the
  band (all instances button-refused, skipped, or
  cost-refused — split published per reason, never a bare
  zero).
A crossing counts ONLY if the span genuinely crossed endDay
inside the played tap sequence: enterDay ≠ exitDay AND ≥1
span-internal draw framed as an endDay meal (nest frames /
mealDrawRecords). A tap whose span crosses but whose draws
are not endDay meals lands in MIXED-NEEDS-READ, never
PROMOTED. Policy spans never count (outside tap windows).

## Verdict rule (judged ONLY against this prereg)

- LEG 1 — pilot gate (instrument GO): all 120 instances
  complete without driver crash (ended-early instances count
  as complete if their files are written and flagged); every
  genuinely attempted tap carries spanEnter+spanExit for
  its key; every tap-window span is classified (no
  unclassified span); the analyzer reproduces the design
  control (a design-probe tracker instance re-analyzed
  through the tap-window path classifies PROBE-equivalent:
  crossed, internal draws > 0, exclusions > 0).
- LEG 2 — per-key census: the per-key table publishes, for
  each of the 15 keys, taps attempted / succeeded /
  button-refused / cost-refused / skipped, spans, day-
  crossing spans, span-internal draws, exclusion kcal,
  seeds with taps, seeds with exclusions, classification,
  and zero attribution. A key with taps but no crossing is
  a completed measurement, not a failure.
- LEG 3 — promotion judgment: PROMOTED-REAL-PLAY is claimed
  ONLY under the rule above. If no key meets it, the verdict
  is "instrument built, crossings still unproven in real
  play" — honest zeros are an answer. Probe-proven mechanism
  is NEVER re-scored as real-play proof, and no crossing is
  ever manufactured: the driver sets no clock, and any tap
  position that looks steered (e.g. dayTicks within cost of
  512 on every tap) must be disclosed as a design flaw, not
  celebrated as a crossing.
- LEG 4 — controls: (a) the 9954 belongseek replay control
  still classifies cultivate as PROVEN at 3,820 kcal through
  the census analyzer (instrument consistency, as in
  census/spanpromo); (b) tap-position distribution is
  published (dayTicks before tap, all taps) so a reader can
  see the taps were NOT boundary-steered.

## Sense-check (pre-registered)

Read at least one played tap transcript end-to-end (tap-
window say lines + span trace + the day's played actions
that preceded it) and judge plainly: did the taps read as
a player acting after a day's work, or as a probe wearing
a costume? Say so. If the evening-tap shape reads as
costume (e.g. the conversation is opened only to tap and
closed at once with nothing else in it), say that too —
the instrument's honesty is the finding either way.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

This census has NO before/after game leg: zero game changes,
zero lever variants, nothing to panel. The judged comparison
is WITHIN the instrument (played taps vs the probe's boundary
taps, same classifier, same dedup rule), and panel metrics
(national/table/wins) do not exist for 7-day instances and
are not estimated. So NO balance-panel compare .md is
produced for this arm, as in census/design/spanpromo.

## Metric review (carried, not re-scored)

- The tap-window exclusion is the ONLY place a played tap can
  promote. A tap that crosses but swallows no meal (e.g. a
  night with no villageMeal draw inside the span) is not a
  double-count and is not promoted.
- Post-run ownership is NOT used: ownership is the grant
  fixture, disclosed, so no owned/unfired split is claimed.
- Once-a-day keys tapped on 5 successive days: each day's tap
  is judged against that day's flag (the predictor is
  day-roll-aware, per ABILITY-REFUSALS §5), so a boundary
  tap succeeding as the new day's action is a played
  outcome, not a re-use.
