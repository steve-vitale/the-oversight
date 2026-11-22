# sim-launchfield-rejudge-b — DIAG PREREG, screen-then-judge re-judgment of the held launchfield DIAG-GO (frozen before any judged sim)

**Arm:** sim-launchfield-rejudge-b, DIAG instrument · **Loop B run:**
fleshout-loop-b-20261122T1630Z · **Axis:** winnability chain
**Type:** DIAG, instrument-only (port of the refreeze instrument +
analyzer fallback + proof test). No game-code change, no default
flipped, no lever built in this stage.
**Branch:** `sim-launchfield-rejudge-b` · **Worktree:**
`~/workspace/worktrees/sim-launchfield-rejudge-b`
**Frozen base:** master `1c11dbb149a660b7946aaefb2e95c29c14bf5548`
(`1c11dbb149a6`), the current master tip at freeze time (verified at
arm start: worktree HEAD `1c11dbb149a660b7946aaefb2e95c29c14bf5548`,
`git merge-base HEAD master` identical, `git status --short`
empty).
**Frozen:** 2026-11-22 ~16:55 UTC, BEFORE any judged sim.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 first 12 `1884c8852d38` — IDENTICAL to the
holderstate-b / launcheng-b / poolfirstfail-b / launchstate-b /
launchfield-b / launchfield-refreeze-b corpora; verified live on
this base (see below).
**Horizon:** 150d, death-aware. **Screen:** 32 seeds, frozen
(see below) — four bands of 8 starting at 107399.

## The question (screen-then-judge re-judgment of the held launchfield-b DIAG-GO)

sim-launchfield-b (`sim-launchfield-b` branch, read-only,
DIAG-GO) judged the per-part field-encounter fallback complete on
band 107321–107328: 0 unexplained parts of 464, Leg R reproducing
the 10 launcheng unknown days exactly, proof 52/52, selftest 71/71.
It was HELD, never landed. sim-launchfield-refreeze-b
(`evidence/2026-11-22/sim-launchfield-refreeze-b.md`,
DIAG-NO-GO on supply) re-judged it on a fresh band 107383–107390:
completeness and reproduction held (0 unexplained parts of 16,
Leg R 10/10 exact), but the field-encounter fallback fired **0
times** on the fresh band — exactly as on the held band — so the
held DIAG-GO was NOT re-asserted. Two consecutive 8-seed bands
have now supplied zero field-consumed parts.

The open question, stated plainly: does ANY fresh band supply the
trigger shape — a not-bid holder-day with a Haven part and a
same-day encounter — so the fallback's first live fire on fresh
data can be observed and the held DIAG-GO re-asserted or
overturned on evidence? This arm SCREENS fresh seeds for that
supply condition (frozen budget below) and judges the FIRST band
that supplies it. Do NOT re-run the same band shape that already
failed twice (a single pre-chosen 8-seed band with no screen):
the screen is the instrument question this time.

**§7 scope, stated explicitly:** the §7 re-freeze rule governs
re-running the SAME judgment (same band, same bar) after master
moves. This arm is a FRESH judgment on a FRESH band with its own
frozen base — a new arm, not a re-run of the held or refreeze
judgments — so no amendment applies and none is recorded. If
master moves after this prereg freezes, the §7 rule applies to
THIS arm's judgment in the usual way (re-freeze deliberately,
never amend silently). The judged band is not known at freeze
time by design: the screen selects it under the frozen rule
below, and the evidence names which band was judged.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-22/sim-launchfield-b.md` (held branch
  `sim-launchfield-b`, read-only) — the DIAG-GO verdict, the
  0/464 completeness ledger, the supply statement (fallback fired
  0 times on band 107321–107328), the §3b old-band regression
  closing the 2 launchstate parts, the re-freeze record.
- `evidence/2026-11-22/sim-launchfield-refreeze-b.md` + prereg
  (read from this worktree) — the DIAG-NO-GO on supply, the
  0/16 ledger on band 107383–107390, the two churn holders whose
  encounters fell outside the trigger shape for named, correct
  reasons (seed-day exclusion, away-from-Haven all day), the
  `gameDays` vs `days` drift flag, the frozen supply rule.
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

## The per-part field-encounter fallback (frozen, ported verbatim from the refreeze arm)

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

## AMENDMENT 2 (recorded 2026-11-22, adoption of the 1630Z round)
§4 holder-state shape: a holder-state row's `target` field may be null. The frozen shape check required `r.target` truthy; the live trajectory (needwave-b on master) produces holder rows whose plan currently has no target — stage "standing" or "hunt", commit kind HAVEN_CHORE / winPlanAction "party_wait", holder between targets. A null target is a legitimate game state, not a malformed row. The field must still be PRESENT (string or null); every other frozen field (day/part 0–3, vid, away/engaged/haven/onExped/isScholar/dead boolean) is unchanged. Verified, not assumed: on the proof's own §4 live run (screening seed 107399, 150d, rebased tip) all 188 bad rows fail ONLY on no-target (ROWS=1831 BAD=188 BYREASON={"no-target":188}); on the judged-band corpus all 266 bad rows fail only on no-target (diag ~/workspace/diag-badshape-out.txt; 1882 rows). The proof test §4 predicate changes `!r.target` → `!('target' in r)`. Nothing else changes: the judgment (DIAG-NO-GO on completeness), the frozen bars, the band (107415–107422), and the evidence are untouched. This amendment corrects test strictness only; it is NOT a game defect and does NOT re-score any judged number.

## ANCHOR PIN (frozen, ported verbatim from the refreeze arm — the §6 fix)

The launchstate §6 proof compared the recorded anchor against
the same run-time `git merge-base HEAD master` computation that
produced it — a tautology: the anchor silently followed the
landing rebase (`a0a2bf26dbfa` → `4266e6ccef2a`) and the proof
could not catch the move. The fix is a real code change, not a
proof edit:

- The driver records `anchorCommit` as the FROZEN BASE literal
  `1c11dbb149a660b7946aaefb2e95c29c14bf5548` (`FROZEN_BASE12`
  `1c11dbb149a6`) — NEVER a run-time merge-base. `anchorHead`
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

## Screen design (frozen — the instrument question this time)

- **Screen budget, frozen: 32 seeds** — four consecutive bands
  of 8, in order: **B1 107399–107406, B2 107407–107414, B3
  107415–107422, B4 107423–107430**. No band outside this budget
  is screened; no band is re-screened.
- **Screen procedure (frozen):** for each band in order, run the
  launchfield driver at the full 150d death-aware horizon under
  the frozen substrate, then run the analyzer on that band's
  corpus dir and read the Leg S whyNot tally. The screen runs
  ARE the instrument runs — the driver corpora are the judged
  corpora for the band that supplies, not a separate cheap
  probe: no cheaper screen preserves the instrument, because
  holder-days only exist after the sim runs. A shorter-horizon
  screen is FORBIDDEN: supply occurring after the screen
  horizon would be missed and a supplying band wrongly skipped.
- **Supply rule (frozen, operational):** a band SUPPLIES iff the
  Leg S whyNot tally `field-encounter` ≥ 1 on that band, each
  part carrying its `enc` trace. The first supplying band
  becomes the JUDGED band; screening stops there. The
  task's trigger shape (a not-bid holder-day with a Haven part
  and a same-day encounter) is what the tally measures; the
  tally also counts churn-window parts, exactly as in the held
  and refreeze arms — the evidence reports, for each firing
  part, whether its window is not-bid or churn, so the reader
  can see which shape supplied.
- **No-supply rule (frozen):** if NO band supplies after the
  full 32-seed budget, the verdict is **DIAG-NO-GO on supply**
  (instrument unexercised on fresh data, third consecutive
  failure) — do NOT re-assert the old DIAG-GO, do NOT fall back
  to the staged §H4 fixture or the §3b old-band regression as
  fresh evidence. Those remain proof-test evidence only. The
  four-band screen itself is the evidence. The named next
  instrument question is then: widen the trigger shape (e.g.
  drop the Haven-rows-present condition and attribute
  field-encounter days by the day-level reason, or screen for
  the day-level `field-encounter-day` shape directly) — or
  retire the fallback's live-fire requirement, since three
  bands will have supplied zero.
- **Screen bookkeeping (frozen):** per band, record seeds,
  candidate-not-bid instances, churn instances, Leg S parts
  total, `field-encounter` count with traces, and whether the
  band was judged or passed over. Screen log:
  `evidence/2026-11-22/launchfield-rejudge-b-screen.log`.

## Band freshness (verified 2026-11-22, before this prereg)

Screen range 107399–107430. Search scope per the
`local_seed_band_freshness` skill: (1) `grep -rhoE
"10[67][0-9]{3}" evidence/*/sim-*-prereg.md` (full list,
sorted — max named seed 107390, the refreeze band
107383–107390); (2) `grep -rE "10739[0-9]|1074[0-3][0-9]"
evidence/ --include="*.md"` — hits are ONLY the 107383–107390
band (via `107390` matching `10739[0-9]`); (3) `grep -rE
"107399|10740[0-9]|10741[0-9]|10742[0-9]|107430" evidence/
--include="*.md"` — ZERO hits; (4) `grep -rE
"10739[0-9]|1074[0-3][0-9]" scripts/ evidence/
--include="*.js" --include="*.json" -l` — 21 files, EACH
INSPECTED by hand: the 3 refreeze scripts match only on
`107390`; the 18 October JSONs are all false positives
(non-seed numbers: `"pantryKcal": 107392`,
`"pantryFreshAfter": 107394/107401/107402/107414/107435/107438`,
`"Fish catch": 107401` kcal, `trajHash` hex strings starting
`10739721e4…`, and floating-point `fd`/`freshDays` values whose
decimals contain the digit runs `107398`/`107404`/`107407`/
`107416`/`107428`/`107433`) — none is a seed, a band naming,
or a reservation.

- **107399–107430 FRESH.** Zero namings in every scope: no
  prereg, sim note, screen, or extension band names any of
  107399–107430 as a seed band.
- NOTE on the coordinator's check: it reported "107391–107420
  with zero mentions" — that is imprecise. Numeric mentions
  of 107392–107420 DO exist in old October JSONs, but every one
  is a non-seed value inspected above. The freshness verdict
  stands on this re-verification, not on the coordinator's
  wording.
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
  (journey endgame r267); 107359–107366 (leadgate-a);
  107367–107374 (cellcheck-a); 107383–107390
  (launchfield-refreeze-b). 107391–107398 are unused but NOT
  in the screen budget: the brief starts the screen at 107399
  and the budget is frozen as 107399–107430.

## Base-identity check (verified before freezing)

- Worktree HEAD = master tip `1c11dbb149a660b7946aaefb2e95c29c14bf5548`
  (`git rev-parse HEAD`, `git merge-base HEAD master` identical,
  `git status --short` empty). Main-tree master tip identical
  (`1c11dbb14`, journey-establishment r268).
- Policy sha verified live on this base: `sha256sum
  scripts/policies/competent.js` first 12 = `1884c8852d38`
  (identical to holderstate / launcheng / poolfirstfail /
  launchstate / launchfield / launchfield-refreeze).
- ALLYSLOT3 IS in `src/js` on this base (`fieldFights.js`,
  `game.js`, `party-wiring.js`, `villager-agency.js`). The
  driver records `allyslot3InSrc: true` on every corpus and
  refuses to run if the flag is absent from src/js.
- `src/` HAS moved since the refreeze judgment's base
  (`bda6ff495` → `1c11dbb14`: `src/js/convo-beats.js` +16,
  `src/js/convo-wants.js` +30, `src/js/villager-agency.js` +45,
  `src/js/win-plan.js` +22/−11; 102 insertions, 11 deletions —
  journey-establishment r268). The win-plan.js change is the
  LAUNCHVOICE departure beat (the wave-4+ gate on the beat is
  gone — narration only, launch mechanics untouched). That move
  is WHY this is a fresh judgment, not a re-freeze: the recorder
  is ported behavior-identical and the substrate (same 7 flags,
  same policy sha) is identical, but the game code under it is
  not byte-identical, so the numbers are judged fresh and never
  compared as a re-run of the held or refreeze bands.

## Substrate (env flags — identical to holderstate-b / poolfirstfail-b / launchstate-b / launchfield-b / launchfield-refreeze-b)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim, 150d death-aware, one leg (recorder ON),
MODE=vre. **ZERO `src/js` changes in this arm.**

## Encounter-gear fixture note (Steve 2026-11-13)

This is a DIAG instrument arm: the judgment observes LIVE sims
under the competent verbatim policy — the scholar plays with the
gear and party the policy assembles as it reaches wave-4
content, never a fresh un-geared solo scholar staged for the
verdict. No synthetic solo-scholar fixture is used for the
judgment. The §H4 staged fixture in the proof test is
instrument evidence only (it proves the fallback fires on a
`v4encounters` row), never fresh evidence. The sense-test reads
real holder-days from the judged band's corpora.

## Instrument (recorder copy + extended analyzer; driver wraps only)

- `scripts/launchfield-rejudge-driver-b.js` — a port of
  `scripts/launchfield-refreeze-driver-b.js` with ONLY these
  changes: header comment, arm/run `launchfield-rejudge-b`
  (out object + file names
  `launchfield-rejudge-b-s<seed>`), stop-message prefix
  `LAUNCHFIELD` (kept), driver-filename strings in
  `firstCallerFrame`/`fightOrigin`, the usage line re-seeded to
  107399–107406, `EVIDENCE_DATE` default `2026-11-22`,
  OUTDIR `perseed-launchfield-rejudge-b-107399-107406`, PLUS
  the ANCHOR PIN re-pointed at the new frozen base literal
  `1c11dbb149a660b7946aaefb2e95c29c14bf5548`. All recorder logic
  — wraps, pool replica, `rangeScoreOf`, `poolCensus`,
  holder-state sampler, launch tracker — byte-identical in
  behavior to the refreeze instrument. Screen bands B2–B4 run
  through the same driver with `SEEDS` + `OUTDIR` env
  overrides (`perseed-launchfield-rejudge-b-<band>`); the
  driver refuses to overwrite an existing corpus (exit 3).
  - Corpora (screen): `evidence/2026-11-22/perseed-launchfield-rejudge-b-107399-107406/`
    (band B1), `…-107407-107414/` (B2), `…-107415-107422/`
    (B3), `…-107423-107430/` (B4) — one dir per band, each
    created only when its band is screened.
- `scripts/analyze-launchfield-rejudge-b.js` — a port of
  `scripts/analyze-launchfield-refreeze-b.js` with ONLY these
  changes: header, arm/run `launchfield-rejudge-b`, EXPECTED
  seeds 107399–107406 + anchor12 `1c11dbb149a6` +
  `allyslot3InSrc: true`, output
  `evidence/2026-11-22/launchfield-rejudge-b-analysis.json`
  (default; screen bands write
  `launchfield-rejudge-b-analysis-<band>.json` via the
  `ANALYSIS_OUT` env override — the judged band's analysis is
  copied to the default filename so the evidence cites one
  file), PLUS the field-encounter fallback (ported verbatim:
  `encountersByVidDay` + `encounterRowsByVidDay` in
  `buildHsCtx`, the `field-encounter` branch in
  `perPartWhyNot`, the `enc` trace carried through
  `applyPerPartLedger`, and §H4 selftest fixtures: positive,
  different-vid negative, no-Haven-rows negative, ally
  positive). Taxonomy A + B' and the launch accounting are
  reused VERBATIM — their definitions are not re-decided here.
  Leg P stays REMOVED; Leg R stays (reproduction of the 10
  launcheng unknown days on the existing corpora).
- `scripts/test-launchfield-rejudge-b.js` — proof (mirrors
  `scripts/test-launchfield-refreeze-b.js`): §1 static (files
  exist, no `src/js` diff vs the FROZEN BASE literal, anchor pin
  present in the driver) + §2 analyzer selftest green (71
  checks incl. §H4) + §3 fixture end-to-end (Leg S + H
  classes on a synthetic corpus) + §3b old-band regression
  (the new analyzer re-reads the EXISTING launchstate corpora
  and must close exactly the 2 previously-unexplained parts as
  field-encounter with the suburb/vFlee trace — substrate flags
  on the old band are expected to fail there and are NOT
  asserted) + §4 live 150d shape run on screening seed 107399
  (holder-state rows, pool rows, census rows, per-part ledger
  non-empty) + §5 D1/D2 at 30d on 107399 under the full
  substrate (repeatability + recorder neutrality) + §6 anchor
  (the live run's `anchorCommit` EQUALS the frozen literal)
  + §6b anchor tripwire (live refusal on a non-frozen base).

## Leg S — per-part scored-ness ledger (frozen, inherited + fallback)

Run over the judged band's corpora, for every instance-day in
the window of every candidate-not-bid and churned instance. For
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

Classification completeness over the judged band: 0 unknown
across all candidate-not-bid + churned instance-days (B' +
H-extended), AND 0 unexplained parts in the Leg S per-part
ledger — plus Leg R reproducing the 10 launcheng unknown days
exactly on the old corpora — plus the field-encounter fallback
firing on at least one judged-band part (the supply rule below).

## DIAG-GO BAR (frozen — a miss is NO-GO, never re-scored)

The diag is **DIAG-GO** only if ALL of these hold on the
JUDGED band (the first supplying band, or no band if the screen
finds none — in which case clause (d) fails by the no-supply
rule):

(a) **Completeness:** 0 unknown across all instance-days on
    the judged band (B' reasons + H reasons incl. the two
    launchstate classes; churn closings present) AND 0
    unexplained parts in the Leg S per-part ledger (incl. the
    field-encounter fallback).
(b) **Leg R reproduction:** the analyzer run over the EXISTING
    strikeband4 corpora reproduces the 10 launcheng
    unknown-no-signal days exactly (same seed/vid/target/day
    list) — the copy is faithful.
(c) **Instrument validity:** proof test
    `scripts/test-launchfield-rejudge-b.js` green; analyzer selftest
    green; analyzer run on the judged band dir parses 8/8 files,
    0 instrument errors, substrate assertions pass (policy sha
    `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: true`,
    anchor base `1c11dbb149a6`).
(d) **Fresh-band supply:** the field-encounter fallback fires
    on at least one judged-band part (Leg S whyNot tally
    `field-encounter` ≥ 1, each with its `enc` trace). This is
    the question this arm exists to answer. If the screen finds
    no supplying band in the frozen 32-seed budget, (d) fails
    and the verdict is **DIAG-NO-GO on supply**.

REPORTED BUT NOT GATING the verdict: the binding gate over
assessed days (holderstate bar-3 shape), launch sanity (all
wave-4-target launches accounted, 0 no-start-call, 0
no-copy-link), the wall numbers, and how many judged-band parts
the field-encounter fallback attributes (with their traces).
The DIAG bar is (a)+(b)+(c)+(d) only — this arm judges the
RECORDER's completeness AND its first live fire on a fresh
band, not a re-judgment of the pool or the gate. The old band
(107301–107308) is NOT re-judged: the §3b regression in the
proof test is a check on the instrument, not fresh evidence.
The held band (107321–107328) and the refreeze band
(107383–107390) are NOT re-judged either: their verdicts stand
on their own bases; this arm's verdict is fresh.

## Supply rule (frozen — judge on the first supplying band)

JUDGE ON THE FIRST SUPPLYING BAND in the frozen screen order
(B1 → B2 → B3 → B4). If no band supplies after the full
32-seed budget, the verdict is **DIAG-NO-GO on supply**
(instrument unexercised on fresh data) — do NOT re-assert the
old DIAG-GO, do NOT fall back to the staged §H4 fixture or
the §3b old-band regression as fresh evidence. Those remain
proof-test evidence only. A miss is NO-GO, never re-scored
against a friendlier metric. Bands passed over for no supply
keep their corpora + per-band analysis on disk as the screen
evidence; only the judged band's numbers enter the verdict
table.

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
`sim-launchfield-b` / `sim-launchfield-refreeze-b` branches
(read-only copy of the approach only).

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — recomputed by the analyzer
from the judged band's corpora (not copied). Also the
standing-199 stall count.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and read at
least two holder-days end to end from the per-part ledger —
one scored day and one skipped day — saying in plain words
what the holder did at each part and whether the recorder's
story matches what the sim actually did. If the judged band
has zero scored parts (as the refreeze band did), say so
plainly and read the firing field-encounter part(s) and one
churn holder's days from the raw corpora instead. Judge
meaning, coherence, consequences — never just counts. The
evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **No retroactive classification:** the 10 launcheng unknown
   days cannot be re-classified from their own corpora — the
   strikeband4 recorder never sampled per-part holder state.
   Only the judged band is classified at per-part depth; the
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
   only while this branch forks from `1c11dbb14` with no
   merges; a rebase onto a newer master trips the driver's
   refuse check by design (re-freeze then, don't amend
   silently). The recorded anchor is a literal, so a rebase
   can no longer silently move it — the driver refuses instead.
8. **Taxonomy H** is inherited verbatim (B' + H-extended
   day-level reasons, incl. `hs-scholar-idle` and the
   churn-closing fallback `retarget-observed-holderstate`).
9. **Screen cost:** each band is a full 8-seed 150d instrument
   run (~20 min/band on this box); the full 32-seed budget is
   ~80 min worst case. Bands run sequentially in one screen
   process with early stop on the first supplying band.

## Files

- Prereg: `evidence/2026-11-22/sim-launchfield-rejudge-b-prereg.md` (this file)
- Instrument: `scripts/launchfield-rejudge-driver-b.js`,
  `scripts/analyze-launchfield-rejudge-b.js`,
  `scripts/test-launchfield-rejudge-b.js`
- Screen runner: `scripts/screen-launchfield-rejudge-b.sh`
- Screen log: `evidence/2026-11-22/launchfield-rejudge-b-screen.log`
- Corpora (screen): `evidence/2026-11-22/perseed-launchfield-rejudge-b-107399-107406/`
  (B1), `…-107407-107414/` (B2), `…-107415-107422/` (B3),
  `…-107423-107430/` (B4)
- Analysis (judged band): `evidence/2026-11-22/launchfield-rejudge-b-analysis.json`
  (per-band screen analyses:
  `launchfield-rejudge-b-analysis-<band>.json`)
- Reproduction corpora (existing, read-only):
  `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8 files)
- Old-band regression corpora (existing, read-only):
  `evidence/2026-11-21/perseed-launchstate-b-107301-107308/` (8 files)
