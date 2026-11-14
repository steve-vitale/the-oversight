# Journey endgame r198 — PRE-REGISTRATION (lane B, 2026-11-13 22:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (r197 succession merged
bb9e63e7b, rotation 7->4). This run plays leg 4 and writes 5, social
life, at closeout ONLY after a verified landing — a failed or partial
run does not advance the leg, per r135/r138/r140/r194 precedent.

Run number basis: latest completed Lane B runs are r194 endgame, r195
social life, r192 crisis, r193 succession, r197 succession. This run is
r198.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-14T03:56:19Z (run_id 2026-11-14T03:56:19Z).
- Main tree: `git status --short` 0 lines, disk 40% (fail line 85%).
- `git pull --ff-only` "Already up to date" at 03:56Z (master 8c83b6a9a).
- Reaper SKIPPED on a live registry lock (3rd consecutive skip; holder
  verified live by the 21:48 CST reaper entry — the known lock
  self-contention, reaper holds REGISTRY.lock for its whole 9–14 min
  scan while cron fires every 10 min; no cleanup missed by this run).
- Worktree registration took ~14 min (git reset --hard churning under
  sibling load; Lane A journey-landing-r131 registered concurrently).
  Heartbeat immediately after registration; detached heartbeat loop
  `journey2-endgame-hbloop-r198.sh` re-heartbeats every 5 min
  (hbloop-r188adopt pattern).
- Exec wall: long jobs run NOHUP-DETACHED with log polling (r178 prereg).

SUBSTRATE: master 8c83b6a9a EXACTLY (worktree HEAD at registration).
Probe-side changes only, pre-planned below, plus any game fix emerging
from the pilot (own proof test, judged on a post-fix re-run per the
r147 rule, never claimed from the pre-fix pilot). Probe:
scripts/probe-endgame-r198-20261114.js (r194 probe verbatim EXCEPT
renames r194->r198, evidence dir 2026-11-14/perseed-endgame-r198,
header, + §NO-OVER-ATTEMPT, + §REFUSAL-WINDOW — both named below).
Analyzer: scripts/analyze-endgame-r198-20261114.js (r194 analyzer
verbatim EXCEPT input dir, r194->r198, + §M23-REV — named below).
Dark probe: scripts/probe-darktable-r198-20261114.js (r194 dark probe
verbatim EXCEPT renames + outdir). COMPETENT_PIN=r127 support is
already in the tree (r194); NO A-frozen arm this run — (l) was
EXONERATED in r194 and no policy file changed since (verified:
`git log 48ed1ffd7..HEAD -- scripts/policies/` shows only r194's own
instrument commit). M2b test: GREEN from r182 — no re-sweep
(carried as proven).

HEAD DELTAS SINCE r194 SUBSTRATE (48ed1ffd7 -> 8c83b6a9a, verified by
git log; 7 src/js commits, 7 files, +188/-28):
(a) sim-retribution-b (855764c3b, [needs-eyes]): defer retribution
    death lines until after the RETRIBUTION summary. Transcript
    ordering; read by the people check.
(b) journey-landing r130 (6ccdc325e, [needs-eyes]): ask:village
    injured question gets an injured answer. Dialogue quality.
(c) sim-steeple-a (6daaafae4, [needs-eyes]): rage + steeple narration
    dedup once per (fight, monster) (#2301/#2302). Combat SAY dedup.
(d) sim-strikefall-a (12d263736, [needs-eyes]): defer death narration
    past the player strike line; kite short SCREAMS line dropped (dip
    voices it). Combat SAY dedup.
(e) sim-namelessadm-b (6c4a95602): fix nameless admission line
    (finding #2309). Dialogue wording.
(f) journey-social r195 (56655e81e, [needs-eyes]): favor-requirements
    spend-out fires under the door-block cycle + empty-recap 4-variant
    pool. Dialogue quality; the r194 prereg's carried favor-spend-out
    observation.
(g) journey-establishment r85 (9893267d9, [needs-eyes]): end-wedge
    for broken forage runs — favor menu admits live forage runs.
(h) VERSION BUMPS (249da4729, de4a749d0): build.js stamps only.
(i) Transplant families 4b/5b/6/7, r196 scale, r197 succession,
    proofrefresh-b13, sim-transplant-raid-b: evidence/prereg/record
    commits only — NO src/js change (verified: the src/js log above
    is exhaustive).
No game-balance change to table/ladder/waves. Any OTHER headline
difference is a same-run investigation item, never a road claim, and
is attributed first to these deltas before any wider claim.

§NO-OVER-ATTEMPT (probe-side, from the r194 run note — the 4th
capstone attempt on 89704 returned reason 'over'): the attempt block
fired once after the game was already over
(`ladderDeliverCapstone` returns {ok:false, reason:'over'} when
`this.over`). The r198 probe guards the attempt block with
`!Game.over && !pgC.tableDone` — no delivery attempt once the game
is over or the seat is taken. Trajectory-neutral by construction (a
refused attempt records nothing in the game); the proof test asserts
zero 'over' attempts on the r194 89704 shape re-run in smoke mode.
The 'over' refusal is also exempted from M23 (§M23-REV) as
belt-and-braces for any corpus predating the guard.

§REFUSAL-WINDOW (probe-side, from r194 finding #4 — the pass-B
transcript window was too narrow for voicing): 89704's capstone
refusal attempts were d87–d89, announce d90, so the d90→d90
transcript held NO refusal voicing. Two parts, both probe-side:
  1. The transcript window start is now
     min(announceCapIdx, firstRefusalCapIdx) where firstRefusalCapIdx
     is the capture index recorded at the earliest refused-despite-
     ready attempt — the refusal days' SAY lines enter the transcript,
     and the header names the first refusal day when it precedes
     announce.
  2. Each capstone attempt record carries `capIdx` (capture length at
     attempt time), and the per-seed JSON carries
     `capstoneRefusalVoicing`: for every refused-despite-ready
     attempt, the SAY lines emitted during that attempt call
     (capture slice capIdxBefore..capIdxAfter). HONEST LIMIT, recorded
     here before any scored seed: the refusal voicing itself lives in
     app.js (the Haven panel), NOT in the node engine —
     `ladderDeliverCapstone` returns the reason silently — so the
     in-sim voicing slice is EXPECTED to be empty for a
     'veterans-short' refusal; the record proves the absence in the
     sim corpus instead of the transcript window implying it. The
     people check reads the refusal days' lines in the widened
     transcript for whatever the engine DID say then (morning
     briefing, shortfall lines), and names the app.js-only voicing as
     the remaining gap if it is still unproven in-sim.
Proof test scripts/test-m23-revision-r198.js: (i) runs the r198 probe
in smoke mode on the r194 89704 pass-B shape and asserts zero 'over'
attempts; (ii) asserts the 89704 transcript starts before announce
(first refusal day) and the JSON carries capstoneRefusalVoicing with
one entry per refused-despite-ready attempt; (iii) runs the r198
analyzer against a synthetic pass-B corpus (one scholar+1 seed with
only 'veterans-short' refusals, one seed with a 'none-ready' attempt
only, one seed with a delivered tribute) and asserts M23 VACUOUS on
the scholar+1-only corpus, GO on the delivered corpus, and NO-GO on
a corpus with a non-exempt refusal-despite-ready.

§M23-REV (analyzer-side, adopted from the r194 metric review — the
owed revision): M23 exempts scholar+1 'veterans-short' refusals
(readiness veterans>=need but payable<need on the attempt's
readiness entry) and 'over' refusals from the failure count. The
revised rule: GO iff at least one eligible seed delivered a capstone
AND tableSeat() priced 'full' on at least one delivered seed AND
zero NON-EXEMPT refusals-despite-ready on any eligible seed.
VACUOUS (not GO) iff no eligible seed delivered AND every refusal
on eligible seeds is exempt — the full-seat question on that pass is
unanswered and M24b carries the verdict. NO-GO iff any non-exempt
refusal-despite-ready occurs, or an eligible seed delivered without
pricing full. The 'none-ready' exemption is unchanged. M24b is
unchanged and remains the metric for scholar+1 villages.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188/r194 precedent: same seeds, same probe policy,
only the game code changed) — no fresh band is needed or claimed for
the pilot.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r194
  pass A. Outdir perseed-endgame-r198.
- Pass B-live: CAPSTONE=1 BUYOUT=1 — capstone delivery + buy-out,
  matched to r194 pass B. Outdir perseed-endgame-r198-b.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r194 pass C. Outdir perseed-endgame-r198-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89714, 89715 (wavesnw) + 89716–89721 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r198-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Dark probe: FULL re-run, all 7 variants, fresh evidence dir
  perseed-endgame-r198-dark/.
TIME-BOX: passes run sequentially; the cut order if the window closes
is C-wide, then dark, then C-live, then B-live. A-live + B-live +
C-live are the committed core — the run is not complete without them.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band
89714–89721 searched across all journey preregs
(`evidence/*/journey-*-prereg.md`) and sim preregs — named NOWHERE.
The only raw "89720" hits in evidence/ are `pantryFreshAfter`
kcal values in Oct 15–17 census JSONs (e.g.
`evidence/2026-10-15/perseed-trustcensus/run-belongseek-s44.json`),
not seed bands. Band 89714–89721 is FRESH. Matched seeds 89701–89705
are deliberate reuse per the precedent above.

R194 PASS-A BASELINE (per-seed, from the r194 run note; judged on
these seeds, pass A-live):
- 89701 waves: sat d110, alive 8, ladder 3/3/58, deedGate never ok
  (w5:0), peakLivingVeterans 1, uw 4, lesser mercy/feared.
- 89702 waves: sat d116, alive 10, ladder 3/3/82, deedGate never ok
  (w5:0), peakLivingVeterans 1, uw 4, lesser audience/beloved.
- 89703 waves: sat d97, alive 8, ladder 3/3/71, deedGate never ok
  (w5:0), peakLivingVeterans 0, uw 4, lesser audience/beloved.
- 89704 forcedrift (experimental, ex-control): sat d90, alive 8,
  ladder 3/3/70, deedGate ok d87 (w5:3), peakLivingVeterans 2, uw 5,
  lesser merge/relay-dark.
- 89705 wavesnw: sat d115, alive 9, ladder 3/3/79, deedGate never ok
  (w5:1), peakLivingVeterans 3, uw 5, lesser audience/beloved.
Tally r194 pass A: lesser 5/5, full 0/5, village-lost 0/5. Pass B:
lesser 5/5, full 0/5 (M23 NO-GO, metric artifact — revised this run).
Pass C: lesser 3/5, full 2/5 (89704 feast_embassy d69/FULL d70,
89705 d72/d73), lost 0/5. C-wide: lesser 4/8, full 2/8 (89711 d93,
89712 d92), lost 2/8 (89707 scattered, 89713 scattered). M25c GO
5/5 matched, 7/8 wide. M2c GO (fights == distinct opens on every
pass). Dark probe: 1 failed step (v1a-loss: D2-twist-fired),
bit-identical to r171/r178/r182/r185/r188. Starvation: zero lives
on all 12 bought seeds.

R198 QUESTIONS: (1) pass A-live: does the pilot reproduce r194
modulo the named deltas (a)–(i)? (2) M23 under the revision: on pass
B, is the 89704 scholar+1 shape VACUOUS (all refusals exempt) with
M24b GO — and does the revised rule stay GO on pass C (deliveries
price full)? (3) §NO-OVER-ATTEMPT: zero 'over' attempts on every
pass? (4) §REFUSAL-WINDOW: does the 89704 pass-B transcript now
start at the first refusal day, and does capstoneRefusalVoicing
record the (expected-empty) in-sim slice honestly? (5) passes B/C:
do the full-seat roads reproduce — bundle on 89704/89705, tribute
still never fires? (6) C-wide fresh band: full seats? losses? does
the bundle road hold on unseen seeds? (7) dark re-verify: the
v1a-loss:D2-twist-fired step stays the ONLY failure, bit-identical,
v3 still names Amelia Moon, D1–D4/D6 hold? (8) people check: do the
sitting seeds' finales read as people — and if pass B/C sits a FULL
seat, does it read as earned? Do the new dialogue deltas read clean
— (a) retribution death-line deferral, (b) injured-question answer,
(c)/(d) steeple + strikefall dedup, (e) nameless admission fix,
(f) r195 favor spend-out? NOTE (carried): the per-seed transcripts
are SAY-line windows (announce → end, now widened to the first
refusal); conversation-turn dialogue is not captured in them, so
pool-picker deltas that live in conversation turns may again be
unexercised here — a corpus gap, recorded, not a clean verdict.
(9) the 159-turn Algorithm fight (r194 89701 d107): does it recur on
either arm, and does the (c)/(d) dedup change its shape? (10) the
fast-branch diedInFight gap from r171 — NOT recurred in r182/r185/
r188/r194; watch the corpus for a fastW4 scholar-death fight.
(11) starvation watch on every bought seed (Joja price in lives).
(12) M2b: GREEN from r182, no re-sweep — carried as proven.

INTERESTING FINDING (what would count): any pass-A-live-vs-r194
headline difference other than the named deltas; a village dying
before d90 on any pass (survival collapse — name the seed, the day,
the cause); a full seat on a new seed or a lost full seat on 89704/
89705; a tribute delivery firing (M24 exercised for the first time
in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a capstone delivery that refuses despite readiness with a
NON-exempt reason (leg-3 agreement failure); a delivered capstone
that does NOT price the full seat (tableSeat/capstone wiring
failure); a bought bundle that does NOT flip feast_embassy to ready
(bundle-flag wiring failure); an 'over' attempt recurring despite
the guard (probe-fix failure — FAIL LOUDLY); a refusal transcript
that starts at announce despite a pre-announce refusal (window-fix
failure); a pantry that never reaches 8000 in-window on any seed
(the Joja path priced out of bot reach); a pellet lock recurring
(regression, FAIL LOUDLY in chat); a rads death with no voicing; a
cure that fires with no voicing (medic duty silent); a ladder
shortfall line that names the OLD feast bar or stays silent where
the ladder bar is the blocker; a bundle completing in the wild with
the +4 not landing in the counted points; any mFlee carrying
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
regression); a fastW4 fight with a causal scholar death printing
diedInFight:[] (the carried r171 gap, now observable); the war-path
wave-5 bar line still appearing on a full-seat audit (finalvoice fix
(b) not holding — r188's carried item); the (h) wave-5 shortfall
voice missing from morning briefings where the shortfall is real
(voiceless-a build not firing — r194 found it VACUOUS on pass A,
armed 8–10 at sit); a CORPUS-PURITY NO-GO on any pass (instrument
failure, investigate before trusting that pass's verdicts).

BINDINGS (pilot-scaled from r194; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal /
  survived — r156 revision). Judged on pass A-live; passes B/C/C-wide
  reported alongside.
- M2-census: every census fight carries a named outcome; >=2/3 Arm A
  waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r194). M2c
  RE-SCOPED (r194): fights == distinct opens
  (engineOpensDistinctW4 + policyOnlyOpensW4), errs == 0.
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
- CORPUS-PURITY (binding, per pass): per-seed JSON summary
  projections match the JSON's own internals seed-for-seed; zero
  diagnostic files in the pass dir. Judged per pass (A-live, B, C
  and C-wide each pure).
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
- M23-CAPSTONE (REVISED this run — §M23-REV, binding, pass B and C):
  GO iff at least one eligible seed delivered a capstone AND
  tableSeat() priced 'full' on at least one delivered seed AND zero
  NON-EXEMPT refusals-despite-ready on any eligible seed (exempt:
  scholar+1 'veterans-short', 'over', 'none-ready'). VACUOUS (not
  GO) iff no eligible seed delivered AND every refusal on eligible
  seeds is exempt — M24b carries the verdict on that pass. NO-GO
  iff any non-exempt refusal-despite-ready occurs, or an eligible
  seed delivered without pricing full. If NO pass-B/C seed ever
  reaches deedGateReady().ok && peak >= 3, M23 is VACUOUS (recorded
  as such, not GO — the full-seat question stays unanswered and the
  blocking deed bar is named per seed).
- M24-TRIBUTE-AGREEMENT (revised A2, binding, pass B and C): if
  military_tribute is delivered, the delivery paid exactly `need`
  veterans AND readiness at delivery was >= need (readiness counts
  the scholar per the fix; payable is non-scholar). GO iff equal on
  every tribute delivery; vacuous if no tribute delivery fires.
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
- M3-conversion: RETIRED as a verdict (r188) — printed as a
  descriptive tally only. NOT in PRIMARY, NOT in ALL, NOT gated.
- M2b-attribution: GREEN from r182, no re-sweep (carried as proven).
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  w5kills count, full-seat count, lesser-sit count, ladder peak
  stages, capstone deliveries by kind, buy-outs by seed and pass.
  M3-conversion, M4-wave5-or-full, W5-question NO-GO on a closed road
  are the r135 tallies, kept per pass.

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M23-capstone (REVISED this run): exempt scholar+1 'veterans-short'
  and 'over' refusals; VACUOUS-when-all-exempt (not GO). Adopted from
  the r194 metric review.
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: probe fixes adopted this run
  from r194 findings #4 + the M23 analysis.
- M2c adoptedRefs (HOLD): guard held on every r194 pass; keep the
  re-scope (fights == distinct opens).
- CORPUS-PURITY (HOLD): GO on every r194 pass; keep.
- M25c buyout-early (HOLD): GO on matched and wide in r194; keep.
- M24b (HOLD): GO on first firing in r194; keep as the scholar+1
  metric.
- §BLANK (fullseat-diag ladder decomposition) — OUT OF SCOPE,
  documented (r194 metric review): the stale layer is confined to
  the sim-fullseat-a census diag; the endgame analyzer's M10 already
  does the ladder-aware decomposition. Not forced.
- Telemetry baseline: r188 baseline stands (r194: pass-A sums uw 22,
  won 5, peakVet 7 vs baseline uw 22, won 4, peakVet 8 — ±1, same
  regime, NOT rolled). This run compares pass-A-live against the r188
  baseline (same 5 seeds, same regime, live policy).
- The r177 smoke-bar revision proposal (5 headline numbers +
  MANTLE-FINE + trapline + selfReq 0, not full-file byte-identity) is
  a succession-leg proposal; it does not touch this leg's bars.
