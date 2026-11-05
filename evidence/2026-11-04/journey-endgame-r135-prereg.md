# Journey endgame r135 — PRE-REGISTRATION (lane B, 2026-11-04 23:00 CST run, written before any play)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per
r103/r104/r105/r109/r110/r118/r121/r124/r128/r130/r131/r132 precedent.
Run number basis: latest completed Lane B endgame run is r131
(merged locally as f7c49968a, exact r130 pilot reproduction +
Turncoat opener rotation proof 7/7). r132 (21:00 slot) timed out
after a 2/4-seed partial pilot, salvaged verbatim to goal
hidden_files/salvage-journey2-endgame-r132/, NOT merged, rotation
left at 4. r134 (20:00 slot) was blocked at registration by the
EPERM flap and produced zero leg work. No trace of a 22:00 run
exists (lock absent at this run's start, rotation still 4), so
this run replays leg 4 as r135 and does not silently jump to 5.

Run-start incidents (infrastructure, not measurement):
- NO LOCK at run start (playtest-loop-2.lock absent). Lock created
  by this run 2026-11-05T04:56:05Z (run_id line 2026-11-05T04:57:00Z
  as written by the run's first command; the lock file itself was
  created by that command — no stale-lock recovery needed, no
  prior run_id was present to check).
- Main tree: `git status --short` 0 lines, `git pull --ff-only`
  already up to date, master 9c1f98529 at pull time; worktree
  branched from 12c72ddc2 (Lane A establishment r102 landing
  merged by a sibling between pull and registration — tooling +
  evidence only, zero src/js, so it does not change the src delta
  below). Disk 31% (fail line 85%).
- Reaper: nothing removed; active 13/16 at pre-flight. LOUD
  preserved (never touched): sibling trees sim-sortie-a,
  sim-awayrationfix-b (locked, reason initializing),
  sim-awayration2-b, sim-streakfree-b, sim-fleerepair-a,
  sim-fracchoice-b, sim-tendfloor-guard-b, sim-rolecensus,
  sim-triggerbuild-b, journey-establishment (live Lane A run),
  sim-encounterprod2-b, sim-strandnarr-a, flapfix-safecommit.
- Worktree registration succeeded (slug journey2-endgame, owner
  oversight-playtest-loop-2, run_id 2026-11-05T05:00:11+00:00,
  status active, heartbeat verified by REGISTRY.json read-back
  05:03:55Z). Standing heartbeat loop beats every 600s.

SUBSTRATE: r131 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1, TELEMETRY_FULL=1,
RELAYGREY=1. 180d, death-aware (+10d tail max on a dead village,
never ticked to fill the leg). Probe:
scripts/probe-endgame-r135-20261104.js (r131 probe verbatim EXCEPT
renames r131->r135, evidence dir 2026-11-04/perseed-endgame-r135,
header). Analyzer: scripts/analyze-endgame-r135-20261104.js (r131
analyzer verbatim EXCEPT input dir, r131->r135). No policy change,
no new instrument at pilot time. Diagnostics, if any, write ONLY
to perseed-endgame-r135-diag-<name>/, never the pilot dir (r128
contamination class).

HEAD DELTA SINCE r131 COMMIT (f7c49968a -> 12c72ddc2, src only,
verified by git diff --stat): 5 files, 42 insertions — build.js
(stamp only), conversation.js (scale r97 FRAG-FRAME: Mario-moment
fragment now framed as pride in the react path too), ledger.js
(succession r133 self-talk-request purge on succession),
villager-agency.js (sim-exphurt-land-a hurt-return homecoming
clause "hurt on the way home" when hp 1..7 at return),
villager-objectives.js (deepening r102 stale goalLine resets in
objPick/guard/expedition takeover). NO gate, price,
deed, seat, or fight-rule change; gating freeze (Steve 2026-10-27
16:53) stands. This is the SAME src delta r132 pre-registered
against, so this pilot is a NEAR-REPRODUCTION check under it:
expected headlines identical to r131 EXCEPT three named text
deltas — (a) hurt-return lines may gain the hurt clause where a
returnee is hp 1..7 at return, (b) the FRAG-FRAME pride framing
may appear in no-words sittings, (c) departure lines may LOSE a
stale goalLine annotation (a fix-shaped delta, not a flip). Any
OTHER headline difference is a same-run investigation item, never
a road claim, and is attributed first to this delta before any
wider claim.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 4 pre-registered seeds,
unlike r131's 7-seed method error): 89701 (waves), 89702 (waves),
89704 (forcedrift control), 89705 (wavesnw). Plan is keyed by
seed value in the probe, so the subset keeps correct plans.

R131 PILOT BASELINE (per-seed, from r131 run note; judged on
these 4 only):
- 89701 waves: announced d90, sat d92, WON LESSER (feared/light,
  final:mercy), 5 fights, uw4, standing 199, peakVet 1@d91, alive 9.
- 89702 waves: NO window, end survived, uw4, standing 199, 21
  fights, 3 kills, peakVet 2@d88 (end 0), alive 2.
- 89704 forcedrift: village-lost (no-successor d45), uw3, standing
  0, 0 fights, alive 0.
- 89705 wavesnw: village-lost (scattering d110, third hungry day),
  uw3, standing 99, 0 fights, alive 1.

R135 QUESTION: (1) does the pilot reproduce r131 modulo the three
named text deltas? (2) people check: does the sitting seed's
finale read as people, and do the r131-carried polish items recur?
(3) blank, OWNED this run (r131 metric-review proposal, carried
by r132 but never landed — r132 timed out before its fix):
the analyzer's PRIMARY NO-GO is driven by tally ids (M3-conversion,
M4-wave5-or-full, W5-question) sitting in primaryIds though the
prereg judges them as tallies. Fix: print PRIMARY as bindings-only
beside ALL (keep both readings, change no threshold), prove it by
re-running the analyzer on the r131 corpus and showing the PRIMARY
verdict change is presentation-only. (4) if the pilot is clean and
time allows, second small blank: the godpath twin Turncoat line
(godpath.js:1223, villager voice, single string) — same rotation
class as the r131 abilityActions fix; fix only if the pilot shows
the line firing and the change is proof-tested, else document.

INTERESTING FINDING (what would count): any pilot-vs-r131-pilot
headline difference other than the three named text deltas; any
full-seat win; any wave-5 unlock or face; any mFlee carrying
monFled=true on a non-flee kind (monster-commitment violation);
any hurt-return misfire; any ambush death missing from fallen;
any transcript passage senseless, robotic, or self-contradictory;
a named Scout mechanism; a named "experiment" cause (both carried
from r131, still open).

BINDINGS (pilot-scaled from r131/r132; metric binding §14 — a miss is
NO-GO, never re-scored mid-run):
- M1-guard: >=3/4 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
- M2-census: every census fight carries a named outcome; engine
  opens == census fights.
- M2c/M2d: uncommitted classification complete (as r131).
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
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check.
- CORPUS-PURITY (gating, from r129/r130): pilot JSON summaries
  match pilot log summaries seed-for-seed; zero diagnostic files
  in the pilot dir.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count. M3-conversion, M4-wave5-or-full, W5-question
  NO-GO on a closed road are the expected road reading, not pilot
  failures (same reading as r121/r124/r128/r130/r131).

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.) Carried: telemetry baseline re-seed is a panel decision,
not this run's; baseline NOT rolled on a quiet check. SIT-DAY-DEATHS
dedupe (r124 proposal) stays open until a sitting seed with a
sit-day death recurs.
