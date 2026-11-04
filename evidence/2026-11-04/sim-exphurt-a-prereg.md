# sim-exphurt-a — PREREG (binding, MEASUREMENT.md §14)

Run: oversight-flesh-out-loop, run fleshout-20261104T1445Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-exphurt-a. Axis: food-economy.
Arm: EXPHURT DISCONNECT write-back (findings backlog #1699, re-confirmed
2026-11-04, food-economy next blank #2 from run fleshout-20261104T1220Z).
Sibling arm sim-bankfood-a works a different blank — its files, trees,
and claims are NOT touched by this arm.

## CONTEXT (not re-litigated)

- The hurthome turn-home fix itself LANDED in run 1220Z (hurthome-fix-c,
  GO) and is NOT re-litigated here: a hurt traveler on a trip with an
  end date now comes home at the next travel tick
  (Game.shouldHurtReturn, src/js/game.js npcNodeTravel return branch),
  and when the player is at Haven that branch says so:
  "returns from the wilds hurt (health N/100) — the trip cut short."
  That landed line stays intact whatever this arm does.
- What remains unbuilt is the WRITE-BACK: the expedition's hurt clock
  and its away clock disagree, and a hurt return still reads, in its
  homecoming line, as a normal homecoming. Code-read mechanism
  (not invented canon; no canon doc covers away-return timing):
  - Departure (villager-agency.js expedition departure) writes ONE
    duration into TWO places: st.exped[vid].duration and
    v.away[vid].duration (same value, 8–20 parts).
  - expedHurt (villager-agency.js) caps ONLY st.exped[vid].duration
    (min with legs+1) — it never writes back to v.away[vid].duration.
  - The only clock that returns anyone is v.away.duration, read in
    npcNodeTravel's return branch. st.exped.duration is read nowhere
    as a return clock (grep: only the cap site and the departure
    site touch it).
  - Return narration runs in TWO lines in the SAME travel tick, in
    this order: (1) npcNodeTravel's hurt line (only if the player is
    at Haven, only if hurt at that tick); (2) agencyTick — wrapped
    AFTER base npcNodeTravel — calls expeditionReturn, whose line
    "is back from past the <dir> (+kcal, N stories, a new scar)"
    never mentions hurt, whatever the expedition endured. Both lines
    are gated on the player being at Haven; when the player is away,
    a hurt return is narrated nowhere.
  - Pre-fix example (hurthome-a corpus): Aki, seed 97507,
    expedDuration 2 vs awayDuration 14, 3 hurt dawns, clock return
    celebrated as haul/stories/scar with no mention of hurt.
    Hurthome-a also measured the disconnect firing in 5/15
    expedition episodes (dawn census).
- Related warnings, honored here: #1697 — a dawn census is BLIND to
  intra-day hurt returns (39 hurt-return lines vs 6 armed dawn
  episodes), so this instrument is built from hurt EVENTS, not dawn
  samples (the hurthome-fix-c event instrument, adapted, not
  re-invented). #1698 — single hurt returns cascade through the RNG
  future, so comparisons use MATCHED-SEED MEDIANS, never individual
  seeds.

## CANON

Read first: docs/CANON.md, docs/PRESERVATION.md (food ladder; the
expedition haul feeds the pantry — this arm changes no haul, no
pantry logic), docs/PARTY.md (villager treatment; hurt/return
treatment — no canon doc covers away-return timing or hurt-return
narration, so the mechanism above is code-read, not canon).

## SCOPE DECISION (made here, held for the run)

Preferred outcome is SPEC-READY + event-based instrument. The arm
(a) measures EXPHURT disconnect prevalence on a fresh band on
current master with the event instrument below, and (b) specs the
write-back carrier precisely: which event writes, which line fires,
what it must NOT overwrite (the landed hurthome return line stays
intact, pantry/trust/deeds untouched).
The write-back is IMPLEMENTED only if it is a single small narration
hook: text-only inside expeditionReturn's playerAtHaven line block,
no change to the hurthome rule, no change to survival, pantry,
trust, deeds, or RNG-draw count (pick(dirs) still drawn exactly
once, unconditionally, as today). If the hook would touch the
hurthome rule, survival, or pantry logic, or would need to reorder
npcNodeTravel/agencyTick, STOP at SPEC-READY and say so — a clean
spec beats a risky landing.
No gate, price, deed bar, or win price changes. No duplication of
the (v**) deploy-fraction work held by sim-fracchoice-b.

## INSTRUMENT (event-based, adapted from hurthome-fix-c)

- scripts/hurthome-b-lib.js (UNCHANGED, imported) for event cases:
  a case opens when a ledger-away villager is observed alive-and-hurt
  (hp 1..7) via the hurtVillager post-wrapper or the per-part scan
  net; closes at travel ticks (returned-hurt / returned-healed /
  returned-unknown), at death, at heal-away, or censored at run end.
  Walk-outs (purpose 'leave') are reported separately, never pooled
  with trips, per the hurthome-a lesson.
- NEW scripts/exphurt-a-lib.js (pure, proof-tested): disconnect
  classification + return-line classification. No RNG reads, no
  game-value writes.
- NEW scripts/sweep-exphurt-a.js (single cell, current master):
  adapts sweep-hurthome-fix-c.js (harness/policy/runDays pattern,
  writeRobust, env gates, retro-open on the hurthome line) and adds:
  - At case open AND on each counted hurt: snapshot
    expedDuration (Game.agencyState().exped[vid].duration, if any),
    expedLegs, expedEncountersHurt (encounters includes 'hurt'),
    awayDuration (from the away record, as the lib already stores).
    Nulls recorded, never invented; a snapshot failure is an
    instrument error, counted, never silently dropped.
  - At case close: playerAtHaven at that tick (map vs haven node),
    and the closing-part return lines: transcript lines captured
    in the closing day+part that name the villager (first name)
    and match a return pattern. Each such line is classified:
    expeditionReturn line (/is back from (far )?past the/),
    hurthome line (/returns from the wilds hurt/), other return
    line, mentions-hurt (/hurt/i).
  - Transcript capture is the fix-c capture (away-voice hurt lines,
    return lines, lines naming a villager with an open case),
    truncated to 300 chars as there.
- NEW scripts/analyze-exphurt-a.js: pooled tables + quoted return
  lines for sense-testing.
- NEW scripts/test-exphurt-a.js: proof for the lib (disconnect
  boundary diff >= 2 vs < 2, missing-duration handling, line
  classification incl. the exact current expeditionReturn template
  and the exact landed hurthome line template, first-name matching
  rule). Must be green BEFORE the pilot.

## DESIGN (pinned)

- Policy: competent (scripts/policies/competent.js), unchanged.
- Horizon: 100d death-aware cap (comparability with the hurthome
  lineage; dead villages stop simulating).
- Env: PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults, explicit).
- Seeds: PILOT 99901–99908. Band check, stated plainly: 99601–99608
  (approachbranch), 99701–99708 (holdbeat), 99801–99808
  (approachfall) all have exact-seed files under evidence/; the
  regex s9990[1-8] followed by a non-digit returns ZERO files in
  the whole evidence/ tree, so 99901–99908 is fresh for this
  instrument. Corpus dir evidence/2026-11-04/perseed-exphurt-a/.
- One pre-declared expansion, and no other: if returned-hurt
  expedition cases number < 5 across the pilot, run CONFIRM
  99909–99916 (same spec) and judge on the pooled pilot+confirm.
  No horizon extension, no hp-gate widening, no seed re-picking.

## PRE-REGISTERED METRICS (judged exactly against this header, §14)

Unit: one event case (hurthome-b-lib). Disconnect denominator:
expedition-purpose cases with BOTH durations present at open.

- D (disconnect prevalence) = share of denominator cases with
  |expedDuration − awayDuration| >= 2 parts. Also reported:
  share with expedDuration < awayDuration, and the median signed
  gap (awayDuration − expedDuration).
- M1 (PRIMARY, the blank) = among returned-hurt expedition cases
  WITH an expeditionReturn line in the closing part, the share
  whose expeditionReturn line mentions hurt. Baseline expectation
  near 0: the current template contains no hurt word.
- M2 = among ALL returned-hurt expedition cases, the share with
  ANY closing-part return line mentioning hurt (the hurthome line
  counts). This measures current coverage, including the landed
  line.
- M3 (announced coverage) = among returned-hurt expedition cases,
  the share with >= 1 closing-part return line at all (player-away
  silence shows up here as the complement).
- SENSE: at least 5 returned-hurt expedition return lines quoted
  and judged for meaning (does the homecoming read as hurt?),
  or all of them if fewer than 5 exist.
- Instrument health: errors 0, unclassified cases 0, every case
  in exactly one outcome bucket.

## PRE-REGISTERED JUDGMENT

- PILOT GATE: 8 pilot seeds complete, errors 0, unclassified 0,
  expedition hurt cases opened >= 8 (any outcome), else STOP with
  INSUFFICIENT-DATA.
- GO for SPEC-READY: pilot gate passed + D measured on >= 8
  denominator cases + M1/M2 measured on >= 5 returned-hurt
  expedition cases (pooled with the pre-declared confirm if
  triggered) + spec in the evidence file naming the exact write
  site (file + function + line region) and the exact line that
  fires, and what it must NOT overwrite.
- GO for LAND (only if the hook meets the scope decision): hook
  proof test green + pilot re-run on the SAME seeds shows M1
  rising to >= 0.8 among announced expedition returns, with the
  guardrail MEDIAN daysAlive delta (matched seeds, post-hook
  pilot minus pre-hook pilot) >= −5d, instrument errors still 0,
  and the hook diff touching ONLY expeditionReturn's line block.
  A miss on any leg is NO-GO for LAND; the arm still reports
  SPEC-READY if the SPEC-READY legs passed. A miss is never
  re-scored against a friendlier metric mid-run.
- If the metric proves wrong, it is written under "metric review"
  for the NEXT run, not revised here.
- Wall numbers (national / table / wins, wave reach) are reported
  descriptively from this diag corpus only if the corpus reads
  them; otherwise the evidence states plainly that this corpus
  is a diag corpus and does not read them. No §15 balanced panel:
  single-cell diag on current master, no armed cell, no delta to
  compare — declared inapplicable here, as hurthome-a declared it.

## WHAT LANDS, WHAT DOES NOT

- LANDS (coordinator merges; worker does not push, bump, or verify
  live): this prereg; instrument + proof test; pilot corpus;
  evidence file; and, ONLY on a LAND verdict, the hook + its proof
  test + the re-run corpus.
- DOES NOT LAND: no hurthome-rule change, no gate/price/deed
  change, no sibling files, no other lane's files.
