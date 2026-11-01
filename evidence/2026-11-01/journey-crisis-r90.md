# Journey crisis r90 — the stalled run completed: every ending line kept, one village dies fighting (lane B, leg 6)

Recovery/completion run: the 00:00 Lane B run (lock 2026-11-01T04:58:35Z)
finishes the stalled 23:00 crisis r90 run. Pilot-only per §9-12 (3 fresh
seeds; the pilot answered the leg's questions, so no panel expansion — the
r88 panel seeds were NOT re-run).

Pre-registration (adopted verbatim): the stalled run's own prereg,
`hidden_files/evidence/2026-11-01/journey-crisis-r90-prereg.md`.
Base: master fa2c896d5 at registration (git pull already up to date).
Instrument: r88 driver/analyzer verbatim EXCEPT filenames r90, pilot seeds
9701/9702/9703, evidence dir 2026-11-01, plus the ONE carried fix below.
Diff r88 -> r90 reviewed: only renames plus the fix block. node --check
clean on both scripts. Determinism leg: seed 9701 re-run BYTE-IDENTICAL
(panel JSON, r90-panel/determinism/), so the fix is trajectory-neutral.

## Run setup — stale-lock recovery + three EPERM-flap episodes
- Stale-lock recovery: the 23:00 run's lock (2026-11-01T03:56:00Z) named a
  registry heartbeat (journey2-crisis-r90, 03:59:11Z) 57+ minutes stale,
  no node/sim processes running, and the r90 tree holding only its 2
  forked scripts. Per the loop body the previous run was DEAD: lock
  deleted, new lock written, recovery noted here. The r90 tree was NOT
  adopted (stale base, registered to the dead run) and NOT touched
  afterward — its 2 scripts were copied into this run's fresh tree, and
  the tree itself stays held for main-session inspection (see Held work).
- Worktree slug deviation, documented: the body slug journey2-crisis
  could not be registered — branch journey2-crisis already exists
  (fully merged old branch, 0 ahead of master) and the directory still
  holds orphan evidence from Oct 14-25 runs. Same class as r88's
  journey2-crisis-r88. This run used journey2-crisis-r91 (unique, still
  the lane-B journey2- prefix, never the lane-A journey- prefix). The
  orphan dir was left untouched.
- Registration was slow and loud: the container EPERM flap blocked
  `.git/refs/heads` writes on 9 consecutive register attempts (04:59–
  05:11Z, same class as the 2026-10-23 incident), then cleared; attempt
  7 of a rapid-retry loop registered at 05:11:47Z. No ref surgery, no
  lock-breaking, no manual branch creation. Heartbeat VERIFIED landed
  in the registry (05:11:55Z, then manual re-heartbeats through the
  run); the registry-save flap also blocked heartbeats for a stretch
  (05:13–05:24Z, PermissionError on REGISTRY.json save), during which
  the tree's dirty state (untracked scripts) kept it LOUD-protected
  from the reaper. A 10-minute heartbeat loop ran with a readable log
  (never /dev/null).
- File-write flap, diagnosed not worked around blindly: writing the
  driver's JSON to a file failed repeatedly (empty output, exit 1,
  silent stderr) while the same run piped through `head` printed fine.
  The smoking gun was `tee` failing with "Operation not permitted"
  writing to the goal evidence dir — the EPERM flap on write(2),
  hitting .git, REGISTRY.json, /tmp, and the goal dir alike. Pilot
  runs therefore used a verify-and-retry wrapper (JSON must parse and
  carry the seed; transcript files must match convosDriven) — all
  three seeds landed on attempt 1 once the flap cleared, and the
  wrapper stays the documented pattern for the next run if the flap
  returns. No output was trusted without a parse check.
- Canon: docs/CANON.md read in full before playing; docs/DIRECTIVES.md
  re-read; repo AGENTS.md (worktree copy) read. Gating freeze
  (2026-10-27) untouched. Rotation-b read 6 at run start; this run
  plays 6 per the file and writes 7 on landing (verified by re-read).
  (Sequencing note: r88's closeout wrote 6 -> 7, but the later r78
  social run read 5 and wrote 5 -> 6, so 6 is what the file says and
  6 is what runs. No leg is skipped.)

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds
## 9701 / 9702 / 9703, sequential, all exit 0)
EVID: goal hidden_files/evidence/2026-11-01/r90-panel/.
Analyzer output: r90-panel-analysis.txt (same dir).
Smoke test first: SEED=9701 DAYS=5 proved the doAction wrap runs
(tick-part samples present, verbs forage/wait/drink) before the panel
launched.

## C1 (bend, not break) — GO
- 9701 reaches the 120d horizon: 8 alive / 40,084 kcal.
- 9703 reaches the 120d horizon: 8 alive / 39,905 kcal.
- 9702 game-overs at day 118 (say-day 124) with NAMED causes, none a
  siege-mechanic failure: the corpse record tells it straight — a
  d32 pit-trap death (Luke McKenna, the village's own trap), monster
  deaths d72/d109/d122/d123 (Bill, Thabo, DeAndre, Nikos, Hassan),
  Night Court d95 (Jimena Guardia), arena d101 (Tyler Healy), the
  wild d102/d124 (Carlos Diaz, Onni Korhonen, Daniyar Askarov, and
  the player, Caleb Jones), and sickness d116/d123 (Aria, Desmond
  Clarke). The pantry hit 0 at gameDay 121 but nobody starved — the
  village died by monsters, the wild, and sickness while still
  fighting: 10 raids, 9 fought resolutions including 3 sortie-calls,
  5 sorties all ok, the final set moving on at d124 via the valve.
  Raids fired, sorties fired and cleared, the valve fired. No
  siege-mechanic failure anywhere (see C2).

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 8 / 10 / 10. Fought resolutions on all
  seeds (every resolution list includes fought; 9702 adds one
  moved-on tick resolution at d124).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); legacy count 0 as well.
- D1 snapshots all delayed >= 3 attempts: 7/7.
- deltaBad empty (7 attempts, 7 ok, 5 cleared to zero remaining,
  deltaExact 7). D3 drift unknown = 0 (labels panel-wide:
  sortie-clear 9, moved-on-valve 1).
- Days-tail wobble persists, same class as r70/r71/r82/r85/r88:
  loop-iteration days vs max Game say-day 9701 120 vs 122,
  9702 118 vs 124, 9703 120 vs 123. Judge bands, not counters.

## C2b (linger-conditional gorge/sortie) — GO
- Lingerer sets form on all seeds. Gorge nights: 6 / 34 / 3
  (43 total, 36,650 kcal eaten at the treeline). 9702 lived under
  siege pressure for 34 gorge nights — the leg's long-siege case.
- Boundary sorties: 7 attempts, 7 ok, 0 refused. No refusal reasons
  were needed because no sortie was refused; the moved-on valve
  resolved the one set that outlasted its sorties (9702 d124).
- MISSED-WINDOW total = 0 (raw analyzer count, no refinement
  needed this run — unlike r88's raw 2 -> refined 0). Every
  boundary-sortie cross-check reads ok:true; the sleep-roll
  stamping class from r88 recurs exactly as predicted (boundary-day
  clears show 0 prior waited>=3 samples; the long 9702 sets show
  6/21/22). The boundary sampler hides no due sortie this panel.

## FIX-VERIFY (transcript ending-turn fix) — GO
- The r88 FLAG 1 fix is applied and behaviorally proven: 22
  ending-turn cases occur across the 24 driven transcripts, and all
  22 show their outcome lines in the driven file (mechanical scan:
  every '(conversation ended by the engine)' marker is preceded by
  dumped NPC:/YOU: lines from that turn). The 2 transcripts without
  the marker ended on the driver's 12-turn cap, not on an engine
  end, so no dump was owed. The fix stands proven, not merely
  code-verified. What it changes, in plain words: nothing in the
  game — only the driven transcript file now keeps the last thing
  said when a conversation ends mid-turn (previously swallowed).
  Zero src/js diff.

## C3 (people check) — GO
Read in full: all 24 driven transcripts. fabricHits 0 panel-wide.
- NPCs want concrete things: Joseph He's forage outing ("The stores
  won't stretch past tomorrow... the south slope below the meadow —
  come with me and we'll fill packs before dark"), DeAndre's ridge
  outing ("Another day like today and we're choosing who eats...
  at sunup. Bring your pack and your knife"), Luz's festering wound
  ("If it festers I'm no good to anyone — can't haul, can't hunt,
  can't watch. Just clean it out and wrap it tight" — the same
  wound-voice line r88 saw from Sidney/Priya, a shared voice line,
  not a defect).
- Every asked favor that reached the requirements menu got the
  actionable version ("Move next to them, on the same side of the
  Haven door, to help" / "Your partner is inside the Haven hall. Go
  through the door to meet them"). The 'no longer available' line
  never fired in any transcript (see F1).
- Repeated asks escalate, then close — never loop: favor
  requirements climb plain -> "As I said —" -> "Like I said —" ->
  "Still the same thing —" -> "I've told you three times now —";
  recaps climb the same ladder to "We're going in circles a bit —";
  "Tell me more" spends out ("That's... pretty much all of it,
  honestly"); doubt rattles then closes ("I've told you what I've
  told you"); a confession refuses repetition ("I confessed that
  already. I'm not confessing it twice for dramatic effect").
- Invitations are sometimes taken, in this leg too: Joseph's
  grudging accept (d63: "...Fine. This had better be worth it."),
  Tyler's watch-your-back accept (d29), Ricardo showing his
  thinking place (d35: "Don't tell the others. Everyone needs one
  place."), Carol's quiet treeline walk (d62) — and sometimes
  declined with a reason: Luz twice (d8: "Not right now. I've got
  my own things to handle."). Takes and declines both carry
  character; neither is the default.
- Grief is grounded in real deaths, not generated filler: Luz d8
  mourns Kavya (dehydration d6 — "Kavya always took the burnt
  piece. Said someone had to. I take it now."); Ricardo d26 grieves
  Francesca (the wild d25 — "Francesca is gone and the world just...
  continues. That's the part I can't stand." / "We bury, we grieve,
  we keep going. There's no step four."); the village keeps arguing
  the ambush of Boris (ambush d21) long after his death ("Nobody's
  settled it"). The mourning names match the corpse records
  day-for-day.
- Lately, observed only (r85 V2 answer stands, Steve-call): the
  steered lately attempts on all three seeds hit a closed gate
  (subject pivots exhausted, lately not offered, recorded not
  forced); unsteered lately fired twice (9703 d34/d41, same
  speaker) and both times the content was the naming debate
  (Inspiration / Cliffhanger, with 'Big Loud' / 'Big Big' shouted
  down), never defense. No defense-last observation this panel.
- FLAG (minor, content echo, noted not judged): the player's fixed
  driver answer "Columbus, Ohio" recurs as an origin (9703 d42) —
  the same echo class as r88 FLAG 2 / deepening r76 FLAG-D-VARIANT.
  It is the driver's own fixed answer, not fabrication.

## F1 (favor call-time cause) — blank stays OPEN, instrument proven
- The call-time wrap installed cleanly (wrapMissing false on all
  seeds) and logged 0 entries panel-wide: convoFavorAction never
  returned 'They are no longer available to receive help.' in any
  engine menu call or post-convo probe call across 24 driven
  convos. Per the prereg, zero occurrences keeps the blank OPEN
  (same as r71/r82/r85/r88) — the wrap is inherited by the next run.

## C7 (famine/disease pressure census, descriptive, no bar)
- 9701: pantry low-water 3,834 kcal (iter 64, gameDay 66),
  recovered to 40,084. A squeeze, not a famine. 4 corpses, none
  famine/disease (2 wounds, 1 wild, 1 ambush).
- 9702: pantry hit 0 at iter 114 (gameDay 121), ended at 0 — but
  the village died by monsters/wild/sickness (see C1), not by the
  empty pantry. 2 sickness deaths (Aria d116, Desmond Clarke d123),
  0 famine deaths.
- 9703: pantry low-water 10,250 kcal (iter 6, gameDay 8),
  recovered to 39,905. 4 corpses, none famine/disease (1
  dehydration d6, 2 monsters, 1 wild).
- CENSUS VERDICT: disease pressure bit again (2 sickness deaths on
  the dying seed); famine deaths did not recur this panel (r88 had
  1). The leg's disease episode is not theoretical; starvation
  remains the rarer killer.

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r85/r88: also 0). The phoenix per-event
  respawn cascade did not recur. The Steve-call stands unchanged.

## BLANK FILLED: ending-turn transcript lines (instrument only, zero src/js)
- The r88 next-run instruction is done: driveConvo now dumps the
  final transcript lines (slice(-2), npcLines included) before
  breaking on an engine-ended turn, so ending turns keep their
  outcome lines. Proven by the 22/22 mechanical scan plus the
  byte-identical determinism re-run. What this run does NOT do
  (plain words): it does not change when sorties fire, what they
  cost, who can be mustered, or anything the player sees in the
  game. It only fixes the measurement's own transcript file.

## Village assessment (plain words)
- 9701: the village that held — fought 8 raids, ended with 8
  people (Joseph, Vadim, Rodrigo, Sanne, Ethan, Aroha, Grace,
  Valeria) and 40,084 kcal. Four dead along the way, two to wounds
  that wouldn't close. Joseph is its memory (the forage outings,
  the unmet Haven-door requirement, the grudging invite).
- 9702: the village that died fighting — fought 10 raids, lived
  through 34 gorge nights, and ended with nobody at day 118. The
  sorties worked (5 ok, 3 of them clearing named raider sets) and
  the valve worked (the last set moved on) — the village was
  simply ground down by monsters, the wild, and sickness in the
  final four days, and the player, Caleb, died with it on day 124.
  Its pantry went empty and nobody starved; hunger wasn't the
  killer, everything else was.
- 9703: the village that grieved and stood — fought 10 raids,
  ended with 8 people (Luz, Ricardo, Lungile, Desmond, Jesse, Yuki,
  Lucas, Ava) and 39,905 kcal. It buried Kavya to dehydration on
  day 6 and Francesca to the wild on day 25, and the survivors
  still talk about both by name weeks later. Ricardo tends the
  fire for Francesca; Luz takes the burnt piece for Kavya.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, fought resolutions,
  sorties (fired, cleared, partial-cleared, and valve-resolved),
  defender conversations, favors with actionable answers, betrayal
  investigations that spend out, moots, grief grounded in real
  deaths, and now sickness deaths all fire on current master. The
  transcript file no longer swallows ending-turn outcomes.
- FUN: yes — favors with concrete wants, grief that names names
  and matches the corpse record, invitations sometimes taken and
  sometimes refused with character, a confessor who won't confess
  twice for dramatic effect, a village that argues about what to
  call the monsters. The audible gaps are now precise and small:
  one shared wound-voice line (voice pool, not a defect) and one
  origin echo (driver's fixed answer, not fabrication).
- WINNABLE: the leg itself is not a win path; 2 of 3 villages
  survive it this run (same as r88) — and the one death has named
  non-mechanical causes. No win verdict is drawn from this leg
  alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63/r66/r69/r70/r71/r82/r85/r88 on all 3 seeds —
defenderFights 95 -> 0, defendedCount 21 -> 0. EXPLAINED, not a
bug: the baseline's field names describe an older instrument;
current records carry defendedFights (panel-wide), not
defenderFights. No NEW loud line. Baseline NOT rolled.
(The determinism re-run JSON lives in r90-panel/determinism/ so
the glob counts each seed once.)

## Test-suite call
Instrument-only change (r90 driver + analyzer); zero src/js diff.
Verification: node --check on both scripts, 5-day smoke run (wrap
proven running), 3-seed driver runs (all exit 0, first attempt after
the flap cleared), determinism re-run byte-identical, analyzer,
24 transcripts read in full, code-reads for the fix placement and
the d121/d124 partial-clear + valve sequence.
check --quick: 284 passed, 6 failed in 705s (log:
goal hidden_files/evidence/2026-11-01/r90-panel/r90-checkquick.log).
The 6 failures are exactly the standing pre-existing families —
measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes — matching r88's baseline. No new
failure. The run is instrument-only (zero src/js diff), so no
failure is attributable to r90.

## Metric review (§14)
- C1/C2/C2b/C3/F1/C7 judged as pre-registered. No metric was
  re-scored mid-run. FIX-VERIFY judged as pre-registered (22/22
  ending-turn cases with outcome lines; the bar's zero-case clause
  was not needed).
- Analysis clarifications, not bar changes: (1) the analyzer's
  "unattributed death lines" (4 Codex page-turn lines: Loud-Bane
  d32, Nostalgia d53, Loud-Eyes d110, Big Big d121) are sortie
  kills announced by the Codex, matching D2 clears / the d121
  cross-check day-for-day — explained, not a gap. (2) The d121
  sortie partially cleared its set (Big Big killed) and the
  remainder moved on at d124 via the valve — the same-day race
  class r88 named, game behavior not sampler blindness.
  (3) Days-tail wobble (120 vs 122/124/123) read as bands, as
  before.
- V2/defense-last NOT re-measured (r85 answer stands, Steve-call
  pending); lately content is reported only as the naming-debate
  observation above.
- R1 NOT re-investigated (r85 verdict stands).
- Carried (unchanged): F1 favor 'no longer available' blank stays
  OPEN with the call-time wrap inherited; dead discoverer's
  orphaned fireside entry (r51, Steve's call); unfed marches
  proceed (r50, Steve's call); stare-down cost as a class
  (Steve's call); phoenix per-event cascade (Steve-call); armor
  causation (needs a control arm); telemetry mapping proposal
  defenderFights -> defendedFights; gating freeze (2026-10-27)
  untouched.
- NEW for the next run / for Steve: (1) defense-last in the lately
  line — still the open Steve-call from r85, unchanged; this panel
  adds two more naming-debate lately fires and zero defense
  content. (2) The transcript fix is proven and needs no further
  work. (3) The file-write EPERM flap is now a known run hazard:
  pilot JSONs must be parse-verified (the retry wrapper), and
  heartbeats must be read back from the registry, not trusted.
- HELD WORK (not this run's, flagged for the main session):
  journey2-crisis-r90 (stalled run's tree, 2 forked scripts now
  committed via this run — the tree itself is redundant but left
  untouched for main-session inspection), journey2-succession and
  journey2-succession-r86 (both still carry uncommitted changes,
  owner oversight-playtest-loop-2, LOUD-protected from the reaper).
  Per INSPECT HELD WORK these need a main-session inspection, not
  a loop-run touch.

## Closeout
[PENDING — commit hash, merge, rotation verification, lock deletion
to be filled after landing.]
