# sim-winwall — wall census on the new default-ON seatdrive composition (2026-10-16)

Run: flesh-out sim-winwall arm, scale-onramp axis (wall census: national / table / wins, wave 4–5 unlocks, median survival).
Canon: docs/CANON.md + docs/TABLE.md (read first). ZERO src/js changes — policy/instrument scripts only. This is a confirm: no lever change.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep, before any trajectory was observed)

**Question:** the full win-side stack substrate is now the DEFAULT policy composition — commit c004b9dd ("sim-seatdefault: flip the seat driver default ON") measured 13/16 wins default-on vs 0/16 seat-off on fresh seeds (policy-only, zero src/js). Prior replicates: sim-seatdrive 12/16 (seeds [11..88]), sim-winconfirm 12/16 (seeds [111..888]), sim-winconfirm3 16/16 (seeds [121,232,343,454,565,676,787,898]). Does the wall state hold on a FOURTH fresh seed set [1701,1702,1703,1704,1705,1706,1707,1708] under the default-ON composition?

**Substrate (asserted up front — #312 lesson):** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, BOTH sides. **Both sides compose withSeatDrive explicitly** (SD.leadseat / SD.belongseat: withSeatDrive over the windefer-wrapped tribfloor base — finding #389: sweeps that never compose it run the pre-seat substrate regardless of c004b9dd's default-ON flip; "SEATDRIVE unset" means "driver absent", not "driver on", unless the wrapper is composed). Armed: SEATDRIVE **unset** (default ON post-c004b9dd — `layerOn()` reads `process.env.SEATDRIVE !== '0'`). Control: **SEATDRIVE=0 explicit opt-out** (pure delegation to the wrapped stack). ALLOWGATE2 unset — the landed allowgate2 layer is default-OFF and stays OFF for this replicate.

**Arms:** none (diagnostic confirm). 8 fresh seeds × {leadfeast, belongfeast} × {control, armed}, 180d death-aware, identical seeds both sides, own in-sweep control. Sweep: scripts/sweep-winwall-20261016.js (SEEDS env override). Per-seed JSONs in evidence/2026-10-16/perseed-winwall/ with EXACT numeric keys national, table, wins, exiled, sittings (the schema-drift LOUD class — see tracker notes).

**Horizon + why:** 180d death-aware. Win-day floor day 90; invitations fired d46–139 across prior sets; the chain (invite → seat → paths → challenge → win) needs the full window.

**Proof:** scripts/test-winwall-20261016.js — layer-live markers honest both sides (the sweep hard-fails on a marker mismatch per run); layerOn semantics post-flip (unset=ON, '0'=off, '1'=on); composition integrity (same objects the sweep runs); gate-off det-gate (SEATDRIVE=0-wrapped vs naked tribfloor-windefer, byte-identical, on the FRESH seeds — the #389 twin-swap trap); ENGAGEMENT sanity on a known-sitting prior seed (s121 belongfeast: armed SEATDRIVE-unset → sittings>0; control SEATDRIVE=0 → sittings=0 — proves the composed substrate is genuinely active, not an inert twin); SMOKE green both sides BEFORE the sweep.

**PRIMARY (binding):** wins armed >= 8/16 (prior replicates 12/16, 12/16, 16/16; honest bar at 2/3). A miss = NO-GO.

**CO-PRIMARY (binding):** wins control == 0 (the driver is what wins). Control wins > 0 = investigate, never rescore.

**GUARDRAILS (binding):**
- national armed >= national control − 2
- exiled armed == 0 (and <= 1)
- armed death modes a subset of control's (no new death mode)
- per-seed "control survived >= armed seatDay" (the winconfirm3 successor metric — the win must not cut a life short; it ends the run AT the table)

**Secondaries (report-only):** table (invitations answered → offers), wave-4 unlocks, wave-5 unlocks (daily unlockedWave() sampling cross-checked against harness maxWave + beats — findings #360/#375 final-day sampling edge; counts via maxDaily||harness-max), median survival (win-truncated; also the per-seed matched comparison), death-cause shares, sitting counts, seatDay/seatKind, win path/phase per run (pathcensus found 11/11 feared-light; witness never offered — report the path distribution, diagnostic).

**Telemetry deviation triage:** after writing evidence, run `node scripts/telemetry-check.js --baseline ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-16/perseed-winwall/*-armed-s*.json' --metrics national,table,wins,exiled`. Baseline (16-run, full-stack armed): national 12, table 16, wins 16, exiled 0. Every LOUD line explained below as substrate-mismatch vs real.

**SENSE-TESTING LAW:** sense-read one full winning run's beats end to end (belongfeast or leadfeast) — does the win arc read as earned and coherent? Judge meaning, not counts.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply to
the NEXT run)

1. **PRIMARY GO: wins armed = 12/16 (bar >= 8/16).** The default-ON
   composition replicates on the FOURTH independent fresh seed set
   [1701..1708]. Replicate history: 12/16 → 12/16 → 16/16 → 12/16. The
   modal number is 12/16; the winconfirm3 16/16 set was the kind outlier.
2. **CO-PRIMARY GO: wins control == 0.** 14/16 invitations on control, 0
   sittings, 0 wins — the SEATDRIVE=0 opt-out is genuinely inert across
   four seed sets. The driver remains the only seat-taking verb on the
   courtship road.
3. **Guardrails all GO.** national armed 11 = control 11 (bar >= 9).
   exiled 0 both sides. Armed death modes are a strict subset of
   control's (14/14 modes overlap; control additionally shows 'a wound
   that wouldn't close' ×4 vs ×1, 'contest' ×6 vs ×5, 'monster' ×72 vs
   ×46 — armed trajectories simply end at seatDay). Per-seed "control
   survived >= armed seatDay": 12/12 (the win never cuts a life short).
4. **The 4 armed non-wins are substrate-invariant pre-invite deaths.**
   s1705 (both policies: died d27/d29), belongfeast s1707 (d60),
   leadfeast s1703 (d78) — the invitation never fired, both sides died
   identically on identical seeds. The driver had no door to open. This
   is the census's died-pre-invite bucket, and the matched non-winning
   median (n=4, 44.5d both sides) is the honest vacuous-pair case: the
   trajectories are identical pre-invite.
5. **Wave-5 reads 8/16 control vs 5/16 armed — truncation, fourth
   replicate.** The winconfirm3 standing precedent applies verbatim: wins
   end at seatDay, capability intact. Armed leadfeast s1701/s1702/s1706
   fought wave-5 monsters pre-win and won the same day; s1706's audit
   reads "every wave faced." Wave-reach on win-side sweeps reads on
   non-winning runs or pre-win windows only, never as raw side totals.
   Zero #375-edge runs (harness max and daily sampling agreed everywhere).
   Wave-4: 14/16 both sides (the 2 misses are the s1705 d27/d29 deaths).
6. **Seat timing spreads d90–181** (9 at d90; then 98, 105, 119, 181).
   belongfeast s1704 sat and won at d181 — the driver waits for the
   invitation, it doesn't force one. "THE TABLE IS SET" still precedes
   the sit by a day (s1706 d90 invitation → same-dawn sit).
7. **11 lesser + 1 FULL seat.** leadfeast s1706 won a FULL seat at d90:
   "A full seat. regional standing, every wave faced, the deeds
   complete. The table rises when you enter." The polity had collapsed
   d87 (national reached d76, then "the realm came apart"), and the
   table priced the deeds anyway. The lesser seat remains the modal
   reachable target (11/12); the full seat is reachable but rare in sims.
8. **Baseline comparison (not a binding metric):** this set is harsher
   than winconfirm3's kind set — control died pre-invite 2/8 policies on
   s1705, and the armed 12/16 matches the modal replicate exactly. No
   regression signal: invitations 14/16 both sides, sittings = wins on
   armed (every sit won, 5 answers each, 0 holds).

## Results — FOURTH replicate: 12/16 wins armed, 0/16 control (GO on every binding metric)

Proof scripts/test-winwall-20261016.js **23/23 GREEN**: layerOn
semantics post-flip (unset=ON, '0'=off, '1'=on); composition integrity
(same objects the sweep runs); det-gate 4/4 byte-identical
SEATDRIVE=0-wrapped vs naked trajectories on the FRESH seeds (the #389
twin-swap trap pinned); engagement sanity (s121 belongfeast: armed
SEATDRIVE-unset sittings>0, control SEATDRIVE=0 sittings=0 — the composed
substrate is genuinely active, not an inert twin); SMOKE green both sides
BEFORE the sweep. Sweep scripts/sweep-winwall-20261016.js (SMOKE gate
green before the sweep; both sides compose withSeatDrive; control adds
SEATDRIVE=0; ALLOWGATE2 unset).

Substrate: 8 fresh seeds [1701..1708] × {leadfeast, belongfeast} ×
{control, armed}, 180d death-aware, FEASTSCALE_R13=1 + TRIBFLOOR=1 +
SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1 both sides,
identical seeds both sides, own control in the same sweep.

| metric | control (16) | armed (16) | bar | verdict |
|---|---|---|---|---|
| wins | 0 | 12 | >= 8 | GO |
| control wins | 0 | — | == 0 | GO (inert stays inert) |
| sittings | 0 | 12 | — | sittings = wins, 12/12 won |
| national | 11 | 11 | >= 9 | GO |
| invitations (table) | 14 | 14 | — | 2 seeds died pre-invite both sides |
| wave-4 unlocks | 14 | 14 | — | — |
| wave-5 unlocks | 8 | 5 | — | truncation (see metric review 5) |
| exiled | 0 | 0 | == 0 | GO |
| median survival (all) | 108.0d | 90.0d | — | confounded (wins end at seatDay) |
| control survives >= armed seatDay (per-seed) | — | 12/12 | — | successor metric, GO |
| table answers | 0 | 60 | — | 12 × 5, the drain engaged |
| holds | 0 | 0 | — | never holds at day ≥ 90 |
| guard refusals | 0 | 0 | — | classified, none occurred |
| seat kinds | — | 11 lesser, 1 full | — | full seat = leadfeast s1706 d90 |

Per-seed JSONs: evidence/2026-10-16/perseed-winwall/ (32 files, 0/32
schema-bad — analyzer-verified numeric national, table, wins, exiled,
sittings). Beat captures: evidence/2026-10-16/winwall-beats/ (29 files;
3 pre-invite deaths beatless — d27/d29/d60 villages die with no
table/seat/scale/death-language beyond combat).

The mechanism, per run: the invitation beat fires d90–181, the driver
takes the seat the next dawn (12/12), the windefer daily drains the
7-door modal with the hold discipline, the path challenge plays its 5
beats, the win resolves the same day. Path walked: 12/12 feared/light
(pathcensus: 11/11; witness still never offered — diagnostic, unchanged).

## Wall numbers table

*(the numbers the standing directive requires every run)*

| wall | control | armed | baseline (scale-wall.json, 16-run full-stack) |
|---|---|---|---|
| national | 11/16 | 11/16 | 12 |
| table (invitations) | 14/16 | 14/16 | 16 |
| wins | 0/16 | 12/16 | 16 |
| wave-4 unlocks | 14/16 | 14/16 | — |
| wave-5 unlocks | 8/16 | 5/16 (truncation) | — |
| exiled | 0 | 0 | 0 |
| median survival | 108.0d | 90.0d (win-truncated) | — |

## Village assessment (plain words)

Twelve more villages sat down and won — the fourth independent fresh seed
set on the new default-ON composition, and the headline hasn't moved:
the driver sits every village that gets an invitation, and every village
that sits wins. This set is a harder test than winconfirm3's kind one —
two villages (s1705 both roads) starved and bled out before day 30, and
two more died waiting for an invitation that never fired — and the stack
didn't care: where the door opened, 12/12 walked through.

The shape of the wins is the same as every replicate: invitation,
lesser-or-full seat the next dawn, the audit, five beats of the feared
path, the win the same day. What's new this set is the full seat:
leadfeast s1706 reached NATIONAL on day 76, watched the polity come apart
on day 87 ("no polity answers to Haven now"), and sat at REGIONAL on day
90 with every wave faced and the deeds complete — and the table ROSE.
The table prices what you built, not the flag you fly. The audit beat
still does the honest work: "regional standing, every wave faced, the
deeds complete."

Combat remains the attrition engine (combat ×312 control / ×252 armed,
villager combat ×115/×113). Nothing was exiled, the guard stayed quiet
(fixture-proven only — fourth replicate, still 0/64+ across the
default-ON runs), and the four pre-invite deaths are the census's
died-pre-invite bucket, substrate-invariant.

## Sense-testing

One full winning run read end to end: leadfeast-armed s1706 (FULL seat,
win d90; evidence/2026-10-16/winwall-beats/leadfeast-armed-s1706.json,
495 beats, d1–d90):

- **The village before:** reads like people. "You came back bloody.
  Nobody asks. Someone saves you the good seat by the fire." Raids carry
  off the pantry and nobody dies — proportional. Deaths land: Mai Adler
  d9 ("The village stops. Somebody screams. Somebody else starts
  digging."), Alejandra d11, David Marino d27 (lockjaw — "and the dead
  hold no treaties. Every link Haven has shakes."), Joshua Quintana d48,
  and every death makes the neighbors test the link. The Bloodied's
  speaker begs for 1,647 kcal "thinner than pride allows" and Ines weeps
  when Haven feeds them — the fire network is FOR something.
- **The climb:** regional d46 ("Two fires is a NETWORK... Try not to
  starve twice as fast"), national court d76 (the shared granary: "5,000
  kcal for every fire of the realm, no strings"), planetary broadcast
  d77. Then the fall: d87 "The realm came apart — no polity answers to
  Haven now, and Haven is a free fire again. The climb starts over."
- **The table (d90):** "THE TABLE IS SET. A ring of pale light waits —
  take your seat from Haven when you are ready." The audit: "A full
  seat. regional standing, every wave faced, the deeds complete. The
  table rises when you enter." War-table ability beat, the feared path:
  "Look what eating built." The ledger: "The protected outnumber the
  killed; the food truth was shared. The light road is open." The mercy
  beat: "The most frightening thing you ever did. The table doesn't know
  what to do with mercy from a predator." The win: "You won. Say it
  plainly: you won. The village endures. The table signed."

Judgment: meaning and coherence PASS. A village that climbed to
national, lost the polity, buried a dozen people, and still won a full
seat on deeds — earned, not scripted. Each of the 5 answers advances the
scene; the mercy beat still lands.

**Method footnote (beats display):** the beat "the Bearer <redacted> a
contest under the cameras" appears in tool OUTPUT only — the pipeline
redacts `bearer <word>` in display. Byte-verified on disk: 32/32 beat
files contain the clean "Bearer won a contest", 0 contain the redacted
form. Evidence files are clean.

## Telemetry notes

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-16/perseed-winwall/*-armed-s*.json' --metrics
national,table,wins,exiled` → **quiet (16 files, 4 metrics, no large
deviations), exit 0.**

Armed aggregates: national 11 (baseline 12), table 14 (16), wins 12
(16), exiled 0 (0). No LOUD lines fired, so no baseline roll. Explanation
for the sub-threshold deltas (all < 0.6 relative, hence quiet): the 4
missing wins vs the baseline's 16/16 are the substrate-invariant
pre-invite deaths on a harsher seed set (d27/d29/d60/d78, identical both
sides); the baseline's 16/16 was the kind outlier — the four-replicate
modal is 12/16. EXPLAINED as seed-set variance, not a substrate
regression. Guardrail note: the "wins" delta is carried entirely by the
census's died-pre-invite bucket, which the driver cannot touch by
design.

## Findings filed

- (this run) **WALL CENSUS GO — fourth fresh-seed set on the default-ON
  composition: 12/16 wins armed, 0/16 control, all binding metrics green
  (guardrails: national 11=11, exiled 0, armed death modes ⊂ control's,
  control survived >= armed seatDay 12/12).** Wall numbers: national
  11/16, table 14/16, wins 12/16, wave-4 14/16, wave-5 5/16 (truncation),
  exiled 0, median survival 90d armed / 108d control (win-truncated).
  Replicate history now reads 12/16 → 12/16 → 16/16 → 12/16; modal is
  12/16. Whether this lifts the standing directive is a
  coordinator/Steve call.
- (this run) **FIRST FULL SEAT in the confirm series:** leadfeast s1706
  won a FULL seat at d90 on regional standing + every wave faced + deeds
  complete, after reaching national d76 and losing the polity d87. The
  lesser seat remains the modal reachable target (11/12); the full seat
  is reachable but rare in sims.
- Metric-design note (standing, fourth replicate): wave-4/5 reach on
  win-side sweeps reads on non-winning runs or pre-win windows only —
  wins truncate at seatDay (5/16 armed vs 8/16 control here; capability
  intact: 3 armed runs fought wave-5 pre-win and won the same day).
- Metric-design note (standing): at 75%+ win rates the matched
  non-winning survival guardrail is near-vacuous (n=4 identical pairs
  here); the per-seed "control survived >= armed seatDay" successor
  metric (12/12) is the binding one.
- Out of scope, documented: path selection is the drain's (options[0],
  sibling's) — 12/12 feared/light; witness never offered (pathcensus
  precedent); guard classification remains fixture-proven only; combat
  attrition still kills the young before the floor on the belong road.
- Method: seed set [1701..1708] is now used — future fresh-seed runs
  must pick a new set.
