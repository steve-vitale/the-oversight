# Journey endgame r233 — PRE-REGISTRATION (lane B, 2026-11-17 04:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (succession r230 landed,
rotation 7->4). This run plays leg 4 and writes 5, social life, at closeout
ONLY after a verified landing — a failed or partial run does not advance the
leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r232
(deepening, Lane A, in flight at run start — worktree journey-deepening
active, unmerged). This run is r233 (max+1). Note: r230 was used twice
(endgame 2026-11-16 AND succession 2026-11-17) — a numbering collision by
two coordinators reading the same max; this run takes max+1 to avoid a
third.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-17T09:55:46Z (run_id oversight-playtest-loop-2-20261117T095546Z).
- Main tree: `git status --short` 0 lines, disk 45% (fail line 85%).
- `git pull` "Already up to date" at 09:55Z (master 7328a88fa).
- Reaper ran at run start: removed nothing; 11/16 active, 10 LOUD-dirty
  (never auto-removed).
- Registration: `worktree-register.sh journey2-endgame` slow to complete
  (~22 min: internal reap + `git worktree add` checkout on a loaded box;
  the reset --hard ran CPU-starved, ~2 CPU-min in 20 elapsed min).
  Branch journey2-endgame did not exist (deleted at r230 release), so
  `-b` created it fresh at master. Heartbeat lands immediately after
  registration (heartbeat_at 2026-11-17T10:21:06Z), plus a 10-min hbloop
  for the run.

SUBSTRATE: master 7328a88fa EXACTLY (worktree HEAD). No fix arm pre-filed
this run. A defect the panel surfaces is filed as an F-item and fixed
only under the r147 rule (planned before scored seeds, own proof test,
judged on the post-fix panel); a mid-run fix otherwise gets its own proof
+ a re-run of affected passes, recorded in the run note.
Probe: scripts/probe-endgame-r233-20261117.js (r230 probe verbatim EXCEPT
renames r230->r233, evidence dir 2026-11-17/perseed-endgame-r233,
PLAN-map entries 89760-89767). Analyzer:
scripts/analyze-endgame-r233-20261117.js (r230 analyzer verbatim EXCEPT
input dir, r230->r233). Dark probe: SKIPPED — no delta since r211 touched
the dark table (r211 skipped on the same reasoning; r219/r225/r230 skipped
too). COMPETENT_PIN=r127 support already in the tree. NO A-frozen arm —
(l) EXONERATED in r194 and no policy file changed since. M2b GREEN from
r182 — no re-sweep (carried as proven).

HEAD DELTAS SINCE r230 SUBSTRATE (e60b8241e -> 7328a88fa, verified by
git log + git diff; 87 commits, net src/js diff 6 files, +151/-33):
(a) COMPANIONGUARD SHIPPED UNCONDITIONAL (sim-companionguard-b,
    villager-agency.js + villager-brain.js): a companion call no longer
    overwrites a villager's live expedition (skips them, burns no gear
    or care, counter companionGuardSkips); the plan record lists only
    villagers whose expedition actually exists after the call (closes
    the mirror gap for sick/hurt-blocked companions too). LIVE in the
    browser and in this panel. Bears DIRECTLY on party launches and
    therefore on wave-4 kills — the first game-code delta since r230
    that can move the winnability chain. Attribution first for any
    launch/kill headline difference.
(b) Dialogue quality; RNG-draw shifting possible:
    - F1 settled-ledger fix (r231 establishment, af1791e90,
      convo-dialogue.js + convo-wants.js): a deferred ask surfaces
      past a settled ledger favor — help no longer answers "already
      handled" about a dead favor while a live need waits.
    - C3d recap-live-want fix (r231 social, db83d5ccd,
      conversation.js): a recap names the live want when the thread
      log is empty instead of serving the empty pool.
    - dlg:help stage-0 offer (r230 establishment, b9300b938): the
      menu offers dlg:help for stage-0 ask_favor wants with a live
      need.
    All three bear on the F5 settled-favor question and the C3d watch.
(c) All other sim arms since r230 (reattach, deadplan, haventickgate,
    nightcarry-resume, zeroattempt) were ADDED then REVERTED or are
    instrument / evidence only — net zero in game code. (d) Version
    bumps: build.js stamp only.
No table/ladder/waves/monster change. No docs/ change. Any OTHER headline
difference is a same-run investigation item, never a road claim, and is
attributed first to these deltas before any wider claim — with (a) first
for any launch/kill difference, (b) first for any dialogue/trajectory
re-roll.

PROBE ENV (six vars — r198 RELAYGREY lesson, not five): FULLSEAT,
VETCOMMIT, CAPABLE_GREEDY, ARMORYDRIVE, CAPABLE_VETGUARD, RELAYGREY.
TELEMETRY_FULL is inert in this probe (never read).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188/r194/r198/r203/r211/r219/r225/r230 precedent:
same seeds, same probe policy, only the game code changed) — no fresh
band is needed or claimed for the pilot.
SMOKE (harness + timing check, not a binding panel seed): 89706
(wavesnw), pass-A policy, full horizon. Records probe wall time per
seed on this box; if the smoke fails to boot, FAIL LOUDLY and stop.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r230
  pass A. Outdir perseed-endgame-r233. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r230 pass C. Outdir perseed-endgame-r233-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89760, 89761 (wavesnw) + 89762–89767 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r233-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Pass B: SKIPPED BY DESIGN — r230 pass B was vacuous NO-GO and the
  converting road is pass C, not B; re-running B on this substrate
  would only re-confirm vacuity. The interesting questions (does the
  road still convert? does wave 5 get faced?) are answered by passes
  A, C, and C-wide.
TIME-BOX: passes run sequentially; the cut order if the window closes
is C-wide, then C-live. A-live is the committed core — the run is not
complete without it. PILOT FIRST (§9): the smoke + first two pass-A
seeds verify the harness on this substrate before the full panel burns.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89760–89767
searched across ALL journey preregs (evidence/*/journey-*-prereg.md)
and sim preregs (evidence/*/sim-*-prereg.md), plus a broad grep for
89760–89767 across all of evidence/ — ZERO hits. Forbidden-band notes
(r104 etc.) name 94xxx–97xxx saturation — not the 897xx range. Named
only here, as the r233 C-wide band.

R230 PASS-A BASELINE (per-seed, from the r230 run note; judged on
these seeds, pass A-live):
- 89701 waves: sat d105, lesser, w5max 0, peakVet 1, uw 4, standing 199.
- 89702 waves: FACED WAVE 5 (w5max 4), sat lesser, uw 5, peakVet 2,
  standing 617, gate ok d65.
- 89703 waves: sat d102, lesser, w5max 0, peakVet 0, uw 4, standing 199.
- 89704 forcedrift: FACED WAVE 5 (w5max 1), sat lesser, uw 5, peakVet 2,
  standing 496; gate did NOT go ok (r225: ok d82).
- 89705 wavesnw: VILLAGE LOST d59 (scattering, 6 deaths by d58).
Tally r230 pass A: lesser 4/5, full 0/5, village-lost 1/5. M23b 1/5.
Pass C: lesser 4/5, full 1/5 (89704 FULL d90, gate ok d84, feast
embassy delivered); M23b 1/5; M25c 5/5 bought early. C-wide
(89750–89757): lesser 8/8, lost 0/8, full 0/8, M25c 8/8, w5max 1/8
(89751 faced, w5max 2, uw 5, standing 320, peakVet 2), M23b 0/8.

R233 QUESTIONS: (1) pass A-live: does the pilot reproduce r230 modulo
the named deltas (a)–(b)? (2) M23b: on pass C, does the deed gate go ok
and does the buyout road convert again (r230: 1/5 — repeat, or does
the 1/5 rotate to another seed)? (3) does a SECOND buyout seed convert
this round? (4) C-wide fresh band: does ANY seed face wave 5 (w5max>0)
or take a full seat — or does the r230 finding (1/8 faced, 0/8 full)
hold? (5) F5: does the settled-favor branch fire in the wild on THIS
panel (r230 endgame: vacuous 0 hits; succession r230: FIRED 2× via
alive:want, Aria d+45/d+53 — so the branch IS reachable in panel play;
the open question is whether the endgame panel's sittings reach it)?
(6) C3d: does the recap-live-want fix hold in the wild — a recap
naming the live want instead of the empty pool (r231 social: fix
landed; this panel is its first endgame sighting)? (7) COMPANIONGUARD:
do launches still form pairs/trios under the guard — count guard skips
(companionGuardSkips) and watch for a plan record listing a companion
who never left (the mirror gap the guard claims closed)? (8) does
89705 lose its village again, or does the guard/delta change its fate?
(9) starvation watch on every bought seed (Joja price in lives).
(10) funeral-mend watch (r230: fired + voiced).

INTERESTING FINDING (what would count): any pass-A-live-vs-r230
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r230 had uw 4; a full seat on pass A; a full
seat on a new C-wide seed; a SECOND full seat on pass C; a village
dying before d90 on any pass (survival collapse — name the seed, the
day, the cause); a tribute delivery firing (M24 exercised for the first
time in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a deedGateFirstOk on a seed where r230 had none (M23b moves); a
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
survival in a way the r230 panel cannot explain; an F5-class dry hit
in the wild (fix failure — FAIL LOUDLY); a C3d erasure in the wild (a
recap serving the empty pool while a live want is open — the r231
fix failing — FAIL LOUDLY); a companion-guard skip with no counter
increment (instrument gap); a plan record listing a companion whose
expedition never existed (mirror gap recurring — FAIL LOUDLY).

BINDINGS (carried from r203/r211/r219/r225/r230 verbatim; metric
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
  Tally r230: pass A 1/5, pass C 1/5, C-wide 0/8.
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held in r230).
- M2c adoptedRefs (HOLD). CORPUS-PURITY (HOLD — GO on every r230
  pass). M25c buyout-early (HOLD — GO 5/5 matched, 8/8 fresh in r230).
  M24b (HOLD — vacuous on every pass so far).
- Telemetry baseline: r188 baseline stands (r230 pass-A sums uw 22,
  won 4/5, peakVet 6 — quiet, NOT rolled). This run compares
  pass-A-live against the r188 baseline (same 5 seeds, same regime,
  live policy).
- NEW WATCH (not a binding): companionGuardSkips per seed — the
  guard's first endgame-panel sighting; a count of 0 on all seeds is
  a vacuous watch, not a failure (the guard only fires when a
  companion call hits a villager already out).
