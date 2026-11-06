# Journey endgame r143 — PRE-REGISTRATION (lane B, 2026-11-05 17:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per r135/r138/r140
precedent.

Run number basis: latest completed Lane B endgame run is r140
(2026-11-05 10:00 CST, closed out by the main session after the
coordinator timed out). r141 (social life) and r142 (succession)
completed since. This run is r143.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at start. New lock written (run_id
  loop2-20261105T225535Z).
- Main tree: `git status --short` 0 lines, disk 24% (fail line 85%).
- Reaper ran, removed build-departmeal (4.1h stale, branch kept);
  4/16 trees active, no cap pressure.
- Registration: slow (~6 min, load ~8, sibling registrations in
  flight) but clean on first attempt; heartbeat verified by read-back
  (23:04:21Z). Standing heartbeat loop started (300s, detached).
- Master at pull time: e39227114 (fetch: already up to date).

SUBSTRATE: r140 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1, TELEMETRY_FULL=1,
RELAYGREY=1. 180d, death-aware (+10d tail max on a dead village,
never ticked to fill the leg). Probe:
scripts/probe-endgame-r143-20261105.js (r140 probe verbatim EXCEPT
renames r140->r143, evidence dir 2026-11-05/perseed-endgame-r143,
header). Analyzer: scripts/analyze-endgame-r143-20261105.js (r140
analyzer verbatim EXCEPT input dir, r140->r143). No policy change,
no new instrument at pilot time. Diagnostics, if any, write ONLY to
perseed-endgame-r143-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r140 SUBSTRATE (e5e6aa59b -> e39227114, src only,
verified by git diff --stat in the worktree): 5 files, 104
insertions, 13 deletions — build.js (stamp only), engine/combat.js
(+7: r140 Fix A harry-when-stuck), finale-campaign.js (+14/−: r140
F2 You-take + F3 MOVE-works), game.js (+81: r141 haven-news relay
only — sayHavenNews/flushHavenNews + call sites; narration delivery
timing, mechanics untouched), sigW5.js (+13/−: r140 F1 fiDealt
HP-diff). The sim-vetrest and sim-tbretreat levers added and reverted
in between leave ZERO src trace (grep 0). NO gate, price, deed,
seat, or table change; gating freeze (Steve 2026-10-27 16:53)
stands. This pilot is a NEAR-REPRODUCTION check under that delta:
expected headlines identical to r140 EXCEPT the named deltas (a)–(c)
below.
(a) r140 Fix A harry-when-stuck: a helpful villager blocked from
closing at distance <= 3 now harries ([2,4]) instead of waiting
silently — Ruth's 16/16 silent trial rounds should not recur;
trial/finale fights may deal slightly more damage and resolve
differently. (b) r140 F1 fiDealt: finale "total" is now the HP drop
since the last finale turn, all sources — no more triangular sums
("439 (1103 total)"). (c) r140 F2/F3: "You take N." for the player,
no "(MOVE works.)" aside. (d) r141 haven-news relay: naming-debate
/ killer-tale lines queue while the scholar is away and deliver at
the fire on return — transcript TIMING may shift on travel-heavy
seeds; mechanics (kick/proposals/majority/knowers/tale-log) run
identically. Any OTHER headline difference is a same-run
investigation item, never a road claim, and is attributed first to
this delta before any wider claim.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 4 pre-registered seeds):
89701 (waves), 89702 (waves), 89704 (forcedrift control), 89705
(wavesnw). Plan is keyed by seed value in the probe, so the subset
keeps correct plans. Seed reuse is DELIBERATE (matched before/after
per the r118/r135/r140 precedent: same seeds, same probe policy,
only the game code changed) — no fresh band is needed or claimed
for the pilot.

R140 PILOT BASELINE (per-seed, from the r140 run note; judged on
these 4 only):
- 89701 waves: village-LOST — scattered day 53, "On the third
  hungry day, people started walking", pantry 0, alive 3.
  (r135 on this seed: announced d90, sat d92, WON LESSER.)
- 89702 waves: WON LESSER (feared/light, final:pledge), announced
  d113, sat d133, alive 3. Standing peak 199.
- 89704 forcedrift: village-lost, wave 3, alive 6.
  (r135: village-lost (no-successor d45). Same headline.)
- 89705 wavesnw: village-lost, wave 3, alive 4.
  (r135: village-lost (scattering d110). Same headline.)

R143 QUESTION: (1) does the pilot reproduce r140 modulo the named
deltas? (2) does the 89701 scatter persist (r140's flip attributed
to away-ration packs, still in) or revert? (3) do r140's fixes show
in the wild: harry fires for stuck helpers in the sitting seed's
finale, fiDealt totals honest, "You take" correct, no MOVE-works
aside? (4) dark re-verify: re-run the FULL dark probe as r143 (all
7 variants, same policy, fresh evidence dir
perseed-endgame-r143-dark/) and confirm the v3 walk-out line names
Amelia Moon, not Bill Palmer, and that D1–D4/D6 still hold on the
new substrate. (5) people check: does the sitting seed's finale
read as people, and do the r140-carried polish items recur?

INTERESTING FINDING (what would count): any pilot-vs-r140-pilot
headline difference other than the named deltas; any full-seat
win; any wave-5 unlock or face; any mFlee carrying monFled=true on a
non-flee kind (monster-commitment violation); any hurt-return misfire;
any ambush death missing from fallen; any dark re-verify (v3) step
failing; any transcript passage senseless, robotic, or
self-contradictory; a stuck helper waiting silently in a finale
(Fix A failing in the wild); a named Scout mechanism; a named
"experiment" cause (both carried from r135, still open).

BINDINGS (pilot-scaled from r140; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3/4 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
- M2-census: every census fight carries a named outcome; engine
  opens == census fights.
- M2c/M2d: uncommitted classification complete (as r140).
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
  match pilot log summaries seed-for-seed (summary PROJECTIONS, not
  file-vs-log equality — r135 correction); zero diagnostic files
  in the pilot dir.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count. M3-conversion, M4-wave5-or-full, W5-question
  NO-GO on a closed road are the expected road reading, not pilot
  failures (same reading as r121/r124/r128/r130/r131/r135/r140).

BINDINGS (dark re-verify — a miss is NO-GO, never re-scored mid-run):
- S1-sitter-coda: the re-run v3 walk-out line names Amelia Moon
  (the sitter) with her pronouns, not Bill Palmer.
- S2-dark-holds: the full r143 dark re-run keeps D1–D4/D6 green on
  the new substrate (same steps, same expectations as r138/r140;
  v1a's by-design curdle step stays the one expected non-ok).

BINDINGS (r140-fix verification — each fix is verified in the wild
from pilot/dark transcripts; a fix failing in the wild is recorded
as a same-run investigation item, not forced):
- V-FixA: no stuck helper waits silently in a finale fight (harry
  fires where Ruth waited 16/16 in r140's v1c).
- V-F1: no triangular finale total appears in any transcript
  ("(N total)" equals damage actually taken).
- V-F2/F3: no "You takes" and no "(MOVE works.)" in any transcript.

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.) Carried: telemetry baseline re-seed is a panel decision,
not this run's; baseline NOT rolled on a quiet check. SIT-DAY-DEATHS
dedupe (r124 proposal) stays open until a sitting seed with a
sit-day death recurs. The "teeth fix" (r130) still stands on its
proof test, not pilot text — the war-path remainder branches did
not fire in r135 either. The 89701 flip investigation (r140) stays
open: this run's 89701 headline is its next data point.
