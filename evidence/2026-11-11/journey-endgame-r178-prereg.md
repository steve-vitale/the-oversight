# Journey endgame r178 — PRE-REGISTRATION (lane B, 2026-11-11 02:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 7 at run start (r177 succession, closed
by adoption in this same run — see journey-succession-r177.md closeout
addendum); this run plays leg 4 and writes 5, social life, at closeout
ONLY after a verified landing — a failed or partial run does not advance
the leg, per r135/r138/r140 precedent.

Run number basis: latest completed Lane B runs are r171 endgame, r176
crisis, r177 succession (adopted closeout, this run). This run is r178.

Run-start incidents (infrastructure, not measurement):
- Lock: STALE-LOCK RECOVERY, then adoption ABORTED. Lock
  `2026-11-11T05:55:28Z` (r177's run) present; registry heartbeat
  for journey2-succession 07:00:21Z, 55 min stale at run start; no
  node processes; last file write 07:35:56Z (checkquick log,
  truncated mid-run — the gate exec was SIGTERMed at ~137s, the
  same wall that killed this run's first gate attempt). Per the
  overlap guard the run read DEAD; lock deleted, this run's lock
  written (run_id 2026-11-11T07:57:15Z). Adoption of r177's closeout
  began (gate re-run detached, completed 294 passed / 6 failed in
  583s, adjudicated below) — and then the r177 coordinator PROVED
  ALIVE: it committed 35ba9c2e9 at 07:57:15Z (the exact second this
  run wrote its lock) and 7334c4e2f at 08:00:18Z, both after this
  run's start. Heartbeat staleness again proved NOT to be death
  (AGENTS.md lesson). Adoption STOPPED at the gate: no commit, no
  merge, no release, no rotation write by this run for r177. The
  completed gate log sits in r177's tree (checkquick.log, modified,
  uncommitted) for its coordinator's closeout; the 6 failures are
  the exact standing classes r171 adjudicated (proof-update +
  workflow base staleness, mobile-combat-cadence Continue wrap,
  occupation-panels CLI, phone-frame-proof stale receipt,
  establishment-r20-fixes racks-full voice) — no new failure class,
  zero src/js changed by r177. r177's closeout (merge, release,
  rotation 7->4, lock) is its coordinator's job; this run plays leg
  4 only. At this run's closeout the rotation file is read fresh:
  if it reads 4 (r177 advanced it), this run writes 5; if it still
  reads 7, this run writes 5 anyway (leg 4 is played either way —
  the file names the NEXT leg) and notes the overwrite risk if
  r177's coordinator later writes 4 over it.
- Main tree: `git status --short` 0 lines, disk 38% (fail line 85%).
- `git pull --ff-only` FAILED: standing divergence (local master ahead
  524 / behind 156; reconciliation pending since Nov 8) — proceeded on
  local master per r156/r164/r168/r176/r177 precedent, no push, no bump.
- Reaper ran; worktree-register for journey2-endgame slow (registry
  serialization under sibling load), completed.
- Exec wall: foreground/background execs are SIGTERMed at ~137s in this
  session (killed r177's gate and this run's first gate attempt).
  Long jobs (gate, pilot passes) run NOHUP-DETACHED with log polling.
  Recorded here so the next run doesn't re-learn it.

SUBSTRATE: master 5a9f0ed0c EXACTLY. One tooling change is pre-planned
(the pass-C buy-out-early leg below, probe-side only, zero src/js). Any
game fix emerging from the pilot gets its own proof test and is judged
on a post-fix re-run, per the r147 rule, not claimed from the pre-fix
pilot. Probe: scripts/probe-endgame-r178-20261111.js (r171 probe
verbatim EXCEPT renames r171->r178, evidence dir
2026-11-11/perseed-endgame-r178, header, + the pass-C leg below).
Analyzer: scripts/analyze-endgame-r178-20261111.js (r171 analyzer
verbatim EXCEPT input dir, r171->r178, + pass-C section + M24b below).
Dark probe: scripts/probe-darktable-r178-20261111.js (r171 dark probe
verbatim EXCEPT renames + outdir). Diagnostics, if any, write ONLY to
perseed-endgame-r178-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r171 PILOT SUBSTRATE (7c2591d1f -> ec7335bd7,
verified by git log). Probe-policy files (deed-seeking, capable,
fullseat-diag, relaygrey, vetcommit, armorydrive) are UNCHANGED in the
range (verified: git log on those paths is empty) — same probe policy.
Real game-code deltas, attributed:
(a) SCHOLARCOUNTS (3995d21d6, [needs-eyes]): Steve RULED 2026-11-10 —
    the scholar counts as a villager; _ladderLivingVeterans counts the
    living scholar (mirrors standing.js); payable (non-scholar) count
    added to the tribute readiness return; delivery still pays 2
    non-scholar veterans and refuses honestly with scholar+1. THIS IS
    THE HEADLINE DELTA: the first endgame measurement on the
    post-fix substrate. The r171 pilot measured the PRE-fix substrate
    (tribute blocked where the second killer was the scholar). Expect
    readiness to flip on seeds where the scholar holds a wave-4 kill;
    delivery still refuses scholar+1 — the M24/M24b question below.
(b) ROLEFORM (e5c19e54e): role-formation first numbers — roles form
    from lived experience (competence moves with practice, skill
    builds from zero). r171's M2b v2 run on this substrate already
    showed seed 89702 playing out differently (village survives past
    d56; 5 census fights, not 9; scholar deaths d47/d48/d60 instead
    of d54/d56). Trajectory moves on 89702 are EXPECTED and attributed
    here first, not treated as surprises.
(c) FIGHTPLAY FIXES (7118cff4c + b14582845): ammo lookup
    (Scattering.equipment), gate-join, party-x-wave tables — combat
    facing; watch fight outcomes descriptively. Fight-play census GO
    (band 180225-180232); all agency fights on master are still
    conjured (conjurefix-retune NO-GO, branch held, NOT landed).
(d) CONVERSATION FIXES (r176 crisis F1-F4, r130 scale, r125 landing):
    party-role death release, settled-debt deflect, already-held role
    line, resume-quote silence/bridge filter, trust-amount naming,
    aid-beg says, book notes, personal-bridge pool 2->6 — dialogue
    quality; read by the people check, not a pricing change.
(e) FIRST-NUMBERS SYSTEMS (garden, fishfirst, trapfirst, travelfirst,
    standing199 DIAG): new coverage, no endgame pricing change;
    descriptive only.
(f) CONJUREFIX-RETUNE (ec7335bd7, evidence only): judged NO-GO,
    branch held, src/js does NOT land — no game-code effect.
(g) FEASTFIRST/TRADEFIRST (b344a67a5, 2312553d6, 5a9f0ed0c):
    feast/tribute + trade/market first numbers — evidence + scripts
    only, ZERO src/js in the range (verified: git diff
    ec7335bd7..5a9f0ed0c -- src/ empty). No endgame pricing change;
    descriptive only.
The winnability freeze otherwise stands. Any OTHER headline
difference is a same-run investigation item, never a road claim,
and is attributed first to this delta before any wider claim.

PASS-C BUY-OUT-EARLY POLICY (pass C only — r171's metric-review
proposal, adopted here before any scored seed): the r171 M25 was
VACUOUS twice (no in-window day with pantry >= 8000 at Haven and
nothing ready). The proposed revision was a buy-out policy that
attempts earlier. This run tests it as a THIRD pass, leaving passes
A/B matched to r171: pass C runs CAPSTONE=1 BUYOUT=1
BUYOUT_EARLY=1. The early leg attempts the buy-out on any day with
ladder PEAK stage >= 3 AND no bundle done AND pantryKcal >= 8000
AND the scholar at Haven — WITHOUT requiring deedGateReady().ok
(the bundle is itself a deed; buying it early banks the
feast_embassy capstone readiness before the deed half completes).
Delivery attempts follow pass B exactly (first READY kind in r162
priority order). The buy rule is still the game's own price (8000
kcal, no invented margin); if the drain starves the village before
the seat, that is the measurement, recorded per seed with
pantry-after and any starvation deaths named. Every attempt is
recorded in buyoutAttempts[] as in pass B; the daily snapshot
carries pantryKcal + atHaven on all passes. The seat flow itself
is untouched.

M24 REVISION (from r171 Amendment A2 — preregistered here, per A2's
own demand that the next run's prereg say how readiness and delivery
agree once readiness counts the scholar): readiness now counts the
living scholar toward the 2-veteran bar; delivery still pays 2
NON-scholar veterans and refuses honestly with scholar+1. Two
metrics carry the agreement:
- M24 (revised, binding, pass B and C): if military_tribute is
  delivered, the delivery paid exactly `need` veterans AND readiness
  at delivery was >= need (readiness counts the scholar per the fix;
  payable is non-scholar). GO iff equal on every tribute delivery;
  vacuous if no tribute delivery fires.
- M24b (NEW, binding, pass B and C): if any seed reaches deedGate
  ok AND peak >= 3 with readiness >= need but payable (non-scholar)
  < need, the probe must record a delivery refusal whose reason
  names the scholar-counted shortfall (the scholar is counted but
  cannot be paid) — not a silent skip, not a generic refusal. GO
  iff every such seed carries the named refusal; VACUOUS if no such
  seed. A silent skip here is the r158 agreement gap in its new
  form and fails LOUDLY.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 5 pre-registered seeds):
89701 (waves), 89702 (waves), 89703 (waves), 89704 (forcedrift,
experimental ex-control), 89705 (wavesnw). Plan is keyed by seed
value in the probe, so the subset keeps correct plans. Seed reuse
is DELIBERATE (matched before/after per the r118/r135/r140/r143/
r144/r147/r152/r156/r158/r162/r171 precedent: same seeds, same
probe policy, only the game code changed) — no fresh band is needed
or claimed for the pilot. THREE PASSES on the same 5 seeds: pass A
(CAPSTONE unset, BUYOUT unset — matched re-run) then pass B
(CAPSTONE=1 BUYOUT=1 — capstone delivery + buy-out, matched to
r171 pass B) then pass C (CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 —
early buy-out). Pass A runs first so its trajectories are the clean
matched comparison; pass B's trajectories diverge only from the
first buy/delivery day onward; pass C diverges from the first early
buy day onward.

R171 PILOT BASELINE (per-seed, from the r171 run note; judged on
these seeds, pass A):
- 89701 waves: WON LESSER — announced d90, sat d90, feared/light,
  final:mercy, alive 4, pantry 7200 at end. deedGate never ok
  (w5:3, waves false). peakLivingVeterans 2.
- 89702 waves: village-LOST d56 (reunion d54/d56), 0 alive, never
  announced. peakLivingVeterans 0 (r171 pilot substrate). NOTE: on
  the NEW substrate the M2b v2 run showed this seed surviving past
  d56 — the r171 baseline for 89702 is NOT expected to reproduce;
  the new trajectory is the (b)/(c) measurement.
- 89703 waves: WON LESSER — announced d90, sat d96, feared/light,
  final:pledge, alive 6. deedGate never ok (w5:0). Pantry 9092.
- 89704 forcedrift (experimental, ex-control): WON LESSER (pass A)
  — announced d90, sat d90, relay/dark, final:merge, alive 7.
  deedGateFirstOk d77; 5 living veterans at peak; military_tribute
  ready d77, MISSED SIT in pass A (no delivery policy). Pass B:
  FULL, sat d90, military_tribute d77 (Jorge Silva + Henrik Lien).
  PRIME pass-B/C candidate again — now with the scholar counted,
  watch whether readiness flips EARLIER or a scholar+1 village
  reads ready.
- 89705 wavesnw: WON LESSER — announced d90, sat d91, feared/
  light, final:pledge, alive 3. deedGate never ok (w5:0). Pantry
  2984 at end.
Tally r171: pass A lesser 4/5, full 0/5, village-lost 1/5; pass B
lesser 3/5, full 1/5 (89704), village-lost 1/5. M23-capstone GO,
M24-tribute-agreement GO (A1 form), M25-buyout VACUOUS NO-GO,
M2b-attribution 7/7 named. M3-conversion NO-GO (armB kills 1 vs
armA 8).

R178 QUESTIONS: (1) pass A: does the pilot reproduce r171 modulo
the named deltas (a)-(g)? (2) does the scholar-counts fix (a) flip
readiness on any seed where the scholar holds a wave-4 kill — is
there a seed where the tribute becomes payable ONLY because the
scholar counts, or a scholar+1 village that now reads ready and
refuses honestly (M24b)? (3) does 89702 survive past d56 on the
new substrate, and what does its endgame look like now (b)/(c)?
(4) pass B: does the full-seat win on 89704 reproduce exactly
(same day, same veterans, same seat)? (5) pass C: does the early
buy-out fire (day, pantry, spent, pantry-after named) and does it
open the FULL seat on a seed where pass B did not — or does it
starve a village before the seat (the Joja price in lives)?
(6) does tribute fire on any seed where 2 veterans live to the
window? (7) dark re-verify: re-run the FULL dark probe as r178
(all 7 variants, same policy, fresh evidence dir
perseed-endgame-r178-dark/) and confirm the v3 walk-out line names
Amelia Moon, not Bill Palmer, and D1–D4/D6 still hold on the new
substrate. (8) people check: do the sitting seeds' finales read as
people — and if pass B/C sits a FULL seat, does the full-seat
finale read as earned, not a default? (9) pellet rads (descriptive
only): any rads death / cure voicing? The probe carries no rads
field — the gap is carried, not fixed here. (10) do the (a)/(b)/(c)
deltas move wave-4 kill conversion (M3 tally kept),
survivability, or competence in the pilot? (11) the diag-layer
staleness blank from r158 (fullseat-diag.js still decomposes the
full seat with the PRE-ladder gate) — carried, owed to the ladder
coordinator / leg 4, not changed here; the probe's own deedGate
snapshot is the honest read. (12) the fast-branch diedInFight:[]
gap from r171 (a fast fight with a causal scholar death reads
vDie but prints an empty party list) — carried, not fixed here;
watch the corpus for a fastW4 scholar-death fight.

INTERESTING FINDING (what would count): any pass-A-vs-r171 headline
difference other than the named deltas; a readiness flip caused
ONLY by the scholar counting; a scholar+1 village reading ready
with an honest named refusal (M24b GO) or a silent skip (M24b
FAIL LOUDLY); a FULL-SEAT win in pass B reproducing 89704, or a
FULL-SEAT win in pass C on a new seed; an early buy-out that fires
(pantry, day, spent, pantry-after named); an early buy-out that
starves the village before the seat (the Joja price in lives); a
tribute delivery with veterans paid; a wave-5 kill on a previously
w5:0 seed; a capstone delivery that refuses despite readiness
(leg-3 agreement failure); a delivered capstone that does NOT
price the full seat (tableSeat/capstone wiring failure); a bought
bundle that does NOT flip feast_embassy to ready (bundle-flag
wiring failure); a pantry that never reaches 8000 in-window on any
seed (the Joja path priced out of bot reach); an M2b party-
restriction misclassification (instrument regression — FAIL
LOUDLY); a pellet lock recurring (regression, FAIL LOUDLY in
chat); a rads death with no voicing; a cure that fires with no
voicing (medic duty silent); a ladder shortfall line that names
the OLD feast bar or stays silent where the ladder bar is the
blocker; a bundle completing in the wild with the +4 not landing
in the counted points; any mFlee carrying monFled=true on a
non-flee kind (monster-commitment violation); any hurt-return
misfire; any ambush death missing from fallen; any dark re-verify
(v3) step failing; any transcript passage senseless, robotic, or
self-contradictory; a stuck helper waiting silently in a finale;
an offered seat withdrawing (sticky-offer failing in the wild); a
"holds and watches" cluster that reads as a stuck record; a
pocket_sand held but never pressed in a losing window where the
scholar fled instead; a bond proposal that fires from a roster
(villagers proposing to people they never perceived); a refusal
line repeating verbatim within one branch across days (refusal
variety regression); a fastW4 fight with a causal scholar death
printing diedInFight:[] (the carried r171 gap, now observable).

BINDINGS (pilot-scaled from r171; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal /
  survived — r156 revision). Judged on pass A; passes B/C reported
  alongside.
- M2-census: every census fight carries a named outcome; >=2/3 Arm
  A waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r171).
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
  or "capstone: <kind> delivered d<day>" (pass B/C), or "buy-out:
  pantry <8000 in-window" where the Joja path was the blocker, or
  "scholar+1: readiness counts the scholar, delivery refuses"
  where M24b applies.
- M11-standing-peak: standing peak reported for 5/5 seeds.
- FIRENARR/HURTRETURN-captured: every pilot JSON carries firenarr
  + hurtreturn arrays (instrument health; counts descriptive).
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check.
- CORPUS-PURITY (gating, from r129/r130): pilot JSON summaries
  match pilot log summaries seed-for-seed (summary PROJECTIONS, not
  file-vs-log equality — r135 correction); zero diagnostic files
  in the pilot dir. Judged per pass (A, B and C each pure).
- L-PEAK: every pilot JSON carries ladderSnapshot (stage, peak,
  counted, byTrack, bundleStages, capstone) and the analyzer prints
  the LADDER section for 5/5 seeds.
- L-VOICE (descriptive-not-binding): seat-shortfall lines in pilot
  transcripts are counted for ladder naming (ladderLine text
  present when the ladder bar blocks) vs silence/old-feast naming.
  A shortfall that names the OLD feast bar is a same-run
  investigation item.
- M23-CAPSTONE (binding, pass B and C, as r171): for every pass-B/C
  seed where deedGateReady().ok is true AND ladder peak >= 3 at any
  daily read, the probe records a delivery attempt and, if a
  capstone kind reads ready, a successful delivery with the kind
  and price named. GO iff attempts == deliveries on all such seeds
  (no refusal despite readiness) AND tableSeat() prices 'full' on
  at least one seed where delivery succeeded and the seat was
  subsequently offered. NO-GO names the failing seed and the exact
  refusal/pricing gap. If NO pass-B/C seed ever reaches
  deedGateReady().ok && peak >= 3, M23 is VACUOUS (recorded as
  such, not GO — the full-seat question stays unmeasured and the
  blocking deed bar is named per seed).
- M24-TRIBUTE-AGREEMENT (revised A2, binding, pass B and C): if
  military_tribute is delivered, the delivery paid exactly `need`
  veterans AND readiness at delivery was >= need (readiness counts
  the scholar per the fix; payable is non-scholar). GO iff equal on
  every tribute delivery; vacuous if no tribute delivery fires.
- M24b-SCHOLAR-PLUS-ONE (NEW, binding, pass B and C): if any seed
  reaches deedGate ok AND peak >= 3 with readiness >= need but
  payable (non-scholar) < need, the probe records a delivery
  refusal whose reason names the scholar-counted shortfall. GO iff
  every such seed carries the named refusal; VACUOUS if no such
  seed. A silent skip fails LOUDLY.
- M25-BUYOUT (binding, pass B only, as r171): for every pass-B seed
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
- M25c-BUYOUT-EARLY (NEW, binding, pass C only): for every pass-C
  seed where the daily snapshot (peak >= 3 AND no bundle done)
  shows pantryKcal >= 8000 AND the scholar at Haven, the probe
  records a buy-out attempt that day. GO iff attempts cover every
  such day (no silent skip) AND every attempt result is recorded
  with ok/why/spent. VACUOUS if no such day on any seed. A
  buy-out that starves the village before the seat is recorded
  per seed with pantry-after and starvation deaths named — a
  finding, not a metric miss.
- M2b-attribution (REVISED RULE, r171): every party-restricted
  dieFlag fight is classified causal-vs-daywindow; >=1 dieFlag
  fight (if any exist) carries >=1 NAMED fight-causal death.
  NO-DATA if no dieFlag fights. The party list is the diedInFight
  read; diedDayWindow is printed alongside for audit.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  w5kills count, full-seat count, lesser-sit count, ladder peak
  stages, capstone deliveries by kind, buy-outs by seed and pass.
  M3-conversion, M4-wave5-or-full, W5-question NO-GO on a closed
  road are the r135 tallies, kept per pass.

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M3-conversion: kept from r171 (armB-vs-armA kill tally).
- M23/M24: kept from r171; M24 in its A2 revised form.
- M24b: new this run; if vacuous, the next run keeps it (the
  scholar+1 shape is the live agreement question until a seed
  exercises it).
- M25: kept from r171 (pass B); M25c new for pass C.
- M2b: kept from r171 (property test, not fixture — the r171
  fixture-move lesson).
- The r177 smoke-bar revision proposal (5 headline numbers +
  MANTLE-FINE + trapline + selfReq 0, not full-file byte-identity)
  is a succession-leg proposal; it does not touch this leg's bars.
