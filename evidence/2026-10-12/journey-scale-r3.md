# Journey leg: SCALE (days 80–140) — 2026-10-12 r3

Recovery run. Rotation 3 → (advanced after this run). Worktree `journey-scale-r3`
(oversight-playtest-loop). Previous run (journey-scale-r2, 03:00 CDT) died ~1 min
after registering (stale-lock recovery per the overlap guard: heartbeat 08:01:01Z
>15 min stale at 08:30Z). Its uncommitted 990-line harness
`scripts/test-journey-scale-20261012.js` (LEAD road + REFUSE probe) was inherited
and finished by this run. Main tree untouched until landing.

## Method

Inherited harness `scripts/test-journey-scale-20261012.js` (competent policy +
scale-leg extensions: LEAD-road courtship via proposeLink/bidForPrimacy,
studyVillageCodex climb verb, survival-first fights, telegraph dodge, futility
flee, moderator-mute counter, gq:* conversation answers). Node, seeded RNG before
module eval, full production script list, text capture on. Canon read first:
CANON.md, SCALE.md.

This run: 2 seeds (20261012, 777) DAYCAP=140 + 1 seed (20261012) DAYCAP=60 with
CONVODAYS=30,36,42,48,54 for the people check. Plus instrumented probes
(/tmp/probe-*.js) for the courtship/exile investigation.

Driver fixes in the harness (this run): gq:yn:yes / gq:howru / gq:greet answers
added to the engage path (the old driver bailed to (leave) on NPC yes/no
questions — seed 20261012 day 30's wound favor never played); exile/joined
standing checked before proposing, labeled `courtship-blocked` instead of the
false `declined`.

## The headline finding: the scale leg was unreachable because the scholar was exiled, not because villages declined

**All 15 "declined" proposals in this run's 2 seeds were exile-blocks, not
village declines.** `proposeLink` returns null both for a real decline AND for
the exile guard (`_blockIfNotHaven`: "Haven's council doesn't take orders from
the road. Exile means exile."). The harness logged both as `declined`.

Instrumented replay (seed 20261012, competent policy): scholar EXILED day 17–20
by a freeloader moot ("Hands: 11 for exile, 0 against"). `judgeLink` scores at
day 25 were 54–57 (ACCEPT/counter band) — the villages would have said yes.
The courtship system was never reached.

**Root cause — freeloader pipeline player-blindness** (fixed this run,
src/js/game.js `freeloaderTick`): the `(effort < 0.5 && draining)` clause is
dead for villagers by construction (produced = expected × grit, grit ≥ 0.5
always — the code's own comment says so; the 2026-10-09 H6 fix added
drainBeyondCapacity as the live signal). But the player's real foraging is
never logged to contribLog (only the villager daily sim writes it), so
`produced` is always 0 for the player and the effort gate measured DONATIONS,
not effort. The measured scholar: 20.4k kcal net pantry drain over 17 days,
0 gives (pack empty — foraging ~1k/day while learning, all eaten), effort 0.
Exiled day 17–20. Every scale-leg council verb then blocked.

**Fix:** the effort gate now applies only where production is modeled
(non-players — dead by construction for them anyway, so zero behavior change);
the player is judged by the same live signal as villagers: sustained net drain
vs own capacity (`drainBeyondCapacity = netDrain > max(1500, 3×totE)`).
Steve's "kick out drains" design preserved: a true drain (100k net) still
trips the vote; a learning player (20k/17d) gets ~5 weeks to learn and
contribute instead of 17 days. Proof:
`scripts/test-freeloader-player-20261012.js` — RED on master (case A condemned),
GREEN after (A spared, C condemned). Regressions: test-break-food3 H6 46/46,
test-break-social-r11-exile (2 pre-existing failures, identical on pristine
master), ontology 83/83.

**Measurement correction for yesterday's blank #1** ("courtship spiral":
48/48 declines, 0 counters): on current master the scholar is exiled before
day 25, so proposals never reach the village. Yesterday's runs predate/postdate
the exile-guard commit 18aa4f4f (2026-10-11) — the decline data is
contaminated to an unknown degree and needs re-measurement with exile-aware
logging (now in the harness). The "decline −5 spirals" story may be largely
an exile-block story.

## Village assessment (plain words)

**Seed 20261012 (pre-fix policy run) — dead day 38, combat.** Wave 2 day 19.
6 fights (Nevermore won, Highbeam Deer lost, Hushpuppy won, Understudy fled,
Hushpuppy lost, Highbeam fled). 11 contests. Never left 'village'. 15
proposals, all exile-blocks (mislabeled declines).

**Seed 777 (pre-fix) — dead day 53, starvation.** 14 deaths (combat +
starvation cascade days 41–53). 12 contests. Never left 'village'.

**Seed 20261012 (convo run, pre-fix) — dead day 57, combat.** 4 transcripts
(days 30/36/42/48). Carmine (pharmacist) starved day 40, Rosa day 41, Lena day
47, Emma day 52. Last alive: David (plumber), trust 1, steady.

**Seed 20261012 (post-fix verification) — dead day 39, combat.** Scholar NOT
exiled (past the old day-17 window). Courtship PLAYED for the first time:
day 25 proposeLink→Emberhold LINKED; day 26 first-gesture beat fired
("🎁 Haven's first gesture: 2,000 kcal walks to Emberhold's fire — a gift, no
strings. They count it, and they remember who sent it. (Trust +10.)");
day 26–27 two more peer links as primary (Stonebridge, Thornfield) LINKED with
gestures. 3 links in 3 days on the LEAD road. Died day 39 to wave-2 combat +
early starvation — the food/combat wall, not a social block. National not
reached (links need 30-day seasoning), but the courtship gate is proven
walkable.

## People check (4 transcripts read, sense-tested)

**Day 36 (Carmine, ask_favor, trust 90)** — the bar. Opens "Never mind the
food I needed — we got it handled" (want self-resolved off-screen, sensible).
Admits hunger honestly ("My stomach's been empty so long I've stopped feeling
it, and that's worse"). Three real teaching beats (Wood Sorrel, Wild Ramps,
Wild Black Cherry — each with personality). Player deflects ("Can't right
now") → "No, yeah, of course. Forget I asked. They won't forget. They'll just
stop asking." resolution=deflected, and `alive:memory:deflected` surfaces next
time. Consequences are real. (Carmine starved day 40 — the deflection arc is
a coherent tragedy.)

**Day 48 (David, seek_comfort, grieving)** — the bar. "I'm not okay. I'm saying
it out loud so it's real: I'm not okay." Comfort earned over 8 exchanges
(stay/stay/stay → "Good. Company's company." → "Stay as long as you like." →
"...I keep thinking about them. About — everyone."). resolution=comforted.
A betrayal hook ("Come see what I found") sits unanswered — planted thread.

**Day 42 (Emma, seek_comfort, grieving)** — honest. Player deflects grief with
"teach me something"; Emma complies (Huckleberry lesson), want goes
unestablished. The engine lets the dodge stand — the player feels the miss.

**Day 30 (Carmine, ask_favor)** — harness bailed on gq:yn menu (fixed this
run: gq:yn:yes now engages). Closing line "Anyway. I'm glad we talked. Really."
after zero exchanges is a minor senselessness (noted, not fixed — endConvo
after an empty conversation).

Verdict: villagers act like people. Grief is real, comfort is earned,
deflections are remembered.

## Blanks filled

1. **[SLEEP] diagnostic console spam** (game.js:17111, 17257) — the 2026-10-05
   "partner reports no healing" diagnostic, still shipping 7 days later (200+
   lines per harness run). Removed; the wake line reports net health honestly
   (its replacement). Proof `scripts/test-sleep-diagnostic-20261012.js`:
   RED pre-fix (2 lines), GREEN post-fix (0 lines, wake line intact).
2. **Freeloader player-blindness exile** (above) — the scale leg's binding
   blocker. Fixed + proof.
3. **Harness mislabeling** (exile-blocks as declines) + **gq:* driver gap** —
   fixed in the journey harness.

## Blanks documented (not fixed)

1. **Food wall still binds.** Even post-fix, the scholar drains ~1.2k/day net
   (foraging ~1k/day vs ~3k expected with 7–8 plants known); exile now lands
   ~day 37 instead of day 17 if nothing changes. The scale leg needs day 80+
   as a member in good standing. The binding constraint is food production,
   not the exile mechanic — longsim lever territory.
2. **Yesterday's courtship-spiral data contaminated** (see above) — needs
   re-measurement.
3. **Wave 4 / global unreachable in-leg** (0 runs; wave 3 only). Stands.
4. **Pilot episode unimplemented** (establishment blank). Stands.
5. **endConvo "glad we talked" after empty conversation** — minor.

## Verdict: reachable / fun / winnable

- **Reachable: YES for courtship, PARTIAL for the leg.** The exile wall (the
  actual blocker) is fixed and verified: 3 links + 3 played gestures in 3 days
  post-fix. National still unreached in-run (food/combat wall binds ~day 39);
  the verification run proves access, not arrival.
- **Fun: YES.** The conversation system is the bar (David day 48); wave-2
  fights are real; the freeloader moot itself is honest (it warned first:
  "pull weight or face a moot").
- **Winnable: the leg resolves honestly.** Deaths are legible (starvation
  cascades, combat). The endgame pacing (~day 100) still doesn't close at
  competent play — longsim territory.

## Files

- Fix: `src/js/game.js` (freeloaderTick player-blindness + [SLEEP] removal)
- Proof: `scripts/test-freeloader-player-20261012.js` (2/2),
  `scripts/test-sleep-diagnostic-20261012.js` (3/3)
- Harness: `scripts/test-journey-scale-20261012.js` (inherited, driver-fixed)
- Regressions: test-break-food3 46/46, test-break-social-r11-exile (2
  pre-existing, same on master), ontology 83/83
- Transcripts: /tmp/journey-scale-transcript-20261012-day{30,36,42,48}.txt
- Censuses: /tmp/journey-scale-census-{20261012,777}.json
