# sim-w3drive — wave-3 counter-learning expeditions from wave-3 unlock

**Run:** sim-w3drive (ARM 2 of fleshout-20261015T221507Z) — scale-onramp axis, 2026-10-15
**Axis:** scale-onramp (blocking). **Lever:** new policy `scripts/policies/w3drive.js` (W3DRIVE=1, default OFF), zero src/js.

## Context

- sim-survdiff #281: wave-1/2 counters BRIGHT (12–25), wave-3+ tricks DARK (0–1). Villagers essentially never learn wave-3+ counters.
- Casualty-sequence diagnostic: 90% of post-wave-4 deaths are villager-combat, median inter-death interval 1 day ("a war of funerals, not a siege").
- wave5reach (landed 2026-10-15) only starts counter-learning expeditions AFTER wave-4 unlock (~d76).
- **Hypothesis:** the counter darkness is a time-to-learn problem — starting pursuit at WAVE-3 unlock (~d40) gives the village ~35 more days of counter learning before wave-4 pressure arrives.

## The lever

`scripts/policies/w3drive.js` wraps the tribfloor→windefer chain (the same
construction seatdrive uses as its inner layer: `WD.withWinDefer(TF.leadfeast/belongfeast, id 'leadfeast-windefer'/'belongfeast-windefer')`), keeping the base ids. Both sides share the objects; W3DRIVE is the only switch. SEATDRIVE never set; WAVE5REACH never imported or wrapped (independent layer, zero file overlap with sibling arms).

- **Live window:** `unlockedWave() >= 3 && unlockedWave() < 4`, not during the table sequence. Stands down at wave-4 (wave5reach's territory — no overlap in live windows).
- **Seek side:** every 3rd day, healthy (hp ≥ 60%) and fed (kcal ≥ 200), the scholar travels to monster-country nodes (revealed thickets first) and walks up to visible wave-3+ monsters — the wave5reach engage pattern, engine-honest (real travelTo, real checkEncounter, bounded 12-step walk; contact fires the engine's own startCombat).
- **Fight side:** `ctx._huntCommit = true` on live wave-3 fights at ≥50% HP (the proven courtkill mechanism honored by competent.js's flee-block extension: start-of-fight walk-away overridden, holds to 12%; mid-fight 35% eject unchanged for uncommitted fights). **Never writes `ctx._w5Commit`** — that flag is wave5reach's territory.
- **Learning channel:** none invented. The engine's non-lethal observation path (Steve 2026-10-13: survived encounters → `_trickObservation` → `state.villagerTricks` for spool / chorus_line / buffering — the only wave-3 tricks the engine can learn) plus the base's askAbout 'beasttricks' topic carry all village learning.

Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, the deliberately counter-less wave-4/5 roster, villagerTrickDefs wiring), docs/TABLE.md.

## Pre-registered header (MEASUREMENT §§9–12, 14 — BINDING)

- **Design:** 8 fresh seeds [151, 262, 373, 484, 595, 706, 817, 928] x {leadfeast, belongfeast} x {control, armed}, 180d death-aware (dead villages stop, +10d tail max), identical seeds, own in-sweep control.
  - Seed freshness: grepped evidence/2026-10-*/ — no prior sweep used any of these as seeds (only incidental numeric matches, e.g. SVG coordinates).
- **Substrate (both sides, exact):** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 (the pre-seat stack — wincensus proved it inert: 0/16 wins). SEATDRIVE never set.
- **PRIMARY:** wave-3+ counter-kill share (wave-3+ monster kills in the engine's `state.waveKillLog` attributed to trick knowledge at kill day — a kill counts iff a `counter_discovered` tele event for its mid fired at day ≤ kill day; the proof pins the tele as the single funnel into `state.villagerTricks`) / total wave-3+ kills. Bar: **armed ≥ 1.5x control**.
- **CO-PRIMARY:** wave-3+ counter discoveries (`counter_discovered` tele events for wave≥3 mids, captured live by an observe-only wrap). Bar: **armed ≥ control + 2**.
- **Guardrails:** median survival ≥ control − 10d; starvation deaths ≤ control + 2; no new death mode (n≥3).
- **Horizon:** 180d death-aware, per the question (counter learning needs the full wave-3 window) + baseline survival distribution on the bleeding stack.
- **PILOT GATE:** 8 pairs first (seeds 151, 262, 373, 484 x {leadfeast, belongfeast}). GO to confirm iff armed discoveries ≥ control + 1 OR armed share ≥ 1.5x control (on pairs with wave-3+ kills). KILL at pilot otherwise: delete `scripts/policies/w3drive.js` per kill protocol, keep instruments + evidence.
- **NO-COVERAGE rule:** if control has zero wave-3+ kills, the primary share is undefined — verdict NO-COVERAGE on the primary and the co-primary decides. If control has wave-3+ kills but zero counter-kills, the 1.5x ratio is vacuous — judge on absolute armed counter-kills plus the co-primary.
- **Metric binding (§14):** a miss is NO-GO, never re-scored mid-run. Metric doubts go under "metric review" below.

## Metric review

_(written before results: doubts about the metric itself)_

1. Wave-4/5 monsters have no trick defs by design (`villagerTrickDefs()` covers spool/chorus_line/buffering only; MONSTER-WAVES.md: "deliberately counter-less for now"). They contribute denominator kills but can never be counter-attributed. The metric is honest about this — it measures what the engine can actually learn (wave-3 signatures) — but it means the primary's ceiling is bounded by how many of the wave-3+ kills are wave-3 vs wave-4/5.
2. The observation funnel needs SURVIVED encounters (fled/routed for the scholar; vFlee/mFlee/evade for villagers). Kills do NOT teach wave-3 tricks (the slain path only feeds `counterTeachable()`, which requires a `counter` field — wave-3 has none). The `_huntCommit` hold-to-12% mechanism pushes the scholar toward kills, which may trade observation opportunities for ledger points. If the mechanism analysis shows committed fights converting to kills but not knowledge, that's a design finding for the next round, not a metric rescore.
3. Small-n risk: on the bleeding pre-seat stack, wave-3+ kills per run are few. The share is aggregated across all 16 runs per side to stabilize it.

## Proof

`scripts/test-w3drive-20261015.js` — 30/30 GREEN (pre-sweep, layer present):
- layerOn honesty (W3DRIVE=1/0/unset), composition integrity (ids, substrate markers)
- unit checks: huntLive true at uw=3 only (false at uw=2/4/5, false during table, false gate-off); `_huntCommit` set on live wave-3 fights; `_w5Commit` NEVER written; no commit when scholar hurt or at uw=4
- det-gate: gate-off (W3DRIVE unset) byte-identical to the naked tribfloor→windefer composition on seeds 151/262, 15d
- RED check: injected a huntLive mutation (uw≥4 window) — the mechanism checks caught it (2 failures); reverted, green again
- instrument pins: `villagerTricks` written ONLY by `_trickObservation`; `counter_discovered` tele fires from the discovery funnel
- SMOKE: 15d both sides, markers honest, runs complete, policy ids correct

Post-kill the proof INFO-SKIPs (layer-absent guard); the sweep refuses to run without the layer. Instruments retained.

## Results — PRIMARY GO, CO-PRIMARY GO, SURVIVAL GUARDRAIL MISS → ARM NO-GO (KILLED AT CONFIRM)

32 runs (8 seeds [151,262,373,484,595,706,817,928] x {leadfeast, belongfeast} x {control, armed}), 180d death-aware, pre-seat substrate (FEASTSCALE_R13+TRIBFLOOR+SUCCGRACE+RAIDDENSITY+WINPURSUIT+WINDEFER, SEATDRIVE never set). Per-seed JSONs: `evidence/2026-10-15/perseed-w3drive/` (32/32). Beat captures: `evidence/2026-10-15/w3drive-beats/` (32/32).

| metric | control (16) | armed (16) | bar | verdict |
|---|---|---|---|---|
| PRIMARY: wave-3+ counter-kill share | 0.103 (4/39) | 0.176 (6/34) | ≥ 1.5x (1.72x) | **GO** |
| CO-PRIMARY: wave-3+ discoveries | 8 | 13 | ≥ control+2 | **GO** (+5) |
| median survival (matched pairs) | 134.5d | 114.0d | ≥ control−10d | **MISS** (−20.5d) |
| starvation deaths | 1 | 2 | ≤ control+2 | GO |
| new death mode (n≥3) | — | none | — | GO |
| national | 12/16 | 11/16 | — | report |
| table invitations | 16/16 | 14/16 | — | report |
| wave-5 unlocks | 11/16 | 7/16 | — | report |
| wins | 0/16 | 0/16 | — | — |
| exiled | 0/16 | 0/16 | — | — |
| hunts / engagements / blood-fight turns | 0 / 0 / 0 | 89 / 15 / 300 | — | lever live |

Pilot (8 pairs): PRIMARY 3.44x GO, CO-PRIMARY +2 GO, survival −7d GO → GO to confirm. Confirm (8 pairs): PRIMARY 0.47x, CO-PRIMARY +3, survival −15d. The primary is small-n volatile (6 vs 4 counter-kills total); the survival cost is consistent across both batches (pilot −7d, confirm −15d) and the mechanism is visible in transcripts.

**Verdict per §14 binding: the survival guardrail miss is NO-GO. The lever does not land. `scripts/policies/w3drive.js` DELETED per kill protocol; instruments (`scripts/test-w3drive-20261015.js`, `scripts/sweep-w3drive-20261015.js`) + evidence retained.**

## Mechanism: why the lever costs 20 days

The layer is live and honest (89 hunts, 15 engagements, 300 committed blood-fight turns, zero on control; wave-3 unlock days byte-identical both sides — the layer never moves the gate). The counter-knowledge hypothesis is *mechanically* validated: more engagements → more survived encounters → more discoveries (13 vs 8) → more counter-attributed kills (6 vs 4, 1.72x share). But the pursuit is priced in scholar blood:

1. **Committed blood fights kill scholars.** `_huntCommit` holds the scholar to 12% in wave-3 fights (the courtkill-proven mechanism). belongfeast-armed-s151: 16 mantle transfers (scholar deaths) vs 10 on control; 59 'combat' deaths vs 27. Each succession resets the scholar's relationships, gear, and pantry position — and "the dead hold no treaties": every link Haven has shakes.
2. **Hunts are village-blind.** The "don't hunt hungry" gate checks the *scholar's* kcal (≥200), not the village pantry. belongfeast-armed-s706: wave-3 unlocked d63, the scholar ran 5 hunts while the village starved — "⚠ STARVING: health and energy falling" from d74, village-lost d76. Control survived to d154. Pair delta −78d.
3. **The bimodal signature.** Pair survival deltas range −78d to +73d. When hunts go well (belongfeast-armed-s928: +73d, survived 180d, 2 discoveries, 6 wave-3 kills) the village thrives; when the scholar gets chewed up it collapses early. High variance, negative mean.

The design tension flagged in metric review #2 (pre-registration) is confirmed empirically: `_huntCommit` trades observation opportunities AND scholar lives for ledger kills. Kills don't teach wave-3 tricks (the slain path only feeds `counterTeachable()`, which needs a `counter` field — wave-3 has none); only *survived* encounters teach. The commit mechanism pushes toward the outcome that teaches least and kills scholars most.

## Village assessment (sense-tested)

The counter-learning itself reads as people, not robots:

- **Shannon's trick (leadfeast-armed-s373, d67):** "💡 COUNTER LEARNED — Spool: Feed it nothing... (Shannon lived to tell it, twice — the village pieced it together.)" — followed immediately by "📖 The Codex turns a page on its own. Shannon is dead." The teacher died the same day the village learned. The knowledge outlived the knower — the village-as-protagonist thesis in one beat. The village then converted it: 2/2 subsequent wave-3 kills counter-attributed (share 1.00 on that run).
- **Yahir's trick (belongfeast-armed-s151, d89):** same shape — "(Yahir lived to tell it, twice — the village pieced it together.)" then "🩸 The Spool mauled Yahir (−31 health) over 4 rounds. They're lucky to be breathing." (The mauled beat fires twice identically — duplicate narration, filed to sim-findings.)
- **The trick in action (d92):** the scholar fights a Spool post-discovery: "🎞 REC ● (1/3) — the spool's lens-eye never leaves you. It saw: WAIT." ... "▶ REPLAY 1/3: WAIT — the spool holds perfectly still. Your own patience, played back at you." Knowledge exists, execution is imperfect (the scholar still struck twice during the record phase), the signature mechanic is engine-real. Honest.

But the hunts read as the scholar's obsession, not the village's: the scholar leaves a starving village to chase wave-3 beasts (s706), dies repeatedly (16 successions on s151), and the village pays. The *learning* is human; the *pursuit* is not yet wise. A pursuit that checked the village pantry and preserved the scholar (35% eject — observations need survivors) would be the people-shaped version.

## Metric review (post-results)

1. The primary's 1.72x rests on 6 vs 4 counter-kills — small-n volatile (confirm subset alone was 0.47x). The co-primary (+5 discoveries on 13 vs 8) is the stabler signal. A future round should pre-register discoveries as the primary, or pool more seeds.
2. Wave-4/5 kills in the denominator can never be counter-attributed (no trick defs by design). The share's ceiling is bounded by the wave-3 fraction of wave-3+ kills. Honest, but the metric can't see wave-4/5 learning because the engine can't teach it.
3. The survival guardrail fired correctly: −20.5d with a visible mechanism. The bar (−10d) was the right strictness — a lever that costs 3 weeks of village life for +5 trick discoveries is a bad trade on the scale-onramp axis, where survival is the substrate.
4. `bloodTurns` (300) counts per-turn flag sets, not fights — a noisy lever-live counter. Hunts (89) and engagements (15) are the clean ones.

## Blanks filled / documented

- **Filled:** the time-to-learn hypothesis is *mechanically* validated — starting pursuit at wave-3 unlock produces more wave-3 trick discoveries (+5) and a higher counter-kill share (1.72x) than the natural encounter rate, through the engine's real non-lethal observation funnel. The instrument (day-stamped `counter_discovered` tele + `waveKillLog` kill-day attribution, proof-pinned as the single funnel) is reusable for any future counter-knowledge arm.
- **Documented (not chased):** (a) the `_huntCommit` hold-to-12% mechanism is scholar-expensive on wave-3 — a future arm should try pantry-gated hunts and/or no commit (35% eject preserves observers); (b) duplicate "mauled" narration beat (filed to sim-findings); (c) the `wave_unlock` tele event doesn't exist — daily `unlockedWave()` sampling dates unlocks (already the [method] finding #360; this sweep used it).

## Next-round notes (for the coordinator, not this run)

- A w3drive-v2 could keep the seek side but gate hunts on village pantry (not just scholar kcal) and drop `_huntCommit` (the 35% eject preserves the scholar; observations need survivors, kills don't teach wave-3 tricks). Pre-register discoveries as primary.
- The wave-4/5 trick space is engine-dark by design (`villagerTrickDefs` covers 3 of 9 wave-3 signatures, 0 of wave-4/5) — counter knowledge has a hard ceiling until the signature workers wire more tricks to the learnable set. That's their call per MONSTER-WAVES.md.
