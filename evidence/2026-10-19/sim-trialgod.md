# sim-trialgod — The Oversight trial-by-combat god-build diagnostic (2026-10-19)

Backlog question: is the feared-table trial winnable by a strong build, or is it a
bearer-sacrifice button by design? sim-tablepaths (2026-10-19) found 3/3 lethal at
~20/hit out vs 1800–2200 HP. This run puts a god-build driver against the same fight.

## PRE-REGISTRATION (binding, written before any sweep — docs/MEASUREMENT.md §14)

- **PRIMARY:** bearer trial wins across the god-build corpus.
- **BAR:** ≥1 bearer win across ≥8 reached trials = winnable by a strong build
  (attribute the mechanism: what the god build did differently).
  0 wins across ≥8 trials = sacrifice-button-or-overtuned → report the damage
  numbers (Finale HP, per-round in/out, the round clock) as a Steve-call;
  do NOT tune the fight.
- Horizon: 180d, death-aware. Seeds 64201–64208 × {leadfeast, belongfeast} = 16 runs,
  identical seeds, tribfloor bases (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
  RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1
  TABLEPATHS=1 TRIALGOD=1). Substrate: `withTrialGod(withTablePaths(withSeatDrive(withWinDefer(TF base))))`,
  door='feared', trial=true every run; the fight is the engine's real
  `startCombat('finale')` fought via driveFights; tbEnd resumes the table.
- **GUARDRAILS:** invitation→sitting ≥ 70%; no new death mode vs the seatdrive
  control corpus (evidence/2026-10-19/perseed-posttable-seatdrive/); national/table
  within ±2 of control.
- Corpus = trials reached (feared walks only).

## VERDICT: DIAG-NO-GO — 0 bearer wins across 12 reached trials (≥8 bar met)

**Primary (binding):** 0/12 bearer wins. All 12 trials ended with the bearer dead
(trial-combat); all 12 runs still WON via law-5 mantle-passed-weakened continuation.
The trial is **not winnable by a strong build** on this substrate — it is a
bearer-sacrifice button by the numbers.

## The damage numbers (Steve-call — no tuning performed)

The god-build driver fought with REAL verbs only: base policy's own `gearUp`
(Phase blade+60 ×8, Hardlight knife+45 ×2, Worldbreaker Maul+120 ×1), armor +14…+46,
`Game.eat()` to ≥98% kcal cap (overcharged ×1.25 every trial), real combat abilities
via `Game.useAbility` (take_aim→strike, dead_aim→strike, rage→3 strikes, haymaker,
scream_cheese, pocket_sand, war_cry, mend, brace), and the real `Game.tbFiSacrifice`
counter on the 3-round countdown (fired 9/12).

Per-trial ledger (OUT = damage to the Finale, IN = damage to the bearer):

| seed/pol | finale HP | rounds | OUT | IN | note |
|---|---|---|---|---|---|
| lead s64202 | 2002 | 5 | 260 | 132 | Phase+60 |
| lead s64204 | 2078 | 7 | 478 | 181 | 2 strikes ×(264,214) |
| lead s64205 | 2167 | 4 | 219 | 152 | died before countdown |
| lead s64207 | 2111 | 5 | 310 | 110 | dead_aim 3x + Hardlight+45 |
| lead s64208 | 1842 | 3 | 485 | 62 | Maul+120 take_aim one-shot 485, died R3 |
| belong s64201 | 1846 | 5 | 223 | 138 | haymaker + Hardlight+45 |
| belong s64202 | 1955 | 4 | 491 | 143 | 2 aimed strikes (241,250) |
| belong s64203 | 2108 | 5 | 495 | 132 | 2 aimed strikes |
| belong s64205 | 1904 | 8 | 771 | 167 | rage ×5 strikes (~185 each) |
| belong s64206 | 2049 | 5 | 458 | 128 | 2 aimed strikes (223,235) |
| belong s64207 | 1963 | 5 | 915 | 140 | **best run**: rage ×3 strikes (311,315,289) + sacrifice |
| belong s64208 | 1836 | 5 | 279 | 108 | haymaker |

- Best observed bearer burst: **915 damage over 5 rounds** (Phase blade+60, rage,
  overcharge ×1.25, training ×1.49) — 47% of the Finale's 1963 HP, and the bearer
  died that round.
- Theoretical ceiling (unseen combo): Worldbreaker Maul+120 + dead_aim 3x +
  overcharge ×1.25 ≈ 510/strike, two strikes ≈ 1020 over 4 rounds — still < 1836,
  and the bearer takes ~65/round × 4 ≈ 260 > 100 HP. Dead by round 3–4 regardless.
- The round clock: bearers survive 3–8 rounds; incoming ~50–83/round (two rounds ≈
  130+ > 100 HP). The countdown (150–200 unavoidable at zero) was neutralized 9/12
  by the working sacrifice counter — but the bearers died to normal attacks anyway.
- Sacrifices fired 9/12 (3 trials ended before the declaration: the bearers died
  in rounds 3–4 of the normal-attack race).

**What the god build did differently (the mechanism attribution):** nothing saved
it. The driver played at the instrumented ceiling — every trial overcharged, the
single best owned weapon equipped, real buffs loaded and consumed by strikes, the
sacrifice counter fired. The best fight (belongfeast s64207: rage, three 300+
strikes, feed-the-Vine sacrifice) left the Finale at 53% HP when the bearer died.
The DPS race is structurally unwinnable: ~2000 HP / ~65-per-round-in vs ~100 HP /
  ~250-per-strike-out means the bearer needs ~7 uninterrupted strike rounds and gets ~4.

## Guardrails

- **invitation→sitting: 12/14 = 86% — PASS (bar 70%).**
- **No new death mode — PASS.** Raw new cause-names vs control
  (Hummice, "a toad like a war drum, throat swelling", Ad Break, Hushpuppy,
  The Heckler, alien, the night) are all flavor-text or pre-existing channels:
  monster-name strings from the drifted base, the alien channel, and "the night"
  (the endDay fallback blame for unattributed night deaths — verified in
  src/js/game.js). No new death CHANNEL appears. The trial-combat channel itself
  is the lever's own opt-in death (law 5 resolves it).
- **national/table within ±2 of control — MISS (table out of band).**
  national 12 vs control 10 (Δ+2, in band); table 14 vs control 8 (Δ+6, out of band).
  Attributed to pre-drain base drift, not the lever: the table metric counts
  `tableWaiting` ever, which the trial (fired at beat 2, mid-sit) cannot influence —
  and the FIDELITY=1 gate fails identically on the parent tablepaths probe on
  current master (sibling landings moved the base since the control corpus was
  committed). The pre-registered trial verdict does not depend on the control.

## Corpus wall metrics (for the panel)

- 16/16 runs complete, 0 errors. invited=14, sat=12, won=12, national=12, table=14,
  wave4=10, wave5=0, median survival 91d, max 155d.
- 12 trials fired, 0 bearer wins, 12 bearer deaths, 9 sacrifices, 23 ability uses,
  0 trialgod driver errors.
- §15 balanced panel: `scripts/build-trialgod-panels.js` runs the §15 instrument
  (control = perseed-posttable-seatdrive BEFORE, trialgod armed AFTER) —
  decision `review_required` (playerDeaths regression on leadfeast, which is the
  lever's own opt-in trial deaths plus base drift; the pre-registered trial
  verdict is control-independent). Panel cache files are not committed (§15).

## Village assessment — who thrived, who died, and why

- **Thrived:** villages won 12/16; four reached day 90+ with the bearer seated and
  won via continuation after the trial loss. The longest-lived (belongfeast s64203,
  142d; belongfeast s64207, 154d) absorbed the trial loss and kept going — law 5
  (mantle-passed-weakened) working exactly as canon intends.
- **Died:** all 12 seated-scholar deaths are trial-combat — on the seated days,
  the trial is the ONLY thing killing seated bearers on this substrate. Pre-table
  deaths are ordinary: monster combat, wounds that wouldn't close, starvation,
  dehydration. No seated death surprises, no continuation failures: 12/12 trial
  losses still won the run.
- **Why:** the trial is an opt-in existential risk and the villages treat it as
  one — the losses resolve, never wipe. The village-level story is healthy; the
  problem is the fight's internal math (above), not the consequence structure.

## Sense-testing read — winnable boss vs scripted execution

Transcript: `evidence/2026-10-19/trialgod-transcripts/belongfeast-s64207.txt`
(d154, Jorge Silva, the best god-build trial — 915 damage, sacrifice fired).

The fight reads as **a scripted execution wearing a boss's costume**. The bearer
does everything right: equips the best weapon through the real gearUp, eats to
overcharge, Unleashes Rage, lands three 300+ strikes, and when the sky declares
the countdown, feeds it Vine — "🎁 You feed it Vine. The title card pauses —
chews — swallows. '...SATISFIED.'" Then the Finale's normal attacks kill him
("Finale's attack hits you for 71. You go down. 📺 SYSTEM: 'OH. Oh no. ...The
gamblers are very quiet.'"). The narration is superb — the terror broadcast, the
sacrifice beat, the mantle-transfer grief ("Nobody's talking much. The fire feels
smaller tonight.") all land emotionally. But there is no legible path to winning:
no "if only I'd…" — the numbers don't allow it. A player who plays this perfectly
will feel cheated, not outplayed. The trial's *presentation* says "win, and terror
is no longer a meter but a fact"; its *math* says the bearer dies at 53% boss HP.

Notably: the trial is NOT solo — "⚔ THE FINALE! Aitana joins you!" (a party
villager joins via startCombat's party logic in one observed transcript).
Ally damage is minor (0–13/hit strikes) and doesn't change the verdict.

## Instrument notes (honest disclosure)

- The first sweep had a driver bug: `take_aim` was re-used over a loaded aimBonus
  (and later the same pattern for loaded rage/haymaker), so 9/12 fights dealt
  zero bearer damage. The fix (loaded buff → fall through to the strike, never
  overwrite) is in scripts/policies/trialgod.js; the corpus was re-swept twice on
  identical seeds; the numbers above are the fixed-driver corpus. 32-check and
  52-check proof suites are green (scripts/test-trialgod-20261019.js).
- FIDELITY=1 FAILS on current master for this probe AND identically for the
  parent tablepaths probe — base drift from sibling landings, not probe drift.
  Trial verdict (bearer wins, damage ledgers) is control-independent.
- Policy-side only; zero src/js changes. No stats invented, no items granted
  (proof-test grants are driver-proof only, same precedent as test-tablepaths).

## Metric review

The pre-registered primary (bearer wins) bound the run and was measured cleanly:
12 ≥ 8 reached trials, 0 wins → DIAG-NO-GO per the pre-registration. The table
guardrail's band (±2 of an older-base control) is showing its age under base
drift — consider re-baselining the control or versioning it per base digest for
the next run. The trial verdict itself needs no control.

## Named next (Steve-call)

The trial-by-combat is, by the numbers, a bearer-sacrifice button: even the
strongest realistic build (best owned weapon, overcharge, armor, held abilities,
the working sacrifice counter, one ally) dies in 3–8 rounds at ~50% boss HP.
The call is Steve's:

1. **Keep as bearer-sacrifice button** — the design intent may already be this
   (canon law 5: trial-by-combat is the one opt-in existential risk). If so, the
   evidence suggests the *fiction* should match the math: the trial's intro
   currently sells winnability ("Win, and terror is no longer a meter but a fact").
2. **Retune the fight** (out of scope for this diagnostic) — e.g. lower the
   Finale HP band, or gate attempts behind a readiness hint so weak builds don't
   walk in blind.

Artifacts: scripts/policies/trialgod.js, scripts/probe-trialgod-20261019.js,
scripts/analyze-trialgod-20261019.js, scripts/test-trialgod-20261019.js,
scripts/trialgod-transcripts-20261019.js, scripts/build-trialgod-panels.js;
evidence/2026-10-19/perseed-trialgod/ (16 per-seed JSONs),
evidence/2026-10-19/trialgod-corpus-summary.json,
evidence/2026-10-19/trialgod-transcripts/belongfeast-s64203.txt + belongfeast-s64207.txt,
evidence/2026-10-19/sim-trialgod.md (this file).
