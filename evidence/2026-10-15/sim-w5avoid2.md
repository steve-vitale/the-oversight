# sim-w5avoid2 — W5-AVOIDANCE DOCTRINE, CLEARING HALF DELETED

Arm: `sim-w5avoid2` (oversight-flesh-out-loop, run fleshout-a-2026-10-15-0015,
ARM 1, axis scale-onramp).
Type: POLICY LEVER (scripts/policies/w5avoid2.js, W5AVOID2=1, default OFF).
Named successor of the r36 `sim-w5avoid` kill (evidence/2026-10-14/sim-w5avoid.md
— the preserved avoidance spec lives there).

## The doctrine (avoidance ONLY — the clearing half is deleted, not rebuilt)

The r36 kill's mechanism finding: the avoidance half worked where it fired
(s33: 7 avoids -> 180d + table), while the clearing half — ported to all
waves with no wave floor — fed 8 successive scholars to w1/w2 packs and
caused the 3d primary miss. The clearing half is DELETED. The layer does
exactly three things:

1. NEVER engage wave-5 monsters — no triggerEncounter marches on w5
   lingerers, no scholar marches on w5 threats at the treeline. w5 threats
   are named, counted, and narrated ("The Editor holds the treeline — no one
   answers that. The village gives it the night."). A travel guard wraps
   Game.travelTo during the parent's daily and refuses marches onto tiles
   holding a LIVE wave-5 monster (null + honest beat, the engine's own
   refusal convention); the haven tile itself, combatExit barrier exits, and
   mid-combat are never refused.
2. Dawn watch ALERTS only, no clearing — the watch names and counts w5
   threats (raiders/lingerers/followers), fires the avoidance beats, counts
   watch days. It never sets pendingEncounter, never calls triggerEncounter,
   for ANY wave. Non-w5 threats are left to the engine.
3. Treeline-follower avoidance — a w5 follower (def.follows) lingering at an
   adjacent tile is never answered; the travel guard refuses the scholar's
   march onto its tile. The scholar never walks out alone to it.

Honest verbs only, no silent branches — every avoidance, alert, and refusal
is counted in ctx and narrated. Design calls (Steve can overrule): avoidance
governs the LAYER's choices, not engine-initiated haven defense (sanctuary
semantics); unknown-wave threats are not treated as w5 ("if you don't know,
it doesn't show" cuts both ways). Fixed from r36's sense notes: the layer's
beats no longer prefix "The" (monsterDisplayName already carries the
article — "The The Editor" is gone).

## Pre-registration (MEASUREMENT.md §§9–12, 14) — written BEFORE the sweep

- PRIMARY METRIC: median survival (days) across the 8-seed suite.
  GO = armed ≥ control + 15d.
- GUARDRAILS: national ≥ control−2; no new death mode (cause-family level,
  count/seed floor n≥2 per r34 metric review); w1/w2 scholar combat deaths
  ≤ control (the r36 successor-feed must not leak back through the parent
  policy). A miss on any is NO-GO — never re-scored.
- POLICY: control = leadfeast + FEASTSCALE_R13=1 (W5AVOID2 unset);
  armed = leadfeast+w5avoid2 + FEASTSCALE_R13=1 + W5AVOID2=1.
- SEEDS: 11/22/33/44/55/66/77/88 (the plentycost road, 8-seed pilot).
- HORIZON: 180d death-aware (runDays stops on Game.over / village-dead tail).
  Why 180: the r36 kill showed the w5 phenomenon is late; shorter caps
  truncate exactly the long survivors the doctrine protects.
- Why +15d: r36's full doctrine (avoidance + the harmful clearing) moved
  median +17d; +15d is the honest bar for "avoidance alone keeps the lift
  without the clearing-half harm."
- KNOWN RISK: the avoidance surface is thin — r36 measured 8 avoidances +
  16 march refusals across 8 seeds (armed wave-5 only 3/8). If the surface
  is too thin to move the median, KILL honestly per §14 — a miss is NO-GO,
  never re-scored against "but it fired where it reached."

## Convergence state

killed-at-pilot

## Results — KILLED AT PILOT (primary missed by 15d)

8-seed identical-seed pilot (leadfeast control vs w5avoid2 armed, 180d):

| metric | control | armed | GO / guardrail | verdict |
|---|---|---|---|---|
| median survival | 86d | 86d | ≥ 101d | **NO-GO (−15d)** |
| national | 3/8 | 3/8 | ≥ 1 | PASS |
| table | 1/8 | 1/8 | (no bar) | — |
| wave-4 unlocks | 7/8 | 7/8 | report-only | — |
| wave-5 unlocks | 5/8 | 5/8 | report-only | — |
| won | 0/8 | 0/8 | — | — |
| exiled | 1/8 | 1/8 | — | — |
| new death mode (n-floor 2 seeds) | — | none | none | PASS |
| w1/w2 scholar combat deaths | 21 | 21 | ≤ 21 | PASS |

Layer telemetry (armed, 8 seeds): alertDays 95, w5Avoided 122
(raider 10+ / lingerer / follower 49+ — the s33 split was 10/2/49),
w5MarchRefused 104. The avoidance FIRED — heavily on the three wave-5
seeds, zero on the other five.

Post-unlock Haven combat channel split (raiddef instrument, report-only):
control draw 5 / raid-night 10 / lingerer 1 / other 6 (non-draw/unlocker 3.40);
armed draw 8 / raid-night 7 / lingerer 1 / other 4 (non-draw/unlocker 2.40).
Directionally fewer non-draw haven deaths, but on 5 unlockers it is noise.

Per-seed (armed vs control): s11 154 vs 145 (+9, 20 avoids/14 refusals);
s22 86 vs 86 (0 surface); s33 145 vs 111 (+34, 61 avoids/43 refusals);
s44 180 vs 180 (41 avoids/46 refusals, no effect — the village was already
winning); s55 85 vs 85; s66 75 vs 75; s77 75 vs 75 (1 refusal); s88 58 vs 58.
Five of eight seeds have no wave-5 surface at all — the doctrine is inert
for them by construction.

## Why it missed — the mechanism (not noise)

The avoidance fires exactly where the wave-5 surface exists and helps
there: s33's treeline Rerun/Editor (61 avoidances, 43 march refusals) took
the village 111→145d with scholar combat deaths 8→5 — the s33 story from
r35/r36, now answered with avoidance alone. s11 gained +9d. But the median
moves on the MIDDLE seeds, and five of eight never reach wave 5: the
doctrine cannot move a median when it is inert for the majority. s44 shows
the ceiling: 41 avoidances on a village already surviving 180d with the
table — pure narration, zero days.

Per §14 the primary miss is NO-GO; the arm is killed, the layer deleted.
The w1/w2 guardrail held exactly (21 = 21) — the r36 successor-feed did
not leak back through the parent policy, which is the one thing the
clearing-half deletion was built to guarantee.

## Village assessment

s33 is the doctrine's vindication and its epitaph in one seed — again. The
village that r35 lost three scholars in three days to the editor(w5) now
names the Rerun and the Editor at the treeline and gives them the night:
61 avoidances, 43 refused marches, scholar combat deaths 8→5, 111→145d.
The avoidance beats read as village prudence (see sense notes). But the
village that never meets a Producer cannot be saved by Producer-avoidance:
s22/s55/s66/s77/s88 run the exact same days on both sides, dying to
wave-1/2 packs, starvation, and dehydration — the threats the doctrine
cannot see by design. s44 is the honest counterweight in the other
direction: a village already at the table doesn't need the doctrine's
protection; 41 avoidances buy zero days.

## Sense-test notes (SENSE-TESTING LAW — transcripts read)

Probe: `scripts/probe-w5avoid2-sense-20261015.js`, seed 33, 145d, 102
doctrine beats captured. The avoidance reads in-fiction and legible:
"d109: 🌙 The Rerun holds the treeline — no one answers that. The village
gives it the night." / "d109: 🚫 The Editor is on that ground — the scholar
holds, and walks around." The village-agreed names arrive once earned (day
99+ the threats are "The Rerun" / "The Editor" / "The Spoiler"; unnamed
threats show the honest strange descriptor — "scissors, and the world
getting shorter holds the treeline" — which is the engine's own knowledge
gating, not a layer bug). The r36 double-"The" is fixed. A player
understands exactly what happened and why.

BLANK (would fix if the arm lived): beat volume. A threat that lingers for
weeks produces a dawn alert AND a refusal beat EVERY day (s33: 102 beats —
the Rerun "holds the treeline" d99–d114 daily). Narratively coherent —
the threat IS still there — but high volume; a future arm should dedupe to
one named beat per threat per multi-day linger (first sighting + "still
there" weekly), not daily. Also the alert and the refusal fire as two beats
for the same threat on the same day; they are two different decisions
(the village's dawn assessment vs the scholar's refused march) but read
repetitively back-to-back.

## Blanks filled / documented

- DOCUMENTED (design): the w5-avoidance surface is thin AND concentrated —
  122 avoidances + 104 refusals across 8 seeds, but 5/8 seeds have zero
  surface. The doctrine helps the wave-5-reaching minority (s33 +34d, s11
  +9d) and is inert for everyone else. Any future avoidance doctrine needs
  either a broader trigger surface or a per-firing / unlocker-conditional
  metric — the median cannot move when the majority never meets the threat.
- DOCUMENTED (method): the control baseline DRIFTED between r36 and this
  run on identical seeds, identical policy, identical horizon — s11 170→145,
  s33 128→111, s44 103→180, s55 168→85, s66 54→75 (s22/s77/s88 unchanged).
  Siblings landed on master between the runs. Cross-run control comparisons
  are INVALID on the hot tree; only within-sweep identical-seed comparisons
  bind. (Appended to sim-findings.md as open.)
- DOCUMENTED (instrument): the sense probe's first version filtered beats
  on engine flavor ("treeline") and buried the doctrine's own beats past the
  print limit — fixed to match the doctrine's phrases only ("no one answers
  that" / "gives it the night" / "shutters its doors" / "on that ground").
- FILLED (measured): the clearing-half deletion held — w1/w2 scholar combat
  deaths 21 = 21, and s44's r36 successor-feed (8 scholars fed to hushwolf
  packs d9–27) did not recur on any seed. The deletion is verified, not
  assumed.

## Metric review (§14)

Primary missed cleanly (86 vs 86, need 101) — no re-score, no metric doubt
about the VERDICT. But the metric review proposes for the NEXT run:
1. The median bar cannot judge a threat-conditional doctrine: 5/8 seeds are
   inert by construction, so the median is decided by seeds the doctrine
   cannot touch. The honest metric for a next avoidance arm is conditional
   on reaching the threat surface (wave-5 unlockers' survival, or a
   per-firing days-saved estimate) — pre-registered, not re-scored.
2. The no-new-death-mode guardrail's n-floor held; dehydration appeared
   armed-only at n=1 seed (the longevity confound again — s44's 180d run).
   The rate-based form proposed in sim-raiddef.md is still needed.
3. Control drift (above) means every future arm must treat its own sweep's
   control as the ONLY baseline — never inherit numbers from a prior run's
   evidence file, even on identical seeds.

## Wall numbers (this pilot, 8 seeds)

Control: national 3/8, table 1/8, won 0/8, wave-4 7/8, wave-5 5/8,
median 86d, max 180d, exiled 1/8.
Armed: national 3/8, table 1/8, won 0/8, wave-4 7/8, wave-5 5/8,
median 86d, max 180d, exiled 1/8.
(The wall didn't move: identical medians, identical reachability. The
avoidance fired 122 times and bought +34d on s33 — but the wall is a
median game and the doctrine is a minority game.)
