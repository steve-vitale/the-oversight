# sim-leadside-a — prereg (FROZEN before any judged sim)

- **Arm:** sim-leadside-a · **Loop A run:** fleshout-20261121T0437Z · **Axis:** scale-onramp
- **Findings:** #2628 (lend pool empty — holder population empty) / #2599 (searcaster that can never fire) / #2635 (granted gun vanishes when its holder dies)
- **Base master:** `b5514461c` (Loop A lever round fleshout-20261121T0315Z: rollwall DIAG-GO + holdersupply NO-GO PARTICIPATION). Worktree `~/workspace/worktrees/sim-leadside-a`.
- **Question:** put the gun in the hands of the villagers who already LEAD wave-4+ fights, so an armed volley can fire.
- **Canon:** no canon doc covers the searcaster / contest-prize / lend / holder-presence rules specifically (same as the holdersupply prereg records); rules below are cited from code only.

## 1. The chain that names this lever — verified from the evidence, not assumed

Holdersupply (evidence/2026-11-21/sim-holdersupply-a.md, NO-GO PARTICIPATION, band 107131–107138) measured the supply line complete three times over — gun arrives (gunrate), cells survive (cellgate), ammo lasts (bigbundle: holder-days 164, cell-days 164, zeroDays 0, max cells 7) — and no armed volley ever fired: armed entries 4 = 4 control, armed volleys 0 = 0, pool presence 12.3% vs the 25% bar, **armedLeads 0 on both legs**. The volley is lead-only and no holder ever leads a wave-4+ fight. The falsifier fired: presence is binding, and WITHIN presence the binding constraint is LEADERSHIP, not ammo depth.

**A reading-before-building finding (new, recorded here): the term this arm mirrors is dead in live play.** `_gunRateFighter` (src/js/contests.js:174–202) scores a wave-3 kill at +4 — but a grep over `src/` finds `wave3Kill` only READ at contests.js:193 (and noted at :335/:359); it is never SET by game code anywhere in `src/` (set only in test fixtures: test-gunrate-a.js, test-holdersupply-a.js, test-searsupply-a.js). In a live sim the wave-3-kill term contributes 0, always. The `wave4Lead` term in §2 is therefore the first lead/kill term in the redirect with a live recorder behind it — it cannot inherit the wave-3 term's track record, because the wave-3 term has none. The proof test must prove the recorder fires in a real fight, not just that the term reads a fixture value.

## 2. The lever (frozen design): LEADSIDE — lead-weighted redirect, shape 1 only

**`LEADSIDE=1` (default OFF, env-gated, node sims only). Two pieces, both gated on the same flag:**

1. **Recorder** — in `Game.resolveWildMonsterEncounter` (src/js/game.js, beside the VETREENGAGE seed block, same condition shape): when LEADSIDE=1, a wave-4+ fight that resolves to a real fight outcome (`vKill`/`mFlee`/`vFlee`/`vDie`), non-raid (`!opts.raid`), led by a roster villager other than the scholar, increments `state.wave4Leads[vid]` by 1. Zero `Math.random()` draws; a pure counter write.
   - **Storage is `state.wave4Leads`, deliberately NOT `state.notability`.** Notability feeds contest/show casting weights (`notabilityWeight`, via `NOTABILITY_IMPACT` with default impact 1 for unknown deeds) — recording leads there would change who gets cast in contests, a second mechanism riding along with the redirect. The lead record must not move casting.
   - **Scope matches the judge.** Only `resolveWildMonsterEncounter` launches count — the same choke point the near-miss instrument watches (world-tick fights, expedition fights, and aid-routed fights through it). Patrol fights (`resolvePatrol` → `fieldFight` directly) and the scholar's TB fights are NOT counted; the judged `armedLeads` metric is defined over near-miss rows from the same choke point, so lever and judge share the population. Raids are excluded, matching the near-miss breakdown (a raid is defence at the haven door, not a launch led).
2. **Term** — in `G._gunRateFighter` (src/js/contests.js): when LEADSIDE=1, `score += Math.min((wave4Leads[vid] || 0) * 4, 12)` — +4 per wave-4+ launch led, capped at +12 (three leads saturate). The term AUGMENTS the expedition term (it does not replace it): a 1-lead villager (+4) beats a plain villager (0); a 2-lead villager (+8) ties a current expedition holder; a 3+-lead villager (+12) outranks one. Roster-order tie-break unchanged. Zero draws.

**NOT built in this arm:** shape 2 (draft-armed-holder-as-lead, a launch rule — a bigger design call weighed after shape 1 is measured). NOT re-tested: a bigger bundle (killed by holdersupply), a higher gun rate (killed by gunrate), a wider gate (proven by cellgate). The combination GUNRATE+CELLGATE was already measured 3× and is the substrate, not the lever.

**Substrate (both legs, already on master — no rebuild needed):** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`, LEND OFF on both legs.

**Legs (differ ONLY by the redirect rule):**
- Control: substrate as-is (LEADSIDE unset).
- Arm: substrate + `LEADSIDE=1`.

## 3. Band freshness (verified before writing this prereg)

- Band **107141–107148**. For EACH seed 107141–107148: 0 matches in any dated `evidence/2026-*/sim-*.md` or `*prereg*.md` (`grep -rl --include="*.md"` over `evidence/`), 0 matches in `hidden_files/sim-findings.md`, 0 corpus filenames under `evidence/` (`find evidence -name "*10714[1-8]*"`).
- Neighbouring used bands: 107131–107138 (holdersupply), 107111–107118 (lendpool), 107091–107098 (fibersupply), 107081–107088 (lendfix), 107051–107058 (gunrate/cellgate).

## 4. The honest tension (recorded, not hidden)

The redirect ALREADY weights expedition holders (+8), and lendpool's participation census found expedition-holder leads are 34/125 wave-4+ launches — the fighters already going. Yet armedLeads is 0 on every band in this chain. The gap the term must cross is timing: the grant happens at contest time, and the expedition holder at grant time is not necessarily the villager leading wave-4+ fights weeks later; a proven-lead record is sticky where expedition status is not. But the term only changes the pick when a proven leader EXISTS at grant time — with 0–1 leads on most recipients the pick may barely move, and a single lead (+4) only ties the (dead, 0-in-practice) wave-3 term. The term's real test is whether any grant lands on a 2+-lead villager at all.

**Falsifier:** if armed leads stay 0 on the arm leg despite the term (and grants land on 0-lead recipients, or no grant lands on a 2+-lead villager), the redirect is not the binding constraint — the binding constraint is that holders never REACH a fight as leads at all (sheltered / not on the tile / not drafted), and the next lever is shape 2 (draft-armed-holder-as-lead), not a stronger redirect weight. A stronger weight (+8/lead, uncapped) is not re-tried without a design call: if 0-lead recipients still win the pick, the weight is not the problem.

## 5. Frozen bars (GO requires ALL of 1–5; a miss is NO-GO, never re-scored)

| Bar | Metric (arm leg unless stated) | Floor | Baseline for comparison |
|---|---|---|---|
| 1 | Searcaster-holder-days | ≥ 40 | holdersupply arm: 164 |
| 2 | **Armed leads** (wave-4+ entry, lead's rangedId searcaster + ≥1 cell) | ≥ 2 | holdersupply arm: **0** — the discriminating bar; this lever's point |
| 3 | Armed volleys fired (lead rangedId searcaster, shots > 0) | ≥ 1 | holdersupply arm: 0 |
| 4 | Armed-holder entries (wave-4+ entry, searcaster + ≥1 cell, any participant) | ≥ 3 | holdersupply arm: 4 |
| 5 | Guardrail, separated (frozen from gunrate/cellgate/holdersupply): (i) deaths per engaged wave-4+ meeting ≤ 1.10× control; (ii) median survival ≥ 0.80× control; (iii) villager starvation deaths ≤ control + 2 | all three | — |

**Pool presence is a DIAGNOSTIC this run, not a judged bar** (change from holdersupply, with reasons): presence measures holder EXISTENCE at launches, and the redirect changes WHO holds among existing grants, not how many grants arrive (same gun weight, same redirect trigger — only the recipient changes). A presence bar would judge this lever by a mechanism it does not own. Presence is still computed and reported; a presence collapse on the arm leg would be investigated, not judged.

**Instrument validity (pre-pilot, not a judged bar):** proof test green before the pilot; analyzer `--selftest` green; near-miss coverage ≥ 95% with ≤ 5% unclassified on each leg (if coverage fails, the verdict is METRIC-BROKEN, not NO-GO). `v4lends` must stay 0 on both legs (LEND off); `v4lendPool` counter re-verified (lendable rows agree with pool moments). LEADSIDE leg-consistency: arm requires LEADSIDE=1, ctl forbids it (driver guard, like the holdersupply BIGBUNDLE guard).

**Outcome discipline:** if GO, the lever stays env-gated OFF on master (no default flip — a separate design decision); the arm lands instrument + evidence + the combined-substrate proof. If NO-GO, REVERT the LEADSIDE game-code change in the worktree before finishing (verify the revert is the exact inverse by hash), leaving instrument + evidence only, and name the next lever (shape 2, draft-armed-holder-as-lead) with numbers.

## 6. Instrument (clones + one folded-in extension)

- Driver: `scripts/leadside-driver-a.js` — clone of `scripts/holdersupply-driver-a.js` (itself the gunrate-driver lineage: ammo census, grant wraps, near-miss recorder, `v4lendPool` counter, `v4lends` recorder). MODE=ctl|arm; no lever changes in the driver (LEADSIDE is game code). Run name `leadside-a`. LEADSIDE leg-consistency guard + `leadsideOn`/`leadsidePresent` in corpus metadata.
- **Folded-in instrument — finding #2635 (gun-vanish sink).** This arm counts guns, so it instruments gun transfers (holdersupply §6; findings #2635): seed 107138 — gun granted day 72, holder died day 94; control re-grants day 105, arm vanishes day 94, reappears with the scholar day 109, vanishes again day 116. The sink is still unrecorded. The driver clone extends the holdersupply transfer detector with: (a) a `dropEvents` recorder wrapping `Game.dropItem` (scholar drops — the only player-side sink; itemId + day); (b) `holder-died` attribution on transfer rows when the previous holder is dead at the snapshot (previously only the vanish branch checked death); (c) `drop` attribution on vanish rows when a same-day searcaster drop was recorded. Attribution priority: grant-* → kill-loot → corpse-take → drop → holder-died → unexplained. Every searcaster holder change is recorded with attribution in the corpus; the analyzer reports the sink census (counts by kind × attribution; unexplained share). Do NOT build a fix for the sink in this arm — instrument it.
- Analyzer: `scripts/analyze-leadside-a.js` — clone of `scripts/analyze-holdersupply-a.js`, keeping its `judgeHoldersupply` bars as the frozen floors in §5 (holder-days ≥ 40, entries ≥ 3, volleys ≥ 1 for this arm, separated guardrail, starvation guardrail) plus a new `judgeLeadside` with the armed-leads bar (≥ 2) as the discriminating bar, plus the sink census from `v4transfers` (by kind × attribution) and the pool-presence diagnostic. The `armedLeads` counter fix from the lendpool analyzer is kept (cellgate §4 bug — never incremented in the gunrate analyzer — already fixed in the lendpool clone; the selftest must prove it).
- Proof test: `scripts/test-leadside-a.js` — recorder fires on a real wave-4+ fight led by a villager (count 1, then 2 on a second fight; no count for a wave-3 fight, a raid, an evade, or a scholar-led fight; LEADSIDE unset records nothing); term weights a 2-lead villager (+8) over a 1-launch villager (+2) and a plain villager (0), and a 3-lead villager (+12) over the expedition holder (+8) outright; the 2-lead-vs-expedition tie (+8 = +8) resolves by roster order, asserted deterministically; gate hold/fire unchanged under LEADSIDE (CELLGATE hold below wave 4, fire at wave 4+); draw-count identity on `_cxItemPrize` (3 draws both legs) and on `resolveWildMonsterEncounter` (recorder adds zero draws); LEADSIDE unset leaves `_gunRateFighter` byte-identical to the control pick.
- Panel builder: `scripts/build-leadside-panels-a.js` — rename of `scripts/build-holdersupply-panels-a.js` (before = ctl substrate, after = arm substrate+LEADSIDE, seeds 107141–107148). Balanced-panel compare per docs/MEASUREMENT.md §15; the panel is the instrument, the frozen bars above are the judge.

## 7. Run plan

1. Commit this prereg BEFORE any judged sim (safe-commit).
2. Build LEADSIDE + proof test; proof test green before the pilot.
3. Smoke: seed 107141, both legs; corpora valid, coverage sane, `v4lends` 0.
4. Pilot: 8 ctl + 8 arm seeds 107141–107148, parallel background legs (~20–30 min each). Resume from disk if a sweep dies (re-run only missing seeds, never a partial corpus).
5. Analyze (frozen judge), build panels, compare, write evidence `evidence/2026-11-21/sim-leadside-a.md` (prereg, before/after on identical seeds, village assessment in plain words, metric review, next lever named, sink census, wall numbers).
6. If NO-GO: revert LEADSIDE (hash-verified inverse), re-run proof test post-revert, commit instrument + evidence only. If GO: land env-gated OFF.
7. No push, no bump, no live verification. Report branch tip + proof results + verdict to the coordinator; the coordinator merges.

## 8. Metric review (to be filled in the evidence file)

Pre-registered here as a placeholder so the evidence file carries the section: bars 1–4 measure the lever's mechanism (grant → proven leader holds → armed lead → volley → entries); bar 5 is the frozen exposure-normalized guardrail. Known metric risks, stated in advance: (a) bar 2's floor (≥ 2) demands that a grant land on a proven leader AND that leader then lead a wave-4+ fight inside the 150d horizon — a grant late in the run may never get its chance, so the evidence must report grants-by-lead-count alongside the bar; (b) the recorder and the judge share the `resolveWildMonsterEncounter` choke point by design, so a launch routed elsewhere (patrol) counts for neither — a scope limit, not a measurement gap, but it must be named in the evidence if patrol-led wave-4+ fights are numerous; (c) bar 4 (entries ≥ 3) is a guard against a degenerate shape, not the lever's point — if leads pass but entries fail, the evidence must say which shape occurred.
