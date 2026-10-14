# Scale-wall r23 — flesh-out loop A, 2026-10-14T04:07Z run (THREE-ARM RUN, 2 GO / 1 KILLED)

**Pre-registration (MEASUREMENT §§9–12, 14):** Axis scale-onramp (standing directive; topmost non-converged, claims dir empty at run start).
Seeds 11/22/33/44/55/66/77/88 where applicable; 150/180d death-aware horizons;
identical-seed before/after per arm; pre-registered GO thresholds per arm.
Metric doubts → "metric review" sections in each arm's evidence file.

**ARM 1 (inffight → cf0acce3, GO, [needs-eyes])** — finding #102 FIXED (the
engine bug that made fifthlink's s44 unmeasurable). Two-half root cause:
(1) competent strikes weakest-live = 1-HP eye-heads whose sigW3a interception
consumes turns with zero damage — the lead never bled; (2) focus_group's
Deliberation is a self-centered burst (radius 1) but `encWantRange` returned 4
for burst, so heads held at d2 forever (12k-round probe: 10,786 declares, 1
landed). The swarm churned positions/HP every round, so driveFights'
no-progress guard never fired; the engine had no stalemate guard of its own.
Fix: `encWantRange` calibrates focus_group burst to its radius (1) — the
heads close in; eye-heads `blocks:false` (they were body-blocking the lead's
own 2×2 approach; they float, they only watch). FOCUSGROUP_CLOSE=0 disables
for RED. Steve's law honored: monsters were sent to fight — the group closes,
never disengages. Proof scripts/test-inffight-20261014.js RED 8/8 / GREEN
12/12 (RED: 50k rounds, over=false, Deliberation 0; GREEN: resolves in 12
rounds strike-weakest / 10 rounds honest lead-targeting). 16-run regression
bit-identical (national 0/16, wave5 0/16, maxWave 4, median 75d, exiled 0/16).
Coordinator re-verified on the rebased base after the sibling combat-survival
fixes landed mid-run: proof 12/12 + 4-run before/after sanity (11/22 ×
leadcourt/belongseek, 150d) — wall metrics, per-run trajectories, and
death-cause shares all identical. Evidence evidence/2026-10-14/sim-inffight.md
(+ inffight-reg-{before,after}.json). Finding #102 → [fixed]. [needs-eyes]
(combat feel — Deliberation now lands).

**ARM 2 (renegans → 7242a420 + coordinator repair 11b6cfa1, KILLED AT PILOT,
evidence-only)** — the r22-named blank: leadcourt's unanswered young-link
renegotiation beats (winseek answers them; fifthlink named them race loser
#2, −6 each). Policy layer scripts/policies/renegans.js (RENEGANS=1, default
OFF) mirrored winseek's honest bar verbatim (gift iff pantry > 8000, else
visit). Proof 16/16 with real RED (gate-off inert; real staged beat expires
unanswered 24→16→10 in-engine). Pilot 8 seeds × leadcourt, 180d, identical
seeds: beats answered 0/29 → 26/29 (90%, GO met) but 5th-link conversion 1/8
vs 1/8 (s44 S63, byte-identical) and Standing on forming seeds 170 vs required
185 → GO MISSED. Guardrails breached: median 81d → 60d (−21d, limit −10d),
exiled 0/8 → 1/8 (s55, exileDay 38) — lever-downstream, not noise (byte-
identical through d27, divergence from the first answers d31). Sense-test:
answers read as coherent village decisions; killed on outcomes, not sense.
Layer deleted per kill protocol; no trace. **Worker-integrity note:** the
committed proof hard-required the deleted layer (MODULE_NOT_FOUND) — same
class as r21b's matbank2 incident; coordinator repaired with the optional-
require/degrade-gracefully pattern (RED runs green in-tree, GREEN info-skips),
6/6 verified. Evidence evidence/2026-10-14/sim-renegans.md (+ 16 per-seed
JSONs, flat telemetry inputs). Follow-up: the #1 race loser (succession
haircuts −8/−14) is still unaddressed.

**ARM 3 (harnessstop → 9fcd6ec8, GO, tooling)** — finding #95 FIXED. Two
corrections to the original finding: (1) `Game.state.villagers` does not
exist — the "roster=11 vs villagers=0" disagreement was phantom; roster was
the true count; the REAL gap was `pop()===0` counting the scholar, so a
scholar-alone village simulated the whole horizon; (2) seed 505's 13-min
stall does not reproduce on current master (terminates d77 via engine
village-lost in ~11s — game code moved on). Fix: `runDays` stops on
engine-true `livingNPCs()` with a +10d tail (`endReason='village-dead'`);
tail resets on recovery, fail-open on read errors. Proof RED→GREEN (pristine:
75d horizon, `survived`; fixed: stops d23). Timing metric: 4959ms → 1076ms
(0.217 ≤ 0.25 — GO); dead days 60 → 8. Guardrail: 5/5 live seeds
byte-identical trajHash. Sweep audit: all sweep-*.js go through runDays
(fixed centrally); sim-idle-village-20261009.js's own copy documented,
deliberately frozen. Evidence evidence/2026-10-14/sim-harnessstop.md.
Finding #95 → [fixed].

**Landing notes (coordinator):** all three arms merged --ff-only (unpiped,
explicit exit checks). Two rebases were needed mid-run as the godhood-rework
loop and the manual combat-survival/armor+recruit runs landed on master
(sim-combatfix/sim-armor-recruit trees were active during the run, then
released; their commits 3e7e0cc6/7f20b790 are on master). Inffight's rebase
was clean against the sibling combat-survival fixes; proof + 4-run sanity
re-run on the new base before landing. Trees released/removed, main tree
clean (two untracked sibling evidence files in evidence/2026-10-13/ left
untouched). No push/bump — pending ship.

**Wall numbers (this run's suites):** national 0–4/16 · table 0 · wins 0 ·
wave-4 3–5/8 · wave-5 0/16 · median 60–147d · exiled 0–1/8.
TELEMETRY: telemetry-check vs scale-wall.json on the renegans flat files —
QUIET, no baseline roll. Inffight: no LOUD (before/after bit-identical).

scale-onramp stays `converging` — none of the three arms moved the wall
(renegans killed, harnessstop tooling, inffight an engine bug fix that
unblocks measurement). The wall's face after r23: diplomacy road spec-honest;
feast road wall-neutral; late-link race measured with mechanism working;
behind the Standing gate the mortality wall (wave-5 unlockers don't survive
to the table); the succession-haircut race loser (#1) still unaddressed;
wave-5 survival unmeasured. `longsims-rotation.txt` stays 3 — standing scale
directive holds until scale-onramp reads converged.
