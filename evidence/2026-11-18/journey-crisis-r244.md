# Journey — crisis leg, run r244 (2026-11-18)

Lane B crisis leg. Policy oracleV2, 150d death-aware +10d tail, fresh band
14541–14545, sequential. Base: the run's branch was cut at `3fdd5bc21`
(social-life r237 closeout); the adoption rebased it onto `986cc5584`
(current master at closeout — the Loop B 2330Z adoption's allyslot3
evidence landed while this adoption ran; the Loop A 2330Z closeout
`48c81dac6` is an ancestor). No src/js changes this run: measurement
only, plus the PS4 side-arm.

Driver `scripts/journey-crisis-r244-delayed-20261118.js` and analyzer
`scripts/analyze-crisis-r244-delayed-20261118.js` are the r241 instruments
verbatim except filenames/paths/seeds. Prereg
`evidence/2026-11-18/journey-crisis-r244-prereg.md`. The original run
timed out at its 3600s budget before closeout; this adoption verified
every number below from the saved corpora (per-seed JSONs, analysis
logs, transcripts) and from the code, and finished the transcript read
(40/40), the telemetry check, and the gate.

## Leg question

Do r241's verdicts hold on the new base — walkHome refusal naming,
the tableActive distinction, r241's own dialogue pools — and does the
PARTYSIZE4 substrate reach the crisis band, where launches are scarce
and 2/5 r241 seeds never seeded a plan?

## Panel verdicts

- **DRY3 CONFIRM GO / DRY2 CONFIRM GO / DRY CENSUS GO.** 0 dry lines
  on 40 transcripts; deflect_q 0; `byPick` empty. Fourth consecutive
  clean panel on the r192 surfaces.
- **C2 GO.** Raids fire on all seeds; fought resolutions present; D1
  snapshots all delayed ≥3 attempts (36/36); deltaExact 32,
  deltaBad []; D3 drift unknown [] (union counting).
- **C2b GO.** Linger-conditional gorge/sortie judged on gorge+sorties
  on all 5 seeds; R70 phoenix burn-chain 0; R154 missed-window
  corrected 13 (valve-expiry 12, sortie-clear 1).
- **C1 (bend, not break) GO.** Every village reached the 150d horizon
  — no game-overs on this panel (r241: 1/5; r240: 1/5). No softlock
  seed. Causes of death are named throughout (see census).
- **C3 GO.** All 40 driven transcripts read in full (see people
  check); fabricHits 0; WRAP unmarked 0 (37 engine endings, 3
  driver-cap breaks).
- **C3b SETTLED-FAVOR CONFIRM GO — first wild confirmation.** The
  r240 guard's second wild panel served a qualifying settled line:
  seed 14541 d68, Pavel's broken forage_help favor, "It's done now.
  Forget it." / "No — that one's settled." The adoption verified
  the guard in code (`src/js/convo-wants.js`, `convoFavorFollowup`
  broken branch): the "It's done now" line fires ONLY when
  `convoFavorNeedLive(favor)` returns false. For forage_help the
  need is live while an unreturned forageRun exists, else falls to
  `convoFavorNeedPresent`, gated on `FAVOR_NEED_GATE.forage_help`
  (pantryPer < 4000). The favor's run had returned (probe:
  "This forage request is closed"), so liveness fell to the pantry
  gate — and the village's own say-lines show a full-to-bursting
  pantry through d55–64 ("the shelves are full", "the pantry can't
  take more", "Full shelves, full bellies"), corroborating a
  not-live need at d68. One honesty note: the timed-out run's
  probe reading of the exact pantry figure at d68 (pantryPer
  4996, roster 9) was **not recoverable from the saved corpus** —
  no `pantryPer` field exists in the driver, analyzer, or per-seed
  JSON — so the run note does not present that figure as verified.
  The verdict rests on the guard's construction plus the
  corroborating pantry state, not on the unrecovered number. (See
  metric review: future panels should log the probe's numeric
  inputs into the per-seed JSON.)
- **C3c / C3d: no regressions.** No resume opener names a favor
  that changed since planting; no "Nothing important" recap with
  live business. Resume-opener quotes are intact across the read
  set (no splits); day math on the callbacks is honest (10/11
  days back, matching the sitting gaps).
- **TITAN-REFUSAL CONFIRM GO.** Outcomes 119, refused 115,
  gateRefusalLines 19, gateRepeatLines 0, slain-field 4 (Karim
  d137, Devon d101, Catalina d105, Zoltan d134). No repeat on any
  titan-day. Carried wrinkle: the refusal line still reads
  "you have 0" (allied blades only) while the gate counts allied
  + Haven — the r238 F2 item, fix still owed.
- **DEATHCLEANUP clean.** deathCleanups 15, planSeeds 13,
  deadHolderEntries 0, unseeded seeds [], ignition-after-death
  seeds []. (14541 and 14545 carry null winPlan stats — no plan
  ever seeded there; the prereg's partial-census note stands.)
- **NODEAWAY (tracked, no bar): total 15, all on 14542**, worst
  bench snapshot 5 (14542 d69). vs r241 11/6/worst-3, r240
  19/10/worst-4. The muster-vs-travel tension stays a design
  question; movement is descriptive, never lever attribution
  with n=5.
- **R57 D3:** 2 say-only names, both muster-explained (Mara,
  Qilla), unattributed 0. **R59 TRUE early count 0.**
- **R182 STRANGER: VACUOUS all 5 seeds** (0 kills, 0 silent, 0
  cooldown violations). The channel never opens under home-based
  play, as preregistered.
- **POCKET:** "No path there." 555 total — travel noise, no bar.
  No sortie fight broke with the party unable to reach the
  monster; no stuck fight in the transcript read.
- **FIGHT-1:** okSorties 32, brokeAfterFight1 9, cleared 23,
  multiMonsterCleared 22/29, max cleared vTaken 58. The standing
  Q4 live-play trigger (a cleared fight-1 with vTaken ≥ 70) is
  NOT met.
- **BENCH:** refused 4, all "no-fighters" (gateOneShort 3,
  availabilityDrain 1).
- **R241 BLEMISH RE-CHECK — both fixes HOLD.** Mime-walk: 3
  distinct variants on 14541 (1× each), 3 on 14543 (1× each); no
  same-variant mime 3 days running. Wren cache-note: most-reprinted
  note 3× on one seed ("Wren again…" on 14542), under the 5× bar.
  Doubt-stonewall escalated honestly in the read set (no 3×
  verbatim in one sitting). No voted case under a new number, no
  split resume-opener quote.
- **WALKHOMe WATCH: no finding.** 0 strand lines on all seeds;
  homeward/refusal mentions 2/3/1/0/0, none a strand, loop, or
  unclearable refusal.
- **TABLEACTIVE WATCH: vacuous as expected.** The word "mercy"
  appears 0 times on 4 seeds; the single 14542 hit is "The mark
  is the mercy — MOVE." — a monster-kill narration (the Static
  Kite's weak point), not a sitting. The 13–21 "table" hits per
  seed are Stonebridge/Thornfield tribute-negotiation event lines
  ("The table is set — accept their terms…"), not sittings.
- **HOMEBODY / NOTICKDEFER (descriptive-only, retired):** HOMEBODY
  picks 113, qualifying 0 (vacuous/descriptive); NOTICKDEFER
  deferred 0 (vacuous).
- **Supply:** RUINROAD arm parked (env OFF). Panel ruin searches
  1 total (14544, 1 scavenge item, 0 med items), med acquisitions
  0 — cumulative now **0/317**. Medic-duty blocked 458 total,
  cures by ability 104, medicine 0. The supply question stays
  with the medicine build brief.
- **ARENA WATCH (descriptive):** no win/loss instrument exists;
  the gap carries. Arena deaths in the corpse record: Ezio d90
  (14541), Alba d82 + James d139 (14542), Archana d137 (14543),
  Bill d82 + Regina d128 (14544).

## PS4 side-arm (PARTYSIZE4 substrate on the crisis band — descriptive)

Same driver, pilot seeds 14541–14543, env `VETREENGAGE=1
PARTYSIZE4=1 FLEEREPAIR2=1`. **Reach confirmed: trios on 2/3
seeds, quads 1/3 (14542)** — partyTrios 0/1/1, partyQuads 0/1/0
in the post-fix DEATHCLEANUP section. 14541 game-over d66 (vs
the main panel's horizon — trajectories diverge at first plan,
as the prereg warned); 14542 horizon 1 alive; 14543 horizon 2
alive. Attempts 22, ok 13, refused 9, deltaExact 11,
**deltaBad 2 (both 14543: d59 delta −9000 paid 6000; d141 delta
−8414 paid 6000)** — a PS4-only anomaly (main panel deltaBad
was []); noted descriptively, not re-judged. Convos 23,
fabricHits 0, WRAP unmarked 0, DRY 0, STRANGER vacuous. TITAN
slain-field 2 (Mara d112, Ella d93). NODEAWAY 5 (all 14541).

## Census in plain words

Every village survived to day 150 — the first crisis panel
where no village died outright. But survival was thin: 19
people left across the five villages (4, 2, 3, 4, 6 alive), 29
dead. The wild killed most of them (33 of 42 say-deaths name
the wild); the arena took 6; wounds that wouldn't close took
7; starvation took 2 (Pavel d97 on 14543, Sigrun d142 on
14545); sickness took 1 (Enrique d69 on 14543). The pantry hit
zero on every seed (d73–d120) and ended at 6000 / 1550 / 3163 /
0 / 4197 kcal.

The crisis machinery fired all panel: 55 raids (9–13 per
seed), 379 gorge nights (434,627 kcal gorged), 36 sortie
episodes with 67 sortie fights, 40 driven conversations. The
muster gate kept refusing — 115 refused titan outcomes — but
villagers killed 4 titans in the field anyway (Karim, Devon,
Catalina, Zoltan). No village reached the table: readiness
peaked at 54–140 and never held ready; the wave-5 door was
never faced. The villages bend; they do not break; they do not
advance.

## People check — PASS

40/40 transcripts read in full (14541 8/8, 14542 8/8, 14543
8/8, 14544 8/8, 14545 8/8). No dry lines, no fabrications, no
false settlements beyond the adjudicated C3b case (which held),
no double confessions, no naming-stance wobble in the read set.

What the people sound like on this panel:

- **Darius Lewis (14545)** keeps the record — "A hundred years
  from now someone should know we were here and what it cost" /
  "Paper's scarce, so I write small. History doesn't need big
  letters." He remembers the Blood Tithe taking Dmitri across
  sittings, and the memory sharpens: "I answered that once — back
  when the answer was simpler." His forage favor stays honestly
  asked, blocked by a named reason (his partner is inside the
  Haven hall).
- **Wilhelm Lai (14545 d81)** confesses under confrontation:
  "I'm not from Denver. I'm from Phoenix, Arizona. You looked at
  me like I mattered, and I wanted to keep that. So I gave you
  someone worth looking at. That person isn't real." And mourns
  Darius plainly: "Darius is gone and the world just…
  continues. That's the part I can't stand."
- **Kwame Anderson (14545)** refuses the party twice, in
  character — "I don't do parties. …It's not you. It's the
  party." / "Alone's how I stay alive. Don't take it personal."
  — then accepts on the third ask ("Someone should watch your
  back. Might as well be me."). A real arc, not a loop.
- **Bill Weiss (14544)** hands the scout role over from Regina
  by name ("Regina nods, stepping back. 'Scout is yours now.'"),
  and his hunger is voiced honestly: "I'm going hungry — have
  you got anything to spare? Anything? My hands shake when I
  try to work." The "personal stuff" thread gets a proper
  ending across four sittings.
- **Ethan Moore (14544 d79):** "I'd rather be the cook than the
  hero. Heroes get songs. Cooks get everyone through winter." /
  "Nobody goes hungry on my watch. That's the whole plan."

Polish notes (not defects): the invite-decline line repeats
verbatim twice in one sitting on 14545 d34 (the known
no-re-ask-variant item, prereg metric review 7); the
field-teaching template repeats 7× in the d79 sitting, with a
different plant each time; the driver picks recap 2–3× per
sitting, and the resume machinery escalates honestly each time
("As I said —", "We're going in circles —"), the same
driver-pestering shape noted on social r237.

## Telemetry

`node scripts/telemetry-check.js` against baseline
`telemetry-baselines/crisis.json` (defendedFights, playerFights,
latelyDefenseCount): **quiet** (6 files, 3 metrics, no large
deviations). This panel: defendedFights per seed 26/24/19/14/15,
**sum 98, mean 19.6**; the driver records no playerFights or
latelyDefenseCount key (same as r240/r241). The baseline's 95
sits inside a historical 3-seed range of 43–143, i.e. a panel
sum, while this panel is 5 seeds — the units question (r240
metric review 3) stays open. **Baseline NOT rolled** — a single
panel's variance never rolls a baseline.

## Gate

`node scripts/check.js --quick` on the rebased tip (`986cc5584` +
this branch's evidence only — no src/js changes): **337 passed, 7
failed in 1225s.** Gate log
`evidence/2026-11-18/journey-crisis-r244-gate.log`. Adjudication,
failure by failure:

1. `test-measurement-proof-update.js` — "Proof source inputs are not
   current." Standing staleness pair #1; pre-existing on master, not
   caused by this evidence-only run.
2. `test-measurement-workflow.js` — "retained neutrality proof covers
   the current Game/controller/harness inputs." Standing staleness
   pair #2; same.
3. `test-measurement-cache-flags.js` — "both actual CLI configurations
   complete valid neutral panels" fails; the other three
   sub-assertions (four independent cache entries, cache identities
   retain SIMOPT values, same-setting reuse) all **pass standalone**
   on a quiet box. So this is NOT a pure load artifact: the
   panel-completion assertion fails solo too. But it fails on the
   rebased tip, and this branch adds zero commits on top of master
   — the standalone run IS the pristine-master result. Pre-existing
   on master, not caused by this run. The fix-side A/B belongs to
   the test's owner, out of scope for an evidence-only adoption.
4. `test-phone-frame-proof.js` — stale receipt (retained browser
   inputs / boot inputs covered / phone evidence required). Standing,
   pre-existing.
5. `test-living-garden-deed-attainment.js` — 120s timeout in the
   gate; solo it ran past 300s still iterating seeds, no red
   assertion observed. Slow sweep, exceeds the budget.
6. `test-occupation-panels.js` — 120s timeout in the gate; solo
   **25 passed, 0 failed**. Load artifact, confirmed green
   standalone.
7. `test-one-person-army-deed-attainment.js` — 120s timeout in the
   gate; solo it was still iterating seeds when the 600s timeout
   killed it (exit 124), no red assertion observed. Slow sweep,
   exceeds the budget by ~5×.

Notably ABSENT: the ladder-bundle control failure. The
ladderbase-cause-a fix is on master and it does not fire on this
rebased tip — the fix cleared it, verified rather than assumed.

One process note: this gate ran concurrently with the Loop A 2330Z
adoption's own `check.js --quick` in the main tree (started 02:12Z,
before this gate started 02:19Z) — two gates at once under load
avg 14. That is the standing "never run two concurrently" rule
broken by circumstance, and it is the likely cause of the three
120s timeouts; the solo re-runs above are the attribution.

## Reachable / fun / winnable

- **Reachable: YES.** All 5 seeds reached the 150d horizon; the
  crisis loop (raids, gorge nights, sorties, favors, mourning)
  fires on ordinary seeds.
- **Fun: PARTLY.** The conversations are the strongest part of
  this panel — people remember, confess, and change their minds
  for reasons. The crisis loop itself is all bend and no advance:
  115 titan refusals, 4 field slays, no table, no national.
- **Winnable: NOT on this band.** Readiness never held ready
  (max 54–140), the wave-5 door was never faced, no village
  reached the table. The wall is the same shape as r241: the
  muster gate refuses while the field kills, and nothing converts
  survival into standing.

## Metric review

1. C3b on this panel was SERVED, not vacuous — the first wild
   case confirming the r240 guard. The verdict is carried by the
   guard's construction plus the corroborating pantry state; the
   exact pantryPer figure at d68 was not recoverable from the
   saved corpus. **Next runs should log the probe's numeric
   inputs (pantryPer, rosterN) into the per-seed JSON**, not just
   the transcript, so the adjudication is reproducible from files.
2. The titan refusal line still counts ALLIED blades only
   ("you have 0") while the gate counts allied + Haven (r238 F2
   — fix owed, carried).
3. PS4 deltaBad 2 on 14543 (both paid-6000 shortfalls, one
   −9000) is a descriptive anomaly on the side-arm only; worth a
   look if the PS4 arm repeats, not a re-judgement here.
4. Telemetry baseline units (crisis.json): sum or mean? Still
   open. Per-seed defended fights 26/24/19/14/15 (sum 98) are
   reported above; the units question stays open for the next run.
5. The rotation file read 6 at this run's start, disagreeing
   with the r241 adoption's "verified 7" claim (file mtime
   00:43Z, no audit trail naming the writer). The file is the
   authority: this run plays crisis (6) and writes 7 at closeout,
   with a read-back.
6. HOMEBODY and NOTICKDEFER stay descriptive-only (vacuous
   again). FLEEREPAIR3 and WILDAVOID stay unmeasured — no
   instrument exists; this run does not judge them.
7. The r240 player-side "we're square" option question (r240
   metric review 2) is carried unchanged: the NPC side is
   honest; the player can still claim "we're square" with a live
   need. Design question, not a false claim by the game.

## Blanks

None open. Transcript read 40/40. All prereg bars adjudicated.
The only unrecovered number is the exact pantryPer at 14541 d68
(see C3b above); it does not change any verdict.
