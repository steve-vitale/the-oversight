# sim-launchstate-b — DIAG PREREG, the per-part holder-state recorder (frozen before any judged sim)

**Arm:** sim-launchstate-b, DIAG instrument · **Loop B run:**
fleshout-loop-b-20261122T0130Z, arm 2 of 2 · **Axis:** winnability chain
**Type:** DIAG, instrument-only (recorder + analyzer). No game-code
change, no default flipped, no lever built in this stage.
**Branch:** `sim-launchstate-b` · **Worktree:**
`~/workspace/worktrees/sim-launchstate-b`
**Base at arm start:** master `a0a2bf26d` (verified at arm start:
worktree HEAD `a0a2bf26d...`, `git status --short` empty).
**Frozen:** 2026-11-22 ~02:30 UTC, BEFORE any judged sim.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 first 12 `1884c8852d38` — IDENTICAL to the
holderstate-b / launcheng-b / poolfirstfail-b corpora; verified
live on this base (see below).
**Horizon:** 150d, death-aware. **Band:** 107301–107308 (8 seeds,
fresh — see below).

## The question (finding #2605; launcheng-b's 10 unknown days)

sim-launcheng-b (`evidence/2026-11-20/sim-launcheng-b.md`,
DIAG-NO-GO kind completeness) decomposed the launch engine —
the binding gate is `party-no-companion` on 223/223 assessed
days — but 10 `unknown-no-signal` zero-row days remain (only
skipped mid-day day-parts can explain them). Its named next
instrument item: **a per-part holder-state recorder** (objective
kind/state/clock, `v.away`, `isEngaged`, node, scholar flag) on
a fresh band, to close the 10 unknown days.

Two sibling arms have since built exactly that recorder and run
it on fresh bands:

- sim-holderstate-b (`evidence/2026-11-21/sim-holderstate-b.md`,
  DIAG-GO): closed the 10 launcheng unknown days in substance
  (all `hs-gate-pick`, skipped-parts mechanism DENIED) on band
  106721–106728, and left the pool decomposition open.
- sim-poolfirstfail-b (`evidence/2026-11-21/sim-poolfirstfail-b.md`,
  DIAG-NO-GO on the anchor label only): decomposed the pool on
  band 106731–106738 (138 snapshots, 0 unclassified) — but its
  H taxonomy left **2 `hs-unexplained` days + 1
  `retarget-seed-row-missing` churn closing** unexplained:
  seed 106736 `thabo_maseko` (eater) d123/d125 — the holder IS
  the scholar, idle/done all day, never reached refresh, commit
  stale from d122; H has no class for a scholar-holder who sits
  idle and is never re-picked — and seed 106738
  `app_mgpsphpp716` (strike) churn closing, the retarget seed
  row absent.

This arm runs the per-part holder-state recorder on a FRESH
band with the anchor defect fixed and the two taxonomy gaps
closed (Leg S + H extensions, below), and judges completeness
over every holder-day AND every holder-day-part. The
launch-engine LEVER (let a trusted villager actually at Haven
stand as a wave-4+ companion) is NOT built here: it lives in
`villager-brain.js` / `win-plan.js` and is BLOCKED on the held
`sim-pinquaddoor-b` branch (see overlap guard).

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-20/sim-launcheng-b.md` + prereg (+
  CORRECTION 2026-11-21) — the 10 unknown days, the day-level
  Taxonomy B', the phase-drift correction, the named instrument
  item. The 10 days: 106241 `visjoin_91` d97, d103; 106243
  `visjoin_116` d122; 106246 `visjoin_125` (strike) d129, d131,
  d135; 106246 `visjoin_96` (editor) d146; 106247 `david_kim`
  (eulogy) d72; 106247 `fatima_hassan` (reunion) d98; 106247
  `app_mgpspki2526` (spoiler) d127.
- `evidence/2026-11-21/sim-poolfirstfail-b.md` + prereg — the
  holderstate recorder this arm copies, the H taxonomy, the 2
  `hs-unexplained` scholar-idle days + 1 missing churn
  closing, and the ANCHOR lesson (§1): the driver stamped
  `anchorCommit` as run-time `git rev-parse HEAD`
  (`38692c34c`, the instrument commit) instead of the frozen
  base (`df40fced1`), failing the analyzer's substrate bar on
  a label alone while `git diff df40fced1 HEAD -- src/` was
  EMPTY. The fix is frozen below (anchor = merge-base, plus a
  proof-test anchor assertion).
- `evidence/2026-11-21/sim-holderstate-b.md` — DIAG-GO on the
  holderstate instrument (36 snapshots, 55/74 binding gate).
- `docs/CANON.md`, `docs/PARTY.md` — read first. PARTY.md
  covers the SCHOLAR's party, not the villager companion pool.
  No canon doc covers the villager companion-pool filter or
  the launch engine (CANON GAP, inherited): both are grounded
  only in code, read before freezing (below).
- `docs/MEASUREMENT.md` §§9–12, 14–15 — staged seeds,
  death-aware horizons, pre-registration, metric binding,
  balanced panels (N/A for a DIAG arm: no before/after).

## The per-part skip mechanics, read from code before freezing

`objTick` (`src/js/villager-objectives.js:1764-1914`) runs once
per day-part per villager, in this skip order (first match
skips the whole tick for that villager that part):

1. scholar — `if (rid === this.villagerId) continue;` (:1783).
   The scholar NEVER runs the villager brain, so a holder who
   has become the scholar can never be scored at any part,
   whatever their objective says.
2. dead — `vp.dead` skip.
3. engaged — `if (this.isEngaged(rid)) continue;` (:1783) —
   mid-day conversation.
4. on expedition — agency `exped[rid]` rewrites the objective
   to EXPLORE/out and `continue`s.
5. away — `if (away) continue;` — the away machinery owns them.
6. off-Haven — `if (!node || node.nx !== hx || node.ny !== hy)
   continue;` — away-return in progress.
7. refresh gate — mid-day `objRefreshPick` only when the
   commit is stale or a perception flag fired
   (`vbrainShouldRefresh`, `src/js/villager-brain.js:796`:
   dawn/force → true; stale commit → true; perception flag →
   true; else false = refresh-blocked); dawn force-refreshes.
8. chore lives — an indoor objective with `partsLeft > 0`
   decrements and the holder is not re-picked that part.

`vbrainScorePick` (`src/js/villager-brain.js:905`) is the only
scoring entry; the recorder wraps it, so a `dawnbidScores`
row exists for (vid, target) at (day, part) IFF the holder was
scored that part. A hard gate (`vbrainLogGate`) bypasses
scoring with a gate pick, recorded in `holderGatePicks`.

## Band freshness (verified 2026-11-22, before this prereg)

Candidate band 107301–107308. Search scope per the
`local_seed_band_freshness` skill: (1) `grep -rhoE
"10[67][0-9]{3}" evidence/*/sim-*-prereg.md` (full list,
sorted — max named seed 107296); (2) `grep -rE "1073[0-9]{2}"
evidence/ --include="*.md"` — ZERO hits anywhere in
`evidence/` (no prereg, sim note, or other .md names any
1073xx seed); (3) the named bands in the task brief verified
by that grep (107271–107282 tier4pool, 107261–107268
killlootbundle, 107241–107248 shelterdraft, 107237–107244
grantrate — all present in the prereg grep, all avoided).

- **107301–107308 FRESH.** Zero hits in every scope: no prereg,
  sim note, script, or corpus dir names any of 107301–107308.
- Already-used bands NOT reused: 106181–106188 (dmgshape-b);
  106211–106218, 106221–106228, 106231–106238 (strikeband-b);
  106241–106248 (strikeband4-b / launcheng-b); 106251–106258
  (sense3-b); 106501–106516 (pinquaddoor-wide-b);
  106601–106616 (reseedexpiry); 106701–106716
  (pinquaddoor-reprereg-b); 106721–106728 (holderstate-b);
  106729–106736 (dmgpin-reprereg-b); 106731–106738
  (poolfirstfail-b); 106751–106766 (profilegate-confirm-b);
  107051–107058 (cellgate-a); 107091–107098 (fibersupply-a);
  107111–107118 (lendpool-a); 107237–107244 (grantrate-a);
  107241–107248 (shelterdraft-a); 107261–107268
  (killlootbundle-a); 107271–107282 (tier4pool-a);
  107281–107296 (killlootfixture-a — a 16-seed band named in
  its prereg; the 10728x–10729x range is taken through 107296).

## Base-identity check (verified before freezing)

- Worktree HEAD = master tip `a0a2bf26d` (`git log --oneline
  -1`, `git status --short` empty); `git merge-base HEAD
  master` = `a0a2bf26d` (no master movement at arm start).
- Policy sha verified live on this base: `sha256sum
  scripts/policies/competent.js` first 12 = `1884c8852d38`
  (identical to holderstate / launcheng / poolfirstfail).
- ALLYSLOT3 absent from `src/js` on this base (driver asserts
  the ENV flag is set, asserts src ABSENCE, records
  `allyslot3InSrc: false` — same as the survey prereg).
- The launch/bid path files (`villager-brain.js`,
  `win-plan.js`, `villager-objectives.js`,
  `villager-agency.js`) are NOT diffed against the
  poolfirstfail base here: this arm re-measures on the current
  base and reports its own numbers; comparability with
  poolfirstfail rests on the identical substrate (same 7 flags,
  same policy sha) and the recorder being behavior-identical,
  not on byte-identity of the game code.

## Substrate (env flags — identical to holderstate-b / poolfirstfail-b)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim, 150d death-aware, one leg (recorder ON),
MODE=vre. **ZERO `src/js` changes in this arm.**

## Instrument (recorder copy + extended analyzer; driver wraps only)

- `scripts/launchstate-driver-b.js` — a copy of
  `scripts/poolfirstfail-driver-b.js` (itself a copy of the
  held `scripts/holderstate-driver-b.js` — the proven
  per-part holder-state recorder: one row per live wave-4
  plan holder per day-part at part-start / tick-entry /
  tick-exit, carrying objective kind/state/partsLeft, `away`,
  `engaged`, node, haven, `onExped`, `isScholar`, `dead`,
  commit; plus `holderGatePicks` and the `dawnbidScores`
  per-part scoring rows) with ONLY these changes: header
  comment, arm/run `launchstate-b` (out object + file names
  `launchstate-b-s<seed>`), stop-message prefix
  `LAUNCHSTATE`, driver-filename strings in
  `firstCallerFrame`/`fightOrigin`, the usage line re-seeded
  to 107301–107308, `EVIDENCE_DATE` default `2026-11-21`,
  OUTDIR `perseed-launchstate-b-107301-107308`, PLUS the
  ANCHOR FIX (below). All recorder logic — wraps, pool
  replica, `rangeScoreOf`, `poolCensus`, holder-state sampler,
  launch tracker — byte-identical in behavior.
  - **ANCHOR FIX (frozen):** the driver records
    `anchorCommit` as `git merge-base HEAD master` (the frozen
    base the corpora ran under), NOT run-time HEAD; it ALSO
    records `anchorHead` = `git rev-parse HEAD` for
    transparency. The driver REFUSES to run (exit 2) if the
    merge-base's first 12 chars are not `a0a2bf26d` — a
    stale-base tripwire, not a silent label. The analyzer
    asserts `anchorCommit` slice(0,12) == `a0a2bf26d` on every
    corpus; the proof test asserts the anchor on its live run
    (§5) so this class of miss is caught before the judged leg.
  - Corpus: `evidence/2026-11-21/perseed-launchstate-b-107301-107308/`
    (8 files).
- `scripts/analyze-launchstate-b.js` — a copy of
  `scripts/analyze-poolfirstfail-b.js` with ONLY these
  changes: header, arm/run `launchstate-b`, EXPECTED seeds
  107301–107308 + anchor12 `a0a2bf26d`, output
  `evidence/2026-11-21/launchstate-b-analysis.json`, Leg P
  REMOVED (the pool decomposition is already judged by
  poolfirstfail-b — not re-judged here), Leg R KEPT
  (reproduction of the 10 launcheng unknown days on the
  existing corpora — validates the copy), PLUS Leg S (below)
  and the H extensions (below). Taxonomy A + B' and the
  launch accounting are reused VERBATIM — their definitions
  are not re-decided here.
- `scripts/test-launchstate-b.js` — proof (mirrors
  `scripts/test-poolfirstfail-b.js`): §1 static (files exist,
  no `src/js` diff, substrate constants) + §2 analyzer
  selftest green + §3 fixture end-to-end (Leg S + the two new
  H classes on a synthetic corpus) + §4 live 150d shape run
  on screening seed 107301 (holder-state rows, pool rows,
  census rows, per-part ledger non-empty) + §5 D1/D2 at 30d
  on 107301 under the full substrate (repeatability +
  recorder neutrality) + §6 anchor assertion (the live run's
  `anchorCommit` slice(0,12) == `a0a2bf26d` and `anchorHead`
  is the run-time HEAD — the poolfirstfail lesson, now
  proof-caught).

## Leg S — per-part scored-ness ledger (frozen, NEW in this arm)

Run over the fresh corpora, for every instance-day in the
window of every candidate-not-bid and churned instance. For
each day-part p in 0–3:

- `scored` = a `dawnbidScores` row exists for (vid, target)
  that day+part (the wrap proves scoring happened).
- If not scored, `whyNot` from the tick-entry holder-state
  row for that part, first match in `objTick` code order:
  `scholar` / `dead` / `engaged` / `away` / `on-expedition` /
  `off-haven` / `chore-live` (indoor objective, partsLeft > 0,
  no refresh opportunity — the holder is living the chore) /
  `refresh-blocked` (objective done/idle at a part the holder
  REACHED, commit from today — `vbrainShouldRefresh` refused)
  / `gate-pick` (a `holderGatePicks` row that part — the pick
  bypassed scoring) / `no-rows` (no holder-state row that part
  — a coverage gap, counts UNEXPLAINED).
- A part is EXPLAINED iff scored or `whyNot` is a named
  mechanism; the ledger reports per-part coverage (parts
  total / scored / explained-not-scored / unexplained) and
  the per-part `whyNot` tally, beside the day-level B' + H
  table. The ledger is the instrument's answer to "for each
  day-part, was this holder scored, and why not" — it judges
  completeness over ALL instance-day-parts, not only over
  unknown days, so bar (a) cannot pass vacuously on a band
  with few unknown days.

## H extensions (frozen, NEW in this arm)

Taxonomy H (poolfirstfail) applies to B'-unknown days only;
the B' reasons in `zeroRow[]` are never rewritten. Two new
classes, checked in this order (after the gate-pick check,
before the per-part ledger fallthroughs):

- `hs-scholar-idle` — the holder-state rows show `isScholar`
  at EVERY sampled tick-entry part of the day (≥1 sampled
  part) and NO part shows `isScholar` false, with no score
  row and no gate row that day. Mechanism: `objTick` skips
  the scholar at every part (`villager-objectives.js:1783`),
  so a scholar-holder can never be scored, whatever the
  objective says — this closes the B' day-1 gap (B'
  `holder-scholar` needs scholar today AND yesterday, so the
  day a holder BECOMES scholar, and any day with a missing
  daily scholar row, escapes it) and the poolfirstfail
  thabo_maseko shape (d123/d125). The objective state is
  reported in the trace, not a condition. EXPLAINED.
- Churn closing fallback (in `classifyChurn`, after the
  frozen retarget search finds nothing): (a)
  `retarget-seed-row-any-stage` — the earliest `v4seeds` row
  (wave ≥ 3, as recorded) with day > seedDay and a different
  target, any `stageAfter` (the frozen filter's gear/party
  restriction was arbitrary — the seed row itself is the
  retarget evidence); (b) `retarget-observed-holderstate` —
  the earliest holder-state row for the vid with a different
  target on a day > seedDay (the plan target changed in the
  sampled state — direct evidence). Either closes the churn
  with evidence; if neither exists,
  `retarget-seed-row-missing` stays UNKNOWN.

`hs-unexplained` and `hs-no-rows` stay unknown for the
completeness bar, as before; per-part `no-rows` parts stay
unknown too. The perception-flag input to
`vbrainShouldRefresh` is module-internal and unrecorded
(inherited): a reached refresh with a STALE commit and no
score/gate row is `hs-unexplained`, never assumed.

## Primary metric (frozen)

Classification completeness over the fresh band: 0 unknown
across all candidate-not-bid + churned instance-days (B' +
H-extended), AND 0 unexplained parts in the Leg S per-part
ledger — plus Leg R reproducing the 10 launcheng unknown days
exactly on the old corpora.

## DIAG-GO BAR (frozen — a miss is NO-GO, never re-scored)

The diag is **DIAG-GO** only if ALL of these hold:

(a) **Completeness:** 0 unknown across all instance-days on
    the fresh band (B' reasons + H reasons incl. the two new
    classes; churn closings present) AND 0 unexplained parts
    in the Leg S per-part ledger.
(b) **Leg R reproduction:** the analyzer run over the EXISTING
    strikeband4 corpora reproduces the 10 launcheng
    unknown-no-signal days exactly (same seed/vid/target/day
    list) — the copy is faithful.
(c) **Instrument validity:** proof test
    `scripts/test-launchstate-b.js` green; analyzer selftest
    green; analyzer run on the real band dir parses 8/8 files,
    0 instrument errors, substrate assertions pass (policy sha
    `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: false`,
    anchor base `a0a2bf26d`).

REPORTED BUT NOT GATING the verdict: the binding gate over
assessed days (holderstate bar-3 shape), launch sanity (all
wave-4-target launches accounted, 0 no-start-call, 0
no-copy-link), and the wall numbers. The DIAG bar is
(a)+(b)+(c) only — this arm judges the RECORDER's
completeness, not a re-judgment of the pool or the gate.

## Build gate (frozen) + overlap guard

**NO BUILD in this stage.** This is an instrument/DIAG arm.
The named next lever (let a trusted villager actually at
Haven stand as a wave-4+ companion) lives in
`villager-brain.js` / `win-plan.js`, held by the sibling arms
(`sim-pinquaddoor-b`, `sim-reseedexpiry-b`), and the lever
itself is BLOCKED on the held `sim-pinquaddoor-b` branch. Do
NOT touch `villager-brain.js`, `win-plan.js`,
`villager-objectives.js`, or `villager-agency.js`. Do NOT
touch Loop A's trees/branches. Do NOT touch the held
`sim-holderstate-b` / `sim-poolfirstfail-b` /
`sim-pinquaddoor-b` branches (read-only copy of the approach
only).

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — recomputed by the analyzer
from the fresh corpora (not copied). Also the standing-199
stall count.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and read at
least two holder-days end to end from the per-part ledger —
one scored day and one skipped day — saying in plain words
what the holder did at each part and whether the recorder's
story matches what the sim actually did. Judge meaning,
coherence, consequences — never just counts. The evidence
carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **No retroactive classification:** the 10 launcheng unknown
   days cannot be re-classified from their own corpora — the
   strikeband4 recorder never sampled per-part holder state.
   Only the fresh band is classified at per-part depth; the
   old 10 are reproduced (Leg R), never re-derived.
2. **Perception flag unrecorded** (inherited): a reached
   refresh with a stale commit and no score/gate row stays
   `hs-unexplained`.
3. **Target matching is by TYPE, not instance** (inherited):
   a first fight against "the target" may be against a
   different individual of the target species.
4. **Day granularity:** a same-day fight may precede the
   launch within the day (the family's convention, kept).
5. **The analyzer reuses frozen classifiers** (`classifySeed`,
   `funnelForSeed`, `launchesOf`/`firstFight`) — their
   definitions are not re-decided here except for the frozen
   §7.3 launch-counting decision (inherited) and the two H
   extensions above, which are explicitly flagged wherever
   they change a count vs the frozen taxonomy.
6. **Write flap:** intermittent EPERM on fresh-file writes has
   struck this program repeatedly. Legs tee to a legs log
   (fallback recovery); writes are probed before they matter
   and verified by size/readback; a blocked final commit
   leaves files on disk intact for coordinator adoption, never
   forced.
7. **Anchor scope:** the merge-base anchor is the frozen base
   only while this branch forks from `a0a2bf26d` with no
   merges; a rebase onto a newer master changes the
   merge-base and the driver refuses — by design (re-freeze
   then, don't amend silently).

## Files

- Prereg: `evidence/2026-11-21/sim-launchstate-b-prereg.md` (this file)
- Instrument: `scripts/launchstate-driver-b.js`,
  `scripts/analyze-launchstate-b.js`,
  `scripts/test-launchstate-b.js`
- Corpora (fresh): `evidence/2026-11-21/perseed-launchstate-b-107301-107308/`
  (8 files)
- Reproduction corpora (existing, read-only):
  `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8 files)
- Analysis: `evidence/2026-11-21/launchstate-b-analysis.json`
- Evidence: `evidence/2026-11-21/sim-launchstate-b.md`
- Leg log: `evidence/2026-11-21/launchstate-b-legs.log`
- `src/` diff: 0 lines (DIAG, recorder wraps only).

## AMENDMENT 1 — Leg S part-level fallback rules (2026-11-22 ~02:50 UTC, before any judged sim)

The frozen Leg S text derives whyNot from the tick-entry
holder-state row, with `no-rows` for a missing row. Reasoning
through the ledger before building shows `no-rows` would fire
BY CONSTRUCTION on four day shapes the day-level taxonomy
already names — the ledger would then fail bar (a) on nearly
every instance regardless of recorder quality. The ledger is
amended with four part-level fallbacks, applied in this order
BEFORE `no-rows`, each named by the same mechanism the
day-level taxonomy already uses for that day:

- `seed-day` — the part is on the instance's seed day AND no
  holder-state row exists for (vid, target) that part. The
  sampler only records LIVE wave-4 plans; the plan did not
  exist until the seeding fight that day, so pre-seed parts
  cannot score. Counted separately in the band aggregation
  (`sSeedDayParts`), so a reader can see how many ledger
  parts ride on it.
- `retargeted` — a holder-state row exists for the vid that
  day+part with a DIFFERENT target, or a `v4seeds` row exists
  for the vid that day with a different target. The plan
  retargeted; this instance's target is no longer the holder's
  plan that part.
- `dead` — a death row exists for the holder on or before that
  day. The holder is dead; no scoring is possible (B'
  `holder-dead`, same evidence).
- `plan-deleted` — no holder-state row for (vid, target) that
  part AND no `dawnbidCensus` row for the vid that day. The
  plan no longer exists (B' `plan-not-in-census`, same
  evidence). Caveat: a retarget to a wave-3 target also leaves
  no census row (the census records wave-4 plans only), so a
  `plan-deleted` part on a day with no retarget evidence may
  be a wave-3 retarget, not a deletion — the evidence says so
  wherever it occurs.

`no-rows` now means only: no holder-state row, no other-target
row, no retarget seed row, the holder alive, a census row
exists — a genuine coverage gap, still UNEXPLAINED. Nothing
else in Leg S changes; the bar (0 unexplained parts) is
unchanged.

## CORRECTION 2026-11-22 (appended after the proof run — the frozen body above is not rewritten)

The proof test (`scripts/test-launchstate-b.js`, first run
2026-11-22 ~03:00 UTC, 40 passed / 3 failed) caught a literal
error in this prereg: four places state a 12-character
comparison against the 9-character short hash `a0a2bf26d`
(the ANCHOR FIX bullet: "the merge-base's first 12 chars are
not `a0a2bf26d`"; "the analyzer asserts `anchorCommit`
slice(0,12) == `a0a2bf26d`"; the analyzer line: "EXPECTED seeds
107301–107308 + anchor12 `a0a2bf26d`"; the §6 note: "`anchorCommit`
slice(0,12) == `a0a2bf26d`"). A 12-character slice can never
equal a 9-character literal, so the driver's refuse check and
the analyzer's substrate check could never pass as written —
the same latent shape as the poolfirstfail anchor miss, in the
opposite direction (a too-short literal instead of a wrong
commit). The base commit itself is UNCHANGED
(`a0a2bf26d` = `a0a2bf26dbfa…`, verified live: `git merge-base
HEAD master` = `a0a2bf26dbfa…`); the correction is that all four
literals read **`a0a2bf26dbfa`** (the merge-base's first 12
characters). The driver (`FROZEN_BASE12`), the analyzer
(`EXPECTED.anchor12`), and the proof test (§3 fixture, §6 live
check) are corrected to match. The proof test's other two
failures were the same literal in test form (§3 substrate,
§6 live anchor); its third failure (§1 overlap guard) was the
test checking for the string `OVERLAP GUARD`, which this
prereg states lowercase ("overlap guard") — the test is
corrected to the prereg's actual wording. No bar, band,
substrate, or instrument behavior changes; the corrected
proof test is re-run before the judged leg.

## CORRECTION 2026-11-22 — coordinator re-freeze at landing (appended by the coordinator; the frozen body above is not rewritten)

At landing the branch was rebased onto master `4266e6cce` (the doorflee2 merge, which
landed the pinquad/dmgpin/ALLYSLOT3 port + DOORFLEE2 in src/js). The proof test
`scripts/test-launchstate-b.js` then failed 3 checks — all three are anchor pins
tied to the old base, not measurement defects:

1. §1 src/js diff `a0a2bf26d..HEAD` is non-empty because the doorflee2 merge
   legitimately changed src/js between the frozen pilot base and the new HEAD.
   The arm itself touches zero src/js (`git diff 4266e6cce..HEAD -- src/` empty).
2. §6 live anchor expected `a0a2bf26dbfa`; the driver records the merge-base at
   run time, which is now `4266e6ccef2a`.
3. Substrate self-description expected `allyslot3InSrc false`; ALLYSLOT3 is now
   in src/js via the doorflee2 port, so the live run honestly reports true.

The three checks are re-pointed at the merge-base (computed, not a new literal)
and the substrate expectation is updated to true, each check's intent preserved.
The frozen pilot record is UNCHANGED: the judged corpora stay anchored at
`a0a2bf26d`, `FROZEN_BASE12` / `EXPECTED.anchor12` / the §3 fixture keep the
`a0a2bf26dbfa` literal, and no bar, band, substrate, or instrument behavior
changes. The corrected proof test is re-run before the merge.
