# GORGE-DRIVE — wave-5 pantry-gorge counterplay (scale-onramp r28 ARM 1, 2026-10-14)

ARM 1 of the scale-onramp multi-arm run. POLICY-SIDE + TOOLING ONLY — no
game-code changes (scripts/policies/gorgedrive.js, scripts/gorge-census-20261014.js,
scripts/test-gorgedrive-20261014.js). Answers the r27 open blank WAVE-5
PANTRY PREDATION: a lingering wave-5 monster (The Cancellation) holds the
treeline and gorges 500–1500 kcal/night from the stores
(src/js/havenGrowth.js:222: "Drive it off, or call for help."). s88 lost
4,071 kcal over two nights → pantry 17.6k→0 → 3 hungry days → the
scattering. Open question: is the counterplay ("drive it off") reachable,
or is the beat decoration? (The gorge RATE is untouched — a steve-call —
this arm measures the counterplay only.)

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14)

- **Primary metric**: (a) gorge-nights answered ≥ 50% — a gorge-night is
  "answered" when its lingering monster is fought (scholar or villager),
  killed, or drove-off within 3 days; (b) post-unlock pantry-gorged kcal
  ≤ 50% of the gate-off baseline.
- **GO threshold**: primary (a) AND (b) met, plus all guardrails. Else KILL.
- **Guardrails**: median survival ≥ baseline − 10d; national count ≥
  baseline − 2; scholar deaths/100d ≤ baseline × 1.2.
- **Horizon**: 180d death-aware (same as r26/r27 so the censuses are
  comparable). Why: wave-5 unlocks land ~d57–116; post-unlock survival is
  the window. Death-aware, never fixed 200d.
- **Seeds**: 11/22/33/44/55/66/77/88 (standard set), identical seeds
  before/after.
- **Policies**: leadfeast (leadcourt + FEASTSCALE_R13=1) baseline vs
  leadfeast+gorgedrive (GORGEDRIVE=1). Gate-off is pure delegation —
  proven byte-identical to raw leadfeast (proof test PART 2).
- **Diagnostic GO (instrument)**: fires cleanly on all 8 seeds AND ≥1 gorge
  event measured AND every measured gorge attributes a named monster +
  pantry delta. (Met — see Instrument.)
- **Convergence report**: TBD.

## The answer layer (scripts/policies/gorgedrive.js)

Opt-in via GORGEDRIVE=1, default OFF. When a lingering monster exists, the
scholar marches out with the honest engine verbs:

1. `Game.travelTo(m.tx, m.ty)` — the monster's tile. startCombat removes
   the world-monster entity via `playerMonster()` (the monster ON THE
   PLAYER'S TILE) — no travel, no linkage, the gorge continues.
2. `Game.triggerEncounter(m.id)` — the engine's own "it comes for you"
   choke point. The harness resolves it via startCombat + driveFights: a
   real blow-by-blow player fight, party auto-joining per the 4-square rule.
3. Party via `Game.inviteToParty` — honest, acceptance-based, never forced.

Judgment gates (design calls, Steve can overrule): table sanctity (never
while the table sits — Steve 2026-10-12); HP ≥ 50% vs wave-5 (≥ 35% lower
waves); never alone when a villager party is available (invite up to 2
healthy villagers; if help exists but nobody comes, HOLD); never clobber a
live fight/pending encounter; never answer asleep or inside the tent; one
answer per monster per day.

Design deviation from the brief (documented): the brief assumed lingerers
stay pinned at the haven tile. `wanderWorldMonsters` (35% per tile-entry
worldTick) drifts them during the day; `havenGrowthDaily` re-pins at dawn.
The policy tracks the ENTITY — re-scans after travel and requires
`monsterAt(scholar tile) === target` before triggering, never removing the
wrong entity. The haven-tile lingerer is still preferred as the target.

## Instrument (scripts/gorge-census-20261014.js)

Read-only wraps (proven byte-identical day hashes wraps-all vs wraps-none
over 40d, seed 11): havenGrowthDaily pre-snapshot of the lingering set (in
iteration order), raidPillage returns (honest kcal), say-line gorge capture,
resolveWildMonsterEncounter captures (villager answers), resolveAidCrisis
captures (valve-drift explanation). Per-day index-wise pairing attributes
each gorge line to a named monster + pantry delta; attribution failures are
counted loudly.

Proof: scripts/test-gorgedrive-20261014.js — 26/26 GREEN (real RED:
gate-off engages 0× and the gorge beat fires pristine; non-aggression:
gate-off byte-identical to raw leadfeast over 20d; GREEN: pendingEncounter
with the lingering monster's id, scholar marched to its tile, real tbfight
started, entity removed from the world at fight start, gorge beat silent
after; judgment: table/HP/hold branches).

## RESULTS

8 seeds × leadfeast ± GORGEDRIVE=1, 180d death-aware, identical seeds.
Raw: `evidence/2026-10-14/gorge-baseline.json`, `gorge-armed.json`.
Instrument diagnostic GO: MET — fired cleanly on all 16 runs, 10 gorge
events measured, 0 attribution failures, 0 instrument errors.

### Before/after (identical seeds)

| | baseline (gate off) | armed (GORGEDRIVE=1) |
|---|---|---|
| wave-5 unlockers | 2/8 (s22 d57, s44 d63) | 3/8 (s22 d57, s33 d92, s44 d63) |
| gorge events | 8 | 2 |
| gorge-nights answered | 8/8 (100%) — 3 scholar, 5 villager | 2/2 (100%) — 2 scholar |
| gorged kcal total | 11,197 | 2,530 |
| gorged kcal post-unlock | 0 | 0 |
| layer engagements | 0 | 1 |
| median survival | 101d | 101d |
| max survival | 123d | 128d |
| national | 3/8 | 4/8 |
| table seeds | 1/8 | 1/8 |
| scholar deaths/100d | 6.1 | 6.83 |
| ends | 8/8 village-lost | 8/8 village-lost |

Baseline gorge events (waves backfilled from the def — entities don't carry
`wave`; the instrument now resolves it live): s33 d35 gallowdeer w1
(1,272 kcal, answered scholar d36), d83 warranty_caller w2 (929, scholar
d84), d112 callback w3 (1,382, scholar d113); s66 d58–62 alien_tick w2
(1,245/1,618/1,500/1,571/1,680 — 7,614 total, answered by villagers nightly
without killing it).

Armed gorge events: s33 d35–36 gallowdeer w1 (1,530 + 1,000 — answered by
scholar contact fights d37, NOT by the layer: the layer saw the lingerer
both days but HELD — 3 villager invites refused, `heldAlone=2`, honest per
its judgment gate).

### The s66 preemption (identical-seed demonstration)

d57 raid identical both arms (Glow Stag, Static Kite, tick; "Nobody met the
tick"). Baseline: the tick gorged 5 nights (7,614 kcal) while villagers
fought it daily and failed to kill it. Armed d58: "🥁 Cheryl marches out to
drive off the lingering tick at the treeline — 1 at their back."
(`engagements=1`, `invitesOk=1`, `daysSaw=1`.) Zero gorge nights followed —
the engagement preempted all 5. The layer's one live fire prevented
~7.6k kcal of gorging on the identical seed.

### GO verdict

- Primary (a) gorge-nights answered ≥50%: 2/2 = 100% ✓
- Primary (b) post-unlock gorged kcal ≤50% baseline: 0 ≤ 0 ✓
- Guardrails: median 101 ≥ 91 ✓ · national 4 ≥ 1 ✓ · 6.83 ≤ 7.32 ✓
- **→ GO per the pre-registered bar.** Strength of evidence: WEAK — the bar
  was designed around wave-5 gorges (r27 s88), which did not reproduce on
  this road in either arm (no post-unlock gorge in 16 runs); the
  "answered" rate was already 100% via existing pathways in both arms. The
  lever-attributable effect is the single s66 preemption. The mechanism is
  proven (26/26 proof + live fire), the gates behaved (2 honest holds on
  s33, 72 table-sanctity holds on s22), and the layer is default-OFF (zero
  production risk when unset — proven byte-identical). Coordinator/Steve
  can overrule; the honest summary is "works, safe, thin sample."

## Village assessment

Sixteen villages, sixteen scatterings (8/8 village-lost both arms, median
101d). The gorge beat fires when a raid leaves unmet raiders — i.e. when
the defender pool is already thin — and the gorging then deepens the
depletion: s66's tick took 7.6k kcal across 5 nights while the village
starved around it. Who thrived: villages with fat pantries and full
defender lines never saw a lingerer (6/8 seeds gorge-free). Who died: the
depleted — s33's gallowdeer gorged twice while the roster bled elsewhere.
What was missing: not the counterplay (it exists — villagers fought the
s66 tick nightly; the scholar answers contact fights) but the DECISION to
answer promptly — the engine's pathways answer eventually (100% within 3
days here) yet let 5-night bleeds run. The layer fills exactly that blank:
it answers on day 1. The wave-5 apex instance (the r27 hollow) remains
unmeasured — no wave-5 lingerer occurred on this road.

## Sense-testing

Read the gorge beats and their neighborhoods (s33, s66, both arms):
- "🌙 Night. The lingering tick gorges at the treeline — 1,245 kcal gone
  from the stores. Drive it off, or call for help." — reads as a situation
  report with an explicit call, not dispenser text; the preceding "Nobody
  met the tick — it's still out there at the treeline. It'll gorge every
  night until it's driven off." frames it as a village situation with
  stakes. Coherent.
- The s66 5-night tick bleed reads as a siege the village is losing
  slowly — villagers fight it daily (named: Nino, Liam, Ella) and it keeps
  coming back. The fiction holds; the mechanics (field fights not killing
  a wave-2 tick in 5 tries) are the honest attrition the layer shortcuts.
- The armed answer beat — "🥁 Cheryl marches out to drive off the lingering
  tick at the treeline — 1 at their back." — reads as a village decision
  with a named actor and a party. This is the beat the brief asked about:
  it is reachable, and it reads as agency, not UI text.
- Verdict: the "drive it off" beat is NOT decoration. It is reachable by
  villagers (slowly), by the scholar (contact), and now by the policy
  (promptly). Meaning and coherence hold.

## Blanks filled / documented

- WAVE-5 PANTRY PREDATION (open → partially answered): the counterplay is
  REACHABLE — proven by real RED→GREEN proof (26/26) plus a live identical-
  seed preemption. The wave-5 apex instance specifically is still
  unmeasured (no wave-5 lingerer on this road); needs a constructed
  scenario, not the 8-seed road. Stays open in sim-findings.md as
  wave-5-apex-gorge.
- Adjacent blank tripped over (design, not chased): lingering monsters
  drift off the haven tile during the day (`wanderWorldMonsters`, 35% per
  tile-entry) and are re-pinned at dawn — any "answer the lingerer" logic
  must track the ENTITY, not the tile. The policy does. Filed in
  sim-findings.md as lingerer-drift.
- Adjacent blank: world-monster entities do not reliably carry `wave`
  (raid code reads `m.wave || 1` defensively) — any wave-gated policy logic
  must resolve from the def by id. Filed as entity-wave-missing.

## Metric review

Per §14, the metric binds and the run is judged against it (GO above). For
the NEXT run, the metric needs redesign:
1. "Gorge-nights answered" was saturated at 100% by existing pathways in
   both arms — it cannot discriminate a prompt-answer lever. The lever's
   real effect is PREEMPTION (fewer gorge nights), which shrinks the
   denominator. Next run: primary = gorged kcal per lingerer-day, or
   gorge-nights per raid, conditioned on lingerer occurrence.
2. The post-unlock framing assumed the r27 hollow reproduces on the 8-seed
   road. It didn't (0 post-unlock gorge nights in 16 runs). The wave-5 apex
   case needs a constructed scenario (seeded wave-5 raid + depleted roster),
   not the courtship road.
3. s33 armed showed 12 scholar deaths vs 7 baseline on one seed (suite
   guardrail still passed: 6.83 ≤ 7.32). Watch per-seed death spikes on
   future fight-picking levers even when the suite bar holds.
