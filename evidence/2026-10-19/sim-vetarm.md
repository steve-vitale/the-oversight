# sim-vetarm — companion arming + patrol exposure: the 9th production attempt (2026-10-19)

Run: flesh-out loop arm sim-vetarm (run_id 20261019T0215Z, loop oversight-flesh-out-loop), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md (individual ownership — Steve 2026-10-09), the game.js villagerGearUp comment block (Steve 2026-10-09), villager-build.js villagerGearDay.

LINEAGE: sim-killdisc (2026-10-18) reframed the bind — companion wave-3 damage-share 1.5% vs kill-share 0%; the base channel has no companion damage to convert. The named next (9th production attempt): ARM AND LEVEL companions — give the companion channel real combat capability, not re-staffing (vetstaff 0-for-2, vetblood 0-for-yield) or re-securing (killdisc killed at its gate). This arm executes it.

## Substrate

- policy: leadfeast/belongfeast (scripts/policies/feastscale.js — the pure tribfloor base; NO vetstaff, NO vetblood, NO vetrel) + vetarm layer (VETARM=1)
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 (the killdisc/compchan pre-seat substrate)
- seeds: 8 fresh (63501–63508 — verified filename-unused in evidence/2026-10-19/perseed-*/ before the sweep), x {lead, belong} = 16 runs per arm, paired on identical seeds
- horizon: 180d death-aware (dead villages stop simulating; runDays handles this)
- instruments: KILLDISC=1 (the killdisc read-only instrument — per-source tbDamage attribution on wave-3+ monsters; proven non-perturbing) + call-through observation wraps on Game.donateWeapon / Game.assignTask (counts only, zero state writes, zero RNG draws)

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

**PILOT PRIMARY (mechanism):** companion wave-3 damage-share (armed) ≥ 2x control → GO to confirm. (Control baseline from killdisc: 1.5%; this corpus re-measures it.)
**CONFIRM (gated on pilot GO):** 16 fresh seeds x 2 policies = 32 runs through the balanced panel; PRIMARY outcome: living-veterans at end of run ≥ +2/16 armed vs control.
**GUARDRAILS:** median survival ≥ control−10d; starvation deaths ≤ control+2; no new death mode; national/table not degraded.
**KILL PROTOCOL (pre-registered):** on miss, the layer is deleted zero-trace; instruments + evidence land.

## The lever (scripts/policies/vetarm.js — DELETED per kill protocol)

VETARM=1, zero src/js changes. Two beats, daily at Haven:

1. **ARMORY ARMING** (the proven sim-arming mechanism): one push/day, keep the communal armory at ≥3 weapons. Donate the worst SPARE weapon from inventory (strictly worse than the scholar's equipped best; never the scholar's only edge; keepsakes never donated); if no spare and stone+vine on hand, knap a stone_knife (the vinebank bank keeps first claim, same deference as competent.js). Game-side, the daily villagerGearDay redistributes armory weapons to the companions who gain most; departure-time villagerGearUp lets departing villagers borrow. Canon-honest: deposit is consent (Steve 2026-10-09).

2. **PATROL EXPOSURE** (the leader's delegation verb, in-person): up to 2 ABLE villagers/day get 'patrol' via Game.assignTask. Gates: hp ≥ 60, combat cred (a monster kill on record) or combat occupation, ARMED (weaponBonusOf > 0 — never send an unarmed villager), not already assigned, scholar at Haven and not exiled, nearest known threat wave ≤ 2 (safe wave-1/2 hunts). Patrols resolve through fieldFight (real blow-by-blow), gear up from the stocked armory at departure, and their kills score XP + loot — the leveling channel.

**ARMOR NOTE (documented, not re-litigated):** the scholar cannot hand armor to a companion through any honest channel. No communal armor pile (storage.js: "armor/misc have no deposit hook", canon); individual ownership is Steve's law (transfer paths: owner's own equip, deliberate give/trade, discard, death); no gift verb exists in the game. The game's daily villagerGearDay already equips every villager from their OWN stash. A gift verb or armor deposit hook is a Steve-call (game design), not a policy lever.

## Proof

`scripts/test-vetarm-20261019.js` — **22/22 GREEN** before the kill:
- (a) gate honesty: VETARM unset → pure delegation (no vetarm ctx keys, no armory change, no assignments)
- (b) armory drive: donates the worst spare; unarmed scholar keeps the only edge; armory ≥ 3 → no-op; one push/day; crafts stone_knife from stone+vine when no spare; vinebank deferral respected
- (c) patrol beat: assigns up to 2 able+armed villagers; all 8 gates verified (hp<60, unarmed, no combat cred, already assigned, wave-3 threat, exiled, not-at-haven, one round/day)
- (d) det-gate (real harness): gate-off byte-identical to leadfeast/belongfeast (2 seeds × 60d); gate-on deterministic; gate-on non-vacuous
- (e) real-sweep gate: 180d armed runs complete per policy, zero errors, deterministic re-run
- Post-kill: layer deleted; proof exits INFO-SKIP with VETARM_KILLED=1 (exit 0). Sweep and transcript scripts INFO-SKIP without the layer; the analyzer reads only JSONs and stays working.

## Results — PILOT

**PILOT VERDICT: NO-GO. The layer is killed per the pre-registered kill protocol.**

16+16 runs, 0 instrument errors, 0.0% other-share on both arms:

| metric | control | vetarm | bar |
|---|---|---|---|
| companion wave-3 damage-share | 2.19% (403/18,389) | 0.51% (65/12,820) | ≥2x |
| ratio | — | **0.23x** | ≥2.0x |
| killing fights | 41 | 34 | — |
| fights with ANY companion damage | 6 | 2 | — |
| w3 companion kills | 1 | 1 | — |
| living veterans (end, sum) | 2 | 1 | — |
| wave-4 reach | 11/16 | 15/16 | — |
| national reach | 6/16 | 7/16 | — |
| median survival (gameDays) | 182 | 152 | ≥ control−10d |
| starvation deaths | 1 | 2 | ≤ control+2 |
| death modes | combat, villager combat, monster, expedition, contest… | + **'patrol combat': 19** | none new |

The primary missed by an order of magnitude (0.23x vs the 2x bar), and two guardrails tripped: median survival −30d (bar −10d) and a new death mode ('patrol combat', 19 deaths, 0 on control).

### Engagement (the layer genuinely fired)

| beat | control | vetarm |
|---|---|---|
| armory donations | 0 | 167 |
| patrol assignments | 0 | 290 |
| armory end (units, sum) | 0 | 36 |
| armed companions ≥12 wb (sum) | 19 | 13 |

Both beats engaged. The arming beat was not the failure — the exposure beat was the poison.

### Diagnosis: the patrol beat cannibalized the presence the arming needed

1. **The patrol beat sent the fight-joiners away.** The assignment gates (combat cred, armed, hp≥60) select EXACTLY the villagers most likely to join the scholar's wave-3 fights and deal damage. During the day-part they're positioned at the patrol threat, not at Haven — companion-damage fights dropped 6 → 2, and the vetarm arm's 2 are both haven-TB while control's 6 include 3 raids (the shapes where armed companions matter).
2. **The patrol beat killed them.** 19 'patrol combat' deaths across 7 runs — every one of those runs ended village-lost. The able villagers the layer armed were the ones who died holding the perimeter. Dead companions deal 0 damage and never become veterans.
3. **The arming couldn't overcome the presence collapse.** 167 weapons entered circulation, but weapons in the hands of dead or absent villagers don't raise damage-share. End-of-run armed-companion counts are confounded by village deaths, but the mechanism verdict doesn't need them: presence is the binding constraint (killdisc's finding, confirmed), and the layer reduced presence.

The companion-damage fights that DID happen show the arming mechanism itself is sound: control's s63502 d124 (comp 143 dmg) and s63503 d115 (comp 124) prove armed companions hit hard when present. The layer's error was not the armory — it was sending the armed companions to die on patrol.

## Village assessment (plain words)

The modal village fights wave-3 monsters with whoever happens to be standing nearby. On the vetarm arm, the scholar's most capable villagers spent their days walking the perimeter with the scholar's donated knives — and died there, 19 of them, in fights the base policy never asks anyone to fight. The villages that lost their able villagers early had nobody left to stand beside the scholar when the Ad Break came through Haven at dusk. The armory stayed stocked (36 units at end of runs) — weapons waiting for hands that were already cold. The control villages, which never asked anyone to patrol, kept their fighters home: fewer weapons in circulation, but the fighters were alive and present, and 6 of their wave-3 fights had companion damage vs 2 armed.

Who thrived: nobody in particular — the scholar still does 98-99% of wave-3 damage on both arms. Who died: the patrollers — the village's best-armed, most experienced fighters, spent on the perimeter. What was missing: the layer never got companions INTO the scholar's wave-3 fights; it got them OUT of Haven. The blank this run fills is the patrol-beat autopsy; the blank it names is presence-preserving arming.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-19/vetarm-transcripts/belongvetarm-s63508.txt (d58 ad_break + d76 callback — the arm's 2 companion-damage fights).

The d58 fight is coherent and the fiction is honest. "⚔ AD BREAK! Sean joins you!" — "💬 Sean: 'Stay behind me!'" (protector positioning, in-character). He strikes twice: "Sean hits ad break for 12" / "for 10" — modest, whittled-stick-level hits, NOT stone-knife-level, even with the feast uplift (FEASTED ×2.03). "Sean whoops. 'That's how it's done!'" — "📺 Sean brought down Ad Break. Together." Nobody is confused; the fiction matches the ledger.

The sense-test CONFIRMS the diagnosis two ways: (1) the companion behaves sensibly — presence and courage are not the problem; (2) his hits are weak (10-12 WITH a ×2.03 feast = ~5 base), meaning THIS companion never got one of the layer's 167 donated weapons — the armory beat's distribution didn't reach the fight-joiners on this seed, while the patrol beat was busy sending the armed ones out. Arming without presence-routing is arming the wrong villagers.

## Metric review (§14 — binding, never re-scored)

1. **PILOT PRIMARY (≥2x damage-share) MISSED: 0.23x.** Not re-scored, not re-framed. The bar was written before the sweep; the miss is NO-GO per the pre-registered kill protocol.
2. **Guardrails:** median survival −30d (bar −10d) — miss; starvation 2 vs 1 (bar +2) — pass; 'patrol combat' new death mode — miss; national/table not degraded (7/16 vs 6/16 national, 0 table both) — pass. Two guardrail misses reinforce the kill; they are not separate verdicts.
3. **No balanced panel (§15).** The panel is the before/after instrument for the CONFIRM, which the pilot gated. There is no "after" — the lever died at the pilot. Documented here, not skipped silently.
4. **Seeds.** 63501–63508, verified filename-unused in evidence/2026-10-19/perseed-*/ before the sweep. 32/32 runs, 0 instrument errors, 0.0% other-share both arms, deterministic re-runs (proof C2).
5. **Control re-baselined.** The killdisc control baseline (1.5%) was re-measured on this corpus: 2.19%. The bar (2x) was judged against the re-measured control, not the stale 1.5%.
6. **Pre-registration honored.** The header (PRIMARY, bar, guardrails, kill protocol) was written before the lever sweep. The kill follows it exactly.

## Out-of-arm findings (not chased)

Filed to hidden_files/sim-findings.md:
1. **Armory-only retest** (the named next): the arming beat engaged cleanly (167 donations, 0 errors, all gates green); the patrol beat was the poison. An armory-only layer (no patrol assignments) tests whether presence-preserving arming moves damage-share. The 10th production attempt.
2. **Patrol danger is mispriced for the delegation verb**: 'patrol' (danger 2) killed 19 able villagers across 16 runs. Any future use of assignTask('patrol') needs a casualty model, not just an hp gate.
3. **Armor has no honest policy-side channel**: no communal pile (canon), no gift verb. If Steve wants companions armored, it's a game-design call (gift verb or armor deposit hook), not a lever.
4. **Raid shapes carry the companion channel**: 3 of control's 6 companion-damage fights were raids (5.0% share in killdisc too). The scholar's aid-crisis fights are where companions hit hardest — worth instrumenting as its own channel.

## Convergence

**KILLED-AT-PILOT.** The 9th production attempt is dead: arming + patrol exposure moved companion damage-share the WRONG way (0.23x) and introduced a new death mode. The mechanism lesson is sharp — on this substrate, the able villagers are a FINITE pool, and any beat that spends them elsewhere (patrols) directly starves the companion channel it was meant to feed. The axis stays scale-onramp: the veteran question is still PRESENCE + ARMING, but the arming must not move the fighters. No game change: zero src/js; the policy layer deleted zero-trace.

## Files

- scripts/policies/vetarm.js — DELETED per kill protocol (zero-trace)
- scripts/test-vetarm-20261019.js — layer proof, 22/22 GREEN pre-kill; INFO-SKIP post-kill (VETARM_KILLED=1)
- scripts/vetarm-sweep-20261019.js — pilot sweep (16+16 runs; INFO-SKIP without the layer)
- scripts/vetarm-analyze-20261019.js — pilot analysis (reads JSONs only; stays working)
- scripts/vetarm-transcripts-20261019.js — sense-testing probe (INFO-SKIP without the layer)
- evidence/2026-10-19/perseed-vetarm-pilot/ — 32 per-seed JSONs + _summary-{control,vetarm}.json + _analysis.json
- evidence/2026-10-19/vetarm-transcripts/belongvetarm-s63508.txt — sense-test transcript
- evidence/2026-10-19/sim-vetarm.md — this file
- ZERO src/js changes; no sweep-compare.js registry change was ever made (confirm never ran)
