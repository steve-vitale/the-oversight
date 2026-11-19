# sim-bowsource-a — evidence

- **Arm:** sim-bowsource-a (DIAG, axis scale-onramp)
- **Run:** fleshout-20261119T1215Z, Loop A
- **Base:** master `ebea87dfb`
- **Worktree:** `~/workspace/worktrees/sim-bowsource-a`
- **Seeds:** 107001–107008 (fresh band — verified, see §12)
- **Horizon:** 150d, death-aware
- **Policy:** competent verbatim (`scripts/policies/competent.js`)
- **Substrate:** VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + **SENSEEXPED=1** (see §3 — the prereg's LAUNCHPARTY line was corrected before any sim ran; no HELD cherry-pick)
- **Prereg:** `evidence/2026-11-19/sim-bowsource-a-prereg.md` (frozen 2026-11-19 ~06:45 UTC; substrate addendum ~07:10 UTC, before the sweep)
- **Verdict:** **DIAG-GO**

## 1. The question

The bowopen arm (finding #2592) found villages hold NO spare bows — 0 stashed, 0 armory across 400 departures on 8 seeds. Bows are held personal gear, never stored. Any arm that stages bows from stock is staging from an empty shelf. This diag quantifies the bow supply chain: where does a bow in a villager's hands come from — starting gear, crafting, loot, or new arrivals? When a fighter sets out without any ranged weapon, could a bow have been sourced? Do stash/armory piles ever hold one? And does the home bow-craft duty ever fire?

## 2. Verdict — DIAG-GO

All three frozen bars pass:

| Bar (prereg §14) | Result | Pass |
| --- | --- | --- |
| Attribution completeness ≥ 0.90 | **0.930** — 40 of 43 bows ever held attributed (starting 28 + appearances 15: crafted 0, looted 1, spawned 11, moved 0, unexplained 3) | ✓ |
| Departure pool floor ≥ 100 | **161 departures**; bowless 128 (79.5%) | ✓ |
| Craft measured | Eligible-villager-day denominator recorded on every census row (**90** eligible days); craft events **0** (ok 0, fail 0); unexplained earth-bow appearances **0** (tele wrap proven live — no missed craft could hide) | ✓ |

The fourth prereg condition (a named next arm filed) is met in §5 / §10.

**Headline, in one line:** in 150 days on 8 fresh villages, not one bow was ever crafted, not one was ever deposited or moved, and in none of the 128 bowless departures could a bow have been sourced — the supply chain is starting gear plus new arrivals, and then the bows die with their holders.

## 3. The mechanism (what was built)

No game code changed (DIAG arm). The instrument reuses the bowopen driver and extends it:

- **Driver** `scripts/bowsource-driver-a.js` — copy of `scripts/bowopen-driver-a.js` (launch-funnel recorder unchanged) PLUS the bow-supply recorder: a `tele` wrap (weapon_craft / villager_gear / ammo_craft), a `villagerKillLoot` wrap, a daily bow census (per-villager volley-capable holdings / personal stash / spears, stash weapons pile, pile materials, bow knowledge, craft-eligibility counts), a day-1 baseline census, and an all-departures `startExpedition` wrap (post-call read: fighter volley status + source check — own-stash bow / armory bow / craftable bow from the live recipes and reachable materials). Pure helpers exported for the proof test.
- **Analyzer** `scripts/analyze-bowsource-a.js` — fresh. Attribution per seed: every bow first-appearance in a villager's personal union (held + stashed) after baseline attributed to starting / crafted / looted / spawned (new roster vid) / moved (gift/armory/same-day loss+gain) / unexplained. Moved-attribution is same-day id matching, not instance tracking (no serial numbers). Pile tracked the same way. Selftest **25 passed, 0 failed**.
- **Proof test** `scripts/test-bowsource-a.js` — **38 passed, 0 failed**. Covers pure helpers on fixtures, live data agreement (live items.json ranged set == frozen set; live recipes match frozen), a live 5-day smoke (0 instrument errors, BOWOPEN off proof, SENSEEXPED on proof, tele-wrap liveness cross-checked against the vetfirst instrument's independent `teleCounts`), and analyzer interop on the live smoke corpus.

**Substrate correction (before any sim ran).** The first sweep invocation STOPPED before the first seed: `LAUNCHPARTY` appears NOWHERE in `src/js` on master `ebea87dfb` — the bowopen band's sense fix is a HELD substrate (branch `sim-launchparty-sense-a`, never landed). Its LANDED successor is on master: `sim-senseexped-b` (finding #2583, commit `97e78670d`, GO) — `SENSEEXPED=1` in `src/js/party-wiring.js`, the same job ("the party that set out together answers first") read from the LIVE expedition instead of `winPlan[vid].party`. The other substrate gates (VETREENGAGE, PARTYSIZE4, FLEEREPAIR2, FIGHTALLY2) are all present in `src/js` on this master — verified by grep. The sweep therefore ran `SENSEEXPED=1` in place of `LAUNCHPARTY=1`; LAUNCHPARTY unset (the driver asserts both). No HELD cherry-pick was ported: the diag measures the current landed world, which is what the next arm will build on. The substitution touches only the meeting-sense secondary metric; the primary metrics (attribution, bowless departures, craft) do not depend on meeting sense — departures are driven by winPlan / dawn decisions, and the supply chain is a village-economy question. Recorded as a dated addendum in the prereg (no sim ran under the old line, so no measurement is re-scored and no frozen bar changes). Corpus files self-describe it (`senseexpedOn: true`, `senseexpedPresent: true`, `launchpartyOn: false` on all 8).

All 8 seeds ran clean: exit 0, 0 instrument errors, `bowopenOn: false`, `senseexpedOn: true`.

## 4. Headline numbers

### 4.1 Bow sources — starting gear and new arrivals, nothing else

43 bows were ever held across the band. 28 were starting gear; 15 appeared later.

| Source | Count | Detail |
| --- | --- | --- |
| Starting gear | **28** | sling 10, crude_bow 7, bow 7, crossbow 4 |
| Crafted | **0** | 0 events in 90 eligible-villager-days (§4.4) |
| Looted | **1** | 1 alien bow via a kill-loot event (seed 107001) |
| Spawned (new arrival holding one) | **11** | background survivors joining with a bow in hand |
| Moved (gift / armory) | **0** | 79 gear moves total, 0 of them a bow |
| Unexplained | **3** | none earth (`unexplainedEarth: 0`) — cannot hide a missed craft |

Attribution completeness 0.930 (40/43). The 3 unexplained are non-earth bows appearing without a matching loot event in the census gap window — the census rides observed day-boundaries, so events in the gap are attributed by window, and 3 fell through that attribution (see §12). They do not touch the craft verdict.

Where bows GO is as telling as where they come from: **40 disappearances, all 40 `diedWith`** — the bow leaves the world when its holder dies. **0 deposited** into the stash pile, ever. The pile never held a bow on any of the 1,055 census rows.

Loot cannot supply earth bows by construction: `villagerKillLoot` rolls the alien table only. Across the band there were **373 kill-loot drops, of which 3 were bows** — phase_sling ×2, starfall_bow ×1, all alien. An earth bow (bow / crude_bow / crossbow / sling) can never drop from a kill.

Per seed:

| Seed | Days | End | Starting | Appeared (crafted / looted / spawned / unexpl.) | Departs | Bowless |
| --- | --- | --- | --- | --- | --- | --- |
| 107001 | 143 | village-lost | 2 | 5 (0 / 1 / 4 / 0) | 22 | 16 |
| 107002 | 82 | village-lost | 0 | 0 | 67 | 67 |
| 107003 | 150 | survived | 7 | 0 | 7 | 4 |
| 107004 | 143 | village-lost | 3 | 2 (0 / 0 / 1 / 1) | 1 | 1 |
| 107005 | 114 | village-lost | 6 | 2 (0 / 0 / 2 / 0) | 21 | 8 |
| 107006 | 150 | survived | 1 | 0 | 20 | 20 |
| 107007 | 143 | village-lost | 6 | 5 (0 / 0 / 3 / 2) | 21 | 11 |
| 107008 | 147 | village-lost | 3 | 1 (0 / 0 / 1 / 0) | 2 | 1 |
| **Band** | **median 143** | **6 lost / 2 survived** | **28** | **15 (0 / 1 / 11 / 3)** | **161** | **128 (79.5%)** |

Seed 107002 is the starkest case: **0 starting bows, 67 departures, all 67 bowless**, village lost day 82. Seed 107006 survived 150 days with a single starting bow and 20/20 departures bowless.

### 4.2 Bowless departures — four in five set out with no ranged weapon, and never with a source

- **161 departures, 128 bowless (79.5%).** Wave-4 departures: 145, bowless 115 (79.3%).
- **Bowless with a bow source available: 0 of 128.** In not one bowless departure did the fighter have a bow in their own stash, a bow in the armory pile, or a craftable bow from known recipes and reachable materials. A perfect staging arm would have found nothing to stage — the shelf is empty AND the workshop is silent.
- **48 of the 128 bowless departures carried a spear** — a melee weapon in the ranged slot (range 2, no ammo) that is not volley-capable. The spear is the bowless fighter's consolation, not a ranged weapon.
- Encounters: 7 engaged meetings in the band, 2 with a ranged weapon at entry (28.6%) — the same shape as bowopen's 9/27 (33%), on a smaller n. The ranged opening is rare because the bows are rare, not because fighters leave them behind.

### 4.3 Stash / armory over time — the pile is always empty

Village bow totals (held + stashed, all villagers) at census snapshots — seed order 107001–107008:

| Day | Totals per seed | Band total |
| --- | --- | --- |
| 1 | 2, 0, 7, 3, 6, 1, 6, 3 | 28 |
| 30 | 2, 0, 6, 2, 3, 1, 6, 3 | 23 |
| 60 | 1, 0, 4, 1, 1, 1, 7, 3 | 18 |
| 90 | 3, 3, 1, 2, 1, 3, 2 (107002 dead) | 15 |
| 120 | 0, 3, 0, 1, 2, 1 (2 seeds dead) | 7 |
| 150 | 2, 0 (only 107003, 107006 alive) | 2 |

The stash-weapons pile held **0 bows on every one of the 1,055 census rows** (piles `{}` at every snapshot). Bows only ever decline — from 28 at day 1 to 2 at day 150 — because holders die and nothing replaces them. This confirms finding #2592 on a fresh band with a different instrument: the "no spare bows" result is not a bowopen artifact.

### 4.4 Craft — the verb never fires, and the funnel into it is nearly empty

- **Craft events: 0** (ok 0, fail 0) in **90 eligible-villager-days**. Attempts per eligible day: 0.
- **Knowledge is plentiful but misplaced.** 1,228 knows-bow villager-days across the band — but **1,138 of them (93%) sit on ARMED villagers**, whom the duty skips outright. Only 90 days are weaponless-AND-knows-bow.
- **Materials are not the binding constraint.** The camp pile held branch on 906/1,055 census rows (86%), wood on 891 (84%), vine on 407 (39%); band totals branch 36,443, wood 21,373, vine 803. On the 90 eligible days the pile held branch 90/90 and vine 39/90 — a crude_bow (branch 1 + vine 1) was pile-craftable on 39 of the 90 eligible days, a bow (wood 1 + vine 2) on 16. Still 0 attempts.
- **Why zero attempts even on craftable days:** the duty (`villagerWeaponCraftDay`, `villager-build.js`) gates on three things at once — weaponless, personally-knows the rung, materials reachable — and the census eligibility counts only the first two. The remaining gates (knows the *specific* rung whose materials are present, is at home rather than away, the home duty running that day) evidently never all line up; the instrument does not separate which of them binds on a given day, and no attempt ever reached the tele line to say so. The funnel is the finding: the eligible pool is 90 villager-days in 1,072 village-days, and nothing flows through it.

**Prereg correction (recorded here, not a re-score).** The prereg's §3 said the duty attempts "L1 35% blind". Re-reading the code while writing this evidence: there is NO blind attempt. The duty requires level ≥ 1 — knowledge seeded only by handling the finished weapon — before any attempt; the 35% rate applies at level 1 (known), 85% at level ≥ 2, and a level-1 success teaches level 2. This makes the gate HARDER than the prereg stated, and it closes the funnel's only entrance: the only way to learn a bow is to hold one, and holding one makes you armed and ineligible. The only entrance is hold-a-bow → stash-it (stash counts for seeding, not for armed) → become weaponless → craft. The measurement (0 attempts) stands under either reading; the correction strengthens the lever in §5.

### 4.5 Who crafts — nobody, with nothing

No crafter, no materials consumed, no craft fired on any seed. The "who crafts bows" question answers itself: the duty's population is weaponless villagers who once held a bow and stashed it — a population the census finds on ~8% of village-days, and none of them ever reached an attempt.

## 5. The lever, named precisely — and the next arm

**The fixable lever is the home weapon-craft duty's double gate** (`villagerWeaponCraftDay`, `src/js/villager-build.js:1285–1402`):

1. **Weaponless-only:** any villager holding any weapon — even a spear, which gives no volley — is skipped entirely. A spear-armed fighter (48 of the 128 bowless departures) can never craft or receive a bow from this duty.
2. **Knowledge-from-handling-only:** a ladder rung can only be attempted at level ≥ 1, and level 1 is seeded only by wearing, carrying, or stashing the finished weapon. A villager who has seen a bow, fought beside one, or been told about one — but never held one — can never attempt one.

Either gate alone would thin the funnel; together they empty it: 93% of bow knowledge sits on villagers the duty skips, and the eligible remainder never attempts. Loot is not an alternative lever for earth bows (alien table only, §4.1), and the pile is not one (deposit is consent, and nobody deposits).

**Next arm — `sim-bowcraft-a` (BUILD + measure, own prereg, identical seeds 107001–107008, same instrument):** widen the duty so a fighter whose best weapon has no ranged option can craft or be handed a bow — serve spear-armed (ranged-less) villagers, and seed bow knowledge from seeing a bow in a fight or being taught, not only from handling. Judge on the same primary (bow appearances by source, bowless departure share, craft-fire rate per eligible day) before/after on identical seeds. Do NOT land a game-code fix in this DIAG arm (per the brief).

## 6. §15 balanced panel — review_required (zero deltas)

Single leg, before == after == this leg — a null compare by construction. `node scripts/balance-panel.js compare` returns `review_required` (the screen's default on zero-delta panels, not a signal). Attached: `evidence/2026-11-19/bowsource-a-panel.md`.

| Metric | Before | After | Delta |
| --- | --- | --- | --- |
| Table win rate | 0 | 0 | 0 |
| National scale access | 0 | 0 | 0 |
| Village deaths per run | 72 | 72 | 0 |
| Community loss | 0.75 | 0.75 | 0 |

The telemetry-deviation check refused the corpus, as it did for bowopen: `telemetry-check: refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs.` Recorder corpora are compared with sweep-compare tables, never against a run baseline here. Recorded, not worked around.

## 7. Reachability verdict / wall numbers

- **National: 0/8. Table: 0/8. Wins: 0/8.** Scale rank regional 8/8; standing 199 on 6/8 (107004: 100, 107007: 195).
- **Wave 4 reached 8/8; wave 5 reached 0/8.** The wave-5 door never opened on this band.
- **Median survival 143 days** (82, 114, 143, 143, 143, 147, 150, 150); 6 villages lost, 2 survived to 150d.
- **Starvation: 2** (1 villager starvation) — deaths are fighting deaths, as in the collapse pattern, not hunger.
- **Village deaths per run: 72** (panel). Total deaths across the band: 69 + 78 + 63 + 65 + 71 + 72 + 97 + 61 = 576.

The bow shortage sits on the winnability chain's wave-4 link: 79% of wave-4 departures go out with no ranged weapon, and the volley — the opening the bowopen arm measured — fires in barely a quarter of the few meetings that happen.

## 8. Village assessment (plain words)

Eight villages, 150 days each. They start with a handful of bows — two or three per village, sometimes none — and then the bows just drain away. Nobody makes a new one. Nobody finds one worth keeping. Nobody puts one aside for the next fighter. When a bow's owner dies, the bow dies with them, and the village gets poorer in ranged weapons every week. By day 150 the two villages still standing hold two bows between them.

Four out of five fighters who set out to hunt a wave-4 monster walk out with no ranged weapon at all. Half of those carry a spear instead — a sharp stick that doesn't shoot. And in not one of those departures was there a bow anywhere to give them: not in their own stash, not in the camp pile, not one they could have made from what the camp held. The camp pile is full of wood and branches — the materials are there. The knowledge is there too, mostly in the heads of fighters who already carry a weapon and so are never offered the workbench. The workbench itself never gets used. Nobody in any village, in 150 days, ever spent an afternoon making a bow.

The villages still fight, still kill, still reach wave 4 — every one of them. But none reaches wave 5, none reaches national standing, none takes a seat. They die fighting, not hungry. The bow shortage is one link in that chain, and it is a supply link with a visible fix: let the fighters who need a bow make one.

## 9. Sense testing (what the player would see)

340 `vetSays` lines across the band (sayCount 7,529–15,121 per seed). Read them: villagers act like people — hauling wood ("hauls back 6 wood. The pile grows. (37 logs now.)"), checking the pantry before heading out ("the shelves are full, ~6 days of fresh on hand… leaves the harvest standing"), teaching snares ("Want to actually SEE one? … Opossum trails. Check at dawn. Always."), the SYSTEM calling out veteran kills on camera. The world talks.

What it never says is the bow story. Of the 340 lines, **4 mention bows at all** — and none is a villager wanting, making, lacking, or losing one. The closest are a level-up offer ("Craft 2. Three offers; they took Cold-Blooded") and a Codex log line. The craft narration ("spent the afternoon at the workbench and made a …") never fires anywhere, because the craft never fires — the silence is the measurement, not a narration gap. A player watching a village would never learn from its voice that bows are scarce; they would learn it from the fights, where four in five departures go out without one.

## 10. Findings filed / updated (for the coordinator to file — this arm does not edit sim-findings.md)

- **#2592 (VILLAGES HOLD NO SPARE BOWS) — ANSWERED, stays open.** Append: "ANSWERED by sim-bowsource-a (run fleshout-20261119T1215Z, evidence/2026-11-19/sim-bowsource-a.md, DIAG-GO, fresh band 107001–107008): confirmed on a second band with a different instrument — 0 stashed, 0 armory bows on all 1,055 census rows; 0 deposited ever; 40 bows died with their holders. Supply quantified: starting gear 28, crafted 0, looted 1 (alien), new arrivals holding one 11. Bowless departures 128/161 (79.5%), 0 with a source available. The lever is the craft duty's double gate (§5) — next arm sim-bowcraft-a."
- **NEW finding — THE BOW-CRAFT VERB NEVER FIRES (sim-bowsource-a, same run, DIAG-GO):** `villagerWeaponCraftDay` (villager-build.js) fired 0 times in 90 eligible-villager-days across 8 seeds × 150d. The duty serves weaponless villagers only, and knowledge is seeded only by handling the finished weapon — so 93% of bow knowledge (1,138 of 1,228 villager-days) sits on armed villagers the duty skips, and the eligible remainder never reaches an attempt even on the 39 days the pile held branch+vine for a crude_bow. Materials are plentiful (pile branch on 86% of days). Next arm: sim-bowcraft-a — serve ranged-less (spear-armed) villagers and seed bow knowledge from seeing/being taught, measured before/after on identical seeds 107001–107008.
- **NEW finding — LOOT CANNOT SUPPLY EARTH BOWS (sim-bowsource-a, same run):** `villagerKillLoot` rolls the alien table only: 373 kill-loot drops, 3 bows (phase_sling ×2, starfall_bow ×1), all alien. An earth bow can never drop from a kill. Any supply fix that leans on loot leans on alien bows only.

## 11. Blanks, limits, and things not done

- **No game-code fix landed** (DIAG arm, per the brief). The lever in §5 is named, not built.
- **Attribution is 0.930, not 1.0.** 3 of 43 bows are unattributed (non-earth). Moved-attribution is same-day id matching, not instance tracking — a bow gifted and re-gifted within a census gap could misattribute, though 0 gear bow moves were seen.
- **The craft gate is not fully decomposed.** The instrument proves 0 attempts on 90 eligible days and that materials were present on 39 of them, but does not separate which of the remaining gates (specific-rung knowledge vs. at-home vs. duty-running) binds on a given day. The next arm's prereg should instrument the attempt line's gate failures directly.
- **Encounter n is small.** 7 engaged meetings, 2 ranged at entry. The 28.6% ranged-at-entry share agrees with bowopen's 33% but is not a tight estimate.
- **One leg only (MODE=obs).** No before/after — the panel is a null compare. The before/after belongs to sim-bowcraft-a.
- **Census cadence** (§12): census rows fire on observed day-boundaries, not every game day; events in the gap are attributed by window.
- **Substrate is the landed SENSEEXPED, not the bowopen band's HELD LAUNCHPARTY** (§3). The encounter rows are measured under the successor sense; the supply numbers do not depend on it.
- **No live verification** (ship loop owns deploys). No push, no version bump.

## 12. Metric review

- **Primary metric held.** Attribution completeness 0.930 clears the 0.90 bar with 43 bows in the denominator — a small population, but the bar was set against it and the miss (3 unexplained, all non-earth) is bounded and cannot hide a craft. Pool floor 161 ≥ 100. Craft measured via the denominator + the no-unexplained-earth-bow proof, exactly as the prereg's second clause allows.
- **Prereg correction — no blind attempt.** The prereg's §3 described an "L1 35% blind" attempt. The code has no blind attempt: level ≥ 1 (handling-seeded) is required before any attempt. The correction is recorded in §4.4 and does not change any bar — it strengthens the lever. Lesson: the prereg's code claims should have been re-verified against the function body line by line, not from the earlier arm's notes.
- **Census-cadence gap window.** The census rides `policy.daily`'s finally block, so it fires once per OBSERVED day-boundary — the scholar day can roll past a game day between boundaries (5-day smoke observed census days [2,4,5,6]; day 3 never a boundary). The analyzer attributes events in the gap window `(prevRowDay, rowDay]`, not on the row day exactly. The selftest fixture exercises this (phase_sling loot event day 15, between census rows 10 and 20, still attributes as 'looted'). The 3 unattributed bows are the residue of that windowing, not a hole in the craft proof.
- **Seed-band freshness — broad-grep false positives reconciled.** The `.md`-only greps for 107001–107008 returned 0 hits (evidence preregs/dated notes, goal hidden_files, memory). A broader recursive grep over all of `evidence/` (including JSON corpora) listed old Oct 17–25 JSON files, but inspection showed numeric false positives — e.g. `"fd":95.58689910700251` and `"drawn":285.94304851070046` contain `107002`/`107004` as float substrings, not seed usage. The band is fresh; the `.md` grep is the correct freshness check for prereg/evidence usage, and the JSON hits are not seed references.
- **Panel is a null compare by design.** Before == after == this leg; `review_required` is the screen's default on zero-delta panels, not a signal. The §15 panel's value here is the wall-number snapshot (deaths/run 72, community loss 0.75), not a delta.
- **What the metric cannot say.** The bowless-sourced check (0/128) is a same-day snapshot at departure — it cannot say whether a bow existed earlier in the day and was taken, or whether a villager could have crafted one with a day's lead time. The craft denominator (90 eligible days) is the honest bound on that question, and it is also ~zero.

## 13. Files

- `evidence/2026-11-19/sim-bowsource-a-prereg.md` — frozen prereg + substrate addendum
- `evidence/2026-11-19/sim-bowsource-a.md` — this file
- `evidence/2026-11-19/bowsource-a-analysis.json` — analyzer output (verdict DIAG-GO)
- `evidence/2026-11-19/perseed-bowsource-a-obs/` — 8 corpus files (`bowsource-a-s<seed>-bowsource-a-obs.json`)
- `evidence/2026-11-19/bowsource-a-panel-before.json.gz`, `bowsource-a-panel-after.json.gz` — §15 panel legs (identical)
- `evidence/2026-11-19/bowsource-a-panel.json`, `bowsource-a-panel.md` — §15 compare (review_required, zero deltas)
- `evidence/2026-11-19/bowsource-a-obs.log`, `bowsource-a-obs.err` — sweep logs (exit 0; .err empty — the successful run overwrote the first run's STOP output; that STOP is recorded in the prereg addendum, §3)
- `scripts/bowsource-driver-a.js` — bow-supply recorder driver
- `scripts/analyze-bowsource-a.js` — analyzer (selftest 25/25)
- `scripts/test-bowsource-a.js` — proof test (38/38)
- `scripts/build-bowsource-panels-a.js` — panel builder
