# sim-gorgeprice-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261115T1055Z`, axis winnability chain, arm
sim-gorgeprice-b (cascade gorge-pricing follow-up, winnability-chain
blank: price the gorge). Branch `sim-gorgeprice-b`. Base master
`9fa74d252` (coordinator evidence tip; the worktree branch tip equals
master at run start — verified `git log -1 master` = `git log -1 HEAD`).

## The question, in plain words

The lingerer guard works — it halves same-day cascade deaths (P1
0.1248 → 0.0665 at the 16-seed cascade confirm, gap-0 39 → 11,
survival 123d → 145.5d) — but it was KILLED for landing under the old
cost bar because villages starved more (pooled starvation 3 → 8
against a bar of ≤ 5). The mechanism behind the cost is known: a
besieger that is no longer fought in the hall survives to gorge the
full ~6 nights instead of two, and gorge nights rose 645 → 1172
(+82%) — each gorge night drains ~500–1500 kcal from the pantry. The
old bar was a pooled absolute starvation count, which punishes a
lever that extends life (more lived-days = more exposure) and cannot
tell a designed price (the gorge, priced by the design itself: "the
gorge is the price") from an unpriced harm. This run prices the gorge
and re-judges the SAME lever under a REVISED, rate-based cost bar on
FRESH seeds with a FRESH control.

**The 0930Z NO-GO under the old bar stands.** This is a NEW judgment
under a revised bar, not a re-score of the kill. The lever is re-run
unchanged; the bar FORM changes (rate-based, not pooled-count), the
seeds are fresh, the control is fresh. If this run goes GO, the lever
is a LANDING CANDIDATE under the new bar — the coordinator lands it,
and the evidence says plainly that the old NO-GO still stands as the
judgment under the old bar.

## The lever (unchanged from sim-cascade-b)

**LINGERER HOLDS THE TREELINE** (`src/js/game.js`, `monsterTurn()`):
when the player-tile monster is a lingering raider, `monsterTurn()`
returns early — it does not step onto the scholar and does not start
turn-based combat on contact. Recovered from branch `sim-cascade-b`
commit `942e15ca5` (`git checkout 942e15ca5 -- src/js/game.js
scripts/test-cascade-b.js scripts/cascade-driver-20261115.js
scripts/analyze-cascade-b.js`); the game.js diff vs master must be
ONLY the monsterTurn guard. No other game-code change. Policies
byte-identical. The nightly gorge, the ~6-night drift valve, the
breach for non-lingering intruders, and the Fight-button path
(`startCombat` untouched) are all unchanged.

## Frozen definitions

- **P1 (primary):** pooled scholar `the wild` deaths while national
  / pooled national-days-live (same definition as the cascade
  analyzer: a death counts while-national if its game day is a
  national-live day in the seed's series).
- **Starvation:** a death whose cause or kind matches
  `/starv|hunger/i` (same as the cascade analyzer).
- **Lived-days:** sum over seeds in the leg of `r.days` (days the
  village lived; death-aware — dead villages stop simulating, +10d
  tail max per the driver).
- **Starvation rate:** pooled starvation deaths per 100 lived-days
  = 100 × pooled starvation / lived-days.
- **Gorge nights (voiced):** linkLines matching
  `/gorges at the treeline — ([\d,]+) kcal gone/` — one per voiced
  gorge night, kcal parsed from the line (commas stripped). CAVEAT,
  frozen: the line is only SAID when the scholar is at Haven (GORGE
  GATE, sim-gorgeharness-a 2026-11-06) while the take/raidPillage
  mechanics run identically when the scholar is away — so voiced
  gorge nights and voiced gorge kcal are a LOWER BOUND on the true
  gorge. Reported as "voiced gorge nights / kcal" throughout, never
  as the full gorge.
- **Zero-kcal gorge nights:** linkLines matching
  `/circles the treeline, sniffing at empty stores/` — a siege night
  on an empty pantry (the gorge took 0 kcal but the siege continued).
  Counted separately, never folded into the kcal sum.
- **Gorge price, reported armed vs control:** (a) voiced gorge
  nights per 100 lived-days; (b) voiced gorge kcal per 100
  lived-days; (c) mean kcal per voiced gorge night; (d) gorge kcal
  per siege — a siege is a maximal run of consecutive-day voiced
  gorge lines naming the same monster (the name in the line); total
  voiced gorge kcal / siege count, plus mean nights per siege.
  (d) is descriptive; (a)–(c) are the priced comparison.
- **Gap-0 followers / same-instance pairs:** same definitions as the
  cascade analyzer (gap in days to the previous scholar death of any
  cause; same-instance = shared worldMonsterInstance id across
  consecutive scholar wild deaths).
- **Villager combat deaths (§14c co-primary, descriptive):** the
  driver's `villagerCombatDeaths` (non-scholar deaths) per 100
  lived-days, armed vs control. Reported, no bar — the bar set below
  is the frozen judgment; a large villager-death move would be
  investigated in the evidence, not re-scored into the verdict.

## Pre-registered bars (judge — tighten only, never loosen)

- **P1 (primary):** armed ≤ **0.6x control** (pooled P1 ratio).
- **P2 (secondary, reported not a gate):** median national
  held-days armed vs control. Recorded because the cascade confirm
  already passed it (57 → 70.5); a regression here would be
  investigated in the evidence and the §15 panel, but this arm's
  question is the gorge price, so P2 does not kill the lever on its
  own. (Frozen here, before any sweep — not a mid-run change.)
- **REVISED cost bar (binding — all three must pass):**
  1. starvation per 100 lived-days, armed ≤ **1.25x control rate**;
  2. pooled starvation tripwire: armed pooled ≤ **control pooled + 2**;
  3. median survival armed ≥ **0.8x control**.
- **Gorge price:** reported armed vs control per the definitions
  above; no GO/NO-GO bar of its own — it is the explanation of the
  cost, and the cost bar above is the judge.
- **Guardrail:** wins / table — none expected on this pre-seat
  substrate; any win movement in either direction is investigated
  in the evidence, never a verdict by itself (§15).
- Horizon **150d**, death-aware (dead villages stop simulating).
- Seeds: pilot **100301–100308**; confirm **100301–100316** (only if
  the pilot gate passes).
- Policies: control `competent-answercourt-b` (the cascade substrate).
  Armed leg: same policy, game-code lever ON.
- Driver: `scripts/cascade-driver-20261115.js` with
  `RUN=gorgeprice-b`, `OUTDIR=perseed-gorgeprice-b-control` /
  `perseed-gorgeprice-b-on`. The judged control leg is the FRESH
  gorgeprice control corpus on the current tip — never the committed
  cascade corpora (they go stale when game code drifts; the 0930Z
  run re-ran fresh controls for exactly this reason). Cascade's
  100201–100216 numbers are context only, never the judge (different
  seeds).

## Seed-band freshness (verified before the prereg commit)

- Band: pilot 100301–100308, confirm 100301–100316.
- Scope: every `evidence/*/sim-*-prereg.md` (all dates), per-seed
  grep for each of 100301–100316 — **all 16 clean, zero hits**.
- The only near-matches for the "10030"/"10031" prefix are 5-digit
  seeds, not this band: `evidence/2026-10-28/sim-spandraw-playpath-b-prereg.md`
  (calibration seed 10030, NOT in any judged band) and
  `evidence/2026-10-27/sim-spanpromo-b-prereg.md` (band 10021–10032).
  Neither names 100301–100316.
- Filename check: no `evidence/2026-11-15/perseed-gorgeprice-b-*`
  dirs and no `*gorgeprice*` evidence files existed before this run.
- No forbidden/contaminated band list naming this band was found
  (the word "forbidden" appears in unrelated goal hidden_files
  notes only; no band list among them names 100301–100316).

## Pilot gate (all three before any confirm spend)

- (i) Mechanism fires: gap-0 followers FALL armed vs control AND
  same-instance repeat-killer pairs FALL armed vs control.
- (ii) Revised cost bar clean on the pilot band (starvation rate
  ≤ 1.25x control AND pooled tripwire AND survival ≥ 0.8x).
- (iii) P1 moves in the GO direction (armed pooled P1 < control)
  AND the gap-0 follower count falls.
- Kill the lever at pilot if the gate fails — never run 12–16 seeds
  on an invisible effect. A pilot NO-GO is evidence-only; the lever
  stays unmerged.

## Proof test

`scripts/test-gorgeprice-b.js` proves: the gorge-line parser (voiced
gorge nights + kcal, zero-kcal circle nights, per-siege grouping) on
synthetic linkLines; the bar computation (P1 ratio, starvation rate
per 100 lived-days, pooled tripwire, survival ratio) on synthetic
per-seed summaries; the lever static check (guard inside
`monsterTurn()`, game.js diff vs master is only the guard); and a
determinism leg (armed driver oneRun twice on seed 100301, 60d —
identical deaths/days/endReason/series length). RED→GREEN leg
recorded in the evidence file. The cascade proof test
(`scripts/test-cascade-b.js`, recovered from `942e15ca5`) is re-run
as the lever's own verification; `src/js` is unchanged from the
branch lever, so no `check.js` claim is made (check.js did not run
in this arm).

## Measurement

- Analyzer: `scripts/analyze-gorgeprice-b.js` (extends the cascade
  analyzer: identical P1/gap/same-instance definitions, plus gorge
  parsing, starvation-rate + tripwire + survival bars, per-seed
  gorge tables). Read-only; prints JSON.
- Balanced-panel compare per `docs/MEASUREMENT.md` §15 on the pilot
  band and again on the confirm band
  (`scripts/build-gorgeprice-panels-20261115.js`, cloned from the
  cascade panel builder, reading the gorgeprice corpora); attach the
  compare `.md` to the evidence file.
- Telemetry deviation check per the body (investigate any LOUD line
  the same run; the scale-wall baseline's winseat regime is a known
  invalid comparison for pre-seat substrates — see successorcaution
  §telemetry).
- Evidence: `evidence/2026-11-15/sim-gorgeprice-b.md` with a
  "metric review" section. Per-seed files under
  `evidence/2026-11-15/perseed-gorgeprice-b-{control,on}/`.
- Sense-testing: read the linkLines — do the gorge nights read as a
  siege with a price the village can see, or as silent pantry drain?
  Does the endure-or-sortie choice read sensibly now that the beast
  survives to gorge night after night?

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — waves 4–5 are the killing tier; the
  lingerers are wave-4/5 raiders.
- `docs/SCALE.md` — national is a live relationship; each scholar
  death costs −8 trust on every link.
- `docs/PARTY.md` — the sortie is the designed answer that fights
  the lingerer (`fieldFight`); this arm does NOT build a sortie
  answer (the sortie door is closed by prior evidence — a design
  call, not a tuning knob).
- Prior evidence: `evidence/2026-11-15/sim-cascade-b.md` (PILOT GO /
  CONFIRM NO-GO, kill record) and
  `evidence/2026-11-15/sim-winnability-round-0930.md` (the 0930Z
  prescription this prereg implements).

## Metric review (to be filled in the evidence file)

Pre-registered here: the old pooled-count cost bar punished longer
survival and could not distinguish the designed gorge price from an
unpriced harm — that is why its FORM is revised here, between runs,
never within one. If the rate-based bar passes while the pooled
tripwire fails (or vice versa), the review will say which form caught
what, and whether the gorge price in kcal/siege explains the
starvation rate. If the rate bar fails, the lever's trade is priced
too high at this size and the next step is a gorge answer (design
call), not another re-bar.
