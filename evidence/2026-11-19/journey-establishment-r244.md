# Journey — establishment leg, run r244 (2026-11-19 14:45 CST)

## Run identity
- Run: `lane-a-20261119T204500Z`, r244. Leg: **establishment** (days 14–40, 42-day horizon, death-aware tail +10d).
- Rotation read `1` (establishment). r243 merged but never advanced the rotation — this run's closeout writes **1→2 with read-back**.
- Lock: `playtest-loop.lock`, run_id `2026-11-19T20:45:00Z`, claimed at run start (no prior lock).
- Worktree: `~/workspace/worktrees/journey-establishment`, branch `journey-establishment`, base master `68b1f6370` (journey-social-life r239).
- Prereg: `evidence/2026-11-19/journey-establishment-r244-prereg.md` (commit `0690a3c82`).

## Pre-flight and infra
- Main tree clean at pre-flight except one stray untracked 152-byte sibling check log (`evidence/2026-11-19/check-quick-round-1830.log`), moved aside preserved to goal hidden_files as `check-quick-round-1830.log.stray`; no process held it open (the live check.js process writes to the adoption worktree's copy). Disk 50%. `git pull` already up to date.
- r243 closeout verified: its closeout commit `e1f002065` IS on master; branch/worktree released; only the rotation write was left dangling (fixed by this run).
- Registry registration took 504s (registry-lock pile-up; the reap took 469s the same way). Heartbeat loop running on a 9-min cadence (script `journey-establishment-hbloop-r244.sh`).
- **VM replacement ~21:40Z killed the first gate run** (uptime 1 min; gate died at 31/344 scripts; heartbeat loop PID 26960 died with the machine). Recovered per the standing rule: heartbeat re-established first (21:44:57Z), hbloop restarted (PID 2590), write probe OK, lock intact, gate re-run from scratch. The killed partial log is kept as `journey-establishment-r244-gate-killed-2140Z.log`.
- Check for other jest before the gate: none running. No sibling jest collided with the re-run.

## Base delta vs the r243 panel base `e1b6cc7d6`
- Landing r148 moderator-mute guard (`conversation.js`) + link-accept rotation by pool index (`bond-initiation.js`, `LINK_ACCEPT_ROTATION`) — behavior-adjacent to Q1/Q5, proofed 61/61 + 3/3.
- Endgame r249 doubled-'The' narration fix (`game.js`); sim-bowcraft-a BOWCRAFT fix (`villager-build.js`, env-gated `BOWCRAFT=1`, driver does NOT set it — no panel effect by construction); deepening r244 F8 confide-line secret gate (`favor-outing.js`); version bump.
- No `convo-wants.js` or want-raise-floor change.

## Seed bands
- Pre-fix panel: **101901–101905**, verified FRESH (zero hits in all-date journey/sim preregs, all `*prereg.md`, evidence filenames, hidden_files names, `git log --all --grep=10190`, `git log --grep=101901`). Contaminated list now includes 101801–101805 (r243).
- Confirmation re-panel: **108001–108005**, verified FRESH (word-boundary greps clean; the sim-nighttravel git-log hits for "10800" are the five-digit range 10800–10991, a different number space). Rejected as contaminated: 102001–102008, 102101, 102201, 102301, 103001, 103101, 103201, 104001, 104101.

## Driver / analyzer changes (this run)
- Driver `scripts/journey-establishment-r244-20261119.js`: adds read-only `counterLines` capture scanning already-captured say lines.
- Analyzer `scripts/analyze-journey-establishment-r244-20261119.js`: END qualifying-only denominator; STRANDED distinct-days denominator; counter watch with finding rule: label contains `", "` or `" — "` or length >45.
- Fork proof PASSED on the r243 corpus (durable copy in goal hidden_files `r244-analyzer-proof/`, logs `r243-baseline.log` + `r244-fork.log`): re-run r243 baseline reproduces the committed r243 analyzer log exactly; r244 fork reproduces every old-bar number exactly; only END 11/11 (was printed 11/12) and STRANDED 11/11 days (was printed 11/13) move; COUNTER line 0 on old corpus (no `counterLines` field).
- Proof tests re-run on the new base, all green (log in goal hidden_files `r244-proof/proof-batch.log`): walkHome 27/27, settled-help 19/19, stage0-help 13/13, stage0-cant 18/18, mood-goodbye 10/10, spotter 35/35, want-raise 7/7, clearhome 37/37, want-bridge ALL GREEN, link-accept 61/61, link-accept rotation ALL CHECKS PASS, maps-pools ALL GREEN.
- Pilot gate PASS on both pilots (seed 101901: endDay 43, 11 alive, wave 3, standing 50, pantry 68220; 67/67 verbal sits carry pick wantIds; Q1 trace 67/67; standingEnd 50, scholarDawns 42, teleTypeCounts 53 keys, mootLines 2, caseLog 42, rosterDepartures present, sittingCloses 2, transcript written. Seed 108001: 15 counter lines, 0 prose-clause labels).

## The counter-label finding and fix (LANDED this run)
- Finding: the r246 guard (`monsterCounterLabel` returns `'something'` only when `monsterNoun` falls back to `'something'`) misses the comma-clause class: `monsterNoun` truncates at the first comma but the label returned the RAW display name. Pre-fix panel: **111 COUNTER LEARNED lines, 7 rule-flagged prose-clause labels** — 5 real comma-clause (belltoad ×3, dustboar ×1, rut_king ×1) + 2 long-noun-phrase rule artifacts (speedbump_turtle 48 chars, nevermore 46 chars, no comma). Probe with proper harness setup (`K.load` + `K.newRun`, `systemArrived=false`): **38 of 72 defs** are comma-carriers with non-`'something'` noun; 8 `'something'`-fallback defs unchanged (living_wire + memory_projector, ducks_in_a_row, understudy, landlord, heckler, paparazzo, chorus_line).
- Fix (commit `89dfc848d`): in `monsterCounterLabel` (`src/js/game.js`, ~line 23553), after the `'something'` branch: if the display name contains a comma, return `monsterNoun(mid)` (the truncated head); else the display name. Comment updated in place. All five render sites use `monsterCounterLabel`, so one change covers them. Long noun phrases without commas keep the display name, per `monsterNoun`'s own judgment.
- Proof test (new): `scripts/test-journey-establishment-r244-counter-label-20261119.js` — RED first (belltoad label was `"a toad like a war drum, throat swelling"`), now **19 pass, 0 fail**. r246 test updated in the same commit (design changed on purpose, per repo AGENTS.md): its §3 now allows label===noun when the display name carries a comma and pins 38 comma-changed; now **10 pass, 0 fail**. `game.js` syntax OK.
- Safe-commit index clobber struck on both commits (staged-deleted + `MM` manifestations); repaired each time with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified status empty, `git diff HEAD` empty, hash-object == HEAD blob per file.

## Pre-registered bars — verdicts

| Bar | Pre-fix panel (101901–101905) | Re-panel (108001–108005) |
|---|---|---|
| Q1 favorless-ask rate <20%, 0 stage-0-deflected, every sit classified | **3/61 = 4.9%, GO**; classes E1 2, C 1; stage-0-surfaced 1/3; LOST 2 | **0/60 favorless, GO; LOST 0** (second clean read; fix does not touch Q1 machinery) |
| Q1b want-raise ≥10%, no zero-raise seed | **61/346 = 17.6%, GO**; per-seed 13/67, 5/68, 19/78, 12/67, 12/66; thinnest 7.4% (101902), fattest 24.4% (101903) | **60/335 = 17.9%, GO**; per-seed 12/66, 12/72, 17/71, 10/72, 9/54; thinnest 13.9% (108004), fattest 23.9% (108003) |
| Q2 0 cuts | **0/10 CUT, GO** (1 engine-ended with closing beats) | **0/10 CUT, GO** |
| Q3 distinct lines | 1/10, report-only | 0, report-only |
| Q5 exiles heard | **7 exiles, all moot, HEARD 7, PRESENT 0, UNHEARD 0, same-day 0** — answered | **3 exiles, all moot, HEARD 3, UNHEARD 0** — answered |
| Q6 bumps/wedges/commits (no F4 shape) | 33/95/4, 19/70/4, 45/96/2, 70/70/5, 23/68/4 | 50/72/4, 68/74/3, 64/75/4, 68/74/3, 38/58/4 |
| SPOTTER | 48, 5/5 GO | 64, 5/5 |
| LADDER | 4/5 | 4/5 |
| FASTER-ID | 5/5 (105/190) | 5/5 (239/288) |
| CODEX lines | 152 | 120 |
| END (qualifying-only denominator) | **8/8 GO** | **13/13 GO** |
| STRANDED (distinct-days denominator) | 0 (no-opportunity) | 0 |
| THREAD | 1/1 | — |
| TRAVEL | 0/0 | — |
| TRUST | 0 (hard drop-only) | 0 |
| JAM | 0 | — |
| VILLAGE ≥3/5 alive at d40 | **5/5** | **5/5** |
| COUNTER LEARNED | 111 lines, **7 rule-flagged** (5 real comma-clause + 2 long-noun artifacts) | 90 lines, **1 rule-flagged** — `"a heron that isn't quite there when you look at it"` (white_noise_heron, 108002 d7), flagged only by the length>45 rule; no comma |
| Wave / standing | Wave 3 on all 5; standing 50/25/40/25/50 (max 50); **wave-4 0/5** (r242: 3/5, r243: 0/5) | **Wave 4 reached 2/5** (108002 standing 120, 108003 standing 100) — first wave-4 on this leg since r242 |
| Scholar deaths (F2 watch) | **4/5 — INVESTIGATE (≥3 rule), third straight panel ≥3** (r242: 6, r243: 3) | 2/5 (Blanca d31 the wild; Domingo d39 the wild) |

## Q1 LOST asks — the two defect findings (pre-fix panel only)
Both are class E1 (opener never ran, dlg:help NO). Documented here for the conversation build arm; NOT landed.

1. **101902 d2 — a broad-frame person (`gen_3xnzl5d`), need forage_help/u2, openThread 'request', resumedOnce FALSE.** The sit ran 12 picks, all stage 0 — goon / confront / teach / skill_learn / trade / joke. The favor opener never ran, so the ask never got a hearing. The villager sat again d22 but only ever raised 'curious' — the need was never voiced in 41 days. This villager later became the scholar (Gladys, d24) after Vivian's contest death.
2. **101903 d20 — Dieter (`gen_mxbtu7d`), need forage_help/u2, openThread 'lately', resumedOnce TRUE.** New variant vs r243's resumedOnce-false E1s: the thread WAS resumed, but the sitting was consumed by the betrayal case thread (case_10: accept, investigate, moot, letlie, vote_guilty) + goon + more — dlg:help never pressed, the opener never got its turn. Dieter sat 6 more times (d25–d41) and only ever raised 'curious'. The need never surfaced.

Mechanism note for the build arm: E1 now has two faces — never-resumed (101902) and resumed-but-case-captured (Dieter). A villager with a real need who keeps sitting with the scholar and never once gets to ask is the harm the widened LOST trigger names.

The third favorless sit (101905 d16 Joshua, class C) surfaced later and is NOT lost.

## Q5 exiles — heard
- Pre-fix: 7 exiles (Vasyl, Temitope, Owen, Yara + 3 more), all moot, HEARD 7 via case-thread-held proxy sits despite 0 lines naming them — same instrument definition as r243's Aria. PRESENT 0, UNHEARD 0, same-day 0.
- Re-panel: 3 exiles on d32 (Sean, Henry, Tom — all case_10, exile), HEARD 3 via the same proxy (case-thread-held sits d14–d31 + present at exile-day moot, 3 lines each).

## Counter watch — adjudication
- Pre-fix: 111 COUNTER LEARNED lines; 7 rule-flagged (5 real comma-clause + 2 long-noun artifacts). The fix landed on the evidence of those 5.
- Re-panel: 90 lines; 1 rule-flagged — the white_noise_heron line, flagged only by the length>45 rule; it is a long noun phrase, not a clause (`monsterNoun` judges it a noun phrase), so the mechanism-grounded comma-clause count is **0** — the fix eliminated the real class. The pre-registered rule over-flags long noun phrases (see metric review: propose comma-only for the next run). Do NOT re-score mid-run.
- Re-panel pilot (108001): 15 counter lines, 0 prose-clause labels (pre-fix pilot: 2/26).

## F2 scholar-death watch (third panel ≥3)
- Pre-fix: 4/5. Vivian d23 (contest), Aria d28 (the wild), Greta d38 (the night), Hattie d23 (contest). All last dawn at (4,4), atHaven=true, insideHaven=false.
- **Contest-death variant (new):** Vivian and Hattie were the ORIGINAL scholars (startCensus scholar on both seeds) and both died in a contest on day 23 — two seeds, same day. Contests are unavoidable by canon, but a day-23 contest killing the starting scholar twice asks whether the early contest is survivable by a competent player. For the contest / goals arm; propose nothing to land unilaterally.
- Re-panel: 2/5 (Blanca d31 the wild; Domingo d39 the wild). **Domingo's last dawn was (4,4) atHaven=true, insideHaven=TRUE** — the first scholar death with insideHaven=true; he started the day inside and died in the wild the same day. This weakens the pure succession-placement story (a villager starting inside the haven is not safe from a wild death that day).
- Combined r244: 6 scholar deaths in 10 seeds (contest 2, wild 3, night 1). F2 stays a named open item for the goals arm.

## Senseexped launch watch
No party-launch signal in the telemetry type-count maps on either panel (fourth panel silent). Companion-kill beats still fire (pre-fix 2 on 101901 + 1 on 101905; re-panel 1/2/3/1/0) — kills happen, launches don't register as a signal. counter_discovered 15–26/seed (pre-fix), 15–23/seed (re-panel).

## Census, in plain words (Q4)
**Pre-fix panel (101901–101905): 60 people started, 48 alive at day 40.** Eight villagers died (four of them scholars) and seven were exiled; three arrived, so the arithmetic is 60 − 15 + 3 = 48. The healthiest village (101905) lost nobody in 40 days but sits on the thinnest pantry (4,489 kcal — food, not death, is its pressure). The hardest-hit village (101903) lost seven people and its scholar twice (Aria in the wild d28, Greta in the night d38), yet still stood at day 40 with 8 alive. Every village reached wave 3 and none reached wave 4 — standing topped out at 50, well short of the wave-4 door (which opens at standing 100, as the re-panel shows). Pantries ranged 4,489–68,220 kcal. Villagers knew things: spotter 48, codex 152 lines — the knowledge economy is running. What was missing: no wave-4 kills, no party launches, and two villagers (the broad-frame person, Dieter) who sat with the scholar for weeks carrying a real need and never got to ask.

**Re-panel (108001–108005): 60 started, 48 alive at day 40** — the same count, by a different road: nine deaths (two scholars) and three exiles, no arrivals. Two villages broke through to wave 4 (108002 standing 120, 108003 standing 100) — the first wave-4 on this leg since r242 — and 108003 did it while losing three people to exile. Pantries 9,100–96,115 kcal. The scholar deaths were both in the wild, including Domingo, who started his last day inside the haven.

## People check (SENSE-TESTING LAW)
Read 2 held convos in full from one panel seed (101902, richest: exiles + LOST + scholar deaths).

- **Ashley (community gardener):** opens mid-thought about being watched by the sky — "I'd rather be boring to the sky. Boring things…" — then asks a real question ("What do you make of all this? Really.") and pushes back on the scholar's bleak answer. Coherent, characterful, ends "Don't be a stranger." PASS. One dry beat serves again: "The moment passes without landing. Not yet." — the r241 dry beat, recorded for the conversation build arm.
- **Sawsan (florist):** opens on a plant lesson (Purslane found where the scholar said); accepts an invite ("Alright. But I'm not carrying your stuff."); answers a personal question with real homesickness — "I wonder if Cairo, Egypt misses me. Stupid. Places don't miss people. ...Do they?" — and ends with a plan forming. Coherent, warm. PASS.

No acceptance echoes (expect 0; found 0). Both sittings have a villager who wants something, options that engage it, and an ending that resolves or plants. **People check: PASS.**

## Metric review (for the NEXT run)
- END qualifying-only denominator and STRANDED distinct-days denominator: PROVEN — fork proof reproduces every old-bar number exactly; only the two intended numbers move (END 11/11 was 11/12; STRANDED 11/11 days was 11/13). Keep both.
- Counter rule length clause: the length>45 clause fires false positives on long noun phrases (speedbump_turtle 48 chars, nevermore 46 chars pre-fix; white_noise_heron re-panel). Propose **comma-only** for the next run (drop the length clause); the comma class is the mechanism-grounded one.
- F5 want-raise floor: thinnest 7.4% (pre-fix, 101902) vs 13.9% (re-panel, 108004) — absent on both bands, shape not closed. r243 CLOSED it on its band at 10.3% thinnest. The floor question stays open for the build arm; no change proposed this run.
- Q1 E1 residual: 2 LOST on the pre-fix panel, 0 on the re-panel. The class is a build-arm item (opener never ran), now with the resumed-but-case-captured sub-shape documented above.
- F2: third panel ≥3 scholar deaths, plus the contest-death variant and the Domingo insideHaven=true counterexample. Goals-arm design call, unchanged.

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/establishment.json --current '<per-seed-evidence-glob>' --metrics guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths` — run on BOTH panels:
- LOUD: `guardrails.deaths disappeared: baseline 604 -> current 0`, `guardrails.popAlive disappeared: baseline 178 -> current 0`, `guardrails.pantryKcal disappeared: baseline 1210411 -> current 0` — identical on both panels. Same known schema mismatch as r240–r243 (driver never emits `guardrails.*`, checker reads 0). NOT a game change. Baseline NOT rolled.
- `c3.starvationDeaths`: quiet on both panels.

## Gate
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest` on the final tip (`89dfc848d`, with the counter fix): **339 passed, 5 failed in 677s**. The 5 are EXACTLY r243's standing set, 0 attributable to this run:
1. `test-measurement-proof-update.js` — stale balance-proof manifest.
2. `test-measurement-workflow.js` — retained neutrality proof stale.
3. `test-living-garden-deed-attainment.js` — 120s timeout.
4. `test-phone-frame-proof.js` — phone-frame receipt stale.
5. `test-one-person-army-deed-attainment.js` — 120s timeout.

Same 5 failed on r243's gate (base WITHOUT this run's fix); this run's change touches only `monsterCounterLabel`, which none of the five exercises. New counter tests are not on the 2026-10-14 green-list census, so the gate does not run them; they were verified directly (r244: 19/19, r246: 10/10).

## Reachable / fun / winnable
- **Reachable:** the establishment content is reachable — every village lived to wave 3, two re-panel villages reached wave 4 and standing 100–120. The favor-ask system works (61/346 and 60/335 raise rates); the counter-learned lines fire (111 and 90).
- **Fun:** the people check passes — villagers ask real questions and remember things (Sawsan's Cairo, Ashley's sky). The two LOST asks and the dry beat are the blemishes, both in the conversation build arm's court.
- **Winnable:** not yet on this leg's evidence — no village took the full seat; the winnability chain still stops at the wave-4 kill and standing bars. Two villages reaching wave 4 is the first progress on that front since r242.

## Blanks filled / open items
- **Filled (landed):** the counter-label comma-clause class — fix `89dfc848d`, proofed 19/19 + r246 10/10, confirmed 0 real comma-clause labels on the re-panel.
- **Documented, proposed, not landed:** Q1 LOST asks (2, E1 mechanism, two sub-shapes) → conversation build arm. F2 scholar deaths (third panel ≥3; contest variant; Domingo counterexample) → goals arm. F5 want-raise floor → build arm. Senseexped launch silence (4 panels) → sim lane. Counter em-dash descriptors (e.g. voice_mimic_radio "crying in the dark — a voice you almost recognize") as a possible next-watch item, same fix shape, not yet fired on any panel.
- Standing design questions unchanged: gating recalibration proposal, answercourt cost, richer layered medicine design, family 7 UNMEASURED, landing r145 F1/F2.

## Closeout
- Evidence + run note committed via safe-commit (see closeout below).
- Merge: `git merge --ff-only journey-establishment` in the main tree.
- Release: `bash scripts/worktree-release.sh journey-establishment merged`, then `git worktree remove --force` + `git branch -d journey-establishment`, then `bash scripts/worktree-reap.sh`.
- Rotation: 1→2 with read-back.
- Lock: delete in the SAME exec call as its read, only if the run_id matches `2026-11-19T20:45:00Z`.
- Heartbeat loop: kill at closeout.
- **Do NOT bump, push, or verify live** — the ship loop owns that. Report "merged locally, pending ship".
