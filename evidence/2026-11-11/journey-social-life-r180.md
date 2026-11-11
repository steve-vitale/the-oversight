# Journey social life r180 — RUN NOTE (lane B, leg 5, 2026-11-11 14:00 CST run)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Base: master 3eec28a81
(sim-siegedesign-a). Seeds 43601–43604 (fresh band), DAY CAP 140,
policy journey. Driver scripts/journey-social-life-r180-20261111.js,
analyzer scripts/analyze-journey-social-r180-20261111.js, helpers
scripts/journey-social-r180-helpers.js (all r179 verbatim except
seeds, OUTDIR, filenames + the M10 coach/face split). Prereg:
evidence/2026-11-11/journey-social-life-r180-prereg.md.

## Run-start incidents — READ THIS BEFORE ADOPTING

- **Rotation anomaly.** r179's run note claims it wrote rotation 6 at
  closeout; the file read 5 at this run's start (mtime 2026-11-11
  19:28:19Z). The r182 adoption closeout records writing rotation
  4→5 at ~13:28 CST — its leg was endgame (4), so it wrote leg+1 = 5
  regardless of the file's content, clobbering r179's 6 (or r179's
  write never landed in the flap). The file says 5 NOW, so this run
  plays leg 5 per the file and writes 6 at closeout. Leg 5 was played
  this morning (r179, full panel) — this run is the first full panel
  ON the guarded base, not a re-play of the same question.
- **EPERM write flap active intermittently all day.** First
  `worktree-register.sh` attempt failed mid-checkout (20:00–20:10Z:
  `unable to write file tools/mobile-sim.html`, `unable to write
  file version.json`, `fatal: Could not reset index file to revision
  'HEAD'`; git cleaned up the partial tree — no registry entry, no
  leftover .git/worktrees entry, verified clean). Probe failed
  20:11–20:14Z, succeeded 20:16:17Z; retry on that window succeeded
  (exit 0, 20:21Z). Heartbeat 20:21:35Z, hbloop every 10 min.
  Long jobs run nohup-detached with log polling; writes retried on
  probe windows only (single-success trigger, per the flap skill).
- `git pull --ff-only` in main tree: "Already up to date" — no
  divergence this run (the ship loop's reconciliation has landed).
- Main tree CLEAN at pre-flight, disk 35%. Reaper run at ~20:00Z:
  exit 0, removed nothing, active 10/16; LOUD dirty trees are other
  owners' — not touched.
- **Pre-panel proof failure on the new base, repaired in-tree.**
  `test-journey-social-r172-confesswrap.js` failed: the r172 pin
  (seed 43402's day-12 theft press, sitting 14) no longer exists —
  on the reconciled base the first confrontation is a day-9 doubt
  confession (sitting 10), and NO theft confrontation fires on
  seeds 43401–43404 within 30 days (probed: 0 confrontTheft in
  4×30d). The instrument is correct (exactly 1 event, no double);
  only the pinned scenario moved (dawn scorer). Test re-pinned to
  the day-9 doubt press; the theft-label path is panel-watched
  (it fired: 4 confrontTheft events on 43604, all Tariq — see M2).
- **r35 test broken by the r130 rotation, repaired in-tree.**
  `test-social-r35-favorreq-spendout-20261020.js` also failed on the
  new base: the r130 favour-block rotation rotates the partner-block
  line through four wordings, so the non-adjacent fixture never saw
  a stable raw line and the escalation never accumulated. Fixture
  fixed with adjacency setup (same tile/node/door side) + clearing
  scholar.inventory as well as pack (giveFoodOptions reads
  inventory, not pack). Test green again; its "6th firing still
  voices the escalation" comment updated for the r180 fix below.
  Both repairs are test-only except the one src/js fix (B2).

## Pre-panel proofs (green on the new base)

All 10 carried proofs re-run green in-tree after the two repairs:
r172, narr, coach, coachrepeat, agree, confess, confessguard 17/17,
confesswrap 4/4 (re-pinned), r179 faceguard 9/9, r180 narrsplit
17/17 (RED first: 6/11 on the unsplit copy). Plus r21 favorreq
repeat, r35 favorreq spend-out, r130 favour-block rotation 18/18
(re-run post-fix, below).
Smoke SEED=43601 DAYS=5: exit 0, no errors, wraps installed
(confrontDoubt + confrontTheft both true), village survived d6
with 6 full conversations. confrontEvents 0 at d5 (doubts
accumulate over days — the panel is the real test).

## Panel — COMPLETE (seeds 43601–43604, DAYCAP 140)

- 43601: village-lost d96, 0 alive, 19 fallen. 43602: lost d117,
  0 alive, 16 fallen. 43603: lost d50, 0 alive, 12 fallen. 43604:
  lost d80, 0 alive, 16 fallen.
- 316 full conversations, 314 transcripts read, 89 villager-initiated
  bond proposals (89 villager / 0 scholar), 34 accepted. 10 plots
  armed, 10 sprung (hurt 5, killed 3, escaped 2). 48 confront
  events, 11 confessed, 0 double sittings. 5 moots, 47 feasts.
  Full tallies in evidence/2026-11-11/journey-social-life-r180-analysis.txt.

## Verdicts (binding prereg)

- M1 arming motive: GO — 10 plots armed, 10 grievance-linked at
  arming; 8 with grievanceTargetToLeader > 0; 7 grievance-holder
  cases later lead a plot. NOT a second zero — the B1 trigger
  investigation stays untriggered. All 10 plots armed d7–d22, 0
  late (d30+). Accomplices stayed cold (ambition/prove motives,
  grievance 0 — e.g. Bao ambition 25, Tashi prove 12, Jacek
  ambition 25). Leaders are grievance-driven. The cold-accomplice
  pattern holds. NOTE (43603 vendetta): Hayden↔Emma armed 6 plots
  against each other in 16 days (d7–d22) — each ambush re-arms the
  next plot within 2–5 days; the grievance loop has no dampener.
  It reads as a blood feud and every plot is properly
  grievance-linked and surfaced, so M1 holds — but the cadence is
  a watch item (see metric review).
- M2 villager-initiated bonds: ANSWERED — 89 bond_proposed
  (villager 89 / scholar 0), person 41 (19 accepted), link 48
  (15 accepted), per-initiator person max 4 (cap 8). End bonds
  101 / 70 / 55 / 88. Ninth datapoint with the build live. Engine
  still records NO initiator on end bonds (known). NOTE: Sam
  (43601) proposed 8 times total across kinds (person 2 + link 6)
  — the amendment-5 cap is scored on person-kind only (max 4,
  Tariq), so it holds; the combined count is recorded for the
  next cap review.
- M3 invite refusal: REPORTED — party accept 17 / decline 18
  (player); lure accept 159 / decline 151 (NPC); bond accept 8 /
  decline 7 (NPC). Invitations sometimes taken, sometimes refused,
  both ways.
- M4 sense: GO — 4/4 candidates read as real people. Sam (43601):
  sits with you, deflects twice with two DIFFERENT face lines +
  one coach line, then confesses he lied about Denver ("I'm from
  rural Vermont. I thought if you believed me, you'd keep me
  close. Close is safe. I wasn't thinking about you at all").
  Duc (43602): pressed 4× with "That doesn't quite add up" —
  rattled, deflects honestly, confesses Columbus, Ohio ("Everyone
  here was someone, and I was... that"), ending plants ("We'll
  pick this up later"). Hayden (43603): the note-taker, two
  DIFFERENT coachConfess lines, then the philosophy ("I'm not
  curious. I'm thorough. ... Understanding is control, even if
  it's just the illusion of control"). Aroha (43604): the
  peacemaker ("Arguments cost calories... Calm is a choice I make
  every morning") who reads the System itself ("It watches how we
  treat each other... It's grading us on community"). React shape
  holds: reactOffered 1988, agree 0 / joke 0 / silence 1988;
  longest 'more' continuer run 4 (<5).
- M5 census guardrail: 1/4 past d100 (43602 d117 only). Sequence
  now …, 2/4 (r172), 2/4 (r179), 1/4 (r180). A standing survival
  fact, not re-scored.
- M6 gossip-position: GO (gate definition) — 0 naming-beat lines
  emitted beyond radius-1 of Haven; 141 debates kicked, 141
  settled. Strict on-tile away total 52, reported as the known
  metric/gate definition discrepancy, does NOT fail M6 (prereg).
- M7 dedupe: HOLDS — 98 near-dup flags, all pool-cycle (same
  phrase, different suffix/landmark — "Move next to your
  partner..." variants, "I'll show you on the map sometime" with
  different landmarks, agree-lines in different languages); 0
  verbatim-identical pairs across the 98 printed flags (verified
  by direct parse of the analysis text).
- M8 counter-settle: SETTLED (aligned definition) — 1 link formed
  via a driver settle (43603 d17, tribute 5000, pantry 15500),
  0 BLOCKED re-raises, 0 fresh re-links after a settle. 15
  proposeLink calls: 1 counter, 14 direct.
- M9 recap cap: HOLDS — maxPresses 3, 312 presses, 0 offered after
  cap, 0 cap failures.
- M10 coach variation: HOLDS (split definition) — 0 coach-line
  repeats in the panel (coachVerbatim=0). The analyzer split
  works in the wild: coach and face reported separately for the
  first time.
- M10b face-guard re-confirmation: HOLDS — 0 face-line repeats
  (faceVerbatim=0, verbatimRepeats=0 total, nearDupFlags=0 on the
  NARR scan). The r179 guard holds on a full fresh panel — the
  cleanest NARR panel yet (r179: 15 face repeats + 47 near-dup
  flags; r180: 0 + 0).
- Q11 scattering capture: CONFIRMED — all 4 seeds record
  scattered / hungryDays / aliveEnd; 0/4 scattered (all
  village-lost with 0 alive).
- B2 guard re-confirmation: HOLDS — 0 double-confession sittings
  (48 confront events, 11 confessed, 11 single sittings). Third
  clean panel; the item stays closed.

### Jobs

- B1 M10 ANALYZER SPLIT: DONE pre-panel — tallyNarrDup reports
  coach-verbatim and face-verbatim separately (emission-shape
  split: asterisk-wrapped = coach, bare = face; truth.js
  confrontWindup; 0 unclassified on the r179 corpus). Proof:
  scripts/test-journey-social-r180-narrsplit.js 17/17 (RED
  first, then GREEN; corpus anchor reproduces r179: 15 total /
  0 coach / 15 face).
- B2 EMMA PREFIX REPEAT: REPRODUCED + FIXED — Devon (43601)
  d40/d45: "Why can't I do this now?" pressed 6×; the NPC's
  answers escalate honestly (none → "As I said" → "Like I said"
  → "Still the same thing" → "I've told you three times now")
  and then presses 5–6 serve the BYTE-IDENTICAL "three times"
  line. Root cause: the r35 spend-out fired one press late — the
  press that re-served the escalation still voiced the repeat
  before spending the choice. FIX LANDED: src/js/convo-dialogue.js
  — the re-serve press now voices the honest exit ("We're going
  in circles — <rawReq> Ask me something else if you want.")
  instead of the repeat, same shape as the recap spend-out, and
  still spends dlg:favor_requirements on the same press. Proof:
  scripts/test-journey-social-r180-favorreq-exit.js (RED first:
  transcript lines 5–6 identical; GREEN after: 6 distinct lines,
  line 5 the escalation, line 6 the exit, spent true). The repeat
  is visible in the TRANSCRIPT, not the press-6 return value
  (the sitting winds down on press 6, so convoTurn returns the
  wind-down line while the repeat is already spoken) — the test
  asserts on transcript lines. CONFIRM re-run on seed 43601 with
  the fix: 0 identical adjacent three-times pairs panel-wide
  (was 2 sittings), Devon 5 escalation serves + 6 exit lines;
  village fate unchanged (d96 lost, 5 confronts, 32 proposals —
  trajectory-neutral on the counted metrics). Neighboring tests
  re-run green post-fix: r21, r35, r130 favour-block rotation
  18/18.
- B3 MOOTS: 5 across the panel (1/0/1/3) — watch only, not 0.
- B4 MEASUREMENT-PROOF REFRESH: gate verdict below will show
  whether test-measurement-proof-update.js still fails on
  manifest staleness (refresh still owed) or passes (b5 covered
  it).

## Village assessment (plain words)

Four villages, all lost. 63 fallen: the wild took 38, monsters 9,
ambush 3, the arena 3, contests 2, strangers 2, combat 2,
betrayal 1, a wound that wouldn't close 1, thirst 1, lockjaw 1.
The social layer is dense and alive — 316 real conversations,
villagers raising bonds themselves (89 proposals, 34 accepted)
and links (48 raises, 15 accepted), 5 moots, 47 feasts, 10 plots
armed and sprung (3 killed, 5 hurt, 2 escaped) with the murder
cases heard and surfaced, and 32 bearer changes as the mantle
passed hand to hand (43601: twelve bearers in 96 days). What
the villages lack is not social life but survival: the people
talk, bond, grieve, confess — and then the wild kills them
anyway. The social layer does not move survival, same as r179.
The one senseless shape the panel caught — a villager repeating
the same "I've told you three times now" line twice in a row
when pestered — now exits honestly instead: "We're going in
circles — ask me something else if you want."

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes — conversations, bonds, confessions, moots, feasts
  and plots all fire in wild play on fresh seeds, no harness-only paths.
- FUN: yes — the transcripts read as people (a lie about Denver
  told for safety, a note-taker who collects details because
  "understanding is control", a peacemaker who thinks the System
  grades the village on community), and the one joke-breaking
  shape (the same "three times" line twice in a row) is fixed.
- WINNABLE: UNCHANGED — the social layer does not move survival;
  0/4 villages survived the leg window. Winnability stays with the
  survival chain, not this leg.

## Metric review (§14 — revisions for the NEXT run, never re-scored here)

- **M10 split landed**: the analyzer now reports coach-verbatim
  and face-verbatim separately; M10 judges coach only, M10b
  judges face. The r179 FAILS reading (15 face repeats counted
  as M10) is superseded. This run's panel is the first judged
  under the split definition — both HOLD.
- **M1 vendetta cadence (watch item)**: Hayden↔Emma armed 6 plots
  in 16 days — each spring re-arms the next within 2–5 days. The
  grievance loop has no dampener. It reads as a blood feud and
  every plot is grievance-linked, so it is not a defect — but if
  a future panel shows the same pair re-arming past 8–10 plots,
  the loop's cooling-off deserves a design look, not a knob.
- **M2 combined-proposal count (watch item)**: Sam proposed 8
  times total (person + link). The amendment-5 cap is person-kind
  only and holds (max 4). If a future panel shows a villager
  proposing 8+ PERSON bonds, the cap itself needs re-reading.
- **Dawn-scorer movement (reported, not judged)**: vs r179 —
  conversations 316 vs 313 (flat), bond proposals 89 vs 108,
  plots 10 vs 7, moots 5 vs 2, confronts 48 vs 63, survival 1/4
  past d100 vs 2/4. All within 4-seed panel noise; no defect
  claimed. The theft-doubt path is alive but rare (4/48
  confronts, one seed, one villager) — the 30-day probe's 0 was
  a horizon artifact, not a broken trigger.
- **Player-side greeting repetition (watch item)**: the driver's
  own greeting lines repeat in long sittings ("Yeah. Hey." 3×,
  "That doesn't quite add up." 4×) — the bot re-picks the same
  option; the NPC side varies each time. Not an NPC defect; if a
  future run shows the NPC echoing the player's repetition, it
  becomes a job.
- **Re-offer furniture-free max (watch only)**: `confront:d_*`
  and `dlg:react`/`dlg:subject` offered 12× in one conversation
  (gen_9o6wat2) — standing menu choices re-offered every turn of
  a long sitting, not a defect; same shape as r179.
- **Telemetry**: l3.* LOUD-disappeared lines explained (the social
  driver never emits l3.* fields; verified 0 occurrences in all 4
  per-seed JSONs). Baseline NOT rolled on a single 4-seed panel.

## Telemetry

`node scripts/telemetry-check.js --baseline <goal>/hidden_files/
telemetry-baselines/social.json --current
'evidence/2026-11-11/journey-social-life-r180-4360*.json' --metrics
l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos`
— 5 LOUD-disappeared lines, all explained (see metric review),
exit 1 on the explained drift only. Baseline NOT rolled.

## Gate

GO — `node scripts/check.js --quick` in-tree (gate2 log, re-run after the
original gate died mid-run at 240/340 scripts, 8 Fs, when the run timed
out): **327 passed, 13 failed in 1108s.** All 13 adjudicated, zero
regressions from this run's change:
- Standing (4): measurement-proof staleness pair
  (test-measurement-proof-update.js "Proof source inputs are not current";
  test-measurement-workflow.js neutrality-proof coverage) — b5 re-staled
  by the mournblooded standing.js change (and this run's own
  convo-dialogue.js touch); fresh panel owed, Loop B 2030Z owns it
  (sim-proofrefresh-b6 registered). test-phone-frame-proof.js (stale
  receipt). test-occupation-panels.js (120s timeout, standing).
- Load/flap artifacts, all standalone-green on re-run (9):
  test-prepared-runner-custody.js, test-proof-text-identity.js,
  test-telemetry-check-recorder.js, test-sw-audio-cache-20261012.js
  (EPERM write/copyfile — host write flap); test-foodpower-20261014.js
  (ontology sub-check, flap class); test-measurement-cache-flags.js;
  120s timeouts test-capable-bot-20261014.js,
  test-living-garden-deed-attainment.js,
  test-one-person-army-deed-attainment.js.
- This run's own proofs (favorreq-exit, narrsplit, r172 confesswrap
  re-pin, r35 spend-out fixture) all pass in the gate run.
- B4 answered: test-measurement-proof-update.js still fails on manifest
  staleness (b5 did not cover it — see above); refresh still owed.

## Closeout

- Landing: panel + M10 split + favorreq-exit fix + proof tests +
  evidence; one src/js file (convo-dialogue.js, the favorreq-exit
  fix only) + two test-fixture repairs (r35 adjacency/inventory,
  confesswrap re-pin) + r180 tooling.
- Rotation: file read 5 at run start (see anomaly above); this run
  writes 6 (crisis next) at closeout.
- Merged locally, pending ship.
