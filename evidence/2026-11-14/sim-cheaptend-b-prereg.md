# sim-cheaptend-b — PREREG (BUILD arm: cheaper tend — engine drive gate 20k → 10k)

Run: fleshout-loop-b-20261114T1557Z (Loop B), arm sim-cheaptend-b
Axis: winnability chain. BUILD arm — game-code cheaper tend, the HOLDING
lever after scaleclimb. One game-code change only.
Branch: sim-cheaptend-b — worktree ~/workspace/worktrees/sim-cheaptend-b
Base: master f524932d6
Date: 2026-11-14

## The finding (measured, not guessed)

- sim-scaleclimb-b (evidence/2026-11-14/sim-scaleclimb-b.md, this band's
  parent run): competent + LEAD propose/accord/tend CLIMBS — regional day
  median 70 → 32, polity bar (≥3 Haven-primary seasoned subs at once) 5/8
  — but does NOT HOLD: 3 of 5 polities dissolve by day 76–124.
- Root cause PINNED (scaleclimb §Holding): the PANTRY, not the tend
  predicate. 194 blocked tends on seed 98803; pantry reads 4–12k kcal on
  most sampled days against the 20k tend gate; the tend predicate already
  fires on any below-bar link. Tend costs 1,500 kcal per paid tend.
- Scaleclimb's held-days (the metric this arm judges by): diplomacy
  positive mid-run on 5/8 seeds, held 6–83 days (83/0/78/79/0/0/23/6 →
  median 14.5d over all 8 seeds), end-state diplomacy 2/8.

## Tend-gate inventory (verified in code, not taken on trust)

Every gate that can block a tend, found by grepping all `tendLink(`
callers and all pantry thresholds in `src/js/hierarchy.js`:

1. **Policy gate — scaleclimb policy, `TEND_PANTRY = 20000`**
   (`scripts/policies/competent-scaleclimb-b.js:67,176`): the policy
   tends a below-bar Haven-primary link only when
   `pantryKcal(Game) > 20000`; otherwise it counts
   `tendsBlockedPantry` and skips. This is the gate that produced the
   194 blocked tends on 98803. STATED CONSTANT — frozen in the
   baseline policy, NOT changed by this arm.
2. **Engine drive gate — `src/js/hierarchy.js:3950`, `pantry > 20000`**
   in `_answermailDriveDaily()`: the engine's own weekly tend of every
   active Haven-primary link (no seasoned-bar predicate — unlike the
   policy, it also tends SEASONED links, the only maintenance they
   get) fires only when the pantry tops 20k; otherwise it counts
   `tendsBlockedPantry`. **JUDGED LEVER: 20000 → 10000.** The only
   `20000` literal in `src/js/hierarchy.js` (verified by grep).
3. **Engine win-plan bonds tick — `src/js/win-plan.js`
   (`winPlanBondsTick`)**: tends Haven-primary links with trust < 50
   when `pantryDays >= 3` (days-of-food, NOT a kcal threshold), ≥2
   prims, not tended this week, not mourning. Not a kcal gate;
   untouched. (This is the source of scaleclimb's 22 "engine" tends.)
4. **`tendLink` itself (`src/js/hierarchy.js:1177`)**: NO threshold
   gate. It pays `min(pantry, 1500)` with frac-scaled trust (+8 ×
   frac) and refuses only on mourning, already-tended-this-week, or
   a bare pantry (paid 0). The 1,500 kcal cost is a STATED CONSTANT —
   NOT changed (see "Why the gate, not the cost").
5. **Player UI button (`src/js/app.js`, `data-link-tend`)**:
   human-initiated, no gate. Untouched.
6. **Propose gate (`PROPOSE_PANTRY = 12000`, scaleclimb policy)**:
   blocks PROPOSES, not tends. Out of scope, untouched.
7. **Accord gift (2,000 kcal) / renegotiation gift (1,500 kcal)**:
   no gates, partial payment. Untouched. (The 1,500 kcal literals at
   `hierarchy.js:720` and `:2083` are the counter-sweetener and the
   renegotiation gift — different verbs, not `tendLink`; untouched.)

The drive hook itself (`_answermailDriveDaily`, `hierarchy.js:3871`)
is DEFAULT-OFF: it fires only when `ANSWERMAIL_DRIVE=1` in node
(`typeof process` guard — in the browser `process` is undefined, so
shipped play never runs it). See "Env-gating" below.

## The lever (frozen — do not tune mid-run)

**JUDGED (one game-code change):** the engine drive tend gate,
`src/js/hierarchy.js:3950`, `pantry > 20000` → `pantry > 10000`,
expressed as a named constant (`ANSWERMAIL_TEND_PANTRY = 10000`)
beside the drive function. Nothing else in `src/js` changes except
the required update to the existing gate assertion in
`scripts/test-answermail-drive-a.js:173` ("tend blocked when pantry
<= 20000") — the design changed on purpose, so the test is updated
in the same commit to the new gate (pantry 10000 blocked, 15000
paid), per the repo's green-list rule. No other `src/js` change.

**STATED CONSTANTS (frozen):** policy tend gate 20,000 kcal; tend
cost 1,500 kcal per paid tend; tend predicate (below the seasoned
bar, weekly, mourning choke) — EXONERATED by scaleclimb, never
retuned; propose gate 12,000 kcal; accord gift 2,000 kcal.

**Env-gating:** the change lives inside the default-OFF drive hook —
it is ENV-GATED, not a default flip. Both pilot legs run with
`ANSWERMAIL_DRIVE=1` so the gate is live; a GO licenses the 10k gate
value for whenever the drive ships, NOT a drive flip. The drive
itself stays default-OFF in the browser. (Why env-gated: the drive
is the only engine tend channel with a kcal gate, and it is the
village-answering-its-own-mail hook Steve has not yet flipped on;
changing the gate without flipping the drive keeps the shipped game
untouched while the value is proven.)

**Why the gate, not the cost:** lowering `tendLink`'s 1,500 kcal cost
cannot unblock the 194 policy-blocked tends — the frozen baseline
policy gate (20k) is the channel that carries 98 of scaleclimb's 120
tends, and a cheaper tend only cheapens tends that already fire. The
cost cut's effect would be indirect (a fatter pantry on fat days) and
its NO-GO would be confounded (gate-blocked test, not a failed lever).
The gate is the choke; the cost stays 1,500. (The sibling arm
sim-holdpantry-b owns the pantry-first policy — this arm touches only
the engine gate; the two arms touch non-overlapping files and do not
duplicate each other.)

## Why 10k (from the measured pantry distribution, not the example)

Daily pantry kcal on the scaleclimb armed leg (from
`evidence/2026-11-14/perseed-scaleclimb-b/`, series `pantry`):

| seed | blocked tends | pantry >20k | >10k | >5k | median |
|---|---|---|---|---|---|
| 98801 | 49 | 65% | 83% | 98% | 27,818 |
| 98802 | 61 | 46% | 68% | 79% | 18,769 |
| 98803 | 194 | 10% | 54% | 95% | 10,517 |
| 98804 | 44 | 49% | 63% | 79% | 18,907 |
| 98805 | 13 | 69% | 89% | 96% | 30,619 |
| 98806 | 56 | 58% | 73% | 76% | 23,457 |
| 98807 | 71 | 50% | 80% | 95% | 20,100 |
| 98808 | 116 | 28% | 69% | 83% | 11,805 |

- A 10k gate sits at the worst seed's median (98803: 10,517) — the
  drive tends on ~half the days there instead of one in ten, and on
  ~2/3–4/5 of days on the other thin seeds (98808: 28% → 69%).
- It keeps a buffer: a full weekly tend round on 3–4 links costs
  4,500–6,000 kcal, so a 10k pantry still holds ~4–5k after tending —
  one round cannot tend the pantry bare.
- 5k would unblock more days (83–95%) but lets one tend round eat
  nearly the whole pantry on thin days; the cost bar would likely
  fail. 10k is the prudent middle: it unblocks the blocked mass
  without removing the buffer.

## Canon

- `docs/CANON.md` read first. `docs/SCALE.md` read: polity = one
  primary + ≥3 SEASONED subs; seasoned = 30+ days AND trust 40+
  (links form at trust 30 — "tending required"); national is a live
  state — when the realm dissolves, `nationalLive` clears.
- **No canon doc covers the tend gate or its 20k value.** The CANON.md
  manifest lists no hierarchy/diplomacy doc, and SCALE.md never names
  a tend gate, a pantry threshold, or a tend price. The 20k/10k gate
  is engine tuning, not Steve canon — no canon change is claimed.

## Seed-band freshness check (rule: re-verify, record scope + result)

- **COLLISION FOUND — assigned band rejected.** The coordinator's
  band 93201–93208 is NOT fresh: 93201–93204 were used by
  journey-deepening r89
  (`evidence/2026-11-03/journey-deepening-r89-prereg.md:7`, "Seeds:
  fresh 93201–93204"; also named in r90/r91/r110 preregs).
  Per the seed-band rule a named band is used even without a judged
  corpus, so 93201–93208 is abandoned and the collision is recorded
  here so the next worker does not repeat it.
- **Chosen band 93211–93218.** Scope: every dated prereg under
  `evidence/` (`grep -rl <seed> evidence/ --include="*-prereg.md"`,
  all 8 seeds, 2026-11-14): **0 hits on all 8 seeds.** November
  preregs re-checked explicitly for `9321[1-8]`: 0 hits. A
  full-evidence grep for `93211` returns only float-tail substrings
  (e.g. `0.4669559321169875` in a 2026-10-17 corpus JSON) — verified
  by context, not seed literals. No forbidden/contaminated band list
  names this band. **Band 93211–93218 is FRESH.**
- Smoke seed: 93210 (outside the main band; checked the same way —
  0 prereg hits).

## Primary metric + GO bars (binding, §14)

Per the scaleclimb metric review (§§1–2): end-state diplomacy is
the WRONG judge for a flickering quantity. This arm judges by:

- **HELD-DAYS** — days with diplomacy > 0 (from the daily `dip`
  series), per seed; median + pooled across the 8 seeds.
- **EVER-COUNTED** — polity ever stood (≥3 Haven-primary seasoned
  subs at once, any day), per seed; count across the 8 seeds.
- End-state diplomacy is reported alongside, NEVER as the judge.

- **G1 INSTRUMENT VALIDITY** — GO iff the driver captures a full
  per-day link roll on all 16 configs (8 seeds × baseline / armed),
  0 instrument errors, EVERY diplomacy point is attributed per
  counting EPISODE (dip steps AND dip decrements each named to the
  link that counted / un-counted that day; a re-count after an
  un-seasoning carries its own counted-day — the scaleclimb §2 fix),
  and EVERY link on both legs is classified
  (seasoned-and-counted / seasoned-but-no-polity / broke-<reason> /
  never-seasoned-<bar> / still-young-at-end) — zero UNCLASSIFIED
  links. Any instrument error, unattributed diplomacy point, or
  unclassified link = NO-GO.
- **G2 THE LEVER** — GO iff BOTH halves pass:
  - (a) ABSOLUTE (task-suggested, vs scaleclimb's 5/8 ever,
    median held 14.5d): ever-counted armed ≥6/8 AND median
    held-days armed ≥45.
  - (b) MARGINAL vs its own drive-on control: ever-counted armed ≥
    ever-counted baseline AND median held-days armed > baseline
    median held-days AND pooled held-days armed ≥ pooled baseline
    + 40 seed-days.
  The marginal half is required because the baseline leg itself runs
  the drive ON (see Method) and the drive alone already seasons
  links (sim-answermail-drive-a, 2026-11-10: seasoned links 7/8
  armed vs 0/8 control on competent) — an absolute bar alone could
  be met by the control. A miss on either half = NO-GO, never
  re-scored mid-run.
- **G3 LEVER-ONLY** — GO iff exactly ONE `src/js` change (the drive
  gate value, `hierarchy.js:3950`, via the named constant) plus the
  stated test-assertion update, the proof test
  (`scripts/test-cheaptend-b-20261114.js`) is green, and
  `node scripts/check.js --quick` is green on the rebased tip plus
  the changed-area suite. Any other `src/js` change = NO-GO.

**Cost bar (sim-scalemetric, as prescribed):** starvation (total)
armed ≤ baseline total + 2 AND arm-only starvation deaths ≤
baseline total AND median survival armed ≥ 0.8 × baseline median.
Starvation deaths are counted from the driver's per-seed death
records (cause matching starv/hunger/famine; raw cause strings
reported so the count is auditable). NOTE (stated now, not a
surprise): if the baseline leg starves nobody, the arm-only clause
is zero-tolerance — any armed starvation death fails the cost bar
(the same collapse sim-answermail-drive-a's metric review flagged).
A failed cost bar with a G2 pass is NO-GO, never re-scored (per the
fusionoffer precedent a game-code arm judges its cost bar on the
changed-area suite + proof-staleness accounting — do NOT re-score a
miss).

**Guardrail (§14c):** villager (non-scholar) combat deaths are a
co-primary read on every seed — the evidence reports deaths per seed
and the verdict names any seed where armed deaths exceed the before
leg by >50%.

## Method (staged, §§9–12, 14–15)

- **BASELINE POLICY (recovered, not rebuilt):** the scaleclimb policy
  is NOT on master (scaleclimb was killed; its branch was deleted)
  but is recoverable: commits `7113f11ec` (prereg) and `29a794df6`
  (instruments) still resolve. The baseline policy is recovered via
  `git show 29a794df6:scripts/policies/competent-scaleclimb-b.js`
  (265 lines, verified byte-identical on recovery) and used VERBATIM
  as the baseline policy in BOTH legs. No policy tuning of any kind.
- **LEG CONTRAST (game-code arm):** the two legs run on DIFFERENT
  code states, so they run as separate driver invocations:
  - BASELINE leg: pre-change tree (gate 20k), `ANSWERMAIL_DRIVE=1`,
    scaleclimb policy. Run BEFORE the game change is made.
  - ARMED leg: post-change tree (gate 10k), `ANSWERMAIL_DRIVE=1`,
    scaleclimb policy. Run AFTER the game change + proof test pass.
  - The driver takes `LEG=baseline|armed` (recorded in every JSON
    alongside `anchorCommit`); it FAILS LOUDLY if
    `ANSWERMAIL_DRIVE` is not `1` — a silently drive-off leg would
    test nothing. Identical seeds, same driver, same policy.
- **STAGE 0 SMOKE (1 seed × 1 leg, 60d, seed 93210, drive on):**
  does the policy load, do proposes/accords/tends fire, does the
  driver capture the link roll + drive stats? Fix wiring, not
  thresholds. (The proof test also carries a live 60d smoke leg.)
- **STAGE 1 PILOT (8 seeds × 2 legs = 16 configs, 150d death-aware,
  identical seeds):** the judged run. Horizon 150d because the
  finding's band is 150d and links need 30 days to season after a
  day-10 start. Seeds (exact literals): 93211, 93212, 93213, 93214,
  93215, 93216, 93217, 93218. Policies: competent-scaleclimb-b in
  both legs (the leg differs by CODE, not policy). ENV: defaults
  plus `ANSWERMAIL_DRIVE=1` both legs; COUNTER_ANSWER unset,
  COMPETENT_FLEE_REPAIR unset.
- **CONFIRM (12–16 seeds) ONLY if the pilot is a clear GO.** A
  borderline pilot is reported as-is and the coordinator decides; do
  NOT spend a confirm to rescue it. NO-GO at pilot = no confirm band.
- **DRIVER (`scripts/cheaptend-driver-20261114.js`, adapted from the
  scaleclimb driver):** daily link roll, verb wrappers, `Game.say`
  capture (link/polity lines, cap unchanged at 150 — the scaleclimb
  §6 recorder limit is noted, not fixed, to keep recorder drift at
  zero between the legs), raw standing split read daily,
  `villageStandingTotal()` read ONCE at end-of-run, drive stats
  (`state.answermailDrive`: tends, tendsBlockedPantry, accord
  answers, errors) captured per snapshot and at end. Per-seed JSON to
  `evidence/2026-11-14/perseed-cheaptend-b/`. Zero `src/js` in the
  driver.
- **ANALYZER (`scripts/analyze-cheaptend-b.js`, adapted from the
  scaleclimb analyzer):** per-link trajectories + classification,
  verb table split policy/engine, per-seed diplomacy + polity days,
  wall numbers — PLUS the scaleclimb metric-review §2 fixes: (a)
  track dip DECREMENTS and name the link that un-counted each time;
  (b) record a counted-day per counting EPISODE, not just the first;
  (c) HELD-DAYS + EVER-COUNTED + pooled held-days per leg; (d)
  starvation deaths per seed from death causes. Writes
  `evidence/2026-11-14/cheaptend-b-analysis.json`.
- **BALANCED PANEL (§15, methodology note — READ):** the real
  `scripts/balance-panel.js` compare cannot judge a policy/game
  contrast (both panels must carry identical options.policies and
  identical policy/harness sources; a modified policy file or a
  changed `src/js` invalidates the compare — scaleclimb prereg
  records the same refusal). Per the linkdrive/scaleclimb precedent,
  the §15 compare runs on PSEUDO-panels built from the driver's
  per-seed JSONs (pseudo-policy 'cheaptend' in both panels; case
  identity is the seed; contract metrics mappable from the JSONs
  only — won, national, survival30/60, communityLost,
  villageDeaths; all others null, never faked). The pseudo-panel
  compare is the instrument; the pre-registered G2 bar is the judge.
  The driver's identical-seed numbers decide the verdict, not the
  panel.
- **PROOF (`scripts/test-cheaptend-b-20261114.js`):** static + game
  legs. Static: the gate inventory (named gates exist at the cited
  locations; the judged gate reads 10000; the policy gate and tend
  cost are unchanged). Game: the drive gate behaviour on the LIVE
  hook (stubbed verbs, answermail-drive pattern): pantry 15000 →
  tend paid; pantry 10000 → blocked + `tendsBlockedPantry`
  counted; pantry 25000 → paid; drive OFF → nothing answered.
  **FAILING CONTROL:** the proof test is run BEFORE the game change
  and recorded failing on the 15k-paid + gate-value assertions
  (old code blocks at 15k), then re-run AFTER the change and green.
  The pilot's baseline leg is the failing control at scale (drive
  tends blocked on 10–20k pantry days on identical seeds).
  Observable effect proved in the pilot, not just in the unit test:
  armed-leg drive tends actually paid on previously-blocked
  (10–20k pantry) days.
- **ENCOUNTER-GEAR RULE (Steve 2026-11-13):** no staged fixtures —
  the driver observes the policy's own play; nothing is staged.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both legs in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the propose / accord-gift / tend / seasoning / polity lines
the driver captures and judge whether the holding reads like a
played relationship or a silent meter. Read villager dialogue in
the captured lines where present; judge meaning and coherence,
never just counts. (Recorder limit, stated: the say cap fills by
~day 28 with early chatter, so late polity-loss lines may again go
unsampled — the dissolution is judged from the numbers, via the
dip-decrement tracking, when no line is captured.)

## Evidence

- Prereg: this file.
- Policy (recovered verbatim): `scripts/policies/competent-scaleclimb-b.js`
  (source commit `29a794df6`; NOT on master — recovered, not rebuilt).
- Game change: `src/js/hierarchy.js` (drive gate only) + the stated
  assertion update in `scripts/test-answermail-drive-a.js`.
- Driver: `scripts/cheaptend-driver-20261114.js` (new, adapted).
- Analyzer: `scripts/analyze-cheaptend-b.js` (new, adapted).
- Panel builder: `scripts/build-cheaptend-panels-20261114.js` (new,
  scaleclimb pattern).
- Proof: `scripts/test-cheaptend-b-20261114.js` (new; static + game).
- Per-seed JSON: `evidence/2026-11-14/perseed-cheaptend-b/` (16 files).
- Panel: `evidence/2026-11-14/cheaptend-panel.{json,md}`
  (+ -before/-after .json.gz pair).
- Evidence: `evidence/2026-11-14/sim-cheaptend-b.md` (per-seed
  tables, verb table, wall numbers, sense-testing, metric review).
- Reproduction check: the BASELINE leg's end-state columns are
  checked against the scaleclimb armed-leg corpus on ITS band only
  as a sanity read (different seeds, different drive state — exact
  match is NOT expected and NOT required; the check is evidence,
  never the judge).

## Convergence state

BUILD — the verdict is GO/NO-GO against G2 above (absolute +
marginal). A GO licenses a 12–16 seed confirm (coordinator's call)
and the 10k gate value for whenever the drive ships; a NO-GO kills
the gate cut with the numbers that killed it (and the next arm on
this axis is the pantry-first hold, not a re-measure of the gate).
Either way the axis line updates from this run's numbers only.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did G1/G2/G3 measure the lever, or did
the metric prove wrong (bad proxy, blind channel)? In particular:
did the drive-on baseline meet the absolute bar on its own (making
the marginal half the real judge)? Did the cost bar's arm-only clause
collapse to zero-tolerance? Did the dip-decrement/episode tracking
close the scaleclimb G1 gap?
