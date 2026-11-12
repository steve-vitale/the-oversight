# Journey endgame r188 — PRE-REGISTRATION (lane B, 2026-11-12 14:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (r187 succession merged
70f6035ea, rotation 7->4; master has since taken two coordinator-evidence
commits bd29d8bd7/859fd6aaa, evidence-only). This run plays leg 4 and
writes 5, social life, at closeout ONLY after a verified landing — a
failed or partial run does not advance the leg, per r135/r138/r140
precedent.

Run number basis: latest completed Lane B runs are r185 endgame, r186
crisis, r187 succession. This run is r188.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-12T19:55:17Z (run_id same).
- Main tree: `git status --short` 0 lines, disk 37% (fail line 85%).
- `git pull --ff-only` "Already up to date" at 19:55:47Z (master
  70f6035ea); master then moved +2 evidence-only commits before
  registration — worktree HEAD bd29d8bd7 = master HEAD at registration.
- Reaper ran, removed nothing (11/16 active; LOUD dirty trees are other
  owners').
- HOST WRITE FLAP: CLEAR at run start (flap-watch ALL-OK 19:56:29Z, git
  probes 5/5 OK).
- Registration queued ~5 min on REGISTRY.lock (reaper lock
  self-contention, known — AGENTS.md 2026-11-12); completed ~20:03Z,
  worktree clean, HEAD bd29d8bd7. Heartbeat immediately after; heartbeat
  loop journey2-endgame-hbloop-r188.sh running every 10 min (pid 8403).
- Exec wall: long jobs run NOHUP-DETACHED with log polling (r178 prereg).

SUBSTRATE: master bd29d8bd7 EXACTLY (worktree HEAD at registration;
verified: `git log --oneline a0039d484..HEAD` = 112 commits, 10 touch
src/js). Probe-side changes only, pre-planned below, plus the
fullseat-diag blank fix (§BLANK) which lands AFTER the measurement
passes are scored. Any other game fix emerging from the pilot gets its
own proof test and is judged on a post-fix re-run, per the r147 rule,
not claimed from the pre-fix pilot. Probe:
scripts/probe-endgame-r188-20261112.js (r185 probe verbatim EXCEPT
renames r185->r188, evidence dir 2026-11-12/perseed-endgame-r188,
header). Analyzer: scripts/analyze-endgame-r188-20261112.js (r185
analyzer verbatim EXCEPT input dir, r185->r188, + the M3 revision
below). Dark probe: scripts/probe-darktable-r188-20261112.js (r185 dark
probe verbatim EXCEPT renames + outdir). M2b test: GREEN from r182 —
no re-sweep (carried as proven).

HEAD DELTAS SINCE r185 SUBSTRATE (a0039d484 -> bd29d8bd7, verified by
git log; 10 src/js commits):
(a) r187 SUCCESSION (70f6035ea, [needs-eyes]): drawTruthLineUnblocked
    pool-picker fixes — confront dry-replacement. Dialogue quality;
    read by the people check.
(b) r186 CRISIS (b2a795948, [needs-eyes]): warn-details pool-picker
    fix. Dialogue quality.
(c) r134 ESTABLISHMENT (88a3a8db7, [needs-eyes]): Q1 stall diagnosed
    as rung-math; guard-beat pool 2->6 observational lines (dialogue
    breadth improvement, not a defect repair).
(d) r133 ESTABLISHMENT (6f7ab7b2b): preserver unit cap N=2/day — Q1 GO.
    GAMEPLAY: preserver pace; watch pantry trajectories, not a headline.
(e) r133 SCALE (3cf9a4644): gesture accept/decline for mimed
    invitations (trap-line fix). Dialogue quality.
(f) ELDERGRAMMAR (a5b75cab8): veteran say line 'A Elder veteran' ->
    'An Elder veteran' (one-word grammar fix; proof test 7/7).
(g) SYNERGYDISC-B (ce653cdab): dawn resonance for double-passive
    synergy discovery (GO on diagnostic seed; panel review_required
    disclosed in evidence). GAMEPLAY: abilities — watch ability grants
    on the pilot seeds.
(h) VERSION BUMPS (50c6e7fc8, 9b3373853, 25d9a7c85): build.js stamps
    only.
(i) SIM ARMS (evidence/scripts only, zero src/js): bisect r7–r10,
    stall cuts 32/49/57, cut confirms (cut2 2/16, cut7 4/16),
    pairarming diag, proofrefresh-b9, gateclassify-b (13/13), winnability
    rounds. MEASUREMENT CONTEXT, not game changes. Notable: pairarming
    diag — wave-5 pair-arming headcount ceiling (armed never reaches 6
    on 190398; roster 3–5 < 6 on 19/19 hold days; shortfall voiceless);
    bisect cut7 CONFIRMED 4/16 + REGIONAL_INTACT 16/16 — the survival
    collapse generalizes on the 190xxx bands at the r7 rate (25%),
    while r185's matched 8970x panel did NOT show it (5/5 reached d90).
The winnability freeze otherwise stands. Any OTHER headline difference
is a same-run investigation item, never a road claim, and is attributed
first to these deltas before any wider claim.

METRIC REVISIONS ADOPTED FROM r185 METRIC REVIEW (before any scored
seed; §14 — the revision lives in the NEXT run's prereg, never a
mid-run re-score):
- M3-conversion RETIRED as a verdict (r185 metric-review proposal,
  adopted here): armA = 'waves' plan (3 seeds: 89701, 89702, 89703),
  armB = 'wavesnw' plan (1 seed: 89705). The bar (armB total wave-4+
  kills > armA total) is structurally near-impossible — one seed
  against three — and confounds policy with conversion; it has failed
  every r18x run on arithmetic, not on game behavior. From this run
  the analyzer prints M3 as a descriptive TALLY line only (no verdict
  entry, no effect on ALL/exit). Wave-4 conversion is carried
  descriptively via per-seed w4plusKills and the binding M3b-peak.
- Telemetry baseline: re-seed endgame.json as per-seed MEANS with
  regime recorded (r185 proposal) — done at closeout via
  --update-baseline AFTER investigating any LOUD lines; the old
  sum-based baseline (r121 4-seed sums) is not comparable to a 5-seed
  panel.
- M21/M23/M25/--wide revisions from r185 stand (already in the
  analyzer).
- M24b kept (vacuous 3 straight runs — the scholar+1 shape is the live
  agreement question until a seed exercises it).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185 precedent: same seeds, same probe policy, only the
game code changed) — no fresh band is needed or claimed for the pilot.
THREE PASSES on the same 5 seeds: pass A (CAPSTONE unset, BUYOUT
unset — matched re-run) then pass B (CAPSTONE=1 BUYOUT=1 — capstone
delivery + buy-out, matched to r185 pass B) then pass C (CAPSTONE=1
BUYOUT=1 BUYOUT_EARLY=1 — early buy-out, matched to r185 pass C).
Pass A runs first so its trajectories are the clean matched
comparison; pass B's trajectories diverge only from the first
buy/delivery day onward; pass C diverges from the first early buy day
onward. Pass C-wide runs after the matched three (independent seeds;
no interference): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8 FRESH
seeds: 89706, 89707 (wavesnw) + 89708–89713 (waves). Same M25c rule as
pass C. Per-seed: buy day, pantry-before, spent, pantry-after, any
starvation deaths named. A buy-out that starves the village before
the seat is a FINDING about the price, not a metric miss (prereg rule
carried from r178/r182/r185). Outdirs perseed-endgame-r188{-,-b,-c,
-cwide,-dark}; analyzer run over each with --wide for C-wide only
(M25c + starvation tally only).

R185 PILOT BASELINE (per-seed, from the r185 run note; judged on these
seeds, pass A):
- 89701 waves: sat d91, alive 7, ladder 3/3/65, deedGate never ok
  (w5:1), peakLivingVeterans 2@d71, uw 5 FACED.
- 89702 waves: sat d90, alive 7, ladder 3/3/75, deedGate first ok d81
  (w5:4), peakLivingVeterans 2@d73, uw 5 FACED.
- 89703 waves: sat d132, alive 6, ladder 3/3/65, deedGate never ok
  (w5:0), peakLivingVeterans 0, uw 4.
- 89704 forcedrift (experimental, ex-control): sat d90, alive 9,
  ladder 3/3/81, deedGate never ok (w5:1), peakLivingVeterans 2,
  uw 5 FACED.
- 89705 wavesnw: sat d91, alive 8, ladder 3/3/65, deedGate never ok
  (w5:0), peakLivingVeterans 2@d87, uw 5.
Tally r185 pass A: lesser 5/5, full 0/5, village-lost 0/5. Pass B:
lesser 4/5, full 1/5 (89702 military_tribute d81, FULL priced d82).
Pass C: lesser 4/5, full 1/5 (89702 feast_embassy d77, FULL priced
d78). C-wide: lesser 7/8, full 0/8, lost 1/8 (89708 scattered d81).
M25c GO 5/5 matched, 8/8 wide. M3 NO-GO (armB 3 vs armA 5) — the
tally this run retires as a verdict. Dark probe: 1 failed step
(v1a-loss:D2-twist-fired), bit-identical to r171/r178/r182. Starvation
watch: no buy-out starved a village before its seat; threshold-edge
buys: 89703 after 3771, 89704 after 3600, 89705 after 3000.

R188 QUESTIONS: (1) pass A: does the pilot reproduce r185 modulo the
named deltas (a)–(g)? (2) SURVIVAL-TO-WINDOW FIRST: how many of the 5
matched villages reach d90 alive — does the bisect-confirmed collapse
(25% on 190xxx bands) show on this panel, and if villages die before
the window, which delta kills them? (3) does the phantom-veteran
readiness shape still hold — 89701's veterans dead before the window,
deedGate never ok, w5:1? (4) pass B: does the 89702 full seat
reproduce — tribute d81, bundle d77 roads? (5) pass C + C-wide: does
the early buy-out fire on the matched 5 and on the fresh 8 (day,
pantry, spent, pantry-after named per seed), does it open the FULL
seat on a seed where pass B did not, and does any buy starve a village
before the seat (the Joja price in lives)? (6) M24b: is the
honest-refusal path exercised on any seed this run (scholar+1 village
reading ready and refusing by name)? (7) dark re-verify: re-run the
FULL dark probe as r188 (all 7 variants, same policy, fresh evidence
dir perseed-endgame-r188-dark/) and confirm the v3 walk-out line names
Amelia Moon, not Bill Palmer, and D1–D4/D6 still hold on the new
substrate. (8) people check: do the sitting seeds' finales read as
people — and if pass B/C/C-wide sits a FULL seat, does the full-seat
finale read as earned, not a default? Does the finalvoice fix (b)
suppress the war-path wave-5 bar line on full-seat audits? Do the
r187/r186/r134/r133 dialogue deltas (a)–(c)/(e) read clean in the
transcripts (confront replacement, warn-details, guard beats, mimed
invitations)? (9) do the (a)–(g) deltas move wave-4 kill conversion
(M3 tally + M3b), survivability, or competence in the pilot? (10) the
diag-layer staleness blank (§BLANK below) — attempted this run, after
the passes. (11) the fast-branch diedInFight gap from r171 — NOT
recurred in r182/r185; watch the corpus for a fastW4 scholar-death
fight. (12) M2b: GREEN from r182, no re-sweep — carried as proven.

§BLANK — fullseat-diag ladder decomposition (r158, carried through
r185): the diag decomposes the full seat with the PRE-LADDER gate:
BARS = deed bars only (w1>=5, w2>=5, w3>=4, w4>=3, w5>=2, contests>=3,
crises>=3, stage>=2, foodDeeds). But table.js now prices full only
when deedGateReady().ok AND ladderPeakStage >= 3 AND a capstone is
delivered (table.js:121). A village meeting every deed bar but lacking
peak-3 or a capstone reads distance-0 (full) in the diag while the
real gate says lesser. THIS RUN attempts the fix: extend the diag's
reach/dist to include ladderPeakStage (bar 3) and capstoneDelivered
(bool), read from the engine's own ladder reads (the same reads
table.js uses), recorded per run at run end and at the win; pure-read
contract kept (writes nothing, draws no RNG, byte-identical when
FULLSEAT unset — the proof's DET gate pins that). Proof test with a
DET gate + a scenario where deed bars are met but ladder halves are
not (dist > 0, missing halves named). The fix lands ONLY after the
measurement passes are scored (the diag is policy-side and the probe
enables FULLSEAT=1, but the layer is pure-read so trajectories cannot
move — the ordering is for corpus comparability, not safety). If the
fix proves out of scope mid-run, it is documented, not forced.

INTERESTING FINDING (what would count): any pass-A-vs-r185 headline
difference other than the named deltas; a village dying before d90
(survival collapse — name the seed, the day, the cause, the delta
implicated); a readiness flip caused ONLY by the deltas (a)–(g); a full
seat on a new seed or a lost full seat on 89702; a scholar+1 village
reading ready with an honest named refusal (M24b GO) or a silent skip
(M24b FAIL LOUDLY); an early buy-out that fires (pantry, day, spent,
pantry-after named); an early buy-out that starves the village before
the seat (the Joja price in lives); a tribute delivery with veterans
paid (the tribute road reopening); a wave-5 kill on a previously w5:0
seed; a capstone delivery that refuses despite readiness (leg-3
agreement failure — now counted only as refused-despite-ready); a
delivered capstone that does NOT price the full seat (tableSeat/
capstone wiring failure); a bought bundle that does NOT flip
feast_embassy to ready (bundle-flag wiring failure); a pantry that
never reaches 8000 in-window on any seed (the Joja path priced out of
bot reach); a pellet lock recurring (regression, FAIL LOUDLY in chat);
a rads death with no voicing; a cure that fires with no voicing (medic
duty silent); a ladder shortfall line that names the OLD feast bar or
stays silent where the ladder bar is the blocker; a bundle completing
in the wild with the +4 not landing in the counted points; any mFlee
carrying monFled=true on a non-flee kind (monster-commitment
violation); any hurt-return misfire; any ambush death missing from
fallen; any dark re-verify (v3) step failing; any transcript passage
senseless, robotic, or self-contradictory; a stuck helper waiting
silently in a finale; an offered seat withdrawing (sticky-offer failing
in the wild); a "holds and watches" cluster that reads as a stuck
record; a pocket_sand held but never pressed in a losing window where
the scholar fled instead; a bond proposal that fires from a roster
(villagers proposing to people they never perceived); a refusal line
repeating verbatim within one branch across days (refusal variety
regression); a fastW4 fight with a causal scholar death printing
diedInFight:[] (the carried r171 gap, now observable); the war-path
wave-5 bar line still appearing on a full-seat audit (finalvoice fix
(b) not holding); the diag fix's proof scenario failing (the blank
stays open, documented with the failing shape).

BINDINGS (pilot-scaled from r185; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal /
  survived — r156 revision). Judged on pass A; passes B/C/C-wide
  reported alongside.
- M2-census: every census fight carries a named outcome; >=2/3 Arm A
  waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r185).
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
  B and C, as r185): for every pass-B/C seed where deedGateReady().ok
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
- M25-BUYOUT: DROPPED from the printed set (r185 revision).
- M25c-BUYOUT-EARLY (PRIMARY, binding, pass C and C-wide): for every
  pass-C/C-wide seed where the daily snapshot (peak >= 3 AND no bundle
  done) shows pantryKcal >= 8000 AND the scholar at Haven, the probe
  records a buy-out attempt that day. GO iff attempts cover every such
  day (no silent skip) AND every attempt result is recorded with
  ok/why/spent. VACUOUS if no such day on any seed. A buy-out that
  starves the village before the seat is recorded per seed with
  pantry-after and starvation deaths named — a finding, not a metric
  miss.
- M3-conversion: RETIRED as a verdict this run — printed as a
  descriptive tally only (see revisions above). NOT in PRIMARY,
  NOT in ALL, NOT gated.
- M2b-attribution: GREEN from r182, no re-sweep (carried as proven).
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  w5kills count, full-seat count, lesser-sit count, ladder peak
  stages, capstone deliveries by kind, buy-outs by seed and pass.
  M3-conversion, M4-wave5-or-full, W5-question NO-GO on a closed road
  are the r135 tallies, kept per pass.

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M3: retired as a verdict this run (r185 metric-review proposal).
- Telemetry baseline: re-seeded as per-seed means with regime recorded
  this run (r185 metric-review proposal) — see telemetry section.
- M24b: kept from r185; if vacuous again, the next run keeps it (the
  scholar+1 shape is the live agreement question until a seed
  exercises it).
- M2b: kept from r171; GREEN from r182, no re-sweep.
- The r177 smoke-bar revision proposal (5 headline numbers +
  MANTLE-FINE + trapline + selfReq 0, not full-file byte-identity) is
  a succession-leg proposal; it does not touch this leg's bars.
