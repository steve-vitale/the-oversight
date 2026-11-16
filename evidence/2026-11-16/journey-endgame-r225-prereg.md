# Journey endgame r225 — PRE-REGISTRATION (lane B, 2026-11-16 04:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (r224 succession landed,
rotation 7->4). This run plays leg 4 and writes 5, social life, at closeout
ONLY after a verified landing — a failed or partial run does not advance the
leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r224
(succession, 2026-11-16). This run is r225 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-16T09:55:28Z (run_id journey2-endgame-20261116-0955Z).
- Main tree: `git status --short` 0 lines, disk 43% (fail line 85%).
- `git pull` "Already up to date" at 09:55Z (master 0d0dbbcf1).
- Reaper ran at run start: removed nothing; 13/16 active, all dirty
  (never auto-removed). 11.5 min.
- Registration: `worktree-register.sh journey2-endgame` completed, but the
  slug branch already existed from a prior released run and the script's
  `-f` reuse checked out the STALE branch tip 4341557ab (journey-landing
  r139) instead of current master. Recovered in the worktree: verified
  4341557ab is fully merged into master (0 commits not in master, ancestor
  check clean), then `git checkout -B journey2-endgame master` — worktree
  now at current master, status clean. Registry entry verified, heartbeat
  10:19:07Z, hbloop (pid 35430) re-heartbeats every 5 min.
- Master MOVED during run start: 0d0dbbcf1 -> b659acdd5 (sim-gateconfirm-a
  landed while the reaper/registration ran; evidence + analysis only, no
  src/js change — verified in the delta below).
- Exec wall: long jobs run NOHUP-DETACHED with log polling (r178 prereg);
  box heavily loaded at run start (load avg high, 13 sibling trees active).

SUBSTRATE: master b659acdd5 EXACTLY (worktree HEAD at registration, after
the stale-branch recovery above).
Probe-side changes only, pre-planned below, plus the pre-filed F5 fix arm
(r224's filed next fix item — own proof test, judged on the post-fix panel
per the r147 rule; the fix is planned here BEFORE any scored seed, so the
panel runs on fixed code and the F5 surface is checked in the wild).
Probe: scripts/probe-endgame-r225-20261116.js (r219 probe verbatim EXCEPT
renames r219->r225, evidence dir 2026-11-16/perseed-endgame-r225,
header, + PLAN-map entries 89740-89747). Analyzer:
scripts/analyze-endgame-r225-20261116.js (r219 analyzer verbatim EXCEPT
input dir, r219->r225). Dark probe: SKIPPED — no delta since r211 touched
the dark table (r211 skipped on the same reasoning; r219 skipped too).
COMPETENT_PIN=r127 support already in the tree. NO A-frozen arm — (l)
EXONERATED in r194 and no policy file changed since. M2b GREEN from r182
— no re-sweep (carried as proven).

HEAD DELTAS SINCE r219 SUBSTRATE (4c30c022a -> b659acdd5, verified by
git log + git diff; 102 commits, net src/js diff 5 files, +92/-6):
(a) 2e3142e74 journey-succession r224: F4a curious-question pick
    ledger-aware (convo-wants.js), F4b recap lines never take a voice
    opener (conversation.js voiceLine RE-ANCHOR guard), F4c seek_taken
    repeat-ack variants + dlg:help block guard (convo-wants.js,
    convo-dialogue.js). Dialogue quality; RNG-draw shifting.
(b) ae9b4b6f7 journey-crisis r223: F1 drift-note stage direction no
    longer quotes as resume memory (conversation.js). Dialogue quality.
(c) 25373172b journey-scale r219: goon must not carry an ask tag onto
    substituted text (conversation.js) [needs-eyes]. Dialogue quality —
    a held link-raise/bond-proposal tag no longer leaks onto thread-beat
    substitute text (Felipe d130 blind-accept shape).
(d) villager-agency.js PROFILEGATE bypass (sim-launchdef-a, PILOT GO —
    gate fix lands): a bid-and-selected party_launch plan is a commitment
    the dawn scorer already made; the profile gate must not veto it. The
    holder still faces every other launch condition downstream. THIS IS A
    LIVE GAMEPLAY LEVER since r219 — party launches bypass the
    non-ranger profile gate. It bears directly on the wave-5 facing
    question (parties -> wave-4 kills -> veterans -> readiness-5 release
    -> wave-5 facing). The launchdef seed-call itself was reverted after
    measurement; only the bypass stays.
(e) All other sim lever arms since r219 (gatelever, vetparty, dawnbid,
    profilegate seed-call, rumorplan, scale-onramp) were ADDED then
    REVERTED — net zero in game code; instruments + corpora + evidence
    only.
(f) Version bumps: build.js stamp only.
(g) sim-gateconfirm-a (b659acdd5): evidence + analysis only.
No table/ladder/waves/monster change. Any OTHER headline difference is a
same-run investigation item, never a road claim, and is attributed first
to these deltas before any wider claim — with (d) first for any wave-5 /
party / veteran movement and (a)-(c) first for any trajectory re-roll.

FIX ARM (pre-filed in r224 as F5, fixed this run BEFORE the panel):
- F5 — settled-favor "it's handled" singleton (conversation.js:7160):
  the SETTLED FAVOR branch returns one fixed line ("No, really — it's
  handled. Thanks for asking, though.") with no variants and no ledger
  guard; r224 caught it live (34301 d105 Farid, trust 90: "It's already
  handled" then a dry blank two turns later on re-ask). Fix: 3 honest
  variants via convoPickCycle (key 'settledfavor:handled', same class as
  F4c) + fallback to the original line. Proof test
  scripts/test-journey-endgame-r225-f5-settled-favor.js: RED on unfixed
  code (singleton repeats verbatim / ledger-blocks), GREEN on fixed
  code (variants cycle, no dry). Wild check: dry census on the new
  transcripts — zero F5-class hits.

PROBE ENV (six vars — r198 RELAYGREY lesson, not five): FULLSEAT,
VETCOMMIT, CAPABLE_GREEDY, ARMORYDRIVE, CAPABLE_VETGUARD, RELAYGREY.
TELEMETRY_FULL is inert in this probe (never read).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188/r194/r198/r203/r211/r219 precedent: same seeds,
same probe policy, only the game code changed) — no fresh band is needed
or claimed for the pilot.
SMOKE (harness + timing check, not a binding panel seed): 89706
(wavesnw), pass-A policy, full horizon. Records probe wall time per
seed on this box; if the smoke fails to boot, FAIL LOUDLY and stop.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r219
  pass A. Outdir perseed-endgame-r225. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r219 pass C. Outdir perseed-endgame-r225-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89740, 89741 (wavesnw) + 89742–89747 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r225-cwide. Runs only
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
complete without it. PILOT FIRST (§9): if pass A reproduces r219 with
nothing interesting, the run documents and closes out WITHOUT burning
the full multi-seed panel — r219 ran the full panel yesterday on nearly
the same substrate, and the deltas are small except (d).

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89740–89747
searched across all journey preregs (evidence/*/journey-*-prereg.md)
and sim preregs (evidence/*/sim-*-prereg.md) — ZERO hits. Named only
here, as the r225 C-wide band. (An initial broad evidence/ grep for
"8974" matched only kcal-value substrings inside JSON corpora, not seed
names; the prereg-scoped search is the binding one per the skill.)

R219 PASS-A BASELINE (per-seed, from the r219 run note; judged on
these seeds, pass A-live):
- 89701 waves: sat d90, lesser, w5max 0, peakVet 1, uw 4.
- 89702 waves: sat d97, lesser, w5max 0, peakVet 1, uw 4.
- 89703 waves: sat d112, lesser, w5max 0, peakVet 1, uw 4.
- 89704 forcedrift: sat d90, lesser, w5max 0 (SAVED vs r211 LOST).
- 89705 wavesnw: sat d90, lesser, w5max 1, peakVet 4, uw 5.
Tally r219 pass A: lesser 5/5, full 0/5, village-lost 0/5. M23b 0/5.
Pass C: lesser 2/5, full 3/5 sat (89702 FULL d63, 89704 FULL d92,
89705 FULL d84); M23b 3/5; M25c 5/5 bought early. C-wide (89730–
89737): lesser 5/8, lost 3/8, full 0/8, M23b 0/8, w5max 0/8.

R225 QUESTIONS: (1) pass A-live: does the pilot reproduce r219 modulo
the named deltas (a)–(g)? (2) PROFILEGATE (d): does wave-5 facing move
on matched seeds — w5max, uw, vetLiving, peakVet vs the r219 pass-A
baseline above? (3) M23b: on pass C, does the deed gate go ok and does
the early-buyout road still convert to full seats (r219: 3/5)? (4)
C-wide fresh band: does ANY seed face wave 5 (w5max>0) or take a full
seat — or does the r219 finding (0/8, gate never ok) hold? (5) F5: is
the dry census clean on the new transcripts — zero settled-favor
singleton hits? (6) people check: do the sitting seeds' finales read
as people — and do the dialogue deltas (a)/(b)/(c) and the F5 fix read
clean? Is the doubled-quotes fix still holding (zero `SYSTEM: ""` in
the new transcripts)? (7) the 159-turn Algorithm fight (r194 89701
d107): does it recur? (8) the fastW4 diedInFight gap (r171): watch the
corpus for a fastW4 scholar-death fight. (9) starvation watch on every
bought seed (Joja price in lives). (10) funeral-mend watch (r219 (b)):
does a funeral-mend event fire, and is it voiced?

INTERESTING FINDING (what would count): any pass-A-live-vs-r219
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r219 had uw 4 (profilegate lever moving the
door); a full seat on pass A; a full seat on a new C-wide seed; a
village dying before d90 on any pass (survival collapse — name the
seed, the day, the cause); a tribute delivery firing (M24 exercised
for the first time in this leg's recent panels); a wave-5 kill on a
previously w5:0 seed; a deedGateFirstOk on a seed where r219 had none
(M23b moves); a capstone delivery that refuses despite readiness with
a NON-exempt reason (leg-3 agreement failure); a delivered capstone
that does NOT price the full seat (tableSeat/capstone wiring failure);
a bought bundle that does NOT flip feast_embassy to ready (bundle-flag
wiring failure); an 'over' attempt recurring despite the guard
(probe-fix failure — FAIL LOUDLY); a refusal transcript that starts at
announce despite a pre-announce refusal (window-fix failure); a pantry
that never reaches 8000 in-window on any seed (the Joja path priced
out of bot reach); a pellet lock recurring (regression, FAIL LOUDLY
in chat); a rads death with no voicing; a cure that fires with no
voicing (medic duty silent); a ladder shortfall line that names the
OLD feast bar or stays silent where the ladder bar is the blocker; a
bundle completing in the wild with the +4 not landing in the counted
points; any mFlee carrying monFled=true on a non-flee kind
(monster-commitment violation); any hurt-return misfire; any ambush
death missing from fallen; any transcript passage senseless, robotic,
or self-contradictory; a stuck helper waiting silently in a finale;
an offered seat withdrawing (sticky-offer failing in the wild); a
"holds and watches" cluster that reads as a stuck record; a
pocket_sand held but never pressed in a losing window where the
scholar fled instead; a bond proposal that fires from a roster
(villagers proposing to people they never perceived); a refusal line
repeating verbatim within one branch across days (refusal variety
regression); a fastW4 fight with a causal scholar death printing
diedInFight:[] (the carried r171 gap, now observable); the war-path
wave-5 bar line still appearing on a full-seat audit (finalvoice fix
(b) not holding — r188's carried item); the (h) wave-5 shortfall voice
missing from morning briefings where the shortfall is real
(voiceless-a build not firing); a CORPUS-PURITY NO-GO on any pass
(instrument failure, investigate before trusting that pass's
verdicts); a fusion-offer event firing with the pellet gate misfiring
(prize bag granting fusion_reactor without pellet possession, or the
offer firing while a sheet is pending); ANY `SYSTEM: ""` line in a
post-fix panel transcript (fix regression — FAIL LOUDLY); a
funeral-mend event firing with no voicing, or a funeral changing
survival in a way the r219 panel cannot explain; an F5-class dry hit
in the wild (fix failure — FAIL LOUDLY).

BINDINGS (carried from r203/r211/r219 verbatim; metric binding §14 — a
miss is NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the
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
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held in r219).
- M2c adoptedRefs (HOLD). CORPUS-PURITY (HOLD — GO on every r219
  pass). M25c buyout-early (HOLD). M24b (HOLD — vacuous on every
  pass so far).
- Telemetry baseline: r188 baseline stands (r219 pass-A sums uw 21,
  won 5/5, peakVet within regime vs baseline uw 22, won 4, peakVet 8
  — same regime, NOT rolled). This run compares pass-A-live against
  the r188 baseline (same 5 seeds, same regime, live policy).
