# Journey leg: ESTABLISHMENT (days 14–40) R4 — 2026-10-14 (19:45 run)

Rotation idx 1 → played leg 1 (fourth establishment pass). R3 (committed
2026-10-14, never executed) is executed here as R4: the RENDER_LADDER pilot
it pre-registered. Re-baselined on local master 359b424f. Canon read:
CANON.md, PRESERVATION.md, BEAR.md, CONTESTS.md, MONSTER-WAVES.md (+ r3
evidence note). The r3 header claimed the three fat-bearers are "all
trap-catchable per animals.json" — that claim is FALSE (see the blank).

## Pre-registered (MEASUREMENT.md §§9–12, 14)

- Question: does the preservation ladder past smoking (render fat →
  pemmican) fire end to end in the establishment window when the player
  deliberately works it? R2 measured 0/4 because the pinned competent
  policy never calls renderFat/makePemmican; R2's metric review authorized
  the RENDER_LADDER harness knob (near a fire, render raw fat, make
  pemmican from sets). The question is whether the MACHINERY fires, not
  whether the pinned policy would choose it.
- Interesting: render batches >0 or pemmican bars >0 on ≥1 seed; OR
  confirmed silence with the knob ON = a real game-side blank.
- Seeds 61, 82, 103, 124 (same as R1/R2, comparability). 40d, death-aware
  (all four villages alive at day 40; no tail needed).
- Policy: competent, PINNED. Knobs: RENDER_LADDER=1, INVITE_PARTY=1,
  FAVOR_ACCEPT=1, STALL_BREAK=1.
- Binding metrics: M1 render batches >0 on ≥1 seed; M2 pemmican bars >0 on
  ≥1 seed; M3 traps set (ANY path) >0 on ≥2 seeds; M4 codex tale-share
  ≥25% on ≥1 seed; M5 ≥2/4 villages alive at day 40 with pantry>0; M6
  ≥20 full transcripts sense-read, 0 senseless flags.

## What was played

`scripts/journey-establishment-r4-20261014.js` (copied from the un-run
r3 harness, paths re-pointed r3→r4). SEEDS=61,82,103,124 DAYS=40. 32 full
transcripts, 4 census JSONs, 4 system-contact files, run log:
`hidden_files/evidence/2026-10-14/journey-establishment-r4-*`.
`scripts/test-est-pit-trap-learn-20261014.js` — proof test for the blank.

## Village assessment (plain words)

**Seed 61 — the fat village.** 12 → 11 alive. Pantry climbs all month
(47k → 124k kcal: 62 smoke-line events, 2 preservers staffed). NPC
trapline hums (23 npc_trap, 2 snare lessons, 6 villagers know the wire).
One party join (Jorge). One contest (lottery). Day-27: four hummice die
in one fight — a nest cleared blow-by-blow, no villager losses that day.

**Seed 82 — the fighting village.** 12 → 11 alive (one villager lost on
an expedition day 34 — 'bright_idea'; one to a nightlight catfish).
Richest monster-codex life: 10 codex entries, 6 killer tales told
(mirrormoth, ducks, glasswing, bulldozer — Maya is the village's
monster-killer). 3 contests (hide, confession, duel). Pantry 45k,
preserved 19k + ready 3.5k. Snare knowledge spreads (3 holders).

**Seed 103 — the lean village.** 12 → 9 alive. Three monster deaths
(days 19, 29 to monsters; nightcourt + hushwolf kills by villagers).
Pantry smallest (12k raw, 0 preserved — 138 smoke-line events but the
village eats the buffer; 0 specialists staffed). Still: 4 contests
(witness, auction, cookfight, sorting — the widest show spread) and the
best codex tale-share (50%). One villager knows 0 plants — a stranger
who hasn't learned the ground yet.

**Seed 124 — the whole village.** 12/12 alive. Everyone knows 15–22
plants. 3 contests (pit, quiet, auction). Pantry 39k (18k preserved).
Player traps crafted and set (3/3) alongside NPC snares.

Nobody starves on any seed (0 starvation autopsies). Deaths are all
teeth and claws — wave-1 monsters kill villagers who fight them, and
villagers fight their own fights (nightcourt, hushwolf, hummice kills
by Lena, Nadia, Catalina, Maya, Sofia).

## People check (SENSE-TESTING — full transcripts read)

32 transcripts, 0 non-instrumentation sense flags (no verbatim repeats,
no silent lures, no leaked "(last time)" internals). Three read in full:

- **61-day25, Aroha (curious):** asks the real question — "Do you believe
  in anything? Now, I mean. After everything." The answer lands
  ("That's not naive. That's load-bearing."). Gossip is specific and
  slightly unhinged ("Raj talks to the garden. The garden listens. I've
  seen it."). Closes engaged, honestly.
- **103-day25, Ivy (ask_favor, fromSeed):** the R3 deferred-favor fix
  holds — the betrayal lure preempts and is SPOKEN ("Walk with me? I
  want another pair of eyes on something."), the seeded sickness-favor
  resolves honestly ("Never mind the sickness I'm fighting — we got it
  handled"), deflects with a memory planted, no phantom promise.
- **82-day3, Tyrone (deliberate nonverbal sit, stranger):** "I'm not
  good at the talking-to-strangers part." Empathy lands, shoulders ease,
  a short honest exchange, "I'm glad we talked. I think. I'm still
  deciding." Wants vary across the village (curious, ask_favor, repay,
  just_company, seek_taken, share_news) — nobody is a menu.

Minor grit (documented, not fixed): transcript headers show
occupation=?/temperament=? — the harness's person() lookup, not the
game; the game itself renders them fine.

## Metric verdicts (§14 binding)

- M1 render batches >0: MISS — 0 on all 4 seeds.
- M2 pemmican bars >0: MISS — 0 on all 4 seeds.
- M3 traps set (any path) >0 on ≥2 seeds: PASS — 4/4 (player snares on
  82/124; NPC trapline on 61/82/103; snare lessons firing).
- M4 codex tale-share ≥25% on ≥1 seed: PASS — 50% (103), 33% (61).
- M5 ≥2/4 villages alive, pantry>0: PASS — 4/4, pantries 12k–124k.
- M6 ≥20 transcripts, 0 senseless: PASS — 32, 0 flags.

M1/M2 are NO-GO per §14 — recorded as a miss, not re-scored.

## Metric review (§14)

The interesting finding fired in the pre-registered alternate form:
confirmed silence with the knob ON = a real game-side blank. The ladder
machinery (renderFat, makePemmican, the blind-teaches-render rule, the
pemmican gate on knowsTechnique('render')) is all implemented — but raw
fat NEVER enters any inventory on any seed (2 mentions of "fat" in the
whole run log, neither a drop). The fat supply is what's missing, and
the r3 header's "all trap-catchable per animals.json" claim is wrong:

- wild_boar: catchable only by pit_trap — and pit_trap was UNLEARNABLE
  (see the blank: fixed this run).
- javelina: method ["bow","trap"] but NO trap recipe catches it — the
  "trap" method is a false promise. (11 other animals share the pattern;
  documented, not fixed: bison, elk, alligator, python, mink, bat, owl,
  heron, chipmunk, coyote, pronghorn.)
- black_bear: method ["bow","spear"] — bow/spear hunting only, no trap.

Next run's metric revision: M1/M2 should gate on fat-bearer
kills/traps/butchers first (fat supply), then render/pemmican. The
knob proved the knob works; the game starves it of fat.

## Blank FILLED: pit_trap was unlearnable (unfireable beat)

The only fat-bearing trap had no learning path: the witnessed-catch
grant (game.js:3250) requires a trap already set, but craft() enforces
L1+ knowledge — a chicken-and-egg no one can win. No book granted it,
no village codex carried it, no teacher taught it. The entire
boar-retrieval beat (goring risk, L3 spear-from-above, 96-tick dig
cost, "a boar in a pit is a butchering problem with teeth") was
written machinery that could never fire.

**Fix (src/data/books.json):** trappers_handbook now grants pit_trap
(the field book for trappers, already reachable via wild ruin shelves
per the 2026-10-10 TRAP REACHABILITY fix); description updated to
"a slim volume on snares, deadfalls, and pit traps". Follows the exact
readBook → grantKnowledge('recipe', L3) path; craft's L1+ gate opens.

**Proof:** `scripts/test-est-pit-trap-learn-20261014.js` — PRISTINE=1:
2 pass / 3 fail (book lacks pit_trap, readBook grants nothing,
craft refuses). Fixed: 5/5 (readBook → pit_trap L3, craft builds the
trap). Real RED → GREEN.

## Regressions

- test-est-pit-trap-learn-20261014: RED 3 fails pristine → GREEN 5/5
- test-structural-traps-proof: 27/27 ✓
- test-dialog-coherence-20261011: 37/37 ✓
- test-favor-system-20261011: 30/30 ✓
- test-landing-spoken-lure-20261012: 10/1 — same 1 fail on pristine
  master (pre-existing, unrelated)
- test-books-depth-20261007: 457/2 — both fails are tallow_and_keeping
  (untouched book; pre-existing)
- scripts/validate-ontology.js: 96/96 ✓
- scripts/validate-data.js: crashes identically on pristine master
  (pre-existing validator bug, schemas stale — AGENTS.md)

## Reachable / fun / winnable (the leg)

- REACHABLE: yes — routines, specialists, pantry growth, 1–4
  contests/seed with the pilot aired on all 4, wave-1 fights the
  villagers fight themselves. The render→pemmican ladder is reachable
  in machinery but starved of fat — the pit_trap fix opens the first
  real path (find the Handbook in a wild ruin → read → dig → boar).
- FUN: the villages read as villages — favors owed and kept, shy
  strangers, monster-killers with reputations, shows that interrupt.
  Zero senseless dialogue in 32 transcripts.
- WINNABLE: the leg doesn't end the game; all four villages reach day
  40 alive with food in the pantry. The establishment window does its
  job — nobody starves, the danger is teeth, and the table road stays
  open downstream.
