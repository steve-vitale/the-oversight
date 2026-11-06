# Wild death channel of first wave-4 killers + killer-aware retreat trigger — PRE-REGISTRATION (arm sim-killerwild-b)

Run: fleshout-loop-b-20261106T0730Z. Axis: scale-onramp / winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Committed BEFORE any judged sim. Policy-side probe
only; zero src/js. NO gate/price/deed/readyDemand change. No flee-repair
(STEVE CALL on scope — this arm does not touch it). No duplication of
Loop A's live work this hour (staging+rally, finishing probe).

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": "Standing opens the wave
  door; combat readiness decides whether the village walks through." Wave 5
  demands 2 LIVING villagers with wave-4+ kills (`waveCombatReadiness(5)`
  counts DISTINCT killer vids with a wave-(w-1)+ kill in
  `state.waveKillLog`, LIVING only). No canon invented here.
- Code-read (not canon, stated with file/function names):
  `src/js/standing.js` `waveCombatReadiness(5)`; `src/js/game.js`
  `recordWaveKill(monsterId, killerVid, via, detail)` is the per-kill choke
  point (append-only log, survives the killer's death); `src/js/ledger.js`
  `playerDeath(cause)` is the scholar-death choke point; its fallen push
  defaults cause to 'the wild' when the caller passes none — a fallen
  'the wild' is a RESIDUAL, not a cause, until split by other evidence.
  `scripts/policies/tbretreat-refind.js` (current best baseline): scholar
  disengages from a losing wild wave-4+ TB fight at scholar HP < 75% AND
  live wave-4+ monster HP > 75%, havenward with a persistent chase;
  at the haven node the direction is null and the trigger HOLDs (counted
  as haven-hold). The trigger is scholar-only: NPC field fights are
  engine-driven and no policy hook reaches them.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-05/sim-killerdeath-b.md` + prereg (band 99131–99138,
  competent verbatim vs retention): retention kept fresh killers alive
  much longer (66d vs 2d on the live seeds) yet NO pair formed — second-
  killer production was absent, and remaining deaths were at home in the
  arena/expedition; retention as a pair lever is NO-GO and must NOT be
  re-run. This arm does NOT re-run retention and does NOT reuse its band.
- `evidence/2026-11-05/sim-tbretreat-refind-confirm-b.md` + prereg
  (24 fresh seeds): retreat-and-refind CONFIRM GO — TB survival 7.4% ->
  22.4%; remaining death modes on trigger fires are haven-hold 7/27 and
  died-mid-retreat 6/27. This arm's baseline IS that policy, and its
  trigger-fire event record is the coverage instrument.
- `evidence/2026-11-04/sim-wildbucket-a.md` (24 seeds): the fallen 'the
  wild' bucket is 132/132 scholar losing a turn-based fight to a monster
  out in the world — the wild death channel is TB-wild unless split
  evidence says otherwise. This arm splits every killer death by the
  killerdeath instrument's rules instead of citing the bucket.
- `evidence/2026-11-05/sim-killerdeath-b.md` killer ledger (99136): a
  first killer died 2d after first blood in a wild fight; under retention
  the same seed's killer lived 66d. The wild-death channel is the open
  question this arm answers: WHICH wild deaths take first killers, and
  does the refind trigger reach them?

## Seed-band freshness (mandatory, done before this prereg)

- Pilot band 56001–56008; confirm band 57001–57016 (57001–57008 core +
  57009–57016 extension, 12–16 seeds only on pilot GO).
- Search scope: ALL dated preregs (`evidence/*/sim-*-prereg.md`) AND all
  evidence `.md` files, grepped for `5600[1-8]` and `570(0[1-9]|1[0-6])`.
  Result: 0 hits in both scopes (grep exit 1, no matching files).
  Coordinator pre-check (~07:40Z) found the same 0 hits; this re-verification
  was run fresh at ~07:50Z.
- Forbidden/contaminated lists: no prereg names a separate forbidden-band
  list file; the inline forbidden/contaminated band numbers in preregs
  (74201–74208, 73601–73608, 9700–9711, 9930–9941, 9950, 10000) are
  disjoint from 56001–56008 and 57001–57016, and the full-evidence grep
  above covers them.
- Caveat, stated not hidden: Loop A is live this same hour in its own
  worktree; a band Loop A names in uncommitted work cannot appear in this
  committed-evidence search. If a collision surfaces, the verdict is
  corrected by a correction commit naming the missed source.

## Question

Through which channel do FIRST wave-4 killers die in the wild, and does
the refind retreat trigger reach those deaths — so that a killer-aware
earlier trigger could keep a fresh killer alive long enough for a second
killer to be blooded?

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 56001–56008, baseline = tbretreat-refind policy (the current
  best, NOT verbatim competent), 150d death-aware horizon (dead villages
  stop simulating, +10d tail max via runDays).
- STAGE 0 (DIAG, this run): run the baseline on 56001–56008. Classify
  every FIRST wave-4 killer's death by channel (taxonomy below) and measure
  retreat-trigger coverage on killer deaths (trigger fired? haven-hold?
  died mid-retreat? no-fire?). Stage 0 completes when every dead first
  killer has a channel AND a coverage label, with 0 instrument errors.
  Stage 0 carries no GO/NO-GO of its own; its verdict is DIAG.
- STAGE 1 (BUILD, same run, only after Stage 0): build the policy-actionable
  lever Stage 0 identifies. Leading candidate (direction frozen here,
  exact numbers in the addendum): a KILLER-AWARE RETREAT TRIGGER — a
  fresh wave-4 killer (scholar whose latest wave-4+ kill is 0–30d ago,
  the same 30d window as the retention probe) retreats EARLIER than the
  refind 75/75 trigger (tighter scholar-HP and/or monster-HP thresholds),
  because a fresh killer's life is worth two (half the veterans bar).
  The addendum freezes the exact thresholds from the Stage 0 no-fire
  evidence (e.g. the scholar-HP distribution at fatal-fight start) BEFORE
  any armed sim. If Stage 0 shows a DIFFERENT policy-actionable lever
  (e.g. the binding deaths are non-TB, or haven-holds dominate and no
  threshold helps), the addendum names that lever instead, with its own
  frozen definition — and if no policy-actionable lever exists, the run
  ends DIAG with the census as deliverable and no Stage 1 build.

## Channel taxonomy (Stage 0; from the killerdeath split rules)

Per dead wave-4 killer (first killer first, then all killers):
- TB-wild — scholar-death wrap: in-combat AND away from haven.
- TB-home — scholar-death wrap: in-combat AND at haven.
- field — fallen entry threads monsterId/monsterName with no scholar-death
  context (NPC field-fight death; engine threads the monster).
- arena — scholar-death causeArg (or literal fallen cause) 'the arena',
  not in combat.
- expedition — causeArg (or literal) 'the expedition', not in combat.
- contest — cause contains 'contest', not in combat.
- other:<detail> — any other literal cause with its location/combat context.
- 'the wild (unsplit residual)' — bare 'the wild' with NO split evidence;
  reported with its count, NEVER cited as a cause.

## Trigger-coverage taxonomy (Stage 0; join on day + fighterVid + mid)

Per dead killer whose channel is TB-wild or TB-home:
- fired-exited — a refind event on the death day for that fighter with
  result 'exited' (survived the fired fight; death came later that day).
- haven-hold — event on the death day, result 'haven-hold'.
- died-mid-retreat:<result> — event on the death day, result open /
  consumed-sealed / consumed-worldEdge / consumed-blocked / stuck-fallback /
  crossing-cap.
- no-fire — no event for that fighter on the death day, but a player-TB
  wave-4+ fight row within 2 days before death (the trigger never fired
  in the fatal fight). A same-day fire by ANOTHER fighter is reported in
  the label and never counted as coverage.
- no-tb-fight-near-death — no player-TB wave-4+ fight row within 2 days
  before death (the fatal fight is not in the instrument's fight rows).
NPC killers are 'npc-policy-blind' (the trigger is scholar-only).
Non-TB channels are 'n/a (non-TB channel)'. The join is day+fighterVid
(+mid where the fight rows name it); the policy-observed event record is
authoritative, the fight-row join is corroboration.

## Primary metric (binding — judge only against this; Stage 1 pilot)

First-killer wild survival: per seed, the FIRST wave-4 killer blooded
(earliest firstDay; ties by log order) alive 14d after first blood
(aliveAtEnd, or killToDeathDays > 14 — death exactly 14d after first blood
does NOT count as alive at 14d).

GO iff armed first killers alive 14d after first blood >= baseline + 2
(count-based, 8 seeds). Guards: total wave-4 kills armed >= 1/2 baseline
total; median survival armed >= 0.8x baseline median. A miss is NO-GO,
never re-scored against a friendlier metric. Pilot 8 seeds only; confirm
12–16 on FRESH seeds (57001–57016), same design, ONLY on pilot GO.

## Secondary (reported, never re-scored)

- Channel shares and coverage shares over dead first killers (and over all
  dead wave-4 killers as context).
- Kill-to-death median (first kill → death, dead killers only).
- Trigger-fire totals per leg (fires, exits, haven-holds, died-mid-retreat).
- Wall numbers every run: wins, national, table, wave 4–5 unlocks, wave 4–5
  faced, median survival days.
- Per-killer trajectories for the closest seed. Closest seed = highest
  maxSimultaneous, tie-broken by longest killer survival (alive at end
  beats any death span; else max kill-to-death days).
- Killer channel mix (player vs NPC via kill-time scholar capture).

## Balanced panel (§15)

INAPPLICABLE, stated not fabricated: there is no Game-root change to
compare — baseline vs armed differ ONLY in the policy (tbretreat-refind
vs tbretreat-refind + killer-aware wrapper) on identical seeds with an
identical instrument. That policy A/B is the comparison; no balance-panel
compare exists for a policy-side probe, and none is attached.

## Sense-testing law

Read transcripts/dialogue for at least one killer's death (death-day say
lines in the corpus, plus the death context): judge meaning, coherence,
consequences — never just counts.

## Proof (committed with this prereg, before judged sims)

`scripts/test-killerwild-20261106.js` — 20/20 PASS (15 fixture tests:
channel branches TB-wild/TB-home/arena/expedition/field/wild-residual;
coverage branches fired-exited/haven-hold/died-mid-retreat/no-fire/
no-fire-other-fighter/no-tb-fight-near-death/npc-policy-blind; alive-14d
boundary 14-vs-15; determinism; judge GO / NO-GO-diff-1 /
NO-GO-kill-guard on mini-corpora; live harness smoke 150d seed 56001
baseline to /tmp, 0 instrument errors; off/on neutrality leg 150d seed
56001: identical days, endReason, wave-4 kill count). Instrument:
`scripts/killerdeath-instrument-20261105.js` (reused as-is; proven
neutral by sim-killerdeath-b). Driver:
`scripts/killerwild-driver-20261106.js`. Analyzer:
`scripts/killerwild-analyze-20261106.js`.
Smoke result (NOT a judged number — tooling verification only, corpus
deleted after the read): seed 56001, 71d, village-lost, maxWave 4,
standing 199 (gated 199, readiness vets 1), 2 wave-4 fights, 1 wave-4
kill, 1 refind trigger fire (a haven-hold, 0 exits), 0 instrument
errors. Smoke HYPOTHESIS (judged data decides): on this band the first
killer arrives and the trigger fires but holds at haven — if judged
killer deaths are likewise haven-holds, a tighter threshold cannot save
them and Stage 1 must be a different lever.

## Metric review (per §14; filled at verdict time, not now)

- Whether the 14d alive window fits a "fresh killer" (30d window) lever.
- Whether the count-based +2 bar is reachable on a band this killer-poor
  (killerdeath's band had only 4 killers ever on 8 seeds).
- Whether the day+fighterVid join missed fatal fights the trigger did
  or did not fire in.
