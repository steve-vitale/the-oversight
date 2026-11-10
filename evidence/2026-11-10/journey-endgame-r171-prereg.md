# Journey endgame r171 — PRE-REGISTRATION (lane B, 2026-11-10 07:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per r135/r138/r140
precedent.

Run number basis: latest completed Lane B runs are r167 social life,
r168 crisis, r169 succession, r170 succession (closed 7->4, which is
why rotation reads 4); r162 was the last endgame run. This run is r171.

Run-start incidents (infrastructure, not measurement):
- Lock: absent at start. New lock written, run_id 2026-11-10T12:55:32Z.
- Main tree: `git status --short` 0 lines, disk 34% (fail line 85%).
- `git pull --ff-only` FAILED: local master ahead 412 / behind 156 vs
  origin/master (longstanding divergence — local loop landings vs
  Codex PR merges; same standing state as r120/r121/r122/r127/r161/
  r167/r168). Per AGENTS.md push discipline + the r123 prereg rule,
  the pull failure is recorded and the run proceeds on LOCAL master
  7c2591d1f, the same base the ship loop owns. No merge attempted.
- Reaper ran; 11 active trees, cap 16 fine.
- Worktree registration was SLOW (~26 min, 13:02–13:28 UTC): Lane A
  registered journey-deepening concurrently and the registry lock
  serialized both registers; the `git reset --hard` inside `git
  worktree add` is slow on the big repo under heavy load (many sibling
  loops running). Not a failure — registration completed, heartbeat
  13:21:01Z, hbloop every 10 min (pid 23250).

SUBSTRATE: master 7c2591d1f EXACTLY. One tooling build is pre-planned
(the buy-out leg + M2b revision below, §INSTRUMENTS — probe-side
only, zero src/js). Any game fix emerging from the pilot gets its own
proof test and is judged on a post-fix re-run, per the r147 rule, not
claimed from the pre-fix pilot. Probe:
scripts/probe-endgame-r171-20261110.js (r162 probe verbatim EXCEPT
renames r162->r171, evidence dir 2026-11-10/perseed-endgame-r171,
header, + the BUYOUT leg + M2b revision below, flag-gated by
BUYOUT=1 / always-on instrument revision respectively).
Analyzer: scripts/analyze-endgame-r171-20261110.js (r162 analyzer
verbatim EXCEPT input dir, r162->r171, + the M2b print revision +
BUYOUT section + M25 below).
Dark probe: scripts/probe-darktable-r171-20261110.js (r162 dark probe
verbatim EXCEPT renames + outdir). Diagnostics, if any, write ONLY to
perseed-endgame-r171-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r162 SUBSTRATE (525046c1c -> 7c2591d1f, verified by
git log). Probe-policy files (deed-seeking, capable, fullseat-diag,
relaygrey, vetcommit, armorydrive) are UNCHANGED in the range
(verified: git log on those paths is empty) — same probe policy.
Real game-code deltas, attributed:
(a) WAVE5KILL LEVER (203a32775, [needs-eyes]): blooded
    damage/survivability lever for wave-5 kills — pilot GO (6 kills
    from 0) + confirm GO (6 vs 2 control) on fresh band 99867-99882;
    proof 35/0; panel review_required (village-deaths watch). This is
    the big delta for this leg: wave-5 faces/kills are the deedGate
    blocker on 3/5 r162 seeds (w5:0 on 89701/89703/89705), so the lever
    may flip deedGate ok on seeds where the full seat was previously
    unmeasurable. Any headline difference is attributed first to this
    lever before any wider claim.
(b) WIDEDUTY (48c93b22b, [needs-eyes]): medic duty widened to
    trained villagers — duty-held 61%->88%, trained 52% of duty days.
    Directly on the r162 tribute failure: Jorge Silva made his wave-4
    kill d61 on 89704 and died of SICKNESS at home d70, a week before
    deedGateFirstOk d77, leaving 1 living veteran. If wideduty keeps a
    Jorge-class veteran alive to the window, the tribute becomes
    payable. Read descriptively in the pilot (sickness/wound deaths
    with a healer in camp).
(c) HONEST-STAKES (fd9851dc8): arena deaths now counted in
    contestDeathsById — contest death accounting; watch the contest
    tallies, not the fight census.
(d) MELEEFIRST (2b0296ace): melee-first/ranged-fallback slot rule —
    combat; watch fight outcomes descriptively.
(e) CONVERSATION FIXES (r163/r166/r167/r169/r170): coach-repeat,
    askfavor exhaustion, dlg:more dry closer, ask:lately shared news —
    dialogue quality; read by the people check, not a pricing change.
(f) SCALE r126: alien playground kill records the victim in the
    memorial roll (fallen cause 'a stranger'); DEEPENING r120/r122/
    r124 convo fixes — minor, descriptive.
(g) r162's own feast-tooltip fix (1cc46630c) is in the substrate.
The winnability freeze otherwise stands. Any OTHER headline
difference is a same-run investigation item, never a road claim,
and is attributed first to this delta before any wider claim.

BUYOUT POLICY (pass B only — the instrument gap r162 handed to this
run, preregistered here before any scored seed): the r162 instrument
limit was that no probe policy delivers a capstone, so the full seat
was unmeasurable in bot play. r162's metric review proposed the next
run carry a policy that can actually deliver: a tribute-first policy
OR a policy that drives a feast bundle / chartered trade link. This
run takes the bundle road via the DESIGNED Joja path — a probe-side
leg, NOT a game change: the probe drives the SAME
Game.feastBundleBuyOut() the leg-3 Haven panel calls (8000 kcal
straight from the pantry, no feast held), once per run, under a
competent-player rule:
  - Flag: BUYOUT=1 enables the leg (pass B). BUYOUT unset/0 =
    pass A, the pure matched re-run (probe byte-identical to r162
    except renames + read-only pantry/atHaven snapshot below).
  - Each day AFTER oDaily, if no capstone delivered yet and the
    ladder PEAK stage >= 3 (National) and deedGateReady().ok is true
    (the full-seat deed half complete — the capstone is the LAST
    missing piece, r162's rule kept), and no capstone kind reads
    ready, and the feast_embassy blocker is 'no-bundle-feast': the
    probe attempts the buy-out, then re-reads readiness and attempts
    delivery of the first READY kind in r162's priority order
    (feast_embassy -> trade_charter -> military_tribute).
  - The buy rule is the game's own price: buy when the pantry holds
    >= 8000 kcal (the fn's own gate), NO invented margin. A player
    does not invent a safety buffer the game does not price; if the
    drain starves the village before the seat, that is the
    measurement (the buy-out's true price in lives), recorded per
    seed with pantry-after and any starvation deaths named — a
    same-run investigation item, never a mid-run re-score.
  - The buy-out requires the scholar AT Haven (the fn refuses
    otherwise). The leg attempts only when at Haven and records
    atHaven on every attempt day; a window spent away from Haven is
    a named blocker, not a silent skip.
  - Every attempt is recorded: buyoutAttempts[] {day, atHaven,
    pantryKcal, result{ok, why, spent, bundleStage, pantryAfter}}
    and the delivery {day, kind, ...} on success. The probe ALSO
    records pantryKcal + atHaven in the daily deedGate snapshot
    (pass A and B), so the Joja path's affordability is measured
    even where no buy is attempted.
  - The seat flow itself is untouched: the delivery opens the mercy
    window (tableActive holds from delivery); if a bought bundle
    does NOT flip feast_embassy to ready, or a delivered embassy
    does NOT price the full seat, that is a finding, not a metric
    miss.

M2b REVISION (adopted verbatim from r162's metric review, for THIS
run — instrument change, probe-side only): diedInFight is restricted
to the fight's PARTY (open-snapshot non-monster fighters:
villagerId fields + the scholar's id for key 'p'), WITH an explicit
scholar-death read alongside (scholarDiedInFight: scholar in party
AND scholar dead at close — a solo scholar death must still read
vDie). The old roster-wide day-window list is kept as
diedDayWindow for audit. dieFlag and the vDie outcome read the
party list. The analyzer's M2b print carries diedParty +
scholarDiedInFight. Rationale: r162's only dieFlag fight (89702 d84
eater) listed home deaths (sickness/starvation) in a solo-scholar
fight; the party list reads [scholar] and the causal record should
name the scholar's fight-causal death.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 5 pre-registered seeds):
89701 (waves), 89702 (waves), 89703 (waves), 89704 (forcedrift,
experimental ex-control), 89705 (wavesnw). Plan is keyed by seed
value in the probe, so the subset keeps correct plans. Seed reuse
is DELIBERATE (matched before/after per the r118/r135/r140/r143/
r144/r147/r152/r156/r158/r162 precedent: same seeds, same probe
policy, only the game code changed) — no fresh band is needed or
claimed for the pilot. TWO PASSES on the same 5 seeds: pass A
(CAPSTONE unset, BUYOUT unset — matched re-run) then pass B
(CAPSTONE=1 BUYOUT=1 — capstone delivery + buy-out). Pass A runs
first so its trajectories are the clean matched comparison; pass B's
trajectories diverge only from the first buy/delivery day onward.

R162 PILOT BASELINE (per-seed, from the r162 run note; judged on
these seeds, pass A):
- 89701 waves: WON LESSER — announced d90, sat d115, feared/light,
  final:pledge, alive 9, pantry 14460 at end. 0 wave-4 kills
  counted? (census 5 fights, 0 vKill; ladder counted 82, peak
  stage 3). deedGate never ok (w5:0). Pantry fat — buy-out
  affordable IF the deed half ever completes.
- 89702 waves: village-LOST d84 (starvation d13, Paparazzo contest
  death d14, alien d25, wound fever d80, last two died of sickness
  + starvation at home d84 while the scholar died alone vs an eater).
  0 alive, never announced. peakLivingVeterans 2 (d69 release:
  gen_64epxvu + visjoin_61). Pantry 4000 at end.
- 89703 waves: WON LESSER — announced d90, sat d92, beloved/light,
  final:audience, alive 4. 2 living veterans at peak
  (gen_qqe5aer + visjoin_72). deedGate never ok (w5:0). Pantry
  3089 at end.
- 89704 forcedrift (experimental, ex-control): WON LESSER —
  announced d90, sat d90, relay/dark, final:voice, alive 6.
  deedGateFirstOk d77; 2 living veterans at d61 release
  (jorge_silva + sanne_bakker) but Jorge died of SICKNESS d70 —
  the tribute failed on 1 living veteran at the window. Pantry
  1500 at end. PRIME pass-B candidate IF wideduty keeps Jorge
  alive OR the pantry reaches 8000 in-window for the buy-out.
- 89705 wavesnw: WON LESSER — announced d90, sat d92, feared/light,
  final:pledge, alive 9, pantry 9084 at end. 1 living veteran
  (onni_korhonen). deedGate never ok (w5:0).
Tally r162: lesser 4/5, full 0/5, wave-5 unlocked 2/5 (89702,
89704), faced 2/5. M3-conversion NO-GO (armB kills 1 vs armA 5).

R171 QUESTIONS: (1) pass A: does the pilot reproduce r162 modulo
the named deltas (a)-(g)? (2) does the wave5kill lever (a) flip
w5:0 to faces/kills on 89701/89703/89705 and deedGate ok on more
seeds — the lever's own pilot said 6 kills from 0? (3) does
wideduty (b) keep a Jorge-class veteran alive — sickness/wound
deaths with a healer in camp, cure events in the transcripts?
(4) pass B: does the buy-out fire (pantry >= 8000 in-window, at
Haven?) and open the FULL seat — the first full-seat win in bot
play? (5) does tribute fire on any seed where 2 veterans live to
the window? (6) does the M2b party restriction classify fights
correctly — the r162-style day-window fight now reads [scholar]?
(7) dark re-verify: re-run the FULL dark probe as r171 (all 7
variants, same policy, fresh evidence dir
perseed-endgame-r171-dark/) and confirm the v3 walk-out line names
Amelia Moon, not Bill Palmer, and D1–D4/D6 still hold on the new
substrate. (8) people check: do the sitting seeds' finales read as
people — and if pass B sits a FULL seat, does the full-seat finale
read as earned, not a default? (9) pellet rads (descriptive only):
any rads death / cure voicing? The probe carries no rads field —
the gap is carried, not fixed here. (10) do the (a)/(b)/(d) deltas
move wave-4 kill conversion (M3 tally kept), survivability, or
competence in the pilot? (11) the diag-layer staleness blank from
r158 (fullseat-diag.js still decomposes the full seat with the
PRE-ladder gate) — carried, owed to the ladder coordinator / leg 4,
not changed here; the probe's own deedGate snapshot is the honest
read.

INTERESTING FINDING (what would count): any pass-A-vs-r162 headline
difference other than the named deltas; any FULL-SEAT win in pass B
(the run's headline question); a buy-out that fires (pantry, day,
spent, pantry-after named); a buy-out that starves the village
before the seat (the Joja price in lives); a tribute delivery with
veterans paid; a wave-5 kill on a previously w5:0 seed (the lever
landing in the wild); a Jorge-class veteran surviving sickness to
the window on the wideduty substrate; a capstone delivery that
refuses despite readiness (leg-3 agreement failure); a delivered
capstone that does NOT price the full seat (tableSeat/capstone
wiring failure); a bought bundle that does NOT flip feast_embassy
to ready (bundle-flag wiring failure); a pantry that never reaches
8000 in-window on any seed (the Joja path priced out of bot reach);
an M2b party-restriction misclassification (instrument regression —
FAIL LOUDLY); a pellet lock recurring (regression, FAIL LOUDLY in
chat); a rads death with no voicing; a cure that fires with no
voicing (medic duty silent); a ladder shortfall line that names the
OLD feast bar or stays silent where the ladder bar is the blocker;
a bundle completing in the wild with the +4 not landing in the
counted points; any mFlee carrying monFled=true on a non-flee kind
(monster-commitment violation); any hurt-return misfire; any ambush
death missing from fallen; any dark re-verify (v3) step failing;
any transcript passage senseless, robotic, or self-contradictory; a
stuck helper waiting silently in a finale; an offered seat
withdrawing (sticky-offer failing in the wild); a "holds and
watches" cluster that reads as a stuck record; a pocket_sand held
but never pressed in a losing window where the scholar fled instead;
a bond proposal that fires from a roster (villagers proposing to
people they never perceived); a refusal line repeating verbatim
within one branch across days (refusal variety regression).

BINDINGS (pilot-scaled from r162; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal /
  survived — r156 revision). Judged on pass A; pass B reported
  alongside.
- M2-census: every census fight carries a named outcome; >=2/3 Arm
  A waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r162).
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
  or "capstone: <kind> delivered d<day>" (pass B), or "buy-out:
  pantry <8000 in-window" where the Joja path was the blocker.
  The r158 revision (capstone-only gap) is kept.
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
- M23-CAPSTONE (binding, pass B only, as r162): for every pass-B
  seed where deedGateReady().ok is true AND ladder peak >= 3 at any
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
- M24-TRIBUTE-AGREEMENT (binding, pass B only, conditional, as
  r162): if military_tribute is delivered on any seed, the readiness
  veteran count at delivery equals the veterans paid (leg-3 fix
  (c) — scholar excluded on both sides). GO iff equal on every
  tribute delivery; vacuous if no tribute delivery fires.
- M25-BUYOUT (NEW, binding, pass B only): for every pass-B seed
  where the in-window daily snapshot (peak >= 3 AND deedGate ok
  AND no bundle done) shows pantryKcal >= 8000 AND the scholar at
  Haven, the probe records a buy-out attempt that day. GO iff
  attempts cover every such day (no silent skip) AND every attempt
  result is recorded with ok/why/spent. VACUOUS if no such day on
  any seed (recorded as such, not GO — the Joja path stays
  unmeasured and the pantry/atHaven blocker is named per seed).
  A failed buy-out (pantry-short refusal despite the snapshot
  saying >= 8000) is a same-run investigation item, not a silent
  pass.
- M2b-attribution (REVISED RULE, this run): every party-restricted
  dieFlag fight is classified causal-vs-daywindow; >=1 dieFlag
  fight (if any exist) carries >=1 NAMED fight-causal death.
  NO-DATA if no dieFlag fights. The party list is the diedInFight
  read; diedDayWindow is printed alongside for audit.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  w5kills count (NEW — the wave5kill lever's own tally), full-seat
  count, lesser-sit count, ladder peak stages, capstone deliveries
  by kind, buy-outs by seed. M3-conversion, M4-wave5-or-full,
  W5-question NO-GO on a closed road are the r135 tallies, kept
  per pass.

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M3-conversion: kept from r162 (armB-vs-armA kill tally).
- M23/M24: kept from r162.
- M25: new this run; if vacuous, the revision for the next run is
  a buy-out policy that attempts earlier (e.g. on peak>=3 without
  the deedGate condition) or a tribute-first policy that banks a
  second living veteran — proposed, not applied mid-run.
- M2b: revised this run per r162's proposal; if the party
  restriction misclassifies a real fight death, the revision for
  the next run is to widen the party read (e.g. include
  late-joining fighters from lastSnap) — proposed, not applied
  mid-run.

AMENDMENT A1 (pre-pilot, smoke evidence — M24 formulation fix):
The r162 M24 (readiness veteran count == veterans paid) misfires on
a CORRECT delivery whenever more than 2 veterans are on hand: the
smoke-B run (89704, 120d) delivered military_tribute d77 with 4
living veterans on hand (readyVeterans 4) and paid 2 (Jorge Silva +
Henrik Lien) — correct behavior, since the delivery pays the FIRST 2
in waveKillLog order. The old equality conflates "veterans on hand"
with "veterans paid". REVISED M24 (binding, pass B only): if
military_tribute is delivered, the delivery paid exactly `need`
veterans AND readiness at delivery was >= need (onHand >= need,
paid == need). The probe now records readyNeed on the delivery.
The scholar-exclusion substance (leg-3 fix) is unchanged — both
sides exclude the scholar by construction. This amendment is made
BEFORE any scored seed, on smoke evidence only; the pilot judges
the revised M24.

AMENDMENT A2 (pre-pilot — Steve ruling arrived mid-run, 2026-11-10
07:39 CST): SCHOLAR COUNTS AS A VILLAGER — "the player character
(the scholar) is part of the village, and their wave kills count
toward the village's living-veteran bar, same as any villager's.
The 'scholar drain' was a defect, not a design question. Fix
direction: count scholar kills in the veteran bar." Source: the
sim-scholardrain-b quantification (merged): 10/17 wave-4 kills made
as scholar never counted; 2 seeds had ALL kills as scholar (counter
at zero); Valeria Quispe's 4 kills d90–112 moved nothing. The fix
location is `_ladderLivingVeterans` (ladder.js — the tribute
readiness count, which NEVER counts the scholar today); the wave-5
release bar (waveCombatReadiness, standing.js) already counts the
scholar. This run does NOT build the fix: the sibling loop
sim-vetcount-b (oversight-flesh-out-loop-b, "reconcile veteran
counter with kill log #2077") is ACTIVE on it right now (heartbeat
fresh at run start) and owns the lane — building it in parallel
would collide. This run therefore measures the PRE-fix substrate
(the matched re-run the prereg promises), and the pilot watches
for the drain pattern per seed (tribute blocked where the second
killer is the scholar). If the vetcount fix lands on master during
this run, the closeout rebase picks it up per normal discipline and
the run note says so plainly; the fix's endgame effect is measured
by the NEXT endgame run, not by re-running this pilot mid-run.
The ruling also sharpens the M24 question for that next run: once
readiness counts the scholar, a scholar+1-villager village reads
ready while delivery (2 non-scholar payable) refuses — the r158
agreement gap in a new form — and the next run's prereg must say
how readiness and delivery are to agree under the ruling.
