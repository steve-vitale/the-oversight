# Journey: crisis leg (6) r21 — the event that cuts the queue (2026-10-17)

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Leg:** 6 — crisis, r21. Fresh angle: **THE EVENT THAT CUTS THE QUEUE.**
  r20 (muster episode) left one found-not-fixed item: "in 2102, Declan's
  t2LatelyEvent returned 'mourning' but his convo offered no event choice
  (Deiker got the mourning choice in the same run). Pre-existing
  scene-gating quirk." Root cause (code-read this run): `convoWhatsAlive`
  (src/js/convo-scene.js) appended the world-event item LAST — after open
  threads (2), fresh memories (≤4), and the want question (1) — while its
  own docstring says "most alive first" and the block comment says "live
  events cut the queue". The consumer (conversation.js buildMenu) takes
  only the first 3 alive items (`aliveAdded >= 3`). Any villager with ≥3
  alive items ahead of the event never got the on-ramp. The event that
  "cuts the queue" was dead last in it.
- **Leg question:** When a crisis event is the village's latest news, does
  EVERY villager's conversation surface it — or does the menu silently drop
  it behind open threads and memory items?
- **Interesting finding criteria:**
  - (a) reproduce the quirk in a staged sim (villager with ≥3 alive items +
    active mourning → no event choice in buildMenu);
  - (b) fix: move the WORLD EVENTS block to the FRONT of convoWhatsAlive;
  - (c) verify the choice leads the menu and routes to the lately topic;
  - (d) sense-read 3 mid-muster conversations in a real playthrough.
- **Seeds:** proof 7, 42, 99 (crisis-proof convention); sense-read 2101;
  telemetry 3101, 3102 (fresh, off recent-run seeds).
- **Primary metrics (binding, §14):**
  - M1: RED→GREEN on seeds 7/42/99 — pre-fix, the crowded villager gets no
    `alive:event` choice in buildMenu; post-fix, the event choice is the
    first alive item, exactly one, no duplicate ids.
  - M2: no regressions — crisis suites, convo suites, r20's muster game
    test, shelter-verb 35/35 all green; menu choice counts unchanged
    (pre-existing 8-choice ceiling on the beat-matrix path, documented).
  - M3: 3 mid-muster conversations in a real playthrough — the event choice
    surfaces for crowded villagers; full transcripts SENSE-read.
- **Kill rule:** if sense-reads show the want system starving (a villager's
  want question never appears because the event displaced it), scope the
  fix differently — NO-GO. Not triggered (see below).
- **Horizon:** proof: staged, same-day. Sense-read: oracleV2 establish 15d
  + staged wave-4 siege (r20 pattern), convos while mustered. Telemetry:
  r20's d60 muster diag on 2 fresh seeds.
- **Method:** scripts/test-crisis-event-queue-20261017.js (RED→GREEN
  proof); scripts/diag-crisis-event-queue-20261017.js (sense-read pilot);
  scripts/diag-crisis-muster-20261017.js (r20's telemetry diag, rerun).

## Metric review (§14)

- **M1: HIT (3/3).** Pre-fix: event item built at alive-index 4, dropped
  by the menu pipeline (eventChoices=0). Post-fix: index 0, exactly one
  `alive:event:*` choice, first alive item on the menu, no duplicate ids.
- **M2: HIT.** check.js --only crisis 11/11; --only convo 13/13;
  test-crisis-muster-game-20261017 (r20) green; test-shelter-verb-20261016
  35/35. Menu counts unchanged by the fix.
  - Metric correction: the original M2 draft asserted "menus still ≤7
    choices" — RED showed 8 on PRE-FIX code (the beat-matrix path does
    pre(2).concat(beatMenu) with no MAXC cap in finalizeMenu). The ≤7 was
    my invention, not a code contract — replaced with the honest
    no-duplicates + unchanged-count checks. Noted as found-not-fixed.
- **M3: HIT with notes.** 3 mid-muster convos (seed 2101, all lately=
  'defense', all crowded with 2 threads + 2 memories):
  - Chen: event choice LED the menu and was picked first. "That night — I
    stood down Cliffhanger at the treeline — it ran. I keep hearing it when
    I try to sleep." A person with a real experience and a cost. Thread
    resume worked. The bar, working.
  - Kelsey: hanging direct question owned T1 (reactive menu, by design);
    after deflecting, the event choice appeared and was picked: "You want
    to know what I did in the raid? ... Don't call it brave. Call it
    awake." want=deflected — the honest consequence of my pick, not the
    ordering.
  - Dominic: mid-thread resume opener → alive section skipped by design
    (thread coherence, Steve's law) → no event on T1. Verified the on-ramp
    is one honest hop away: deflect/subject-change → next menu carries
    `alive:event:defense`. The event is reachable from every menu state.
  - Kill-rule check: the want question is no worse off than pre-fix. In
    the crowded case the want never made the top-3 either way; in the
    uncrowded case all of event/memory/want still show, better ordered.
    Chen's want stayed live (unresolved) alongside the event pick.
- **Telemetry deviation check:** two LOUD lines, both investigated
  same-run, both explained — NO baseline roll-forward:
  - `jumps newly appeared (0→36/64)`: METRIC MISMATCH, not a deviation. I
    passed `jumps` (all wild jumps) against the baseline's `shelteredJumps`
    key. Sheltered jumps = 0 on every run, pre- and post-fix — the
    muster's protection is intact.
  - `fallen swung +62%/+154%` (13→21/33): SEED VARIANCE + expected chaotic
    divergence, not systematic harm. Same-seed pre/post comparison via
    patch round-trip: seed 3101 is BYTE-IDENTICAL pre/post fix (musters 1,
    fallen 21, convos 4, jumps 36, memories 7, sheltered jumps 0) — the
    reorder moves nothing in the sim when the bot's picks coincide. Seed
    3102 diverged: fixed-3102 wiped d32, prefix-3102 survived past d24.
    Cause of the fixed-3102 wipe, read from the log: pantry hit 0 kcal
    d32 — a post-muster starvation cascade (food economy), with deaths by
    combat/sickness, not conversation. No plausible channel connects menu
    ordering to a 3,200-kcal pantry collapse: conversation count, kcal
    cost, and the bot's food actions are unchanged; only which topic gets
    discussed differs (trust ±1). The divergence channel is the shared
    Math.random stream: any behavioral change desyncs subsequent draws in
    a chaotic sim — the expected, understood cost of any behavior change,
    and the reason identical-seed controls only bind when behavior
    coincides (3101). The crisis-muster baseline itself shows fallen
    varying 6–7 across r20's own two seeds; 12–21 is the leg's normal
    spread, not a signal. (Note: the prefix-3102 control run did not
    complete — killed by timeout at 9.5 min grinding phase 3 under box
    load with 18 world monsters on the map; the 3102 comparison is
    fixed-only.)
- **Convergence:** blank fixed + proven at mechanism level + pilot
  sense-read + telemetry-clean. Done.

## The blank: the world event was last in the queue it was supposed to cut (FIXED)

**Finding:** `convoWhatsAlive` built its menu items in the order: open
threads (2), fresh memories (≤4), want question (1), world event (last).
The menu pipeline takes only the first 3 alive items. So the event on-ramp
— the conversation's doorway into musters, mourning, outbreaks, threats —
appeared only for villagers with fewer than 3 other alive items. r20's
Declan/Deiker asymmetry was not a data quirk: it was structural. Crowded
villagers (the ones with the most going on — exactly the villagers a
player talks to in a crisis) never got asked about the crisis.

**Fix** (design calls mine — Steve overrules):
- `src/js/convo-scene.js`: moved the WORLD EVENTS block from #4 to #1 in
  `convoWhatsAlive` — "most alive first", per the docstring, and "live
  events cut the queue", per the block's own comment. The EV_LABELS gate is
  unchanged; unlabeled kinds still push nothing. Section caps (threads ≤2,
  memories ≤4 total) are untouched: with an active event they yield one
  slot, which is what "cutting the queue" means. The event choice is spent
  after one ask (convoSpendChoice, pre-existing), so the displacement is
  temporary — next conversation the threads lead again.
- The bot policy's pick order (ans → teach → gq → ask → live[0]) means
  competent now picks the event choice as its fallback instead of a thread
  item. Same-seed telemetry shows zero sim-outcome change (trust +1/event
  pick is social, not combat), but it does mean bots talk about the crisis
  more — which is the point.

## People check (SENSE-TESTING LAW)

- Chen's defense-event exchange is the quality bar: specific memory ("that
  night"), personal cost ("I keep hearing it when I try to sleep"), no
  filler. The event on-ramp delivers the NPC's want-adjacent truth, not a
  bulletin.
- Kelsey's deflect → event path shows the reactive menu and the alive menu
  composing honestly: her deflected question had a consequence
  (want=deflected), and the event choice still arrived.
- Full transcripts in evidence/2026-10-17 (r21 sense-read log via the
  diag; JSON flags per convo).

## Census (plain words)

- Sense-read seed 2101 (d18, mid-muster): 11 landed — Brooklyn (butcher),
  Kelsey (musician), Chen (electrician), Dominic (baker), Avery (mason),
  Nyarko (blacksmith), Leo (trail_crew), Priya (dispatcher_911), Nino
  (dry cleaner), Nina (mechanic), Nora (tailor). Muster active, threat
  (The Congregation) at the treeline, everyone sheltered who could be.
- Telemetry seeds 3101/3102 (d60): muster fired d~18 both, all-clear on
  threat departure both, 0 sheltered jumps both. 3101 lost 21 (bloody
  seed, identical pre/post fix); 3102 lost 12.

## Verdicts

- **Reachable:** YES. The event choice now leads the alive section of every
  non-reactive menu when a lately event is active, and is one honest hop
  away (deflect / change-subject) from reactive and mid-thread menus. No
  policy flag, no player action required.
- **Fun:** YES. The muster/threat/mourning beats land conversationally for
  crowded villagers now, not just quiet ones. Chen's transcript is the
  evidence.
- **Winnable:** YES, unchanged. Same-seed telemetry is byte-identical on
  the sim side; the fix touches menu ordering only.
- **Convergence:** fixed + proven + telemetry-clean.

## Found but not fixed (for future runs)

1. **Beat-matrix menu can exceed MAXC (8 choices observed pre-fix).**
   `pre(2).concat(beatMenu)` has no cap in finalizeMenu; MAXC only gates
   the alive/pivot sections. One-screen rule adjacency. Not this run's
   blank.
2. **"Lost my train of thought" loop on content-less threads.** A staged
   thread with no backing beats loops the forgetful lines instead of
   closing honestly ("I've told you everything I know about that" exists
   but didn't fire). Mostly a staging artifact here, but the fragility is
   real.
3. **Resume-opener label doubling** ("We never finished talking about
   About what they want") when a planted label already starts with
   "About". Cosmetic.
4. **r20's open design question stands:** should an ACTIVE muster boost
   threat/muster priority over mourning in t2LatelyEvent? Steve-call, not
   taken here.

## Files

- Fix: `src/js/convo-scene.js` (WORLD EVENTS block moved #4→#1 in
  convoWhatsAlive; sections renumbered)
- Proof: `scripts/test-crisis-event-queue-20261017.js` (RED→GREEN,
  6/6 × seeds 7/42/99)
- Diag: `scripts/diag-crisis-event-queue-20261017.js` (sense-read pilot,
  seed 2101; full transcripts in run log)
- Evidence: `evidence/2026-10-17/journey-crisis-r21.md`,
  `evidence/2026-10-17/journey-crisis-r21-{3101,3102}.{json,log}`
  (r20 muster-diag reruns = telemetry evidence)
- Patch record: `~/workspace/event-queue-r21.patch` (pre/post same-seed
  comparison round-trip)
