# Journey succession r52 — TIGHTENED W1d + DEED-TRIGGER (lane B, 2026-10-27)

Leg 7 (succession). Rotation-b 7 → 4 (endgame next). Seeds 26071–26075
(fresh band), competent policy, mixed regime: 26071–26072 scripted day-5
kills, 26073–26075 mature (EARLY_KILL_DAY=40), 45-day successor window.
Instrument only, zero src/js changes. Base master@3a12db1aa at run start.
Merged locally, pending ship (no bump/push/live check — ship loop owns those).

Pre-registration: evidence/2026-10-27/journey-succession-r52-prereg.md
(written BEFORE any run). Instrument: scripts/journey-succession-r52-20261027.js
+ analyzer + proof test, all new files in this commit.

## HEADLINE

The deed trigger is not any of the five gates — and teaching, as the game
actually exercises it, is re-teaching.

1. TIGHTENED W1d GO. On the three seeds with a tightened-subset transition,
   the donation join names 8/8 (26071: 5/5, 26072: 2/2, 26073: 1/1). The
   r51 artifact class is gone by definition: no bump-classified transition
   enters the subset anymore. The two subset-empty seeds (26074, 26075)
   have only 3 and 2 transitions, all bump/handoff — an empty subset is
   not a miss, it is a quiet band. Pooled tightened share 8/8 (1.0).
2. NO GATE EXPLAINS THE DEED TRIGGER. Teachable pairs are never zero on
   any day of any seed (daily minima 38–74 pairs; 26075's mean is 81.4) —
   "nothing to teach" never happens. The hall gate is closed on only 7%
   of 26075's days, the pack is empty on only 7%. And the kcal gate is
   not operative at all: all 49 donate deeds this band fired with the
   scholar BELOW the 1.5x-cap gate (kcalGateClosed 49/49), and 12 days
   carry 2 donate deeds although the daily gated call allows at most 1
   transfer — so donations demonstrably flow through another path
   (the haul donation, which carries no kcal gate and no 1-transfer
   cap). The instrument's gate model was wrong, not the game: the next
   question is which policy path produces a deed on a given day, not
   which of these gates is closed.
3. TEACHING AS EXERCISED IS RE-TEACHING. All 40 teachPlant deeds this
   band (9 + 23 + 7 + 1) taught a plant the target ALREADY knew
   (targetKnowsBefore 40/40), returned success, and moved trust by
   exactly 0. That matches the competent policy's own comment that its
   teachRound "could never teach anything new as written" — the
   observed teaches are conversation-teaches ("You show them
   Chickweed / American Hazelnut / Jerusalem Artichoke"), not
   teachRound lessons. Whether any path ever teaches a NEW plant in
   the wild is now the open teaching question; the next instrument
   should capture the teachPlant caller (stack site, like the bump
   trap) to settle it.
4. THE ZERO-DEED SUCCESSOR THRIVES WITHOUT DEEDING. 26075's successor
   performs zero deeds across the entire 45-day window (its single
   deedLedger entry is the death-day d+0 teach, before the window) —
   the r51 26064 class repeats — yet the village climbs 49→81 office,
   39→80 village mean, pantry 31,050→48,661, 11 alive. The village
   feeds itself without the scholar's donations. Deeds are not load
   bearing for survival; they are the trust-climb accelerator (26071's
   donation-driven 17→92 is the contrast).
5. M3v2b MISSES, NARROWLY. Only 3/5 seeds reach 2 v2b mentions (1, 2, 1,
   5, 3). Both short seeds miss by exactly one mention: 26071 at 1,
   26073 at 1 with one further mention excluded as a loot line. Per
   §14 the miss stands — it is not re-scored — but the margin is one
   mention on two early-death (d6, d8) seeds with small young villages.

## Verdicts (binding, §14 — a miss is NO-GO, never re-scored)

- SCRIPT (young staging): GO — 2/2 day-5 seeds staged the scripted kill
  (26071 d6 Patrick→Fritz, 26072 d6 Carolina→Autumn; same day-6 landing
  as the proof seed).
- MATURE seeds: 26074 scripted d41 (Vanessa→Hugo); 26073 pre-empted
  organically at d8 (Evelyn→Elena), 26075 pre-empted organically at d23
  (Hector→Grayson). Scripted-or-organic honored on all seeds. Organic
  pre-emption is now 5 of the last 6 mature seeds across r50–r52
  (r50: d12; r51: d9, d18; r52: d8, d23) — the EARLY_KILL_DAY=40 regime
  rarely stages a mature kill anymore. A band effect, not a law, but
  the regime is thinning as a category.
- V1 (vouch snapshot): GO — the one snapshot seed with eligible
  villagers PASS-fired (26074: 5 eligible, all alive post-death,
  1 vouch line). Young seeds n/a-none-eligible (expected). Organic
  seeds: 26075 PASS-fired as detail, 26073 n/a-organic (no vouch
  lines, no snapshot — the standing organic rule). No FAIL-alive-silent
  anywhere. Died-between still empty.
- C1v3 (transition rule, binds): GO 5/5 — 45 transitions, 0 missing
  (19 + 15 + 6 + 3 + 2, all byCall).
- W1a (mutation-trap completeness, binds): GO — 45/45 transitions
  classified (bump 34, deed 3, direct 5, handoff 2, unexplained 1).
  The 1 scheme-unexplained (26071 d51, +1 solo) IS donation-named on
  its covering call ("Donated Blackberry (+3575 kcal). Trust +1") while
  the day-scoped ledger puts the matching deed on d50 — the r50
  call-spans-boundary class, not a writer gap. Under the call-scoped
  join the residual is 0.
- W1b (writer found, carried): pooled strict 10/14 (0.71); trust-moves
  only 10/12 (0.83). Both above the 0.5 bar. The single pooled miss
  is the 26071 d51 boundary donation above (bump share understates
  it; the donation overlay names it).
- W1d-tightened (donation join, binds as a finding bar): GO — pooled
  8/8 (1.0 ≥ 0.5); per-seed with a subset: 5/5, 2/2, 1/1. The r51
  subset share is also 1.0 on those seeds (no artifact recurred).
- S1 (bearer-own delta, carried): GO — 0 missing bearerDeltaExact,
  0 bad solo (|delta| ≤ 2 everywhere; solo deltas all +1/+2).
- MG2v2 (meal-line only, binds): GO 5/5, 0 violations (audit days
  45 × 5). Old MG2 also 0 — reported, not judged.
- M3v2b (social echo, carried): MISS — (1, 2, 1, 5, 3), only 3/5 seeds
  ≥ 2 (bar ≥ 4/5). Both misses are early-death seeds short by exactly
  one mention; 26073's second mention was loot-excluded. The miss
  stands as recorded; see metric review.
- M1 (funeral arc): GO 5/5. M4 (machinery): GO 5/5 mantles clean
  (linOk + moOk, including both chain mantles).
- OVER-CAUSE: unexercised this band — all 5 villages survive (over
  false everywhere, alive 8–11, pantryEnd 17,588–95,500). Watch only.
- SOLO (continuity only): 7 solo moves (26071: 6, cum +10; 26072: 1,
  +2), all +1/+2, bounded — same class as r50–r51.
- Chain deaths: 2, both cause-known (26072 Autumn→Greta "the arena"
  d51; 26074 Hugo→Mateo "the arena" d49).
- M5 (people check): GO with warts — 10 transcripts sense-read in
  full (below), 0 identity failures (identityTrips=0 all seeds).

## Village assessment in plain words

- 26071: Patrick dies to a hushwolf on day 6; Fritz takes the mantle
  at 17 and climbs to 92 while the village warms 16.2→75.6 (8 villagers
  over 60 at end). Pantry 23,560→76,949 (dipped to 6,110 mid-window,
  recovered), 10 alive. A young village that gets rich by giving:
  28 donations, all fed-band, all below the kcal gate.
- 26072: Carolina dies day 6; Autumn takes over at 17, climbs to 81 —
  then dies in the arena on day 51 and Greta inherits. Pantry
  25,421→17,588 (thinnest end in the band, 9 thin deeds along the way),
  8 alive. Two mantles, the second-youngest success.
- 26073: Evelyn dies organically day 8; Elena inherits at 24, climbs
  to 61, and the village warms to a mean of 82 — the warmest in the
  band. Pantry 31,940→95,500, the richest end, 11 alive. The
  teaching seed: 23 teachPlant deeds, all re-teaches, plus 8 donations.
- 26074: Vanessa dies day 41 (scripted, mature); Hugo inherits at 59,
  climbs to 78, dies in the arena day 49 and Mateo inherits. Pantry
  8,660→27,582 (started thinnest, 4 thin deeds), 9 alive. The
  well-established succession; only 7 deeds, all teachPlant, all
  in the first 37 days of the window.
- 26075: Hector dies organically day 23; Grayson inherits at 49,
  climbs to 81, village mean 39→80, pantry 31,050→48,661, 11 alive.
  The zero-deed successor line: no teach, no donate in 45 days, yet
  the village thrives — deeds are acceleration, not survival.

Who leads: the bearer <redacted> every village; by month's end trust is
broad (26071 ends with 8 villagers over 60, 26075 with 9; the other
ends sit lower but all climb from their mantles).
Who is miserable: nobody terminally — 26072 is thinnest but fed at
end; everyone else is comfortable or rich.
What is missing: nothing structural on this band — the missing piece
remains a question (the deed trigger's real path), not machinery.

## People check (sense-reads, SENSE-TESTING LAW)

Read in full, one per seed at d+7 (26071's d+7 fired as d+7, 26072's as
d+7, 26073's as d+7, 26074's as d+8, 26075's as d+8 — day-part quirk,
same class as r49–r51), plus extras: 26071 Lucas d+4 (PASS with warts
— kindness opener + betrayal moot, stall ending) and d+7 (PASS — "I'm
not okay" talk, empathic, warm close); 26072 Greta d+3 (PASS — fear
of the System, "The randomness would almost be kinder") and d+7
(PASS — fear-thread callback done right, Chickweed teach, "Carolina
is gone and the world just... continues") and Sanjay d+14 (PASS —
trap-line walk with teaching, firefighter reveal, correctly refused
repeat confession: "I'm not confessing it twice for dramatic effect");
26073 Sofia d+4 (weak but not senseless — outsider talk, confront
refused with consequence: "Ask around. See who trusts you after") and
Asher d+7 (PASS with warts — full betrayal-case menu play, tool gift
beat) and Michael d+14 (PASS — unfinished-thread callback, field
walk, Nightshade teach, "Riddle Me This" show memory); 26074 Mateo
d+3 (PASS — Columbus/Buenos Aires origins, favor owed by dead
Vanessa, Hazelnut teach, "Nobody says Vanessa's name right yet. We
will") and Megan d+8 (PASS — hurt-someone question, "I dreamed
Vanessa was still here. Woke up angry at the dream"); 26075 Madison
d+8 (PASS — unfinished-thread callback quoting the d+3 line 5 days
back, naming debate over "Flashbulb Moth", Jerusalem Artichoke teach).
No fabricated shared history, no filler loops as structure. Driver
artifacts, not game bugs: the double-invite tell ("Want to come with
us?" / "Want to come with me?") and the "lost my train of thought"
stall ending persist (stall line in 36/50 transcripts, same as
r44–r51). No foraging-outing instance this run (0/50 transcripts) —
the blank is not re-documented this run.

## Blanks filled or documented

- FILLED (instrument): tightened W1d subset — 8/8 named, artifact
  class excluded by definition.
- FILLED (finding): the kcal gate is not the donation gate — 49/49
  donate deeds below 1.5x cap, 12 multi-transfer days vs the gated
  call's 1-transfer cap. The operative gate is donateSurplus's keep
  logic + haven access, reached through the haul path.
- FILLED (finding): teaching as exercised is re-teaching — 40/40
  teachPlant deeds on already-known plants, trust delta 0, all
  successful. The competent policy's teachRound comment ("could never
  teach anything new as written") is consistent with the data.
- FILLED (question): deed-trigger gates — answered "none of these
  five": teachable pairs never 0, hall gate rarely closed, pack
  rarely empty, kcal gate non-operative. The next question is the
  policy path, not the gate.
- FILLED (question): zero-deed successor repeats and thrives —
  26075 is the r51 26064 class with a full 45-day window and a fed,
  warm, 11-alive end. Deeds are not survival-load-bearing.
- DOCUMENTED (residual, scheme artifact): 26071 d51's single W1
  scheme-unexplained transition is donation-named on its covering
  call; the day-scoped ledger dates the deed d50 (boundary class).
- DOCUMENTED (coverage note): 50 transcripts, all 5 checkpoint pairs
  per seed (d+3/4, d+7/8, d+14, d+30/31, d+45); 26072's d+30 fired as
  d+31, same day-part quirk class.
- DOCUMENTED (armor continuity): bark never leaves its holders this
  band — 26073's 2 bark pieces (Asher worn 1 + pack 1) and 26075's 3
  (Leo worn 1 + pack 1, Grace pack 1) are stable across every snapshot;
  the succession-loss thread does not reproduce here.
- DOCUMENTED (content warts): betrayal-case menu play stays thin
  (26071 Lucas, 26073 Asher); stall endings persist (36/50).

## Telemetry deviation check

`node scripts/telemetry-check.js` vs telemetry-baselines/succession.json
(metrics: deaths.bearer, census.fallen, census.alive,
week2.deadBearerMentions, succession.echoV2b,
succession.callMovesSoloOffice): TWO LOUD lines, both EXPLAINED,
baseline NOT rolled (same call as r46–r51: rolling on a
regime-changed band would launder the regime effect into the
baseline):
- "succession.echoV2b newly appeared: baseline 0 → current 12 (n=5)":
  baseline predates the echoV2b key (added r46); current total 12 =
  1+2+1+5+3, exactly the analyzer's M3v2b sum.
- "succession.callMovesSoloOffice newly appeared: baseline 0 →
  current 7 (n=5)": the solo class opened r49; current total 7 =
  6+1+0+0+0, exactly the analyzer's solo counts.
- No LOUD lines for deaths.bearer, census.fallen, census.alive, or
  week2 mentions this band.

## Regression

`node scripts/check.js --only succession --cacheDirectory=/tmp/jest-cache-playtest2`:
11 passed, 0 failed in 96s (same as r47–r51).

## Metric review (for the NEXT run, never re-scored here)

- W1d-tightened: bar stands; the subset can be empty on quiet seeds —
  the NEXT instrument should report the pooled share as the headline
  (8/8 here) with per-seed shares alongside, and say plainly when
  seeds contribute nothing.
- DEED-TRIGGER: retire the five-gate framing. The next run's question
  is the policy path: capture the deed caller (stack site on
  teachPlant/donateToPantry, like the bump trap) plus a per-day
  policy-path census (forage trip? convo teach choice? haul donation?
  daily gated donation?). 26075-class vs 26071-class seeds are the
  contrast pair, same as this run.
- TEACHING: the next run should test whether ANY path teaches a new
  plant in the wild (targetKnowsBefore=false on any teachPlant deed,
  by caller). If none across a band, that is a policy finding to
  carry to Steve, not a silent instrument gap.
- M3v2b: the bar (≥2 mentions in 7 days, ≥4/5 seeds) MISSED at 3/5 by
  one mention on two early-death seeds. Proposed revision for the
  NEXT run (Steve's call, not this run's): consider scaling the bar
  with village size/age at death, or counting the window from the
  funeral rather than the death day. Until ruled, the bar stands.
- MATURE REGIME: organic pre-emption is now 5/6 across r50–r52. The
  NEXT prereg should treat EARLY_KILL_DAY=40 as a staging aspiration
  with a reported staging rate, not as a regime guarantee — or pick a
  staging method Steve rules (standing rule honors organic deaths).
- C1v2: stays DROPPED. MG2v2: binds, unchanged. Solo: continuity only.
- Over-cause: unexercised this band; keep as a watch, not a gap.
- Died-between: still empty; keep as a rare-branch watch.
- Next for succession (r53): mixed regime again; deed-caller
  instrument; teaching-new-plant test; M3v2b bar question carried.

## Infrastructure

- No lock at run start (no prior lane-B lock); lock created
  2026-10-27T08:56:40Z, deleted at closeout; rotation-b read 7,
  written back 4.
- Worktree registration slow but clean (~4 minutes checkout, same
  class as r51's ~6 minutes; resolved on its own, no action taken).
  Heartbeat loop verified landed after loop start (first loop beat
  2026-10-27T09:01:29Z in the heartbeat log, per the 2026-10-25
  lesson) and re-heartbeated through the run.
- Sibling trees left untouched (9 active at run start, all LOUD dirty
  trees never touched).
- Proof test ALL GREEN first try (RED on the r51 driver, GREEN on the
  r52 driver; proof-seed 24999 tele + transcripts deleted after
  GREEN, including the RED run's r51 proof files).
- No sibling landed mid-run (master stayed 3a12db1aa from registration
  through the seed batch); no rebase needed at landing.
- Safe-commit index clobber: checked after commit (see landing notes
  in the run record); worktree verified clean before release.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes — the succession machinery holds across scripted
  mantles, organic pre-emptions, double chain mantles (both arena
  deaths, both cause-known), and a zero-deed successor line, with the
  trust-writer question now closed under the tightened definition.
- FUN: yes, with warts — the social texture is the run's strength
  (Mateo's Buenos Aires rain, Megan's angry dream, Sanjay's refused
  repeat confession, Madison's quoted callback), and the main drags
  are the thin betrayal-case menu play and the stall endings.
- WINNABLE: yes — all five villages end fed (17,588 to 95,500 pantry
  kcal) with the bearer climbing or holding (office 61–92 at end);
  winnability still rides on the food economy, and competent play
  keeps the village fed through up to two mantles — even, on 26075,
  without a single deed in 45 days.
