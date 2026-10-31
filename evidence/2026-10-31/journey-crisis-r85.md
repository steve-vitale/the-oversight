# Journey crisis r85 — defense is last in the lately line, and the bribery dig burned its pool twice per pick (lane B, leg 6)

Successor to crisis r82. Pilot-only run per §9-12 (3 fresh seeds; the
pilot answered the leg's questions, so no panel expansion — the r82
panel seeds were NOT re-run, since r82 proved three passes
byte-identical on them).

Pre-registration:
`hidden_files/evidence/2026-10-31/journey-crisis-r85-prereg.md`
Base: master 003a9c2f3 at registration.
Instrument: r82 driver/analyzer verbatim EXCEPT filenames r85, plus
a lately probe cloned from the r82-probe-d23 pattern (dumps
t2LatelyEvent at every defender morning). Diff r82 -> r85 verified
line by line; node --check clean on all new scripts. Probe replay
reproduced the panel trajectory exactly (9503: 41 defended, 9 raids,
9 alive, horizon), so probe readings are on-trajectory, not a fork.

## Run setup
- No Lane B lock present at run start — no stale-lock recovery
  needed. New lock written run 2026-10-31T09:56:18Z.
- Main-tree pre-flight: clean at first check, disk 21%, `git pull`
  already up to date, worktree-reap ran (LOUD dirty trees left
  untouched: journey2-succession held orphan, sibling sim arms).
- Registration was slow (~12 min, not a failure): the registry flock
  queue was backed up behind Lane A's journey-establishment
  register, sibling sim registers, and heartbeat loops; the lock
  passed holder to holder and this run's register completed
  normally. No ref surgery, no lock-breaking.
- Worktree slug deviation, documented: the body slug journey2-crisis
  could not be registered — the directory still holds orphan
  evidence from Oct 14-25 runs and branch journey2-crisis already
  exists (same class as r82's journey2-crisis-r81). This run used
  journey2-crisis-r85 (unique, still the lane-B journey2- prefix,
  never the lane-A journey- prefix). The orphan dir was left
  untouched.
- Heartbeat loop started and VERIFIED landed in the registry
  (10:13:53Z, then every 10 min) — never trusted blind.
- Canon: docs/CANON.md read in full before playing; repo AGENTS.md
  read (worktree copy verified byte-identical). Gating freeze
  (2026-10-27) untouched. Rotation-b read 6 at run start; this run
  plays 6 per the file and writes 7 on landing (verified by
  re-reading).

## Panel (policy oracleV2, 120d death-aware +10d tail, PILOT seeds
## 9501 / 9502 / 9503, sequential, all exit 0)
EVID: goal hidden_files/evidence/2026-10-31/r85-panel/.
Analyzer output: r85-panel-analysis.txt (same dir).
Probe JSONs: r85-panel/probe/ (seed 9503 defender mornings).

## C1 (bend, not break) — GO (vacuous on game-overs: there were none)
- All 3 seeds reach the 120d horizon: 9501 with 5 alive / 10,950
  kcal, 9502 with 9 alive / 54,704 kcal, 9503 with 9 alive /
  76,956 kcal. No game-over, no scatter — a warmer, stronger
  panel than r82's (2 game-overs), reported as divergence, not a
  difficulty verdict. No siege-mechanic failure anywhere (see C2).

## C2 (episodes fire + gates hold) — GO, with D1 vacuous
- Raids fire on all seeds: 8 / 11 / 9. Fought resolutions on all
  seeds (every resolution in the panel is fought(tick)).
- TRUE early 'fought' resolutions = 0 on all seeds
  (corpse-excluded); legacy count 1 (9502 d57) is the known r57/r58
  counting artifact, not a gate break. deltaBad empty, drift
  unknown = 0 (all 3 drifts classified player-drawn-off).
- D1 VACUOUS, disclosed: 0 sortie attempts panel-wide, so the
  "D1 snapshots all delayed >= 3" bar is 0/0 — true but empty.
  The C2 GO rests on raids + fought resolutions + TRUE early +
  deltaBad + drift, not on D1. See C2b for why sorties never fired.

## C2b (linger-conditional gorge/sortie) — MIXED, instrument finding
- 9501: no lingerer set forms — PASS on raids + resolutions alone
  (prereg C2b rule, same as r82's 9501-analog).
- 9502: White Noise lingers d13-17, gorges 3 nights, then drifts
  player-drawn-off. 9503: Spool + Buffering linger d92-93, gorge 2
  nights, then drift player-drawn-off (flagging — won't follow).
  Gorge nights fire (5 total); sorties 0.
- WHY no sortie: the driver's delayed rule fires only at a day
  boundary with >= 3 nights waited. 9502's boundaries sampled Game
  days 13, 13, 15, 17 (the C6 day-jump wobble): at the d15 boundary
  the set had waited 2 nights (too early); by the d17 boundary it
  had drifted. The sortie window was skipped by the day counter
  jumping 15 -> 17, not by any game refusal — a real player
  playing day-by-day would have had a day-16 decision point. So
  the sortie verdict for 9502/9503 is INSUFFICIENT-DATA (sampling
  gap), NOT a game failure: the gorge price was paid, the sets
  drifted off honestly, no unknown drift. Next run's instrument
  should sample lingerers per tick-part, not per boundary, before
  the sortie bar is judged again on this leg.

## C3 (people check) — GO
Read in full: all 24 driven transcripts. fabricHits 0 panel-wide.
- NPCs want concrete things: Jada's festering wound (clean it and
  wrap it tight), Quinn's unbreaking fever, James's empty stomach,
  Lillian's joint forage outing ("Meet me at the meadow edge, west
  of the creek and we'll fill packs before dark").
- Every asked favor that reached the requirements menu got the
  actionable version ("Move next to them, on the same side of the
  Haven door, to help" / "Move next to your partner...").
  The 'no longer available' line never fired in any transcript
  (see F1).
- Repeated asks escalate, then close — never loop: favor
  requirements climb "As I said —" / "Like I said —" / "Still the
  same thing —" / "I've told you three times now —" (the 6th pick
  repeating the top rung once before spend-out is the designed
  discipline in convo-dialogue.js, verified in code — not a loop);
  doubt chains escalate to "I've told you what I've told you";
  recaps escalate to "We're going in circles a bit" territory.
- Invitations are sometimes taken, in this leg too: Pearl "Okay.
  Yeah. I trust you." (d44); James "Fine. This had better be
  worth it." (d75); Quinn "Someone should watch your back. Might
  as well be me." (d57); declines: Tatsuya "Not right now. I've
  got my own things to handle." (d19, twice).
- Grief reads as people, again: Tatsuya on Deirdre and Elena
  ("Deirdre is gone and Elena is gone. The fire doesn't care.");
  Quinn on Hank ("Hank always took the burnt piece. Said someone
  had to. I take it now."); James on Brian ("Brian is gone and
  the world just... continues."); Jada on Adriana, taken at the
  Scattering ("my sister, boring... pods, rows deep, humming");
  Tatsuya on Kholoud, taken at the Scattering ("Stupid, small,
  beautiful plans").
- NEW QUALIFICATION (see V2): defenders DO talk about the fight
  when asked directly — Giuseppe d13, asked "The defense — how did
  it go out there?", answers "I stood down Sunback at the treeline
  — it ran. Don't call it brave. Call it awake." The morning-after
  gap is specific to the ask:lately route, not to defender voice
  in general.

## V2 (defense wins the lately slot when grief is free) — ANSWERED: NO,
## and grief is not the whole story
- Driven defender convos: latelyOffered false on all 16 — the
  lately menu never surfaces there (reactive beats preempt the
  subject menu, same mechanism as r82's steered convos).
- Probe (seed 9503, trajectory reproduced exactly): at every
  defender morning, ask:lately IS among topic2Asks and the defender
  DOES carry a sticky 'defended' memory — but t2LatelyEvent picks
  something else every time:
  - d9 Deirdre (fights d8; deaths d5/d7 days before): kind NAMING
    (nevermore monster-naming debate). Memory present: "I stood
    down The Mountain Lord at the treeline — it ran" (sticky).
  - d19 Tatsuya (fight d18; last death d7, 12 days before): kind
    MOURNING (Elena).
  - d50 Tatsuya (fight d42; last death 43 days before): kind SHOW
    (Hardened The Vigil Taking — the same event Pearl's d51 lately
    line reports: "They took you — Hardened The Vigil, on the
    screens").
  - d58 Tatsuya (fight d57; bearer-Jorge mourning live): kind
    MOURNING (Jorge, bearer=true).
- So r82's "grief outranks defense" generalizes: defense is LAST
  in the lately line, behind naming and show events as well as
  grief/mantle — even 43 days after the last death, a show event
  takes the slot. TWO stacked gaps, both now precise: (1) the
  defender-convo menu never reaches lately (reactive preemption),
  (2) even if it did, the slot's content would be naming /
  mourning / show, never defense. Whether defense-last is the
  intended order is a design call for Steve (same class as r82's
  grief call, now widened). No game change is made here.
- The panel's only fired ask:lately (9503 d51, sheltered Pearl)
  confirms the slot works when free: it reports the show event,
  not a fight — consistent with the probe.

## F1 (favor call-time cause) — blank stays OPEN, instrument proven
- The call-time wrap installed cleanly (wrapMissing false on all
  seeds) and logged 0 entries panel-wide: convoFavorAction never
  returned 'They are no longer available to receive help.' in any
  engine menu call or post-convo probe call across 24 driven
  convos. Per the prereg, zero occurrences keeps the blank OPEN
  (same as r71/r82) — the wrap is inherited by the next run.

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r82: also 0). The phoenix per-event
  respawn cascade did not recur. The Steve-call stands unchanged.

## C6 (days-tail) — wobble persists, now with a consequence
- Loop-iteration days vs max Game say-day at end: 9501 120 vs 121,
  9502 120 vs 123, 9503 120 vs 121. Same instrument-wobble class as
  r70/r71/r82 — but r85 shows it biting: the 9502 lingerer
  boundaries sampled days 13, 13, 15, 17, skipping the day-16
  sortie decision point (see C2b). Judge bands, not counters, and
  fix the sampling before re-judging sorties.

## R1 (recap subject naming) — CLOSED AS VERDICT, no fix
- Code-read (conversation.js convoTopicLabel + convoRecapLine):
  the vague subjects are deliberate labels, not missing data:
  'secret' -> 'their secret' (naming the content would LEAK the
  secret the NPC hasn't told you); 'recall' -> 'that personal
  stuff' (a neutral placeholder for a personal memory); the
  'want' fallback -> 'what was on their mind' (fires only when the
  want def carries no topicLabel — a data gap, but renaming it
  needs a content decision per want, not a code fix). The recap
  line is spoken by the NPC and must stay neutral-voice; 'Still on
  their secret' is honest precisely because the content is
  withheld. No code change: the thinness is by design except for
  the want-fallback, which is documented here for a future content
  pass, not a mid-run fix.

## BLANK FILLED: bribery-investigate double-consume + cold loop
## (src/js fix + proof test, [needs-eyes] NOT set — tooling-adjacent
## dialogue fix, no feel change for Steve's phone pass)
- Transcript-caught in this panel (9503 d9/d10, Deirdre): the
  investigate pick burned the 8-line dig pool twice as fast as
  designed, and past the pool it parroted the cold line verbatim
  with the choice still offered (6 picks: pool line, then cold x4).
- Root cause (betrayal.js `investigate` act): investigateBribery
  speaks a miss line (pool advance #1, narration) and the handler
  then called bribeDigMissLine AGAIN for the beat (advance #2) —
  so beats showed pool[1], pool[3], pool[5], pool[7], cold, cold...
  A second, deeper finding while fixing: convoSpendChoice was a
  NO-OP for betrayal: ids — buildMenu's spent filter never applied
  to betrayal extras (the wrap prepends them unfiltered), so no
  betrayal verb could ever spend out.
- Fix (src/js/betrayal.js, 4 small edits):
  1. bribeDigMissLine stashes the spoken line (lastDigMissLine)
     and a digCold flag on the case.
  2. investigateBribery gains a quiet option for the miss narration
     (dossier path unchanged — it still narrates).
  3. The `investigate` act calls it quiet, reuses the spoken line
     for the beat (one advance per pick), and spends the choice
     once cold.
  4. betrayalChoices filters the per-sitting spent ledger (in-place
     splice — the first attempt reassigned a const inside try/catch
     and silently no-op'd; caught by the proof test, fixed).
- Proof test scripts/test-journey-crisis-r85-investigate-cold.js:
  RED before (beats pool[1]/[3]/[5], digMisses 6 after 3 picks,
  cold re-offered), GREEN after (beats pool[0]/[1]/[2] in order,
  digMisses 3, cold spoken once then the choice leaves the
  betrayal menu for the sitting; a later sitting re-arms, so a
  future dig can still find a bribe). The 4 pre-existing failures
  in old betrayal tests (test-betrayal*.js, test-detective-*) are
  the `Text is not defined` harness rot at roster generation —
  verified identical on HEAD betrayal.js, untouched by this fix.
  Neighbor tests GREEN: betrayal-diegetic 3/3, presscrack-repeat,
  wounds-repeat.
- What the fix does NOT do (plain words): it does not change what
  digging finds, what bribes cost, or who can be investigated. It
  only makes each click tell one new line instead of skipping one,
  and makes the dead-end choice go away for the rest of that
  conversation instead of repeating itself.

## Village assessment (plain words)
- 9501: the thin survivor — fought 8 raids, ended with 5 people
  and 10,950 kcal. Jada's wound never got cleaned in-convo (the
  favor stayed 'asked' with the honest proximity line), James
  went hungry and asked for food, and the village held the door
  every time but never had anyone to spare.
- 9502: the fed village — fought 11 raids, ended with 9 people
  and 54,704 kcal. Giuseppe's "Don't call it brave. Call it
  awake" is the panel's best line; Lillian's forage outing and
  Quinn's fever are the human middle; the White Noise lingerer
  ate 3 nights of stores and drifted off on its own.
- 9503: the remembering village — fought 9 raids, ended with 9
  people and 76,956 kcal. Tatsuya fought at the door four times
  (d8/d18/d42/d57) and carries every one as a sticky memory, but
  never got to tell any of them through lately — the slot gave
  him naming, mourning, and the Vigil show instead. Deirdre's
  bribery investigation ran the pool dry and hit the cold line
  that this run fixed.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, fought resolutions,
  defender conversations, favors with actionable answers, and
  the bribery investigation all fire on current master. Sorties
  did NOT fire this run, but that is a sampling gap (C2b), not a
  reachability verdict — r82 proved sorties fire and clear.
- FUN: yes — favors with concrete wants, grief that names names,
  invitations sometimes taken, a monster-naming debate, a
  defender who says "Don't call it brave. Call it awake." The
  audible gaps are now precise: nobody who fought yesterday
  talks about it through lately (defense is last in line), and
  the investigate dead-end used to parrot (fixed this run).
- WINNABLE: the leg itself is not a win path; 3 of 3 villages
  survive it this run (vs 1 of 3 in r82) — divergence, not a
  difficulty verdict. No win verdict is drawn from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63/r66/r69/r70/r71/r82 on all 3 seeds —
defenderFights 95 -> 0, defendedCount 21 -> 0. EXPLAINED, not a
bug: the baseline's field names describe an older instrument;
current records carry defendedFights (27 / 42 / 41 across the
panel), not defenderFights. No NEW loud line. Baseline NOT
rolled.

## Test-suite call
src/js change (betrayal.js only) + 4 new scripts (r85 driver,
analyzer, lately probe, investigate-cold proof test); zero other
src/js diff. Verification: node --check on all scripts, proof test
RED-before / GREEN-after, 3-seed driver runs (all exit 0), probe
replay trajectory-identical, analyzer, 24 transcripts read in
full, betrayal-neighbor tests green, pre-existing Text-rot
failures verified identical on HEAD. check-quick: 284 passed, 6
failed in 802s (log: goal hidden_files/evidence/2026-10-31/
r85-checkquick.log) — EXACTLY the r82 standing baseline (284/6):
measurement x2 (proof-update, workflow), mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20-fixes (1
racks-full voice assertion). The phone-frame sub-failures match
r82's log line for line (including betrayal.js already in the
stale-input list before this run's change). No NEW failure vs r82.
The measurement-only-plus-one-dialogue-fix landing proceeds with
the failures reported, not hidden.

## Metric review (§14)
- C1/C2/C2b/C3/F1/C4 judged as pre-registered. No metric was
  re-scored mid-run. C2's D1 component is reported as vacuous
  (0/0) rather than folded into a pass; C2b's sortie verdict is
  INSUFFICIENT-DATA (sampling gap), not a game NO-GO.
- V2 judged as a judgment with probe JSONs and quotes, not a
  count — as pre-registered. The probe extension (every defender
  morning, not one day) is a mechanism widening written into the
  probe script, not a bar change: the bar was always "what kind
  wins the slot when grief is free," and the probe answers it at
  four mornings instead of one.
- R1 judged as an investigation with a code-read verdict, not a
  fix — as pre-registered (fix only if small + proof-tested +
  knowledge-gating-safe; the want-fallback gap failed the
  "small" test, the secret label failed the "safe" test).
- The investigate fix changed no bar and no panel trajectory (the
  panel ran pre-fix; the fix's before/after is the proof test,
  not a panel re-run — a post-fix panel re-run would change
  betrayal-investigate lines only, by design).
- Carried (unchanged): dead discoverer's orphaned fireside entry
  (r51, Steve's call); unfed marches proceed (r50, Steve's
  call); stare-down cost as a class (Steve's call); phoenix
  per-event cascade (Steve-call); armor causation (needs a
  control arm); telemetry mapping proposal defenderFights ->
  defendedFights; gating freeze (2026-10-27) untouched.
- NEW for the next run / for Steve: (1) defense-last in the
  lately line — is that the intended order, given defenders
  carry sticky memories and a direct defense question works?
  (2) sortie sampling must move from day boundaries to tick
  parts before the sortie bar is judged again (C2b). (3) The
  favor 'no longer available' blank stays open with the call-time
  wrap inherited. (4) betrayalChoices now honors the spent
  ledger — any future betrayal verb can spend out per sitting
  with one convoSpendChoice call.
