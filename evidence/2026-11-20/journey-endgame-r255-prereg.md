# Journey endgame r255 — PRE-REGISTRATION (lane B, 2026-11-20 02:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run: the full cycle turned since the last leg-4 run — r249 endgame
(2026-11-19, rotation 4→5 by its adoption), r250+ social/crisis/
succession legs ran in between, and the succession r254 adoption wrote
rotation-b 7→4 at 07:03Z today (2026-11-20). The 01:00 CST Lane B
occurrence stood down at the overlap guard (previous succession run
genuinely alive). The rotation file reads 4 because the cycle completed,
not because a write was missed. This run plays leg 4 again and writes 5,
social life, at closeout ONLY after a verified landing — a failed or
partial run does not advance the leg, per r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r254
(succession, 2026-11-20). This run is r255 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-20T07:56:07Z (run_id playtest-loop-2-20261120T0200Z-leg4).
- Main tree: `git status --short` 6 untracked evidence files at 07:55Z
  (sibling sim-0515-adopt-a check.js spillover, evidence/2026-11-19/
  check-quick-round-0515.* + telemetry-round-0515-*); per the body, waited
  10 min and re-checked — 0 lines at ~08:06Z, the sibling adoption had
  finished and cleaned up. Disk 50% (fail line 85%).
- `git fetch origin` succeeds; HEAD is 10 ahead of origin/master
  (59711ccc5, batch ship 2026-11-20 05:24Z); `git pull --ff-only` cannot
  fast-forward a tree that is ahead — expected in this workflow (ship loop
  owns pushes); not a stale base. HEAD contains origin/master.
- `bash scripts/worktree-reap.sh`: exit 0, nothing removed; 10 LOUD
  dirty trees (all other owners', never auto-removed); active 10/16.
- Registration: `worktree-register.sh journey2-endgame` completed
  08:07–08:16Z (~9 min; slow full checkout). Branch `journey2-endgame`
  did not exist (deleted at the r249 adoption release), so `-b` created
  it fresh at master 59711ccc5. Heartbeat landed at registration;
  hbloop (pid 37973, setsid nohup) started, every 5 min, logging to
  hidden_files/journey-endgame-r255-heartbeat.log.
- EVIDDIR set explicitly on EVERY pass invocation (r237 incident
  lesson). No overwrite: all pass corpora verified intact and distinct
  at closeout.

SUBSTRATE: master 59711ccc5 EXACTLY (worktree HEAD). No fix arm
pre-filed this run. A defect the panel surfaces is filed as an F-item
and fixed only under the r147 rule (planned before scored seeds, own
proof test, judged on the post-fix panel); a mid-run fix otherwise
gets its own proof + a re-run of affected passes, recorded in the run
note.
Probe: scripts/probe-endgame-r255-20261120.js (r249 probe verbatim
EXCEPT renames r249->r255, evidence dir 2026-11-20/perseed-endgame-r255,
header, substrate comment 59711ccc5, + PLAN-map entries 89830–89837
(r255 C-wide fresh band, verified fresh below), NOTICK/CARRY
instrument carried verbatim — verified by diff: only renames, dates,
comment reflows, the substrate comment, the new band; zero other
logic change).
Analyzer: scripts/analyze-endgame-r255-20261120.js (r249 analyzer
verbatim EXCEPT input dir, r249->r255, + the instrument tallies —
verified by diff the same way).
Clone: scripts/clone-endgame-r255.py (r249 clone script verbatim
EXCEPT r249->r255 renames, WT path, new band; the byte/char
`robust_write` fix from the r246 adoption is carried; the
`--print-probe` / `--print-analyzer` bash-redirection fallback is the
escape hatch if the flap flickers during cloning).
Dark probe: SKIPPED — no delta since r211 touched the dark table
(r211 skipped on the same reasoning; r219/r225/r230/r233/r237/r239/
r243/r246/r249 skipped too).
COMPETENT_PIN=r127 support already in the tree.
NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
M2b GREEN from r182 — no re-sweep (carried as proven).

INSTRUMENT (carried from r249/r246, probe-side, zero src/js): per-seed JSON
gains `noTickDeferrals` and `trioCarry`, collected by a DAILY
`Game.vbrainLogs()` scan inside the probe's onDaily hook (rolling
400-entry buffer — the scan runs daily, counts only entries with
`e.day === dayOf(G)`; read-only, no RNG consumed). Observations r246/r249:
deferrals 0 and trioCarry 0 on ALL passes — the instrument records clean
zeros; the (a)/(b) gates stayed off as expected.
EXPECTATION this run: same — 0/0 on every pass with the gates off;
any non-zero is a surprise worth naming.

HEAD DELTAS SINCE r249 SUBSTRATE (1927a245e -> 59711ccc5, verified by
git log + git diff; net src/js diff 8 files, +276/-13; policy file
scripts/policies/competent.js +78). Classified:
LIVE (behavior changes under the default panel):
(a) BOWCRAFT TURN-ON (villager-build.js, d56fbe819, 2026-11-19; gate
    REMOVED — duty always on in live play; pilot BUILD-GO + confirm GO
    on two fresh bands; proof 59/59 + 58/58; finding #2597 FIXED):
    a villager with NO volley-capable ranged weapon is served even
    when armed (a spear in the ranged slot is not a ranged weapon);
    armed villagers craft BOW rungs only, never a second spear; bow
    knowledge seeds from SEEING a ladder weapon EQUIPPED by another
    villager at home. THE headline live delta — the first endgame
    panel on the turned-on duty. Watch: volley counts / bow crafting
    in transcripts, wave-4 kills, w4plusKills vs r249 (A 10, C 9),
    any village arming up faster than r249. The r254 adoption notes
    BOWCRAFT turn-on as the unproven suspect for the 34362 trajectory
    drift — this panel is the first endgame observation of it.
(b) R249 DOUBLE-"THE" FIX (game.js + favor-outing.js, 26772ac93):
    villager scream singular branch + waiting-outing dawn note.
    Proven RNG-neutral (wild re-runs byte-identical JSONs). Watch:
    no "The The" scream / outing lines anywhere on the panel
    (regression — FAIL LOUDLY).
(c) R244 COUNTER-LABEL COMMA-CLAUSE FIX (game.js, 9fb55be89):
    monsterCounterLabel uses the guarded noun when the display name
    carries a comma (38/72 defs; r244 panel fired belltoad/dustboar/
    rut_king). Watch: counter-learned render sites in transcripts —
    no clause-head counter line may carry a raw comma-clause
    descriptor.
(d) R253 ANTLER-THRASH "THE THE" FIX (game.js, eb12c1471): the
    thrash line composes via articlePhrase (village-named proper
    names carry their own article — "The The Bright Bastard" on
    seed 14563). Watch: thrash lines in fight transcripts.
(e) R253 MARCH-REFUSAL ONCE-PER-DAY (finale-campaign.js,
    eb12c1471): the Herald titan march gate says its refusal once
    per titan per day (spoken line deduped; refusal still stands on
    every attempt). Watch: march-refusal lines — a refusal repeated
    10x on one day is the regression case (r253: 14562 d103).
(f) R245 GROWTH-LINE COOLED CALL (titans.js, e086cffcb): the dawn
    line may have promised allied blades the morning has since eaten
    (r244 105024 d86: promised 2, call brought 0) — soundTitanCall
    re-validates BEFORE sounding: if the promised blades are gone,
    the call says so honestly ("The fires have cooled since dawn")
    instead of sounding an empty ritual; the dawn line now reports
    dawn state ("at dawn, … would send … — enough, if the morning
    holds"). Watch: cooled-call lines in transcripts; titan musters
    that hold/fire differently in a mercy window.
(g) R254 MULTI-NAME WITNESS MOURNING VARIANT (convoTopics.js,
    aea63f6b5): when the speaker witnessed the MOST-RECENT fresh
    dead, witness lines join the multi-name mourning pool ("I was
    there when {mname} fell…"). Watch: mourning sittings — witness
    lines naming the right dead.
(h) R148 LINK-ACCEPT ROTATION (bond-initiation.js, cf17e4dd6):
    rotation by pool index among unledgered accept lines (the ledger
    is a 48-entry window; first-unledgered always returned pool[0]).
    Watch: link-accept lines — a verbatim repeat across different
    villagers days apart is the regression case.
(i) R148 MODERATOR-MUTE GUARD (scripts/policies/competent.js,
    cf17e4dd6 — POLICY, not game code): the bot reads the live
    moderator mute (announced + grid-visible) and uses the other
    verb instead of re-issuing the muted verb (old policy: 1271 d25,
    two MOVE violations, 0 strikes while allies killed a 245-HP
    moderator). Fires ONLY inside a moderator suppression field.
    Watch: moderator fights on the panel — outcomes may shift vs
    r249 where the old policy wasted turns.
ENV-GATED (inert under the default panel):
(j) BOWKNOW (villager-build.js, eaf530d6a): bow-knower mentoring,
    behind BOWKNOW=1. OFF on all r255 passes. The sim-bowknow-a
    verdict was NO-GO (SERVED 0).
(k) SEARSUPPLY: REVERTED entirely (0 hits in src/js; 0fd416c5d
    NO-GO SUPPLY). Nothing live from this arm.
(l) BOWOPEN / SPEARGATE staging: still gated, unchanged. SENSEEXPED:
    still gated. ALLYSLOT3: NOT in src/js on master (grep: zero
    hits). PARTYSIZE4 / FIGHTALLY2 / WILDAVOID / FLEEREPAIR2 /
    FLEEREPAIR3: unchanged, still gated. FIGHTALLY2 on for Pass D
    only (fifth sighting, see below).
INSTRUMENTS ONLY (no src/js game change): none new.
(m) build.js +2 / sw.js / version.json: version bumps only.
No table/ladder/waves/monster change besides (a)–(i). Any headline
difference on Pass A/C/C-wide is attributed first to the LIVE deltas
(a)–(i), then to the instrument recorders, then to dialogue/RNG-draw
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
r239/r243/r246/r249 precedent: same seeds, same probe policy, only the
game code changed) — no fresh band is needed or claimed for the pilot.
SMOKE (harness + timing check, not a binding panel seed): 89706
(wavesnw), pass-A policy, full horizon. Records probe wall time per
seed on this box; if the smoke fails to boot, FAIL LOUDLY and stop.
The smoke ALSO validates the instrument (noTickDeferrals +
trioCarry fields present on the per-seed JSON, even if empty).
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled; EVIDDIR SET EXPLICITLY ON EVERY INVOCATION
— r237 incident: a pass launched without EVIDDIR overwrote Pass A's
corpora; the probe default still points at the r255 dir only after the
clone, and the explicit env is the belt-and-braces):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r249
  pass A. Outdir perseed-endgame-r255. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r249 pass C. Outdir perseed-endgame-r255-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89830, 89831 (wavesnw) + 89832–89837 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r255-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Pass D (STRETCH, FIFTH SIGHTING): FIGHTALLY2=1 + CAPSTONE=1
  BUYOUT=1 BUYOUT_EARLY=1 on the matched seeds 89701–89706. Outdir
  perseed-endgame-r255-d. Judged on the same bindings as pass C
  (analyzer with ANALYZEDIR pointing at the -d dir; no --wide flag).
  r249 said no further sighting was owed absent a fight-engine
  change; no fight-engine change landed since (ALLYSLOT3 is not in
  src/js; SENSEEXPED/BOWOPEN/SPEARGATE stay gated off) — but
  BOWCRAFT (a) IS a fight-adjacent live change (arming), so this
  pass runs ONLY if the window allows after A/C/C-wide, as a fifth
  observation of the r239-vs-r243 question (uplift 2/6 full,
  kills 13 vs level 1/6 full, kills 6). If cut, recorded as CUT.
- Pass B: SKIPPED BY DESIGN — r230 pass B was vacuous NO-GO (0
  capstone attempts, 0 deliveries, 0 buyout attempts on all 5 seeds;
  deed gate ok on 0/5). The converting road is pass C, not B; re-running
  B on this substrate would only re-confirm vacuity. The interesting
  questions (does the road still convert? does wave 5 get faced? does
  the second ally slot move kills? do the (a)–(i) deltas move
  anything? does the NOTICKEXACT deferral fire?) are answered by
  passes A, C, C-wide, and D.
TIME-BOX: passes run sequentially; the cut order if the window closes
is D, then C-wide, then C-live. A-live is the committed core — the run
is not complete without it. PILOT FIRST (§9): the smoke + first two
pass-A seeds verify the harness on this substrate before the full panel
burns.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89830–89837
searched across ALL evidence *.md preregs, run notes, screens, and
scripts/*.js/*.py (word-boundary grep for 8983[0-7] over evidence/
--include='*.md', docs/ --include='*.md', scripts/*.js, scripts/*.py —
ZERO hits in any dated prereg, run note, screen, or forbidden/
contaminated list). The adjacent band 89820–89827 was used by r249
(yesterday) and is NOT reused; 89810–89817 was used by r246 and is NOT
reused. Named only here, as the r255 C-wide band.

R249 PASS-A BASELINE (per-seed, from the r249 run note; judged on
these seeds, pass A-live):
- 89701 waves: lesser, won, uw 4, FACED wave 5 ×0, standing peak 199,
  sat d90, peakVet 1, kills 2.
- 89702 waves: lesser, won, uw 5, FACED wave 5 ×0, standing peak 462,
  deedGate NEVER ok, peakVet 2, kills 5, sat d90 lesser.
- 89703 waves: lesser, won, uw 4, peak 199, sat d107, peakVet 0,
  kills 2.
- 89704 forcedrift: lesser, won, uw 4, peak 120, sat d105, peakVet 0,
  vetFights 0.
- 89705 wavesnw: lesser, won, uw 4, sat d104, peak 199, survives,
  peakVet 1.
- 89706 wavesnw (smoke): lesser win d98 (r246: village-lost d69).
Tally r249 pass A: lesser 5/5, full 0/5, village-lost 0/5, won 5/5.
M23b 0/5. Kills 10.
Pass C: lesser 4/5, full 1/5 (89702 FULL d101, deedGateFirstOk d86),
lost 0/5, won 5/5, M23b 1/5 (89702@d86, DELIVERED); M25c 5/5 bought
early. Kills 9.
C-wide (89820–89827): lesser 6/8, full 0/8, lost 2/8 (89821, 89826),
never-sat 0/8; M25c 8/8 bought; M23b 0/8. Kills 7.
Pass D (FIGHTALLY2): lesser 5/6, full 1/6 (89705 FULL d74), won 6/6,
M23b 1/6, kills 9 (C 9, A 10), wave-5 faced 2/6 seeds.

R255 QUESTIONS: (1) pass A-live: does the pilot reproduce r249 modulo
the named deltas (a)–(i) — in particular, does BOWCRAFT move wave-4
kills, volleys, or veteran banking on the matched band, and does
89702 still take the full seat on pass C at d101 (fourth straight
reproduction)? (2) TABLESITTING: does any muster or march hold/fire
differently in a mercy window (capstone delivered, finale
unresolved) — the distinction (a) from r243 exists to be observed; a
mercy-window muster that fires (or holds) is a named observation
either way. (3) NOTICKEXACT: does a party_launch:no-tick-exact
deferral fire in the wild on this panel (the new instrument counts it
— day, vid, pick), and do wave-4 launches shift on the matched band?
(r246/r249: 0 on all passes — third observation.) (4) TRIODROUGHT:
does the carry instrument read 0 as expected (gates off), with the
field present on every per-seed JSON? (r246/r249: 0 — third
observation.) (5) DOOR-SKIP: any door-tile fight eject on any pass —
and does the r146 policy change show up as fewer accidental flees vs
r243? (6) FLEDBAD: does the new recorder name any legacy-outmatched
firing (day + monster HP)? (7) POCKET: any pocket monster left
unreachable? (8) M23b: on pass C, does the deed gate go ok and does
the buyout road convert again (r249: 1/5 matched, 0/8 fresh — repeat,
rotate to another seed, or revert)? (9) does a SECOND buyout seed
convert this round? (10) C-wide fresh band: does ANY seed face wave 5
(w5max>0) or take a full seat — or does the r249 finding hold (0/8
full, 0 deed-gate OK)? (11) F1 #2519 RECURRENCE: does any seed never
sit (exiled scholar, guard stall)? (12) F5: does the settled-favor
branch fire in the wild on THIS panel (r249 endgame: vacuous 0 hits;
succession r233: F5 FAIL as written — the endgame watch is whether
the Amanda fix moves the wild count at all)? (13) C3d: does the
recap-live-want fix hold in the wild — a recap naming the live want
instead of the empty pool (r249: vacuous, no recap sittings on the
endgame panel; the watch stays open for a panel with recap
sittings)? (14) ECHO: does the link-accept voice (b) end the parrot
— any accepted raise talk still serving '"All right — let's
ask them."' (regression — FAIL LOUDLY)? (15) WANT-BRIDGE: does the
6→10 pool end the seventh-deflect repeat (r146's HEED-V=1 case) in
the wild? (16) COMPANIONGUARD: do launches still form pairs/trios
under the guard + plan-death — count guard skips
(companionGuardSkips) and watch for a plan record listing a companion
who never left (the mirror gap the guard claims closed; r249: A 10,
C 11, C-wide 1, D 15)? (17) DEATHCLEANUP: how many win-plan deaths
fire per seed (deathCleanups sample) — and does any plan die with its
holder mid-launch in a way that strands a launch? (r249 pass C: 12
total, 0 removal cleanups, no stranded launch.) (18) does 89705 lose
its village again (r230: lost d59; r233/r237/r239/r243/r246/r249:
survived), or does the dialogue/RNG delta change its fate? (19)
starvation watch on every bought seed (Joja price in lives). (20)
funeral-mend watch (r249: FIRED + voiced on 89703 Pass A — fourth
observation). (21) the 159-turn Algorithm fight (r194 89701 d107):
does it recur? (22) the fastW4 diedInFight gap (r171): watch the
corpus for a fastW4 scholar-death fight. (23) PASS D FIFTH
SIGHTING: does the second ally slot repeat r239's effect (2/6 full
seats, kills ~13) or r243/r246/r249's level result (1/6 full, kills
6–9) on the new substrate — and does any meeting party field FOUR
(the #2515 cap broken), or does the sense still cap at 2 allies?
(24) GUARD-STALL WATCH: same not-ready reason ≥30 consecutive days =
LOUD line in the run note. (25) TOTAL-DEFERRAL WATCH: announce→sit
deferral ≥30 days total = LOUD line (the r246 89701-A 29-day
deferral sits one day under the line — fourth observation).
NEW THIS RUN: (26) BOWCRAFT WATCH: any bow crafted by a ranged-less
villager on the panel (count crafts / bow knowledge seeded from
seeing); does any seed's volley count or w4plusKills move vs r249
beyond RNG-draw noise? (27) COOLED-CALL WATCH: any "fires have
cooled" line in a transcript — and does a cooled call ever precede a
muster that then stands short? (28) MARCH-REFUSAL DEDUP: any
march-refusal line repeated on the same day for the same titan
(the r253 fix failing — FAIL LOUDLY)? (29) WITNESS-MOURNING: any
multi-name mourning sitting serving a witness line naming the WRONG
dead (the r254 gate failing — FAIL LOUDLY)? (30) LINK-ACCEPT
ROTATION: any verbatim accept repeat across different villagers days
apart (the r148 fix failing)? (31) MODERATOR-MUTE: any moderator
fight where the bot still re-issues the muted verb (the (i) guard
failing — check modMuteWaits/modMuteStepsOut counters in the JSON)?
(32) COUNTER-LABEL HOLD: any clause-head counter line carrying a raw
comma-clause descriptor (the r244 fix failing in the wild — FAIL
LOUDLY)? (33) ANTLER-THRASH HOLD: any "The The" thrash line (the
r253 fix failing — FAIL LOUDLY)? (34) DOUBLE-"THE" HOLD: any "The
The" scream / outing line (the r249 fix failing — FAIL LOUDLY).

INTERESTING FINDING (what would count): any pass-A-live-vs-r249
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r249 had uw 4; a full seat on pass A; a full
seat on a new C-wide seed; a SECOND full seat on pass C; a village
dying before d90 on any pass (survival collapse — name the seed, the
day, the cause); a tribute delivery firing (M24 exercised for the first
time in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a deedGateFirstOk on a seed where r249 had none (M23b moves); a
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
survival in a way the r249 panel cannot explain; an F5-class dry hit
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
NEW THIS RUN: a bow craft or bow-knowledge-seeing event on the panel
(BOWCRAFT live — count, seeds); a cooled-call line ("fires have
cooled") in any transcript; a march refusal repeated same-day
(the r253 dedup failing); a witness-mourning line naming the wrong
dead (the r254 gate failing); a verbatim link-accept repeat across
villagers (the r148 rotation failing); a moderator fight where the
bot re-issues the muted verb (the (i) guard failing); a clause-head
counter line with a raw comma-clause descriptor (the r244 fix
failing); a "The The" thrash line (the r253 fix failing); a "The
The" scream / outing line (the r249 fix failing).

BINDINGS (carried from r203/r211/r219/r225/r230/r233/r237/r239/r243/
r246/r249 verbatim; metric binding §14 — a miss is NO-GO, never re-scored
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
- M23b tally: Pass A 0/5, Pass C 1/5 (89702@d86, DELIVERED), C-wide
  0/8, Pass D 1/6 (89705@d73, DELIVERED) — r249.
- F5 + C3d stay vacuous on the endgame leg unless this panel's sittings
  reach them — the watches need a panel whose sittings reach them, not
  a metric change. The succession leg's F5 FAIL as written (r233) is
  noted but does not change the endgame watch: the endgame panel
  measures whether the Amanda fix moves the wild count.
- GUARD-STALL WATCH (r243): same not-ready reason ≥30 consecutive
  days = LOUD line. TOTAL-DEFERRAL variant (r246): announce→sit
  ≥30 days = LOUD line.
- Telemetry baseline: uw 22 / won 4 / peakVet 3 (file updated by
  r249: peakVet 8→3; uw/won untouched). This run compares Pass A
  5-seed sums against uw 22 / won 4 / peakVet 3. NOTE: the
  machine-readable baseline at
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/endgame.json
  now carries peakVet 3 (r249 adjudication). A LOUD peakVet line from
  telemetry-check this run is adjudicated against the r249 re-baseline
  (3), NOT rolled back; the file is updated only after that
  adjudication. uw/won are NOT rolled on a quiet read.
- companionGuardSkips watch (r249: A 10, C 11, C-wide 1, D 15): HOLD
  as a watch, not a binding. deathCleanups per seed (r249 pass C: 12
  total) — HOLD as a watch.
- Pass D (FIGHTALLY2): FIFTH observation tally this run — meeting
  party sizes, wave-4 kills per seed, full seats; judged against the
  Pass C numbers on the same seeds AND against r239's, r243's, r246's
  and r249's Pass D numbers, not against a frozen bar.
- NOTICK/CARRY instrument: third observation this run. The deferral
  count is a new tally (no bar); the carry count's expected value is
  0 with the gates off (wiring proof, not a verdict).
- BOWCRAFT watch: NEW this run — bow crafts / seeing-seeds / volley
  counts are a tally, not a bar; the question is whether the turned-on
  duty moves kills on the matched band beyond RNG-draw noise.
