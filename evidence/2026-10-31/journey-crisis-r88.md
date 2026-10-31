# Journey crisis r88 — the boundary sampler saw every due window; famine and sickness finally bite (lane B, leg 6)

Successor to crisis r85. Pilot-only run per §9-12 (3 fresh seeds; the
pilot answered the leg's questions, so no panel expansion — the r85
panel seeds were NOT re-run).

Pre-registration:
`hidden_files/evidence/2026-10-31/journey-crisis-r88-prereg.md`
Base: master 6fd6b448d at registration (rosterlot census, merged by
the Lane A coordinator during this run's pre-flight; r85's base was
003a9c2f3, so panel trajectories are NOT expected to match r85).
Instrument: r85 driver/analyzer verbatim EXCEPT filenames r88, the
tick-part linger sampler, pantryDaily capture, and lastSeenDay on
drift records. Diff r85 -> r88 reviewed line by line; node --check
clean on both scripts. Determinism leg: seed 9601 re-run
byte-identical (panel log + `r88-panel/determinism/`), so the
record-only sampler provably changes no trajectory.

## Run setup
- No Lane B lock present at run start — no stale-lock recovery
  needed. New lock written run 2026-10-31T19:55:59Z.
- Main-tree pre-flight: clean at first check, disk 22%, `git pull`
  already up to date, worktree-reap ran (LOUD dirty trees left
  untouched: journey2-succession + journey2-succession-r86, both
  owner oversight-playtest-loop-2 with uncommitted changes, plus
  sibling sim arms — see the held-work note at the end).
- Registration was slow (~8 min, not a failure): the registry flock
  queue was backed up behind sibling heartbeat loops; the register
  completed normally. No ref surgery, no lock-breaking.
- Worktree slug deviation, documented: the body slug journey2-crisis
  could not be registered — the directory still holds orphan
  evidence from Oct 14-25 runs and branch journey2-crisis already
  exists (same class as r85's journey2-crisis-r85). This run used
  journey2-crisis-r88 (unique, still the lane-B journey2- prefix,
  never the lane-A journey- prefix). The orphan dir was left
  untouched.
- Heartbeat loop started and VERIFIED landed in the registry
  (20:11:04Z, then 20:11:20Z from the loop, then every 10 min) —
  never trusted blind.
- Canon: docs/CANON.md read in full before playing; repo AGENTS.md
  read (worktree copy verified byte-identical to the main tree's).
  docs/DIRECTIVES.md re-read. Gating freeze (2026-10-27) untouched.
  Rotation-b read 6 at run start; this run plays 6 per the file and
  writes 7 on landing (verified by re-reading).

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds
## 9601 / 9602 / 9603, sequential, all exit 0)
EVID: goal hidden_files/evidence/2026-10-31/r88-panel/.
Analyzer output: r88-panel-analysis.txt (same dir).
Smoke test first: SEED=9601 DAYS=5 proved the doAction wrap runs
(29 tick-part samples over 5 days: forage/wait/drink) before the
panel launched.

## C1 (bend, not break) — GO
- 9601 reaches the 120d horizon: 7 alive / 35,229 kcal.
- 9603 reaches the 120d horizon: 3 alive / 2,878 kcal.
- 9602 game-overs at day 89 with a NAMED cause that is NOT a
  siege-mechanic failure: monster attrition. The corpse record
  tells it straight — a d78 massacre (Jack, Elena, Ama), a d81
  sortie that BROKE (muster failed, remaining 2, paid 6,390) with
  three more monster deaths the same day (Mia, Ruby, Zere), a
  d84 wound death (David Kim), and the final three deaths d89
  (Lisa Rizzo 'the wild', Joseph 'combat', Vasyl Shevchenko
  'the wild'). Pantry hit 0 at iters 84/86/87 but RECOVERED to
  5,670 by iter 88 — starvation did not kill this village;
  monsters did, through mechanisms that all fired correctly.
  Raids fired 6, fought resolutions 5, the sortie mechanism
  worked and broke legitimately. No siege-mechanic failure
  anywhere (see C2).

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 10 / 6 / 7. Fought resolutions on all
  seeds (every resolution list includes fought; 9602 adds one
  moved-on tick resolution, 9603 one moved-on tick resolution).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); legacy count 0 as well.
- D1 snapshots all delayed >= 3 attempts: 6/6.
- deltaBad empty (4 ok sorties, all deltaExact). D3 drift
  unknown = 0 (labels panel-wide: sortie-clear 3,
  player-drawn-off 4, moved-on-valve 5).
- Days-tail wobble persists, same class as r70/r71/r82/r85:
  loop-iteration days vs max Game say-day 9601 120 vs 121,
  9602 89 vs 89, 9603 120 vs 122. Judge bands, not counters.

## C2b (linger-conditional gorge/sortie, REVISED) — GO, and the
## r85 INSUFFICIENT-DATA retires as answered
- Lingerer sets form on all seeds. Gorge nights: 9 / 12 / 17
  (38 total, 49,764 kcal eaten at the treeline).
- Boundary sorties: 6 attempts, 4 ok (3 cleared, remaining 0),
  2 refused — both refusals carry the recorded reason
  'no-fighters' (9603 d105 + d107: the village was down to a
  handful of people with nobody left to muster; the set then
  moved on at d108 via the moved-on valve, which is the game
  resolving honestly, not a refusal bug).
- MISSED-WINDOW, refined: the analyzer's raw count is 2 (9602
  redactor + terms_of_service, drift d84, tick samples at d83
  with waited 5). Refined against the driver's own delayed rule,
  BOTH are NOT missed windows: that set already had a boundary
  sortie at d81 (sortiesBefore=1, lastSortieDay=81), and the rule
  allows a second sortie only 3+ days after the first — due
  d84, the very day the set moved on during ticks, before the
  boundary could decide. At the d83 samples the second sortie
  was 2 days post-sortie, NOT due. Refined missed-window
  total = 0.
- Completeness of that zero: every other drift in the panel
  either cleared by sortie, drifted at waited <= 1 (never near
  the threshold), or was player-drawn-off. No first-sortie
  window opened and closed between boundaries in 3 seeds.
- Cross-check, corrected: the analyzer's "prior waited>=3"
  column reads 0 for the two waited-3 clears (9601 d67 murkcap,
  9603 d63 alien_tick). That is sleep-roll stamping, not a gap:
  tick samples are stamped with the pre-sleep Game day, so the
  boundary day itself never appears in samples for a set cleared
  at that boundary — max prior waited is boundary waited minus
  1 (murkcap 2, alien_tick 2, both exactly as predicted). The
  waited-4 clear (9601 d110) shows 11 prior waited>=3 samples.
  The sampler demonstrably watches every set approach its
  threshold.
- VERDICT: r85's "sortie verdict INSUFFICIENT-DATA (sampling
  gap)" is retired. Boundaries saw every due window this pilot;
  the one near-miss is a same-day race between the moved-on
  valve and the second-sortie due day, which is game behavior,
  not sampler blindness. The r89 brief (moving the decision into
  the tick-part sampler) is NOT needed for correctness of the
  verdict — it would only change WHEN a due sortie fires within
  a day, a player-experience question, not a measurement one.

## C3 (people check) — GO, with two minor flags
Read in full: all 24 driven transcripts. fabricHits 0 panel-wide.
- NPCs want concrete things: Sidney's and Priya's festering
  wounds ("If it festers I'm no good to anyone — can't haul,
  can't hunt, can't watch. Just clean it out and wrap it
  tight."), Kristina's forage outing ("Nobody's worked the old
  burn east of camp in days. We'll fill packs before dark."),
  food_share and sick_help favors with honest states.
- Every asked favor that reached the requirements menu got the
  actionable version ("Move next to them, on the same side of
  the Haven door, to help" / "Move next to your partner...").
  The 'no longer available' line never fired in any transcript
  (see F1).
- Repeated asks escalate, then close — never loop: favor
  requirements climb "As I said —" / "Like I said —" /
  "Still the same thing —" / "I've told you three times
  now —"; recaps climb the same ladder to "We're going in
  circles a bit —"; Caleb's press sequence spends out ("You've
  walked them through it every way you know how. Their story
  holds — either it's true, or it's been rehearsed a lot.
  There's nothing more to press here.").
- Invitations are sometimes taken, in this leg too: Blanca's
  haul (d16) and trap-line walks (d17, d52 — the d52 walk ends
  with a gifted tool); Nikolai's haul that teaches water-reading
  on the way (d75); Daniela's trap-line walk (d13); Caleb's
  eager party accept (d46: "Yes. Absolutely. I've been hoping
  you'd ask. (A little too quickly.)"); Alejandra's trap-line
  walk with the torn-ground beat (d48); Kristina's outing (d60)
  and buried-cache reveal (d93: "I buried this before the
  Scattering... (+983 kcal to the pantry.)").
- Grief reads as people, again: Zere counting the fire ("I keep
  count of who's at the fire. I don't mean to — I just notice
  the gaps."), Blanca on Tebogo ("Tebogo owed me a favor. I
  keep thinking about collecting. Stupid."), Daniela's
  protector goal ("Nobody touches this group. Not while I'm
  standing." / "I've got a list in my head. People I'd step in
  front of. It keeps getting longer."), Lisa's memory goal
  ("If I forget who I was, then what survived? Just a body."),
  Caleb's confession ("I don't actually want to belong
  somewhere. I want to be in charge... That person isn't real."),
  Alejandra's small beliefs ("I believe in breakfast. In
  people showing up. Small, provable things.").
- Direct defense questions still work (r85 V2, unchanged):
  Daniela d13, asked "The defense — how did it go out there?",
  answers "I stood down Hushpuppy at the treeline — it ran.
  Don't call it brave. Call it awake." The line is shared with
  r85's Giuseppe — a defender-voice line, not a defect, but
  noted so it isn't mistaken for a fresh quote.
- FLAG 1 (minor, driver display, documented not fixed):
  Zere d60's party-invite pick ends the conversation with no
  outcome line in the driven file. Code-read: dlg:invite maps
  to invite_party, whose handler speaks the outcome via
  done(); but driveConvo breaks on !active BEFORE dumping the
  turn's final transcript lines, so any turn that ends the
  conversation swallows its own closing line. The outcome
  exists in the engine transcript, not in the driven file.
  Carried for r89: dump slice(-2) before breaking on !active.
  Not a game defect — Caleb's d46 invite (which did not end
  the convo) shows its accept line normally.
- FLAG 2 (minor, content echo): Daniela d39 claims Columbus,
  Ohio origin ("I'm not from Denver. I'm from Columbus, Ohio.
  It's safer if people don't know.") — the same origin the
  driver's fixed player answers give the player, and the same
  echo class as deepening r76's FLAG-D-VARIANT. As a delivered
  secret with a reason it reads fine; the recurrence across
  panels suggests a shared origin pool, not fabrication. Noted,
  not judged.

## F1 (favor call-time cause) — blank stays OPEN, instrument proven
- The call-time wrap installed cleanly (wrapMissing false on all
  seeds) and logged 0 entries panel-wide: convoFavorAction never
  returned 'They are no longer available to receive help.' in any
  engine menu call or post-convo probe call across 24 driven
  convos. Per the prereg, zero occurrences keeps the blank OPEN
  (same as r71/r82/r85) — the wrap is inherited by the next run.

## C7 (famine/disease pressure census, NEW) — pressure is real
- 9601: pantry low-water 6,465 kcal (iter 83), recovered to
  35,229. A squeeze, not a famine. 13 corpses, all
  wild/arena/monster/contest — no famine, no sickness.
- 9602: pantry hit 0 at iters 84/86/87, recovered to 5,670 by
  iter 88 — but the village died by monsters (see C1), not by
  the empty pantry. No famine or sickness deaths recorded.
- 9603: pantry hit 0 at iter 100 (gameDay 102) and ended at
  2,878 with 3 alive. The pressure DID kill: Chloe Dubois
  starved d106, Adaeze Nwosu died of sickness d88, Aidan died
  of sickness d112. Wound deaths also present (Mara Vasquez
  d51, Daniyar Askarov d70 "a wound that wouldn't close").
- Transcript wants track the same pressures: wound-care favors,
  forage-help ("We'll fill packs before dark"), food_share
  favors — villagers ask about food, wounds, and sickness like
  people, and the game answers with real deaths when the
  pantry and the medicine run out.
- CENSUS VERDICT: this is the first crisis-leg panel where
  famine and disease deaths both appear. The leg's famine and
  disease episodes are not theoretical: a village can starve
  and sicken inside 120 days while still fighting raids, and
  the survivors' story (3 alive, 2,878 kcal) reads as a village
  that bent almost to breaking. No bar was set; no bar is
  claimed.

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r85: also 0). The phoenix per-event
  respawn cascade did not recur. The Steve-call stands unchanged.

## BLANK FILLED: tick-part linger sampler + skipped-window verdict
## (instrument only, zero src/js)
- The r85 next-run instruction is done: lingerers are now
  sampled per tick part (1,084 / 787 / 1,201 samples across the
  panel, verbs forage/wait/drink), joined to the boundary book
  with a conservative first-seen, and the skipped-window
  analysis runs in the analyzer. The refined verdict is 0
  missed windows (see C2b), and the determinism leg proves the
  sampler is trajectory-neutral (9601 byte-identical).
- What this run does NOT do (plain words): it does not change
  when sorties fire, what they cost, or who can be mustered.
  It only proves the old boundary sampler wasn't hiding due
  sorties, and it adds the pantry-low census that caught the
  famine/sickness deaths.

## Village assessment (plain words)
- 9601: the grinder — fought 10 raids, ended with 7 people and
  35,229 kcal. Thirteen dead along the way, mostly to the wild
  and the arena, but the pantry held and the village never
  broke. Blanca is its memory (Tebogo's uncollected favor,
  the trap-line walks, the gifted tool).
- 9602: the village that died fighting — fought 6 raids, ended
  with nobody at day 89. The d81 sortie broke, the raiders kept
  killing, and the last three died on day 89. Its pantry went
  empty twice and recovered both times; hunger wasn't the
  killer, monsters were. Zere counted the gaps at the fire on
  d79, ten days before the end.
- 9603: the village that almost broke — fought 7 raids, ended
  with 3 people (Kristina, Owen, Paulo) and 2,878 kcal. It
  starved one villager, sickened two more, buried fourteen in
  all, refused two sorties for lack of fighters — and still
  stood at the horizon. Daniela appointed herself the treeline
  watch; Kristina dug up a buried cache at d93 that helped
  keep the fire lit.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, fought resolutions,
  sorties (fired and refused with reasons), defender
  conversations, favors with actionable answers, betrayal
  investigations that spend out, and now famine/sickness
  deaths all fire on current master. The sortie bar no longer
  carries a sampling asterisk.
- FUN: yes — favors with concrete wants, grief that names
  names, invitations sometimes taken, a protector who keeps a
  list of people she'd step in front of, a researcher who
  collects facts like food, a village that counts its gaps at
  the fire. The audible gaps are now precise and small: one
  swallowed invite-outcome line (driver display, documented
  for r89) and one shared origin echo (content pool, minor).
- WINNABLE: the leg itself is not a win path; 2 of 3 villages
  survive it this run (vs 3 of 3 in r85) — divergence, not a
  difficulty verdict, and the one death has a named
  non-mechanical cause. No win verdict is drawn from this leg
  alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63/r66/r69/r70/r71/r82/r85 on all 3 seeds —
defenderFights 95 -> 0, defendedCount 21 -> 0. EXPLAINED, not a
bug: the baseline's field names describe an older instrument;
current records carry defendedFights (80 total across the panel),
not defenderFights. No NEW loud line. Baseline NOT rolled.
(The determinism re-run JSON was moved to r88-panel/determinism/
before the check so the glob counts each seed once.)

## Test-suite call
Instrument-only change (r88 driver + analyzer); zero src/js diff.
Verification: node --check on both scripts, 5-day smoke run (wrap
proven running), 3-seed driver runs (all exit 0), determinism
re-run byte-identical, analyzer, 24 transcripts read in full,
code-reads for the Zere invite flag and the sleep-roll stamping.
check --quick: 284 passed, 6 failed in 466s (log:
goal hidden_files/evidence/2026-10-31/r88-checkquick.log).
The 6 failures are exactly the standing pre-existing families —
measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes — matching r85's baseline. No new
failure. The run is instrument-only (zero src/js diff), so no
failure is attributable to r88.

## Metric review (§14)
- C1/C2/C2b/C3/F1/C7 judged as pre-registered. No metric was
  re-scored mid-run. Two refinements are documented as analysis
  clarifications, not bar changes: (1) C2b's missed-window count
  is refined against the driver's own delayed rule (a second
  sortie is due only 3+ days after the first), which moves the
  raw analyzer count 2 -> refined 0 with the d81->d84 race
  named; the prereg's rule ("MISSED-WINDOW > 0 does not fail
  the game") is unchanged, and the refined count only sharpens
  what counts as a window. (2) The analyzer's cross-check
  column is read as boundary-waited-minus-1 (sleep-roll
  stamping), not as a gap — the column's meaning, not the bar,
  was corrected by the data.
- V2/defense-last NOT re-measured (r85 answer stands, Steve-call
  pending); lately content is reported only as the Caroline d14
  observation (naming wins the slot when offered).
- R1 NOT re-investigated (r85 verdict stands).
- Carried (unchanged): dead discoverer's orphaned fireside entry
  (r51, Steve's call); unfed marches proceed (r50, Steve's
  call); stare-down cost as a class (Steve's call); phoenix
  per-event cascade (Steve-call); armor causation (needs a
  control arm); telemetry mapping proposal defenderFights ->
  defendedFights; gating freeze (2026-10-27) untouched.
- NEW for the next run / for Steve: (1) defense-last in the
  lately line — still the open Steve-call from r85, unchanged.
  (2) driver transcript gap: dump the final lines before
  breaking on !active, so ending turns (like Zere's invite)
  keep their outcome line. (3) The favor 'no longer available'
  blank stays open with the call-time wrap inherited. (4) The
  r89 brief no longer needs to move the sortie decision into
  the tick-part sampler for verdict correctness; if it moves,
  it moves for player-experience timing, not measurement.
- HELD WORK (not this run's, flagged for the main session):
  journey2-succession and journey2-succession-r86 both still
  carry uncommitted changes (owner oversight-playtest-loop-2)
  and were left untouched by every reaper run; per INSPECT HELD
  WORK they need a main-session inspection, not a loop-run
  touch.

## Closeout (recovery, 2026-10-31 late)
The 15:00 run timed out before check --quick finished. A first
recovery attempt's initial --quick run was SIGTERM-killed; its
detached restart completed with the 284/6 result above, and this
closeout filled the [PENDING] section from that complete log,
committed the note + 2 scripts, merged, and advanced
rotation-b 6 -> 7. No game-code change at any point.
