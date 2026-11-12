# Journey endgame r185 — PRE-REGISTRATION (lane B, 2026-11-11 23:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (r183 succession adopted
as r184, merged 87cf1d5f7, rotation-b 7->4, lock deleted; the 22:51 CST
r185 attempt was flap-blocked with no play — this run restarts as r185
per the interim handoff). This run plays leg 4 and writes 5, social
life, at closeout ONLY after a verified landing — a failed or partial
run does not advance the leg, per r135/r138/r140 precedent.

Run number basis: latest completed Lane B runs are r178 endgame, r179
social life, r180 crisis, r181 succession, r182 endgame, r183
succession (adopted as r184). This run is r185.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start (the 22:51 CST attempt deleted its
  lock per the body rule). This run's lock written 2026-11-12T04:55:29Z
  (run_id same).
- Main tree: `git status --short` 0 lines, disk 39% (fail line 85%).
- `git pull --ff-only` "Already up to date" (standing divergence
  RESOLVED — reconcile merged; master a0039d484).
- Reaper ran, removed nothing (13/16 active; LOUD dirty trees are other
  owners'), registry save completed (mtime 04:56:49Z).
- HOST WRITE FLAP, second night in a row. Onset ~04:01Z (first r185
  attempt); cleared ~04:57Z (git 5/5, node read-then-write OK, worktrees
  5/5, goal 3/3); registration started 04:58, queued ~9 min behind the
  registry flock (my own script's reap step held it; Lane A registered
  journey-establishment at 04:56:49Z ahead of me); checkout ran
  05:07–~05:11Z, then the flap RECURRED mid-checkout (git probe 0/5,
  /tmp write EPERM at 05:11:40Z) and the fallback `git worktree add`
  failed — git cleaned up the worktree dir. Branch journey2-endgame
  still exists at a0039d484 (= master HEAD); no registry entry for it;
  no stale index.lock in the main tree; main tree still clean. Per the
  write-flap skill: probe first, wait it out, re-register only on 5/5
  OK. Do NOT hammer the register script. Flap log:
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-endgame-r185-INTERIM.md
  (first attempt) + this prereg.
- Exec wall: foreground/background execs are SIGTERMed at ~137s in
  this session (r178 prereg). Long jobs (pilot passes, gate) run
  NOHUP-DETACHED with log polling.

SUBSTRATE: master a0039d484 EXACTLY (worktree HEAD at registration;
verified: `git log --oneline 3abe9ef14..HEAD` = 246 commits, 75 touch
src/js, 28 files touched). This is the FIRST endgame measurement on the
POST-RECONCILE master. Probe-side changes only, pre-planned below
(pass-C-wide band is carried from r182; analyzer revisions M21/M23/M25/
--wide below); zero src/js planned. Any game fix emerging from the
pilot gets its own proof test and is judged on a post-fix re-run, per
the r147 rule, not claimed from the pre-fix pilot. Probe:
scripts/probe-endgame-r185-20261111.js (r182 probe verbatim EXCEPT
renames r182->r185, evidence dir 2026-11-12/perseed-endgame-r185,
header). Analyzer: scripts/analyze-endgame-r185-20261111.js (r182
analyzer verbatim EXCEPT input dir, r182->r185, + the four revisions
below). Dark probe: scripts/probe-darktable-r185-20261111.js (r182 dark
probe verbatim EXCEPT renames + outdir). M2b test: GREEN from r182 —
no re-sweep (per the interim handoff).

HEAD DELTA SINCE r182 PILOT SUBSTRATE (3abe9ef14 -> a0039d484,
verified by git log). Probe-policy files are CHANGED in the range —
CORRECTION to the first draft of this prereg, made before any scored
seed: `git log 3abe9ef14..HEAD -- scripts/policies/` shows 5 commits
touching 4 files (competent.js +49, competent-r126.js new frozen copy,
competent-nofallback*.js +11 each — garden reorder only). The probe's
other policy files (deed-seeking, fullseat-diag, relaygrey, vetcommit,
armorydrive) are unchanged. The competent.js changes are:
(k) PROBE-POLICY DELTA — competent.js (r127 + OVE-160): (i)
    beastStrikeTarget failed-move fallback (bb58c1f66): the bot now
    tries EVERY adjacent tile, nearest first, and accepts a move only
    when the scholar's position actually changes; a failed move counts
    nothing ('stuck', recorded) instead of counting ctx.closed as
    'moved'. The old code picked ONE tile, ignored the refused move,
    and burned the turn — seed 1151 d28, three identical failed steps,
    zero strikes. FIGHT-PLAY IMPACT: the scholar can now actually
    close distance and strike; expect census fight anatomy, strike
    counts, and M3-conversion to move on the pilot seeds, partly
    POLICY-driven, not game-driven — attribute fight deltas to (k)
    before any game-code cause. (ii) workGarden keeper-appointment
    reorder (91cb6fa20 OVE-160): appoint the garden keeper BEFORE
    makePlot ticks move residents off-tile, so the standing caretaker
    is actually reserved. Minor garden-output effect; watch pantry
    trajectories, not a headline. The matched comparison is therefore
    "same seeds, same probe policy EXCEPT competent.js (k)" — the
    r182 baseline stays the control, with (k) as a named confound.
Real game-code deltas, attributed (246 commits in range,
mostly evidence/scripts):
(a) RECONCILE MERGE (e4dbe581b + 94f76882b + merges into
    reconcile-divergence): Cursor's villager-brain.js dawn scorer
    (1061 lines) + OVE-xxx army-lean wires (OVE-74 through OVE-152) +
    Phase 6 brain-offer DUTY at dawn (c224a9752, incl. known-prey hunt
    DUTY, scout DUTY, dutyKnownPrey). THIS IS THE HEADLINE DELTA: the
    first endgame measurement on the post-reconcile substrate. The
    feeder probe showed Cursor's dawn scorer changes villager mornings
    substantially (EAT 59 vs 36 on the same panel), so pass-A/B/C
    numbers — sat days, wave-5 kill counts, deed-gate timing — may NOT
    reproduce r182. The survivalcontrol-b collapse (6/8 -> 1/8 survive
    on current master) is the open headline: WATCH SURVIVAL-TO-WINDOW
    FIRST. If the panel's villages die before d90, that IS the
    headline, and reconcile is bisect candidate #1.
(b) SIM-FINALVOICE-B (7f676033d, [needs-eyes]): finale voice cap +
    full-seat bar suppression (#2252/#2253). PEOPLE-CHECK IMPACT: the
    war-path "wave-5 bar reads" line that appeared even on full-seat
    audits (r182 polish item 3) should now be suppressed; verify in
    transcripts.
(c) SUCCESSION RAFAEL FIX (e965b66f5, [needs-eyes]): inherited
    conversations no longer misattribute confessions. Dialogue
    quality; read by the people check.
(d) JOURNEY-SCALE R132 (7f676033d... no — 7dea8790e, [needs-eyes]):
    raise-answer template — link/bond answers only once the ask is
    heard. Dialogue quality; read by the people check.
(e) JOURNEY-DEEPENING R183 (2062747e6): place-lesson frame variety
    (convoTeachPlaceLine, 4-frame rotation). Dialogue quality.
(f) JOURNEY-SOCIAL R180 (ac9a34cc4, [needs-eyes]): favor-requirements
    exits honestly instead of repeating the escalation; M10 coach/face
    split.
(g) JOURNEY-CRISIS R181 (5477661bb, [needs-eyes]): regional ruin
    medicines ease/cure as labeled.
(h) MOURNBLOODED HOLD BEAT (13e6f40ae, [needs-eyes]): hold beat mourns
    the blooded (#472).
(i) MEDNAME + USE-VERB FIXES (9b98a0efc, 20da580d7): medicine
    narration names the pill taken; useMedicine per-kind use verb.
(j) JOURNEY-LANDING R127 (bb58c1f66 + gate repair): beastStrikeTarget
    failed-move fallback + small-bridge 2->6; tbIsPlayerTurn guard
    existence-checked; capable-bot fixture models real movement.
    FIGHT-PLAY IMPACT: the scholar-turns defect fix may move fight
    outcomes on the pilot seeds; watch census fight anatomy.
The winnability freeze otherwise stands. Any OTHER headline difference
is a same-run investigation item, never a road claim, and is attributed
first to these deltas before any wider claim.

METRIC REVISIONS ADOPTED FROM r182 METRIC REVIEW (before any scored
seed; §14 — the revision lives in the NEXT run's prereg, never a
mid-run re-score):
- M21-audit-crosscheck: FULL-SEAT EXEMPTION via direct satWaves
  deed-bar check. The full-seat audit line carries NO numbers
  (table.js:271: "A full seat. National standing, every wave faced,
  the deeds complete.") so the parser marks every full seat
  AUDIT-UNPARSED (r182: 89702 pass B, 89702 pass C, 89707 wide). The
  deed bars are 5/5/4/3/2 distinct fought per wave
  (progression.js deedGateReady: w1>=5 && w2>=5 && w3>=4 && w4>=3 &&
  w5>=2; table.js:79). For a sat seed with satSeatKind 'full', M21
  passes iff satWaves meets those bars (>=5/5/4/3/2); the audit-line
  parse is skipped for that seed. Lesser seats keep the parse rule.
- M23-capstone: count ONLY refusals-despite-ready. The analyzer's
  literal attempts==deliveries counted honest none-ready attempts
  (d62–64, no kind ready yet) as failed attempts; r182 pass B
  substance was a pass (delivered 1/1, none-ready 3,
  refused-despite-ready 0, priced FULL) marked NO-GO. Revised rule:
  GO iff every eligible seed delivered AND 0 refused-despite-ready
  (reason !== 'none-ready') AND pricedFull on >=1 such seed. The
  none-ready count is still printed in the note.
- M25-buyout: DROPPED from the analyzer's printed set entirely
  (r182 metric-review proposal, adopted here: vacuous a fourth
  straight run — the early buy-out buys the bundle before the window
  opens, so the in-window rule never fires). M25c stays PRIMARY.
- --wide gating: the C-wide pass is judged on M25c + starvation only.
  The analyzer takes a --wide flag; with it, only M25c-buyout-early
  and the starvation tally are printed/judged. The full metric set
  (M5-voicing-canonical, M21, M3-conversion, etc.) does NOT apply to
  the wide pass — r182's wide NO-GOs on M5/M21/M3 were out-of-scope
  noise, not findings.
- M24b kept (honest-refusal path still unexercised; keep until a seed
  actually refuses).
- M3-conversion kept (standing measurement, no revision).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182 precedent: same seeds, same probe policy, only the game
code changed) — no fresh band is needed or claimed for the pilot.
THREE PASSES on the same 5 seeds: pass A (CAPSTONE unset, BUYOUT
unset — matched re-run) then pass B (CAPSTONE=1 BUYOUT=1 — capstone
delivery + buy-out, matched to r182 pass B) then pass C (CAPSTONE=1
BUYOUT=1 BUYOUT_EARLY=1 — early buy-out, matched to r182 pass C).
Pass A runs first so its trajectories are the clean matched
comparison; pass B's trajectories diverge only from the first
buy/delivery day onward; pass C diverges from the first early buy day
onward. Pass C-wide runs after the matched three (independent seeds;
no interference): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8 FRESH
seeds: 89706, 89707 (wavesnw) + 89708–89713 (waves). Same M25c rule as
pass C. Per-seed: buy day, pantry-before, spent, pantry-after, any
starvation deaths named. A buy-out that starves the village before
the seat is a FINDING about the price, not a metric miss (prereg rule
carried from r178/r182). Outdir perseed-endgame-r185-cwide; analyzer
run over it with --wide (M25c + starvation tally only).

R182 PILOT BASELINE (per-seed, from the r182 run note; judged on these
seeds, pass A):
- 89701 waves: WON LESSER — announced d90, sat d104, alive 9, ladder
  peak 3 / stage 3 / counted 81, capstone none, deedGate never ok
  (w5:0), peakLivingVeterans 2@d47, 0 living at end, uw 4.
- 89702 waves: WON LESSER — announced d90, sat d97, alive 8, ladder
  3/3/78, deedGateFirstOk d62 (w5:7), peakLivingVeterans 2@d43, 1
  living at end, uw 5 FACED (7 w5 faces).
- 89703 waves: WON LESSER — announced d90, sat d118, alive 5, ladder
  3/3/56, deedGate never ok (w5:0), peakLivingVeterans 0, uw 4.
- 89704 forcedrift (experimental, ex-control): WON LESSER — announced
  d90, sat d92, alive 3, ladder 3/3/52, deedGate never ok (w5:1),
  peakLivingVeterans 2@d79, uw 5 FACED (cancellation d81).
- 89705 wavesnw: WON LESSER — announced d90, sat d98, alive 10,
  ladder 3/3/74, deedGate never ok (w5:0), peakLivingVeterans 1@d98,
  uw 4.
Tally r182 pass A: lesser 5/5, full 0/5, village-lost 0/5. Pass B:
lesser 4/5, full 1/5 (89702 feast_embassy d65, FULL priced d66). Pass
C: lesser 4/5, full 1/5 (89702 feast_embassy d78, FULL priced d79).
C-wide: full 1/8 (89707), lesser 6/8, unseated-survived 1/8 (89708).
M23 pass B NO-GO as printed (substance pass — see revision above).
M21 4/5 pass B, 4/5 pass C, 7/8 wide (full-seat AUDIT-UNPARSED —
see revision above). M25 VACUOUS 4th time (see revision above).
M25c GO 5/5 matched, 8/8 wide. M24 VACUOUS (no tribute delivery
anywhere in 13 runs). M24b VACUOUS pass B, GO pass C
(covered-by-delivery). M3-conversion NO-GO (standing tally, armB 1
vs armA 6 pass A). Dark probe: 1 failed step (v1a-loss:D2-twist-
fired), bit-identical to r171/r178. Starvation watch: no buy-out
starved a village before its seat; threshold-edge buys gutted the
pantry (89705 after 0, 89709 after 1500, 89710 after 1900).

R185 QUESTIONS: (1) pass A: does the pilot reproduce r182 modulo the
named deltas (a)–(j)? (2) SURVIVAL-TO-WINDOW FIRST: how many of the 5
matched villages reach d90 alive — is the survivalcontrol-b collapse
(6/8 -> 1/8 survive on current master) visible on this panel, and if
villages die before the window, which delta kills them (dawn scorer?
DUTY-at-dawn? OVE wires?)? (3) does the phantom-veteran fix's
readiness shape (r182 Q2) still hold — 89701's veterans dead before
the window, deedGate never ok, w5:0? (4) pass B: does the 89702 full
seat (feast_embassy d65) reproduce — same day, same veterans, same
seat? (5) pass C + C-wide: does the early buy-out fire on the matched
5 and on the fresh 8 (day, pantry, spent, pantry-after named per
seed), does it open the FULL seat on a seed where pass B did not, and
does any buy starve a village before the seat (the Joja price in
lives)? (6) M24b: is the honest-refusal path exercised on any seed
this run (scholar+1 village reading ready and refusing by name)? (7)
dark re-verify: re-run the FULL dark probe as r185 (all 7 variants,
same policy, fresh evidence dir perseed-endgame-r185-dark/) and
confirm the v3 walk-out line names Amelia Moon, not Bill Palmer, and
D1-D4/D6 still hold on the new substrate. (8) people check: do the
sitting seeds' finales read as people — and if pass B/C/C-wide sits a
FULL seat, does the full-seat finale read as earned, not a default?
Does the finalvoice fix (b) suppress the war-path wave-5 bar line on
full-seat audits? (9) do the (a)–(j) deltas move wave-4 kill
conversion (M3 tally kept), survivability, or competence in the pilot?
(10) the diag-layer staleness blank from r158 (fullseat-diag.js still
decomposes the full seat with the PRE-ladder gate) — carried, owed to
the ladder coordinator / leg 4, not changed here; the probe's own
deedGate snapshot is the honest read. (11) the fast-branch diedInFight
gap from r171 — NOT recurred in r182 (all scholar deaths carried
named diedInFight parties); watch the corpus for a fastW4
scholar-death fight. (12) M2b: GREEN from r182, no re-sweep — carried
as proven.

INTERESTING FINDING (what would count): any pass-A-vs-r182 headline
difference other than the named deltas; a village dying before d90
(survival collapse — name the seed, the day, the cause, the delta
implicated); a readiness flip caused ONLY by the reconcile deltas (a);
a full seat on a new seed or a lost full seat on 89702; a scholar+1
village reading ready with an honest named refusal (M24b GO) or a
silent skip (M24b FAIL LOUDLY); an early buy-out that fires (pantry,
day, spent, pantry-after named); an early buy-out that starves the
village before the seat (the Joja price in lives); a tribute delivery
with veterans paid (first in 13+ runs — the tribute road reopening);
a wave-5 kill on a previously w5:0 seed; a capstone delivery that
refuses despite readiness (leg-3 agreement failure — now counted
only as refused-despite-ready); a delivered capstone that does NOT
price the full seat (tableSeat/capstone wiring failure); a bought
bundle that does NOT flip feast_embassy to ready (bundle-flag wiring
failure); a pantry that never reaches 8000 in-window on any seed (the
Joja path priced out of bot reach); a pellet lock recurring
(regression, FAIL LOUDLY in chat); a rads death with no voicing; a
cure that fires with no voicing (medic duty silent); a ladder
shortfall line that names the OLD feast bar or stays silent where the
ladder bar is the blocker; a bundle completing in the wild with the +4
not landing in the counted points; any mFlee carrying monFled=true on
a non-flee kind (monster-commitment violation); any hurt-return
misfire; any ambush death missing from fallen; any dark re-verify
(v3) step failing; any transcript passage senseless, robotic, or
self-contradictory; a stuck helper waiting silently in a finale; an
offered seat withdrawing (sticky-offer failing in the wild); a "holds
and watches" cluster that reads as a stuck record; a pocket_sand held
but never pressed in a losing window where the scholar fled instead;
a bond proposal that fires from a roster (villagers proposing to
people they never perceived); a refusal line repeating verbatim
within one branch across days (refusal variety regression); a fastW4
fight with a causal scholar death printing diedInFight:[] (the
carried r171 gap, now observable); the war-path wave-5 bar line
still appearing on a full-seat audit (finalvoice fix (b) not
holding).

BINDINGS (pilot-scaled from r182; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal /
  survived — r156 revision). Judged on pass A; passes B/C/C-wide
  reported alongside.
- M2-census: every census fight carries a named outcome; >=2/3 Arm A
  waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r182).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing or a
  named fallback; 89704 is experimental (r156 prereg) — the
  fallback/vacuous reading applies to the forcedrift seed's relay
  voicing, not to a control comparison.
- M10-fullseat-gap: every sitting seed's full-seat gap is named (r130
  revised rule: seat-kind pass — lesser despite full bars met is a
  named gap, not NO-GO). THIS RUN: a sitting seed whose only missing
  full-seat piece is the capstone passes M10 with the gap named
  "capstone not delivered (pass A: no delivery policy)" or "capstone:
  <kind> delivered d<day>" (pass B/C), or "buy-out: pantry <8000
  in-window" where the Joja path was the blocker, or "scholar+1:
  readiness counts the scholar, delivery refuses" where M24b applies.
- M11-standing-peak: standing peak reported for 5/5 seeds.
- FIRENARR/HURTRETURN-captured: every pilot JSON carries firenarr +
  hurtreturn arrays (instrument health; counts descriptive).
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check.
- CORPUS-PURITY (gating, from r129/r130): pilot JSON summaries match
  pilot log summaries seed-for-seed (summary PROJECTIONS, not
  file-vs-log equality — r135 correction); zero diagnostic files in
  the pilot dir. Judged per pass (A, B, C and C-wide each pure).
- L-PEAK: every pilot JSON carries ladderSnapshot (stage, peak,
  counted, byTrack, bundleStages, capstone) and the analyzer prints
  the LADDER section for 5/5 seeds.
- L-VOICE (descriptive-not-binding): seat-shortfall lines in pilot
  transcripts are counted for ladder naming (ladderLine text present
  when the ladder bar blocks) vs silence/old-feast naming. A shortfall
  that names the OLD feast bar is a same-run investigation item.
- M21-audit-crosscheck (REVISED — full-seat exemption): for a sat
  seed with satSeatKind 'full', pass iff satWaves meets the deed bars
  (w1>=5, w2>=5, w3>=4, w4>=3, w5>=2); the audit-line parse is skipped
  for that seed. Lesser seats keep the parse rule (audit numbers match
  satWaves exactly). GO iff every sat seed passes its rule.
- M23-CAPSTONE (REVISED — refusals-despite-ready only, binding, pass
  B and C, as r182): for every pass-B/C seed where deedGateReady().ok
  is true AND ladder peak >= 3 at any daily read, the probe records a
  delivery attempt and, if a capstone kind reads ready, a successful
  delivery with the kind and price named. GO iff attempts == deliveries
  on all such seeds counting ONLY refusals-despite-ready (reason !==
  'none-ready') as failures AND tableSeat() prices 'full' on at least
  one seed where delivery succeeded and the seat was subsequently
  offered. NO-GO names the failing seed and the exact refusal/pricing
  gap. If NO pass-B/C seed ever reaches deedGateReady().ok && peak >=
  3, M23 is VACUOUS (recorded as such, not GO — the full-seat question
  stays unanswered and the blocking deed bar is named per seed).
- M24-TRIBUTE-AGREEMENT (revised A2, binding, pass B and C): if
  military_tribute is delivered, the delivery paid exactly `need`
  veterans AND readiness at delivery was >= need (readiness counts the
  scholar per the fix; payable is non-scholar). GO iff equal on every
  tribute delivery; vacuous if no tribute delivery fires.
- M24b-SCHOLAR-PLUS-ONE (binding, pass B and C): if any seed reaches
  deedGate ok AND peak >= 3 with readiness >= need but payable
  (non-scholar) < need, the probe records a delivery refusal whose
  reason names the scholar-counted shortfall. GO iff every such seed
  carries the named refusal; VACUOUS if no such seed. A silent skip
  fails LOUDLY.
- M25-BUYOUT: DROPPED from the printed set (see revisions above).
- M25c-BUYOUT-EARLY (PRIMARY, binding, pass C and C-wide): for every
  pass-C/C-wide seed where the daily snapshot (peak >= 3 AND no bundle
  done) shows pantryKcal >= 8000 AND the scholar at Haven, the probe
  records a buy-out attempt that day. GO iff attempts cover every such
  day (no silent skip) AND every attempt result is recorded with
  ok/why/spent. VACUOUS if no such day on any seed. A buy-out that
  starves the village before the seat is recorded per seed with
  pantry-after and starvation deaths named — a finding, not a metric
  miss.
- M2b-attribution: GREEN from r182, no re-sweep (carried as proven).
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  w5kills count, full-seat count, lesser-sit count, ladder peak
  stages, capstone deliveries by kind, buy-outs by seed and pass.
  M3-conversion, M4-wave5-or-full, W5-question NO-GO on a closed road
  are the r135 tallies, kept per pass.

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M21: full-seat exemption adopted this run (r182 metric-review
  proposal).
- M23: ready-refusal-only adopted this run (r182 metric-review
  proposal).
- M25: dropped from the printed set this run (r182 metric-review
  proposal).
- --wide: wide-pass gating adopted this run (r182 metric-review
  proposal).
- M24b: kept from r182; if vacuous again, the next run keeps it (the
  scholar+1 shape is the live agreement question until a seed
  exercises it).
- M3-conversion: kept from r182 (armB-vs-armA kill tally).
- M23/M24: kept from r182; M24 in its A2 revised form.
- M2b: kept from r171 (property test, not fixture — the r171
  fixture-move lesson); GREEN from r182, no re-sweep.
- The r177 smoke-bar revision proposal (5 headline numbers +
  MANTLE-FINE + trapline + selfReq 0, not full-file byte-identity) is
  a succession-leg proposal; it does not touch this leg's bars.
