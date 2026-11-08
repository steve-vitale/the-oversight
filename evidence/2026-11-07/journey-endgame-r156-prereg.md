# Journey endgame r156 — PRE-REGISTRATION (lane B, 2026-11-07 18:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per r135/r138/r140
precedent.

Run number basis: latest completed Lane B run is r155 succession
(2026-11-07, merged to master); legs 5 (social r153), 6 (crisis r154),
7 (succession r155) ran since the last endgame run (r152), so the
rotation cycled 4->5->6->7->4. This run is r156.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at start. New lock written (run_id
  2026-11-08T00:01:08Z).
- Main tree: `git status --short` 0 lines, disk 26% (fail line 85%).
- Reaper ran; 4/16 trees active, no cap pressure. Reaper flags 2
  sibling build trees with uncommitted changes (build-alien-expand,
  build-mirror-cap, coord-alien-mirror) — none owned by this lane,
  left alone.
- Registration: slow (~11 min, registry-lock contention under
  sibling sim load) but clean on first attempt; heartbeat verified
  by read-back immediately after registration.
- Master at pull time: 386d7c4bf (fetch: already up to date).

SUBSTRATE: master 386d7c4bf EXACTLY. NO build this run — no carried
fix is pending; the pilot is a pure near-reproduction check under
the named deltas. If a fix emerges from the pilot, it gets its own
proof test and is judged on a post-fix re-run, per the r147 rule,
not claimed from the pre-fix pilot. Probe:
scripts/probe-endgame-r156-20261107.js (r152 probe verbatim EXCEPT
renames r152->r156, evidence dir 2026-11-07/perseed-endgame-r156,
header, + the withdrawal-detector widening below). Analyzer:
scripts/analyze-endgame-r156-20261107.js (r152 analyzer verbatim
EXCEPT input dir, r152->r156, + the M1-survived revision below).
Dark probe: scripts/probe-darktable-r156-20261107.js (r152 dark
probe verbatim EXCEPT renames + outdir). No policy change, no new
instrument at pilot time. Diagnostics, if any, write ONLY to
perseed-endgame-r156-diag-<name>/, never the pilot dir.

METRIC REVISIONS ADOPTED (from the r152 metric review, applied to
THIS run's instruments, never mid-run after the pilot):
- M1-survived: `voicedNonTable` now counts `endReason == 'survived'`
  as a voiced non-table resolution (the village outlived the window
  honestly). A surviving-unannounced seed is a distinct outcome
  from a silent failure.
- Withdrawal detector widened: the probe's withdrawal regex (daily
  slice + end-of-run rescan) now also matches tableWithdrawLine's
  "The table is withdrawn — for now" text, alongside PELLET HUMS /
  "the mantle may pass to hungrier hands". A withdrawal whose bearer
  lost the pellet no longer goes uncounted; the pre-offer beat is
  now counted as the withdrawal it is. V-PREOFFER still requires
  the beat to fire only on never-announced seeds.
- 89704 CONTROL REBASELINE: per the r152 finding, 89704 forcedrift
  is NO LONGER a control on this seed — it won lesser in r152. It
  runs this pilot as a second experimental seed. M5 is read as a
  relay-voicing check on the forcedrift seed, not as a control
  comparison; the analyzer's fallback/vacuous logic is unchanged.

PELLET RULING (Steve 2026-11-07 17:55 CST, landed during this run's
pre-flight): the pellet PASSES to hungrier hands — when the bearer
no longer hungers while the village does, the pellet passes to a
hungrier villager (voiced). Build owed by the build lane (pellet-pass
fix + proof + panel); NOT in this substrate. The pilot watches
(descriptive) whether the pellet lock recurs on 89702; a recurrence
is now a known-ruled defect awaiting its build, not a new question.
Q4 (exile — should a villager's feast-surge spend count when the
scholar can never feast?) still open.

HEAD DELTA SINCE r152 SUBSTRATE (4b99c6d12 -> 386d7c4bf, verified by
git log/diff in the worktree). Probe-policy files for this probe
(deed-seeking, capable, fullseat-diag, relaygrey, vetcommit,
armorydrive) are UNCHANGED in the range (verified: git log on those
paths is empty) — same probe policy. Real game-code deltas,
attributed:
(a) 50881fbf2 xp-gear: synergy bonus + healing deed coverage + gear
    protection retune (Steve 2026-11-05). The frozen-band bisect
    (sim-frozenband-bisect-b) says this commit collapsed sits on the
    frozen band (median 150->70.5d, sits 5/8->0/8). First endgame
    pilot on this substrate — sits/wins may move.
(b) 7943fd58a xp-gear: patrol deed — first combat threshold reachable
    in everyday play.
(c) 37fc7489b + c54de5a2b finishing instrument: finishLog module +
    field per-round capture + TB wraps. Instrumentation; trajectory
    effect expected nil.
(d) 4e6fa44ab establishment r112 Q1: specialist ladder fix — foodXp
    buys skill from 0, village work grants foodXp (racks/hunts).
    Competence/skill may move; role formation is the upstream
    wave-4-party question.
(e) 007203566 social r153: fix conversation repeats (cross-key pool
    exhaustion + opener double-speaking) — dialogue quality.
(f) 19ee88466 establishment r111 Q2: convoNextMenu returns the
    current line (menu:more no longer blanks the inline dialogue
    box) — dialogue UI.
(g) d333c899e succession r155: opener-skip fix (convoWouldBlock
    guard) — dialogue.
(h) 9d92a9903 deepening r116: mantle keeps the language arc alive
    across succession — succession/language.
(i) d6b3c6d0b crisis r154: betrayal softlock fix (whiff guard +
    round wrap) — combat softlock.
(j) 16369893c deepening r114: gate bond/link decisions on shared
    words + clear decided asks — bond/link decisions.
(k) 471ced6d8 + 820b61496 prodstore PLENTY-WEEK lever then REVERTED
    — net zero in game.js (byte-identical to master).
(l) bond-initiation.js follow-ups (inside (g)/(j) range) — bond
    proposal wiring; pilot watches proposals descriptively.
NO gate, price, deed, seat, or table change in any of (a)-(l);
gating freeze (Steve 2026-10-27 16:53) stands. Any OTHER headline
difference is a same-run investigation item, never a road claim,
and is attributed first to this delta before any wider claim.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 5 pre-registered seeds):
89701 (waves), 89702 (waves), 89703 (waves), 89704 (forcedrift,
experimental — see above), 89705 (wavesnw). Plan is keyed by seed
value in the probe, so the subset keeps correct plans. Seed reuse is
DELIBERATE (matched before/after per the r118/r135/r140/r143/r144/
r147/r152 precedent: same seeds, same probe policy, only the game
code changed) — no fresh band is needed or claimed for the pilot.

R152 PILOT BASELINE (per-seed, from the r152 run note; judged on
these seeds):
- 89701 waves: WON LESSER — announced d90, sat d92, feared/light,
  final:pledge, alive 9, pantry 7200. Standing peak 199, uw=4,
  1 wave-4 kill (Olivia Bennett "algorithm" d78). FLIPPED from r147
  (village-LOST, scattered d83).
- 89702 waves: village-LOST — scattered d174, pantry 0, alive 3.
  Standing peak 199, uw=4, 1 wave-4 kill, 23 census fights.
  FLIPPED from r147 (WON LESSER, announced d126, sat d127).
  Pellet-bearer Carlos died in the wild d83; surge never, feasts 0.
- 89703 waves: SURVIVED — alive 5 at d180, pantry 50841, never
  announced, never sat. Standing peak 386, uw=5, 3 wave-4 kills
  (all "reunion": d173, d176, d178), peak 3 living veterans (@d178).
  Scholar EXILED by moot vote 9-1 early, never returned; the
  feast-surge deed is scholar-buff-bound, so the table never came.
- 89704 forcedrift: WON LESSER — announced d90, sat d90,
  relay/dark, final:voice, alive 7, pantry 72193. Standing peak
  411, uw=5, 2 wave-4 kills. THE CONTROL WON — first control win
  in this series (r147: scattered d48, standing 0).
- 89705 wavesnw: WON LESSER — announced d90, sat d118,
  beloved/light, final:audience, alive 8, pantry 8169. Standing
  peak 199, uw=4, 0 wave-4 kills. 28-day deferral (guard=tier-cap).

Tally r152: lesser 3/5, full 0/5, wave-5 unlocked 2/5 (89703,
89704), faced 0/5, wave-4 kills 7. First pilot seed ever to bank 3
living veterans (89703); first time M3b-peak and M4-wave5-or-full
both GO.

R156 QUESTIONS: (1) does the pilot reproduce r152 modulo the named
deltas? (2) does the xp-gear retune (a) move sits/wins — the
frozen-band bisect says sits collapsed on the frozen band; does the
endgame pilot show the same direction? (3) does 89701's lesser win
hold, or does it flip a third time? (4) does 89703's exile lock
recur, and does the pellet lock recur on 89702 (now a ruled defect
awaiting its build)? (5) does 89704 win again as an experimental
seed? (6) wild verification carried from r152 (no case arose
there): V-FixC (stuck helper in a finale), V-STICKYOFFER (announced
seat dips and holds), V-RAIDDENSITY (young-national raid gaps
>=7d)? (7) do the r152-carried fixes show in the wild:
pocket_sand pressed in the losing window (V-POCKETSAND), waits
narrated with variety (V-FixB/V-WAITVARIETY), empty-pantry gorge
line (V-Gorge)? (8) dark re-verify: re-run the FULL dark probe as
r156 (all 7 variants, same policy, fresh evidence dir
perseed-endgame-r156-dark/) and confirm the v3 walk-out line names
Amelia Moon, not Bill Palmer, and that D1–D4/D6 still hold on the
new substrate. (9) people check: do the sitting seeds' finales
read as people, and do the r152 polish items recur? (10)
bond-initiation in the wild: do villager-initiated bond proposals
appear in the pilot transcripts, and do they read as people
(descriptive only)? (11) do the (a)/(d) deltas move wave-4 kill
conversion, survivability, or competence in the pilot?

INTERESTING FINDING (what would count): any pilot-vs-r152-pilot
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
(villagers proposing to people they never perceived); a pellet
lock recurring on a seed where the bearer no longer hungers while
the village does (ruled defect — record, do not rebuild here).

BINDINGS (pilot-scaled from r152; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal /
  survived — REVISED this run per r152 metric review).
  (Analyzer threshold is >=3 of recs; with 5 seeds that is 3/5.)
- M2-census: every census fight carries a named outcome; >=2/3 Arm
  A waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r152).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing or a
  named fallback; 89704 is experimental this run (see above) — the
  fallback/vacuous reading applies to the forcedrift seed's relay
  voicing, not to a control comparison.
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
  r144/r147/r152).

BINDINGS (dark re-verify — a miss is NO-GO, never re-scored mid-run):
- S1-sitter-coda: the re-run v3 walk-out line names Amelia Moon
  (the sitter) with her pronouns, not Bill Palmer.
- S2-dark-holds: the full r156 dark re-run keeps D1–D4/D6 green on
  the new substrate (same steps, same expectations as r138/r140/
  r143/r144/r147/r152; v1a's by-design curdle step stays the one
  expected non-ok).

BINDINGS (fix verification — each fix is verified in the wild
from pilot/dark transcripts; a fix failing in the wild is recorded
as a same-run investigation item, not forced):
- V-WAITVARIETY: in every pilot transcript, scanning hold lines in
  order, no two consecutive hold lines are identical (the rotation
  guarantees adjacency variety; a repeat after intervening different
  hold lines is allowed).
- V-FixB: no silent villager turn in any transcript (every 'wait'
  narrated) — carried from r152.
- V-Gorge: no "gorges — 0 kcal gone" line in any transcript —
  carried from r152.
- V-FixC: no stuck helper waits silently in a finale fight when
  the foe is in harry/strike range (help-branch fallback fires) —
  carried from r152 (no case arose there; falls again if none
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
  announced seat fails this binding. The widened detector now
  counts tableWithdrawLine ("The table is withdrawn — for now")
  as the withdrawal it is.
- V-BONDINIT (DESCRIPTIVE, not a binding): bond proposals in pilot
  transcripts are counted and read; absence is a finding (the
  warmth window may not be reached), not a NO-GO. A proposal to a
  villager the proposer never perceived is a same-run investigation
  item (perception law).

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.) Carried: telemetry baseline re-seed is a panel decision,
not this run's; baseline NOT rolled on a quiet check. The withdrawn-table
question is CLOSED (Steve 2026-11-06 07:06 ruling + landed sticky
fix + proof). Remaining is wild verification (V-STICKYOFFER), which
had no case in r147 or r152. V-FixC + V-RAIDDENSITY wild verification
also fall to this run. The 89704 control question is CLOSED as a
control (it won in r152); it runs as an experimental seed from now
on until a redesigned control is preregistered. The pellet-bearer
question is RULED (Steve 2026-11-07 17:55 CST: pellet passes to
hungrier hands) with a build owed; the pilot records recurrences
only. Q4 (exile feast-surge spend) still open.
