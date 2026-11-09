# Journey succession r165 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r165 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r165 = next Lane B number after r164 crisis
(landed f2f5829cb, 2026-11-09 ~19:06Z). Base: master 129698ea6
(sim-radsnap-a tip; r164 + sim rounds in base).

## Standing state (why this run replays leg 7)

r161-succession LANDED on master (agency-dry diegeticAct fix in
villager-agency.js + evidence; gate 292/8 standing, 2 load timeouts
re-run green; adopted 2026-11-09 ~02:40 CST). r163 social + r164
crisis landed since. This run answers the ONE carried owed item
r161 explicitly left open: the mantle 2-day latency (r112 landing
note, carried through r155/r157/r161 metric reviews).

## The carried blank: mantle 2-day latency (pinned pre-play)

History, from the committed record (no new play yet):
- r107 (landing, Nov 2): "Succession 2-4d latency observed (watch
  closed)."
- r117 (landing, Nov 7): REPRODUCED — seed 1089: Lucia dies d23 by
  betrayal in the Duel contest (fired d22, end d23); village runs
  scholar-less through d24; mantle passes to Victor d25. Latencies
  on that panel [0,1,1] otherwise; the slow case is a contest death.
  "Why d24's dawn didn't pass it stays open — the succession sweep's
  timing is the next run's instrument question."
- Nov 7 memory: "2-day latency not reproduced a 3rd panel."
- r119 (deepening, Nov 8): "mantle latency max 1."
- r155 (Nov 7): lin/mo false on 33806 is a DETECTION-timing artifact
  (first death detected a day late; chain had already moved on).

Mechanism pinned pre-play, from current-master code + the r117
committed panel log (goal hidden_files evidence/2026-11-07/
landing-r117/landing-r117-panel.log, seed 1089 block, lines 787-795):
- Game side: playerDeath (ledger.js:655+) chooses the successor
  SYNCHRONOUSLY in the same call — `this.villagerId = newId` runs
  inside playerDeath, after the epitaph line. Every death path
  (contest contests.js:5490, expedition, pit trap, fight, disease,
  arena, phoenix) calls playerDeath directly. On its face the game
  passes the mantle the same tick the bearer dies.
- Driver side (landing driver): the mantle is detected by a
  once-per-OBSERVED-day snapshot (`snap.journalHolder =
  Game.villagerId`, daySnapshot at end of the day-change block).
  The day-change block runs only when `gd !== lastGd` at the loop
  top. On seed 1089: header day 23 (loop 22), PLAYER DEATH day 23
  (the driver's own playerDeath wrap — proves the real
  playerDeath executed and returned on scholar-day 23), then NO
  day-24 header and NO day-24 snapshot, then MANTLE PASS day 25
  (loop 24). The day rolled 23→25 inside loop 23's play phase
  (FILL day 24 mid-iteration proves a roll happened there), so day
  24 was never observed at a loop top and never snapshotted. The
  "2-day latency" reads exactly as a SAMPLING artifact: the mantle
  may have passed on day 23 (right after that day's snapshot) and
  the driver first observed it on the day-25 snapshot.
- The r117 parenthetical ("no fresh conversational villager
  today" on d24) is NOT scholar-less evidence: that line is the
  landing driver's baseline on most days (it fires whenever the
  driver's talk-history finds no fresh partner), and the r161
  succession driver does not emit it.

So the open question is narrow and decidable: does playerDeath
flip the bearer immediately on return (game-synchronous, latency
is sampling), or does some death path defer the flip (real game
latency)? This run instruments it directly instead of inferring
from coarse snapshots.

## Question

On current master, with the fine probe: (a) does EVERY bearer
death flip `Game.villagerId` immediately inside playerDeath
(wrap records newId != oldId on return)? (b) what is the fine
latency (first sample with the new bearer minus death day) per
death, and does any latency > 0 trace to a recorded day-roll at
the death boundary (sampling) rather than a scholar-less day
(game)? (c) do the r161 regression bars still hold after the
r163/r164 landings?

## Instrument (r161 driver/analyzer verbatim + the fine probe)

- Driver: scripts/journey-succession-r165-20261109.js = r161 driver
  with ONLY r161->r165 renames (filename, transcript/tele filename
  patterns, EVID_DIR evidence/2026-11-09) PLUS the fine mantle
  probe below. No other logic change. The r161 after-leg files stay
  intact under their r161 names.
- Analyzer: scripts/analyze-journey-succession-r165-20261109.js =
  r161 analyzer with ONLY r161->r165 renames PLUS a mantle-latency
  section (fine latency per death, coarse latency for comparison,
  GAME-vs-SAMPLING classification). CAP-NC scoring unchanged.
- THE FINE MANTLE PROBE (new, driver-only, zero src/js):
  (1) Instance wrap on Game.playerDeath installed right after
  loadGame/setupGame, before any play (the landing driver's R14
  pattern): on every call record {day: scholar.day at call,
  cause, oldId, newIdAfter: Game.villagerId immediately after
  return, flippedImmediate: newIdAfter != oldId && newIdAfter !=
  null, lineageDay: last lineage entry day, over: Game.over}.
  Call-through, return-through; the wrap never changes behavior.
  (2) Day-boundary sampler: instance wrap on Game.sleep records
  {dayBefore, dayAfter, villagerId} per sleep (day-skip detector:
  dayAfter - dayBefore > 1 means a day rolled mid-iteration
  without an observed snapshot). (3) Sample series: after every
  runDays call in phase A and every post-day iteration, record
  {day, villagerId} into rec.mantleSamples. Fine latency per
  death = first sample day with the new bearer - death day.
  POST_DAYS=70, EARLY_KILL_DAY=40, CONVO_DAYS unchanged.
  Controls: no forced kills.

## Seeds

- Smoke: 33998 (EARLY_KILL_DAY=5, POST_DAYS=25) proves the r165
  driver + probe first. Deliberate reuse (r151/r155/r157/r161
  smoke seed).
- Panel (fresh band): 34001–34008, run in order. No CAP-NC stop
  rule needed for the latency question (every seed yields >=1
  scripted death + chains, so the latency denominator exists on
  every seed); CAP-NC is a carried regression bar, reported
  descriptively if its denominator stays short (r157/r161
  precedent: insufficient-data, not a miss).
- Order: smoke → panel 34001–34008 → (fix decision, if any) →
  after-leg re-run of affected seeds only if a fix lands.

## Seed-band freshness (skill: local_seed_band_freshness)

- Band 34001–34008: searched ALL dated preregs
  (evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md,
  grep for 3400[1-8]) — ZERO matches. Forbidden bands named in
  November preregs (73641–73648, 73671–73678, 78201–78208,
  99351–99358, 99401–99412, 99001–99008, 99009–99024, 99041–99052,
  99101, 99201–99208, 99209–99216) do not intersect. The r157
  contaminated list (897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042, 1043–1052,
  1053–1062) does not intersect.
- Full-evidence substring hits for 34001–34008 are metric values,
  not seeds: `"pantryFreshAfter":34003` in
  evidence/2026-10-16/crumbguard-pilot/census-control/*-s101-census.json
  (a kcal count; same noise class as r161's check). No
  `"seed": 3400x` / `SEED=` / `seed=` use anywhere in evidence.
  Band 34001–34008 is FRESH. No collision; no fallback needed.
- Smoke 33998: deliberate reuse (above). Repro seed 1089 (r117):
  NOT reused under this driver — the Duel death needs the landing
  driver's contest-driving skeleton to recur, and the wrap settles
  the mechanism for every death kind this driver observes. A 1089
  contest replay is a stretch goal if time remains, not a prereg
  promise.

## Bars (binding, §14)

- MANTLE-FINE (binding, new): for EVERY observed bearer death on
  the panel (scripted first kill, organic phase-A deaths, chain
  kills), the playerDeath wrap records flippedImmediate == true
  (newId != oldId immediately on return) AND fine latency <= 1,
  with any latency-1 case explained by a recorded day-roll at the
  death boundary (sleep sample shows the day already rolled, or
  the death fired inside endDay processing), NOT by a scholar-less
  game day. A single death with flippedImmediate == false, or a
  fine latency >= 2, or a latency-1 with no day-roll at the
  boundary, FAILS the bar and the mechanism is pinned from the
  wrap record (death kind + call site).
- MANTLE-COARSE (reported, not scored): the driver's existing
  per-day detection latency per death (phase-A detection day -
  death day; scripted day is exact), for comparison with r117's 2
  and r107's 2–4. A coarse latency > fine latency on the same
  death is the sampling gap, quantified.
- AGENCY-DRY CENSUS (binding, carried from r161): ZERO dry lines
  at agency turns attributable to the agency place line across ALL
  driven transcripts on the panel seeds.
- TEACH-DRY CENSUS (binding, carried from r157): ZERO dry lines
  at 'teach' turns attributable to the teach-narration line.
- OPENER-DRY CENSUS (binding, carried from r155): ZERO dry lines
  at conversation open attributable to the trade-seed line or a
  link-raise opener line. Classification (r157 metric review,
  adopted r161): a sayTrace fellBack with pick null is not itself
  a dry line — the returned text decides.
- DRY CENSUS (binding, carried from r151, REVISED per r157 metric
  review, adopted r161): ZERO dry lines at ask/details turns
  attributable to a favor whyLine, however delivered (engageBeat
  OR dlg:details).
- CAP-NC REGRESSION (binding, carried from r143): PASS = >=3
  eligible seeds AND >=3 bonded by the deadline AND bonded/eligible
  >= 2/3. Denominator shortfall is INSUFFICIENT-DATA, not a miss
  (r155 merge call, same shape); descriptive bondedEver reported.
- PROOF TESTS (binding for any fix claim): r146 + r147 + r151 +
  r155 + r157 + r161 proof tests re-run GREEN on the final tip;
  any new fix carries its own proof test, verified RED on unfixed
  code and GREEN after.
- SELF-REQUEST REGRESSION CHECK (reported, not scored):
  selfReqDayEntries == 0 on every seed.
- CARRIED (reported, not scored): pick-time rank == 1 on every
  first handoff with npcCalls; funeral INCALL beat present on every
  leg death.
- PEOPLE CHECK (sense, not a count): read one d+14 successor
  transcript per panel seed + the death-day narration around each
  first mantle pass (epitaph + transfer lines). Bar:
  conversations have meaning per the sense-testing law; the
  successor's first day must read as a person stepping up, not a
  scholar-less gap — and no new filler or line promising a need
  that isn't there.

## What would count as an interesting finding

- A death with flippedImmediate == false (a real game-side
  deferral — the defect class the r117 note left open).
- A fine latency >= 2 on any death kind.
- A contest death occurring organically in the panel (rare in
  this driver's regime) with its own latency reading.
- A coarse latency > fine latency traced to a recorded day-skip
  (the r117 mechanism, observed on this driver's own samples).
- A control dry changing (a fix leaking into unrelated paths).
- A CAP-NC regression from a dialogue-only fix (none expected;
  no dialogue fix is pre-planned).

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions (r151 precedent:
per-seed means, n=8 panel). KNOWN WART (r151): the checker sums
across files while the baseline holds per-seed means — LOUD lines
on deaths.bearer <redacted> census.fallen are the summation artifact unless
per-seed means actually move. Run the check, investigate any LOUD
line, do NOT roll sums into the baseline.

## Fix policy

No new game change is pre-planned. If the wrap shows a real
game-side deferral, the fix is attempted same-run ONLY if small,
safe, and provably a defect in the mantle-pass class with its own
proof test; otherwise the finding is documented with evidence for
the owning builder lane and the branch merges only if the binding
bars pass. If the latency is sampling (wrap flips immediate on
every death), the fix is INSTRUMENT-side: the succession driver's
coarse detector gains the day-skip correction (record skipped
days in the sample series; scripts-only change, no src/js). No
gate, deed, wave, nor table change under any reading of a finding
(freeze stands).

## Expansion trigger

Instrument failure only: playerDeath wrap recording no entry on
a seed whose stdout shows a scripted kill, sleep wrap recording
no day roll across a full run, talkRequests unreadable, bondDaily
empty on a seed with a recorded handoff, bondDaily entries missing
bearerId, newcomer detection never recording _newcomerSeen, or
SAYTRACE recording no fellBack on a seed whose transcript shows a
dry line (fix instrument, re-run that seed once). A CAP-NC miss,
a no-newcomer-arrival seed, a village ending before the deadline,
or a skipped seed never triggers expansion alone.

## Metric review (to be filled after the panel)

- Canon note: no canon doc covers mantle/bond formation
  specifically (r127's standing note, unchanged). Governing rules
  used: ledger.js "successor: the village chooses. Trust decides";
  party-bond.js "v.bonds built by meals/visits/feasts, +6/pair/day
  cap, no bonds with the dead or gone"; CONVERSATIONS.md structural
  contract ("The repeat ledger must not replace a successful
  promise with 'lost my train of thought.'"); CANON.md "No silent
  actions". Nothing invented, nothing changed.
- The mantle 2-day latency owed item (r112 landing note) is this
  run's question.
- CAP-NC denominator: r157's fresh band yielded 2 eligible, r161's
  yielded 1 eligible (second handoffs dominate). This run keeps
  the 8-seed panel; a decisive CAP-NC verdict may need a longer
  panel or a band with earlier arrivals — a prereg question for
  the NEXT run, not a re-score here.
