# sim-fusioncell-a — DIAG, finding #2599 (a searcaster that can never fire)

**Arm:** sim-fusioncell-a · **Loop A run:** fleshout-20261119T1415Z · **Type:** DIAG
**Verdict: DIAG-GO** — all three frozen bars hold (coverage 8/8, attribution
3/3 = 1.000, volley pool via the rare-rate path).
**Branch:** `sim-fusioncell-a` · **Base:** master 228ac0dd5 · **Band:** seeds
107021–107028, 150d, competent verbatim policy, substrate
SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1.
**Pilot only** — no 12–16 seed confirm in this run; the coordinator decides
the confirm from the verdict.
**Prereg:** `evidence/2026-11-19/sim-fusioncell-a-prereg.md` (frozen
2026-11-19 ~09:00 UTC, instrument-repair amendment ~09:45 UTC, before any
judged verdict was written).

## 1. The answer in plain words

Fusion cells do exist in this world, but almost nobody ever gets one, and
the one person who has the gun never gets a cell, and the people who get
cells never have the gun. Across eight villages living 150 days each:

- **One searcaster in eight villages.** chen_wei (seed 107023) won it as
  a contest prize on day 53 and carried it 97 days — with **zero fusion
  cells on every single one of those days**. He never once stood in front
  of a wave-4 or wave-5 monster while holding it, so the weapon never
  fired, and the honest "no fusion cells" warning never even had a chance
  to appear.
- **Three fusion cells in eight villages, all contest prizes.** One went
  to a villager with no cell-weapon, one to another villager with no
  cell-weapon, one to the scholar. The most any holder ever had at once
  was **one** cell. There is no recipe, no ruin salvage, no pile stock,
  no player craft, no monster-kill loot drop of a cell on this band —
  contests are the only way a cell entered the world, and contests hand
  them out rarely and at random.
- **The cell and the gun never meet a fight together.** The only cell
  holder who ever faced a wave-4+ monster is mia_andersson — who has no
  searcaster, so her cell can never fire. The searcaster holder never
  faced one. The scholar holds a cell and three searcasters in the pack,
  none of them equipped as far as the census can see.
- **The volley that never happens is worth about 98 damage** — roughly
  7–12% of a wave-4 monster's health (850–1500 HP). That is the ceiling
  of what the missing supply costs in any single opening volley. The
  cost is real but small; the scandal is not the damage, it is that the
  game's rarest weapon is a paperweight by construction.

Finding #2599 is answered: the searcaster cannot fire because cells
reach holders only as rare, random contest prizes, and the prize system
never puts a cell in the same hands as the gun before a fight that
matters. The fix arm is named in §9 — it is a design call about
alien-side supply, not a village craft, and it is NOT built here.

## 2. The frozen bars (judge)

| Bar | Frozen threshold | Measured | Result |
|---|---|---|---|
| 1. Holder census coverage | complete on all 8 seeds | 8/8 complete, census-day share 0.965–0.985, 0 instrument errors | PASS |
| 2. Acquisition attribution | ≥ 0.90 of cell appearances attributed | 3 appearances, 3 attributed (1.000) — all contest-prize | PASS |
| 3. Volley-opportunity pool | ≥ 5 engaged wave-4+ meetings with a 0-cell searcaster participant, OR the rare-rate conclusion | pool 0 engaged-zero, 0 armed, 0 all-zero — rare-rate path, stated as a finding | PASS (rare-rate) |

**Verdict DIAG-GO** — all three bars hold, with the rare-rate path for
bar 3 exactly as the prereg wrote it. No bar was re-scored mid-run.

## 3. The mechanism (frozen code-read, confirmed by the sim)

No canon doc covers fusion-cell supply, the searcaster, or cell-weapon
volleys (stated in the prereg rather than inventing canon). From data
and code, frozen before the pilot:

- **searcaster:** alien, lootTier 4, bonus 120, range 8, damageType
  energy, `weapon.ammo = fusion_cell`. **fusion_cell:** alien,
  lootTier 4, material, `findable: false`.
- **Recipe: NONE** (36 recipes, none for fusion_cell). **Ruin salvage:
  NONE** (fusion_cell in no region scavenge pool, all 20 regions).
  **Communal pile: NONE** (not a MAT_ID; pile max 0 on all 8 seeds).
  **Departure pocketing: NONE** (`villagerPocketAmmo` returns before
  the craft for any ammo other than arrow/bolt/stone). **Starting
  gear: NONE** (alien / lootTier > 2 filtered out).
- **Loot is the only in-code route** — `rollAlienLoot` tier-4 pool is
  15 items (4 alien tier-4 + 11 killItems[4]); a tier-4 drop is a cell
  with probability 1/15, and tier-4 drops themselves are rare (apex
  kills / taper-up: wave 2 5%, wave 3 10%, wave 4 15%, wave 5+ 20%).
- **The grant side (driver v2 correction):** `rollAlienLoot`'s grants
  reach holders through `alienLootGrant`, which has four callers —
  contest prizes (`_cxItemPrize`, tier 4 on extreme-risk + apex +
  25%), show gifts (`apWackyGift`, tier ≤ 3, so no cells), trade
  (`betrayal.js`), and player kill loot (corpse → scholar-only
  `_corpseTakeStack`). The v1 instrument wrapped only
  `villagerKillLoot` and could never see a contest prize, a show
  gift, a trade, or a corpse grant (see §8, instrument repair).
- **What the volley is worth** (fieldFights.js, frozen): up to 4
  shots, hit chance 0.37 + tracking, 64–68 damage per hit → an armed
  searcaster volley expects ≈ 4 × 0.37 × 66 ≈ **98 damage** against a
  wave-4 monster (HP 850–1500), roughly 7–12% of the monster. At 0
  cells the volley is `{shots: 0, hits: 0, dmg: 0}` with the log line
  "has Searcaster but no fusion cells — the string stays drawn,
  useless." The melee fold-in needs no cells, so the volley-loss
  cost is the opening volley only, bounded above by ~98.

## 4. Who holds cells, how many, for how long

Cell appearances after baseline (attribution denominator = 3, all
attributed, completeness 1.000):

| Holder | Seed | Day gained | Source | Held until | Max cells |
|---|---|---|---|---|---|
| gen_d7qxdld (starfall_bow holder) | 107024 | 142 | contest prize — pit | day 150 (9 days) | 1 |
| the scholar ("player") | 107026 | 76 | contest prize — pit | day 150 (75 days) | 1 |
| mia_andersson (no ranged weapon) | 107027 | 103 | contest prize — informant | day 150 (48 days) | 1 |

- Villager cell-holder-days: **57** (9 + 48). Scholar cell-days: 75.
  **Max cells ever held by anyone: 1.**
- Every appearance is independently corroborated twice: the grant
  wrap (`alienLootGrant`, caller contest-prize) AND the contest-prize
  log (same day, same winner, same contest id). 155 contest prizes
  band-wide; 148 alien-loot grants (the 7-prize residual is
  non-alien prizes, which never pass through `alienLootGrant`).
- **By source, band-wide:** contest-prize 3, monster-kill loot 0,
  show-gift 0, trade 0, corpse-take 0, player craft 0, recipe 0,
  ruin salvage 0, pile 0, starting/arrival gear 0. Player crafts 26
  (stone_knife 4, snare 21, bark_armor 1), 0 fusion_cell. Villager
  kill-loot drops: 0 fusion_cell, 0 searcaster — the only loot drop
  band-wide was 1 phase_sling. Corpse takes: 474, 0 cells. Pile
  cells: max 0 on every seed, every day.
- **Searcaster holders:** 1 — chen_wei, seed 107023, 97 holder-days,
  0 cell-days, max 0 cells. Searcaster departures: 0. No searcaster
  holder ever left the village with it, so the departure-pocketing
  path was never exercised either.
- **Searcaster grants band-wide: 4, all contest prizes** — 1 to
  chen_wei (107023 day 53, siege contest) and 3 to the scholar
  (107025 days 44 and 95; 107027 day 79). The scholar's three
  searcasters land in `state.scholar.inventory` (the pack); the
  scholar-kit read looks at the person object, so it never reports
  a ranged weapon on this band — the scholar's equip status for
  those three searcasters is **unmeasured by this instrument, not
  proven absent** (see §10, blanks). The scholar never shows any
  ranged weapon in any census row on any seed.

### The searcaster's own source (a window edge, not a mystery)

The analyzer's strict census window (prevRowDay, rowDay] marks
chen_wei's searcaster appearance (day 54) `unexplained`, because the
grant happened on day 53 — the same day as the last searcaster-free
census row, after that day's snapshot was taken. The grant trail
settles it: `alienLootGrant` searcaster → chen_wei, day 53,
caller contest-prize, AND the contest-prize log: day 53, who
chen_wei, contest `siege`, granted true. The same-day edge is a
diagnostic-label limitation of the frozen window convention, not a
missing source. Bar 2 counts **cell** appearances only, so the
verdict is unaffected; the searcaster's source is established by
two independent instruments.

### A prereg guess corrected

The prereg amendment's forensic guess — that the scholar's cell
"follows player kills (mirrormoth d75, drumbelly d76)" — is **wrong**.
Driver v2 proves the scholar's cell is the day-76 pit-contest
"player" prize, granted to the scholar with caller contest-prize.
The corpse-take path contributed 0 cells band-wide. The amendment's
guess was written before the grant instrument existed; the measured
fact replaces it.

## 5. Volley opportunities lost

- Wave-4+ meetings: **85** (63 engaged). Average party size at entry:
  **2.98**; 93 party members carried a ranged weapon at entry.
- Meetings with a 0-cell searcaster participant: **0 engaged, 0
  armed, 0 total** (0 evaded). Volley fired from a searcaster: **0**.
  "No fusion cells" log lines: **0**.
- Why the pool is zero — the two halves of the story never overlap:
  - chen_wei held the searcaster days 54–150. Seed 107023's 8
    wave-4+ meetings all fall on days 145–148, fighter raj_patel —
    chen_wei is in **none** of them.
  - mia_andersson is the only cell holder who ever stood in a
    wave-4+ meeting: 6 meetings (days 104, 111, 112 ×2, 149, 150),
    holding her 1 cell each time — with **no ranged weapon at all**,
    so the cell can never fire.
  - The scholar's cell never appears in a wave-4+ meeting party row.
- **Volley-loss cost: unmeasurable on this band, bounded above by
  ~98 expected damage per opening volley** (frozen math, §3). Not
  zero damage in principle — a searcaster with cells would expect
  ~98 — but zero observed volleys, because the holder never meets
  the monster and the cell holders never hold the gun.

## 6. Wall numbers

| | |
|---|---|
| National | 0/8 |
| Table / wins | table not instrumented (null, never faked); wins 0/8 |
| Wave 4 unlocked | 8/8 |
| Wave 5 unlocked | 2/8 (107023, 107027) |
| Median survival | 143.5 days |
| Community lost | 4/8 (107021, 107022, 107025, 107028) |
| Scale rank | regional 8/8 |
| Starvation | 3 (2 villager) |

Per seed: 107021 137d village-lost w4 standing 199; 107022 104d
village-lost w4 standing 150; 107023 150d survived w5 standing 290;
107024 150d survived w4 standing 199; 107025 104d village-lost w4
standing 199; 107026 150d survived w4 standing 199; 107027 150d
survived w5 standing 365; 107028 85d village-lost w4 standing 199.
Wave-4+ meetings per seed: 32 / 0 / 8 / 0 / 15 / 4 / 22 / 4 = 85.

## 7. Sense testing (transcripts read, not just counted)

- chen_wei's day 53 is corroborated in the tale log: three
  `skill_used` rows, blood_trail in a field fight, outcome vKill —
  he was killing that day, and the siege contest prize followed.
  The weapon arrives with **no ceremony**: chen_wei speaks zero
  lines in the seed's veteran dialogue, no line marks the prize, and
  nobody in the village ever comments on the searcaster. The rarest
  weapon in the game enters the world silently and is then never
  used — the holder never mentions it, never takes it to a wave-4+
  fight, never leaves with it.
- The day-1 veteran lines read coherent as people: trust-gated
  refusals ("You haven't earned that yet", "Ask someone who trusts
  you"), a water run ("Thirst doesn't negotiate. Going."), an
  introduction ("Day one. Everyone's pretending they're fine.").
  The unnamed-villager voice ("A person, maybe 60s, with a
  burn-scarred forearm") repeats verbatim across lines — coherent
  but generic early-game placeholder voice, not a defect in this
  arm's scope.
- The "string stays drawn, useless" line never fires anywhere on
  the band — not because the code is wrong (the proof test fires it
  live at 0 cells), but because the holder never meets a wave-4+
  monster. The silence is the finding.

## 8. Instrument repair (v1 → v2) — disclosure

The first sweep ran clean (8/8 seeds, 0 errors, trajectories
reproduced arrowsupply bit-identically) but its attribution came back
0/2: the v1 instrument could not source any appearance. Forensics
found two defects, both in the instrument, neither in the game:

1. The `teleLoot` attribution branch was **dead**: the VF
   instrument's `teleRows` carries only veteran-relevant tele types,
   so no `loot_dropped` row can ever appear in it (0 rows across
   seeds despite teleCounts 20–28).
2. The v1 driver wrapped only `villagerKillLoot` (villager kills).
   The grant side of `rollAlienLoot` has four more callers the
   instrument never saw: contest prizes, show gifts, trade, and
   player kill loot via corpses.

Repair (driver v2, recorder-only, no game-code change): wraps on
`Game.alienLootGrant` (every grant, classified by caller stack),
`Game._cxItemPrize` (contest context), and
`Game._corpseTakeStack` (scholar corpse takes); the analyzer drops
the dead `teleLoot` branch, attributes from `grantEvents` +
`corpseTakeEvents`, and adds the scholar's cell series to the
attribution denominator. Bars, band, horizon, and policies are
untouched (prereg amendment ~09:45 UTC, before any judged verdict
was written).

**Determinism verified:** the v1 corpus was deleted and all 8 seeds
re-run with driver v2. Trajectories reproduce v1 bit-identically per
seed (days / endReason / standing / wave / v4encounters total 85) —
the repair changes labels only, never the game. Sweep v2: exit 0, 0
instrument errors (it ran slow under load, ~24 min for 8 seeds,
box load ~20). Proof test `scripts/test-fusioncell-a.js` **40/40**
(includes live `alienLootGrant` checks: grant to a villager lands in
their pack, to null lands in the scholar pack, to a corpse stays on
the body; plus the classifier/recipient fixtures). Analyzer
`--selftest` **27/27**.

## 9. Finding #2599 — exact update text for the coordinator

> **#2599 ANSWERED (sim-fusioncell-a, DIAG-GO, pilot 8 seeds
> 107021–107028, base 228ac0dd5).** chen_wei carried a searcaster 97
> days with zero fusion cells on every one — confirmed, and the
> supply picture is now measured: 3 fusion cells band-wide, ALL from
> contest prizes (pit ×2, informant ×1; max 1 per holder), 0 from
> monster-kill loot, 0 from show gifts, 0 from trade, 0 from corpse
> takes, 0 player crafts, 0 recipes, 0 ruin salvage, 0 pile stock.
> 4 searcaster grants band-wide, all contest prizes (1 to chen_wei,
> 3 to the scholar's pack). Volley-opportunity pool 0: the searcaster
> holder never met a wave-4+ monster, and the only cell holder who
> did has no cell-weapon. Expected armed volley ≈ 98 damage
> (7–12% of a wave-4 monster). Attribution 3/3 (1.000), coverage
> 8/8. **Next arm (fix, NOT built here):** put cells in searcaster
> holders' hands — a design call between raising the contest-prize
> tier-4 cell weight (or a dedicated cell prize) vs alien-side ruin
> salvage for cells. Cells are alien tech, so the source must be
> alien-side, never a village craft. The fix arm must prove, on a
> panel, a searcaster holder with cells actually firing a volley in
> a wave-4+ fight. Do not fold into bow/arrow work — different
> supply chain.

## 10. Blanks, limits, and what is NOT claimed

- **Pilot only, 8 seeds.** The coordinator decides any confirm.
  Rare-rate conclusions (pool 0, 3 cells, 4 searcasters) are thin by
  construction — the numbers are the finding, not a power claim.
- **Scholar equip status unmeasured.** The scholar won 3
  searcasters; they sit in the pack, and the census's scholar-kit
  read (person object) cannot see pack weapons — a live probe proves
  the grant lands in `state.scholar.inventory` while the kit read
  reports null. Whether the scholar ever equips one is unknown, not
  proven absent.
- **Searcaster window edge.** The analyzer's strict (prevDay, day]
  window marks chen_wei's searcaster `unexplained`; the grant trail
  + prize log prove it is the day-53 siege prize (§4). Proposed for
  the next run (not applied here): record intra-day ordering or
  widen the window to include prevDay grants.
- **§15 panel: built, compare BLOCKED by the write flap** (see
  below). `fusioncell-a-panel-before.json.gz` and
  `fusioncell-a-panel-after.json.gz` are written and intact; the
  compare output `fusioncell-a-panel.json` was truncated to 0 bytes
  by a refused write. By construction this is a zero-delta screen
  (single-leg DIAG, before == after is the same corpus) — but that
  claim is NOT verified until the compare runs clean after the flap
  clears. Do not cite the panel as run until then.
- **Telemetry:** `telemetry-check.js` REFUSED the recorder corpus
  ("all 8 --current rows carry top-level anchorCommit, so they are
  sweep recorder rows, not runs") — recorded, baseline NOT rolled,
  same as bowsource/arrowsupply.
- **Table:** not instrumented, reported as null, never faked.
- The prereg amendment's forensic guess about the scholar's cell
  (player-kill loot) is corrected in §4 — the measured source is a
  contest prize.

## 11. Metric review (§14)

- The frozen bars judged the run as written; no bar was re-scored.
  Bar 1 (coverage) is the load-bearing bar and passed cleanly. Bar
  2 (attribution ≥ 0.90) passed at 1.000 — the amendment's decision
  to add the scholar's series to the denominator was load-bearing:
  without it the denominator would have been 2 and the scholar's
  cell would have been invisible to the judge. Bar 3 took the
  rare-rate path as the prereg explicitly allowed; the pool floor
  (≥ 5) was a reporting bar, not a power bar, and the thin pool is
  reported as the finding, not re-scored.
- The metric that proved wrong was not a bar but a diagnostic
  label: the searcaster appearance's `unexplained` tag (§4) is a
  window-convention artifact. Proposed revision for the next run:
  attribute appearances with a window that includes prevDay events
  when the grant and the last clean census share a day, or record
  intra-day event order. The bar verdicts do not depend on it.
- The v1 attribution miss (0/2) was an instrument defect, not a
  metric defect: the frozen bars correctly refused to pass on an
  instrument that could not see the grant side, and the repair
  (not a re-score) is what moved the number.

## 12. Write flap — disclosure and recovery

A host write flap began ~15:47 UTC 2026-11-19, during the §15 panel
compare: `balance-panel.js compare` failed twice with `EPERM:
operation not permitted, write`, leaving
`evidence/2026-11-19/fusioncell-a-panel.json` at 0 bytes (a fresh
file — nothing was lost; the output is deterministically
regenerable from the intact before/after .gz files). The flap
probe (`git update-ref refs/heads/probe HEAD`) failed at 15:51,
~15:56, and ~16:08 UTC; a worktree heartbeat also failed with a
write `PermissionError` at ~15:56. Writes outside the repo
(`~/workspace/`) still work — the flap is scoped to repo paths.
Per the write-flap skill the run stopped writing and waited
instead of retrying; this evidence text was banked as a staging
copy under `~/workspace/` so the work is not lost if the session
ends before the flap clears.

**Recovery (run after the probe goes green):**

```
cd ~/workspace/worktrees/sim-fusioncell-a
git update-ref refs/heads/probe HEAD && echo PROBE-OK
node scripts/balance-panel.js compare --before evidence/2026-11-19/fusioncell-a-panel-before.json.gz --after evidence/2026-11-19/fusioncell-a-panel-after.json.gz --out evidence/2026-11-19/fusioncell-a-panel
# verify fusioncell-a-panel.json parses and shows zero deltas, then:
cp ~/workspace/sim-fusioncell-a-evidence-STAGING.md evidence/2026-11-19/sim-fusioncell-a.md
# strip the STAGING COPY banner (lines beginning "> STAGING COPY" through "place this text there verbatim...")
bash scripts/safe-commit.sh "sim-fusioncell-a evidence: DIAG-GO — fusion-cell supply is contest prizes only, pool 0" -- evidence/2026-11-19/sim-fusioncell-a.md evidence/2026-11-19/sim-fusioncell-a-prereg.md evidence/2026-11-19/fusioncell-a-analysis.json evidence/2026-11-19/fusioncell-a-panel-before.json.gz evidence/2026-11-19/fusioncell-a-panel-after.json.gz evidence/2026-11-19/fusioncell-a-panel.json evidence/2026-11-19/fusioncell-a-smoke.log evidence/2026-11-19/fusioncell-a-smoke.err evidence/2026-11-19/fusioncell-a-sweep.log evidence/2026-11-19/fusioncell-a-sweep.err evidence/2026-11-19/fusioncell-a-sweep2.log evidence/2026-11-19/fusioncell-a-sweep2.err evidence/2026-11-19/perseed-fusioncell-a-diag scripts/fusioncell-driver-a.js scripts/analyze-fusioncell-a.js scripts/test-fusioncell-a.js scripts/build-fusioncell-panels-a.js
# verify git status --short is empty afterwards (watch for the safe-commit index-clobber pattern)
rm ~/workspace/sim-fusioncell-a-evidence-STAGING.md ~/workspace/.fusioncell-flap-probe
```

## 13. Files

- Prereg: `evidence/2026-11-19/sim-fusioncell-a-prereg.md`
- Evidence (this file): `evidence/2026-11-19/sim-fusioncell-a.md`
  (staging copy: `~/workspace/sim-fusioncell-a-evidence-STAGING.md`
  until the flap clears)
- Analysis: `evidence/2026-11-19/fusioncell-a-analysis.json`
  (verdict DIAG-GO; bars census-coverage / attribution /
  volley-opportunity-pool all pass)
- Corpus (driver v2): `evidence/2026-11-19/perseed-fusioncell-a-diag/`
  (8 files, grantEvents 148, contestPrizes 155, 0 instrument errors)
- Logs: `fusioncell-a-smoke.log/.err`, `fusioncell-a-sweep.log/.err`
  (v1), `fusioncell-a-sweep2.log/.err` (v2)
- Instruments: `scripts/fusioncell-driver-a.js` (v2, grant wraps),
  `scripts/analyze-fusioncell-a.js` (v2, selftest 27/27),
  `scripts/test-fusioncell-a.js` (40/40),
  `scripts/build-fusioncell-panels-a.js`
- Panel: `evidence/2026-11-19/fusioncell-a-panel-before.json.gz`,
  `fusioncell-a-panel-after.json.gz` (compare output pending flap —
  see §12)
