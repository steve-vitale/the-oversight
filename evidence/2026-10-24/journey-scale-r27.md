# journey-scale r27 — wild check of the r39 dedup gate (2026-10-24, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261024T044349Z. Rotation read 3 → leg 3 SCALE (days 80–140); wrote 3→0.
**Base:** master@84d390816 (pulled at run start; moved since r26's f91a0ddf4: deepening r39's `_sdNextAct` dedup gate 85e42a22a + flesh-out landings).
**Driver:** `scripts/journey-scale-r27-20261024.js` (r26 driver + day-attributed `beatWatch` for the two BIGGER-STAGE beat classes + `sdState` snapshot + `_scalePtrW4/_scalePtrW5` flags). **Analyzer:** `scripts/analyze-scale-r27-20261024.js`.
**Pre-register:** `hidden_files/evidence/2026-10-24/journey-scale-r27-prereg.md` (written before any sim).

## Pre-registered leg question
At the moved tip, does the r39 `_sdNextAct` dedup gate hold in the wild — no double "next act / BIGGER STAGE" pitch (Beat 4 + `_sdNextAct` within ≤2 game-days), and the ladder doesn't stall?

## Verdicts (binding — none re-scored)

- **D1 dedup: GO.** 0/4 seeds fired both beats within ≤2 game-days. 82004 fired Beat 4 alone at d25 (both its lines day-attributed); `_sdNextAct` never fired on any seed. Absent-with-cause per seed: 82001 (maxWave 3, regional by ~d29 — Beat 4's one-fire window never opened); 82002 (maxWave 2, died d33 — wave 3 never landed); 82003 (maxWave 4, regional by d43 — one-fire gate never held); 82004 (Beat 4 fired d25; the new gate + d30 floor + regional gate all agree on `_sdNextAct`'s silence). Caveat (metric review): under the leadcourt policy the region forms by ~d30, so the new gate line itself was never the binding suppressor in the wild — the r39 unit proof (5/5, re-run green this run) remains the gate's load-bearing evidence; this run proves no double-pitch and no stall.
- **L1 stay-green: GO (2/4).** National at d92 (82004) and d95 (82003). 82001 stayed regional to d151; 82002 scattered d33.
- **L2 moment: GO (2/2).** "Four fires. One head. GOVERNANCE LAYER: online — polity tribute routing, the court calendar, famine reserves. You built a realm." + "The shared granary opens: 5,000 kcal for every fire of the realm, no strings... and remember who fed them first. (Trust +10 with each.)" — sense-read on both national seeds; the transition lands as a felt moment with named villages and trust consequences.
- **L3 approach honesty: GO.**
  - 82004 (global d93, seat lesser): pellet taken mid-game → reactor beat named the miss → mantle passed through bearer deaths → successor earned the food-thesis deeds → "The table is being set — a lesser seat, priced for what you built" + Arc IV (THE INEFFICIENCY: "the thing they laughed at — needing to EAT — is the engine"). The full designed arc replayed end to end, same shape as r26's 81004.
  - 82003 (national d95, wiped d134, seat none): pellet bearer — the REACTOR beat fired ("NO HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD BE... The mantle may pass to hungrier hands"); the seat-waiting beat correctly stood down. No silence, no contradiction.
  - 82001 (regional, seat none): not national — L3's waiting clause N/A by design (lesser bar needs the food-thesis deeds; 18 contests but foodDeeds=false → no seat, the food-thesis gate working as Steve designed it).
- **L4 people: GO (5/5 sense-read, 0 senseless).** Ludmila (82004-d120): the honest no-shared-Spanish beat — mime, single caught words ('clavo', 'Sí'), ends where language couldn't reach. Cheyenne (82004-d60): seek_taken stage 1 — pod dreams (KIN.md), the player commits "I'll ask the System about the pods" → "Even asking is more than the silence" — a planted obligation, then teaches Nightlight. Yudi (82003-d120): "You eat first. No — don't argue. I already ate. (I hadn't.)" + 7 varied food-philosophy lines, no verbatim repeats — not the r36/r38 fortune-cookie loop. Miles (82001-d60): "I desperately need [a laugh]" → real laugh → grief surfacing ("a laugh I keep hearing in my head — not anyone here, just from before") → "Walk with me?" plants a thread. Miles (82001-d120): the want re-asserted after a deflection ("I'd like to learn something I can use today") — owes, doesn't resolve; thinnest of the five but coherent.
- **L5 survival: GO.** 82001 alive 8/8 at d151 (pantry positive); 82004 alive 7/7 at d150; 82002 honest scatter d33 (bearer died in combat d27 → "Haven's pantry is empty. Day 3 of hunger." → "people started walking — in different directions. The scattering, again."); 82003 honest combat wipe d131–134 at national (8 bearer combat deaths, voiced).

## Interesting findings

- **The Beat-4 window is razor-thin under leadcourt:** on 82004 the first link formed the same day Beat 4 fired (d25) — the one-fire eligibility lasted a single daily tick. The gate's designed keep-case (wave 3 lands while the daily tick runs before any unlock check) is real but rare on this policy; a curiosity/link-seeking policy (proposed in r39's note) would widen it.
- **Lesser seat without national, again:** 82001's regional-only run confirms r26's datum — the bar is regional+, and the food-thesis deeds are the binding constraint (18 contests weren't enough without them).
- **"experiment" deaths** (82002: 2 villagers) = the food-testing mechanic — villagers tasting unknown foods per Steve's 2026-10-16 design (unrevealed flesh tried like other unrevealed foods, usual raw/unrevealed risk). Honest, by design.

## Blanks / observations (documented, not fixed — non-critical per speed-over-polish)

1. **Driver-choice artifacts (not content bugs):** the engage-first picker spammed `dlg:more` ×7 on Yudi and picked `leave` on Miles's "Walk with me?" — the content on both sides is coherent; the driver's picker doesn't engage wants. Same class r26 documented.
2. No src/js blank found this run — the gate held, the ladder fired, the seat arc replayed. Tooling-only run.

## Metric review

- No metric re-scored mid-run. All binding metrics GO.
- **Telemetry check:** 2 LOUD lines (`nationalFirstDay disappeared: baseline 616 → 0`, `maxGameDay disappeared: baseline 1278 → 0`) — SAME artifact r25/r26 documented: `scale-lead.json` keys come from an older instrument's corpus aggregates and don't map to this driver's per-seed census shape (`census.nationalDay`, `census.day`). Manual comparison: national 92/95 vs r26's 77/86/92 (same band, seed variance); survival 2 alive + 1 scatter + 1 wipe vs r26's 3 alive + 1 wipe (82002's early cascade is an honest collapse, not a regression signature). Baseline NOT rolled.
- **D1 caveat carried forward:** the wild run can't prove the new gate line is load-bearing (unit test does); future runs on a slower-courting policy could.

## Reachable / fun / winnable (scale leg)

- **Reachable:** national ≤d95 on 2/4 competent lead-road seeds; the lesser seat opens with full voicing on the global road (82004) and the reactor/mantle arc replays (82003).
- **Fun:** Arc IV's food-thesis payoff ("Recalculating. Recalculating.") still lands; the granary-opening beat makes the realm feel like a polity, not a threshold.
- **Winnable:** the table approach opens on competent play (1 lesser seat this run; 3 in r26). The win itself remains lane B's leg.

## Evidence

`evidence/2026-10-24/journey-scale-r27-lead/` — 4 census JSONs, captures, beats/moments/table dumps, 11 transcripts, run log. Driver + analyzer + this note under `scripts/` / `evidence/`.

## Ops

- Rotation: `journey-rotation-a.txt` → 0 (3→0).
- Commit: tooling + evidence only, zero src/js changes. No [needs-eyes] — no player-facing change.
- Proofs re-green at this tip: `test-scalediscovery-nextact-dedup-20261023.js` 5/5, `test-seat-waiting-honesty-20261023.js` ALL GREEN (A–E).
- Infra notes: (1) Overlapping launches: the first full-run launch (pre-dump-name-fix driver) was misdiagnosed as OOM-killed mid-seed-1 — it was actually healthy (the "partial" capture on disk was the smoke test's; stdout was buffered). The relaunch overlapped it; both wrote the same EVIDIR. Because the sim is deterministic per seed, the two processes produced byte-identical dumps — verified with cmp on all overlapping files, then the 12 misnamed r26-scheme duplicates were deleted. Evidence set is coherent: one complete r27-named file per seed. Lesson: check `ps` for the actual node command line (not just a name grep) before declaring a sim dead, and never launch a second writer to the same EVIDIR. (2) Driver file-name bug caught pre-completion (r26-named dump files from the sed copy) — fixed; the duplicate-name fallout handled per (1). (3) Master did not move during the run.
