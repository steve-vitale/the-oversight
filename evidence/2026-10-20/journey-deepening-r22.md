# Journey leg: DEEPENING (days 40–80) R22 — atom-hold regression + reachability re-measure on the new tip — 2026-10-20

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sim; r19 proof re-runs were pre-existing regression checks, noted in Infrastructure)

- **Leg**: deepening (days 40–80). Rotation index **2** (deepening). The file said 2 at run start (r21's note observed the same — the file is authoritative; writing 2→3 at end).
- **Question** (r22):
  (a) REGRESSION HOLD: the r19 pantry atom conservation (expedition/HAUL meat ceiling chunking, unknown-flesh merge honesty, tribute via depositPantryPieces) — does it still hold on the new tip? Five sibling commits touched hierarchy.js/villager-agency.js/villager-mapmem.js/villager-objectives.js since r19 (incl. Steve's 10-19 phone-candidate merge), and substrate drift was reported today (sim-belonghunger-b's R2 corpus pin stopped reproducing after rebase onto 8e33dde78). Proof tests re-run on the tip (pre-pilot); live-run deposit-hook audit across the pilot seeds.
  (b) REACHABILITY RE-MEASURE (pilot-scale, MEASUREMENT §9): contact-conditioned wave-3 unlock on 4 fresh competent seeds on the new tip — does the r21 finding (6/8, conditioned bar met with margin) survive the drift? Pilot-scale; if nothing interesting, document and move on.
  (c) PEOPLE: ≥10 transcripts sense-read, 0 senseless bar. Dialogue REPORT-ONLY — engine is the social loop's lane (r19/r20/r21 handover): NO dialogue code changes.
  (d) VILLAGE ASSESSMENT: census in plain words.
- **Binding metrics**:
  - R1 (atom, PRIMARY): r19 proof tests GREEN on the tip + per-seed `expeditionMeat.atomViolations` empty AND `pantry.maxPieceKcal <= 500`.
  - R2 (reachability, report-only): among competent seeds with ≥3 distinct wave-2 types faced, ≥2/4 unlock wave 3 by day 80.
  - M1 (mood): 'lonely' <20% across audits (day-100 + final-day).
  - M4 (people): ≥10 transcripts sense-read, 0 senseless.
  - M5 (winnable): ≥3/4 pilot seeds alive at end; 0 death-honesty mislabels.
- **Interesting-finding bar**: atom leak observed live (any violation or maxPiece>500); unlock before day 40; ≥8 types faced with 0 kills; new transcript defect cluster; regional+/scale mechanics not yet seen in this leg.
- **Seeds**: fresh 9501–9504, competent PINNED policy, W3TRACE=1, DAYCAP=100, death-aware stop (+10d tail max). PROBE_W3 OFF (natural unlocks).
- **Canon read**: CANON.md + MONSTER-WAVES.md wave-3 section (2026-10-20; b4906574d wave-4/5 readiness recalibration noted — scale-leg territory, not this leg's gate). No new canon.
- **RACE GUARDS**: (1) wave pacing/encounter scheduling = flesh-out territory — OBSERVE, no pacing lever. (2) dialogue engine = social loop's lane — report-only, no dialogue code changes. (3) the kills-only wave-3 gate = Steve's design — measured, never moved. (4) telemetry baseline: per-seed-normalized sums (r20 lesson: n-swings are artifacts).
- **Telemetry**: per-seed JSONs to evidence/2026-10-20/ (journey-deepening-r22-competent-95xx.json); telemetry-check vs deepening.json baseline, per-seed-normalized.

## Infrastructure (fail-loud record)
- Lock: ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/playtest-loop.lock — NO prior lock (clean start, run_id 2026-10-20T00:43:38Z).
- Main tree: `git status --short` EMPTY at start. Disk 21%.
- Worktree: `journey-deepening` registered (run_id-matched to lock), base = master e7bfc346c (no stale branch — rev-parse matched).
- Standing heartbeat loop started (every 10 min, 20 iterations) — registry heartbeat never stale. **Service restart mid-run (~00:55Z, uptime "up 1 min")**: killed the heartbeat loop AFTER the pilot completed (PILOT-EXIT:0, all 4 seeds done) — same silent-death class as r21's two incidents. Recovered: heartbeat loop restarted immediately, registry heartbeat re-verified fresh.
- R19 proof re-runs on the tip (PRE-pilot regression checks): test-expedition-atom-r19.js ALL GREEN (4/4), test-tribute-atom-r19.js ALL GREEN (4/4). Both pass on e7bfc346c despite 5 sibling commits touching the same 4 game files.
- Bearer-redaction blank: proof test scripts/test-bearer-redaction-r22.js written → RED (7 failures) → fix applied (src/data/build-notes.json 3 lines + docs/TABLE.md 1 line, byte-verified) → GREEN 7/7.

## What ran
- Harness: `scripts/journey-deepening-r22-20261020.js` = the r21 harness with 2026-10-19→2026-10-20 / r21→r22 label substitution only (28-line diff, all label/date tokens; `node --check` clean). Carries the r21-fixed attribution semantics + atom deposit-hook and final-pantry-scan instruments unchanged.
- Pilot: 4 seeds × 100d, competent pinned, W3TRACE=1, PROBE_W3 off. Run log: evidence/2026-10-20/journey-deepening-r22-run.log. Infra note: the first background launch died at 16ms (exit 1) because `evidence/2026-10-20/` didn't exist yet when bash opened the redirect target — relaunched after creating the dir; the second launch is running.

## Verdicts on the binding metrics
- **R1 atom hold — GO.** r19 proof tests GREEN on the tip (pre-pilot: expedition 4/4, tribute 4/4 — despite 5 sibling commits touching the same 4 game files + Steve's phone-candidate merge). Live-run: `expeditionMeat.atomViolations` = 0 on all 4 seeds, `pantry.maxPieceKcal` = 500 exactly (cap, not over). The pantry granularity law holds on the new tip.
- **R2 contact-conditioned reachability — NO-GO (1/4 vs ≥2/4 bar).** Unlocks: 9501@d77 ✓, 9502@d95, 9503@d96, 9504@d83. All 4 seeds faced ≥3 wave-2 types (6/4/8/7) and all unlocked by d96; all survived to d102. Miss shapes (what the conditioned metric was built to separate): 9502 = LATE CONTACT (wave-2 first contact d59 — the r20 contact-variance story); 9503 = SCORING LAG (contact d28, 8 types faced, 6 ledger points scored but the 4th landed only at d96); 9504 = NEAR-MISS (contact d39, unlock d83 — 3 days past the window edge). Combined corpus (r21+r22): 7/12 unlock by day 80. Whether the tip shift (r21 median ~60 → r22 median ~89) is substrate drift or seed noise needs a paired re-run — named for r23. No pacing lever taken (flesh-out territory); the gate is Steve's design, untouched.
- **M1 mood holding — GO (2/37 = 5.4%).** Hank 9502 (trust 90, 12 task memories/10d — worked straight through, honest) and Hudson 9504 (trust 90, social need 100, ZERO memories of any kind in 10d — honest, not Nina-class: no company days, no rumors). The rumor-targeting driver from r21 did not reproduce on these two; both lonely reads are sense-verified honest.
- **M4 people — GO (12 transcripts sense-read: 7 meaningful / 5 borderline / 0 senseless).** See People check.
- **M5 winnable — GO.** 4/4 villages alive at end (day 102). 0 death-honesty mislabels — including one poetic-but-honest cause ("stripes resolving out of the bamboo, watching you" = the tiger's UNKNOWN descriptor; the village genuinely doesn't know what a tiger is — fog-of-war working as designed, not a mislabel).

## Village assessments (plain words)
- **9501 (7→7, survived d102, wave 3 @d77, regional, 3 links):** the in-window unlocker. 6 wave-2 types faced; 2 player wave-3 fights vs Spool (both 121-round stalemates — the starve counter works but resolves via a 121-round timeout; documented blank). 15 deaths, combat-heavy. Jada's taken-sister arc (seek_taken → promised) is the leg's best long want.
- **9502 (12→12, survived d102, wave 3 @d95, regional, 2 links):** the late-contact seed. Wave-2 contact didn't start until d59, so the 4 ledger points couldn't arrive before d80. 10 deaths. Hank's favor (food hands) carried across conversations but the competent policy walked away twice — an unfired beat by player choice, not a defect.
- **9503 (9→9, survived d102, wave 3 @d96, regional, 2 links):** the apex seed. Contact d28, 8 types faced, 6 ledger points scored — INCLUDING A MODERATOR KILL (first apex kill across the r20+r21+r22 corpora, 16 seeds; it scored its ledger point). The 4th point landed at d96. 20 deaths (heaviest: 12 combat + starvation + dehydration). Christian's hunger arc (d45 gossip → d60 commit → d80 still hungry) is coherent need-driven continuity.
- **9504 (8→8, survived d102, wave 3 @d83, regional, 2 links):** the trick-fight seed. 10 villager wave-3 field fights, 8 with tricks, 7 hold-the-line beats — the village fights smart. But vKill=0 across all 10: villagers can hold the line and flee, never land the killing blow on wave-3 in the field. 13 deaths. Hudson's grief for Tomas + hunger want in one conversation (d80) is the people-check standout.

## People check (SENSE-TESTING LAW — 12 full transcripts; REPORT-ONLY, dialogue lane is the social loop's; NO dialogue code touched)
- **7 MEANINGFUL / 5 BORDERLINE / 0 SENSELESS.**
- Meaningful: Jada 9501-d45 (seek_taken: taken sister Adriana, pods dreams — KIN-canon-grounded want, resolution=promised); Stan 9502-d45 (curious: sizing up the village — short, characterful, coherent); Christian 9503-d45 (gossip + owe, anger exchange is real); Christian 9503-d60 (favor resolves: "I won't forget who fed me when it mattered"); Christian 9503-d80 (hunger persists → re-commit; need-driven continuity); Hudson 9504-d60 (food favor → owe); Hudson 9504-d80 (hunger want + Tomas grief in one conversation).
- Borderline: Jada 9501-d60 (want carries 15 days — good — but the teach chain fires 3× verbatim template); Jada 9501-d80 (curious opener is real; then dlg:more/dlg:react filler marches the stage with no content exchanged); Hank 9502-d60/d80 + Hudson 9504-d45 (policy walked away — 1-turn transcripts, nothing to judge).
- **NEW defect cluster (handover to the social loop):** gossip-template name-swap collision WITHIN one conversation (9503-d45: "that stray dog — the one that bit two people — lets Quinn touch it." then two turns later "lets Lucas touch it." — the same unique gossip with a different name; both can't be true). This is r21's grief-pool recycling class applied to gossip, but worse: it contradicts itself inside one conversation.
- **Confirmed persisting clusters (r19/r20/r21 handover, NOT fixed here):** grief-pool verbatim recycling (9504-d80: the exact 4-line Tomas set — "X is gone and the world just... continues." / "I keep turning over the last thing X said to me." / "Nobody says X's name right yet." / "I'm picking up X's share of the work."); teach-template verbatim ×3 (9501-d60, 9503-d60, 9504-d60: "You show them {plant} — where it grows, how to tell it apart." + pool reaction); dlg:more filler / stage advances on empty content (9501-d80, 9504-d80: "That's... pretty much all of it, honestly." / "That's the whole of it. Sorry."); opener quoting a thread memory that is itself a teach template (9503-d45).

## Blanks filled (1)
1. **Bearer-redaction corruption in player-facing copy — FIXED.** The content pipeline redacts the word after "bearer"/"Bearer" on the write path ("bearer <X>" → "bearer <redacted>"), and the 2026-10-16 journey-succession r10 write shipped it into LIVE player-facing copy: src/data/build-notes.json (title-screen "📰 What's new", 3 lines) and docs/TABLE.md (canon, 1 line). Repaired with byte-verified reconstructions: "every Bearer who bore the mantle in order", "if your Bearer dies holding a stone knife in hand and a stone knife in the pack", "When your Bearer dies, the village brings them home now", "the villager learns plants the Bearer knows via". Proof test scripts/test-bearer-redaction-r22.js: RED 7 failures before → GREEN 7/7 after. Live game code (src/) is clean — the "<redacted>" sightings in game.js comments are DISPLAY-path redactions only (grep for the literal string: 0 hits; byte-verified).

## Blanks documented
1. **Spool starve-counter resolves via 121-round timeout** (9501: 2 fights, Spool, 121 rounds each, player unharmed, monster fled at full HP). The trick works (feed it waits → replay is silence → no damage) but the "correct" counter play is a 121-round staring contest. MONSTER-WAVES.md's "a third [quiet turn] and it flees" has no matching code (sigW3b.js has no flee logic; the trick text says "Feed it nothing" = neuter the replay, not flee). Canon-vs-code gap + pacing wart; monster behavior is flesh-out territory — documented, not levered.
2. **Villagers can't kill wave-3 in the field** (9504: 10 field fights, 8 tricks, 7 hold-lines, vKill=0, vDie=0, 7 vFlee). The village holds the line and disengages; only the scholar's TB kills score wave-3. Whether wave-3 should be player-gated this hard is a design question — the §14c rule (scholar survives while the village dies around them) applies in reverse here.
3. **The apex is killable and scores** (9503: moderator killed, 1 ledger point). Breaks r20/r21's "apex stays decorative" finding (16-seed corpus). The gate never needed the apex (bar 4, soft targets suffice) — but Steve should know the apex is no longer decorative.
4. **R2 miss decomposition** (see Verdicts): late contact (9502@d59), scoring lag (9503), near-miss (9504@d83). The day-80 window edge question (r21 blank #4) sharpens: 9504 did everything right and missed by 3 days. Whether the window edge matters is still Steve's design call.
5. **Old-script bearer corruptions** (comments/labels only, dead diagnostics): ~28 scripts under scripts/ carry literal "<redacted>" in comments and dead template strings (diag-succession-r22/r23/r24, journey-relay-sense-20261011, journey-succession-r*, test-*.js labels). The journey-establishment-r15..r18 harnesses contain INTENTIONAL detectors (`indexOf('<redacted>') >= 0`) — those stay. The dead-script labels are unrecoverable with certainty (lost word varies: "leads"/"knows"/names/"=") — documented, not mechanically "fixed" (a blind sed would write nonsense). 109 files repo-wide contain the literal string; all but build-notes.json + TABLE.md are evidence/ history (left untouched) or dead tooling.

## Metric review (§14)
- **R1's atom regression check worked**: the r19 proof tests + the harness's live deposit-hook and final-pantry-scan instruments together make a solid hold-check. Propose keeping it as the r23 pre-flight (cheap: 2 proof tests, ~6s).
- **R2's conditioned bar fired as designed — and MISSED honestly.** The miss-shape decomposition (late contact / scoring lag / near-miss) is exactly what the conditioned metric was built to separate. No mid-run re-score: the bar was ≥2/4, the result 1/4, recorded NO-GO. Metric-review proposal for r23: add a contact-timing qualifier to the conditioned set (contact before day 45?) or pre-register a paired old-tip/new-tip comparison to separate drift from noise.
- **M1**: the two trust-90 lonely reads were both sense-verified honest (no company, no rumors) — the instrument is honest; the Nina-class stays a watch item (not reproduced in 12 seeds).
- **The bearer-redaction lesson needs a scope amendment**: the 2026-10-13 AGENTS.md entry covers verifying YOUR writes, but historical write-path corruption is ALREADY LIVE in player-facing files (build-notes.json shipped 2026-10-16/18). Any loop touching build-notes.json or docs should byte-scan for literal "<redacted>" — the r22 proof test now guards the surface going forward.

## Telemetry deviation check
`telemetry-check.js` vs deepening.json (w3fights, engagedW3, fightsByWave.3, fightsTotal), 4 seeds: **two LOUD lines — EXPLAINED, not a bug, no baseline roll.**
- `w3fights` and `fightsByWave.3` swung -75% (baseline 8 → current 2, n=4). Per-seed: 2.0 → 0.5. Explained by the R2 finding: late unlocks (d77/d95/d96/d83) compress the post-unlock fight window (7–25 days; 9502/9503 had 6–7 days). Wave-3 engagement is healthy on the villager side (9504: 10 field fights, 8 with tricks, 7 hold-lines). The deviation is the unlock-timing shift, not a content regression. Baseline NOT rolled.

## Reachable / fun / winnable (deepening leg)
- **Reachable:** MIXED — wave 3 unlocks on 4/4 seeds by day 96 (7/12 by day 80 across r21+r22), all without kill-farming; the conditioned bar missed on timing, not on possibility. The moderator kill proves even the apex is reachable.
- **Fun:** 9504 is the leg at its best — 10 villager trick fights with hold-the-line beats; 9501's Spool stalemates show the counters working (but tedious at 121 rounds). Transcripts carry real owes and cross-conversation memory (Jada's pods, Christian's hunger, Hudson's grief).
- **Winnable:** 4/4 survive to day 102. The roster price (10–20 deaths/seed, combat-heavy) remains the leg's real constraint.

## Design notes for Steve (his calls, not levers)
1. **R2 missed on the conditioned bar (1/4 by day 80; 4/4 by day 96).** Miss shapes: late contact (d59), scoring lag, 3-day near-miss. The gate holds for competent play, but the day-80 window edge keeps biting seeds that did everything right. The kills-only gate itself is untouched (your design).
2. **The apex is killable now** (moderator, 9503, scored its ledger point) — first in 16 seeds. The gate never needed it, but "apex stays decorative" no longer holds.
3. **Spool's starve counter works but takes 121 rounds** — the correct play is a staring contest; canon's "third quiet turn flees" isn't in the code.
4. **Villagers hold the line vs wave-3 but never land the killing blow** (10 field fights, 0 vKills) — wave-3 is scholar-gated in practice.
5. **Bearer-redaction corruption was live in your title-screen build notes** — fixed this run ("every Bearer who bore the mantle", etc.). The pipeline eats the word after "bearer" on writes; the r22 proof test guards the surface going forward.
6. **No pacing lever taken** (flesh-out territory), **no dialogue changes** (social loop's lane), **gate untouched** (your design).

## Files
- Run note: evidence/2026-10-20/journey-deepening-r22.md (this file)
- Harness: scripts/journey-deepening-r22-20261020.js
- Per-seed JSONs: evidence/2026-10-20/journey-deepening-r22-competent-95{01..04}.json
- Transcripts: evidence/2026-10-20/journey-deepening-r22-transcript-competent-*.txt
- Run log: evidence/2026-10-20/journey-deepening-r22-run.log
