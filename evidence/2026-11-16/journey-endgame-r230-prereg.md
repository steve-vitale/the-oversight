# Journey endgame r230 — PRE-REGISTRATION (lane B, 2026-11-16 18:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (r229 succession landed,
rotation 7->4). This run plays leg 4 and writes 5, social life, at closeout
ONLY after a verified landing — a failed or partial run does not advance the
leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r229
(succession, 2026-11-16). This run is r230 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-16T23:56:58Z (run_id journey2-endgame-20261116-2355Z).
- Main tree: `git status --short` 0 lines, disk 45% (fail line 85%).
- `git pull` "Already up to date" at 23:56Z (master 947613d28).
- Master MOVED during registration: 947613d28 -> e60b8241e (batch-ship
  version bump, 00:12Z — index.html/sw.js hash regeneration +
  build.js/version.json stamps only, zero game-code change, verified by
  git show --stat). Worktree rebased onto e60b8241e via
  `git checkout -B journey2-endgame master` (fresh branch, zero commits
  of mine) — clean, 0 lines.
- Reaper ran at run start: removed nothing; 12/16 active, all dirty
  (never auto-removed).
- Registration: `worktree-register.sh journey2-endgame` slow to complete —
  its internal reap runs first (~11 min on this box), then `git worktree
  add` checks out 100k+ files (evidence corpora) on a loaded box; the
  worktree existed at 947613d28 with files on disk byte-identical to HEAD
  while the checkout was still in flight (index.lock held, index empty).
  No stale-branch issue: branch journey2-endgame did not exist (deleted
  at r225 release), so `-b` creates it fresh at master. Heartbeat lands
  immediately after registration completes.

SUBSTRATE: master e60b8241e EXACTLY (worktree HEAD after the rebase above;
the bump is stamp-only, so the game-code substrate is 947613d28).
No fix arm pre-filed this run (r225 filed none; its watch items are
questions, not fixes). A defect the panel surfaces is filed as an F-item
and fixed only under the r147 rule (planned before scored seeds, own
proof test, judged on the post-fix panel); a mid-run fix otherwise gets
its own proof + a re-run of affected passes, recorded in the run note.
Probe: scripts/probe-endgame-r230-20261116.js (r225 probe verbatim EXCEPT
renames r225->r230, evidence dir 2026-11-16/perseed-endgame-r230,
PLAN-map entries 89750-89757). Analyzer:
scripts/analyze-endgame-r230-20261116.js (r225 analyzer verbatim EXCEPT
input dir, r225->r230). Dark probe: SKIPPED — no delta since r211 touched
the dark table (r211 skipped on the same reasoning; r219/r225 skipped too).
COMPETENT_PIN=r127 support already in the tree. NO A-frozen arm — (l)
EXONERATED in r194 and no policy file changed since. M2b GREEN from r182
— no re-sweep (carried as proven).

HEAD DELTAS SINCE r225 SUBSTRATE (b659acdd5 -> 947613d28, verified by
git log + git diff; 95 commits, net src/js diff 8 files, +499/-73):
(a) 46426eb2e sim-vetreengage-a: VETREENGAGE env gate (default OFF) —
    wave-4 re-engagement party lever (trio launch, dissolution on member
    death, vFlee seeding in game.js, second-companion pick in
    villager-brain.js, companionLaunchable hoist in win-plan.js). INERT
    for the default panel (no VETREENGAGE env set): the browser never
    sets it, and this panel does not either. It bears directly on the
    wave-5 facing question IF enabled — a future run may test
    VETREENGAGE=1 as an arm; this run judges the live default only.
(b) Dialogue quality; RNG-draw shifting possible: F5 settled-favor
    variants (3ba7f0516 — in r225's panel via worktree, now on master),
    F6 dry-opener guard (03fee239a), C3c stale-favor resume opener + F2
    narration-quote guard (7ebb2b26e), stage-0 want fix (83c7dc3c7:
    favorless asks no longer resolve as refused unheard), warn_you heed
    fix (6436b14c8, r140 landing).
(c) ce2df6f5b journey-scale r227: muster-step hold bracing (scale leg;
    unbraced 'hold(); continue;' skipped the whole step).
(d) All other sim arms since r225 (trickteach, haventick, seedpaths,
    launchsurvive, profileshadow, stand199, seasoning-g1, gateconfirm,
    planignite, 14cwatch2) were ADDED then REVERTED or are instrument /
    evidence only — net zero in game code.
(e) MANTLE-FINE (r229 succession): prereg + panel tooling + corpus proof
    only, no src/js change.
(f) Version bumps: build.js stamp only.
No table/ladder/waves/monster change. No docs/ change. Any OTHER headline
difference is a same-run investigation item, never a road claim, and is
attributed first to these deltas before any wider claim — with (a) first
only if VETREENGAGE were on (it is not), (b) first for any trajectory
re-roll.

PROBE ENV (six vars — r198 RELAYGREY lesson, not five): FULLSEAT,
VETCOMMIT, CAPABLE_GREEDY, ARMORYDRIVE, CAPABLE_VETGUARD, RELAYGREY.
TELEMETRY_FULL is inert in this probe (never read).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188/r194/r198/r203/r211/r219/r225 precedent: same seeds,
same probe policy, only the game code changed) — no fresh band is needed
or claimed for the pilot.
SMOKE (harness + timing check, not a binding panel seed): 89706
(wavesnw), pass-A policy, full horizon. Records probe wall time per
seed on this box; if the smoke fails to boot, FAIL LOUDLY and stop.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r225
  pass A. Outdir perseed-endgame-r230. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r225 pass C. Outdir perseed-endgame-r230-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89750, 89751 (wavesnw) + 89752–89757 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r230-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Pass B: SKIPPED BY DESIGN — r219 pass B was vacuous NO-GO (0
  capstone attempts, 0 deliveries, 0 buyout attempts on all 5 seeds;
  deed gate ok on 0/5). The converting road is pass C, not B; re-running
  B on this substrate would only re-confirm vacuity. The interesting
  questions (does the road still convert? does wave 5 get faced?) are
  answered by passes A, C, and C-wide.
TIME-BOX: passes run sequentially; the cut order if the window closes
is C-wide, then C-live. A-live is the committed core — the run is not
complete without it. PILOT FIRST (§9): if pass A reproduces r225 with
nothing interesting, the run documents and closes out WITHOUT burning
the full multi-seed panel — r225 ran the full panel on nearly the same
substrate, and the deltas are small except (a), which is inert.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89750–89757
searched across all journey preregs (evidence/*/journey-*-prereg.md)
and sim preregs (evidence/*/sim-*-prereg.md) — ZERO hits for 89750–
89757. The only "8975" substring hit was 88975 in the r74 prereg (88xxx
band, not a collision). Forbidden-band notes (r104 etc.) name 94xxx–
97xxx saturation — not the 897xx range. Named only here, as the r230
C-wide band.

R225 PASS-A BASELINE (per-seed, from the r225 run note; judged on
these seeds, pass A-live):
- 89701 waves: sat d95, lesser, w5max 0, peakVet 1, uw 4.
- 89702 waves: sat d90, lesser, w5max 0, peakVet 1, uw 4.
- 89703 waves: sat d97, lesser, w5max 0, peakVet 1, uw 4.
- 89704 forcedrift: sat d90, lesser, w5max 3 (FACED WAVE 5), peakVet 3,
  uw 5, standing 691, wavesOk TRUE; deedGateReady ok d82.
- 89705 wavesnw: sat d91, lesser, w5max 0, peakVet 1, uw 4.
Tally r225 pass A: lesser 5/5, full 0/5, village-lost 0/5. M23b 1/5.
Pass C: lesser 5/5, full 0/5 (regression vs r219 3/5); M23b 0/5; M25c
5/5 bought early. C-wide (89740–89747): lesser 7/8, lost 1/8 (89745
d27), full 0/8, M23b 0/8, w5max 1/8 (89746 faced, w5max 2, uw 5,
standing 619, peakVet 2).

R230 QUESTIONS: (1) pass A-live: does the pilot reproduce r225 modulo
the named deltas (a)–(f)? (2) M23b: on pass C, does the deed gate go ok
and does the early-buyout road convert to full seats again (r225: 0/5
after r219's 3/5 — repeat or revert)? (3) does a wave-5-facing seed
convert to a full seat? (4) C-wide fresh band: does ANY seed face wave
5 (w5max>0) or take a full seat — or does the r225 finding (1/8 faced,
0/8 full) hold? (5) F5: does the settled-favor branch fire in the wild
this panel (r225: vacuous, 0 hits for old and new lines)? (6) people
check: do the sitting seeds' finales read as people — and do the
dialogue deltas (F6/C3c/stage-0) read clean? Is the doubled-quotes fix
still holding (zero `SYSTEM: ""` in the new transcripts)? (7) the
159-turn Algorithm fight (r194 89701 d107): does it recur? (8) the
fastW4 diedInFight gap (r171): watch the corpus for a fastW4
scholar-death fight. (9) starvation watch on every bought seed (Joja
price in lives). (10) funeral-mend watch (r219 (b)): does a
funeral-mend event fire, and is it voiced?

INTERESTING FINDING (what would count): any pass-A-live-vs-r225
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r225 had uw 4; a full seat on pass A; a full
seat on a new C-wide seed; a village dying before d90 on any pass
(survival collapse — name the seed, the day, the cause); a tribute
delivery firing (M24 exercised for the first time in this leg's recent
panels); a wave-5 kill on a previously w5:0 seed; a deedGateFirstOk on
a seed where r225 had none (M23b moves); a capstone delivery that
refuses despite readiness with a NON-exempt reason (leg-3 agreement
failure); a delivered capstone that does NOT price the full seat
(tableSeat/capstone wiring failure); a bought bundle that does NOT flip
feast_embassy to ready (bundle-flag wiring failure); an 'over' attempt
recurring despite the guard (probe-fix failure — FAIL LOUDLY); a
refusal transcript that starts at announce despite a pre-announce
refusal (window-fix failure); a pantry that never reaches 8000
in-window on any seed (the Joja path priced out of bot reach); a
pellet lock recurring (regression, FAIL LOUDLY in chat); a rads death
with no voicing; a cure that fires with no voicing (medic duty
silent); a ladder shortfall line that names the OLD feast bar or stays
silent where the ladder bar is the blocker; a bundle completing in the
wild with the +4 not landing in the counted points; any mFlee carrying
monFled=true on a non-flee kind (monster-commitment violation); any
hurt-return misfire; any ambush death missing from fallen; any
transcript passage senseless, robotic, or self-contradictory; a stuck
helper waiting silently in a finale; an offered seat withdrawing
(sticky-offer failing in the wild); a "holds and watches" cluster that
reads as a stuck record; a pocket_sand held but never pressed in a
losing window where the scholar fled instead; a bond proposal that
fires from a roster (villagers proposing to people they never
perceived); a refusal line repeating verbatim within one branch across
days (refusal variety regression); a fastW4 fight with a causal scholar
death printing diedInFight:[] (the carried r171 gap, now observable);
the war-path wave-5 bar line still appearing on a full-seat audit
(finalvoice fix (b) not holding — r188's carried item); the (h)
wave-5 shortfall voice missing from morning briefings where the
shortfall is real (voiceless-a build not firing); a CORPUS-PURITY NO-GO
on any pass (instrument failure, investigate before trusting that
pass's verdicts); a fusion-offer event firing with the pellet gate
misfiring (prize bag granting fusion_reactor without pellet possession,
or the offer firing while a sheet is pending); ANY `SYSTEM: ""` line in
a post-fix panel transcript (fix regression — FAIL LOUDLY); a
funeral-mend event firing with no voicing, or a funeral changing
survival in a way the r225 panel cannot explain; an F5-class dry hit
in the wild (fix failure — FAIL LOUDLY).

BINDINGS (carried from r203/r211/r219/r225 verbatim; metric binding §14
— a miss is NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the
headline, per r135's metric review; full text in
evidence/2026-11-14/journey-endgame-r203-prereg.md, §BINDINGS):
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
  Tally r225: pass A 1/5, pass C 0/5, C-wide 0/8.
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held in r225).
- M2c adoptedRefs (HOLD). CORPUS-PURITY (HOLD — GO on every r225
  pass). M25c buyout-early (HOLD — GO 5/5 matched, 7/7 fresh in r225).
  M24b (HOLD — vacuous on every pass so far).
- Telemetry baseline: r188 baseline stands (r225 pass-A sums uw 21,
  won 5/5, peakVet 6 — quiet, NOT rolled). This run compares
  pass-A-live against the r188 baseline (same 5 seeds, same regime,
  live policy).
