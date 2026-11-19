# sim-speargate-a — SPEARGATE gate fix (finding #2590) — GO, pilot

**Arm:** sim-speargate-a · **Loop A run:** fleshout-20261119T0915Z (adoption
closeout by run fleshout-20261119T1115Z) · **Axis:** scale-onramp
· **Prereg:** `evidence/2026-11-19/sim-speargate-a-prereg.md` (frozen
2026-11-19 ~09:50 UTC, before any new sim) · **Branch:** `sim-speargate-a`
· **Base at pilot:** master 7235e2102 · **Band:** fresh seeds 105901–105908,
150d death-aware, competent policy, 8 ctl + 8 arm on identical seeds
· **Verdict: GO (pilot, frozen bars — all 12 pass).**

## Adoption note — read this first

The 0915Z run timed out before closeout. Its worker's final report
(delivered, agent 25eb9b7d) states: pilot complete, verdict GO, closeout
unfinished. **This evidence file was written by the adoption coordinator,
not the worker** — the worker never wrote it. Every number below was
recovered by the coordinator from files on the branch, never taken on the
worker's word:

- `speargate-a-analysis.json` (analyzer verdict GO, 12/12 bars pass),
  `speargate-a-panel-compare.md/.json` (§15 panel),
  `perseed-speargate-a-{ctl,arm}/` (8 + 8 per-seed JSONs, 0 errors).
- Proofs re-run by the coordinator on the branch as it stands:
  `scripts/test-speargate-a.js` **31/31 PASS**, `scripts/test-bowopen-a.js`
  (ported) **36/36 PASS**, analyzer `--selftest` **43/43 PASS**.
- Port byte-identity: the diff of port commit 6a0dd165c against source
  commit 2b29076e7 is identical except commit header lines and the base
  blob index (base moved) — all hunks byte-identical.
- Seed freshness re-checked by the coordinator: `grep -rl "10590[1-8]"`
  over `evidence/*/sim-*-prereg.md` — **0 hits** (agrees with the
  prereg's own wider 0-hit check over evidence, tracker, findings,
  and live claims).
- Corpus completeness: the write flap crashed node mid-leg and lost ctl
  seeds 105906–105907; the worker hardened the driver (commit 6e8a5d33e)
  and re-ran them. All 16 per-seed files are present and valid (8/8 ctl,
  8/8 arm, errors 0).

## The question, in plain words

A spear is a melee weapon with reach, but when a fighter holds no real
ranged weapon the spear slides into the ranged slot — and every
ranged-gated check then treats that fighter as if they held a bow. The
launch-staging step ("already holds a ranged weapon, skip") never runs
for them, and the opening volley can never fire from a spear because a
spear has no ammunition. In the bowopen band, 6 of 27 engaged meetings
opened with a spear and no volley, and 7 more fighters held nothing
ranged at all. Finding #2590: any ranged-gated mechanism must check
`weapon.ammo`, not the slot.

## What changed

- **`src/js/equipment.js`** — new pure-read helper `volleyWeaponOf`:
  the equipped ranged-slot weapon, returned only when its definition
  carries `weapon.ammo`; otherwise null. Fail-closed without
  definitions. On current data every type-`ranged` weapon carries ammo
  and no type-`melee` weapon does, so this coincides with the old
  type-based read today — but the check is ammo, as the finding
  requires.
- **`src/js/game.js` (`villagerStageBow` step 0)** — behind the
  `SPEARGATE=1` flag, the gate read uses `volleyWeaponOf`; pack, stash,
  and armory source scans use the ammo-based test. With the flag off,
  behavior is byte-identical to the old type-based read. Spear-holder
  departures are counted on both legs (`spearSeen`/`spearPassed`
  telemetry) so the pilot can judge the gate without touching fights.
- **`src/js/fieldFights.js`** (finding #2593, found in the same audit)
  — the field-fight "no arrows" line now names the weapon's actual
  ammunition from its data: searcaster → fusion cells, crossbow →
  crossbow bolts, sling → stones; a bow still says arrows.
- **Ported in, HELD-origin** (commit 6a0dd165c): the bowopen launch
  staging mechanism (`villagerStageBow` + `startExpedition` call site +
  proof test) from sim-bowopen-a commit 2b29076e7, because the gate fix
  lives inside it. The bowopen NO-GO on staging stands — the mechanism
  stages 0 bows on empty sources. The port is inert in live play:
  `BOWOPEN=1` is off by default, as is `SPEARGATE=1`.
- **Instruments** (commit 77929ddfb): `scripts/speargate-driver-a.js`,
  `scripts/analyze-speargate-a.js`, `scripts/build-speargate-panels-a.js`.
- **Write-flap hardening** (commit 6e8a5d33e): the driver now retries
  writes for 10 minutes (was 2) and returns a status instead of dumping
  the corpus to stdout — the fallback dump itself threw EPERM on the log
  stream and crashed node mid-leg, losing ctl seeds 105906–105907. Lost
  seeds are now reported loudly with exit 4 for re-run. No sim or
  metric change — write path only. Unit-tested both paths.

Audited and left alone (per the frozen audit): volley block,
`pocketAmmo`, the ARMED bar, and the fold-in — all read the slot, none
of them is a staging gate, and the proof test proves them unmoved for a
spear-holder.

## Verdict — GO on the frozen bars (12/12)

| Bar (frozen) | Ctl | Arm | Requirement | Result |
|---|---|---|---|---|
| Pool floor (spear-holder departures) | 54 | 54 | arm ≥ 10 | PASS |
| Gate pass rate (spearPassed / spearSeen) | 0/54 | 54/54 = 1.000 | 1.0 | PASS |
| Ctl pass zero | 0 | — | 0 | PASS |
| Consistency, alreadyHad | 181 | 127 (= 181 − 54) | \|delta\| ≤ 3 | PASS (0) |
| Consistency, noSource | 131 | 185 (= 131 + 54) | \|delta\| ≤ 3 | PASS (0) |
| Staged (stash + armory + crafted) | 0 | 0 | 0 both | PASS |
| Kill share (pair-inclusive) | 0.125 (1/8) | 0.125 (1/8) | arm ≥ ctl − 0.05 | PASS |
| Mean damage / round | 54.7 | 54.7 | arm ≥ 0.9× ctl | PASS |
| Community loss | 2/8 | 2/8 | arm ≤ ctl + 0.125 | PASS |
| Starvation (totals / villager-only) | 0 / 0 | 0 / 0 | arm ≤ ctl + 2 | PASS |
| Median survival | 150d | 150d | arm ≥ 0.8× ctl | PASS |
| Mechanism check: volley fired | 4/8 meetings | 4/8 meetings | unchanged expected | PASS (not a verdict bar) |

The classification shift is exact, not approximate: every one of the 54
spear-holder departures moved from `alreadyHad` (ctl) to `noSource`
(arm) — 9 of them were departures the old gate had wrongly recorded as
already-holding-ranged (`spearAlreadyHad`: ctl 9, arm 0). No bow was
conjured (staged 0 both legs), and the fight numbers are byte-identical
between legs: the pair-inclusive meeting arrays match seed for seed
(same 1 win / 7 flees, same damage, same rounds). The gate changes
classification only; it does not change any fight.

## Fight numbers (pair-inclusive, the judged population)

8 meetings per leg, identical trajectories: 1 kill (vKill, 11 rounds,
83.7 dmg/round, volley 49) and 7 villager flees. Volley fired on 4/8
meetings (share 0.50, mean volley damage 31.5, ranged-at-entry 0.63) —
unchanged, as expected: the gate creates no bows. Party size 3 on every
meeting; min armorP 4–21, mean armorP 23.8; fighter damage share 0.57.
Monster mix by outcome: strike, influencer (1 win / 2), algorithm,
audit, eulogy, congregation. Gate question (among losses): 7/7 gate
`null`, 0 `avoid`, 0 `seek` — the launch gate is not what loses these
fights.

## #2593 narration — observed in the wild corpus, not just proved

The proof test proves the ammo naming on a live village (31/31). The
pilot corpus logs exercise it too, with the right word for the weapon
held: "no arrows — the string stays drawn, useless." (bow), "no
crossbow bolts — …" (crossbow), "no stones — …" (sling). No searcaster
holder hit the line in this band, so "fusion cells" is proved by the
test only — named here so a later reader does not mistake absence for
a miss.

## Wall numbers (this pilot, 16 configs)

National 0/8 both legs; table wins 0/8 both; wave 4 reached 8/8 both;
wave 5 reached 6/8 both; scale rank regional 8/8 both; median survival
150d both. The §15 panel compare (`speargate-a-panel-compare.md`,
attached) returns decision `review_required` with won 0→0 and national
0→0 across 8 tied pairs — the panel is the instrument, the frozen bars
above are the judge. The scale wall stands: no national, no table, no
wins on this band in either leg, which is expected for a gate-classification
pilot, not a scale arm.

## Sense-testing — read the fight

Seed 105902, day 138: Mekonnen walks into The Audit with a crossbow
(3 bolts), opens at range (3 shots, 62 damage), then fights four rounds
with Luis and Vasyl charging in on his shouts for help ("Mekonnen is
losing — shouts for help! Luis charges in!") before the party flees.
Allies answer a losing fighter; the volley reads as a volley; the
flee reads as a flee. Nothing robotic in the transcript. The one
meeting per leg in the top-level population is the same fight on both
legs — the gate fix does not rewrite what villagers do once the fight
starts.

## Landing decision (coordinator)

**LAND the whole branch** (6 commits + evidence + corpora) with both
flags default-OFF. The gate fix is inseparable from the ported staging
mechanism — the fix commit sits on top of the port commit — and landing
both with the flags off changes nothing in live play: `SPEARGATE` and
`BOWOPEN` are env-gated instruments, and the pilot proves the off-state
is byte-identical to today's code. What lands is a correct gate for the
next staging arm to switch on, the #2593 narration fix (live, ungated —
it only changes a log line to name the right ammunition), and the
instruments.

**No 12–16 seed confirm.** The prereg leaves the confirm to the
coordinator, and the pilot is decisive without one: the powered sample
is departures (n = 54), not seeds; the effect is deterministic
classification (54/54 passed, 0/54 on ctl, ledger reconciliation
exact to zero on both consistency bars); and the fight outcomes are
byte-identical between legs, so more seeds can only add more departures
of the same deterministic kind. A confirm would re-measure a
classification, not a stochastic effect. Recorded here as a decided
call, not a skipped step.

**Next blanks, in order:** (1) the bow SOURCE question — the gate now
correctly routes spear-holders to empty sources (stash 0, armory 0,
crafted 0 on both legs); where a launched party gets a bow at all is
still open (bowopen §5 sources 1–2); (2) a witness-door-scale arm is
unrelated to this gate and stays with the scale program; (3) the
searcaster "fusion cells" line wants one wild observation when a
searcaster holder next hits the no-ammo line.

## Metric review

The frozen metric judged exactly what was pre-registered: gate
classification + no-regression cost bars. No re-scoring happened — the
verdict was computed by the analyzer from the prereg's bars, and the
coordinator re-checked the bar table against the prereg text before
accepting it. One metric note for the next run: the "meetings" count in
the top-level leg summary (1) is a different population slice from the
pair-inclusive meetings (8); the evidence above quotes the pair
population throughout and says so. No metric change proposed.

## Infrastructure

- Write flap: crashed the driver mid-leg (ctl seeds 105906–105907
  lost), then the worker hardened the write path and re-ran the lost
  seeds. Corpora complete, 16/16 valid.
- Safe-commit index clobber: not struck on this adoption (checked at
  every commit; `git status` clean after each).
- The 0915Z run's other arm, sim-partyfunnel-a, already landed on
  master before this adoption (commits 126260f06…385f07995, pilot
  NO-GO — funnel works, launch rate 0.421 vs bar 0.50 + 2× ctl, pool
  now empty). Verified present, untouched by this adoption.
- Loop B live on winnability-chain (0830Z claim, sim-freestrike-b /
  sim-fightcap-b) — NOT touched.
