# Journey social life r120 — RUN NOTE (Lane B, 2026-11-03)

Leg 5 (social life). Base master 172f01311 (includes the flee-repair
landing — this panel is a fresh post-flee-repair survival point).
Driver scripts/journey-social-life-r120-20261103.js (r113 verbatim +
arming-time motive wrap + spring-trace wrap + case-detail darkSnap;
zero src/js changes). Analyzer
scripts/analyze-journey-social-r120-20261103.js. Seeds 41401–41404
(fresh), DAYCAP 140, narration on. Pre-reg:
evidence/2026-11-03/journey-social-life-r120-prereg.md.
Rotation-b: 5 → 6 written at closeout (next: crisis).

## Pre-registered verdicts (BINDING metrics, §14)

- **M1 arming motive: GO — grievance, measured at arming, on all
  four plots.** The new instrument works (armWrapped=true on all
  seeds) and the answer is unambiguous. Seed 41404 arms four plots,
  all with reasons ['grievance']:
  - plot_1 d7, Regina→Thabo: motive 43.5, grievanceTargetToLeader
    54.4 and grievanceLeaderToTarget 54.4 at arming (a mutual
    conflict-tension feud — grievanceBetween counts unresolved
    conflict tension both ways, so the pair was already hot).
  - plot_3 d9, Thabo→Regina: motive 80, the revenge arc on
    arming-time proof — plot_1 sprung hurt on d7, recording
    Thabo→Regina 'ambushed' sev 60, and two days later Thabo
    leads plot_3 against Regina with that grievance in the motive.
    r113 inferred this from grievance days; r120 watches it arm.
  - plot_5 d12 and plot_6 d19, Thabo→Regina again (motive 80 both):
    a vendetta loop — the same leader, target, and inviter
    (Onni, every time) re-arming, both expiring unsprung after
    the 4-day window (lure declines: 10 on this seed).
  Accomplices, by contrast, are NOT grievance-driven: their motives
  at arming are 0, 12 ('prove'), 25 ('ambition') — they are recruited
  because they are disaffected (trust 6–29 at arming) and in the
  leader's group, exactly as r113's gate fixture predicted. The
  shape is: a hot leader + cold friends. No plot armed after d19
  on any seed — the drought bound holds on the new instrument
  (0 late plots, same as r112/r113).
- **M2 escaped-spring trace: SUBSTANCE GO, literal metric MISSED
  on a technicality — and the technicality is the finding.**
  The panel's one escaped spring (plot_3, Thabo→Regina, d9) opened
  case_4 with playerHeardDay 10. Both of 41404's cases end with
  playerRole 'juror' — and 'juror' is assigned in production code
  only by caseDiscoveryTick (betrayal.js:4710), which fires on the
  heard day with the spoken line "Word reaches you, days late:
  [accused] stands accused over what happened to [target].
  There's going to be a moot," plus a journal note. The moots at
  d28 and d34 then acquitted both cases. So the escaped spring
  DID reach the player: gossip line, journal note, moot seat,
  verdict. r113's claim that escaped springs "leave no trace a
  player can follow up" is OVERTURNED for the case channel — the
  trace is the case, not a grievance. The literal pre-registered
  GO required the case to be "still open at end"; both cases are
  acquitted, not open, so the letter of M2 fails while the
  question it asked is answered yes. Metric review below carries
  the correction: adjudicated-with-player-role counts as surfaced.
  The 0 "ambushLinesNaming" count from the analyzer is an
  instrument gap, not evidence: the ambushLines filter
  (/ambush|sprang|trap|betray/) misses the discovery line, which
  says "stands accused over what happened to" — and the case is
  named repeatedly in ordinary talk instead (9 transcripts on
  41404 mention the ambushes of Thabo/Regina, days 9–12, all
  before the moots, so the "Nobody's settled it" framing line is
  accurate at utterance time; no post-acquittal incoherence was
  observed).
- **M3 invite refusal, wrapper only: declines dominate again.**
  Panel: party 25 decline / 14 accept; lures 2 accept / 10
  decline. Villagers refuse more often than they accept, third
  panel running (r112 corrected instrument, r113, r120).
- **M4 sense: GO.** A full friendship transcript (41404, Saul,
  day 9, 8 turns, natural end) passes: the NPC opens with a real
  question ("Any regrets? The real kind"), answers the player's
  confession with shared feeling ("Yeah. I think everyone's
  carrying one of those"), then volunteers the unsettled ambush
  of Thabo — the dark channel surfacing inside ordinary
  friendship talk, with investigation options genuinely offered
  (site, witnesses, food trail). NOTE (driver artifact, repeat of
  r112/r113): the driver repeated the bribery choice 6×; the
  lines stay varied and escalating ("the trail is still warm" →
  "cleaner trails are still trails" → "the price was paid
  somewhere you can't see"), so it reads as persistence, not
  filler — but a real player would vary choices.
- **M5 census guardrail: NO-GO — now 0/12 across r112+r113+r120.**
  0/4 villages past d100 (d14, d73, d63, d38). The survival signal
  did not move after the flee-repair landing. Death shapes this
  panel differ from r112/r113's wild-cluster wipes (no ≥3/day
  cluster anywhere here): 41401 scatters at d14 on thirst +
  starvation with 7 alive; 41402 starves 5 in d19–23, then loses
  9 to wild/monster in d67–73, ending at 0; 41403 bleeds out to
  monsters across the whole run (7 monster + Choir Toad,
  Ugly-Eyes, Big-Eyes-class named kills) and scatters at d63
  with 9 alive; 41404 ends at d38 with pantry kcal 0, the
  vendetta pair's trust collapsed (Debbie 0, Regina 2). "Lost"
  still does not always mean extinct — 3 of 4 villages scatter
  with people alive.

## Village assessment, in plain words

Four villages, four endings, no village reaching its third month.
Each starts with 12 people and a full pantry, each lives a rich
social month or two — 17–87 full conversations (88–94% natural
ends), 2–10 feasts, 0–2 moots — and then scatters or dies. The
one village with a real dark arc (41404) is also the one where
the social machinery is most visible: a feud, a hurt ambush, a
revenge plot the next-but-one day, two more plots that fizzle,
two trials, two acquittals — all inside 38 days, while the pantry
runs to zero underneath it. The social layer is not thin; the
villages underneath it are. Whatever breaks them varies by seed
(hunger, monsters, wounds, the wild), which is why the survival
bisect r112 called for is still the owed job — this panel adds
four more matched points on current master, it does not
substitute for it.

Per-seed, plainly:
- 41401 (d14, 7 alive at scatter): combat + wild + thirst +
  two starvations in two weeks. No plot armed — the village
  ended before the dark channel could start.
- 41402 (d73, 0 alive): the two-phase death — five starvations
  d19–23, quiet middle, then nine wild/monster deaths d67–73.
  Richest social volume of the panel (87 conversations).
- 41403 (d63, 9 alive at scatter): monster attrition from d9
  to d62, never a wipe, never a recovery — scattered with
  most of the village still standing.
- 41404 (d38, 6 alive at scatter): the vendetta seed. Regina→
  Thabo d7 (hurt), Thabo→Regina d9 (escaped), d12 and d19
  (expired). Two cases, two moots, two acquittals, player as
  juror on both. Pantry 0 at the end.

## Reachable / fun / winnable (leg 5)

- Reachable: the bright layer is fully reachable (conversations,
  feasts, moots, friendships all fire in volume). The dark layer
  is reachable in week one plus revenge echoes, and — corrected
  this run — its escaped springs DO surface, through cases,
  gossip, and moots the player sits on. Unsprung plots (expired)
  remain the invisible kind: no case, no grievance, only a
  declined lure in the wrapper log.
- Fun: conversations read as real people (see M4); villagers say
  no, often (M3); feuds now visibly escalate and get tried.
- Winnable: not assessable on this leg's horizon — no village
  lived long enough for the social layer to matter to a win.
  M5 fails a third panel running, stated plainly.

## Fixes this run

None to src/js. Deliberately: M2's overturn removes the
surfacing-fix candidate r113 left open (the case channel already
surfaces escaped springs), the accomplice threshold and vendetta
re-arming are Steve-call design/gating questions under the
gating freeze, and the survival cause is unbisected. Delivered
instead: the r120 panel + arming-time/spring-trace instruments
(r113's prescribed next instrument, proven working), the
analyzer, and three named findings (arming motive is grievance
on all plots; escaped springs surface via case+moot+juror;
survival still 0/4, with a new attrition shape, not clusters).

## Regression check

`node scripts/check.js --quick` in the worktree: 284 passed, 6 failed
in 599s (full log at
evidence/2026-11-03/journey-social-life-r120-checkquick.log). The 6
are exactly the standing pre-existing families from r113
(measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes) — no new failure from this run. No src/js,
docs, or test file changed except new files (driver, analyzer,
evidence), so no regression is expected from this run; the 6 are
left for their owning lanes. Check run on base 172f01311.

## Metric review (§14)

- M2's "still open at end" clause is the wrong test for surfacing:
  a case that reaches a verdict WITH the player as juror is more
  surfaced than an open one. Next run: GO if an escaped spring's
  case reaches knownToPlayer/juror status or a verdict, regardless
  of open/closed at end.
- The ambushLines filter (/ambush|sprang|trap|betray/) misses the
  discovery line ("stands accused over what happened to") and
  therefore undercounts surfacing. Next run: extend the filter
  with 'stands accused' and 'Word reaches you', or count case
  framing lines in transcripts (the reliable read this run).
- The driver `ms` field is nonsense (frozen harness clock: -2s
  to -33369051s). Cosmetic only — the panel timing claim in this
  note does not use it. Next run: use a monotonic timer for ms.
- M5's guardrail did its job a third time: it stopped a
  within-window dark-channel read from being reported as a
  full-leg verdict.
- Telemetry check (closeout): ran against the social.json
  baseline plus the r120 per-seed JSONs with the correct l3.*
  keys — all five legacy keys LOUD-disappeared (bonds 318,
  deepBonds 168, betrayalCases 8, mootsConvened 7, gossipConvos
  99 → current 0), the same schema drift r112/r113 established:
  the social driver never emits l3.* fields, so the tool reads
  absence, not a game deviation. Baseline NOT rolled forward.
  (An earlier invocation with unprefixed metric names reported
  "quiet" vacuously — the l3.* run is the valid one.)

## Evidence

- evidence/2026-11-03/journey-social-life-r120-prereg.md
- evidence/2026-11-03/journey-social-life-r120-41401.json
- evidence/2026-11-03/journey-social-life-r120-41402.json
- evidence/2026-11-03/journey-social-life-r120-41403.json
- evidence/2026-11-03/journey-social-life-r120-41404.json
- evidence/2026-11-03/journey-social-life-r120-panel.log
- evidence/2026-11-03/journey-social-life-r120-checkquick.log
- scripts/journey-social-life-r120-20261103.js
- scripts/analyze-journey-social-r120-20261103.js
