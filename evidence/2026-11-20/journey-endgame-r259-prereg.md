# Journey endgame r259 — PRE-REGISTRATION (lane B, 2026-11-20 16:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run: the full cycle turned since the last leg-4 run — r255 endgame
(2026-11-20, rotation 4→5 by its adoption), r256 social life (5→6),
r257 crisis (6→7), r258 succession (7→4, landed ef5e65cb1). The
rotation file reads 4 because the cycle completed, not because a write
was missed. This run plays leg 4 again and writes 5, social life, at
closeout ONLY after a verified landing — a failed or partial run does
not advance the leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r258
(succession, 2026-11-20). This run is r259 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-20T21:55:36Z (run_id playtest-loop-2-20261120T2155Z).
- Main tree: `git status --short` 0 lines, disk 48% (fail line 85%).
- `git pull --ff-only`: "Already up to date." HEAD contains
  origin/master (local master ahead of origin by the unshipped batch;
  ship loop owns pushes); not a stale base.
- `bash scripts/worktree-reap.sh`: SKIPPED — "registry lock held by
  another reaper run (consecutive skips: 2)". Safe skip, not a failure;
  the reaper's lock was held by a sibling scan. Worktree count 12/16
  at registration time, so the cap is not binding.
- Registration: `worktree-register.sh journey2-endgame` completed
  21:57–22:16Z (~19 min; slow full checkout — disk contention from
  sibling loops: Lane A check.js, lendfix panel, a flesh-out
  registration racing the same registry lock). Branch
  `journey2-endgame` did not exist (deleted at the r255 adoption
  release), so `-b` created it fresh at master 1fcd7edba. Heartbeat
  landed at registration (2026-11-20T22:20:20Z — the heartbeat call
  itself waited ~3.7 min on the registry lock); hbloop (pid 42530,
  setsid nohup) started, every 5 min, logging to
  hidden_files/journey-endgame-r259-heartbeat.log.
- EVIDDIR set explicitly on EVERY pass invocation (r237 incident
  lesson). No overwrite: all pass corpora verified intact and distinct
  at closeout.

SUBSTRATE: master 1fcd7edba EXACTLY (worktree HEAD). No fix arm
pre-filed this run EXCEPT the war-path diagnostic below (probe-side
instrument, zero src/js — the r255 open item, pre-filed here before
any scored seed). A defect the panel surfaces is filed as an F-item
and fixed only under the r147 rule (planned before scored seeds, own
proof test, judged on the post-fix panel); a mid-run fix otherwise
gets its own proof + a re-run of affected passes, recorded in the run
note.
Probe: scripts/probe-endgame-r259-20261120.js (r255 probe verbatim
EXCEPT renames r255->r259, evidence dir 2026-11-20/perseed-endgame-r259,
header, substrate comment 1fcd7edba, + PLAN-map entries 89840–89847
(r259 C-wide fresh band, verified fresh below), + the WARPATH
diagnostic (§WARPATH, probe-side only, zero src/js) — verified by
diff: only renames, dates, comment reflows, the substrate comment,
the new band, and the diagnostic; zero other logic change).
Analyzer: scripts/analyze-endgame-r259-20261120.js (r255 analyzer
verbatim EXCEPT input dir, r255->r259 — verified by diff the same
way).
Clone: scripts/clone-endgame-r259.py (r255 clone script verbatim
EXCEPT r255->r259 renames, WT path, new band, + the diagnostic
injection; the byte/char `robust_write` fix from the r246 adoption
is carried; the `--print-probe` / `--print-analyzer` bash-redirection
fallback is the escape hatch if the flap flickers during cloning).
Dark probe: SKIPPED — no delta since r211 touched the dark table
(r211 skipped on the same reasoning; r219/r225/r230/r233/r237/r239/
r243/r246/r249/r255 skipped too).
COMPETENT_PIN=r127 support already in the tree.
NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
M2b GREEN from r182 — no re-sweep (carried as proven).

WARPATH DIAGNOSTIC (§WARPATH, pre-filed — the r255 open item):
r255 reported the war-path engagement lines as mangled: C 89702
"They faced The Big Thing... They faced Big Big..." and D 89705
"They faced Big-Bane... They faced Big Ugly...", against kills the
same transcripts name "The Loud Beast" / "The Ugly Beast" /
"Loud-Bane". The r255 note hypothesized the template composes a
"Big" prefix onto monster-name fragments. Static reading says
otherwise and is UNPROVEN either way: `generateMonsterName`
(game.js:24120) builds village names from 3 traits (big/loud/ugly)
× 3 temperament pools, so "The Big Thing" (cautious+big),
"Big Big" (steady+big), "Big-Bane" (bold+big), "Big Ugly"
(steady+ugly) are all generatable SETTLED village names — and
`monsterNoun` returns the settled villageName verbatim, while the
kills and the engagements name DIFFERENT monsters by construction
(engagements exclude killed mids, table.js:478). The r255 author
compared against System names (The Audit etc.) the village never
knew — but the 89702/89705 transcripts are announce-window only,
so the naming history that would settle it is OUTSIDE the window.
This run adds a pure-read dump to the probe clone, taken in the
daily hook on the first day `pg.tableDone` flips (the same block
that records satDay): `warpathDeedsAtSit` = tableDeedRecords()
kills + engagements, each with mid, day/by, monsterNoun, codex
villageName, and System name, plus systemArrived. Pure reads only
(tableDeedRecords is documented pure; mulberry32 is hash-seeded,
not Math.random) — zero trajectory effect; a re-run of pass A with
this instrument must reproduce r255 pass-A trajectories exactly
on the shared seeds modulo the named live deltas.
DECISION RULE (frozen here): (i) if the dump shows each printed
engagement name IS the settled villageName of a wave-4+ mid the
village actually faced (and the kills' names are the settled names
of the killed mids), the war-path is FAITHFUL — r255's "mangled"
is a misdiagnosis, NO code fix; the narrow name-space (27
generatable names for 72 monsters — "Loud-Bane" vs "Big-Bane" as
different monsters) is recorded as a design observation for Steve,
not a defect. (ii) If any printed name does NOT match its mid's
villageName/System name, or names a mid never faced, that is a
real composition defect — fix under the r147 rule (own proof
test, re-run passes C and D, judged on the post-fix panel).

INSTRUMENT (carried from r255/r249/r246, probe-side, zero src/js): per-seed JSON
gains `noTickDeferrals` and `trioCarry`, collected by a DAILY
`Game.vbrainLogs()` scan inside the probe's onDaily hook (rolling
400-entry buffer — the scan runs daily, counts only entries with
`e.day === dayOf(G)`; read-only, no RNG consumed). Observations r246/r249/r255:
deferrals 0 and trioCarry 0 on ALL passes — the instrument records clean
zeros; the (a)/(b) gates stayed off as expected.
EXPECTATION this run: same — 0/0 on every pass with the gates off;
any non-zero is a surprise worth naming.

HEAD DELTAS SINCE r255 SUBSTRATE (59711ccc5 -> 1fcd7edba, verified by
git log + git diff; net src/js diff 6 files, +74/-6; policy file
scripts/policies/competent.js +50). Classified:
LIVE (behavior changes under the default panel):
(a) R258 SELFWIT (betrayal.js, ef5e65cb1): the ambush-path death
    record's witness list excludes the victim (the combat path
    already did via fightWitnesses; the ambush path did not — the
    dead witnessed their own death). LIVE death-record change.
    Watch: witness flags on death records, witness-mourning firings
    (r255: 0/224 witnessed — the supply question carries).
(b) R256 DRY2 (conversation.js, ed19c3d57): the exhausted-pool
    replacement pick is now itself checked against the ledger, and
    when every variant is blocked the admission speaks structural
    instead of drying (r238 seed-45752 was the wild dry). LIVE
    dialogue. Watch: DRY census (expect 0).
(c) R149 GOAL-BRIDGE POOL 2→6 (convo-beats.js): four new goal
    bridges; a sitting needs seven goal-bridges before any repeat.
    LIVE dialogue. Watch: goal-bridge repeats inside one sitting.
(d) R247 SETTLED-FAVOR NAMES THE FAVOR (convo-dialogue.js,
    b6a551691): the settled-favor opener now names the favor's
    short ("It's already handled — the pantry run."). LIVE dialogue.
    Watch: settled-favor opener lines naming the short.
(e) R246 REACT-EXHAUSTION (convo-wants.js, 6b8051ec2): the bare
    react retires after 2 dry reacts in a row (the want menu
    bypassed the pool gate; Miguel d90 tapped "So." twice while the
    want advanced on nothing). LIVE dialogue. Watch: react-dry
    repeats.
(f) R149 REACHABILITY PRE-CHECKS (scripts/policies/competent.js —
    POLICY, not game code): beastDodgeMove skips unreachable tiles
    and stops when the move budget is spent; closeStep /
    beastStrikeTarget skip no-path candidates (seed-1277 burned 33
    refused moves in one fight). The bot wastes fewer turns in
    walled-in corners. FIGHT-ADJACENT: fight outcomes (kills,
    flees, refused-move counts) may shift vs r255 — attribute panel
    movement to this first. Watch: refused-move counts in fight
    transcripts, w4plusKills vs r255 (A 13, C 7).
ENV-GATED (inert under the default panel):
(g) BOWKNOW / SEARSUPPLY: unchanged (SEARSUPPLY reverted entirely).
    BOWOPEN / SPEARGATE / SENSEEXPED: still gated, unchanged.
    ALLYSLOT3: NOT in src/js on master (grep: zero hits).
    PARTYSIZE4 / FIGHTALLY2 / WILDAVOID / FLEEREPAIR2 / FLEEREPAIR3:
    unchanged, still gated. FIGHTALLY2 on for Pass D only (seventh
    sighting, see below).
INSTRUMENTS ONLY (no src/js game change): the WARPATH diagnostic
above (probe-side).
(h) build.js +2 / sw.js / version.json: version bumps only.
No table/ladder/waves/monster change besides (a)–(f). Any headline
difference on Pass A/C/C-wide is attributed first to the LIVE deltas
(a)–(f), then to the instrument recorders, then to dialogue/RNG-draw
shifting — never to an env-gated lever, because none is live under the
default flags. Pass D is the only pass where a fight lever moves, and
it is judged separately.

PROBE ENV (six vars — r198 RELAYGREY lesson, not five): FULLSEAT,
VETCOMMIT, CAPABLE_GREEDY, ARMORYDRIVE, CAPABLE_VETGUARD, RELAYGREY.
TELEMETRY_FULL is inert in this probe (never read).

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188/r194/r198/r203/r211/r219/r225/r230/r233/r237/
r239/r243/r246/r249/r255 precedent: same seeds, same probe policy, only the
game code changed) — no fresh band is needed or claimed for the pilot.
SMOKE (harness + timing check, not a binding panel seed): 89706
(wavesnw), pass-A policy, full horizon. Records probe wall time per
seed on this box; if the smoke fails to boot, FAIL LOUDLY and stop.
The smoke ALSO validates the instrument (noTickDeferrals +
trioCarry fields present on the per-seed JSON, even if empty) AND
the WARPATH dump (warpathDeedsAtSit present — null only on a
never-sat seed).
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled; EVIDDIR SET EXPLICITLY ON EVERY INVOCATION
— r237 incident: a pass launched without EVIDDIR overwrote Pass A's
corpora; the probe default still points at the r259 dir only after the
clone, and the explicit env is the belt-and-braces):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r255
  pass A. Outdir perseed-endgame-r259. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r255 pass C. Outdir perseed-endgame-r259-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89840, 89841 (wavesnw) + 89842–89847 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r259-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Pass D (STRETCH, SEVENTH SIGHTING): FIGHTALLY2=1 + CAPSTONE=1
  BUYOUT=1 BUYOUT_EARLY=1 on the matched seeds 89701–89706. Outdir
  perseed-endgame-r259-d. Judged on the same bindings as pass C
  (analyzer with ANALYZEDIR pointing at the -d dir; no --wide flag).
  r255 said no further sighting was owed absent a fight-engine
  change; no fight-engine change landed since (ALLYSLOT3 is not in
  src/js; SENSEEXPED/BOWOPEN/SPEARGATE stay gated off) — but the
  r149 POLICY reachability change (f) IS fight-adjacent (fewer
  wasted turns), so this pass runs ONLY if the window allows after
  A/C/C-wide, as a seventh observation of the r239-vs-r243 question
  (uplift 2/6 full, kills 13 vs level 1/6 full, kills 6–9). If cut,
  recorded as CUT.
- Pass B: SKIPPED BY DESIGN — r230 pass B was vacuous NO-GO (0
  capstone attempts, 0 deliveries, 0 buyout attempts on all 5 seeds;
  deed gate ok on 0/5). The converting road is pass C, not B; re-running
  B on this substrate would only re-confirm vacuity. The interesting
  questions (does the road still convert? does wave 5 get faced? does
  the second ally slot move kills? do the (a)–(f) deltas move
  anything? does the NOTICKEXACT deferral fire? are the war-path
  names faithful?) are answered by passes A, C, C-wide, and D.
TIME-BOX: passes run sequentially; the cut order if the window closes
is D, then C-wide, then C-live. A-live is the committed core — the run
is not complete without it. PILOT FIRST (§9): the smoke + first two
pass-A seeds verify the harness on this substrate before the full panel
burns.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89840–89847
searched across ALL evidence *.md preregs, run notes, screens, and
scripts/*.js/*.py (word-boundary grep for 8984[0-7] over evidence/
--include='*.md', docs/ --include='*.md', scripts/*.js, scripts/*.py —
ZERO seed hits in any dated prereg, run note, screen, or forbidden/
contaminated list; the only hits are the `ba6d89846` commit hash in
2026-11-06 notes — a SHA fragment, not a seed). The adjacent band
89830–89837 was used by r255 (today) and is NOT reused; 89820–89827
was used by r249 and is NOT reused. Named only here, as the r259
C-wide band.

R255 PASS-A BASELINE (per-seed, from the r255 run note; judged on
these seeds, pass A-live):
- 89701 waves: lesser, won, uw 5, FACED wave 5 ×0, standing peak 427,
  sat d90, peakVet 2, kills 2.
- 89702 waves: lesser, won, uw 5, FACED wave 5 ×3, standing peak 536,
  deedGateFirstOk d70 (no capstone — binding unanswered on A),
  peakVet 4, kills 5, sat d92 lesser.
- 89703 waves: lesser, won, uw 5, FACED wave 5 ×0, standing peak 521,
  sat d95, peakVet 2, kills 3.
- 89704 forcedrift: lesser, won, uw 5, FACED wave 5 ×2, standing
  peak 527, sat d91, peakVet 2, kills 0.
- 89705 wavesnw: lesser, won, uw 5, FACED wave 5 ×1, sat d90,
  peakVet 2, kills 3.
- 89706 wavesnw (smoke): lesser win d92, peakVet 1.
Tally r255 pass A: lesser 5/5, full 0/5, village-lost 0/5, won 5/5.
M23b 1/5 (89702@d70, no capstone). Kills 13. peakVet sum 12.
Pass C: lesser 5/5, full 0/5, lost 0/5, won 5/5, M23b 0/5
(VACUOUS — deed gate never ok); M25c 5/5 bought early. Kills 7.
C-wide (89830–89837): lesser 7/8, full 0/8, lost 1/8 (89831),
never-sat 0/8; M25c 8/8 bought; M23b 0/8. Kills 7.
Pass D (FIGHTALLY2): lesser 5/6, full 1/6 (89705 FULL d84,
deedGateFirstOk d83 DELIVERED), won 6/6, M23b 1/6, kills 7
(C 7, A 13), wave-5 faced on D 89705.

R259 QUESTIONS: (1) pass A-live: does the pilot reproduce r255 modulo
the named deltas (a)–(f) — in particular, does the r149 policy
reachability change (f) move wave-4 kills, refused moves, or veteran
banking on the matched band, and does 89702 still reach the deed gate
on pass A? (2) WARPATH: does the dump show the engagement names are
the settled village names of faced monsters (decision rule above) —
and do the new transcripts' war-path lines match the dump exactly?
(3) TABLESITTING: does any muster or march hold/fire differently in
a mercy window (capstone delivered, finale unresolved) — the
distinction (a) from r243 exists to be observed; a mercy-window
muster that fires (or holds) is a named observation either way.
(4) NOTICKEXACT: does a party_launch:no-tick-exact deferral fire in
the wild on this panel (the new instrument counts it — day, vid,
pick), and do wave-4 launches shift on the matched band?
(r246/r249/r255: 0 on all passes — fourth observation.) (5)
TRIODROUGHT: does the carry instrument read 0 as expected (gates
off), with the field present on every per-seed JSON? (r246/r249/r255:
0 — fourth observation.) (6) DOOR-SKIP: any door-tile fight eject on
any pass — and does the r149 policy change show up as fewer refused
moves vs r255? (7) FLEDBAD: does the new recorder name any
legacy-outmatched firing (day + monster HP)? (8) POCKET: any pocket
monster left unreachable? (9) M23b: on pass C, does the deed gate go
ok and does the buyout road convert again (r255: 0/5 matched, 0/8
fresh — repeat, rotate to another seed, or revert)? (10) does a
SECOND buyout seed convert this round? (11) C-wide fresh band: does
ANY seed face wave 5 (w5max>0) or take a full seat — or does the
r255 finding hold (0/8 full, 0 deed-gate OK)? (12) F1 #2519
RECURRENCE: does any seed never sit (exiled scholar, guard stall)?
(13) F5: does the settled-favor branch fire in the wild on THIS
panel (r255 endgame: vacuous 0 hits; succession r233: F5 FAIL as
written — the endgame watch is whether the Amanda fix moves the
wild count at all)? (14) C3d: does the recap-live-want fix hold in
the wild — a recap naming the live want instead of the empty pool
(r255: vacuous, no recap sittings on the endgame panel; the watch
stays open for a panel with recap sittings)? (15) ECHO: does the
link-accept voice end the parrot — any accepted raise talk still
serving '"All right — let's ask them."' (regression — FAIL LOUDLY)?
(16) WANT-BRIDGE: does the 6→10 pool end the seventh-deflect repeat
(r146's HEED-V=1 case) in the wild? (17) COMPANIONGUARD: do launches
still form pairs/trios under the guard + plan-death — count guard
skips (companionGuardSkips) and watch for a plan record listing a
companion who never left (the mirror gap the guard claims closed;
r255: A/C/C-wide/D counts in its run note)? (18) DEATHCLEANUP: how
many win-plan deaths fire per seed (deathCleanups sample) — and
does any plan die with its holder mid-launch in a way that strands
a launch? (r255 pass C: 12 total, 0 removal cleanups, no stranded
launch — check r255's tally in its note.) (19) does 89705 lose its
village again (r230: lost d59; r233/r237/r239/r243/r246/r249/r255:
survived), or does the dialogue/RNG delta change its fate? (20)
starvation watch on every bought seed (Joja price in lives). (21)
funeral-mend watch (r255: FIRED + voiced — count in its note).
(22) the 159-turn Algorithm fight (r194 89701 d107): does it recur?
(23) the fastW4 diedInFight gap (r171): watch the corpus for a
fastW4 scholar-death fight. (24) PASS D SEVENTH SIGHTING: does the
second ally slot repeat r239's effect (2/6 full seats, kills ~13)
or r243/r246/r249/r255's level result (1/6 full, kills 6–9) on the
new substrate — and does any meeting party field FOUR (the #2515
cap broken), or does the sense still cap at 2 allies? (25)
GUARD-STALL WATCH: same not-ready reason ≥30 consecutive days =
LOUD line in the run note. (26) TOTAL-DEFERRAL WATCH: announce→sit
deferral ≥30 days total = LOUD line (the r246 89701-A 29-day
deferral sits one day under the line — fifth observation).
NEW THIS RUN: (27) DRY2: any DRY line on the panel (the r256 fix
failing — FAIL LOUDLY)? (28) GOAL-BRIDGE: any goal-bridge line
repeated inside one sitting before 7 bridges (the r149 pool
failing)? (29) SETTLED-FAVOR: any settled-favor opener that does
NOT name the favor when a speakable short exists (the r247 fix
failing)? (30) REACT-EXHAUSTION: any "So."-style dead react tapped
3+ times in one sitting (the r246 fix failing)? (31) SELFWIT: any
death record whose witness list contains the victim (the r258 fix
failing — FAIL LOUDLY)? (32) REACHABILITY: any refused-move
("Too far" / "No path there") cluster ≥10 in one fight (the r149
policy fix failing)? (33) COUNTER-LABEL HOLD: any clause-head
counter line carrying a raw comma-clause descriptor (the r244 fix
failing in the wild — FAIL LOUDLY)? (34) ANTLER-THRASH HOLD: any
"The The" thrash line (the r253 fix failing — FAIL LOUDLY)? (35)
DOUBLE-"THE" HOLD: any "The The" scream / outing line (the r249
fix failing — FAIL LOUDLY).

INTERESTING FINDING (what would count): any pass-A-live-vs-r255
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r255 had uw 4; a full seat on pass A; a full
seat on a new C-wide seed; a SECOND full seat on pass C; a village
dying before d90 on any pass (survival collapse — name the seed, the
day, the cause); a tribute delivery firing (M24 exercised for the first
time in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a deedGateFirstOk on a seed where r255 had none (M23b moves); a
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
survival in a way the r255 panel cannot explain; an F5-class dry hit
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
NEW THIS RUN: a war-path engagement name that does NOT match its
mid's settled villageName (real composition defect — fix under
r147); a war-path name matching a mid never faced (same); a DRY
line anywhere (r256 fix failing); a goal-bridge repeat before 7
bridges (r149 pool failing); a settled-favor opener not naming the
favor (r247 fix failing); a dead react tapped 3+ times in one
sitting (r246 fix failing); a death record witnessing its own victim
(r258 fix failing); a refused-move cluster ≥10 in one fight (r149
policy fix failing).

BINDINGS (carried from r203/r211/r219/r225/r230/r233/r237/r239/r243/
r246/r249/r255 verbatim; metric binding §14 — a miss is NO-GO, never re-scored
mid-run; PRIMARY-BINDINGS is the headline, per r135's metric review;
full text in evidence/2026-11-14/journey-endgame-r203-prereg.md,
§BINDINGS):
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
- M23b tally: Pass A 1/5 (89702@d70, no capstone), Pass C 0/5
  (VACUOUS), C-wide 0/8, Pass D 1/6 (89705@d83, DELIVERED) — r255.
- F5 + C3d stay vacuous on the endgame leg unless this panel's sittings
  reach them — the watches need a panel whose sittings reach them, not
  a metric change. The succession leg's F5 FAIL as written (r233) is
  noted but does not change the endgame watch: the endgame panel
  measures whether the Amanda fix moves the wild count.
- GUARD-STALL WATCH (r243): same not-ready reason ≥30 consecutive
  days = LOUD line. TOTAL-DEFERRAL variant (r246): announce→sit
  ≥30 days = LOUD line.
- Telemetry baseline: uw 22 / won 4 / peakVet 12 (file rolled by
  r255: peakVet 3→12 on ONE observation, the BOWCRAFT substrate —
  per-seed peak [2,4,2,2,2]). THIS RUN IS THE CONFIRMATION: if this
  run's Pass A 5-seed peakVet sum reads back in the 3–4 band, the
  r255 roll was premature and the file REVERTS to 3 with the
  adjudication recorded here; if it reads ~12 again, the roll
  stands. uw/won are NOT rolled on a quiet read.
- companionGuardSkips watch (r255: read its run note for the
  per-pass counts): HOLD as a watch, not a binding. deathCleanups
  per seed (r255 pass C: read its run note) — HOLD as a watch.
- Pass D (FIGHTALLY2): SEVENTH observation tally this run — meeting
  party sizes, wave-4 kills per seed, full seats; judged against the
  Pass C numbers on the same seeds AND against r239's, r243's,
  r246's, r249's and r255's Pass D numbers, not against a frozen bar.
- NOTICK/CARRY instrument: fourth observation this run. The deferral
  count is a new tally (no bar); the carry count's expected value is
  0 with the gates off (wiring proof, not a verdict).
- WARPATH instrument: FIRST observation this run. The dump is a
  wiring proof (names match mids), not a verdict; the decision rule
  above is frozen.
