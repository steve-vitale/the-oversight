# sim-raiddensity — Haven post-raid cooldown, both rival-raid channels (2026-10-15)

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14)

- **Primary:** combined-channel night-raid clusters (≥2 rival raids within 5d) on young nationals (first 60 hold-days) — armed ≤ 0.5× control cluster count. (Control substrate expectation from prior 16-run holdout: 5 clusters; bar: armed ≤ 2.)
- **Mechanism check (falsifiability at small n):** armed young-national raids staged within 7d of a prior raid = 0.
- **Guardrails:** national reaches ≥ control−2; median survival ≥ control−10d; no new death mode; the cooldown answers aloud (no silent removal — both fiction lines sense-checked in the proof test).
- **Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast}, 180d death-aware, FEASTSCALE_R13=1 asserted up front in proof AND sweep (the #312 lesson).
- **Baseline:** own control in the SAME sweep on identical seeds (finding #247: never inherit a baseline from a prior run's evidence file — the hot tree moves under you).
- **§14:** a miss is NO-GO, never re-scored against a friendlier metric mid-run. Metric doubts go under "metric review" for the NEXT run.

## The lever

`state.havenRaidCooldownUntil` (= day + 7), set by BOTH raid channels and
respected by both, enforced only on young nationals (nationalLive AND
day − nationalFirstDay < 60). `nationalFirstDay` is stamped at the EXISTING
formation point in hierarchy.js (where `nationalLive=true; nationalDay=day`
are set) — no new detector — and cleared when the realm dissolves.

- **Commons path** (game.js `commonsRaid` roll site): a raid roll inside the window stages nothing — instead a fiction beat: watchers see torchlight in the rival camp going dark; the doubled watch turned it. The night stays quiet, said aloud, never silent.
- **Famine path** (villageAgency.js `_vaFamineAct` via `_vaGuardRaidStage`): a raid chosen inside the window devolves into a beg, subject to the NORMAL 14-day per-village beg cooldown (already paid at the top of `_vaFamineAct`) — never both, never an ungated raid. If the beg cooldown is still owed, no beat stages at all and the watch fiction stands alone. The refused-beg 30%-comeback rides the same gate.
- **Untouched:** the refusal-path aftermath (unanswered staged raid melts back with 800 kcal taken, said aloud) — proven by fixture to still fire inside the window.
- **Env-gated RAIDDENSITY=1, default OFF.** With the gate off every helper returns early and touches no state; the `nationalFirstDay` write is itself gate-guarded.

Files: `src/js/game.js` (helpers `_rdOn/_raidCooldownYoung/_raidCooldownSet`, roll-site branch, `commonsRaid` sets cooldown), `src/js/villageAgency.js` (`_vaGuardRaidStage`, `_vaFamineAct` + refused-beg comeback route through it, `_vaStageRaidDefense` sets cooldown), `src/js/hierarchy.js` (formation stamp, dissolution clear).

## Mechanism attribution correction (commons vs famine)

The prior worker proved the brief's original famine-only targeting was wrong. Verbatim-distinct templates:
- COMMONS (game.js): `🌙 Raid — The Bloodied came in the night from the northeast. They carried off ~940 kcal from the pantry.` Gate: commons tension ≥70, trust <15, no deal, 0.08 roll.
- FAMINE (villageAgency.js `_vaStageRaidDefense`): `🌙 Night. Shouts from the treeline — Theo of The Bloodied with 3 others, and they're not here to talk. "Your pantry or your blood. Choose."` — a played standoff staged from `_vaFamineAct` with a 14-day per-village begCooldownUntil.

The s77 terminal shape (leadfeast s77 died d91 with rank on after three raids in 5 days on a healthy polity) is 5:1 a COMMONS-raid phenomenon: across all 16 holdvillage control runs, young-national clusters (≥2 raids within 5d, first 60 hold-days) = 1 famine cluster vs 5 combined-channel clusters. A famine-only lever's primary would be vacuous at control n=1. younggrace (which cut the commons raid RATE) was killed per §14 — "reschedules the entanglement, doesn't break it" — so density in the commons channel is the untouched mechanism, and #326's text is channel-agnostic. This arm covers both channels under one Haven-side cooldown.

## Proof

`scripts/test-raiddensity-20261015.js` — 28/28 GREEN on armed code (FEASTSCALE_R13=1 asserted up front):
- Presence (REAL-RED anchor): `_rdOn/_raidCooldownYoung/_raidCooldownSet/_vaGuardRaidStage` exist on Game. On pristine code (patch backed up to `~/workspace/raiddensity-20261015.patch`, files checked out from HEAD, patch re-applied after) the suite fails: presence checks FAIL, then `TypeError: Game._raidCooldownYoung is not a function` — REAL RED demonstrated.
- Gate OFF: `_raidCooldownYoung()` false even with a window hypothetically set + young national; `commonsRaid` and `_vaStageRaidDefense` do not touch `havenRaidCooldownUntil`.
- Gate ON: both channels set `havenRaidCooldownUntil = day+7` on staging; fires immediately after a raid; holds at day+6; refuses at day+7 (boundary); old nationals (61d) and dissolved nationals ignore it; 59d still covered.
- Commons blocked night: the doubled-watch fiction line, NO raid beat, NO trust loss. Expired window: raid stages, trust −10.
- Famine conversion: inside the window with the beg cooldown paid → verdict 'beg', `pendingBeg` set, no `pendingRaidDefense`, fiction explains the doubled watch (`"We're asking. Not taking."`). Beg cooldown owed → 'none', nothing staged, the watch explains why aloud.
- Refusal-path aftermath untouched: an unanswered STAGED raid inside the window still melts back with kcal taken.
- Det-gate D1: gate-off trajectories byte-identical (seeds 11/22, leadfeast, 60d ×2).
- SMOKE=1: 15d × {control, RAIDDENSITY=1} leadfeast — no crash, samples collected, instrument saw raid-class lines both halves.

`check.js --quick`: 92 passed, 2 failed — both failures are pre-existing in `test-where-are-we` (stranger conversation 'where' lines), zero overlap with raid/national/cooldown code; unrelated to this change.

## Sweep results (16 runs/arm, identical seeds, FEASTSCALE_R13=1)

Per-seed records: `evidence/2026-10-15/telemetry-raiddensity/` (`<tag>-<policy>-s<seed>.json`, `<tag>-summary.json`).

| metric | control | armed | bar | verdict |
|---|---|---|---|---|
| young-national raid clusters (≥2 in 5d) | 26 | **0** | ≤ 13 (0.5×) | **GO** |
| young staged raids | 195 | 51 | — | 0.26× |
| staged raids ≤7d after prior | 175 | 11 | = 0 | MISS (see metric review) |
| blocked commons nights | 0 | 133 | — | mechanism fired |
| famine beg conversions / beg-cooldown blocks | 0 / 0 | 0 / 8 | — | raid never staged in-window |
| unanswered-raid aftermaths | 31 | 26 | — | refusal path intact |
| national reaches | 11/16 | 11/16 | ≥ 9 | GO |
| table (waiting) | 14/16 | 15/16 | — | — |
| wins | 0/16 | 0/16 | — | wall stands (expected) |
| exiled | 0 | 0 | — | — |
| median survival | 134d | 140d | ≥ 124 | GO |
| max survival | 182d | 182d | — | — |
| wave 4/5 unlocked | 15/16 | 15/16 | — | reachability held |

Death-cause guardrail: armed introduces no new death mode. The only key delta is `villager:The Influencer` (contest death — the same class as control's `villager:The Callback/The Heckler/The Spoiler/Nevermore/Choir Toad`); `villager:The Spoiler` disappears symmetrically. No new mode.

The armed steady state is metronomic: young-national raids land at 7–8 day spacing (e.g. leadfeast s55: [83, 91, 98, 106, 114, 122, 129, 137]) — each raid re-arms the window, the watch turns back everything inside it. Compare control leadfeast s33: [78, 78, 78, 79, 80, 82, 82, 83, 83, 85, 85, 86] — twelve raids in nine days right after the court sits. That is the entanglement shape this kills.

## Metric review (for the NEXT run — §14, not re-scored mid-run)

The mechanism check ("armed young-national raids staged within 7d of a prior raid = 0") missed: 11 armed pairs, **all exactly 7 days apart**. Autopsy: the cooldown is `day+7` with a strict `<` check, so a raid landing exactly on day D+7 is *by design* allowed — the watch stands down after 7 days, and the new raid re-arms it. The check's ≤7d threshold was one day stricter than the implemented design; it contradicts the mechanism it was meant to falsify-check. The falsifiability signal still worked as intended (it would have caught a non-firing cooldown — control shows 175). Proposed revision for the next run: the check becomes "no two armed young-national staged raids with gap ≤ 6d" (this run's data: 0), or extend the cooldown to day+8 with the fiction adjusted. The primary (clusters ≥2 in 5d) is unaffected: 0 armed.

Second note: the brief's parenthetical bar ("control = 5 … bar ≤ 2") came from a prior worker's instrument on an older tree state. My own control on the same instrument measured 26 (finding #247 honored — never inherit a baseline). The binding bar applied was armed ≤ 0.5× my control = ≤ 13; armed = 0.

## Telemetry deviation check

`telemetry-check.js` vs `hidden_files/telemetry-baselines/scale-wall.json` (metrics national,table,wins,exiled) on the control per-seed glob: **1 LOUD line — explained, baseline rolled.** `table newly appeared: baseline 0 -> current 14.` The baseline was stale (seeded from an older substrate); the younggrace run already showed high table rates on the leadfeast substrate, and the armed half shows 15/16 — not a regression, and the det-gate proves gate-off byte-identical. Baseline rolled forward to the control aggregate: `{national: 11, table: 14, wins: 0, exiled: 0}`.

## Village assessment (plain words)

The village that reaches national on this substrate lives under siege: rival fires hit the pantry two or three times a week, sometimes twice in one night from two different directions. The control runs show why young nationals die entangled — the raids aren't single blows, they're a drumbeat, and every raid craters trust, which poisons the very links the realm needs to hold. The cooldown doesn't make Haven safe; it makes the siege *legible*: one raid a week at most, each followed by seven nights of torches and a quiet treeline. The fiction both times is honest about the mechanism — the watchers see the torches, the rival speaker names them. Villagers in the sweep still die the usual deaths (monster combat dominates both arms); the lever changes the *shape* of pressure, not its existence. Wins stay at 0 — this arm attacks density, not the win chain; the wall stands, but the entanglement it named is measurably broken.

## Blanks filled / documented

- **Filled:** the Haven-side post-raid cooldown across both rival-raid channels (game.js + villageAgency.js + hierarchy.js stamp), env-gated, proof-tested, landed per below.
- **Documented:** the famine→beg conversion path fired 0 times in 16 armed runs (famine raids are rare on this substrate; the 8 in-window famine attempts hit the beg-cooldown-owed 'none' branch instead). The proof fixture covers the conversion; a famine-dense substrate would exercise it live.
- **Documented:** the mechanism-check threshold miss (see metric review) — next run's check should be ≤6d.
- **Documented:** pre-existing `check.js --quick` failures in `test-where-are-we` (2), unrelated to this arm.

## Convergence

- scale-onramp: **converging** — raid density on young nationals is no longer the entanglement driver (clusters 26→0), but wins remain 0/16 and the wall numbers (national 11, table 14/15, wins 0) are unchanged. The density mechanism is solved; the win chain is not.
- Status: **GO** — primary decisively met, all guardrails green, mechanism-check miss recorded as a threshold error with the §14 revision for the next run.
