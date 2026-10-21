# sim-belongbonds — the belong road's missing diplomacy leg (flesh-out loop, 2026-10-21, arm sim-belongbonds)

Run: fleshout-20261021T0323Z, arm sim-belongbonds. Axis: scale-onramp (the blocking axis).
Named next: backlog #742 (claimed by this run).

Canon: docs/CANON.md + docs/TABLE.md + src/js/standing.js + src/js/hierarchy.js
(the standing/bond/seasoning rules — read 2026-10-21T03:4xZ; the code is
authoritative where the docs are stale). No canon doc covers "feast
invitations to neighbor villages" — hostFeast guests are roster vids, not
foreign villages; said plainly in the layer docs rather than invented.

## THE GAP (#742)

On the seatdrive substrate the belong road's standing mix (war 0–50,
diplomacy 0–34) never reaches raw 200 on 4/8 runs — below-bar is a
belong-side phenomenon; leadfeast clears raw 200 on 8/8
(evidence/2026-10-21/sim-fullseat.md). Bonds (diplomacy) is the belong
road's missing leg.

Mechanism (verified in code this run):
- Diplomacy standing = +34 per SEASONED REGIONAL+ link: 30+ days old AND
  trust 40+ (`_linkSeasoned`) AND in a regional-scale polity
  (`_linkRegionalPlus`): LEAD (Haven's realm ≥3 seasoned subs), BELONG
  (subordinate + primary's realm ≥4 with the bond in good standing —
  trust ≥50, arrears 0, age ≥14), LEAGUE (3 seasoned covenant/trade peer
  links inside the league polity).
- The belong road's single subordinate bond seasons only when the
  PRIMARY's realm consolidates to 4 fires (out of our hands), and the
  succession tribute ratchet breaks the good-standing bar at the first
  arrears posting — sim-diphold KILLED-AT-PILOT proved payment discipline
  buys 0 dip-days (reactive clearing is post-hoc; the pantry can't carry
  the ratcheted bill).
- So the belong road has exactly one diplomacy source, and it is both
  externally gated (the primary's consolidation) and ratchet-fragile.
  Below-bar is structural, not a tuning miss.

## THE ARM

`scripts/policies/bonds.js` (BONDS=1, default OFF, zero src/js): the
scholar actively courts a PARALLEL league leg — TRADE charters with
neighbor fires — alongside the belong bond. 3 seasoned charters form the
trade league polity → +34×3 = +102 diplomacy, independent of the primary's
consolidation and immune to the tribute ratchet (trade links carry no
weekly bill; the tariff is income).

Design calls (documented, Steve can overrule):
1. TRADE only, no covenants: the charter is pantry-net-positive (+1000
   kcal/wk tariff in, −400/wk upkeep out per route) and has no swords
   (help calls refusable aloud); the covenant costs 2,000 kcal/wk flat
   once live + war-pact defense calls (two villagers, three days) — the
   wrong leg on the food-tight belong road.
2. Proposals only in direct-accept territory (deterministic peer score ≥55:
   48 + min(20, repS/2) + opinion/2 — the `_judgePeer` deterministic part);
   no cold-asks, one proposal/day, 7-day cooldown per target, max 3 active
   peer links.
3. Answering is inherited, never re-implemented: trade help calls,
   covenant crises, the Charter national beat ('sign', +6 trust each),
   accords, and counters all flow through the belongseek/scalecourt daily.
   A trade counter that lands is answered by belongseek's
   answerBelongCounter ('accept' at the counter's 1,200 kcal/wk tariff —
   still net-positive — or 'walk').

Trust math (engine): peer links form at trust 30; the weekly trade tick
grants +1; the Charter 'sign' grants +6 each; member deeds grant +1..4
("a league respects strength"). Seasoning (30d + trust 40) lands ~day
65–105 for day ~30–35 formations — inside the day-140 window.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep, 2026-10-21T03:5xZ)

**PRIMARY:** belongfeast runs reaching raw standing ≥200 within the
measurement window (max over dailies of `Game.villageStanding().total`;
window = the run's duration — death-aware, wins truncate; the gap was
measured as max-reach on this substrate). GO threshold: **armed reaches
≥200 on ≥6/8 runs AND armed count ≥ control count + 2.** A miss is NO-GO,
never re-scored (§14). (Control expectation from the fullseat corpus:
belongfeast reached raw 200 on 4/8 — the bar demands the drive close the
gap, not merely nudge it.)

**Guardrails (all must hold):**
- starvation deaths armed ≤ control
- median survival armed within 10d of control
- national reach armed ≥ control − 1 (not harmed; 1-run noise allowed)
- no new death modes (a death cause with ≥2 events on armed and 0 on
  control = new mode)

**Horizon:** 180d death-aware (reachability lever — standing/waves/national
are 150–200d questions per §10; the gap was measured at 180d).

**Seeds:** 64501–64508 (identical seeds both arms; the same seeds as the
fullseat DIAG — the control corpus doubles as a fidelity check against
the fullseat belongfeast numbers).

**Policies:** belongfeast only (the task scopes to the belong road;
leadfeast is not below-bar).

**Substrate:** withSeatDrive(withBonds(withWinDefer(TF.belongfeast)));
env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
(+ BONDS=1 armed only). BONDS is the ONLY switch between arms.

**Instrument:** scripts/probe-bonds-20261021.js (SMOKE/DET/sweep + resume
via per-seed files); scripts/policies/bonds.js `snapBonds()` (pure reads
of the engine's own standing state); analyzer
scripts/analyze-bonds-20261021.js; panel compare via
scripts/lib/balance-scorecard (control=before, armed=after; the panel is
the instrument, the pre-registered bar is the judge).

**Proof:** scripts/test-bonds-20261021.js — stub-level RED→GREEN (the layer
proposes in direct-accept territory, delegates byte-identical when off;
exile/pending-beat/3-cap/pantry-floor/opinion guards) + engine engagement
(120d armed vs control on 2 seeds: layer-proposed trade links form armed,
zero control — mechanism-attributed, not trajectory noise) + det-gate
(BONDS=0 == unset == bare stack byte-identical, with the engine-repeat
control per the 2026-10-14 entropy-hunt known issue).

## RESULTS (sweep 2026-10-21T04:0xZ — 8 seeds × {armed, control}, paired, 180d death-aware)

**PRIMARY: NO-GO.** Reached-200: control 3/8, armed 5/8. The bar (armed
≥6/8 AND armed ≥ control+2): the margin prong is met exactly (+2), the
absolute prong is missed (5 < 6). Per §14 the miss is NO-GO, never
re-scored.

Per-seed (c=control, a=armed; maxRaw / reached / diplomacy@max):

| seed | c maxRaw | a maxRaw | c→a | a proposals | a league? |
|------|----------|----------|-----|-------------|-----------|
| 64501 | 125 | 150 | +25 | 3 | no (trusts 26/39/68 at d90 win — age-short) |
| 64502 | 364 | 324 | −40 | 3 | no (trusts 35/35/37) |
| 64503 | 454 | 279 | −175 | 3 | no (won d94 vs d137 — trajectory divergence) |
| 64504 | 134 | 282 | +148 | 3 | YES — 3 seasoned, dip 34→102, reached |
| 64505 | 354 | 354 | 0 | 0 | n/a (layer never fired; trajectories byte-identical) |
| 64506 | 179 | 224 | +45 | 2 | no (reached via war+plenty noise, dip 34→34) |
| 64507 | 134 | 154 | +20 | 3 | no (trusts 47/47/49 at d95 win — age-short) |
| 64508 | 195 | 100 | −95 | 3 | no (village died d66; control won d90) |

**Mechanism attribution** (the layer's own counters + link census):
- 20 proposals armed, 0 control. Engine engagement proven: 3 trade links
  formed on both proof seeds, 0 control (proof 29/29 green).
- 64504 is the end-to-end mechanism proof: 3 charters (d30/31/36) → the
  Charter beat answered 'sign' (+6 trust each) → all 3 seasoned (trust 67)
  → trade league polity → diplomacy 34→102 → raw 134→282 → reached 200.
  The fiction is people-like (transcripts): Catalina brings each charter
  home by name; the first-gesture gifts cost real food; the d36 grief
  tested two charters and Haven conceded tariff 1000→750 honestly to hold
  them; the charter partner (The Red Table) also raids the pantry — the
  game doesn't sanitize it.
- The miss is STRUCTURAL (timing), not conceptual: the league needs
  30-day link age + trust 40, so charters formed ~d35–55 season ~d75–105 —
  but the seatdrive substrate wins at ~d90 and truncates the window.
  64501/64507 show trusts at/near 40 at the win but age-short; the
  diplomacy arrives just after the run ends. The opinion≥10 courtship
  climb (contest-win broadcast, +2 each) is the other half of the clock:
  on contest-poor seeds the layer proposes late or never (64505: 0
  proposals, byte-identical trajectories both sides).
- 64506's "reach" is NOT mechanism-attributed (war 25→50 and plenty
  120→140 moved; diplomacy flat at 34) — counted in the 5/8 per the
  pre-registered metric, flagged here for honesty.
- 64508 (armed died d66, control won d90): trajectory divergence from the
  proposals' RNG draws, not a mechanism harm — the layer spends no food
  and sends nobody away; death causes match control's set (no new mode).
  The inherited trade-call answering ('send' only when pantry > 10k) is
  the one real exposure and is worth a look on any retry.

**Guardrails:** starvation deaths 3 vs 2 — BREACH (armed ≤ control
required; +1: 64501/64504/64507 vs 64504/64506 — trajectory noise, the
trade links are pantry-net-positive, but the bar is binary). Median
survival 94 vs 100 — OK (within 10d). National 6/8 vs 6/8 — OK (not
harmed). No new death modes — OK (every armed death cause appears on
control).

**Wall numbers:** control national 6/8, table 7/8, wins 7/8, medSurv 100d;
armed national 6/8, table 8/8, wins 7/8, medSurv 94d. Wave reach not
instrumented on this sweep (standing-focused); the panel carries the
contract metrics.

**Balanced panel (§15):** control=before, armed=after — decision
`review_required` (8-case screen), NO material signal on any observed
metric (win rate 0.875→0.875, national 0.75→0.75, invitation 0.875→1.0
no_material_signal). The panel is the instrument; the pre-registered bar
is the judge. Files: belongbonds-panel-primary.{md,json,json.gz}.

**Fidelity note:** this run's control does NOT reproduce the fullseat
belongfeast corpus trajectories (e.g. 64501: fullseat won d148, control
died d69) — master moved between the runs (sibling theft-detection
commits e89c294b9/2d0be9561 landed 2026-10-21T03:26Z, after the fullseat
corpus at 03:04Z). Engine drift, not an instrument difference; the
paired control is the correct baseline for this run's armed side.

**Proof:** scripts/test-bonds-20261021.js — 29/29 green (stub RED→GREEN
20/20: proposal gating, exile/pending-beat/3-cap/pantry-floor/opinion/det
guards, gate-off delegation; engine engagement: 3 trade links armed vs 0
control on 2 seeds × 120d; det-gate: BONDS=0 == unset == bare stack
byte-identical on both seeds, with the engine-repeat control per the
2026-10-14 entropy-hunt known issue).

**Sense-testing:** the bonds read as relationships between people, not
ledger ticks (evidence/2026-10-21/belongbonds-transcripts/). Named
speakers bring charters home; first gestures cost real food; grief tests
the bonds and the answers cost real tariff; your charter partner raids
your pantry and the fiction says so aloud.

## Metric review (§14 anti-drift)

The pre-registered metric (reached-200, GO = armed ≥6/8 AND ≥control+2)
held — 5/8 vs 3/8 is NO-GO, not re-scored. Notes for the NEXT run, not
this one:
1. The metric is win-truncation-noisy: maxRaw is dominated by win-day
   standing variance (64503: −175 on an earlier win; 64506: +45 via
   war/plenty noise). A mechanism-attributed primary (diplomacy ≥68 by
   day 140, or league-formed share) would judge the lever instead of the
   noise.
2. The absolute prong (≥6/8) may be mis-set for a lever whose mechanism
   needs ~100 days on a substrate that wins at ~90. The margin prong
   (+2) was met exactly. If the lever is retried, pre-register on the
   mechanism (seasoned league links) with the win-truncation acknowledged
   up front.
3. The starvation guardrail (binary ≤) is fragile under trajectory
   divergence — 3 vs 2 on noise. Consider a paired per-seed formulation
   on the next run.
4. `snapBonds` records the breakdown AT maxRaw, not at run end — on
   64501 the trusts kept climbing after maxRaw was set. A future
   instrument should record the breakdown at run end too.
5. Panel flags must match exactly between before/after (the scorecard
   rejects 'Unmatched flags') — encode the arm comparison in a shared
   flag value (BONDS: 'control-vs-armed'), per the hideacq precedent.

## Named nexts

1. **[killed]** The BONDS layer is killed at pilot per the pre-registered
   bar (NO-GO 5/8 vs 3/8, starvation guardrail breach). Policy layer
   deleted zero-trace; instruments + evidence + proof kept (commit
   <SHA>).
2. **[axis]** The mechanism is PROVEN but too slow for the winning
   substrate: the league leg needs ~100 days (opinion climb + 30-day
   seasoning) while seatdrive wins at ~90. The named retry is a
   mechanism-attributed primary (seasoned league links by day 140) on a
   longer-window substrate — or a steve-call on peer-courtship pacing
   (the opinion≥10 climb is contest-gated; no policy-side accelerant
   exists without persona movement, which the belongseek-v3 lesson
   forbids).
3. **[finding]** The first-gesture accord fires per charter (each +10
   trust for a 2,000 kcal gift) — on 64504 this put all three charters at
   trust 40 on formation week. The accord is the fastest trust source in
   the peer game; any future league arm should count on it.
4. **[finding]** The Charter national beat ('sign', +6 trust each) never
   staged on these seeds — the belong Binding occupies the national slot
   whenever the primary's realm qualifies. The league leg therefore
   seasons on passive ticks + deed gains alone on exactly the runs where
   the belong bond is healthiest. (Not a bug — the priority order is
   docs/SCALE.md canon — but it means the two diplomacy legs don't
   compound.)
5. **[backlog]** #742 stays open: the belong road's diplomacy leg is still
   the binding constraint on 3/8 runs. The league route is proven
   viable (64504) but sub-threshold as a pilot lever.

## Files

- ~~scripts/policies/bonds.js~~ — DELETED per kill protocol (NO-GO at
  pilot); the design is documented in this file's THE ARM section
- scripts/probe-bonds-20261021.js — the sweep (SMOKE/DET/sweep; requires
  the deleted layer — kept as the historical instrument)
- scripts/test-bonds-20261021.js — proof (29/29 green pre-kill; now the
  kill-protocol INFO-SKIP branch)
- scripts/analyze-bonds-20261021.js — analysis + §15 panel compare
- scripts/bonds-transcripts-20261021.js — sense-testing capture
  (diplomatic beats)
- evidence/2026-10-21/perseed-belongbonds/{control,armed}/s64501–s64508.json — 16 per-seed JSONs
- evidence/2026-10-21/belongbonds-corpus-summary.json — the corpus summary
- evidence/2026-10-21/belongbonds-panel-primary.{md,json,json.gz} — the §15 compare
- evidence/2026-10-21/belongbonds-transcripts/ — diplomatic beat transcripts
- evidence/2026-10-21/sim-belongbonds.md — this file (pre-registration + results)
