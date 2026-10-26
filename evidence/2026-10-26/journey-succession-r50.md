# Journey succession r50 — MIXED REGIME + MUTATION-SITE TRUST TRAP + SOLO-CREEP LONG WINDOW (lane B, 2026-10-26)

Leg 7 (succession). Rotation-b 7 → 4 (endgame next). Seeds 26051–26055
(fresh band), competent policy, mixed regime: 26051–26052 scripted day-5
kills, 26053–26055 mature (EARLY_KILL_DAY=40), 45-day successor window
(POST_DAYS=45, convo checkpoint +45 added). Instrument only, zero src/js
changes. Base master@388396773 at run start (ship loop's 17:26 UTC batch).
Merged locally, pending ship (no bump/push/live check — ship loop owns those).

Pre-registration: evidence/2026-10-26/journey-succession-r50-prereg.md
(written BEFORE any run). Instrument: scripts/journey-succession-r50-20261026.js
+ analyzer + proof test, all new files in this commit.

## HEADLINE

The trust-move writer is FOUND, and it was never mysterious. Two writers
move the office entry, and the mutation trap names both:

1. bumpTrust (the ordinary one): 26 of 45 daily transitions are
   bump-explained, with named reasons — fetched creek water, hauled
   wood, pried stone, kept the haven fed/work going, foraged the
   wilds. 3,551 bump calls trapped this band, 99% carrying a reason
   string and a code site (game.js haven-work lines, villager-objectives
   outing lines).
2. The donation credit (the hidden one): donateToPantry's
   _creditPantryGift writes v.trust[vid] DIRECTLY (game.js:15398),
   bypassing bumpTrust entirely — no reason, no trust telemetry event.
   The donor is the bearer, so every bearer donation moves the office
   with no bump entry. That is 11 direct transitions (bearer as sole
   mover, e.g. Amara 43→50 on a "Donated Muscadine Grapes (+3510 kcal).
   Trust +7" line) plus 5 deed-day solo transitions (bearer +1 with no
   mover over the threshold, on donation days). Donation-attributable:
   16 of 45 transitions. This also explains r49's 34% no-deed class
   from the other side: the deed trap measured donateToPantry's first
   argument (an inventory index, not a villager), so the deed that
   moved the office registered as moving nothing.

The band's other first: the over-cause branch is EXERCISED at last.
Seed 26055's village scatters on day 64 (death +23): pantry empty,
day 5 of hunger, Rosa starved, "people started walking — in different
directions. The scattering, again." The succession machinery held
(funeral arc, mantle clean) while the village itself failed — a
failure that resolves the story instead of deleting it, exactly as
the endgame design intends. r48/r49's "over=true unexercised" caveat
is closed.

Solo-office creep is BOUNDED, not runaway: 8 solo moves in the whole
band, all +1/+2, all in the d+31–45 window on the two young seeds,
cumulative +5/+4 — and 7 of 8 sit on donation days (the eighth is a
day-boundary residual: a +1 talk bump on day 42 plus an adjacent-day
donation inside one runDays call). The late-window clustering is a
saturation artifact (other villagers hit their trust caps and stop
moving), not acceleration: 4 events per seed in 15 days, capped at
100, donation-driven.

## Verdicts (binding, §14 — a miss is NO-GO, never re-scored)

- SCRIPT (young staging): GO — 2/2 day-5 seeds staged the scripted kill
  (26051 d5 Maya→Amara, 26052 d6 Robin→Mia).
- MATURE seeds: 26053 pre-empted organically at d12 (Megan→Ivan, arena
  chain later), 26054 scripted d40 (Fernando→Diego), 26055 scripted
  d41 (Benjamin→Reagan). Scripted-or-organic honored on all seeds.
  Organic pre-emption timing varies by band (r48: d12/d18, r49: none,
  r50: d12) — a band effect, not a law.
- V1 (vouch snapshot): GO — 2/2 non-vacuous mature seeds PASS-fired
  (26054: 10 eligible, all alive post-death, 1 vouch line; 26055: 2
  eligible, 1 vouch line). Young seeds n/a-none-eligible (expected);
  26053 organic n/a (no pre-death snapshot, per the standing rule).
  No FAIL-alive-silent anywhere. Died-between still empty.
- C1v3 (transition rule, binds): GO 5/5 — 45 transitions, 0 missing
  (19 + 22 + 2 + 1 + 1, all byCall; convo-window branch unexercised
  this band — 0 convoWindowMoves, same as r49's quiet band).
- C1v2 (final run, reported not binding): GO 5/5 — 45 daily move days,
  0 missing. Dropped from r51 per r49's review.
- W1a (mutation-trap completeness, binds): GO — 45/45 transitions
  classified: bump 26, direct (donation-credit) 11, deed-day solo 5,
  chain handoff 3, unexplained 0. The 3 handoffs are inheritance
  entries (26052 d51 Mia→Benoit 96→92, 26053 d38 Ivan→Mara 34→63,
  26054 d60 Diego→Rahul 86→90), not trust moves — the analyzer's first
  pass misread them as unexplained, corrected before verdict.
- W1b (writer found, binds): GO both ways — strict (handoffs in the
  denominator): 5/8 no-deed transitions bump-explained (0.625 ≥ 0.5);
  trust-moves only: 5/5 (1.0). The mutation trap closes the writer
  question: every non-handoff transition is bump, donation, or both.
- S1 (bearer-own delta, carried): GO — 0 missing bearerDeltaExact,
  0 bad solo (|delta| ≤ 2 everywhere; solo deltas 1,1,2,1 and 1,1,1,1).
- MG2v2 (meal-line only, binds): GO 5/5, 0 violations (audit days
  45, 45, 45, 45, 23). Old MG2 also 0 — reported, not judged, per the
  r49 retirement. The 26054 funeral-window "Half ration" line is not
  a meal-line violation (audit clean).
- M3v2b (social echo, carried): GO 5/5 — (2, 3, 2, 9, 3), all ≥ 2.
- M1 (funeral arc): GO 5/5. M4 (machinery): GO 5/5 mantles clean
  (linOk + moOk, including all 3 chain mantles).
- OVER-CAUSE: EXERCISED — 26055 over=true, villageLost=true, won=false,
  alive=3, pantryEnd=0 (see Headline). The other seeds over=false.
- SOLO (exploratory, not binding): bounded (see Headline).
- Chain deaths: 3, all cause-known (26052 Mia→Benoit "the arena" d51;
  26053 Ivan→Mara "the arena" d38; 26054 Diego→Rahul "the arena" d60).
- M5 (people check): GO with warts — 5 transcripts sense-read in full
  (below), 0 identity failures (identityTrips=0 all seeds).

## Village assessment in plain words

- 26051: Maya dies to a hushwolf on day 5; Amara takes the mantle at
  19 and climbs to 74 while the village warms 16.1→64.6. Pantry grows
  28,623→39,256. 8 alive at end (11 at the death; 2 more fallen
  recorded). A young village that steadies and climbs.
- 26052: Robin dies day 6; Mia takes over at 18, climbs to 92 — then
  dies in the arena on day 51 and Benoit inherits at 92. Pantry
  29,600→84,244, 8 alive. Two mantles, richest young village.
- 26053: Megan dies organically day 12 (before the scripted band
  opens); Ivan inherits at 33, climbs to 63, dies in the arena day 38
  and Mara inherits at 63. Pantry thins 27,150→14,222 but holds,
  9 alive. The organic-pre-emption seed, twice over.
- 26054: Fernando dies day 40; Diego inherits at 86 with ten
  villagers over 60, climbs to 90, dies in the arena day 60 and Rahul
  inherits at 90. Pantry 113,719→83,334, 10 alive. The
  well-established succession, twice over, and the loudest echo
  (v2b 9).
- 26055: Benjamin dies day 41; Reagan inherits at 54 and goes FLAT
  (54→54) while the village warms 52.9→70.7 — and the pantry runs out.
  Day 64: Rosa starves, fifth hungry day, the village scatters, 3
  alive, pantry 0. The successor who held trust and lost the food:
  the office didn't crash, the pantry did. Zero post-death deed calls
  on this seed — the successor never taught or donated while the
  village starved, which the census records without explaining.

Who leads: the bearer <redacted> every village; by month's end trust is
broad on the surviving villages (4–10 villagers over 60 where counted).
Who is miserable: 26055's village, terminally — everyone else is fed.
What is missing: nothing structural on this band — the missing piece
remains content (the foraging outing, third instance), not machinery.

## People check (sense-reads, SENSE-TESTING LAW)

Read in full, one per seed at d+7 (26054's d+3 fired as d+4, day-part
quirk, same as r49): 26051 Leo (thin — betrayal-case menu play, "the
ambush of Xavier" named, ends in filler "where was I?"); 26052 Elena
(the blank, third instance — strong want, "the pantry's nearly bare...
we're choosing who eats," then the game's own admission "There is no
playable joint foraging outing yet"; honest deflection afterward,
"They won't forget. They'll just stop asking"); 26053 Jesse (weak —
secret-place beat "Don't tell the others," then drifts; double-invite
tell again); 26054 Rahul (PASS — the mourning done right: "Nobody
says Fernando's name right yet. We will," "I'm picking up Fernando's
share of the work," Jewelweed teaching accepted); 26055 Jesse (mixed —
grief "I dreamed Jorge was still here. Woke up angry at the dream,"
then a stall ending "lost my train of thought"; double-invite tell
again). No fabricated shared history, no filler loops as structure.
Driver artifacts, not game bugs: the double-invite tell in 2/5
transcripts (26053, 26055), same as r44–r49.

## Blanks filled or documented

- FILLED (instrument): W1 mutation-site classification — 45/45
  transitions classified, 0 unexplained.
- FILLED (finding): the trust-move writer — bumpTrust plus the
  donation credit's direct write (game.js:15398). The r49 34%
  no-deed class is explained: deeds move the bearer's trust through a
  path the deed trap measured as moving nothing (first argument is an
  inventory index), and bumpTrust never sees it.
- FILLED (thread): over-cause — 26055 exercises the over=true branch
  with a named cause (starvation scatter), closing r48/r49's caveat.
- FILLED (question): solo-office creep — bounded, late-window,
  donation-driven, capped; not runaway.
- DOCUMENTED (content blank, third instance): the joint-foraging
  outing is unplayable — Elena's forage-tomorrow ask resolves to the
  real game line at src/js/convo-wants.js:1607. r48 Blanca, r49
  Darius, r50 Elena: three bearers, same dead end. Design-sized
  build, Steve's call, not this run's.
- DOCUMENTED (content warts): Leo's thin betrayal menu; Jesse's drift
  ending; double-invite tell persists (2/5).
- DOCUMENTED (instrument residual, explained): one solo move
  (26051 d43 +2) has no same-day deed — its call spans the day
  boundary (bump dated day 42, donation on day 42), so day-join misses
  it; the call itself is fully explained by bump + donation jointly.
  Day-join residuals of this class are boundary artifacts, not
  writers.

## Telemetry deviation check

`node scripts/telemetry-check.js` vs telemetry-baselines/succession.json
(metrics: deaths.bearer, census.fallen, census.alive,
week2.deadBearerMentions, succession.echoV2b,
succession.callMovesSoloOffice): FOUR LOUD lines, all EXPLAINED,
baseline NOT rolled (same call as r46–r49: rolling on a
regime-changed band would launder the regime effect into the
baseline):
- "deaths.bearer <redacted> 60%: baseline 5 → current 8 (n=5)": 3 chain
  mantles this band (arena deaths) vs a baseline band with none.
- "census.fallen swung 110%: baseline 10 → current 21 (n=5)": 3+3+3+2+10;
  the 10 is 26055's scatter (7 extra fallen), the rest chain deaths.
- "succession.echoV2b newly appeared: baseline 0 → current 19 (n=5)":
  baseline predates the echoV2b key (added r46); current total 19 =
  2+3+2+9+3, exactly the analyzer's M3v2b sum.
- "succession.callMovesSoloOffice newly appeared: baseline 0 → current
  8 (n=5)": the solo class opened r49 (11) and holds 8 this band
  (4+4+0+0+0), all +1/+2 within bound — a populated class, not a bug.

## Regression

`node scripts/check.js --only succession --cacheDirectory=/tmp/jest-cache-playtest2`:
11 passed, 0 failed in 26s (same as r47–r49).

## Metric review (for the NEXT run, never re-scored here)

- W1: bar stands, but the classification's next refinement is the
  donation join itself: the analyzer should join callMoves to
  _creditPantryGift lines directly (donation kcal → trust gain), not
  via deed-day presence, so a donation move is named as such rather
  than inferred. The r51 instrument can do this from the call's own
  say lines ("Donated X. Trust +N") without a new driver trap.
- C1v2: DROPPED from r51 (this was its final run, 5/5, per r49's
  review). C1v3 remains the transition rule.
- MG2: old regex stays retired (not judged); MG2v2 binds.
- A1: stays retired (armor maps kept for continuity only).
- V1: keep the mixed regime — mature seeds are what make V1
  non-vacuous (2/2 PASS-fired this run on the non-vacuous seeds).
- Over-cause: now exercised; keep as a watch, not a gap. The next
  collapse-shaped band should check whether overCause distinguishes
  starvation scatter from other village ends (arena wipe, walkout).
- Died-between: still empty; keep as a rare-branch watch.
- Solo-creep: CLOSED as a question (bounded, donation-driven). Keep
  only as a continuity count, not a question.
- Next for succession (r51): mixed regime again; donation-join
  refinement of W1; re-test the foraging-outing blank only if Steve
  rules it in scope (design-sized build); the 26055 seed class —
  a successor who never deeds while the village starves — is worth a
  dedicated question (does competent play deed at all when the pantry
  is thin, or does it hoard?).

## Infrastructure

- No lock at run start (no prior lane-B lock); lock created
  17:55:50Z, deleted at closeout; rotation-b read 7, written back 4.
- Worktree registration clean (no EPERM flap this run, unlike r48);
  heartbeat loop kept journey2-succession fresh throughout, verified
  landed after loop start (17:59:06 UTC) per the 2026-10-25 lesson.
- Sibling trees left untouched: journey2-endgame (stale heartbeat
  15:27 UTC, dirty — reaper LOUD, never touched) and
  journey-establishment (lane A, heartbeat 17:51 UTC, active).
- Proof test ALL GREEN first try (RED on the r49 driver lacking
  bumpLog/bumpEntries, GREEN on the r50 driver; proof-seed 24999 tele
  + transcripts deleted after GREEN).
- No sibling landed mid-run (master stayed 388396773 from registration
  through the seed batch); no rebase needed at landing.
- Safe-commit index clobber: checked after commit (see landing notes
  in the run record); worktree verified clean before release.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes — the succession machinery holds across scripted
  mantles, organic pre-emptions, chain mantles, and a full village
  scatter, with the strongest writer attribution yet.
- FUN: yes, with warts — the social texture is the run's strength
  (Rahul's Fernando mourning, Elena's honest deflection), and the
  main drags are the foraging-outing dead end (third instance) and
  the stall/drift endings (Leo, Jesse).
- WINNABLE: yes, with a real failure mode — four villages end fed
  (14,222 to 84,244 pantry kcal) with the bearer climbing or holding;
  the fifth starves and scatters, which is a legible failure (pantry
  ran out while trust held), not a machinery break. Winnability still
  rides on the food economy, and competent play usually keeps the
  village fed through two mantles.
