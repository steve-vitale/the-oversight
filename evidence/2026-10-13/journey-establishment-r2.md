# Journey leg: ESTABLISHMENT (days 14–40) R2 — the village-kill codex pilot — 2026-10-13

## Pre-registration (docs/MEASUREMENT.md §§9–12)
- **Question:** does wiring villager kills into the monster codex (stage
  'slain' at the recordWaveKill choke point) make the BEASTS section reflect
  the village's kills — i.e., does the codex stop being thin when villagers
  do the killing?
- **Primary metric:** codex entries with stage 'slain' per seed, before/after
  on identical seeds.
- **GO threshold:** obvious in 8 seeds — after the fix, seeds where villagers
  kill beasts the player never killed show those BEASTS entries; before, they
  don't. Mean codexSlain/seed increases by ≥3.
- **Horizon:** 40 days (establishment window), death-aware (stop at
  Game.over; no dead-village ticking). Reason: the blank is about the
  establishment window; kills happen days 14–40.
- **Seeds:** 61, 82, 103, 124 (r1's seeds — directly comparable) + 205, 306,
  407, 508. Policy: competent + FAVOR_ACCEPT=1 + INVITE_PARTY=1 (r1 knobs).
- **Canon read:** CANON.md, MONSTER-WAVES.md (discovery channels, villager-XP
  law), CONTESTS.md, PRESERVATION.md.

## What ran
- Harness: `scripts/journey-establishment-r2-20261013.js` (r1 harness + 8
  seeds, LABEL=pre/post census split, `stage` in the codex capture, new
  codexKillSummary: villageSlain types/total vs codex entries/slain).
- Before-pilot: pre-fix game.js (restored from HEAD) × 8 seeds. After-pilot:
  fixed game.js × identical 8 seeds. Same harness, same policy.
- Proof test: `scripts/test-village-kill-codex-20261013.js` (RED pre-fix,
  GREEN post-fix).

## The fix (BLANK FILLED)
**Villager kills now teach the monster codex.** `recordWaveKill` — the single
choke point every real kill flows through (player TB, villager field fights,
contests) — marks the codex entry stage 'slain' via `ensureMonsterEntry`
(well-formed for the naming system). Before, only the player's TB kill path
(`tbKillRewards`) ever set 'slain': r1's seed 82 had ~14 kills and 1 codex
entry; this run's pre-fix seed 61 had 10 villager kills across 7 types and
ZERO slain entries. Canon basis: "the village learns together"
(recordWaveKill comment), MONSTER-WAVES.md channel 3 says "slaying a monster
surfaces its counter.hint" (slaying, not slaying-it-yourself), and the
villager-XP law (Steve 2026-10-10): "villager KILLS score the ledger exactly
like the player's. The village is the protagonist." The full counter reveal
stays gated on discovery (monsterCounterKnown); the naming debate still waits
on a report (identifyMonster) — killing is news, the argument is its own
beat. Defensive try/catch: a codex bug never breaks the kill path.

## Pilot results (8 seeds, before → after, identical seeds)
- codexSlain/seed: 1.8 → 4.9 (delta +3.1). codexEntries/seed: 3.1 → 5.8
  (delta +2.6). GO threshold met — visible in raw numbers, no statistics.
- Seed 61: 0 → 7 slain (purest case: player killed NOTHING all leg; 10
  villager kills across 7 types, all now in the codex).
- Seed 82: 1 → 8. Trajectory flipped: DIED day 17 pre-fix → survived all 40
  post-fix.
- Seeds 103/124/205/306/407/508: every seed improved (1→3, 1→3, 2→4, 1→2,
  6→8, 2→4).
- **Mechanism traced (not just correlated):** `scripts/policies/competent.js`
  `beastHintKnown()` treats codex stage 'slain' as knowledge ("The codex hint
  IS knowledge... and the player read it") and plays the counter trick
  tactically in combat. Villager kill → codex 'slain' → hint → the player
  fights smarter → the village lives. Steve's core loop (knowledge → power)
  now runs on village kills, not just the player's. This is the intended
  design working, and the flesh-out combat axis (sim-dmgmath auditing wave
  1–2 damage numbers this same window) should treat villager-informed
  counter play as the new baseline.

## Village assessments (plain words, post-fix runs)
- **61 (Wilhelm):** 12→7. A going concern — pantry 47.8k (33.5k raw + 14.3k
  preserved; the smoke racks work). Lost 1 to a monster, 1 starved d37.
  Villagers killed paparazzo×2 and belltoad in real fights — and the codex
  now shows all 7 slain types.
- **124 (Jose):** 12→9. Thriving — pantry 71.7k, 1 preserver specialist.
  Contest death d33. Plants known 20+ across the top 5 villagers.
- **205 (Caroline):** 12→9. Holding — pantry 28.5k. One starvation d23, one
  combat loss d28.
- **306 (Nathan):** 12→10. Holding — pantry 24.4k (15.9k preserved).
- **82 (Sidney):** 12→5. Bloodied but alive — pantry thin (2.8k raw). The
  fix's headline: knowledge saved this village.
- **407 (Daniela):** 12→2. Hanging by a thread — pantry 2.3k raw, combat
  bloodbath d26–28 (4 dead incl. a warranty_caller kill), one starvation.
- **103 (Mateo):** collapsed — 12→3 by d39, pantry 0. Ambush + 3 combat
  deaths d26–27, then starvation pressure. (Same seed collapsed in r1 too —
  this cast draws a hard early game.)
- **508 (Marco):** collapsed — 12→1 by d39, pantry 0. Sickness took Rosa
  Mendez and Somchai Prasert d24–25, one starvation d20.
- Contests: pilot aired all 8 seeds, 3–6 contests/leg, all inside the 2/week
  budget. Party: cap 5 everywhere, 0 joins (the competent policy never
  invites — r1's policy blank persists; the INVITE_PARTY knob exists).
- Knowledge: beasttricks teaching fired 65× across 8 seeds; 372 talks; 57
  soothed; cleanedCarcasses only 3 (the carcass-haul gap stands — map-memory
  haul objectives are V1 per Steve 2026-10-13).
- The mid-establishment meat grinder persists: 3/8 villages collapsed or
  nearly. Whether that's designed brutality or overtuning stays the
  flesh-out combat axis's call.

## The people check (full transcripts read)
- **Liam (s61 d21):** asked what the player's hands did before; "Useful.
  Everything useful matters now. I mean that as a compliment." Gossip:
  "Stan is back. Walked in like they'd never left." Follow-ups thin but
  honest ("I wish there was more to tell. That's it."), ends cleanly. A
  person, not a menu.
- **Kirollos (s124 d11):** opened with a betrayal lure (SPOKEN ✓), asked the
  most useful thing learned; party invite declined with a real gate: "I
  don't know you well enough for that. Ask me again when we've survived
  something together." Betrayal decline: "Another time, then." A small
  thing, pocketed. Wants, deflections, and threads — no fabricated history,
  no filler loops.
- Note: betrayal-case options (12 of them, two open cases) dominate the menu
  even in casual chats — coherent here (the lure was the point), worth
  watching if cases go stale.

## Blanks DOCUMENTED (not fixed)
- **Villager kills don't feed the naming debate.** A type the scholar never
  personally encounters never gets its village name, however many the
  village kills — the entry reads "not yet named — the village is arguing
  about it" while nobody is arguing. Needs the killer's tale-telling beat
  designed (not just a flag flip) — future run.
- **Trapline still never fires** (r1 blank stands): 0 traps crafted/set in
  8/8 runs. Chicken-and-egg when no cast member knows the wire.
- **Preservation stalls at smoking** (r1 blank stands): render/pemmican
  rare in sims. May be pacing-correct; noted.
- **Party 0 joins in sims** (r1 policy blank stands).

## Regressions
- test-village-kill-codex-20261013.js: PASS (new; RED-verified pre-fix).
- test-structural-counters-20261011.js: 52/52.
- test-wave-ledger-20261010.js: 31/31.
- test-contest-ledger-20261011.js: 22/22.
- validate-ontology.js: 93/93 systems valid.
- Pre-existing, untouched: background-survivors data test (stale baseline),
  soc-favor-followup (hardcoded seed setup).

## Verdicts
- **Reachable:** YES — the codex now records what the village actually
  does; beasttricks teaching fired 65×; contests on budget; pilot aired 8/8.
  PARTIAL for trapping (0/8) and party formation (policy, not machinery).
- **Fun:** YES — conversations read like people with wants and memory; the
  knowledge→power loop visibly saved a village (seed 82).
- **Winnable:** MIXED — 5/8 villages holding or thriving at day 40, 3/8
  collapsed or nearly. The establishment window is a meat grinder in sims;
  the combat-balance axis owns the tuning call.

## Convergence
`converging` — the codex blank is closed; the naming-debate blank is
documented for a future run; the meat-grinder tuning belongs to the
flesh-out combat axis.

## Files
- src/js/game.js (recordWaveKill: village kills teach the codex)
- scripts/test-village-kill-codex-20261013.js (proof, RED→GREEN)
- scripts/journey-establishment-r2-20261013.js (8-seed pre/post harness)
- evidence/2026-10-13/journey-establishment-r2.md (this note)
