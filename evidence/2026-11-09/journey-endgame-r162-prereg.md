# Journey endgame r162 — PRE-REGISTRATION (lane B, 2026-11-09 03:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per r135/r138/r140
precedent.

Run number basis: latest completed Lane B runs are r159 social life
(2026-11-08, merged db7fb1c6a) and r161 succession (merged ed8f37560);
the r158 endgame adoption gate was itself labelled r159 in its note
but the social-life run holds the r159 number on master, so this run
is r162. Rotation file read 4: consistent with succession r161
closing 7->4. (r158's note claimed 4->5 at its closeout; the file
reads 4 now because legs 5/6/7 ran since and cycled back. No
discrepancy to chase.)

Run-start incidents (infrastructure, not measurement):
- Lock: absent at start. New lock written, run_id r20261109T085634Z.
- Main tree: `git status --short` 0 lines, disk 27% (fail line 85%).
- `git pull --ff-only` FAILED: local master ahead 202 / behind 156 vs
  origin/master (longstanding divergence — local loop landings vs
  Codex PR merges). Per AGENTS.md push discipline (divergent
  histories: STOP, do not rebase/merge/force-push in the main tree),
  the pull failure is recorded and the run proceeds on LOCAL master
  525046c1c, the same base the ship loop owns. No merge attempted.
- Reaper ran; 4 active trees (build-ladder-leg4-baseline,
  journey-deepening, sim-medheadcount-a, sim-sitdrive-winseek-b),
  cap 16 fine.
- Worktree registration was SLOW (~7 min, git reset --hard inside
  `git worktree add` on the big repo) but completed; heartbeat
  09:03:39Z, re-heartbeated 09:08Z.

SUBSTRATE: master 525046c1c EXACTLY. One tooling build is pre-planned
(the capstone-delivery probe leg, §CAPSTONE POLICY below — probe-side
only, zero src/js). Any game fix emerging from the pilot gets its own
proof test and is judged on a post-fix re-run, per the r147 rule, not
claimed from the pre-fix pilot. Probe:
scripts/probe-endgame-r162-20261109.js (r158 probe verbatim EXCEPT
renames r158->r162, evidence dir 2026-11-09/perseed-endgame-r162,
header, + the capstone-delivery leg below, flag-gated by CAPSTONE=1).
Analyzer: scripts/analyze-endgame-r162-20261109.js (r158 analyzer
verbatim EXCEPT input dir, r158->r162, + the CAPSTONE section below).
Dark probe: scripts/probe-darktable-r162-20261109.js (r158 dark probe
verbatim EXCEPT renames + outdir). Diagnostics, if any, write ONLY to
perseed-endgame-r162-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r158 SUBSTRATE (4fe571095 -> 525046c1c, verified by
git log). Probe-policy files (deed-seeking, capable, fullseat-diag,
relaygrey, vetcommit, armorydrive) are UNCHANGED in the range
(verified: git log on those paths is empty) — same probe policy.
Real game-code deltas, attributed:
(a) PELLET RADIATION REWORK (landed, [needs-eyes]): boost costs rads
    (pantry draws out), endDay rad tick, cure hooks (cure-drop +
    status word), lastBoostDay reads scholar.day. The pellet reframe
    Steve ruled 2026-11-08 is now the substrate: free food + boost
    still works, overuse poisons the bearer's health, passing the
    pellet does not pass the poisoning, and there is a cure.
(b) HAVEN MEDIC DUTY (landed d910dc6da, [needs-eyes]): medicDutyTick
    at dawn, departure blocks, holder tends first + sickest, A2 cure
    channels (healing ability via npcHasAbility + canon cure table;
    medicine from Haven stash pharmacy). Roster medics can now CURE,
    not just tend — Steve's 2026-11-08 ruling. Panel verdict NO-GO
    on its own G1a bar (23.5% vs 30%) but the build landed; this
    pilot reads its endgame effect descriptively.
(c) LADDER leg 3: tribute readiness counts NON-SCHOLAR veterans only
    (readiness now agrees with delivery — the r158-known KNOWN GAP
    is closed); cash-out + bank; overtime interval stretch;
    Respected Village ending entry + validator special case.
(d) DOUBLE-NIGHT FIX (ff252c1ac): endDay death branch falls through
    to shared day-advance + dawn (no more double-night); proof 65/65.
(e) TABLE-ENDINGS +50 (table-endings.json): new/expanded ending
    entries — read by the people check, not a pricing change.
(f) metaProgression.js NEW (+323): meta progression layer — read
    before judging any meta-note voicing in the people check.
(g) fieldFights.js +51, game.js +243, villager-agency.js +29,
    villager-objectives.js +21, feastBuff.js +255 (pellet leg),
    statusEffects.js, food.js, overtime.js, app.js +87 — the
    (a)-(f) builds' footprint; no other gate, price, deed, seat, or
    table change in the range beyond the named builds. The
    winnability freeze otherwise stands. Any OTHER headline
    difference is a same-run investigation item, never a road claim,
    and is attributed first to this delta before any wider claim.

CAPSTONE POLICY (pass B only — the instrument gap r158 handed to
this run, preregistered here before any scored seed): the r158
instrument limit was that no probe policy delivers a capstone, so
the full seat was unmeasurable in bot play. This run closes it with
a probe-side leg, NOT a game change: the probe drives the SAME
Game.ladderDeliverCapstone(kind) the leg-3 Haven panel calls
(app.js panelHaven), once per run, under a competent-player rule:
  - Flag: CAPSTONE=1 enables the leg (pass B). CAPSTONE unset/0 =
    pass A, the pure matched re-run (probe byte-identical to r158
    except renames + read-only deedGate snapshot below).
  - Each day AFTER oDaily, if no capstone delivered yet and the
    ladder PEAK stage >= 3 (National) and deedGateReady().ok is true
    (the full-seat deed half complete — all wave bars, contests,
    crises, stage, food thesis, national/global scale), the probe
    attempts delivery of the first READY capstone in priority order:
    feast_embassy (free) -> trade_charter (free) ->
    military_tribute (pays 2 living non-scholar veterans).
  - The deedGateReady().ok condition is the competent-player rule:
    the capstone is the LAST missing piece. A player does not pay
    two veterans while wave-5 faces are still unbanked — the
    veterans are the wave-5 readiness bar. Delivery before the deed
    half completes would confound the matched tally and is not
    competent play.
  - Every attempt is recorded: capstoneAttempts[] {day, kind,
    readyKinds[], deedGateOk, result{ok, reason, veterans, names}}
    and the delivery {day, kind, veteransPaid, names} on success.
    A refusal (e.g. veterans-short despite readiness) is recorded
    verbatim and is a same-run investigation item — readiness and
    delivery must agree after leg 3 (c).
  - The probe ALSO records a read-only deedGate snapshot daily once
    peak >= 3 (pass A and B): deedGate {ok, short[]} + per-kind
    readiness {kind, ready, reason}. Pass A carries the snapshot
    with the leg disabled, so the full-seat gap is named honestly
    even where no delivery happens.
  - The seat flow itself is untouched: the policy sits when its
    guard says sit; tableSeat() prices full only when deedGate ok +
    peak >= 3 + capstone delivered. If a delivered capstone does
    NOT flip the priced seat to full, or the policy sits lesser
    despite a full price, that is a finding, not a metric miss.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 5 pre-registered seeds):
89701 (waves), 89702 (waves), 89703 (waves), 89704 (forcedrift,
experimental ex-control), 89705 (wavesnw). Plan is keyed by seed
value in the probe, so the subset keeps correct plans. Seed reuse
is DELIBERATE (matched before/after per the r118/r135/r140/r143/
r144/r147/r152/r156/r158 precedent: same seeds, same probe policy,
only the game code changed) — no fresh band is needed or claimed
for the pilot. TWO PASSES on the same 5 seeds: pass A (CAPSTONE
unset — matched re-run) then pass B (CAPSTONE=1 — capstone
delivery). Pass A runs first so its trajectories are the clean
matched comparison; pass B's trajectories diverge only from the
delivery day onward.

R158 PILOT BASELINE (per-seed, from the r158 run note; judged on
these seeds, pass A):
- 89701 waves: village-LOST (scattered d73, 1 alive), never
  announced, never sat. 2 wave-4 kills, standing peak 199, ladder
  counted 43, peak stage 3. Pellet: surge spent d17 + d29.
- 89702 waves: WON LESSER — announced d90, sat d95, feared/light,
  final:pledge, alive 4. 2 wave-4 kills, standing peak 501, ladder
  counted 57. Wave 5 FACED twice (Timeslot d83, Editor d90);
  fullseatMax w5:2, contests 8, crises 3, stage 3 — the deed half
  may already have been complete in r158; the ONLY missing piece
  may have been the capstone. PRIME pass-B candidate.
- 89703 waves: WON LESSER — announced d96, sat d102, defiant/light,
  final:walk, alive 10. 1 wave-4 kill, standing peak 199, ladder
  counted 77. fullseatMax w5:0 — deed half incomplete (no wave-5
  faces). Scholar exiled all run; seat came anyway (ladder).
- 89704 forcedrift (experimental, ex-control): WON LESSER —
  announced d90, sat d90, relay/dark, final:voice, alive 8.
  Wave-5 unlocked (release d80, 2 veterans) but never faced
  (fullseatMax w5:0). Ladder counted 68.
- 89705 wavesnw: WON LESSER — announced d90, sat d91, feared/light,
  final:mercy, alive 6. 2 wave-4 kills (Diana, Reunions d83+d88),
  standing peak 642, ladder counted 61. fullseatMax w5:1.
Tally r158: lesser 4/5, full 0/5, wave-5 unlocked 3/5, faced 2/5.
M3-conversion NO-GO (armB kills 3 vs armA kills 6).

R162 QUESTIONS: (1) pass A: does the pilot reproduce r158 modulo
the named deltas (a)-(g)? (2) pass B: does a delivered capstone
open the FULL seat in bot play — and on which seed, which kind, at
what price? (3) does the pellet lock recur on 89702 under the rads
rework (a recurrence is a regression); does the rads cost change
surge spending (surgeDay/spends per seed)? (4) does medic duty
change endgame survivability — wound-fever deaths with/without a
healer in camp, cure events in the transcripts? (5) does tribute
readiness agree with delivery now (leg-3 fix (c)) — any
veterans-short refusal despite readiness is a regression? (6) does
the double-night fix (d) change any death accounting (sit-day
deaths, end-of-run death tallies)? (7) dark re-verify: re-run the
FULL dark probe as r162 (all 7 variants, same policy, fresh
evidence dir perseed-endgame-r162-dark/) and confirm the v3
walk-out line names Amelia Moon, not Bill Palmer, and D1–D4/D6
still hold on the new substrate. (8) people check: do the sitting
seeds' finales read as people — and if pass B sits a FULL seat, does
the full-seat finale read as earned, not a default? (9) bond
initiation in the wild (descriptive only, carry from r158)? (10) do
the (a)/(b)/(e) deltas move wave-4 kill conversion (M3 tally kept),
survivability, or competence in the pilot? (11) the diag-layer
staleness blank from r158 (fullseat-diag.js still decomposes the
full seat with the PRE-ladder gate) — carried, owed to the ladder
coordinator / leg 4, not changed here; the probe's own deedGate
snapshot is the honest read.

INTERESTING FINDING (what would count): any pass-A-vs-r158 headline
difference other than the named deltas; any FULL-SEAT win in pass B
(the run's headline question); a capstone delivery that refuses
despite readiness (leg-3 agreement failure); a delivered capstone
that does NOT price the full seat (tableSeat/capstone wiring
failure); a pellet lock recurring on 89702 (regression, FAIL LOUDLY
in chat); a rads death (bearer poisoned to death by boosts) with no
voicing; a cure that fires with no voicing (medic duty silent);
a ladder shortfall line that names the OLD feast bar or stays silent
where the ladder bar is the blocker; a bundle completing in the wild
with the +4 not landing in the counted points; any mFlee carrying
monFled=true on a non-flee kind (monster-commitment violation); any
hurt-return misfire; any ambush death missing from fallen; any dark
re-verify (v3) step failing; any transcript passage senseless,
robotic, or self-contradictory; a stuck helper waiting silently in a
finale; an offered seat withdrawing (sticky-offer failing in the
wild); a "holds and watches" cluster that reads as a stuck record;
a pocket_sand held but never pressed in a losing window where the
scholar fled instead; a bond proposal that fires from a roster
(villagers proposing to people they never perceived); a refusal line
repeating verbatim within one branch across days (refusal variety
regression); the two-Reunions-one-display-name wart from r158
(89705 war path naming both kills "The Loud Beast") recurring.

BINDINGS (pilot-scaled from r158; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal /
  survived — r156 revision). Judged on pass A; pass B reported
  alongside.
- M2-census: every census fight carries a named outcome; >=2/3 Arm
  A waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r158).
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
  gap named "capstone not delivered (pass A: no delivery policy)"
  or "capstone: <kind> delivered d<day>" (pass B). The r158
  revision (capstone-only gap) is kept.
- M11-standing-peak: standing peak reported for 5/5 seeds.
- FIRENARR/HURTRETURN-captured: every pilot JSON carries firenarr
  + hurtreturn arrays (instrument health; counts descriptive).
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check.
- CORPUS-PURITY (gating, from r129/r130): pilot JSON summaries
  match pilot log summaries seed-for-seed (summary PROJECTIONS, not
  file-vs-log equality — r135 correction); zero diagnostic files
  in the pilot dir. Judged per pass (A and B each pure).
- L-PEAK: every pilot JSON carries ladderSnapshot (stage, peak,
  counted, byTrack, bundleStages, capstone) and the analyzer prints
  the LADDER section for 5/5 seeds.
- L-VOICE (descriptive-not-binding): seat-shortfall lines in pilot
  transcripts are counted for ladder naming (ladderLine text
  present when the ladder bar blocks) vs silence/old-feast naming.
  A shortfall that names the OLD feast bar is a same-run
  investigation item.
- M23-CAPSTONE (NEW, binding, pass B only): for every pass-B seed
  where deedGateReady().ok is true AND ladder peak >= 3 at any
  daily read, the probe records a delivery attempt and, if a
  capstone kind reads ready, a successful delivery with the kind
  and price named. GO iff attempts == deliveries on all such seeds
  (no refusal despite readiness) AND tableSeat() prices 'full' on
  at least one seed where delivery succeeded and the seat was
  subsequently offered. NO-GO names the failing seed and the exact
  refusal/pricing gap. If NO pass-B seed ever reaches
  deedGateReady().ok && peak >= 3, M23 is VACUOUS (recorded as
  such, not GO — the full-seat question stays unmeasured and the
  blocking deed bar is named per seed).
- M24-TRIBUTE-AGREEMENT (NEW, binding, pass B only, conditional):
  if military_tribute is delivered on any seed, the readiness
  veteran count at delivery equals the veterans paid (leg-3 fix
  (c) — scholar excluded on both sides). GO iff equal on every
  tribute delivery; vacuous if no tribute delivery fires.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count, lesser-sit count, ladder peak stages, capstone
  deliveries by kind. M3-conversion, M4-wave5-or-full, W5-question
  NO-GO on a closed road are the r135 tallies, kept per pass.

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M3-conversion: kept from r158 (armB-vs-armA kill tally).
- M23/M24: new this run; if vacuous, the revision for the next run
  is a capstone policy that delivers earlier (e.g. on peak>=3
  without the deedGate condition) or a probe that drives wave-5
  faces directly — proposed, not applied mid-run.
