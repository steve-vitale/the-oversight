# sim-gorgeprice2-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261115T1130Z`, axis winnability chain, arm
sim-gorgeprice2-b (cascade gorge-pricing follow-up, SECOND judgment:
corrected cost bar). Branch `sim-gorgeprice2-b`. Base: current master
tip at run start (worktree branch tip; the lever commit `3efd2b420`
from the 1055Z run is NOT an ancestor of this tip — the lever was
recovered by re-applying its guard hunk at the identical
`monsterTurn()` anchor, and the game.js diff vs master is again ONLY
that one hunk, +16 lines, verified before this commit).

## The question, in plain words

The lingerer guard halves same-day cascade deaths and the gorge price
is now measured (voiced gorge kcal +53%, ~1,100 kcal per gorge night —
the price is volume, not price-per-night). But the 1055Z run went
PILOT NO-GO, kill class METRIC-BROKEN: the revised cost bar's rate
leg degenerated to zero-tolerance because the fresh control band
starved nobody (rate 0.0), so 1.25x zero is zero and the armed leg's
2 starvation deaths failed a bar allowing exactly none — while the
pooled tripwire passed at its boundary (2 ≤ 0+2). The bar's two legs
disagreed by construction. This run is a NEW judgment on FRESH seeds
under a CORRECTED bar whose rate leg carries a floor, frozen here
before any sweep.

**The 1055Z NO-GO under the old bar stands, and the 0930Z NO-GO
under the pooled-count bar stands.** This is a NEW judgment under a
corrected bar form, not a re-score of either kill. The lever is
re-run unchanged; the bar FORM changes (floored rate leg), the seeds
are fresh, the control is fresh. If this run goes GO, the lever is a
LANDING CANDIDATE under the new bar — the coordinator lands it, and
the evidence says plainly that both earlier NO-GOs still stand as
judgments under their own bars.

## The lever (unchanged from sim-cascade-b)

**LINGERER HOLDS THE TREELINE** (`src/js/game.js`, `monsterTurn()`):
when the player-tile monster is a lingering raider, `monsterTurn()`
returns early — it does not step onto the scholar and does not start
turn-based combat on contact. Recovered from the 1055Z lever commit
`3efd2b420` (itself recovered from `sim-cascade-b` `942e15ca5`) by
re-applying the identical guard hunk at the identical anchor
(`this.havenTier && this.havenTier() >= 2) return;` /
`const m = this.playerMonster();`, line 24144); the game.js diff vs
master is ONLY the guard (1 hunk, +16 lines, verified by
`scripts/test-gorgeprice2-b.js` static and by
`scripts/test-cascade-b.js` static). No other game-code change.
Policies byte-identical. The nightly gorge, the ~6-night drift valve,
the breach for non-lingering intruders, and the Fight-button path
(`startCombat` untouched) are all unchanged.

## Frozen definitions

Same as the 1055Z prereg, with ONE change (per-siege dropped):

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
  lived-days; (c) mean kcal per voiced gorge night. **Per-siege is
  DROPPED** (the 1055Z metric review proved it unmeasurable from
  voiced lines — sieges fragment to ~1.1 nights each, so "kcal per
  siege" ≈ "kcal per night" and adds nothing). The gorge is priced
  per 100 lived-days only.
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
- **CORRECTED cost bar (binding — all three must pass):**
  1. starvation per 100 lived-days, armed ≤ **1.25 × max(control
     rate, F)**, with **F = 0.5 starvations per 100 lived-days**
     (frozen below — the floor is the correction);
  2. pooled starvation tripwire: armed pooled ≤ **control pooled + 2**;
  3. median survival armed ≥ **0.8x control**.
- **Gorge price:** reported armed vs control per the definitions
  above; no GO/NO-GO bar of its own — it is the explanation of the
  cost, and the cost bar above is the judge.
- **Guardrail:** wins / table — none expected on this pre-seat
  substrate; any win movement in either direction is investigated
  in the evidence, never a verdict by itself (§15).
- Horizon **150d**, death-aware (dead villages stop simulating).
- Seeds: pilot **100501–100508**; confirm **100521–100536** (only if
  the pilot gate passes).
- Policies: control `competent-answercourt-b` (the cascade substrate).
  Armed leg: same policy, game-code lever ON.
- Driver: `scripts/cascade-driver-20261115.js` with
  `RUN=gorgeprice2-b`, `OUTDIR=perseed-gorgeprice2-b-control` /
  `perseed-gorgeprice2-b-on`. The judged control leg is the FRESH
  gorgeprice2 control corpus on the current tip — never the committed
  cascade or gorgeprice corpora (they go stale when game code drifts).
  The 1055Z pilot numbers and the cascade 16-seed numbers are context
  only, never the judge (different seeds).

## The floor F — derivation (frozen before the sweep)

Form (a) from the task brief, chosen over form (b) because the rate
leg should stay a live judge on every band (form (b) would leave the
tripwire alone on nearly every 8-seed pilot, since a fresh control
band usually starves 0–1). F is set from the POOLED corpora, before
any sweep, and never fitted to this run's outcome (which does not
exist yet):

- Cascade confirm control (16 seeds, 100201–100216):
  3 starvations / 2024 lived-days → **0.148 per 100 lived-days**
  (analyzer re-run on the committed corpus, this run).
- Gorgeprice pilot control (8 seeds, 100301–100308):
  0 starvations / 1065 lived-days → **0.0 per 100 lived-days**
  (analyzer re-run on the committed corpus, this run).
- **Pooled control background: 3 / 3089 lived-days = 0.097
  starvations per 100 lived-days.**
- **F = 0.5 per 100 lived-days** — ~5.2× the pooled background
  rate, i.e. one starvation per 200 lived-days, the scale the 1055Z
  metric review named before this run. It sits above single-death
  noise on an 8-seed pilot (one death ≈ 0.09/100d at ~1100
  lived-days) and above the pooled background, while still binding
  against a systematic gorge-driven excess: the allowance with a
  zero control is 1.25 × 0.5 = 0.625/100d.

Cross-checks against the pooled corpora (context, not the judge):
under the corrected bar the 1055Z pilot would pass the rate leg
(0.177 ≤ 0.625) and the tripwire (2 ≤ 2) — the corrected bar is a
new form, and the 1055Z NO-GO under the old bar stands. The old
cascade corpus under the corrected bar would pass the rate leg
(0.369 ≤ 0.625) but FAIL the tripwire (8 vs 5) — the floor does NOT
whitewash the old kill; the tripwire stays the binding leg on small
bands. The two legs remain independent judges: the tripwire catches
absolute excess on small bands, the floored rate leg catches
proportional excess when starvation is common (it binds only when
the control rate itself exceeds 0.5).

## Seed-band freshness (verified before the prereg commit)

- Band: pilot 100501–100508, confirm 100521–100536.
- Scope: every `evidence/*/sim-*-prereg.md` (all dates), per-seed
  grep for each of 100501–100508 and 100521–100536 — **all 24 clean,
  zero hits**; prefix grep for `10050[0-9]|10051[0-9]|10052[0-9]|
  10053[0-9]` over the same files — **zero hits**.
- The only near-matches for the "1005" prefix are 5-digit seeds,
  not this band: `evidence/2026-10-28/sim-arenalabel-b-prereg.md`
  (confirm band 10040–10055) and
  `evidence/2026-10-28/sim-thiefinside-b-confirm-prereg.md`
  (confirm band 10050–10065). Different seed values (10050 ≠
  100501); neither names 100501–100508 or 100521–100536.
- Forbidden to this run (named in the brief): 100301–100308
  (gorgeprice pilot), 100401–100408 (onlylead pilot), 100421–100436
  (onlylead reserved confirm). None overlaps the chosen band.
- Filename check: no `evidence/2026-11-15/perseed-gorgeprice2-b-*`
  dirs and no `*gorgeprice2*` evidence files existed before this run.
- No forbidden/contaminated band list naming this band was found:
  the only files matching `*forbidden*` / `*contaminat*` under
  `evidence/` and the goal `hidden_files/` are
  `evidence/2026-11-06/drive-practice-contaminated-baseline` (a
  baseline directory name, not a seed-band list) and
  `hidden_files/r53/arm-contaminated-backup` (a backup directory,
  not a seed-band list); neither names a seed band.

## Pilot gate (all three before any confirm spend)

- (i) Mechanism fires: gap-0 followers FALL armed vs control AND
  same-instance repeat-killer pairs FALL armed vs control.
- (ii) Corrected cost bar clean on the pilot band (floored
  starvation rate ≤ 1.25 × max(control rate, 0.5) AND pooled
  tripwire AND survival ≥ 0.8x).
- (iii) P1 moves in the GO direction (armed pooled P1 ≤ 0.6x
  control) AND the gap-0 follower count falls.
- Kill the lever at pilot if the gate fails — never run 12–16 seeds
  on an invisible effect. A pilot NO-GO is evidence-only; the lever
  stays unmerged.

## Proof test

`scripts/test-gorgeprice2-b.js` proves: the CORRECTED bar
(`computeBars` with `{ rateFloor: 0.5 }` — floored rate leg, the
zero-control degeneracy fixed, the old unfloored form preserved
when no floor is given); the lever static check (guard inside
`monsterTurn()`, game.js diff vs master is only the guard); the
gorge parse (reused from the gorgeprice analyzer); and a
determinism leg (armed driver oneRun twice on seed 100501, 60d —
identical deaths/days/endReason/series length). GREEN before any
landing. `scripts/test-gorgeprice-b.js` (4/4) and
`scripts/test-cascade-b.js` (4/4) are re-run as the lever's own
verification; `src/js` is unchanged from the branch lever, so no
`check.js` claim is made (check.js did not run in this arm).

## Measurement

- Analyzer: `scripts/analyze-gorgeprice-b.js` (extends the cascade
  analyzer: identical P1/gap/same-instance definitions, plus gorge
  parsing, floored starvation-rate + tripwire + survival bars via
  `computeBars(control, armed, { rateFloor: 0.5 })` — the floor
  option is additive; the unfloored form is unchanged when no floor
  is passed). Read-only; prints JSON. Re-verified this run: it
  reproduces the cascade 16-seed numbers exactly (P1 0.1248 /
  0.0665, starvation 3 / 8, gap-0 39 / 11, pairs 41 / 3, gorge 645 /
  1172 nights) and the gorgeprice pilot numbers exactly (P1 0.1338 /
  0.0699, starvation 0 / 2, gap-0 12 / 6, pairs 15 / 0, gorge 309 /
  468 nights, 338,321 / 518,450 kcal) on the committed corpora.
- Balanced-panel compare per `docs/MEASUREMENT.md` §15 on the pilot
  band and again on the confirm band
  (`scripts/build-gorgeprice-panels-20261115.js`, cloned from the
  cascade panel builder, reading the gorgeprice2 corpora); attach
  the compare `.md` to the evidence file.
- Telemetry deviation check per the body (investigate any LOUD line
  the same run; the scale-wall baseline's winseat regime is a known
  invalid comparison for pre-seat substrates — see successorcaution
  §telemetry).
- Evidence: `evidence/2026-11-15/sim-gorgeprice2-b.md` with a
  "metric review" section. Per-seed files under
  `evidence/2026-11-15/perseed-gorgeprice2-b-{control,on}/`.
- Sense-testing: read the linkLines — do the gorge nights read as a
  siege with a price the village can see, or as silent pantry drain?
  Does the endure-or-sortie choice read sensibly now that the beast
  survives to gorge night after night?

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — waves 4–5 are the killing tier; the
  lingerers are wave-4/5 raiders. Wave 6+ scaffold: the siege is "a
  multi-phase siege, not a duel" — the lingerer-holds-the-treeline
  fiction (siege answered by sortie or endurance) matches canon.
- `docs/SCALE.md` — national is a live relationship; each scholar
  death costs −8 trust on every link.
- `docs/PARTY.md` — the sortie is the designed answer that fights
  the lingerer (`fieldFight`); this arm does NOT build a sortie
  answer (the sortie door is closed by prior evidence — a design
  call, not a tuning knob).
- Prior evidence: `evidence/2026-11-15/sim-gorgeprice-b.md` (PILOT
  NO-GO, METRIC-BROKEN — the run this prereg corrects) and
  `evidence/2026-11-15/sim-cascade-b.md` (PILOT GO / CONFIRM NO-GO,
  kill record).

## Metric review (to be filled in the evidence file)

Pre-registered here: the 1055Z rate leg degenerated to
zero-tolerance on a zero-starvation control band — that is why its
FORM is corrected here, between runs, never within one. If the
floored rate leg passes while the pooled tripwire fails (or vice
versa), the review will say which form caught what, and whether
the gorge price in kcal per 100 lived-days explains the starvation
rate. If the corrected bar fails, the lever's trade is priced too
high at this size and the next step is a gorge answer (design
call), not another re-bar — two bar forms have now been tried.
