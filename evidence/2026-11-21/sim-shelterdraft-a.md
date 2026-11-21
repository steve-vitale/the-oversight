# sim-shelterdraft-a — the sheltered draft (finding #2599, presence-side)

- **Arm:** `sim-shelterdraft-a` (Loop A, run `fleshout-20261121T1615Z`, axis scale-onramp)
- **Base master:** `abfc8f466` · **Branch:** `sim-shelterdraft-a` · **Worktree:** `~/workspace/worktrees/sim-shelterdraft-a`
- **Prereg:** `evidence/2026-11-21/sim-shelterdraft-a-prereg.md`, commit `70d96c018`
- **Horizon:** 150d, death-aware · **Policies:** competent verbatim · **Seeds:** 107241–107248 (8-seed pilot)
- **Substrate (both legs):** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`, `LEND` unset, `PRESENCE` unset · **Arm leg adds:** `SHELTERDRAFT=1`
- **Verdict: NO-GO (PARTICIPATION)** — the frozen floor bar is unjudgeable: only 3 eligible evaluations on the arm leg (bar needs ≥ 4). The primary passed (3 drafted volleys ≥ 2), the guardrails passed, coverage passed. Per the frozen prereg, an unjudgeable floor is NO-GO, never a re-score. **Game code reverted before commit; instrument + evidence only.**

## What the lever was (plain words)

When a big monster (wave 4 or worse) shows up and the villager picked to face it has no working energy gun, the village hall sometimes holds exactly the person who does: someone sheltering inside with a Searcaster and fusion cells. Before this arm, the draft never called that person — on the diagnosis band, 16 of 85 such fights had one living armed holder sheltering on or next to the fight, and the gun stayed silent every time. The lever made the draft call them out the way a shout does: the holder steps out of the hall, takes the lead of the fight, and the gun gets to speak. Default off; control leg is current behavior on identical seeds.

## Frozen bars vs measured

| Bar | Frozen bar | Measured | Result |
| --- | --- | --- | --- |
| 1. Instrument validity | `scripts/test-shelterdraft-a.js` 100% green + analyzer `--selftest` green | Proof test **29/29** green; analyzer selftest **105 passed, 0 failed** | PASS |
| 2. Primary — sheltered-holder-led volleys | Arm drafted-lead searcaster volleys ≥ 2 (judged as arm − ctl if ctl > 0) | Arm **3** (6 shots, 1 hit, 67 dmg); ctl **0**; judged increment **3** | PASS |
| 3. Floor — draft fire rate | Draft fires on ≥ 50% of eligible evaluations; **eligible < 4 → UNJUDGEABLE → NO-GO (PARTICIPATION)** | Eligible **3** (3 fired + 0 holder-unusable); fire rate 3/3 = **100%**, but n = 3 < 4 | **FAIL (UNJUDGEABLE)** |
| 4. Guardrails (scalemetric) | Arm villager starvation deaths ≤ ctl + 2 AND arm median survival ≥ 0.8 × ctl median | Starvation **9 vs 9**; median **147d vs 147d** | PASS |
| 5. Coverage | `v4draftMiss` rows for ≥ 95% of unarmed-lead wave-4+ real fights on ctl, ≤ 5% unclassified; `instrumentErrors` 0 on all 16 seeds; `v4lends` empty both legs | Ctl coverage **100/100 (100%)**, unclassified **0/75 (0%)**, orphan rows 0; errors **0 / 0**; lends **0 / 0** | PASS |

GO required ALL bars. Bar 3 is unjudgeable, so the verdict is **NO-GO (PARTICIPATION)**.

## Before / after (identical seeds, 8 per leg)

Wall numbers — no wins on either leg, no national standing on either leg:

| | Control | Arm |
| --- | --- | --- |
| Full wins (seeds) | 0/8 | 0/8 |
| National standing | 0/8 | 0/8 |
| Reached wave 4 | 8/8 | 8/8 |
| Reached wave 5 | 2/8 | 3/8 |
| Median survival | 147d | 147d |
| Villages surviving to day 150 | 4/8 | 4/8 |
| Villager starvation deaths | 9 | 9 |
| Fights engaged / fled | 100 / 59 | 108 / 66 |
| Deaths per engaged fight | 5.56 | 5.19 |
| Armed entries / armed leads / armed volleys | 9 / 0 / 0 | 3 / 3 / 3 |
| Searcaster holder-days | 195 | 166 |

Per-seed ends (ctl → arm): 107241 survived, wave 5, standing 610 → 540; 107242 survived, wave 4, 199 → 199; 107243 village-lost, wave 5, 405 → 405; 107244 village-lost, wave 4, 100 → 100; 107245 survived, wave 4 → **wave 5**, 199 → **375**; 107246 village-lost, wave 4, 199 → 199; 107247 survived, wave 4, 199 → 199; 107248 village-lost, wave 4, 100 → 100. The survival pattern per seed is identical on both legs — the draft changed no village's fate. The only seed that moved on the wall is 107245, where both draft fires happened; that is one seed of movement, not a claim.

The balanced-panel compare (`shelterdraft-a-panel.md`, attached) agrees: **review_required**, no material signal on any observed metric (wins 0/0, national 0/0, community loss 0.5/0.5, village deaths 69.5 → 70 with a paired interval of −3 to +4.5 — noise).

The draft's own record on the arm leg: **301 helper evaluations, 3 fires** (by reason: wave-below-4 216, no-sheltered-holder 82, fired 3, holder-unusable 0). All 3 fires became real fights; all 3 loosed a volley; join mismatches 0. On the control leg the pool was there — 15 sheltered-holder launches out of 75 unarmed-lead wave-4+ launches, 60 with no living holder — but the arm leg's own trajectories produced only 3 eligible moments, both fires landing on two seeds (107241 × 1, 107245 × 2). Six of eight arm seeds never had a single eligible evaluation.

## The three fires (sense-test — read the fights, not just the counts)

1. **Seed 107241, day 124 — Ingrid vs The Algorithm (wave 4), vKill.** Call-out: *"Ingrid comes out of the hall, Searcaster in hand — 'I'll take this one.'"* Her volley missed both shots (0.37 hit chance each), but she fought on: 6 rounds, shouted for help in round 2, Sigrun and August joined, the Algorithm died. The gun added nothing that fight; the party won it on melee. Honest, coherent — the miss is part of the story, not a broken telling.
2. **Seed 107245, day 118 — Eli vs The Herald (wave 4), vKill.** *"Eli comes out of the hall, Searcaster in hand — 'I'll take this one.'"* Volley 1 of 2 hits for **67 damage** — the one clean searcaster hit on the band, about an eighth of the Herald's 525 health. Then 5 rounds, Chloe charged in on his shout, committed finish, kill. The gun's contribution is visible and proportionate.
3. **Seed 107245, day 118 — Chloe vs The Eulogy (wave 4), monster fled.** *"Chloe comes out of the hall, Searcaster in hand — 'I'll take this one.'"* Volley missed both shots — and then Chloe walked in open-handed, talking low and steady, and the Eulogy stood down in round 1. Two drafted leads on one day, two different holders, two different monsters; the second fight was won by talking, not shooting. That reads like people, not a script.

All three call-out lines are recorded in the fight log at the head (`rec.log[0]`), exactly as designed. One narration wrinkle, recorded under Findings: the fight-opening lines still say the gun-lead "nocks an arrow" and the shots are "arrows" burying themselves in the dirt — the beam weapon is narrated as a bow (see §Findings).

## Village assessment (plain words)

The lever works exactly as built: when a sheltered gun-holder is in earshot, the draft calls them out every single time (3 for 3), the gun fires, and nobody starves or dies extra for it. But the moment almost never arrives. Across eight villages over 150 days, only three fights had everything lined up — a big monster, an unarmed lead, and a living armed holder sheltering close enough to hear the call. On six of eight seeds it never happened at all. The diagnosis band promised 16 such moments; this band delivered 3, because the villages' own stories diverged — holders died, or were out in the world instead of in the hall, or the fights happened far from home. The gun is no longer silent when it is called. It is just very rarely called. That is a participation result, not a broken mechanism: the lever does what it says, and what it says turns out to matter about three times per eight villages per season. Landing it would change almost nothing a player could feel, which is why the frozen bar says no.

## Metric review

- **The floor bar did its job.** The eligible-minimum of 4 exists precisely so a 3-for-3 fire rate cannot be read as a proven rate. The primary passed on 3 volleys; the floor correctly refuses to certify the rate on n = 3. No re-score.
- **The eligible denominator is trajectory-sensitive, and the prereg under-priced that.** The floor was sized from the *diagnosis* band's 16 sheltered launches, but the arm leg writes its own trajectories: a fired draft kills monsters an unarmed lead might have fled from, holders live or die differently, and the arm leg's holder supply ran thinner (166 holder-days vs 195 on ctl; 81 of 82 arm unarmed launches had no living holder, vs 60 of 75 on ctl). A future run that wants to judge the fire rate should either pre-register the floor against the *control* leg's sheltered count (15 here — the pool as the village actually presents it) or run a longer horizon / more seeds until the arm leg itself accumulates ≥ 4 eligible evaluations. Either way, that is a new prereg, not a revision of this one.
- **The primary's bar (≥ 2 volleys) was met, but on 2 seeds only.** A confirm was never on the table — confirm follows a pilot GO only.
- **Coverage held at 100%** with zero unclassified rows and zero orphan rows on both legs, and the join (fire → encounter on seed|day|mid|lead) matched all 3 fires with 0 mismatches. The instrument is sound; the pool is thin.

## Findings (outside this arm — for the coordinator, not chased here)

1. **A searcaster lead opens a fight like an archer.** Whenever a drafted gun-holder leads, the fight opens with *"nocks an arrow — the fight opens at range (N shots)"* and missed shots are *"loosed wide — the arrow buries itself in the dirt."* A beam weapon firing fusion cells is narrated as a bow. This was invisible before this arm because no armed villager had ever led a wave-4+ fight on any band in this chain (ctl armed leads 0, as on every prior band). It is a flavor mismatch in the ranged-opening lines, not in the volley mechanics (the one hit landed 67 damage, the searcaster band). Worth a line fix when a gun-lead is next in front; it will now be visible to any player whose villager leads with a gun.
2. **The encounter row's `log` snapshot does not carry the call-out line.** The draft call-out is at the head of `rec.log` at return (the driver's `v4shelterFires.logLine` proves it), but the encounter record's `log` array starts with the fight-open line instead — the encounter log is snapshotted before the finally block unshifts the line. Same family as finding #2630 (the driver reads `rec.log` at fieldFight-return, before the hook annotates spoken lines). The line reaches the summary as designed; only the per-encounter transcript copy misses it.
3. **Holder supply thins on the arm leg.** Holder-days 166 (arm) vs 195 (ctl); 81/82 arm unarmed launches had no living holder vs 60/75 on ctl. Partly trajectory noise on 8 seeds, partly the draft changing who lives through which fights. If holder supply is the next lever (the diagnosis arm's first lever), its prereg should expect the arm leg's pool to shrink relative to control.

## Run identity

- **Proof test:** `node scripts/test-shelterdraft-a.js` → `SHELTERDRAFT_PASSED 29/29`, `SHELTERDRAFT_FAILS 0` (run 2026-11-21, after fixing one fixture bug: the section-(g) post-flee-rest flag leaked into later sections via `Game._postFleeRest`; the test's `unshelterAll()` now clears it at the section boundary — fixture state only, no assertion loosened).
- **Analyzer:** `node scripts/analyze-shelterdraft-a.js --selftest` → `105 passed, 0 failed`.
- **Smoke (1 seed):** ctl + arm on 107241, both exit 0; arm smoke fired once (Ingrid, d124 — the same fight as in the full pilot, confirming determinism of the smoke seed).
- **Full pilot commands** (both legs, exit 0, ~4.8 min each):
  - ctl: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl OUTDIR=perseed-shelterdraft-a-ctl SEEDS=107241,107242,107243,107244,107245,107246,107247,107248 RUN=shelterdraft-a DAYS=150 node scripts/shelterdraft-driver-a.js`
  - arm: same + `SHELTERDRAFT=1 MODE=arm OUTDIR=perseed-shelterdraft-a-arm`
  - First full-pilot attempt failed fast on both legs (exit 3, `PARTICIPATION STOP: refusing to overwrite …s107241…json`) — the driver's overwrite guard caught the smoke seed's files. Removed the two smoke per-seed JSONs (smoke summaries preserved in `shelterdraft-a-sweep-*-smoke.log`) and re-ran; the re-run reproduced the smoke seed's summary exactly.
- **Judge:** `node scripts/analyze-shelterdraft-a.js --ctl evidence/2026-11-21/perseed-shelterdraft-a-ctl --arm evidence/2026-11-21/perseed-shelterdraft-a-arm --out evidence/2026-11-21/shelterdraft-a-analysis.json` → `NO-GO PARTICIPATION` (bars: volleys PASS, fire-rate FAIL/UNJUDGEABLE, guardrails PASS, coverage PASS).
- **Panels:** `node scripts/build-shelterdraft-panels-a.js`, then `node scripts/balance-panel.js compare --before evidence/2026-11-21/shelterdraft-a-panel-before.json.gz --after evidence/2026-11-21/shelterdraft-a-panel-after.json.gz --out evidence/2026-11-21/shelterdraft-a-panel` → `review_required`, no material signal. Compare `.md` attached.
- **Check:** `node scripts/check.js --quick` → **333 passed, 11 failed in 1590s** (log `shelterdraft-a-check-quick.log`; run with the lever in place, box heavily loaded — load avg 9–12, Loop B live). The 11: six 120s timeouts (living-garden-deed-attainment, occupation-panels, one-person-army-deed-attainment, solo-campaign-endings, synergy-stall, capable-bot — long sim tests under parallel load; none exercises the draft path, and the lever is env-gated off in check runs so runtime behavior is identical to base); four proof/neutrality failures (measurement-proof-update, measurement-workflow, measurement-cache-flags, trust-observer-neutrality); one phone-frame-proof failure. **Post-revert re-runs (game.js back to base):** measurement-cache-flags **4/4 pass** and trust-observer-neutrality **6/6 pass** — both were lever-caused and cleared by the revert. measurement-proof-update, measurement-workflow, and phone-frame-proof still fail on the reverted tree; a manifest diff shows the retained proof is stale against base `abfc8f466` on ~21 observer files this arm never touched (index.html, build-notes.json, competent.js, two policy files absent from the proof entirely, betrayal.js, bond-initiation.js, build.js, contests.js, conversation.js, convo-beats/dialogue/topics/wants, favor-outing.js, fieldFights.js, finale-campaign.js, titans.js, villager-brain.js, villager-build.js, win-plan.js, game.js) — pre-existing staleness on the base, not lever-caused. No shelterdraft file is in `observerFiles`. The six timeouts were not re-run; they are the known timeout class under load.
- **Corpora:** `evidence/2026-11-21/perseed-shelterdraft-a-ctl/` (8 files), `evidence/2026-11-21/perseed-shelterdraft-a-arm/` (8 files); sweep logs `shelterdraft-a-sweep-ctl.log/.err`, `shelterdraft-a-sweep-arm.log/.err` (both `.err` empty); analysis `shelterdraft-a-analysis.json`.
- **Flap strikes:** one suspected strike — at smoke launch, the arm leg's log redirect failed with `No such file or directory` while the ctl redirect in the same command succeeded; the retry minutes later wrote fine. Recorded as suspected, not confirmed (the error was ENOENT, not the usual EPERM). No other write failures; no data lost.
- **Revert (NO-GO):** `src/js/game.js` reverted to base `abfc8f466` before commit; verified 0 `SHELTERDRAFT` references in `src/` and `node --check` clean. The lever survives only as the proof test + driver + analyzer (instrument), which is the committed record of a killed lever. Note: the proof test now fails against the reverted tree (the helper no longer exists) — the correct post-NO-GO state, retained as the instrument record, same class as prior arms' stale-proof failures. (One repair during the revert: the `git checkout` left the committed prereg file's index entry dropped — staged `D` with the worktree copy byte-identical to HEAD; restored with `git ls-tree -r HEAD -- <path> | git update-index --add --index-info` per the index-clobber lesson, verified `git status` clean of tracked changes and `git diff HEAD` empty.)
