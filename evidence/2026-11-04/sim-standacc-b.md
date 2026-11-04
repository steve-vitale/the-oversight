# Standing accumulation on gear-ready seeds — Loop B, run fleshout-loop-b-20261104T0550Z, arm sim-standacc-b

Axis: scale-onramp (standing directive: the scale wall). DIAG-ONLY
arm: scripts + instruments + evidence, ZERO src/js changes. This
arm is NEXT-RUN ARM QUEUE item (3) from the 2026-11-03 21:13
re-point: the 99107 pattern, where all four bars were met for days
but standing sat short of release. Gates and win prices stay
UNTOUCHED (no gate/price/deed change is made or proposed as an
implementation here — one named lever CANDIDATE for the next run
is proposed at the end, only).

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-standacc-b-prereg.md` (commit
1fb4c3383). In short:

- Question: on villages that get gear-ready (or near the door),
  what standing income is missing — which named source (war /
  diplomacy / plenty, and within war which wave, within diplomacy
  which funnel stage) accounts for the gap to capped 200, and does
  any sink/loss exist?
- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM
  (current file at this anchor), default env. Seeds 99101–99108.
  Horizon 140 days, death-aware (dead villages stop; +10d tail
  max as implemented by runDays). WHY 140: the gearbar round's
  median survival was ~90d and ready5's 76.5d; 140 covers the
  76–80d ready window plus the ~90d median plus tail, without
  simulating months past every village's death.
- Instrument: daily FULL standing decomposition — war / diplomacy
  / plenty, warPts, links, feasts, raw, capped, plenty shave,
  gap to 200, readiness-5 bars, ready-but-unreleased days
  (capped >= 200 AND not ready AND peak < 5), peak, scale rank,
  wave-4/5 faced, wave-3 rung — PLUS the diplomacy funnel
  (hierarchy links classified total/active/seasoned/regional+
  via the game's own read-only reads) and war headroom (ledger
  points per wave 3/4/5, per-type points vs the per-type cap,
  max earnable points per wave). Daily component DELTAS are
  computed by the analyzer: every gain/loss by source is a
  number, never a narrative. The snapshot NEVER calls
  villageStandingTotal() or unlockedWave() (side-effecting);
  ONE end-of-run unlockedWave() call is reported separately
  and never counted as a natural door-open.
- "Gear-ready seed" (qualifying seed, prereg-defined): >= 3 of
  the 4 readiness-5 bars met at any snapshot, OR capped >= 150
  at any snapshot, OR >= 1 readiness-5-ready day.
- PRIMARY METRIC + GO BAR: DIAG-GO iff the release shortfall is
  traced to a NAMED, measurable standing source/sink (or a named
  missing income) on at least 6 of 8 pilot seeds, OR on every
  gear-ready seed found if fewer than 6 qualify (count stated
  honestly). "Traced" = ONE named source's missing/shaved amount
  >= the gap to capped 200 at the seed's best capped day, OR
  the diplomacy channel entirely absent with the funnel showing
  why. Otherwise DIAG-NO-CANDIDATE with the numbers. A miss is
  NO-GO, never re-scored mid-run.
- BALANCED PANEL (§15): INAPPLICABLE — pure diagnostic, no
  before/after change; no comparison is fabricated and none is
  attached. Stated explicitly, not omitted silently.
- HARD LIMITS (binding, honored): no readyDemand, t4/t5, or
  plentyCap change; no win-price/deed-gate change; no
  wild-router ally-join, field-fight, national-standing, or
  veteran-counting code; no Loop B food-economy code; no Loop A
  food-economy claim (vfrac/hurthome) touched. DIAG ONLY.

## Door / standing rule, as found in code (current anchor)

From `src/js/standing.js` and `src/js/waveLedger.js` (read, not
assumed; NO canon doc covers standing — stated in the prereg
instead of inventing canon):

- Standing = war (25 x ledger points, waves 3+4+5; kills only,
  per-type cap 2 points per monster id) + diplomacy (34 x
  seasoned REGIONAL+ links: seasoned = 30+ days, trust 40+;
  regional+ = LEAD/BELONG/LEAGUE polity participation — a lone
  bond with a splinter village scores NOTHING) + plenty (20 x
  major feasts, quality >= 1).
- Thresholds t4 = 100, t5 = 200. Plenty counts at most 100
  toward the t5 bar (capped = war + diplomacy + min(plenty,100)).
- Readiness-5 demands: armored 4 at P >= 15 (WORN only), armed 6,
  tricks 3, veterans 2 (living roster with a wave-4+ kill).
- Release to wave 5 requires capped >= 200 AND readiness-5
  ready; while capped >= 200 but not ready, the gated total
  holds at 199 (the "199" in older reports is the HOLD value,
  not a target — this arm quotes capped vs 200).
- NO decay, NO charge, NO sink exists in standing.js: standing
  moves only when ledger points, qualifying links, or feasts
  move. A standing LOSS can only come from a link ceasing to
  qualify. The instrument classifies every negative component
  delta; a "sink" claim must show its delta, not its theory.

## Anchor / calibration gate (binding)

Anchor: b4abf8bab765 (instruments commit; the pilot's
anchorCommit field on all 8 per-seed JSONs). 1819's numbers
(99107 ready days 76–80, standing 150) and ready5's numbers
(99107 dead day 38, 0 ready days on 8/8, 2 seeds clearing capped
200) are PREVIOUS anchors and are NOT pooled with this arm's
numbers and NOT cited as this arm's baseline. This arm's
baseline is its own judged leg. Any comparison to 1819/ready5
below is descriptive, anchor-move-aware, never a before/after
claim. The pilot itself is the calibration: the 9910x band on
THIS anchor does not reproduce the 1819 99107 pattern at all
(99107 here: 71 days, maxWave 3, best capped 25).

## Judged leg — per-seed table (best capped day)

Proof `scripts/test-standacc-20261104.js` 11/11 before the leg
(10 fixture tests + live harness smoke; the analyzer's
release-line classifier and a null-best-snapshot crash were
both caught and fixed by the proof run — see metric review).
Instruments commit b4abf8bab. 0 instrument errors, 0 gate
veteran mismatches, 0 orphan/unlinked kill rows on all 8 seeds
(839 snapshots).

| seed | days | end | scale | maxWave | bestDay | best capped (war/diplo/plenty) | gap | shave | links funnel (tot/seas/reg+) | maxBars | ready days | ready-unrel days |
|------|------|-----|-------|---------|---------|-------------------------------|-----|-------|------------------------------|---------|------------|------------------|
| 99101 | 140 | survived* | village | 4 | 134 | 210 (150/0/60) | 0 | 0 | 0/0/0 | 3 | 0 | 8 |
| 99102 | 127 | lost | village | 4 | 107 | 165 (125/0/40) | 35 | 0 | 0/0/0 | 3 | 0 | 0 |
| 99103 | 118 | lost | village | 4 | 74 | 160 (100/0/60) | 40 | 0 | 0/0/0 | 3 | 0 | 0 |
| 99104 | 139 | lost | village | 4 | 128 | 270 (250/0/20) | 0 | 0 | 0/0/0 | 3 | 0 | 32 |
| 99105 | 84 | lost | village | 4 | 72 | 215 (175/0/40) | 0 | 0 | 0/0/0 | 3 | 0 | 13 |
| 99106 | 96 | lost | village | 4 | 86 | 140 (100/0/40) | 60 | 0 | 0/0/0 | 3 | 0 | 0 |
| 99107 | 71 | lost | village | 3 | 66 | 25 (25/0/0) | 175 | 0 | 0/0/0 | 3 | 0 | 0 |
| 99108 | 68 | lost | village | 3 | 60 | 70 (50/0/20) | 130 | 0 | 0/0/0 | 3 | 0 | 0 |

\* 99105 in ready5's table means "survived to horizon" — here
99101 "survived" = alive at the 140-day horizon cap, not a win
and not ready (0 ready days, 1 veteran at best).

Pooled: ready days 0 on all 8 seeds. Door opens (peak 5) 0.
Wave-5 faced 0. Wave-4 faced 6/8 (99107/99108 never face wave 4;
peak 4 reached on the same 6). Wins 0/8, national 0/8, table
0/8 — scaleRank is `village` on every snapshot of every seed.
Median survival 107 days (sorted 68, 71, 84, 96, 118, 127, 139,
140; 99101 censored at the horizon), max 140 (censored).

## Finding 1 — diplomacy is not stalled. It never starts. (8/8)

The diplomacy funnel is 0/0/0 on EVERY snapshot of EVERY seed:
total hierarchy links 0, seasoned 0, regional+ 0 — not a
single inter-village link exists at any point in any village.
This is not a misread: `hierarchyState()` returns
`mshipState().links`, the same roll `villageStanding()` scores
from, and diplomacy = 0 in the game's own breakdown on every
snapshot. It converges with ready5's independent instrument
(diplomacy 0 on all 8 seeds at its anchor). The missing income
is the WHOLE diplomacy channel: no bonds are formed, so there
is nothing to season and nothing for the regional+ filter to
pass or fail. The prereg's "seasoned-but-not-regional+" stall
case never arises — there are no seasoned links to stall.

Per the prereg's trace rule, this traces the standing gap on
the 5 seeds that HAVE a gap (99102, 99103, 99106, 99107, 99108:
kind `diplomacy-absent-no-links`), and is present-but-irrelevant
on the 3 seeds that clear 200 without it (99101, 99104, 99105:
gap 0, kind `no-gap`, untraceable by construction — there is no
shortfall to trace). Judge: traced 5/8, dominant kind
diplomacy-absent-no-links 5/5. The GO bar demands >= 6/8, so
the verdict is DIAG-NO-CANDIDATE by the letter of the prereg
(see metric review for why the bar undercounts, and what the
corrected bar would say). The NAMED missing income is
diplomacy, absent on 8/8 seeds.

## Finding 2 — standing is not the release blocker on the closest seeds

Three seeds clear capped 200 (99101 day 134, 99104 day 108,
99105 day 72) and STILL never release, because readiness-5 is
never ready on any seed. The 53 ready-but-unreleased days
(99101: 8, days 134–141; 99104: 32, days 108–139; 99105: 13,
days 72–84) are held on veterans on 100% of those days
(99101: veterans short 8/8; 99104: 32/32, with weapons short on
12 and armor on 11 late as gear decays; 99105: 13/13, weapons
on 9, armor on 2). Veterans is short on nearly every snapshot
of every seed (short-day counts: 139, 125, 116, 137, 82, 95, 70,
67). At best capped day the veteran counts are 1, 1, 1, 0, 0, 0,
0, 0 — no seed ever holds 2 living veterans at once, and no
seed ever logs a readiness-5-ready day. This reproduces
ready5's binding finding on a new anchor: the door is held
correctly, and the key is a second living wave-4 killer — not
standing. Standing clears 200 on the seeds that get far, and
falls short only on seeds that die early or kill little.

## Finding 3 — no sink, no cap bind, no war exhaustion

- SINKS: zero negative component deltas on all 8 seeds (0
  negDeltas). Standing never decreases anywhere: no decay, no
  charge, no link loss (there are no links to lose). The
  "sink" hypothesis is measured dead, not merely unproven.
- PLENTY CAP: shave 0 on all 8 seeds at best day (max plenty
  60, from 3 feasts; the cap binds at 100, i.e. 5 major feasts).
  Feasts per seed at best day: 3, 2, 3, 1, 2, 2, 0, 1. Bread
  alone is not the road these villages walk, and the cap is
  not what holds any of them back.
- WAR HEADROOM: 48–57 ledger points of headroom remain at best
  day on every seed (max earnable = defs-per-wave x per-type
  cap 2; war is nowhere near its ceiling). War is NOT
  exhausted — villages die before earning more of it, and
  wave-4 kills are scarce: 5 wave-4 kill events in total
  across 8 villages (99101: 1, 99102: 1, 99103: 1, 99104: 0,
  99105: 2, 99106–99108: 0). War at best day is overwhelmingly
  wave-3 points (w3:w4 splits: 5:1, 4:1, 3:1, 10:0, 5:2, 4:0,
  1:0, 2:0). The war shortfall on gapped seeds is a KILL
  shortfall (few kills, mostly wave 3), not a cap shortfall —
  which is the kill-conversion arm's territory, not a standing
  lever's.

## Wall numbers (this pilot, not wall movement)

Wins 0/8. Villages lost 7/8, survived to horizon 1/8. National /
table: 0/8 (scaleRank village throughout). Readiness-5-ready
days 0. Wave-5 unlocks 0/8, wave-5 faced 0/8, wave-4 faced 6/8,
wave-4 unlocks (peak 4) 6/8. Wave reach: wave 4 on 6 seeds, wave
3 on 2 seeds (99107, 99108). Arc reach: not instrumented by
this arm (stated, not faked). Median survival 107 days (max
140, censored). Death causes over 487 villager deaths:
villager combat 229, combat 85, the wild 55, expedition 46,
monster 29, sickness 7, starvation 5, the arena 5, a wound that
wouldn't close 5, ambush 4, the night 2, contest 2, thirst 2,
named-monster causes 9 (Choir Toad 2, Grief Counselor 1,
Glasswing Darter 1, Drum-Belly 1, Static 1, The Terms of
Service 1, The Landlord 1, alien 1, a stranger 1). Combat
accounts for 314/487 deaths (64%) — villages die fighting,
not starving, on this band.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

The hold beats pass: weekly cadence exactly (99104: days 108,
115, 122, 129, 136), each naming the true short bar in the
village's own terms — "blood your fighters (0 of 2 veterans)"
while standing-sufficient, then gear decay named as it happens
("armor the village (1 of 4 fighters armored); put weapons in
hands (1 of 6 armed)"). The day-25 stage line names the three
sources honestly in-fiction: "Get me STANDING — blood, bonds,
or bread. Rack up the kills, season your alliances." Feast
lines are concrete and honest about quality: a feast that
"isn't plenty" says so, and only quality>=1 feasts move the
plenty count — the narration and the ledger agree. Veteran-kill
beats name killers on camera ("Diana just put down The Big
Beast... on CAMERA. That's a veteran kill, folks. REMEMBER the
name") — standing gains read as consequences of deeds done.

ONE FLAG (narration vs gate mismatch, appended to
sim-findings.md, not chased here): the "veteran kill" on-camera
beat fires for WAVE-3 kills too. On 99101 day 64, Diana's
buffering kill and Sanne's callback kill both drew "That's a
veteran kill, folks" beats, but both kills are wave 3, the
waveKillLog wave-4 list is empty that day, and readiness-5
veterans reads 0. The System celebrates wave-3 kills as
veteran kills while the wave-5 door counts only wave-4+
kills. Whether "veteran" is loose show language or a real
mismatch is a design question for the next arm — the counts
here prove the divergence, not the intent.

Capture noise (instrument note, not a game finding): the
say-line sample also catches long keepsake lines (Tote Bag,
Trail compass, Mixtape) whose later words trip the
standing-word patterns. The hold/release classification is
unaffected (strict patterns), but a future sense sample
should match on the FIRST words of a line, not any word.

## Village assessment (plain words)

Picture eight villages playing competently for two to four
months each. Seven die; one is still alive at the horizon but
no closer to the fifth draft than the dead ones. Nobody ever
stands ready for wave 5 — not because the village lacks
standing (three villages clear the standing bar for weeks,
one sitting at 270 with standing to spare), but because the
readiness bar demands two living fighters who have each
killed a wave-4 beast, and no village ever has two at once.
The villages that fall short on standing fall short for one
clean reason: they have never made a single friend outside
their own fences. No alliances, no bonds, no links at all —
the diplomacy half of the standing ledger is a blank page in
every village, so the whole climb rides on kills and feasts
alone. Kills come, mostly wave-3 ones, and feasts come, one to
three major ones per village — enough to clear 200 when the
village lives long and kills well, not enough when it dies
young. And standing, once earned, never leaks away: nothing
decays, nothing is charged, nothing is lost. The villages
don't bleed standing. They just never make bonds, and they
never bank a second veteran. The door is not stuck: it is
correctly held, and correctly announced every week, for
villages that have not yet earned the key.

## Metric review (§14 — no in-run re-scoring)

- The prereg's DIAG-GO legs were judged exactly as written;
  no metric moved. The verdict is DIAG-NO-CANDIDATE because
  traced = 5/8 < 6/8. BUT the bar as written undercounts by
  construction: a seed with no standing gap (gap 0) can never
  be "traced," so any pilot where >= 3 seeds clear standing
  cannot pass however clean the decomposition is. Here the 3
  no-gap seeds are precisely the seeds that prove standing is
  NOT the blocker — penalizing the pilot for them inverts
  the evidence.
- Proposed revision for the NEXT run (not applied here):
  judge the standing-gap trace ONLY over seeds WITH a gap
  (here: 5/5 traced, all to diplomacy-absent-no-links — that
  revision would read DIAG-GO), and judge release-blockage
  separately over all seeds (here: veterans short on 8/8,
  53 ready-but-unreleased days). The two questions — "what
  standing income is missing" and "what blocks release" —
  must not share one denominator again.
- Instrument corrections made DURING proof (before the leg,
  not in-run): (1) the release-line classifier conflated the
  standing release beat with wave 2/3/4 sector releases
  ("Wave N talent has been released into your sector") —
  both share "RATINGS ARE UP"; fixed to the 📡 ellipsis beat
  + "greenlit the fifth draft" for standing releases, with
  sector releases counted separately (corrected counts: 1
  standing wave-4 release per wave-4 village, 0 wave-5
  releases, 2–3 sector releases per seed). (2) A null-best
  snapshot crash in the analyzer (empty daily list), caught
  by the new classification fixture test. Both fixes are in
  the committed analyzer + proof (11/11); the judged leg's
  per-seed JSONs hold raw lines, so the corrected
  classification was computed from the same corpus, no
  sims re-run.
- The "qualifying seed" definition (>= 3 bars OR capped >= 150
  OR a ready day) qualifies all 8 seeds here, but maxBars
  counts bars met at ANY snapshot, not simultaneously: at
  best capped day, only 99101 meets armored+armed+tricks
  together. A future "gear-ready" definition should require
  the gear bars SIMULTANEOUSLY (same snapshot) to mean what
  it says. This pilot's qualifying count (8) is reported
  under the prereg definition, not revised.
- The "199" shorthand stays retired: this arm quotes capped
  vs 200 and the short bars throughout.

## Verdict — DIAG-NO-CANDIDATE (per the prereg bar, with the named source stated)

Traced 5/8 (< 6/8 required); dominant kind
diplomacy-absent-no-links 5/5; diplomacy absent on 8/8 seeds;
no sink found (0 negative deltas); plenty cap never binds
(shave 0/8); war headroom 48–57 points on every seed. The
named missing income is DIPLOMACY — but the release blocker
on the closest seeds is VETERANS, not standing, and the
prereg bar's denominator flaw (no-gap seeds untraceable) is
recorded above for the next run's prereg.

## Next blank, precisely (no fix in this run)

The next arm is a DIPLOMACY-PIPELINE arm, not a standing-price
arm: why do competent villages form ZERO inter-village links
in 140 days — is link formation reachable at all under
competent play (other policies? longer horizons? does the
policy ever travel to / propose to another village?), and if
links do form elsewhere, where do they stall (seasoning?
polity?). NO gate/price/deed arm follows from this evidence:
standing clears 200 on the seeds that get far, the plenty cap
never binds, and war headroom is vast — lowering a bar would
paper over the missing bonds and the missing second veteran,
not measure them. The veteran-kill narration vs wave-4-only
gate divergence (wave-3 kills celebrated as "veteran kills")
goes to the findings backlog as an open question.

## Proof and landing

- Proof: `scripts/test-standacc-20261104.js` — 11/11 PASS
  (best-day/gap/shave math, plenty-cap trace, diplomacy
  stalled/absent traces, untraced control, negative-delta
  detection, qualifying test, ready/ready-unreleased math,
  standing-vs-sector release classification, judgeGo
  semantics incl. the <6-qualifying pool rule, live harness
  smoke: capped math, gate == recount, peak-stable snapshot,
  funnel + ledger shapes, live wave-4 kill event). Re-run
  green after the analyzer/test fix below.
- Arm commits on branch sim-standacc-b (coordinator merges
  via --ff-only; committed on branch, pending coordinator
  merge — no push, no bump, no live verification by this
  worker):
  - 1fb4c3383 sim-standacc-b prereg (before any judged sim)
  - b4abf8bab sim-standacc-b instruments + proof 10/10
    (zero src/js)
  - (this landing) sim-standacc-b pilot + evidence +
    analyzer/test fix (release classification, null-best
    crash) + proof 11/11
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-standacc-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-standacc-b/` (8 files,
  standacc-pilot run); scripts `standacc-instrument-20261104.js`,
  `standacc-driver-20261104.js`, `standacc-analyze-20261104.js`,
  `test-standacc-20261104.js`.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after all three commits
  (prereg + instruments + this landing); repaired each time
  via HEAD-blob `update-index --cacheinfo` and verified
  `git status` empty + `git diff HEAD` empty. The commits
  themselves were always correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers (verified before reporting).
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence).
- Heartbeats: worktree heartbeated per the coordinator's
  addition (registry `sim-standacc-b` alive through the run).
