# Journey succession r46 — CALL-SCOPED OFFICE ATTRIBUTION + ECHO V2B (lane B, 2026-10-25)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
Pre-registration: evidence/2026-10-25/journey-succession-r46-prereg.md (written
BEFORE any run). Instrument only, no src/js changes. Merged locally, pending ship.

## Question (r45's three named next steps)

1. Does the loot-excluded echo bar (v2b) hold up in the wild?
2. Does narrowing office-move evidence from the day to the runDays call
   move the writer question forward?
3. Does the died-between branch finally get field-tested?

## Binding verdicts (§14)

- V1 (vouch snapshot): GO ON THE LETTER, COVERAGE REGRESSED. All 5 seeds
  resolve under r45's rule with no snapshot-timing artifact and no FAIL —
  but all 5 first deaths were ORGANIC phase-A deaths (the arena, days 8–28),
  so the scripted branch staged ZERO seeds this run (r45 had 1 scripted
  seed with eligible vouchers). 26015 is PASS-fired (organic, vouch line
  fired); 26011–26014 are organic-n/a (no eligible vouchers at funeral).
  The died-between branch is STILL unexercised, now two runs running.
  The scripted regime is fragile by construction: the competent policy
  walks the bearer into the arena early, and the arena kills before the
  scripted kill day. This is a methodology gap, not a game bug — see
  "Next for succession" for the evidence-backed fix (EARLY_KILL_DAY=5
  staged a scripted kill on proof seed 24999).
- C1 (call attribution): GO on completeness, finding attached. 20/20
  officeDaily moves have a matching callMove (same day, missing=[] on all
  5 seeds); every callMove carries office before/after, a per-villager
  trust diff, and bucketed call lines summing to the call line total.
  - Both channels exist. Concentrated (single-mover) moves: 26013 (2/3),
    26015 (3/8) — deed-like. Diffuse (≥3 movers) jumps: 26012 (1/1, all 10
    villagers +8..+10 in one call), 26014 (1/1, 8 villagers +5..+9),
    26015 (3/8). Solo sub-threshold creep: 26015 (2 calls, office +1/+2
    with no mover ≥3).
  - The diffuse jumps ride on EVENT-DENSE calls, and the samples name the
    events: 26012's jump call carries a stranger arrival ("do you share?"),
    a trader arrival ("Word travels"), a SYSTEM QUEST and a neural-depth
    upgrade; 26014's carries TRIAL COMPLETE (+15 integration, gift lesson),
    a TRIUMPH conflict-resolution beat, and THE CREEP / THE GRANT for Liam.
    Census, not attribution — but the trap target is now narrower than
    r45's 30 sites: event-beat writers (quest/trial/triumph/arrival beats)
    vs deed writers, not all writers at once.
  - Call narrowing did NOT dethrone "other": call lines are still ~90%
    other (78–142 of 84–145 lines per move call). Gift lines are present
    on nearly every trust-move call (2/2, 1/1, 3/3, 1/1, 8/8) — the most
    frequent named bucket at call level too — but presence is not cause.
- M3v2b (social echo, v2b bar): NO-GO, BINDING. v2b = 1, 1, 4, 1, 2
  (bar ≥2 on ≥4/5 seeds) → only 26013 and 26015 pass: 2/5. This is NOT a
  loot artifact: v2 itself is also 2, 1, 4, 1, 2 (2/5), so the miss is a
  genuinely thin echo, not the exclusion rule. The one place the rule bit
  is 26011: v2=2 → v2b=1, the excluded line being "You take vine from
  Riley. Your hands know what they did. (+6 trauma)" — exactly the class
  r45's metric review aimed at. The bar worked as designed; the echo
  didn't clear it. Per §14 this is reported as a miss, never re-scored.
  Substance caveat for r47: the old villager-talk filter scored 0, 0, 3,
  0, 1 — on 4/5 seeds the v2 echo is entirely system say lines naming the
  dead, not villager speech. v2b measures narration + memory, and the
  run note should not call it villager memory alone.
- M1 (funeral arc): GO 5/5 (death beat + recover + burial found, respects
  and bury all true).
- M4 (machinery): GO 5/5 (linOk + moOk).
- MG2 (meal gate): GO 5/5, 0 violations (136 audited successor meal-days
  across seeds: 30 + 23 + 30 + 23 + 30).
- M5 (people check): GO on content — 4 transcripts sense-read (below), 0
  identity failures across all seeds (identityTrips 0/5).
- Chain deaths: 5 chain mantles, ALL cause-known from fallen AND lineage
  (all 5 "the arena"). No UNKNOWN chain death.

## The headline the numbers force

ALL TEN deaths in this run — 5 first mantles + 5 chain mantles — were "the
arena". No monster kill, no starvation death, no disease death in-window.
The arena is not just the succession engine in this band (r45's finding);
it is the only death cause the competent policy stages here. That is a
design observation for Steve, not a bug claim: the arena's lethality for
bearers dominates every other mortality channel in the competent band.
Separately, the two villages that did not survive the window (26012,
26014) ended by the famine scatter — "Haven couldn't hold... people
started walking" after hungry days, pantry 0 — a legitimate ending the
death-aware stop honors, not a crash or a softlock.

## Village assessment (plain words)

- 26011 — Riley dies in the arena day 9; Abigail inherits at 24 and climbs
  to 61 while the village warms (22.9 → 70.6, six over 60). Abigail herself
  dies in the arena day 30 and Alejandra inherits. Pantry 15,114, 10 alive.
  A warm village that keeps going through two mantles.
- 26012 — Amara dies in the arena day 8; Dorothy inherits at 24, climbs
  only to 32, and dies in the arena day 30 as Ignacio inherits. The village
  warms (22.1 → 54.5) but starves: pantry 21,650 → 0, and the haven
  scatters on hungry days (game over day 30, 6 alive at the end). Warm but
  unfed — trust does not fill the pantry.
- 26013 — Caleb dies in the arena day 10; Alex inherits at 22, climbs to
  31, village warms (22.8 → 66.9, five over 60), pantry 16,719, 9 alive, no
  chain death. The cleanest single-mantle month in the run — and the only
  seed with a strong echo (v2b 4, all villager-talk).
- 26014 — Brooklyn dies in the arena day 10; Alejandra inherits at 31,
  dies in the arena day 17, Jude inherits and dies in the arena day 18,
  Liam inherits. Three mantles in eight days. The village stays cold
  (20 → 37.6, nobody over 60), pantry 17,393 → 0, haven scatters day 34
  (9 alive). A village eaten by the arena and then by hunger.
- 26015 — the mature village: Claire dies in the arena day 28; Linh
  inherits at 58 with vouchers speaking at the grave, climbs to 78, village
  53.9 → 74.3, pantry 36,681, 9 alive. Linh dies in the arena day 55 and
  Klaus inherits. This is what an established succession looks like — and
  it still ends in the arena.
- Who leads: the bearer everywhere, but trust is broad by month's end
  (2–6 villagers over 60 on surviving villages; 0 on the scattered 26014).
- Who is miserable: the hungry ones — 26012 and 26014 scattered, which is
  the game's honest answer to an empty pantry, not a hidden misery stat.
- What is missing: a scripted-kill seed (methodology, see V1); a
  writer-level account of office moves (narrowed, not closed); a strong
  echo on struggling villages (M3v2b NO-GO).

## People check (SENSE-TESTING LAW — 4 full transcripts sense-read)

- Klaus, 26015 d+3 (mature village): opens wanting the small thing ("A
  full night's sleep. Just one. Where I don't wake up listening."), funny
  and specific (the fire arguing what to CALL Highbeam Deer), ending
  resolves warmly. PASS.
- Carmen, 26012 d+3 (struggling village): opens wanting wound care ("It's
  getting worse, not better... Just clean it out and wrap it tight.") —
  a real need. The driver deflects to a betrayal-investigation thread,
  which itself engages and plants ("The ground remembers", witnesses
  named), ending with "I'll manage on my own." The wound want is dropped
  by driver picks, not resolved by the game. PASS with the driver-artifact
  note.
- Jude, 26014 d+3 (the triple-mantle village): opens wanting a hidden
  skill, then the driver runs a full betrayal arc — expose at the moot
  ("Let the fire decide what it means") then immediately let-lie ("the
  game remembers"). Contradictory picks in one convo are driver whiplash;
  each line is coherent and the arc engages. PASS with the note.
- Terrence, 26011 d+30 (late successor life): opens wanting reassurance
  about pod dreams ("Tell me I'm not the only one"), deflects ("drop it",
  "forget I said anything"), ending plants the thread (pod dreams + Kate)
  rather than resolving it. A legitimate plant, not filler. PASS.
- Warts (driver artifacts, not game bugs — same class as r44/r45): the
  double-invite tell, recap-loop close-outs ("Wait — what were we talking
  about?"), contradictory expose/letlie picks, the dropped wound want.
  The game content is human; the driver picks are the robot.
- Identity wire: 0 trips on all seeds (raw and grief-excluded).

## Blanks filled / documented

- FILLED (instrument): call-scoped office attribution — every office move
  now carries its call's lines + trust diff, replacing day-level guesswork
  with call-level candidates.
- FILLED (instrument): echo v2b — the loot exclusion works exactly as
  designed (26011's vine line excluded, flipping that seed's verdict).
- DOCUMENTED (not fixed): died-between still unexercised (2 runs); the
  trust-mutation trap still open (target narrowed to event-beat vs deed
  writers); M3v2b NO-GO stands as a miss; the arena's 10/10 death share
  is a design observation for Steve.
- NO GAME CHANGE: nothing in this run proposes a src/js edit. The village
  behavior observed (arena mortality, famine scatter, office creep on
  show-dense calls) is consistent with landed design, not a defect.

## Reachable / fun / winnable (leg 7)

- REACHABLE: yes — mantles pass on all 5 seeds, funerals complete, vouching
  fires when vouchers exist (26015). A real player reaching a death sees
  the full arc, not a stub. Caveat: the deaths a real player sees will
  almost all be arena deaths in this band.
- FUN: yes, with the grim caveat — the mature village (26015) reads as a
  genuine second life; the scattered villages read as honest tragedy
  (hunger ends the haven, people walk away) rather than a broken run. The
  arena eating 10/10 bearers is dramatic, but whether it should dominate
  mortality this completely is Steve's call.
- WINNABLE: for the leg, mixed — 3/5 successors survive the full 30d
  window; 2/5 villages scatter on hunger (a legitimate ending, not a
  failure of the leg's machinery). The leg's arc completes wherever the
  village survives.

## Metric review (§14 — revisions for the NEXT run, never re-scored here)

- M3v2b stands as a miss (2/5 vs bar 4/5). Do NOT lower the bar on one
  run: r45 passed 5/5 on v2, this run passed 2/5 on both v2 and v2b. One
  more run decides whether this band is thin-echo or the bar is
  mis-set. r47 should report the convo/say split alongside v2b (it
  already does via echoConvo/echoV2Say) and note whether thin-echo seeds
  are the struggling ones (here: both scattered seeds scored v2b 1).
- V1's scripted branch needs staging help, not a bar change: r47 should
  use EARLY_KILL_DAY=5 for its scripted-regime seeds — proof seed 24999
  staged a scripted kill at day 5 with a recorded (empty) eligible set,
  while day-10 and day-40 kills were all pre-empted by organic arena
  deaths this run. If day-5 kills also get pre-empted, the methodology
  note becomes "the arena pre-empts scripted kills in the competent
  band" and V1's bar should be restated as organic-verdict-only.
- Call-move "solo-office" calls (office moves with no mover ≥3) are
  sub-threshold creep, not a separate mechanism: the office entry IS the
  bearer's trust entry, so a +1/+2 office move with no ≥3 mover just means
  the bearer warmed by 1–2. r47 should report the bearer's own delta on
  solo calls explicitly instead of leaving movers empty.
- Telemetry baseline staleness (observed, not acted on): the succession
  baseline's week2.deadBearerMentions = 3 disagrees with both r45 (22)
  and r46 (21); the checker's own rule stays quiet (baseline < 5). A
  future run may re-baseline that metric; this instrument-only run does
  not roll any baseline.

## Regression + telemetry

- check.js --only succession: 11 passed, 0 failed (same as r44/r45).
- Proof test scripts/test-journey-succession-r46-instruments-20261025.js:
  RED (r45 lacks all r46 fields) -> GREEN (r46 carries them; proof seed
  24999: 12 callMoves, C1 cross-check ok with 12 daily moves on 11 days,
  all bucket sums equal call totals). Proof-seed 24999 outputs deleted
  after the proof (they are scratch, not run seeds).
- Telemetry: 2 LOUD lines, both INVESTIGATED and EXPLAINED (not rolled):
  - deaths.bearer 5 -> 10 (+100%): the metric counts bearer deaths
    including chains; this band staged 5 chains (r45: 2, sum 7, under the
    0.6 swing threshold hence quiet). All 10 deaths verified arena via
    fallen + lineage. Band property, not a regression; no src change.
  - census.fallen 10 -> 17 (+70%): same cause — a chain-heavy, arena-
    heavy band leaves more fallen. Explained, not a bug.
  - Quiet: census.alive 49 -> 43, integrationStage 15 -> 15. Baseline NOT
    rolled (instrument-only run, no regime change).

## Infrastructure

- Heartbeat loop kept alive throughout (10-min cadence); lock created at
  start, deleted at close.
- Safe-commit index clobber: check after commit (see landing section).
- Evidence: evidence/2026-10-25/journey-succession-r46-* (prereg, run note,
  5 stdout JSONs, 5 stderr logs, 5 tele JSONs, 36 transcripts, analyze log).
- Instrument: scripts/journey-succession-r46-20261025.js,
  scripts/test-journey-succession-r46-instruments-20261025.js,
  scripts/analyze-journey-succession-r46-20261025.js.

## Next for succession (r47, when the rotation returns to 7)

- Scripted-regime seeds at EARLY_KILL_DAY=5 (see V1 / metric review).
- Bearer-own-delta on solo-office calls (see metric review).
- Trust-mutation trap narrowed to event-beat vs deed writers (see C1).
- One more v2b run before any bar revision (see metric review).
- Opportunistic died-between field test (still open).
