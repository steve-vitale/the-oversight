# Journey leg: ENDGAME (days 140+) — 2026-10-11 (run 2)

Rotation 4 → 5. Worktree `journey-endgame`. Stale-lock recovery: none needed
(no lock). Main tree untouched until landing.

## Method

Worker-built harness `scripts/test-journey-endgame-20261011.js` (unchanged
from run 1) + the scale-r3 shared competent policy (ammo-aware gearUp,
telegraph dodge, futility flee — landed on master since run 1). Node,
mulberry32 seeded before module eval, full production script list, text
capture on. 8 fresh seeds (11235, 2718, 1618, 31415, 8675309, 6040, 97531,
24680), DAYCAP=180, CONVODAYS=100,120,140,160. Canon read first: CANON.md,
TABLE.md, MEASUREMENT.md, progression.js (deed gate + crisis beats).

## Village assessment (plain words)

All 8 villages died between day 24 and day 65. None reached the table, none
reached wave 3, none left 'village' rank.

**Seed 11235 — dead day 24.** A Choir Toad killed a villager and the cascade
never stopped: 7 dead, combat and monsters. Crises 4/3 (bar met), w1 deed
6/5, w2 0. The fastest collapse of the set.

**Seed 2718 — dead day 47.** Sickness, starvation, a wound that wouldn't
close, then monsters. 9 dead. w1 6/5, w2 3/5, crises 6.

**Seed 1618 — dead day 47.** Starvation + combat attrition, 12 dead. w1 9/5.

**Seed 31415 — dead day 44.** Monster-heavy: 11 dead, mostly 'monster' and
'villager combat'. 2 contests survived, crises 5.

**Seed 8675309 — dead day 57.** The bloodiest: 14 dead, 'villager combat'
dominant — villagers dying in fights they joined. w1 10/5, w2 4/5.

**Seed 6040 — dead day 52.** Starvation + combat, 9 dead. 3 contests
survived (only seed to meet the contest bar), crises 3.

**Seed 97531 — dead day 65.** The deep run: 10 dead, starvation took three
in the final week. w1 10/5, w2 6/5 (best wave-2 bar), crises 5.

**Seed 24680 — dead day 57.** 15 dead — the largest body count. 'villager
combat' ×4: the village fought beside the player and bled for it.

Common thread: combat deaths (player + villager) and starvation. No seed
stabilized a food surplus; no seed reached regional. The deed bars that
moved: crises (3–6, bar met everywhere — the-siege lever and the reactive
crisis paths are firing), w1 fought (6–10/5), w2 fought (0–6/5). Contests
survived: 0–3 (bar: 2 for lesser, 3 for full).

## Play: waves, fights, the table

- **The table: 0/8.** Deed gate OK: 0/8. tableScene fired: 0 times.
  endingFrame: all 8 **feared** — including seeds that never killed a
  villager. (Frame analysis below.)
- **Wave 3: 0/8** (run 1: 1/8). Wave 4/5: 0/8, unobserved. The kill-gated
  unlocks remain the binding constraint: deed bars fill via fought
  (fleeing counts) but ledger points need kills.
- **Crisis cadence is FIXED for dying villages** (3–6 crises in every run;
  run 1's peaceful-empire sparsity question stands only for villages that
  actually stabilize — none did here). the-siege, first-grave,
  hunger-winter, breach, blood-on-air all observed firing.
- **'villager combat' deaths are prominent** (4+ in three seeds): villagers
  join the player's fights and die in them. The deed-seeking policy takes
  wave fights; the village pays in bodies.

## People check (transcripts read, not counted)

Full-leg convo days (100+) were post-mortem again, so the people check ran
on two fronts: (a) the seed-voice proof's real conversations (sense-read
below), (b) one seed re-run with CONVODAYS=20,30,40.

**(a) Seed-voice openers (from the proof test, real game text):**
- `"About what happened to my taken kin — Have you heard anything? About
  the taken. The pods. Anything at all."` — first-person, clean. ✓
- `"About that news I was bursting to share — You'll never guess what I
  saw by the treeline."` ✓
- `"About whatever's been weighing on me — Do you ever — no. Never mind."
  They don't look away, though. They want you to ask.` — the narration
  sits outside the spoken line after the quote-hygiene fix. ✓
- `"About the pantry run — I still haven't found anyone. Any chance?"` ✓

**(b) Harness transcripts (seed 2718, days 20/30 — harness leaves after the
opener, so these are opener reads):**
- Day 20, Marco (appliance repair tech, trust 69): `"This cut — I can't
  clean it properly one-handed. Will you help me clean it? — anyway."`
  The want is concrete and real. The trailing "— anyway." was the
  dismissal-closer bug (fixed this run — see below).
- Day 30, Denise (exterminator, trust 89): `"I asked Dieter about their
  injury — Dieter's gone. Still need hands. Are you in?"` — the favor
  system remembering a DEAD villager and carrying the obligation forward.
  This is the village-as-continuity working: grief with a task attached.

## Blanks

**Filled (2):**

1. **Seed-note voice (run 1, blank #3).** The unfinished-business seed note
   is composed into the villager's spoken opener, but four notes were
   written in third person: "whatever's been weighing on *them*", "that
   news *they* were bursting to share", "the help *they* asked you for",
   "what happened to *their* taken kin". All four now first-person
   (convo-wants.js). The `repay` notes ("what you promised") were already
   correct — the villager speaking about the player's promise.
2. **Two composition bugs found while proving #1:**
   - Quote hygiene: `"speech." + narration` openers (seek_comfort) were
     dequoted blindly, leaving `...Never mind." They don't look away...
     ask."` — a dangling quote. The composer now closes the quote after
     the spoken part (conversation.js).
   - Dismissal closers after questions: a quick-paced villager's " —
     anyway." / " — comedy." closers could land after a direct question
     ("Will you help me clean it? — anyway." — answering yourself).
     voiceLine now filters ` — `-leading closers after questions;
     statements keep the mannerism.

   Proof: `scripts/test-convo-seed-voice-20261011.js` — 37/37 on 4 seeds
   (20261012, 777123, 424242, 90210). Real conversations driven end to
   end: plant seed via the game's own resolve(), reopen next day, read
   the composed opener. Sense-reads printed for every opener.
   Regressions: test-convo-engine-trust (7/7), test-convo-engine-day1
   (12/12), test-convo-norepeat-fallback-20261011 (9/9). Ontology: 80/80.

**Documented (not fixed — measurement, not levers):**

3. **Frame reachability (run 1, blank #5): answered structurally.** The
   frame is an argmax over ledger entries, and the input channels are
   asymmetric: `might` accrues from every fight/kill (+3/kill, +2/+1 from
   several other paths), while `protected` accrues ONLY on a monster kill
   with party members present (+1) — a 3:1 ratio baked into the SAME
   event. Every monster kill feeds `feared` 3× faster than `beloved`.
   `foodShared` is recorded ONLY via teaching food knowledge and a
   table-waiting beat — `shareFood()` (actual donation) is UNWIRED
   (sibling-sweep 2026-10-08 comment). Probe:
   `scripts/probe-frame-reach-20261011.js` — kind vs deed-seeking on
   identical seeds × 60d: 6/6 runs read **feared**, with `protected: 0`,
   `foodShared: 0`, `killed: 0` in ALL of them. The kind policy donates
   food and never kills, and still reads feared on `might` alone. Beloved
   is reachable in the math (showmanship-heavy pacifist) but the
   protected/foodShared channels are narrow-to-unwired, so in practice
   the frame defaults to feared for any survivor. Whether that's the
   intended feel ("the world reads fighters as feared") or a tuning gap
   is Steve's/design-loop's call — filed here, not pulled.
4. **Wave 4/5 + table reachability: unchanged.** 0/8 table, 0/8 wave 3 on
   fresh seeds (run 1: 0/8, 1/8). Median death ~50d vs ~60d in run 1 —
   seed variance plus a harsher early game on these seeds (day-24
   collapse in 11235). The binding constraints remain kills (ledger),
   survival (~50–65d median vs wave-3 unlock ~day 48 at best), and scale
   (no seed left 'village'). Longsim loop's lever territory.
5. **Crisis sparsity (run 1, blank #2): partially resolved.** Dying
   villages now rack up 3–6 crises (the-siege lever works). The open
   question is only whether a STABILIZED village sees enough crises —
   untestable this run since none stabilized.

## Verdict: reachable / fun / winnable

- **Reachable: NO, at competent play.** 0/8 table, 0/8 wave 3, 0/8 past
  'village' rank on fresh seeds. The road exists (run 1's seed 99 reached
  wave 3; seed 42 reached national) but the bars don't close inside a
  competent lifespan. Binding: kills, survival, scale.
- **Fun: YES, when it fires.** The favor system carrying obligations past
  a villager's death ("Dieter's gone. Still need hands.") is exactly the
  village-as-protagonist continuity the design wants. Crisis beats fire
  with real teeth. The leg's problem is access, not quality.
- **Winnable: not demonstrated.** No seed won. The frame analysis shows
  the endgame's moral read defaults to feared regardless of playstyle —
  worth a design look before the table is reachable, since the table
  prices the run on that same vector.

## Files

- Fix: `src/js/convo-wants.js` (4 seed notes → first-person),
  `src/js/conversation.js` (seed-opener quote hygiene; dismissal closers
  never after questions)
- Proof: `scripts/test-convo-seed-voice-20261011.js` (37/37 × 4 seeds)
- Probe: `scripts/probe-frame-reach-20261011.js` (kind vs deed-seeking
  frame measurement)
- Censuses: /tmp/journey-endgame-census-{11235,2718,1618,31415,8675309,6040,97531,24680}.json (ephemeral)
- Run log: /tmp/journey-endgame-run2.log (ephemeral)
