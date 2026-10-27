# Journey succession r51 — DONATION-JOIN + DEED-WHEN-THIN (lane B, 2026-10-26)

Leg 7 (succession). Rotation-b 7 → 4 (endgame next). Seeds 26061–26065
(fresh band), competent policy, mixed regime: 26061–26062 scripted day-5
kills, 26063–26065 mature (EARLY_KILL_DAY=40), 45-day successor window.
Instrument only, zero src/js changes. Base master@2b4e79abf at run start.
Merged locally, pending ship (no bump/push/live check — ship loop owns those).

Pre-registration: evidence/2026-10-26/journey-succession-r51-prereg.md
(written BEFORE any run). Instrument: scripts/journey-succession-r51-20261026.js
+ analyzer + proof test, all new files in this commit.

## HEADLINE

The donation join closes the writer question, and it does it from the
call's own lines — no day-join inference at all.

1. W1d: of the 11 transitions the implemented subset calls direct or
   deed-day solo, 10 carry a donation line on their covering call
   ("Donated Cattail (+3600 kcal). Trust +2. They'll remember this.").
   The mystery-only share is 10/10: every r50 single-label direct
   transition (4) and every deed-class solo transition (6) is named
   by a donation line with its kcal and its trust gain. The one
   subset miss (26065 entryD65) is a definition artifact, not a
   mystery move: that transition is bump-explained ("shared a quiet
   talk") and merely sits on a deed day, so it entered the subset
   through the solo+deed-day clause while already having a writer.
2. The solo-office class IS the donation credit. A donation moves the
   bearer by exactly +1/+2, below the trust-map mover threshold (3),
   so it registers as "no movers" — soloOffice. All 14 solo moves
   this band are +1/+2, and the young seed's eight +2s are Cattail
   donations one after another. There is no second writer left to
   find: bumpTrust (haven work, hauls, water, stone) plus the donation
   credit (direct write, bypassing bumpTrust) explain the office.
3. The call-scoped join beats day-join outright. Two 26061 solo moves
   (d39, d43) carry donation lines in their own calls while the
   deedLedger shows NO deed on those days — the deed trap's day stamp
   and the call's end day differ when a call spans the day boundary
   (the r50 boundary class). Day-join called them unexplained; the
   call's own line names them. Any future trust attribution should
   join to the call, never to the day.

DEED-WHEN-THIN answer: deeds are seed-shaped, not pantry-shaped.
26061 deeds ON thin days (5 deeds at pantry 9,900–12,969, including
3 donations at 9,900) and ends the richest village in the band.
26064 never deeds at all in 45 days — no teach, no donate — while
its pantry dips to 6,240, yet its office still climbs 40→85 on bumps
alone and the village ends fed. 26063 and 26065 deed only AFTER
recovery (26063's 7 deeds all at d+35 or later, pantry 16,966+;
26065's 5 teachPlant deeds all after the pantry climbs from 7,192
to ~20,000). So the 26055 pattern (a successor who never deeds while
the village is thin) repeats as 26064 — but 26061 proves thinness
alone does not suppress deeds. The next question is what gates the
deed triggers (inventory? untaught plants? policy state?), not the
pantry level.

## Verdicts (binding, §14 — a miss is NO-GO, never re-scored)

- SCRIPT (young staging): GO — 2/2 day-5 seeds staged the scripted kill
  (26061 d6 Rocco→Sofia, 26062 d6 Tiana→Heidi; the kill lands day 6,
  same as the proof seed).
- MATURE seeds: 26063 pre-empted organically at d9 (Duc→Ariana),
  26064 pre-empted organically at d18 (Luigi→Stephen), 26065 scripted
  d41 (Declan→Jonathan). Scripted-or-organic honored on all seeds.
  Organic pre-emption is now 3 of the last 4 mature seeds across
  r50–r51 (r50: d12; r51: d9, d18) — a band effect, not a law.
- V1 (vouch snapshot): GO — the one snapshot seed with eligible
  villagers PASS-fired (26065: 3 eligible, all alive post-death,
  1 vouch line). Young seeds n/a-none-eligible (expected). Organic
  seeds: 26064 PASS-fired as detail, 26063 n/a-organic (no vouch
  lines, no snapshot — the standing organic rule). No
  FAIL-alive-silent anywhere. Died-between still empty.
- C1v3 (transition rule, binds): GO 5/5 — 47 transitions, 0 missing
  (18 + 14 + 5 + 5 + 5, byCall 46 + byConvoPrev 1).
- C1v2: DROPPED this run (r50 was its final run), not computed as a
  verdict, per the r50 metric review.
- W1a (mutation-trap completeness, binds): GO — 47/47 transitions
  classified (r50 single-label): bump 30, deed 6, direct 4, handoff 3,
  unexplained 4. The 4 unexplained are all solo moves whose covering
  calls DO carry donation lines — unexplained only under the r50
  single-label scheme, which ranks bump/deed/direct before donation;
  under the r51 donation-precedence labels they are donation moves.
  (This is a scheme artifact, documented here, not a writer gap:
  31 of 47 transitions carry a donation line on their covering call.)
- W1b (writer found, carried): strict 13/22 no-deed transitions
  bump-explained (0.59); trust-moves only 13/20 (0.65). Both above
  the 0.5 bar, same as r50.
- W1d (donation join, binds as a finding bar): GO — implemented
  subset 10/11 (0.91 ≥ 0.5); mystery-only subset (direct + deed-class
  solo, excluding the bump-classified artifact) 10/10 (1.0).
- S1 (bearer-own delta, carried): GO — 0 missing bearerDeltaExact,
  0 bad solo (|delta| ≤ 2 everywhere).
- MG2v2 (meal-line only, binds): GO 5/5, 0 violations (audit days
  45 × 5). Old MG2 also 0 — reported, not judged.
- M3v2b (social echo, carried): GO — (2, 2, 1, 4, 7), 4/5 seeds ≥ 2.
  26063 at 1 is a watch, not a miss (the bar is ≥ 4/5).
- M1 (funeral arc): GO 5/5. M4 (machinery): GO 5/5 mantles clean
  (linOk + moOk, including all 3 chain mantles).
- OVER-CAUSE: unexercised this band — all 5 villages survive (over
  false everywhere, alive 7–11, pantryEnd 21,267–143,788). Watch only.
- SOLO (continuity only, question closed r50): 14 solo moves, all
  +1/+2, cumulative +16/+3/0/+1/+3 — bounded, donation-driven.
- Chain deaths: 3, all cause-known (26062 Heidi→Hassan "the arena"
  d9; 26064 Stephen→Alejandro "sickness" d35, Alejandro→Felix
  "contest" d59).
- M5 (people check): GO with warts — 5 transcripts sense-read in
  full (below), 0 identity failures (identityTrips=0 all seeds).

## Village assessment in plain words

- 26061: Rocco dies to a hushwolf on day 6; Sofia takes the mantle at
  17 and climbs to 73 while the village warms 14.3→70.6. Pantry grows
  30,200→143,788 — the richest village in the band, built on Sofia's
  relentless Cattail donations. 10 alive at end. A young village that
  gets rich by giving.
- 26062: Tiana dies day 6; Heidi takes over at 20, climbs to 81 —
  then dies in the arena on day 9 and Hassan inherits. Pantry
  29,600→54,065, 10 alive. Two mantles, the second-youngest success.
- 26063: Duc dies organically day 9; Ariana inherits at 23, climbs
  to 58, and the village warms 26.1→84.8 — the warmest mean in the
  band. Pantry 23,890→40,643, 11 alive. The organic-pre-emption seed;
  deeds only arrive late (d+35 onward).
- 26064: Luigi dies organically day 18; Stephen inherits at 40,
  climbs to 85, dies of sickness day 35 and Alejandro inherits, who
  dies in a contest day 59 and Felix inherits. Pantry 20,500→21,267
  (dipped to 6,240), 7 alive. Three mantles, zero deeds all window —
  the successor line that never teaches or donates, yet the village
  holds on haven work alone.
- 26065: Declan dies day 41 (scripted, mature); Jonathan inherits at
  58, climbs to 63, village mean reaches 88.4 — the highest in the
  band. Pantry 7,192→24,639 (started thinnest, recovered), 8 alive.
  The well-established succession; deeds are teachPlant only, only
  after recovery.

Who leads: the bearer <redacted> every village; by month's end trust is
broad on the surviving villages (5–10 villagers over 60 where counted).
Who is miserable: nobody terminally — 26064 is thinnest but fed at
end; everyone else is comfortable or rich.
What is missing: nothing structural on this band — the missing piece
remains content (the foraging outing, two more instances this run),
not machinery.

## People check (sense-reads, SENSE-TESTING LAW)

Read in full, one per seed at d+7 (26063's d+7 fired as d+8, day-part
quirk, same class as r49–r50): 26061 Lucas (PASS — healer want,
"Everything's broken — bodies, tools, people. I fix things," teaches
Cattail) and Mariana (naming debate, ends in the stall line);
26062 Avery (PASS with warts — grief-thread callback done right:
"We never finished talking about grief — we left it mid-thought,
4 days back," quoting the d+3 ending; then the double-invite tell
and stall ending); 26063 Ines (PASS — scholar voice, "Duc always
took the burnt piece. I take it now," a grief ritual in one line);
26064 Greta (mixed — poignant favor owed by the dead Luigi, "Luigi
owed me a favor. I keep thinking about collecting. Stupid," then
the stall ending); 26065 Shannon (PASS — the mourning done right:
"Nobody says Declan's name right yet. We will"). No fabricated
shared history, no filler loops as structure. Driver artifacts, not
game bugs: the double-invite tell and the "lost my train of thought"
stall ending persist across seeds (same as r44–r50).

## Blanks filled or documented

- FILLED (instrument): W1d donation join — 10/11 subset, 10/10
  mystery-only, each named with kcal and trust gain from the call's
  own line.
- FILLED (finding): the solo-office class IS the donation credit —
  +1/+2 moves below the mover threshold, not a separate writer.
- FILLED (method): call-scoped joins beat day joins — d39/d43 prove
  a donation line can live in a call whose deed-trap day differs.
- FILLED (question): deed-when-thin — answered "seed-shaped, not
  pantry-shaped" (26061 deeds while thin; 26064 never deeds at all;
  26063/26065 deed only after recovery). The next question is the
  deed trigger, not the pantry level.
- DOCUMENTED (content blank, 4th and 5th instances): the joint-foraging
  outing is unplayable — 26061 Lucas ("We're eating through stores
  faster than we replace them. Forage with me tomorrow?") and 26063
  Tyrone ("The pantry's nearly bare. Will you forage with me
  tomorrow?") both resolve to the real game line at
  src/js/convo-wants.js:1607, with the honest deflection afterward
  ("They won't forget. They'll just stop asking"). r48 Blanca, r49
  Darius, r50 Elena, r51 Lucas, r51 Tyrone: five bearers, same dead
  end. Design-sized build, Steve's call, not this run's.
- DOCUMENTED (content warts): betrayal-case menu play stays thin
  (26062 Avery, "the ambush of Desmond"); stall endings persist.
- DOCUMENTED (instrument quirk, harmless): officeDaily can repeat a
  day (26061 day 39 appears twice, office 62 both times, pantry
  differing) — the DEED-THIN join takes the last entry on or before
  the deed day, so repeats do not change any band.
- DOCUMENTED (coverage note): 48 transcripts, not 50 — 26064's d+45
  pair never fired because that seed's post window ran 44 days
  (dayAdv=44). Nothing missing; the window simply ended a day early.

## Telemetry deviation check

`node scripts/telemetry-check.js` vs telemetry-baselines/succession.json
(metrics: deaths.bearer, census.fallen, census.alive,
week2.deadBearerMentions, succession.echoV2b,
succession.callMovesSoloOffice): THREE LOUD lines, all EXPLAINED,
baseline NOT rolled (same call as r46–r50: rolling on a
regime-changed band would launder the regime effect into the
baseline):
- "deaths.bearer <redacted> 60%: baseline 5 → current 8 (n=5)": 5 first
  deaths + 3 chain mantles this band (arena, sickness, contest) vs
  a baseline band with none.
- "succession.echoV2b newly appeared: baseline 0 → current 16 (n=5)":
  baseline predates the echoV2b key (added r46); current total 16 =
  2+2+1+4+7, exactly the analyzer's M3v2b sum.
- "succession.callMovesSoloOffice newly appeared: baseline 0 →
  current 14 (n=5)": the solo class opened r49 (11) and holds 14 this
  band (8+2+0+1+3), all +1/+2 within bound — a populated class, not
  a bug. (Now explained as donation credits, see Headline.)
- No LOUD lines for census.fallen, census.alive, or week2 mentions
  this band (no scatter, unlike r50's fallen swing).

## Regression

`node scripts/check.js --only succession --cacheDirectory=/tmp/jest-cache-playtest2`:
11 passed, 0 failed in 117s (same as r47–r50).

## Metric review (for the NEXT run, never re-scored here)

- W1d: bar stands, but the subset definition needs tightening: the
  NEXT instrument should define the subset as r50 single-label
  direct + deed-class solo ONLY, excluding bump-classified
  transitions that merely sit on a deed day (the 26065 artifact).
  The donation-precedence label table should stay secondary to the
  overlap table — precedence masks bump, and the overlap (bump∩donation
  9/7/2/0/0) is the honest view.
- DEED-THIN: retire the pantry-band framing as the question. The
  next run's question is the deed trigger: what makes competent play
  teach or donate on a given day — inventory on hand? an untaught
  plant in the village? a policy-state gate? 26064 (zero deeds) vs
  26061 (30 deeds) is the contrast pair to instrument, not
  thin-vs-fed.
- C1v2: DROPPED this run, confirmed gone from the analyzer (only
  the DROPPED label line remains). C1v3 remains the transition rule.
- MG2v2: binds, unchanged. M3v2b: 26063 at 1 is a watch; the bar
  (≥4/5) held exactly.
- Over-cause: unexercised this band; keep as a watch, not a gap.
- Died-between: still empty; keep as a rare-branch watch.
- Solo-creep: stays continuity-only.
- Next for succession (r52): mixed regime again; tightened W1d
  subset definition; deed-trigger contrast (26064-class vs
  26061-class seeds); re-test the foraging-outing blank only if
  Steve rules it in scope (design-sized build).

## Infrastructure

- No lock at run start (no prior lane-B lock); lock created
  03:55:53Z, deleted at closeout; rotation-b read 7, written back 4.
- Worktree registration slow but clean: the register script's
  checkout took ~6 minutes (a sibling reap held the registry lock
  plus a slow worktree checkout; both resolved on their own, no
  action taken). Heartbeat loop verified landed after loop start
  (04:03:02 UTC) per the 2026-10-25 lesson, and re-heartbeated
  through the run.
- Sibling trees left untouched: journey2-social (same-owner stale
  tree, dirty — reaper LOUD, never touched) and the other active
  sim trees.
- Proof test ALL GREEN first try (RED on the r50 driver, GREEN on
  the r51 driver; proof-seed 24999 tele + transcripts deleted after
  GREEN). Proof-seed consistency note: 17 donationLines = 17
  deedLedger donateToPantry calls on the proof seed.
- No sibling landed mid-run (master stayed 2b4e79abf from
  registration through the seed batch); no rebase needed at landing.
- Safe-commit index clobber: checked after commit (see landing notes
  in the run record); worktree verified clean before release.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes — the succession machinery holds across scripted
  mantles, organic pre-emptions, triple chain mantles, and a
  zero-deed successor line, with the trust-writer question now
  closed by direct line evidence.
- FUN: yes, with warts — the social texture is the run's strength
  (Ines taking the burnt piece, Shannon on Declan's name, Avery's
  grief callback), and the main drags are the foraging-outing dead
  end (two more instances) and the stall/drift endings.
- WINNABLE: yes — all five villages end fed (21,267 to 143,788 pantry
  kcal) with the bearer climbing or holding (office 58–85 at end);
  winnability still rides on the food economy, and competent play
  keeps the village fed through up to three mantles — even, on
  26064, without a single deed.
