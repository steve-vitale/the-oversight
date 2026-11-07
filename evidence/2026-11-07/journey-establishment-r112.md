# Journey — establishment, run r112 (2026-11-07)

Lane A, leg 1 (establishment, days 14–40, 42-day horizon). Scheduled
Sat 2026-11-07 12:45 CST. Run ID / lock: `2026-11-07T18:45:00Z`.
Rotation read `1`; write `2` at closeout. Branch
`journey-establishment`, base master `c88df9d25` (r111 merged).
Worktree `~/workspace/worktrees/journey-establishment`.

## Pre-registration (§14 — binding)

**The question, from r111.** The specialist/foodXp ladder was SHUT at
the bottom and UNEXERCISED at the top: a forager who butchers 100 times
stayed at skill 0 (gate proof), and foodXp only ever came from asking a
specialist — which the competent bot never does. r112 is the build run
for r111's proposed fix, judged before/after on a 16-seed balanced
panel.

**The fix (my design call, Steve can overrule; committed `d6eed674e`
with `[needs-eyes]`).** In plain words: villagers can now learn food
skills by doing the work, not only by being taught.
- A. Bottom rung (`src/js/food.js`, `specialistSkill`): 10 foodXp buys
  skill 1, +1 per further 5 XP (15→2, 20→3, cap 3). Holders unchanged
  (+1 at 5 XP, cap 3).
- A2. Read-shape fix (same function): also read `person.foodXp` as a
  fallback — the skill read previously saw only `person._src.foodXp`,
  so the +1 rung was invisible at game call sites that pass raw
  villager records. No behavior change while XP is 0.
- B1. Smoke racks (`src/js/game.js`, cook duty): the cook earns +1
  foodXp['preserver'] per resolution that actually preserves food (not
  per batch).
- B2. Hunt kills (`src/js/game.js`, `villagerHuntResolve`): the hunter
  earns +1 foodXp['butcher'] per kill; a failed stalk earns nothing.
- Not in the fix: cook/spotter/builder foodXp stays ask-specialist
  only; player hunts/cooking don't grant villagers XP; bot policy
  unchanged. Win prices and deed gates untouched.
- Canon grounding: CANON.md "Human skills ≠ alien abilities —
  practice and discovery earn them"; PRESERVATION.md "Blind penalties
  teach, never stupid-make — the attempt teaches the technique."

**Bar (binding, §14 — no re-score).** GO iff ≥1 villager moves
specialist 0→positive on ≥8/16 seeds. Guardrails M3 ≥12/16 alive at
day 42, M4 0 starvation deaths on ≥12/16. Q2 standing: 0 `(null)` THEM
lines.

**Seeds.** Matched reuse 1502, 1504, 1603, 1604 + 12 new 17101–17112.
Freshness-checked against all dated preregs (per
`local_seed_band_freshness`): no prereg names 17101–17112; forbidden /
contaminated bands are all 99xxx. Band 17101–17112 is FRESH.

**Engine identity.** `git diff 19ee88466..HEAD -- src/js/` empty — the
r111 panel files ARE the valid before-panel for the 4 matched seeds.

**Proof test** (`scripts/test-journey-establishment-r112-ladder.js`):
47 passed, 0 failed after the fix; 39 passed, 8 failed before it —
exactly the expected before-FAILs (thresholds, rack grant, hunt
grant). Logs: `journey-establishment-r112-proof-before.log`,
`...-proof-after.log`.

**Driver neutrality.** r112-before seed 1502 vs r111 seed 1502 =
NEUTRAL (exact match on endDay/alive/pantry/wave/deaths/teleTypes/
skillCounts/huntStaff/daily/convo).

## Verdicts

- **Q1: NO-GO — the ladder moves on only 6/16 seeds (bar 8/16).**
  Per §14 this stands; do not re-score.
- **But the mechanism works.** foodXp BEFORE 0 → AFTER **306 total**
  (butcher 144, preserver 162). Grant events: **235 rack resolutions**
  granting preserver XP on all 16 seeds (565,320 rack kcal); **255
  hunt kills, all 255 granting** butcher XP (13 seeds). Holders: 5 in
  the +1 pool, all 5 stepped. 28 XP cells sit at 1–9 (below the 10
  threshold) — wasted, for now.
- **The moves** (all 8 window-local moves sit on the same 6 headline
  seeds — no survivor-filtering artifact):
  - 1504 Caroline butcher 0→3 (XP 21), preserver 0→2 (XP 18)
  - 1604 Rahul preserver 0→1 (XP 12)
  - 17102 Helga preserver 0→2 (XP 15), Hajime butcher 0→1 (XP 11)
  - 17104 Ruth butcher 0→1 (XP 13)
  - 17110 Mateo butcher 0→3 (XP 60 — 63 kills)
  - 17111 Marcus preserver 0→2 (XP 17)
- **No-move seeds** (foodXp at day 42): 1502 (12), 1603 (14), 17101
  (10), 17103 (15), 17105 (4), 17106 (4), 17107 (0), 17108 (10),
  17109 (7), 17112 (15).
- **Diagnosis, in plain words.** The r111 SHUT+UNEXERCISED is
  resolved: the ladder is open (a rung exists and is reachable, incl.
  0→3 jumps) and exercised (306 XP through real village work). The
  miss is PACE, not mechanism: in 42 days the work spreads thin
  across many hands, so most villagers hold 1–9 XP and never reach
  the first rung at 10. The cooks and hunters who do one job over and
  over get there; everyone else doesn't. The next decision is
  threshold tuning, not a revert.
- **Guardrails hold:** M3 16/16 alive at day 42, M4 16/16 zero
  starvation deaths.
- **Q2: FIXED** — 0 null THEM lines across the panel (navTurns 2).
- **Telemetry:** quiet — 16 files, systemDay + monsterKills, no large
  deviations. Baseline NOT rolled (no LOUD line).

## Village assessment (plain words)

All 16 villages were alive at day 42, with 8–12 people each. Nobody
starved. Pantries ran from tight (~6,500 kcal, seed 17105) to fat
(~264,000 kcal, seed 17101). Waves 3–4 reached. Deaths across the leg
ran 23–84 per village as the roster churned (arrivals die too), with
8–12 alive at the end.

What they know: villagers are learning. Practice moved skills in every
window (days 1–14: 81 moves; 14–28: 132; 28–42: 62; 59 moves from
skill 0 to positive; 6,076 practice repetitions). Hunting is the
village's engine — 255 kills. The smoke racks preserve most of the
meat: 271 rack events, 565,320 kcal. Of that, cooks who already hold
the preserving skill did 165,167 kcal across 84 events; cooks without
the skill did 401,710 kcal across 187 events (ratio 0.41) — the racks
are mostly worked by people who don't know the technique yet, which
is exactly what the ladder is for.

What's missing: the teaching chain is nearly empty. In 43 cases a
hunter needed a teacher and there was nobody in the village who could
teach (38), the teacher was away (3), or unseeded (2). Only 4 lessons
were even attempted; 2 worked (Maureen taught Ethan on 1502; Daniela
taught Nicole on 17110); 2 failed because hunter and teacher shared
no words (Juan speaks only Tagalog; Rahul and Emma couldn't reach him
on 1604). 18 times the hunter already held the skill. Four skills sit
in villagers' heads unused — diplomat (23 holders, 0 uses), herbal
remedy (32, 0), preserve_food (30, 0), wound care (57, 0) — while
field dressing (123 uses, on hunt kills) and triage (43 uses, tending
2 at a time) do real work. Care is visible: 672 care ticks, 301
tends, 48 medics seen by name or description, healing rounds of +15
HP. One hunter died of his wounds: Miguel, seed 17102, day 33.

Two trajectories to watch. Seed 17102 diverged after the fix: alive
12→10, pantry 98k→40k, hunts 93→59. New skill effects change rack
rates and duty choices, so some movement is expected — but a 59k
pantry drop deserves the line; it's a trajectory change to watch, not
a bug found. Seed 17107 earned zero foodXp all leg: its hunters
killed nothing (0 kills), so no grants fired there at all.

## People check (SENSE-TESTING LAW)

Read all 16 after-panel conversations in full (4 matched seeds line
by line; 12 new seeds scanned). Villagers act like people.

- Chen (1502) is sick and asks for help with a real condition — stand
  on the same side of the Haven door to help. DeShawn (1504) has a
  wound that needs a second pair of hands. Rahul (1604) is down to 3
  liters of water and asks for a dawn haul, two buckets each.
- Ezequiel (1502), Sebastian (1504) and Paolo (1603) each grieve a
  taken sibling or grandfather — Delfina, Kuba, Kwame — and ask the
  player to ask the System about the pods. A promise that plants a
  debt, asked three different ways by three different people.
- Quinn (1502) practices what she'd say if she ever saw her family
  again, and teaches Maypop by the fire. Caroline (1504) confesses
  she ran when she should have stayed, then teaches Spicebush and
  joins the party. Nora (1604) names the party THE NIGHT SHIFT and
  takes the Point role. Ella (1603) asks what got you through the
  first week, and sings in the creek.
- Simran (1603, Hindi only) and Juan (1604, Tagalog only) hold whole
  conversations in gestures and patience. Simran's laugh when the
  player tries her Hindi back — "You said that BEAUTIFULLY. It means
  nothing like what you think it means." — is the best moment in the
  panel.
- Stalls (5, all driver-side, all closing gracefully): Juan's
  nonverbal menu repeats with no pick (1604); two winding-down menus
  where the driver doesn't pick "leave" (17102, 17109, 17112); one
  betrayal menu the driver never picks by design (17102 — the
  invitation content fires; the driver just won't answer it).
  Closings still land ("Talking helps. A little. Thank you.").
- Small wrinkle: Paolo (1603) — the driver picks "You're right"
  after "Gotta run. Literally. Bye!" and the engine ends it. A
  driver-pick-after-goodbye, not a content defect.
- No fabricated shared history spotted. The taken-kin pods thread
  recurs across seeds with different kin each time — the system
  working as designed.

## Blanks filled / documented

- **Filled:** the r111 blank — the ladder now exists and is exercised
  (this run's fix).
- **Documented, not fixed:** the teaching chain is nearly empty
  (no-teacher-anywhere dominates); four held-unused skills; Juan's
  language-blocked lessons; seed 17107 zero foodXp; seed 17102
  trajectory divergence. Wanda-beat / teach-restate repeats stay
  Loop B-owned. Menu:more standing check stays "0 null THEM lines".

## Reachable / fun / winnable

- **Reachable: yes.** The ladder is reached through ordinary village
  work (cooking, hunting) — no special action needed; it fires on
  15/16 seeds.
- **Fun: yes, in the establishment sense.** The villages read as
  alive — grief, gossip (Omar eating grey meat raw and walking away
  whistling), party-naming, language barriers played straight. The
  learning itself is visible: a cook who works the racks daily
  becomes a preserver.
- **Winnable: no movement claimed.** This leg is establishment
  (days 14–40); the win chain lives in later legs. The ladder feeds
  the winnability chain (roles forming from lived experience) but 6/16
  is below bar; threshold tuning is the next step, not a win claim.

## Metric review (for the NEXT run)

- **Threshold tuning.** 10 XP for the first rung is too high for 42
  days — 28 cells sit at 1–9 XP. Propose for r113: first rung at 5
  XP (matching the holder rung), or +1 XP per batch preserved
  instead of per resolution. Either would convert the wasted cells
  into moves; re-judge on the same 8/16 bar.
- **Seed 17107 zero foodXp.** Check whether the village truly hunted
  and cooked nothing, or the grants never fired there.
- **Seed 17102 divergence (pantry −59k).** Watch whether skill
  effects on rack rates / duty mults explain it; if it recurs, it's a
  tuning signal.
- **Teaching.** no-teacher-anywhere (38/43) is the binding
  constraint, not teacher-away (3/43). The words-rung (Juan) is a
  second, smaller block.
- **Menu:more** standing check stays "0 null THEM lines" (FIXED this
  run; keep watching).
- **Wanda-beat / teach-restate repeats** stay Loop B-owned.

## Checks run

- Proof test: 47/47 after the fix; 39/47 before (expected fails).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  284 passed, 6 failed in 612s (logged re-run, `/tmp/r112-check-quick.log`;
  first run 284/6 in 655s). The 6 failures are exactly r111's known
  pre-existing set — measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20 racks-full voice gate. **No NEW failures. Bar met.**
- Telemetry check: quiet (see Verdicts).
- Driver neutrality: NEUTRAL (seed 1502, r112-before vs r111).

## Run mechanics / infrastructure notes

- Commits on `journey-establishment`: `e984f807d` (substrate: prereg
  + driver + analyzer + proof test), `d6eed674e` (`[needs-eyes]` fix
  + proof logs), `58442cde8` (substrate fix: analyzer neutrality bug
  + proof-test (f)/(g) JSON write). After EVERY safe-commit the index
  clobbered (files staged-as-deleted / MM); repaired each time via
  `git hash-object` vs HEAD blob + `git update-index --add
  --cacheinfo`; verified `git status` clean + `git diff HEAD` empty
  after each repair. Expect it again on the evidence commit.
- Registry-lock queue, ~19:46–19:51 UTC: a sibling loop's
  `worktree-register.sh sim-tendsick-a` held REGISTRY.lock for ~5
  min while its `git worktree add` ran; my manual heartbeat, the
  loop's heartbeat, a `worktree-release.sh journey2-social`, and a
  `worktree-reap.sh` queued behind it (flock). No intervention taken
  — the holder was a live process, the queue drained on its own. My
  heartbeat landed 19:46; the run stayed alive throughout.
- Master moved during the run: Lane B landed journey-social r153
  (top commit `3ddc3cbd5`) after my base `c88df9d25`. Rebase onto the
  new master before merging, re-run the proof test, then ff-only
  merge (per loop rules + the stale-base lesson).
- `check.js --quick` took 655s (11 min) — the box was heavily loaded
  (load average ~13, several sibling loops active), not a suite
  problem.

## Files

- Prereg: `evidence/2026-11-07/journey-establishment-r112-prereg.md`
- Driver: `scripts/journey-establishment-r112-20261107.js`
- Analyzer: `scripts/analyze-journey-establishment-r112-20261107.py`
- Proof test: `scripts/test-journey-establishment-r112-ladder.js`
- Analysis: `evidence/2026-11-07/journey-establishment-r112-analysis.txt`
- Panels: `evidence/2026-11-07/journey-establishment-r112-{before,after}-seed{1502,1504,1603,1604,17101..17112}.json`
  (26 before + 32 after files incl. convo `.txt`)
- Proof logs: `evidence/2026-11-07/journey-establishment-r112-proof-{before,after}.log`
