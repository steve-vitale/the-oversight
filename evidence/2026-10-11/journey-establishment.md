# Journey leg: ESTABLISHMENT (days 14–40) — 2026-10-11

Recovery run for the 09:05 playtest-loop occurrence (died ~1 min after creating
its lock; stale lock deleted by parent, overlap guard patched to
heartbeat-liveness). Reused the dead run's registered worktree
`journey-establishment` (rebased onto master 6cb55528), heartbeat sent,
lock held for the run, rotation 1 → 2.

## Method

`scripts/test-journey-establishment-20261011.js` — node harness, seeded PRNG
before module eval (mulberry32), full production script list, text capture ON.
Competent policy (`scripts/policies/competent.js`: learns plants, teaches,
cooks, eats safe food, fights only with advantage, staffs duties) drives
3 day-parts/day + daily; `driveFights`/`driveContests` from sim-harness.
Conversations on days 15/20/25/30/35/40 with engage-first choice policy,
full transcripts to /tmp. Seeds 20261011, 777, 424242. Canon read first:
CANON.md, CONTESTS.md, MONSTER-WAVES.md, PRESERVATION.md, CONVERSATIONS.md.

## Village assessment (plain words)

**Seed 20261011 — the thriving village.** 12 → 7 alive by day 40. Pantry grew
38k → 44k kcal with 31k preserved (the smoke technique works — cook duty is
smoking the rot-risk surplus). Knowledge 5 → 24 plants, 1 → 10 skills. Wave 2
unlocked day 32 (ledger: 7 points, per-type caps holding). Deaths: 2 villagers
in combat, 2 taken by the night (starvation — see fix A), plus 6 monster kills
by villagers (hushwolf, hummice ×2, nightlight catfish, mirrormoth, nightcourt).
One show aired (museum_of_you, day 16, player pulled as debut). The village
fights its own fights — most wave kills were villager combat, not the player.
Trust 1–67 across the roster; moods mostly lonely. Specialists: a journalist,
electrician, community gardener, carpenter, veterinarian, plumber, ER nurse.

**Seed 777 — the starving village.** 12 → 4 alive. Pantry collapsed 37k →
4.5k kcal, preserved 0. Three starvation deaths (days 26, 27, 33). Wave 2
reached. One real CONTEST fired (whoate, day 16). Knowledge 3 → 14 plants.
Same competent policy, wildly different outcome — the land's productivity,
not the player's skill, decided it. Food pressure is real in this leg.

**Seed 424242 (first run) — the massacred village.** Day 20 killed 4
villagers at once (monster + combat); the original Bearer (Sofia Chen)
starved on day 30 — recorded as "the night" (see fix A) — the mantle passed,
and the village died out on day 40 in combat. Wave 1 never unlocked wave 2
(not enough kills). One show aired. A brutal seed, honestly resolved.

## People check (SENSE-TESTING — transcripts read, not counted)

- **Yi-seo (day 35, 777): a person.** Asks "Have you ever hurt someone? Since
  all this started." Player answers honestly; she receives it with grace:
  "They nod, slow. 'Okay. Thank you for telling me.'" The curious want works.
- **Marcus (day 25, 20261011, old code): broken.** share_news opened with
  "You'll never guess what I saw by the treeline" — the treeline sighting
  was NEVER delivered; instead three identical gossip beats
  ("Okay, so — Lena. Turns out they weren't a what they said — they're a ER
  nurse. Don't say I told you." ×3, names swapped) plus the tension line twice
  verbatim. Grammar bug + template monotony + dropped hook. → Fixed (B, C, D).
- **Wanda (day 25, 777): structurally incoherent.** Player commits to her
  favor ("Count me in." → "Thank you. Seriously — thank you."), then later
  picks small-talk "Can't right now" — and she guilt-trips as if the promise
  was broken: "No, yeah, of course. Forget I asked. They won't forget.
  They'll just stop asking." ×4, while the resolution stayed 'promised' and
  a false 'deflected' memory was written. → Fixed (E).
- Moods read honestly (lonely, steady, scared); trust 1–68 differentiates;
  plants-known 15–23 per villager. Villagers are becoming different people.

## Blanks filled (all in-worktree, proof-tested)

**A. Overnight starvation recorded as "the night" (game.js endDay).** The
branch's own comment says "the overnight spiral is starvation... Cause is
named honestly", the cheat-death call passes 'starvation', and the villager
parallel records 'starvation' — but `playerDeath('the night')` wrote "🕯️
Sofia Chen is dead — the night." Fix: pass 'starvation'. The village mourns
a named cause, not a mystery.

**B. Gossip grammar (convo-wants.js gossipLine).** "weren't a what they said"
→ "weren't what they said" when no lie known; a/an agreement ("an ER
nurse"); occupations lowercased mid-sentence ("a veterinarian").

**C. News-type freshness (convoWantNews rewrite).** Each "tell me more" now
records the delivered news type on the want; a type never repeats inside one
conversation; when all types are spent the thread exhausts honestly
("That's everything I've got.") instead of looping.

**D. Hook promise (share_news opener).** The opener records its hook; the
first news delivery answers it — the treeline hook is followed by the
sighting, "something happened this morning" prefers memories/live events.

**E. Stage-blind favor handlers (convo-dialogue.js).** Post-commit "I can't"
no longer fires the refusal guilt-trip or writes a false 'deflected' memory;
post-commit "Count me in" no longer re-fires the thank-you + trust (was a
trust farm) — it hears the repeat honestly ("I know — you already said.").

Proof: `scripts/test-journey-establishment-fixes-20261011.js` — 75/75 across
3 seeds (starvation cause ×5, grammar ×8, freshness ×4, hook ×1, stage ×9,
per seed). Adjacent suites green: dialog-coherence 37/37, dialog-grammar
39/39, dialog-ui-fix 40/40, dialog-gating ALL GREEN.

## Blanks documented (not fixed this run)

1. **Pilot episode unimplemented.** CONTESTS.md: "The first challenge is a
   'pilot episode' — diegetic excuse for jank, and the System says so out
   loud." No "pilot" string exists in the contest system — the first contest
   is just a normal contest. Canon promises it; code doesn't have it.
2. **Contest scheduling thin for the leg.** 1 event per seed in 40 days
   (2 shows, 1 contest across 120 days). The 2/week budget is a cap, but the
   establishment leg's "first challenge ~day 14–21" beat fired as a contest
   in only 1 of 3 seeds. Worth a lever look in the long-sim loop.
3. **Seed 777 starved under competent play.** 3 starvation deaths, pantry to
   4.5k. Possibly working-as-designed (food pressure is the thesis), but the
   variance between seeds (44k vs 4.5k pantry) is enormous — flag for the
   food lever rotation.

## Verdict: reachable / fun / winnable

- **Reachable:** yes. Village routines, specialists, pantry growth, wave-2
  unlock, shows/contests, the mantle passing — all fired in normal play.
  Except the pilot episode, which doesn't exist yet.
- **Fun:** yes, with the conversation fixes. Villagers ask hard questions,
  remember promises, fight their own fights, starve when the land fails.
  The pre-fix transcripts had real rot (grammar, repetition, incoherent
  guilt-trips); the fixed paths are verified by proof, not just by reading.
- **Winnable:** the leg doesn't end the game, but all three seeds show a
  village that can stabilize (or honestly fail): food → preservation →
  knowledge → wave progression is a working engine. One seed's village died
  out in combat — a legitimate loss, not a softlock.

## Files

- Harness: `scripts/test-journey-establishment-20261011.js`
- Proof: `scripts/test-journey-establishment-fixes-20261011.js` (75/75 ×3 seeds)
- Fix: `src/js/game.js` (starvation cause), `src/js/convo-wants.js`
  (gossip grammar, news freshness, hook promise), `src/js/convo-dialogue.js`
  (stage-aware commit/cant)
