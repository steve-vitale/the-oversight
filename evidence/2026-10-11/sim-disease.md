# Longsim: DISEASE PRESSURE lever (2026-10-11)

Lever 7 (disease pressure — vectors, cure gating, mundane/alien pool separation).
Rotation index read 8; task explicitly assigned lever 7. Queue jump justified:
break-diseases r14 landed this morning (2026-10-11) and named open pressure
questions. Index file left at 8; noted here.

Canon read first: docs/CANON.md, docs/DISEASES.md. Break-diseases r14
(evidence/2026-10-11/break-diseases.md) re-read — its S2 assertion was the
thing this run changed (see below).

## Lever played: LOCKJAW CERTAINTY [needs-eyes]

**The gap:** canon (docs/DISEASES.md: "lockjaw … dirty wounds, rust (spasms;
lethal untreated)"; diagnosedDesc: "Without real treatment it kills.") promised
a lethal disease. The engine expired it like a cold at 16 dayParts — the
expireText ("The stiffness lets go by inches") lied about the engine. Same
class of lie the trembles fix (break-it r10) already killed for prions.

**The change** (src/js/statusEffects.js, tickStatuses — mirrors trembles exactly):
- At 8 dayParts left (~2 days): late warning narration ("Find real treatment
  (antibiotics, skilled wound care) or settle what matters. (lockjaw: ~2 days left)").
- At expiry (16 dayParts ≈ 4 days): if the entry was never cured, the player
  DIES — narrated ("The spasms lock everything shut at once … It never opens
  again. (lockjaw — without real treatment, it kills)"), cause 'lockjaw',
  mantle passes, death-cheats hold (maybeCheatDeath('disease') path), second_wind
  stays off (disease death, not violent — same as trembles).
- Easing (herbal_remedy, healer tea) halves suffering but does NOT stop the
  clock — only a real cure (triage / field_medicine / antibiotics, diagnosed)
  removes the entry. Cure direction is named at diagnosis and in the warning.
- Fairness: antibiotics are ruin-found (8%/ruin tile, 50/50 vs antiparasitic);
  triage/field_medicine come from the System; the wound vector (hp<40) gives
  agency through not walking around wounded.

**Second blank filled:** safetynets.js `_first()` truncated stranger descriptors
to bare "A" — the sickness-relief beat read "🛟 A stands up by the fire."
Fixed to use Game.firstRef (which exists precisely for this). Now: "🛟 the
person in their 60s, with a missing fingertip stands up by the fire." (verified)

## Before/after on identical seeds (6 seeds × 2 policies, 200-day horizon)

Engine proof (scripts/test-lockjaw-lever-20261011.js): contract lockjaw day 5
under survivable conditions (fed/watered/healed carrier), competent policy.

| seed | before (harmless expiry) | after (certainty) |
|------|--------------------------|-------------------|
| 7    | contracted, expired silently | DEATH lockjaw day 9 |
| 42   | contracted, expired silently | DEATH lockjaw day 9 |
| 99   | contracted, expired silently | DEATH lockjaw day 9 |

3/3: the Bearer <redacted> the clock runs out; mantle passes; village continues.
r14 S2 test updated to the new canon (was "expires harmlessly"): 66/66 green × 3
seeds (7, 999, 4242).

Full-sweep before/after (scripts/sweep-disease-lever.js, 12 runs): **delta 0**.
Not a no-op engine — the carriers die of combat/starvation before the 4-day
clock runs out (instrumented proof: seed 7's day-55 lockjaw carrier starved the
same day; mantle passed; the disease died with the old scholar). Disease
pressure is subordinate to combat/starvation pressure in these runs — itself a
finding (see village assessment).

Baseline disease numbers (before = after, 12 runs):

| policy | median surv | cases | cures | player disease deaths |
|--------|-------------|-------|-------|----------------------|
| competent (6) | 66d (max 109) | 22 (19 mundane: 14 wound_fever, 5 lockjaw; 3 alien: 2 east_nile, 1 eurika) | 0 | 0 |
| careless (6) | 24d (max 47) | 5 (all wound_fever) | 0 | 0 |

- Death-cause shares (player, competent): combat 32, starvation 16, contest 1 — **zero disease deaths in 12 runs**.
- Death-cause shares (villager): combat 26 total, starvation 9, thirst 5, disease 3 (careless runs, ids '?'), wound 4, murder 1.
- Diagnoses: 3/6 competent runs, 2/6 careless — but **zero cures followed** anywhere. The diagnosis→cure direction IS discoverable (diagnosedDesc + class hints name antibiotics/skilled care), but sim policies never act on it; a real player would. Documented, not changed.
- Vectors probed directly (scripts/probe-disease-vectors.js): risky water → gutrot 17/60 (28%, honest); wound vector at hp<40 → 16%/part (strong — explains competent's 14 wound_fever); trichinosis needs parasiteRisk on the item (my first probe faked an item without it — probe bug, not game bug); mosquito 1.5% and tick escalation verified by r14 H8/H11.

## Reachability verdicts

- **Alien pool: reachable, barely.** 3 giant fights in 12 runs (2 giant_mosquito, 1 alien_tick), all from wave-2 pool; 3 alien cases (2 east_nile, 1 eurika); giant fights won 0/3. The viruses are min-max building blocks a seeker can reach — but only after wave 2 unlocks, and the competent policy flees most giant fights. Lemons (alien_tick): 1 fight, 0 cases — rarest content in the pool.
- **Meat-quirks: reachable in principle** (hushwolf/bulldozer/etc. meat table) — 0 cases in sims because policies cook meat (competent) or die early (careless). Villager-side weirdness verified working (T3: Cheyenne ate hushwolf meat → howls at night, affliction panel row true).
- **Trembles: effectively decoration.** 0 cases in 12 runs — nobody eats human meat (competentEat excludes meat_human; careless never found any). The corruption/cannibalism path is a different lever's territory; documented here as unreached.
- **Lockjaw: now a real threat** (was decoration). Reachable via the wound vector (hp<40); 5 cases in 6 competent runs pre-change.
- **Cure tiers: reachable in code, unreached in sims.** antibiotics ruin loot exists (8%/tile); treatDisease tiers work (proof: diagnosed+antibiotics cures lockjaw); villager healer eases. No sim run ever completed diagnosis→cure.

## Sense findings (SENSE-TESTING LAW — transcripts read)

T1 lockjaw arc (diagnosed, untreated): apply ("your jaw aches — a rusty nail on
a ruin beam. Smiling hurts.") → diagnosis ("You have Lockjaw. … Without real
treatment it kills. Antibiotics end it; skilled wound care (triage, field
medicine) can turn it … (Antibiotics would end it.) — diagnosed by Mara the
nurse.") → warning (~2 days) → death narration → cause 'lockjaw'. Coherent,
escalating, the cure direction named twice. Nit: "Spasms run through You like a
struck wire" — capital-Y You reads awkwardly (seFill {name} mapping; same class
r14 fixed for possessives). Documented, not changed (generic tickText path).

T2 village outbreak (4 sick villagers, 6 daily ticks): "Lena sits with Ivan —
cool cloth, bitter tea, watching the breathing." A NAMED villager raises the
relief beat ("…We can't just watch the fever in the tents happen. Here's what
we CAN do — pick one, maybe two, but everything costs something."), journal
entry, "🤒 Pedro is on the mend — the fever broke." The village reacts like
people: tending, proposing, recovering. (This is where the bare-"A" speaker bug
was caught and fixed.)

T3 villager meat-quirk: "🐺 Cheyenne ate hushwolf meat — and now Cheyenne
howls at night. Nobody taught Cheyenne that." — voiceful, consequential.

## Village assessment (plain words)

The village that competent players build lives ~2 months and dies of
violence and hunger, not sickness. Across 6 competent runs (median 66 days):
32 player combat deaths, 16 starvation, 0 disease. The wound vector is the
only disease pressure that lands (14 wound_fever from fighting hurt), and even
it never kills — it taxes. Careless villages collapse in ~3 weeks (median 24d):
combat 11, starvation 7, and the village itself starts dying of thirst (5),
sickness (3), wounds (3), murder (1) — the careless policy is a village-killer,
which is honest.

Who thrives: fighters who keep HP above 40 avoid the wound vector entirely;
foragers who boil water never see gutrot. Who dies: the wounded who keep
fighting (lockjaw's old harmlessness made this free — now it isn't), the
thirsty, the outmatched. Knowledge missing: nobody in any sim completed
diagnosis→cure (policies don't seek treatment); tick_removal teaching fired
(T2 showed the healer teaching it: "tweezers at the head, steady pull, don't
twist"); antibiotics were never looted in 12 runs (8%/ruin-tile is rare enough
to be a real quest).

What I filled: lockjaw is now lethal-untreated per canon (the pressure lever);
the relief-beat speaker names a person instead of "A". What I documented:
trembles unreached in sims; zero cures in 12 runs (policy gap + rarity);
"You" capitalisation nit in tick text; pre-existing test-survival-nets failure
("rationed villager eats ~half need", fails on pristine tree too).

## Run-wide measures

- Win rate: 0/12. Arc reach: 6/6 Arc II+III (both policies), 0/12 Arc IV.
- Wave reach: competent wave2 5/6, wave3 2/6, wave4/5 0/6; careless wave2 3/6.
- Four-realm formation: 0/12 (no national reach in these runs).
- Median/max survival: competent 66/109d; careless 24/47d.
- Trap acquisition / counter discovery / young-link succession / tier-2: not
  the focus of this sweep; combat-lever sweep owns those measures.
- Pool separation audit (code): contractDisease refuses alien; cureStatus /
  diagnoseDisease / easeDisease refuse alien; examine refuses alien diagnosis;
  metaProgression mirrors the 6+9 roster. No leaks found. r14's 66/66 confirms.

## Tooling

- scripts/sweep-disease-lever.js — 200-day disease sweep (competent + careless policies, per-id/pool cases, cures, diagnoses, death buckets, giant-fight counts, wave/arc reach).
- scripts/probe-disease-vectors.js — direct vector probes (water/tick/mosquito/wound/trichinosis/cure).
- scripts/sense-disease-transcripts.js — narration capture (lockjaw arc, village outbreak, meat-quirk).
- scripts/test-lockjaw-lever-20261011.js — lever proof (contract day 5, 3 seeds, before/after death).

## Regressions

- scripts/test-disease-break-r14-20261011.js: 66/66 × 3 seeds (S2 rewritten for lockjaw certainty).
- scripts/test-survival-nets.js: 99 pass, 1 fail — pre-existing (verified on stashed/pristine tree).
- scripts/validate-ontology.js: 63/63, release permitted.
