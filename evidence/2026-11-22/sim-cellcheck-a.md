# sim-cellcheck-a — cell supply / re-arming DIAGNOSIS

**Arm:** sim-cellcheck-a · **Loop A run:** fleshout-20261122T0615Z
**Axis:** scale-onramp · **Finding:** #2672 (killrate §6/§9 — contest guns
fire twice, then go dry) · **Type:** DIAG / instrument-only
**Band:** 107367–107374 (8 seeds, fresh — see prereg §3) · **Horizon:**
150d death-aware, competent verbatim policy
**Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`;
KILLBUNDLE/LEND/PRESENCE unset (identical to killrate-a, for
comparability with the band where #2672 was observed)
**Base:** worktree `~/workspace/worktrees/sim-cellcheck-a`, branch
`sim-cellcheck-a`, HEAD `bda6ff495` (= local master at start; no
commits after it)
**Instrument anchor:** `84dbeb8a6` (driver `scripts/cellcheck-driver-a.js`,
analyzer `scripts/analyze-cellcheck-a.js`, proof test
`scripts/test-cellcheck-a.js`)
**Verdict: DIAG-GO** — all five frozen bars pass (see §1).

## 0. The answer in plain words

A contest gun does **not** arrive dry. On this band every searcaster
that was granted arrived with **exactly 2 fusion cells** beside it,
and **no holder ever went dry**: 3 holders, 43 holder-days, all 43
with cells, zero dry days, zero cells ever spent in combat. The
question this arm was asked — do holders re-arm? — has a duller
answer than the finding suggested: **nothing re-armed because nothing
ever needed re-arming**. The gun never fired, not because it ran out
of cells, but because **no gun holder ever entered a wave-4+ fight**:
98 wave-4+ fights on the band, 84 fought, **zero with a searcaster
participant**. Lost volleys: 0 — by an empty pool, not by armed
holders winning fights.

So the wall moved one step down the chain. Killrate-a saw a gun fire
twice and go dry; fusioncell-a (no GUNRATE) saw guns arrive with no
cells at all and called it a participation wall. On this band, with
GUNRATE=1, the supply side is solved — every gun is armed, every cell
accounted for — and the wall is still participation: the people
holding the guns are not the people fighting the wave-4 monsters.
One holder's gun vanished from his pack mid-expedition with no
recorded cause (§4.3) — that loss is named, not hidden.

## 1. Frozen bars (judged by the analyzer on the fresh band)

| # | Bar | Threshold | Measured | Pass? |
|---|---|---|---|---|
| 1 | Instrument validity — proof test green; analyzer `--selftest` green; 0 instrument errors on all 8 seeds; det-gate recorder-on vs recorder-off identical | all must hold | test-cellcheck-a 37/37; test-fusioncell-a 40/40 (regression); analyzer `--selftest` 25/25; 0 errors, 8/8 files; det-gate identical on recorder-independent counters (see metric review §8 for the v4encounters mis-specification) | **PASS** |
| 2 | Attribution completeness ≥ 0.95 (primary) | ≥ 0.95 | **5/5 = 1.000** — 5 grants (3 searcaster, 2 fusion_cell) all with grant-level + prize-level deltas joined to the frozen code path; 0 fight entries (0/0 — no searcaster participant in any wave-4+ fight) | **PASS** |
| 3 | Grant-bundle table reported | must be reported | §2 — every grant's bundle by caller | **PASS** |
| 4 | Lost-volley count reported | must be reported | §3 — 0 lost volleys (0 lead-dry, 0 ally-dry, 0 armed volleys fired); lost damage 0 (no armed-volley mean exists on this band — see §8) | **PASS** |
| 5 | Wall numbers reported | must be reported | §5 — wins 0/8, national 0/8, wave 4 8/8, wave 5 1/8, median survival 147.5d, 4 communities lost (all regional) | **PASS** |

**GO = all five bars pass → DIAG-GO.** The lost-volley count itself
was never a GO bar; it is the measured answer, and the answer is
zero by absence of opportunity.

## 2. Grant-bundle table (all explained, 5/5)

Every searcaster/fusion_cell grant on the band, with the cell delta
at grant level (`alienLootGrant`) and at prize level (the whole
`_cxItemPrize` call — the bundle is pushed inside it, after the
grant returns). Bundle = prize delta − grant delta.

| Seed | Day | Item | Caller | Recipient | Grant Δ | Prize Δ | Bundle |
|---|---|---|---|---|---|---|---|
| 107367 | 67 | searcaster | contest-prize | app_mgpsphql908 | +0 | +2 | **+2** |
| 107369 | 73 | searcaster | contest-prize | rafael_torres | +0 | +2 | **+2** |
| 107369 | 103 | searcaster | contest-prize | omar_farouk | +0 | +2 | **+2** |
| 107373 | 67 | fusion_cell | contest-prize | gen_6xmligq | +1 | +1 | 0 |
| 107373 | 96 | fusion_cell | contest-prize | dmitri_sokolov | +1 | +1 | 0 |

- **All 5 grants are contest prizes.** Zero scholar-directed gun/cell
  grants (no player-won gun/cell prize redirected to a fighter),
  zero trade grants, zero show-gift grants, zero corpse-take grants.
- Every searcaster grant carries exactly the frozen bundle: +0 at
  grant level, +2 at prize level under GUNRATE=1. This confirms the
  prereg §2a mechanism live, and confirms why fusioncell-a (no
  GUNRATE) saw a searcaster arrive with 0 cells while killrate-a
  (GUNRATE=1) saw 2 shots per grant window.
- **Kill loot** (5 drops band-wide, all via `villagerKillLoot`):
  107368 d23 fusion_cell → ava_garcia (gallowdeer kill, cells 0→1,
  +1 — the only kill-loot cell); 107370 two phase_slings; 107372 one
  phase_sling + one starfall_bow. **0 kill-loot searcasters** — the
  KILLBUNDLE-unset control holds: the kill-loot wrap recorded +0
  bundle deltas throughout.
- **Cell accounting by source (new cells entering the world):**
  contest prizes 8 (3 bundles × 2 + 2 single cells), kill loot 1 —
  **9 new cells band-wide**. One further cell moved, not created: the
  scholar took ava_garcia's kill-loot cell from her corpse on day 118
  (107368), the only corpse take of a cell. No crafting (no recipe),
  no ruin salvage, no trade, no show gift produced a cell.
- **Max cells ever held by one person: 2** (the bundle). Nobody ever
  held more than their grant. The 7-cell maxima of fusioncell-a's
  bigbundle probe do not appear here because no holder ever stacked
  two grants.

## 3. Lost volleys: 0 — the pool is empty

- **98 wave-4+ encounters band-wide; 84 engaged; 0 with a searcaster
  participant.** Lead-armed 0, lead-dry 0, ally-armed 0, ally-dry 0,
  armed volleys fired 0. `noFusionCellsLines` 0 and `cellgateHolds` 0
  — the dry line and the hold-fire line never fired anywhere, because
  no searcaster holder ever led a fight at any wave.
- This is the same shape as fusioncell-a's bar-3 rare-rate path: the
  pool is too thin to measure dry-vs-armed behaviour, and the thinness
  IS the finding. It is stated plainly here, not smoothed over: the
  arm cannot say what a dry gun costs in a fight, because no gun ever
  got into a fight to be dry in.
- Lost damage: 0. The prereg's fallback (lost damage from the band's
  own armed-volley mean) is undefined with 0 armed volleys — the
  frozen ceiling would be ~49 expected damage per volley at 2 cells
  (~98 at 4 shots), but no volley was lost, so no damage was lost.

## 4. What happened to the guns and cells (holder stories)

Three people held a searcaster; three more held a bare cell; one
held a kill-loot cell. **43 searcaster holder-days, all 43 with
cells, 0 zero-days.** No holder's cells ever decreased except by
death or by the one unexplained loss (§4.3). No cell ever sat in a
stash (holders' stash cells 0 on every census day), so the
stash→pack top-up channel — the only non-grant re-arm in code —
never fired; there was nothing stashed to top up.

### 4.1 app_mgpsphql908 (seed 107367) — granted, gone in three days

Granted the searcaster + 2 cells on day 67. Departed the village on
day 69 with the gun and both cells. Died on day 70, cause
"Inspiration" (player:true — he died as the scholar, a succession
incarnation). Census rows run only days 59–69; 3 cell-days. The
village fought wave-4 on days 64–66 (before the grant) and days 71,
88–97 (after his death) — **zero fights in his alive window,
days 67–70**.

### 4.2 rafael_torres (seed 107369) — twelve days, never left with it

Granted the searcaster + 2 cells on day 73. Held gun + 2 cells for
12 cell-days. Died on day 85, "the wild" (player:true — died as the
scholar). **Never departed with the gun.** The village's wave-4
fights ran days 42–43 (before the gun) and day 101+ (after his
death) — zero fights in his window, days 73–85.

### 4.3 omar_farouk (seed 107369) — the gun that vanished

Granted the searcaster + 2 cells on day 103. Held gun + 2 cells for
31 cell-days. Departed on day 128 on an expedition (planWave4
false) with the gun and both cells; away days 128–135; died on day
136, "the wild" (player:true — died as the scholar). **11 wave-4
fights ran on days 105–135 while he held the gun — he was in none
of them** (not lead, not ally). This is the participation wall in
its purest form: the armed gun sat in the village, or out on a
non-wave-4 expedition, while eleven wave-4 fights happened without
it.

**The gun vanished from his pack between census day 133 and day
134.** Day 133: searcaster equipped, 2 cells, away, expedition
false. Day 134: ranged null, 0 cells, away. No grant, trade,
corpse-take, or contest prize on days 130–140 accounts for it (only
a harvest_scythe contest prize day 134 and a menders_apron day
136). The scholar's inventory held 0 cells on every day of the seed
— the gun did not move to the scholar.

Succession was the first hypothesis (a scholar died in the arena on
day 134 — gen_e478zbq, player:true — and omar died as the scholar
two days later, so he plausibly took the mantle on day 134). It is
**refuted by the code and the record**: `mantleBecome`
(villager-build.js) replaces the scholar's inventory with the
successor's *own* person.items/equipped/stashed — the successor
keeps their own gear. Had omar become the scholar on day 134, his
gun + 2 cells would have appeared in the scholar inventory; the
scholar series reads 0 cells and no gun on every day. The
death-pack rule (ledger.js) likewise packs the *dead* bearer's gear
onto the corpse — it removes nothing from a living successor.

**So the day-134 loss is unattributed.** It is not a grant and not a
fight entry, so it does not touch the attribution bar (5/5 stands),
but the holder story has a hole, and it is named here rather than
patched over. The likely candidates — a take, a trade, or a theft
that strips a gun from an away holder's pack — are not covered by
this arm's wraps. Filed as a follow-up tracer (see §9): wrap the
pack-removal paths (trade give, steal, gift) and re-run the omar
window.

### 4.4 The bare-cell holders — cells with no gun

- **gen_6xmligq (107373):** contest fusion_cell day 67, held 1 cell
  67 days to the village's end, never held a ranged weapon.
- **dmitri_sokolov (107373):** contest fusion_cell day 96, held 1
  cell 38 days, never held a ranged weapon.
- **ava_garcia (107368):** kill-loot cell day 23, held 1 cell 82
  cell-days, died day 118 "the wild" (player:true); the scholar took
  her cell from the corpse the same day, and it sat in the scholar
  inventory to the village's end (day 122). The scholar never held a
  searcaster, so the cell never fired.

**Re-arm channels — what exists vs what happened:**

| Channel | Exists in code? | Happened on this band? |
|---|---|---|
| Contest re-grant (bundle +2 / bare cell +1) | Yes | No holder ever got a second grant |
| Kill-loot fusion_cell (+1) | Yes | Once, to a villager with no gun (ava) |
| Kill-loot searcaster bundle | Only under KILLBUNDLE=1 (unset) | 0 kill-loot searcasters |
| Trade grant (+1) | Yes, via alienLootGrant | 0 trade gun/cell grants |
| Corpse take (scholar-only) | Yes | 1 cell, to a gun-less scholar |
| Stash→pack top-up (villagerPocketAmmo step 1) | Yes | Never — no cells ever stashed |
| Crafting / ruin salvage / pile / starting gear | No | — |

## 5. Per-seed table + wall numbers

| Seed | Days | Outcome | Max wave | Standing | v4 enc. |
|---|---|---|---|---|---|
| 107367 | 104 | lost | 4 | 150 | 9 |
| 107368 | 122 | lost | 4 | 199 | 20 |
| 107369 | 145 | lost | 4 | 199 | 17 |
| 107370 | 150 | survived | 5 | 515 | 16 |
| 107371 | 150 | survived | 4 | 199 | 1 |
| 107372 | 150 | survived | 4 | 199 | 21 |
| 107373 | 133 | lost | 4 | 199 | 4 |
| 107374 | 150 | survived | 4 | 199 | 10 |

Wall numbers (bar 5): **wins 0/8, national 0/8**, wave 4 unlocked
8/8, wave 5 unlocked 1/8, median survival 147.5 days, 4
communities lost (all at regional standing). Table: not instrumented
— recorded as not instrumented, never faked.

## 6. Cross-check: the fusioncell analyzer as a second opinion

`scripts/analyze-fusioncell-a.js` run on this corpus (its extra
fields ignored, its method predating the bundle):

- Coverage 8/8 PASS; pool rare-rate path PASS (0 engaged zero-cell
  searcaster meetings, 0 armed meetings; 43 searcaster holder-days).
- **Attribution 5/7 = 0.714 — FAILS its ≥ 0.90 bar.** Its detail
  shows exactly why, and the why confirms this arm rather than
  contradicting it: the 2 "unexplained" cell appearances are
  rafael's and omar's +2 bundle jumps (the census-window method looks
  for a `fusion_cell` grant and finds only a searcaster grant), and
  the 1 "spawned" appearance is app_mgpsphql908's +2 (he joined the
  village after the day-0 baseline, so the census method labels any
  first appearance 'spawned'). Its independent totals agree with this
  arm's event-level instrument: grantCellTotal 2, grantSearcasterTotal
  3, lootCellDrops 1, lootSearcasterDrops 0, corpseTakeCell 1,
  contestPrizes 169. The 3 bundle appearances are precisely the
  cases this arm's grant/prize delta wraps were built to attribute —
  and they reconcile 5/5 at event level. The census-window method
  cannot see a bundle; the event-level method can. Reported here so
  the disagreement is on the record with its cause, not buried.

## 7. Sense-test (3 beats read)

There are no beats where a holder enters a wave-4+ fight dry or
armed — no such beat exists on this band, because no holder ever
entered one. So the sense-test reads the beats around the holders
instead, and judges what the narration does and does not say.

1. **Seed 107369, day 101 — The Herald (omar holds the gun).**
   Elena leads with a bow: "Elena sees The Herald coming and nocks an
   arrow — the fight opens at range (2 shots)", two hits for 16 and 19,
   then the monster closes, Elena shouts for help, Saeed charges in,
   then Zoltan. Coherent, honest — the ranged opening works, the help
   calls work, gear absorption is named. What is absent: omar, who
   held the village's only alien gun with 2 cells that day, is nowhere
   in the fight and nowhere in the narration. The gun's absence is
   invisible.
2. **Seed 107367, day 71 — the Reunion (the day after app died with
   the gun).** Maya leads: "Maya has Bow but no arrows — the string
   stays drawn, useless." Then a coherent trick fight — she binds her
   wound mid-fight (+20 HP), stands on one foot and recites a poem,
   "The Reunion falters; it has nothing to wear." The game CAN narrate
   a dry weapon honestly — the bow gets its useless-string line. The
   searcaster never gets the chance: it died with app the day before,
   and nothing in the fight mentions that the village's one gun is
   gone.
3. **Seed 107369, day 130 — Walkout (omar away on expedition with
   the gun).** Maria fights, loses badly, shouts for help, Anna
   answers, Maria flees while she still can: "Anna answered Maria's
   shout, but Maria is past holding — they run while running still
   works." Coherent and human. Omar is away with the gun that day;
   neither he nor it is mentioned.

**Sense verdict:** the fights that happen are narrated honestly and
coherently, including an honest dry-weapon line for the bow. The
finding is what the narration never says: **no line anywhere on the
band mentions a searcaster or a fusion cell** — 0 occurrences in all
fight logs and veteran say lines. The gun is a silent object. When
the village's rarest weapon sits idle through eleven wave-4 fights,
nobody notices, nobody comments, nobody goes to fetch it. That
silence is the participation wall, in the narration's own words —
or rather, in its absence.

## 8. Metric review

- **Det-gate correction.** The prereg's bar 1 listed "v4encounters
  total" among the det-gate comparison fields. That was mis-specified:
  the recorder-off run records nothing by construction (16 vs 0 on
  seed 107313), so the field cannot be compared across legs. Neutrality
  is proven by the recorder-independent counters, which matched
  exactly: days 150/150, survived, maxWave 5, standing 585, regional,
  deaths 79/79, killCalls 72/72, fights 19/19, casts 28/28, spawns
  60/60, daily 148/148 identical, 0 errors both. The det-gate corpora
  are `perseed-cellcheck-a-detgate-on/` and `...-off/`; the prereg's
  comparison list should drop v4encounters total in future arms.
- **Attribution denominator is grants-only (5/5) because entries are
  0/0.** The primary metric passes on grants alone, and the thin pool
  is the finding, not a gap in the instrument: the fight-entry
  classifier was exercised on fixtures (25/25 selftest) and the
  corpus proves it would have classified entries had any existed
  (partyCells non-null on all 98 wave-4+ rows; zero named a
  searcaster holder). A future arm with a fatter pool should re-test
  the entry half of the metric live.
- **Lost-damage fallback.** Bar 4's "band's own armed-volley mean" is
  undefined with 0 armed volleys. The frozen ceiling (~49 expected
  damage per 2-cell volley) is the only available estimate and was not
  used, because no volley was lost. If a future band produces armed
  volleys, the mean should be computed from them.
- **Cross-check disagreement, resolved (§6).** The fusioncell
  analyzer's 0.714 attribution is a method limitation (census-window,
  pre-bundle), not a corpus defect: its 2 unexplained + 1 spawned
  appearances are exactly the 3 bundle arrivals, reconciled 5/5 at
  event level. The two analyzers agree on every independent total.
- **What the instrument cannot see.** The omar day-134 loss (§4.3)
  has no recorded event in this corpus — no wrap covers pack removals
  (take/trade/steal/gift). Any future re-arm tracer needs those wraps;
  this arm's wraps cover grants, prizes, and kill loot only.

## 9. Named next lever

**Participation, not supply.** The supply side is solved on this
band: every gun arrived armed (+2 cells), no holder ever went dry,
no cell was ever spent. The lever must put the gun in a fight. Exact
shape, as a design brief (DIAG arm — no build here):

- The wave-4+ fight party must include the gun holder (lead or
  ally), or the gun must move to a fighter who is going — the
  holder's own drive/experience should route them toward wave-4
  fights, or the village's gear day should reassign an idle gun to a
  departing fighter. The measure: searcaster-participant rate in
  wave-4+ fights (0/98 here) and armed volleys fired (0 here).
- **Do not** raise the bundle or add a re-arm channel first: with 0
  volleys fired, more cells would sit in packs exactly as these did.
  Re-arming is a non-question until a volley is ever spent.
- **Open thread for a tracer arm:** the omar day-134 gun loss.
  Wrap the pack-removal paths (trade give, steal, gift, and any
  expedition-return strip) and re-run seed 107369's window
  (days 128–136); the answer should name the exact call that took a
  searcaster + 2 cells out of an away holder's pack.

## 10. Finding-line update for sim-findings.md #2672

> **#2672 (cellcheck-a, band 107367–107374, DIAG-GO):** a contest
> searcaster arrives with exactly 2 fusion cells — every grant on
> the band (3 searcasters, all contest prizes) carried the +2 bundle,
> and no holder ever went dry (43 holder-days, 0 zero-days, 0 cells
> ever spent in combat). Re-arming never happened because it was
> never needed: 98 wave-4+ fights, 84 fought, **zero with a
> searcaster participant**, so lost volleys = 0 by empty pool. The
> wall is participation — holders are not the fighters — not supply.
> New cells band-wide: 9 (8 contest + 1 kill-loot). Open thread:
> omar_farouk's gun + 2 cells vanished from his pack on day 134
> (seed 107369) with no recorded cause; succession is refuted as the
> mechanism (mantleBecome keeps the successor's own gear; scholar
> inventory read 0 cells every day). Next lever: put the gun in a
> wave-4+ fight (holder joins, or gun moves to a departing fighter);
> do not raise the bundle or add re-arm channels until a volley is
> ever spent.

## Appendix — run record

- Prereg committed first: `6ec6d4401` (evidence/2026-11-22/sim-cellcheck-a-prereg.md).
- Instrument committed: `84dbeb8a6` (scripts/cellcheck-driver-a.js,
  scripts/analyze-cellcheck-a.js, scripts/test-cellcheck-a.js).
- Proof (pre-flight, on base bda6ff495): test-fusioncell-a 40/40,
  test-cellcheck-a 37/37 (incl. live `_cxItemPrize` bundle: every
  searcaster carried exactly +2 cells, every cell prize +1; live
  kill-loot searcaster +0 cells, fusion_cell +1; 2-cell volley spends
  exactly its shots; stash→pack top-up works live), analyzer
  `--selftest` 25/25.
- Det-gate (seed 107313, already-spent): recorder-on vs recorder-off
  identical on all recorder-independent counters (§8). Corpora
  `perseed-cellcheck-a-detgate-on/` and `...-off/`, logs
  `cellcheck-a-detgate-on/off.log/.err`.
- Judged band: 8 seeds 107367–107374, 2 legs × 4 seeds, both exit 0,
  8/8 files, 0 instrument errors, anchor `84dbeb8a6`. Corpus
  `evidence/2026-11-22/perseed-cellcheck-a-diag/`. Leg logs
  `cellcheck-a-legs-1.log/.err`, `cellcheck-a-legs-2.log/.err`
  (leg 2's first launch failed on a shell cwd bug — the second
  subshell ran in /home/hatch — and was relaunched correctly as its
  own exec; both legs exit 0).
- Analysis: `evidence/2026-11-22/cellcheck-a-analysis.json` (verdict
  DIAG-GO; attribution 5/5 = 1.000; lostVolleys 0).
- Cross-check: `scripts/analyze-fusioncell-a.js` on the same corpus
  (output `/tmp/cellcheck-x-fusioncell.json`, not committed) — see §6.
- Safe-commit index clobber struck after both prior commits and was
  repaired both times with `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`, verified status empty + diff
  HEAD empty + hash-object matches HEAD blob. Expect it again on
  this commit.
- No src/js change. No push, no version bump, no live verification,
  no merge — coordinator's job.
