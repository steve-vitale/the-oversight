# sim-freestrike-b — order the free-action Rage strike ahead of the turn verbs

Arm of Loop B run `fleshout-loop-b-20261119T0830Z` (axis: winnability chain),
finding #2584's named next step from sim-ragepreempt-b's DIAG-GO. Branch
`sim-freestrike-b`, worktree `~/workspace/worktrees/sim-freestrike-b`,
base master `eccc08af2` (journey-endgame r246). Prereg frozen before any
judging sim: `evidence/2026-11-19/sim-freestrike-b-prereg.md`.

## Verdict: NO-GO phenomenon-absent

The ordering works exactly as designed — on the after leg the free strike
lands first on 19/19 carrier fires, verbs still fire afterwards, and the
benign peaceful ending is preserved in the wild — but the thing it was
built to fix does not happen on this substrate: the before leg shows
**0 harmful pre-emptions in 15 observable carrier fires**. Per the frozen
prereg, a 0 before-leg harmful rate is NO-GO phenomenon-absent, never GO.
No confirm run (pilot NO-GO stops here, per prereg). The game-code change
is **not** to be merged; the branch holds the evidence and instrument
record only.

## The lever, in plain words

When a fighter's Rage goes off for free in a field fight, the fighter used
to spend the turn talking, healing, or aiming instead of hitting — the
free double-damage strike was lost. This arm moves the strike first: the
fighter hits (double damage), and only then does the game ask what else
they want to do that round. The talking, healing and aiming are all still
there — they just happen after the hit instead of instead of it. On a
round with nothing else to do, the fighter hits twice (the free strike
plus their normal strike, both doubled).

## What was built

- **Carrier cherry-pick (game code only, from HELD branch
  `sim-rage-setup-a` tip `489bf0e88`)**: `9f8f108a4` (FIELDCAPDMG carrier)
  + `6198f7ea3` (RAGEFREE free action). The branch's pilot evidence was
  not taken. The LAUNCHPARTY sense substrate (`d0c2ed7e4`) was deliberately
  NOT cherry-picked — it is HELD do-not-land and this arm was authorized
  only the carrier change. Consequence, recorded in the prereg: the before
  leg re-measures the RAGEFREE carrier on master substrate rather than
  reproducing the ragepreempt corpora exactly; the 3/10 rate is context,
  not the comparison.
- **FREESTRIKE build** (`src/js/fieldFights.js`, `src/js/godpath.js`,
  env-gated `FREESTRIKE=1`, default OFF, never on in the browser):
  `godpath.js` marks the Rage round (`out.rageFiredRound`); the villager
  strike block is a closure called first on a Rage round when the free
  action fired, then the verb chain is still consulted; if the free strike
  drops the lead, no verb runs on a fallen monster.
- **Proof test** `scripts/test-freestrike-b.js`: **45/45 green** (carrier
  §1, ordering §2a–2g including the peacemaker-success regression and the
  kill skip, instrument §3).
- **Instrument**: `scripts/freestrike-driver-b.js` (adapted from the
  fieldcarrier driver; refuses `LAUNCHPARTY=1` and a mislabelled leg),
  `scripts/analyze-freestrike-b.js` (order-aware classifier;
  `--selftest` **23/23**), `scripts/build-freestrike-panels-b.js` (§15).
  Driver smoke-tested on both legs (3 days, seed 106001, 0 errors, flags
  correct); smoke corpora deleted afterwards.

## Pilot numbers (8 seeds, band 106001–106008, 150d, competent)

Legs differ ONLY by FREESTRIKE. Both legs:
`VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 WILDAVOID=1` +
`FIELDCAPDMG=1` + `RAGEFREE=1`. Before leg FREESTRIKE unset; after leg
`FREESTRIKE=1`. Runtime: ctl ~7 min, arm ~9 min, 0 instrument errors.
Analysis: `evidence/2026-11-19/freestrike-b-analysis.json`.

| | Before (ctl) | After (arm) |
|---|---|---|
| Carrier fires | 15 | 19 |
| Observable (Rage round in log) | 15 | 19 |
| Harmful pre-emptions | **0** | **0** |
| Pre-empted (any verb first) | 0 | 0 |
| Not pre-empted (strike first) | 15 | 19 |
| Strike-zero / consumed / unclassified / anomalies | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| Verbs firing AFTER the free strike | — (none) | field_medicine ×3, peacemaker_failed ×1, peacemaker_success ×1 |
| Double strikes (free + turn, no-verb rounds) | 0 | 14/19 |
| Carrier-fight kill share | 0/15 | 0/19 |
| Mean damage per carrier fight (mDealt) | 230.5 | 257.5 |
| Mean damage / round | 45.1 | 53.1 |

Frozen bars: pool floor met both legs (15, 19 ≥ 8); classification
complete both legs; **phenomenon guard FAILED — before-leg harmful rate
0, must be > 0**; primary (after harmful == 0) met; costs all pass
(community loss rate 0.5 vs 0.5; starvation deaths 10 vs 8, bar ctl+2 =
10, passes exactly at the boundary; median survival 146 vs 142.5,
ratio 1.02). Verdict ladder: NO-GO phenomenon-absent.

Secondary vs the rage-setup-a baseline (frozen corpora, all carrier
rows): baseline ctl 21 rows, mean mDealt 249.2, kills 2; baseline arm
11 rows, mean mDealt 161.1, kills 0. This pilot: 230.5 / 257.5, kills 0
both legs. Damage sits in the same band; the ordering does not turn
carrier fights into kills — a wave-4 monster soaks ~250 damage a fight
and walks away. Kill share 0 on both legs does not overturn a GO on the
primary (per prereg), but here the verdict is already NO-GO on the guard.

## Reachability verdict (wall numbers)

| | Before | After |
|---|---|---|
| National scale | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 2/8 (106002, 106003) | 4/8 (106002, 106003, 106006, 106007) |
| Median survival (days) | 142.5 | 146 |
| Villages lost | 4/8 | 4/8 |

No village reaches national, the table, or a win on either leg. Wave 5
opens on more after-leg seeds (4 vs 2) but nobody converts it into
standing: several villages sit at the standing-199 stall (before:
106001, 106005; after: 106001, 106004, 106005, 106008). The ordering
changes nothing about reachability — which is expected: it fires inside
fights the village already survives, and carrier fights still don't
kill. The winnability wall stays where it was: wave-4 kills converting
into veterans and standing.

## Balanced panel (§15)

`evidence/2026-11-19/freestrike-b-panel-{before,after}.json.gz`,
compare: `evidence/2026-11-19/freestrike-b-panel.md`.
Decision: **review_required** (8 paired cases, screen only). No material
signal on wins (0 → 0), national (0 → 0), community loss (0.5 → 0.5),
survival 30/60 (1 → 1). One regression_watch: village deaths per run
75.125 → 80.125 (+5, 95% exploratory interval −6.375 to 18.125, includes
0). The panel is the instrument, not the judge; the frozen cost bars
above are the judge and they pass. The +5 deaths sit inside the same
noise as the starvation count (10 vs 8, at the bar's edge) — worth
watching on any future re-measurement, not a verdict by itself.

Telemetry deviation check: `telemetry-check.js` refuses recorder corpora
by design ("all 8 --current rows carry top-level anchorCommit, so they
are sweep recorder rows, not runs") — same refusal the ragepreempt arm
recorded. No telemetry verdict is available from this instrument, and
none is claimed.

## Sense-testing: what the fights actually looked like

Read in full from the corpora (log cap 20 lines; these are complete).

- **The benign case, preserved (arm, seed 106006, Grace vs The Editor,
  day 115):** Grace strikes for 42 (x2.5) first, *then* walks in
  open-handed and the Editor stands down — the fight ends peacefully in
  one round (mFlee). The strike lands, the talk still saves the fighter.
  This is the regression the prereg demanded, happening in the wild.
- **The harmful shape, reordered (arm, seed 106006, Dale vs The Rerun,
  day 115):** Dale strikes for 84 first, then the Walk In fails and he
  is exposed — but the doubled strike already landed, and he keeps
  striking 84 a round for 8 rounds (819 damage dealt). The failed parley
  still hurts; it no longer eats the strike.
- **Strike plus healing (arm, seed 106006, Galym vs Reunion, day 107):**
  strike 22, then field medicine +20 HP, then another doubled strike
  next round. The fighter hits *and* heals — the verb was not lost, it
  moved after the hit.
- **Died fighting (ctl, seed 106005, Devon vs The Algorithm, day 62):**
  Rage, strike 42, then the Algorithm kills Devon in round 2. The
  carrier fight does not save the fighter.
- **Verbs fire — just not on the Rage round (ctl, seed 106001, Kavira vs
  The Algorithm, day 115, 13 rounds, 762 damage):** Rage round 1 is
  strike-only; at round 5, hurt down to 57 HP, Kavira binds the wound.
  The fighter holds field medicine and uses it — on a later round, when
  she is actually hurt. The Rage round itself is round 1, when she is
  fresh, and the chain picks the strike.

Against the diag's shapes (Heinrich d53, Kavira d132, Xavier d98/d114):
none of them reproduce. No before-leg fight shows a verb on the Rage
round at all — not even the peacemaker-failed exposure that killed
Heinrich's run. The paired fights are the same fights with the same
first strikes on both legs (Devon d128 strike 52, Sergio d95 strike 50,
Devon d62 strike 42, Ruby d50 strike 26 — identical before/after), and
on the before leg the verb chain simply never picks a verb on the Rage
round.

## Village assessment, in plain words

The change does what it says: in a Rage round, the fighter hits first
and talks or heals second. You can see it working in the fight logs —
doubled strikes landing before the Walk In, the peaceful ending still
happening after the hit. But on the villages as they actually play
today, the problem it fixes almost never happens: when Rage goes off,
the fighter is usually fresh at the start of the fight, and the things
that could steal the turn (healing a wound they don't have yet, talking
to a monster that isn't listening yet) just don't come up. So the before
villages and the after villages play out nearly identically — same
survival, same standing, same empty table. The villages still die
fighting wave-4 monsters they can't kill, and no ordering of one strike
changes that. The work is sound; the target isn't there on this ground.

## Metric review

The phenomenon guard did its job: it stopped a GO on a change whose
benefit cannot be measured here. The 3/10 harmful rate from ragepreempt
was measured on the LAUNCHPARTY sense substrate, where the carrier
fires on plan-holders with parties — a different population of fights
from the master substrate, where the carrier fires on whoever the field
fight picks up (visitors, applicants, wild joiners) and the Rage round
is usually a fresh round 1. The prereg anticipated exactly this
("the before leg re-measures the RAGEFREE carrier on master substrate
rather than reproducing the ragepreempt corpora exactly").

Two things the metric got right and one to carry forward:

- The order-aware classifier was the right instrument: it cleanly
  separates strike-first from verb-first and caught the 5
  strike-then-verb rows on the after leg, which a strike-count-only
  metric would have misread.
- The pool floor (≥ 8 observable) held on both legs (15, 19), so this
  is a real absent-phenomenon verdict, not a thin-pool shrug. The
  probability of seeing 0/15 if the true rate were the diag's 3/10 is
  ~0.5% — the substrate genuinely changes the rate.
- **Proposed revision for the NEXT run (not this one):** if the
  LAUNCHPARTY substrate ever lands, re-measure the ordering there —
  that is the population where pre-emption lived, and the ordering code
  is proven working and harmless here (costs pass, verbs preserved).
  Do NOT re-run on master substrate expecting a different answer, and
  do NOT re-score this pilot against a friendlier metric (e.g. counting
  the 5 strike-then-verb rows as pre-emptions — they are not: the
  strike landed first).

## Blanks filled / documented

- Carrier verified working on current master before building on it
  (proof test §1, 45/45).
- No canon doc covers Rage / turn-verb ordering; the mechanism is cited
  from code (`godpath.js` fieldAct, `fieldFights.js` villager phase),
  not invented canon. Card text ("Your next three strikes deal double
  damage") promises doubled strikes, not a lost turn.
- `check.js --quick`: **337 passed, 7 failed in 974s.** All 7 are
  explained, none attributable to this arm: 3 are pre-existing stale
  retained proofs at base `eccc08af2` (measurement-proof-update,
  measurement-workflow, phone-frame-proof — the retained balance panel
  differs from base in the same 24 files as from this worktree, and the
  phone receipts differ in the same 53; this arm adds zero new
  mismatches), and 4 are load timeouts under the 4-parallel check run
  (measurement-cache-flags: both SIMOPT configurations complete valid
  panels standalone in ~10–12s; the three deed/occupation tests pass
  standalone in 74s / 174s / 276s, all past the 120s per-test cap).
  Proof refresh is ship-loop maintenance, same as the rage-setup-a arm
  left it; no proof files were touched here.

## Out-of-scope gap (note for the coordinator to file; sim-findings.md not edited)

- Finding: the harmful-pre-emption phenomenon (3/10, ragepreempt-b) is
  substrate-dependent — it lives on the LAUNCHPARTY sense substrate and
  does not reproduce on master substrate (0/15). The ordering fix is
  proven working and harmless, but has no measured benefit here. If the
  sense substrate lands, the ordering deserves a re-measurement on that
  population before it is reconsidered; until then it stays on the
  branch, not in the game.
- The 199-standing stall and the 0-kill carrier fights (mean ~250
  damage, 0 kills in 34 pilot carrier fights) remain the binding wall
  for the winnability chain; neither is moved by this arm.

## Landing note (commit blocked — coordinator approval needed)

The branch commit is complete and verified but NOT yet committed: the
worktree's own `scripts/safe-commit.sh` REFUSED it under the
mass-deletion guard (92 deleted lines in `src/` > the 50-line trip).
The deletions are the intentional build, not a revert: `fieldFights.js`
147 insertions / 91 deletions (the 87-line strike block extracted
verbatim into the `fieldVillagerStrike` closure — a move, paired with
its own insertions), `godpath.js` 63 insertions / 1 deletion; no other
`src/` file is touched, and the overall diff is 210 insertions vs 92
deletions. The guard counts deletions only, so any move of >50 lines
trips it by design. Per the arm's instructions the `--force-delete`
override was NOT used without coordinator approval. The command the
coordinator can run (same file list as the refused attempt):

`bash scripts/safe-commit.sh --force-delete "sim-freestrike-b: order free Rage strike ahead of turn verbs — NO-GO phenomenon-absent (pilot 8 seeds: before harmful 0/15, after 0/19; ordering verified working, verbs preserved; game code held on branch, NOT for merge)" -- <the 29 files listed in Files below>`

Note the worktree's `safe-commit.sh` lost its exec bit; invoke it via
`bash` (verified: `bash scripts/safe-commit.sh` runs; direct execution
fails "Permission denied").

## Files

- Prereg: `evidence/2026-11-19/sim-freestrike-b-prereg.md`
- Evidence (this file): `evidence/2026-11-19/sim-freestrike-b.md`
- Analysis: `evidence/2026-11-19/freestrike-b-analysis.json`
- Corpora: `evidence/2026-11-19/perseed-freestrike-b-ctl/` (8 files),
  `evidence/2026-11-19/perseed-freestrike-b-arm/` (8 files)
- Panels: `evidence/2026-11-19/freestrike-b-panel-{before,after}.json.gz`,
  `evidence/2026-11-19/freestrike-b-panel.json`,
  `evidence/2026-11-19/freestrike-b-panel.md`
- Code: `src/js/fieldFights.js`, `src/js/godpath.js` (carrier + ordering,
  branch only — NOT for merge)
- Instrument: `scripts/freestrike-driver-b.js`,
  `scripts/analyze-freestrike-b.js`, `scripts/build-freestrike-panels-b.js`,
  `scripts/test-freestrike-b.js`
