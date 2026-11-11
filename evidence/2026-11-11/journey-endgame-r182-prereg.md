# Journey endgame r182 — PRE-REGISTRATION (lane B, 2026-11-11 11:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (r181 succession adopted
closeout 10:55 CST, merged 7f1c61a6e, rotation-b 7->4, lock deleted); this
run plays leg 4 and writes 5, social life, at closeout ONLY after a
verified landing — a failed or partial run does not advance the leg, per
r135/r138/r140 precedent.

Run number basis: latest completed Lane B runs are r178 endgame, r179
social life, r180 crisis, r181 succession. This run is r182.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start (r181 adoption deleted it). This run's
  lock written 2026-11-11T16:56:36Z (run_id same).
- Main tree: `git status --short` 0 lines, disk 34% (fail line 85%).
- `git pull --ff-only` FAILED: standing divergence (local master ahead
  598 / behind 156; reconciliation coordinator da17d7d0 still running,
  proof refresh r2 on new tip; reconcile-divergence NOT an ancestor of
  local master) — proceeded on local master per
  r156/r164/r168/r176/r177/r178 precedent, no push, no bump. The
  divergence itself is the reconciliation coordinator's job, not this
  run's; this run merges ff-only into LOCAL master only.
- Reaper ran detached (~17 min, exit 0, removed nothing; 7 LOUD dirty
  trees never auto-removed; active 10/16). Registry lock free at
  registration time.
- Exec wall: foreground/background execs are SIGTERMed at ~137s in this
  session (r178 prereg). Long jobs (pilot passes, gate) run
  NOHUP-DETACHED with log polling.
- EPERM write flap: probe write in ~/workspace/worktrees/ OK at run
  start (WRITE_OK + RM_OK) — flap appears clear; if a write is refused
  mid-run, retry with the probe-gated pattern, never silently drop a
  file.

SUBSTRATE: master 3abe9ef148714cc7a6ac19d4283b1decf547a7af EXACTLY (worktree
HEAD at registration; master moved 2 commits during pre-flight —
sim-justicefirst-a landed 0f18ad0c8 + 3abe9ef14, evidence/scripts only,
no src/js, no endgame effect). Probe-side changes only, pre-planned
below (pass-C-wide band + M25c-primary analyzer revision + M2b test
generalization); zero src/js. Any game fix emerging from the pilot gets
its own proof test and is judged on a post-fix re-run, per the r147
rule, not claimed from the pre-fix pilot. Probe:
scripts/probe-endgame-r182-20261111.js (r178 probe verbatim EXCEPT
renames r178->r182, evidence dir 2026-11-11/perseed-endgame-r182,
header, + the pass-C-wide PLAN entries below). Analyzer:
scripts/analyze-endgame-r182-20261111.js (r178 analyzer verbatim EXCEPT
input dir, r178->r182, + M25c-primary revision below). Dark probe:
scripts/probe-darktable-r182-20261111.js (r178 dark probe verbatim
EXCEPT renames + outdir). M2b test:
scripts/test-m2b-scholar-open-r182.js (r178 test verbatim EXCEPT probe
path, temp-dir tag, + SEEDS/DAYS taken from env with defaults 89702/60
preserving r178 behavior). Diagnostics, if any, write ONLY to
perseed-endgame-r182-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r178 PILOT SUBSTRATE (5a9f0ed0c -> 3abe9ef14, verified by
git log). Probe-policy files (deed-seeking, capable, fullseat-diag,
relaygrey, vetcommit, armorydrive) are UNCHANGED in the range
(verified: git log on scripts/policies/ is empty) — same probe policy.
Real game-code deltas, attributed (59 commits in range, mostly
evidence/scripts):
(a) PHANTOM-VETERAN READINESS FIX (5d16916f4, [needs-eyes]): readiness
    reads only LIVING veterans. THIS IS THE HEADLINE DELTA: the first
    endgame measurement on the post-fix substrate. The r178 pilot
    measured readiness that could count a dead (phantom) veteran. Expect
    readiness to flip on seeds where the second veteran died before the
    window; delivery still pays 2 non-scholar veterans. The r131 panel
    (131101-131104) showed zero readiness/ladder disagreements under the
    new rule; the old rule would have kept seed 131104 BLOODED d121-d140
    through 19 wave-5 fights after paying tribute. Steve-call owed on
    the tribute-strips-BLOODED shape (asked 09:38 CST, still unanswered
    at run start) — lever unchanged until he rules; this run measures
    the rule as it stands.
(b) COOK/MEND LADDER GRANTS (a16ce1cc8, [needs-eyes]): cook/mend
    routine-work grants fill ladder rungs. LADDER IMPACT: ladder peak /
    stage / counted points may move earlier or higher on the pilot
    seeds; a seed that sat lesser on ladder timing may now reach peak 3
    sooner. Watch ladderPeak/ladderCounted per seed vs r178.
(c) DIALOGUE FIXES (28875b1b1 crisis Q3 voice-line stacking + r27 recap
    regex; b09cf584e deepening stateful favour-block rotation; 4b89a8c73
    social one-face-line-per-sitting): dialogue quality; read by the
    people check, not a pricing change.
(d) FIRST-NUMBERS SYSTEMS (dutyfirst/kinfirst/standfirst/titanfirst/
    relayfirst/abilityfirst/convfirst/trustfirst/vetfirst/godpathfirst/
    fansfirst/corruptfirst/justicefirst evidence + scripts): new
    coverage, no endgame pricing change; descriptive only. The r180
    crisis fix and r131 scale fix are the only src/js in the range
    besides (a)-(c). Justicefirst-a landed during this run's pre-flight
    (0f18ad0c8 + 3abe9ef14) — evidence/scripts only.
The winnability freeze otherwise stands. Any OTHER headline difference
is a same-run investigation item, never a road claim, and is attributed
first to these deltas before any wider claim.

METRIC REVISIONS ADOPTED FROM r178 METRIC REVIEW (before any scored
seed; §14 — the revision lives in the NEXT run's prereg, never a
mid-run re-score):
- M25c-BUYOUT-EARLY becomes the PRIMARY buy-out bar. M25-BUYOUT is
  kept as the in-window rule FOR THE RECORD: its verdict is still
  printed by the analyzer, but it is REMOVED from the PRIMARY-BINDINGS
  list. (M25 went vacuous-NO-GO three straight runs; the in-window
  rule never fires on this panel while M25c GOes 5/5.)
- M24b kept (honest-refusal path still unexercised; keep until a seed
  actually refuses).
- M3-conversion kept (standing measurement, no revision).

PASS-C-WIDE STARVATION-WATCH BAND (new this run, pre-registered):
r178's metric review ordered "the Joja price needs a starvation watch
on wider bands" after the 89-kcal buy (89705-C). Pass C-wide runs
CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8 FRESH seeds: 89706, 89707
(wavesnw — already in the probe PLAN map) + 89708, 89709, 89710, 89711,
89712, 89713 (waves — NEW PLAN-map entries, probe-side config only;
same competent waves policy as 89701-89703). Same M25c rule as pass C.
Per-seed: buy day, pantry-before, spent, pantry-after, any starvation
deaths named. A buy-out that starves the village before the seat is a
FINDING about the price, not a metric miss (prereg rule carried from
r178). Outdir perseed-endgame-r182-cwide; analyzer run over it as a
fourth pass (M25c + starvation tally only; the full metric set is
judged on the matched 5).

M2b PROOF (owed since r171 adoption; r178 vacuous on 89702/60d):
test-m2b-scholar-open-r182.js generalized to SEEDS/DAYS env (defaults
89702/60). This run executes it once per matched seed at 120 days
(89701, 89702, 89703, 89704, 89705, sequential, temp dirs) — the first
seed that produces a scholar-death fight gives the property its live
proof; if none does on any seed at 120d, the test stays vacuous-FAIL
and the proof remains owed (carried finding, not a green claim).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178 precedent: same seeds, same probe policy, only the game code
changed) — no fresh band is needed or claimed for the pilot. THREE
PASSES on the same 5 seeds: pass A (CAPSTONE unset, BUYOUT unset —
matched re-run) then pass B (CAPSTONE=1 BUYOUT=1 — capstone delivery +
buy-out, matched to r178 pass B) then pass C (CAPSTONE=1 BUYOUT=1
BUYOUT_EARLY=1 — early buy-out, matched to r178 pass C). Pass A runs
first so its trajectories are the clean matched comparison; pass B's
trajectories diverge only from the first buy/delivery day onward; pass
C diverges from the first early buy day onward. Pass C-wide runs after
the matched three (independent seeds; no interference).

R178 PILOT BASELINE (per-seed, from the r178 run note; judged on these
seeds, pass A):
- 89701 waves: WON LESSER — announced d90, sat d91, feared/light,
  final:quiet, alive 11, pantry 9892 at end. deedGateFirstOk d76
  (w5:5). peakLivingVeterans 2.
- 89702 waves: WON LESSER — announced d90, sat d90, alive 2 living
  veterans at peak. (r171: village-lost d56; r178 substrate: survived.)
- 89703 waves: WON LESSER — announced d90, sat d93, alive 6.
  deedGate never ok (w5:0).
- 89704 forcedrift (experimental, ex-control): WON LESSER (pass A) —
  announced d90, sat d90, relay/dark, alive 7. Pass B: FULL, sat d90,
  military_tribute d89 (Omar Farouk + Rosa Mendez), priced FULL.
- 89705 wavesnw: WON LESSER — announced d90, sat d99, alive 3.
  deedGate never ok (w5:0).
Tally r178: pass A lesser 5/5, full 0/5, village-lost 0/5; pass B
lesser 3/5, full 2/5 (89701 d77, 89704 d90); pass C lesser 3/5, full
2/5 (89702 d66, 89705 d63). M23 GO, M24 GO, M24b GO (covered-by-
delivery both times), M25 VACUOUS NO-GO (3rd time), M25c GO 5/5.
M3-conversion NO-GO (armB kills 2 vs armA 12). Dark probe: 1 failed
step (v1a-loss:D2-twist-fired), bit-identical to r171.

R182 QUESTIONS: (1) pass A: does the pilot reproduce r178 modulo the
named deltas (a)-(c)? (2) does the phantom-veteran fix (a) flip
readiness on any seed — a seed where readiness now reads NOT-ready
where r178 read ready, or a tribute that now refuses where r178
delivered? (3) do the cook/mend ladder grants (b) move ladder peak /
stage / counted on any seed? (4) pass B: do the full seats on 89701
(d77) and 89704 (d90) reproduce — same day, same veterans, same seat?
(5) pass C + C-wide: does the early buy-out fire on the matched 5 and
on the fresh 8 (day, pantry, spent, pantry-after named per seed), does
it open the FULL seat on a seed where pass B did not, and does any
buy starve a village before the seat (the Joja price in lives)?
(6) M24b: is the honest-refusal path exercised on any seed this run
(scholar+1 village reading ready and refusing by name)? (7) M2b: does
the 120d sweep produce a scholar-death fight and a GREEN property
proof on any matched seed? (8) dark re-verify: re-run the FULL dark
probe as r182 (all 7 variants, same policy, fresh evidence dir
perseed-endgame-r182-dark/) and confirm the v3 walk-out line names
Amelia Moon, not Bill Palmer, and D1-D4/D6 still hold on the new
substrate. (9) people check: do the sitting seeds' finales read as
people — and if pass B/C/C-wide sits a FULL seat, does the full-seat
finale read as earned, not a default? (10) do the (a)/(b)/(c) deltas
move wave-4 kill conversion (M3 tally kept), survivability, or
competence in the pilot? (11) the diag-layer staleness blank from r158
(fullseat-diag.js still decomposes the full seat with the PRE-ladder
gate) — carried, owed to the ladder coordinator / leg 4, not changed
here; the probe's own deedGate snapshot is the honest read. (12) the
fast-branch diedInFight:[] gap from r171 (a fast fight with a causal
scholar death reads vDie but prints an empty party list) — carried, not
fixed here; watch the corpus for a fastW4 scholar-death fight.

INTERESTING FINDING (what would count): any pass-A-vs-r178 headline
difference other than the named deltas; a readiness flip caused ONLY
by the phantom fix (a); a ladder peak/stage move caused by cook/mend
(b); a scholar+1 village reading ready with an honest named refusal
(M24b GO) or a silent skip (M24b FAIL LOUDLY); a FULL-SEAT win in pass
B reproducing 89701/89704, or a FULL-SEAT win in pass C/C-wide on a new
seed; an early buy-out that fires (pantry, day, spent, pantry-after
named); an early buy-out that starves the village before the seat (the
Joja price in lives); a tribute delivery with veterans paid; a wave-5
kill on a previously w5:0 seed; a capstone delivery that refuses despite
readiness (leg-3 agreement failure); a delivered capstone that does NOT
price the full seat (tableSeat/capstone wiring failure); a bought
bundle that does NOT flip feast_embassy to ready (bundle-flag wiring
failure); a pantry that never reaches 8000 in-window on any seed (the
Joja path priced out of bot reach); an M2b party-restriction
misclassification (instrument regression — FAIL LOUDLY); a pellet lock
recurring (regression, FAIL LOUDLY in chat); a rads death with no
voicing; a cure that fires with no voicing (medic duty silent); a
ladder shortfall line that names the OLD feast bar or stays silent
where the ladder bar is the blocker; a bundle completing in the wild
with the +4 not landing in the counted points; any mFlee carrying
monFled=true on a non-flee kind (monster-commitment violation); any
hurt-return misfire; any ambush death missing from fallen; any dark
re-verify (v3) step failing; any transcript passage senseless, robotic,
or self-contradictory; a stuck helper waiting silently in a finale; an
offered seat withdrawing (sticky-offer failing in the wild); a "holds
and watches" cluster that reads as a stuck record; a pocket_sand held
but never pressed in a losing window where the scholar fled instead; a
bond proposal that fires from a roster (villagers proposing to people
they never perceived); a refusal line repeating verbatim within one
branch across days (refusal variety regression); a fastW4 fight with a
causal scholar death printing diedInFight:[] (the carried r171 gap, now
observable).

BINDINGS (pilot-scaled from r178; metric binding §14 — a miss is NO-GO,
never re-scored mid-run; PRIMARY-BINDINGS is the headline, per r135's
metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR resolve
  via a voiced non-table path (honest-death / withdrawal / survived —
  r156 revision). Judged on pass A; passes B/C/C-wide reported
  alongside.
- M2-census: every census fight carries a named outcome; >=2/3 Arm A
  waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r178).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines array
  + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing or a named
  fallback; 89704 is experimental (r156 prereg) — the fallback/vacuous
  reading applies to the forcedrift seed's relay voicing, not to a
  control comparison.
- M10-fullseat-gap: every sitting seed's full-seat gap is named (r130
  revised rule: seat-kind pass — lesser despite full bars met is a named
  gap, not NO-GO). THIS RUN: a sitting seed whose only missing full-seat
  piece is the capstone passes M10 with the gap named "capstone not
  delivered (pass A: no delivery policy)" or "capstone: <kind> delivered
  d<day>" (pass B/C), or "buy-out: pantry <8000 in-window" where the
  Joja path was the blocker, or "scholar+1: readiness counts the
  scholar, delivery refuses" where M24b applies.
- M11-standing-peak: standing peak reported for 5/5 seeds.
- FIRENARR/HURTRETURN-captured: every pilot JSON carries firenarr +
  hurtreturn arrays (instrument health; counts descriptive).
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check.
- CORPUS-PURITY (gating, from r129/r130): pilot JSON summaries match
  pilot log summaries seed-for-seed (summary PROJECTIONS, not
  file-vs-log equality — r135 correction); zero diagnostic files in the
  pilot dir. Judged per pass (A, B, C and C-wide each pure).
- L-PEAK: every pilot JSON carries ladderSnapshot (stage, peak,
  counted, byTrack, bundleStages, capstone) and the analyzer prints the
  LADDER section for 5/5 seeds.
- L-VOICE (descriptive-not-binding): seat-shortfall lines in pilot
  transcripts are counted for ladder naming (ladderLine text present
  when the ladder bar blocks) vs silence/old-feast naming. A shortfall
  that names the OLD feast bar is a same-run investigation item.
- M23-CAPSTONE (binding, pass B and C, as r178): for every pass-B/C
  seed where deedGateReady().ok is true AND ladder peak >= 3 at any
  daily read, the probe records a delivery attempt and, if a capstone
  kind reads ready, a successful delivery with the kind and price named.
  GO iff attempts == deliveries on all such seeds (no refusal despite
  readiness) AND tableSeat() prices 'full' on at least one seed where
  delivery succeeded and the seat was subsequently offered. NO-GO names
  the failing seed and the exact refusal/pricing gap. If NO pass-B/C
  seed ever reaches deedGateReady().ok && peak >= 3, M23 is VACUOUS
  (recorded as such, not GO — the full-seat question stays unmeasured
  and the blocking deed bar is named per seed).
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
- M25-BUYOUT (record-only this run, pass B, as r178): for every pass-B
  seed where the in-window daily snapshot (peak >= 3 AND deedGate ok
  AND no bundle done) shows pantryKcal >= 8000 AND the scholar at
  Haven, the probe records a buy-out attempt that day. Verdict printed;
  NOT in PRIMARY-BINDINGS (r178 metric-review revision, adopted here).
  VACUOUS if no such day on any seed.
- M25c-BUYOUT-EARLY (PRIMARY, binding, pass C and C-wide): for every
  pass-C/C-wide seed where the daily snapshot (peak >= 3 AND no bundle
  done) shows pantryKcal >= 8000 AND the scholar at Haven, the probe
  records a buy-out attempt that day. GO iff attempts cover every such
  day (no silent skip) AND every attempt result is recorded with
  ok/why/spent. VACUOUS if no such day on any seed. A buy-out that
  starves the village before the seat is recorded per seed with
  pantry-after and starvation deaths named — a finding, not a metric
  miss.
- M2b-attribution (REVISED RULE, r171): every party-restricted dieFlag
  fight is classified causal-vs-daywindow; >=1 dieFlag fight (if any
  exist) carries >=1 NAMED fight-causal death. NO-DATA if no dieFlag
  fights. The party list is the diedInFight read; diedDayWindow is
  printed alongside for audit.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count, w5kills
  count, full-seat count, lesser-sit count, ladder peak stages,
  capstone deliveries by kind, buy-outs by seed and pass. M3-conversion,
  M4-wave5-or-full, W5-question NO-GO on a closed road are the r135
  tallies, kept per pass.

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M25c: promoted to primary this run (r178 metric-review proposal,
  adopted here).
- M25: demoted to record-only this run; if vacuous a fourth time, the
  next run may drop it from the analyzer's printed set entirely.
- M24b: kept from r178; if vacuous again, the next run keeps it (the
  scholar+1 shape is the live agreement question until a seed
  exercises it).
- M3-conversion: kept from r178 (armB-vs-armA kill tally).
- M23/M24: kept from r178; M24 in its A2 revised form.
- M2b: kept from r171 (property test, not fixture — the r171
  fixture-move lesson).
- The r177 smoke-bar revision proposal (5 headline numbers +
  MANTLE-FINE + trapline + selfReq 0, not full-file byte-identity) is a
  succession-leg proposal; it does not touch this leg's bars.
