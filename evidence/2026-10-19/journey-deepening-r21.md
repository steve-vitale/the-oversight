# Journey leg: DEEPENING (days 40–80) R21 — contact-conditioned reachability + widened kill-source + mood hold — 2026-10-19

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any run)

- **Leg**: deepening (days 40–80). Rotation index **2** (deepening). Note: the r14 note claimed "rotation updated 2→3" but the file still said 2 at the start of this run — file is authoritative. Deepening re-played as r14–r20 today (each observed different systems); this run advances the r20 metric-review proposals (contact-conditioned metric, widened kill attribution) + r14's audit-at-final-day proposal. Rotation file updated 2→3 at end of run (verified by re-read).
- **Question** (adopted verbatim from r20 metric review + r14 proposals):
  (a) CONTACT-CONDITIONED wave-3 reachability — r20's raw metric conflated contact with the kill economy (competent 9304 faced 1 wave-2 type in 94 days, scored 0 kills). Pre-register unlock rate conditioned on contact: seeds with ≥3 distinct wave-2 types faced.
  (b) KILL-SOURCE attribution widened — r20 sampled 30 kills; the game keeps the full waveKillLog + waveKillByChannel counters (via.w+wave). Report the full-log split: player vs villager vs unattributed + channel counters. Who lands ledger points.
  (c) MOOD HOLDING continued — r13 6%, r14 11%, bar <20% on audits. r14's proposal (a): audit-at-final-day so short seeds count. Nina-class reads (trust≥80 + ≥6/10 company days yet 'lonely') → human sense-review, never auto-metriced.
  (d) PEOPLE check report-only — dialogue engine is the social loop's lane (r19/r20 handover): NO dialogue code changes. Track r20's handover clusters: mashed stage-0 openers, cross-conversation verbatim repeats.
- **Binding metrics**:
  - R1 (contact-conditioned, PRIMARY): among competent seeds with ≥3 distinct wave-2 types faced, ≥2/4 pilot-equivalent unlock wave 3 by day 80. Raw bar: ≥2/4. A conditioned miss = reachability finding for Steve (his gate, never levered here).
  - R2 (kill-source, report-only): full-log byPlayer/byVillager/byNull + byChannel. INTERESTING: an apex ledger kill (moderator / grief_counselor / performance_review).
  - M1 (mood holding): 'lonely' <20% across audits (day-100 + final-day). Nina-class reads flagged for human review.
  - M4 (people): ≥10 transcripts sense-read, 0 senseless (report-only).
  - M5 (winnable): ≥3/4 pilot seeds alive at end; 0 death-honesty mislabels.
- **Interesting-finding bar**: unlock before day 40; ≥8 types faced with 0 kills; apex ledger kill; Nina-class read; new transcript defect cluster.
- **Seeds**: fresh 9401–9404 competent pilot (expanded to 9405–9408 on GO-shaped signal). Competent PINNED policy (scripts/policies/competent.js), W3TRACE=1, DAYCAP=100, death-aware stop (+10d tail max).
- **Canon read**: CANON.md, MONSTER-WAVES.md (2026-10-19). No new canon.
- **RACE GUARDS**: (1) wave pacing/encounter scheduling is flesh-out-loop territory — this run OBSERVES contact scheduling, takes NO pacing lever. (2) dialogue engine is the social loop's lane — report-only, no dialogue code changes. (3) the kills-only wave-3 gate is Steve's design — measured, never moved. (4) telemetry baseline: interpret sums per-seed (r20 lesson: sum swings are seed-count artifacts).
- **Telemetry**: per-seed JSONs to evidence/2026-10-19/ (journey-deepening-r21-competent-940x.json); telemetry-check vs deepening.json baseline, per-seed-normalized.

## Infrastructure (fail-loud record)
- **VM reboot mid-run (~17:16Z, uptime showed "up 7 min")**: killed the expansion batch mid-seed-9406 (process gone, no error, no JSON — the same silent-death class as r20's ~13:16 incident) AND the standing heartbeat loop. Recovered: re-ran 9406–9408 cleanly (all completed), re-heartbeated the worktree immediately and restarted the detached heartbeat loop. Registry heartbeat verified fresh after restart.
- Lock file survived the reboot (lock is on disk, heartbeat is registry-side).

## What ran
- Harness: `scripts/journey-deepening-r21-20261019.js` (built by `scripts/build-r21-harness.js` from the r20 harness). Changes: (1) contact-conditioned unlock summary (`w3unlock` from ctx.waveLog: unlock day + w2 ledger points at unlock); (2) widened kill attribution — full waveKillLog + waveKillByChannel (via.w+wave) counters; (3) audit-at-final-day — moodAudit() fires at gd===100 AND at the final game day when gd=100 never fires (r14's missing-audit blank); (4) pre-reg header. PROBE_W3 env-gated OFF — natural unlocks.
- 8 seeds × 100d, competent pinned, W3TRACE=1. All work in worktree journey-deepening. **No game-code changes (measurement run).**
- 61 transcripts written (day45/60/80 corpus + showprobes); 11 sense-read (8 via subagent, 3 direct).
- Regressions: `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`: **96 passed, 0 failed** in 560s (clean; no new failures — measurement run, scripts-only changes).

## Verdicts on the binding metrics — ALL GO
- **R1 contact-conditioned — GO (6/8).** Unlocks by day 80: 9401@38, 9404@72, 9405@43, 9406@80, 9407@57, 9408@62 = 6/8. All 8 seeds faced ≥3 wave-2 types (5–12), so raw = conditioned = 6/8. The two misses: 9402 unlocked at day 86 (late — the late-unlock pattern) and 9403 died at day 74 (village-lost, never reached the window's end). The r20-conditioned bar is met with margin; the contact-conditioned metric fired as designed and the r20 contact story (9304: 1 type faced) did NOT reproduce — lowest contact this run was 9408's 5 types, which unlocked at day 62.
- **R2 kill-source — REPORTED.** Widened attribution works. Per seed (scholar's own TB killing blows via 'player' channel / companion TB blows / villager field paths): 9401: 7/1/11; 9402: 3/0/12; 9403: 5/0/5; 9404: 4/0/7; 9405: 9/0/7; 9406: 7/0/16; 9407: 6/0/13; 9408: 5/0/16. The scholar lands real kills in TB (competent fights when advantaged); villagers' field paths (wild/patrol/agency/aid-crisis) land the majority; companions almost never land the killing blow in TB under competent (1/8 seeds). **No apex ledger kill** (moderator / grief_counselor / performance_review: 0 across 8 seeds — the r20 apex-decorative finding holds).
- **M1 mood holding — GO (8/67 = 12%).** Audit-at-final-day fired on 9401 (d94) and 9403 (d74) — two audits r14's gd===100-only scheme would have missed. Lonely reads, all sense-verified honest: Carlota 9402 (trust 90, soc 100, ZERO company memories in 10d — honest, not Nina-class); Somchai 9404 (trust 76, 13 meals but 2 rumor_about_them — rumor-targeted); Jovan 9405 (trust 90, 1 meal/10d — honest); Boris 9405 (trust 90, 12 meals + 4 rumor_about_them — rumor-targeted); Lucas 9407 (trust 90, 12 meals + 2 rumor_about_them — rumor-targeted); Fatima 9405 (trust 21), Paul 9408 (trust 44), Sanne 9408 (trust 1). The rumor-targeting mechanic is the main lonely-driver at high trust — designed social system, not instrument bug. **The Nina-class did NOT reproduce** (no trust≥80 + ≥6/10 company days + no-rumors lonely read on any seed).
- **M4 people — GO (11 transcripts, 6 meaningful / 5 borderline / 0 senseless).** 8 sense-read via subagent (full report in /tmp/senseread-r21.txt), 3 direct. See People check.
- **M5 winnable — GO.** 7/8 villages alive at end (9403 village-lost d74: 13 deaths — combat 10, monster 1, alien 1, sickness 1 — the honest early-collapse cluster). 0 death-honesty mislabels.

## Village assessments (plain words)
- **9401 (9→9, survived d94, wave 3, regional):** the early unlock. Wave 3 at day 38 (5 ledger points); 3 player w3 fights; 9 distinct wave-2 types faced. Deaths combat-heavy (6 villager-combat + 11 combat). Steady.
- **9402 (9→9, survived d102, wave 3, regional):** the late bloomer. Faced 8 wave-2 types but unlocked only at day 86 — after the window. 0 player w3 fights (engagedW3=1). Carlota's honest lonely read. Combat deaths 17.
- **9403 (8→8, village-lost d74, wave 2):** the honest collapse. Faced 7 wave-2 types, never unlocked (needed 4 ledger points, died first). 13 deaths across 74 days. Death-aware stop behaved.
- **9404 (8→8, survived d102, wave 3, regional):** the contact-rich quiet one. 12 wave-2 types faced (widest), unlocked day 72, 0 player w3 fights (engagedW3=1). Somchai's rumor-targeted lonely read.
- **9405 (8→8, survived d102, wave 3, regional):** the Redactor seed. Unlocked day 43; 2 player w3 fights vs The Redactor (sig mechanics fired, both lost — competent disengages from hard fights honestly). 5 villager w3 trick fights (holdLine=5). Jovan/Boris lonely reads (honest / rumor-targeted).
- **9406 (8→8, survived d102, wave 3, regional):** the on-the-line unlock. Wave 3 at exactly day 80; 2 player w3 fights; 9 types faced; combat deaths 22 (heaviest roster price this run).
- **9407 (9→9, survived d102, wave 3, regional):** the trick-fight seed. Unlocked day 57; 2 player w3 fights; 7 villager w3 trick fights (holdLine=6, 1 villager death in a trick fight). Lucas's rumor-targeted lonely read.
- **9408 (8→8, survived d94, wave 3, regional):** the lean one. Only 5 wave-2 types faced (lowest contact) but unlocked day 62 — contact was enough. 1 player w3 fight. Starvation + dehydration deaths appear (2 non-combat) — the only seed with any.

## People check (SENSE-TESTING LAW — 11 full transcripts; REPORT-ONLY, dialogue lane is the social loop's; NO dialogue code touched)
- **6 MEANINGFUL / 5 BORDERLINE / 0 SENSELESS.**
- Meaningful standouts: Amara 9404-d60 (strongest — cross-conversation callback: "I tried the Blackberry like you showed me. Didn't poison anyone, so that's a win." — the day-45 teach paid off and the NPC remembers); Amara 9404-d45 (tight wound favor, disease-canon content); Heidi 9402-d45 (real owe: "I won't forget who fed me when it mattered."); Sarah 9403-d45 (seek_taken plants a real owe to the System); Constanza 9402-d80 (curious → grief for Heidi: "I'm picking up Heidi's share of the work. Someone should, and it might as well be me."); Ricardo 9404-d80 (just_company honestly served via teach beats).
- Borderline: Nia 9401-d60 (dlg:more filler chain after a real opener); Carlota 9402-d60 (want carries across conversations — good — but the mourning chain is pool recycling); Miles 9403-d60 (mashed ask:lately triple-fragment; verbatim Arturo grief pool); Elena 9401-d45 (mashed "Let's move." suffix opener; verbatim Ji grief pool); Riley 9401-d80 (stage-0 deflection — want never fires, resolution=unestablished).
- **Clusters (handover to the social loop, NOT fixed here):**
  1. Grief-pool verbatim recycling (4 transcripts): "X is gone and the world just... continues." / "Nobody says X's name right yet." / "I keep turning over the last thing X said to me." — identical lines with only the name swapped (Ray/Oliver/Arturo/Ji). A player talking to four grieving villagers reads the same lines four times.
  2. dlg:more filler loop / stage advances on empty content (4): "That's the whole of it. Sorry." / "I wish there was more to tell. That's it." while the want stage counter marches — the r19/r20 stage-0-deflection pattern persists.
  3. Teach-template verbatim (4): "You show them {plant} — where it grows, how to tell it apart. They nod slowly, committing it to memory. 'Good to know. Really good to know.'" — identical across Burdock, Yarrow ×2, Dandelion.
  4. Mashed fragment concatenation (3 spots): Miles's ask:lately triple-fragment; "Let's move." suffix tacked onto two unrelated openers (Elena's alone-time question, Amara's wound request).
  5. Recycled closings (3 pairs): "Take care of yourself." / "Steady as she goes. We'll talk again."

## Blanks filled (0 — measurement run)
No game-code changes. Two instrument fixes landed in the builder for future runs:
1. **byPlayer semantics corrected**: the r21 harness counted `by === 'p'` as the scholar's kills — but `by` is never literally 'p' (src/js/game.js:41391-41398: `_killerVid` defaults to the scholar's villagerId, `_killerVia` stays 'player' only when the scholar landed the blow). The correct reading is byChannel['player.w*'] = scholar's own killing blows. The builder now computes killByPlayer/killByVillager from channel prefixes. All r21 analysis used byChannel (correct); the byPlayer=0 in the JSONs is the superseded instrument.
2. **Pyrrhic-kill caveat documented**: waveKillLog ALSO includes pyrrhic kills (recordPyrrhicKill — lost TB fights where the beast died anyway; these do NOT score the ledger). The channel census is "kills the village made", a superset of ledger-scored kills.

## Blanks documented
1. **Unlocked-but-never-fought persists** (9402, 9404: wave 3 unlocked, engagedW3=1, 0 player w3 fights). Same class as r14's blank — gate green, encounter faucet is flesh-out territory; NOT levered (race guard).
2. **The wave-2→3 roster price**: unlock seeds lose 13–34 villagers, nearly all to combat (r20's finding, reproduced: 9406 lost 22). If wave 4's gate is kills-gated, the compounding cost deserves a look — the §14c rule exists because the scholar survives while the village dies around them.
3. **The apex stays decorative**: moderator/grief_counselor/performance_review faced but never killed on any of 8 seeds (r20: 4 seeds faced/0 killed). The gate is satisfiable on soft targets by design (bar 5→4, 2026-10-11) — a design call for Steve, not a lever.
4. **Late unlocks** (9402@86): a seed can do everything right on contact (8 types faced) and unlock after the deepening window closes. Whether the day-80 window edge matters is a design question — the leg's window is days 40–80 and the wave-3 gate is day 25 + 4 points.
5. **Batch fragility**: the second silent process death today (r20's ~13:16 incident + this run's ~17:16 VM reboot). Long sim batches die without a trace; the harness's per-seed JSONs + log tail make recovery cheap (re-run the missing seeds). Standing infra note, not a game bug.

## Metric review (§14)
- **R1's contact-conditioned metric worked as designed**: it cleanly separated the two miss shapes (9402's late unlock vs 9403's pre-window death) that the raw metric conflates. The r20 worry (contact variance hiding behind the gate) did not reproduce — every seed had ≥5 types faced. Propose keeping the conditioned metric for r22.
- **R2's full-log attribution**: the game's waveKillByChannel counters are the right instrument (game-designed, unsampled, correct semantics). The by==='p' instrument bug was caught by reading game code before interpreting — a reminder that harness instruments need code-level verification, not schema guesses. Propose: the r22 harness rebuilds from the FIXED builder (already patched).
- **M1's audit-at-final-day**: worked — 2 extra audits (d94, d74) that the gd===100-only scheme missed. The lonely reads were all sense-verified honest; the rumor-targeting mechanic is the main high-trust lonely driver. The Nina-class (embedded + company + no-rumors yet lonely) did NOT reproduce on 8 seeds — downgrade from "design question" to "watch item".
- **No mid-run re-scores**: all bars held as pre-registered.

## Telemetry deviation check
`telemetry-check.js` vs deepening.json (w3fights, engaged.w3, fightsByWave.3, fightsTotal), 8 seeds: **one LOUD line — EXPLAINED, not a bug, no baseline roll.**
- `fightsTotal` swung +84% (baseline 45 → current 83, n=8 files). Per-seed: 83/8 = 10.4 vs baseline 45/4 = 11.25 — inside seed noise (r20 competent: 13.2/seed; r20's own range 0–8 w3fights/seed). The swing is the n=8 vs n=4 sum artifact (same class as r20's three LOUD lines). Baseline NOT rolled.
- w3fights, engaged.w3, fightsByWave.3: quiet.

## Reachable / fun / winnable (deepening leg)
- **Reachable:** YES — wave 3 on 6/8 seeds by day 80 (7/8 by day 86), all without kill-farming; the eighth seed's miss was a pre-window village death, not gate difficulty. The contact-conditioned metric confirms the gate binds on kills, not contact, when contact exists.
- **Fun:** 9405 is the leg at its best — The Redactor's sig mechanics in real fights, 5 villager trick fights with hold-the-line beats. 9407's 7 trick fights (6 hold-line) show the village fighting smart. Transcripts carry real owes and cross-conversation memory (Amara's blackberry callback).
- **Winnable:** 7/8 survive; the one loss is the honest early-collapse cluster. The roster price (13–34 combat deaths per unlock seed) is the leg's real constraint, not the gate.

## Design notes for Steve (his calls, not levers)
1. **The kills-only gate holds for competent play** — 6/8 by day 80, 7/8 by day 86, no farming. The contact-conditioned metric is the right instrument going forward.
2. **The roster price is the actual wall** (r20's note, reproduced): unlock seeds lose 13–34 villagers to combat. If wave 4's gate is kills-gated, the compounding cost deserves his eyes.
3. **The apex is decorative** (reproduced): moderator/grief_counselor/performance_review faced, never killed, on 16 combined seeds. The gate doesn't need them — but whether the apex should stay unkillable is his call.
4. **Rumor-targeting is the main high-trust lonely driver** (new this run): trust-90 villagers read lonely when rumor_about_them memories pile up despite 12 shared meals/10d. The instrument is honest; whether the tuning is right is a feel question.
5. **No pacing lever taken** (flesh-out territory), **no dialogue changes** (social loop's lane), **gate untouched** (his design).

## Files
- Run note: evidence/2026-10-19/journey-deepening-r21.md (this file)
- Per-seed JSONs: evidence/2026-10-19/journey-deepening-r21-competent-940{1..8}.json
- Transcripts: evidence/2026-10-19/journey-deepening-r21-transcript-competent-*.txt (61 files: day45/60/80 corpus + showprobes)
- Harness: scripts/journey-deepening-r21-20261019.js (built by scripts/build-r21-harness.js — the builder carries the corrected attribution semantics)
- Run logs: evidence/2026-10-19/journey-deepening-r21-run-competent.log (pilot + expansion + 9406–9408 re-run after the reboot)
- Sense-read subagent report: /tmp/senseread-r21.txt (ephemeral; clusters summarized above)
