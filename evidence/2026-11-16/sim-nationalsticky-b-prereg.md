# sim-nationalsticky-b — PREREG (DIAG: is reached-national lost, and how?)

Run: fleshout-loop-b-20261117T0030Z (Loop B), arm sim-nationalsticky-b
Axis: winnability chain. Findings backlog #2452 ("NATIONAL IS NOT
STICKY: ONE POINT OF TRUST DRIFT COSTS THE SCALE"), from
evidence/2026-11-16/sim-seasoning-b.md §National is not sticky.
Branch: sim-nationalsticky-b — worktree
~/workspace/worktrees/sim-nationalsticky-b
Base: master at arm start (tip 302640180 — the medicduty-b corpora
commit; this tree's own prior arm, already merged locally by the
coordinator).
Date: 2026-11-16 (run starts 2026-11-17T00:30Z). Type: DIAG —
instrument + measured loss distribution. No game change, no default
flipped, no lever. No balanced panel (DIAG, no game change — the
neutrality proof D1/D2/D3 is the panel's substitute here, as in
seasoning / medicduty).

## Canon note (read first)

docs/CANON.md was read, then evidence/2026-11-16/sim-seasoning-b.md
(§National is not sticky) and its prereg in full, plus findings
#2452 and #1918 in
hidden_files/sim-findings.md. **CANON GAP (recorded, not invented):
no CANON-registered doc covers the standing / scale system
specifically** — the CANON.md manifest lists no standing/scale doc
(the nearest are docs/MAP.md for the road and the SCALE.md cited by
hierarchy.js comments). The lapse rule below is quoted from code
only; nothing is invented here. If a scale canon doc is ever written,
it should record this rule from hierarchy.js, not from this prereg.

## Prior art (read first)

- #2452 (seasoning band 102201–102208, courtship leg, 150d): 4/8
  courtship seeds LOST national after reaching it, every lapse the
  same single cause — one covenant link's trust drifted below 40
  and the polity unqualified the same day (45→39, 41→39, 40→38,
  40→36). Three re-staged within 2–14 days once trust recovered;
  102204 never got it back by d151.
- #1918 (tend-drive stops at national, band 76401–76408): the
  villagers' own tend drive (winPlanBondsTick, win-plan.js:539)
  returns null while nationalLive, so after the First Court NOTHING
  tends links at 40–50. The sized lever (let the drive run while
  national, tend to 55) was tried NO-GO (sim-tenddrive-a) for lack
  of loss events on its band — the headroom had nothing to save.
  **This DIAG measures the loss events themselves, which is the
  missing precondition for that lever.** If this band carries
  losses, the tend-drive retest has its precondition; if it
  carries none, the precondition is still unmeasured on competent
  verbatim.
- #2330 / sim-diplo-verb-b: competent verbatim forms exactly 1
  link per village (ladder stage-3 rewards), tends 0 accords,
  0 tends; diplomacy 0 on 16/16. **STATED RISK: competent verbatim
  may reach national on 0/8 seeds on this band** — the polity
  needs ≥3 seasoned links (covenant) or a led/conquest shape
  competent never builds. Bar 3 below handles that outcome as
  DIAG-NO-GO on power, not as a re-score and not as a reason to
  switch policy mid-run. The brief fixes the policy as competent
  verbatim; chasing reach events with courtship deeds would answer
  a different question (already answered by seasoning: 4/8 lost).

## The lapse rule, from code (frozen anchors, this tree)

- Seasoned (src/js/hierarchy.js `_linkSeasoned`): a link counts
  toward a polity only when age 30+ days AND trust 40+ (peer links
  form at trust 30; tending required). Conquered links need the
  season, not the trust. Mercy-grace and the SUCCPOLITY /
  SUCCGRACE gates are env-gated, default OFF here.
- Lapse (hierarchy.js `_checkNational`, daily): when
  `nationalLive || globalLive` AND no `pendingNational` AND
  `_havenPolity()` returns null, the realm comes apart the same
  day — `nationalLive = false`, `globalLive = false`,
  `nationalFirstDay` deleted, pending global summons killed,
  league machinery (poolLive / chartered / warOath / pending calls)
  cleared, said aloud: "◈ The realm came apart — no polity
  answers to Haven now, and Haven is a free fire again."
- Staging (hierarchy.js `stageNationalBeat` /
  `answerNationalChoice`): a qualifying polity stages
  `pendingNational`; the answer sets `nationalLive = true`,
  `nationalDay`, `nationalFirstDay`. Re-staging after a lapse
  runs the same daily check (rung: networkLive + 30d).
- Standing does NOT gate the polity: `_havenPolity()` and the
  shape predicates (`_covenantPolity`, `_belongPolity`,
  `_tradePolity`, `polityOf('haven')`) read seasoned links only,
  never the standing total. A standing dip below 200 is therefore
  recorded as a CO-OCCURRING condition on the lapse day, never as
  the engine cause unless the corpus shows a lapse with no link
  cause — in which case it is `unknown` and names the missing
  mechanism. The cause classes below are frozen on this reading.

## What is being measured

On competent verbatim, one fresh shared band, 200d death-aware,
OFF leg (recorder off) then ON leg (recorder on), 8 seeds each:
how often reached-national is LOST, by what cause (trust drift
below 40 vs link loss vs standing-fall co-occurrence), lapse
duration, and re-stage time. Per seed: first-reach day, each
lapse (day, cause, lapsing link + trust before→lapse day,
standing raw/capped that day), days held total, days lapsed,
re-stage day or never.

## Seed-band freshness (verified BEFORE any judged sim, 2026-11-16)

Per ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md —
exact-seed grep over all dated preregs
(`evidence/*/sim-*-prereg.md`), all evidence markdown
(`evidence/*/*.md`), the convergence tracker, and
hidden_files/*.md, on this tree (base 302640180):

- SHARED BAND 103011–103018 (8 seeds): **0 hits anywhere** — no
  prereg, no evidence markdown, no tracker line names any of
  these seeds. FRESH. This prereg spends it (16 configs: 8 seeds
  × 2 legs). The coordinator verified the same band fresh for the
  other arms this run; each arm spends it on its own leg, no
  corpus is shared or overwritten.
- NOTE: the tracker line 14355 names the SICKSTALE band
  10301–10308 — different seeds (5-digit), not a collision.
- SPENT BANDS (never reuse): 100621–100636, 100601–100608,
  100641–100648, 100761–100768, 102001–102008, 102011–102018,
  102131–102138, 102141–102148, 102201–102208, 102401–102408,
  102601–102608, 102701–102708, 102801–102808 (medicduty-b,
  this tree), 190391–190398, 190541–190548, 190561–190568,
  190621–190628, 190631–190638, 76401–76408, 76409–76420
  (tend-drive confirm band, still fresh — reserved, NOT spent
  here), 10301–10308.

## Policy (frozen)

Competent verbatim (`scripts/policies/competent.js`) — sha256
`df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`,
verified by the worker on this tree with `sha256sum` before this
commit (do not trust the brief blindly — it matches). No env
flags: default competent (COMPETENT_WARM default ON, all lever
envs unset). OFF anchor = the instrument commit, recorder OFF by
env; ON anchor = the same commit, recorder ON by env (no `src/`
change between legs — the legs differ ONLY by the
`NATIONALSTICKY_RECORDER` env flag). Both SHAs are recorded in
the evidence file (they are the same commit; the env flag is the
leg).

## Horizon

200 days, death-aware (dead villages stop simulating; a
village-lost day ends the series). Longer than seasoning's 150d
to give reach-plus-loss room: the seasoning lapses landed d120–
d141, and 102204's never-re-staged tail ran to d151.

## Design — the recorder (frozen)

One shared band, TWO legs, zero `src/js` game-code change on
either:

- **OFF leg** = master as-is, recorder off (trajectory
  reference). **ON leg** = master as-is + recorder wraps only
  (the judged leg). No seed call, no lever, no balance change.
- Recorder (`scripts/nationalsticky-driver-20261116.js`, pure
  reads + writes to driver-local arrays — no game-state writes,
  no RNG draws; `NATIONALSTICKY_RECORDER=off` skips installing
  the wraps):
  - **Daily snapshot** (after each policy `daily()`, deduped by
    game day; the stand199 instrument pattern
    `scripts/standing199-instrument-20261110.js`, reused, not
    forked blindly): day, `scaleRank`, standing raw
    (`villageStanding()`), capped (`standingPlentyCappedTotal()`),
    link roll (every active link: id, other, kind, primary,
    subordinate, status, trust, formed day, age, conquered,
    seasoned via `Game._linkSeasoned`, regional+ via
    `Game._linkRegionalPlus`), shape-candidate roll (the engine's
    own staging predicates: `polityOf('haven')`,
    `_belongPolity()`, `_covenantPolity()`, `_tradePolity()`),
    `havenPolity` shape, `pendingNational` (shape/primary/day),
    `nationalLive`, `nationalDay`, `nationalFirstDay`,
    `readiness4/5` (`waveCombatReadiness`), `waveKills`, roster
    size/living, `exiled`, `scaleRefused`. `villageStandingTotal()`
    is read ONCE at end-of-run (it fires release/hold beats, so a
    recorder call could shift a beat; never call it daily — the
    onlylead-driver precedent). End-of-run: gated standing,
    scaleRank, table state, deaths, `won`.
  - **Verb wrapper**: `answerNationalChoice` — records the staged
    shape (read from `state.pendingNational` BEFORE the call),
    the answer, and the result, so reach days need no snapshot
    join. `tendLink` — records link id, before/after trust, and
    caller (policy vs engine), so recovery tends after a lapse
    are visible.
  - **Say capture** (ON leg only): lines matching
    `realm came apart|national|First Court|Founding Council|Binding|Charter|Iron Court|tend|trust`
    (excluding meal lines), capped at 900 — for sense-testing the
    lapse and re-stage beats. The seasoning arm's 900-line cap
    bound its record before the re-stagings; the lapse line itself
    is uncapped in the analyzer's verbEvents-independent check
    (the analyzer also reads the `national-lost` ledgerAdd, which
    fires on every lapse — see D3).
- The analyzer (`scripts/analyze-nationalsticky-b.js`) derives
  everything from the daily series + verbEvents:
  - **Reach**: first day `nationalLive` goes 0→1 (must coincide
    with an `answerNationalChoice` event that day with result
    `sat` — D3 checks).
  - **Lapse**: a day `nationalLive` goes 1→0 while the series
    continues (a series that ENDS with nationalLive=1 is held to
    horizon/death, censored — NOT a lapse; a village that dies
    while national held it to death).
  - **Lapse cause** (from lapse-day vs prior-day snapshots):
    - `trust-drift` — ≥1 link seasoned on the prior day
      (`se=1`, in the qualifying polity's link set) is unseasoned
      on the lapse day with trust <40 and still active. Name the
      link(s) + trust before→lapse day.
    - `link-loss` — a link active+seasoned on the prior day is
      no longer active (status ≠ active, or absent from the roll)
      on the lapse day.
    - `both` — a trust-drift link AND a link loss on the same
      lapse day.
    - `standing-fall` — recorded as a co-occurring condition
      (capped standing crossed below 200 on the lapse day) and
      reported alongside the link cause, never as the engine cause
      on its own. A lapse whose ONLY change is a standing dip
      with all links still seasoned is `unknown`.
    - `unknown` — no link cause explains the lapse (all shape
      candidates still non-null, or all links still seasoned).
      Must be 0; any unknown lapse names the missing mechanism
      in the analyzer output. No silent unknowns.
  - **Lapse duration**: re-stage day − lapse day, per lapse;
    `never` when no re-stage by series end (censored at the
    series end day). **Days held**: total days with
    `nationalLive=1`, summed over episodes. **Re-stage**: a 0→1
    transition after a lapse (must coincide with an
    `answerNationalChoice` event — D3 checks).
  - **Wall numbers** per leg (national by standing ≥200 gated
    AND by scaleRank, table, wins, wave 4/5 unlocked, median
    survival, wave-4 kills, deaths). The two national readings
    are reported side by side (seasoning showed them diverging in
    opposite directions across legs — gated standing is capped at
    199 by the regional cap, so raw standing ≥200 is also
    reported in the wall detail).
  - **OFF-vs-ON drift check**: daily-signature comparison over
    the full band (day, nationalLive, scaleRank, standing raw,
    pop, waveKills) — 0 divergences expected; any divergence is
    investigated, not waived.

## Classification (frozen — every nationalLive transition gets exactly one cause)

- Reach: `answerNationalChoice` + nationalLive 0→1 (shape
  recorded).
- Lapse: nationalLive 1→0, cause one of `trust-drift` /
  `link-loss` / `both` / `unknown` (+ standing-fall co-occurrence
  flag), lapsing link(s) named with trust before→lapse day.
- Re-stage: nationalLive 0→1 after a lapse (shape recorded).
- Held: nationalLive=1 at series end (censored — horizon or
  village death).

## Primary metric + GO bars (binding, §14)

COMBINATION RULE: **GO requires G1 AND G2 AND G3 AND G4; any FAIL
= NO-GO, never re-scored mid-run.** A miss is written under
"metric review" with a revision proposed for the NEXT run. There
is NO cost bar — this is a DIAG with no lever and no game change;
the wall numbers are reported for the record, not judged.

- G1 INSTRUMENT VALIDITY — GO iff 16/16 per-seed JSONs are
  complete (full daily series with shapeCands + linksRoll +
  nationalLive on every day; 0 instrument errors), EVERY
  nationalLive transition is classified (reach / lapse with
  cause / re-stage / held), and unknown is 0 (no unclassified
  transitions, no unknown lapse causes).
- G2 PROOF GREEN — GO iff `scripts/test-nationalsticky-b.js` is
  green on the instrument tip BEFORE the sweep: static checks
  (zero `src/` diff; wraps named) + D1 determinism (recorder ON
  twice, one seed, 60d, identical nationalLive series +
  identical link-roll trust series) + D2 neutrality (recorder ON
  vs OFF, same seed, 60d, identical daily trajectory signatures
  + identical wall fields) + D3 re-derivation (reach days ==
  answerNationalChoice days; every lapse cause recomputed from
  the raw snapshot fields, mismatch 0). A CHANGE from any
  recorded number is a failure — no test is edited to go green.
  Any `src/js` change = NO-GO.
- G3 THE MEASUREMENT — GO iff ≥3 reached-national seeds with
  loss/retention classified. **If fewer than 3 reach national,
  the verdict is DIAG-NO-GO on power** (instrument valid,
  under-powered — report the count, do NOT re-score, do NOT
  extend the band mid-run). The question is answered with a
  number: reached / lost / held, lapse causes, lapse durations,
  re-stage times.
- G4 WALL NUMBERS — GO iff the wall table (national by standing
  AND by scaleRank, table, wins, wave 4/5 unlocked, median
  survival, wave-4 kills, deaths) is reported for BOTH legs.

## Sense-testing (mandatory)

Read the say lines for a lapse / a re-stage: does the fiction
notice the realm coming apart, or that the court sits again?
Quote at least one lapse line (or state that none fired — the
code says one fires on every lapse, so a silent lapse is itself
a finding). Judge meaning, not just counts. Contrast set: the
staging lines ("Four fires. One head…", "The founding council…")
name the shape; the lapse line ("The realm came apart…") names
no link and no trust number — does the player learn WHICH bond
frayed?

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the 200d horizon buy reach-plus-loss room, or did reaches
  still land late / lapses still censor at the tail?
- Was competent verbatim the right policy for the question, or
  does the loss distribution only exist on the courtship road
  (seasoning's 4/8)? State the retest band/policy for the NEXT
  run — do NOT extend this one.
- Did any lapse carry a standing-fall co-occurrence, and did any
  lapse have no link cause (unknown)? If the engine cause is ever
  not a link, name the mechanism.
- Did the OFF leg reproduce the ON leg's trajectories exactly
  (D2 full-band), or did the recorder move anything?
- Is "days lapsed until re-stage" the right holding-cost unit, or
  did the machinery loss (pool/tariff/calls cleared on lapse)
  cost more than the days (e.g. re-staged courts re-founding the
  pool from zero)? Name it if the corpus shows it.

## Wall numbers (report every run)

National (standing ≥200 gated AND scaleRank), table, wins,
wave-4 unlocked, wave-5 unlocked, median survival, wave-4 kills,
deaths — per leg.
