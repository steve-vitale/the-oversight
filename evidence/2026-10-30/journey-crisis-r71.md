# Journey crisis r71 — DEFENDER branch fixed, defender voice still unproven, favor blank unreproduced (lane B, leg 6)

Successor to crisis r70 (current-master re-baseline, 9408 flip,
phoenix cascade re-framed). This run takes up r70's two held blanks
in the driver/analyzer only — no src/js change.
Pre-registration:
`hidden_files/evidence/2026-10-30/journey-crisis-r71-prereg.md`
(adopted as written by the aborted 09:06Z pre-flight attempt; this
run is its execution, not a rewrite).
Base: master 8aed42529 at run start (r70 base 2bfa0c426 plus arms
landed since). Instrument diff r70 -> r71 verified line by line:
names only, PLUS (a) DEFENDER trigger on the defendedFight day,
(b) favor-availability probe in driveConvo, (c) convosDriven
records the speaker vid for D1 verification. node --check clean
on both scripts.

## Run setup (done first, per the body)
- No Lane B lock present at run start — no stale-lock recovery
  needed. New lock written run 2026-10-30T09:55:35Z.
- Main-tree pre-flight: clean at first check (no sibling wait
  needed). Disk 20%, `git pull` already up to date, worktree-reap
  ran clean (active 6/16).
- Worktree journey2-crisis (body slug), registered ~10:02Z
  (register took ~2 min against registry flock; heartbeat
  verified in registry 10:02:06Z, then 10:03:43Z via the logged
  10-minute loop: goal
  hidden_files/journey2-crisis-heartbeat-r71.log).
- Canon: docs/CANON.md read in full before playing. Gating freeze
  (2026-10-27) untouched. Rotation-b read 6 at run start
  (r69 and r70 both recorded advancing 6 -> 7; the file still
  read 6 — same bookkeeping anomaly the r71 prereg records;
  this run plays 6 per the file and writes 7 on landing).

## Instrument correction worth recording (driver-day vs game-day)
The r71 prereg says "trigger the defender convo on the
RESOLUTION day, i.e. when a defendedFight was recorded that
day". The panel data shows defendedFights carry the RAID day
(r70 seed 9407: raid days 14/24/33... = defended days
14/24/33...), and the day-boundary convo block runs the
morning AFTER a raid day — so a same-day check can never
fire there, for the same structural reason the old raid-day
check never fired. The implemented fix matches fights from
boundary-day-minus-1: the first convo opportunity after the
resolution. That is the resolution-day convo in effect, and
the speaker MUST be a recorded defender of that fight day —
no fallback roster member (a fallback would fake the D1 bar).

## Panel (policy oracleV2, 120d death-aware +10d tail, seeds
## 9407 / 9408 / 9411, sequential, all exit 0)
EVID: goal hidden_files/evidence/2026-10-30/r71-panel/.
Analyzer output: r71-panel-analysis.txt (same file naming as
r70's panel analysis, in the panel dir).

## C1 (bend, not break) — GO by the prereg letter, with a
## chaos warning attached
- 9407: horizon, 7 alive, 0 kcal (r70: horizon, 7 alive,
  36,452 kcal). Same survivor count, empty pantry.
- 9408: horizon, 9 alive, 154,617 kcal (r70: game-over
  ~d103, 0 alive, 0 kcal). FLIP in the other direction.
- 9411: horizon, 6 alive, 15,200 kcal (r70: game-over d107,
  0 alive, 1,800 kcal). FLIP in the other direction.
- No game-over in this panel, so there is no game-over cause
  to name — C1's gate (gates hold + no unexplained wipe) is
  met, but this is NOT evidence the game got safer. The
  driver change (DEFENDER convos on new days + probe calls)
  consumes RNG and time differently, and chaotic divergence
  swamps any game-change signal: the same seeds now produce
  opposite outcomes with no src/js change at all. Any
  r70->r71 comparison is trajectory divergence, not a
  before/after. The 154,617 kcal pantry on 9408 is reported
  as measured (13 raids all fought at the door, no lingerer
  ever formed, so no gorge drain and no sortie payments) —
  an outlier, not a pantry-bug claim; the panel has no
  pantry-composition record to audit it against.

## C2 (episodes fire + gates hold) — GO
- Raids fire on all seeds: 11 / 13 / 10. Fought resolutions
  on all seeds (9407 d15-d125; 9408 d9-d117; 9411 d16-d125).
- Gates hold: TRUE early 'fought' resolutions = 0 on all
  seeds (corpse-excluded); D1 snapshots 10/10 (delayed >= 3
  attempts); deltaBad empty; drift unknown = 0 (sortie-clear
  13, player-drawn-off 2); episode resets 0.
- D2 clear rate 8/8 ok sorties cleared (remaining 0), WITH
  composition (r70 proposal, applied as judgment, not a
  metric change): 9407 d43 Loud Beast 5 HP + Highbeam Deer
  23 HP; d93 Big Big 1 HP; d102 Big Big 1 + Landlord 1;
  d114 Ad Break 169 + Chorus Line 1 + Loud-Eyes 1; 9411 d50
  Cliffhanger 2; d64 Ugly Beast 1; d74 Loud Beast 14 +
  Big-Eyes 14; d125 Nevermore 1. Price honesty holds
  (pantryDelta == -paid on all 8 ok sorties). The two
  refused sorties are both 9411 d123 'no-fighters' against
  the same 1-HP Nevermore (two lingerer objects); the
  d125 sortie then clears it for 1,840 kcal. 'no-fighters'
  remains an honest end-state, not a silent failure.

## C2b (linger-conditional gorge/sortie) — GO
- 9407: lingerers formed, 28 gorge nights, 4 sorties — judged.
- 9408: NO lingerer set ever formed, 0 gorge, 0 sorties —
  PASSES episodes-fire on raids + 13 fought resolutions
  alone, per the r70 revision.
- 9411: lingerers formed, 21 gorge nights, 6 attempts
  (4 ok + 2 refused) — judged.

## C3 (people check) — GO by the prereg bars, with the
## defender-voice caveat below
Read in full: all 24 new transcripts (16 DEFENDER, 8
SHELTERED; 2 DEFENDER files are refused-at-open, no content).
fabricHits 0 panel-wide.
- NPCs want concrete things: food (James d31: "I haven't
  eaten right in days. I'm slowing down"; Huguette d40;
  Leo d61's joint forage outing: "come with me and we'll
  fill packs before dark"), wound care (Asher d16: "If it
  festers I'm no good to anyone — can't haul, can't hunt,
  can't watch"), sickness help (Paul d17/d60: "The fever's
  not breaking"; "Rest and clean water aren't cutting it").
  Every asked favor that reached the requirements menu got
  the actionable version ("Move next to them, on the same
  side of the Haven door, to help" — or "Move next to your
  partner..." for Leo's forage outing). The r70
  "no longer available" line never fired in this panel.
- Repeated asks escalate, then close — never loop: favor
  requirements climb "As I said —" / "Like I said —" /
  "Still the same thing —" / "I've told you three times
  now —" and then close; recaps escalate then close
  ("We're going in circles a bit"). One thinness, minor:
  recap subjects are vague ("Still on what was on their
  mind", "Still on what's been happening", "Still on that
  personal stuff") — the recap line never names the topic.
  A real player hammering recap 5x is a driver artifact,
  but the line itself carries no content either way.
- Grief reads as people, again: James on Sung ("The fire
  feels smaller without Sung. The rest of us will have to
  be bigger."); Amanda on Zoe ("Nobody says Zoe's name
  right yet. We will."); Paul on Judith ("I dreamed Judith
  was still here. Woke up angry at the dream."); Leo on
  Katarina ("I keep washing my hands like it'll bring
  them back."). Paul on Marcus (taken at the Scattering,
  pods humming) stays KIN-coherent across d25/d35.
- Invitations are sometimes taken, in this leg too: James
  "I'd love to. Lead the way."; Amanda "Alright. But I'm
  not carrying your stuff."; Leo "Okay. Yeah. I trust
  you."; Paul first "Not right now. I've got my own
  things to handle." then "…Fine. This had better be
  worth it."; Asher "Not right now." (declined, cleanly).

## D1 (DEFENDER fix) — GO by the bar, voice unproven
- 16 DEFENDER-tagged transcripts in the panel; 14 with
  content. Speaker-fought verification (convosDriven vid vs
  defendedFights on convo-day-minus-1): 16/16, zero misses.
  The fix works as an instrument: r70 heard only sheltered
  witnesses; r71 hears recorded defenders.
- BUT: 0 of the 14 content-bearing DEFENDER transcripts
  mentions the raid, the monster fought, or defending the
  door. Defenders talk about their favors, grief,
  confessions, teaching, and invitations — their own wants,
  not yesterday's fight. That is not yet a game defect
  verdict: the driver never steers to the 'lately' or
  raid topic (its pick order prefers favor details and
  fallbacks; ask:lately was never the first pick in any
  of the 24 transcripts). Defender voice is UNPROVEN, not
  disproven. Next run must steer one defender convo to
  ask:lately first before judging whether defenders can
  talk about the fight at all.

## D2 (favor-availability probe) — GO by the letter, blank
## NOT closed (read this before citing D2)
- The probe works: 22/22 content-bearing transcripts carry
  a [FAVOR-PROBE] block (the 2 without are refused-at-open,
  where no favor line could fire). Every probe names all
  disjuncts (rosterIncludes, isPlayer, personExists,
  personDead, vpDead) plus proximity components, and every
  probe in this panel shows roster TRUE, isPlayer FALSE,
  person TRUE/alive — i.e. no disjunct firing anywhere.
- The line itself never fired (0 occurrences panel-wide),
  so no disjunct was ever named for a living speaker. The
  blank from r70 stays open.
- Instrument weakness found (carried to next run, not
  fixed mid-run): the probe runs AFTER endConvo. r70's
  Paul sequence ends with dlg:cant, which closes the favor
  (declined) — a post-convo probe would then read 'already
  closed', not the menu-time reason. For favors still
  'asked' at convo end the post-convo reason equals the
  menu-time reason (nothing moves roster/person/dead
  during a convo), but for favors closed in-convo it loses
  the reason entirely. Next run: wrap convoFavorAction
  itself and log every call returning that reason, with
  disjuncts computed at call time.

## C4 (burn observation, Steve-call, no bar) — no observation
- 0 burns on all seeds (r70: 10 on 9411, all willing). The
  phoenix per-event respawn cascade did not recur in this
  panel — expected under chaotic divergence (no lethal
  bearer event in these trajectories), not evidence about
  the clause. The Steve-call stands unchanged, now with a
  zero-observation run alongside r70's cascade run.

## C6 (days-tail) — wobble persists
Loop-iteration days vs max Game say-day at end: 9407 120
vs 126, 9408 120 vs 121, 9411 120 vs 128. Same
instrument-wobble class as r70; judge bands, not counters.

## Village assessment (plain words)
- 9407: survives with 7 people (Amanda, Sanne, Lucas, Emma,
  Nora, Easton, Miguel) and an empty pantry after 11 raids,
  28 gorge nights, and 4 sorties — a village that fought
  everything it had to and ended the run living
  hand-to-mouth. Its dead, by the corpse record: Vyacheslav
  (monster, d11), Sung (starvation, d14), Violet (the wild,
  d33), James (dehydration, d48), Zoe (contest, d60),
  Pavel (Gavel, d60), Huguette (the wild, d73), Bienvenu
  (monster, d85), Sadhbh (monster, d89), Luis (the wild,
  d115).
- 9408: survives with 9 people and a pantry of 154,617
  kcal after 13 raids — the richest crisis pantry in this
  leg's recent record, bought by never letting a lingerer
  form: every raid fought at the door, no gorge nights, no
  sorties, nothing draining the stores. The mirror image
  of r70's starved 9408, on the same seed, with no game
  change between — a warning against reading any single
  seed as a trend.
- 9411: survives with 6 people and 15,200 kcal after 10
  raids, 21 gorge nights, and 6 sortie attempts — the
  middle village: it bent (two 'no-fighters' refusals on
  d123) and then cleared its last lingerer on d125, and
  nobody had to burn for the bearer this time.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights (2/3 seeds),
  sorties, aid resolutions, 'no-fighters' refusals, and
  defender conversations all fire on current master.
- FUN: yes — favors with concrete wants and actionable
  answers, grief that names names, invitations sometimes
  taken, and the 9408 mirror-flip is itself a memorable
  what-if. The missing piece is defender voice: nobody
  who fought yesterday talks about it yet, and that is
  the leg's most audible silence.
- WINNABLE: the leg itself is not a win path; all three
  villages survive it this run (vs one survivor in r70) —
  a divergence warning, not a difficulty verdict. No win
  verdict is drawn from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same
2 LOUD lines as r60/r62/r63/r66/r69/r70 on all 3 seeds —
defenderFights 95 -> 0, defendedCount 21 -> 0. EXPLAINED,
not a bug: the baseline's field names describe an older
instrument; current records carry defendedFights (31 / 58
/ 36 across the panel), not defenderFights. No NEW loud
line. Baseline NOT rolled.

## Test-suite call
Tooling-only change (2 new scripts, r70 clones + DEFENDER fix +
favor probe; zero src/js diff). Verification: node --check on
both scripts, 3-seed driver runs (all exit 0), analyzer, 24
transcripts read in full. check-quick run in full per the
prereg: 284 passed, 6 failed in 472s (log: goal
hidden_files/evidence/2026-10-30/r71-checkquick.log). All 6
failures fall in the standing families documented by the r65
recovery and re-observed in r70 — measurement x2
(proof-update, workflow), mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20-fixes
(1 racks-full voice assertion). No failure touches this run's
files (the 2 new scripts are not in the quick list). No NEW
failure vs r70; r70's 2 timeout failures
(trust-observer-neutrality, capable-bot) passed this run, so
the count fell 8 -> 6. The measurement-only landing proceeds
with the failures reported, not hidden. (One false start:
`node scripts/check.js --help` ignores --help and starts the
full suite — killed before it wrote anything; worktree
status stayed clean.)

## Metric review (§14)
- C1/C2/C2b/C3/D1/D2/C4 judged as pre-registered. No
  metric was re-scored mid-run.
- D1 judged on its bar (speaker fought), with the voice
  caveat stated, not folded into the bar after the fact.
  Proposed for the NEXT run's prereg: steer one defender
  convo to ask:lately first, and judge defender voice on
  that transcript.
- D2 judged on its letter (no occurrence without a probe),
  with the blank explicitly NOT closed and the post-convo
  probe weakness named. Proposed for the NEXT run's
  prereg: wrap convoFavorAction and log at call time.
- C1's chaos warning is a measurement lesson, not a
  metric change: driver changes that consume RNG (new
  convo days) re-roll trajectories, so same-seed
  comparisons across driver versions are divergence
  reports, not before/after evidence. A true before/after
  for a driver change needs the driver version held
  constant or a control arm.
- Carried (unchanged): dead discoverer's orphaned
  fireside entry (r51, Steve's call); unfed marches
  proceed (r50, Steve's call); stare-down cost as a
  class (Steve's call); phoenix per-event cascade
  (Steve-call); armor causation (needs a control arm);
  telemetry mapping proposal defenderFights ->
  defendedFights; gating freeze (2026-10-27) untouched.
- NEW for the next run: defender-voice steering
  (ask:lately); call-time favor probe wrap; recap-subject
  vagueness (minor content note, not a bar).

## Blanks filled / held
- FILLED: DEFENDER branch fixed and verified (16/16
  speaker-fought); favor probe proven working (22/22);
  current-master crisis panel re-run (all-horizon panel
  with named divergence warning); D2 composition attached
  to sortie judgment; 'no-fighters' re-observed as an
  honest end-state.
- HELD (not this run's): defender voice (steering
  needed); "no longer available" cause (line never fired;
  call-time probe needed); phoenix cascade cap
  (Steve-call); armor causation (control arm); recap
  vagueness (minor).
- No game change follows from this run. Rotation-b
  advances 6 -> 7 (succession) on this landing, verified
  by re-reading the file.
