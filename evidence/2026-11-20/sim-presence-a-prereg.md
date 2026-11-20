# sim-presence-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-presence-a · **Loop A run:** fleshout-20261120T1315Z
**Type:** BUILD + measure — the PRESENCE lever for finding #2599
(finding #2625, the topmost named scale-onramp blank)
**Frozen:** 2026-11-20 ~13:55 UTC, before any judged sim.
**Branch:** `sim-presence-a` (worktree
`~/workspace/worktrees/sim-presence-a`). **Base:** master
57b085a44 (verified with `git rev-parse HEAD` before any work).
**Builds on:** `evidence/2026-11-20/sim-cellgate-a.md` (NO-GO kind
PARTICIPATION) and `evidence/2026-11-20/sim-cellgate-a-prereg.md`,
plus `evidence/2026-11-20/sim-gunrate-a.md` (NO-GO kind
PARTICIPATION) and `evidence/2026-11-20/sim-gunrate-a-prereg.md`.

## The question (finding #2599's named next lever)

The cellgate verdict, verbatim: "the gate did exactly what it was
built to do. Holder cell-days rose 58 → 182 (zero-days fell 119 →
12); four of five holders kept their cells to the end of their
holder window, and the fifth spent his on a wave-4 volley (§6).
Armed-holder entries rose 0 → 2, and bar 3 passes with the first
armed wave-4+ searcaster volley in this finding's history (Lautaro,
day 117, 2 shots, 1 hit, 67 damage, vKill — §7). But the armed-entry
pool is thin: in 8 seeds the holders walk into a wave-4+ fight
carrying cells exactly twice. Bar 2's floor (≥ 3) misses by one
entry. The binding constraint has moved again — from cell survival
(fixed by this arm) to holder PRESENCE at wave-4+ fights. The next
lever for finding #2599 is lead-side / presence-side (get the armed
holder into the wave-4+ fights, or the gun to the fighters already
going), not more supply and not a wider gate."

Cellgate control corpus (the armed leg, GUNRATE=1 + CELLGATE=1,
band 107051–107058, 150d, competent): holder-days **194**,
cell-days **182**, armed-holder entries **2**, armed volleys **1**,
median survival **146d**. The two armed entries: Lautaro LEADS a
wave-4 fight (expedition-holder lead) and fires the volley; naran
enters as an ALLY while the lead dies in round 1. Victor and yuki
carry loaded guns 51 and 39 days to their villages' losses without
ever entering a wave-4+ fight armed.

## The mechanism (frozen, from code read — not a sim)

Wave-4+ fight leads arrive three ways (fusioncell-participation-a
diag, band 107031–107038, 125 meetings): world-tick **61 (49%)**,
expedition-holder **34**, aid **30**. The world-tick lead is the
biggest single pool and the only one this arm touches:

- `villagerMonsterTick` (`src/js/game.js` ~21090): for each living
  world monster not on the player's tile, the villagers on the
  monster's tile are `npcIds` (roster, not sheltered, not
  post-flee resting); `if (Math.random() > 0.5) continue` (not
  every tick is a bloodbath); the lead is the uniform-random pick
  `npcIds[Math.floor(Math.random() * npcIds.length)]`, then
  `resolveWildMonsterEncounter(vid, m)`. The armed holder leads a
  world-tick fight only when the random pick lands on them — one
  chance among whoever happens to share the tile.
- The expedition-holder lead already belongs to the holder when
  the holder launches (they lead their own expedition fights) —
  nothing to fix there. The aid lead is the villager in crisis —
  not a pick, nothing to weight. So the world-tick pick is the
  lever's whole surface.
- The volley is lead-only (`fieldFights.js` volley block reads the
  LEAD fighter's equipped ranged weapon + their own ammo). An
  armed holder entering as an ALLY never fires — ally presence
  helps bar 2 (entries) but never bar 3 (volleys). The lever must
  move the holder into the LEAD seat, not just into the fight.
- Earshot is already a game rule: `villagerFightAllies`
  (`src/js/party-wiring.js`) answers from the fighter's node and
  ADJACENT nodes (Chebyshev distance ≤ 1, "in earshot"). The
  draft below uses the same earshot distance — a holder a tile
  away can already hear the fight and answer it as an ally; this
  arm lets them answer it as the lead.

## The design (frozen; my call, Steve can overrule)

**PRESENCE=1** (default OFF). **One shape only: the ARMED-HOLDER
DRAFT (shape (c) — holder-lead weighting).** In
`villagerMonsterTick`, after the 0.5 coin flip passes (a fight is
happening) and when the monster's wave is **≥ 4**: if a living
armed searcaster holder is on the monster's tile or an adjacent
tile, that holder LEADS the fight instead of the uniform-random
pick. On-tile holders first (roster order), then adjacent holders
(roster order). If no armed holder is in earshot, the old pick
stands exactly as before.

An **armed holder** for the draft (deterministic reads, zero RNG):
a roster villager (never the scholar, `villagerId` excluded) whose
equipped ranged weapon — `S.equipment.rangedWeaponOf(vp, items)`,
the same read the volley block uses — is a `searcaster`, carrying
**≥ 1** `fusion_cell` in `items`, with village health **> 20**,
not sheltered, not post-flee resting. The draft helper is
`Game._presenceDraftLead(npcIds, m)` in `game.js` next to
`villagerMonsterTick`; it returns the drafted vid (plus where from:
`tile` | `adjacent`) or null, and the tick uses it only when
PRESENCE=1 and the monster's wave is ≥ 4 (wave read from
`data.monsters` by `m.id`). The 0.5 coin flip, the table-sanctity
return, the player's-tile skip, and the sheltered / post-flee
filters are all untouched — the lever acts only inside a fight
that was already going to happen, on a lead pick that was already
going to be made.

**NOT built here:** shape (a) (prize-recipient weighting toward
wave-4+ expedition leaders — the gunrate redirect already weights
expedition holders +8 and every gun reached a lead-weighted
villager; recipient identity is not the binding constraint) and
shape (b) (gun lend/pass at launch — a transfer with a return,
a death-of-borrower sink, and a second mechanism to prove; if
the draft fails on contact, the lend is the named next shape).
No bigger bundle, no cell resupply route, no village craft for
cells — cells are alien tech.

**No new narration.** The encounter's own narration names the
lead (`resolveWildMonsterEncounter` / `fieldFightSummary`), so a
drafted holder reads as the lead in the fight record itself. The
sense test reads those records; a draft that needed a special
announcement to be legible would be the wrong shape.

## Control substrate (rebuilt, not re-argued)

The gunrate + cellgate code is reverted on master (0 GUNRATE /
CELLGATE refs in `src/`), so this arm rebuilds BOTH as its control
substrate, recovered from the gunrate + cellgate preregs, the proof
tests (`scripts/test-gunrate-a.js`, 39 assertions;
`scripts/test-cellgate-a.js`, 12 assertions), and the searsupply
lever commit (`6c4b75925`, the `_searSupplyFighter` / bundle /
cell-weight template):

- **GUNRATE=1:** searcaster weight 4/18 in the tier-4 contest
  pool + expedition-holder redirect (`_gunRateFighter`: current
  expedition +8, launches +2 each capped +8, wave3Kill +4,
  wave2Kill +2, contestWin +1 each, roster-order tie-break; own
  eligibility, NOT contestEligible) + 2-cell bundle with the gun.
- **CELLGATE=1:** wave-gated volley — a searcaster lead holds fire
  below wave 4 (0 shots, cells kept, hold line), fires wave 4+ as
  before; other weapons untouched; a cell-less searcaster still
  says "no fusion cells".

The control leg runs GUNRATE=1 + CELLGATE=1; the arm leg runs
GUNRATE=1 + CELLGATE=1 + PRESENCE=1. The two legs differ ONLY by
PRESENCE. The control must reproduce the cellgate ARMED-leg corpus
exactly (holder-days 194, cell-days 182, armed entries 2, armed
volleys 1, median 146d) or STOP and diagnose — do not judge
against a drifting control.

## Draw-neutrality (stated honestly, not waved through)

- The SUBSTRATE (gun weight / redirect / bundle) adds ZERO
  `Math.random()` calls on either leg — the gunrate proof test's
  draw-count assertions (2 draws `rollAlienLoot`, 3 draws
  `_cxItemPrize`, identical on both legs) are re-run against the
  rebuild and must still pass. The gate adds zero draws to the
  prize path; its skipped volley draws are the mechanism,
  disclosed in the cellgate prereg.
- The DRAFT adds zero `Math.random()` calls: the holder scan is
  deterministic reads (`npcsOnNode` / `npcNode` / `rangedWeaponOf`
  / health / sheltered / post-flee). When the draft fires, the
  pick's ONE draw (`Math.floor(Math.random() * npcIds.length)`)
  is skipped — that is the lever's mechanism (the holder steps
  forward instead of the village drawing lots for the lead), not
  a silent shift. When it does not fire, the pick is exactly as
  before. The proof test asserts the pick draw is consumed
  off-leg and skipped on-leg on the draft fixture.
- The guardrail stays exposure-normalized, so any downstream
  divergence is judged on deaths per engaged meeting, not raw
  counts.

## Primary metric (BINDING, §14)

**GO iff ALL FIVE hold on the band (8 seeds, two legs, identical
seeds, panel §15):**

1. **Searcaster-holder-days floor:** villager searcaster-holder-days
   (arm) ≥ 40. (Cellgate arm: 194. The substrate rebuild must
   reproduce the gun rate; a miss here is a SUPPLY finding about
   the rebuild, not the draft.)
2. **Armed-holder entries floor:** wave-4+ fight entries with a
   searcaster holder carrying ≥ 1 cell (any participant, arm) ≥ 3.
   (Cellgate arm: 2 — the bar this arm must clear by one.)
3. **Armed volleys FIRED ≥ 2:** volleys FROM a searcaster in a
   wave-4+ fight (lead `rangedId === 'searcaster'` AND
   `volley.shots > 0`, arm). (Cellgate arm: 1. The draft must
   produce a SECOND armed volley, not just repeat Lautaro's.)
4. **No-regression guardrail, EXPOSURE-NORMALIZED, STRICT:**
   deaths per engaged wave-4+ meeting (arm) ≤ control (no 10%
   allowance this arm — the draft puts the best-armed fighter in
   front of the hardest beasts, so it must not cost lives);
   AND median survival (arm) ≥ 0.80 × control. Deaths per
   engaged meeting is the binding guardrail number.
5. **Starvation guardrail:** villager starvation deaths (death
   rows with cause `starvation`, arm) ≤ control + 2. (Gunrate
   §10: 4 arm vs 3 ctl starved — a small number, watched. The
   draft must not starve the village by pulling its fighters
   into the wild.)

**Verdict ladder (frozen):**
- **GO** = all five bars hold → the lever lands (substrate +
  gate + draft, one commit, `[needs-eyes]` — the prize redirect
  is a feel change and the draft changes who leads a fight).
- **NO-GO** = any bar misses → the game code is REVERTED before
  commit (substrate AND gate AND draft leave no trace);
  instrument + evidence commit only. The kind is recorded
  (supply miss vs participation miss vs guardrail miss) and the
  coordinator decides the next lever.
- A NO-GO on bar 1 is a SUPPLY finding (the rebuild did not
  reproduce the gun rate — investigate the pool, do not just
  raise the weight blind). A NO-GO on bars 2–3 with bar 1
  passing is a PARTICIPATION finding (holders arrive armed but
  the draft never fires — the next lever is the lend, shape (b),
  not a wider draft). A NO-GO on bar 4 or 5 alone is a GUARDRAIL
  finding.

## Secondary metrics (supporting, never re-scored)

- (a) Presence pool (`v4tickPresence` rows, arm vs ctl): wave-4+
  world-tick fights where an armed holder was on the monster's
  tile / on an adjacent tile / nowhere near; drafts by source
  (tile vs adjacent); drafted fights' outcomes (vKill / vFlee /
  vDie) vs undrafted armed entries. If the pool is empty (no
  armed holder ever in earshot of a wave-4+ tick), bars 2–3 fail
  honestly as a no-contact finding — the draft never had a
  chance to fire.
- (b) Armed leads (armed holder IS the lead — counter FIXED this
  arm, finding #2622, see §Instrument); armed volleys with
  damage; "no fusion cells" log lines; gate-held counts (arm)
  vs low-wave burns (ctl); searcaster departures with/without
  cells.
- (c) Gun transfers + vanishes (`v4transfers` rows, finding
  #2624): every inter-villager gun move the daily census can
  see (holder A → holder B between census days, with the
  attribution the grant/kill-loot/corpse-take events support),
  and every gun that leaves all known hands with no recorded
  sink (the catalina_reyes day-93 vanish, repeated exactly on
  both cellgate legs).
- (d) Wall numbers every run: national / table / wins, wave-4
  and wave-5 unlocks, median survival, per seed. Table: not
  instrumented by this driver — reported as null, never faked.
- (e) Sense-test notes from transcripts (SENSE-TESTING LAW —
  read the fight logs; does the drafted holder read as a
  fighter stepping forward with the village's best weapon, or
  as the village shoving its gun-carrier at the monster? does
  the second armed volley read as the payoff?).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the diag, fix,
  participation, searsupply, gunrate, and cellgate bands, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds: 107051, 107052, 107053, 107054, 107055, 107056, 107057,
  107058 — REUSED band, per the task** (paired before/after on
  identical seeds, one flag apart). The control leg is a FRESH
  run on this band with the rebuilt substrate (GUNRATE=1 +
  CELLGATE=1); the cellgate legs are historical context only,
  never the paired control — the two legs of THIS arm differ
  ONLY by PRESENCE.
- **Policies:** competent verbatim. **Substrate:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
  SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1` (same band as gunrate
  and cellgate). **Two legs differing ONLY by PRESENCE** (ctl
  GUNRATE=1 CELLGATE=1, arm GUNRATE=1 CELLGATE=1 PRESENCE=1).
  SEARSUPPLY, BOWCRAFT, FUSIONCELL unset on both legs.
- **Instrument:** `scripts/presence-driver-a.js` (clone of
  `scripts/gunrate-driver-a.js` — all cell / searcaster census
  + grant wraps + lead-rule + flee-cause instrumentation kept
  verbatim — with `GUNRATE=1` and `CELLGATE=1` REQUIRED on both
  legs, `PRESENCE` in the summary row, plus a `v4tickPresence`
  recorder: every wave-4+ world-tick monster row logs day /
  mid / wave / tile / armed-holder presence (on-tile /
  adjacent / absent) / drafted vid + source, recorded by a pure
  read wrap on `villagerMonsterTick`; plus a `v4transfers`
  detector: the daily census diff that names gun moves and
  gun vanishes); analyzer `scripts/analyze-presence-a.js`
  (clone of `scripts/analyze-gunrate-a.js`, same frozen bars
  with bar 3 at ≥ 2, guardrail at 1.00× + starvation bar,
  PLUS the armedLeads fix — see §Instrument — PLUS presence
  and transfer stats); proof test `scripts/test-presence-a.js`
  (the draft fixtures + a live drafted-lead volley on the
  encounter-gear fixture, failing on old code); substrate
  proofs re-run unmodified: `scripts/test-gunrate-a.js` (39/39)
  and `scripts/test-cellgate-a.js` (12/12) against the rebuild.
  **§15 panel:**
  `scripts/build-presence-panels-a.js` (clone of the cellgate
  panel builder, two legs) + `node scripts/balance-panel.js
  compare`; the compare .md is attached to the evidence file.
  The panel is the instrument, the pre-registered threshold is
  the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** the gunrate/cellgate bands saw 172–231 wave-4+
   meetings (engaged 123–191) on 8 seeds. The armed-entry floor
   (≥ 3) and the volley bar (≥ 2) are sized well below either
   pool — IF the new band behaves like it. The draft's own
   contact pool (armed holder in earshot of a wave-4+ tick) is
   UNKNOWN until the pilot measures it — the `v4tickPresence`
   rows are the measurement, and an empty pool is a finding,
   not a metric error (see secondary (a)).
2. **Pool sizing:** bars 1–3 are counts, so they are powered by
   whatever pool arrives; bar 4 is a ratio, powered by the
   engaged meetings; bar 5 is a count with a +2 allowance.
   Expected gun grants ~6–7 per band at 4/18 (gunrate arm
   observed 6, cellgate arm 6); if the arm leg still grants ~1,
   bar 1 fails as a SUPPLY finding about the rebuild (see the
   ladder). If the band is quiet (few wave-4+ meetings), bars
   2–3 fail honestly as a supply/participation finding, not as
   a metric error — the floors are the power guard.
3. **Mechanism pre-check (frozen, not a sim):** the proof tests
   (`scripts/test-gunrate-a.js` 39/39 + `scripts/test-cellgate-a.js`
   12/12, GREEN before the pilot) prove the rebuilt substrate,
   PLUS `scripts/test-presence-a.js` (GREEN before the pilot)
   proves the draft on fixtures (on-tile draft, adjacent draft,
   no-holder old pick, unarmed holder not drafted, wounded
   holder not drafted, wave-3 monster not drafted, PRESENCE-off
   identity, drafted lead fires an armed wave-4+ volley) and the
   analyzer `--selftest` covers the judge shapes (GO, NO-GO per
   bar, incl. the 1.00× guardrail and the starvation bar).
4. **Draw-neutrality check (frozen):** the substrate adds ZERO
  `Math.random()` calls on either leg — verified by grep over
  the diff (`git diff -U0 | grep -c "Math.random"` on added
  lines must be 0, discounting the comment-only mention) before
  the pilot, and by the proof tests' draw-count assertions. The
  draft adds zero `Math.random()` calls (it only skips the
  pick's draw when it fires); its divergence is the mechanism,
  disclosed above, not a silent shift.
5. **Fidelity check (frozen):** control-leg seed 107053 corpus
  matches the cellgate-a ARM corpus for seed 107053 on every
  SIMULATION field (days, gameDays, endReason, deaths, samples,
  v4seeds, v4departs, v4gates, v4encounters, ammo rows, census
  rows, grant rows, win-plan stats) — excluding only the
  self-describing metadata that differs by construction
  (`arm`/`run`/`mode`/`leg`, `gameSha` — the rebuilt file carries
  a different comment header — `anchorCommit`, and the new
  `presenceOn`/`presencePresent`/`v4tickPresence`/`v4transfers`
  keys, which the cellgate corpus has no counterpart for), the
  per-process `seq` counters, and worktree paths inside string
  values (`frame`, `caller` — normalized to `<WT>`). If any
  simulation field differs, the rebuild is not faithful — stop
  and investigate before judging anything. (Seed 107053 had
  holder-days 0 on the cellgate arm leg, so the draft cannot
  touch it — the fidelity seed is presence-proof by
  construction.)

## Seed-band freshness check (frozen, before any judged sim)

Band 107051–107058 is REUSED deliberately as a paired
before/after on identical seeds — the same reuse the gunrate,
cellgate, depmat, searsupply, bowsee, and bowknow preregs record.
Searched: every `evidence/*/sim-*-prereg.md` (grep `107051`):
named in `evidence/2026-11-19/sim-searsupply-a-prereg.md`,
`evidence/2026-11-19/sim-bowsee-a-prereg.md`,
`evidence/2026-11-19/sim-bowknow-a-prereg.md`,
`evidence/2026-11-20/sim-gunrate-a-prereg.md`,
`evidence/2026-11-20/sim-depmat-a-prereg.md`, and
`evidence/2026-11-20/sim-cellgate-a-prereg.md`. No dedicated
forbidden/contaminated band list names this band (no such list
file exists in the goal `hidden_files/`; the only
"forbidden/contaminated" hits there are generic mentions in
unrelated notes). The band is NOT fresh — it is a paired
comparison, not a fresh band, by design: the control leg is a
fresh run that must reproduce the cellgate armed-leg corpus
exactly (§Fidelity), and the two legs of THIS arm differ only by
PRESENCE.

## Instrument FIRST (finding #2622 + finding #2624)

- **#2622 (armedLeads counter, MUST fix first):** in the
  analyzer clone, the `armedLeads` counter is incremented where
  armed entries are counted: in `participationStats`, inside
  `if (armedHere)`, add `if (armedLeadHere) p.armedLeads++`.
  (`armedLeadHere` is already computed per row —
  `pc.vid === r.vid` for a searcaster holder with cells — it was
  just never accumulated.) The selftest fixture's armed entry is
  an ALLY (nora leads with a bow; ally1 holds the searcaster),
  so its `armedLeads === 0` assertion stays correct after the
  fix; a new selftest row adds an armed LEAD and asserts
  `armedLeads === 1`.
- **#2624 (gun transfers, instrumented this arm):** the driver
  clone's daily census diff names gun moves: when the gun's
  holder changes between census days (A → B, both alive), a
  `v4transfers` row records day / from / to / attribution (grant
  / kill-loot / corpse-take event on the same day, else
  `unexplained`); when the gun leaves every known hand (no
  villager, scholar, or pile shows it) with its last holder
  alive, a `vanish` row records day / last holder. This arm's
  lever passes no gun between villagers (the holder keeps it),
  so the transfer instrument is the census-diff detector, not a
  lend hook — it answers the catalina_reyes day-93 vanish
  whether or not the draft lands.

## Canon note

`docs/CANON.md` (manifest) and `docs/CONTESTS.md` (§Prizes —
"Prizes feed EVERY progression lane"; "Loot tie-in: contest prizes
and monster loot share the alien-item pool"; "Extreme contests have
an earned apex opportunity; ordinary wins cap at tier3") were
consulted for this arm. **No canon doc covers the searcaster, the
contest-prize area specifically, or holder presence at fights** —
said here rather than inventing canon (same as the diag, fix,
participation, searsupply, gunrate, and cellgate arms). The prize,
grant, equip, volley, lead, expedition-holder, and world-tick
rules are cited from code (`contests.js` `_cxItemPrize`,
`game.js` `rollAlienLoot` / `alienLootGrant` /
`villagerMonsterTick` / `resolveWildMonsterEncounter`,
`equipment.js` `rangedWeaponOf`, `fieldFights.js` volley
~975–1060, `party-wiring.js` `villagerFightAllies`,
`villager-agency.js` `startExpedition` / `expeditionMonster` /
`agencyState`), not from canon. The draft is a design call (this
arm's, Steve can overrule): when the village's best weapon is
standing in earshot of the hardest beast, its carrier steps
forward — the village does not draw lots for who meets it.
