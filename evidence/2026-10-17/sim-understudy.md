# sim-understudy — the fresh_weapon contact+execution lever arm (flesh-out loop, 2026-10-17)

**Run:** flesh-out loop, arm sim-understudy (axis scale-onramp blocking — the trick game is the on-ramp's mortality-side answer; fresh_weapon is the last bot-unreachable trick kind).
**Type:** LEVER ARM. New policy file `scripts/policies/understudy.js` ONLY (UNDERHUNT=1, default OFF). ZERO src/js, ZERO src/data, ZERO other scripts/policies changes — the landed reposition.js composition pattern mirrored exactly (wrap tribfloor's leadfeast/belongfeast via require('./tribfloor'), Object.assign).
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read — "Monster counters" section: fresh_weapon "requires the understudy to have already seen a weapon — the trick is the mid-fight SWITCH, not the opener". No new canon invented.
**Findings:** #432a (sim-trickfunnel 2026-10-16: fresh_weapon 16 contacts/12 known/0 performed — bots never switch weapons mid-fight); #433 (sim-trickreach 2026-10-17: 0 understudy scholar-TB contacts on seeds 3601–3608 — contact gap, not execution gap). NOTE: #433 was named in the trickreach evidence but never filed to the sim-findings backlog (grep finds no #433 entry as of 2026-10-17); the contact-gap finding is re-documented here.

## The lever

UNDERHUNT=1 arms two parts, both engine-honest and knowledge-gated:

**(a) CONTACT:** The probe (below) proves understudy contacts arise via the wild-encounter → flee → re-engage cycle (seed-sporadic; 6/8 runs on 1801–1808, 0/16 on 3601–3608). The layer cannot initiate wild encounters policy-side. Its contact contribution is **capitalization**: the scholar naturally carries spare melee weapons (verified 4 spares on s4001), so the execution trigger holds when contacts happen — and the layer converts the funnel's 0-performed contacts into performances. No movement changes, no encounter manipulation.

**(b) EXECUTION:** on each player TB turn, before the base fight(): the honest mid-fight switch. Trigger = a live understudy in the fight AND its usSeen non-empty (it has SEEN a weapon — the opener never counts, break-it 2026-10-11) AND the scholar carries an unseen melee weapon in inventory (name-keyed exactly as the engine keys usSeen: def.name) AND the trick is known (state.monsterCounters.understudy OR codex 'slain' stage — Steve: "If you don't know, it doesn't show") AND scholar hpPct >= 0.7. Action: real `Game.equip(idx, 'melee')` (engine-verified non-turn-costing: touches neither acted nor moveLeft; narrated "Equipped X"), then DELEGATE (return false) — the base spends the turn striking with the fresh weapon; the engine's own checkMonsterCounter logs the performance on the real strike. Melee only (trickreach design call). At most ONCE per fight.

**Safety** (reposition/trickreach precedent, non-negotiable): hpPct >= 0.7 (far from the base's 0.35 mid-fight eject — never shadowed); turn-1 walk-away mirror (totalMhp > 2.5*pmax → delegate so the base flees; the base's survival decisions are never overridden).

**Substrate:** pre-seat courtship — FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 EXPLICIT (post-c004b9dd the seat default is ON; SEATDRIVE=0 is required to hold the substrate). Tribfloor composition verified: scripts/policies/tribfloor.js wraps feastscale's leadfeast/belongfeast (exports ids 'leadfeast'/'belongfeast'); the understudy layer wraps tribfloor's exports. Control and armed share the identical substrate objects; UNDERHUNT is the only switch.

## Contact probe

**Instrument:** scripts/understudy-probe-20261017.js — read-only tbfight interception via Object.defineProperty (the finding-#434 hook, covering all 5 initiation paths), with stack-trace path classification. Run on the tribfloor substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0).

**Results (8 runs: seeds 1801–1808 × belongfeast, 180d, 2026-10-17):** 236 total TB fights, **6 understudy contacts**.
- Path: ALL 6 via `startCombat` (initial classifier bug — the party.js startCombat wrapper's stack frame — fixed mid-probe; true betrayals carry `fight.betrayal=true`).
- Tile: ALL 6 at `haven`. DayPart: ALL 6 at dusk (2) or dawn (0) — NOT night. Tent: none.
- Clustering: s1808 had 3 contacts in 15 days (d125, d135, d140).

**Interpretation:** These are NOT nocturnal wild encounters. They are **flee/re-engage cycles**: the scholar meets an understudy in the wild, flees through a door (understudy stashed in `state.doorFledMonsters`), returns to Haven, and re-engages when leaving ("They're still here. Waiting." → `reengageWaitingMonsters` → `startCombat`). The dusk/dawn timing is the scholar leaving Haven; the Haven tile is the re-engage point. The s1808 cluster is the same (or successive) understudies being fled and re-engaged repeatedly.

**The contact gap, precisely:** Scholar-vs-understudy TB contacts arise ONLY from the wild-encounter → flee → re-engage cycle, which is seed-sporadic (6/8 runs here; 0/16 on the trickreach seed set 3601–3608). The policy layer cannot initiate wild encounters without rewriting the base's movement logic (out of scope, high risk). The layer's contact contribution is therefore **contact capitalization**: (1) the scholar naturally carries spare melee weapons (verified: 4 spares — Sharpened stick, Kitchen knife, Hardlight knife, Hatchet — on s4001 leadfeast 180d), so the execution trigger holds when contacts happen; (2) the execution mechanism converts contacts to performances (the funnel's 0/16 performed was the execution gap; this layer closes it).

**Fresh-seed screen:** 4001–4004 × {leadfeast,belongfeast} × 60d (2026-10-17): 8 runs, 78 TB fights, **2 understudy contacts** (s4003-leadfeast d34, s4004-belongfeast d57; both dusk/Haven/startCombat — the re-engage pattern). Contact rate ~0.25/run in 60d; the 180d pilot on 4001–4008 should see several. The pilot proceeds.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written before the pilot sweep)

**PRIMARY:** fresh_weapon PERFORMANCES via the f.trickLogByMid attribution channel (scripts/trickres-instrument-20261016.js, reused read-only). **armed − control ≥ 4 across the 32-run pilot → GO** (confirm on 12–16 fresh seeds). **Miss → KILL** (delete scripts/policies/understudy.js zero-trace per kill protocol; keep instruments + evidence).
**Guardrails (binding):** national ≥ control−2; median survival ≥ control−10d; scholar combat deaths ≤ control+2; no new death mode.
**Substrate:** FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0 explicit, {leadfeast,belongfeast} (tribfloor).
**Seeds:** 8 FRESH [4001–4008] (0 filename hits across evidence/, verified 2026-10-17) × {leadfeast, belongfeast} = 16 runs/arm. 32 runs total.
**Horizon:** 180d death-aware (dead villages stop; +10d tail max).
**Gates before spend:** proof RED→GREEN (scripts/test-understudy-20261017.js) · det-gate (gate-off byte-identical) · SMOKE green.
**Per-seed JSONs:** evidence/2026-10-17/perseed-understudy/ · beats: evidence/2026-10-17/understudy-beats/ · instrument: scripts/trickres-instrument-20261016.js (reused) · sweep: scripts/understudy-sweep-20261017.js · proof: scripts/test-understudy-20261017.js · probe: scripts/understudy-probe-20261017.js.

## Metric review

<to be filled after the run>

## Proof: scripts/test-understudy-20261017.js

**17/17 GREEN** (2026-10-17, run after the pilot sweep gates):
- GATE (RED): UNDERHUNT unset → layerOn() false (gate off by default).
- FRESH_WEAPON: real startCombat('understudy') → usSeen populated (the switch trigger genuinely present) + unseen melee weapon in pack + trick known + hp full → understudyPlay switches via the real Game.equip and delegates (returns false); the real Game.tbPlayerStrike then logs `fresh_weapon` in f.trickLogByMid.understudy. Non-turn-costing verified (acted/moveLeft untouched by the equip). Negatives all hold: opener (usSeen empty) → no switch; unknown trick → no switch; hp<0.7 → no switch; no fresh weapon → no switch; turn-1 outmatched → delegate, no switch. Once-per-fight: no second switch even with another fresh weapon available.
- **Engine fix during proof (documented):** Game.equip returns null on SUCCESS too (every path returns null) — the layer's first version checked the return value and never counted the switch (2 proof failures). Fixed to verify the switch by reading the equipped slot before/after. The mechanism was always correct; the verification was wrong.
- DET: gate-off understudy-lead/belong byte-identical to tribfloor leadfeast/belongfeast (2 seeds × 60d via dayHash); gate-on deterministic.
- SMOKE: 20d pre-seat UNDERHUNT=1 run completes green.

## Pilot sweep: 32 runs (16 armed / 16 control)

**Launched 2026-10-17** (after proof GREEN 17/17): control (UNDERHUNT unset) and armed (UNDERHUNT=1) in parallel, 8 fresh seeds [4001–4008] × {leadfeast,belongfeast}, 180d death-aware, FEASTSCALE_R13=1 TRIBFLOOR=1 SEATDRIVE=0. Per-seed JSONs → evidence/2026-10-17/perseed-understudy/; beats → evidence/2026-10-17/understudy-beats/.

### Results

| metric (16 runs/arm) | control | armed | Δ | bar | verdict |
|---|---|---|---|---|---|
| PRIMARY: fresh_weapon performances | 0 | 1 | **+1** | ≥ +4 | **MISS** |
| national | 0/16 | 0/16 | 0 | ≥ −2 | HOLD |
| median survival | 159d | 153d | −6d | ≥ −10d | HOLD |
| scholar combat deaths | 88 | 89 | +1 | ≤ +2 | HOLD |
| new death mode | — | villager:Ugly-Eyes ×1 | — | none | HOLD* |

*The Ugly-Eyes villager death is on armed-leadfeast-s4005 (the diverged trajectory post-day-82); it is a specific monster kill via RNG, not a new death mechanism. The layer only acts in understudy TB fights.

**The one performance:** armed-leadfeast-s4005, day 82, fight WON, trick known=true. The scholar knew the understudy trick, the layer switched to an unseen melee weapon mid-fight, the base struck, the engine logged fresh_weapon, and the scholar won. The mechanism works — but contacts are too rare (1/16 runs) to meet the bar.

**Paired analysis:** 15/16 pairs identical on scholar combat deaths (Δ=0); the +1 is leadfeast-s4005 (the performance run, where trajectories diverged post-switch). This mirrors the trickreach pattern (14/16 identical, excess on the diverged run) — downstream RNG divergence, not a layer cost mechanism.

## Sense-testing (transcript reads)

**The day-82 performance (armed-leadfeast-s4005):** The fwBeats record day 82, result=WON, trick known=true. The full TB narration wasn't captured by the trickres instrument (it only saves TRICK_BEAT-matching lines), but the proof test's GREEN section verified the complete mechanism chain on a real fight: usSeen populated → layer switches via real Game.equip (non-turn-costing) → base strikes → engine logs fresh_weapon in f.trickLogByMid.understudy.

**Meaning:** The scholar knew "It only knows what you have SHOWN it — switch weapons mid-fight and the copy falls apart." The layer applied that knowledge as a mid-fight switch to an unseen weapon. The copy fell apart (performance logged). The scholar won the fight. This is the Undertale moment working as designed: knowledge applied as action, not just a stat bonus.

**Coherence:** The trigger conditions (usSeen non-empty, unseen weapon, known trick, hp≥0.7) ensure the switch only happens when it's the honest trick — not the opener, not when hurt, not when ignorant. The once-per-fight rule prevents farming.

**Limitation:** Full transcript unavailable (instrument gap). The sense judgment rests on the fwBeats (won + known) and the proof's mechanism verification.

## Village assessment

The villages look like the pre-seat wall state on the tribfloor substrate: national 0/16 both arms (the tribfloor substrate is harsher than the trickreach substrate — national 10/16 there), median survival ~155d, wins 0/16 by design. The scholar carries spare melee weapons (4 on s4001), so the execution trigger is satisfiable. The understudy trick is known in most runs by mid-game (funnel: 12/16; the day-82 performance had known=true).

The blank filled: **the execution mechanism works** — a bot can now perform fresh_weapon (the funnel's 0/16 is now 1/16 on the armed side, and the 1 was a won fight). The proof (17/17) pins the mechanism: real equip, real strike, real engine logging.

The blank documented: **the contact rate is the binding constraint**. The probe proves contacts arise only via the wild-encounter → flee → re-engage cycle (6/8 runs on 1801–1808; 2/8 on fresh 4001–4004 in 60d). On the 180d pilot, only 1/16 armed runs had an actionable contact. The layer cannot initiate wild encounters policy-side. Until the contact rate rises (seed selection, encounter-mix work, or a deliberate hunt behavior), fresh_weapon will remain a rare event in sims — reachable but not farmable.

## Verdict

**KILLED AT PILOT.** Primary missed: fresh_weapon performances armed−control = **+1** (armed 1, control 0) vs bar ≥4. The mechanism is proven (proof 17/17 GREEN; the 1 performance was a won fight with the trick known), but the contact substrate doesn't supply enough opportunities. Guardrails all held (national 0=0; median −6d ≥ −10d; scholar deaths +1 ≤ +2; no new death mechanism).

Per kill protocol: `scripts/policies/understudy.js` deleted zero-trace. Instruments (probe, sweep, analyze, senseread), proof test, and evidence kept. The fresh_weapon kind stays documented-reachable via the execution mechanism; the contact gap (#433) remains the binding constraint.

## Metric review

Metric was sound: the primary (performance count via f.trickLogByMid) directly measures the execution stage the arm targets, and the guardrails prevented silent regress. The bar (≥4) was honest — it required the layer to move the needle, not just fire once. No revision proposed. The pilot properly falsified the "contacts are sufficient" hypothesis; this is §14 working as designed. A future arm should pre-register on a substrate with a higher contact rate (or a contact-creating mechanism) before spending the pilot.
