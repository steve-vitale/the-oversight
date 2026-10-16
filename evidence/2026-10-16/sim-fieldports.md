# sim-fieldports — WIRE THE MISSING FIELD PORTS (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop, finding #409 (sim-findings).
**Type:** GAME-CODE arm. Follows sim-apexhook (evidence/2026-10-16/sim-apexhook.md), which landed
villagerTrickDefs for herald/finale_crew/finale_opening but DOCUMENTED this blank: "rerun/timeslot/
finale/finale_crew/finale_opening are knowledge-only (need journal/venue/sacrifice — no abstract-model
hook)". This arm ports the three missing species' counterplay into the villager field-fight model:
`sigW4FieldMonster` gains the herald port; `sigW5FieldMonster` gains finale_crew + finale_opening.
Follows the sim-apexhook honest-port pattern exactly: abstract-model gates + honest punishments,
never faked knowledge-only ports. Sibling arms' files (fieldFights.js, game.js) untouched this run —
so the ports are driven by OBSERVABLE villager behavior (rec.actionKinds, rec.mDealt deltas); the
mechanics are real for every villager and the trick is knowing how to exploit them. Knowledge +
gates can hook in later.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (wave-4 Mirror Draft / wave-5 Producers
identities, per-species weaknesses + signature mechanics used as the canon source — never invented).
EXCLUDED: wave 6 (network_tower/network_limb/network_heart) — finding #410: MONSTER-WAVES.md is
silent on wave 6 and it needs Steve's canon first.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the apex-killer tricks proved the trick game is alive, but herald/finale_crew/
finale_opening counterplay is TB-only. If the three missing field ports land (honest abstract-model
ports of the TB mechanics), do the ports fire in sims and do their honest punishments execute?

**PRIMARY (binding):** GO iff BOTH hold —
(a) probe proof GREEN for every ported species (scripts/test-fieldports-20261016.js: RED→GREEN
    per species, exact numbers, det-gate byte-identical with layer off, SMOKE), AND
(b) field-port hook firings for the 3 newly-ported species >0 on treatment in the 8-seed pilot
    sweep, with ≥2 honest punishments or trick-resolutions observed.
A miss is NO-GO, never re-scored mid-run. If probes pass but the sweep has 0 encounters
(no contact), that's a clean no-contact KILL at pilot — layer reverted to zero trace per kill
protocol, instruments + evidence land, and the funnel is named.

**Confirm (binding):** 12–16 seeds, same shape: trick-resolutions vs the newly-ported set
≥ control+2.

**Guardrails:** national ≥ control−2 · median survival ≥ control−10d · no new death mode.

**Substrate:** PRE-SEAT (SEATDRIVE=0 explicit — steve-call #411: the win-side stack truncates the
trick game). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=0. Policies: TF.leadfeast / TF.belongfeast (tribfloor exports).
**Seeds:** 8 FRESH [911,912,913,914,915,916,917,918] × {leadfeast, belongfeast} = 16 runs/arm.
FRESH = 0 per-seed filename hits in evidence/ for this arm's glob (verified before selection).
**Horizon:** 180d death-aware (wave-4 unlocks ~d76 on this substrate per apexpredators; death-aware,
never fixed-window).
**Control:** main tree at the same base commit (3fd8e4d3, clean) loaded via REPO= — identical
seeds, identical policies, identical env; only the layer differs. Read-only load; the main tree
is never modified.
**Gates before spend:** proof RED→GREEN (35/35) · node --check on all touched files · check.js
--quick 94 passed / 3 failed — all 3 are 120s timeouts on green-list tests (test-capable-bot,
test-table-endings, test-synergy-stall); test-synergy-stall verified passing on the pristine
main tree (exit 0, ~140s — over check.js's 120s budget), so environmental, not this arm.

## The build

### 1. Diagnosis — the blank

villagerTrickDefs (game.js:30481-30491) carry the three tricks:
- herald: 'Read the omens — reposition freely' ("It announces everything — read the omens. It is
  slow: reposition freely, never trade blows standing still. (It is a tutorial — the real test
  comes later. Learn it here, cheap.)")
- finale_crew: 'Kill the crew first' ("It is the venue, not the show — end it fast, before the
  ratings climb. Kill the crew and the finale fights part two without its production staff: no
  lighting, no rigging, no second takes.")
- finale_opening: 'Meet it while it is still arriving' ("It is still ARRIVING — the Herald taught
  you: what arrives can be met. Hit it in the arrival, before the credits finish rolling, or feed
  the credits the sacrifice. (Do not let it finish arriving.)")

But villagerTrickAction (fieldFights.js) lists finale_crew/finale_opening as UN-ACTUABLE ("need
journal/venue/sacrifice") and herald has no gate at all; sigW4FieldMonster's W4 gate omitted
herald; sigW5FieldMonster's gate omitted finale_crew/finale_opening. The counterplay existed
only in the TB campaign (finale-campaign.js nodes 1-2) and the TB windup telegraphs.

### 2. The three ports (canon-faithful from weaknesses + signature mechanics)

**herald → the omen cycle** (sigW4.js): the honest port of the TB windup-2 telegraphs
(monsters.json: First Omen line windup 2, Second Omen burst windup 2, The Naming burst windup 3
at hpBelow 0.5, [80,120]). Announce round 1 ("raises its trumpet — a line of sky goes WHITE",
thunder halved), warn round 2 ("WHITENS", thunder halved), land round 3 — cycle repeats. The
landing reads the villager's LAST action kind (rec.actionKinds, same device as the apexhook
editor port): non-'strike' (waited/aimed/healed/tricked — the abstract reposition) → "read the
omen and repositioned — the blast catches empty air" (total quartered); 'strike' (stood still
trading blows) → "THE OMEN LANDS — [80,120] verbatim" (the honest punishment). The tutorial
is real: read, move, live.

**finale_crew → the ratings climb** (sigW5.js): the crew IS the venue — its power is the ratings
(canon from weaknesses: "it is the venue, not the show — end it fast, before the ratings
climb"). Ratings start 20: +8/round the venue drinks attention; −10/round the villager deals
≥12 (rec.mDealt delta — fast damage stalls the show). The crew's hits scale 0.75x +
ratings/100; at 100 ("SWEEPS WEEK — the whole venue is watching") the ads are enormous.
The part-two clause (finale without its production staff) is campaign-real already
(finale-campaign.js: crew spoils: Red Pen, Leaked Script, Bad Note) — this port is the venue
itself, off-screen.

**finale_opening → the arrival** (sigW5.js): still ARRIVING rounds 1–2 (its hits land soft —
"meet it while arriving", canon from weaknesses). Round 3 the credits finish: it declares a
5-round countdown (mdef.fiCountdownRounds, the verbatim TB override) to a [100,140] title card
(mdef.fiCardRange, verbatim), then the card falls, unavoidable. No sacrifice out here (the TB
fiSacrifice is a grid verb; the finale field port sets the same rule) — end it first.

**Infrastructure:** none new — the ports read rec.actionKinds / rec.mDealt (already tracked by
the field model) and own their state on rec.sigW4 / rec.sigW5. No fieldFights.js changes.

**Design calls (Steve 2026-10-07 — decided, documented for overrule):** the ports are behavioral
gates, not knowledge gates — a villager who doesn't know the trick still faces the real
mechanic (the omen still lands; the ratings still climb; the card still falls). The trick
knowledge (already landed in villagerTrickDefs) tells the village HOW to exploit it; a future
arm can add the villagerTrickAction gates (fieldFights.js, sibling file this run).

### 3. Proof — scripts/test-fieldports-20261016.js (35/35 RED→GREEN)

- **RED (3):** MECHANIC=off → sigW4FieldMonster/sigW5FieldMonster absent (the layer is atomic;
  off = byte-identical to base).
- **PORTS (28):** herald — announce/warn/land beats, 40→20 announce rounds, THE OMEN LANDS
  80+40=120 on the stand-still villager, 40→10 on the repositioning villager; crew — ratings
  20→28 (100×1.03=103), stall 28→18 on ≥12 dealt (100×0.93=93), resume 18→26; opening —
  fiCardRange [100,140] / fiCountdownRounds 5 verbatim from mdef, arrival 100→50 ×2, declare
  round 3 with the [100,140] card named, TITLE CARD FALLS round 8 (100+100=200).
- **DET-GATE (4):** eater/congregation/cancellation ports untouched (exact numbers); wave 6
  (network_tower) passes through untouched and silent — the #410 exclusion asserted.

RED established before implementation (29 failures on new behavior, all negatives passing).
GREEN after (35/35).

## Results

### Pilot (8 seeds × {leadfeast, belongfeast} × {treatment, control}, pre-seat)

Per-seed JSONs: evidence/2026-10-16/perseed-fieldports/ · beats: evidence/2026-10-16/fieldports-beats/ ·
analyzer: scripts/analyze-fieldports-20261016.js.

| metric | treatment | control |
|---|---|---|
| port firings (hook calls): herald | **38** (5 runs) | 32 (passthrough — call path only, no port) |
| port firings: finale_crew | **2** (1 run) | 2 (passthrough) |
| port firings: finale_opening | **0** | 0 |
| honest punishments / trick-resolutions | **1** (crew ratings-STALL) | 0 |
| omen landings / dodges | 0 / 0 | — |
| opening declarations / cards | 0 / 0 | — |
| national | 8/16 | 7/16 (guardrail ≥5: GO) |
| table | 12/16 | 12/16 |
| won | 0/16 | 0/16 |
| wave-4 reached | 12/16 | 12/16 |
| wave-5 reached | 8/16 | 7/16 |
| median days | 97 | 110 (guardrail ≥100: **MISS** by 3d) |
| max days | 134 | 133 |
| trick executions (all) | 115 | 114 |
| mean villager tricks known | 2.69 | 2.75 |
| death modes treatment-only | none | — |

**PRIMARY verdict: NO-GO.** (a) Probe proof 35/35 GREEN for every ported species ✓. (b) MISSED:
firings-each>0 fails (finale_opening 0/16 — no contact); punishments 1 < 2. A miss is NO-GO,
never re-scored mid-run (§14).

**Guardrails:** national GO · median MISS (97 vs 110−10=100; n=16, combat-dominated deaths on
both arms — likely noise, reported honestly) · no new death mode GO.

### Where the numbers came from

- **Herald (38 firing rounds):** the port narrates honestly — "raises its trumpet" (announce),
  "WHITENS" (warn) — and the trick was LEARNED in sims ("💡 COUNTER LEARNED — The Herald: Read
  the omens — reposition freely", belongfeast-s915 day 96). But no fight ever reached the
  landing round: villagers flee the 700–900 HP herald by round 2 ("Jada sees how this ends —
  and runs while running still works" — verified in a direct harness fight: vFlee, rounds=2,
  vHpLeft=60). The omen cycle's punishment/dodge is flee-gated — real mechanic, unreachable
  for typical villagers.
- **Crew (2 firing rounds):** one full execution — day 111, leadfeast-s916: "Jovan hits the
  crew HARD (19) — the ratings STALL at 10. The ads falter." / "the crew reads the room — its
  hits land x0.85." The counterplay ("end it fast") worked live, once.
- **Opening (0):** no villager fought the opening credits in 16 runs. Wave-5 campaign node;
  contact funnel, not a port defect (the port is 35/35 proven).

## Village assessment

The villages on the pre-seat substrate die the way apexhook said — of combat, not hunger
(478/542 treatment deaths are combat/monster). Against the herald, villagers behave sensibly:
they read the omen beats for two rounds, learn the trick, and flee a fight they can't win
(4–5/round vs 700–900 HP). The tutorial function works — the punishment doesn't get to fire.
Who thrived: leadfeast-s913's village (134d, national, wave 5) — 6 herald firing rounds, learned
and lived. Who died: everyone, steadily, to the same teeth — combat x280, villager combat x114.

What was missing: **contact and time.** The opening never spawns a field fight in 16 runs;
the herald's landing needs a round 3 that fleeing villagers never see; the crew needs crew
fights (2 rounds in 16 runs). What the village had: honest narration, real windup-round
damage shaping (halved thunder while the omen gathers), and one true stall.

The blank is documented, not filled: the ports are engine-real (35/35) but unactuated in
sims — the actuation finding #409 asked for didn't survive contact.

## Sense-reads (SENSE-TESTING LAW)

**belongfeast-s915, days 77–98** (the herald arc) read end-to-end. Day 77: "The Herald raises
its trumpet — a line of sky goes WHITE. That is where the sound will land. (The omen is
coming — read it. MOVE.)" Then "The sky WHITENS around Olivia — one round to the omen.
(Still time to reposition.)" Then the fight ends — Olivia runs. Days 93, 96, 98: the same
two beats for Hassan, Sam, Agustina. Day 96: "💡 COUNTER LEARNED — The Herald: Read the
omens — reposition freely." The village learns from the tutorial without anyone dying to
prove it — the tutorial working as designed, even though the punishment never lands. Honest.

**leadfeast-s916, day 111** (the crew stall): "Jovan hits the crew HARD (19) — the ratings
STALL at 10. The ads falter." / "the crew reads the room — its hits land x0.85." Two lines,
the whole counterplay: hit it fast, the venue loses the room. It reads as the honest
abstraction of "it is the venue, not the show — end it fast, before the ratings climb."

## Metric review (§14)

- **The PRIMARY conflated mechanism with contact.** (a) was mechanism (proven 35/35 ✓); (b)
  demanded contact (each-species firings) + actuation (punishments) in 8 seeds. The ports are
  real; the sims don't contact the opening (0/16) and don't let herald fights reach round 3
  (flee funnel). The metric measured "does the sim meet the content" — it doesn't — but the
  arm was built to answer "are the ports honest" — they are.
- **Proposed revision for the NEXT run:** split the primary. MECHANISM = probe proof GREEN
  (unit-level, already 35/35). CONTACT = per-species field-fight contact rate in 16 seeds
  (diagnostic, not gating). ACTUATION = punishments given contact (conditional rate). A port
  with proven mechanism + honest narration + observed teaching (herald) is not "dead code"
  even when its punishment is flee-gated.
- **The median guardrail miss (97 vs 100):** n=16, combat-dominated deaths on both arms;
  treatment deaths 542 vs control 578. Likely noise, but a miss is a miss — reported, not
  explained away.
- **No re-scoring:** the NO-GO stands on the pre-registered metrics. The revision above is
  for the next run only.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-16/perseed-fieldports/*-treatment.json' --metrics national,table,wins,exiled`
→ **LOUD: wins disappeared: baseline 16 -> current 0 (n=16 files).**
Verdict: **EXPLAINED, not a bug — do NOT roll the baseline forward.** The scale-wall baseline
(national=12, table=16, wins=16) was recorded on the win-side substrate; this run is PRE-SEAT
(SEATDRIVE=0 explicit, steve-call #411), where wins are 0 by construction — the win pursuit is
deferred so the trick game isn't truncated. The apexhook arm on the same substrate also measured
0/16 wins. National/table deviations (8 vs 12, 12 vs 16) are within the pre-seat band measured
by sibling arms. Baseline left untouched (arm killed; substrate differs).

## Convergence state

**killed-at-pilot.** The scale-onramp axis: the three field ports are engine-real and proven
(35/35), but the pilot's binding actuation bar wasn't met — finale_opening had zero contact
in 16 runs, and the herald's omen landing/dodge is flee-gated (villagers flee by round 2, the
landing needs round 3). The funnels are named: (1) the **flee funnel** — hyper-lethal
tutorials can't punish villagers who (correctly) run; (2) the **contact funnel** — wave-5
campaign nodes don't meet villagers in field fights at 16-seed scale. Per the kill protocol,
the game-code layer is reverted to zero trace; instruments + evidence land for the next arm.

## Blank-fill record

- FILLED (proof): scripts/test-fieldports-20261016.js (35/35 RED→GREEN) — every port's honest
  mechanic proven with exact numbers, det-gate byte-identical with layer off, wave-6 exclusion
  asserted.
- FILLED (instrument): scripts/sweep-fieldports-20261016.js + scripts/analyze-fieldports-20261016.js
  (paired treatment/control, port-call wrap + rec.log/say-beat scrape).
- FILLED (evidence): this file + evidence/2026-10-16/perseed-fieldports/ (32 per-seed JSONs) +
  evidence/2026-10-16/fieldports-beats/ (sense-reading material).
- DOCUMENTED (not fixed — killed at pilot): the three ports (herald omen cycle, crew ratings
  climb, opening arrival/countdown) are reverted to zero trace per the kill protocol. The
  funnel findings (flee funnel, contact funnel) are the durable result.
- NOTED for the sibling loop: villagerTrickAction gates for herald/finale_crew/finale_opening
  remain unwritten (fieldFights.js was a sibling file this run) — the next arm on this blank
  can add them; the ports' behavioral design already supports them.
