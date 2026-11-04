# Journey endgame r131 — PRE-REGISTRATION (lane B, 2026-11-04 15:00 CST run, written before any play)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per
r103/r104/r105/r109/r110/r118/r121/r124/r128/r130 precedent. Run
number basis: latest completed Lane B run is r130 (merged locally
as HEAD 96ee2136a, tooths->teeth + pilot/analyzer/control evidence;
main-session closeout delivered 14:42 CST; leg stays up next since
r130 was pilot-only). This run is r131. Slug: journey2-endgame
(DEVIATION, recorded: r129/r130 used suffixed slugs because the
bare slug was held by r120's dead-but-dirty tree. That tree was
salvaged verbatim and removed by main-session closeout 2026-11-04
05:11 CST; at this run's registration no journey2-* directory
existed and the registry entry for journey2-succession is
done-merged with a gone path. The bare slug was therefore free,
registration succeeded, and REGISTRY.json shows owner
oversight-playtest-loop-2, status active, heartbeat verified by
read-back. Release at closeout removes exactly this tree/branch.)

Run-start incidents (infrastructure, not measurement):
- NO LOCK at run start (playtest-loop-2.lock absent). Lock created
  by this run 2026-11-04T20:55:39Z. No stale-lock recovery needed.
- Main tree: `git status --short` 0 lines, `git pull --ff-only`
  already up to date, master 96ee2136a. Disk 30% (fail line 85%).
- Reaper: nothing removed; active 12/16 at pre-flight. LOUD
  preserved (never touched): journey2-succession registry entry
  (done-merged, path gone — phantom, not a tree), sim-sortie-a,
  sim-awayrationfix-b (locked, reason initializing),
  sim-awayration2-b, sim-streakfree-b, sim-fleerepair-a,
  sim-fracchoice-b, sim-tendfloor-guard-b, sim-rolecensus,
  journey-deepening, and other sibling trees.
- Worktree registration was slow (~6 min, git reset --hard in D
  state under sibling I/O — same pattern as r128/r130); heartbeat
  verified by REGISTRY.json read-back (21:04:13Z), standing loop
  beats every 600s to journey2-endgame-heartbeat.log (log is NOT
  proof; registry read-back is).

SUBSTRATE: r130 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1, TELEMETRY_FULL=1,
RELAYGREY=1. 180d, death-aware (+10d tail max on a dead village,
never ticked to fill the leg). Probe:
scripts/probe-endgame-r131-20261104.js (r130 probe verbatim EXCEPT
renames r130->r131, evidence dir 2026-11-04/perseed-endgame-r131,
header). Analyzer: scripts/analyze-endgame-r131-20261104.js (r130
analyzer verbatim EXCEPT input dir, r130->r131). No policy change,
no new instrument: the r130 probe already carries EVIDDIR override
+ FIRENARR/HURTRETURN/FALLEN-ambush capture. Diagnostics, if any,
write ONLY to perseed-endgame-r131-diag-<name>/, never the pilot
dir (r128 contamination class; r130 purity proof stands).

HEAD DELTA SINCE r130 PILOT BASE (a32735f13 -> 96ee2136a, src
only, verified by git diff --stat): src/js/table.js, 2 lines —
the r130 tooths->teeth grammar fix (war-path remainder branches).
Everything else in range is evidence/tooling (sim-winnability
round 1830, standaccum, tendbelow-confirm, food-economy round
1836, bankretain-rerun, exphurt-24) plus the r130 closeout itself.
No src/data game change, no gate/price/deed change. This pilot is
therefore a REPRODUCTION check under a narration-only delta, same
framing as r124: identical code except two text lines + identical
probe + identical seeds must reproduce the r130 pilot headlines
exactly. Any non-text flip is a same-run investigation item, never
a road claim. Expected text delta: none in the pilot unless a
war-path remainder line fires (r130 pilot's only sitting seed won
mercy, not war path; the teeth lines were observed on the r130
DIAGNOSTIC nohurt-89702 finale, not the pilot). A "teeth" line in
the r131 pilot where r130 had "tooths" is the fix confirming, not
a flip.

PILOT SEEDS (deliberate reuse, matched to r130/r128/r124/r121):
89701 (waves), 89702 (waves), 89704 (forcedrift control), 89705
(wavesnw). Pilot first per staged methodology.

R130 PILOT BASELINE (per-seed, from r130 run note + pilot log):
- 89701 waves: announced d90, sat d92, WON LESSER (feared/light,
  final:mercy), 5 fights (talkDown, mFlee x3, vKill), uw4, standing
  199, peakVet 1@d91, alive 9, pantry 9,746 kcal.
- 89702 waves: NO window, end survived, uw4, standing 199, 21
  fights, 3 kills, peakVet 2@d88 (end 0), alive 2. Pair broken when
  Ines died d100.
- 89704 forcedrift: village-lost (no-successor d45), uw3, standing
  0, 0 fights, alive 0.
- 89705 wavesnw: village-lost (scattering d110, third hungry day),
  uw3, standing 99, 0 fights, alive 1, 0 feasts (23 feast plans
  refused "Nobody is here to feast with").
R130 CONTROL (old code, detached 71041af7d) reproduced the r128
pilot exactly; no second control is run this time — the delta is
text-only, so a reproduction failure cannot be attributed to the
landing, and a control would re-prove r130's determinism proof.

R131 QUESTION: (1) does the pilot reproduce r130 exactly (minus
any teeth line)? (2) people check: does the sitting seed's finale
read as people, and do the r130-carried polish items recur?
(3) MECHANISM investigations (read-only first, fix only if small,
safe, and proof-tested): (a) Scout ping-pong role churn on the
r130 nohurt-89702 transcript — find the Scout assignment code
path and name why the role bounces with no stated reason, or
report "mechanism not established" honestly; (b) 89705's
"experiment" deaths (4 by d58 in r130) — read the death-cause
code path and name what "experiment" means before any claim.
(4) blank: fill ONE small item if the investigation yields a
safe, proof-tested change (text variation or wording only — no
seat, gate, price, deed, or fight-rule change; gating freeze,
Steve 2026-10-27 16:53, stands). If no safe fix emerges, the
items stay documented, not forced.

INTERESTING FINDING (what would count): any pilot-vs-r130-pilot
headline difference other than a teeth line; any full-seat win;
any wave-5 unlock or face; any mFlee carrying monFled=true on a
non-flee kind (monster-commitment violation); any hurt-return
misfire; any ambush death missing from fallen; any transcript
passage senseless, robotic, or self-contradictory; a named Scout
mechanism; a named "experiment" cause.

BINDINGS (pilot-scaled from r130; metric binding §14 — a miss is
NO-GO, never re-scored mid-run):
- M1-guard: >=3/4 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
- M2-census: every census fight carries a named outcome; engine
  opens == census fights.
- M2c/M2d: uncommitted classification complete (as r130).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing or a
  named fallback; control-dead-before-window + zero relay finals
  in block = INFO/vacuous, not NO-GO (r124 rule, kept).
- M10-fullseat-gap: every sitting seed's full-seat gap is named
  (r130 revised rule: seat-kind pass — lesser despite full bars
  met is a named gap, not NO-GO).
- M11-standing-peak: standing peak reported for 4/4 seeds.
- FIRENARR/HURTRETURN-captured: every pilot JSON carries firenarr
  + hurtreturn arrays (instrument health; counts descriptive).
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check
  (r130: 4/4; the r125 fix holds or it is an investigation item).
- CORPUS-PURITY (gating, from r129/r130): pilot JSON summaries
  match pilot log summaries seed-for-seed; zero diagnostic files
  in the pilot dir.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count. M3-conversion, M4-wave5-or-full, W5-question
  NO-GO on a closed road are the expected road reading, not pilot
  failures (same reading as r121/r124/r128/r130).

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.) Carried from r130: the open telemetry question is
whether the endgame baseline should be re-seeded from a
post-landing panel once such a panel exists — a panel decision,
not this run's; baseline NOT rolled on a quiet check.
