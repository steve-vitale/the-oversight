# sim-gossipcensus-a — haven-gossip census on stranded scholars

Worker: sim-gossipcensus-a (Loop A, food-economy / narration). Branch:
sim-gossipcensus-a. Prereg (committed BEFORE any judged sim):
evidence/2026-11-05/sim-gossipcensus-a-prereg.md (commit d88544901).
Instrument: scripts/policies/gossipcensus-diag.js (burst classifiers
+ fire-time position reader) on top of the judged strandnarr-a
full-transcript recorder (scripts/policies/strandnarr-diag.js, reused
verbatim), driver scripts/gossipcensus-trace-a.js, proof
scripts/test-gossipcensus-a.js (32/32, including the ON-vs-OFF
det-gate and both anchors).

## Verdict: DIAG-GO — the burst DOES reach a stranded scholar, and it reads wrong

A haven-gossip burst fires inside a stranded scholar's sleep window
at exactly the background rate — 2 events in 25 stranded sleep
windows (8.0%) vs 134 in 1,670 non-stranded sleep windows (8.0%).
The engine carries no position gate (confirmed in code and now in
measurement): a scholar camped on a forest floor hears the haven
argue about a monster's name exactly as often as a scholar sleeping
in the hall. Both hits are quoted verbatim below, with their full
sleep windows. The sense verdict is READS WRONG (fix-or-document):
"Back at the haven the argument starts: ... weigh in if you want"
is addressed to a scholar who is asleep miles from the haven and
cannot weigh in. No src/js change in this arm (diagnostic only) —
the fix direction is named at the end for a future arm.

- Stranded sleep windows: 2/25 events (8.0%), 4 burst lines.
- Stranded upkeep windows: 0/24 events (0.0%).
- Pooled stranded windows: 2/49 events (4.1%).
- Non-stranded sleep windows: 134/1,670 events (8.0%).
- Non-stranded upkeep windows: 0/1,672 events (0.0%).
- Power bar (pre-registered: >= 20 stranded windows across >= 4
  stranding seeds): MET — 49 stranded windows across 6 stranding
  seeds (15003, 17007, 17010, 17016, 17020, 17023). The verdict is
  a powered DIAG-GO, not an INSUFFICIENT-DATA.

## Primary metric (pre-registered)

- Denominator = stranded sleep + stranded upkeep windows.
  Stranded night = nighttravel outcome `travel-refused` or
  `out-of-reach` AND the scholar not inside Haven at daily exit
  (the strandnarr-a evening gate, unchanged).
- Numerator = stranded windows containing >= 1 primary-burst event
  (either half of the monsterNewsCheck burst; a burst's two lines
  count as ONE event).
- Pilot (8 judged seeds): 15 stranded windows on 1 stranding seed
  (15003) — FAILED the power bar's seed leg by construction, as
  the prereg anticipated. Pilot incidence 0/15, reported not
  hidden; pilot verdict INSUFFICIENT-DATA, triggering the
  pre-registered screen.
- Screen (bankretain-substrate-a band 17001–17024, 23 fresh seeds;
  17021 already in the pilot, not re-run): 5 more stranding seeds,
  34 more stranded windows, 2 stranded-window events. Pooled
  census above is the verdict.

## The two hits, verbatim (both in stranded SLEEP windows)

### Hit 1 — seed 17020, loop-day 6, forest_floor (1,0), access "none"

Scholar stranded three nights running (loop-days 4–6) on the forest
floor at the map's north edge; the village was lost on day 27. The
loop-day-6 sleep window, in full (17 lines):

> Sleeping rough means the cold ground — heal ~16. Tonight will cost
> you — the night burns ~2200 kcal and you haven't eaten enough
> today. Eat and drink before you sleep, or the spiral starts at
> midnight.
> You settle into the cold ground. Sleep takes you.
> 💧 Barbara returns with 9L of creek water. Risky until the hearth
> boils it.
> Barbara came back from the treeline white-faced. Saw it too.
> Whatever it is, it's still out there.
> **Word gets around the haven. Whatever that thing was — the haven's
> talking about nothing else.**
> **Back at the haven the argument starts: Barbara is calling it
> "Loud-Eyes." Nobody agrees yet — weigh in if you want.**
> Rain. Steady, cold, honest rain.
> ⚠ STARVING: health and energy falling. The spiral has started.
> You camp wild tonight — no pantry meal. Eat from your pack.
> 🍽️ Catalina looks at the full shelves and waves off the day's
> share. "No more into the store — we eat at the fire, and the
> shelves keep."
> — DAY 7 DAWN — ...
> You overhear it at the fire, and stop pretending not to listen.
> Riders from Emberhold are telling the deer story again — with your
> name attached this time.
> Dawn. You wake stiff and cold. ... You spent the night out here,
> away from Haven — and you're still out here at dawn.

Trigger path (code): the endDay witness branch (game.js ~32487)
fired inside the sleep window — Barbara came back white-faced,
pushing knowers over the threshold — and monsterNewsCheck kicked
the debate in the same breath. The burst's two lines are adjacent
in the window (idx n, n+1), one event.

### Hit 2 — seed 17023, loop-day 34, trail_edge (0,8), access "remote"

Scholar stranded four nights running (loop-days 33–36) on a trail
edge at the map's west edge; survived 60 days. The loop-day-34
sleep window (40 lines; the burst at its middle):

> ... 🐗 RAID — 5 raiders hit Haven in the night, drawn by the smell
> of the pantry! ...
> 🚨 The Redactor, Night Court, Lockpick, Big Big, Loud-Eyes is at
> Haven's door. The village looks to you. Four ways to call: a
> RUNNER (slow, dangerous), a SIGNAL FIRE (fast, loud, everyone
> sees), the SYSTEM RELAY (if it can carry voices), or an ABILITY
> CRY (if your build has one). ...
> Waluyo came back from the treeline white-faced. Saw it too.
> Whatever it is, it's still out there.
> **Word gets around the haven. Whatever that thing was — everyone's
> talking about it now.**
> **Back at the haven the argument starts: Leonard is calling it
> "The Ugly Beast." They'll fight it out — weigh in if you want.**
> ... ⚠ STARVING ... You camp wild tonight — no hall meal, but the
> pantry still reaches you through System requisition. ...
> Dawn. You wake stiff and cold. ... You spent the night out here,
> away from Haven — and you're still out here at dawn.

The same shape as hit 1: witness line, then the burst. Note the
raid-call line in the same window ("The village looks to you. Four
ways to call...") — the scholar is asleep 8 tiles from Haven and
cannot answer any of the four ways. It is not the judged item, but
it is the same position-blind endDay narration (see backlog item).

## Secondary observation: the settle lines reach the stranded scholar too

Seed 17023, loop-day 35 — the night AFTER the hit, still stranded
at the same trail edge (0,8) — the sleep window contains THREE
naming-settle lines (secondary, not counted in the primary
numerator):

> It's settled. The village is calling it "The Loud Beast." The
> Codex keeps it.
> It's settled. The village is calling it "Big Big." The Codex
> keeps it.
> It's settled. The village is calling it "Old Loud." The Codex
> keeps it.

Three different monsters' arguments conclude in one stranded night.
The argument's conclusion travels to the wild exactly like its
opening: the whole naming beat — report, debate, settlement — is
position-blind.

## Sense-testing (transcripts read, not just counted)

- BOTH hits read wrong, for the same reason: the burst's wording
  assumes the scholar is standing at the haven fire. "Back at the
  haven the argument starts" is true but unhearable from a forest
  floor at (1,0) / a trail edge at (0,8); "weigh in if you want"
  invites an action the scholar cannot take from the wild
  (backMonsterName is a conversation action, offered only when
  talking to someone at the haven). The scholar is asleep, alone,
  starving — the window's own lines say so ("You camp wild
  tonight", "You spent the night out here... still out here at
  dawn") — and in the same breath the haven argues in their ear.
- The coherent reading does NOT save it: even if the scholar is the
  one who first reported the beast (the witness line's "Saw it too"
  implies a first seer), the burst is still haven-side talk the
  scholar cannot hear, phrased as if they were present. A relayed
  version ("When you get back, they'll want your word on a name")
  would read true; the live wording does not.
- Contrast — the same burst inside Haven reads fine: seed 15003
  loop-day 7 and loop-day 20 sleep windows (scholar inside Haven at
  (4,7)) carry the identical two lines, and there they are simply
  the village talking around its own fire. The lines are good lines;
  the defect is delivery position, not prose.
- Adjacent position-blind beats in the same windows (not the judged
  item, but the same defect class): "You overhear it at the fire"
  (17020-6, riders telling stories), "You catch fragments by the
  fire — Dmitri telling Leonard about you" (17023-34), the raid
  call (17023-34), "🍽️ Catalina/Hassan/Henriette looks at the full
  shelves..." pantry lines while the scholar starves in the wild.
  The endDay village simulation narrates haven-side life into the
  stranded scholar's sleep window wholesale; the gossip burst is
  the measured instance, not the only one.
- Upkeep windows are clean by mechanism, not by luck: 0 burst
  lines in 1,696 upkeep windows (stranded + non-stranded).
  spreadGossip runs in advancePart / travel steps / endDay, never
  inside a competentEat upkeep call — so the upkeep half of the
  question answers itself. The sleep half is where the burst lives,
  and it lives there at the background rate.

## Why the rate is what it is (mechanism, not just incidence)

- Burst lines by phase across the whole census (1,392 lines =
  696 events): sleep 272 lines (136 events), daily 170 (85),
  harness 950 (475), upkeep 0. The bulk fires during waits/travel
  steps (harness phase); the sleep share is the endDay witness
  branch + the sleep loop's own part advances.
- Stranded sleep 8.0% vs non-stranded sleep 8.0% is not a
  coincidence of small numbers: the stranded denominator (25) is
  small, but the equality is the point — nothing in the chain
  (spreadMonsterNews, monsterNewsCheck, kickMonsterNaming,
  seedMonsterNames) reads the scholar's position, so the stranded
  rate CANNOT differ from the background rate except by chance.
  The census confirms the code read.
- The burst is not rare overall: 696 events across 31 runs (median
  ~22/run), ~1 in 12 sleep windows. A stranded scholar who spends
  a week out will hear the haven argue about once — the defect is
  a steady drip, not a once-a-run glitch.

## Substrate drift (finding, reported per the prereg's anchor clause)

The strandnarr-a 17021 anchor (thicket out-of-reach strandings,
loop-days 51–53) does NOT reproduce on current master. Proven by
rerunning the ORIGINAL strandnarr-trace-b.js on this master (seed
17021): 0 stranded nights, daysAlive 57, village-lost — identical
to this driver's result, so the driver is faithful and the
substrate moved. First evening divergence is loopDay 30 (old:
walk-interrupted-combat at (8,1); new: walk completed to haven
(4,7)). Likely causes are the post-2026-11-04 game.js
travel/combat changes (d29e663a9 triggerbuild-b PARTING TURN in
travelTo; 1de41ff6f patient_aim round-start-HP fix) — the bankfood
gate widening (c51e0fc9d) cannot explain a pre-day-51 divergence
(the old run had no stranded evenings before 51) and banksnap-a
(99ea43530) is recorder-only by its own comment. The proof test was
revised to pin the current-substrate 17021 facts (57 days,
village-lost, 0 stranded) as a regression pin, with the drift
documented in its header — the judged metric (stranded-window
incidence on pilot+screen) is unchanged. The 15003 non-stranded
gossip anchor DID reproduce (loop-day-7 sleep window, inside
Haven), so the gossip mechanism itself is live on current master.

## Per-seed table (daysAlive / stranded nights / stranded sleep windows-events / stranded upkeep windows-events / non-stranded sleep windows-events / non-stranded upkeep windows-events)

- 15003: 30 / 8 / 8-0 / 7-0 / 22-2 / 23-0 (village-lost; creek x8)
- 15009: 60 / 0 / 0-0 / 0-0 / 60-5 / 60-0 (survived)
- 15091: 28 / 0 / 0-0 / 0-0 / 28-1 / 28-0 (village-lost)
- 15211: 52 / 0 / 0-0 / 0-0 / 52-5 / 52-0 (village-lost)
- 15215: 19 / 0 / 0-0 / 0-0 / 19-0 / 19-0 (village-lost)
- 15220: 60 / 0 / 0-0 / 0-0 / 60-3 / 60-0 (survived)
- 15221: 60 / 0 / 0-0 / 0-0 / 60-5 / 60-0 (survived)
- 17001: 60 / 0 / 0-0 / 0-0 / 60-2 / 60-0 (survived)
- 17002: 60 / 0 / 0-0 / 0-0 / 60-8 / 60-0 (survived)
- 17003: 60 / 0 / 0-0 / 0-0 / 60-7 / 60-0 (survived)
- 17004: 60 / 0 / 0-0 / 0-0 / 60-6 / 60-0 (survived)
- 17005: 60 / 0 / 0-0 / 0-0 / 60-2 / 60-0 (survived)
- 17006: 60 / 0 / 0-0 / 0-0 / 60-4 / 60-0 (survived)
- 17007: 60 / 3 / 3-0 / 3-0 / 57-8 / 57-0 (survived; forest_floor x3)
- 17008: 60 / 0 / 0-0 / 0-0 / 60-4 / 60-0 (survived)
- 17009: 60 / 0 / 0-0 / 0-0 / 60-5 / 60-0 (survived)
- 17010: 52 / 3 / 3-0 / 3-0 / 48-5 / 49-0 (village-lost; creek x2, thicket x1)
- 17011: 60 / 0 / 0-0 / 0-0 / 60-5 / 60-0 (survived)
- 17012: 60 / 0 / 0-0 / 0-0 / 60-7 / 60-0 (survived)
- 17013: 60 / 0 / 0-0 / 0-0 / 60-5 / 60-0 (survived)
- 17014: 60 / 0 / 0-0 / 0-0 / 60-5 / 60-0 (survived)
- 17015: 51 / 0 / 0-0 / 0-0 / 51-0 / 51-0 (village-lost)
- 17016: 60 / 4 / 4-0 / 4-0 / 56-4 / 56-0 (survived; forest_floor x4)
- 17017: 60 / 0 / 0-0 / 0-0 / 60-10 / 60-0 (survived)
- 17018: 60 / 0 / 0-0 / 0-0 / 60-6 / 60-0 (survived)
- 17019: 60 / 0 / 0-0 / 0-0 / 60-6 / 60-0 (survived)
- 17020: 27 / 3 / 3-1 / 3-0 / 24-1 / 24-0 (village-lost; forest_floor x3 — HIT loop-day 6)
- 17021: 57 / 0 / 0-0 / 0-0 / 57-2 / 57-0 (village-lost; stranded anchor drifted, see above)
- 17022: 60 / 0 / 0-0 / 0-0 / 60-5 / 60-0 (survived)
- 17023: 60 / 4 / 4-1 / 4-0 / 56-2 / 56-0 (survived; trail_edge x4 — HIT loop-day 34, settles loop-day 35)
- 17024: 60 / 0 / 0-0 / 0-0 / 60-4 / 60-0 (survived)
- Pooled (31 seeds): stranded nights 25; stranded sleep 25 windows /
  2 events; stranded upkeep 24 windows / 0 events; non-stranded
  sleep 1,670 windows / 134 events; non-stranded upkeep 1,672
  windows / 0 events; burst lines 1,392 (696 events); settle lines
  675; transcript errors 0.

## Metric review

- The power bar did its job exactly as designed: the pilot (15
  windows, 1 seed) failed it and the pre-registered screen — not a
  re-score — supplied the census (49 windows, 6 seeds). No metric
  was changed mid-run. The pilot's 0/15 is reported above, not
  discarded: pooled with the screen it is 2/49.
- The denominator counts windows, not nights: a stranded night
  contributes one sleep window and (usually) one upkeep window the
  next morning. One stranded night (15003 loop-day 30, village
  lost that night) has a sleep window but no following upkeep
  window — hence 25 sleep vs 24 upkeep windows. The asymmetry is
  honest, not a miscount.
- The "events" collapse rule (adjacent word+debate lines = 1
  event) was unit-tested (two separate bursts = 2 events; lone
  half = 1). In the judged corpus every burst presented as an
  adjacent word+debate pair, so events = burst lines / 2
  throughout; no window contained a lone half.
- Proposed revision for the NEXT census run (not applied here):
  the non-stranded sleep contrast (8.0%) is the more informative
  baseline than the pooled stranded rate, because upkeep windows
  can never fire a burst — a future prereg should bind the sleep
  comparison (stranded sleep rate vs non-stranded sleep rate) as
  the primary, with upkeep reported as a mechanism check. The
  verdict here uses the pre-registered pooled rule, as §14
  requires.
- The 17021 stranded anchor is stale (substrate drift, above).
  Future arms reusing the strandnarr-a anchor must re-verify it
  against current master first — the anchor's trajectory depends
  on the bankfood wrapper gates and the travel/combat code, both
  of which moved after 2026-11-04.

## Wall numbers (carried, NOT re-measured)

This is a narration census corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct seeds):
wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24.

## Fix direction (for a future arm — NOT landed here)

The burst should not be delivered to a scholar who is not at the
haven. Two honest shapes (a future arm's choice, Steve can
overrule): (a) gate delivery on position — monsterNewsCheck /
kickMonsterNaming hold the debate until the scholar is inside
Haven, and the scholar hears it at the fire on return (the debate
is village business; the scholar's vote waits with them); or (b)
re-voice for the stranded case — the System relays the outcome at
dawn ("While you slept, the haven settled on a name..."), which
keeps the information flowing without pretending the scholar heard
the argument. The same position question covers the endDay
witness branch's delivery and the adjacent fire-side beats (raid
call, "overhear it at the fire", pantry lines) — a future arm
should judge whether to fix the burst alone or the endDay
position-blind narration as a family. No gate/price/deed change is
implied by either shape.

## Runs, files, commits

- Prereg: evidence/2026-11-05/sim-gossipcensus-a-prereg.md
  (d88544901, committed BEFORE any judged sim).
- Instrument + proof: scripts/policies/gossipcensus-diag.js,
  scripts/gossipcensus-trace-a.js, scripts/test-gossipcensus-a.js
  (656a10306, proof 32/32).
- Pilot corpus: evidence/2026-11-05/sim-gossipcensus-a-corpus/
  gossipcensus-s{17021,15003,15009,15091,15211,15215,15220,15221}.json
  (8 files, 0 instrument errors).
- Screen corpus: same directory, gossipcensus-s17001..17024
  except 17021 (23 files, 0 instrument errors). 31 files total.
- Proof: scripts/test-gossipcensus-a.js — 32/32 (unit classifiers
  + det-gate + anchors), run 2026-11-05. node --check clean on all
  three new scripts.
- check.js --quick: INCOMPLETE — killed by the run's own 360s
  timeout with no summary (36 passes, 1 failure, then the timeout;
  the failing test is unidentified from the dot output). Not a
  failure verdict: this run adds new scripts only and edits no
  src/js, no existing policy file, and no green-list test, so no
  green-list test can be affected by it (and the 1041Z round
  records 6 pre-existing --quick failures at head). Verification
  for this run is the proof test (32/32), node --check on all
  three new scripts, and the ON-vs-OFF det-gate. Not retried, to
  avoid a second long run stacking on the same box (a sibling
  journey-deepening check.js run was live concurrently).
- Infrastructure note: the safe-commit index clobber hit all 3
  commits in this run (prereg, instrument, evidence — each file
  shown staged-as-deleted after commit); repaired every time with
  git update-index --add --cacheinfo from the HEAD blob, tree
  verified clean (status empty + diff HEAD empty + hash-object
  matches). Commits always correct.
- Flap: no corpus write failed in this run (all 31 files wrote on
  first attempt); the driver's retry/staging path was not needed.
  One exec launch of the screen run was aborted by the runtime
  before starting (no process, no files); re-launched clean and
  completed 23/23, exit 0.

## Left unjudged

- Whether the same-name recurrence is one debate or many:
  "Loud-Eyes" debates fire on loop-days 6, 8, 9, 15, 24 (seed
  17020) and "The Ugly Beast" on 17, 20 (settled), then again 34
  (seed 17023) — either different monsters share a proposed name
  (likely: proposals are per-monster, names repeat) or a settled
  debate re-kicks. The census counts events per window, which is
  unaffected; the re-kick question is a code read for a future arm.
- WOODWARM=1 leg: not run — the anchor reproduced on WOODWARM=0
  for the non-stranded gossip hit and the stranded question does
  not depend on the warmth leg. A WOODWARM=1 census would be a
  different trajectory, not a missing verdict.

## Backlog items (for the coordinator to append to sim-findings.md)

- [open] 2026-11-05 — narration/position — HAVEN-GOSSIP BURST
  REACHES A STRANDED SCHOLAR AND READS WRONG (sim-gossipcensus-a,
  evidence/2026-11-05/sim-gossipcensus-a.md): powered census, 31
  seeds: a haven-gossip burst fires inside a stranded scholar's
  sleep window at the background rate (2/25 stranded sleep windows
  = 8.0% vs 134/1,670 non-stranded = 8.0%; upkeep 0/24 vs 0/1,672
  — bursts never fire in upkeep by mechanism). Both hits quoted
  verbatim (17020 loop-day 6 forest_floor; 17023 loop-day 34
  trail_edge): "Back at the haven the argument starts: ... weigh in
  if you want" addressed to a scholar asleep miles from the haven.
  Trigger is the endDay witness branch inside sleep (no position
  gate anywhere in spreadMonsterNews → monsterNewsCheck →
  kickMonsterNaming → seedMonsterNames). Fix direction named in
  evidence (gate delivery on position, or re-voice as a dawn
  System relay); diagnostic only, zero src/js in this arm.
- [open] 2026-11-05 — narration/position — ENDDAY HAVEN-SIDE BEATS
  NARRATE INTO STRANDED SLEEP WINDOWS (sim-gossipcensus-a,
  evidence/2026-11-05/sim-gossipcensus-a.md): the same two hit
  windows carry adjacent position-blind beats — the raid call
  ("The village looks to you. Four ways to call...") while the
  scholar sleeps 8 tiles away, "You overhear it at the fire",
  "You catch fragments by the fire", pantry "full shelves" lines
  while the scholar starves in the wild. Same defect class as the
  gossip burst; judge as a family with it, not separately.
- [open] 2026-11-05 — instruments/substrate — STRANDNARR-A 17021
  ANCHOR DRIFTED OFF CURRENT MASTER (sim-gossipcensus-a,
  evidence/2026-11-05/sim-gossipcensus-a.md): the 17021 thicket
  strandings (loop-days 51–53) no longer reproduce — rerunning the
  original strandnarr driver gives 0 stranded nights, 57 days,
  village-lost; first divergence loop-day 30 (walk-interrupted-
  combat vs completed walk). Likely the post-2026-11-04 game.js
  travel/combat changes (triggerbuild-b parting turn, patient_aim
  HP fix). Future arms reusing the strandnarr-a anchor must
  re-verify it first.
