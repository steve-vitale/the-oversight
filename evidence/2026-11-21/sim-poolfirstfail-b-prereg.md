# sim-poolfirstfail-b — DIAG PREREG, the pool-first-fail instrument (frozen before any judged sim)

**Arm:** sim-poolfirstfail-b, DIAG instrument · **Loop B run:**
fleshout-loop-b-20261121T0430Z, arm 2 of 3 · **Axis:** winnability chain
**Type:** DIAG, instrument-only (recorder + analyzer). No game-code
change, no default flipped, no lever built in this stage.
**Branch:** `sim-poolfirstfail-b` · **Worktree:**
`~/workspace/worktrees/sim-poolfirstfail-b`
**Base at arm start:** master `df40fced1` (verified at arm start:
worktree HEAD `df40fced1...`, `git status --short` empty).
**Frozen:** 2026-11-21 ~05:40 UTC, BEFORE any judged sim.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
(first 12: `1884c8852d38` — IDENTICAL to the holderstate-b /
launcheng-b corpora; verified live on this base).
**Horizon:** 150d, death-aware. **Band:** 106731–106738 (8 seeds,
fresh — see below).

## The question (holderstate finding; launcheng-b's binding gate)

sim-holderstate-b (`evidence/2026-11-21/sim-holderstate-b.md`,
DIAG-GO) closed the 10 launcheng unknown days (all `hs-gate-pick`,
mechanism DENIED) and left one number undecomposed: on its fresh
band (8 seeds, 150d) the companion pool had **0 eligible
companions in all 36 pool snapshots** (first-fails: selfOrScholar
72, away 47, notRanger 69, trustLow 4), and `party-no-companion`
is the binding gate on 55/74 assessed days. The launch engine
cannot launch a party if no companion is ever eligible. Nobody
has decomposed WHY the pool is empty — whether companions are
away, dead, untrusted, or not rangers — and what would have to
change for a companion to be eligible. This arm builds the
instrument that answers that, on a fresh band under the current
base.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-21/sim-holderstate-b.md` + prereg — the 36
  snapshots, the first-fail counts above, the 55/74 binding gate,
  the recorder patterns this arm copies (poolReplica, pool rows
  per scored dawn, substrate assertions, D1/D2 proof shape).
- `evidence/2026-11-20/sim-launcheng-b.md` — `party-no-companion`
  223/223 assessed days on its band; the binding gate this arm
  re-names on the fresh band.
- `evidence/2026-11-17/sim-poolshape-a.md` — the nearest prior
  decomposition (older band, different substrate): notRanger 400
  / 446 (89.7%); profile census over 446 living non-self members
  (wanderer 38, explorer 8, forager 346, homebody 54); relaxing
  the profile gate alone fills 79/81 empty dawns; holders are
  almost all non-rangers asking foragers to walk a road only
  rangers may walk. This arm does NOT re-run poolshape's band:
  it re-tests the read on a fresh band under the current
  substrate, and goes one level deeper — per-member gap-to-
  wanderer, away×expedition cross-tab, trust distance, stage /
  holder splits, and a daily village-level ranger-supply census
  that poolshape never recorded.
- `docs/CANON.md`, `docs/PARTY.md` — read first. PARTY.md covers
  the SCHOLAR's party (System unlock, trust-gated acceptance);
  it does NOT cover the villager party-launch companion pool.
  No canon doc covers the villager companion-pool filter
  (CANON GAP, inherited): the filter is grounded only in code,
  read before freezing (below).
- `docs/MEASUREMENT.md` §§9–12, 14–15 — staged seeds,
  death-aware horizons, pre-registration, metric binding,
  balanced panels (N/A for a DIAG arm: no before/after).

## The pool filter, read from code before freezing

`findCompanion` (`src/js/villager-brain.js:129`, the party-path
pick the dawn scorer calls; `win-plan.js:237` carries a second
copy used at `:1069` — both untouched by the reseed delta, see
Base-identity check) admits a roster member in this check
order, first failure wins:

1. self / scholar skip (`selfOrScholar` — structural, 2 per
   snapshot: the holder + the scholar)
2. dead (`dead`)
3. away (`away` — `v.away[cid]` is set with a `purpose`: by
   `startExpedition` (`src/js/villager-agency.js:553`,
   purpose `'expedition'`) and by objective travel
   (`src/js/villager-objectives.js:1389`, purpose = the
   objective's purpose, e.g. forage / visit))
4. trust < 15 (`trustLow` — trust undefined defaults to 10;
   village-gen seeds trust at `5 + floor(random*16)` = 5–20,
   scholar 15, `src/js/game.js:2576-2581`; trust grows through
   interaction, capped at 40 on the gain path at `:3393`)
5. not at Haven (`notAtHaven` — node != village px/py)
6. engaged (`engaged` — mid-day conversation)
7. profile not wanderer/explorer (`notRanger`)
8. on expedition (`onExped` — agency `exped[cid]`)
9. else eligible, ranked by `Game.companionRank`
   (`companion-score.js`, no RNG, no writes)

`npcRangeProfile` (`src/js/villager-agency.js:323-360`) scores a
villager and CACHES the result in `a.profiles[vid]` — once
computed it never recomputes, even if goal or age moves:

- temper: bold/restless +2, intense +1, cautious/withdrawn −2,
  gentle −1 (`npcTemper`, `src/js/game.js:19131` — pure read of
  `data.villagers[].personality.temperament`)
- goal: explore +2, prove/lead/escape +1, heal/protect −1
  (`npcGoal`, `src/js/game.js:18037` — pure read of the
  villager's goal / `bgGoals`)
- age: <30 +1, >55 −2, >45 −1 (`npcAge`, pure read)
- ranging aptitude `npcRangingApt`: rangy occupation +2
  (13 occupations in `RANGY_OCC`), `knowsSnare` +1, occupation
  teachTags matching /track|forag|surviv|hunt|trail|wild/i +2,
  observant (primary or secondary) +1 — all pure reads
- driven (`a.potential[vid]`): +2
- profile: score ≥5 explorer, ≥2 wanderer, ≥−1 forager, else
  homebody

Consequence the instrument must respect: the filter sees the
CACHED profile, while the live score (recomputed from today's
temper/goal/age/apt/potential) may have moved since caching.
The recorder therefore records BOTH per member — cached
profile (what the filter sees) and live score + components
(what would have to change) — and flags staleness when they
disagree.

## Band freshness (verified 2026-11-21, before this prereg)

Candidate band 106731–106738. Search scope per the survey prereg
protocol + `local_seed_band_freshness` skill: (1) `grep` over
`evidence/*/sim-*-prereg.md` and `evidence/2026-11-2*/sim-*.md`;
(2) `git grep` bounded-pattern (`10673[1-8]`) over preregs +
`scripts/*.js`; (3) `grep -rl` over goal `hidden_files/*.md` +
`evidence/2026-11-21/*.md` + live `hidden_files/lever-claims/`
(10673x pattern); (4) filename `find` over `evidence/*/perseed-*`.

- **106731–106738 FRESH.** Zero hits in every scope: no prereg,
  sim note, script, goal file, live claim, or corpus dir names
  any of 106731–106738. No `perseed-*10673*` dir exists anywhere.
- Already-used bands NOT reused: 106081–106088,
  106151–106158, 106161–106168, 106171–106178, 106181–106188,
  106191–106198 (dmgsurvey-b); 105931–105938 (dmgshape-b 1230Z);
  106211–106218, 106221–106228, 106231–106238 (strikeband-b);
  106241–106248 (strikeband4-b); 106251–106258 (sense3-b);
  106501–106516 (pinquaddoor-wide-b); 106601–106616
  (reseedexpiry); 106701–106716 (pinquaddoor-reprereg-b);
  106721–106728 (holderstate-b); 107051–107058 (cellgate-a);
  107091–107098 (fibersupply-a); 107111–107118 (lendpool-a).

## Base-identity check (verified before freezing)

The pool path is IDENTICAL between the holderstate corpus base
`a6534c67b` and this arm's base `df40fced1`:

- `git diff a6534c67b df40fced1 -- src/js/villager-brain.js`
  is +18 lines and contains ZERO `findCompanion` lines: the
  additions are the PLANRESEED commit-time dead-target check
  and the RE-SEED LAUNCH BEAT hook in the `party_launch`
  commit path (downstream of `findCompanion` — they act on a
  commit already made, never on pool eligibility).
- `git diff a6534c67b df40fced1 -- src/js/win-plan.js` is +424
  lines (the reseed combined fix); the only `findCompanion`
  mention in the diff is a comment line — the `:237`
  `findCompanion` copy itself is untouched.
- `src/js/villager-agency.js` (npcRangeProfile, npcRangingApt,
  RANGY_OCC), `src/js/villager-objectives.js`, and
  `scripts/policies/competent.js` are byte-identical between
  the two bases (`git diff --stat` empty on all three).
- Policy sha verified live on this base: `1884c8852d38`.

Caveat (recorded, not hidden): the holderstate corpora were
recorded on `a6534c67b`; this band is recorded on `df40fced1`.
The POOL path is identical, so the first-fail decomposition
re-measures the same mechanism. The LAUNCH/COMMIT path changed
(reseed), so the binding-gate counts on this band are the
current-base picture, not a pure re-measure of holderstate's
55/74 — the evidence reports both numbers side by side and
does not claim a re-measurement.

## Substrate (env flags — identical to holderstate-b)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim, 150d death-aware, one leg (recorder ON).
NOTE ON THE BRIEF'S FLAG LIST: the arm brief's parenthetical
enumerates six flags (it omits FLEEREPAIR2), but its lead
phrase is "same competent substrate as holderstate" and
holderstate's prereg freezes SEVEN flags including
FLEEREPAIR2=1 — and FLEEREPAIR2 is a LIVE gate in
`src/js/win-plan.js:297-302` (not env-only), so omitting it
would change fight behavior and break comparability with the
finding being decomposed. This arm follows holderstate exactly
(7 flags) and flags the difference here for the coordinator.
ALLYSLOT3 is NOT landed on this base either (verified: the
driver asserts the ENV flag is set, asserts src ABSENCE, and
records `allyslot3InSrc: false` on every corpus — same as the
survey prereg). **ZERO `src/js` changes in this arm.**

## Instrument (new recorder + extended analyzer; driver wraps only)

- `scripts/poolfirstfail-driver-b.js` — a copy of the held
  `scripts/holderstate-driver-b.js` (read-only copy of the
  approach; the held branch is NOT merged, depended on, or
  modified) with ONLY these changes: header comment, arm/run
  `poolfirstfail-b` (out object + file names
  `poolfirstfail-b-s<seed>`), stop-message prefix
  `POOLFIRSTFAIL`, driver-filename strings in
  `firstCallerFrame`/`fightOrigin`, the ALLYSLOT3-discrepancy
  comment re-based to `df40fced1`, the usage line re-seeded to
  106731–106738, the MODE guard unchanged (`MODE=vre`), all
  substrate assertions unchanged, all existing recorder logic
  byte-identical in behavior — PLUS the pool-first-fail
  extension (new code, driver-side pure reads, no RNG, no
  game-state writes except the inherited `npcRangeProfile`
  cache read already present in `poolReplica`):
  1. `rangeScoreOf(Game, cid)` — recomputes the
     `npcRangeProfile` score from live components (temper,
     goal, age, `npcRangingApt`, potential), returning
     `{temper, goal, age, apt, aptParts, potential, score,
     profile}`. `aptParts` decomposes the aptitude
     (`{occ, snare, tags, observant}`) from the same reads
     `npcRangingApt` makes; the driver asserts
     `aptParts` sums to `npcRangingApt(cid)` and records an
     instrument error on any mismatch (self-check).
  2. Extended `poolReplica` members: every non-self member
     now also carries `awayPurpose` / `awaySinceDay` /
     `awayDuration` (raw `v.away[cid]` fields, null when not
     away), `trustGap` (`15 - trust` when trustLow else 0),
     and `range` (the `rangeScoreOf` record + `cachedProfile`
     from `npcRangeProfile` + `stale` =
     `cachedProfile !== range.profile`). Self/scholar members
     keep the holderstate shape (firstFail only, nulls never
     counted as conditions).
  3. `poolCensus` — one row per day (in the `daily()` wrapper,
     same cadence as `dawnbidCensus`): the WHOLE roster's
     live-score profile distribution (computed ONLY from
     `rangeScoreOf` — the census NEVER calls `npcRangeProfile`,
     so it writes no profile cache), plus the supply chain:
     `rosterN / livingN / deadN`, rangers alive, rangers at
     home, rangers at home + trusted (≥15), rangers at home +
     trusted + not engaged + not on expedition (the full
     eligibility chain minus the holder), and live wave-4
     holder count that day. Output key: `poolCensus`.
  Corpus: `evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/`
  (8 files).
- `scripts/analyze-poolfirstfail-b.js` — a copy of
  `scripts/analyze-holderstate-b.js` with ONLY these changes:
  arm/run `poolfirstfail-b`, EXPECTED seeds 106731–106738,
  output `evidence/2026-11-21/poolfirstfail-b-analysis.json`,
  PLUS Leg P (pool-first-fail decomposition, below). The
  launcheng day-level classifier (Taxonomy A + B'), Taxonomy
  H, Leg R, launch accounting, and wall numbers are reused
  VERBATIM — their definitions are not re-decided here.
- `scripts/test-poolfirstfail-b.js` — proof (mirrors
  `scripts/test-holderstate-b.js` + the strikeband4 proof
  structure): §1 static + §2 analyzer selftest green + §3
  fixture end-to-end (Leg P on a synthetic corpus) + §4 live
  150d shape run on screening seed 106731 (pool rows with gap
  fields, census rows) + §5 D1/D2 at 30d on 106731 under the
  full substrate (repeatability + recorder neutrality). (§4 was
  100d at first freezing; moved to 150d by AMENDMENT 2 — the
  seed forms no wave-4 plan by day 100.)

## Leg P — pool-first-fail decomposition (frozen)

Run over the fresh corpora. First-fail classes are the frozen
set from `findCompanion`'s check order: `selfOrScholar`,
`dead`, `away`, `trustLow`, `notAtHaven`, `engaged`,
`notRanger`, `onExped`, `eligible`. (`selfOrScholar` is
structural — 2 per snapshot — and is EXCLUDED from the
binding-first-fail plurality, but counted and reported.)

| Leg | What it computes |
| --- | --- |
| P1 first-fail tally | Counts + shares per class across all pool snapshots; per seed, per plan stage, per holder. The binding first-fail is the modal NON-SELF class. |
| P2 counterfactual relaxations | Per snapshot, eligible counts recomputed from the recorded member fields under: relax-profile-only, relax-away-only, relax-trust-only, relax-all (all three) — same check order, one filter lifted at a time. Reports how many empty snapshots gain ≥1 eligible under each relaxation. |
| P3 notRanger gap | For every notRanger member: liveScore distribution, gap-to-wanderer histogram (gap = max(0, 2 − liveScore)), stale-cache count (liveScore ≥2 but cached profile not ranger), and single-component closers (how many gap-1 members close with knowsSnare +1, a goal change, observant +1, or age crossing). |
| P4 away decomposition | Away members cross-tabbed by purpose (expedition vs objective-travel) × onExped × ranger-or-not (cached profile) × trust-ok. Reports how many away members WOULD be eligible if home. |
| P5 trust | trustLow members' trust-gap distribution; trust distribution of all non-self members. |
| P6 census supply chain | Per seed, over census rows: days with ≥1 ranger alive / at home / at home+trusted / fully eligible-chain; mean rangers per day at each link. The chain shows WHERE the supply dies. |
| P7 splits | Empty-pool rate by holder profile (ranger vs non-ranger holder) and by plan stage. |
| P8 what-would-have-to-change | One row per first-fail class: count, share, the minimal change that fixes it, and the snapshots it would fill (from P2). The named next lever comes from this table. |

## Primary metric (frozen)

Pool-snapshot classification completeness over the fresh band
(every pool snapshot fully first-fail-classified, every
notRanger member gap-recorded, census covering the band),
PLUS the binding first-fail named with a plurality.

## DIAG-GO BAR (frozen — a miss is NO-GO, never re-scored)

The diag is **DIAG-GO** only if ALL of these hold:

(a) **Classification completeness:** 0 unclassified pool
    snapshots on the fresh band — every `companionPool` row
    satisfies: `counts` sum to `rosterN`; every member's
    `firstFail` is in the frozen set; every non-self member
    carries `range{score, profile, gap}` + `trust` +
    `awayPurpose` fields; no row is missing `members` or
    `counts`. AND `poolCensus` covers the corpus daily-snapshot
    days minus the trailing final snapshot day (census day-set
    C ⊆ daily day-set D, |C| ≥ |D|−1 — see AMENDMENT 1), each
    row carrying the frozen fields.
(b) **Binding first-fail named:** the modal NON-SELF
    first-fail holds a strict plurality of non-self
    first-fails across the fresh band's snapshots (its count
    exceeds every other non-self class).
(c) **Instrument validity:** proof test
    `scripts/test-poolfirstfail-b.js` green; analyzer selftest
    green; analyzer run on the real band dir parses 8/8 files,
    0 instrument errors, substrate assertions pass (policy sha
    `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: false`,
    anchor base `df40fced1`).

REPORTED BUT NOT GATING the verdict: Leg R reproduction of
the 10 launcheng unknown days (validates the analyzer copy;
a miss is called out as an instrument finding, not a silent
pass), the binding gate over assessed days (holderstate bar 3
shape), launch sanity, and the wall numbers. The DIAG bar is
(a)+(b)+(c) only — this arm judges the POOL decomposition,
not a re-judgment of holderstate's completeness.

## AMENDMENTS (before any judged sim — proof-run findings)

**AMENDMENT 1 — census coverage definition (2026-11-21 ~07:10
UTC).** The frozen bar (a) originally required census rows ≥
gameDays−1 per seed. The proof test's live runs show that
definition is unachievable: `daily()` first fires on scholar
day 2 (day 1 never fires) and the trailing `vf.snapshot()` after
`runDays` adds a final daily row (day = gameDays) with no
census row, so the max is gameDays−2 minus any days the
harness skips (day 3 skipped on 106721 at 100d; census 98 vs
gameDays 101). Measured on the 150d probe of screening seed
106731: census 148 rows (days 2–150), daily 149 rows (days
2–151), census days ⊆ daily days, exactly one daily day (151)
without a census row. The bar now requires census day-set C ⊆
daily day-set D with |C| ≥ |D|−1 — the census and the daily
snapshots fire in the same `if (vf && d !== lastSnapDay)` block,
so this is the exact completeness notion. The analyzer's
`censusOk` implements this definition. Nothing else in the bar
changes.

**AMENDMENT 2 — §4 shape-run horizon 100d → 150d (2026-11-21
~07:10 UTC).** Screening seed 106731 forms NO wave-4 plan by
day 100 (0 holder-state rows, 0 pool rows at 100d despite 20
v4seed rows) but 23 pool rows by 150d (378 holder-state rows,
standing 325, maxWave 5, survived). The 100d shape run cannot
validate the pool recorder on this seed. §4 moves to 150d on
the SAME screening seed (the judged horizon); the judged band,
seeds, and substrate are unchanged. The 100d empty-pool result
is itself recorded as evidence that this village's plans form
late — not as an instrument failure.

## Build gate (frozen) + overlap guard

**NO BUILD in this stage unless a named mechanism emerges
with its own frozen GO bar.** This is an instrument/DIAG arm.
A lever build inside this arm is possible ONLY if the
mechanism lives OUTSIDE `villager-brain.js` / `win-plan.js`
AND carries a frozen GO bar written before the build. The
pool filter itself lives in those files, so the EXPECTED
outcome is DIAG + a NAMED next lever (from Leg P8) for a
follow-up run — not a landing. **OVERLAP GUARD (verified
before freezing):** do NOT touch `villager-brain.js` or
`win-plan.js` — held by the sibling arms
(`sim-pinquaddoor-b`, `sim-reseedexpiry-b`), and the
launch-engine lever itself is BLOCKED until the held
branches land. Do NOT touch Loop A's trees/branches
(`sim-leadside-a`, `sim-evadebow-a`). Do NOT touch the held
`sim-holderstate-b` or `sim-pinquaddoor-b` branches (read-only
copy of the approach only).

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — recomputed by the analyzer
from the fresh corpora (not copied). Also the standing-199
stall count.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and real pool
rows (a holder, a day, the members and their first-fails with
names), and read at least one empty-pool day's story end to
end (who the holder is, who was home, who was away and why,
who was one point short of ranger). Judge meaning,
coherence, consequences — never just counts. The evidence
carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **No retroactive classification:** the holderstate 36
   snapshots cannot be re-decomposed at member-gap depth —
   their corpora lack `range` / `awayPurpose` / census
   fields. Only the fresh band is decomposed; the old
   first-fail counts are quoted, never re-derived.
2. **Cache staleness is reported, not repaired:** the gap is
   computed from the LIVE score; if the cached profile is
   stale, the gap describes the live person while the filter
   saw the cached profile. The analyzer flags the count; it
   does not rewrite eligibility.
3. **Away duration units differ by purpose** (expedition
   durations vs objective partsLeft) — the analyzer reports
   raw `awaySinceDay` / `awayDuration` / `purpose` fields
   and does not convert to a common remaining-time unit.
4. **Trust is a snapshot value:** trust moves through
   interaction; the gap is the distance at snapshot time.
5. **The census live profile is a recomputation, not the
   cached profile** the game would use — by design (the
   census must not write the profile cache). Where live and
   cached disagree, the pool rows (cached) govern eligibility
   and the census governs supply.
6. **Branch derivation follows code order** from the sampled
   pre-state; the perception-flag input to
   `vbrainShouldRefresh` is module-internal and unrecorded
   (inherited).
7. **Write flap:** intermittent EPERM on fresh-file writes has
   struck this program repeatedly. Legs tee to
   `evidence/2026-11-21/poolfirstfail-b-legs.log` (fallback
   recovery); writes are probed before they matter and
   verified by size/readback; a blocked final commit leaves
   files on disk intact for coordinator adoption, never forced.
8. **Registry lock contention** was observed by the sibling
   arm at 0330Z (heartbeat blocked on flock held by journey-
   lane processes). Heartbeats are retried periodically; the
   lock file is NOT bypassed and no sibling process is killed.

## Files

- Prereg: `evidence/2026-11-21/sim-poolfirstfail-b-prereg.md` (this file)
- Instrument: `scripts/poolfirstfail-driver-b.js`,
  `scripts/analyze-poolfirstfail-b.js`,
  `scripts/test-poolfirstfail-b.js`
- Corpora (fresh): `evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/`
  (8 files)
- Reproduction corpora (existing, read-only):
  `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8 files)
- Analysis: `evidence/2026-11-21/poolfirstfail-b-analysis.json`
- Evidence: `evidence/2026-11-21/sim-poolfirstfail-b.md`
- Leg log: `evidence/2026-11-21/poolfirstfail-b-legs.log`
- `src/` diff: 0 lines (DIAG, recorder wraps only).
