# sim-spawncensus-a — preregistration (per-kind spawn census, FIRST NUMBERS, coverage program Tier 1 #5)

- Run: `fleshout-20261110T1815Z`, Loop A, arm `sim-spawncensus-a`,
  worktree `~/workspace/worktrees/sim-spawncensus-a`, branch `sim-spawncensus-a`.
- Base: master `e5c19e54e` (verified `git log --oneline -1` in the worktree at
  spawn; if master moves before landing, rebase onto the explicit master SHA
  read immediately before rebasing and re-run proof green).
- Band: **170201–170208** (8 seeds, pilot). Seed-band freshness verified
  before this prereg was written (see "Seed-freshness record" below).
- Horizon: **150d max, death-aware** (run until game over; villages that die
  stop simulating, +10d tail max). Why 150d: match the encounterprod-b
  horizon (150d, DAYS=150, competent baseline) so spawn counts compare
  directly with the only prior raw spawn corpus; 150d is long enough for
  W4 to appear on seeds that unlock it (W4 gate: standing >= 100 + readiness;
  encounterprod-b reached W4 on some seeds at 150d) and for W5 to appear on
  the strongest seeds, while staying inside observed village lifetimes.
- Policy: `scripts/policies/competent` (verbatim, NOT modified) via the
  existing `scripts/encounterprod-driver-20261105.js` with
  `POLICY=baseline`, `RUN=spawncensus-a`,
  `OUTDIR=evidence/2026-11-10/perseed-spawncensus-a`. No new policy.
  No game-code change — MEASUREMENT ONLY. No gate/price/deed/readiness
  change. Zero `src/js` expected.
- Canon: docs/CANON.md read first; docs/MONSTER-WAVES.md read (wave law,
  gates, roster counts, readiness bars, Network scaffold). Note the canon
  doc's roster counts are STALE vs `src/data/monsters.json`: MONSTER-WAVES.md
  says W1 15 / W4 9 / W5 8, while the coverage audit (read from data) says
  W1 25 / W4 10 / W5 10, 72 kinds total. The census roster is derived from
  `src/data/monsters.json` at analysis time, not from the canon doc's prose
  counts; any mismatch is reported as a finding, not silently resolved.
- Coverage audit read:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/coverage-audit-20261110.md`
  (§2 + §1 item 5, §5 gap #5): no per-kind spawn census exists anywhere;
  raw per-spawn records exist in two corpora and a census is computable
  from them but never has been; W1/W2 kills are channel×wave aggregates
  only; W5 kills hide inside the `w4plusKills` aggregate; W6 has no spawn,
  kill, or faced record anywhere.

## What this arm is (and is not)

- FIRST NUMBERS for the coverage program: the item has never been counted
  per kind on any band. This arm aggregates the existing raw spawn arrays
  into a per-kind census on a fresh band — it does NOT re-judge any earlier
  arm's verdict and it changes no lever.
- Instruments reused, not rewritten:
  `scripts/encounterprod-instrument-20261105.js` (records every
  `spawnWorldMonster` call `{seq, day, id, wave, tx, ty, source, veteran}`,
  every `castMonster`, every `startCombat`/`fieldFight` as faced rows, and
  the full `waveKillLog` at finalize) + its driver. The instrument's
  analyzer (`scripts/encounterprod-analyze-20261105.js`) reports only
  wave-4 totals, so this arm adds `scripts/spawncensus-analyze-20261110.js`
  (new file, pure function over the same per-seed JSONs) that aggregates
  per kind per wave. The new analyzer EXTENDS the existing one in scope;
  it does not fork the instrument.
- Kill source of truth (verified in code before this prereg):
  `Game.state.waveKillLog`, pushed at `src/js/game.js:34580` as
  `{d, mid, w, by, via, trick}`, deduped, capped at 1000 entries — it
  carries `mid` AND `w` for ALL waves, so per-kind kills for W1/W2/W5 are
  derivable from it. The audit's §6 question is answered: `monsterKills`
  records carry NO mid/wave — `state.codex.monsterKills` was never written
  (`src/js/abilityActions.js:2260`); `metaProgression` keeps only a scalar
  `count.monsterKills`; `villager-agency` keeps a per-villager scalar.
  W1/W2 per-kind kills come from `waveKillLog` only.
- Faced = a `fights` row (player `startCombat` or villager `fieldFight`)
  naming that `mid`. Spawned-but-never-faced and faced-but-never-killed
  are separate census columns.

## Primary deliverable and verdict rule (pre-registered)

**GO** iff ALL of the following hold:

1. The instrument runs to completion on every pilot seed (8/8 per-seed
   JSONs written, no seed crash, no missing section — spawns, casts,
   fights, daily, waveKillLog, wavesFaced).
2. **0 instrument errors** across all 8 seeds
   (`instrumentErrors.length === 0` in every per-seed file).
3. **Census completeness**: for every wave W1–W5, every kind in the
   `monsters.json` roster for that wave has a spawn/kill/faced row in the
   census table — a count (possibly 0) or an explicit `unmeasurable`
   marking WITH a reason (e.g. a kind that can only spawn through a path
   the instrument does not wrap). No wave/kind cell is silently absent.
4. **W5 kills separated**: the census reports W5 kills per kind from
   `waveKillLog` `w === 5` rows, distinct from W4 kills — no seed's W5
   kills are left inside a w4plus aggregate in this arm's output.
5. The analyzer reproduces the known corpus on the old band: re-aggregating
   the encounterprod-b corpus (`evidence/2026-11-05/perseed-encounterprod-b/`,
   baseline run) reproduces its published wave totals (the audit's example
   seed: 49 spawns — W1 19, W2 10, W3 14, W4 6, W5 0) exactly, and the
   analyzer is deterministic (two runs, byte-identical output).

**NO-GO** if any of 1–5 fails. A NO-GO on completeness still publishes the
partial census with the unmeasurable cells named — the blank is documented,
not hidden.

## W6 DIAG (separate question, same evidence file)

The Network march (W6: `network_heart`, `network_limb`, `network_tower`)
is a separate DIAG, judged on its own:

- Organic reach: the 150d competent band is NOT expected to summon the
  Network. Summon gate (verified in code before this prereg):
  `src/js/network-campaign.js` header + `src/data/titans.json`
  (`the_network.keyTier: 3`) — Overtime tier >= 3 AND herald, nielsen and
  finale all slain. The march then places 9 pieces via `spawnWorldMonster`
  (`networkSummon`, one piece per 3x3 sector, 4 towers / 4 limbs / 1 heart)
  and fights them in order with one 20-blade coalition.
- DIAG attempt: run the `network()` debug scenario
  (`src/js/debug-scenarios.js`, which sets the three slain flags, calls
  `networkSummon()`, musters 20 debug blades, and places the scholar at
  the first node) under the same spawn instrument, and attempt the node-1
  fight. Record: pieces spawned per kind (expect 4/4/1), first node faced
  or refused, and the exact refusal text if refused.
- DIAG verdict: **COMPLETED** iff either (a) W6 faces are recorded, or
  (b) the march is unreachable from the instrument AND the evidence file
  documents EXACTLY why (which gate stops it, what the probe recorded
  instead). An honest unreachable with the reason is a completed DIAG,
  not a failure to try. The DIAG verdict does not affect the census GO.

## Seed-freshness record

- Candidate band 170201–170208 checked 2026-11-10 before this prereg:
  - `grep -rl "17020[1-8]" evidence/ --include="*prereg.md"` — NO hits
    (all dated preregs searched, per the seed-band-freshness skill).
  - `grep -rl "17020[1-8]"` over `evidence/2026-11-08/`–`2026-11-10/` —
    hits only in `evidence/2026-11-09/radsnap-a-corpus*/feveranat-a-*.json`,
    where `170201` is a substring of a floating-point value
    (`875.2317020148043`), not a seed. Not a reservation.
  - Goal hidden_files checked for a forbidden/contaminated band list —
    none exists (only `sim-heraldband-pilot-prereg-2018.md`, a filename
    match, not a list). No `170201` reservation found there.
  - Recent bands in use (not reused): 150201–150208, 140201–140208,
    160201–160208 (roleform-b), 99101–99108, 110001–110016.
- Conclusion: **170201–170208 is fresh.**

## Comparison context (not judge)

- encounterprod-b (2026-11-05, 150d, competent baseline, seeds 99141–99145):
  example seed 49 spawns (W1 19, W2 10, W3 14, W4 6, W5 0); W4 kills and
  faces counted only as wave totals.
- r162 endgame (2026-11-09, seeds 89701–89707): W5 faced — `editor` d73
  (89702), `rerun` d64 / `cancellation` d65 / `editor` d90 (89704);
  W3 faced 7–8/9 per seed; W4+ kills per kind recorded (e.g. 89702:
  `algorithm` d44, `influencer` d68, `editor` d79 — the `editor` kill is
  a W5 kill sitting inside the w4plus aggregate).
- r126 scale: W4 kills per kind on 4 seeds; W5 kills 0 on all 4 seeds.
- Heraldsplit (16 runs): W4 kills by kind (`eater` 4, `influencer` 5,
  `congregation` 2, `eulogy` 2, `audit` 1, `algorithm` 1, `suburb` 1);
  W5: 0 kills, 6 unmet spawns (class-level only).

## Metric review (to fill at run end)

- Did the pre-registered completeness bar measure the right thing? Was
  any wave/kind cell unmeasurable for a reason the prereg did not foresee?
  Did the 150d horizon let W4/W5 appear, or did villages die first?
  Should the next census use a longer horizon or a stronger policy?
