# sim-launchfield-refreeze-b — DIAG PREREG, fresh-band re-judge of the launchfield recorder (frozen before any judged sim)

**Arm:** sim-launchfield-refreeze-b, DIAG instrument · **Loop B run:**
fleshout-loop-b-20261122T1330Z, arm 2 of 2 · **Axis:** winnability chain
**Type:** DIAG, instrument-only (port of the held launchfield-b
instrument + analyzer fallback + proof test). No game-code change,
no default flipped, no lever built in this stage.
**Branch:** `sim-launchfield-refreeze-b` · **Worktree:**
`~/workspace/worktrees/sim-launchfield-refreeze-b`
**Frozen base:** master `bda6ff495513688fc1680d671d1e019013dd7a9a`
(`bda6ff495513`), the current master tip at freeze time (verified at
arm start: worktree HEAD `bda6ff495513688fc1680d671d1e019013dd7a9a`,
`git merge-base HEAD master` identical, `git status --short`
empty).
**Frozen:** 2026-11-22 ~13:51 UTC, BEFORE any judged sim.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 first 12 `1884c8852d38` — IDENTICAL to the
holderstate-b / launcheng-b / poolfirstfail-b / launchstate-b /
launchfield-b corpora; verified live on this base (see below).
**Horizon:** 150d, death-aware. **Band:** 107383–107390 (8 seeds,
fresh — see below).

## The question (fresh-band re-judge of the held launchfield-b DIAG-GO)

sim-launchfield-b (`evidence/2026-11-22/sim-launchfield-b.md`,
DIAG-GO) judged the per-part field-encounter fallback complete on
band 107321–107328: 0 unexplained parts of 464, Leg R reproducing
the 10 launcheng unknown days exactly, proof 52/52, selftest 71/71.
It was HELD, never landed: the 0930Z adoption confirmed the hold
because the prereg's §7 Amendment rule requires `src/` EMPTY to
re-freeze and `src/js` had moved, so a band re-run would be a NEW
judgment, not a landing.

The open question, stated plainly: on the frozen band the new
field-encounter fallback fired **0 times** — the verdict rested on
the completeness ledger (0 unexplained parts of 464) plus a staged
fixture, NOT on fresh-band field-encounter attribution. This arm
judges, on a FRESH band: (a) completeness still holds (0
unexplained Leg S parts), (b) the field-encounter fallback fires
on fresh-band field encounters.

**§7 scope, stated explicitly:** the §7 re-freeze rule governs
re-running the SAME judgment (same band, same bar) after master
moves. This arm is a FRESH judgment on a FRESH band with its own
frozen base — a new arm, not a re-run of the held judgment — so no
amendment applies and none is recorded. If master moves after this
prereg freezes, the §7 rule applies to THIS arm's judgment in the
usual way (re-freeze deliberately, never amend silently).

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-22/sim-launchfield-b.md` + prereg (read from
  the held branch `sim-launchfield-b`, read-only — never checked
  out for writing, never rebased, never committed to) — the
  DIAG-GO verdict, the 0/464 completeness ledger, the supply
  statement (fallback fired 0 times on band 107321–107328), the
  §3b old-band regression closing the 2 launchstate parts, the
  re-freeze record, and the flap/incident log. Taxonomy H there
  carries the two launchstate classes (`hs-scholar-idle` + the
  churn-closing fallback `retarget-observed-holderstate`).
- `evidence/2026-11-21/sim-launchstate-b.md` + prereg — the
  2-part failure the fallback was built to close (107305 d150 p3,
  `devon_okafor`/`reunion` + `benoit_lambert`/`eulogy`, both
  `suburb`/`vFlee` field encounters).
- `docs/CANON.md`, `docs/PARTY.md` — read first. PARTY.md covers
  the SCHOLAR's party, not the villager companion pool. No canon
  doc covers the villager companion-pool filter or the launch
  engine (CANON GAP, inherited): both are grounded only in code,
  read before freezing.
- `docs/MEASUREMENT.md` §§9–12, 14–15 — staged seeds,
  death-aware horizons, pre-registration, metric binding,
  balanced panels (N/A for a DIAG arm: no before/after).

## The per-part field-encounter fallback (frozen, ported verbatim from the held arm)

In `perPartWhyNot`, in the no-tick-entry-row branch, AFTER the
AMENDMENT 1 fallbacks (seed-day / retargeted / dead /
plan-deleted) and BEFORE `no-rows`, a part classifies
`field-encounter` (EXPLAINED) iff ALL of these hold:

1. No tick-entry holder-state row for (vid, target) at (day, part).
2. No other-target holder-state row for the vid at (day, part),
   and no `v4seeds` retarget row for the vid that day (else
   `retargeted` — checked earlier, unchanged).
3. Holder alive on/before that day (death check earlier).
4. Not the instance's seed day (checked earlier).
5. A `dawnbidCensus` row exists for the vid that day (the plan is
   live — else `plan-deleted`).
6. A `v4encounters` row exists with `vid` == the holder AND `day`
   == the part's day (vid+day match). The vid match uses the same
   `encountersByVidDay` map as the day-level `field-encounter-day`
   reason (vid as primary fighter OR ally), so the two levels
   agree on what counts as an encounter for a vid.
7. Haven-rows-absent for THIS part but Haven-present elsewhere
   that day: at least one holder-state row for the vid on that day
   at a different part with `haven === true`. The holder was at
   Haven that day; the recorder samples inside `objTick` at Haven,
   so a missing part with a same-day encounter is the consumed
   part.

Attribution is **day-match + Haven-rows-absent**: the encounter
rows carry NO part field, so the part is attributed by
elimination, never by a recorded part. The encountered monster
(`mid`) need NOT be the plan target (107305 d150: both holders
met `suburb` while holding `reunion`/`eulogy` plans). The first
encounter row is attached to the ledger part as `enc: {mid,
outcome, origin}` for the trace.

If EITHER condition 6 or 7 fails, the part stays `no-rows`
(UNEXPLAINED) — do not force-attribute. In particular: an
encounter row for a DIFFERENT vid that day does not attribute,
and an encounter with no Haven holder-state rows for the vid
that day does not attribute (the holder may have been away —
the day-level taxonomy handles that shape). `field-encounter`
is EXPLAINED (not in `S_UNEXPLAINED`); `no-rows` and
`refresh-unexplained` stay unexplained, as before.

AMENDMENT 1 (inherited from sim-launchstate-b): Leg S part-level fallback rules — the frozen order is now seed-day /
retargeted / dead / plan-deleted / field-encounter / no-rows.
Nothing else in Leg S changes; the bar (0 unexplained parts) is
unchanged.

## ANCHOR PIN (frozen, ported verbatim from the held arm — the §6 fix)

The launchstate §6 proof compared the recorded anchor against
the same run-time `git merge-base HEAD master` computation that
produced it — a tautology: the anchor silently followed the
landing rebase (`a0a2bf26dbfa` → `4266e6ccef2a`) and the proof
could not catch the move. The fix is a real code change, not a
proof edit:

- The driver records `anchorCommit` as the FROZEN BASE literal
  `bda6ff495513688fc1680d671d1e019013dd7a9a` (`FROZEN_BASE12`
  `bda6ff495513`) — NEVER a run-time merge-base. `anchorHead`
  still records run-time HEAD for transparency.
- The driver still REFUSES to run (exit 2) unless the run-time
  merge-base IS the frozen base (stale-base tripwire, never a
  silent label) — but the recorded anchor no longer depends on
  that computation. Re-freeze deliberately, never amend silently.
- The proof test §6 asserts the live run's `anchorCommit`
  EQUALS the frozen literal (and `anchorHead` equals run-time
  HEAD), and §6b fires the tripwire live: the driver CLI run
  against a git shim answering `merge-base` as `4266e6ccef2a`
  (a real base that differs from the frozen base) must STOP exit
  2 with the merge-base message.

## Band freshness (verified 2026-11-22, before this prereg)

Candidate band 107383–107390. Search scope per the
`local_seed_band_freshness` skill: (1) `grep -rhoE
"10[67][0-9]{3}" evidence/*/sim-*-prereg.md` (full list,
sorted — max named seed 107366, the leadgate-a band
107359–107366); (2) `grep -rE "10738[0-9]" evidence/
--include="*.md"` — ZERO hits (no prereg, sim note, or other
.md names any 10738x seed); (3) `grep -rE
"107383|...|107390" evidence/ --include="*.md"` — ZERO hits;
(4) `grep -rE "10738[0-9]" scripts/ evidence/
--include="*.js" --include="*.json" -l` — 10 files, EACH
INSPECTED and all false positives (non-seed numbers:
`"pantryFreshAfter": 107386` and `107380` kcal values in the
2026-10-16 crumbdefault census JSONs; `"pantry": 107382` kcal
values in the 2026-10-19 perseed armor/scholar/raid leadfeast
JSONs) — none is a seed, a band naming, or a reservation.

- **107383–107390 FRESH.** Zero namings in every scope: no
  prereg, sim note, script, or corpus dir names any of
  107383–107390 as a seed band.
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
  107281–107296 (killlootfixture-a); 107301–107308
  (launchstate-b); 107313–107320 (killrate-a);
  107321–107328 (launchfield-b AND gunlife-a); 107329–107336
  (journey endgame r267); 107359–107366 (leadgate-a).

## Base-identity check (verified before freezing)

- Worktree HEAD = master tip `bda6ff495513688fc1680d671d1e019013dd7a9a`
  (`git rev-parse HEAD`, `git merge-base HEAD master` identical,
  `git status --short` empty). Main-tree master tip identical
  (`bda6ff495`, sim-scale-onramp-round-1115).
- Policy sha verified live on this base: `sha256sum
  scripts/policies/competent.js` first 12 = `1884c8852d38`
  (identical to holderstate / launcheng / poolfirstfail /
  launchstate / launchfield).
- ALLYSLOT3 IS in `src/js` on this base (doorflee2 merge port:
  `fieldFights.js`, `game.js`, `party-wiring.js`,
  `villager-agency.js`). The driver records
  `allyslot3InSrc: true` on every corpus and refuses to run if
  the flag is absent from src/js.
- `src/` HAS moved since the held judgment's base (`4681e740f`
  → `bda6ff495`: `src/js/convo-wants.js` +44, `fieldFights.js`
  +35, `villager-agency.js` +43; 111 insertions, 11 deletions —
  journey-scale r250, hpgate-b, crossvoice-a, leadgate-a
  landings). That move is WHY this is a fresh judgment, not a
  re-freeze: the recorder is ported behavior-identical and the
  substrate (same 7 flags, same policy sha) is identical, but
  the game code under it is not byte-identical, so the numbers
  are judged fresh and never compared as a re-run of the held
  band. The 0930Z adoption verified the instrument reproduces on
  the current tip (live-driver legs pass); this arm's proof test
  re-verifies that (live 150d shape run + D1/D2 + §6 anchor)
  before any judged sim.

## Substrate (env flags — identical to holderstate-b / poolfirstfail-b / launchstate-b / launchfield-b)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim, 150d death-aware, one leg (recorder ON),
MODE=vre. **ZERO `src/js` changes in this arm.**

## Instrument (recorder copy + extended analyzer; driver wraps only)

- `scripts/launchfield-refreeze-driver-b.js` — a port of
  `scripts/launchfield-driver-b.js` (held branch, read-only
  copy via `git show`) with ONLY these changes: header comment,
  arm/run `launchfield-refreeze-b` (out object + file names
  `launchfield-refreeze-b-s<seed>`), stop-message prefix
  `LAUNCHFIELD` (kept), driver-filename strings in
  `firstCallerFrame`/`fightOrigin`, the usage line re-seeded to
  107383–107390, `EVIDENCE_DATE` default `2026-11-22`,
  OUTDIR `perseed-launchfield-refreeze-b-107383-107390`, PLUS
  the ANCHOR PIN re-pointed at the new frozen base literal
  `bda6ff495513688fc1680d671d1e019013dd7a9a`. All recorder logic
  — wraps, pool replica, `rangeScoreOf`, `poolCensus`,
  holder-state sampler, launch tracker — byte-identical in
  behavior to the held instrument.
  - Corpus: `evidence/2026-11-22/perseed-launchfield-refreeze-b-107383-107390/`
    (8 files). FRESH OUTDIR — never the held branch's corpus
    directory.
- `scripts/analyze-launchfield-refreeze-b.js` — a port of
  `scripts/analyze-launchfield-b.js` with ONLY these changes:
  header, arm/run `launchfield-refreeze-b`, EXPECTED seeds
  107383–107390 + anchor12 `bda6ff495513` +
  `allyslot3InSrc: true`, output
  `evidence/2026-11-22/launchfield-refreeze-b-analysis.json`,
  PLUS the field-encounter fallback (ported verbatim:
  `encountersByVidDay` + `encounterRowsByVidDay` in
  `buildHsCtx`, the `field-encounter` branch in
  `perPartWhyNot`, the `enc` trace carried through
  `applyPerPartLedger`, and §H4 selftest fixtures: positive,
  different-vid negative, no-Haven-rows negative, ally
  positive). Taxonomy A + B' and the launch accounting are
  reused VERBATIM — their definitions are not re-decided here.
  Leg P stays REMOVED; Leg R stays (reproduction of the 10
  launcheng unknown days on the existing corpora).
- `scripts/test-launchfield-refreeze-b.js` — proof (mirrors
  `scripts/test-launchfield-b.js`): §1 static (files exist,
  no `src/js` diff vs the FROZEN BASE literal, anchor pin
  present in the driver) + §2 analyzer selftest green (71
  checks incl. §H4) + §3 fixture end-to-end (Leg S + H
  classes on a synthetic corpus) + §3b old-band regression
  (the new analyzer re-reads the EXISTING launchstate corpora
  and must close exactly the 2 previously-unexplained parts as
  field-encounter with the suburb/vFlee trace — substrate flags
  on the old band are expected to fail there and are NOT
  asserted) + §4 live 150d shape run on screening seed 107383
  (holder-state rows, pool rows, census rows, per-part ledger
  non-empty) + §5 D1/D2 at 30d on 107383 under the full
  substrate (repeatability + recorder neutrality) + §6 anchor
  (the live run's `anchorCommit` EQUALS the frozen literal)
  + §6b anchor tripwire (live refusal on a non-frozen base).

## Leg S — per-part scored-ness ledger (frozen, inherited + fallback)

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
- Fallbacks, applied in this order BEFORE `no-rows`, each named
  by the same mechanism the day-level taxonomy already uses for
  that day: `seed-day` / `retargeted` / `dead` /
  `plan-deleted` / `field-encounter` (frozen above).
- A part is EXPLAINED iff scored or `whyNot` is a named
  mechanism; the ledger reports per-part coverage (parts
  total / scored / explained-not-scored / unexplained) and
  the per-part `whyNot` tally, beside the day-level B' + H
  table.

## Primary metric (frozen)

Classification completeness over the fresh band: 0 unknown
across all candidate-not-bid + churned instance-days (B' +
H-extended), AND 0 unexplained parts in the Leg S per-part
ledger — plus Leg R reproducing the 10 launcheng unknown days
exactly on the old corpora — plus the field-encounter fallback
firing on at least one fresh-band part (the supply rule below).

## DIAG-GO BAR (frozen — a miss is NO-GO, never re-scored)

The diag is **DIAG-GO** only if ALL of these hold:

(a) **Completeness:** 0 unknown across all instance-days on
    the fresh band (B' reasons + H reasons incl. the two
    launchstate classes; churn closings present) AND 0
    unexplained parts in the Leg S per-part ledger (incl. the
    field-encounter fallback).
(b) **Leg R reproduction:** the analyzer run over the EXISTING
    strikeband4 corpora reproduces the 10 launcheng
    unknown-no-signal days exactly (same seed/vid/target/day
    list) — the copy is faithful.
(c) **Instrument validity:** proof test
    `scripts/test-launchfield-refreeze-b.js` green; analyzer selftest
    green; analyzer run on the real band dir parses 8/8 files,
    0 instrument errors, substrate assertions pass (policy sha
    `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: true`,
    anchor base `bda6ff495513`).
(d) **Fresh-band supply (NEW in this arm):** the
    field-encounter fallback fires on at least one
    fresh-band part (Leg S whyNot tally `field-encounter` ≥ 1,
    each with its `enc` trace). This is the question this arm
    exists to answer.

REPORTED BUT NOT GATING the verdict: the binding gate over
assessed days (holderstate bar-3 shape), launch sanity (all
wave-4-target launches accounted, 0 no-start-call, 0
no-copy-link), the wall numbers, and how many fresh-band parts
the field-encounter fallback attributes (with their traces).
The DIAG bar is (a)+(b)+(c)+(d) only — this arm judges the
RECORDER's completeness AND its first live fire on a fresh
band, not a re-judgment of the pool or the gate. The old band
(107301–107308) is NOT re-judged: the §3b regression in the
proof test is a check on the instrument, not fresh evidence.
The held band (107321–107328) is NOT re-judged either: its
DIAG-GO stands on its own base; this arm's verdict is fresh.

## Supply rule (frozen — judge on the fresh band)

JUDGE ON THE FRESH BAND (107383–107390). If the fresh band
supplies no field-consumed part (no part classified
`field-encounter`), the verdict is **DIAG-NO-GO on supply**
(instrument unexercised on fresh data) — do NOT re-assert the
old DIAG-GO, do NOT fall back to the staged §H4 fixture or
the §3b old-band regression as fresh evidence. Those remain
proof-test evidence only. A miss is NO-GO, never re-scored
against a friendlier metric.

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
`sim-launchstate-b` / `sim-pinquaddoor-b` /
`sim-launchfield-b` branches (read-only copy of the approach
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
   old 10 are reproduced (Leg R), never re-derived. Likewise
   the launchstate 2 parts are closed by the proof test's §3b
   re-read, not by a re-judgment of the old band.
2. **Perception flag unrecorded** (inherited): a reached
   refresh with a stale commit and no score/gate row stays
   `hs-unexplained`.
3. **Target matching is by TYPE, not instance** (inherited): a
   first fight against "the target" may be against a
   different individual of the target species. The fallback
   extends this honestly: the encountered monster need not be
   the plan target at all.
4. **Day granularity:** a same-day fight may precede the
   launch within the day (the family's convention, kept). The
   fallback attributes by day-match + elimination, so a part
   consumed by a NON-encounter cause on an encounter day could
   be mis-attributed if the holder also has a same-day
   encounter — the Haven-rows-absent condition (Haven rows at
   other parts, none at this part) bounds this, and the `enc`
   trace names the encounter so a reader can audit each
   attribution.
5. **The analyzer reuses frozen classifiers** (`classifySeed`,
   `funnelForSeed`, `launchesOf`/`firstFight`) — their
   definitions are not re-decided here except for the frozen
   §7.3 launch-counting decision (inherited), the two H
   extensions (inherited), and the field-encounter fallback
   above, which is explicitly flagged wherever it changes a
   count vs the frozen taxonomy.
6. **Write flap:** intermittent EPERM on fresh-file writes has
   struck this program repeatedly — including during the held
   arm's build (the analyzer rename's temp-file write failed
   120/120 attempts over 10 minutes; a single-attempt direct
   write truncated the test file to 0 bytes, recovered
   byte-identical from the launchstate original via the file
   tools). Legs tee to a legs log (fallback recovery); writes
   are probed before they matter and verified by size/readback;
   a blocked final commit leaves files on disk intact for
   coordinator adoption, never forced. Single-attempt
   truncating writes are not used on irreplaceable files.
7. **Anchor scope:** the FROZEN BASE literal is the frozen base
   only while this branch forks from `bda6ff495` with no
   merges; a rebase onto a newer master trips the driver's
   refuse check by design (re-freeze then, don't amend
   silently). The recorded anchor is a literal, so a rebase
   can no longer silently move it — the driver refuses instead.
8. **Taxonomy H** is inherited verbatim (B' + H-extended
   day-level reasons, incl. `hs-scholar-idle` and the
   churn-closing fallback `retarget-observed-holderstate`).

## Files

- Prereg: `evidence/2026-11-22/sim-launchfield-refreeze-b-prereg.md` (this file)
- Instrument: `scripts/launchfield-refreeze-driver-b.js`,
  `scripts/analyze-launchfield-refreeze-b.js`,
  `scripts/test-launchfield-refreeze-b.js`
- Corpora (fresh): `evidence/2026-11-22/perseed-launchfield-refreeze-b-107383-107390/`
  (8 files)
- Reproduction corpora (existing, read-only):
  `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8 files)
- Old-band regression corpora (existing, read-only):
  `evidence/2026-11-21/perseed-launchstate-b-107301-107308/` (8 files)
