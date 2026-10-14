# ARM "candwindow" — keep the proposal window open (pantry discipline + codex-study courtship assist) — KILLED AT PILOT

Worktree: `~/workspace/worktrees/sim-candwindow`. Run: oversight-flesh-out-loop, loop A, run fleshout-a-2026-10-14-1506, axis scale-onramp (lever-8 lens).

## Context
The subaid arm's metric review (evidence/2026-10-14/sim-subaid-b.md) named the mechanism: the 6th link's formation is candidate-gated — the proposal window (day>=25, no pending counter/accord/national, pantry>12000, known+unlinked candidates; the <3-subs cap is removed on this stack by FOURTHLINK=1) opened only ~3-4 days in ~120 on s44, and a one-day trajectory perturbation (a pantry dip) closed it, costing the 6th link and the wave-5 unlock. The lever isn't just affording bonds, it's keeping the window open. This arm claims the sim-findings item "CANDIDATE WINDOW IS THE FORMATION GATE". POLICY-SIDE ONLY (game code off-limits this run — sibling loop mid-measurement on a game.js instrument; hierarchy.js is engine territory anyway).

## The lever (policy layer, now DELETED per kill protocol)
`scripts/policies/candwindow.js` (CANDWINDOW=1, default OFF), wrapping the exact subaid courtship stack (FOURTHLINK=1 + FIFTHLINK=1), its pass running BEFORE the stack's daily:
1. **Pantry discipline** — while day>=25, known+unlinked candidates exist, and the pantry sits at/below the 16000 shoulder (window open or one dip from closed): suppress the discretionary pantry draws — evening feast (COMPETENT_FEAST=0) and discretionary aid-giving (COMPETENT_AID=0). Toggles restored outside the zone. The layer fires no tend of its own (tending is the stack's floored business: never below 12000), so it can never spend the gate shut.
2. **Courtship assist (known-state)** — while the window is OPEN: walk the scholar to the stack's next proposal target (<=3 tiles, cheap trip) and study their codex once (LINK THE CODICES — honest contact, real knowledge, a real day-part of the scholar's time). One study/day max, only when pk > 14000.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims
- **Axis**: scale-onramp (the wall), lever-8 lens. Policy stack, seeds, and instruments read from evidence/2026-10-14/sim-subaid-b.md; own before/after control re-run on current tip (subaid's numbers NOT reused).
- **Seeds**: 8 seeds identical before/after (11/22/33/44/55/66/77/88), 180d death-aware (dead villages stop; +10d tail max).
- **PRIMARY**: windowOpenDays >= control x 1.5 AND forming (links formed per suite) >= control. Both must hold — a wider window that forms nothing is mechanism without outcome.
- **GUARDRAILS**: national >= control-2; starvation deaths <= control+2; hungryDays (fc.starveDays) <= control x 1.1; no new death mode; exiled <= control+1.
- **Gates before spend**: proof test scripts/test-candwindow-20261014.js RED→GREEN (real RED on pristine); det-gate 16/16 or 32/32 identical; SMOKE=1 instrument-honesty gate (the 2026-10-14 prodthrottle lesson).
- **GO**: at pilot → confirm 12–16 seeds before calling GO. A miss is NO-GO — never re-scored mid-run.

## Gates (all green before spend)
- **Proof** `scripts/test-candwindow-20261014.js`: REAL RED on pristine (2/2 failed, exit 1 — the layer is inert, its behaviors cannot fire) → GREEN 9/9 when armed (gate identity, discipline fires in the zone, toggles restore, study fires on a reachable candidate, far target skipped, layer fires no tend of its own, day<25 gate, no-candidates gate).
- **Det-gate** `scripts/det-gate-candwindow-20261014.js` (armed stack, CANDWINDOW=1): 8/8 IDENTICAL (16/16 runs) — before/after comparisons trustworthy.
- **SMOKE=1** `scripts/sweep-candwindow-20261014.js`: control side 4/4 (policy unwrapped, id fifthlink-r26, harness invokes daily 3.8/d, 2430 policy acts); armed side 5/5 (+ layer fires in the discipline zone: toggles set, discipline day counted).

## Pilot (8 seeds × courtstack, 180d death-aware, identical seeds)

| | control | armed | GO bar | verdict |
|---|---|---|---|---|
| windowOpenDays (suite) | 21 | 18 | ≥ 31.5 | **MISS** |
| links formed (suite) | 38 | 34 | ≥ 38 | **MISS** |
| links seasoned (suite) | 29 | 24 | — | — |
| proposals (accepts) | 38 (35) | 34 (32) | — | — |
| cwDisciplineDays | 0 | 19 | — | mechanism fired |
| cwStudies / cwTravels | 0 / 0 | 3 / 4 | — | assist barely engaged |
| national | 5/8 | 5/8 | ≥ 3 | ✓ |
| exiled | 0/8 | 0/8 | ≤ 1 | ✓ |
| starvation deaths | 11 | 7 | ≤ 13 | ✓ |
| hungryDays (starveDays) | 8 | 9 | ≤ 8.8 | **MISS (hair)** |
| new death mode | — | player:sickness | none | **MISS (strict)** |
| table / won | 0/8, 0/8 | 0/8, 0/8 | — | — |
| wave4 / wave5 | 6/8, 2/8 | 6/8, 2/8 | — | — |
| maxStanding | 254 | 254 | — | — |
| median survival | 110d | 101d | — | REPORT-ONLY |

Per-seed (ctrl → armed): s11 d132→101 w7→6 f7→6 st136→170 natY→Y (5 disc days); s22 d129→129 w1→1 identical; s33 d31→31 w1→1 identical; s44 d128→128 w4→4 f6→6 s6→6 st254→254 identical (0 disc days — the layer never engaged on the subaid thin-window seed); s55 d99→99 w3→3 identical; s66 d75→177 w2→1 f4→3 st0→127 nat-→Y (1 study); s77 d110→89 w2→1 f5→3 st136→127; s88 d95→39 w1→1 f4→4 s4→0 st136→0.

**VERDICT: KILLED AT PILOT.** The primary missed on BOTH prongs (18 < 31.5, 34 < 38). No re-scoring. The layer is deleted per kill protocol; proof + sweep + sense + det-gate scripts and both sweep JSONs kept.

## Why it missed (honest diagnosis)
1. The discipline zone fired only 19 days across 8 seeds — the window's pantry predicate was rarely the binding constraint on this stack/tip. The control window already stood at 21d (the subaid s44 anecdote was one seed, not the suite). On s44 itself the window measured 4d on BOTH sides with 0 discipline days — the pantry sat above the 16000 shoulder or the village died before the zone mattered, so the layer never engaged where it was designed to.
2. The courtship assist barely engaged (3 studies, 4 travels in 8×180d): the conjunction it needs — window open AND pk>14000 AND target within 3 tiles AND unstudied — is rare.
3. Where the layer did engage, trajectory perturbation dominated any gate-holding: s66 lived 102 days longer and nationalized (the lever's best single outcome), s88 died at d39 vs d95, s11 lost a link. The travel-study's day-part cost pulls the scholar off foraging, partially defeating the discipline — the mechanism works against itself.
4. The counterfactual the arm was built for (subaid's s44: 4→3 open days) did not reproduce on the current tip — s44 shows 4 open days on both sides. The thin-window event is trajectory-fragile, not a stable lever target.

## SENSE-TESTING (armed s11 — judgment, not counts)
The proposal beats read as the played climb: "⛓️ Pamela brings it home: Thornfield bows to Haven — one organization, us primary. Tribute: 4,000 kcal/week. The relationship starts at trust 30. Everything from here is earned." Named speakers, honest terms, no silent flips. Tend beats byte-identical to control ("🌾 Haven sends 1,500 kcal of grain to Thornfield's fire — not tribute, the other way around..."). The suppressed feasts are simply absent — nothing narrated as refused, which is the honest behavior. **PASS** on meaning; the layer added no fiction of its own.

## Village assessment
The armed villages look like the control villages with small perturbations — same courtship climb, same tend beats, same death modes. s66 is the one village the layer visibly changed: it lived to d177 (vs d75) and staged national — the pantry discipline plus one codex study carried it through the mid-game — but s88 died at d39 (vs d95) on the same mechanism's travel cost. The wall is untouched: table 0/8, wins 0/8, wave-5 2/8 both sides. The blank documented, not filled: **the candidate window's thin days are trajectory-fragile, not pantry-disciplinable from the policy side** — the lever fires where the pantry is already safe and stays silent where the window is thin.

## Metric review (§14 — for the NEXT run, not this one)
1. The 1.5× window bar was calibrated on the subaid s44 anecdote (4→3 days), not the suite baseline (21d): it demanded +10.5 window-days from a lever that only fires inside the 12000–16000 pantry band. Bar miscalibration — named, not re-scored.
2. The hungryDays guardrail (control×1.1 = 8.8) is tighter than the noise floor: control starveDays was 8, a ±1 swing is noise. Next run: per-seed diffs or a wider bound.
3. The "new death mode" key comparison is string-fragile ('player:sickness' vs 'villager:sickness' — same cause family, different victim class). Next run: compare cause families, not victim-prefixed keys.
4. The s44 non-reproduction matters: the subaid thin-window event (4→3 open days under the armed ENGINE) does not reproduce under the current-tip control stack — formation-gate levers should re-verify the motivating event on the current tip before building.

## Telemetry-glob note (for the coordinator)
Per-seed evidence JSONs: `evidence/2026-10-14/sim-candwindow-control.json`, `evidence/2026-10-14/sim-candwindow-armed.json` (rows carry linkpipe/windowOpenDays, fc/starveDays, sr/national+exiled, tune/standing, deathCauses). Suite-level wall numbers: national 5/8 both sides, table 0/8, wins 0/8, wave4 6/8, wave5 2/8, maxStanding 254, median survival 110d control / 101d armed. No telemetry-check run by this worker (coordinator owns the baseline roll per the loop body).

## Files
- `scripts/policies/candwindow.js` — DELETED per kill protocol (no trace).
- `scripts/test-candwindow-20261014.js` — proof, RED→GREEN (kept).
- `scripts/det-gate-candwindow-20261014.js` — det-gate 8/8 (kept; archival — the layer it gates is deleted).
- `scripts/sweep-candwindow-20261014.js` — pilot sweep + SMOKE=1 gate (kept; archival).
- `scripts/sense-candwindow-20261014.js` — transcript reader (kept).
- `evidence/2026-10-14/sim-candwindow-control.json`, `sim-candwindow-armed.json` — per-seed evidence.
- `evidence/2026-10-14/sim-candwindow.md` — this file.
