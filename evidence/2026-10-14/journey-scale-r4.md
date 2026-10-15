# Journey SCALE r4 — run note (2026-10-14, oversight-playtest-loop)

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sim

- **Leg:** 3 (scale) — days 80–140: regional → national, hierarchy, the table
  approach. Base: master HEAD `448c9124` (sim-siegeroster coordinator repair).
- **Question:** (a) Does r3's propose-verb-gap headline still hold on the
  current tip? R3 (tip 44da35cf): competent never calls proposeLink, the
  engine forms no unasked link — 0 links / 0 national / 0 table on 8/8
  competent runs (baseline + armed). (b) Fill r3's blank #2: seek_comfort
  response pools are tiny (dlg:stay:lines=3, dlg:stay:deepen=2,
  dlg:comfort:lines=3) and two villagers' comfort sequences recited verbatim
  (Ruby d85 ≡ Wolfgang d105) — expand pools and sense-test the new lines in
  full transcripts.
- **Primary metric:** links formed + nationalLive staged across 8 runs.
  Secondary: comfort-sequence verbatim-repeat rate (0 verbatim-identical
  3-stay sequences across captured comfort transcripts after the fix).
- **Seeds:** 11, 22, 33, 44 (house convention). **Policies:** competent
  baseline ×4 + competent-armed (COMPETENT_TALK=1,
  COMPETENT_SURPLUS_FEAST=1) ×4. **Horizon:** 150d, death-aware
  (stop dead/scattered villages, +10d tail max).
- **Interesting bar:** any link formed on bare competent (contradicts r3 →
  investigate immediately); comfort fix RED→GREEN (deterministic seeds,
  sample-gated) with two identically-driven villagers no longer reciting the
  same stay sequence.
- **Metric binding (§14):** judge against this header exactly. A miss is
  NO-GO, never re-scored against a friendlier metric mid-run. Metric doubts
  go under "metric review" for the NEXT run.
- **Canon read:** docs/CANON.md, docs/SCALE.md (excerpt), docs/CONVERSATIONS.md.
  docs/TABLE.md not directly touched this run (no table events expected on
  competent). docs/DIRECTIVES.md standing rules honored (feel over math, no
  fabricated shared history, knowledge-gating, one mobile screen).

## Pilot results (8 runs, tip 448c9124)

| seed | arm | days | end | rank | beats | links (70/85/100/120) | vdeaths |
|---|---|---|---|---|---|---|---|
| 11 | baseline | 135 | village-lost | village | 0 | 0/0/0/0 | 16 |
| 22 | baseline | 116 | village-lost | village | 0 | 0/0/0/— | 16 |
| 33 | baseline | 152 | survived | village | 0 | 0/0/0/0 | 13 |
| 44 | baseline | 152 | survived | village | 0 | 0/0/0/0 | 3 |
| 11 | armed | 55 | village-lost | village | 0 | — | 13 |
| 22 | armed | 124 | survived | village | 0 | 0/0/0/0 | 15 |
| 33 | armed | 69 | survived | village | 0 | — | 5 |
| 44 | armed | 86 | survived | village | 0 | 0/0 | 10 |

Wall numbers: links 0/8, beats 0/8, national 0/8, table 0/8, wins 0/8,
rank never left `village` (rankDays={} everywhere), tribute/national/wave4/
wave5 markers 0. Median survival 85d. Moot markers 4 (one petitioner moot
on seed 11 the policy never called — R1's finding reprised).

**Interesting bar (a): NOT MET — the headline holds.** `competent.js` still
has no `proposeLink` call on this tip (only callers: app.js player UI +
courtship policies belongseek/leadcourt/winseek/scalecourt/fourthlink/
killroad/courtkill). The engine still forms no unasked link. 8/8 runs: zero
links at every snap, zero beats, zero national. R3's reconciliation stands
unchanged: verb gap, not survival gap.

## Village assessment (plain words)

**Seed 44 baseline — the flourishing village that never looked outward.**
Nine alive at day 152, three deaths all told (combat, monster, one "Static").
**Kai** the baker, **Divya**, and **Leandro** all at trust 90 with 40–45
plants each — a deep bench of knowers; the village knew 397 plants between
them. This village was *ready* for the scale game in every dimension except
the one that matters: nobody ever proposed anything to anybody.

**Seed 33 baseline — the survivor.** Seven alive at 152d, 13 dead.
**Tariq** (trust 90, 40 plants), **Ursula** (90, 26), Deshawn (67, 17).
Monster-heavy attrition (6 monster, 4 combat, 3 sickness). Leadership is
trust, not title — the same shape as r3.

**Seed 11 baseline — the sick ward (lost d135).** Three alive at the end,
16 dead: 6 sickness, 5 combat, 2 "a wound that wouldn't close", 2
starvation, 1 monster. Disease and attrition, no single catastrophe — the
attrition cluster persists on this tip.

**Seed 22 baseline — the violent one (lost d116).** One villager left,
16 dead: 7 combat, 3 monster, 3 contest, plus one killed by "a dog-shaped
silence at the treeline". On these seeds combat still decides who gets to
play the diplomacy game at all.

Leadership everywhere is trust, not title. Misery reads as grief and
attrition, not hunger. What's missing, unchanged: any sense of the wider
world — no traveler rumor became a bond, no beat pointed at the ladder.

## People check (SENSE-TESTING LAW — full transcripts read)

28 transcripts captured (~/workspace/journey-scale-r4/; armed runs that died
before d85 have fewer). Three read in full:

- **Kai d105 (seek_comfort, baker, trust 90, fromSeed):** the blank made
  flesh. Opener has cross-conversation continuity — "About whatever's been
  weighing on me — Do you ever — no. Never mind." They don't look away,
  though. They want you to ask. Comfort → stay → stay → stay → deepen:
  stages 1→2→3, resolution=comforted. BUT the stay sequence is EXACTLY the
  r3 verbatim script: "Nice. Sit. The fire's warm." / "Good. Company's
  company." / "Stay as long as you like." — a THIRD villager reciting the
  identical order. The want arc works; the middle is a shared script.
- **Aisha d85 (curious, nurse, trust 54):** opens with unfinished business
  ("We never did finish talking about their secret — that was 9 days back.
  Still on your mind?"), teaches four plants with varied, human reactions
  ("And I've been walking past it for weeks.", "I'll remember that one.",
  "I never knew that."), ends naturally ("I should go. You know where to
  find me."), resolution=engaged. A person. ✓
- **Amara d125 (ask_favor, ESL teacher, trust 90):** "I hate to ask this,
  but I can't shake it. I'm feverish, a cut gone hot and angry. I need
  help. Please." → "It's not just the cut anymore, it's in the blood, I
  can feel it climbing. I need someone who knows wounds." Commit →
  "Thank you. Just — thank you. I'll be here, resting." resolution=promised.
  A real want, honestly engaged. ✓

Verdict: scale-era villagers act like people — wants are real, options
engage honestly, endings resolve/plant/owe. No fabricated shared history,
no filler loops, no static menus. The comfort middle was a content-thinness
blank — now filled (see below). One further observation, DOCUMENTED not
fixed: within a single conversation, the teach-response pool cycles
visibly on 5+ teaches (Amara's: "And I've been walking past it for weeks."
twice) — same thinness class, smaller stakes.

## Blanks

FILLED (this run — r3 blank #2):

**Comfort pools expanded** (`src/js/convo-dialogue.js`):
- `dlg:stay:lines` 3→7, `dlg:stay:deepen` 2→5, `dlg:comfort:lines` 3→7.
- 11 new variants in the gritty-warm villager voice — no filler, no
  fabricated shared history. Originals stay first (tone kept, mourning-pool
  template from deepening r9).
- Proof `scripts/test-comfort-pool-20261014.js`: RED-verified on pristine
  code (19 passed / 12 failed — pools at 3/2/3, 3-stay universe size 3 on
  all seeds), GREEN 31/31 post-fix (pools 7/5/7, 3-stay universe 6,
  divergence 3/3 seeds, originals preserved, no unfilled {braces}).
  Deterministic (mulberry32 via loadGame), sample-gated.

New lines, sense-verified (full variant lists printed by the proof):
- stay: "They lean back on their hands. 'Wind's up tonight. Good night to
  not be walking.'" / "They pat the ground beside them. 'Here. It's dry.'"
  / "'Careful — that log's hotter than it looks.' They shift it with a
  boot, making space." / "'Mm.' They don't look up from the fire, but they
  nod you down. 'Sit.'"
- deepen: "'I keep count of who's at the fire. I don't mean to — I just
  notice the gaps.'" / "'Some nights I'm fine. Tonight I'm not. That's the
  whole story.'" / "'Don't tell the others —' a glance sideways. 'I don't
  know if I'm doing any of this right.'"
- comfort: "'Most days I don't think about it. Today I am. Appreciate you
  noticing.'" / "A long exhale. 'I'll get there. Just needed a minute where
  I didn't have to be fine.'" / "'Heh. Nobody's asked me that in a while.
  ...I'm alright. Getting there.'" / "They shake their head, then nod —
  both true at once. 'Talk to me a bit. That helps more than anything.'"

DOCUMENTED (not fixed — design/tooling, outside this run):

1. **The propose verb gap (r3's headline, re-verified — for Steve):**
   competent has no link-forming verb; the engine forms no unasked link.
   Options: (a) competent-policy propose layer, (b) villager-initiated
   proposals, (c) rely on the scaleDiscovery beat-4 pointer. Steve's call —
   flesh-out loops are working it (PROPOSELAYER/WARROAD arms). NOT built
   here per instructions.
2. **Teach-response pool cycling** within a single long conversation
   (5+ teaches → one repeat). Same thinness class as the comfort blank,
   smaller stakes — future blank.
3. **Rotted proof scripts (reprised):** `test-conversation-dialogue-20261006.js`
   FATALs ("Game.dialogueBeatKind is not a function") — tests APIs removed by
   the 2026-10-11 dialogue rebuild; script is from 2026-10-07. Same rot class
   as r3's rotted scale scripts (`test-scale-ladder-20261010.js`,
   `test-national-shapes-20261010.js`). Tooling backlog.

FILLED (tooling): `scripts/journey-scale-r4-20261014.js` — r3 harness
renamed, transcripts → ~/workspace/journey-scale-r4/ (survives /tmp wipes).

## Regressions (node proof-script suites, closest families)

- test-comfort-pool-20261014 (new): 31/31 ✓
- test-convo-beats-20261006: 25/25 ✓
- test-convo-cycle-norepeat-20261014: 40/40 ✓
- test-convo-norepeat-fallback-20261011: 9/9 ✓
- test-convo-deflect-cycle-20261012-r6: 13/13 ✓
- test-favor-system-20261011: 30/30 ✓
- test-crisis-outbreak-convo-20261014: 24/24 ✓
- test-dialog-gating-20261011: ALL GREEN ✓
- test-dialog-coherence-20261011: 37/37 ✓
- test-conversation-dialogue-20261006: FATAL — pre-existing rot (above),
  not a regression. (No jest suites exist in this repo — the test family is
  node proof scripts; no concurrent processes were run.)

## Reachable / fun / winnable (scale leg, days 80–140, competent policy)

- **Reachable:** NO for a competent player — 0/8 formed a link, 0/8 reached
  regional, national/table never staged. Reachable only on courtship
  policies (R2: 3/5 national) or with a propose driver (deepening r10).
  The gate remains the missing verb, not the missing ladder.
- **Fun:** YES where it fires (R2's beats; r4's transcripts — Amara's
  feverish plea, Kai's grief, Aisha's unfinished business). The
  village-scale life is rich; the comfort middle is now richer.
- **Winnable:** NO on competent — 0/8 national, 0/8 table, 0/8 wins.
  Unchanged from R1/R3.

## Metric review (§14)

- Primary (links formed / nationalLive staged): 0/8 and 0/8 — the metric
  held, honest. The absence is the finding; no re-scoring.
- Secondary (comfort verbatim-repeat): pre-fix the pilot caught a THIRD
  verbatim recitation (Kai d105 ≡ Ruby d85 ≡ Wolfgang d105); post-fix the
  proof shows 0 verbatim-identical 3-stay sequences across driven villagers
  (3/3 seeds, universe 6). Met.
- Interesting bar (a) was correctly specified as "contradicts r3 →
  investigate" — it didn't fire. The headline stands.
- For the next run: if a propose layer ever lands on competent, the same
  8 seeds are the clean before/after (r3's metric-review carry-over).

## Telemetry deviation check

`telemetry-check.js` vs `telemetry-baselines/scale.json` (R2's courtship
runs): 3 LOUD lines, all EXPLAINED by the policy split, no baseline roll:
- `beats 5→0`: courtship proposes links → beats stage; competent proposes
  0 → none. Expected — this IS the r3/r4 headline.
- `markerCounts.tribute 10→0`: tribute flows only on active links;
  competent has none. Expected.
- `markerCounts.moot 0→4`: one petitioner moot on seed 11 the policy never
  called (R1's finding reprised). Expected on these runs; watched.

## Convergence update

scale-onramp: CONVERGING (unchanged). Competent national 0/8 on the current
tip 448c9124; the wall's face for the competent policy is the propose-verb
gap — now re-verified on two tips. The axis moves only when a non-courtship
policy reaches national organically (a propose layer or villager-initiated
proposals — Steve's call; flesh-out loops are working it).

## Files

- Harness: `scripts/journey-scale-r4-20261014.js` (r3-derived; transcripts
  to ~/workspace/journey-scale-r4/)
- Proof: `scripts/test-comfort-pool-20261014.js` (RED→GREEN 31/31)
- Fix: `src/js/convo-dialogue.js` (24 insertions: pool expansions + comments)
- Evidence JSONs (repo): `evidence/2026-10-14/journey-scale-r4-competent-{11,22,33,44}.json`,
  `evidence/2026-10-14/journey-scale-r4-competent-armed-{11,22,33,44}.json`
- Transcripts: ~/workspace/journey-scale-r4/ (28; not /tmp)
- Run logs: ~/workspace/journey-scale-r4/pilot-baseline.log,
  ~/workspace/journey-scale-r4/pilot-armed.log
- This note: `evidence/2026-10-14/journey-scale-r4.md`
