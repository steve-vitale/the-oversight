# Long-run sim — TRUST & SOCIAL lever r1 (2026-10-11)

Lever 5: trust gains, gossip spread/distortion, leadership, moots.
16 runs: 8 seeds × 2 policies (competent, socialite) × 200-day horizon,
BEFORE/AFTER on identical seeds. Canon: docs/CANON.md, docs/CONVERSATIONS.md,
docs/CONTESTS.md (all read; no canon invented).

## The lever played

**Gossip spread rate** (src/js/game.js, spreadGossip), the single change:
- warm 0.50 → 0.65, base 0.22 → 0.35, prickly/withdrawn 0.08 → 0.12 (per teller per part)
- 3-day gossip fade unchanged. Trust gains, leadership, moots untouched (one lever).

Why this lever: measured BEFORE, stories averaged 2.2 hearers and distortion
1.3–1.4 per living day — the distortion≥2 mutation path ("the story mutates as
it travels") engaged only ~68–70% of sampled days, and gossip volume was
dominated by spam ('order' seeded ~206×/60d from observe(); 'departure' 124×).
Gossip is canonically how information moves ("spreads by gossip, not broadcast
— with distortion through retelling", Steve 2026-10-04), but stories died young.

**Blank filled (same system, feel — [needs-eyes])**: the overheard-retelling
line was one verbatim template ("You catch fragments by the fire — X telling Y
about Z. The story's getting bigger than what happened.") — 8 identical lines
in one 20-day run. Tails now scale with distortion (d2–3: growing; d4–5:
shifting; d6+: legend detached from truth) and cycle via pickFresh with no
immediate repeats. 9 distinct tails.

## Before/after (identical seeds, per-living-day curve samples)

| metric (per living day) | competent before → after | socialite before → after |
|---|---|---|
| gossip hearers | 2.23 → 3.18 (+43%) | 2.19 → 3.46 (+58%) |
| gossip distortion | 1.39 → 2.31 (+66%) | 1.33 → 2.41 (+81%) |
| stories reaching ≥½ village | 4.63 → 7.04 (+52%) | 4.26 → 6.46 (+52%) |
| days with mutation engaged (d≥2) | 68% → 78% | 70% → 92% |

Trust (untouched): mean 11.8→15.7 competent, 11.5→11.8 socialite; movement
−1.4→+2.6 / −1.6→−1.6 — noise, no lever effect (as intended). Survival median
62→77d competent, 63→69d socialite — chaotic-coupling noise, not a lever claim.

Proof: scripts/test-social-gossip-20261011.js 10/10 (spread reaches 3+ hearers
and d≥2 in 3 days; tails vary, no immediate repeat; gossip still moves REP
only, never trust — canon Trust≠reputation holds).

## Reachability verdict

- **Gossip**: reachable and now travels — AFTER, stories routinely reach half
  the village with real distortion. BEFORE they mostly died at 2 hearers.
- **Leadership challenges**: reachable — 7/8 seeds fire a challenge
  (~11–22 challenge-days/run). In headless sims the player never answers, so
  they resolve by design (contender takes the domain after 8 unanswered parts:
  "stopped asking... Nobody stopped them."). Contenders (goal 'lead') present
  in most runs. Succession-by-challenge works; player-answered paths
  (askSupport/yield/standGround) are UI-side, exercised in playtests.
- **Moots**: petition moots reachable (0 competent / 1.8 socialite per run;
  AFTER 2.4 socialite). Televised moot contests rare (0.25–0.88/run) — they
  exist in the pool and fire, but at 200d horizons with villages dying ~day 65
  the show barely gets going. Reachable, not frequent.
- **Conflicts**: 1–2 known per run, ~all resolve (mediation at 55+ mutual
  trust, or the dead-party rule). Working.
- **Waves/Arc/national/win**: wave 0, arc ~3, national 0, won 0 across all 16
  runs — villages die at median ~65d (combat 41–44 deaths, starvation 19–26).
  The social layer never gets a 200-day village to work with. This is the
  food/combat wall (other levers' territory), not a social reachability gap —
  but it caps what social play can ever demonstrate.

## Village assessment (what the village looked like socially)

Under competent play the village is socially thin: ~61 lifetime conversations,
trust hovers hostile/distrustful (mean ~12, someone always at ~0), gossip is
mostly 'order'/'departure' spam. Under socialite play (239–280 conversations,
feasts, petition moots) the village feels alive — trust reaches 90 for a
closest ally, conflicts surface and resolve, moots convene, challenges fire —
but it still dies at ~day 65 all the same. The social engine works; it just
never gets a long-lived village.

Who trusted whom: trust concentrated on 1–2 villagers (max 90–91) while the
rest sat 0–25 — the words-cap-40 + progressive gains + deed-driven spikes
produce a realistic inner-circle shape, not uniform affection. Min trust ~0.5:
there is always someone who hates you (conflict corners, leadership friction).

## Sense-test verdict (transcripts read)

- Gossip fragments: BEFORE — verbatim repetition (blank, now fixed). AFTER —
  9 tails, distortion-scaled, no repeats. Stranger descriptors ("A person,
  maybe 50s telling A woman, maybe 30s...") read confusing but are
  knowledge-gating working as designed (you don't know their names).
- "X telling Y about Y" (subject==listener): reads odd, pre-existing,
  attribution untouched — noted, not changed.
- Justice moots read well: "Word reaches you, days late: Lena stands accused
  over what happened to Stephen. There's going to be a moot. People are
  choosing sides." Bidirectional accusations (Lena↔Stephen) read as
  counter-accusation drama — the system supports false/weaponized accusations
  by design; plausible, not a bug.
- Conflict lines read human: "Rosa and A man, maybe 30s, with freckles are
  arguing about the watch rotation. Again. It's almost comforting."
- Mara's freeload warning ("We all eat from the same pot... the village will
  decide.") — specific, consequential, good.

## Blanks filled / documented

- FILLED: gossip spread rate (lever) + verbatim fragment line (feel).
- DOCUMENTED (not this lever): villages die ~day 65 median — social systems
  never get long horizons (food/combat levers). Televised moots rare at these
  horizons (0.25–0.88/run). 'order'/'departure' gossip spam (206+124 seeds/60d)
  drowns signal — candidate for a future social run (seed-quality, not spread).
  Empty-heard seeds ('death' via hurtVillager, 'deal'/'threat', 
...[truncated 558 chars]