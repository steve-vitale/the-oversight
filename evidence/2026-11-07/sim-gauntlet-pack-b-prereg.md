# sim-gauntlet-pack-b — prereg: is the Gauntlet wave-3 pack party-mirrored, and does it systematically kill the second fight? (DIAG only, zero src/js)

**Arm:** sim-gauntlet-pack-b (run fleshout-loop-b-20261107T0420Z, Loop B,
axis scale-onramp / winnability chain) · **DIAG only, zero src/js.** A fix
may be NAMED if one is needed; no game-code change is built here.
**Base:** master at worktree creation (branch sim-gauntlet-pack-b;
anchor recorded at replay time) · **Worktree:**
~/workspace/worktrees/sim-gauntlet-pack-b
**Canon read first:** docs/CANON.md, docs/CONTESTS.md (Blood contests:
Pit/Gauntlet/Siege, three waves no rest, death on the table).
**Context read:** evidence/2026-11-07/sim-arena-b.md (the Sari case:
53006 replay d115, Gauntlet waves [buffering, sunback, reunion], wave 3
lost, monster 95.4% HP left) + its prereg, evidence/2026-11-06/
sim-killersurvive-a.md ("second fight" definition), evidence/2026-11-06/
sim-trajfrag-b.md (cite channels, not days — the 53001–53008 band is
trajectory-fragile across anchors).

## The case under investigation (corpus, not new seeds)

53006 replay (arena-b, anchor 5a4e3e4b5), d115: Sari Wulandari died in
contest Gauntlet, wave 3, to a THREE-Reunion pack (monster 95.4% HP
left). Wave 1 Buffering (wave 3) won in 7 rounds, scholar 71% HP, 3
allies beside the scholar; wave 2 Sunback (wave 1) won in 1 round,
scholar still 71% HP; wave 3 Reunion (wave 4) lost in 6 rounds, scholar
−4% HP. The same replay leg also ran a FULLY WON Gauntlet on d100
(waves [nightlight_catfish, terms_of_service, strike] — wave 3 a single
Strike, won). Open finding (2026-11-07, sim-findings.md): "Gauntlet's
party-mirrored Reunion pack ... Live reason killers die in their second
fight; the arena's wave-3 pack is the killer's second fight, not a
fresh first."

"Second fight" (killersurvive): a wave-4 killer's next turn-based fight
after the kill. Killers die in ~5–12 days; the TB-fight killer deaths
on the staged band were Reunions (53004 d90, 53008 d104) and a Suburb
(53005 d91), all ending with the monster at 55–94% HP left — the killer
barely scratched the next beast. The question here is whether the
Gauntlet's wave 3 is one systematic shape of that second fight: the
killer walks into a contest, wins waves 1–2 at a cost (no rest between
waves), and meets wave 3 already spent.

## Code facts read before any judged replay (hypotheses to verify live, not verdicts)

- **Wave count is fixed; wave composition is a random draw.**
  Gauntlet phase (contests.js:3040): `do: { arena: { waves: 3 } }` —
  fixed 3 waves (Pit waves 1 at :3017, Siege waves 3 at :3450).
  `_contestArena` (contests.js:4717) picks one beast id per wave: for
  wave index i, `hot = (i>0 ? 1 : 0) + (hardened ? 1 : 0) + (rival ? 1
  : 0)`; candidates = `monsterWavePool()` filtered `m.wave <=
  unlockedWave() + hot`; uniform random pick (`src[Math.floor
  (Math.random()*src.length)]`). Nothing in the draw reads party size.
- **Pack size is decided at spawn, per monster def.** `startCombat`
  (game.js:34501) calls `tbPackSpawnCount(mdef, partyN)`
  (partyTactics.js:95). Reunion is the ONLY monster with
  `packSpawn {mirror: true, max: 3}` (monsters.json:6330) → count =
  min(3, partyN). The only other pack-spawners are hushwolf (solo 1 /
  party 4) and heckler (solo 1 / party 3). partyN = 1 + villagers
  joining (up to 4 villagers within 4 squares, game.js startCombat);
  at Haven a Gauntlet typically fields partyN 4 → a Reunion wave is 3
  beasts of 1200–1400 HP each (3600–4200 HP total).
- **Base rates at unlockedWave 4** (computed from monsters.json, 72
  monsters): waves 1–2 draw from pool wave ≤4 (59 monsters,
  P(Reunion) = 1/59 ≈ 1.7% per draw); wave 3 draws with hot +1 from
  pool wave ≤5 (69 monsters, P(Reunion) = 1/69 ≈ 1.4% per draw).
  P(wave 3 is any wave-4/5 beast) = 20/69 ≈ 29%. P(wave 3 is any
  pack-spawner: hushwolf/heckler/reunion) = 3/69 ≈ 4.3%. A Reunion on
  wave 3 is therefore a RARE draw per Gauntlet — but the Gauntlet
  itself is not rare (two fired on the 53006 replay leg, d100 + d115).
- **No rest between waves** (CONTESTS.md + `_contestArenaAfter`):
  winning a wave chains the next `startCombat` inside the won fight's
  tbEnd; HP, wounds and spent resources carry over.

## Questions (pre-registered)

1. **Is the Gauntlet wave-3 pack party-mirrored by design (pack
   size/composition scales with party size) or a fixed pack?** What in
   the contest code decides wave composition — cite `_contestArena`
   and the wave-composition code.
2. **Across replays, does wave 3 systematically kill the party's
   second fight?** Measure wave-by-wave outcomes (party size in, pack
   composition, rounds, HP left, deaths) and whether wave-3 deaths
   concentrate on wave-4 killers / veterans.
3. **What would count as "party-mirrored" vs "fixed pack"** — the
   deciding observation, stated now (see below), judged only against it.

## Deciding observation (Q3 — binding)

**Party-mirrored** = for a FIXED drawn wave list, the number of beasts
spawned on the Reunion wave equals min(3, partyN): 1 beast with a solo
scholar (partyN 1), 2 with partyN 2, 3 with partyN ≥ 3 — while the drawn
beast ids do NOT depend on party size (the same wave list is drawn
solo and partied). **Fixed pack** = the same wave list spawns the same
beast count regardless of partyN, or the wave list itself is fixed per
contest rather than drawn. The live test is the contrast: run the
identical wave list ['buffering','sunback','reunion'] solo vs with a
4-person party and count Reunions spawned on wave 3. A 1-vs-3 contrast
is party-mirrored; equal counts are a fixed pack.

Corollaries stated now so they cannot be re-cut later: the mirroring,
if present, lives in the MONSTER def (`tactics.packSpawn.mirror`),
applied at spawn — not in the contest. The Gauntlet itself is neither
mirrored nor fixed-pack: its wave count is fixed (3) and its beast ids
are a uniform random draw. A verdict of "party-mirrored" therefore
means "the Reunion mirrors; the Gauntlet draws" — the pack is the
monster's rule, the draw is the contest's luck.

What would FALSIFY the systematic-killer claim (Q2): the synthetic
sweep shows the party winning wave 3 as often with a Reunion draw as
without one; or wave-3 deaths fall on non-killers at the same rate as
on wave-4 killers; or the full-sim legs show Gauntlet wave-3 deaths
only of non-killer scholars. Any of those makes Q2 DIAG-NO-GO on the
"systematic" half (the mechanism facts in Q1 still stand).

## Method

1. **Full-sim replay legs (8 seeds, 150d, death-aware):** 53006 (the
   Sari case) + 53001, 53002, 53003, 53004, 53005, 53007, 53008 —
   baseline competent policy, stageally instrument + arena capture
   wrapper, reusing `scripts/arena-replay-20261107.js` with OUTDIR
   `evidence/2026-11-07/perseed-gauntlet-pack-b/` (sims write once, on
   purpose). Record per Gauntlet: contest, waves drawn (ids), per-wave
   outcome/rounds/scholar-HP-after, party size in, pack composition
   (beast counts), deaths (scholar id, was the dead scholar a wave-4
   killer per killerTrack / waveKillLog, veteran status), monster HP
   left on losses. Contingency, stated now (trajfrag-b): replays may
   diverge from corpus days; judge CHANNELS, cite channels not days.
   If the legs yield <2 Gauntlets total, Q2's "systematically" verdict
   rests on the synthetic sweep + corpus cases and must say so.
2. **Synthetic Gauntlet sweep (proof-test style, real draw):** staged
   party at Haven (scholar + 3 allies, unlockedWave 4), N=16 real
   Gauntlet chains via `_contestArena` with the REAL random draw
   (seeded RNG, varied seeds — no forced beast ids, no HP nerfs),
   played to win with the arena-b fight-driving pattern
   (tbPlayerStrike / tbPlayerWait + tbAdvance). Record per chain:
   waves drawn, per-wave outcome/rounds/HP, pack counts, deaths.
   Corpus JSON under `evidence/2026-11-07/perseed-gauntlet-pack-b/`
   if the sweep runs as a script; otherwise the numbers live in the
   proof test output quoted in the evidence file.
3. **Synthetic mirror contrast (proof test):** identical wave list
   ['buffering','sunback','reunion'] at partyN 1 (solo) vs partyN 4
   (3 allies) — count Reunions spawned on wave 3. Arena-b leg A
   already proved partyN 4 → 3; the solo contrast (partyN 1 → 1) is
   the new bit. Proof test: `scripts/test-gauntlet-pack-20261107.js`.
4. **Sense-test:** read the fight transcript of at least one wave-3
   pack death (say tail from the capture wrapper) — judge whether it
   reads as a fair second fight or an ambush, never just counts. Quote
   the lines.
5. **Instrument-fix naming:** if the trace shows a recorder gap (e.g.
   wave-by-wave HP is unrecorded, or pack counts are invisible in the
   fight taxonomy), NAME the instrument fix precisely; do not build it.

## DIAG-GO (binding — judge ONLY against this)

- **Q1 GO** iff: the wave-composition code is cited (draw rule + hot
  rule + phase `waves: 3`) AND the live mirror contrast is measured
  (same monster id, pack count varies with partyN as min(3, partyN))
  AND the verdict names which layer mirrors (monster def, not
  contest). Otherwise Q1 DIAG-NO-GO.
- **Q2 GO** iff: wave-by-wave outcomes are measured on ≥8 Gauntlet
  chains total (replay + synthetic) with party size in, pack
  composition, rounds, HP left and deaths recorded AND the verdict
  states whether wave-3 deaths concentrate on wave-4 killers /
  veterans (killerTrack / waveKillLog where available; synthetic legs
  measure wave-3 lethality for a 4-person party at unlockedWave 4 and
  the killer-concentration half comes from the replay legs + corpus
  cases) — with an explicit "insufficient data" branch if <2 wave-3
  deaths are observed. Otherwise Q2 DIAG-NO-GO.
- **Q3 GO** iff: the deciding observation above is the one judged
  against (no re-cut), and the verdict states mirror-vs-fixed on that
  observation alone. Otherwise Q3 DIAG-NO-GO.

No metric is re-scored mid-run; if a metric proves wrong it goes under
"metric review" and is proposed for the NEXT run.

## Wall numbers

Report from the replay legs where applicable (wins, national/global,
table, wave 4–5 unlocks/faced/kills, readiness-5-ready days, median
survival). The replays are single-seed legs, not a panel — report
per-seed values and say so plainly; do not fabricate a panel median.
Balanced panel (§15): INAPPLICABLE — no armed leg exists in this arm
(DIAG only, no before/after pair); no compare `.md` is fabricated.
Telemetry check: run against the replay corpus if it accepts recorder
input, else record the refusal as the prior arms did.

## What this arm does NOT claim

- Not a fix: zero src/js. Any fix is NAMED, not built. If a fix needs a
  design call (e.g. cap the Reunion mirror in the arena, or weight the
  wave-3 draw away from pack-spawners), name it and do NOT build it.
- Not a contest-balance claim beyond the two questions: no win/rate
  numbers are judged here except the wave-by-wave outcomes the
  questions require.
- Not a re-verdict on stageally/killersurvive/arena-b: the census and
  the arena findings stand; this arm answers the pack question they
  left open.
- Not a claim that corpus days reproduce: trajectories are fragile;
  channels are the evidence.
