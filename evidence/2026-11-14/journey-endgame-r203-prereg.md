# Journey endgame r203 — PRE-REGISTRATION (lane B, 2026-11-14 11:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (r202 succession landed
f524932d6, rotation 7->4, verified in the memory log). This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing — a
failed or partial run does not advance the leg, per r135/r138/r140/r194
precedent.

Run number basis: latest completed Lane B runs are r198/r199 endgame, r200
social life, r201 crisis, r202 succession. This run is r203.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-14T16:55:39Z (run_id oversight-playtest-loop-2-20261114T1655Z).
- Main tree: `git status --short` 0 lines, disk 41% (fail line 85%).
- `git pull --ff-only` "Already up to date" at 16:55Z (master 723c53571).
- Reaper ran at run start (log
  ~/workspace/worktrees/journey2-endgame-r203-reap.log): removed nothing;
  14/16 active, all dirty (never auto-removed).
- Worktree registration attempt #1 KILLED by `timeout 600` at 17:08Z
  mid-checkout (partial dir: only evidence/ checked out, no .git, no
  registry entry; the `REG_EXIT:0` it printed measured `tail`, not the
  script). Box load ~20 at the time. Cleaned: partial dir removed,
  `git worktree prune` run (also cleared a stale
  sim-transplant15c-js-a admin entry whose gitdir pointed nowhere);
  branch journey2-endgame survived (created by the killed attempt).
  Retry #2 launched 17:11Z nohup-detached, log
  ~/workspace/worktrees/journey2-endgame-r203-register2.log; checkout
  visibly progressing. Heartbeat immediately after registration;
  detached heartbeat loop `journey2-endgame-hbloop-r203.sh`
  re-heartbeats every 5 min (hbloop-r198/r199 pattern).
- Exec wall: long jobs run NOHUP-DETACHED with log polling (r178 prereg).

SUBSTRATE: master 723c53571 EXACTLY (worktree HEAD at registration).
Probe-side changes only, pre-planned below, plus any game fix emerging
from the pilot (own proof test, judged on a post-fix re-run per the
r147 rule, never claimed from the pre-fix pilot). Probe:
scripts/probe-endgame-r203-20261114.js (r198 probe verbatim EXCEPT
renames r198->r203, evidence dir 2026-11-14/perseed-endgame-r203,
header). Analyzer: scripts/analyze-endgame-r203-20261114.js (r198
analyzer verbatim EXCEPT input dir, r198->r203 — INCLUDING the r199
one-line M23 fix at line ~1272, `capNoRefusal` without `&& x.delivered`).
Dark probe: scripts/probe-darktable-r203-20261114.js (r198 dark probe
verbatim EXCEPT renames + outdir). COMPETENT_PIN=r127 support is
already in the tree. NO A-frozen arm this run — (l) was EXONERATED in
r194 and no policy file changed since. M2b test: GREEN from r182 — no
re-sweep (carried as proven).

HEAD DELTAS SINCE r198 SUBSTRATE (8c83b6a9a -> 723c53571, verified by
git log; 7 src/js commits, +188/-28 plus the r198/r199/r200/r201/r202
landings themselves):
(a) 63c051206 journey-landing r131: HEED fix — warn_you warning now
    engages the want. Dialogue quality.
(b) e73ee835d sim-rageprecheck-b: refuse Unleash Rage re-press while
    rageActive live. Combat SAY/behavior.
(c) 4c860321d journey-deepening r191: stage-0 guard fresh-favor
    reorder — H1 phantom re-ask fix. Dialogue quality.
(d) afa416371 sim-fusionoffer-b: fusion offer defers while a sheet is
    pending; prize bag gates fusion_reactor on pellet possession.
    Endgame-adjacent (pellet/fusion gating) — watch the corpus for a
    fusion-offer event.
(e) 16f05da86 version bump: build.js stamp only.
(f) f1871e37b journey-crisis r201: favor-want settle gate. Dialogue
    quality (a favor thread settles only when the favor itself is
    fulfilled/thanked).
(g) 3bffd4752 journey-landing r132: nod-loop fix — repeat nv: gesture
    thins the sitting. Dialogue quality.
(h) r198/r199/r200/r201/r202 landings: evidence/tooling + the two
    conversation fixes (f)/(g) above; no table/ladder/waves change.
(i) Transplant families 12–15, proofrefresh-b17, standing99107-b,
    sim-transplant15a-fresh-a: evidence/record commits only — NO
    src/js change (verified: the src/js log above is exhaustive).
No game-balance change to table/ladder/waves. Any OTHER headline
difference is a same-run investigation item, never a road claim, and
is attributed first to these deltas before any wider claim.

PROBE ENV (six vars — r198 RELAYGREY lesson, not five): FULLSEAT,
VETCOMMIT, CAPABLE_GREEDY, ARMORYDRIVE, CAPABLE_VETGUARD, RELAYGREY.
TELEMETRY_FULL is inert in this probe (never read).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188/r194/r198 precedent: same seeds, same probe
policy, only the game code changed) — no fresh band is needed or
claimed for the pilot.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r198
  pass A. Outdir perseed-endgame-r203.
- Pass B-live: CAPSTONE=1 BUYOUT=1 — capstone delivery + buy-out,
  matched to r198 pass B. Outdir perseed-endgame-r203-b.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r198 pass C. Outdir perseed-endgame-r203-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89714, 89715 (wavesnw) + 89716–89721 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r203-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped. (CUT in r198 and r199 for window reasons; the band is
  still fresh — only the r198/r199 preregs name it.)
- Dark probe: FULL re-run, all 7 variants, fresh evidence dir
  perseed-endgame-r203-dark/.
TIME-BOX: passes run sequentially; the cut order if the window closes
is dark, then C-wide, then C-live, then B-live. A-live + B-live +
C-live are the committed core — the run is not complete without them.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band
89714–89721 searched across all journey preregs
(`evidence/*/journey-*-prereg.md`) and sim preregs — named ONLY in
the r198 and r199 endgame preregs (as reserved/fresh, CUT/unused).
No scored seed uses it. Band 89714–89721 is FRESH. Matched seeds
89701–89705 are deliberate reuse per the precedent above.

R198 PASS-A BASELINE (per-seed, from the r198 run note; judged on
these seeds, pass A-live):
- 89701 waves: sat d92, alive 8, ladder 3/3/69, deedGate never ok
  (w5:0), peakLivingVeterans 1, uw 4, lesser feared.
- 89702 waves: sat d116, alive 10, ladder 3/3/82, deedGate never ok
  (w5:0), peakLivingVeterans 1, uw 4, lesser beloved.
- 89703 waves: sat d97, alive 8, ladder 3/3/71, deedGate never ok
  (w5:0), peakLivingVeterans 0, uw 4, lesser beloved.
- 89704 forcedrift (experimental, ex-control): sat d90, alive 8,
  ladder 3/3/70, deedGate ok d87 (w5:3), peakLivingVeterans 2, uw 5,
  lesser merge/relay-dark.
- 89705 wavesnw: sat d115, alive 9, ladder 3/3/79, deedGate never ok
  (w5:1), peakLivingVeterans 3, uw 5, lesser beloved.
Tally r198 pass A: lesser 5/5, full 0/5, village-lost 0/5. Pass B:
lesser 4/5, full 1/5 (89705), lost 0/5 (M23 NO-GO in r198 as printed
— metric-implementation miss, FIXED in r199; re-scored ALL GO).
Pass C: lesser 3/5, full 2/5 (89703, 89704), lost 0/5. M25c GO
5/5 matched. M2c GO. Dark probe: 1 failed step (v1a-loss:
D2-twist-fired), bit-identical to r171/r178/r182/r185/r188/r194.
Starvation: zero lives on all 12 bought seeds (r198) — 89704 pass C
had a thirst-led crunch (4 thirst + 2 starvation d53–62, NOT
buyout-caused).

R203 QUESTIONS: (1) pass A-live: does the pilot reproduce r198
modulo the named deltas (a)–(i)? (2) M23 under the r199-fixed
analyzer: on pass B, is the 89704 scholar+1 shape GO (not NO-GO) —
the fix's first fresh-panel confirmation? (3) §NO-OVER-ATTEMPT: zero
'over' attempts on every pass? (4) §REFUSAL-WINDOW: does the 89704
pass-B transcript still start at the first refusal day, and does
capstoneRefusalVoicing record the (expected-empty) in-sim slice
honestly? (5) passes B/C: do the full-seat roads reproduce — bundle
on 89704/89705, tribute still never fires? (6) C-wide fresh band:
full seats? losses? does the bundle road hold on unseen seeds?
(7) dark re-verify: the v1a-loss:D2-twist-fired step stays the ONLY
failure, bit-identical, v3 still names Amelia Moon, D1–D4/D6 hold?
(8) people check: do the sitting seeds' finales read as people — and
if pass B/C sits a FULL seat, does it read as earned? Do the new
dialogue deltas read clean — (a) HEED warning engaging the want,
(c) stage-0 fresh-favor reorder, (f) favor-want settle gate,
(g) nod-loop gesture thinning? (9) the 159-turn Algorithm fight
(r194 89701 d107): does it recur on either arm, and does the (b)
rage re-press refusal change a long fight's shape? (10) the
fast-branch diedInFight gap from r171 — NOT recurred in
r182/r185/r188/r194/r198; watch the corpus for a fastW4
scholar-death fight. (11) starvation watch on every bought seed
(Joja price in lives). (12) r198 findings (a)–(d) (SAY repetition,
Indispensable middle-beats linearization, doubled quotes, unmerged
Blackberry stacks) — documented, out of this run's scope unless a
fix emerges from the pilot. (13) fusion-offer delta (d): does any
corpus event show the pellet-possession gate or the sheet-pending
deferral firing?

INTERESTING FINDING (what would count): any pass-A-live-vs-r198
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
failure, investigate before trusting that pass's verdicts); a
fusion-offer event firing with the pellet gate misfiring (prize bag
granting fusion_reactor without pellet possession, or the offer
firing while a sheet is pending).

BINDINGS (carried from r198 verbatim; metric binding §14 — a miss is
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
- M23-CAPSTONE (REVISED in r198, FIXED in r199 — binding, pass B
  and C): GO iff at least one eligible seed delivered a capstone AND
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
- M23-capstone (REVISED in r198, FIXED in r199): this run is the
  first FRESH-panel confirmation of the fix — pass B's mixed shape
  (delivered + exempt-undelivered) must print GO on live seeds, not
  just on the r199 proof synthetics + re-scored corpus.
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held in r198/r199).
- M2c adoptedRefs (HOLD): guard held on every r198 pass.
- CORPUS-PURITY (HOLD): GO on every r198 pass.
- M25c buyout-early (HOLD): GO on matched and wide in r194/r198.
- M24b (HOLD): GO on first firing in r194, held r198.
- C-wide: first attempt since r194's wide band (CUT in r198/r199).
- Telemetry baseline: r188 baseline stands (r198: pass-A sums uw 22,
  won 5, peakVet 7 vs baseline uw 22, won 4, peakVet 8 — ±1, same
  regime, NOT rolled). This run compares pass-A-live against the r188
  baseline (same 5 seeds, same regime, live policy).
- The r177 smoke-bar revision proposal (5 headline numbers +
  MANTLE-FINE + trapline + selfReq 0, not full-file byte-identity) is
  a succession-leg proposal; it does not touch this leg's bars.
