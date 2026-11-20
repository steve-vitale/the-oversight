# sim-raiddef-a — the raid-defender question

- Run: Loop A `fleshout-20261120T2015Z`, axis scale-onramp, finding #2599 contact.
- Prereg: `evidence/2026-11-20/sim-raiddef-a-prereg.md` (commit `68b57272d`), base `fca0aa6c3`.
- Band: fresh 107061–107068, 8 seeds, 150d, competent verbatim policy, two legs (ctl / arm) differing only by `RAIDDEF=1`.
- Substrate both legs: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1`. `GUNRATE`, `CELLGATE`, `PRESENCE`, `SEARSUPPLY`, `BOWCRAFT`, `FUSIONCELL` unset on both legs — plain master supply.
- Instrument: `scripts/raiddef-driver-a.js`, `scripts/analyze-raiddef-a.js` (selftest 53/53), `scripts/build-raiddef-panels-a.js`, `scripts/test-raiddef-a.js` (28/28, pre-revert).
- Analysis: `evidence/2026-11-20/raiddef-a-analysis.json`. Panel: `evidence/2026-11-20/raiddef-a-panel.md` (+ `.json`, `raiddef-a-panel-before/after.json.gz`).
- Corpora: `evidence/2026-11-20/perseed-raiddef-a-ctl/` (8 files), `evidence/2026-11-20/perseed-raiddef-a-arm/` (8 files).

## Verdict: NO-GO — kind PARTICIPATION (POOL)

**Kill class (§14a): SUBSTRATE-MISSING — not concept-dead, not metric-broken.**

The lever: when raiders come to the village door, if someone in the village is
carrying the alien gun (the searcaster) with a charged cell in it, put that
person at the front of the defense instead of whoever happens to be first in
line. One small legible rule, raid path only.

What happened, in plain words: the rule was built and proven to work in
fixtures — a wounded holder at 25 health is drafted first, a shielded holder
stays back where the shield promise puts them, the holder fires the gun in a
live raid fight. But in 16 full runs of the game it never fired once, because
**nobody ever had the gun**. There were 84 raids and 164 raid fights on the
band, and at no raid on either leg was there an armed holder to draft. The
question "does the gun belong with raid defenders" cannot be answered until a
villager actually holds a gun.

## The pool is empty — three independent instruments agree

| Instrument | What it saw |
|---|---|
| Daily holder census | 0 searcaster holders, 0 holder-days, 0 appearances on both legs |
| Grant / loot log | 0 searcaster grants in 164 contest prizes; 0 kill-loot searcaster drops; 0 searcaster corpse-takes in 480 corpse-takes |
| Raid draft snapshots | 0 eligible holders at all 84 raid events on both legs |

One fusion cell was granted on the band — a cell with no gun to go in. The
scholar never held a cell either (`scholarMaxCells: 0`).

The two legs are **byte-identical on 8/8 seeds** (modulo self-describing
metadata: mode, leg, `raiddefOn`). That is the strongest form of this result:
with no holders, the lever is a no-op, and the arm leg is the same run twice.
Nothing diverges — not deaths, not standing, not a single raid fight.

## Bars (frozen in the prereg)

1. **Raid-defender draft rate — FAIL.** D = 0 eligible raid events on the arm
   leg (ctl also 0). No rate can be scored on an empty pool. POOL finding.
2. **Armed volleys in raid fights — FAIL (vacuous).** 0 on the arm leg (ctl 0).
   No holder, no volley. PAYOFF unmeasurable, not failed.
3. **Starvation guardrail — PASS (vacuous).** Totals 0 vs 0 (bar ≤ ctl+2);
   arm-only drafted-holder starvation deaths 0 (bar ≤ 2) — the cohort is
   empty, so it passes at 0.
4. **Median-survival guardrail — PASS.** 150d arm vs 150d ctl (bar ≥ 120d).

## Wall numbers (identical on both legs)

Median survival 150d; national 0/8; table wins 0; wave-4 unlocked 8/8;
wave-5 unlocked 4/8; community lost 3/8; all villages regional; standings
175–650, with three seeds stuck at 199 (the known standing-199 stall:
107061 day 100 lost, 107065, 107068). Starvation deaths 0 on both legs.
Village deaths per run 90 on the panel (both legs).

## Panel (§15)

`balance-panel.js compare` returns **review_required** — driven by the
unobserved table rows (table entry/sitting not instrumented; report as null,
never faked). Every observed metric is exactly 0 delta on 8/8 pairs:
national 0→0, village deaths 90→90, community loss 0.375→0.375, first-bearer
survival 1→1. The panel confirms the byte-identical legs; `review_required`
here is the panel's default for unobserved rows, not a movement signal.

## Sense-testing: the raids themselves read like people fighting

No drafted holder could be watched in live play — there was none. The raid
fights that did happen read as real fights, not numbers:

- Day 113, seed 107062: Ursula fights the Spoiler, binds her own wound
  mid-fight (+20 HP), is losing, shouts for help, and Emma charges in. Ursula
  dies in round 3. The fight is honest about it.
- Same day: Elif closes in with a hatchet and finishes the Suburb ("does not
  let it slip away"), then kills a Spoiler in four rounds with Xavier charging
  in when Elif calls for help.
- Raids come early and often: the first raid on seed 107062 is day 8, then
  days 17, 26 — roughly every 9 days. Five fights in that first day-8 raid,
  all wave-1 beasts, defended by ordinary villagers (gen-named newcomers and
  Emma Larsen). Nobody in the village has a gun; the defense is hatchets,
  slings, and shouting for help.

One false note from the existing engine, not this arm: "Ursula has Sling but
no stones — the string stays drawn, useless." A raid defender with an empty
sling gets a line about a useless weapon. Legible, if bleak.

## Instrument notes

- **The `fightOrigin` mislabel is fixed (driver-side, verified).** The
  draftmiss arm found raid fights mislabeled `'world-tick'`. The driver now
  reads `opts.raid` directly and stamps origin `'raid'`: 25 wave-4+ raid
  fights on the band now read `raid` (14 on seed 107062 alone — Elif, Hassan,
  Ursula, Nikolai leading them), where before they would all have read
  `world-tick`. The fix lives in the driver, not in game code — no game-code
  label change was needed. The blocker is cleared for future arms.
- **First pilot run was killed by a machine restart.** The machine was
  replaced mid-run (uptime 5 min when checked; no error in any log; the
  control leg died mid-seed-107062 after seed 107061 had completed). The
  partial log was kept as the record of the kill; the pilot was re-run fresh
  from scratch. Second run: both legs rc=0, 8+8 per-seed files, 0 instrument
  errors, `raiddefPresent: true` on both legs, `raiddefOn` false/true
  respectively.
- The arm-only starvation guardrail joins death rows on `who` matching a
  drafted holder's vid. Real-corpus death `who` values are a mix of monster
  ids and villager vids, so the join works for villager deaths — it simply had
  no drafted holders to join against. The join itself was proven on a fixture
  in the analyzer selftest (1 drafted-holder starvation death counted).
- The smoke probe (1 seed, 30d, ctl) showed 0 eligible holders at its 2 raid
  events. I read that as "pool thin" and proceeded; the pilot proved it was
  "pool empty" at band scale. See metric review.

## Metric review (§14)

**None of the metrics drifted; the metrics held. The miss was upstream of the
metric: no pre-pilot substrate probe.**

- Bar 1's D=0 design did exactly its job. It refused to score a draft rate on
  an empty pool and returned the POOL kind instead of a fake 0% or a fake
  pass. The metric answered the question the run could answer ("is there a
  pool?") and did not pretend to answer the one it could not ("is the holder
  drafted?").
- The bars that could not be scored (draft rate, volley payoff) are recorded
  as unmeasurable, not failed. Re-scoring this run against a friendlier
  metric would be drift; the NO-GO stands as frozen.
- What should change for the next run: a **pre-pilot gate** — before the
  sweep starts, prove ≥1 holder-day exists on the band (a probe, not a pilot).
  §14b's substrate checklist exists for exactly this: verify the engine
  stages what the arm needs before spending the pilot. I ran the checklist's
  spirit (the smoke test) but not its letter: the smoke showed 0 holders and
  I treated it as a thin pool rather than a failed check. Next run, 0 holders
  on the probe blocks the pilot.
- Revised metric for the re-run: the same four bars, plus the pre-pilot
  holder gate. The raid-defender question is **unanswered, not answered-no**.
  The rule works in fixtures (28/28); the game never stages a holder for it
  to draft. That is SUBSTRATE-MISSING under §14a: no mechanism for the
  failure was found in the arm's own logic.
- The guardrails passing vacuously (0 starvation, 150d vs 150d) is reported
  as vacuous, not as evidence the rule is safe. A rule that never fires
  cannot hurt anyone; safety is unproven until it fires.

## What happens next

The game-code change is **reverted** (no trace in `src/` — verified 0
`RAIDDEF` refs). The instrument and this evidence are committed; the
mechanism proof (`scripts/test-raiddef-a.js`) is kept as the record that the
rule worked, and re-running it requires the reverted implementation (see the
file's header note).

The question moves upstream, to supply. On plain master — no gunrate
substrate, no cellgate — the gun effectively never reaches a villager in 150
days: 0 grants in 164 contest prizes, 0 drops, 0 corpse-takes, across 8
seeds. Until a holder exists, **every** holder-dependent lever (raid defense,
lend, presence) is unmeasurable on plain master. The next arm on this chain
is a supply question, not another holder-behavior question: why does the gun
never arrive, and what puts one in a villager's hands? Filed as finding
#2631 (open).

## Files

- Prereg: `evidence/2026-11-20/sim-raiddef-a-prereg.md` (commit `68b57272d`)
- Evidence (this file): `evidence/2026-11-20/sim-raiddef-a.md`
- Analysis: `evidence/2026-11-20/raiddef-a-analysis.json`
- Panel: `evidence/2026-11-20/raiddef-a-panel.md`, `evidence/2026-11-20/raiddef-a-panel.json`, `evidence/2026-11-20/raiddef-a-panel-before.json.gz`, `evidence/2026-11-20/raiddef-a-panel-after.json.gz`
- Corpora: `evidence/2026-11-20/perseed-raiddef-a-ctl/`, `evidence/2026-11-20/perseed-raiddef-a-arm/` (8 seeds each)
- Sweep logs: `evidence/2026-11-20/raiddef-a-sweep-ctl.log/.err`, `evidence/2026-11-20/raiddef-a-sweep-arm.log/.err`
- Instrument: `scripts/raiddef-driver-a.js`, `scripts/analyze-raiddef-a.js`, `scripts/build-raiddef-panels-a.js`, `scripts/test-raiddef-a.js`
- Game code: reverted — `src/js/havenGrowth.js` returns to base `fca0aa6c3` state.
