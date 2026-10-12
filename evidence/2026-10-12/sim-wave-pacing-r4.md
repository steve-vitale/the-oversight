# Long-run sim — lever 2 r4: wave unlock pacing, channel audit + beastTrickPlay pacing (2026-10-12)

**Context:** r3 settled bars/caps, proved day floors inert, measured the
contest-kill fix pacing-neutral. Since r3, combat r5 landed (HEAD 1e1afc81):
beastTrickPlay — competent policy plays all 13 counter kinds tactically,
knowledge-gated. Their 16-seed claim: discoveries 128→144, counter-kills
60→72, wave-3 unlocks 5→7, median survival 56→68d. This run measures what
that did to wave pacing on 20 fresh seeds, audits villager-experience
completeness in the ledger (Steve's standing law), and sense-tests the beats.

Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, VILLAGER XP LAW,
counter convention), docs/PROGRESSION.md §12 (ledger config). Method:
`scripts/sweep-wave-lever.js`, 20 seeds × 200d, competent policy, current
master. Raw: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/wavelever-r4.json`
(r3 raw: `wavelever-r3-after.json`).

## 1. BASELINE: what beastTrickPlay did to wave pacing (20 seeds × 200d)

| measure (20 seeds) | r3 (pre-r5) | r4 (post-r5) |
|---|---|---|
| median survival | 55d | **67d** |
| max days | 89 | **170** (seed 17) |
| deaths (20 runs) | 202 | **171** |
| combat share of deaths | 70% | 57% |
| wave-2 unlock | 15/20, med 29 | **18/20, med 21** |
| wave-3 unlock | 2/20, med 77 | **9/20, med 53** |
| wave-4 / wave-5 | 0/20 | 0/20 (still scale-bound) |
| counter discoveries | 123 | **177** |
| w1 kills (20-run) | 150 (vill 71%) | **261 (vill 72%)** |
| w2 kills (20-run) | 17 (vill 65%) | **70 (vill 57%)** |
| w2 types touched | 6 | **13** |

What actually binds each unlock (gap = unlockDay − barFillDay, all 27
unlocks): **gap 0, every time** — the BAR binds everything. Earliest w1
bar-fill day 12 > floor 8; earliest w2 bar-fill day 31 > floor 25 — day
floors provably inert again (33/33 across r3+r4). Waves 4/5: 0/20 reach
regional — the scale floor binds absolutely (lever 8).

**The honest mechanism (not what the brief hypothesized):** the w2→w3 bar
did NOT start filling on counter-kills. Across all 9 w3-unlock runs, the
w2 ledger's counter-bonus extras sum to **1 point total** (seed 11); the
other 8 runs' w2 bars are pure plain kills. Twenty-run totals:
counterExtras w1 = 4, w2 = 1 — vs discoveries 177. The perTypeCap=2 clips
the mastery bonus hard: one counter-kill per type pays +1 extra; the second
scores 0 extras. The pacing acceleration is **tactical throughput**: the
policy fights smarter (shout scatters the choir, keep distance from the
radio), villages survive longer (55→67d), kill more (w1 150→261), and bars
fill on bodies. The counter bonus is a real mastery pat that the cap keeps
small — by design (breadth, not throughput), but Steve should know the dial
barely turns: 2 pts looks bigger on paper than in the ledger.

Ledger point sources (w1, 20-run): 261 kills = 189 villager + 72 player;
counter extras 4. Televised/contest kills fight through fieldFight and fold
into the villager channel (r3 measured ~0.15 pts/run — rare, real, kept).

## 2. VILLAGER-XP CHANNEL AUDIT — complete; one dormant gap closed

Every live kill channel was traced to `recordWaveKill` (the ledger's only
scorer). Result: **all live channels score**.

| Channel | Scores? |
|---|---|
| player TB kills (won/routed, lineage-deduped) | ✅ game.js:35943 |
| villager patrol vKill | ✅ resolvePatrol game.js:6022 |
| villager wild-encounter vKill | ✅ resolveWildMonsterEncounter game.js:16414 |
| villager expedition vKill | ✅ villager-agency.js:366 |
| contest blood/gauntlet/siege vKill | ✅ contestEngine.js:369 |
| contest hide seeker vKill | ✅ contestEngine.js:601 |
| contest beastmaster vKill | ✅ contestEngine.js:625 |
| titan / finale fights (TB wraps) | ✅ via TB path |
| aid-crisis aidFight vKill | ❌→✅ **fixed this run** |

The gap: `aidFight` (comms.js) was the only `fieldFight` call path whose
vKill never reached `recordWaveKill` — fieldFight itself doesn't score (by
design; the patrol/wild/contest wrappers do), and aidFight bypassed them.
r3's "aidFight dead code" note was half-right: it has no production callers
(verified — only the aid-comms test calls it), so it's dormant, not dead.
Fix: `recordWaveKill(mdef.id)` on vKill, with the dormancy noted in the
comment. Pacing-neutral **by construction** (no caller can fire it in sims),
proof-tested red→green (structural scan of all 7 fieldFight sites +
dynamic: rigged vKill now scores 1 ledger point and 1 villageSlain).

Deliberately unscored (design, verified): vDie (the dead told no tale),
evade/alreadyDead, mFlee/drive-offs, TB 'fled' (abandoned the field —
break-it r12 call), vanish/lost-sight despawns (narrated, not kills),
prey-animal hunting traps (prey aren't wave monsters; recordWaveKill looks
up monsters.json only — verified dynamically: 'turkey' and unknown ids
score 0).

**Verdict on Steve's law** ("wave unlocks count villager experiences
alongside the player's"): PROVEN COMPLETE in code and in sims — 72% of w1
and 57% of w2 ledger kills are villager kills, every villager channel
scores, the audit found exactly one dormant gap and closed it.

## 3. SENSE-TEST: beats, gossip, grammar (transcripts read, not counted)

- **Ledger beats honest**: "📺 WAVE LEDGER — wave 1 is halfway there (3/5
  kills — the ledger counts kills only, not near-misses)." A counter-kill
  jumping 3→5 fires both beats same-day, sequentially — reads fine.
- **Counter-learned beats are the good stuff**: "💡 COUNTER LEARNED —
  Hummice: Bellow at the choir. ... (Someone at the haven knew the trick.)"
  vs "(You did the thing — and it worked.)" — two honest via-lines.
  Knowledge gating holds: unnamed types show descriptors ("a soft green
  glow under the water"). No double-announce: discovery fires mid-fight on
  the trick, the ledger beat fires on the kill — different events.
- **Wave-3 unlock beat lands with the RATINGS line**: "📺 'Oh, you survived
  the AUDIENCE NOTES? Cute. We've stopped pretending these are animals
  now...'" — System voice, reactive, once per run. ✅
- **The w5 "You're the show now" line never fires in sims** (0/20 reach
  w4's bar, let alone w5's) — coverage is unit-test-only
  (test-wave45-coherence). Noted, not fixed: no sim can reach it while
  scale is lever 8's wall.
- **Fight summaries read like people**: "Marcus killed the Hushpuppy alone
  — 2 rounds, 26 taken. Word travels fast." / "The Highbeam Deer mauled
  Ursula (-21 health) over 1 round." / "The Choir Toad killed Sunan in 2
  rounds. The village mourns." Round grammar clean ("1 round" singular —
  no "1 rounds" regression).
- **THE LIE (fixed)**: a vFlee with 0 damage taken narrated "The Highbeam
  Deer mauled James (-0 health) over 1 round." A mauling that dealt no
  damage is a lie. Now: "The Highbeam Deer came for James and missed —
  they got clear over 1 round, unharmed. They're lucky to be breathing."
  (fieldFights.js; proof test-fieldfight-summary 11/11, red-checked.)
- **Villager kill gossip (awayNews)**: "⚔️ Marcus killed the Lockpick alone
  — 2 rounds, 9 taken. Word travels fast. The village cheers." Coherent,
  consequential, named people. Nothing robotic in the sampled lines.
- **Documented blank (not built)**: villagers never react when a wave
  DROPS — the System's RATINGS beat is the only voice. The village should
  be terrified of the treeline when wave 3 arrives; nobody at the fire says
  a word. A one-line villager reaction woven into checkWaveUnlockBeat would
  be in-scope for a future r5; I left it as a documented blank rather than
  inventing copy under a measurement brief.

## 4. Regression fallout from combat r5 (fixed in my standing suites)

combat r5's multi-move kits broke two wave-lever test rigs that spread the
full monster def (including the new `attacks` kits) into a rigged fight:
test-wave-ledger (31→30/31) and test-villager-wave-xp (20→19/20). The rigs'
documented intent is "rigged-but-honest stats" for LEDGER assertions, not
kit combat — fixed by stripping `attacks: []` in the rigs (no assertion
weakened): 31/31 ×3, 20/20 ×3. Same class of failure verified
pre-existing on pristine HEAD 1e1afc81, fixed only in test rigs.

Left as pre-existing (not mine): test-wave3-5 213/215 — two hardcoded
roster-count asserts ("56 monsters total") stale after the finale/titan
landings added 3 wave-4/5 monsters (roster now 59). Content-loop staleness,
fails on pristine HEAD; documented, not touched. aid-comms 68/3 — the known
pre-existing 3 from the endgame build (MEMORY.md).

## Village assessment (plain words)

The villages are learning to fight dirty and it's working: median survival
55→67 days, one village held 170 days. Wave 2 now lands at a median day 21
on 18 of 20 runs, and wave 3 — still rare — went from a rumor (2/20) to a
real era (9/20, days 31–92). But it's a thin era: the w3 runs fight ~1–9
wave-3 fights total; the deed gate's w3 bar (4 distinct faced) completed in
1 of 20 runs. The village does the killing — 72% of wave-1 ledger kills,
57% of wave-2 — the player is one fighter among many, and that's the design
working. Deaths: combat 57%, starvation 24%, disease climbing (wound_fever 7,
lockjaw 2). Nobody won, nobody reached regional, nobody saw the table — the
late game is still a wall, but the early game now breathes.

## Blanks filled

1. **aidFight ledger gap closed** (comms.js): the one unscored villager-kill
   channel now calls recordWaveKill. Proof 17/17 (red-checked).
2. **fieldFightSummary "-0 health" lie fixed** (fieldFights.js): unharmed
   flees get an honest line. Proof 11/11 (red-checked).
3. **Channel audit documented**: 8/8 live channels score; unscored channels
   classified by design; prey traps proven out-of-scope.
4. **Standing-suite rig repairs**: test-wave-ledger + test-villager-wave-xp
   restored to 31/31 and 20/20 after combat-r5 kit drift.

## Documented (not fixed)

- w5 "You're the show now" beat: sim-unreachable (0/20), unit-test-only.
- Villagers never react to a wave drop — future r5 copy work.
- test-wave3-5 roster-count asserts stale (56→59) — content loop's drift.
- aid-comms 3 pre-existing failures — endgame build's, per MEMORY.md.
- Counter bonus is cap-clipped to ~1 extra pt/type — dial note for Steve:
  2 pts looks bigger on paper than in the ledger.

## Tests & commits

- NEW `scripts/test-wave-kill-channels-20261012.js` — 17/17 ×3 (5 red pre-fix)
- NEW `scripts/test-fieldfight-summary-20261012.js` — 11/11 ×3 (3 red pre-fix)
- NEW `scripts/sense-wave-beats.js` — transcript reader (tooling)
- FIXED `scripts/test-wave-ledger-20261010.js` — 31/31 ×3 (kit-strip rig)
- FIXED `scripts/test-villager-wave-xp-20261010.js` — 20/20 ×3 (kit-strip rig)
- Regressions: wave45-coherence 22/22, contest-ledger 22/22, wave-bar 13/13,
  bal-waves 30/30, ontology 83/83
- Pre-existing (pristine-HEAD-verified): aid-comms 68/3, wave3-5 213/215
- Sweeps: `scripts/sweep-wave-lever.js` 20 seeds × 200d competent, current
  master; raw JSON → goal hidden_files `wavelever-r4.json`
- `[needs-eyes]`: fieldFightSummary copy changed (village gossip lines Steve
  may see on his phone)
