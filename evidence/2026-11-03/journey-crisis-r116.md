# Journey crisis r116 — one village stands, two die out, and two real fixes land (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: a 04:00Z r115 attempt on 2026-11-03 wrote a prereg
and a retry harness but died after its first seed produced a 0-byte
JSON (container EPERM flap signature) — no worktree, no panel data,
no memory note. Its r115-panel/ is left intact as evidence of its
death and is NOT overwritten. This run takes r116 so filenames stay
unique; the rotation file, not the number, is the authority.

Substrate r111 EXACTLY (policy oracleV2, 120d death-aware +10d tail).
Instrument: r111 driver/analyzer verbatim EXCEPT filenames r116,
pilot seeds 11601/11602/11603, evidence dir 2026-11-03 panel subdir
r116-panel. Diff r111 -> r116 reviewed: only renames.
node --check clean on driver, analyzer, and both proof tests.
Determinism leg: seed 11601 re-run BYTE-IDENTICAL (panel JSON and
all 8 of its transcripts), so the fork is trajectory-neutral.
Seed runs use the dead r115 attempt's retry harness, adapted:
driver invoked from THIS run's worktree (never the main tree),
output validated (parses, no `error`, carries a census) before
acceptance. All three seeds ACCEPTED on attempt 1.

## Run setup — stale lock, probe refs, flap, then a clean run

- Stale-lock recovery at run start: lock file held run_id
  2026-11-03T05:58:29Z (r114's lock, left when r114 died before
  closeout) with NO registry entry for that run_id, so per the
  overlap guard the previous run is DEAD no matter how fresh the
  lock looked. Lock deleted, fresh lock written
  (2026-11-03T07:58:53Z), to be deleted at closeout.
- Probe-ref fetch block, fixed: a leaked 0-byte probe file in
  .git/refs/heads (__probe_r88.tmp, 11 min old) made every fetch
  fail with "bad object". It is not a ref (0 bytes, probe-named)
  and was removed, after which fetch works again. A stale
  __probe_r80.lock (2.5h old) was removed with it. Local master
  was already ahead of origin/master (remote is an ancestor), so
  the blocked pull would have been a no-op. Sibling runs: if
  fetch ever fails with "bad object" on a __probe_*.tmp name
  again, that file is the cause, not the network. (Same class as
  r114's __probe_r113__.tmp / __probe_r113b__.tmp.)
- EPERM flap throughout pre-flight: `git status` failed repeatedly
  on `.git/index.lock` writes, a `cp` of the index failed, and a
  lock-file write landed 0 bytes before a retry landed full
  content. All flap-sensitive writes in this run are verified
  after writing (non-empty + content check); a 0-byte "success"
  is treated as a failure and retried. The flap also truncated
  the dead r115 attempt's seed JSON — same signature.
- Worktree slug deviation, documented: the body slug journey2-crisis
  could not be registered — branch journey2-crisis already exists
  (0 ahead / 898 behind master, stale, no held work). This run
  uses journey2-crisis-r115 (the slug the dead 04:00Z r115 attempt
  had planned; number/slug split documented in the prereg, not
  hidden). Same class as r88/r90/r93/r96/r99/r103/r107/r111/r113/
  r114. Heartbeat VERIFIED by registry read-back, and the standing
  10-minute heartbeat loop runs with a readable log (never
  /dev/null).
- Orphaned Lane B trees inspected, not touched: journey2-crisis-r113
  and journey2-crisis-r114 hold ONLY untracked evidence/drivers
  from their own runs (branches 0 ahead of master) — no stranded
  game work. journey2-succession's registry entry is stale (no
  directory on disk). Reap reports 12/16 active; the cap is not hit.
- Pre-flight: main tree clean (`git status --short` empty on a
  flap-free attempt), disk 28% (df -h ~). `worktree-reap.sh` ran;
  dirty trees LOUD-protected and untouched.
- Smoke test first, into a scratch dir (not the panel dir, so the
  panel stays pristine; scratch dir removed after): SEED=11601
  DAYS=5 proved the doAction wrap runs (46 tick-part samples,
  verbs forage; favorNoLongerCalls [], instrumentErrors []) before
  the panel launched.
- Canon: docs/CANON.md read before playing; docs/DIRECTIVES.md
  re-read; repo AGENTS.md (worktree copy) read. Gating freeze
  (2026-10-27) untouched. No canon doc covers crisis-as-a-leg
  directly; the leg's systems are covered by DISEASES.md (sickness
  deaths here: one), MONSTER-WAVES.md (raider sets), and
  CONTESTS.md (moots) — none reinvented, none changed.

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds
## 11601 / 11602 / 11603, sequential, all exit 0 first attempt, all parse-verified)
EVID: goal hidden_files/evidence/2026-11-03/r116-panel/.
Analyzer output: panel section below (analyzer run against the
panel dir; per-seed JSONs are the record).
Pilot-only per §9-12: the pilot answered the leg's questions
(including a refusal panel, the F1 self-convo investigation, and
both fixes below), so no panel expansion; the r111 / r113 / r114
panel seeds were NOT re-run.

- 11601: GAME OVER (extinction), 99 loop days (say-day 103). 6
  raids, 3 gorge nights (2,500 kcal), 0 sorties, 8 convos. Ends
  0 alive / 0 kcal. 20 corpses.
- 11602: HORIZON, 120 loop days (say-day 121). 9 raids, 10 gorge
  nights (8,356 kcal), 2 sorties (2 ok), 8 convos. Ends with 9
  alive (Tariq, Dale, Henry, Ella, Stephen, Luis, Diana, Theobald,
  Fatima) / 17,762 kcal. 4 corpses.
- 11603: GAME OVER (extinction), 49 loop days (say-day 50). 5
  raids, 12 gorge nights (10,000 kcal), 2 sorties (2 refused),
  7 convos. Ends 0 alive / 0 kcal. 16 corpses.

HEADLINE, stated plainly: 1 of 3 villages reaches the horizon
(r113: 1/3, r114: 1/3, r111: 0/3). The two that fell did so on
attrition and the famine clock — not on any siege gate (see C1).
The 1/3 shape reproduces a third time on the current base.

## C1 (bend, not break) — GO
- Gates hold per C2, and every game-over has a named cause that
  is NOT a siege-mechanic failure:
  - 11601: extinction — "No one is left to pick up the Codex.
    The village dies out" (day 103, after final bearer Ruth
    Goldstein dies to the wild). Attrition across the wild (8),
    monsters (5), contests (4), arena, night, pit trap — plus
    thirteen mantle transfers as bearers died one after another
    (Stella -> Ethan -> Desmond -> Owen -> Amina -> Esteban ->
    Dominic -> Arnold -> Alexandra -> Nadezhda -> Greta -> Boris
    -> Axel -> Hung -> Ruth). Not a stuck siege.
  - 11603: extinction — same closing line (day 50, after final
    bearer Ruth Goldstein dies to the wild). Attrition across
    monsters (7), the wild (3), starvation (2), dehydration,
    sickness, arena, thirst. Not a stuck siege.
  - 11602: no game-over — horizon with 9 alive and a full pantry.
- C1(ii) is therefore satisfied as written. The horizon count
  (1/3) is reported alongside it as the headline, not folded
  into the gate.

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 6 / 9 / 5. Fought resolutions on all
  seeds (every resolution list includes fought).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); legacy count 1 (11602 d107, corpse-counting
  method only — the prereg judges TRUE, so this does not fail C2).
- D1 snapshots all delayed >= 3 attempts: 4/4.
- deltaBad empty (4 attempts, 2 ok, 2 refused, deltaExact 2).
  D3 drift unknown = 0 (labels panel-wide: player-drawn-off 8,
  sortie-clear 1).
- MISSED-WINDOW total = 0 on all seeds (tick-part samples with
  waited>=3 after lastSeenDay: none) — down from r113's 6 and
  r114's 4. The boundary sampler had no blind-spot cases here.
- Days-tail wobble persists, same class as
  r70/r71/r82/r85/r88/r90/r93/r96/r99/r103/r107/r111/r113/r114:
  loop days vs max Game say-day 11601 99 vs 103, 11602 120 vs 121,
  11603 49 vs 50. Judge bands, not counters.

## C2b (linger-conditional gorge/sortie) — GO, third refusal panel
- Lingerer sets form on all seeds. Gorge nights: 3 / 10 / 12
  (25 total, 20,856 kcal eaten at the treeline).
- Sorties: 4 attempts, 2 ok, 2 REFUSED — both refusals carry the
  recorded reason 'no-fighters' ("the bench is bare"), both on
  11603 d50, same 4 targets, attempts 1 and 2 the same day. The
  d50 re-attempt is refused again — not a re-muster success.
  This is the third refusal panel in the series (r111, r113,
  r114, now r116).
- Clear rate on ok sorties: 0/2 full clears — 11602 d51 broke
  with Buffering remaining (leader Tariq Mahmood vs Buffering ->
  vFlee, 17 taken); 11602 d107 cleared 1 of 2 (Terms of Service
  fled, mFlee) then broke on Big Loud (vFlee, 78 taken). No
  sortie death this panel. W1 (does a re-muster ever FULLY
  clear?) stays UNANSWERED in the strict sense: no full clear
  yet on any panel.
- W3 stays ANSWERED (r107): no weak-target break this panel.
  The d107 1-HP Terms of Service fled (mFlee, counted cleared),
  it did not make the sortie break on a gimme — the break came
  on the second fight, against Big Loud at 83 HP.
- 11601 has zero sorties because its sets never reached the
  3-night boundary with fighters to send (gorge nights: 3, all
  drifts player-drawn-off with nightsWaited 1). No
  boundary-firable case went unfired on any seed.
- Boundary-sortie cross-checks read ok:true on both ok sorties;
  ok:false on the 2 refusals is the expected shape (a refusal
  is not a fired sortie).
- gorgeAfterCleared (name-matched) = 0 this panel — no
  cleared-monster-gorging lines, no repeat of the r103/r107
  shared-"redactor"-id over-match class. deadInMusterLines = 0.

## WRAP-CHECK (instrument integrity) — GO
- wrapMissing false on all seeds; doActionWrapMissing false on
  all seeds; instrumentErrors []. Tick-part samples: 997 /
  1168 / 452 (verbs forage/wait/drink).
- Ending-turn dump re-verified mechanically: every ending-turn
  case in the driven transcripts shows its outcome line in the
  driven file, and the one cap-ended transcript (11603 d23,
  "(conversation refused/ended)") carries no outcome line owed.
  The r88 fix stands proven again.
- Determinism: seed 11601 re-run BYTE-IDENTICAL (panel JSON and
  all 8 of its transcripts).

## C3 (people check) — GO, with one game-state defect (fixed below)
Read in full: all 23 driven transcripts. fabricHits 0 panel-wide
(analyzer: 0; JSON fields [] on all seeds).
- NPCs want concrete things: festering wounds ("If it festers
  I'm no good to anyone — can't haul, can't hunt, can't watch"),
  hunger ("My stomach's been empty so long I've stopped feeling
  it"), sickness ("Rest won't touch this. The heat's climbing
  and my head's full of cotton").
- Grief is grounded in real deaths: Dominic d47 mourns Desmond /
  Owen / Amina (died d44/45/46); Alexandra d54 mourns Nora /
  Esteban / Ivy / Dominic; Greta d60 mourns Arnold / Alexandra;
  Tariq d86 says "Esther's gone" — Esther Holmes died to the
  wild on d49 in the same run's census. Adebisi d24 mourns
  Shannon and Nora; Onora is mourned d41 after talking d32.
- Field teaching runs both ways: Adebisi teaches Patauá and a
  cellar full of jars. Gifts carry real consequences: Esther
  presses a decent kept tool into the player's hand.
- Confrontations spend out: "We went over this. I already told
  you the truth about that." Details pressed spend out ("We've
  covered this one. Ask me something else."). Repeated asks
  escalate, then close — never loop: favor requirements climb
  plain -> "As I said —" -> "Like I said —" -> "Still the same
  thing —" -> "I've told you three times now —".
- Invitations are sometimes taken, with character: eager accept
  ("Yes. Absolutely. I've been hoping you'd ask."), "Alright.
  But I'm not carrying your stuff.", decline ("I work alone.
  Nothing personal. ...It's a little personal", "Not right now.
  I've got my own things to handle").
- Favor states stay honest: Dale's food_share reads 'moot'
  ("already closed") d41 — a proper state, not an error.
- Capture-order swap, instrument artifact (same class as r114
  d22): 11602 d21 prints one YOU line after its NPC response
  mid-transcript. The conversation itself is coherent
  (escalation -> close) and the engine marker is present, so
  nothing was swallowed.
- THE DEFECT (game state, not dialogue writing): 11601 d102 is a
  self-conversation — the player talking to Ruth Goldstein the
  day after Ruth inherited the mantle (see F1). The dialogue
  itself is coherent; only the favor probe footer (isPlayer
  true) reveals it. Fixed below; the driver is hardened too.

## F1-inherited (favor call-time cause) — ONE OCCURRENCE, INVESTIGATED, ROOT-CAUSED, FIXED
- The call-time wrap installed cleanly and logged 1 entry
  panel-wide (11601 d102, Ruth Goldstein, food_share, 'asked',
  34 engine calls, rosterIncludes true, isPlayer true,
  personExists true, personDead false, vpDead false).
- Disjunct named at call time: NOT death — the self disjunct
  (convo-wants.js: `vid === this.villagerId`). Mechanism, proven
  from the record: Ruth was sheltered as an NPC; on day 101 the
  mantle passed to her ("You wake up somebody else. Ruth
  Goldstein, 71 — a librarian"); her shelter flag survived
  succession; on day 102 the driver's SHELTERED pick took sh[0]
  with no player exclusion (the defender branch already excludes
  the player; the sheltered branch did not) and drove a convo
  with the player character as NPC. The engine correctly blocked
  the self-favor; the defect is the stale flag + the unguarded
  pick, not the favor guard.
- Fix (this run, proof-tested): ledger.js playerDeath clears the
  successor's shelter flag next to the other new-body resets
  (the shelter verb never musters the scholar, so a sheltered
  scholar is stale by construction; other villagers' flags are
  untouched). Driver hardening in the same run: the sheltered
  pick now excludes the player, so a future stale flag can never
  produce a self-convo again.
- F1 as a measurement question stays CLOSED: the line fired for
  the documented self disjunct, not for a second dead-id path.
  No dead-id occurrence this panel (personDead false on the one
  entry; all other probes personDead false, vpDead false).
- Carried observation, not a fix: the d102 probe also shows
  away:true for Ruth with scholarInside false / npcInside true
  — NPC-side position records for a new bearer. No defect was
  proven from `away` alone (the convo came via the shelter pick,
  not via away), so `away` is left untouched and noted here.

## Q2/Q3 — no reopening
- No succession-picks-a-dead-member case, no dead ambient
  speaker this panel. Q2/Q3 stay closed per r114.

## C7 (famine/disease pressure census, descriptive, no bar)
- 11601: pantry low-water 0 kcal (gameDay 51), ended at 0. 20
  corpses, 0 famine, 0 sickness: the wild x8, monster x5,
  contest x4, the arena x1, the night x1, the village's own pit
  trap x1. Extinction d103. The famine clock never ran to
  scattering — attrition killed the village first.
- 11602: pantry low-water 0 kcal (gameDay 53), ended at 17,762.
  4 corpses, 0 famine, 0 sickness: the wild x3, monster x1.
  Horizon with 9 alive — the village that stood while hungry
  (same shape as 11403).
- 11603: pantry low-water 0 kcal (gameDay 38), ended at 0. 16
  corpses, 2 starvation, 1 sickness, 1 dehydration, 1 thirst:
  monster x7, the wild x3, starvation x2, dehydration x1,
  sickness x1, the arena x1, thirst x1. Extinction d50 — the
  only panel seed with a sickness death, and famine pressure
  (starvation + dehydration + thirst) visible alongside it.
- Scattering-clock note: neither game-over reached scattering
  (both are extinctions), so neither seed's famineLimit (3, or 5
  with a sealed granary per r114's correction) is exercised here.
  The granary path is not re-tested by this panel.

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r85/r88/r90/r93/r96/r99/r103/r107/r111/
  r113/r114: also 0). The phoenix per-event respawn cascade did
  not recur. The Steve-call stands unchanged.

## BLANK STATUS: two blanks filled, W1 carried, W4 closed
- W4 (naming-debate third-person wrinkle) CLOSED BY FIX this run:
  convoTopics.js t2gen_lately 'naming' case now renders the
  first proposal first-person when its proposer is the speaker
  ("I'm pushing 'Loud Beast'"), third person unchanged for
  everyone else. Proof test scripts/test-naming-debate-self-
  20261103.js: FAILED before the fix on all 3 seeds (6 failures,
  reproducing the r103/r114 shape verbatim), ALL PASS after.
  This panel did NOT recur W4 (no naming-debate lines in any
  driven transcript) — the fix is proven from the two recorded
  cases via fixture, per the prereg, not from a third occurrence.
- F1 self-convo blank CLOSED BY FIX this run: ledger.js
  succession clears the successor's shelter flag. Proof test
  scripts/test-shelter-succession-20261103.js: FAILED before
  the fix on all 3 seeds (6 failures: successor kept the flag,
  bystander control passed), ALL PASS after. Driver hardening
  (sheltered pick excludes the player) in the r116 driver.
- W1 carried: no full clear yet on any panel (this panel 0/2).
  Still needs a refusal panel with a re-muster that clears.
- W3 stays ANSWERED. Q2/Q3 stay CLOSED. C7 analyzer wound-bucket
  gap (r114) not re-checked — C7 here uses the census.

## Village assessment (plain words)

- 11601 — the village that kept passing the mantle until nobody
  was left. Thirteen bearers in 99 days: every death handed the
  Codex to someone new, and each new face kept going — hunting
  when hungry (Hung and Ruth brought home 9,255 and 10,995 kcal
  of meat on emergency hunts), mourning properly, talking
  sensibly — until the last bearer, Ruth, died in the wild on
  day 103 and there was simply no one left. What it knew: how
  to grieve, how to hunt, how to keep the fire lit. What it
  lacked: enough living people. The pantry had been empty since
  day 51; foraging and emergency hunts carried it for fifty more
  days, which is the village bending a long way before it broke.
- 11602 — the village that held. Nine people alive at the
  horizon with a full pantry (17,762 kcal) and 61 Codex entries.
  It fought off nine raids, sent two sorties (both broke but
  nobody died on them), and buried only four people in 120 days.
  Its people teach, gift tools, remember the dead by name, and
  decline invitations like people with their own work. This is
  what the crisis leg looks like when the village bends and does
  not break.
- 11603 — the village that starved young. Dead by day 50 with
  sixteen corpses: monsters took seven, the wild three, and
  hunger itself took four more (two starved, one thirsted, one
  dehydrated) plus one sickness. It still fought five raids,
  gorged twelve nights at the treeline, and asked twice for a
  sortie it could not staff ("the bench is bare"). What it
  lacked was people to send and food to eat — the famine clock
  and the monster clock running together, which is the crisis
  leg's hardest shape.

## Reachable / fun / winnable (leg verdict)
- REACHABLE: yes. Raids, gorges, sorties, refusals, mourning,
  teaching, and succession all fire in ordinary competent play
  on fresh seeds with no staging — the panel needed no hand-
  holding beyond the driver's sortie answers.
- FUN: yes, with the usual crisis-leg weight. The villages read
  like people under pressure (grounded grief, characterful
  declines, gifts that matter), and the two fixes remove
  nonsense lines a player would actually notice (a villager
  talking about herself in third person; a conversation with
  yourself that ends in "no longer available").
- WINNABLE: the leg's horizon is reachable (1/3 here, 1/3 on
  r113/r114) but the breaking side is still the majority, and
  it breaks on famine/attrition, not on siege mechanics. A real
  player can reach the horizon; most villages will not. That is
  the crisis leg working as designed, not a verdict against it.

## Metric review (§14)
- No metric was re-scored mid-run. C1/C2/C2b/WRAP/C3 verdicts
  use the preregistered bars exactly; F1's one occurrence was
  investigated (not smoothed over) and named its disjunct.
- Proposed revision for the NEXT run (not this one): the C2b
  "every boundary-firable case fired" bar should name the
  sheltered-pick player exclusion explicitly now that the driver
  carries it — a self-convo target must count as an
  instrument failure, not as a fired case. The r116 driver
  already implements the exclusion; the prereg wording should
  catch up.

## Recovery closeout (Lane B run 2026-11-03 04:00 CST, recovering r116)
- This run did NOT re-run a fresh panel: r116's panel, fixes, and
  proof tests were complete and verified, only its closeout was
  missing (its lock, 2026-11-03T07:58:53Z, named no registry entry
  and its tree heartbeat was 70+ min stale at adoption; the tree
  itself was reap-protected as dirty and untouched). Recovery
  verified, not assumed: the two src diffs read in full (minimal,
  commented, exactly as described above); the 3 panel JSONs parse
  with the expected keys (defendedFights lists, confirming the
  telemetry mapping gap); the d102 self-convo transcript re-read
  (favor probe isPlayer true); both proof tests re-run ALL PASS
  on the adopted tree; syntax checks clean on driver, analyzer,
  both proof tests, and both changed src files; adjacent suites
  test-crisis-naming-dead (7 passed) and test-crisis-muster-game
  (35 pass) green. The r116 rotation write (6 -> 7) and lock
  deletion are performed by this recovery run at closeout.
- Heartbeat contention noted: worktree-heartbeat.sh waits on the
  shared registry flock under heavy sibling load (one attempt
  held >165s, one hit a 90s timeout); a background retry with a
  readable log was left running and its landing was verified by
  registry read-back before merge. The tree was dirty throughout,
  so the reaper could not remove it in the meantime.
- Telemetry re-checked independently in recovery: the same 2
  known LOUD lines (defenderFights, defendedCount), EXPLAINED
  as the field-name mapping gap, baseline NOT rolled.

## Regression
- New proof tests: test-naming-debate-self-20261103.js (6 failures
  before fix -> ALL PASS after, seeds 7/42/99) and
  test-shelter-succession-20261103.js (6 failures before fix ->
  ALL PASS after, seeds 7/42/99).
- Recovery re-run: both proof tests ALL PASS again on the
  adopted tree before landing.
- check.js --quick (recovery run, in the adopted worktree):
  282 passed, 8 failed in 1423s (log: r116-panel/
  r116-checkquick.log). The 6 failures are exactly r111's
  standing families (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes). The 2 additional
  FAIL lines (measurement-cache-flags, trust-observer-neutrality
  at the 120s cap) both pass standalone on re-run (4/4 and 6/6)
  — concurrent sibling check runs under load, not regressions
  from this run's two src changes, which touch neither system.
- Adjacent suites, all green: test-crisis-naming-dead-20261021
  (7 passed), test-contest-lately-r17 (ALL GREEN),
  test-crisis-care-lately-20261016 (ALL GREEN),
  test-crisis-weirdness-lately-20261015 (29 passed),
  test-crisis-woundcare-lately-20261016 (ALL GREEN),
  test-crisis-r44-compound-deathnaming-20261023 (23 passed),
  test-crisis-muster-game-20261017 (35 pass),
  test-build-muster-roster-20261101 (ALL PASS),
  test-fusion-mantle-20261015 (9 passed),
  test-bearer-recovery-20261012 (19 passed).
- test-heraldmuster-20261021 reports "RED:
  scripts/policies/heraldmuster.js missing" — pre-existing and
  explained, not a regression: `git ls-files` confirms the policy
  file is untracked/absent, and the test file's own last commit
  records the heraldmuster policy as KILLED-AT-PILOT with the
  policy layer "deleted zero-trace". Neither fix touches
  policies/.

## Telemetry deviation check (§14)
- Command: telemetry-check.js --baseline
  telemetry-baselines/crisis.json --current 'r116-panel/
  journey-crisis-r116-delayed-seed*.json' --metrics
  defenderFights,playerFights,defendedCount,latelyDefenseCount.
- LOUD lines (2): "defenderFights disappeared: baseline 95 ->
  current 0 (n=3 files)" and "defendedCount disappeared:
  baseline 21 -> current 0 (n=3 files)".
- Verdict: EXPLAINED, not a real deviation — the panel JSONs do
  not carry fields named defenderFights/defendedCount at all;
  they carry defendedFights lists (21/27/19 across the three
  seeds). This is the known telemetry-mapping gap (proposal
  defenderFights -> defendedFights, standing since r113), not a
  game change. playerFights and latelyDefenseCount are quiet
  (0 -> 0). The baseline is NOT rolled forward: rolling a
  field-name mismatch into a baseline would launder the mapping
  gap into a number. The mapping proposal stands for a future
  run to land with a same-shape comparison.
