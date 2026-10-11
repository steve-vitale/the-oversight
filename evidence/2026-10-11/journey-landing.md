# Playtest loop 2026-10-11 — journey leg 0: LANDING (days 1–14)

Rotation idx 0 → played leg 0. Next: idx 1 (establishment).

## What was played
`scripts/test-journey-landing-20261011.js` — 3 seeds (20261011, 777, 424242),
full 14-day runs as a competent player: one full engage-first conversation per
day with a fresh villager (max 8 turns, real `startConvo`/`convoTurn`/
`endConvo` flow), then eat/drink/sleep through the day clock. 33 full
transcripts captured (`/tmp/journey-landing-transcript-<seed>-day<N>.txt`),
3 System-arrival streams, 3 census JSONs. All 3 seeds completed, zero deaths.

## Village assessment (plain words)
Nobody dies in the landing leg — all 12 alive at day 14 in all 3 seeds. The
villages feel alive: villagers learn (9–13 plants known each by day 14),
trust differentiates honestly (5–44 across the roster; the player sits lowest
at 5 — you're the stranger), teaching fires both ways (Sofia teaches the
village Blackberry, gossip fires: "Joshua isn't pulling weight"), fireside
pairs linger. The pantry starts at ~41–44k kcal ("days of stores, not weeks")
and drains to 0 by day 11–15 in two seeds — the third village hauled well and
never dipped below 23k. The System arrives on day 8 in all seeds
(calendar-gated, `game.js` `checkSystemArrival`: `s.day >= 7`) — the arrival
sequence is genuinely strong writing (unhinged, funny, world-changing: party
system, talking journal, village-wide identification). No contests in days
1–14 (by design; first is ~day 14–21).

## People check (SENSE-TESTING LAW — transcripts read for meaning)
- **Good:** day-1 conversations carry real wants and resolve warmly
  (Tamika sizing everyone up: "some people here are performing, not
  surviving"); the System arrival lands as a beat ("the days need witnesses").
- **Bad — share_news filler loop** (6–7 of 33 convos): NPC opens "something
  happened this morning," every "tell me more" → "That's pretty much all of
  it, honestly" — want stuck at stage 1, then a non-sequitur "good talk!"
  ending. Documented for the convo loop (convo-wants.js, freshly rebuilt —
  not patched here to avoid colliding with Worker A's follow-ups).
- **Bad — ask_favor never concretizes** (777-day1): "I need an extra pair of
  hands tomorrow. Nothing dangerous" repeated VERBATIM 7× in one conversation
  (the sayLine no-repeat invariant isn't catching these re-emissions); the
  task is never named; the want resolved `engaged` though the player never
  committed ("I'll do it" never chosen). Two bugs: contentless favor defs +
  false engagement. Documented for the convo loop.
- **Bad — just_company menu mismatch**: "Mind if I just sit with you for a
  bit?" offers only question-answer menus ("What do you think?") — no
  sit/decline. All 8 just_company convos ended `unresolved`. Documented.
- Agency ledger is dormant: only 1 of 36 villagers had nonzero
  tracking/survival/bravery XP after 14 days. Flagged for the sim loop's
  lever rotation.

## Blanks FILLED (all fixed in worktree, proof-tested)

### F1 — Sleep-crisis gate read the dawn body, not the bedtime body
`sleep()`'s metabolic-crisis gate is documented as a BEDTIME gate ("running on
empty ... at bedtime") and the UI warns "drink and eat before you sleep" — but
it evaluated `(s.hydration||0) <= 0 || (s.kcal||0) <= 0` AFTER the sleep loop,
i.e. after endDay burned the night's metabolism (~58 hydration on a neutral
day). One drink (+50) at bedtime burned to ~0 overnight: the midnight spiral
took its cut (-12 HP, DEHYDRATED) AND the dawn crisis fired (half heal, energy
60, "wrung-out morning") — double punishment, ~5 HP/day bleed for a diligent
player; a no-water variant died on day 11. (The dawn meal could likewise MASK
bedtime starvation.) Fix: capture `bedHydration`/`startKcal` at sleep start
(same pattern as nightWeather/fireLasts two lines above) and grade the gate on
them. The spiral keeps its midnight cut; crisis fires only when you went to
bed truly empty.
Proof: `scripts/test-sleep-crisis-bedtime-20261011.js` — 5/5 ×3 seeds
(A+C were RED pre-fix: bedtime-hydrated woke in crisis; bedtime-starving did
not, masked by the dawn meal).

### F2 — Phantom cast in the System-arrival and homecoming beats
Five beats hardcoded "Mara"/"Jesse"/"Aki" — a fixed cast that doesn't exist in
the generated 12-person roster (the playthrough caught "Mara grabs your arm"
with no Mara in the village). Sites: arrival arm-grab (at Haven),
pendingVillageEvent blurb (away), arrival discussion on return, won-return
greeters, havenSecured milestone. Fix: new `Game._beatCast(n)` draws n
distinct living non-player villagers; beats render via displayName/firstRef
(true names post-arrival — the System labels everyone). The arm-grab now goes
to the highest-trust villager.
Proof: `scripts/test-phantom-cast-20261011.js` — 15/15 ×3 seeds, driving the
real `checkSystemArrival`/`returnToVillage` paths; zero phantom names, every
beat voice verified as a roster member.

### F3 — The player didn't know their own name
Arrival text announces "Joshua Moeller. Physical therapy aide." but
`displayName(playerId)` returned "A person, maybe 50s" until the name was
"learned through talk". Fix: `displayName` short-circuits for the player's
own id — knowledge gating is for other people.
Proof: `scripts/test-player-knows-own-name-20261011.js` — 3/3 ×2 seeds
(stranger gating intact, known names resolve).

## Reachable / fun / winnable
- **Reachable: yes.** The whole leg plays end-to-end; System contact fires;
  conversations fire daily; the win path's homecoming beats render.
- **Fun: mixed.** The arrival sequence and act-0 social emergence are strong;
  ~a third of conversations fizzle (empty share_news, contentless favors,
  menu mismatches) — documented above for the convo loop.
- **Winnable: yes for the leg** (all 12 alive, all seeds). The sleep-crisis
  double-punishment would have killed an unwary player around week 3–4 with no
  clear causal signal — fixed (F1).

## Regressions (on the landed tip, sequential)
- Proof scripts: sleep-crisis 5/5 ×3, own-name 3/3 ×2, phantom-cast 15/15 ×3
- test-survival-attrition-exploit-20261010: 16/16 ✓ (closest suite to F1)
- test-feast-surge-20261010: exit 0 ✓ · test-survival-food-tier1: 3/3 ✓
- test-dialog-gating-20261011: ALL GREEN · test-dialog-leakfix-20261011: ALL
  GREEN · test-dialog-coherence-20261011: 37/37 · test-dialog-stream-20261011:
  43/43 · validate-ontology: 63/63 ✓
- Pre-existing, unchanged on base: test-midnight-burn-honest-20261007 crashes
  (document undefined, harness issue); test-day-night 40/2 identical on base;
  test-survivalist-cold is unseeded-flaky (stale -18/+12 expectations from the
  2026-10-10 attrition retune + RNG wake-with-a-start variance on both trees);
  test-forager-loop has rotating pre-existing economy assertion failures on
  both trees.

## Flags for other loops
- Convo loop: share_news content, ask_favor concretion + false `engaged`
  resolution, just_company menu wiring, sayLine no-repeat not catching
  want-line re-emissions (verbatim 7× repeat).
- Sim loop (lever rotation): daily hydration burn (30+12+16 exert ≈ 58) vs one
  drink (+50) — the 2026-10-10 "one drink covers a quiet day" comment is
  arithmetically false; the gate fix makes it survivable, but the burn/drink
  ratio is a balance lever, not a bug. Villager agency XP is dormant in the
  landing leg (1/36 nonzero after 14 days).
- Live-build 390×844 screenshot pass for the new arrival/homecoming beat
  text is still pending (no browser in this loop's workers).

Merged locally as journey-landing ("merged locally, pending ship" — ship loop
owns pushes). Worktree released; main tree clean.
