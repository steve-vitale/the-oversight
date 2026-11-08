# sim-mirrorcap — cap the Reunion mirror in arena fights: NO-GO (M2)

**Arm:** build-mirror-cap (Build 2) · **Base:** master tip 783c33400 ·
**Worktree:** `~/workspace/worktrees/build-mirror-cap` ·
**Prereg:** `evidence/2026-11-07/sim-mirrorcap-prereg.md` (committed first
as 82cb609d9; cap 1 and GO bar frozen before any code changed) ·
**Steve's call (2026-11-07, lean):** "Probably cap mirror for arenas."
**Proof:** `scripts/test-mirror-cap-20261107.js` **29/29 green** ·
**Panel driver:** `scripts/mirrorcap-panel-20261107.js` ·
**Corpus:** `evidence/2026-11-07/perseed-mirrorcap/` (32 JSON rows:
16 seeds × baseline/armed, 0 instrument errors).

## Verdict: NO-GO — but read the why, it is not the cap failing

Judged against the frozen bar:

- **M1 — the cap fires: PASS.** Arena Reunion count ≤ 1 on every chain
  that reached the Reunion wave (2/2 armed; 1 vs 3 on both matched
  pairs).
- **M2 — the draw stops being auto-fatal: FAIL.** Armed arm won **0**
  Reunion waves (bar: ≥ 1). Baseline also won 0.
- **M3 — no regression, non-arena control: PASS.** Proof test 29/29:
  field Reunion with partyN 4 still spawns 3, solo still 1.

**GO requires M1+M2+M3. M2 failed, so the verdict is NO-GO as
preregged.** The report does not soften that. But the number behind M2
is **n = 2 exposures, not 16**: only 2 of the 16 chains ever reached
the Reunion wave, because the panel design (not the cap) starved M2 —
see "Panel design flaw" below. On those 2 exposures the cap
demonstrably changed the fight (7 rounds vs 2; 14% damage dealt vs
~1%), yet a fresh 100-HP un-geared scholar still died to a SINGLE
Reunion (60–80 damage a hit). M2-as-written conflates "mirror count"
with "base Reunion lethality vs a fresh scholar". Whether cap 1 makes
the draw winnable for a REAL Gauntlet contestant — a geared scholar
like Sari, who won waves 1–2 at 71% HP — is **unmeasured**, not
disproven. The follow-up is a panel that actually reaches wave 3 (see
below); it needs its own prereg, and no extra seeds were run here to
chase the bar.

## The change (what shipped in this worktree)

- `src/js/partyTactics.js`: `REUNION_ARENA_MIRROR_CAP = 1`, exposed as
  `Game.REUNION_ARENA_MIRROR_CAP` so the proof test reads the same
  number the code applies. `tbPackSpawnCount(mdef, partyN, opts)` caps
  a mirror pack at 1 when `opts.arena` is true; every other call keeps
  the old behavior. The cap touches mirrors only — hushwolf (4) and
  heckler (3) are unchanged even with `arena:true`.
- `src/js/game.js` (`startCombat`, one line): passes
  `{ arena: _raidContestAtEntry }` — true exactly when
  `state.arenaContest` was live at entry, which `_contestArena` sets
  before `startCombat` and re-sets per chained wave. Field fights keep
  `min(3, partyN)`.
- The Reunion's mid-fight "Plus One" rally buffs allies; it spawns
  nothing, so the spawn cap bounds the total mirrors in the fight.
  Identity intact: one mirror still wears your face, still plays Your
  Move, still runs the novelty mechanic and flank/focus-isolated
  tactics.

## Proof test: 29/29 green

`scripts/test-mirror-cap-20261107.js` (seed 51003, the gauntlet-test
seed): unit pins (cap constant is 1; field 1/2/3/3, arena 1/1/1/1 at
partyN 1/2/4/6; non-mirror pack-spawners unaffected); arena chain with
a party spawns exactly 1 Reunion on wave 3 (uncapped it was 3); field
Reunion with a party still spawns 3, solo still 1; 3 real
`_contestArena` draws all start live fights whose spawned count equals
the capped prediction. No instrument errors.

## Panel: 16 matched chains, seeds 91002–91017

Fixture (copied from the gauntlet-pack-b sweep): unlockedWave → 4
(live pool asserted 58 incl. Reunion, excl. Herald); fresh scholar
100 HP, no gear; partyN 4; forced wave list
`['buffering','sunback','reunion']` (Sari's d115 list); played to win,
no HP nerfed. Baseline = pristine master extraction at 783c33400 (no
cap code; `capConstant: null` in its rows — the arm fingerprint).
Armed = this worktree (`capConstant: 1`). One process per seed per arm,
identical RNG start; the ONLY difference is the cap.

**Matching is exact:** all 16 chains are byte-identical between arms
through waves 1–2 (same rounds, same HP, same outcomes). The arms
diverge only at the Reunion wave, as designed. 0 instrument errors.
(The baseline extraction has no `.git`, so the harness prints one
harmless `fatal: not a git repository` line per baseline run; the chain
still completes and writes its row.)

### Per-chain outcomes

| Seed | Armed | Baseline | Reached Reunion? |
|---|---|---|---|
| 91002–91009 | died w1 | died w1 | No |
| 91010 | routed w1 | routed w1 | No |
| 91011–91014 | died w1 | died w1 | No |
| 91015 | died w3 | died w3 | **Yes** |
| 91016 | died w3 | died w3 | **Yes** |
| 91017 | died w1 | died w1 | No |

Full-chain wins: 0/16 both arms. Wave-1 deaths: 13/16 both arms; 1
rout (91010, buffering fled at 25% HP after 140 rounds).

### The two matched Reunion waves (the whole M2 sample)

| Seed | Arm | Mirrors | Entry HP | Rounds | Scholar end HP | Reunion HP left |
|---|---|---|---|---|---|---|
| 91015 | armed | **1** | 0.79 | **7** | −0.68 | **86.1%** |
| 91015 | baseline | 3 | 0.79 | 2 | −0.39 | 98.7 / 97.4 / 100% |
| 91016 | armed | **1** | 0.84 | **3** | −0.20 | **97.4%** |
| 91016 | baseline | 3 | 0.84 | 2 | −0.36 | 98.6 / 99.2 / 100% |

The cap fires (M1) and it moves the fight: on 91015 the party lasted
7 rounds instead of 2 and dealt ~14% of a Reunion's HP instead of
~1% spread over three. But the scholar still died in 3–7 rounds to
one Reunion: at 60–80 damage a hit against 100 HP with no gear, two
hits end the scholar. The 6/6 auto-fatal shape (pack barely scratched)
is gone on 91015; the fresh-scholar frailty is not a mirror problem.

## Panel design flaw (recorded, not hidden)

Forcing the FULL Sari list hardened waves 1–2: buffering is a wave-3
beast, so wave 1 of every chain was a wave-3 fight for a fresh scholar
— 13/16 died there. The gauntlet v3 sweep (random wave-1 draws, mostly
wave 1–2 beasts) reached wave 3 in 13/32 chains; this panel reached it
in 2/16. The prereg's M2 assumed exposures the fixture could not
deliver, and the gauntlet test's hp=100 nerf on waves 1–2 had masked
exactly this lethality. Next time: force ONLY the wave under test
(wave 3 = Reunion, waves 1–2 drawn naturally), or use a geared-scholar
fixture like the replay legs. That panel needs its own prereg; this
verdict is judged on the panel as run, not on the panel as wished.

## What this means

- The mechanism is proven: the cap is live, exact, and contained to
  arenas (M1 + M3 pass, proof 29/29).
- The winnability claim is unproven either way on this panel (M2 fails
  on n=2 against a fresh scholar). Do NOT land-or-kill the cap on this
  verdict alone: landing it claims a winnability fix the panel did not
  measure, and killing it discards a proven mechanism over a fixture
  that could not survive one Reunion regardless of count.
- Recommended next step (coordinator call): a follow-up preregged panel
  that reaches wave 3 — force only wave 3 to Reunion with waves 1–2
  drawn, or a geared scholar — and judge M2 there. If the cap still
  shows 0 wins for a realistic contestant, the cap number (not the
  mechanism) is the question: 1 mirror of a 1200-HP wave-4 beast may
  still be too much for the arena, and the design question becomes
  whether the arena Reunion should also be HP- or damage-scaled — a
  Steve-call, not a worker knob.

## Gate

`node scripts/check.js --quick` in this worktree — see
`evidence/2026-11-07/mirror-cap-gate.log`. Result: **283 passed, 7
failed in 922s.** All 7 failures were checked against pristine master
(783c33400) and **none is caused by this change**:

- `test-measurement-proof-update` + `test-measurement-workflow` —
  identical "Proof source inputs are not current" / neutrality-proof
  failures on pristine. The retained neutrality proof was already stale
  at the base commit.
- `test-mobile-combat-cadence` — identical 2 failures on pristine
  (13 passed, 2 failed both arms).
- `test-occupation-panels` — identical "real CLI workflow completed"
  failure on pristine.
- `test-phone-frame-proof` — the core "every retained browser input
  matches current source" failure is identical on pristine; the
  retained receipt was already stale at base. (Sub-assertion counts
  differ because the pristine comparison ran in an archive extraction
  missing `version.json`.)
- `test-trust-observer-neutrality` — TIMEOUT at check.js's 120s
  per-test cap in the gate; run directly it passes 6/6 on BOTH arms
  (~70s armed, ~169s pristine — the cap, under parallel load, not the
  change).
- `test-establishment-r20-fixes-20261020` — identical failure on
  pristine ("next day voices once more: expected 2, got 1", racks/voice
  code this change does not touch).

No gate failure traces to the cap, the proof test, or the panel driver.
The freshness failures (measurement/phone-frame proofs) are the
documented consequence of a stale retained proof at base, not of this
build; refreshing them (`scripts/balance-proof-update.js`,
`scripts/phone-frame-proof-update.js`) is a separate maintenance job,
not part of this build's verdict.
