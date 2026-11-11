# sim-vetfirst-b — veterans first numbers (Loop B, record-only)

- **Run:** fleshout-loop-b-20261111T0835Z, arm sim-vetfirst-b
- **Prereg:** `evidence/2026-11-11/sim-vetfirst-b-prereg.md` (committed `75018a40` before any judged sim)
- **Base:** `5bb3c595a` ("journey-succession r177: closeout — gate 2 on rebased tip 294/6 all standing")
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-{instrument,driver,analyze}-20261111.js`, `scripts/test-vetfirst-b.js` (committed `096e20ba`, 47/47 green)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190301–190308, competent verbatim, TWO legs on identical seeds (control: instrument ON; neutral: instrument OFF)
- **Seed band:** 190301–190308, verified FRESH per the seed-band skill (zero hits in all dated preregs and dated evidence; recent used bands 180265–180272, 150233–150248, 170301–170308, 180241–180248 all non-overlapping)
- **Canon note:** no `docs/` file covers veterans. `docs/CANON.md` and `docs/MONSTER-WAVES.md` were read first; the veteran-bar rule comes from MONSTER-WAVES.md design call #4 (2026-10-16) and Steve's 2026-11-10 scholar-counts ruling. Nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-vetfirst-b/` — 16 per-seed JSONs (8 control + 8 neutral); summary `evidence/2026-11-11/vetfirst-b-summary.json`
- **Run notes (infrastructure):** the runtime restarted mid-control-leg after 7/8 seeds; seed 190308 control was re-run cleanly (147d, village-lost, 0 errors). During the neutral leg an EPERM write flap forced 2 per-seed files (190307, 190308 neutral) onto the driver's `@@FALLBACK` stdout path; both were recovered byte-complete from the exec log and verified by re-parse (seed/mode/days match the driver summary lines; 0-byte `.tmp` leftovers removed). Neither incident touched the sims themselves — all 16 files parse and all neutrality triples match exactly (see §2).

## Verdict: NO-GO

The analyzer (`scripts/vetfirst-analyze-20261111.js`, exit 1) computes NO-GO on two of six GO rows. The data is complete and the capture is valid — the NO-GO is carried by one genuine engine disagreement and one instrument-bar strictness artifact (see §14, metric review; never re-scored mid-run).

| GO row (prereg §14) | Result | Detail |
|---|---|---|
| 0 unclassified veteran events | GO | 0 unclassified on 8/8 seeds |
| Every wrap live in pilot or proven live in fixture | **NO-GO (analyzer)** | `recordPyrrhicKill` live on 2/8 seeds only (190302, 190308); the other 6 seeds had no pyrrhic kill to record. The wrap is proven live in fixtures (proof B-series) and live in pilot on 2 seeds — pyrrhic kills are rare events (2 in the whole band), not a dead wrap. The analyzer's per-seed ≥7/7 rule is stricter than the prereg wording ("live in pilot or proven live in fixture"). The verdict is NO-GO either way (bar row below), so nothing is re-scored; see §14. |
| Log (non-pyrrhic) == counter per wave 1–5 | GO | 8/8 seeds agree on every wave |
| Engine bar reads == instrument recomputation | **NO-GO** | 7/8 seeds agree. Seed 190305: `waveCombatReadiness(4).veterans` = 1 while `_ladderLivingVeterans(4)` = 0 and the instrument's final snapshot = 0. Genuine engine-internal disagreement — see §9. |
| Neutrality (days + end pantry kcal + deaths) exact | GO | 8/8 exact |
| 0 instrument errors | GO | 0 errors on 8/8 seeds |

## §2 Neutrality (control vs neutral, identical seeds)

| seed | control [days, pantry kcal, deaths] | neutral | match |
|---|---|---|---|
| 190301 | [81, 1289, 59] | [81, 1289, 59] | exact |
| 190302 | [150, 3138, 98] | [150, 3138, 98] | exact |
| 190303 | [129, 19651, 78] | [129, 19651, 78] | exact |
| 190304 | [150, 0, 62] | [150, 0, 62] | exact |
| 190305 | [121, 5680, 69] | [121, 5680, 69] | exact |
| 190306 | [84, 8200, 64] | [84, 8200, 64] | exact |
| 190307 | [146, 0, 75] | [146, 0, 75] | exact |
| 190308 | [147, 0, 69] | [147, 0, 69] | exact |

Neutrality: **8/8 exact**. The instrument does not move the game.

## §3 Headline first numbers

- **Villager veterans form on every seed, then die.** 56 distinct villagers made a wave-3+ kill across the band; 54 of them died before the run ended. Only **2 living veterans** stand at the end of the whole band (one wave-3 killer on 190304, one wave-4 killer on 190307). First veteran day 27–47 (median d34); peak living wave-3 veterans 3–5 per seed, peak wave-4 veterans 0–2.
- **Wave-3+ kills: 93.** Scholar 40 (43%), villagers 53 (57%) — kill-time-keyed. Wild (field) kills by villagers: 39; companion killing blows: 10; aid-crisis: 2. (Prior compchan census on another substrate was 97% scholar — this band is a different substrate and seed set, reported as a fresh number, not a refutation.)
- **Kill log == counter: 8/8.** 469 `recordWaveKill` calls → 447 log entries + 19 exact-repeat dups + **3 kills silently dropped** (the Sponsor-creature — see §5). 2 pyrrhic kills (1 wave-3+, 1 lower wave); pyrrhic kills count toward veteran identity, score nothing toward bars.
- **The veteran bar is the binding constraint on wave 5.** Wave-4 readiness reached on 8/8 seeds (d27–47); wave-5 readiness on 2/8; wave 5 unlocked on 2/8 (d95, d135). The military tribute was never ready on any seed (0/8). The bar was veteran-short for 78–148 days per seed on wave 5.
- **Monster veterans almost never fight.** `castMonster` flags veteran on 55/148 casts (37%, all waves 1–4, none wave 5), but `spawnWorldMonster` flags it on 3/515 wild spawns (0.6%). Only **2 veteran monsters were ever fought** in 8 seeds (elder Focus Group, pack-leader Gavel); both passed the HP×1.5 / speed+1 check. The **+3 damage is still not found in any damage path** (canon-vs-code gap, first live-measured: n=2 fights, no damage-bonus field exists in code; TB telegraphs and field fights both read `mdef.attack.damage` directly).
- **Veterans don't party, don't teach, do chores.** 2 party-days total (1 veteran, 1 seed); 1 veteran-marked teach/mentor event in 8 seeds (`pit_teach`, 190304 d140); 0 party/invite tele rows. Assignments are fish/water/cook. They hold real gear (armor up to 67P; Phase blade, Starfall lance, Crossbow) — two fight barehanded ("your hands").
- **Veteran deaths: 54.** Causes: the wild 41, the arena 7, a stranger 2, monster 1, contest 1, combat 1, sickness 1. Median 5 days after their last kill (mean 12.0d, max 92d); 7 died the same day as their kill; 34/54 within 8 days. 28/54 were the scholar when they made their kill; 10/54 died while being the scholar.
- **Wall:** 0 wins in 8; 2/8 villages survived 150d, 6/8 lost; median survival 137.5d; 574 deaths total (59–98/seed); standing 170–375; scale village 1, regional 7; wave 5 reached on 2 seeds.

## §4 Metric 1 — veteran formation (kill-time-keyed)

Per seed: wave-3+ kills / wave-4+ kills (log, incl. pyrrhic), distinct wave-3+ killers, first-veteran day, peak living veterans (w3 / w4), living at end (w3 / w4), distinct scholar killers, scholar wave-3+ kills.

| seed | w3+ / w4+ kills | w3+ killers | first vet | peak w3/w4 | living end w3/w4 | scholar killers | scholar kills |
|---|---|---|---|---|---|---|---|
| 190301 | 6 / 0 | 4 | d32 | 4 / 0 | 0 / 0 | 2 | 1 |
| 190302 | 18 / 7 | 10 | d35 | 5 / 2 | 0 / 0 | 3 | 2 |
| 190303 | 13 / 4 | 10 | d38 | 4 / 1 | 0 / 0 | 5 | 7 |
| 190304 | 10 / 2 | 7 | d47 | 5 / 1 | 1 / 0 | 4 | 5 |
| 190305 | 10 / 2 | 5 | d32 | 3 / 1 | 0 / 0 | 2 | 3 |
| 190306 | 10 / 3 | 6 | d27 | 3 / 1 | 0 / 0 | 5 | 6 |
| 190307 | 13 / 6 | 10 | d40 | 5 / 2 | 1 / 1 | 5 | 5 |
| 190308 | 13 / 6 | 4 | d33 | 3 / 1 | 0 / 0 | 2 | 11 |
| **band** | **93 / 30** (+1 w5) | **56** | **d27–47** | **3–5 / 0–2** | **2 people** | **28** | **40 (43%)** |

Kill-time keying matters: end-keying against the final scholar vid would misattribute old-scholar kills (the compchan lesson). Scholar kills here are keyed by who the scholar was on the kill day. The one wave-5 kill in the band is on 190307 (Emilio, d146, "The Herald" — the last day before the village was lost).

Veterans form fast (first blood d27–47 on every seed) and peak at 3–5 living wave-3 veterans, but the peak never holds: by run end, 54 of 56 killers are dead. The veteran bar is therefore met transiently and lost, not banked — the same shape vetcount/compchan found on other substrates, now with first numbers on competent.

## §5 Metric 2 — kill-log vs counter reconciliation

Per seed, counter vs non-pyrrhic log per wave, duplicate `recordWaveKill` calls, pyrrhic log entries, off-roster log entries (killer not on the final roster and not the final scholar).

| seed | w1 | w2 | w3 | w4 | w5 | dup calls | pyrrhic | off-roster | verdict |
|---|---|---|---|---|---|---|---|---|---|
| 190301 | 14v14 | 13v13 | 6v6 | 0v0 | 0v0 | 0 | 0 | 0 | agree |
| 190302 | 35v35 | 34v34 | 11v11 | 6v6 | 0v0 | 5 | 1 | 87 | agree |
| 190303 | 26v26 | 16v16 | 9v9 | 4v4 | 0v0 | 0 | 0 | 0 | agree |
| 190304 | 23v23 | 20v20 | 8v8 | 2v2 | 0v0 | 3 | 0 | 52 | agree |
| 190305 | 27v27 | 17v17 | 8v8 | 2v2 | 0v0 | 5 | 0 | 0 | agree |
| 190306 | 24v24 | 13v13 | 7v7 | 3v3 | 0v0 | 1 | 0 | 0 | agree |
| 190307 | 24v24 | 22v22 | 7v7 | 5v5 | 1v1 | 4 | 0 | 55 | agree |
| 190308 | 29v29 | 18v18 | 7v7 | 6v6 | 0v0 | 1 | 1 | 60 | agree |
| **band** | **202** | **153** | **63** | **28** | **1** | **19** | **2** | **254** | **8/8 agree** |

- **Dups (19):** exact-repeat calls deduped by the vetcount-b fix — the counter follows the log, one body = one count. The mechanism holds on all 8 seeds.
- **Off-roster (254):** every off-roster killer vid on the four nonzero seeds is in `regDeaths` (16/16, 8/8, 16/16, 9/9 distinct vids) — the kill log outlives its killers. Expected shape, not a defect: the log is a history, the roster is the living.
- **The dropped kills (3):** the analyzer's `baseWaveBad` count (2 on 190303, 1 on 190306) is not a wave mismatch — it is three `recordWaveKill` calls for `mid=ad_sponsor` (the Sponsor-creature, a wave-3 signature add in `sigW3c.js`, 40 HP) that the engine silently drops. `recordWaveKill` opens with `const mdef = this.data.monsters.find(m => m.id === monsterId); if (!mdef) return;` — `ad_sponsor` is defined inline in the fight, not in `monsters.json`, so the call returns before logging, counting, codexing, or telling the tale. All three were scholar TB kills (Benoit Lambert ×2 on 190303 d117, gen_ndkba96 on 190306 d63). The log/counter agreement above is unaffected because neither side ever sees these kills — but three real wave-3 kills never entered wave accounting at all. Whether an add's kill *should* count is a design question; that it vanishes silently at the choke point is the finding. (New backlog entry, §13.)

## §6 Metric 3 — veteran deaths

54 of 56 wave-3+ killers died before run end. Causes (canonical, via the shared instrument kit): **the wild 41, the arena 7, a stranger 2, monster 1, contest 1, combat 1, sickness 1.** Days from last kill to death: median 5d, mean 12.0d, max 92d; 7 died the same day as their kill, 16 within 0–1 days, 34 within 8 days. 28/54 were the scholar when they made their kill; 10/54 died while being the scholar (44/54 died as non-scholars).

Per seed (killer, kill day → death day, gap, cause, scholar-at-kill / scholar-at-death):

| seed | veteran deaths |
|---|---|
| 190301 (4) | Rosa Mendez d61→d80 (19d, the wild); Giulia Bianchi d53→d80 (27d, the wild); Aidan Duffy d78→d79 (1d, the wild, scholar-at-kill); Kai Brooks d78→d78 (0d, the wild, scholar-at-kill) |
| 190302 (10) | Phumzile Mathebula d104→d106 (2d, wild, scholar-at-kill); Mara Vasquez d140→d140 (0d, wild); Maya Singh d106→d115 (9d, wild, scholar-at-kill); Selinam Yeboah d83→d93 (10d, arena); Karl Lewis d117→d126 (9d, wild); Nino Kapanadze d86→d103 (17d, wild); Niamh Zimmerman d67→d84 (17d, wild, scholar-at-kill + at-death); Quinn Murphy d136→d137 (1d, wild); Fatima Hassan d135→d141 (6d, wild); Hilda Valencia d130→d137 (7d, wild) |
| 190303 (10) | Chester Schmid d55→d57 (2d, wild, scholar-at-kill); Danila Konovalov d40→d58 (18d, wild); Samir Al-Jaber d50→d58 (8d, wild); DeShawn Butler d48→d53 (5d, wild, scholar-at-kill); Valeria Quispe d65→d66 (1d, wild, scholar-at-kill); Emma Larsen d74→d76 (2d, arena, scholar-at-kill); David Kim d85→d101 (16d, arena); Henry Zhang d109→d110 (1d, wild, scholar-at-kill); Jasper Tait d116→d128 (12d, monster); Benoit Lambert d117→d117 (0d, wild) |
| 190304 (6) | Elijah Scott d142→d143 (1d, wild, scholar-at-kill + at-death); Yesenia Mendelsohn d66→d70 (4d, contest, scholar-at-kill); Adriana Yáñez d65→d115 (50d, wild); Zoltan Nagy d95→d136 (41d, a stranger, scholar-at-death); Jovan Milic d115→d115 (0d, arena, scholar-at-kill); Karl Foster d133→d135 (2d, wild, scholar-at-kill) |
| 190305 (5) | Emma Larsen d74→d79 (5d, wild, scholar-at-kill); Mireille Elenga d115→d121 (6d, wild); Milo Strong d43→d100 (57d, a stranger, scholar-at-death); Nadia Khoury d113→d115 (2d, wild, scholar-at-kill); Tama King d120→d121 (1d, combat) |
| 190306 (6) | Ines Duarte d62→d63 (1d, wild, scholar-at-kill); Dieter Sokolov d81→d81 (0d, wild, scholar-at-kill + at-death); Devon Greco d74→d80 (6d, wild, scholar-at-kill); Erick Mugisho d38→d73 (35d, wild); Chen Maier d50→d51 (1d, wild, scholar-at-kill); Nepia Moke d72→d72 (0d, wild, scholar-at-kill + at-death) |
| 190307 (9) | Linda Sanders d125→d130 (5d, arena, scholar-at-kill); Thiago Lugo d51→d63 (12d, wild); Greta Hansen d117→d118 (1d, wild, scholar-at-kill); Casey Kang d74→d76 (2d, wild, scholar-at-kill + at-death); Ellis Kwon d52→d56 (4d, wild, scholar-at-kill + at-death); Hassan Ali d105→d117 (12d, wild, scholar-at-kill); Dale Hoffman d50→d53 (3d, sickness); Zoltan Nagy d86→d121 (35d, wild); Adaeze Nwosu d94→d120 (26d, wild) |
| 190308 (4) | Stephen Kelleher d83→d133 (50d, wild); Dale Hoffman d48→d140 (92d, arena); Kurt Khanna d37→d37 (0d, arena, scholar-at-kill); Ethan Hunt d118→d120 (2d, wild, scholar-at-kill) |

Reading: the wild is the veteran-killer (41/54), not the arena and not monsters. The vetkill-autopsy shape (killers die days after their kill, mean ~6d) reappears here with a longer tail (median 5d, mean 12d, max 92d). Two veterans lived long past their kill (Dale Hoffman 92d, Milo Strong 57d) — survival after blood is possible, just rare. On the "veteran deaths are scholar deaths" question (backlog #545, winseat substrate: 8/8 scholar successions): on this competent substrate 44/54 veterans died as non-scholars and 26/54 were never the scholar at kill time — villager veterans do die here. Substrate-specific, not a refutation; see §13.

## §7 Metric 4 — monster veterans

| seed | casts vet/total | spawns vet/total | vet fights | variants | stat check (HP×1.5 / spd+1) | vet-joined kills | base-wave ok/bad |
|---|---|---|---|---|---|---|---|
| 190301 | 4/13 | 0/47 | 1 | elder 1 | 1 ok | 1 | 33/0 |
| 190302 | 7/22 | 0/81 | 0 | — | — | 0 | 91/0 |
| 190303 | 3/22 | 0/67 | 0 | — | — | 0 | 55/2* |
| 190304 | 9/19 | 2/76 | 0 | — | — | 0 | 56/0 |
| 190305 | 10/17 | 0/52 | 0 | — | — | 0 | 59/0 |
| 190306 | 4/15 | 0/59 | 1 | pack-leader 1 | 1 ok | 0 | 48/1* |
| 190307 | 9/21 | 1/73 | 0 | — | — | 0 | 63/0 |
| 190308 | 9/19 | 0/60 | 0 | — | — | 0 | 61/0 |
| **band** | **55/148 (37%)** | **3/515 (0.6%)** | **2** | **elder 1, pack-leader 1, scarred 0** | **2/2 ok** | **1** | **466/3*** |

\* The 3 "bad" rows are the dropped `ad_sponsor` kills (§5) — no monsters.json def, recorded wave null — not wave mismatches. Every kill with a def records its base wave correctly.

- **Casts vs spawns:** `castMonster` flags veteran on 37% of casts (concentrated waves 1–3; 3 on wave 4, 0 on wave 5 — the rule is older-wave monsters appearing later, so this is the expected shape), but the wild-spawn path almost never produces one (3/515). Monster veterans are a cast phenomenon in this band, not a wild one.
- **The two fights:** 190301 d73, Elder The Focus Group (hp 374, defHp [240,300]×1.5 = [360,450] ✓; speed 4 = 3+1 ✓); 190306 d80, Pack-leader Gavel (hp 486, defHp [300,360]×1.5 = [450,540] ✓; speed 3 = 2+1 ✓). Both pass HP and speed. **Damage was not measurable in either fight** (no damage-bonus field is captured, and the code search found no +3 damage application in any damage path — TB telegraphs and field fights both read `mdef.attack.damage` directly). The +3 damage in the MEMORY ruling is a canon-vs-code gap: HP×1.5 and speed+1 are real, +3 damage is not found in code. (New backlog entry, §13.)
- **The one veteran kill:** the elder Focus Group was killed the same day by a companion (gen_7sk45le, via=companion, recorded wave 3 = the monster's base wave). Base-wave counting holds for the one observed case (n=1, marked approximate in the prereg — the join is same-day + same-mid). The pack-leader Gavel produced no kill that day — it survived the fight.
- **Variants:** 1 elder, 1 pack-leader, 0 scarred (of 2 fights; the cast-time roll is scarred 34% / elder 33% / pack-leader 33%, but variants only materialize at fight time, and fights are rare).

## §8 Metric 5 — veteran behavior

Per seed: party-days (veteran in a party, by day), max armor P seen per veteran, weapon held, assignments while a veteran, veteran-marked teach/mentor tele rows, party/invite tele rows.

| seed | party-days | max armor P (veterans) | weapons held | assignments | teach/mentor | party/invite |
|---|---|---|---|---|---|---|
| 190301 | — | 37–65 | Hunting spear, Harvest Scythe, Crossbow, Phase blade | fish 73, water 13 | 0 | 0 |
| 190302 | — | 10–57 | Starfall lance, Harvest Scythe, Machete, Shard spear, "your hands" ×2 | fish 175, water 12 | 0 | 0 |
| 190303 | — | 10–44 | Phase blade, Crossbow, Crowbar, Hardlight knife, Hunting spear, Harvest Scythe | cook 8, fish 13 | 0 | 0 |
| 190304 | — | 17–67 | Phase blade, Hunting spear, Harvest Scythe, Machete | fish 143, cook 73 | 1 (`pit_teach` d140) | 0 |
| 190305 | — | 17–34 | Phase blade, Hardlight knife, Kitchen knife | fish 80 | 0 | 0 |
| 190306 | ines_duarte: 2 | 8–50 | Machete, Fire-hardened spear, Phase blade, Hunting spear | cook 3, fish 38, water 9 | 0 | 0 |
| 190307 | — | 11–65 | Phase blade, Sharpened stick, Harvest Scythe, Starfall lance, Stone knife, Hunting spear | fish 122, cook 26, water 3 | 0 | 0 |
| 190308 | — | 3–60 | Hunting spear, Phase blade, Stone knife, Sharpened stick | fish 104 | 0 | 0 |

Reading: veterans are geared (armor up to 67P, real weapons — though two fight barehanded) and they work (fish/water/cook dominate their days), but they do not do veteran things. **One veteran spent 2 days in a party in the whole band** (Ines Duarte, 190306 — she killed d62 and died d63, so the party days were her last). **One veteran-marked teaching event in 8 seeds** (190304 d140 `pit_teach` by app_mgpsphgy411). General skill teaching exists (`skill_taught` 4–12/seed, `skill_lesson` 19–48/seed) but is not veteran-flagged — the village teaches, veterans specifically don't mentor. No party/invite tele row fired on any seed. The persistent-party question (Steve 2026-11-10) gets a first number here: on competent, veterans are not a party phenomenon.

## §9 Metric 6 — the bar vs the unlocks

Per seed: first day wave-4 / wave-5 readiness met, days the bar was veteran-short (w4 / w5), end-of-run readiness veterans (w4 / w5), ladder veterans (w4), bar agreement, tribute ready, blooded, unlock days (w3 / w4 / w5, from say beats).

| seed | ready4 day | ready5 day | vet-short days w4/w5 | end vets w4/w5 | ladder w4 | bar agree | tribute | blooded | unlock w3/w4/w5 |
|---|---|---|---|---|---|---|---|---|---|
| 190301 | d32 | — | 29 / 78 | 0 / 0 | 0 | true | false | false | 26 / 61 / — |
| 190302 | d35 | d136 | 43 / 148 | 0 / 0 | 0 | true | false | false | 25 / 51 / 135 |
| 190303 | d38 | — | 70 / 127 | 0 / 0 | 0 | true | false | false | 30 / 46 / — |
| 190304 | d47 | — | 44 / 148 | 1 / 0 | 0 | true | false | false | 25 / 65 / — |
| 190305 | d32 | — | 29 / 120 | **1** / 0 | **0** | **false** | false | false | 27 / 59 / — |
| 190306 | d27 | — | 27 / 82 | 0 / 0 | 0 | true | false | false | 25 / 38 / — |
| 190307 | d40 | d95 | 53 / 123 | 1 / 1 | 1 | true | false | true | 25 / 52 / 95 |
| 190308 | d33 | — | 41 / 146 | 0 / 0 | 0 | true | false | false | 25 / 48 / — |

- **Wave-4 readiness is reachable** (8/8, d27–47) but **wave-5 readiness is not held** (2/8, and both seeds lost the village within days of reaching it — 190302 unlocked w5 d135 and survived to 150d; 190307 unlocked d95, lost d146). The wave-5 bar was veteran-short for 78–148 days per seed: the binding constraint is living veterans, exactly as the 2026-10-17 vetshape finding said.
- **Tribute never ready (0/8).** The military tribute needs 2 payable (non-scholar) living veterans; the band's best was 1 (190307). The full-seat deed gate never opens on this band.
- **Blooded fired once** (190307, say lines d105 + d118) — the wave-5 kill lever's condition (a living wave-4+ veteran) held on exactly one seed.

### The 190305 disagreement (the NO-GO row)

On seed 190305 the three veteran counts disagree at the end of the run:

- `waveCombatReadiness(4).veterans` (standing.js, engine) = **1**
- `_ladderLivingVeterans(4)` (ladder.js, engine) = **0**
- Instrument recomputation from the final snapshot = **0**

The snapshots tell the story. Days 115–120: 1 living wave-3 veteran and 1 living wave-4 veteran (Mireille Elenga, w3+w4 killer), readiness 1/1, scholar Dmitri Sokolov, roster 7. Day 121: the village is lost. The last two veterans die that day — Mireille (d121, "the wild") and Tama King (d121, "combat"; Tama made her wave-3 kill the day before, d120). The d121 snapshots show roster 1 (Yara Haddad, not a killer) then roster 0, veteran counts 0 — but `ready4.veterans` stays 1 in both d121 snapshots, already inside the engine's own read.

Mechanism (read in code, not just inferred): the two functions use different liveness tests. `countLivingVeterans` (ladder.js, shared by `_ladderLivingVeterans`) requires the killer to be **on the village roster** (`roster.indexOf(vid) < 0 → false`) and then checks `vpOf(vid).dead`. `waveCombatReadiness` (standing.js) has **no roster check** — its `isLiving` returns true for anyone whose `vpOf` record exists and is not marked dead. When the roster empties on the final day, a killer whose `vp` record still reads alive is counted by readiness and by nothing else.

By elimination the phantom is Tama King: she is a wave-3-only killer (so she lifts readiness(4), which needs wave-3+ kills, but not readiness(5), which needs wave-4+ kills — and readiness(5) reads 0, as it should); Mireille is the only wave-4 killer among the day-121 dead, and readiness(5) = 0 shows her record was correctly dead. So readiness counts a freshly-dead-in-combat veteran because the `vp.dead` flag lags the roster removal on that death path. This is a hypothesis about the lag, not a proven reproduction — a targeted fixture (kill a veteran in combat on the final day, read both functions) is the named next. It matters because the readiness gate is load-bearing: on 190305 the gate's veteran bar read 1 on a day when no veteran lived. (New backlog entry, §13.)

## §10 Metric 7 — wall numbers

| seed | days | end | standing | scale | maxWave | unlocked | won | deaths |
|---|---|---|---|---|---|---|---|---|
| 190301 | 81 | village-lost | 170 | village | 4 | 4 | false | 59 |
| 190302 | 150 | survived | 375 | regional | 5 | 5 | false | 98 |
| 190303 | 129 | village-lost | 199 | regional | 4 | 4 | false | 78 |
| 190304 | 150 | survived | 199 | regional | 4 | 4 | false | 62 |
| 190305 | 121 | village-lost | 199 | regional | 4 | 4 | false | 69 |
| 190306 | 84 | village-lost | 199 | regional | 4 | 4 | false | 64 |
| 190307 | 146 | village-lost | 320 | regional | 5 | 5 | false | 75 |
| 190308 | 147 | village-lost | 199 | regional | 4 | 4 | false | 69 |
| **band** | **median 137.5d** | **2 survived / 6 lost** | **170–375** | **village 1, regional 7** | **5 on 2/8** | **5 on 2/8** | **0/8** | **574** |

No wins, no national scale, no full seat. The two wave-5 seeds (190302, 190307) are also the two highest-standing villages (375, 320) — standing and wave progress move together, and both still end without a seat.

## §11 Metric 8 — sense test (quoted scenes)

The say sample is the driver's veteran-filtered capture (`SAY_RE`: veteran/blooded/scarred/elder/pack-leader/"put down"/"killing blow"/"veteran kill"/"remember the name"/MIRROR DRAFT/PRODUCERS/FINAL DRAFT/"blood your fighters", 400-line cap per seed). Tele rows are likewise veteran-filtered (teach/mentor/party/veteran/kill/tale/companion/invite/blood). Plain-worded lines outside those filters were not captured — the absences below are stated against the filtered record, not the whole say stream.

**The kill is a show; the death is a row.** Every wave-3+ kill gets the SYSTEM's on-camera beat, byte-identical each time, naming the killer:

> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Rosa just put down Chorus Line... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190301 d32; the same template fires for Giulia d53, Aidan d55, Mireille d81/d101/d115, Tama d120, and 40+ more across the band)

The fiction remembers the name at the kill. It does not remember it at the death. Rosa kills d32 and d61, then dies d80; Giulia kills d53, dies d80; Aidan kills d55, dies d79; Kai kills d78 and dies the same day. Across 190301 d78–81 — four veterans dead, village lost d81 — the only captured line is Sanne leaving a foraging basket:

> 🍽️ Sanne leaves the foraging basket at the door. "The pantry can't take more — sitting with the elders instead." (190301 d78)

Tama kills d120 ("REMEMBER the name"), is hurt at the door the same day, dies d121 with Mireille, and the village is lost — no line marks either death:

> 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Tama just put down The Focus Group... on CAMERA. That's a veteran kill, folks. REMEMBER the name." (190305 d120)
> 🛡️ Yara and Tama met them at the door — 2 put down. Yara, Tama are hurt. (190305 d120)

Greta kills d117 and dies d118 on 190307; the only captured line is the Blooded lever notice, which fires because a living veteran exists — not because one just died:

> Blooded — the village knows where the Producers bleed. (Strikes hit 1.5× as hard; their blows land at 0.75× strength.) (190307 d105, d118)

The door-defense beat is the most human line in the corpus — it names who stood there and that they were hurt. The kill beat is the loudest. Between them, 54 veteran deaths produce no mourning line in the veteran-filtered record. This re-measures backlog #472 (hold beats don't mourn the blooded) and it still stands: the village hears the bind named honestly ("blood your fighters") but gets no fiction for the loss. Caveat: a plain-worded death line ("Rosa is gone") would not match the capture filter, so this is not proof no death beat exists anywhere — it is proof no *veteran-worded* mourning exists in the record, and the death itself is only a count and a register row.

**Monster veterans are announced when they appear — twice.** Both fought veterans got a warning line, and the lines are good:

> ⚠ This one is different — old, patient, unhurried — it has seen your kind before. A Elder veteran. (190301 d73, Elder Focus Group)
> ⚠ This one is different — bigger, and it didn't come alone. A Pack-leader veteran. (190306 d80, Pack-leader Gavel)

Small slip: "A Elder veteran" should be "An Elder veteran". Two lines in 8 seeds is the whole monster-veteran fiction — the cast flags veterans 55 times, but the fiction only ever meets two of them.

**The gate talks.** The producers-waiting beat fires once per seed around d51–71, marking the wave-5 door as a person waiting, not a number:

> 📺 "But finales — FINALES need a LEGEND, sweetheart. More STANDING — blood, bonds, or bread — and look the Mirror Draft in the eye. The producers are WAITING." (190302 d61; same line 190303 d71, 190304 d67, 190305 d59, 190306 d62, 190307 d70, 190308 d51)

**Coherence verdict:** the veteran fiction is loud at the kill and silent at the death. Kills are named, celebrated on camera, retold at the fire (`killer_tale` 18–37/seed; `vet_killer_tale` 2–3 on three seeds; `companion_kill_beat` 49 across the band — the companion-kill beat from backlog #598 now fires). Deaths are counted, not voiced. Veterans themselves read as geared workers, not as characters with a veteran life: they fish, they hold good weapons, they almost never party (2 days in 8 seeds) and never mentor (1 event). Nothing in the corpus is robotic or incoherent — the gap is absence, not nonsense.

## §12 Village assessment, in plain words

Veterans are the village's most expensive product and its shortest-lived one. A villager bloods themselves against a wave-3 monster around day 30, the whole village hears about it on camera, and then — usually within a week — that person is dead in the wild, and nobody says anything about it. Eight villages made 56 veterans and kept 2. The wave-4 door opens on every village because one veteran is usually alive at the right moment; the wave-5 door opens on two villages because two living veterans almost never stand at the same time. The tribute the table wants — two living veterans to send away — never existed on any seed, so the full seat never opened. The monsters, meanwhile, almost never send a veteran of their own: the old beasts are flagged as veterans when they're cast, but they hardly ever reach the wild or a fight, so the village almost never meets one. And the veterans the village does make don't act like veterans: they don't gather a party, they don't teach the young, they fish. The game knows how to make a veteran and how to celebrate one. It doesn't yet know how to keep one alive, how to use one, or how to mourn one.

## §13 Backlog notes

- **#472 (hold beats don't mourn the blooded) — re-measured, still open.** 54 veteran deaths in this band; no mourning line in the veteran-filtered say/tele record. The kill gets "REMEMBER the name"; the death gets a count. The caveat (§11) stands: plain-worded death lines outside the capture filter can't be ruled out, but no veteran-worded mourning exists.
- **#545 (veteran deaths are scholar deaths) — updated by this band's substrate.** On the winseat substrate 8/8 veteran deaths were scholar successions. On this competent band, 44/54 veterans died as non-scholars and 26/54 were never the scholar at kill time. Villager veterans do die here; the finding is substrate-specific.
- **#594 (302 villager field engagements, 0 villager kills) — updated.** On this band, villagers landed 39 wave-3+ field kills (via=wild, non-scholar, kill-time-keyed) plus 10 companion killing blows and 2 aid-crisis kills. Villagers do finish wave-3+ monsters in the field on competent. Different substrate and seeds from the compresence census — a fresh number, not a refutation.
- **#598 (companion killing blows deserve a beat) — the beat now fires.** 49 `companion_kill_beat` tele rows across the band, plus the SYSTEM on-camera "veteran kill" line naming companion killers (e.g., Mireille d115). The fiction now notices companion kills. Status left for the coordinator — the observation is recorded here.
- **#590 (hall door blocks veteran production) — not measured by this arm** (no presence/door instrumentation). Not claimed.
- **#607–#609 (patrol danger, armor channel, raid shapes) — not this arm's axis.** Not claimed.
- **New entries appended to `sim-findings.md`:** (1) readiness-vs-ladder veteran-count disagreement on the final day (190305; standing.js `isLiving` lacks the roster check ladder.js has; phantom = Tama King by elimination); (2) Sponsor-creature kills silently dropped by `recordWaveKill` (no monsters.json def → early return; 3 kills in band); (3) monster veterans cast-flagged 37% but wild-spawned 0.6%, only 2 fought in 8 seeds; +3 damage not found in code (canon-vs-code gap, live-measured n=2); (4) veterans don't party (2 party-days) and don't mentor (1 `pit_teach` in 8 seeds).

## §14 Metric review (§14, never re-scored mid-run)

- **0 unclassified — GO.** Every kill call, cast, and spawn carried mid/by/via (or id). 469 kill calls, 148 casts, 515 spawns, 0 unclassified.
- **Wraps live — NO-GO (analyzer), artifact not capture failure.** 6 wraps live on 6/8 seeds, 7 on 2/8; the missing wrap is always `recordPyrrhicKill`, which fires only when a pyrrhic kill happens (2 in the band: 190302, 190308). The wrap is proven live in fixtures (test-vetfirst-b.js B-series) and live in pilot on 2 seeds. The prereg wording ("live in pilot or proven live in fixture") would pass it; the analyzer implements a stricter per-seed ≥7/7 rule. The verdict is NO-GO regardless (bar row), so this is recorded, not re-scored. A future analyzer revision could score wraps per-band instead of per-seed — but that is a prereg-amendment matter, not a mid-run fix.
- **Log == counter — GO (8/8).** The vetcount-b dedupe holds: 19 exact-repeat calls counted nothing. The 3 dropped Sponsor-creature kills are invisible to both sides (see §5) — the agreement is real for everything the choke point accepts, and the drop is a separate finding, not a reconciliation miss.
- **Bar agreement — NO-GO (7/8).** Seed 190305: readiness(4) = 1 vs ladder = 0 vs instrument = 0 (§9). One seed, one veteran, one day — the final day, when the roster emptied. The mechanism is identified in code (roster check present in ladder.js, absent in standing.js) and the phantom identified by elimination (Tama King). A targeted fixture is the named next; this arm does not reproduce it (record-only).
- **Neutrality — GO (8/8 exact).** Days, end pantry kcal, and death counts identical between legs on all 8 seeds.
- **Errors — GO (0).** Zero instrument errors across 16 runs.
- **Per-seed tables — complete.** Metrics 1–8 tabulated per seed above (§4–§11); sense-test scenes quoted (§11). No blank left unfilled except the stated ones: plain-worded death lines outside the capture filter (§11 caveat), and the `vp.dead` lag mechanism (§9, hypothesis needing a fixture).

## §15 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` — 7 wraps (`recordWaveKill`, `recordPyrrhicKill`, `castMonster`, `spawnWorldMonster`, `startCombat`, `tele`, `registerDeath`) + daily snapshot (pure `waveUnlockReady(4/5)` reads; never `unlockedWave()` / `villageStandingTotal()` mid-run, per the vetkill-diag discipline). Proof: `scripts/test-vetfirst-b.js`, 47/47 green (A1–A6 pure fixtures incl. kill-time keying; B1–B11 live fixtures).
- **Driver:** `scripts/vetfirst-driver-20261111.js` (control/neutral legs, `sampleEvery: 1`, say regex incl. MIRROR DRAFT / PRODUCERS / FINAL DRAFT, 400-line/seed cap).
- **Analyzer:** `scripts/vetfirst-analyze-20261111.js` (exports `reconcileWave`, `analyzeSeed`, `scholarIdOnDay`; exit 1 on NO-GO).
- **Corpus:** `evidence/2026-11-11/perseed-vetfirst-b/vetfirst-s19030{1..8}-vetfirst-pilot-{control,neutral}.json` (16 files). Summary: `evidence/2026-11-11/vetfirst-b-summary.json`.
- **Files in this commit:** this evidence file, the summary JSON, and the 16 per-seed JSONs. Prereg (`75018a40`) and instrument/driver/analyzer/proof (`096e20ba`) were committed earlier in this arm.
- **No lever, no src/js change, no landing claim.** Record-only measurement arm. Merged locally, pending ship (coordinator merges; no push, no bump, no live verification by this arm).
