# sim-standing199-a — Standing-199 plateau read (backlog #2098)

- Run: `fleshout-20261111T0215Z`, Loop A, arm `sim-standing199-a`,
  worktree `~/workspace/worktrees/sim-standing199-a`, branch `sim-standing199-a`.
- Base: master `cb7cd6695`. Prereg:
  `evidence/2026-11-10/sim-standing199-a-prereg.md` (written BEFORE any
  judged sims). Band **170233–170240** (8 seeds, fresh — see prereg
  seed-freshness record). Horizon **150d max, death-aware**. Policy:
  `scripts/policies/competent` verbatim. Default env. No game-code
  change — MEASUREMENT ONLY. Zero `src/js`.
- Instrument: `scripts/standing199-instrument-20261110.js` (daily
  snapshots: raw/gated/capped, war/diplomacy/plenty split, ledger per
  wave, link roll with count reasons, feast log, readiness-4/5 bars,
  living wave-4+ killer vids, standingLine). Driver:
  `scripts/standing199-driver-20261110.js`. Analyzer:
  `scripts/standing199-analyze-20261110.js` (pure, deterministic —
  two runs byte-identical on the corpus). Proof:
  `scripts/test-standing199-a.js` — **35/35 PASS** (hold-kind fixtures,
  all seven trajectory classes, decay/veteran-death derivation,
  reconciliation, determinism, live harness smoke leg: 1 seed, 30d,
  0 instrument errors, every snapshot reconciles).
- Corpus: `evidence/2026-11-10/perseed-standing199-a/` — 8 pilot files
  plus `standing199-s170233-sense.json` (supplementary sense leg, see
  Sense-test). Summary: `evidence/2026-11-10/standing199-summary.json`.

## Verdict: DIAG-GO

Judged STRICTLY against the prereg GO bar:

1. **8/8 seeds classified**, 0 unclassified, none forced:
   released 3, defer5 2, standing-short 3. PASS.
2. **Accumulation-code question answered with citations** (see
   § The answer, below): every pin traces to one named hold in
   `villageStandingTotal()`, with the line refs. PASS.
3. **0 instrument errors** across all 8 seeds (~1,060 daily
   snapshots); 0 reconciliation errors (raw == war + diplomacy +
   plenty and capped == war + diplomacy + min(plenty, 100) on every
   snapshot; gated == 199 ⟺ a 199-hold recomputes, 0 mismatches).
   PASS.
4. **Wall numbers reported** (see § Wall numbers). PASS.

**DIAG-GO.** Convergence state: scale-onramp axis. The 199 plateau is
now READ on current master: it is a stage gate (the defer5 readiness
deferral), not a cap and not points exhaustion — and on this band the
gate opened 3/8 times, which is new against the knowledge-b picture
(0 releases) and the standaccum-b picture (1/8).

## The answer, in plain words

**What holds villages at 199 is the combat-readiness deferral — a
stage gate, and on this band it is always the veterans bar.**

The number 199 is `t5 − 1`: wave 5 unlocks at standing 200, and
`villageStandingTotal()` (`src/js/standing.js:173–201`) holds the gated
total at 199 while either of two things is true. The pilot separates
them per seed, per day:

- **Plenty cap** (standing.js:182): raw >= 200 but capped < 200 —
  bread counts at most 100 toward wave 5. **0 days on this band.**
  No seed pinned at 199 by the cap, ever.
- **Defer5** (standing.js:184): capped >= 200 but
  `waveCombatReadiness(5)` not ready. **All 5 pinned seeds pinned
  this way, 215 pin-days total** — and on every first-pin day the
  ONLY short bar was **veterans** (demand: 2 living wave-4+ killers;
  first-pin counts 0–1, armor/armed/tricks all met).
- **Points-source exhaustion** is the third candidate and it is real
  but separate: the 3 standing-short seeds never reached raw 200 at
  all (peaks 150/185/195). Their 199 was never pinned because it was
  never approached.

So the plateau has one mechanism: the village earns standing past 200
on blood and bread, and then waits at the fifth door for a second
living wave-4 killer. The other three readiness bars never bind at
the pin on this band (armor 5–10 of 4, armed 6–10 of 6, tricks 26–38
of 3 at first pin). Tricks never binds anywhere — knowledge is free,
as the defer5gate arm found. The gate is a **retention gate**: it
demands two killers alive *at the same time*, and killers die (4
veteran deaths on 170233 alone, d58/d87/d95/d141).

The release, when it comes, comes the same day the second veteran
arrives — all three releases are veteran-arrival days (170234 d113,
170236 d121, 170238 d105). Two of the six release veterans are
`visjoin_*` vids: visitors who joined the village already carrying a
wave-4 kill. The bar can be satisfied by incomers, not only by
home-blooded killers.

## Per-seed table

| seed | days | end | class | peak raw (day) | pin199 days (first) | first-pin short bars | ready5 days | release day | max bars | vet-1 days | vet deaths |
|---:|---|---|---|---:|---:|---|---|---:|---:|---:|---:|---:|
| 170233 | 150 | survived | defer5 | 320 (d121) | 97 (d55) | veterans (1/2) | 0 | — | 3 | 38 | 4 |
| 170234 | 150 | survived | released | 560 (d139) | 50 (d63) | veterans (0/2) | 8 | d113 | 4 | 58 | 4 |
| 170235 | 150 | survived | defer5 | 225 (d150) | 54 (d98) | veterans (1/2) | 0 | — | 3 | 52 | 0 |
| 170236 | 150 | survived | released | 300 (d148) | 41 (d80) | veterans (1/2) | 8 | d121 | 4 | 29 | 3 |
| 170237 | 83 | lost | standing-short | 150 (d82) | 0 | — | 0 | — | 3 | 0 | 0 |
| 170238 | 149 | lost | released | 310 (d136) | 23 (d82) | veterans (1/2) | 22 | d105 | 4 | 8 | 3 |
| 170239 | 57 | lost | standing-short | 185 (d42) | 0 | — | 0 | — | 3 | 14 | 1 |
| 170240 | 133 | lost | standing-short | 195 (d132) | 0 | — | 0 | — | 3 | 2 | 0 |

Classes: released 3, defer5 2, standing-short 3. Plenty-cap 0,
mixed-199 0, defer4-pin 0 (0 pin-99 days in the whole corpus — wave 4
releases cleanly once raw hits 100), unclassified 0.

## Pin anatomy

- **First-pin shape is identical on all 5 pinned seeds.** Gated
  hits 199 on the day raw crosses 200 (170233 d55 at raw exactly 200;
  170234 d63 at 205; 170235 d98 at 200; 170236 d80 at 200; 170238 d82
  at 210), with capped == raw (plenty under the cap, so the cap hold
  cannot fire) and readiness-5 short on veterans alone. The engine's
  own line says so, e.g. 170233 d55: *"Standing 200 (war 200 · bonds
  0 · bread 0) — wave 4 at 100, wave 5 at 200 — HELD at wave 4: the
  fifth draft waits (blood your fighters (1 of 2 veterans))"*.
- **The near-miss is "one living veteran away", for weeks.**
  Days with veterans exactly 1 (demand 2): 38 (170233), 58 (170234),
  52 (170235), 29 (170236), 8 (170238). Days with 3/4 bars met:
  127, 136, 70, 86, 97 — the village spends most of the run one bar
  short, and that bar is always veterans. The second veteran is the
  whole pin.
- **The cruelest near-miss is 170235's last two days.** On d150–151
  the second veteran arrives (`visjoin_139` joins beside
  `chloe_dubois`) — veterans 2/2 at last — but weapons have fallen to
  4/6, so the door stays shut by the other bar on the final day:
  *"put weapons in hands (5 of 6 armed)"* the day before, then the
  run ends. The coincidence trap in miniature: the bars still never
  coincide on the days that matter.
- **Veteran turnover is the pin's engine.** 170233 bloods four
  veterans across the run (d58, d87, d95, d141 deaths) and never
  holds two at once; its pin lasts 97 days, d55–150, raw climbing
  200 → 320 underneath a gated total that never moves. Standing
  keeps growing while the door stays shut — the pin is not a
  points problem.
- **Releases are same-day veteran arrivals.** 170234: second
  veteran `app_mgpsphpl118` first appears as a living veteran on
  d113, release d113. 170236: `visjoin_111` arrives d121, release
  d121. 170238: `app_mgpspj0g652` arrives d105, release d105. No
  release lags the arrival; no arrival without release (given the
  other bars met). After release the peak ratchet grandfathers the
  door open: 170234 ends standing 560 with readiness-5 unready again
  (endReady false) and stays released; 170238 releases d105, holds
  22 ready days, and dies d149 still wave-5-unlocked.
- **Decay: none.** Zero seeds meet the prereg's decay definition
  (raw falling >= 50 below peak). The 76003 shape (197→100, the
  #1448 question) does NOT reproduce on this band. Raw standing is
  monotonic or flat on every seed — ledger points never fall, feasts
  only accumulate, diplomacy is 0 throughout. What decays is the
  *readiness*, not the standing: veterans die, armor and weapons
  thin out, while the number on the door stays put. The decay
  question as posed (what decays the standing) has a corrected
  answer on this evidence: nothing decays the standing; the
  readiness underneath it is what rots.
- **Standing-short seeds are two kinds.** 170237 (peak 150, died
  d83, ledger 6/0/0, 0 feasts) and 170239 (peak 185, died d57,
  ledger 3/2/0) died before they could earn more — exhaustion by
  death, not by source. 170240 (peak 195 at d132, died d133) is the
  true near-199: war 175 = 7 ledger points, one more wave-3 kill
  (25) would have pinned it — but its readiness-5 on that day was
  armor 3/4, weapons 3/6, veterans 1/2, three bars short, so a pin
  would have been a long wait, not a release.

## Diplomacy sidebar (the standing split, all 8 seeds)

- **Diplomacy reads 0 on every snapshot of every seed** — at peak
  raw and at end. War carries 100% of the standing that exists
  (plus bread on 170233/170234/170238/170239/170240).
- Links: max 1 per village; 170233 formed **0 links ever** and ends
  scaleRank `village` (the only seed still village-scale) despite
  standing 320. The other 7 form exactly one link each (the
  standaccum-b shape, unchanged on current master).
- Link reason-days: `too-young` 30 days each (the 30-day seasoning
  floor), then `low-trust` for the rest — trust decays from the
  birth 30–34 instead of rising to 40. Three seeds show a
  `not-regional` window (170235: 39 days, 170236: 15, 170238: 15):
  the link seasoned and STILL scored 0, because no `polityOf`
  exists — one link can never be a polity. The standaccum-b
  superseding note holds verbatim on this band.
- The System's stage pitch promises bonds as a road ("season your
  alliances") while bonds read 0 everywhere. That tension stands.

## Wall numbers (this pilot)

- Won: **0/8** · national: **0/8** · table: **0/8** (no seed reached
  national, so no table staging was possible; the table itself is
  not instrumented by this arm — not guessed).
- Wave reach: W1–W4 on **8/8**; W5 unlocked on **3/8** (170234,
  170236, 170238). Wave-5 kills: **0** on all seeds (ledger[5] = 0
  everywhere) — the door opened; whether any village FOUGHT wave 5
  is unmeasured (facing is not instrumented here; see Metric review).
- Survival: days 150, 150, 150, 150, 83, 149, 57, 133 — median
  **150d = the horizon cap** (4 seeds censored at 150; the median is
  the cap, not a death distribution). 4 survived to horizon, 4 lost.
- Deaths: **135 total** — the wild 91 (67.4%), monster 16 (11.9%),
  a wound that wouldn't close 5, ambush 4, a stranger 3, starvation
  2, the night 2, the arena 2, sickness 2, thirst 1, contest 1,
  Gavel 1, and 4 memorial causes that carry monster names verbatim
  ("Buffering" 2, "Big Big" 1, "Big-Eyes" 1, "White Noise" 1 — the
  memorial roll stores the killer's name as the cause for those
  deaths). No village starved with a full pantry this band; the
  wild is still the killer.
- Scale at end: village 1/8 (170233, zero links), regional 7/8.

## Village assessment (plain words)

Eight villages played competently for two to five months. Five of
them walked up to the fifth door and knocked — and the knock is
always the same sentence: one living wave-4 killer, waiting for a
second who keeps dying, or never arrives. One village waited 97
days at that door while its standing climbed from 200 to 320
underneath it, burying four blooded fighters one by one. Three
villages walked through, each on the exact day a second killer
stood alive beside the first — twice that second killer was a
stranger who walked in off the road already blooded. And three
villages never got near the door: two died young, one died one kill
short of knocking. Nobody won, nobody reached national, nobody sat
at the table — the scale wall stands, but the fifth door is no
longer shut: 3/8 open it now, where the knowledge-b band opened
0/8 and standaccum-b opened 1/8. The wall moved one rung on base
moves alone, again — and the binding constraint is now named to the
day and the person: two living wave-4 killers, at the same time.

## Sense-test (SENSE-TESTING LAW)

- **The standingLine rows are honest on every pin and release
  day.** They name the raw number, the split (war/bonds/bread), both
  thresholds, and exactly the short bars — e.g. 170235 d99 names
  BOTH short bars when weapons joins veterans (*"put weapons in
  hands (5 of 6 armed); blood your fighters (1 of 2 veterans)"*),
  and the release-day lines carry no hold note, correctly (170234
  d113: *"Standing 495 (war 375 · bonds 0 · bread 120) — wave 4 at
  100, wave 5 at 200"*). No silent gate was found. The wave-5 title
  ("The Producers") never leaks in a hold line.
- **The hold beats, read aloud (supplementary sense leg).** The
  pilot's say tap caught 0 lines on all 8 seeds — an instrument gap,
  not an engine finding: the hold beat speaks through `Game.sysSay`,
  which the harness silences by default (`sim-harness.js:239-251`),
  and the tap was on `Game.say`. Corrected with a one-seed sense
  leg (`scripts/standing199-sense-20261110.js`, seed 170233,
  `loadGame({captureSysSay})` — narration-only capture; trajectory
  verified identical to the pilot on all 148 common days, 0 value
  diffs). The beats, in call order from the first pin (d55):
  *"📡 The fifth draft stays in the wings. It wants a village that
  can fight — blood your fighters (1 of 2 veterans)."* then weekly
  reminders — *"stays in the wings — blood your fighters (0 of 2
  veterans)"* — tracking the bar as veterans live and die (1 → 0 →
  1 → 0 across the run), and late in the run naming a second short
  bar when it joins: *"put weapons in hands (5 of 6 armed); blood
  your fighters (1 of 2 veterans)"*, then *"armor the village (3 of
  4 fighters armored); put weapons in hands (4 of 6 armed); blood
  your fighters (0 of 2 veterans)"*. The beat is not mislabeled and
  does not misfire; it is the same voice the defer5gate sense seed
  heard. What it never says is the near-miss: no beat for a village
  that ALMOST has it (170235's final-day weapons shortfall passes
  in silence, as does 170233's 97-day wait beyond the weekly
  reminder). The #2067 near-miss-path question stands, undecided
  here.
- **The fiction tension is the bonds promise**, as in standaccum-b:
  the game tells the village to season alliances while no alliance
  can ever count on this band. That is a sense-test finding about
  the world, not about the pin.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- **The GO bar worked as designed.** 8/8 classified with 0
  unclassified; the split (3 released / 2 defer5 / 3 standing-short)
  is the finding, not a failure to crown one cause. The plenty-cap
  class firing 0 times is a result (the cap never binds on a band
  where plenty stays under 100 toward T5), not a missing instrument
  — the cap hold was fixture-proven and would have fired had any
  seed's capped total lagged its raw past 200.
- **Say-tap instrument gap (named, fixed in-run for the sense leg
  only).** The pilot's `Game.say` tap cannot hear `sysSay` lines,
  and the harness silences `sysSay` by default. The judged numbers
  never depended on the say sample (the prereg names standingLine
  rows as the sense-test source), so no metric was moved and the
  pilot stands. The sense leg (`captureSysSay`) is the correct
  channel for the next arm that needs System voice; note the
  trajectory-identity check (common-day value comparison) as the
  required guard when re-running a seed with capture on.
- **Wave-5 facing is unmeasured by this instrument** (no w5faced
  field; ledger[5] = 0 everywhere; 3 seeds unlocked wave 5). A next
  arm that needs the facing must wrap a wave-5 engagement entry
  point (as the vetbar census did for wave 4), not infer it from
  unlocks. Same gap as standaccum-b's.
- **Decay definition vs. the #1448 question.** The prereg defined
  a decay case as raw falling >= 50 below peak; none occurred. The
  76003 shape (197→100) is a raw-standing decay, and this band
  shows raw standing never decays — but readiness decays constantly
  (veterans die, armor/weapons thin). If #1448's "what decays it"
  meant the pin rather than the number, the answer is veteran
  mortality + gear attrition, measured here. A next arm revisiting
  76003 should check whether its 197→100 was a ledger-point loss
  on a now-changed code path (e.g. pre-ratchet standing, or link
  loss when diplomacy was nonzero) rather than a live mechanism.
- **Median survival is the horizon cap** (150d, 4 seeds censored).
  A longer horizon would separate survival from the cap, but the
  pin question is answered inside 150d (first pins d55–98,
  releases d105–121). No revision.
- **No metric was moved mid-run.** The GO bar was judged exactly
  as pre-registered.

## Findings for the backlog

- **199 IS THE DEFERVETERANS GATE, AND IT OPENS NOW (3/8).**
  Defer5 with veterans the only short bar at first pin on 5/5 pinned
  seeds; plenty-cap 0 days; releases d105/d113/d121, each on the
  second veteran's arrival day. The door's binding constraint is
  two living wave-4 killers at once, and it opens when the second
  arrives — twice via a joiner carrying a kill. (This arm.)
- **NO RAW-STANDING DECAY ON THIS BAND (corrects the #1448
  framing).** Raw standing never falls >= 50 below peak on any
  seed; what decays is readiness (veteran deaths, armor/weapons
  thinning) while the gated number sits still. 76003's 197→100 did
  not reproduce; next arm revisiting it should check whether it was
  a pre-ratchet/old-code shape. (This arm.)
- **DIPLOMACY STILL 0 ON ALL 8 SEEDS (standaccum-b holds).** One
  link per village (170233: zero), trust decaying from birth 30–34,
  seasoned-but-not-regional windows on 3 seeds — the block is
  seasoning + polity, unchanged on current master. (This arm.)
- **WAVE-5 FACING STILL UNMEASURED AFTER RELEASE.** 3 seeds
  unlocked wave 5, 0 wave-5 kills, no w5faced field in this
  instrument. Next arm: wrap a wave-5 engagement entry point.
  (This arm.)
- **SAY-TAP CHANNEL GAP (instrument note, not a game finding).**
  `Game.say` taps cannot hear `sysSay` beats; the harness silences
  `sysSay` unless `captureSysSay` is passed. Fixed for the sense leg
  in this arm; the next arm needing System voice should use
  `captureSysSay` with the trajectory-identity guard. (This arm.)

## Proof and landing

- Proof: `scripts/test-standing199-a.js` — 35/35 PASS (fixtures +
  live harness smoke leg). Re-run post-commit below.
- Commits (this worktree branch sim-standing199-a; coordinator
  merges via --ff-only; merged locally, pending ship — no push, no
  bump, no live verification by this worker):
  - 6c45b194e sim-standing199-a prereg (before any judged sim)
  - c8967fdcc sim-standing199-a instruments + proof 35/35 (zero src/js)
  - (pilot + evidence commit below)
- Files: prereg + evidence in `evidence/2026-11-10/
  sim-standing199-a*.md`; summary `evidence/2026-11-10/
  standing199-summary.json`; per-seed JSON in
  `evidence/2026-11-10/perseed-standing199-a/` (8 pilot files +
  1 sense file, anchor c8967fdcc); scripts
  `standing199-instrument-20261110.js`,
  `standing199-driver-20261110.js`,
  `standing199-analyze-20261110.js`,
  `standing199-sense-20261110.js`,
  `test-standing199-a.js`.
- Index-clobber note: safe-commit.sh left staged-as-deleted entries
  in the worktree index after both commits (prereg + instruments);
  repaired each time via `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` after hash-object
  verification (all blobs matched HEAD), and verified `git status`
  empty + `git diff HEAD` empty. The commits themselves were always
  correct.
- Worktree state at handoff: only committed work; no uncommitted
  leftovers beyond the pilot + evidence commit below (verified
  before reporting).
