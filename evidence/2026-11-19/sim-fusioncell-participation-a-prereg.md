# sim-fusioncell-participation-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-fusioncell-participation-a · **Loop A run:** fleshout-20261119T2215Z
**Type:** DIAG (evidence-only, no game-code change)
**Frozen:** 2026-11-19 ~23:50 UTC, before any judged sim.
**Branch:** `sim-fusioncell-participation-a` (worktree
`~/workspace/worktrees/sim-fusioncell-participation-a`). **Base:** master
5e38f3f7b (verified with `git rev-parse HEAD` before any work).
**Builds on:** `evidence/2026-11-19/sim-fusioncell-fix-a.md` §3 (the
participation finding) and §6 metric review,
`evidence/2026-11-19/sim-fusioncell-fix-a-prereg.md`,
`evidence/2026-11-19/sim-fusioncell-a.md` (the diag).

## The question (the 1815Z round's next blank #1)

The fix put cells in searcaster holders' hands, but the gun never
fired. All 7 armed-holder entries were ONE holder, nora_wilson (seed
107028, searcaster + 2 cells, days 131–143), who was an ALLY, never
the lead fighter, in 7 wave-4+ meetings — and every one of the 7
fights ended vFlee. The volley is the LEAD fighter's only
(`src/js/fieldFights.js` ~975–1060). The diag's holder chen_wei held
the searcaster 97 days and never led or joined a wave-4+ fight at
all. Three questions:

1. **What decides the lead fighter in a wave-4+ party fight** — the
   rule, named from code, with an attribution share on the new band.
2. **Why does a party with an armed searcaster flee** — what triggers
   vFlee, and does the armed ally's presence change anything?
3. **Is the volley lead-only by design, and can an ally ever fire?**

## The mechanism (frozen, from code read — not a sim)

- **Lead = the `vid` passed to `fieldFight`.** The volley reads
  `vp` (the fighter vid) only: their equipped ranged weapon via
  `rangedWeaponOf(vp, ...)`, their OWN items for ammo; each shot
  costs 1 ammo; damage hits the lead monster. Allies strike in
  melee with their own weapons but loose NO volley — there is no
  ally-volley code path anywhere in `fieldFights.js`. An ally
  holding a searcaster with cells cannot fire, by construction.
- **Lead-selection rule, by call site** (the `vid` each caller
  passes):
  - `expedition` — `villager-agency.js expeditionMonster`: `vid`
    is the expedition HOLDER, the villager whose expedition it is.
    Allies come from `villagerFightAllies(vid)` (`party-wiring.js`):
    launch party FIRST (SENSEEXPED=1 — same-target expedition
    companions, expedition-start order, no trust floor), then
    outdoor crew trust-ordered, then earshot (node distance ≤ 1),
    trust floor ≥ 15, capped at 2. The holder leads because they
    launched; nobody is picked as "the fighter" — the expedition
    decides it.
  - `world-tick` — `game.js resolveWildMonsterEncounter`: `vid`
    is the villager the wild monster met (patrol/assignment
    context); allies via the same `villagerFightAllies`.
  - `patrol` — `game.js resolvePatrol`: the patrol leader.
  - `aid` — `game.js` aid path: the villager being aided / the
    responder's target.
  - `sortie` — `havenGrowth.js lingererSortie`: `leader` with
    `cornered: true`.
  - `alien-leader` — `alienPlayers.js`: the alien-player fight
    leader. `contest` — `contestEngine.js`: the contestant.
  - `nomad` — `nomad-drive.js` / `nomad-wild.js`.
- **Flee (vFlee) triggers** (`fieldFights.js`): the lead's break
  line `vBreak` = clamp(0.5 − bravery×0.015 − bold 0.1 + cautious
  0.1, 0.15, 0.6), blended with the shared `fighterState` curve
  `fleeLine`, minus hold bonuses (armed +0.08; allies +0.04 each,
  max 0.12; party bonds; day ≥ 7 +0.08; rally aura), clamped
  [0.05, 0.6]. From round 2 the trajectory is read: `hopeless`
  when rounds-to-drop (party hypothetical HP ÷ incoming rate)
  < rounds-to-kill-lead × 0.85. Then, in order: winning → hold
  (floor 0.05); hopeless + an ally still at hand → SHOUT (ally
  joins) instead of fleeing; hopeless + no ally left → vFlee
  (`fleeHopeless`), unless rally / war_cry fires first; HP below
  `fleeAt` → vFlee (floor flee); `learn` intent + round ≥ 3 +
  not winning → vFlee (`fleeLearn`, withdraw to report);
  committed-finish fighters hold to the 40% companion floor, then
  vFlee. **An armed ally's presence changes the flee math only
  through the ally hold bonus (+0.04 per ally, max 0.12) and the
  party-HP survival pool — the ally's searcaster and cells do NOT
  enter any flee input.** The volley can end the fight before
  contact (drive-off `mBreak` / lead kill), but only when the LEAD
  holds the ranged weapon.
- **Why the 7 fix-a flees are the shape to expect:** a wave-4
  monster (HP 850–1500, damage 35–95) against a party whose lead
  deals ~4–8 damage per strike reads hopeless from round 2 on the
  damage race, so the party shouts, burns its allies, and runs.
  The armed ally neither fires nor changes the race — the race is
  judged on the lead's melee plus the party's survival pool.

## Primary metric (BINDING, §14)

**DIAG-GO iff ALL THREE hold on the new band (8 seeds, single leg):**

1. **Lead-selection rule attributed on ≥ 80% of wave-4+
   meetings** — each v4encounter row carries `leadRule` from the
   call stack at the fieldFight wrap (`expedition-holder` /
   `world-tick` / `patrol` / `aid` / `sortie-leader` /
   `alien-leader` / `contest` / `nomad` / `other:<fn>` /
   `unclassified`); attributed = any rule except `unclassified`
   (an `other:<fn>` row counts as attributed — the caller is
   named — but is listed in the evidence so a new call site is
   visible, not hidden).
2. **Flee cause classified on ≥ 80% of flee events, with ≤ 2
   unclassified** — each vFlee row carries `fleeCause` from the
   fight record (`hopeless-alone` / `hopeless-after-help` /
   `floor-hp` / `learn-withdrawal` / `committed-finish-floor` /
   `unclassified`); the classifier is a pure function over rec
   fields (`fleeHopeless`, `fleeLearn`, `fleeHpFrac`, log lines,
   `rounds`, `everHopeless`, `shoutRound`, `calledHelp`), shared
   by driver and analyzer, covered by the proof test.
3. **Pool floors: ≥ 25 wave-4+ meetings AND ≥ 8 flees** (vFlee
   outcomes across the band) — else **NO-GO kind METRIC-BROKEN /
   pool-blocked** (do not re-score against a friendlier metric; a
   miss is NO-GO).

**Verdict ladder (frozen):**
- **DIAG-GO** = all three bars hold → the three questions are
  answered with measured shares; the named next arm (fix or
  further diag) is written up precisely and NOT built here.
- **DIAG-NO-GO** = any bar misses → the diag is unjudgeable on
  this band; the kind is recorded (METRIC-BROKEN / pool-blocked
  vs attribution miss) and the coordinator decides the next band.

## Secondary metrics (supporting, never re-scored)

- (a) Armed-holder entries on the new band (searcaster holder
  with ≥ 1 cell at a wave-4+ entry, any participant) and whether
  any armed holder LEADS; armed volleys fired (should be 0
  unless an armed holder leads — the code says they cannot fire
  as allies).
- (b) Flee-cause shares; flee rate with vs without an armed
  participant; volley damage share of mDealt on lead-ranged
  fights; deaths per engaged wave-4+ meeting (the §14
  exposure-normalized guardrail from the fix-a §6 proposal —
  recorded, NEVER re-scored into the verdict).
- (c) Lead-rule shares by origin; lead gear at entry (weapon
  bonus, armor P, bravery, temperament) for flee vs kill vs
  drive-off; sense-test notes from transcripts (SENSE-TESTING
  LAW — read the fight logs, judge whether the flee reads as a
  person deciding to run).
- Wall numbers (reported every run): national / table / wins,
  wave-4 and wave-5 unlocks, median survival, per seed. Table:
  not instrumented by this driver — reported as null, never faked.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the diag and the fix
  arms, for comparability). Dead villages stop simulating (+10d
  tail max).
- **Seeds: 107031, 107032, 107033, 107034, 107035, 107036, 107037,
  107038 — FRESH band.** Verified 2026-11-19 ~23:45 UTC: `grep
  -rln "107031\|...\|107038" evidence/ --include="*.md"` returns
  no hits (exit 1) across all evidence .md files. (The 18 GB
  evidence/ tree makes a full-corpus grep impractical; the .md
  check is the prereg-band freshness check — preregs record bands
  in .md. No .json corpus filename carries these seeds either:
  per-seed corpora are named by their own bands.)
- **Policies:** competent verbatim. **Substrate:**
  `SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 +
  FIGHTALLY2=1` (live master substrate, same as the diag and the
  fix arms). **Single leg** (diag on current master, no flag
  difference). BOWOPEN, BOWCRAFT, SPEARGATE, FUSIONCELL unset.
- **Instrument:** `scripts/fusioncell-participation-driver-a.js`
  (clone of `scripts/fusioncell-driver-a.js` — all cell/searcaster
  census + grant wraps kept verbatim — extended with per-encounter
  `leadRule` (stack taxonomy), `leadContext` (expedition / plan /
  companion state at entry), lead gear at entry, and `fleeCause`
  (pure classifier over rec fields); OUTDIR
  perseed-fusioncell-participation-a);
  analyzer `scripts/analyze-fusioncell-participation-a.js` (clone
  of `scripts/analyze-fusioncell-a.js` plus the participation
  judge on the three frozen bars); proof test
  `scripts/test-fusioncell-participation-a.js` (classifier
  fixtures + lead-rule fixtures + live ally-cannot-fire proof:
  lead with bow, ally with searcaster + cells → the volley comes
  from the lead's weapon and the ally's cells are unconsumed).
  **§15 panel:** `scripts/build-fusioncell-panels-participation-a.js`
  (clone of the diag panel builder, single leg) + `node
  scripts/balance-panel.js compare`; the compare .md is attached
  to the evidence file. The panel is the instrument, the
  pre-registered threshold is the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** the diag band saw 85 wave-4+ meetings (63
   engaged) on 8 seeds; the fix band saw 192 (171 engaged).
   The pool floors (≥ 25 meetings, ≥ 8 flees) are sized well
   below either — IF the new band behaves like either.
2. **Pool sizing:** the bars are shares (≥ 80%), so they are
   powered by whatever pool arrives; the floors are the power
   guard. If the band is quiet (few wave-4+ meetings), bar 3
   fails honestly as METRIC-BROKEN rather than passing on a
   thin pool.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-fusioncell-participation-a.js`, GREEN before the
   pilot) proves the lead-rule classifier on fixture stacks, the
   flee-cause classifier on fixture fight records, and — live —
   that an ally's searcaster never volleys (lead-bow volley
   fires, ally cells unconsumed). The analyzer `--selftest`
   covers the judge shapes (DIAG-GO, DIAG-NO-GO per bar,
   METRIC-BROKEN).

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read
for this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500; wave-4 gate is village standing ≥ 100 with the combat
readiness bars (armored 3 @ P≥10, armed 5, tricks 3, veterans 1
wave-3+ kill). **No canon doc covers fusion-cell supply, the
searcaster, or cell-weapon volleys** — said here rather than
inventing canon (same as the diag and the fix arms). The lead,
ally, volley and flee rules are cited from code (`fieldFights.js`
volley ~975–1060 + flee ~1246–1290 / ~2520–2780,
`villager-agency.js expeditionMonster`, `party-wiring.js
villagerFightAllies`, `game.js resolveWildMonsterEncounter` /
`resolvePatrol`, `havenGrowth.js lingererSortie`), not from canon.
