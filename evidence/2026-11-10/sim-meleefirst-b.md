# sim-meleefirst-b — melee-first / ranged-fallback slot rule (SPEAR-IN-RANGED-SLOT fallback)

- Arm: sim-meleefirst-b (Loop B, BUILD arm, run fleshout-loop-b-20261110T0626Z)
- Branch: sim-meleefirst-b; base anchor `a5d615880` (worktree `~/workspace/worktrees/sim-meleefirst-b`)
- Prereg: evidence/2026-11-10/sim-meleefirst-b-prereg.md (committed `86358a49`
  BEFORE any judged computation in this run).
- Proof test: scripts/test-meleefirst-b.js (**64/64 on the fixed code**,
  57/57 on the unfixed code in BEFORE mode — the test is dual-mode and
  asserts the before behavior when the fallback is absent).
- Analyzer: scripts/spearvolley-analyze-20261110.js (reused unchanged).
- Verdict: **GO — the fix lands.** The constructed primary passes (E1
  volley 30/30 both beasts, E4 damage preserved, isolated re-measure
  fixed ≡ before exactly), the wild guard passes on the pilot band and
  pooled (wave-4 kills 12 = 12 pilot, 26 → 27 pooled), the volley-row
  guard passes on both bands, and the cost bar passes on both bands.
  The confirm band's all-waves volley rate dips (10.8% → 9.5%) — it is
  investigated below, attributed to one seed's chaotic early death, with
  bow-held rates rising at waves 3–5; it is recorded as a caveat, not a
  re-score, because the prereg binds the verdict to the pilot GO and sets
  no separate GO threshold for the confirm band (see Metric review).

## The fix (built, proven, measured — LANDS)

`src/js/equipment.js` only — the slot rule becomes fighter-contextual,
in the one place that decides slots from inventory:

1. New helpers: `isFallbackSpear(def)` — a melee-type weapon with
   `range > 1` (exactly the 5 spears/lance in current data);
   `isRealRangedWeapon(def)` — `weapon.type === 'ranged'` (the 8
   bows/crossbow/slings/searcaster); `carriesRealRanged(ids, itemDefs)`.
2. `equipScore(..., opts)`: optional 5th param. When
   `opts.meleeFirstSpears` is true, a fallback spear scores as MELEE;
   otherwise classification is exactly as today. All existing callers
   pass 4 args.
3. `autoEquip`: computes `hasRealRanged` from the fighter's OWN
   inventory once and passes `{ meleeFirstSpears: hasRealRanged }` into
   the weapon-slot scoring. Effect: bow+spear → melee spear + ranged
   bow (volley restored); machete+spear+bow → melee machete + ranged
   bow (spear unequipped — the ONLY shape that loses fold-in damage);
   machete+spear-no-bow → melee machete + ranged spear (wb 33
   preserved); spear-only → ranged spear (wb 15, contact-finish
   kind-'spear' path preserved).
4. `migrateEquipment`: same rule for legacy `eq.weapon` saves — a
   migrating spear goes to melee when the person carries a real ranged
   weapon in their own items, else ranged as before.
5. `isRangedWeapon(def)` and `slotForItem(def)` are UNCHANGED
   (context-free): UI, villager-build, contests, and the competent
   policy's slot reads keep today's behavior. Known gap, recorded not
   fixed: a player MANUALLY equipping a spear through the UI still gets
   the ranged slot (game.js:13510 `slotForItem` path); auto-equip (what
   sims, gear-up, and field fights use) is the fixed path. The
   manual-equip path is a separate arm if Steve wants it.
6. Nothing else: no volley formula change, no `wb` fold-in change
   (`(melee+ranged)/2` stays), no `mBreak` change, no rounds-cap change,
   no contact-finish change, no gate / price / deed / readyDemand /
   win-price change.

## Primary metric (constructed, §14) — GO

Bow+spear fighter (crude bow + 4 arrows + hunting spear + 1 from-start
ally) meets a wave-4 beast at FULL HP through the real `Game.fieldFight`
on seeded streams (30 per beast, seed 87104 family):

| Beast | Before (unfixed) | After (fixed) | Bar |
|---|---|---|---|
| Herald (700 HP): volley fires | 0/30 | **30/30** | ≥ 27/30 |
| Herald: median volley dmg | — (null) | **14** | > 0 |
| Herald: slots melee spear / ranged bow | 0/30 | **30/30** | ≥ 27/30 |
| Audit (1200 HP): volley fires | 0/30 | **30/30** | ≥ 27/30 |
| Audit: median volley dmg | — (null) | **26.5** | > 0 |
| Audit: slots melee spear / ranged bow | 0/30 | **30/30** | ≥ 27/30 |

GO on the primary as written. The before leg is the same proof test
run against the unfixed code (dual-mode test, BEFORE mode 57/57 — it
asserts volley 0/30 and spear-to-ranged slots, i.e. it discriminates).

## E4 — damage preserved (the spearvolley killer, re-measured) — GO

Machete + hunting spear, NO bow, same beasts, 30 streams each:

| Beast | Before (in-test) | After (in-test) | Bar (0.90× spearvolley E4) |
|---|---|---|---|
| Herald (700): median total dmg | 268.5 | **277.5** | ≥ 209.3 |
| Audit (1200): median total dmg | 190.5 | **190.5** | ≥ 141.8 |

GO. The in-test before/after gap on Herald (+9) is cross-leg state
carryover, not the fix: the proof test runs E1 before E4 in one
process, and E1's volley spending differs between modes. Re-run in
ISOLATION (fresh process, E4 only, `/tmp/e4-isolated.js`, not
committed): fixed ≡ before EXACTLY — Herald 251.5 / 251.5, Audit
190.5 / 190.5, kills 0/30 both. The fallback predicts no loss on this
shape (same code path), and the isolated measure confirms it exactly.

Note: the re-measured before baselines (268.5 / 190.5 in-test, 251.5 /
190.5 isolated) sit ABOVE spearvolley's published E4 numbers (232.5 /
157.5). The spearvolley proof test was removed with its revert, so its
exact total-damage field can't be re-read; the gap is either a
different damage field or base drift between `91650a90f` and this
arm's `a5d615880` (which folds in the volley-softened sizing arm). The
binding comparison is the same-test before/after on this base, which
shows no loss — recorded here so the next worker doesn't re-flag the
discrepancy as a regression.

## E5 — the confined-loss shape (measurement only, no threshold)

Machete + hunting spear + crude bow + 4 arrows (the ONE shape that
trades fold-in for volley):

| Beast | Before median total | After median total | Volley |
|---|---|---|---|
| Herald (700) | 307.5 | **255** | 0/30 → **30/30** (median volley dmg 14) |
| Audit (1200) | 190.5 | **167** | 0/30 → **30/30** (median volley dmg 26.5) |

The trade is real and confined: wb 33 → 26 costs more than the
volley gains on these beasts (−17% / −12% median total in-test; the
in-test numbers carry the same E1 order artifact as E4, so read them
as directional). No other shape pays it. Controls: spear-only volley
null 30/30, median total 159 / 101, slots ranged spear 30/30;
bow-only volley 30/30, median total 108.5 / 89.5 — unchanged by the
fix in either mode.

## Wild legs (guard + wall numbers, 8 seeds before/after × 2 bands)

Pilot band 99561–99568 (fresh — see prereg); confirm band 99581–99588
(fresh — see prereg). Competent policy verbatim, 150d death-aware,
finishersize driver. Before-legs ran on the unfixed code (the worktree
`equipment.js` reverted to the prereg-commit content, verified by the
proof test passing 57/57 in BEFORE mode before each before-leg; the
fix commit stayed HEAD, so per-seed JSONs carry anchorCommit
`36f98c32` on both legs — the worktree content, not the anchor, is
what differs, and the proof-test mode check is the record of it).
After-legs on the fixed code (proof test 64/64 FIXED mode re-run
before each after-leg). **The pilot before-leg reproduces the killed
first attempt's fixed-code numbers exactly on seeds 99561–99562**
(the first attempt ran the "before" leg on the committed fixed code
by mistake — `git stash` found nothing to stash; it was killed,
its 3 files deleted, and the leg re-run properly; see "What went
wrong mid-run") — the determinism anchor holds.

### Pilot band 99561–99568

| Measure | Before | After |
|---|---|---|
| Wave-4+ field fights | 67 | 67 |
| Volley-carrying rows (wave-4+) | 3 | 3 |
| Volley rate (wave-4+) | 4.5% | 4.5% |
| All-waves volley rows / rate | 71 / 8.9% | 71 / 8.9% |
| Field wave-4 kills | 2 | 2 |
| Wave-4 kills, all channels | 12 | 12 |
| Wave-5 kills | 3 | 3 |
| Below-break meetings / kills | 1 / 1 | 1 / 1 |
| Field-fighter deaths (vDie) | 7 | 7 |
| Scholar deaths | 73 | 73 |
| Starvation deaths (total / scholar) | 1 / 0 | 1 / 0 |
| Peak living veterans (sum over seeds) | 8 | 8 |
| End living veterans (sum) | 1 | 1 |
| Wave-4 unlock / wave-5 unlock | 8/8 / 2/8 | 8/8 / 2/8 |
| Median survival | 88d | 88d |
| Standing (sum over seeds) | 1779 | 1779 |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |

Seven of eight seeds are byte-identical ignoring the `run` field.
The eighth, 99567, differs in exactly three field fights (same days,
same outcomes, same aggregates): Jesse Cortez (searcaster + spear)
strikes harder — 67 → 82 on a wave-1 catfish, 64 → 79 and 67 → 84
on a wave-3 Callback — because his wb rose 60 → 75 (melee spear 30
+ ranged searcaster 120, where before the spear sat in ranged and
the melee slot was empty), and a committed finish fires on the
Callback fight that didn't fire before ("Jesse holds — The Callback
is two blows from falling, and they are still strong enough to
finish it. (Committed finish, two-blow)"). One downstream strike
value on Nasreen fell 52 → 22 (same R2 kill); its exact loadout cause
isn't visible in the corpus — most plausibly a knock-on through
loot/RNG state from Jesse's changed fight, since every other fight
in the seed is identical. Immaterial to every aggregate; recorded,
not waved through.

### Confirm band 99581–99588

| Measure | Before | After |
|---|---|---|
| Wave-4+ field fights | 66 | 80 |
| Volley-carrying rows (wave-4+) | 4 | **5** |
| Volley rate (wave-4+) | 6.1% | 6.2% |
| All-waves volley rows / rate | 90 / 10.8% | 78 / 9.5% |
| Field wave-4 kills | 2 | 2 |
| Wave-4 kills, all channels | 14 | **15** |
| Wave-5 kills | 0 | 0 |
| Below-break meetings / kills | 4 / 2 | 3 / 1 |
| Field-fighter deaths (vDie) | 10 | 9 |
| Scholar deaths | 81 | 76 |
| Starvation deaths (total / scholar) | 4 / 1 | 3 / 0 |
| Peak living veterans (sum over seeds) | 7 | 9 |
| End living veterans (sum) | 1 | 1 |
| Wave-4 unlock / wave-5 unlock | 8/8 / 1/8 | 8/8 / 2/8 |
| Median survival | 103d | 94d |
| Standing (sum over seeds) | 1671 | 1792 |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |

Six of eight seeds are byte-identical ignoring `run`. The two that
diverge both show the fix biting in the wild:

- **99583 (positive):** 127d village-lost → **150d survived**,
  standing 199 → 320, maxWave 4 → 5, w4field 10 → 25, scholar
  deaths 15 → 12, peak veterans 1 → 2. First divergence is day 93:
  Yara Haddad vs a Herald at 175/700 HP — before she flees (mDealt
  46), after she KILLS it (mDealt 182). The mechanism is the ally
  Nina: her strikes rise 29 → 44/47/45, which pins her wb rising
  from ~23 to ~40 (the strike windows `lroll([4+wb, 8+wb])` admit no
  other reading) — a spear moving from her ranged slot to her melee
  slot beside a real ranged weapon. A new wave-4+ volley row also
  appears on day 126 (Claudine vs the Eater, 2 shots / 1 hit / 21
  dmg) — it exists only in the diverged trajectory, so it is a
  trajectory artifact, not a demonstrated restored volley on an
  identical fight; the constructed proof (30/30) is what demonstrates
  the restoration.
- **99588 (mixed):** 100d → 62d village-lost, but w4kills 0 → 1 and
  scholar deaths 5 → 3. First divergence is day 11: Miguel Santos
  vs an Understudy — his strikes rise 19 → 22, 21 → 24 (wb up, the
  bow+spear shape), no ally help arrives, the fight runs 6 rounds
  instead of 4, and the village's whole trajectory re-rolls from
  there. Chaotic divergence cutting the other way; the aggregates
  are what the prereg judges.

### The confirm all-waves volley-rate dip, investigated

All-waves volley rate falls on the confirm band (10.8% → 9.5%,
90 → 78 rows) while the wave-4+ rows rise (4 → 5). Per-wave
bow-held rates (volley field non-null — a ranged weapon is equipped):
wave 1: 18.3% → 17.8%; wave 2: 22.8% → 21.2%; wave 3: 17.0% →
**20.6%**; wave 4: 32.8% → **34.0%**; wave 5: 25.0% → **33.3%**.
Bow-held rates ROSE at waves 3–5. Per seed, volley-fired counts are
identical on six seeds (0=0, 18=18, 17=17, 0=0, 6=6, 16=16); the
entire dip is seed 99588 (26 → 12) — the village that died 38 days
earlier after Miguel's changed day-11 fight, with 19 fewer fights
in total. This is composition/divergence, not a bow-seeking change:
per fighter the fix can only INCREASE bow equipping (a bow+spear
fighter goes from bow-unequipped to bow-equipped), and no
gear-acquisition channel predicts fewer bows. Same pattern class as
spearvolley's volley-rate investigation (composition-dominated at 8
seeds); the powered comparison that matters — bow-held at waves 3–5
and wave-4+ volley rows — moved the right way.

### Pooled (16 seeds)

Wave-4 kills 26 → 27; field wave-4 kills 4 → 4; volley rows
(wave-4+) 7 → 8; below-break meetings 5 → 4, kills 3 → 2; scholar
deaths 154 → 149; starvation 5 → 4; field-fighter deaths 17 → 16;
wave-5 kills 3 → 3; wave-5 unlocks 3/16 → 4/16; wins / national /
table 0 throughout; median survival 90d → 88d; max survival
137d → 150d; all-waves volley rate 9.9% → 9.2% (the 99588 dip,
investigated above).

### Cost bar (binds the GO — PASSES on both bands)

Starvation after ≤ before + 2: pilot 1 ≤ 3 ✓, confirm 3 ≤ 6 ✓
(scholar-only: 0 ≤ 2 ✓, 0 ≤ 3 ✓). Median survival after ≥ 0.8 ×
before: pilot 88 ≥ 70.4 ✓, confirm 94 ≥ 82.4 ✓. No cost-bar
breach.

## Sense-test read

**99563 d116, Nomvula vs the Cancellation (wave 5, after-leg).**
"Nomvula sees Big Loud coming and nocks an arrow — the fight opens
at range (4 shots)." Two honest misses ("the arrow buries itself in
the dirt. (spent)"), two hits for 15 and 19, "lowers the bow — Big
Loud is on them now. (2/4 hit)". Contact strikes of 18 and 17
against a 1600-HP beast, a shout for help, Wei charges in, and a
sensible flee at 21 HP: "Nomvula is losing — shouts for help! Wei
charges in!" … "they run while running still works." A real fight,
honestly narrated; the bow's identity, not a system trick. Identical
in both legs.

**99583 d93, Yara vs the Herald (wave 4, after-leg).** Yara walks
in open-handed and it goes wrong ("It doesn't want peace. They're
exposed, off-balance. (Walk In — failed)"), takes the hits, shouts
for help, Nina charges in and hits harder than before, and the
Herald — wounded past its line — "holds its ground. It is not
leaving. (Committed)" — until Yara lands the last blow at 0 left.
The fix's one wild kill reads as two people holding a line together,
not as a numbers change.

**99583 d126, Claudine vs the Eater (wave 4, after-leg).** "Claudine
sees Big-Eyes coming and nocks an arrow" — 2 shots, 1 hit for 21 —
then holds the line twice ("Claudine holds the line — they know how
this one is fought, and have not had their turn to prove it.") before
a 33-damage Smack-Rush ends her at 0 HP. She dies proving it. The
fight is coherent and consequential; the volley is an opening, not
the fight.

**99588 d11, Miguel vs the Understudy (wave 2, after-leg).** Miguel
opens with two honest misses, reads the fight ("Brawler's Instinct:
+2 speed"), and kills it alone in six rounds where before Catalina
helped finish it in four. Nobody's lines contradict themselves; the
difference is the fight's shape, not its sense.

## Village assessment (plain words)

Sixteen villages, same seeds, one slot rule changed. Fourteen of
them are unrecognizable only in the sense that nothing changed at
all — same days, same deaths, same standing, down to the last
fight-log line. The rule only bites where a fighter carries both a
spear and a bow, and in these villages that shape is rare: it showed
up clearly in two villages out of sixteen. In one, a fighter's ally
hit hard enough to turn a flee from a Herald into a kill, and that
village lived out the full 150 days instead of dying on day 127. In
the other, a fighter hit harder on day 11, the fight ran two rounds
longer without help, and the village's whole story re-rolled — it
died sooner, but with one more big-beast kill and fewer scholar
deaths. The villages killed one more wave-4 beast between them than
before (26 to 27), lost five fewer scholars (154 to 149), and nobody
reached national rank, nobody sat at the table, nobody won — same as
before, on both bands. The chain still binds at wave-4 kills and the
climb past regional. What this run filled in is narrower and exact:
the bow's opening shot now fires for the fighters who carry a bow
and a spear, the spear no longer quietly adds half its strength to
every close-in blow for the fighters who don't, and the damage the
common machete-and-spear fighter deals is untouched.

## Wall numbers (national / table / wins, wave 4–5, median survival)

Pooled 16 seeds, before → after: won 0 → 0, national 0 → 0, table
sittings 0 → 0, wave-4 unlock 16/16 → 16/16, wave-5 unlock 3/16 →
4/16, wave-4 kills 26 → 27, wave-5 kills 3 → 3, field wave-4 kills
4 → 4, scholar deaths 154 → 149, median survival 90d → 88d
(pilot 88 → 88, confirm 103 → 94). No win movement either way; the
kill movement is +1 pooled with the mechanism shown (99583's
Herald kill), and the survival movement is chaotic divergence
(99583 +23d, 99588 −38d), not a lever effect on the aggregates.

## Metric review (§14a)

- The pre-registered primary (constructed E1 volley restoration)
  PASSED decisively (30/30 both beasts, median volley dmg 14 / 26.5,
  slots 30/30). E4 PASSED (277.5 / 190.5 vs bars 209.3 / 141.8; the
  isolated re-measure is fixed ≡ before exactly). The wild guard
  PASSED on the pilot band (wave-4 kills 12 = 12) and pooled
  (26 → 27). The volley-row guard PASSED on both bands (pilot 3 = 3,
  confirm 4 → 5). The cost bar PASSED on both bands. The verdict is
  GO under the prereg's own binding sentences.
- The confirm band's all-waves volley rate MISSES its pre-registered
  bar (10.8% → 9.5%) and is NOT re-scored away: it is reported here
  as a caveat with the investigation (single-seed chaotic divergence,
  bow-held rates rising at waves 3–5, per-fighter the fix can only
  increase bow equipping). The prereg binds the verdict to the pilot
  GO and sets no separate GO threshold for the confirm band; the
  confirm's role is replication, and it replicates the kill guard,
  the volley-row guard, and the cost bar. A future run that wants a
  tighter read on the wild volley rate needs a bigger band or a
  corpus that records fighter loadouts per fight (the current
  instrument doesn't — Nina's exact inventory had to be inferred
  from strike windows, which is arithmetic, not a record).
- The E4 baseline discrepancy (re-measured 251.5 / 190.5 isolated vs
  spearvolley's published 232.5 / 157.5) is recorded above; the
  binding comparison is same-test before/after on this base.
- The pilot's flatness is stronger than "flat": 7/8 seeds are
  byte-identical ignoring `run`. The fix is engine-proven and, on
  this band, wild-invisible except where the bow+spear shape occurs —
  which the confirm band then showed (2/8 seeds diverging with
  mechanism). Fixed-by-construction with field confirmation, not a
  lever failure.
- If a future arm wants the wild effect larger, the lever is not this
  slot rule — it is bow+spear acquisition (how often fighters end up
  carrying both), which this run shows is the rare shape.

## Findings for the backlog

- SPEAR-IN-RANGED-SLOT (open, 2026-11-09 — CLOSES as fixed, pending
  landing): the fallback is built, proven (volley 30/30, E4 preserved
  exactly in isolation) and measured GO in the wild (wave-4 kills
  26 → 27 pooled, no cost-bar breach, mechanism shown in the wild
  on 99583). The one-line fix stays reverted; the fallback is the
  shape that lands. Remaining known gap: manual UI equip of a spear
  still routes to the ranged slot (slotForItem, context-free) — a
  separate arm if Steve wants it.
- MANUAL-SPEAR-EQUIP (open, 2026-11-10 — surfaced by this arm):
  game.js:13510 equips through `slotForItem`, which is context-free,
  so a player manually equipping a spear gets the ranged slot while
  auto-equip gives melee-when-a-bow-is-carried. The two paths disagree
  by design (this arm's scope); unifying them needs the manual path
  to read the carrier's inventory. Not a defect in the landed rule —
  auto-equip is what sims, gear-up, and field fights use.
- SPEARXBOW-CORPUS-STALE (open, 2026-11-10 — carried, not this arm's):
  scripts/test-spearxbow-20261031.js still runs 25/27 on this branch
  (same 2 failures as on the base — the determinism gate vs the
  2026-10-31 anchor). This arm does not move it either way; the
  corpus still needs re-anchoring + regeneration under current
  master, or the anchor rule revisited.

## What went wrong mid-run (process notes, for the coordinator)

- **First before-leg ran on the FIXED code.** The fix was already
  committed (36f98c32), so `git stash push -- src/js/equipment.js`
  reported "No local changes to save" and the driver ran 3 seeds on
  fixed code under RUN=meleefirst-before. Caught at the poll (the
  stash message in the output), killed, the 3 files deleted, and the
  leg re-run properly with the worktree file overwritten from the
  prereg commit (`git show 86358a49:src/js/equipment.js > ...`) and
  verified by the proof test in BEFORE mode (57/57) before each
  before-leg. The killed attempt's numbers were discarded, not used.
  Lesson for the next arm: when the fix is already committed, a
  before-leg needs the worktree file reverted by content, not by
  stash — stash only works on uncommitted changes.
- **Index clobber hit on both safe-commits** (prereg 86358a49 and
  fix 36f98c32): files showed staged-as-deleted while byte-identical
  to HEAD. Repaired both times from HEAD with `git ls-tree HEAD -r
  -- <paths> | git update-index --add --index-info`; status + diff
  verified clean after each repair. The commits are correct; only
  the main index lied.
- **Seed-band grep scope:** the first full-tree `grep -r evidence/`
  probe never finished in 3+ minutes (JSON corpora); killed it and
  ran the skill's named scopes instead (all 698 preregs, all
  `evidence/**/*.md`, filenames). Band 99561–99568: zero hits
  everywhere. Band 99581–99588: the single `*.md` hit is a git SHA
  fragment (`d0199585e`), not a reservation.

## What was NOT touched / NOT landed (guardrails)

- `src/js/equipment.js` only (67 lines changed, +61/−6). No volley
  formula change, no `wb` fold-in change, no `mBreak` change, no
  rounds-cap change, no contact-finish change, no gate / price / deed
  / readyDemand / win-price change.
- No [needs-eyes] (nothing player-facing ships in this arm's scope;
  the slot rule changes no UI text, only which slot auto-equip
  picks).
- The `/tmp/e4-isolated.js` probe is NOT committed (diagnostic only).

## Commits (this branch)

- `f94578ee0` — prereg (committed BEFORE any judged computation;
  safe-commit index clobber hit, repaired from HEAD; rebased from
  86358a49 onto 4b284599b by the adoption run)
- `2b0296ace` — the fix + proof test (E1 30/30, E4 preserved, 64/64
  fixed / 57/57 before; safe-commit index clobber hit, repaired
  from HEAD; rebased from 36f98c32 by the adoption run)
- `69184875c` — adoption fix: ontology (code:) citations for the
  three new slot-rule helpers (comment-only; fixes
  test-foodpower-20261014.js)
- `ee30f22a` — adoption fix: sync docs/ONTOLOGY.md with the new slot
  rules (validator-generated, pairs with the citation fix)
- (measurement commit — this file + 32 per-seed JSONs, committed by
  the adoption run; hash in the coordinator evidence
  sim-meleefirst-b-adopt.md)

## Corpus

- evidence/2026-11-10/perseed-meleefirst-b/fs-s9956{1..8}-meleefirst-before.json (8 files)
- evidence/2026-11-10/perseed-meleefirst-b/fs-s9956{1..8}-meleefirst-after.json (8 files)
- evidence/2026-11-10/perseed-meleefirst-b/fs-s9958{1..8}-meleefirst-confirm-before.json (8 files)
- evidence/2026-11-10/perseed-meleefirst-b/fs-s9958{1..8}-meleefirst-confirm-after.json (8 files)
- Tooling: scripts/test-meleefirst-b.js (proof test, dual-mode);
  scripts/spearvolley-analyze-20261110.js (reused unchanged);
  scripts/finishersize-driver-20261106.js (reused unchanged).

## Convergence state

- Finding SPEAR-IN-RANGED-SLOT: mechanism proven fixed by
  construction (volley 30/30, median dmg 14 / 26.5), damage preserved
  (E4 isolated fixed ≡ before exactly), wild effect measured GO
  (wave-4 kills 26 → 27 pooled, cost bar passes both bands, mechanism
  shown in the wild). Status: fixed, pending landing (coordinator
  merges; the fix is committed on this branch, `36f98c32`).
- Balance panel (§15): not run. The panel runs its own full panel and
  takes no corpus input (same precedent as grind-a, finishersize-a,
  adopt-a, vetfinish-b, spearvolley-b); the pre-registered comparison
  is the identical-seed corpora + the constructed rates. No compare
  .md fabricated.
- Telemetry: `scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-10/perseed-meleefirst-b/*.json' --metrics
  national,table,wins,exiled` REFUSED — "refusing recorder-corpus
  input: all 32 --current rows carry top-level anchorCommit". Recorded
  as the result, same as grind-a / finishersize-a / adopt-a /
  vetfinish-b / spearvolley-b. The baseline was NOT reseeded.

## Check status

- Proof tests: meleefirst 64/64 FIXED mode, 57/57 BEFORE mode
  (dual-mode, re-run before each leg to verify the worktree state).
  Re-run post-rebase by the adoption run (Loop B 0930Z): 64/64 FIXED,
  all numbers reproduce exactly.
- test-spearxbow-20261031.js: 25/27 GREEN — identical to the base
  (the 2 failures are the pre-existing stale-anchor det-gate, see
  SPEARXBOW-CORPUS-STALE). This arm does not move it. Re-run
  post-rebase by the adoption run: still 25/27.
- `node scripts/check.js --quick` on the rebased branch (adoption run,
  Loop B 0930Z): run 1 — 291 passed, 9 failed in 925s; run 2 (full
  output captured to /tmp/meleefirst-checkquick-2.log) — 292 passed, 8
  failed in 864s. Attribution (each failure re-run individually
  against base equipment.js): 6 fail identically on the base —
  godpath/test-measurement-proof-update.js +
  test-measurement-workflow.js (stale neutrality proof, documented
  2026-10-29 in the tracker header), test-mobile-combat-cadence.js,
  test-occupation-panels.js, test-phone-frame-proof.js (stale phone
  receipts), test-establishment-r20-fixes-20261020.js (racks-full
  voice gate) — all pre-existing, none equipment-adjacent;
  test-trust-observer-neutrality.js timed out at 120.1s under three
  concurrent check.js runs and passes solo in 19s on base AND on the
  fixed code (contention artifact, not a failure); ONE failure was
  arm-attributable — test-foodpower-20261014.js failed on the fixed
  code (its ontology step: the three new helpers lacked (code:)
  citations) and passed on base code. Fixed in adoption commits
  69184875c (comment-only citations) + ee30f22a (validator-generated
  docs/ONTOLOGY.md sync): after the fix, validate-ontology.js passes
  ("All 135 systems validated"), foodpower 30/30, proof 64/64,
  trust 6/6.
