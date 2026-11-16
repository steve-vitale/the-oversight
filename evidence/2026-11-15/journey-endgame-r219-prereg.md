# Journey endgame r219 — PRE-REGISTRATION (lane B, 2026-11-15 21:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (r218 succession landed
8aed1dbfb, rotation 7->4, verified in the memory log). This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing — a
failed or partial run does not advance the leg, per r135/r138/r140/r194
precedent.

Run number basis: the highest journey run number on disk is r218
(succession, 2026-11-15). r215/r216/r217 are taken (social, crisis,
crisis-adoption). This run is r219 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-16T02:55:52Z (run_id loop2-20261116T025552Z).
- Main tree: `git status --short` 0 lines, disk 42% (fail line 85%).
- `git pull` "Already up to date" at 02:55Z (master 4c30c022a).
- Reaper ran at run start: removed nothing; 12/16 active, all dirty
  (never auto-removed).
- Registration: `worktree-register.sh journey2-endgame` took ~9.3 min
  (git reset --hard churning under a sibling sim-aidgate-b driver load)
  but completed cleanly; worktree at 4c30c022a, registry entry verified,
  heartbeat 03:07:51Z, hbloop `journey2-endgame-hbloop-r219.sh` (pid
  44344) re-heartbeats every 5 min.
- Exec wall: long jobs run NOHUP-DETACHED with log polling (r178 prereg);
  the box is heavily loaded (sibling aidgate driver running at run start).

SUBSTRATE: master 4c30c022a EXACTLY (worktree HEAD at registration).
Probe-side changes only, pre-planned below, plus any game fix emerging
from the pilot (own proof test, judged on a post-fix re-run per the
r147 rule, never claimed from the pre-fix pilot). Probe:
scripts/probe-endgame-r219-20261115.js (r211 probe verbatim EXCEPT
renames r211->r219, evidence dir 2026-11-15/perseed-endgame-r219,
header, + PLAN-map entries 89730-89737). Analyzer:
scripts/analyze-endgame-r219-20261115.js (r211 analyzer verbatim
EXCEPT input dir, r211->r219, + the M23b tally below). Dark probe:
SKIPPED — no delta since r211 touched the dark table (r211 skipped on
the same reasoning; r203 bit-identical to r198). COMPETENT_PIN=r127
support already in the tree. NO A-frozen arm — (l) EXONERATED in r194
and no policy file changed since. M2b GREEN from r182 — no re-sweep
(carried as proven).

HEAD DELTAS SINCE r211 SUBSTRATE (c6343a839 -> 4c30c022a, verified by
git log; 15 src/js commits):
(a) c09a9f732 + 676430c3a journey-endgame r211: sysSay + quoteWrap
    doubled-quote fixes (display only; game state / RNG untouched).
(b) edd53a489 journey-crisis r216: funeral-mend partial-payment honest
    line (hierarchy.js) + analyzer seed-scoped dedupe. Funerals happen
    in endgame villages — watch the corpus for a funeral-mend event.
(c) ce0f28a46 journey-landing r137: want-thread resume re-poses the
    deflected question (conversation.js). Dialogue quality.
(d) abc52dce1 journey-scale r215: curious-resume stutter fix
    (conversation.js, narrowed after main67 caught a too-broad first
    version) + trust-test harness fix (text.js). Dialogue quality.
(e) c89ac24b3 journey-establishment r214: plain parting pool for
    neutral/friendly sittings (convoMoodGoodbye). Dialogue quality.
(f) 50c86b0b9 journey-succession r218: commit-refusal lines never
    become thread memory (F3 noBeat, convo-dialogue.js). Dialogue
    quality — watch refusal-thread behavior in finales.
(g) 50c874822 + 43124ee25 sim-producerparty-b: wild-fight win-plan
    seed lever ADDED then pilot NO-GO evidence — lever REVERTED, net
    zero in game code; instruments + corpora only.
(h) 656f4fc3b + 72a6efc99 sim-producergate-b: gate/expedition-meeting
    link lever ADDED then reverted NO-GO — net zero in game code.
(i) dc8cbd3f3 sim-gorgeprice2-b: lingerer holds the treeline
    (recovered guard) + floored-bar analyzer. A guard, not a lever.
(j) Version bumps: build.js stamp only.
(k) Deepening r218 (a4be5f25a/15dcd65b5): Amendment A1 — wave-4 guard
    denominator (foughtWaves per-fight, not fightsByWave per-monster)
    + instruments. MEASUREMENT-side only (analyzer/driver); no game
    code. It changes what the wave-4 guard counts — the r219 analyzer
    inherits the r211 analyzer, NOT the r218 deepening analyzer, so
    guard numbers stay comparable to r211; any wave-4-count headline
    difference is a same-run investigation item.
(l) r213/r214/r215/r216/r218 landings: evidence/tooling + the fixes
    above; no table/ladder/waves/monster change.
No game-balance change to table/ladder/waves/monsters. Any OTHER
headline difference is a same-run investigation item, never a road
claim, and is attributed first to these deltas before any wider claim.

ANALYZER ADDITION (r211 metric review, adopted this run — tooling
only, observation tally, NOT a binding verdict, never a re-score):
(M23b) GATE-OK TALLY: per pass, count seeds with
deedGateFirstOkDay != null (the deed gate went ok at least once)
and list them, separately from delivery. r211's metric review asked
for "gate ok at sit" counted separately from delivery; the probe
already records deedGateFirstOkDay, so this is a print-only tally.
Proof: scripts/test-analyzer-m23b-r219.js runs the r219 analyzer
against the REAL r211 corpora (pass B, pass C, C-wide): pass B must
print 1 gate-ok seed (89703, d87); pass C 0; C-wide 0. The tally
must not change any binding verdict on those corpora (byte-compare
the verdict lines before/after the addition).

PROBE ENV (six vars — r198 RELAYGREY lesson, not five): FULLSEAT,
VETCOMMIT, CAPABLE_GREEDY, ARMORYDRIVE, CAPABLE_VETGUARD, RELAYGREY.
TELEMETRY_FULL is inert in this probe (never read).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188/r194/r198/r203/r211 precedent: same seeds, same
probe policy, only the game code changed) — no fresh band is needed or
claimed for the pilot.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r211
  pass A. Outdir perseed-endgame-r219. COMMITTED CORE.
- Pass B-live: CAPSTONE=1 BUYOUT=1 — capstone delivery + buy-out,
  matched to r211 pass B. Outdir perseed-endgame-r219-b.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r211 pass C. Outdir perseed-endgame-r219-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89730, 89731 (wavesnw) + 89732–89737 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r219-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
TIME-BOX: passes run sequentially; the cut order if the window closes
is C-wide, then C-live, then B-live. A-live is the committed core —
the run is not complete without it. PILOT FIRST (§9): if pass A
reproduces r211 with nothing interesting, the run documents and closes
out WITHOUT burning the full multi-seed panel — r211 ran the full
panel yesterday on nearly the same substrate, and the deltas are small.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band
89730–89737 searched across all journey preregs
(`evidence/*/journey-*-prereg.md`) and sim preregs
(`evidence/*/sim-*-prereg.md`) — ZERO hits. Named only here, as the
r219 C-wide band. A broader `evidence/` grep for "8973" was running
at prereg time; its result is recorded in the run note before the
C-wide launch — if it finds a prior naming, the band is re-picked
before any C-wide seed runs. Matched seeds 89701–89705 are deliberate
reuse per the precedent above.

R211 PASS-A BASELINE (per-seed, from the r211 run note; judged on
these seeds, pass A-live):
- 89701 waves: sat d101, lesser, w5max 1, peakVet 1, uw 4.
- 89702 waves: sat d90, lesser, w5max 1, peakVet 1, uw 4.
- 89703 waves: sat d90, lesser, w5max 2, peakVet 1, uw 4.
- 89704 forcedrift: VILLAGE-LOST d66 (sickness cascade, no healer).
- 89705 wavesnw: sat d92, lesser, w5max 0, peakVet 3, uw 5.
Tally r211 pass A: lesser 4/5, full 0/5, village-lost 1/5. Pass B:
lesser 5/5 (89704 saved), full 0/5 (M23 VACUOUS — deed gate ok on
89703 d87 only, attempts refused none-ready, exempt). Pass C:
lesser 4/5, full 0/5 sat; 89701 LOST d67 (buyout-early implicated),
89704 SAVED. C-wide (89722–89729): lesser 6/8, lost 2/8, full 0/8,
M23 VACUOUS (no gate-ok seed). Dark probe: skipped in r211 (same
reasoning as here).

R219 QUESTIONS: (1) pass A-live: does the pilot reproduce r211
modulo the named deltas (a)–(l)? (2) M23b: on passes B/C/C-wide,
does the deed gate go ok on ANY seed — and on the fresh band, does
the wave-5 door (standing+readiness per deepening r218) open as a
full seat, a wave-5 kill, or a tribute delivery? (3) §NO-OVER-ATTEMPT:
zero 'over' attempts on every pass? (4) §REFUSAL-WINDOW: no refusals
to window on any pass? (5) passes B/C: do the full-seat roads
reproduce — bundle on 89704/89705, tribute still never fires? (6)
C-wide fresh band: full seats? losses? does the bundle road hold on
unseen seeds? (7) people check: do the sitting seeds' finales read
as people — and do the new dialogue deltas (c)/(d)/(e)/(f) and the
funeral mend (b) read clean? Is the doubled-quotes fix visible in
the wild (zero `SYSTEM: ""` in the new transcripts)? (8) the
159-turn Algorithm fight (r194 89701 d107): does it recur? (9) the
fastW4 diedInFight gap (r171): watch the corpus for a fastW4
scholar-death fight. (10) starvation watch on every bought seed
(Joja price in lives). (11) fusion-offer delta (r203 (d), now (m)):
does any corpus event show the pellet-possession gate or the
sheet-pending deferral firing?

INTERESTING FINDING (what would count): any pass-A-live-vs-r211
headline difference other than the named deltas; a village dying
before d90 on any pass (survival collapse — name the seed, the day,
the cause); a full seat on a new seed or a lost full seat on 89704/
89705; a tribute delivery firing (M24 exercised for the first time
in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a deedGateFirstOk on a seed where r211 had none (M23b moves);
a capstone delivery that refuses despite readiness with a
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
hurt-return misfire; any ambush death missing from fallen; any
transcript passage senseless, robotic, or self-contradictory; a stuck
helper waiting silently in a finale; an offered seat withdrawing
(sticky-offer failing in the wild); a "holds and watches" cluster
that reads as a stuck record; a pocket_sand held but never pressed
in a losing window where the scholar fled instead; a bond proposal
that fires from a roster (villagers proposing to people they never
perceived); a refusal line repeating verbatim within one branch
across days (refusal variety regression); a fastW4 fight with a
causal scholar death printing diedInFight:[] (the carried r171 gap,
now observable); the war-path wave-5 bar line still appearing on a
full-seat audit (finalvoice fix (b) not holding — r188's carried
item); the (h) wave-5 shortfall voice missing from morning briefings
where the shortfall is real (voiceless-a build not firing); a
CORPUS-PURITY NO-GO on any pass (instrument failure, investigate
before trusting that pass's verdicts); a fusion-offer event firing
with the pellet gate misfiring (prize bag granting fusion_reactor
without pellet possession, or the offer firing while a sheet is
pending); ANY `SYSTEM: ""` line in a post-fix panel transcript (fix
regression — FAIL LOUDLY); a funeral-mend event firing with no
voicing, or a funeral changing survival in a way the r211 panel
cannot explain.

BINDINGS (carried from r203/r211 verbatim; metric binding §14 — a miss
is NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review; full text in
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
- M23b adopted this run; its proof test is
  test-analyzer-m23b-r219.js (real r211 corpora).
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held in r211).
- M2c adoptedRefs (HOLD). CORPUS-PURITY (HOLD). M25c buyout-early
  (HOLD). M24b (HOLD — vacuous on every pass so far).
- Telemetry baseline: r188 baseline stands (r211 pass-A sums uw 21,
  won 4/5, peakVet within regime vs baseline uw 22, won 4, peakVet 8
  — same regime, NOT rolled). This run compares pass-A-live against
  the r188 baseline (same 5 seeds, same regime, live policy).
