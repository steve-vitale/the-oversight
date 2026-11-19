# Journey endgame r249 — PRE-REGISTRATION (lane B, 2026-11-19 10:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run: the full cycle turned since the last leg-4 run — r246 endgame
(2026-11-19, rotation 4→5 by its adoption), r238 social-life adoption
(5→6, landed 09:48Z today), r247 crisis (6→7), r248 succession (7→4
written and verified at closeout). The rotation file reads 4 because
the cycle completed, not because a write was missed. This run plays
leg 4 again and writes 5, social life, at closeout ONLY after a
verified landing — a failed or partial run does not advance the leg, per
r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r248
(succession, 2026-11-19). This run is r249 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-19T15:55:44Z (run_id 2026-11-19T15:55:44Z, line 2 same).
- Main tree: `git status --short` 0 lines, disk 47% (fail line 85%).
- `git pull --ff-only`: fails with "no such ref was fetched" — local
  master is 63 commits AHEAD of origin/master (b76d65445, batch ship
  2026-11-19 05:45Z); the pull cannot fast-forward a tree that is
  ahead. `git fetch origin` succeeds; HEAD contains origin/master, so
  the tree is current and no divergence exists. Expected in this
  workflow (ship loop owns pushes); not a stale base.
- WRITE FLAP (infrastructure): a host write-denial episode began
  ~15:56Z (first seen: worktree-reap.sh REGISTRY.json atomic write,
  PermissionError) and is STILL ACTIVE at 16:14Z (19 min in):
  every `git update-ref` probe fails (`.git/refs/heads/probe.lock`,
  EPERM), python os-level writes fail intermittently, while bash
  built-in redirection succeeds in the same minute. Pattern notes:
  writes to any `REGISTRY.json*` path fail from every process;
  git lock writes fail while bash echo to the same directory
  succeeds; python buffered `open('w')` to non-REGISTRY paths
  sometimes succeeds. The flap is intermittent at minute scale, not
  path-uniform. r246's flap lasted ~14 min; episodes have lasted up
  to ~56 min. This run waits and re-probes; registration is attempted
  only after a probe passes. If the flap outlasts the run window, the
  run aborts loudly per the FAIL LOUDLY rule (registration failure =
  abort) — no work in the main tree, no unregistered worktree.
- Registration: `worktree-register.sh journey2-endgame` completed
  16:22–16:29Z (~7.8 min; slow full checkout) after the probe passed
  at 16:21:16Z. Branch `journey2-endgame` did not exist (deleted at
  the r246 adoption release), so `-b` created it fresh at master
  1927a245e. Heartbeat landed at registration
  (2026-11-19T16:22:05Z); hbloop (pid 138766) started, every 5 min,
  logging to hidden_files/journey-endgame-r249-heartbeat.log.
- EVIDDIR set explicitly on EVERY pass invocation (r237 incident
  lesson). No overwrite: all pass corpora verified intact and distinct
  at closeout.

SUBSTRATE: master 1927a245e EXACTLY (worktree HEAD). No fix arm
pre-filed this run. A defect the panel surfaces is filed as an F-item
and fixed only under the r147 rule (planned before scored seeds, own
proof test, judged on the post-fix panel); a mid-run fix otherwise
gets its own proof + a re-run of affected passes, recorded in the run
note.
Probe: scripts/probe-endgame-r249-20261119.js (r246 probe verbatim
EXCEPT renames r246->r249, evidence dir 2026-11-19/perseed-endgame-r249,
header, substrate comment 1927a245e, + PLAN-map entries 89820–89827
(r249 C-wide fresh band, verified fresh below), NOTICK/CARRY
instrument carried verbatim — verified by diff: only renames, dates,
comment reflows, the substrate comment, the new band; zero other
logic change).
Analyzer: scripts/analyze-endgame-r249-20261119.js (r246 analyzer
verbatim EXCEPT input dir, r246->r249, + the instrument tallies —
verified by diff the same way).
Clone: scripts/clone-endgame-r249.py (r246 clone script verbatim
EXCEPT r246->r249 renames, WT path, new band; the byte/char
`robust_write` fix from the r246 adoption is carried; the
`--print-probe` / `--print-analyzer` bash-redirection fallback is the
escape hatch if the flap flickers during cloning).
Dark probe: SKIPPED — no delta since r211 touched the dark table
(r211 skipped on the same reasoning; r219/r225/r230/r233/r237/r239/
r243/r246 skipped too).
COMPETENT_PIN=r127 support already in the tree.
NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
M2b GREEN from r182 — no re-sweep (carried as proven).

INSTRUMENT (carried from r246, probe-side, zero src/js): per-seed JSON
gains `noTickDeferrals` and `trioCarry`, collected by a DAILY
`Game.vbrainLogs()` scan inside the probe's onDaily hook (rolling
400-entry buffer — the scan runs daily, counts only entries with
`e.day === dayOf(G)`; read-only, no RNG consumed). First observation
r246: deferrals 0 and trioCarry 0 on ALL FOUR passes — the instrument
records clean zeros; the (a)/(b) gates stayed off as expected.
EXPECTATION this run: same — 0/0 on every pass with the gates off;
any non-zero is a surprise worth naming.

HEAD DELTAS SINCE r246 SUBSTRATE (b76d65445 -> 1927a245e, verified by
git log + git diff; net src/js diff 8 files, +429/-16; policy file
scripts/policies/competent.js UNCHANGED). Classified:
LIVE (behavior changes under the default panel):
(a) COUNTER-LABEL FIX (journey-endgame r246 eccc08af2, game.js):
    `monsterCounterLabel(mid)` — the r246 fix itself, now on master.
    The r246 panel PROVED it (proof test 9/9; rendered line now
    "COUNTER LEARNED — something: ..."). This run re-observes in the
    wild: no clause-head counter line may carry a raw prose
    descriptor (living_wire etc.). Watch: counter-learned render
    sites in transcripts.
(b) F6/F5 FALLBACK FIX (journey-social-life r238 e7bd782ab,
    conversation.js +~30): the repay-opener fallback is now
    structural-exempt (a ledger-blocked pick falls to null and the
    generic "Okay. Here's the thing —" opener speaks instead of
    drying to "...Sorry, lost my train of thought."); plus the
    all-3-blocked fall-through. LIVE dialogue. Watch: DRY census
    (expect 0 — the r238 seed-45752 dry is the regression case), F5
    wild count (r246 endgame: vacuous 0; r238: F5 3 on its panel).
(c) MAPS-POOL EXPANSION (journey-landing r147 c44c7382b,
    conversation.js +~20): shared pool 3→6 lines, even-maps pool
    2→6. LIVE dialogue. Watch: bare "..." lines, maps-dry in
    sittings comparing maps 3+ times.
(d) F8 CONFIDE-LINE SECRET GATE (journey-deepening r244 baba35e87,
    conversation.js +~18): the cautious "This stays between us,
    right? Right." exit is filtered out of the pool unless a secret
    was shared (c.secretShared); pool never emptied. LIVE dialogue.
    Watch: any sitting closing on the confide line with no secret
    shared (regression — FAIL LOUDLY).
(e) F2 TITAN REFUSAL COUNTS (journey-deepening r243 d3dcd1acd,
    titans.js +23): spoken refusal count and hard gate now read the
    same helper (unique living allies + committed Haven blades);
    the old read understated the muster (9 blades heard as 6).
    Gate math unchanged (same sum); the SPOKEN number is the live
    change. Watch: titan refusal lines naming counts.
(f) #2593 AMMO NAMING (sim-speargate-a 6c55f0f2d, fieldFights.js
    +16): the field-fight 'no arrows' line names the weapon's
    ACTUAL ammo from the ammo item's data name (searcaster: fusion
    cells, crossbow: crossbow bolts, sling: stones; bow still says
    arrows). UNGATED — live narration. Watch: volley lines in
    fight transcripts.
ENV-GATED (inert under the default panel):
(g) BOWOPEN / SPEARGATE staging (sim-speargate-a 901dc9957,
    95d3c04a6, 6c55f0f2d; game.js +225, equipment.js volleyWeaponOf
    pure read, villager-agency.js +5 call site): launch-party bow
    staging + spear-gate fix, behind BOWOPEN=1 / SPEARGATE=1. OFF
    on all r249 passes. The #2593 narration (f) is the only live
    part of this arm.
(h) SENSEEXPED (sim-senseexped-b 97e78670d, party-wiring.js +72):
    launch-party sense reads the live expedition (finding #2583),
    behind SENSEEXPED=1. OFF on all r249 passes — off is
    byte-identical old sense.
(i) ALLYSLOT3: NOT in src/js on master (grep: zero hits). The
    dmgshape-b / partysurvive-b ports (b2b3cb428, ab8b62881) touch
    only evidence + scripts — sim-side ports, not game code. No
    live fight-engine change from this arm.
(j) PARTYSIZE4 / FIGHTALLY2 / WILDAVOID / FLEEREPAIR2 / FLEEREPAIR3:
    unchanged, still gated. FIGHTALLY2 on for Pass D only (fourth
    sighting, see below).
INSTRUMENTS ONLY (no src/js game change): none new.
(k) build.js +2 / sw.js / version.json: version bump only.
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
r239/r243/r246 precedent: same seeds, same probe policy, only the game
code changed) — no fresh band is needed or claimed for the pilot.
SMOKE (harness + timing check, not a binding panel seed): 89706
(wavesnw), pass-A policy, full horizon. Records probe wall time per
seed on this box; if the smoke fails to boot, FAIL LOUDLY and stop.
The smoke ALSO validates the instrument (noTickDeferrals +
trioCarry fields present on the per-seed JSON, even if empty).
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled; EVIDDIR SET EXPLICITLY ON EVERY INVOCATION
— r237 incident: a pass launched without EVIDDIR overwrote Pass A's
corpora; the probe default still points at the r249 dir only after the
clone, and the explicit env is the belt-and-braces):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r246
  pass A. Outdir perseed-endgame-r249. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r246 pass C. Outdir perseed-endgame-r249-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89820, 89821 (wavesnw) + 89822–89827 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r249-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Pass D (STRETCH, FOURTH SIGHTING): FIGHTALLY2=1 + CAPSTONE=1
  BUYOUT=1 BUYOUT_EARLY=1 on the matched seeds 89701–89706. Outdir
  perseed-endgame-r249-d. Judged on the same bindings as pass C
  (analyzer with ANALYZEDIR pointing at the -d dir; no --wide flag).
  r246 said no further sighting was owed absent a fight-engine
  change; no fight-engine change landed since (ALLYSLOT3 is not in
  src/js; SENSEEXPED/BOWOPEN/SPEARGATE stay gated off) — so this
  pass runs ONLY if the window allows after A/C/C-wide, as a
  fourth observation of the r239-vs-r243 question (uplift 2/6 full,
  kills 13 vs level 1/6 full, kills 6). If cut, recorded as CUT.
- Pass B: SKIPPED BY DESIGN — r230 pass B was vacuous NO-GO (0
  capstone attempts, 0 deliveries, 0 buyout attempts on all 5 seeds;
  deed gate ok on 0/5). The converting road is pass C, not B; re-running
  B on this substrate would only re-confirm vacuity. The interesting
  questions (does the road still convert? does wave 5 get faced? does
  the second ally slot move kills? do the (a)–(f) deltas move
  anything? does the NOTICKEXACT deferral fire?) are answered by
  passes A, C, C-wide, and D.
TIME-BOX: passes run sequentially; the cut order if the window closes
is D, then C-wide, then C-live. A-live is the committed core — the run
is not complete without it. PILOT FIRST (§9): the smoke + first two
pass-A seeds verify the harness on this substrate before the full panel
burns.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89820–89827
searched across ALL evidence *.md preregs, run notes, screens, and
scripts/*.js (word-boundary grep for 8982[0-7] over evidence/,
scripts/, docs/ — ZERO hits in any dated prereg, run note, screen,
or forbidden/contaminated list). The full-evidence grep found 3 files
containing 8982x numbers — ALL are pantry/food quantities, not seeds
("pantry": 89822 in perseed-gatelever-b-control; pantry time-series
89822, 89826 in perseed-bowopen-a corpora), so they do not reserve
the band (r246 precedent). The adjacent band 89810–89817 was used by
r246 (today) and is NOT reused; 89800–89807 is NOT fresh (89801–89808
used by sim-togrescreen-b, collision recorded in sim-finalvoice-b).
Named only here, as the r249 C-wide band.

R246 PASS-A BASELINE (per-seed, from the r246 run note; judged on
these seeds, pass A-live):
- 89701 waves: lesser, won, uw 4, FACED wave 5 ×0, standing peak 199
  (the 199-cap never released), sat d119 (defer 29d), peakVet 0, kills 1.
- 89702 waves: lesser, won, uw 5, FACED wave 5 ×0, standing peak 462,
  deedGate NEVER ok, peakVet 2, kills 5 (vKill ×4 + 1), sat d90 lesser.
- 89703 waves: lesser, won, uw 4, peak 199, sat d118, peakVet 0, kills 0,
  2 vDie (scholar died twice — Ruby d71, Guizhen Qi d91), mFlee ×13.
- 89704 forcedrift: lesser, won, uw 4, peak 120, sat d105, peakVet 0,
  vetFights 0.
- 89705 wavesnw: lesser, won, uw 4, sat d104, peak 199, survives,
  peakVet 0.
- 89706 wavesnw (smoke): VILLAGE-LOST d69 scattering (Pass A); on
  Pass C lesser d91.
Tally r246 pass A: lesser 5/6, full 0/6, village-lost 1/6, won 5/6.
M23b 0/6.
Pass C: lesser 5/6, full 1/6 (89702 FULL d101), lost 0/6, won 6/6,
M23b 1/6 (89702@d86, DELIVERED); M25c 6/6 bought early.
C-wide (89810–89817): lesser 7/8, full 0/8, lost 1/8 (89817 d48),
never-sat 0/8; M25c 6/8 bought; M23b 0/8.
Pass D (FIGHTALLY2): lesser 5/6, full 1/6 (89705 FULL d90), won 6/6,
M23b 1/6, kills 6 (C 10, A 6), wave-5 faced 2/6 seeds.

R249 QUESTIONS: (1) pass A-live: does the pilot reproduce r246 modulo
the named deltas (a)–(f) — in particular, does anything move wave-5
facing, veteran banking, or the deed gate on the matched band, given
the LIVE deltas are dialogue/narration (b)–(f) plus the already-proven
counter-label fix (a)? (2) TABLESITTING: does any muster or march
hold/fire differently in a mercy window (capstone delivered, finale
unresolved) — the distinction (a) from r243 exists to be observed; a
mercy-window muster that fires (or holds) is a named observation
either way. (3) NOTICKEXACT: does a party_launch:no-tick-exact
deferral fire in the wild on this panel (the new instrument counts it
— day, vid, pick), and do wave-4 launches shift on the matched band?
(r246: 0 on all passes — second observation.) (4) TRIODROUGHT: does
the carry instrument read 0 as expected (gates off), with the field
present on every per-seed JSON? (r246: 0 — second observation.) (5)
DOOR-SKIP: any door-tile fight eject on any pass — and does the r146
policy change show up as fewer accidental flees vs r243? (6) FLEDBAD:
does the new recorder name any legacy-outmatched firing (day +
monster HP)? (7) POCKET: any pocket monster left unreachable? (8)
M23b: on pass C, does the deed gate go ok and does the buyout road
convert again (r246: 1/6 matched, 0/8 fresh — repeat, rotate to
another seed, or revert)? (9) does a SECOND buyout seed convert this
round? (10) C-wide fresh band: does ANY seed face wave 5 (w5max>0)
or take a full seat — or does the r246 finding hold (0/8 full, 1
facing seed without converting)? (11) F1 #2519 RECURRENCE: does any
seed never sit (exiled scholar, guard stall)? (12) F5: does the
settled-favor branch fire in the wild on THIS panel (r246 endgame:
vacuous 0 hits; succession r233: F5 FAIL as written — the endgame
watch is whether the Amanda fix moves the wild count at all)? (13)
C3d: does the recap-live-want fix hold in the wild — a recap naming
the live want instead of the empty pool (r246: vacuous, no recap
sittings on the endgame panel; the watch stays open for a panel with
recap sittings)? (14) ECHO: does the link-accept voice (b) end the
parrot — any accepted raise talk still serving '"All right — let's
ask them."' (regression — FAIL LOUDLY)? (15) WANT-BRIDGE: does the
6→10 pool end the seventh-deflect repeat (r146's HEED-V=1 case) in
the wild? (16) COMPANIONGUARD: do launches still form pairs/trios
under the guard + plan-death — count guard skips
(companionGuardSkips) and watch for a plan record listing a companion
who never left (the mirror gap the guard claims closed; r246: A 10,
C 11, C-wide 1, D 15)? (17) DEATHCLEANUP: how many win-plan deaths
fire per seed (deathCleanups sample) — and does any plan die with its
holder mid-launch in a way that strands a launch? (r246 pass C: 12
total, 0 removal cleanups, no stranded launch.) (18) does 89705 lose
its village again (r230: lost d59; r233/r237/r239/r243/r246:
survived), or does the dialogue/RNG delta change its fate? (19)
starvation watch on every bought seed (Joja price in lives). (20)
funeral-mend watch (r246: FIRED + voiced on 3 seeds — second
observation). (21) the 159-turn Algorithm fight (r194 89701 d107):
does it recur? (22) the fastW4 diedInFight gap (r171): watch the
corpus for a fastW4 scholar-death fight. (23) PASS D FOURTH
SIGHTING: does the second ally slot repeat r239's effect (2/6 full
seats, kills ~13) or r243/r246's level result (1/6 full, kills 6)
on the new substrate — and does any meeting party field FOUR (the
#2515 cap broken), or does the sense still cap at 2 allies? (24)
GUARD-STALL WATCH: same not-ready reason ≥30 consecutive days =
LOUD line in the run note. (25) TOTAL-DEFERRAL WATCH: announce→sit
deferral ≥30 days total = LOUD line (the r246 89701-A 29-day
deferral sits one day under the line — third observation).
NEW THIS RUN: (26) COUNTER-LABEL HOLD: any clause-head counter line
carrying a raw prose descriptor (the r246 fix failing in the wild —
FAIL LOUDLY)? (27) F6/F5 FALLBACK: any DRY line on the panel (the
r238 seed-45752 dry recurring — regression)? (28) MAPS-POOL: any
bare "..." line or maps-dry in a sitting comparing maps 3+ times
(the r147 fix failing)? (29) F8 CONFIDE: any sitting closing on the
confide line with no secret shared (the r244 gate failing —
FAIL LOUDLY)? (30) F2 TITAN COUNT: any titan refusal naming a count
that disagrees with the gate count (unique living allies +
committed Haven blades)? (31) #2593 AMMO: any volley line still
saying "no arrows" for a searcaster/crossbow/sling (the naming fix
failing)?

INTERESTING FINDING (what would count): any pass-A-live-vs-r246
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r246 had uw 4; a full seat on pass A; a full
seat on a new C-wide seed; a SECOND full seat on pass C; a village
dying before d90 on any pass (survival collapse — name the seed, the
day, the cause); a tribute delivery firing (M24 exercised for the first
time in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a deedGateFirstOk on a seed where r246 had none (M23b moves); a
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
survival in a way the r246 panel cannot explain; an F5-class dry hit
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
NEW THIS RUN: a party_launch:no-tick-exact deferral in the corpus
(second observation — count, days, vids); a trio launch carrying
companion2/3 (expected 0 with the gates off — any non-zero is a
surprise worth naming); a door-tile fight eject (door-skip failing);
a fledBad firing NAMED by the new recorder; a link-accept parrot line
recurring (the (b) fix failing); a want-bridge repeat inside one
sitting before 11 bridges (the pool widening failing); an exiled
scholar never sitting (F1 recurrence); a guard-stall (same not-ready
reason ≥30 consecutive days); a total deferral ≥30 days
(announce→sit); a clause-head counter line with a raw descriptor
(r246 fix failing); a DRY line anywhere on the panel (r238 fix
failing); a bare "..." maps line (r147 fix failing); a confide-line
close with no secret shared (r244 gate failing); a titan refusal
count disagreeing with the gate count (r243 F2 fix failing); a
"no arrows" line for a non-bow weapon (#2593 fix failing).

BINDINGS (carried from r203/r211/r219/r225/r230/r233/r237/r239/r243/
r246 verbatim; metric binding §14 — a miss is NO-GO, never re-scored
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
- M23b tally: Pass A 0/6, Pass C 1/6 (89702@d86, DELIVERED), C-wide
  0/8, Pass D 1/6 (89705@d73, DELIVERED) — r246.
- F5 + C3d stay vacuous on the endgame leg unless this panel's sittings
  reach them — the watches need a panel whose sittings reach them, not
  a metric change. The succession leg's F5 FAIL as written (r233) is
  noted but does not change the endgame watch: the endgame panel
  measures whether the Amanda fix moves the wild count.
- GUARD-STALL WATCH (r243): same not-ready reason ≥30 consecutive
  days = LOUD line. TOTAL-DEFERRAL variant (r246): announce→sit
  ≥30 days = LOUD line.
- Telemetry baseline: r188 stands for uw/won (r246 pass-A sums uw 21
  vs 22, won 5 vs 4 — quiet, NOT rolled). peakVet: RE-BASELINED by
  r246 to 3 (5-seed sum; per-seed mean 0.6) after three consecutive
  observations in the 3–4 band (r239: 4, r243: 3, r246: 3). This run
  compares Pass A 5-seed sums against uw 22 / won 4 / peakVet 3.
  NOTE: the machine-readable baseline at
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/endgame.json
  still carries peakVet 8 (pre-r246) — the r246 re-baseline lives only
  in its run note. A LOUD peakVet line from telemetry-check this run
  is adjudicated against the r246 re-baseline (3), NOT rolled back;
  the file is updated to 3 with --update-baseline only after that
  adjudication. uw/won are NOT rolled on a quiet read.
- companionGuardSkips watch (r246: A 10, C 11, C-wide 1, D 15): HOLD
  as a watch, not a binding. deathCleanups per seed (r246 pass C: 12
  total) — HOLD as a watch.
- Pass D (FIGHTALLY2): FOURTH observation tally this run — meeting
  party sizes, wave-4 kills per seed, full seats; judged against the
  Pass C numbers on the same seeds AND against r239's and r243's and
  r246's Pass D numbers, not against a frozen bar.
- NOTICK/CARRY instrument: second observation this run. The deferral
  count is a new tally (no bar); the carry count's expected value is
  0 with the gates off (wiring proof, not a verdict).
