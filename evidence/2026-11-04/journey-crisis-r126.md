# Journey crisis r126 — sixteen refusals, zero re-muster clears, and a village that died fed (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: r126 follows r125 (social life, merged
2026-11-04); filenames stay unique; the rotation file, not the
number, is the authority.

Worktree slug deviation, documented in advance (same class as
r88/r90/r93/r96/r99/r103/r107/r111/r113/r114/r116/r117/r122):
the body slug journey2-crisis cannot be registered — branch
journey2-crisis already exists (stale). Before touching it this
run verified it held no unmerged work: merge-base check showed
it an ancestor of master with 0 commits ahead, and no worktree
or registry entry owned it. It was deleted with plain
`git branch -d` (which only succeeds on a fully merged branch),
and the orphan evidence-only directory at its old worktree path
(Oct 14–25 evidence, no .git, no registry entry) was moved aside
intact to journey2-crisis-orphan-evidence-20261104, not deleted.
This run then registered journey2-crisis-r126 cleanly (slow
checkout under sibling load, ~11 min, no retry). Still the
lane-B journey2- prefix, never lane-A journey-.

Base at panel: master 835060792 (Loop B 1245Z coordinator
evidence). Base drift since r122 is real and is NOT bisected
here: hurthome-fix-c (hurt-aware turn-home rule) is a game
change that could touch crisis outcomes at the margin;
approachfire/armorfetch-watch-c are instrument/evidence only.
No docs/ changes since r122. Gating freeze (2026-10-27)
untouched. Nov 2 monster-commitment + loot-taper ruling stands;
this run does not change it.

## Run setup — lock, slow registration, clean panel

- No lock at run start. Fresh lock written (run_id
  2026-11-04T12:56:53Z). Main tree was briefly dirty mid-run by
  a sibling landing (approachfire 21ef6e743, then coordinator
  evidence 835060792); by registration time it was clean again,
  and the pre-flight clean check passed on the final base.
  Disk 29%.
- Heartbeat landed promptly after registration and was kept
  fresh across the run (registry read-back verified each time,
  never a silenced loop).
- Canon: docs/CANON.md + docs/DIRECTIVES.md re-read; the leg's
  systems are covered by DISEASES.md, MONSTER-WAVES.md, and
  CONTESTS.md — none reinvented, none changed. No canon doc
  covers crisis-as-a-leg directly (same standing note as r122).
- Smoke test first, into a scratch subdir (not the panel dir):
  SEED=12601 DAYS=5 proved the doAction wrap runs (563 say
  lines, 44 tick-part samples, favorNoLongerCalls [],
  instrumentErrors []) before the panel launched — same shape
  class as r122's smoke.
- Instrument: r122 driver/analyzer verbatim EXCEPT filenames
  r126 and the cross-check classification adopted from r122's
  metric review (diff reviewed: only r122 -> r126
  substitutions, plus the checks entry gaining priorSamples +
  sampleClass, plus the section header wording). node --check
  clean on both.
- Seed runs use the r115/r116/r117/r122 retry harness, adapted
  (worktree journey2-crisis-r126, panel dir r126-panel). All
  five seeds ACCEPTED on attempt 1 (parses, no `error`,
  carries a census).

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds 12601 / 12602 / 12603 / 12604 / 12605, sequential, all exit 0 first attempt, all parse-verified)

EVID: goal hidden_files/evidence/2026-11-04/r126-panel/
(analyzer output saved there as analyzer-output.txt).

- 12601: HORIZON, 120 loop days. 9 raids, 63 gorge events,
  7 sorties (4 ok, 3 refused), 8 convos. Ends 4 alive /
  16,400 kcal. 11 corpses.
- 12602: GAME OVER (scattering), 112 loop days. 9 raids,
  93 gorge events, 11 sorties (2 ok, 9 refused), 8 convos.
  Ends 1 alive / 0 kcal. 16 corpses.
- 12603: HORIZON, 120 loop days. 7 raids, 31 gorge events,
  2 sorties (both ok), 8 convos. Ends 4 alive / 2,400 kcal.
  12 corpses.
- 12604: GAME OVER (extinction), 29 loop days. 2 raids,
  0 gorge events, 0 sorties, 3 convos. Ends 0 alive /
  30,291 kcal. 12 corpses.
- 12605: GAME OVER (scattering), 89 loop days. 6 raids,
  57 gorge events, 6 sorties (2 ok, 4 refused), 7 convos.
  Ends 3 alive / 0 kcal. 13 corpses.

HEADLINE, stated plainly: 2 of 5 villages reach the horizon.
The majority still breaks, and it still breaks on
famine-clock/attrition, not on siege mechanics — but the
refusal count jumped from r122's 1 to 16, and none of those
refusals ends in a full clear. The siege pile-up persists
(244 gorge nights, 192,428 kcal panel-wide, vs r122's 104 /
102,473 on 3 seeds).

## C1 (bend, not break) — GO

- Gates hold per C2, and every game-over has a named cause
  that is NOT a siege-mechanic failure:
  - 12602: scattering — "Haven couldn't hold. On the third
    hungry day, people started walking" (day ~114, 1 alive).
    The famine clock at its default limit of 3 consecutive
    pantry-empty days.
  - 12604: extinction — "No one is left to pick up the
    Codex. The village dies out" (day ~31, 0 alive, pantry
    30,291). Attrition, not hunger and not siege: the
    village died fed (see below).
  - 12605: scattering — "Haven couldn't hold. On the fifth
    hungry day, people started walking" (day ~93, 3 alive).
    The sealed-granary 5-day path, exercised end to end —
    the path r122 noted its panel had not re-tested.
  - 12601 / 12603: no game-over — horizon with 4 alive each.
- Census-flag quirk, noted not failed (same shape as r117 /
  r122): 12604's census says scattered False / extinct False
  although the closing line is extinction. The closing line
  is the authority; no metric reads that flag.

## The village that died fed (12604) — the panel's sharpest story

12604 lived 29 days and died with 30,291 kcal in the pantry.
Its 12 corpses read: the wild 8, monster 2, ambush 1, combat 1
— no starvation, no sickness, no siege death. Two raids hit
(d18, d28); a lingerer set formed on d29 (Chorus Line) and the
village died on d30–31 before any boundary-firable case could
arise (the 3-day boundary rule would have fired on d32).
A player asking "how did we starve with full stores?" gets a
plain answer from the game itself: they didn't starve. The
wild took them, fast, while the food sat. Brutal, legible,
and not a mechanics failure — but it is the clearest
counter-example this leg has produced to any reading of
"full pantry = safe village."

## C2 (episodes fire + gates hold) — GO

- Raids fire on all seeds: 9 / 9 / 7 / 2 / 6. Fought
  resolutions on all seeds (every resolution list includes
  fought, including 12604's d19).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded; R59 legacy count also reported: 4, all
  corpse-counting artifacts, same class as r122's).
- D1 snapshots all delayed >= 3 attempts: 26/26.
- deltaBad empty (26 attempts, 10 ok, 16 refused,
  deltaExact 10). D3 drift unknown = 0 (labels panel-wide:
  player-drawn-off 17, moved-on-valve 29, sortie-clear 7).
- MISSED-WINDOW total = 12 (r122: 12, r117: 11, r116: 0).
  Per the prereg this does NOT fail C2: it quantifies the
  boundary sampler's blind spot. The count tracks the
  bigger, longer sets, same class as r122.
- Days-tail wobble persists, same class as every panel since
  r70: loop days vs max Game say-day (12601 120 vs 121;
  12602 112 vs 114; 12603 120 vs 122; 12604 29 vs 30;
  12605 89 vs 93). Judge bands, not counters.

## C2b (linger-conditional gorge/sortie) — GO, and W1 still open, sharper

- Lingerer sets form on all seeds. Gorge events: 63 / 93 /
  31 / 0 / 57 (244 total, 192,428 kcal eaten at the treeline).
  12604's 0 is truncation (set formed d29, village died
  d30–31), not a missed case.
- Sorties: 26 attempts, 10 ok, 16 REFUSED — all 16 with the
  recorded reason 'no-fighters' ("Not enough fighters to
  send — a sortie needs at least two besides you, and the
  bench is bare"). Every boundary-firable case fired or was
  refused with a recorded reason; no boundary-firable case
  went unfired.
- Clear rate on ok sorties: 2/10 full clears, both on 12601
  (d104, 5 targets, remaining 0; d112, 1 target, remaining
  0). Both are FIRST-attempt clears, not re-musters: 12601
  has no refusal before d117.
- W1 (does a re-muster ever FULLY clear?) stays UNANSWERED,
  now with a much sharper count: 16 refusals, 0 ending in a
  full clear. The same-set re-muster trial is 12605 d92
  refusal -> d93 ok on the identical set (Herald /
  Ugly-Eyes / Big Beast), which BROKE with 3 remaining.
  Later-ok-after-refusal on different sets also broke:
  12602 d81 (remaining 2) and d111 (remaining 1) after d68 /
  d92 / d94 refusals. Re-musters fire; they break, they do
  not clear. The next run inherits a count (16 refusals, 1
  same-set re-muster, 0 clears), not a shrug.
- Cross-check classes (new this run, adopted from r122's
  metric review): every ok/refused target reads
  'waited-ge3' EXCEPT 12601 d104's five targets, which read
  'sampled-lt3' (31 prior tick-part samples each, none
  waited>=3). That set fired purely on the boundary rule
  and FULLY cleared — the first boundary-joined full clear
  in this instrument's history. The distinction works: the
  old wording would have counted d104 as five cross-check
  misses; the new wording names it for what it is.
  No target reads 'none' this panel.
- G-ID watch: gorgeAfterIdMatched = 0, gorgeAfterReturn = 0,
  against gorgeAfterNameMatched = 4 (12601's cleared
  alien_tick, d104: 4 name matches after the clear, 0
  id-matched). The name count is collision again, proven
  per event by v2 attribution, not a game event.
- Same-night same-name groups (multiGroups) are reported as
  counts only and NOT cited as evidence either way, per the
  adopted rule: 12602 Ugly-Eyes pairs d78–83 and d97–102,
  12603 Loud Beast / Big Beast pairs, 12605 Eulogy triples
  d47–52.
- deadInMusterLines = 0. Self-convo targets = 0.
- Observation, not a miss (same class as r122): two ok
  sorties cost 0 rations (12602 d111 and 12605 d93, both
  with pantry already at 0 before the muster; deltaExact
  holds, narration names the 0 honestly). Price honesty
  holds; why an unfed muster still marches is not explained
  by the panel data and is not pursued here.

## WRAP-CHECK (instrument integrity) — NO-GO on the prereg's letter, instrument cause, not a game defect

- wrapMissing false on all seeds (call-time wraps installed
  cleanly); instrumentErrors [] on all seeds. Tick-part
  samples: 1551 / 1612 / 1284 / 236 / 1038 (verbs
  forage/wait/drink).
- The ending-turn dump re-verified mechanically: 33 of 34
  driven transcripts carry "(conversation ended by the
  engine)", 0 carry the refused-at-open marker, 0 cap-ended.
  The one exception is 12601-d57 (Jose Coleman, sheltered
  two-days-after): 11 picks, then a silent driver break on
  the final iteration — the leave-pick break path (or the
  silent convoGet-throw path), neither of which writes a
  marker. The transcript itself is complete and ends
  sensibly: the NPC's own closing line, "Right. Done. Don't
  look so relieved." The re-run reproduces it byte-identically,
  so this is deterministic driver behavior, not a flap and
  not a lost conversation.
- Per §14 this stays NO-GO and is NOT re-scored: the
  prereg's adopted wording counts only engine-ended or
  refused-at-open markers, and d57 carries neither. The
  game verdicts above do not depend on this marker, and no
  game content is missing. Proposed revision for the NEXT
  run (not this one): the driver writes an explicit marker
  on the leave-break path (and on convoGet-throw), and the
  WRAP wording counts it as an outcome line. This is the
  first leave-break case this instrument has produced
  (r122: 22/22 marked); it is a new instrument item, not a
  reopening of any game question.

## C3 (people check) — GO

Read in full: all 34 driven transcripts. fabricHits 0
panel-wide (analyzer: 0; JSON fields [] on all seeds).

- NPCs want concrete things: festering wounds ("If it
  festers I'm no good to anyone — can't haul, can't hunt,
  can't watch"), a cistern read three times hoping for a
  misread (Tom: 0 liters; Luz: 3 liters — "We walk together
  and each carry two liters back. Creek water still needs
  boiling"), a trap line walked with extra eyes, a slope
  read for water taught freely (Jovan: "how they read a
  slope for water, how their grandmother did it").
- Grief is grounded in real deaths: Tom expects Danae at the
  fire ("Stupid."); Elena takes Alfredo's burnt piece ("We
  bury, we grieve, we keep going. There's no step four.");
  Jovan on Nartey ("The fire feels smaller without Nartey.
  The rest of us will have to be bigger."); Luz on Yuki
  (the same burnt piece, kept up by another village).
- Invitations are sometimes taken, with character: TAKEN
  five times — Carolina d17 ("Okay. Yeah. I trust you."),
  Min-chan d33 (third ask: "Someone should watch your back.
  Might as well be me."), Elena d63 ("Alright. But I'm not
  carrying your stuff."), Jovan d71 ("Someone should watch
  your back."), Luz d40 ("...Fine. This had better be worth
  it."). DEFLECTED with character — Min-chan twice, Tom
  ("Not right now. I've got my own things to handle.").
  Panel-wide taken 5, deflected several: the sometimes-taken
  shape holds, stronger than r122's 2.
- Repeated asks escalate, then close — never loop: favor
  requirements climb plain -> "As I said —" -> "Like I
  said —" -> "Still the same thing —" -> "I've told you
  three times now —" on Donna, Min-chan, Paola, Luz, and
  Franciszek alike; the details variant closes the same way
  on Dwayne ("I just said —" -> "I just told you —" ->
  "We've covered this one."). One cap-line repeat, noted
  not failed: 12602 d22 repeats "I've told you three times
  now" on the sixth ask, then the conversation moves on —
  a cap, not a loop.
- Favor states stay honest: Min-chan's sick_help 'asked'
  d32 then 'moot' d33 ("already closed").
- Bribery cases spend out across conversations: Luz's case_2
  runs site -> witnesses -> investigate on d23 and continues
  to the ledger-doesn't-balance close on d31; the ambush
  thread carries between villagers (Luz d23: "Nobody's
  settled the ambush against me yet"; Simone d31: "There's
  still the matter of the ambush of Luz.").
- Taking/pods threads plant real commits: Jose d45 (son Liam
  asks if the taken ones were bad, boring; pods "rows deep,
  humming") and Simone d31 (grandfather Sean, "survived two
  wars and a famine. Not interesting enough, apparently")
  both end with the player committing to ask the System —
  and the NPCs holding them to it ("If it answers — you'll
  tell me? Whatever it says. I can take it.").
- Wrinkles, noted not fixed:
  - Dwayne d20 naming stance: "I'm staying out of the
    naming fight. For now." then pushes 'Big Ugly' in the
    same conversation — the r122 Brendan wobble class, here
    within one conversation (generic patter vs event
    stance), not a defect class.
  - Columbus origin coincidence: the player, Emmett, and
    Cesar are all from Columbus, Ohio across seeds. Origin
    pool draw, not fabricated shared history — no NPC claims
    a shared past with the player. Not a finding.
  - No naming-debate self-naming recurrence (W4 stays
    closed); no dead ambient speaker, no succession-picks-
    dead case (Q2/Q3 stay closed).

## F1-inherited (favor call-time cause) — zero occurrences, stays CLOSED

- The call-time wrap installed cleanly; entries [] on all
  seeds. No second dead-id path, no second stale-flag path.
  The r116 ledger fix + driver guard hold on fresh seeds.

## Q2/Q3 — no reopening

- No succession-picks-a-dead-member case, no dead ambient
  speaker this panel. The analyzer's one unattributed death
  line is a monster death ("Big Loud is dead. You didn't
  ask. It knew." — a Codex page-turn on a monster kind),
  not a villager death. Q2/Q3 stay closed per r114.

## C7 (famine/disease pressure census, descriptive, no bar)

- 12601: pantry low-water 0 kcal (gameDay 80), ended at
  16,400 — the village hit empty and recovered. 11 corpses:
  wild 5, monster 4, contest 1, arena 1. 0 famine, 0 sickness
  in the deaths list.
- 12602: pantry low-water 0 kcal (gameDay 51), ended at 0.
  16 corpses: wild 7, monster 6, thirst 1, wound 1, arena 1.
  0 famine, 0 sickness in the deaths list — the scattering
  walked away hungry rather than starving to death.
- 12603: pantry low-water 0 kcal (gameDay 80), ended at
  2,400. 12 corpses: wild 5, arena 3, wound 2, monster 2.
  0 famine, 0 sickness.
- 12604: pantry low-water 3,400 kcal (gameDay 17), ended at
  30,291 — never hungry. 12 corpses: wild 8, monster 2,
  ambush 1, combat 1. 0 famine, 0 sickness.
- 12605: pantry low-water 0 kcal (gameDay 59), ended at 0.
  13 corpses: wild 5, monster 4, arena 2, wound 1, emergency
  hunt 1. 0 famine, 0 sickness.
- Panel totals: 64 corpses, 0 disease corpses (r122: 1
  wound_fever), 0 starvation corpses (r122: starvation
  corpses on two seeds). The famine clock, not starvation
  deaths, ends the hungry villages here.

## C4 (burn observation, Steve-call, no bar) — no observation

- 0 burns on all seeds (r85/r88/r90/r93/r96/r99/r103/r107/
  r111/r113/r114/r116/r117/r122: also 0). The phoenix
  per-event respawn cascade did not recur. The Steve-call
  stands unchanged.

## BLANK STATUS: W1 still open with a count, cross-check classification delivered, one new instrument item

- W1 narrowed again (see C2b): 16 refusals, 1 same-set
  re-muster (12605 d92 -> d93, broke with 3 remaining), 0
  full clears after a refusal. The 2 full clears this panel
  are first-attempt clears. W1 is no longer "one refusal,
  one broke" — it is "sixteen refusals, re-musters break."
- CROSS-CHECK CLASSIFICATION DELIVERED (instrument, not game
  code): waited-ge3 / sampled-lt3 / none per target, proven
  on-panel by the d104 boundary-joined full clear it
  correctly names instead of miscounting.
- WRAP leave-break marker gap NAMED (instrument item, not
  game blank): the driver needs an explicit marker on its
  silent break paths; the next run's driver should carry it
  and the WRAP wording should count it.
- G-ID watch stays at zero (id-matched 0, returns 0, third
  panel running). W4 stays closed. F1 stays closed. Q2/Q3
  stay closed.

## Village assessment (plain words)

- 12601 — the village that cleared the treeline twice and
  held. Four people alive at the horizon with food in the
  stores again (16,400 after touching empty on day 80),
  after 63 gorge nights and nine raids. It sent four sorties
  that went out and two that came back refused for want of
  fighters near the end — and it is the only village this
  panel that swept a set outright, twice (d104's five, d112's
  one). Its people argue bribery cases, confess small pasts,
  and keep each other's burnt pieces. This is the crisis leg
  working at its best: besieged, grieving, still standing.
- 12602 — the village that ran out of fighters before it ran
  out of monsters. Nine refusals, two sorties that broke,
  93 gorge nights — the heaviest siege in the panel — and in
  the end one person left, walking away on the third hungry
  day. Its people are vivid to the end (Donna's festering
  wound, Tom's empty cistern, Min-chan taking the invitation
  on the third ask), but vividness is not a bench: when the
  bench went bare, the treeline stayed.
- 12603 — the quiet village that held. Four alive at the
  horizon with 2,400 kcal, only 31 gorge nights and two
  sorties that both broke with three monsters still out
  there. It argued names, taught slope-reading, buried its
  dead and picked up their shares. The least dramatic
  survival in the panel, and the most ordinary — which is
  the point: most villages that make it do not sweep the
  treeline, they outlast it.
- 12604 — the village that died fed. Dead by day 30 with
  30,291 kcal in the stores and twelve corpses, eight of
  them to the wild. It fought one raid, talked three
  conversations, and never got a sortie off — the treeline
  set formed the day before everyone died. Food does not
  stop the wild, and this village is the proof a player can
  read in one line: "No one is left to pick up the Codex."
- 12605 — the village that refused, re-mustered, and still
  walked away. Four refusals, a re-muster the day after a
  refusal that broke with three monsters left, and then the
  fifth hungry day — the sealed-granary clock, run to its
  end. Its people carried an ambush case across two
  conversations and a Taking thread across two more, and
  Luz took the invitation with a warning ("This had better
  be worth it."). It was not, quite — but the trying is in
  the record.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes. Raids, gorges, sorties, refusals,
  re-musters, full clears, mourning, teaching, bribery
  cases, and both scattering clocks (3-day and 5-day) fire
  in ordinary competent play on fresh seeds with no staging
  — the panel needed no hand-holding beyond the driver's
  sortie answers.
- FUN: yes, with the usual crisis-leg weight. The villages
  read like people under pressure (a bribery case argued
  across two days, an ambush remembered by someone who
  wasn't its victim, a bench that goes bare and says so
  plainly, a village that dies with full stores and says
  why), and the refusal pile-up makes the late game feel
  besieged in a new way: not "can we go out?" but "is there
  anyone left to send?" The naming-stance wobble (Dwayne
  d20) is a wrinkle a player could notice, not a break.
- WINNABLE: the leg's horizon is reachable (2/5 here, 1/3
  on r113/r114/r116/r117/r122) but the breaking side is
  still the majority, and it breaks on famine-clock and
  attrition, not on siege mechanics. A real player can
  reach the horizon; most villages will not. That is the
  crisis leg working as designed, not a verdict against it.
  The new question the next run inherits is whether the
  refusal pile-up (16 here vs 1 on r122) is a base-drift
  effect worth a before/after look — three-to-five seeds
  cannot move it, and this run does not bisect it — and
  whether a refusal ever ends in a full clear (W1), now
  counted at 0-for-16.

## Metric review (§14)

- No metric was re-scored mid-run. C1/C2/C2b/C3 verdicts use
  the preregistered bars exactly; the missed-window 12 is
  reported under the prereg's own instrument-gap reading,
  not folded into a game verdict; the gorgeAfterNameMatched
  4 is reported as collision (proven per event by v2
  attribution), not as a game event; the G-ID watch
  (id-matched 0) is reported as a watch, not a bar; the
  multiGroups counts are reported as counts only, not as
  evidence either way, per the adopted rule.
- WRAP-CHECK is reported NO-GO on the prereg's letter
  (33/34 markers) with the cause diagnosed (driver silent
  break path) — it is NOT re-scored as GO on the strength
  of the NPC's closing line, because the prereg's wording
  does not count that line. The next run's driver + wording
  revision is proposed above; a future run that changes the
  driver must re-prove determinism the same way (same-seed
  re-run byte-identical).
- Adopted from this run (instrument, not metric): the
  waited-ge3 / sampled-lt3 / none classification is now the
  cross-check rule. A future run that changes it again must
  re-prove trajectory neutrality the same way (same-seed
  v-before/v-after game output identical) — this run's
  classification is read-only in the analyzer, so no
  trajectory proof was owed for it.
- Carried forward, unchanged: telemetry metric list for
  this leg is defendedFights,playerFights,latelyDefenseCount;
  defendedCount stays out until a correspondence is proven.

## Determinism

- Seed 12601 re-run BYTE-IDENTICAL (panel JSON and all 8 of
  its transcripts, including the unmarked d57) to its own
  first run, proving the r126 analyzer classification (which
  touches no game path) and the driver inject no
  nondeterminism. Identity is judged against this run's own
  first run, not against any r122 file.

## Regression

- This run changes NO game code: the repo commit adds only
  the r126 driver + analyzer (new files) and this run note.
- Targeted proof suites, all green on this base (the suites
  that guard the fixes this panel relies on):
  - test-naming-debate-self-20261103.js: ALL PASS (r116 W4
    fix holds, incl. third-person control).
  - test-shelter-succession-20261103.js: ALL PASS (r116
    shelter-flag fix holds, incl. bystander control).
  - test-crisis-naming-dead-20261021.js: 7 passed, 0 failed.
  - test-crisis-muster-game-20261017.js: 35 pass, 0 fail.
- Full check.js --quick NOT run this run, stated plainly
  with the reason (same scope call as r117/r122, preregistered):
  the commit touches no game code and no existing file, so
  there is no regression surface for the full gate to cover
  beyond the targeted suites above (which are the suites
  for the two fixes the panel depends on). The next run
  that touches src/js should run the full gate. Worktree
  git status at commit time shows exactly the 3 added
  files, nothing modified, no sibling files swept in.

## Telemetry deviation check (§14)

- Command: telemetry-check.js --baseline
  telemetry-baselines/crisis.json --current
  'journey-crisis-r126-delayed-seed*.json' --metrics
  defendedFights,playerFights,latelyDefenseCount (run from
  the r126-panel dir; an earlier attempt with a ~/ path
  failed on glob expansion and was retried correctly —
  the retry, not the failure, is the reported result).
- Result: QUIET (exit 0, 5 files, 3 metrics, no large
  deviations). No LOUD lines to investigate. Baseline NOT
  rolled (a single 5-seed panel's variance must not be
  baked in).
