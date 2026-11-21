# sim-profilegate-b — SCOPED profile-gate relaxation (wave-4+ only) — GO

**Arm:** sim-profilegate-b (scoped variant) · **Loop B run:**
fleshout-loop-b-20261121T1430Z, adoption finish of the timed-out 1030Z run,
arm 1 of 3 · **Axis:** winnability chain
**Verdict: GO** — B1 + B2 + B3 + B5 all pass; B4 tracked (damage wall holds).
**Type:** LEVER, game code, default-OFF env flag (`PROFILEGATE4=1`).
No default flipped — the default flip is a coordinator/Steve call.
**Branch:** `sim-profilegate-b` · **Worktree:**
`~/workspace/worktrees/sim-profilegate-b`
**Base:** master `2b97163b0` (branch base; master has since moved — the
coordinator rebases at landing; `git diff 2b97163b0 <master-tip> -- src/js/villager-brain.js src/js/win-plan.js src/js/fieldFights.js` is EMPTY, so the rebase is trivial).
**Policy:** competent verbatim, sha256 `1884c8852d38` (12-char prefix).
**Band:** seeds 106741–106748 (8 seeds, FRESH — verified unused before
freezing) · **Horizon:** 150d death-aware.
**Prereg:** `evidence/2026-11-21/sim-profilegate-b-prereg.md` (frozen before
any judged sim; GO bars B1–B5 frozen there; a miss would have been NO-GO,
never re-scored).
**Adoption note:** the 1030Z run built the lever, froze the prereg, ran the
off/on legs and the proof test, then timed out mid-D2. This run re-verified
the on-disk state (diff exactly 26 insertions per file, anchors
`2b97163b0`, 0 instrument errors on all completed corpora), deleted three
0-byte flap-killed `.tmp-59348` debris files in `perseed-profilegate4-b-rec/`,
completed the rec/rec0 legs, and judged. Nothing was re-run or re-scored.

## 1. The lever — exact sites

Companion eligibility is gated in exactly TWO places, the `findCompanion`
twins, which apply the same checks in the same order:

1. `src/js/villager-brain.js` `findCompanion` — the DAWN BID gate.
2. `src/js/win-plan.js` `findCompanion` — the LEGACY depart gate (reached
   only when `vbrainOwnsDawn()` is false; changed identically so the twins
   stay in sync).

The change in each twin, and nowhere else: the profile check
`if (prof !== 'wanderer' && prof !== 'explorer') continue;` is skipped when
`PROFILEGATE4=1` AND the holder's own plan has `needWave >= 4`
(`profilegate4OpenFor`, a pure read — never writes, never rolls RNG).
No plan, or a wave-3 plan, keeps the old gate. Every other check is
unchanged: alive, away flag, trust ≥ 15, at Haven, engaged, non-expedition.
Each file gets a `profilegate4On()` helper mirroring the file's existing
env-gate pattern. Default OFF; in the browser `process` is undefined, so
the lever is off there too.

NOT changed (verified in the diff): the `winPlanHavenTick` plan-seeding
gate, `expeditionCand`, `winPlanSecondCompanion` (already profile-open),
`companionLaunchable`, the `agency.js` depart bypass, `companionRank`, the
PINQUAD blocks (villager-brain.js ~1269, win-plan.js ~1152), and
fieldFights.js pin lines. The diff is exactly 26 insertions per file
(two helpers + one one-line profile-check change each). This lever changes
who can walk with a party — a feel change — so the commit carries
`[needs-eyes]`.

Why scoped, not the parent's shape: the parent arm (Loop A, 2026-11-17)
widened the gate for EVERY plan holder and went NO-GO on B3 — the pool
filled (empty 0.931 → 0.0303), launches rose 3 → 7, but median survival
fell 147.5 → 116.5d (bar 118.0) and total deaths rose +52%. Its D3 found
the unscoped gate acting at ANY dawn bid for ANY holder, before any wave-4
plan existed. This arm confines the relaxation to the hunts the
winnability chain actually needs.

## 2. Frozen bars — results

| Bar | Frozen threshold | Measured | Result |
| --- | --- | --- | --- |
| B1 pool fills (wave-4+ dawns only) | ON empty share ≤ 0.47 AND mean eligible/dawn ≥ 1.5 | empty 6/80 = **0.075**, mean eligible **2.9** | **PASS** |
| B2 launches rise | launched instances ON ≥ 5 AND ON > OFF | ON **8**, OFF **6** | **PASS** |
| B3 scalemetric cost (parent's bar, identical) | starvation ON ≤ OFF + 2; arm-only ON ≤ OFF + 2; median survival ON ≥ 0.8 × OFF median | starvation **7 vs 5** (bar 7); arm-only **3 vs 1** (bar 3); median **144.5 vs 150.5** (bar 120.4) | **PASS** (both starvation clauses exactly at the bar — see §9) |
| B4 damage wall | TRACKED only | pooled share **0.0336** over 18 meetings (launchfunnel 0.085; parent ON 0.0577) | TRACKED |
| B5 instrument valid | proof green; D1 + D2 green; D2 full-band 0 divergences; D3 CLEAN; panel built; anchors `2b97163b0`; 8/8/8/8, 0 errors, classified ≥ 0.9, unknown 0 | proof **75/75**; D2 on **0**, D2 off **0**; drift CLEAN 8/8; panel built (§7); anchors all match; 8/8/8/8, 0 errors, classified **1.0**, unknown **0** | **PASS** |

**Verdict is GO iff B1+B2+B3+B5 pass. They do. B4 is reported either way.**

## 3. Before / after (identical seeds 106741–106748, full substrate both legs)

Substrate on ALL legs: `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1` (ALLYSLOT3 inert on this base —
no reader in `src/`; carried for parity). Legs differ ONLY by
`PROFILEGATE4` (off: unset; on: `1`; rec/rec0: recorder OFF).

### 3.1 The pool (B1) — the gate was the binding constraint, and it opened

| Population | Dawns | Empty | Empty share | Mean eligible |
| --- | --- | --- | --- | --- |
| OFF, needWave≥4 | 146 | 136 | 0.9315 | 0.075 |
| **ON, needWave≥4** | **80** | **6** | **0.075** | **2.9** |
| OFF, all dawns | 167 | 150 | 0.8982 | 0.108 |
| ON, all dawns | 123 | 46 | 0.374 | 1.919 |

The OFF leg on this fresh band reproduces poolfirstfail almost exactly
(its needWave≥4 OFF baseline was 0.9495 empty at mean 0.051) — the gate
binds hardest exactly where the scoped lever acts. ON, the gate-open rows
are 80/80 on wave-4+ dawns and the picked companions are foragers (45),
homebodies (23) and wanderers (6) — the pool is no longer ranger-only.
`agree` 74/74 on wave-4+ rows (replica matches the real pick every time;
0 `agree: false` rows, so the prereg's instrument limitation 1 never
triggered). The ON leg scores fewer wave-4+ dawns (80 vs 146) because
trajectories diverge once parties actually launch — launches change who
holds plans and who is at Haven, so the ON population is not the OFF
population recomputed (the prereg anticipated this; the B1 bar was set
looser than the counterfactual mean for exactly this reason).

The homebody share is priced, not hidden: 23 of 74 wave-4+ picks are
homebodies, and a homebody cannot launch (range-0, `companionLaunchable`
blocks). The bid→launch conversion is where the next leak lives (§3.2).

### 3.2 The funnel — the leak moved downstream, off the pool

| Bucket | OFF (31 instances) | ON (21 instances) |
| --- | --- | --- |
| launched-killed | 1 | 1 |
| launched-fought-no-kill | 2 | 5 |
| launched-no-meeting | 3 | 2 |
| **launched total** | **6** | **8** |
| target-killed | 1 | 1 |
| selected-blocked | 2 | 8 |
| bid-not-selected | 1 | 0 |
| plan-churned-before-dawn | 8 | 4 |
| candidate-not-bid | 13 | 0 |
| unknown | 0 | 0 |

OFF's binding stage was `candidate-not-bid` (13/31 — the pool was empty,
so no bid existed to select). ON's binding stage is `selected-blocked`
(8/21): the pool fills, a bid is made, and the launch then fails at the
depart step — inviter-range-0 ×4 (a homebody holder cannot leave home),
danger-gate ×2, night ×1, inviter-sick ×1. Wave-4+ launch events: ON 40
vs OFF 32. The lever did its job and exposed the next constraint: getting
the party out of the door, not finding a companion.

### 3.3 Damage (B4, tracked) — parties launch and fight, but barely dent wave-4 monsters

Pooled share **0.0336** (674 dealt / 20,080 derived max HP over 18
meetings; 10 derived from fight logs, 8 from the hp-range midpoint
fallback). Per-meeting best: thabo_maseko vs congregation, day 94,
160/769 = **20.8%** — the single strongest hit. Five of the 18 meetings
dealt 0 damage. One launched kill on each leg (ON 1, OFF 1). The share is
LOWER than the parent ON leg's 0.0577 and launchfunnel's 0.085: more
launches, but the extra parties are mostly meeting the monster and
bouncing off it. Filling the pool buys launches, not kills — the damage
wall is now the binding link in the chain, and it is a fighting-strength
problem (gear, abilities, party damage), not a companion-supply problem.
No further pool widening will move it.

### 3.4 The wall (scale numbers, every run)

Analyzer wall (seeds with standing ≥ 200 / scaleRank ≥ national / table /
wins / wave-4 unlock / wave-5 unlock / deaths / starvation):

| | OFF | ON |
| --- | --- | --- |
| standing ≥ 200 | 5/8 | 4/8 |
| national rank | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| wins | 0/8 | 0/8 |
| wave-4 unlocked | 8/8 | 8/8 |
| wave-5 unlocked | 5/8 | 4/8 |
| total deaths | 657 | 647 (−1.5%) |
| starvation deaths | 5 | 7 |
| median survival | 150.5d | 144.5d |
| villages survived to 150d | 5/8 | 4/8 |

Per-seed (days / end / standing / rank / maxWave / deaths):

| Seed | OFF | ON |
| --- | --- | --- |
| 106741 | 151d survived, 445, regional, w5, 93 deaths | 126d village-lost, 199, regional, w4, 80 deaths |
| 106742 | 147d village-lost, 660, regional, w5, 109 deaths | 150d survived, 635, regional, w5, 105 deaths |
| 106743 | 102d village-lost, 199, regional, w4, 81 deaths | 139d village-lost, 199, regional, w4, 89 deaths |
| 106744 | 151d survived, 425, regional, w5, 97 deaths | 151d survived, 475, regional, w5, 102 deaths |
| 106745 | 98d village-lost, 199, regional, w4, 66 deaths | 99d village-lost, 199, regional, w4, 75 deaths |
| 106746 | 150d survived, 175, regional, w4, 74 deaths | 150d survived, 175, regional, w4, 74 deaths |
| 106747 | 152d survived, 510, regional, w5, 53 deaths | 152d survived, 510, regional, w5, 53 deaths |
| 106748 | 151d survived, 465, regional, w5, 84 deaths | 151d survived, 465, regional, w5, 84 deaths |

Seeds 106746 and 106747 are byte-identical trajectories off vs on (the
drift check calls them IDENTICAL) — the lever never acted there, and the
numbers confirm it. The standing-199 stall is visible again: three ON
villages sit at exactly 199 (106741, 106743, 106745) and two OFF villages
(106743, 106745) — the gate that opens when a second living wave-4
veteran appears is still the wall past regional, and this lever does not
touch it. No village reached national, the table, or a win on either leg.
Wave 4 unlocks everywhere (8/8 both legs); wave 5 unlocks on 4–5 of 8.

### 3.5 Cost (B3) — the scoped variant does NOT repeat the parent's failure

The parent's unscoped gate cost +52% deaths and −31d median survival.
The scoped gate costs −6d median survival (144.5 vs 150.5, bar 120.4 —
comfortable) and −10 total deaths. Starvation is the tight part, and it
is concentrated, not diffuse: ON's 7 starvation deaths are 6 on seed
106745 (a village-lost at day 99) + 1 on 106748; OFF's 5 are 4 on 106745
+ 1 on 106743. The arm-only matched count (same seed, same day) is 3 vs
1 — the extra 2 are on the seed that was already starving on the OFF leg.
Both starvation clauses pass exactly at their bars (7 ≤ 5+2, 3 ≤ 1+2);
on a different band they could as easily miss. That is a property of the
bar on 8 seeds, not a reason to re-score — see §9.

## 4. Reachability verdict

- **Wave-4 hunts:** reachable and now launchable — 8 launched instances,
  40 wave-4+ launch events, 18 fought meetings, 1 launched kill. The
  content is no longer decoration; parties walk out and meet the monster.
- **Wave-5:** unlocks on 4/8 ON villages (5/8 OFF) but no wave-5 kill or
  facing is recorded in this corpus — the door opens, nobody walks
  through it yet. The binding link has moved from companion supply to
  party damage (§3.3) and the selected-blocked depart failures (§3.2).
- **Regional → national → table → win:** not reached on either leg (0/8
  national rank, 0 table, 0 wins). The scale wall stands past regional;
  the 199-standing stall (§3.4) is the visible form of it here.
- **Veterans:** wave-4 seed calls 85 ON vs 74 OFF; 38 attached plans ON.
  Veterans are being made — the readiness bar still needs its second
  living wave-4 veteran, which is a kill-conversion problem, not a
  companion problem now.

## 5. Village assessment (plain words)

Eight villages, same starting conditions, two different rules about who
may walk with a hunting party. Under the old rule, a wave-4 hunting party
almost never had anyone to take: 93% of the mornings a holder looked for
a companion, the pool was empty — not because nobody trusted the holder
(trust was high, 90s), but because the only people allowed were rangers
and almost nobody is a ranger. Under the new rule, the mornings fill:
foragers and homebodies stand beside the holder, trust in the 90s, and
parties walk out. The villages do not collapse for it — they lose about
the same number of people, they survive about as long, and the one seed
that starved was already starving before the lever touched it.

What the villages look like after: four of the eight ON villages are
still standing at day 150, four are gone. The ones that are gone died the
usual deaths — the pantry ran out on 106745, the monsters came through
on 106741 and 106743. The ones standing are stuck at the same place the
game has been stuck: regional standing, a 199-point wall, no road to
national. The parties that do launch meet wave-4 monsters and mostly
bounce off — one kill in eight launches, most fights dealing less than a
twentieth of the monster's health. The village can now field a party.
It cannot yet win a fight with one. That is the next blank, and it is not
a companion problem anymore.

## 6. Sense-testing (SENSE-TESTING LAW — read transcripts, judge meaning)

Real `vetSays` lines from the ON leg (seed 106741), verbatim:

- Day 1: *"A man, maybe 40s, with a scarred cheek heads out for water.
  \"Water first. Everything else waits.\" The pantry won't fill itself."*
- Day 2: *"A man, maybe 40s, with a scarred cheek looks at you flatly.
  \"Why should I listen to you?\" (Trust too low.)"*
- Day 7: *"Eric has been asking about the strange leaves all week —
  \"but what IS it?\" Tonight, an answer. Dmitri is showing everyone
  Ground Elder by the fire. \"See the leaves? Like that. Don't mix it
  up.\" The Codex grows — the human way."*
- Day 13: *"🛡️ Robin, Eric, Klym, Kalkidan and Ursula met them at the
  door — 4 put down, 1 barely walked away. Robin, Eric, Klym, Kalkidan,
  Ursula are hurt."*
- Day 29: *"📺 \"Oh, you survived the AUDIENCE NOTES? Cute. We've
  stopped pretending these are animals now. That was the FINAL DRAFT,
  folks — what comes out of the treeline next was never alive the way
  you mean it.\""*

The daily fiction is coherent and personal: people teach each other by
the fire, argue about trust, defend the door and get hurt doing it. The
knowledge system visibly works — *"Mario was watching. Now they know
Ground Elder too"* — and the alien-audience voice lands as menace, not
noise.

**Launch-adjacent scene 1 — a forager walks the road (ON, seed 106741,
day 105).** Holder elif_demir, a forager herself, holds a wave-4 plan
against the reunion. At dawn the pool holds 5 eligible villagers at
Haven; the ranker picks chantal_mukendi, a forager, trust 92 — ahead of
a homebody (ursula_weber, trust 92) and two other foragers. The party
departs, meets the reunion, and deals 120 of its ~1111 health (10.8%) —
fought, no kill. This reads as a person choosing to go: the pick is
trust-gated and ranked, the companion is named, the fight is real and
costly. It is not a roster slot filling.

**Launch-adjacent scene 2 — a homebody picked at dawn who cannot launch
(ON, seed 106744, days 87–89).** Holder app_mgpsphw9860 — itself a
homebody — holds a wave-4 plan against the eater and bids elijah_scott
(trust 91) at dawn. The commit HOLDS, twice on day 87, then re-bids
elena_petrova on days 88–89 and holds again: `vidBlock: range-0` both
times. The holder cannot leave home, so nobody leaves. The same
inviter-range-0 block accounts for 4 of the 8 selected-blocked instances
on the ON leg. **This hold IS voiced in the game:** the holder-side line
lives at villager-brain.js:768 ("X meant to walk out with Y — but X
never leaves Haven, so X stays home"), and the companion-side line at
:736 ("X asked Y to walk out with the party — but Y never leaves Haven,
so Y stays behind"). Neither line appears in this corpus's `vetSays`
capture — but that capture is filtered by SAY_RE (veteran/kill language
only), which excludes both lines, so their absence there proves nothing.
The hold is covered; do not re-file it as silent.

**The gap the fiction does not cover:** ordinary departures. No
`vetSays` line in the corpus marks the day-105 reunion launch, and a
code check finds no `say` call on the ordinary launch path in
villager-brain.js at all — the only dawn-commit voices there are the two
hold lines above. (The reseedbeat fix covered re-seed launches only.)
A party walking out to hunt a wave-4 monster is the most consequential
choice of its day, and the village never says it is happening. That is a
blank to document, not a lever to build here. (See §10.)

## 7. Balanced panel (§15, off → on)

Built with `scripts/build-profilegate4-panels-20261121.js` and compared
with `scripts/balance-panel.js compare`:
`evidence/2026-11-21/profilegate4-b-panel.{json,md}` (+ before/after
`.json.gz`). Panel decision: **review_required** (screen only, 8 paired
cases). No material signal on the contract metrics: table win rate 0 →
0; national scale access 0 → 0; village deaths/run 82.1 → 80.9 (paired
delta −1.25, 95% exploratory interval −6.9 to +4.4); village deaths per
100 days 60.8 → 60.3. The one flag is **regression_watch** on community
loss: 0.375 → 0.5 (3/8 → 4/8 villages lost; interval −0.25 to +0.5) —
one extra lost village, inside an exploratory interval that covers zero.
The panel is the instrument, not the judge: the frozen B3 bars (which
include the median-survival clause the panel does not) are what judge the
cost, and they pass. The panel's regression_watch is consistent with the
B3 edge-pass reading in §9: the cost is real but small, and 8 seeds
cannot resolve it further.

## 8. Instrument validity (B5)

- Proof test `scripts/test-profilegate4-b.js`: **75 passed, 0 failed**
  (re-run on this tree at adoption time, ~15:00Z) — static checks (lever
  present, env-gated, scoped in both twins; depart bypass untouched;
  `winPlanSecondCompanion` still profile-open; seeding gate and
  `expeditionCand` NOT widened; PINQUAD blocks untouched), analyzer
  fixtures, live gate fixture (staged forager picked ON at dawn, null
  OFF; needWave-3 staging null in BOTH states — the scope holds;
  homebody picked ON but blocked at launch by range-0; depart variants
  proving the landed bypass lets a picked forager depart), live gate-act
  on fixture seed 106736 (OFF pool 53 dawns, all empty; ON pool 5 dawns,
  0 empty, mean 3.4), D1 repeatability + D2 wrap neutrality (60d, seed
  106736, both PROFILEGATE4 states).
- D2 full-band: rec ≡ on on all 8 seeds, rec0 ≡ off on all 8 seeds —
  **0 divergences** either way. The recorder is neutral.
- D3 drift: **CLEAN on all 8 seeds** — first divergence day ≥
  first-lever-day on every seed (e.g. 106741: lever day 52, diverge day
  106; 106744: lever day 26, diverge day 89); seeds 106746/106747
  IDENTICAL. No pre-lever drift; the first-v4-seed-row bound is valid
  for the scoped gate by construction (it cannot act before a wave-4
  plan exists).
- Corpus anchors: every file on all four legs stamps `2b97163b0`
  (analyzer `anchorAll: true`); file counts 8/8/8/8; 0 instrument errors
  on every leg; classified share 1.0; unknown 0.
- `check.js --quick` attempted after the `src/` change: **INCOMPLETE,
  never green** — killed by the 280s timeout after 74/344 scripts, 0
  failures in the completed portion (`profilegate4-b-check-quick.log`).
  Recorded honestly per the prereg; the full quick suite needs ~20+ min
  and was not re-run — the proof test (75/75) is the substantive gate
  for this scoped change.
- Adoption hygiene: three 0-byte `.tmp-59348` debris files in
  `perseed-profilegate4-b-rec/` (flap-killed writes from the 1030Z run)
  deleted before the rec leg; the rec leg then wrote all 7 missing files
  cleanly (write-robust readback verified by the driver on every file).
  The host write flap was ACTIVE at adoption (registry atomic writes
  failing EPERM at 14:37Z); plain file writes in this tree succeeded
  throughout, verified by size/readback after every write.

## 9. Metric review

1. **B3's starvation clauses pass exactly at the bar, and that is
   fragile.** Starvation 7 vs bar 7, arm-only 3 vs bar 3, both driven by
   one seed (106745) that was already starving on the OFF leg. The bars
   are doing their job — they caught the parent's +52% death cost and
   they would have caught a real cost here — but on 8 seeds a
   two-death swing is noise. The panel's regression_watch on community
   loss says the same thing from the other side. Recommendation for the
   NEXT run, not this one: if this lever ever goes to a 12–16 seed
   confirm, re-freeze B3 with the same construction (the bar is honest)
   and let the bigger band decide whether the cost is real. Do NOT
   re-score this verdict — GO stands on the frozen bars.
2. **B1's dawn-count asymmetry is expected, not a defect.** ON scores
   80 wave-4+ dawns vs OFF's 146 because launches change the village.
   The bar was deliberately set looser than the counterfactual mean
   (1.5 vs 3.23) for this reason, and ON cleared it at 2.9. No revision
   needed.
3. **B2's "launched instances" understates the effect.** Instances (8
   vs 6) count plan-instances; wave-4+ launch EVENTS are 40 vs 32, and
   the funnel shows the pool leak (candidate-not-bid 13 → 0) fully
   closed. A future arm measuring launch throughput should bar on
   events, not instances — the instance count is capped by how many
   plans exist, which the lever does not create.
4. **B4's damage derivation is honest about its limits.** 8 of 18
   meetings fall back to the hp-range midpoint (no parseable first
   strike line — mostly 0-damage meetings where no strike landed). The
   per-meeting table makes every derivation auditable. The pooled share
   is the right headline; the per-meeting spread (0% ×5, best 20.8%) is
   the real story: parties meet the monster and mostly cannot hurt it.

## 10. Blanks filled / documented

**Filled by this arm (GO — lands as one commit):** the scoped
profile-gate relaxation. Wave-4+ plan holders may now take any trusted
villager at Haven as a companion, not only wanderers/explorers. The pool
fills (0.93 → 0.075 empty), launches rise (6 → 8 instances, 32 → 40
events), the cost stays inside the parent's bars. The winnability
chain's companion-supply link is no longer the binding constraint.

**Documented, not built (findings backlog — see sim-findings.md):**
- The next binding links are now visible and measured: (a) party
  damage vs wave-4 monsters (pooled 3.36%, best single meeting 20.8%,
  1 kill in 8 launches) — a fighting-strength problem, not a supply
  problem; (b) selected-blocked depart failures (8/21 instances, half
  inviter-range-0) — holders who bid parties they cannot lead out of
  the door; (c) the standing-199 stall (3 ON villages at exactly 199) —
  the gate to national still does not open.
- Sense gap: ordinary wave-4+ party departures have no fiction line —
  no `say` call exists on the ordinary launch path in villager-brain.js
  (the only dawn-commit voices are the two hold lines). When a party
  walks out to hunt a wave-4 monster, the village should say so. The
  holds, by contrast, ARE voiced (villager-brain.js:736/:768) — do not
  re-file them as silent; the corpus's SAY_RE-filtered `vetSays`
  capture excludes those lines by construction.

## 11. Files / disposition

- Lever: `src/js/villager-brain.js`, `src/js/win-plan.js` (26 insertions
  each; `[needs-eyes]` on the commit — `src/` touched, feel change).
- Instrument: `scripts/profilegate4-driver-20261121.js`,
  `scripts/analyze-profilegate4-b.js`,
  `scripts/profilegate4-drift-check.js`,
  `scripts/build-profilegate4-panels-20261121.js`,
  `scripts/test-profilegate4-b.js`.
- Corpora: `evidence/2026-11-21/perseed-profilegate4-b-{off,on,rec,rec0}/`
  (8 files each).
- Analysis: `evidence/2026-11-21/profilegate4-b-analysis.json` (verdict
  GO); legs log `evidence/2026-11-21/profilegate4-b-legs.log`;
  check-quick log `evidence/2026-11-21/profilegate4-b-check-quick.log`
  (incomplete, see §8).
- Panel: `evidence/2026-11-21/profilegate4-b-panel.{json,md}` (+
  before/after `.json.gz`).
- Prereg: `evidence/2026-11-21/sim-profilegate-b-prereg.md`.
- Evidence: this file.
- **Disposition: GO — commit lever + instrument + evidence; report
  'ready to merge' with branch tip + verdict. The coordinator merges via
  --ff-only and reports 'merged locally, pending ship'. No default
  flipped; no push; no version bump; no live verification.**
