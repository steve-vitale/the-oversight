# sim-winsupport-decomp — decomposing the parked window-support arm (flesh-out loop, 2026-10-19, ARM sim-winsupport-decomp)

Run: fleshout-20261019T08xxZ, arm sim-winsupport-decomp. Axis: scale-onramp (the blocking axis).
DECOMP LEVER RUN — decomposes the PARKED sim-winsupport arm (landed ad23720f3, evidence/2026-10-19/sim-winsupport.md).
New policy-side file: scripts/policies/winsupportdecomp.js (split-gate layer). Zero src/js changes.

Lineage: sim-windowsurvive named window SURVIVAL support (field recovery for wave-4-engaged fighters, raid defense during deferral).
The parked layer (scripts/policies/winsupport.js, WINSUPPORT=1, default OFF) has two halves:
(a) POST-FIGHT TRIAGE (wave-4+ fight recorder; scholar takes ≥25% maxHp in one wave-4+ fight → 2-day triage: EXTRACT wounded fighters home via honest travelTo, TEND wounded companions at haven, capped 2/day)
(b) RAID-NIGHT POSTURE (one honest rest/day at Haven when scholar wounded and rest can heal: doAction('rest'), +5 HP, 96 ticks, 40 kcal).
Parked verdict: PRIMARY GO (+15d median survival 116 vs 101, bar +10d — first real window-axis signal); guardrail breaches
(table 9/16 vs 11/16, 1 starvation death on belongfeast-s64008) classified METRIC-BROKEN (knife-edge at n=16, within noise).

QUESTION TO ANSWER: which half carries the starvation/table cost — triage (travel-to-Haven) or posture (rest verb)? Does the pantry-floor gate remove it?

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; wave-4 bands 35–95 dmg / 850–1500 HP; the readiness gate + VETERANS bar — design call #4;
the def5 window is where this layer lives).

## Design calls (documented — the decomposition)

**Split gate (mine):** `WINSUPPORT_ARM=triage|posture|gated` on top of `WINSUPPORT=1` selects the decomposition arm in
scripts/policies/winsupportdecomp.js. Gate-off (WINSUPPORT unset) = pure delegation for every arm, ctx untouched (proof-pinned).
The parked file scripts/policies/winsupport.js is NOT modified — the `winsupport-full` arm runs it as-is, so "as-is" is auditable.
The decomp layer reuses the parked file's exported primitives (raidPosture, triageDay, recordFightStart, closeFightRecord,
winsupportOn, wsWindowLive) — no logic duplicated, no drift surface.
- **triage:** fight → recordFightStart + base.fight; daily → base.daily + closeFightRecord + (window live ? triageDay); upkeep → base.upkeep only. The posture half is entirely absent — no rest verb ever fires from this arm.
- **posture:** upkeep → base.upkeep + raidPosture; daily → base.daily; fight → base.fight. No fight recording at all — the triage half is entirely absent (the recorder is inert without triageDay, so skipping it keeps the arm honest).
- **gated:** the full parked stack + PANTRY-FLOOR GATE on the rest verb: skip the 40-kcal doAction('rest') when the engine's own live pantry read
  `Game.pantryKcalLive(Game.state.village)` is below 4000 kcal — the engine's own "stores running thin" line (game.js talkReason: villagers raise
  "The stores. Have you looked at the stores? We're running thin." below 4000). If the read throws, fail OPEN to parked behavior (treat as no floor)
  and count it. The gate covers the rest verb only — the finisher's named next #2 names the rest verb, not travel; if triage turns out to be the
  cost carrier, a rest-only gate not removing the cost is an honest, reportable result.

**Seed budget (mine):** 16 seeds/arm — the finisher's "16–24 for guardrail reads" — × {leadfeast, belongfeast} = 32 runs/arm, 160 runs total across
5 arms. Justification: doubles the parked corpus (16/arm) for the tolerance-band guardrails; 160 runs × ~3–4s/seed-run ≈ 10 min compute in
10 parallel processes (5 arms × 2 policies, separate node processes — never two harnesses in one process).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**Arms (5, paired on identical seeds):**
- control — the parked substrate re-swept on current master (no WINSUPPORT)
- winsupport-full — WINSUPPORT=1, the parked layer as-is (replication check: should reproduce the parked direction on fresh seeds)
- winsupport-triage — WINSUPPORT=1 + WINSUPPORT_ARM=triage (triage half only)
- winsupport-posture — WINSUPPORT=1 + WINSUPPORT_ARM=posture (posture half only)
- winsupport-gated — WINSUPPORT=1 + WINSUPPORT_ARM=gated (full + pantry-floor gate on the rest verb)

**PRIMARY (per armed variant):** median survival days, armed vs the re-swept control (pooled: 16 seeds × {leadfeast, belongfeast} = 32 runs/arm).

**GO (per armed variant):** median survival +10d armed vs control (the parked bar).

**GUARDRAILS (per armed variant — the finisher's revised metric, tolerance bands):**
- table ≥ control − 2
- no new death modes (the armed cause-space introduces no cause absent on control)
- survival floor: armed median ≥ control median − 10d
- national not degraded (armed ≥ control)
- wave-4 not degraded (armed ≥ control)
- (wave-5 reported informational — the parked run gated it; the wall census is the axis read)

**Horizon:** 180d death-aware (dead villages stop simulating).

**Seeds:** 16 FRESH 65001–65016 (verified: zero filename hits in evidence/2026-10-19/perseed-*/ and scripts/; the 64xxx space is crowded — spikechar-b, windowsurvive, vetrel1 all drew there).
IDENTICAL seeds on all 5 arms (paired before/after).

**Substrate:** withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))) on {leadfeast, belongfeast} (+ the arm layer outside), SEATDRIVE=0,
env FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 VETREL=1, WINSUPPORT=1 on armed arms only,
WINSUPPORT_ARM={triage,posture,gated} on the decomp arms only.

**Base-relativity:** the control is RE-SWEPT on current master alongside the armed arms, never compared against the parked corpus numbers.

**Instrument:** scripts/probe-winsupportdecomp-20261019.js (fork of probe-winsupport-20261019.js: identical policy stack + identical pure
death-capture reads + identical death-channel classifier — the one deliberate change: the 5-arm dimension replacing the 2-arm one; the original
is untouched), scripts/analyze-winsupportdecomp-20261019.js (5-arm shift comparison against the pre-registered bars),
scripts/build-winsupportdecomp-panels.js (4 × §15 balanced-panel compares: each armed variant vs control — the panel is the instrument,
the pre-registered threshold is the judge), scripts/winsupportdecomp-transcripts-20261019.js (SAY-line probe for sense-testing),
scripts/test-winsupportdecomp-20261019.js (proof: GATE + ARM-SPLIT + TRIAGE + POSTURE + TEND + EXTRACT + PANTRY-FLOOR fixtures, SMOKE, DET).

**No [needs-eyes]:** policy-side sim lever, no player-facing change.

## Metric review

(pre-registered doubts — for the NEXT run if the metric proves wrong; the GO bar above binds THIS run, §14)
1. **Median survival may under-read a window lever** (parked doubt #1, carried): if the layer converts window deaths into later non-window deaths,
   median survival moves less than the window-death count. The taxonomy per arm is the secondary read — the GO bar stays median survival.
2. **The +10d bar vs the −58d vetrel cost** (parked doubt #2, carried): +10d stays deliberately modest for pure-defense halves.
3. **Leadfeast/belongfeast asymmetry** (parked doubt #3, carried): the window is a leadfeast phenomenon. Pooled median is the pre-registered judge;
   the per-policy split is reported honestly.
4. **The full-replication arm may not reproduce +15d** (new): the parked +15d was on seeds 64001–64008; fresh seeds re-draw the noise. If
   winsupport-full lands far from +15d, the decomp read (which half carries the cost) still stands on the fresh-seed corpus — the question is
   about the cost halves, not re-proving the parked point estimate.

## Results

(TO BE FILLED after the sweep)

## Village assessment

(to be filled — plain words)

## Sense-testing (SENSE-TESTING LAW)

(TO BE FILLED — the parked run skipped it; this run reads the staged control-belongfeast-s64008.txt + fresh transcripts from this sweep)

## Named nexts

(to be filled)

## Out-of-arm findings

(to be filled — stay on axis; findings go to hidden_files/sim-findings.md)

## Convergence

Axis: scale-onramp. This arm: (to be filled — converging | converged | parked | killed-at-pilot).

## Files

- scripts/policies/winsupportdecomp.js — the split-gate layer (this run)
- scripts/test-winsupportdecomp-20261019.js — proof (this run)
- scripts/probe-winsupportdecomp-20261019.js — 5-arm sweep fork (this run)
- scripts/analyze-winsupportdecomp-20261019.js — 5-arm shift comparison (this run)
- scripts/build-winsupportdecomp-panels.js — 4 × §15 panel compares (this run)
- scripts/winsupportdecomp-transcripts-20261019.js — SAY-line probe (this run)
- evidence/2026-10-19/perseed-winsupportdecomp/{control,full,triage,posture,gated}/{leadfeast,belongfeast}/s65001–s65016.json — 160 per-seed JSONs (this run)
- evidence/2026-10-19/winsupportdecomp-corpus-summary.json + winsupportdecomp-arm-shift.md (this run)
- evidence/2026-10-19/winsupportdecomp-panel-primary-{control-vs-*}.{json,md} — §15 panel compares (this run)
- evidence/2026-10-19/winsupportdecomp-transcripts/ — sense-testing transcripts (this run)
- evidence/2026-10-19/sim-winsupport-decomp.md — this file
- ZERO src/js changes (policy-side only)
