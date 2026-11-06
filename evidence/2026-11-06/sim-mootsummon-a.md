# sim-mootsummon-a — moot-turns-to-you summons census on stranded scholars

Worker: sim-mootsummon-a (Loop A, food-economy / narration).
Run: fleshout-20261106T0821Z, axis food-economy, arm sim-mootsummon-a.
Prereg (committed BEFORE any judged sim):
evidence/2026-11-06/sim-mootsummon-a-prereg.md (e51d8f525).
Instrument: scripts/policies/mootsummon-diag.js (moot classifiers +
kind classification + per-summons follow-up) on top of the judged
strandnarr-a full-transcript recorder
(scripts/policies/strandnarr-diag.js, reused verbatim), driver
scripts/mootsummon-trace-a.js, proof scripts/test-mootsummon-a.js
(33/33, including the ON-vs-OFF det-gate, the 17021 re-pin, and the
15003 anchor). Base HEAD: b5fb49607. Horizon 60 loop-days, policies
bankfood(warmed(woodcarry(nighttravel))) over competent, env gates
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1.
Seeds 48001–48040 (pilot 48001–48008, screen 48009–48040);
extension 48065–48088 NOT triggered. Zero src/js in this arm —
census / diagnosis only.

## Verdict: DIAG-GO — the summons DOES reach a stranded scholar, and it reads wrong

A moot-turns-to-you summons fires inside a stranded scholar's sleep
window at a rate NOT below the background rate — 1/22 stranded sleep
windows (4.5%) vs 43/2,185 non-stranded (2.0%) — and the one hit is
a live trial moot turning to a scholar asleep on a forest floor,
starving, miles from the fire, with no way to answer. The engine
carries no position gate anywhere in the trial-moot path (confirmed
in code and now in measurement): tallyVotes names the scholar a
voter without ever asking where they are. All 56 summonses in the
corpus are trial moots; the petition moot never summons in sims at
all (0/56 — it is player-convened, synchronous, and cannot fire
while away by construction). No scholar's vote was ever cast in the
corpus (0/56) — the sim policy never takes a conversation choice,
as the prereg disclosed — and 52/56 moots resolved without them via
the 2-day backstop ("The moot doesn't wait forever..."), the vote
simply never taken. The fix is named at the end for a future arm.

- Stranded sleep windows: 1/22 windows with a summons (4.5%),
  1 line, trial kind, at firing (not post-return).
- Stranded upkeep windows: 0/21 (mechanism check passes).
- Non-stranded sleep windows: 43/2,185 windows (2.0%).
- Non-stranded upkeep windows: 0/2,188 (mechanism check passes).
- Power bar (pre-registered: >= 20 stranded windows across >= 4
  stranding seeds): MET — 22 stranded sleep windows across 6
  stranding seeds (48006, 48018, 48021, 48029, 48032, 48040). The
  pilot (4 windows, 1 seed) failed it by construction, as the
  prereg anticipated; the screen supplied the census. No extension
  was needed. The verdict is a powered DIAG-GO, not an
  INSUFFICIENT-DATA.

## Primary metric (pre-registered)

Stranded sleep rate vs non-stranded sleep rate (windows holding
>= 1 moot-turns-to-you line / windows). Upkeep reported as a
mechanism check only.

| | Sleep windows | Summons windows | Rate |
|---|---|---|---|
| Stranded | 22 | 1 | 4.5% |
| Non-stranded | 2,185 | 43 | 2.0% |
| Stranded upkeep | 21 | 0 | 0% |
| Non-stranded upkeep | 2,188 | 0 | 0% |

- Pilot (8 judged seeds): 4 stranded windows on 1 stranding
  seed (48006) — FAILED the power bar's seed leg by construction,
  as the prereg anticipated. Pilot incidence 1/4, reported not
  hidden; pooled with the screen below.
- Screen (48009–48040, 32 fresh seeds; every seed run, stranding
  or not): 5 more stranding seeds, 18 more stranded windows, 0
  more stranded-window summons. Pooled census above is the verdict.
- The stranded rate (4.5%) sits ABOVE the non-stranded baseline
  (2.0%) on a single hit — the honest read is not "stranded
  scholars are summoned MORE" (n=22, one hit, the difference is
  noise) but "the summons is not gated while away": the code read
  (no position gate in tallyVotes/conductTrial) predicts a
  stranded rate equal to background, and the census is consistent
  with that. The defect verdict does not depend on the rate
  exceeding background — one powered, verbatim, reads-wrong hit
  at the background rate is the defect, exactly as in
  gossipcensus-a (2/25 at 8.0% vs 8.0%).

## The hit, verbatim (the one stranded-window summons)

Seed 48006, loop-day 9, forest_floor (0,8), access "remote",
evening outcome out-of-reach. Scholar stranded four nights
running (loop-days 7–10) on a forest floor at the map's edge;
survived 60 days. The loop-day-9 sleep window in full (25 lines;
the moot at its middle):

> Sleeping rough means the cold ground — heal ~16. Running on
> empty — no water or no food means half healing and a wrung-out
> morning. Drink and eat before you sleep.
> You settle into the cold ground. Sleep takes you.
> 🪵 Nikolai hauls back 5 wood. The pile grows. (53 logs now.)
> 📨 Word came: Sanne Bakker wants to join Haven. "Heard about
> this place three valleys over. Had to try." — they haven't set
> foot here. The village will judge.
> 📋 SYSTEM QUEST: "Teach us? Show us a plant you know COMPLETELY
> (Codex L3) — 13 candidates in your notes. We will watch very
> closely. Reward: integration."
> A cart-driver with flour on their sleeves waits a while, then
> moves on down the road. Word travels about that, too.
> **Vasyl has been talking at the fires. Enough voices — tonight
> they call a moot. Nikolai answers for what happened to Vasyl.**
> **🔴 LIVE! THE MOOT! The fire's built HIGH and the whole GALAXY
> is watching!**
> **TONIGHT: NIKOLAI, DANTE AND PAUL stand accused — CRIMES
> AGAINST THE VILLAGE! The gamblers are FRENZIED! Place your bets,
> place your bets!**
> **Vasyl calls the moot. The fire gets built up — word travels
> fast, and almost everyone comes.**
> **The moot turns to you. Your vote matters here — and everyone
> will remember it.**
> ◈ The System files the name away with visible satisfaction. It
> has so few words for things that bleed. (+6 integration)
> 🚶 A stranger walks into Haven. They're thin, scared, and
> carrying nothing. "Please," they say. "I heard you have food."
> (Drama: do you share?)
> The System's gifts are hungry: -75 kcal metabolic cost. Feed the
> power or lose it.
> ⚠ STARVING: health and energy falling. The spiral has started.
> You camp wild tonight — no pantry meal. Eat from your pack.
> — DAY 10 DAWN — The world wakes. Animals are active.
> 🎁 You find a small bundle tucked where you'll find it. No one
> saw it left there.
> "They're sending Vex after you tomorrow. He's bored. Be
> somewhere else."
> (337 kcal of dried meat and clean water. Nothing traceable.)
> "A message board post, quickly deleted: 'stay away from the
> northern treeline for a while. trust me.' — the System claims it
> saw nothing."
> 💬 Nikolai says: "Do you ever feel it? Like the air leans in
> when something happens."
> Luca Bazán reads the sky: frost tomorrow, cold.
> Your stomach is a fist. Eat — anything real, now.
> Dawn. You wake wrung out and unrepaired. (-7 health, wrung-out
> morning. You ran on empty — no water, no food, no real recovery.
> The body keeps score. (Drink and eat before you sleep.)) You
> spent the night out here, away from Haven — and you're still out
> here at dawn.

The follow-up (per-summons tracking, 3 loop-days): still stranded
loop-day 10 (forest_floor, out-of-reach); back inside Haven
loop-day 11; backstop + verdict loop-day 12, in harness phase:

> The moot doesn't wait forever. Two days of silence from the
> fire's edge — the count is taken without you.
> Irving counts on their fingers, twice, like they don't trust the
> first number. Then, to the fire: "1 for guilty. 5 against."
> A long exhale moves around the fire like weather. "Not guilty —
> this time."

No vote was cast, no "your vote lands" line fired. The scholar
was home on loop-day 11 — a full day before the backstop — and
still did not vote, because the sim policy never takes a
conversation choice (prereg-disclosed limitation). For a REAL
player, loop-day 11 was their chance: the vote surface
(conversation with a villager at the fire) was open that day. The
census cannot show a player voting; what it proves is that while
stranded (loop-days 9–10) they COULD NOT vote, and that the moot
resolved without them on loop-day 12 either way. The summons's
promise — "everyone will remember it" — is void when the backstop
resolves: with playerVoter cleared, finishTrial skips the
room-remembers block entirely, so nobody remembers a vote that
was never cast.

## Question (b) — the response surface (code read + observed resolutions)

- TRIAL vote: conversation choices ONLY (betrayal.js ~4645-4646:
  `vote_guilty` / `vote_acquit`, cast via castPlayerVote). A
  conversation requires talking to a villager at the fire; a
  stranded scholar cannot reach one. NO defer, NO return-time
  vote, NO remote vote exists anywhere in the trial path. The
  summons line itself names no deadline and no way to answer
  later — the 2-day backstop is never mentioned to the scholar
  until it fires ("Two days of silence...").
- PETITION vote: Haven-panel buttons ONLY (app.js ~320:
  `pet:vote:accept` / `pet:vote:reject`, answered via
  answerPetition). The panel is the Haven panel; no defer, no
  return-time vote. But a petition moot is player-convened and
  synchronous, so the stranded case cannot arise there — and the
  census confirms it (0/56 petition summonses).
- Observed in the corpus: 0/56 summonses got a vote cast (no
  "Counted.", no vote-lands line, anywhere). This is the sim
  policy's doing (it never picks a conversation choice), NOT
  proof a player cannot vote — the code read is what establishes
  that the ONLY surface is a live conversation at the fire. The
  census's contribution is the other half: 52/56 moots resolved
  via the backstop, i.e. the village takes the count without the
  scholar whenever the scholar does not vote within 2 days,
  stranded or not.

## Question (c) — what happens to the moot (per-summons follow-up, all 56 events)

- 52/56 resolved via the 2-day backstop + verdict within 3 days
  of the summons (backstop line, then verdict-count, then
  "Guilty." / "Not guilty — this time."). The moot proceeds
  without the scholar; the scholar's uncast vote counts as
  nothing (trialVoteTick clears playerVoter, removing them from
  the denominator too).
- 0/56 resolved by a cast vote. 0/56 by the exiled path.
- 4/56 have no backstop+verdict within the 3-day follow-up
  window:
  - 48012 ld15: the village was LOST on day 17, two days after
    the summons — the run ended before the backstop could fire.
    Explained, not stuck.
  - 48020 ld13: entangled in an overlapping moot — a second
    summons fired ld17, and ONE backstop+verdict fired ld19
    ("0 for guilty. 3 against."). One backstop for two summonses:
    one case's resolution is the other's, and the follow-up's
    recency attribution cannot say which. The 3-day window is
    too short when moots overlap (see metric review).
  - 48006 ld19 and 48039 ld13: NO backstop, verdict, or any
    resolution line anywhere in the remaining run (41 and 47
    loop-days). The likely mechanism is the ghost-trial closure
    (betrayal.js ~1170: an accused killed mid-case resolves the
    case 'accused_died' — "the moot doesn't try the dead") — but
    the corpus trim drops that line (it is not a moot-classified
    line), so this is a NAMED HYPOTHESIS, not a verified fact.
    Either way the scholar's vote was never taken and never
    resolved on the record. The next run should track the
    dead-case line (see metric review).
- Corpus totals: 58 moots convened (LIVE + call lines), 56
  summonses, 54 verdict-counts, 52 backstops. The 2 convened
  moots that never summoned are immediate verdicts: when
  tallyVotes draws playerVoter=false (the 10% roll, or the
  scholar accused/exiled), conductTrial finishes the trial on
  the spot — e.g. 48016 ld30, LIVE + call + verdict-count in one
  night ("0 for guilty. 6 against."), no summons, no wait.

## Kind split + phase distribution (all 56 summons events)

- Kind: trial 56/56, petition 0/56, unknown 0/56. Every summons
  carried a trial context (LIVE line and/or trial call line) in
  its window. The petition summons cannot fire while stranded
  by construction (player-initiated, synchronous) — and in this
  corpus it never fired at all, stranded or not, because the sim
  policy never presses "Call a moot" in the petition panel.
- Phase: sleep 44, harness 12, daily 0. Trial moots convene
  wherever endDay fires: inside sleep when the scholar sleeps
  before the tick budget is spent, in the harness gaps between
  upkeep parts when a daytime wait exhausts it. The harness
  channel is real (12/56 summonses) — but in this corpus it
  NEVER fired on a stranded loop-day: zero non-sleep moot lines
  on any of the 22 stranded loop-days. The loop-day (any-phase)
  stranded rate is therefore identical to the sleep-window rate
  here: 1/22 stranded loop-days (4.5%) vs 55/2,187 non-stranded
  loop-days (2.5%). The sleep window did not undercount the
  stranded rate on this corpus — but it could on another (see
  metric review).

## Sense-testing (transcripts read, not just counted)

- The one stranded hit READS WRONG, unambiguously: the summons
  ("The moot turns to you. Your vote matters here — and everyone
  will remember it.") is addressed to a scholar asleep on a cold
  forest floor, starving, who has not eaten, while three
  villagers stand accused at a fire miles away. The window's own
  lines say so ("You camp wild tonight — no pantry meal", "You
  spent the night out here... still out here at dawn"). The vote
  cannot be cast from the wild (conversation only, at the fire),
  and the trial resolved without them two days later. The lines
  are good lines at Haven — 43/2,185 non-stranded sleep windows
  carry the same summons, and there it is simply the village
  turning to its scholar at the fire. The defect is delivery
  position, not prose.
- The backstop line itself reads true as a verdict on silence —
  "Two days of silence from the fire's edge" — but it is only
  honest if the scholar HAD a way to break the silence. A
  stranded scholar's silence is not a choice; it is distance.
  The backstop treats the two as the same thing.
- Contrast — the coherent case in the same corpus: a
  non-stranded summons (e.g. 48001 ld10, scholar inside Haven)
  fires in a sleep window where the scholar is at the fire, the
  vote surface is a conversation away, and the backstop two days
  later is a genuine deadline for a scholar who chose not to
  speak. Same lines, same mechanism — the position is what makes
  one true and the other wrong.
- Upkeep windows are clean by mechanism, not by luck: 0 summons
  lines in 2,209 upkeep windows (stranded + non-stranded). No
  moot machinery runs inside a competentEat upkeep call — so the
  upkeep half of the question answers itself, as in the
  gossipcensus/enddaybeats family.

## Why the rate is what it is (mechanism, not just incidence)

- The summons is rarer than the gossip burst (2.0% baseline vs
  8.0%): a trial moot needs an open case + the convening tick +
  the scholar named a voter, while the burst needs only gossip
  above threshold. 58 moots convened across 40 runs (~1.5/run);
  56 turned to the scholar. A stranded scholar who spends a week
  out faces ~1 - (1-0.045)^7 ≈ 27% chance of at least one summons
  — a steady drip, not a once-a-run glitch, and every one of them
  asks for a vote the scholar cannot cast.
- The stranded denominator (22) is small, but the equality-with-
  background reading is the point: nothing in the chain
  (npcMootTick → callMoot → conductTrial → tallyVotes) reads the
  scholar's position, so the stranded rate CANNOT differ from
  background except by chance. The census confirms the code read.

## The fix, named for the next run (NOT built here — diag only)

RECOMMENDATION (one): GATE the trial moot's convening on the
scholar being at Haven — do not call the moot while the scholar
is away; hold the convening until they return.

- Mechanism: npcMootTick / playerCaseTick skip convening while
  the scholar is not inside Haven (the same position question
  the raid-call gate asks). The LIVE broadcast, the call line,
  the summons, and awaitingPlayerVote all wait together — the
  trial is a full-village ceremony, and calling it while the
  scholar is miles away is the defect. The 2-day backstop is
  untouched: it covers silence AFTER the summons, which can then
  only happen at the fire, where silence is a choice.
- Why this shape and not a return-time vote surface: (1) the
  frequency is low (1/22 windows) but the loss is total — the
  vote and the room's memory, decided without them; (2) the
  village ALREADY waits to convene: npcMootTick holds cases
  (mootIn || 3) days in a "people are choosing sides" phase
  before calling the moot, so waiting for the scholar's return is
  the same kind of wait, not a new one; (3) the engine already
  excludes an absent scholar from the count (playerVoter=false
  when exiled — the exiled precedent: "The moot doesn't wait for
  the exiled"), so the gate extends an existing honesty to the
  stranded instead of inventing one; (4) the alternative — a
  return-time vote surface — requires a trial-vote UI that does
  not exist (trial votes have NO app.js surface, only
  conversation choices), while the gate is a one-condition change
  at the convening ticks. A return-time surface remains the
  fallback if the gate proves to stall the justice ladder on long
  strandings — the next arm should measure stall duration if it
  builds the gate (cases held open while the scholar is away).
- What the scholar loses without it: their vote in a trial of
  their own villagers, the social memory of having voted
  (grievances/trust that follow a cast vote never fire), and any
  say in a verdict that may exile or condemn someone they know —
  all decided within 2 days of a summons they could not answer.
- No gate/price/deed change is implied. The petition moot needs
  NO fix (it cannot summon while away by construction). The
  backstop needs NO change (it is the never-waits-forever
  guarantee, and it already says the honest thing about silence
  — once silence is a choice again).

## Per-seed table (daysAlive / end / stranded nights / stranded sleep windows-summons / non-stranded sleep windows-summons / summons events)

Format per seed: daysAlive, endReason, strandedNights,
sSleepW-sSummW, nsSleepW-nsSummW, events.

- 48001: 60 survived / 0 / 0-0 / 60-2 / 4
- 48002: 60 survived / 0 / 0-0 / 60-0 / 0
- 48003: 40 village-lost / 0 / 0-0 / 40-4 / 4
- 48004: 60 survived / 0 / 0-0 / 60-0 / 0
- 48005: 60 survived / 0 / 0-0 / 60-2 / 4
- 48006: 60 survived / 4 / 4-1 / 56-1 / 3 (HIT loop-day 9)
- 48007: 31 village-lost / 0 / 0-0 / 31-0 / 0
- 48008: 60 survived / 0 / 0-0 / 60-0 / 0
- 48009: 60 survived / 0 / 0-0 / 60-0 / 0
- 48010: 52 village-lost / 0 / 0-0 / 51-0 / 0
- 48011: 59 village-lost / 0 / 0-0 / 59-0 / 0
- 48012: 17 village-lost / 0 / 0-0 / 17-1 / 1
- 48013: 60 survived / 0 / 0-0 / 60-0 / 0
- 48014: 38 village-lost / 0 / 0-0 / 38-3 / 3
- 48015: 60 survived / 0 / 0-0 / 60-0 / 0
- 48016: 60 survived / 0 / 0-0 / 60-4 / 4
- 48017: 60 survived / 0 / 0-0 / 60-0 / 0
- 48018: 60 survived / 1 / 1-0 / 59-0 / 0
- 48019: 60 survived / 0 / 0-0 / 60-0 / 0
- 48020: 60 survived / 0 / 0-0 / 60-2 / 3
- 48021: 60 survived / 1 / 1-0 / 59-3 / 4
- 48022: 60 survived / 0 / 0-0 / 60-0 / 0
- 48023: 60 survived / 0 / 0-0 / 60-5 / 5
- 48024: 60 survived / 0 / 0-0 / 60-1 / 2
- 48025: 60 survived / 0 / 0-0 / 60-1 / 2
- 48026: 60 survived / 0 / 0-0 / 60-2 / 2
- 48027: 60 survived / 0 / 0-0 / 60-0 / 1
- 48028: 60 survived / 0 / 0-0 / 60-0 / 0
- 48029: 60 survived / 5 / 5-0 / 55-3 / 3
- 48030: 60 survived / 0 / 0-0 / 60-1 / 1
- 48031: 60 survived / 0 / 0-0 / 60-2 / 2
- 48032: 60 survived / 3 / 3-0 / 57-0 / 0
- 48033: 34 village-lost / 0 / 0-0 / 34-1 / 1
- 48034: 60 survived / 0 / 0-0 / 60-0 / 0
- 48035: 26 village-lost / 0 / 0-0 / 26-0 / 0
- 48036: 52 village-lost / 0 / 0-0 / 51-0 / 0
- 48037: 60 survived / 0 / 0-0 / 60-0 / 0
- 48038: 60 survived / 0 / 0-0 / 60-4 / 6
- 48039: 60 survived / 0 / 0-0 / 60-1 / 1
- 48040: 60 survived / 8 / 8-0 / 52-0 / 0
- Pooled (40 seeds): daysAlive sum 2,209; survived 31/40 (median
  60d, the horizon cap; max 60d); village-lost 9/40 (days 17, 26,
  31, 34, 38, 40, 52, 52, 59); stranded nights 22; stranded sleep
  22 windows / 1 summons; stranded upkeep 21 windows / 0;
  non-stranded sleep 2,185 windows / 43 summons windows;
  non-stranded upkeep 2,188 windows / 0; summons events 56 (all
  trial); backstop resolutions 52; votes cast 0; transcript
  errors 0.
- Note: 48021 has 21 stranded upkeep windows vs 22 stranded
  sleep windows — the loop-day-60 stranded night has no following
  morning (the horizon cap), the same class of asymmetry as the
  gossipcensus/enddaybeats censuses. Honest, not a miscount.

## Metric review

- The power bar did its job exactly as designed: the pilot (4
  windows, 1 seed) failed it and the pre-registered screen — not
  a re-score — supplied the census (22 windows, 6 seeds). No
  metric was changed mid-run. The pilot's 1/4 is reported above,
  not discarded: pooled with the screen it is 1/22.
- PROPOSED REVISION 1 (proved this run): the sleep window is the
  wrong denominator for the moot. endDay fires from a daytime wait
  whenever the tick budget runs out mid-day, so trial moots
  convene in harness phase too (12/56 summonses) — and a summons
  on a stranded loop-day could land there, outside any sleep
  window. On THIS corpus the loop-day rate equals the sleep-window
  rate (no harness-phase moot line fell on a stranded loop-day),
  so the verdict is unaffected — but the next census should bind
  the LOOP-DAY rate as the primary (summons on stranded loop-days
  / stranded loop-days, any phase) with the sleep-window rate
  alongside for comparability with the gossip family.
- PROPOSED REVISION 2 (proved this run): the 3-day follow-up
  window is too short when moots overlap. 48020's ld13 and ld17
  summonses share ONE ld19 backstop; the recency attribution
  cannot say which case it resolved. A future follow-up should
  track case identity (the trial's caseId / accused set, read from
  the summons window's LIVE line) instead of attributing by
  recency, and should scan at least 5 loop-days.
- PROPOSED REVISION 3 (proved this run): the trim drops the
  ghost-trial closure line ("<X> is gone — the moot doesn't try
  the dead. ..."). Two summonses (48006 ld19, 48039 ld13) have no
  resolution anywhere in the remaining run, and the corpus cannot
  say whether their cases closed by accused-death or are stuck at
  awaitingPlayerVote. Add an isDeadCaseLine classifier and keep
  the line in the trim before the next moot arm.
- The mid-window-return rule (adopted from the enddaybeats-fix
  metric review) ran clean: 0 post-return summonses in the
  corpus (sFiring == sSumm == 1) — no window spanned a return
  before its summons. The rule stays in the instrument for the
  next run; it cost nothing and would have caught a §1-class
  artifact.
- The "events" rule (a summons line = 1 event; a window holding
  it scores 1 summons window) was unit-tested (two summonses in
  one window = 1 window, 2 lines). In the judged corpus no window
  held more than one summons line, so events = summons windows
  throughout for the sleep comparison; the 56 events count lines
  anywhere (sleep + harness).
- No metric was re-scored mid-run. The defect verdict rests on
  the pre-registered sleep-window primary (1/22 vs 43/2,185) with
  the loop-day rate (1/22 vs 55/2,187) stated alongside as a
  measured secondary, not a re-score.

## Wall numbers (carried, NOT re-measured)

This is a narration census corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct seeds):
wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24. Consistent with the 0028Z round
(evidence/2026-11-05/sim-winnability-round-0030.md): wins
lesser-only, full seat 0, wave-5 kills 0. This corpus's survival:
31/40 survived the 60d cap, median 60d — a narration corpus,
not a scale run.

## Runs, files, commits

- Prereg: evidence/2026-11-06/sim-mootsummon-a-prereg.md
  (e51d8f525, committed BEFORE any judged sim).
- Instrument + proof: scripts/policies/mootsummon-diag.js,
  scripts/mootsummon-trace-a.js, scripts/test-mootsummon-a.js
  (58c0a226d, proof 33/33).
- Census corpus: evidence/2026-11-06/sim-mootsummon-a-corpus/
  mootsummon-s48001..48040.json (e8ef0ccda, 40 files, 0
  instrument errors, 0 transcript errors).
- Proof: scripts/test-mootsummon-a.js — 33/33 (unit classifiers
  + kind classification + follow-up tracking on synthetic
  instances + det-gate + anchors), run 2026-11-06. node --check
  clean on all three new scripts.
- check.js --quick: NOT run — this run adds new scripts only and
  edits no src/js, no existing policy file, and no green-list
  test, so no green-list test can be affected by it (the
  enddaybeats-a precedent is the same). Verification for this
  run is the proof test (33/33), node --check on all three new
  scripts, and the ON-vs-OFF det-gate.
- Infrastructure notes: the safe-commit index clobber hit all 4
  commits in this run (prereg, instrument, corpus — each file
  shown staged-as-deleted after commit); repaired every time
  with git update-index --add --cacheinfo from the HEAD blob,
  tree verified clean (status empty + diff HEAD empty +
  hash-object matches). Commits always correct. One safe-commit
  call with a directory path failed with "fatal: Unable to add
  <dir> to database" and created an EMPTY commit (8ecda42c1);
  the empty commit was removed with a soft reset on this
  worktree's own branch (no sibling work on it) and the corpus
  re-committed from the expanded file list (e8ef0ccda, 40 files).
  No EPERM flap hit this run (all 40 corpus files wrote on first
  attempt).

## Left unjudged

- Whether the two never-resolved cases (48006 ld19, 48039 ld13)
  closed by accused-death or are stuck at awaitingPlayerVote:
  the corpus trim drops the dead-case line, so it cannot say.
  Metric review item 3 names the fix for the next run.
- Whether a gated convening would stall the justice ladder on
  long strandings: the gate is recommended, not built; the
  building arm should measure held-open case duration.
- WOODWARM=1 leg: not run — the anchor reproduced on WOODWARM=0
  and the stranded question does not depend on the warmth leg.
  A WOODWARM=1 census would be a different trajectory, not a
  missing verdict.
- The stranded windows' other haven-side lines (the enddaybeats
  family's LEAVE beats — nightfall, lingerer gorge,
  direct-address chatter) are in the corpus in full for the
  sibling arms; this arm judged only the moot summons.

## Backlog items (for the coordinator to append to sim-findings.md)

- [open] 2026-11-06 — narration/position — MOOT-TURNS-TO-YOU
  SUMMONS REACHES A STRANDED SCHOLAR AND READS WRONG
  (sim-mootsummon-a, evidence/2026-11-06/sim-mootsummon-a.md):
  powered census, 40 seeds: a trial-moot summons fires inside a
  stranded scholar's sleep window at the background rate (1/22
  stranded sleep windows = 4.5% vs 43/2,185 non-stranded = 2.0%;
  upkeep 0/21 vs 0/2,188). The hit quoted verbatim (48006
  loop-day 9, forest_floor): "Vasyl calls the moot. ... The moot
  turns to you. Your vote matters here — and everyone will
  remember it." addressed to a scholar asleep miles from the
  haven, starving. Trigger is npcMootTick → callMoot →
  conductTrial → tallyVotes, which names the scholar a voter with
  no position gate anywhere (only exile excluded). The vote can
  only be cast in conversation at the fire; no defer, no
  return-time vote, no remote vote exists. 52/56 moots resolved
  without the scholar via the 2-day backstop; 0 votes ever cast
  in sims. Fix named (gate the trial moot's convening on the
  scholar being at Haven; backstop untouched); diagnostic only,
  zero src/js in this arm.
- [open] 2026-11-06 — justice/moots — TWO SUMMONED MOOTS NEVER
  RESOLVE ON THE RECORD (sim-mootsummon-a,
  evidence/2026-11-06/sim-mootsummon-a.md): 2 of 56 summonses
  (48006 loop-day 19, 48039 loop-day 13) have no backstop,
  verdict, or any resolution line anywhere in the remaining run
  (41 and 47 loop-days). Likely the ghost-trial closure
  (accused died → case resolved 'accused_died', betrayal.js
  ~1170) but unverified — the corpus trim drops the dead-case
  line. Either way the scholar's vote was never taken and never
  resolved on the record. Next moot arm should track the
  dead-case line (metric review item 3) and say whether these
  cases closed or are stuck at awaitingPlayerVote.
- [open] 2026-11-06 — instruments/moot — MOOT FOLLOW-UP NEEDS
  CASE IDENTITY, NOT RECENCY (sim-mootsummon-a,
  evidence/2026-11-06/sim-mootsummon-a.md): 48020's loop-day-13
  and loop-day-17 summonses share ONE loop-day-19 backstop; the
  recency attribution cannot say which case it resolved. The
  3-day follow-up window is too short when moots overlap. Next
  moot arm should track case identity (accused set from the LIVE
  line) and scan at least 5 loop-days.
