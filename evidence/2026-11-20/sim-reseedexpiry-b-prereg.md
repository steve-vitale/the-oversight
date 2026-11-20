# sim-reseedexpiry-b — PREREG (frozen before any judged sim)

**Arm:** sim-reseedexpiry-b — the EXPIRY HALF of the #2626 re-seed lever
(finding #2626, sim-findings.md). Loop B run
fleshout-loop-b-20261120T2130Z, axis winnability chain, arm 3 of 3.

**Branch:** `sim-reseedexpiry-b` (worktree
`~/workspace/worktrees/sim-reseedexpiry-b`). Base: the HELD branch
`sim-reseed-b` at tip `0f34690b7` — NOT master. Do NOT rebase onto
master first.

## Base and master delta (recorded at freeze)

- Base `0f34690b7` = the reseed lever + evidence + instrument, held
  unmerged (verdict NO-GO METRIC-BROKEN: re-seed works in live play,
  expiry half unproven, 0 expiries in 12 seeds).
- Master has 18 commits this base lacks (merge-base `e103a64cc`):
  journey-scale r247 (`b6a551691`), journey-succession r258
  (`ef5e65cb1`), sim-dmgcheck-b (`693c325e7`–`9b14b0b93`),
  sim-sense3-b (`13bcc3020`–`c0ac4c3c9`), sim-roll35-a, sim-lend-a,
  journey-deepening r246, round-1830 record (`1fcd7edba`), and others.
  `src/` diff master-vs-base: `betrayal.js` (+7/−0 master-side),
  `convo-dialogue.js` (+17/−1), `fieldFights.js` (−13),
  `villager-brain.js` (−12), `win-plan.js` (−337: the reseed lever
  itself). No departure/fight-gate file other than the lever's own
  is touched by the master delta in a way that changes the commit
  point — but the delta is RECORDED, not assumed away: the control
  leg on THIS base is the baseline for the guardrail, and the
  survey's dead-commit counts are judged against this base's own
  armed leg, never against the reseed arm's numbers.
- This arm does NOT re-judge the re-seed half and does NOT merge the
  held fix (coordinator's decision at closeout). If this arm GOes,
  the combined branch is ready for the coordinator to judge landing.

## Read first (not re-measured)

- `evidence/2026-11-20/sim-reseed-b.md` + prereg (on this branch):
  re-seed works (dead 2/16 → 0/18 armed, 6 commits, 4 launches,
  the 106081 pair re-seeded herald→reunion d119 and launched);
  expiry NEVER fired — `planExpiries` 0 on all 12 armed seeds
  (band 106081–106092) because a rumor was always available.
- `evidence/2026-11-20/sim-winnability-round-1830.md` (read from
  master via `git show` — NOT in this tree): adoption closeout,
  #2626 stays OPEN, HELD unmerged at `0f34690b7`.
- docs/CANON.md + docs/MONSTER-WAVES.md (read before building).
- The reseed evidence's two analyzer corrections (gate cross-check
  vs re-seeded launches; expiry-row false positives from hurt
  blocks + never-targeted no-departs) — the expiry instrument below
  inherits both.
- CANON GAP (inherited, stated not invented): no canon doc covers
  expedition destination picking — the re-seed picks a TARGET TYPE
  from what the holder has heard, never a destination tile.

## What the expiry half is, in plain words

When a hunter's plan target is already dead and nobody has heard of
anything else alive to hunt, the plan dissolves: the hunter is told
at the fire, once, that the hunt is called off, and the plan is
held from re-creating the ghost-hunt on later days (it re-attempts
a re-seed on every later commit, in case a new rumor arrived).
The expiry fires ONLY when the rumor pool is empty — the holder's
own fought species, their fight memories, AND the village fire
knowledge (`villageLastSeenDay` keys) hold no live wave-3+ type.
That pool is village-wide for its third source: ANY villager's
wave-3+ fight stamps a rumor the whole village can use. So the
expiry is reachable only in a rumor-poor window — most plausibly
right after the village's FIRST wave-3 (or wave-4) kill, before a
second distinct wave-3+ type has been fought alive. This arm
measures whether that window exists in live play, and if it does
not, constructs it explicitly and tests the path there.

## STEP 0 — SURVEY THEN CONSTRUCT (frozen plan)

**STAGE 1 — SURVEY (live bands).** Armed + control legs on TWO
fresh bands (see freshness check below), 8 seeds each, 150d
death-aware, same policy/substrate as reseed. The driver records,
at EVERY departure commit, the rumor-pool size for the holder
(see Instrument): the pool floor — the smallest pool seen at any
dead-target commit — is the survey's primary measurement, reported
whether or not an expiry fires.

**STAGE 2 — CONSTRUCT (only if Stage 1 expiries = 0 on BOTH
bands).** Construct the rumor-poor condition explicitly in a live
loaded game: a real village driven to its first wave-3 kill shape
with encounter gear (a geared scholar fighting with a party — the
encounter-gear rule; the holder carries the average gear and party
a player actually has at that content), the holder's plan on the
killed type, no other wave-3+ rumor in the holder's fought species,
memories, or village fire knowledge. Run the commit through the
same driver instrument as a separate staged corpus (NOT mixed into
the judged survey) and test whether the expiry path fires with its
fireside beat. ALSO re-examine the smallest-pool survey seeds for
near-miss windows (dead-target commits with pool 1–2: what was the
one rumor, and when did it arrive?). A staged fixture that fakes
expiries with a degenerate state (stripped village, no gear, no
party, hand-built state with no live play behind it) is FORBIDDEN —
the construction must be a live played game at the content, or it
does not count.

**If Stage 1 yields ≥ 1 expiry on either band, Stage 2 is NOT run
as a judged stage** — the live band IS the condition, and the
follow bars are judged on its expiries.

## Primary metric (FROZEN — §14 metric binding)

**Expiry occurrence + follow-through, control vs armed, identical
seeds**, classified by the expiry analyzer
(`scripts/analyze-reseedexpiry-b.js`, ported from the reseed
analyzer + pool-floor counting — see below) from the recorder
corpus.

- **GO: ≥ 1 expiry observed with its fireside beat in the corpus
  transcript** (an expiry row cross-checked against
  `winPlanStats.planExpiries`, beat matching "put down" in
  `vetSays`), **AND post-expiry targetless launches = 0** across
  the run, **AND ≥ 2/3 of expired holders re-seed onto a live
  target within 7 days** of their expiry (commit-time rumor
  re-seeds AND lived-fight retargets via `winPlanSeedFromFight`
  `v4seeds` rows), **AND ≥ 2/3 of expired holders fight a
  wave-3+ beast within 14 days** of their expiry, **AND the
  guardrail passes** (below). The expired-holder denominator is
  STATED with every share; when n = 1 the shares are 1/1 or 0/1
  and are reported as such, not rounded into a pass by silence.
- **Guardrail (same cost bar as reseed, judged per band against
  that band's own control):** survived >= control−1 AND median
  survival >= control−5d AND starvation <= control+1. Judged on
  median survival (gameDays) AND survived-count AND starvation
  deaths together — a miss on any one is a guardrail miss.
- **POOL FLOOR (reported on every verdict, never a GO bar by
  itself):** the minimum rumor-pool size across all dead-target
  commits on the armed legs, the pool-size distribution, the
  dead-target commit count per seed, and the earliest/latest
  dead-commit days. If expiries are 0, the floor IS the result:
  it names how far live play ever got from empty.
- **VERDICT KINDS (frozen):**
  - `GO` — expiry observed (live band or constructed condition)
    with beat, post-expiry 0, both follow shares ≥ 2/3, guardrail
    passes. A GO on the constructed condition only is labeled
    `GO (constructed)` with the live-band floor beside it.
  - `NO-GO UNREACHABLE` — Stage 1 expiries 0 on both bands AND
    Stage 2 construction also yields 0 expiries: the expiry
    fallback is unreachable-by-construction on every reachable
    condition tried. This is a MEASURED result, not a failure of
    the mechanism: report it with the rumor-availability floor,
    and the coordinator/Steve call (judge the fix on the re-seed
    half + guardrail alone) is left open, not taken here.
  - `NO-GO` + kind `RESEED` / `FIGHT-AGAIN` / `POST-BLOCK` /
    `GUARDRAIL` / `INSTRUMENT` — expiries observed but a frozen
    bar missed, or the instrument failed (cross-check mismatch,
    missing gate snapshots, instrument errors).
  - `NO-GO METRIC-BROKEN` — reserved for the case where the
    instrument cannot measure the bars at all (e.g. the pool
    snapshot fails to record on dead commits). Zero expiries with
    a working instrument is UNREACHABLE, not METRIC-BROKEN.

## Secondary (reported, not GO bars)

- Dead-target commit count per band/leg (the survey's denominator
  for the pool floor).
- Re-seed commits/launches on the survey bands (the re-seed half
  is NOT re-judged, but its counts are reported for continuity
  with the reseed arm).
- Post-expiry hold rows ≥ 1 expected IF expiries occur (evidence
  the expiry hold fired on later days).
- Expiry beats + re-seed beats visible in the corpus transcript
  (`vetSays`, SAY_RE-matched "put down").
- Scale-wall numbers every leg (national / table / wins, wave 4–5
  unlocks, median survival, starvation).

## Horizon, seeds, policies, substrate (FROZEN)

- **Horizon: 150d, death-aware** (same as the reseed arm).
- **Seeds: Band A 106301–106308, Band B 106401–106408** (8 seeds
  each; freshness verified below). Spare band 106501–106508 held
  in reserve, NOT used unless a band is contaminated mid-run
  (recorded as a correction if so).
- **Policy: competent verbatim** (scripts/policies/competent.js;
  policy sha256[:12] verified on this base BEFORE the freeze:
  `1884c8852d38` — identical to the reseed arm's).
- **Substrate (all legs, verified on this base):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`
  (all five flag readers present in `src/js`).
  `ALLYSLOT3` and `LAUNCHSURVIVE` verified absent from `src/js`
  (no references); keep all legs identical. The driver enforces
  all of this at runtime — a stop is a loud failure, never a
  re-scope.
- **Legs:** control (`PLANRESEED` unset) and armed
  (`PLANRESEED=1`), each band, same driver
  (`scripts/reseedexpiry-driver-b.js`, ported from the reseed
  driver + pool snapshot, MODE=reseedexpiry), same analyzer
  (ported + extended, see below). RUN names
  `reseedexpiry-b-<band>-control` / `-armed`; OUTDIRs:
  `perseed-reseedexpiry-b-<band>-control` /
  `perseed-reseedexpiry-b-<band>-armed`.
  Before/after comparison through the balanced panel
  (`scripts/balance-panel.js` via
  `scripts/build-reseedexpiry-b-panels.js`, `--out
  evidence/2026-11-20/reseedexpiry-b-panel-<band>`) per §15.
- **Chunking:** sweeps chunked to ≤ 8 seeds per exec call (one
  band-leg per call).

## Seed-band freshness check (recorded at freeze)

Bands A (106301–106308) and B (106401–106408) are **FRESH**.
Search scope (per the seed-band-freshness skill): every dated
prereg under `evidence/*/sim-*-prereg.md` (the complete named-seed
list was enumerated — 106001–106008, 106011, 106026, 106031,
106044, 106046, 106051, 106058, 106061, 106068, 106071, 106075,
106078, 106081–106092, 106101, 106108, 106110–106118,
106121–106123, 106126, 106128, 106131, 106133, 106136, 106138,
106141, 106142, 106145, 106148, 106151–106158, 106161, 106165,
106168, 106171, 106172, 106174, 106176, 106178, 106181, 106184,
106186, 106187, 106188, 106191, 106198, 106201, 106203, 106206,
106208, 106211, 106218, 106221, 106228, 106231, 106232, 106238,
106365, 106419, 107001–107058 — no 10630x, 10640x (other than
106419), or 10650x among them); `evidence/2026-11-20/sim-findings.md`;
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/convergence-tracker.md`;
and the per-seed corpus directory names under `evidence/*/perseed-*/`.
All three candidate bands (A, B, spare 106501–106508) return
NOTHING in every scope. No forbidden/contaminated band list names
any of them (searched the tracker + `hidden_files/` for
"forbidden band" / "contaminated band" — no single list file
exists; the tracker cites band reservations inline).
CAVEAT (recorded honestly): a full-text grep of every file under
`evidence/` for the candidate numbers was STARTED and killed
mid-run (the corpus JSONs make it slow and noisy — 6.7M chars of
matches in flight, mostly seed fields inside corpora); the scopes
above — preregs (the naming source), findings, tracker, corpus
dir names — are the check the skill requires, and they are
complete. If a later search finds a band named earlier, the
verdict is corrected with a correction commit naming the source.

## Instrument (port + extend, do not rewrite)

`scripts/reseed-driver-b.js` is ported to
`scripts/reseedexpiry-driver-b.js` (MODE guard: reseed →
reseedexpiry; RUN/OUTDIR defaults; corpus prefix) with ONE
recorder addition — the **rumor-pool snapshot**, taken in both
departure wraps BEFORE the departure call, alongside the gate
snapshot:

- `rumorPoolSnapshot(Game, vid)`: pure reads, no RNG, no
  game-state writes. Replicates `planReseedPick`'s enumeration
  EXACTLY (same sources, order, wave floor, exclusions, liveness
  rule — the liveness replica reads `villageSlain`,
  `waveKillLog` dated kills, and `villageLastSeenDay` the same way
  `planTargetDeadByType` does): (1) holder's fought species
  (`agencyState().know[vid].fought`, most recent first); (2)
  holder's fight memories (`village.monsterSightings[vid]`, most
  recent day first); (3) village fire knowledge
  (`villageLastSeenDay` keys, most recent first). Returns
  `{ pool: [ids in pick order], poolN, firstPick, deadTarget,
  needWave }` where `deadTarget` is the liveness-replica verdict
  on the plan's current target. Recorded on the depart row as
  `rumorPool` whenever the plan has a target (the snapshot is
  cheap; the analyzer counts only dead-target commits).
- The snapshot NEVER calls `planReseedPick` or
  `winPlanCommitDeadTarget` (both live inside the departure call
  that follows) — it is an independent replica, so the proof test
  can cross-check replica-vs-real on staged fixtures.
- `scripts/analyze-reseed-b.js` is ported to
  `scripts/analyze-reseedexpiry-b.js`: launch classification, gate
  cross-check, expiry rule + both false-positive corrections,
  post-expiry counts, re-seed / 7-day / 14-day bars — unchanged in
  semantics — PLUS:
  - `deadCommitsOf(d)`: depart rows (both `v4departs` and
    `dawnbidDeparts` where a `rumorPool` is present) whose
    `rumorPool.deadTarget` is true — the survey denominator.
    Deduped by (vid, day): the two wraps double-fire for one
    departure, same rule as launches.
  - `poolFloor(d)`: min / median / distribution of `poolN`
    across dead commits; the per-commit table (seed, day, vid,
    target, needWave, poolN, pool ids, outcome after the call:
    re-seeded / expired / held / launched-live).
  - `files` bar 12 → **8** per band-leg (this arm's legs are
    8 seeds; the pooled judgment reads both band dirs).
  - Judge gains the UNREACHABLE kind (expiries 0 + instrument
    clean + pool floor recorded) and the GO (constructed) label.
    Selftest gains §G (pool floor stats, dead-commit dedupe,
    UNREACHABLE judge, GO-constructed judge) with §A–§F kept
    green.

## Proof tests (before judged sims)

- Re-run the reseed proof suite on this base (required by the
  task): `scripts/test-reseed-b.js` 96/96 + analyzer selftest
  40/40 — RECORDED AT FREEZE: **96 passed, 0 failed** and
  **40 passed, 0 failed** on base `0f34690b7` (run 2026-11-20
  ~21:35Z, before this prereg was written).
- New `scripts/test-reseedexpiry-b.js`:
  (a) POOL REPLICA FIDELITY (the critical proof): on staged
  fixtures spanning the rumor shapes — holder fought only the
  dead type; holder fought a live wave-3 type; village fire
  knowledge holds a live wave-4 type; village holds ONLY dead
  types (killed, never re-seen); suburb as the only rumor
  (excluded under FLEEREPAIR2); wave-2-only rumors (below the
  floor); never-targeted plan — the replica's `poolN` and
  `firstPick` match the REAL `winPlanCommitDeadTarget` outcome
  on a loaded game: poolN 0 ⟺ `'expired'` (with expiry beat
  and `planExpiries` 1); poolN ≥ 1 ⟺ `'reseeded'` onto
  `firstPick` (with `planReseeds` 1). The replica is also
  checked against the real pick's choice on multi-rumor
  fixtures (firstPick == the retargeted type).
  (b) DRIVER SMOKE: armed 1-seed smoke through the ported driver
  records `rumorPool` on depart rows with a target, and the
  corpus self-describes the flag + base.
  (c) ANALYZER: pool-floor stats on synthetic corpora (min /
  median / distribution / dead-commit dedupe across the two
  wraps); judge kinds UNREACHABLE (0 expiries, clean instrument,
  floor > 0) and GO (constructed) on fixtures; §A–§F of the
  reseed selftest kept green by porting, not by loosening.
- `node scripts/check.js --quick` after the build (recorded in
  evidence; a green-list failure is investigated, never waived).

## Metric review (carried from reseed, plus new)

1. The analyzer's `live` class means "last seen alive in a
   fight", not "alive now" — unchanged.
2. Same-day kill-then-sighting is conservatively blocked —
   unchanged.
3. The gate's `villageLastSeenDay` stamp covers every `fieldFight`
   contact including arena/contest fights — unchanged (this arm's
   stamp is the reseed arm's two call sites).
4. The re-seed count has two honest numbers: commits
   (`planReseeds`) and launches. The bar counts launches — unchanged.
5. **NEW — the pool snapshot is a replica, not the real pick:**
   its fidelity is proven by (a) above on fixtures AND by the
   live cross-check: on every dead-target commit in the judged
   corpora, the outcome after the call must agree with the
   replica (poolN 0 → expired/held; poolN ≥ 1 → reseeded). A
   disagreement is an instrument failure: STOP, investigate,
   never silently count. The `planExpiries` cross-check (rule
   expiries == game stat on every seed) is the second leg of the
   same proof.
6. **NEW — the survey's power is the dead-commit count, not the
   seed count:** if the two bands yield few dead-target commits,
   the floor is thin and the UNREACHABLE verdict must say so
   (dead commits N, pools seen). A floor of "min 1 over 3 commits"
   is weaker than "min 2 over 14 commits" and the evidence says
   which.
7. **NEW — Stage 2's staged corpus is NOT a judged band:** its
   expiries satisfy the occurrence bar only under the explicit
   `GO (constructed)` label, with the staged shape (seed, day,
   gear, party, rumor state) written in the evidence so a later
   reader can re-play it. The live-band floor stays beside the
   verdict.
8. The guardrail's revised 12-seed allowance is re-scaled to the
   8-seed band by the SAME numbers (survived ≥ control−1, median
   ≥ control−5d, starvation ≤ control+1) — the allowance is per
   band, not per seed count; with 8 seeds a 1-seed allowance is
   proportionally larger, and the evidence reports the raw counts
   beside the pass/fail so the looseness is visible.
9. Follow-up left OPEN (do NOT build here): ally-holder learning
   of kills (`winPlanNoteKill` killer-only) — unchanged.
10. The `dawnbidDeparts` `'normal'` rows with a targetless plan
    are NOT all expiries — the reseed corrections (hurt block,
    never-targeted no-depart, prior-target evidence) carry over
    unchanged.

## Convergence state

Axis: winnability chain, dead-target gate step (#2626 expiry half).
Status at freeze: **PREREG FROZEN, BUILD + LEGS OWED**. The
re-seed fix stays HELD, unmerged, on `sim-reseed-b`
(`0f34690b7`); this arm branches from it and never merges it.
No win price or deed gate changed. No other lever touched.
