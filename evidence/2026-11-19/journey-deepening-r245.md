# journey-deepening r245 — growth-line cooled call (2026-11-19/20)

- **Leg:** deepening (days 40–80; DAYCAP 100). **Run:** `playtest-20261120T0145Z`, Lane A r245. **Base master:** `904545499`. **Policy:** competent + MUSTER POLICY (r227 + r236 + r237 F1/F2 + r238 stand-down) + MARCH STEP (r228), unchanged.
- **Seeds:** panel 105031–105038, probe 105039 (fresh band; nearest 105021–105029 r244, 105101).
- **Fix:** `src/js/titans.js` only (57 insertions, 3 deletions). **Proof:** `scripts/test-titan-growthline-cooled-call-20261120.js` — RED 21/28 on unfixed code, GREEN 28/28 on fixed.
- **Commits on `journey-deepening`:** `c28c3e24f` (fix + proof + prereg + memo), `570e7d6ef` (driver/analyzer/proof forks, band 105031–105039).

## The defect (r244, seed 105024 day 86)

The dawn growth line promised 2 allied blades ("enough. Sound the call.") and the call sounded that morning harvested 0 — a contest death after dawn killed a committed Haven blade after the line spoke. The line is computed inside `endDay` (the last dawn beat); the harness runs `driveContests` before the first upkeep, and a real player has the same exposure plus everything they do before tapping the call. A mechanism memo (`evidence/2026-11-19/journey-deepening-r245-growthline-memo.md`) pinned the ordering and the Haven blade; the allied 2 blades stayed unpinned at micro level (trust collapse and turn ruled out; candidates: free adults dying/leaving or a link dropping out). The Haven clause has the same hole.

## The fix

1. `soundTitanCall` re-computes `titanMusterGrowth` fresh before sounding. If a line promised allied blades (`muster._growthPromisedAllied > 0`) and the fresh allied gain is 0, it does NOT sound — it says the cooled line instead, re-arms `_growthSaid` to the fresh harvestable, clears the promise, returns null. Cooled line: "📯 The fires have cooled since dawn — the growth the dawn promised is gone. No new blades answer." + muster standing + ("Haven still has N volunteer(s) free to march — the commit sends them." if fresh havenGain > 0). No ritual, no trust −8, no per-link refusal lines.
2. The call clears `_growthPromisedAllied` with the existing post-call `_growthSaid` re-arm.
3. `titanMusterGrowthLine` stores `_growthPromisedAllied` when it speaks, and rewords: prefix "📯 The fires have warmed since the call — at dawn, " and enough-clause "— enough, if the morning holds. Sound the call". Parsed number phrases unchanged.

Decisions: move-the-line-to-wake-up was considered and REJECTED — the memo proved the pool moves after wake-up too (driveContests), so moving it only shrinks the window; re-validation at the act is the load-bearing part. The driver is deliberately NOT gated on the fresh projection — a competent player who hears the line sounds the call, and the cooled path is the instrument. Same-seed re-panel NOT taken (r244 found probe seeds are not bitwise reproducible across processes; fresh band judges the absolute bar).

## Q1 (primary) — GO

**Q1-GROWTH-LINE PANEL: poolDays=6 lineDays=5 badLines=0 repeatLines=0 growthCalls=5 harvestMismatch=0 havenMismatch=0 beyondHorizon=0 cooledDays=0 cooledCalls=0 → GROWTH-LINE-GO.** Zero bad growth lines panel-wide; every growth call harvested exactly. All 5 wild lines named only Haven growth (1 volunteer each); all 5 calls' commits sent exactly that volunteer (105032 d76/d86, 105033 d90, 105038 d80/d83). Wild line text now reads: "📯 The fires have warmed since the call — at dawn, Haven has 1 volunteer free to march — the commit sends them. The muster would stand at 9 of the 10 THE HERALD demands. Still short — but the gap is closing." The "enough, if the morning holds" clause never fired in the wild (no line reached enough); it is proven at unit level (C4). **The cooled path did not fire in the wild** (0 cooled days/calls) — cooling needs a contest death between dawn and the call, rare (r244: 1 in 8 seeds); the cooled path stands on the 28/28 unit proof. A silent empty call after a growth line would still be NO-GO (analyzer case 95).

- Stand-down probe: **GO twice** — pilot run day 59 (9 blades, released, 0 stranded), full-panel re-run day 67 (9 blades, released, 0 stranded). March-gap panel: STANDDOWN-GO (2 stood down, 2 released, 0 stranded days).
- F8 wild: UNMEASURED (0 hits panel-wide — the confide line never fired).

## Q2 (descriptive, NO bar) — coalition reach

**reached10=4 stuck79=6.** 105031 (max 14, readyDay 97), 105032 (max 11, 13 days one-short, readyDay 88), 105035 (max 10, readyDay 65), 105037 (max 11, readyDay 94) reached 10 at some point, but `ready=false` at end on all four — reaching 10 does not stick (musters stand down when the titan leaves, or blades die). 105036 stuck at 9 for 43 of 44 watch days (the long stuck-at-9 shape again); 105034 max 7, never ready; 105038 max 5; 105033 max 8. Design call already with the build arm; third re-measure on an unchanged gate, reported not judged.

## Q3 (descriptive) — trick pipeline

w4fights=28, w4kills=9 (same as r244), **w4killsKnown=2** (r244: 0) vs unknown=7. 15 slain wave-3+ types with no counter. Top stall flows (8/8 seeds). Knowledge is still not the binding constraint.

## Q4 — people check: PASS

- 105032 day 60, Albina (Russian speaker, trust 93): a no-shared-language sitting. She asks real questions (are you the boss? where do people sleep? how many days? do you have food?), the options engage (listen, nod, point, watch quietly), ends warm ("This was good."). The four nonverbal options repeat every turn — a light filler-loop shape, but her lines vary and advance.
- 105032 day 80, Modhi (florist, trust 100, want curious): tests trust ("Can I trust you? I mean really."), then teaches field knowledge (Wood Sorrel, Okra), closes "I can't sit still anymore. But this was good." Want resolves stage 3 engaged. Sensical, characterful, no fabricated history.
- Small blank: Modhi's closing line renders twice verbatim (closing line + first winddown line) — cosmetic duplication, noted not fixed this run.

## Q5 — census

- Survival 8/8 to day 100–101 (all endReason=survived), same as r244. Pop at end 5–11.
- Wave-4 kills 9 (1.125/seed, same as r244). Wave 5 unlocked 3/8 (105031 d98, 105035 d99, 105038 d79); faced 2/3 (105031 1 fight, 105038 3 fights, 3 distinct monsters); **wave-5 kills 0**. 105038 fought wave-5 monsters in parties of 1–2 and survived all 3 without a kill (deathsW5=0).
- Player deaths 22 (11 wild) vs r244 24 (14 wild) — slightly down.
- Ladder stage 3 at day 80 on all 8 seeds; no seed reached the full seat.
- Trust: TRUST-EARNED-ONLY on all 8, strangerGains=0 everywhere — the r244 single trust-paid-to-stranger instance did not recur. 105038 had 8 trust-bearer deaths (9 gainers, all known).

## Reachable / fun / winnable

- **Reachable: yes.** The wave-5 door opened on 3/8 villages and was faced on 2/3; the growth line spoke in the wild on 3 seeds and every call harvested exactly.
- **Fun: yes, improving.** Conversations are sensical and characterful; the muster voice is honest now (dawn numbers framed as dawn numbers, cooled calls narrated instead of empty rituals).
- **Winnable: closer, not there.** Wave-5 monsters are faced and survived but never killed; the deed gate has not opened on this band (ladder stage 3 at d80 everywhere). The binding wall remains the wave-5 kill and the deed gate opening.

## Watches

- Growth-line regression watch: 0 bad lines (was 1 in r244). F8 wild: 0 bad hits (UNMEASURED). Scholar deaths 22 vs r244 24. Survival 8/8. Ladder stage 3 at d80. Wave-3 wild Reunion: no hits recorded. Herald gorge: none. FIGHTALLY2 party sizes: wave-5 fights at party 1–2 (105038) — small parties survive but cannot kill. F2 re-arm: REARMED 1, NO-NEED 1 in the pilot; full-panel F2 counts in the analyzer output. March latency: no stranded days. Trust-paid-to-stranger: 0 instances (r244: 1).
- Telemetry: **quiet** (8 files, 4 metrics, no large deviations vs the r192 baseline; no baseline roll).

## Metric review

- Q1 bar held as pre-registered (0 bad lines; every growth call harvests exact or cools honestly). The cooled exemption worked as designed at unit level; in the wild it never fired, so the wild verdict rests on the 5 honest harvests. No re-scoring mid-run.
- Q2/Q3 descriptive as pre-registered; no verdicts taken on them.
- The analyzer's Haven-leg skip for cooled entries (dawn Haven promise superseded by the cooled line's fresh count) is new logic this run, covered by analyzer-test cases 93–96 (95/95 total).

## Fork proof (all green)

- Growthline proof 28/28 (RED 21/28 verified on unfixed code). Analyzer test 95/95 (91 carried + 4 new cooled cases). Muster proof 41/41. March proof 11/11.

## Infrastructure (fail loud)

- **Host write flap UP ~02:19–02:58Z (~39 min, host-wide).** Registry heartbeats failed every attempt from 02:19Z (last success 02:18:29Z, ~40 min stale at worst); sibling runs also failing. A `git checkout` during the flap truncated `src/js/titans.js` to 0 bytes — restored from the main-tree HEAD copy on restore-loop attempt 13 at 02:58:42Z (111,743 bytes, `git diff` empty), fix re-applied, RED re-run valid. Nothing else lost (proof test, prereg, memo all verified at full size).
- **Registry flock queue:** the heartbeat script blocks on the registry flock while Loop B registrations hold it (a `worktree-register.sh` holds the flock across its whole slow worktree add, ~5–11 min). My heartbeat waited ~7 min behind one. Not a deadlock — a queue. Heartbeat landed 03:11Z and 03:18Z.
- **safe-commit index clobber struck twice** (after both commits): new files staged-as-deleted + `MM` on the edited file. Repaired both times with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`; verified `git status` empty + `git diff HEAD` empty + hash-object matches HEAD per file. Commits themselves were always correct.
- AGENTS.md (worktree copy) read before further work, per the runtime prompt.

## Status at closeout of this occurrence — ADOPTION HANDOFF

- **Panel complete, Q1 GO, telemetry quiet, people check PASS.** The fix + proof + forks are committed on `journey-deepening` (`c28c3e24f`, `570e7d6ef`).
- **Gate (`node scripts/check.js --quick`) was STARTED in the background at ~03:37Z and had NOT finished when this occurrence ended.** It is the only remaining verification before landing.
- **NOT merged.** The merge, worktree release, rotation write (2→3), lock deletion, and the executive report are for the adoption run: wait for the gate result (session `proc_407b3664e5f7` in this run's context, or re-run the gate fresh), verify 0 attributable failures, then `git merge --ff-only journey-deepening` in the main tree (rebase first if a sibling landed), release the worktree, write rotation 2→3 with read-back, delete the lock in the same call as reading it (run_id `playtest-20261120T0145Z`), and report "merged locally, pending ship".
- Run note + this evidence are committed below; the per-seed JSONs/transcripts live in `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-19/` (not in the repo).
