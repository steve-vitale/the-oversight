# Journey endgame r239 — PRE-REGISTRATION (lane B, 2026-11-18 01:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (endgame r237 landed,
rotation 4->5 owed at ITS landing was NOT written — the rotation file
still reads 4; this run plays leg 4 again and writes 5, social life, at
closeout ONLY after a verified landing — a failed or partial run does
not advance the leg, per r135/r138/r140/r194 precedent).

Run number basis: the highest journey run number on disk is r238
(crisis, 2026-11-17). This run is r239 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-18T06:56:13Z (run_id journey2-endgame-r238-20261118T065613Z
  — note: the lock run_id says r238, a copy slip in the id string;
  the run itself is r239 throughout; the lock is deleted at closeout
  either way).
- Main tree: `git status --short` 0 lines, disk 50% (fail line 85%).
- `git pull` "Already up to date" at 06:56Z (master 03c53bf6e).
- Reaper ran at run start: SKIPPED (registry lock held by another
  reaper run, consecutive skips: 1) — no cleanup this run; 16 trees
  listed, several LOUD-dirty from other owners (never auto-removed,
  not mine to touch).
- Registration: `worktree-register.sh journey2-endgame` completed in
  ~5.3 min. Branch journey2-endgame did not exist (deleted at r237
  release), so `-b` created it fresh at master. Heartbeat landed at
  registration (06:58:14Z); hbloop journey2-endgame-hbloop-r239.sh
  started, every 5 min.
- The first heartbeat call after registration queued ~3 min on the
  registry lock behind a Loop A registration (sim-taxonomy2516-a) —
  lock contention, not a failure; it completed ("heartbeat
  journey2-endgame").

SUBSTRATE: master 03c53bf6e EXACTLY (worktree HEAD). No fix arm pre-filed
this run. A defect the panel surfaces is filed as an F-item and fixed
only under the r147 rule (planned before scored seeds, own proof test,
judged on the post-fix panel); a mid-run fix otherwise gets its own proof
+ a re-run of affected passes, recorded in the run note.
Probe: scripts/probe-endgame-r239-20261118.js (r237 probe verbatim EXCEPT
renames r237->r239, evidence dir 2026-11-18/perseed-endgame-r239,
header, + PLAN-map entries 89780-89787 — verified by diff: only
renames, dates, comment reflows, and the new band; zero logic change).
Analyzer: scripts/analyze-endgame-r239-20261118.js (r237 analyzer
verbatim EXCEPT input dir, r237->r239 — verified by diff the same way).
Dark probe: SKIPPED — no delta since r211 touched the dark table (r211
skipped on the same reasoning; r219/r225/r230/r233/r237 skipped too).
COMPETENT_PIN=r127 support already in the tree.
NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
M2b GREEN from r182 — no re-sweep (carried as proven).

HEAD DELTAS SINCE r237 SUBSTRATE (7413db0f7 -> 03c53bf6e, verified by
git log + git diff; 72 commits, net src/js diff 10 files, +536/-59):
(a) FIGHTALLY2 (sim-fightallycap-b dded39f58): second ally slot in the
    fight engine (fieldFights.js +274, party-wiring.js +4) — ENV-GATED
    behind FIGHTALLY2=1, INERT for the default panel. The fightallycap
    panel itself is GO (22/22 proof) on its own band. This run's
    STRETCH Pass D turns it on (see below) — the first endgame-panel
    sighting of the lever, and the direct answer to finding #2515
    (the meeting-party cap at 3 by construction).
(b) FLEEREPAIR2 seed gate (sim-fleerepair2-b 59439c437, win-plan.js):
    ENV-GATED behind FLEEREPAIR2=1, INERT for the default panel.
(c) PROFILEGATE (sim-profilegate-b 39e8f10f4 + revert 0da095c78):
    widened companion profile gate behind PROFILEGATE=1, then REVERTED
    (NO-GO on B3) — src/ back to master, net zero in game code.
(d) Dialogue/voice, LIVE: aguard shared firstNameOf guard (7f9ff9c94),
    holdervoice #2505 holder-half voice line (c3cbd100e), homebodyvoice
    #2499 voice the picked homebody who cannot launch (b7236b65f),
    REL-MOURN relationship-aware mourning lines (ef7e6d86c, succession
    r232), DRY3 fix pre-check ledger-blocked lines (9d5a45fcc, social
    r235), landing r143 spend already-confessed confront choice
    (3ba09cec4). All bear on the F5 settled-favor question and the C3d
    watch; RNG-draw shifting possible.
(e) RECORDER only: seedattach closeKind deaths-first (e66cfe1d0,
    closekind-a eb6ff8a27, finding #2523/#2508) — plan-close labels
    change (holder deaths no longer mislabeled plan-deleted), no game
    behavior change; bears on the deathcleanup watch tallies, not on
    outcomes.
(f) analyzer2513 parameterize file-count check (6aaf09a26) — instrument
    only, no game code.
(g) Version bumps: build.js stamp only.
No table/ladder/waves/monster change. No LIVE fight/plan behavior change
under the default panel. Any headline difference on Pass A/C/C-wide is
attributed first to (d) dialogue/RNG-draw shifting, then to (e)
recorder labels — never to a fight/plan lever, because none is live
under the default flags. Pass D is the only pass where a fight lever
moves, and it is judged separately.

PROBE ENV (six vars — r198 RELAYGREY lesson, not five): FULLSEAT,
VETCOMMIT, CAPABLE_GREEDY, ARMORYDRIVE, CAPABLE_VETGUARD, RELAYGREY.
TELEMETRY_FULL is inert in this probe (never read).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188/r194/r198/r203/r211/r219/r225/r230/r233/r237
precedent: same seeds, same probe policy, only the game code changed) —
no fresh band is needed or claimed for the pilot.
SMOKE (harness + timing check, not a binding panel seed): 89706
(wavesnw), pass-A policy, full horizon. Records probe wall time per
seed on this box; if the smoke fails to boot, FAIL LOUDLY and stop.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled; EVIDDIR SET EXPLICITLY ON EVERY INVOCATION
— r237 incident: a pass launched without EVIDDIR overwrote Pass A's
corpora; the probe default still points at the r239 dir only after the
clone, and the explicit env is the belt-and-braces):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r237
  pass A. Outdir perseed-endgame-r239. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r237 pass C. Outdir perseed-endgame-r239-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89780, 89781 (wavesnw) + 89782–89787 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r239-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Pass D (STRETCH, NEW LEVER): FIGHTALLY2=1 + CAPSTONE=1 BUYOUT=1
  BUYOUT_EARLY=1 on the matched seeds 89701–89706. Outdir
  perseed-endgame-r239-d. Judged on the same bindings as pass C
  (analyzer with ANALYZEDIR pointing at the -d dir; no --wide flag).
  This is the first endgame-panel sighting of the second ally slot.
- Pass B: SKIPPED BY DESIGN — r230 pass B was vacuous NO-GO (0
  capstone attempts, 0 deliveries, 0 buyout attempts on all 5 seeds;
  deed gate ok on 0/5). The converting road is pass C, not B; re-running
  B on this substrate would only re-confirm vacuity. The interesting
  questions (does the road still convert? does wave 5 get faced? does
  the second ally slot move kills?) are answered by passes A, C, C-wide,
  and D.
TIME-BOX: passes run sequentially; the cut order if the window closes
is D, then C-wide, then C-live. A-live is the committed core — the run
is not complete without it. PILOT FIRST (§9): the smoke + first two
pass-A seeds verify the harness on this substrate before the full panel
burns.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89780–89787
searched across all journey preregs (evidence/*/journey-*-prereg.md)
and sim preregs (evidence/*/sim-*-prereg.md), plus a broad grep for
8978x across all of evidence/*.md — ZERO hits in any prereg, screen,
forbidden or contaminated list. Forbidden-band notes (r104 etc.) name
94xxx–97xxx saturation — not the 897xx range. 89770–89777 was used by
r237 (yesterday) and is NOT reused. Named only here, as the r239 C-wide
band.

R237 PASS-A BASELINE (per-seed, from the r237 run note; judged on
these seeds, pass A-live):
- 89701 waves: lesser, won, uw 5, FACED wave 5 ×2 (editor d81,
  timeslot d90), release snap d79 ready (2 living veterans), standing
  peak 430.
- 89702 waves: lesser, won, uw 5, FACED wave 5 ×4 (editor d80, spoiler
  d85, cancellation d86, rerun d87), standing peak 387, deedGate ok d85.
  M23b 1/6.
- 89703 waves: lesser, won, uw 4, w5max 0.
- 89704 forcedrift: lesser, won, uw 5 but NEVER-ARRIVED (faced 0),
  vetFights 0.
- 89705 wavesnw: lesser, won, uw 4, sat d99, peakVet 0.
- 89706 wavesnw (smoke): lesser, won, uw 4, sat d100.
Tally r237 pass A: lesser 6/6, full 0/6, village-lost 0/6, won 6/6.
M23b 1/6.
Pass C: lesser 5/6, full 1/6 (89703 FULL d90, gate ok d89, feast
embassy delivered); M23b 1/6; M25c 6/6 bought early. Wave 5: 89702
FACED 1, 89703 FACED 2, 89705 uw 5 NEVER-ARRIVED, 89701 uw 4.
C-wide (89770–89777): lesser 7/8, lost 1/8 (89774 village-lost d67,
food collapse), full 0/8, M25c 7/7 bought, wave-5 FACED 1/8 (89770),
M23b 0/8.

R239 QUESTIONS: (1) pass A-live: does the pilot reproduce r237 modulo
the named deltas (a)–(g) — in particular, does anything move wave-5
facing, veteran banking, or the deed gate on the matched band, given NO
live fight/plan lever changed? (2) M23b: on pass C, does the deed gate
go ok and does the buyout road convert again (r237: 1/6 on 89703 —
repeat, rotate to another seed, or revert)? (3) does a SECOND buyout
seed convert this round? (4) C-wide fresh band: does ANY seed face wave
5 (w5max>0) or take a full seat — or does the r237 finding (1/8 faced,
0/8 full) hold? (5) F5: does the settled-favor branch fire in the wild
on THIS panel (r237 endgame: vacuous 0 hits; succession r230: FIRED 2×
via alive:want — the branch IS reachable in panel play; the open
question is whether the endgame panel's sittings reach it)? (6) C3d:
does the recap-live-want fix hold in the wild — a recap naming the live
want instead of the empty pool (r237: vacuous, no recap sittings on the
endgame panel; the watch stays open for a panel with recap sittings)?
(7) COMPANIONGUARD: do launches still form pairs/trios under the
guard + plan-death — count guard skips (companionGuardSkips) and watch
for a plan record listing a companion who never left (the mirror gap
the guard claims closed; r237: 14 skips, 195 medicDutyBlocked, pass C)?
(8) DEATHCLEANUP: how many win-plan deaths fire per seed
(deathCleanups sample) — and does any plan die with its holder
mid-launch in a way that strands a launch? (r237 pass C: 12 total,
0 removal cleanups, no stranded launch.) (9) does 89705 lose its
village again (r230: lost d59; r233/r237: survived), or does the
dialogue/RNG delta change its fate? (10) starvation watch on every
bought seed (Joja price in lives). (11) funeral-mend watch (r237:
fired + voiced on C-wide). (12) the 159-turn Algorithm fight (r194
89701 d107): does it recur? (13) the fastW4 diedInFight gap (r171):
watch the corpus for a fastW4 scholar-death fight. (14) PASS D: does
the second ally slot move wave-5 facing, wave-4 kills, or full seats
on the matched band — and does any meeting party field FOUR (the #2515
cap broken), or does the sense still cap at 2 allies?

INTERESTING FINDING (what would count): any pass-A-live-vs-r237
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r237 had uw 4; a full seat on pass A; a full
seat on a new C-wide seed; a SECOND full seat on pass C; a village
dying before d90 on any pass (survival collapse — name the seed, the
day, the cause); a tribute delivery firing (M24 exercised for the first
time in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a deedGateFirstOk on a seed where r237 had none (M23b moves); a
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
survival in a way the r237 panel cannot explain; an F5-class dry hit
in the wild (fix failure — FAIL LOUDLY); a C3d erasure in the wild (a
recap serving the empty pool while a live want is open — the r231
fix failing — FAIL LOUDLY); a companion-guard skip with no counter
increment (instrument gap); a plan record listing a companion whose
expedition never existed (mirror gap recurring — FAIL LOUDLY); a
win-plan dying with its holder while a launch is mid-flight, leaving
a stranded launch with no voice (deathcleanup gap — investigate, do
not road-claim); on PASS D: a meeting party of 4 (the #2515 cap
broken in the wild); a wave-4 kill on a Pass D seed that had 0 kills
on Pass C; a full seat on Pass D where Pass C had none; a second ally
joining but never acting (the slot wired but inert — investigate).

BINDINGS (carried from r203/r211/r219/r225/r230/r233/r237 verbatim;
metric binding §14 — a miss is NO-GO, never re-scored mid-run;
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
observation tally this run (not a binding verdict). Pass D is judged
on the same bindings as pass C.

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M23b tally: Pass A 1/6, Pass C 1/6, C-wide 0/8 (r237).
- F5 + C3d stay vacuous on the endgame leg for a third straight round
  unless this panel's sittings reach them — the watches need a panel
  whose sittings reach them, not a metric change.
- The 89775 sick-line repeat ("Rosa is already boiling water. It's
  handled." 7× verbatim, r237 NEW watch) — watch whether it recurs on
  this substrate (dialogue pass item, not a binding).
- M22-feast-hold: 89705 UNEXPLAINED=1 in r237 (one feast-hold day with
  no recorded reason) — watch item.
- Telemetry baseline: r188 stands (r237 pass-A sums uw 23 vs 22, won
  5 vs 4, peakVet 8 vs 8 — quiet, NOT rolled). This run compares
  pass-A-live against the r188 baseline (same 6 seeds, same regime,
  live policy).
- companionGuardSkips watch (r237 pass C: 14 total, 195
  medicDutyBlocked): HOLD as a watch, not a binding. deathCleanups
  per seed (r237 pass C: 12 total) — HOLD as a watch.
- Pass D (FIGHTALLY2): NEW observation tally this run — meeting party
  sizes, wave-4 kills per seed, full seats; judged against the Pass C
  numbers on the same seeds, not against a frozen bar (first sighting).
