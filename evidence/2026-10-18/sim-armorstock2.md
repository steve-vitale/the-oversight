# sim-armorstock2 — the armorbreak NAMED RETRY (2026-10-18)

Run: flesh-out loop arm sim-armorstock2 (run_id fleshout-20261018T0122Z), axis scale-onramp (blocking).
Worktree: ~/workspace/worktrees/sim-armorstock2. Branch: sim-armorstock2.
**ZERO src/js changes.** New files ONLY: scripts/policies/armorstock.js (rebuilt,
then deleted zero-trace per kill protocol — see Verdict), scripts/test-armorstock2-20261018.js
(now INFO-SKIPs honestly), scripts/sweep-armorstock2-20261018.js,
scripts/sense-armorstock2-20261018.js, scripts/armorstock2-compare.js,
evidence/2026-10-18/sim-armorstock2.md (+ per-seed JSONs under
evidence/2026-10-18/perseed-armorstock2/, panel compare
evidence/2026-10-18/armorstock2-panel-compare.md, panel archives
armorstock2-panel-before/after.json.gz).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (readiness gate, design call #4) +
docs/BEAR.md (butchering → hide_armor L1). The armor model: pieces sum into P
(5 body slots + coordination), r = P/(P+20), absorbed = min(hit-1,
round(hit*r)) — at least 1 always lands (AGENTS.md ARMOR MODEL, Steve 2026-10-09).

## Why this retry exists

sim-armorstock (2026-10-17) was KILLED on its §14 PRIMARY (wave-4 unlock share
0/16 vs 0/16, bar +3) — but the miss was classified SUBSTRATE-MISSING, not
concept-dead: wave-4 unlocks NEVER occur on the pre-seat FEASTSCALE_R13
substrate (0/32), so the durable-stockpile concept was never actually tested.
The named retry (tracker + sim-findings #514, claimed by this run): an
unlock-capable substrate + ARMOR-MARGIN-AT-DEFERRAL as PRIMARY, not unlock share.

## The question

Does the ARMORSTOCK=1 quartermaster protocol (rebuilt from the
evidence/2026-10-17/sim-armorstock.md spec — trophy-stockpile recovery,
butchering→hide_armor crafting channel, reserve tracking; the killed layer was
deleted zero-trace and never committed, so this was a faithful rebuild, not a
new design) move the armor margin at wave-4 deferral days on a substrate where
wave-4 unlocks actually happen?

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

- **Substrate (asserted at startup, recorded per-seed):** FEASTSCALE_R13=1
  TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, VETREL=1,
  SEATDRIVE default-ON (unset — the seat driver takes the seat; wins truncate
  ~d90), ALLOWGATE2 unset. The unlock-capable stack: the seatdrive-composed
  win stack (tribfloor → withWinDefer → withSeatDrive, SD.leadseat/SD.belongseat)
  + the VETREL=1 companion-veteran channel (the composition that made readiness
  reliable 18-0 at confirm). Sweep-time master commit 47fbea56 recorded in
  every per-seed JSON.
- **Policies:** base = withVetrel(SD.leadseat / SD.belongseat) (VETREL=1);
  armed wraps the base in AS.withArmorstock (ARMORSTOCK=1); control is the
  SAME wrapped object with ARMORSTOCK unset (gate-off = pure delegation —
  the ONLY delta between arms is the env var).
- **Seeds:** 8 FRESH (5102117, 5212219, 5322321, 5432423, 5542525, 5652627,
  5762729, 5872831 — 0 filename hits across evidence/ verified 2026-10-18
  before the sweep). 8×2×{control,armed} = 32 runs, identical seeds per arm.
- **Horizon:** 180d death-aware (dead villages stop simulating). Rationale:
  wave-4 unlocks on unlock-capable substrates landed d60–146; 180d covers the
  unlock window + post-unlock bleed. The vetrel day-clock stall applies to
  BOTH arms (VETREL=1 both) — survival guardrail reads harness days, not
  gameDays (median gameDays 90 vs harness 141 — stall confirmed).
- **Deferral day:** a day on which Game.waveCombatReadiness(4) is evaluated
  and !ready, before firstW4Day (if any). **deferralMargin** = rd.armored − 4
  (demand 4, design call #4) at the LAST deferral day — the armor margin in
  "margin pieces".
- **PRIMARY (binding):** median over qualifying pairs of
  (armed.deferralMargin − control.deferralMargin) **≥ +1.0 piece**.
  Qualifying pair = both runs have a non-null deferralMargin AND neither run
  won (non-winning pairs per the w5reach lesson — the seatdrive stack
  truncates at the win ~d90). A miss is NO-GO, never re-scored.
- **MEASURABILITY FLOOR:** if fewer than 6 of 16 pairs qualify, the PRIMARY
  is UNMEASURABLE — file the all-pairs deferral-margin census as the
  diagnostic and mark the concept SUBSTRATE-STILL-MISSING, not dead.
- **SECONDARY (report-only):** all-pairs median margin delta (incl. winning
  runs); deferral coverage; wave-4 unlock share (contact check); leg
  engagement; wall numbers.
- **GUARDRAILS (kill conditions):** (1) any new death mode on armed
  (cause-canonicalized); (2) median survival (harness days) armed <
  control−10d; (3) wins armed < control wins; (4) §14c co-primary: villager
  (non-scholar) combat deaths armed > control×1.25.
- **Pilot gate:** the 8-seed sweep IS the pilot (§9). No confirm round.
- **§15:** before/after through scripts/balance-panel.js (policies
  armorstock2-lead/belong, 8 seeds, 180d; before = ARMORSTOCK unset, after =
  ARMORSTOCK=1; VETREL=1 + seatdrive default-ON both). The panel covers the
  23-metric contract (guardrails/secondary); the pre-registered deferral
  margin is the judge. Compare .md attached. The contract lacks
  deferral-margin/reserve metrics — the paired margin statistics run in
  scripts/armorstock2-compare.js (same §15-deviation pattern as sim-armorstock,
  recorded here not hidden).
- **Canon boundary (INDIVIDUAL OWNERSHIP — Steve 2026-10-09):** no automatic
  redistribution to a communal armory; recovery and crafting channels only,
  no gifting. The scholar→villager transfer verb needs a Steve ruling —
  out of scope (sim-findings #516).

## The policy (scripts/policies/armorstock.js — rebuilt, then killed)

ARMORSTOCK=1 — the quartermaster protocol, rebuilt faithfully from the
2026-10-17 spec. Five legs through real verbs: RECOVERY (corpseTakeItem per
armor stack off same-node villager corpses, 2/day; trauma/disease/trust costs
engine-automatic), RESERVE (trophy P≥15 pieces counted, never dropped/donated
by the layer), WEAR (equip the reserve's best when it beats the slot),
CRAFT (hide_armor P20 when worn P<20, no trophy held, hide≥2+vine≥1, L1+;
1/day, max 3 blind attempts; Game.craft enforces knowledge gates), SUCCESSION
(narrate the handoff on bearer change, prefer the predecessor's corpse,
wear best immediately).

**Rebuild note (honest):** the 2026-10-17 spec wrote "verbs: lootCorpse" but
the engine has NO Game.lootCorpse method — the real verbs are
corpseTakeItem/corpseLootAll (src/js/corpses.js). The rebuild used the real
verbs (per-item corpseTakeItem for armor stacks, _corpseCheckRange pre-check
per competent.js). The proof pinned the real path; one fixture expectation
was corrected mid-proof (recovery takes all armor P>0 stacks, not just
trophy — the spec's literal "recovers armor").

**The substrate gap (documented, not worked around):** unchanged — no
deliberate scholar→villager armor transfer verb exists, and canon forbids a
communal armory. Armor flows TOWARD the scholar; the protocol keeps it in
circulation instead of letting it sit on corpses.

## Proof (scripts/test-armorstock2-20261018.js)

**32/32 GREEN** (2026-10-18, substrate as pre-registered), then INFO-SKIP
after the kill (see Verdict):
- 12 fixture checks (gate on/off, reservePieces/scholarWornP/
  armorCorpsesAtNode reads, withArmorstock shape, composed ids).
- RED→GREEN: gate-off delegates purely (no as* ctx keys, no verb calls);
  gate-on engages all five legs through the REAL verbs (craft attempts
  hide_armor at L1+materials+need; craft stands down with trophy in pack;
  recovery calls corpseTakeItem per armor stack on a same-node corpse, skips
  other-node corpses; wear equips the reserve best; succession fires +
  narrates on bearer change). The craft and recovery beats were sense-read
  in-fixture ("cut plates from the hide...", "Their armor shouldn't rot with
  them...").
- DET-GATE: withArmorstock(vetrel-composed base) with ARMORSTOCK unset =
  byte-identical day-hash trajectories to the pristine composed base, 8/8
  (4 seeds × {leadseat, belongseat}, 60d, VETREL=1 both sides, seatdrive
  default-ON).
- MARGIN INSTRUMENT: the sweep's deferralMargin (armored − 4) verified
  against the engine's own waveCombatReadiness(4).armored on a live game
  (last deferral armored=2, margin=-2, short=[armor,veterans]).

## Results

32/32 runs, no crashes. Sweep commit 47fbea56. Per-seed JSONs:
evidence/2026-10-18/perseed-armorstock2/. Compare:
evidence/2026-10-18/armorstock2-compare-20261018.md.

**PRIMARY: UNMEASURABLE — the pre-registered measurability floor tripped
(4 < 6 qualifying pairs).** The seatdrive+VETREL substrate wins 23/32 runs
(control 12/16, armed 11/16) — almost always at w3, before the wave-4 gate
resolves — so the non-winning deferral population the primary needs does not
materialize. Qualifying pairs (both deferred, neither won): 4/16 —
leadseat-s5102117, leadseat-s5212219, belongseat-s5102117,
belongseat-s5212219 — per-pair deltas [0, +1, 0, 0], median 0.00.
Per §14 the floor binds: file the census as the diagnostic, mark the concept
SUBSTRATE-STILL-MISSING, not dead. Not re-scored.

**SECONDARY (report-only) — the diagnostic the floor yields:**
- All-pairs median margin delta: **0.00** (n=16). Per-pair deltas:
  [0,+1,0,0,0,0,0,-1, 0,0,0,-1,0,0,+3,+1]. The +3 is the s5762729
  discordant pair (armed village-lost d82, margin read truncated vs
  control's win) — a truncation artifact, not a gain. Margins sit at −4..+1;
  the armor bar is short 1–4 pieces at deferral on both arms.
- Deferral coverage: 16/16 both arms — the instrument works; deferrals
  materialize.
- Wave-4 unlock share (contact check): 1/16 both — s5322321 belongseat
  unlocked on BOTH arms identically (margin 0 both). The substrate IS
  unlock-capable; the layer didn't move the unlock.
- Leg engagement (armed, 16 runs): recovered=18, crafted=2 (tries 2, fails
  0), wore=8, successions=51, recoveryTries=47, reservePeak total=7. The
  legs FIRED — the layer engaged through real verbs — but median reserve
  (end) 0 vs 0 and median scholar worn P (end) 16 vs 16: nothing accumulates.
- Wall numbers: national 0/16 both, table n/a, wins 12 vs 11, wave-4 1 vs 1,
  wave-5 0 vs 0, median survival (harness days) 141 vs 141, village-lost
  1/16 armed (s5762729) vs 0/16 control, starvation 0 vs 0, villager combat
  deaths 401 vs 408.

**GUARDRAILS:**
1. New death modes: none (cause-canonicalized; 'dehydration' 5 = 5 both —
   pre-existing engine label).
2. Median survival: 141 = 141 — HOLD.
3. Wins: armed 11 < control 12 — TRIPS on the letter. Assessed as noise:
   the layer's verbs (corpse loot, craft, equip) don't touch the seat/table
   path; the discordant pair (s5762729) died to wave-1/2/3 combat
   (25 villager combat deaths, 0 starvation), not to layer costs (1 corpse
   loot, 0 craft tries). One seed flip on n=16.
4. §14c co-primary: villager combat deaths 401 vs 408 (armed < control) —
   HOLD.

**§15 panel:** before/after through scripts/balance-panel.js (16 cases each,
both valid, neutrality proofs pass). Compare:
evidence/2026-10-18/armorstock2-panel-compare.md — decision
**review_required**, investigated: the flags (belong win rate −0.125,
national −0.125, community loss +0.125, named-class −0.25) all trace to the
single s5762729 discordant seed; every 95% exploratory interval includes 0;
no_material_signal on 17/23 (lead) and 15/23 (belong) metrics. Not a
regression signal — single-seed combat variance, no layer mechanism. Per §15
this is an investigation note, not a re-score.

## Sense-testing (SENSE-TESTING LAW)

Live armed run (s5102117 leadseat, ARMORSTOCK=1, full transcript): 4
quartermaster beats, all succession handoffs — each reads as a person with a
duty, in context:
- d48: "The mantle passes. Blanca's armor must not sit on a corpse — you go
  to recover it." (follows the Codex "turns a page" beat and the System's
  mantle-transfer announcement; states the concrete next action)
- d74: "The mantle passes. Ethan's armor must not sit on a corpse — you go
  to recover it."
No recovery/craft beats fired on this seed (bounded, opportunity-driven —
honest). The beats never read as ledger lines; they read as the new
scholar's first duty. Fixture sense-reads (proof): "You cut plates from the
hide and lace them with sinew. Hide armor — if your hands remember the
shape." / "Their armor shouldn't rot with them — someone living needs it."

## Village assessment

Thirty-two villages on the seatdrive+VETREL win stack, and the story is the
seat: villages nationalize, get invited, sit, and win — 23/32 — usually at
wave 3, before the wave-4 gate ever resolves (only s5322321 unlocked wave 4,
on both arms identically). The deferral census shows the armor bar short
1–4 pieces at every deferral (margins −4..+1); breadth is there, depth is
not — the same junk-patchwork the armorbreak census found. The quartermaster
worked its route on the armed side (18 armor stacks recovered off corpses,
2 hide_armor crafts, 51 successions re-arming) and the stock still didn't
accumulate: trophy armor is spawn-bound (~2–4 pieces/run) and the margin
never moved (median paired delta 0 on all 16 pairs). The one village that
died on the armed side (s5762729 belongseat, d82) died to the wave-1/2/3
meatgrinder with its armor bar MET (4/4 at end) — the gate's veterans bar
was the lock, and no stockpile fixes that. Who thrived: the seat-takers —
23 wins across both arms. Who died and why: the usual combat toll (~400
villager combat deaths/arm). What was missing: not armor verbs — the layer
fired them — but armor STOCK: there isn't enough trophy armor in the world
for a stockpile to compound, and the seat ends the game before depth matters.

## Findings (for the backlog — NOT chased mid-run)

- [open] 2026-10-18 — substrate — THE SEATDRIVE WIN STACK WINS BEFORE WAVE-4
  RESOLVES (23/32 runs, 20 at w3): any wave-4-margin lever measured on
  non-winning runs starves for population here. Future wave-4 arms on this
  stack should pre-register all-pairs primaries or use the pre-seat
  substrate for the margin read and the win stack only for the win read.
  (sim-armorstock2)
- [open] 2026-10-18 — armor — TROPHY ARMOR IS SPAWN-BOUND AND NON-COMPOUNDING:
  even with active recovery (18 stacks) + crafting (2 hide_armor) + 51
  successions, median reserve stays 0 and the deferral margin never moves.
  The stockpile concept's binding constraint is acquisition, not management
  — ~2.3 trophy pieces/run enter the world and the world doesn't make more.
  (sim-armorstock2)

## Metric review (§14 — binding, never re-scored)

1. **The measurability floor held.** Pre-registering "<6 qualifying pairs →
   UNMEASURABLE" before the sweep is what kept this run honest: with 23/32
   wins, a primary scored on the 4 non-winning pairs would have been noise
   hunting. The floor fired as designed.
2. **The non-winning restriction (w5reach lesson) may be over-strict for
   margin metrics.** The lesson was built for REACH metrics (wave-5 unlocks),
   where win-truncation cuts the observation window. The deferral margin is
   read pre-win — the win doesn't invalidate it. The all-pairs secondary
   (n=16, median delta 0) is arguably the more informative read, and it
   agrees with the primary's direction (no movement). Proposed for the NEXT
   run: pre-register the primary on all deferred pairs; keep the
   non-winning cut as the sensitivity read. Not applied here — the run is
   judged on its header.
3. **The wins guardrail (armed < control → kill) is noise-fragile on n=16.**
   One seed flip trips it. The mechanism audit (no win-path verbs in the
   layer) is the honest assessment, recorded above. Future headers should
   use a margin (e.g. armed < control−2) for win guardrails on small n.
4. **Deferral days as a population are fine; the seat is the confound.**
   Deferral coverage was 16/16 — the instrument works. What's missing is
   not deferrals but NON-WINNING deferrals. The retry's substrate choice
   (seatdrive win stack) traded the pre-seat substrate's zero-unlock
   problem for a win-truncation problem. Neither substrate stages the
   primary's population cleanly.

## Verdict

**SUBSTRATE-STILL-MISSING (pre-registered floor: 4 < 6 qualifying pairs),
not concept-dead — but the diagnostic is informative.** The layer engaged
through real verbs on all 16 runs and the all-pairs deferral margin still
didn't move (median delta 0.00, margins −4..+1 both arms). The durable-
stockpile concept's binding constraint looks like acquisition, not
management — but per §14 the run is judged on its header, and the header
says UNMEASURABLE. The layer is deleted zero-trace per the kill protocol
(the 2026-10-17 precedent for SUBSTRATE-MISSING); proof INFO-SKIPs
honestly; instruments + evidence + the spec remain for any future rebuild.

## Convergence

**substrate-still-missing.** Axis scale-onramp: still the wall — national
0/16, table 0/16 on this substrate (the wins are lesser-seat walks at w3;
wave-4 1/16). The armor side of #427 remains unmoved: the margin doesn't
respond to stockpile management because there is no stock to pile.

## Files

- scripts/policies/armorstock.js — the rebuilt ARMORSTOCK=1 quartermaster protocol (DELETED zero-trace per kill protocol; spec above is the durable artifact)
- scripts/test-armorstock2-20261018.js — proof: 32/32 GREEN pre-kill, now INFO-SKIPs honestly
- scripts/sweep-armorstock2-20261018.js — the 32-run sweep (this run)
- scripts/sense-armorstock2-20261018.js — beat-capture sense instrument (this run)
- scripts/armorstock2-compare.js — paired §15-deviation compare (this run)
- evidence/2026-10-18/sim-armorstock2.md — this file
- evidence/2026-10-18/perseed-armorstock2/ — 32 per-seed JSONs
- evidence/2026-10-18/armorstock2-sweep-summary-20261018.json — aggregate summary
- evidence/2026-10-18/armorstock2-sweep.log — sweep console log
- evidence/2026-10-18/armorstock2-compare-20261018.md — paired compare
- evidence/2026-10-18/armorstock2-panel-before.json.gz — §15 panel, control (ARMORSTOCK unset)
- evidence/2026-10-18/armorstock2-panel-after.json.gz — §15 panel, armed (ARMORSTOCK=1)
- evidence/2026-10-18/armorstock2-panel-compare.md — §15 panel compare (review_required, investigated)
- evidence/2026-10-18/armorstock2-panel-compare.json — §15 panel compare (machine-readable)
- evidence/2026-10-18/panel-before.log, panel-after.log — panel run logs
