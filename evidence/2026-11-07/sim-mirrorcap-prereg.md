# sim-mirrorcap-prereg — cap the Reunion mirror in arena fights

**Arm:** build-mirror-cap (Build 2) · **Base:** master tip 783c33400 ·
**Worktree:** `~/workspace/worktrees/build-mirror-cap` ·
**Steve's call (2026-11-07, lean):** "Probably cap mirror for arenas."
**Status:** preregistered BEFORE any game code changed. The cap number and
the GO bar below are frozen; do not change them after seeing results.

## The problem, as verified

sim-gauntlet-pack-b (2026-11-07, evidence `sim-gauntlet-pack-b.md`):
the Gauntlet draws its beasts at random from the unlocked pool; when the
draw is a Reunion, the Reunion arrives as `min(3, partyN)` beasts
(`tbPackSpawnCount`, partyTactics.js:95; the ONLY monster with
`packSpawn {mirror: true, max: 3}`, monsters.json:6330). A 4-person party
faces three wave-4 beasts. Across all instruments: **7 Reunion draws, 6
fought, 6 fatal** — on wave 1, 2 and 3 alike, packs at 97.6–100% HP when
the scholar died. No other beast is 6/6. The draw is rare (~1.6% per
wave), but a drawn Reunion is auto-fatal.

## The pinned cap

**`REUNION_ARENA_MIRROR_CAP = 1`** — in arena fights only, the Reunion
spawns at most **one** mirror, whatever the party size. Non-arena Reunion
encounters keep the existing behavior (`min(3, partyN)`, uncapped).

Why 1, and why not the alternatives:

- **1 keeps the identity.** One mirror still wears your face, still
  plays Your Move, still runs the novelty mechanic and the flank /
  focus-isolated tactics. The Reunion is still "the village you failed,
  given teeth — knows every tactic you've used" (MONSTER-WAVES.md).
  What goes away is the party-vs-party mirror match: three copies of
  your party, each a 1200–1400 HP wave-4 beast, is what made the draw
  auto-fatal.
- **1 is the shape the game already calls fair.** Solo scouts already
  face exactly 1 Reunion (partyTactics.js header: "Solo scouts keep a
  fair duel"). The cap makes an arena Reunion a fair duel at any party
  size, instead of a duel for solos and a firing squad for parties.
- **Half-party (2 for partyN 4) was considered and rejected:** two
  1200+ HP mirrors still present the same wall in miniature, and the
  6/6 evidence gives no reason to think 2 is survivable where 3 was
  not. A bigger cap would need its own measurement to justify.
- **Capping total mirror HP was considered and rejected:** a new
  scaling mechanic for a lean cap fix; out of scope.
- The cap is a named constant the proof test reads
  (`Game.REUNION_ARENA_MIRROR_CAP`), applied at the single choke point
  `tbPackSpawnCount(mdef, partyN, opts)` — `opts.arena` true only when
  `state.arenaContest` is live at `startCombat` (which `_contestArena`
  sets before calling `startCombat`, and re-sets before each chained
  wave). The Reunion's mid-fight "Plus One" rally buffs allies; it
  spawns nothing, so the spawn cap bounds the total mirrors in the
  fight.

## GO bar (frozen)

On the matched 16-chain panel (below), armed vs baseline on identical
seeds:

- **M1 — the cap fires:** arena Reunion mirror count ≤ 1 on EVERY chain
  that reaches the Reunion wave, armed arm (16/16 of those reached).
- **M2 — the draw stops being auto-fatal:** armed arm wins ≥ 1 Reunion
  wave across the 16 chains (baseline won 0/6 fought draws). Also
  reported: full-chain wins per arm.
- **M3 — no regression, non-arena control:** a field (non-arena)
  Reunion fight with partyN 4 still spawns 3 mirrors, solo still 1
  (proof test, not panel).

**GO** iff M1 and M2 and M3 all pass. **NO-GO** if any chain spawns
> 1 arena mirror, or the armed arm wins 0 Reunion waves, or the
non-arena mirror stops firing. If the armed arm wins 0 Reunion waves
the verdict is NO-GO as preregged (the cap as pinned did not make the
draw winnable); the report will say whether the deaths look like
mirror-count or like base Reunion lethality, but the bar does not move.

## Panel design (frozen)

- **Fixture (copied from the gauntlet-pack-b sweep, so the numbers are
  comparable):** unlockedWave → 4 (gate bypassed in-test only; live
  pool asserted 58 monsters incl. Reunion, excl. Herald — the sweep
  FAILS LOUDLY otherwise); staged scholar fresh 100 HP, no gear, no
  wave-4 kill; partyN 4 (scholar + 3 allies at Haven centre, roster
  trimmed to those 3); Gauntlet spec `{waves: 3}`; fights played to win
  with the arena-b driver (strike the first live monster each player
  turn, `tbAdvance` otherwise); no HP nerfed anywhere.
- **Forced wave list:** every chain runs the FIXED list
  `['buffering', 'sunback', 'reunion']` — the exact list from the
  gauntlet-pack-b unit pins (Sari's d115 list). The random draw is OUT
  OF SCOPE for this panel: it is proven uniform by
  sim-gauntlet-pack-b, this change does not touch it, and at ~1.6% per
  draw a natural-draw panel would need hundreds of chains to see a
  Reunion. The wave list is set on `state.arenaContest` before the
  chain starts (the gauntlet test's leg-1a pattern); the spawn, the
  wave chain and the fights are real code.
- **Matched seeds:** 16 chains, one process per seed per arm, seeds
  **91002–91017**. Same seed + same fixture + same forced list on both
  arms; the ONLY difference is the cap. Baseline = pristine master
  behavior (separate baseline worktree at 783c33400, no cap code).
  Armed = this worktree.
- **Per chain recorded:** waves, partyN at each wave's spawn, Reunion
  count at spawn, per-wave outcome (won/chained/died/routed),
  scholar HP frac after each wave, deaths, instrument errors.
- **Corpus:** `evidence/2026-11-07/perseed-mirrorcap/` (one JSON row
  per seed per arm; panel driver refuses to overwrite).
- **Driver:** `scripts/mirrorcap-panel-20261107.js`
  (`SEED=… ARM=baseline|armed OUT=… node scripts/mirrorcap-panel-20261107.js`).
  **Proof test:** `scripts/test-mirror-cap-20261107.js` (unit pins on
  `tbPackSpawnCount` + arena-spawn ≤ 1 + non-arena still 3).

## Seed-band freshness check (recorded)

Searched `evidence/*/sim-*-prereg.md` (all dates) plus the forbidden /
contaminated band lists quoted in those preregs, and top-level
`evidence/2026-11-0*/*.md`, for the candidate band 91002–91017.
Result: **clean — no hit.** Nearby names found and avoided: 91001
(named in a 2026-11-07 prereg's forbidden list), 92011/92018, 93011/
93026, 94011/94026/94088, 95001/95008, 96001–96008 (away-voice band),
97101–97109, 97201/97208. The 99xxx range is heavily used and was not
chosen. First choice was 99001–99016 (crowded); 91002–91017 is the
replacement after the full search.
