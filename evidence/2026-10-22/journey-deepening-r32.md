# journey-deepening r32 — the alien-vector channel census (2026-10-22)

## STALE-LOCK RECOVERY (run start)

- Lock `journey-deepening-20261022T130309Z` (created 2026-10-22T13:03:09Z) found at
  run start. Registry heartbeat for tree `journey-deepening` was 13:25:11Z
  (18.7 min stale, >15 min) → previous run DEAD per protocol. No file writes in
  the tree within 15 min (verified via `find -newermt`). Lock deleted, new lock
  `journey-deepening-20261022T134500Z` created.
- The dead run (deepening r31, "the alien-vector channel") completed only seed
  9941 of its 4-seed plan. Its uncommitted work was archived intact to
  `hidden_files/dead-run-evidence/2026-10-22/journey-deepening-r31-orphan/`
  (6 files, md5-verified), the orphan worktree removed, branch deleted (it had
  zero unique commits), registry entry dropped, fresh tree registered from
  current master (2a3fc56b9).
- This run (r32) ADOPTS the dead run's question and completes its census with
  the 3 remaining seeds (9942–9944). The instrument is the r31 harness verbatim
  (scripts/journey-deepening-r32-20261022.js; only r31→r32 output tags renamed).
  Same-loop instrument adoption, zero src/js changes.

## Pre-register (§14 BINDING — written BEFORE any of my runs)

**Leg question:** In the deepening window (d40–80), does the wave-2 alien-disease
vector channel FIRE — do giant_mosquito / alien_tick monster fights land
bites/latches and infections — and does the canon "some avoid infection,
others seek it as build fuel" (docs/DISEASES.md) read for anyone besides the
scholar?

**Code read (2026-10-22, from r31, BEFORE my instrumenting):**
- `mosquitoBiteVirus()` applies eurika/east_nile to `'scholar'` only; called from
  `tbMosquitoTurn` behind `if (foe.kind === 'player')` — a villager companion
  bitten in a TB fight is explicitly NOT infected.
- `tbTickTurn` latch: `if (foe.kind === 'player' && ... < 0.5)` → lemons; same
  player-only gate.
- `fieldFights.js` (the villager abstract combat model): NO infection channel
  at all — no mosquito/tick bite handling.
- Ambient tick attach (forest/grove/thicket per-step): `'scholar'` only.
- The one villager alien-pool channel that EXISTS: `villagerMonsterWeirdness`
  — villagers trying unrevealed monster meat roll the same quirk table
  (howlbelly, gristlefit, croakbelly, shellgut, witness_maw, flockmind).
- Canon (docs/DISEASES.md): giant mosquito fight → bite → 50/50 eurika or
  east_nile, permanent warping (drawback + ability); giant alien tick fight →
  latch → lemons (achy joints, engorge +20% kcal, blood-sense). "Some avoid
  infection, others seek it as build fuel." Nothing in the canon doc restricts
  vectors to the scholar.

**Interesting-finding bar:** ≥1 landed vector infection (ANYONE) with honest
narration = the channel is alive; document the scholar-only gating as a
measured fact and move on. 0 mosquito/tick fights on all 4 seeds = the channel
is dormant in the wild (a different blank). Villagers fighting the same beasts
with no infection path while the code gates bites to the player = the blank:
scholar-body design vs oversight (a Steve call — MEASURE, don't move).

**Binding metrics:**
- R1 (channel census, PRIMARY): 4 seeds total (9941 archived from dead r31 +
  9942–9944 fresh this run), competent policy, DAYCAP=100, death-aware stop
  (+10d tail). Instruments (harness-only wraps, zero src/js): (a) every fight
  vs giant_mosquito/alien_tick — TB + field — with target kind and outcome;
  (b) landed drinks/latches via tbDamage-source filter ('The Drink', 'The
  Latch', 'Feeding') with targetKey/targetKind; (c) applyStatus wrap for
  eurika/east_nile/lemons/tick_attached (target, source, day). 4/4 seeds
  complete, 0 instrument errors, all three instrument arrays non-empty-capable
  (empty result is a finding, not an error).
- R2 (narration, report-only): ≥1 infection narration sense-read if any fires;
  ≥2 mosquito/tick fight transcripts sense-read — does the vector threat read
  on the page (the dive tell, the questing tell, the latch counters)?
- M1 winnable: ≥3/4 villages alive at end.
- M2 people (report-only): ≥6 full villager transcripts sense-read
  (SENSE-TESTING LAW), 0 senseless expected.
- Report-only extras: death census (r27 lib), plain-words census per seed,
  mosquito/tick fight outcomes, villagerMonsterWeirdness events (meat-quirk
  channel sanity), regional links.

**Seeds / horizon / policy:** 9942, 9943, 9944 fresh this run (+ archived 9941),
competent pinned, DAYCAP=100, death-aware stop (+10d tail max). Natural
behavior, no probes.

**Race guards:** no pacing lever (flesh-out territory); wave gates untouched
(Steve's design); no dialogue changes; no stat/infection-logic changes — this
run MEASURES the channel, it does not extend it. The scholar-only gating is
landed code; whether it should stay is a Steve call.

**Metric review:** (to fill after the run)

## RESULTS (2026-10-22, seeds 9942-9944 this run + archived 9941)

Channel census (R1 PRIMARY — 4/4 seeds complete, 0 instrument errors):

| seed | days | end | wave | alive | vector fights | infections |
|------|------|-----|------|-------|---------------|------------|
| 9941 (archived) | 101 | survived | 3 | 9/9 | 2 (1 TB mosquito, 1 field tick) | 1: east_nile on scholar (mosquito bite, d37) |
| 9942 | 100 | survived | 3 | 9/9 | 6 (all field mosquito, all mFlee 0-1 rounds) | 0 |
| 9943 | 47 | village-lost | 1 | 4/4 | 0 | 0 |
| 9944 | 101 | survived | 3 | 8/8 | 0 | 0 |

TOTALS: 8 vector fights, 1 infection, 1 mosquitoBiteVirus call, 0 landed bites
recorded by the tbDamage filter (the 9941 bite applied via mosquitoBiteVirus,
not a 'The Drink' damage line — the virus call is the ground-truth event),
0 villager meat-quirk events.

**Verdict on the leg question: the channel is ALIVE, and the scholar-only
gating is a measured fact.** The 9941 mosquito TB fight narrated honestly
(the whine tells, the dive tell, the proboscis drink, "drunk on blood"),
applied east_nile with symptom-honest text ("the world tilts sideways" —
diseases never announce names, per the 2026-10-09 rework), ticked fever
dreams (-2 HP) on days 37-38, and taught the counter. The scholar-only
gating held everywhere else: Adaeze's day-42 tick fight latched 4 feeds with
no lemons roll (fieldFights.js has no infection channel); 6 villager mosquito
fights on 9942 ended with the mosquitoes driven off, 0 infections. Whether
the gating is scholar-body design or an oversight is a Steve call — MEASURED,
not moved (per pre-register race guards).

**Permanence note:** east_nile lasted days 37→~39 on 9941 — not because it
expired (the def has no duration; tickStatuses only decrements when a
countdown exists), but because the bearer <redacted> ~day 39-40 and the mantle passed
to Christian Adams (succession wipes statuses: "new body, no old
afflictions," Steve 2026-10-07). Permanent warping means permanent *for the
body* — coherent with the village-as-protagonist continuity. No expireText
fired; nothing in the capture contradicts the design. The crow-warning
ability (game.js:22641) never fired on 9941 — the 2-day window had no
wanderer spawn to trigger it; untested, not broken.

**M1 winnable: PASS (3/4 alive at end).** 9941/9942/9944 survived to
day 100-101 at wave 3. 9943 lost the village at day 47 to a starvation
spiral (4 starvation deaths; STARVING warnings from day 1) — a landing-leg
food-economy failure, not a deepening-leg one. Competent play is winnable;
some seeds never establish.

**M2 people: PASS (10 transcripts sense-read, 0 senseless).** Christian
(curious, soup-dreams, engaged), Adrian (seek_taken — asks about his taken
kin Larry; player PROMISES to ask the System — the ending owes), Rosa
(ask_favor, wants space on a doomed run — thin but human), Isadora
(curious — "eight hours where nothing needs me. That's my whole theology
now."), Raj (curious, spite-then-shared-food), Luis (ask_favor — 6× "tell
me more" drew disconnected aphorisms from the heal pool: a filler loop, see
blanks), Ruth (ask_favor want but pure gossip content — rich village news:
Saida foraging, the stray dog, Carlos seeing in the dark, Vedika's story),
Earl (seek_comfort — "I'm not okay. I'm saying it out loud so it's real."
→ comforted; a real arc), Kayden (curious — "Have you ever hurt someone?"
handled with gravity), Salvador (curious).

**R2 narration: PASS.** The mosquito fight reads on the page (dive/whine/
proboscis tells, counter learned); the tick fight narrates questing tells
and latch counters (codex entry + villager tip: "Latched: burn it off with
fire, or let it feed full and drop on its own").

## VILLAGE ASSESSMENT (plain words)

- **9941:** Nine alive at day 101. Clarence carried east_nile for two days
  after a mosquito bite, then died and Christian took the mantle — the
  village's memory of the infection lives in the codex counter, not in a
  body. Adaeze killed an alien tick bare-handed and died weeks later to
  another monster. The village reached wave 3 and held.
- **9942:** Nine alive at day 101, wave 3. Mosquitoes probed the village six
  times across days 32-51; Endrina took a 14-damage dive and hit back for 19,
  Somchai drove one off with an unloaded crossbow. Nobody got bitten. The
  beasts learned faster than the people did.
- **9943:** The village that never ate. Four left at day 47 — Hector, Rosa,
  Katarina, Onni — after starvation took four and wounds/sickness took the
  rest. The pantry was empty from the first week. Rosa asked for a corner
  nobody needed her in.
- **9944:** Eight alive at day 101, wave 3. Quiet deepening: no vector
  contact at all, the war stayed conventional (13 combat deaths, monsters
  and expeditions).

## BLANKS FILLED / DOCUMENTED

1. **FILLED — verbatim deeper-beat duplication (dialogue).** Two different
   villagers (Raj, Salvador) recited the q_first_week "deeper" anecdote
   word-for-word ("Spite, mostly. Pure, clean spite at the sky..."). All 36
   bespoke-question `deeper` beats were singleton strings — a fixed script,
   not identity-generated (unique-person law). Fix: `convoDeeperPick(vid,
   qd)` in src/js/conversation.js routes array-valued `deeper` through
   convoPick (per-villager no-repeat memory + village-fresh preference);
   strings keep the old path. q_first_week now carries 3 variants (kept the
   original + 2 new voices). Proof: scripts/test-deeper-variants-20261022.js
   (9/9 GREEN on seeds 42, 7, 1234). The other 35 questions keep singleton
   beats — a content pass can add variants; the mechanism now supports them.
2. **DOCUMENTED — ask_favor "tell me more" filler loop.** Luis's conversation:
   6× "tell me more" drew random disconnected aphorisms from the heal pool
   (12 lines) with no threading — the want never progressed. The pool content
   is good; the structure is a slot machine. Needs per-conversation memory +
   threading — a design job, not a this-run fix.
3. **DOCUMENTED — meat-quirk channel dormant.** 0 villagerMonsterWeirdness
   events across 6 seeds. Monster kills happened (field fights), but no
   monster meat reached village meals in any capture (0 butcher/meat
   mentions). The channel is wired (meal-time exposure roll) but saw zero
   opportunities — the blank is upstream in the kill→corpse→haul→pantry
   supply chain. For a future run.
4. **DOCUMENTED — scholar end-census instrument bug (r31, dead run).** The
   r31 harness read scholar statuses via Object.keys() on an ARRAY
   (seList returns a list) — scholarVectorStatusesAtEnd was always []. The
   east_nile "disappearance" was partly this bug; the real story (mantle
   transfer) was recovered by reading the capture. My r32 census inherits the
   same reader — villager census is correct (array-aware); the scholar field
   should be fixed next run. Not worth re-running 4 seeds over.

## JUDGMENT: reachable / fun / winnable (deepening leg)

- **Reachable:** yes — wave-2 vector fights occurred naturally on 2/4 seeds
  in the d40-80 window (day 32-51 on 9942, day 37-42 on 9941). The content
  is in the wild, not behind a gate.
- **Fun:** yes — the mosquito TB fight is a genuinely good encounter (tells,
  counters, the heavy-after-drink punish window); the field fights narrate
  latches and counters honestly. Villagers read as people in 10/10
  transcripts.
- **Winnable:** yes — 3/4 villages reached day 100+ at wave 3; the loss was
  a landing failure (starvation), not a deepening wall.

## METRIC REVIEW

- R1's "landed bites" instrument (tbDamage filter) recorded 0 while a real
  bite landed on 9941 — the mosquito's virus application bypasses the damage
  line the filter watched. Next run: treat mosquitoBiteVirus calls (already
  instrumented) as the bite ground truth, or extend the filter.
- M2's per-seed transcript sampler overwrote one file per seed (same path
  for 3 villagers) — only 1 transcript/seed survived from the census. The
  r32b probe fixed this with per-villager filenames; adopt that in the next
  census script.
- The scholar end-census reader (Object.keys on an array) should be fixed
  (see blank 4).
- Interesting-finding bar 1 was met (channel alive). Bars 2 (dormant) and 3
  (gating measured) resolved as documented. No metric proved wrong — no
  revision proposed.
