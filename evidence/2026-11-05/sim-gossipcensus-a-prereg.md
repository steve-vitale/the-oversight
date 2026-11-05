# sim-gossipcensus-a — PRE-REGISTRATION (committed BEFORE any judged sim)

Worker: sim-gossipcensus-a (Loop A, food-economy / narration).
Run: fleshout-20261105T1415Z. Assignment: gossip-targeted census on
stranded scholars (DIAGNOSTIC ONLY, zero src/js — a measurement arm, no
game change, no lever to land). This is the 1041Z run's food-economy
next blank (3) and sim-findings.md's open gossip item, left open by
sim-strandnarr-a (2026-11-04, evidence/2026-11-04/sim-strandnarr-a.md
§2 "Context questions" and "Left unjudged").

## The question, precisely

Does a haven-gossip line ever fire inside a stranded scholar's sleep
or upkeep window — i.e., does a scholar away from haven hear haven
chatter while stranded?

The two line shapes (the monsterNewsCheck burst, game.js
monsterNewsCheck / kickMonsterNaming / seedMonsterNames):

- `Word gets around the haven. Whatever that thing was — ...` (3
  rotLine variants, monsterReaction pool)
- `Back at the haven the argument starts: <who> is calling it
  "<name>." ...` (3 rotLine variants, monsterDebate pool)

Both fire in the SAME burst: monsterNewsCheck says the first line,
then calls kickMonsterNaming -> seedMonsterNames, which says the
second. One burst = two lines, counted as ONE gossip event (burst)
with two line hits.

## Code facts (read, not assumed)

- The engine's monsterNewsCheck carries NO position gate (confirmed
  by strandnarr-a; re-verified this run: game.js:23050-23068 — the
  only gates are `e.namingKicked`, `e.reported`, and knowers >= need,
  where need = max(1, min(3, rosterN))).
- The burst can fire in ANY phase, because its call paths are
  phase-agnostic:
  - spreadGossip() (game.js:17953) calls spreadMonsterNews() at its
    end (game.js:18088); spreadGossip runs once per day-part in
    advancePart (game.js:6607) and once per travel step in the
    travel-step debt loop (game.js:12928).
  - endDay() (game.js:32450) carries the witness branch
    (game.js:~32487, 15% per reported-but-unnamed monster per day)
    that calls monsterNewsCheck directly — and endDay runs INSIDE the
    sleep window (called from sleep()'s midnight rollover).
  - The killer's-tale report path (game.js:23027) and the
    identifyMonster tell path (game.js:4997) call monsterNewsCheck
    from conversation/daily play.
- Gossip lines DO fire in sleep windows on non-stranded nights
  (strandnarr-a §2: e.g. seed 15003 loop-day 7, seed 15091 loop-day
  10). The mechanism exists; the pilot simply did not catch it
  firing while stranded (0/11 sleep, 0/10 upkeep — but only 2 of 8
  pilot seeds ever stranded, so the pilot was underpowered for this
  question).

## Capture lesson (from strandnarr-a — binding on this run)

A daily-slice capture MISSES sleep/upkeep windows (the
upkeep-breakfast closure). This census MUST capture full transcripts
(the strandnarr-a full-transcript instrument pattern:
scripts/policies/strandnarr-diag.js, reused verbatim) and classify
each gossip line by window AND the scholar's position at fire time
(sleep-start / first-upkeep-start marker: insideHaven, mx/my, tile).

## Primary metric

Stranded-window gossip incidence, pilot + screened census:

- Stranded night = a loop-day evening whose nighttravel outcome is
  `travel-refused` or `out-of-reach` AND the scholar is not inside
  Haven at daily exit (the strandnarr-a evening gate, unchanged).
- Stranded sleep window = the sleep window after a stranded evening.
  Stranded upkeep window = the upkeep windows of the morning after a
  stranded evening (loopDay = stranded loopDay + 1).
- Denominator = stranded sleep windows + stranded upkeep windows
  (counted separately and pooled).
- Numerator = stranded windows containing >= 1 primary-burst line
  (either shape; a burst's two lines count as ONE event in that
  window).
- POWER BAR (pre-registered): denominator >= 20 stranded windows
  observed across >= 4 stranding seeds. If either leg fails, the
  verdict is INSUFFICIENT-DATA, never re-scored.
- VERDICT RULE (pre-registered): DIAG-GO iff the incidence rate is
  established with verbatim quotes either way — a 0 rate on a
  powered census IS a verdict (the burst never reaches a stranded
  scholar), not a non-result. A non-zero rate is DIAG-GO with the
  sense verdict below deciding whether it reads wrong (fix-or-
  document) or coherent (document only).
- Contrast (not the verdict): the same incidence over non-stranded
  sleep windows and non-stranded upkeep windows on the same seeds,
  so a stranded 0 is read against a live non-stranded rate.

## Secondary observations (census, not verdict arms)

- The naming-settle line `It's settled. The village is calling it
  "<name>."` (monsterNamingCheck) observed inside a stranded window:
  reported verbatim with window + position, NOT counted in the
  primary numerator (it is a different beat — the argument's
  conclusion, not the burst).
- Per-seed burst counts by phase (daily / upkeep / sleep / harness)
  and the fire-time position of every burst line.
- EXCLUSIONS (never counted as haven-gossip): teachGossip `Word
  gets around.` (game.js:18151), `You back "<name>." Word gets
  around.` (game.js:23142), `(Word gets around: Haven feeds
  travelers. ...)` (game.js:26477), and the hierarchy/truth
  `Word gets around <village>:` / `Word gets around the fire:`
  lines. The classifier matches ONLY the two burst templates.

## Sense test (SENSE-TESTING LAW — judge meaning, not counts)

Every stranded-window hit is quoted verbatim and the stranded
night's transcript is read: does the line read WRONG to a player
(a scholar camped in a thicket hearing "Back at the haven the
argument starts") or COHERENT (e.g. the scholar is the one who
reported, and the line is the System relaying the haven's reaction
to THEIR report)? The sense verdict is stated in the evidence file
and decides fix-or-document vs document-only. A 0 rate gets the
same read on the nearest non-stranded sleep-window hits for
contrast.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days. Why: the strandnarr-a anchor sits at
  loop-days 51–53 and the judged band is the same substrate; dead
  villages stop simulating (runDays stops on Game.over), so 60 is a
  cap, not a sentence.
- Policies: bankfood(warmed(woodcarry(nighttravel))) over competent,
  env gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1, BANKFOOD=1, WOODWARM=0 (the leg
  that reproduces the strandnarr-a anchor; WOODWARM=1 not run).
- PILOT (8 seeds, judged first, before any confirm spend): 17021,
  15003, 15009, 15091, 15211, 15215, 15220, 15221 (the strandnarr-a
  band, verbatim). Expected from strandnarr-a: 11 stranded sleep +
  10 stranded upkeep windows on 2 stranding seeds — which FAILS the
  power bar's seed leg by construction, so the pilot is expected to
  end INSUFFICIENT-DATA and trigger the pre-registered screen below.
  The pilot is still judged (its incidence is reported, not hidden).
- SCREEN / CONFIRM (pre-registered, runs ONLY after the pilot):
  the same driver over the bankretain-substrate-a band 17001–17024
  (23 fresh seeds; 17021 already in the pilot is not re-run). This
  band is judged strand-screened substrate ("yielded stranded
  evenings") and is reused whole-token, not cherry-picked — every
  seed in the band runs, stranding or not, so the screen cannot
  inflate the rate by selection.
- If pilot + screen still fail the power bar (< 4 stranding seeds
  or < 20 stranded windows), the run ends INSUFFICIENT-DATA with
  the extension named as the NEXT run's job: a fresh band verified
  by whole-token grep across ALL dated preregs
  (evidence/*/sim-*-prereg.md) plus the forbidden-band lists
  (99201–99208 et al. named in 2026-11-04 preregs) — a check of
  only today's files is NOT a freshness check. No fresh band is
  named or run inside this run.

## Det-gate (instrument honesty)

Seed 17021, 60 loop-days, instrument ON vs OFF: bankfood evening
records, morning records, first-upkeep kcal series, and daily-entry
scholar kcal must be identical. Any divergence = instrument
contamination; the run stops and the instrument is fixed first.
The census driver adds position snapshots (reads only, no state
edits, no RNG) alongside the strandnarr-a markers; the det-gate
covers the whole driver, not just the reused recorder.

## Anchor reproduction (judged in the proof test, before the pilot)

- Known non-stranded sleep-window gossip hit: seed 15003 loop-day 7
  (strandnarr-a §2). The proof test asserts the census driver
  captures a `Word gets around the haven` line inside the loop-day-7
  sleep window on seed 15003, classified non-stranded sleep with
  the scholar inside Haven at fire time. If the exact loop-day
  does not reproduce, that is reported as a finding (substrate
  drift), not silently re-anchored — the anchor is the strandnarr-a
  claim, and a miss moves the proof to FAIL.
- Stranded anchor: seed 17021 loop-days 51–53 are thicket
  out-of-reach strandings (strandnarr-a). The proof asserts the
  census driver reproduces 3 stranded sleep windows on 17021 with
  0 gossip bursts (the strandnarr-a pilot incidence), classified
  stranded sleep with the scholar outside Haven at fire time.

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO /
INSUFFICIENT-DATA per the rules above, never re-scored against a
friendlier metric mid-run. If a metric proves wrong, it goes under
"metric review" in the evidence file with a revision proposed for
the NEXT run. Every evidence file carries a "metric review" section.

## Wall numbers (carried, NOT re-measured)

This is a narration census corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct seeds):
wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24.

## Deliverables

- evidence/2026-11-05/sim-gossipcensus-a-prereg.md (this file,
  committed BEFORE any judged sim)
- evidence/2026-11-05/sim-gossipcensus-a.md (verdict, rates with
  denominators, every stranded-window hit quoted verbatim, sense
  verdict, metric review)
- evidence/2026-11-05/sim-gossipcensus-a-corpus/ (per-seed JSON:
  judged windows + every burst line + per-loop-day counts;
  stranded nights kept in full transcript)
- scripts/policies/gossipcensus-diag.js (burst classifiers +
  position reader; reuses scripts/policies/strandnarr-diag.js
  verbatim for the transcript recorder)
- scripts/gossipcensus-trace-a.js (driver: same stack as
  strandnarr-trace-b.js, only the analysis differs)
- scripts/test-gossipcensus-a.js (proof: unit classifiers +
  det-gate + anchor reproduction)
- Zero src/js changes. Zero policy changes. No gate/price/deed
  change. No push, no bump, no live verification (coordinator
  merges via --ff-only; ship loop owns deploys).
