# Journey endgame r243 — PRE-REGISTRATION (lane B, 2026-11-18 14:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This is a LEGITIMATE
leg-4 run, not a stale-rotation repeat: the full cycle turned today —
r239 endgame (01:00 CST, rotation 4→5 owed at its landing, written by
its adoption with read-back), r236 social life (04:00 CST, 5→6), r240/r241
crisis (6→7 by the r240 adoption), r233 succession (7→4 by its closeout
at 19:27Z, commits 9704401d1 + 41a47a7b9). The rotation file reads 4
because the cycle completed, not because a write was missed. This run
plays leg 4 again and writes 5, social life, at closeout ONLY after a
verified landing — a failed or partial run does not advance the leg, per
r135/r138/r140/r194 precedent.

Run number basis: the highest journey run number on disk is r242
(scale, 2026-11-18). This run is r243 (max+1).

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-18T19:55:17Z (run_id 2026-11-18T19:55:17Z, line 2
  2026-11-18T19:55:39Z). Deleted at closeout.
- Main tree: `git status --short` 0 lines, disk 49% (fail line 85%).
- `git pull` "Already up to date" at 19:56Z (master 6a97f3a07).
- Reaper ran at run start: 13/16 active; LOUD-dirty trees from other
  owners (journey-scale-attr, sim-secondlink-a, sim-redactor-a,
  sim-saycap-a, sim-siegedialog-a, sim-inffight-ab, sim-fleerepair2-b)
  never auto-removed, not mine to touch. No cleanup this run.
- Registration: `worktree-register.sh journey2-endgame` completed in
  ~2.2 min. Branch journey2-endgame did not exist (deleted at the r239
  adoption release), so `-b` created it fresh at master. Heartbeat
  landed at registration (2026-11-18T20:02:43Z); hbloop
  journey2-endgame-hbloop-r243.sh started, every 5 min.
- EVIDDIR set explicitly on EVERY pass invocation (r237 incident
  lesson). No overwrite: all pass corpora verified intact and distinct
  at closeout.

SUBSTRATE: master 6a97f3a07 EXACTLY (worktree HEAD). No fix arm pre-filed
this run. A defect the panel surfaces is filed as an F-item and fixed
only under the r147 rule (planned before scored seeds, own proof test,
judged on the post-fix panel); a mid-run fix otherwise gets its own proof
+ a re-run of affected passes, recorded in the run note.
Probe: scripts/probe-endgame-r243-20261118.js (r239 probe verbatim EXCEPT
renames r239->r243, evidence dir 2026-11-18/perseed-endgame-r243,
header, substrate comment 6a97f3a07, + PLAN-map entries 89790-89797 —
verified by diff: only renames, dates, comment reflows, the substrate
comment, and the new band; zero logic change).
Analyzer: scripts/analyze-endgame-r243-20261118.js (r239 analyzer
verbatim EXCEPT input dir, r239->r243 — verified by diff the same way).
Dark probe: SKIPPED — no delta since r211 touched the dark table (r211
skipped on the same reasoning; r219/r225/r230/r233/r237/r239 skipped too).
COMPETENT_PIN=r127 support already in the tree.
NO A-frozen arm — (l) EXONERATED in r194 and no policy file changed since.
M2b GREEN from r182 — no re-sweep (carried as proven).

HEAD DELTAS SINCE r239 SUBSTRATE (03c53bf6e -> 6a97f3a07, verified by
git log + git diff; net src/js diff 12 files, +611/-35). Classified:
LIVE (behavior changes under the default panel):
(a) TABLESITTING (journey-scale r242 8747d1bcd, table.js +24): new
    tableSitting() — true ONLY while a table sequence is actually live
    (win-day-floor deferral, or a tableDone sitting whose finale has not
    resolved). The LADDER MERCY window (capstone delivered, finale
    unresolved) is NOT a live sitting. tableActive() untouched, so
    every ambient router behaves identically; the muster + march steps
    hold only on tableSitting(). Equivalence asserted by
    scripts/test-table-sitting-20261117.js: tableActive() ===
    tableSitting() || mercy. DIRECTLY endgame-relevant: muster/march
    behavior in mercy windows is the headline question this run.
(b) NOTICKEXACT (sim-notickexact-a 5fe00c196, villager-brain.js +51):
    a part-3 party_launch pick is DEFERRED — but ONLY when the
    holder's current win-plan has a target and needWave >= 4. No commit
    is written, any earlier same-day commitment is cleared, the scorer
    still returns the core pick. Part-2 picks untouched. LIVE, launch
    behavior. Watch: does the deferral fire in the wild (log entry
    carries deferred 'party_launch:no-tick-exact'), and do wave-4
    launches shift?
(c) TRIODROUGHT CARRY (sim-triodrought-b f0c6869b6): restore writeCommit
    companion2/3 carry (finding #2518). LIVE, party launch. Watch:
    do trio launches now carry companion2/3 in the corpus?
(d) DOOR-SKIP (journey-landing r145 a85627205, fieldFights.js): a fight
    step must not take a door tile and end the fight by accident
    (seed 1234 d9: dodge stepped on hall door (4,6), fight fled with
    4 allies behind); shared isDoorTile helper in beastDodgeMove +
    closeStep, fail-open without genDetail. LIVE, fight-relevant.
    Watch: no door-tile fight eject on any pass.
(e) POCKET REPAIR (journey-landing r144 cc35d76b9): move unreachable
    single-tile monster into player reach (finding #2537). LIVE.
    Watch: pocket monsters reachable / pocket count on the panel.
(f) WALKH0ME (journey-establishment r240 476f43e1d, game.js +25):
    walkHome names the first homeward refusal + clearableBlocked,
    travelHome84 prefers it. LIVE. Bears on the r239 F1 (#2519) exile
    softlock: does an exiled scholar's return path now voice a
    clearable block?
(g) MUSTER-GROWTH DAWN LINE (journey-deepening r236 0bc7ccd84, game.js
    +6, titans.js +155): a short muster now says what a re-sounded
    call would bring. LIVE, muster content. Watch the muster lines.
(h) AMANDA FIX (journey-crisis r240 639bd3f41, convo-wants.js +66):
    repay want must not call a broken favor settled while its need is
    live (Amanda 14525 d38, C3b r201). LIVE. Bears on the F5
    settled-favor question — the succession leg (r233) found F5 FAIL
    as written; the endgame watch stays open.
(i) TRAILTALK (journey-social-life r236, favor-forage.js +45):
    trail-talk pools 2→6 lines, no-repeat-until-exhausted per outing.
    LIVE, social content.
(j) MIME-WALK (journey-crisis r241 6f614ce66, conversation.js +25):
    mime-walk invitation gets a 6-variant pool, no-repeat per
    villager. LIVE, dialogue.
(k) WREN NOTE (journey-crisis r241 11f9e87ca, alienPlayers.js +21,
    alienPlayers.json +9): Wren cache note rotates through a 6-variant
    pool instead of reprinting. LIVE, dialogue.
(l) PARTYTRIOS COUNTER (sim-partytrios-b e02ae10b3, villager-brain.js
    +7): the brain launch path now bumps partyTrios (stat only — the
    counter, not the launch). LIVE but behavior-neutral. The stat
    should now read non-zero where trios launch; the r239 Q14 sense
    question (meeting party of 4) stays open for the tracer/sim arms.
ENV-GATED (inert under the default panel):
(m) WILDAVOID (sim-wildavoid-a 5402d4cc3, game.js +43, win-plan.js +81):
    outmatched-avoid on the wild routers, behind WILDAVOID=1.
(n) FLEEREPAIR3 (sim-fleerepair3-b 0b8312f20, fieldFights.js +13):
    leave ends the fight, no parting hit, behind FLEEREPAIR3=1.
(o) FIGHTALLY2 (sim-fightallycap-b, fieldFights.js): second ally slot,
    behind FIGHTALLY2=1. Pass D turns it on (second sighting).
(p) FLEEREPAIR2 (sim-fleerepair2-b, win-plan.js): behind FLEEREPAIR2=1.
INSTRUMENTS ONLY (no src/js game change):
(q) vetguard (DIAG-NO-GO), winplandepart (DIAG-GO), aidleave (DIAG-GO),
    fightcap (DIAG-GO), fightcap-dmg (NO-GO, carrier never fired),
    analyzer2513 (parameterize file-count check). StageStep
    (journey-scale r242 7a72e04f6) touched no src/js file (pilot fix).
No table/ladder/waves/monster change besides (a)/(e)/(g). Any headline
difference on Pass A/C/C-wide is attributed first to the LIVE deltas
(a)–(l), then to (q) recorder labels, then to dialogue/RNG-draw
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
r239 precedent: same seeds, same probe policy, only the game code
changed) — no fresh band is needed or claimed for the pilot.
SMOKE (harness + timing check, not a binding panel seed): 89706
(wavesnw), pass-A policy, full horizon. Records probe wall time per
seed on this box; if the smoke fails to boot, FAIL LOUDLY and stop.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled; EVIDDIR SET EXPLICITLY ON EVERY INVOCATION
— r237 incident: a pass launched without EVIDDIR overwrote Pass A's
corpora; the probe default still points at the r243 dir only after the
clone, and the explicit env is the belt-and-braces):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r239
  pass A. Outdir perseed-endgame-r243. COMMITTED CORE.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r239 pass C. Outdir perseed-endgame-r243-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89790, 89791 (wavesnw) + 89792–89797 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r243-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Pass D (STRETCH, SECOND SIGHTING): FIGHTALLY2=1 + CAPSTONE=1
  BUYOUT=1 BUYOUT_EARLY=1 on the matched seeds 89701–89706. Outdir
  perseed-endgame-r243-d. Judged on the same bindings as pass C
  (analyzer with ANALYZEDIR pointing at the -d dir; no --wide flag).
  r239's first sighting: 2/6 full seats, kills 13 vs C 5 — this run
  asks whether it repeats on the new substrate.
- Pass B: SKIPPED BY DESIGN — r230 pass B was vacuous NO-GO (0
  capstone attempts, 0 deliveries, 0 buyout attempts on all 5 seeds;
  deed gate ok on 0/5). The converting road is pass C, not B; re-running
  B on this substrate would only re-confirm vacuity. The interesting
  questions (does the road still convert? does wave 5 get faced? does
  the second ally slot move kills? does the tableSitting distinction
  move muster/march?) are answered by passes A, C, C-wide, and D.
TIME-BOX: passes run sequentially; the cut order if the window closes
is D, then C-wide, then C-live. A-live is the committed core — the run
is not complete without it. PILOT FIRST (§9): the smoke + first two
pass-A seeds verify the harness on this substrate before the full panel
burns.

SEED-BAND FRESHNESS (local_seed_band_freshness skill): band 89790–89797
searched across ALL evidence *.md (word-boundary grep for 8979[0-7] and
8979[0-9] — ZERO hits in any dated prereg, run note, screen, or
forbidden/contaminated list) and scripts/*.js (ZERO hits naming 8979x).
Forbidden-band notes (r104 etc.) name 94xxx–97xxx saturation — not the
897xx range. 89780–89787 was used by r239 (today) and is NOT reused.
Named only here, as the r243 C-wide band.

R239 PASS-A BASELINE (per-seed, from the r239 run note; judged on
these seeds, pass A-live):
- 89701 waves: lesser, won, uw 4, FACED wave 5 ×0, standing peak 199
  (the 199-cap never released), sat d108 (defer 18d), peakVet 0, kills 0.
- 89702 waves: lesser, won, uw 5, FACED wave 5 ×4 (editor d80, spoiler
  d85, cancellation d86, rerun d87), standing peak 387, deedGate ok d85.
  M23b 1/6.
- 89703 waves: lesser, won, uw 4, w5max 0, sat d95, peakVet 1, kills 2.
- 89704 forcedrift: lesser, won, uw 4, peak 170, sat d90, peakVet 0.
- 89705 wavesnw: lesser, won, uw 4, sat d104, peak 199, survives.
- 89706 wavesnw (smoke): lesser, won, uw 4, sat d90, peakVet 1.
Tally r239 pass A: lesser 6/6, full 0/6, village-lost 0/6, won 6/6.
M23b 1/6.
Pass C: lesser 5/6, full 0/6, lost 1/6 (89702 village-lost d89, food
collapse); M23b 0/6; M25c 6/6 bought early. Wave 5: 89702 FACED 1,
89703 FACED 0, 89705 uw 5 NEVER-ARRIVED.
C-wide (89780–89787): lesser 7/8, full 1/8 (89781 FULL d92, first full
seat on a fresh C-wide band), lost 0/8, never-sat 1/8 (89783, F1 #2519
exiled scholar softlock); M25c 7/8 bought.
Pass D (FIGHTALLY2): lesser 4/6, full 2/6 (89702 + 89705), won 6/6,
M23b 2/6, kills 13 (C 5, A 6), wave-5 faced 3/6 seeds.

R243 QUESTIONS: (1) pass A-live: does the pilot reproduce r239 modulo
the named deltas (a)–(l) — in particular, does anything move wave-5
facing, veteran banking, or the deed gate on the matched band, given the
LIVE deltas are tableSitting, notickexact, triodrought-carry, door-skip,
pocket repair, walkHome, muster-growth, Amanda, TRAILTALK, mime, Wren?
(2) TABLESITTING: does any muster or march hold/fire differently in a
mercy window (capstone delivered, finale unresolved) — the distinction
(a) exists to be observed; a mercy-window muster that fires (or holds)
is a named observation either way. (3) NOTICKEXACT: does a
party_launch:no-tick-exact deferral fire in the wild, and do wave-4
launches shift on the matched band? (4) TRIODROUGHT: do trio launches
carry companion2/3 in the corpus? (5) DOOR-SKIP: any door-tile fight
eject? (6) POCKET: any pocket monster left unreachable? (7) M23b: on
pass C, does the deed gate go ok and does the buyout road convert again
(r239: 0/6 matched, 1/8 fresh — repeat, rotate to another seed, or
revert)? (8) does a SECOND buyout seed convert this round? (9) C-wide
fresh band: does ANY seed face wave 5 (w5max>0) or take a full seat —
or does the r239 finding hold (1/8 full — 89781, faced ×2; 89782 unlocked
wave 5 with no facing headline)? (10) F1 #2519
RECURRENCE: does any seed never sit (exiled scholar, guard stall) —
and does walkHome (f) now voice a clearable homeward block where r239's
89783 had none? (11) F5: does the settled-favor branch fire in the wild
on THIS panel (r239 endgame: vacuous 0 hits; succession r233: F5 FAIL
as written — the endgame watch is whether the Amanda fix (h) changes
the wild count at all)? (12) C3d: does the recap-live-want fix hold in
the wild — a recap naming the live want instead of the empty pool
(r239: vacuous, no recap sittings on the endgame panel; the watch stays
open for a panel with recap sittings)? (13) COMPANIONGUARD: do launches
still form pairs/trios under the guard + plan-death — count guard skips
(companionGuardSkips) and watch for a plan record listing a companion
who never left (the mirror gap the guard claims closed; r239: A 10,
C 12, C-wide 2, D 15)? (14) DEATHCLEANUP: how many win-plan deaths fire
per seed (deathCleanups sample) — and does any plan die with its holder
mid-launch in a way that strands a launch? (r239 pass C: 14 total, 0
removal cleanups, no stranded launch.) (15) does 89705 lose its village
again (r230: lost d59; r233/r237/r239: survived), or does the
dialogue/RNG delta change its fate? (16) starvation watch on every
bought seed (Joja price in lives). (17) funeral-mend watch (r239: not
observed firing; r237: fired + voiced on C-wide). (18) the 159-turn
Algorithm fight (r194 89701 d107): does it recur? (19) the fastW4
diedInFight gap (r171): watch the corpus for a fastW4 scholar-death
fight. (20) PASS D SECOND SIGHTING: does the second ally slot repeat
its r239 effect (2/6 full seats, kills ~13) on the new substrate — and
does any meeting party field FOUR (the #2515 cap broken), or does the
sense still cap at 2 allies? (21) GUARD-STALL WATCH (adopted from the
r239 metric review): same not-ready reason ≥30 consecutive days = LOUD
line in the run note.

INTERESTING FINDING (what would count): any pass-A-live-vs-r239
headline difference other than the named deltas; a matched seed
unlocking wave 5 where r239 had uw 4; a full seat on pass A; a full
seat on a new C-wide seed; a SECOND full seat on pass C; a village
dying before d90 on any pass (survival collapse — name the seed, the
day, the cause); a tribute delivery firing (M24 exercised for the first
time in this leg's recent panels); a wave-5 kill on a previously w5:0
seed; a deedGateFirstOk on a seed where r239 had none (M23b moves); a
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
survival in a way the r239 panel cannot explain; an F5-class dry hit
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
NEW THIS RUN: a muster or march firing (or holding) inside a mercy
window — the tableSitting distinction observed in the wild either way;
a party_launch:no-tick-exact deferral in the corpus; a trio launch
carrying companion2/3; a door-tile fight eject (door-skip failing);
a pocket monster unreachable after the pocket repair; an exiled
scholar never sitting (F1 recurrence) with walkHome voicing (or not
voicing) the clearable homeward block; a guard-stall (same not-ready
reason ≥30 consecutive days).

BINDINGS (carried from r203/r211/r219/r225/r230/r233/r237/r239 verbatim;
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
- M23b tally: Pass A 1/6, Pass C 0/6, C-wide 0/8 (r239; 89781's gate
  went ok d84 but M23b is a per-pass tally on the matched band — the
  C-wide gate-ok is recorded separately), Pass D 2/6.
- F5 + C3d stay vacuous on the endgame leg unless this panel's sittings
  reach them — the watches need a panel whose sittings reach them, not
  a metric change. The succession leg's F5 FAIL as written (r233) is
  noted but does not change the endgame watch: the endgame panel
  measures whether the Amanda fix moves the wild count.
- GUARD-STALL WATCH adopted this run (r239 metric review proposal):
  same not-ready reason ≥30 consecutive days = LOUD line in the run
  note. The r239 F1 (89783) would have tripped it at 71 days.
- Telemetry baseline: r188 stands (r239 pass-A sums uw 21 vs 22, won
  5 vs 4, peakVet 4 vs 8 — quiet, NOT rolled). This run compares
  pass-A-live against the r188 baseline (same 6 seeds, same regime,
  live policy).
- companionGuardSkips watch (r239: A 10, C 12, C-wide 2, D 15): HOLD
  as a watch, not a binding. deathCleanups per seed (r239 pass C: 14
  total) — HOLD as a watch.
- Pass D (FIGHTALLY2): SECOND observation tally this run — meeting
  party sizes, wave-4 kills per seed, full seats; judged against the
  Pass C numbers on the same seeds AND against r239's Pass D numbers,
  not against a frozen bar.
