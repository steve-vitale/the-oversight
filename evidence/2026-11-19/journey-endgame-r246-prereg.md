# Journey endgame r246 — PRE-REGISTRATION (lane B, 2026-11-19 00:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run, not a stale-rotation repeat: the full cycle turned since the
last leg-4 run — r243 endgame (2026-11-18, rotation 4→5 by its adoption
with read-back), r237 social life (5→6 by its adoption closeout),
r244 crisis (read 6, wrote 7 at closeout with read-back), r245
succession (7→4 written and verified). The rotation file reads 4
because the cycle completed, not because a write was missed. This run
plays leg 4 again and writes 5, social life, at closeout ONLY after a
verified landing — a failed or partial run does not advance the leg, per
r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r245
(succession, 2026-11-18). This run is r246 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-19T05:56:00Z (run_id 2026-11-19T05:56:00Z-laneB-endgame-r246,
  line 2 2026-11-19T05:56:22Z). Deleted at closeout.
- Main tree: `git status --short` 0 lines, disk 43% (fail line 85%).
- `git pull`: the pull's ORIG_HEAD write failed twice (05:56Z,
  05:57Z) — the host write flap was active (see below); `git fetch
  origin` succeeded and HEAD == origin/master at b76d65445, so the
  tree is current and no divergence exists. The pull failure is a
  flap artifact, not a stale base.
- WRITE FLAP (infrastructure): a host write-denial episode ran
  ~05:56–06:10Z (14 min). It blocked the pull (ORIG_HEAD.lock),
  both worktree-reap.sh runs (REGISTRY.json atomic write,
  PermissionError), the first worktree-register.sh attempt
  (refs/heads/journey2-endgame.lock), and every update-ref probe
  until 06:10Z, when the probe passed. REGISTRY.json itself stayed
  parseable throughout (58 trees). Reaper ran at run start but
  removed nothing (its registry write failed); 11 trees active;
  LOUD-dirty trees from other owners (journey-scale-attr,
  sim-secondlink-a, sim-redactor-a, sim-saycap-a, sim-siegedialog-a,
  sim-inffight-ab, sim-fleerepair2-b) never auto-removed, not mine to
  touch. No cleanup this run.
- Registration: `worktree-register.sh journey2-endgame` completed
  06:10–06:19Z (~8.5 min; slow full checkout + flap tail).
  Branch journey2-endgame did not exist (deleted at the r243
  adoption release), so `-b` created it fresh at master. Heartbeat
  landed at registration (2026-11-19T06:19:10Z); hbloop
  journey2-endgame-hbloop-r246.sh started, every 5 min.
- EVIDDIR set explicitly on EVERY pass invocation (r237 incident
  lesson). No overwrite: all pass corpora verified intact and distinct
  at closeout.

SUBSTRATE: master b76d65445 EXACTLY (worktree HEAD). No fix arm pre-filed
this run. A defect the panel surfaces is filed as an F-item and fixed
only under the r147 rule (planned before scored seeds, own proof test,
judged on the post-fix panel); a mid-run fix otherwise gets its own proof
+ a re-run of affected passes, recorded in the run note.
Probe: scripts/probe-endgame-r246-20261119.js (r243 probe verbatim EXCEPT
renames r243->r246, evidence dir 2026-11-19/perseed-endgame-r246,
header, substrate comment b76d65445, + PLAN-map entries 89810–89817,
+ the NOTICK/CARRY instrument below — verified by diff: only renames,
dates, comment reflows, the substrate comment, the new band, and the
instrument; zero other logic change).
Analyzer: scripts/analyze-endgame-r246-20261119.js (r243 analyzer
verbatim EXCEPT input dir, r243->r246, + the instrument tallies —
verified by diff the same way).
Dark probe: SKIPPED — no delta since r211 touched the dark table (r211
skipped on the same reasoning; r219/r225/r230/r233/r237/r239/r243
skipped too).
COMPETENT_PIN=r127 support already in the tree.
NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
M2b GREEN from r182 — no re-sweep (carried as proven).

INSTRUMENT (new this run, probe-side, zero src/js — the r243-owed
NOTICKEXACT / TRIODROUGHT gap): the per-seed JSON gains two fields,
`noTickDeferrals` and `trioCarry`, collected by a DAILY
`Game.vbrainLogs()` scan inside the probe's onDaily hook:
- The brain log is a rolling 400-entry buffer (LOG_CAP in
  villager-brain.js, shared across all villagers), so an end-of-run
  count would see only the last few days — the scan runs daily and
  counts only entries with `e.day === dayOf(G)` (dedup by day+vid).
  Read-only: the scan calls a slice getter and writes nothing to
  game state; no RNG is consumed.
- `noTickDeferrals`: entries with `deferred ===
  'party_launch:no-tick-exact'` — the NOTICKEXACT deferral firing in
  the wild (day, vid, pick). The log entry is the same object the
  brain mutates after pushLog, so the deferred flag is visible.
- `trioCarry`: party_launch picks whose annotated candidate carries
  companion2 and/or companion3 (from the entry's `candidates` list,
  matched on winPlanAction party_launch) — the TRIODROUGHT carry
  observed in the wild (day, vid, companion, companion2, companion3).
- EXPECTATION, stated before the panel: deferrals MAY fire
  (wave-4-targeted part-3 picks are the measured population, ~8–14
  per band). The carry half reads 0 on every default pass by design:
  no candidate sets companion2 without VETREENGAGE=1 and none sets
  companion3 without PARTYSIZE4=1, and neither flag is set on any
  r246 pass — so the carry instrument this run proves the WIRING
  (the field exists, reads 0 with the gates off), and the verdict on
  the triodrought carry itself waits for a lever panel that turns a
  gate on. A 0 here is the expected value, not a NO-GO.
- FOODGATE flags: NOT persisted. The foodgate-instr flags live on the
  engine's fight record; the probe's census fights are projections
  that don't copy them, and wiring that copy is out of scope for
  this run's instrument. The flags stay observable only in the
  engine record + the instrument's own proof test.

HEAD DELTAS SINCE r243 SUBSTRATE (6a97f3a07 -> b76d65445, verified by
git log + git diff; net src/js diff 7 files, +362/-59; policy file
scripts/policies/competent.js also changed). Classified:
LIVE (behavior changes under the default panel):
(a) DOOR-GUARD FOLLOW-UP (journey-landing r146 05921a54d,
    scripts/policies/competent.js +38, src/js/convo-beats.js +15):
    the bot's beastStrikeTarget now skips a stepped-on door tile
    (findPath routes THROUGH hall doors — the step itself may be a
    door even when the destination is not), and beastTrickPlay's
    trick-move + keep-distance picks skip door tiles outright
    (mirror of the r145 closeStep guard). Plus a fledBadSample
    recorder (record-only) so a legacy-outmatched firing can be
    NAMED by day + monster HP. LIVE for the panel: the POLICY
    changed, so fight play changes — fewer accidental door-tile
    fight flees. Watch: door-tile fight ejects (expect 0),
    fledBad firings (now nameable).
    The same commit widens the want-bridge pool 6→10 lines
    (convo-beats.js): LIVE dialogue variety (the r146 seventh
    deflect — seed 1250 d10, a 27-turn sitting repeating
    '"Look, forget it. You wanted something?"' at turns 1 and 24).
    Watch: want-bridge repeats inside one sitting (expect none
    before 11 bridges).
(b) LINK-ACCEPT VOICE (journey-scale r243 ee4e9d07f,
    src/js/bond-initiation.js +69): the raise-accept reply no longer
    parrots the player's choice label ('"All right — let's ask
    them."' — 13/13 accepted/counter raise talks on r242's band);
    the NPC now answers in their own words via linkAcceptLine,
    keyed to how they know the village (visit / seen-nearby /
    rumor / told), first-unledgered pick. LIVE dialogue; affects
    link-raise transcripts + RNG draws. Watch: the ECHO question —
    the accept line now varies by lore-how; no parrot recurrence.
ENV-GATED (inert under the default panel):
(c) PARTYSIZE4 (sim-partysize4-b a9a4108fe + 1032897dc,
    villager-brain.js +56, win-plan.js +187): a third companion for
    wave-4-target plans (dawn pick + depart mirror quad launch),
    behind PARTYSIZE4=1. OFF on all r246 passes. The #2515
    meeting-party-of-4 question stays with the partysize4 arm
    (its confirm ran NO-GO METRIC-BROKEN, quad ratio 9/9); this
    panel does not turn it on — matched re-run discipline.
(d) FIGHTALLY2 (sim-fightallycap-b): second ally slot, behind
    FIGHTALLY2=1. Pass D turns it on (third sighting, see below).
(e) WILDAVOID / FLEEREPAIR2 / FLEEREPAIR3: unchanged, still gated.
INSTRUMENTS ONLY (no src/js game change):
(f) FOODGATE-INSTR (sim-foodgate-instr-a a519253b9,
    fieldFights.js +44, godpath.js +48): fight-record flags
    (tier/hunger at fight start, tier-blocked fieldAct,
    hunger-blocked 60-kcal Rage pay, rageFired). Engine-side flags
    only, no behavior change (commit claim + proof 38/38). See the
    INSTRUMENT note above for why the flags are not persisted here.
(g) PARTYQUADS counter bump (sim-partyquads-b 83db8255f): stat
    only; quads cannot launch with PARTYSIZE4 off, so it reads 0 by
    expectation on every pass.
(h) build.js +2: version bump only.
No table/ladder/waves/monster change besides (a)/(b). Any headline
difference on Pass A/C/C-wide is attributed first to the LIVE deltas
(a)–(b), then to the instrument recorders, then to dialogue/RNG-draw
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
r239/r243 precedent: same seeds, same probe policy, only the game code
changed) — no fresh band is needed or claimed for the pilot.
SMOKE (harness + timing check, not a binding panel seed): 89706
(wavesnw), pass-A policy, full horizon. Records probe wall time per
seed on this box; if the smoke fails to boot, FAIL LOUDLY and stop.
The smoke ALSO validates the new instrument (noTickDeferrals +
trioCarry fields present on the per-seed JSON, even if empty).
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled; EVIDDIR SET EXPLICITLY ON EVERY INVOCATION
— r237 incident: a pass launched without EVIDDIR overwrote Pass A's
corpora; the probe default still points at the r246 dir only after the
clone, and the explicit env is the belt-and-braces):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r243
  pass A. Outdir perseed-endgame-r246. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r243 pass C. Outdir perseed-endgame-r246-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89810, 89811 (wavesnw) + 89812–89817 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r246-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Pass D (STRETCH, THIRD SIGHTING): FIGHTALLY2=1 + CAPSTONE=1
  BUYOUT=1 BUYOUT_EARLY=1 on the matched seeds 89701–89706. Outdir
  perseed-endgame-r246-d. Judged on the same bindings as pass C
  (analyzer with ANALYZEDIR pointing at the -d dir; no --wide flag).
  r243 said no third sighting was owed absent a fight-engine change;
  the r146 door-guard POLICY change (a) is the closest thing to one
  since — it changes how fights are played (fewer accidental flees)
  — so the third sighting re-observes D on the new policy and asks
  whether the r239 uplift (2/6 full, kills 13) or the r243 level
  result (1/6 full, kills 6) is the repeatable one.
- Pass B: SKIPPED BY DESIGN — r230 pass B was vacuous NO-GO (0
  capstone attempts, 0 deliveries, 0 buyout attempts on all 5 seeds;
  deed gate ok on 0/5). The converting road is pass C, not B; re-running
  B on this substrate would only re-confirm vacuity. The interesting
  questions (does the road still convert? does wave 5 get faced? does
  the second ally slot move kills? do the (a)/(b) deltas move
  anything? does the NOTICKEXACT deferral fire?) are answered by
  passes A, C, C-wide, and D.
TIME-BOX: passes run sequentially; the cut order if the window closes
is D, then C-wide, then C-live. A-live is the committed core — the run
is not complete without it. PILOT FIRST (§9): the smoke + first two
pass-A seeds verify the harness on this substrate before the full panel
burns.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89810–89817
searched across ALL evidence *.md preregs (word-boundary grep for
8981[0-7] — ZERO hits in any dated prereg, run note, screen, or
forbidden/contaminated list) and scripts/*.js (ZERO hits naming 8981x).
The full-evidence grep found 5 files containing 8981x numbers — ALL
are pantry/food quantities, not seeds (pantryFreshAfter 89810,
pantryKcal 89816/89814, food 89816, glutInflowTotal 89815), so they do
not reserve the band. The adjacent band 89800–89807 is NOT fresh:
89801–89808 were used by sim-togrescreen-b (2026-11-04 prereg) and
the collision is already recorded in sim-finalvoice-b (2026-11-11
prereg) — the r246 band steps past it. 89790–89797 was used by r243
(today) and is NOT reused. Named only here, as the r246 C-wide band.

R243 PASS-A BASELINE (per-seed, from the r243 run note; judged on
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
Tally r243 pass A: lesser 5/6, full 0/6, village-lost 1/6, won 5/6.
M23b 0/6.
Pass C: lesser 5/6, full 1/6 (89702 FULL d101), lost 0/6, won 6/6,
M23b 1/6 (89702@d86, DELIVERED); M25c 6/6 bought early.
C-wide (89790–89797): lesser 7/8, full 0/8, lost 1/8 (89794 d54),
never-sat 0/8; M25c 6/8 bought; M23b 0/8.
Pass D (FIGHTALLY2): lesser 5/6, full 1/6 (89705 FULL d90), won 6/6,
M23b 1/6, kills 6 (C 10, A 6), wave-5 faced 2/6 seeds.

R246 QUESTIONS: (1) pass A-live: does the pilot reproduce r243 modulo
the named deltas (a)–(b) — in particular, does anything move wave-5
facing, veteran banking, or the deed gate on the matched band, given
the LIVE deltas are the door-guard policy change and the link-accept
voice? (2) TABLESITTING: does any muster or march hold/fire
differently in a mercy window (capstone delivered, finale unresolved)
— the distinction (a) from r243 exists to be observed; a mercy-window
muster that fires (or holds) is a named observation either way.
(3) NOTICKEXACT: does a party_launch:no-tick-exact deferral fire in
the wild on this panel (the new instrument counts it — day, vid,
pick), and do wave-4 launches shift on the matched band? (4)
TRIODROUGHT: does the carry instrument read 0 as expected (gates
off), with the field present on every per-seed JSON? (5) DOOR-SKIP:
any door-tile fight eject on any pass — and does the r146 policy
change show up as fewer accidental flees vs r243? (6) FLEDBAD: does
the new recorder name any legacy-outmatched firing (day + monster
HP)? (7) POCKET: any pocket monster left unreachable? (8) M23b: on
pass C, does the deed gate go ok and does the buyout road convert
again (r243: 1/6 matched, 0/8 fresh — repeat, rotate to another seed,
or revert)? (9) does a SECOND buyout seed convert this round?
(10) C-wide fresh band: does ANY seed face wave 5 (w5max>0) or take a
full seat — or does the r243 finding hold (0/8 full, 1 facing seed
without converting)? (11) F1 #2519 RECURRENCE: does any seed never
sit (exiled scholar, guard stall)? (12) F5: does the settled-favor
branch fire in the wild on THIS panel (r243 endgame: vacuous 0 hits;
succession r233: F5 FAIL as written — the endgame watch is whether
the Amanda fix moves the wild count at all)? (13) C3d: does the
recap-live-want fix hold in the wild — a recap naming the live want
instead of the empty pool (r243: vacuous, no recap sittings on the
endgame panel; the watch stays open for a panel with recap
sittings)? (14) ECHO: does the link-accept voice (b) end the parrot
— any accepted raise talk still serving '"All right — let's ask
them."' (regression — FAIL LOUDLY)? (15) WANT-BRIDGE: does the
6→10 pool end the seventh-deflect repeat (r146's HEED-V=1 case) in
the wild? (16) COMPANIONGUARD: do launches still form pairs/trios
under the guard + plan-death — count guard skips
(companionGuardSkips) and watch for a plan record listing a companion
who never left (the mirror gap the guard claims closed; r243: A 10,
C 12, C-wide 2, D 15)? (17) DEATHCLEANUP: how many win-plan deaths
fire per seed (deathCleanups sample) — and does any plan die with its
holder mid-launch in a way that strands a launch? (r243 pass C: 14
total, 0 removal cleanups, no stranded launch.) (18) does 89705 lose
its village again (r230: lost d59; r233/r237/r239/r243: survived), or
does the dialogue/RNG delta change its fate? (19) starvation watch on
every bought seed (Joja price in lives). (20) funeral-mend watch
(r243: not observed firing; r237: fired + voiced on C-wide). (21)
the 159-turn Algorithm fight (r194 89701 d107): does it recur?
(22) the fastW4 diedInFight gap (r171): watch the corpus for a
fastW4 scholar-death fight. (23) PASS D THIRD SIGHTING: does the
second ally slot repeat r239's effect (2/6 full seats, kills ~13)
or r243's level result (1/6 full, kills 6) on the new policy — and
does any meeting party field FOUR (the #2515 cap broken), or does
the sense still cap at 2 allies? (24) GUARD-STALL WATCH: same
not-ready reason ≥30 consecutive days = LOUD line in the run note.
(25) TOTAL-DEFERRAL WATCH (adopted this run from the r243 metric
review): announce→sit deferral ≥30 days total = LOUD line (the
r243 89701-A 29-day deferral was a wait/not-ready alternation, not
a same-reason stall — this watch catches long deferrals generally).

INTERESTING FINDING (what would count): any pass-A-live-vs-r243
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r243 had uw 4; a full seat on pass A; a full
seat on a new C-wide seed; a SECOND full seat on pass C; a village
dying before d90 on any pass (survival collapse — name the seed, the
day, the cause); a tribute delivery firing (M24 exercised for the first
time in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a deedGateFirstOk on a seed where r243 had none (M23b moves); a
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
survival in a way the r243 panel cannot explain; an F5-class dry hit
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
(the instrument's first observation — count, days, vids); a trio
launch carrying companion2/3 (expected 0 with the gates off — any
non-zero is a surprise worth naming); a door-tile fight eject
(door-skip failing); a fledBad firing NAMED by the new recorder;
a link-accept parrot line recurring (the (b) fix failing); a
want-bridge repeat inside one sitting before 11 bridges (the pool
widening failing); an exiled scholar never sitting (F1 recurrence);
a guard-stall (same not-ready reason ≥30 consecutive days); a
total deferral ≥30 days (announce→sit).

BINDINGS (carried from r203/r211/r219/r225/r230/r233/r237/r239/r243
verbatim; metric binding §14 — a miss is NO-GO, never re-scored
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
  0/8, Pass D 1/6 (89705@d73, DELIVERED) — r243.
- F5 + C3d stay vacuous on the endgame leg unless this panel's sittings
  reach them — the watches need a panel whose sittings reach them, not
  a metric change. The succession leg's F5 FAIL as written (r233) is
  noted but does not change the endgame watch: the endgame panel
  measures whether the Amanda fix moves the wild count.
- GUARD-STALL WATCH (r243): same not-ready reason ≥30 consecutive
  days = LOUD line. Adopted the TOTAL-DEFERRAL variant this run
  (r243 metric review proposal): announce→sit ≥30 days = LOUD line.
- Telemetry baseline: r188 stands for uw/won (r243 pass-A sums uw 21
  vs 22, won 5 vs 4 — quiet, NOT rolled). peakVet: r188 says 8; r239
  read 4, r243 read 3 — the baseline no longer represents the current
  regime. This run re-baselines the peakVet key ONLY if its own Pass A
  5-seed sum again lands 3–4 with the drop adjudicated explained (the
  drop happened at/before r239; kills still happen panel-wide). The
  baseline is NOT rolled on a LOUD line before adjudication — any
  LOUD line is investigated first, per the run body's step 14.
- companionGuardSkips watch (r243: A 10, C 12, C-wide 2, D 15): HOLD
  as a watch, not a binding. deathCleanups per seed (r243 pass C: 14
  total) — HOLD as a watch.
- Pass D (FIGHTALLY2): THIRD observation tally this run — meeting
  party sizes, wave-4 kills per seed, full seats; judged against the
  Pass C numbers on the same seeds AND against r239's and r243's Pass
  D numbers, not against a frozen bar.
- NOTICK/CARRY instrument: first observation this run. The deferral
  count is a new tally (no bar); the carry count's expected value is
  0 with the gates off (wiring proof, not a verdict).
