# Journey leg 2 (deepening) — R7 run note (2026-10-12)

**Leg**: deepening (days 40–80) · **Run**: R7 · **Base**: `84421f10` (journey establishment r6)
**Harness**: `scripts/journey-deepening-r7-20261012.js` (new: r5 harness + knowledge-economy
telemetry — counter discovery wraps, combineKnowledge counting, teachable-day sampling,
traderDeep snapshots, knowledge markers) + `scripts/test-trader-pool-growth-20261012.js`
**Canon**: MONSTER-WAVES.md read (fixed a drift — see below); KNOWLEDGE.md read. No canon changes.
**Seeds**: 90001–90006 (fresh) + 10101, 20202 (control: R6's seeds, rerun on current master)
**run_id**: playtest-20261012T183100Z · rotation advanced 2→3.

R6 (this morning) ran on base 4c40b21d; since then ~10 commits landed
(food r6 knife fix, social r7 moots, combat r7 trauma relief, crisis r8,
succession r9, landing r7, est r6). R7 measures the same leg on the new master.

## The blank filled: MONSTER-WAVES.md beasttricks drift (doc fix)

The canon doc said "2+ village slain of a type unlocks the askAbout 'beasttricks'
topic"; the code was retuned to 1+ on 2026-10-11 (longsim combat lever — "one kill
is enough for the fire to have a theory") and the code comment says so, but the
doc still said 2+. Fixed the doc line; verified against game.js counterTeachable()
(>= 1) and its lever comment. No src/ changes.

## Knowledge economy verdict (the R7 focus)

- **Beasttricks TOLD AT HAVEN now works in-leg** (was "6–8 asked, 0 taught by d40"
  in R6): 36 counter discoveries across 8 runs, 34 via 'taught', days 5–91.
  The competent policy asks when counterTeachable() fires and villagers teach.
  The 1+ lever is the fix; R6's thin-in-leg finding is closed.
- **combineKnowledge fires**: 20–44/run. **Experiment beats**: 1–7/run (presence-gated,
  once/day — working as designed).
- **Trader pool growth: mechanically sound, unreachable in practice.**
  The existing proof `scripts/test-trader-pool-growth-20261012.js` (longsim
  knowledge r5, 22 checks) passes on current master 22/22 — first exposure
  records, same-channel re-exposure doesn't deepen, different-channel
  re-exposure 3+ days later deepens, the plant joins the tradeable pool, the
  12-day cap holds. But in 8 runs / ~500 run-days: **0 deep gains**. Funnel:
  only ~9% of occupations (5/55: ESL teacher, fishing guide, hunting guide,
  journalist, librarian) are knowledge traders — 1 of 6 fresh villages had one
  alive (Alex, ESL teacher, seed 90002 — scattered day 21). Even with a trader,
  deepening needs the SAME plant re-learned via a DIFFERENT channel 3+ days
  later; word-of-mouth skips knowers, fireside teaches each plant once
  (taughtAround), so only 'player-taught'/'foraging' re-exposures qualify.
  (Longsim's own 20x200d measurement: 7 deep plants / 4000 run-days — my 0/500
  is consistent with that rate, not a breakage.) The "second knowledge sink
  beyond the pantry" (R6) fires at a rate invisible inside a single deepening
  leg. Documented for the knowledge-lever owners — not retuned here (balance
  call, longsim knowledge's lane).
- **Moots fire**: 2–54 moot markers/run (social r7's NPC moots + justice trials live).

## Wave pacing: the wave-2 kill throttle, measured precisely

- **20202 (control, the good run)**: w2 d18 → w3 d57 → w4 d96. 6 real wave-3
  fights (Redactor ×2 lost, Terms of Service ×2 won, Spool won, Buffering routed),
  5 distinct w3 faced, regional scale, pantry 22–36k mid-game. The designed
  deepening arc, working beautifully.
- **90003 (the throttle, documented)**: w2 d12 → w3 **d102**, village extinct d104.
  12 distinct wave-2 types FACED blow-by-blow, but only ~3 wave-2 KILLS in 90 days
  (villageSlain: warranty_caller 1, heckler 1 + one counter-kill). The village
  fought wave-2 constantly (17 villager-combat monster deaths) but couldn't finish
  them (HP 30–170, dmg 8–48 vs villager gear). The kills-only ledger (Steve's law —
  NOT touched) starved while the village bled out; wave 3 unlocked 2 days before
  extinction, 0 w3 fights. Crisp data point for the wave-lever owners.
- Fresh seeds: 90001 d44 scattered, 90002 d21 scattered, 90004 d67 scattered,
  90005 d21 scattered, 90006 d46 scattered. 10101 (control): R6 lost d47 →
  now scattered d35.

## The early-scattering cluster (reported, not fixed — longsim food's lane)

5 of 8 runs ended in the scattering (pantry empty 3–5 days → "people started
walking"). Probe of 90002: village meal +1173 kcal ~d11, then 3 empty-pantry days
→ scatter d13–21. The food wall binds earlier and harder than R6's d47–99 window
on these seeds — but the control is mixed (10101 worse 47→35; 20202 better, wave 4).
High seed variance, not a clean regression: no src/ food change explains it
(food r6 was honest-hardening + a knap-first policy that should HELP). Filed as
a loud observation for longsim-food: the scattering fires on villages that just
ate a 1k-kcal communal meal days earlier.

## Village assessment (plain words)

**20202 (the run that worked)**: six left at d96 — Lena the ER nurse (trust 90,
35 plants), Marcus (90/31), James (90/34), Sofia the gardener (0/31, scared),
plus two. 42 dead, mostly combat. Wave-3-tested, regional, wave 4 unlocked.
A village that fought its way up the ladder — the designed shape of deepening.

**90003 (the throttle)**: everyone dead by d104. Fought 12 wave-2 types to a
standstill, killed almost none of them, unlocked wave 3 at d102 with no one left
to face it. Starvation + combat + wound fever in the last month.

**90004 (d67, scattered)**: five walked — Emil the soldier, Lena, Sofia (trust 90),
Emma the vet; 23–27 plants each, lonely. Regional reached, wave 2 never beaten.

**The early four** (90001 d44, 90002 d21, 90005 d21, 90006 d46): scattered with
8–14 dead each. 90006 reached regional with 2 left (Ming the butcher 32 plants,
Emma 27). Knowledge never got the chance to compound.

## People check (SENSE-TESTING LAW)

4 full transcripts read. 3 genuinely good:
- **Malik (20202 d45, ask_favor)**: cross-conversation memory ("We never finished
  talking about that favor — we got cut off"), concrete hunger ask, player commits
  + teaches 3 plants (each lands in both stores), ends promised. Wants something,
  options engage, ending resolves and plants an obligation.
- **Lucas the butcher (90004 d45, curious)**: "8 days back" memory, a guilt
  confession beat handled without judgment, real gossip (David), warm close.
- **Tao (90003 d45, ask_favor)**: "I asked Marcus about this wound — Marcus's
  gone." — the want system names the REAL dead. Player commits, teaches, the
  guardedness thins over 8 turns. Grief with a name.
- **Lena (20202 d60)**: opener asks a wound favor, driver found no engage choice
  and logged leave, closer "Good. That's settled, then. Onward." with
  resolution=unresolved. Investigated: the closer mismatch is a HARNESS artifact
  (driver calls endConvo('done') after leave; the live UI calls endConvo('left')
  → "Oh — okay. Later, then.", which is honest). The want stays live/unresolved —
  correct. Not a game bug; driver limitation noted.

## Reachable / Fun / Winnable

- **Reachable**: YES — wave 3 unlocks, 6 honest w3 fights, wave 4 unlock, regional
  scale, moots, beasttricks taught, experiments, combineKnowledge. All firing.
- **Fun**: YES — the 20202 arc (Redactor losses, ToS wins, Spool win) and the
  conversations are the game working as designed.
- **Winnable**: PARTIAL — 1 of 8 reached the leg's far edge; 5 scattered before
  day 70. The wall is food-then-wave-2-kills, and it's seed-swingy. Longsim's
  levers, not this loop's.

## Files

- Harness: `scripts/journey-deepening-r7-20261012.js` (new; r5 base + knowledge telemetry)
- Proof: existing `scripts/test-trader-pool-growth-20261012.js` re-verified 22/22 on current master (mechanism sound; my 5-check variant was redundant and dropped after I found I'd overwritten the committed file — restored via `git checkout HEAD`)
- Fix: `docs/MONSTER-WAVES.md` (beasttricks 2+ → 1+ drift)
- Evidence: `evidence/2026-10-12/journey-deepening-r7-<seed>.json` (8 runs)
- Transcripts: `/tmp/journey-deep-r7-transcript-<seed>-day<45|60|80>.txt` (ephemeral)

## Still open (documented, not fixed)

- Trader pool growth ~unreachable in play (mechanism proven sound; funnel too
  narrow: ~1 trader/6 villages + different-channel re-exposure requirement).
- Wave-2 kill throttle: 12 distinct w2 faced / ~3 killed / 90 days on 90003 —
  kills-only ledger starves while villages bleed. Wave-lever owners' call;
  Steve's kills-only law respected (not touched).
- Early-scattering cluster (5/8 runs, d13–67): loud observation for longsim-food.
- 20202's scholar day stalled at 96 under a 110-day loop (end=survived) — the
  harness's known day-clock stall pattern; sim-side, not game-side.
