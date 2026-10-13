# Standing bar tuning sweep (2026-10-13) — MEASUREMENT ONLY

Commit under test: e7c18b85 (Standing bar: war +25/pt, diplomacy +34/link,
plenty +20/feast; T4=100, T5=200; win floor d90). No game-code changes in
this run — analysis scripts + evidence only.

Suite: seeds 11/22/33/44/55/66/77/88 x competent/winseek/belongseek/
leadcourt = 32 runs, 150d death-aware, gates off. Daily sampling of
villageStanding() + unlockedWave() with first-crossing detection.
Proof: scripts/test-standing-tune-20261013.js 25/25 green.

## The four numbers

**(a) Wave-4 organic unlock rate (day80+): 5/14 = 0.357 — IN TARGET (0.30–0.50).**
7/32 overall (adds 2 unlocks on runs that died d63/d76).

**(b) Earliest T4 day: 57 (median 57) — 3 days under the ~60 target.**
All 6 diplomacy unlocks cluster at d57–d60: 3 links seasoned at the 30-day
seasoning mark after ~d27 proposals. The timing is the link system's
seasoning clock, not village-achievement variance.

**(c) Drivers: war 1, diplomacy 6, plenty 0, hybrid 0 (among unlocks).**
- Diplomacy: 6/6 leadcourt unlocks, all [w0 l3 f0] — 3 seasoned links = 102.
- War: 1 (competent s22, d125, 4 distinct w3 kill pts = 100).
- Plenty: 0 unlocks anywhere. Max observed: 1 major feast/run (br20).
  Feasts contribute to hybrids (winseek 34+20=54; belongseek 25+34=59)
  but never drive alone — major feasts barely happen in base policies.
- Genuine hybrids form below threshold: 1 link + 1 feast (54), 1 kill pt +
  1 link (59). The hybrid mechanism works; nothing reached 100 that way.

**(d) Unlocks before day 45: none.** No speedrun smell.

Wall numbers: national 0/32, table 0/32, won 0/32, wave5ever 0,
median survival 71d, exiled 0/32. (Suite died early — median 71d — so
national never staged; consistent with the r1–r3 wall suite, not a
Standing regression.)

## Per-policy notes

- competent (8): 1 unlock (s22 d125, war). s44 survived 150d with standing 0
  — the survival policy never courts and never kills wave-3.
- winseek (8): 0 unlocks, all died d15–d64. Standing 0–54.
- belongseek (8): 0 unlocks. Max 59 (1 kill pt + 1 link). Never reached
  3 seasoned links in this suite.
- leadcourt (8): 6 unlocks (d57–d60), all diplomacy. s11 reached 2 links
  (68) then died d80; s55 died d38.

## Recommendation to the coordinator (no game-code changes made)

1. **Unlock rate is in target; accept earliest-T4 d57.** The 60-day target
   was approximate ("~day 60"). Any threshold move to chase 3 days breaks
   the clean pure-path table (4 kills | 3 links | 5 feasts = 100); e.g.
   t4=105 would demand 5 kill pts for the war path. The binding
   anti-speedrun guarantees (day-90 win floor, w1–5 fought bars) hold
   regardless of a d57 wave-4 arrival. Do not churn weights for 3 days.
2. **Path imbalance is a systems gap, not a weights gap.** Plenty can't be
   fixed by reweighting when major feasts don't happen (max 1/run) — that's
   feast-frequency design/policy work. War is gated by combat capability
   (r18: villager wave-3 kills 0/16, scholar-only in practice) — the
   already-queued villager combat competence work. Leave the weights;
   let the systems work move the paths.
3. **Wave 5 (T5=200) is untested** — 0 unlocks, max end standing 102.
   Needs a future confirm on long-surviving high-standing courtship runs.
4. If the d57-vs-60 gap ever matters, the honest lever is link
   seasoning/proposal timing, not Standing — out of scope for this arm.

## Files

- scripts/sweep-standing-tune-20261013.js — the sweep (exports pure
  helpers for the proof)
- scripts/test-standing-tune-20261013.js — 25/25 green
- evidence/2026-10-13/sim-standing-tune.json — 32 per-run rows with
  crossing days, drivers, trajectories
- evidence/2026-10-13/sim-standing-tune.md — this file
