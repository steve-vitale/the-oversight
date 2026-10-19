# sim-wireacquire-b3 — wire-acquire drive (backlog #633)

Run: `fleshout-loop-b-20261019T1929Z` (loop B, second axis). Worker tree: `sim-wireacquire-b3`.
Re-arm of the killed wirebootstrap-b2 (KILLED-AT-PILOT, metric-broken not concept-dead).

## Pre-registration (metric binding, MEASUREMENT.md §14 — written before sims)

- **Primary**: MECHANISM-ATTRIBUTED engagement — runs with ≥1 wire acquisition
  through the layer (`waWireBought > 0` or layer-attributed `waWireSets > 0`).
  (b2 measured 1/16; control 0/16. Raw first-trap day is NOT the metric —
  b2's review: 3 of 4 armed "successes" were trajectory noise.)
- **GO**: armed ≥ 3/16 mechanism-attributed wire acquisitions.
- **Horizon**: 180d death-aware (dead villages stop, +10d tail max).
- **Policies**: leadfeast / belongfeast (FEASTSCALE_R13=1, SEATDRIVE=0).
  WIREACQUIRE=1 armed; unset = control (byte-identical — proven by det-gate).
- **Seeds**: 31711–31718 fresh (b2 used 31701–31708).
- **Guardrails**: villager starvation deaths ≤ control+1 (paired per run);
  median survival no worse than −10d; no new death mode (≥2-event rule).
- **Wall** (report-only): national / table / wins, wave 4–5 unlocks,
  median/max survival.
- **Pilot gate**: 8 seeds × 2 policies = 16 runs/arm before/after. The pilot
  IS the measurement for this arm (no separate confirm spend).

## Lever played

`scripts/policies/wireacquire.js` (policy-side, zero src/js, default OFF,
env-gated WIREACQUIRE=1):

(a) **RNG-clean hawker enumeration** — mirrors `tradeSpirit`'s deterministic
gates (entrepreneurial flag, shopkeep-blood occupations: merchant/shopkeep/
sales/peddler/trader/hawker) plus the already-rolled `_tradeSpiritRolled`
field. NEVER calls `Game.tradeSpirit` on an unrolled villager — the layer's
enumeration consumes zero game RNG and writes zero game state. Villagers
the engine hasn't rolled yet are not shopped until the engine rolls them
through its own verbs (b2 metric review §2).

(b) **Targeted wire acquisition** — one trade conversation per day:
1. re-ask wire-but-unaffordable wares now affordable ("come back with a
   full pack" — the engine's own line),
2. ASK living wire-holders with known trade spirit (the scholar seeks out
   the person who holds wire and opens the trade — "Got anything to
   trade?"),
3. fallback: any RNG-clean-known hawker (b2's buy leg).
Buys ONLY the snare_wire ware, ONLY from a surplus (≥1.5× price in pack
finished-food, never the last meal — 500 kcal floor). Polite `hawker_no`
otherwise. Wares are cached per hawker (hawkerStock) until sold: each
villager is asked once (no pointless re-shows of the same ware).

(c) **The proven SET leg** — `setTrap('snare')` on wild ground when holding
wire (Steve 2026-10-05 honest tackle: wire + improvised 2-use snare, no
recipe, "(The snare wire becomes the snare — improvised, 2 uses.)").
Goes permanently quiet once any trap is set — a bootstrap, not a trap
factory.

Substrate findings that shaped the design (measured 2026-10-19):
- Living villagers DO hold snare_wire at spawn: 10 holders / 8 b2 seeds
  (in items/stashed). All 10 were trade-spirit-unrolled at day 0.
- There is NO engine verb moving an item from a living villager to the
  scholar except the hawker ware purchase. The ASK is therefore a targeted
  trade conversation, not a transfer verb — the transfer still rides the
  hawker's offered ware. (An invented transfer would be dishonest
  mechanics; zero src/js changes.)
- Hawker ware math is worse than b2 estimated: 81 tool-class items, so
  P(wire per hawker conversation) = 0.5 × 1/81 ≈ 0.62% (b2 said ~1.25%
  over ~40). Visitor cart "good tool" never rolls wire (picks the single
  functional tool). Each hawker = one 0.62% roll ever (ware cached).
- Quantitative ceiling: ~1–2 known hawkers per run × 0.62% ≈ 0.01–0.02
  expected acquisitions/run via the hawker channel. The ≥3/16 GO bar
  (0.19/run) is ~10× above the channel's ceiling — documented here so the
  next arm doesn't repeat the shape. The SET leg fires on wire from ANY
  source (spawn/corpse-loot/hawker), which is where b2's single
  mechanism-attributed run came from.

## Proof

`scripts/test-wireacquire-b.js` — **18/18 GREEN**:
- RED (3): gate-off strict no-op (no verbs, zero ctx writes); layerOn false;
  wrapper delegates cleanly.
- RNG-clean (2): spiritKnown never calls tradeSpirit, never triggers the
  lazy roll; unrolled villagers never shopped.
- ASK (4): seeks the wire-holder first (not the random hawker); polite
  refusal (hawker_no, refusal counted, holder not re-asked); unaffordable
  recorded + re-asked when the pack fattens; buy fallback for non-holders.
- Throttle/edge (2): one trade conversation/day; no-hawker-choice ends
  politely.
- SET (4): holding→no shopping; wild+wire→set (wireSets=1, done); refused→
  not done; traps already set→permanently quiet.
- ENGINE: wire path consumes wire + 2-use snare at recipe L0; RED without
  wire.
- MIRROR: spiritKnown agrees with the real tradeSpirit on a live game and
  triggers zero lazy rolls (incl. post-roll agreement check).
- SMOKE: 6-day live run, no errors.

Det-gate `scripts/det-gate-wireacquire-20261019.js`: **PASS**.
(1) gate-off 16/16 identical (8 seeds × 2 policies × 60d). (2) gate-on:
16 armed-vs-control pairs — **16/16 zero-fire, 16/16 identical**. The
RNG-clean enumeration is proven: when the layer doesn't fire, armed
trajectories are byte-identical to control. Zero game RNG consumed, zero
game state written by the enumeration.

Substrate finding (new, measured during det-gate): the layer NEVER fired
in 16×60d. Diagnosis (probes `/tmp/spiritprobe*.js`):
- The engine essentially never rolls villagers' trade spirit: 64 base-policy
  talks in 60d → 0 villagers with `_tradeSpiritRolled` set. `talkTo` +
  opening `convoChoices` never calls `tradeSpirit` (the pending-question
  early-return in buildMenu skips the HAWKING block).
- Deep 5-turn conversations DO reach the HAWKING block (12 tradeSpirit
  calls in 4 manual convos, 2 villagers rolled) — but the 'hawker' choice
  still never appears (rolled 0, or MAXC-crowded).
- Deterministic spirit (entrepreneurial flag / shopkeep-blood) is ~0 on
  the pilot seeds (0/15 villagers across s31711/s31712).
- Consequence: the RNG-clean prescription ("shop only villagers the engine
  has rolled") meets an engine that, in practice, rolls almost nobody.
  b2's 6 hawker checks existed ONLY because its buggy enumeration rolled
  villagers itself. The hawker/ask channel's substrate is ~zero, not
  ~1.25%/convo — the 0.62% ware math is moot when no hawkers exist.

## Before/after (16 runs/arm: seeds 31711–31718 × {leadfeast, belongfeast}, 180d death-aware)

| metric | control | armed | verdict |
|---|---|---|---|
| mechanism-attributed acquisitions (PRIMARY) | 0/16 | 0/16 | MISS (bar ≥3/16) |
| layer hawker checks / asks / bought / sets | — | 0 / 0 / 0 / 0 | the layer never fired once |
| runs with first-trap ≤ d30 | 4/16 | 4/16 | — (organic channel) |
| total traps set | 67 | 67 | byte-identical |
| trapline kcal | 138,100 | 138,100 | byte-identical |
| trap catches | 236 | 236 | byte-identical |
| median survival (days) | 115 | 115 | delta 0 — guardrail PASS (bar −10d) |
| starvation deaths | 3 | 3 | 0 paired fails — guardrail PASS |
| national / table / wins | 0/0/0 | 0/0/0 | — |
| wave max | 4 | 4 | — |

Per-seed: 16/16 pairs game-identical (5 pairs differ only in layer ctx
telemetry — `waDone`/`waWireHeldDay` observation writes, zero game effect).
New-death-mode check: no armed-only death keys. The layer is a pure
observer that never took a single verb in 2,880 run-days.

## §15 balanced-panel compare

`scripts/build-wireacquire-panels-b3.js` →
`evidence/2026-10-19/wireacquire-panel-b3.{md,json}` (+ `-before.json.gz` /
`-after.json.gz`). Panel decision: **review_required**, every measured
metric `no_material_signal` with paired delta exactly 0. The panel is the
instrument; the pre-registered threshold is the judge. The instrument
confirms what the telemetry says: the layer did nothing, measurably.

Telemetry deviation check vs `telemetry-baselines/scale-wall.json`: LOUD on
national/table/wins disappearance — **documented regime artifact** (b2
metric review §5): the baseline's own `_regime` note excludes the pre-seat
substrate (SEATDRIVE=0, this pilot). Not a same-run finding.

## Village assessment

What the villages looked like: 16 villages on the pre-seat feast substrate,
median life 115 days, all ending village-lost to combat (wave 4 reached
across the board). The #633 fragility is milder on these seeds than b2's —
the organic trapline engaged in 11/16 runs (median first trap day 57),
paying 138k kcal across 236 catches. Where the wire-tackle fired, it was
the BASE policy's own wire path (trapsWireSet), fed by corpse loot.

Who thrived and died and why: villages died to wave-4 combat, not hunger
(3 starvation deaths in 32 runs). Nobody reached national/table/wins —
structurally ~0 on this pre-seat substrate (regime artifact).

What knowledge was missing: the wire-tackle path is engine-real and used
(the base policy sets wire snares when it holds wire), but the ACQUIRE side
has no working channel: villagers hold wire (10 holders/8 seeds at spawn)
and corpses carry it, but no living trade moves it. The blank #633 named
is confirmed still open — and now precisely bounded (see metric review).

## Sense section (SENSE-TESTING LAW — transcripts read, not just counted)

Two armed transcripts (`evidence/2026-10-19/wireacquire-sense-b3/`,
belongfeast 31715/31718, 35d, narration on) plus a directed ask test
(forced spirit-1 holder, 10d):

1. **The village reads like people, with or without the layer.** "Wire
   doesn't lie." / "Snares were empty. They'll keep." / "🪤 TRAP: Your
   Snare 2 tiles north caught a Virginia Opossum! About 1200 kcal on the
   bone — clean it quickly (knife). It rots fast." / "The Snare broke.
   You'll need another." The trapline is alive in the fiction.
2. **The wire still comes from the dead.** "Taken: Rain Shell x1, Kitchen
   knife x1, Snare wire x1. You take rain shell, kitchen knife, snare wire
   from Moise. Your hands know what they did. (+14 trauma)" — twice in one
   transcript (Moise, Chantal). Corpse loot is the working wire channel;
   the base policy works it.
3. **The wire-tackle honesty is intact.** "(The snare wire becomes the
   snare — improvised, 2 uses.) You set a Snare here. Check it tomorrow."
   — fired twice by the base policy's organic wire path (d17, d34), never
   by the layer (it lost the race: the scholar held wire day 15, the base
   policy set day 17).
4. **The ask, when forced, reads as a person asking.** Directed test
   (holder with spirit forced to 1): the layer sought the holder 10/10
   days — but `checks=0`: the 'hawker' choice never appeared in the
   opening menu (pending-question early-return in buildMenu). A follow-up
   probe proved answering ONE question surfaces the menu: turn 1 showed
   `[hawker,teach,ask:skills,...]`, the trade opened, the ware was
   hawker_food (400), `hawker_no` declined politely. The layer as built
   gives up at the opening menu — a real player answers through. (This
   doesn't save the arm: there are no hawkers to find. But any future
   trade-seeking layer must answer 1–2 questions to reach the trade menu.)
5. **Nothing robotic.** The barter-economy flavor ("traded something with
   someone for something else"), the trader arrivals, the counter-learned
   beats — the village is alive. The layer's silence left no trace in the
   fiction, which is exactly what RNG-clean demands.

## Metric review (REQUIRED)

1. **The primary missed 0/16 against a ≥3/16 bar — and the miss is
   structural, not seed luck.** The layer never fired a single verb in
   16 runs. The pre-registered bar assumed the hawker channel exists; it
   doesn't (see §2). The miss stands as NO-GO — not re-scored.
2. **SUBSTRATE-MISSING (new, the arm's durable finding): villagers don't
   hawk in real sims.** The engine essentially never rolls trade spirit:
   64 base-policy talks in 60d → 0 villagers with `_tradeSpiritRolled`
   set; `talkTo` + opening `convoChoices` never calls `tradeSpirit`
   (pending-question early-return skips the HAWKING block); deterministic
   spirit (entrepreneurial/shopkeep-blood) is ~0 on these seeds. b2's
   6 hawker checks existed ONLY because its buggy enumeration rolled
   villagers itself. The b2 review's prescription — "shop only villagers
   the engine has rolled" — meets an engine that rolls almost nobody.
   The 0.62%-per-conversation ware math is moot when the hawkers don't
   exist. Any future wire-acquire work needs the SUBSTRATE first:
   game-code that rolls villagers through real verbs, a visible trade-
   spirit signal, or an honest ask-for-item verb (steve-call sized).
3. **The RNG-clean enumeration itself is PROVEN and keeps its value.**
   Det-gate: 16/16 gate-off identical + 16/16 gate-on zero-fire pairs
   identical; the 180d pilot then showed 16/16 pairs game-identical.
   The b2 RNG-hygiene bug is fixed as an instrument — future policy
   layers can reuse `spiritKnown`'s mirror pattern with confidence.
4. **The SET leg is redundant, not just proven.** The base policy already
   takes the wire-tackle path (trapsWireSet > 0 on these seeds); the
   layer lost the race twice (wire held d15, base set d17). A bootstrap
   layer can't bootstrap what the base already does.
5. **Guardrails passed trivially** (paired starvation 0 fails, survival
   delta 0, no new death mode) — a silent layer harms nothing, which is
   the only good news and not a reason to keep it.
6. **Panel compare**: review_required, all deltas zero — the instrument
   agrees with the telemetry. The judge (pre-reg) says NO-GO.
7. **Telemetry-check LOUD is the known regime artifact** (b2 §5). Not
   investigated.

## Convergence verdict

**KILLED-AT-PILOT** (substrate-missing). Classification:
- The ASK/BUY channel (villager hawking for wire) is substrate-dead:
  the engine produces ~0 hawkers in real sims. Not tunable policy-side.
- The SET leg is proven but redundant (the base policy already wire-
  tackles).
- The RNG-clean enumeration (`spiritKnown` mirror) is proven and reusable
  — the durable instrument from this arm.
- Next arm (not this one): the substrate must come first — game-code
  work (roll villagers through real verbs, or an honest ask-for-item
  trade verb; steve-call sized) — OR a different source entirely (the
  corpse channel made deliberate is the only working wire source, and
  the base policy already works it).

Kill protocol executed: `scripts/policies/wireacquire.js` deleted
zero-trace. Instruments + evidence kept: `scripts/test-wireacquire-b.js`
(18/18 GREEN pre-kill; self-skips post-kill with the proof record),
`scripts/sweep-wireacquire-b.js`, `scripts/det-gate-wireacquire-20261019.js`
(16/16 + 16/16 PASS), `scripts/sense-wireacquire-b3.js`,
`scripts/build-wireacquire-panels-b3.js`, per-seed JSONs
(`evidence/2026-10-19/perseed-wireacquire-b3/`), panel compare
(`evidence/2026-10-19/wireacquire-panel-b3.*`), sense transcripts
(`evidence/2026-10-19/wireacquire-sense-b3/`).

## Run notes

- Proof: 18/18 GREEN (incl. RNG-clean mirror vs the live engine, 0 lazy
  rolls triggered). Det-gate: PASS (gate-off 16/16 identical; gate-on
  16/16 zero-fire pairs identical). Pilot: 32 runs (16/arm), 180d
  death-aware, ~70 min sim time (control + armed in parallel).
- #633 NOT fixed — see sim-findings.md update.
- Sim cost: det-gate ~6 min (64×60d), proof ~1 min, control sweep ~35 min,
  armed sweep ~35 min (parallel), sense ~2 min.
