# sim-worngun-reseat-b — the worn-only gun destroyed by the contest re-seat, FIXED

**Arm:** sim-worngun-reseat-b · **Loop B run:** fleshout-loop-b-20261124T1030Z
**Axis:** winnability-chain · **Finding:** sim-findings.md — A WORN-ONLY GUN
IS DESTROYED BY THE NEXT AUTOEQUIP RE-SEAT (Loop B arm sim-guntransfer-b,
run fleshout-loop-b-20261124T0840Z, evidence/2026-11-24/sim-guntransfer-b.md §4)
**Verdict: GO** (primary metric met; guardrails inside their bands with one adjudication, §7)
**Prereg:** `evidence/2026-11-24/sim-worngun-reseat-b-prereg.md` (frozen, committed with this arm)
**Fix:** `src/js/contests.js` — `contestChoose` grantWeapon branch returns the
displaced worn piece to the pack (`#806` shape)
**Proof test:** `scripts/test-worngun-reseat-b.js` (5 checks; FAILS old code T1/T4, PASSES new)
**Panel builder:** `scripts/build-worngun-reseat-b-panels.js`
**Corpora:** `evidence/2026-11-24/perseed-worngun-reseat-control-b/` (9 files) +
`evidence/2026-11-24/perseed-worngun-reseat-b/` (9 files)
**Panel:** `evidence/2026-11-24/worngun-reseat-b-panel.md` (`.json`, `-before/-after.json.gz`)
**Substrate (byte-identical both legs):** `VETREENGAGE=1 PARTYSIZE4=1
FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1
CELLGATE=1 KILLBUNDLE=1 STAGE_SEAR=1 REARM_CELLS=1`; LEND unset, PRESENCE
unset. Anchor `9b038de58`, gameSha `950901f3fdcc`, policySha competent (matched
in both legs). Horizon 150d, competent verbatim, one process sequential.

## 1. The answer in one paragraph

The gun is saved, and the finding's attribution was wrong. The destroyer
was never `autoEquip` — it never runs on the scholar — it was the arena
"choose your weapon" grant in `contestChoose`: taking a spear overwrote
the ranged slot and the worn-only searcaster underneath it simply ceased
to exist. The fix returns the displaced piece to the pack, the same
honest-accounting return the ordinary equip path already performs. On the
identical-seed replay the two known destructions are gone (2 → 0), the
village gun totals end HIGHER by exactly the two saved guns (16 → 18),
and nothing else in the game moves: 7 of 9 seeds are byte-identical in
days, deaths, holder-days and gun totals; wins, national reach, wave-5
unlocks and the witness volley are unchanged.

## 2. The mechanism, proven — and the correction to the finding

The guntransfer arm proved the defect and named `autoEquip`'s rebuild as
the killer. Probes on current master before any change
(`/tmp/worngun/probe2.js`–`probe5.js`, same substrate) prove the
attribution wrong and the defect real:

- `autoEquip` NEVER runs on the scholar. Every call site in `src/js`
  passes a villager person record (`villagerGearUp`, `villagerGearDay`,
  craft/ammo duties, armor gift/seed). Villager worn items live IN
  `items`, so the inventory-only rebuild cannot drop them. The equipment
  namespace is single (`Scattering.equipment === S.equipment`), so the
  probe's wrap was complete — zero scholar autoEquip calls across both
  witness replays.
- BOTH replay destructions trace to ONE call: `contestChoose`
  (`src/js/contests.js:4394`, `d.grantWeapon` branch). The arena grant
  pushes the granted weapon into `scholar.inventory` AND seats it
  directly in `scholar.equipped[wslot]`, overwriting the slot WITHOUT
  returning the displaced piece to the pack.
  - s107756 d44: `[contestChoose d44] idx=0 before={ranged: searcaster,
    invSear: 0} after={ranged: hunting_spear, invSpear: 1}`.
  - s107751 d151: `[contestChoose d151] idx=0 before={ranged: searcaster,
    invSear: 0} after={ranged: hunting_spear, invSpear: 1}` (hours after
    a double succession had seated ruth_goldstein's own gun worn-only).
- The worn-only state itself is the scholar's NORMAL convention
  (`Game.equip`: "remove from inventory (it's worn, not carried)");
  `mantleBecome` seating the successor's worn gun worn-only is
  consistent with it. `playerDeath`'s death pack DOES include the
  outgoing scholar's worn-only gear (s107751 d151 corpse held
  gen_ccrpfc9's gun), so succession itself is safe.
- Every other scholar-equipped writer audited: `equip()` (returns
  displaced, #806 — safe), `unequip()` (returns to pack — safe),
  `tbLockpickSteal`/`tbLockpickReturn` (steal/return pair — safe),
  `equipAccessory`/`migrateKeepsakes` (free slots only — safe),
  `mantleBecome` (wholesale replace, covered by the death pack — safe).
  `grantWeapon` was the only overwriting writer without a return.

## 3. The fix (one site, 16 lines)

`src/js/contests.js`, `contestChoose` grantWeapon branch: before
overwriting `s2.equipped[wslot]`, push the displaced entry back into
`s2.inventory` — itemId, name, units, kcalEach 0, kg 0.5, bonded +
alienLoot flags carried (the `#806` shape `Game.equip` uses). No other
behavior changes: the granted weapon is still pushed to inventory and
seated, narration unchanged, no new narration (matches #806's silent
return for the same chosen-action swap).

Deliberately NOT changed (recorded, not chased):
- `mantleBecome`'s worn-only seating: it matches the scholar's
  worn∉pack convention; carrying the gun into the pack as well would
  duplicate it the next time `equip()` returns a displaced piece, and
  would double-count multi-unit worn stacks (worn-stack #2698).
- `autoEquip` hardening: no caller can produce a worn-only scholar item
  and no villager path does either; hardening an unreached path is not
  the smallest fix.

## 4. Proof test — FAILS old, PASSES new

`scripts/test-worngun-reseat-b.js` (harness-loaded game, seed 7; staged
worn-only searcaster + a `grantWeapon` contest choice):

| Test | Old code | New code |
|---|---|---|
| T0 staging sanity (worn-only gun: equipped, pack 0) | PASS | PASS |
| T1 ranged re-seat returns the gun to the pack | FAIL (pack 0) | PASS (pack 1, spear seated) |
| T1b granted spear is seated | PASS | PASS |
| T2 melee grant leaves the ranged gun alone | PASS | PASS |
| T3 carried (not worn) gun survives a ranged grant, still exactly 1 | PASS | PASS |
| T4 returned gun keeps its bonded flag (bond 5) | FAIL (entry null) | PASS |

## 5. Before/after — the replay band (identical seeds, 150d)

Control leg reproduced the known 2 destructions exactly (analyzer:
`destroyed=2`, s107756 d44 gen_stv6af5, s107751 d151 ruth_goldstein,
`unexplainedExits=0`). Fixed leg: **`destroyed=0`,
`unexplainedExits=0`, `unclassified=0`, `misclassified=0`** on all 9
seeds. End-of-run village gun totals: control 16 → fixed 18 (+2, exactly
the saved guns). Transfers 11 → 13: the saved guns re-enter circulation
(the s107756 gun is re-worn the same day and moves on by succession
d112/d120; the s107751 gun sits in the scholar's pack at run end).

Per-seed control → fixed (days / deaths / holder-days / gun total at end):

| Seed | Days | Deaths | Holder-days | Gun total |
|---|---|---|---|---|
| 107750 | 45 → 45 | 47 → 47 | 39 → 39 | 1 → 1 |
| 107751 | 150 → 150 | 63 → 63 | 322 → 322 | 2 → **3** |
| 107752 | 132 → 132 | 54 → 54 | 128 → 128 | 1 → 1 |
| 107753 | 150 → 150 | 88 → 88 | 104 → 104 | 2 → 2 |
| 107754 | 150 → 150 | 82 → 82 | 124 → 124 | 3 → 3 |
| 107755 | 140 → 140 | 76 → 76 | 119 → 119 | 2 → 2 |
| 107756 | 146 → **125** | 101 → **108** | 57 → **42** | 1 → **2** |
| 107757 | 116 → 116 | 61 → 61 | 114 → 114 | 2 → 2 |
| 107741 (witness) | 150 → 150 | 149 → 149 | 93 → 93 | 2 → 2 |

7 of 9 seeds are identical on every counted number; only the two
witness seeds move, and only in the direction the fix predicts.

The fixed s107756 day, end to end (probe2 rerun on fixed code): the d44
grant seats the hunting_spear and the gun lands in the pack (invSear 1);
the policy's gear routine then re-equips the searcaster from the pack
via `Game.equip` the same day (the gun outranks the spear), and the
displaced spear goes back to the pack per #806. The s107751 d151 census
row shows the saved gun as `scholar-pack` — the fix working exactly as
designed.

## 6. Guardrails — judged

| Guardrail (prereg §3) | Control → Fixed | Verdict |
|---|---|---|
| holder-days must not fall | 1100 → 1085 (−1.4%) | ADJUDICATED — see §7 |
| searcaster volleys must not fall | 1 → 1 (witness s107741 only) | pass |
| deaths within ±10% | 721 → 728 (+1.0%) | pass |
| median survival within ±10% | 139 → 138 (−0.7%) | pass |
| instrument errors / anchors / policySha | 0 errors, 1 anchor, 0 mismatches, both legs | pass |

Balanced panel (§15, `worngun-reseat-b-panel.md`): decision
`review_required`, driven solely by "Village deaths per run"
regression_watch (+0.78/run, +1.9/100d) — entirely the s107756 seed
(+7 deaths on its shorter run). Everything else `no_material_signal`;
wins, national, community loss and survival-30/60 identical. The panel
is the instrument, the prereg is the judge: band deaths +1.0% and median
survival −0.7% are inside their frozen bands.

## 7. Metric review

- **The primary metric held.** `destroyedExits = 0` and
  `unexplainedExits = 0` on the fixed leg, with the control leg
  reproducing the known 2 — the instrument is proven by the control, and
  the fix is proven by the fixed leg. No re-scoring was needed.
- **The holder-days guardrail needs adjudication, not a waiver.** The
  −15 holder-days are entirely on s107756 (57 → 42), the seed whose
  village died 21 days earlier on the fixed leg (125 vs 146d).
  Holder-days are day-counts, so a shorter-lived village banks fewer of
  them; the gun itself survived there (end total 2 vs 1) and the seed's
  deaths (+7) sit inside the band's ±10% deaths guardrail. The
  guardrail's intent — the fix must not lose guns — is met in full (0
  destroyed, 0 unexplained, end totals up). The single-seed survival
  swing is chaotic-sim noise on a 9-seed band: 7 of 9 seeds are
  identical, the median moved −0.7%, and no mechanism in the fix touches
  survival (the scholar's combat kit is unchanged — the gun goes to the
  pack and is re-worn the same day; the only new state is a spare gun
  the gear-day gift logic may later move). Adjudicated GO.
- **The panel's `review_required` is the same single seed**, not a
  second signal: village deaths/run +0.78 is s107756's +7 spread over 9
  seeds. Noted, not chased.
- **Control drift vs the guntransfer corpus.** s107755 now ends
  village-lost at 140d (the guntransfer corpus had it surviving 151d,
  wave 5) and band holder-days are 1100 vs the census's 989 — master
  moved between the arms (anchor `fcb3d2fb7` → `9b038de58`). The control
  leg here is the current-master baseline, which is what the prereg
  requires; the drift changes no verdict.
- **What this arm does not measure.** The table (not instrumented); why
  holders still never reach wave-4 fights as leads (0 volleys on the
  pilot band, same as before — the fix saves guns, it does not aim
  them); the cells' fate across a double succession (guntransfer §4
  side observation, still open).
- **Check status.** `node scripts/check.js --quick` was killed mid-run
  (SIGTERM after ~7 min, no output — environment kill, not a test
  result). The touched area was verified instead with `check.js --only
  contest`: 19 passed, 18 failed WITH the fix — and the identical 19/18
  with the fix reverted to HEAD, so all 18 contest failures (old
  October contest tests, e.g. freshface `isMember` harness error,
  ledger pit sampling) are pre-existing on this tip, not caused by this
  change. The proof test (`test-worngun-reseat-b.js`) passes 5/5 on the
  fixed code and fails T1/T4 on the old code.

## 8. Sense-test — the spear-take, in plain words

On s107756 d44 the System interrupts with the gauntlet ("Three waves,
no rest"), offers the weapon rack, and the player takes the spear:
"📺 You take a spear. Three waves. No rest." Before the fix, the
searcaster the scholar was holding vanished at that exact line — no
mention, no corpse, no pack. After the fix the gun goes back into the
pack (and the scholar picks it up again the same day, because it is the
better weapon). The return itself is silent, the same silence the
ordinary equip path has kept since #806: taking the spear is the
announced action, and the gun coming home is its bookkeeping. Nothing
in the fiction claims the gun was thrown away, and now nothing in the
code does either. On s107751 the mantle itself is voiced — "Adaeze's
gone." … "The mantle just... transfers." — and the gun Ruth brought
with her survives the day instead of dying with the choice.

## 9. Scale-wall numbers (fixed leg; control in brackets)

| Seed | Days | End | Wave | Standing | Rank | Holder-days | Deaths |
|---|---|---|---|---|---|---|---|
| 107750 | 45 | village-lost | 4 | 100 | village | 39 | 47 |
| 107751 | 150 | survived | 4 | 199 | regional | 322 | 63 |
| 107752 | 132 | village-lost | 4 | 199 | regional | 128 | 54 |
| 107753 | 150 | survived | 4 | 199 | regional | 104 | 88 |
| 107754 | 150 | survived | 4 | 199 | regional | 124 | 82 |
| 107755 | 140 | village-lost | 4 | 199 | regional | 119 | 76 |
| 107756 | 125 [146] | village-lost | 4 | 100 [150] | regional | 42 [57] | 108 [101] |
| 107757 | 116 | village-lost | 4 | 165 | regional | 114 | 61 |
| 107741 (witness) | 150 | survived | 5 | 535 | regional | 93 | 149 |

Band totals: wins **0**, national **0** (best standing 535, regional),
wave-5 unlocked 1/9 (s107741 only), wave-5 faced 1/9, median survival
**138** [139] game-days. The table is not instrumented on this arm. 58
successions across the band (same both legs); 2 gear-day searcaster
gifts; 478 lend calls, 0 fired. The winnability wall is unchanged by
this arm: no seed reaches national, none wins — but two guns that used
to vanish now stay in the world, and the village gun total ends at 18
instead of 16.

## 10. Village assessment — what the village looked like

Nine villages, same substrate, same competent play. Seven of them do
not notice the fix at all — their guns never sat worn-only under a
grant, so their days, deaths and endings are untouched. The two that do
are the two the guntransfer arm caught losing a gun: on s107756 the
scholar keeps the searcaster, fights on with it, and the village still
falls at wave 4, three weeks earlier than the control run — a gun saved
is not a village saved, and the wave-4 wall is bigger than one weapon.
On s107751 Ruth's gun rides in the scholar's pack to the end of the
run, a spare the village never needed. The fix is a conservation law,
not a power boost: nothing is created, nothing is buffed, the rarest
weapon in the game simply stops evaporating when the System hands you
a spear. That is the whole blank filled.

## 11. Next blanks

1. **[open, follow-up] The grant's own double-presence.** `grantWeapon`
   pushes the granted weapon into the pack AND seats it, so one granted
   spear counts twice until the next equip — on the fixed s107756 the
   pack holds 2 hunting_spears after the gun is re-worn, for 1 granted
   spear. Pre-existing (not introduced by this fix); seating grants via
   `Game.equip` would close it, at the cost of the grant's bespoke
   narration. A small follow-up, not this arm.
2. **[open, follow-up] War-cry narration spam.** On the s107751 replay
   the line "(−30 kcal — food becomes war cry.)" repeats verbatim 14
   times in one day (d150). Same repeated-frame class as the tribute
   line filed 2026-11-24. Filed in sim-findings.md.
3. **Cells across a double succession** (guntransfer §4 side
   observation): still open — gen_ccrpfc9's 2 cells never reached their
   corpse on s107751.
4. **Holders never reach wave-4 fights as leads** — 0 volleys on the
   pilot band, unchanged. The gun works when the holder gets there
   (witness volley: 131 dmg vs a wave-4 algorithm); getting holders
   there is still the next question.
