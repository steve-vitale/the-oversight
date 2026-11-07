# Journey leg ESTABLISHMENT — r111 run note (2026-11-07, Lane A)

Run id `laneA-20261107T1644Z`, scheduled Sat 2026-11-07 10:45 CST, lock
created 16:44:33Z. Leg 1 ESTABLISHMENT. Branch `journey-establishment`,
base `4e4158b77` (see Infrastructure — master moved during the flap).
Rotation 1→2 written at closeout.

## Pre-registration (summary — full text in `journey-establishment-r111-prereg.md`)
- **Leg question (fresh, named by r110's metric review):** the
  specialist/foodXp ladder is frozen (r110: 0 specialist moves, 0 foodXp
  moves on 4 seeds / 42 days). Is the ladder SHUT, or does it need a
  longer horizon / a specific trigger?
- **Q1 PRIMARY:** specialist/foodXp 0→positive on the matched panel +
  a live code-gate proof (proof test, before the panel). Bar GO if ≥1
  ladder move on ≥2/4 seeds; NO-GO if 0 moves on all 4 seeds. Expected
  NO-GO stated up front (r110 corpus: foodXp 0 everywhere, trigger never
  pulled); the verdict names the mechanism: SHUT vs UNEXERCISED.
- **Q2:** menu:more → (null) fix — `convoNextMenu` returns no line,
  blanking the inline dialogue box on a pagination tap. Bar FIXED iff the
  proof test passes after the fix (and failed before it) AND 0 `(null)`
  THEM lines across the 16 people-check convos.
- **Guardrails:** M3 survival-42 (≥3/4 alive at 42), M4 pantry (0
  starvation deaths on ≥3/4).
- **Seeds:** matched reuse 1502, 1504, 1603, 1604. Policies: competent +
  withHuntStaff, HUNTSTAFF=2. Horizon 42d.

## Infrastructure notes (loud first)

- **EPERM flap, ~70 minutes (16:44–17:54Z) — the run's defining event.**
  O_EXCL file creation refused filesystem-wide (all four probe locations)
  while plain truncating writes worked. Registration failed twice in the
  window (checkout unable to write files; then the leftover branch could
  not be deleted — packed-refs.new EPERM). Probes every ~5 min, all EPERM,
  until a single success at 17:54:07Z. Plain-write probes passed throughout
  — O_EXCL is the flap's fingerprint, per the recorded class.
- **Lock deleted by the 17:45Z run, re-created by this run.** At 17:45:11Z
  the lock file was gone: the incoming Lane A run found no registered
  tree / heartbeat for this run_id and deleted it per the overlap guard
  (this run was alive but flap-blocked, with no tree to heartbeat — the
  guard's known blind spot for a run that cannot register). By 17:45:30Z
  no lock existed at all — the incoming run had already failed and ended
  (it would have hit the same flap / the leftover branch at registration).
  This run re-created the lock at 17:45:58Z (same run_id
  `2026-11-07T16:44:33Z`, fresh timestamp) with no lock in place and no
  live sibling holding one, and kept it until closeout. If the flap had
  lasted past the next run's start, this run would have stood down instead.
- **Master moved during the flap:** the ship loop landed version bump
  `4e4158b77` (17:54:16Z, version files only: index.html/build.js/sw.js/
  version.json — no src/js, no scripts, no evidence). The worktree
  branched from the fresh tip; no stale-base risk. The r111 panel therefore
  runs on a NEWER engine than the r110 reference panel (see Funnel
  divergence, below).
- **Registration completed exit 0** after the flap cleared (branch deleted
  + re-registered, ~5 min checkout). Heartbeat at registration + panel +
  closeout. **No lock existed at start** (this run created it).
- **Safe-commit index clobber struck on BOTH commits** (known class):
  committed files showed staged-as-deleted (substrate) / MM (fix).
  Repaired per the recorded recipe (`git update-index --add --cacheinfo`
  with HEAD blob, hash-object verified first); verified `git status`
  clean + `git diff HEAD` empty + blobs match after each repair. Commits
  18d9f1d15 (substrate) and ab77e48b3 (fix) are correct.

## Verdicts
- **Q1 SPECIALIST LADDER: NO-GO — SHUT + UNEXERCISED (as pre-registered).**
  Panel: 0 specialist 0→positive moves, 0 foodXp 0→positive moves on
  4/4 seeds; dEnd foodXp total 0; +1-rung pool 0 villagers at xp≥5,
  0 stepped; wasted XP 0. Per-seed ladder lines: 1502 occSkillCells 1,
  1504: 2, 1603: 5, 1604: 4 — occupation skill EXISTS on 3/4 seeds but
  sits at xp 0. Gate proof (proof test, live code, 34/34 green):
  fisherman butcher xp5 → 3 (the +1 rung exists for holders), xp4 → 2
  (the threshold is real), baker cook xp5 → 3, beekeeper preserver
  xp5 → 2 — but forager butcher xp100 → 0: **100 XP cannot buy skill 1
  from 0**. The bottom rung does not exist in code, and the trigger that
  feeds the top rung (`askSpecialist`, the only foodXp source) is never
  pulled in 42 days of competent play. Both halves of the r110 question
  are answered: the ladder is SHUT at the bottom and UNEXERCISED at the
  top. The fix (let foodXp build skill from 0, or grant foodXp through
  village processing) is a lever decision for Steve / a build run with a
  balanced panel — not a silent change here. Proposal in Metric review.
- **Q2 menu:more → (null): FIXED.** Proof test before-FAIL recorded
  (ignored branch returned `{"ignored":true,"navigation":true}` — no
  `line` at all) and after-PASS green (34/34): both convoNextMenu
  branches now return the current line (last 'them' transcript text).
  Panel: **0 `(null)` THEM lines** across the 16 people-check convos.
  Caveat, stated plainly: 0 navigation turns occurred on this panel
  (no menu:more pick was taken in the 16 convos), so the panel proves
  the absence of nulls, not a live pagination — the live exercise is the
  proof test's X/Z/AA checks on a real harness convo (ignored + paging
  branches both return the current line). The inline box keeps showing
  what they last said while the menu re-pages; the full-screen chat's
  navigation guard is untouched.
- **FUNNEL-REPRO vs r110: DIVERGED — investigated, explained (engine
  movement, not driver drift).** All 4 seeds diverge on alive/pantry/
  deaths/teleTypes/skillCounts/huntStaff/daily/convo. The isolation test
  settles it: the r110 driver run on the CURRENT engine reproduces the
  r111 driver's funnel keys EXACTLY on all 4 seeds (identical endDay/
  alive/pantry/deaths/daily/teleTypes/skillCounts/huntStaff), so the
  r111 driver changes (snapshot timing, navigation logging) are
  trajectory-neutral. The divergence is the engine moving between the
  reference panel's base (2016a7ed0) and this panel's base (4e4158b77):
  xp-gear landed (game.js/tracks.js/skill-teaching.js/abilityActions.js/
  godpath.js/convo-wants.js/bond-initiation.js/convo-dialogue.js/
  safetynets.js/fieldFights.js/tracks.json/items.json/characterGen.json),
  the finishing instrument landed (finishLog.js + fieldFights.js +
  game.js), the endgame death-dedupe fix, the scale linkraise, and the
  r115 Miriam data fix. The awayconfirm note already recorded xp-gear
  moving trajectories ("leg E 17 vs 10 on seed 98000 from xp-gear src/js
  movement"). The det-gate (day-6 keys match r110) shows the engines
  agree through day 6 on seed 1502; the divergence develops later.
  Consequence: the r110 reference is retired for funnel comparison — the
  NEXT establishment run compares against the r111 panel (same engine
  lineage) or re-baselines explicitly.
- **Snapshot-timing fix: WORKS.** All four snapshots fire on all four
  seeds now: 1504 d14 at day 15 (r110: missed), 1603 d28 at day 29
  (r110: missed). The r110 d14 gap is closed.
- **M3 SURVIVAL-42: 4/4. M4 PANTRY: 4/4** (0 starvation deaths).
- **Telemetry: quiet** — `telemetry-check` on the 4 r111 files vs the
  establishment baseline (metrics systemDay, monsterKills): no large
  deviations. Baseline NOT rolled. (The baseline is a gate-off control;
  this panel runs HUNTSTAFF=2 — the check stayed quiet regardless.)
- **Practice (continuity, descriptive):** moved/attributed cells
  d1→d14: 20/20, d14→d28: 33/33, d28→dEnd: 22/22 — all on 4/4 seeds.
  Practice reps at dEnd: 1,961. 193 npcSkills gained panel-wide.
  Competence keeps moving in month 2 (r110's Q1, third panel running).
  By task d28→dEnd: wood 7, cook 6, water 4, stone 4, hunt 1 (Caroline,
  1504 — the first hunt-competence move on this leg).

## Village assessment (plain words)
Four villages, 42 days each, all still standing at the end:
- **1502 (10 alive, wave 3, pantry 40k):** the fighting village. Ethan
  the trail-crew lead killed a black bear and dressed it himself —
  45,209 kcal from one field_dressing kill, the first holder kill on
  this leg (r110: 0). George died of a wound that wouldn't close (day
  26); the player (Aubrey) died in the wild (day 38) and the village
  carried on. Chen the pharmacist is still tending wounds; Maureen the
  vet taught Ethan a lesson on day 34 (the panel's only successful
  lesson). Ethan is becoming the village's builder-hand AND its hunter:
  wood/stone/water/cook all stepped in the second month.
- **1504 (10 alive, wave 3, pantry 95k):** the fat village. Only one
  villager lost all run (Nikolai, to a monster, day 38). The pantry is
  more than double anyone else's. Pavel the bush pilot hunted hard (29
  kills) but no teacher was ever at home for him — 7 prep calls, all
  no-teacher. Caroline's wood/stone/deadfall/water/cook all stepped;
  her hunt competence moved too (1→1.3, the leg's first).
- **1603 (9 alive, wave 3, pantry 30k):** the hard village. Ursula the
  mortician died of a wound (day 19), Cristina of sickness (day 20),
  the player twice over (Carmine to a stranger, day 23; Ethan in the
  arena, day 28) — and the village carried on both times, which is the
  succession working as designed. Wave 4 did NOT arrive here this time
  (r110 reached it) — the engine movement reshuffled the wave timing.
  Paolo the zookeeper and Landon the tailor are visibly becoming
  builders; Zoltan the mushroom grower cooks now.
- **1604 (8 alive, wave 4, pantry 30k):** the lean, farthest village.
  Wave 4 reached; three lost to monsters (Sarah day 29, Daniyar day 32,
  Juan day 41). Deirdre the midwife is alive at the end this time (in
  r110 she died on the last day). Rahul the crossing guard formed the
  party and named it APEX SNACKS; Emma the vet learned field_dressing
  in the first fortnight.
- **What they know:** 193 skills gained across the panel (track_read,
  wound_care, steady_hands, diplomat, gossip_network lead). Skills
  spread villager to villager — teaching works, and for the first time
  on this leg a HUNT-PREP lesson succeeded (Ethan ← Maureen, day 34).
  Two more lessons were attempted and failed honestly on language
  (Juan ← Rahul, Juan ← Emma, days 37–38 — the 'words' rung firing for
  the first time; the teacher was at home and the words weren't there).
- **What is missing:** the specialist ladder (Q1 NO-GO, above). A few
  villagers start with specialist depth from their old job (butcher 2–3,
  preserver 3, spotter 2–3) and it never grows; nobody else can ever
  gain it. Competence moves, skills spread, but specialist depth does
  not — the same gate sim-practicemove-a named, now proven shut in code.
- **Care:** triage USED (DeShawn tended 2 in one tick, four times);
  168 care ticks, 61 tends, 42 healer rounds. Herbal remedy,
  preserve_food, wound_care, diplomat all HELD-UNUSED on the end
  snapshots — the same shape as r108/r109/r110. Field_dressing holders
  exist (4) and one finally hunted (Ethan's bear).
- **Hunt prep:** 16 prep calls; 3 lesson attempts (1 ok, 2 words-fails),
  13 no-teacher. The words rung is exercised at last — and it fails
  honestly on language, which is the rung working as designed, not a
  defect. The teacher-at-home half (1/16 calls with a teacher present)
  stays thin.

## People check (16 held convos read in full)
**0 stalls, 0 null lines** across 16 conversations. Villagers act like
people:
- **Wants that are real:** Chen is sick and needs hands; Ezequiel and
  Paolo both carry a taken sibling / grandfather in the pods and the
  player OWES them an ask to the System; Quinn is practicing what she'd
  say if she ever saw her family again; Giulia can't reach a wound and
  needs it cleaned; Zoltan doesn't talk about who he left behind —
  "saying it out loud makes it real in a way I can't afford yet.
  Someday. Not today."
- **The nonverbal system works:** Simran (Hindi-only) holds a full
  conversation in gesture and the speak-back beat lands again ("You said
  that BEAUTIFULLY. It means nothing like what you think it means.").
- **Grief is remembered:** Quinn mourns Aubrey ("Aubrey is gone and the
  world just... continues. That's the part I can't stand."); Dwayne
  notes "everyone's thinking about Aubrey. The quiet ones worst."
- **Party naming lands:** Rahul's party becomes APEX SNACKS by player
  pick, with the roles menu offered right after ("Roles. Not ranks —
  promises."). (APEX SNACKS was also the System's first suggestion on
  the r110 panel — the suggestion pool offers it deterministically; noted,
  not chased.)
- **Blemishes (documented, not fixed here):**
  1. The taken-sister Wanda beat fires verbatim for two different
     villagers (Tama, r110; Caroline, r111) — same sister name, same
     pod-dream line word for word. The younger-sister slot seems to
     always be Wanda. Narration-pool work, Loop B owned (same class as
     the gossip-repeat).
  2. Sebastian (1504) restates the teach-me want twice in a row
     ("Teach me something" → "I'd like to learn something I can use
     today") right after agreeing — the same mild repetition as r110's
     Omar.
  3. DeShawn's r110 thin spot is repaired by the engine movement, not
     by a fix: his thread this panel is regrets, and it develops into a
     specific memory (rushed Columbus mornings he'd pay anything to get
     back).

## Blanks filled / documented
- **Filled:** the specialist-ladder question (Q1 NO-GO with the gate
  proof — the ladder is shut at the bottom and unexercised at the top).
  The menu:more → (null) line (Q2 FIXED — engine fix + proof test
  34/34 + 0 nulls on the panel). The d14/d28 snapshot gap (first-day-≥
  rule — all four snapshots fire on all four seeds now). The words rung
  is exercised for the first time (2 honest language failures + 1
  successful lesson). The first field_dressing holder kill on the leg
  (Ethan's black bear, 45,209 kcal).
- **Documented, not fixed:** the funnel reference is retired (r110's
  panel ran on a pre-xp-gear engine; the next run compares against r111
  or re-baselines). The Wanda-beat verbatim repeat (Loop B narration
  pool). The teach-want double-restate (same class as r110's Omar).
  The prep funnel stays thin on the teacher-at-home half (1/16 calls
  with a teacher present). The `menu:more` panel exercise: 0 navigation
  turns on this panel, so the live pagination proof is the proof test,
  not the panel.

## Reachable / fun / winnable (establishment leg)
- **Reachable: yes.** Every establishment beat fired on 4/4 seeds:
  routines, specialists, pantry, first contests (3–5/seed), wave 1–3
  everywhere, wave 4 on 1/4 seeds by day 42 (r110: 2/4 — the engine
  movement reshuffled wave timing, not the leg's reachability).
- **Fun: yes, with thin spots.** The villages feel alive — competence
  visibly moves, skills spread, conversations carry real wants, grief
  and jokes, and a hunt-prep lesson finally succeeded. Thin spots: the
  prep funnel is still mostly dry on the teacher side, the Wanda beat
  repeats verbatim across villagers, one teach-want restates itself.
- **Winnable: the leg does its part.** Practice keeps working in month
  2 (22 attributed cells, 4/4 seeds) and the hunt-prep lesson finally
  fired. The binding link stays downstream (wild wave-4 kills →
  veterans → readiness), owned by the winnability rounds; nothing in
  this leg blocks it, and the frozen specialist ladder is now a proven
  shut gate with a concrete fix proposal (see Metric review), not just a
  measured zero.

## Metric review (for the NEXT run, not this one)
- **Specialist-gate fix proposal (Q1 NO-GO follow-up):** the gate proof
  shows the fix is a small, well-scoped lever change in
  `specialistSkill` (food.js:1230-1240): let foodXp build skill from 0
  at a higher threshold (e.g. 10 XP buys skill 1, then the existing +1
  at 5 XP per further rung), OR grant foodXp through the village's own
  overnight processing so the trigger is pulled without the scholar
  asking every time. Either needs a design decision + a balanced panel
  (16 matched seeds, before/after) — a build run, not a silent change.
  The ROLE PATHS commitment (Steve 2026-11-04: skill builds from zero)
  is the standing order it serves.
- **Funnel reference retired:** the next establishment run compares
  against the r111 panel files (same engine lineage) — or states a
  re-baseline explicitly. Comparing across a landed lever build without
  saying so is how a DIVERGED verdict gets misread as driver drift.
- **Words rung:** exercised at last (2 honest failures + 1 success).
  The next run should report lesson attempts/oks/words-fails as a
  standing line, not a novelty.
- **Same-animal held/notheld kcal ratio:** measurable at last — 1 held
  kill (Ethan's bear, 45,209 kcal) vs 38 not-held hunt kills. The
  analyzer prints by-aid held/notheld; the next run should quote the
  ratio.
- **Wanda-beat / teach-restate repeats:** narration-pool work, Loop B
  owned; third sighting of the repeat class across r109–r111.
- **`menu:more` → (null):** fixed this run (Q2); the standing check is
  now "0 null THEM lines on every panel" — this panel is the first
  clean one.
- **Metric held:** Q1's bar (≥1 ladder move on ≥2/4 seeds) measured what
  it claimed — the ladder moving, not just competence moving. The
  expected NO-GO was stated up front and the mechanism diagnosis (gate
  proof + panel zeros) is the verdict, not a re-score. No re-score was
  needed or done.

## Regression + telemetry
- Proof tests (this run, on the branch tip): r111 ladder proof test
  34/34 green (before-FAIL recorded on the menu:more checks: the ignored
  branch returned no `line` at all; after-PASS on the fixed engine).
  Det-gate green (5d seed 1502 reproduces r110 day-6 funnel keys).
  Isolation test green (r110 driver on the current engine reproduces
  the r111 driver's funnel keys exactly on all 4 seeds).
- check.js --quick: 284 passed, 6 failed (627s, exit 1) on the branch
  tip, run twice with identical counts — the six are exactly the known
  pre-existing set, no new failures: measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20 racks-full voice gate
  (`test-establishment-r20-fixes-20261020.js`: "next day voices once
  more (gate resets daily): expected 2, got 1"). Bar met.
  (Re-run after the rebase onto 000b8701: proof test only, per the
  task body's rebase rule — see Closeout notes.)
- **Telemetry deviation check:** `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/establishment.json --current
  'evidence/2026-11-07/journey-establishment-r111-seed*.json' --metrics
  systemDay,monsterKills` → quiet (4 files, 2 metrics, no large
  deviations). Baseline NOT rolled.

## Next run (no r112 driver prepared)
Rotation advances to 2 (deepening) — the next three Lane A runs are other
legs, so no establishment r112 driver is prepared here. The next
establishment run prepares its own driver from the r111 driver and
re-verifies its seed band fresh across all dated preregs (matched reuse
1502/1504/1603/1604 continues; no new band claimed here).
Carried to the next establishment run: the practice snapshot is a
standing instrument (report d1→d14, d14→d28 and d28→dEnd side by side,
with the first-day-≥14/≥28 rule); the r111 ladder analyzer section is
the standing instrument for the specialist question (retire the
holder-dating section — r110 GO, hole closed); the funnel reference is
the r111 panel (see Metric review); M-PR1/M-PR2 are landing-leg lines,
not this leg's; the words-rung lesson line (attempts/oks/words-fails)
and the held/notheld kcal ratio are standing descriptives; the menu:more
standing check is 0 null THEM lines on every panel; report starvation
deaths per seed alongside the M4 gate.

## Closeout notes
- **EPERM flap:** ~70 min (16:44–17:54Z), O_EXCL refused
  filesystem-wide; registration failed twice; the 17:45Z run deleted
  this run's lock (no heartbeat — the run was alive but unregistered)
  and ended; this run re-created the lock at 17:45:58Z with no lock in
  place. Flap cleared 17:54:07Z (single-success probe). No run data was
  lost (all substrate was drafted under ~/workspace during the flap).
- **Master moved during the flap** (ship-loop version bump 4e4158b77);
  the worktree branched from the fresh tip. The r111 panel runs on a
  newer engine than the r110 reference — the funnel divergence is
  engine movement, proven by the isolation test (see Verdicts).
- **Index clobber struck on both commits** (known class): repaired via
  HEAD-blob `update-index --add --cacheinfo`; verified status clean +
  diff HEAD empty + blobs match after each repair.
- **Rotation:** leg 1 played; `2` written to `journey-rotation-a.txt` at
  closeout, verified by read-back.
- Lock (`2026-11-07T16:44:33Z`, created 16:44Z, re-created 17:45:58Z)
  and heartbeat loop are removed at closeout after the merge, once
  run_id is read back; see `~/memory/2026-11-07.md` for the closeout
  record.

## Evidence
- `evidence/2026-11-07/journey-establishment-r111-prereg.md`
- `evidence/2026-11-07/journey-establishment-r111-seed{1502,1504,1603,1604}.json`
- `evidence/2026-11-07/journey-establishment-r111-convo-seed{1502,1504,1603,1604}.txt`
- `evidence/2026-11-07/journey-establishment-r111.md` (this note)
- `evidence/2026-11-07/journey-establishment-r111-analysis.txt`
- `scripts/journey-establishment-r111-20261107.js`
  `scripts/analyze-journey-establishment-r111-20261107.py`
  `scripts/test-journey-establishment-r111-ladder.js`
