# Journey endgame r263 — PRE-REGISTRATION (lane B, 2026-11-21 03:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run: the full cycle turned since the last leg-4 run — r259 endgame
(2026-11-20, rotation 4→5 by its adoption), r260 social life (5→6),
r261 crisis (6→7), r262 succession (7→4, landed e35894fbb). The
rotation file reads 4 because the cycle completed, not because a write
was missed. This run plays leg 4 again and writes 5, social life, at
closeout ONLY after a verified landing — a failed or partial run does
not advance the leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r262
(succession, 2026-11-21). This run is r263 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-21T08:56:14Z (run_id playtest-loop-2-20261121T0856Z).
- Main tree: `git status --short` at 08:55Z showed 11 untracked
  evidence files (dmgpin-reprereg-b, dated today) — the sibling
  Loop B lever loop mid-landing. Re-checked minutes later: CLEAN
  (commit 5a018c5da landed between the checks). Proceeded per the
  wait-and-re-check rule; the run did NOT fail on the transient dirt.
  Disk 48% (fail line 85%).
- `git pull --ff-only`: "Already up to date." HEAD contains
  origin/master (local master ahead of origin by the unshipped batch;
  ship loop owns pushes); not a stale base.
- `bash scripts/worktree-reap.sh`: ran (12/16 active, 4 LOUD
  never-auto-remove lines for sibling trees with uncommitted
  changes — not mine, not touched).
- Registration: `worktree-register.sh journey2-endgame` completed
  08:57–09:24Z (~27 min; slow full checkout — the `git reset --hard`
  wrote ~20 GB on a 4.3 GB tree under disk contention from sibling
  loops). Branch `journey2-endgame` did not exist (deleted at the
  r259 adoption release), so `-b` created it fresh at master
  5a018c5da. Heartbeat landed at registration; hbloop r263 (setsid
  nohup, every 5 min, logging to
  hidden_files/journey-endgame-r263-heartbeat.log) started 09:31Z
  after a false-start r261-named loop was killed by exact PID
  (a pkill matched my own shell once — lesson: never pkill by a
  pattern that appears in the caller's own command line).
- EVIDDIR set explicitly on EVERY pass invocation (r237 incident
  lesson).

SUBSTRATE: master 5a018c5da EXACTLY (worktree HEAD). No fix arm
pre-filed this run. A defect the panel surfaces is filed as an
F-item and fixed only under the r147 rule (planned before scored
seeds, own proof test, judged on the post-fix panel); a mid-run fix
otherwise gets its own proof + a re-run of affected passes, recorded
in the run note.
Probe: scripts/probe-endgame-r263-20261121.js (r259 probe verbatim
EXCEPT renames r259->r263, evidence dir 2026-11-21/perseed-endgame-r263,
header, substrate comment 5a018c5da, + PLAN-map entries 89850–89857
(r263 C-wide fresh band, verified fresh below) — verified by diff:
only renames, dates, comment reflows, the substrate comment, and
the new band; zero other logic change). WARPATH diagnostic carried
verbatim from r259.
Analyzer: scripts/analyze-endgame-r263-20261121.js (r259 analyzer
verbatim EXCEPT input dir, r259->r263 — verified by diff the same
way).
Clone: scripts/clone-endgame-r263.py (r259 clone script verbatim
EXCEPT r259->r263 renames, WT path, new band, header lineage; the
byte/char `robust_write` fix from the r246 adoption is carried; the
`--print-probe` / `--print-analyzer` bash-redirection fallback is the
escape hatch if the flap flickers during cloning).
Dark probe: SKIPPED — no delta since r211 touched the dark table
(r211 skipped on the same reasoning; r219/r225/r230/r233/r237/r239/
r243/r246/r249/r255/r259 skipped too).
COMPETENT_PIN=r127 support already in the tree.
NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
M2b GREEN from r182 — no re-sweep (carried as proven).

HEAD DELTAS SINCE r259 SUBSTRATE (1fcd7edba -> 5a018c5da, verified by
`git diff 1fcd7edba..HEAD -- src/js`, 1241 lines, 9 files). Classified:
LIVE (behavior changes under the default panel):
(a) DODGE-ARTICLE (crisis r261, 144049840, game.js:44729): the
    `tbMonsterTurn` DODGED branch composes via `articlePhrase` —
    unknown attack -> "dodged the attack!", learned capitalized name
    stands bare, learned lowercase name takes "the ". Closes the
    r259 F1 "dodged the the attack!" blemish (4 occurrences, lost
    seeds only). LIVE dialogue. Watch: "the the" census (expect 0 —
    hold-confirmation; r261 crisis panel already GO with 0).
(b) DOWNEDTWICE (sim-downedtwice-b, f11b30882, fieldFights.js):
    the monster's blow target indexes `_liveAllies` (never hardcoded
    slot numbers — with a third slot the live pair can be (1,3) or
    (2,3)) and the 'goes down' fall fires only on the live->0
    transition (`_hWasLive` guard), never on a re-hit at 0 HP. LIVE,
    FIGHT-ENGINE change: blows no longer land on downed allies, the
    fall line fires once. First fight-engine change since r255 — the
    Pass D eighth sighting is justified on this delta (see below).
    Watch: 'goes down' once per ally per fight; kills / refused-move
    counts vs r259 (A 11, C 8, D 14).
(c) M12-CAP (succession r262, a3fe07b25, conversation.js +
    convo-dialogue.js): the favor-requirements escalator is capped
    per-sitting per-block-reason (`_favorReqCirclesServed` latch; the
    old code reset escalations to 0 after the spend-out, so the next
    repeat re-served "I've told you three times now" — r260 Ines d27:
    three-times 3x in one sitting). LIVE dialogue. Watch: "three
    times" repeats inside one sitting (expect 0 after the first
    circles line).
(d) WARN-HEED (landing r150, a11df1fac, convo-dialogue.js): the first
    heed of a warn_you want speaks the warning itself (the details
    path marks it delivered too, so no double-delivery); the old
    generic line ("Good. I mean it — watch yourself out there.")
    answers only when every warning variant is blocked. LIVE
    dialogue. Watch: warn_you sittings naming the danger on first
    heed (r150 panel: 4/4 sittings, 0 dangers named before the fix).
(e) LINK-RAISE OPENER POOLS (scale r248, 36d694f13,
    bond-initiation.js): link-raise openers gain per-`how` pools +
    rotation (pool[0] verbatim — no existing wording changes); rumor
    and told share one pool and one rotation key. LIVE dialogue
    variety. Watch: identical-opener repeats (r247 band: 11/11
    identical before the fix).
ENV-GATED (inert under the default panel — the probe sets none of
these flags):
(f) PLANRESEED (sim-reseed-b finding #2626 + sim-reseedbeat-b
    finding #2632, win-plan.js +424, villager-brain.js +18,
    fieldFights.js sighting stamps): the commit-time dead-target
    re-seed / expiry + the launch beat ("is hunting X now — the
    fire found a new trail") + the expiry beat. The whole arm —
    stamp + commit check + beats — is gated on PLANRESEED=1
    (`planreseedOn()`); with the flag unset every call site is a
    no-op returning null/false. The reseed-b lever was HELD unmerged
    in its own note but the code is on master env-gated OFF; the
    reseedbeat/expirycount fixes LANDED (ffd2b6aa1 via the 0330Z
    flesh-out adoption) in the same gated form. The probe does NOT
    set PLANRESEED, so the panel measures the game with the arm off.
    Watch (as a negative): no "new trail" / "called off" beat lines
    on the panel — any such line would mean the gate leaked.
(g) GUNRATE (sim-gunrate-a, contests.js +56, game.js): the
    searcaster/fusion-cell prize redirect to the lead-weighted living
    villager + the 2-cell bundle + the tier-4 contest-pool weighting
    (x4). Env-gated GUNRATE=1. Inert under the default panel.
(h) CELLGATE (sim-cellgate-a, fieldFights.js): a searcaster lead
    holds fire below wave 4. Env-gated CELLGATE=1. Inert.
(i) LEND (sim-lend-a + sim-lendfix-a findings #2599/#2629, game.js
    +248): the searcaster lend at wave-4+ fight launch + the
    identity-based return (borrower's own person record, dead or
    alive). Env-gated LEND=1; `_lendSearcaster` returns null
    immediately when unset — zero draws, no behavior change. Inert.
(j) DEPMAT/ROLL35/AMMO substrate: re-landed (rollwall 63dc9fb59,
    fiberfetch 90ba06a29, evadebow 85e68ebad) then REVERTED
    (5927db0bf, 6331a09c7, 620a2fc56) — the src/js diff vs 1fcd7edba
    carries NO DEPMAT/ROLL35/AMMO hunk: net zero, verified by the
    diff itself, not by the commit messages.
(k) BOWOPEN / SPEARGATE / SENSEEXPED: still gated, unchanged.
    ALLYSLOT3: NOT in src/js on master (no hunk, grep: zero hits).
    PARTYSIZE4 / FIGHTALLY2 / WILDAVOID / FLEEREPAIR2 / FLEEREPAIR3:
    unchanged, still gated. FIGHTALLY2 on for Pass D only (eighth
    sighting, see below).
INSTRUMENTS ONLY (no src/js game change): the WARPATH diagnostic
carried verbatim (probe-side).
(l) build.js +2 / sw.js / version.json: version bumps only.
(m) scripts/worktree-heartbeat.sh: flock timeout fix (landing
    r151) — infrastructure, not game.
No table/ladder/waves/monster change besides (a)–(e). Any headline
difference on Pass A/C/C-wide is attributed first to the LIVE deltas
(a)–(e), then to the instrument recorders, then to dialogue/RNG-draw
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
r239/r243/r246/r249/r255/r259 precedent: same seeds, same probe policy,
only the game code changed) — no fresh band is needed or claimed for
the pilot.
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
corpora; the probe default still points at the r263 dir only after the
clone, and the explicit env is the belt-and-braces):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r259
  pass A. Outdir perseed-endgame-r263. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r259 pass C. Outdir perseed-endgame-r263-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89850, 89851 (wavesnw) + 89852–89857 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r263-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Pass D (STRETCH, EIGHTH SIGHTING): FIGHTALLY2=1 + CAPSTONE=1
  BUYOUT=1 BUYOUT_EARLY=1 on the matched seeds 89701–89706. Outdir
  perseed-endgame-r263-d. Judged on the same bindings as pass C
  (analyzer with ANALYZEDIR pointing at the -d dir; no --wide flag).
  r259 said no further sighting was owed absent a fight-engine
  change; the DOWNEDTWICE fix (b) IS a fight-engine change
  (fieldFights.js pick + fall guard), so this pass runs ONLY if the
  window allows after A/C/C-wide, as an eighth observation of the
  r239-vs-r243 question (uplift 2/6 full, kills 13 vs level 1/6
  full, kills 6–9; r259 D read 1/6 full, kills 14). If cut,
  recorded as CUT.
- Pass B: SKIPPED BY DESIGN — r230 pass B was vacuous NO-GO (0
  capstone attempts, 0 deliveries, 0 buyout attempts on all 5 seeds;
  deed gate ok on 0/5). The converting road is pass C, not B; re-running
  B on this substrate would only re-confirm vacuity. The interesting
  questions (does the road still convert? does wave 5 get faced? does
  the second ally slot move kills? do the (a)–(e) deltas move
  anything? does the NOTICKEXACT deferral fire? are the war-path
  names faithful?) are answered by passes A, C, C-wide, and D.
TIME-BOX: passes run sequentially; the cut order if the window closes
is D, then C-wide, then C-live. A-live is the committed core — the run
is not complete without it. PILOT FIRST (§9): the smoke + first two
pass-A seeds verify the harness on this substrate before the full panel
burns. This occurrence's window is short (Lane B occurrences have been
~2h apart); if the scheduler cuts the run mid-panel, the run note
records CUT passes and the adoption closes them out (r259 precedent).

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89850–89857
searched across ALL evidence *.md preregs, run notes, screens, and
scripts/*.js/*.py (word-boundary grep for 8985[0-7] over evidence/
--include='*.md', docs/ --include='*.md', scripts/*.js, scripts/*.py,
goal hidden_files *.md/*.json/*.txt/*.sh — ZERO seed hits in any dated
prereg, run note, screen, or forbidden/contaminated list; the only
numeric hits anywhere are pantry-kcal values (e.g. "pantry": 89854)
inside old JSON corpora — values, not seed assignments). The adjacent
band 89840–89847 was used by r259 (yesterday) and is NOT reused;
89830–89837 was used by r255 and is NOT reused. Named only here, as
the r263 C-wide band.

R259 PASS-A BASELINE (per-seed, from the r259 run note; judged on
these seeds, pass A-live):
- 89701 waves: lesser, won, uw 4, FACED wave 5 ×0, standing peak 199
  (stall), sat d94, peakVet 0, kills 1.
- 89702 waves: lesser, won, uw 5, FACED wave 5 ×3, standing peak 536,
  deedGateFirstOk d70 (no capstone — binding unanswered on A),
  peakVet 4, kills 7, sat d90 lesser.
- 89703 waves: lesser, won, uw 5, FACED wave 5 ×0, standing peak 199
  (stall), sat d101, peakVet 0, kills 0.
- 89704 forcedrift: lesser, won, uw 5, FACED wave 5 ×0, standing peak
  199 (stall), sat d90, peakVet 0, kills 0.
- 89705 wavesnw: lesser, won, uw 5, FACED wave 5 ×1, sat d90,
  peakVet 2, kills 3.
- 89706 wavesnw (smoke): lesser win d92, peakVet 1 (r255; r259 smoke
  not separately reported — carried).
Tally r259 pass A: lesser 5/5, full 0/5, village-lost 0/5, won 5/5.
M23b 1/5 (89702@d70, no capstone). Kills 11. peakVet sum 6.
Pass C: lesser 4/5, full 0/5, lost 1/5 (89702 scattered d54),
won 4/5, M23b 0/5 (VACUOUS — deed gate never ok); M25c 5/5 bought
early. Kills 8. Bought-seed losses 1/5.
C-wide (89840–89847): lesser 7/8, full 0/8, lost 1/8 (89845),
never-sat 0/8; M25c 8/8 bought; M23b 0/8. Kills 9. Bought-seed
losses 1/8. Combined bought-seed losses r259: 2/13.
Pass D (FIGHTALLY2, seventh sighting): lesser 5/6, full 1/6 (89705
FULL d84, deedGateFirstOk d83 DELIVERED), won 6/6, M23b 1/6, kills 14
(C 8, A 11), wave-5 faced on D 89705 ×2.

R263 QUESTIONS: (1) pass A-live: does the pilot reproduce r259 modulo
the named deltas (a)–(e) — in particular, does the DOWNEDTWICE fix
(b) move wave-4 kills, refused moves, or veteran banking on the
matched band, and does 89702 still reach the deed gate on pass A?
(2) WARPATH: does the dump show the engagement names are the settled
village names of faced monsters (decision rule carried from r259) —
and do the new transcripts' war-path lines match the dump exactly?
Second confirmation of FAITHFUL on the fresh band. (3) TABLESITTING:
does any muster or march hold/fire differently in a mercy window
(capstone delivered, finale unresolved) — the distinction (a) from
r243 exists to be observed; a mercy-window muster that fires (or
holds) is a named observation either way. (4) NOTICKEXACT: does a
party_launch:no-tick-exact deferral fire in the wild on this panel
(the new instrument counts it — day, vid, pick), and do wave-4
launches shift on the matched band? (r246/r249/r255/r259: 0 on all
passes — fifth observation.) (5) TRIODROUGHT: does the carry
instrument read 0 as expected (gates off), with the field present on
every per-seed JSON? (r246/r249/r255/r259: 0 — fifth observation.)
(6) DOOR-SKIP: any door-tile fight eject on any pass — and does the
r149 policy change show up as fewer refused moves vs r259? (7)
FLEDBAD: does the new recorder name any legacy-outmatched firing
(day + monster HP)? (8) POCKET: any pocket monster left unreachable?
(9) M23b: on pass C, does the deed gate go ok and does the buyout
road convert again (r259: 0/5 matched, 0/8 fresh — repeat, rotate to
another seed, or revert)? (10) does a SECOND buyout seed convert
this round? (11) C-wide fresh band: does ANY seed face wave 5
(w5max>0) or take a full seat — or does the r259 finding hold (0/8
full, 0 deed-gate OK)? (12) F1 #2519 RECURRENCE: does any seed never
sit (exiled scholar, guard stall)? (13) F5: does the settled-favor
branch fire in the wild on THIS panel (r259 endgame: vacuous 0 hits;
succession r233: F5 FAIL as written — the endgame watch is whether
the Amanda fix moves the wild count at all)? (14) C3d: does the
recap-live-want fix hold in the wild — a recap naming the live want
instead of the empty pool (r259: vacuous, no recap sittings on the
endgame panel; the watch stays open for a panel with recap sittings)?
(15) ECHO: does the link-accept voice end the parrot — any accepted
raise talk still serving '"All right — let's ask them."'
(regression — FAIL LOUDLY)? (16) WANT-BRIDGE: does the 6→10 pool end
the seventh-deflect repeat (r146's HEED-V=1 case) in the wild? (17)
COMPANIONGUARD: do launches still form pairs/trios under the guard +
plan-death — count guard skips (companionGuardSkips) and watch for a
plan record listing a companion who never left (the mirror gap the
guard claims closed; r259: A/C/C-wide/D counts in its run note)?
(18) DEATHCLEANUP: how many win-plan deaths fire per seed
(deathCleanups sample) — and does any plan die with its holder
mid-launch in a way that strands a launch? (r259 pass C: 12 total, 0
removal cleanups, no stranded launch — check r259's tally in its
note.) (19) does 89705 lose its village again (r230: lost d59;
r233/r237/r239/r243/r246/r249/r255/r259: survived), or does the
dialogue/RNG delta change its fate? (20) starvation watch on every
bought seed (Joja price in lives) — NOW BINDING as M25d (see below).
(21) funeral-mend watch (r259: FIRED + voiced — count in its note).
(22) the 159-turn Algorithm fight (r194 89701 d107): does it recur?
(23) the fastW4 diedInFight gap (r171): watch the corpus for a
fastW4 scholar-death fight. (24) PASS D EIGHTH SIGHTING: does the
second ally slot repeat r239's effect (2/6 full seats, kills ~13)
or r243/r246/r249/r255/r259's level result (1/6 full, kills 6–14)
on the new substrate — and does any meeting party field FOUR (the
#2515 cap broken), or does the sense still cap at 2 allies? Does
the DOWNEDTWICE fix move D kills vs r259 D (14)? (25) GUARD-STALL
WATCH: same not-ready reason ≥30 consecutive days = LOUD line in
the run note. (26) TOTAL-DEFERRAL WATCH: announce→sit deferral
≥30 days total = LOUD line (the r246 89701-A 29-day deferral sits
one day under the line — sixth observation).
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
failing in the wild — FAIL LOUDLY)? (34) DOUBLE-"THE" HOLD: any
"The The" scream / outing / thrash line (the r249/r253 fixes
failing — FAIL LOUDLY)? (35) DODGE-ARTICLE HOLD: any "dodged the
the attack!" line (the r261 fix failing in the wild — FAIL LOUDLY;
r261 crisis panel already GO with 0). (36) M12-CAP: any "I've told
you three times now" (or equivalent favor-requirements escalation)
served more than once per block reason per sitting (the r262 fix
failing — FAIL LOUDLY)? (37) WARN-HEED: any warn_you sitting whose
first heed does NOT name the danger (the r150 fix failing)? (38)
LINK-RAISE VARIETY: any `how` whose raise openers repeat identically
11/11 (the r248 pool failing)? (39) DOWNEDTWICE PANEL WATCH: any
'goes down' line firing twice for the same ally in one fight, or
any blow line landing on an already-downed ally (the r263 fix
failing in the wild — FAIL LOUDLY)? (40) PLANRESEED GATE-LEAK: any
"new trail" / "called off" reseed/expiry beat line on the panel
(the PLANRESEED gate leaking under the default panel — FAIL
LOUDLY)? (41) M25d BUYOUT-STARVATION BAR: bought-seed losses ≤1 of
13 (C 5 + C-wide 8) — see BINDINGS.

INTERESTING FINDING (what would count): any pass-A-live-vs-r259
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r259 had uw 4; a full seat on pass A; a full
seat on a new C-wide seed; a SECOND full seat on pass C; a village
dying before d90 on any pass (survival collapse — name the seed, the
day, the cause); a tribute delivery firing (M24 exercised for the first
time in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a deedGateFirstOk on a seed where r259 had none (M23b moves); a
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
survival in a way the r259 panel cannot explain; an F5-class dry hit
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
policy fix failing); a "dodged the the attack!" line (r261 fix
failing); a "three times" favor-requirements escalation served twice
for one block reason in one sitting (r262 fix failing); a warn_you
first heed naming no danger (r150 fix failing); a link-raise opener
repeating identically 11/11 for one `how` (r248 pool failing); a
'goes down' line twice for one ally in one fight, or a blow on a
downed ally (downedtwice fix failing); a "new trail" / "called off"
beat line (PLANRESEED gate leaking); a bought-seed loss rate above
the M25d bar (2+ of 13 lost).

BINDINGS (carried from r203/r211/r219/r225/r230/r233/r237/r239/r243/
r246/r249/r255/r259 verbatim; metric binding §14 — a miss is NO-GO,
never re-scored mid-run; PRIMARY-BINDINGS is the headline, per r135's
metric review; full text in evidence/2026-11-14/journey-endgame-r203-prereg.md,
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
NEW THIS RUN — M25d BUYOUT-STARVATION (binding, per r259 metric
review 4): bought seeds lost (village-lost, any cause) ≤1 of 13
(C 5 + C-wide 8). r259 read 2/13 (89702 C d54, 89845 C-wide d79) —
the fifth and sixth reproductions of the buyout-starvation pattern
would have FAILED this bar. A miss is NO-GO on the buyout road
(M25d), recorded LOUD in the run note; it does not fail Pass A
(which never buys). If C-wide is CUT, the bar re-bases to the seeds
actually bought (≤1 lost of the bought count, minimum 5 bought
seeds for the bar to bind — below 5 it is a watch, not a verdict).

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M23b tally: Pass A 1/5 (89702@d70, no capstone), Pass C 0/5
  (VACUOUS), C-wide 0/8, Pass D 1/6 (89705@d83, DELIVERED) — r259.
- peakVet adjudication (r259 metric review 3, carried): baseline
  peakVet 12 is provisional (r255 roll on ONE observation). r259
  Pass A read 6: neither confirms 12 nor returns to the 3–4 band.
  THIS RUN IS THE ADJUDICATION: if r263 Pass A 5-seed peakVet sum
  reads 3–4, the file REVERTS to 3; if it reads 10–12, the roll
  CONFIRMS at 12; if it reads ~6 (5–7), the file ROLLS to 6 as the
  band center (two straight ~6 reads: r259 6, r263 ~6). uw/won are
  NOT rolled on a quiet read.
- F5 + C3d stay vacuous on the endgame leg unless this panel's
  sittings reach them — the watches need a panel whose sittings reach
  them, not a metric change. The succession leg's F5 FAIL as written
  (r233) is noted but does not change the endgame watch: the endgame
  panel measures whether the Amanda fix moves the wild count.
- GUARD-STALL WATCH (r243): same not-ready reason ≥30 consecutive
  days = LOUD line. TOTAL-DEFERRAL variant (r246): announce→sit
  ≥30 days = LOUD line.
- Telemetry baseline: uw 22 / won 4 / peakVet 12 (file rolled by
  r255: peakVet 3→12 on ONE observation; r259 read 6 — see
  adjudication above).
- companionGuardSkips watch (r259: read its run note for the
  per-pass counts): HOLD as a watch, not a binding. deathCleanups
  per seed (r259 pass C: read its run note) — HOLD as a watch.
- Pass D (FIGHTALLY2): EIGHTH observation tally this run — meeting
  party sizes, wave-4 kills per seed, full seats; judged against the
  Pass C numbers on the same seeds AND against r239's, r243's,
  r246's, r249's, r255's and r259's Pass D numbers, not against a
  frozen bar. The DOWNEDTWICE fix (b) is the first fight-engine
  change since r255 — any D kills movement is attributed to it
  first.
- NOTICK/CARRY instrument: fifth observation this run. The deferral
  count is a new tally (no bar); the carry count's expected value is
  0 with the gates off (wiring proof, not a verdict).
- WARPATH instrument: SECOND observation this run (r259: FAITHFUL,
  0 mismatches). The dump is a wiring proof (names match mids), not
  a verdict; the decision rule from r259 is frozen and carried.
- M25d: FIRST binding observation this run (bar ≤1/13 bought-seed
  losses). r259 would have failed it (2/13).
