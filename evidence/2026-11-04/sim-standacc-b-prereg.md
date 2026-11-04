# Standing accumulation on gear-ready seeds — Loop B, run fleshout-loop-b-20261104T0550Z, arm sim-standacc-b

Axis: scale-onramp (standing directive: the scale wall). DIAG-ONLY
arm: scripts + instruments + evidence, ZERO src/js changes. This
arm is the NEXT-RUN ARM QUEUE item (3) from the 2026-11-03
21:13 re-point: standing accumulation on gear-ready seeds — the
99107 pattern where all four bars were met for days but standing
sat short of release. Gates and win prices stay UNTOUCHED unless
Steve explicitly orders otherwise: this arm measures what
standing income is missing; it does not retune the door. A named
lever candidate for the NEXT run may be proposed, never
implemented here.

## Canon read before this prereg

- docs/CANON.md (manifest). No canon doc covers standing / deeds /
  scale directly: the manifest lists no standing doc, and a grep of
  docs/ finds standing only inside code-adjacent docs (TABLE.md,
  DIRECTIVES.md mentions). Per the brief, that absence is stated
  here instead of inventing canon: the standing rule below is read
  from code (src/js/standing.js, src/js/waveLedger.js) at the
  current anchor, not from a canon doc.
- Grounding read: evidence/2026-11-03/sim-gearbar-a.md (seed 99107
  met all four bars days 76–80, standing 150 vs the 199 hold
  value — the 1819 anchor), sim-ready5-a.md + sim-ready5-a-prereg.md
  (WARNING honored: on the newer anchor the same seed 99107 died
  day 38 before wave 4; base drift is real), sim-scale-onramp-round-1819.md
  (wall numbers of the gearbar round).

## Door / standing rule, as found in code (current anchor, not taken on faith)

From src/js/standing.js (villageStanding, standingCfg,
standingPlentyCappedTotal, standingDeferral, waveCombatReadiness)
and src/js/waveLedger.js (scoreLedgerKill, waveLedgerPoints):

- Standing = war + diplomacy + plenty, where:
  - war = 25 x ledger points for waves 3+4+5 (waveLedgerPoints;
    scoreLedgerKill feeds ONLY from recordWaveKill — kills only,
    never engagements/flees; per-type cap 2 points per monster id,
    breadth not throughput; counter-kill bonus shares the cap
    unless WAVE_EXTRA_CAP is set, default 0).
  - diplomacy = 34 x seasoned REGIONAL+ links (seasoned = 30+
    days, trust 40+; regional+ filter: LEAD — a seasoned
    subordinate link inside Haven's polity; BELONG — Haven
    subordinate inside the primary's polity; LEAGUE — a seasoned
    covenant/trade peer link inside its league polity. A lone
    bond with a splinter village counts NOTHING — courtship, not
    regional power).
  - plenty = 20 x major feasts (quality >= 1, feast log capped
    at 60 entries).
- Thresholds: t4 = 100, t5 = 200. Plenty counts at most
  plentyCapT5 = 100 toward the t5 bar (capped total = war +
  diplomacy + min(plenty, 100)).
- Readiness-5 demands: armored 4 at armor P >= 15 (WORN only),
  armed 6 (equipped or carried), tricks 3 (counters known),
  veterans 2 (living roster with a wave-4+ kill in waveKillLog).
- Release to wave 5 requires capped >= 200 AND readiness-5
  ready; while capped >= 200 but not ready, the gated total
  holds at t5-1 = 199 (the "199" in 1819 reports is the HOLD
  value, not a target — retired shorthand per ready5's metric
  review; this arm quotes capped vs 200 and the short bars).
  While raw >= 200 but capped < 200, the plenty-cap hold also
  binds at 199. Once released, _standingPeakWave = 5 ratchets
  the floor at 200 forever.
- NO decay, NO charge, NO sink exists in standing.js: standing
  moves only when ledger points, qualifying links, or feasts
  move. A standing LOSS can therefore only come from a link
  ceasing to qualify (seasoned/regional+ status lost) or, in
  principle, feast-log/ledger state change — the instrument
  tracks daily component deltas and classifies every negative
  delta, so a "sink" claim must show its delta, not its theory.
- unlockedWave() == 5 additionally requires the wave-3 rung
  (day >= 25 AND wave-2 ledger points >= bar) AND wave-4 faced.
  Peak release alone does not put wave 5 in the pool.

## Anchor / calibration gate (binding)

Anchor: current master at run start (recorded in every per-seed
JSON as anchorCommit). 1819's numbers (99107 ready days 76–80,
standing 150) and ready5's numbers (99107 dead day 38, 0 ready
days on 8/8, 2 seeds clearing capped 200) are PREVIOUS anchors
and are NOT pooled with this arm's numbers and NOT cited as
this arm's baseline. This arm's baseline is its own judged leg.
Any comparison to 1819/ready5 in the evidence file is
descriptive, anchor-move-aware, never a before/after claim.
The pilot itself is the calibration: if the 9910x band yields
no gear-ready / near-door village on this anchor, that is the
finding (reported honestly), and the fresh-seed extension below
— not a silent re-seed — is how the band question is answered.

## Pre-registration (committed before any judged sim)

- Question: on villages that get gear-ready (or near the door),
  what standing income is missing — which named source
  (war / diplomacy / plenty, and within war which wave, within
  diplomacy which funnel stage) accounts for the gap to capped
  200, and does any sink/loss exist?
- Policy: scripts/policies/competent.js {competent} VERBATIM
  (the CURRENT file at this anchor), default env.
- Seeds: 99101–99108 (the 9910x band, comparable at band level
  only — trajectories are anchor-specific).
- Horizon: 140 days, death-aware (dead villages stop
  simulating; +10d tail max per the loop brief's death-aware
  rule as implemented by runDays). WHY: the gearbar round's
  median survival was ~90d and ready5's 76.5d; 140d covers the
  76–80d ready window from 1819 plus the ~90d median plus
  tail, without simulating months past every village's death.
  A village alive at 140 is censored, reported as survived,
  not as a win.
- Instrument: scripts only, zero src/js. Daily snapshots of
  the FULL standing decomposition — war / diplomacy / plenty
  components, warPts, links (count), feasts (count), raw,
  capped, plenty shave (raw − capped when capped binds),
  gap to 200 (capped vs 200), readiness-5 bars, readiness-5
  ready flag, ready-but-unreleased days (capped >= 200 AND
  NOT ready AND peak < 5), peak, scale rank, wave-4 faced,
  wave-3 rung — PLUS the two funnel decompositions that make
  a "missing income" claim checkable:
  (a) diplomacy funnel per snapshot: total hierarchy links,
  seasoned links, regional+ links (via the game's own
  hierarchyState / _linkSeasoned / _linkRegionalPlus reads —
  read-only, the same reads villageStanding makes);
  (b) war headroom per snapshot: ledger points per wave
  (3/4/5), per-type points vs the per-type cap (how many
  ledger points remain earnable before caps bind), and
  kills by wave from the kill-event wraps.
  Daily component DELTAS are computed by the analyzer from
  consecutive snapshots: every gain/loss by source is a
  number, never a narrative. The snapshot NEVER calls
  villageStandingTotal() or unlockedWave() (both are
  side-effecting: peak recording + beats). Door-open events
  are observed as the ENGINE announces them (release
  say-lines + peak transitions). ONE end-of-run
  unlockedWave() call is reported separately and never
  counted as a natural door-open.
- "Gear-ready seed" (qualifying seed, defined here so the GO
  bar is checkable): a seed whose village at ANY snapshot
  meets at least 3 of the 4 readiness-5 bars, OR reaches
  capped >= 150 (near-door), OR logs >= 1 readiness-5-ready
  day. Seeds that never qualify still contribute their full
  standing trajectory to the pooled decomposition, but the GO
  bar judges on qualifying seeds (see below).
- PRIMARY METRIC: standing trajectory on gear-ready seeds —
  per qualifying seed, the gap to capped 200 at its best
  capped day, decomposed into (i) diplomacy shortfall
  (34 x missing links, with the funnel stage where links
  stall), (ii) plenty-cap shave, (iii) war shortfall by wave
  with cap headroom, (iv) any measured loss/sink (negative
  component delta with its cause).
- GO THRESHOLD (DIAG-GO): the release shortfall is traced to
  a NAMED, measurable standing source/sink (or a named
  missing income) on at least 6 of 8 pilot seeds, OR on
  every gear-ready seed found if fewer than 6 qualify
  (state the count honestly). "Traced" means: for that seed,
  ONE named source's missing/shaved amount is >= the gap to
  capped 200 at its best capped day (e.g. diplomacy 0 while
  the funnel shows N seasoned-but-not-regional+ links, or
  plenty shave >= gap, or war headroom exhausted with the
  gap still open), computed from the decomposition, not
  asserted. Otherwise DIAG-NO-CANDIDATE with the numbers.
  A miss is NO-GO, never re-scored against a friendlier
  metric mid-run.
- SECONDARY (reported, not judged): wall numbers every run —
  wins, national / table (scaleRank), wave 4–5 unlocks
  (peak transitions) and facing (waveEngaged), median
  survival, wave reach 1–5, Arc reach where instrumented
  (not instrumented by this arm — stated, not faked),
  death-cause shares, ready days, ready-but-unreleased days.
- SENSE-TEST (SENSE-TESTING LAW): sample say-lines /
  transcripts from gear-ready villages (strict hold/release
  patterns + a capped standing-word sample: draft / standing /
  veteran / feast / bond / link / polity / realm — the
  ready5 "standing"-substring flood is avoided by using
  these patterns only); judge whether standing gains/losses
  read as consequences of things villagers did, and flag
  anything robotic, static, or repeated.
- BALANCED PANEL (§15): INAPPLICABLE — pure diagnostic, no
  before/after change; no comparison is fabricated and none
  is attached. Stated explicitly, not omitted silently.
- TELEMETRY DEVIATION CHECK: the coordinator runs it after
  evidence; noted, not run by this arm.
- FRESH-SEED EXTENSION (only if the band yields zero
  qualifying seeds): run seeds 99201–99208 under this same
  prereg (same policy, horizon, instrument) and judge the GO
  bar on that batch instead, stating the extension plainly.
  No third batch without coordinator approval.
- HARD LIMITS (binding, honored): no readyDemand, t4/t5, or
  plentyCap change; no win-price/deed-gate change; no
  wild-router ally-join code; no field-fight damage/staying
  code; no national-standing code; no veteran-counting code;
  no Loop B food-economy code; no Loop A food-economy claim
  (vfrac/hurthome) touched. DIAG ONLY.

## Metric review (placeholder — completed in the evidence file, §14)

- The evidence file carries the completed metric review: what
  the metric proved, what it missed, and any revision proposed
  for the NEXT run (never applied in-run).
