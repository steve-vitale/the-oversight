# Journey crisis r82 — steered defender lately fires nowhere, but the voice question is answered anyway (lane B, leg 6)

Successor to crisis r71. This run takes up r71's two carried items,
in tooling only — no src/js change.

Pre-registration:
`hidden_files/evidence/2026-10-31/journey-crisis-r82-prereg.md`
(+ addendum written after the seed-9407 pilot-v1 instrument test,
before any panel seed ran with the final driver).
Base: master 1701e30b4 (journey-landing r77) at registration.
Instrument: r71 driver/analyzer verbatim EXCEPT (a) driveConvo
steerLately on the first DEFENDER convo, (b) convoFavorAction
call-time wrap, (c) filenames r82. Diff r71 -> r82 verified line by
line; node --check clean on both scripts. Two record-only fixes
landed after the panel's first pass and the panel was re-run twice
to prove trajectory neutrality: (1) latelyOffered/Fired now reflect
ANY ask:lately pick, not just steered ones; (2) the flag check moved
after the generic fallback that actually selects lately on most
turns. All three panel passes produce byte-identical transcripts
and identical key fields (raids/gorge/sorties/end/census) — the
fixes change records only, never trajectories. Final panel files:
goal hidden_files/evidence/2026-10-31/r82-panel/ (v1 and v2 passes
filed under v1-panel/ and v2-panel/ for audit, not panel data).

## Run setup (done first, per the body)
- No Lane B lock present at run start — no stale-lock recovery
  needed. New lock written run 2026-10-31T03:55:41Z.
- Main-tree pre-flight: clean at first check (no sibling wait
  needed). Disk 19%, `git pull` already up to date, worktree-reap
  ran (LOUD dirty trees left untouched: journey2-succession,
  journey2-social closeout leftovers, sibling sim arms).
- Worktree slug deviation, documented: the body slug
  journey2-crisis could not be registered — the directory
  ~/workspace/worktrees/journey2-crisis/ still holds orphan evidence
  from Oct 14-25 runs and branch journey2-crisis already exists
  (tip already an ancestor of master). Registering over it would
  have clobbered held evidence. This run used journey2-crisis-r81
  (unique, still the lane-B journey2- prefix, never the lane-A
  journey- prefix). The orphan evidence dir was left untouched.
- Worktree registered ~03:57Z (register took ~2 min against
  registry flock; heartbeat verified in registry 04:00:13Z, then
  04:00:57Z via the 10-minute loop: goal
  hidden_files/journey2-crisis-r82-heartbeat.log).
- Canon: docs/CANON.md read in full before playing; repo AGENTS.md
  read (worktree copy byte-identical). Gating freeze (2026-10-27)
  untouched. Rotation-b read 6 at run start; this run plays 6 per
  the file and writes 7 on landing (verified by re-reading).

## Panel (policy oracleV2, 120d death-aware +10d tail, seeds
## 9407 / 9408 / 9411, sequential, all exit 0)
EVID: goal hidden_files/evidence/2026-10-31/r82-panel/.
Analyzer output: r82-panel-analysis.txt (same dir).

## C1 (bend, not break) — GO
- 9407: game-over d114, 0 alive, pantry 2,289. Cause named, not a
  siege failure: attrition to zero — last villagers die d113
  (monster), d114 (the night), d115 (the wild, tail). Final
  sorties refused 'no-fighters' because nobody was left to send.
- 9408: horizon, 4 alive, 0 kcal.
- 9411: game-over d112, village SCATTERED with Giuseppe alive.
  Cause named, not a siege failure: wild-death cascade d107 (4
  wild deaths the same day including the bearer Katarina) into
  scatter; final sorties refused 'no-fighters' on a gutted roster.
- Gates hold per C2, so C1's gate is met on both game-overs.

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 9 / 12 / 12. Fought resolutions on all
  seeds (9407 d15-d87; 9408 d9-d113; 9411 d16-d96, then moved-on
  d111/d121 after the scatter).
- Gates hold: TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); D1 snapshots 15/15 delayed >= 3 attempts;
  deltaBad empty (5/5 ok sorties price-exact); drift unknown = 0
  (sortie-clear 7, player-drawn-off 6, moved-on-valve 2).
- Sortie composition: 15 attempts, 5 ok (all cleared, remaining 0),
  10 refused — every refusal is 'no-fighters', an honest
  end-state, never a silent failure. The 5 ok sorties clear
  5-lingerer sets (crisisBefore live-raiders -> crisisAfter none).

## C2b (linger-conditional gorge/sortie) — GO
- Lingerer sets formed on all 3 seeds: gorge nights 13 / 21 / 14
  (48 total, 52,441 kcal gorged), sortie attempts 6 / 3 / 6.

## C3 (people check) — GO
Read in full: all 24 driven transcripts. fabricHits 0 panel-wide.
- NPCs want concrete things: Paul's fever help (d17, actionable
  proximity line), Asher's joint forage outing (d27: "We'll fill
  packs before dark" + partner-inside-hall line), Yuying's
  trap-line walk (d45), Asher's naming-debate opinions (d17).
- Every asked favor that reached the requirements menu got the
  actionable version. The 'no longer available' line never fired
  in any transcript (see F1).
- Repeated asks escalate, then close — never loop: favor
  requirements climb "As I said —" / "Like I said —" / "Still the
  same thing —" / "I've told you three times now —"; recaps
  escalate then close ("We're going in circles a bit").
- Invitations are sometimes taken, in this leg too: James "I'd
  love to. Lead the way." (d15); Paul first "Not right now"
  then "…Fine. This had better be worth it." (d24); Yuying
  "Someone should watch your back. Might as well be me." (d45).
- Grief reads as people, again: James's treeline vigils for Sung
  ("I check the treeline every hour for Sung, now"); Paul on
  Judith ("I dreamed Judith was still here. Woke up angry at the
  dream."); Asher on Jorge ("Since Jorge died... I keep
  expecting to see Jorge at the fire."); Yuying greeting
  everyone by name each morning "for Fritz, now". Paul on Marcus
  (taken at the Scattering, pods humming) stays KIN-coherent
  across d25/d35.
- Minor thinness, recurring from r71 (not a bar failure): recap
  subjects stay vague ("Still on that personal stuff", "Still
  on what was on their mind", "Still on their secret") — the
  recap line never names the topic.

## V1 (defender voice) — instrument NO-GO, voice ANSWERED
- V1-instrument: NO-GO as pre-registered. The steered DEFENDER
  convo fired ask:lately on 0/3 seeds: 9407 d15 (subjectNavs 2 —
  both pivots swallowed by the reactive confront queue, topics
  never listed), 9408 d9 (conversation refused at open — Rosa
  Vogel, no content, steering never got a turn), 9411 d16
  (subjectNavs 2 — pivots to mourning/want beats, topics never
  listed). Steering to a menu the reactive queue preempts is
  not steering; the first-defender convo is the worst place to
  steer because early convos carry pending betrayal/confront
  beats that outrank the subject menu (buildMenu: choosingSubject
  listing requires !reactiveDef).
- V1-voice: ANSWERED anyway, via unsteered lately fires + a
  targeted probe (not via the steered convos). ask:lately fired
  in 4/24 transcripts (9407 d23 DEFENDER, d24/d32 sheltered,
  9411 d46 sheltered). The defender one is the verdict:
  - 9407 d23, James Das, the morning after he stood down a
    Highbeam Deer at the treeline (d22, mFlee): lately fires and
    James talks about SUNG ("Sung owed me a favor. I keep
    thinking about collecting."), not the fight.
  - Probe (r82-probe-d23, same trajectory to the d23 boundary):
    James DOES carry the d22 'defended' memory ("I stood down
    Highbeam Deer at the treeline — it ran", sticky), and
    ask:lately IS offered — but t2LatelyEvent returns kind
    'mourning' (Sung, bearer=true), not 'defense'. The lately
    slot carries exactly ONE event, and the priority chain puts
    fresh grief / the dead-bearer mantle above defense
    (convoTopics.js: grief/mantle/table/outbreak/show/realm,
    then defense). The defense kind exists and is wired — it
    simply loses the slot while a higher event is live.
  - The sheltered lately fires confirm the slot works when it
    is free: d46 Yuying talks monster-naming ("Performance
    Review" / "The Ugly Beast" debate), d24 James talks Sung
    grief, d32 James talks pre-storm air.
- So the r71 silence is located, not just re-observed:
  defenders CAN talk lately, defenders DO remember the fight,
  but the morning-after fight almost never wins the single
  lately slot — grief outranks it, and the first convo of a run
  is crowded by reactive beats. A defender talking about
  yesterday's fight needs either a lately slot that survives
  grief, or a defense beat outside lately (the night already
  gets one aloud defense beat per havenGrowth.js r30 — the
  morning-after conversation is the gap, not the narration).
  No game change is made here: whether grief-should-outrank-
  defense is a design call, and it is now a precise one for
  Steve (see metric review).

## F1 (favor call-time cause) — blank stays OPEN, instrument proven
- The call-time wrap installed cleanly (wrapMissing false on all
  seeds) and logged 0 entries panel-wide: convoFavorAction
  never returned 'They are no longer available to receive help.'
  in any engine menu call or post-convo probe call across 24
  driven convos. The r70 line occurrence (Paul d77, Jada d86,
  Sanne d101 in r70's panel) did not reproduce, and no new
  occurrence appeared for the wrap to name.
- Per the prereg, zero occurrences keeps the blank OPEN (same
  as r71) — but the instrument is now strictly stronger than
  r71's post-convo probe: any future occurrence will be logged
  at call time with its disjunct, including favors closed
  in-convo. The next run inherits the wrap; no further
  instrument work is needed for this blank.

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r71: also 0). The phoenix per-event
  respawn cascade did not recur — expected under chaotic
  divergence (no lethal bearer <redacted> in these trajectories), not
  evidence about the clause. The Steve-call stands unchanged.

## C6 (days-tail) — wobble persists
Loop-iteration days vs max Game say-day at end: 9407 114 vs 115,
9408 120 vs 121, 9411 112 vs 122 (scatter tail). Same
instrument-wobble class as r70/r71; judge bands, not counters.

## Village assessment (plain words)
- 9407: fought 9 raids and cleared 2 lingerer sets, then ground
  down to nothing — 18 corpses from monster (7), the wild (4),
  starvation (2), wounds that wouldn't close (2), sickness,
  the arena, the night, and one Anaconda Empress kill. A village
  that bent through 13 gorge nights and broke by attrition, not
  by any single siege failure. Its last two sorties never left
  the door: there was nobody left to send.
- 9408: survives with 4 people and an empty pantry after 12
  raids, 21 gorge nights, and 3 sorties (all cleared). The
  hand-to-mouth survivor of the panel — fought everything, paid
  every sortie price exactly, and ended the run alive on zero.
- 9411: scattered after 12 raids and 14 gorge nights. The wild
  took four villagers on day 107 including the bearer, and the
  village came apart rather than dying one by one; one man,
  Giuseppe, was still alive when the village ceased to be one.
  Its 6 sortie attempts all died at 'no-fighters' — the village
  was already too thin to answer its own treeline.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights (all seeds), sorties
  (cleared and honestly refused), aid resolutions, defender
  conversations, and lately topics all fire on current master.
- FUN: yes — favors with concrete wants and actionable
  answers, grief that names names, invitations sometimes taken,
  a monster-naming debate villagers actually argue about, and
  the 9407 attrition story is a memorable what-if. The audible
  gap is precise now: nobody who fought yesterday talks about
  it the next morning, because grief holds the one lately slot.
- WINNABLE: the leg itself is not a win path; 1 of 3 villages
  survives it this run (vs 3 of 3 in r71) — a divergence
  warning, not a difficulty verdict. No win verdict is drawn
  from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63/r66/r69/r70/r71 on all 3 seeds —
defenderFights 95 -> 0, defendedCount 21 -> 0. EXPLAINED, not a
bug: the baseline's field names describe an older instrument;
current records carry defendedFights (32 / 44 / 39 across the
panel), not defenderFights. No NEW loud line. Baseline NOT
rolled.

## Test-suite call
Tooling-only change (2 new scripts, r71 clones + steerLately +
favor call-time wrap + 2 record-only flag fixes; zero src/js
diff). Verification: node --check on both scripts, 3-seed driver
runs (all exit 0, three passes byte-identical transcripts),
analyzer, 24 transcripts read in full, probe d23. check-quick:
284 passed, 6 failed in 482s (log: goal
hidden_files/evidence/2026-10-31/r82-checkquick.log). All 6
failures fall in the standing families documented by the r65
recovery and re-observed in r70/r71 — measurement x2
(proof-update, workflow), mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20-fixes
(1 racks-full voice assertion). No failure touches this run's
files (the 3 new scripts are not in the quick list). No NEW
failure vs r71. The measurement-only landing proceeds with the
failures reported, not hidden.

## Metric review (§14)
- C1/C2/C2b/C3/F1/C4 judged as pre-registered. No metric was
  re-scored mid-run.
- V1 judged in its two pre-registered parts separately:
  V1-instrument NO-GO (0/3 steered fires) is NOT folded into
  V1-voice, and V1-voice is reported as a judgment with quotes
  and a probe, not a count. The prereg addendum (subject-pivot
  navigation) was written BEFORE the panel ran and is a
  mechanism amendment, not a bar change.
- The two record-only flag fixes (latelyOffered/Fired) changed
  no bar and no trajectory (proven by byte-identical
  transcripts across three panel passes); they are instrument
  repairs, disclosed here rather than silently applied.
- Carried (unchanged): dead discoverer's orphaned fireside entry
  (r51, Steve's call); unfed marches proceed (r50, Steve's
  call); stare-down cost as a class (Steve's call); phoenix
  per-event cascade (Steve-call); armor causation (needs a
  control arm); telemetry mapping proposal defenderFights ->
  defendedFights; gating freeze (2026-10-27) untouched.
- NEW for the next run / for Steve: (1) grief-outranks-defense
  in the single lately slot — is that the intended order the
  morning after a fight, or should defense get its own beat?
  (2) recap subjects stay vague ("Still on that personal
  stuff") — r71's minor thinness, still open. (3) The favor
  'no longer available' blank stays open with the call-time
  wrap inherited; the next occurrence anywhere names its own
  disjunct.
