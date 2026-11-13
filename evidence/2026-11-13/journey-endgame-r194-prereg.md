# Journey endgame r194 — PRE-REGISTRATION (lane B, 2026-11-13 11:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start (r193 succession merged
48ed1ffd7, rotation 7->4). This run plays leg 4 and writes 5, social
life, at closeout ONLY after a verified landing — a failed or partial
run does not advance the leg, per r135/r138/r140 precedent.

Run number basis: latest completed Lane B runs are r188 endgame, r189
social life, r192 crisis, r193 succession. This run is r194.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at run start. This run's lock written
  2026-11-13T16:55:50Z (run_id journey2-4-20261113-1655).
- Main tree: `git status --short` 0 lines, disk 41% (fail line 85%).
- `git pull --ff-only` "Already up to date" at 16:56Z (master 48ed1ffd7).
- Reaper ran, removed nothing (15/16 active; LOUD dirty trees are other
  owners').
- HOST WRITE FLAP: ACTIVE at registration — first register attempt
  failed 16:59Z ("unable to write file tools/mobile-sim.html",
  "unable to write file version.json", "fatal: Could not reset index
  file to revision 'HEAD'"); flap-watch logged FLAP at 16:59:51Z
  (errno=1 Operation not permitted, atomic write + git ref update).
  Manual write probes at ~17:01Z returned OK in both workspace and
  repo; second register attempt succeeded ~17:05Z. The flap episode
  began 16:59:51Z after an ALL-OK streak since 16:48Z — the
  registration failure is attributed to the flap, not to the command.
  Worktree clean at registration, HEAD 48ed1ffd7. Heartbeat
  immediately after registration; heartbeat re-established by hand
  every <15 min through the run (no detached loop this run — see
  closeout note if the run dies mid-pass).
- Exec wall: long jobs run NOHUP-DETACHED with log polling (r178 prereg).

SUBSTRATE: master 48ed1ffd7 EXACTLY (worktree HEAD at registration;
verified: `git log --oneline bd29d8bd7..HEAD` = 99 commits, 12 touch
src/js). Probe-side changes only, pre-planned below, plus the
fullseat-diag blank fix (§BLANK, STRETCH) which lands AFTER the
measurement passes are scored. Any other game fix emerging from the
pilot gets its own proof test and is judged on a post-fix re-run, per
the r147 rule, not claimed from the pre-fix pilot. Probe:
scripts/probe-endgame-r194-20261113.js (r188 probe verbatim EXCEPT
renames r188->r194, evidence dir 2026-11-13/perseed-endgame-r194,
header, + the M2c adoptedRefs guard, + the pantryAfter computed
label, + the competentPin record — all named below). Analyzer:
scripts/analyze-endgame-r194-20261113.js (r188 analyzer verbatim
EXCEPT input dir, r188->r194, + the M2c distinct-opens rule, + the
CORPUS-PURITY verdict — both named below). Dark probe:
scripts/probe-darktable-r194-20261113.js (r188 dark probe verbatim
EXCEPT renames + outdir). M2b test: GREEN from r182 — no re-sweep
(carried as proven).

HEAD DELTAS SINCE r188 SUBSTRATE (bd29d8bd7 -> 48ed1ffd7, verified by
git log; 12 src/js commits):
(a) r193 SUCCESSION (1f257d01f, [needs-eyes]): agency closer dry-line
    pool-picker — pre-check closers with convoWouldBlock, speak first
    unblocked, all-blocked falls to honest noop. Dialogue quality;
    read by the people check.
(b) r135 ESTABLISHMENT (a717031ce, [needs-eyes]): gate the field ask
    on teachable-now + spend plant entry on delivery. Dialogue
    quality; teaching.
(c) sim-applystatus-a (c0fc52cfd, [needs-eyes]): applyStatus freeze
    line once per monster per fight. Combat SAY dedup — transcript
    line counts fall, survival byte-identical 9/9 per its evidence.
(d) sim-combatdedup-b (873a8b7a7, [needs-eyes]): combat-line dedup —
    strike/falls once per fight, SNAPS once per monster per fight.
    Combat SAY dedup; survival byte-identical 8/8 per its evidence.
(e) r192 CRISIS (27ce36ecd): ledger-aware dialogue pools (F1-F5).
    Dialogue quality; read by the people check.
(f) sim-freezeline-a (4a2cc89de, [needs-eyes]): freeze line once per
    monster per fight. Combat SAY dedup; survival byte-identical.
(g) r134 SCALE (1decd5bee, [needs-eyes]): spoken raise keeps its
    answer window. Dialogue quality.
(h) sim-voiceless-a (19ff055d8, [needs-eyes]): voice the wave-5 armed
    shortfall at the morning briefing. ENDGAME VOICING — directly
    relevant: the wave-5 pair-arming shortfall (r188 prereg (i):
    "armed never reaches 6, shortfall voiceless") now has a voice.
    Watch morning-briefing lines on the pilot seeds.
(i) r188 ENDGAME (1d532e903, this leg's own fix): raid-defense
    fallen wording — "met them and lived" dropped when a defender
    fell. Dialogue wording; the r188 defect, now landed.
(j) VERSION BUMPS (a1288c5c4, dc95859a8, 247ee1c9a): build.js stamps
    only.
(k) THE (l) CONFOUND, carried from r188: r128 LANDING (87f00547d):
    scripts/policies/competent.js +185/-37 (beastFreeTiles,
    beastTrickPlay, competent movement/flee/close fallbacks;
    "Scholar stops stepping nowhere"). A BOT-POLICY change, NOT a
    game change. The r188 probe used the live competent.js, so r188
    pass A is "same seeds, same probe, game code + bot policy
    changed". THIS RUN adjudicates it with the matched A/B below.
    The frozen copy scripts/policies/competent-r127.js (created by
    the r128 landing itself, the pre-landing competent.js) is the
    pinned control. No other policy file changed between r127 and
    r194 in the endgame chain except the pin support itself (see
    §PIN).
The winnability freeze otherwise stands. Any OTHER headline
difference is a same-run investigation item, never a road claim, and
is attributed first to these deltas before any wider claim.

§PIN — COMPETENT_PIN=r127 (probe-side, env-gated, zero src/js):
capable.js, feastscale.js, deed-seeking.js, risk-aware.js, leadcourt.js
and scalecourt.js are the six endgame-chain modules that require
'./competent' (capable: C.competent.fight + walkTo/markRecover/
holdConversation/chooseFleeDir; feastscale: recentGives; deed-seeking,
risk-aware, leadcourt, scalecourt: the competent object — daily/fight
only). The first three were named in the draft prereg; the proof test
caught the other three in capable's transitive closure (risk-aware via
capable, leadcourt via feastscale, scalecourt via belongseek) — the
prereg is corrected here BEFORE any scored seed. Each now reads
`require(process.env.COMPETENT_PIN === 'r127'
? './competent-r127' : './competent')`. Default (env unset) is
byte-identical: the live competent.js. The frozen copy exports the
same shape the chain uses (competent, walkTo, markRecover,
holdConversation, chooseFleeDir, recentGives, daily, fight — all
present in competent-r127.js; the r128-only exports beastTrickPlay,
legacyFleeWalk, beastDodgeMove, closeStep are NOT used by the chain —
verified by grep). Proof test
scripts/test-competent-pin-r194.js: subprocess pair (pin set / unset)
asserting the require cache holds competent-r127.js under the pin and
competent.js by default, and that the composed capable policy loads
under both. The r194 probe records `competentPin` (live|r127) on every
per-seed JSON + transcript header + stdout summary line, so the arms
are distinguishable in the corpus. FID/DET modes still compare
like-with-like (both sides go through capableDeedHunt, so both sides
take the pin). The pin support is the ONLY change to shared policy
files; no other arm's default behavior moves.

§M2c FIX (probe-side, from the r188 investigator verdict — the
instrument double-count, not a game defect): the startCombat wrapper
counts CALLS; when a committed engine fight is adopted by the policy
census (adoption branch), the record leaves `engineOpen` via
`engineOpen.delete(f)` WITHOUT entering `closedEngineRefs`, so a
re-entrant startCombat on the same live tbfight counts a second open
for the same fight (r188: 89705-A d65 algorithm, 89701-C d122 eulogy).
Fix, in the r194 probe only:
  1. `adoptedEngineRefs` Set, populated at the adoption branch
     (immediately after `engineOpen.delete(f)` on the committed path),
     consulted by the wrapper guard
     (`!engineOpen.has(f) && !closedEngineRefs.has(f) &&
     !adoptedEngineRefs.has(f)`), cleared in closeFightRec alongside
     the closedEngineRefs add.
  2. Distinct-open count: the wrapper also records every counted ref
     in `engineOpenRefs`; the summary emits `engineOpensDistinctW4`
     (the set size) beside the legacy `engineOpensW4` (call count).
     The CENSUS console line and the per-seed `out.push` projection
     carry both.
  3. Analyzer M2c re-scoped (r188 metric-review proposal, adopted
     here): fights == distinct opens (engineOpensDistinctW4 +
     policyOnlyOpensW4), errs == 0. Legacy engineOpensW4 still
     printed for comparability. Fallback: JSONs predating the field
     (r188 corpus) read the legacy count, so the r194 analyzer can
     still score old corpora.
Proof test scripts/test-m2c-adopted-refs-r194.js: runs the r194 probe
in smoke mode on the two r188 double-count configurations (89705 pass
A flags; 89701 pass C flags) and asserts fights == distinct opens and
errs == 0 on both, with engineOpensW4 >= distinct. If the re-entrant
scenario recurs on the new substrate, the test asserts the distinct
rule holds even while the legacy call count exceeds it — that is the
proof the guard works. The open question (why startCombat re-fires
on a live tbfight at all) stays open, NOT a defect claim.

§CORPUS-PURITY (analyzer-side, from the r188 metric review — the
verdict did not exist in the r188 analyzer although the prereg listed
it as gating): projection-based, no log dependency. For each per-seed
JSON in the analyzed dir the analyzer re-derives from the JSON's own
internals and compares against its summary projection:
  - census.n == fightCensus.fights.length; census.outcomes ==
    fights.map(outcome); livingVeterans == veterans.livingVeteranCount
    (when both present); peakLivingVeterans == veterans peak (when
    both present).
  File-set: the dir holds exactly, per seed, `endgame-r194-<seed>.json`
  + `endgame-r194-<seed>-transcript.txt`, and no diagnostic files
  (`*-diag-*`, `probe-*`, `*.tmp`, `*.log` inside the per-seed dir —
  pass logs live outside it).
Verdict CORPUS-PURITY, added to primaryIds (binding, per pass). Proof
test scripts/test-corpus-purity-r194.js: builds a synthetic corpus dir
(two valid r188-shape JSONs + one with a broken projection + one stray
diagnostic file), runs the r194 analyzer against it, asserts
CORPUS-PURITY NO-GO naming the defect; and a clean copy asserting GO.

§PANTRYAFTER LABEL (probe-side, from the r188 instrument footnote):
the per-seed JSON's `result.pantryAfter` echoed the PRE-buy pantry —
`pantryOf(G)` reads `G.state.village.pantryKcal`, which does not
reflect the buy inside the same tick. The r194 probe records BOTH:
`pantryAfter` = computed honest value (pantryBefore − spent when the
buy succeeded and spent != null, else the post-buy read) and
`pantryAfterRead` = the raw post-buy pantryOf read. The analyzer's
STARVATION line keeps its pantry − spent computation as the
cross-check; the CAPSTONE/BUYOUT line's `after${...}` now prints the
honest computed value. No metric change — the label fix only.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the probe
default; this run passes ONLY the pre-registered seeds): 89701 (waves),
89702 (waves), 89703 (waves), 89704 (forcedrift, experimental
ex-control), 89705 (wavesnw). Seed reuse is DELIBERATE (matched
before/after per the r118/r135/r140/r143/r144/r147/r152/r156/r158/r162/
r171/r178/r182/r185/r188 precedent: same seeds, same probe policy,
only the game code changed — and here, only the bot policy on the
frozen arm) — no fresh band is needed or claimed for the pilot.
PASSES, in order (each pass = one probe invocation per seed set,
nohup-detached, log-polled):
- Pass A-live: CAPSTONE unset, BUYOUT unset — matched re-run vs r188
  pass A, live competent.js. Outdir perseed-endgame-r194.
- Pass A-frozen: SAME flags, COMPETENT_PIN=r127 — the (l) A/B. Outdir
  perseed-endgame-r194-frozen. Runs immediately after A-live so the
  comparison is same-day, same-substrate.
- Pass B-live: CAPSTONE=1 BUYOUT=1 — capstone delivery + buy-out,
  matched to r188 pass B, live policy. Outdir
  perseed-endgame-r194-b.
- Pass C-live: CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 — early buy-out,
  matched to r188 pass C, live policy. Outdir
  perseed-endgame-r194-c.
- Pass C-wide (STRETCH): CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1 on 8
  FRESH seeds: 89706, 89707 (wavesnw) + 89708–89713 (waves). Same
  M25c rule as pass C. Outdir perseed-endgame-r194-cwide. Runs only
  if the run window allows; if cut, recorded as CUT, not silently
  dropped.
- Dark probe: FULL re-run, all 7 variants, fresh evidence dir
  perseed-endgame-r194-dark/.
TIME-BOX: passes run sequentially; the cut order if the window closes
is C-wide, then C-live, then B-live. A-live + A-frozen + dark are the
committed core — the run is not complete without them.

R188 PASS-A BASELINE (per-seed, from the r188 run note; judged on
these seeds, pass A-live):
- 89701 waves: sat d90, alive 9, ladder 3/3/66, deedGate never ok
  (w5:1), peakLivingVeterans 3@d87, uw 5 FACED.
- 89702 waves: sat d97, alive 7, ladder 3/3/68, deedGate never ok
  (w5:0), peakLivingVeterans 1@d70, uw 4.
- 89703 waves: sat d105, alive 5, ladder 3/3/45, deedGate never ok
  (w5:0), peakLivingVeterans 0, uw 4.
- 89704 forcedrift (experimental, ex-control): LOST d77, alive 0,
  ladder 3/2/39, deedGate never ok (w5:0), peakLivingVeterans 1, uw 4.
- 89705 wavesnw: sat d90, alive 8, ladder 3/3/86, deedGate never ok
  (w5:1), peakLivingVeterans 3@d90, uw 5 FACED.
Tally r188 pass A: lesser 4/5, full 0/5, village-lost 1/5. Pass B:
lesser 4/5, full 0/5, lost 1/5. Pass C: lesser 3/5, full 1/5 (89705
feast_embassy d79, FULL d80), lost 1/5. C-wide: lesser 6/8, full 0/8,
lost 2/8 (89707 scattered d55, 89713 scattered d82). M25c GO 5/5
matched, 7/8 wide. M2c NO-GO 3/4 (instrument double-count, now
fixed — see §M2c FIX). Dark probe: 1 failed step (v1a-loss:
D2-twist-fired), bit-identical to r171/r178/r182/r185. Starvation
watch: no buy-out starved a village before its seat; Joja price zero
lives on all 13 bought seeds (89710 bought at pantry-after 0, starved
no one).
R185 PASS-A BASELINE (the pre-(l) reference — what A-frozen should
resemble if (l) is the killer):
- 89701: sat d91, alive 7, ladder 3/3/65, deedGate never ok (w5:1),
  peakVets 2@d71, uw 5 FACED.
- 89702: sat d90, alive 7, ladder 3/3/75, deedGate first ok d81
  (w5:4), peakVets 2@d73, uw 5 FACED.
- 89703: sat d132, alive 6, ladder 3/3/65, deedGate never ok (w5:0),
  peakVets 0, uw 4.
- 89704: sat d90, alive 9, ladder 3/3/81, deedGate never ok (w5:1),
  peakVets 2, uw 5 FACED.
- 89705: sat d91, alive 8, ladder 3/3/65, deedGate never ok (w5:0),
  peakVets 2@d87, uw 5.
Tally r185 pass A: lesser 5/5, full 0/5, village-lost 0/5.

R194 QUESTIONS: (1) THE (l) A/B: does A-frozen reproduce r185
(89704 alive d90, 89702 deedGate ok d81 w5:4, 5/5 reach the window)
while A-live reproduces r188 (89704 lost, 89702 w5:0)? If yes, (l)
is confirmed as the delta that killed 89704 and collapsed wave-5
facing; if A-frozen matches A-live instead, (l) is exonerated and a
game delta (c)/(d)/(f) SAY-dedup excluded — those are line-only —
or (h)/(a)/(b)/(e)/(g) is implicated, and the run says which. (2)
pass A-live: does the pilot reproduce r188 modulo the named deltas
(a)–(j)? (3) does the phantom-veteran readiness shape still hold —
89701's veterans alive at the window, deedGate never ok, w5:1? (4)
passes B/C-live: do the full-seat roads reproduce on the new
substrate — tribute on 89702, bundle on 89705 or a new seed? (5)
M2c: does the adoptedRefs guard hold — fights == distinct opens on
every pass, and does the re-entrant scenario recur (legacy call
count > distinct) to prove the guard earned its keep? (6)
CORPUS-PURITY: GO on every pass dir? (7) pantryAfter: does the
computed value now match the analyzer's pantry − spent on every
buy? (8) dark re-verify: re-run the FULL dark probe as r194 (all 7
variants, same policy, fresh evidence dir) and confirm the
v1a-loss:D2-twist-fired step stays the ONLY failure, bit-identical
to r171/r178/r182/r185/r188, and the v3 walk-out still names Amelia
Moon, not Bill Palmer, and D1–D4/D6 still hold. (9) people check: do
the sitting seeds' finales read as people — and if pass B/C sits a
FULL seat, does the full-seat finale read as earned, not a default?
Do the dialogue deltas read clean in the transcripts — the r188
(a)/(b)/(c)/(e) set PLUS this run's new deltas: r192 F1–F5
ledger-aware pools, r193 agency closers, r135 field-ask gate, and
the (h) wave-5 shortfall morning-briefing voice? NOTE (carried):
the r194 per-seed transcripts are SAY-line windows (announce →
end); conversation-turn dialogue is not captured in them, so
pool-picker deltas that live in conversation turns may again be
unexercised here — that is a corpus gap, recorded, not a clean
verdict. (10) the diag-layer staleness blank (§BLANK below) —
STRETCH, attempted after the passes. (11) the fast-branch
diedInFight gap from r171 — NOT recurred in r182/r185/r188; watch
the corpus for a fastW4 scholar-death fight. (12) M2b: GREEN from
r182, no re-sweep — carried as proven.

§BLANK — fullseat-diag ladder decomposition (r158, carried through
r188): the diag decomposes the full seat with the PRE-LADDER gate:
BARS = deed bars only (w1>=5, w2>=5, w3>=4, w4>=3, w5>=2, contests>=3,
crises>=3, stage>=2, foodDeeds). But table.js now prices full only
when deedGateReady().ok AND ladderPeakStage >= 3 AND a capstone is
delivered (table.js:121). A village meeting every deed bar but lacking
peak-3 or a capstone reads distance-0 (full) in the diag while the
real gate says lesser. STRETCH this run: extend the diag's reach/dist
to include ladderPeakStage (bar 3) and capstoneDelivered (bool), read
from the engine's own ladder reads (the same reads table.js uses),
recorded per run at run end and at the win; pure-read contract kept
(writes nothing, draws no RNG, byte-identical when FULLSEAT unset —
the proof's DET gate pins that). Proof test with a DET gate + a
scenario where deed bars are met but ladder halves are not (dist > 0,
missing halves named). The fix lands ONLY after the measurement
passes are scored (the diag is policy-side and the probe enables
FULLSEAT=1, but the layer is pure-read so trajectories cannot move —
the ordering is for corpus comparability, not safety). If the fix
proves out of scope mid-run, it is documented, not forced. NOTE from
r188: NEITHER fullseat probe captures ladder peak or capstone at all —
the fix needs new probe-side capture wiring (the engine reads exist:
table.js prices full only when deedGateReady().ok &&
ladderPeakStage() >= 3 && ladderCapstoneDelivered()), plus a fresh
census run to prove it. The endgame analyzer's own M10 gap
decomposition IS already ladder-aware (ladderPeak + capstone named),
so the stale layer is the sim-fullseat-a census diag only.

INTERESTING FINDING (what would count): any pass-A-live-vs-r188
headline difference other than the named deltas; an A-frozen-vs-A-live
headline difference (the (l) verdict either way — name the seed, the
day, the cause, the delta); a village dying before d90 on either arm
(survival collapse — name the seed, the day, the cause, the arm); a
readiness flip caused ONLY by the deltas (a)–(j); a full seat on a new
seed or a lost full seat on 89705; a scholar+1 village reading ready
with an honest named refusal (M24b GO) or a silent skip (M24b FAIL
LOUDLY); an early buy-out that fires (pantry, day, spent,
pantry-after named per seed); an early buy-out that starves the
village before the seat (the Joja price in lives); a tribute delivery
with veterans paid (the tribute road reopening); a wave-5 kill on a
previously w5:0 seed; a capstone delivery that refuses despite
readiness (leg-3 agreement failure — now counted only as
refused-despite-ready); a delivered capstone that does NOT price the
full seat (tableSeat/capstone wiring failure); a bought bundle that
does NOT flip feast_embassy to ready (bundle-flag wiring failure); a
pantry that never reaches 8000 in-window on any seed (the Joja path
priced out of bot reach); a pellet lock recurring (regression, FAIL
LOUDLY in chat); a rads death with no voicing; a cure that fires with
no voicing (medic duty silent); a ladder shortfall line that names the
OLD feast bar or stays silent where the ladder bar is the blocker; a
bundle completing in the wild with the +4 not landing in the counted
points; any mFlee carrying monFled=true on a non-flee kind
(monster-commitment violation); any hurt-return misfire; any ambush
death missing from fallen; any dark re-verify (v3) step failing; any
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
(finalvoice fix (b) not holding); the (h) wave-5 shortfall voice
missing from morning briefings where the shortfall is real (the
voiceless-a build not firing); the diag fix's proof scenario failing
(the blank stays open, documented with the failing shape); a
CORPUS-PURITY NO-GO on any pass (instrument failure, investigate
before trusting that pass's verdicts).

BINDINGS (pilot-scaled from r188; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal /
  survived — r156 revision). Judged on pass A-live AND pass A-frozen
  separately; passes B/C/C-wide reported alongside.
- M2-census: every census fight carries a named outcome; >=2/3 Arm A
  waves seeds record >=1 committed wave-4 fight.
- M2c/M2d: uncommitted classification complete (as r188). M2c
  RE-SCOPED this run: fights == DISTINCT opens (see §M2c FIX).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing or a
  named fallback; 89704 is experimental (r156 prereg) — the
  fallback/vacuous reading applies to the forcedrift seed's relay
  voicing, not to a control comparison.
- M10-fullseat-gap: every sitting seed's full-seat gap is named (r130
  revised rule: seat-kind pass — lesser despite full bars met is a
  named gap, not NO-GO). THIS RUN: a sitting seed whose only missing
  full-seat piece is the capstone passes M10 with the gap named
  "capstone not delivered (pass A: no delivery policy)" or "capstone:
  <kind> delivered d<day>" (pass B/C), or "buy-out: pantry <8000
  in-window" where the Joja path was the blocker, or "scholar+1:
  readiness counts the scholar, delivery refuses" where M24b applies.
- M11-standing-peak: standing peak reported for 5/5 seeds.
- FIRENARR/HURTRETURN-captured: every pilot JSON carries firenarr +
  hurtreturn arrays (instrument health; counts descriptive).
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check.
- CORPUS-PURITY (binding, per pass — NEW this run, see §CORPUS-PURITY):
  per-seed JSON summary projections match the JSON's own internals
  seed-for-seed; zero diagnostic files in the pass dir. Judged per
  pass (A-live, A-frozen, B, C and C-wide each pure).
- L-PEAK: every pilot JSON carries ladderSnapshot (stage, peak,
  counted, byTrack, bundleStages, capstone) and the analyzer prints
  the LADDER section for 5/5 seeds.
- L-VOICE (descriptive-not-binding): seat-shortfall lines in pilot
  transcripts are counted for ladder naming (ladderLine text present
  when the ladder bar blocks) vs silence/old-feast naming. A shortfall
  that names the OLD feast bar is a same-run investigation item.
- M21-audit-crosscheck (REVISED — full-seat exemption): for a sat
  seed with satSeatKind 'full', pass iff satWaves meets the deed bars
  (w1>=5, w2>=5, w3>=4, w4>=3, w5>=2); the audit-line parse is skipped
  for that seed. Lesser seats keep the parse rule (audit numbers match
  satWaves exactly). GO iff every sat seed passes its rule.
- M23-CAPSTONE (REVISED — refusals-despite-ready only, binding, pass
  B and C, as r188): for every pass-B/C seed where deedGateReady().ok
  is true AND ladder peak >= 3 at any daily read, the probe records a
  delivery attempt and, if a capstone kind reads ready, a successful
  delivery with the kind and price named. GO iff attempts == deliveries
  on all such seeds counting ONLY refusals-despite-ready (reason !==
  'none-ready') as failures AND tableSeat() prices 'full' on at least
  one seed where delivery succeeded and the seat was subsequently
  offered. NO-GO names the failing seed and the exact refusal/pricing
  gap. If NO pass-B/C seed ever reaches deedGateReady().ok && peak >=
  3, M23 is VACUOUS (recorded as such, not GO — the full-seat question
  stays unanswered and the blocking deed bar is named per seed).
- M24-TRIBUTE-AGREEMENT (revised A2, binding, pass B and C): if
  military_tribute is delivered, the delivery paid exactly `need`
  veterans AND readiness at delivery was >= need (readiness counts the
  scholar per the fix; payable is non-scholar). GO iff equal on every
  tribute delivery; vacuous if no tribute delivery fires.
- M24b-SCHOLAR-PLUS-ONE (binding, pass B and C): if any seed reaches
  deedGate ok AND peak >= 3 with readiness >= need but payable
  (non-scholar) < need, the probe records a delivery refusal whose
  reason names the scholar-counted shortfall. GO iff every such seed
  carries the named refusal; VACUOUS if no such seed. A silent skip
  fails LOUDLY.
- M25-BUYOUT: DROPPED from the printed set (r185 revision).
- M25c-BUYOUT-EARLY (PRIMARY, binding, pass C and C-wide): for every
  pass-C/C-wide seed where the daily snapshot (peak >= 3 AND no bundle
  done) shows pantryKcal >= 8000 AND the scholar at Haven, the probe
  records a buy-out attempt that day. GO iff attempts cover every such
  day (no silent skip) AND every attempt result is recorded with
  ok/why/spent. VACUOUS if no such day on any seed. A buy-out that
  starves the village before the seat is recorded per seed with
  pantry-after and starvation deaths named — a finding, not a metric
  miss.
- M3-conversion: RETIRED as a verdict (r188) — printed as a
  descriptive tally only. NOT in PRIMARY, NOT in ALL, NOT gated.
- M2b-attribution: GREEN from r182, no re-sweep (carried as proven).
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  w5kills count, full-seat count, lesser-sit count, ladder peak
  stages, capstone deliveries by kind, buy-outs by seed and pass.
  M3-conversion, M4-wave5-or-full, W5-question NO-GO on a closed road
  are the r135 tallies, kept per pass.

METRIC REVIEW (to be filled at closeout; §14 — a metric that proves
wrong is revised for the NEXT run, never re-scored here):
- M2c: re-scoped to distinct opens this run (r188 metric-review
  proposal, adopted in this prereg).
- CORPUS-PURITY: added as a binding verdict this run (r188
  metric-review proposal, adopted here).
- M3: retired as a verdict (r188 metric-review proposal).
- Telemetry baseline: re-seeded as same-regime SUMS in r188 (uw 22,
  won 4, peakVet 8); the "per-seed means" half of the r185 proposal
  still needs a telemetry-check.js --means mode — the baseline note
  records the means alongside the sums and restricts comparison to
  same-size panels. This run compares pass-A-live against the r188
  baseline (same 5 seeds, same regime, live policy); the A-frozen
  arm is compared against the r185 panel descriptively, NOT against
  the r188 baseline (different policy — the baseline's regime note
  covers only the live policy).
- M24b: kept from r188; if vacuous again, the next run keeps it (the
  scholar+1 shape is the live agreement question until a seed
  exercises it).
- M2b: kept from r171; GREEN from r182, no re-sweep.
- The r177 smoke-bar revision proposal (5 headline numbers +
  MANTLE-FINE + trapline + selfReq 0, not full-file byte-identity) is
  a succession-leg proposal; it does not touch this leg's bars.
