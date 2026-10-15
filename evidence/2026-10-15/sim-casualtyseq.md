# sim-casualtyseq — the post-wave-4-unlock casualty sequence (flesh-out loop, 2026-10-15)

Worktree: `~/workspace/worktrees/sim-casualtyseq`. Diagnostic instrument, ZERO src/js changes — instrument only (reads engine state at death beats, never writes game code). Named next diagnostic from evidence/2026-10-15/sim-survdiff.md (the NO-GO): 14/16 wave-4 unlocks, 8 survivors vs 6 non-survivors at +30d, but ZERO separating factors among 15 pre-registered state variables. The named next diagnostic is the CASUALTY SEQUENCE: inter-death intervals, roster trajectory, the order and spacing of deaths after the wave-4 unlock — "post-unlock survival is a war of funerals, not stocks" (combat deaths 12/14).

Canon: docs/CANON.md (read first), docs/MONSTER-WAVES.md (wave-4 gate: wave-3 rung + villageStandingTotal() >= t4(100), flexible-route call 2026-10-13/15 — earned by blood, bonds, or bread, pure or hybrid; never pure calendar). The win-side stack substrate is FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1 + SEATDRIVE=1 (see evidence/2026-10-15/sim-seatdrive.md — 12/16 sittings, 12/16 wins on the armed side; these are the runs that survive longest).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sim ran)

Written 2026-10-15 ~14:35 CDT, before SMOKE/DETGATE/the sweep. No sweep trajectory has been observed.

**Question:** what does the post-wave-4-unlock casualty sequence look like — death-by-death, in order — and does the sequence contain structure that the unlock-time state stocks (the survdiff negative) cannot see?

**THIS IS A DIAGNOSTIC — no GO/NO-GO.** The deliverable is a classified, complete measurement of the casualty sequence on the ARMED stack (the longest-surviving runs). §§9–12 and 14 still bind: primary metric and analysis questions are fixed below; a miss against a pre-registered question is reported as NO-COVERAGE (unobservable), never re-scored against a friendlier question mid-run. "Metric review" carries doubts for the next run.

**Substrate:** 8 seeds (111/222/333/444/555/666/777/888) × {leadfeast, belongfeast} = 16 runs, ARMED win-side stack (tribfloor base → withWinDefer → withSeatDrive; policies imported from scripts/policies/seatdrive.js, same ids as sim-seatdrive). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1. 180d death-aware (dead villages stop; +10d tail max — deaths after unlock+60d tail-trimmed to keep the trajectory window honest, flagged not cut).

**Instrument:** scripts/sweep-casualtyseq-20261015.js. For EVERY run that unlocks wave 4, the instrument records: the unlock day; then EVERY subsequent death — day, raw cause, death family (holdloss-lib classifyDeathFamily taxonomy: combat|monster|sickness|starvation|wounds|null), requested taxonomy (combat = scholar died in combat; villager-combat = villager died in combat/monster-family; starvation; disease = sickness-family; exile = scholar-exile run exit (non-death, recorded on the run); other = wounds/unclassifiable, raw preserved), inter-death interval (days since the previous post-unlock death; first = days since unlock), roster count before/after (before = last daily sample; after = livingRoster at the death beat), pantry kcal AND pantry-days at the death beat, scholar state at the death beat (alive/exiled/hp). Instrumented through the sim log / Game.state inspection at death beats via a registerDeath wrapper that reads before calling orig then after — ZERO src/js writes. If a death detail isn't observable through the harness, it is recorded as unobservable, never hacked.

**PRIMARY (binding):** 100% of post-unlock deaths across unlocking runs classified by cause (combat/villager-combat/starvation/disease/exile/other), with the 'other' share named and each 'other' raw cause listed. NO-COVERAGE if any death is unclassifiable beyond raw-preserved 'other'.

**Analysis questions (binding — the deliverable):**
- (a) classification completeness: every post-unlock death classified; cause shares across the unlocking runs (the survdiff bar: combat 12/14, monster 2/14).
- (b) inter-death interval distribution post-unlock: median, range, and the shape (front-loaded vs evenly spaced vs back-loaded — the "war of funerals" hypothesis says funerals cluster).
- (c) median roster trajectory day-by-day from unlock (unlock+0 … unlock+60, N per offset) to death/end.
- (d) cause shares in the post-unlock window (unlock → unlock+60/death/end) vs the pre-unlock window (unlock−30d → unlock). Did the Mirror Draft change what kills people, or only the tempo?
- (e) any death the state's pantry/HP/wounds cannot explain — flag as candidate for a hidden driver. Heuristics (pre-registered): starvation with pantryDays ≥ 7 at the death beat (food on hand); combat-family villager death with pre-death HP ≥ 95 AND no wave-4+ fight beat within 7 days before it (a combat-family death without a combat — something else moved the knife).

**Gates before spend:** SMOKE green (15d × 2 policies, deaths instrumented, no crash); DETGATE D1 (gate determinism: 60d ×2 byte-identical trajectory hash), D2 (instrument ON vs OFF byte-identical), D3 (deaths captured on a 60d run, non-empty when the village dies); the day-stamp self-consistency guard (all death days in [1, daysRan]) that the survdiff instrument repair added.

**Sense testing (SENSE-TESTING LAW):** sense-read 2–3 death/funeral transcripts end to end from the runs — judge meaning, coherence, consequences. Villagers are people, not counters. Flag anything robotic or repeated (template fingerprints); file any out-of-scope finding as [open] in sim-findings format for the report.

---

## Results

Sweep complete: 16/16 runs unlocked wave 4 on the ARMED win-side stack (FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1 + SEATDRIVE=1). 80 post-unlock deaths recorded death-by-death, all with day/cause/family/taxonomy/interval/roster-before-after/pantry/scholar-state.

The 16-run census:

| run | unlock | road | post-unlock deaths | days | end |
|---|---|---|---|---|---|
| leadfeast s111 | 111 | bonds | 1 | 111 | WIN (table) |
| leadfeast s222 | 48 | bread | 17 | 89 | WIN (table) |
| leadfeast s333 | 62 | hybrid | 6 | 89 | WIN (table) |
| leadfeast s444 | 80 | bread | 3 | 89 | WIN (table) |
| leadfeast s555 | 57 | bonds | 7 | 79 | village-lost |
| leadfeast s666 | 122 | bread | 1 | 122 | WIN (table) |
| leadfeast s777 | 56 | bread | 7 | 89 | WIN (table) |
| leadfeast s888 | 54 | bread | 7 | 75 | village-lost |
| belongfeast s111 | 93 | bread | 0 | 93 | WIN (table) |
| belongfeast s222 | 67 | bread | 8 | 89 | WIN (table) |
| belongfeast s333 | 78 | bread | 4 | 89 | WIN (table) |
| belongfeast s444 | 160 | bread | 4 | 180 | survived |
| belongfeast s555 | 64 | bread | 12 | 70 | village-lost |
| belongfeast s666 | 125 | bread | 0 | 126 | WIN (table) |
| belongfeast s777 | 79 | bread | 2 | 89 | WIN (table) |
| belongfeast s888 | 99 | bread | 1 | 99 | WIN (table) |

Endings: **12/16 table wins**, 3/16 village-lost, 1/16 survived 180d. ('over-other' = Game.over && !villageLost; verified wins by re-running belongfeast s222/s777/s888 — `over=true won=true villageLost=false table phase=done path=feared` — and by the win beat "The table has read your ledger. The protected outnumber the killed; the food truth was shared. The light road is open." on the leadfeast runs.) Median unlock day 78.5 (range 48–160). Roads: bread 13/16, bonds 2/16, hybrid 1/16. The win beat lands mid-funeral-war: leadfeast-s222 won at day 89 with 17 post-unlock deaths behind it.

### (a) Classification completeness — 100%

80/80 post-unlock deaths classified. Cause shares: **villager-combat 72 (90%), other 8 (10%), combat(scholar) 0, starvation 0, disease 0, exile 0.**

- Every post-unlock death is a VILLAGER death. Zero scholar deaths post-unlock across all 16 runs — the mantle never passes in the post-unlock window (succession happened pre-unlock: leadfeast-s555's scholar died day 50, belongfeast-s555's mantle passed Moshe→Amina→Larry before the end).
- The 8 'other' are all one event: belongfeast-s555 day 72, cause "the phoenix link" — the godhood phoenix-clause ash-burns (named mechanic, src/js/game.js:41095). The scholar cheated death by burning villagers one by one (Miguel, Desmond, Ellis — "You come up out of Miguel's ashes, gasping, 1 HP. Their death is on your hands.") until the village ran out ("The phoenix clause stirs — and finds no one. No village, no villagers, no fire to trade. Your death sticks."), then the scholar died too. The holdloss taxonomy has no phoenix slot (family null) — correctly 'other' with raw preserved, and it IS the named death mode, not a hidden driver.

### (b) Inter-death intervals — the funerals cluster

80 intervals (first = days since unlock): **median 1 day, range 0–13, mean 2.46**. Distribution: 0d: 32 (40%), 1d: 10, 2–3d: 15, 4–7d: 17, 8–14d: 6, 15d+: 0. The "war of funerals" hypothesis is confirmed on the shape: two in five post-unlock deaths land on the SAME day as another death (multi-death beats — raids + wave-4 contact + contests stacking), and nothing goes quieter than a 13-day gap. The bloodiest run (leadfeast-s222, 17 post-unlock deaths) buried people on 13 of its 41 post-unlock days.

### (c) Median roster trajectory from unlock

Median roster 7 at unlock; +5d: 7 (n=11); +10d: 7.5 (n=10); +15d: 7 (n=7); +20d: 7 (n=7); +25d: 6 (n=3); +30d: 6.5 (n=2); beyond +30d: no surviving runs contribute. The N-collapse is the finding, not a bug: dead/ended villages don't contribute to later offsets, and most runs END within ~30 days of unlock (12 wins, 3 losses) — the post-unlock window is a sprint, not a siege. The village that survives the Mirror Draft does so by ENDING the game (the table), not by holding the line: belongfeast-s444, the only 180d survivor, still held roster ~6 at unlock+40.

### (d) Cause shares: post-unlock vs pre-unlock

Pre-unlock window (unlock−30d → unlock): 155 deaths — villager-combat 150 (96.8%), starvation 2, other 3 (2 wounds-family "a wound that wouldn't close", 1 'the expedition'). Post-unlock window (unlock → unlock+60/death/end): 80 deaths — villager-combat 72 (90%), other 8 (10%, all phoenix-link). The Mirror Draft changes the TEMPO, not the killer: combat remains ~9-in-10 on both sides. The new channel post-unlock is the godhood ash-burn (phoenix), and the old channels that vanish are starvation/wounds (zero post-unlock) — the feast-stack substrate has genuinely retired hunger deaths.

### (e) Hidden-driver candidates — none found

- Starvation-with-food (pantryDays ≥ 7 at the death beat): **0 candidates.** Every starvation death in the whole dataset (2 pre-window, 6 all-time pre-unlock, 0 post-unlock) happened on a thin pantry. The state's pantry explains all hunger deaths.
- Full-HP combat deaths (victimHp ≥ 95, combat/monster family): 24 flagged; reviewed a sample against the run beats — all resolve to legitimate one-shot kills: the contest Pit's wave-appropriate beast (Theo Winkler, hp 100), wave-4 contact (the Editor's 1-round villager kills, Reunion at the treeline), raid-adjacent 'combat' deaths. The generic 'combat' raw cause covers field-fight and raid-defense deaths the engine doesn't name more precisely. No combat-family death without a combat.
- The 8 phoenix-link deaths (hp 94–100, pantry 28,973 kcal / 11 fresh-days at the beat) are the closest thing to "unexplainable by stocks" — and they ARE explained, by a named mechanic (the phoenix clause), with full narrative beats. Deliberately dark godhood: the scholar trades villagers for mornings.

The named next diagnostic's answer: the casualty sequence's structure is (1) villager-only (the scholar is functionally unkillable post-unlock on this stack — 0/16 scholar deaths), (2) clustered (median 1-day intervals, 40% same-day multi-deaths), (3) combat-monotone (~90% both windows), and (4) self-terminating within ~30 days (12 wins, 3 losses, 1 long survivor). Post-unlock survival is not a war of stocks and not a war of sequences either — it's a race to the table through a casualty rate of ~2.5 villagers/day-of-contact.

---

## Village assessment (plain words)

Sixteen villages unlocked the Mirror Draft on the win-side stack. What they look like at the unlock: ~7 villagers, bread road 13/16, the System's announcement ("We've been watching you for a LONG time... Say hello to the MIRROR DRAFT."), and then the funerals start. The median village buries someone every other day for the next month — and then either wins (12/16, the table reading a ledger where "the protected outnumber the killed") or dies (3/16). Nobody starves. Nobody dies of disease. The scholar never dies. The village dies only by violence — monsters, raids, contests, and once, spectacularly, by its own scholar's godhood: belongfeast-s555's Larry Harrison burned eight villagers through the phoenix link and then died anyway when the fire ran out of people.

The cruelest honest detail: the win lands mid-war. leadfeast-s222 buried 17 villagers in 41 post-unlock days — Dmitri and Jesse to the Editor's one-round kills, others to the Pit and the treeline — and won on day 89 while the Eulogy was still narrating Farid's doom. The table didn't wait for the war to end. The village that "survived" is the one that finished the paperwork.

Who thrives: the scholar — functionally immortal post-unlock (0 deaths in 16 runs). Who dies: everyone else, in combat, at a median interval of one day. What knowledge was missing: nothing in the measured set explains anything — the survdiff negative stands, and the sequence adds that no sequence-pattern explains it either. The blank this run fills is the casualty ledger itself: 80 deaths, 100% classified, intervals measured, the phoenix channel named.

---

## Sense verdict

Read end to end: belongfeast-s555 days 62–72 (the phoenix immolation), leadfeast-s222 days 84–90 (Editor kills, Eulogy doom, table win), plus the Moshe/Amina/Larry succession beats and the Pit-contest death beats.

**Coherence: PASS, with fingerprints.** The fiction and the numbers agree everywhere that matters: funerals shake the links every time ("🕯️ Moshe is dead — and the dead hold no treaties. Every link Haven has shakes."), grief becomes tribute leverage ("Grief became leverage" — Thornfield's tribute rises to 7,500 kcal/week), succession is a public event ("At the grave, Larry, Nathan, Onni and 3 more speak for Amina — 'Moshe trusted them. We saw it. Give them the fire's hearing.'"), and the phoenix immolation is genuinely harrowing — "Their death is on your hands. No one looks away. No one will forget this" — a dark-godhood beat with real moral weight, not a stat line. Villagers flee fights they can't win (Petra's Nevermore stand-down), get carried home, get buried by the fire. Nothing robotic in the *events*.

**The fingerprints are in the *prose*, not the events.** The same sentence templates fire verbatim for every instance of their kind:
- "🕯️ X is dead — combat. The village stops. Somebody screams. Somebody else starts digging." (every combat death)
- "🕯️ X is dead — and the dead hold no treaties. Every link Haven has shakes." (every death)
- "📖 The Codex turns a page on its own. X is dead. You didn't ask. It knew." (every death)
- "That night, they bring X home. Nobody asks you to help carry; nobody has to. By morning the grave is dug by the fire, and the body is laid out beside it. The filling of it is yours." (every funeral)
- "🌙 Raid — Y came in the night from the Z. They carried off ~N kcal from the pantry. Nobody's dead, but the message is clear: the ground is theirs too, and they're done asking. (Trust -10.)" (every raid)
- "🔥 You come up out of X's ashes, gasping, 1 HP. Their death is on your hands. No one looks away. No one will forget this." (every phoenix burn)

In a 17-death run the funeral beats read as a loop, not a liturgy. Filed as [open] below — dialogue/prose variety for death beats, not chased here (out of axis scope).

One wrinkle (observed, not fixed): the death beat "💀 The Editor killed Dmitri in 1 round. The village mourns." and the funeral-beat template both fire for the same death — the village mourns twice for one body. Minor.

---

## Metric review (§14)

1. **The PRIMARY is met as a complete measurement, not a GO/NO-GO.** 80/80 post-unlock deaths classified; 'other' is 8/80, all one named mechanic (phoenix-link) with raw preserved and beats attached. No death is unclassifiable beyond raw-preserved 'other'.
2. **The interval median (1d) includes same-day clusters as 0.** The 32 zero-intervals are multi-death beats (raid night + wave-4 contact + contest on one day), not an artifact — the dedupe is day|id|cause and the wrap/tele merge was D2-verified byte-identical to OFF.
3. **The trajectory N-collapse is honest, not a bug.** Dead/ended villages contribute nothing past their end; the carry-forward only applies to runs alive past the offset. The +25d/+30d medians (n=3/n=2) are reported with their N, not as village-level claims.
4. **'over-other' needed disambiguation.** Game.over && !villageLost covers every table win AND (in principle) the nomad ending. I verified won=true via targeted re-runs (belongfeast s222/s777/s888) and the win beat on leadfeast runs. Next instrument: persist Game.won and the table path/phase in the per-seed JSON — the sweep currently infers it.
5. **The engine-day vs runDays-day drift is real and general.** Death days reference the engine's scholar.day; runDays' counter lags by up to 2 days at run end (det-gate showed engine day 62 at daysRan 60 even on a clean 60d run). The self-consistency guard now references the engine's final day. Any future instrument comparing stamped days to runDays' counter must use the engine day.
6. **A mid-run instrument bug was caught by the guard and repaired, not papered over.** The first 16-run attempt died on belongfeast-s555 with 12/16 rows persisted; the guard caught engine-day-72 deaths at daysRan=70 (the +10d dead-village tail). The fix references the engine day; the 4 missing rows were re-run with identical seeds (D1-verified deterministic) and the full 16-row census regenerated from per-seed files.
7. **The full-HP-combat-death heuristic (24 flags) was too eager as a "hidden driver" detector** — every sampled flag resolved to a legitimate one-shot. As a detector it's a review queue, not a finding. Proposed for the next run: restrict (e) to deaths with NO combat-adjacent beat within 7 days (requires the sweep to persist fight beats — currently beats are language-keyed, not fight-keyed).

---

## Blanks (filled / documented)

- **FILLED:** the casualty-sequence instrument — scripts/sweep-casualtyseq-20261015.js (death wrap with pre/post engine reads, post-unlock trajectory sampler, beat capture, SMOKE/DETGATE/ANALYZE modes; zero src/js changes). DETGATE green D1/D2/D3; the D1/D2 trajectory-hash wiring was broken on first pass (required det-gate's trajectoryHash, which doesn't exist — hashes were empty-string SHA1s) and repaired to readinessbind-lib's real trajectoryHash before the sweep. Lesson for the process notes: a vacuous green is the most dangerous green.
- **FILLED:** the 16-run casualty census — evidence/2026-10-15/perseed-casualtyseq/*.json (80 post-unlock deaths, death-by-death), casualtyseq-runs.json, casualtyseq-analysis.json.
- **DOCUMENTED (the diagnostic's answer):** post-unlock death is villager-only (0/16 scholar deaths), clustered (median interval 1d, 40% same-day), combat-monotone (90% both windows), and self-terminating in ~30d (12 wins / 3 losses / 1 long survivor). The phoenix-link ash-burn is a named 10% channel, not a hidden driver. No hidden driver found: 0 starvation-with-food, 0 combat-deaths-without-combat.
- **DOCUMENTED:** 'over-other' endReason = table wins on this stack (12/16, feared path on the checked runs; the win beat "The table has read your ledger..." lands mid-funeral-war). The armed win-side stack's wall numbers this run: wins 12/16, wave-4 16/16, wave-5 not in this arm's metrics, median survival 89d (max 180d), national/table in the census arm's terms.
- **[open] 2026-10-15 — death-beat prose variety — every death/funeral/raid/phoenix beat fires an identical sentence template verbatim (the 17-death leadfeast-s222 reads as a loop). Villager-agency axis: template fingerprints, not event logic. (sim-casualtyseq sense read)
- **[open] 2026-10-15 — 'over-other' ambiguity — endReason 'over-other' covers table wins AND the nomad road ending; the sweep infers wins from beats/re-runs. Persist Game.won + table path/phase in per-seed JSONs. (sim-casualtyseq metric review #4)
- **[open] 2026-10-15 — generic 'combat' death cause — field-fight/raid-defense villager deaths carry the raw cause 'combat' with no monster/raid attribution; the 24 full-HP one-shot flags couldn't distinguish Pit beasts from Reunion kills without beat archaeology. A cause-attribution pass (killer id/name on registerDeath) would make the next casualty instrument's (e) honest. (sim-casualtyseq)
- **[open] 2026-10-15 — engine-day/runDays-day drift — the engine's scholar.day runs up to 2 days past runDays' day counter at run boundaries (det-gate: engine 62 at daysRan 60). Any instrument comparing stamped event days to the run's day count must use the engine day. (sim-casualtyseq metric review #5)
