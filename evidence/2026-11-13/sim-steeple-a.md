# sim-steeple-a — Unleash Rage + Steeple narration dedup

Run: fleshout-20261113T1615Z (Loop A), arm sim-steeple-a
Axis: scale-onramp (sim-findings.md #2301 + #2302, claimed by this arm)
Branch: sim-steeple-a — worktree ~/workspace/worktrees/sim-steeple-a
Base: master 48ed1ffd7 (rebased cleanly at spawn; prereg anchor 05b9bb45)
Date: 2026-11-13
Coordinator: adoption (worker done; evidence file, gate, rebase and merge are the adoption coordinator's).

## Verdict: GO (both lines, judged separately)

Both lines reproduce on current master, both are re-application repeats
(not one firing per distinct attack), and the fix cuts each to once per
(fight, monster) with survival/wave numbers byte-identical on all 9
seeds. All six pre-registered GO bars PASS (below).

## Canon

- docs/CANON.md + docs/MONSTER-WAVES.md read. The Congregation, wave 4:
  invite-then-absolve liturgy, "the bell is the telegraph", heresy is
  the counter. Telegraph honesty is law.
- docs/SYSTEMS.md read — it carries NO Unleash-Rage-specific canon.
  No canon doc covers the rage ability; the authority is the data:
  src/data/abilities.json rage/unleash_rage — cost {turn: true,
  kcal: 60}, effect "Your next three strikes deal double damage."
  Canon gap noted, not invented.
- Congregation data (src/data/monsters.json): Absolution [50,70]
  (beam, windup 2, weight 3) and Excommunication [42,62] (beam,
  windup 2, weight 2, hpBelow 0.5). Data telegraph: "The steeple
  RINGS before it strikes — the bell is the telegraph."

## Check leg: REPRODUCES (both lines)

Driver scripts/steeple-check-driver-20261113.js, competent verbatim,
150d death-aware, seeds 190391–190398 + 190407 (9 seeds).
Anchor-guarded (HEAD must equal the prereg commit 05b9bb45).
Instrument: Game.say wrap (both lines + ignition beats + controls),
Game.useAbility wrap (every rage press with its pre-state), and a
MonsterBehaviorHooks.sigCongregation wrap (every hook call with monster
key + sigCong phase/cycle + whether the steeple line fired inside that
call — exact per-(fight, monster) attribution).

| seed | days | end | maxWave | standing | rage | worst fight | presses fresh/refresh | steeple | worst (f,m) | ignitions |
|------|------|-----|---------|----------|------|-------------|----------------------|---------|-------------|-----------|
| 190391 | 65 | village-lost | 4 | 145 | 3 | 3 d63 | 3 (1/2) | 0 | 0 | 0 |
| 190392 | 143 | village-lost | 4 | 199 | 0 | 0 | 0 | 0 | 0 | 0 |
| 190393 | 126 | village-lost | 4 | 199 | 0 | 0 | 0 | 9 | 9 d114 | 2 |
| 190394 | 128 | village-lost | 4 | 199 | 25 | 13 d119 | 25 (4/21) | 0 | 0 | 0 |
| 190395 | 150 | survived | 4 | 199 | 0 | 0 | 0 | 27 | 14 d143 | 10 |
| 190396 | 140 | village-lost | 4 | 199 | 28 | 17 d130 | 28 (3/25) | 57 | 19 d130 | 20 |
| 190397 | 135 | village-lost | 4 | 199 | 78 | 51 d93 | 78 (6/72) | 22 | 12 d110 | 8 |
| 190398 | 139 | village-lost | 5 | 370 | 33 | 30 d68 | 33 (3/30) | 0 | 0 | 0 |
| 190407 | 133 | village-lost | 4 | 199 | 75 | 32 d86 | 75 (4/71) | 0 | 0 | 0 |
| TOTAL | | | | | **242** | | 242 (21 fresh / 221 refresh) | **115** | | 40 |

Controls hold exactly (both sibling fixes live on master):
freezeline 21 (after-leg total), applystatus 10 (after-leg total),
bellows 51 (check-leg total). Survival numbers match the
applystatus-a check leg exactly on all 9 seeds.

### #2301 Rage — trigger: REFRESH of a wholly unspent buff

- 242 lines = 242 presses, one line per press. Only 21 presses are
  FRESH (rageActive absent); 221 are REFRESHES, and ALL 221 refresh
  at rounds=3 — wholly unspent. Pressing consumes the turn, so no
  strike ever spends the rounds; the next winning turn presses again.
- Worst fight: 32 lines (190407), 28 (190397), 21 (190398), 17
  (190396 d130 — the finding's fight: 1 fresh + 16 refresh, all
  unspent). Per the prereg rule (≥2 lines in one fight AND ≥1
  refresh press): **GO-FIX**. The repeat is a re-application repeat,
  same class as the fixed freeze lines.
- Mechanism (static, confirmed by the counts): there is NO
  `'rage.unleash_rage'` precheck — re-pressing while live is allowed,
  overwrites rounds to 3, and re-says the line, spending turn + 60
  kcal. (Contrast haymaker, which HAS a precheck refusing re-tap
  while wound up, with the comment "a policy that taps it every turn
  softlocked the fight".) The competent policy (competent.js:2598,
  step 5) presses rage on EVERY winning, non-trivial player turn,
  with NO once-per-fight guard (unlike bird_strike / pocket_sand).
  The pocket_sand comment already names "the rage-loop failure
  shape". The policy waste itself (turn + kcal burned re-applying an
  unspent buff) is a separate finding — filed, not fixed here (it
  needs a policy guard or a haymaker-style precheck, both mechanic
  changes; see §Sense-testing carried findings).

### #2302 Steeple — trigger: PER-MONSTER-TURN, not per-beam

- 115 lines vs 40 ignition beats (35 Absolution + 5 Excommunication)
  across the band. Worst (fight, monster): 19 vs 7 ignitions in that
  fight (190396 d130), 17 vs 6, 16 vs 6, 14 vs 10, 13 vs 10 (190395:
  TWO Congregations in ONE fight, 14 + 13 lines), 12 vs 5, 10 vs 3,
  9 vs 2, 5 vs 1. The line fires ~3x per beam cycle — once per
  absolve-phase monster turn (windup turns + ignition turn + firing
  turns all say it), while the beam ignites once per cycle. Per the
  prereg rule (steeple count > ignition count per (fight, monster)):
  **GO-FIX**.
- The finding's "57 times in one fight" is 57 times in one DAY
  across FOUR fights (19/17/16/5 per (fight, monster)) — the sense
  replay grouped by day. The per-(fight, monster) numbers are the
  honest repeat metric, and they still condemn the line.
- Mechanism (static): `sigCongregationHook` (sigW4.js:141) runs once
  per Congregation monster-turn via `mbRunPreTurn`
  (monsterBehaviors.js:208, tbMonsterTurn game.js:43319). After the
  invitation resolves, EVERY absolve-phase monster turn says the
  line and returns false so the generic beam runs. A beam cycle is
  declare (windup 2) → ignition beat ("💥 Absolution! ...") → firing
  ticks, and the monster may pick Excommunication below half HP — so
  the line is neither once per beam nor once per cycle.
- Telegraph preservation: the ignition beat fires once per beam
  cycle and names the attack, and the data telegraph text rides the
  telegraph UI — so a once-per-(fight, monster) dedup of the hook
  line leaves later cycles telegraphed.

## Fix

Commit 6c2d6f33 ([needs-eyes] — narration change), two emit sites,
mechanic untouched at both:

- `src/js/abilityActions.js`, `rage.unleash_rage`: once-per-fight
  dedup of the SAY only, via a flag on the live fight object
  (`f._rageAnnounced`). The refresh still applies (rageActive reset
  to 3 rounds), the turn + 60 kcal are still paid, press counts are
  unchanged. Fail-open: no live fight, or any error, announces.
- `src/js/sigW4.js`, `sigCongregationHook` absolve branch:
  once-per-(fight, monster) dedup of the SAY only, via a flag on the
  live fight object keyed by monster key (`f._steepleAnnounced[m.key]`,
  the `f._snapAnnounced` shape from combatdedup-b). The hook still
  returns false on absolve turns, the beam/geas/invitation behave
  exactly as before. Fail-open: any error announces.
- The invite line, the geas lines, and the policy are NOT touched.

## After leg: 242 → 21, 115 → 9

Same driver, same 9 seeds, run on the fix commit (anchor override via
EXPECTED_ANCHOR env). Compare script
scripts/steeple-after-compare-20261113.js — exit 0, COMPARE: GO.

| seed | rage before → after (max/fight) | steeple before → after (max/f,m) | ignitions | invites | presses | freeze | apply | survival |
|------|-------------------------------|--------------------------------|-----------|---------|---------|--------|-------|----------|
| 190391 | 3 → 1 (3→1) | 0 → 0 | 0→0 | n/a | 3→3 | 1→1 | 1→1 | IDENTICAL |
| 190392 | 0 → 0 | 0 → 0 | 0→0 | n/a | 0→0 | 3→3 | 0→0 | IDENTICAL |
| 190393 | 0 → 0 | 9 → 1 (9→1) | 2→2 | n/a | 0→0 | 3→3 | 3→3 | IDENTICAL |
| 190394 | 25 → 4 (13→1) | 0 → 0 | 0→0 | n/a | 25→25 | 3→3 | 0→0 | IDENTICAL |
| 190395 | 0 → 0 | 27 → 2 (14→1) | 10→10 | n/a | 0→0 | 1→1 | 0→0 | IDENTICAL |
| 190396 | 28 → 3 (17→1) | 57 → 4 (19→1) | 20→20 | 58→58 | 28→28 | 2→2 | 2→2 | IDENTICAL |
| 190397 | 78 → 6 (28→1) | 22 → 2 (12→1) | 8→8 | n/a | 78→78 | 0→0 | 0→0 | IDENTICAL |
| 190398 | 33 → 3 (21→1) | 0 → 0 | 0→0 | n/a | 33→33 | 7→7 | 3→3 | IDENTICAL |
| 190407 | 75 → 4 (32→1) | 0 → 0 | 0→0 | n/a | 75→75 | 1→1 | 1→1 | IDENTICAL |
| TOTAL | **242 → 21** | **115 → 9** | 40→40 | 58→58 | 242→242 | 21→21 | 10→10 | 9/9 |

Remaining lines are exactly one per (fight, monster): rage 21 = 21
fights with ≥1 press; steeple 9 = 9 (fight, monster) pairs (190396's
4 = its four d130 fights, one line each; 190395's 2 = its two
Congregations in one fight, one line each). Ignition beats unchanged
in count per seed (telegraph preserved per cycle). Invite line
unchanged on 190396 (58→58, measured by the invite probe before the
fix; the check-leg JSONs predate the invite capture, so other seeds
are n/a for invites — the branch is untouched by the fix in any
case). Rage presses unchanged per seed (mechanic untouched).

## GO bars (pre-registered)

- (a) Each fixed line fires ≤1 per (fight, monster) — rage ≤1 per
  fight: PASS (max/fight 1, max/(f,m) 1 on every seed).
- (b) Telegraph/mechanic preservation: ignition-beat counts
  byte-identical per seed (40→40); rage press counts byte-identical
  per seed (242→242): PASS.
- (c) Survival/wave numbers BYTE-IDENTICAL on all 9 seeds: PASS
  (days, gameDays, endReason, won, over, villageLost, scaleRank,
  maxWave, unlockedWave, standing, endPantryKcal, FULL deaths arrays
  — verified by the compare script, exit 0).
- (d) Controls hold: freezeline 21→21, applystatus 10→10: PASS.
- (e) Proof test scripts/test-steeple-a.js RED→GREEN: PASS
  (31/31 instrument + 23/23 game-level; RED pre-fix was exactly the
  5 dedup assertions, all mechanic legs green throughout).
- (f) `node scripts/check.js --quick`: (gate log
  evidence/2026-11-13/sim-steeple-a-gate.log — see §Gate.)

## Proof

`node scripts/test-steeple-a.js` — **31 passed, 0 failed**
(instrument legs: regexes, grouping/judge boundaries, anchor,
emit-site + no-rage-precheck facts).

### Adoption addendum (2026-11-13, coordinator)

The worker's 31/31 was measured pre-rebase. On the rebased tip
(7f16a2f88, base 05aa4ce5a) the proof ran **30/1**: only the §5
anchor-ancestry assertion failed — the rebase had rewritten the
prereg commit 05b9bb45 as 6ae69b5d6 (arm files byte-identical,
verified by `git diff 05b9bb45 6ae69b5d6 -- <arm files>`, empty),
orphaning the hardcoded hash the test pinned. The fix (committed
with this addendum): §5 now resolves the prereg commit by its exact
message on the branch and verifies the prereg file it carries is
byte-identical to the working file — same check, rebase-proof; a
dropped or altered prereg still fails. Proof on the final tip:
**32/32 instrument + 23/23 game-level** (32 = 31 + the new
prereg-content leg). The game legs were re-run, not carried: R1–R3
+ S1–S3 all green on this tip.
`node scripts/test-steeple-a.js --game` — **23 passed, 0 failed**
(game-level legs: R1 three presses → one line + buff refreshed +
60 kcal paid per press; R2 second fight re-announces once; R3
out-of-combat press refused, no line, no buff, no kcal; S1 four
hook calls → one steeple line + two invite lines + alternating
returns + phase/cycle intact; S2 driven monster turns → one steeple
line + ≥1 ignition beat; S3 second fight re-announces once).
RED run (pre-fix): 18 passed, 5 failed — exactly the 5 dedup
assertions (R1, R2×2, S1, S2 pre-fix fired 3x/3x/2x/7x).

## Gate

`node scripts/check.js --quick` in this tree: **326 passed, 14 failed
in 1884s** (log evidence/2026-11-13/sim-steeple-a-gate.log). Gate GO
after adjudication — 0 failures attributable to the fix (which touches
two src/js files, narration-only):

- Staleness (3, pre-existing standing failures, fail identically
  without the fix): test-measurement-proof-update + test-measurement-
  workflow ("Proof source inputs are not current" / retained neutrality
  proof stale) and test-phone-frame-proof (stale phone receipt). The
  phone-frame mismatch list now also names src/js/abilityActions.js
  because the fix edited it — but the test was already failing for the
  same stale-receipt reason on master; the verdict is unchanged, not
  a regression. The neutrality proof and phone receipt need a refresh
  before they can be trusted as gates again (standing item, filed by
  sim-combatdedup-b).
- Cache-flags (1): test-measurement-cache-flags 0/4 — the documented
  box-load artifact (AGENTS.md 2026-11-12: scores track box load, not
  the change under test). The gate ran under load average 12.8 with
  the sibling strikefall-a gate + probe jobs concurrent.
- Timeouts (10, all timing-capped under that load — the gate took
  1884s vs 678s for the applystatus gate on a quiet box): living-
  garden + one-person-army (pre-existing timeout classes, also timed
  out in the applystatus gate) and occupation-panels, solo-campaign-
  endings, time-save-crashes, time-save-failures, synergy-stall,
  capable-bot, table-endings (all exact-120s caps) plus trust-
  observer-neutrality (exit 1 at 114.2s — its 60s child-process
  timeouts tripping under load). Two re-run alone after the gate pass
  clean: trust-observer-neutrality 6/6, capable-bot 42/42 (161s —
  genuinely >120s under load, hence the gate cap).
- No failure mentions rage, steeple, sigW4, or the dedup flags. The
  proof test itself (scripts/test-steeple-a.js) is a green-list job
  with no quick tag, so it runs in the FULL check.js, not --quick;
  it was verified directly instead (31/31 + 23/23 game-level above).

## Sense-testing carried findings (worker-filed, out of arm scope)

Two new sim-findings.md entries, same hook / same policy family as
the fixed lines, each needing its own arm before any fix claim:

- CONGREGATION INVITE/ABSOLVE ALTERNATION (this arm, instrument-
  proven): `sigCongregationHook` alternates invite/absolve EVERY
  monster turn — the absolve branch resets `C.offered = false`, so
  the next turn re-takes the invite branch (consuming the turn, no
  attack). On seed 190396: 115 hook calls = 58 invite lines + 57
  steeple lines; fight 1's first 8 calls alternate strictly
  (invite, steeple, invite, steeple...), zero geas turns. The invite
  line repeats 19x in one fight, and the monster attacks on only
  ~half its turns. The invite-then-absolve liturgy (MONSTER-WAVES.md:
  "Invite -> geas if accepted -> absolve") reads as a sequence, not
  an alternation — but fixing the state machine is a MECHANIC change
  (the monster would attack twice as often), out of this narration
  arm's scope. Needs a design call / separate arm.
- RAGE-LOOP POLICY WASTE (this arm, instrument-proven): the competent
  policy presses rage every winning turn; 221/242 presses on the
  check band re-apply a wholly unspent buff (rounds=3 at press time),
  burning the turn + 60 kcal each time for nothing the buff doesn't
  already give. The player effectively stops striking for most of a
  long fight (the d130 fight ran 38 monster-turns with 17 rage
  presses). The narration is fixed here; the waste needs a policy
  once-per-fight guard (cf. bird_strike/pocket_sand `pressed.*`) or
  a haymaker-style engine precheck refusing re-press while live —
  both mechanic changes, out of scope here.

## Metric review

The prereg's decision rules judged both lines correctly: the
refresh/ignition ratios (rage 221/242 refresh, steeple 115 lines vs
40 ignitions) separated re-application repeats from honest
per-attack firings with no ambiguity, and the worst-fight numbers
(32 rage lines, 19 steeple lines per (fight, monster)) matched the
finding's counts on the observation seed (17/19 on 190396 d130 —
the finding's "57 in one fight" was 57 in one DAY across four
fights, corrected by the per-(fight, monster) attribution). One
metric note: the check-leg JSONs predate the invite-line capture
(added after the check leg for the alternation finding), so the
invite control compares only on seed 190396 (probe corpus) — the
fix never touches the invite branch, and the proof test gates the
invite count at the hook level instead. No metric proved wrong; no
revision proposed.

## Files

- src/js/abilityActions.js — the rage fix (commit 6c2d6f33).
- src/js/sigW4.js — the steeple fix (commit 6c2d6f33).
- scripts/steeple-check-driver-20261113.js — check/after driver
  (anchor override for the after leg: EXPECTED_ANCHOR env).
- scripts/steeple-check-analyze-20261113.js — analyzer (check +
  after corpora).
- scripts/steeple-after-compare-20261113.js — before/after compare
  (survival byte-identical + all GO bars, exit 0 = GO).
- scripts/test-steeple-a.js — proof test (31 instrument + 23 game).
- evidence/2026-11-13/perseed-steeple-a-check/ — 9 check-leg JSONs.
- evidence/2026-11-13/perseed-steeple-a-invite/ — 190396 invite-probe
  JSON (invite line count + alternation instrument).
- evidence/2026-11-13/perseed-steeple-a-after/ — 9 after-leg JSONs.
- evidence/2026-11-13/sim-steeple-a-prereg.md — prereg.
- evidence/2026-11-13/sim-steeple-a.md — this file.
- evidence/2026-11-13/sim-steeple-a-gate.log — --quick gate log.

## Findings

sim-findings.md #2301 + #2302 marked [fixed 2026-11-13 by Loop A arm
sim-steeple-a, run fleshout-20261113T1615Z: CHECK reproduces on
current master (rage 242 lines / 242 presses, 221 refreshes all at
rounds=3, worst fight 32; steeple 115 lines vs 40 ignitions, worst
19 per (fight, monster)); fixes are once-per-(fight, monster) SAY
dedups at the two emit sites (abilityActions.js f._rageAnnounced;
sigW4.js f._steepleAnnounced[m.key]) with mechanics untouched;
after-leg on identical seeds rage 242 -> 21 (one per fight),
steeple 115 -> 9 (one per (fight, monster)), ignitions 40 -> 40,
presses 242 -> 242, invites 58 -> 58 on 190396, survival/wave
numbers byte-identical 9/9; freezeline control 21 -> 21,
applystatus control 10 -> 10. Proof scripts/test-steeple-a.js
31/31 + 23/23 game-level, RED->GREEN. Evidence
evidence/2026-11-13/sim-steeple-a.md.]
