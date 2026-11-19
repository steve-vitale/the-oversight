# journey-deepening r244 — run note (2026-11-19)

- Run: r244, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100)
- Run id: playtest-loop-a-20261119T124738Z (scheduled Thu 2026-11-19 06:45 CST)
- Base: local master `e1f002065` (deepening r243 F2 fix + establishment r243 + crisis r247 adoption + social r238 adoption)
- Branch: `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening`
- Rotation read `2` (deepening); write `2→3` at closeout with read-back
- Policy: competent + MUSTER POLICY (r227 verbatim + r236 growth amendment + r237 F1/F2 + r238 stand-down) + MARCH STEP (r228 verbatim)
- Seeds: panel 105021–105028 (8 seeds); probe seed 105029 (dedicated, NOT scored in panel metrics — Q1-probe only). Band verified fresh: 0 hits in `evidence/*-prereg.md`, evidence filenames, and git log. Nearest named bands 105011–105019 (r243), 105101.

## Pre-registration (from `journey-deepening-r244-prereg.md`)

- **Q1 (primary): F8 fix + wild check.** Proof test GREEN (RED verified) = the gate holds at unit level. Wild bar: 0 occurrences of the confide line in sittings where no secret was shared. Any hit is read in full.
- **Q2 (secondary): coalition-reach.** Bar: ≥6/8 seeds reach 10 blades (allies + Haven). r243: 1/8 FAIL. A second FAIL with the same 9-blade shape confirms the wall on two fresh bands and sends the design call (more allies / more Haven / lower gate) to the build arm.
- **Q3 (new, descriptive — no bar): march-vs-gate.** r243's seed 105016 slew the Herald day 85 with 8 blades — under the 10-blade gate. Report every march fight with the blade count at fight time, split sub-gate (<10) vs at-gate (≥10), with outcomes.
- **Q4: people check.** Read 1–2 full transcripts from convo days 45/60/80; judge sense, not counts.
- **Q5: census + reachable / fun / winnable.**

## What changed in the game (F8 fix — the one src fix this run)

**F8 — "This stays between us, right? Right." closed a sitting where NOTHING was confided** (r238, Ellie 104806 d60, cautious exit pool, `src/data/characterGen.json:6497`). The line implies a confidence was shared; in that sitting none was.

- Fix (`src/js/conversation.js`, `endConvo` ~8496): filter that exact line out of the exit pool unless `c.secretShared` is true (set only when the villager volunteers a secret as the opener, conversation.js:3793). Data untouched. Defensive: filter only when the pool still holds >1 line after filtering, so a one-line pool can never empty.
- Proof: `scripts/test-convo-exit-secret-gate-20261119.js` — **9/9 GREEN** on the fixed build. RED verified on unfixed code (Case A fails: the line is pickable with no secret shared). Conversation-audit re-check: `test-convo-cycle-norepeat-20261014.js` 40/40 GREEN; `test-conversation-coherence.js` 92/0 GREEN.
- `git diff --stat` at closeout confirms the only src delta is `src/js/conversation.js` (the F8 filter).

## Tooling (r244 forks)

- Driver `scripts/journey-deepening-r244-20261119.js` (r243 fork: seed band, tag r244, probe 105029) + F8 wild instrument (wraps `Game.endConvo` in `runSeed`, records every confide-line close as `{day, vid, how, line, secretShared}` into `F8EXIT`).
- Analyzer `scripts/analyze-journey-deepening-r244-20261119.js` (r243 fork) + `summarizeF8` (F8-GO / F8-NO-GO / F8-UNMEASURED) + Q3 sub-gate blades on march fightRows (`blades` = unique ALLIED blades at fight start, Haven excluded per `titans.js:1551`; `haven` = last musterLog `after.haven` on/before fight day; `totalBlades = blades + haven`; `subGate = total < 10`).
- Proof tests forked from r243: muster 41/41, march 11/11, analyzer **91/91** (83 carried + 6 new: cases 85–87 Q3 sub-gate/at-gate/unknown, 88–90 F8 GO/NO-GO/UNMEASURED, 91–92 growth horizon).
- **Analyzer growth-line horizon fix (tooling correction, committed this run):** the pilot's growth-line NO-GO was a horizon artifact — seed 105021 heard the growth line on day 101 ("Haven has 1 volunteer free… muster would stand at 2 of 10"), but growthWatch ends day 100. The growth line is a `game.js` dawn voice (`titanMusterGrowthLine`, titans.js:1426, guarded by `titanMonsterPresent`); DAYCAP 100 plays days 1–100 and the day-101 dawn fires, then the harness stops before any policy upkeep runs, so no day-101 growthWatch/musterLog row can exist. Fix in `summarizeGrowth`: heard line days past the last growthWatch day are out of coverage — counted as `beyondHorizon`, excluded from bad/repeat and from `lineDays` (`heardLines` still counts them), and reported. A line day *inside* the watch span with no row is still bad (case 92 proves it). After the fix, pilot analyzer re-run: GROWTH-LINE-GO (poolDays=3, lineDays=3, badLines=0, repeatLines=0, growthCalls=3, harvests exact, beyondHorizon=1). Pilot seeds are scored (no driver change since pilot).

## Results — panel (8 seeds, all survived day 95–101, wave 4–5)

| Question | Verdict | Numbers |
|---|---|---|
| Q1 probe (primary) | **Q1-STANDDOWN-GO** | probe seed 105029: probe fired day 99 (13 blades: 10 allies + 3 Haven, ready), stood down same morning, released, strandedDays 0 |
| Q1 wild stand-down | **Q1-UNMEASURED** | stoodDown=0 in the wild (expected at ~1/16 rate; the probe carries the stand-down evidence) |
| Q2 coalition-reach | **FAIL (4/8, bar ≥6/8)** | reached10=4 (105022 d52, 105026 d90, 105027 d98, 105028 d60). Two villages sat one blade short 24–29 days (105023: 29d, longest run 15; 105024: 24d, longest run 15), both max 9. Two more never got close (105021 max 3, 105025 max 3 — Herald located late, firstWatchDay 95/80) |
| Q3 march-vs-gate | **answered: no sub-gate fight** | 4 march fights, ALL at-gate (11, 11, 11, 18 total blades), ALL slain 4/4. subGateOn=0. r243's "8 blades" was the allies-only count — with Haven counted that kill stood at 11 |
| F2 wild check | **F2-HAVE-GO** | joined=4, mismatch=0 |
| Q1 F8 wild | **F8-UNMEASURED** | hits=0 — the line never fired panel-wide; the proof test (9/9 GREEN, RED verified) carries the gate |
| Q1 growth line | **GROWTH-LINE-NO-GO** | poolDays=6, lineDays=7, heardLines=7, **badLines=1** (105024 day 86 — see below), repeatLines=0, growthCalls=7, harvests exact on both legs except the bad line, beyondHorizon=1 |
| F2 muster resets | **F2-REARM-GO** | resets=4, rearmed=0, stale=0 |
| Q1 refusal-heard | **REFUSAL-HEARD-GO** | refused=11, spoken=4, badDays=0, dedupeDays=3 |
| Q2 march | **MARCH-SLAIN** | marchDays=7, arrived=7, foughtOnMarch=4, slainOnMarch=4; ready→fight latency 1–2 days (was 11–19 days in r237) |
| Q1 titan | TITAN-MUSTER-MOVED | 8/8 seeds saw the titan, 128 titan-days, 53 verbs, slain=4 |
| Q1 wave 4 | 34 fights, 9 kills (1.125/seed) | banked2=1 (105028), unlockedW5=1 (105028, day 88, never faced). Scholar deaths 24, 14 wild (r243: 22/13) |
| Q1 trick pipeline | TRICK-PIPELINE-FINDING | 10 tricks taught panel-wide; 7 learned at 3+; all 9 wave-4 kills on unknown monsters; 14 slain wave-3+ types have no counter in their data |
| Q1 ladder | LADDER-OPENS + MINTS + HOLDS | opens=8/8, all five tracks minted on all seeds, holds=8/8, first stage day 14 on all seeds |

**Per-seed panel:** 105021 d101 survived w4 pop 3/3; 105022 d100 survived w4 pop 8/8 (march kill d53, 11 blades); 105023 d101 survived w4 pop 8/8 (stuck at 9); 105024 d100 survived w4 pop 4/4 (stuck at 9); 105025 d101 survived w4 pop 9/9; 105026 d100 survived w4 pop 10/10 (march kill d90, 11 blades); 105027 d101 survived w4 pop 9/9 (march kill d98, 11 blades); 105028 d95 survived **w5** pop 9/9 (march kill d61, 18 blades; wave-5 door opened d88, never faced a wave-5 fight by the harness stop).

## The growth-line NO-GO (105024 day 86) — a real defect, mechanism pinned

At dawn on day 86 the game said aloud: *"The fires have warmed since the call — The Hungry Road would send 2 more blades if the call were sounded again. The muster would stand at 11 of the 10 THE HERALD demands — enough. Sound the call."* The policy sounded the call that morning on that promise. **The call brought 0 blades.** The muster stood at 8 (6 allies + 2 Haven) before and after.

What happened, from the evidence:

- The dawn voice and the call read the same projection function (`titanMusterGrowth`, titans.js:677 — pure, no RNG), but at different points in the morning. The voice fires at `endDay` inside `Game.sleep()`, as the last dawn beat (game.js:34490, after `attemptWaitingOutings` — the r236 fix). The call sounds at the first upkeep of the new day (`musterPlay`, first in `policy.upkeep`). Between them, the rest of the sleep chunk's ticks run (`villagerTurn`, contests) — and the pool moved: at dawn the muster stood at 9 with 2 allied blades to harvest; by musterPlay it stood at 8 with 0 to harvest (a Haven blade left the muster and The Hungry Road's free adults dropped to 0).
- The re-call fired on the heard line alone. `musterDecision` (driver): `call = ... || !!s.growthHeard` — no check that the fresh projection still has anything to harvest. The commit, by contrast, WAS gated on the fresh projection in r236 pilot-2 (`commit` requires fresh `havenGain > 0`) — which is why the day-87 Haven line harvested exactly (1 blade, 2→3) while the day-86 allied line harvested 0.
- So this is the same class the r236 fix closed for the Haven clause (a promise the morning can't keep), now surfacing on the ALLIED clause through a different hole: not the outing drain, but the post-dawn ticks moving the pool between the voice and the call.

This is a GAME defect, not a driver defect: a real player hears "enough. Sound the call." and sounds the call and gets nothing — the game's own advice misleads. A driver-only gate (don't re-call when the fresh projection is 0) would hide the lie, not fix it; the line must not promise what the morning can't deliver. **Not built this run** — the fix needs a game-code design decision (where the line's promise is computed vs where the call acts), and it needs its own proof + re-panel. Carried to the build arm with the mechanism above. The bar stands as written: 1 bad line of 7 heard is a NO-GO.

The other 6 lines heard panel-wide were exact (harvests matched on both legs), and the day-101 beyond-horizon line is out of coverage, not bad.

## Q2 coalition — FAIL again, but the shape moved

4/8 reached 10 (bar ≥6/8), up from r243's 1/8. The two stuck villages are the same 9-blade shape as r243 (6 allies + 3 Haven, longest 15-day runs at one short) — the Haven cap of 3 is still the binding blade there. But the ceiling is not absolute anymore: 105026 reached 11 (8 allies + 3 Haven) and 105028 reached 18 (15 allies + 3 Haven). The design call (more allies / more Haven / lower gate) now goes to the build arm with **two panels of evidence** (r243 1/8, r244 4/8, same 9-blade shape on the stuck villages). Per the prereg, the metric stands as written; no mid-run re-scoring.

## Census (plain words)

Eight villages, all eight alive at day 100 (105028 stopped at day 95, alive at wave 5). Nobody scattered, nobody starved out. The villages are small by the end — 3 to 10 people left standing — and the scholar died 24 times across the panel, 14 of them out on the roads; the wild is still the most dangerous place in the game, but the villages themselves hold. The ladder opens on every seed (first stage day 14, all five tracks minting), bonds and teaching move, the Herald walks the roads for 128 titan-days across the panel. Four villages got their coalition to 10 and walked out and killed the Herald — every march fight on this panel was won. Two villages sat one blade short for weeks, watching the muster stand at 9. One village (105028) opened the wave-5 door on day 88 and never got to walk through it before the harness stopped. Wave-4 kills are up sharply (9 vs r243's 2) — the villages are learning to fight, even though every one of those kills came against a monster they had no counter for.

## People check (Q4) — PASS

Three full transcripts read:

- **Juan (105021, day 60, mason, gentle, trust 91, hungry):** speaks only Spanish, no shared words. He asks, through Valeria translating, "Do you have food? Anything?" — twice, and "Where does one sleep here?" and "Are you the boss?" Real wants surfacing through the language barrier. Ends warmly ("Come back anytime"). The repeated food question reads as him trying again to be understood, not a loop.
- **Daniyar (105021, day 80, paramedic, gentle, trust 12, cold):** speaks only Russian. He mimes "come with me" — an invitation the player can accept or decline — asks about food, about the days, about whether the player is the boss. The player tries his Russian; he laughs *with* the player and teaches a phrase. Ends "See you around." No fabricated history.
- **Leo (105024, day 84, trail crew lead, restless, trust 96, grieving):** his want is curious — he proposes linking with The Hungry Road ("We should link with them — we'd be stronger together"). The player declines ("Not them. Not now") and Leo takes it honestly: "The idea is set aside, not forgotten." Asked for more, he says plainly "That's... pretty much all of it, honestly" — an honest deflection, not filler. The closing fits the grief: "Talking helps. Then it hurts. Then it helps again. It's a cycle." The want resolves (declined, unestablished), not evaporates.

No F8 hits to read (the line never fired panel-wide). The probe seed's stand-down: day 99, 13 blades, released cleanly. No stand-down fired in the wild, so no MUSTER BREAKS line to read this run.

## Carried findings (not built this run)

- **Growth-line stale promise (105024 d86, NEW this run):** the dawn growth line promised 2 allied blades ("enough. Sound the call.") and the re-call harvested 0 — the pool moved between the dawn voice and the first upkeep. Game-side fix owed to the build arm (see mechanism above). The driver-side re-call gate (`musterDecision` fires on `growthHeard` alone) is noted, not built — gating the driver would hide the lie.
- **Q2 design call (r243 + r244, two panels):** more allies / more Haven / lower gate. The 9-blade shape persists on stuck villages; 4/8 now break through.
- **Trick pipeline:** all 9 wave-4 kills on unknown monsters; 14 slain wave-3+ types have no counter in their data. The knowledge pipeline's payoff stops where wave 3+ begins — worth a look by the build arm, descriptive only.
- **Trust paid to a stranger (105023, day 17):** a sickness death paid −36 trust to a stranger (firstContact null). One instance; the other 7 seeds are TRUST-EARNED-ONLY.

## Metric review

- **Q2 bar stands as written** (≥6/8 reach 10). r244: 4/8 FAIL. No re-scoring; the miss is recorded and the design call goes to the build arm with two panels.
- **Growth-line horizon fix (tooling correction):** the pilot's first NO-GO was a horizon artifact (day-101 dawn voice, no day-101 watch row can exist). The fix (beyondHorizon exclusion) is covered by analyzer cases 91–92 and documented above. The panel's NO-GO is a different, real defect (in-span, day 86) — not the horizon.
- **F8 UNMEASURED, not GO:** the line never fired panel-wide, so the wild check contributes nothing this run. The proof test (9/9 GREEN, RED verified) is the only evidence and it stands. If the line fires in a later panel, the wild instrument is already in the driver.
- **Probe determinism (observation, not a verdict):** the probe seed ran twice — pilot (day-77 staging) and panel re-run (day-99 staging), same seed, same code, different trajectories. The probe is not bitwise reproducible across processes (the RNG state a seed sees depends on process history). Both runs staged and stood down cleanly, so the Q1-PROBE verdict is unaffected — but a later run should not assume a probe seed replays identically.
- **Telemetry:** `telemetry-check.js` quiet on the 8-seed panel (w3fights, engaged.w3, fightsTotal, fightsByWave.3 — no large deviations vs the r192 baseline). The known LOUD schema mismatch (driver emits no guardrails.*) did not fire this run. Baseline NOT rolled.

## Infrastructure

- **Write flap:** no write refusals seen this run. Registration took ~6.6 min (12:49–12:56Z) on the 23G checkout; probe `git update-ref refs/heads/probe-r244 HEAD` OK 12:57Z.
- **Safe-commit index clobber struck on BOTH commits this run** (the known class: after a correct private-index commit, the main index shows files staged-deleted). Commit 1 repaired fully; commit 2's first repair covered only 2 of 6 files — the full repair (`git ls-tree -r HEAD -- <all 6 files> | git update-index --add --index-info`) was completed on resume and verified: status empty, `git diff HEAD` empty, both commits' contents verified byte-identical (pilot-analyzers.log: 838 lines, GROWTH-LINE-GO in worktree and in HEAD).
- **Gate:** `node scripts/check.js --quick` — **335 passed, 9 failed in 1229s. 0 attributable.** The 6 failures on master (r243's set: measurement-proof-update, measurement-workflow, phone-frame-proof staleness + living-garden, one-person-army, trust-observer 120s timeouts) recur unchanged. The 3 new failures all pass solo: measurement-cache-flags 4/4, occupation-panels 25/25, capable-bot 40/40 — load artifacts under 4-parallel load, not regressions. No failure touches conversation.js, the F8 fix, or the r244 driver/analyzer.
- **Panel runtime:** pilot ~5.8 min (4 seeds), panel ~15.3 min (6 seeds incl. probe re-run), gate ~20.5 min.

## Verdicts

| Leg question | Verdict |
|---|---|
| Q1 F8 fix (proof) | **GO** — 9/9 GREEN, RED verified; wild UNMEASURED (line never fired) |
| Q1 stand-down probe | **GO** — day 99, 13 blades, released, 0 stranded |
| Q2 coalition-reach | **FAIL** — 4/8 (bar ≥6/8); design call to build arm with two panels |
| Q3 march-vs-gate | **answered** — 4/4 march fights at-gate, 4/4 slain; no sub-gate fight |
| Growth line | **NO-GO** — 1 bad line (105024 d86, stale allied promise); fix owed to build arm |
| People check | **PASS** — 3/3 transcripts sensical |
| Gate | **GO** — 335/9, 0 attributable |
| Telemetry | quiet (8 files, 4 metrics) |
| **Deepening r244** | **reachable: yes; fun: yes, improving (wave-4 kills 9 vs 2, march 4/4); winnable: closer — one village opened the wave-5 door, none walked through it** |

## Closeout

- Panel evidence + run note committed via `bash scripts/safe-commit.sh` in the worktree (watch for index clobber after every safe-commit).
- Merge `git merge --ff-only journey-deepening` in the main tree; release + remove worktree + branch; final `bash scripts/worktree-reap.sh`; verify main tree clean.
- Rotation write `2→3` with read-back. Delete the lock. Remove the F8 backup file in goal hidden_files.
- Merged locally, pending ship — no version bump, no push, no live verification (ship loop owns that).
