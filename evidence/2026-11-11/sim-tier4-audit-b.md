# sim-tier4-audit-b — Tier 4 unknowns audit (Loop B, code-read verdicts)

- **Run:** fleshout-loop-b-20261111T1630Z, arm sim-tier4-audit-b
- **Base:** `7f1c61a6e` at spawn; rebased onto current master before finishing (see §14)
- **Proof:** `scripts/test-tier4-audit-b.js` — 88/88 green (static source checks A1–A14 + live fixtures B1–B11, one `loadGame` + `setupGame`, seed 190301)
- **Method:** code-read verdicts only. NO new sim bands, NO src/js changes. Grounding: coverage audit `hidden_files/coverage-audit-20261110.md` §6 and `evidence/2026-11-11/sim-vetfirst-b.md` §13 (backlog entries (2) and (3)).
- **Canon note:** no `docs/` file covers veterans, shelter, temperature, exposure, or betrayal as a system. `docs/CANON.md` was read first; the veteran rule comes from `docs/MONSTER-WAVES.md` design call #4 (2026-10-16) and Steve's 2026-11-10 scholar-counts ruling. Nothing here invents canon. The "exposure" in the audit's shelter/temperature/exposure row is WEATHER exposure (`temperature.js` `villagerStress`, scene `'exposure'`); `exposure.js` is a different system entirely — the social exposure list (lies named at the fire). The audit's grouping conflates the two; this file keeps them separate.

## Pre-registration (written before verdicts)

- **Primary metric:** all six unknowns closed with a verdict + code citations.
- **GO threshold:** 6/6 verdicts with file + function citations.
- **Seeds / policy:** none — code-read arm, no sim bands. The only sim numbers cited are wall numbers quoted from `sim-vetfirst-b.md` (see §12), not re-run.
- **Verdict scale:** measured-ready / substrate-missing / code-vs-canon gap / already-recorded-unanalyzed / driver-absent / panel-absent.

## Verdict: GO — 6/6

| # | Unknown | Verdict | One line |
|---|---|---|---|
| 1 | Shelter / temperature / exposure | **driver-absent + panel-absent** (substrate present, engine-auto) | All three systems are wired and run themselves daily; no driver verb ever plays them and the 31-metric panel judges none of them. |
| 2 | Betrayal | **driver-absent + panel-absent** (substrate present, engine-driven) | Plots arm and spring daily from `endDay`; NPC-vs-NPC plots resolve on their own, but player-targeted plots wait on `acceptInvite`, which no driver ever calls; no panel metric. |
| 3 | Veteran +3 damage | **code-vs-canon gap — REFUTED** | The comment claims +3 damage; `startCombat` applies HP×1.5 and speed+1 only. No damage term exists on any veteran path. |
| 4 | Tile-entry / background-roam veteran flag | **code-vs-canon gap — CONFIRMED absent** | Only `castMonster` computes the flag. Tile-entry and background-roam spawns pass plain defs and are never veterans, even when older-wave. |
| 5 | `american_woodcock` regions field | **measured-ready (no defect)** | The missing `regions` field is irrelevant: spawning reads `regionAnimalPool()`, and the woodcock IS in the default region's list. It spawns. |
| 6 | Landing `monsterKills` records | **already-recorded-unanalyzed** | Records carry `monsterId` + `wave` (+ day, cause, player); W1/W2 per-kind kills are already recorded and just unaggregated. `killer` is always null. |

## §1 Shelter / temperature / exposure — driver-absent + panel-absent

**Substrate: present and wired.** `node scripts/check-wired.js` on all three files: shelter.js 10 functions / 0 unwired, temperature.js 26 / 0, exposure.js 8 / 0. All three are loaded in `index.html` (lines 62–139).

**Shelter** (`src/js/shelter.js`): the village musters ITSELF. `shelterMusterCheck()` is wrapped into `Game.progDaily` (shelter.js, end of file) ahead of the raid tick; a wave-4+ world monster within radius 2 of Haven musters everyone except the scholar, and it stands down only past radius 3 (hysteresis, journey crisis r20). Live proof (test B1): a wave-4 `algorithm` placed on the Haven tile makes `shelterThreatNearHaven()` return the threat, `shelterMusterCheck()` musters, every non-scholar villager becomes sheltered (`isSheltered` true), and `shelterAllClear()` releases them. The Oct shelter panels exist (`evidence/2026-10-15/sim-siegeroster.md` — the muster beat fired and read well).

**Temperature** (`src/js/temperature.js`): `install()` runs at load and wraps `rollWeather` (stashes `state.tempC`/`tempBand`, observes the sky), `advancePart` (`stressTick()` — heat/cold/storm costs in hydration, energy, kcal; heatstroke/frostbite at the extremes), `diseaseVectorTick` (heat wakes mosquitoes; hard freeze shelves them), `endDay` (`narrateSky()` + `villagerStress()` — the village wakes aching from deep cold/scorching heat, `Game.wornDamage(id, 3, {scene: 'exposure'})`), plus the modifier pipeline (snow/frost/heatwave/storm forage, travel, and fire modifiers) and a ×1.75 hydration burn in heatwaves. Knowledge-gated: precise readings and forecasts only after 7 observed days in the region, a sky-reader villager, or the `forecast` ability; before that, felt lines only. Live proof (test B2): `Game.temperature.tempC()` returns a clamped number, `skyKind()` a named sky, `canReadSky()` a boolean.

**Exposure (weather)** is `temperature.js` `villagerStress` / `stressTick` — NOT `exposure.js`. `src/js/exposure.js` is the SOCIAL exposure list: every truth dragged into the light is a real attributable event (`{day, kind, accuser, accused, charge, detail}`) on the kept list, fed by villagers naming lies at the fire (`exposureFireTick`, once an evening at most, 14% chance, blunt villagers likelier to speak), confessions, and moot bribery exposure; the Witness path (`table-witness.js`, exposed ≥ 3) reads the list. Live proof (test B3): `recordExposure()` records a real event and the kept list holds it.

**Driver status: ABSENT.** Zero calls in either driver to any shelter, temperature, or betrayal verb (test A2 checks 15 verb names against both `scripts/policies/competent.js` and `scripts/policies/capable.js`): no `shelterMuster` / `shelterStandDown` / `shelterVillagers`, no `stressTick` / `villagerStress` / `canReadSky`, no `acceptInvite` / `declineInvite` / `resolveInvite` / `npcInviteTick`. The only near-hits are comments (`competent.js:1839` mentions "exposure" in passing; `capable.js:201` mentions a "betrayer" hostile). The drivers DO call `Game.nearFire()` — but only to gate cooking (`competent.js:59,280-289`), never as a cold response. So: the systems run, but no sim driver ever *plays* them — nobody seeks shade in a heatwave, shelters early, stands a muster down, or reads the sky on purpose. The muster and the stress are weather the village endures, not decisions anyone makes.

**Panel status: ABSENT.** The standing panel (`scripts/balance-metrics.json`, 31 metrics: won/entered/table/national, survival30/60, playerDeaths, villageDeaths, communityLost, livingNpcs, lowFood, lowWater, lowHealth, npcHungry, classAccess, npcClassAccess, goodGear, contestShowGear, craftTradeGear, corpseGear, usefulIntake, bearerChanges, abilityAccepted, luckHunt/Trap/Snare/Pit/Fish/Overall) contains no shelter, temperature, exposure, betrayal, or veteran metric (test A1). The only downstream proxies are `lowWater` (heat drinks you faster) and `lowHealth` (cold/heat wear the village down) — a regression in any of the three systems is invisible until it moves a downstream number.

**What measurement each still needs:** a driver arm that actually plays the verbs (stand-down timing, seek-fire/shade, sky-reading) plus one panel metric per system (muster-days, exposure damage share, exposure-list length). Until then the verdict stays driver-absent + panel-absent — the audit's "unknown" is closed as *present-but-unplayed-and-unjudged*, not unmeasured.

**Sense test:** the fiction is human where it fires. The muster line names the threat through the knowledge-gated noun ("scouts report … hunting near Haven, and it is beyond us. Everyone inside."); the fire-naming lines make the accuser pay a visible social price ("It costs [namer] to say it; you can see the price land."). Nothing robotic — the gap is absence of play, not nonsense.

## §2 Betrayal — driver-absent + panel-absent

**Substrate: present, wired, engine-driven.** `src/js/betrayal.js` (5,714 lines) provides invites, grievances, motives, plots, ambushes, moot cases, and trade. `check-wired.js`: 158 functions, 1 unwired (`recentTrauma`, betrayal.js:1902 — dead helper, no caller). `betrayalDailyFull()` runs from the `endDay` wrap (betrayal.js:5658); `betrayalDaily()` runs `considerBetrayalPlot()` + `npcPlotTick()` + `npcInviteTick()` + bond ticks + `dayOneNudge()` every day (betrayal.js:4251–4270).

**How plots actually move:** `considerBetrayalPlot()` (betrayal.js:707) arms at most one active plot: day ≥ 6, roster ≥ 4, strongest-motive pair, NPC-targeted threshold 35 / player-targeted 45, beloved gate (player-targeted plots ~never when the village loves you — average trust > 55 and low justice heat blocks 90%), a 40% daily roll, and 2 accomplices recruited. `npcPlotTick()` (betrayal.js:~4200) resolves armed plots: non-player targets DECIDE by character via `npcInviteDecision` (temperament, relationship, goal, mood, fear; sick targets stay home) and the ambush springs if they take the lure. Player targets are SKIPPED — "player plots spring via acceptInvite" (betrayal.js:4238). Invites themselves are NPC-initiated daily (`npcInviteTick`, betrayal.js:491): 0–2 NPCs get an invite idea per day once average trust passes ~15.

**Driver status: ABSENT.** Neither driver calls `acceptInvite`, `declineInvite`, `resolveInvite`, `npcInviteDecision`, or `npcInviteTick` (test A2). Consequence: in sims, NPC-vs-NPC betrayal can arm and spring on its own (the engine does it), but a betrayal aimed AT the scholar can never spring — the lure sits pending until it expires (pendings expire after 2 days). The driver never takes a lure, never declines one, never talks a plot down. The whiffguard instrument the audit cited (`scripts/test-crisis-betrayal-whiffguard-r154.js`) is a staged-probe proof for the r154 betrayal-fight softlock fix (party.js `tbAdvance` loop + the whiff guard counting hostile humans as foes), NOT an analyzer that judges betrayal firing in sims — it spawns a probe per case and asserts the fight resolves as `betrayal_routed`. No November analyzer judges plot arming, springing, or moot outcomes; the November evidence files that mention betrayal (`journey-crisis-r168/r176`, `journey-deepening-r125`) cite it only in passing.

**Panel status: ABSENT.** No betrayal metric among the 31 (test A1). The moot/exposure path surfaces only through `exposure.js`'s kept list, which no panel reads either.

**What measurement it still needs:** a driver arm that takes/declines lures (or a specialist policy that plays the invite verbs) plus a panel metric (plots armed / sprung / resolved, moot cases opened). The NPC-vs-NPC half is measurable today with a tele-counting instrument — the player half needs the driver to play first.

## §3 Veteran +3 damage — code-vs-canon gap, REFUTED

The comment at `src/js/game.js:35086` (inside `startCombat`) says veterans are "hardened. +50% HP, +3 damage, +1 speed. They've survived too." The application:

- `startCombat` fighter construction applies exactly two of the three, in BOTH branches — snake segments (`game.js:35214`: `if (isVeteran) { hp = Math.round(hp * 1.5); spd += 1; }`) and normal fighters (`game.js:35264–35265`, same two lines). Test A4b pins both occurrences.
- No damage term exists anywhere on the veteran path (test A4c: no `dmgBonus`/`damageBonus`/damage assignment in any `isVeteran` block; grep for `+3 damage` across `src/js/` finds only the comment itself and one unrelated monster ability line at `game.js:45668` — a rep's "+3 damage to allies" aura, not a veteran bonus).
- Every damage path reads the raw def: telegraphs carry `dmg: (m.mdef.attack || {}).damage` (8 sites, test A4d), field fights likewise. The fighter row carries the whole `mdef` and no fighter-level damage field (test B4g).
- Live proof (test B4, hummice control vs veteran): veteran HP is def HP ×1.5, speed is def speed +1, and veteran `mdef.attack.damage` is byte-identical to the control's (`[4,8]` both) — no +3 carried.

**Verdict:** the +3 damage in the MEMORY ruling is a canon-vs-code gap — HP×1.5 and speed+1 are real, +3 damage is not in code. This CONFIRMS the vetfirst live measurement (n=2 fought, no damage-bonus field) in code. NOTE: vetfirst §13 entry (3) already recorded this as a new backlog entry; this arm confirms it in code and does NOT re-run the band.

**Named next arm:** decide whether +3 damage SHOULD exist (Steve-call: the comment is either a spec to implement or a stale line to correct) — `startCombat` fighter construction (`game.js:35214` / `35264`), plus a damage-path read if the bonus should show in telegraphs. Do not land here; this arm makes no src/js changes.

## §4 Tile-entry / background-roam veteran flag — code-vs-canon gap, CONFIRMED absent

Only ONE path computes the veteran flag: `castMonster()` (`src/js/game.js:34898–34901`): `const isVeteran = targetWave < wave; return { id: pick.id, veteran: isVeteran };`. `spawnWaveTarget()` (`game.js:34843–34857`) deliberately picks older waves — at unlocked wave 5, 45% of picks are waves 1–4 — so older-wave spawns are common by design.

The spawn paths:

| Path | Call site | Veteran? |
|---|---|---|
| Wanderer contact | `game.js:24703` — `spawnWorldMonster({id, veteran: wanderer.veteran}, ...)` | YES when cast flagged it (castMonster result carried on `this.wanderer`) |
| Feast draw | `src/js/feastBuff.js:697` → `castMonster()`; flag rides `s.feastDraw`, read at `game.js:35092` | YES when cast flagged it |
| Tile-entry | `game.js:24622` — `spawnWorldMonster(mdef, px, py, {mx, my})` | NO — plain def, no `veteran` in opts; `spawnWorldMonster` honors only `opts.veteran \|\| mdef.veteran` (`game.js:20527`) and a data def carries no `veteran` field |
| Background roam | `maintainWorldMonsters`, `game.js:20636` — `spawnWorldMonster(mdef, spot.x, spot.y, {})` | NO — empty opts |
| Fled recovery | `game.js:12988` — `spawnWorldMonster({id: fled.id}, ...)` | NO — and doubly so: the `fledMonsters` record (`game.js:24271`) stores id/mx/my/stance/hp/maxHp with NO veteran key, so a veteran that flees across a boundary comes back plain |
| Trap / Quiet Woods | `game.js:23884`, `26888` — bare `{id}` / `'hushwolf'` | NO (wave-1 kinds; veteran inapplicable) |

Live proof (test B5/B6): a plain-def spawn and a bare-`{id}` spawn both return `veteran === false`; `spawnWaveTarget` picks older waves on a live pool (200 draws, mixed), while only `castMonster` returns a veteran boolean. This CONFIRMS the vetfirst live measurement in code: `castMonster` flags veteran on 55/148 casts (37%) but `spawnWorldMonster` flags it on 3/515 wild spawns (0.6%) — the 0.6% is the wanderer-contact (and feast-draw) trickle; the other ~99% of wild spawns are tile-entry and background-roam, which never flag. Only 2 veteran monsters were ever fought in 8 seeds because almost no wild spawn carries the flag to fight.

**Verdict:** the audit's "ambiguous in the code read" is settled — tile-entry and background-roam older-wave spawns are NOT veterans. Whether they SHOULD be is a design question (the tile-entry comment at `game.js:24606–24610` says tile-entry "uses the same wave ratios as castMonster" — the ratios match, the flag does not). NOTE: vetfirst §13 entry (3) already recorded the 37%-vs-0.6% split; this arm confirms the mechanism in code and does NOT re-run the band.

**Named next arm:** carry the veteran flag on tile-entry and background-roam spawns (pass `veteran: tw < unlockedWave` at `game.js:24622` and `20636`, mirroring `castMonster`) — IF Steve rules older-wave roamers should be veterans. File/function named; no change made here.

## §5 `american_woodcock` regions field — measured-ready (no defect)

The audit's data gap is real but harmless: the woodcock entry in `src/data/animals.json` (~line 760) has `biomes: [thicket, forest_floor]` and NO `regions` field (its neighbor entries carry `"regions": ["north_america"]`). But the `regions` field on an animal def is NEVER read by the spawn path. Spawning reads `regionAnimalPool()`:

- `regionAnimalPool()` (`src/js/game.js:397–415`): `fauna.animals + add − remove`, plus landing variants; returns **null** when the region lists no animals ("null = no region list → every animal").
- `initTileWildlife()` (`game.js:10806`): admits an animal when `(!pool || pool.has(a.id))` — biome match plus pool membership.
- `checkAnimals()` (`game.js:13451`) draws from the tile's `wildlife` population, which is seeded by `initTileWildlife`.

And the woodcock IS in a region list: `na_eastern_woodlands` — the DEFAULT landing region (`DEFAULT_REGION_ID`, `game.js:181`) — lists it in `fauna.animals`. It is in exactly 1 of 20 regions' lists (test A10e). Live proof (test B7): the default-region pool contains `american_woodcock`, and 500 seeded thicket tiles DO grow woodcock. (The other 11 regions carry no `animals` list at all, so their pool is null and every animal — woodcock included — can seed there; the 8 remaining listed regions exclude it.)

The missing `regions` field matters in exactly one place: knowledge-gating (`game.js:48462–48466`, `canShow('animal')`), where `adef.regions || ['north_america']` defaults a field-less animal to North America — the woodcock IS North American, so the default is correct for it.

**Verdict:** measured-ready. No defect, no arm needed. The audit's "check whether `regionAnimalPool()` can ever include it" is answered yes — on the default region it does, live.

## §6 Landing `monsterKills` records — already-recorded-unanalyzed

The landing census (`scripts/journey-landing-r100-20261104.js:4221–4231`, R22) builds `monsterKills` from `Game.state.telemetry` death rows:

```js
out.push({ day: t.day, monsterId: t.who, cause: t.cause, wave: t.wave,
           player: !!t.player, killer: t.killerId || null });
```

The death tele row itself (`src/js/corpses.js:219`, the SIM TELEMETRY death hook in `registerDeath`) carries `{kind, who, cause, wave, player}` — `wave` is looked up from `monsters.json` by `opts.monsterId`. Live proof (test B10): a `registerDeath({kind:'monster', monsterId:'gavel', ...})` produces a tele row with `who === 'gavel'` and `wave === 3`. The engine's own kill log agrees: `waveKillLog` entries are `{d, mid, w, by, via, trick}` (`game.js:34650`), so `mid` + `wave` are recorded at the choke point too.

So W1/W2 per-kind kills ARE already recorded — `monsterId` + `wave` on every monster-kill record in the landing census — and just unaggregated: the landing analyzers (`scripts/journey-landing-r26-analyze.js:31` maps them to `monsterId d<day> <cause>` strings for display; `analyze-landing-r104-20261105.js:146` uses only `.length`) never roll them up per kind. The audit's "analyzers only ever use `.length`" is true of the aggregate judgments but understates the r26+ analyzers, which do list the records — the gap is aggregation, not recording.

One hole: `killer` is ALWAYS null. The census reads `t.killerId`, but the death tele row carries no `killerId` (test A11c/B10b) — `registerDeath` callers pass `killerId` in some paths (e.g. betrayal ambush deaths, `betrayal.js:1048`) but `corpses.js` does not forward it into the tele row. Per-kind kills by wave are recoverable today; per-killer attribution from these records is not.

**Verdict:** already-recorded-unanalyzed. What measurement it still needs: an analyzer pass over the existing landing census JSONs grouping `monsterKills` by `(wave, monsterId)` — no new sims, no instrument change. (The `killer` hole needs a one-line `corpses.js` forwarding fix if killer attribution is ever wanted — named next, not done here.)

## §7 Vetfirst §13 overlap — confirm / deny in code

**(a) Sponsor-creature kills silently dropped — CONFIRMED in code.** `recordWaveKill` (`game.js:34530–34532`) opens with `const mdef = this.data.monsters.find(m => m.id === monsterId); if (!mdef) return;`. `ad_sponsor` is defined inline in the fight (`src/js/sigW3c.js:360`, `mdef: { id: 'ad_sponsor', name: 'Sponsor-creature' }`), not in `monsters.json` — so the call returns before logging, counting, codexing, or telling the tale. Live proof (test B8): `recordWaveKill('ad_sponsor', ...)` moves neither the log nor the counters; a real `gavel` kill right after logs `{d, mid, w, by, via}` (test B9). The 3 dropped kills in the vetfirst band are exactly this mechanism. Whether an add's kill *should* count is a design question; the silent drop is the finding. (Vetfirst §13 entry (2) already filed as a new backlog entry; confirmed here, not re-run.)

**(b) Monster veterans cast-flagged 37% but wild-spawned 0.6%, only 2 fought in 8 seeds — CONFIRMED in code.** Mechanism is §4 above: `castMonster` flags veteran whenever the picked wave is below the unlocked wave (`game.js:34898`), while `spawnWorldMonster` only carries a flag the caller passes (`game.js:20527`), and the two high-volume wild paths (tile-entry `game.js:24622`, background-roam `game.js:20636`) never pass one. The 0.6% is the wanderer-contact + feast-draw trickle. The 2 fought veterans both passed HP×1.5 / speed+1 in the live band, and §3 confirms the +3 damage absence in code. (Vetfirst §13 entry (3) already filed; confirmed here, not re-run.)

## §8 Driver status (summary)

| System | Engine-side? | Driver plays it? | Panel judges it? |
|---|---|---|---|
| Shelter / muster | Yes — `progDaily` wrap, auto | No — zero verb calls | No |
| Temperature / weather exposure | Yes — `advancePart`/`endDay` wraps, auto | No — zero verb calls (`nearFire` is cooking-only) | No (`lowWater`/`lowHealth` are downstream proxies) |
| Social exposure (lies list) | Yes — `endDay` wrap, auto | No | No |
| Betrayal plots/invites | Yes — `endDay` wrap, auto | Half — NPC-vs-NPC springs alone; player half waits on `acceptInvite`, never called | No |

## §9 Panel status (summary)

31 metrics, none for shelter / temperature / exposure / betrayal / veterans. The panel sees these systems only through downstream proxies (`lowWater`, `lowHealth`, `villageDeaths`, `table`, `national`, `won`) — a regression in any of them is invisible until it moves a downstream number.

## §10 What measurement each unknown still needs

1. **Shelter/temperature/exposure:** a driver arm that plays the verbs + one panel metric per system. No new sim band settles this — the substrate is proven live in fixtures.
2. **Betrayal:** a driver arm that takes/declines lures + a panel metric for plots armed/sprung/resolved. The NPC-vs-NPC half is instrumentable today.
3. **Veteran +3 damage:** no measurement — a Steve-call (implement the +3 or correct the comment), then a fixture re-run of test B4.
4. **Roam veteran flag:** no measurement — a Steve-call (flag older-wave roamers or not), then a fixture re-run of test B5.
5. **Woodcock:** none. Closed.
6. **monsterKills:** an analyzer pass over existing landing census JSONs grouping by `(wave, monsterId)`. No new sims.

## §11 Sense-test notes

- The muster beat names the threat through the knowledge-gated noun and tells the village what to do ("Everyone inside. No one walks the treeline alone"). The fire-naming lines make the accuser pay ("It costs [namer] to say it; you can see the price land"), and the liar's confession lines read as a person choosing honesty ("I lied because the truth felt small").
- Veterans read as hardened in the fiction ("old, patient, unhurried — it has seen your kind before") but the +3 damage the fiction implies is not in the numbers — the one place the fiction over-promises.
- Nothing in this audit's scope was robotic or incoherent. The gaps are absence of play and absence of judgment, not nonsense.

## §12 Wall numbers (cited from sim-vetfirst-b.md, NOT re-run)

Vetfirst band (seeds 190301–190308, 150d death-aware, competent): **0 wins in 8; 2/8 villages survived 150d, 6/8 lost; median survival 137.5d; 574 deaths total (59–98/seed); standing 170–375; scale village 1, regional 7, national 0, table 0; wave 5 reached on 2 seeds; wave-4 readiness on 8/8 (d27–47), wave-5 readiness on 2/8, wave 5 unlocked on 2/8 (d95, d135); military tribute never ready (0/8); veteran bar veteran-short for 78–148 days per seed on wave 5.**

## §13 Metric review

- **6/6 verdicts with citations — GO.** Every unknown closed with a verdict, file + function citations, and a live or static proof in `scripts/test-tier4-audit-b.js` (88/88 green).
- **Proof strength:** verdicts 3, 4, 5, 6 and both vetfirst overlaps are proven twice — once statically (source strings) and once live (fixtures B4–B10). Verdicts 1 and 2 rest on static proof (driver grep + panel contract + wrap sites) plus live proof that the substrate runs (B1–B3, B11); the "driver never plays it" half is a grep over both drivers, which is the right instrument for a negative — but it is a negative, and a future driver change could invalidate it without this file noticing.
- **Correction recorded mid-run:** the first proof run went 77/88, and two of the failures corrected the audit rather than the code. (i) My A10e asserted the woodcock is in NO region's animals list — wrong: it IS in `na_eastern_woodlands` (the list-membership check I ran first tested the substring `'woodcock'` against list elements). The corrected verdict (§5) is stronger: it spawns on the default region, live. (ii) My B4 veteran-fighter lookup failed because the B1 algorithm monster still sat on the Haven tile and shadowed `playerMonster()` — a test-ordering bug, not a code finding; removing it after B1 fixed the run. Both fixes are in the committed test.
- **What this arm did not do:** no sim bands, no src/js changes, no re-runs of the vetfirst band. The two Steve-calls (§3 +3 damage, §4 roam flag) and the `corpses.js` killer-forwarding hole (§6) are named next arms, not landed fixes.

## §14 Files and reproducibility

- **Proof:** `scripts/test-tier4-audit-b.js` — 88/88 green. Run: `node scripts/test-tier4-audit-b.js`. No jest, no concurrent processes.
- **Wiring:** `node scripts/check-wired.js src/js/shelter.js src/js/temperature.js src/js/exposure.js src/js/betrayal.js` — shelter 10/0, temperature 26/0, exposure 8/0 unwired; betrayal 158 functions, 1 unwired (`recentTrauma`, betrayal.js:1902).
- **Rebase:** tree based at `7f1c61a6e`; rebased onto current master `192962bb3` before finishing; proof re-run after the rebase (88/88 green).
- **No lever, no src/js change, no landing claim.** Audit-only arm. Coordinator merges; no push, no bump, no live verification by this arm.
