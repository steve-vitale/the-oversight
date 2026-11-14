# sim-rageprecheck-b — engine precheck (B) refusing Unleash Rage re-press while live

Run: fleshout-loop-b-20261114T0330Z (Loop B), arm sim-rageprecheck-b
Axis: winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). This arm attacks the
wave-4-kills link: the scholar burns turns re-pressing an unspent buff
instead of striking.
Branch: sim-rageprecheck-b — worktree ~/workspace/worktrees/sim-rageprecheck-b
Base: master 8ab7a81c8 (prereg anchor); fix on 82cfe281e
Date: 2026-11-14
Prereg: evidence/2026-11-14/sim-rageprecheck-b-prereg.md (binds this run)

## Verdict: GO (pilot) — primary 0, GO bar 0

The engine precheck closes the residual that killed lever (A):
successful wholly-unspent refresh presses 117 → 0 summed over
competent + capable, with guardrails held. Per-presser: competent
62 → 0, capable-run 55 → 0 — and the caller split proves the kill
lands exactly where the residual lived: capable's own path was
already 0/0, and its competent-fallback path went 55 → 0. No confirm
run is claimed here — the pilot GO is the verdict per the prereg
(Stage 2 confirm, 16 seeds 98801–98816, is the coordinator's call).
Disposition of the branch is the coordinator's call; this worker does
NOT merge (coordinator merges).

## Canon

- docs/CANON.md read. NO canon doc covers the rage ability; the
  authority is the data: src/data/abilities.json rage/unleash_rage —
  cost {turn: true, kcal: 60}, effect "Your next three strikes deal
  double damage." Canon gap noted, not invented. docs/SYSTEMS.md
  covers abilities generally; docs/ABILITY-REFUSALS.md covers the
  refusal pattern this lever uses (precheck before payment).
- Engine facts (verified in code): the engine counts STRIKES, not
  rounds (rageActive.rounds decremented per strike in
  _applyAbilityActionMods, abilityActions.js:543-547); rageActive is
  deleted at fight end (game.js:35115, BRAWLER FLAG HYGIENE); rage
  had no engine precheck (the key appeared exactly once, the impl).

## Lever (B) as implemented

`src/js/abilityActions.js`, `ABILITY_ACTION_PRECHECKS` — a new
`'rage.unleash_rage'` entry in the haymaker shape, refusing while
any live buff remains:

```js
'rage.unleash_rage': function (game) {
  var ra = game.state.scholar.rageActive;
  if (ra && (ra.rounds || 0) > 0)
    return { ok: false, why: 'The red is already down — your next strikes are already doubled. Strike to spend it.' };
  return { ok: true };
},
```

All three prereg design decisions as pinned: (1) refuse while
rounds > 0 (any live buff, not only wholly unspent); (2) a refused
press charges nothing — the precheck runs in useAbility BEFORE
payment and in activatableAbilities (button honesty), per the
module's own precheck_before_payment rule; (3) the refusal surfaces
honestly in the fiction via useAbility's existing pattern
(`say(why + ' (Unleash Rage)')`). The steeple once-per-fight SAY
dedup in the impl is untouched. (A) is NOT resurrected:
competent.js carries no `pressed.rage` guard (proof test asserts
it). The fix commit carries [needs-eyes] (combat feel).

## Proof: scripts/test-rageprecheck-b.js — GREEN 12/12 + 25/25

- Static legs 12/12: precheck text (rounds > 0, "already down"),
  haymaker mirror intact, key appears exactly twice (precheck +
  impl), impl still arms 3 rounds, steeple dedup untouched, no (A)
  in competent.js, capable guard untouched, canon cost turn + 60
  kcal, prereg commit is an ancestor. RED on the prereg commit
  first (4 precheck legs failed), GREEN after the fix. One test
  staging correction, documented in the test: the G1 "refused > 0"
  leg was mis-specified (see "Where the choke point fires" below)
  and was replaced by "every rage call was fresh (calls == fresh)".
- Game legs 25/25 (`--game`): R1 fresh press lands (3 rounds,
  -60 kcal, turn spent); immediate re-press refused (false, rounds
  still 3, kcal unchanged, turn NOT spent — p.acted stays false),
  and the refusal line says the red is already down. R2 re-press at
  rounds=2 refused (partly-spent is still live), no charge. R3
  three strikes spend the buff (3 → gone) and a fresh press lands
  again. R4 a new fight allows a fresh press. G1 seed 98801 driver
  legs — refresh-unspent → 0 per policy, fighter actually struck.
- Driver scripts/rageprecheck-driver-20261114.js (committed with
  the prereg): copied from scripts/rageloop-driver-20261113.js on
  branch sim-rageloop-b, adapted only (evidence dir 2026-11-14,
  successful-press primary, refused counts, stack caller split).
- Wiring: `node scripts/check-wired.js src/js/abilityActions.js`
  reports 0 unwired (18 functions, all called from src/). The full
  `node scripts/check.js --quick` stalled — 0:01 CPU in ~9 min
  under heavy sibling load (a second loop's check.js running in
  another worktree) — and was killed; `--only test-rageprecheck-b`
  matches 0 scripts in the harness, so the pinned proof test above
  (12/12 static + 25/25 game, re-run green after the fix commit)
  is the verification for this change, not a quick-check pass.

## Where the choke point fires (mechanism finding)

The precheck is consulted in TWO places — useAbility (before
payment) and activatableAbilities/`_actionAvailable` (button
honesty) — and in the sims it fires at the availability gate, not
at useAbility: competent's tryPress checks `_actionAvailable`
before calling useAbility, so a re-press attempt never reaches the
engine at all. That is why refused (useAbility-level) reads 0 on
BOTH legs of the pilot while successful refreshes read 117 → 0:
there is nothing to refuse because nothing attempts. The
useAbility-level refusal is proven directly by the R1/R2 staged
legs (rawPress bypasses tryPress) — it is the backstop for any
direct caller (a player tap through a path that skips the
availability check, a future policy that calls useAbility
directly). The "already down" line appears in 0 after-leg sim
files for the same reason; it is proven by R1, not by sim traffic.

## Pilot band: seeds 98801–98808, competent + capable, 150d death-aware

Primary (pre-registered): successful wholly-unspent refresh
presses (press while rageActive rounds=3, useAbility returned
true), summed over competent + capable on identical seeds. GO = 0.

| policy | presses before → after | refresh-unspent before → after | partly-spent refresh | rage kcal | strikes landed | wave-4 kills | wave-5 kills | won |
|--------|------------------------|-------------------------------|----------------------|-----------|----------------|--------------|--------------|-----|
| competent | 73 → 19 | **62 → 0** | 0 → 0 | 4380 → 1140 | 631 → 632 | 19 → 16 | 2 → 3 | 0/8 → 0/8 |
| capable | 75 → 30 | **55 → 0** | 0 → 0 | 4500 → 1800 | 225 → 256 | 13 → 14 | 6 → 8 | 8/8 → 8/8 |
| TOTAL | 148 → 49 | **117 → 0** | 0 → 0 | 8880 → 2940 | 856 → 888 | 32 → 30 | 8 → 11 | 8/16 → 8/16 |

Worst fight (max successful presses in one fight): competent
24 → 4; capable 22 → 4. Every press after the fix is fresh
(49/49). 5,940 kcal saved across the band. Refused presses
(useAbility-level): 0 → 0 both policies (availability gate, above).

Per-presser split (pre-registered, 0130Z metric review):

| presser | refresh-unspent before → after |
|---------|-------------------------------|
| competent-run (competent.js) | 62 → 0 |
| capable-run, capable-path | 0 → 0 |
| capable-run, competent-fallback path | 55 → 0 |

Guardrails (prereg): starvation competent 1 → 0, capable 0 → 0
(bar: ≤ control+2 — HELD); median survival competent 121 → 138d
(1.14× control — bar ≥ 0.8× — HELD), capable 90 → 90d (HELD).
Villager (non-scholar) deaths — the §14c co-primary: competent
413 → 410, capable 510 → 511; scholar deaths competent 76 → 84,
capable 15 → 16. No guardrail breached; the GO stands on the
primary AND the guardrails.

Per-seed (before → after; presses fresh/refresh-unspent, max/fight):

competent:
| seed | days | end | maxWave | standing | presses | max/fight | strikes landed |
|------|------|-----|---------|----------|---------|-----------|----------------|
| 98801 | 118 → 147 | village-lost | 4 | 199 → 199 | 6 (1/5) → 2 (2/0) | 6 → 2 | 73 → 126 |
| 98802 | 86 → 86 | village-lost | 4 | 199 → 199 | 0 → 0 | 0 → 0 | 74 → 74 |
| 98803 | 124 → 90 | village-lost | 4 | 199 → 125 | 31 (4/27) → 3 (3/0) | 24 → 1 | 168 → 85 |
| 98804 | 86 → 145 | village-lost | 4 | 199 → 199 | 15 (3/12) → 3 (3/0) | 6 → 2 | 91 → 118 |
| 98805 | 87 → 87 | village-lost | 5 | 205 → 205 | 0 → 0 | 0 → 0 | 32 → 32 |
| 98806 | 150 → 147 | village-lost | 5 | 295 → 320 | 5 (1/4) → 6 (6/0) | 5 → 3 | 62 → 68 |
| 98807 | 150 → 150 | survived | 5 | 300 → 300 | 16 (2/14) → 5 (5/0) | 12 → 4 | 53 → 51 |
| 98808 | 131 → 131 | village-lost | 4 | 199 → 199 | 0 → 0 | 0 → 0 | 78 → 78 |

capable:
| seed | days | end | maxWave | standing | presses | max/fight | strikes landed |
|------|------|-----|---------|----------|---------|-----------|----------------|
| 98801 | 90 → 90 | won | 4 | 199 → 199 | 0 → 0 | 0 → 0 | 9 → 9 |
| 98802 | 90 → 92 | won | 5 | 561 → 586 | 8 (5/3) → 7 (7/0) | 4 → 1 | 36 → 37 |
| 98803 | 89 → 90 | won | 4 | 199 → 199 | 8 (4/4) → 4 (4/0) | 4 → 1 | 5 → 5 |
| 98804 | 91 → 91 | won | 4 | 165 → 165 | 0 → 0 | 0 → 0 | 3 → 3 |
| 98805 | 104 → 104 | won | 4 | 199 → 199 | 1 (1/0) → 1 (1/0) | 1 → 1 | 91 → 91 |
| 98806 | 89 → 89 | won | 4 | 199 → 199 | 15 (7/8) → 6 (6/0) | 5 → 1 | 31 → 32 |
| 98807 | 90 → 90 | won | 4 | 199 → 199 | 0 → 0 | 0 → 0 | 5 → 5 |
| 98808 | 91 → 90 | won | 5 | 460 → 490 | 43 (3/40) → 12 (12/0) | 22 → 4 | 45 → 74 |

Per-seed swings cut both ways (98804 competent: lost at 86d →
145d, strikes 91 → 118; 98803 competent: 124d → 90d, wave-4
kills 4 → 0, standing 199 → 125). On 8 seeds that is noise around
flat totals, not a lever effect in either direction — the same
shape the (A) arm showed, and the totals are the verdict: the
primary is 0 on every seed, and the guardrails hold in aggregate.
Note 98808 capable: the fallback's 40 refreshes become 6 fresh
presses and the scholar lands 74 strikes instead of 45 — the
fight that used to be 22 presses of nothing is now fought.

Instrumentation caveat (honest): the before-leg ran AFTER the
fix commit existed, with src/js/abilityActions.js temporarily
restored to the prereg commit's bytes (sha256
fabd5737483fe0ad6fe8fc2cc2a1a87f04c61b9430f9d90285af34870373dc6a,
verified identical to 7b03f1aaa:src/js/abilityActions.js) and
restored to the fix commit afterwards (git diff HEAD empty,
key count 2). The per-seed JSONs' `anchorCommit` field therefore
names the fix commit on BOTH legs — the field records HEAD, not
the file content. The before-leg numbers reproduce
sim-rageloop-b's before leg exactly on every seed (competent
73/62, capable 75/55, same days/standing per seed), which is the
independent check that the before leg really ran base code.

## Balanced panels (§15)

Both panels built cleanly (16 cases each, 0 cached, sources stable,
observer neutrality all-match): panel-rageprecheck-b-before and
panel-rageprecheck-b-after, same seeds/policies/days. The panel
COMPARE is **valid this time** — decision `review_required` (not
`invalid`, unlike the policy arm: a game-code change does not trip
the policy/harness-changed rule). No material signal on any judged
metric: table win/entry/sitting 0 → 0 competent, 1 → 1 capable;
national 0 → 0 competent, 0.625 → 0.625 capable. The
review_required comes from small `regression_watch` flags on
death-rate metrics (competent player deaths 9.5 → 10.5/run,
interval -1.375 to 3.5; village deaths +0.625/run, interval spans
0; community loss 0.75 → 0.875, the 98803 swing) — all within
noise, all consistent with the driver's own counts (scholar deaths
competent 76 → 84 = +1/run; villager deaths competent 413 → 410,
capable 510 → 511). Compare: evidence/2026-11-14/panel-rageprecheck-b-compare.md/.json
(exit code 2 is the compare script's convention for any decision
other than no_material_signal).

## Wall numbers (scale wall, every run)

- National/table/wins: capable reaches national/global on 5/8 seeds
  both legs and wins (won=true, endReason over-other, ~day 90) on
  8/8 both legs; competent reaches national on 0/8 and wins on 0/8
  both legs. No village reaches the table as a distinct step in
  either leg — the wins are the capable fast path.
- Wave 4–5 reach: competent maxWave 5 on 98805/98806/98807 both
  legs; capable wave 5 on 98802/98808 both legs. Wave-4 kills:
  competent 19 → 16, capable 13 → 14. Wave-5 kills: competent
  2 → 3, capable 6 → 8.
- Median survival: competent 121 → 138d; capable 90 → 90d.
- Death causes (band totals, both policies): villager combat
  dominates; starvation 1 → 0; scholar deaths "the wild" are the
  modal player cause.

## Village assessment

What the villages looked like: the same eight villages, twice, and
this time the fights read differently. The competent villages still
grind — 150-day survivors on 98807, the rest lost to fighting, not
hunger — but the scholar now strikes instead of re-pressing (856 →
888 landed strikes across the band, 5,940 kcal banked), and the
worst fight went from 24 presses of nothing to 4 real ones. The
capable villages still all end the same way, around day 90, won —
the scholar takes the fast road and the village follows. Nobody
starves either way; nobody reaches the table either way except
through capable's fast win. The lever changes the texture of the
fights, not the shape of the runs — which is what a waste-removal
lever should do.

## Sense-testing (SENSE-TESTING LAW)

Read the rage lines, not just the counts. After the fix the line
"The red comes down. Your next 3 strikes deal +100% damage.
(Unleash Rage — hold on.)" fires once per press — 3 lines for 3
presses on 98803 competent, one per fight, each in a different
fight; 36 lines sampled across the after leg against 49 presses
(before: 31 lines against 148 presses, the dedup suppressing the
storm). No more 17× repeat storm in one fight; the narration reads
like a person calling on a power once, then fighting. Deaths read
coherently: "villager combat" dominates, scholar deaths are "the
wild" — successive scholars dying out in the field, which is what
village-lost at day 90–147 looks like from inside.

## Metric review (§14)

1. The prereg's "refused presses prove the choke point fired"
   framing was wrong in mechanism, and the proof test caught it
   before the pilot judged anything on it: in the sims the choke
   point fires at the AVAILABILITY gate (competent's tryPress
   checks `_actionAvailable` first), so useAbility-level refusals
   read 0 on both legs while the primary still reads 117 → 0.
   Proposed revision for future engine-precheck arms: judge the
   primary on SUCCESSFUL presses (as this prereg did) and treat
   refused counts as a diagnostic, not a GO leg; prove the refusal
   itself in staged legs that bypass the availability check.
   The prereg's primary was already successful-press-only, so no
   re-scoring was needed — only the test leg changed, and the
   change is documented in the test.
2. The §15 panel compare IS valid for a game-code lever (decision
   review_required, not invalid) — the 0130Z revision stands
   inverted: for game-code arms the compare path works and its
   verdict is reported; for policy arms it stays invalid by
   contract.
3. The per-presser split (0130Z metric review) worked as intended:
   it locates the kill — capable-path 0/0 both legs, fallback
   55 → 0 — and it is what lets this verdict say the residual is
   dead rather than merely summed away.

## Evidence files

- Prereg: evidence/2026-11-14/sim-rageprecheck-b-prereg.md
- Driver: scripts/rageprecheck-driver-20261114.js
- Proof: scripts/test-rageprecheck-b.js (12/12 static, 25/25 game)
- Per-seed JSON: evidence/2026-11-14/perseed-rageprecheck-b-before/
  (16 files) and evidence/2026-11-14/perseed-rageprecheck-b-after/
  (16 files); smoke corpus perseed-rageprecheck-b-smoke/ (2 files,
  seed 98801 after-fix, superseded by the pilot after leg — delete
  on closeout, it is not a pilot leg)
- Panels: evidence/2026-11-14/panel-rageprecheck-b-before/ and
  panel-rageprecheck-b-after/ (panel.json.gz, 16 cases each)
- Compare: evidence/2026-11-14/panel-rageprecheck-b-compare.md/.json
  (decision: review_required — no material signal on judged metrics)

## Commits (branch sim-rageprecheck-b)

- 7b03f1aaa prereg (+ driver copy, adapted)
- 3cbf0ea3e proof test RED (4 precheck legs failed on prereg commit)
- 82cfe281e [needs-eyes] engine precheck (B) — proof 12/12 + 25/25
- (this commit — evidence file + per-seed corpora + balanced panels)

## Findings for the backlog (coordinator owns sim-findings.md)

1. (B) closes the (A) residual: the engine precheck is the single
   choke point that two independent policy maps could not be. The
   (A) guard remains unlanded and is now moot for this waste — do
   not resurrect it for rage.
2. Capable wins 8/8 by ~day 90 (endReason over-other) while
   competent wins 0/8 on identical seeds — the fast capable win
   path vs the competent grind. Out of this arm's scope; worth a
   look on its own (carried from sim-rageloop-b).
3. Balanced-panel compare is valid for game-code levers and invalid
   by contract for policy levers — methodology note for future arms
   (see metric review).
