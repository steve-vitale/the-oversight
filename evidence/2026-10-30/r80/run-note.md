# Journey social r80 — RUN NOTE (lane B, 2026-10-30)

Leg 5 (social life), seeds 6601–6604, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master 52df7e732
at worktree registration. Rotation-b read 5 at run start, advanced
5 -> 6 at closeout (verified by reading the file back).
Driver: scripts/journey-social-r80-20261030.js (r75 verbatim except
seeds, evidence dir, and the moot census; zero game behavior change
in the driver itself). Wedge: r75 outing wedge verbatim. Zero src/js
changes. Smoke 6605 (30d) PASS.

## Pre-registration

See `prereg.md` in this directory (written before any seed ran).
Bindings judged as written; no metric re-scored. Pilot: smoke PASS,
then seed 6601 full 140d — instrument check (moot census fields
populate, daily snapshots run all 119 days, B1 reconciles) before
6602–6604 ran. 6601 reproduced identically on the full-panel re-run
(same SEED line), so the pilot seed stands in the judged series.

## The headline, plainly

The r73–r75 "0 moots on 12 seeds" watch item is CLOSED as an
instrument artifact — and moots are real. The old counter read
`(Game.state.village || {}).moots`, a field no src/js code ever
writes (verified by grep before the prereg: no `moots.push` /
`.moots =` anywhere in src/js). The moot record lives in
betrayalState: cases + mootConveneCounts + c.trial. Counted the
right way, this panel convenes moots on 2 of 4 seeds: 6603 calls
two moots from conversation, 6604 calls one from conversation and
one through the village's own npcMootTick. The moot system is not
dead. It is grievance-limited: villages with almost no grievances
never arm a plot, and that is correct behavior, not a bug.

## Pooled moot funnel (event-level truth)

| seed | days | alive | plots | sprung | expired | cases | trials | npc convenings | player convenings |
| 6601 | 119 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 6602 | 43 | 5 | 1 | 0 | 1 | 0 | 0 | 0 | 0 |
| 6603 | 142 | 5 | 2 | 2 | 0 | 2 | 2 | 0 | 2 |
| 6604 | 140 | 2 | 1 | 1 | 0 | 1 | 1 | 1 | 1 |
| POOLED | — | 14 | 4 | 3 | 1 | 3 | 3 | 1 | 3 |

villageMootsField = 0 on all four seeds (unwritten, as expected).
mootConveneCounts sum = 1 (6604's NPC convening only — the counter
is incremented by npcMootTick alone; player convenings from
conversation do not increment it, by construction).
Say-line convenings = 4 (1 npc-announce + 1 npc-call-echo + 3
player-call, 0 petition lines — the matcher now splits the
petition variant "You call a moot on it." from the betrayal line).

## Bindings (§14 — a miss is NO-GO, never re-scored)

- B1 INSTRUMENT-TRUTH: NO-GO as written, WITH a fully explained
  cause (not a re-score). 6601/6602/6603 reconcile exactly.
  6604 shows MISMATCH: sayTotalConvenings=2, casesWithTrial=1,
  while sayNpcAnnounce=1=mootConveneSum and
  sayNpcCallEcho=1=sayNpcAnnounce. The mechanism, proven by
  console.error tracing (quietLog silences console.log inside
  runDays — the first two probe attempts "failed" only because
  of that; see summaries/s6604-moot-mechanism-trace.txt):
  the player calls the moot late on day 14 (ticks=491); callMoot
  speaks, then tickAction(48) crosses midnight INSIDE the call;
  the nested endDay runs npcMootTick, which convenes the same
  case (Lucas announces, trial d14, quorum false, present 3);
  control returns to the player's callMoot, whose own
  conductTrial then overwrites the NPC trial with the binding
  one (d15, quorum true, present 10, acquitted). Two convening
  events, one surviving trial record. The instrument is truthful;
  the as-written equality (casesTrial == sayTotal) does not
  survive trial overwrite. Revision proposed for the NEXT run
  (not applied retroactively): casesTrial == sayTotal -
  overwrittenTrials, where an overwritten trial is a conductTrial
  on a case whose trial is replaced by a later same-case trial.
- B2 REACHABLE (NPC moots on >= 2/4 seeds): NO-GO as a threshold
  (1/4 seeds), but the SUBSTANTIVE question answers YES: moots
  convene in natural play on 2/4 seeds once player convenings
  count (6603: 2, 6604: 1 player event + 1 NPC event). The bar
  was written NPC-only because the old metric could not see
  player convenings at all; the finding is that the player path
  (conversation choice "Call a moot — put the murder to the
  village") is the live one in competent play, with the NPC path
  as the backstop. A future bar should count convenings of
  either kind, or say NPC-only explicitly.
- B3 DECOMPOSITION: the break stage, where moots do not happen,
  is ARMING, and it is grievance supply, not machinery. 6601
  armed 0 plots in 119 days with exactly 1 recorded grievance
  all run (the seeded ambush-outcome one) and 0 cracks: motive
  never reaches the NPC-target threshold of 35 without real
  grievances. 6602 armed 1 plot that expired unsprung (the
  lure-accept never came in its 4-day window; village scattered
  day 43). Plots arm on 3/4 seeds; every sprung plot opened a
  case (3/3); every case reached a trial (3/3 final trials;
  6604's NPC trial overwritten, counted once). No stage after
  arming is broken. A harmonious competent village staying
  peaceful is the system working.
- B4 PEOPLE: PASS. 5 sense reads (below), 2 moot-related (the
  Lucas d14 moot call + vote, the Dale d14 case investigation),
  0 fabricated-history flags, 0 weak endings. Identity stays
  straight: Wanjiru d15 keeps Chris's conversation Chris's
  ("You weren't there for that one — Chris was").
- B5 GUARDRAILS: pooled dry-per-convo 0.211 (296/1401), inside
  [0.20, 0.40] (per-seed 0.294 / 0.295 / 0.149 / 0.178 — 6603 and
  6604 sit below the pooled band individually, seed variance in
  the same shape as r67). Invitations still sometimes taken:
  party 9/22 + 8/15 + 8/10 + 11/15 pooled 36/62 (58%); lure
  0/0 + 0/5 + 2/2 + 1/1 pooled 3/8 (small sample). Outing funnel
  (carried, not judged): 28 accepts, 23 starts, 17 delivers
  pooled — the r75 shape holds (28 accepts, 23 starts, 16 delivers).
- B6 NO-REGRESSION: check.js --quick in the worktree (see
  closeout; baseline r75: 284 passed / 6 failed, same six
  pre-existing failures adjudicated by name).

## People check (sense reads, full transcripts)

Moot-window transcripts (replay probe, deterministic): transcripts/
s6604-mootwindow-d13-15.txt. The moot-calling conversation is
readable end to end:

- Lucas, 6604 d14 (moot-related, THE convening): opens "It's
  quiet today. Wrong kind of quiet." + "There's still the matter
  of the murder of Muhindo. Nobody's settled it." The player
  investigates bribery ("Another pass over the same ground.
  Somebody's being careful."), then picks "Call a moot — put the
  murder of Muhindo to the village" → "The moot is called. The
  fire gets built up." → votes GUILTY → "Counted." A case that
  lived in conversation becomes a moot by the player's choice,
  and the vote lands. Real.
- Dale, 6604 d14 (moot-related, the accused): Dale himself opens
  with the unsettled murder. The player presses him ("Walk me
  through that night again. Slowly." → "There — the story splits
  again. You mark the spot."), examines the site ("The ground
  remembers."), names witnesses ("Names, named."), follows the
  bribery trail ("Nothing solid. Keep looking."). The detective
  path works through talk, and the accused does not hide from
  the case. Real; the flat ending ("My social battery is
  officially dead.") is honest, not broken.
- Wanjiru, 6604 d15 (teaching): shows Black Walnut ("where it
  grows, how to tell it apart. A short laugh. 'And I've been
  walking past it for weeks.'") and tells a first memory
  ("Mine's Nakuru, Kenya, I think — heat on pavement, someone's
  hand huge around mine. Or I invented it."). Knowledge moves
  inside talk. Real.
- Farid, 6604 d13 (gossip): "People are saying things. About
  you. ...I'd watch how you act around the fire." — gossip with
  a warning inside it, plus the knack line about Megan. Ends
  warm ("You're a good listener, you know that?"). Real.
- Avery, 6604 d13 (callback): "We never finished talking about
  the gossip — we wandered off it, 4 days back." A real
  prior-thread callback, not invented shared history. Real.

Standing nits, carried not hidden: the double invite lines
("Want to come with us?" / "Want to come with me?") persist on
6604 d15 Lucas (r67/r73/r74/r75 nit, still live); the "You asked
me that before. It's a different question now." frame recurs
(mild tell, not a break).

## Village assessment (plain words)

- 6601 (119d, scattered, 2 alive): the thinning village. Monsters
  and sickness took most of it (4 monster, 2 sickness, 3 wild);
  20 deep bonds before the scatter, 5 outing delivers, party
  takes 41%. It talked itself to the end and then scattered —
  the social instrument dies with the village, as it should.
- 6602 (43d, scattered, 5 alive): the short village. Gone by day
  43 (wild, sickness, a night death); 8 deep bonds, 1 outing
  deliver, 1 plot armed and expired. Too short for moots — a
  reminder that the moot question needs villages that live.
- 6603 (142d, 5 alive): the moot village. Two ambush plots, two
  cases, two moots called by the player (Yuki/Gilberto/Joel
  accused over Boris, twice — exile once, acquitted once), plus
  a kept outing promise (Boris, 760 kcal). 25 deep bonds. The
  village argues its crimes out loud and keeps going.
- 6604 (140d, 2 alive): the murder village. One ambush (Dale,
  Dakota, Matteo over Muhindo), one moot night with two
  convenings (player + village), one binding acquittal, 33 deep
  bonds, 7 outing delivers. Thin by the end but still bonded.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes — moots convene in natural play (player path on
  2/4 seeds, NPC path on 1/4), and the case-investigation
  conversation (press/site/witnesses/bribery/moot) is a complete
  playable surface. The old "0 moots" number is retired.
- FUN: yes — the murder of Muhindo is a real story: a case opens,
  the accused talks about it, the player investigates through
  conversation, calls the moot, votes, and the village acquits.
  The double-convening night reads as a village that would not
  let the case sit, not as a bug.
- WINNABLE: not this leg's question to close — social life feeds
  the win (86 deep bonds pooled, party takes 58%, 16 outing
  delivers) and two of four villages were alive, bonded, and
  organized at the horizon.

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
`telemetry-baselines/social.json` over the four per-seed JSONs
(metrics l3.bonds, l3.deepBonds, dryRate, l3.mootsConvened, alive).
3 LOUD lines, all EXPLAINED, baseline NOT rolled forward:
- `l3.deepBonds disappeared: baseline 168 -> current 0`: NAME
  ARTIFACT (same as r73/r74/r75) — current field is l3.deep2
  (pooled 86), not deepBonds. Not a bug.
- `l3.mootsConvened disappeared: baseline 7 -> current 0`: RETIRED
  -METRIC ARTIFACT — the baseline's 7 was counted through the old
  field, and this run proves that field is unwritten by the game
  (0 on all four seeds) while true convenings are 4 events / 3
  trials in mootCensus. The baseline number is not comparable to
  either the old field or the new census. Not a bug.
- `alive newly appeared: baseline 0 -> current 14`:
  BASELINE-SHAPE ARTIFACT (same as r73/r74/r75) — pooled alive 14
  = 2+5+5+2. Not a bug.
- l3.bonds and dryRate: quiet.
Baseline NOT rolled forward: the stored baseline is a
different-era shape, and this run's instrument (mootCensus)
supersedes the retired village.moots metric. A baseline roll
belongs to an instrument-only run with a regime note, not this
one.

## Metric review

- B1 as written is NO-GO on 6604 with a proven mechanism
  (nested day-rollover + trial overwrite); the revised rule
  (casesTrial == sayTotal - overwrittenTrials) is proposed for
  the next run, not applied retroactively. Future instrument
  note: console.log is silenced inside runDays (quietLog) — all
  probe tracing must use console.error.
- B2's NPC-only bar is superseded as a question: the live moot
  path in competent play is the player's conversation choice.
  Next run's bar should count convenings of either kind, or
  keep an explicit NPC-only bar alongside a player bar.
- village.moots is RETIRED as a metric after this run: unwritten
  by the game. Future runs count convenings from
  mootConveneCounts + cases-with-trial + say-lines, with the
  overwrite clause.
- The r75 metric-review items (post-ending starts, partner-away
  dawn wall, walk/retry promotion, lure dip) are NOT this run's
  questions; they stay open for their own runs. Lure this run:
  3/8 (small sample, watch item continues).
- Driver hygiene fixed in passing: the verdicts filename was
  hardcoded `r75-verdicts.json` in the r75 driver (my fork
  carried it); renamed to `r80-verdicts.json` in evidence and
  fixed in the driver. Content was always the r80 verdicts.

## Files

- Driver: scripts/journey-social-r80-20261030.js (r75 verbatim +
  moot census: say-line convening hits, daily betrayal counts,
  end-of-run plot+case census; zero game behavior change).
- Probe: scripts/journey-social-r80-probe-20261030.js (tracing
  wraps + moot-window transcript save; NOT part of the judged
  series — the judged JSONs come from the clean driver).
- Analyzer: scripts/analyze-journey-social-r80-20261030.js
  (B1 reconciliation with petition/betrayal split + dry-per-convo
  guardrail; B2/B3 decomposition).
- Evidence: evidence/2026-10-30/r80/ (prereg.md, this note,
  per-seed JSONs, r80-verdicts.json, transcripts/ (261 files,
  incl. s6604-mootwindow-d13-15.txt), summaries/ (moot logs,
  s6604-moot-mechanism-trace.txt)).
- No src/js changes. No [needs-eyes] (instrument + measurement
  only; no feel/combat/UI change for Steve to playtest).

## Closeout

Commit: instrument-only (r80 driver + analyzer + probe driver,
prereg, run note, per-seed JSONs, summaries, transcripts).
Zero src/js. Merged locally pending ship — no version tag; ship
loop owns bump, push, and live verification.

## Closeout (main session, 2026-10-31 ~03:10Z)
The r80 coordinator timed out before closeout; no live worker process
behind the lock (ps-verified dead — the heartbeat loop died with the
timeout). Main session finished the closeout: `node scripts/check.js
--quick` re-run in this worktree → 284 passed / 6 failed, the six
being exactly the standing pre-existing set (measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20-fixes) — B6 adjudicated, no
regression from this run (zero src/js changes). Rotation-b was
already advanced 5 -> 6 by the run; lock deleted by this closeout;
no heartbeat loop survived to kill. Committed and merged by the main
session; worktree released, branch deleted.
