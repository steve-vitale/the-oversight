# CASCADE lingerer guard-removal ablation on a FRESH band: CONFIRMED (subject 2/8 vs baseline 6/8 — 4-survivor gap, mechanism corroborated)

Run: fleshout-20261115T2015Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-guardablate-fresh-a` (worktree `~/workspace/worktrees/sim-guardablate-fresh-a`).
Binding prereg: evidence/2026-11-15/sim-guardablate-fresh-a-prereg.md — read it in full;
it binds every step below. Subject branch `transplant-guardablate-fresh-subject`
(`ab856945d0a1def355f531dd05dd85addbcac0d7`) left in place, never merged.

## Verdict: CONFIRMED (guard-attribution confirmed on unseen seeds)

Removing the CASCADE lingerer guard drops survival from **6/8 to 2/8** on the
fresh band 190631–190638 — a 4-survivor gap, with the lingerer signature
returning hard (scholar deaths 51→94, "the wild" scholar deaths 41→81,
gap-0 lockstep repeats 3→20). Under the revised bar frozen in the prereg
(CONFIRMED at subject ≤ baseline−3), 2 ≤ 6−3 = 3, so the verdict is
**CONFIRMED**: the guard alone explains the lifted survival floor on seeds
no earlier run has used. Family 7 brain-side therefore closes as
**UNMEASURABLE-by-attribution** — the collapse regime the family needed to
explain was guard-masked, not family-7. The align step itself stays
UNMEASURED (no subject leg ever ran for it); this verdict does not re-judge
it. The 1715Z read (1/8 vs 4/8, AMBIGUOUS under the old bar) classifies
CONFIRMED under the revised bar too — the two independent bands now agree.

## Prereg header (binds the run)

- Primary metric: survived/8 on the subject leg, judged by the REVISED
  verdict mapping against the baseline leg. CONFIRMED at S ≤ B−3,
  REFUTED at S ≥ B−1, else AMBIGUOUS with ONE subject re-run (fresh step
  id `tguardablate-fresh-r`; the re-run's count governs; a second
  AMBIGUOUS → recorded AMBIGUOUS). No re-run was needed: S=2 is not in
  the AMBIGUOUS band (B−2 = 4).
- BASELINE GATE: B < 3/8 → STOP, try the one pre-screened fallback band
  190661–190668; fallback also < 3/8 → STOP UNMEASURED. The fresh
  baseline read B=6/8 → PROCEED; the fallback was not needed.
- Horizon: 150d death-aware (dead villages stop simulating; +10d tail max).
  Why: the question is survival collapse in the wave/door window (deaths
  come at the door/waves on day 43+); 150d covers waves 4–5 and the table
  window without simulating dead villages.
- Seeds: FRESH band 190631–190638 (full freshness check in the prereg:
  named only as an unused pre-screened fallback in the 2b-fresh prereg;
  all evidence-wide word-boundary hits are kcal floats, not seeds; no
  seed-context use anywhere). Fallback 190661–190668 pre-screened the
  same way (0 prereg hits; all evidence-wide hits kcal values).
- Policies: competent verbatim own-policy (`competent.js`, sha
  `74a890f0844e`), fix standing swapped in every step, native standing
  restored byte-identical afterwards (sha-verified `f9359976...`).
- Mode: `fix` only. Step ids: baseline `ep-tip-guardablate-fresh`,
  subject `tguardablate-fresh`.

## Base + substrate change (task step 1)

- Registered base `605d72bd4` (`605d72bd439d038143cb999aea46a386b4b7f345`,
  "sim-transplant2b-fresh-a: NOT-CARRIER evidence — family 2b fresh-band
  0/8 vs 0/8"). Master tip at run start IS `605d72bd4` — no rebase was
  owed at adoption and none happened.
- The guard was RE-VERIFIED VERBATIM at `605d72bd4` before any sim: the 16
  lines at `game.js:24147–24162` are byte-identical to the added lines of
  commit `dc8cbd3f3` (empty diff, 16 lines). The hunk matched, so the arm
  proceeded.
- Substrate verification by this arm at run start: `git diff --numstat
  53e7b6a1e 605d72bd4 -- src/` = `src/js/alienPlayers.js 3/3`,
  `src/js/game.js 31/7`, `src/js/sigW3c.js 4/4` — the game.js hunks are
  ONLY the journey-endgame r211 quoteWrap/sysSay display-only changes
  plus the sim-producerparty-b lever (+19, then −19 in the same range,
  "pilot NO-GO evidence — lever reverted") — net zero, no producerparty
  code in the tip. Standing (`f9359976...`) and policy (`74a890f0844e`)
  shas are IDENTICAL at both bases.
- The ablation set: remove exactly those 16 lines (`game.js:24147–24162`),
  −16/+0, one file. Subject branch `transplant-guardablate-fresh-subject`,
  one commit `ab856945d0a1def355f531dd05dd85addbcac0d7` on the arm branch,
  diff exactly the ablation (verified: removed lines byte-identical to
  the guard hunk 16/16, 0 added, 1 hunk, subject game.js == base game.js
  minus exactly those 16 lines, policy + standing + convo-mood.js
  byte-identical to base).

## Baseline leg — survived 6/8 (STEP ep-tip-guardablate-fresh, tip 605d72bd4)

Summary: `evidence/2026-11-15/guardablate-fresh-ep-tip-guardablate-fresh-summary.json`;
per-seed corpora: `evidence/2026-11-15/perseed-guardablate-fresh-ep-tip-guardablate-fresh/`.

| seed | days | end | maxWave | standing | rank | won | errors |
|---|---|---|---|---|---|---|---|
| 190631 | 86 | village-lost | 4 | 199 | regional | no | 0 |
| 190632 | 130 | village-lost | 4 | 150 | regional | no | 0 |
| 190633 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190634 | 150 | survived | 4 | 175 | regional | no | 0 |
| 190635 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190636 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190637 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190638 | 150 | survived | 5 | 285 | regional | no | 0 |

**Survived 6/8 → gate PROCEED (B ≥ 3).** Instrument errors 0 on all 8
seeds. All rows carry fix standing (`f8fda4295a99`) + base policy
(`74a890f0844e`); anchorCommit `605d72bd439d` (the base tip).

Per-seed readiness: wave-4 ready 5/8 (190633, 190634, 190635, 190636,
190637); wave-5 ready 1/8 (190638 only — living veterans 2, tribute
ready; the other survivors hold 0–1). Blooded 4/8. Tribute ready 1/8
(190638). End pantry: 0/0/3828/0/0/5545/441/7123 kcal — four villages
end at 0 kcal.

## Subject leg — survived 2/8 (STEP tguardablate-fresh, subject ab856945d0a1)

Summary: `evidence/2026-11-15/guardablate-fresh-tguardablate-fresh-summary.json`;
per-seed corpora: `evidence/2026-11-15/perseed-guardablate-fresh-tguardablate-fresh/`.

| seed | days | end | maxWave | standing | rank | won | errors |
|---|---|---|---|---|---|---|---|
| 190631 | 58 | village-lost | 4 | 199 | village | no | 0 |
| 190632 | 141 | village-lost | 4 | 199 | regional | no | 0 |
| 190633 | 139 | village-lost | 4 | 199 | regional | no | 0 |
| 190634 | 150 | survived | 4 | 125 | regional | no | 0 |
| 190635 | 134 | village-lost | 4 | 199 | regional | no | 0 |
| 190636 | 93 | village-lost | 4 | 199 | regional | no | 0 |
| 190637 | 150 | survived | 4 | 199 | regional | no | 0 |
| 190638 | 120 | village-lost | 4 | 199 | regional | no | 0 |

**Survived 2/8.** Instrument errors 0 on all 8 seeds. All rows carry fix
standing + base policy; anchorCommit `ab856945d0a1` (the subject commit).
Six of eight seeds died earlier without the guard; the two survivors
(190634, 190637) are the same two that survived longest on the baseline
too, but weaker (190634 standing 175→125). The strongest baseline village
(190638: 150 days, wave 5, standing 285, tribute-ready) dies at day 120
without the guard, wave-4 only.

Per-seed readiness: wave-4 ready 4/8 (190634, 190635, 190637, 190638);
wave-5 ready 0/8; blooded 1/8; tribute ready 0/8. End pantry:
0/4460/0/3482/0/0/900/0 kcal — five villages end at 0 kcal.

## Wall numbers (every run)

- Baseline: national 0/8, table 0/8, wins 0/8, wave-5 unlocks 1/8, wave-4
  unlocks 8/8, median survival 150d, deaths 677, standing range 150–285.
- Subject: national 0/8, table 0/8, wins 0/8, wave-5 unlocks 0/8, wave-4
  unlocks 8/8, median survival 139d, deaths 644, standing range 125–199.
- Rank read: baseline regional 8/8 → **REGIONAL_INTACT**; subject
  regional 7/8 → **REGIONAL_INTACT** (≥5/8 band). The wall is intact at
  the regional→national step on both legs — but the survival floor under
  it fell from 6/8 to 2/8 without the guard, and the wave-5 door closed
  from 1/8 unlocks to 0/8.
- Death-cause shares (villager deaths while villages persist, not village
  deaths): baseline 677 — villager combat 317 (47%), expedition 160
  (24%), combat 106 (16%), the wild 41 (6%), monster 31, starvation 2.
  Subject 644 — villager combat 303 (47%, same share), combat 121 (19%),
  expedition 95 (15%), the wild 81 (13%), monster 21, starvation 0.
  Total deaths actually FALL slightly without the guard (677→644) — the
  guard's absence does not make the world deadlier in aggregate; it
  concentrates the dying on the scholar (see §Lingerer-path diagnostic),
  and villages die earlier so deaths compress into fewer days.

## Lingerer-path diagnostic (secondary, pre-registered)

Scholar (player) deaths, computed from the per-seed death rows:

| | scholar deaths | share of all deaths | "the wild" scholar deaths | gap-0 lockstep repeats |
|---|---|---|---|---|
| Tip baseline (guard ON) | 51 | 7.5% | 41 | 3 |
| Subject (guard OFF) | 94 | 14.6% | 81 | 20 |

Gap-0 = same-seed same-day scholar deaths (two scholars dying the same
day — the cascade-b signature of one lingerer killing bearer after
bearer). Every "the wild" death on both legs is a scholar death (41/41
baseline, 81/81 subject — the cause total equals the scholar count
exactly). Scholar deaths rise 51→94 (+84%) and wild scholar deaths
41→81 (+98%) on the same substrate with only the guard differing; the
gap-0 pattern grows nearly sevenfold (3→20). Per-seed scholar deaths:
baseline 5/8/6/6/9/0/7/10 (seed 190636: zero scholar deaths, survived);
subject 12/13/12/8/17/11/11/10 (every seed ≥8; 190636: 11 scholar
deaths, dead at 93d). This is corroboration, not the judge — the verdict
follows the frozen mapping — but the mechanism the guard blocks is
visible in the corpus exactly where the prereg said to look, and it is
stronger on the fresh band than on the matched band (1715Z: 67→106,
gap-0 9→26).

## Village assessment (plain words)

Six villages live to day 150 with the guard in; two live without it.
The guard's absence doesn't change what villages do — they still reach
regional standing, still fight at the door, still lose people in fights
and on expeditions — it changes whether the village itself survives the
people dying. Without the guard, the scholar keeps dying in the wild
(94 times across eight villages, up from 51), and the same-day repeat
deaths — one beast killing the scholar, then the next person to pick up
the mantle, then the next — come back almost sevenfold. The world isn't
deadlier overall (644 deaths vs 677 with the guard in); the dying moves
onto the one person whose death ends the run. The strongest village with
the guard (190638: 150 days, wave 5, standing 285, tribute-ready) dies
at day 120 without it. The binding gap is still veterans — only one
village on the baseline leg is wave-5 ready and none on the subject leg
— but the guard decides whether a village lives long enough for
veterans to matter. The 1715Z picture now holds on unseen seeds: the
guard is worth 4 villages on this band, 3 on the matched band, and the
collapse regime it masks is the same one both bands show.

## Proof of effect (observable, not just no-throw)

- `scripts/test-guardablate-fresh-a.js`: **final run green** (stage 1
  83/83 before any judged sim; intermediate 88/88 after the baseline
  leg + step-script fix; 103/104 with the subject cut — the one failure
  was the evidence file not existing yet, as expected at that stage;
  final run after this evidence file exists: all passing).
  `scripts/test-culpritbisect-a.js`: **116/116** (reused tooling check).
- Guard identity: the 16 lines match dc8cbd3f3 byte-identically; the
  lever commit's src/ change is exactly game.js +16 in one hunk; the
  38/88 citation lives in the guard's code comment.
- Substrate: only-src/js-change 1215Z→1615Z is the guard;
  53e7b6a1e→605d72bd4 src is alienPlayers 3/3 + game.js 31/7
  (quoteWrap/sysSay display-only + producerparty added-and-reverted,
  net zero) + sigW3c 4/4; standing/policy shas identical at both bases.
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
- ADJUDICATION (carried from the 1715Z proof, not waived): the
  pre-registered single-turn unit-lingering inversion does NOT hold —
  the freshly spawned lingerer draws 'territorial' (warns twice, fights
  on the third turn, per cascade-b's own comment), so the guard's
  absence is invisible in ONE turn with an unstaged stance. The proof
  records the single-turn case passing on the subject as the documented
  fixture limitation and proves the effect with the multi-turn check on
  the identical fixture instead. The verdict mapping is untouched by
  this adjudication.

## Balanced panel (§15)

`evidence/2026-11-15/guardablate-fresh-a-panel.{json,md}` (+ `-before`/
`-after` `.json.gz`; builder `scripts/build-guardablate-fresh-panels-20261115.js`,
linkdrive pattern, case identity = seed, pseudo-policy
'guardablate-fresh', before = baseline leg guard-ON, after = subject leg
guard-OFF, paired seeds). Compare decision: **review_required** (8 cases).
`playerDeaths`: regression_signal, delta +5.375 per seed, CI [3.125, 7.375].
`playerDeaths100Days`: regression_signal, delta +5.856, CI [3.015, 9.567].
`villageDeaths100Days`: regression_signal, delta +7.330, CI [1.918, 14.320].
`communityLost`: regression_signal, delta +0.5, CI [0.125, 0.875].
`survival60`: regression_watch, delta −0.125, CI [−0.375, 0].
`villageDeaths` per run: no_material_signal, delta −4.125 (total deaths
fell; deaths per 100 days rose — villages die earlier). The panel agrees
with the verdict direction (guard OFF is worse on scholar deaths and
community loss) — the instrument and the pre-registered threshold agree;
the panel's decision is review_required, not a GO/NO-GO, because the
panel is the instrument and the prereg threshold is the judge (CONFIRMED
by the frozen mapping).

## Telemetry deviation check

Attempted per the loop body step 10:
`node scripts/telemetry-check.js --baseline ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-15/perseed-guardablate-fresh-ep-tip-guardablate-fresh/*.json' --metrics national,table,wins,exiled`
→ **REFUSED**, exactly as the prereg predicted for this recorder-corpus
class: "telemetry-check: refusing recorder-corpus input: all 8 --current
rows carry top-level anchorCommit, so they are sweep recorder rows, not
runs. Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." Recorded, not waived; baseline NOT rolled.
No LOUD lines to investigate (the tool refuses before comparing).

## Sense-testing (vetSays narration, both corpora)

271 vetSays lines (204 distinct) on the baseline; 253 lines (197 distinct)
on the subject — fewer lines because villages die earlier and narrate less.
The narration is overwhelmingly event-driven and specific, not templated
filler. What villagers actually do and say:

- Early narration is IDENTICAL between legs on seed 190631 (same door-fight
  lines day 15 and day 21, same veteran sighting) — the trajectories share
  their opening; the guard only matters once a lingerer arrives.
  "🛡️ Barbara, Fritz, Naomi and Hunter met them at the door — 4 put down.
  Barbara, Fritz, Naomi, Hunter are hurt."
- Door-fight lines: 42 baseline, 41 subject. Veteran-kill call-outs: 43
  baseline, 47 subject — named, on-camera, same broadcast formula with
  different names and beasts.
- The top repeats on both legs are the same scripted System beats, 8×
  each (once per seed reaching the wave — the same event firing per
  village, not within-village repetition): the wave-3 arrival line
  ("Oh, you survived the AUDIENCE NOTES? ..."), the Mirror Draft
  introduction, the "FINALES need a LEGEND" line, and the "Four waves.
  FOUR. ... FINALES need a NATION" finale gate. ARC IV lines: 8 baseline,
  7 subject (one per village reaching the arc).
- The "unfinished" hits (8 baseline, 7 subject) are all the same scripted
  ARC IV beat, as in 1715Z — not a defect.
- The age-description fallback the 1215Z/1615Z arms logged ("Aria, the
  person in their 60s") did NOT recur in either corpus this run (0
  named+age cases out of 165 age-description hits). All 165 hits are the
  standard unnamed-villager template ("A woman, maybe 60s, with a
  scarred cheek returns with water: +4 clean." 8×; "A person, maybe 30s,
  with a scarred cheek — 🪾 Gather deadfall." 8×) — the same person
  doing the same chore across seeds, not within-village repetition, and
  never a named villager. The open backlog entry stands as-is (no
  recurrence to close or extend it).
- Siege/linger/treeline mentions: 8 on both legs (the same scripted beat
  per seed). Scholar deaths are NOT narrated in vetSays on either leg (0
  mentions) — the instrument's sample doesn't cover them; the per-seed
  death rows are where the scholar-death story lives (see §Lingerer-path
  diagnostic).

No robotic, static, or repeated-within-village narration was found. The
subject corpus reads the same as the baseline until the villages start
dying — the difference is in the dying, not the talking.

## Metric review (§14)

- The metric set held as written. The revised bar did its job: at
  baseline 6/8, CONFIRMED needed a 3-gap and the subject delivered a
  4-gap, so the mapping returned a verdict instead of going mute the way
  the old bar did at baseline 4/8. The gate (B ≥ 3) never bit — the
  fresh baseline read 6/8, comfortably above it — so the fallback band
  stays unspent for a future arm.
- The re-run rule was not exercised (S=2 is not AMBIGUOUS). It stays
  frozen for the next arm that lands in the AMBIGUOUS band.
- One instrument note for the next arm: total deaths FELL on the subject
  (677→644) while scholar deaths nearly doubled — a panel that only
  watched villageDeaths per run would have missed the effect entirely.
  The scholar-death / playerDeaths metrics are the ones that carry this
  mechanism; the prereg's choice of survived/8 as the primary plus the
  lingerer diagnostic as secondary was the right split.
- The step-script restore bug (see §Incidents) is now a known instrument
  property: any step script that rm-deletes scratch will fail its
  post-restore dirty check on step commits where that scratch is
  tracked. The fix (checkout-from-HEAD for tracked scratch) is in this
  arm's step script and asserted in the proof; future step scripts
  copied from the 20261115 original should carry it.
- The vetSays instrument does not capture scholar deaths: the
  scholar-death story lives only in the per-seed death rows. A
  future arm needing scholar-death narration should use the death-row
  diagnostic, not a vetSays grep.

## Incidents

- **Step-script restore bug (baseline leg):** the baseline leg's sims
  ran fully (8/8 per-seed files + summary, B=6/8) but the step script
  exited 1 at its post-restore dirty check: its `restore()` did a plain
  `rm -f` on the four shared 20261113 scratch files, which are TRACKED
  at the tip commit 605d72bd4 (the 2b-fresh arm never hit this because
  its step commits predated those files). No data lost: standing.js was
  already restored native (sha-verified), the corpus was complete, and
  the four files were restored from HEAD with `git checkout HEAD --`.
  The step script was FIXED on the arm branch (restore tracked scratch
  from HEAD, rm only untracked scratch), the proof gained an assertion
  for the fix, and the subject leg ran clean (exit 0) with the fixed
  script. The fix commit is c9d8e2d54.
- **Safe-commit index clobber:** struck 4× (prereg+tooling commit,
  step-script fix commit, subject commit — the subject one manifesting
  as `MM` on game.js). All repaired with the documented `ls-tree -r
  HEAD -- <paths> | git update-index --add --index-info` pipe; every
  commit verified correct (worktree hash == HEAD blob) before continuing.
- **/tmp cleared mid-run:** the machine restarted between the guard
  verification and the subject cut (uptime 17 min at the baseline leg);
  /tmp scratch from the guard check was gone. Nothing lost — the guard
  reference was re-derived from commit dc8cbd3f3 before the subject
  cut. Noted as a reminder that /tmp scratch does not survive a
  restart; the proof re-derives its references from git, not /tmp.
- **Baseline leg slow under load:** 9.6 min vs ~2 min on a quiet box —
  the box load average was 8.36 with Loop B siblings running. Not a
  failure; the leg completed clean (STEP-EXIT:0, errors 0). The subject
  leg ran in ~1.5 min once the box quieted.
- **No write flap** during this run (all writes succeeded first try).

## Commits on this branch

- `367c8aba9` sim-guardablate-fresh-a: binding prereg + proof stage 1
  green 83/83 + fresh-band tooling (committed BEFORE any judged sim)
- `c9d8e2d54` sim-guardablate-fresh-a: step-script restore fix +
  proof 88/88 (baseline B=6/8, gate PROCEED)
- (this commit) sim-guardablate-fresh-a: CONFIRMED — subject 2/8 vs
  baseline 6/8, evidence + step corpora + panel
- Subject branch (left in place, never merged):
  `transplant-guardablate-fresh-subject` at
  `ab856945d0a1def355f531dd05dd85addbcac0d7`
  (one commit: remove CASCADE lingerer guard, −16/+0, src/js/game.js only)

## Findings backlog

- [open] 2026-11-15 — measurement / RNG stream — a "dialogue-only"
  game-code change (journey-establishment r214 plain parting, convo-mood.js
  +16) moved the matched-band survival baseline 8/8→4/8: the new branch
  calls convoPickCycle → convoPick, which consumes one Math.random draw
  per friendly/neutral sitting close (measured live: 0 draws on b4343ac9d,
  1 draw on the tip), shifting the shared seeded RNG stream; trajectories
  diverge by day 5. No game-code change is survival-neutral until its
  RNG-draw footprint is checked. (Carried from sim-guardablate-a
  evidence; also appended to hidden_files/sim-findings.md there.)
- (carried, still open) narration — door-fight line renders a villager as
  "Aria, the person in their 60s" (name + age-description) where other
  villagers get just a name; likely a missing-name fallback leaking into
  vetSays narration. Did NOT recur in either corpus this run (0 named+age
  cases out of 165 age-description hits — all unnamed-template).

## Balanced panel (§15) — summary

See §Balanced panel above; compare file:
`evidence/2026-11-15/guardablate-fresh-a-panel.md` (decision
review_required; playerDeaths regression_signal +5.375, playerDeaths100Days
regression_signal +5.856, villageDeaths100Days regression_signal +7.330,
communityLost regression_signal +0.5). The panel is the instrument; the
prereg threshold is the judge.

## Convergence state

Scale-onramp: **converging, not converged**. The family-7 brain-side
question is now CLOSED by attribution (CONFIRMED on two independent
bands: matched 1/8 vs 4/8, fresh 2/8 vs 6/8) — the collapse regime the
family needed to explain was the guard's absence, not the align step.
But the wall itself is unchanged: national 0/8, table 0/8, wins 0/8 on
both legs of this arm, wave-5 readiness 1/8 → 0/8, and the binding gap
remains living veterans. The guard decides whether villages live long
enough for veterans to matter; it does not supply the veterans. The
next question for the scale wall is the veteran pipeline itself, not
another guard measurement.
