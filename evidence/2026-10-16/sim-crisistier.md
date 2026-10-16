# sim-crisistier — fix finding #420: raid crisis tier always wave 1 (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop ARM sim-crisistier, run_id fleshout-20261016T1355Z, axis scale-onramp (blocking).
**Type:** BUG FIX — game-code arm (src/js/havenGrowth.js havenRaidTick region ONLY), always-on, no env gate.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**The bug (sim-findings.md 2026-10-16, found by the sim-raidshield probe):** `havenRaidTick` raised the aid crisis with `wmax = max(m.wave||1)` over raiders — but world-monster entities NEVER carry `.wave` (`spawnWorldMonster` builds id/hp/tiles only; the wave lives in the data def, looked up by id everywhere else). So every raid crisis was raised tier 1 regardless of the actual raiders, and the call-for-help chain never applied the wave>=3 apex penalty (score −10, `src/js/comms.js` `aidAskVillage`; the trust ~57+ ask bar).

**The fix (design call — figure it out yourself, documented, Steve can overrule):** `Game.crisisWaveOf(m)` in havenGrowth.js looks the wave up in the data def by id (the raidshieldWaveOf / apexpredators `speciesOf` recipe: `defs.find(d => d.id === m.id)`; def authoritative, entity-carried wave ignored; unknown/null → 1). `havenRaidTick` computes `wmax` via `this.crisisWaveOf(m)`. Small, exact, region-local: +14/−1 lines in havenGrowth.js.

**PRIMARY (binding):** tier attribution 100% correct on wave-4/5 probe raids — the proof (`scripts/test-crisistier-20261016.js`): forced raids with fabricated wave-4/5 entities (exactly what spawnWorldMonster builds — id/hp/tiles, no `.wave`), `raiseAidCrisis` stubbed to capture the wave. **GO = 100% of probe captures correct.**

**Guardrails:** national ≥ control−2; median survival ≥ control−10d; no new death mode. On guardrail breach: do NOT land — revert game code zero-trace, land evidence+instruments with NO-GO + autopsy.

**Substrate:** pre-seat courtship, FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit. Policies: leadfeast / belongfeast (TF = tribfloor).

**Seeds:** 8 FRESH [941, 942, 943, 944, 945, 946, 947, 948] (verified 0 hits across evidence/2026-10-16/perseed-*/ before the run) × {leadfeast, belongfeast} × {control (pristine baseline tree at b7f5391e), armed (fixed tree)} = 32 runs, own in-sweep paired control, identical seeds both sides.

**Horizon:** 180d death-aware (reachability lever: waves 4–5, national, table, wins must all be observable).

**Schema:** per-seed JSONs carry numeric national/table/wins/exiled keys.

**Instrument:** `scripts/test-crisistier-20261016.js` (proof: unit 6/6 + wiring probe 3/3 RED→GREEN, SMOKE, DET) · `scripts/sweep-crisistier-20261016.js` (paired sweep, wrong-tree guards: armed side asserts the fix exists, control side asserts it absent) · `scripts/analyze-crisistier-20261016.js` (verdict analyzer).

**Exercise gate:** a wave-4/5 raid in the sweep must raise a crisis (beat-captured) — the tier is a number, not prose, so beats must be byte-identical before/after.

## Results

### PRIMARY: GO — 9/9 (100%) attribution correct

| check | pre-fix (RED) | post-fix (GREEN) |
|---|---|---|
| u1–u6 crisisWaveOf def lookup (reunion=4, cancellation=5, bulldozer=1, unknown=1, null=1, entity-wave ignored) | FAIL — `Game.crisisWaveOf is not a function` | PASS 6/6 |
| w1 mixed wave-4/5 raid → captured tier | 1 (the bug) | **5** |
| w2 wave-4-only raid → captured tier | 1 (the bug) | **4** |
| w3 wave-1 raid → captured tier | 1 | 1 (unchanged) |

RED→GREEN demonstrated on the same probes: pre-fix the wave-4/5 captures were tier 1 (the bug reproduced); post-fix they are the true wmax; wave-1 behavior is unchanged. SMOKE green (20d × 2 policies, no crash). DET: fixed-tree self-consistency holds (the lookup is deterministic, no RNG).

### Guardrails: all HOLD

Sweep complete 2026-10-16: 32/32 runs finished (16 pairs), 0 dropped, exit 0. Control ran in the pristine baseline tree `sim-crisistier-base` (b7f5391e, wrong-tree guard verified the fix absent); armed in the fixed tree (guard verified present).

| | control | armed |
|---|---|---|
| national | 11/16 | 11/16 (need ≥ 9) ✓ |
| median survival | 121d | 121d (need ≥ 111d) ✓ |
| death-cause strings | 13 | 13 — armed-only: none ✓ |
| table | 14/16 | 14/16 |
| wins | 0/16 | 0/16 |
| exiled | 0/16 | 0/16 |
| wave-4/5 unlocks | 15/16 | 15/16 |

**16/16 pairs metric-identical** (won/national/table/exiled/wave45/nDeaths/gameDays/endReason all equal), and **16/16 beat files byte-identical**. This is the expected shape, not a surprise: leadfeast/belongfeast never call for help, so `crisis.wave` has no reader on the sweep substrate — the fix is behavior-neutral there. The behavior surface is the aid-acceptance math, which the proof probe exercised directly.

### Wall numbers

national 11/16 · table 14/16 · wins 0/16 · exiled 0/16 · wave-4/5 unlocks 15/16 · median survival 121d · max 182d. (Note for the wall ledger: national IS reached 11/16 on the pre-seat courtship substrate — the standing directive's "national 0" came from a different substrate/policy. Not chased — different axis measurement, recorded here.)

## Sense-reads (SENSE-TESTING LAW)

**leadfeast-s945-armed d138** — the exact case the fix changes (wave-4 Eulogy among wave-1/2/3 teeth):

> 🐗 RAID — 5 raiders (The Understudy, Chorus Line, Night Court, Highbeam Deer, The Eulogy) hit Haven in the night, drawn by the smell of the pantry! The palisade's stakes take their toll as they come over the wall.
> 🚨 The Understudy, Chorus Line, Night Court, Highbeam Deer, The Eulogy is at Haven's door. The village looks to you. Four ways to call: a RUNNER (slow, dangerous), a SIGNAL FIRE (fast, loud, everyone sees), the SYSTEM RELAY (if it can carry voices), or an ABILITY CRY...

Verdict: the narrative is coherent — a mixed-teeth raid with a wave-4 apex in it, the village looks to the player with four honest options. The crisis tier is a NUMBER (`crisis.wave`), never spoken in prose, so the transcript is byte-identical before/after (verified across all 16 pairs). The meaning change lives in the acceptance math that fires only if the player actually calls: pre-fix the Eulogy's raid was priced as wave-1 (no −10, danger 0.14); post-fix it is priced as wave-4 (score −10 — "they know what wave 3 means" — danger 0.20). The refusal beats ("We don't believe the teeth are that big") now carry honest weight for apex raids. The fix is prose-neutral and math-honest — exactly what a tier fix should be.

Template fingerprints: none — no new beats were added; the fix adds zero prose.

## Village assessment

Armed villages are indistinguishable from control (16/16 identical) — the assessment reads both sides at once. Median village lives 121 days; 11/16 reach national; 14/16 get the table's attention; none win, none are exiled. Deaths (647 across 16 runs): combat 51.5%, villager combat 21.9%, monster 16.4%, expedition 2.5%, sickness/wounds 2.3% each, starvation 0.6%. Villages die FIGHTING — the combat family is 90% of deaths — not starving: the scale wall on this substrate is teeth, not bread. Two runs survived the full 180d (leadfeast-s945, leadfeast-s948); the rest were village-lost between d73 and d175. Who thrives: villages that reach national early (leadfeast road, 7/8 national) — the belongfeast road reaches national only 4/8 and dies younger. What was missing: nothing this fix provides — the blank it fills is pricing honesty in the aid chain, which only matters once someone actually calls for help (see named next).

## Metric review (§14)

The pre-registration held. The proof-primary design (attribution 100% on probes) was the right call for a bug fix — the sweep could not have measured the primary, because the competent substrate never exercises the aid-acceptance math; its guardrail role was to prove behavior-neutrality, and 16/16 identical pairs is the strongest possible form of that proof. No metric revision proposed. One honest limitation recorded: the acceptance-penalty application (score −10 on wave>=3) is demonstrated by the probe's captured tier + the existing comms.js code path, not by an end-to-end helped/not-helped comparison — building that needs a help-calling policy (named next, not chased). Process notes: (1) the two `check.js --quick` failures (test-sprites-valid-20261014.js, test-table-trial-fire-20261012.js) reproduce identically on the pristine baseline tree — pre-existing, unrelated; (2) the entity-wave-ignored convention (u6) follows the raidshield recipe exactly — the def is authoritative.

## Convergence state

**converged.** The arm's question (does the def-lookup fix attribute crisis tiers correctly without harming the village?) is answered: proof 100%, guardrails hold, behavior-neutral on the sweep substrate. The scale-onramp axis is not converged — the fix doesn't move the wall (it was never supposed to; it prices the aid chain honestly for the runs where aid is actually called).

## Named next (backlog, not chased)

The aid chain still has no organic caller on the competent substrate — leadfeast/belongfeast never callForHelp, so the fixed tier is never read in sims. The behavior surface of this fix (honestly-priced refusals on apex raids, help that arrives or doesn't) is unmeasured end-to-end. Next arm: a help-calling policy (socialite calls signal/cry) on apex-raid seeds, measuring acceptance/refusal splits and whether arriving help changes the raid channel — the aid chain's first real workout since the raid_raises_crisis wiring landed.

## Proof artifacts

- scripts/test-crisistier-20261016.js — unit 6/6 + wiring probe 3/3 RED→GREEN; SMOKE/DET gates
- scripts/sweep-crisistier-20261016.js — paired sweep (wrong-tree guards, 32 runs)
- scripts/analyze-crisistier-20261016.js — verdict analyzer
- evidence/2026-10-16/perseed-crisistier/ — 32 per-seed JSONs (numeric national/table/wins/exiled keys)
- evidence/2026-10-16/crisistier-beats/ — 32 beat files (16 pairs byte-identical)
