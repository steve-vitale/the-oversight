# ARM "succevac" — successor-evacuate (scale-onramp, sim-findings #214) — KILLED AT PILOT

Worktree: `~/workspace/worktrees/sim-succevac`. Run: oversight-flesh-out-loop, run 2026-10-15T03:05:11Z (claim fleshout-a-2026-10-15T03:05:11Z), axis scale-onramp. Claims sim-findings #214 (SUCCESSION FEED IS A HAVEN-SIEGE PHENOMENON) — the named next from the succbrake kill: move the successor off the tile.

## The blank

sim-findings #214 (this arm's claim): the succbrake arm falsified the ranging theory of the succession feed — the feed is a Haven-siege phenomenon (monster kills the scholar AT Haven, mantle passes, engine moves the new scholar to Haven, monster kills the successor at Haven; 11/11 armed feed deaths at [4,4], 9/11 while fortified). The named next: answer the besieger or move the successor off the tile. This arm built the second: SUCCESSOR-EVACUATE.

## Canon read

- docs/CANON.md (manifest + standing rules). No canon doc covers successor evacuation; the design uses only existing engine verbs (travelTo, travelTargets, say, displayName, nodeEpithet) and the existing policy path (fourthlink/leadcourt/competent). The evac fiction ("the village gets the new scholar off Haven for a night") is new narration — a design call Steve can overrule.
- Engine facts used (read, not invented): ledger.js playerDeath moves the new scholar to the haven tile (`s.mx=4; s.my=4; map.px=village.px`); Game.travelTo(x,y,force,combatExit) refuses mid-combat without combatExit and refuses unknown targets (returns null); travelTargets() lists tiles within d<=3 revealed or d==1 unrevealed; the harness day loop runs policy.daily at the END of each loop-day (after 3 day-parts), before Game.sleep().

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sims

- **Question**: when a scholar combat death happens AT Haven (a siege is active), does moving the successor OFF Haven to an adjacent known tile and holding ~1 day break the feed chain?
- **Primary metric** (binding): next-day-plus successor combat deaths per mantle succession — feeds with gap>=1 (succession startDay -> successor death day) divided by mantle successions — armed <= control x 0.70. Rationale (the same-day interception limit, handled honestly): policy.daily is the first thing that can act after a succession; a successor who dies before that first turn is unreachable by ANY policy lever. The gap>=1 set is what the lever can actually touch. The same-day/next-day split is measured in the arm's own control and reported.
- **Degeneracy rule** (pre-registered): if the control's gap>=1 feed count is 0, the primary cannot bind — the phenomenon didn't reproduce on the touchable axis. Verdict then is INSUFFICIENT-EVIDENCE (lever untested; no GO claim on a degenerate metric).
- **Secondary** (reported, non-binding): total feeds/succession (succbrake's gap<=1 definition, comparable); the same-day vs next-day split; the Haven-tile vs wild-tile split of feed deaths; an intervening-daily probe (of gap-0 feeds, how many had a post-succession policy.daily before the successor's death — the truly unreachable set).
- **Guardrails**: median survival >= control-10d; national >= control-2/8; no new death mode — a player:cause key present in armed but absent in control counts only at n>=3 (#216 lesson: n<3 is noise).
- **Horizon**: 180d death-aware (harness +10d tail). Why: the siege is a late-game pathology (succbrake feeds at d48-d118); the run must live into the threat band. Dead villages stop via the harness tail — never a fixed grind.
- **Seeds**: 11/22/33/44/55/66/77/88 (pilot 8; confirm 12-16 only on GO).
- **Policies**: control = fourthlink (leadcourt + FOURTHLINK=1 — the diagnostic's road); armed = fourthlink + succevac (SUCCEVAC=1). Identical seeds. Deterministic (A/A gate per side). Own control in the same sweep (baseline drift #247 — never inherit; the succbrake control ran on a different base).
- Metric binding (§14): a miss is NO-GO, never re-scored mid-run. Metric doubts go under "metric review" below and apply to the NEXT run.

## The layer (scripts/policies/succevac.js, SUCCEVAC=1, default OFF) — DELETED per kill protocol

Gate off → the wrapper delegates to fourthlink verb-for-verb (proof R1/G8; sim det-gate byte-identical). Gate on → wraps fourthlink:
(a) each daily/upkeep scans telemetry for new scholar deaths (player:true); a combat-category death whose death tile (ev.tile, stamped by the sweep's read-only tele wrap — at tele time the scholar is still the dying one, on the death tile) equals the haven tile opens/extends the evac window (evacUntil = deathDay + SUCCEVAC_DAYS=1; chained Haven combat deaths extend). Deaths without tile attribution fail safe: no evac.
(b) inside the window, at the first hook where the scholar is on the haven tile: evacuate — one honest Game.travelTo to the first revealed adjacent (d==1) non-haven tile from Game.travelTargets() (fallback: first d==1 unrevealed; deterministic order), verified via map.px/py; the evac line is said once per window (names the dead and the living).
(c) the base daily+upkeep then run under the evac travel guard: any travelTo while evacuating is declined ({moved:false} — callers handle it, the succbrake-proven shape); combatExit (flee-by-barrier) always passes. The guard holds the successor off Haven ~1 day so the base policy can't walk them back into the siege.
No new verbs; every call is an existing engine path. Design calls (Steve can overrule): SUCCEVAC_DAYS=1; "known" = revealed adjacent tile ("safe" is not knowable — the mechanism is breaking co-location with the besieger, documented as such); combat-only trigger at the haven tile (wild combat deaths don't besiege; non-combat deaths don't besiege); the evac fiction.

**Mid-run instrument bug found and fixed** (probe-evac-miss-20261015.js): the first instrument design used a ctx-side death-tile channel merged only in the daily instrument — but the layer scans in upkeep too, so every death first seen at an upkeep (seen=true) never got its tile and the window never opened (s22 d134: seen=true, evacUntil=0). The pilot's first armed run measured a substantially broken trigger (6 evac windows vs 21 after the fix). Fixed by stamping ev.tile on the telemetry record itself (single read-only tele wrap; no ordering hazard). All gates re-run green after the fix (proof 11/11, SMOKE 123/123 identical, DETGATE identical, AA deterministic both sides). The numbers below are the FIXED runs.

## Proof: scripts/test-succevac-20261015.js — 11/11 GREEN pre-kill (REAL RED verified)

- R1 (RED): gate OFF -> daily/upkeep delegate verb-for-verb identical, no tracking state.
- R2 (REAL RED): gate OFF + Haven combat death -> the successor is NOT evacuated (the blank, unblocked).
- G1: Haven combat death -> evac (line once, adjacent move, wild declined, base daily ran).
- G2: expiry after SUCCEVAC_DAYS; G3: chained Haven death extends; G4: wild combat death doesn't evacuate; G5: non-combat Haven death doesn't evacuate; G6: combatExit passes; G7: upkeep guarded (evac fires from upkeep); G9: unattributed death fails safe.
- G8 (det-gate): gate-off 3-day scripted run — identical verb sequences + ctx keys.
- REAL RED on pristine: layer removed -> test FATALS (exit 2), not INFO-SKIP. Restored -> 11/11.
- SMOKE=1 subset 3/3. Sim gates: SMOKE 123/123 hashes identical (instrument trajectory-neutral); DETGATE wrapper-vs-raw identical; AA=1 deterministic both sides.
- Post-kill: layer deleted per protocol; this proof INFO-SKIPs when the layer is absent (spiralcond/succbrake precedent); the 11/11 pre-kill result stands as documented here.

## Results — PRIMARY HIT, MEDIAN GUARDRAIL MISSED → KILL

Control (`evidence/2026-10-15/sim-succevac-control.json`, own control, same sweep — reproduces exactly across the instrument redesign):
- PRIMARY denominator: **3 gap1+ feeds / 52 mantle successions = 0.0577/succ** → **GO bar: armed ≤ 0.0404**.
- Total: 10 feeds/52 = 0.1923/succ (gap0=7, gap1+=3). Median 108.5d; national 5/8; wave-5 0/8; exiled 0/8.
- Control gap1+ detail: s22 d134→d135 ([4,4]→[4,4], Reunion→Congregation); s44 d114→d115 ([6,0]→[4,4], Algorithm→Reunion — wild predecessor, Haven successor); s77 d101→d102 ([4,4]→[4,4], Eulogy→Reunion).

Armed (`evidence/2026-10-15/sim-succevac-armed.json`, fixed instrument):
- PRIMARY: **1/54 = 0.0185 ≤ 0.0404 → HIT** (the single gap1+ feed: s33 d94→d95, White Noise→The Spoiler, [4,4]→[4,4]).
- Total: 7/54 = 0.1296/succ (gap0=6, gap1+=1).
- Guardrails: median **75d** vs bar ≥ 98.5d (108.5−10) → **MISS (−33.5d)**; national **4/8** vs bar ≥ 3/8 → PASS; exiled 0/8; new death-mode check: armed-only keys are villager:Big Loud / Big Ugly / Hummice, all n=1 → noise per the n≥3 rule → PASS. player:combat 47→51, player:starvation 2→3, player:dehydration 1→2.
- Per-seed days (ctrl → armed): s11 33→24, s22 159→100, s33 53→94, s44 123→129, s55 115→56, s66 93→52, s77 103→51, s88 114→96. 5/8 worse, 2/8 better.
- Layer activity: 21 evac windows fired (evacLines: 2,6,2,4,2,2,1,2) vs 6 with the broken trigger — the fix works.

GO verdict (§14 binds the package): PRIMARY 0.0185 ≤ 0.0404 HIT — but the median-survival guardrail MISSED by 33.5 days. A lever that cuts the touchable feed rate while killing villages a month earlier is not landable. **KILL.** No confirm (confirm is for GO; this is not GO).

Kill protocol: `scripts/policies/succevac.js` DELETED. Proof/sweeps/probes/sense/evidence retained as documentation (the layer is rebuildable from this spec).

## Why it missed — the mechanism probe (the real finding)

The evac moves the successor, but **the besieger pursues** — the chain relocates, it isn't broken. Three examined cases:

1. **s55 d37 (transcript-proven)**: leo_martin dies at Haven [4,4] to The Callback. The evac fires from upkeep, moves the successor (gen_zh3y1ey) to [4,3]. The transcript narrates: "Travel 1 tile to grove. **It followed you. The Callback is here.**" The successor dies at [4,3] the same day to The Callback (same monster, gap0). The engine literally has a pursuit narration.
2. **s44 d125 (interveningDaily=true)**: the evac fires from daily, the successor is moved off Haven — and dies at [3,1], four tiles out, to The Eater (same monster as the predecessor's killer). Evacuated, fled (combatExit passes the guard by design), died anyway.
3. **s33 d94→d95 (the surviving gap1+ feed)**: nikolai dies at Haven d94; visjoin_81 takes over and dies at Haven d94 (gap0); visjoin_79 takes over, and dies at Haven d95 (gap1) — DESPITE an active evac window. The evac move was refused: the successor was already in combat with the besieger when the policy hook ran, and travelTo refuses mid-combat without combatExit.

The theory's two failure modes: (a) **pursuit** — the monster follows the evacuee to the adjacent tile (the engine even narrates it); (b) **mid-combat refusal** — by the time the policy can act, the successor is often already engaged, and no policy verb can move them. Moving the successor off the tile answers neither. The remaining honest lever from #214's "named next" is answering the besieger directly (drive it off / kill it) — a different arm.

The median cost (−33.5d) has two plausible components, both consistent with the data: (i) the guard holds the successor off-Haven declining ALL travel ~1 day per window (21 windows) — disrupting the competent policy's food/water/haven routines (player:starvation 2→3, player:dehydration 1→2); (ii) the evac tile isn't safe — evacuated successors die there (player:combat 47→51; three same-monster relocations). The layer fires ~3× per actual feed (21 windows vs 7 total feeds) — mostly false positives, each one a disrupted day.

## Village assessment

Eight villages on the courtship road. The control villages live a median 108.5 days, reach national on 5/8, and meet the siege late (feeds at d85–d135, all at Haven). The armed villages die younger (median 75d) — the evac's daily disruptions compound: s22 159→100d, s55 115→56d, s66 93→52d, s77 103→51d. Who died: scholars, disproportionately — 51 player:combat deaths armed vs 47 control, several at the evac tiles they were moved to "for safety." The cruelest case is s55: the village watches the new scholar evacuated to the drowned grove, hears "It followed you," and buries them the same day. Who thrived: nobody in particular — the shorter runs never reached the late-game threat band where the lever could matter, which is itself the verdict: the cure is worse than the disease at this dose.

## SENSE-TESTING (scripts/sense-succevac-20261015.js, seed 55, armed, fixed instrument)

The evac line reads as a village decision: "🕯️ After Abraham's death at the fire, Jesse won't sleep at Haven tonight — whatever killed them could still be out there. They take drowned grove and hold till it's clear." It names the dead and the living, states a decision with a reason — not a system alert, not a teleport. The d37 case reads even better as drama and worse as design: "Travel 1 tile to grove. It followed you. The Callback is here." — the transcript proves the pursuit mechanism in-fiction. The surrounding transcript reads as people (mantle-transfer beats, grave speeches, monster-naming arguments). No robotic surface from the layer — one line per window, no spam.

## Blanks filled / documented

- **Measured** (not chased): the succession-feed base rate on this base — control 10/52 = 0.1923/succ total, 3/52 = 0.0577/succ touchable (gap1+); gap0:gap1+ split 7:3; intervening-daily probe: of 7 control gap-0 feeds, **0 had a post-succession policy.daily before the successor's death** — the brief's same-day interception limit is confirmed empirically (gap-0 is unreachable by any policy lever, not just this one).
- **Falsified** (this arm): the evacuate theory of the feed. Moving the successor off Haven does not break the chain — the besieger pursues (transcript-proven "It followed you"), and mid-combat travelTo refusal blocks the move when the successor is already engaged. Filed to sim-findings.md as the corrected mechanism.
- **Instrument lesson**: a ctx-side death-tile channel merged only in the daily instrument misses every death first seen at an upkeep (the layer scans in both). Stamp ev.tile on the telemetry record instead — single wrap, no ordering hazard. (probe-evac-miss-20261015.js documents the bug.)
- **Documented** (sim-findings.md): the pursuit phenomenon as the corrected #214 mechanism; the remaining "answer the besieger" lever as the honest next arm.

## Metric review (§14)

Primary HIT (0.0185 ≤ 0.0404) but the median guardrail MISSED (75d < 98.5d) → KILL, not landable. Per §14 this is NO-GO, not re-scored — the layer is killed.

The metric package was fair: the primary measured what the lever claimed (touchable feed rate), the guardrails measured what the lever cost (survival). The primary hit is real but thin (3→1 feeds) and the mechanism probe shows even the "prevented" feeds are better explained by relocation than prevention — the lever moves the death, it doesn't stop it. Two revisions proposed for the NEXT run, not this one:
1. A relocation-aware feed metric: count the chain (successor dies within 1 day to the SAME monster, any tile) rather than the tile — the current metric credits the lever when the death moves off Haven but the chain persists.
2. The median guardrail's −10d band is tight for n=8 on this chaotic road (per-seed swings ±50d); a future arm with a noisier lever should pre-register a wider band or a paired per-seed test — but NOT retrospectively for this run.

Honest counterpoint recorded: the primary did hit, and 21 evac windows fired correctly (the trigger fix works). If the median hadn't moved, this would be a GO. It did — and §14 forbids re-scoring. The "answer the besieger" arm is the honest next step.

## Telemetry deviation check (scripts/telemetry-check.js) — PENDING (coordinator step)

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | medianSurv | exiled |
|---|---|---|---|---|---|---|---|
| control (8) | 5/8 | 0/8 | 0/8 | — | 0/8 | 108.5d | 0/8 |
| armed (8) | 4/8 | 0/8 | 0/8 | — | 2/8 | 75d | 0/8 |

No run reached the table or a win. The scale wall stands.

## Base note

Worktree registered from local master e37dc6f6. All runs on the registered base per the landing protocol.
