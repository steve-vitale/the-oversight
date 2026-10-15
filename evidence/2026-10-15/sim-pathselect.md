# sim-pathselect — build-matched door choice in the winpursuit drain (flesh-out loop B, 2026-10-15)

Run: sim-pathselect (flesh-out loop B, 2026-10-15). ARM 1 of 1.
Claims: sim-findings #311 (path-selection strategy for the winpursuit table drain — the chooser is an unbuilt lever).
Axis: scale-onramp (standing scale directive; the win side of the wall).
Canon: docs/CANON.md + docs/TABLE.md (law 2: "Everyone gravitates to the path that suits the build they landed on").

## Pre-registration (MEASUREMENT §§9–12, 14 — binding; a miss is NO-GO)

**Question:** the landed winpursuit layer answers options[0] throughout, so all 7 measured wins walked the FEARED path (first earned path in registration order). Can the drain walk build-matched doors — reading the run's earned state at each 7-door modal and walking the earned path with the highest table-priced standing — without losing wins, and does it demonstrably walk other doors end to end?

**The arm.** PATHSELECT=1 inside scripts/policies/winpursuit.js: the door modal (the ONLY frame whose every option id starts with `path:`) is answered with the earned path whose `tableEarnedPaths()` standing is highest. Each path's prereq() already prices standing 0–100 from the build's own signals (might+killed feared, sysbond+stage relay, viewership beloved...), so the chooser reads the table's OWN build read — no new canon. Ties keep registration order (identical to options[0] on ties). Challenge beats, downgrade, finals, the trial guard, and the deferral/walk-now logic are untouched (sibling arm's). Gate off → winseek's tableRoad byte-identically (det-pinned vs the committed 9b25ccef layer).

- PRIMARY (binding): total wins armed ≥ control (the chooser must not lose wins to earn variety).
- CO-PRIMARY (binding): non-feared-path wins armed ≥ 2 (the chooser demonstrably walks other doors end to end).
- GUARDRAILS: national ≥ control−2/16; median survival ≥ control−10d; no new death mode at n≥3.
- Substrate: 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast} × {control, armed}, 180d death-aware, identical seeds both sides, own control in the SAME sweep (#247). FEASTSCALE_R13=1 + WINPURSUIT=1 both sides (asserted up front, #312); control = options[0] drain, armed = + PATHSELECT=1. Wintrace instrument both sides (behavior-neutral).
- Horizon: 180d death-aware. The win-day floor is day 90 and the deferred re-offer needs the days after; a shorter horizon would cut the chain. Dead villages stop simulating (+10d tail max).
- Proof: scripts/test-pathselect-20261015.js — 22/22 GREEN (honest RED: pristine options[0] drain picks feared at standing 60 vs relay 92; gate-off drain byte-identical 70d to committed 9b25ccef; GREEN: chooser walks max-standing door, non-door frames keep options[0], tie → registration order; det-gates; SMOKE instrument-honesty).
- Det-gate: scripts/det-gate-pathselect-20261015.js — 16/16 identical required before trusting the comparison.

## Metric review

The co-primary miss (0 non-feared wins vs the ≥2 bar) is a REAL miss, not a
metric artifact: the chooser demonstrably ran (13 door records), read live
standings, and walked the max-standing door every time — feared. The metric
measured exactly what it said. No revision proposed; the finding belongs in
the table-side pricing (new finding filed), not in the chooser or the
metric.

## Results — PILOT (NO-GO on co-primary — arm KILLED per binding §14)

Substrate: 8 seeds × {leadfeast, belongfeast} × {control, armed}, 180d
death-aware, FEASTSCALE_R13=1 + WINPURSUIT=1 both sides, WINTRAZE=1 both
sides, identical seeds both sides, own control in the same sweep (#247).
Proof scripts/test-pathselect-20261015.js 22/22 GREEN. SMOKE green.
Det-gate 16/16 identical (traced+pursued+PATHSELECT).
Per-seed JSONs: evidence/2026-10-15/perseed-pathselect/*.json.

| | control | armed | bar | verdict |
|---|---|---|---|---|
| wins | 7/16 | 7/16 | armed ≥ control | GO |
| non-feared-path wins (armed) | — | 0 | ≥ 2 | **NO-GO** |
| national | 5/16 | 5/16 | ≥ control−2 | GO |
| median survival | 90d | 90d | ≥ control−10d | GO |
| non-win median (review metric) | 60d | 60d | — | = |
| new death mode ≥3 | none | none | none | GO |
| table reached | 8/16 | 8/16 | — | = |
| wave 4–5 unlocks | 8/16 | 8/16 | — | = |

The chooser walked FEARED at 13/13 door modals (every sitting + re-offer).
The table's own build read, recorded live at each door:

| run | won | walked | standing (desc) |
|---|---|---|---|
| belongfeast s22 | 0 (deferred-died) | feared | feared 100, beloved 95, assimilated 45, relay 40, defiant 36 |
| belongfeast s44 | 1 | feared | feared 100, beloved 100, defiant 70, assimilated 55, relay 50 |
| belongfeast s55 (sit) | 1 | feared | feared 100, beloved 99, assimilated 45, relay 40 |
| belongfeast s55 (re-offer) | 1 | feared | feared 100, beloved 100, assimilated 45, defiant 40, relay 40 |
| belongfeast s66 (sit/re-offer) | 1 | feared | feared 100, beloved 88→100, assimilated 45, relay 40 |
| leadfeast s22 (sit/re-offer) | 1 | feared | feared 100, beloved 100, assimilated 45, relay 40 |
| leadfeast s33 | 1 | feared | feared 100, beloved 100, assimilated 50, defiant 40, relay 40 |
| leadfeast s44 (sit/re-offer) | 1 | feared | feared 100, beloved 100, assimilated 50, relay 40, defiant 36→44 |
| leadfeast s66 (sit/re-offer) | 1 | feared | feared 100, beloved 100, assimilated 55/45, relay 50/40, defiant 46/40 |

Reading: feared's strength (25 + distinct*3 + might*2, capped 100)
saturates the cap on every feast-road run — these builds ARE feared
builds by the table's own pricing (heavy might+killed ledgers). Beloved
ties at 100 on several runs but loses the registration-order tie-break.
Relay is never competitive (40–50): stage-3 qualification exists but
sysbond never grows — no policy on these roads uses relay verbs. The
re-offer re-pricing is live and honest (s66 beloved 88→100, s55 99→100;
s44 defiant 36→44) — the chooser re-read the build each sitting.

The mechanism works exactly as designed; the door-variety gap is in build
composition and table-side pricing, not in door choice. Kill protocol
applied: scripts/policies/winpursuit.js reverted byte-clean; the
measurement (proof, det-gate, sweep, compare, evidence) is kept.

## Sense-testing

Three reads, all from the armed side's capture (evidence/2026-10-15/pathselect-beats/):

1. **The walked door is voiced aloud and build-consistent**
   (belongfeast-armed-s66, d43): the door modal's choice grants the FEARED
   path abilities — "◈ ABILITY — Dreadfield: The room feels you before you
   speak. Alien-terror starts at 2." / War-table / Oathbound /
   Shieldbearer — then "Grace Schulz walks out of the light alone, which
   is how she walked in. The village endures. That was always the story."
   The chooser's read (feared standing 100) matches the lived run: a
   wave-3-fighting, contest-surviving, might-heavy build. The door choice
   is coherent with the build, not arbitrary.

2. **The re-offer re-prices live** (belongfeast-armed-s66): sit at d43
   ("◈ THE TABLE WAITS — 'Ninety days...'"), re-offer later — the second
   door record shows beloved 88→100 and defiant moving, the chooser
   re-reading the run's earned state rather than replaying the first
   sitting's read. Canon's "paths re-price live at re-offer time" held.

3. **The deferral window still costs** (belongfeast-armed-s22,
   deferred-died): sat d60, "THE TABLE WAITS", then the village bleeds
   through the window — "👥 Jorge walks out with Sigrun. 'Nobody walks
   alone today.'" (d61), two more such beats (d68, d69), village-lost d85
   before the d90 re-offer. Same #310 lame-duck cost as the wintrace run —
   arm-independent, unchanged by the chooser.

## Wall numbers

PATHSELECT sweep (this run's substrate, 16+16):
- national: 5/16 control, 5/16 armed (leadfeast 5/8 both; belongfeast 0/8 both)
- table: 8/16 both
- wins: 7/16 both (all lesser-seat feared-path)
- wave 4–5 unlocks: 8/16 both
- median survival: 90d both (60d per-seed matched non-win both)
- exiled: none this run (0/32)

## Findings filed

- #311 updated → killed (this run): chooser works; door variety needs build composition + table-side pricing, not door choice.
- New finding: FEARED STRENGTH SATURATION (steve-call) — feared's strength formula caps at 100 on every feast-road run; beloved ties at 100 but loses the tie-break; relay needs sysbond no policy builds. The table's own pricing closes the door variety. Design question: rescale the strength formulas, or is 'the feast road is a feared road' the honest design?
