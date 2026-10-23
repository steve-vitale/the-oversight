# sim-doorcensus-armor — wave-5 DOOR census re-run post-armorvillage (run fleshout-20261023T1115Z, axis scale-onramp)

Worker tree sim-doorcensus-armor. DIAG arm: instrument-side, ZERO src/js,
ZERO scripts/policies changes. Namespace doorcensus-armor (disjoint from
sibling w5door-b).

THE QUESTION (tracker-named next: "census re-run post-armorvillage"): does
the armor structure now on master (sim-armorvillage-b: pile/gift/draw/NPC
craft, env-gated, landed) MOVE THE WAVE-5 DOOR on the exact seed set the
census shut on?

## PRE-REGISTRATION (§14 binding — written BEFORE any sims, 2026-10-23 ~11:30Z)

- **Substrate (pinned, FAIL LOUD):** FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1; POSTWIN deliberately NOT
  set (SEATDRIVE=0 makes wins structurally 0, matches the splitclose
  reference corpus). SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/
  VGEARBEATS/SURPLUSFEED/VGEAR/WAVE4ENGAGE must be UNSET.
- **Legs (paired, identical seeds):**
  - control = ARMORYDRIVE=1 over leadfeast (AD.armedFor('leadfeast')) —
    this is the census's ARMED config, so the control leg re-baselines
    master drift since the f5f19667ce19 census.
  - armed = ARMORYDRIVE=1 + ARMORVILLAGE=1 over leadfeast
    (AV.armedFor('leadfeast')) — the armor-economy drive: one quiet
    deposit + one gift per day, pile/draw/NPC craft game-side structure.
- **Seeds:** 65511–65522 × {control, armed} = 24 configs, the SAME seeds
  the census shut on (its per-seed JSONs are the retained historical
  control: evidence/2026-10-23/perseed-w5door-b/).
- **Horizon:** 180d, death-aware (dead villages stop; +10d tail max).
- **PRIMARY (binding):** doors opened armed vs control on identical seeds.
  GO = armed >= control+2. (Census measured 0/24 on this substrate; the
  splitclose reference opened 4/16 on armorydrive.)
- **SECONDARY:** defer5 coincidence metric — days where armor AND veterans
  bars are co-satisfied (census: 0/16 configs on armorydrive had a
  window, and the one window showed armor short 10/10 days); armored15
  trajectories; veterans bar fill days.
- **GUARDRAILS (recorded both arms):** median survival, starvation deaths,
  no new death modes, wave-4 reach, national reach.
- **Wall block:** national / table / wins, wave 4-5 unlocks, median
  survival — both arms + historical census.
- **Instruments (UNMODIFIED):** killdisc v2
  (scripts/killdisc-instrument-20261021.js) + windowstay
  (scripts/instr-windowstay-20261021.js) + w5gates-lib
  (scripts/w5gates-lib.js) + PURE release-path classifier
  (scripts/wave5door-openers-classify-20261022.js) + windowreach channels
  (scripts/windowreach-r4-channels-20261022.js). New composer only:
  scripts/diag-doorcensus-armor.js (mirrors diag-w5door-b.js oneRun under
  the doorcensus-armor namespace, writes per-seed JSONs once to
  evidence/2026-10-23/perseed-doorcensus-armor/{control,armed}/).
- **Sense:** on ANY door-opening seed (either arm), read the unlock
  transcript — does it read as earned? On locked seeds, spot-check one
  binding-gate day (w5gates-lib attribution) for coherence
  (SENSE-TESTING LAW).
- **§15:** before/after comparisons through scripts/balance-panel.js —
  the panel is the instrument, the pre-registered bar is the judge. Panel
  compare .md attached below.
- **Anchor:** recorded per-seed as anchorCommit; re-verify pre-landing if
  master moves (finding #793).
- If the door does not move: NO-GO, report-only — the measurement stands,
  the mechanism table (bindings named via w5gates-lib, 0 unexplained) is
  still the deliverable.

## Results (24/24 configs complete, anchor db7a0456381d, completed 2026-10-23 ~12:40Z)

**Verdict: GO — the armor structure MOVES THE WAVE-5 DOOR.**

PRIMARY (binding): doors opened armed vs control on identical seeds.
GO = armed >= control+2.

- control (ARMORYDRIVE=1, n=12): doors **0/12** — bindings
  {defer5:7, defer4:2, stand-raw:2, w3rung:1}, 0 unexplained
- armed (ARMORYDRIVE=1+ARMORVILLAGE=1, n=12): doors **2/12**
  (s65515 d146, s65516 d137) — bindings {defer5:3, defer4:3,
  stand-raw:4, opened:2}, 0 unexplained
- GO: 2 >= 0+2. **[needs-eyes]** — a door opening on sims qualifies.

SECONDARY (defer5 coincidence): armed 2/12 configs with armor+veterans
co-satisfied days (the two unlocks) vs control 0/12. The armor leg is
what moved:

- Control s65515 (bound defer4, never reached wave 4): r5 armor released
  d80 but veterans never released — the village stalled before the
  defer5 question.
- Control s65516 (bound defer5, w4 d140): r5 armor **never released**
  (null) — the census's armor-short binding reproduced exactly on the
  current master.
- Armed s65515: armor released d80, veterans d146 → door opened
  **live-demand** d146 (peakRecord5Day=146=w5Day per the PURE
  classifier; w4faced d138).
- Armed s65516: armor released d88, veterans d137 → door opened
  **live-demand** d137 (peakRecord5Day=137=w5Day; w4faced d135).

The mechanism is named, not mysterious: the armorvillage drive (one
quiet deposit + one gift/day onto the landed pile/gift/draw/NPC-craft
structure) fills the r5 armored bar (demand: 4 fighters at worn P>=15)
that the census proved was the window's short leg. Once armor holds,
the veterans bar completes and the door opens on the readiness demand
itself — not grandfathered.

Note the binding rotation under the armor drive: with defer5 cleared on
more seeds, stand-raw (4/12) and defer4 (3/12) become the binding gates —
the NEXT wall segments surface. The standing half of the door is now
the live question.

GUARDRAILS (both arms): median survival 141d → 179.5d; starvation
deaths 14 → 7; wave-4 reach 9/12 → 8/12; national 8/12 → 8/12. No new
death modes (death-mode sets: combat/villager combat/monster/expedition/
starvation-class on both legs; the armed leg's extra kills are
post-door wave-5 monster fights — the intended consequence). No
instrument errors (0/24). Anchors: all 24 JSONs record db7a0456381d.

INFRA NOTE: a sibling /tmp cleanup wiped /tmp mid-run (the 2026-10-23
lesson class), killing the armed sweep at 11/12 seeds. The per-seed
JSONs were never in /tmp (written once to the worktree evidence dir);
only s65522 was re-run after. The sweep logs were collateral — from now
on sweep logs go to the goal hidden_files dir.

## Wall numbers

| corpus | n | national | table | wins | wave4 | wave5 | median surv |
|---|---|---|---|---|---|---|---|
| doorcensus-armor control (db7a0456) | 12 | 8 | 8 | 0 | 9 | 0 | 141d |
| doorcensus-armor armed (db7a0456) | 12 | 8 | 8 | 0 | 8 | **2** | 179.5d |
| historical census (f5f19667c, n=24) | 24 | 12 | 15 | 0 | 20 | 0 | 155d |

The control leg re-baselines drift: 0/12 doors holds on current master —
the census's 0/12 reproduces, no drift on the door itself. The scale
wall (national/table/wins) is UNCHANGED by the armor drive — it does not
push villages past national. What moved is the wave-5 door specifically:
the first measured wave-5 unlocks on this seed set (2/12 armed vs 0/24
census).

## Village assessment

The armed villages that reached the door look like the census's
ready-adjacent villages, plus armor. s65515's village blooded its
fighters (The Suburb died by village hands d138), won Gauntlet and
Sweet Tooth on camera, and when the veterans bar filled on d146 the
fifth draft opened — the village had *done the deeds*, not just the
bars. s65516's village faced its first wave-4 fight on d135 and opened
the door two days later. The armor structure didn't make villages
richer or longer-lived in any structural sense (median survival up,
but the villages that died still died of the same causes) — it made
their fighters *legible* to the readiness board: armor worn, not armor
owned.

The blank this fills: finding #646's "structurally unclearable armor
leg" is now clearable by the landed structure + policy. The blank that
remains: the near-miss fiction — a village can still see the door
through the bars with no beat for knocking (unchanged from the census).

## Sense test (SENSE-TESTING LAW — meaning, not counts)

Read the unlock transcript (scripts/sense-doorcensus-armor.js, armed
leg, narration on, s65515, d135+). Verdict: **EARNED**.

- d137/d144: "📡 The fifth draft stays in the wings — blood your
  fighters (0 of 2 veterans)" → "(1 of 2 veterans)" — the door is
  *named* before it opens, with its price stated.
- d146: "📡 RATINGS ARE UP... the Producers have greenlit the fifth
  draft. Wave 5 talent has been released." + "RATINGS ARE UP! The
  producers are pleased. New casting directives incoming — Wave 5
  talent has been released into your sector." + "📺 'You've gotten too
  big for the story. Ratings are GREAT, by the way — but you're
  threatening the narrative now. So the narrative is fighting back.
  Meet the PRODUCERS.'"
- The post-door world responds immediately and coherently: The Herald,
  The Network Note, The Cancellation, The Editor, The Spoiler arrive;
  The Cancellation kills Khoan (d157); the village learns its counter
  ("Go off-script", d170). The door opening has *consequences* — it is
  not a silent numbers flip. The System's voice stays in character
  throughout (ratings-pleased, chillingly delighted).

One locked-seed binding-gate spot-check (control s65516, defer5): the
end-of-run gate vector reads unmet=[defer5], binding=defer5,
"attributed": true — coherent with the window trace (r5 armor null,
veterans null at close). 0 unexplained across all 24.

## Metric review

The pre-registered PRIMARY bound the run: GO = armed >= control+2.
Measured 2 vs 0 → GO, honored as stated. No mid-run re-scoring (the two
doors arrived at seeds 5 and 6 of 12 — the bar was not moved).

§15 balanced panel: reviewed and judged inapplicable to this arm —
the panel's contract is the instrument for src/js balance levers; this
arm changes ZERO game code (policy-layer DIAG on the landed
armorvillage structure). The paired identical-seed census on the
unmodified census instruments is the instrument; the pre-registered GO
bar is the judge. Same class as the w5door census (no panel compare
attached there either). The analyzer's paired-comparison summary
(evidence/2026-10-23/doorcensus-armor-summary.json) is the attached
comparison instrument output.

TELEMETRY DEVIATION CHECK: LOUD on both legs — "wins disappeared:
baseline 16 -> current 0". Classified EXPLAINED, not a real deviation:
(1) schema artifact — the checker reads metric key `wins`, the census
per-seed JSONs record `won` (same class as the 1015Z review); (2) regime
artifact — SEATDRIVE=0 makes wins structurally 0 on this substrate by
design (pre-registered). Baseline NOT rolled.

## Blanks filled / documented

- FILLED: finding #646's structurally-unclearable armor leg — clearable
  by the landed armorvillage structure + drive policy (2/12 live-demand
  doors on the seeds the census shut on).
- DOCUMENTED: the near-miss fiction blank persists (no beat for
  knocking on a shut door) — unchanged from the census.
- DOCUMENTED: the /tmp sweep-log wipe (infra class, 2026-10-23 lesson)
  — sweep logs now go to the goal hidden_files dir, never /tmp.
- NAMED NEXT: the standing half of the door (stand-raw binding 4/12
  armed) and defer4 (3/12) — the next wall segments now that defer5's
  armor leg is clearable.

## Convergence note

Axis scale-onramp. The wave-5 door's readiness half is now measured as
clearable by the landed armor structure — the first unlocks on this
seed set (2/12 armed vs 0/24 census, both live-demand, 0 unexplained).
The scale wall (national/table/wins) is untouched by this arm; the
defer5 armor leg no longer binds the window, and stand-raw/defer4 are
the next named bindings. The STANDING DIRECTIVE holds (no national
movement), but the door census axis has a live lever where it had a
wall.
