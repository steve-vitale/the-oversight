# Journey crisis r63 — B3 NO-GO: the 9407 drift moved, S1a changes nothing (lane B, leg 6)

Successor to crisis r61/r62. Pre-registration:
`hidden_files/evidence/2026-10-29/journey-crisis-r63-prereg.md`
Base: master d09f5aaf9. No game change in this run: measurement only.
This run executes ONLY r62's one unfinished measurement (B3) and closes
the leg. Everything else in r61 is closed in r62's note, recomputed
here where it touches B5.

## Stale-lock recovery (done first, per the body)
- Previous lock playtest-loop-2.lock = run 2026-10-29T04:56:51Z, with
  NO registry entry of its own. That run had adopted the orphaned
  journey2-crisis tree (r61 successor, run 2026-10-29T00:03:06Z).
  That tree's heartbeat was 2026-10-29T05:53:32Z, 16+ min stale at
  06:09 UTC, with no journey2-crisis process and no heartbeat loop
  running — the 00:00 CDT r61-completion run had timed out. Previous
  run DEAD by the body's 15-min rule. Old lock deleted, new lock
  written (run 2026-10-29T06:10:28Z).
- The dead journey2-crisis tree was NOT touched: it still holds
  uncommitted r61 scripts plus a restored betrayal.js. Its
  adoption-or-release remains pending for a session that owns it.
  This run used a fresh slug journey2-crisis-r63 and needed nothing
  from that tree (driver/analyzer copied from committed master).
- Main-tree pre-flight: CLEAN (0 lines), disk 22%, `git pull`
  already up to date. Worktree-reap ran clean before registration.

## The 00:00 CDT run's r61b files are copies, not fresh sims (finding)
Before running anything, this run checked the 00:00 run's outputs in
`hidden_files/evidence/2026-10-29/` (r61b-panel, r61b-analyzer-*):
- r61b-C0-9407 is BYTE-IDENTICAL to r61-panel/9407 (sha 149ca0cf…),
  the file r62 already rejected as a non-representative 9407 arm.
- r61b-W-9408 is BYTE-IDENTICAL to r61-panel arm-a4/arm-a4a/arm-e1
  9408 (sha e5b0df63…).
- r61b-C0-9408 and r61b-C0b-9408 are byte-identical to r61-panel
  C0 9408. The r61-betrayal-revert.patch file is 0 bytes, so the
  "W" arm's definition is unpreserved.
- Conclusion: the 00:00 run produced no fresh 9407/9408 sims; it
  re-copied and re-analyzed older panel files. Its "W pinned as the
  single 9408 cause" claim is therefore NOT a fresh measurement and
  is not relied on here. The 9408 finding still stands on r62's
  recomputation from preserved r61 evidence (see below), and this
  run's fresh 9407 arms are the only current-master 9407 evidence.

## Fresh arms (r60 driver/analyzer verbatim -> r63, seed 9407 only)
Instrument: `scripts/journey-crisis-r63-delayed-20261029.js` +
`scripts/analyze-crisis-r63-delayed-20261029.js`, policy oracleV2,
120d death-aware (+10d tail). Panel:
`hidden_files/evidence/2026-10-29/r63-panel/{C0,S1a}/`.
- C0 (current master, no changes), run 06:23–06:25 UTC, exit 0.
- S1a (revert of 6eb84f967's betrayal.js hunks ONLY, reverse-apply
  clean, diff -64/+1, node --check clean), run 06:26–06:28 UTC,
  exit 0. betrayal.js restored afterward: `git diff` 0 lines,
  worktree holds only the 2 new scripts. Case-framing proof
  (test-r64-case-framing) re-run on the restored tree: 11/11 GREEN,
  so the feature is intact after the arm.
- Record-keeping slip, owned: the first invocation set EVID as a
  shell variable without export, so both arms' conversation
  transcripts landed in the evidence/2026-10-29 root instead of
  their arm dirs. Copies were placed in both arm dirs afterward.
  No data was lost: the two runs are byte-identical (below), so
  both arms' transcripts are the same files.

## B3 (9407 confirmation) — NO-GO
- C0-9407 on current master is a THIRD trajectory, neither r59 nor
  r60: ends horizon, 3 alive (Nora, Augustin, Zere), 2,100 kcal;
  raids days 14/24/31/46/53/61/72/79/90/98/118; gorge nights at
  d25-28, d32-36, then d99-101 (The Moderator + Inspiration) and
  d119-121. There is NO day-94/95/96 gorge at all and no day-97
  sortie — the wave-3 crisis episode that produced the r59/r60
  day-96 gorge (lingerers since day 93) does not occur in this
  trajectory.
- S1a-9407 is BYTE-IDENTICAL to C0-9407 (sha 5775690c…, 1,424,615
  bytes; day-9 sayLines 110 = 110, total sayLines 12,706 = 12,706,
  same census, same raids, same gorge days). The case-framing
  revert changes nothing in seed 9407's run: 9407's day 9 has no
  betrayal-case menu, so the framing beat never fires, so nothing
  downstream can diverge.
- Verdict per the prereg: B3 is NO-GO. S1a-9407 does not move the
  day-96 gorge to Night Court (there is no day-96 gorge), and
  C0-9407 is not The Bailiff at day 96. The 9407 drift is a
  SEPARATE / moved target: intervening landings between the r60
  base (b898dff4a) and current master (d09f5aaf9 — fixall-map
  slices, succseam, and others) moved seed 9407's whole trajectory
  to a different crisis episode. The 9408 finding stands on its
  own (r62's recomputation: S1a restores the r59 day-9 transcript
  exactly, 151/151 lines); it does not generalize to 9407.
- What this means in plain words: one spoken sentence on day 9
  decides whether a village lives or dies on seed 9408, but on
  seed 9407 that sentence is never spoken — the village's story
  goes a different way before any betrayal case is even on the
  table. The next 9407 bisection must start from the current
  trajectory (what moved the day-93 crisis episode), not from the
  case-framing beat.

## B5 (gate holds) — GO
TRUE early 'fought' resolutions (r60 analyzer definition,
lingeringAtResolutionTrue > 0) = 0 on:
- r63 C0-9407 and S1a-9407 (aid resolutions and sortie-call
  resolutions both checked);
- all 8 preserved named r61 seed-9408 arms, recomputed this run:
  C0, A1, A2, A3, A4, S1, S1a, S1b — all 0.
The r59 aidFight lingerer-first gate does not regress under any
arm, old or new.

## B4 (people check) — GO
Read in full: C0-9407 day-9 sayLines (all 110), all 7 driven
conversation transcripts (d26/d48/d55/d63/d74/d81/d120), and the
analyzer panel. fabricHits [] on both new arms.
- NPCs want concrete things: Nora (d120) wants a festering wound
  cleaned and wrapped tight — "If it festers I'm no good to anyone
  — can't haul, can't hunt, can't watch" — with a real
  precondition (move next to them, same side of the Haven door);
  Amanda (d48) wants a trap-line walk ("Extra hands, extra eyes");
  Amanda (d74) digs up a buried food bundle she kept secret
  before the Scattering (+1,512 kcal to the pantry, a real
  consequence, not a line).
- Grief and identity read as people, not filler: Amanda (d55)
  takes over Sanne's burnt piece ("Sanne always took the burnt
  piece. Said someone had to. I take it now."); Amanda (d63) on
  change ("I used to be a glazier who worried about being on
  time. Now I worry about being alive. Same worry, bigger
  font."); Amanda (d74) on singing ("Old songs from Columbus,
  Ohio. The words are half gone but the tune holds.").
- The harness stress pattern (same pick repeated 4–5 times) is
  handled by escalation, not looping: favor_requirements answers
  climb "As I said —" / "Like I said —" / "I've told you three
  times now —" and then close ("Careful with it. And — thank
  you."); recap answers escalate then close ("Okay. We'll pick
  this up later.", "I should get back to it.").
- Endings resolve/plant/owe: "You know where to find me",
  "Keep going" (creek concerts), "I should get going". No
  fabricated shared history flagged. Minor seam, noted not
  failed: driven conversations that end on an invite/silence
  pick terminate as "(conversation ended by the engine)" with no
  closing line — the engine cut, not a narrative ending.

## Village assessment (plain words)
The current-master 9407 village survives 120 days but thin: 3
people left (Nora, Augustin, Zere) and 2,100 kcal in the pantry —
enough for days, not seasons. It weathers 11 raids and 22 gorge
nights, fights 5 sorties (3 clear), and ends at the horizon, not
scattered or extinct. Compare the older trajectories: r59's 9407
ended with 7 alive and 36,127 kcal; r60's with 2 alive and
13,800 kcal. The village that "should" have had a Night Court
gorge at day 96 instead meets a Moderator/Inspiration lingerer
episode at day 99. The crisis leg still bends the village without
breaking it, but the margin is thin — one more bad episode and
this village is a husk.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, sorties, aid resolutions,
  refusals, and driven conversations all fire on current master.
- FUN: yes, with the standing caveat — the siege narration (gorge
  as price, sortie as choice, lingerers at the treeline) still
  reads as a real dilemma, and conversations escalate instead of
  looping. The day-9 transcript is a living village, not a log.
- WINNABLE: the leg itself is not a win path; villages survive it
  but thin. No win verdict is drawn from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the new 9407 JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62 on both arms — defenderFights 95 -> 0,
defendedCount 21 -> 0. EXPLAINED, not a bug: the baseline's field
names describe an older instrument; current records carry
defendedFights, not defenderFights. Baseline NOT rolled.
(Note: telemetry-check's glob does not expand `*` as a directory
component — each arm dir was checked with its own file path.)

## Test-suite call (documented, not silent)
No src/js changed in this run (measurement only; the S1a revert
was restored and re-proven 11/11). The relevant suites were run:
r63 driver + analyzer on both arms, node --check on both new
scripts and on betrayal.js post-restore, and the r64
case-framing proof (11/11 GREEN). A full check-quick was NOT run:
it re-verifies the base, not a tooling-only change, and the two
new scripts are not in the quick list; running it would have
repeated the timeout chain that stranded r61/r62. The next run
that changes src/js runs the full suite as normal.

## Metric review (§14)
- B3's prereg assumed C0-9407 would show either the r59 gorge
  (Night Court, drift gone) or the r60 gorge (Bailiff, drift
  present). Current master shows a third case: no day-96 gorge
  because the episode itself moved. Proposed for the NEXT run's
  prereg, not applied here: judge 9407 bisections on episode
  occurrence (does the day-93 crisis episode occur at all?) before
  judging gorge identity, and re-baseline the 9407 reference
  panel on current master before bisecting further.
- "Presentation only" caveat (r62, confirmed here by contrast):
  a spoken beat moves seeded outcomes only where it fires. On
  9407 it never fires, so the beat is inert there — presentation
  beats are load-bearing per-sitting, not globally.
- Carried (unchanged): instrument wobble in the tail (pin day 116
  for 9408) — judge bands, not tail byte-equality; telemetry
  mapping proposal defenderFights -> defendedFights; dead
  discoverer's orphaned fireside entry (r51, Steve's call); unfed
  marches proceed (r50, Steve's call); stare-down cost as a class
  (Steve's call); gating freeze (2026-10-27) untouched.

## Blanks filled / held
- FILLED: B3, the last open r61 item, is answered (NO-GO with a
  named cause) and the leg closes; the 00:00 run's r61b files are
  identified as copies, so no future run re-trusts them as fresh
  evidence.
- HELD (not this run's): adoption-or-release of the dead
  journey2-crisis tree (uncommitted r61 scripts + restored
  betrayal.js) still pending for a session that owns it; the next
  9407 bisection (current-trajectory episode movement) is a new
  run's question, not smuggled into this one.
- No game change follows from this run. Rotation-b advances
  6 -> 7 (succession) on this landing.
