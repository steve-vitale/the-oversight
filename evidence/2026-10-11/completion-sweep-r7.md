# Completion sweep r7 — post-structural measurement (2026-10-11)

Steve's question: is the game winnable now, and is all content reachable?
Fresh measurement on current master (18aa4f4f). The old winrate-r6c branch
predates the structural fixes (conversation rebuild, background audit, purify
rehoming, rage/cornered_rat fix, counter save/load fix, succession fixes,
dissolve payout fix, exile pledge gating, shows commentary) — NOT used.

Harness: scripts/sweep-completion-r7.js (new). 60 seeds × 3 policies
(competent, mvc, leader) × 200-day horizon. Seeded mulberry32, deterministic
(re-run reproduced identical aggregates). Raw: sweep-out/r7.json (in worktree;
too large for /tmp — /tmp was wiped mid-task by a sibling cleanup, re-ran).

## Headline: 0/180 wins — the game is still not winnable

| Metric | competent (60) | mvc (60) | leader (60) | ALL (180) |
|---|---|---|---|---|
| Wins | 0 | 0 | 0 | **0** |
| Table (waiting/done) | 0 | 0 | 0 | **0** |
| Arc IV reached | 0 | 0 | 0 | **0** |
| Arc III reached | 56 | 38 | 48 | 142 |
| Arc II reached | 60 | 59 | 58 | 177 |
| Wave 3+ reached | 0 | 0 | 0 | **0** |
| Wave 2 reached | 53 | 7 | 0 | 60 |
| National / global | 0 / 0 | 0 / 0 | 0 / 0 | **0 / 0** |
| Vested (any shape) | 0 | 0 | 0 | **0** |
| Four-realm formed | 0 | 0 | 0 | **0** |
| Haven tier 2+ | 0 | 0 | 0 | **0** |
| Median / max survival (days) | 63 / 200 | 20 / 200 | 25 / 84 | **25 / 200** |
| village-lost / survived | 51 / 9 | 57 / 3 | 60 / 0 | 168 / 12 |
| Successions (total / young) | 463 / 59 | 115 / 20 | 115 / 19 | **693 / 98** |
| Trap sets (player/villager/catches) | 0/0/0 | 0/0/0 | 0/0/0 | **0/0/0** |
| Monster kills / counter kills | 559 / 56 | 143 / 7 | 58 / 21 | 760 / 84 |
| Counters known (runs with ≥1) | 107 (58) | 24 (22) | 40 (40) | 171 (120) |
| Mean codex breadth | 38.6 | 24.3 | 26.1 | 29.6 |

Arc II lands day 9 universally (n=177, med 9). Arc III median day 19
(n=131). Wave 2 median day 26 (n=58). Then everything stalls.

## Where runs stall — four walls

### Wall 1 — Combat attrition (the reaper)
Median survival 25 days overall (competent 63, mvc 20, leader 25).
Top death causes across all runs:
- 361 villager/combat, 286 monster/villager-combat, 277 monster/combat
- 222 "the night", 89 starvation, 68 thirst, 63 sickness
- 27 ambush, 20 unclosed wounds, 14 Choir Toad, 6 phoenix link

Combat is ~2/3 of all deaths. Villages don't starve first — they get eaten.

### Wall 2 — Wave 3 ledger (kills, not faces)
Wave 3 needs day ≥ 25 AND 5 wave-2 ledger kill points (per-type cap 2,
1 pt/kill, 2 with counter). Best observed: 4 points (seed 5, 46 days:
kills of heckler×1, paparazzo×1, understudy×2). Runs FACE up to 9 distinct
wave-2 types but KILL only 3–4 wave-2 monsters per entire run. The village
meets wave 2 but can't put it down. Wave-2 distinct-faced distribution:
132 runs faced 0, only 15 faced ≥5.

### Wall 3 — Scale (no polity ever forms)
0/180 vests, 0/180 four-realm, rank stayed 'village' in all 180 runs.
Partial policy gap: competent/mvc/leader never call proposeLink. BUT the
r6 tribute-priority probe (which pushed links) also returned 0/60 national,
0/60 vests — so this is not just a policy gap. Wave 4 needs regional rank,
wave 5 needs national; both are structurally out of reach. Haven tier 2:
0/180.

### Wall 4 — Feast surge never arms (hard Arc IV blocker)
feastSurge armed 0/180, used 0/180. Arc IV requires feastSurgeUsed.
Probe (seeds 25/22/51): surgeResonance 29/1/3 (need 35, devotion lane),
0 abilities at L3 anywhere (mastery lane). Best case 29/35 — the devotion
lane is NEARLY reachable but never lands. Tuning gap, not structural.
Sentiment taught 86/180 (reachable). Contests survived ≥3: ~10 runs.
Stage 3: 54/180. Crises ≥3: 116/180. deedGateReady().ok: 0/180.

## Content reachability verdict

| Content gate | Reachable? | Evidence |
|---|---|---|
| Arc II | ✅ universal | day 9, 177/180 |
| Arc III | ✅ common | 142/180, med day 19 |
| Wave 2 | ⚠️ partial | 60/180 (53 competent, 7 mvc, 0 leader) |
| Wave 3 | ❌ no | 0/180; best 4/5 ledger points |
| Waves 4–5 | ❌ no | gated on wave 3 + regional/national |
| Arc IV | ❌ no | 0/180; feast 0/180 is the hardest block |
| Table / win | ❌ no | 0/180; no sim has ever won |
| National / global | ❌ no | 0/180; 0 vests of any shape |
| Four-realm | ❌ no | 0/180 |
| Haven tier 2 | ❌ no | 0/180 |
| Trapline (traps) | ❌ no | 0 sets in 180 runs — policies never hold a trap tool; trap crafting never fires under these policies |
| Monster counters | ✅ yes | known in 120/180 runs; 84 counter kills (11% of kills) |
| Succession (mantle) | ✅ yes | 693 successions; but median 3 days survived after the LAST succession — it's a death-spiral marker, not a recovery |
| Young-link succession | ✅ occurs | 98/693 (77 runs); same 3-day median after |
| Contests | ✅ yes | seen in most runs; survived ≥3 in ~10 |
| Sentiment teaching | ✅ yes | 86/180 |
| Feast surge | ❌ no | 0/180 armed |

## Village assessment (plain words)

Thriving villages look like this: Arc III by day ~19, wave 2 unlocked by
day ~26, codex breadth in the 30s–40s, integration stage 2–3, a handful of
monster counters known, 2–7 villagers left from the starting 12. They fight
wave-2 monsters, face up to 9 distinct types, and then stall: not enough
wave-2 kills to open wave 3, no polity ever forms, the feast never arms,
and combat attrition grinds the roster down until village-lost (usually
between days 40–90 for competent, days 15–30 for the others).

What kills the rest: monsters, overwhelmingly. Then the night. Then hunger
and thirst. The village doesn't collapse from one bad decision — it bleeds
out, one grave at a time. Successions don't save runs: the new bearer
inherits a dying village and lasts a median of 3 more days.

## Sense-testing: do villagers act like people?

Sampled seed 25 (competent, 200-day survivor), full roster snapshots:

- Day 30, pop 9: occupations all distinct (unique-person law holds — no
  clones). Differentiation is REAL but thin: the interpreter (xp 68/63,
  2 expeditions) and the electrician (2 monster kills) are doing things;
  the other seven have 0 xp across all tracks and 0 expeditions. Four of
  nine share the 'forager' agency profile.
- Day 60, pop 5: the interpreter, the electrician, and the hunting guide
  are DEAD. The survivors — er_nurse, carpenter, veterinarian, plumber,
  mechanic — all sat at 0 xp. The villagers who DID things died; the
  passive ones lived.

Verdict: villagers differentiate (occupations unique, a few develop real
xp/kill histories), but agency is concentrated in 1–3 villagers per run
while the rest are furniture — 0 xp, 0 expeditions, 0 kills, identical
'forager' profiles. And the active ones die first, so villages brain-drain:
late-game rosters are the passive survivors. Plausibly human (the bold die
young), but the middle of the roster is robotic — most villagers never do
anything distinguishable in a 60-day life.

## Method notes / caveats

- Policies (competent/mvc/leader) never craft trap tools and never propose
  links — the trap and scale walls are partly policy gaps. But r6's
  link-pushing tribute-priority probe also returned 0/60 national/vests,
  and the wave-3/feast walls bind regardless of policy.
- Monster counter discovery works (120/180 runs) — the counter system is
  live and reachable.
- /tmp was wiped mid-task by a sibling cleanup (known hazard); the sweep
  was re-run with output in the worktree (sweep-out/). Deterministic seeds
  reproduced identical aggregates.

## For the lever loop (no balance changes made here)

1. Wave-2 kill rate is the binding constraint on wave 3: villages need ~2×
   the wave-2 kills. Levers: wave-2 spawn density, villager field-fight
   lethality vs wave-2, per-type cap, bar size.
2. Feast devotion lane: best 29/35 resonance. A small nudge (or more
   ability-use incentives) arms it — this is the cheapest Arc IV unblock.
3. Scale: even link-pushing policies vest 0/60. The polity formation path
   needs a real look — requirements vs. what villages can actually do.
4. Combat attrition dominates deaths; competent median 63 vs mvc 20 shows
   play matters, but the ceiling is still village-lost.
