# Journey endgame r211 — PRE-REGISTRATION (lane B, 2026-11-15 04:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (r209 succession landed
af56c7b4f, rotation 7->4, verified in the memory log). This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing — a
failed or partial run does not advance the leg, per r135/r138/r140/r194
precedent.

Run number basis: the highest journey run number on disk is r210
(establishment, 2026-11-15). r204 is taken (scale, 2026-11-14); r206 is
taken twice (social life 2026-11-14 AND scale 2026-11-15 — a numbering
collision already on record). r205 and r207 have no files anywhere — gaps,
not available numbers. This run is r211 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-15T09:55:24Z (run_id 2026-11-15T09:55:24Z).
- Main tree: `git status --short` 0 lines, disk 39% (fail line 85%).
- `git pull` "Already up to date" at 09:55Z (master c6343a839).
- Reaper ran at run start: removed nothing; 12/16 active, all dirty
  (never auto-removed).
- Registration incident: `worktree-register.sh journey2-endgame` FAILED —
  a stale branch `journey2-endgame` already existed (reflog: "Created from
  HEAD" 2026-11-15 08:49:28Z, tip 7251dcb4f; no worktree, no registry
  entry, no lock at run start — a dead earlier attempt's leftover, owner
  unknown). The branch is a strict ancestor of master (verified with
  `git merge-base --is-ancestor`), so it holds no unmerged work. Manual
  attach (`git worktree add <path> journey2-endgame`) succeeded after
  ~235s; fast-forwarded the branch to c6343a839 in the worktree
  (`git merge --ff-only c6343a839`, clean); registry entry added manually
  under REGISTRY.lock with the register script's own atomic-write schema
  (owner oversight-playtest-loop-2, run_id 2026-11-15T09:55:24Z,
  purpose "village journey lane B: endgame", status active);
  heartbeat read back 10:06:48Z; detached heartbeat loop
  `journey2-endgame-hbloop-r204.sh` (sic — named r204 before the
  renumbering to r211; the loop only heartbeats the slug) re-heartbeats
  every 5 min. The register script's retry path (attach to an existing
  branch) did NOT work from inside the script — worth a look by whoever
  owns the script; the manual attach worked first try.
- Exec wall: long jobs run NOHUP-DETACHED with log polling (r178 prereg);
  this box is heavily loaded (simple greps backgrounding at ~10s).

SUBSTRATE: master c6343a839 EXACTLY (worktree HEAD at registration, after
the fast-forward above).
Probe-side changes only, pre-planned below, plus any game fix emerging
from the pilot (own proof test, judged on a post-fix re-run per the
r147 rule, never claimed from the pre-fix pilot). Probe:
scripts/probe-endgame-r211-20261115.js (r203 probe verbatim EXCEPT
renames r203->r211, evidence dir 2026-11-15/perseed-endgame-r211,
header). Analyzer: scripts/analyze-endgame-r211-20261115.js (r203
analyzer verbatim EXCEPT input dir, r203->r211 — INCLUDING the r199
one-line M23 fix, `capNoRefusal` without `&& x.delivered` — PLUS the
three r203-metric-review revisions below). Dark probe:
scripts/probe-darktable-r211-20261115.js (r203 dark probe verbatim
EXCEPT renames + outdir). COMPETENT_PIN=r127 support already in the
tree. NO A-frozen arm — (l) EXONERATED in r194 and no policy file
changed since. M2b GREEN from r182 — no re-sweep (carried as proven).

HEAD DELTAS SINCE r203 SUBSTRATE (723c53571 -> c6343a839, verified by
git log; 13 src/js commits, +356/-22 plus the r203/r206/r208/r209/r210
landings themselves):
(a) 0d8d3650a mirror cap: arena Reunion mirrors capped at 1
    (REUNION_ARENA_MIRROR_CAP). Arena-only.
(b) e17c08d78 Reunion arena balance: HP x0.4, damage x0.5 via
    arena-only clone (Steve-ordered 2026-11-14); mirror cap still 1;
    wild Reunion untouched.
(c) ee8292e0b Reunion arena re-tune (CORRECTION 3): damage scale
    0.5 -> 0.6 (HP stays x0.4); panel 1 won 6/8 TOO EASY, sweep point
    H=0.4 D=0.6 predicts 3-4 wins. Endgame-adjacent: arena fights feed
    the census and the trial door — watch fight shapes and arena deaths.
(d) 52a84cd46 sim-funeral-mend-b: funeral mend in hierarchy.js
    (FUNERALMEND default ON). Funerals happen in endgame villages —
    watch the corpus for a funeral-mend event and any survival shift.
(e) 93f88819c journey-establishment r139: spotter wiring (forage +
    bumpPlantFamiliarity grants, faster-ID threshold benefit). Food
    economy — watch pantry trajectories.
(f) 413252eb4 journey-landing r129: terrain-pocket fix
    (findWalkableEntry main-region + stacked-spawn) + D1 menu label.
    Map/travel — watch for stuck-travel or spawn anomalies.
(g) af56c7b4f journey succession r209: deferred-ask ledger guard +
    favor-block noBeat. Dialogue quality — watch transcripts.
(h) 783487438 journey-crisis r208: lapsed want thread names the
    current favor, not the stale one. Dialogue quality.
(i) 365b17d7d Lane B social life r206: invite-small double-serve fix
    (betrayal.js +28). Social.
(j) Version bumps: build.js stamp only.
(k) e37c4503b + aea3cb311 sim-holdbuild-b: hold build ADDED then
    REVERTED — net zero in game code; measurement + instruments kept.
(l) r203/r206/r208/r209/r210 landings: evidence/tooling + the fixes
    above; no table/ladder/waves change.
No game-balance change to table/ladder/waves. Any OTHER headline
difference is a same-run investigation item, never a road claim, and
is attributed first to these deltas before any wider claim.

FIX BRIEF — DOUBLED QUOTES (r198 finding (c), recurred r203; this run
fills the blank):
- Symptom: transcripts render `📺 SYSTEM: ""...""` — a doubled pair of
  quotes around every quoted System feed line (pass C: 36 hits on
  89701, 89 on 89704, 1 each on 89702/89703), plus nested straight
  double quotes inside the quoted line on the showbiz feed line
  (`"most watchable human"`).
- Root cause (verified in code, not guessed): `sysSay(text)` in
  src/js/game.js wraps the text in quotes
  (`this.say(`📺 SYSTEM: "${shown}"`)`), while nearly every call site
  already passes text wrapped in `"..."` (alienPlayers.js fan lines,
  game.js, contests.js). The single-prefix fix (r10) stripped a
  leading 📺 but never the redundant outer quotes.
- Fix (this run, worktree only): (1) sysSay strips ONE redundant outer
  quote pair from the display string when the text already starts and
  ends with `"` — display only; the SYSTEM VOICE lookup still receives
  the ORIGINAL text, so pre-generated MP3 matching is unchanged.
  (2) The nested inner straight-double-quotes become single quotes in
  the three alienPlayers.js feed lines that nest them (showbiz
  "most watchable human", rival-gossip "still interesting. For now.",
  crowd "BORING,") — the message-board line already uses single quotes
  inside, which is the codebase's correct pattern. Any further nested
  call-site quotes found by the audit get the same treatment.
- Proof: new test scripts/test-sysay-quotes-r211.js (shared harness):
  already-quoted input renders ONE pair; unquoted input still gets
  quotes; the showbiz line renders with single inner quotes; the voice
  lookup still receives the original text. Plus a corpus scan: post-fix
  panel transcripts must contain ZERO `SYSTEM: ""` lines — any
  remaining hit is a fix failure, FAIL LOUDLY.
- Scope guard: the fix changes displayed text only; no game state,
  no RNG, no voice lookup. The post-fix panel doubles as the live
  verification.

ANALYZER REVISIONS (r203 metric review, adopted this run — tooling
only, no re-score of r203):
(R1) VACUOUS-UNANSWERED headline: when PRIMARY-BINDINGS fails ONLY on
  verdicts whose note starts with "VACUOUS", the headline prints
  `PRIMARY-BINDINGS VACUOUS-UNANSWERED` instead of NO-GO. A real
  failure anywhere in the bindings still prints NO-GO. Exit code
  still follows ALL (unchanged).
(R2) M5-voicing-canonical: on a band with NO forcedrift control seed,
  M5 is VACUOUS (GO with a VACUOUS note: "no forcedrift control seed
  in this band — voicing unmeasured, not failed"), not NO-GO.
(R3) ROAD-TALLY earned vs sat: a tally line distinguishing full seats
  EARNED (firstFullSeatDay != null) from SAT (satSeatKind 'full'),
  naming earned-not-sat seeds.
- Proof: scripts/test-analyzer-revisions-r211.js runs the r211
  analyzer (ANALYZEDIR) against the REAL r203 corpora, renamed to
  endgame-r211-*.json in a temp dir: pass B fixtures must print
  VACUOUS-UNANSWERED (only M23 vacuous fails there); C-wide fixtures
  must print M5 GO with a VACUOUS note AND a NO-GO headline (M3b-peak
  fails for real — proving the headline discriminates); pass C
  fixtures must print earned 3 sat 2 with earned-not-sat 89704.

PROBE ENV (six vars — r198 RELAYGREY lesson, not five): FULLSEAT,
VETCOMMIT, CAPABLE_GREEDY, ARMORYDRIVE, CAPABLE_VETGUARD, RELAYGREY.
TELEMETRY_FULL is inert in this probe (never read).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188/r194/r198/r203 precedent: same seeds, same
probe policy, only the game code changed) — no fresh band is needed or
claimed for the pilot.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r203
  pass A. Outdir perseed-endgame-r211. COMMITTED CORE.
- Pass B-live: CAPSTONE=1 BUYOUT=1 — capstone delivery + buy-out,
  matched to r203 pass B. Outdir perseed-endgame-r211-b.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r203 pass C. Outdir perseed-endgame-r211-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89722, 89723 (wavesnw) + 89724–89729 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r211-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Dark probe: FULL re-run, all 7 variants, fresh evidence dir
  perseed-endgame-r211-dark/.
TIME-BOX: passes run sequentially; the cut order if the window closes
is dark, then C-wide, then C-live, then B-live. A-live is the committed
core — the run is not complete without it. PILOT FIRST (§9): if pass A
reproduces r203 with nothing interesting, the run documents and closes
out WITHOUT burning the full multi-seed panel — r203 ran the full
panel yesterday on nearly the same substrate, and the deltas are small.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band
89722–89729 searched across all journey preregs
(`evidence/*/journey-*-prereg.md`) and sim preregs
(`evidence/*/sim-*-prereg.md`) — ZERO hits. Named only here, as the
r211 C-wide band. Matched seeds 89701–89705 are deliberate reuse per
the precedent above.

R203 PASS-A BASELINE (per-seed, from the r203 run note; judged on
these seeds, pass A-live):
- 89701 waves: sat d98, lesser, w4=5 w5=0, peakVet 1, uw 4.
- 89702 waves: sat d100, lesser, w4=8 w5=0, peakVet 1, uw 4.
- 89703 waves: sat d90, lesser, w4=6 w5=0, peakVet 1, uw 4.
- 89704 forcedrift: sat d91, lesser, w4=8 w5=1, peakVet 2, uw 5.
- 89705 wavesnw: sat d90, lesser, w4=5 w5=0, peakVet 3, uw 5.
Tally r203 pass A: lesser 5/5, full 0/5, village-lost 0/5. Pass B:
lesser 5/5, full 0/5 (M23 VACUOUS — deed gate never ok). Pass C:
lesser 2/5, full 2/5 sat (89703, 89705) + 1 earned-not-sat (89704,
died d82). Dark probe: 1 failed step (v1a-loss: D2-twist-fired),
bit-identical to r171/r178/r182/r185/r188/r194/r198. Starvation:
zero lives on all 13 bought seeds.

R211 QUESTIONS: (1) pass A-live: does the pilot reproduce r203
modulo the named deltas (a)–(l)? (2) M23 under the r199-fixed
analyzer: on pass B/C, does the fix still hold (delivered capstones
price full, zero non-exempt refusals)? (3) §NO-OVER-ATTEMPT: zero
'over' attempts on every pass? (4) §REFUSAL-WINDOW: no refusals to
window on any pass? (5) passes B/C: do the full-seat roads reproduce
— bundle on 89704/89705, tribute still never fires? (6) C-wide fresh
band: full seats? losses? does the bundle road hold on unseen seeds?
(7) dark re-verify: the v1a-loss:D2-twist-fired step stays the ONLY
failure, bit-identical, v3 still names Amelia Moon, D1–D4/D6 hold?
(8) people check: do the sitting seeds' finales read as people — and
do the new dialogue deltas (g)/(h) and the funeral mend (d) read
clean? Is the doubled-quotes fix visible in the wild (zero
`SYSTEM: ""` in the new transcripts)? (9) the 159-turn Algorithm
fight (r194 89701 d107): does it recur, and does the Reunion arena
re-tune (c) change any long fight's shape? (10) the fast-branch
diedInFight gap from r171 — NOT recurred in r182/r185/r188/r194/r198/
r203; watch the corpus for a fastW4 scholar-death fight. (11)
starvation watch on every bought seed (Joja price in lives). (12)
r198 findings (a)/(b)/(d) (SAY repetition, Indispensable
middle-beats linearization, unmerged Blackberry stacks) — documented,
out of this run's scope unless a fix emerges from the pilot; (c)
doubled quotes — FIXED this run, verified in the wild. (13)
fusion-offer delta (r203 (d), now (m)): does any corpus event show
the pellet-possession gate or the sheet-pending deferral firing?

INTERESTING FINDING (what would count): any pass-A-live-vs-r203
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
firing while a sheet is pending); ANY `SYSTEM: ""` line in a post-fix
panel transcript (fix failure — FAIL LOUDLY); a funeral-mend event
firing with no voicing, or a funeral changing survival in a way the
r203 panel cannot explain.

BINDINGS (carried from r203 verbatim; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review; full text in
evidence/2026-11-14/journey-endgame-r203-prereg.md, §BINDINGS):
M1-guard, M2-census, M2c/M2d engine coverage, MFLEE-routed-coverage,
KILL-ANATOMY-coverage, M5-voicing-canonical (REVISED (R2) this run:
vacuous without a control seed), M10-fullseat-gap, M11-standing-peak,
FIRENARR/HURTRETURN-captured, FALLEN-ambush, CORPUS-PURITY (per pass),
L-PEAK, M21-audit-crosscheck (full-seat exemption), M23-CAPSTONE
(r199 fix; VACUOUS prints per (R1)), M24-TRIBUTE-AGREEMENT,
M24b-SCHOLAR-PLUS-ONE, M25c-BUYOUT-EARLY, ROAD-TALLY (REVISED (R3)
this run: earned vs sat). M25-BUYOUT dropped (r185). M3-conversion
retired as a verdict (r188, tally only). M2b GREEN from r182, carried.
§NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD.

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- (R1)/(R2)/(R3) adopted this run; their proof test is
  test-analyzer-revisions-r211.js (real r203 corpora).
- §NO-OVER-ATTEMPT + §REFUSAL-WINDOW: HOLD (both held in r203).
- M2c adoptedRefs (HOLD). CORPUS-PURITY (HOLD). M25c buyout-early
  (HOLD). M24b (HOLD — vacuous on every pass so far).
- Telemetry baseline: r188 baseline stands (r203 pass-A sums uw 22,
  won 5, peakVet 8 vs baseline uw 22, won 4, peakVet 8 — ±1, same
  regime, NOT rolled). This run compares pass-A-live against the r188
  baseline (same 5 seeds, same regime, live policy).
