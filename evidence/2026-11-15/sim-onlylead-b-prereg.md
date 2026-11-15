# sim-onlylead-b — PREREG (DIAG: why only the lead shape stages)

Run: fleshout-loop-b-20261115T1055Z (Loop B), arm sim-onlylead-b
Axis: winnability chain. DIAG arm — findings backlog #2358
("ONLY THE LEAD SHAPE STAGED, SECOND BAND").
Branch: sim-onlylead-b — worktree ~/workspace/worktrees/sim-onlylead-b
Base: master at worktree creation (9fa74d252)
Date: 2026-11-15

## Canon note (read first)

docs/CANON.md was read, then docs/SCALE.md (the scale-ladder canon —
the only canon doc covering hierarchy/diplomacy), then the staging
code itself, src/js/hierarchy.js `_havenPolity` (~line 2336),
`polityOf` (~2299), `_belongPolity` / `_covenantPolity` /
`_tradePolity` (~2345–2382), `_checkNational` (~2520) and
`stageNationalBeat` (~2641). Nothing below is invented.

- National is a polity, staged as a PLAYED beat (`state.pendingNational
  = {led, shape, primary, villages[], day}`), answered by
  `Game.answerNationalChoice(how)`. Every beat also offers REFUSE
  (permanent, `state.scaleRefused`) — never chosen here.
- Five shapes, one rung per season (national cannot stage until
  Haven has been regional a full season: networkLiveDay + 30):
  - LEAD — Haven is primary of ≥3 SEASONED subordinates
    (seasoned = link 30+ days old AND trust 40+). "The First
    Court" (feast/host/cold).
  - CONQUEST — every seasoned Haven-primary subordinate was taken
    by force (`raidVillage`); a mixed realm stages LEAD, not
    conquest. "The Iron Court" (yoke/mercy/release).
  - BELONG — Haven is a subordinate IN GOOD STANDING (link trust
    ≥50, arrears 0, link age ≥14 days) to a primary whose foreign
    realm holds ≥4 villages (primary + Haven + their subs).
    "The Binding" (swear/serve/walk).
  - COVENANT — Haven holds ≥3 SEASONED covenant peer links
    (kind 'covenant', no primary/subordinate). "The Founding
    Council" (pact/pool/walk).
  - TRADE — Haven holds ≥3 SEASONED trade peer links.
    "The Charter" (sign/bargain/walk).
- Shape priority when several qualify at once (documented design
  call, docs/SCALE.md + `_havenPolity`): lead → belong → covenant
  → trade. Only the FIRST qualifying shape's beat stages; walking
  away from a league table defers only that shape 14 days
  (`state._natDefer`), the next qualifying shape's beat stages
  instead. Once a beat is answered, `nationalLive = true` and no
  further national beat can stage while the realm lives.
- The scaleclimb courtship core (the instrument's baseline policy)
  proposes LEAD links only, answers counters (which flip to BELONG
  links), tends LEAD links below the seasoned bar. It NEVER calls
  `proposeCovenant` / `proposeTrade` / `raidVillage` (stated in the
  policy header). The answercourt armed policy adds ONLY the
  national-beat answer (lead feast / conquest mercy / belong swear
  / covenant pact / trade sign).

## The finding (measured, not guessed)

- sim-answercourt-b (band 100101–100108, 150d): 6 staged national
  beats, ALL lead/feast, all sat. Conquest/belong/covenant/trade
  never staged — proven only by fake-Game unit tests.
- sim-answercourt-confirm-b (band 100201–100216, 150d): 15 staged
  national beats, ALL lead/feast, all sat.
- Pilot + confirm: 21/21 lead. The four per-shape answers remain
  proven by fake-Game unit tests only, never in live play.
- The answercourt lever itself is NOT landed (confirm NO-GO on its
  cost bar: starvation 6 vs 3, bar ≤5). This arm uses its POLICY
  files as instrument/policy substrate ONLY and does NOT land
  answercourt and does NOT re-judge answercourt.

## The question

WHY does only the lead shape stage? Three candidate families,
distinguished by the instrument, not by guessing:

- (A) POLICY-side: the policy never walks the other roads — it
  never proposes covenant/trade links, never raids, and its
  counters are the only BELONG source; the game would stage the
  other shapes if the policy walked them.
- (B) GAME-side: the other shapes' conditions never hold in live
  play — e.g. no foreign polity ever reaches 4 villages (belong),
  no peer link ever seasons (covenant/trade), no conquered sub
  ever seasons (conquest).
- (C) SHADOWING: another shape qualifies but a higher-priority
  shape's beat is pending/live first (lead's priority swallows
  belong/covenant/trade; a live national swallows every later
  shape), or the rung gate (networkLiveDay + 30) passes only
  after the qualifying shape has dissolved.

## The instrument (frozen — do not tune mid-run)

New driver `scripts/onlylead-driver-20261115.js`, adapted from the
answercourt driver (same recorder: daily link roll, verb wrappers,
say capture filtered to link/polity lines, cap 600). NEW for this
arm, in the DAILY snapshot (pure reads only):

- Shape candidates, each read directly from the engine's own
  staging predicates: `Game.polityOf('haven')` (lead/conquest),
  `Game._belongPolity()`, `Game._covenantPolity()`,
  `Game._tradePolity()` — shape + size + primary/led, or null.
- `Game.foreignPolities()` (primary + subs, copied) — the BELONG
  road's precondition, read live.
- Road state counts: seasoned Haven-primary subs, conquered subs
  (seasoned and total), covenant peer links (formed / seasoned),
  trade peer links (formed / seasoned), best BELONG candidate
  (Haven-subordinate link with max trust: trust, arrears, age,
  its primary's foreign-polity size).
- Rung state: networkLiveDay, rung day (netDay + 30), rung met.
- PendingNational (shape/primary/day), pendingGlobal, nationalLive
  — as in the answercourt driver.
- Verb wrappers as in the answercourt driver (proposeLink,
  proposeCovenant, proposeTrade, raidVillage, answerCounter,
  answerNationalChoice WITH its staged shape, _formLink,
  _formPeerLink, tendLink, answerAccord, hostFeast, breakLink) —
  caller tagged policy vs engine, so a peer link formed by the
  ENGINE (not the policy) is visible as such.

New analyzer `scripts/analyze-onlylead-b.js`: per seed, per shape
(lead / conquest / belong / covenant / trade):

- STAGED: the shape staged a beat (pendingNational series) and the
  answer given + sat/unsat (answerNationalChoice verb event).
- QUALIFIED: days the shape's candidate was non-null in the daily
  series, first qualification day.
- BLOCKER: if never staged, exactly ONE named blocking condition
  from the frozen taxonomy below (the analyzer must pick by the
  decision tree, never by hand).

FROZEN BLOCKER TAXONOMY (code-grounded; the analyzer assigns the
first matching branch, in order):

- lead:
  - `lead-subs-short:N` — max seasoned Haven-primary subs N < 3
    over the run (the polity bar never stood).
  - `lead-rung-gate` — lead qualified only on days before the rung
    day (netDay + 30) and never after.
  - `lead-shadowed:<shape>` — lead qualified while a <shape> beat
    was pending (higher-priority beats cannot shadow lead, so this
    branch fires only for a pending non-lead beat — recorded for
    completeness; expected ~never).
  - `lead-scale-refused` / `lead-exile` — scaleRefused set, or the
    answerer exiled while lead qualified.
- conquest:
  - `conquest-no-raids` — 0 conquered subs ever (the policy never
    raids; conquest needs ALL seasoned subs conquered).
  - `conquest-mixed:N-of-M` — N conquered of M seasoned subs
    (a mixed realm stages lead, not conquest).
  - `conquest-rung-gate` / `conquest-shadowed:<shape>` — as lead.
- belong:
  - `belong-no-sub-link` — Haven was never a subordinate on any
    active link (no incoming courtship / counter ever formed one).
  - `belong-trust-short:N` — best subordinate link trust N < 50
    (arrears 0, age ≥14, foreign size ≥4 all met).
  - `belong-arrears:N` — best link has arrears N > 0 (trust/age/
    foreign size met).
  - `belong-age-short:Nd` — best link age N < 14 days.
  - `belong-foreign-small:N` — best link in good standing but its
    primary's foreign polity size N < 4.
  - `belong-shadowed:<shape>` — belong qualified while a <shape>
    (lead) beat was pending/live.
  - `belong-rung-gate` — as lead.
- covenant:
  - `covenant-no-peer-links` — 0 covenant peer links ever formed
    (the policy never proposes covenant; the engine formed none
    either — caller split in the verb table settles which).
  - `covenant-seasoned-short:N-of-M` — M covenant links formed,
    max N seasoned < 3.
  - `covenant-shadowed:<shape>` / `covenant-rung-gate` — as above.
- trade: same three branches as covenant, `trade-*`.
- Any shape with neither a staged instance nor a taxonomy branch
  is UNCLASSIFIED (instrument failure — see G1).

STAGE 2 RULE (binding): BUILD only if the DIAG names a POLICY-side
lever — e.g. the policy proposes only lead, or a policy gate
blocks non-lead shapes the game would otherwise stage. The build
is the minimal policy lever, piloted on the same band with its own
frozen GO bar in an amended prereg; if pilot GO, confirm on
100421–100436 (16 fresh seeds, verified clean below). If the DIAG
shows the block is GAME-side (a shape's conditions never met in
live play), report DIAG-NO-CANDIDATE with the named blocker per
shape and do NOT invent a game change; file the finding in
`hidden_files/sim-findings.md` in the file's format.

## Seed-band freshness (verified BEFORE any judged sim)

- PILOT BAND 100401–100408: FRESH. Check run 2026-11-15: 0 hits
  per seed in `evidence/*/sim-*-prereg.md` (all dates, all prereg
  files — filesystem grep), 0 hits in `evidence/2026-11-15/`
  filenames, 0 hits in `scripts/` (all .js). The "100412" hits
  returned by a naive grep are the commit hash 7100412b8 in three
  2026-11-07/10 preregs — a false positive, not a seed mention
  (no seed 100412 band is named anywhere; the hash is a git
  object id, and 100412 itself is outside both bands).
- CONFIRM BAND 100421–100436 (Stage 2 only): FRESH by the same
  check (0 hits in preregs, filenames, scripts). Seed 100412 is
  USED by older preregs — it is outside both bands, but if any
  band is ever extended, avoid it.
- Coordinator verification (task brief): band verified fresh across
  ALL preregs — this check corroborates it from the worktree.

## Primary metric + GO bars (binding, §14)

- G1 INSTRUMENT VALIDITY (the DIAG's judge) — GO iff:
  - the driver captures a full per-day link roll + shape-candidate
    roll on all 16 configs (8 seeds × scaleclimb-baseline /
    answercourt-armed), 0 instrument errors;
  - EVERY staged national beat on the band is classified by shape
    with sat/unsat (from the answerNationalChoice verb event, not
    inferred from the series);
  - for EVERY unstaged shape on EVERY seed, the analyzer names a
    blocker from the frozen taxonomy above (or records a staged
    instance) — UNCLASSIFIED ≤ 1 per 8 seeds (i.e. ≤1 across the
    40 shape-seed cells of one leg; the bar is per leg, judged on
    the armed leg, baseline reported alongside);
  - the shape-candidate roll is proven against the engine: the
    proof test stages each shape's qualifying state in a fake
    Game (synthetic series) and checks the analyzer's
    classification + blocker attribution per branch (RED→GREEN),
    plus a live 60d smoke leg on seed 100401 proving the daily
    candidate reads return non-null shapes where the engine says
    they qualify.
  Any instrument error, unclassified shape beyond the bar, or a
  staged beat without a shape = DIAG NO-GO (the instrument, not
  the shapes, failed).
- G2 THE DIAG QUESTION — the DIAG is GO iff G1 holds AND the
  analyzer names, for each of the four non-lead shapes, the SAME
  blocking condition family on ≥6/8 armed seeds (a blocker that
  reproduces is a diagnosis; a blocker that varies seed to seed
  is noise). The verdict is then one of:
  - DIAG-POLICY-CANDIDATE: ≥1 non-lead shape's dominant blocker
    is policy-side (policy never proposes / never raids / a
    policy gate blocks it) — Stage 2 BUILD is licensed.
  - DIAG-NO-CANDIDATE: every non-lead shape's dominant blocker
    is game-side (conditions never met in live play) or
    shadowing by a higher-priority shape that itself always
    stages — no build is licensed; the finding is filed.
  - DIAG-SHADOWED: a non-lead shape qualifies on ≥3/8 seeds but
    never stages because a higher-priority beat is pending/live
    — a shadowing diagnosis (Stage 2 is a walk/refuse or
    deferral policy question, coordinator's call, not an
    automatic build).
  A miss on G1 = DIAG NO-GO. G2 always returns one of the three
  verdicts above; there is no "no result".
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch diff
  and the proof test (`scripts/test-onlylead-b.js`) is green.
  Any src/js change = NO-GO. (The DIAG stages no lever; G3 guards
  the instrument.)

Cost bar: none pre-registered for the DIAG (no lever is staged;
the two legs are the same answercourt pilot legs on a fresh band,
and their cost is already judged by the answercourt confirm).
Deaths are still reported per seed (§14c co-primary read).

## Method (staged, §§9–12, 14–15)

- STAGE 0 SMOKE (1 seed × 2 policies, 60d): does the driver
  capture the shape-candidate roll + pendingNational, do the verb
  wrappers record answers with shape? Fix wiring, not thresholds.
  (National cannot stage before ~day 62 on the ladder, so the 60d
  smoke is NOT expected to stage a beat — the candidate reads and
  the blocker attribution are proven by the fake-Game unit tests
  in the proof test, one synthetic case per taxonomy branch.)
- STAGE 1 PILOT / DIAG (8 seeds × 2 policies = 16 configs, 150d
  death-aware, identical seeds): the judged run. Horizon 150d
  because the finding's bands are 150d and links need 30 days to
  season after a day-10 start, plus a season for the national beat
  to stage. Seeds (exact literals): 100401, 100402, 100403,
  100404, 100405, 100406, 100407, 100408 (fresh band, verified
  above). Policies: competent-scaleclimb-b (baseline) vs
  competent-answercourt-b (armed), identical seeds. The armed leg
  is the judged leg (it answers beats, so shapes can sat); the
  baseline leg is the control that shows which shapes would have
  staged unanswered.
- ENV: defaults, matching the answercourt legs —
  COUNTER_ANSWER unset, COMPETENT_FLEE_REPAIR unset,
  ANSWERMAIL_DRIVE unset. No other env. Every flag is recorded
  here; there are no others.
- STAGE 2 (BUILD, only on DIAG-POLICY-CANDIDATE): minimal policy
  lever, own frozen GO bar in an amended prereg, pilot 8 on the
  same band (100401–100408); if pilot GO, confirm on 100421–100436
  (16 fresh seeds, verified clean above). If the DIAG returns
  DIAG-NO-CANDIDATE or DIAG-SHADOWED, NO Stage 2 build runs in
  this arm.
- DRIVER (scripts/onlylead-driver-20261115.js, adapted from the
  answercourt driver): daily link roll + shape-candidate roll +
  foreign-polity roll, verb wrappers, `Game.say` capture FILTERED
  to link/polity lines only (meal/tribute chatter excluded, cap
  600), raw standing split read daily,
  `villageStandingTotal()` read ONCE at end-of-run. Per-seed JSON
  to evidence/2026-11-15/perseed-onlylead-b-control/ (baseline)
  and evidence/2026-11-15/perseed-onlylead-b-on/ (armed).
  Zero src/js.
- ANALYZER (scripts/analyze-onlylead-b.js): per-seed per-shape
  staged / qualified-days / first-qual-day / blocker (frozen
  taxonomy), verb table with caller split for proposeCovenant /
  proposeTrade / raidVillage / _formPeerLink, wall numbers per
  leg. Writes evidence/2026-11-15/onlylead-b-analysis.json.
- BALANCED PANEL (§15): a panel compare runs ONLY if a Stage 2
  build is judged (per the answercourt precedent, the real
  balance-panel.js compare cannot judge a policy contrast — a
  pseudo-panel compare is built for the record and the preregged
  bar is the judge). The DIAG itself is judged by G1/G2, not by
  a panel.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures —
  the driver observes the policies' own play; nothing is staged.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the staged beat + answer lines the driver captures and judge
whether the court reads like a played ceremony — AND read the
villager dialogue around the shapes that never stage: is there any
played line at all about a covenant, a charter, a binding, or a
conquest in the captured lines, or do the four roads exist only in
the code? Judge meaning and coherence, never just counts.

## Evidence

- Prereg: this file.
- Instrument substrate (on master, unchanged): scripts/policies/
  competent-scaleclimb-b.js (baseline) and scripts/policies/
  competent-answercourt-b.js (armed).
- Driver: scripts/onlylead-driver-20261115.js (new, adapted from
  the answercourt driver).
- Analyzer: scripts/analyze-onlylead-b.js (new).
- Proof: scripts/test-onlylead-b.js (new; static RED→GREEN +
  game smoke, determinism legs).
- Per-seed JSON: evidence/2026-11-15/perseed-onlylead-b-control/
  (8 files) and evidence/2026-11-15/perseed-onlylead-b-on/
  (8 files).
- Analysis: evidence/2026-11-15/onlylead-b-analysis.json.
- Panel (Stage 2 build only): evidence/2026-11-15/onlylead-panel.*
- Evidence: evidence/2026-11-15/sim-onlylead-b.md (per-seed
  per-shape tables, verb table, wall numbers, sense-testing,
  metric review).

## Convergence state

DIAG — the verdict is GO/NO-GO against G1 above, plus one of
DIAG-POLICY-CANDIDATE / DIAG-NO-CANDIDATE / DIAG-SHADOWED under
G2. A POLICY-CANDIDATE licenses a Stage 2 build (coordinator's
call on the amended prereg); a NO-CANDIDATE closes the arm with
the finding filed. Either way the axis line updates from this
run's numbers only.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did G1/G2 measure the question, or
did the metric prove wrong (bad proxy, taxonomy artifact, blind
channel)?

---

# STAGE 2 ADDENDUM — BUILD: the covenant road (DIAG-POLICY-CANDIDATE)

Written 2026-11-15, AFTER the Stage 1 DIAG ran and BEFORE any
Stage 2 sweep. This addendum freezes the Stage 2 lever and its GO
bar; nothing below is tuned after the pilot runs.

## DIAG verdict (Stage 1, band 100401–100408, 150d, 16 configs)

- G1 GO: 0 instrument errors both legs; every staged beat
  classified by shape with sat/unsat (5 lead beats armed, all
  sat; 5 staged-but-unanswered baseline); UNCLASSIFIED 0 across
  all 40 shape-seed cells per leg (bar ≤1 per 8 seeds).
- G2 — DIAG-POLICY-CANDIDATE. Per shape, armed leg (baseline
  identical — the road state is the same until a beat stages):
  - lead: staged 5/8; blocked 3/8 (subs-short:2 ×2, rung-gate ×1
    — 100407's polity stood 19 days, d42–60, and the village
    died ON the rung day itself, d61).
  - conquest: `conquest-no-raids` 8/8 — 0 conquered subs ever;
    the policy never raids.
  - belong: split — `belong-no-sub-link` 5/8; good-standing
    failures 3/8 (`belong-arrears:20000`, `belong-arrears:5000`,
    `belong-trust-short:40`). Belong never qualified on 8/8, but
    no single blocker reaches the ≥6/8 reproducibility bar — the
    split itself is the diagnosis (see evidence).
  - covenant: `covenant-no-peer-links` 8/8 — 0 covenant peer
    links ever formed; the policy never proposes covenant, and
    the engine never proposes either (0 proposeCovenant /
    proposeTrade / raidVillage calls by EITHER caller band-wide;
    0 _formPeerLink events).
  - trade: `trade-no-peer-links` 8/8 — same.
- The G2 ≥6/8 same-blocker bar is met for conquest, covenant and
  trade (8/8 each) and missed for belong (5/8 top blocker). The
  dominant diagnosis is POLICY-side: the policy walks only the
  lead road, and the game would stage the other shapes if the
  policy walked them. Foreign polities DO reach 4–5 villages on
  6/8 seeds, so the BELONG precondition is not the blocker — the
  blocker is Haven never being a subordinate in good standing.
- The covenant road is chosen as the minimal Stage 2 build:
  proposeCovenant / _formPeerLink / tendLink-on-peers /
  answerNationalChoice('pact') are all wired in the engine
  (hierarchy.js `_proposePeer` ≥55 accept / 35–54 counter /
  <35 decline; `_judgePeer` base 38 + rep/2 + opinion/2 +
  allied 15 + equals 10 + R()*20−10; `_formPeerLink` trust 30;
  `tendLink` accepts peer links, 1,500 kcal → +8 trust weekly;
  `answerCounter('accept')` forms a peer counter's link). No
  game-side substrate is missing — the road is unwalked, not
  unwired. Conquest is NOT chosen (raids carry real casualties
  and a cost bar of their own — a bigger lever, not the minimal
  one). Trade is the same shape as covenant with a different
  answer; covenant goes first. Belong is NOT chosen (its blocker
  splits, and its lever would be counter-farming, not a road).

## The lever (frozen — do not tune mid-run)

New policy `scripts/policies/competent-covenant-b.js`: the FROZEN
competent base (`scripts/policies/competent.js`, unmodified) plus
the covenant road, NOTHING else. It composes onto competent the
way scaleclimb does — it does NOT compose onto scaleclimb (which
would propose lead links and shadow the covenant road by
priority).

Daily, in order, after competent.daily:
1. Answer a staged national beat FIRST (the answercourt answer
   map, reused verbatim via `answerNationalBeat` from
   competent-answercourt-b: lead feast / conquest mercy / belong
   swear / covenant pact / trade sign; unknown shape never
   answered; 'refuse'/'walk' never chosen; global beats NOT
   answered). The covenant leg answers every staged beat so a
   covenant beat, when it stages, is answered the next morning
   with 'pact'.
2. Answer a pending counter: answerCounter('accept') — a peer
   counter forms the peer link (hierarchy.js answerCounter).
3. Tend COVENANT links below the seasoned bar: weekly, for each
   active covenant peer link with age < 30 days OR trust < 40,
   when pantry > 20,000 kcal: tendLink(link.id) (1,500 kcal →
   +8 trust). Seasoned links (30+ days AND trust 40+) are NOT
   tended. Same gates as scaleclimb's lead tend.
4. Propose COVENANT directly: once per day, from day 10, when no
   counter/national beat is pending, pantry > 12,000 kcal, and
   fewer than 3 covenant links stand — the best courtship-ready
   KNOWN village (deterministic peer judge ≥ 45, opinion ≥ 10 —
   the engine's own prerequisite, filtered here so the daily
   propose is never spent on a refused knock — no RNG draw; the
   engine then adds R()*20−10, so det ≥ 45 guarantees ≥ 35 after
   the draw, the counter floor, never a cold decline). A declined
   village is not re-proposed within 7 days. Cap: 3 covenant
   links.
   - detJudgePeer (no RNG): 38 + min(20, repStanding/2) +
     opinion/2 + allied?15 + 10 (equals-at-the-table) — the
     engine's `_judgePeer` minus its R()*20−10 draw.

WHAT IT DOES NOT DO:
- No proposeLink (no lead road — lead can never qualify, so it
  can never shadow covenant by priority). No proposeTrade (trade
  is the next road, not this arm). No raidVillage (conquest is
  not this arm). No seat-taking. No banking step, no pack
  changes, no tribute change. No defense-call / trade-call
  answers (those exist only after national; not needed to stage
  the beat). No global-beat answers. No src/js changes.
- No accord answers: peer links never stage a pendingAccord
  (`_formPeerLink` stages none — the accord is a `_formLink`
  first-gesture), and no lead link can ever form on this leg, so
  no accord can ever be pending. Stated so the absence is not
  misread as an omission.

BASELINE (the comparator): `scripts/policies/competent-scaleclimb-b.js`
(the same baseline as the DIAG). The Stage 2 pilot RE-RUNS both
legs fresh on the same band (per the 2026-11-15 stale-corpus
finding — no judging against the committed Stage 1 control
corpus, even though the tip's game code is unchanged).

## Stage 2 primary metric + GO bars (binding, §14)

- G1 INSTRUMENT VALIDITY — GO iff the driver captures a full
  per-day link roll + shape-candidate roll on all 16 configs,
  0 instrument errors, EVERY staged beat classified by shape
  with sat/unsat, and UNCLASSIFIED ≤ 1 per 8 seeds on the
  covenant leg. Any instrument error, unclassified shape beyond
  the bar, or staged beat without a shape = NO-GO.
- G2 THE LEVER — GO iff on the covenant leg, COVENANT BEATS
  STAGED on ≥3/8 pilot seeds (baseline 0/8 — the DIAG's number
  on this band; the bar is 3 because the road needs 3 seasoned
  links plus the rung, and a single staging proves the road
  opens while 3/8 shows it reproduces) AND every staged
  covenant beat is answered 'pact' and sat (sat = the engine
  returns true and sets nationalLive). A miss on either half =
  NO-GO, never re-scored mid-run. Lead beats staged on the
  covenant leg are reported (expectation: 0 — the leg proposes
  no lead links); a lead staging would mean the isolation
  failed and the pilot is re-examined, not re-scored.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch
  diff and the proof test (`scripts/test-covenant-b.js`) is
  green (static det-judge + fake-Game propose/counter/tend +
  game smoke + determinism legs).

Cost bar (same as answercourt): starvation deaths pooled
covenant ≤ baseline + 2 AND median survival covenant ≥ 0.8×
baseline median. Guardrail (§14c): villager (non-scholar)
combat deaths are a co-primary read on every seed — the
evidence names any seed where covenant deaths exceed the before
leg by >50%.

## Stage 2 method (staged, §§9–12, 14–15)

- STAGE 0 SMOKE (1 seed × 2 policies, 60d): does the covenant
  policy load, propose, counter-answer, tend? Fix wiring, not
  thresholds. (National cannot stage before ~day 62, so the 60d
  smoke is NOT expected to stage a beat — the propose/counter/
  tend path is proven by the fake-Game unit tests in the proof
  test.)
- STAGE 1 PILOT (8 seeds × 2 policies = 16 configs, 150d
  death-aware, identical seeds, BOTH legs re-run fresh): the
  judged run. Seeds (exact literals): 100401–100408 (the DIAG
  band). Policies: competent-scaleclimb-b (baseline) vs
  competent-covenant-b (covenant road), identical seeds.
- CONFIRM (16 seeds × 2 policies) ONLY on a pilot GO, on the
  fresh band 100421–100436 (verified clean in the Stage 1
  prereg: 0 hits in preregs, filenames, scripts). A borderline
  pilot is reported as-is; the coordinator decides. Do NOT spend
  a confirm to rescue a NO-GO.
- DRIVER: scripts/onlylead-driver-20261115.js (extended to accept
  the covenant policy; same recorder, same shape-candidate roll).
  Per-seed JSON to evidence/2026-11-15/perseed-covenant-b-control/
  (baseline) and evidence/2026-11-15/perseed-covenant-b-on/
  (covenant). Zero src/js.
- ANALYZER: scripts/analyze-onlylead-b.js (unchanged — the
  per-shape classification already covers covenant staging).
  Writes evidence/2026-11-15/covenant-b-analysis.json.
- BALANCED PANEL (§15): if the pilot is GO, a pseudo-panel
  compare is built for the record (answercourt precedent — the
  real balance-panel.js compare cannot judge a policy contrast);
  the preregged G2 bar is the judge.
- ENV: defaults, matching the DIAG legs — COUNTER_ANSWER unset,
  COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE unset. No other
  env.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Evidence (Stage 2)

- Amended prereg: this file (Stage 2 addendum above).
- Policy: scripts/policies/competent-covenant-b.js (new).
- Driver: scripts/onlylead-driver-20261115.js (extended: accepts
  the covenant policy).
- Proof: scripts/test-covenant-b.js (new; static + game).
- Per-seed JSON: evidence/2026-11-15/perseed-covenant-b-control/
  (8 files) and evidence/2026-11-15/perseed-covenant-b-on/
  (8 files).
- Analysis: evidence/2026-11-15/covenant-b-analysis.json.
- Panel (pilot GO only): evidence/2026-11-15/covenant-panel.*
- Evidence: evidence/2026-11-15/sim-onlylead-b.md (DIAG + Stage 2
  verdict in one file).
