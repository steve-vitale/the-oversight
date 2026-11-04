# Journey endgame r131 — run note (lane B, 2026-11-04 15:00 CST)

Leg 4 (endgame). Rotation-b read 4 at run start; 5 is written at
closeout ONLY after a verified landing (this run: see closeout
section). Prereg:
evidence/2026-11-04/journey-endgame-r131-prereg.md (written before
any play). Slug: journey2-endgame (bare-slug reuse recorded in the
prereg: r120's tree was salvaged + removed 05:11 CST, no journey2-*
directory existed at registration; registry owner verified).

## Run-start pre-flight (all PASS)

- Overlap guard: no playtest-loop-2.lock at run start. Lock created
  by this run 2026-11-04T20:55:39Z. No stale-lock recovery needed.
- Main tree: `git status --short` 0 lines, `git pull --ff-only`
  already up to date, master 96ee2136a (r130 closeout). Disk 30%
  (fail line 85%).
- Reaper: nothing removed; active 12/16. Preserved, never touched:
  the journey2-succession registry phantom (done-merged, path
  gone), locked sim-awayrationfix-b (reason: initializing), and
  sibling dirty trees (sim-sortie-a, sim-awayration2-b,
  sim-streakfree-b, sim-fleerepair-a, sim-fracchoice-b,
  sim-tendfloor-guard-b, sim-rolecensus, journey-deepening).
- Worktree registration slow (~6 min, git reset --hard in D state
  under sibling I/O — same pattern as r128/r130); heartbeat
  verified by REGISTRY.json read-back (21:04:13Z, then 21:14:13Z),
  standing loop beats every 600s (loop log is NOT proof; registry
  read-back is).

## Substrate + HEAD delta (read before judging any flip)

Probe: scripts/probe-endgame-r131-20261104.js (r130 probe verbatim
EXCEPT renames r130->r131, evidence dir
2026-11-04/perseed-endgame-r131, header). Analyzer:
scripts/analyze-endgame-r131-20261104.js (r130 analyzer verbatim
EXCEPT input dir, r130->r131). Substrate r130-exact: FULLSEAT=1,
VETCOMMIT=1, CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1,
TELEMETRY_FULL=1, RELAYGREY=1, 180d, death-aware (+10d tail max).
Gating freeze (Steve 2026-10-27 16:53) stands: no seat/gate/price/
deed change in this run.

HEAD DELTA SINCE r130 PILOT BASE (a32735f13 -> 96ee2136a, src
only, verified by git diff --stat): src/js/table.js, 2 lines —
the r130 tooths->teeth grammar fix. Everything else in range is
evidence/tooling. This pilot is therefore a REPRODUCTION check
under a narration-only delta, same framing as r124.

RUN ERROR, OWNED (method, not measurement): the pilot command
omitted the SEEDS env override, so the probe ran its default
7-seed list (89701-89707) instead of the 4 pre-registered pilot
seeds. Handling, disclosed: the pilot is judged ONLY on the 4
pre-registered seeds (89701/89702/89704/89705) — the analyzer was
run on a pilot-4-only copy of the corpus (same analyzer code,
DIR repointed to /tmp, disclosed here) — and the extra 3 seeds
(89703/89706/89707) are reported DESCRIPTIVELY ONLY, never scored
against pilot bars. The full 7-seed analyzer output is also kept
(journey-endgame-r131-analyzer-7seed.log) so the discrepancy is
auditable. No file was moved or deleted to fit a bar.

## Pilot results (r131 vs r130 pilot — EXACT reproduction)

Analyzer (pilot-4) exit 1 on the road tallies ONLY (see bindings).
Pilot log exit 0. Per-seed transcripts are BYTE-IDENTICAL to r130
except the header line (verified by diff on all 4 seeds).

| seed | r130 pilot | r131 pilot |
|---|---|---|
| 89701 waves | ann d90, sat d92, WON LESSER (feared/light, final:mercy), 5 fights, uw4, standing 199, peakVet 1@d91, alive 9 | IDENTICAL: same days/seat/final, same 5 fight outcomes in order, uw4, 199, peakVet 1, alive 9, fullseat object equal, w5faces none, firenarr 0, hurtreturn 2 |
| 89702 waves | NO window, end survived, uw4, standing 199, 21 fights, 3 kills, peakVet 2@d88 (end 0), alive 2 | IDENTICAL: same window/end, same 21 fight outcomes in order, uw4, 199, peakVet 2, alive 2, firenarr 5, hurtreturn 1 |
| 89704 forcedrift | village-lost (no-successor d45), uw3, standing 0, 0 fights, alive 0 | IDENTICAL, firenarr 2, hurtreturn 0 |
| 89705 wavesnw | village-lost (scattering d110, third hungry day), uw3, standing 99, 0 fights, alive 1 | IDENTICAL, firenarr 7, hurtreturn 3 |

Road tally, pilot-4: lesser wins 1/4 (r130: 1/4), uw5 0/4, full-seat
0/4, village-lost 2/4, survived 1/4. No "tooths" line anywhere in
the pilot transcripts and no war-path remainder fired in the pilot
(the sitting seed won mercy), so the teeth fix is NOT live-
confirmed by this pilot — it stands on r130's proof test (6/6),
not on pilot text. The pilot does confirm zero regression of the
kind: no "tooths" text survived anywhere in the corpus.

Extra seeds, DESCRIPTIVE ONLY (not pilot, not scored): 89703
waves — village-lost, scattering d41 (fifth hungry day), uw3,
standing 45, alive 5, 0 fights; 89706 wavesnw — village-lost,
scattering d23 (third hungry day), uw2, standing 0, alive 7, 0
fights; 89707 wavesnw — village-lost, uw3, standing 0, alive 1, 0
fights. 7-seed tally: lesser 1/7, uw5 0/7, full 0/7, village-lost
5/7, survived 1/7. The extra wavesnw seeds collapse the same way
as 89705 (scattering on a hungry day, 0 fights) — a descriptive
pattern, not a pilot verdict.

## Bindings (prereg, pilot-4 — the judge)

- M1-guard: GO 3/4 (89701 announced d90; 89704/89705 honest-death;
  89702 no-window-no-voice).
- M2-census: GO — armA-with-fights 2/3, all outcomes named, 0
  errors (89701 n=5, 89702 n=21, 89705 n=0).
- M2c-engine-coverage: GO 3/3 (fights == opens, 0 errors).
- M2d-gate-named: GO 13/13 uncommitted classified (12
  never-observed, 1 gate:veterans-met on 89702 d100 reunion vDie).
- M2b-attribution: GO 1/1 (89702 d100 Ines Duarte, the wild).
- M8-exit-canon: GO 6 mFlee matched to codex slain stage.
- MFLEE-routed-coverage: GO 6/6, all gotAway-only. Zero
  monFled=true on any kind: NO monster-commitment violation.
- KILL-ANATOMY-coverage: GO 26/26 multi-turn fights.
- M5-voicing-canonical: GO via the r124 vacuous rule (control dead
  before window, no relay final in block).
- M5b-relay-branch: GO vacuous. M6-guard-named-deferred: GO 1/1
  (89701 guard: "Finish the current encounter before taking your
  seat."). M10-fullseat-gap: GO 1/1 (89701 gap w5:0/2, r130 revised
  seat-kind rule). M11-standing-peak: GO 3/3 reported, 0 at 200+
  (199/199/99). M12/M13/M14/M15/M16/M17/M18/M19/M20/M21/M22, REG
  r35/r37, VETCONV-recon, SECOND-VETERAN-coverage: all GO per the
  analyzer log.
- FIRENARR-captured: GO 4/4 JSONs carry firenarr arrays (14 lines
  total: 89701 0, 89702 5, 89704 2, 89705 7). Counts descriptive;
  r124's sense bar (0 on a fed village is correct) still applies.
- HURTRETURN-captured: GO 4/4 (6 lines total). FALLEN-ambush: GO
  4/4 (89701: 1 ambush death in fallen; 89704: 1 — the r125 fix
  holds).
- CORPUS-PURITY: GO — pilot JSON summaries match pilot log
  summaries seed-for-seed; zero diagnostic files in the pilot dir
  (no diagnostics were run this run).
- ROAD-TALLY (not gated): M3-conversion, M4-wave5-or-full,
  W5-question NO-GO are the expected closed-road reading (same as
  r121/r124/r128/r130), not pilot failures. The analyzer's PRIMARY
  NO-GO is driven by those tally ids sitting in its primary list
  (see metric review — r124's proposal still unapplied).

## Village assessment (plain words)

Transcripts byte-identical to r130 except headers, so the
assessments carry over verbatim in substance (verified on the
compared fields, not re-invented):

- 89701's village won the lesser seat the hard way and came home
  with 9 alive: a feast-surged party put down a Reunion, banked one
  veteran (Jesse, d91), and sat at day 92. Only 5 villagers died
  along the way; the pantry ended full. The table priced it global
  but still 0 of 2 wave-5 kinds — the full seat stayed out on the
  wave-5 bar alone.
- 89702's village survived but never reached the table: 21 fights,
  3 kills, standing 199, two veterans banked at day 88 — then Ines
  died in the wild at day 100 and the pair broke. Two people were
  alive at the end, the pantry empty, the table never announced.
- 89704's village died quietly: no fights, no table, 12 dead by
  day 46, and no one left to pick up the Codex. A control that
  proves the drift road dies without a table.
- 89705's village scattered: it never feasted, never fought a
  wave-4 battle, and walked away in different directions on the
  third hungry day. First deaths d13/d14; the collapse is attrition
  (monster, experiment, starvation, wounds, contest, sickness),
  not a table failure.
- Extra seeds (descriptive): 89703 scattered on the fifth hungry
  day with 5 alive; 89706 scattered on the third hungry day with 7
  alive; 89707 died out with 1 alive. All three fought 0 fights —
  villages that never got going, same shape as 89705.

## People check (transcripts read, sense judgment)

PASS, on a fresh read of the 89701 finale in this run's own file
(the full transcript is byte-identical to r130's, so r130's
full-read judgment carries over to identical text; this run
re-read the table/audit/final passages rather than pretending a
fresh full read of unchanged lines). The audit reads the run back
honestly (lesser seat, waves 1–3 faced 15/12/8, 4 wave-4 fought, 8
contests, 5 crises); the full-seat gap is named (0 of 2 wave-5);
feared/light voicing matches TABLE.md's light definition
(protected outnumber the killed; food truth shared; promises kept
— "the light road is open"); the mercy final + pod coda close
without contradicting the win; ascensions name real villagers
(Jorge Silva via relay; Marcus Webb + Jorge Silva pantheon
politics: "gods, it turns out, have politics... Mostly, they agree:
the village comes first."). The finale reads as a finale, not a
menu.

Polish items, all RECURRING (checked in r131 files):
1. Turncoat verbatim repetition — CONFIRMED, then FIXED this run
   (see Blanks): 5 identical lines in the 89701 Reunion fight.
2. Keepsake verbatim repetition — RECURS: 89702 holds the Photo
   album 78 times with the identical line ("...missing tooth...
   Your gifts are not mastered — but they are lived-in... The
   feast was the weapon."). 89701's holds (Trail compass, Dog tags,
   harmonica, headset) carry the same tail. This is the hold
   action's item text, repeated per hold — a policy-hold frequency
   question as much as a text question; documented, not forced.
3. "Later drafts" vague remainder — RECURS (89701 finale: "1 more
   of the later drafts faced besides"). Documented, not redesigned
   (r130 judgment stands: naming them is a beat change).
4. Scout ping-pong — MECHANISM NAMED this run (see below); the
   lines themselves are honest handover speech, not a bug.
5. Teeth fix — NOT live-confirmed by this pilot (no war-path
   remainder fired); stands on r130's proof test.

## Investigations (read-only first; mechanisms named)

(a) SCOUT PING-PONG (r130 open item — NAMED, not a game bug):
In the r130 nohurt-89702 transcript, "Nora nods, stepping back.
'Scout is yours now.'" (to Wanjiru) is followed immediately by
"Wanjiru nods, stepping back. 'Scout is yours now.'" (back to
Nora), with no stated reason, right before the table. Code read:
party-formal.js assignRole() enforces one-of-each (the holder
steps back, spoken) and its ONLY game-code caller is the rolepick
conversation choice (party-formal.js:803; the r117 handover
capture). So both lines are two rolepick picks in sequence — the
sim policy picked Scout for Wanjiru, then picked Scout for Nora —
and the single-role rule worked exactly as designed, voiced both
times. The robotic read is the policy picking the same best role
twice with no voiced reason, not a role-system defect. No game
fix: the picker's reason lives in policy, not in game code, and
the handover speech is honest. Documented, closed as a game item.

(b) 89705 "EXPERIMENT" DEATHS (r130 open item — NAMED): 89705
deathRecords carry 4 cause='experiment' deaths by d58 (Feng d40,
Lizelle d42, Sami d55, Farid d58; no monsters, not in a fight).
Code read: game.js villagerExperimentBeat() — the village
experiments on its own once per day, a Haven villager with food in
their background (score-picked, "a little randomness") runs the
cautious protocol on an unknown plant lump or unknown raw meat,
and on an 'avoid' plant the tester takes hurtVillager(tester, 10,
'experiment') (15 for toxic meat). There is NO HP guard in the
tester selection: a wounded or starving tester can be killed by
the 10/15 damage, and the death is recorded with cause
'experiment'. In collapsing 89705 that is exactly what the record
shows. This is the system working as written ("real (small) risk"
per its own comment) at the edge where small stops being small —
not a misfire, and not a silent fix: whether the autonomous beat
should skip low-HP testers is a design call (desperate tasting is
arguably part of a collapse story), recorded here for a next
build, not changed in this run.

## Blanks filled / documented

- FILLED (code, proof-tested, narration-only): Turncoat opener
  rotation (src/js/abilityActions.js, 'turncoat.persuade'). The
  opener now rotates per fight over 3 variants (original line
  first); mechanics untouched — same two targets, same 2 rounds,
  same mechanical tail. The counter lives on the fight object, so
  no RNG stream is consumed (future reproduction runs are not
  perturbed) and a fresh fight restarts at the first opener.
  Proof test scripts/test-turncoat-lines-r131.js: RED before the
  fix (5 pass / 2 fail — the two variation checks), GREEN after
  (7/7). Adjacent suite test-ability-actions-20261007.js: 22/22.
  No test previously asserted the exact Turncoat line. The
  godpath twin Turncoat line (godpath.js:1223, villager voice)
  is a separate single string and was NOT changed — same class,
  rarer fire, left for a follow-up, not hidden.
- DOCUMENTED, NOT FIXED (carried): keepsake verbatim repetition;
  "later drafts" vague remainder; experiment-death HP-guard design
  question; hurthome lever verdict (sensitivity finding only,
  n=1, per r130); telemetry baseline re-seed (panel decision).
- JUDGEMENTS (leg 4, from r131 pilot + investigations):
  REACHABLE — the lesser seat is reached on the sitting seed and
  the road reproduces exactly under a narration-only delta; the
  table, audit, and final choice all fire. FUN — the sitting
  finale reads as a real finale; the carried caveat is the
  dissolve/scatter shape on the non-sitting seeds (villages that
  never get going), now seen on 5 of 7 seeds descriptively.
  WINNABLE — lesser yes; FULL no in the pilot (wave-5 bar 0/2 on
  the sitting seed; second-veteran bar broken on 89702). No gate
  was touched.

## Telemetry deviation check

- Command: `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/endgame.json --current
  'evidence/2026-11-04/perseed-endgame-r131/endgame-r131-*.json'
  --metrics veterans.unlockedWave,won,peakLivingVeterans` (7 files:
  the tool scans the whole dir, including the 3 descriptive seeds).
- Result: QUIET, exit 0. Pilot-4 sums match r130 exactly (uw 14,
  won 1, peakVet 3). Baseline NOT rolled (r130 verdict stands:
  the regime changed with the ability-use landing, and quiet is
  not a reason to re-seed; the r121 sums stay as the pre-landing
  reference until a post-landing panel decision exists).

## Metric review (§14 — proposals for the NEXT run, not this run's scoring)

- PRIMARY-tally (r124 proposal, STILL unapplied): the analyzer's
  PRIMARY NO-GO is driven by M3-conversion, M4-wave5-or-full, and
  W5-question sitting in primaryIds even though the prereg judges
  them as tallies. Either remove the tally ids from primaryIds
  (PRIMARY then judges only bindings) or print PRIMARY as
  bindings-only beside ALL. Do not re-score this run either way —
  its tally reading stands. Third run carrying this proposal; it
  needs an owner, not another restatement.
- SEEDS-env (this run's method fix, adopted for the next run):
  the probe's default list is 7 seeds; a pilot run MUST pass
  SEEDS=89701,89702,89704,89705 explicitly (r130 did; r131 forgot).
  The pilot-4 subset analysis used here is disclosed and sound,
  but the next run should not need it.
- M5 vacuous rule worked again (control-dead + zero relay finals
  = INFO/vacuous). Keep it. M1 pilot bar (>=3) worked on both the
  pilot-4 and the 7-seed read. Keep it.
- SIT-DAY-DEATHS dedupe (r124 proposal): the r131 pilot has no
  sit-day deaths (89701 sat d92, none), so the dedupe proposal is
  unexercised this run; it stays open until a sitting seed with a
  sit-day death recurs.

## Regression suite

- `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-playtest2` in the worktree →
  284 passed, 6 failed in 923s (log
  hidden_files/journey-endgame-r131-checkquick.log). The 6 are
  exactly the standing families from r124/r130, no extras this
  time (r124 had 3 additional contention/timeout extras; this run
  had none — capable-bot, trust-observer-neutrality, and the table
  suites all passed): measurement-proof-update,
  measurement-workflow (retained neutrality proof),
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20-fixes (racks-full voice gate). This run changed
  one src file (abilityActions.js narration) and added one proof
  test; no new failure is attributable to it. The standing 6 are
  carried, not fixed, by this run.

## Infra notes (loud, for the next run)

- Registration slowness is now the norm under sibling load (~6
  min, D-state git reset --hard); heartbeat registry read-back is
  the only proof that counts (loop log alone is not).
- The r131 pilot ran 7 seeds by an omitted SEEDS env (see above);
  the pilot verdict is the disclosed pilot-4 subset, the extra 3
  are descriptive only.
- Bare slug journey2-endgame was free and is this run's tree (see
  prereg); release must remove exactly this tree/branch.
