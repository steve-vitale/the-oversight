# More reseed burn offsets — evidence (arm sim-burnoffsets-a)

Loop A run fleshout-20261113T0715Z, axis scale-onramp. The 0515Z run's next blank #2.
Prereg: `evidence/2026-11-13/sim-burnoffsets-a-prereg.md` (committed before any judged sim).
Base: current master tip `f7352f946`. Instrument-only arm: zero `src/js` changes.

## Verdict

**NO STREAM SAVES A GAP SEED (5 offsets sampled).**

Per the pre-registered run rule, ANY offset GO → "A STREAM SAVES A GAP SEED";
none GO → this verdict. GAP-NOT-DICE stands and hardens. The stream question is
parked after 6 sampled offsets (997 + 1 + 13 + 251 + 499 + 1999); the next run
works tendexact × stream-shift or a design mechanism.

| leg | verdict | gap saved | baseline survivor lost | median (base 139) | starvation (base 0) | survived | wave 5 |
|-----|---------|-----------|------------------------|-------------------|---------------------|----------|--------|
| b0 baseline | BASELINE | — | — | 139 | 0 | 1/8 | 1/8 |
| b1 | NO_GO | none | 190395 | 129 ✓ | 0 ✓ | 3/8 | 2/8 |
| b13 | NO_GO | 190392 | 190395 | 127 ✓ | 1 ✓ | 1/8 | 1/8 |
| b251 | NO_GO | 190392 | 190395 | 126 ✓ | 2 ✓ (= allowance) | 1/8 | 1/8 |
| b499 | NO_GO | none | 190395 | 144 ✓ | 0 ✓ | 3/8 | 4/8 |
| b1999 | NO_GO | none | none | 139 ✓ | 0 ✓ | 1/8 | 2/8 |

The binding conjuncts were the gap-save and the no-regression rule, never the
median or starvation guards (see §Metric review). The gap save and the
survivor-keep never coincide on one stream: b13 and b251 save 190392 but lose
190395; b1999 keeps 190395 but saves no gap seed; b1 and b499 save neither.
Gap seed 190394 is saved by NO offset (0/6 across 997 + 1 + 13 + 251 + 499 +
1999; outcomes d72 (997), d52, d137, d100, d143, d67).

Wall numbers on every leg: national 0/8, table 0/8, wins 0/8. Deaths are
combat-dominated on all six legs (villager combat 254–298 of 600–637 per leg).

## Per-seed table (days / outcome / standing / maxWave)

Median is the analyzer's upper median (sorted days, index n/2). Horizon 150d
death-aware (+10d tail); "SURV" = survived to horizon.

| seed | b0 base | b1 | b13 | b251 | b499 | b1999 |
|------|---------|----|-----|------|------|-------|
| 190391 | 65d lost / 145 / w4 | 129d lost / 199 / w4 | 127d lost / 199 / w4 | 131d lost / 199 / w4 | 141d lost / 465 / w5 | 139d lost / 340 / w5 |
| 190392 | 143d lost / 199 / w4 | 128d lost / 199 / w4 | **150d SURV / 199 / w4** | **150d SURV / 199 / w4** | 136d lost / 390 / w5 | 145d lost / 199 / w4 |
| 190393 | 126d lost / 199 / w4 | **150d SURV / 199 / w4** | 147d lost / 199 / w4 | 116d lost / 265 / w5 | **150d SURV / 199 / w4** | 139d lost / 199 / w4 |
| 190394 | 128d lost / 199 / w4 | 52d lost / 150 / w4 | 137d lost / 500 / w5 | 100d lost / 199 / w4 | 143d lost / 325 / w5 | 67d lost / 125 / w4 |
| 190395 | **150d SURV / 199 / w4** | 122d lost / 435 / w5 | 105d lost / 199 / w4 | 115d lost / 199 / w4 | 93d lost / 199 / w4 | **150d SURV / 350 / w5** |
| 190396 | 140d lost / 199 / w4 | **150d SURV / 199 / w4** | 94d lost / 190 / w4 | 126d lost / 199 / w4 | **150d SURV / 330 / w5** | 85d lost / 125 / w4 |
| 190397 | 135d lost / 199 / w4 | 84d lost / 199 / w4 | 118d lost / 199 / w4 | 114d lost / 199 / w4 | 144d lost / 199 / w4 | 126d lost / 199 / w4 |
| 190398 | 139d lost / 370 / w5 | **150d SURV / 380 / w5** | 127d lost / 199 / w4 | 132d lost / 199 / w4 | **150d SURV / 199 / w4** | 116d lost / 199 / w4 |

Notes:
- Baseline measured fresh on f7352f946 is much weaker than the far end's 4/8:
  190393 and 190397 lost on master though they survived on both far end and
  pole; 190395 is the baseline's ONLY survivor, so the no-regression conjunct
  is a single-seed test on this run.
- 190391 improves under every burn (d65 → d127–d141) but never survives.
- Standing is not survival: the three highest standings in the run all lost
  (b13 190394 standing 500 d137; b1 190395 standing 435 d122; b499 190391
  standing 465 d141). Standing parks at 199 on 29 of 48 seed-runs.
- b499 reaches wave 5 on 4/8 — the widest wave-5 spread — and still saves no
  gap seed and loses the baseline survivor.

## Deep-identity comparison (pre-registered method)

Method (0515Z §0): per-day 4-field signature (vetsW3, vetsW4, waveKillLog
length, roster length) + full daily-snapshot deep-diff, snapshots paired
INDEX-ALIGNED, never day-keyed. Script: `/tmp/burnoffsets-deepdiff.js`
(recreated after the runtime restart wiped /tmp; copy kept in goal
hidden_files for the next run). Log: `evidence/2026-11-13/burnoffsets-a-deepdiff.log`.

Result: **every burn leg diverges from the baseline on all 8 seeds — 40/40
seed-legs moved, zero deep-identical seeds anywhere.**

- First deep-diff is day 2 on most seeds (the very first snapshot): the
  differing fields are `ready4/ready5 armed/armored` counts — the burn shifts
  even the earliest gear/assignment draws. The roster itself is identical at
  the first snapshot (world identical, play dice shifted, exactly as designed).
- First 4-field signature divergence is day 4–10 on every seed-leg (waveKillLog
  length / kill identity first — e.g. b1 190391: base waveKillLog[0] is
  `ducks_in_a_row` d4 via agency, leg is `rut_king` d5 via wild).
- Snapshot counts differ on every seed-leg (loss days differ), so the
  trajectories never re-converge.

The stream shift is total from day 2 onward, yet it saves neither gap seed
while keeping the baseline survivor. Sensitivity is proven; leverage is not.

## The burn legs in detail (what the stream shift actually did)

- **b1 (NO_GO):** saved neither gap seed; lost 190395 (d122, w5, standing
  435 — the second-highest standing in the run, lost). Saved 190393, 190396,
  190398 instead (3/8 survived). Fastest wipe in the run: 190394 d52.
- **b13 (NO_GO):** saved 190392 (survived, 47 deaths — the quietest leg-run)
  but lost 190395 d105. 190394 reached standing 500 (highest in the run) and
  still lost d137 at wave 5 — and met the wave-4 veteran bar at peak 3 (see
  §Secondary). Starvation 1.
- **b251 (NO_GO):** saved 190392 but lost 190395 d115. Starvation 2, exactly
  at the allowance (baseline 0 + 2) — the only leg that touches the starvation
  guard. Weakest median (126) but still above 0.8× baseline.
- **b499 (NO_GO):** saved neither gap seed; lost 190395 d93 (fastest loss of
  the baseline survivor on any leg). Best wave-5 spread (4/8) and best median
  (144), 3/8 survived — the strongest leg by every secondary number, and still
  NO_GO on the primary. The clearest proof in the run that stream shifts move
  fates without fixing the gap.
- **b1999 (NO_GO):** the only offset that kept 190395 (survived, w5, standing
  350) — and saved no gap seed. Median exactly baseline (139). The
  survivor-keep and the gap-save are on different streams.

## Secondary fields (reported, not judged)

Script: `/tmp/burnoffsets-secondary.js` (copy in goal hidden_files).
Log: `evidence/2026-11-13/burnoffsets-a-secondary.log`.

- **Peak living wave-4+ veterans vs the bar of 2** (max vetsW4.count over daily
  snapshots): b0 1/8 MET (190398); b1 3/8 (190391, 190395, 190398); b13 1/8
  (190394, peak 3); b251 1/8 (190393); b499 5/8 (190391, 190392, 190393,
  190394, 190396); b1999 2/8 (190391, 190395). Peak-2 does not imply survival:
  b499 met the bar on 5 seeds and survived 3 of them; b13 190394 peaked 3 and
  lost d137. Peak wave-3 veterans run 1–7 across legs (highest: b499 190391
  peakW3=7, lost d141).
- **Tribute-ready:** b1 190398 (ready, 2 veterans, 2 payable — survived);
  b13 190394 (ready, 2 veterans, 1 payable — lost d137). All other 46
  seed-runs: not ready, reason `veterans-short`. Tribute DELIVERY is not
  captured by the instrument — readiness only, no delivery claim.
- **Blooded:** b0 3/8 (392, 395, 398); b1 3/8 (391, 393, 398); b13 2/8 (394,
  395); b251 1/8 (391); b499 1/8 (393); b1999 1/8 (396).
- **Phantom days (corrected definition — live count exceeds shadow = real
  phantom; shadow exceeds live during a collapse = expected, reported not
  judged):** 0 real phantom days on all 48 seed-runs; shadow-over-live also 0
  days everywhere. The vetphantom fix holds on current master.
- **Eater fights on 190394** (substring match on fight records): b0 2, b1 0,
  b13 0, b251 0, b499 2, b1999 1. The Eater barely appears on this seed on
  current master (the far-end pole had 9; the 0515Z 997 reseed had 0). For
  contrast, 190392 Eater fights: b0 7, b1 1, b13 1, b251 0, b499 5, b1999 9.

## Sense-testing (transcripts)

Four corpora read in full (vetSays). No new sim-findings entries filed — each
observation maps to an already-filed finding or to by-design code (reasons
below).

- **b13 190392 — the gap save.** 15 lines, all coherent. The same four fighters
  meet the beasts at the door on d8, d18, d26, d35 (Kofi, Javier, Danylo,
  Meruert — a persistent party, names consistent, counts varying). Veteran kills
  announced on camera (The Redactor d34, Ugly-Eyes d46, The Callback d48, The
  Ugly Beast d56/d81). Wave beats land (Final Draft d25, Mirror Draft d48, ARC
  IV d84). The d71 "FINALES need a NATION" line names the gap honestly — the
  village survived without ever reaching national. The last 15 days pass in
  silence, but the village survived: quiet survival, not a voiceless collapse.
- **b1999 190395 — the kept survivor.** 12 lines, coherent. Wave-5 beats land
  (the Nielsen named d138, the Producers d146). ARC IV d76. Door beats name
  fighters; nothing robotic.
- **b1 190394 — the fast wipe (d52).** Dense, human opening: a stranger (a man
  in his 30s with a scarred cheek) fetches water d1, eats by the fire, refuses
  to listen (trust too low), is overheard, gossips by the fire, and hits a
  language barrier (Hindi, d2). Veteran kills on camera d31–35 (Ad Break,
  Spool, The Redactor). Then silence from d35 to the d52 loss — the final
  collapse passes with ZERO lines. Confirms the already-filed voiceless family
  (voiceless-Eater / voiceless-shortfall), not a new filing.
- **b13 190394 — the standing-500 loss (d137).** Coherent late game with two
  observations, both already covered elsewhere:
  - d100: "The Scarred The Loud Beast (head) falls." fires ~11 times in one
    fight, each with "+20 style" — the (head) label repeats once per segment
    death, so one multi-part beast reads as dying eleven times. This is the
    already-filed tendshift-a finding (combat lines repeat identically 5–14×
    in a single day, which already cites "(head) falls ×7" on baseline 190396
    d26); this run adds the mechanism — the label is per-segment, not per-beast.
  - "Blooded — the village knows where the Producers bleed" fires d107, d114,
    d115, d125. Code-checked before filing: `bloodedLine()` is explicitly "the
    once-per-fight narration" (`src/js/standing.js`, comment at the function)
    gated per fight record (`rec.bloodedTold`, `fieldFights.js`). Four wave-5
    fights in 24 days, one line each — by design, NOT a finding.
  - Same fight (d100): "Your party: just you. You are outnumbered" against a
    14-threat pack while the village has door fighters — the known
    party-formation gap from the fight-play census, not re-filed.
  - The d130 Cold-Blooded ability gain followed by the d135 cold-blooded food
    line is coherent (ability → effect).

## Proof + tooling (what was built this run)

- Tooling commit `74be43d0f` (parent `f7352f946`): prereg + driver + analyzer +
  proof, 4 files, 1101 insertions. Message: "sim-burnoffsets-a: prereg +
  burnoffsets driver/analyzer/proof (62/0 green)".
  - `evidence/2026-11-13/sim-burnoffsets-a-prereg.md`
  - `scripts/burnoffsets-driver-20261113.js` (BURN env 0/1/13/251/499/1999;
    guards: standing sha, policy sha, EMPTY `src/js` diff; RUN
    `burnoffsets-pilot`, corpus `evidence/2026-11-13/perseed-burnoffsets-a-b<N>/`)
  - `scripts/burnoffsets-analyze-20261113.js` (BURN env; judges against the
    MEASURED baseline b0)
  - `scripts/test-burnoffsets-a.js` — **62/0 green**, including a live
    two-process smoke: same seed 131101, burn 0 vs 1, same world day+roster,
    draws shifted by one.
- Substrate shas (verified 2026-11-13): standing.js
  `f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9` (carries
  ROSTER CHECK marker; ladder.js has shared `countLivingVeterans`, scholar
  counts — unlike the far-end LEG 3 rule, so NO fix-swap on this arm);
  sim-harness.js
  `d0447d02939beb80a591b363c6fb3c3d4d0b46244647d26239da47f05c0c8a3a`
  (byte-identical to 0515Z); vetfirst instrument
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`
  (byte-identical to 0515Z). Policy: competent verbatim, current master
  `scripts/policies/competent.js` sha256
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`.
- Burn design re-verified in code on this base: five modules alias
  `Math.random` at load (`betrayal.js:87`, `comms.js:116`, `corruption.js:47`,
  `fieldFights.js:71`, `finale-campaign.js:28`); only in-game `Math.random =`
  is the `_worldRng` save/restore pair (`game.js:11009–11011`); nothing
  re-seeds per day. Burn applied after `setupGame`, before `runDays`.
- All 48 seed-runs: 0 instrument errors. All 6 analyzer runs: exit 0.
- Deep-diff + secondary scripts (`/tmp/burnoffsets-deepdiff.js`,
  `/tmp/burnoffsets-secondary.js`) are scratch, not committed; copies kept in
  goal hidden_files for the next run (0515Z precedent).
- House-rule check (`node scripts/check.js --quick`, worktree AGENTS.md):
  run after the evidence was written — **331 passed, 9 failed in 1569s**
  (2026-11-13 ~10:13Z). The tail shows 120s-cap timeouts on the unmodified
  green list (`test-occupation-panels.js`, `test-living-garden-deed-attainment.js`,
  `test-capable-bot-20261014.js` — the three slowest, all 120s). The full
  failure list was not captured (output piped through `tail -15`); the prior
  run on this base recorded 335 passed / 5 failed (phone-frame receipt
  staleness + deed-attainment timeouts under load). This arm changes no `src/js`
  and no green-list test, so no failure is attributable to it; the failures
  are load/timeout artifacts on the base. No re-run: a 26-minute re-run would
  only re-list base timeouts.

## Run incidents (recorded, not hidden)

- **Runtime restart mid-run.** The first burn batch (b1→b1999) was interrupted
  after ~49 min, during b13 seed 190398. Recovery verified from disk: b0 8/8,
  b1 8/8, b13 7/8 (missing only 190398, no partial file), b251/b499/b1999 not
  started, no driver process running. All 23 existing per-seed files parsed
  cleanly. Resume batch ran b13 seed 190398 only, then b251, b499, b1999 in
  full; completed 2026-11-13T09:40:06Z, exit 0, "ALL REMAINING LEGS DONE".
- **/tmp wiped by the restart.** The deep-diff script was lost (last tool call
  failed MODULE_NOT_FOUND). Recreated from the pre-restart design; corpora
  are in the repo, so no data was lost. The recreated script's output is the
  log committed here.
- **Safe-commit index clobber (known pattern).** On the tooling commit,
  safe-commit.sh created the commit but left the 4 files staged-as-deleted in
  the index. Repaired with `git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info`; verified `git status --short` empty + `git diff HEAD`
  empty. Commit content verified correct.
- **Heartbeat slow under lock contention** (~150s per beat) but lands; beats at
  07:41:14Z, 07:57:40Z, 08:55:52Z, 09:10Z (post-restart recovery), 09:26:13Z.
  Flap-watch log ALL-OK throughout; 163 historical FAIL lines predate this run.

## Metric review (§14 — metrics held, one correction applied)

- Metrics held: every leg judged against the MEASURED baseline b0 on current
  master (never the far-end 4/8); GO conjuncts applied exactly as pre-registered;
  no re-scoring, no verdict moved after the fact.
- The median conjunct was non-binding on this weak baseline: all five legs
  passed it (129/127/126/144/139 vs 139 × 0.8 = 111.2), so the median could
  only have mattered for b1999 and it passed. The starvation conjunct never
  bound either — max 2 on b251, exactly at the allowance (baseline 0 + 2).
  The verdicts turned entirely on the gap-save + no-regression conjuncts.
- Median definition (analyzer `median()`, `scripts/burnoffsets-analyze-20261113.js`):
  upper median — sorted days, index n/2 (5th of 8). Stated here because the
  plain mean-of-middle-two would read 137 for the baseline, not 139; the
  analyzer's definition is used consistently for baseline and legs.
- Kill taxonomy (§14a): b1/b499 CONCEPT-DEAD as gap-savers in the strong sense
  (they moved fates widely yet saved neither gap seed); b13/b251 saved 190392
  but failed the no-regression conjunct — a stream-shift tradeoff, not a
  mechanism failure; b1999 kept the survivor but saved no gap seed. The stream
  question as a whole is parked after 6 sampled offsets, not concept-dead as a
  sensitivity fact (sensitivity is proven: 40/40 seed-legs diverged from day 2).
- Telemetry deviation check (loop body step 10): ATTEMPTED and REFUSED —
  `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-13/perseed-burnoffsets-a-b0/*.json' --metrics
  national,table,wins,exiled` refused the input as recorder-corpus ("all 8
  --current rows carry top-level anchorCommit, so they are sweep recorder rows,
  not runs"). Same refusal class as prior arms. Recorded, NOT rolled: the
  scale-wall baseline is untouched.

## Convergence state

Scale-onramp stays **converging, NOT converged**. National/table/wins 0 on all
48 seed-runs; wave 5 reached on 11/48; survival 10/48. The run's structural
finding is that the gap save and the survivor-keep never coincide on one
stream — a stream shift trades one village's fate for another's, it does not
lift the band. The next run works tendexact × stream-shift or a design
mechanism, per the prereg run rule.

## Corpora + summaries

- Per-seed corpora (48 JSONs):
  `evidence/2026-11-13/perseed-burnoffsets-a-b{0,1,13,251,499,1999}/`
  (`burnoffsets-s<seed>-burnoffsets-pilot-competent-burnoffsets.json`)
- Per-leg summaries: `evidence/2026-11-13/burnoffsets-a-b{N}-summary.json`
  (N = 0, 1, 13, 251, 499, 1999)
- Driver logs: `evidence/2026-11-13/burnoffsets-a-b{N}-driver.log`
  (b13 log appended on the resume batch)
- Deep-diff log: `evidence/2026-11-13/burnoffsets-a-deepdiff.log`
- Secondary log: `evidence/2026-11-13/burnoffsets-a-secondary.log`

## §9 — adoption note for the coordinator

Ready-to-merge. Branch `sim-burnoffsets-a`, worktree
`~/workspace/worktrees/sim-burnoffsets-a`, base master `f7352f946`.
Tooling commit `74be43d0f` (prereg + driver + analyzer + proof, 62/0 green).
Evidence commit SHA to be recorded on landing (this file + 6 summaries + 6
driver logs + deep-diff/secondary logs + 6 perseed corpus dirs, 48 JSONs).

Sibling cross-check (final): sim-tendshift-a's baseline agrees with mine on
ALL 8 seeds, every reported field (days, endReason, standing, scale, maxWave,
death count, errors). Seed 190398 confirmed at closeout: 139d village-lost,
standing 370, regional, wave 5, deaths 78, errors 0 — identical to my
baseline. No discrepancy to flag.

Do NOT push, bump versions, or verify live — the coordinator lands.

