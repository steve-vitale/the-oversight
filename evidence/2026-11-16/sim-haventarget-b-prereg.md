# sim-haventarget-b — PREREG (binding)

Run: fleshout-loop-b-20261116T1130Z (Loop B), axis winnability chain, arm
sim-haventarget-b — DIAG: expeditions targeting the Haven tile (tracker
blank 9, awayhaven finding #2). Branch `sim-haventarget-b` (worktree
`~/workspace/worktrees/sim-haventarget-b`). Base: master
`612bb699467601778d5023539a46e73b2ef4e8e9` at arm start (the worktree
HEAD; the coordinator rebases at landing and re-runs proofs).
Binding prereg: THIS file — frozen before any judged sim. The instrument
(driver, analyzer, proof test) is built AFTER this commit; no judged
numbers exist yet. Commit this file FIRST (`scripts/safe-commit.sh`
"sim-haventarget-b: frozen prereg — ..." — see the worker brief), then build.

## The question, in plain words

Expeditions can target the Haven tile. The awayhaven arm found three
wanderers on seed 102133 whose expeditions' destination tile IS Haven
(4,4): emma_larsen (two trips, since day 117 and 121), adaeze_nwosu
(three trips, since 114, 117, 121), somchai_prasert (one trip, since
120) — node home throughout, legs and finds accruing, the away flag
live because the expedition is live. This DIAG counts, on a fresh
shared band, every expedition whose destination is home: how many,
how much party-time / legs / finds / clock they consume, what they
cost the village versus a matched non-home expedition, and — the
mechanism question — WHICH launch path picks home as a destination.

## Prior art (read first)

- `evidence/2026-11-16/sim-awayhaven-b.md` + prereg — the subject:
  (b) flags, 18 away-while-at-Haven members, the trip-state reading.
  Its §Findings #2 states the open question verbatim: "Expeditions
  can target the Haven tile. The expedition system picks (4,4) as a
  destination and runs a full expedition (legs, finds, clock) while
  the party stands at home. Whether an expedition to home is intended
  is a question for whoever owns expeditions — the (b) flags are the
  symptom, not the defect." This arm IS that whoever.
- `evidence/2026-11-16/sim-seedpaths-b.md` + prereg — the instrument
  pattern this arm extends (driver/analyzer/proof shape, D1/D2/D3,
  wall table, single shared band with a second leg as the reference).
- `docs/CANON.md` (read first), `docs/MAP.md` (travel canon).
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  expedition destination picking. `docs/MAP.md` §7 says villager
  departures, expeditions, and meandering stay clamped to the 0..8
  board — but says nothing about excluding the Haven tile itself from
  expedition targets. Nothing in this evidence invents canon: every
  mechanism below is grounded in the code read (file:line cited) and
  will be confirmed or overturned by the measured corpus.

## Code read (hypotheses to test, NOT verdicts)

All line numbers in THIS tree at arm start (they drift daily;
re-locate in the proof test by function name, not line number):

- **H1 — the random launch path CANNOT target home.** `startExpedition`
  (`src/js/villager-agency.js:468`, no-opts call from the agency tick
  chance roll at :453): `dist = 1 + Math.floor(R() * maxD)` (≥1),
  one of 8 directions, `tx = clamp(hx + d[0]*dist, 0, 8)`,
  `ty = clamp(hy + d[1]*dist, 0, 8)`. From interior Haven (4,4) the
  target can never equal (4,4): the step is ≥1 in some direction and
  the clamp cannot return it — clamping back to home only happens at
  a board edge (e.g. hx=0, direction −x). The win-plan random
  fallback (`src/js/win-plan.js:415-422`) has the identical shape.
- **H2 — the directed launch path CAN target home, via plan.node.**
  `launchParty` (`src/js/win-plan.js:412-424`) and the dawn-brain
  mirror `vbrainExecuteDepart` party_launch
  (`src/js/villager-brain.js:1020-1044`) use the plan's known node as
  the shared target: `if (plan.node) { tx = plan.node.nx;
  ty = plan.node.ny; }`. `plan.node` is the holder's node at seed
  time (`winPlanSeedFromFight`, `src/js/win-plan.js:241`: `if (node)
  plan.node = { nx: node.nx, ny: node.ny }`, node read from
  `npcNode(vid)`), and seeding fires only for wave-3+ beasts (:225).
  So a wave-3+ beast met, evaded, or fled AT Haven seeds node (4,4),
  and the later party launch expeditions to (4,4).
- **H3 — a Haven-target trip still consumes the full expedition.**
  `expeditionLeg` (`src/js/villager-agency.js:559`): the node never
  moves (already at target), but legs accrue, XP accrues
  (tracking/survival + discovery deed credit), and one encounter roll
  fires per leg at dist 0 (`mChance = 0.10 + dist*0.035` = 0.10):
  monster / cache / sign / stranger. `expeditionReturn` (:862)
  stocks pantry finds and narrates "back from past the <dir>"
  regardless of distance. While `st.exped[vid]` is live the member
  does no objective work (`src/js/villager-objectives.js:1483` skips
  expedition members) — a Haven-target member is flagged away and
  idle for the whole trip while standing at home.
- **H4 — the fiction does not notice.** The departure lines
  (`villager-agency.js:544-549`: "Going far this time. Don't wait
  up." / "Out past the ridge") and the return line (:934: "back from
  past the north") are drawn identically for a Haven-target trip.
  Sense-testing will quote the actual lines from the corpus.

If the corpus shows ANY Haven-target trip with a random (no-opts)
origin, H1 is wrong and the code read is overturned in the evidence
— the origin field, not the code read, is the judge.

## Design — the recorder (frozen)

One shared band, TWO legs, zero `src/js` game-code change on either:

- **OFF leg** = master as-is, recorder off (trajectory reference).
  **ON leg** = master as-is + recorder wraps only (the judged leg).
  The judged comparison is ON (measured expeditions) against the OFF
  leg's trajectories (neutrality — the recorder must not move the
  game). No seed call, no lever, no balance change: this is a DIAG
  reproduction of the subject, NOT a change.
- Recorder wraps (scripts-side in `scripts/haventarget-driver-20261116.js`,
  pure reads + writes to driver-local arrays — no game-state writes,
  no RNG draws; `HAVENTARGET_RECORDER=off` skips installing them):
  - `startExpedition` — launch row: seed, vid, name, profile,
    day/part, hx/hy, tx/ty, dist, duration, opts present/absent,
    origin (stack-derived, see Classification), launch-time plan
    snapshot `{stage, target, node}` (null when no plan), villager
    node at launch, dawn commit kind when present.
  - `expeditionReturn` — completion row: the `ex` record cloned
    BEFORE the original runs (legs, finds with kcal, encounters
    strings, meat), pantry kcal before/after (pure reads), health at
    return, alive, return day/part, clock parts elapsed
    (return day/part minus since day/part).
  - `expedDeath` — death row: vid, monster, day, the expedition
    record at death.
  - End-of-run open-expedition snapshot: any `agencyState().exped`
    entry still live at horizon / village death (trip never
    returned).
  - Daily trajectory signature (BOTH legs, for D2): day, alive
    roster count, cumulative deaths, pantry kcal — pure reads.
  - Say capture (ON leg only): `Game.say` lines matching
    /expedition|🎒|🧭|back from|shoulders a pack/i, capped, with day
    — for sense-testing.
- A trip is **complete** if it returned, **died** if `expedDeath`
  fired, **open-at-end** if still live at horizon / village death.
  Member-days on a trip = elapsed clock parts / 4 (parts per day),
  counted per member (inviter + companion both).

## Classification (frozen — every expedition gets exactly one of each)

- Destination: **haven-target** iff `tx == hx && ty == hy`
  (Haven tile = the village px/py at launch, fallback 4,4);
  else **off-home**.
- Origin (from the launch row's opts + call stack, recorded raw):
  - `random-agency` — no opts, stack through the agency tick
    chance roll (`villager-agency.js` agencyTick).
  - `winplan-party_launch` — opts present, stack through
    `win-plan.js` `launchParty`.
  - `vbrain-party_launch` — opts present, stack through
    `villager-brain.js` `vbrainExecuteDepart`.
  - `directed-other` — opts present, stack through neither of the
    above (name the caller in the row).
  - `unknown` — no origin could be derived. Must be 0; any unknown
    row names the missing hook (stack frame / opts shape) in the
    analyzer output. No silent unknowns.
- The analyzer RE-DERIVES both classes from the raw recorded fields
  (D3): haven-target recomputed from (tx,ty,hx,hy); origin
  recomputed from opts + stack frames. Mismatch 0.

## Primary metric + GO bar (frozen)

Primary metric: **share of expeditions classified by destination AND
origin, unknown 0**, on the ON leg.

GO (instrument validity) iff ALL hold:

1. **100% of ON-leg expeditions classified** (destination + origin)
   — every launch row gets both classes; unknown 0.
2. **Corpus 16/16 files parse** (8 OFF + 8 ON legs, one file per
   seed per leg).
3. **Proof green**: `scripts/test-haventarget-b.js` — static checks
   (zero `src/` diff; wraps named; wave-4 id set live) + determinism
   D1 (recorder ON twice, seed 102201, 60d, identical expedition
   corpus) + D2 (recorder ON vs OFF, seed 102201, 60d, identical
   daily trajectory signatures + identical wall fields) + D3
   (analyzer re-derivation, mismatch 0 on the ON corpus), green on
   the instrument tip.
4. **Wall numbers reported** for the ON leg (national by standing
   ≥200 AND by scaleRank, table, wins, wave 4/5 unlocked, median
   survival, wave-4 kills, deaths) — and the OFF leg's wall numbers
   beside them for the neutrality read.
5. **Measurement bar**: every Haven-target trip carries a named
   launch mechanism with its launch-time `plan.node` shown
   (== target, or null / different — stated per trip), so the
   random-vs-directed question is answered per trip, not assumed;
   and the matched cost table (haven-target vs same-seed non-home
   per-leg rates) is reported with denominators, even if the
   Haven-target count is 0 (then the verdict is "none on this band",
   with the awayhaven band-102133 mechanism cited as the existence
   proof, not re-measured).

The VERDICT is the count table itself: Haven-target expeditions /
all expeditions per seed, their party-days / legs / finds / clock,
their per-leg yields vs matched non-home expeditions, and the launch
origin of every Haven-target trip. A DIAG GO means the instrument is
valid and the table is trustworthy — not that any mechanism "wins".
No balanced panel (DIAG, no game change) — stated in the evidence.

## Seed bands (fresh, verified)

- Band: **102201–102208** (8 seeds), OFF leg first (recorder off),
  then ON leg (recorder on), identical seeds, same policy/horizon.
- FRESH: verified 2026-11-16 by the worker: `grep -rn "102201"
  evidence/*/sim-*-prereg.md` returns nothing — no evidence .md
  names any of these seeds (only float/kcal fragments in old JSONs,
  per the coordinator). This is the run's shared band (all arms).
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568, 102131–102138
  (the poolmarginals forbidden list, carried over, plus the
  awayhaven/seedpaths band).

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  sha256 `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`,
  verified by the worker before the prereg commit; same blob the
  poolmarginals / awayhaven / seedpaths preregs cite).
- OFF anchor = the instrument commit (driver + analyzer + proof
  test, recorder OFF by env); ON anchor = the same commit, recorder
  ON by env (no `src/` change between legs — the legs differ ONLY
  by the `HAVENTARGET_RECORDER` env flag). Both SHAs are recorded
  in the evidence file (they are the same commit; the env flag is
  the leg).
- Determinism: D1/D2 as in §Primary metric. Drift check D3 (same
  shape as seedpaths): the analyzer's re-derivation must pass on
  every launch row; the full-band OFF-vs-ON daily-signature
  comparison must show 0 divergences (any divergence is
  investigated, not waived).

## Sense-testing (mandatory)

Read the say lines for Haven-target launches and returns as stories:
does anyone in the fiction notice the party "travelled" home? Quote
the departure line and the return line for at least one Haven-target
trip (or state that none fired on the band). One line that
contradicts the trip's reality ("Going far this time" while standing
at home) is a finding, quoted verbatim — not a rounding error.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the random path ever produce a Haven-target trip (H1
  overturned)? If so, by what clamp / edge path?
- Did every Haven-target trip carry a `plan.node` equal to its
  target — or did any arrive directed with node null / different?
- Was 150d the right horizon, or did Haven-target trips cluster at
  the tail / before the first death?
- Did the OFF leg reproduce the ON leg's trajectories exactly (D2
  full-band), or did the recorder move anything?
- Is "party-days" the right cost unit, or did Haven-target trips
  cost something the legs/finds/clock table misses (e.g. pool
  exclusion while flagged away)? Name it if the corpus shows it.

## Wall numbers (report every run)

National (standing ≥200 AND scaleRank), table, wins, wave-4 unlocked,
wave-5 unlocked, median survival, wave-4 kills, deaths — per leg.
