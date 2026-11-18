# sim-partytrios-b — BUILD evidence (finding #2532: the `partyTrios` counter is blind to the brain path)

**Arm:** sim-partytrios-b · **Loop B run:** fleshout-loop-b-20261118T1330Z
**Type:** BUILD — bump `winPlanStats.partyTrios` on the live-brain pick path.
**Prereg:** `evidence/2026-11-18/sim-partytrios-b-prereg.md`
(frozen 2026-11-18 ~14:08 UTC, BEFORE the pilot sweep; one recorded
deviation from the task brief's shorthand — substrate holds
`FLEEREPAIR2=1` from the band's original run so the ground truth
reproduces — and one correction — the `partyQuads` fix the brief
cites as landed never merged to master; see below).
**Branch tip:** `sim-partytrios-b` (fix + proof + instruments at
`2ba21945a`; this evidence + corpora below that tip).
**Builds on:** `evidence/2026-11-18/sim-triodrought-b.md` (finding
#2532: 22 trios launched, counter reads 0) and its frozen corpora;
`evidence/2026-11-18/sim-winplandepart-b.md` (depart-path trio
counting internally consistent); the HELD
sim-partysize-recorder-b branch, commit `035034c9f` (the `partyQuads`
one-liner this fix mirrors).

## Verdict: GO — the counter now sees every trio it used to miss

| Check | Result |
| --- | --- |
| Primary: counter coverage (arm partyTrios ≥ 80% of observed trios AND ctl partyTrios == 0) | **PASS** — arm 19 / 19 = 1.00, ctl 0 |
| Pool floor (≥6 wave-4+ launches/leg AND ≥1 arm trio) | **MET** — launches 24 / 24, arm trios 19 |
| Per-seed coverage (arm partyTrios == observed trios, every seed) | **EXACT** — 3/3, 0/0, 1/1, 3/3, 0/0, 5/5, 7/7, 0/0 |
| Cost bar: starvation (arm ≤ ctl+2) | **PASS** — totals arm 1 vs ctl 1; villager arm 0 vs ctl 0 |
| Cost bar: median survival (arm ≥ 0.8× ctl) | **PASS** — arm 150d vs ctl 150d |
| Proof green | **PASS** — `scripts/test-partytrios-b.js` 21/21 on the fix; 7 fail on pre-fix code (negative control) |
| Analyzer selftest green | **PASS** — `scripts/analyze-partytrios-b.js --selftest` 10/10 |
| Instrument | **CLEAN** — 0 instrument errors on all 16 per-seed files |
| Balanced panel | **review_required** (screen-only) — every observed metric delta exactly 0, `no_material_signal`; no regression row to investigate |
| Leg integrity | ctl `brainSha 499249a3e754` ×8, `bumpPresent: false` ×8; arm `brainSha f4417f25f9be` ×8, `bumpPresent: true` ×8; `carryPresent: true` ×8 both legs; `anchorCommit 2ba21945ae75` both legs; policy sha `df9b7dff4de4` both legs |
| Trajectory reproduction | **EXACT** — per-seed files differ ONLY in `leg`/`mode` labels + the counter + brainSha/bumpPresent; every other field byte-identical across legs |

## The fix (7 lines, decided from the code)

`vbrainExecuteDepart` (`src/js/villager-brain.js`), inside the
`if (launched.length > 1)` block — the exact spot where a trio is
known to have launched (holder + 2 verified companions) — now bumps
the counter through the canonical accessor, mirroring the
`partyQuads` one-liner from the HELD recorder branch verbatim in
shape:

```js
try { var _pt = (typeof this.winPlanStats === 'function') ? this.winPlanStats() : null; if (_pt) _pt.partyTrios = (_pt.partyTrios || 0) + 1; } catch (e) {}
```

NOT touched: the depart-path bump (already correct, owned by
winplandepart-b); `partyQuads` (absent on master — see Correction);
any candidate, pick, gate, env flag, or narration. The bump is
counter-only: no RNG, no game-state write beyond the counter.

## Correction to the task brief (verified on this base)

The brief states the `partyQuads` gap "was FIXED by
sim-partysize-recorder-b (commit 035034c9f)". **That commit never
landed on master.** It sits on the HELD sim-partysize-recorder-b
branch (parent `02117e2e8`, also not on master; the re-run evidence
itself says "this branch stays HELD and unmerged on a B2 NO-GO"). On
master `8709e9f87`, `partyQuads` exists nowhere in `src/js` — no
default in `win-plan.js`, no bump anywhere. The one-liner PATTERN is
real and is what this arm mirrors; the live `partyQuads` fix is not.
`partyQuads` itself stays out of scope here. A future arm that wants
the quad counter must land it (or port the HELD branch's line) —
until then, quad counts must come from `v4departs` partySize, never
from `partyQuads`.

## Sibling overlap — coordinator attention

The #2518 findings entry carries a counter note from Loop A arm
sim-launchparty-sense-a (run 1015Z): that arm independently built
the SAME `vbrainExecuteDepart` partyTrios bump on its branch,
verified it in live sims (arm counter 3 = departs-derived 3; ctl
12 = 12; proof test-partytrios-brain-a.js 5/5), and HELD it with its
sense fix. This arm's fix is the same one-liner on master lineage,
now pilot-verified GO. The two branches will conflict on the same
lines if both try to land — the coordinator picks one landing
vehicle; this branch (master lineage, pilot GO, proof 21/21) is the
cleaner one, and the sense arm's HELD branch should rebase or drop
its copy when this lands. Not a duplicate of live work (theirs is
HELD, not merged), but the overlap must not become a double landing.

## Pilot numbers (8 seeds/leg, band 104011–104018, 150d, competent verbatim)

Substrate both legs: `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1`,
`FIGHTALLY2` unset. Legs differ ONLY by code: ctl ran with the bump
reverted in the worktree file, arm with it present (the driver refuses
to run if MODE and the code on disk disagree). `anchorCommit` reads
`2ba21945ae75` on BOTH legs because HEAD contains the fix commit —
the honest leg discriminator is `brainSha` / `bumpPresent` on each
corpus file (table above).

| | ctl | arm |
| --- | --- | --- |
| Wave-4+ launches | 24 | 24 |
| Trio launches (partySize ≥ 3) | 19 | 19 |
| Trio rate | 0.792 | 0.792 |
| Launch sizes | 1×2, 2×3, 3×19 | 1×2, 2×3, 3×19 |
| Launch sources | brain 24 | brain 24 |
| `partyTrios` (summed) | 0 | **19** |
| Candidate carried c2 | 20 | 20 |
| Depart carried c2 (carry rate) | 20 (1.00) | 20 (1.00) |
| Unjoined launches | 0 | 0 |
| Starvation deaths (total / villager) | 1 / 0 | 1 / 0 |
| Median survival (result days) | 150d | 150d |
| Median survival (gameDays) | 150.5d | 150.5d |
| Villages survived | 5/8 | 5/8 |
| Max wave reached | 5 (2 seeds) | 5 (2 seeds) |
| Wins | 0 | 0 |

Per-seed (launches / observed trios / partyTrios) — ctl: 104011
3/3/0, 104012 0/0/0, 104013 3/1/0, 104014 4/3/0, 104015 0/0/0,
104016 5/5/0, 104017 9/7/0, 104018 0/0/0; arm: 104011 3/3/3, 104012
0/0/0, 104013 3/1/1, 104014 4/3/3, 104015 0/0/0, 104016 5/5/5,
104017 9/7/7, 104018 0/0/0. The counter matches the observed trios
on EVERY seed, not just in aggregate.

## Autopsy, launch by launch (why the numbers are what they are)

**The coverage is exact, per seed.** Every trio the analyzer
observes in `v4departs` is counted once by the arm counter, on the
seed where it launched. No seed over-counts (no double bump — the
proof test's once-per-launch check bounds that) and none
under-counts (no blocked-trio shape escapes the bump — a blocked
second companion falls back to a pair, which is not a trio and
correctly does not bump).

**The trajectories reproduce exactly.** A recursive diff of each
ctl/arm per-seed pair, ignoring only `partyTrios`, `brainSha`,
`bumpPresent`, and the `leg`/`mode` labels, finds ZERO differences
on all 8 seeds — same days, same standing, same deaths, same
depart/gate/encounter rows. The fix writes one counter and nothing
else, exactly as the prereg promised. The single starvation death
(104014 d127, `visjoin_108`, player-flagged) is the same death on
both legs — not a lever effect, and the villager starvation count
is 0 on both legs.

**The band's ground truth moved since triodrought.** This tip
observes 19 trios (rate 0.792) where triodrought measured 22 (rate
0.88) on the same seeds. The base has moved on since then
(fleerepair3, wildavoid, winplandepart, and other arms landed), so
trajectories differ from the triodrought band's numbers. Reported,
not judged — the primary is the counter against the trios observed
ON THESE LEGS, and those match exactly. The depart path fired 0
times again (all 24 launches via the brain path), so the
depart-path bump contributed 0 to either leg's counter; the 19
comes entirely from the new brain-mirror bump.

## Balanced panel

`build-partytrios-b-panels.js` + `balance-panel.js compare`:
decision `review_required` — the standard screen-only outcome for an
8-seed panel (confirmationSized false), not a flagged regression.
Every observed metric is `no_material_signal` with paired delta
exactly 0: table win rate 0 → 0, national 0 → 0, first-bearer
survival (d30/d60) 1 → 1, village deaths 102.25 → 102.25,
community loss 0.375 → 0.375. No row needs investigation because no
row moved — the panel is the instrument confirming the counter-only
claim, not the judge.

## Reachability verdict

Wave 4 reached 8/8 on both legs; wave 5 unlocked 2/8 on both legs
(104011, 104012). National scale 0/8, table 0/8, wins 0/8 on both
legs — the scale wall is untouched by this lever, as expected (it
counts launches, it does not make them). The standing-199 stall is
visible on both legs (104013, 104014, 104015, 104017, 104018 sit at
exactly 199; 104016 at 195) — the deed-gate deferral the tracker
already names, not a lever effect. Standing ≥200: 2/8 both legs
(104011 at 570, 104012 at 405).

## Village assessment (plain words)

Eight villages, same seeds, same story on both legs — to the number,
because the fix changes nothing but the counting. Two villages
(104011, 104012) climbed to standing 570 and 405 and touched wave 5;
three were lost (104013 at day 111, 104014 at 130, 104016 at 137);
the rest sat at standing 199 the whole run, strong enough to look
ready, never released. Seed 104017 launched nine wave-4 parties,
seven of them trios — the busiest village on the band — and still
sat at 199. Nobody starved extra for it, nobody died sooner for it,
and no village won either way. The only thing that changed is the
ledger: where the counter used to say zero while trios walked out
the gate, it now says nineteen, and it says it on the right seeds.

## Sense-testing

426 `vetSays` rows read across the arm corpus. The lines read like
people, not counters: gate defenses name the hurt ("Peyton,
Maricela, Earl, Bradley and Vasyl met them at the door — 4 put down,
1 driven off. Maricela, Earl, Bradley, Vasyl are hurt."), the System
calls out veteran kills by name on camera ("Vasyl just put down The
Focus Group... on CAMERA. That's a veteran kill, folks. REMEMBER the
name."), and the pack-leader warning arrives before the fight, not
after it. Two observations, both documented not chased:

- **Doubled article, once in 426 rows** (finding #2540, appended
  to the backlog): "The The Pack-leader Sweeps Week freezes" — the
  monster's name itself starts with "The" and the narration
  prepends another. Cosmetic, pre-existing, one-off.
- **Trio launches are not voiced.** No `vetSays` row falls on a
  trio launch day for 104017's seven trios; the launch is recorded
  in `v4departs` only. A party walking out as three is not a moment
  anyone in the village remarks on. Recorded, not judged — the
  counter was the blank this arm fills; whether launches deserve a
  voice line is a design question for a later arm.

## Blanks filled or documented

- **Filled:** the `partyTrios` brain-path gap (finding #2532) — the
  counter now reads 19/19 on live sims, 0 on the control leg, exact
  per seed. Trio counts may now come from `partyTrios` on bands
  where launches go through the brain path (all of them, on this
  tip); `v4departs` remains the cross-check.
- **Filled (proof):** `scripts/test-partytrios-b.js` (21 checks: brain
  trio bumps to 1, second launch to 2, blocked / c2-null / off-mode
  stay 0; negative control — 7 fail on pre-fix code), the adapted
  driver + analyzer + panel builder, and the prereg (frozen before
  the sweep).
- **Documented, not chased:** the `partyQuads` absence on master
  (see Correction — the HELD recorder branch's line was never
  landed; a future arm must land or port it); the sibling
  launchparty-sense-a HELD copy of this same bump (coordinator
  picks one landing vehicle); the doubled-article narration quirk
  (finding #2540); trio launches carry no voice line.
- **Run notes:** `check.js --quick` on the fix tip: 335 passed, 6
  failed in 846s — all 6 fail identically on the pristine base
  (verified by direct re-run of the four fast ones with the fix
  reverted: measurement-proof staleness ×2, phone-frame-proof
  staleness, ladder-bundle ambient-raid control; the other two are
  120s deed-attainment timeouts, identical across both full runs).
  The retained balance/neutrality proofs are stale relative to the
  base's sources — pre-existing, not caused by this 7-line change.
  First `safe-commit.sh` struck the known index clobber (committed
  files showing as staged-deleted in the worktree index); repaired
  with the documented `ls-tree -r HEAD | update-index --add
  --index-info` pipe — status empty, diff HEAD empty, commit
  verified correct.

## Metric review

- The primary behaved as designed: judged (pool floor met, 19 arm
  trios), passed at the ceiling (1.00 ≥ 0.80) with the control at
  exactly 0. The 80% bar had room for the residual shapes the proof
  test bounds (blocked / c2-null / off-mode) — none of them fired
  as trios on this band, so the ratio landed at 1.00; the bar was
  not too loose, it was correctly sized for a total bug.
- The per-seed table is the stronger check than the aggregate: 19/19
  in total could hide an over-count on one seed cancelling an
  under-count on another; the per-seed exact match rules that out.
- The trajectory-reproduction diff is the right guard for a
  counter-only fix, and it held exactly (0 differences beyond the
  counter and labels). Future counter arms should keep this diff
  as a standing check.
- The trio-rate drift (0.88 on triodrought's tip → 0.792 here) is a
  base-drift observation, not a metric failure: the primary judges
  the counter against observed trios on the same legs, and the
  prereg said so. No re-score was needed or done.
- The panel's `review_required` is the screen-size label, not a
  signal: all observed deltas are exactly 0. Nothing to investigate
  was left uninvestigated.

## Wall numbers (every run)

National 0/8 · table 0/8 · wins 0/8 · wave-4 unlock 8/8 · wave-5
unlock 2/8 · median survival 150d (result days) / 150.5d (gameDays),
both legs · survived 5/8 both legs · standing ≥200: 2/8 both legs.
No village reached national rank.

## Convergence state

Axis (winnability chain): **not converged**. This arm: instrument
REPAIRED (`partyTrios` counts brain-path trios exactly, 19/19).
The chain beyond the launch (wave-4 kills → veterans → wave 5 →
seat) is untouched by this arm — wins still 0/8, national still 0/8.
Next: the launchparty-sense confirm (needs this fix + the sense fix
together) and the fight-capability question the sense arm's finding
#2538 already names; the coordinator picks the landing vehicle for
this bump against the sense arm's HELD copy.

## Files

- Prereg: `evidence/2026-11-18/sim-partytrios-b-prereg.md`
- Fix + proof + instruments: commit `2ba21945a`
- Pilot corpora: `evidence/2026-11-18/perseed-partytrios-b-ctl/` (8 seeds), `evidence/2026-11-18/perseed-partytrios-b-arm/` (8 seeds)
- Logs: `evidence/2026-11-18/partytrios-b-ctl.log`, `evidence/2026-11-18/partytrios-b-arm.log`
- Analysis: `evidence/2026-11-18/partytrios-b-analysis.json` (analyzer exit 0, verdict GO)
- Panel: `evidence/2026-11-18/partytrios-b-panel-before.json.gz`, `partytrios-b-panel-after.json.gz`, `partytrios-b-panel.json`, `partytrios-b-panel.md` (decision `review_required`, all observed deltas 0)
- Proof: `scripts/test-partytrios-b.js` (21/21 on the fix tip; 7 fail on pre-fix code), `scripts/analyze-partytrios-b.js --selftest` (10/10)
- Telemetry deviation check: NOT APPLICABLE to this corpus — `telemetry-check.js` refuses recorder-corpus input against a run baseline by design ("compared with sweep-compare tables, never against a run baseline"); wall numbers above are reported directly from the analyzer instead. No LOUD lines were produced by any check that ran.
