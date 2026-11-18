# sim-expedroster-b — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-expedroster-b · **Loop B run:** fleshout-loop-b-20261118T0430Z
**Type:** DIAGNOSTIC/TOOLING — a daily `st.exped` snapshot instrument; NO
game-behavior change, no `src/js` change at all.
**Frozen:** 2026-11-18 ~06:50 UTC (before the pilot sweep; the proof test
already ran — it proves the instrument, it is not a judged sim).
**Branch tip:** `sim-expedroster-b` (instrument + proof committed below
this prereg).
**Builds on:** `evidence/2026-11-18/sim-launchquad-trace-b.md` (finding
#2511 answered ALLY-PICK; its "Instrument notes" name this recorder as
the next step) and `evidence/2026-11-18/sim-launchparty-b.md` (the
sibling arm this run; its pilot band 103901–103908 and its autopsy are
the pool reference — read-only, sibling worktree
`~/workspace/worktrees/sim-launchparty-b`).

## Question (finding #2511's unanswered half, tracker blank #4)

The trace proved the meeting party is sensed fresh at the meeting — but
it could NOT answer from the corpus whether launch members actually
share tiles en route, or only a shared destination: no daily expedition
roster exists in any corpus (`daily` rows carry the scholar's party,
not expedition rosters). This arm builds the recorder that snapshots
`st.exped[vid]` daily, runs it on a fresh band, and answers with cited
rows: **do launch members share a node/tile en route (same node on the
same day) or only a shared destination?**

## Instrument (step 1 — recorder-side only)

New driver `scripts/expedroster-driver-b.js` (a copy of the
`fleerepair2-driver-b.js` launch-funnel census instrument in this
worktree, same `v4seeds` / `v4departs` / `v4gates` / `v4encounters`
recorder): at the end of each simulated day, in the same daily block
as the `dawnbidCensus` snapshot and under the same once-per-day guard,
it snapshots every live `st.exped[vid]` entry as one `v4expedRoster`
row — `{day, vid, tx, ty, dist, legs, duration, sinceDay, sincePart,
node:{nx,ny}|null, alive}` — pure reads only (`agencyState().exped`,
`Game.npcNode`, `Game.getPerson` alive check; the same reads the
census block already makes). No hook in `src/js`, no new RNG, no
game-state write, no env-gated game lever. The recorder is therefore
neutral by construction; the proof test's determinism leg (recorder
on vs off, same seed, short horizon, structural fields identical)
is the live check. Row-day convention: the day label is `gday()` at
the end-of-day snapshot — the day whose play just completed — the same
convention as `dawnbidCensus`, so roster rows join `v4departs` /
`v4encounters` rows by `(vid, day)` directly.

Analyzer `scripts/analyze-expedroster-b.js` reuses the tracer's
`launchesForSeed` / `joinLaunch` (imported from
`scripts/trace-launchquad-b.js`, which replicates the analyzer's join
exactly) and classifies every deduped wave-4 launch from its roster
rows over the window `[launchDay, launchDay+21]`:

- **together-en-route** — some day in the window has ≥2 launch
  members with roster rows on the SAME node `(nx,ny)` AND the SAME
  target tile `(tx,ty)` (the target check guards against coincidental
  co-location of villagers on different trips).
- **destination-only** — no together day, but ≥2 launch members each
  have ≥1 roster row sharing the holder's target tile `(tx,ty)` (the
  launch created shared-destination expeditions; the members never
  shared a tile).
- **unknown-with-reason** — otherwise, with the reason named:
  `no-roster-rows` (no member has any row in the window — the launch
  was recorded but no expedition was ever visible),
  `holder-only` (only the holder has rows; companions never departed),
  `no-shared-target` (members have rows but none shares the holder's
  target tile — e.g. a companion kept its own trip),
  `no-overlap` (members share the target but their roster spans never
  cover a common day).

## Primary metric (BINDING, §14) — instrument completeness

1. **Capture rate** = deduped wave-4 launches whose holder has a
   roster row within `[launchDay, launchDay+2]` / all deduped wave-4
   launches. **GO bar: ≥95%.**
2. **Snapshot gaps** = missing days strictly inside any launch
   member's roster span `[firstRosterDay, lastRosterDay]`.
   **GO bar: 0 gaps.**
3. **Join rate** = launched wave-4 meetings (encounters joined to a
   wave-4 launch by the replicated join) classifiable — fighter roster
   row on the meeting day, or a determinable absence reason (fighter
   dead by meeting day per the deaths list, or the fighter's last
   roster day precedes the meeting day, i.e. the expedition had
   ended) — / all launched wave-4 meetings. **GO bar: 100%.**

**GO = all three bars met. A miss on any bar is NO-GO, never
re-scored.** The en-route classification itself is the scientific
answer, reported whatever it is — it is not the GO bar (the
instrument's job is to make the answer observable, not to produce a
particular one).

**Pool floor:** ≥5 deduped wave-4 launches on the band. Below the
floor the pilot is under-powered and the verdict is NO-GO
(METRIC-BROKEN), never a pass on a thin pool.

## Secondary (supporting, not binding)

- En-route classification counts (together-en-route /
  destination-only / unknown-with-reason) with cited roster rows per
  launch.
- Meeting-day tile evidence: for each launched meeting, the fighter's
  roster node on the meeting day (or the absence reason).
- Roster size: total `v4expedRoster` rows, rows/seed, expeditions
  seen (distinct vids with rows).
- Wall numbers from the corpus (national / table / wins, wave 4–5
  unlocks, median survival) — reported every run.

## Cost bar

None — diagnostic instrument, no game change; no guardrail can be
breached by a recorder. (Recorder neutrality is the proof test's
determinism leg, not a sim guardrail.)

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (§10: reachability question, waves
  4–5 / national / table). Dead villages stop simulating (+10d tail
  max).
- **Seeds (fresh 8-seed pilot band): 104201, 104202, 104203, 104204,
  104205, 104206, 104207, 104208.** Freshness check (skill
  local_seed_band_freshness): grepped every `evidence/**/*.md` for
  each seed — 0 hits for all eight; 0 hits in
  `evidence/*/sim-*-prereg.md`; no filename collision (the
  `*10420-*` files under `evidence/2026-10-30/` are the
  contestdeath `10420-M/U/W` labels, a different token, not seeds
  104201+). Rejected collisions: 104001–104008 (fleerepair2 panel
  band, named in `evidence/2026-11-17/sim-fleerepair2-b-prereg.md`);
  104101–104112 (named in sim preregs — launchparty prereg's
  rejection stands). Scope: all of `evidence/` (sim preregs, journey
  preregs, screens), not today only. No standalone
  forbidden/contaminated band list exists in the goal hidden_files.
- **Policies:** competent verbatim. **Substrate (single leg):**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1`, `FIGHTALLY2`
  unset, **`LAUNCHPARTY` unset — measure the world as it is on
  current master** (the sibling arm's fix is not in this arm's
  substrate). `PARTYSIZE4` note (from the launchparty prereg): it has
  NO `src/js` reader on this tip — a driver-side substrate marker,
  not a game lever.
- **Instrument:** driver `scripts/expedroster-driver-b.js`;
  analyzer `scripts/analyze-expedroster-b.js`; per-seed JSONs under
  `evidence/2026-11-18/perseed-expedroster-b/`. No balanced panel
  (§15): single-leg diagnostic with no before/after — there is
  nothing to compare; the panel governs comparisons, and this run
  makes none. Wall numbers come from the corpus directly, as the
  launchquad trace did.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the coordinator
  decides any follow-up from the pilot verdict.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on this substrate —
   the allycap band (103601–103608) yields 10 ctl / 7 arm launched
   meetings per 8 seeds by the same join; the launchparty band
   (103901–103908, same substrate minus LAUNCHPARTY) yields 15
   launched meetings from 17 wave-4+ launches. The pool (~15
   launches/8 seeds) is within an order of the pool floor's needs.
2. **Pool sizing:** see (1). The 5-launch floor guards the thin-pool
   case; a pool below it kills the pilot as METRIC-BROKEN.
3. **Verb existence:** `st.exped` exists (`src/js/villager-agency.js`
   `startExpedition` writes `{tx, ty, dist, legs, sinceDay,
   sincePart, duration, finds, encounters}`); `Game.npcNode` and
   `Game.agencyState()` exist and are already read by the census
   block in the same driver. All reads are pure.
4. **Horizon fit:** launches happen d46–d77 on the prior bands; the
   150d window contains the phenomenon with room.

## The launch-filter trap (frozen rule)

When joining launches, replicate the analyzer's `launchesForSeed`
exactly — wave-4+ launches only (`targetWave >= 4` or target in the
wave-4 list), deduped by `(vid, day)`. The launchquad trace's first
run joined wave-3 hunts and inflated the population 28 vs the frozen
3. The analyzer imports `launchesForSeed` / `joinLaunch` from
`scripts/trace-launchquad-b.js` (which replicates the analyzer's join
exactly) instead of re-implementing them, and the proof test pins the
filter with a fixture (wave-3 filtered, same-day dupes merged).

## Canon note

`docs/CANON.md`, `docs/PARTY.md`, `docs/MONSTER-WAVES.md` read.
PARTY.md covers the PLAYER's party only (System unlock, cap 3→4→5,
travelling leash) — no canon doc covers villager win-plan launch
parties or the sim recorder; this is stated here rather than
inventing canon. The launch/expedition mechanics are cited from code
(`win-plan.js`, `villager-agency.js`, `party-wiring.js`), not from
canon. Finding #2512 (distance/terrain on encounter rows) is OUT of
scope unless it falls out of the same recorder change.

## Metric review (pre-run)

- The capture bar measures the instrument, not the game: a 95%
  prompt-capture bar with a 0-gap bar is strict on purpose — a daily
  snapshot that misses days is not a roster, it is a rumor. If the
  bar proves too strict (e.g. a launch whose holder departs and
  returns within one day-part so no end-of-day snapshot ever sees
  it), that is a METRIC-BROKEN finding for the next run, not a
  re-score of this one — the evidence will name the mechanism.
- The join bar's absence reasons are deliberately narrow (dead, or
  last roster day before the meeting): a meeting whose fighter has no
  roster row and no reason is an instrument miss, not a shrug.
- Risk: the end-of-day snapshot sees positions AFTER the day's legs,
  so a together-day is "together at end of day", not "together at the
  meeting instant". The classification says so explicitly; the
  meeting-day tile evidence is reported separately from the
  en-route verdict, so the two are never conflated.
- Risk: companions double-launched by a second holder (the
  launchparty autopsy's Nadia/Sari case) travel on the second
  holder's tile — the roster shows their true `(tx,ty)`, so the
  classifier will read them as `no-shared-target` against the first
  launch, which is the honest reading of the rows.
