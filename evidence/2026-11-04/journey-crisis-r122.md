# Journey crisis r122 — the cleared monster did not gorge again, and the 1/3 shape holds a fifth time (lane B, leg 6)

Leg 6 (crisis). Rotation-b read 6 at run start; this run writes 7
(succession next) at closeout, verified by re-read after landing.
Run number basis: r122 follows r121 (endgame, merged 18beb0c6c);
filenames stay unique; the rotation file, not the number, is the
authority.

Worktree slug deviation, documented in advance (same class as
r88/r90/r93/r96/r99/r103/r107/r111/r113/r114/r116/r117): the body
slug journey2-crisis cannot be registered — branch journey2-crisis
already exists (stale, no held work). A first attempt at
journey2-crisis-r121 was polluted by the exec service restarting
mid-registration: the path held only a partial copy of orphan
evidence (no .git, no registry entry) while its branch pointed at
the master tip. The copy's source (journey2-crisis/evidence) was
verified intact (byte-identical sample file), the polluted dir
and the empty branch were removed, and this run registered
journey2-crisis-r122 cleanly. What copied the evidence is
unexplained (the reap script contains no copy step); no data was
lost, and the incident is recorded here, not hidden. Still the
lane-B journey2- prefix, never lane-A journey-.

Base at panel: master fa33fc89c (batch ship bump
7c86acbce-20261104-054624: social r120 + endgame r121 + r117
crisis instrument, post-Nov-2 monster-commitment + loot-taper
ruling). r117's merge (67dad5857) and r121's merge (18beb0c6c)
are both ancestors of this base, verified by merge-base check.
Base drift since r117 is real and is NOT bisected here.

## Run setup — lock, slow registration, clean panel

- No lock at run start. Fresh lock written (run_id
  2026-11-04T05:55:59Z). Hygiene note: the registry entry's
  run_id came out empty, because /tmp/runid.txt was wiped by the
  service restart before the register call read it (the script
  falls back to an empty env value). The lock is deleted at
  closeout either way, so no future overlap guard is misled;
  the next run should not rely on lock/registry run_id
  alignment from this run.
- Registration was slow under sibling load (reap contention +
  checkout), no failure, no retry. Heartbeat landed promptly
  after registration and was kept fresh across the run.
  Pre-flight otherwise clean: main tree clean, disk 33%.
- Canon: docs/CANON.md read before playing;
  docs/DIRECTIVES.md re-read; gating freeze (2026-10-27)
  untouched. No canon doc covers crisis-as-a-leg directly; the
  leg's systems are covered by DISEASES.md, MONSTER-WAVES.md,
  and CONTESTS.md — none reinvented, none changed.
- Smoke test first, into a scratch dir (not the panel dir):
  SEED=12201 DAYS=5 proved the doAction wrap runs (886 say
  lines, 49 tick-part samples, favorNoLongerCalls [],
  instrumentErrors []) before the panel launched — same shape
  class as r117's smoke.
- Instrument: r117 driver/analyzer verbatim EXCEPT filenames
  r122 and the attribution change below (diff reviewed: only
  r117 -> r122 substitutions, plus the attribution block, the
  per-entry key + clearedEpisode fields, the end-of-run
  id/return matching, and the analyzer id section).
  node --check clean on both.
- Seed runs use the r115/r116/r117 retry harness, adapted
  (worktree journey2-crisis-r122, panel dir r122-panel). All
  three seeds ACCEPTED on attempt 1 (parses, no `error`,
  carries a census).

## The instrument change: capture-time gorge attribution (v1 -> v2 in the pilot)

r117's proposal, built here: at gorge-capture time (inside the
Game.say wrapper, while the lingering set is live), attribute
each gorge line to the lingerBook entry it belongs to, using a
per-entry runtime key (book ids are monster-kind ids and
repeat, so neither id nor display name identifies an
individual). The name-matched count is kept alongside for
comparison.

V1 (as pre-registered) enumerated all book entries with a
matching display name. Seed 12201's own data exposed its flaw
before the panel completed: the d101 Loud Beast run listed the
d78-cleared callback among its candidates — an entry that
cannot gorge — inflating ambiguity. V2 corrects candidate
eligibility: candidates are the CURRENTLY-LINGERING world
monsters whose display name matches the line, joined to book
entries by object identity. A live lingerer with no book entry
yet (arrived mid-iteration before any boundary) is a candidate
with key null: exactly one such candidate reads
'single-unbooked' (honest: no key exists to id-match later)
and never yields an attributedKey. A worldMonsters failure
would read 'error', counted separately, never a silent fallback
to v1. This is an instrument correction, not a metric change:
no pre-registered bar moved, and the panel verdicts below do
not depend on the attribution version except the G-ID watch
count, which is a watch, not a bar. Seed 12201's v1 file is
preserved in the panel dir under scratch-v1/ for the audit
trail; the panel's seed 12201 is the v2 run.

V2 validation, seed 12201 v1 vs v2 (same seed, same driver
except attribution):
- Game trajectory identical: sayLines byte-identical, census
  identical, raids 9/9, sorties 5/5. Attribution code is
  read-only; it does not perturb the game.
- Attribution distribution: v1 18 single / 44 ambiguous / 2
  none -> v2 54 single / 8 ambiguous / 2 single-unbooked /
  0 none / 0 error. The worldMonsters premise holds at gorge
  time.
- The d101 Loud Beast event attributes to a single live suburb
  (key 17) — NOT the cleared callback. The d109 Eulogy /
  Algorithm events read single-unbooked (firstSeen d110: they
  gorged the night before their first boundary).

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds 12201 / 12202 / 12203, sequential, all exit 0 first attempt, all parse-verified)

EVID: goal hidden_files/evidence/2026-11-04/r122-panel/
(analyzer output saved there as analyzer-output.txt).

- 12201: HORIZON, 120 loop days. 9 raids, 64 gorge events
  (54 single, 8 ambiguous, 2 single-unbooked), 5 sorties
  (1 refused, 4 ok, 0 cleared), 8 convos. Ends 4 alive /
  0 kcal. 13 corpses.
- 12202: GAME OVER (extinction), 70 loop days. 4 raids,
  7 gorge events (all single), 1 sortie (ok, broke),
  8 convos. Ends 0 alive / 0 kcal. 16 corpses.
- 12203: GAME OVER (scattering), 87 loop days. 7 raids,
  33 gorge events (32 single, 1 single-unbooked), 2 sorties
  (both ok, both broke), 6 convos. Ends 1 alive / 0 kcal,
  scattered True. 16 corpses.

HEADLINE, stated plainly: 1 of 3 villages reaches the horizon
(r113: 1/3, r114: 1/3, r116: 1/3, r117: 1/3, r122: 1/3). The
1/3 shape holds a FIFTH time. The siege pile-up persists on
the surviving seed (64 gorge nights, 102,473 kcal panel-wide
over 104 events) but the panel total is below r117's 169
because two seeds died early (70 and 87 days) and had fewer
nights to gorge — the pile-up is a late-game shape, and dead
villages stop gorging. No full clear this panel (0/7 ok
sorties, vs r117's 1/10).

Pilot-only per §9-12: the pilot answered the leg's questions
(the id-matched verdict below, the fifth 1/3, the W1 watch),
so no panel expansion; the r111/r113/r114/r116/r117 panel
seeds were NOT re-run.

## C1 (bend, not break) — GO

- Gates hold per C2, and every game-over has a named cause
  that is NOT a siege-mechanic failure:
  - 12202: extinction — "No one is left to pick up the Codex.
    The village dies out" (day 72, 0 alive). Attrition across
    monsters, the wild, the arena, a contest, and starvation
    (Theo d16, Logan d42, Elena d47).
  - 12203: scattering — "Haven couldn't hold. On the third
    hungry day, people started walking" (day 89, 1 alive,
    pantry 0). The famine clock at its default limit of 3
    consecutive pantry-empty days (r114's correction; no
    sealed-granary 5-day path on this seed).
  - 12201: no game-over — horizon with 4 alive.
- Census-flag quirk, noted not failed (same shape as r117):
  both game-overs carry census scattered False / extinct
  False (12203's census says scattered True — the one case
  where the flag DOES mirror the closing line; 12202's does
  not). The closing line is the authority; no metric reads
  that flag.

## C2 (episodes fire + gates hold) — GO

- Raids fire on all seeds: 9 / 4 / 7. Fought resolutions on
  all seeds (every resolution list includes fought).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded; R59 legacy count also 0).
- D1 snapshots all delayed >= 3 attempts: 8/8.
- deltaBad empty (8 attempts, 7 ok, 1 refused, deltaExact 7).
  D3 drift unknown = 0 (labels panel-wide: player-drawn-off
  18, moved-on-valve 13, sortie-clear 3).
- MISSED-WINDOW total = 12 (r117: 11, r116: 0, r113: 6,
  r114: 4). Per the prereg this does NOT fail C2: it
  quantifies the boundary sampler's blind spot. The count
  tracks the bigger, longer sets, same class as r117.
- Days-tail wobble persists, same class as every panel since
  r70: loop days vs max Game say-day (12201 120 vs horizon
  tail; 12202 70 vs 72; 12203 87 vs 89). Judge bands, not
  counters.
- Observation, not a miss: two sortie targets had zero prior
  tick-part waited>=3 samples (12201 d78 callback, 12203 d86
  paparazzo). Both sorties still fired via the boundary rule
  (day - firstSeenDay >= 3 at the boundary); the targets were
  boundary-joined, not tick-sampled. See metric review: the
  cross-check should distinguish "no sample" from "sampled
  but <3 waited".
- Observation, not a miss: 12203's d86 sortie cost 0 rations
  (paid 0, pantry delta 0, deltaExact holds) while clearing
  paparazzo with 3 remaining. Price honesty holds; why a
  muster costs nothing on that call is not explained by the
  panel data and is not pursued here.

## C2b (linger-conditional gorge/sortie) — GO, fifth refusal panel

- Lingerer sets form on all seeds. Gorge events: 64 / 7 / 33
  (104 total, 102,473 kcal eaten at the treeline).
- Sorties: 8 attempts, 7 ok, 1 REFUSED — the refusal carries
  the recorded reason 'no-fighters' ("the bench is bare").
  Every boundary-firable case fired or was refused with a
  reason; every ok sortie and the refusal show prior
  tick-part waited>=3 samples except the two boundary-joined
  targets noted under C2 (cross-check ok:true on ok sorties
  except those two 0-sample targets; ok:false ONLY on the
  refusal, the expected shape per r116/r117). No
  boundary-firable case went unfired.
- Clear rate on ok sorties: 0/7 full clears. Individual
  clears without a full clear: cliffhanger key 7 (12201 d65),
  callback key 12 (12201 d78), paparazzo key 8 (12203 d86).
- W1 (does a re-muster ever FULLY clear?) stays UNANSWERED
  in the narrowed sense — and now with a fifth data point in
  the same shape: 12201 d64 refusal ('no-fighters') -> d65 ok
  sortie, which BROKE with 3 remaining. Re-musters fire;
  only the FULL CLEAR after a refusal is still open. The
  broader "can a sortie ever fully clear" stays answered YES
  by r117's 11702 d66 (this panel adds no second instance).
- W3 stays ANSWERED (r107): no weak-target break this panel.
- G-ID (new watch, not a bar): gorgeAfterIdMatched = 0,
  gorgeAfterReturn = 0, against gorgeAfterNameMatched = 12.
  All 12 name matches are the 12201 callback case (cleared
  d78, 'The Loud Beast' gorges d101-106 and d109-114). Under
  v2 attribution NONE of the 12 attributes to the cleared
  callback (key 12): the d101 event attributes to a single
  live suburb (key 17), the rest to live lingerers or
  ambiguous among live lingerers. The cleared monster did
  NOT gorge again — the name count was pure collision, now
  proven per event rather than suspected. No TRUE
  gorge-after-clear case, no return case. The watch therefore
  produces no investigation item this panel; the instrument
  itself is the deliverable.
- Same-night same-name groups (multiGroups): 12201 d61-64
  carry 2 'The Ugly Beast' events per night, all ambiguous.
  The instrument cannot say whether one monster gorged twice
  or two individuals gorged once each — see metric review
  (inherent limit, not a fixable gap).
- deadInMusterLines = 0.

## WRAP-CHECK (instrument integrity) — GO

- favorNoLongerWrapMissing false, doActionWrapMissing false,
  phoenixBurnWrapMissing false on all seeds;
  instrumentErrors [] on all seeds. Tick-part samples: 1438 /
  659 / 888 (verbs forage/wait/drink).
- Ending-turn dump re-verified mechanically: 21 driven
  transcripts carry "(conversation ended by the engine)",
  1 carries "(conversation refused/ended)" (12203 d31, Eli
  Dai refused to talk at open — a legitimate engine outcome,
  not a missing dump), 0 cap-ended markers, 0 self-convo
  probes (FAVOR-PROBE isPlayer true count 0 panel-wide).
  See metric review: the prereg's "outcome line" wording
  should name the refusal marker explicitly next run.
- Determinism: seed 12201 re-run BYTE-IDENTICAL (panel JSON
  and all 8 of its transcripts) to its own v2 first run,
  proving the v2 attribution code injects no nondeterminism
  (the driver changed since r117, so identity is judged
  against this run's own first run, not against any r117
  file).

## C3 (people check) — GO

Read in full: all 22 driven transcripts. fabricHits 0
panel-wide (analyzer: 0; JSON fields [] on all seeds).

- NPCs want concrete things: festering wounds ("If it
  festers I'm no good to anyone — can't haul, can't hunt,
  can't watch"), a cut gone hot and climbing into the blood
  ("It's not just the cut anymore, it's in the blood"), a
  forage partner for the pawpaw patch ("Another day like
  today and we're choosing who eats").
- Grief is grounded in real deaths: Nathan d38 mourns Avneet
  and Ava ("I do the headcount without thinking. Then I
  think"; "I check the treeline every hour for Ava, now");
  Emma d40 expects Oscar at the fire and takes up his share
  of the work; Urpi d77 lists Sierra, Pavel, Tom, Lucas
  ("The fire doesn't care. That's what gets me — the fire
  doesn't care").
- Confrontations and cases spend out: Roberto's bribery case
  plays through site -> witnesses -> investigate -> moot
  exposure -> vote guilty in one conversation (d18), with
  the silence option remembered ("the game remembers").
  James's confrontation spends out ("We went over this. I
  already told you the truth about that").
- Repeated asks escalate, then close — never loop: favor
  requirements climb plain -> "As I said —" -> "Like I
  said —" -> "Still the same thing —" -> "I've told you
  three times now —" -> close, on Kennedy, Nathan, Roberto,
  and Ella alike. Favor states stay honest: Nathan's
  heal_help 'asked' d39 through d53 (the driver never moves
  next to him) then 'moot' d66 after the buried-bundle
  scene; Emma's sick_help 'moot' d40 ("already closed").
- Invitations are sometimes taken, with character: TAKEN
  twice — Vanessa d26 ("Alright. But I'm not carrying your
  stuff.") and Emma d40 ("Okay. Yeah. I trust you.").
  DEFLECTED with character — Brendan ("Not right now. I've
  got my own things to handle."), Nathan ("I work alone.
  Nothing personal. ...It's a little personal."), Urpi
  (same deflection, grieving). Panel-wide taken 2, deflected
  several: the sometimes-taken shape holds.
- Nonverbal play works: Xavier d44 nod-cycling gives five
  distinct nod-backs that thin as the conversation thins
  ("Their gestures slow — the conversation thinning like
  light at dusk").
- Wrinkle, noted not fixed: Brendan d14 reports 'Ugly-Eyes'
  shouted down in the naming debate, then d15 pushes
  'Ugly-Eyes' himself (while also saying "I'm staying out
  of the naming fight. For now."). Adjacent-day stance
  wobble in driver-steered subject order, not a defect
  class — and NOT a W4 recurrence: the d15 line is first
  person ("I'm pushing 'Ugly-Eyes'"), the speaker is not
  named in third person. W4 stays closed.
- No naming-debate self-naming recurrence (one push line
  panel-wide, first person); no dead ambient speaker, no
  succession-picks-dead case (Q2/Q3 stay closed).

## F1-inherited (favor call-time cause) — zero occurrences, stays CLOSED

- The call-time wrap installed cleanly; entries [] on all
  seeds. No second dead-id path, no second stale-flag path.
  The r116 ledger fix + driver guard hold on fresh seeds.

## Q2/Q3 — no reopening

- No succession-picks-a-dead-member case, no dead ambient
  speaker this panel. Q2/Q3 stay closed per r114.

## C7 (famine/disease pressure census, descriptive, no bar)

- 12201: pantry low-water 0 kcal (gameDay 67), ended at 0.
  13 corpses, 0 famine in the deaths list, 1 starvation
  corpse (James d113), 0 sickness: monster x5, wild x3,
  contest x1, wounds-that-wouldn't-close x2, combat x1,
  starvation x1. Horizon with 4 alive — the village that
  held while besieged.
- 12202: pantry low-water 0 kcal (gameDay 29), ended at 0.
  16 corpses, famine deaths in the deaths list (Willie
  Keller d5 starvation) plus starvation corpses (Theo d16,
  Logan d42, Elena d47), 0 sickness: monster x5, wild x4,
  named-monster kills x2 (Paparazzo, Understudy), arena x1,
  contest x1, starvation x3. Extinction d72.
- 12203: pantry low-water 0 kcal (gameDay 86), ended at 0.
  16 corpses, 0 famine, 1 disease corpse (Nandini d82
  wound_fever): monster x4, wild x7, contest x2,
  wound-that-wouldn't-close x1, wound_fever x1, plus Oscar
  Egan (contest). Scattering d89 — died by the famine
  clock with food pressure, not by siege mechanics.
- Scattering-clock note: 12203 exercised the default
  3-day limit end to end ("On the third hungry day, people
  started walking"). The sealed-granary 5-day path is not
  re-tested by this panel. Sickness deaths: 0 in the deaths
  list this panel (r117: also 0); the disease roster fires
  in favors and dialogue, not in corpses, here — except one
  wound_fever corpse.

## C4 (burn observation, Steve-call, no bar) — no observation

- 0 burns on all seeds (r85/r88/r90/r93/r96/r99/r103/r107/
  r111/r113/r114/r116/r117: also 0). The phoenix per-event
  respawn cascade did not recur. The Steve-call stands
  unchanged.

## BLANK STATUS: gorge attribution delivered, W1 still open, 1/3 shape at five

- GORGE ATTRIBUTION DELIVERED this run (instrument, not
  game code): v2 capture-time attribution with per-entry
  runtime keys, proven trajectory-neutral (12201 v1 vs v2
  identical game output) and determinism-clean (12201 v2
  re-run byte-identical). Its first verdict: id-matched
  gorge-after-clear 0, returns 0, against a name-matched 12
  that is now proven collision, not a game event. The
  name-matched count must no longer be cited as cleared
  monsters gorging.
- W1 narrowed again (see C2b): re-musters fire; only the
  FULL CLEAR after a refusal is still open. This panel adds
  a fifth refusal -> later-ok-broke instance and zero full
  clears.
- W4 stays closed (no recurrence). F1 stays closed (zero
  entries). Q2/Q3 stay closed.
- NEW instrument limitation named (not fixed — it is
  inherent, see metric review): same-night same-name gorge
  pairs with ambiguous attribution cannot resolve one-vs-two
  gorgers from the line alone.

## Village assessment (plain words)

- 12201 — the village that held while besieged, again. Four
  people alive at the horizon with an empty pantry, after 64
  gorge nights and nine raids. It sent five sorties; one
  came back refused for want of fighters, four went out and
  broke with monsters still at the treeline, and none
  cleared a set outright — the village survived by enduring
  and breaking even, not by sweeping the treeline. Its
  people grieve properly, confess properly, take each other
  up on invitations, and keep each other's keepsakes. This
  is what the crisis leg looks like when the village bends
  under a pile-up and does not break.
- 12202 — the village that starved young and died
  mid-sentence. Dead by day 72 with sixteen corpses: the
  wild took four, monsters five (plus two named kills),
  starvation three, and the rest went to the arena, a
  contest, and the treeline. It fought four raids and sent
  one sortie, which broke. Its people are vivid to the end
  — Nathan checking the treeline every hour for Ava,
  digging up a buried food bundle for the pantry (+929
  kcal) — but vividness is not food, and the bench went
  bare before the treeline did.
- 12203 — the village that argued its case and then walked
  away hungry. Dead by day 89 with sixteen corpses and one
  person left: the wild took seven, monsters four, contests
  two, and wounds the rest. It fought seven raids, sent two
  sorties (both broke), played a bribery case through to a
  guilty vote at the moot, and took an invitation on trust
  — then, on the third hungry day, people started walking
  in different directions. The famine clock, not the siege,
  ended it.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes. Raids, gorges, sorties, refusals,
  re-musters, mourning, teaching, and succession all fire in
  ordinary competent play on fresh seeds with no staging —
  the panel needed no hand-holding beyond the driver's
  sortie answers.
- FUN: yes, with the usual crisis-leg weight. The villages
  read like people under pressure (a bribery case argued to
  a guilty vote, a buried bundle dug up for the pantry, a
  bench that goes bare and says so plainly), and the siege
  pile-up makes the late game feel besieged rather than
  merely hungry. The naming-stance wobble (Brendan d14/d15)
  is a wrinkle a player could notice, not a break.
- WINNABLE: the leg's horizon is reachable (1/3 here, 1/3
  on r113/r114/r116/r117) but the breaking side is still
  the majority, and it breaks on famine/attrition, not on
  siege mechanics. A real player can reach the horizon;
  most villages will not. That is the crisis leg working
  as designed, not a verdict against it. The new question
  the next run inherits is whether the pile-up helps or
  hurts that balance across a wider panel — three seeds
  cannot move it — and whether a refusal ever ends in a
  full clear (W1).

## Metric review (§14)

- No metric was re-scored mid-run. C1/C2/C2b/WRAP/C3
  verdicts use the preregistered bars exactly; the
  missed-window 12 is reported under the prereg's own
  instrument-gap reading, not folded into a game verdict;
  the gorgeAfterNameMatched 12 is reported as collision
  (now proven per event by v2 attribution), not as a game
  event; the G-ID watch (id-matched 0) is reported as a
  watch, not a bar.
- Adopted from this run (instrument, not metric): the v1 ->
  v2 candidate-eligibility correction (live lingerers only)
  is now the attribution rule. A future run that changes
  candidate eligibility again must re-prove trajectory
  neutrality the same way (same-seed v-before/v-after game
  output identical).
- Proposed revision for the NEXT run (not this one):
  (1) WRAP-CHECK wording should read "every driven
  transcript carries its outcome line (engine-ended or
  refused-at-open)" — this panel's 12203 d31 refusal marker
  is an outcome line, and the current wording made it look
  like a miss on first count (21/22). (2) The
  boundary-sortie cross-check should distinguish "no
  tick-part sample" from "sampled but waited <3" — the two
  0-sample targets here (callback d78, paparazzo d86) are
  boundary-joined, a different class from a missed window.
  (3) The multiGroups same-night question (one gorger twice
  vs two gorgers once) is NOT a fixable instrument gap: the
  gorge line itself carries no count, and ambiguous
  attribution cannot invent one. Do not cite multiGroups
  as evidence either way.
- Carried forward, unchanged: telemetry metric list for
  this leg is defendedFights,playerFights,latelyDefenseCount;
  defendedCount stays out until a correspondence is proven.

## Regression

- This run changes NO game code: the repo commit adds only
  the r122 driver + analyzer (new files) and this run note.
- Targeted proof suites, all green on this base (the suites
  that guard the fixes this panel relies on):
  - test-naming-debate-self-20261103.js: ALL PASS (r116 W4
    fix holds, incl. third-person control).
  - test-shelter-succession-20261103.js: ALL PASS (r116
    shelter-flag fix holds, incl. bystander control).
  - test-crisis-naming-dead-20261021.js: 7 passed, 0 failed.
  - test-crisis-muster-game-20261017.js: 35 pass, 0 fail.
- Full check.js --quick NOT run this run, stated plainly
  with the reason (same scope call as r117, preregistered):
  the commit touches no game code and no existing file, so
  there is no regression surface for the full gate to cover
  beyond the targeted suites above (which are the suites
  for the two fixes the panel depends on). The next run
  that touches src/js should run the full gate. Worktree
  git status at commit time shows exactly the 3 added
  files, nothing modified, no sibling files swept in.

## Telemetry deviation check (§14)

- Command: telemetry-check.js --baseline
  telemetry-baselines/crisis.json --current 'r122-panel/
  journey-crisis-r122-delayed-seed*.json' --metrics
  defendedFights,playerFights,latelyDefenseCount.
- Result: QUIET (exit 0, 3 files, 3 metrics, no large
  deviations). No LOUD lines to investigate. Baseline NOT
  rolled (a single 3-seed panel's variance must not be
  baked in).
