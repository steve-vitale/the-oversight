# sim-vetwindow — "the window restraint" PILOT (axis scale-onramp)

Run fleshout-20261022T1215Z, arm sim-vetwindow. Worker tree sim-vetwindow,
base 2a3fc56b (= master at run start).

The question (the named next of the post-veterans window): the 1015Z run
proved companions can manufacture wave-4 kills (armorydrive: 8 villager
wave-4 kills vs 0 control, CONDITIONAL GO) and the wave-5 door OPENS — but
the bar fills (w5vets2=2) and the veterans die before/around the door.
Can policy-side window-survival support keep the veteran-makers alive
from bar-fill until the door opens?

Substrate: the non-seat long substrate
(FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1
ARMORYDRIVE=1; control = armorydrive stack, VETWINDOW unset; vetwindow =
the restraint OUTSIDE the same stack, VETWINDOW=1). Canon: docs/CANON.md +
docs/MONSTER-WAVES.md (wave-4 = The Mirror Draft; the readiness gate's
VETERANS bar = 2 living roster members with wave-4+ kills; VILLAGER XP
LAW). No canon doc covers armor/equipment — stated, not invented.

## Seed verification (recorded per brief)

Pilot seeds 65541–65548: filename scan across evidence/ + scripts/ on
master — 0 hits for all 8 (fresh). The brief's note on substring-grep
collisions observed and avoided.

## PRE-REGISTRATION (§14 binding — written BEFORE the pilot)

- PRIMARY: wave-5 windows OPENED among seeds that reached w5vets2=2,
  vetwindow vs control on IDENTICAL seeds. GO = vetwindow ≥ control+2 AND
  ≥2/8 vetwindow seeds with a window opened (a seed counts if EITHER
  policy config opens it). A miss is NO-GO, never re-scored.
- GUARDRAILS (all binding):
  - villager wave-4 kills not depressed vs control (paired per-seed);
  - villager death-cause share not lopsided new (no new death mode ≥2
    events vetwindow, 0 control);
  - wins not depressed vs control;
  - median survival (matched per-seed): |vetwindow − control| ≤ 10d;
  - starvation deaths per-100d paired (the confirm's metric-review
    revision): vetwindow ≤ control + 2/100d.
- MECHANISM (diagnostic): restraint counters (vwWindowDays,
  vwRestrainedFights, vwFlees) — if the primary GOes without restraint
  movement, record as luck.
- Instruments: killdisc v2 + w5 readiness census + kill-time bearer
  census + vetwindow counters. Before/after through
  scripts/balance-panel.js per §15 — the panel is the instrument, this
  header is the judge.
- PILOT: 8 fresh seeds 65541–65548 × {leadfeast, belongfeast} × {control,
  vetwindow} = 32 runs, 180d death-aware. Confirm (12–16 fresh seeds)
  ONLY if pilot GO.

## Proof gates — GREEN before the sweep (27/27 PASS, 0 FAIL)

scripts/test-vetwindow-20261022.js on base 2a3fc56b with the pinned env:
E0 shape; E1 VETWINDOW-off byte-identical det-gates (2 seeds × 60d);
E2 env-gate; E3 synthetic RED→GREEN (window-live fixtures incl.
fail-closed on read error; vwFightWave 4/3/0/fled-ignored; restraint
FIRES on wave-4 with barrier push + base not called; wave-3 delegates;
gate-off = zero counters); E4 180d VETWINDOW=1 run + D2 deterministic
re-run; E5 mechanism smoke (honest counters). Composition honesty holds.

## PHASE 1 — DIAG (mechanism first)

Replayed the 4 armed confirm configs that reached w5vets2=2 (seeds
65471–65486 band, armorydrive, non-seat substrate — a DIAG replay, not
fresh seeds) with a window-tracing instrument (daily readiness census +
veteran death rows + Game.say capture). Script:
scripts/diag-vetwindow-20261022.js; timelines:
evidence/2026-10-22/diag-vetwindow.json.

Macro pins held 4/4 (days/maxWave/w5vetsMax identical to the confirm
corpus); kill-list drift on 2/4 configs (s65478 +2 kills, s65475 +1)
— the base moved since the confirm anchor (783783e9e → 2a3fc56b;
game-code changes in convo-wants.js/table.js legitimately shift RNG
draws). Drift reported, not hidden.

### The window timelines

- s65477-leadfeast: bar filled d127 (Nadia + Mai, one Strike fight). Door
  NEVER opened. Window d127–147 (20 days): the ONLY short bar the whole
  window was **armor**. Veterans held at 2 throughout — then BOTH died
  d147 in ONE fight: a RERUN ×6 Suburb (+150% HP/+72% dmg) followed by a
  RERUN ×6 Audit. Mai was the scholar; the mantle passed to Nadia
  mid-fight; Nadia died too; mantle to Saleh. Village lost d148.
- s65477-belongfeast: bar filled d107 (Saleh d98 Influencer + Shuting d107
  Congregation/Suburb). Door NEVER opened. Short bars: **armor**
  throughout. Saleh died d115 (as scholar, RERUN ×1 Reunion — "Your own
  move, returned hits you for 42"), Shuting died d123 (as scholar,
  RERUN ×2 Reunion). Mantle chain Saleh→Shuting→Sanne. Village lost d126.
- s65478-leadfeast: bar filled d93 (Ethan d86 Eater + Giulia d93 Audit),
  door opened d93 (window=0 — armor was transiently satisfied). Ethan died
  d107 (as scholar — fought a lingering Eulogy TWICE, d107+d108, with a
  stone knife), Giulia d138 (RERUN ×1), Kira d150 (d135 Network Note
  kill). Village lost d180.
- s65475-belongfeast (positive control): bar filled d136 (Sigrun d110
  Algorithm + Assunta d136 Congregation), door opened d136, SURVIVED
  180d. Assunta died d161 combat; the village held.

### The named surface

1. ZERO sortie deaths across the corpus (the base policy never sorties;
   "endure" is the honest default and it holds). The channel is the
   scholar's party engaging wave-4+ monsters in the world — "You're on
   your own" fights and threats encounters, often RERUN-overtime-scaled.
2. Post-fill wave-4 kills buy ZERO veteran-bar progress (the bar is
   filled; armorydrive's staging stands down on the same logic) — the
   fights are pure risk against the window.
3. The mantle promotes veterans to scholar, then the scholar leads the
   next wave-4 party (3/4 runs show the chain).
4. Overtime escalates while the seat is untaken (×1 ~d112, ×2 ~d119,
   ×3 ~d126): the window races a clock.
5. **Caveat (documented, not hidden):** in the two never-opened runs the
   door was blocked SOLELY on **armor** — and no armor verbs exist
   policy-side (finding #646). The restraint cannot fill the armor bar;
   it holds the veterans-bar leg of the conjunction (and preserves
   armor-wearers from the #735 bleed) while the village waits for armor.
   Whether that opens more doors is what the pilot measures.

SURFACE NAMED: engagement restraint during the window — disengage from
wave-4+ fights at the first opportunity while the bar is filled and the
door is shut. Proceeding to PHASE 2 (not killed at DIAG).

### Sense pass (SENSE-TESTING LAW)

Read the d145–148 (s65477-lead), d110–126 (s65477-bel), d104–140
(s65478-lead) narration windows. SENSE-PASS with notes:
- Villagers read as people: Nadia ("There's two of them. We can't do
  this scattered — we need a real team. A named one. People fight harder
  for a name."), Shuting ("No one's going hungry this week. Sitting with
  the fever cases instead — someone should."), Giulia ("Do you think
  they're watching right now? The... audience?").
- Deaths land with consequences: the mantle transfer ("You wake up
  somebody else."), the village speaking for the successor, links
  shaking, tributes pressed down. Grief is mechanical AND social.
- The fights are engine-honest: the Eulogy's verses tick down with real
  effects, the Reunion reflects "your own move", the Suburb's attention
  "SNAPS" by proximity. No staged props.
- Note: the scholar fought the d107 Eulogy with a stone knife while the
  Phase blade existed in the run's future (d135) — gear progression is
  lumpy, not a clean curve. Not a bug; recorded.

## PHASE 2 — the restraint (policy)

scripts/policies/vetwindow.js (VETWINDOW=1, default OFF, zero src/js):
while the window is live (AD.w5VetBarMet() AND unlockedWave() < 5), the
`fight` wrapper disengages from wave-4+ TB fights at the first
opportunity — immediate directional flee via the exported chooseFleeDir
+ tbBarrierExit (the competent.js directional-flee shape), not the
assessment-threshold flee. Best-effort, never immunity: sealed fights
hold (the engine says so), chasers follow honestly, haven defense is
never abandoned (chooseFleeDir holds at haven → base fights). Composes
OUTSIDE the armorydrive stack: the drive fills the bar, this layer keeps
it filled. Counters: vwWindowDays, vwRestrainedFights, vwFlees,
vwFleeWalks, vwFleeHeld, vwFleeFallback (counts only).

## Pilot results (32/32 configs complete)

Per-seed JSONs → evidence/2026-10-22/perseed-vetwindow/.

PRIMARY (binding): wave-5 windows OPENED among seeds reaching w5vets2=2:
- control: 0/16 configs reached w5vets2=2 → 0/8 seeds with a window opened
- vetwindow: 0/16 configs reached w5vets2=2 → 0/8 seeds with a window opened
- Restraint counters: all zero — the window never went live on any pilot
  seed, so the restraint never fired in the wild. (Expected: VETWINDOW=1
  with no live window is byte-identical to control per the E1 det-gate;
  the identical trajectories confirm it.)
GO bar (vetwindow ≥ control+2 AND ≥2/8): MISS → **NO-GO (§14)**.

GUARDRAILS (binding — all hold on identical trajectories, reported):
- villager wave-4 kills: control 9, vetwindow 9 (7 villager-kill configs
  each) — not depressed ✓
- death-cause shares: byte-identical (no new mode) ✓
- wins: 0 vs 0 — not depressed ✓
- median survival: 124.0d vs 124.0d ✓
- starvation: 3 vs 3 ✓
- national 8/16 vs 8/16; table 15/16 vs 15/16.

Wall numbers (pilot corpus): national 16/32, table 30/32, wins 0/32,
wave4 30/32, wave5 0/32, w5vets2 0/32, median 124d.

## Verdict

**NO-GO at pilot — primary unmeasurable.** Zero of 16 configs per arm
reached w5vets2=2 (confirm rate was 4/32; P(0/16 | p=0.125) ≈ 0.11 —
seed luck, not a lever signal). The restraint never fired in the wild,
so this pilot tested nothing about the restraint itself.

Per kill discipline (Steve 2026-10-21): this is NOT a "wrong lever"
kill — it's a no-data outcome. The restraint is proven correct (proof
GREEN, E3c fires on synthetic wave-4 fights) but untested in the wild.
The lever stands; the test was underpowered for the bar-fill rarity.

No confirm (pre-registered: confirm ONLY on pilot GO).

## Metric review (§14)

1. The primary as written needs bar-filled seeds to exist. The bar-fill
   is rare (~12% of configs: 2 living wave-4 killers simultaneously on
   one seed). NEXT run options: (a) bigger seed budget (16+ seeds/arm);
   (b) pre-screen seeds for bar-fill on the armorydrive stack, then A/B
   the restraint on bar-filled seeds only; (c) the DIAG-seed mechanism
   probe below.
2. Consider a mechanism-primary for the restraint: veteran survival days
   post-bar-fill (vetDeaths delay), not just doors opened — the
   restraint's direct effect is survival; the door is a conjunction.
3. The armor-blocker caveat stands: in never-opened runs the door waits
   SOLELY on armor (no policy verbs). A restraint-only lever can hold the
   conjunction but not fill it — the primary should be read with that
   ceiling in mind.

## Post-pilot mechanism probe (NOT pre-registered — diagnostic only)

The pilot couldn't test the restraint (no windows). The 4 DIAG seeds
(65477/65478/65475) are KNOWN window seeds. Running control vs vetwindow
on identical DIAG seeds to measure the restraint's direct effect
(veteran survival, door opening). This does NOT re-score the pilot —
the pilot verdict above stands.

## Probe results (COMPLETE — 12/12 configs, anchor 2a3fc56b, run 1515Z adoption)

Set: 3 DIAG seeds (65477/65478/65475) × {leadfeast, belongfeast} ×
{control, vetwindow} = 12 configs, 180d death-aware, same non-seat
substrate + VETWINDOW=1 for the arm. Per-seed JSONs →
evidence/2026-10-22/perseed-vetwindow-probe/ (10 from the 1215Z run +
the 2 missing s65475 vetwindow runs completed by the adoption worker —
identical sweep env).

| seed × config | control (days / w5vetsMax / wave5 / combatD) | vetwindow (days / w5vetsMax / wave5 / combatD) | restraint counters |
|---|---|---|---|
| 65477 lead | 148 / 2 / 0 / 41, village-lost d148 | 148 / 2 / 0 / 41, village-lost d148 | vwWindowDays 20, vwRestrainedFights 10, vwFleeHeld 10, vwFleeFallback 10, vwFlees 0, vwFleeWalks 0 |
| 65477 bel | 126 / 2 / 0 / 30, village-lost d126 | 126 / 2 / 0 / 30, village-lost d126 | vwWindowDays 8, vwRestrainedFights 14, vwFleeHeld 14, vwFleeFallback 14, vwFlees 0, vwFleeWalks 0 |
| 65478 lead | 180 / 2 / 1 / 63, village-lost d180 | 180 / 2 / 1 / 63, village-lost d180 | {} (bar never reached 2; window never live) |
| 65478 bel | 169 / 1 / 0 / 35, village-lost d169 | 169 / 1 / 0 / 35, village-lost d169 | {} (bar never reached 2) |
| 65475 lead | 103 / 1 / 0 / 30, village-lost d103 | 103 / 1 / 0 / 30, village-lost d103 | {} (bar never reached 2) |
| 65475 bel | 180 / 2 / 1 / 49, survived 180d | 180 / 2 / 1 / 49, survived 180d | {} (door opened the day the bar filled — window never live) |

Death-cause mixes byte-identical per pair; starvation deaths 0/0 vs 0/0
(lead 65477), 0 vs 0 (bel 65477); wins 0 vs 0 everywhere.

### Verdict (diagnostic — does NOT re-score the pilot §14)

**MECHANISM FIRED-BUT-HELD — no signal on the direct effect.** The
restraint's recognition works in the wild: on the two s65477 configs it
registered a live window (20 and 8 days) and restrained 24 wave-4+
fights. But it executed ZERO disengagements — every restrained fight
fell through to the base handler (vwFleeHeld = vwRestrainedFights =
vwFleeFallback on both configs). Why: all window-live wave-4+ fights on
these seeds happened at Haven's door, and `chooseFleeDir` returns null
at haven BY DESIGN (haven defense is never abandoned — vetwindow.js
calls it out). So the fallback path fought them exactly as control did:
survival days, combat-death counts, and death-cause mixes are
byte-identical per pair. The d147-style double-death was NOT delayed;
the veterans died at the same days.

**The probe surfaced a mechanism mismatch, not a wrong lever.** The
DIAG's channel assumption was "the scholar's party engaging wave-4+
monsters in the world" (flee-able). On the probe seeds, the window's
wave-4+ fights all arrived as haven assaults (the RERUN-overtime siege
coming to the door — incl. the five-monster d129 rush). The restraint's
own design refuses to flee haven fights, so on exactly these seeds its
fireable surface was empty. The direct effect (veteran survival
post-bar-fill) is therefore still unmeasured — the mechanism is
proven-correct-but-inert-here, same class as the pilot's NO-DATA
outcome.

### Sense read (SENSE-TESTING LAW — fresh capture, s65477-leadfeast
control, narration d124–132, bar-fill d127)

The bar-fill lands as a televised beat, not a village realization:
SYSTEM: "Oh — OH. Everybody saw that, right? Nadia just put down The
Strike... on CAMERA. That's a veteran kill, folks. REMEMBER the name."
(RERUN ×5 The Strike, on her own, post-demand-list.) The village does
not mark the window — it endures it: a five-monster door rush d129
(Paparazzo, Mountain Lord, Ugly Beast, Big Beast, Highbeam Deer),
Viktoria meeting them at the door; lingering gorgers draining
3,400+ kcal off the treeline; a STARVING spiral starting d132 while
Sofia rests a hand on the pantry door — "No one's going hungry this
week. Sitting with the fever cases instead — someone should." Nobody
knows the wave-5 door is waiting on armor; nobody acts on the window.
Villagers read as people throughout: Nadia patches you up ("Hold
still!"), Naran's kid asks if the watchers have favorites, a
Thornfield trader brings 2,526 kcal "no tribute, no ceremony," Saleh
unshoulders a full pack to haul water instead. The fights are
engine-honest; the grief (Daniel's codex entry finishing itself —
"Daniel is dead. You didn't ask. It knew") lands.

### Metric-review notes for the next run

1. To exercise the restraint's disengagement, the next run needs window
   seeds where wave-4+ fights meet the scholar's PARTY IN THE WORLD —
   the probe seeds delivered only haven assaults. Alternatively,
   re-frame the instrument: the d147-style killer is the haven siege
   itself, which the restraint must not flee — veteran survival there
   wants the readiness hold beat's actual ask (armor the village,
   #646 armor verbs), not flee-once discipline.
2. Consider per-config veteran death-day rows in the next probe
   instrument (the DIAG had them; the sweep's w5censusDays alone can't
   show the d147-style delay the mechanism targets).
3. The recognition half is confirmed in the wild — keep the vw counters
   in the instrument set for any future A/B on bar-filled seeds.

## Blanks filled / documented

- FILLED: the PHASE 1 DIAG mechanism — the post-veterans window traced
  to the day: bar-fill days, door-blocker (armor, solely), veteran death
  days/causes/fights, the mantle-promotion chain, the RERUN-overtime
  clock. Timelines: evidence/2026-10-22/diag-vetwindow.json.
- FILLED: the restraint policy (scripts/policies/vetwindow.js,
  VETWINDOW=1, zero src/js) + proof (27/27 GREEN) + pilot sweep
  instrument (scripts/sweep-vetwindow-20261022.js). Unlanded (NO-GO at
  pilot) — kept on the branch for the next run's option (b)/(c).
- DOCUMENTED: (1) the armor-blocker caveat (#646: no armor verbs
  policy-side); (2) the bar-fill rarity (~12%/config) vs the pilot's
  8-seed budget; (3) the pin-drift lesson (confirm anchor 783783e9e →
  master 2a3fc56b shifted 2/4 DIAG kill lists; macro pins held 4/4);
  (4) the mantle-promotion chain as a veteran-death accelerant (finding).

## Convergence

Axis scale-onramp: the post-veterans window mechanism is now traced
(converging). The restraint lever is built and proven but untested in
the wild (pilot NO-GO, no-data). The door-blocker is armor (policy-
unreachable) — the window restraint can hold the veterans leg of the
conjunction but not fill the armor leg. Next: targeted A/B on known
bar-filling seeds (option c), then a re-budgeted pilot.
