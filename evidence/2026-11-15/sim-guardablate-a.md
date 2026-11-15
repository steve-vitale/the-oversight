# CASCADE lingerer guard-removal ablation: AMBIGUOUS (subject 1/8 vs baseline 4/8 — partial attribution, no closure)

Run: fleshout-20261115T1715Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-guardablate-a` (worktree `~/workspace/worktrees/sim-guardablate-a`).
Binding prereg: evidence/2026-11-15/sim-guardablate-a-prereg.md — read it in full;
it binds every step below. Subject branch `transplant-guardablate-subject`
(`056cfb809340a8eec659a763c6dd26afd0f3549c`) left in place, never merged.

## Verdict: AMBIGUOUS (partial attribution, no closure)

Removing the CASCADE lingerer guard drops survival from **4/8 to 1/8** on the
matched band — a 3-survivor swing, with the lingerer signature returning
(scholar deaths 67→106, "the wild" 58→91, gap-0 lockstep repeats 9→26).
That is substantial partial attribution: the guard carries real survival
weight. But the frozen verdict mapping does not call it CONFIRMED. The
re-run baseline read 4/8 (not the expected 8/8 — see §Drift), so the
RELATIVE form binds: CONFIRMED needs subject ≤ baseline−5 = −1, which is
unreachable at baseline 4/8; REFUTED needs subject ≥ baseline−2 = 2.
Subject 1/8 is neither — it is **AMBIGUOUS** by the mapping as written.
The absolute form (subject ≤3/8 → CONFIRMED) would have confirmed, but it
applies only at baseline 8/8, and the baseline did not read 8/8. Metric
binding (§14) forbids re-scoring against the friendlier form mid-run.
Family 7 brain-side therefore stays open: it is NOT closed by attribution,
and it is NOT re-judged here (it stays UNMEASURED — no align subject leg
ever ran). The coordinator's next decision is whether the 3-survivor swing
plus the mechanism closes the question by attribution on the evidence's
strength, or whether the question needs a re-run under a revised bar
(see §Metric review for the proposed revision).

## Prereg header (binds the run)

- Primary metric: survived/8 on the subject leg, judged by the frozen
  verdict mapping against the baseline leg. Absolute form (baseline 8/8):
  subject ≤3/8 CONFIRMED, ≥6/8 REFUTED, 4–5/8 AMBIGUOUS. Relative form
  (baseline <8/8): subject ≤ baseline−5 CONFIRMED, ≥ baseline−2 REFUTED,
  else AMBIGUOUS. Which form applies is decided by the re-run baseline
  read itself.
- GO threshold: none — there is NO baseline gate on this arm (any baseline
  read 0–8/8 proceeds to the subject leg; the mapping handles every read).
  The only STOP is an instrument failure (missing/unparseable per-seed
  files, instrument errors touching the survival read, standing-restore
  failure) — none occurred.
- Horizon: 150d death-aware (dead villages stop simulating; +10d tail max).
  Why: the question is survival collapse in the wave/door window (deaths
  come at the door/waves on day 43+); 150d covers waves 4–5 and the table
  window without simulating dead villages.
- Seeds: MATCHED band 190391–190398 (deliberate reuse, authorized by the
  1415Z coordinator decision (2) matched-band precedent AND this run's
  coordinator decision (2) — the 1615Z decision naming "guard-removal
  ablation as the deciding test, own prereg"; this arm's prereg IS that
  prereg). Per-seed prereg hits adopted by reference from the 7redef-match
  prereg (92/14/19/12/15/14/11/92).
- Policies: competent verbatim own-policy (`competent.js`, sha
  `74a890f0844e`), fix standing swapped in every step, native standing
  restored byte-identical afterwards (sha-verified `f9359976...`).
- Mode: `fix` only. Step ids: baseline `ep-tip-guardablate`, subject
  `tguardablate`, drift-check leg `ep-1615-guardablate-check` (diagnostic,
  not judged — see §Drift).

## Base + substrate change (task step 1)

- Registered base `53e7b6a1e` (`53e7b6a1eaf4004eab5e58f5c57cc88647142547`,
  "Version bump 493b82c6c-20261115-173353 (batch ship)"). Master tip at run
  start IS `53e7b6a1e` — no rebase was owed at adoption and none happened.
- The guard was RE-VERIFIED VERBATIM at `53e7b6a1e` before any sim: the 16
  lines at `game.js:24147–24162` are byte-identical to the added lines of
  commit `dc8cbd3f3` (empty diff, 16 lines). The hunk matched, so the arm
  proceeded.
- Substrate verification by this arm at run start: `git diff --stat
  1ca2c257d b4343ac9d -- src/js/` = `src/js/game.js | 16 ++++++++++++++++`
  (the guard and ONLY the guard between the 1215Z and 1615Z bases);
  `git diff --stat b4343ac9d 53e7b6a1e -- src/js/` = `src/js/build.js | 2 +-`
  (version string only) + `src/js/convo-mood.js | 16 ++++++++++++++++`
  (journey-establishment r214, commit c89ac24b3: plain parting for
  friendly/neutral sittings — conversation goodbye lines only). Standing
  (`f9359976...`) and policy (`74a890f0844e`) shas are IDENTICAL at all
  three bases (1215Z, 1615Z, tip).
- The ablation set: remove exactly those 16 lines (`game.js:24147–24162`),
  −16/+0, one file. Subject branch `transplant-guardablate-subject`,
  one commit `056cfb809340a8eec659a763c6dd26afd0f3549c` on the arm branch,
  diff exactly the ablation (verified: removed lines byte-identical to
  the guard hunk 16/16, 0 added, 1 hunk, subject game.js == base game.js
  minus exactly those 16 lines, policy + standing + convo-mood.js
  byte-identical to base).

## Drift check — the re-run baseline read 4/8, not 8/8 (EXPLAINED before judging)

The baseline re-run on tip `53e7b6a1e` survived **4/8** (days
150/148/150/143/74/150/142/150), against the 1615Z baseline's 8/8 (all
150d). Per-seed drift vs the 1615Z table: 4 seeds drifted in days
(190392: 150→148 lost; 190394: 150→143 lost; 190395: 150→74 lost; 190397:
150→142 lost) and the surviving seeds drifted in standing too (190391:
380→480; 190396: 290→260; 190398: 295→375). This is the pre-registered
drift case, and it was investigated — not waved through — before the
subject was judged:

1. **Instrument ruled out.** Driver / shared analyzer / instrument /
   harness / policy diffs between b4343ac9d and 53e7b6a1e: EMPTY. The
   index.html diff is version-query strings only (same script order).
   The step restored the same fix standing (f8fda4295a99) and the same
   policy (74a890f0844e); per-seed anchors are 53e7b6a1eaf4; instrument
   errors 0 on all 8 seeds.
2. **Reproduction leg on the 1615Z base.** STEP `ep-1615-guardablate-check`
   re-ran the same 8 seeds on `b4343ac9d` with the same step script:
   survived **8/8**, and all 8 per-seed JSONs are BIT-IDENTICAL to the
   1615Z baseline corpus except step/anchor metadata (wall 593 deaths,
   standing 199–490, wave-5 4/8 — exact). Determinism holds; the 1615Z
   read reproduces on its own base. The drift is therefore
   substrate-caused, and the only game-code delta between the substrates
   is the convo-mood r214 change (+16) plus the version stamp.
3. **Mechanism, proven live.** The r214 change adds a plain parting for
   friendly/neutral sittings via `convoPickCycle` → `convoPick`, and
   `convoPick` consumes exactly one `Math.random()` draw per call
   (`conversation.js:3234`: `pickPool[Math.floor(Math.random() *
   pickPool.length)]`). A diagnostic (`/tmp/goodbye-draws.js`, not
   committed) measured it live on both substrates: on b4343ac9d,
   `convoMoodGoodbye` at neutral/friendly consumes **0 draws** and
   returns null (no parting beat existed); on the tip it consumes **1
   draw** and returns a plain line ("See you around." / "Same time
   tomorrow, maybe."). Warm/cool/tense are unchanged (1 draw on both).
   Every friendly/neutral sitting close on the tip therefore consumes
   one extra draw from the shared, sequential, seeded RNG stream — and
   every subsequent draw in the run shifts. The trajectories diverge by
   day 5 (first daily divergence at day 5 on seeds 190391 and 190395:
   a wave-1 kill present on one leg and absent on the other). The
   "dialogue-only" change is not RNG-neutral: it is a stream-shifting
   change, and on this band it costs 4 villages.
4. **Caveat, recorded.** The plain parting lines themselves do NOT appear
   in the tip baseline's vetSays (0 hits) — vetSays is a sampled
   instrument and sitting-close lines are not persisted per-seed, so the
   corpus cannot show the branch firing. The live draw-count measurement
   is the direct evidence; the corpus divergence is the consequence. A
   future arm needing dialogue-firing evidence should use the draw-count
   probe, not a vetSays grep.

Consequence for the verdict: the relative form binds (baseline 4/8), and
its CONFIRMED bar (a 5-survivor gap) is unreachable at baseline 4/8.
The 1615Z 8/8 baseline is NOT reproducible on tip — any future family-7
measurement must re-baseline on tip, and this arm's 4/8 IS the new tip
baseline on the matched band.

## Baseline leg — survived 4/8 (STEP ep-tip-guardablate, tip 53e7b6a1e)

Summary: `evidence/2026-11-13/culpritbisect-a-ep-tip-guardablate-summary.json`;
per-seed corpora: `evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-guardablate/`.

| seed | days | end | maxWave | standing | rank | won | errors |
|---|---|---|---|---|---|---|---|
| 190391 | 150 | survived | 5 | 480 | regional | no | 0 |
| 190392 | 148 | village-lost | 4 | 199 | regional | no | 0 |
| 190393 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190394 | 143 | village-lost | 5 | 345 | regional | no | 0 |
| 190395 | 74 | village-lost | 4 | 199 | regional | no | 0 |
| 190396 | 150 | survived | 5 | 260 | regional | no | 0 |
| 190397 | 142 | village-lost | 4 | 175 | regional | no | 0 |
| 190398 | 150 | survived | 5 | 375 | regional | no | 0 |

**Survived 4/8 → relative verdict form binds.** Instrument errors 0 on
all 8 seeds. All rows carry fix standing (`f8fda4295a99`) + base policy
(`74a890f0844e`); anchorCommit `53e7b6a1eaf4` (the base tip).

Per-seed readiness: wave-4 ready 3/8 (190393, 190396, 190398); wave-5 ready
0/8 — every village short on living veterans (ready5 veterans 0–1, need 2).
Blooded 4/8. Tribute ready 0/8 (all veterans-short). End pantry:
5257/0/2200/0/0/6362/1000/6407 kcal — three villages end at 0 kcal.

## Subject leg — survived 1/8 (STEP tguardablate, subject 056cfb809340)

Summary: `evidence/2026-11-13/culpritbisect-a-tguardablate-summary.json`;
per-seed corpora: `evidence/2026-11-13/perseed-culpritbisect-a-tguardablate/`.

| seed | days | end | maxWave | standing | rank | won | errors |
|---|---|---|---|---|---|---|---|
| 190391 | 136 | village-lost | 5 | 470 | regional | no | 0 |
| 190392 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190393 | 90 | village-lost | 4 | 199 | regional | no | 0 |
| 190394 | 119 | village-lost | 4 | 175 | regional | no | 0 |
| 190395 | 145 | village-lost | 4 | 199 | regional | no | 0 |
| 190396 | 97 | village-lost | 4 | 199 | regional | no | 0 |
| 190397 | 83 | village-lost | 4 | 125 | regional | no | 0 |
| 190398 | 126 | village-lost | 4 | 199 | regional | no | 0 |

**Survived 1/8.** Instrument errors 0 on all 8 seeds. All rows carry fix
standing + base policy; anchorCommit `056cfb809340` (the subject commit).
Six of eight seeds died earlier without the guard; two lived longer
(190392: 148 lost → 150 survived; 190395: 74 → 145 lost) — the guard's
removal also shifts the RNG stream (monsterTurn proceeds past the removed
return and consumes draws the baseline never consumed), so per-seed
trajectories re-roll; the net is −3 survivors.

Per-seed readiness: wave-4 ready 1/8 (190392 only); wave-5 ready 0/8;
blooded 1/8; tribute ready 0/8. End pantry: 1026/6084/0/0/0/0/0/0 kcal —
five villages end at 0 kcal.

## Wall numbers (every run)

- Baseline: national 0/8, table 0/8, wins 0/8, wave-5 unlocks 4/8, wave-4
  unlocks 8/8, median survival 150d, deaths 512, standing range 175–480.
- Subject: national 0/8, table 0/8, wins 0/8, wave-5 unlocks 1/8, wave-4
  unlocks 8/8, median survival 126d, deaths 594, standing range 125–470.
- Rank read: regional 8/8 on both legs → **REGIONAL_INTACT** (≥5/8 band).
  The wall is intact at the regional→national step on both legs — but the
  survival floor under it fell from 4/8 to 1/8 without the guard, and the
  wave-5 door narrowed from 4/8 unlocks to 1/8.
- Death-cause shares (villager deaths while villages persist, not village
  deaths): baseline 512 — villager combat 238 (46%), combat 101 (20%),
  expedition 68 (13%), the wild 58 (11%), monster 19, the arena 5,
  ambush 4, starvation 2. Subject 594 — villager combat 238 (40%,
  EXACTLY the same count as baseline), combat 124 (21%), expedition 96
  (16%), the wild 91 (15%), monster 14, the arena 6, a stranger 4,
  starvation 2. The guard's absence moves deaths into "the wild"
  (+33) and expedition (+28) — the scholar-facing wild deaths, not
  village brawls.

## Lingerer-path diagnostic (secondary, pre-registered)

Scholar (player) deaths, computed from the per-seed death rows:

| | scholar deaths | share of all deaths | "the wild" scholar deaths | gap-0 lockstep repeats |
|---|---|---|---|---|
| 1615Z-base check (guard ON, pre-r214) | 49 | 8.3% | 35 | 0 |
| Tip baseline (guard ON) | 67 | 13.1% | 58 | 9 |
| Subject (guard OFF) | 106 | 17.8% | 91 | 26 |

Gap-0 = same-seed same-day scholar deaths (two scholars dying the same
day — the cascade-b signature of one lingerer killing bearer after
bearer). The pattern is absent with the guard on the 1615Z substrate (0),
present at 9 on the tip baseline (guard ON but RNG-shifted trajectories),
and nearly triples to 26 with the guard removed. Scholar deaths rise
67→106 (+58%) and wild scholar deaths 58→91 (+57%) on the same substrate
with only the guard differing. This is corroboration, not the judge — the
verdict follows the frozen mapping — but the mechanism the guard blocks
is visible in the corpus exactly where the prereg said to look.

## Village assessment (plain words)

Four villages live to day 150 with the guard in; one lives without it.
The guard's absence doesn't change what villages do — they still reach
regional standing, still fight at the door, still lose people in fights
and on expeditions — it changes whether the village itself survives the
people dying. Without the guard, the scholar keeps dying in the wild
(106 times across eight villages, up from 67), and the same-day repeat
deaths — one beast killing the scholar, then the next person to pick up
the mantle, then the next — come back almost threefold. Six of eight
villages die earlier; the one that survives (190392) does so barely,
wave-4 only, standing 199, no tribute, no wave-5 readiness. The
strongest village with the guard (190391: 150 days, wave 5, standing
480, pantry 5,257) dies at day 136 without it. The binding gap is still
veterans — no village on either leg is wave-5 ready, every one short on
living veterans — but the guard decides whether a village lives long
enough for veterans to matter. The 1615Z picture (8/8 alive, "the
collapse regime is gone") does not survive contact with the tip: the
r214 conversation change alone moved the floor to 4/8, and the guard is
worth 3 more villages on top of that. The collapse regime isn't gone —
it moved, and it is one dialogue change and one guard away.

## Proof of effect (observable, not just no-throw)

- `scripts/test-guardablate-a.js`: **94 passed, 0 failed** (final run,
  after the evidence file exists). Stage 1 was 71/71 before any judged
  sim; the intermediate run was 93/94 (only the evidence leg open).
  `scripts/test-culpritbisect-a.js`: **116/116** (reused tooling check).
- Guard identity: the 16 lines match dc8cbd3f3 byte-identically; the
  lever commit's src/ change is exactly game.js +16 in one hunk; the
  38/88 citation lives in the guard's code comment (CORRECTION recorded
  in the proof: the 1615Z evidence's "its commit cites" phrasing is loose
  — the commit message is a bare subject line; the citation is in the
  code the commit added).
- Substrate: only-src/js-change 1215Z→1615Z is the guard; 1615Z→tip is
  convo-mood +16 + build.js version stamp; standing/policy shas identical
  across all three bases.
- Guard-effect legs, live on the baseline tree: cascade-b unit-lingering
  passes all 4 sub-cases (lingering adjacent no move/no fight; lingering
  on-cell no fight; non-lingering hungry adjacent DOES engage; direct
  startCombat on a lingerer still fights). The multi-turn check shows no
  fight within 6 turns and the stance never assigned (null — the guard
  returns before the stance machine runs).
- Guard-effect legs, live on the subject extract: the multi-turn check
  shows the INVERTED polarity — the unstaged lingering adjacent raider
  is assigned 'territorial' on turn 1, steps onto the scholar's cell on
  turn 2, and starts the fight on turn 3 (foughtAt 3, seed 100207).
- ADJUDICATION (recorded in the proof §8, not waived): the pre-registered
  single-turn unit-lingering inversion does NOT hold — the freshly
  spawned lingerer draws 'territorial' (warns twice, fights on the third
  turn, per cascade-b's own comment), so the guard's absence is invisible
  in ONE turn with an unstaged stance. The proof records the single-turn
  case passing on the subject as the documented fixture limitation and
  proves the effect with the multi-turn check on the identical fixture
  instead (`scripts/test-guardablate-lingerer-turns.js`). The verdict
  mapping is untouched by this adjudication. The proof also fixed its own
  numstat-columns error (numstat prints added-then-deleted, so −16/+0
  reads `0<TAB>16`).

## Balanced panel (§15)

`evidence/2026-11-15/guardablate-a-panel.{json,md}` (+ `-before`/`-after`
`.json.gz`; builder `scripts/build-guardablate-panels-20261115.js`,
linkdrive pattern, case identity = seed, pseudo-policy 'guardablate',
before = baseline leg guard-ON, after = subject leg guard-OFF, paired
seeds). Compare decision: **review_required** (8 cases).
`playerDeaths`: regression_signal, delta +4.875 per seed, CI [2.25, 7.5].
`playerDeaths100Days`: regression_signal, delta +4.958, CI [1.96, 8.15].
`villageDeaths`: regression_signal, delta +10.25, CI [2, 19].
`villageDeaths100Days`: regression_watch, delta +13.48, CI [−0.93, 24.97].
`communityLost`: regression_watch, delta +0.375, CI [−0.125, 0.875].
The panel agrees with the verdict direction (guard OFF is worse on every
death metric) — the instrument and the pre-registered threshold agree;
the panel's decision is review_required, not a GO/NO-GO, because the
panel is the instrument and the prereg threshold is the judge (AMBIGUOUS
by the frozen mapping).

## Telemetry deviation check

Attempted per the loop body step 10:
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-guardablate/*.json' --metrics national,table,wins,exiled`
→ **REFUSED**, exactly as the prereg predicted for this recorder-corpus
class: "telemetry-check: refusing recorder-corpus input: all 8 --current
rows carry top-level anchorCommit, so they are sweep recorder rows, not
runs. Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." Recorded, not waived; baseline NOT rolled.
No LOUD lines to investigate (the tool refuses before comparing).

## Sense-testing (vetSays narration, both corpora)

239 vetSays lines (178 distinct) on the baseline; 198 lines (149 distinct)
on the subject — fewer lines because villages die earlier and narrate less.
The narration is overwhelmingly event-driven and specific, not templated
filler. What villagers actually do and say:

- Early narration is IDENTICAL between legs on seed 190391 (same door-fight
  lines day 11 and day 26, same veteran kill day 31) — the trajectories
  share their opening; the guard only matters once a lingerer arrives.
  "🛡️ Kurt, Colin, Lulwa, Leo and Raj met them at the door — 4 put down,
  1 driven off. Kurt, Colin, Raj are hurt."
- Veteran kills get the same named, on-camera call-out on both legs:
  "📺 SYSTEM: \"Oh — OH. Everybody saw that, right? Ingrid just put down
  Ad Break... on CAMERA. That's a veteran kill, folks. REMEMBER the
  name.\"" (subject: Yara/The Redactor day 66 — same template, different
  names and beasts, which reads as a broadcast formula rather than a
  robot repeat).
- The top repeats on both legs are the same scripted System beats, 8×
  each (once per seed reaching the wave — the same event firing per
  village, not within-village repetition): the wave-3 arrival line
  ("Oh, you survived the AUDIENCE NOTES? ..."), the Mirror Draft
  introduction, the "FINALES need a LEGEND" line, and the "Four waves.
  FOUR. ... FINALES need a NATION" finale gate. ARC IV lines: 7 baseline,
  8 subject (one per village reaching the arc).
- The "unfinished" hits (7 baseline, 8 subject) are all the same scripted
  ARC IV beat, as in 1615Z — not a defect.
- The age-description fallback the 1215Z/1615Z arms logged ("Aria, the
  person in their 60s") did NOT recur in either corpus this run (0 hits)
  — trajectories differ; the open backlog entry stands as-is.
- Siege/linger/treeline mentions: 8 on both legs (the same scripted beat
  per seed). Scholar deaths are NOT narrated in vetSays on either leg (0
  mentions) — the instrument's sample doesn't cover them; the per-seed
  death rows are where the scholar-death story lives (see §Lingerer-path
  diagnostic).

No robotic, static, or repeated-within-village narration was found. The
subject corpus reads the same as the baseline until the villages start
dying — the difference is in the dying, not the talking.

## Metric review (§14)

- The metric set held as written — but it bit in a way the prereg
  anticipated only in a note. The relative form's CONFIRMED bar (a
  5-survivor gap) is unreachable whenever the re-run baseline reads
  below 5/8: at baseline 4/8, even a subject collapse to 0/8 is only a
  4-gap, i.e. AMBIGUOUS. The subject read 1/8 — a 3-survivor swing with
  the mechanism corroborated — and the mapping still returns AMBIGUOUS.
  The mapping judged honestly, but its bar is calibrated for an 8/8
  baseline and goes mute on a drifted one.
- Revision proposed for the NEXT run, not this one: the relative form
  should scale with the baseline — e.g. CONFIRMED at subject ≤
  baseline−3 (a 3-gap, reachable at any baseline ≥3), or the absolute
  form (subject ≤3/8) should apply whenever the subject reads collapsed
  regardless of the baseline read, with the relative form kept only for
  the REFUTED side. Do NOT re-score this run under the revised bar; the
  AMBIGUOUS verdict stands and the revision is a proposal.
- The drift check worked exactly as designed: the check leg on the old
  base plus the draw-count diagnostic explained the drift before any
  judgment, and the relative form was the right fallback. Keep the
  drift-check procedure (re-run leg on the prior base + a code-level
  mechanism probe) for every future arm whose baseline re-run moves.
- The single-turn unit-lingering fixture limitation is now a known
  instrument property: stance gating hides the guard in one turn. The
  multi-turn check (`test-guardablate-lingerer-turns.js`) is the correct
  instrument for this mechanism going forward.
- The vetSays instrument does not capture sitting-close lines: the r214
  plain partings are invisible in the corpora. A draw-count probe (wrap
  Math.random, call the function) is the right instrument for
  dialogue-firing questions, not a vetSays grep.
- The gate's regime assumption lesson from 1615Z stands and deepens: a
  "dialogue-only" change moved the matched-band baseline 8/8→4/8 through
  the shared RNG stream. No game-code change is survival-neutral until
  its RNG-draw footprint is checked — a plain-parting line costs a draw
  per sitting close, and draws are the stream. Future preregs should name
  the RNG-draw footprint of any substrate change between the reference
  read and the arm's base (this prereg named the change but not its draw
  footprint; the drift check caught it anyway).

## Incidents

- **Drift (see §Drift check):** the re-run baseline read 4/8 vs the
  expected 8/8. Explained, not waived: 1615Z-base check leg reproduces
  8/8 bit-identically; the r214 plain-parting change adds one
  Math.random draw per friendly/neutral sitting close (measured live:
  0 draws on b4343ac9d, 1 draw on the tip), shifting the shared RNG
  stream; trajectories diverge by day 5. The relative verdict form
  binds; CONFIRMED is unreachable at baseline 4/8.
- **Proof adjudication (§8):** the pre-registered single-turn
  unit-lingering inversion does not hold (territorial stance fights on
  turn 3). Recorded in the proof with the multi-turn check as the
  replacement instrument; verdict mapping untouched. The proof also
  fixed its own numstat-columns error.
- **Safe-commit index clobber:** struck 3× (prereg commit, subject
  commit, proof-fix commit — the subject one manifesting as `MM` on
  game.js). All repaired with the documented `ls-tree -r HEAD -- <paths>
  | git update-index --add --index-info` pipe; every commit verified
  correct (worktree hash == HEAD blob) before continuing.
- **/tmp filled (self-inflicted):** two manual pathspec extracts
  (base1615 + subject, 228M each) filled the 512M /tmp during a proof
  run and the extract failed with "No space left on device". Removed
  both stale extracts (mine, completed, no live process using them);
  /tmp back to 1%. The proof removes its own extract in `finally`, so
  only one extract ever lives at a time — the fill was my manual
  extracts, not the proof.
- **Subject leg slow under load:** 12.5 min vs the baseline leg's ~2 min
  — the box load average was 7.49 with siblings running check.js and
  probes. Not a failure; the leg completed clean (STEP-EXIT:0, errors 0).
- **No write flap** during this run (all writes succeeded first try).
  The flap-watch log is stale post-restart (watcher not yet restarted by
  its watchdog) — noted, not this arm's to fix.

## Commits on this branch

- `99eeeb56e` sim-guardablate-a: binding prereg + proof stage 1 green
  71/71 + panel builder (committed BEFORE any judged sim)
- `870576801` sim-guardablate-a: proof fix — numstat columns +
  adjudicated §8 (multi-turn lingerer-turns check)
- (this commit) sim-guardablate-a: AMBIGUOUS — subject 1/8 vs baseline
  4/8, evidence + step corpora + check-leg corpus + panel
- Subject branch (left in place, never merged):
  `transplant-guardablate-subject` at `056cfb809340a8eec659a763c6dd26afd0f3549c`
  (one commit: remove CASCADE lingerer guard, −16/+0, src/js/game.js only)

## Findings backlog

- [open] 2026-11-15 — measurement / RNG stream — a "dialogue-only"
  game-code change (journey-establishment r214 plain parting, convo-mood.js
  +16) moved the matched-band survival baseline 8/8→4/8: the new branch
  calls convoPickCycle → convoPick, which consumes one Math.random draw
  per friendly/neutral sitting close (measured live: 0 draws on b4343ac9d,
  1 draw on the tip), shifting the shared seeded RNG stream; trajectories
  diverge by day 5. No game-code change is survival-neutral until its
  RNG-draw footprint is checked. (sim-guardablate-a evidence; finding
  also appended to hidden_files/sim-findings.md.)
- (carried, still open) narration — door-fight line renders a villager as
  "Aria, the person in their 60s" (name + age-description) where other
  villagers get just a name; likely a missing-name fallback leaking into
  vetSays narration. Did NOT recur in either corpus this run (0 hits).

## Balanced panel (§15) — summary

See §Balanced panel above; compare file:
`evidence/2026-11-15/guardablate-a-panel.md` (decision review_required;
playerDeaths regression_signal +4.875, villageDeaths regression_signal
+10.25). The panel is the instrument; the prereg threshold is the judge.
