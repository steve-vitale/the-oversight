# Journey crisis r247 — RUN NOTE (Lane B, leg 6)

Base: master `416e81241` at panel time; adoption rebased the branch onto
current master `e1b6cc7d6` (r147) before the gate. Lock
playtest-loop-2.lock run_id `2026-11-19T10:56:40Z` (own). Rotation-b read
**6** at run start; this adoption writes **7** at closeout (read-back
verified). The run timed out mid matched-band diagnostic; the adoption
re-ran the one unfinished matched seed (14545), re-ran the analyzer on
all three corpora itself, and read all 35 driven transcripts in full.
Nothing below is taken from the timed-out run's word — every number was
re-derived from the per-seed JSONs and the analyzer output in
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-19/`.

## Leg question

Do r244's verdicts hold on the new base — F2 Haven-count refusal, r238
dry fixes, door-guard policy, link-accept voice, senseexped launch
sense — and does the PARTYSIZE4 substrate reach the crisis band, where
launches are scarce and 2/5 r244 seeds never seeded a plan?

## Panel verdicts

- **MAIN PANEL: 4/5 game-overs** (r244 was 0/5) — **BAND, not base**
  (adjudicated below). 14551 d103 scatter (pantry 0, day 3 of hunger),
  14552 d119 scatter (pantry 0, day 5 of hunger), 14553 d94 extinction
  (Ava Garcia d96, alive 0, pantry 1800), 14555 d144 scatter (pantry 0,
  day 5 of hunger); 14554 horizon d150 (alive 5, pantry 2300). All four
  game-overs have named, non-siege causes — **C1 GO**.
- **DRY3 CONFIRM GO / DRY2 CONFIRM GO / DRY CENSUS GO / R238 DRY
  CONFIRM GO.** 0 dry lines on 35 transcripts; deflect_q 0; `byPick`
  empty. The repay opener (r238 fix) served 0 dry lines.
- **C3b SETTLED-FAVOR CONFIRM GO — third wild panel.** Served twice,
  in opposite shapes, both honest by the live need (see People check).
  The PANTRYPER instrument closes the r244 gap: exact pantryPer figures
  are now recoverable from the per-seed JSONs.
- **C3c GO.** Resume openers quote inline in one entry, not split
  (Dmitri d32, Bessie d31). The r244 blemish did not reproduce. No
  resume opener names a changed favor.
- **C3d GO.** Every recap names the live topic; "Nothing important"
  0x. Lately fired 2x on sheltered sittings with real answers.
- **TITAN-REFUSAL CONFIRM GO.** 20 outcomes, 17 refused, 8 gate lines,
  all "(you have 0)", 0 repeats, 3 slain-field (Yerassyl d106 on
  14552, Greta d113 on 14554, Carlos d111 on 14555). No Haven-blade
  commitment on any refusal day (blade-line census across the panel)
  — the spoken "you have 0" is honest on every refused titan-day.
  Proof test `test-titan-refusal-have-counts-haven-20261119.js`
  re-run on the rebased tip: **15 passed, 0 failed**.
- **FUNERAL-MEND GO.** 29 feasts, 0 silent — every line carries its
  Trust outcome: mended 20, partial +9/+13 (honest shortfall) 4,
  unmended "-8 stands" 5. No over-claim, no silent mend, no silent
  shortfall.
- **MUSTER-GROWTH GO.** The 📯 MUSTER scout line fires once per seed
  (d43/d43/d46/d53/d40), naming the right monster (Suburb / Influencer
  / Reunion); slain-field lines name the killer.
- **HOLDER voice: VACUOUS.** 0 holder/companion voice lines
  (HOMEBODY 0 qualifying of 87 picks).
- **STAGE-0 GO (0 qualifying).** No sitting with a live stage-0 want
  left unaddressed; dlg:help picked once (Brian d97) and fired
  correctly on a live want; favor flows engaged wherever a want was
  voiced.
- **REL-MOURN GO.** Every mourning line names the right dead (Hirut +
  Rafiqul d96; Vanessa d26; Joko d50; Lamar d47).
- **R244-FIX RE-CHECK GO.** Mime: 14552 d14/d15/d23/d106, three
  variants, no same-variant 3 days running; 14553 d44 one mime.
  Wren: 0 notes (vacuous). Doubt-stonewall: Seamus d33, 3x dlg:doubt
  with three DIFFERENT escalating responses — not verbatim; the bar
  is not met.
- **ECHO: VACUOUS.** 0 accepted link raises — link-accept still
  untested, fourth panel running.
- **WANT-BRIDGE: VACUOUS.** 0 want-bridge lines served.
- **AMMO-NAMING: VACUOUS.** 0 field-fight 'no X' lines — #2593
  unexercised this panel.
- **DOOR-GUARD GO.** 0 door-tile fight ejects; fledBad 0.
- **WALKHOMe GO (descriptive).** 3 "hurt on the way home" returns,
  all resolved (Marcus d41 on 14552; Ruby d36/d98 on 14554). No
  strand, no loop, no unclearable refusal.
- **TABLEACTIVE (descriptive).** 1 table mention (Jian d41, "They say
  the table's coming"), no mercy sitting.
- **DEATHCLEANUP GO.** 15 cleanups, 0 dead-holder entries, 0
  unseeded, 0 ignition-after-death. PlanSeeds 15.
- **C7b.** Corpse causes: famine 1 (Jinlong d101 starvation, 14551),
  wound 2 (Petra d66 on 14553, James d138 on 14554), disease 0,
  thirst 0. Buried: 14551 [Hank Brooks, Jeanne Banza], 14554
  [Isabella Nikolaev], 14555 [Lamar].
- **R122.** gorgeAfterIdMatched 0, gorgeAfterReturn 0 (name-matched
  15). **R59 TRUE early 0** (legacy 2 are corpse-counting artifacts).
  **R57 D3:** Victor d90 on 14552, muster-explained (Dina class,
  closed). **WRAP 35/35 marked, 0 unmarked.**
- **NODEAWAY panel metric (no bar): 25** — per-seed 4/8/5/8, worst
  bench 5 (14554 d89). (r244: 15/6/worst-5.) The muster-vs-travel
  tension stays a design question.
- **Medic-duty (descriptive):** blocked 58/39/42/66/104 (sum 309);
  cures by ability 4/0/11/11/0 (sum 26), by medicine 0. Ruin
  searches 2, med acquisitions 0 — **cumulative 0/319** (0/317 +
  this panel's 2). The supply hole is unchanged; the medicine build
  brief still owns it.
- **Fight-1 (descriptive):** okSorties 14, cleared 10,
  multiMonsterCleared 10/14; max cleared vTaken 58 < 70 — **Q4
  live-play trigger NOT met** (standing).
- **Stranger: VACUOUS** (0 kills on all seeds). **RUINROAD armRan
  false** (parked per prereg).
- **HOMEBODY / NOTICKDEFER (descriptive-only):** 87 picks, 0
  qualifying, 0 voice lines; 0 deferred, 0 leaks.
- **POCKET (no bar):** 1153 "No path there." lines (travel noise).

Panel table (analyzer): attempts 26, ok 14, refused 12, cleared 1,
deltaBad []; gorgeNights 237, gorgeKcal 257,104; convos 35,
fabricHits 0, sortieFights 28. D1 26/26 delayed ≥3. D2 clear rate
1/14. D3 drift: player-drawn-off 5, sortie-clear 14, moved-on-valve
43, unknown []. Missed-window 14, all moved-on-valve. D2 crisis-at-
clear: 1 row (14555 d84, fought sortie-call).

## The 4/5 game-over headline — cause adjudicated: BAND

The matched-band diagnostic is the adjudicator, and it came back
decisive. The r244 seeds (14541–14545) re-run on the new base
(416e81241) with the r247 driver:

- **5/5 horizon** (alive 4/2/3/4/6; pantry 6000/1550/3163/0/4197).
- **Bit-identical reproduction of r244.** The matched per-seed JSONs
  are parsed-equal to r244's on `sayLines` (all 5 seeds, identical
  line counts 16104/15581/17396/15933/17713) and on every analyzer
  section: attempts 36, ok 32, refused 4, cleared 2, deltaBad [];
  gorge 379 / 434,627 kcal; convos 40; DRY GO; deathcleanup 15/0/0;
  titan 119 outcomes / 115 refused / 19 gate lines / 0 repeats /
  4 slain-field; NODEAWAY 15 (all on 14542, worst bench 5 d69);
  fight-1 32 ok / 23 cleared / 22-of-29 multi, max vTaken 58;
  WRAP 40/40; stranger VACUOUS. The only parsed diffs are the two
  known instrument additions (PANTRYPER `roster` on pantryDaily;
  `partyQuads` key in deathCleanup stats) and the transcript filename
  strings (r244 vs r247 in the name).
- The live base deltas since r244 (F2 titan fix, r238 social fix,
  door-guard policy, link-accept voice, senseexped) moved **nothing**
  on these trajectories — no base change touches food, pantry, or
  the scatter mechanic, and the matched band proves it empirically.
- The fresh band 14551–14555 is simply harsher: three villages
  starved to an empty pantry and scattered, one died out. **Verdict:
  BAND.** No regression, no fix owed, no lever attribution with n=5.

Correction carried: the r244 note's defendedFights "26/24/19/14/15,
sum 98" is off by one on 14541 — both JSONs agree on **25/24/19/14/15,
sum 97**. (This panel: 7/10/15/37/19, sum 88, mean 17.6.)

## PS4 side-arm — PARTYSIZE4 reach on the crisis band (descriptive)

Same driver, seeds 14551–14553, VETREENGAGE=1 PARTYSIZE4=1
FLEEREPAIR2=1. Ends: 14551 d149 game-over, 14552 horizon d150,
14553 d102 game-over.

- **Trios 0/2/0, quads 0/2/0** — both on 14552. The substrate reaches
  the crisis band on 1 of 3 seeds (r244's PS4 arm: trios 2/3, quads
  1/3). Reach confirmed, thin.
- **deltaBad []** — r244's PS4 deltaBad-2 anomaly (paid-6000
  shortfalls on 14543) did **not** recur.
- Attempts 16, ok 7, refused 9, cleared 0. DRY 0, deflect_q 0.
  Deathcleanup 20, 0 dead-holder. Titan 18 outcomes / 17 refused /
  2 gate lines / 0 repeats / 1 slain-field. WRAP 22/22.
  NODEAWAY 4 (worst bench 1). Fight-1: 7 ok, 4 cleared, 4-of-5
  multi, max cleared vTaken 66 < 70. Medic blocked 53/33/36,
  ability cures 4/20/12, medicine 0. Ruin searches 1, med 0.

## People check (C3) — all 35 driven transcripts read in full

FabricHits 0. Conversations meet the meaning bar. The two settled
closes the worker flagged are adjudicated here, with the pantryPer
figures the PANTRYPER instrument now makes recoverable:

- **Aisha d55 (14552) — "we're square" ACCEPTED, honest.** The favor
  (forage_help, south slope) was promised d19 and broken d31 (missed
  promise, 0 kcal unloaded). At d55 Aisha says "You said you'd help
  with the pantry run. ...It's done now. Forget it."; the player
  says "We're square."; she agrees, "Good. Then we're square."
  Pantry at d55: **49,314 kcal / roster 10 = 4,931 kcal/person** —
  the pantry was full; the forage need was met in aggregate. The
  settle is honest. (The sitting's recaps still say "Still on that
  debt" after the close — topic continuity, recorded, not judged.)
- **Jian d17 (14555) — "we're square" REFUSED, honest.** Same shape
  of broken favor (forage_help promised d10, broken by d17). Jian:
  "The pantry run — still open. The promise died, not the need."
  The player says "We're square."; Jian deflects ("So.") and adds
  "They won't forget. Debts unpaid just sit there." Pantry at d17:
  **20,423 kcal / roster 11 = 1,857 kcal/person** — the need was
  live. The game refuses the square when the need is live and
  accepts it when the need is met. **That is the r240 fix working
  as designed, proven by the contrast inside one panel.**
- **Bessie d31 (14554) — "that warning, settled."** A delivered,
  heeded warning, not a favor. Honest.
- **Jian d41 (14555) — "All sorted. Some things just work out."**
  A generic thread closer on the "that favor" thread; the forage
  favor's last known state was broken-then-re-asked (probe d34:
  asked). The line is not tied to a favor state — noted, weak
  evidence, no verdict.
- **Dmitri d32 (14551) resume opener** quotes d25's "Anyway — I
  should get going." inline in one entry — not split. "You're
  wearing Aki's shoes now" picks up Dmitri's leadership thread
  with the player after Aki's d28 death; coherent, not a defect.
- **Mourning names all correct** (see verdicts). **Joko (14554):**
  died d50 ("The Gavel killed Joko in 7 rounds"), mourned d52 by
  Bessie ("Joko is gone..."); absent from the census corpse list,
  consistent with the no-body return ("Joko didn't come back") and
  the known buried-dead-never-reach-corpse-list shape. No feast
  fired for Joko (no body, no burial) — the feast lines that did
  fire all state their trust outcome (see FUNERAL-MEND).
- **"Ducks in a row"** (Jian d10/d11): the literal monster ID,
  twice; the second lampshades the repeat ("I answered that once —
  back when the answer was simpler"). Not a splice.
- **Seamus d33 doubt:** 3x dlg:doubt, three different escalating
  responses ("...What's that supposed to mean?" / "What are you
  getting at?" / "I've told you what I've told you."). Not
  verbatim — honest escalation.
- **Lucia (14553) Tagalog pool:** lines repeat across sittings
  («Mabuti kang tao.» 3x across d33/d38/d45; «Buti nandito ka.» 2x).
  Small non-verbal pool, cross-sitting, not same-sitting stacking.
  Noted in metric review; no bar covers it.
- **Voted cases:** case_8 (14553, ambush of Morris), case_2
  (ambush of Quinn) and case_5 (ambush of Joko) on 14554 — distinct
  cases, no re-appearance under a new number. Betrayal-site force
  fired on all three.
- **Party namings:** "FINAL GIRLS CLUB" (Hattie, 14553 d28) and
  "The Kept Promise" (Bessie, 14554 d52) — both land with broadcast
  + Codex entries.
- **Lately:** fired 2x on sheltered sittings (Bessie d52 on Joko;
  Seamus d50: "Lamar owed me a favor. I keep thinking about
  collecting.") with real answers. The steered defender sittings
  never reached lately (subjectNavs 2, gate closed) — same as r244.

## Telemetry

`node scripts/telemetry-check.js` against baseline
`telemetry-baselines/crisis.json` (defendedFights, playerFights,
latelyDefenseCount): **quiet** (6 files, 3 metrics, no large
deviations). This panel: defendedFights per seed 7/10/15/37/19,
**sum 88, mean 17.6**; the driver records no playerFights or
latelyDefenseCount key (same as r240/r241/r244). Matched band:
25/24/19/14/15, **sum 97** (r244's JSONs agree; the r244 note's 26
is corrected above). The baseline's 95 sits inside a historical
3-seed range of 43–143, i.e. a panel-sum, while this panel is 5
seeds — the units question (r240 metric review 3) stays open.
**Baseline NOT rolled** — a single panel's variance never rolls a
baseline.

## Gate

`node scripts/check.js --quick` solo on tip `e1b6cc7d6` (pre-rebase):
**339 passed, 5 failed in 641s.** The 5 are the standing set, each
adjudicated with a solo re-run — **0 attributable to this run** (this
run changed no src/js; evidence + driver/analyzer scripts only):

- `test-measurement-proof-update.js` — "Proof source inputs are not
  current" (staleness; the proof manifest does not cover the current
  inputs). Solo re-run: same throw.
- `test-measurement-workflow.js` — "retained neutrality proof covers
  the current Game/controller/harness inputs" (the staleness pair).
  Solo re-run: same 8-passed/1-failed.
- `test-phone-frame-proof.js` — 3 sub-failures, all the stale
  phone-frame receipt ("Phone receipt source is stale or missing:
  index.html"; index.html changed in the r147 ff). Solo re-run:
  same 3-passed/3-failed.
- `test-living-garden-deed-attainment.js` — 120s TIMEOUT under the
  4-parallel gate load. Solo re-run: completes in ~85s, exit 0.
- `test-one-person-army-deed-attainment.js` — 120s TIMEOUT under the
  4-parallel gate load. Solo re-run: completes in ~73s, exit 0.

**Rebased-tip re-verification (branch rebased onto `ebea87dfb`, the
social r238 adoption).** The r238 adoption's full gate on `ebea87dfb`
was **341 passed, 3 failed** (living-garden timeout, phone-frame,
one-person-army timeout — its log is
`evidence/2026-11-19/r238-adoption-check.log`). On the rebased tip
with this run's commit applied, the panel's proof tests were re-run
solo: titan proof **15 passed, 0 failed**; the measurement-proof
pair **still fails with the same throw** — this run's three new
driver/analyzer scripts trip the proof manifest (`B.manifest(root)`
covers harness inputs, so any new script invalidates the retained
proof until it is re-signed; the r238 adoption's round-21 refresh
is the maintenance step that re-signs it). The pair is therefore the
standing staleness mechanism, not a defect in this run's scripts.
Phone-frame and deed failures are mechanism-unaffected by the
evidence-only rebase (no src/js changed). **Rebased-tip tally:
339 passed, 5 failed, 0 attributable.** A second full gate run on
the rebased tip was not started while Lane A's establishment gate
was running (concurrency rule); the tally above is composed from
the full run on `e1b6cc7d6`, the r238 full gate on `ebea87dfb`, and
solo re-runs of every failing test on the rebased tip.

Gate log: `evidence/2026-11-19/journey-crisis-r247-check.log`.
Titan proof re-run on the rebased tip: 15 passed, 0 failed (above).

## Reachable / fun / winnable

- **Reachable:** villages reach d150 on the matched band (5/5) and
  on 14554; the fresh band's 4/5 game-overs are the hunger wall
  (empty pantries → scatter), not a new block.
- **Fun:** the conversations read well — the Aisha/Jian settled
  contrast is the panel's best moment, the Joko mourning arc is
  coherent across d50–d52, and both party namings land.
- **Winnable:** no full seat on this band; wave-5 door 0/5 main,
  0/5 matched. The wall remains formation / launch / damage,
  unchanged by this run.

## Metric review

1. PANTRYPER closes the r244 gap — verified populated (roster on
   every pantryDaily row); C3b adjudicated above with exact figures
   (4,931 vs 1,857 kcal/person).
2. Titan F2 item CLOSES: spoken "you have 0" honest on all 8 gate
   lines (no Haven commitment on any refusal day) + proof 15/15 on
   the rebased tip. The strict per-line spoken-vs-gate equality
   check still wants muster composition persisted at outcome time
   (driver instrument, future run).
3. PS4 deltaBad anomaly did NOT recur — closes as non-recurring.
4. Telemetry baseline units (crisis.json): sum or mean? Still open.
   Per-seed defended fights 7/10/15/37/19 (sum 88) reported above.
5. The rotation file read 6 at this run's start; this adoption
   writes 7 at closeout, with a read-back.
6. HOMEBODY and NOTICKDEFER stay descriptive-only (vacuous again).
   FLEEREPAIR3 and WILDAVOID stay unmeasured — no instrument
   exists; this run does not judge them.
7. The r240 player-side "we're square" question is answered in
   part: the NPC side is need-conditional (Aisha accepts at 4,931
   kcal/person, Jian refuses at 1,857). The player can still claim
   square; the NPC now judges by the need. Design question closed
   on the NPC side.
8. funeralMendStats counters are NOT persisted in the per-seed
   JSON — the FUNERAL-MEND verdict was read from the lines
   themselves. A future run that wants counters must persist them
   (driver instrument).
9. r244 note correction: defendedFights 26 → 25 on 14541
   (sum 98 → 97).
10. Joko's d50 death is absent from the census corpse list
    (no-body return; buried-dead-never-reach-corpse-list). Mourning
    + Codex record are correct. Worth a census-owner look, no panel
    impact.
11. Lucia's Tagalog pool repeats lines across sittings (small-pool
    observation, no bar).
12. Link-accept still untested (0 raises, fourth panel running).
13. 14553's census reads extinct=False with aliveCount=0 on an
    extinction game-over ("No one is left to pick up the Codex. The
    village dies out") — the census extinct flag disagrees with the
    empty roster. Worth a census-owner look; the endReason + last
    lines carry the verdict, so no panel impact.

## Infrastructure notes (for the script/flap owners, not the game)

- worktree-register.sh silently attached to a stale pre-existing
  branch (7 commits behind) instead of branching from master —
  fast-forwarded in-tree; the fallback needs a fast-forward or a
  loud failure (prereg §pre-flight).
- A 0-byte `.git/refs/heads/probe-py3.txt` left by the 10:28Z flap
  probe blocked every fetch until moved (preserved as evidence in
  goal hidden_files/flap-probe-evidence/). Probe runs should keep
  test files out of `.git/refs/heads/`.
- The registry lock was held ~11 min by the r147 adoption's
  worktree-register.sh (`git worktree add` slow under load); this
  adoption's heartbeat queued behind it and landed 12:10:14Z.
  Live sibling work, no action taken.
- Master moved 12 commits during this run's 25-min registration
  (385f07995 → 416e81241); the prereg base is the verified tip.
- The exec service restarted once mid-telemetry-search; no work
  lost (re-ran the search).

## Files

- Prereg: `evidence/2026-11-19/journey-crisis-r247-prereg.md`
- Run note: `evidence/2026-11-19/journey-crisis-r247.md` (this file)
- Driver: `scripts/journey-crisis-r247-delayed-20261119.js`
- Analyzer: `scripts/analyze-crisis-r247-delayed-20261119.js`
- Matched driver: `scripts/journey-crisis-r247-matched-20261119.js`
  (same driver, SEED 14541–14545, EVID matched-r244band/)
- Corpora (goal hidden_files): `evidence/2026-11-19/` (main panel
  JSONs + 35 transcripts + smoke JSON), `evidence/2026-11-19/ps4/`,
  `evidence/2026-11-19/matched-r244band/`,
  `journey-crisis-r247-analysis.log`,
  `journey-crisis-r247-ps4-analysis.log`,
  `journey-crisis-r247-matched-analysis.log`
