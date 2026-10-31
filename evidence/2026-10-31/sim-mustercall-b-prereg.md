# sim-mustercall-b — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop B worker, axis scale-onramp, next blank (3) from run
fleshout-loop-b-20261031T0249Z. Arm type: DIAG ONLY — zero src/js,
zero policy-default flips, zero edits to existing policy files, no
routing change built, no roster/list-fed fix proposed. The perception
law (Steve 2026-10-28) binds: any call-sounding channel in the
decision brief must be perceivable by a person present (a face the
scholar saw, a scout report she heard, gossip she could hear) — never
a magic roster scan.

## Question (from sim-herald-b + sim-muster-a)

Herald-b (evidence/2026-10-31/sim-herald-b.md, reproducible band):
35/35 scholar startCombat attempts against the Herald refused for
MUSTER-GATE (0/10 blades, no muster ever created, no call ever
sounded, 16 seeds), while the same beast fought lone villagers 3x
through fieldFight (all vFlee) because the titan wrapper never
touches fieldFight — backlog #1591 (open). Muster-a
(evidence/2026-10-30/sim-muster-a.md): a muster only exists when
somebody presses 'Sound the call' or 'Commit Haven's blades' — no
policy or game system ever does (0 calls over 20 seeds); on the one
measured refused state (75123 day 84, feast-drawn Herald, omen null)
a sounded call would yield only 2 blades vs need 10 (Stonebridge
quota 2, commit blocked), and the refused pending re-faced 3x the
same day. Backlog #1538 (steve-call, still pending): is the refused
re-facing loop intended pressure or should it route toward mustering?

This arm censuses, on the herald-b band, EVERY refused
scholar-channel Herald state — not one state — and asks whether
muster-a's "2 blades vs need 10" is the rule or one state, how the
scholar-channel refusal compares with the field channel on the same
band, and by which perceivable channels a call COULD be sounded.

## Base pin (muster-a lesson: never match a historical corpus across merges)

- Worktree HEAD at prereg time: a1e3a01a9 (Loop B round 0249Z
  coordinator evidence; includes Loop A arm sim-titanexcl-a
  72512906f, backlog #1550: titans excluded from castMonster's pool).
- Consequence, stated BEFORE sims: the feast-draw Herald channel
  muster-a measured (75123 day 84, omen null) is CLOSED on this base
  by #1550 — castMonster can no longer deal a titan. Any refused
  Herald state on this band must arrive by the remaining channels
  (world-contact via monsterTurn hungry contact, the herald-b
  cluster's channel; or contest/feast-draw of a non-cast source, if
  any). The census tests whether refused states survive the
  exclusion, and if so through which channel. A feast-draw Herald
  attempt on this band would be a #1550 regression and is reported
  as such, not folded into the census.
- #1550 status (checked at prereg time, NOT duplicated): LANDED in
  this base — commit 72512906f "exclude titans from castMonster
  pool (GO, #1550)", and its exclusion code is present in
  src/js/game.js castMonster in this worktree. This arm does NOT
  re-build it and does NOT claim it. Whether it holds on the band
  (0 cast-sourced Herald faces) is a measured check, not a re-claim.
- Every per-seed JSON carries its own anchorCommit; the verdict
  judges the sweep on THIS base only. No herald-b or muster-a number
  is quoted as current — comparisons are labeled "prior-base" and
  the base movement is reported, never smoothed.

## Ground facts (verified against code on THIS base, not quoted)

- Gate (src/js/titans.js, titanWrapCombat): for a titan id, refuses
  before core startCombat when titanMusterReady false; says the
  muster line ("sound the call, muster <need> allied blades (you
  have <have>)"); logs game-side outcomes {outcome:'refused',
  gate:'muster', have, need}; returns null. Printed have = RAW
  muster.allies length (no Haven blades added, no dedup); ready =
  unique-alive allies + valid Haven blades >= minAllies (10 for
  herald, src/data/titans.json).
- Writers: soundTitanCall creates musters[tid] and takes, per ACTIVE
  hierarchy link, quota 6 if trust >= 70 AND opinion >= 10 else 2
  (titans.json _coalition: baseBlades 2, trustedBlades 6,
  trustedAt 70, trustedOpinion 10), refusing aloud if trust < 25 OR
  opinion < -10 OR arrears > 0 (trust -8); takes up to
  quota-minus-already FREE faces (alive adults, health > 0, not
  already committed). It NEVER auto-commits Haven blades
  (2026-10-13 rule). soundTitanCall itself has NO omen-stage gate.
- titanCommitOwn: up to 3 Haven blades total, two-tap; requires
  omen stage >= 2 ("nothing located to march against" otherwise)
  and free volunteers (titanVolunteers: roster members, not the
  scholar, not away/traveling/engaged).
- Offer gate (titanSelfActions, camp self-bar): actions for a titan
  exist ONLY when omen stage >= 2 (stage < 2 -> no actions at all
  for that titan); the call button shows when alliedN == 0 OR the
  muster is not ready; the commit button shows when havenN < 3.
  In headless sims nothing presses buttons unless a policy does,
  and no policy in the stack does (verified by muster-a's grep +
  runtime counters; re-verified here by the verb counters).
- Omen staging (titanDawnTick/titanAdvanceOmen): stage 0
  ("something stirs", scouts come back pale) -> stage 1 after >= 4
  days ("gossip names it") -> stage 2 after >= 9 more days
  ("scouts found its lair", titanPlace, say line ends "You cannot
  face it alone. Sound the call."). Stage 2 is the ONLY stage at
  which the call/commit buttons exist.
- Field channel: fieldFight (src/js/fieldFights.js) is NOT wrapped
  by the titan gate. Its records feed deeds, gossip, scars — a
  gossip-mediated channel, not a direct scholar sighting (see
  decision-brief caveat: whether the scholar hears a given field
  fight's gossip before acting is NOT established by this arm's
  instrument and is not assumed).
- Refusal routing: NONE (muster-a). No code outside titans.js reads
  state.titans.outcomes; no dawn tick, daily hook, encounter
  handler, or policy routes a refused face toward soundTitanCall
  or titanCommitOwn.

## Instrument (new sweep, reused recorders, read-only)

- scripts/herald-instrument-20261030.js (HERALD=1, verbatim reuse):
  wraps startCombat (classification FOUGHT/REFUSED/THROW + reason,
  caller from stack top, scholar/entity tiles), tbEnd, fieldFight
  (wave >= 4), recordWaveKill (wave >= 4), muster verbs (counters),
  say ring (last 400), sleep census (day, unlocked wave, scale
  rank only — herald-b's s85112 hygiene rule kept: NO
  standing/readiness reads inside the sleep wrapper).
- scripts/policies/muster-diag.js (MUSTER=1, verbatim reuse): on
  every muster-refusal say line, snapshots C0-C9 (call attempts so
  far; muster existence; allies raw = printed have; allies
  unique-alive; valid Haven blades; active links with
  trust/opinion/arrears/quota/facesFree/already/wouldRefuse/
  wouldYield; hypothetical call yield = sum of wouldYield; omen
  stage/day; offered flags derived from omen stage; volunteers;
  ready manual + titanMusterReady cross-check). Pure reads only;
  never calls a mutator; never sounds a call in a judged sweep.
- NEW scripts/mustercall-sweep-20261031.js: runs the herald-b stack
  with BOTH recorders installed (herald install first, then
  muster-diag, so both say wrappers delegate in chain), writes
  per-seed JSONs to evidence/2026-10-31/perseed-mustercall/
  leadfeast/s<seed>.json (herald corpus shape + muster refusals +
  verb counters + census + transcripts). No timestamps, no fight
  ids persisted, so re-runs are byte-comparable.
- NEW scripts/mustercall-analyze-20261031.js: derives every judged
  number below from the per-seed JSONs only (no re-simulation).
- NEW scripts/test-mustercall-20261031.js: proof test on SYNTHETIC
  fixture rows only (no band seeds): refusal/snapshot join,
  commit-block taxonomy, call-yield arithmetic, per-day re-face
  counting, field-vs-TB asymmetry table. Band seeds never appear
  in the proof test, so proof runs are not judged sims.
- Post-block counterfactual (NOT judged, clearly separated): after
  the judged sweep, a replay of ONE refused state (first cluster
  day, full sweep stack) may sound the call once and re-face, in
  the muster-a style, to validate the hypothetical callYield
  against a real soundTitanCall result. Its numbers are reported
  under a "post-block, not judged" heading and never enter the
  census tables.

## Classification rules (binding — the census is judged on these)

- REFUSED STATE (unit of Q1): one startCombat attempt with
  mid 'herald', cls REFUSED, reason MUSTER-GATE, joined to a
  muster-diag snapshot on the same seed and day with the same
  printed have/need. An attempt without a joinable snapshot is
  UNJOINED (reported, never silently dropped; completeness counts
  it as missing).
- DISTINCT STATE CLUSTER (unit of the "rule or one state"
  question): (seed, day, omenStage, callYield, commitBlock) —
  refusals sharing all five collapse to one cluster row, with
  reFaceCount = refusals in that cluster and first/last day noted.
  The per-attempt table is kept alongside; the cluster table is
  what answers "rule or one state". A cluster carried by a single
  seed is labeled single-seed, never presented as band-wide.
- BLADE COUNT AVAILABLE IF A CALL WERE SOUNDED: snapshot
  callYield (sum of wouldYield) + already-committed allies raw.
  Reported as "call would bring X (yield Y new + Z already) vs
  need 10; with commit unblocked, ceiling = X + min(3 - havenValid,
  volunteers)". The commit ceiling is arithmetic on snapshot
  fields, never a simulated commit.
- COMMIT-BLOCK REASON (exactly one, in this order): NO-OMEN if
  omenStage is null; OMEN-STAGE-LT-2 if omenStage < 2;
  HAVEN-CAP if havenValid >= 3; NO-VOLUNTEERS if volunteers == 0;
  UNBLOCKED otherwise. (Note: titanCommitOwn's two-tap means an
  UNBLOCKED state still needs two taps; the reason taxonomy names
  the gate, not the tap count.)
- CALL OFFERED: omenStage >= 2 (the self-bar gate). A call can be
  SOUNDED by the verb at any omen stage (soundTitanCall has no
  omen gate), but it is OFFERED as a button only at stage >= 2.
  Both columns are reported; conflating them is an error.
- RE-FACE COUNT PER DAY: REFUSED herald attempts on that
  (seed, day). Also reported: days with refusals, max/day, median
  gap between consecutive refusal days, and muster events between
  first and last refusal (from verb counters: always expected 0;
  any nonzero is a finding, not a correction).
- CHANNEL (Q2): TB-scholar = startCombat attempts mid 'herald'
  (caller wild-contact / contest / feast-draw / policy-hunt /
  other, from stack top); FIELD = fieldFight records mid
  'herald'. Same-titan comparison is per seed: TB refusals,
  TB fought + TB ends, field fights + field outcomes, field
  kills (vKill) and TB kills (recordWaveKill mid herald).
  "Asymmetry changes a kill outcome" is judged as: would
  excluding refused TB attempts, or gating field fights the way
  TB is gated, change any kill count on the band? (Herald-b's
  answer was no for the field headline; this arm re-judges it
  fresh, it does not inherit it.)
- FEAST-DRAW REGRESSION CHECK: any startCombat attempt mid
  'herald' with caller feast-draw, or any cast-sourced Herald
  face, is counted separately and labeled REGRESSION-#1550, not
  merged into the world-contact census.
- TRANSCRIPT SAMPLES (sense-testing): first-refusal say-ring
  slice and a late-repeat slice (last refusal day if one exists)
  on the cluster seed, plus one Herald field-fight record from
  this band's own capture. Judged: does the refusal line read
  honestly after the first telling (same line? same numbers? any
  acknowledgment of repetition, of the field fights elsewhere,
  of a remedy attempted)?

## Primary metric

Census completeness over the band: (a) every wave >= 4 startCombat
attempt classified FOUGHT/REFUSED/THROW (herald-b taxonomy); (b)
every REFUSED herald attempt joined to a complete muster snapshot
(all of C1-C9 present, have/need matching the refusal line).
Completeness = joined-complete refused herald attempts / all
refused herald attempts. Cross-checks: (i) verb counters
(soundTitanCall/titanCommitOwn/titanWarCouncil/titanSelfDo) on
every seed; (ii) game-side refused outcomes records join to
REFUSED attempts on the same titan and day (herald-b's check,
kept); (iii) ready-manual vs ready-game agreement on every
snapshot (any mismatch is a finding, not a dropped row).

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: completeness >= 95% on the full band, cross-check
  match rates >= 95%, instrumentErrors = 0 on all seeds, >= 8
  usable seeds, >= 1 distinct refused state cluster measured,
  AND the evidence states (a) the full Q1 census (per-cluster
  blades/quota/omen/commit-block/re-face), (b) the Q2 channel
  asymmetry table with the kill-outcome judgment, (c) the Q3
  ranked decision brief with each channel's perceivability
  grounding and its census yield, and (d) wall numbers on the
  band. A single-seed cluster set still passes DIAG-GO if the
  evidence says so plainly (single-seed caveat carried in the
  headline, as muster-a did) — the verdict is about census
  completeness, not about how many seeds refused.
- DIAG-NO-GO: completeness < 95%, or either cross-check < 95%,
  or instrumentErrors > 0 with no read-only explanation, or a
  required verdict section (a)-(d) missing.
- INSUFFICIENT-DATA: fewer than 8 usable seeds, or ZERO refused
  Herald states on the full band (the census question is then
  unanswerable on this band — Q2/Q3 are still reported as far
  as measurable, and the verdict says which questions died
  with the empty set, not that the gate is fixed).

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot GO requires: instrument fires on all 8 pilot seeds with zero
instrument errors; per-seed JSONs valid (days > 0, census sorted);
AND an activity signal on >= 1 pilot seed (a Herald TB attempt of
any class, a Herald field fight, or omen stage >= 2 reached) —
otherwise the band is dry and the run stops at pilot as
INSUFFICIENT-DATA (no confirm spend on an empty band). Pilot size
is NOT the verdict: the confirm carries it. If the pilot fails on
instrument grounds, the verdict is DIAG-NO-GO.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over (village
lost or won). Identical to herald-b: the herald-b cluster ran to
day 130 and wave-4 doors opened as late as day ~165 in prior
bands, so a shorter cap would censor the refusal tail; the
death-aware stop keeps cost at the survival distribution.

## Seeds (exact literals — the herald-b band, for comparability)

- Pilot: 85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108.
- Confirm (pilot GO only): 85109, 85110, 85111, 85112, 85113,
  85114, 85115, 85116 (16 seeds total).

## Policies (single-base measurement; no control leg by design)

Identical to herald-b, every seed:
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))` with
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 + HERALD=1 + MUSTER=1 instruments. Policy-side only,
no game change. Neutrality note: herald-b proved the HERALD
instrument det-neutral on its base; the added MUSTER recorder
wraps say + muster verbs only (muster-a proved it neutral on its
base by a byte-equivalent control). A same-base control is NOT
re-run as a judged leg; any seed whose trajectory diverges from
the herald-b corpus is reported as a base-movement flag with its
divergence day, not silently dropped (muster-a lesson).

## Wall numbers reported every run

national / table / wins, wave 4-5 unlocks, median survival (game
days), plus: Herald TB attempts by class and reason, Herald field
fights by outcome, wave-4 kills by channel (TB vs field).

## Panel (§15)

Single-base DIAG measurement: no before/after comparison exists in
this arm (the herald-b/muster-a comparisons are cross-base
historical corpora, not a panel before/after on this base), so
`scripts/balance-panel.js` does not apply. No panel compare is
attached and none is fabricated. A later lever arm reusing this
corpus as its baseline runs the panel then. Same declaration as
herald-b.

## Sense-testing (SENSE-TESTING LAW)

Read the first-refusal and late-repeat transcript slices on the
cluster seed plus one Herald field-fight record from this band's
own capture. Judge: does the refusal line land as an explanation
a person would understand the first time AND the twentieth time;
does anything change between first and twentieth refusal; does
the villager's subsequent behavior read as a person reacting or
a driver looping; does the refusal line acknowledge the field
fights happening elsewhere or the remedy it prescribes? Counts
alone do not pass this arm.

## Metric review

(To be filled at end of run. Doubts about the metric go here and
apply to the NEXT run, never to re-score this one.)

## Convergence state

(One line at end of run: converging | converged | parked |
killed-at-pilot — for the scale-onramp axis measurement, not a lever.)
