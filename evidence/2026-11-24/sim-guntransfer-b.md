# sim-guntransfer-b — the unrecorded living-holder gun transfer, classified

**Arm:** sim-guntransfer-b · **Loop B run:** fleshout-loop-b-20261124T0840Z
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2732 (UNRECORDED LIVING-HOLDER GUN TRANSFER)
**Verdict: DIAG-GO** (all frozen bars pass, as amended by prereg Amendment A1)
**Prereg:** `evidence/2026-11-24/sim-guntransfer-b-prereg.md` (frozen, committed
`ff5d951cd`; Amendment A1 appended 2026-11-24)
**Corpus:** `evidence/2026-11-24/perseed-guntransfer-b/` (8 files) +
witness `guntransfer-b-s107741-guntransfer-b-witness-arm.json`
**Analysis:** `evidence/2026-11-24/guntransfer-b-analysis.json`
**Instrument:** `scripts/guntransfer-driver-b.js`, `scripts/analyze-guntransfer-b.js`,
`scripts/test-guntransfer-b.js` (commit `fcb3d2fb7` + fixes below)
**Substrate (byte-identical to the census):** `VETREENGAGE=1 PARTYSIZE4=1
FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1
CELLGATE=1 KILLBUNDLE=1 STAGE_SEAR=1 REARM_CELLS=1`; LEND unset, PRESENCE
unset. Anchor `fcb3d2fb7`, gameSha `950901f3fdcc`, policySha `1884c8852d38`.
Horizon 150d, competent verbatim, one process sequential.

## 1. The answer in one paragraph

There is no secret gift / hand-over / scholar-take path. The census's
"unrecorded transfer" is two ordinary, already-named paths, and the census
just had no wrap on either:

- **Succession (7 of 9).** The gun never moves. When the scholar dies,
  `playerDeath` picks the trust-top villager as successor and
  `mantleBecome` moves *that person's own kit* onto the scholar — so a
  villager holding a gun wakes up as the scholar holding a gun. The census
  read the holder's label changing from a name to `__scholar__` as a
  transfer overnight. It is a change of person, not of custody.
- **Gear-day spares-gift (2 of 9).** `villagerGearDay` step 2 gives a
  carried-but-not-worn duplicate weapon to whoever gains most from it.
  The gun moves villager → villager; the power cells do not move with it,
  so the gift always arrives dry.

No third path exists on this band: 386 lend calls, 0 fired (LEND unset);
0 lend-returns; 0 gear-day diffs beyond the two tele-recorded gifts. Every
living-holder gun move on the replay band is attributed; 0 unclassified.

## 2. The paths, named

| # | Path | File:function | Mechanism |
|---|---|---|---|
| 1 | Succession | `src/js/ledger.js:658` `playerDeath(cause)` + `src/js/villager-build.js:551` `mantleBecome(oldId, newId)` | Old scholar's gear goes on the corpse (death pack). Successor is the trust-top living villager. The successor's OWN kit — including a gun they already hold — is moved onto `state.scholar.equipped/inventory`, and their villager person record is cleared ("never counted twice"). The gun never changes hands; the holder becomes the scholar. |
| 2 | Gear-day spares-gift | `src/js/villager-build.js:895` `villagerGearDay()`, step 2 | Daily. A carried-but-not-worn duplicate weapon/armor is spliced from the giver's items into the taker's items and `autoEquip` seats it. Telemetry `tele('villager_gear', {vid, item, from, via: 'gift'})`. Only villagers at home (scholar and away excluded); worn gear is never taken; cells do not move (gear only). |

Ruled out by code read + wrap (0 firings on the band): `_lendSearcaster` /
`_returnLentSearcaster` (`src/js/game.js:21182/21304`, env-gated LEND=1,
LEND unset here); `villagerGearUp` (own stash + communal armory of
deposited weapons only, never another person's gear); `villagerRearmFromCorpse`
(corpse → taker only); `alienLootGrant` / `villagerKillLoot` /
`_corpseTakeStack` (add guns, never move one between the living); no
giveItem / giftItem / shareItem / passItem / transferItem / tradeItem helper
exists between villagers; conversation gifts are food-only; theft is
pantry-only.

## 3. Classification table — replay band 107750–107757

9 transfers, 0 unclassified. All 5 known pilot-band transfers found by
path + actors + day; 4 more found by the same wraps.

| Seed | Day | Loser → Gainer | Class | Evidence |
|---|---|---|---|---|
| 107753 | 69 | Leo Martin → scholar | succession | `playerDeath` gen_4vex9qm → leo_martin (the wild) |
| 107753 | 109 | james_okonkwo → visjoin_107 | gear-gift | tele `villager_gear` searcaster d108; gear-day diff d108: james −1 gun, visjoin +1 gun, 0 cells |
| 107754 | 103 | gen_lq0e0m5 → scholar | succession | `playerDeath` somchai_prasert → gen_lq0e0m5 (the wild) |
| 107754 | 131 | gen_pc7f25r → Zoltan Nagy | gear-gift | tele `villager_gear` searcaster; gen_pc7f25r won a 2nd gun as a contest prize d130, so the spare was a duplicate; Zoltan held no ranged weapon; cells stayed (Zoltan's gun dry) |
| 107755 | 112 | gen_olsjsph → scholar | succession | `playerDeath` gen_0eslqya → gen_olsjsph (the arena) |
| 107755 | 129 | quinn_murphy → scholar | succession | `playerDeath` gen_olsjsph → quinn_murphy (the wild) |
| 107756 | 16 | gen_stv6af5 → scholar | succession | `playerDeath` gen_5lkyahl → gen_stv6af5 (the wild) |
| 107756 | 127 | yara_haddad → scholar | succession | `playerDeath` gen_kwi3h3w → yara_haddad (the wild) |
| 107757 | 48 | gen_7xal8o9 → scholar | succession | `playerDeath` gen_vqm1wzx → gen_7xal8o9 (the night) |

Day note: the analyzer's day is the row day *after* the move; the tele
record for the james_okonkwo gift is d108 (the gear day ran after the d108
snapshot). The Zoltan day (131) matches the census's reading.

### Witness — Wanjiru Kamau, s107741 (replay-proven, day corrected)

The witness replay (same substrate, current code) reproduces the old
corpus's trajectory through d123 byte-for-byte (same rows, same corpse id)
and classifies Wanjiru as **succession on d125, not d124**:

- d122–123: Wanjiru holds the gun (2 cells) as a villager; scholar is
  gen_q49jzk0.
- d124: gen_q49jzk0 dies in the arena (`player:true`); **gen_wrbs9h9**
  becomes the scholar, holding their *own* gun. Two guns in the village
  that day — Wanjiru's plus the new scholar's. The old corpus, which
  recorded no daily scholar, showed both rows at once; the census read
  that double row as Wanjiru → scholar on d124. It was not.
- d125: gen_wrbs9h9 dies in the wild (`player:true`); **Wanjiru becomes
  the scholar**. Her villager row disappears; only the scholar holds the
  gun. The gun never moved; she did.

The replay also reclassifies the old corpus's other two "unclassified"
moves on the same seed as successions (gen_vrbv1zi d77, diana_osei d95 —
both with `playerDeath` records) and its three `__scholar__` exits as
death-packs. The old anomalies were all artifacts of the missing daily
scholar + missing wraps, not a third path.

## 4. Custody exits — the two guns that vanished (not transfers)

Two holdings losses on the band have no living gainer. Both were proven
**destructions**, not transfers, by live kit-dump probes (patched driver
copy in /tmp, same substrate, deterministic replay):

| Seed | Day | Loser | What happened |
|---|---|---|---|
| 107756 | 44 | gen_stv6af5 (scholar) | Held the gun worn-only d40–43 (`eq.ranged: searcaster`, no searcaster in inventory, 2 cells in pack). On d44 contest prizes arrived (hunting_spear, stormcloak); a gear-up re-seated the ranged slot to the hunting_spear and the gun vanished from both slots. |
| 107751 | 151 | ruth_goldstein | Held the gun as a villager d150 (1 cell). Double succession that day (adaeze → gen_ccrpfc9 → ruth); after ruth became scholar her kit shows `eq.ranged: hunting_spear` and no gun anywhere. Same re-seat. |

Mechanism (two steps, both in code):

1. **`mantleBecome` splices the worn gun out of the pool**
   (`src/js/villager-build.js:624–660`). The worn-slot loop finds the
   worn gun's matching entry in the successor's inventory pool, splices it
   out, and seats the worn copy on the scholar. The gun is now **worn-only**:
   it lives in `scholar.equipped.ranged` with no inventory entry behind it.
   (This is the designed "what they wore stays worn" rule.)
2. **`autoEquip` replaces the whole equipped object from inventory ids**
   (`src/js/equipment.js`, end of `autoEquip`: `v.equipped = equipped`,
   built purely from `(v.items || []).map(itemIdOf)`). Any worn item with
   no inventory entry is silently dropped. The next `villagerGearUp` /
   autoEquip on the scholar — after new gear arrives, after a succession,
   before a fight — destroys a worn-only gun. No event, no narration, no
   corpse: the gun just stops existing.

This is a real game defect, filed as a new [open] finding (see §11): a
searcaster — the rarest weapon in the game — can be silently destroyed by
picking up a better spear. It also means custody can end without any
custody event: the village gun total falls (3 → 2 on s107751, 1 → 0 on
s107756) with no grant, gift, death, or take behind it. The analyzer
names these `destroyed` exits (Amendment A1); they are not transfers and
are never counted as such.

Side observation (not chased): across the s107751 double succession,
gen_ccrpfc9's 2 cells never reached their corpse (corpse shows the gun,
cells 0). The gun is accounted for; the cells' fate is an open thread for
a future instrument, not this arm.

## 5. The lend on this band

386 `_lendSearcaster` calls, 0 fired, 0 returns — LEND is unset on the
substrate, as the prereg requires. The wrap proves the negative: the lend
path cannot be the unrecorded transfer.

While proving the wrap, the live test found a real gap in the lend itself
(filed as a new [open] finding, not chased here): `_lendSearcaster`'s
entry scan reads `_le.itemId || _le.id || _le.material`, which is null on
a bare-string `'searcaster'` entry — the shape kill-loot, rearm takes, and
staged arrivals produce. A string-entry gun never lends, even with LEND=1
(probed seed 7: string gun + 2 cells → null; same lender with an object
gun entry → fires, kind `gun`, cellsMoved 2). Only contest-prize (object)
guns can lend a gun; the cells-only lend works either way. Fix direction:
make the entry scan read bare strings or normalize gun entries to objects
at arrival.

## 6. Sense-test — the Zoltan gift, in plain words

On seed 107754, a villager called gen_pc7f25r won a second searcaster as a
contest prize on day 130. He already carried one, so the second was a
spare. The next morning the village's sharing rule ran: it looks for
carried gear someone isn't wearing and gives it to whoever would gain the
most from it. Zoltan Nagy had no long-range weapon at all, so the spare
went to him — the gun moved from one villager's pack to Zoltan's hands on
day 131. But the rule moves gear only, never power cells: Zoltan's new gun
arrived empty, and it stayed empty. He carried a gun he could never fire.
That is the whole villager-to-villager path: a spare changes hands, the
cells stay home.

## 7. Does the wrap change the gunholder census verdict?

The census verdict stands, with one caveat. Reproduction is exact:
**holder-days 989** (census: 989), class counts identical — fired 0,
no-fight 826 (83.5%), led-cellgate-hold 59 (6.0%), not-picked 40 (4.0%),
led-evaded 35 (3.5%), ally-no-fire 22 (2.2%), led-other 7 (0.7%); 15
holders; 8 staged arrivals, all bundled, 0 dry; 4 rearm takes. On the
pilot band, holders still never fire a single volley.

What changes is the custody story around the verdict. Custody tracking now
holds for every *transfer*: all 9 moves between living people are wrapped
and named. But custody can still silently end — the two destroyed guns (§4)
leave the counted universe with no event at all. A future custody
instrument must also watch for worn-only re-seats, or it will keep reading
destructions as disappearances.

Counterweight from the witness seed: a loaded gun *can* fire. On s107741,
gen_vrbv1zi fired 2 shots for 131 damage against a wave-4 "algorithm" on
day 53 (the only shots>0 searcaster volley across this arm's 9 seeds).
The pilot band's 0 volleys are about holders never reaching a wave-4 fight
as the lead — not about the gun being unable to fire.

## 8. Frozen bars — judged

| Bar | Result | Detail |
|---|---|---|
| 1 Instrument validity | pass | errors=0, anchors=1, policyMismatches=0, rearmOff=0, rearmPresentOff=0, klArrivals=8/8, klBundled=8, klDry=0 |
| 2 Reproduction | pass | holderDays=989 (census: 989), censusUnclassified=0 |
| 3 Classification completeness (as amended, A1) | pass | transfers=9, unclassified=0, exits=2, destroyed=2, unexplainedExits=0; all 5 known transfers by path + actors + day; Wanjiru succession d125, replay-proven |
| 4 No misclassification | pass | misclassified=0, lendFired=0, lendCalls=386 |
| 5 Sense-test | pass | §6 (Zoltan gift, plain words) |
| 6 Wall numbers | recorded | §9 |
| 7 Zero src/js diffs | pass | `git diff HEAD -- src/js` empty; instrument-only arm |

**Verdict: DIAG-GO.** Proof: analyzer selftest 29/29; test pre-run 18/18,
`--live` 37/37, `--dir-arm` PASS (12/12 checks, verdict DIAG-GO,
srcJsDiffEmpty); census analyzer selftest 25/25; census test `--live`
30/30.

## 9. Scale-wall numbers (pilot band 107750–107757 + witness s107741)

| Seed | Days | End | Wave | Standing | Rank | Holder-days | Deaths |
|---|---|---|---|---|---|---|---|
| 107750 | 45 | village-lost | 4 | 100 | village | 39 | 47 |
| 107751 | 152 | survived | 4 | 199 | regional | 322 | 63 |
| 107752 | 133 | village-lost | 4 | 199 | regional | 128 | 54 |
| 107753 | 151 | survived | 4 | 199 | regional | 104 | 88 |
| 107754 | 151 | survived | 4 | 199 | regional | 124 | 82 |
| 107755 | 151 | survived | 5 | 200 | regional | 101 | 79 |
| 107756 | 146 | village-lost | 4 | 150 | regional | 57 | 101 |
| 107757 | 115 | village-lost | 4 | 165 | regional | 114 | 61 |
| 107741 (witness) | 144 | village-lost | 5 | 485 | regional | 81 | 151 |

Band totals: wins **0**, national **0** (best standing 200, regional),
wave-5 unlocked 1/8 (s107755), wave-5 faced 1/8, median survival **148.5**
game-days. The table is not instrumented on this arm. 49 succession
events (playerDeaths) across the band; 95 gear-gift events, 2 of them
searcasters; 386 lend calls, 0 fired; 4 rearm takes. The winnability wall
is unchanged by this arm: no seed reaches national, none wins, and the
only wave-5 unlock (s107755) faces wave 5 on a regional standing.

## 10. Metric review

- **The prereg's primary metric held.** Every living-holder transfer on
  the band is attributed to a code path, 0 unclassified — but the band
  held 9 transfers, not 5: the census's 5 known moves understated the
  band by 4 (3 more successions, 1 more gear-gift). The detector, not the
  census, was the right instrument for the count.
- **The detector needed one correction mid-arm (Amendment A1).** The
  frozen `vanished` kind treated custody exits as transfer candidates; 2
  of 11 candidates were destructions. The correction is narrow (exits
  named separately, taxonomy unchanged) and is itself proven by probe,
  not asserted. The frozen bars were judged against the amended prereg,
  and the amendment is recorded in the prereg file.
- **The test's `--dir-arm` path had a latent bug** (an undeclared
  `policyShaMismatches` variable — the mode had never been run before
  this arm). Fixed in the test; `--dir-arm` now passes 12/12.
- **The witness replay is the strongest evidence in the arm.** It
  reproduces the old corpus's trajectory through d123 byte-for-byte, then
  corrects the census's Wanjiru day (d124 → d125) and explains the old
  corpus's other anomalies as missing-scholarVid artifacts. A replay that
  reproduces *and* corrects is worth more than a replay that merely
  agrees.
- **What this arm does not measure.** The table (not instrumented); why
  holders never reach wave-4 fights as leads (the census's 83.5%
  no-fight — still the wall behind the gun chain); the cells' fate across
  a double succession (§4 side observation).

## 11. Next blanks

1. **[open, new finding] A worn-only gun is destroyed by the next
   autoEquip re-seat.** `mantleBecome` splices the worn gun out of the
   pool (worn-only by design); `autoEquip` rebuilds `equipped` from
   inventory ids only and drops anything worn-only. Fix direction: carry
   the worn gun back into the pack on re-seat (or keep a worn-entry
   back-reference), with a proof test staging a worn-only gun + a better
   ranged arrival. Filed in sim-findings.md.
2. **[open, new finding] String-entry guns never lend** (§5). Fix the
   `_lendSearcaster` entry scan to read bare strings, or normalize gun
   entries to objects at arrival. Filed in sim-findings.md.
3. **Cells across a double succession** (§4 side observation): gen_ccrpfc9's
   2 cells never reached their corpse. A future instrument should trace
   cell custody across successions the way this arm traced guns.
4. **Holders never reach wave-4 fights as leads** — the census's 83.5%
   no-fight, still the binding wall on the gun chain. The witness seed's
   one real volley (131 dmg, wave-4 algorithm, d53) shows the gun works
   when the holder gets there; getting holders there is the next question.
