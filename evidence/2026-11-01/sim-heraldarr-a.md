# sim-heraldarr-a — Herald arrival path: wrapped proof of the follow re-entry candidate

- Run: fleshout-loop-a-20261101T1706Z (Loop A, axis scale-onramp).
- Arm: DIAG ONLY. Zero `src/js` changes, no gate threshold moved,
  no policy-default flip, no routing built (#1538 still pending).
- Verdict: **INSUFFICIENT-DATA** for the arrival question (contact
  gate fails on this pilot: 0 contacted seeds, 0 haven-tile
  arrival windows, 0 herald follow events). The follow MECHANISM
  itself is proven in the controlled leg, and the code-level
  constraint is proven with it: follow re-entry CANNOT land a
  monster on a tile that reads safe — so the 1415Z candidate as
  phrased cannot explain a Haven-tile arrival, and the raid-pin
  rival remains the prime suspect for the heraldplace episode,
  still unproven because no episode occurred on this pilot.
- Stack (named exactly; numbers NEVER compared across
  stacks/bases): substrate `scripts/policies/tableseat-nowait.js`
  (`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) + recorders reused
  UNMODIFIED: `fullseat-diag`, `wavegate-diag`. Deliberate
  difference from heraldplace (stated in the prereg): vet2 /
  vet2mfg / muster-diag omitted — arrival attribution does not
  need them.
- Band: pilot 8 seeds 95301–95308 — the SAME band as heraldplace,
  FIXED in the prereg before sims (the only band with a known
  contacted seed on the heraldplace base).
- Horizon: `DAYS=180`, death-aware.
- Corpus: `evidence/2026-11-01/sim-heraldarr-a/` (8 files, v2
  instrument — see the v1→v2 note below).
- Analysis: `evidence/2026-11-01/sim-heraldarr-a-analysis.json`.
- Preregistration: `evidence/2026-11-01/sim-heraldarr-a-prereg.md`
  (commit `c9f2e662`, plus pre-pilot correction commit `0cc2eee2`,
  both BEFORE any judged sim; instrument v2 commit `6a77456a`
  before the judged v2 pilot).
- Instrument files (this arm only): `scripts/sim-heraldarr-a-sweep.js`,
  `scripts/sim-heraldarr-a-lib.js`,
  `scripts/sim-heraldarr-a-analyze.js`,
  `scripts/sim-heraldarr-a-controlled.js`,
  `scripts/test-sim-heraldarr-a.js`.

## The answer in one paragraph

On this worktree's base, the Herald arrival episode does not
happen at all: 7 of 8 pilot seeds never place a Herald, the
one located Herald (95303, lair day 81) wanders south along
the east edge and never comes near Haven, and the run ends
in a lesser-seat win on day 90 before any meeting. The pilot
therefore cannot attribute the heraldplace (4,4) arrival —
there is no (4,4) arrival on it to attribute, and no Herald
ever sits on a from-tile during a scholar boundary crossing
(0 herald travel events in 3,091), so no follow event for
the Herald exists to classify. What IS proven, in a
controlled game rather than on the band, is the follow
mechanism itself: with the scholar and the Herald sharing a
tile, crossing to a non-safe tile carries the Herald along
("It followed you. The sky is here."), and crossing to the
safe Haven tile holds it at the treeline ("The sky stops at
the treeline — pacing, unwilling. The walls end the
argument."). The Herald's `follows` field is the string "it
does not follow. It precedes." — truthy in JavaScript, so
the branch fires for it despite the fiction. Because the
follow branch checks `isSafeTile` on the destination, a
Haven-tile arrival CANNOT be a follow-enter on current code
unless the tile did not read safe at that moment. The
heraldplace (4,4) episode therefore needs a different
landing step; raid pinning (`havenRaidTick` drafting the
nearest monsters straight onto the Haven tile, no safe-tile
check, then lingering re-pins) is the named rival, but it
did not fire for the Herald on this pilot either (raidBorn
false and lingering false on every located dawn; 0 raid-pin
or linger-pin moves), so the rival is still a suspect, not
a verdict.

## Screen counts (reported whatever the gate does)

| Measure | Pilot v2 (8 seeds) |
|---|---|
| Pool size | 8 (95301–95308, fixed in prereg) |
| Won | 5/8 (95301 d100, 95303 d90, 95305 d96, 95307 d90, 95308 d99 — all end `over-other`) |
| Won exactly day 90 | not measured by this instrument (won-day is not recorded; the won seeds' end days are 90, 90, 96, 99, 100 — reported as end days, never as won-days) |
| Survived un-won past day 120 | 3/8 (95302 d181, 95304 d126, 95306 d174) |
| Located (lair placed) | 1/8 (95303 only) |
| Located-but-unfaced (+ windows) | 1/8: 95303 (lair d81, run ends d90 — 9 days) |
| Contacted (+ per-channel contacts) | 0/8 (0 scholar, 0 villager) |
| Never-located | 7/8 |
| Haven-tile arrival windows | 0 (no landing class to report) |

The CONTACT GATE FAILS (0 contacted seeds). Per the prereg,
the verdict for the contact-dependent arrival question is
INSUFFICIENT-DATA, and NO confirm band runs: neither
pre-stated live-signal condition holds (no herald
follow-enter on the pilot; no contacted seed at all).

## Per-seed end fields (this band, this stack — not wall numbers)

| seed | class | days | end | rank | wave | table | won |
|---|---|---|---|---|---|---|---|
| 95301 | NEVER-LOCATED | 100 | over-other | national | 4 | 1 | 1 |
| 95302 | NEVER-LOCATED | 181 | survived | national | 3 | 0 | 0 |
| 95303 | LOCATED-UNFACED (9d) | 90 | over-other | national | 4 | 1 | 1 |
| 95304 | NEVER-LOCATED | 126 | village-lost | national | 4 | 0 | 0 |
| 95305 | NEVER-LOCATED | 96 | over-other | global | 4 | 1 | 1 |
| 95306 | NEVER-LOCATED | 174 | village-lost | global | 4 | 0 | 0 |
| 95307 | NEVER-LOCATED | 90 | over-other | national | 3 | 1 | 1 |
| 95308 | NEVER-LOCATED | 99 | over-other | global | 4 | 1 | 1 |

Pooled, for orientation only: end-national/global 8/8, table
5/8, won 5/8, wave 4 6/8, wave 5 0/8, median survival 100d.

## Q1 — FOLLOW MECHANICS (controlled leg: GREEN, all 8 steps)

Fresh synthetic game (seed 1), not a seed sim. The Herald
def's `follows` value read verbatim: `"it does not follow.
It precedes."` (string, truthy).

| Step | Expected | Actual | Pass |
|---|---|---|---|
| Herald spawned on scholar tile | 5,5 | 5,5 | yes |
| Follow-enter to (5,4) | 5,4 | 5,4 | yes |
| Follow-enter line | "It followed you" present | "It followed you. The sky is here." | yes |
| Follow-hold to Haven (4,4) | unchanged 5,4 | 5,4 | yes |
| Follow-hold line | treeline line present | "The sky stops at the treeline — pacing, unwilling. The walls end the argument. It's still out there." | yes |
| Control (gallowdeer, follows:false) spawned on scholar tile | 3,3 | 3,3 | yes |
| Control does not follow to (3,4) | not on dest | (4,3), wander-consistent | yes |

The control's (4,3) tile is the correction that forced the
prereg's bar-6 wording change (pre-pilot commit `0cc2eee2`):
tile entry runs worldTick, and wander moved the control to
an adjacent tile on its own. The control assertion is
therefore did-not-follow (not on the destination), not
did-not-move. A follow would land exactly on the scholar's
destination; (4,3) is adjacent-but-not-dest, i.e. wander,
not follow.

## Q2 — PILOT FOLLOW CLASSIFICATION (3,091 travel events, 0 for the Herald)

Travel events where a monster sat on the from-tile: 1,049
classified, 0 branch mismatches (tracked-herald definition,
v2 taxonomy). Branch counts, all monsters:

| Branch | Count | Expected line (corpus-wide needle count) |
|---|---|---|
| followEnter | 228 | "It followed you": 228 |
| followHoldSafe | 274 | treeline lines: 274 |
| followBlockedOccupied | 109 | boundary lines: 109 |
| oldMonsterNotFollows | 384 | (no follow line) |
| noTravel | 54 | (refused/blocked travel) |

The branch counts and the say-needle counts agree EXACTLY
(228/228, 274/274, 109/109) — every classified follow branch
in the pilot produced its expected line, and no follow line
appears without a classified branch. Follow-enter and
follow-hold are routine engine behavior in the wild
(Hushpuppy, Paparazzo, Anaconda Empress, and others follow
and hold across the band); the Herald is simply never the
monster on the from-tile. Herald travel events: 0.
Herald follow-enter events: 0. Nested wander moves observed
during other monsters' travelTo calls: 4 (all on 95303,
all duplicates of wander moves — see the v1→v2 note).

## Q3 — ARRIVAL ATTRIBUTION (pilot: nothing to attribute)

The only located Herald, 95303: lair (8,4) forest_floor on
day 81, scholar at Haven (4,4) at placement, Haven tile
type `haven` and `havenSafe` true at every located dawn,
lingering false and raidBorn false throughout, no flag
events, no raid-pin or linger-pin moves. Dawn trajectory:
(8,4) days 81–83 → (8,5) 84–86 → (8,6) 87 → (8,7) 88–89 →
(8,8) 90 (run ends, lesser-seat win). All 5 dawn-to-dawn
change windows attribute cleanly under v2 (1 spawn + 4
wander; 0 unattributed, 0 mismatches). Minimum distance to
Haven: 4. The Herald walks south down the east edge and
never approaches Haven, the scholar, or any villager tile;
the run ends 9 days after placement. No haven-tile arrival
window exists on any pilot seed, so no landing class can be
named from this pilot — for the Herald or for any rival.

Why the gate failed (structural, not a re-score): the band's
runs end before the titan window opens. Five seeds win via
the lesser seat on days 90–100 (`over-other`); the Herald
omen chain needs wave 4 + rank + staged omen days (0→1→2
over 4+9 days plus rolls) and a lair, so a run ending day
90 leaves at most days for one lair (95303: day 81) and no
time for a meeting. Of the three un-won seeds, one never
reaches wave 4 (95302, wave 3 only — no Herald omen is
possible), and two lose their villages (95304 d126, 95306
d174) without a Herald ever placing. On this base the
titan window is censored by early lesser-seat wins, not by
a missing arrival mechanism. (Base drift, stated not pooled:
heraldplace on its anchor measured 1 win / 6 located /
1 contacted on this band; this base measures 5 wins /
1 located / 0 contacted. The two corpora are different
bases and are never pooled or trended — the difference is
reported only to explain why the episode did not replay.)

## The two preregistered code corrections, confirmed at runtime

- CORRECTION A (confirmed): the follow branch DOES check
  `isSafeTile` on the destination (game.js `travelTo`,
  follow branch) — the 1415Z phrase "without a safe-tile
  check" is incorrect for the follow branch. Controlled
  proof: crossing to Haven holds the Herald and speaks the
  treeline line. Consequence: a Haven-tile arrival cannot
  be a follow-enter unless the tile did not read safe at
  that moment (tile type `haven` + `havenSafe` true on
  every located dawn here, so no such moment was observed).
- CORRECTION B (confirmed): the Herald's `follows` value
  is the truthy string "it does not follow. It precedes.",
  so the follow branch fires for the Herald. Controlled
  proof: follow-enter and follow-hold both fire for the
  Herald. The fiction ("it precedes") and the code
  (follows=true by truthiness) disagree; the code wins in
  the engine.

## Instrument v1→v2 note (pre-verdict fix, heraldplace precedent)

Pilot v1 (same band, same env) ran first and exposed an
instrument defect in analysis, not a game finding: the v1
sweep pushed a move event from the travelTo wrapper's
before/after diff, which double-counted nested wander moves
(a wander during travelTo was recorded once by the wander
wrapper and once as `travelOther`), breaking 4 of 5 chain
continuities on 95303 and mislabeling nested wander as a
branch "mismatch". Fix (commit `6a77456a`, before the
judged v2 pilot): the travelTo wrapper pushes NO move
events; follow legs are synthesized by the analyzer from
travelEvents (oldMonsterId 'herald' + followEnter);
mismatches count only tracked herald cases; the analyzer's
window move-set includes dawn-tick spawns stamped with the
dawn day (spawn fires inside `titanDawnTick` before the
dawn snapshot). Pilot v2 re-ran the same band and
reproduced v1's trajectories exactly on every done line
(same lairs, contacts, dawns, travel counts; 95303 moves
5 = 1 spawn + 4 wander, duplicates gone), so the v1 corpus
is superseded, not retained as judged data. The judged
corpus is v2 only.

## SENSE-TESTING: what the transcripts actually say

The follow lines read as people-visible mechanics, not
silent machinery: "It followed you. The sky is here." names
the arrival the moment it happens, and the hold line names
the reason it stops ("The walls end the argument") — a
player crossing home with a beast behind them gets both
the event and its cause. The pilot's Herald story, by
contrast, is silence: the lair line (omen 2, the only one
on the band) promises "It is WAITING," and then the beast
walks south for 9 days while the village wins the lesser
seat and the run ends. Nothing in the pilot contradicts
heraldplace's sense finding (a promised arrival with no
arrival mechanism); it extends it downward: on this base
the promise usually never even gets its lair before the
run ends. No (4,4)-arrival beat exists on this pilot to
judge, and none is invented.

## Proof and legs (evidence, not assertion)

- Proof test `scripts/test-sim-heraldarr-a.js`: **25 passed,
  0 failed** synthetic before the pilot; **92 passed,
  0 failed** synthetic + corpus legs after the pilot
  (classification cases incl. the lateral case and the
  truthy-string follows case; corpus legs re-derive
  mismatch counts, contact counts, and haven-window days
  from the judged corpus, plus the no-v1-duplicate-kinds
  leg).
- Contact gate: FAIL (0 contacted pilot seeds) — verdict
  INSUFFICIENT-DATA for the arrival question, per the
  prereg, not a failed DIAG-GO.
- Recorder-neutrality leg: ON vs OFF end fields identical
  on 95304 (days 126, gameDays 126, won 0, national 1,
  table 0, maxWave 4, endReason village-lost, endScaleRank
  national) — PASS. (Choice rule fixed in the prereg: first
  contacted seed if any, else 95304; no contacted seed
  exists, so 95304.)
- Determinism leg: 95303 ON re-run reproduces the judged
  per-seed JSON BYTE-IDENTICALLY (including `anchorCommit`
  — no commit landed between the judged sweep and the
  re-run) — PASS, stronger than the prereg's allowance.
- Capture errors: 0 on all 8 judged seeds.
- Branch/line consistency: followEnter 228 = "It followed
  you" 228; followHoldSafe 274 = treeline 274;
  followBlockedOccupied 109 = boundary 109.
- No confirm band run (neither pre-stated live-signal
  condition holds).

## Wall numbers (this band, this stack — orientation only)

Won 5/8, nationalEver/Final 8/8 (end rank national or
global on all 8), table 5/8, wave-4 reach 6/8, wave-5 reach
0/8, median survival 100d, deaths: 2 village-lost (95304,
95306) + 1 survived (95302) + 5 over-other wins. Full seat
and wave-5 fights remain unshown on this band; the wins
here are lesser-seat wins on days 90–100, which censor the
titan window rather than demonstrating scale reach.

## Metric review (mandatory)

- **Pre-registration bound the run.** Judged exactly
  against the prereg bars: 8 complete pilot seeds, contact
  gate failed as written (0 contacts — omen alone never
  used as the gate), lair recorded 1/1 spawned, daily
  positions on 100% of located days, movement classified
  on 100% of tracked days under v2 (5/5 change windows
  attributed, 0 unattributed), screen counts reported in
  full, neutrality on 95304, determinism on 95303
  (byte-identical), proof green, sense beats read. No
  re-scoring, no bar moved after seeing results. The one
  bar wording corrected pre-pilot (bar 6, control asserts
  did-not-follow) is recorded in commit `0cc2eee2` with its
  reason, before any judged sim.
- **Doubts filed, not resolved by re-scoring.** (a) The
  v1 double-count is fixed in v2 and the fix is
  demonstrated by v2's 5/5 attributed windows plus the
  exact v1→v2 trajectory reproduction — but a future arm
  should keep the "no travelTo-diff move events" rule,
  since any wrapper that diffs across a call with nested
  movers will double-count the same way. (b) Same-day
  ordering between a synthesized follow leg and same-day
  primitive moves is unknown; the analyzer tries both
  orders (documented allowance) — on this corpus the
  allowance never fires (0 herald travel events), so it
  is untested, not validated. (c) "Won exactly day 90" is
  not measured by this instrument (no won-day field); end
  days 90/90/96/99/100 are reported as end days only.
  (d) The controlled leg's setup placement (direct map
  assignment) is scaffolding; only the travelTo calls are
  judged. (e) This base differs from heraldplace's anchor,
  so the non-replay of the 95304 episode is a base fact,
  not a contradiction of heraldplace's corpus.
- **Revisions for the NEXT run, not this one.** A follow-up
  arrival arm needs a band/base where Herald episodes
  actually occur — the next arm should pick its band for
  LONG runs (wins past day 120, or a substrate where the
  lesser seat does not end runs on days 90–100), pre-register
  the same attribution instrument (v2), and let the
  raid-pin rival be tested where a raid can actually draft
  the Herald (this pilot's raids never touched it:
  raidBorn false, lingering false, 0 pin moves). A
  raid-pin proof arm should additionally wrap the draft
  selection itself (which monsters were sorted nearest),
  not just the pin diff, so a non-draft is distinguishable
  from a draft-that-missed.

## Blanks filled or documented

- Filled (measured): follow mechanics for the Herald
  (enter/hold/blocked conditions, truthy-string follows,
  safe-tile hold) via the controlled leg; the pilot's
  follow-branch census for all monsters (1,049 classified
  calls, 0 tracked mismatches, exact branch/line
  agreement); the 95303 located-but-unfaced trajectory
  (lair, southward wander, 9-day window, censored by a
  day-90 lesser-seat win); the structural reason the
  contact gate fails on this base (early lesser-seat wins
  censor the titan window).
- Documented, not filled (for later arms, NOT this one):
  (a) the heraldplace (4,4) arrival episode itself — still
  unattributed; follow-enter is ruled out as a safe-tile
  landing in general, raid-pin is the named rival, neither
  is proven for that episode; (b) #1538 (refused-face
  routing, re-sound after a lost muster-fight) remains
  pending and untouched by this arm; (c) whether any band
  on current master still produces Herald contacts at all
  (0/8 here vs 1/8 on heraldplace's anchor) is an open
  measurement question for the next arrival arm.

## Convergence state

converging (measurement, not a lever): the scale-onramp
axis now has the follow mechanism proven and the
safe-tile constraint proven, but the Herald arrival path
itself is still unattributed — the episode that motivated
this arm did not occur on this base. No game change
landed and no wave-5 or full-seat reachability is shown.

## Readiness

Ready for coordinator merge ('merged locally, pending ship'
is the coordinator's call) — NOT pushed, NOT version-
bumped, NOT live-verified. No `[needs-eyes]` (DIAG
instrumentation only; nothing player-facing changed).
