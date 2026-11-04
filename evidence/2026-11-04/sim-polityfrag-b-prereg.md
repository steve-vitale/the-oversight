# Polity-fragility season test — Loop B, arm sim-polityfrag-b

Axis: scale-onramp / winnability chain. DIAG-ONLY arm: scripts +
instruments + evidence, ZERO src/js changes, ZERO policy edits.
This arm is the second next blank from Loop B run 0730Z
(coordinator evidence evidence/2026-11-04/
sim-winnability-round-0730.md; the diplo pilot it landed is
the sim-diplo-b work, evidence/2026-11-04/sim-diplo-b.md).
Gates, win prices, and deed gates stay UNTOUCHED: this arm
measures, it does not retune any door. A diagnosis names the
next lever; it does not turn it.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. docs/SCALE.md read:
  the scale ladder canon — 1 season = 30 days (Steve
  2026-10-11); a polity is one primary with >= 3 SEASONED
  subordinates; seasoned = 30+ days old AND trust 40+
  (links form at trust 30 — tending required); national
  cannot stage until Haven has been regional for a full
  season. No canon doc covers the diplomacy pipeline's
  day-to-day trust mechanics (tribute shortfalls, trust
  decay, re-seasoning) in the same detail — that absence
  is stated here instead of inventing canon; the trust
  mechanics below are read from src/js/hierarchy.js
  headers, not from a canon doc.
- docs/MEASUREMENT.md §§9–12, 14–15 apply as the loop
  brief encodes them (pilot gate, death-aware horizon,
  pre-registration, metric binding, balanced panel where
  a comparison exists).
- docs/SIMULATING.md consulted (policies table): plain
  `competent` contains zero scale code by design, so the
  proposing policy for this arm is leadcourt (competent +
  LEAD courtship), the same policy as the diplo context
  leg c1 — NOT a new policy, NOT an edit to a shared
  policy. No new policy file is needed for this arm.

## Question (from the 0730Z diplo pilot, not re-litigated)

The diplo context leg (leadcourt, 99401–99404, 140d) found
regional+ diplomacy all-or-nothing at 3 seasoned links:
102 while all three hold, 0 the day one drops (99402 d89,
99403 d117). Open question: over a full season beyond
the drop, does diplomacy HOLD, FLICKER, or COLLAPSE — and
after a drop, does the polity RECOVER (re-season? re-link?)
or stay at 0? Does a drop kill wave-5 unlock prospects?

What the 140d corpus already shows (re-analysis of the
existing diplo JSONs, NOT new judged sims — it motivates
the horizon, it does not answer the question):
- 99402: village_2's link trust slid 54 (d65) → 43 (d86) →
  below 40 by d89 while tending was pantry-gated off
  (leadcourt tends only when pantry > 20,000 kcal; pantry
  sat below that from ~d60 to ~d96). Tending resumed
  d97/d110/d111 INCLUDING the dropped link, yet its trust
  kept falling (21 → 16 → 8 → 0 by d135) — resumed tending
  did not re-season it inside the 140d window.
- 99403: tending stopped after d35 (pantry never back
  above 20,000); two links unseasoned the same day d117;
  the village died d118, so no recovery window existed.
- 99401: the BELONG link (Haven subordinate, never tended
  — leadcourt tends only primary==='haven' links) decayed
  to BROKEN d97; the other links decayed after tending
  stopped d49. Its 3 seasoned links at d57 spanned two
  polities, so regional+ never fired at all.
- 99404 died d76 before any regional+ (third link never
  seasoned).

## Pre-registration (committed before any judged sim)

- Policy (judged leg): scripts/policies/leadcourt.js
  {leadcourt} VERBATIM (the CURRENT file at this anchor),
  default env. No policy file is created or edited.
- Seeds (judged leg): 99401–99404 EXTENDED (identical
  seeds to the diplo context leg c1, same policy, longer
  horizon — the first 140 days are a reproduction check,
  not new evidence) PLUS fresh seeds 99409–99412.
  FRESHNESS CHECK: no evidence .md filename, no dated
  evidence .md file, no scripts/policies file, and no
  per-seed filename in evidence/2026-11-04/ uses any
  99409–99412 seed (checked 2026-11-04; the only 9940
  hits in the tree are the diplo 99401–99408 band and
  commit hashes, not these seeds).
- Horizon (judged leg): 300 days, death-aware (dead
  villages stop simulating; +10d tail max as implemented
  by runDays). WHY 300: the observed drops sit at d89/d117
  in 140d runs; 300d gives >= 180d of post-first-drop
  observation on survivors — six 30-day re-seasoning
  windows, several pantry-recovery cycles, and room for
  a broken link to be re-proposed (leadcourt re-proposes
  only while active subordinates < 3) — while the
  death-aware stop bounds cost to villages that actually
  live. A village alive at 300 is censored, reported as
  survived, not as a win. "Full season" here means this
  300d window, i.e. ten 30-day seasons, NOT one 30-day
  season: one season cannot contain both a drop and a
  recovery verdict, and the diplo drops already consumed
  the first three seasons.
- Instrument: scripts only, zero src/js. The diplo
  instrument (scripts/diplo-instrument-20261104.js) is
  REUSED verbatim — daily snapshots of hierarchy links
  (id, kind, primary/subordinate, status, trust,
  seasoned, regional+ via the game's own reads),
  standing breakdown + capped total, scale rank, peak,
  readiness-5, wave facing, pantry kcal, propose/tend/
  answer calls with returns, pending state, death
  events, diplomacy say-line sample. The snapshot NEVER
  calls villageStandingTotal() or unlockedWave()
  (side-effecting); ONE end-of-run unlockedWave() call
  is reported separately and never counted as a natural
  door-open. The polityfrag driver
  (scripts/test-polityfrag-driver-20261104.js) is the
  diplo driver with a new output directory
  (evidence/2026-11-04/perseed-polityfrag-b/) and RUN=
  polityfrag; it refuses to overwrite an existing
  per-seed file. The polityfrag analyzer
  (scripts/test-polityfrag-analyze-20261104.js) is pure
  functions over the per-seed JSONs: per-day diplomacy
  series, diplo>0 spans, drop events, recovery events,
  per-link trust trajectories, last-tend day per link,
  re-proposal events, hold-share, wave unlocks/facing,
  survival.
- PRIMARY METRIC (per seed): the polity trajectory —
  first-diplomacy day; days with diplomacy > 0; days from
  first-diplomacy day to end/death; HOLD-SHARE = diplo>0
  days / post-first-diplomacy days; drop events
  (diplomacy > 0 → 0, with the link(s) that unseasoned
  or broke, their trust at drop, last-tend day, and
  pantry at drop); recovery events (diplomacy 0 → > 0
  after a drop, with the re-seasoned link named, or
  re-proposal after a break); re-proposal events after
  a break; wave-5 unlock/facing; survival.
- GO THRESHOLD (DIAG-GO): trajectory + drop-cause +
  recovery-outcome FULLY CLASSIFIED on at least 6 of 8
  pilot seeds, including at least 3 seeds that ever
  reached diplomacy > 0. "Fully classified" means: for
  a diplomacy>0 seed, every drop event names its cause
  (link trust < 40 unseason / link broken / village
  death ends the run / polity-shape change) and its
  recovery outcome (re-seasoned on day D / re-proposed
  and re-linked / never recovered by end of run, with
  the blocking fact: no tending, tending without trust
  recovery, no re-proposal, or death); for a never-
  diplomacy seed, the reason regional+ never fired
  (died before seasoning / BELONG-mixed polity / links
  never reached 3 seasoned at once). Otherwise
  DIAG-NO-CANDIDATE with the classified seeds listed.
  INSUFFICIENT-DATA only if > 2 pilot seeds carry
  instrument errors or record zero otherVillages at
  day 1. A miss is NO-GO, never re-scored against a
  friendlier metric mid-run.
- SECONDARY (reported, not judged): wall numbers every
  run — wins, national / table (scaleRank), wave 4–5
  unlocks (peak transitions) and facing (waveEngaged),
  median survival, wave reach 1–5, death-cause shares,
  ready days. Arc reach: not instrumented by this arm
  (stated, not faked).
- SENSE-TEST (SENSE-TESTING LAW): sample say-lines /
  transcripts around drop and recovery days (cooling
  warnings, "realm came apart" lines, tribute-shortfall
  lines, re-proposal narration); judge whether a polity
  collapse and any recovery read as consequences of
  things villagers did, and flag anything robotic,
  static, or repeated.
- BALANCED PANEL (§15): INAPPLICABLE — pure diagnostic,
  no before/after change; the extended 99401–99404 legs
  are a reproduction check against the diplo corpus
  (same seeds, same policy, longer horizon), not a
  comparison of two game versions, and no panel
  comparison is fabricated or attached. Stated
  explicitly, not omitted silently. ANCHOR NOTE: this
  arm's anchor (current HEAD) differs from the diplo
  anchor (c400ae3e0cc1) — the reproduction check
  reports agreement/divergence of the first-140d funnel
  trajectories and treats divergence as an anchor-move
  observation, never as a judged result.
- REPRODUCTION CHECK (not judged): for extended seeds
  99401–99404, compare the first-140d daily link-funnel
  + diplomacy series against the diplo-ctx-lead JSONs;
  report match/mismatch per seed (funnel transitions,
  first-diplo day, drop day). A mismatch does not change
  the DIAG verdict; it is reported as an anchor-move
  caveat on any cross-arm comparison.
- HARD LIMITS (binding, honored): no readyDemand, t4/t5,
  or plentyCap change; no win-price/deed-gate change;
  no wild-router ally-join, field-fight, national-
  standing, or veteran-counting code; no Loop B
  food-economy code; no Loop A food-economy claim
  touched; no propose/tend verb added to or removed
  from any policy; no file owned by the sibling
  leadbelong arm touched. DIAG ONLY.

## Metric review (placeholder — completed in the evidence file)

- The evidence file carries the completed metric review:
  what the metric proved, what it missed, and any revision
  proposed for the NEXT run (never applied in-run).
