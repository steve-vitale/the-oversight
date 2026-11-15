# sim-courtship-b — PREREG (opinion-building lever for the covenant road)

Run: fleshout-loop-b-20261115T1330Z (Loop B), arm sim-courtship-b
Axis: winnability chain. Courtship-deeds build arm — the lever the
last two runs proved is missing.
Branch: sim-courtship-b — worktree ~/workspace/worktrees/sim-courtship-b
Base: master at worktree creation (tip a9d85e32c)
Date: 2026-11-15
Findings backlog: claims "2026-11-15 — scale-onramp / diplomacy — THE
COVENANT ROAD IS GATED BY OPINION, NOT BY THE PROPOSE VERB"
(sim-findings.md, marked [claimed] by this arm; [fixed] only if this
arm lands a working lever).

## Canon note (read first)

docs/CANON.md was read, then docs/SCALE.md and the opinion machinery
itself (src/js/hierarchy.js `_nudgeOpinion`, `_proposePeer`,
`_courtshipNextStep`, `studyVillageCodex` wrap, `answerAccord`;
src/js/villageAgency.js `aidVillage`; src/js/membership.js
`proposeAlliance` / `guestMeal`; src/js/game.js
`studyVillageCodex`) — as already grounded in
evidence/2026-11-15/sim-onlylead-b-prereg.md and
sim-onlylead2-b-prereg.md, which this prereg inherits. Nothing below
is invented. The covenant shape, in one line: Haven holds ≥3 SEASONED
covenant peer links (kind 'covenant', no primary/subordinate; seasoned
= 30+ days old AND trust 40+), the rung (regional a full season:
networkLiveDay + 30) has passed, and no higher-priority shape's beat
is pending/live — then "The Founding Council" stages (pact/pool/walk).
Peer proposals need opinion 10+ first (the engine refuses below the
bar before judging, honestly, with no -5).

## The prior runs (what this arm inherits)

- sim-onlylead-b DIAG (band 100401–100408, 150d): only lead stages
  (5/8 armed, all sat); covenant 8/8 never attempted. Stage 2 built
  the covenant-road policy (competent-covenant-b.js, test-covenant-b
  33/33) but KILLED it at smoke as SUBSTRATE-MISSING: opinion 10
  only at ~day 150 from a cold start (~2 points per 30 days), so the
  first covenant beat is structurally past day 175.
- sim-onlylead2-b PILOT (band 100421–100428, 200d): PILOT NO-GO —
  covenant beats staged 1/8 (bar ≥3/8); cost bar fails (starvation 8
  vs 3). The road DID open once — seed 100422, three links d95–97,
  Founding Council d128, 'pact', sat, national held 31 days — the
  first covenant national ever in live play. Three failure families:
  opinion-never-10 on 5/8 (454 prerequisite refusals, 0 declines —
  the villages are never asked, they just never know Haven well
  enough), rung+death on 1/8 (100426), tend/pantry on 1/8 (100427).
  Verdict: "The next step for the road is an opinion-building lever,
  not another propose variant."
- Metric reviews carried forward into this arm (onlylead2 §14):
  (#2) a substrate probe under the BASE policy does not predict the
  judged leg — the next probe must read opinion ON the judged leg;
  (#3) the cost bar failed on starvation the lever did not spend —
  separate lever spend from trajectory starvation; (#4) the rung is
  a silent second gate — name it alongside road-state blockers when
  it sits past the village's death; (#7) LINK_LINE_RE blind spot —
  add covenant/charter/handshake/codex terms (one-line instrument
  change, NOT mid-run).

## THE LEVER — courtship deeds (policy-side, frozen here)

The engine's own courtship verbs, priced in its own numbers
(hierarchy.js courtship_moves_opinion; villageAgency.js aidVillage;
game.js studyVillageCodex). The policy composes onto
competent-covenant-b.js — the covenant road (propose/tend/answer)
is inherited unchanged, and this arm adds ONLY the deeds that open
the opinion gate. Two deeds, each ONCE per village — a relationship
built by a visit and a gift, not a farmed number:

1. **PILGRIMAGE (visit + study).** Once per known, unlinked,
   unstudied village with opinion < 10, while fewer than 3 covenant
   links stand: walk to their fire, `studyVillageCodex(vid)` (+3
   opinion, once per village — the engine's own once-flag
   `_codexOpinionGiven`), walk home. Pattern reused verbatim from
   the scalecourt pilgrimage (scripts/policies/scalecourt.js):
   hop-by-hop `walkTo` via `travelTargets`, `ctx._pilgrim` state,
   14-day staleness, HP > 0.7 gate to start, `_returning` walk home
   to (4,4). The pilgrimage TAKES OVER the day while in progress —
   competent.daily and covenantClimb are skipped that day, exactly
   as in scalecourt: a visit costs days of your life, honestly.
   Nearest below-bar unstudied candidate first (Manhattan distance
   from Haven, village id asc on ties).
2. **FIRST GIFT (aid).** Once per known, unlinked village with
   opinion < 10, while fewer than 3 covenant links stand:
   `aidVillage(vid, 2000)` (+10 opinion, trust +5 if linked — the
   village is unlinked, so trust does not move; famine ends if
   their pantry passes 6,000 kcal). 2,000 kcal is the game's own
   first-gesture gift size (answerAccord 'gift'). Pantry gate:
   Haven pantry > 12,000 kcal at the moment of giving — the propose
   gate itself, the engine's own affordability line for courtship
   (the covenant policy only proposes above 12,000). The gift
   (2,000) leaves the pantry above 10,000; the cost bar judges any
   starvation the spend causes. (AMENDED pre-build, before any sim:
   as first written the gate was 20,000, the tend gate — which fired
   on only 2/8 onlylead2 seeds. A lever that fires on ~2/8 seeds
   cannot move a ≥3/8 staging bar. The 12,000 gate is the courtship
   affordability line, not a loosening of the tend gate, which stays
   at 20,000. No judged numbers have been seen; no sim has run.)
   Maximum lever spend: 3 villages × 2,000 kcal = 6,000 kcal per
   run, all of it real food out of Haven's pantry.

WHY THESE TWO, AND NOT MORE: the refusal line itself names them
("walk to their fire and study their codex, win where the region
hears it, give it weeks"). Contest wins (+2 each, `_foreignEyes`)
already flow through the competent base and are NOT a new deed —
the policy cannot manufacture more wins, and this arm does not
try. `proposeAlliance` (+5) is NOT a deed for this lever: it
requires opinion ≥10 already, so it cannot open the gate it
presupposes. `guestMeal` (+2/day) requires an alliance first —
post-gate, out of scope. Succession backing (+8) and beg-giving
(+10) are opportunistic arrivals, not deeds the policy can summon;
the competent base does not answer them, and this arm does not
either — both legs leave them exactly as the base leaves them, so
they cannot confound the contrast. `joinVillageReal` (+5) is
defection, not courtship — never called. Positive opinion does NOT
decay (linkTick fades only NEGATIVE opinion toward 0, +1/week),
so a built +10/+13 holds until a cold-ask −5 spends it — and the
covenant policy's det ≥ 45 propose floor guarantees a post-draw
score ≥ 35 (the counter floor, never a cold decline), so a
decline after aid is arithmetically out of reach on a
courtship-built village.

EXPECTED ARITHMETIC (frozen prediction, not a bar): a village at
opinion 0 gets +3 (codex) + 10 (aid) = 13, plus contest wins +2
each as they come. The first propose can fire the day after the
aid lands (the aid step runs after covenantClimb in daily(), so
the propose sees opinion 10 the next morning). Three links
proposed one a day season together ~30 days later; with the rung
(networkLiveDay + 30) the first Founding Council is plausible
~day 60–110 on villages that live that long, against ~day 128
on the one onlylead2 staging.

WHAT THIS ARM DOES NOT DO (one lever per arm): it does NOT bundle
the tend-gate lever (onlylead2 finding #3: tend on a lower pantry
gate) — tend stays at the inherited 20,000-kcal gate. It does NOT
bundle engine-courtship surfacing (finding #2: surface
engine-formed links to the policy) — the policy still picks its
best candidate by det score and skips linked villages, as before.
Those are the next arms' questions.

## Seed-band freshness (verified BEFORE any judged sim)

Per ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md —
grep of EVERY dated prereg under evidence/ (evidence/*/sim-*-prereg.md),
plus evidence filenames, scripts/, and the convergence tracker for
the exact ranges:

- PILOT BAND 100601–100608: exact-seed grep (100601…100608) over
  all preregs + scripts/ = 0 hits; prefix grep (10060/10061/10062/
  10063) over all preregs = 0 hits; evidence filenames = 0 hits;
  convergence tracker mentions of 100601/100621 = 0. FRESH. (The
  only "1006[0-9][0-9]" hits anywhere are git-mode strings
  "100644 <oid>" in transplant preregs — file modes, not seed
  bands.) The coordinator's brief proposed this band; this prereg
  spends it as the pilot band.
- CONFIRM BAND 100621–100636 (16 seeds): same searches = 0 hits
  (covered by the 10062/10063 prefix greps above; exact-seed grep
  100621…100636 = 0 hits). FRESH. This prereg names them as the
  confirm seeds, spent ONLY on a pilot GO.
- NEVER USED HERE: onlylead2's reserved confirm bands 100429–
  100436 + 100441–100448 — they stay fresh and unused (this arm's
  bands are different by design, so the onlylead2 reservation is
  untouched).

## Primary metric + GO bars (binding, §14)

- G1 INSTRUMENT VALIDITY — GO iff the driver captures a full
  per-day link roll + shape-candidate roll + DAILY MAX-KNOWN-
  OPINION read on all 16 configs (8 seeds × covenant-baseline /
  courtship-armed), 0 instrument errors, EVERY staged beat
  classified by shape with sat/unsat, and UNCLASSIFIED ≤ 1 per 8
  seeds on the armed leg. Any instrument error, unclassified shape
  beyond the bar, or staged beat without a shape = NO-GO.
- G2 THE LEVER — GO iff on the courtship leg, COVENANT BEATS
  STAGED on ≥3/8 pilot seeds (same form as onlylead2; baseline
  expectation ~1/8 — onlylead2's number on its band) AND every
  staged covenant beat is answered 'pact' and sat (sat = the
  engine returns true and sets nationalLive). A miss on either
  half = NO-GO, never re-scored mid-run. Lead beats staged on the
  courtship leg are reported (expectation: 0 — the leg proposes
  no lead links); a lead staging would mean the isolation failed
  and the pilot is re-examined, not re-scored.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch
  diff and the proof tests are green (test-covenant-b.js 33/33,
  re-verified on this tip; test-onlylead-b.js 29/29 still green
  after the analyzer extension; test-onlylead2-b.js 25/25 still
  green; test-courtship-b.js, new — the lever + instrument,
  GREEN before any landing). Any src/js change = NO-GO.

Cost bar (onlylead2 form, KEPT as the binding bar, with the
metric-review #3 split reported alongside): starvation deaths
pooled courtship ≤ baseline + 2 AND median survival courtship ≥
0.8× baseline median. Guardrail (§14c): villager (non-scholar)
combat deaths are a co-primary read on every seed — the evidence
names any seed where courtship deaths exceed the before leg by
>50%. SPLIT (analysis, not a second bar): the evidence ALSO
reports starvation per seed split by lever spend — seeds where
the armed leg paid aid kcal vs seeds where it paid none — and
the total aid kcal paid, so the bar's verdict can be read
against the lever's own spend instead of the weather. If the
cost bar fails on seeds with zero aid spend, the evidence says
so plainly (trajectory divergence, as in onlylead2) and the
verdict still stands as written.

## Method (staged, §§9–12, 14–15)

- STAGE 0 SUBSTRATE SMOKE (before the pilot, in-memory only):
  the proof test (§2 game smoke) runs the ARMED policy on pilot
  seed 100601, 200d, via the driver as a module — NO corpus is
  written, so the pilot band is not spent. It must show the deeds
  firing (aidVillage ≥ 1 call, studyVillageCodex ≥ 1 call,
  max-known-opinion ≥ 10 reached in-window on the judged leg).
  If the smoke shows zero courtship contact, the pilot is NOT
  spent (SUBSTRATE-MISSING re-check, onlylead precedent). No
  separate competent-only opinion probe is run: onlylead2 already
  proved the BASELINE substrate missing (opinion 10 never on 5/8
  pilot seeds), and the lever MANUFACTURES the substrate — the
  daily opinion read on the judged leg (instrument change #3
  below) IS the substrate measurement, per onlylead2 metric
  review #2. The smoke uses pilot seed 100601 exactly as
  onlylead2's proof test used pilot seed 100421 (in-memory only,
  no corpus written, pilot band unspent).
- STAGE 1 PILOT (8 seeds × 2 policies = 16 configs, 200d
  death-aware, identical seeds, BOTH legs run fresh): the judged
  run. Horizon 200d because the covenant road needs it (onlylead2:
  first beat day 128 even on the staging seed). Seeds (exact
  literals): 100601, 100602, 100603, 100604, 100605, 100606,
  100607, 100608. Policies: competent-covenant-b (baseline — the
  road walked, no opinion lever) vs competent-courtship-b (armed —
  the same road + courtship deeds), identical seeds. The
  courtship leg is the judged leg; the covenant leg is the
  control. The contrast isolates the lever: same road, plus
  opinion-building.
- CONFIRM (16 seeds × 2 policies) ONLY on a pilot GO, on the
  fresh band 100621–100636 (verified above). A borderline pilot
  is reported as-is; the coordinator decides. Do NOT spend a
  confirm to rescue a NO-GO.
- DRIVER: scripts/onlylead-driver-20261115.js (extended — see
  instrument changes below; same recorder, same shape-candidate
  roll). Per-seed JSON to
  evidence/2026-11-15/perseed-courtship-b-control/ (baseline) and
  evidence/2026-11-15/perseed-courtship-b-on/ (courtship).
  Zero src/js.
- ANALYZER: scripts/analyze-onlylead-b.js (extended — see below).
  Writes evidence/2026-11-15/courtship-b-analysis.json.
- BALANCED PANEL (§15): a pseudo-panel compare is built for the
  record (answercourt precedent — the real balance-panel.js
  compare cannot judge a policy contrast); the preregged G2 bar
  is the judge. Built for the record whether the pilot is GO or
  NO-GO (onlylead2 precedent).
- ENV: defaults, matching the onlylead2 legs — COUNTER_ANSWER
  unset, COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE unset. No
  other env.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures —
  the driver observes the policies' own play; nothing is staged.

## Instrument changes (frozen BEFORE the pilot — all in this prereg)

Four small extensions to the proven instruments, all frozen here,
none tuned after the pilot runs:

1. DRIVER POLICY — 'competent-courtship-b' joins the policy
   switch (with its stats module + capSummary branch), and
   `dirFor` generalizes: control = competent-covenant-b,
   on = competent-courtship-b (the old scaleclimb→control mapping
   is kept for RUN=onlylead-b / onlylead2-b — this arm runs with
   RUN=courtship-b, so the two legs write separate corpora dirs
   perseed-courtship-b-control / -on instead of colliding).
2. DRIVER VERB WRAPPERS — `aidVillage` and `studyVillageCodex`
   join the wrapped verbs (same wrapVerb shape: call + caller tag
   + short result), so the verb table captures the courtship
   deeds by caller (policy vs engine) alongside the propose/tend
   verbs. `answerBeg` / `answerSuccession` are NOT wrapped: the
   lever never calls them.
3. DRIVER OPINION READ (onlylead2 metric review #2) — the daily
   snapshot gains the max-known-opinion read ON the judged leg:
   `maxOpinion` (max opinion among KNOWN villages, same
   `Game.knowsVillage(v)` gate the policy uses) and
   `opinionByVillage` (vid → opinion for known villages only).
   Pure reads only; the analyzer derives firstOpinion10Day and
   maxKnownOpinion per record from the series. This replaces the
   separate substrate probe: the pilot itself measures when the
   gate opens, on the leg being judged.
4. DRIVER LINK_LINE_RE FIX (onlylead2 metric review #7) —
   LINK_LINE_RE gains `covenant|charter|handshake|codex|runner`
   terms so the played courtship lines (the 454 refusals' copy, the
   codex keeper line, the aid runner line) reach the corpus.
   One-line instrument change; the pilot's judged numbers do not
   depend on linkLines. ('runner' added pre-pilot on the smoke's
   finding — the aid line carries no covenant/codex term — before
   any judged run; no judged numbers have been seen.)
5. ANALYZER RUNG NAMING (onlylead2 metric review #4) — in
   `classifyShape`'s NEVER-QUALIFIED branch, when the shape's
   road state is ONE LINK SHORT of qualifying AND the rung day
   sits past the village's end day (last series day — death, or
   the horizon if survived), append `<shape>-rung-past-death:
   <rungDay>` to `blockers` (the primary `blocker` is UNCHANGED
   for backward compatibility; the rollup's `blockedByAll` counts
   it). One-link-short means: lead maxPrimSeas == 2; covenant
   maxCovFormed == 2, or 3 formed with maxCovSeas == 2; trade
   the same with trade counts. Rung day is read from the last
   snapshot's `rungDay` (networkLiveDay + 30).
6. ANALYZER OPINION + DEEDS ROLLUPS — `analyze` gains
   `opinionFirst10` (per record: first day series maxOpinion ≥
   10, else null) and `opinionMax` (max maxOpinion over the
   series), and `courtshipDeeds` (aidVillage / studyVillageCodex
   call counts by caller, like the existing peer/raid
   `verbCallers` rollup). The per-seed evidence table reports
   first-opinion-10 day per leg alongside the shape table.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the staged beat + answer lines the driver captures and judge
whether the Founding Council reads like a played ceremony — AND
read the courtship lines the LINK_LINE_RE fix now captures: do the
aid gift, the codex study, and the prerequisite refusal read like
a relationship being built, or like silent numbers? Do the deeds
arrive as played lines with named villages and remembered gifts,
or as ledger entries? Judge meaning and coherence, never just
counts. In particular: does the aid line name the village and the
kcal, does the codex line say what was learned, and does the
refusal copy change once the deeds land (or keep saying "barely
know Haven's name" to a village just fed)?

## Evidence

- Prereg: this file.
- Instrument substrate (on master, unchanged):
  scripts/policies/competent-scaleclimb-b.js and
  scripts/policies/competent-covenant-b.js (the covenant road).
- Lever: scripts/policies/competent-courtship-b.js (new).
- Driver: scripts/onlylead-driver-20261115.js (extended: courtship
  policy + dirFor + aid/codex wrappers + LINK_LINE_RE fix +
  daily opinion read).
- Analyzer: scripts/analyze-onlylead-b.js (extended: rung naming
  + opinion/deeds rollups).
- Proof: scripts/test-courtship-b.js (new; static lever checks +
  200d game smoke + determinism); scripts/test-covenant-b.js
  (33/33, re-verified on this tip); scripts/test-onlylead-b.js
  (29/29); scripts/test-onlylead2-b.js (25/25).
- Panel builder: scripts/build-courtship-panels-20261115.js (new).
- Per-seed JSON: evidence/2026-11-15/perseed-courtship-b-control/
  (8 files) and evidence/2026-11-15/perseed-courtship-b-on/
  (8 files).
- Analysis: evidence/2026-11-15/courtship-b-analysis.json.
- Panel (GO and NO-GO, for the record):
  evidence/2026-11-15/courtship-b-panel.*
- Evidence: evidence/2026-11-15/sim-courtship-b.md (per-seed
  per-shape tables with ALL failing gates + rung naming,
  opinion trajectories per leg, verb + deeds table, wall
  numbers, sense-testing, metric review).

## Convergence state

Courtship-deeds build arm on a 200d horizon. The verdict is GO /
NO-GO against G1/G2/G3 above (pilot), plus confirm on GO. If GO,
the courtship policy lands as its own commit(s) — policy +
evidence + tests; NO default flip, NO src/js change. If NO-GO,
evidence-only record; no game change. Killed arms leave no trace.
The findings-backlog item ("THE COVENANT ROAD IS GATED BY
OPINION") is marked [fixed] only if this arm lands a working
lever — a pilot GO that confirms.
