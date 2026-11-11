# sim-vetphantom-b — readiness-vs-ladder veteran phantom, fixture + re-measure (Loop B)

- **Run:** fleshout-loop-b-20261111T1630Z, arm sim-vetphantom-b
- **Prereg:** `evidence/2026-11-11/sim-vetphantom-b-prereg.md` (committed `7d93e418a` before any judged band sim; Amendment 1 committed `0b838af96` before any analysis — see §9)
- **Base:** local master `5157782a4` (rebased from `965e8d04e` at run start, no conflicts)
- **Fix under verification:** journey-scale r131, commit `5d16916f4` (local master) — one line in `src/js/standing.js` `waveCombatReadiness.isLiving`: `if (roster.indexOf(vid) < 0) return false;`, mirroring `ladder.js countLivingVeterans`. This arm wrote NO src/js change.
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified), `scripts/vetphantom-driver-20261111.js`, `scripts/vetphantom-analyze-20261111.js`, `scripts/test-vetphantom-b.js` (committed `7d93e418a`, 43/43 green on fixed code, 34/43 + exit 1 on pre-fix code)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398, competent verbatim, TWO legs on identical seeds (control: pre-fix standing.js; fix: fixed standing.js)
- **Seed band:** 190391–190398, verified FRESH per the seed-band skill (zero hits in all dated preregs, all dated evidence `.md`, goal hidden_files, and perseed directory names; named used bands 190301–190308, 190311–190318, 190361–190368, 190371–190378, 190381–190388 all non-overlapping)
- **Canon note:** no `docs/` file covers veterans. `docs/CANON.md` and `docs/MONSTER-WAVES.md` were read first; the veteran-bar rule comes from MONSTER-WAVES.md design call #4 (2026-10-16) and Steve's 2026-11-10 scholar-counts ruling. Nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-vetphantom-b/` — 16 per-seed JSONs (8 control + 8 fix); summary `evidence/2026-11-11/vetphantom-b-summary.json`
- **Run notes (infrastructure):** the runtime restarted twice mid-run. (1) During the fix leg, after 2/8 seeds: the driver was killed; both completed files were verified byte-complete (writeRobust readback + re-parse: mode=fix, standingFix=true, 149 snapshots, 0 errors) and the remaining 6 seeds were run cleanly — no seed was re-run, no file overwritten. (2) Before the panel run, the restart wiped `/tmp`, deleting the scratch copies of both standing.js variants; the first before-panel attempt therefore ran on the fixed file and was killed + its output dir removed before it finished. Both variants were regenerated from git into durable scratch (`~/workspace/scratch-vetphantom/`) and verified by sha256 against the shas the driver recorded per seed (control `75762cb2259d`, fix `f8fda4295a99` — both match). Neither incident touched the sims themselves — all 16 files parse, all legs carry the correct standingSha, 0 instrument errors.

## Verdict: GO

The analyzer (`scripts/vetphantom-analyze-20261111.js`, exit 0) computes GO on all seven GO rows. The phantom reproduces on pre-fix code (fixture + control leg), the fix removes it on the same trajectories, and no wall number moves.

| GO row (prereg §14, as amended) | Result | Detail |
|---|---|---|
| Fix-leg bar agreement 8/8 (w4 + w5, end of run) | GO | w4 8/8, w5 8/8 |
| Zero phantom days on the fix leg | GO | 0 phantom days |
| Wins not below control | GO | fix 0 vs control 0 |
| National reach not below control | GO | fix 0 vs control 0 |
| Wave-5 unlocks not below control | GO | fix 3 vs control 3 |
| Median survival within ±25% of control | GO | fix 150d vs control 150d (ratio 1.00) |
| 0 instrument errors | GO | 0 errors on 16/16 runs |

## §1 Fixture — the phantom reproduces, then doesn't

`scripts/test-vetphantom-b.js` (43 assertions): a roster villager is given a wave-3 (Tama shape) or wave-4 (Mireille shape) kill in `state.waveKillLog`, then killed down the TB path (`tbVillagerFalls`); all THREE counts — readiness, ladder, instrument recomputation — are read on the death day AND the day after (one competent day via the shared harness).

- **On the fixed tree: 43 passed, 0 failed.** All three counts agree on the death day and the day after, on both bars; the `removeVillager` control reads 0/0/0 with `vp.dead` set; one-fallen-one-living still counts 1 everywhere; the scholar kill still counts.
- **On pre-fix standing.js (swapped in, run, fixed file restored byte-identical): 34 passed, 9 failed, exit 1.** The phantom reproduces exactly as vetfirst-b saw it: Tama shape, death day AND day after, `r4=1 r5=0 l3=0 l4=0 i3=0 i4=0`; Mireille shape, death day AND day after, `r5=1` vs `l4=0 i4=0`; one-fallen-one-living overcounts (`r4=2` vs `1/1`). The fixture is sensitive to the defect and green on the fix.
- **Mechanism confirmed, not just inferred:** after a TB fall, `vp.dead` is still false on the death day AND the day after (the lie persists — the fix works around it with the roster check, it does not repair `tbVillagerFalls` itself; that wider fix is carried, see §8).

## §2 The phantom seed — 190394, Leo, 112 days

On the control leg, seed 190394 carries the phantom live for 112 days (d40–d151, w4 bar only):

- **Leo (gen_vvjo0p4)** made three wave-3 kills (d28 wild, d36 agency, d38 wild) and died d40 "combat" (registerDeath kind `person`, the TB path). From d40 the old rule counted him: control end-of-run `readiness(4).veterans` = 3 vs instrument = 2; the first phantom snapshot is d40 (`ready4v=3 i3=2 shadow=3`), the day before (d39) reads 2 vs 2.
- The w5 bar never disagreed on this seed (the phantom is a wave-3-only killer — the Tama shape again, not a Mireille shape): `readiness(5)` = 0 throughout, blooded false on both legs.
- On the fix leg, the same trajectory reads `readiness(4)` = 2 at end (agreeing with the instrument), 0 phantom days — while the live shadow old-rule count still reports 3 on those same 112 days. The fix prevented exactly the phantom days the control leg exhibited, on the same seeds, same trajectories.
- The other two living veterans at end on the fix leg are late wild-join villagers (visjoin_116, w3 kill d128; visjoin_134, w3 kill d146) — the village's veteran bar at the end is held by newcomers, not by Leo's generation. Mia Andersson, the village's wave-4 killer (w3 d76 + four w4 kills d94–d129), died d129 "the wild".

## §3 Band tables — agreement and phantom days

Per seed, per leg: end-of-run reads, agreement (vetfirst rule: w4 = readiness(4) vs instrument w3; w5 = readiness(5) vs ladder(4) vs instrument w4), phantom days (daily engine-vs-instrument disagreement), shadow days (old rule vs instrument on the same trajectory).

| seed | leg | end r4 / i3 | end r5 / l4 / i4 | agree w4/w5 | phantom d w4/w5 | shadow d w4/w5 |
|---|---|---|---|---|---|---|
| 190391 | control | 1 / 1 | 0 / 0 / 0 | true / true | 0 / 0 | 0 / 0 |
| 190392 | control | 2 / 2 | 1 / 1 / 1 | true / true | 0 / 0 | 0 / 0 |
| 190393 | control | 3 / 3 | 2 / 2 / 2 | true / true | 0 / 0 | 0 / 0 |
| 190394 | control | **3 / 2** | 0 / 0 / 0 | **false** / true | **112** / 0 | 112 / 0 |
| 190395 | control | 1 / 1 | 1 / 1 / 1 | true / true | 0 / 0 | 0 / 0 |
| 190396 | control | 0 / 0 | 0 / 0 / 0 | true / true | 0 / 0 | 0 / 0 |
| 190397 | control | 3 / 3 | 2 / 2 / 2 | true / true | 0 / 0 | 0 / 0 |
| 190398 | control | 1 / 1 | 1 / 1 / 1 | true / true | 0 / 0 | 0 / 0 |
| 190391 | fix | 1 / 1 | 0 / 0 / 0 | true / true | 0 / 0 | 0 / 0 |
| 190392 | fix | 2 / 2 | 1 / 1 / 1 | true / true | 0 / 0 | 0 / 0 |
| 190393 | fix | 3 / 3 | 2 / 2 / 2 | true / true | 0 / 0 | 0 / 0 |
| 190394 | fix | 2 / 2 | 0 / 0 / 0 | true / true | 0 / 0 | **112** / 0 |
| 190395 | fix | 1 / 1 | 1 / 1 / 1 | true / true | 0 / 0 | 0 / 0 |
| 190396 | fix | 0 / 0 | 0 / 0 / 0 | true / true | 0 / 0 | 0 / 0 |
| 190397 | fix | 3 / 3 | 2 / 2 / 2 | true / true | 0 / 0 | 0 / 0 |
| 190398 | fix | 1 / 1 | 1 / 1 / 1 | true / true | 0 / 0 | 0 / 0 |

- Control agreement: w4 7/8, w5 8/8 — the single miss is 190394, the phantom seed. Fix agreement: w4 8/8, w5 8/8.
- Control phantom days: 112 (1 seed). Fix phantom days: 0. Shadow-prevented on the fix leg: 112 days on 1 seed — the same seed, the same days.
- 190391 deserves a note: end `readiness(4)` = 1 vs `_ladderLivingVeterans(4)` = 0 on BOTH legs, and it AGREES under the corrected rule (ready4=1 vs instrument w3=1 — the one living veteran is a wave-3-only killer). Under the prereg's first wording it would have read as a disagreement; Amendment 1 (§9) corrected that comparison before any analysis, and this seed is the proof the correction was load-bearing.

## §4 Wall numbers — identical, both legs

| seed | days | end | standing | scale | maxWave | won | deaths |
|---|---|---|---|---|---|---|---|
| 190391 | 150 | survived | 199 | regional | 4 | false | 109 |
| 190392 | 150 | survived | 199 | regional | 4 | false | 102 |
| 190393 | 150 | survived | 325 | regional | 5 | false | 66 |
| 190394 | 150 | survived | 199 | regional | 4 | false | 89 |
| 190395 | 109 | village-lost | 199 | regional | 4 | false | 94 |
| 190396 | 85 | village-lost | 199 | regional | 4 | false | 81 |
| 190397 | 150 | survived | 325 | regional | 5 | false | 88 |
| 190398 | 150 | survived | 375 | regional | 5 | false | 78 |
| **band (both legs, identical)** | **median 150d** | **6 survived / 2 lost** | **199–375** | **regional 8/8** | **5 on 3/8** | **0/8** | **707** |

Every wall number is identical between control and fix, seed by seed — days, end reason, standing, pantry kcal, death counts, kill-call counts, even the say counts. The phantom never flipped a gate outcome on this band: on 190394 the phantom lifted the veterans bar from 2 to 3, but wave 4 needs only 1 veteran, so the bar was already met — the phantom was surplus. The fix's effect here is gate-read honesty, not a trajectory change. (The r131 band showed the sharper case: a phantom keeping a village BLOODED through wave-5 fights after the tribute was paid. On this band the phantom was wave-3-only, so blooded was never at stake.)

## §5 Bar vs unlocks

Per seed (fix leg): first veteran day, first day wave-4 / wave-5 readiness met, living veterans at end (w3/w4), tribute, blooded.

| seed | first vet | ready4 day | ready5 day | live end w3/w4 | tribute | blooded |
|---|---|---|---|---|---|---|
| 190391 | d31 | d31 | — | 1 / 0 | false | false |
| 190392 | d39 | d39 | — | 2 / 1 | false | true |
| 190393 | d28 | d29 | d72 | 3 / 2 | **true** | true |
| 190394 | d28 | d28 | — | 2 / 0 | false | false |
| 190395 | d37 | d37 | — | 1 / 1 | false | true |
| 190396 | d34 | d34 | — | 0 / 0 | false | false |
| 190397 | d47 | d48 | d131 | 3 / 2 | **true** | true |
| 190398 | d32 | d32 | d96 | 1 / 1 | false | true |

- Wave-4 readiness is reachable on 8/8 (d28–d48); wave-5 readiness on 3/8 (d72, d96, d131 — 190397 reaches it only 19 days before the 150d cap).
- The military tribute is ready on 2/8 (190393, 190397) — better than vetfirst-b's 0/8, and both are the wave-5 seeds with 2 living wave-4 veterans at end. It was never delivered on this band (delivery is a separate player/system act; readiness is what this arm measures).
- Blooded on 5/8. 190396 ends with 0 living veterans — the village that lost its veteran generation entirely (died d85).
- Death causes (fix leg, 707 deaths): villager combat and combat dominate every seed (e.g. 190392: villager combat 49, combat 42; 190394: villager combat 40, combat 17, the wild 13); expedition deaths 11–29/seed; "the wild" 3–19/seed. No seed's leading cause is starvation or sickness — these villages die fighting, not hungry.

## §6 Sense test (quoted scenes)

The say sample is the driver's veteran-filtered capture (same regex as vetfirst-b, 400-line cap per seed). The kill beat fires constantly — byte-identical each time, naming the killer — and the gate beats mark the scale wall as a person waiting, not a number.

Leo's arc, on the phantom seed (190394), is the whole finding in miniature — celebrated on camera three times, dead two days after the last one, and the village hears nothing about the death:

> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Leo just put down The Callback... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190394 d28)
> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Leo just put down Ad Break... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190394 d38)
> — Leo dies d40, "combat". No line marks it. The readiness gate keeps counting him for 112 days.

The gate talks, on schedule, once per seed:

> 📺 "But finales — FINALES need a LEGEND, sweetheart. More STANDING — blood, bonds, or bread — and look the Mirror Draft in the eye. The producers are WAITING." (190391 d49)
> 📺 SYSTEM: "Four waves. FOUR. The producers are — okay, I'm saying it: FINALES need a NATION. You've got a region; now make it a REALM. Bind fires under one head, or bend the knee to someone who has. The higher-ups are watching. ...Did I say higher-ups? I said NOTHING. Forget the higher-ups." (190391 d55)
> 📺 "You've gotten too big for the story. Ratings are GREAT, by the way — but you're threatening the narrative now. So the narrative is fighting back. Meet the PRODUCERS." (190393 d72)
> Blooded — the village knows where the Producers bleed. (Strikes hit 1.5× as hard; their blows land at 0.75× strength.) (190393 d80)

One non-veteran human line in the corpus, worth keeping — villagers planning around a shared ability, unprompted:

> 💬 Chantal has been asking Raj about Cold-Blooded — what it does, what it goes with. Planning something. (190391 d71)

And an ability arriving as a named thing with a plain-English body:

> ✨ Ability gained: Cold-Blooded (L1). You need 20% less food in cold weather. Your body budgets like an accountant. (190397 d108)

**Coherence verdict:** same as vetfirst-b — the veteran fiction is loud at the kill and silent at the death. Nothing in the corpus is robotic or incoherent; the gap is absence, not nonsense. Backlog #472 (hold beats don't mourn the blooded) still stands: Leo gets three "REMEMBER the name" beats and no mourning line in the veteran-filtered record. Caveat, as before: a plain-worded death line outside the capture filter can't be ruled out.

## §7 Village assessment, in plain words

Eight villages, one story with eight endings. A villager bloods themselves against a wave-3 monster around day 30, the whole village hears about it on camera, and then — usually within weeks — that person is dead in combat or the wild, and nobody says anything about it. Two villages (190395, 190396) are lost by day 109 and 85; six survive the 150 days, and three of those reach wave 5. The strongest village is 190398 (standing 375, wave 5 from d96, blooded) and the weakest is 190396 (dead d85 with zero living veterans at the end — it made veterans and kept none). The tribute — two living wave-4 veterans to send to the table — is ready on two villages now, which is further than the last band got, but no village wins, no village reaches national, and the full seat never opens. The phantom itself turns out to be a quiet defect, not a loud one: on this band it never changed a single outcome, because the bar it inflated was already met. It matters anyway, because the gate is the thing that decides whether a village walks through the wave door — and for 112 days on one village, it was reading a dead man's name. The fix removes the ghost without moving anything else: every number in the band is identical before and after, except the one that was lying.

## §8 Metric review (§14, never re-scored mid-run)

- **Fix-leg bar agreement — GO (8/8, both bars).** The corrected rule (Amendment 1) held cleanly; see §9 for why the correction was made and the 190391 proof that it was load-bearing.
- **Zero phantom days on fix — GO.** The shadow counts delivered the before/after evidence on the same trajectories without a second panel run — keep the shadow-recorder pattern for future liveness fixes (the r131 lesson, re-proven here: shadow 112 = control phantom 112, same seed, same days).
- **Wall guardrails — GO, all four.** Identical numbers both legs; the fix is trajectory-neutral on this band.
- **Errors — GO (0).** Zero instrument errors across 16 runs.
- **Per-seed tables — complete.** Agreement, phantom days, wall numbers, bar-vs-unlocks, sense-test scenes quoted. No blank left unfilled except the stated ones: plain-worded death lines outside the capture filter (§6 caveat), and the `tbVillagerFalls` vp.dead lie (§1, carried).
- **Panel (§15):** decision `review_required` (screen-only — 8 cases, not confirmation-sized), but **all 29 paired deltas are exactly 0** — wins, national, table entry/sitting, bearer survival, player/village deaths, gear access, luck all identical before/after. The panel independently confirms trajectory neutrality on its own seed set; the label reflects the screen size, not a detected change. The pre-registered judge is the analyzer (GO); the panel is the instrument, and the instrument shows zero movement. See §9.
- **Telemetry check:** attempted and REFUSED by the tool itself — `telemetry-check.js` rejects the per-seed corpus as recorder-corpus input ("all 16 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs... compared with sweep-compare tables, never against a run baseline here"). The Loop B body's prescribed `--current '<per-seed-evidence-glob>'` invocation cannot be applied to this arm's corpus by design; the §15 panel compare is the before/after instrument instead. Recorded, not waived: the refusal is the tool's, and the panel covers the same question.
- **Amendment 1 (before any analysis):** the prereg's first wording of the w4-bar comparison (readiness(4) vs `_ladderLivingVeterans(4)`) compares two different bars. Corrected to the vetfirst rule (readiness(4) vs instrument w3; readiness(5) vs ladder(4) vs instrument w4) with the fixture as the live `_ladderLivingVeterans(3)` proof. The correction changed no threshold, only the comparison definition — and seed 190391 (ready4=1, ladder4=0, instrument w3=1 on both legs) proves the old wording would have manufactured a false disagreement on the fix leg.

## §9 Panel (§15)

`node scripts/balance-panel.js --out evidence/2026-11-11/vetphantom-panel-before --n 8 --days 150 --policies competent --par 4` on the pre-fix standing.js (sha `75762cb2259d`, 8 cases), the same on the fixed standing.js (sha `f8fda4295a99`, 8 cases), then `node scripts/balance-panel.js compare --before <before/panel.json.gz> --after <after/panel.json.gz> --out evidence/2026-11-11/vetphantom-panel-compare`. Compare `.md` attached to this evidence file.

**Decision: `review_required` — screen-only, 8 paired cases, not confirmation-sized. All 29 paired deltas are exactly 0:**

| Metric (sample) | Before | After | Delta |
|---|---|---|---|
| Table win rate | 0 | 0 | 0 |
| Table entry / sitting rate | 0 / 0 | 0 / 0 | 0 |
| National scale access | 0 | 0 | 0 |
| First bearer survives d30 / d60 | 0.625 / 0.125 | 0.625 / 0.125 | 0 |
| Village deaths per run | 73.375 | 73.375 | 0 |
| Community loss | 0.875 | 0.875 | 0 |
| Earned player tier-3+ weapon/armor | 1 | 1 | 0 |
| Combined run luck percentile | 0.64 | 0.64 | 0 |

Every other row (player deaths, sampled pantry/hydration/HP/hunger, named-class access, bearer changes, ability events, trap/snare/pit luck) likewise delta 0; hunt/fishing luck `not_observed` on both sides. Table reach (raw, display only): invitations observed 8/8 before → 8/8 after; sittings 0/8 → 0/8.

The panel runs its own seed set (its `seedList(8)`), so its absolute numbers differ from the band's (village deaths 73.4/run vs the band's 88.4/run; community loss 0.875 vs 2/8 lost) — that is expected; what matters is the paired before/after, which is zero everywhere. The panel is the instrument, the pre-registered threshold is the judge: the instrument shows no movement, and the analyzer's GO stands.

## §10 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — 7 wraps + daily snapshot; vetfirst-b proved it neutral 8/8 exact) + the driver's live shadow old-rule count per snapshot (new in this arm).
- **Driver:** `scripts/vetphantom-driver-20261111.js` (control/fix legs, leg guard: refuses to run when on-disk standing.js doesn't match the requested leg; standingSha recorded per seed).
- **Analyzer:** `scripts/vetphantom-analyze-20261111.js` (exit 0 on GO; Amendment 1 corrected its w4 comparison before any analysis).
- **Proof:** `scripts/test-vetphantom-b.js`, 43/43 green on fixed code, 34/43 + exit 1 on pre-fix code (sensitivity proven by the swap, not by editing assertions).
- **Corpus:** `evidence/2026-11-11/perseed-vetphantom-b/vetphantom-s19039{1..8}-vetphantom-pilot-{control,fix}.json` (16 files). Summary: `evidence/2026-11-11/vetphantom-b-summary.json`. Panel: `evidence/2026-11-11/vetphantom-panel-{before,after}/` (8 cases each) + compare `evidence/2026-11-11/vetphantom-panel-compare.{json,md}`.
- **Files in this arm:** this evidence file, the summary JSON, the 16 per-seed JSONs, the panel dirs + compare. Prereg (`7d93e418a`, Amendment 1 `0b838af96`) and fixture/driver/analyzer/proof (`7d93e418a`) were committed earlier in this arm.
- **No new src/js change by this arm.** The fix verified here (journey-scale r131, `5d16916f4`) was already on local master; this arm proves it and re-measures the band. Merged locally, pending ship (coordinator merges; no push, no bump, no live verification by this arm).
- **Backlog:** sim-findings.md line 2157 (the phantom entry, `[open]` since vetfirst-b) marked `[fixed 2026-11-11 by Loop B arm sim-vetphantom-b]` — fixture reproduces it on pre-fix code, band agrees 8/8 on fixed code, 112 phantom days removed on the same trajectories.

## §11 Run notes (carried)

- `tbVillagerFalls` vp.dead lie (wider fix, needs a panel across all vp.dead readers) — still carried, not this arm's to build.
- Backlog #472 (hold beats don't mourn the blooded) — re-measured, still open (Leo, 190394).
- The tribute-strips-blooded design note from journey-scale r131 ([needs-eyes]) is untouched by this arm — no tribute was delivered on this band.
- Telemetry-check refusal (recorder-corpus input) — the Loop B body's prescribed invocation doesn't fit per-seed recorder corpora; the panel compare covers the before/after instead. Worth a body-note for the next arm that runs telemetry-check against a per-seed glob.
