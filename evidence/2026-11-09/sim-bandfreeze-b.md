# sim-bandfreeze-b — the band is frozen, fightblend is MIXED, b98f MOVES, e3ef is INERT (DIAG, zero src/js)

**Arm:** sim-bandfreeze-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1930Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-bandfreeze-b, base master `fd306cac1` (verified: worktree `git log --oneline -1` reads `fd306cac1`; worktree tree clean, 0 untracked) · **Prereg:** `evidence/2026-11-09/sim-bandfreeze-b-prereg.md` (committed `0be275a65` BEFORE any judged computation) · **Instrument:** DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg, 150d death-aware, band seeds 53011–53018. Corpora committed under `evidence/2026-11-09/perseed-bandfreeze-b/` (65 files: F0 8 + F0b control 1 + F0c re-verify 8 + L1–L6 8 each). Proof `scripts/test-bandfreeze-b.js` **130 passed, 0 failed, 0 skipped**.

## Verdict: BAND FROZEN + THREE PAIR VERDICTS — (a) MIXED, (b/b98f) MOVER, (b/e3ef) INERT

**The freeze held.** All 8 band seeds re-verified exactly on the same master — the F0c corpora differ from F0 on exactly one key, `run` (the leg label itself); every binding field, every fallen list, every daily row is identical. The band is a stable instrument on `fd306cac1`, the first stable attribution instrument in this chain since 53007-a. The three pairs were then judged under the preregistered band rule:

- **(a) fightblend (OLD→MOVED): MIXED — neither fingered nor exonerated.** 2 seeds move in the OLD→MOVED direction (53014, 53016), 2 move opposite it (53015, 53018), 4 no-move. The fix reshuffles every band village (first divergence d5–d16 on all 8 seeds) but in no consistent direction: it revives 53015 (68d died → 150d survived, standing 199→545, 2→4 wave-4 kills) and 53018 (81d died → 150d survived, 175→309, 0→4 kills) while killing 53017 at d52 (was 150d survived on pre) and 53014 at d52 (was 82d). A commit that moves 2 seeds one way and 2 the other cannot finger under the band rule — and the rule was written for exactly this case. The single-seed OLD→MOVED question, which four arms could never answer because the lead seed kept moving, now has a band answer: **no consistent direction, no finger**.
- **(b/b98f) secret-response fix: MOVER.** 5/8 seeds move with the pair (standing↑ + wave-4 kills↑), 0 against — exactly at the bar. The fix lifts the band: 53013 (199→284, 0→3 kills), 53014 (199→325, 3→4), 53015 (111d died → 150d survived, 199→495, 1→5 kills, wave-5-ready), 53017 (62d died → 148d, 135→695, 0→12 kills), 53018 (159→199, 0→3 kills). The exceptions are trajectory notes, not counter-moves: 53011 dies earlier on the fix (150d→66d) but its standing is unchanged (199→199), so it reads 'none'; 53012 is inert on standing/w4 (only fallen +1); 53016 moves standing down but kills up (mixed → 'none'). Scope, stated plainly: a MOVER verdict says the commit moves band endpoints consistently upward in standing and kills — it does NOT by itself prove `b98ac0730` caused the single-seed NEW→MIDDLE step (the band has no NEW/MIDDLE reference). It does make it the prime mover for that step on the evidence: the prime suspect from the 1739Z arm now has a band-level effect in the same direction as the NEW→MIDDLE move (NEW: 100 standing, 0 kills → MIDDLE: 199 standing, 1 kill).
- **(b/e3ef) place-line fix: INERT.** 0/8 seeds move on any field. The L5/L6 daily rows, fallen lists, and wave-kill logs are identical on all 8 seeds — the place-line fix changes no trajectory the band can see. This confirms the e18f arm's indirect read directly, as the prereg anticipated. The first-divergence readings of d44/d52/d62/d80 on the four dead seeds are the closing-duplicate artifact (the final day's snapshot vs the closing snapshot), not real divergences — the daily arrays are byte-identical.

**(c) MIDDLE→FIFTH suspect set: NOT RUN — filed as the next arm.** (a) and (b) are judged; per the prereg, (c) legs were not pre-specified and are filed as the next arm rather than run un-preregistered. The freeze, the extraction tooling, and the proof are all committed and reusable — the next arm needs only a (c) prereg + legs (the four suspects in `8419eefa4`→`0fcff01ea`: `5e190b6ef`, `48c93b22b`, `ae7daf40c`, `1cc46630c`).

## The frozen band (F0, master `fd306cac1`)

| seed | days / end | standing | maxWave | seat | w4 kills / faced | fallen | living | pantry | veterans | mechanism (frozen) |
|---|---|---|---|---|---|---|---|---|---|---|
| 53011 | 150, survived | 784 | 5 | lesser d90 | 12 / 8 | 14 | 5 | 9,100 | 1/2 | combat-led |
| 53012 | 44, village-lost | 125 | 4 | none | 0 / 1 | 9 | 4 | 0 | 0/2 | starvation-led |
| 53013 | 150, survived | 370 | 5 | lesser d90 | 3 / 5 | 9 | 7 | 6,697 | 0/2 | combat-led |
| 53014 | 82, village-lost | 325 | 5 | none | 4 / 6 | 14 | 0 | 0 | 0/2 | combat-led |
| 53015 | 150, survived | 199 | 4 | lesser d109 | 0 / 1 | 1 | 11 | 16,832 | 0/2 | combat-led * |
| 53016 | 150, survived | 384 | 5 | lesser d90 | 3 / 3 | 9 | 8 | 9,531 | 0/2 | combat-led |
| 53017 | 150, survived | 199 | 4 | lesser d90 | 2 / 7 | 15 | 8 | 11,390 | 1/2 | combat-led |
| 53018 | 150, survived | 199 | 4 | lesser d90 | 3 / 6 | 16 | 8 | 10,758 | 1/2 | combat-led |

\* 53015 reads combat-led on a single death (Vasyl, contest, d106) — the classifier rule applied mechanically to n=1; the label is technically per-rule but meaningless on one grave (see § Metric review).

The band has real spread — that is what makes it a discriminating instrument: a 12-kill village (53011), a starvation death (53012), a wipeout (53014, living 0), a one-death village (53015), three seeds at exactly 199 standing. F0c reproduces every row above exactly. The unrecorded control (F0b, seed 53011) reproduces the F0 headline exactly (150d, survived, 784, maxWave 5, lesser d90, 12 w4 kills) — G2 PASS, so the freeze is master state, not the recorder. Freeze master note: `0fcff01ea`→`fd306cac1` has zero src/ changes and zero frozen-instrument changes — the freeze runs on the same game code as the fifth shape.

**Fallen, F0 (the frozen reference):** 53011: d17 Patricia (monster), d24 Morris (a stranger), d30 Manuel (the wild), d37 Esperanza (the wild), d55 Eun-ji (the wild), d65 Fatima (a stranger), d68 Quinn (the wild), d68 Elif (the wild), d72 Mara (the arena), d77 Victor (the wild), d80 Lehlohonolo (monster), d80 Chloe (monster), d85 Nino (the wild), d141 Ursula (a stranger). 53012: d24 Oliver (monster), d33 Vincent (the wild), d34 Carolina (the wild), d40 Aria (contest), d40 Kyle (the arena), d40 Humu (starvation), d43 Yara (starvation), d43 Aroha (sickness), d44 Isaac (starvation). 53013: d36 Otto, d70 Penelope, d73 Alejandro, d74 Mateo, d82 Palani, d101 Adaeze (all the wild), d112 Diana (thirst), d122 Noella (the arena), d142 Ella (the arena). 53014: d11 Carlos (ambush), d29 Tom, d42 Mariana, d54 Mia (Ugly-Eyes), d56 LaToya, d61 Eamon (monster), d62 Mateo, d72 Kwame, d75 Benoit (betrayal), d78 Bruno (monster), d80 Dina (monster), d82 Ruth, d82 Brunhilde (a stranger), d83 Hao (all the wild unless noted). 53015: d106 Vasyl (contest) — the only grave. 53016: d14 Aroha (ambush), d25 Katarina (a wound that wouldn't close), d69 Kwame (The Reunion), d70 Maeve, d74 Monique (the wild), d76 Elif (monster), d77 Axel (contest), d93 Bilal (the wild), d128 Elena (contest). 53017: d10 Sari (ambush), d29 Valentina, d30 Yaretzi (The Reunion), d41 Vikram, d42 Gunther, d50 Wei (monster), d50 Abiodun (a wound that wouldn't close), d61 Carlos, d62 Pavel (betrayal), d63 Devon, d63 Emma, d64 Rana, d64 Olivia (the wild), d83 Marisol (the arena), d114 Elijah (the arena). 53018: d16 Chidubem (Night Court), d18 DeShawn (Grief Counselor), d20 Lena (ambush), d31 Wanjiru (monster), d58 Arturo, d62 Miguel, d63 Marcelino (combat), d76 Bessie (a stranger), d78 Daniyar (monster), d80 Adrián, d82 Valter (monster), d84 James, d89 Nikos (the arena), d96 Kuzma (combat), d96 Zoe (combat), d96 Olivia (the arena).

## Pair (a): fightblend, L1 (pre, `93e7bea26`) vs L2 (fix, `3f405ff78`)

Per-seed endpoints (standing / w4 kills / fallen; direction D = standing↓, w4↓, fallen↑):

| seed | L1 pre | L2 fix | moves (st / w4 / fallen) | seed verdict |
|---|---|---|---|---|
| 53011 | 150d surv, 194, 0, 12 | 62d lost, 199, 2, 13 | 0 / +1 / +1 | none |
| 53012 | 150d surv, 424, 3, 15 | 44d lost, 125, 0, 8 | −1 / −1 / −1 | none |
| 53013 | 63d lost, 199, 2, 8 | 65d lost, 199, 0, 7 | 0 / −1 / −1 | none |
| 53014 | 82d lost, 285, 4, 11 | 52d lost, 175, 2, 13 | −1 / −1 / +1 | **with** |
| 53015 | 68d lost, 199, 2, 13 | 150d surv, 545, 4, 13 | +1 / +1 / 0 | **against** |
| 53016 | 150d surv, 199, 4, 16 | 86d lost, 184, 1, 16 | −1 / −1 / 0 | **with** |
| 53017 | 150d surv, 199, 2, 11 | 52d lost, 135, 0, 6 | −1 / −1 / −1 | none |
| 53018 | 81d lost, 175, 0, 11 | 150d surv, 309, 4, 8 | +1 / +1 / −1 | **against** |

**Verdict: MIXED (with=2, against=2, none=4).** First divergences L1/L2: d8, d6, d10, d5, d16, d11, d5, d16 — the fix reshuffles every village in the first two weeks, before any wave-4 fight, on every seed. The survival flips tell the story plainly: the fix kills two villages that survived on pre (53016, 53017) and revives two that died on pre (53015, 53018). The OLD→MOVED direction is not in this commit on the band: OLD had standing 584 / 5 kills / 4 fallen and MOVED 199 / 2 / 9, and the fix moves the band both toward and away from that shape at once. Fightblend is neither fingered nor exonerated as the single mover — the OLD→MOVED step, if it has a single-committer, is not this commit alone, or the step itself is a multi-commit reshuffle the single-seed chain kept misreading as one move.

## Pair (b/b98f): secret-response, L3 (`992888172`) vs L4 (`b98ac0730`)

Per-seed endpoints; pair direction read off the data = standing↑ + w4↑ (fallen tied 4 up / 4 down, no direction):

| seed | L3 pre-secret | L4 secret | moves (st / w4 / fallen) | seed verdict |
|---|---|---|---|---|
| 53011 | 150d surv, 199, 4, 16 | 66d lost, 199, 0, 15 | 0 / −1 / −1 | none |
| 53012 | 44d lost, 125, 0, 8 | 44d lost, 125, 0, 9 | 0 / 0 / +1 | none |
| 53013 | 65d lost, 199, 0, 7 | 62d lost, 284, 3, 4 | +1 / +1 / −1 | **with** |
| 53014 | 79d lost, 199, 3, 19 | 82d lost, 325, 4, 14 | +1 / +1 / −1 | **with** |
| 53015 | 111d lost, 199, 1, 18 | 150d surv, 495, 5, 13 | +1 / +1 / −1 | **with** |
| 53016 | 150d surv, 669, 4, 13 | 150d surv, 559, 6, 15 | −1 / +1 / +1 | none |
| 53017 | 62d lost, 135, 0, 6 | 148d lost, 695, 12, 26 | +1 / +1 / +1 | **with** |
| 53018 | 150d surv, 159, 0, 12 | 150d surv, 199, 3, 16 | +1 / +1 / +1 | **with** |

**Verdict: MOVER (with=5, against=0, anyMove=8).** First divergences L3/L4: d11, d29, d21, d9, d18, d75, d15, d9. Two trajectory notes: 53012 is inert on standing/w4 (its first divergence is d29 and its fallen list gains one late grave — the fix touches that road only in the final days), and 53016's first divergence is d75 — the latest first effect in the whole arm, week 11. The fix's direction is up: total band wave-4 kills 12 → 33, total standing 1,955 → 3,036. The conversation-branch change (a confession now gets an answer instead of dead-ending) re-routes seeded streams toward stronger villages on 5 of 8 seeds — the same class as the fingered dedupe, and the first conversation fix to show a consistent band-level direction.

## Pair (b/e3ef): place-line, L5 (`5582c19b9`) vs L6 (`e3ef2b612`)

| seed | L5 pre-place | L6 place | moves |
|---|---|---|---|
| 53011 | 62d lost, 199, 2, 14 | 62d lost, 199, 2, 14 | none |
| 53012 | 44d lost, 125, 0, 8 | 44d lost, 125, 0, 8 | none |
| 53013 | 65d lost, 199, 0, 7 | 65d lost, 199, 0, 7 | none |
| 53014 | 80d lost, 345, 3, 19 | 80d lost, 345, 3, 19 | none |
| 53015 | 150d surv, 754, 11, 8 | 150d surv, 754, 11, 8 | none |
| 53016 | 150d surv, 539, 7, 12 | 150d surv, 539, 7, 12 | none |
| 53017 | 52d lost, 135, 0, 6 | 52d lost, 135, 0, 6 | none |
| 53018 | 150d surv, 159, 0, 12 | 150d surv, 159, 0, 12 | none |

**Verdict: INERT (with=0, against=0, anyMove=0).** Daily rows, fallen lists, and wave-kill logs are identical on all 8 seeds. The place-line fix (a dry place-share line now speaks) changes no trajectory the band can see — the e18f arm's indirect read is now a direct one.

## Cross-leg note (UNJUDGED context, not a verdict — no preregistered bar)

L3 (`992888172`, src == `e18f72dce` src) vs L5 (`5582c19b9`, src == `ba21ca026` src) differ only in the e18f food rung (food.js +22). Their band endpoints: 3 seeds headline-identical (53012, 53013, 53018 — 53018's daily rows are identical, first divergence null), first divergences d14–d32 elsewhere, and one big flip: 53015 dies d111 on L3 (199, 1 kill) and survives 150d on L5 (754, 11 kills). The food rung moves endpoints on the band even though the e18f arm found it authored only the d17–d20 opening on 53007 before re-converging to NEW. That 53007 finding stands for 53007; the band observation says the rung is not inert in general. A food-rung before/after ON THE BAND is the owed arm if anyone wants it proven — this arm does not finger it (no preregistered bar for L3/L5).

## Village assessment — what the villages looked like

The band's eight villages are eight different games. 53011 is the killer village: Ursula Weber alone puts down eight wave-4 monsters by hand (Eater, Strike, Suburb, Influencer, Reunion, Algorithm among them) and the village still ends with five people alive, standing 784, one veteran short of wave 5. 53012 is the hunger death: the village starves in six weeks — three starvation graves in the last four days, pantry at zero, the same road on four different trees (F0, L3, L4, L5 all read 44d, 125, 0 kills; L3/L4 differ only in the last two days' graves). 53014 is the wipeout: fourteen dead by day 82, living zero, four wave-4 kills banked on the way down. 53015 is the peaceful village: one death in 150 days (Vasyl, in a contest on day 106), eleven people alive, a full pantry — and zero wave-4 kills, one faced, the door to wave 5 shut on an empty veterans bar. The fix trees tell the other side of the same coin: on L4, 53017 kills twelve wave-4 monsters — a single scholar puts down four in four days — and still dies at day 148 with nobody left alive, twenty-six graves, the wild taking nine. Kills and survival decouple completely there. And on L4, 53015 is the one wave-5-ready village in the whole arm: all four readiness bars met (armored 6/4, armed 8/6, tricks 22/3, veterans 3/2), five wave-4 kills, 150 days survived — the only `ready: true` in 56 leg-seeds. The doorwalk leg never walks a door, so no wave-5 facing is observed; readiness is the report, not a facing.

**Sense-test (seed 53011, F0 transcript).** The mourning beats cohere and the names rotate correctly; the d65 Fatima sequence reads as cause and consequence (stranger's killing → "The village stops. Somebody screams. Somebody else starts digging." → keepsakes buried → "The village's quarrel was with Fatima — and Fatima is dead. The sentence doesn't cross the grave."). One line reads off: "At the grave, Maureen, Elif, Victor and 2 more speak for Quinn" at Fatima's grave — the grave speakers are named for Quinn, not for Fatima, which reads like a template naming the wrong person (named, not a verdict). The grief-card beat repeats verbatim across villages (Thornfield/Ashford/Stonebridge install speakers; "the grief card is spent. Tribute stays at 9,000 kcal/week") — coherent but formulaic, three times on d55/d65/d85. The System's "Your understanding is... deepening!" praise line repeats verbatim d9/d10/d13/d56/d60. The pellet is gained d29 ("FUSION REACTOR: the pellet goes in — properly, inside you") and the same day a pass is narrated (Manuel → Esperanza, "the pellet moved to hungrier hands") while diag records holder "player" from d29 with passDay 29 — install and pass on the same day sit in tension; a future instrument arm should check whether the pass line and the holder field agree. Thumbnails trailer lines recur ×6 on this road (bisect-b ×20, reask ×17 — trajectory-dependent, not fixed). Sam of The Red Table begs zero times (trajectory-dependent, not fixed). deathSays hits its 400 cap; its first entries are deadfall-gathering lines (the known `deadfall` filter quirk).

## Wall numbers (this run — doorwalk baseline leg, 8 seeds per leg)

- National 0/8 on every leg; wins 0/8 on every leg (baseline leg never walks a door, by design).
- Lesser seats: F0 6/8, L1 4/8, L2 2/8, L3 4/8, L4 3/8, L5 3/8, L6 3/8.
- Wave-4 unlocks 8/8 on every leg; wave-5 unlocks (maxWave 5): F0 4/8, L1 2/8, L2 2/8, L3 1/8, L4 5/8, L5 3/8, L6 3/8.
- Wave-5 readiness (`readiness5.ready`): F0 0/8, L1 1/8, L2 1/8, L3 0/8, L4 1/8 (53015, veterans 3/2), L5 2/8 (53015 vet 3, 53016 vet 2), L6 2/8.
- Median survival (days): F0 150, L1 116, L2 63.5, L3 95, L4 115, L5 72.5, L6 72.5.
- Wave-4 kill link (kills / faced types, band totals): F0 27/37, L1 17/42, L2 13/29, L3 12/36, L4 33/45, L5 23/41, L6 23/41.
- The veterans bar is the binding number on the freeze: 0/8 wave-5-ready, best 1/2 living veterans (53011, 53017, 53018). On L4/L5 the bar clears on 53015 (3/2) — the fix trees, not the freeze, hold the only ready villages.
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.
- Balanced panel (§15): not run — DIAG recorder corpora; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).

## Proof

`node scripts/test-bandfreeze-b.js` — **130 passed, 0 failed, 0 skipped** (run after all corpora were committed-present):

- G1 det-gate — PASS on fixtures + committed corpora (arena + Hushpuppy classifier fixtures, headline-predicate synthetics incl. the ±5 standing boundary, band-rule synthetics: FINGERED 6/8, EXONERATED 0/8, MIXED 3-with-1-against, single-field-moves-never-finger, standing ±5 tolerance boundary at −6/+4, pair-(b) MOVER/INERT/MIXED synthetics, endpointsEqual exactness; first-divergence synthetics; committed 53007-a/bisect-b/fightblend-b/attrib-b/reask-b corpora read old/moved/new/middle/other respectively).
- G2 neutrality — PASS on the F0/F0b pair (seed 53011, armed == unrecorded, same master `fd306cac1`, all headline fields + fallen + waveKillLog identical) and on synthetic pairs (stripDiag neutral; one-life drift fails).
- G3 integrity — PASS on all 65 new corpora (rows span d2..`gameDays`, diag on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed). The F0c stability legs PASS on all 8 seeds (endpoint == F0 endpoint, exact — the only differing key between F0 and F0c files is `run`).
- The three pair verdicts are PASSING legs, not failures: MIXED (a), MOVER (b/b98f), INERT (b/e3ef) — the proof verifies each verdict is computed from the committed corpora under the preregistered rule.

## GO bars (binding)

1. Freeze complete: 8/8 band seeds on `fd306cac1` with full daily corpora + end snapshots (F0), plus the 53011 unrecorded control (F0b) and the 8-seed re-verification (F0c) — **MET** (65 corpora, 0 instrument errors).
2. Freeze STABLE: F0c reproduces F0 exactly on every binding field, every seed — **MET** (8/8 exact; DIAG-STOP did not fire).
3. Pairs (a) and (b) judged against the band rule — **MET** ((a) MIXED, (b/b98f) MOVER, (b/e3ef) INERT).
4. G1 det-gate — **PASS** (proof 130/0/0).
5. G2 recorder neutrality — **PASS** on the F0/F0b pair.
6. G3 corpus integrity — **PASS** on every new corpus in `perseed-bandfreeze-b/`.

## Method note

- CANON.md read first; MONSTER-WAVES.md for the wave/fight context (wave-4 gate standing ≥ 100; wave-5 gate standing ≥ 200 AND wave-4 faced; "Monster encounters are fought, not rolled"). AGENTS.md (repo house rules) read. MEASUREMENT.md §§9–12, 14–15 read. No canon doc covers seed attribution — the question was answered from measurement.
- Base verified with `git log --oneline -1` = `fd306cac1` before any judged work. Freeze master range `0fcff01ea`→`fd306cac1`: zero src/ changes, zero frozen-instrument changes (evidence/scripts only).
- Freshness re-check (before the prereg): 679 preregs + all evidence .md + scripts + corpus filenames searched for 53011–53018 — the only hits are the reservation itself (reask prereg/evidence + 1739Z round note); zero prior use. Collisions avoided: 53101–53108, 53201–53212, 53701–53712. No forbidden-band list file exists in `evidence/`.
- Git-archive extraction, NOT old-SHA checkout: `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C scratch-bandfreeze-<leg>/`, frozen instruments overlaid from the current tip, scratch dirs under the worktree (deleted after use — reproducible from `git archive`). Code identity verified per leg by `game.js` hash match against the commit blob (all six legs: `cd5416e93f28ef84dd6cb7af1c2fd7c349e38475`) AND the distinguishing file per pair (fieldFights.js pre `fc1df549…` vs fix `88517ddf…`; conversation.js pre `53de6247…` vs fix `cd071d5e…`; villager-agency.js pre `14e3316b…` vs fix `dc1231db…`), each matching its blob; overlaid instruments hash-match HEAD. 2-day smokes passed on all six extracted trees (0 errors) before any judged seed.
- Flap: probe-gated every git write; probes passed throughout (prereg commit ~19:44Z; no write was refused, no retry observed on corpus writes). Corpus writes went through the retry preload (`scripts/flap-retry-preload-bandfreeze-b.js`, worktree-local, never committed, deleted after use — unique temp + rename + read-back verify, 180 × 2s retries).
- Safe-commit index clobber struck the prereg commit (file showed staged-deleted with the worktree copy intact) — repaired via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, hash-object matched the HEAD blob before repair, status clean + `git diff HEAD` empty after.
- L2 incident (recorded honestly): the first L2 background process vanished after 5/8 seeds with its session cleared (no driver process running, no error, 5 corpora on disk intact). The remaining 3 seeds (53016–53018) were run with the same RUN on the same tree — the driver refuses to overwrite, so the resumed run covered only the missing seeds. All 8 L2 corpora are from the same extracted tree (`3f405ff78`) with the same instruments; the resume is a process restart, not a re-run.
- The corpus `anchorCommit` reads the worktree tip (the prereg commit `0be275a65`), not `fd306cac1` — the known anchor quirk; the SHA under test is recorded here (`fd306cac1` for F0/F0b/F0c; `93e7bea26`/`3f405ff78`/`992888172`/`b98ac0730`/`5582c19b9`/`e3ef2b612` for L1–L6).
- Code identity: the F0 legs used the worktree's `src/` directly at `fd306cac1`; `git diff HEAD -- src/` is empty (no game-code change). No game-code change anywhere in this arm. `git diff HEAD -- src/` is empty.
- (c) was not run: the prereg binds no (c) legs; running them would be un-preregistered work under §11. Filed as the next arm.

## Metric review

- The primary metric is the per-seed headline + the band-rule verdict, judged against the decision tree — and the tree held: fightblend's MIXED is reported as unjudged (neither fingered nor exonerated), never forced; b98f's MOVER is exactly at the bar (5/8 with, 0 against) and is reported with its scope (a band-level mover, not a proven cause of the single-seed NEW→MIDDLE step); e3ef's INERT is exact (0 moves, byte-identical daily rows).
- The band rule's tolerance did real work: on pair (a), 53012 and 53017 each move 2 fields in D but carry a third field moving opposite (fallen down where D wants up) — both read 'none', not 'with'. Without the no-opposite clause, the pair would have read 4-with/2-against and still MIXED, but the seed-level discipline is what keeps a 2/2 split from ever looking like a finger. On pair (b), the fallen field tied 4–4 and dropped out of the pair direction entirely — the rule reads direction off the data rather than assuming it, which is why 53016 (standing down, kills up) reads 'none' instead of 'against'.
- The freeze-stability bar (exact match, no tolerance) proved load-bearing in the other direction: the F0/F0c files differ only in the `run` key, which is the strongest stability result this chain has produced — the determinism premise (identical code + instrument + seed reproduces exactly) now holds on an 8-seed band, not just the lead seed.
- The mechanism label is not a binding field, and this arm shows why it should stay that way: 53015/F0 reads combat-led on a single grave (1/1 violent), and 53012 reads starvation-led on every leg while its village is also combat-bled. Labels on n=1 or on mixed-cause villages are descriptions, not verdicts. The frozen-rule label is reported alongside the corrected rule; neither judged anything.
- First-divergence artifact (named, not hidden): on the four dead seeds of L5/L6, the first-divergence helper returns the final day (d44/d52/d62/d80) because the closing snapshot duplicates the final day with a recomputed diag — the daily arrays are byte-identical, so there is no divergence. The `rowsEqualOnDays` helper (first-row-per-day) exists for exactly this; future first-divergence reads should use it, not the naive helper. It does not affect any judgment here (the e3ef verdict rests on the endpoint fields, which are identical).
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged. The one wave-5-ready village (53015/L4, veterans 3/2) is readiness, not a facing — the leg cannot show a wave-5 fight.
- Classifier notes carried (unchanged): `'the arena'` registered VIOLENT in this arm's classifier (as e18f/reask did); the frozen analyzer still keys `'arena'`. Monster-name causes (`'Hushpuppy'`, `'Ugly-Eyes'`, `'Night Court'`, `'Grief Counselor'`, `'The Reunion'`) are unmapped in both maps and sit in OTHER — the gap now appears on 4 band seeds (53014, 53016, 53017, 53018), not just 53007. The `deathSays` filter still catches "deadfall" (first deathSays entries are deadfall-gathering lines, not deaths). Neither affected any judgment.
- The kill link vs survival decoupling (53017/L4: 12 kills, village dead d148; 53015/F0: 0 kills, village alive 150d) is a metric warning for the chain, not a verdict item: kills and survival move independently on this band, so a future arm that judges winnability by kills alone would misread both villages. The band table carries both numbers for that reason.

## Findings for the backlog

- **BAND FROZEN + STABLE (the instrument now exists).** Seeds 53011–53018, frozen at `fd306cac1` (F0 table above), re-verified byte-identical modulo the leg label. Re-freeze whenever master moves under it; never assume stable. Next use: the (c) MIDDLE→FIFTH suspect set.
- **(a) fightblend MIXED on the band (2 with, 2 against, 4 none).** The OLD→MOVED step has no consistent single-commit direction on the band. The single-seed attribution question is answered as far as the band can answer it: no finger. A multi-commit or interaction explanation for OLD→MOVED remains open but is not this arm's to claim.
- **(b/b98f) MOVER (5/8 with, 0 against).** The conversation secret-response fix moves band endpoints consistently up (standing + wave-4 kills; band kills 12 → 33). Prime mover for the NEW→MIDDLE step on band evidence; the single-seed NEW→MIDDLE causation is still unproven (the band has no NEW/MIDDLE reference) — a 53007 L1/L2 re-ask against a re-frozen band would be the wrong instrument; the band verdict is the verdict.
- **(b/e3ef) INERT (0/8 move, byte-identical daily rows).** The place-line fix changes no trajectory the band can see. The e18f indirect read is now direct. Close this suspect.
- **(c) MIDDLE→FIFTH suspect set, unrun.** The four src commits in `8419eefa4`→`0fcff01ea` — `5e190b6ef` (truth.js coach deflect), `48c93b22b` (game.js medic-duty widen, most plausible alongside the coach fix — the fifth-shape divergence opened with a d4 sickness difference), `ae7daf40c` (convo-wants.js first-reveal guard), `1cc46630c` (progression.js feast tooltip). Next arm: prereg + legs on the frozen band.
- **Food rung moves band endpoints (unjudged cross-leg observation).** L3 vs L5 differ only in the e18f food rung; 53015 flips from death d111 (199, 1 kill) to survival 150d (754, 11 kills), 53011 flips the other way, 3 seeds headline-identical. The 53007 e18f finding (rung authored only the d17–d20 opening, then re-converged to NEW) stands for 53007; the band says the rung is not inert in general. Owed arm: a food-rung before/after ON THE BAND, preregistered.
- **Kill/survival decoupling (53017/L4).** 12 wave-4 kills, standing 695, village dead d148 with living 0 and 26 fallen. The kill link is not survival. Future winnability arms must carry both numbers (this arm's tables do).
- **Wave-5 readiness on the band: 0/8 frozen, 1/8 on L4, 2/8 on L5/L6.** The only ready village is 53015/L4 (veterans 3/2, all bars met). The veterans bar is the binding number on the freeze (best 1/2) — the chain's binding link, same as on the lead seed.
- **Monster-name-cause gap, now band-wide.** `'Ugly-Eyes'`, `'Night Court'`, `'Grief Counselor'`, `'The Reunion'` (and `'Hushpuppy'` on 53007) sit in OTHER under both VIOLENT maps. A future instrument arm should register monster-name causes (or map cause→monsterId) in the shared analyzer with a proof refresh; never silently bucket.
- **Classifier gap (carried):** `'the arena'` registered VIOLENT in this arm's classifier; the frozen analyzer still keys `'arena'`.
- **Pellet d29 tension (53011/F0, sense-test).** The pellet is installed in the scholar ("inside you") and passed Manuel→Esperanza on the same day, while diag records holder "player" from d29 with passDay 29. A future instrument arm should check whether the pass line and the holder field agree.
- **Grave-speaker naming (53011/F0, sense-test).** "At the grave, Maureen, Elif, Victor and 2 more speak for Quinn" at Fatima's grave — the speakers are named for Quinn, not for Fatima. Template-naming question, not a verdict.
- **Grief-card / System-praise repetition (53011/F0, sense-test).** The grief-card beat repeats verbatim across villages (3× d55/d65/d85); "Your understanding is... deepening!" repeats d9/d10/d13/d56/d60. Coherent but formulaic — the same template texture as the 53007 chain.
- **Thumbnails ×6 recurs on this road** (bisect-b ×20; reask ×17) — trajectory-dependent, not fixed; keep the finding open.
- **Sam's begging ×0 again** — trajectory-dependent, not fixed; keep the finding open.
- **53012 is the band's control seed.** Same headline (44d, 125, 0 w4 kills) on F0, L3, L4, and L5; only the last two days' graves differ between trees. A village that starves in six weeks no matter which conversation or fight code runs — the hunger-scattering shape, stable across four trees.
- **First-divergence closing-duplicate artifact.** On dead seeds, the naive first-divergence helper returns the final day because the closing snapshot duplicates it with a recomputed diag. Use the first-row-per-day helper (`rowsEqualOnDays`) for first-divergence reads. It did not affect any judgment here.
- **L2 background-process loss (infrastructure note).** The first L2 run vanished after 5/8 seeds with its session cleared and no error; the 5 corpora on disk were intact and the remaining 3 seeds were run with the same RUN on the same tree. Process loss does not lose corpora; the resume path (missing seeds only, same RUN) works because the driver refuses to overwrite.

## Convergence state

scale-onramp stays **converging** (NOT converged): the band is frozen and stable and three pair verdicts are now judged on it — fightblend MIXED (not fingered, not exonerated), b98f a band-level MOVER, e3ef INERT — but the scale wall itself has not moved on the freeze: national 0/8, wins 0/8, wave-5-ready 0/8, median survival 150d on a leg that never walks a door. The next blanks, in order: (1) the (c) MIDDLE→FIFTH suspect set on the frozen band (prereg + legs); (2) a food-rung before/after on the band (L3/L5 observation, unjudged); (3) the wave-4 kill link at 27/37 faced on the freeze, with wave 5 held open by the veterans bar (0/2 best 1/2), is the chain's binding number — the veterans bar, not the kill count, is what a build arm should attack next.

## Adoption handoff

1. **Verdict: BAND FROZEN + (a) MIXED / (b/b98f) MOVER / (b/e3ef) INERT.** Fightblend is neither fingered nor exonerated for OLD→MOVED (2 with, 2 against, 4 none on the band). The secret-response fix `b98ac0730` moves band endpoints consistently up (5/8 with, 0 against; band kills 12 → 33). The place-line fix `e3ef2b612` is inert (0/8 move, byte-identical daily rows) — direct confirmation of the e18f indirect read.
2. **Freeze: 53011–53018 at `fd306cac1`, STABLE.** F0c reproduces F0 exactly on all 8 seeds (only the `run` key differs). Endpoints: 53011 150d/784/12 kills; 53012 44d died/starvation; 53013 150d/370/3; 53014 82d died/living 0; 53015 150d/199/0 kills/1 fallen; 53016 150d/384/3; 53017 150d/199/2; 53018 150d/199/3. G2 PASS (53011 control), G3 PASS (65/65 corpora), proof 130/0/0.
3. **(c) NOT RUN — filed as the next arm** (prereg binds no (c) legs; freeze + tooling + proof are committed and reusable). Suspects: `5e190b6ef`, `48c93b22b`, `ae7daf40c`, `1cc46630c`.
4. **Wall numbers (freeze):** national 0/8, lesser seats 6/8, wins 0/8, wave-4 unlocks 8/8, wave-5 unlocks 4/8, wave-5-ready 0/8, median survival 150d, kill link 27/37 faced.
5. **Notable roads:** 53017/L4 kills 12 wave-4 monsters and still dies d148 with 26 fallen (kill/survival decoupling); 53015/L4 is the only wave-5-ready village in the arm (veterans 3/2); 53012 starves at d44 on four different trees (the band's control seed); 53015/F0 survives 150d with one death and zero wave-4 kills.
6. **Proof:** 130 passed, 0 failed, 0 skipped. G1/G2/G3 all PASS on everything that ran.
7. **Findings backlog:** fourteen items under § Findings for the backlog above (band frozen; fightblend MIXED; b98f MOVER; e3ef INERT; (c) unrun; food-rung observation; kill/survival decoupling; wave-5 readiness; monster-name-cause gap band-wide; 'the arena' gap carried; pellet d29 tension; grave-speaker naming; grief/praise repetition; Thumbnails ×6; Sam ×0; 53012 control seed; first-divergence artifact; L2 process-loss note).
8. Worktree `~/workspace/worktrees/sim-bandfreeze-b`, branch `sim-bandfreeze-b`. No game-code trace: prereg + proof + 65 corpora + this evidence. Scratch dirs + helper scripts deleted after use (never committed). No flap-retry preload committed. L2 resumed after a lost background process (5/8 + 3/8, same RUN, same tree).
