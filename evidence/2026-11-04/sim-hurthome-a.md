# sim-hurthome-a — VERDICT: DIAG-GO, HURT TRAVELERS TURN HOME FAST OR DIE

Run: oversight-flesh-out-loop, run fleshout-20261104T0545Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-hurthome-a. Axis: food-economy.
Arm: hurt-traveler turn-home behavior DIAG — the behavior half of
sim-findings travel/health item #1720, left open by Loop B 2130Z
(sim-hurttraveler-b, evidence/2026-11-03/sim-hurttraveler-b.md),
which closed the narration half (awayHungerVoice now states the
state-derived reason for staying out) and proved no health-based
return trigger exists.
Binding prereg: evidence/2026-11-04/sim-hurthome-a-prereg.md (read
in full before judging; this verdict is judged against it, §14).
Canon read first: docs/CANON.md, docs/MAP.md (way home). No canon
doc covers away-return timing or hurt-traveler behavior — the
mechanism below is code-read, not invented canon.
DIAG ONLY, as briefed: zero src/js, no default flip, no policy
default change, no gate/price/deed/readyDemand change. Any fix the
diag suggests is DOCUMENTED below as the named next arm, not landed.

## THE QUESTION, IN ONE SENTENCE

A villager hurt while away (health <= 7 at dawn, still ledger-away)
does not get a health-based summons home — the return branch fires
on the trip clock alone — so: do they actually turn home, and when?

## INSTRUMENT (what "turn home" means here, pinned in the prereg)

- Episode = one away-trip spell containing at least one hurt dawn.
  Dawn = endDay post-call, dayPart 0 ("— DAY N DAWN —").
  Hurt = v.health[vid] <= 7 and >= 1 (the awayHungerVoice gate).
  Away = v.away[vid] present (LEDGER test, regardless of node
  distance — the 2130Z dist-0 cases count as away, as they should).
- Returns caught by a post-npcNodeTravel scan (the return branch
  runs inside npcNodeTravel, BEFORE endDay rolls the day — scanning
  after advancePart would misdate night returns by +1 day).
  Deaths caught by a PRE-call registerDeath wrapper (expedDeath
  deletes v.away after registerDeath, so away state is read first).
- Classification (mutually exclusive, death first): died-away;
  turn-home same-day (returnDay == episodeDay); turn-home
  next-day (returnDay == episodeDay + 1); stayed-out >= 3 days
  (returned on/after episodeDay + 2, or still away at the
  episodeDay + 2 dawn); censored-early (run ended before the
  episodeDay + 2 dawn with no return/death — the disclosed
  remainder, never folded into another bucket).
- Corpus: evidence/2026-11-04/perseed-hurthome-a/ (competent,
  100d death-aware cap, PLENTYDEPRI=1, DEPOSITGATE=1).
  Instrument: scripts/sweep-hurthome-a.js +
  scripts/analyze-hurthome-a.js + scripts/hurthome-a-lib.js
  (classification shared with the proof test, so the proof
  exercises the judged code).

## PILOT + THE ONE PRE-DECLARED EXPANSION

- PILOT seeds 97101–97108: 18 episodes (4, 4, 6, 2, 1, 0, 1, 0).
  Below the >= 20 bar — so, exactly as the prereg prescribes
  (and no other way), the EXPANSION seeds 97109–97116 ran:
  10 more episodes (1, 1, 3, 1, 0, 1, 1, 2).
- POOLED census: 28 episodes across 16 seeds. Instrument errors:
  0 on all 16 seeds. No threshold was moved, no horizon extended,
  no seed re-picked. The expansion is the prereg's one allowed
  response, and judging stops here.
- Context counts (not judged): hurt meal lines 53 on the pooled
  corpus (vs 23 on the 2130Z 8-seed corpus — meal lines catch
  mid-day hurts that never reach a dawn, so they run higher than
  the dawn census by design); deaths recorded 232; transcript
  lines kept 2,404.

## VERDICT: DIAG-GO

- PRIMARY (census >= 20): 28 >= 20. PASS.
- EVERY episode classified: 28/28 in buckets 1–4, 0 censored-early,
  0 unclassified. PASS.
- NARRATION AUDIT complete: 5/5 stay-out evenings found and
  judged (below). PASS.
- DIAG-GO = the behavior is MEASURED. It is not a claim the
  behavior is good — the numbers below are the finding, and the
  finding names a fix (next arm, below).

## THE NUMBERS (pooled, 28 episodes)

- died-away: 13 (46.4%). turn-home same-day: 7. turn-home
  next-day: 5. stayed-out >= 3 days: 3. censored-early: 0.
- Turn-home rate (same + next day, among the 15 returned):
  12/15 = 0.800. Among returned episodes, the typical hurt
  traveler is home within a day of the first hurt dawn.
- Median days-out-while-hurt: pooled 0 (returned median 1 day,
  died median 0 days). 9 of the 13 died-away died ON the episode
  day itself. Hurt-away is a same-day crisis, not a slow linger:
  by the second hurt dawn, the villager is usually home or dead.
- Only 3 episodes in the whole corpus stayed out >= 3 days
  (Aurora 97103, Desmond 97104, Aidan 97116 — all expeditions,
  all returned on day +2, none died). Long hurt-away spells are
  rare, and in this corpus none of them ended in death.
- Every episode was hurt WHILE away: hurtTiming 28/28 while-away,
  0 before-departure. This re-confirms the 2130Z mechanism on a
  fresh band: departures are health-gated, so nobody leaves hurt;
  they get hurt out there.
- hp at episode open: 1:4, 2:1, 4:3, 5:8, 6:7, 7:5. The 3–7
  subset is 23/28; the 5 episodes at hp 1–2 are the near-dead
  (4 of the 5 died-away cases at hp 1–2 died, all but one on the
  episode day — the exception is Tashi, below).
- By purpose: expedition 15, leave 6, forage 2, hunt 2, guard 1,
  visit 1, water 1. By outcome within purpose, the split that
  matters is LEAVE vs everything else (below).

## THE LEAVE SPLIT — READ THE POOLED 46% WITH THIS IN HAND

- LEAVE walk-outs (awayDuration 999 parts, ~250 days): 6 episodes,
  6 died-away, 0 returned. A walk-out's clock cannot run out
  inside a 100d window, so a LEAVE hurt traveler is structurally
  unable to turn home here — the question "when do they turn
  home" has no in-window answer for them. Their deaths: 2
  starvation (Olivia 97101 d37, Oliver 97102 d71), 2 monster
  (Macharia 97110 d97, Mei 97112 d41), 1 wound that wouldn't
  close (Mateo 97103, hurt dawns 3/5, died d28), 1 sickness
  (Tashi 97114, hurt dawns 4/4, died d20).
- Non-LEAVE trips (22 episodes, all with a real end date):
  15 returned (68.2%), 7 died (31.8%). Same/next-day returns
  are 12 of the 15 returns; stayed-out >= 3 days is 3 of 15.
- So the honest headline is two numbers, not one: trips turn
  home fast (80% within a day of the first hurt dawn, 20% after
  >= 3 days out, 32% die before the clock brings them in);
  walk-outs never come back in-window (0/6) and die out there.
  Any fix arm must treat these as different populations — a
  turn-home rule for trips is not a rule for walk-outs, and
  pooling them hides both stories.

## THE EXPEDHURT DISCONNECT, ON LIVE DATA (context, not judged)

The 2130Z arm documented that expedHurt caps st.exped.duration
but nothing writes it back to v.away.duration. This corpus
shows the disconnect firing: 5 of 15 expedition episodes have
expedDuration < awayDuration at episode open — Desmond 97102
(6 vs 20), Aurora 97103 (2 vs 15), Desmond 97104 (10 vs 18),
Charlotte 97107 (6 vs 11), Devon 97115 (6 vs 12). In all five,
the away clock — the only clock that returns anyone — ran
longer than the "shortened" expedition. Aurora is the sharpest
case: her expedition was cut to 2, her away trip ran 15 parts,
she spent 3 dawns at hp 1, and she came home on day +2 anyway
by the away clock, not by the cap. The cap is not a turn-home
mechanism in practice, because the away clock never hears it.

## SENSE TEST — STAY-OUT EVENINGS (5/5 judged, quoted)

Sample rule (prereg): first 5 stay-out evenings (dusk/night on a
day whose dawn opened or continued an episode still open at the
next dawn), at most one per episode, preferring distinct seeds.
34 such evenings exist in the corpus; the sample is the first 5
by seed/day. Verdict per evening: does ANY line that evening
give a reason for staying out?

1. Andreas, seed 97101, evening day 43 (expedition, hp 7,
   returned next day). NO reason line that evening. The three
   lines naming him are work and gossip, not the trip:
   "📋 Andreas — 🎣 Fish. They'll report back by next part."
   "🎣 Andreas worked the creek — 2 fish, +480 kcal to the
   pantry." "Lwazi shakes their head, admiring. 'Did you hear
   what Andreas did?' You hadn't. Now you have." No away-voice
   line fired for him that day. A hurt traveler spending a night
   out can pass an entire evening without a single line saying
   why he is still out — the voice line is meal-timed, and on
   this day it did not fire for him.
2. Darnell, seed 97102, evening day 56 (hunt, hp 4, returned
   next day). YES — by the voice line, plus a mauling line with
   its own grim logic: "🩸 The Redactor mauled Darnell (-19
   health) over 2 rounds. They're lucky to be breathing. —
   staying out of sight for the rest of the day — too hurt to
   meet it again". And the meal line: "Darnell eats away from
   the haven — 1513 kcal from the pack — while hurt (health
   4/100). They're still out hunting — due home — the trip's
   time is up, they just haven't walked in yet." The same
   evening also shows him fishing, hauling wood, and cooking
   for the haven ("🎣 Darnell worked the creek — 5 fish, +1140
   kcal"; "🪵 Darnell hauls back 6 wood"; "🍲 Darnell cooked for
   the haven") — work lines that sit oddly beside a ledger-away
   hunt trip. Flagged, not proven: the transcript shows haven
   work on a ledger-away evening (same class as the 2130Z
   dist-0 finding — the ledger and the lived day do not always
   match). A future arm should measure node position on such
   evenings before calling it a defect; this arm's instrument
   did not record node at dawn.
3. Aurora, seed 97103, evening day 23 (expedition, hp 1,
   returned day +2). YES — by the voice line: "Aurora eats away
   from the haven — 1459 kcal from the pack — while hurt
   (health 1/100). They're still out on a long trek — the
   trip isn't over yet." The evening's naming lines are generic
   assignment lines ("📋 Aurora — 🎣 Fish. (a natural — good
   pick)"). At hp 1, the only line that treats her as a hurt
   person still out is the voice line; everything else treats
   her as available labor.
4. Desmond, seed 97104, evening day 16 (expedition, hp 5,
   returned day +2). YES — by the voice line: "Desmond eats
   away from the haven — 1455 kcal from the pack — while hurt
   (health 5/100). They're still out on a long trek — the trip
   isn't over yet." The evening's naming line is fireside
   gossip ("You catch fragments by the fire — Hlompho telling
   Desmond about Franz..."). Again: reason lives only in the
   voice line.
5. Mia, seed 97105, evening day 48 (expedition, hp 6, died
   next day of starvation). YES — by the voice line: "Mia eats
   away from the haven — 1178 kcal from the pack — while hurt
   (health 6/100). They're still out on a long trek — the trip
   isn't over yet." She eats a full pack meal, is told (by the
   line's own logic) the trip isn't over, and starves the next
   day. The reason is true and the outcome is still death —
   the voice explains staying out; it does not save anyone.

Audit summary: 4/5 evenings carry a reason, and in all 4 the
reason is the 2130Z voice line itself — the narration fix doing
its job. No evening's non-voice lines give a reason for staying
out: evening talk is assignments, gossip, and work reports.
The behavior underneath reads as a person with an errand and a
clock (the voice line lands that), not as a person DECIDING
anything about being hurt: nobody says "I'm hurt, I'm coming
home" or "I'm hurt, I'm staying because...". The decision the
census measures — home within a day or dead — is made by the
clock and the monsters, not by the villager. That is the gap
the next arm inherits.

## SENSE TEST — TURN-HOME DAYS (quoted)

The three stayed-out >= 3 days cases are the only ones where a
return can be read as an event rather than a same-day bounce,
and their return lines read as routine homecomings, not as
hurt people seeking care:

- Aurora, seed 97103, returned day 25 after 3 dawns at hp 1:
  "🧭 Aurora is back from past the west (+1592 kcal for the
  pantry, 2 stories, a new scar) (Ask them what they saw.)"
  The "new scar" is the only nod to what happened to her; the
  line celebrates haul and stories, not a mauling survived at
  1 HP. (Her fireside tale, day 22: "Aurora came back mauled
  by The Bright Bastard (4 rounds, 81 taken) and alive. A
  flinch at sudden movement now." — the village DOES remember
  it as a mauling, but only as a story told at the fire, days
  before she actually came home from the hurt trip.)
- Desmond, seed 97104, returned day 18: "🧭 Desmond is back
  from past the east (strange meat (unknown flesh — test it
  cautiously), 4 stories, a new scar) (Ask them what they
  saw.)" Same shape: haul, stories, scar — no mention that he
  spent 2 hurt dawns out there.
- Aidan, seed 97116, returned day 40: "🧭 Aidan is back from
  past the west (+2367 kcal for the pantry) (Ask them what
  they saw.)" No scar, no wound, no mention of the 2 hurt
  dawns at all.

Judgment: turn-home days read as people coming back from a
trip, not as hurt people coming home BECAUSE they are hurt.
That is consistent with the mechanism (the clock brought them,
not a health decision) — and it is why a hurt-aware return
line, or a hurt-aware turn-home rule, would be a visible
change rather than a redundant one. This arm documents that
observation; it does not implement it.

## REACHABILITY + VILLAGE ASSESSMENT (watch metrics, plain words)

Window honestly stated: competent policy, 100d death-aware cap,
seeds 97101–97116 — an early/mid window, not a full-arc run.
- Survived to 100d: 7/16 (97101, 97104, 97106, 97110, 97112,
  97113, 97114); village-lost: 9/16 (days 54–96).
- Wave reach: wave 4 on 15/16, wave 5 on 1/16 (97112).
  National / table / wins: 0/16 — the scale wall is untouched
  by this measurement arm, as expected; a 100d diag corpus is
  not a scale panel, and nothing here claims otherwise.
- Deaths recorded in the corpus: 232 across 16 seeds. The
  village dies to the same world that hurts these travelers.
  Died-away causes, exactly: monster or named beast 8
  (Big-Eyes, Big Ugly, The Static Kite, Hushpuppy, plus 4
  recorded as "monster"), starvation 3, wound that wouldn't
  close 1, sickness 1. Total 13.
- Who thrived / died and why: nobody in particular — survival
  tracks early pantry/monster luck, not turn-home behavior.
  The blank this run fills is the record itself: hurt travelers
  DO turn home, fast, when their trip has an end — and walk-outs
  don't, because their clock has no end in sight. The village
  assessment is that the clock, not any health judgment, is
  doing the deciding, and the clock's two populations (trips
  vs walk-outs) must never be pooled again in this question.

## §15 BALANCED PANEL — DECLARED INAPPLICABLE (prereg-bound)

No panel compare file is attached, deliberately: this is a
single-cell instrument census on pristine master with no
behavior change and no armed cell. There is no delta for
scripts/balance-panel.js to compare, and fabricating a compare
file would be dishonest. The prereg declared this inapplicability
BEFORE the pilot. A future fix arm MUST run the panel.

## WHAT LANDS, WHAT DOES NOT

- LANDS ON THIS BRANCH (coordinator merges; worker does not
  push, bump, or verify live): prereg + this evidence; pooled
  corpus (16 per-seed JSONs + sweep summary); sweep + analyzer
  + lib; proof test (15/15 green, re-run after the one
  test-side fix during the run — a censored episode with only
  1 dawn was expected stayed-out in the test; the lib was
  right, the test was wrong, and the test was corrected).
- DOES NOT LAND: no game-code change; no behavior fix; no
  gate/price/demand change; no other lane's files. The
  determinism leg (seed 97101 run twice with the instrument)
  is reported in the proof section below, not as a landing.
- The /tmp determinism outputs are scratch, not evidence, and
  are not committed.

## PROOF

- scripts/test-hurthome-a.js: 15/15 green (classifier
  exhaustiveness incl. death-before-return priority; one
  episode per trip incl. heal-then-rehurt extension; hp
  boundary 7 opens / 8 does not / 0 is not alive-hurt; lib
  reads no RNG and mutates no away/health record).
- Determinism leg: seed 97101 run twice with the instrument
  into separate dirs — per-seed JSONs byte-identical, and
  identical to the judged corpus file for 97101. (First
  attempt wrote both runs to one dir and proved nothing; it
  was redone properly with two dirs, and the redo is what is
  claimed here.)
- Instrument errors: 0 across all 16 judged seeds. No
  unclassified episodes. No censored-early episodes — every
  episode reached a return or a death inside the window.

## NAMED NEXT ARM (documented, not landed — DIAG ONLY)

sim-hurthome-fix-a (proposed name for the coordinator): a
hurt-aware turn-home rule for TRIPS (not walk-outs), with its
own prereg and balanced panel. The diag says what it must
decide, and what it must not assume:
- Decide: whether a hurt traveler on a trip with an end date
  should come home early (a health check on the return path,
  or writing the expedHurt cap back into v.away.duration —
  the disconnect this corpus shows firing 5/15 expedition
  episodes), and what a hurt-aware return line says (the
  current return lines celebrate haul and scars, never the
  hurt that sent them home).
- Must not assume: that walk-outs are the same problem (their
  clock is 999 parts; a trip rule cannot reach them), that
  faster returns save lives (9/13 died-away died on the
  episode day itself — many were already past saving when
  the dawn census first saw them), or that the voice line
  needs changing (4/5 stay-out evenings already carry a true
  reason through it).
- Also carried (observations, not verdicts): (a) the
  ledger-vs-lived-day mismatch on Darnell's evening (haven
  work lines on a ledger-away hunt evening) — needs node
  position measured before any claim; (b) return lines never
  mention hurt — a narration follow-up, not a behavior claim.

## METRIC REVIEW

- The dawn (vs meal-time) episode definition was the right
  instrument: it separates "hurt while away at the start of a
  day" (the population a turn-home rule would act on) from
  mid-day hurts that resolve before the next dawn. The cost is
  honest and stated: intra-day hurt-and-return spells never
  enter the census. The 53 meal lines vs 28 episodes gap is
  the size of that cost on this band, and it argues for
  keeping BOTH censuses in future arms, not for replacing one
  with the other.
- The trip-keyed (vs hurt-spell) episode unit was right: no
  episode re-opened on a heal-then-rehurt trip in the corpus
  (the extension path exists in the lib and is proof-tested),
  and trip-keying is what makes "stayed-out >= 3 days" mean
  something about a trip rather than about a wound.
- The >= 20 bar did its job, including failing first: the
  pilot's 18 forced the one pre-declared expansion instead of
  a quiet threshold move, and the pooled 28 clears the bar
  with room. A future arm on this question should keep >= 20
  but may budget 16 seeds up front — the pilot rate here was
  1.75 episodes/seed, so 8 seeds was always a gamble.
- One wording note for the next arm, not a revision of this
  one: "turn-home rate" as defined here (same+next / returned)
  answers "when do the ones who come home come home", not
  "how often do hurt travelers come home". The pooled
  come-home rate is 15/22 = 0.682 for trips, 0/6 for walk-outs
  — report both rates, never just the conditional one.
- Convergence state for this axis (food-economy, hurt-traveler
  blank): BEHAVIOR MEASURED (this arm). The axis itself is not
  converged — the fix decision above is open, and the
  pantry-empty story remains a separate question.

## SENSE-TESTING LAW — SCOPE NOTE

Beyond the hurt-traveler corpus: no wider dialogue verdict is
claimed — the transcript capture was instrumented for
hurt-traveler lines, return lines, and lines naming episode
villagers only, so no broader robotic/static/repeated
dialogue judgment is made here. The one pattern found beyond
the census (haven work lines on a ledger-away evening) is
flagged above as an observation for a future arm, not a
verdict.
