# sim-holdbuild-b — BUILD the hold: upkeep tending for seasoned links + post-dissolution poverty-trap relief

Loop B run `fleshout-loop-b-20261114T2345Z`, axis winnability chain. Arm sim-holdbuild-b.
Prereg: `evidence/2026-11-14/sim-holdbuild-b-prereg.md` (committed `0a50f2122` — binds).
Branch: `sim-holdbuild-b`. Base master `910bff7f4`.

## Adoption + rebase (Loop B run fleshout-loop-b-20261115T0155Z)

Adopted from the dead run `fleshout-loop-b-20261114T2345Z` (coordinator timed
out mid-pilot; no closeout, no verdict). State on adoption: Stage 0 PASS 3/3,
pilot OFF leg only seed 100201 done, pilot ON leg not started. This run
finished the arm on the same branch. Rebased onto master tip `3321c6546`
(Lane B social-life r206, `src/js/betrayal.js` only — an invitation fix).
Rebase verification: proof test 9/9 + tenddrive cross-check 4/4 on the
rebased tip, then pilot OFF seed 100201 re-run on the rebased tip with
ZERO field diffs against the committed OFF file (only `anchorCommit`
differs by construction) — the betrayal.js change did not move the
baseline, so the OFF leg kept the committed file and ran the remaining
seeds. Instrument fixes during adoption: (a) the proof test's static leg
diffed the uncommitted worktree, so it failed 8/9 once the build was
committed — fixed to diff the branch against its merge-base (`f152ad77b`,
9/9 again); (b) the static leg now also accepts an empty src/js diff
(reverted tree — confinement is the point, no OTHER src/js file may be
touched). safe-commit.sh's index clobber struck 3× during this run
(committed files showing staged-deleted / MM); repaired each time with
`git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`
and verified `git status` empty + `git diff HEAD` empty + hash-object ==
HEAD blob. The revert commit needed `--force-delete` (safe-commit refuses
any commit deleting 79 lines in src/ as a stale-tree signature); the
coordinator's brief explicitly directed this revert, so that direction is
the approval — recorded here, not used silently.

## The lever, in plain words

Realms (a village's standing with other villages, built up to a national-level
alliance) fall apart after the court answers them, and twice they never came
back. Two named causes, both in the game's own tending machinery:

(a) **No upkeep tending.** The village's own tending drive only tends links
that are still young (unseasoned). Once the last link matures, tending stops
everywhere — the last tend on one village was day 70 — while raids, heralds
and arrears keep chipping trust away. A mature link only gains +1 trust a
week from tribute against −5/−10/−6 hits.

(b) **The poverty trap after a fall.** When a realm does fall apart, the
village is usually too poor in stored food for the tending gate to open at
all — one village never held more than about 14,000 food-energy in the 60
days after its fall, while monsters raided the stores every night — so trust
keeps sliding and the realm never climbs back.

The build (in `src/js/win-plan.js`, the one place the game itself decides
tending — see diagnosis below) does two things, each separately flaggable:

- **(a) Upkeep:** while the realm stands at national level, the village keeps
  tending its own links when trust falls below 55 (15 points of headroom
  above the 40-point line a link must hold), weekly, at the normal price of
  1,500 food-energy per tend — never free. Flag `HOLDBUILD_UPKEEP` (default
  on; `'0'` turns it off).
- **(b) Re-climb:** after a fall, if no plan-holder is at home to tend a
  link that has slipped below 40, the village's available representative
  steps in instead, and the food-store gate for that tending drops from 3
  days of stores to 1 day. Still real food, still weekly. Flag
  `HOLDBUILD_RECLIMB` (default on; `'0'` turns it off).

Nothing else changed: same tend price and cadence, same 40-point mature bar,
same succession haircut (−8 to all links, 7 days of mourning), same win
prices and deed gates, no new system.

## Where tending is actually decided (diagnosis)

Read first, before building. The player button (`tendLink`) was never the
blocker — it has no maturity gate. The engine decider is
`winPlanBondsTick` (daily tick): plan-holders at home tend their own main
links when trust is under 50, weekly, with 3+ days of stores — **but it
returned nothing at all once the realm stood at national level**. The
corpus proves it: 58 engine tends band-wide, zero on or after the national
day on any seed; 104–266 tick calls per national seed blocked by that one
return. The court's answer drive is off by default and never runs in the
browser, so it is not the real decider and was left alone. The sim
policies tend only young links with 20,000+ food-energy in store — an
instrument gap, not the game; the policies stay byte-identical.

A probe then overturned the brief's presumption for component (b): on the
two never-re-climbed seeds the binding blocker is not the food gate — it is
that **no plan-holder is at home at all** (0 holders on every day the gate
could have opened). Lowering the food gate alone could not produce one
tend there, so (b) adds a fallback actor as well as the lowered gate.

Prior art: sim-tenddrive-a (2026-11-08) built component (a) in exactly this
construction and went NO-GO at pilot — the mechanism fired (2 engine tends
while national) but its band had zero national losses, so there was nothing
to save. This band is loss-rich (7 dissolutions), so the bar here tests the
lever where losses exist.

## Baseline (committed corpus)

`evidence/2026-11-14/perseed-answercourt-confirm-b/` — 16 seeds × armed
competent-answercourt-b + baseline competent-scaleclimb-b, 150 days. Armed
leg: national ever 13/16; national held-days per seed 90, 0, 28, 71, 7, 72,
30, 57, 0, 0, 68, 77, 43, 19, 58, 34 (median 38.5); dissolutions 7
(series-counted); re-climbs 2 (100208 d113, 100211 d127); never re-climbed
100203, 100212; starvation armed 6 vs baseline 3; median survival armed
121.5d. Pilot band (100201–100208) corpus median national held-days 43.5.

## Stage 0 — reproduction (PASS 3/3)

Re-ran seeds 100201, 100203, 100212 armed with the recovered
answercourt driver and build flags OFF (`scripts/repro-holdbuild-b.js`):
every judged field identical to the corpus files; only `anchorCommit`
differs by construction. Policies recovered byte-identical from
`ed6df749e` (sha256-verified) and committed (`0a1282119`).

## Instrument incident — the recorder diverged the run (fixed)

The first pilot OFF leg (seed 100201) did NOT reproduce the corpus: maxWave
4→5, standing 199→656, wave-1 kills 35→50, deaths 50→121. The series first
diverged on day 5 (ladder-counted 12→13, wave-1 kills 1→2, pantry −450);
by day 10 the village's speaker was Liam for village_3 instead of Carmen
for village_0. The sweep was stopped after one seed; the contaminated file
was deleted, never used.

Root cause (instrument, not the build): the holdbuild driver's snapshot
read the upkeep/re-climb counters through `Game.winPlanStats()`. That
method calls `stateOf()`, which **creates** `village.winPlan = {}` when it
does not exist. `winPlanHavenTick` — the daily at-home plan tick — opens
with `if (!v || !v.winPlan) return null;`, so while `winPlan` is undefined
it does nothing at all; once the recorder created the empty object on day
2, the tick started seeding plans for every engaged wanderer/explorer at
home from day 3, gearing villagers up and changing fights days before the
corpus run ever forms a plan (which only happens after a wave-3+ fight).
`pantryDaysEstimate()` (pure arithmetic), the raw `winPlan` key count, and
the dissolution-episode ring (regex + array push) were all verified pure;
the `mode` label does not touch the RNG (`Math.random` is seeded from the
seed only).

Fix (committed `c06e85ffa`): `wpUpkeep`/`wpReclimb` are now read RAW from
`state.village.winPlanStats` — never through the method. Verified by the
new `scripts/repro-holdbuild-driver.js`: seed 100201 with the fixed
holdbuild driver, flags OFF, **PASS with zero field diffs** against the
corpus (150d, survived, national d62, maxWave 4, standing 199, deaths 50,
verbEvents 30). The pilot was re-run from scratch with the fixed driver.
Lesson: a recorder must never call a game accessor that creates state —
read the raw fields.

## Pilot (8 seeds 100201–100208, armed policy, 150d)

Pilot gate (all three, from the prereg):
(i) mechanism fires (upkeepTends + reclimbTends > 0 on the pilot band);
(ii) cost bar clean (starvation pooled ON ≤ OFF + 2 AND median survival
ON ≥ 0.8× OFF); (iii) 100203 re-climbs OR pilot median national held-days
≥ 48 (corpus pilot median 43.5 × 1.1). A miss = NO-GO at pilot: revert
the game change, report the measurement, no confirm spend.

### Pilot OFF leg (control — re-validates the fixed driver vs corpus)

The OFF leg reproduces the corpus EXACTLY on the pilot band: national
held-days per seed 90, 0, 28, 71, 7, 72, 30, 57 (median 43.5 — the corpus
pilot median to the day), the 100208 re-climb at d113, national-ever 7/8.
The rebase moved nothing.

| seed | days | end | maxWave | scale end | natDay | held-days | dissolutions | re-climb | starv | combat deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100201 | 150 | survived | 4 | national | 62 | 90 | — | — | 0 | 47 |
| 100202 | 120 | village-lost | 5 | regional | — | 0 | — | — | 0 | 104 |
| 100203 | 150 | survived | 5 | regional | 62 | 28 | d90 | — | 1 | 68 |
| 100204 | 140 | village-lost | 4 | regional | 68 | 71 | d139 | — | 1 | 86 |
| 100205 | 68 | village-lost | 4 | national | 62 | 7 | — | — | 0 | 43 |
| 100206 | 137 | village-lost | 5 | regional | 62 | 72 | d134 | — | 0 | 59 |
| 100207 | 103 | village-lost | 4 | national | 74 | 30 | — | — | 1 | 62 |
| 100208 | 132 | village-lost | 5 | national | 64 | 57 | d101 | d113 | 0 | 55 |

OFF aggregates: national-ever 7/8; median survival 134.5d; starvation
pooled 3; total deaths 608 (villager combat deaths 524 per the analyzer);
dissolutions 4; re-climbs 1; engine tends 31 (upkeep 0 / reclimb-classified
1 / ordinary 30 — the one "reclimb"-classified tend is the OLD code's
ordinary pre-national tending of a sub-40 link, not the build: wpReclimb
is 0 on every OFF seed, as it must be with both flags '0'); policy tends
72; wave-5 unlocked 4/8; wave-4 8/8; wins 0; table 0.

### Pilot ON leg

| seed | days | end | maxWave | scale end | natDay | held-days | dissolutions | re-climb | starv | combat deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100201 | 134 | village-lost | 4 | national | 62 | 73 | — | — | 0 | 69 |
| 100202 | 150 | survived | 5 | national | 109 | 42 | — | — | 0 | 112 |
| 100203 | 97 | village-lost | 4 | national | 62 | 36 | — | — | 0 | 102 |
| 100204 | 138 | village-lost | 4 | national | 68 | 71 | — | — | 1 | 88 |
| 100205 | 123 | village-lost | 4 | regional | 62 | 38 | d94, d102, d114 | d101, d109 | 0 | 82 |
| 100206 | 150 | survived | 5 | national | 62 | 90 | — | — | 1 | 97 |
| 100207 | 69 | village-lost | 4 | national | 65 | 5 | — | — | 0 | 82 |
| 100208 | 76 | village-lost | 4 | national | 63 | 14 | — | — | 0 | 80 |

ON aggregates: national-ever 8/8; median national held-days **40**
(73, 42, 36, 71, 38, 90, 5, 14 → median (38+42)/2); median survival
128.5d; starvation pooled 2; total deaths 790 (villager combat deaths
712); dissolutions 3; re-climbs 2 (both on 100205); engine tends 69
(upkeep-classified 6 / reclimb-classified 10 / ordinary 53); policy
tends 87; wave-5 unlocked 2/8; wave-4 8/8; wins 0; table 0.

Component attribution (build counters, read RAW from state): wpUpkeep 6,
wpReclimb 17 across the band — BOTH components fired. Per seed wpU/wpR:
100201 0/2, 100202 0/5, 100203 0/2, 100204 2/0, 100205 2/3, 100206 2/1,
100207 0/2, 100208 0/2. The verbEvent classifier is the conservative
read (upkeep 6 / reclimb 10 — it classifies by end-of-day series trust,
so a tend that lifts a link from 34 to 42 reads as ordinary on the
series row); the build's own counters are authoritative for "the path
fired". No divergence between components (both fired), so no
single-component pilot legs were needed per the prereg.

### Pilot verdict — NO-GO at pilot

- (i) Mechanism fires: wpUpkeep 6 + wpReclimb 17 = 23 > 0 — **PASS**.
- (ii) Cost bar: starvation ON 2 ≤ OFF 3 + 2 = 5 ✓; median survival ON
  128.5 ≥ 0.8 × 134.5 = 107.6 ✓ — **PASS**.
- (iii) 100203 re-climbs OR median held-days ≥ 48: 100203 ON reached
  national d62, held 36 days, and died d97 **while national** — it never
  dissolved (raw series: the only transition is national d62), so no
  re-climb was possible; its wpReclimb counter is 2 (the component fired
  there, pre-national). Median held-days ON is 40 < 48 — **FAIL**.

The gate fails on (iii) alone. Per the prereg (§14 metric binding) the
verdict is **NO-GO at pilot: no confirm spend**. The build was reverted
in the branch (`b0fdf077c`, `src/js/win-plan.js` byte-identical to master
`3321c6546`, hash `68f391f80626420c29a5f868df656a78faca782f`). The
measurement stands as the result: the hold mechanism works (fewer
dissolutions, 3 vs 4; more re-climbs, 2 vs 1; national-ever 8/8 vs 7/8)
but median national held-days did not rise — it fell 43.5 → 40 — because
the ON villages died in combat while national, not by dissolution
(100207: 5 held-days, lost d69; 100208: 14 held-days, lost d76). See
Metric review: held-days conflates hold quality with combat survival.

Balanced-panel compare (`evidence/2026-11-14/holdbuild-panel-pilot.{json,md}`
+ `-before`/`-after` `.json.gz`): decision **review_required**; the only
material signals are villageDeaths per run (76 → 98.75, delta +22.75)
and per 100 days (63.2 → 90.7) — the same combat-death confound, NOT a
build food cost (starvation was lower ON, 2 vs 3). National scale access
0.5 → 0.875, no material signal. The panel is the instrument; the
pre-registered pilot gate is the judge, and it says NO-GO.

## Confirm (16 seeds 100201–100216, 150d, if the pilot gate passes)

NOT RUN — the pilot gate failed on (iii), so per the prereg there is no
confirm spend. P1/P2/COST are unjudged by design; the pilot numbers above
are the result.

## Sense-testing — do the villages say why they tend again?

Seed 100205 ON is the sense-test: three dissolutions (d94, d102, d114)
and two re-climbs (d101, d109), all driven by deaths. Read from
`linkLines` + `dissolutionLines` + `verbEvents` in the ON file.

The dissolution IS voiced, and the deaths that cause it are voiced with
the mechanism named:

> "◈ The realm came apart — no polity answers to Haven now, and Haven is
> a free fire again. National no longer describes this village. The climb
> starts over." (d93/94)
>
> "🕯️ Rafael is dead — and the dead hold no treaties. Every link Haven
> has shakes."
>
> "Emberhold watches to see if Haven holds without its dead — and presses
> the tribute down to 1,688 kcal/week while the chair is empty. They'll
> test the link. Count on it. (Trust -8.)"
>
> "⚠️ Thornfield's fire is drifting from ours — their speaker doesn't
> linger at the gate the way they used to, and nobody over there says why.
> Bonds don't mend themselves; a tended fire remembers who fed it."

The re-climb IS a played return at the court level — the First Court
re-stages, the feast is paid aloud with the trust gains named:

> "◈ SYSTEM: 'Four fires. One head. GOVERNANCE LAYER: online — polity
> tribute routing, the court calendar, famine reserves. You built a realm.
> Try not to lose it the way you found it.'" (d100)
>
> "👑 Speakers from Emberhold, Thornfield, Stonebridge ride in for the
> first court — and every one of them is measuring you. FEAST them from a
> shared granary (5,000 kcal, no strings), HOST the court at Haven's fire
> (your speaker's time), or wr…" (d100)
>
> "🍲 The shared granary opens: 5,000 kcal for every fire of the realm,
> no strings. Emberhold, Thornfield, Stonebridge count it — and remember
> who fed them first. (Trust +10 with each — 3 grieving fire(s); theirs
> waits.)" (d101)

But the tend that causes the re-climb is SILENT. The verbEvents record
it exactly — d100, engine tends Thornfield's link 34→42 and Stonebridge's
43→51 (+8 each, 1,500 kcal each); d108, engine tends all three
(47→55, 32→40, 43→45 — the last partial, 369 kcal from a thin pantry,
proportional trust) — and the series shows the realm back at national
the next morning (d101, d109). No linkLine voices the representative's
tending, names the village, or says why the fire is fed again. The
prereg's question — "does the village SAY why it tends again" — gets a
split answer: the court says it, the tend doesn't.

The 100205 story in full: Rafael dies d93 (−8 to all links; Thornfield
42→34, below the bar) → realm falls d94 → the representative tends d100
→ court re-stages d100, feast d101, national again d101 → Nina dies d101
(−8 again) → realm falls d102 → tends d108 → national again d109, held
to d113 → Zoltan dies d113 (−8 again) → realm falls d114 → the village
dies out d123 (Meera d122, Paolo d123). The hold mechanism works; each
loss is a death, not a tending failure. The follow-up blank, for a future
arm, is a voiced tend line (who tends which fire, and why) — not built
here; this arm is NO-GO and lands nothing.

## Reachability verdict

Waves 1–5 are reachable on both legs (wave-5 kills on OFF 100202/100203/
100206, ON 100202/100206; wave-5 unlocked OFF 4/8, ON 2/8; wave-4 8/8
both). Regional 8/8 both legs. National-ever OFF 7/8, ON 8/8; national
at end-state OFF 4/8, ON 7/8. Global 0/8 both (viewership bar never met
in 150d on this band). The table: 0/8 both, no seat takes, no table
choices. Wins: 0/8 both. Arc reach (series `arc` max): Arc IV on all 16
pilot runs. Four-realm formation / vesting: not instrumented by this
driver — not observed, not claimed. The scale wall stands: villages
reach national and die there; nothing in this arm moved the table.

## Village assessment (plain words)

Eight villages, two versions of each. Without the hold, seven of eight
reach national and four lose the realm or never reach it; the realm
typically lasts a month or two and then a death, a raid, or a thin pantry
lets it slip. With the hold, all eight reach national and the tending
machinery visibly works — one village climbs back twice after losing its
realm, each time with a real court and a real feast — but the villages
still die at the same rate, and dying while national is what cuts most
holds short. The people who thrive are the ones who survive the fights:
on the ON leg the two survivors (100202, 100206) held national 42 and 90
days; the villages that lost early (100207 at day 69, 100208 at day 76)
died in combat with their realm intact. What was missing was not
tending — it was fighters who live through wave 4. The blank this arm
filled is the measurement: upkeep tending plus a fallback tender keeps
realms from dissolving (3 dissolutions vs 4, 2 re-climbs vs 1) but does
not buy held-days while combat keeps killing the village. The blank it
documents for the next arm is the silent tend — the village never says
why it feeds a fire again — and the death-driven dissolution loop, where
every villager death costs every link 8 trust at once.

## Metric review

P1/P2 measured the hold only part-way, and the pilot shows where the
proxy leaks. P2 (median national held-days) conflates hold quality with
combat survival: the ON leg had FEWER dissolutions (3 vs 4), MORE
re-climbs (2 vs 1), and MORE national-ever (8/8 vs 7/8), yet median
held-days FELL (40 vs 43.5) because two ON villages died in combat while
national at days 69 and 76 (5 and 14 held-days). A future arm should pair
held-days with a dissolution-rate bar, so a build that stops realms
falling apart is not judged by villages dying in fights. The pilot
gate's disjunction was the right sniff test in shape but brittle in this
instance: its 100203 half could not fire because 100203 ON never
dissolved (it died national at day 97), and its median half was dragged
by early combat deaths unrelated to dissolution. The bars stand as
written — metric binding (§14): the miss is a NO-GO, not a re-score —
but the NEXT arm's prereg should carry the dissolution-rate companion
bar. Two more notes: (1) the build changes the RNG stream (tends cost
food and change fights), so ON-vs-OFF per-seed pairing is approximate,
not exact — 100201 OFF survived 150d while ON lost at 134; 100202 OFF
never reached national while ON reached it at day 109. The pilot gate
compares band medians, which absorbs that, but per-seed stories must not
be read as paired counterfactuals. (2) The OFF leg reproduced the corpus
exactly on the pilot band (held-days per seed identical; 100208 re-climb
d113 identical), and the 100201 re-run on the rebased tip had zero field
diffs — the instrument is sound and the rebase moved nothing. The
recorder-divergence incident (fixed `c06e85ffa`) remains a metric-review
finding in its own right: a recorder must never call a game accessor
that creates state, or the instrument becomes a lever. The panel's
villageDeaths regression signal is the same combat-death confound, not a
build cost — starvation was lower ON. Death-cause shares (from the
per-seed `deaths` arrays): OFF — villager combat 46.4%, combat 19.2%,
expedition 15.6%, the wild 12.0%, starvation 0.5% (3/608); ON — villager
combat 35.4%, expedition 34.9%, combat 15.2%, the wild 8.4%, starvation
0.3% (2/790). Combat and the wild dominate both legs; starvation is a
rounding error either way.

## Wall numbers

Pilot OFF: national-ever 7/8, end-state national 4/8, table 0/8, wins
0/8, wave-4 unlocked 8/8, wave-5 4/8, median survival 134.5d. Pilot ON:
national-ever 8/8, end-state national 7/8, table 0/8, wins 0/8, wave-4
8/8, wave-5 2/8, median survival 128.5d. The wall is unchanged: national
is reachable, the table is not, and nothing has won.

## Files changed (branch `sim-holdbuild-b`)

- `src/js/win-plan.js` — the build only (committed `243e0a4c8` on the
  rebased branch), then REVERTED (`b0fdf077c`, NO-GO at pilot). The file
  is byte-identical to master `3321c6546` (hash
  `68f391f80626420c29a5f868df656a78faca782f`). Killed arm leaves no trace
  in game code.
- `scripts/test-holdbuild-b.js` — proof test: 9/9 PASS with the build on
  (rebased tip); on the reverted tree 5/9 by design (the four build legs
  fail; the OFF legs + static leg pass) — retained as specification, same
  precedent as tenddrive-a. Static-leg fix (`f152ad77b` + empty-diff
  acceptance): diffs the branch vs merge-base, accepts empty-or-win-plan.
- `scripts/test-tenddrive-a.js` — cross-check (NOT edited): 4/4 PASS with
  the build on; 2/4 on the reverted tree by design.
- `scripts/repro-holdbuild-b.js` — Stage-0 reproduction (3/3 exact).
- `scripts/holdbuild-driver-20261114.js` — judged driver (fixed, `c06e85ffa`).
- `scripts/analyze-holdbuild-b.js` — analyzer (validated on the corpus:
  13/16 national, 38.5d median held, 7 dissolutions, 2 re-climbs,
  0 upkeep tends).
- `scripts/build-holdbuild-panels-20261114.js` — panel builder (ON vs OFF).
- `scripts/probe-holdbuild-b.js` — diagnostic probe (refuted the pantry-gate
  presumption for component (b)).
- `scripts/policies/competent-answercourt-b.js`,
  `scripts/policies/competent-scaleclimb-b.js` — recovered byte-identical.
- `scripts/answercourt-driver-20261114.js`,
  `scripts/analyze-answercourt-b.js`,
  `scripts/build-answercourt-panels-20261114.js`,
  `scripts/test-answercourt-b-20261114.js` — recovered byte-identical.
- `evidence/2026-11-14/sim-holdbuild-b-prereg.md` — the binding prereg.
- `evidence/2026-11-14/perseed-holdbuild-b-pilot-off/` — pilot OFF leg
  (8 files, 100201–100208).
- `evidence/2026-11-14/perseed-holdbuild-b-pilot-on/` — pilot ON leg
  (8 files, 100201–100208).
- `evidence/2026-11-14/holdbuild-b-analysis-pilot-off.json`,
  `holdbuild-b-analysis-pilot-on.json` — analyzer output per leg.
- `evidence/2026-11-14/holdbuild-panel-pilot.{json,md}`,
  `holdbuild-panel-pilot-before.json.gz`,
  `holdbuild-panel-pilot-after.json.gz` — §15 pseudo-panel compare
  (decision review_required).
- `evidence/2026-11-14/check-quick-holdbuild-b.log` — `node
  scripts/check.js --quick` full log on the reverted branch (see below).

## Final checks on the reverted branch

- `scripts/test-holdbuild-b.js`: 5/9 (build legs fail by design — the
  build is reverted; OFF legs + static leg pass). Retained as
  specification.
- `scripts/test-tenddrive-a.js`: 2/4 by design (same precedent).
- `node scripts/check.js --quick`: 334 passed, 6 failed in 764s (full log
  at `evidence/2026-11-14/check-quick-holdbuild-b.log`). Attribution,
  verified by diffing the branch against master `3321c6546`:
  `src/` has NO diff (the build is reverted), and
  `scripts/balance-panel.js`, `scripts/sim-harness.js`,
  `scripts/sweep-compare.js`, `index.html` have NO diff. The 6 failures:
  (1) `test-measurement-proof-update.js` + (2)
  `test-measurement-workflow.js` — "retained neutrality proof covers the
  current Game/controller/harness inputs": caused by THIS branch — the
  manifest hashes every file under `scripts/policies/`, and this branch
  adds the two recovered policy files (`competent-answercourt-b.js`,
  `competent-scaleclimb-b.js`; the only diff under `scripts/policies/`).
  Proof-freshness failures, not behavior failures: the retained neutrality
  proof predates those files. If this branch merges, the maintenance proof
  must be refreshed (`scripts/balance-proof-update.js` with a real
  neutral panel — never fabricated; NOT done here, it is a separate
  maintenance action). (3) `test-measurement-cache-flags.js` — "both
  actual CLI configurations complete valid neutral panels": the known
  box-load artifact (AGENTS.md 2026-11-12), not attributable to this
  branch. (4) `test-phone-frame-proof.js` — retained receipt stale vs
  master's `index.html`/data files: pre-existing on master, this branch
  touches none of those inputs. (5)(6)
  `test-living-garden-deed-attainment.js` +
  `test-one-person-army-deed-attainment.js` — 120s per-script timeouts
  under concurrent sibling sweeps: load, not this branch. Neither
  `test-holdbuild-b.js` nor `test-tenddrive-a.js` is on the quick list.
