# journey-social r20 (2026-10-17) — leg 5 "social life"

## PRE-REGISTRATION (docs/MEASUREMENT.md §11, written BEFORE the pilot)

**Context:** r19 landed the opener-skip fix (openers never go dry — 0/3372
post-fix) and the grief-pool deepening (grief carry 63.0%) plus the snippet
substance gate. Social-life axis converging per r19's convergence line.
This run: regressions + the r19 "policy-coverage issue for the next run":
under the larceny-leaning policy the player steals daily, crimes should be
recorded → justiceHeat → ladder → moot demand → verdict. r19 instrumented
NONE of that ladder (0 player-case moots in 6 runs; all 37 moots were
NPC-vs-NPC betrayal arcs, all "acquitted"). M5 hunts that blank.

**Leg questions:**
1. (REGRESSION) Do the r19 fixes hold on fresh seeds (M1 opener deflection
   <15%, M2 grief carry ≥60% with the revised exclusion)?
2. (BLANK HUNT — M5) Under larceny-leaning, player steals daily. Does the
   justice ladder (recordCrime → heat → cold shoulder → confrontation →
   moot demand → forcePlayerAccusation → trial → verdict) actually
   complete? Or does it stall at a named stage? Interesting finding: a live
   player-case moot deliberating to a verdict, or a named stall point.

**Binding metrics (§14 — a miss is NO-GO, never re-scored):**
- M1 (r19 regression): opener deflection <15% of driven convos
  (Game.convoIsDeflectionLine on first NPC line).
- M2 (r19 revision): grief carry ≥60% among grief-window convos (death
  day..+2, first 3 living villagers/day, driven), EXCLUDING seed
  (want.fromSeed), request, and acute-need (favor urgency ≥4) openers.
- M3 (people check): 8+ full transcripts (day-15/day-45 samples + 2
  grief-window) sense-read by the author. GO if ≥6/8 meet the conversation
  quality bar.
- M4 (r19 revision): ≥5/6 runs end the 60d harness with ≥5 villagers alive.
- M5 (moot coverage): ≥2 moots across the 6 runs reach a verdict
  (player-case or NPC case; ladder instrumentation names where each
  run's ladder stalls). Moot transcripts sense-read: verdict text names
  the case, accuser aftermath visible (mootAccuserAftermath), >50% quorum
  honored, reads as real people deliberating, never a menu or flat roll.
  If player crimes are recorded but the ladder never reaches a player
  moot, document the blank (connects to endgame r15's SUBSTRATE-MISSING
  witness-path verdict).

**Interesting finding:** a moot deliberating live against the PLAYER
(ladder working end to end); a named stall point in the ladder; a live
confrontation answered or silenced; accuser-aftermath narration in the
wild.

**Horizon:** DAYCAP=60, death-aware stop + 10d tail (r13–r20 standing).

**Seeds:** 1404, 1405, 1406 (fresh, adjacent to r19's 1304–1306).

**Policies:** competent + larceny-leaning, identical seeds (competent =
pinned baseline; larceny-leaning = crime-capable, isolates the ladder).

**Driver:** scripts/journey-social-r20-pilot-20261017.js (r19 pattern +
ladder instrumentation: daily justiceHeat/justiceStage/crime-count
snapshots, stage-transition days, mootDemanded day, player-case tracking
with trial/quorum/resolution, theft counts from the policy ctx).

**Smoke:** 1 seed × competent × 10d, then 1 seed × larceny-leaning × 10d,
both green. The larceny smoke showed the ladder reaching stage 3
(mootDemanded) by day 12 with a live player case open — the hunt was on.

**§14 anti-drift:** the five metrics above bind this run. Doubts go under
"metric review" for the NEXT run.

## Run state

Full sweep done (2026-10-17): SEEDS=1404,1405,1406 × competent,
larceny-leaning, DAYCAP=60. Per-seed JSONs:
`evidence/2026-10-17/journey-social-r20-pilot-<seed>-<policy>.json`;
transcripts under `evidence/2026-10-17/social-r20-transcripts/`
(144 files: day-15/day-45 samples, grief-window, moot files).
One game-code fix landed (answer-react fallback, RED→GREEN proof).

## Pilot results

| seed | policy | endDay | alive | fallen | convos | openerDefl | grief bind | moots (player) | thefts | maxHeat | endStage |
|------|--------|--------|-------|--------|--------|------------|------------|----------------|--------|---------|----------|
| 1404 | competent | 47 | 11 | 1 | 613 | 0 | 3/4 | 0 (0) | 0 | 25 | 1 |
| 1404 | larceny | 62 | 9 | 3 | 566 | 0 | 4/5 | 14 (13) | 15 | 153 | 3 |
| 1405 | competent | 62 | 8 | 4 | 483 | 0 | 10/12 | 0 (0) | 0 | 25 | 1 |
| 1405 | larceny | 55 | 8 | 4 | 475 | 0 | 15/15 | 14 (12) | 14 | 130 | 4 |
| 1406 | competent | 52 | 10 | 2 | 600 | 1 | 5/8 | 0 (0) | 0 | 25 | 1 |
| 1406 | larceny | 62 | 9 | 6 | 487 | 0 | 7/17 | 11 (10) | 19 | 138 | 4 |

Ladder transitions (larceny runs):
- 1404: 0→1@d6, 1→2@d10, 2→3@d12, 3→4@d45, 4→3@d53. Confronted by Zoe d10.
- 1405: 0→2@d8, 1→2... 2→3@d10, 3→4@d55 (uprising 'unforgivable', heat 130).
- 1406: 0→1@d5, 1→2@d8, 2→3@d9, 3→0@d18, 0→1@d21, 1→2@d26, 2→3@d27,
  3→1@d31, 1→2@d34, 2→3@d36, 3→2@d39, 2→3@d41, 3→1@d60, 1→4@d61 —
  the ladder breathes: acquittals re-sync the stage, new thefts re-escalate.

### M1: GO — 1/3224 = 0.03% (<15%)
The r19 opener-skip fix holds on fresh seeds. Zero deflected openers in
5 of 6 runs; the single one (1406-competent) is 0.2%.

### M2: GO — bind 44/61 = 72.1% (≥60%)
Raw 58/93 = 62.4%. The revised exclusion (seed/request/acute-need
openers) lifts it to 72.1% — the exclusions are doing real work: 32 of
93 grief-window convos were legitimately displaced. The r19 pool
deepening holds.

### M3: GO — 7/8 transcripts meet the bar
Sense-reads (author):
1. Deborah d11 grief (larceny): PASS — grief opener on Casey's death,
   avoidance-then-continuation, honest wind-down.
2. Kathleen d15 (competent): PASS (soft) — acute-need want opener ("My
   hands shake when I try to work"), monster-naming gossip ("Kathleen is
   pushing 'The Loud Beast'"), impatience reads human under driver spam.
3. Joana d45 (larceny): PASS — feverish acute-need opener with escalation
   ("it's in the blood"), favor commits with gratitude; thread-loss is
   fiction-coherent (she's feverish).
4. Theo d15 (competent): PASS (soft) — recall opener remembers the
   player ("singing in the creek. Badly"), Hummice naming debate at the
   fire; thin resume tail.
5. Salvador d45 (larceny): PASS — the snippet substance gate working:
   "'Their name was Wren. I haven't said that out loud in months.'" +
   "The real advice? Be useful. Not impressive — useful." Earned
   "settled" close.
6. Rafael d13 grief (competent): PASS — lure beat inside grief ("shows
   you where they go to think"), the r19 grief-crack line in the wild
   ("Most days I don't think about it. Today I am.").
7. Rafael d15 grief-resume (competent): PASS — multi-day grief thread
   continuing across sittings ("We never finished talking about grief —
   we left it mid-thought"), "Getting there."
8. Rafael d45 (competent): FAIL (soft) — the NPC asks a direct question
   ("So what's your plan here?"), the player answers ("One day at a
   time."), the blocked react dry-replaces: "...Sorry, lost my train of
   thought." The want ("Help me haul something back?") never develops;
   the conversation ends in a deflection spiral with nothing resolved,
   planted, or owed. → FIXED this run (see Blank filled).

### M4: GO — 6/6 runs end with ≥5 alive (11, 9, 8, 8, 10, 9)

### M5: GO — 39 moots reach a verdict, 35 of them player cases
The blank is CLOSED with evidence, not just absence-of-stall:
- **The ladder completes end to end, repeatedly.** 14–19 thefts per
  larceny run → heat 130–153 → cold shoulder (stage 1) → confrontation
  (stage 2; Zoe/Jovan/Grace block your path with voiced, identity-
  generated lines: "We need to talk about the stores. About what you've
  been taking.") → silence-timeout (the driver never answers) → moot
  demand (stage 3) → forcePlayerAccusation → trial in 2–4 days →
  verdict. 13/12/10 player-case moots across the three larceny runs.
- **Quorum honored 13/13** on 1404-larceny player cases (>50% of living
  present; the advisory path exists in code for below-quorum).
- **Accuser aftermath in the wild** (mootAccuserAftermath): "Zoe doesn't
  meet anyone's eyes. A case the village wouldn't hold — that's on the
  one who called it." Verdict ceremony reads as people deliberating:
  "Kathleen counts on their fingers, twice, like they don't trust the
  first number. Then, to the fire: '2 for guilty. 6 against.'" Followed
  by the acquittal mark: "Not guilty. The count falls short — you
  breathe. But an accusation leaves a mark no verdict washes off."
- **Stage 4 fires**: 1405-larceny hit heat 130 → uprising
  ('unforgivable') at day 55; 1406-larceny reached stage 4 at day 61.
  The ladder's end exists and is reachable.
- Competent runs: heat 25, stage 1 max (ambient distrust only), zero
  crimes, zero moots — the ladder stays quiet when there's nothing to
  prosecute. Correct.

**M5 design observation (for Steve, not a bug): heat/belief divergence.**
All 35 player-case moots acquitted (as did r19's 37 NPC moots). Root
cause, measured: the ladder runs on **heat** (crimes recorded), but the
trial runs on **belief** (trust/affinity). The driver's daily
talk-to-everyone playstyle keeps juror trust high, so beliefs stay
acquit-leaning even as heat soars. A probe (seed 1404, larceny-leaning,
NO convo-driving, /tmp/probe-moot-belief.js) proves the conviction
machinery works: case_1, belief avg -19.3, trial 8–0 guilty → convicted
→ sentenced to **weregild**. So: a thief the village distrusts gets
convicted; a thief the village likes gets acquitted 13 times while the
accuser (who was right!) loses 8–12 trust per weak case. Epistemically
coherent (the village only has suspicion, and 13 failed accusations read
as crying wolf), but worth Steve's eyes: should a 15-theft serial thief
with maxed social capital be untouchable by the formal track forever?
The ladder's answer today is the stage-4 uprising (heat ≥95 bypasses
belief) — which did fire twice. Proposal for a future run, not this
one: repeated acquittals of the same charge could deepen the
"accusation leaves a mark" (currently -8 trust) or nudge belief.
No code changed here — tuning call, Steve's lane.

**r19 "0 player moots" explained:** r19's driver only recorded cases once
`trialDay != null` and never instrumented the ladder — cases were
opening (mootIn 2–4 day delay) but the recording missed the pipeline.
Not a substrate failure. (Also note: my driver's per-day 'resolved'
logging repeats for the same case across days — `playerCaseDays` shows
case_2 "resolved:acquitted" on days 15–20 — that's the scan re-reading
a persistent resolution, not 6 trials. One trial per case.)

## Blank filled: answer-react fallback (convoAnswerReactLine)

**The blank** (M3 transcript 8): the NPC asks the player a direct
question via the ans: choice machinery; the player's answer
acknowledgment (react) is run-ledger-blocked; sayLine dry-replaces it.
Player-visible result: you answer "One day at a time." to "So what's
your plan here?" and the NPC says "...Sorry, lost my train of thought."
— the NPC asked and didn't listen. The r19 opener-skip deliberately
left mid-conversation beats soft ("no fallbacks"); the answer react is
the one mid-convo beat where dry is a listening failure, and it has a
natural two-candidate pool.

**Root cause:** the ans: branch voiced exactly one react candidate; the
no-repeat ledger had no alternative, so sayLine's honest-dry fallback
fired.

**Fix** (src/js/conversation.js): new `convoAnswerReactLine(vid, react)`
— first-unblocked-wins over [specific react, generic "Huh. Okay."] (the
r19 opener pattern); if the generic is blocked too, sayLine dry-replaces
honestly. The fallback is voiced through fillTalkLine only (no voiceLine
cycle step): the extra discourse-marker draw perturbed the villager's
mannerism cycle and deterministically broke
test-convo-seed-voice-20261011.js's voiceCheck (52/56 with the naive
version, 56/56 with this one) — a pure acknowledgment shouldn't spend
a mannerism draw.

**Proof** (scripts/test-answer-react-r20-20261017.js, seeds 4242/4243/4244):
- RED (pre-fix): 9/9 forced-blocked reacts → dry.
- GREEN (post-fix): 21/21 — blocked specific → "Huh. Okay." when the
  generic is free; honest dry when both are blocked (e.g. an earlier
  villager already said it this run).

**Regressions:** check.js --only convo 13/13; --only justice 3/3;
--quick 96/1 — the 1 failure is the pre-existing
test-sprites-valid-20261014.js (216 assertions), verified identical on
base 65726a16. validate-ontology.js 116/116.

## Census in plain words

Six villages on seeds 1404–1406, played 60 days each as a competent
player who talks to everyone daily — three of them with a thief for a
scholar. **Nobody's village collapsed** — all six ended with 8–11 souls
alive. The dead (20): monsters took 9, combat took 9, sickness and an
unclosing wound took one each. Kathleen the locksmith, Oscar the mason,
Zoe the journalist and Daniyar the paramedic are still standing in most
villages.

What they knew: the dead are grieved out loud and across days (Rafael
carries Tom and Kavya Dai from day 13 to day 15: "Getting there.");
wants are concrete and bodily ("My hands shake when I try to work");
the fire argues about monster names ('The Loud Beast' vs 'Big Big');
talk requests fire and resolve 24/24; gossip travels and distorts;
secrets are kept and told ("Their name was Wren. I haven't said that
out loud in months.").

What the thief's villages knew: Zoe, Jovan, and Grace each blocked the
scholar's path — "We need to talk about the stores. About what you've
been taking." The village went formal 35 times and acquitted 35 times,
but every acquittal left its mark, and twice the village stopped asking
and came with numbers (stage-4 uprisings). The accusers paid for their
failed cases in standing — the village resents the hand that points,
even when the finger is right.

What was missing: one listening failure (fixed — the answer react);
the heat/belief divergence is a design question for Steve, not a blank.

## Reachable / fun / winnable

- **Reachable:** yes — the full justice ladder (theft → heat → cold
  shoulder → confrontation → moot demand → trial → verdict → uprising)
  fires from ordinary play within 12 days of crime; grief, wants,
  secrets, recalls, and monster-naming all fire in normal conversation.
- **Fun:** yes — confrontations are voiced from the confronter's
  identity; moots deliberate with ceremony ("counts on their fingers,
  twice"); acquittals scar ("an accusation leaves a mark no verdict
  washes off"); the answer-react fix closes the one "NPC didn't listen"
  hole found.
- **Winnable:** n/a for the social leg; nothing gates. (Villages
  survived 6/6 — the social machinery doesn't cost lives; the thief's
  villages survived the thief.)

## Metric review (docs/MEASUREMENT.md §14)

- M1: GO (0.03%). The r19 fix holds; the 15% threshold stays.
- M2: GO (72.1% bind). The revised exclusion is validated — 32/93
  grief-window convos were legitimately displaced (seed/request/acute-
  need). Keep the revision.
- M3: GO (7/8). The 1 soft-FAIL produced this run's fix (answer-react
  fallback). The fail was real (dropped answer to a direct question),
  not driver theater.
- M4: GO (6/6 ≥5 alive). The r19 revision ("end the 60d harness with ≥5
  alive") measures village survival, not the scholar's calendar — keep.
- M5: GO (39 verdicts ≥ 2). The blank is closed: the ladder completes
  end to end. New observation for the backlog: heat/belief divergence
  (35/35 player acquittals under social play; conviction proven working
  when trust is low). Proposed follow-up: repeated-acquittal mark
  deepening — Steve's call.
- Metric doubt for the next run: mid-conversation deflection density is
  ~50% of NPC lines in 12-turn forced conversations (positional: 0% on
  beats 1–2, 32–80% from beat 3). This is the adversarial driver (never
  leaves at wind-down, recap-spams) more than the player experience,
  but a wind-down-respecting driver is needed to measure the true
  player-visible rate.

## Telemetry

`telemetry-check.js` vs `telemetry-baselines/social.json`:
- **LOUD: end.day 114 → 340 (+198%).** EXPLAINED (r18/r19 verdict
  stands): the baseline is stale pre-r17-schema; seed-driven.
- **LOUD: end.alive 31 → 55 (+77%).** EXPLAINED: same stale baseline;
  per-run alive counts (8–11) are healthy.
- qa.askedTotal / qa.answeredTotal / qa.recallHits: quiet.
- Baseline NOT rolled — it needs the canonical rebuild (r18's call).

## Convergence line

Social-life axis (leg 5): converging. Openers never go dry (0.03%);
grief carries in the death window (72% bind); answers are now always
acknowledged (react fallback); the full justice ladder runs from theft
to uprising with quorum-honoring, ceremony-voiced moots; zero
fabricated history; natural endings 98.3%. The r19 policy-coverage
blank is closed with evidence. Remaining: the heat/belief divergence
tuning question (Steve's lane) and a wind-down-respecting driver for
the true player-visible deflection rate.
