# Journey endgame r152 — PRE-REGISTRATION (lane B, 2026-11-07 08:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per r135/r138/r140
precedent.

Run number basis: latest completed Lane B run is r151 succession
(2026-11-07, merged to master). Legs 5 (social r145) and 7
(succession r146/r147/r151) ran since the last endgame run (r147);
rotation returned to 4. This run is r152.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at start. New lock written (run_id
  2026-11-07T13:56:31Z).
- Main tree: `git status --short` 0 lines, disk 27% (fail line 85%).
- Reaper ran; 5/16 trees active, no cap pressure. Reaper flags 2
  sibling trees with uncommitted changes (sim-awayconfirm-a,
  sim-feastcost-b) — none owned by this lane, left alone.
- Registration: slow (~12 min, registry-lock contention under
  sibling sim load) but clean on first attempt; heartbeat verified
  by read-back (14:11:08Z) and a 10-min heartbeat loop is running.
- Master at pull time: 4b99c6d12 (fetch: already up to date).

SUBSTRATE: master 4b99c6d12 EXACTLY. NO build this run — no carried
fix is pending; the pilot is a pure near-reproduction check under
the named deltas. If a fix emerges from the pilot, it gets its own
proof test and is judged on a post-fix re-run, per the r147 rule,
not claimed from the pre-fix pilot. Probe:
scripts/probe-endgame-r152-20261107.js (r147 probe verbatim EXCEPT
renames r147->r152, evidence dir 2026-11-07/perseed-endgame-r152,
header). Analyzer: scripts/analyze-endgame-r152-20261107.js (r147
analyzer verbatim EXCEPT input dir, r147->r152). Dark probe:
scripts/probe-darktable-r152-20261107.js (r147 dark probe verbatim
EXCEPT renames + outdir). No policy change, no new instrument at
pilot time. Diagnostics, if any, write ONLY to
perseed-endgame-r152-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r147 SUBSTRATE (1e8db620d -> 4b99c6d12, verified by
git log/diff in the worktree). r147's pilot substrate was 1e8db620d
PLUS its own Fix B volume build, which has since landed as
bfaae9f8d + 19abb5a5d — so Fix B is NOT a delta vs the r147 pilot.
Probe-policy files (deed-seeking, capable, fullseat-diag,
relaygrey, vetcommit, armorydrive) are UNCHANGED in the range
(verified: git log on those paths is empty) — same probe policy.
Real game-code deltas, attributed:
(a) 1cee861d9 + cb21f29da + 5d1647e75 bond-initiation:
    villager-initiated bonds — NEW system (module + hooks +
    conversation beats + betrayal/villager-objectives/conversation
    changes), landed 2026-11-06, proof 47/47 then 60/60. Villagers
    now propose bonds at warmth 15-49. Could move standing/social
    trajectories; the pilot watches for proposals in endgame
    transcripts (descriptive V-BONDINIT, not a binding).
(b) 8a4ce0eab sim-finishersize-a: COMMITTED FINISH — fieldFights.js
    — a fighter met below its break line holds up to 3 rounds above
    the 40% floor when the beast is within 3 proven blows. Field
    wave-4 kill conversion may move.
(c) 5c5481852 sim-survivaltime-b: ARMOR CURVE K=20->6 via shared
    Game.armorReduction (all 4 absorb sites; game.js + fieldFights.js).
    Survivability may move.
(d) 2b9b0371e sim-drive-practice-a: PRACTICE MOVES COMPETENCE
    (game.js) — pilot GO 14/16 moved, baseline 0. Competence/skill
    may move; role formation is the upstream wave-4-party question.
(e) f4dafd387 stayrecover: IN-FIGHT RECOVERY EAT VERB (game.js +45)
    + flee-repair confirm. Fight outcomes may move. (Its
    competent.js policy change is NOT in the endgame probe's policy
    set — no probe-policy effect.)
(f) ad665d5e5 sim-vetkilltale-a: veteran-kill FIRESIDE TALE for
    repeat wave-4+ kills — narration; transcripts may carry new lines.
(g) 18359d824 sim-wanderspawn-a: wanderer-spawn 20-HP fix — bare-{id}
    spawns resolve def HP in spawnWorldMonster, veteran flag honored.
(h) 6aa254c6e + d51f85415 succession r147/r151: ask_favor dry-line
    guards (convo-wants.js + convo-dialogue.js) — dialogue variety;
    no mechanics change.
(i) 03d3ca655 journey-deepening r113: Q2 away-line fix
    (convo-wants.js) — refusal wording true face-to-face; dialogue.
(j) 338584348 + d1c6049ba sim-nextfight-a VETERAN'S EDGE: built then
    REVERTED — net zero in master.
(k) 8eecc4b19 + 848d0bba8 sim-bypass-b bypass cap: built then KILLED /
    reverted — net zero in master.
(l) version bumps, evidence, tooling, policy files for other sims
    (feastdrive/linkdrive/stageally policies — NOT in this probe's
    policy set).
NO gate, price, deed, seat, or table change in any of (a)-(k);
gating freeze (Steve 2026-10-27 16:53) stands. Any OTHER headline
difference is a same-run investigation item, never a road claim,
and is attributed first to this delta before any wider claim.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 5 pre-registered seeds):
89701 (waves), 89702 (waves), 89703 (waves), 89704 (forcedrift
control), 89705 (wavesnw). Plan is keyed by seed value in the probe,
so the subset keeps correct plans. Seed reuse is DELIBERATE
(matched before/after per the r118/r135/r140/r143/r144/r147
precedent: same seeds, same probe policy, only the game code
changed) — no fresh band is needed or claimed for the pilot.
89703 JOINS THE PILOT this run, per the r147 metric review: the
r147 pilot ran 2 waves seeds but the M2 bar is written >=2/3, so
arm A was effectively 2 seeds and the bar was 2/2. With 89703 the
analyzer's M2 bar (armA-with-fights >= 2 of 3 waves seeds) is
exactly as written.

R147 PILOT BASELINE (per-seed, from the r147 run note; judged on
these seeds):
- 89701 waves: village-LOST — scattered d83, pantry 0, alive 2.
  Standing peak 75, uw=3, w4 faced 0. (r140: scattered d53; r143:
  d80; r144: d78. The flip PERSISTS — still a scatter, no lesser
  win, just later.)
- 89702 waves: WON LESSER — announced d126, sat d127,
  beloved/light, final:quiet, alive 4. Standing peak 199, uw=4.
  Two wave-4 kills, both Cristóbal, d123 (Don't-Look + The Loud
  Stare). 18 census fights. Flipped from r144 (village-LOST via
  withdrawal d90 → lesser win).
- 89704 forcedrift: village-LOST — scattered d48, alive 4.
  Standing 0, uw=3. Control behaves as control.
- 89705 wavesnw: WON LESSER — announced d90, sat d91,
  beloved/light, final:quiet, alive 2. Standing peak 199, uw=4.
  5 census fights.
- 89703 waves (r131 descriptive baseline, NOT a pilot seed there):
  village-LOST — scattering d41 (fifth hungry day), uw=3,
  standing 45, alive 5, 0 fights.

Tally r147: lesser 2/4, full 0/4, wave-5 unlocked 0/4, faced 0/4,
wave-4 kills 2 (both 89702, both Cristóbal, d123).

R152 QUESTIONS: (1) does the pilot reproduce r147 modulo the named
deltas? (2) does the 89701 scatter persist a FIFTH time (r140 d53,
r143 d80, r144 d78, r147 d83) or revert — the pantry/feast
starvation thread is now the leading hypothesis (r147: away share
fell 48% -> 41% yet the village starved at home, 0 feasts held vs 4
in r144, BUFFER_SHORT 1 -> 6)? (3) does 89703 fight this time, and
does the M2 bar read cleanly at 3 waves seeds? (4) wild
verification carried from r147 (no case arose there): V-FixC
(stuck helper in a finale), V-STICKYOFFER (announced seat dips and
holds), V-RAIDDENSITY (young-national raid gaps >=7d)? (5) do the
r147-carried fixes show in the wild: pocket_sand pressed in the
losing window (V-POCKETSAND), waits narrated with variety
(V-FixB/V-WAITVARIETY), empty-pantry gorge line (V-Gorge)? (6) dark
re-verify: re-run the FULL dark probe as r152 (all 7 variants, same
policy, fresh evidence dir perseed-endgame-r152-dark/) and confirm
the v3 walk-out line names Amelia Moon, not Bill Palmer, and that
D1–D4/D6 still hold on the new substrate. (7) people check: does
the sitting seed's finale read as people, and do the r143/r144/r147
polish items recur? (8) bond-initiation in the wild: do
villager-initiated bond proposals appear in the pilot transcripts,
and do they read as people (descriptive only)? (9) do the (b)/(c)/
(d) deltas move wave-4 kill conversion, survivability, or
competence in the pilot?

INTERESTING FINDING (what would count): any pilot-vs-r147-pilot
headline difference other than the named deltas; any full-seat
win; any wave-5 unlock or face; any mFlee carrying monFled=true on
a non-flee kind (monster-commitment violation); any hurt-return
misfire; any ambush death missing from fallen; any dark re-verify
(v3) step failing; any transcript passage senseless, robotic, or
self-contradictory; a stuck helper waiting silently in a finale
(Fix C failing in the wild); an offered seat withdrawing (sticky
offer failing in the wild); a "holds and watches" cluster that
reads as a stuck record (Fix B volume failing in the wild); a
pocket_sand held but never pressed in a losing window where the
scholar fled instead; a bond proposal that fires from a roster
(villagers proposing to people they never perceived).

BINDINGS (pilot-scaled from r147; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
  (Analyzer threshold is >=3 of recs; with 5 seeds that is 3/5.)
- M2-census: every census fight carries a named outcome; >=2/3 Arm
  A waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r147).
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
- M11-standing-peak: standing peak reported for 5/5 seeds.
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
  failures (same reading as r121/r124/r128/r130/r131/r135/r140/r143/
  r144/r147).

BINDINGS (dark re-verify — a miss is NO-GO, never re-scored mid-run):
- S1-sitter-coda: the re-run v3 walk-out line names Amelia Moon
  (the sitter) with her pronouns, not Bill Palmer.
- S2-dark-holds: the full r152 dark re-run keeps D1–D4/D6 green on
  the new substrate (same steps, same expectations as r138/r140/
  r143/r144/r147; v1a's by-design curdle step stays the one expected
  non-ok).

BINDINGS (fix verification — each fix is verified in the wild
from pilot/dark transcripts; a fix failing in the wild is recorded
as a same-run investigation item, not forced):
- V-WAITVARIETY: in every pilot transcript, scanning hold lines in
  order, no two consecutive hold lines are identical (the rotation
  guarantees adjacency variety; a repeat after intervening different
  hold lines is allowed).
- V-FixB: no silent villager turn in any transcript (every 'wait'
  narrated) — carried from r147.
- V-Gorge: no "gorges — 0 kcal gone" line in any transcript —
  carried from r147.
- V-FixC: no stuck helper waits silently in a finale fight when
  the foe is in harry/strike range (help-branch fallback fires) —
  carried from r147 (no case arose there; falls again if none
  arises here).
- V-POCKETSAND: if a pilot transcript shows a scholar holding
  pocket_sand entering the losing window (<35% HP), the sand is
  pressed at least once before any flee; a flee-with-sand-held is
  a same-run investigation item.
- V-RAIDDENSITY: young-national raid staging gaps >=7 days on
  pilot seeds (no two raids within 6 days of each other on the
  same young national); a cluster is a same-run investigation item.
- V-STICKYOFFER: if any pilot seed announces a seat and a bar
  later dips, the transcript carries the holding line (not the
  withdrawal line) and the offer re-fires on recovery; an offered
  seat withdrawing is a same-run investigation item. If no seed
  announces-then-dips, V-STICKYOFFER is UNMEASURED (not failed).
- V-PREOFFER: a withdrawal beat fires ONLY on a seed whose table
  was never announced (announceDay null); a withdrawal on an
  announced seat fails this binding.
- V-BONDINIT (DESCRIPTIVE, not a binding): bond proposals in pilot
  transcripts are counted and read; absence is a finding (the
  warmth window may not be reached), not a NO-GO. A proposal to a
  villager the proposer never perceived is a same-run investigation
  item (perception law).

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.) Carried: telemetry baseline re-seed is a panel decision,
not this run's; baseline NOT rolled on a quiet check. SIT-DAY-DEATHS
dedupe (r124 proposal) stays open until a sitting seed with a
sit-day death recurs. The 89701 flip investigation (r140) stays
open: this run's 89701 headline is its next data point, with the
pantry/feast starvation thread now leading. The withdrawn-table
question is CLOSED (Steve 2026-11-06 07:06 ruling + landed sticky
fix + proof). Remaining is wild verification (V-STICKYOFFER), which
had no case in r147. V-FixC + V-RAIDDENSITY wild verification also
fall to this run.
