# journey-landing r97 — run note (lane A, leg 0 LANDING)

**Run id:** laneA-20261104T1445Z (scheduled 08:45 CST 2026-11-04). Base
master@03844d5a5 at branch creation; worktree `journey-landing`. Rotation read 0
→ leg 0 LANDING; 0→1 written at run start and verified by read-back.
Prereg: evidence/2026-11-04/journey-landing-r97-prereg.md (committed BEFORE any
scored seed ran, commit c588bc4f — the safe-commit index clobber struck on
that commit, same class as r90/r94/r95/scale-r96: commit correct, main index
lied with the file staged-as-deleted + untracked; repaired via HEAD-blob
cacheinfo, verified `git status` clean + `git diff HEAD` empty + hash-object
matches HEAD). Panel outputs: goal hidden_files evidence/2026-11-04/landing-r97
(panel censuses/system/transcripts + analysis + fights + checkquick logs)
+ landing-r97-pilot/ (seed 837) + pilot analysis + landing-r97-doorstep-replay/
(seed-843 r98 replay + analysis). Driver: scripts/journey-landing-r97-20261104.js
(prepared and committed by r96, used verbatim — fresh seeds 837–846, DAYS=28).
Analyzer: scripts/analyze-landing-r94-20261104.js (unchanged, dir-as-argv).
Fights: scripts/analyze-fights89-20261102.js (unchanged, dir-as-argv). Shape
test: scripts/test-landing-r94-shape.js. Next driver prepared here:
scripts/journey-landing-r98-20261104.js (r97 verbatim + R98 DOORSTEP-OUTINGLIVE
fix, seeds 847–856, OUTDIR landing-r98; diff-verified, node --check clean).
Proof test: scripts/test-doorstep-outinglive-r97.js (FAIL on the r97 corpus,
PASS on the r98 replay corpus — see Blank filled).

## Panel verdicts (as run)

- **Q1 LIVE-RUN PASS, SECOND PANEL: GO.** Panel liveRunEnds: 8 broken-promise
  ends with endOk true, 0 endOk false (838: Kuldeep d9, Adaeze d11, Dale d13,
  Carlos d14; 840: Farid d14; 844: Nathan d12; 846: Marcus d13, Fatima d15;
  pilot 837: Sam d12). All 5 waited seeds departed (838, 839, 842, 843, 846;
  panel waiting opps 12). The panel's single "Finish your current outing"
  refusal (838 d10, Dale) is NOT a pass failure: Adaeze's run was still
  PROMISED at d10 dawn, and the pass ends broken runs only (promised runs are
  logged only, by design) — Dale departed d11, inside his window, and broke
  on patch exhaustion (0 kcal), not on the door. The three other NO-DEPART
  windows (839 Sophia, 842 Florencia, 846 Mario) were never waited opps —
  the partner never waited at dawn (probe hall-door stall class, see below) —
  so they are not live-run-pass failures either.
- **Q2 WATER CLAUSE: UNTESTED again** (0 wild water skips; 10 wild outing
  iterations, min hydration 67, 0 under 25). Standing since r87 — now twelve
  runs deep.
- **M1 ALIVE-D14: 10/10 PASS** (day-14 pops: 838:12, 839:12, 840:11, 841:11,
  842:11, 843:11, 844:12, 845:12, 846:11 by deaths ≤d14, pilot 837:12; overAt
  None on all ten seeds).
- **M2 SYSTEM CONTACT: 10/10 PASS** (first contact day 8 on eight seeds,
  day 9 on 842/846, all ≤d10).
- **M3 FIGHT-LOG: PASS** — panel 27 hunt fights, 27/27 complete, 5 fatal,
  0 unknown/mixed trigger (pilot 837: 0 hunt fights). Fatals are clean
  monster-approach losses (845 d20 Highbeam Deer, dealt 144, died at −38 HP;
  845 d28 Captain Bright-Eyes, dealt 142, died at −9 HP).
- **M5 PEOPLE: PASS.** Wind-down more 8 picks, 0 empty (pilot 1/0); WD probe
  GATE-A GO, GATE-B GO (panel; pilot n=1 GATE-A NO-GO is not a panel verdict);
  betrayal held-offers 0; party invites 9 offered / 9 spoken / 0 dry /
  3 accepted; case labeling 8/8. Two full transcripts read (839 day 8 Samuel,
  838 day 6 Kuldeep) — both contentful, no fabricated shared history (see
  People check).
- **M6 DOORSTEP: NO-GO on binding clause (b), step mechanics GO.** 254 panel
  checks + 28 pilot checks, triggered 1 (842 d13, ate, kcal 268→2400, 0
  refusals). But clause (b) — 0 class-E scholar starvation deaths — FAILS:
  seed 843, Gilberto starved day 13 at Haven with pantry food (see Blank
  filled). The analyzer's own R88 DOORSTEP line says DOORSTEP-GO (every
  triggered step recorded); that is the step-mechanics verdict, not the
  binding clause — the binding miss stands and is never re-scored.
- **M7 GUARD v3: kcal PASS, water UNTESTED.** Kcal skips 4 → arrivals 4,
  rescue ladder 4/4 complete, eat-on-arrival 4/4 ate (840 d13: 486→2400;
  844 d11: 508→2308; 846 d12: 758→2400 and d14: 70→2400; all from outside the
  hall, enter=true), 0 refusals, 0 guarded skip-day starvations. Water
  skips 0 (see Q2).
- **M8 SHAPE: PASS** on pilot corpus and on all 9 panel censuses
  (water arrivals 0, kcal arrivals 0–2 per seed) and on the replay corpus.
- **M9 STAY-GREEN: NO-GO (starvation deaths).** Death liturgy exact
  (griefMiss 0/35 panel, 0/0 pilot; every panel death REGISTERED;
  succession latencies all 0–1); theft 0 all seeds; plenty-voice 30–56 all
  seeds; self-sufficiency ≥0.85 on every panel seed (0.85–1.037) and 0.919
  pilot — the self-sufficiency clause PASSES this panel. The miss is the
  starvation clause: 3 starvation deaths (840 Elif d19, Pedro d20; 843
  Gilberto d13). Only Gilberto's is a proven class-E scholar death; Elif
  and Pedro are non-scholars whose own whereabouts the scholar-series
  instrument cannot place (their analyzer class-A label describes the
  scholar's old wild days, not their deaths — see Instrument watches).
  The binding metric counts starvation deaths, so M9 is NO-GO regardless
  of class.
- **M10 DAWN-DOOR, LIVE-ONLY (binding): PASS on its clauses.** 438 panel
  opps + pilot opps, waitDiagMissing 0. Live promises 236 (waiting 12,
  has-run 150, node-not-home 6, kept 68); ledger rows 202 (the r89/r94
  counting artifact, reported separately, never counted as door blocks).
  12 waited live opps, sidestep attempts 9, ok 7, readyAfter 2, 0
  unexplained door blocks. Caveat (probe reach, not a game block): on
  840/841/844/845 no favor ever waited at dawn — the probe could not reach
  the partner ("Your partner is inside the Haven hall" / "Move next to
  your partner, on the same side of the Haven door"), the same Haven-door
  adjacency stall noted in r74/r95/r96.

## Village assessment (plain words)

Ten villages, all alive at day 14, all contacted by the System on day 8–9.
What they look like at the day-28 horizon:

- **838 (Wyatt's village, 12→12):** untouched. No deaths at all in 28 days,
  System day 8, 22 monster kills, pantry recovering (1895/person — hungry
  by the analyzer's 2000 line, but the village never lost anyone). The
  panel's cleanest fortnight, and its outings still found nothing (4
  departed outings, all 0 kcal — patch exhaustion again).
- **839 (Gloria's village, 12→7):** the fighters who bled out. 23 kills and
  the panel's only two kept outings (Miguel 600, Boris 420, both delivered
  on the day), but five deaths from d17 — monsters, a wound, and the
  scholar's own people falling around her. Gloria herself lived.
- **840 (Aaliyah's village, 12→8):** the worrying one. Two villagers starved
  (Elif d19, Pedro d20) while the village pantry still held food on paper
  (2000 at Elif's death, 10742 at Pedro's) — the instrument cannot place
  where they died, so this is reported as an open placement question, not
  as a doorstep verdict. Fed-or-not is not the whole story here.
- **841 (Ingrid's village, 12→8):** the village that changed leaders twice.
  Ingrid died in the wild day 9, Enzo took the mantle and died of lockjaw
  day 22, Paul held it from day 23. Fed at horizon (2887/person), 16 kills.
- **842 (Ricardo's village, 12→8):** the meat village. Five monster-meat
  tests, all safe, and the panel's best-kept outing chain (Thabo 630,
  Leo 810 late). Ricardo himself died in the wild on day 28 and the mantle
  passed to Bessie the same day. Fed (2416/person).
- **843 (Gilberto's village, 12→7):** the doorstep village. Gilberto starved
  day 13 at home with a full pantry because the step that would have fed
  him skipped on a live outing (see Blank filled). Otto then died of
  sickness day 16, Dylan in the wild day 28. On the replay with the fix,
  this same village ends the horizon at 12, fed — the difference is one
  skipped step, not the village's luck.
- **844 (Antonio's village, 12→7):** quiet and fed (3594/person), 17 kills,
  no scholar death — but the population still fell by five across the
  fortnight, all to monsters and the wild. The village eats; the wild
  still takes its share.
- **845 (Carol's village, 12→10):** the richest village (4797/person, 24
  kills) and the unluckiest scholar: Carol died twice over, in the wild,
  day 20 and day 28 (two mantle holders, Nora from day 21). Wealth does
  not buy safety from a Highbeam Deer.
- **846 (Megan's village, 12→10):** steady, fed (3203/person), 17 kills, no
  scholar death. Marcus's haul got blocked on the creek tile coming home
  (see watch) but the rescue ladder brought the scholar home the next top.
- **837 pilot (Jamie's village, 12→12):** fed enough at horizon in
  self-sufficiency terms (0.919) but hungry by the per-person line
  (975/person), no deaths, no scholar death, System day 8, one outing
  kept in spirit but hauled 0 kcal — the patch-exhaustion shape again.

What they know: every village knows the System by day 9, knows monster
meat is being tested (9/9 panel seeds ran tests; 7 reached a pantry exit),
knows the naming debate (beast names voted around fires). What is
missing: on 840, food that reaches the people who starve — and on 843,
one step that should have been taken.

## People check (full transcripts read)

- **839 day 8, Samuel (probe sitting, 9 turns):** a real hook — "People are
  saying things. About you. Is any of it true?" — answered honestly, then
  a party invite accepted with a condition ("Alright. But I'm not carrying
  your stuff."). His want resolves sideways and honestly ("Never mind the
  food I needed — we got it handled. Thanks anyway"), and the sitting
  closes with a naming vote (Big Ugly leading) and "This was good." No
  fabricated shared history; ending resolves.
- **838 day 6, Kuldeep (probe sitting, 21 turns):** a real want — the pantry
  run, ridge above the creek at sunup, two packs — committed and promised
  ("forage with Kuldeep tomorrow to rebuild the pantry"). The personal
  thread lands ("Don't eat anything Kuldeep hasn't looked at first. That's
  my rule"), the goal thread lands ("I want to be part of the 'we' when
  people say 'we made it'"), and the wind-down lands ("Just... include me.
  In things. That's all I want."). Map compares teach real ground, then
  honestly "nothing new". The two verbatim repeats are the subject-change
  deflection under probe topic-hopping — a deflection, not a filler loop.
  The sitting pursues threads to depth 2 and ends resolved/promised.
- Panel-wide people signals agree: party invites spoken 9/9, betrayal
  offers spoken with zero held, case framings naming their target 8/8.

## Blank filled (driver policy, zero src/js): the outing-live doorstep trap

**Finding.** Seed 843, Gilberto (scholar): day-13 doorstep check records
atHaven true, insideBefore false (outside the hall), kcal 728 of a 2400
cap (below the step's 50% hunger threshold), pantry 16350 — and the step
SKIPPED as 'outing-live', because Caleb's forage outing (departed d12)
was live. The skip fired BEFORE need was even computed (the old code
checked liveOuting, then returned, and only then computed needEat/
needDrink), so a hungry scholar standing where food was never ate, and
starved that day: autopsy loc haven, pantryEdible 16258, class E (at
Haven, pantry held food — DOORSTEP). This is the first proven class-E
scholar starvation death on a landing panel since the doorstep step
landed in r88, and it breaks M6 clause (b) and M9 for this panel. It is
a driver-policy gap, not a game-code defect: the doorstep step is the
competent-player behavior, and a real player at Haven would eat before
night even with companions out — eating does not break the outing.

**Fix (r98 driver, driver policy only).** In `havenDoorstepStep`, need is
now computed first, and the outing-live skip applies only when the scholar
is NOT hungry/thirsty; a needy scholar at Haven eats even with a live
outing. On day 12 (kcal 2346, fed) the skip still stands, exactly as
before — the change bites only on the hungry day.

**Proof (before/after, same seed).** Replaying seed 843 under the r98
driver: day 13 doorstep TRIGGERS (kcal 728→2328, 8× Rice, pantry
16350→14750, hall entered via the last-tile walk), Gilberto lives past
day 13, no mantle transition, village ends the horizon at 12 and FED
(2464/person) instead of 7 and hungry — and Caleb's outing outcome is
UNCHANGED (depart d12, broken departed-no-deliver, returned true), so
eating at the hall did not break the live outing. Shape test PASSES on
the replay corpus. `scripts/test-doorstep-outinglive-r97.js` asserts all
of this on a census file: FAIL (exit 1) on the r97 corpus, PASS (exit 0)
on the replay corpus. The panel verdicts above are NOT re-scored — the
replay is a proof, not a re-run; the r98 panel (seeds 847–856) is where
this fix is tested at scale.

**What the fix does NOT claim.** Elif/Pedro (840) remain unexplained in
placement: they are non-scholars, and the analyzer's starvation section
reads the SCHOLAR's series, so its class-A label for them describes the
scholar's old wild days, not where they died. Do not cite class A for
non-scholar deaths. A villager-placement instrument is the open item if
840's shape recurs.

## Reachable / fun / winnable (leg 0)

- Reachable: yes for contact (d8–9 every seed), food, talk, favors, and
  outings — all 5 waited seeds departed, the rescue ladder fired 4/4, the
  doorstep step fired 1/1 when it reached a needy scholar. The unreached
  part is probe-side: on 4 seeds no favor ever waited at dawn (hall-door
  stall), so those villages' joint outings never got their dawn window.
- Fun: the fortnight reads like people surviving together — asks with
  reasons, refusals with reasons, naming debates, grief that registers,
  a village that changes leaders twice and carries on. The unfun residue
  is twofold and both honest: outings that walk out together and find
  nothing (patch exhaustion, 14 together-blocks on "0 kcal" panel-wide),
  and a scholar starving at home with a full pantry — now fixed in the
  driver, to be proven at panel scale in r98.
- Winnable: leg 0 unchanged in difficulty; no gate or balance change.
  Nine villages hand establishment a living, System-contacted village
  with kills banked. 843 hands it a village that lost its scholar to a
  skipped step — the replay shows the same village intact under the fix,
  which is the winnability-relevant difference for this leg.

## Instrument watches (documented, not defects)

- **Armor tele/line disagree, 8/9 panel seeds** (r97 analyzer R69
  teleLineDisagree=8). Same class as r69/r95/r96 — neither series should
  be cited for armor craft counts until the units are reconciled. Armor
  itself is fine (wearers present, bark/hide flowing).
- **Horizon pantry thin on 4/9 panel seeds** (838, 839, 840, 843 by the
  <2000/person line; pilot 837 also hungry at 975/person). The analyzer
  flags it PATTERN ("collapse recurs — lever work candidate"). Note the
  shape change: NO panel seed's pantry hit 0 before d28 this run (r96's
  829 did), so this panel's thinness is a slow bleed, not a famine —
  except 843, whose starvation was a doorstep skip, not a pantry collapse.
- **Flesh channel:** 8/9 arrival seeds, 9/9 test seeds, 7 exit seeds, 1
  stuck seed (838: 2 tests, 0 exits) — CHANNEL OPENS.
- **Creek tile (5,3) evening-home block:** 846 Marcus's haul blocked on
  "hop home failed: player=(5,3) home=(4,4)", and both 846 kcal arrivals
  first returned blocked:creek from (5,3) before the rescue ladder's
  walkHome reached the hall next top. The ladder recovers it; the evening
  hop does not. Watch, not a defect claim — the same tile blocks two
  paths and only one has a recovery.
- **Contests open at horizon 2** (fired 16, ended 14, orphanEnds 0) —
  in-progress shows at the d28 horizon, not orphans.
- **Analyzer starvation classes for non-scholars are not citable**
  (see Blank filled): the section reads the scholar's series. Gilberto
  (scholar) class E is sound; Elif/Pedro class A is not evidence about
  them.

## Metric review

- M6 at one trigger: this run's practice — step-mechanics GO reported
  alongside binding-clause NO-GO, never conflated — is the correct
  reporting, and should stay the convention. A triggered step passing its
  eatRec does not clear a class-E death elsewhere on the panel.
- M9's starvation clause binds even when self-sufficiency passes (all
  panel seeds ≥0.85 here): a village can be "self-sufficient" in the
  analyzer's ratio while named villagers starve. No threshold changed
  this run (gating freeze stands); the r98 question is whether the
  doorstep fix removes the class-E shape at panel scale, not whether the
  threshold should move.
- No thresholds changed this run. The fizzle convention from r96 (flag
  only on thread exhaustion) was kept; the verdict rests on the two full
  reads plus the wind-down/probe gates, all green.

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/landing-split.json --current
'<landing-r97 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
lines, BOTH EXPLAINED as aggregation artifacts (same class as r94/r95/
r96), baseline NOT rolled: (1) systemDay baseline 33 → current sum 74
over 9 files (per-seed 8–9, mean 8.2 — day 8 on seven seeds, day 9 on
two); (2) monsterKills baseline pooled mean 24 → current sum 192 over 9
files (per-seed mean 21.3, range 16–27). No behavior change is indicated.

## Closeout note

- Commit: prereg (already committed c588bc4f) + this note + r98 driver +
  proof test (tooling/policy only, zero src/js).
- Quick suite: `node scripts/check.js --quick` — 281 passed, 9 failed in 1157s
  (landing-r97-checkquick.log). r96's standing set was 6 (measurement-
  proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes) plus 2
  proof-freshness/load items (measurement-cache-flags, trust-observer-
  neutrality timeout); here the standing 6 recur, trust-observer-neutrality
  recurs as a 120s timeout, measurement-cache-flags is GONE, and two more
  120s timeouts appear (capable-bot, table-endings). None is attributable
  to this run: this run changed zero src/js and zero existing tests, and
  no failing test references any r97/r98 file (verified by grep) — all 9
  are the same proof-freshness/load class as r96's standing set, moved by
  sibling landings since r96's check (the base moved 02158dbea →
  03844d5a5). Reported here, not fixed — other lanes' proof-freshness
  maintenance, not this leg's findings.
- Merged locally, pending ship (no version tag; ship job owns it).
- Heartbeat: standing loop (600s) held the registry beat through the
  run; beats verified in the registry (active, fresh at each check).
  The run's own lock held throughout.
