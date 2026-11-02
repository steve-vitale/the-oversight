# Loop A 1515Z coordinator evidence — axis scale-onramp (2 arms, merged locally pending ship)

Run `fleshout-loop-a-20261102T1515Z`, axis scale-onramp. Claim written before
any sims (arms `sim-deadid-a`, `sim-laircontact-a`); sibling Loop B live on
food-economy throughout (1505Z claim at run start, retired mid-run; a new B
run started after) — NOT touched. Pre-flight: main tree clean at `c0cf1d401`,
disk 23%, reaper removed nothing (all active/dirty sibling trees correctly
refused). Master moved under this run three times from sibling lanes
(build arrow-making evidence `18e995603`, water-guard note `29aab51d4`,
Loop B abandonspeak `965b46743`) — zero file overlap with either arm.

## Arm 1 — sim-deadid-a: BUILD, dead-id exclusion (backlog #1823, build half)

Commits: prereg `e73c66f97` → rebased `a886ca241` → `50e800628`;
build `1ed53fe6a` → rebased `412607d00` → landed `d7fa67ee6`
(merged `--ff-only`, verified via `git branch --merged master` BEFORE release).
Proofs re-run green on the rebased tip AND on merged master:
`test-deadid-a.js` 23 passed / 0 failed / 1 skipped,
`test-rosterreturn-a.js` 29/29, `test-membership-20261007.js` 43/43.
One ff-only refusal mid-closeout (master moved during proof re-runs) — rebased
again, proofs re-green, merged only after MERGE-OK verification.

What it fixes (one file, `src/js/membership.js` +39/−1): `genApplicant()` now
excludes dead-marked ids from the applicant pool (`deadMarked()` consults all
three death records, because `removeVillager` marks only the first record it
finds), and `arrivalTick()` drops a dead-flagged arrival with one honest line
("Word came too late: <name> never made it — they're already gone").
Scope (a) ONLY, as pre-registered: no identity-aware narration written, no
`npcIds()` succession filter (succession rule untouched).

Prereg amendment, documented not hidden: the 97330 Nora chain (death d106,
application d109, arrival d111, mantle d112) does NOT reproduce on current
code — intervening landings moved the seed. The verbatim rosterreturn driver
on current code produces the identical new chain (d107 Jenny chain; Nora
lives to become bearer d108 legitimately, dies d119, zero dead draws), so this
is code movement, not a driver artifact. Amended primary, same strictness,
made before any post-fix judged sim: seed 97331, where the current-code
baseline reproduces the FULL mechanism — Jovan Milic killed d40 → drawn d41
(dead-flagged at draw) → accepted d41 → walked in d43 → roster d44–58 →
bearer-after-death d55–58.

Before/after, identical seeds, 180d death-aware cap, closecommit stack:
- 97331 baseline: Jovan chain as above, village-lost d58, 7 applications,
  4 walked. Post-fix: zero dead draws, zero dead walk-ins, zero
  reappearances, zero bearer-after-death days; d41 draw picks living Onni
  Korhonen instead; village survives to d69, 11 applications, 8 walked.
- Pilot band (8 seeds): applications 39 → 43, arrivals walked 15 → 19,
  refused 0 → 0, dead draws 1 → 0, dead walk-ins 1 → 0, reappearances 1 → 0,
  driver errors none → none. Per-seed det-gate: 5 identical; 97331
  differs-dead-draw (allowed); 97330 and 97335 differ (G1 letter miss).
- Panel before/after (capable policy, pilot seeds, 180d): decision
  `review_required`, investigated — EVERY paired metric delta is exactly 0
  (one descriptive nourishment metric wobbles 0.0001 on rounding); the label
  comes from descriptive/insufficient rows, all delta 0. Table 0.75/0.75,
  national access 0.5/0.5, village deaths 39/39, community loss 0.25/0.25.

### Verdict: NO-GO on prereg letter — LANDED by coordinator overrule

The worker verdict is NO-GO, strict, on guardrails G1/G2 letter — and the
verdict STANDS in this record; it is not re-scored to GO. The landing is a
separate coordinator decision under Steve's "figure it out yourself — make
the call, document it, he can overrule" directive, and Steve can overrule
the landing (local-only, pending ship, not pushed, not live):

- G1 ("det-gate byte-identity on non-dead-draw seeds") is unsatisfiable by
  ANY correct pool-filter implementation: `pick(bg)` is index-based, so
  filtering dead ids shortens the pool and shifts every later pick once ANY
  dead id sits in the pool — even if baseline never drew one. Proven from
  recorded draws: divergence starts exactly at the first pool-differing
  draw, never before (97330 d109, 97335 d22, deaths identical before).
  A guardrail no correct implementation can pass is void, not failed.
- G2 (band totals within ±3) misses by exactly 1, and the entire +4/+4 gain
  comes from 97331, the allowed-divergence seed where the fix works
  (longer-lived living roster → more intake windows). Every other seed's
  counts are identical; no seed lost flow (minimum post-fix: 3
  applications). Punishing the fix for working on its target seed is
  perverse.
- The primary is fully met on the seed where the mechanism reproduces; the
  panel shows zero regression on any paired metric; the fix is minimal,
  proof-green, and closes a plainly absurd bug (a buried villager ruling
  the village). Holding it for a redundant re-run under corrected
  guardrails would be exactly the re-proving Steve told the loops to stop
  (2026-11-01: deliver real changes, not re-proved constraints).
- Backlog #1823 is therefore marked `fixed` on this overrule landing, with
  the NO-GO-on-letter verdict preserved here and in the tracker. If Steve
  overrules, the revert is one commit (`d7fa67ee6`, no other arm depends
  on it).

Pre-existing failures, proven NOT this arm's by stashed-baseline re-runs:
`test-village-membership.js`, `test-membership-depth-20261007.js`,
`test-recruit-person-20261013.js` (green-listed) fail identically with the
fix stashed. Reported, not fixed (outside this arm's area). `check.js
--quick` stalled under sibling load (0:01 CPU in ~9 min) and was killed by
the worker, not claimed.

Sense check: post-fix d41 brings "Onni Korhonen of Stonebridge wants to join
Haven… 'Heard about this place three valleys over'" → accepted → walks in
(3 souls) — reads exactly as before, with a living applicant substituted.
No Jovan line anywhere in the window.

## Arm 2 — sim-laircontact-a: DIAG-GO, fed-scholar lair-contact cadence

Commits: prereg `6843925da` → rebased `0798b156e`; results `2ffafdc63` →
rebased and landed `2b4e79d12` (merged `--ff-only`, MERGE-OK verified before
release). Proof `scripts/test-laircontact-a.js` 65/65 on the rebased tip.
Zero `src/js` changes — policy/instrument only (new policies `lairsham.js`,
`lairnoise.js`).

Question (from 1340Z musterupkeep): fed scholars never ended a day on the
lair tile (0 contact attempts in both fed runs vs 12/6 in baselines). Answer:
**contact is a wild-contact bump, not a feeding effect.** An attempt fires
iff scholar and herald share a tile AND a detail cell (mx,my) at
monster-turn time — 843 of 845 attempt rows are detail-matched (the 2
exceptions are harness contest-drive rows on tile-sharing alone). No attempt
row has a policy caller. The scholar's march never initiates contact;
camping the lair is neither necessary nor sufficient. Contact cadence is
roaming luck priced by trajectory.

Numbers (identical seeds, current master, closecommit stack):
- Phase 1: 97330 — base 0 attempts / fed 12 / sham 16 / noise 0. 97338 —
  base 0 / fed 0 (but day-end co-located d86) / sham 0 / noise 12. Every
  pattern splits by seed → 8-seed pilot band triggered (prereg decision
  tree honored).
- Screen: 40 seeds (97400–97439), 18 called, 10 baseline-attempt-positive.
  Band: 97405, 97420, 97432, 97433, 97435, 97412, 97418, 97426.
- Band: baseline attempt-positive 8/8, musterfed 7/8, lairsham 7/8,
  lairnoise 8/8 — fed-zero rate 1/8, far below the ≥7/8 systematic bar.
  The single fed-zero (97435) is matched by sham-zero on the same seed
  while noise stays positive: a trajectory avoiding co-location, not a
  food effect. The prior arm's "0-contact" was a two-seed snapshot on old
  code: on current code the SAME fed policy on the SAME seed (97330)
  produces the exact 12-refusal pattern the old baseline produced, while
  the current-master baseline produces none.
- Fight contact is robust: on gate-met seeds 97412/97418, ALL FOUR arms
  produce the identical single FOUGHT attempt on the identical day
  (d78/d60). Refusals dominate at gate <10; FOUGHT starts at gate ≥10.
- Q3 (day-matched trust) HOLDS as primary anchor, with decomposition: call
  day identical across arms on every band seed; short windows agree
  exactly, fed saves exactly +2.0 mean on 97420/97433 by feeding the first
  dawn (0 vs 1 hungry days, residual 0). Long window 97435: fed feeds 5 of
  6 dawns (+10 hunger-saved) yet has 0 attempts — trust and contact are
  independent outcomes. On the known seeds the anchor fails outright (no
  contact day in any arm on current master) — the contact-day anchor does
  not survive a landing.

Prereg deviation, recorded: the baseline-reproduction check failed because
master moved (monster commitment, loot taper, journey r72 landed since the
1340Z records) — proven code, not driver, by re-running the OLD
musterupkeep driver on current master (identical result: call d117,
0 attempts, lost d132). Baselines were re-based to current-master runs; no
threshold was re-scored.

Balanced-panel note: no panel compare attached, for a stated reason —
`balance-panel.js` runs its own policy registry (capable/risk-aware/
socialite/winseek) and cannot ingest these driver records or express this
policy-arm comparison; the byte-identical determinism (closecommit 97330
r1 == r2 exactly; all 8 band baselines r1 == screen runs exactly) is the
instrument the prereg named, same position as prior diag arms.

Reachability: calls sound, musters form (gates 3–15), scholars camp the
lair, wild-contact bumps fire, MUSTER-GATE refusals fire (gate <10),
FOUGHT starts fire (gate ≥10). NOT established: any herald slay/flee — this
driver doesn't record fight outcomes, so no FOUGHT seed is claimed as a
slay. The driver's won/table/national flags are explicitly NOT cited
(won=1 at "over-other" d90 occurs on contact-free seeds too). No new
national/table/win evidence attributable to the herald chain.

## Village assessment (plain words)

The village used to bury someone and then, days later, take that same
person's application seriously, debate it, and welcome them home as a
stranger — because the application office never crossed out the dead.
After the fix the office crosses out the dead: the dead man never applies,
a living man applies instead, and the village lives longer with real
people in it. Nothing else about village life changes.

Separately, the village sends its scholar to camp on the herald's lair, and
there she waits. She cannot make the herald come to her: she can only be
there, night after night, while the herald wanders — sometimes stepping
onto her exact patch of ground, sometimes passing a tile away, sometimes
leaving without a word. Feeding the march does not change whether the
herald comes; touching the pantry does not; even scrambling the luck of
the world does not, not reliably. What the village CAN control is being
there with enough blades when the walk arrives — and on the two seeds
where it had them, the fight began the same day in every version of the
story, fed or unfed.

## Wall numbers (this run's judged corpora)

Both arms' corpora are measurement/diagnosis substrates, not win-seeking
runs: sweep national / table / wins 0, wave-5 unlocks 0, full seat 0.
Dead-id panel before/after identical (national access 0.5/0.5, table
0.75/0.75, village deaths 39/39). The scale wall picture is unchanged by
this run: national reach is proven real on other seeds, but the on-ramp
(a village alive through national toward the table) still ends at the
lesser seat with wave 5 unfought in normal play. scale-onramp stays
converging, NOT converged.

## Metric review

- Dead-id G1 (corrected for the NEXT run): det-gate must be "divergence
  only on/after the first draw whose pool contained a dead bg id" (driver
  should record pool composition at draw time). G2 (corrected): judge flow
  as no-loss per seed and exempt allowed-divergence seeds from band
  totals. The corrected bars are recorded here, not applied retroactively
  to this run's verdict.
- Laircontact: baselines must be re-based whenever master moves between
  the cited run and the audit; the old-driver-on-new-code check is the
  way to prove code-vs-driver attribution.
- Panel `review_required` on the dead-id pair is fully explained (all
  paired deltas exactly 0; descriptive/insufficient rows only) — no
  further investigation owed.

## Telemetry deviation check

Prescribed invocation REFUSED the recorder corpus (same class as
1030Z/1135Z/1155Z/1233Z/1340Z/1424Z): "refusing recorder-corpus input: all
16 --current rows carry top-level anchorCommit, so they are sweep recorder
rows, not runs." No LOUD lines, baseline NOT rolled (no
`--allow-recorder-corpus`, no `--update-baseline` — the refusal is the
tool's own guard, and the worker panel compares already cover before/after).

## Infrastructure

- Registry-lock queue delayed both worktree registrations (~4.3 min +
  ~6.9 min) and both heartbeats — contention only, no loss.
- Safe-commit index clobber hit the dead-id worker's both commits; repaired
  with the recorded recipe both times (status empty, diff HEAD empty,
  hashes match after repair). No clobber on the laircontact worker commits.
- No EPERM flap blocked this run. check.js --quick NOT re-run by the
  coordinator: zero src/js in the diag arm, one minimal file in the build
  arm with its own proof suites green on merged master (plus the standing
  pre-existing profile recorded by sibling runs).
- Both trees released `done-merged`, branches deleted, final reap touched
  no sibling tree. Main tree clean at closeout (see tracker entry for the
  post-commit verification).

## Blanks filled or documented

- FILLED (overrule landing): backlog #1823, dead-id exclusion build.
- DOCUMENTED (named next arms, in order): (1) herald world-list departure
  audit — why the herald leaves `worldMonsters` the day after a
  co-location day with no fight (97400 d69+, fed-97338 d87+) and the day
  after refused attempts (noise-97338 d85+), while staying for weeks
  after refusals elsewhere (97405 through d161); instrument: daily trace
  WITH detail coords + monster-turn bump conditions + titan outcome
  records. (2) A fight-outcome recorder (tbOutcomes into per-seed
  outputs) before any "herald chain reachable end-to-end" claim.
  (3) Dead-id follow-ups, NOT built here: `npcIds()` dead filter
  (succession still trusts roster membership alone); a live-sim
  transcript of the accepted-before-death refusal line (proven in
  harness only — no pilot sim produced it, gate 1 fires first); whether
  debate should notice a pending applicant's death (design question).
- Still open, unchanged: STEVE-CALL — committed blade as bearer (options
  a–d in sim-bearerorder-a.md); stores-draw upkeep proposal (Steve-call,
  needs ruling before src/js); realm-persistence coherence question.

Merged locally, pending ship (both arms landed; dead-id landed on
coordinator overrule with the NO-GO-on-letter verdict preserved above).
Do NOT push, do NOT bump — the batch ship job owns deploys.
