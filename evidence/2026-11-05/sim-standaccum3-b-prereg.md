# Pre-registration — arm sim-standaccum3-b (Loop B run fleshout-loop-b-20261105T0830Z)

DIAGNOSTIC ONLY, zero src/js game changes. No readyDemand move, no
VETSHAPE flip, no gate/price/deed change, no policy variant. This arm
takes the 2330Z run's named next blank #2 as restated in
evidence/2026-11-05/sim-winnability-round-0330.md ("Standing
accumulation, part 3 — the flat-20-while-dying mechanism (99145)").

## Canon note (read first, per the brief)

docs/CANON.md was read first. NO canon doc covers standing
accumulation as a process: docs/MONSTER-WAVES.md (Wave 4/5 sections)
states the three sources and the thresholds — war +25 per wave-3+
ledger kill point (per-type cap 2), bonds +34 per seasoned link
(30+ days, trust 40+), bread +20 per major feast (quality>=1); wave 4
at standing >= 100, wave 5 at >= 200 AND wave 4 faced — and
docs/DESIGN.md states standing is "earned through contributions and
crises, visibly, in words". The MECHANISM (what actually moves each
source, what caps or defers it) lives only in code:
src/js/standing.js (villageStanding / villageStandingTotal /
waveCombatReadiness / standingDeferral) and src/js/waveLedger.js
(scoreLedgerKill / waveLedgerPoints / per-type cap). This arm cites
code, not invented canon, for every mechanism claim. Nothing in this
prereg invents a standing source or rule beyond those two files plus
MONSTER-WAVES.md.

## Question

Why does a village that fights constantly sit at standing 20 while
it dies? Seed 99145 (encounterprod baseline band 99141–99148):
75 fights (41 wave-1, 16 wave-2, 18 wave-3), 35 kills, gated peak 20,
never unlocked wave 4 — STANDING was the blocker. From its existing
corpus (context only, not this arm's verdict): waveKillLog holds
ZERO wave-3 kills (all 35 kills are wave 1–2), w2pts 9, raw 20 on
every late snapshot. 20 is not a multiple of 25 (war) or 34
(diplomacy) — the only source that can make 20 alone is one major
feast (+20 plenty). This arm reproduces that anchor with a
decomposition instrument and tests whether the same shape recurs on
a fresh band.

## Corpus

- Anchor (reproduction, NOT judged): seed 99145, competent policy
  verbatim, default env, 150d death-aware horizon, same substrate as
  the 99141–99148 band family (encounterprod driver shape: daily
  snapshots via the policy.daily wrapper, post-run snapshot).
- Fresh band: 99191–99198 (8 seeds, verified free — no 99191–99198
  token appears in any evidence/2026-11-05/*.md or any perseed-*
  filename; neighbouring bands in use are 99171–99186 and the
  99149–99158 band).
- Policy: competent policy VERBATIM, default env, no policy-side
  lever. Same substrate as standaccum2 (vetprod instrument reused
  where it fits; extended below with the standing decomposition).
- Horizon: 150d death-aware (dead villages stop simulating, +10d
  tail max), same as vetprod / standaccum2 / encounterprod.
- Pilot gate: the 8-seed fresh band IS the pilot (this is a
  diagnostic; no confirm spend is pre-registered — a confirm would
  be a NEXT run's decision on a GO).
- Fresh runs: the standaccum3 driver re-runs all 9 seeds (anchor +
  8 fresh) and writes
  evidence/2026-11-05/perseed-standaccum3-b/. The analyzer reads
  this fresh corpus only for judged numbers. The 99141–99148 corpus
  is CONTEXT ONLY, never the verdict. Do NOT re-judge 99141–99148
  as this arm's verdict.

## Recorder (daily, per seed)

Vetprod instrument reused where it fits (fight wrappers,
roster/living, raw/gated, readiness5, w4 kills/killers, finalize
copies of waveKillLog + fallen + wavesFaced + scaleRank +
unlockedWave), EXTENDED with a standing decomposition on every
snapshot (all pure reads except the daily villageStandingTotal()
call, which is side-effecting exactly as standaccum/standaccum2
called it — peak release + hold beats — so parity holds and
unlockedWave() is never called mid-run):

- war / diplomacy / plenty and warPts / links / feasts from
  villageStanding() (the honest breakdown).
- w3pts / w4pts / w5pts from waveLedgerPoints(3/4/5); perType3 =
  the wave-3 ledger per-type map (which monster types scored, how
  many points each) — copied, not referenced.
- linksSeasoned = count of hierarchyState() links passing
  _linkSeasoned; linksTotal = link count; links = the regional+
  count already inside villageStanding() (diplomacy / 34).
- feastLogLen and feastsByQuality (quality histogram of
  state.feastLog).
- capped = standingPlentyCappedTotal(); peak = _standingPeakWave();
  defer4 / defer5 = standingDeferral(4/5) (deferred flag + short
  list), so the hold on the gated number is named per day.
- Cumulative fight counts by wave and wave-3 fight outcomes come
  from the fight wrappers + waveKillLog (authoritative for kills):
  kills by wave, w3 fights, w3 kills, w3 kill rate.
- Fight-say capture: same filter as standaccum2, cap 300, plus the
  standing hold/release beats (📡 / "next act" / "fifth draft" /
  "Standing" lines) so the sense-test can quote what the village
  is TOLD about its standing.

## Definitions (fixed before any judged sim)

- FLAT-20 seed (all four must hold):
  (a) endRaw <= 25 — raw standing at the last snapshot day is at
      most 25 (99145 ended at 20; 25 is the smallest war increment,
      so <= 25 means at most one feast's worth of plenty and zero
      war points — the village earned essentially nothing);
  (b) activity floor: total fights with wave >= 2 is >= 15 (the
      village fought the drafts that could move standing — 99145
      had 34 wave-2+ fights);
  (c) flatness: over the final min(50, runDays) days of snapshots,
      max(raw) - min(raw) <= 5 AND at least 3 wave-2+ fights occur
      in that window (standing does not move while fighting
      continues — the flatness is not "the village stopped");
  (d) no hold explains it: gated == raw on the last snapshot day
      (a hold cannot bind below t4 = 100: defer4 requires raw >=
      100, defer5/cap require raw/capped >= 200 — so a flat-20
      seed's flatness must be in the INPUTS, not the gate; the
      analyzer asserts this and reports any violation as an
      instrument anomaly, not as a flat-20 seed).
  Justification for the cuts: 20 is the observed anchor value and
  the only sub-25 standing a fighting village can reach (1 feast);
  the <= 5 band over the last 50 days is the anchor's observed
  shape (exactly 20 for the last 30 days of a 68-day run); the
  >= 15-fight floor excludes villages that simply never fought.
- 99145 MECHANISM (the candidate to reproduce, stated before the
  re-run so the reproduction is a check, not a story fitted
  afterwards): war = 0 because the village scores ZERO wave-3+
  ledger points — it fights wave 3 (18 fights on the anchor) but
  kills none of it, and scoreLedgerKill (waveLedger.js) scores
  KILLS ONLY, per-type capped at 2, so fights / flees / evasions
  score nothing; diplomacy = 0 because no seasoned link is
  regional+ (_linkRegionalPlus, standing.js — a lone seasoned bond
  scores 0); plenty = 20 from a single major feast. The gated
  number is flat because the RAW number is flat: no input moves.
  The anchor re-run must show war 0 AND w3pts 0 AND diplomacy 0
  AND feasts <= 1 for this candidate to stand as reproduced; any
  other decomposition (e.g. war > 0 with a hold, or plenty doing
  the moving) is a DIFFERENT mechanism and is reported as such.
- PREMISE (standaccum2 metric-review lesson — pre-registered
  SEPARATELY from any release count): count of seeds with two
  living wave-4 killers on any snapshot day (L(d) >= 2, derived
  from kill log + fallen via vetprod's killerFates, single source
  of truth). Reported as its own line so a future reader can tell
  "no premise" from "premise held, no release". This arm does NOT
  judge release; it judges standing accumulation.
- Killer / living killers: as in standaccum2 (killer = vid with
  >= 1 wave-4+ kill in waveKillLog; L(d) = firstDay <= d AND
  (deathDay null OR d < deathDay); same-day kill-and-die
  contributes to NO day). Snapshot ordering rule (standaccum2
  metric review): the snapshot fires after policy.daily, so a
  kill recorded during that day's play IS visible to that day's
  snapshot; a mismatch between derived L(d) and engine veterans
  on a banking day is reported, not silently resolved.
- Horizon rule (standaccum2 metric review): the post-run snapshot
  lands past the 150d horizon (d151–152); it is included in
  snapshot counts and peak reads, and its day is reported when it
  carries the peak.

## Pre-registered metrics (binding — a miss is NO-GO, never re-scored)

- PRIMARY: count of FLAT-20 seeds (definition above) on the fresh
  8-seed band, PLUS the identified mechanism (named input/cap with
  a code citation and a quoted trajectory).
- Verdict DIAG-GO iff BOTH: (i) the anchor reproduces — the 99145
  re-run meets the 99145-mechanism decomposition (war 0, w3pts 0,
  diplomacy 0, feasts <= 1, endRaw <= 25, >= 15 wave-2+ fights);
  AND (ii) >= 1 fresh-band seed is FLAT-20 with the SAME decomposed
  shape (war 0 from zero wave-3+ ledger points despite wave-3
  fights, diplomacy 0, plenty <= 20) — the mechanism is named, its
  code citation is standing.js/waveLedger.js as above, and a
  trajectory is quoted. (A flat-20 seed with a DIFFERENT
  decomposition counts toward the flat-20 count but does NOT
  satisfy (ii) — it is reported as a second mechanism, and the
  verdict on the 99145 mechanism is DIAG-NO with the new mechanism
  named.)
- Verdict DIAG-NO iff zero FLAT-20 seeds on the fresh band AND
  standing tracks activity there: at least 6 of 8 fresh seeds end
  with raw >= 100 OR show raw rising >= 50 over the run while
  meeting the activity floor — i.e. fighting villages DO accumulate
  standing on this band and 99145 does not reproduce as a pattern.
  (If zero flat-20 seeds but fewer than 6 seeds show
  activity-tracking, the verdict is UNDERPOWERED, not DIAG-NO —
  the band is too thin to say standing tracks activity.)
- UNDERPOWERED / INSUFFICIENT-DATA: INSUFFICIENT-DATA iff > 2
  seeds carry instrument errors (same rule as standaccum2).
  UNDERPOWERED iff fewer than 4 fresh seeds meet the activity
  floor (>= 15 wave-2+ fights) — the flatness question cannot be
  judged on a band that barely fights; the flat-20 count is still
  reported, but no GO/NO verdict is claimed. The anchor leg does
  not affect the UNDERPOWERED rule (it is a reproduction, not a
  band member).
- SECONDARY (all reported, none judged): per-seed table — days,
  end, unlockedWave, w2+ fights, w3 fights, w3 kills, w3 kill
  rate, kills by wave, endRaw/endGated, war/diplomacy/plenty at
  end, w3pts/w4pts/w5pts at end, per-type-3 map at end, links
  (total/seasoned/regional+), feasts (quality>=1 count, quality
  histogram), capped, peak, defer4/defer5 short lists on the peak
  day, flat-20 flag + which clause fails for non-flat seeds,
  premise count (seeds with L(d) >= 2 ever), maxLiving, killers
  ever; cross-check mismatches between derived L(d) and engine
  veterans count; analyzer peak rule: peaks initialize to 0, not
  null (encounterprod metric-review fix — a true 0-peak reports
  as 0).
- REPRODUCTION / SANITY (not judged): instrument errors must be 0
  on judged seeds; the driver must reproduce standaccum2's
  determinism property on a short leg (same seed twice, same
  summary) and on/off neutrality (instrument-off run does not
  change the trajectory summary at 30d). Balanced panel (§15):
  INAPPLICABLE for a pure diagnostic on a fresh band with no
  before/after comparison — stated, not fabricated.
- INSTRUMENT ERRORS: 0 required on all judged seeds for a clean
  verdict; the verdict degrades per the rule above otherwise.

## Sense-testing

At least one villager transcript/dialogue sample read from this
arm's own corpus and judged for meaning (not counts): for the
closest flat-20 seed (or the anchor if none is flat), quote what
the village is TOLD about its standing — the standing line / hold
beats / ledger beats — and judge whether the story makes sense
for a village that fights constantly and earns nothing. A village
told nothing while its standing sits at 20 is itself a finding.

## What this arm will NOT do

No mechanics change, no lever build, no gate/price/demand change,
no VETSHAPE flip, no re-judging of 99141–99148, no rebuild of the
ability-use follow-up (main-session owned). If the finding
motivates a lever, it is NAMED in the evidence as a next-arm
proposal only. The release question (premise + release among
premise-holding seeds) stays a future arm's question — this arm
pre-registers the premise count only so that future arm inherits
a clean separation.
