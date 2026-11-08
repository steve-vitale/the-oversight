# Journey endgame r158 — PRE-REGISTRATION (lane B, 2026-11-08 07:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per r135/r138/r140
precedent.

Run number basis: latest completed Lane B run is r157 succession
(2026-11-08, merged to master 4fe571095); legs 5 (social r153), 6
(crisis r155), 7 (succession r157) ran since the last endgame run
(r156), so the rotation cycled 4->5->6->7->4. This run is r158.

Run-start incidents (infrastructure, not measurement):
- Lock: present at start (run_id 2026-11-08T12:00:49Z, the 06:00
  adoption run's lock); the r157 closeout deleted it between this
  run's first read (12:57:46Z) and re-check (~12:58Z) — no live Lane
  B run (registry journey2-succession done-merged, no journey2
  worktree, no journey2 processes). New lock written (run_id
  2026-11-08T12:58:59Z). No stale-lock recovery needed; the lock
  owner finished and cleaned up.
- Main tree: `git status --short` 0 lines, disk 31% (fail line 85%).
- Reaper ran (slow under load, see run note); registration to follow.
- Master at pull time: 4fe571095 (fetch: already up to date).

SUBSTRATE: master 4fe571095 EXACTLY. NO build is pre-planned; the
pilot is a pure matched re-run under the named deltas. If a fix
emerges from the pilot, it gets its own proof test and is judged on
a post-fix re-run, per the r147 rule, not claimed from the pre-fix
pilot. Probe: scripts/probe-endgame-r158-20261108.js (r156 probe
verbatim EXCEPT renames r156->r158, evidence dir
2026-11-08/perseed-endgame-r158, header, + the read-only ladder
snapshot instrument below). Analyzer:
scripts/analyze-endgame-r158-20261108.js (r156 analyzer verbatim
EXCEPT input dir, r156->r158, + the ladder section below). Dark
probe: scripts/probe-darktable-r158-20261108.js (r156 dark probe
verbatim EXCEPT renames + outdir). No policy change, no new
instrument at pilot time beyond the named ladder snapshot.
Diagnostics, if any, write ONLY to
perseed-endgame-r158-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r156 SUBSTRATE (386d7c4bf -> 4fe571095, verified by
git log). Probe-policy files (deed-seeking, capable, fullseat-diag,
relaygrey, vetcommit, armorydrive) are UNCHANGED in the range
(verified: git log on those paths is empty) — same probe policy.
Real game-code deltas, attributed:
(a) LADDER leg1+leg2 (the headline delta): staged Standing ladder
    (Village 12 -> Regional -> National 40 -> Galactic Seat);
    lesser seat = sentimentTaught alone + ladder peak stage >=
    Village; full seat = ladder peak stage >= National + a capstone
    deed delivered (military tribute / trade charter / feast
    embassy); feastSurgeUsed DROPPED from the food deeds; feast
    bundle (6 of 12 contributions, +4 ladder points once per stage,
    8000 kcal buy-out); mercy via tableActive() on capstone
    delivery; tablePreview ladder block; ladder-capstones.json in
    boot data; ladder voicing via ladderLine() in seat shortfalls.
    The feast-gate the r156 run named as the wall is GONE as a gate.
(b) PELLET PASS (#16 healerbisect, 2294ef815): the pellet passes to
    hungrier hands — when the bearer no longer hungers while the
    village does, the pellet passes (voiced). The 89702 lock is now
    a ruled defect WITH its build landed; a recurrence is a
    regression, not a known-awaiting item.
(c) Deepening r119: ladder opens 4/4, trust earned-only.
(d) Succession r157: teach-narration dry fix (conversation.js).
(e) Establishment r114: preserver XP per batch (cook-side ladder
    pace dial); Q1/Q2 fixes.
(f) Alien expansion (already in r156's adoption base 2bc17d793).
(g) Sim-only work (binddiag, cheaptend CONCEPT-DEAD not landed,
    medicdiag diag-only) — no game change.
(h) Version bump only.
NO other gate, price, deed, seat, or table change in (a)-(h)
beyond the ladder surgery itself; the winnability freeze otherwise
stands. Any OTHER headline difference is a same-run investigation
item, never a road claim, and is attributed first to this delta
before any wider claim.

LADDER SNAPSHOT INSTRUMENT (read-only, named here before the pilot):
the r156 probe predates the ladder, so the probe summary carries no
ladder state. This run adds ONLY reads, no policy change: at each
daily slice and at end of run, the probe records ladderSnapshot {
stage: ladderStage(), peak: ladderPeakStage(), counted,
total, byTrack, bundleStages, capstone: pg.ladderCapstone || null,
capstoneDay } and a ladderLines array (any SAY line containing
'ladder' / 'Standing' / 'capstone' / 'bundle' in the table audit
or seat-shortfall voicing). The analyzer prints a LADDER section
per seed (peak stage reached, capstone delivered or not, bundle
completions, shortfall lines naming the ladder). No behavior
changes: no policy calls ladderDeliverCapstone or
feastBundleBuyOut — see the instrument-limit note below.

INSTRUMENT LIMIT (read before judging M4): no probe policy calls
ladderDeliverCapstone() or feastBundleBuyOut() — capstone delivery
is a Haven-panel act (leg 3 owns the player-facing entry) and no
bot policy plays it. So the pilot can show the ladder opening the
LESSER seat (peak stage + sentimentTaught, both earned through
play) but CANNOT show a full seat, because no pilot village will
ever deliver a capstone. A full-seat 0/5 in this pilot is therefore
an INSTRUMENT limit, not a ladder verdict — recorded as such, never
read as "the ladder failed". The full-seat question needs either a
capstone-delivering bot policy (a tooling build, not this run) or
the leg-4 calibration panels. The ladder's own unit proofs
(L2-1..L2-8) already prove the full seat prices when a capstone IS
delivered; this pilot tests only what the bot can reach.

DIAG-LAYER STALENESS (carried blank, NOT changed this run):
scripts/policies/fullseat-diag.js still decomposes the full seat
with the PRE-ladder gate — its foodDeeds pair requires
sentimentTaught AND feastSurgeUsed, and its binding/worst list
names no ladder bar. Its seat/gate reads (bestSeat,
firstFullSeatDay, s.ok) come from the REAL Game.tableSeat() /
deedGateReady(), so they are correct on the ladder substrate and
the pilot's verdicts are unaffected; the analyzer's own
bindingFromMax (updated this run: sentiment-only + ladder peak /
capstone terms) is what names M10 gaps. But the diag's
decomposition fields (foodDeeds.ok, binding, worst) are stale and
must NOT be read as the gate until the diag is updated — owed to
the ladder coordinator / leg 4, not smuggled into this journey
run. The pilot records sentDay/surgeDay as before (surgeDay is
now descriptive only). PELLET
REFRAME (Steve 2026-11-08 07:03 CST, MEMORY.md update during this
run's pre-flight): the bearer should gain basically unlimited food
boosts from the pellet, WITH A COST — the boosts cost pantry
calories; staying fed is free, the extra power is not. Build
briefed + queued behind the pellet-pass-alone counterfactual, NOT
on this substrate; the pilot does not test it. MEDIC CURE ruled
the same morning (roster medics can cure via ability or medicine;
Haven Medic Duty arm in flight, Loop A) — not an endgame-leg
substrate change; noted as context only.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 5 pre-registered seeds):
89701 (waves), 89702 (waves), 89703 (waves), 89704 (forcedrift,
experimental — see r156 prereg), 89705 (wavesnw). Plan is keyed by
seed value in the probe, so the subset keeps correct plans. Seed
reuse is DELIBERATE (matched before/after per the r118/r135/r140/
r143/r144/r147/r152/r156 precedent: same seeds, same probe policy,
only the game code changed) — no fresh band is needed or claimed
for the pilot.

R156 PILOT BASELINE (per-seed, from the r156 run note; judged on
these seeds):
- 89701 waves: village-LOST (scattered), never announced, never
  sat. 2 wave-4 kills, standing peak 199, uw=4. FLIPPED from r152
  (won lesser). Third flip for this seed across r147/r152/r156.
- 89702 waves: WON LESSER — announced d90, sat d100, feared/light,
  final:pledge, alive 4. 1 wave-4 kill, standing peak 199, uw=4.
  FLIPPED from r152 (village-lost). Surge spent d46 + d54 — the
  pellet lock did NOT recur (r152: bearer Carlos died d83, surge
  never).
- 89703 waves: WON LESSER — announced d90, sat d107,
  beloved/light, final:audience, alive 6. 0 wave-4 kills, standing
  peak 199, uw=4. FLIPPED from r152 (survived, never announced —
  the scholar was exiled there). The exile lock did NOT recur.
  Q4 ANSWERED 2026-11-08 07:03 CST (Steve): YES, a feast-surge
  spend counts even if the spender can't eat anymore — implementation
  rides with the pellet-reframe build, QUEUED behind the
  pellet-pass-alone counterfactual (Loop B sim-pelletpass-b, running
  now), NOT on this substrate; the pilot records 89703 descriptively
  under the old code.
- 89704 forcedrift (experimental, ex-control): WON LESSER —
  announced d90, sat d90, relay/dark, final:merge, alive 8.
  Wave-5 FACED (editor d78), 2 living veterans at release d72,
  standing peak 375, uw=5. Final pick moved from r152's
  final:voice to final:merge.
- 89705 wavesnw: WON LESSER — announced d90, sat d98,
  beloved/light, final:audience, alive 8. 1 wave-4 kill, standing
  peak 199, uw=4. Sat 20 days earlier than r152 (d118 -> d98).
Tally r156: lesser 4/5 (r152: 3/5), full 0/5, wave-5 unlocked 1/5
(89704; r152: 2/5), wave-5 faced 1/5. Sits 4/5 on the xp-gear
substrate — the frozen-band collapse (sits 5/8 -> 0/8 on the frozen
band) does NOT reproduce on these seeds.

R158 QUESTIONS: (1) does the pilot reproduce r156 modulo the named
deltas? (2) does the ladder move the road — lesser sits (peak
stage >= Village should be easier than the old feast gate), any
full seat (see instrument limit — expected 0/5 by design, NOT a
verdict), wave-5 unlock/face? (3) does the pellet lock recur on
89702 now that the pass is landed (a recurrence is a regression)?
(4) does 89704 win again as an experimental seed? (5) does the
ladder VOICE — do seat-shortfall lines name the ladder bar, and do
sitting seeds' audits read the ladder aloud? (6) do any pilot
villages complete a feast bundle or buy one out (descriptive)? (7)
dark re-verify: re-run the FULL dark probe as r158 (all 7 variants,
same policy, fresh evidence dir perseed-endgame-r158-dark/) and
confirm the v3 walk-out line names Amelia Moon, not Bill Palmer,
and that D1–D4/D6 still hold on the new substrate. (8) people
check: do the sitting seeds' finales read as people, and do the
r156 polish items recur (refusal variety — V-REFUSALVARIETY now a
standing check)? (9) bond-initiation in the wild: do
villager-initiated bond proposals appear in the pilot transcripts
(descriptive only; the warmth window may not be reached — carry
from r156)? (10) do the (a)/(b)/(e) deltas move wave-4 kill
conversion, survivability, or competence in the pilot? (11) TABLE.md
staleness: TABLE.md still documents the old lesser-seat food bar
(sentimentTaught + feastSurgeUsed) — the ladder surgery changed
it; is the doc update owed by this run or the ladder coordinator?
(recorded here; decided at closeout, not invented mid-run.)

INTERESTING FINDING (what would count): any pilot-vs-r156-pilot
headline difference other than the named deltas; any full-seat win
(unexpected — would mean a capstone fired without a bot policy,
investigate before believing); any wave-5 unlock or face; a pellet
lock recurring on 89702 (regression, FAIL LOUDLY in chat); a ladder
shortfall line that names the OLD feast bar or stays silent where
the ladder bar is the blocker (cap never silent — L2/Q10); a bundle
completing in the wild with the +4 not landing in the counted
points; any mFlee carrying monFled=true on a non-flee kind
(monster-commitment violation); any hurt-return misfire; any
ambush death missing from fallen; any dark re-verify (v3) step
failing; any transcript passage senseless, robotic, or
self-contradictory; a stuck helper waiting silently in a finale
(Fix C failing in the wild); an offered seat withdrawing (sticky
offer failing in the wild); a "holds and watches" cluster that
reads as a stuck record (Fix B volume failing in the wild); a
pocket_sand held but never pressed in a losing window where the
scholar fled instead; a bond proposal that fires from a roster
(villagers proposing to people they never perceived); a refusal
line repeating verbatim within one branch across days (refusal
variety regression).

BINDINGS (pilot-scaled from r156; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal /
  survived — r156 revision).
- M2-census: every census fight carries a named outcome; >=2/3 Arm
  A waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r156).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing or a
  named fallback; 89704 is experimental (r156 prereg) — the
  fallback/vacuous reading applies to the forcedrift seed's relay
  voicing, not to a control comparison.
- M10-fullseat-gap: every sitting seed's full-seat gap is named
  (r130 revised rule: seat-kind pass — lesser despite full bars
  met is a named gap, not NO-GO). THIS RUN: a sitting seed whose
  only missing full-seat piece is the capstone passes M10 with the
  gap named "capstone not delivered (no bot policy delivers one)".
- M11-standing-peak: standing peak reported for 5/5 seeds.
- FIRENARR/HURTRETURN-captured: every pilot JSON carries firenarr
  + hurtreturn arrays (instrument health; counts descriptive).
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check.
- CORPUS-PURITY (gating, from r129/r130): pilot JSON summaries
  match pilot log summaries seed-for-seed (summary PROJECTIONS, not
  file-vs-log equality — r135 correction); zero diagnostic files
  in the pilot dir.
- L-PEAK (NEW, ladder): every pilot JSON carries ladderSnapshot
  (stage, peak, counted, byTrack, bundleStages, capstone) and the
  analyzer prints the LADDER section for 5/5 seeds.
- L-VOICE (NEW, descriptive-not-binding): seat-shortfall lines in
  pilot transcripts are counted for ladder naming (ladderLine text
  present when the ladder bar blocks) vs silence/old-feast naming.
  A shortfall that names the OLD feast bar is a same-run
  investigation item.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count, lesser-sit count, ladder peak stages. M3-conversion,
  M4-wave5-or-full, W5-question NO-GO on a closed road are the
  expected road reading, not pilot failures (same reading as
  r121/r124/r128/r130/r131/r135/r140/r143/r144/r147/r152/r156) —
  WITH the instrument-limit revision: the full-seat leg of M4 is
  UNMEASURED this run (no capstone-delivering policy), while the
  wave-5 leg stays judged.

BINDINGS (dark re-verify — a miss is NO-GO, never re-scored mid-run):
- S1-sitter-coda: the re-run v3 walk-out line names Amelia Moon
  (the sitter) with her pronouns, not Bill Palmer.
- S2-dark-holds: the full r158 dark re-run keeps D1–D4/D6 green on
  the new substrate (same steps, same expectations as r138/r140/
  r143/r144/r147/r152/r156; v1a's by-design curdle step stays the
  one expected non-ok).

DARK-PROBE CONTINGENCY (ladder rig): the dark probe's lesserSeat
rig predates the ladder and rigs only the old food bar
(sentimentTaught + feastSurgeUsed); it rigs no ladder input, and
villageLadder() reads the wave ledger / summed track XP / links /
contests — a fresh rigged game may score below the Village 12. If
seat-lesser fails on the new substrate, the run rigs ladder inputs
HONESTLY through the stores villageLadder() reads (track XP via
the npcXp/playerTracks stores, wave ledger via deed records), the
same class as the existing rig setting deeds.wavesFaced directly,
records the rig in the run note, and re-runs. The dark verdicts are
about the dark walk, not the ladder; no ladder rule is bypassed or
loosened — the rig represents a village that earned Village
standing, the same way the existing rig represents one that faced
its waves.

BINDINGS (fix verification — each fix is verified in the wild
from pilot/dark transcripts; a fix failing in the wild is recorded
as a same-run investigation item, not forced):
- V-WAITVARIETY: in every pilot transcript, scanning hold lines in
  order, no two consecutive hold lines are identical (the rotation
  guarantees adjacency variety; a repeat after intervening different
  hold lines is allowed).
- V-FixB: no silent villager turn in any transcript (every 'wait'
  narrated) — carried from r156.
- V-Gorge: no "gorges — 0 kcal gone" line in any transcript —
  carried from r156.
- V-FixC: no stuck helper waits silently in a finale fight when
  the foe is in harry/strike range (help-branch fallback fires) —
  carried from r156 (no case arose there; falls again if none
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
  announced seat fails this binding. The widened detector (r156)
  counts tableWithdrawLine ("The table is withdrawn — for now")
  as the withdrawal it is.
- V-REFUSALVARIETY (standing since r156): within one refusal
  branch, the same villager does not repeat one identical line
  verbatim on different days; variety is deterministic per
  villager+day. A verbatim repeat is a regression investigation
  item.
- V-BONDINIT (DESCRIPTIVE, not a binding): bond proposals in pilot
  transcripts are counted and read; absence is a finding (the
  warmth window may not be reached), not a NO-GO. A proposal to a
  villager the proposer never perceived is a same-run investigation
  item (perception law).

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.) Carried: telemetry baseline re-seed is a panel decision,
not this run's; baseline NOT rolled on a quiet check. The
withdrawn-table question is CLOSED (Steve 2026-11-06 07:06 ruling +
landed sticky fix + proof). The 89704 control question is CLOSED as
a control (it won in r152); it runs as an experimental seed from now
on until a redesigned control is preregistered. The pellet-bearer
question is RULED (Steve 2026-11-07 17:55 CST) with the build
LANDED (2294ef815) + SHIPPED (685dc9ec4). Q4 (exile feast-surge
spend) ANSWERED 2026-11-08 07:03 CST — YES, it counts; implementation
queued with the pellet-reframe build (NOT on this substrate). NEW
this run: the full-seat leg of M4 is unmeasured until a
capstone-delivering policy or the leg-4 calibration panels exist —
the M4 binding text needs that revision for the next run (proposed
here, not applied mid-run).
