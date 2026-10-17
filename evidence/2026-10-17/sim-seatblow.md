# sim-seatblow — feasted-blow actor attribution diagnostic (flesh-out loop, 2026-10-17)

Axis: scale-onramp. Run: fleshout-20261017-032209 (arm). Worker: sim-seatblow.
Sharpens finding #441 / the tablegate sharpened steve-call: THE FEASTED
BLOW IS THE NAMED BLOCKING GATE — on SEATDRIVE=0 base courtship,
seat-never-earned attributes 100% to the foodDeeds sub-bar: the scholar
must land a feasted strike/ability in real combat (game.js:33661,
feastBuff.js:397 — credit sites VERIFIED in code this run, not assumed).
Steve's call is whether the deed is INTENDED to require the scholar's own
hands. This diagnostic sharpens that call with data from the WINNING
substrate: is the feasted blow scholar-locked IN PRACTICE on the substrate
that actually wins?

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14 — written BEFORE any sim)
DIAGNOSTIC — read-only instrument, zero behavior change (scripts/* only;
src/js, src/data, policies untouched).

- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=1 EXPLICIT (the seatdrive-composed
  winning stack: scripts/policies/seatdrive.js `leadseat`/`belongseat` =
  withSeatDrive(withWinDefer(tribfloor base))). Tracker METHOD NOTE: SEATDRIVE
  unset != driver active — the sweep composes withSeatDrive explicitly via
  the exported policies and asserts SEATDRIVE !== '0' up front.
- SEEDS: 8 FRESH seeds 5201–5208 x {leadseat, belongseat} = 16 runs,
  identical-seed lead/belong pairs, 180d death-aware. Fresh = 0 filename hits
  across evidence/ (verified 2026-10-17; incidental content hits are an ms
  timing value and a 5-digit id, not seed use — see sweep header comment).
- PRIMARY (diagnostic GO) = 100% attribution of foodDeeds-crediting events:
  EVERY noteFeastedCombatUse() call that actually marks prog.feastSurgeUsed
  gets an actor (scholar / villager / ally / monster / unknown) + feasted
  state at the moment + credit path (tbDamage-hook | feasted-form). Any
  crediting event with actor='unknown' or via='unframed' is unattributed and
  the diagnostic is a MISS (NO-GO, never re-scored).
- COMPLETION gates: 16/16 runs complete; per-seed JSONs schema-clean
  (numeric keys); det-gate byte-identical (instrumented vs uninstrumented,
  paired 60d control); 0 instrument errors.
- Also captured per run: seat-earned (tableSeat() seat != 'none', day),
  invitation staged (tableWaiting y/n, day), path taken (tableState
  path/branch), table reached (seated/tableDone/win), national (maxRank),
  wins (Game.won), feasted-buff grants, uplift (FEASTED/OVERCHARGED say)
  events with actor split.

## Credit-site verification (code, this run)
- game.js:33674 (the task's :33661 is the _ps gate two lines up): tbDamage's
  FEASTED hook — `_ps = sourceKey === 'p' || (sourceLabel === 'you' &&
  (sourceKey == null))`, target kind monster/hostile, `_pm > 1`, `_feasted`
  → noteFeastedCombatUse(). The scholar's strike calls
  tbDamage(t.key, d, 'you', null, ...) — scholar convention is
  sourceLabel='you'/sourceKey=null.
- feastBuff.js:400 noteFeastedCombatUse(): idempotent per buff window; marks
  s.prog.feastSurgeUsed. SECOND credit path found this run (not in the task
  brief): feastBuff.js:328 applyFeastedForm() — "any ability resolved in
  combat while feasted counts as real use" — called from abilityActions.js
  useAbility/activateAbility. Abilities are scholar-only (single entry point
  for the player's 6-slot abilities; no villager caller in src/js).
- Non-sim writer: debug-scenarios.js:174 sets feastSurgeUsed directly —
  debug scenarios only, never in sims. Noted, not attributed.

## Instruments
- scripts/seatblow-instrument-20261017.js — read-only attach. Frame-stack
  pairing: tbDamage(targetKey, dmg, sourceLabel, sourceKey, opts) and
  applyFeastedForm(abilityId, actionId, target, preHp) push frames;
  noteFeastedCombatUse() pairs with the innermost live frame (exact under
  synchronous nesting). Actor classifier (pure, proof-pinned):
  'p'/'player'/('you',null) = scholar; 'v_*' = villager (name via fighter);
  'm_*' = monster; ally keys = ally; else unknown. Target species via the
  #405 recipe (fighter.mdef.id — canonical, never prose). feastedActive()
  recorded at the moment. Uplift say-lines (FEASTED ×/OVERCHARGED ×) captured
  with the live frame's actor. grantFeastBuff wrapped for grant counts.
  Daily pure-read sample: tableSeat(), tableWaiting, tableState
  (path/branch/phase), scaleRank, feastSurgeUsed, sentimentTaught. Ring
  buffer of recent say/sysSay lines dumped as context on each crediting
  event (SENSE-TESTING). Exact restore().
- scripts/sweep-seatblow-20261017.js — 16-run sweep, per-seed JSONs
  evidence/2026-10-17/perseed-seatblow/, beats evidence/2026-10-17/seatblow-beats/.
- scripts/analyze-seatblow-20261017.js — actor-split attribution + verdict (no sims).
- scripts/test-seatblow-20261017.js — proof: classifyActor fixtures with
  RED-pinned adversarial cases, unframed-note honesty, det-gate
  byte-identical pairs, SMOKE schema + 0-error.

## Metric review
Per §14 the pre-registered metrics bound the run; the verdict stands as
measured, never re-scored.

PRIMARY (diagnostic GO) = 100% attribution of foodDeeds-crediting events:
**GO.** 11/11 crediting events fully attributed (actor + feasted state +
credit path), 0 unattributed, 0 schema errors, 0 instrument errors, 16/16
runs complete, det-gate byte-identical (proof t4: 2 paired 60d runs).

Two instrument/analyzer bugs were found and fixed MID-RUN (documented, not
hidden — the PRIMARY payload was unaffected):
1. The uplift-beat regex `/FEASTED ×|OVERCHARGED ×/` also matched the
   feast-GRANT announcements ("FEASTED ×N until <dawn>..."), contaminating
   the weapon-event bucket with 139 grant lines as actor='unknown'. Fixed to
   the weapon lines only (game.js:33673: "the feast was the weapon." /
   "OVERCHARGED ×N (well-fed): food is fuel."), uplift events now store the
   matched text, and the full 16-run sweep was RE-RUN for clean per-seed
   evidence. Post-fix: 551/551 weapon uplifts actor=scholar, 0 unknown.
2. The analyzer's schema taxonomy wrongly required day-or-null fields
   (seatDay/inviteDay/seatTakenDay) to be strings — 31 false "SCHEMA BAD"
   flags. Fixed with a DAY_NULL_KEYS category. Post-fix: schemaBad=0.

The pre-registered PRIMARY said "every noteFeastedCombatUse() call that
actually marks prog.feastSurgeUsed" — implemented as the feastSurgeUsed
false→true transition across the wrapped call (marked=11 of 329 calls;
318 unmarked = idempotent repeat-notes within an armed window, counted
separately). The 'feasted-form' via never fired in 16 runs — the metric
required attributing it IF it fired, not that it fire.

One proof-test console artifact (instrument honesty): the det-gate's
uninstrumented legs print table=0/seat=no/marked=0 — the sampler doesn't
run uninstrumented, so those fields are null by construction; the
byte-identical trajectory hashes are the neutrality proof, not the
console line.

## Results
Sweep ran 2026-10-17 ~03:45–04:30 UTC (18 min wall for 16 runs + re-run;
FEASTSCALE_R13=1, SEATDRIVE=1 explicit, seatdrive-composed leadseat/
belongseat, 8 fresh seeds 5201–5208 × 2 policies, 180d death-aware).

COMPLETION gates (all GO): 16/16 runs complete; 16/16 per-seed JSONs
schema-clean; det-gate 2/2 paired 60d runs byte-identical; 0 instrument
errors.

ATTRIBUTION (the diagnostic's payload) — 11 crediting events, 11/11:

| actor | n | share |
|---|---|---|
| scholar (own hands) | 11 | 100% |
| villager companion | 0 | 0% |
| other villager | 0 | 0% |
| ally / monster / unknown | 0 | 0% |

- via: 11/11 `tbDamage-hook` (strikes). The `feasted-form`
  (ability-resolution) path NEVER fired in 16 runs — abilities are live in
  code as a credit path but unexercised by the sim policies.
- feasted at the moment: 1/1 on all 11 (the striker was feasted every time).
- actorDetail: all 11 are the strike convention (sourceKey=null,
  sourceLabel='you') — tbPlayerStrike, the scholar's own swing.
- Targets (canonical mdef ids, #405 recipe): wave-1/2 monsters only —
  sunback, white_noise_heron, sanjun, sunbasker, mirrormoth (w1); heckler,
  giant_mosquito, review_drone, mirror_stag ×3 (w2). Marking blows land
  days 29–85, always early/mid-game.
- Weapon uplifts: 551 events, 551/551 scholar — the feast-as-weapon only
  ever fires in the scholar's hands (the _ps gate makes this structural,
  the sims confirm it holds 100% in practice).
- Buff economy: 185 feast grants → 11 marks (5.9% of feast windows produce
  a marking blow); 329 note calls (1.8 feasted hits/window); most feasts
  arm the buff and expire unused — "a feast that warms no blades marks
  nothing."

SEAT CHAIN per run (the task's required fields):

| road | national | table (invite) | wins | seat |
|---|---|---|---|---|
| leadseat | 6/8 | 6/8 | 0/8 | 6/8 lesser |
| belongseat | 5/8 | 5/8 | 0/8 | 5/8 lesser |

- Seat days: 48,48,51,53,75,82,86,92,95,114,118 (median 82). Invitation
  stages the seat-day or the day after; the seat becomes sittable at the
  day-90 win floor (e.g. leadseat-s5201: invite d52, driver sits d90).
- The driver took the seat on all 11 invitation runs (seatTakenByDriver=11);
  phaseEnd='paths', tableDone=1 — but **wins 0/16**. The table modal runs
  to completion and no win lands within 180d. Filed to sim-findings.md
  (outside this arm; not chased).
- The 5 seat-less runs: 4 village-lost early (days 24–40, before any
  feast-combat could happen) and 1 national-without-seat
  (belongseat-s5208: national reached, 0 marked blows → no seat → no
  invitation) — the tablegate gate REPRODUCED on the winning substrate:
  no feasted blow, no seat, no table, even at national.
- Every seat-earned run has exactly 1 marked event; every marked event's
  run earned the seat. The correlation is exact (11/11 both directions).

## Village assessment — what the feasted blow FEELS like
Sense-read (SENSE-TESTING LAW) of the context beats around two marked
events (leadseat-s5201 d38, belongseat-s5201 d29 — contextBeats ring dumps):

- d29: "🍖 FEASTED ×2.03 until tomorrow's dawn (6 parts left): a proper
  feast... Strikes and abilities hit with the feast behind them." →
  "🌙 The cookfire's smell carried further than the laughter did — smoke
  and grease on the night wind. The Heckler is circling the edge of the
  light. It followed the feast home." → "⚔ THE HECKLER! You're on your
  own." → pocket_sand opener → "FEASTED ×2.03: the feast was the weapon."
- d38: "It turns its face toward you. The face is a mirror. You see
  yourself — tired, dirty, afraid." → "⚔ GRIEF COUNSELOR! You're on your
  own." → "Your first strike glances off. (SCARRED: -3 first strike)" →
  "FEASTED ×2.03: the feast was the weapon."

It reads: the village feasts, the feast-smell draws the monster, the
scholar fights ALONE ("You're on your own" — the seatdrive policies never
field companions in these fights), and the feasted strike lands the deed.
The mechanic's fiction is coherent end to end.

Invitation beats (seatblow-beats/): d90 "◈ THE TABLE IS SET. A ring of
pale light waits — take your seat from Haven when you are ready. Nothing
is final until you sit." + "◈ THE AUDIT — the System reads your run back
to you, and the galaxy listens. A lesser seat — national standing, waves
1–3 faced (17/7/7), 10 contests survived, ..." (the audit names the seat
basis aloud — honest). d86, Aida to Sigrun by the fire: "It waits. We
wait. Somebody should check the snares — the table doesn't fill the
pantry." The village voices the wait in its own register — grounded,
food-first. Nothing robotic in the read.

The tablegate silence persists: no beat ever tells a seat-less run what
the table wants. belongseat-s5208 reached national with zero marked blows
and the game never remarks on the missing deed.

## The sharpened steve-call
Finding #441's call was: is the food-thesis deed INTENDED to require the
scholar's own hands? Measured answer from the winning substrate:

**The deed is scholar-locked twice over — once in code, once in practice.
Code: game.js:33661's `_ps` gate (sourceKey 'p'/'player' or the
'you'/null strike convention) means ONLY the scholar's blows can ever
uplift or credit; a feasted villager's blow credits nothing by
construction. Practice: 11/11 crediting blows were the scholar's own
strikes, 551/551 weapon uplifts were the scholar's, 0 villager/ally blows
ever uplifted or credited — and the seatdrive policies fight these
fights with the scholar alone ("You're on your own"), so the lock never
even meets a challenger.**

Steve's call, sharpened to one line: **the `_ps` gate at game.js:33661
is the exact place where "the village's feasting life" stops and "the
scholar's hands" start — if the deed should be earnable by feasts held,
fighters feasted, and the weapon fired by someone, that gate is the
thing to change. If the scholar's-hands requirement is intended, the
design gap is the silence: a national run with zero feasted blows is
never told what the table wants.** Corroboration: the ability-resolution
credit path (feastBuff.js:328) exists in code but fired 0/16 runs — if
abilities are meant to count toward the deed, the sim policies never
exercise it.

## Blanks filled / documented
- **MEASURED (diagnostic)**: 16-run feasted-blow attribution on the
  seatdrive-composed winning substrate (8 fresh seeds 5201–5208 ×
  {leadseat, belongseat}, 180d death-aware, SEATDRIVE=1, FEASTSCALE_R13=1).
  Completion gates all GO. PRIMARY GO: 11/11 crediting events attributed,
  100% scholar.
- **VERIFIED**: instrument neutrality — proof test ALL GREEN (13
  classifier fixtures incl. RED-pinned unknowns, speciesOf, unframed-note
  honesty, 2/2 det-gate byte-identical 60d pairs, SMOKE schema + 0-error).
- **FOUND + FIXED mid-run**: uplift-beat regex contamination (139 grant
  announcements as actor='unknown') and analyzer day-field schema
  taxonomy — full sweep re-run for clean evidence; documented above.
- **FILED to sim-findings.md**: (a) the sharpened steve-call (scholar-lock
  in code + practice, _ps gate as the change point); (b) wins 0/16 despite
  11/16 invitations + driver seat-taking + tableDone=1 — the win chain
  stalls after the table modal on this substrate (outside this arm, not
  chased).
