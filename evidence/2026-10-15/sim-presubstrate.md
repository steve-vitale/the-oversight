# sim-presubstrate — READ-ONLY full-chain reachability census on the pre-seat stack (2026-10-15)

**Run:** flesh-out loop ARM 3, run_id fleshout-20261015T221507Z, scale-onramp axis.
**Type:** DIAGNOSTIC — no lever, no GO threshold. The deliverable is the reachability table + a verdict per content piece.

## Pre-registration (MEASUREMENT §§9–12, 14)

- **Primary metric:** per-content-piece reachability on the pre-seat stack (counts + days), not a win rate.
- **GO threshold:** none (diagnostic). Verdicts are descriptive: REACHABLE vs DECORATION, with numbers.
- **Substrate:** FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE/WAVE5REACH/W3DRIVE unset (asserted at load — the sweep exits 2 if any optional gate is set). Policies: TF.leadfeast / TF.belongfeast (the tribfloor base ids, plain — no winpursuit/windefer/seatdrive wrappers; WINPURSUIT/WINDEFER are inert on the base policies, set so the env matches the declared composition).
- **Seeds:** 8 FRESH [151,262,373,484,595,706,817,928] — all verified unused across evidence/ (0 `"seed": N` / `SEEDS=` hits). x {leadfeast, belongfeast} = 16 runs.
- **Horizon:** 180d death-aware (dead villages stop, +10d tail max — harness dead-village tail; Game.over breaks).
- **Instrument:** scripts/presubstrate-20261015.js — read-only census wrap: pre-dawn sample (arc via progState().arc, scaleRank, _havenPolity, unlockedWave sampled DAILY — finding #360, table invite/sitting rising edges, vest scan of scholar+roster for military_vest/swat_vest, exile flag) + Game.say passthrough capturing set-piece beats (bounded 2000/run, 0 dropped across all 16). Proof: scripts/test-presubstrate-20261015.js (33/33 GREEN; det-gate 4/4 trajectory-identical instrument-on vs instrument-off, both-repeat design). Analyzer: scripts/analyze-presubstrate-20261015.js.
- **Comparison substrate:** sim-wincensus control side (same composition, seeds 11/22/33/44/55/66/77/88): national 6/16 (lead 6/8, belong 0/8), table 15/16 invites / 0 sittings, wins 0/16, wave-4 14/16, wave-5 5/16, median survival 120.5d, exiled 0/16.

## Census table

Per-seed JSONs: evidence/2026-10-15/perseed-presubstrate/ · beats: evidence/2026-10-15/presubstrate-beats/

| seed | policy | days | end | arcII | arcIII | arcIV | reg | nat | realm | w3 | w4 | w5 | inv | sit | vest | ex | win |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 151 | belong | 131 | village-lost | 9 | 12 | 80 | 42 | 73 | 50 (belong/sub) | 58 | 79 | 93 | 1 | 0 | 0 | 0 | 0 |
| 151 | lead | 133 | village-lost | 9 | 12 | 92 | 47 | 78 | 73 (lead/led) | 78 | 91 | 107 | 1 | 0 | 0 | 0 | 0 |
| 262 | belong | 87 | village-lost | 9 | 13 | 65 | 42 | 74 | 70 (belong/sub) | 50 | 64 | 85 | 1 | 0 | 1 | 0 | 0 |
| 262 | lead | 137 | village-lost | 9 | 13 | 102 | 47 | 78 | 57 (lead/led) | 81 | 102 | 120 | 1 | 0 | 0 | 0 | 0 |
| 373 | belong | 101 | village-lost | 9 | 10 | 62 | 42 | 73 | 64 (belong/sub) | 46 | 61 | 69 | 1 | 0 | 0 | 0 | 0 |
| 373 | lead | 160 | village-lost | 9 | 10 | 73 | 47 | 88 | 86 (lead/led) | 65 | 72 | 93 | 1 | 0 | 0 | 0 | 0 |
| 484 | belong | 170 | village-lost | 9 | 10 | 90 | 42 | 73 | 69 (belong/sub) | 78 | 89 | - | 1 | 0 | 2 | 0 | 0 |
| 484 | lead | 151 | village-lost | 9 | 10 | 99 | 47 | 78 | 57 (lead/led) | 88 | 99 | 103 | 1 | 0 | 0 | 0 | 0 |
| 595 | belong | 150 | village-lost | 9 | 10 | 91 | 42 | 86 | 85 (belong/sub) | 72 | 90 | - | 1 | 0 | 0 | 0 | 0 |
| 595 | lead | 141 | village-lost | 9 | 13 | 75 | 47 | 78 | 58 (lead/led) | 62 | 75 | 85 | 1 | 0 | 0 | 0 | 0 |
| 706 | belong | 154 | village-lost | 9 | 18 | 99 | 42 | - | - | 63 | 98 | - | 1 | 0 | 0 | 0 | 0 |
| 706 | lead | 76 | village-lost | 9 | 18 | 69 | 47 | - | - | 50 | 69 | 73 | 1 | 0 | 0 | 0 | 0 |
| 817 | belong | 108 | village-lost | 9 | 15 | 59 | 42 | - | - | 40 | 58 | - | 1 | 0 | 0 | 0 | 0 |
| 817 | lead | 91 | village-lost | 9 | 15 | 59 | 47 | 78 | 57 (lead/led) | 46 | 58 | 71 | 1 | 0 | 0 | 0 | 0 |
| 928 | belong | 109 | village-lost | 9 | 17 | 96 | 49 | - | - | 67 | 95 | - | 1 | 0 | 0 | 0 | 0 |
| 928 | lead | 136 | village-lost | 9 | 17 | 112 | 47 | 78 | 58 (lead/led) | 87 | 108 | 120 | 1 | 0 | 0 | 0 | 0 |

## Reachability verdicts (per content piece)

| Content | Result | Verdict |
|---|---|---|
| Arc II (The Show) | 16/16 @ d9 | REACHABLE — but clock-like: d9 on all 16 seeds x both policies (finding filed) |
| Arc III (Engines) | 16/16 @ d10–18 | REACHABLE |
| Arc IV (The Inefficiency) | 16/16 @ d59–112 (= invite day in all 16) | REACHABLE |
| Regional | 16/16 @ d42–49 | REACHABLE |
| National | 12/16 (lead 7/8, belong 5/8) @ d73–88 | REACHABLE |
| Four-realm formation | 13/16 (lead/led x8, belong/sub x5) @ d50–86 | REACHABLE |
| Wave-3 unlock | 16/16 @ d40–88 | REACHABLE |
| Wave-4 unlock | 16/16 @ d58–108 | REACHABLE |
| Wave-5 unlock | 11/16 @ d69–120 (lead 8/8, belong 3/8) | REACHABLE |
| Table invite | 16/16 (full seat 6/16, lesser 10/16) | REACHABLE — the seat prices honestly on both rungs |
| Table sitting | 0/16 | DECORATION on this substrate — no policy plays the seat-taking verb (tableTakeSeat, Haven panel only) |
| Win | 0/16 | DECORATION on this substrate — follows from 0 sittings |
| Vests | 2/16 runs, 3 vests (swat_vest: priya_nair s262; military_vest: ines_duarte + scholar s484) | REACHABLE but rare |
| Exile | 0/16 | not observed on this road |

**Mission question answered:** the win-side content is reachable on its own terms — emphatically NOT decoration. Arc IV, national, four-realms on both roads, wave-4/5 unlocks, full AND lesser seats all reached without any seat driver. What fails is SURVIVAL: 16/16 villages die (village-lost) before they can sit. The bind is mortality, not reachability. The table priced them; nobody sat down — and this time the census shows they were priced honestly, many on full seats.

## Mortality / survival shape

- **All 16 runs ended village-lost.** Median survival 134.5d (min 76d, max 170d). Zero survivors to the 180d horizon.
- **Death causes (685 villager/monster deaths):** combat 65% (444), villager combat 15% (103), monster 13% (91), expedition 3% (21), contest 1% (10), ambush 1% (7), starvation 1 death (0.1%), dehydration 2, wound 2, The Audit 1, Grief Counselor 1, The Moderator 1, The Congregation 1, alien 1.
- **What kills villages that reach national/table but never win:** combat attrition under the OVERTIME rerun ladder. Once the table is set, OVERTIME ×1→×6 escalates wave 4–5 reruns (+25%→+150% HP, +12%→+72% damage, +1→+3/pack) and docks standing each tier; the village fights reruns while the Herald eats 1,300–1,965 kcal nightly from the stores. Starvation is solved on this substrate (1/685 deaths) — villages die rich and armed, ground down by reruns. The scholar's death is usually late (s373: bearer <redacted> d157, last villager d160).
- **The belong road's on-ramp is still the fragile face:** 3/8 belong runs never reached national (s706/s817/s928), dying d108–154 at regional. The lead road reached national 7/8.

## Wall numbers (this stack, fresh seeds)

- national 12/16 · table 16/16 invites / 0/16 sittings · wins 0/16 · wave-4 unlocks 16/16 · wave-5 unlocks 11/16 · median survival 134.5d (max 170d) · vests 2/16 · exiled 0/16.

## Comparison vs wincensus substrate (same composition, seeds 11..88)

| | wincensus (seeds 11–88) | presubstrate (fresh seeds) |
|---|---|---|
| national | 6/16 (lead 6/8, belong 0/8) | 12/16 (lead 7/8, belong 5/8) |
| table invites / sittings | 15/16 / 0 | 16/16 / 0 |
| wins | 0/16 | 0/16 |
| wave-4 / wave-5 | 14/16 / 5/16 | 16/16 / 11/16 |
| median survival | 120.5d | 134.5d |
| exiled | 0/16 | 0/16 |

Same composition, seed-set variation: national reach and wave-5 unlocks roughly double on the fresh seeds, but the structural result is identical — invites fire, nobody sits, everybody dies. The wincensus findings (the missing seat-taking driver; the table priced them and nobody sat down) replicate on fresh seeds. The belong road improved (0/8 → 5/8 national) but remains the fragile on-ramp.

## Village assessment (SENSE-TESTING LAW)

### Run A: reached national/table — leadfeast s373 (160d, national d88, lead/led realm d86, wave-5 d93, FULL seat, invited d73)

What it looked like: Haven led a realm of four fires. On d86 the speakers of Emberhold, Stonebridge, and The Hungry Road II rode in for the first court — "every one of them is measuring you." On d87 the shared granary opened: 5,000 kcal to every fire, no strings, trust +10 each. The village that did this was a dozen named people: Thao, Shannon, Emma, Gauthier, Sanne, Nino, Malik, Brian, Amanda, Ato. They fought everything the System sent — the Moderator for 8 rounds, the Understudy for 7, a Highbeam Deer for 3 — and kept walking, "bloodied but breathing." Brian put down a tick and the village talked about the questing legs afterward ("It waits. The questing legs wave — the tell."). The scholar learned Draw Fire on d115: "you make yourself the problem... the beast's eye stays on you and off them." Keepsakes evolved with flashbacks — the Coat button: "The last winter before the Scattering. You don't talk about it." The Thread Home ran through the run: the scholar's sister Youstina El-Torky, Taken at the Scattering — "The Photo Album still says their name." Nino died to The Audit on d73: "The village mourns."

What the scholar did with the table invite: the table was set on d90 — "take your seat from Haven when you are ready. Nothing is final until you sit." The scholar never took it. There were no hands for the verb: the courtship-road policy chain has no seat-taking driver, and the scholar was busy being the village's engine — feasting (×2.53, keepsake-channeled), feeding the realm, fighting the OVERTIME reruns ×1→×5 while the Herald ate the stores nightly. Every escalation said it aloud: "Take your seat from Haven to stop the clock." The Nielsen was named on d109; scouts found its lair on d119 — "You cannot face it alone. Sound the call." The scholar (carlos_diaz) died in combat on d157; the mantle passed; the last villager fell on d160.

Who thrived and why: the fighters (Sanne, Malik, Shannon — repeated stand-downs against wave-2/3 monsters), the realm (three subordinate fires fed and courted), the scholar as a late-game feast engine. Who died and why: Nino to the Audit mid-game; everyone else to rerun attrition under OVERTIME. Missing capabilities: exactly one — the seat-taking verb. Everything else the run needed, it had.

### Run B: died — leadfeast s706 (76d, regional only, lesser seat, invited d69, wave-5 d73)

What it looked like: a smaller, warmer story. Nora, Stan, Sari, Iker, Gina, Yuki, Ruth, Roberto, Thabo — they fought moths and boars and hushpuppies and kept walking. The keepsakes spoke: Hard Candy's flashback — "Butterscotch, doled out like medals — good report card, brave dentist visit, the day the dog died." The Thread Home: the scholar's brother Yakov Sorokin, Taken at the Scattering — "The Dead Phone still says their name." The garden kept honest books (untended grapes drowned in weeds, twice). The village reached Arc IV on d68 and wave-5 on d73. On d73 four belltoads and two player-characters died in a single day's combat — the fighting core wiped at once. On d76, as the first court's speakers rode in from Emberhold, Stonebridge, and Thornfield, the village came apart: "Haven couldn't hold. On the third hungry day, people started walking — in different directions. The scattering, again." The realm's court arrived to a fire going out.

Why it died and what was missing: combat depth. The village met wave-5 monsters with a wave-3 village — the d73 massacre took the fighters, and there was no second rank. The table had been set on d69; the village died with the invitation open, seven days old.

Sense verdict: both transcripts read as people, not mechanics. Named villagers with keepsakes, flashbacks, grief, feasts, a garden that keeps honest books, a Thread Home that names the Taken. Nothing robotic, nothing repeated-by-template. The deaths are honest combat attrition with in-fiction weight (the d76 dispersal beat is the run's thesis restated). The fiction of "invited but never sits" is structural and legible in the beats: the table waits politely ("Nothing is final until you sit") while the OVERTIME clock runs — the village doesn't refuse the seat, it never gets a free dawn to take it.

## Metric review

This was a diagnostic arm by design — no pre-registered GO threshold, so nothing to bind or miss. All census fields proved measurable: arc days, rank days, realm formation day/shape, wave unlock days via daily unlockedWave() sampling (finding #360's method gap closed — 11/11 wave-5 unlocks dated, d69–120), invite/sitting counts via rising edges, vest scans, exile flags, death-cause shares. One field behaved unexpectedly: arcII fired at day 9 on all 16 seeds x both policies — suspiciously uniform for the deed-gated Arc II (breadth+6 or contest); filed as a finding rather than re-scored. For the next census: add per-day standing to explain wave-4/5 unlock variance (standing rungs t4=100/t5=200 are the bind), and sample pantry-days at national reach to test the "starve mid-ambition" thesis against this substrate (starvation deaths were 1/685 here — the thesis needs re-testing, not repeating).

## Findings filed

- Arc II uniformity (see sim-findings.md).
- Finding #360 method closure: daily unlockedWave() sampling dates all wave unlocks (11/11 wave-5 dated d69–120) — the instrument pattern is proven; future sweeps should sample, not guess.
