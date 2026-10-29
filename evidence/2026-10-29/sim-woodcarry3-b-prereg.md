# sim-woodcarry3-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261029T1630Z,
arm sim-woodcarry3-b, axis food-economy (daytime wood-carrying
precondition lever, new prereg on a properly-banked band).
Worktree sim-woodcarry3-b. POLICY-SIDE LEVER ONLY: zero src/js
changes, zero default flips. This worker does NOT merge to
master — coordinator merges.

## Background (read before judging — verdicts NOT re-litigated)

- evidence/2026-10-29/sim-creekremedy-b.md +
  sim-creekremedy-b-prereg.md (DIAG-GO, on master): a bridge EXISTS
  (Game.buildBridge: 4 player-carried wood, 60 kcal, 96 ticks, no
  gate); no ford mechanic exists. On 11 creek-refused evenings
  bridge-feasible was 0/11, wood-short 11/11, kcal never solely
  binding, time never binds.
- evidence/2026-10-29/sim-woodcarry-b.md +
  sim-woodcarry-b-prereg.md (1441Z run, INSUFFICIENT-DATA
  killed-at-pilot, lever reverted): the lever spec — MORNING
  CARRY (each loop-day, only when the player starts the day at
  haven, not dead, not in combat: if player wood < 4 AND pile
  minus deficit >= 8 pile floor AND morning kcal >= 60 AND
  canCarry, take exactly deficit = 4 - wood logs via the same
  honest transaction as Game.takeWood: pile -= deficit,
  addWood(deficit), say line, tickAction(2)) plus an EVENING
  BRIDGE attempt when a creek refusal would otherwise strand
  (classify via creekremedy-diag pure reads; if creek AND wood
  >= 4 AND evening kcal >= 60 AND ticks-to-day-end >= 96 AND
  probe tile needsBridge true and bridged not-true, call
  Game.buildBridge, retry Game.travelTo(haven) once, delegate
  to insideevening's eveningStep on arrival) plus a LACKING-LINE
  on still-refused creek tails naming what is lacking. Detour
  OFF both legs; clearhabit out.
- evidence/2026-10-29/sim-woodcarry2-b.md +
  sim-woodcarry2-b-prereg.md (1530Z run, INSUFFICIENT-DATA
  missed min-n by ONE: OFF episodes 7, bar 8, rescue rate 7/7 =
  1.000, pooled inside evenings 88 -> 120). THE DESIGN FLAW TO
  FIX, stated here so this run does not repeat it: the 1530Z
  band was banked under the blocktype driver (no thief grant,
  no taps) while judged legs used the woodcarry driver family
  (thief grant at setup + taps last 5 days); a scratch
  diagnostic proved the thief grant perturbs seed 13025. The
  prior run's 3/3 and 7/7 rescues are NOT re-scored. This is a
  new prereg on a properly-banked band.
- Backlog #1423 (food-economy/travel — WOOD-CARRY LEVER):
  this arm claims its follow-up. #1425 (player deaths counted
  from the start) is satisfied in method. #1424 (lacking-line
  never proven in play) is carried: if zero still-refused ON
  creek evenings exist the honesty guard passes VACUOUSLY and
  is reported as vacuous, not proven; if one exists, its tail
  is read end to end.

## Canon + code FIRST (the lever comes from here, never from wishes)

Read first: docs/CANON.md (manifest), docs/MAP.md §1 (home board:
creeks run top-to-bottom, ~35% of creek tiles need a bridge or a
swimmer) and §6 (the way home: node travel is free, no
teleport). No canon doc covers a wood-carry habit as a system;
the authority is the engine itself (src/js/game.js), verified by
grep before this prereg was written:

- TAKE (pile -> pack): Game.takeWood() — takes min(4, pile)
  logs, 2 ticks, no kcal, weight-checked via canCarry (2 kg per
  log). It takes a FIXED amount (up to 4), not a requested
  deficit, so the lever's carry performs the SAME honest
  transaction for exactly the deficit (pile -= deficit,
  addWood(deficit), say line, tickAction(2)) when the villager
  already carries some wood.
- BRIDGE: Game.buildBridge(x, y) — 4 wood from the PLAYER's
  inventory, 60 kcal (clamped at 0, not refused), 96 ticks, no
  knowledge/skill/occupation gate. Refuses when dead, mid-fight,
  already bridged, or no gap to span. Permanent until a storm
  smashes it.
- CREEK BLOCKAGE: Game.travelBlockage refuses a needsBridge,
  unbridged creek tile to anyone without the swimmer skill.
  Game.clearBlockage refuses it by hand.
- FORD: MECHANIC ABSENT (creekremedy finding, kept). No ford
  share is reported anywhere in this run.
- PILE FLOOR ANCHOR: scripts/policies/competent.js assigns a
  wood-duty villager when the pile falls below 8. The lever's
  pile floor is therefore 8: the carry never takes the pile
  below 8, so the hearth's reserve logic is never tripped by
  the lever itself.
- ENGINE DETAIL (verified in the prior corpus, kept): the
  classification's blockedTileBridged reads null when the
  engine flag is unset; only true counts as bridged in the
  bridge gate. buildBridge takes the PROBE tile's (x, y), not
  the haven coords.

## The lever (policy-side, default-OFF, WOODCARRY=1)

scripts/policies/woodcarry.js, a wrapper around nighttravel,
two steps, both policy-side, identical to the prior prereg's
specification (see also the file header):

1. MORNING CARRY (pre-competent.daily, each loop-day, only when
   the player starts the day at haven — inside true, or tile
   'haven' outside — not dead, not in combat): if player wood
   < 4 AND pile minus deficit >= 8 (PILE_FLOOR) AND morning
   kcal >= 60 (KCAL_FLOOR — the bridge's own cost: below it
   the morning is a food emergency and competent.daily's
   food-seeking takes priority) AND canCarry(deficit * 2), take
   exactly deficit = 4 - wood logs from the pile into the pack
   (pile -= deficit, addWood(deficit), one honest say line,
   tickAction(2)). Recorded per carry (loop-day, wood before/
   after, pile before/after, kcal, skipped reason when any gate
   fails). CUT-SITE CARRY IS OUT OF SCOPE: pile-carry only.
2. EVENING BRIDGE (post-nighttravel.daily, only when the night
   step recorded travel-refused with hopReturnKind block:creek):
   classify the refusal from the refusal-time state (reusing
   creekremedy-diag's pure classifyRefusedEvening / bucketOf —
   pure reads, no RNG, no game writes). If classified creek AND
   wood >= 4 AND evening kcal >= 60 AND ticks-to-day-end >= 96
   AND the probe tile carries needsBridge true and bridged
   not-true AND not dead AND not in combat, call
   Game.buildBridge(probe tile). If bridged, retry
   Game.travelTo(haven) once; if arrived at the haven node,
   delegate to insideevening's eveningStep for the lodge leg,
   exactly as nighttravel delegates after a hop. Recorded per
   evening (classification, attempt made/skipped + reason, build
   result, retry hop result, entry outcome, final position).
   If the evening is STILL refused after any attempt (or no
   attempt was made), the wrapper says ONE honest line naming
   what is lacking (wood deficit, kcal shortfall, ticks, or the
   build's own refusal). The line fires only on the ON leg; the
   OFF leg keeps the engine's silent line, so OFF-vs-ON tails
   differ only by lever lines, which is intended.

The wrapper NEVER touches src/js, NEVER writes game state except
through the engine verbs above (addWood, buildBridge,
travelTo, eveningStep), and draws NO RNG itself (carry,
classification, bridge, and retry draw none; a retry hop's
arrival may run the engine's own encounter checks, exactly as
nighttravel's hop does — that is downstream of the lever, not
an instrument draw).

## Banking method (chosen here, before judging): OPTION A — strip, then verify

Strip the thief grant AND the taps (neither judged; both were
substrate identity only) from the judged driver
(scripts/woodcarry3-trace-b.js: no ability granted at setup, no
tap block at all) and re-verify census reproduction on the
1530Z band (13025, 13067, 13268, 13276) as part of the OFF leg
itself, BEFORE any ON leg runs:

- VERIFICATION GATE: the judged OFF leg's per-seed episode
  counts must equal the blockscreen2 census counts — 13025: 3,
  13067: 1, 13268: 3, 13276: 1, total 8. Day-range exactness is
  reported as a cross-check, not gated: the min-n unit is the
  episode count, and the 1530Z judged OFF leg already showed
  counts matching census on 13067/13268/13276 with day shifts
  on 13268/13276, so counts are the gate and ranges are the
  diagnostic.
- If the gate passes, the band is judged as banked (expected
  n = 8) and ON legs run on the same 4 seeds.
- FALLBACK (fully specified here, not post-hoc): if the gate
  fails on any seed, the band is NOT judged. Instead, seeds
  are screened sequentially from 13100 upward under the
  stripped OFF driver, and the judged band is every screened
  seed with >= 1 OFF episode, stopping when cumulative OFF
  episodes reach >= 10 (screening capped at 30 seeds; if still
  < 10 episodes, the verdict is INSUFFICIENT-DATA on banking
  failure and no ON legs run). The screened OFF legs ARE the
  judged OFF legs (same driver, deterministic — no re-run
  needed), and ON legs then run on exactly the screened band.
  Selection uses OFF-leg episodes only, before any ON leg
  runs, under this pre-committed rule — it is banking, not
  post-hoc seed shopping.
- No post-hoc seeds are ever added to a judged band after ON
  legs run. If the fallback band is used, the evidence file
  says so and names the screening rule.

## Corpus (banked band, judged-driver family)

Seeds 13025, 13067, 13268, 13276 (blockscreen2 creek bank;
census episodes 3/1/3/1 = 8). Horizon 30d, death-aware (dead
villages stop; this band survived 11/12 to day 30 in census).

## Legs

Detour OFF, clearhabit absent, all separation gates unset/0
(COMPETENT_EVENING_DETOUR, COMPETENT_STANDING_HOME,
COMPETENT_ROUTE_AROUND, COMPETENT_TRIPHOME_ROUTE_AROUND),
substrate COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, DAYS=30, NO taps, NO thief grant, driver
scripts/woodcarry3-trace-b.js, POLICY=nighttravel:

- OFF leg: WOODCARRY=0 -> wrapper delegates (no carry, no
  bridge, no narration line) but STILL classifies refused
  evenings (pure reads, the creekremedy recorder's proven
  non-perturbation), corpus sim-woodcarry3-b-corpus-off/.
- ON leg: WOODCARRY=1 -> full lever, corpus
  sim-woodcarry3-b-corpus-on/.
- The driver records per loop-day the morning position, the
  evening position, the evening say tail, and ctx._wcLast (the
  wrapper's record) plus ctx._wcCarry (the morning carry
  record).

## Pilot rule (8 seeds before confirm spend — addressed, not dodged)

This band is 4 seeds, smaller than 8. That is stated here and
justified, not padded: the power unit of this experiment is
the EPISODE, not the seed (min-n 8 episodes, rate judged over
episodes), and creek seeds are rare — only 4 were banked in
the blockscreen2 census. At the judged family's ~1.75
episodes/seed, 4 census seeds clear min-n 8 with the census
counts (3/1/3/1); padding with unbanked seeds would break the
banking this prereg exists to fix. The fallback rule above
(rather than padding) is the honest route to more seeds if
the census counts do not reproduce. No unbanked seed is added
to the judged band after ON legs run.

## Classification (per travel-refused evening, both legs)

Identical to creekremedy / prior woodcarry: CREEK evening =
outcome travel-refused AND hopReturnKind block:creek AND
recorder probe finds blockType creek on the SAME tile type AND
no probe/route error. OTHER-REFUSED = travel-refused with a
non-creek hop type (context count only, never in the creek
denominator). UNCLASSIFIED = hop says creek but the probe
disagrees or errors. Unclassified evenings break GO — never
papered over.

## EPISODE DEFINITION (verbatim — the unit of judgment)

An episode is a maximal run of consecutive refused creek
evenings on the OFF leg for a seed. An episode is RESCUED if,
on the ON leg, the villager is inside at haven on the episode's
first refused evening (or a bridge is already built spanning
that creek by then) with no refused creek evening that day.
Episodes are counted on the OFF leg; the denominator never
shrinks because the lever worked.

OPERATIONALIZATION (fixed here, before any judged leg, so the
analyzer implements exactly this): for an OFF episode whose
first refused evening is loop-day D on seed S, look at the ON
leg's evening row for seed S, loop-day D. The episode is
RESCUED iff that row exists AND its driver position is at the
haven node (mapPx/Py == haven hx/hy — inside at haven, or
outside on the haven tile, the night spent at haven either
way, as in the prior run's RESCUED definition) AND that day's
ON evening does not end refused after a creek refusal (a creek
evening that same day ending at haven counts — the bridge was
built that evening; an evening ending away after a creek
refusal does not). A missing ON row (game over / shorter leg)
is NOT rescued.

## Primary metric, GO bar, guards (judge ONLY against these)

PRIMARY: episode rescue rate = rescued episodes / OFF-leg
episodes.

This prereg keeps the 1530Z episode primary (it superseded the
evening share with justification: bridging is permanent, so
each rescued episode collapses its remaining evenings — the
evening-share denominator is structurally deflated by success
itself). The evening share is retained as SECONDARY, for
comparability, and is explicitly NOT the judge.

- GO requires ALL of:
  (a) OFF-leg episodes >= 8 (min-n, never lowered);
  (b) episode rescue rate >= 0.50;
  (c) unclassified == 0 on BOTH legs;
  (d) recorder/classifier errors == 0 on both legs;
  (e) determinism re-run byte-identical for one ON seed;
  (f) DIVERGENCE AUDIT: for each seed, the first loop-day on
      which OFF and ON evening-row sequences differ (excluding
      lever-record fields) is on or after that seed's first
      lever-action loop-day (carry, bridge, or narration line)
      — no spooky divergence before the lever acts;
  (g) STARVATION GUARD: pooled ON-leg PLAYER deaths <= pooled
      OFF-leg PLAYER deaths + 1, causes listed, and any ON
      death causally traced to the carry (kcal diverted, pile
      starved below the hearth floor, overload) fails the guard
      regardless of count;
  (h) HONESTY GUARD: every still-refused ON-leg creek evening's
      say tail carries the lever's lacking-line — or, if none
      exist, the guard is reported VACUOUS (see #1424), never
      claimed proven.
- GO -> land the policy lever default-OFF
  (scripts/policies/woodcarry.js + driver + analyzer + tests +
  evidence + corpora; no driver adopts it by default).
- NO-GO -> pilot/confirm share or a game-ground guard fails at
  scale: lever reverted, evidence + corpora land as the record.
- INSUFFICIENT-DATA -> OFF episodes < 8, or a GO condition
  failing on instrument grounds, or the banking fallback
  failing to assemble >= 10 episodes: name the failed
  condition, lever reverted, do NOT add post-hoc seeds to the
  judged band (extension candidates go in the evidence as a
  next-run note only).
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under a "metric review" section for
  the NEXT run. Every evidence file carries a "metric review"
  section.

## Secondary (reported, never judged)

- Pooled inside evenings OFF vs ON (evenings ending inside on
  the haven tile, same count as the prior run).
- Median survival ratio ON/OFF (daysAlive medians).
- Per-seed episode table (OFF episodes with first/last days,
  ON first-day outcome, rescued flag).
- Evening-share (for comparability with the prior run,
  explicitly NOT the judge): ON rescued creek evenings / ON
  creek evenings, with Wilson 95% interval.
- Sense reads (below).
- Carry counts + skipped reasons, bridge attempts + outcomes +
  skipped reasons, other-refused counts, floor-feasible share
  on ON creek evenings.
- Cross-check vs blockscreen2 census: OFF-leg creek counts and
  episodes per seed vs the census episodes above. Divergence is
  reported and explained, never hidden.
- Wall numbers: NOT OBSERVABLE on 30-day evening legs
  (pre-seat). National / table / wins are reported as NOT
  OBSERVABLE, never claimed.
- Balanced panel (MEASUREMENT.md §15 — explicit, not a fake):
  NO balance-panel compare .md is produced, as pre-registered
  here before judging: this leg is a 30-day position
  measurement of a POLICY-SIDE lever — zero src/js changes, so
  there is no game-root delta for a panel to compare, and the
  panel's registry policies do not include the nighttravel
  trace policy. The divergence audit + determinism re-run are
  the instrument-perturbation proofs, and the pre-registered GO
  bar above is the judge. If a future bridge lever becomes a
  game change, a panel compare is run at that point.

## Horizon + why (death-aware, never a fixed 200d)

30 loop-days, same as the creekremedy / woodcarry legs: the
refused pattern is visible inside 30 days (census episodes run
1-10 evenings within 30 days). Dead villages stop simulating
(runDays endReason); the +10d tail is a cap, not a target.

## Sense-testing (mandatory, in the evidence file)

Read tails end to end for at least one rescued episode (does
the carry read as a person preparing? does the homecoming read
as played?) and, if one exists, one still-refused ON evening
(does the lacking-line name what is missing?). Judge meaning,
not counts.

## Village assessment (mandatory, in the evidence file)

Plain words: what the village looked like, who thrived and who
died and why, what knowledge/capabilities were missing, which
blank was filled (this lever, if GO) or documented. Plus wall
numbers (NOT OBSERVABLE — stated, not claimed).

## Metric review (prereg — doubts carried into the run)

- EPISODE PRIMARY, KEPT: the 1530Z episode rate behaved as
  designed — 7/7 episodes rescued while the evening share
  (5/5 on 5 ON evenings vs 31 OFF) showed the collapse the
  supersession was written to avoid. Keep the episode rate as
  primary; do not revert to evening share.
- BANKING VERIFICATION RISK: the verification gate judges
  counts, not day ranges. If counts reproduce but ranges shift
  (as 13268/13276 did under the grant driver), the band is
  still judged — the episode count is the power unit, and a
  range shift under a stripped driver would itself be evidence
  of a second perturber, which the evidence file must then
  name and the next run must isolate. Counts are the gate;
  ranges are the diagnostic.
- Kcal floor on a free action: the carry costs 0 kcal, so the
  60-kcal morning floor is a judgment gate, not a cost gate.
  It never bound in either prior run (0 skips); it is kept as
  written here and judged as written.
- Ticks gate: the 96-tick evening gate never skipped a bridge
  in either prior run — all ON creek evenings held 96+ ticks.
  The gate remains untested under pressure; a future run with
  late-day refusals should watch it.
- Honesty vacuity, third run running: two consecutive runs
  with zero still-refused ON evenings. The lacking-line proof
  now needs a deliberately staged still-refused evening (e.g.
  a kcal-starved creek seed) as its own measurement if this
  band again produces none — named here as the follow-up, not
  claimed in advance.
- If the metric proves wrong, write it under "metric review"
  in the evidence file and propose the revision for the NEXT
  run — never re-score mid-run.

## Landing rule

- GO: land scripts/policies/woodcarry.js (default-OFF,
  WOODCARRY=1 to enable) + driver / analyzer / proof
  instruments + evidence + corpora. NO src/js change, NO
  policy lever adopted by any driver by default, NO default
  flip.
- NO-GO / INSUFFICIENT-DATA: land the record (evidence +
  corpora + analyzer + proof) but REVERT the policy file and
  its driver — killed arms leave no trace in
  scripts/policies/.
- This worker does NOT merge to master — coordinator merges.
  Report 'committed, pending coordinator merge' with the
  verdict, the episode rescue rate + guards, and the evidence
  paths.
