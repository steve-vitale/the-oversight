# sim-planignite-a — PREREG (binding)

Run: oversight-flesh-out-loop, axis winnability chain, arm
sim-planignite-a — DIAG: why do villages never start a plan?
Instrument-only. No game change, no default flipped. Branch
`sim-planignite-a` (worktree `~/workspace/worktrees/sim-planignite-a`).
Base: master at arm start (worktree HEAD `7bb50f3dc`; the coordinator
rebases at landing and re-runs proofs).
Binding prereg: THIS file — frozen before any judged sim. The
instrument (driver, analyzer, proof test) is built AFTER this commit;
no judged numbers exist yet. Commit this file FIRST
(`scripts/safe-commit.sh "sim-planignite-a: frozen prereg — ..."`),
then build.

## The question, in plain words

HavenTick is the dominant plan creator on master as-is — but on 4 of
8 control seeds in haventick-b (102141, 102144, 102145, 102148) the
plan system never starts at all in 150 days, while the villages
survive, reach wave 5, and slay beasts. The bottleneck is ignition
itself. This DIAG decomposes havenTick plan creation per village per
day and names, for every village that never starts a plan, WHICH
condition blocks it: no heard monster? no eligible holder? a
threshold? a plan exists but never launches? (On haventick-b's band
the empty villages had zero creations of ANY kind, so "a plan exists
but never launches" is not the observed shape — it stays in the
taxonomy as a check, not an assumption.)

## Prior art (read first)

- `evidence/2026-11-16/sim-haventick-b.md` + prereg — the instrument
  this arm EXTENDS (extend `scripts/haventick-driver-20261116.js`,
  `scripts/analyze-haventick-b.js`, `scripts/test-haventick-b.js`;
  don't rebuild). Its §Next diagnostic #1 names this arm ("the gate
  needs its three conditions read against the empty seeds: is it the
  profile, the Haven presence, or the engagement that never lines
  up — or does the village just never have a ranger at Haven at tick
  time?"). Its control leg is the phenomenon under study here; its
  four empty seeds are the shape this arm explains on a fresh band.
- `evidence/2026-11-16/sim-seedpaths-b.md` + prereg;
  `evidence/2026-11-16/sim-poolmarginals-b.md` + prereg;
  `evidence/2026-11-16/sim-companionpool-b.md`;
  `evidence/2026-11-16/sim-launchdef-a.md`.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`,
  `docs/PARTY.md`.
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  havenTick plan creation, companion-pool seed paths, departure
  gates, or the pick lottery (checked 2026-11-16 by haventick-b
  against the `docs/CANON.md` manifest). The evidence file states
  this gap instead of inventing canon.

## Design — the ignition decomposition (frozen)

The creation gate has two layers, both read in code (line numbers
drift daily; the call TEXT is the anchor):

**Layer 1 — the agencyTick loop** (`src/js/villager-agency.js`,
`agencyTick`, once per day-part). Before `winPlanHavenTick` is ever
called for a villager, the loop must NOT `continue` past them, in
this order: not the player; not dead; not `isEngaged` (talking to
the player — stays put); not on expedition (`a.exped[rid]` — an
expeditioner gets `expeditionLeg`/`expeditionReturn` instead and
never reaches havenTick); profile wanderer/explorer (unless a dawn
`party_launch` commit bypasses the profile gate — the PROFILEGATE
rule); `npcNode` at Haven (`nx === hx`, `ny === hy`); not night;
no indoor objective (unless a dawn-brain EXPEDITION commit) and no
`expedition_launch` trigger. Only then is `winPlanHavenTick(rid, hx,
hy)` called.

**Layer 2 — inside winPlanHavenTick** (`src/js/win-plan.js:282`).
Creation (only when no plan exists) additionally requires: at Haven
(re-checked); profile wanderer/explorer; ENGAGEMENT — personally
fought a beast (`agencyState().know[vid].fought` non-empty,
`lived`) OR the village has slain one (`state.villageSlain` has a
count > 0, `heard`). `winPlanHavenTick` is called from exactly one
place (`villager-agency.js:433`, verified in this tree) — the two
layers are the whole creation path.

The driver records, per seed (single control leg, master as-is):

1. `v4creates` + `planCensus` — unchanged from haventick-b (the
   creation ledger; the independent denominator for the ledger
   check). A village is NO-PLAN iff it has zero `v4creates` rows
   over the whole run (no creation of ANY kind).
2. `havenTickCalls` — EVERY `winPlanHavenTick` call (extend the
   haventick wrap, which records creations only): {day, tick, vid,
   profile, lived, heard, foughtN, slainN, planBefore, created}.
   `tick` is the driver's agencyTick invocation counter; a call
   with `tick` null (called from anywhere but agencyTick) is an
   instrument error — haventick-b found the caller is always the
   agency tick, so null must not occur.
3. `tickGates` — a wrap on `agencyTick` that, BEFORE calling the
   original, computes every roster villager's FIRST-FAIL bucket in
   Layer-1 code order (player-skip / dead / engaged / onExped /
   notRanger / notAtHaven / night / indoor / trigger / reached),
   using pure reads only (the profilegate bypass and the indoor
   brain-EXPEDITION exception replicated exactly). Per tick it
   records aggregate counts and the predicted-reached list; per
   seed it records per-villager cumulative totals. After the
   original returns, the wrap compares predicted-reached with the
   `havenTickCalls` actually recorded during that tick and records
   the match in `tickGateChecks` {tick, day, part, predicted,
   actual, match}. A mismatch is an instrument error: the replica
   is validated by the proof test BEFORE any judged sim, and the
   corpus gate (bar 5) requires zero mismatches.
4. `igniteCensus` — end-of-day snapshot (same daily pass as
   planCensus) of EVERY living non-player roster villager: {day,
   vid, profile, temper, goal, age, rangingApt, potential,
   alive, node, atHaven, onExped, away, engaged, foughtN, hasPlan,
   slainN} — the profile INPUTS are recorded alongside the profile
   so the analyzer can name WHY a village has no ranger (e.g.
   cautious −2, goal heal −1, age 58 −2), and the village-level
   heard count (`slainN`, species with count > 0) is recorded per
   day. Plus a per-day village row: {day, slainN, nRangers,
   nRangersAtHaven, nRangersOnExped, havenTickCallsToday,
   creationsToday, firstSlainDay}.
   The player is excluded (agencyTick skips the player); a
   scholar-held plan can only come from a seed path, never from
   havenTick — stated, not assumed.
5. Everything the haventick driver already records (`v4seeds`,
   `v4departs`, `v4gates`, `v4encounters`, dawnbid, companionPool,
   vetSays, deaths, samples, wall fields) is kept unchanged, so
   the corpus stays comparable to haventick-b's control leg
   (cross-band only — different seeds, different base).

All wraps are pure reads plus writes to driver-local arrays — no
game-state writes, no RNG. `npcRangeProfile` is called from the
instrument exactly as `poolReplica` already does on scored dawns
(haventick-b, D1/D2 green there); `a.profiles` is never invalidated
anywhere in `src/js` (verified in this tree), so the cached value
is the value the game itself would compute — and D2 below is the
empirical check that the recorder does not perturb trajectories.

## Blocker taxonomy (frozen — first match wins, per village)

A village is NO-PLAN iff zero `v4creates` rows in 150d. Every
no-plan village gets exactly one named blocker; villages that DO
ignite get `ignited` (with first-creation day/source/creator) for
contrast. Evaluated in this order:

1. `no-ranger` — zero ranger-days in `igniteCensus`: no living
   villager ever profiled wanderer/explorer on any day. (The
   profile inputs in the row name why: the analyzer reports the
   modal profile and its dominant inputs.)
2. `no-engagement` — rangers exist, but heard never true
   (`slainN` 0 on every day — the village never slays a beast)
   AND no ranger ever fought (`foughtN` 0 for all rangers on all
   days). Engagement never becomes true for any ranger.
3. `ranger-never-reaches-haventick` — rangers exist, engagement
   true on some day, but zero `havenTickCalls` for any ranger on
   any day. Sub-blocker = the modal first-fail bucket among
   ranger-ticks in `tickGates` (`onExped` / `notAtHaven` / `night` /
   `indoor` / `trigger` / `engaged`), reported with the full bucket
   distribution so a modal never hides a split.
4. `haventick-called-no-create` — `havenTickCalls` for rangers
   exist but zero creations. Sub-blocker = the modal call outcome
   (`profile-fail` — a non-ranger reaching the call via the
   party_launch bypass — / `engagement-fail`), with the full
   outcome distribution. (`plan-exists` cannot occur for a
   no-plan village: a plan existing implies a creation row.)
5. `unexplained` — none of the above. Unreachable by
   construction; any village landing here FAILS bar 1. (A call
   with ranger profile + engaged + no plan + no creation would
   land here too — the code says it cannot happen; if it does,
   that is the finding.)

## Primary metric + GO bar (frozen)

Primary metric: **classification coverage of no-plan villages** —
the count and share of no-plan villages carrying a named blocker
from the frozen taxonomy, reported per village with its
sub-blocker and distributions.

GO (DIAG GO — instrument valid, table trustworthy) iff ALL hold:

1. **Classification coverage** — every no-plan village classified
   with a named blocker (taxonomy rows 1–4); zero `unexplained`;
   zero unclassified.
2. **Corpus complete** — 8/8 files parse (seeds 102601–102608,
   single control leg, one file per seed).
3. **Neutrality D1/D2 green** — proof test: D1 (recorder ON twice,
   identical full corpora including the new arrays) + D2
   (recorder ON vs OFF, identical trajectories) on the instrument
   tip (seed 102601, 60d).
4. **Proof green** — `scripts/test-planignite-a.js`: static/judge/
   recorder green + D1/D2 + tick-gate replica validation
   (predicted reached == actual called on every tick of the proof
   run) + classifier fixtures (synthetic corpora for each taxonomy
   row, including `unexplained` failing the bar).
5. **Tick-gate replica holds on the corpus** — zero
   `tickGateChecks` mismatches across all 8 seeds.
6. **Creation-ledger check** — every planCensus holder traces to
   a `v4creates` row on/before its first observed day (haventick-b
   bar 2, as written); zero holders without a creation.
7. **Wall numbers reported** (national by standing >=200 AND by
   scaleRank, table, wins, wave 4/5 unlocked, median survival,
   wave-4 kills, deaths).

The VERDICT is the classification table itself: for every village
that never starts a plan, the named blocker. A DIAG GO means the
instrument is valid and the table is trustworthy — not that any
path "wins".

## Seed band (fresh — verified, not reused)

- Band: **102601–102608** (8 seeds), single control leg
  (master as-is; there is no seed call in this arm, so there is
  no instrument leg — nothing to toggle).
- FRESH: `grep -rl "10260[1-8]" evidence/*/sim-*-prereg.md`
  returns nothing (verified 2026-11-16 in this worktree; no prereg
  names any seed in this band). Scope stated: the check covers
  prereg files (`evidence/*/sim-*-prereg.md`), the same scope
  haventick-b used. The band is in no earlier arm's forbidden
  list.
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568 (the poolmarginals
  forbidden list, carried over). Sibling Loop B works band
  102201–102208 — do NOT touch its trees, claims, or band.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  sha `74a890f0844e`, verified in the worktree before this commit).
- Legs: ONE — control (master as-is). No seed call is re-landed
  in this arm; the branch's `src/` is byte-identical to the base
  throughout. The primary leg IS the control leg.
- ZERO src/js game-code change survives on the branch: the
  instrument is driver-side wraps only (pure reads + driver-local
  writes, no RNG, no state).
- Determinism: D1/D2 as in §Primary metric. No D3 (no second leg
  to drift-check against — stated, not skipped silently).

## Sense-testing (mandatory)

Read transcripts. Read the per-village rows as stories: does the
named blocker match what the villagers actually did (a village
that slew beasts at the door but whose rangers were always out on
expedition? a village whose would-be rangers are all cautious
homebodies tending the sick?). One village whose recorded blocker
contradicts the day's narration is a finding, not a rounding
error — name it in the evidence.

## Balanced panel (per docs/MEASUREMENT.md §15 — evaluated, declined)

No balanced panel is run for this DIAG, same as haventick-b,
dawnbid, companionpool, poolmarginals, and seedpaths. The panel
(`scripts/balance-panel.js`) runs fresh multi-policy sims and
compares two panel `.json.gz` files — it cannot compare recorder
corpora, this arm ships no game change and has ONE leg (no
before/after exists to compare), and the prereg bars are the
judge. A panel here would measure fresh-trajectory noise, not
the judged corpus. The neutrality proof (D1/D2) is the panel's
substitute here. Evaluated against §15 and declined for the
stated reason, not silently skipped.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the modal sub-blocker hide a split (a village whose
  ranger-ticks spread across two buckets — report the full
  distribution, don't assume the modal tells the story)?
- Did any wrap miss a creation (a planCensus holder with no
  `v4creates` row)? Name the missed hook.
- Did the tick-gate replica hold on every tick (mismatch count)?
  If any mismatch, what in-loop state change explains it?
- Was 150d the right horizon, or did ignitions cluster at the
  tail (a late ignition on day 140+ says the horizon matters)?
- Did ignited villages on this band reproduce haventick-b's shape
  (cross-band: same policy, different band — report the counts,
  don't assume)?

## Wall numbers (report every run)

National (standing >=200 AND scaleRank), table, wins, wave-4
unlocked, wave-5 unlocked, median survival, wave-4 kills, deaths.
