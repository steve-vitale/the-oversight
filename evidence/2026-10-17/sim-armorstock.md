# sim-armorstock — the quartermaster protocol (2026-10-17)

Run: flesh-out loop arm sim-armorstock (run_id fleshout-20261017T2015Z), axis scale-onramp (blocking).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (readiness gate, design call #4) + docs/BEAR.md (butchering → hide_armor L1).
Worktree: ~/workspace/worktrees/sim-armorstock. Branch: sim-armorstock.
**ZERO src/js changes.** New files ONLY: scripts/policies/armorstock.js, scripts/armorstock-census.js,
scripts/sweep-armorstock-20261017.js, scripts/test-armorstock-20261017.js, evidence/2026-10-17/sim-armorstock.md
(+ per-seed JSONs under evidence/2026-10-17/perseed-armorstock-census/ and perseed-armorstock/).

## The question

sim-armorbreak (commit a5fb01f8) sharpened steve-call #427 from the armor side: the wave-4 armor bar is
mortality-selected — 34/47 demand-meeting villagers died post-unlock in the draft they unlocked; breadth is
universal (junk patchwork on every living villager) but depth is 1-3 trophy pieces (alien_carapace/bloodplate/
stormcloak) with marginal P=15/17 qualifiers; the bar clears on a knife's edge and any casualty re-shorts it;
6/7 armored scholars died post-unlock. The bar measures worn junk-patchwork with no reserve. Named next:
"consider measuring something durable (armory stockpile)". Do NOT loosen the veteran demand (#427 unanswered —
defaults stand); the armor side is actionable.

This arm: (a) a DURABLE-ARMOR CENSUS on current master (trophy-armor acquisition rates, armory stockpile levels
over time, worn-depth at wave-4 deferral points, 100% attribution); (b) the ARMORSTOCK=1 quartermaster protocol —
the scholar routes trophy armor to readiness-tracked villagers / holds an armory reserve for veterans, through
the scholar's real verbs only.

## Pre-registration (docs/MEASUREMENT.md §14 — BINDING, written BEFORE the sweep)

- **Substrate (asserted at startup, recorded per-seed):** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
  RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 EXPLICIT (pre-seat wave-4 deferral substrate, same as
  sim-vetshape for comparability; SEATDRIVE=0 avoids win-truncation confounding the deferral reads),
  ALLOWGATE2 unset. Sweep-time master commit recorded in every per-seed JSON.
- **Policies:** {leadfeast, belongfeast} = SD.leadseat/SD.belongseat (the exact vetshape policyFor mapping).
  Armed side wraps the base in AS.withArmorstock (scripts/policies/armorstock.js); control is the bare base.
- **Seeds:** 8 FRESH (4101117, 4211219, 4321321, 4431423, 4541525, 4651627, 4761729, 4871831 — 0 filename hits
  across evidence/ verified 2026-10-17 before the sweep). 8×2×{control,armed} = 32 runs, identical seeds per arm.
- **Horizon:** 180d death-aware (never a fixed 200d; dead villages stop simulating). Rationale: wave-4 unlocks
  in the vetshape corpus landed d89–146; 180d covers the unlock window + post-unlock bleed on survivors. The
  vetrel lesson applies: read endReason/village-lost rate + total deaths, not just scholar.day.
- **PRIMARY (binding):** wave-4 unlock share, armed (ARMORSTOCK=1) minus control (ARMORSTOCK unset) ≥ **+3 runs**
  (on 16 runs/arm). A miss is NO-GO, never re-scored.
- **SECONDARY (report-only):** deferral armor-margin coverage — share of deferral runs with the armor bar met at
  margin ≥2 (6+ armored @ P≥15).
- **GUARDRAILS (kill conditions):** starvation deaths armed > control+2; median survival armed < control−10d;
  any new death mode on armed; wave-4 unlocks bought with mass death.
- **Pilot gate:** the 8-seed census (part a) runs first; the sweep is the confirm. Kill fast at pilot if the
  census shows no armor-stock movement for the protocol to work (e.g. zero trophy acquisitions).
- **Convergence:** converging | converged | parked | killed-at-pilot (reported at end).

## The policy (scripts/policies/armorstock.js)

ARMORSTOCK=1 — the quartermaster protocol. The scholar manages the village's trophy-armor stock through real
verbs. Five legs:

1. **RECOVERY** (verbs: lootCorpse): opportunistically recovers armor from unlooted villager corpses at the
   scholar's own node (bounded 2/day). The census bleed means armor sits on corpses; honest costs apply
   (trauma + trust — the village watches).
2. **RESERVE** (pack discipline): trophy pieces (single-slot P≥15) in the scholar's inventory are earmarked as
   the armory reserve — never dropped, never donated. Counted in ctx = the stockpile metric.
3. **WEAR** (verb: equip): the scholar wears the reserve's best piece — the scholar IS a readiness-tracked
   fighter and counts toward the bar (competent's gearUp already does this; kept).
4. **CRAFT** (verbs: butcher via normal play, craft): pursues hide_armor (P20 ≥ 15, bar-qualifying — the landed
   "butchering armor L1" design call) when worn P < 20 and hide≥2 + vine≥1 are on hand. Bounded: 1 attempt/day,
   max 3 blind attempts (materials at risk at L1). Game.craft enforces every knowledge gate. Control only
   crafts bark_armor (P10, below the bar).
5. **SUCCESSION** (verbs: lootCorpse, equip): on scholar death (bearer change), the new scholar prioritizes the
   predecessor's death pack — same-node corpse loot, then wear best. Minimizes the bar-drop window.

**The substrate gap (documented, not worked around):** the engine has NO deliberate scholar→villager armor
transfer verb (no gift/trade UI action; loot goes to the scholar's pack only; dropItem loses to the woods; the
stash has no armor section — "armor/misc have no deposit hook (no communal armor pile, canon)", storage.js),
and canon (Steve 2026-10-09, INDIVIDUAL OWNERSHIP) forbids a communal armory and automatic redistribution.
Armor flows TOWARD the scholar (the sink), never away. So "the scholar routes trophy armor to readiness-tracked
villagers" is implemented as: the scholar (a readiness-tracked fighter) wears the best piece, recovers dead
villagers' armor into the reserve, and re-arms fast on succession — the stock stays in circulation instead of
sitting on corpses. A villager-held armory reserve needs a Steve ruling (a gift verb or an armor deposit hook);
filed as a finding, not built.

## Proof (scripts/test-armorstock-20261017.js)

22/22 GREEN (run 2026-10-17, substrate as pre-registered):
- 10 fixture checks (gate on/off, reservePieces/scholarWornP/armorCorpsesAtNode reads, wrapper shape).
- RED→GREEN: gate-off delegates purely (no as* ctx keys, no verb calls); gate-on engages all five legs
  (craft attempts hide_armor at L3+materials+need; craft stands down with trophy in pack; recovery calls
  lootCorpse on a same-node armor corpse; succession fires + narrates on bearer change).
- DET-GATE: withArmorstock(base) with ARMORSTOCK unset = byte-identical day-hash trajectories to the pristine
  base policy, 8/8 (4 seeds × {leadfeast,belongfeast}, 60d).

## Part (a): durable-armor census

16/16 runs, 100% attribution (every run carries a deferral census; 0 unattributed). Control only (ARMORSTOCK
unset), 8 fresh seeds × {leadfeast, belongfeast}, 180d death-aware, substrate as pre-registered. Sweep commit
262523ef07f23fc1b641833360e15c8c62b019a4. Per-seed JSONs: evidence/2026-10-17/perseed-armorstock-census/.

**Acquisition rates (trophy = single piece P≥15):** 1–5 trophy pieces per 180d run (mean 2.3). First appearances
are dominated by spawn-pool equipping (day-30 samples: alien_helm, alien_gauntlets, alien_greaves, alien_boots —
the alien set; adaptive_dermis, swat_vest, worldroot_plate, bloodplate, shelter_cloak). Mid-run loot adds ~1
piece per run at best. **The village's trophy stock is essentially spawn-bound** — ~2–4 pieces total per run,
and the stock SHRINKS over time (s4101117: 4→3 pieces; pieces leave on dead villagers' corpses).

**Butchering channel:** hide_armor crafts = 0/16 runs. bark_armor crafts = 0/16. The butchering→hide_armor L1→craft
channel (landed design call) is completely dormant on the control substrate — the scholar never crafts
bar-qualifying armor. This is the protocol's opening.

**Armory stockpile over time:** scholarPackTrophy ≈ 0 on all runs — the scholar WEARS what they find
(competent gearUp); no reserve is held. Scholar worn P fluctuates violently: s4211219 leadfeast 42→5→37 (the
armored scholar died; the successor started naked at P5 and took ~60 days to re-arm to P37). The succession dip
is real and slow.

**Worn-depth at wave-4 deferral:** armor bar 0–4/4 (median 1/4); only 1/16 deferrals met the bar (s4101117
belongfeast 4/4 — but veterans bound there, so still no unlock). The scholar is UNARMORED (P<15) at 5/16
deferrals (P10–14) — the craft leg's target. Margin≥2 (6+ armored): 0/16.

**Wall numbers (census corpus):** national 0/16, table 0/16, wins 0/16, wave-4 unlocks 0/16, median survival
~160d, village-lost 9/16. (Pre-seat substrate; the wins live on the seatdrive stack.)

**Pilot gate verdict:** NOT invisible — proceed to the sweep. The stock moves (thinly), the craft channel is
dormant (opportunity), succession dips are slow (opportunity), 5/16 deferrals have an unarmored scholar (+1
available via hide_armor P20).

## Part (b): before/after

32/32 runs (8 fresh seeds × {leadfeast, belongfeast} × {control, armed}, identical seeds per arm, 180d death-aware, substrate as pre-registered). Sweep commit 262523ef07f23fc1b641833360e15c8c62b019a4 (same base as the census). Per-seed JSONs: evidence/2026-10-17/perseed-armorstock/. Compare: evidence/2026-10-17/armorstock-compare-20261017.md.

**PRIMARY (binding): wave-4 unlock share armed−control = +0 (0/16 vs 0/16). GO needed ≥ +3. → NO-GO.** The miss binds per §14, never re-scored. The layer is killed zero-trace (scripts/policies/armorstock.js deleted; proof test INFO-SKIPs honestly — it was 22/22 GREEN pre-kill).

**SECONDARY (report-only):** deferral armor-margin≥2 coverage 0 vs 0, delta +0.

**Guardrails:** starvation deaths 17 vs 16 (kill if armed > control+2=18) → hold. Median survival 175d vs 181d (kill if armed < control−10=171) → hold. New death modes: the compare script flags 'thirst' as new-on-armed — investigated, FALSE POSITIVE: both 'thirst' (src/js/game.js:28705, water-rationing death) and 'dehydration' (src/js/engine/calories.js:158, overnight scholar death) are pre-existing engine cause labels; 1 death each is RNG noise over which label a water death drew. No genuine new death mode. No mass-death-bought unlocks (no unlocks at all).

**Leg engagement (armed, 16 runs):** recovered=1, crafted=0 (tries 0), reservePeakTotal=11, successions=113, recoveryTries=42. Mean reserve (trophy in scholar pack, end): 0.13 vs 0.06. Mean scholar worn P (end): 38.8 vs 37.4. Control counters null (no leg writes) — the det-gate held.

**Wall numbers:** national 0/16 both, table 0/16 both, wins 0/16 both, wave-4 unlocks 0/16 both, village-lost 8/16 control vs 9/16 armed, median survival ~175–181d.

## Sense-testing (SENSE-TESTING LAW)

Honest scope note: no full transcripts were sense-read on this arm — the sweep verdict killed the layer before transcript work, and transcripts were not a binding metric here. What the proof verified (22/22 GREEN pre-kill): the succession leg fires + narrates on bearer change; the recovery leg calls the real lootCorpse verb; the reserve leg counts real pack pieces. Leg counters in the sweep (recoveryTries=42, successions=113, reservePeakTotal=11) show the legs engaged through real verbs, not stubs. No senseless-behavior flags were raised by the instruments.

## Village assessment

Thirty-two villages on the pre-seat FEASTSCALE_R13 substrate, and the story is the same one the census told: they die hard and never reach wave 4. Village-lost 8–9/16; combat is the mass killer (~480–490 combat deaths per arm across 16 runs — the wave-1/2/3 meat grinder). The armor bar at deferral reads −1 to −4 (short by 1–4 armored fighters); the veterans bar binds alongside (armorbreak: 34/47 armored villagers died in the draft they unlocked). Trophy armor is spawn-bound (~2.3 pieces/run) and shrinks as bearers die; the scholar's worn P whipsaws on succession (the census's 42→5→37). Nothing in this corpus unlocks wave 4 — on either arm.

## Findings (for the backlog — NOT chased mid-run)

- [open] 2026-10-17 — armor — wave-4 unlocks NEVER occur on the pre-seat FEASTSCALE_R13 substrate (0/32 runs here, 0/16 in the census). Any armor-side lever is unmeasurable on unlock share here; the retry needs an unlock-capable substrate (the seatdrive stack where vetshape saw unlocks) with a re-registered margin metric. (sim-armorstock)
- [open] 2026-10-17 — tooling — the compare script's naive death-cause set-diff false-positives pre-existing engine cause labels ('thirst' vs 'dehydration' are both engine-real water deaths). Guardrail checks need cause canonicalization before flagging "new death mode". (sim-armorstock)
- The substrate gap from the policy section stands: no deliberate scholar→villager armor transfer verb exists, and canon (INDIVIDUAL OWNERSHIP) forbids a communal armory — a villager-held armory reserve needs a Steve ruling.

## Metric review (§14 — binding, never re-scored)

The PRIMARY (unlock share ≥ +3) was honest when pre-registered — it was the design question (#427's armor side). The miss is real and binds: NO-GO. But the metric review must record WHY it missed: the metric asked the lever to move wave-4 unlocks in a corpus where unlocks never occur on either arm (0/32). The lever's actual effect (reserve +0.07, scholar worn P +1.4, legs engaged) is real but an order of magnitude below any bar that matters. This is closer to SUBSTRATE-MISSING than CONCEPT-DEAD: the durable-stockpile concept was never actually tested, because the test bed has no unlocks to move. Per the §14 escape hatch, only a METRIC-BROKEN retry may return as a new pre-registered run — the honest retry is: unlock-capable substrate + PRIMARY reframed as armor-margin-at-deferral (the thing the lever touches) rather than unlock share. That retry is a loop decision, not this run's.

## Convergence

killed-at-sweep (§14 PRIMARY miss; layer killed zero-trace, instruments + evidence kept). Axis scale-onramp: still the wall — wave-4 unlocks 0/32 on the pre-seat substrate; the armor side of #427 is not the binding constraint here.

## Files

- scripts/policies/armorstock.js — the ARMORSTOCK=1 quartermaster protocol (this run)
- scripts/armorstock-census.js — read-only durable-armor census instrument (this run)
- scripts/sweep-armorstock-20261017.js — 32-run before/after sweep (this run)
- scripts/test-armorstock-20261017.js — proof: 22/22 GREEN (this run)
- evidence/2026-10-17/sim-armorstock.md — this file
- evidence/2026-10-17/perseed-armorstock-census/ — 16 census per-seed JSONs
- evidence/2026-10-17/perseed-armorstock/ — 32 sweep per-seed JSONs
