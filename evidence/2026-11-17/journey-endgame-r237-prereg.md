# Journey endgame r237 — PRE-REGISTRATION (lane B, 2026-11-17 14:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (succession r231 landed,
rotation 7->4). This run plays leg 4 and writes 5, social life, at closeout
ONLY after a verified landing — a failed or partial run does not advance the
leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r236
(scale, Lane A, in flight at run start — worktree journey-scale active,
unmerged). This run is r237 (max+1). Note: r230 was used twice (endgame
2026-11-16 AND succession 2026-11-17) — a numbering collision by two
coordinators reading the same max; this run takes max+1 to avoid a third.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-17T19:55:52Z (run_id 2026-11-17T19:55:52Z).
- Main tree: `git status --short` 0 lines, disk 44% (fail line 85%).
- `git pull` "Already up to date" at 19:55Z (master 7413db0f7).
- Reaper ran at run start: SKIPPED (registry lock held by another reaper
  run, consecutive skips: 1) — no cleanup this run; 8 LOUD-dirty trees
  from other owners (never auto-removed, not mine to touch).
- Registration: `worktree-register.sh journey2-endgame` slow to complete
  (~18 min: internal reap + `git worktree add` checkout of 100k+ files
  on a loaded box; load avg peaked 16.1 during the checkout, the
  `git reset --hard` ran CPU-starved). Branch journey2-endgame did not
  exist (deleted at r233 release), so `-b` created it fresh at master.
  Heartbeat lands immediately after registration (hbloop pid 19179,
  every 10 min).

SUBSTRATE: master 7413db0f7 EXACTLY (worktree HEAD). No fix arm pre-filed
this run. A defect the panel surfaces is filed as an F-item and fixed
only under the r147 rule (planned before scored seeds, own proof test,
judged on the post-fix panel); a mid-run fix otherwise gets its own proof
+ a re-run of affected passes, recorded in the run note.
Probe: scripts/probe-endgame-r237-20261117.js (r233 probe verbatim EXCEPT
renames r233->r237, evidence dir 2026-11-17/perseed-endgame-r237,
PLAN-map entries 89770-89777, + the read-only deathCleanups end-of-run
sample named below). Analyzer:
scripts/analyze-endgame-r237-20261117.js (r233 analyzer verbatim EXCEPT
input dir, r233->r237). Dark probe: SKIPPED — no delta since r211 touched
the dark table (r211 skipped on the same reasoning; r219/r225/r230/r233
skipped too). COMPETENT_PIN=r127 support already in the tree.
NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
M2b GREEN from r182 — no re-sweep (carried as proven).

HEAD DELTAS SINCE r233 SUBSTRATE (7328a88fa -> 7413db0f7, verified by
git log + git diff; 74 commits, net src/js diff 10 files, +434/-52):
(a) WIN-PLAN DEATH / NON-DEATH CLEANUP (sim-deathcleanup-b 5f583a056 +
    correction 1f3187fc2; sim-nondeathplan-b BUILD 446a96ef4 + adoption
    correction a3a7be77c) — HEADLINE delta: a win-plan dies with its
    holder (delete own entry + purge from every holder party) and dies
    on ANY removal (leave hook + fled-betrayer choke-point routing);
    the correction stops winPlanOnVillagerDeath from materializing the
    plan store in sleeping villages (non-creating read). Live-proof GO
    claimed on frozen bars (b921fde4f), but this panel is the first
    endgame-panel sighting on the matched band — plans are the launch
    vehicle for wave-4 kills, so plan death bears DIRECTLY on wave-5
    facing, veterans, and the deed gate. Attribution first for any
    launch/kill/gate headline difference. Probe-side watch: read-only
    end-of-run `deathCleanups` sample (same shape as the r233
    companionGuard instrument, zero src/js).
(b) Dialogue quality; RNG-draw shifting possible: crisis r230
    quote-aware pagination (7eb8ffc22), social r234 DRY2 fix
    (39eaa043e), succession r231 mourning lines stop wearing different
    names (ec7abcd00), establishment r230/r231 favor-dialogue fixes
    (convo-dialogue.js / convo-wants.js / truth.js). All bear on the
    F5 settled-favor question and the C3d watch.
(c) Titans: scale r233 refusal once per titan per day (fdf79a680),
    deepening r232 field-killed titan reconciliation at dawn
    (a6e2bfb58). Titan-finale adjacent, minor for this panel.
(d) PLANFIX lever (sim-planignite-fix-a 8558394d6): env-gated
    default-OFF — INERT for the default panel.
(e) All other sim arms since r233 were ADDED then REVERTED or are
    instrument / evidence only — net zero in game code (NIGHTCARRY
    reverted, TRICKSHARE reverted, REATTACH/RUMORTARGET reverted).
(f) Version bumps: build.js stamp only.
No table/ladder/waves/monster change. No docs/ change except ONTOLOGY.md
(deathcleanup sync). Any OTHER headline difference is a same-run
investigation item, never a road claim, and is attributed first to
these deltas before any wider claim — with (a) first for any
launch/kill/gate difference, (b) first for any trajectory re-roll.

PROBE ENV (six vars — r198 RELAYGREY lesson, not five): FULLSEAT,
VETCOMMIT, CAPABLE_GREEDY, ARMORYDRIVE, CAPABLE_VETGUARD, RELAYGREY.
TELEMETRY_FULL is inert in this probe (never read).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188/r194/r198/r203/r211/r219/r225/r230/r233
precedent: same seeds, same probe policy, only the game code changed) —
no fresh band is needed or claimed for the pilot.
SMOKE (harness + timing check, not a binding panel seed): 89706
(wavesnw), pass-A policy, full horizon. Records probe wall time per
seed on this box; if the smoke fails to boot, FAIL LOUDLY and stop.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r233
  pass A. Outdir perseed-endgame-r237. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r233 pass C. Outdir perseed-endgame-r237-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89770, 89771 (wavesnw) + 89772–89777 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r237-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Pass B: SKIPPED BY DESIGN — r230 pass B was vacuous NO-GO (0
  capstone attempts, 0 deliveries, 0 buyout attempts on all 5 seeds;
  deed gate ok on 0/5). The converting road is pass C, not B; re-running
  B on this substrate would only re-confirm vacuity. The interesting
  questions (does the road still convert? does wave 5 get faced?) are
  answered by passes A, C, and C-wide.
TIME-BOX: passes run sequentially; the cut order if the window closes
is C-wide, then C-live. A-live is the committed core — the run is not
complete without it. PILOT FIRST (§9): the smoke + first two pass-A
seeds verify the harness on this substrate before the full panel burns.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89770–89777
searched across all journey preregs (evidence/*/journey-*-prereg.md)
and sim preregs (evidence/*/sim-*-prereg.md), plus a broad grep for
89770–89777 across all of evidence/ — ZERO hits in any prereg, screen,
forbidden or contaminated list. (The only 8977x hits anywhere in
evidence/ are incidental floats/counts inside old corpus JSONs, e.g.
totalKcal values — not seed-band namings.) Forbidden-band notes
(r104 etc.) name 94xxx–97xxx saturation — not the 897xx range.
89760–89767 was used by r233 (today) and is NOT reused. Named only
here, as the r237 C-wide band.

R233 PASS-A BASELINE (per-seed, from the r233 run note; judged on
these seeds, pass A-live):
- 89701 waves: ann90/sat91/lesser/feared/light, won, uw 5, w5max 2,
  FACED WAVE 5 (editor d81, timeslot d90), peakVet 2, standing peak 430,
  releaseSnap d79 ready (2 living veterans).
- 89702 waves: ann90/sat90/lesser/feared/light, won, uw 4, w5max 0,
  peakVet 1, standing 199.
- 89703 waves: ann90/sat90/lesser/beloved/light, won, uw 4, w5max 0,
  peakVet 1, standing 199.
- 89704 forcedrift: ann90/sat90/lesser/relay/dark, won, uw 5, w5max 0,
  peakVet 2, standing 292, relay noticed 1 / crossed 1.
- 89705 wavesnw: ann90/sat99/lesser/beloved/light, won, uw 4, w5max 0,
  peakVet 0, standing 199.
- 89706 wavesnw (smoke): ann90/sat100/lesser/beloved/light, won, uw 4.
Tally r233 pass A: lesser 6/6, full 0/6, village-lost 0/6. M23b 0/6.
Pass C: lesser 5/6, full 1/6 (89703 FULL d90, gate ok d89, feast
embassy delivered); M23b 1/6; M25c 6/6 bought early. C-wide
(89760–89767): lesser 8/8, lost 0/8, full 0/8, M25c 8/8, w5max 0/8,
M23b 0/8.

R237 QUESTIONS: (1) pass A-live: does the pilot reproduce r233 modulo
the named deltas (a)–(f) — in particular, does plan-death-on-removal
move wave-5 facing, veteran banking, or the deed gate on the matched
band? (2) M23b: on pass C, does the deed gate go ok and does the
buyout road convert again (r233: 1/6 on 89703 — repeat, rotate to
another seed, or revert)? (3) does a SECOND buyout seed convert this
round? (4) C-wide fresh band: does ANY seed face wave 5 (w5max>0) or
take a full seat — or does the r233 finding (0/8 faced, 0/8 full)
hold? (5) F5: does the settled-favor branch fire in the wild on THIS
panel (r233 endgame: vacuous 0 hits; succession r230: FIRED 2× via
alive:want — the branch IS reachable in panel play; the open question
is whether the endgame panel's sittings reach it)? (6) C3d: does the
recap-live-want fix hold in the wild — a recap naming the live want
instead of the empty pool (r233: vacuous, no recap sittings on the
endgame panel; the watch stays open for a panel with recap sittings)?
(7) COMPANIONGUARD: do launches still form pairs/trios under the
guard + plan-death — count guard skips (companionGuardSkips) and watch
for a plan record listing a companion who never left (the mirror gap
the guard claims closed; r233: 9 skips, 219 medicDutyBlocked)?
(8) DEATHCLEANUP: how many win-plan deaths fire per seed
(deathCleanups sample) — and does any plan die with its holder
mid-launch in a way that strands a launch? (9) does 89705 lose its
village again (r230: lost d59; r233: survived, sat d99), or does the
plan-death delta change its fate? (10) starvation watch on every
bought seed (Joja price in lives). (11) funeral-mend watch (r233:
fired + voiced on C-wide). (12) the 159-turn Algorithm fight (r194
89701 d107): does it recur? (13) the fastW4 diedInFight gap (r171):
watch the corpus for a fastW4 scholar-death fight.

INTERESTING FINDING (what would count): any pass-A-live-vs-r233
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r233 had uw 4; a full seat on pass A; a full
seat on a new C-wide seed; a SECOND full seat on pass C; a village
dying before d90 on any pass (survival collapse — name the seed, the
day, the cause); a tribute delivery firing (M24 exercised for the first
time in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a deedGateFirstOk on a seed where r233 had none (M23b moves); a
capstone delivery that refuses despite readiness with a NON-exempt
reason (leg-3 agreement failure); a delivered capstone that does NOT
price the full seat (tableSeat/capstone wiring failure); a bought
bundle that does NOT flip feast_embassy to ready (bundle-flag wiring
failure); an 'over' attempt recurring despite the guard (probe-fix
failure — FAIL LOUDLY); a refusal transcript that starts at announce
despite a pre-announce refusal (window-fix failure); a pantry that
never reaches 8000 in-window on any seed (the Joja path priced out of
bot reach); a pellet lock recurring (regression, FAIL LOUDLY in chat);
a rads death with no voicing; a cure that fires with no voicing (medic
duty silent); a ladder shortfall line that names the OLD feast bar or
stays silent where the ladder bar is the blocker; a bundle completing
in the wild with the +4 not landing in the counted points; any mFlee
carrying monFled=true on a non-flee kind (monster-commitment
violation); any hurt-return misfire; any ambush death missing from
fallen; any transcript passage senseless, robotic, or
self-contradictory; a stuck helper waiting silently in a finale; an
offered seat withdrawing (sticky-offer failing in the wild); a "holds
and watches" cluster that reads as a stuck record; a pocket_sand held
but never pressed in a losing window where the scholar fled instead; a
bond proposal that fires from a roster (villagers proposing to people
they never perceived); a refusal line repeating verbatim within one
branch across days (refusal variety regression); a fastW4 fight with a
causal scholar death printing diedInFight:[] (the carried r171 gap,
now observable); the war-path wave-5 bar line still appearing on a
full-seat audit (finalvoice fix (b) not holding — r188's carried item);
the (h) wave-5 shortfall voice missing from morning briefings where
the shortfall is real (voiceless-a build not firing); a CORPUS-PURITY
NO-GO on any pass (instrument failure, investigate before trusting
that pass's verdicts); a fusion-offer event firing with the pellet gate
misfiring (prize bag granting fusion_reactor without pellet possession,
or the offer firing while a sheet is pending); ANY `SYSTEM: ""` line in
a post-fix panel transcript (fix regression — FAIL LOUDLY); a
funeral-mend event firing with no voicing, or a funeral changing
survival in a way the r233 panel cannot explain; an F5-class dry hit
in the wild (fix failure — FAIL LOUDLY); a C3d erasure in the wild (a
recap serving the empty pool while a live want is open — the r231
fix failing — FAIL LOUDLY); a companion-guard skip with no counter
increment (instrument gap); a plan record listing a companion whose
expedition never existed (mirror gap recurring — FAIL LOUDLY); a
win-plan dying with its holder while a launch is mid-flight, leaving
a stranded launch with no voice (deathcleanup gap — investigate, do
not road-claim).

BINDINGS (carried from r203/r211/r219/r225/r230/r233 verbatim; metric
binding §14 — a miss is NO-GO, never re-scored mid-run;
PRIMARY-BINDINGS is the headline, per r135's metric review; full text
in evidence/2026-11-14/journey-endgame-r203-prereg.md, §BINDINGS):
M1-guard, M2-census, M2c/M2d engine coverage, MFLEE-routed-coverage,
KILL-ANATOMY-coverage, M5-voicing-canonical (REVISED (R2) r211:
vacuous without a control seed), M10-fullseat-gap, M11-standing-peak,
FIRENARR/HURTRETURN-captured, FALLEN-ambush, CORPUS-PURITY (per pass),
L-PEAK, M21-audit-crosscheck (full-seat exemption), M23-CAPSTONE
(r199 fix; VACUOUS prints per (R1) r211), M24-TRIBUTE-AGREEMENT,
M24b-SCHOLAR-PLUS-ONE, M25c-BUYOUT-EARLY, ROAD-TALLY (REVISED (R3)
r211: earned vs sat). M25-BUYOUT dropped (r185). M3-conversion
retired as a verdict (r188, tally only). M2b GREEN from r182, carried.
§NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD. M23b GATE-OK TALLY: new
observation tally this run (not a binding verdict).

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M23b adopted in r219; proof test test-analyzer-m23b-r219.js 12/12.
  Tally r233: pass A 0/6, pass C 1/6, C-wide 0/8.
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held in r233).
- M2c adoptedRefs (HOLD). CORPUS-PURITY (HOLD — GO on every r233
  pass). M25c buyout-early (HOLD — GO 6/6 matched, 8/8 fresh in r233).
  M24b (HOLD — vacuous on every pass so far).
- Telemetry baseline: r188 baseline stands (r233 pass-A sums uw 27,
  won 6/6, peakVet 7 — quiet, NOT rolled). This run compares
  pass-A-live against the r188 baseline (same 6 seeds, same regime,
  live policy).
- companionGuardSkips watch (r233: 9 total, 219 medicDutyBlocked):
  HOLD as a watch, not a binding. NEW WATCH (not a binding):
  deathCleanups per seed — the plan-death delta's first endgame-panel
  sighting; a count of 0 on all seeds is a vacuous watch, not a
  failure (plans only die when a holder is removed).
